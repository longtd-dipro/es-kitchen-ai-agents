# -*- coding: utf-8 -*-
"""商品注文管理（#251〜#252・#263・#264・#266・#270・#272・#281・#282）"""
import copy, json
from qa_lib import *
from sec_product import msg

def orders(a, ym=None):
    return a.o('menu', 'orders', {'ym': ym} if ym else None)[1]

def firstq(o, frozen=False):
    """調整数を足せる便のキーと商品（冷凍でない便から選ぶ。冷凍の便にも足せる：#282①）"""
    for pid, v in o['q'].items():
        for k, n in v.items():
            if not k.startswith('f') and k != 'frozen':
                return pid, k
    return None, None

def run(p, ctxs):
    a = ctxs['ops_full']; cs = ctxs['ops_cs']; base = ctxs['base']
    screen('商品注文管理（調整数）')
    os_ = orders(a, '2026-11')
    by = {}
    for o in os_: by.setdefault(o['status'], []).append(o)
    print('  2026-11 状態:', {k: len(v) for k, v in by.items()})
    master = a.o('menu', 'master')[1]
    sites = {s['id']: s for s in master['sites']}
    def adj_order(o, total, slot_filter=None):
        o2 = copy.deepcopy(o)
        for pid in o2['a']:
            for k in o2['a'][pid]: o2['a'][pid][k] = 0
        pid, k = firstq(o)
        if pid is None: return None
        o2['a'].setdefault(pid, {})[k] = total
        return o2
    regs = [o for o in by.get('登録済', []) + by.get('ES登録済', []) if not sites[o['site']].get('trial')]
    plan50 = [o for o in regs if sites[o['site']]['plan'] == 50] or regs
    if not plan50:
        rec('調整数のテスト対象（2026-11 の登録済み注文）', '#272', False, '該当注文なし', blocked=True); return
    o = plan50[0]; plan = sites[o['site']]['plan']
    print('  対象', o['no'], o['status'], 'plan', plan)
    def sv(o2, adjust=True, who=a, notify=None, **kw):
        arg = {'order': o2, 'adjust': adjust}
        if notify is not None: arg['notify'] = notify
        arg.update(kw)
        return who.o('menu', 'saveOrder', arg)
    st, j = sv(adj_order(o, 0)); rec('調整数 0 のまま保存→保存できる', '#272', st < 400, f'HTTP {st} {msg(st, j)[:200]}')
    for n, ok in [(1, True), (plan - 1, True), (plan, True), (plan + 1, False)]:
        cur = [x for x in orders(a, '2026-11') if x['no'] == o['no']][0]
        st, j = sv(adj_order(cur, n))
        got = [x for x in orders(a, '2026-11') if x['no'] == o['no']][0]
        tot = sum(sum(v.values()) for v in got['a'].values())
        if ok: rec(f'調整数 {n}（上限＝プランの食数{plan}）→保存できる', '#272', st < 400 and tot == n, f'HTTP {st} {msg(st, j)[:200]} 保存後の調整数合計={tot}')
        else: rec(f'調整数 {n}（食数{plan}＋1）→「0〜{plan}の範囲」で止まる', '#272', st == 400 and f'0〜{plan}' in msg(st, j), f'HTTP {st} {msg(st, j)[:200]}')
    # 調整率 小数1桁・入力しない
    cur = [x for x in orders(a, '2026-11') if x['no'] == o['no']][0]
    for n in (1, 5, 6):
        sv(adj_order(cur, n)); got = [x for x in orders(a, '2026-11') if x['no'] == o['no']][0]
        exp = round(n / plan * 100, 1)
        rec(f'調整数{n}・食数{plan}→調整率は {exp}%（調整数÷食数・小数1桁）', '#272', abs(got['rate'] - exp) < 0.051, f'rate={got["rate"]}')
    # 合計・便の差に入らない：調整数を入れても通常数の検証は通る（上で保存OK）。冷凍の便にも足せる（#282①）
    frozen_slots = [k for pid, v in o['q'].items() for k in v if k.startswith('f')]
    d = a.d('order', 'list', {'cycleMonth': '2026-11'})
    # 請求しない・出荷指示等への反映：配送の明細に調整数が入る
    print('  frozen slots in order:', frozen_slots[:3])
    # 調整数が配送の明細・予定数に入る（#252）
    got = [x for x in orders(a, '2026-11') if x['no'] == o['no']][0]
    sv(adj_order(got, 3)); 
    dl = a.d('delivery', 'list', {})  # 予定数
    # お試し（自動）には足せない
    trials = [x for x in by.get('お試し（自動）', [])]
    if trials:
        st, j = sv(adj_order(trials[0], 1))
        rec('お試し（自動）の注文に調整数を足す→止まる(409)', '#270①', st == 409 and 'お試し' in msg(st, j), f'HTTP {st} {msg(st, j)[:200]}')
    else:
        rec('お試し（自動）の注文に調整数', '#270①', False, '2026-11 にお試し（自動）の注文なし', blocked=True)
    # 冷凍の便にも足せる（受付簿 #282①。以前コードにあった「冷凍の便には足せない」は根拠がなく外した）
    fz = [x for x in orders(a, '2026-11') + orders(a, '2026-12') if sites.get(x['site']) and any(d['t'] == 'frozen' for d in sites[x['site']]['dl']) and x['status'] in ('登録済', 'ES登録済', 'デフォルト')]
    if fz:
        f0 = fz[0]; fk = next(d['k'] for d in sites[f0['site']]['dl'] if d['t'] == 'frozen')
        o2 = copy.deepcopy(f0)
        pid = next((p_ for p_, v in o2['q'].items() if fk in v), None)
        if pid is None:
            rec('冷凍の便に調整数を足す', '#282①', False, '冷凍の便をもつ商品が注文にない', blocked=True)
        else:
            o2['a'].setdefault(pid, {})[fk] = 1
            st, j = sv(o2)
            got = [x for x in orders(a, f0['ym']) if x['no'] == f0['no']][0]
            rec(f'冷凍の便（{f0["no"]}・{fk}）に調整数を足す→保存できる', '#282①（冷凍の便にも足せる）', st < 400 and (got['a'].get(pid) or {}).get(fk) == 1, f'HTTP {st} {msg(st, j)[:160]} 保存後={ (got["a"].get(pid) or {}).get(fk) }')
    else:
        rec('冷凍の便に調整数を足す', '#282①', False, '冷凍の便をもつ注文が見つからない', blocked=True)
    # 取消は読み取り専用
    canc = [x for x in orders(a) if x['status'] == '取消']
    if canc:
        st, j = sv(copy.deepcopy(canc[0]), adjust=False)
        rec('取消した注文を保存→止まる（参照のみ）', '#277④に準ずる・domain', st == 409 and '取消' in msg(st, j), f'HTTP {st} {msg(st, j)[:200]}')
        st, j = sv(adj_order(canc[0], 1))
        rec('取消した注文に調整数を足す→止まる', '#277④に準ずる', st == 409, f'HTTP {st} {msg(st, j)[:200]}')
    else:
        rec('取消した注文の編集', '#264', False, '見本に取消の注文なし', blocked=True)
    # 権限：CS
    screen('商品注文管理（権限）')
    cur = [x for x in orders(a, '2026-11') if x['no'] == o['no']][0]
    before_a = copy.deepcopy(cur['a'])
    st, j = sv(adj_order(cur, 2), who=cs)
    rec('CS（Ad00002）が調整数つきで保存（adjust=true）→403', '#263（調整数はシステム管理だけ）', st == 403, f'HTTP {st} {msg(st, j)[:200]}')
    st, j = sv(adj_order(cur, 2), adjust=False, who=cs)
    after = [x for x in orders(a, '2026-11') if x['no'] == o['no']][0]
    rec('CS が adjust=false で調整数を変えた注文を保存→調整数は変わらない', '#263', after['a'] == before_a, f'HTTP {st} 調整前={json.dumps(before_a)[:80]} 調整後={json.dumps(after["a"])[:80]}')
    # domain API からの回避
    first_slot = None
    sl = a.d('order', 'forBranch', {'branchId': o['site'], 'cycleMonth': '2026-11'})[1]
    st0, ord_ = a.d('order', 'list', {'cycleMonth': '2026-11'})
    mine = [x for x in ord_ if x['branchId'] == o['site']][0]
    lines = [{'productId': l['productId'], 'slot': l['slot'], 'qty': l['qty']} for l in mine['lines'] if not l.get('kind') or l.get('kind') == '通常']
    slotkey = next(l['slot'] for l in lines if not l['slot'].startswith('冷凍'))
    pid0 = next(l['productId'] for l in lines if l['slot'] == slotkey)
    cur_o = [x for x in a.d('order', 'list', {'cycleMonth': '2026-11'})[1] if x['branchId'] == o['site']][0]
    adj_before = sum(x['qty'] for x in (cur_o.get('adjust') or []))
    # 決まった判定：CS が送った調整数（qty=4）が反映されたか＝呼ぶ前後で調整数の合計が変わったか（前の手順の調整数の合計が偶然4でも誤判定しない）
    st, j = cs.d('order', 'saveOrder', {'branchId': o['site'], 'cycleMonth': '2026-11', 'lines': lines, 'site': 'ops', 'accountId': 'Ad00002', 'adjust': [{'productId': pid0, 'slot': slotkey, 'qty': 4}]})
    again = [x for x in a.d('order', 'list', {'cycleMonth': '2026-11'})[1] if x['branchId'] == o['site']][0]
    adjsum = sum(x['qty'] for x in (again.get('adjust') or []))
    rec('CS が domain API（order.saveOrder・site=ops）で直接 adjust を送る→403（調整数はシステム管理だけ）', '#263', st == 403 and adjsum == adj_before, f'HTTP {st} {msg(st, j)[:160]} 調整数合計 {adj_before} → {adjsum}（変わっていれば CS が調整数を足せてしまっている）')
    # システム管理が domain API から直接 adjust を送る→通る。配送の明細の serviceQty（請求しない分）に入り、発注の必要数（purchasing.meta の svc）にも入る（#251・#252）
    st2, j2 = a.d('order', 'saveOrder', {'branchId': o['site'], 'cycleMonth': '2026-11', 'lines': lines, 'site': 'ops', 'accountId': 'Ad00010', 'adjust': [{'productId': pid0, 'slot': slotkey, 'qty': 4}]})
    rec('システム管理が domain API（order.saveOrder）で調整数を送る→保存できる', '#263', st2 == 200, f'HTTP {st2} {msg(st2, j2)[:160]}')
    ds = [x for x in a.d('delivery', 'list', {'cycleMonth': '2026-11', 'branchId': o['site']})[1] if f"{x['temp']}:{x['slot']}" == slotkey and not x.get('parentId')]
    svc_ln = []
    for dd in ds:
        det = a.d('delivery', 'detail', {'id': dd['id']})[1]
        svc_ln += [l for l in (data_of(det) or {}).get('lines', []) if l.get('productId') == pid0 and l.get('serviceQty')]
    rec('調整数は配送の明細の serviceQty に入る（予定数には含む・請求の対象から外す）', '#251・#252', bool(svc_ln) and svc_ln[0]['serviceQty'] == 4 and svc_ln[0]['plannedQty'] >= 4, f'明細={[(l["id"], l["plannedQty"], l.get("serviceQty")) for l in svc_ln]}')
    stm, jm = a.o('purchasing', 'meta', {})
    svc = (data_of(jm) or {}).get('svc', {}) if isinstance(jm, dict) else {}
    rec('調整数が発注の必要数の元（purchasing.meta の svc）に入る', '#252', any(k.startswith('2026-11|%s|' % pid0) and v >= 4 for k, v in svc.items()), f'svc={dict(list(svc.items())[:4])}')
    # 注文を元に戻す（調整数を 0 に）
    a.d('order', 'saveOrder', {'branchId': o['site'], 'cycleMonth': '2026-11', 'lines': lines, 'site': 'ops', 'accountId': 'Ad00010', 'adjust': []})
    # 代理登録の知らせ
    screen('商品注文管理（お客様へ知らせる）')
    tmpl = lambda: [n for n in a.d('notice', 'list', {'templateId': 'order_registered'})[1] if o['site'] in json.dumps(n, ensure_ascii=False)]
    n0 = len(tmpl())
    cur = [x for x in orders(a, '2026-11') if x['no'] == o['no']][0]
    c2 = copy.deepcopy(cur)
    # 数を入れ替える（通常数）：同じ便の2商品で ±1
    ks = [(pid, k) for pid, v in c2['q'].items() for k, n in v.items() if n > 0 and not k.startswith('f')]
    def shuffle(c2, flip=1):
        (p1, k1), (p2, k2) = ks[0], next(x for x in ks[1:] if x[1] == ks[0][1])
        c2['q'][p1][k1] -= flip; c2['q'][p2][k2] += flip
        return c2
    st, j = sv(shuffle(copy.deepcopy(cur)), adjust=False)
    n1 = len(tmpl())
    rec('運営が注文を保存（notify を送らない＝既定）→お客様へのお知らせは作られない', '#281（初期値は送らない）', st < 400 and n1 == n0, f'HTTP {st} {msg(st, j)[:120]} 通知 {n0}→{n1}')
    cur = [x for x in orders(a, '2026-11') if x['no'] == o['no']][0]
    st, j = sv(shuffle(copy.deepcopy(cur), -1), adjust=False, notify=False)
    n2 = len(tmpl())
    rec('notify=false で保存→お知らせなし', '#281', st < 400 and n2 == n1, f'HTTP {st} 通知 {n1}→{n2}')
    cur = [x for x in orders(a, '2026-11') if x['no'] == o['no']][0]
    st, j = sv(shuffle(copy.deepcopy(cur)), adjust=False, notify=True)
    n3 = len(tmpl())
    rec('notify=true（「お客様へ知らせる」をチェック）で保存→お知らせが作られる（拠点・法人あて）', '#281', st < 400 and n3 > n2, f'HTTP {st} 通知 {n2}→{n3}')
    cur = [x for x in orders(a, '2026-11') if x['no'] == o['no']][0]
    log0 = len(cur['log'])
    sv(adj_order(cur, 2), notify=True)
    n4 = len(tmpl()); cur2 = [x for x in orders(a, '2026-11') if x['no'] == o['no']][0]
    rec('調整数だけ足す（通常数は変わらない）→お知らせは出さない・変更履歴は残る', '#281・domain（onlyAdjust）', n4 == n3 and len(cur2['log']) > log0, f'通知 {n3}→{n4} 履歴 {log0}→{len(cur2["log"])}')
    # UI
    ui_order(ctxs, o)
    lock_tests(ctxs)
    rebuild_tests(ctxs)

def lock_tests(ctxs):
    a = ctxs['ops_full']; base = ctxs['base']
    screen('商品注文管理（発注締め日 B7・D7 ロック）')
    cyc = {c['id']: c for c in a.d('delivery', 'cycles', {})[1]}
    c = cyc['2026-11']; print('  cycle 2026-11', {k: c[k] for k in c if k in ('b7', 'd7', 'a1')})
    b7, d7 = c['b7'], c['d7']
    master = a.o('menu', 'master')[1]
    sites = {s['id']: s for s in master['sites']}
    def pick():
        for o in orders(a, '2026-11'):
            if o['status'] in ('登録済', 'ES登録済', 'デフォルト') and not sites[o['site']].get('trial'):
                dls = [d['k'] for d in sites[o['site']]['dl']]
                front = [k for k in dls if any(ch in k for ch in 'ab')] 
                return o
    # slot keys: 'c1','c2' …; 前半＝A・B週。master.a1 + site.dl の slot を調べる
    o = None
    for oo in orders(a, '2026-11'):
        if oo['status'] in ('登録済', 'ES登録済', 'デフォルト') and not sites[oo['site']].get('trial') and not sites[oo['site']].get('vm'):
            ks = {k for v in oo['q'].values() for k in v}
            if len(ks) >= 2: o = oo; break
    if not o:
        rec('B7/D7 ロック', '#270②', False, '2本以上の便をもつ注文が見つからない', blocked=True); return
    print('  lock target', o['no'], o['status'], sites[o['site']]['dl'])
    dlinfo = {d['k']: d for d in sites[o['site']]['dl']}
    keys = list(dlinfo)
    front = [k for k in keys if dlinfo[k]['slot'].split(':')[-1][:1] in 'AB' or dlinfo[k]['slot'][0] in 'AB'] if False else None
    def slot_week(k): return dlinfo[k]['slot'].split(':')[-1][0]
    fr = [k for k in keys if slot_week(k) in 'AB']; bk = [k for k in keys if slot_week(k) in 'CD']
    print('  front', fr, 'back', bk)
    def move(o2, k):
        """便 k の中で1個動かす（同じ便の2商品）"""
        pids = [pid for pid, v in o2['q'].items() if v.get(k, 0) > 0]
        if len(pids) < 2: return None
        o2 = copy.deepcopy(o2); o2['q'][pids[0]][k] -= 1; o2['q'][pids[1]][k] = o2['q'][pids[1]].get(k, 0) + 1; return o2
    def trial(day, k, adjust=False):
        base.post('/api/dev/reset'); ctxs_set_today(base, '')
        ctxs_set_today(base, day)
        cur = [x for x in orders(a, '2026-11') if x['no'] == o['no']][0]
        o2 = move(cur, k)
        if o2 is None: return None
        if adjust:
            pid = next(iter(o2['q'])); o2['a'].setdefault(pid, {})[k] = 1
        return a.o('menu', 'saveOrder', {'order': o2, 'adjust': adjust})
    for lab, ks in (('前半', fr), ('後半', bk)):
        if not ks: continue
        lim = b7 if lab == '前半' else d7
        k = ks[0]
        for day, exp in ((lim, True), (next_day(lim), False)):
            r = trial(day, k)
            if r is None: rec(f'{lab}の便 {k}：{day}', '#270②', False, '動かせる商品の組がない', blocked=True); continue
            st, j = r
            rec(f'{lab}の便 {k}：today={day}（{"締め日当日" if exp else "締め日の翌日"}）に数を直す→{"できる" if exp else "止まる（発注締め日を過ぎた）"}', '#264・#270②', (st < 400) == exp, f'HTTP {st} {msg(st, j)[:160]}')
        r = trial(next_day(lim), k, adjust=True)
        if r: rec(f'{lab}の便 {k}：締め日の翌日に調整数を足す→止まる', '#263', r[0] == 409, f'HTTP {r[0]} {msg(*r)[:160]}')
    # 便ごと：前半だけ締まった日、後半の便は直せる
    if fr and bk:
        day = next_day(b7)
        if day <= d7:
            r = trial(day, bk[0])
            if r: rec(f'前半だけ締まった日（{day}）に後半の便 {bk[0]} を直す→できる（便ごとに締める）', '#270②', r[0] < 400, f'HTTP {r[0]} {msg(*r)[:160]}')
    # 画面の shut フラグ
    base.post('/api/dev/reset'); ctxs_set_today(base, ''); ctxs_set_today(base, next_day(b7))
    cur = [x for x in orders(a, '2026-11') if x['no'] == o['no']][0]
    rec('注文の shut フラグ：前半の便＝true・後半の便＝false（締め日の翌日）', '#270②', all(cur['shut'].get(k) for k in fr) and not any(cur['shut'].get(k) for k in bk if next_day(b7) <= d7), f'shut={cur["shut"]} closeOn={cur["closeOn"]}')
    # UI：全部の便が締まった日は編集ボタンが出ない
    br = ctxs['browser']
    ctxs_set_today(base, next_day(d7))
    c, pg = ui_login(br, 'ops', 'Ad00010')
    try:
        pg.goto(BASE + f'/ops/menu/orders/{o["no"]}'); pg.wait_for_timeout(3000)
        b = pg.inner_text('body')
        btn = pg.get_by_role('button', name='編集', exact=True).count() + pg.get_by_role('link', name='編集', exact=True).count()
        rec('全部の便が発注締め日を過ぎた日：注文詳細に「編集」が出ない（参照のみ）', '#264', btn == 0, f'編集ボタン数={btn}')
        pg.goto(BASE + f'/ops/menu/orders/{o["no"]}/edit'); pg.wait_for_timeout(3000)
        n = pg.locator('input:not([disabled]):not([type=checkbox]):not([type=file])[inputmode=numeric], input[type=number]:not([disabled])').count()
        rec('  └編集の URL を直接開いても数量入力は入力不可（または編集できない旨）', '#264', n == 0 or '締' in pg.inner_text('body'), f'有効な数値入力={n}')
    except Exception as e:
        rec('締め後の注文画面（UI）', '#264', False, f'{type(e).__name__}: {str(e)[:150]}', blocked=True)
    finally:
        c.close()
    base.post('/api/dev/reset'); ctxs_set_today(base, '')

def next_day(d):
    import datetime
    y, m, dd = map(int, d.split('/')); x = datetime.date(y, m, dd) + datetime.timedelta(days=1)
    return x.strftime('%Y/%m/%d')

def ctxs_set_today(base, d):
    return base.post('/api/demo/today', data={'date': d}).status

def rebuild_tests(ctxs):
    a = ctxs['ops_full']; base = ctxs['base']
    screen('商品注文管理（自動注文の作り直し）')
    base.post('/api/dev/reset'); ctxs_set_today(base, '')
    m = a.o('menu', 'menu', {'ym': '2026-11'})[1]
    os0 = {o['no']: o for o in orders(a, '2026-11')}
    st_count = {}
    for o in os0.values(): st_count[o['status']] = st_count.get(o['status'], 0) + 1
    print('  before', st_count)
    # 標準数を変える：先頭商品＋1・次の商品−1（手で直した値）
    from sec_menu import data_of_menu, vw
    view = vw(a, '2026-11'); mm = view['menu']
    items = copy.deepcopy(mm['items'])
    items[0]['base']['std'] += 1; items[0]['manual'] = {**items[0].get('manual', {}), 'std': True}
    items[1]['base']['std'] -= 1; items[1]['manual'] = {**items[1].get('manual', {}), 'std': True}
    st, j = a.o('menu', 'saveMenuEdit', {'ym': '2026-11', 'data': data_of_menu(mm, items=items)})
    rec('公開中メニューの標準数を変えて保存→保存できる', '#266③', st < 400, f'HTTP {st} {msg(st, j)[:200]}')
    os1 = {o['no']: o for o in orders(a, '2026-11')}
    chg = {s: [n for n in os0 if os0[n]['status'] == s and json.dumps(os0[n]['q'], sort_keys=True) != json.dumps(os1[n]['q'], sort_keys=True)] for s in ('デフォルト', 'お試し（自動）', '登録済', 'ES登録済')}
    print('  変わった注文', {k: len(v) for k, v in chg.items()})
    rec('標準数の変更→作り直されるのは自動注文（デフォルト）だけ。登録済・ES登録済は変わらない', '#266③', not chg['登録済'] and not chg['ES登録済'], f'変わった: 自動注文={len(chg["デフォルト"])}件 お試し（自動）={len(chg["お試し（自動）"])}件 登録済={len(chg["登録済"])}件 ES登録済={len(chg["ES登録済"])}件')
    rec('標準数の変更→お試し（自動）は標準数を使わないので作り直されない', '#266③・台帳H', not chg['お試し（自動）'], f'お試し（自動）で変わった注文={chg["お試し（自動）"][:5]}')
    rec('標準数の変更→自動注文（デフォルト）が1件以上作り直される', '#255④・#266③', len(chg['デフォルト']) > 0, f'{len(chg["デフォルト"])}件')
    lg = [n for n in chg['デフォルト'][:1]]
    if lg: rec('  └作り直した注文に変更履歴「作り直し」が残る', '#266③', any('作り直' in x['what'] for x in os1[lg[0]]['log']), str(os1[lg[0]]['log'][:1]))
    # 調整数のある注文は作り直さない
    base.post('/api/dev/reset'); ctxs_set_today(base, '')
    os0 = {o['no']: o for o in orders(a, '2026-11')}
    auto = [o for o in os0.values() if o['status'] == 'デフォルト']
    if auto:
        t = auto[0]; t2 = copy.deepcopy(t)
        pid = next(iter(t2['q'])); k = next(k for k in t2['q'][pid] if not k.startswith('f'))
        t2['a'].setdefault(pid, {})[k] = 1
        st, j = a.o('menu', 'saveOrder', {'order': t2, 'adjust': True})
        view = vw(a, '2026-11'); mm = view['menu']; items = copy.deepcopy(mm['items'])
        items[0]['base']['std'] += 1; items[0]['manual'] = {'std': True}; items[1]['base']['std'] -= 1; items[1]['manual'] = {'std': True}
        a.o('menu', 'saveMenuEdit', {'ym': '2026-11', 'data': data_of_menu(mm, items=items)})
        os2 = {o['no']: o for o in orders(a, '2026-11')}
        rec('調整数のある自動注文は標準数を変えても作り直されない', '#266③', st < 400 and json.dumps(os2[t['no']]['q'], sort_keys=True) == json.dumps(os1.get(t['no'], t)['q'], sort_keys=True) if False else (st < 400 and json.dumps(os2[t['no']]['q'], sort_keys=True) == json.dumps(t['q'], sort_keys=True)), f'HTTP {st} 状態={os2[t["no"]]["status"]} 調整数={json.dumps(os2[t["no"]]["a"])[:60]}')
    base.post('/api/dev/reset'); ctxs_set_today(base, '')

def ui_order(ctxs, o):
    br = ctxs['browser']
    screen('商品注文管理（UI）')
    c, pg = ui_login(br, 'ops', 'Ad00002')
    try:
        pg.goto(BASE + f'/ops/menu/orders/{o["no"]}/edit'); pg.wait_for_timeout(3000)
        b = pg.inner_text('body')
        rec('CS が注文編集画面を開く→調整数の入力欄が無い／入力できない', '#263', pg.locator('input[aria-label*="調整数"]:not([disabled])').count() == 0, f'調整数入力(有効)={pg.locator("input[aria-label*=調整数]:not([disabled])").count()} 画面に「調整数」={"調整数" in b}')
        rec('  └「お客様へ知らせる」チェックがあり初期はチェックなし', '#281', 'お客様へ知らせる' in b and not pg.get_by_label('お客様へ知らせる').first.is_checked(), f'文言あり={"お客様へ知らせる" in b}')
    except Exception as e:
        rec('CS の注文編集画面', '#263・#281', False, f'{type(e).__name__}: {str(e)[:150]}', blocked=True)
    finally:
        c.close()
    c, pg = ui_login(br, 'ops', 'Ad00010')
    try:
        pg.goto(BASE + f'/ops/menu/orders/{o["no"]}/edit'); pg.wait_for_timeout(3000)
        b = pg.inner_text('body')
        rec('システム管理（Ad00010）の注文編集画面に調整数の欄・「お客様へ知らせる」がある', '#263・#281', '調整数' in b and 'お客様へ知らせる' in b, f'調整数={"調整数" in b} 知らせる={"お客様へ知らせる" in b}')
        try:
            chk = pg.get_by_label('お客様へ知らせる').first
            rec('  └「お客様へ知らせる」の初期値＝チェックなし', '#281', not chk.is_checked(), f'checked={chk.is_checked()}')
        except Exception as e:
            rec('  └「お客様へ知らせる」の初期値＝チェックなし', '#281', False, f'チェックボックスが取れない {e}'[:150], blocked=True)
    finally:
        c.close()
