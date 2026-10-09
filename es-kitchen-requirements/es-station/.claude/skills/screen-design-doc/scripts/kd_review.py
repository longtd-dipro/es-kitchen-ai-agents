# -*- coding: utf-8 -*-
"""役割レビューの「機械で確かめられる分」（BA・QC・UI/UX）。ブラウザも LLM も使わない（token 0）。
判断が要る分は references/role_review.md のチェックリストを LLM（サブエージェント1つ）に渡す。
make.py --review <データ.py>   （--all で省略せず全部出す）
ここにあるのは「抜けている疑い」。誤検出がありうるので、直す前に項目を見る。
"""
import re

INPUT = {'text', 'textarea', 'date', 'month', 'file'}
ACT = re.compile(r'登録|保存|更新|送信|申請|承認|却下|取消|削除|発注|確定|取込')
SKIP_B1 = re.compile(r'ページ|閉じる|戻る|タブ|基本情報')
DANGER = re.compile(r'削除|取消|却下|無効|解約|停止')
GATED = re.compile(r'削除|編集|承認|却下|取消|無効|解約|停止|確定')
SYN = [('登録系', ['新規登録', '新規作成', '登録', '追加']), ('保存系', ['保存', '更新', '変更を保存', '変更する']),
       ('戻る系', ['戻る', 'キャンセル', '閉じる', '取りやめ']), ('検索系', ['検索', '絞り込み', '絞込'])]

def _t(v):
    return (v[0] if isinstance(v, (list, tuple)) and v else v) or ''

def review(D, views=None):
    """-> [(role, rule, where, text, sev)]  sev: 高／中／低。views＝撮影の記録（cache.json の views）。あれば「表示の確認」も出す"""
    out = []
    add = lambda role, rule, where, text, sev='中': out.append((role, rule, where, text, sev))
    by_code = {}
    for v in D.VIEWS:
        by_code.setdefault(v['code'], []).append(v)
        for it in v['items']:
            w = '%s No.%s %s' % (v['id'], it['no'], it.get('ja', ''))
            kind, ja = it.get('kind', ''), it.get('ja', '')
            has_rule = bool(it.get('detail') or it.get('pattern'))
            # ---- BA：業務の動きが書かれているか
            if kind in ('button', 'link', 'tab', 'toast', 'modal') and it['no'].count('.') >= 1 and not has_rule and not it.get('err') and not SKIP_B1.search(ja):
                add('BA', 'B1', w, '押したとき／出たときの動き（詳細・パターン・メッセージ）が書かれていない')
            if it.get('req') == '条件付き' and not it.get('cond'):
                add('BA', 'B2', w, '必須が「条件付き」なのに条件（cond）がない', '高')
            if kind == 'select' and not (it.get('detail') or it.get('init')):
                add('BA', 'B3', w, '選択肢と初期値が書かれていない')
            # ---- QC：入力チェック・メッセージ
            if kind in INPUT and not it.get('len'):
                add('QC', 'Q1', w, '型・桁数（len）がない → 境界値のテストが作れない')
            if it.get('req') == '○' and kind in INPUT | {'select'} and not it.get('err') and not (kind == 'select' and it.get('init')):
                add('QC', 'Q2', w, '必須なのに未入力のメッセージ ID（err）がない', '高')
            if kind == 'file' and not (it.get('detail') or it.get('pattern')):
                add('QC', 'Q3', w, 'ファイルの形式・サイズ上限・複数可否が書かれていない', '高')
            if kind in ('button', 'link') and ACT.search(ja) and not (it.get('err') or it.get('pattern')):
                add('QC', 'Q4', w, '実行系ボタンなのに成功・失敗のメッセージ ID／共通パターンがない', '高' if DANGER.search(ja) else '中')
            if kind in ('button', 'link') and GATED.search(ja) and not (it.get('cond') or it.get('pattern')):
                add('QC', 'Q5', w, '表示・活性の条件（権限・状態）が書かれていない')
            # ---- UI/UX
            if kind in ('button', 'link') and len(ja) > 14:
                add('UX', 'U1', w, 'ボタン名が長い（%d 文字）' % len(ja), '低')
        n = len(v['items'])
        if n > 45:
            add('UX', 'U2', '%s %s' % (v['id'], _t(v.get('state'))), '1画面の番号が %d 個。画面・タブを分ける余地' % n, '低')
    # 状態の抜け候補（画面コードごとに調べ、機能に1行でまとめる）
    miss = {'Q6': [], 'U3': [], 'B4': []}
    for code, vs in by_code.items():
        names = ' '.join(_t(v.get('state')) for v in vs)
        its = [it for v in vs for it in v['items']]
        if any(i.get('kind') in INPUT for i in its) and not re.search(r'エラー|入力チェック|検証|不備', names): miss['Q6'].append(code)
        if any(i.get('kind') == 'table' for i in its) and not re.search(r'0件|空|なし|該当', names): miss['U3'].append(code)
        if any(ACT.search(i.get('ja', '')) and i.get('kind') == 'button' for i in its) and not re.search(r'権限|閲覧|参照のみ|不可', names): miss['B4'].append(code)
    for rule, role, text, sev in (('Q6', 'QC', '入力のある画面に「入力エラー」の状態がない', '中'), ('U3', 'UX', '一覧のある画面に「0件」の状態がない', '中'),
                                  ('B4', 'BA', '操作ボタンのある画面に「権限なし／参照のみ」の状態がない（権限表と照らす）', '低')):
        if miss[rule]: add(role, rule, '画面 %s' % '・'.join(c.split('_')[-1] for c in miss[rule]), text, sev)
    # ボタン名のゆれ（同じ意味の別の言い方）
    labels = {it.get('ja', '') for v in D.VIEWS for it in v['items'] if it.get('kind') in ('button', 'link')}
    for name, words in SYN:
        used = sorted(w for w in words if w in labels)
        if len(used) >= 2:
            add('UX', 'U4', '機能全体', '%sのボタン名がゆれている：%s → 共通の言い方に揃える' % (name, '／'.join(used)), '中')
    # OPEN（お客様確認待ち）
    for v in D.VIEWS:
        for it in v['items']:
            if it.get('open'):
                add('BA', 'B5', '%s No.%s %s' % (v['id'], it['no'], it.get('ja', '')), 'OPEN：%s' % _t(it['open']), '中')
    if views: layout_review(D, views, add)
    return out

# ---------------------------------------------------------------- 表示の確認（撮影のときに測った数字から。LLM も要らない）
PRIMARY = re.compile(r'登録|保存|検索|送信|申請|承認|確定|発注|更新')
SECOND = re.compile(r'戻る|キャンセル|閉じる|クリア|リセット')
HALF = re.compile(r'数値|数字|半角|桁|コード|ID|電話|郵便|金額|日付|年月')

def _n(s):
    m = re.search(r'(\d+)', _t(s) if not isinstance(s, str) else s)
    return int(m.group(1)) if m else None

def layout_review(D, views, add):
    for v in D.VIEWS:
        rv = views.get(v['id'], {})
        lay = rv.get('layout')
        if not lay: continue
        vh, vw = rv.get('vh', 900), rv.get('vw', 1440)
        st = '%s %s' % (v['id'], _t(v.get('state')))
        rows = []
        for it in v['items']:
            L = lay.get(it['no'])
            if not L: continue
            kind, ja, w = it.get('kind', ''), it.get('ja', ''), '%s No.%s %s' % (v['id'], it['no'], it.get('ja', ''))
            rows.append((it, L))
            # D1 入力欄が最大文字数ぶん見えるか
            if 'capF' in L:
                n = _n(it.get('len')) or L.get('max')
                half = bool(HALF.search(_t(it.get('len')) + ja)) or L.get('type') in ('number', 'tel', 'date', 'month') or bool(re.match(r'^[0-9\-,./: ]+$', _t(it.get('ex'))))
                cap = L['capH'] if half else L['capF']
                if L.get('lines'): cap *= L['lines']
                if n and cap < n:
                    if n <= 40 or cap < 20:
                        add('UX', 'D1', w, '最大 %d 字なのに欄は%s約 %d 字ぶんの幅（幅 %dpx）→ 欄を広げる%s' % (
                            n, '半角で' if half else '全角で', cap, L['w'], '／行数を増やす' if L.get('lines') else ''), '中' if cap >= n * 0.6 else '高')
            if L.get('selOver'):
                add('UX', 'D2', w, '選択肢「%s」が欄より %dpx 長く、切れて見える → 欄を広げる' % (L['selTxt'], L['selOver']))
            if L.get('clipX') or L.get('ellip') or L.get('clipY'):
                add('UX', 'D3', w, '文字が切れている（%s）→ 幅・折り返し・ツールチップを決める' % ('…で省略' if L.get('ellip') else '枠からはみ出して非表示'), '高')
            if L.get('clipKids'):
                add('UX', 'D3', w, '中の %d か所で文字が切れている（例：%s）' % (L['clipKids'], '／'.join(L.get('clipEx', []))), '中')
            if kind in ('button', 'link', 'check', 'radio', 'tab') and L['h'] and L['h'] < 24:
                add('UX', 'D8', w, '押す場所が小さい（高さ %dpx）' % L['h'], '低')
        if rv.get('sw', 0) > vw + 16:
            add('UX', 'D4', st, '横スクロールが出る（ページ幅 %dpx > 画面 %dpx）' % (rv['sw'], vw))
        # D5 初期表示の外（スクロールしないと見えない）必須項目・主ボタン
        below = [it['no'] for it, L in rows if L['y'] + L['h'] > vh and (it.get('req') == '○' or (it.get('kind') == 'button' and PRIMARY.search(it.get('ja', ''))))]
        if below:
            add('UX', 'D5', st, '必須項目・主ボタンが初期表示（高さ %dpx）の外：No.%s → 位置・固定表示を検討' % (vh, '・'.join(below[:8])), '低')
        # D6 並び：任意の後ろに必須が来る（上から下・左から右の順）
        inputs = sorted([(L['y'] // 20, L['x'], it) for it, L in rows if it.get('kind') in INPUT | {'select'}], key=lambda r: (r[0], r[1]))
        seen_opt, late = None, []
        for _, _, it in inputs:
            if it.get('req') in ('－', '', None): seen_opt = seen_opt or it['no']
            elif it.get('req') == '○' and seen_opt: late.append(it['no'])
        if late:
            add('UX', 'D6', st, '任意項目 No.%s より下に必須 No.%s がある → 必須を上へ（グループの意味があるなら残す）' % (seen_opt, '・'.join(late[:6])), '低')
        # D7 番号の順と、画面の上から下の順（大項目）がずれる
        top = sorted([(L['y'] // 30, L['x'], it['no']) for it, L in rows if '.' not in it['no']], key=lambda r: (r[0], r[1]))
        order = [n for _, _, n in top]
        if order and order != sorted(order, key=lambda n: int(n) if n.isdigit() else 0):
            add('BA', 'D7', st, '大項目の番号の順が画面の並びと違う（画面の順：%s）→ 番号を振り直すか並びを直す' % '→'.join(order[:10]), '低')
        # D9 主ボタンと副ボタンが同じ見た目（優先度が伝わらない）
        prim = [(it, L) for it, L in rows if it.get('kind') == 'button' and PRIMARY.search(it.get('ja', ''))]
        sec = [(it, L) for it, L in rows if it.get('kind') == 'button' and SECOND.search(it.get('ja', ''))]
        for pi, pl in prim[:1]:
            for si, sl in sec[:1]:
                if (pl['bg'], pl['col'], pl['bd'], pl['fw']) == (sl['bg'], sl['col'], sl['bd'], sl['fw']):
                    add('UX', 'D9', st, '主ボタン No.%s「%s」と副ボタン No.%s「%s」が同じ見た目 → 主を目立たせる' % (pi['no'], pi['ja'], si['no'], si['ja']), '中')

ROLE = {'BA': 'BA（業務・要件）', 'QC': 'QC（テスト観点）', 'UX': 'UI/UX'}

def render(res, full=False, per_rule=4, only=None):
    """token を使わないよう、同じルールは per_rule 件まで（残りは件数だけ。--all で全部）"""
    lines, shown = [], {}
    order = {'高': 0, '中': 1, '低': 2}
    if only:                                          # 例 'D'＝表示の確認（D1〜D9）だけ。撮影のあとに、データ段階の指摘をもう一度出さない
        res = [r for r in res if r[1].startswith(only)]
    for role in ('BA', 'QC', 'UX'):
        rs = sorted([r for r in res if r[0] == role], key=lambda r: (r[1], order[r[4]]))
        lines.append('■ %s：%d 件' % (ROLE[role], len(rs)))
        cnt = {}
        for _, rule, where, text, sev in rs:
            cnt[rule] = cnt.get(rule, 0) + 1
            if full or cnt[rule] <= per_rule:
                lines.append('  %s [%s] %s：%s' % (rule, sev, where, text))
        for rule, n in cnt.items():
            if not full and n > per_rule:
                lines.append('  %s …ほか %d 件（--all で全部）' % (rule, n - per_rule))
    return '\n'.join(lines)
