# -*- coding: utf-8 -*-
"""
シナリオを本物の Web（07_開発）で動かし、ステップごとに「画面・押す場所・データの変化」を記録して、
クリックで進むビューア（HTML 1ファイル）を作る。

    python3 run.py <シナリオ.json> [--out DIR] [--app 07_開発] [--port 3300] [--base-url URL]

- 共有の DB（data/es.db）は使わない。コピーを作り、ES_DB_FILE でそのコピーを指した `next start` を立てて動かす
  （ほかのセッションのデータを壊さない）。終わったらサーバーを止める
- --base-url を渡すと、サーバーを立てずにその URL を使う（そのサーバーの DB が変わるので、ユーザーの了解があるときだけ）
- ブラウザはマシンの Google Chrome（なければ Playwright の Chromium）
- `next start` は最後に build した内容で動く。コードが変わっていたら先に build（重いのでユーザーの了解を取る）
"""
import argparse, json, os, shutil, sqlite3, subprocess, sys, time, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
STATUS_KEYS = ('status', 'state', 'stage', 'phase', 'ステータス', 'st')

# ---------------------------------------------------------------- DB
def copy_db(src, dst):
    """WAL も含めて一貫したコピーを作る（元は読み取り専用で開く）"""
    if not os.path.exists(src): return False
    s = sqlite3.connect('file:%s?mode=ro' % src, uri=True); d = sqlite3.connect(dst)
    s.backup(d); d.close(); s.close(); return True

def snapshot(db):
    """{表: {キー: 行(dict)}}。docs 表は (kind, id)、ほかは主キー（なければ rowid）"""
    c = sqlite3.connect('file:%s?mode=ro' % db, uri=True); out = {}
    for (t,) in c.execute("select name from sqlite_master where type='table' and name not like 'sqlite_%'"):
        cols = [r[1] for r in c.execute('pragma table_info("%s")' % t)]
        pk = [r[1] for r in sorted(c.execute('pragma table_info("%s")' % t), key=lambda r: r[5]) if r[5]]
        if t == 'docs': pk = ['kind', 'id']
        sel = ', '.join('"%s"' % x for x in cols)
        rows = {}
        for r in c.execute('select rowid, %s from "%s"' % (sel, t)):
            d = dict(zip(cols, r[1:]))
            key = '|'.join(str(d[k]) for k in pk) if pk else str(r[0])
            rows[key] = d
        out[t] = rows
    c.close(); return out

def parse(v):
    if isinstance(v, str) and v[:1] in '{[':
        try: return json.loads(v)
        except ValueError: return v
    return v

def status_of(d):
    for k in STATUS_KEYS:
        if isinstance(d, dict) and d.get(k) not in (None, ''): return str(d[k])
    return ''

def label_of(table, key, row):
    if table == 'docs':
        return row.get('id') or key, row.get('kind', '')
    return key.split('|')[-1], table

def diff(a, b):
    """変わった行だけ。docs の data(JSON) は中身の項目単位で比べる"""
    out = []
    for t in sorted(set(a) | set(b)):
        ra, rb = a.get(t, {}), b.get(t, {})
        for k in sorted(set(ra) | set(rb)):
            x, y = ra.get(k), rb.get(k)
            if x == y: continue
            row = y or x
            data_x = parse((x or {}).get('data')) if t == 'docs' or 'data' in row else x
            data_y = parse((y or {}).get('data')) if t == 'docs' or 'data' in row else y
            ident, kind = label_of(t, k, row)
            ch = []
            if isinstance(data_x, dict) and isinstance(data_y, dict):
                ch = sorted(f for f in set(data_x) | set(data_y) if data_x.get(f) != data_y.get(f) and f not in ('updatedAt', 'updated_at', 'seq'))
                if not ch:                                   # 中身は同じで、保存日時だけ変わった（＝保存はされた）
                    out.append({'table': t, 'kind': kind if t == 'docs' else t, 'id': label_of(t, k, row)[0], 'op': 'touch',
                                'before': status_of(data_x), 'after': status_of(data_y), 'fields': []})
                    continue
            out.append({'table': t, 'kind': kind, 'id': ident, 'op': 'insert' if x is None else ('delete' if y is None else 'update'),
                        'before': status_of(data_x) if x else '', 'after': status_of(data_y) if y else '',
                        'fields': ch[:12]})
    return out

# ---------------------------------------------------------------- サーバー
def wait_http(url, sec=120):
    t0 = time.time()
    while time.time() - t0 < sec:
        try:
            urllib.request.urlopen(url, timeout=5); return True
        except Exception:
            time.sleep(1.5)
    return False

def start_server(app, port, db, review_db, log):
    env = dict(os.environ, ES_DB_FILE=db, ES_REVIEW_DB_FILE=review_db, PORT=str(port))
    p = subprocess.Popen(['nice', '-n', '10', 'npx', 'next', 'start', '-p', str(port)], cwd=app, env=env,
                         stdout=open(log, 'w'), stderr=subprocess.STDOUT)
    if not wait_http('http://localhost:%d/' % port):
        p.terminate(); sys.exit('サーバーが起動しませんでした（ログ：%s）。先に build が必要かもしれません' % log)
    return p

# ---------------------------------------------------------------- ブラウザ
def launch(p):
    try: return p.chromium.launch(channel='chrome', headless=True)
    except Exception: return p.chromium.launch(headless=True)

def find(page, sel):
    """セレクタは Playwright の書き方（css、text=…、role=…）。リストなら最初に見つかったもの"""
    for s in (sel if isinstance(sel, list) else [sel]):
        loc = page.locator(s).first
        try:
            loc.wait_for(state='visible', timeout=5000); return loc, s
        except Exception:
            continue
    return None, None

def settle(page, ms):
    try: page.wait_for_load_state('networkidle', timeout=8000)
    except Exception: pass
    page.wait_for_timeout(ms)

def run(sc, base, db, out, W=1440, H=900):
    from playwright.sync_api import sync_playwright
    os.makedirs(os.path.join(out, 'shots'), exist_ok=True)
    res = []
    with sync_playwright() as p:
        b = launch(p); ctx = b.new_context(viewport={'width': W, 'height': H}, locale='ja-JP'); page = ctx.new_page()
        for i, st in enumerate(sc['steps']):
            r = {'i': i, 'site': st['site'], 'url': st.get('url', ''), 'cap': st['cap'], 'act': 'click' if st.get('click') else 'look',
                 'result': 'ok', 'note': '', 'box': None, 'diff': [], 'watch': st.get('watch', [])}
            try:
                if st.get('url'):
                    page.goto(base + st['url']); settle(page, st.get('wait', 600))
                for f in st.get('fill', []):
                    loc, _ = find(page, f['sel'])
                    if not loc: raise RuntimeError('入力欄が見つからない：%s' % f['sel'])
                    if f.get('select'): loc.select_option(label=f['value'])
                    else: loc.fill(str(f['value']))
                target = st.get('click') or st.get('look')
                loc, used = find(page, target) if target else (None, None)
                if target and not loc:
                    raise RuntimeError('押す場所・見る場所が見つからない：%s' % target)
                if loc:
                    loc.scroll_into_view_if_needed(); page.wait_for_timeout(200)
                    bb = loc.bounding_box()
                    if bb: r['box'] = [bb['x'] / W, bb['y'] / H, bb['width'] / W, bb['height'] / H]
                shot = 'shots/%02d.jpg' % i
                page.screenshot(path=os.path.join(out, shot), type='jpeg', quality=72); r['shot'] = shot
                before = snapshot(db) if db else None
                if st.get('click'):
                    loc.click(); settle(page, st.get('after_wait', 900))
                    for c in st.get('confirm', []):          # 確認モーダルの「〇〇する」など
                        cl, _ = find(page, c)
                        if cl: cl.click(); settle(page, 900)
                if db:
                    r['diff'] = diff(before, snapshot(db))
                if st.get('expect_change') and not [d for d in r['diff'] if d['op'] != 'touch']:
                    r['result'] = 'warn'
                    r['note'] = ['保存はされたが中身は前と同じ（期待：%s）' % st['expect_change'][0], 'Đã lưu nhưng nội dung không đổi (mong đợi: %s)' % st['expect_change'][-1]] \
                        if r['diff'] else ['データが変わらなかった（期待：%s）' % st['expect_change'][0], 'Dữ liệu không đổi (mong đợi: %s)' % st['expect_change'][-1]]
                if st.get('click') or i == len(sc['steps']) - 1:      # 押したあと（結果のモーダル・トーストも写る）
                    shot = 'shots/%02d_after.jpg' % i
                    page.screenshot(path=os.path.join(out, shot), type='jpeg', quality=72); r['shotAfter'] = shot
            except Exception as e:
                r['result'] = 'fail'; m = str(e).split('\n')[0][:200]; r['note'] = [m, m]
                try:
                    shot = 'shots/%02d.jpg' % i; page.screenshot(path=os.path.join(out, shot), type='jpeg', quality=72); r['shot'] = shot
                except Exception: pass
            mark = {'ok': '✅', 'warn': '⚠', 'fail': '❌'}[r['result']]
            print('  %s %2d %-6s %s  変化 %d 件 %s' % (mark, i + 1, st['site'], st['cap'][0][:40], len(r['diff']), r['note'][0] if r['note'] else ''))
            res.append(r)
        b.close()
    return res

def find_app(start):
    """上へたどって data/es.db と package.json があるフォルダ（07_開発）"""
    d = start
    while d != os.path.dirname(d):
        if os.path.exists(os.path.join(d, 'package.json')) and os.path.isdir(os.path.join(d, 'data')): return d
        d = os.path.dirname(d)
    return None

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('scenario'); ap.add_argument('--out'); ap.add_argument('--app'); ap.add_argument('--port', type=int, default=3300)
    ap.add_argument('--base-url'); ap.add_argument('--keep', action='store_true', help='DB のコピーとサーバーのログを残す（調べるとき）')
    a = ap.parse_args()
    sc = json.load(open(a.scenario, encoding='utf-8'))
    app = os.path.abspath(a.app) if a.app else find_app(os.path.dirname(os.path.abspath(a.scenario))) or find_app(os.getcwd())
    if not app or not os.path.exists(os.path.join(app, 'package.json')):
        sys.exit('アプリのフォルダが見つかりません（--app で 07_開発 を指定）: %s' % app)
    out = os.path.abspath(a.out or os.path.join(os.getcwd(), 'scenario_out', sc['id']))
    if os.path.exists(out): shutil.rmtree(out)
    os.makedirs(out)
    server, db = None, None
    try:
        if a.base_url:
            base = a.base_url.rstrip('/')
            print('■ 既存のサーバー %s を使います（DB の変化は記録しません）' % base)
        else:
            db = os.path.join(out, '_work', 'es.db'); os.makedirs(os.path.dirname(db))
            copy_db(os.path.join(app, 'data', 'es.db'), db)
            rv = os.path.join(out, '_work', 'review.db')
            if not copy_db(os.path.join(app, 'data', 'review.db'), rv): open(rv, 'w').close()
            print('■ DB をコピーしてサーバーを起動します（ポート %d・共有の DB は使いません）…' % a.port)
            server = start_server(app, a.port, db, rv, os.path.join(out, '_work', 'server.log'))
            base = 'http://localhost:%d' % a.port
        print('■ シナリオ %s を実行' % sc['id'])
        res = run(sc, base, db, out)
    finally:
        if server:
            server.terminate()
            try: server.wait(15)
            except Exception: server.kill()
            print('■ サーバーを止めました')
    json.dump({'scenario': sc, 'steps': res, 'when': time.strftime('%Y-%m-%d %H:%M'), 'base': base},
              open(os.path.join(out, 'result.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    sys.path.insert(0, HERE)
    import viewer
    path = viewer.build(out)
    ok = sum(1 for r in res if r['result'] == 'ok')
    print('■ %d／%d ステップ OK → %s' % (ok, len(res), path))
    if db and not a.keep: shutil.rmtree(os.path.join(out, '_work'), ignore_errors=True)

if __name__ == '__main__':
    main()
