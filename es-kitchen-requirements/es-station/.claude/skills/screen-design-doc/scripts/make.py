# -*- coding: utf-8 -*-
"""
画面設計書（Excel 日本語版・ベトナム語版、HTML）と、メッセージ・メールのまとめを作る。

使い方（作業フォルダ＝「データ/」と「出力/」を置くフォルダ）:
    python3 make.py --check   <作業>/データ/AW_PLAN_プランマスタ.py     # データの確認だけ（ブラウザ不要・最初に必ず）
    python3 make.py --capture <作業>/データ/AW_PLAN_プランマスタ.py     # デモを開いて番号の場所とデモとの差だけ確認
    python3 make.py           <作業>/データ/AW_PLAN_プランマスタ.py     # 作る（1機能＝1ブック）
    python3 make.py --book 運営管理者Web <作業>/データ/AW_*.py          # 複数の機能を1ブックに（1機能＝1シート）
    python3 make.py --common  --work <作業>                              # メッセージ・メールのまとめだけ

オプション:
    --work DIR   作業フォルダ（省略時はデータファイルの1つ上）。<作業>/データ/_共通_メッセージ.py・_共通パターン.py を使う
    --root DIR   プロジェクトのフォルダ（DEMO_FILE・Message List の場所の基準。省略時は 02_デモ を含む上位フォルダ）
                 DEMO_FILE が URL（本物の Web。例 http://localhost:3000）のときは、そのサーバーを先に動かしておく
    --out DIR    出力先（省略時は <作業>/出力/<OUT_DIR か --book の名前>）。Google ドライブの同期フォルダも指定できる
    --only excel|html
    --views 003,007  撮り直す状態の id（--capture／作成のとき。それ以外は前の撮影をそのまま使う）
    --width 390 --height 844  撮影の画面の大きさ（既定 1440×900）。データに VIEWPORT = (390, 844) と書けば毎回指定しなくてよい（スマホのアプリ）
    --force      キャッシュを使わず全部撮り直す
    --no-replay  撮り直さない状態の操作（登録など、データを変えたもの）をやり直さない。--views で速く撮るとき。あとの状態が前の結果を見るなら使わない
    KD_BASE=http://localhost:3001  別のサーバーで撮る（複数の作業を同時に動かすとき、サーバーを分ければ待たない。同じサーバーなら撮影は順番待ち）
    --doctor     撮影の前の点検（部品・ブラウザ・サーバー・ログイン・ほかの撮影）。約5〜20秒。失敗は「原因と対処」で出る
    --display-only  --review のとき、表示の確認（D1〜D9）だけ出す（撮影のあと用）
    --review     役割レビュー（BA・QC・UI/UX）の機械で確かめられる分だけ出す（ブラウザ不要）。--all で省略しない
    --draft      未確認（chk・diff・デモとの差）が残っていても作る。表紙と各シートに「ドラフト」と出る。お客様・開発に渡すものには使わない

初回だけ:  pip install playwright openpyxl pillow（ブラウザはマシンの Google Chrome を使う）
"""
import argparse, copy, glob, importlib.util, json, os, re, shutil, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import kd_rules as R

def load(path):
    name = 'kd_' + os.path.abspath(path).encode('utf-8').hex()[-24:]
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
    return mod

def load_data(path):
    D = load(path)
    for k, v in (('HIDE_ALWAYS', []), ('OUT_DIR', getattr(D, 'BASENAME', '')), ('AUTHOR', ''), ('CREATED', ''),
                 ('DECISIONS', []), ('REVISIONS', []), ('CHANGES', []), ('SITE', ''), ('SHEET', None), ('SHEETS', [])):
        if not hasattr(D, k): setattr(D, k, v)
    return D

def find_root(start):
    """プロジェクトのフォルダ：02_デモ があるか、開発リポジトリ（docs/05_画面設計書 がある）の上位"""
    d = os.path.abspath(start)
    while d != os.path.dirname(d):
        if os.path.isdir(os.path.join(d, '02_デモ')) or os.path.isdir(os.path.join(d, 'docs', '05_画面設計書')): return d
        d = os.path.dirname(d)
    return None

def attach_messages(D, C):
    """この画面で使うメッセージ・メールだけを、画面のサイトに合った文言（法人向け／社内向け）で渡す"""
    tone = R.tone_of(D.SITE)
    ids = R.used_ids(D)
    D.MESSAGES, D.MAILS = {}, {}
    for k in sorted(ids):
        if k in C.MESSAGES:
            m = copy.deepcopy(C.MESSAGES[k])
            m['ja'] = R.msg_ja(m, tone)
            D.MESSAGES[k] = m
        elif k in C.MAILS:
            D.MAILS[k] = copy.deepcopy(C.MAILS[k])

# ---------------------------------------------------------------- 版（開発に渡すたびに1つ）
SNAP_KEYS = ('ja', 'vi', 'kind', 'req', 'len', 'init', 'ex', 'detail', 'cond', 'valid', 'err', 'pattern', 'open', 'trig')

def snap(D):
    return {'%s:%s' % (v['id'], it['no']): {k: it.get(k) for k in SNAP_KEYS if it.get(k) is not None}
            for v in D.VIEWS for it in v['items']}

def ver_key(v):
    return tuple(int(x) for x in re.findall(r'\d+', v))

def release_check(datas, out, ver):
    """前回渡した版と比べ、変わった項目がすべて CHANGES（この版）に書かれているか確かめる"""
    path = os.path.join(out, '_release', 'snapshot.json')
    prev = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else None
    if prev and ver_key(ver) <= ver_key(prev['ver']):
        sys.exit('版 %s は前回の版 %s より大きくしてください' % (ver, prev['ver']))
    if not prev and ver_key(ver)[:1] < (1,):
        sys.exit('開発に渡す最初の版は 1.0（0.x は下見。--release なしで作る）')
    missing = []
    for D in datas:
        chs = [c for c in D.CHANGES if c.get('ver') == ver]
        nos = set()
        for c in chs: nos.update(c['no'] if isinstance(c['no'], list) else [c['no']])
        if not prev: continue
        old = prev['files'].get(D.BASENAME)
        if old is None:
            if '*' not in nos: missing.append('%s：前回の版にない機能 → CHANGES に {"ver": "%s", "no": "*", "type": "追加", …} を1行' % (D.TITLE[0], ver))
            continue
        cur = snap(D)
        changed = sorted({k.split(':', 1)[1] for k in set(cur) | set(old) if cur.get(k) != old.get(k)}, key=lambda n: [int(x) if x.isdigit() else x for x in re.split(r'(\d+)', n)])
        for no in changed:
            if '*' not in nos and no not in nos:
                missing.append('%s No.%s：前回の版から変わったが CHANGES（版 %s）に書かれていない' % (D.TITLE[0], no, ver))
    if missing:
        show('改訂履歴に書かれていない変更', missing)
        sys.exit('\n開発が変更に気づけるよう、各データの CHANGES に1行ずつ書いてから、もう一度 --release してください。')
    return prev

def save_release(datas, out, ver, prev):
    import datetime
    hist = (prev or {}).get('history', []) + [{'ver': ver, 'date': datetime.date.today().strftime('%Y-%m-%d'),
                                               'files': [D.TITLE[0] for D in datas]}]
    files = dict((prev or {}).get('files', {}))
    for D in datas: files[D.BASENAME] = snap(D)
    os.makedirs(os.path.join(out, '_release'), exist_ok=True)
    json.dump({'ver': ver, 'history': hist, 'files': files}, open(os.path.join(out, '_release', 'snapshot.json'), 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)
    return hist

def show(title, errs):
    if errs:
        print('  ' + title + '（%d 件）:' % len(errs))
        for e in errs: print('   -', e)

def main():
    ap = argparse.ArgumentParser(description='画面設計書（Excel JA・VI／HTML）とメッセージ・メールのまとめを作る')
    ap.add_argument('data', nargs='*'); ap.add_argument('--work'); ap.add_argument('--root'); ap.add_argument('--out')
    ap.add_argument('--book'); ap.add_argument('--only', choices=['excel', 'html'])
    ap.add_argument('--views', help='撮り直す状態の id（カンマ区切り）'); ap.add_argument('--width', type=int, help='撮影の画面幅（既定 1440。スマホのアプリは 390）'); ap.add_argument('--height', type=int, help='撮影の画面の高さ（既定 900。スマホは 844）'); ap.add_argument('--force', action='store_true'); ap.add_argument('--no-replay', action='store_true')
    ap.add_argument('--review', action='store_true'); ap.add_argument('--all', action='store_true'); ap.add_argument('--display-only', action='store_true'); ap.add_argument('--doctor', action='store_true')
    ap.add_argument('--check', action='store_true'); ap.add_argument('--capture', action='store_true')
    ap.add_argument('--common', action='store_true'); ap.add_argument('--draft', action='store_true')
    ap.add_argument('--release', metavar='VER', help='開発に渡す版（1.0, 1.1, …）。--book と一緒に使う')
    a = ap.parse_args()
    if a.no_replay: os.environ['KD_REPLAY'] = 'none'
    if a.release and (not a.book or a.draft):
        sys.exit('--release は --book（1サイト＝1ファイル）と一緒に使い、--draft とは使わない')

    targets = [p for p in a.data if not os.path.basename(p).startswith('_')]
    work = os.path.abspath(a.work or (os.path.dirname(os.path.dirname(os.path.abspath(targets[0]))) if targets else os.getcwd()))
    data_dir = os.path.join(work, 'データ')
    common_file = os.path.join(data_dir, '_共通_メッセージ.py')
    pattern_file = os.path.join(data_dir, '_共通パターン.py')
    if not os.path.exists(common_file):
        sys.exit('共通メッセージがありません: %s（assets/_共通_メッセージ_ひな形.py をコピーして作る）' % common_file)
    C = load(common_file)
    P = load(pattern_file) if os.path.exists(pattern_file) else None
    root = a.root or find_root(work) or find_root(os.getcwd())
    datas = [load_data(p) for p in targets]

    if a.doctor:                                  # 撮影の前の点検（データの URL・LOGIN から、つなぐ先とログインを確かめる）
        import kd_doctor
        D0 = datas[0] if datas else None
        base = (os.environ.get('KD_BASE') or (D0.DEMO_FILE if D0 else '')) if D0 or os.environ.get('KD_BASE') else None
        base = base if base and re.match(r'^https?://', base) else None
        L = (getattr(D0, 'LOGIN', None) or {}) if D0 else {}
        sys.exit(1 if kd_doctor.doctor(base, L.get('site') or (D0.SITE if D0 else 'ops'), L.get('loginId'), root) else 0)

    if a.review:                                  # 役割レビューの機械分（確認の前に。データの誤りがあっても見られる）
        import kd_review
        for path, D in zip(targets, datas):
            print('■', (getattr(D, 'TITLE', None) or ['?'])[0], '（%s）' % os.path.basename(path))
            cp = os.path.join(work, '出力', '.capture_cache', D.IMG_PREFIX, 'cache.json')
            views = None
            if os.path.exists(cp):
                views = {k: e['rep'] for k, e in json.load(open(cp, encoding='utf-8')).get('views', {}).items()}
            else:
                print('  （表示の確認は、先に --capture で撮ってから。入力欄の幅・文字切れ・位置を測る）')
            print(kd_review.render(kd_review.review(D, views), full=a.all, only='D' if a.display_only else None))
        return

    # ---- 1. 確認（ブラウザ不要）。未確認・二か国語の抜け・文言の決まり違反を全部出す
    blocking = False
    errs = R.check_common(C)
    show('共通メッセージの誤り・決まり違反', errs); blocking |= bool(errs)
    for path, D in zip(targets, datas):
        print('■', (getattr(D, 'TITLE', None) or ['?'])[0], '（%s）' % os.path.basename(path))
        errs, pending = R.check_data(D, C, P)
        show('データの誤り', errs); show('未確認（ユーザーに確認してから直す）', pending)
        if not errs and not pending: print('  確認 OK')
        blocking |= bool(errs) or (bool(pending) and not a.draft)
    if a.check:
        sys.exit(1 if blocking else 0)
    if blocking:
        sys.exit('\n未確認・誤りが残っているので作りません。ユーザーに確認してデータを直すか、内部の下見だけなら --draft。')

    import kd_common
    ml = None
    try:
        ml = kd_common.read_ml(root, getattr(C, 'ML_GLOB', ''))
    except ImportError:
        print('（openpyxl がないため Message List を読めません）')
    kd_common.enrich(C, ml)
    print('Message List：%s' % (ml['file'] if ml else '見つからない（文言の突き合わせはしない）'))

    # ---- 2. デモを開いて番号の場所・デモとの差を確認し、作る
    built = []
    if not a.common:
        import kd_capture, kd_build
        for path, D in zip(targets, datas):
            attach_messages(D, C)
            if kd_capture.is_url(D.DEMO_FILE):          # 本物の Web（開発中のコード）。撮り直す状態があるときだけ、つながるか確かめる（kd_capture）
                demo = os.environ.get('KD_BASE') or D.DEMO_FILE     # KD_BASE：別のサーバーで撮る（複数の作業を並べるとき。例 http://localhost:3001）
            else:
                demo = os.path.join(root, D.DEMO_FILE) if root else D.DEMO_FILE
                if not os.path.exists(demo):
                    sys.exit('デモが見つかりません: %s（--root で指定）' % demo)
            out = os.path.abspath(a.out or os.path.join(work, '出力', a.book or D.OUT_DIR))
            # 撮影は --capture でも作成でも同じ場所に残し、変わっていない状態は次から撮り直さない（--force で全部撮り直す）
            img_dir = os.path.join(work, '出力', '.capture_cache', D.IMG_PREFIX)
            os.makedirs(img_dir, exist_ok=True); os.makedirs(out, exist_ok=True)
            print('■', D.TITLE[0], '：%sを開いて番号の場所を確認・撮影しています…' % ('本物の Web' if kd_capture.is_url(demo) else 'デモ'))
            only = [x.strip() for x in a.views.split(',')] if a.views else None
            vw, vh = getattr(D, 'VIEWPORT', (1440, 900))        # データの VIEWPORT = (幅, 高さ)（ドライバーアプリは (390, 844)）。--width／--height が優先
            rep = kd_capture.run(D, demo, img_dir, width=a.width or vw, height=a.height or vh, only=only, snapshot=True, root=root, force=a.force)
            model = kd_build.build_model(D, rep, P, img_dir)
            # 場所が見つからない番号。demo_ok（確認済みの理由）が書いてある項目は数えない（見本データで作れない状態など）
            missing = 0
            for v in D.VIEWS:
                ok = {it['no'] for it in v['items'] if it.get('demo_ok')}
                missing += len([n for n in rep['views'].get(v['id'], {}).get('missing', []) if n not in ok])
            auto = [(v['id'], r['no'], r['ja'], x[0]) for v in model['views'] for r in v['rows'] for x in r['auto']]
            if missing or auto:
                print('  画面で場所が見つからない番号 %d 件／画面との差（未確認）%d 件' % (missing, len(auto)))
                for x in auto: print('   - %s No.%s %s：%s' % x)
            if a.capture: continue
            if (missing or auto) and not a.draft:
                sys.exit('\nデモとの差が残っているので作りません。ユーザーに確認し、データの sel を直すか demo_ok（確認済みの理由）を書く。')
            built.append((D, model, demo, out))
        if a.capture:
            return
        if built:
            out0 = built[0][3]
            path = os.path.join(out0, '_release', 'snapshot.json')
            prev = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else None
            if a.release:
                prev = release_check([b[0] for b in built], out0, a.release)
                hist = (prev or {}).get('history', []) + [{'ver': a.release, 'date': '', 'files': [b[0].TITLE[0] for b in built]}]
            else:
                hist = (prev or {}).get('history', [])
            files = kd_build.write(built, a.book, a.only, a.draft, a.release, hist)
            if a.release:
                save_release([b[0] for b in built], out0, a.release, prev)
                print('■ 版 %s として保存しました（次に渡すときは、この版との差を CHANGES に書く）' % a.release)
            for f in files: print('  →', f)

    # ---- 3. メッセージ・メールのまとめ（作業フォルダのすべての画面から作り直す）
    if a.capture or (a.only == 'html'):
        return
    alld = []
    for p in sorted(glob.glob(os.path.join(data_dir, '*.py'))):
        if os.path.basename(p).startswith('_'): continue
        alld.append(load_data(p))
    cout = os.path.join(os.path.abspath(a.out) if a.out else os.path.join(work, '出力'), '_共通')
    r = kd_common.run(C, alld, ml, cout)
    print('■ メッセージ・メールのまとめ：メッセージ %d（Message List に未登録 %d・文言が違う %d）／メール %d'
          % (r['messages'], r['adds'], r['diff'], r['mails']))
    if r['unused']: print('  どの画面でも使っていない ID：%s' % '、'.join(r['unused']))
    print('  →', cout)

def run():
    """終わりに必ず結果の行を出す（✔ 完了／✖ 失敗）。背景で動かしても、最後の行を見ればわかる。エラーは「原因と対処」で出し、全文はログへ"""
    import kd_doctor
    try:
        main()
    except SystemExit as e:
        c = e.code
        if c in (0, None): print('✔ 完了'); sys.exit(0)
        if isinstance(c, str):
            print('\n✖ 失敗：%s' % c); sys.exit(1)
        print('\n✖ 止まりました（終了コード %s）。上に出ている項目を直してからやり直す' % c); sys.exit(c)
    except KeyboardInterrupt:
        print('\n✖ 中断されました'); sys.exit(130)
    except Exception as e:
        kd_doctor.report_failure(e); sys.exit(1)
    print('✔ 完了')

if __name__ == '__main__':
    run()
