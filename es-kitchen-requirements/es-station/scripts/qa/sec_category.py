# -*- coding: utf-8 -*-
"""商品カテゴリ管理（#233・#257・#274）"""
from qa_lib import *
from sec_product import base_pi, msg, save_new

def run(p, ctxs):
    a = ctxs['ops_full']; cs = ctxs['ops_cs']
    screen('商品カテゴリ管理')
    cats = a.o('menu', 'cats')[1]
    rec('初期データ7つ・名前が「サラダ・果物」「飲料・甘味」', '#257', [c['name'] for c in cats] == ['肉', '魚', '惣菜', '主食', '汁物', 'サラダ・果物', '飲料・甘味'], str([c['name'] for c in cats]))
    n = len(cats)
    def draft(**kw):
        d = {'id': '', 'name': 'QC新カテゴリ', 'order': n + 1, 'note': '', 'img': 'photo:1'}; d.update(kw); return d
    def save(d): return a.o('menu', 'saveCat', {'d': d})
    st, j = save(draft(name='あ' * 60)); rec('カテゴリ名 60文字→登録できる', '#274', st < 400, f'HTTP {st} {msg(st, j)}')
    st, j = save(draft(name='あ' * 61, order=n + 2)); rec('カテゴリ名 61文字→止まる', '#274', st == 400 and '60文字' in msg(st, j), f'HTTP {st} {msg(st, j)}')
    st, j = save(draft(name='肉😀')); rec('カテゴリ名に絵文字→止まる', '#274', st == 400 and '絵文字' in msg(st, j), f'HTTP {st} {msg(st, j)}')
    st, j = save(draft(name='肉')); rec('カテゴリ名 重複→止まる', '#274', st == 400 and '既に登録' in msg(st, j), f'HTTP {st} {msg(st, j)}')
    st, j = save(draft(img='')); rec('カテゴリ画像なし→必須で止まる', '#274', st == 400 and '画像' in msg(st, j), f'HTTP {st} {msg(st, j)}')
    st, j = save(draft(note='い' * 501, name='備考長')); rec('備考501文字→止まる', '#274', st == 400, f'HTTP {st} {msg(st, j)}')
    st, j = save(draft(order=0, name='順0')); rec('表示順 0→範囲エラー', '#274', st == 400 and '範囲' in msg(st, j), f'HTTP {st} {msg(st, j)}')
    cats = a.o('menu', 'cats')[1]; newc = next(c for c in cats if c['name'] == 'あ' * 60)
    st, j = save(draft(name='QC順位', order=len(cats) + 2)); rec('表示順 最大+2→範囲エラー', '#274', st == 400, f'HTTP {st} {msg(st, j)}')
    # 名前の変更で商品が外れない
    pid = 'M001'; before = a.o('general', 'product', {'id': pid})[1]['product']
    c1 = next(c for c in cats if c['id'] == before['categoryId'])
    st, j = save(dict(c1, name='肉・改'))
    after = a.o('general', 'product', {'id': pid})[1]['product']
    rec('カテゴリ名を変更→商品の categoryId はそのまま（外れない）・名前の写しは新名', '#233', st < 400 and after['categoryId'] == before['categoryId'] and after['category'] == '肉・改', f'before={before["categoryId"]}/{before["category"]} after={after["categoryId"]}/{after["category"]} HTTP {st}')
    ms = a.o('general', 'productMasters')[1]['categories']
    rec('  └商品マスタの選択肢にも新名が出る（IDは同じ）', '#233', any(c['id'] == c1['id'] and c['name'] == '肉・改' for c in ms), str(ms[:2]))
    # 削除
    st, j = a.o('menu', 'deleteCat', {'id': c1['id']}); rec('登録商品があるカテゴリを削除→止まる(409)', '#274', st == 409 and '登録商品' in msg(st, j), f'HTTP {st} {msg(st, j)}')
    st, j = a.o('menu', 'deleteCat', {'id': newc['id']}); rec('登録商品が0件のカテゴリを削除→できる', '#274', st < 400, f'HTTP {st} {msg(st, j)}')
    # 削除済商品だけが持つカテゴリは削除できる／カテゴリは残る
    st, jj = save(draft(name='削除済商品用', order=len(a.o('menu','cats')[1]) + 1))
    cid = next(c['id'] for c in a.o('menu', 'cats')[1] if c['name'] == '削除済商品用')
    r = a.o('general', 'saveProduct', {'data': base_pi(a, name='削除済カテゴリ商品', nameEn='Del cat item', categoryId=cid, category='削除済商品用')})
    st2, j2 = a.o('general', 'saveProduct', {'data': base_pi(a, name='削除済カテゴリ商品', nameEn='Del cat item2', categoryId=cid, category='削除済商品用')}) if r[0] >= 400 else r
    pid2 = j2.get('id')
    st, j = a.o('menu', 'deleteCat', {'id': cid}); rec('カテゴリに有効な商品1件→削除できない', '#274', st == 409, f'HTTP {st} {msg(st, j)}')
    a.o('general', 'deleteRow', {'key': 'product', 'uid': pid2})
    st, j = a.o('menu', 'deleteCat', {'id': cid})
    rec('その商品を削除（論理）したあと、カテゴリは削除できる（削除済は数えない）', '#274', st < 400, f'HTTP {st} {msg(st, j)}')
    prod_after = a.o('general', 'genList', {'key': 'product'})[1]
    row = [x for x in prod_after if x.get('id') == pid2]
    rec('  └削除済の商品が持つカテゴリはそのまま残る（商品の categoryId が消えない）', '#274', bool(row) and row[0].get('status') == '削除済', f'{row[:1]}')
    # 権限
    st, j = cs.o('menu', 'saveCat', {'d': draft(name='CS追加', order=3)}); rec('CS がカテゴリを登録→403', '#273④・台帳K', st == 403, f'HTTP {st}')
    st, j = cs.o('menu', 'deleteCat', {'id': cats[0]['id']}); rec('CS がカテゴリを削除→403', '#273④', st == 403, f'HTTP {st}')
    # CSV
    head = a.d('csv', 'template', {'entity': 'categories'})[1]
    rec('カテゴリCSVテンプレートが取れる', '#274', bool(head.get('head')), str(head.get('head')))
    # UI：権限なし画面
    br = ctxs['browser']; c, pg = ui_login(br, 'ops', 'Ad00002')
    try:
        pg.goto(BASE + '/ops/masters/products/new'); pg.wait_for_timeout(2500)
        b = pg.inner_text('body')
        rec('CS が /ops/masters/products/new を直接開く→「この画面を見る権限がありません」', '#273④', 'この画面を見る権限がありません' in b, b[-200:].replace('\n', ' '))
        pg.goto(BASE + '/ops/masters/products/import'); pg.wait_for_timeout(2000)
        rec('CS が商品CSV取込の URL を直接開く→権限なし', '#273④', 'この画面を見る権限がありません' in pg.inner_text('body'), f'開いた URL /ops/masters/products/import → 実際の表示先 {pg.url.replace(BASE, "")}（商品一覧に黙って戻され、「この画面を見る権限がありません」は出ない）')
        pg.goto(BASE + '/ops/masters/products/M001/edit'); pg.wait_for_timeout(2000)
        rec('CS が商品編集の URL を直接開く→権限なし', '#273④', 'この画面を見る権限がありません' in pg.inner_text('body'), '')
    finally:
        c.close()
