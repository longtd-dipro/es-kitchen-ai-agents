# -*- coding: utf-8 -*-
"""2026-10-07 修正の確認（QC #112・#130・#234・#257・#290・BA #4・#10）：権限なし画面（CSV取込）・税率の権限・存在しない日付・CSV 年月・無効の商品"""
import copy, csv, io
from qa_lib import *
from sec_product import msg

IMPORT_URLS = [
    '/ops/masters/products/import', '/ops/masters/products/import/tags', '/ops/masters/categories/import', '/ops/masters/plans/import', '/ops/masters/options/import',
    '/ops/masters/devices/import', '/ops/masters/discounts/import', '/ops/masters/materials/import', '/ops/masters/warehouses/import', '/ops/masters/suppliers/import',
    '/ops/masters/drivers/import', '/ops/masters/consignees/import', '/ops/menu/monthly/2026-12/import',
]

def run(p, ctxs):
    a = ctxs['ops_full']; base = ctxs['base']; br = ctxs['browser']

    # 1) CSV取込の URL を権限のない人が直接開く（#273④）：閲覧のみ（Ad00013）・CS（Ad00002）
    screen('権限なし画面（CSV取込の URL）')
    for who, lab in (('Ad00013', '閲覧のみ'), ('Ad00002', 'CS')):
        c, pg = ui_login(br, 'ops', who)
        try:
            for url in IMPORT_URLS:
                pg.goto(BASE + url); pg.wait_for_timeout(1800)
                b = pg.inner_text('body')
                # CS は月間メニュー（orders）の CSV取込を持たない。商品系もない。持つ画面は表に出ない（持っていれば取り込み画面が出る）
                rec(f'{lab}（{who}）が {url} を直接開く→「この画面を見る権限がありません」（黙って戻されない）', '#273④・BA#4',
                    'この画面を見る権限がありません' in b and pg.url.replace(BASE, '') == url, f'表示先={pg.url.replace(BASE, "")} メッセージ={"この画面を見る権限がありません" in b}')
        except Exception as e:
            rec(f'{lab} CSV取込 URL', '#273④', False, f'{type(e).__name__}: {str(e)[:150]}', blocked=True)
        finally: c.close()
    c, pg = ui_login(br, 'ops', 'Ad00010')
    try:
        for url in ('/ops/masters/products/import', '/ops/menu/monthly/2026-12/import'):
            pg.goto(BASE + url); pg.wait_for_timeout(2000)
            b = pg.inner_text('body')
            rec(f'システム管理（Ad00010）が {url} を開く→取込画面が出る（権限なしではない）', '#273④', 'この画面を見る権限がありません' not in b and 'CSV' in b, f'表示先={pg.url.replace(BASE, "")}')
    except Exception as e:
        rec('システム管理が CSV取込を開く', '#273④', False, f'{type(e).__name__}: {str(e)[:150]}', blocked=True)
    finally: c.close()

    # 2) 税率はシステム管理だけ（台帳 E・#234）：商品開発（Ad00003）は共通のマスタ API でも直せない
    screen('税率（権限）')
    dev = Api(p, 'ops', 'Ad00003')
    st, j = dev.d('master', 'create', {'kind': 'taxRates', 'data': {'id': 'TXQC', 'label': 'QC税', 'rate': 3}})
    rec('商品開発（Ad00003）が master.create（kind=taxRates）→403', '台帳E・#234', st == 403, f'HTTP {st} {msg(st, j)[:120]}')
    st, j = dev.d('master', 'update', {'kind': 'taxRates', 'id': 'TX01', 'patch': {'rate': 9}})
    rec('商品開発が master.update（kind=taxRates）→403', '台帳E・#234', st == 403, f'HTTP {st} {msg(st, j)[:120]}')
    st, j = dev.d('master', 'addTaxRate', {'label': 'QC税', 'rate': 3})
    rec('商品開発が master.addTaxRate→403（専用 API も）', '台帳E・#234', st == 403, f'HTTP {st} {msg(st, j)[:120]}')
    st, j = dev.o('general', 'product', {'id': 'M002'})
    rec('商品開発が商品編集のデータ（税率の選択肢つき）を読める→読める（商品の編集は壊れない）', '台帳E', st == 200 and bool(j.get('product')), f'HTTP {st}')
    st, j = a.d('master', 'update', {'kind': 'taxRates', 'id': 'TX01', 'patch': {'rate': 8}})
    rec('システム管理が master.update（kind=taxRates）→通る', '台帳E', st < 400 or '変更' in msg(st, j) or st == 400, f'HTTP {st} {msg(st, j)[:120]}')
    base.post('/api/dev/reset')

    # 3) 存在しない日付（#130）：メニューの日付・資材注文の納品予定日・発送日・代替品設定の日付
    screen('存在しない日付（サーバー側）')
    for lab, ch in (('締切日 2026/11/31', {'orderTo': '2026/11/31'}), ('開始日 2026/02/30', {'orderFrom': '2026/02/30'}), ('公開日 2026/13/01', {'publishOn': '2026/13/01'}),
                    ('締切日 2027/02/29（うるう年でない）', {'orderTo': '2027/02/29'}), ('公開日 2026/00/10', {'publishOn': '2026/00/10'})):
        st, j = a.d('menu', 'save', dict({'menuId': '2026-12', 'accountId': 'Ad00010'}, **ch))
        cur = a.d('menu', 'get', {'menuId': '2026-12'})[1]
        saved = any(v in str(cur.get(k)) for k, v in (('orderTo', ch.get('orderTo', '#')), ('orderFrom', ch.get('orderFrom', '#')), ('publishOn', ch.get('publishOn', '#'))))
        rec(f'メニュー（domain menu.save）に {lab}→止まる・保存されない', '#130・レビューD', st == 400 and not saved, f'HTTP {st} {msg(st, j)[:100]} 保存された={saved}')
    st, j = a.d('menu', 'save', {'menuId': '2026-12', 'accountId': 'Ad00010', 'orderFrom': '2026/11/05', 'orderTo': '2026/11/30', 'publishOn': '2026/11/01'})
    rec('実在する日付（2026/11/30）は保存できる', '#130', st < 400, f'HTTP {st} {msg(st, j)[:100]}')
    master = a.o('menu', 'master')[1]
    s = next(x for x in master['sites'] if not x.get('trial') and not x.get('ended') and not x.get('paused'))
    mid = master['materials'][0]['id']
    st, j = a.d('delivery', 'placeMaterialOrder', {'branchId': s['id'], 'lines': [{'materialId': mid, 'qty': 1}], 'accountId': 'Ad00010', 'dueOn': '2026/11/31'})
    rec('資材注文の登録（納品予定日 2026/11/31）→止まる', '#130', st == 400, f'HTTP {st} {msg(st, j)[:100]}')
    ok = a.o('menu', 'createMat', {'site': s['id'], 'q': {mid: 1}})
    no = ok[1] if ok[0] < 400 else ''
    if no:
        m = a.o('menu', 'mat', {'no': no})[1]
        st, j = a.o('menu', 'saveMat', {'mat': dict(m, due='2026/11/31', q={mid: 2})})
        rec('資材注文の保存（納品予定日 2026/11/31）→止まる', '#130', st == 400, f'HTTP {st} {msg(st, j)[:100]}')
        st, j = a.o('menu', 'saveMat', {'mat': dict(m), 'ship': {'shippedOn': '2026-11-31', 'trackingNo': '123'}})
        rec('資材注文の発送日 2026-11-31→止まる（E06）', '#130・#277', st == 400, f'HTTP {st} {msg(st, j)[:100]}')
    else:
        rec('資材注文の保存の日付', '#130', False, f'createMat HTTP {ok[0]}', blocked=True)
    alt = {'cond': {'def': 'M013', 'alt': 'M014', 'found': '2026/10/05', 'from': '2026/10/06', 'to': '2026/11/31', 'scope': 'all', 'lot': '', 'reason': 'QC検証'},
           'm': {'comp': 'order', 'when': 'next', 'whenDate': '', 'swap': 'swap', 'lotAct': 'return'}, 'off': {}, 'rowWhen': {}, 'createPo': False}
    st, j = a.o('menu', 'applyAlt', {'alt': alt, 'notify': False})
    rec('代替品設定の対象期間の終わり 2026/11/31→止まる', '#130', st == 400, f'HTTP {st} {msg(st, j)[:100]}')
    base.post('/api/dev/reset')

    # 4) 月間メニュー CSV：年月が取込先と違う行は「エラー」の行（#234）
    screen('月間メニュー CSV取込（年月の違い）')
    t = a.d('csv', 'template', {'entity': 'menu', 'scope': {'site': 'ops', 'target': '2026-12'}})[1]
    head, rows = t['head'], [list(r) for r in t['rows']]
    ix = {h: i for i, h in enumerate(head)}
    def preview(rs):
        o = io.StringIO(); w = csv.writer(o, lineterminator='\n'); w.writerow(head); [w.writerow(x) for x in rs]
        return a.d('csv', 'importPreview', {'entity': 'menu', 'text': o.getvalue(), 'fileName': 'ym.csv', 'scope': {'site': 'ops', 'target': '2026-12'}, 'by': 'Ad00010'})
    r1 = copy.deepcopy(rows); r1[0][ix['年月']] = '2027-01'
    st, j = preview(r1)
    first = (j.get('rows') or [{}])[0]
    rec('年月が違う行（1行だけ 2027-01）→その行は「エラー」（変更なしにならない）', '#239・#234', first.get('action') == 'エラー' and j['counts'].get('エラー', 0) >= 1, f'{j.get("counts")} {first.get("action")} {first.get("errors")}')
    rec('  └ファイル全体のエラー（E132）も出る＝取り込めない', '#239・#234', bool(j.get('fileErrors')), f'{j.get("fileErrors")}')
    rec('  └同じ年月の行はエラーにならない', '#234', all(r.get('action') != 'エラー' for r in (j.get('rows') or [])[1:]), f'{j.get("counts")}')
    st, j = preview(copy.deepcopy(rows))
    rec('全行が取込先と同じ年月→エラーなし', '#234', j['counts'].get('エラー', 0) == 0, f'{j.get("counts")}')

    # 5) 無効の商品はメニューに足せない（#232・#278）
    screen('月間メニュー（無効の商品）')
    from sec_menu import vw, data_of_menu
    from sec_product import base_pi
    m12 = vw(a, '2026-12')['menu']
    pid = a.o('general', 'saveProduct', {'data': base_pi(a, name='無効QC', nameEn='Disabled QC', jan='4900000000062')})[1]['id']
    d = base_pi(a, pid, name='無効QC', nameEn='Disabled QC', jan='4900000000062'); d['status'] = '無効'
    st, j = a.o('general', 'saveProduct', {'id': pid, 'data': d})
    if st >= 400:
        rec('無効の商品を作る準備', '#278', False, f'HTTP {st} {msg(st, j)[:120]}', blocked=True)
    else:
        st, j = a.o('menu', 'saveMenuEdit', {'ym': '2026-12', 'data': data_of_menu(m12, items=m12['items'] + [{'productId': pid, 'publishable': True}])})
        now = [x['productId'] for x in vw(a, '2026-12')['menu']['items']]
        rec('無効の商品をメニューに足す（saveMenuEdit）→止まる', '#232・#278', st >= 400 and pid not in now, f'HTTP {st} {msg(st, j)[:100]} 入っている={pid in now}')
        r2 = copy.deepcopy(rows); extra = list(r2[0]); extra[ix['品番']] = pid; extra[ix['表示順']] = '99'; r2.append(extra)
        st, j = preview(r2)
        last = (j.get('rows') or [{}])[-1]
        rec('CSV に無効の商品の行→その行はエラー', '#232・#278', last.get('action') == 'エラー', f'{last.get("action")} {last.get("errors")}')
    base.post('/api/dev/reset')

    # 6) すでに入っている無効の商品は、保存も公開も止める。外せば保存できる（#285）
    screen('月間メニュー（すでに入っている無効の商品）')
    m12 = vw(a, '2026-12')['menu']
    pid = a.o('general', 'saveProduct', {'data': base_pi(a, name='無効入りQC', nameEn='Disabled In QC', jan='4900000000079')})[1]['id']
    its = copy.deepcopy(m12['items']) + [{'productId': pid, 'publishable': True}]
    st, j = a.o('menu', 'saveMenuEdit', {'ym': '2026-12', 'data': data_of_menu(m12, items=its, corpPublish='自動公開')})
    rec('準備：有効な商品を入れて（自動公開で）保存できる', '#285', st < 400, f'HTTP {st} {msg(st, j)[:100]}')
    d = base_pi(a, pid, name='無効入りQC', nameEn='Disabled In QC', jan='4900000000079'); d['status'] = '無効'
    st, j = a.o('general', 'saveProduct', {'id': pid, 'data': d})
    rec('準備：編集中のメニューに入っている商品は無効にできる（#268）', '#268・#285', st < 400, f'HTTP {st} {msg(st, j)[:100]}')
    cur = vw(a, '2026-12')['menu']
    has = lambda: pid in [x['productId'] for x in vw(a, '2026-12')['menu']['items']]
    st, j = a.o('menu', 'saveMenuEdit', {'ym': '2026-12', 'data': data_of_menu(cur)})
    rec('無効の商品がすでに入っているメニューを保存（saveMenuEdit）→止まる・品番と「無効の商品です」を出す', '#285', st == 400 and pid in msg(st, j) and '無効の商品です' in msg(st, j), f'HTTP {st} {msg(st, j)[:140]}')
    st, j = a.d('menu', 'save', {'menuId': '2026-12', 'accountId': 'Ad00010', 'orderTo': '2026/11/20'})
    rec('  └共通データ menu.save（日付だけ直す）も止まる', '#285', st == 400 and pid in msg(st, j), f'HTTP {st} {msg(st, j)[:140]}')
    st, j = a.o('menu', 'saveMenuEdit', {'ym': '2026-12', 'data': data_of_menu(cur, corpPublish='非公開')})
    rec('  └公開ステータスを「非公開」にして保存しても止まる', '#285', st == 400 and pid in msg(st, j), f'HTTP {st} {msg(st, j)[:100]}')
    st, j = a.o('menu', 'saveMenuEdit', {'ym': '2026-12', 'data': data_of_menu(cur), 'publish': True})
    st2 = vw(a, '2026-12')['menu']['status']
    rec('  └保存して公開（手動）→止まる・公開されない', '#285', st == 400 and pid in msg(st, j) and st2 == '編集中', f'HTTP {st} {msg(st, j)[:140]} 状態={st2}')
    st, j = a.d('menu', 'publish', {'menuId': '2026-12', 'accountId': 'Ad00010'})
    rec('  └共通データ menu.publish（手動）→止まる', '#285', st == 400 and pid in msg(st, j) and '無効の商品です' in msg(st, j), f'HTTP {st} {msg(st, j)[:140]}')
    rdm = a.d('menu', 'readiness', {'menuId': '2026-12'})[1].get('missing', [])
    rec('  └公開の条件（readiness）に「無効の商品です」が出る', '#285', any(pid in x and '無効の商品です' in x for x in rdm), str(rdm)[:200])
    t = a.d('menu', 'tick', {'today': '2026/10/30'})[1]
    w = next((x for x in t.get('warned', []) if x['menuId'] == '2026-12'), None)
    rec('  └自動公開の日（条件の足りない扱い）→公開しない・警告に「無効の商品です」を出す', '#285・#276', '2026-12' not in t.get('published', []) and bool(w) and any(pid in x and '無効の商品です' in x for x in w['missing']), str(t)[:200])
    # UI：編集画面に該当の行の「無効」バッジ・保存のエラー（保存を押したあと）
    c, pg = ui_login(br, 'ops', 'Ad00010')
    try:
        pg.goto(BASE + '/ops/menu/monthly/2026-12/edit'); pg.wait_for_timeout(2500)
        row = pg.locator('.me-ptbl tr', has_text=pid)
        rec('編集画面：該当の商品の行に「無効」バッジ', '#285', row.count() == 1 and '無効' in row.first.inner_text(), f'行={row.count()}')
        pg.locator('.es-pagehead__actions button.es-btn--solid', has_text='保存').first.click(); pg.wait_for_timeout(1200)
        b = pg.inner_text('body')
        rec('  └「保存」→商品一覧の見出しの下に「{品番} は無効の商品です」＋「保存できません（1件）」・確認ダイアログは出ない', '#285・E58',
            f'{pid} は無効の商品です' in b and '保存できません' in b and pg.locator('.me-ask').count() == 0, f'エラー={f"{pid} は無効の商品です" in b} 件数表示={"保存できません" in b}')
        pg.locator('.me-ptbl tr', has_text=pid).locator("button[aria-label$='を外す']").first.click(); pg.wait_for_timeout(800)
        b = pg.inner_text('body')
        rec('  └「外す」→エラーが消える', '#285', f'{pid} は無効の商品です' not in b, '')
    except Exception as e:
        rec('編集画面の無効の商品', '#285', False, f'{type(e).__name__}: {str(e)[:150]}', blocked=True)
    finally: c.close()
    # 外す→保存できる
    cur = vw(a, '2026-12')['menu']
    st, j = a.o('menu', 'saveMenuEdit', {'ym': '2026-12', 'data': data_of_menu(cur, items=[x for x in cur['items'] if x['productId'] != pid])})
    rec('その商品を外して保存→保存できる（商品は商品マスタに残る）', '#285・#232', st < 400 and not has() and a.o('general', 'product', {'id': pid})[0] == 200, f'HTTP {st} {msg(st, j)[:100]} 入っている={has()}')
    rdm = a.d('menu', 'readiness', {'menuId': '2026-12'})[1].get('missing', [])
    rec('  └外したあとの公開の条件に「無効の商品です」は出ない', '#285', not any('無効の商品です' in x for x in rdm), str(rdm)[:160])
    base.post('/api/dev/reset')
