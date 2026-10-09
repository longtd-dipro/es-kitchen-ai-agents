# -*- coding: utf-8 -*-
"""
データの確認ルール（make.py --check で使う）。ここで止まったものは「作る前に」ユーザーに確認する。
  - errs     … データの誤り（キー不足・番号重複・二か国語の抜け・データ例なし・文言の決まり違反）
  - pending  … 未確認（chk・diff・「要確認」「（案）」「未定」「仮」の記述）。ユーザーに聞いて決めるか、open（お客様確認待ち）にする
文言の決まりの説明は references/message_style.md。
"""
import re

JP = re.compile(r'[぀-ヿ㐀-鿿]')
PH = re.compile(r'\{[^}]*\}')
INPUT_KINDS = {'text', 'textarea', 'select', 'month', 'date', 'check', 'radio', 'file', 'card'}
SITES = {'corp': '法人・拠点', 'ops': '運営', 'driver': 'ドライバー', 'carrier': '委託配送', 'supplier': '仕入先', 'warehouse': '倉庫'}
UNSURE = ['要確認', '（案）', '(案)', '未定', '仮の', '仮置き', 'TBD', '検討中']

# 型・桁数の訳（これで訳しきれない日本語が残れば [ja, vi] で書いてもらう）
LEN_VI = [('複数選択', 'Chọn nhiều'), ('文字列', 'Chuỗi'), ('選択', 'Chọn'), ('年月日', 'Ngày'), ('年月', 'Năm-tháng'), ('日付', 'Ngày'),
          ('時刻', 'Giờ'), ('整数', 'Số nguyên'), ('数値', 'Số'), ('金額', 'Số tiền'), ('円', 'yên'), ('件', ' mục'), ('桁', ' chữ số'),
          ('保存は', 'lưu dạng'), ('以内', ' trở xuống'), ('以上', ' trở lên'), ('（', ' ('), ('）', ')'), ('／', ' / '), ('・', ', ')]
REQ_VI = {'○': 'Có', '－': 'Không', '条件付き': 'Có điều kiện', '': ''}

# 文言の決まり（tone c＝法人・拠点向け、o＝社内向け）。(使わない表現, 代わり)
NG_ALL = [('して下さい', 'してください'), ('せよ', '〜してください'), ('しろ', '〜してください'), ('すること。', '〜してください。'),
          ('エラーです', '何がどうだったかを書く'), ('不正な', '正しくない'), ('！', '。')]
NG_C = [('入力してください', 'ご入力ください'), ('確認してください', 'ご確認ください'), ('連絡してください', 'ご連絡ください'),
        ('利用できません', 'ご利用いただけません'), ('してもらえますか', 'していただけますか')]
NG_O = [('ご入力ください', '入力してください'), ('ご確認ください', '確認してください'), ('いただけますでしょうか', 'してください'),
        ('申し訳ございません', '（社内向けでは書かない）'), ('お手数ですが', '（社内向けでは書かない）'), ('させていただ', 'します')]
MAXLEN = [('インライン', 40), ('表の下', 40), ('選択肢', 40), ('後ろ', 40), ('トースト', 40)]   # それ以外は 1文 80 文字

def tone_of(site):
    return 'c' if site == 'corp' else 'o'

def msg_ja(m, tone):
    return m.get('ja_c' if tone == 'c' else 'ja_o') or ''

def used_ids(D):
    return {c for v in D.VIEWS for it in v['items'] for c in it.get('err', [])}

def pair(v):
    if not v: return ['', '']
    return list(v) if isinstance(v, (list, tuple)) else [v, '']

def len_pair(v):
    if isinstance(v, (list, tuple)): return list(v)
    s = v or ''
    vi = s
    for a, b in LEN_VI: vi = vi.replace(a, b)
    return [s, vi.strip()]

def has_jp(s): return bool(JP.search(s or ''))
# 運営Web の画面名「要確認」（メニュー・画面・パネル）は固有名詞。「未確認の記述」とは区別する
PROPER_NOUNS = ['「要確認」', '要確認（n件）', '要確認（AW_RVEW）', '要確認のパネル', '要確認パネル', '要確認画面', '要確認の一覧', '要確認の区分', '要確認へ', '要確認の画面', '「要確認：', '「要確認は', '要確認　n件']
def unsure(s):
    if isinstance(s, (list, tuple)): s = s[0] if s else ''
    s = s or ''
    for n in PROPER_NOUNS: s = s.replace(n, '')
    # 画面名として文中で使う「要確認に出す」「要確認の件数」などは固有名詞（「要確認：」「（要確認）」の未確認の記述だけ止める）
    s = re.sub(r'要確認(?=[にへをのとがはでもや])', '', s)
    return [w for w in UNSURE if w in s]
def strip_ph(s): return PH.sub('', s or '')

def bi(where, name, v, errs, need=False):
    """[ja, vi] が両方そろっているか"""
    if not v:
        if need: errs.append('%s：%s がない' % (where, name))
        return
    if not isinstance(v, (list, tuple)) or len(v) < 2:
        errs.append('%s：%s は [日本語, ベトナム語] の2つで書く' % (where, name)); return
    ja, vi = v[0], v[1]
    if ja and not vi: errs.append('%s：%s のベトナム語がない' % (where, name))
    if vi and not ja: errs.append('%s：%s の日本語がない' % (where, name))
    if ja and vi and ja == vi and has_jp(ja) and name not in ('ex',):
        errs.append('%s：%s のベトナム語が日本語のまま' % (where, name))

# ---------------------------------------------------------------- 共通メッセージ
def lint_msg(k, m, errs):
    where = m.get('where', '')
    lim = next((n for w, n in MAXLEN if w in where), 80)
    texts = [('c', m.get('ja_c')), ('o', m.get('ja_o'))]
    if 'ja' in m and not (m.get('ja_c') or m.get('ja_o')):
        errs.append('%s：ja だけで書かれている。法人・拠点向け ja_c と 社内向け ja_o に分ける（references/message_style.md）' % k); return
    if not (m.get('ja_c') or m.get('ja_o')): errs.append('%s：文言（ja_c／ja_o）がない' % k)
    if not m.get('vi'): errs.append('%s：ベトナム語 vi がない' % k)
    for key in ('type', 'where'):
        if not m.get(key): errs.append('%s：%s がない' % (k, key))
    phs = None
    for tone, t in texts:
        if not t: continue
        lab = '法人向け' if tone == 'c' else '社内向け'
        parts = t.split('／')
        for i, p in enumerate(parts):
            if len(strip_ph(p)) > lim:
                errs.append('%s（%s）：長すぎる（%d 文字。%s は %d 文字まで）「%s」' % (k, lab, len(strip_ph(p)), where, lim, p))
            title = m.get('type') == '確認' and i == 0 and len(parts) > 1
            if not title and not re.search(r'[。？）]$', p.strip()):
                errs.append('%s（%s）：文の終わりに「。」か「？」がない「%s」' % (k, lab, p))
        for ng, ok in NG_ALL + (NG_C if tone == 'c' else NG_O):
            if ng in t: errs.append('%s（%s）：「%s」は使わない → 「%s」' % (k, lab, ng, ok))
        s = set(PH.findall(t))
        if phs is not None and s != phs: errs.append('%s：法人向けと社内向けで差し込み（{…}）が違う' % k)
        phs = s
    vi = m.get('vi', '')
    if phs is not None:
        if ('{項目名}' in phs) != ('{tên mục}' in vi): errs.append('%s：{項目名} と ベトナム語の {tên mục} が対応していない' % k)
        if ('{n}' in phs) != ('{n}' in vi): errs.append('%s：{n} が日本語とベトナム語で対応していない' % k)

def dup_ids(path):
    """MESSAGES／MAILS の辞書に同じキーが2回ある場合（後のものが黙って前のものを消す）-> {キー: [行…]}"""
    import ast
    try: tree = ast.parse(open(path, encoding='utf-8').read())
    except Exception: return {}
    out = {}
    for n in ast.walk(tree):
        if isinstance(n, ast.Assign) and any(getattr(x, 'id', '') in ('MESSAGES', 'MAILS') for x in n.targets) and isinstance(n.value, ast.Dict):
            seen = {}
            for key in n.value.keys:
                if isinstance(key, ast.Constant): seen.setdefault(key.value, []).append(key.lineno)
            out.update({k: v for k, v in seen.items() if len(v) > 1})
    return out

def check_common(C):
    errs = []
    for k, lines in sorted(dup_ids(getattr(C, '__file__', '') or '').items()):
        errs.append('%s：同じ ID が %d か所に定義されている（%s行）。後のものが前のものを黙って消す → 別の ID に付け直す（kd_ask.py ids --next）' % (k, len(lines), '・'.join(map(str, lines))))
    seen = {}
    for k, m in C.MESSAGES.items():
        lint_msg(k, m, errs)
        for t in (m.get('ja_c'), m.get('ja_o')):
            n = re.sub(r'[\s　。]', '', t or '')
            if n and n in seen and seen[n] != k:
                errs.append('%s と %s が同じ文言。1つの ID にまとめる（同じ意味は同じ ID）' % (seen[n], k))
            if n: seen.setdefault(n, k)
        if m.get('diff'):
            errs.append('【未確認】%s：%s（ユーザーに確認して文言を決め、diff を消す。お客様に聞くなら open に移す）' % (k, m['diff']))
    for k, m in getattr(C, 'MAILS', {}).items():
        for key in ('ja', 'vi', 'to', 'when'):
            if not m.get(key): errs.append('メール %s：%s がない' % (k, key))
    return errs

# ---------------------------------------------------------------- 画面のデータ
def is_url(s):
    return bool(re.match(r'^https?://', s or ''))

def vi_sanity(where, it, errs):
    """ベトナム語の訳の取り違い・抜けを止める（翻訳をサブエージェントに頼んだあと、受け取る前の確認）。
    ① 詳細・条件・チェック・初期値の訳が項目名と同じ（欄の入れ違い）／同じ項目の別の欄と同じ
    ② 日本語 12 字以上で、ベトナム語の長さが日本語の 0.5 倍未満・6 倍超（訳の抜け・入れ違い。人が訳したデータは 0.53〜3.8 倍）
    （画面名をそのまま残す・数字だけの訳は正当なので、「英字がない」では止めない）"""
    seen = {}
    for k in ('detail', 'valid', 'cond', 'init'):
        v = it.get(k)
        if not isinstance(v, (list, tuple)) or len(v) < 2 or not v[0] or not v[1]: continue
        ja, vi = str(v[0]), str(v[1]).strip()
        if vi == str(it.get('vi', '')).strip() and ja != str(it.get('ja', '')).strip():
            errs.append('%s：%s のベトナム語が項目名と同じ「%s」（訳の入れ違いの疑い）' % (where, k, vi[:30]))
        elif vi in seen and ja != seen[vi][1]:
            errs.append('%s：%s と %s のベトナム語が同じ（訳の入れ違いの疑い）' % (where, k, seen[vi][0]))
        seen.setdefault(vi, (k, ja))
        if len(ja) >= 12:
            r = len(vi) / len(ja)
            if r < 0.5 or r > 6:
                errs.append('%s：%s のベトナム語の長さが日本語の %.1f 倍（日本語 %d 字・ベトナム語 %d 字）→ 訳の抜け・入れ違いの疑い' % (where, k, r, len(ja), len(vi)))

def check_data(D, C, P):
    errs, pending = [], []
    for k in ('TITLE', 'BASENAME', 'IMG_PREFIX', 'DEMO_FILE', 'SCREENS', 'VIEWS', 'SYSTEM'):
        if not getattr(D, k, None): errs.append('%s がない' % k)
    if errs: return errs, pending
    if is_url(D.DEMO_FILE):                       # 本物の Web：状態ごとに url、ログインは LOGIN
        for v in D.VIEWS:
            if not str(v.get('url', '')).startswith('/'):
                errs.append('%s：url がない（本物の Web のときは状態ごとに /ops/... の形で書く）' % v.get('id', '?'))
        L = getattr(D, 'LOGIN', None)
        if L is not None and not L.get('loginId'):
            errs.append('LOGIN：loginId がない')
    if D.SITE not in SITES:
        errs.append('SITE がない・違う（%s のどれか。法人・拠点は corp）' % '／'.join(SITES))
    bi('TITLE', 'TITLE', D.TITLE, errs, True)
    bi('SYSTEM', 'SYSTEM', [D.SYSTEM.get('ja'), D.SYSTEM.get('vi')], errs, True)
    for w in unsure(getattr(D, 'CODE_NOTE', '')): pending.append('CODE_NOTE：「%s」→ Screen Code を確定する' % w)
    codes = set()
    for s in D.SCREENS:
        codes.add(s['code']); bi('画面 ' + s['code'], '画面名', [s.get('ja'), s.get('vi')], errs, True)
    tone = tone_of(D.SITE)
    pats = getattr(P, 'PATTERNS', {}) if P else {}
    for v in D.VIEWS:
        vid = v.get('id', '?')
        if v.get('code') not in codes: errs.append('%s：code %s が SCREENS にない' % (vid, v.get('code')))
        bi(vid, 'state', v.get('state'), errs, True); bi(vid, 'note', v.get('note'), errs)
        if v.get('chk'): pending.append('%s（状態）：%s' % (vid, pair(v['chk'])[0]))
        seen = set()
        for it in v['items']:
            no = it.get('no'); where = '%s No.%s %s' % (vid, no, it.get('ja', ''))
            if no in seen: errs.append('%s：番号が重複' % where)
            seen.add(no)
            for k in ('no', 'ja', 'vi', 'sel', 'kind'):
                if not it.get(k): errs.append('%s：%s がない' % (where, k))
            if it.get('ja') and it.get('vi') == it.get('ja') and has_jp(it['ja']):
                errs.append('%s：項目名のベトナム語が日本語のまま' % where)
            for k in ('detail', 'init', 'cond', 'valid', 'ex', 'open', 'demo_ok'):
                bi(where, k, it.get(k), errs)
            vi_sanity(where, it, errs)
            if it.get('kind') in INPUT_KINDS and not it.get('ex'):
                errs.append('%s：データ例 ex がない（入力項目は必須。[例の値, giải thích tiếng Việt]）' % where)
            ln = len_pair(it.get('len', ''))
            if has_jp(ln[1]): errs.append('%s：型・桁数「%s」を訳しきれない → len を [日本語, ベトナム語] で書く' % (where, ln[0]))
            if it.get('pattern') and it['pattern'] not in pats:
                errs.append('%s：共通パターン %s が _共通パターン.py にない' % (where, it['pattern']))
            for c in it.get('err', []):
                m = C.MESSAGES.get(c)
                if m is None and c not in getattr(C, 'MAILS', {}):
                    errs.append('%s：メッセージ %s が _共通_メッセージ.py にない' % (where, c))
                elif m is not None and not msg_ja(m, tone):
                    errs.append('%s：メッセージ %s に%sの文言（%s）がない' % (where, c, '法人・拠点向け' if tone == 'c' else '社内向け', 'ja_c' if tone == 'c' else 'ja_o'))
            if it.get('chk'):
                pending.append('%s：%s' % (where, pair(it['chk'])[0]))
            for k in ('ja', 'detail', 'init', 'cond', 'valid', 'len'):
                val = it.get(k); val = val[0] if isinstance(val, (list, tuple)) else val
                for w in unsure(val): pending.append('%s：%s に「%s」→ 決めてから書く' % (where, k, w))
    used = {it.get('pattern') for v in D.VIEWS for it in v['items'] if it.get('pattern')}
    for pid in sorted(x for x in used if x in pats):
        p = pats[pid]
        bi('共通パターン ' + pid, 'name', p.get('name'), errs, True)
        for x in p.get('rules', []):
            bi('共通パターン ' + pid, 'rules', x, errs)
            for w in unsure(pair(x)[0]): pending.append('共通パターン %s：「%s」に「%s」→ 決めてから使う' % (pid, pair(x)[0], w))
        for c in p.get('msgs', []):
            if c not in C.MESSAGES: errs.append('共通パターン %s：メッセージ %s が _共通_メッセージ.py にない' % (pid, c))
    for i, c in enumerate(getattr(D, 'CHANGES', [])):
        w = 'CHANGES %d（版 %s）' % (i + 1, c.get('ver', '?'))
        for k in ('ver', 'date', 'no', 'type', 'reason', 'impact'):
            if not c.get(k): errs.append('%s：%s がない' % (w, k))
        if c.get('type') and c['type'] not in ('追加', '変更', '削除'): errs.append('%s：type は 追加／変更／削除' % w)
        if c.get('type') == '変更' and not (c.get('before') and c.get('after')): errs.append('%s：変更は before と after を書く' % w)
        for k in ('before', 'after', 'reason', 'impact'): bi(w, k, c.get(k), errs)
    for i, d in enumerate(D.DECISIONS):
        for k in ('date', 'target', 'q', 'a', 'src'):
            if not d.get(k): errs.append('DECISIONS %d：%s がない' % (i + 1, k))
        bi('DECISIONS %d' % (i + 1), 'q', d.get('q'), errs); bi('DECISIONS %d' % (i + 1), 'a', d.get('a'), errs)
    return errs, pending
