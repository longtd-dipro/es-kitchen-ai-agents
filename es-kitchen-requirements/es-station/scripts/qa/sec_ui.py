# -*- coding: utf-8 -*-
"""UI/UX レビュー（2026-10-07）の修正の確認：ダイアログの焦点・Esc・Tab（#1）、棚卸報告の桁（#2・台帳N）・項目のエラー（#3）・スマホ幅のチャットボタン（#5）、
調整数だけの変更の破棄確認（#6）、「自動注文」の呼び名（受付簿 #283）、主ボタンの文字色（#284）"""
import os, re
from qa_lib import *

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
FOCUS_IN_DLG = "()=>!!(document.activeElement && document.activeElement.closest('[role=dialog]'))"
STOCK_URL = '/corp/stock/CU00643/2026-10'

def dlg_n(pg): return pg.locator('[role=dialog][aria-modal=true]').count()

def run(p, ctxs):
    br = ctxs['browser']; base = ctxs['base']; a = ctxs['ops_full']
    base.post('/api/dev/reset')

    # 1) 共通のダイアログ（運営：商品カテゴリの新規登録）
    screen('ダイアログ共通（焦点・Esc・Tab）')
    c, pg = ui_login(br, 'ops', 'Ad00010')
    try:
        pg.goto(BASE + '/ops/masters/categories'); pg.wait_for_timeout(2500)
        btn = pg.get_by_role('button', name='新規登録').first; btn.click(); pg.wait_for_timeout(800)
        rec('商品カテゴリ「新規登録」を開く→焦点がダイアログの中に入る', 'UIUX#1', dlg_n(pg) == 1 and pg.evaluate(FOCUS_IN_DLG), f'dialogs={dlg_n(pg)}')
        d = pg.locator('[role=dialog]').first
        rec('  └ダイアログに名前（aria-label か aria-labelledby）がある', 'UIUX#1', bool(d.get_attribute('aria-label') or d.get_attribute('aria-labelledby')), '')
        inside = []
        for _ in range(16): pg.keyboard.press('Tab'); inside.append(pg.evaluate(FOCUS_IN_DLG))
        pg.keyboard.press('Shift+Tab'); inside.append(pg.evaluate(FOCUS_IN_DLG))
        rec('  └Tab を16回・Shift+Tab を1回→焦点が背後の画面へ出ない', 'UIUX#1', all(inside), f'inside={sum(inside)}/{len(inside)}')
        pg.keyboard.press('Escape'); pg.wait_for_timeout(700)
        rec('  └Esc でダイアログが閉じ、焦点が「新規登録」ボタンへ戻る', 'UIUX#1', dlg_n(pg) == 0 and pg.evaluate("document.activeElement.textContent.includes('新規登録')"), f'dialogs={dlg_n(pg)}')
    except Exception as e:
        rec('運営のダイアログ（焦点・Esc・Tab）', 'UIUX#1', False, f'{type(e).__name__}: {str(e)[:150]}', blocked=True)
    finally: c.close()

    # 6) 調整数だけを変えて「キャンセル」→破棄の確認（Q02）。Esc は確認の「キャンセル」＝編集を続ける
    screen('商品注文 編集（調整数だけの変更）')
    L = a.o('menu', 'orders', {'ym': '2026-11'})[1]
    o = next((x for x in L if x['status'] in ('登録済', 'ES登録済') and not x.get('trial')), None)
    c, pg = ui_login(br, 'ops', 'Ad00010')
    try:
        if not o: raise RuntimeError('登録済みの注文なし')
        edit = BASE + f'/ops/menu/orders/{o["no"]}/edit'
        pg.goto(edit); pg.wait_for_timeout(3000)
        pg.get_by_role('button', name='キャンセル').first.click(); pg.wait_for_timeout(1500)
        rec('変更なしで「キャンセル」→確認なしで詳細へ戻る', '台帳E Q02', dlg_n(pg) == 0 and not pg.url.endswith('/edit'), f'url={pg.url[-20:]} dialogs={dlg_n(pg)}')
        pg.goto(edit); pg.wait_for_timeout(3000)
        pg.locator('td.mo-adj button[aria-label="増やす"]:not([disabled])').first.click(); pg.wait_for_timeout(300)
        pg.get_by_role('button', name='キャンセル').first.click(); pg.wait_for_timeout(700)
        rec('調整数だけを +1 して「キャンセル」→「編集内容を破棄しますか？」が出る（編集画面に留まる）', 'UIUX#6', dlg_n(pg) == 1 and pg.url.endswith('/edit') and '破棄' in pg.inner_text('body'), f'dialogs={dlg_n(pg)}')
        rec('  └確認ダイアログの焦点がダイアログの中', 'UIUX#1', pg.evaluate(FOCUS_IN_DLG), '')
        pg.keyboard.press('Escape'); pg.wait_for_timeout(500)
        rec('  └Esc＝キャンセル（確認が閉じ、編集に戻る）', 'UIUX#1', dlg_n(pg) == 0 and pg.url.endswith('/edit'), f'dialogs={dlg_n(pg)} url={pg.url[-12:]}')
        pg.locator('a[href="/ops/menu/orders"]').first.click(timeout=3000); pg.wait_for_timeout(700)
        rec('  └調整数だけ変更のまま、サイドメニューの別の画面へ移ろうとする→破棄の確認が出る（移動しない）', 'UIUX#6', dlg_n(pg) == 1 and pg.url.endswith('/edit'), f'dialogs={dlg_n(pg)} url={pg.url[-20:]}')
    except Exception as e:
        rec('調整数だけの変更の破棄確認', 'UIUX#6', False, f'{type(e).__name__}: {str(e)[:150]}', blocked=True)
    finally: c.close()

    # 2・3・5・1) 法人Web 棚卸報告
    screen('棚卸報告（桁・項目のエラー・スマホ幅）')
    for vw_, vh in ((1400, 1000), (390, 800)):
        c, pg = ui_login(br, 'corp', 'CU00001', vw=vw_, vh=vh)
        try:
            pg.goto(BASE + STOCK_URL); pg.wait_for_timeout(3000)
            ins = pg.locator('table.sk-in input[aria-label$="今ある数"]'); n = ins.count()
            rpt = pg.get_by_role('button', name='報告する')
            click = lambda: rpt.evaluate('e=>e.click()')  # 390px はデモのコメントボタンが重なるので JS で押す
            click(); pg.wait_for_timeout(600)
            inv = pg.locator('table.sk-in input[aria-invalid=true]')
            rec(f'[{vw_}px] 今ある数が全部空で「報告する」→全欄が赤枠・aria-invalid・欄の下に E01', 'UIUX#3', n > 0 and inv.count() == n and pg.locator('table.sk-in .es-input--error').count() >= n and '今ある数をご入力ください。' in pg.inner_text('table.sk-in'), f'欄={n} invalid={inv.count()}')
            f = inv.first; did = f.get_attribute('aria-describedby') or ''
            rec(f'  └aria-describedby が欄の下の文言を指し、最初の欄に焦点が移る', 'UIUX#3', bool(did) and pg.locator('#' + did).count() == 1 and pg.evaluate("document.activeElement.getAttribute('aria-invalid')") == 'true', f'describedby={did}')
            first = ins.first
            first.fill('99999'); rec(f'  └99999 を入れる→そのまま 99999（4桁に切り詰めない）', 'UIUX#2・台帳N', first.input_value() == '99999', first.input_value())
            first.fill('999999'); rec('  └999999（上限）→そのまま・範囲のエラーなし', '台帳N', first.input_value() == '999999' and pg.locator('table.sk-in .es-field__msg--error').filter(has_text='範囲').count() == 0, first.input_value())
            first.fill('1000000'); pg.wait_for_timeout(200)
            rec('  └1000000（上限+1）→切り詰めず、欄の下に E12「0〜999,999の範囲でご入力ください。」', 'UIUX#2・台帳N', first.input_value() == '1000000' and '今ある数は0〜999,999の範囲でご入力ください。' in pg.inner_text('table.sk-in'), first.input_value())
            for i in range(n): ins.nth(i).fill('1')
            first.fill('1000000'); click(); pg.wait_for_timeout(500)
            rec('  └1000000 のまま「報告する」→確認ダイアログは開かず、その欄に焦点', 'UIUX#2', dlg_n(pg) == 0 and pg.evaluate("document.activeElement.getAttribute('aria-invalid')") == 'true', f'dialogs={dlg_n(pg)}')
            first.fill('1'); click(); pg.wait_for_timeout(800)
            rec('  └直して「報告する」→報告確認ダイアログが開き、焦点がその中', 'UIUX#1', dlg_n(pg) == 1 and pg.evaluate(FOCUS_IN_DLG), f'dialogs={dlg_n(pg)}')
            pg.keyboard.press('Escape'); pg.wait_for_timeout(500)
            rec('  └Esc で報告確認ダイアログが閉じる（報告はされない）', 'UIUX#1', dlg_n(pg) == 0, f'dialogs={dlg_n(pg)}')
            if vw_ == 390:
                fb = pg.locator('.es-chatbot__fab').bounding_box(); bb = pg.locator('.rv-skact').bounding_box()
                rec('[390px] AIチャットの丸ボタンが固定バーの上にあり、「報告する」と重ならない（隠れてもいない）', 'UIUX#5', fb['y'] + fb['height'] <= bb['y'] and fb['y'] >= 0, f'fab下端={fb["y"] + fb["height"]} バー上端={bb["y"]}')
                pg.locator('.es-chatbot__fab').click(); pg.wait_for_timeout(500)
                cb = pg.locator('.es-chatbot').bounding_box()
                rec('[390px] チャットを開いても枠が画面内に収まり、バーに重ならない', 'UIUX#5', cb is not None and cb['y'] + cb['height'] <= bb['y'] + 1 and cb['y'] >= 0, f'{cb}')
        except Exception as e:
            rec(f'[{vw_}px] 棚卸報告', 'UIUX#2・#3・#5', False, f'{type(e).__name__}: {str(e)[:150]}', blocked=True)
        finally: c.close()
    # サーバー側（画面を通らない呼び出し）：上限超えは保存しない
    cu = Api(p, 'corp', 'CU00001')
    who = {'corpId': 'CU00001', 'role': 'admin'}
    q = cu.o('corp-docs', 'stock', {'who': who})[1]
    ids = [r['productId'] for r in (a.d('report', 'stockSheet', {'branchId': 'CU00643', 'period': '2026-10'})[1].get('rows') or [])]
    cands = (q.get('cands') or {}).get('CU00643') or []
    by = next((x['value'] for x in cands if x.get('main')), cands[0]['value'] if cands else '')
    def file(actual):
        return cu.o('corp-docs', 'fileStock', {'who': who, 'site': 'CU00643', 'm': '2026-10', 'by': by, 'rows': [{'productId': i, 'actual': actual, 'disposed': 0, 'arrived': 0} for i in ids]})
    st, j = file(1000000)
    rec('サーバー：今ある数 1000000 の報告→400（「0〜999,999の範囲」）', '台帳N', st == 400 and '999,999' in str(j), f'HTTP {st} {str(j)[:120]}')
    st, j = file(999999)
    rec('サーバー：今ある数 999999 の報告→範囲のエラーにはならない（切り詰めない。合計の確認 E327 で止まるのは別）', '台帳N', bool(ids) and '999,999' not in str(j), f'HTTP {st} {str(j)[:120]}')
    base.post('/api/dev/reset')

    # 7) 呼び名
    screen('呼び名（自動注文）')
    bad = []
    for root in ('app', 'lib'):
        for dp, _, fs in os.walk(os.path.join(REPO, root)):
            for fn in fs:
                if not fn.endswith(('.ts', '.tsx')): continue
                t = open(os.path.join(dp, fn), encoding='utf-8').read()
                if re.search(r'おまかせ(?!」?[。）\)]?$)', t.replace('ESキッチンにおまかせ', '')) and 'おまかせ' in t.replace('ESキッチンにおまかせ', ''):
                    bad.append(os.path.relpath(os.path.join(dp, fn), REPO))
    rec('app/・lib/ のコードに「おまかせ注文」（「ESキッチンにおまかせ」以外の「おまかせ」）が残っていない', '#283', not bad, ', '.join(bad))
    c, pg = ui_login(br, 'corp', 'CU00001')
    try:
        txt = ''
        for u in ('/corp', '/corp/order'):
            pg.goto(BASE + u); pg.wait_for_timeout(2500); txt += pg.inner_text('body')
        rec('法人Web のホーム・商品注文の画面に「おまかせ注文」が出ない', '#283', 'おまかせ注文' not in txt, '')
        pg.goto(BASE + '/corp/order'); pg.wait_for_timeout(2500)
        for lbl in ('注文の設定',):
            b = pg.get_by_role('button', name=lbl)
            if b.count(): b.first.click(); pg.wait_for_timeout(1000)
        t2 = pg.inner_text('body')
        rec('商品注文の「注文の設定」の説明が「自動注文」と呼ぶ', '#283', 'おまかせ' not in t2 and '自動注文' in t2, f'自動注文={"自動注文" in t2}')
    except Exception as e:
        rec('法人Web の呼び名', '#283', False, f'{type(e).__name__}: {str(e)[:150]}', blocked=True)
    finally: c.close()

    # 8) 主ボタンの文字色（#284）
    screen('法人Web 主ボタンの色')
    c, pg = ui_login(br, 'corp', 'CU00001')
    try:
        js = "()=>[...document.querySelectorAll('.es-btn--solid.es-btn--primary,.btn.pri')].filter(e=>e.offsetWidth).map(e=>{const s=getComputedStyle(e);return [s.backgroundColor,s.color]})"
        allr = []
        for u in ('/corp/order', '/corp/stock', '/corp/bills', '/corp/contact'):
            pg.goto(BASE + u); pg.wait_for_timeout(1800); allr += pg.evaluate(js)
        okb = bool(allr) and all(b == 'rgb(250, 165, 29)' and fg == 'rgb(26, 26, 26)' for b, fg in allr)
        rec('法人Web の主ボタン（4画面）：背景 #FAA51D のまま・文字 #1A1A1A', '#284', okb, str(set(map(tuple, allr)))[:150])
    except Exception as e:
        rec('主ボタンの色', '#284', False, f'{type(e).__name__}: {str(e)[:150]}', blocked=True)
    finally: c.close()
    base.post('/api/dev/reset')
