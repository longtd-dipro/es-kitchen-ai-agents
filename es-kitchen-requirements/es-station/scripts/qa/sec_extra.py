# -*- coding: utf-8 -*-
"""補足：代替品設定の知らせ・価格変更の確認・同時更新・締切の境界・権限なし画面"""
import copy, json
from qa_lib import *
from sec_product import base_pi, msg
from sec_order import ctxs_set_today, next_day

def run(p, ctxs):
    a = ctxs['ops_full']; base = ctxs['base']; br = ctxs['browser']
    screen('代替品設定（お客様へ知らせる）')
    alt = {'cond': {'def': 'M013', 'alt': 'M014', 'found': '2026/10/05', 'from': '2026/10/06', 'to': '2026/11/30', 'scope': 'all', 'lot': '', 'reason': 'QC検証'},
           'm': {'comp': 'order', 'when': 'next', 'whenDate': '', 'swap': 'swap', 'lotAct': 'return'}, 'off': {}, 'rowWhen': {}, 'createPo': False}
    n0 = len(a.d('notice', 'list', {})[1])
    st, j = a.o('menu', 'applyAlt', {'alt': alt, 'notify': False})
    n1 = len(a.d('notice', 'list', {})[1])
    rec('代替品設定：「お客様へ知らせる」を付けずに保存→お客様へのお知らせは作られない', '#281・#277', st < 400 and n1 == n0, f'HTTP {st} {msg(st, j)[:100]} 通知 {n0}→{n1}')
    base.post('/api/dev/reset')
    n0 = len(a.d('notice', 'list', {})[1])
    st, j = a.o('menu', 'applyAlt', {'alt': alt})
    n1 = len(a.d('notice', 'list', {})[1])
    rec('代替品設定：notify を送らない（既定）→お客様へのお知らせは作られない', '#282②（初期値は知らせない・サーバーも送られなければ知らせない）', st < 400 and n1 == n0, f'HTTP {st} {msg(st, j)[:100]} 通知 {n0}→{n1}')
    base.post('/api/dev/reset')
    n0 = len(a.d('notice', 'list', {})[1])
    st, j = a.o('menu', 'applyAlt', {'alt': alt, 'notify': True})
    n1 = len(a.d('notice', 'list', {})[1])
    rec('代替品設定：付けて保存→お知らせが作られる', '#281', st < 400 and n1 > n0, f'HTTP {st} 通知 {n0}→{n1}')
    base.post('/api/dev/reset')
    # 価格変更
    screen('商品マスタ（公開メニューの商品の価格変更・同時更新）')
    cur = a.o('general', 'product', {'id': 'M002'})[1]
    pi = base_pi(a, 'M002', name=cur['product']['name'], nameEn=cur['product']['nameEn'], jan=cur['product']['jan'], kana=cur['product']['kana'])
    pi['images'] = cur['product']['images']; pi['priceYen'] = cur['product']['priceYen'] + 10
    imp = a.o('general', 'productImpact', {'id': 'M002', 'data': pi})[1]
    rec('公開したメニューにある商品の価格を変える→保存前に「価格改定／誤りの訂正」の選択が必要と返る', 'レビューD（確認・必須）', imp.get('needPriceMode') is True, str(imp)[:240])
    st, j = a.o('general', 'saveProduct', {'id': 'M002', 'data': pi, 'baseVersion': cur['version']})
    after = a.o('general', 'product', {'id': 'M002'})[1]['product']['priceYen']
    rec('  └価格の変更方法を選ばずに保存→止まる（または保存されない）', 'レビューD', st >= 400 or after == cur['product']['priceYen'], f'HTTP {st} {msg(st, j)[:200]} 保存後の価格={after}（元{cur["product"]["priceYen"]}）')
    st, j = a.o('general', 'saveProduct', {'id': 'M002', 'data': pi, 'baseVersion': cur['version'], 'opts': {'priceMode': '価格改定', 'reason': 'QC', 'notify': False, 'confirm': True}})
    rec('  └「価格改定」を選んで保存→保存できる', 'レビューD', st < 400, f'HTTP {st} {msg(st, j)[:200]}')
    # 同時更新
    cur = a.o('general', 'product', {'id': 'M003'})[1]
    pi = base_pi(a, 'M003', name=cur['product']['name'], nameEn=cur['product']['nameEn'], jan=cur['product']['jan'], kana=cur['product']['kana']); pi['images'] = cur['product']['images']
    pi['note'] = 'QC 1'
    st1, _ = a.o('general', 'saveProduct', {'id': 'M003', 'data': pi, 'baseVersion': cur['version']})
    pi['note'] = 'QC 2'
    st2, j2 = a.o('general', 'saveProduct', {'id': 'M003', 'data': pi, 'baseVersion': cur['version']})
    rec('同じ商品を古い版で2回保存→2回目は「他のユーザーにより更新されています」(409)', 'E31', st1 < 400 and st2 == 409, f'1回目 HTTP {st1} / 2回目 HTTP {st2} {msg(st2, j2)[:120]}')
    # 削除済・無効の商品はメニューに入れられない
    screen('月間メニュー（商品の選択）')
    from sec_menu import data_of_menu, vw
    pd = a.o('general', 'saveProduct', {'data': base_pi(a, name='削除予定', nameEn='To delete', jan='4900000000048')})[1]['id']
    a.o('general', 'deleteRow', {'key': 'product', 'uid': pd})
    m = vw(a, '2026-12')['menu']
    st, j = a.o('menu', 'saveMenuEdit', {'ym': '2026-12', 'data': data_of_menu(m, items=m['items'] + [{'productId': pd}])})
    rec('削除済の商品をメニューに入れる→止まる', '#232（メニュー作成の商品選択には出さない）', st == 400 and '削除済' in msg(st, j), f'HTTP {st} {msg(st, j)[:150]}')
    pn = a.o('general', 'saveProduct', {'data': base_pi(a, name='無効予定', nameEn='To disable', jan='4900000000055')})[1]['id']
    d = base_pi(a, pn, name='無効予定', nameEn='To disable', jan='4900000000055'); d['status'] = '無効'
    a.o('general', 'saveProduct', {'id': pn, 'data': d})
    st, j = a.o('menu', 'saveMenuEdit', {'ym': '2026-12', 'data': data_of_menu(m, items=m['items'] + [{'productId': pn}])})
    rec('無効の商品をメニューに入れる→止まる（商品選択には出さない）', '#232・#278', st >= 400, f'HTTP {st} {msg(st, j)[:150]} 入っている={pn in [x["productId"] for x in vw(a, "2026-12")["menu"]["items"]]}')
    c, pg = ui_login(br, 'ops', 'Ad00010')
    try:
        pg.goto(BASE + '/ops/menu/monthly/2026-12/edit'); pg.wait_for_timeout(3000)
        pg.get_by_role('button', name='商品追加').first.click(); pg.wait_for_timeout(1500)
        db = pg.locator('[role=dialog]').first.inner_text() if pg.locator('[role=dialog]').count() else pg.inner_text('body')
        rec('商品追加のダイアログに削除済・無効の商品が出ない', '#232・#278', '削除予定' not in db and '無効予定' not in db, f'削除予定={"削除予定" in db} 無効予定={"無効予定" in db}（先頭の候補が出るかも確認: {"M0" in db}）')
    except Exception as e:
        rec('商品追加ダイアログ', '#232', False, f'{type(e).__name__}: {str(e)[:150]}', blocked=True)
    finally: c.close()
    base.post('/api/dev/reset')
    # 受付締切の境界（法人Web 登録）
    screen('法人Web 商品注文（締切の境界）')
    o = [x for x in a.o('menu', 'orders', {'ym': '2026-11'})[1] if x['site'] == 'CU00871'][0]
    ca = Api(p, 'corp', 'CU00871')
    def reg(day):
        base.post('/api/dev/reset'); ctxs_set_today(base, ''); ctxs_set_today(base, day)
        cur = [x for x in a.o('menu', 'orders', {'ym': '2026-11'})[1] if x['site'] == 'CU00871'][0]
        q = copy.deepcopy(cur['q'])
        ks = [(pid, k) for pid, v in q.items() for k, n in v.items() if n > 0]
        (p1, k1), (p2, k2) = ks[0], next(x for x in ks[1:] if x[1] == ks[0][1])
        q[p1][k1] -= 1; q[p2][k2] += 1
        return ca.o('corp-order', 'registerOrder', {'acc': {'corpId': 'CU00001', 'branchId': 'CU00871', 'role': 'branch'}, 'site': 'CU00871', 'q': q})
    for day, ok in (('2026/10/15', True), ('2026/10/16', False)):
        st, j = reg(day)
        rec(f'法人が注文を登録：today={day}（締切日 2026/10/15 の{"当日" if ok else "翌日"}）→{"できる" if ok else "止まる（受付期間の外）"}', '締切後ロック・レビューD（締切日の当日／翌日）', (st < 400) == ok, f'HTTP {st} {msg(st, j)[:140]}')
    base.post('/api/dev/reset'); ctxs_set_today(base, '')
    # 権限なし画面
    screen('権限なし画面（直接 URL）')
    cases = [('Ad00013', '/ops/masters/products/new', '閲覧のみ'), ('Ad00013', '/ops/menu/monthly/2026-12/edit', '閲覧のみ'), ('Ad00013', '/ops/menu/materials/new', '閲覧のみ'),
             ('Ad00011', '/ops/masters/products/new', '物流'), ('Ad00011', '/ops/menu/monthly/2026-12/edit', '物流'), ('Ad00021', '/ops/menu/orders', '倉庫スタッフ'),
             ('Ad00002', '/ops/menu/monthly/2026-12/edit', 'CS'), ('Ad00002', '/ops/menu/materials/new', 'CS（資材の登録は orders 作成権限）')]
    for who, url, lab in cases:
        c, pg = ui_login(br, 'ops', who)
        try:
            pg.goto(BASE + url); pg.wait_for_timeout(2500)
            b = pg.inner_text('body')
            allowed = {'Ad00002': {'/ops/menu/materials/new'}}.get(who, set())
            msg_ = 'この画面を見る権限がありません' in b
            rec(f'{lab}（{who}）が {url} を直接開く→「この画面を見る権限がありません」', '#273④・台帳K', msg_ or url in allowed, f'表示先={pg.url.replace(BASE, "")} 権限メッセージ={msg_}')
        except Exception as e:
            rec(f'{lab} {url}', '#265④', False, f'{e}'[:150], blocked=True)
        finally: c.close()
