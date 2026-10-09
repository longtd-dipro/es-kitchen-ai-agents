# -*- coding: utf-8 -*-
"""複数のスレッド（別々の作業ブランチ）で動かすときの、重なり・聞き直し・ID の衝突を防ぐ確認。読み取りだけ（git grep／git diff。チェックアウトしない）。

  python3 kd_ask.py gate "語 語 | 質問文" …   聞こうとしている質問を1つずつ判定：答えあり／共通（受付簿へ）／聞いてよい。**表を作る前に必ず**（-f 質問.txt も可）
  python3 kd_ask.py digest <画面コードか語>    その画面で「もう決まったこと」の一覧（各画面の DECISIONS・台帳・受付簿）。**作業の最初に**
  python3 kd_ask.py check <語> [<語>…]     決定を探す。main と、最近動いている他の claude/* ブランチ（未マージ）。**ユーザーに聞く前に必ず**
  python3 kd_ask.py who [パターン…]        同じファイルを触っている他のブランチ。パターンなし＝自分の変更（コミット前も含む）。**作業を始める前・push の前に**
  python3 kd_ask.py ids [--next E [--range 220-239]]   message ID（E/W/I/Q/S）と受付簿の番号が他のブランチと重なっていないか／次の空き番号

別のスレッドの答えは、そのブランチを push していないと見えない。**答えをもらったら、すぐ（次の作業の前に）台帳か受付簿へ1行書いて commit・push する。**
オプション：--days N（見る期間。既定14日）／--no-fetch（git fetch を省く）／--all（省略せず全部）
"""
import argparse, fnmatch, os, re, subprocess, sys, time

DECISION_FILES = ['docs/決定台帳.md', 'docs/決定の受付簿.md', 'docs/05_画面設計書/確認メモ_*.md', 'docs/05_画面設計書/引き継ぎ_*.md']
DATA_GLOB = 'docs/05_画面設計書/データ/*.py'            # 各画面の DECISIONS（質問 q と答え a が入っている。check/gate はここも見る）
STD_FILES = ['.claude/skills/screen-design-doc/references/input_standard.md', '.claude/skills/screen-design-doc/references/message_style.md',
             '.claude/skills/screen-design-doc/references/common_answers.md']
DATA_LINE = re.compile(r'^\s*(\{"date"|"q"\s*:|"a"\s*:|"target"\s*:|"src"\s*:)')   # データ(.py)はコードを除き、決定の行だけ拾う
SHARED = ('docs/決定台帳.md', 'docs/決定の受付簿.md', 'docs/05_画面設計書/データ/_共通_メッセージ.py', 'docs/05_画面設計書/データ/_共通パターン.py')
MSG_FILE = 'docs/05_画面設計書/データ/_共通_メッセージ.py'
LEDGER_INBOX = 'docs/決定の受付簿.md'

def git(*args, check=False):
    r = subprocess.run(('git', '-c', 'core.quotepath=false') + args, capture_output=True, text=True, encoding='utf-8', errors='replace')
    return r.stdout if r.returncode == 0 or not check else ''

def current_branch():
    return git('rev-parse', '--abbrev-ref', 'HEAD').strip()

def fetch():
    subprocess.run(['git', 'fetch', '-q', 'origin', 'main', '+refs/heads/claude/*:refs/remotes/origin/claude/*'], capture_output=True)

def branches(days):
    """最近動いている他のブランチ -> [(ref, 日付, 先行コミット数)]"""
    me = current_branch()
    out, now = [], time.time()
    for line in git('for-each-ref', '--format=%(refname:short)|%(committerdate:short)|%(committerdate:unix)', 'refs/remotes/origin/claude/').splitlines():
        ref, date, ts = line.split('|')
        if ref == 'origin/' + me or now - int(ts) > days * 86400: continue
        ahead = int(git('rev-list', '--count', 'origin/main..' + ref).strip() or 0)
        if ahead == 0: continue                              # main に取り込み済みのブランチは、見る意味がない
        out.append((ref, date, ahead))
    return sorted(out, key=lambda x: x[1], reverse=True)

def short(ref): return ref.replace('origin/claude/', '')

def grep_hits(ref, kws):
    """ref の決定ファイル・各画面の DECISIONS・基準から kws のどれかを含む行 -> [(path, no, text)]"""
    args = ['grep', '-n', '-i', '-I'] + sum([['-e', k] for k in kws], []) + [ref, '--'] + DECISION_FILES + [DATA_GLOB] + STD_FILES
    out = []
    for line in git(*args).splitlines():
        m = re.match(r'^[^:]+:(.+?):(\d+):(.*)$', line)
        if not m: continue
        path, no, text = m.group(1), m.group(2), m.group(3).strip()
        if path.endswith('.py') and '_共通パターン' not in path and not DATA_LINE.match(m.group(3)): continue   # 共通パターンは全行が答え
        out.append((path, no, text))
    return out

# ---------------------------------------------------------------- check
def cmd_check(a):
    kws = [k for k in a.words if k]
    refs = [('origin/main', '', 0)] + branches(a.days)
    hits = {}                                               # (path, text) -> {'line', 'refs': [...], 'score'}
    for ref, date, ahead in refs:
        for path, no, text in grep_hits(ref, kws):
            score = sum(1 for k in kws if k.lower() in text.lower())
            h = hits.setdefault((path, text), {'line': no, 'refs': [], 'score': score})
            h['refs'].append((ref, date))
    if not hits:
        print('見つかりません（main と %d 本の他ブランチ）。聞いてよい。' % (len(refs) - 1)); return
    prio = lambda path: (0 if path.endswith('決定台帳.md') else 1 if path.endswith('決定の受付簿.md') else 2 if '確認メモ_' in path or path.endswith('.py') else 3)
    items = sorted(hits.items(), key=lambda kv: (-kv[1]['score'], prio(kv[0][0]), 'origin/main' not in [r for r, _ in kv[1]['refs']], -int(kv[1]['line'])))
    if a.all: top = items
    else:                                                       # 同じファイルから出すのは5件まで（台帳・受付簿の行が、メモの長い説明に埋もれないように）
        top, per = [], {}
        for kv in items:
            per[kv[0][0]] = per.get(kv[0][0], 0) + 1
            if per[kv[0][0]] <= 5 and len(top) < 12: top.append(kv)
    in_main = [(k, v) for k, v in top if any(r == 'origin/main' for r, _ in v['refs'])]
    unmerged = [(k, v) for k, v in top if all(r != 'origin/main' for r, _ in v['refs'])]
    print('■ 「%s」の決定（語が多く合うものから）' % ' '.join(kws))
    if in_main:
        print('  main にある（正）：')
        for (path, text), v in in_main:
            print('   - %s:%s  %s' % (os.path.basename(path), v['line'], text[:150]))
    if unmerged:
        print('  ⚠ 他のスレッドの未マージ（まだ main にない。そのスレッドで答えが出ている可能性）：')
        for (path, text), v in unmerged:
            r0 = v['refs'][0]
            more = ' +%d' % (len(v['refs']) - 1) if len(v['refs']) > 1 else ''
            print('   - [%s %s%s] %s:%s  %s' % (short(r0[0]), r0[1], more, os.path.basename(path), v['line'], text[:150]))
    if len(items) > len(top): print('  …ほか %d 件（--all）' % (len(items) - len(top)))
    print('→ 答えがあれば聞かずに使い、出どころ（ファイル・日付）を言う。台帳と食い違うときだけ「○/○ に △ と決めています。□ に変えますか？」と1回聞く。')

# ---------------------------------------------------------------- gate / digest
# 画面ごとに聞き直されやすい「共通の話題」。ここに当たって答えがなければ、機能のスレッドでは聞かず受付簿に【共通質問】として残す
COMMON = ['一覧', 'ページ', '件数', '並べ', 'ソート', '検索', '削除', '確認ダイアログ', '破棄', 'キャンセル', '文字数', '最大', '必須', '日付', '日時', '金額', '税込', '税率',
          '数量', '桁', '権限', 'ログイン', '同時', 'メッセージ', 'バッジ', '状態の色', 'CSV', '添付', 'ファイル', '備考', 'メモ', '郵便', '電話', 'メール', 'URL', 'カナ', '言語', 'ベトナム', 'ヘッダー', 'サイドバー', 'パンくず', 'ボタン', 'モーダル', 'タブ', 'ダイアログ', 'トースト', 'レイアウト', '余白', '色', 'アイコン', '空の状態', '読み込み', 'エラー表示', '戻る']

def hit_score(kws, text):
    t = text.lower()
    return sum(1 for k in kws if k.lower() in t)

def cmd_gate(a):
    qs = list(a.questions)
    if a.file: qs += [l.strip() for l in open(a.file, encoding='utf-8') if l.strip() and not l.startswith('#')]
    if not qs: print('質問がありません（"語 語 | 質問文" の形で渡す）。'); return
    refs = [('origin/main', '', 0)] + branches(a.days)
    ans = ask = shared = 0
    for q in qs:
        kw_part, _, qtext = q.partition('|')
        kws = [k for k in re.split(r'[\s,、]+', kw_part.strip()) if k]
        label = (qtext or kw_part).strip()
        if not kws: print('? %s\n   語がありません（"語 語 | 質問文"）。' % label); continue
        need = 1 if len(kws) == 1 else 2                      # 語が2つ以上なら、2つ以上合う行だけ「答えあり」とみなす
        found = {}
        for ref, date, _ in refs:
            for path, no, text in grep_hits(ref, kws):
                sc = hit_score(kws, text)
                if sc >= need:
                    sc += 2 * hit_score(kws, text.split('|')[1] if text.startswith('|') and text.count('|') > 2 else text[:20])   # 台帳の「話題」欄に語があるものを上に
                    h = found.setdefault((path, text), {'no': no, 'sc': sc, 'refs': []}); h['refs'].append(short(ref) if ref != 'origin/main' else 'main')
        pr = lambda path: 0 if path.endswith('決定台帳.md') else 1 if path.endswith('決定の受付簿.md') else 2 if path.endswith('.md') and 'references' in path else 3
        top = sorted(found.items(), key=lambda kv: (-kv[1]['sc'], pr(kv[0][0]), 0 if 'main' in kv[1]['refs'] else 1))[:3]
        is_common = any(c.lower() in (kw_part + qtext).lower() for c in COMMON)
        if top:
            ans += 1
            print('✔ 答えあり　%s' % label)
            for (path, text), v in top:
                print('     - [%s] %s:%s  %s' % ('・'.join(v['refs'][:2]), os.path.basename(path), v['no'], text[:140]))
        elif is_common:
            shared += 1
            print('◇ 共通の話題（答えが見つからない）　%s\n     → 機能のスレッドでは聞かない。受付簿に【共通質問】として1行（状態＝受付）、推奨を「仮」で進める。' % label)
        else:
            ask += 1
            print('? 聞いてよい　%s' % label)
    print('\n■ 答えあり %d・共通 %d・聞く %d　→ 表に入れるのは「聞く」だけ。「答えあり」は表の下に「適用した決定」として1行ずつ出す（hong が違えば直す）。出どころを言う。' % (ans, shared, ask))
    print('  ※ 判定は語の一致。語を変えて 1 回は探し直す（例：「並び順」→「並べ替え」「ソート」）。見つからないからといって、台帳の別の節に答えがないとは限らない。')

def read_decisions(path):
    import ast
    try: tree = ast.parse(open(path, encoding='utf-8').read())
    except Exception: return []
    for n in tree.body:
        if isinstance(n, ast.Assign) and any(getattr(t, 'id', '') == 'DECISIONS' for t in n.targets):
            try: return ast.literal_eval(n.value)
            except Exception: return []
    return []

def cmd_digest(a):
    import glob
    pat = a.target
    files = [f for f in sorted(glob.glob('docs/05_画面設計書/データ/*.py')) if pat.lower() in os.path.basename(f).lower() and not os.path.basename(f).startswith('_')]
    print('■ 「%s」で、もう決まっていること' % pat)
    n = 0
    for f in files:
        ds = read_decisions(f)
        if not ds: continue
        print('  [%s] DECISIONS %d 件' % (os.path.basename(f), len(ds)))
        for d in ds:
            q = (d.get('q') or [''])[0]; ans = (d.get('a') or [''])[0]
            print('   - %s｜%s → %s' % (d.get('target', ''), q[:40], ans[:70])); n += 1
    for p in ('docs/決定台帳.md', 'docs/決定の受付簿.md'):
        try: lines = [l for l in open(p, encoding='utf-8').read().splitlines() if pat in l]
        except OSError: continue
        if lines: print('  [%s] %d 行 → 最初の5行' % (os.path.basename(p), len(lines)))
        for l in lines[:5]: print('   - %s' % l[:150])
    if not n and not files: print('  該当するデータファイルがありません（画面コードか機能名の一部で。例 AW_PROD）。')
    print('→ これらは聞かない。違う答えが来そうなときだけ「○/○ に △ と決めています。□ に変えますか？」。他のスレッドの未マージ分は `check` と `who`。')

# ---------------------------------------------------------------- who
def changed_files(ref):
    return set(x for x in git('diff', '--name-only', 'origin/main...' + ref).splitlines() if x)

def my_files():
    f = changed_files('HEAD')
    for line in git('status', '--porcelain').splitlines():
        f.add(line[3:].strip().strip('"'))
    return {x for x in f if x}

def cmd_who(a):
    mine = my_files() if not a.patterns else None
    rows = []
    for ref, date, ahead in branches(a.days):
        theirs = changed_files(ref)
        if mine is not None: ov = mine & theirs
        else: ov = {f for f in theirs if any(fnmatch.fnmatch(f, '*%s*' % p.strip('*')) for p in a.patterns)}
        feat = sorted(f for f in ov if f not in SHARED)
        shared = sorted(f for f in ov if f in SHARED)
        if feat or (shared and a.patterns): rows.append((ref, date, ahead, feat, shared))
    me = current_branch()
    print('■ 同じファイルを触っている他のブランチ（%s／%d日以内・main 未マージ）' % ('自分の変更と' if mine is not None else ' '.join(a.patterns), a.days))
    if not rows:
        print('  なし。（自分のブランチ：%s）' % me); return
    for ref, date, ahead, feat, shared in rows:
        print('  ⚠ %s（%s・main より %d コミット先）' % (short(ref), date, ahead))
        for f in feat[:5]: print('       %s' % f)
        if len(feat) > 5: print('       …ほか %d ファイル' % (len(feat) - 5))
        if shared: print('       （共有ファイルも：%s）' % '・'.join(os.path.basename(s) for s in shared))
    print('→ 同じ機能の画面・データ・コードを別のスレッドが進めている。**先に始める前に**ユーザーに「◯◯ブランチと重なっています。どちらが続きますか？」と聞く（黙って続けない）。')

# ---------------------------------------------------------------- ids
def added_ids(ref, path, rx):
    base = ['diff', '-U0', 'origin/main'] if ref == 'WORK' else ['diff', '-U0', 'origin/main...' + ref]
    ids = set()
    for line in git(*base, '--', path).splitlines():
        if line.startswith('+') and not line.startswith('+++'):
            m = re.match(rx, line[1:])
            if m: ids.add(m.group(1))
    return ids

def all_ids(ref, path, rx):
    txt = git('show', '%s:%s' % (ref, path))
    return {m.group(1) for line in txt.splitlines() for m in [re.match(rx, line)] if m}

MSG_RX = r'\s*"([EWIQS]\d+)"\s*:'
INBOX_RX = r'\|\s*(\d+)\s*\|'

def cmd_ids(a):
    bs = branches(a.days)
    if a.next:
        pre = a.next.upper()
        used = {i for i in all_ids('origin/main', MSG_FILE, MSG_RX) if i.startswith(pre)}
        for ref, _, _ in bs: used |= {i for i in added_ids(ref, MSG_FILE, MSG_RX) if i.startswith(pre)}
        used |= {i for i in added_ids('WORK', MSG_FILE, MSG_RX) if i.startswith(pre)}
        nums = sorted(int(i[1:]) for i in used)
        lo, hi = (int(x) for x in a.range.split('-')) if a.range else (None, None)
        cand = [n for n in range(lo or (nums[-1] + 1 if nums else 1), (hi or 10**6) + 1) if n not in set(nums)][:3]
        print('■ %s の次の空き番号（main と他の %d 本のブランチの分も数えた）：%s（使用済みの最大 %s）' % (
            pre, len(bs), '・'.join('%s%d' % (pre, n) for n in cand) or 'この範囲にない', '%s%d' % (pre, nums[-1]) if nums else '-'))
        print('→ 番号を決めたら、すぐ commit・push する（push するまで他のスレッドには見えない）。'); return
    mine_m, mine_i = added_ids('WORK', MSG_FILE, MSG_RX), added_ids('WORK', LEDGER_INBOX, INBOX_RX)
    mine_m |= added_ids('HEAD', MSG_FILE, MSG_RX); mine_i |= added_ids('HEAD', LEDGER_INBOX, INBOX_RX)
    print('■ 自分が足した ID：message %d 個・受付簿 %d 行（main に対して）' % (len(mine_m), len(mine_i)))
    bad = 0
    for ref, date, ahead in bs:
        cm, ci = mine_m & added_ids(ref, MSG_FILE, MSG_RX), mine_i & added_ids(ref, LEDGER_INBOX, INBOX_RX)
        if cm or ci:
            bad += 1
            print('  ⚠ %s（%s）と重なる：%s%s' % (short(ref), date, ('message ' + '・'.join(sorted(cm)[:8])) if cm else '',
                                                  ('  受付簿 #' + '・#'.join(sorted(ci, key=int)[:8])) if ci else ''))
    print('→ %s' % ('重なりなし。' if not bad else '別のスレッドが同じ番号を別の内容で使っている。**番号を付け直す**（`ids --next E --range …`）か、どちらを残すかユーザーに聞く。'))

def main():
    ap = argparse.ArgumentParser(description='複数スレッドの重なり・聞き直し・ID 衝突の確認')
    sp = ap.add_subparsers(dest='cmd', required=True)
    for name in ('check', 'who', 'ids', 'gate', 'digest'):
        p = sp.add_parser(name)
        p.add_argument('--days', type=int, default=14); p.add_argument('--no-fetch', action='store_true'); p.add_argument('--all', action='store_true')
        if name == 'check': p.add_argument('words', nargs='+')
        if name == 'who': p.add_argument('patterns', nargs='*')
        if name == 'gate': p.add_argument('questions', nargs='*'); p.add_argument('-f', '--file')
        if name == 'digest': p.add_argument('target')
        if name == 'ids': p.add_argument('--next'); p.add_argument('--range')
    a = ap.parse_args()
    if not a.no_fetch and a.cmd != 'digest': fetch()
    {'check': cmd_check, 'who': cmd_who, 'ids': cmd_ids, 'gate': cmd_gate, 'digest': cmd_digest}[a.cmd](a)

if __name__ == '__main__':
    main()
