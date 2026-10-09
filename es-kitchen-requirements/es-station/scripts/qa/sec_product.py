# -*- coding: utf-8 -*-
"""商品マスタ・商品カテゴリ（受付簿 #231〜#236・#243・#257・#267・#268・#273・#274・#278・#279）"""
import copy, csv, io, json, os
from qa_lib import *

DROP = ['id', 'status', 'temp', 'vmFrame', 'supplierId']

def base_pi(a, src='M001', **over):
    p = a.o('general', 'product', {'id': src})[1]['product']
    pi = {k: copy.deepcopy(v) for k, v in p.items() if k not in DROP}
    pi['images'] = []; pi['tags'] = []; pi['jan'] = ''
    pi['suppliers'][0].pop('nextCost', None)
    pi['name'] = 'QC検証商品'; pi['nameEn'] = 'QC Test Item'; pi['mgmtName'] = ''; pi['supplierItemName'] = ''
    pi.update(over)
    return pi

def msg(st, j):
    return err_of(st, j) if st >= 400 else ''

def csv_text(head, rows):
    o = io.StringIO(); w = csv.writer(o, lineterminator='\n'); w.writerow(head)
    for r in rows: w.writerow(r)
    return o.getvalue()

def run(p, ctxs):
    a = ctxs['ops_full']; cs = ctxs['ops_cs']
    created = []
    def save(pi, id=None, **kw):
        st, j = a.o('general', 'saveProduct', dict({'id': id, 'data': pi}, **kw))
        if st < 400 and not id: created.append(j['id'])
        return st, j
    def must_err(label, dec, pi, want, id=None):
        st, j = save(pi, id)
        m = msg(st, j)
        rec(label, dec, st == 400 and want in m, f'HTTP {st} / {m or json.dumps(j, ensure_ascii=False)[:200]}')
        if st < 400 and not id: created.append(j.get('id'))
    def must_ok(label, dec, pi, id=None):
        st, j = save(pi, id)
        rec(label, dec, st < 400, f'HTTP {st} / {msg(st, j) or ""}')
        return j if st < 400 else None

    screen('商品マスタ（新規・編集）')
    must_ok('商品名（日本語）60文字ちょうど→登録できる', '#236・Q-H8（文字数60）', base_pi(a, name='あ' * 60, nameEn='Name60'))
    must_err('商品名（日本語）61文字→「60文字以内」で止まる', '#236・Q-H8', base_pi(a, name='あ' * 61), '60文字以内')
    must_err('商品名（日本語）に絵文字→E13', '#236・Q-H8', base_pi(a, name='唐揚げ😀'), '絵文字は使えません')
    must_err('商品名（日本語）が空→必須', '#235', base_pi(a, name='  '), '必須')
    must_err('商品名（英語）が空→必須', '#235・#267', base_pi(a, nameEn=''), '必須')
    must_err('商品名（英語）に日本語→半角で入力', '#235', base_pi(a, nameEn='からあげ'), '半角')
    must_ok('商品名（英語）60文字ちょうど→登録できる', '#235（60文字）', base_pi(a, nameEn='E' * 60, name='英語60'))
    must_err('商品名（英語）61文字→止まる', '#235（60文字）', base_pi(a, nameEn='E' * 61, name='英語61'), '60文字以内')
    must_err('商品名（英語）に絵文字→止まる', '#235', base_pi(a, nameEn='Fried 🍗'), '絵文字')
    must_ok('商品名カナを空→登録できる（カナ任意）', '#236 Q-H1', base_pi(a, kana='', name='カナなし', nameEn='No kana'))
    must_err('商品名カナにひらがな→全角カタカナのエラー', '#236 Q-H1', base_pi(a, kana='からあげ'), '全角カタカナ')
    # JAN
    for n, ok in [(7, False), (8, True), (13, True), (14, False)]:
        jan = ''.join(str((i * 7 + 3) % 10) for i in range(n))
        if n == 8: jan = '12345678'
        if n == 13: jan = '4912345678904'
        pi = base_pi(a, jan=jan, name=f'JAN{n}', nameEn=f'Jan {n}')
        if ok: must_ok(f'JAN {n}桁→登録できる', '#273・RD-MN-069（8〜13桁）', pi)
        else: must_err(f'JAN {n}桁→「8〜13桁」', '#273・RD-MN-069', pi, '8〜13桁')
    must_err('JAN 全角数字→止まる', '#273', base_pi(a, jan='１２３４５６７８'), '8〜13桁')
    must_err('JAN 既存商品と重複→止まる', '#273③', base_pi(a, jan='4580804660014', name='JAN重複', nameEn='Jan dup'), 'JANコードは既に登録')
    # 数値
    for lab, pi, want in [
        ('販売価格 999,999,999→登録できる', base_pi(a, priceYen=999_999_999, name='価格上限', nameEn='Price max'), None),
        ('販売価格 1,000,000,000→範囲エラー', base_pi(a, priceYen=1_000_000_000), '範囲'),
        ('販売価格 -1→範囲エラー', base_pi(a, priceYen=-1), '範囲'),
        ('販売価格 1.5（小数）→範囲エラー', base_pi(a, priceYen=1.5), '範囲'),
    ]:
        (must_ok(lab, '#236 Q-H8（数値の上限）', pi) if want is None else must_err(lab, '#236 Q-H8（数値の上限）', pi, want))
    def nut(k, v):
        pi = base_pi(a, name=f'栄養{k}{v}', nameEn=f'Nut {k}{v}'); pi['nutrition']['per100g'][k] = v; return pi
    must_ok('栄養 エネルギー 9999.9→登録できる', '#236 Q-H8', nut('kcal', 9999.9))
    must_err('栄養 エネルギー 10000→範囲エラー', '#236 Q-H8', nut('kcal', 10000), '範囲')
    must_err('栄養 エネルギー 0.05（小数2桁）→範囲エラー', '#236 Q-H8', nut('kcal', 0.05), '範囲')
    must_err('栄養 1食当たり内容量 0→範囲エラー（1以上）', '#236 Q-H8', nut('servingG', 0), '範囲')
    def sup(**kw):
        pi = base_pi(a, name='仕入' + str(kw)[:20], nameEn='Sup ' + str(abs(hash(str(kw))))[:6]); pi['suppliers'][0].update(kw); return pi
    must_ok('ロット 9999→登録できる', '#236 Q-H8', sup(lot=9999))
    must_err('ロット 10000→範囲エラー', '#236 Q-H8', sup(lot=10000), '範囲')
    must_err('ロット 0→範囲エラー', '#273①', sup(lot=0), '範囲')
    must_err('仕入単価 空（NaN→null）→必須', '#273①', sup(unitCostYen=None), '必須')
    must_err('仕入先 未選択→選択してください', '#273①', sup(supplierId=''), '選択')
    pi = base_pi(a, name='仕入先なし', nameEn='No supplier'); pi['suppliers'] = []
    must_err('仕入先の行が0行→必須（1社以上必須）', '#273①・#286', pi, '選択')
    pi = base_pi(a, name='仕入先2', nameEn='Two suppliers'); pi['suppliers'] = [pi['suppliers'][0], dict(pi['suppliers'][0], supplierId='SP00002', selected=False)]
    j = must_ok('仕入先2行を送る→2行とも保存（複数の仕入先）', '#286', pi)
    if j:
        s = a.o('general', 'product', {'id': j['id']})[1]['product']['suppliers']
        rec('  └保存後の仕入先の行数＝2・選択中は1社だけ', '#286', len(s) == 2 and sum(1 for x in s if x.get('selected')) == 1, f'suppliers={len(s)} selected={[x.get("selected") for x in s]}')
    pi = base_pi(a, name='仕入先同じ', nameEn='Same supplier'); pi['suppliers'] = [pi['suppliers'][0], dict(pi['suppliers'][0], selected=False)]
    must_err('同じ仕入先を2行→「同じ仕入先は2行に入力できません」（E246）', '#286', pi, '同じ仕入先')
    def sl(v, unit):
        pi = base_pi(a, name=f'期限{v}{unit}', nameEn=f'Shelf {v} {"d" if unit == "日" else "m"}'); pi['shelfLife'].update(esValue=v, esUnit=unit); return pi
    must_ok('ESの期限 999日→登録できる', '#236 Q-H8', sl(999, '日'))
    must_err('ESの期限 1000日→範囲エラー', '#236 Q-H8', sl(1000, '日'), '範囲')
    must_ok('ESの期限 99ヶ月→登録できる', '#236 Q-H8', sl(99, 'ヶ月'))
    must_err('ESの期限 100ヶ月→範囲エラー', '#236 Q-H8', sl(100, 'ヶ月'), '範囲')
    must_err('商品解説 501文字→止まる', '#236', base_pi(a, description='あ' * 501), '500文字')
    must_err('商品解説が空→必須', '#273', base_pi(a, description=''), '必須')
    pi = base_pi(a); pi['allergens']['specific'] = []
    must_err('特定原材料 未選択→選択してください（ないときは「なし」）', '台帳F・#273', pi, '選択')
    pi = base_pi(a); pi['allergens']['specific'] = ['なし', '小麦']
    must_err('特定原材料「なし」＋小麦→止まる', '台帳F', pi, 'なし')
    must_err('製造元URL 不正→URL形式エラー', '#236 Q-H9', base_pi(a, makerUrl='ftp://x'), 'URL')
    must_err('商品写真 6枚→5枚まで', '#236 Q-H7', base_pi(a, images=[{'file': f'p{i}.jpg', 'main': i == 0} for i in range(6)]), '5枚')
    must_err('カテゴリ 存在しないID→選択してください', '#233', base_pi(a, categoryId='CAT99999'), 'カテゴリ')
    pi = base_pi(a); pi['pickWarehouseIds'] = []
    must_err('ピッキング倉庫 0件→選択してください', '#273②', pi, '選択')
    pi = base_pi(a); pi['courses'] = []
    must_err('コース 0件→選択してください', '#273②', pi, '選択')
    pi = base_pi(a, name='N' * 5, nameEn='tag test'); pi['tags'] = ['NEW']
    must_ok('商品タグ NEW を付けて登録', '#243', pi)

    # 英語名（既存商品の保存で入れさせる）
    st, j = a.o('general', 'product', {'id': 'M001'}); ver = j['version']
    pi = base_pi(a, 'M001', name='牛肉とごぼうの甘辛煮', nameEn='', kana='ギュウニクトゴボウノアマカラニ', jan='4580804660014'); pi['images'] = j['product']['images']
    st, jj = a.o('general', 'saveProduct', {'id': 'M001', 'data': pi, 'baseVersion': ver})
    rec('既存商品M001の英語名を空にして保存→必須で止まる', '#267', st == 400 and '必須' in msg(st, jj), f'HTTP {st} {msg(st, jj)}')

    # 権限
    screen('商品マスタ（権限なし）')
    st, j = cs.o('general', 'saveProduct', {'data': base_pi(a, name='CS登録', nameEn='CS add')})
    rec('CS（Ad00002）が商品を新規登録→権限なし(403)', '#273④・台帳K', st == 403, f'HTTP {st} {msg(st, j)}')
    st, j = cs.d('csv', 'importPreview', {'entity': 'products', 'text': 'x', 'fileName': 'x.csv', 'by': 'Ad00002'})
    rec('CS が商品CSV取込の確認を呼ぶ→権限なし(403)', '#273④', st == 403, f'HTTP {st} {msg(st, j)}')
    viewer = ctxs.get('ops_viewer')
    if viewer:
        st, j = viewer.o('general', 'saveProduct', {'data': base_pi(a, name='閲覧登録', nameEn='viewer add')})
        rec('閲覧のみ（Ad00013）が商品を登録→403', '台帳K', st == 403, f'HTTP {st} {msg(st, j)}')
    run_rules(p, ctxs)
    return created


def run_rules(p, ctxs):
    a = ctxs['ops_full']; base = ctxs['base']; br = ctxs['browser']
    screen('商品マスタ（削除・無効・論理削除）')
    st, ms = a.d('master', 'list', {'kind': 'products'})
    ids = [x['id'] for x in ms]
    blk = {i: a.o('general', 'productBlockers', {'id': i})[1] for i in ids}
    in_menu = [i for i in ids if blk[i]['menus']]
    stock_only = [i for i in ids if not blk[i]['menus'] and blk[i]['stock']]
    free = [i for i in ids if not blk[i]['menus'] and not blk[i]['stock']]
    m12 = [x['productId'] for x in a.d('menu', 'get', {'menuId': '2026-12'})[1]['menu']['items']]
    draft_only = [i for i in free if i in m12]
    print('  商品:', len(ids), '有効メニュー内', len(in_menu), '在庫のみ', len(stock_only), '無制約', len(free), '編集中メニューのみ', len(draft_only))
    # 有効なメニューにある商品（削除・無効）
    if in_menu:
        i = in_menu[0]
        st, j = a.o('general', 'deleteRow', {'key': 'product', 'uid': i})
        rec(f'有効なメニューに入っている商品 {i} を削除→止まる(409)', '#232・#268', st == 409 and '削除できません' in msg(st, j), f'HTTP {st} {msg(st, j)[:200]}')
        pi = base_pi(a, i); pi['status'] = '無効'
        st, j = a.o('general', 'saveProduct', {'id': i, 'data': pi})
        rec(f'有効なメニューに入っている商品 {i} を編集の状態欄で無効に→止まる(409)', '#232・#268・#278', st == 409 and '無効にできません' in msg(st, j), f'HTTP {st} {msg(st, j)[:200]}')
        # ステータス別：締切済・配送中・公開中のメニューのどれでも止まるか
        for ym, stt in [('2026-11', '公開中'), ('2026-10', '締切済'), ('2026-09', '配送中')]:
            items = [x['productId'] for x in a.d('menu', 'get', {'menuId': ym})[1]['menu']['items']]
            cand = [x for x in items if ym in blk[x]['menus'] and x != i]
            if cand:
                st, j = a.o('general', 'deleteRow', {'key': 'product', 'uid': cand[0]})
                rec(f'{stt}メニュー（{ym}）の商品 {cand[0]} を削除→止まる(409)', '#268（有効なメニュー＝公開中・締切済・配送中）', st == 409, f'HTTP {st} {msg(st, j)[:160]}')
    if stock_only:
        i = stock_only[0]
        st, j = a.o('general', 'deleteRow', {'key': 'product', 'uid': i})
        rec(f'メニューにないが在庫がある商品 {i}（{blk[i]["stock"][0]}）を削除→止まる(409)', '#232・#268（在庫＝倉庫または拠点が1以上）', st == 409, f'HTTP {st} {msg(st, j)[:160]}')
        pi = base_pi(a, i); pi['status'] = '無効'
        st, j = a.o('general', 'saveProduct', {'id': i, 'data': pi})
        rec(f'在庫がある商品 {i} を無効に→止まる(409)', '#268', st == 409, f'HTTP {st} {msg(st, j)[:160]}')
    else:
        rec('在庫のみ（メニュー外）の商品で削除・無効を確認', '#268', False, '見本に該当商品がない', blocked=True)
    # 編集中メニューだけにある商品は削除できる（#268：編集中は含めない）
    if draft_only:
        i = draft_only[0]
        pi = base_pi(a, i); pi['status'] = '無効'
        st, j = a.o('general', 'saveProduct', {'id': i, 'data': pi})
        rec(f'編集中メニュー（2026-12）にだけある商品 {i} を無効に→できる（編集中は含めない）', '#268', st < 400, f'HTTP {st} {msg(st, j)[:160]}')
        pi['status'] = '有効'
        st, j = a.o('general', 'saveProduct', {'id': i, 'data': pi})
        rec(f'  └有効に戻す→できる', '#278', st < 400, f'HTTP {st} {msg(st, j)[:160]}')
    # （見本には該当商品がないので、編集中メニューだけの商品は sec_menu で新規作成して確認する）
    # 無制約の商品を新規登録して論理削除
    j = save_new(a, name='削除テスト商品', nameEn='Delete Test', jan='4900000000017')
    nid = j['id']
    st, jj = a.o('general', 'deleteRow', {'key': 'product', 'uid': nid})
    rec(f'どのメニューにも在庫にもない商品 {nid} を削除→できる', '#232', st < 400, f'HTTP {st} {msg(st, jj)[:160]}')
    st, jj = a.d('master', 'list', {'kind': 'products'})
    row = next((x for x in jj if x['id'] == nid), None)
    rec('  └削除後も商品データは残り、状態＝削除済（論理削除）', '#232', bool(row) and row.get('status') == '削除済', f'status={row and row.get("status")}')
    st, jj = a.o('general', 'product', {'id': nid})
    rec('  └削除済の商品の詳細→開けない（null）', '#232', st == 200 and jj is None, f'HTTP {st} {str(jj)[:80]}')
    st, jj = a.o('general', 'genList', {'key': 'product'})
    r2 = [x for x in jj if x.get('_uid') == nid or x.get('id') == nid] if isinstance(jj, list) else []
    rec('  └一覧データに削除済の行が含まれる（状態で絞り込める）', '#232', bool(r2) and r2[0].get('status') == '削除済', f'{r2[:1]}')
    j2 = save_new(a, name='JAN再利用', nameEn='Jan reuse', jan='4900000000017')
    rec('  └削除済の商品の JAN を新しい商品で使える', '#273③', bool(j2) and 'id' in j2, f'{j2}')
    # 商品タグ
    st, j = a.o('general', 'addProductTag', {'name': 'T' * 60})
    rec('商品タグ名 60文字→追加できる', '#243', st < 400, f'HTTP {st} {msg(st, j)[:120]}')
    st, j = a.o('general', 'addProductTag', {'name': 'T' * 61})
    rec('商品タグ名 61文字→止まる', '#243', st == 400, f'HTTP {st} {msg(st, j)[:120]}')
    st, tg = a.o('general', 'productMasters')
    n0 = len(tg['tags'])
    ok = 0
    for k in range(25):
        st, j = a.o('general', 'addProductTag', {'name': f'QCタグ{k}'})
        if st < 400: ok += 1
        else: last = msg(st, j); break
    cur = len(a.o('general', 'productMasters')[1]['tags'])
    rec(f'商品タグ 20個まで（現在{n0}個→追加を続けて21個目で止まる）', '#243（20個まで）', cur == 20, f'追加後のタグ数={cur}（20で止まるはず）')
    cs = ctxs['ops_cs']
    st, j = cs.o('general', 'addProductTag', {'name': 'CSタグ'})
    rec('CS が商品タグを追加→権限なし(403)', '#243（商品マスタの権限がある人だけ）', st == 403, f'HTTP {st}')
    # カナ・CSV
    csv_rules(a, ctxs)
    ui_products(p, ctxs)

def save_new(a, **kw):
    st, j = a.o('general', 'saveProduct', {'data': base_pi(a, **kw)})
    return j if st < 400 else {'error': err_of(st, j)}

def csv_rules(a, ctxs):
    screen('商品マスタ CSV取込（行ごと）')
    head_full = a.d('csv', 'template', {'entity': 'products'})[1]['head']
    ex = a.d('csv', 'export', {'entity': 'products', 'keys': ['M002']})[1]
    head, row = ex['head'], ex['rows'][0]
    idx = {h.split('【')[0]: i for i, h in enumerate(head)}
    def mk(**ch):
        r = list(row); 
        for k, v in ch.items(): r[idx[k.replace('_', '（', 0)]] = v
        return r
    def rowof(**ch):
        r = list(row)
        for k, v in ch.items(): r[idx[k]] = v
        return r
    def prev(rows, name='x.csv', text=None):
        t = text if text is not None else csv_text(head, rows)
        st, j = a.d('csv', 'importPreview', {'entity': 'products', 'text': t, 'fileName': name, 'by': 'Ad00010'})
        return st, j
    # 品番空＝新規、既存品番＝更新、削除済の品番、マスタにない値
    new_ok = rowof(品番='', 商品名='CSV新規', **{'商品名（英語）': 'Csv New', 'JANコード': ''})
    st, j = prev([new_ok])
    rec('CSV 品番が空の行→新規として確認できる', '#236 Q-H10・#273', st == 200 and j['counts'].get('新規') == 1 and j['counts'].get('エラー') == 0, f'{j.get("counts")} {j.get("fileErrors")} {[r for r in j.get("rows", [])][:1]}')
    st, j = prev([rowof(商品名='CSV更新後の名前')])
    rec('CSV 既存の品番で商品名を変える→更新（商品名もCSVで直せる）', '#236 Q-H10', st == 200 and j['counts'].get('更新') == 1, f'{j.get("counts")}')
    st, j = prev([rowof(品番='M999')])
    rec('CSV 存在しない品番（M999）→エラー行', '#236', st == 200 and j['counts'].get('エラー') == 1, f'{j.get("counts")} {str(j.get("rows"))[:200]}')
    st, j = prev([rowof(カテゴリ='存在しないカテゴリ')])
    rec('CSV カテゴリがマスタにない値→エラー行', '#233・#236', st == 200 and j['counts'].get('エラー') == 1, f'{j.get("counts")} {str(j.get("rows"))[:200]}')
    st, j = prev([rowof(品番='', 商品名='英語なし新規', JANコード='', **{'商品名（英語）': ''})])
    rec('CSV 新規行で英語名が空→エラー行（必須）', '#235・#267', st == 200 and j['counts'].get('エラー') == 1, f'{j.get("counts")} {str(j.get("rows"))[:200]}')
    st, j = prev([rowof(商品名='あ' * 61)])
    rec('CSV 商品名61文字→エラー行', '#236', st == 200 and j['counts'].get('エラー') == 1, f'{j.get("counts")}')
    st, j = prev([rowof(商品名='あ' * 60)])
    rec('CSV 商品名60文字→エラーなし', '#236', st == 200 and j['counts'].get('エラー') == 0, f'{j.get("counts")}')
    # 行ごと：1行エラー＋1行OK
    def rowfor(pid, **ch):
        r = list(a.d('csv', 'export', {'entity': 'products', 'keys': [pid]})[1]['rows'][0])
        for k, v in ch.items(): r[idx[k]] = v
        return r
    good = rowfor('M003', 商品名='行ごと確認')
    bad = rowfor('M004', カテゴリ='存在しないカテゴリ')
    st, j = prev([good, bad])
    counts = j.get('counts', {})
    rec('CSV エラー行あり（1行OK＋1行NG）→確認画面で更新1・エラー1と数える', '#239・#248（行ごとに取り込む）', counts.get('更新') == 1 and counts.get('エラー') == 1, f'{counts} {str(j.get("rows"))[:400]}')
    tok = j.get('token')
    st, j2 = a.d('csv', 'importCommit', {'entity': 'products', 'token': tok, 'ack': True})
    committed = j2 if st == 200 else {}
    after = {x['id']: x for x in a.d('master', 'list', {'kind': 'products'})[1]}
    rec('  └登録を押す→エラー行だけ取り込まず、OKの行（M003）は登録される', '#239・#248', st == 200 and after['M003']['mgmtName'] != 'xx' and '行ごと確認' in (after['M003']['name']), f'HTTP {st} {str(j2)[:240]} / M003.name={after["M003"]["name"]} / M004.nameEn={after["M004"]["nameEn"]}')
    # UTF-8以外
    sjis = csv_text(head, [good]).encode('cp932', errors='replace')
    try:
        t = sjis.decode('utf-8', errors='replace')
    except Exception: t = ''
    st, j = prev(None, text=t)
    rec('CSV UTF-8以外（Shift_JIS を文字化けで送る）→エラー（取り込めない）', '#236（UTF-8以外）', st == 200 and (j['counts'].get('エラー', 0) > 0 or j.get('fileErrors')), f'{j.get("counts")} {j.get("fileErrors")}')
    # 5001 行
    big = [rowof(品番='', 商品名=f'大量{i}', **{'商品名（英語）': f'Bulk {i}', 'JANコード': ''}) for i in range(5001)]
    st, j = prev(big)
    rec('CSV 5,001行→上限エラー（5,000行まで）', '#236（5,001行）', st == 200 and bool(j.get('fileErrors')) and j['counts'].get('新規', 0) == 0, f'HTTP {st} fileErrors={j.get("fileErrors")} counts={j.get("counts")} total={j.get("total")}')
    if not os.environ.get('QA_BIG'):
        rec('CSV 5,000行（上限ちょうど・新規行のみ）の確認（importPreview）と登録', '#236（5,001行は不可＝5,000行までは可）', False, '既定ではスキップ（dev サーバーに負荷をかけるため）。実行：QA_BIG=1 python3 scripts/qa/big_csv.py（確認・登録・更新の時間とメモリを測る。番人つき）。修正前は 5,000行で約17分・RSS 1.7GB で固まった（行ごとに重ねたデータを全件複製していた）。修正後は確認 約15秒・登録 約9秒（lib/domain/csv.ts の overlayRepo）', blocked=True)
        return
    big2 = big[:5000]
    st, j = prev(big2)
    rec('CSV 5,000行→受け付ける', '#236（5,000行）', st == 200 and not j.get('fileErrors'), f'fileErrors={j.get("fileErrors")} counts={j.get("counts")} background={j.get("background")}')
    # 公開中メニューの商品の価格は CSV で変えられない
    items = [x['productId'] for x in a.d('menu', 'get', {'menuId': '2026-11'})[1]['menu']['items']]
    pid = items[0]
    ex2 = a.d('csv', 'export', {'entity': 'products', 'keys': [pid]})[1]['rows'][0]
    r2 = list(ex2); r2[idx['販売価格（税込）']] = str(int(r2[idx['販売価格（税込）']] or 0) + 10)
    st, j = prev([r2])
    rec('CSV 公開中メニューにある商品の販売価格を変える→エラー行', 'CSV取込の画面の注意（価格は編集画面で）・レビューD', st == 200 and j['counts'].get('エラー') == 1, f'{j.get("counts")} {str(j.get("rows"))[:200]}')


def ui_products(p, ctxs):
    br = ctxs['browser']; base = ctxs['base']
    screen('商品マスタ 一覧・フォーム（UI）')
    c, pg = ui_login(br, 'ops', 'Ad00010')
    try:
        # 一覧：既定=有効のみ、削除済に切り替え
        pg.goto(BASE + '/ops/masters/products'); pg.wait_for_timeout(2500)
        sel = pg.locator('select', has=pg.locator('option', has_text='削除済')).first
        rec('一覧の状態フィルタの既定＝「有効」', '台帳F・#232', sel.input_value() in ('有効', ''), f'value={sel.input_value()!r}')
        body0 = pg.inner_text('body')
        sel.select_option(label='削除済'); pg.get_by_role('button', name='検索', exact=True).click(); pg.wait_for_timeout(800)
        body1 = pg.inner_text('body')
        rec('一覧：状態を「削除済」にすると削除済の商品（削除テスト商品）が出る', '#232', '削除テスト商品' in body1 and '削除テスト商品' not in body0, f'既定表示に含む={ "削除テスト商品" in body0 } / 削除済表示に含む={ "削除テスト商品" in body1 }')
        # 英語名で検索はできるか（運営Webでは英語名で検索しない：#245）
        srch = pg.locator('input[placeholder*="品番・商品名"]').first
        sel.select_option(label='すべて'); srch.fill('Simmered Beef'); pg.get_by_role('button', name='検索', exact=True).click(); pg.wait_for_timeout(800)
        txt = pg.inner_text('table')
        rec('運営Web 商品マスタ：英語名「Simmered Beef」で検索しても出ない（運営は英語名で検索しない）', '#245', 'M001' not in txt, f'表に M001 {"あり" if "M001" in txt else "なし"}')
        srch.fill('牛肉とごぼう'); pg.get_by_role('button', name='検索', exact=True).click(); pg.wait_for_timeout(800)
        rec('運営Web 商品マスタ：管理名で検索すると出る', '#245', 'M001' in pg.inner_text('table'), '')
        # フォーム：入力欄の最大長
        pg.goto(BASE + '/ops/masters/products/new'); pg.wait_for_timeout(2500)
        inp = pg.locator('input[aria-label="商品名（公開名・日本語）"]')
        inp.fill('あ' * 61); v = inp.input_value()
        ml = inp.get_attribute('maxlength')
        pg.get_by_role('button', name='登録', exact=True).click(); pg.wait_for_timeout(800)
        b = pg.inner_text('body')
        rec('新規フォーム：商品名に61文字入力→入力できない(maxlength)か、保存で「60文字以内」', '#236', len(v) <= 60 or '60文字以内' in b, f'入力後の文字数={len(v)} maxlength={ml}')
        en = pg.locator('input[aria-label="商品名（公開名・英語）"]')
        en.fill(''); pg.get_by_role('button', name='登録', exact=True).click(); pg.wait_for_timeout(600)
        b = pg.inner_text('body')
        rec('新規フォーム：英語名が空で登録→「商品名（公開名・英語）は必須項目です。」', '#235', '商品名（公開名・英語）は必須項目です' in b, '該当文言なし' if '必須項目です' not in b else '')
        rec('新規フォーム：保存できないとき「保存できません（n件）」バナーが出る', 'P-FORMBOX', '保存できません' in b, '')
        en.fill('Test Nihongo あ'); pg.get_by_role('button', name='登録', exact=True).click(); pg.wait_for_timeout(500)
        rec('新規フォーム：英語名に日本語→「半角の文字で入力してください」', '#235', '半角の文字で入力してください' in pg.inner_text('body'), '')
        pg.goto(BASE + '/ops/masters/products/new'); pg.wait_for_timeout(1500)
        opts = pg.locator('select[aria-label="状態"]').count()
        rec('新規フォームに「状態」欄は出ない（編集のときだけ）', '#279', opts == 0, f'状態欄の数={opts}')
        # 編集：有効なメニューにある商品を無効→モーダル
        pg.goto(BASE + '/ops/masters/products/M001/edit'); pg.wait_for_timeout(2500)
        pg.locator('select[aria-label="状態"]').select_option('無効')
        pg.get_by_role('button', name='保存', exact=True).click(); pg.wait_for_timeout(1000)
        b = pg.inner_text('body')
        rec('編集：有効なメニューにある商品を状態欄で無効→保存で理由のモーダルが出る（保存されない）', '#268・#278', '無効にできません' in b or '有効なメニューに入っている' in b, b[b.find('有効なメニュー')-20:b.find('有効なメニュー')+100] if '有効なメニュー' in b else b[:200])
        # 詳細：削除ボタン
        pg.goto(BASE + '/ops/masters/products/M001'); pg.wait_for_timeout(2000)
        pg.get_by_role('button', name='削除').first.click(); pg.wait_for_timeout(1000)
        b = pg.inner_text('body')
        rec('詳細：削除を押す→有効なメニューにある商品は理由が出て削除できない', '#232・#268', '削除できません' in b, '')
        # 一覧に「無効にする」ボタンが無い
        pg.goto(BASE + '/ops/masters/products'); pg.wait_for_timeout(2000)
        rec('一覧に「無効にする」ボタンが無い', '#278', '無効にする' not in pg.inner_text('body'), '')
    finally:
        c.close()
