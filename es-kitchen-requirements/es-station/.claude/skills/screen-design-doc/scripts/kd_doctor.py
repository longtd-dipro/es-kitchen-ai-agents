# -*- coding: utf-8 -*-
"""失敗をわかるようにする：①エラーを「原因と対処」に言い換える ②make.py --doctor（撮影の前に環境を数秒で確かめる）。
make.py は終わりに必ず「✔ 完了」か「✖ 失敗：…／→ 対処：…」を出す（背景で動かしても、結果の行を見ればわかる）。
"""
import os, re, sys, tempfile, traceback

def explain(e):
    """例外 -> (原因, 対処)。わからなければ (None, None)"""
    name, msg = type(e).__name__, str(e)
    low = msg.lower()
    if 'points out of the filesystem root' in msg or ('symlink' in low and 'node_modules' in low):
        return ('node_modules がシンボリックリンクで、Turbopack が止まる', '`rm node_modules && cp -al <元>/node_modules ./node_modules`（hardlink）')
    if 'ERR_CONNECTION_REFUSED' in msg or 'ECONNREFUSED' in msg or 'つながりません' in msg:
        return ('サーバーが動いていない（または別のポート）',
                '`NEXT_PUBLIC_DEMO=1 npm run dev` を背景で起動し、`curl --noproxy "*" http://localhost:3000/` が 200 になってから。別のポートなら KD_BASE=http://localhost:3001')
    if name == 'TimeoutError' and ('login' in low or 'ops-login' in low or 'lid' in low or 'username' in low):
        return ('ログイン画面が出ない（30秒待っても入力欄がない）',
                'ある原因：①サーバーが起動直後でまだ描画できない→ 30秒待って再実行 ②KD_BASE が 127.0.0.1（Next が止める）→ localhost にする ③別の dev サーバーが同じフォルダで動いている ④LOGIN の site が違う。まず `make.py --doctor` で確かめる')
    if name == 'TimeoutError':
        return ('画面が30秒たっても出ない・場所（sel）が見つからない',
                '該当の状態の `url`／`setup`／`sel` を確かめる。サーバーが重い・エラー画面になっていないか `make.py --doctor` と dev のログ（/tmp/*.log）を見る')
    if name in ('ModuleNotFoundError', 'ImportError'):
        mod = re.search(r"'([^']+)'", msg)
        return ('Python の部品が入っていない（%s）' % (mod.group(1) if mod else msg[:40]),
                '初回だけ（ユーザーの了解を取って）`pip install playwright openpyxl pillow`')
    if "executable doesn't exist" in low or 'browsertype.launch' in low or 'chrome' in low and 'not found' in low:
        return ('ブラウザ（Chrome／Chromium）を起動できない',
                'cloud は /opt/pw-browsers の Chromium を自動で使う。Mac は Google Chrome が必要。なければ `python -m playwright install chromium`、場所を指定するなら KD_CHROME=<パス>')
    if name == 'FileNotFoundError':
        return ('ファイルまたはフォルダがない：%s' % msg[-90:], 'パス・--root・--work を確かめる。データは <作業>/データ/ にあるか')
    if name == 'JSONDecodeError':
        return ('撮影のキャッシュ（cache.json）が壊れている', '`出力/.capture_cache/` を消して `--capture` からやり直す（消しても作り直せる）')
    if name == 'PermissionError':
        return ('書き込めない・開けない：%s' % msg[-80:], 'xlsx を Excel で開いたままではないか。出力先の権限を確かめる')
    if name == 'UnicodeEncodeError' or name == 'UnicodeDecodeError':
        return ('文字コードの問題', '`PYTHONUTF8=1` を付けて再実行。データ .py は UTF-8 で保存する')
    return (None, None)

def report_failure(e, work=None):
    """エラーを1画面で出し、全文はログに残す。-> ログの場所"""
    d = os.path.join(work, '出力') if work and os.path.isdir(os.path.join(work, '出力')) else tempfile.gettempdir()
    log = os.path.join(d, '.last_error.log')
    try: open(log, 'w', encoding='utf-8').write(traceback.format_exc())
    except Exception: log = '（ログを書けませんでした）'
    cause, fix = explain(e)
    first = (str(e).strip().splitlines() or [type(e).__name__])[0][:160]
    print('\n✖ 失敗：%s' % (cause or '想定していないエラー（%s）' % type(e).__name__))
    print('   内容：%s' % first)
    print('   → 対処：%s' % (fix or 'スクリプトの不具合の可能性。ログ（%s）の最後の数行を見せてください' % log))
    print('   ログ（全文）：%s' % log)

def doctor(base=None, site='ops', login_id=None, root=None):
    """撮影の前の点検（約5〜20秒）。-> 問題の数"""
    bad = 0
    oks = []
    def ok(m): oks.append(m)
    def ng(m, fix):
        nonlocal bad; bad += 1; print('  ✖ %s\n      → %s' % (m, fix))
    print('■ 点検（make.py --doctor）')
    for mod, pip in (('playwright', 'playwright'), ('openpyxl', 'openpyxl'), ('PIL', 'pillow')):
        try: __import__(mod); ok('Python：%s' % mod)
        except ImportError: ng('Python の %s がない' % mod, '`pip install %s`（ユーザーの了解を取ってから）' % pip)
    nm = os.path.join(root or os.getcwd(), 'node_modules')
    if os.path.islink(nm):
        ng('node_modules がシンボリックリンク（Turbopack が「points out of the filesystem root」で止まる）',
           '`rm node_modules && cp -al <元のフォルダ>/node_modules ./node_modules`（hardlink。一瞬で、容量も増えない）')
    try:                                         # 同じファイルを触っている他のスレッド（ブランチ）。警告だけ（問題の数には入れない）
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        import kd_ask
        mine = kd_ask.my_files()
        over = []
        for ref, date, ahead in kd_ask.branches(14):
            ov = sorted(f for f in (mine & kd_ask.changed_files(ref)) if f not in kd_ask.SHARED)
            if ov: over.append('%s（%s・%s ほか%d）' % (kd_ask.short(ref), date, os.path.basename(ov[0]), len(ov) - 1))
        if over: print('  ⚠ 同じファイルを触っている他のスレッド：%s → `kd_ask.py who` で確かめ、ユーザーに聞く' % '／'.join(over[:3]))
    except Exception:
        pass
    if bad: print('  → 問題 %d 件' % bad); return bad
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import kd_capture as K
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        try:
            b = K.launch(p); ok('ブラウザを起動できる');
        except Exception as e:
            ng('ブラウザを起動できない（%s）' % str(e).splitlines()[0][:80], explain(e)[1] or 'KD_CHROME=<Chrome のパス>')
            print('  （通ったもの：%s）' % '／'.join(oks)); return bad
        if base:
            if not K.reachable(base):
                ng('サーバーにつながらない：%s' % base, '`NEXT_PUBLIC_DEMO=1 npm run dev` を背景で起動（別のポートなら KD_BASE）。起動に1分近くかかることがある')
            else:
                ok('サーバーにつながる：%s' % base)
                if re.match(r'^https?://127\.0\.0\.1', base):
                    ng('127.0.0.1 は Next が止めてログイン画面が出ない', 'KD_BASE=http://localhost:<ポート> にする')
                try:
                    import types
                    L = K.LOGIN_FORMS.get(site)
                    pg = b.new_page(); pg.goto(base + L['path'], timeout=30000); pg.wait_for_selector(L['id'], timeout=20000)
                    ok('ログイン画面が出る（%s）' % site)
                    if login_id:
                        K.track(pg); K.login(pg, base, types.SimpleNamespace(LOGIN={'site': site, 'loginId': login_id}, SITE=site)); ok('ログインできる（%s）' % login_id)
                except Exception as e:
                    ng('ログインまで進めない（%s）' % type(e).__name__, (explain(e)[1] or '') + ' サーバーが起動直後なら30秒待つ')
        try:
            import fcntl
            if base:
                key = re.sub(r'[^A-Za-z0-9]+', '_', re.sub(r'^https?://', '', base))
                f = open(os.path.join(tempfile.gettempdir(), 'kd_capture_%s.lock' % key), 'w')
                try: fcntl.flock(f, fcntl.LOCK_EX | fcntl.LOCK_NB); fcntl.flock(f, fcntl.LOCK_UN); ok('ほかの撮影は動いていない')
                except OSError: ng('ほかの撮影が同じサーバーを使っている（撮影は順番待ちになる）', '終わるのを待つか、別のフォルダ・ポートで KD_BASE を指定する')
        except ImportError:
            pass
        b.close()
    if bad:
        print('  （通ったもの：%s）' % '／'.join(oks)); print('  → 問題 %d 件' % bad)
    else:
        print('  ✔ 問題なし（%s）' % '・'.join(oks))
    return bad
