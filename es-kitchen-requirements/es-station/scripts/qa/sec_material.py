# -*- coding: utf-8 -*-
"""資材注文管理（#261・#262・#277・#279・#281）"""
import copy, json
from qa_lib import *
from sec_product import msg
from sec_order import next_day, ctxs_set_today

def mats(a): return a.o('menu', 'mats')[1]

def run(p, ctxs):
    a = ctxs['ops_full']; cs = ctxs['ops_cs']; base = ctxs['base']
    screen('資材注文管理（リードタイム・何回目）')
    master = a.o('menu', 'master')[1]
    sites = master['sites']
    normal = [s for s in sites if not s.get('trial') and not s.get('ended') and not s.get('paused')]
    trial = [s for s in sites if s.get('trial')]
    mm = master['materials']
    print('  拠点', len(sites), '通常', len(normal), 'お試し', len(trial), '資材', [m['id'] for m in mm][:5])
    all0 = mats(a)
    nth_site = {m['site'] for m in all0}
    # 注文のない拠点を選ぶ（何回目を1から数えるため）
    free = [s for s in normal if s['id'] not in nth_site and any(m for m in mm if s['course'] in m['course'])]
    if not free: free = normal
    s = free[0]; mid = next(m['id'] for m in mm if s['course'] in m['course'] or True)
    pre = a.o('menu', 'matPre', {'site': s['id']})[1]
    rec('リードタイムは契約の配送区分（資材）の値、なければ2日（仮）／納品予定日の初期値は注文日＋リードタイム以降', '#262', pre['lead'] == 2 and pre['def'] > '2026/10/05', f'matPre={pre}')
    def create(sid, qty=1, mid=mid):
        return a.o('menu', 'createMat', {'site': sid, 'q': {mid: qty}})
    # 数の境界
    st, j = a.o('menu', 'createMat', {'site': s['id'], 'q': {mid: 0}}); rec('注文数 0（全部0）→「1つ以上入力」', '#241 Q-M1', st == 400, f'HTTP {st} {msg(st, j)[:150]}')
    st, j = a.o('menu', 'createMat', {'site': s['id'], 'q': {mid: 1000}}); rec('注文数 1000→「0〜999」で止まる', '#241 Q-M1（注文数999/1000）', st == 400 and '999' in msg(st, j), f'HTTP {st} {msg(st, j)[:150]}')
    st, j = a.o('menu', 'createMat', {'site': s['id'], 'q': {mid: -1}}); rec('注文数 -1→止まる', '#241 Q-M1', st == 400, f'HTTP {st} {msg(st, j)[:150]}')
    st, j = a.o('menu', 'createMat', {'site': s['id'], 'q': {mid: 1.5}}); rec('注文数 1.5→止まる', '#241 Q-M1', st == 400, f'HTTP {st} {msg(st, j)[:150]}')
    st, j = a.o('menu', 'createMat', {'site': '', 'q': {mid: 1}}); rec('拠点未選択→止まる', '#241 Q-M1', st == 400, f'HTTP {st} {msg(st, j)[:150]}')
    st, j = create(s['id'], 999); rec('注文数 999→登録できる（1回目・無料）', '#277①', st < 400, f'HTTP {st} {msg(st, j)[:150]} no={j}')
    no1 = j if st < 400 else None
    m1 = a.o('menu', 'mat', {'no': no1})[1] if no1 else {}
    rec('  └1回目：何回目=1・追加配送料なし', '#277①', m1.get('nth') == 1 and not m1.get('memo'), f'nth={m1.get("nth")} memo={m1.get("memo")!r}')
    st, j = create(s['id']); no2 = j if st < 400 else None
    m2 = a.o('menu', 'mat', {'no': no2})[1] if no2 else {}
    rec('同じサイクル月に2件目→何回目=2・追加配送料 OP000036 2,000円（仮）が付く', '#261・#277①', m2.get('nth') == 2 and 'OP000036' in (m2.get('memo') or '') and '2,000' in m2['memo'], f'nth={m2.get("nth")} memo={m2.get("memo")!r}')
    # 取り消すと次が繰り上がる
    st, j = create(s['id']); no3 = j if st < 400 else None
    m3 = a.o('menu', 'mat', {'no': no3})[1]
    rec('3件目→何回目=3・有料', '#277①', m3.get('nth') == 3 and bool(m3.get('memo')), f'nth={m3.get("nth")} memo={m3.get("memo")!r}')
    st, j = a.o('menu', 'cancelMat', {'no': no1, 'reason': '誤注文'})
    rec('1回目を取り消す→取消できる', '#277①', st < 400, f'HTTP {st} {msg(st, j)[:150]}')
    m2b = a.o('menu', 'mat', {'no': no2})[1]; m3b = a.o('menu', 'mat', {'no': no3})[1]
    rec('  └取消後：2件目が1回目（無料）に、3件目が2回目（有料）に繰り上がる', '#277①', m2b['nth'] == 1 and not m2b['memo'] and m3b['nth'] == 2 and bool(m3b['memo']), f'2件目 nth={m2b["nth"]} memo={m2b["memo"]!r} / 3件目 nth={m3b["nth"]} memo={m3b["memo"]!r}')
    m1b = a.o('menu', 'mat', {'no': no1})[1]
    rec('  └取り消した注文の何回目は 0', '#277①', m1b['nth'] == 0, f'nth={m1b["nth"]} st={m1b["st"]}')
    # 取消済は参照のみ
    screen('資材注文管理（取消済・参照のみ・理由）')
    st, j = a.o('menu', 'saveMat', {'mat': dict(m1b)})
    rec('取消済の資材注文を保存→止まる（参照のみ）', '#277④', st == 409, f'HTTP {st} {msg(st, j)[:150]}')
    st, j = a.o('menu', 'saveMat', {'mat': dict(m1b), 'ship': {'shippedOn': '2026-10-06', 'trackingNo': '123'}})
    rec('取消済に発送日・送り状番号を入れる→止まる', '#277④', st == 409, f'HTTP {st} {msg(st, j)[:150]}')
    st, j = a.o('menu', 'cancelMat', {'no': no2, 'reason': ''}); rec('取消の理由が空→必須', '#277', st == 400 and '必須' in msg(st, j), f'HTTP {st} {msg(st, j)[:100]}')
    st, j = a.o('menu', 'cancelMat', {'no': no2, 'reason': 'あ' * 501}); rec('取消の理由 501文字→止まる', '#277', st == 400, f'HTTP {st} {msg(st, j)[:100]}')
    st, j = a.o('menu', 'cancelMat', {'no': no2, 'reason': '誤😀'}); rec('取消の理由に絵文字→止まる', '#277', st == 400 and '絵文字' in msg(st, j), f'HTTP {st} {msg(st, j)[:100]}')
    st, j = a.o('menu', 'cancelMat', {'no': no2, 'reason': 'あ' * 500}); rec('取消の理由 500文字ちょうど→取り消せる', '#277', st < 400, f'HTTP {st} {msg(st, j)[:100]}')
    # お試しの拠点
    screen('資材注文管理（お試し・OP000036）')
    if trial:
        t = trial[0]; ids = []
        for i in range(3):
            st, j = create(t['id']); ids.append(j if st < 400 else None)
        ms = [a.o('menu', 'mat', {'no': n})[1] if n else {} for n in ids]
        rec('お試し拠点：運営が3件登録しても追加配送料（OP000036）は付かない', '#277③', all(m and not m.get('memo') and m.get('trial') for m in ms), f'(nth, memo, trial)={[(m.get("nth"), m.get("memo"), m.get("trial")) for m in ms]}')
        rec('  └お試し拠点の2回目以降のメモに「このサイクル2回目」が出ない', '#277③', all('2回目' not in (m.get('memo') or '') for m in ms), str([m.get('memo') for m in ms]))
    else:
        rec('お試し拠点の資材注文', '#277③', False, 'お試しの拠点がマスタにない', blocked=True)
    # 納品予定日の警告
    pre2 = a.o('menu', 'matPre', {'site': s['id'], 'due': '2026/10/06'})[1]
    rec('納品予定日が翌日（リードタイム2日未満）→警告「リードタイム未満」（止めない）', '#262', 'リードタイム未満' in pre2['warn'], f'warn={pre2["warn"]}')
    pre3 = a.o('menu', 'matPre', {'site': s['id'], 'due': '2026/10/11'})[1]
    rec('納品予定日が日曜（2026/10/11）→警告「お届けできない曜日」', '#262', 'お届けできない曜日' in pre3['warn'], f'warn={pre3["warn"]}')
    hol = [h for h in a.d('delivery', 'holidays', {})[1] if h.get('noDelivery')] if a.d('delivery', 'holidays', {})[0] == 200 else []
    hday = next((h['date'] for h in hol if h['date'] > '2026/10/08'), None)
    if hday:
        pre4 = a.o('menu', 'matPre', {'site': s['id'], 'due': hday})[1]
        rec(f'納品予定日が休日（{hday}）→警告「休日」', '#262', '休日' in pre4['warn'], f'warn={pre4["warn"]}')
    # 発送日・送り状番号
    screen('資材注文管理（発送日・送り状番号・権限・E31）')
    cur = a.o('menu', 'mat', {'no': no3})[1]
    def ship(who, sh, tr, m=cur, **kw):
        return who.o('menu', 'saveMat', dict({'mat': m, 'ship': {'shippedOn': sh, 'trackingNo': tr}}, **kw))
    st, j = ship(cs, '2026-10-06', '1234'); rec('CS（Ad00002）が発送日・送り状番号を入れる→403', '#277②・#279②', st == 403, f'HTTP {st} {msg(st, j)[:100]}')
    ld = ctxs.get('ops_delivery')
    if ld:
        st, j = ship(ld, '2026-10-06', '1234'); rec('物流（Ad00011）が発送日・送り状番号を入れる→403（物流に更新権限は足さない）', '#277②', st == 403, f'HTTP {st} {msg(st, j)[:100]}')
    st, j = ship(a, '2026-10-06', '1234-5678'); rec('システム管理が発送日・送り状番号を入れる→保存できる', '#277②', st < 400, f'HTTP {st} {msg(st, j)[:100]}')
    cur2 = a.o('menu', 'mat', {'no': no3})[1]
    rec('  └保存後に発送日・送り状番号が残る', '#277②', cur2.get('shippedOn') == '2026-10-06' and cur2.get('trackingNo') == '1234-5678', f'{cur2.get("shippedOn")} {cur2.get("trackingNo")}')
    cur = cur2
    st, j = ship(a, '2026-10-06', '1' * 30, m=cur); rec('送り状番号 30桁→保存できる', 'E04', st < 400, f'HTTP {st} {msg(st, j)[:100]}')
    cur = a.o('menu', 'mat', {'no': no3})[1]
    st, j = ship(a, '2026-10-06', '1' * 31, m=cur); rec('送り状番号 31桁→止まる', 'E04', st == 400, f'HTTP {st} {msg(st, j)[:100]}')
    st, j = ship(a, '2026-10-06', 'ABC-12', m=cur); rec('送り状番号に英字→止まる（数字とハイフン）', 'E64', st == 400, f'HTTP {st} {msg(st, j)[:100]}')
    st, j = ship(a, '2026-09-30', '123', m=cur); rec('発送日が注文日より前→止まる', 'E06', st == 400, f'HTTP {st} {msg(st, j)[:100]}')
    st, j = ship(a, '2026-02-30', '123', m=cur); rec('発送日が存在しない日（2026-02-30）→止まる', 'E06', st == 400, f'HTTP {st} {msg(st, j)[:100]}')
    st, j = ship(a, '2026-10-06', '１２３－４５', m=cur)
    cur3 = a.o('menu', 'mat', {'no': no3})[1]
    rec('送り状番号 全角数字・全角ハイフン→半角に直して保存', '#277', st < 400 and cur3.get('trackingNo') == '123-45', f'HTTP {st} {cur3.get("trackingNo")}')
    # E31
    st, j = a.o('menu', 'saveMat', {'mat': dict(cur3, q={mid: 5}), 'baseVersion': 'stale|version'})
    rec('古い版（baseVersion 違い）で保存→「他のユーザーにより更新されています」(409)', 'E31', st == 409, f'HTTP {st} {msg(st, j)[:140]}')
    # 納品予定日を別のサイクル月へ→何回目が数え直される
    cur = a.o('menu', 'mat', {'no': no3})[1]
    pre_n = a.o('menu', 'matPre', {'site': s['id'], 'due': '2026/11/20', 'no': no3})[1]
    st, j = a.o('menu', 'saveMat', {'mat': dict(cur, due='2026/11/20'), 'baseVersion': cur['ver']})
    after = a.o('menu', 'mat', {'no': no3})[1]
    rec('納品予定日を別のサイクル月（2026/11/20）へ変える→何回目は新しい月で数え直す（1回目・無料）', '#277①', st < 400 and after['nth'] == 1 and not after['memo'], f'HTTP {st} {msg(st, j)[:120]} nth={after["nth"]} memo={after["memo"]!r} matPre={pre_n}')
    # 出荷指示のあと（出荷待でない）は数・納品予定日を直せない
    locked = [m for m in mats(a) if m['st'] not in ('出荷待', '取消')]
    if locked:
        L = locked[0]
        st, j = a.o('menu', 'saveMat', {'mat': dict(L, q={mid: 3}), 'baseVersion': L['ver']})
        rec(f'出荷指示のあと（{L["no"]}・{L["st"]}）に数を変える→止まる（E31）', '#277④・E31', st == 409, f'HTTP {st} {msg(st, j)[:140]}')
    else:
        rec('出荷指示のあとの資材注文を直す', '#277', False, '見本に出荷待以外の資材注文なし', blocked=True)
    # お客様へ知らせる
    tmplN = lambda: len([n for n in a.d('notice', 'list', {})[1] if no3 in json.dumps(n, ensure_ascii=False)])
    n0 = tmplN()
    cur = a.o('menu', 'mat', {'no': no3})[1]
    st, j = a.o('menu', 'saveMat', {'mat': dict(cur, q={mid: 7}), 'baseVersion': cur['ver']})
    n1 = tmplN()
    rec('資材注文の編集を notify なしで保存→お客様へのお知らせは作られない', '#277④・#281', st < 400 and n1 == n0, f'HTTP {st} {msg(st, j)[:100]} 通知 {n0}→{n1}')
    cur = a.o('menu', 'mat', {'no': no3})[1]
    st, j = a.o('menu', 'saveMat', {'mat': dict(cur, q={mid: 8}), 'baseVersion': cur['ver'], 'notify': True})
    n2 = tmplN()
    rec('notify=true で保存→お知らせが作られる', '#277④・#281', st < 400 and n2 > n1, f'HTTP {st} {msg(st, j)[:100]} 通知 {n1}→{n2}')
    # 新規登録にも「お客様へ知らせる」（初期は知らせない：#282②）
    # 運営向けの「資材の注文（MO-…）」は別。お客様（拠点・法人）向けは題名「資材注文 MO-… を ES が登録しました」
    cnt = lambda: len([n for n in a.d('notice', 'list', {})[1] if 'ES が登録しました' in json.dumps(n, ensure_ascii=False) and '資材注文' in json.dumps(n, ensure_ascii=False)])
    n0 = cnt(); st, j = a.o('menu', 'createMat', {'site': s['id'], 'q': {mid: 1}}); n1 = cnt()
    rec('資材注文の新規登録を notify なしで保存→お客様へのお知らせは作られない', '#282②（登録の初期値は知らせない）', st < 400 and n1 == n0, f'HTTP {st} {msg(st, j)[:100]} 通知 {n0}→{n1}')
    st, j = a.o('menu', 'createMat', {'site': s['id'], 'q': {mid: 1}, 'notify': True}); n2 = cnt()
    rec('資材注文の新規登録を notify=true で保存→お知らせが作られる', '#282②', st < 400 and n2 > n1, f'HTTP {st} {msg(st, j)[:100]} 通知 {n1}→{n2}')
    # 請求済みの月 → 調整明細（確認のみ）
    ui_mat(ctxs, no3, trial)

def ui_mat(ctxs, no, trial):
    br = ctxs['browser']; screen('資材注文管理（UI）')
    c, pg = ui_login(br, 'ops', 'Ad00002')
    try:
        pg.goto(BASE + f'/ops/menu/materials/{no}/edit'); pg.wait_for_timeout(3000)
        b = pg.inner_text('body')
        n = pg.locator('input[aria-label*="発送日"]:not([disabled]), input[aria-label*="送り状"]:not([disabled])').count()
        rec('CS が資材注文編集を開く→発送日・送り状番号は入力できない', '#277②・#279②', n == 0, f'有効な入力欄={n} 「発送日」表示={"発送日" in b}')
        chk = pg.get_by_label('お客様へ知らせる')
        rec('  └「お客様へ知らせる」チェックが出る・初期はチェックなし', '#277④・#282②', 'お客様へ知らせる' in b and chk.count() > 0 and not chk.first.is_checked(), f'文言={"お客様へ知らせる" in b} checked={chk.first.is_checked() if chk.count() else None}')
    except Exception as e:
        rec('CS の資材注文編集画面', '#277②', False, f'{type(e).__name__}: {str(e)[:150]}', blocked=True)
    finally: c.close()
    c, pg = ui_login(br, 'ops', 'Ad00010')
    try:
        pg.goto(BASE + f'/ops/menu/materials/{no}/edit'); pg.wait_for_timeout(3000)
        b = pg.inner_text('body')
        n = pg.locator('input[aria-label*="発送日"]:not([disabled]), input[aria-label*="送り状"]:not([disabled])').count()
        rec('システム管理が資材注文編集を開く→発送日・送り状番号を入力できる', '#277②・#279②', n >= 1 or ('発送日' in b), f'有効な入力欄={n}')
    except Exception as e:
        rec('システム管理の資材注文編集画面', '#277②', False, f'{e}'[:150], blocked=True)
    finally: c.close()
