# -*- coding: utf-8 -*-
"""デモを開き、状態ごとに ①番号の場所の確認 ②デモの入力欄の読み取り ③番号付き画像 を作る（make.py から呼ぶ）

元にするものは2つのどちらか：
  - デモ（HTML 1ファイル）：DEMO_FILE がファイルの場所。状態は setup（JavaScript）で作る
  - 本物の Web（開発中のコード。例 http://localhost:3000）：DEMO_FILE が URL。状態ごとに url（例 /ops/masters/plans）を書き、
    LOGIN（loginId）で先にログインする。HTML ビューアには、その状態の画面を静止した HTML（スナップショット）として入れる
"""
import contextlib, hashlib, json, os, re, tempfile, time
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))

def is_url(s):
    return bool(re.match(r'^https?://', s or ''))

# サイトごとのログイン画面（本物の Web のとき）。パスワードはいま何でもよい（開発中：空でなければ通る）
LOGIN_FORMS = {
    'ops':       {'path': '/ops',            'id': '#ops-login-id', 'pw': '#ops-login-pw', 'btn': 'button[type=submit]'},
    'warehouse': {'path': '/ops',            'id': '#ops-login-id', 'pw': '#ops-login-pw', 'btn': 'button[type=submit]'},
    'corp':      {'path': '/corp/login',     'id': 'input[autocomplete=username]', 'pw': 'input[autocomplete=current-password]', 'btn': 'button[type=submit]'},
    'carrier':   {'path': '/carrier/login',  'id': '#lid', 'pw': '#lpw', 'btn': 'button[type=submit]'},
    'driver':    {'path': '/driver/login',   'id': '#lid', 'pw': '#lpw', 'btn': 'button[type=submit]'},
    'supplier':  {'path': '/supplier/login', 'id': 'input[autocomplete=username]', 'pw': 'input[autocomplete=current-password]', 'btn': 'button.btn.pri'},
}

def reachable(base):
    """本物の Web が動いているか（make.py が開く前に確かめる）"""
    import urllib.request
    try:
        urllib.request.urlopen(base, timeout=10).read(1)
        return True
    except Exception as e:
        return getattr(e, 'code', None) is not None   # HTTP のエラー（404 など）はつながってはいる

def login(pg, base, D, login_id=None):
    """本物の Web にログインする（D.LOGIN = {"site": ..., "loginId": ..., "password": ...}。site の省略時は D.SITE。
    login_id を渡すとその ID でログインし直す（状態ごとの "login"）"""
    L = dict(getattr(D, 'LOGIN', None) or {})
    if login_id: L['loginId'] = login_id
    if not L.get('loginId'):
        return
    site = L.get('site') or D.SITE
    F = LOGIN_FORMS.get(site)
    if not F:
        raise SystemExit('LOGIN：site %s のログイン画面を知らない（kd_capture.LOGIN_FORMS に足す）' % site)
    pg.goto(base + F['path']); pg.wait_for_selector(F['id'], timeout=30000)
    pg.fill(F['id'], L['loginId']); pg.fill(F['pw'], L.get('password') or 'password')
    pg.click(F['btn'])
    pg.wait_for_selector(F['id'], state='detached', timeout=30000)
    settle(pg)

def reset_data(pg, base):
    """デモのデータを見本に戻す（/api/dev/reset）。日付を先に進めると日次バッチが動いて元に戻らないので、機能の撮影の始めと、日付を戻すときに呼ぶ"""
    r = pg.request.post(base + '/api/dev/reset')
    if not r.ok:
        print('  （データリセットできない %s。そのまま撮る）' % r.status)

def set_today(pg, base, date):
    """デモの「今日」を変える（状態ごとの "today"＝'YYYY/MM/DD'。'' で .env の日付に戻す＋データリセット。デモのビルドだけ）"""
    if not date: reset_data(pg, base)
    r = pg.request.post(base + '/api/demo/today', data={'date': date or ''})
    if not r.ok:
        raise SystemExit('today：デモの日付を変えられない（%s）。npm run dev がデモのビルド（NEXT_PUBLIC_DEMO=1）か確かめる' % r.status)

IDLE_MS = int(os.environ.get('KD_IDLE_MS', '3000'))   # 落ち着くのを待つ上限

MUT_JS = """() => { if (!window.__kdm) { window.__kdm = {n: 1}; new MutationObserver(m => { window.__kdm.n += m.length; }).observe(document, {subtree: true, childList: true, attributes: true, characterData: true}); }
  const n = window.__kdm.n; window.__kdm.n = 0; return n; }"""

def track(pg):
    """通信中の数を数える（settle が使う）。ページを作ったら1回呼ぶ"""
    st = {'n': 0}
    dec = lambda r: st.__setitem__('n', max(0, st['n'] - 1))
    pg.on('request', lambda r: st.__setitem__('n', st['n'] + 1))
    pg.on('requestfinished', dec); pg.on('requestfailed', dec)
    pg._kd_inflight = st

class DbWatch:
    """デモのデータ（<root>/data/*.db の SQLite）が変わったかを見る。撮り直さない状態をやり直す（replay）かの判断に使う。
    API の名前では決められない（このアプリは読むだけの API も POST）ので、データベースの変更回数（PRAGMA data_version）を直接見る。
    確かめた：画面を開くだけでは変わらず、データを変える操作・/api/dev/reset では変わる。
    データベースが見えない（別のマシンのサーバーなど）ときは available=False → 安全側で、やり直す"""
    def __init__(self, root):
        import sqlite3
        self.cons = []
        for name in ('es.db', 'review.db'):
            path = os.path.join(root or '.', 'data', name)
            if os.path.exists(path):
                try:
                    c = sqlite3.connect('file:%s?mode=ro' % path, uri=True, timeout=5)
                    self.cons.append([c, c.execute('PRAGMA data_version').fetchone()[0]])
                except Exception: pass
        self.available = bool(self.cons)

    def changed(self):
        """前に呼んでから変わったか（呼ぶたびに基準を更新する）"""
        ch = False
        for x in self.cons:
            try: v = x[0].execute('PRAGMA data_version').fetchone()[0]
            except Exception: return True
            if v != x[1]: ch = True; x[1] = v
        return ch

    def close(self):
        for x in self.cons:
            try: x[0].close()
            except Exception: pass

def settle(pg, ms=100):
    """通信が止まり、画面の変化が止まる（約150ms）まで待つ。Playwright の networkidle（500ms 静か）より速い。上限は IDLE_MS"""
    st = getattr(pg, '_kd_inflight', None)
    end, quiet = time.time() + IDLE_MS / 1000.0, 0
    while time.time() < end:
        try: mut = pg.evaluate(MUT_JS)
        except Exception: mut = 1
        if (st and st['n'] > 0) or mut: quiet = 0
        else: quiet += 1
        if quiet >= 3: break
        pg.wait_for_timeout(50)
    if ms: pg.wait_for_timeout(ms)

# 今の画面を静止した HTML にする（CSS を中に入れ、script を外し、入力欄の今の値を属性に写す）
SNAPSHOT_JS = """async () => {
  const live = Array.from(document.querySelectorAll('input, textarea, select'));
  const doc = document.documentElement.cloneNode(true);
  const cl = Array.from(doc.querySelectorAll('input, textarea, select'));
  live.forEach((e, i) => {
    const c = cl[i]; if (!c) return;
    if (e.tagName === 'TEXTAREA') c.textContent = e.value;
    else if (e.tagName === 'SELECT') Array.from(c.options).forEach((o, j) => { if (j === e.selectedIndex) o.setAttribute('selected', ''); else o.removeAttribute('selected'); });
    else if (e.type === 'checkbox' || e.type === 'radio') { if (e.checked) c.setAttribute('checked', ''); else c.removeAttribute('checked'); }
    else c.setAttribute('value', e.value);
  });
  doc.querySelectorAll('script, #__kd_layer, link[rel=preload], link[rel=modulepreload], link[rel=prefetch]').forEach(e => e.remove());
  for (const l of Array.from(doc.querySelectorAll('link[rel=stylesheet]'))) {
    try { const css = await (await fetch(l.href)).text(); const s = document.createElement('style'); s.textContent = css; l.replaceWith(s); }
    catch (e) { l.remove(); }
  }
  doc.querySelectorAll('img[src]').forEach(i => i.setAttribute('src', i.src));
  doc.querySelectorAll('a[href]').forEach(a => a.removeAttribute('href'));
  return '<!DOCTYPE html>' + doc.outerHTML;
}"""

FIELD_DEFS = """(ids) => {
  const out = {};
  ids.forEach(id => {
    const w = document.getElementById('w_' + id), el = document.getElementById(id);
    if (!w || !el) return;
    const fl = w.querySelector('.fl, label'); let label = fl ? fl.textContent : '';
    const req = /必須/.test(label);
    label = label.replace('必須', '').replace('?', '').trim();
    out[id] = {label: label, req: req ? 'true' : 'false', type: el.tagName.toLowerCase() + (el.type ? ':' + el.type : ''),
               opts: el.tagName === 'SELECT' ? Array.from(el.options).map(o => o.text) : [],
               maxlength: el.maxLength > 0 ? el.maxLength : null};
  });
  return out;
}"""


# 表示の確認（役割レビューの D 系。kd_review.py）：入力欄が最大文字数ぶん見えるか・文字が切れていないか・位置・見た目。item ごとに数字だけ返す
MEASURE_JS = """(args) => {
  const items = args[0];
  const cv = document.createElement('canvas').getContext('2d');
  const wid = (font, s) => { cv.font = font; return cv.measureText(s).width; };
  const px = v => parseFloat(v) || 0;
  const out = {};
  items.forEach(it => {
    const el = window.__KD.find(it.sel); if (!el) return;
    const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
    const o = {x: Math.round(r.left + scrollX), y: Math.round(r.top + scrollY), w: Math.round(r.width), h: Math.round(r.height)};
    const tag = el.tagName.toLowerCase(), type = el.type || '', font = cs.font || (cs.fontSize + ' ' + cs.fontFamily);
    const innerW = el.clientWidth - px(cs.paddingLeft) - px(cs.paddingRight);
    if (tag === 'input' && !['checkbox', 'radio', 'button', 'submit', 'file', 'range', 'color'].includes(type) || tag === 'textarea') {
      o.type = type || tag; o.max = el.maxLength > 0 ? el.maxLength : null;
      o.capF = Math.floor(innerW / wid(font, 'あ')); o.capH = Math.floor(innerW / wid(font, '0'));
      if (tag === 'textarea') { const lh = px(cs.lineHeight) || px(cs.fontSize) * 1.4; o.lines = Math.max(1, Math.floor((el.clientHeight - px(cs.paddingTop) - px(cs.paddingBottom)) / lh)); }
    } else if (tag === 'select') {
      const inner = innerW - 24; let lg = 0, tx = '';
      Array.from(el.options).forEach(op => { const w = wid(font, op.text); if (w > lg) { lg = w; tx = op.text; } });
      if (lg > inner) { o.selOver = Math.round(lg - inner); o.selTxt = tx.slice(0, 24); }
    } else {
      if (el.scrollWidth - el.clientWidth > 1 && cs.overflowX !== 'visible') o.clipX = 1;
      if (cs.textOverflow === 'ellipsis' && el.scrollWidth - el.clientWidth > 1) o.ellip = 1;
      if (el.scrollHeight - el.clientHeight > 1 && cs.overflowY !== 'visible') o.clipY = 1;
      if (['area', 'table', 'modal', 'card'].includes(it.kind)) {
        let n = 0; const ex = [];
        Array.from(el.querySelectorAll('td,th,a,span,div,p,label,button,li')).slice(0, 600).forEach(k => {
          const c = getComputedStyle(k);
          if (k.scrollWidth - k.clientWidth > 1 && c.overflowX !== 'visible') { n++; if (ex.length < 3) ex.push((k.textContent || '').trim().slice(0, 14)); }
        });
        if (n) { o.clipKids = n; o.clipEx = ex; }
      }
    }
    o.bg = cs.backgroundColor; o.col = cs.color; o.bd = cs.borderTopWidth + ' ' + cs.borderTopColor; o.fs = Math.round(px(cs.fontSize)); o.fw = cs.fontWeight;
    out[it.no] = o;
  });
  return {items: out, sw: document.documentElement.scrollWidth};
}"""

def find_chromium():
    """入っている Chromium を探す（Playwright の版と Chromium の版が合わないときのため。cloud 用）"""
    import glob
    cands = [os.environ.get('KD_CHROME', ''), '/opt/pw-browsers/chromium']
    for d in (os.environ.get('PLAYWRIGHT_BROWSERS_PATH', ''), os.path.expanduser('~/.cache/ms-playwright')):
        if d: cands += sorted(glob.glob(os.path.join(d, 'chromium-*', 'chrome-linux', 'chrome')), reverse=True)
    for c in cands:
        if c and os.path.isfile(c) and os.access(c, os.X_OK): return c
    return None

def launch(p):
    """マシンに入っている Google Chrome を使う（Chromium を別に入れなくてよい）。なければ Playwright の Chromium、それもなければ入っている Chromium を探す"""
    try:
        return p.chromium.launch(channel='chrome', headless=True)
    except Exception:
        pass
    try:
        return p.chromium.launch(headless=True)
    except Exception:
        exe = find_chromium()
        if not exe: raise
        return p.chromium.launch(headless=True, executable_path=exe)

def static_css(D, hide):
    # nextjs-portal＝Next.js の開発用の印（画面の左下の N）。本物の Web のときは必ず隠す
    sel = ','.join(list(getattr(D, 'HIDE_ALWAYS', [])) + list(hide) + (['nextjs-portal'] if is_url(getattr(D, 'DEMO_FILE', '')) else []))
    return ((sel + '{display:none!important}' if sel else '') +
            getattr(D, 'STATIC_CSS', '.gnav{position:static!important}#foot{position:relative!important}') +
            '*{transition:none!important;animation:none!important}')

# ---------------------------------------------------------------- キャッシュ（変わっていない状態は撮り直さない）
def _h(*parts):
    m = hashlib.sha256()
    for p in parts: m.update(str(p).encode('utf-8')); m.update(b'\0')
    return m.hexdigest()[:16]

def code_signature(D, root, demo):
    """元にするものの「版」。デモは HTML の中身、本物の Web は D.CODE_PATHS（なければ app・lib・components）の更新時刻と大きさ。
    機能のコードだけに絞る（例 ["app/ops/masters/plans", "lib/domain/seed"]）と、他の機能を直しても撮り直さない"""
    if not is_url(demo):
        return _h(open(demo, 'rb').read().hex() if os.path.exists(demo) else '')
    paths = getattr(D, 'CODE_PATHS', None) or ['app', 'lib', 'components']
    m = hashlib.sha256()
    for rel in paths:
        base = os.path.join(root or '.', rel)
        if os.path.isfile(base): walk = [(os.path.dirname(base), [], [os.path.basename(base)])]
        else: walk = os.walk(base)
        for dp, dn, fn in walk:
            dn[:] = sorted(d for d in dn if d not in ('node_modules', '.next'))
            for f in sorted(fn):
                fp = os.path.join(dp, f)
                try: st = os.stat(fp)
                except OSError: continue
                m.update(('%s|%d|%d;' % (os.path.relpath(fp, root or '.'), st.st_mtime_ns, st.st_size)).encode('utf-8'))
    return m.hexdigest()[:16]

def _view_key(v, chain):
    items = [(i['no'], i['sel'], i['kind'], i['ja'], i.get('fid', ''), i.get('req', '')) for i in v['items']]
    return _h(json.dumps(items, ensure_ascii=False), v.get('full'), json.dumps(v.get('hide', [])), v.get('wait', ''), chain)

def _chain_step(chain, v):
    """状態の作り方（url・setup・login・today）。これが変わると後ろの状態も撮り直す（データや日付が変わるため）"""
    return _h(chain, v.get('url', ''), v.get('setup', ''), v.get('login', ''), v.get('today', ''))

def plan(D, out, sig, only=None, snapshot=True):
    """どの状態を撮り直すか。(dirty ids, 前の撮影の記録)"""
    cp = os.path.join(out, 'cache.json')
    try: cache = json.load(open(cp, encoding='utf-8'))
    except Exception: cache = {}
    if cache.get('sig') != sig: cache = {'sig': sig, 'views': {}}
    web = is_url(getattr(D, 'DEMO_FILE', ''))
    chain, dirty = '', []
    for v in D.VIEWS:
        chain = _chain_step(chain, v)
        e = cache['views'].get(v['id'])
        png = os.path.join(out, 'img', '%s_%s.png' % (D.IMG_PREFIX, v['id']))
        fresh = bool(e) and 'layout' in e.get('rep', {}) and os.path.exists(png) and (not (web and snapshot) or (e.get('rep', {}).get('snapshot') and os.path.exists(e['rep']['snapshot'])))
        if only is not None:
            if v['id'] in only or not e or not os.path.exists(png): dirty.append(v['id'])
        elif not fresh or e.get('key') != _view_key(v, chain):
            dirty.append(v['id'])
    return dirty, cache


@contextlib.contextmanager
def server_lock(base):
    """同じサーバー（URL）を使う撮影は1つずつにする。撮影は /api/dev/reset でデータを見本に戻し、日付も変えるので、
    2つが同時に走ると互いのデータを消して、違う画像になる。別の撮影が終わるまで待つ（上限 KD_LOCK_TIMEOUT 秒。既定 900）。
    サーバーを別にすれば（KD_BASE=http://localhost:3001）待たずに並べて撮れる"""
    try:
        import fcntl
    except ImportError:                      # Windows：ロックなし
        yield; return
    key = re.sub(r'[^A-Za-z0-9]+', '_', re.sub(r'^https?://', '', base or 'demo'))
    path = os.path.join(tempfile.gettempdir(), 'kd_capture_%s.lock' % key)
    f = open(path, 'w')
    limit, t0, shown = float(os.environ.get('KD_LOCK_TIMEOUT', '900')), time.time(), False
    while True:
        try:
            fcntl.flock(f, fcntl.LOCK_EX | fcntl.LOCK_NB); break
        except OSError:
            if not shown:
                print('  別の撮影が同じサーバー（%s）を使っています。終わるまで待ちます…（別の画面設計書の作業が動いていないか確かめる。別のサーバーなら KD_BASE=http://localhost:3001）' % base, flush=True); shown = True
            if time.time() - t0 > limit:
                raise SystemExit('別の撮影が %d 秒たっても終わりません（ロック：%s）。止まっているなら、そのプロセスを止めてからやり直す' % (limit, path))
            time.sleep(1)
    try:
        yield
    finally:
        fcntl.flock(f, fcntl.LOCK_UN); f.close()

def run(D, demo, out, width=1440, height=900, only=None, snapshot=True, root=None, force=False):
    """状態ごとに撮る。変わっていない状態は out/cache.json の記録を使い、撮らない（force=True で全部撮り直す）。
    only＝撮り直す状態の id のリスト（それ以外は前の撮影をそのまま使う）。snapshot＝本物の Web の静止 HTML も作る（--capture では不要）"""
    os.makedirs(os.path.join(out, 'img'), exist_ok=True)
    web = is_url(demo)                       # 本物の Web（URL）か、デモ（HTML ファイル）か
    sig = _h(code_signature(D, root, demo), width, height, open(os.path.join(HERE, 'overlay.js'), encoding='utf-8').read(),
             open(os.path.abspath(__file__), encoding='utf-8').read(), json.dumps(getattr(D, 'HIDE_ALWAYS', [])), getattr(D, 'STATIC_CSS', ''))
    dirty, cache = plan(D, out, sig, only=only, snapshot=snapshot)
    if force: dirty = list(only) if only else [v['id'] for v in D.VIEWS]      # --force だけなら全部、--views と一緒ならその状態だけ
    report = {'views': {}, 'fields': {}}
    if dirty:
        with server_lock(demo.rstrip('/') if web else None):
            _capture(D, demo, out, width, height, dirty, cache, web, snapshot, root)
    else:
        print('  （全部の状態が前の撮影のまま。撮り直さない）')
    chain, reused, miss_old = '', 0, []
    for v in D.VIEWS:
        chain = _chain_step(chain, v)
        e = cache['views'].get(v['id'])
        if not e: continue
        report['views'][v['id']] = e['rep']; report['fields'].update(e['fields'])
        if v['id'] not in dirty:
            reused += 1
            if e['rep'].get('missing'): miss_old.append('%s:%s' % (v['id'], ','.join(map(str, e['rep']['missing']))))
    if reused:
        print('  前の撮影のまま %d 状態%s' % (reused, ('（見つからない番号：%s）' % ' '.join(miss_old)) if miss_old else ''))
    json.dump(cache, open(os.path.join(out, 'cache.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    json.dump(report, open(os.path.join(out, 'capture_report.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    return report

def _capture(D, demo, out, width, height, dirty, cache, web, snapshot, root=None):
    overlay = open(os.path.join(HERE, 'overlay.js'), encoding='utf-8').read()
    base = demo.rstrip('/') if web else None
    if web and not reachable(base):
        raise SystemExit('本物の Web につながりません: %s（npm run dev か next start で動かしてから）' % demo)
    last = max(i for i, v in enumerate(D.VIEWS) if v['id'] in dirty)
    t_start, n_done, replayed = time.time(), 0, []
    watch = DbWatch(root) if web else None
    print('  %d 状態を撮ります（目安 %d 秒。変わっていない状態は撮りません）' % (len(dirty), len(dirty) * 3), flush=True)
    with sync_playwright() as p:
        b = launch(p)
        pg = None
        cur_login, cur_today = None, ''
        if web:                              # ログインは1回。同じタブで画面を移る（sessionStorage を保つ）
            pg = b.new_page(viewport={'width': width, 'height': height}, device_scale_factor=1); track(pg)
            login(pg, base, D); cur_login = (getattr(D, 'LOGIN', None) or {}).get('loginId')
            if getattr(D, 'RESET_FIRST', True): reset_data(pg, base)   # 前の機能の撮影で変えたデータ（登録・報告）を見本に戻す
        chain = ''
        for idx, v in enumerate(D.VIEWS):
            chain = _chain_step(chain, v)
            if idx > last: break
            is_dirty = v['id'] in dirty
            _t0 = time.time(); _ph = {}
            def _mark(name):
                nonlocal _t0
                _ph[name] = _ph.get(name, 0) + time.time() - _t0; _t0 = time.time()
            # 撮り直さない状態でも、あとの状態の前提（データを変える操作）になるものは、撮らずに操作だけやり直す
            if not is_dirty:
                # 撮り直さない状態をやり直すのは、前の撮影で「データを変えた」と記録された状態だけ（あとの状態がその結果を見るため）。
                # 見るだけの状態（モーダルを開く・タブを切り替える）はやり直さない。login／today は、撮る状態が自分で切り替える
                prev = cache['views'].get(v['id'], {}).get('rep', {})
                if not web or not v.get('setup') or prev.get('mutates') is False or os.environ.get('KD_REPLAY') == 'none':
                    continue
                replayed.append(v['id'])
            replay = not is_dirty
            if web:
                want = v.get('login') or (getattr(D, 'LOGIN', None) or {}).get('loginId')   # 状態ごとに別のアカウント（法人／拠点）
                if want and want != cur_login:
                    pg.goto(base + '/'); pg.evaluate("() => { try { sessionStorage.clear(); localStorage.clear(); } catch (e) {} }"); pg.context.clear_cookies()   # ログインの印は localStorage（lib/api/keepLogin.ts）と Cookie にもある
                    login(pg, base, D, want); cur_login = want
                if (v.get('today') or '') != cur_today:                                   # 状態ごとにデモの「今日」
                    set_today(pg, base, v.get('today') or ''); cur_today = v.get('today') or ''
                if watch.available: watch.changed()          # ここを基準に、この状態が本物のデータを変えたかを見る（ログイン・日付の切り替えのあと）
                pg.goto(base + (v.get('url') or '/')); _mark('goto')
                settle(pg, 100); _mark('settle1')
            else:
                pg = b.new_page(viewport={'width': width, 'height': height}, device_scale_factor=1)
                pg.goto('file://' + os.path.abspath(demo)); pg.wait_for_timeout(300)
            if v.get('setup'):
                pg.evaluate("async () => { " + v['setup'] + " }"); _mark('setup')
                if 'wait' in v: pg.wait_for_timeout(v['wait'])        # 状態ごとに待ちを指定したときだけ固定で待つ
                elif web: settle(pg, 50)
                else: pg.wait_for_timeout(300)
                _mark('settle2')
            view_mut = (watch.changed() if watch.available else True) if web else False      # データが見えないときは、安全側で「変えた」
            if replay:
                if not web: pg.close()
                continue
            rep = {'mutates': view_mut}
            _mark('pre')
            if web and snapshot and os.environ.get('KD_SNAPSHOT', '1') != '0':
                html = pg.evaluate(SNAPSHOT_JS)
                html = html.replace('</head>', '<style>' + static_css(D, v.get('hide', [])) + '</style></head>', 1)
                snap = os.path.join(out, 'img', '%s_%s.html' % (D.IMG_PREFIX, v['id']))
                open(snap, 'w', encoding='utf-8').write(html)
                rep['snapshot'] = snap; _mark('snapshot')
            pg.add_style_tag(content=static_css(D, v.get('hide', [])))
            pg.evaluate("() => window.scrollTo(0,0)")
            # 最初の番号の場所が出るまで待つ（固定の待ちの代わり。ふつうの CSS セレクタのときだけ）
            first_sel = next((i['sel'] for i in v['items'] if i['sel'] != '-'), '')
            if first_sel and '::' not in first_sel and not first_sel.endswith('^'):
                try: pg.wait_for_selector(first_sel, timeout=3000)
                except Exception: pass
            _mark('css+wait_sel'); pg.add_script_tag(content=overlay)
            # sel が "-" の項目は画面にない（定義だけ：CSV の列など）。番号を置かず、見つからない扱いにもしない
            items = [{'no': i['no'], 'sel': i['sel'], 'kind': i['kind'], 'ja': i['ja']} for i in v['items'] if i['sel'] != '-']
            res = pg.evaluate("(items) => __KD.set(items)", items)
            missing = [r['no'] for r in res if not r['found']]
            lay = pg.evaluate(MEASURE_JS, [items])
            rep.update({'missing': missing, 'count': len(items), 'url': v.get('url', ''),
                        'layout': lay['items'], 'sw': lay['sw'], 'vw': width, 'vh': height})
            defs = pg.evaluate(FIELD_DEFS, [i['fid'] for i in v['items'] if i.get('fid')])
            fields = {}
            for it in v['items']:
                if it.get('fid') and it['fid'] in defs:
                    fields[v['id'] + ':' + it['no']] = {'fid': it['fid'], 'demo': defs[it['fid']], 'ja': it['ja'], 'req': it.get('req', '')}
            pg.wait_for_timeout(50)
            pg.screenshot(path=os.path.join(out, 'img', '%s_%s.png' % (D.IMG_PREFIX, v['id'])), full_page=bool(v.get('full')))
            cache['views'][v['id']] = {'key': _view_key(v, chain), 'rep': rep, 'fields': fields}
            _mark('shot')
            n_done += 1; el = time.time() - t_start
            # 進み具合は 5状態ごと・最後・見つからない番号があるときだけ出す（毎回出すと読む側の token も増える。KD_PROGRESS_EVERY=1 で毎回）
            if n_done % int(os.environ.get('KD_PROGRESS_EVERY', '5')) == 0 or n_done == len(dirty) or missing:
                print('  [%d/%d] %-6s 項目 %3d  見つからない %s  （%d 秒経過・残り約 %d 秒）%s' % (
                    n_done, len(dirty), v['id'], len(items), missing or 'なし', el, el / n_done * (len(dirty) - n_done),
                    ('  ' + ' '.join('%s=%.1f' % kv for kv in _ph.items())) if os.environ.get('KD_TIME') else ''), flush=True)
            if web: pg.evaluate("() => { const l = document.getElementById('__kd_layer'); if (l) l.remove(); }")
            else: pg.close()
        if web and cur_today: set_today(pg, base, '')
        b.close()
    if watch: watch.close()
    if replayed: print('  前の状態の操作をやり直した：%s（データを変えた状態だけ。やり直さないなら --no-replay）' % ' '.join(replayed), flush=True)
