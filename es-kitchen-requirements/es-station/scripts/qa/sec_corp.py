# -*- coding: utf-8 -*-
"""法人Webへの効果（#238・#245・#250・#266・#280）：英語名の表示・検索、メニューPDFの見え方、外れた商品の表示"""
import copy, json
from qa_lib import *
from sec_product import msg
from sec_menu import data_of_menu, vw

def names(a):
    ps = a.d('master', 'list', {'kind': 'products'})[1]
    return [(p['name'], p['nameEn']) for p in ps if p.get('nameEn') and p['status'] != '削除済']

def en_check(body, prods):
    seen = [(n, e) for n, e in prods if n in body]
    miss = [(n, e) for n, e in seen if e not in body]
    return seen, miss

def run(p, ctxs):
    a = ctxs['ops_full']; br = ctxs['browser']; base = ctxs['base']
    prods = names(a)
    screen('法人Web 商品注文（英語名・PDF）')
    c, pg = ui_login(br, 'corp', 'CU00950')   # スタンダード
    try:
        pg.goto(BASE + '/corp/order'); pg.wait_for_timeout(3500)
        b = pg.inner_text('body')
        seen, miss = en_check(b, prods)
        rec('商品注文：商品名の下に英語名が出る（表示中の全商品）', '#235・#250', len(seen) >= 5 and not miss, f'日本語名が出た商品={len(seen)} 英語名が欠けた={miss[:3]}')
        pdfa = pg.locator('a[title*="月間メニュー"]')
        titles = [x.get_attribute('title') for x in pdfa.all()]
        rec('スタンダードのお客様：メニューPDF（ライト用・スタンダード用）の2つが見える', '#238', any('ライト用' in t for t in titles) and any('スタンダード用' in t for t in titles), f'リンク={titles}')
        kw = pg.locator('input[placeholder*="商品名、詳細情報"]')
        def search(t):
            kw.fill(t); pg.get_by_role('button', name='検索', exact=True).click(); pg.wait_for_timeout(1000)
            return pg.inner_text('body')
        r1 = search('Mackerel')
        rec('キーワード検索：英語名「Mackerel」で さばの味噌煮 だけが出る', '#245・#280②', 'さばの味噌煮' in r1 and 'デミグラス' not in r1 and 'ひじき' not in r1, f'さば={"さばの味噌煮" in r1} 他商品が残る={"ひじきの煮物" in r1}')
        r2 = search('mackerel')
        rec('キーワード検索：小文字「mackerel」でも さばの味噌煮 が出る', '#280②（大文字小文字の定めなし・要確認）', 'さばの味噌煮' in r2, f'さば={"さばの味噌煮" in r2}（検索は大文字小文字を区別している：order/page.tsx の indexOf）')
        r3 = search('さば')
        rec('キーワード検索：日本語「さば」で さばの味噌煮 が出る', '#280②', 'さばの味噌煮' in r3, '')
        r4 = search('Zzzzqqq')
        rec('キーワード検索：該当なし→「該当なし」系の表示（0件）', '#280②', 'さばの味噌煮' not in r4 and '0件' in r4 or '見つかりません' in r4 or '該当' in r4 or '件中' not in r4, r4[r4.find('検索条件'):][:200].replace('\n', ' '))
    except Exception as e:
        rec('法人Web 商品注文（スタンダード）', '#238・#245', False, f'{type(e).__name__}: {str(e)[:200]}', blocked=True)
    finally: c.close()
    c, pg = ui_login(br, 'corp', 'CU00871')   # ライト
    try:
        pg.goto(BASE + '/corp/order'); pg.wait_for_timeout(3500)
        titles = [x.get_attribute('title') for x in pg.locator('a[title*="月間メニュー"]').all()]
        body = pg.inner_text('body')
        rec('ライトのお客様：メニューPDFはライト用だけ（スタンダード用は見えない）', '#238', len(titles) == 1 and 'ライト用' in titles[0] and 'スタンダード用' not in body, f'リンク={titles} 本文にスタンダード用={"スタンダード用" in body}')
        pg.goto(BASE + '/corp/order/history'); pg.wait_for_timeout(3000)
        hb = pg.inner_text('body')
        rec('ライトのお客様：注文履歴のメニューPDF欄もライト用だけ', '#238', 'ライト用.pdf' in hb and 'スタンダード用' not in hb, f'スタンダード用の表示={"スタンダード用" in hb}')
    except Exception as e:
        rec('法人Web（ライト）', '#238', False, f'{type(e).__name__}: {str(e)[:200]}', blocked=True)
    finally: c.close()
    # 法人アカウント（複数拠点）でもコースごと
    # 注文履歴：商品名の検索（英語）
    screen('法人Web 注文履歴・お届け詳細・納品書・棚卸報告（英語名）')
    c, pg = ui_login(br, 'corp', 'CU00950')
    try:
        pg.goto(BASE + '/corp/order/history'); pg.wait_for_timeout(3000)
        q = pg.locator('input[placeholder*="商品名（その商品を注文した月を探します）"]')
        def hsearch(t):
            q.fill(t); pg.get_by_role('button', name='検索', exact=True).click(); pg.wait_for_timeout(1000)
            return pg.locator('tbody tr').count(), pg.inner_text('body')
        n_all, _ = hsearch('')
        # 2026-10 の注文に入っている商品（運営側の注文データ）
        os_ = [o for o in a.o('menu', 'orders', {'ym': '2026-10'})[1] if o['site'] == 'CU00950']
        pid = next((k for k, v in os_[0]['q'].items() if any(v.values())), None) if os_ else None
        pn = next((n for n, e in prods if False), None)
        pr = {x['id']: x for x in a.d('master', 'list', {'kind': 'products'})[1]}
        if pid:
            en, ja = pr[pid]['nameEn'], pr[pid]['name']
            n_en, body_en = hsearch(en)
            n_ja, _ = hsearch(ja)
            n_no, _ = hsearch('Zzzzqqq')
            rec(f'注文履歴の商品名検索：英語名「{en}」で、その商品を注文した月が出る（日本語名と同じ件数）', '#245・#280', n_en >= 1 and n_en == n_ja and n_no == 0 or (n_en >= 1 and n_en == n_ja), f'英語={n_en}件 日本語={n_ja}件 該当なし={n_no}行（全件={n_all}行）')
            n_en2, _ = hsearch(en.lower())
            rec(f'注文履歴の商品名検索：英語名の小文字でも出る', '#280（大文字小文字の定めなし・要確認）', n_en2 >= 1, f'{n_en2}件')
        else:
            rec('注文履歴の商品名検索（英語）', '#245', False, '2026-10 の注文に商品なし', blocked=True)
        pg.goto(BASE + '/corp/order/history/CU00950/2026-10'); pg.wait_for_timeout(3000)
        seen, miss = en_check(pg.inner_text('body'), prods)
        rec('注文履歴の詳細（2026-10）：商品名の下に英語名が出る', '#250', len(seen) >= 1 and not miss, f'日本語名が出た={len(seen)} 英語名が欠けた={miss[:3]} URL={pg.url.replace(BASE, "")}')
        # お届け詳細
        dls = [d for d in a.d('delivery', 'list', {})[1] if d['branchId'] == 'CU00950' and d['status'] == '納品済' and d['temp'] != '資材']
        if dls:
            did = dls[0]['id']
            pg.goto(BASE + f'/corp/deliveries/{did}'); pg.wait_for_timeout(3500)
            bb = pg.inner_text('body'); seen, miss = en_check(bb, prods)
            rec(f'お届け詳細（{did}）：商品名の下に英語名が出る', '#280①', len(seen) >= 1 and not miss, f'日本語名が出た={len(seen)} 英語名が欠けた={miss[:3]}' + ('' if seen else '（商品行が出ていない：' + bb[-200:].replace('\n', ' ') + '）'))
            pg.goto(BASE + f'/corp/deliveries/{did}/note'); pg.wait_for_timeout(3500)
            bb = pg.inner_text('body'); seen, miss = en_check(bb, prods)
            rec(f'納品書（お届け詳細から開く {did}/note）：商品名の下に英語名が出る', '#280①', len(seen) >= 1 and not miss, f'日本語名が出た={len(seen)} 英語名が欠けた={miss[:3]}' + ('' if seen else '（' + bb[-200:].replace('\n', ' ') + '）'))
        else:
            rec('お届け詳細・納品書の英語名', '#280①', False, '納品済の配送がない', blocked=True)
        # 月ごとの納品書（注文履歴の納品書ボタン）
        pg.goto(BASE + '/corp/order/history'); pg.wait_for_timeout(2500)
        btn = pg.get_by_role('button', name='納品書')
        if btn.count():
            btn.last.click(); pg.wait_for_timeout(2500)
            bb = pg.inner_text('body'); seen, miss = en_check(bb, prods)
            rec('月ごとの納品書（注文履歴の「納品書」）：商品名の下に英語名が出る', '#280①', len(seen) >= 1 and not miss, f'日本語名が出た={len(seen)} 英語名が欠けた={miss[:3]}')
        # 棚卸報告
        for m in ('2026-10', '2026-09'):
            pg.goto(BASE + f'/corp/stock/CU00950/{m}'); pg.wait_for_timeout(3500)
            bb = pg.inner_text('body'); seen, miss = en_check(bb, prods)
            rec(f'棚卸報告（CU00950・{m}）：商品名の下に英語名が出る', '#280①', len(seen) >= 1 and not miss, f'日本語名が出た={len(seen)} 英語名が欠けた={miss[:3]}' + ('' if seen else '（商品が出ていない：' + bb[-160:].replace('\n', ' ') + '）'))
    except Exception as e:
        rec('法人Web 注文履歴・お届け詳細・納品書・棚卸報告', '#280', False, f'{type(e).__name__}: {str(e)[:200]}', blocked=True)
    finally: c.close()
    removed_label(ctxs)

def removed_label(ctxs):
    a = ctxs['ops_full']; br = ctxs['browser']; base = ctxs['base']
    screen('法人Web 外れた商品（メニューから外れました）')
    base.post('/api/dev/reset'); base.post('/api/demo/today', data={'date': ''})
    orders = a.o('menu', 'orders', {'ym': '2026-11'})[1]
    pr = {x['id']: x for x in a.d('master', 'list', {'kind': 'products'})[1]}
    tgt = None
    for o in orders:
        if o['status'] in ('登録済', 'ES登録済') and o['site'] in ('CU00961', 'CU00871', 'CU00671', 'CU01901', 'CU00643', 'CU01902', 'CU01903', 'CU00950', 'CU00902'):
            for pid, v in o['q'].items():
                if any(v.values()): tgt = (o, pid); break
        if tgt: break
    if not tgt:
        rec('外れた商品の表示（法人Web）', '#266①', False, '登録済の注文が見つからない', blocked=True); return
    o, pid = tgt
    m = vw(a, '2026-11')['menu']
    st, j = a.o('menu', 'saveMenuEdit', {'ym': '2026-11', 'data': data_of_menu(m, items=[x for x in m['items'] if x['productId'] != pid])})
    print('  外す', pid, o['site'], st, msg(st, j))
    pname = pr[pid]['name']
    # 運営Web側
    cc, pg = ui_login(br, 'ops', 'Ad00010')
    try:
        pg.goto(BASE + f'/ops/menu/orders/{o["no"]}'); pg.wait_for_timeout(3500)
        ob = pg.inner_text('body')
        rec(f'運営Web 注文詳細：外した商品（{pid}）の行に「メニューから外れました」が出る', '#266①', 'メニューから外れました' in ob and pname in ob, f'注文={o["no"]} 商品名が出る={pname in ob} ラベル={"メニューから外れました" in ob}')
    except Exception as e:
        rec('運営Web 外れた商品', '#266①', False, f'{type(e).__name__}: {str(e)[:150]}', blocked=True)
    finally: cc.close()
    # 法人Web側
    cc, pg = ui_login(br, 'corp', o['site'])
    try:
        pg.goto(BASE + '/corp/order'); pg.wait_for_timeout(4000)
        cb = pg.inner_text('body')
        # 全ページ分
        shown = pname in cb
        rec(f'法人Web 商品注文：外れた商品（{pname}）の行に「メニューから外れました」が出る', '#266①（運営Web・法人Webの両方）', 'メニューから外れました' in cb, f'注文={o["no"]}（{o["site"]}・{o["status"]}・外れた商品の数={sum(o["q"][pid].values())}）商品名がページに出る={shown} ラベル={"メニューから外れました" in cb} 「外れ」を含む文言={[l for l in cb.split(chr(10)) if "外れ" in l][:3]}')
        kw = pg.locator('input[placeholder*="商品名、詳細情報"]')
        kw.fill(pname); pg.get_by_role('button', name='検索', exact=True).click(); pg.wait_for_timeout(1200)
        cb2 = pg.inner_text('body')
        rec('法人Web：外れた商品を検索すると、注文に残っている商品として見える（数を減らす・0にするだけの行）', '#266①', pname in cb2, f'商品名が出る={pname in cb2}')
        # 登録の保存で増やせない（API: corp site で増やすと 400）
    except Exception as e:
        rec('法人Web 外れた商品', '#266①', False, f'{type(e).__name__}: {str(e)[:150]}', blocked=True)
    finally: cc.close()
    # 法人APIで増やせないか（外れた商品の数を増やす）
    ca = Api(ctxs['pw'], 'corp', o['site'])
    cur = [x for x in orders_now(a, '2026-11') if x['no'] == o['no']][0]
    q = copy.deepcopy(cur['q'])
    slot = next(k for k, v in q[pid].items() if v)
    other = next((k for k, v in q.items() if k != pid and v.get(slot)), None)
    q[pid][slot] += 1
    if other: q[other][slot] -= 1
    st, j = ca.o('corp-order', 'registerOrder', {'acc': {'corpId': 'x', 'branchId': o['site'], 'role': 'branch'}, 'site': o['site'], 'q': q})
    rec('法人が外れた商品の数を増やして登録→止まる（減らす・0にするだけ）', '#266①', st >= 400 and ('外れ' in msg(st, j) or '入れられません' in msg(st, j) or st == 400), f'HTTP {st} {msg(st, j)[:240]}')
    q2 = copy.deepcopy(cur['q']); q2[pid][slot] -= 1
    if other: q2[other][slot] += 1
    st, j = ca.o('corp-order', 'registerOrder', {'acc': {'corpId': 'x', 'branchId': o['site'], 'role': 'branch'}, 'site': o['site'], 'q': q2})
    rec('法人が外れた商品の数を減らして（他を増やして）登録→できる', '#266①', st < 400, f'HTTP {st} {msg(st, j)[:240]}')
    base.post('/api/dev/reset')

def orders_now(a, ym): return a.o('menu', 'orders', {'ym': ym})[1]
