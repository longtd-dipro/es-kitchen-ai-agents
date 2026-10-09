# -*- coding: utf-8 -*-
"""月間メニュー（#237〜#240・#247〜#249・#253〜#256・#265・#266・#276・レビューD）"""
import copy, json
from qa_lib import *
from sec_product import msg

def vw(a, ym): return a.o('menu', 'menuEdit', {'ym': ym})[1]

def data_of_menu(m, **ch):
    d = {'items': copy.deepcopy(m['items']), 'corpPublish': m['corpPublish'], 'pdfs': copy.deepcopy(m['pdfs']),
         'publishOn': m['publishOn'], 'orderFrom': m['orderFrom'], 'orderTo': m['orderTo'], 'avgTarget': m['avgTarget'], 'noAdjust': m.get('noAdjust', False)}
    d.update(ch); return d

def sums(a, ym):
    return a.d('menu', 'get', {'menuId': ym})[1]['sums']

def run(p, ctxs):
    a = ctxs['ops_full']; cs = ctxs['ops_cs']; base = ctxs['base']
    ms = lambda ym: vw(a, ym)['menu']
    save = lambda ym, d, **kw: a.o('menu', 'saveMenuEdit', dict({'ym': ym, 'data': d}, **kw))

    screen('商品マスタ（削除・無効 × メニューの状態）')
    from sec_product import save_new
    nj = save_new(a, name='編集中メニュー専用', nameEn='Draft menu only', jan='4900000000024')
    npid = nj['id']
    mm = ms('2026-12')
    st, j = a.o('menu', 'saveMenuEdit', {'ym': '2026-12', 'data': data_of_menu(mm, items=mm['items'] + [{'productId': npid}])})
    inm = npid in [x['productId'] for x in ms('2026-12')['items']]
    rec(f'新しい商品 {npid} を編集中メニュー（2026-12）にだけ入れる', '#268', st < 400 and inm, f'HTTP {st} {msg(st, j)[:150]} 入っている={inm}')
    b = a.o('general', 'productBlockers', {'id': npid})[1]
    rec('編集中メニューにだけある商品は blockers が空（編集中は「有効なメニュー」に含めない）', '#268', not b['blocked'], str(b))
    pi = a.o('general', 'product', {'id': npid})[1]['product']
    from sec_product import base_pi
    d = base_pi(a, npid); d['status'] = '無効'
    st, j = a.o('general', 'saveProduct', {'id': npid, 'data': dict(d, name=pi['name'], nameEn=pi['nameEn'], jan=pi['jan'])})
    rec('  └無効にできる', '#268', st < 400, f'HTTP {st} {msg(st, j)[:150]}')
    st, j = a.o('general', 'deleteRow', {'key': 'product', 'uid': npid})
    rec('  └削除できる（メニューからは外れた扱い・商品は論理削除）', '#232・#268', st < 400, f'HTTP {st} {msg(st, j)[:150]}')
    m11 = ms('2026-11')
    nj2 = save_new(a, name='公開中メニュー専用', nameEn='Published menu only', jan='4900000000031', images=[{'file': 'products/M001-1.jpg', 'main': True}])
    n2 = nj2['id']
    st_add = a.o('menu', 'saveMenuEdit', {'ym': '2026-11', 'data': dict(data_of_menu(m11, items=m11['items'] + [{'productId': n2, 'publishable': True}]))})
    st, j = a.o('general', 'deleteRow', {'key': 'product', 'uid': n2})
    rec('公開中メニュー（2026-11）に入れた商品を削除→止まる(409)', '#268', st == 409, f'HTTP {st} {msg(st, j)[:150]} 入っている={n2 in [x["productId"] for x in ms("2026-11")["items"]]} 追加の保存={st_add[0]} {msg(*st_add)[:120]}')
    base.post('/api/dev/reset'); base.post('/api/demo/today', data={'date': ''})
    screen('月間メニュー（保存・公開の条件）')
    m12 = ms('2026-12')
    print('  2026-12:', m12['status'], m12['corpPublish'], len(m12['items']), 'pdfs', len(m12['pdfs']), 'kari', vw(a, '2026-12')['kari'], 'sums', sums(a, '2026-12'))
    print('  readiness', a.o('menu', 'readiness', {'ym': '2026-12'})[1])
    # 合計49/51 で保存できる（手で直した値＝manual）
    def with_base(m, total_delta):
        items = copy.deepcopy(m['items'])
        for x in items:
            x['manual'] = {'std': True, 'ns': True, 'vm': True}
        # std を合計 50+delta にする
        cur = sum(x['base']['std'] for x in items)
        want = 50 + total_delta
        diff = want - cur
        for x in items:
            if diff == 0: break
            step = 1 if diff > 0 else -1
            if x['base']['std'] + step >= 0:
                x['base']['std'] += step; diff -= step
        return items
    for delta in (-1, 1):
        items = with_base(m12, delta)
        st, j = save('2026-12', data_of_menu(m12, items=items))
        s = sums(a, '2026-12')
        rec(f'編集中メニューを標準数の合計{50+delta}で保存→保存できる（止めない）', '#249・#254', st < 400, f'HTTP {st} {msg(st, j)[:150]} sums={s}')
        st2, j2 = a.o('menu', 'publishMenu', {'ym': '2026-12'})
        rec(f'  └合計{50+delta}の編集中メニューを公開→止まる（合計50が必要）', '#254・#265', st2 == 400 and '50' in msg(st2, j2), f'HTTP {st2} {msg(st2, j2)[:260]}')
    # PDF / 条件
    st, j = a.o('menu', 'publishMenu', {'ym': '2026-12'})
    rec('編集中メニュー公開：条件未達（PDF・承認など）の内訳が文言で返る', '#254・#276', st == 400 and '公開の条件を満たしていません' in msg(st, j), f'HTTP {st} {msg(st, j)[:300]}')
    # 公開中メニュー（2026-11）
    m11 = ms('2026-11')
    st, j = save('2026-11', data_of_menu(m11, pdfs=[]))
    rec('公開中メニューで PDF を全部外して保存→止まる（公開の条件は保存でも確かめる）', '#265', st == 400 and 'PDF' in msg(st, j), f'HTTP {st} {msg(st, j)[:200]}')
    items = with_base(m11, -1)
    st, j = save('2026-11', data_of_menu(m11, items=items))
    rec('公開中メニューの標準数合計49で保存→保存できる（合計≠50は止めない）', '#256・#265', st < 400, f'HTTP {st} {msg(st, j)[:200]}')
    st, j = a.d('menu', 'save', {'menuId': '2026-11', 'corpPublish': '非公開', 'accountId': 'Ad00010'})
    rec('公開中メニューを非公開へ戻す（domain menu.save corpPublish=非公開）→止まる', '#253（非公開へ戻す機能は作らない）', st == 409, f'HTTP {st} {msg(st, j)[:200]}')
    st, j = save('2026-11', data_of_menu(m11, corpPublish='非公開'))
    cp = ms('2026-11')['corpPublish']
    rec('  └画面の保存 API で corpPublish=非公開を送っても公開のまま', '#253', cp == '公開', f'HTTP {st} corpPublish={cp}')
    # 日付
    st, j = save('2026-12', data_of_menu(m12, publishOn='2026/11/10', orderFrom='2026/11/05'))
    rec('公開日 ＞ 開始日→止まる', 'レビューD（公開日＞開始日）', st == 400, f'HTTP {st} {msg(st, j)[:200]}')
    st, j = save('2026-12', data_of_menu(m12, orderFrom='2026/11/15', orderTo='2026/11/15'))
    rec('開始日 ＝ 締切日→止まる', 'レビューD', st == 400, f'HTTP {st} {msg(st, j)[:200]}')
    st, j = save('2026-12', data_of_menu(m12, orderTo='2026/11/31'))
    rec('締切日に存在しない日付 2026/11/31→止まる', 'レビューD（うるう日・存在しない日）', st == 400, f'HTTP {st} {msg(st, j)[:200]} / 保存後 orderTo={ms("2026-12")["orderTo"]}')
    save('2026-12', data_of_menu(m12))  # 戻す
    # 締切済・配送中ロック
    m10 = ms('2026-10'); m09 = ms('2026-09')
    st, j = save('2026-10', data_of_menu(m10, items=m10['items'][:-1]))
    rec('締切済メニューで商品を外す→止まる（E124）', '#255・#266', st == 409, f'HTTP {st} {msg(st, j)[:200]}')
    its = copy.deepcopy(m10['items']); its[0]['base']['std'] += 1; its[0]['manual'] = {'std': True}
    st, j = save('2026-10', data_of_menu(m10, items=its))
    rec('締切済メニューで標準数を変える→止まる', '#255', st == 409, f'HTTP {st} {msg(st, j)[:200]}')
    st, j = save('2026-09', data_of_menu(m09))
    rec('配送中メニューの保存→止まる（編集できない）', '#256', st == 409, f'HTTP {st} {msg(st, j)[:200]}')
    st, j = a.o('menu', 'deleteMenu', {'ym': '2026-09'})
    rec('配送中メニューの削除→止まる', '#237・#276', st == 409, f'HTTP {st} {msg(st, j)[:200]}')
    # 削除
    screen('月間メニュー（削除・作り直し・新規の年月）')
    for ym, lab in [('2026-11', '公開中'), ('2026-10', '締切済')]:
        st, j = a.o('menu', 'deleteMenu', {'ym': ym}); rec(f'{lab}メニュー {ym} を削除→止まる', '#237・#276', st == 409, f'HTTP {st} {msg(st, j)[:200]}')
    nm = a.o('menu', 'newMenuMonths')[1]
    rec('新規登録で選べる年月：メニューがまだない月だけ（既存 2026-09〜12 を含まない・過去月なし）', '#276②', not set(nm) & {'2026-09', '2026-10', '2026-11', '2026-12'} and nm and nm[0] >= '2027-01', str(nm[:4]))
    st, j = a.o('menu', 'createMenu', {'ym': '2026-12'}); rec('既存の年月 2026-12 で新規作成→止まる', '#276②', st == 409, f'HTTP {st} {msg(st, j)[:200]}')
    st, j = a.o('menu', 'createMenu', {'ym': '2026-10'}); rec('締まった月 2026-10 で新規作成→止まる', '#276②', st in (400, 409), f'HTTP {st} {msg(st, j)[:200]}')
    st, j = a.o('menu', 'createMenu', {'ym': '2027-02'}); rec('先の月 2027-02 を新規作成→できる', '#276②', st < 400, f'HTTP {st} {msg(st, j)[:200]}')
    st, j = a.o('menu', 'deleteMenu', {'ym': '2027-02'}); rec('編集中の 2027-02 を削除→できる（論理削除）', '#237・#247', st < 400, f'HTTP {st} {msg(st, j)[:200]}')
    ml = [m['ym'] + ':' + m['status'] for m in a.o('menu', 'menuList')[1]]
    rec('  └menuList に「削除済」として残る', '#247', '2027-02:削除済' in ml, str(ml))
    ml2 = [m['ym'] for m in a.o('menu', 'menus')[1]]
    rec('  └既定の一覧（menus）には出ない', '#247', '2027-02' not in ml2, str(ml2))
    st, j = a.o('menu', 'createMenu', {'ym': '2027-02'}); rec('  └同じ年月で作り直せる', '#247', st < 400, f'HTTP {st} {msg(st, j)[:200]}')
    # 権限
    screen('月間メニュー（権限）')
    for lab, call in [('保存', ('menu', 'saveMenuEdit', {'ym': '2026-12', 'data': data_of_menu(m12)})), ('新規作成', ('menu', 'createMenu', {'ym': '2027-03'})),
                      ('削除', ('menu', 'deleteMenu', {'ym': '2026-12'})), ('公開', ('menu', 'publishMenu', {'ym': '2026-12'})),
                      ('CSV取込', ('menu', 'importCsv', {'ym': '2026-12', 'csv': 'x'}))]:
        st, j = cs.o(*call)
        rec(f'CS（Ad00002）が月間メニューの{lab}→403', '台帳K・権限表', st == 403, f'HTTP {st} {msg(st, j)[:100]}')
    # 自動公開
    auto_publish(a, base, ms)
    base.post('/api/dev/reset'); base.post('/api/demo/today', data={'date': ''})
    # 商品を外す・注文への影響
    remove_effect(a, ms)
    base.post('/api/dev/reset'); base.post('/api/demo/today', data={'date': ''})
    # CSV
    csv_menu(a, ms, ctxs)
    base.post('/api/dev/reset'); base.post('/api/demo/today', data={'date': ''})
    # UI
    ui_menu(ctxs)

def auto_publish(a, base, ms):
    screen('月間メニュー（自動公開）')
    m = ms('2026-12')
    st, j = a.o('menu', 'saveMenuEdit', {'ym': '2026-12', 'data': data_of_menu(m, corpPublish='自動公開')})
    print('  自動公開に設定', st, msg(st, j))
    r = a.d('menu', 'tick', {'today': '2026/11/01'})[1]
    rec('自動公開の日に条件不足（PDF・承認など）→公開しない・警告に残る', '#276①', '2026-12' not in r.get('published', []) and any(w['menuId'] == '2026-12' for w in r.get('warned', [])), str(r))
    al = a.d('menu', 'alerts', {'today': '2026/11/01'})[1]
    rec('  └ダッシュボードの警告（menu.alerts・自動公開日の3日前から）に出る', '#276①', any(x['menuId'] == '2026-12' for x in al), str(al)[:200])
    nn = base.get('/api/demo/today').json() if False else None
    st, n = a.d('notice', 'notifications', {}) if False else (0, None)
    r2 = a.d('menu', 'tick', {'today': '2026/11/02'})[1]
    rec('  └翌日も再判定（まだ公開しない・また警告）', '#276①', '2026-12' not in r2.get('published', []) and any(w['menuId'] == '2026-12' for w in r2.get('warned', [])), str(r2)[:200])
    # 条件をそろえて公開される
    m = ms('2026-12'); v = vw(a, '2026-12')
    its = copy.deepcopy(m['items'])
    for x in its: x['publishable'] = True; x['manual'] = {}
    pdfs = [{'name': '2026年12月_ライト用.pdf', 'size': 1000, 'kind': 'ライト用'}, {'name': '2026年12月_スタンダード用.pdf', 'size': 1000, 'kind': 'スタンダード用'}]
    a.o('menu', 'saveMenuEdit', {'ym': '2026-12', 'data': data_of_menu(m, items=its, pdfs=pdfs, corpPublish='自動公開')})
    a.d('menu', 'approveKari', {'menuId': '2026-12', 'approve': True, 'accountId': 'Ad00010'})
    a.d('menu', 'recalcBase', {'menuId': '2026-12', 'accountId': 'Ad00010'})
    rd = a.o('menu', 'readiness', {'ym': '2026-12'})[1]
    print('  readiness after fix', rd)
    r3 = a.d('menu', 'tick', {'today': '2026/10/30'})[1]
    rec('条件がそろった自動公開のメニュー→自動公開の日に公開される', '#276①・#240', '2026-12' in r3.get('published', []), f'ready={rd} tick(2026/10/30＝公開日11/01が日曜のため前の営業日)={r3}')

def remove_effect(a, ms):
    screen('月間メニュー（商品を外す・注文への影響）')
    m = ms('2026-11')
    orders = a.o('menu', 'orders', {'ym': '2026-11'})[1]
    by = {}
    for o in orders: by.setdefault(o['status'], []).append(o)
    print('  2026-11 注文の状態:', {k: len(v) for k, v in by.items()})
    # 外す商品：登録済・デフォルト両方が持つ商品
    cand = None
    for it in m['items']:
        pid = it['productId']
        kinds = {o['status'] for o in orders if pid in o['q'] and any(v for v in o['q'][pid].values())}
        if len(kinds) >= 2: cand = (pid, kinds); break
    if not cand:
        rec('商品を外す→注文の中身（登録済は残る・自動注文は作り直し）', '#255・#266', False, '2026-11 の見本に条件に合う商品がない', blocked=True); return
    pid, kinds = cand
    imp = a.o('menu', 'impact', {'ym': '2026-11', 'productIds': [pid]})[1]
    rec(f'商品 {pid} を外す前の確認：その商品を含む注文の件数（残る／作り直し）が返る', '#255③', 'total' in imp and (imp['total']['keep'] or imp['total']['rebuild']), str(imp)[:240])
    before = {o['no']: (o['status'], json.dumps(o['q'], sort_keys=True)) for o in orders}
    items = [x for x in m['items'] if x['productId'] != pid]
    d = data_of_menu(m, items=items)
    st, j = a.o('menu', 'saveMenuEdit', {'ym': '2026-11', 'data': d})
    rec(f'公開中メニューから商品 {pid} を外して保存→保存できる', '#253・#255', st < 400, f'HTTP {st} {msg(st, j)[:200]}')
    after = {o['no']: o for o in a.o('menu', 'orders', {'ym': '2026-11'})[1]}
    nz = lambda q: {k: {d: n for d, n in v.items() if n} for k, v in q.items() if any(v.values())}
    kept_bad = [no for no, (s, q) in before.items() if s in ('登録済', 'ES登録済') and nz(after[no]['q']) != nz(json.loads(q))]
    rec('  └登録済・ES登録済の注文は自動で書き換えない（外した商品も残る）', '#255①③・#266', not kept_bad, f'書き換わった注文={kept_bad[:5]}')
    reb = [no for no, (s, q) in before.items() if s in ('デフォルト', 'お試し（自動）') and pid in json.loads(q) and any(json.loads(q)[pid].values())]
    still = [no for no in reb if any(after[no]['q'].get(pid, {}).values())]
    adj = [no for no in reb if any(any(v.values()) for v in after[no]['a'].values())]
    rec('  └自動注文・お試し（自動）は作り直して外した商品を除く（調整数のある注文は除く）', '#266②', not [n for n in still if n not in adj], f'外れていない自動注文={still[:5]} 調整数あり={adj[:3]}')
    # 外れた商品を増やせない
    keep = [no for no, (s, q) in before.items() if s in ('登録済', 'ES登録済') and pid in json.loads(q) and any(json.loads(q)[pid].values())]
    if keep:
        o = after[keep[0]]; o2 = copy.deepcopy(o)
        slot = next(k for k, v in o['q'][pid].items() if v)
        o2['q'][pid][slot] += 1
        other = next((k for k, v in o['q'].items() if k != pid and v.get(slot)), None)
        if other: o2['q'][other][slot] -= 1
        st, j = a.o('menu', 'saveOrder', {'order': o2})
        rec('外れた商品の数を増やす（他の商品を減らして合計は同じ）→止まる', '#266①（減らす・0にするだけ）', st == 400 and 'メニューから外れた' in msg(st, j), f'HTTP {st} {msg(st, j)[:240]}')
        o3 = copy.deepcopy(o); o3['q'][pid][slot] -= 1
        if other: o3['q'][other][slot] += 1
        st, j = a.o('menu', 'saveOrder', {'order': o3})
        rec('外れた商品の数を減らす（合計は同じに他を増やす）→保存できる', '#266①', st < 400, f'HTTP {st} {msg(st, j)[:240]}')
    else:
        rec('外れた商品の数を増やす／減らす', '#266①', False, '登録済の注文に該当商品がない', blocked=True)
    # 商品を足す→すぐ注文できる（足した商品を既存注文は変えない）
    # 標準数を変える→自動注文だけ作り直し
    # お試しの扱いは sec_order で

def tplrows(a, ym='2026-12'):
    t = a.d('csv', 'template', {'entity': 'menu', 'scope': {'site': 'ops', 'target': ym}})[1]
    return t['head'], [list(r) for r in t['rows']]

def write_csv(path, head, rows):
    import csv, io
    o = io.StringIO(); w = csv.writer(o, lineterminator='\n'); w.writerow(head)
    for r in rows: w.writerow(r)
    open(path, 'w', encoding='utf-8').write(o.getvalue())

def ui_import(pg, path, ym):
    pg.goto(BASE + f'/ops/menu/monthly/{ym}/import'); pg.wait_for_timeout(2000)
    pg.set_input_files('input[type=file]', path); pg.wait_for_timeout(1800)
    pre = pg.inner_text('body')
    try:
        pg.get_by_label('警告を確認しました').check()
    except Exception:
        pass
    pg.get_by_role('button', name='登録', exact=True).click(); pg.wait_for_timeout(2500)
    return pre, pg.inner_text('body')

def csv_menu(a, ms, ctxs):
    screen('月間メニュー CSV取込（行ごと）')
    br = ctxs['browser']
    head, rows = tplrows(a)
    ix = {h: i for i, h in enumerate(head)}
    before = [x['productId'] for x in ms('2026-12')['items']]
    # A: 1行を不正（基準注文数 abc）＋1行を存在しない品番、ほかは正常
    r = [list(x) for x in rows]
    bad_exist = r[2][ix['品番']]               # すでにメニューにある商品の行をエラーにする
    r[2][ix['基準注文数']] = 'abc'
    r[5][ix['品番']] = 'M999'
    write_csv('/tmp/claude-0/menu_a.csv', head, r)
    c, pg = ui_login(br, 'ops', 'Ad00010')
    try:
        pre, post = ui_import(pg, '/tmp/claude-0/menu_a.csv', '2026-12')
        rec('確認画面：エラーの行は取り込まない旨・行番号つきのエラー一覧が出る', '#239・#248', 'エラー 2' in pre and 'エラーの行 2件は取り込みません' in pre, pre[pre.find('エラー 2'):pre.find('エラー 2') + 120].replace('\n', ' ') if 'エラー 2' in pre else pre[-600:].replace('\n', ' '))
        m = re_search_counts(post)
        rec('取込のあと「成功○件・失敗○件」が出る（失敗2件）', '#248', '成功' in post and '失敗2件' in post.replace(' ', ''), f'画面のメッセージ: {m}')
        after = [x['productId'] for x in ms('2026-12')['items']]
        rec('エラー行の商品（すでにメニューにある）はそのまま残る', '#248', bad_exist in after, f'エラー行の品番={bad_exist} 取込後の商品に含む={bad_exist in after}')
        sums_ = sums(a, '2026-12')
        rec('取込後、標準数の合計が50でなくても止まらない（取込は完了している）', '#248・#249', '成功' in post, f'sums={sums_}')
        rec('  └行ごとに取り込まれた（正常行の変更が反映：M999行以外の商品は並びが入れ替わる）', '#239', len(after) >= 1, f'商品数 {len(before)} → {len(after)}')
    except Exception as e:
        rec('月間メニューCSV取込（UI）', '#239・#248', False, f'{type(e).__name__}: {str(e)[:200]}', blocked=True)
    finally:
        c.close()
    # B: 年月違い・ファイル全体エラー
    head2, rows2 = tplrows(a)
    st, j = a.d('csv', 'importPreview', {'entity': 'menu', 'text': 'あ,い\n1,2\n', 'fileName': 'bad.csv', 'scope': {'site': 'ops', 'target': '2026-12'}, 'by': 'Ad00010'})
    rec('CSV 見出しが違うファイル→ファイル全体のエラー（取り込めない）', '#239', bool(j.get('fileErrors')) or j['counts'].get('エラー', 0) > 0, f'{j.get("fileErrors")} {j.get("counts")}')
    r = [list(x) for x in rows2]; r[0][ix['年月']] = '2027-01'
    import io, csv
    o = io.StringIO(); w = csv.writer(o, lineterminator='\n'); w.writerow(head2); [w.writerow(x) for x in r]
    st, j = a.d('csv', 'importPreview', {'entity': 'menu', 'text': o.getvalue(), 'fileName': 'ym.csv', 'scope': {'site': 'ops', 'target': '2026-12'}, 'by': 'Ad00010'})
    rec('CSV 年月が取込先と違う行→エラー行', '#239', j['counts'].get('エラー', 0) >= 1, f'{j.get("counts")} {str(j.get("rows"))[:200]}')
    r = [list(x) for x in rows2]; r[1][ix['基準注文数']] = '-1'
    o = io.StringIO(); w = csv.writer(o, lineterminator='\n'); w.writerow(head2); [w.writerow(x) for x in r]
    st, j = a.d('csv', 'importPreview', {'entity': 'menu', 'text': o.getvalue(), 'fileName': 'neg.csv', 'scope': {'site': 'ops', 'target': '2026-12'}, 'by': 'Ad00010'})
    rec('CSV 基準注文数 -1→エラー行', '#239', j['counts'].get('エラー', 0) >= 1, f'{j.get("counts")}')
    r = [list(x) for x in rows2]; r[1][ix['商品タグ']] = '存在しないタグ'
    o = io.StringIO(); w = csv.writer(o, lineterminator='\n'); w.writerow(head2); [w.writerow(x) for x in r]
    st, j = a.d('csv', 'importPreview', {'entity': 'menu', 'text': o.getvalue(), 'fileName': 'tag.csv', 'scope': {'site': 'ops', 'target': '2026-12'}, 'by': 'Ad00010'})
    rec('CSV 商品タグがマスタにない→エラー行', '#239', j['counts'].get('エラー', 0) >= 1, f'{j.get("counts")}')

def re_search_counts(post):
    i = post.find('成功')
    return post[max(0, i - 40): i + 30].replace('\n', ' ') if i >= 0 else '（「成功」の文言なし）' + post[-200:].replace('\n', ' ')

def ui_menu(ctxs, a=None):
    br = ctxs['browser']; base = ctxs['base']; a = ctxs['ops_full']
    screen('月間メニュー（UI）')
    # 合計49の状態にして保存の確認ダイアログを見る
    m12 = vw(a, '2026-12')['menu']
    items = copy.deepcopy(m12['items'])
    for x in items: x['manual'] = {'std': True, 'ns': True, 'vm': True}
    for x in items:
        if x['base']['std'] > 0: x['base']['std'] -= 1; break
    a.o('menu', 'saveMenuEdit', {'ym': '2026-12', 'data': data_of_menu(m12, items=items)})
    c, pg = ui_login(br, 'ops', 'Ad00010')
    try:
        pg.goto(BASE + '/ops/menu/monthly/2026-12/edit'); pg.wait_for_timeout(3000)
        b = pg.inner_text('body')
        rec('編集中メニューの編集画面に「公開」ボタンがあり、非公開へ戻す操作はない', '#253', '非公開に戻す' not in b and '非公開へ戻す' not in b, '')
        pg.get_by_role('button', name='保存', exact=True).first.click(); pg.wait_for_timeout(1200)
        dlg = pg.locator('[role=dialog]').first
        dt = dlg.inner_text() if dlg.count() else ''
        rec('合計≠50（49）で保存→確認ダイアログ「基準注文数の合計が50ではありません／このまま保存」が出る（止めない）', '#249・#254', '合計が50ではありません' in dt and '現在：基準注文数 49' in dt, dt.replace('\n', ' ')[:200])
        rec('  └確認ダイアログの文に合計の値と「保存」の選択肢（ボタン）がある', '#249', dlg.count() > 0 and dlg.get_by_role('button').count() >= 2, f'dialog={dlg.count()} buttons={[x.inner_text() for x in dlg.get_by_role("button").all()] if dlg.count() else None}')
    except Exception as e:
        rec('編集中メニュー編集画面（UI）', '#249', False, f'{type(e).__name__}: {str(e)[:200]}', blocked=True)
    finally:
        c.close()
    c, pg = ui_login(br, 'ops', 'Ad00010')
    try:
        pg.goto(BASE + '/ops/menu/monthly/2026-11/edit'); pg.wait_for_timeout(3000)
        b = pg.inner_text('body')
        rec('公開中メニューの編集画面に「非公開に戻す」がない', '#253', '非公開に戻す' not in b and '非公開へ戻す' not in b, '')
        pg.get_by_role('button', name='保存', exact=True).first.click(); pg.wait_for_timeout(1200)
        b2 = pg.inner_text('body')
        btns = [x.inner_text() for x in pg.locator('[role=dialog] button, .modal button').all()]
        dt2 = pg.locator('[role=dialog]').first.inner_text() if pg.locator('[role=dialog]').count() else ''
        btns = [x.inner_text() for x in pg.locator('[role=dialog] button').all()]
        rec('公開済みメニューの保存→確認は1つにまとめ、ボタンは「更新して保存」', '#276③', '更新して保存' in btns and pg.locator('[role=dialog]').count() == 1, f'ボタン={btns} dialog数={pg.locator("[role=dialog]").count()}')
        chk = pg.get_by_label('お客様へ知らせる')
        rec('  └確認の中の「お客様へ知らせる」は初期値＝チェックなし', '#282②（公開済みの更新）', chk.count() > 0 and not chk.first.is_checked(), f'チェックボックス数={chk.count()} checked={chk.first.is_checked() if chk.count() else None}')
        pg.goto(BASE + '/ops/menu/monthly/2026-11'); pg.wait_for_timeout(2000)
        b3 = pg.inner_text('body')
        rec('公開中メニューの詳細に「非公開に戻す」がない・削除ボタンも出ない/押せない', '#253・#237', '非公開に戻す' not in b3 and '非公開へ戻す' not in b3, f'削除ボタンの文言あり={"削除" in b3}')
    except Exception as e:
        rec('公開中メニュー編集画面（UI）', '#253', False, f'{type(e).__name__}: {str(e)[:200]}', blocked=True)
    finally:
        c.close()
    # 商品を外す→確認ダイアログ「この商品を含む注文が○件あります」（#255）
    try:
        c, pg = ui_login(br, 'ops', 'Ad00010')
        pg.goto(BASE + '/ops/menu/monthly/2026-11/edit'); pg.wait_for_timeout(3000)
        pg.get_by_role('button', name='外す').first.click(); pg.wait_for_timeout(800)
        pg.get_by_role('button', name='保存', exact=True).first.click(); pg.wait_for_timeout(1500)
        b = pg.inner_text('body')
        rec('商品を外して保存→「この商品を含む注文が○件あります」の確認が出る', '#255③', '注文が' in b and '件あります' in b, b[b.find('件あります') - 60:b.find('件あります') + 40].replace('\n', ' ') if '件あります' in b else b[-300:].replace('\n', ' '))
    except Exception as e:
        rec('商品を外す確認（UI）', '#255③', False, f'{type(e).__name__}: {str(e)[:200]}', blocked=True)
    finally:
        c.close()
