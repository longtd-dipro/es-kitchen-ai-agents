import { CXL_STOCK_BUY } from '@/lib/domain/cxlStock';
import { AP_TAB, KIND_IMPACT, PAUSE_MAX, PAUSE_PAST, QT_OPTS, CARS, VMBR } from './constants';
import type { ChKind } from '@/lib/corp/sites/logic';
import type { ApTab, ChangeApp, ChangeBranch, ChangeKind, IntakeRow, ListFilter } from './types';
import { fmtDatesIn } from '@/lib/format/date';
import { RE_NG_DAYS, RE_SHIP_COOL } from '@/lib/domain/terms';

/*
 * 契約申請管理の計算と入力チェック（画面と actions の両方で使う）。
 * 元：11_運営_申請受付.html の approve.js（申請一覧・申請詳細・代理入力）。
 * 今日は引数で受け取る（画面・actions は lib/supplier/dates の today()）。
 */

/* ---------------- 日付 ---------------- */
export const pad2 = (n: number) => String(n).padStart(2, '0');
/** Date → yyyy/mm/dd */
export function ymd(d: Date): string {
  return `${d.getFullYear()}/${pad2(d.getMonth() + 1)}/${pad2(d.getDate())}`;
}
/** 文字列の中の yyyy/mm/dd → Date（なければ null） */
export function pd(s: string | undefined): Date | null {
  const m = String(s ?? '').match(/(\d{4})\/(\d{2})\/(\d{2})/);
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
}
/** yyyy-mm-dd（input type=date）→ Date */
export function pdIso(s: string | undefined): Date | null {
  const m = String(s ?? '').match(/(\d{4})-(\d{2})-(\d{2})/);
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
}

/* ---------------- 状態 ---------------- */
export type AppState = { k: 'wd' | 'part' | 'wait' | 'ok' | 'ng' | 'part2'; t: string; c: string };
/** 申請のステータス（拠点ごとの承認から決まる） */
export function appState(a: ChangeApp): AppState {
  const r = a.branches.map((b) => b.res), n = r.length;
  const ok = r.filter((x) => x.st === 'ok').length, ng = r.filter((x) => x.st === 'ng').length, wd = r.filter((x) => x.st === 'wd').length;
  if (wd === n) return { k: 'wd', t: '取り下げ済', c: 'mut' };
  /* 対応中 n/m：n＝処理した拠点（承認・却下・取り下げ）、m＝申請の拠点（台帳 E 2026-10-05。旧「一部処理済み」） */
  if (ok + ng + wd < n) return ok + ng > 0 ? { k: 'part', t: `対応中 ${ok + ng + wd}/${n}`, c: 'blue' } : { k: 'wait', t: '承認待ち', c: 'amb' };
  if (ng === 0) return { k: 'ok', t: '承認済', c: 'grn' };
  if (ok === 0) return { k: 'ng', t: '却下', c: 'red' };
  return { k: 'part2', t: '一部承認', c: 'blue' };
}
export const isWaiting = (s: AppState) => s.k === 'wait' || s.k === 'part';

/** オーダー締切までの日数（今日は 2026/10/05 に固定：T1＝C） */
export function deadline(a: ChangeApp, todayStr: string): { close: Date; today: Date; d: number } | null {
  const c = pd(a.close), t = pd(todayStr);
  if (!c || !t) return null;
  return { close: c, today: t, d: Math.round((c.getTime() - t.getTime()) / 86400000) };
}

/* ---------------- 一覧 ---------------- */
export type ChangeListRow = {
  a: ChangeApp; no: string; tab: ApTab; kind: string; company: string; br: string; brs: string[]; head: string;
  start: string; date: string; es: string; st: AppState; dl: ReturnType<typeof deadline>;
};
export function chRows(list: ChangeApp[], todayStr: string): ChangeListRow[] {
  return list.map((a) => {
    const st = appState(a);
    return {
      a, no: a.no, tab: AP_TAB[a.kind], kind: a.kind, company: a.company,
      br: a.branches.map((b) => b.name).join('・'), brs: a.branches.map((b) => b.name),
      head: a.branches.map((b) => b.head).join(' ／ '), start: a.start, date: a.date,
      es: a.es ?? '', st, dl: isWaiting(st) ? deadline(a, todayStr) : null,
    };
  });
}
/** 検索の追加条件（台帳 運営A Q5）：申請日の範囲（片方だけでもよい）・法人・開始サイクル月。3つのタブで共通 */
function extraOk(x: { date: string; company: string; startYm?: string }, f: ListFilter): boolean {
  const day = x.date.replace(/\//g, '-').slice(0, 10);
  if (f.from && day < f.from) return false;
  if (f.to && day > f.to) return false;
  if (f.corp && x.company !== f.corp) return false;
  if (f.start && x.startYm !== f.start) return false;
  return true;
}
/** 申請日の範囲が逆（まで が から より前）のときの理由（E08。空＝よい）。逆のときは検索しない */
export const rangeError = (f: Pick<ListFilter, 'from' | 'to'>) => (f.from && f.to && f.to < f.from ? '終了日は開始日以降の日付を選択してください。' : '');
/** 並べ替えの比べ方（列の値で。向きの既定：申請ID・申請の種類などの文字＝昇順、申請日＝降順） */
function cmpBy<T>(f: ListFilter, get: (x: T) => unknown, p: T, q: T): number {
  const a = get(p), b = get(q);
  const key = f.sort === 'id' ? 'no' : f.sort;
  const dir = f.dir ?? (key === 'date' ? 'desc' : 'asc');
  const c = typeof a === 'number' && typeof b === 'number' ? a - b : String(a ?? '').localeCompare(String(b ?? ''), 'ja');
  return dir === 'desc' ? -c : c;
}
/** 新規契約タブの絞り込み・並び（登録したばかりの行は先頭） */
export function filterIntakes(rows: IntakeRow[], f: ListFilter): IntakeRow[] {
  return rows.filter((x) => {
    if (f.q && (x.no + x.company + x.branch + x.es).indexOf(f.q) < 0) return false;
    if (f.kubun && x.kubun !== f.kubun) return false;
    if (f.plan && x.plan !== f.plan) return false;
    if (f.course && x.course !== f.course) return false;
    if (f.eq && x.eq !== f.eq) return false;
    if (f.es && x.es !== f.es) return false;
    if (f.st && x.st !== f.st) return false;
    if (f.route && x.channel !== f.route) return false;
    if (!extraOk(x, f)) return false;
    return true;
  }).sort((p, q) => {
    if (!!p.fresh !== !!q.fresh) return p.fresh ? -1 : 1;
    return cmpBy(f, (x: IntakeRow) => (x as unknown as Record<string, unknown>)[f.sort === 'id' ? 'no' : f.sort], p, q) || (p.no < q.no ? -1 : 1);
  });
}
/** 契約変更・休止・解約タブの絞り込み・並び */
export function filterChanges(rows: ChangeListRow[], f: ListFilter): ChangeListRow[] {
  return rows.filter((r) => r.tab === f.tab).filter((r) => {
    if (f.q && (r.no + r.company + r.br + r.es).indexOf(f.q) < 0) return false;
    if (f.kind && r.kind !== f.kind) return false;
    if (f.br && r.brs.indexOf(f.br) < 0) return false;
    if (f.route && r.a.channel !== f.route) return false;
    if (f.es && r.es !== f.es) return false;
    /* 「オーダー締切を過ぎたもの」：承認待ち・対応中で締切の日数がマイナス */
    if (f.over && !(r.dl && r.dl.d < 0)) return false;
    if (!extraOk({ date: r.date, company: r.company, startYm: r.a.startYm }, f)) return false;
    /* 「対応中」は n/m が付くので頭で合わせる */
    if (f.st2 && r.st.t !== f.st2 && !(f.st2 === '対応中' && r.st.k === 'part')) return false;
    return true;
  }).sort((p, q) => cmpBy(f, (r: ChangeListRow) => (f.sort === 'dl' ? (r.dl ? r.dl.d : 1e9) : f.sort === 'st' ? r.st.t : (r as unknown as Record<string, unknown>)[f.sort === 'id' ? 'no' : f.sort]), p, q) || (p.date < q.date ? 1 : p.date > q.date ? -1 : (p.a.seq ?? 0) - (q.a.seq ?? 0)));
}
export const uniq = (arr: (string | undefined)[]) => arr.filter((x, i): x is string => !!x && arr.indexOf(x) === i);

/** メニューのバッジ・タブの件数（受付中・契約設定中の新規／承認待ち・対応中の変更・休止・解約） */
export function pendingSplit(intakes: IntakeRow[], changes: ChangeApp[]) {
  let u = 0, c = 0, w = 0;
  intakes.forEach((x) => { if (x.st === '受付中') u++; else if (x.st === '契約設定中') c++; });
  changes.forEach((a) => { if (isWaiting(appState(a))) w++; });
  return { u, c, w };
}
/** RV4-OPS-20261002 #1：バッジの内訳 */
export function pendingTip(p: { u: number; c: number; w: number }) {
  return `受付中 ${p.u}／契約設定中 ${p.c}` + (p.w ? `・変更・休止・解約の承認待ち ${p.w}` : '');
}
/** タブの件数（対応待ち） */
export function tabCount(t: ApTab, intakes: IntakeRow[], changes: ChangeApp[]): number {
  if (t === 'new') return intakes.filter((x) => x.st === '受付中' || x.st === '契約設定中').length;
  return changes.filter((a) => AP_TAB[a.kind] === t && isWaiting(appState(a))).length;
}

/* ---------------- 承認の前にする設定（2026/09/29 v1.5・28-144） ---------------- */
export type SetItem = { k: string; l: string; t: 'sel' | 'text' | 'date' | 'check'; o?: string[]; v?: string; req?: boolean; h?: string; ph?: string };

export function isSizeUp(b: ChangeBranch) {
  return (b.changes || []).some((c) => /貸出一覧：冷蔵庫/.test(c[2]));
}
/** 2026/10/01 R4（D8）：承認必須の項目だけに「承認前の設定」を足す */
function extraSetItems(a: ChangeApp, b: ChangeBranch): SetItem[] {
  const ch = b.changes || [], has = (re: RegExp) => ch.some((c) => re.test(c[2])), X: SetItem[] = [];
  if (a.kind === '法人情報の変更' && has(/郵便番号|住所|町名|建物|電話|FAX/))
    X.push({ k: 'bo', l: '請求書の宛先（Bill One の発行先）を新しい内容に直す手配をした', t: 'check', req: true, h: '未発行の請求書は承認と同時に新しい内容になります（発行済みはそのまま）。Bill One 側は運営が手作業で直します' });
  if (a.kind === '拠点情報の変更') {
    if (has(RE_NG_DAYS)) X.push({ k: 'ngs', l: '納品不可曜日を適用開始するサイクル（申請の開始）を確認した', t: 'check', req: true, h: '配送データ化済み・出荷指示済みの分は自動で変えず、運営スケジュールの「要確認」に出ます（追補 28-20）' });
    if (has(/設備の希望日/)) X.push({ k: 'eqd', l: '設備異動の登録日', t: 'date', req: true, h: '設備の希望日をもとに、設備の異動（搬入・引揚）を登録する日' });
    if (has(/^請求先$/)) X.push({ k: 'bto', l: '請求の宛先（請求書の枚数・Bill One の発行先）を確認した', t: 'check', req: true, h: '発行済みの請求書はそのまま、未発行の分から新しい請求先へ（追補 28-6）' });
  }
  return X;
}
/**
 * 休止・再開の棚卸報告（任意）。報告がないときは運営が「スキップ」を選べる（理由は必須）。
 * スキップした区切りは管理ロス・事務手数料なし。差は理論在庫に残り、次の棚卸報告で精算する（台帳 E・受付簿 No.168・2026-10-06）
 */
export const INV_WAIT = '報告を待つ（報告があれば精算）';
export const INV_SKIP = 'スキップする（報告なしで進める）';
const INV_SKIP_ITEMS: SetItem[] = [
  { k: 'inv', l: '棚卸報告（任意）', t: 'sel', o: [INV_WAIT, INV_SKIP], v: INV_WAIT, h: '休止の始め・休止中・再開のときの棚卸報告は任意です。報告がないときは「スキップ」できます。スキップした区切りは管理ロス・事務手数料なし、差は次の棚卸報告で精算します' },
  { k: 'invwhy', l: 'スキップの理由（スキップするときだけ必須）', t: 'text', ph: '例）お客様と相談し、報告なしで進める' }];
/** 変更申請の影響と、承認前にする設定（必須の設定が終わるまで、その拠点は承認できない） */
export function setItems(a: ChangeApp, b: ChangeBranch): SetItem[] {
  const addr = (b.changes || []).some((c) => /住所|町名|建物|郵便/.test(c[2]));
  const K = a.kind;
  let I: SetItem[] = [];
  if (K === '拠点情報の変更' && addr) I = [
    { k: 'wh', l: 'ピッキング倉庫（新しい住所で見直し）', t: 'sel', o: ['WH00001 関東倉庫', 'WH00002 関西倉庫'], v: 'WH00001 関東倉庫' },
    { k: 'c1', l: '運送会社', t: 'sel', o: CARS, v: 'ヤマト運輸' }, { k: 'c2', l: '納品会社', t: 'sel', o: CARS, v: 'ヤマト運輸' },
    { k: 'lead', l: 'リードタイム', t: 'sel', o: ['1日', '2日', '3日'], v: '2日' },
    { k: 'from', l: '新しい住所で配送する最初の納品日', t: 'date', req: true, h: 'この日以降の配送データを、新しい住所・配送ルートで作り直します' },
    { k: 'path', l: '搬入経路の資料を新しい住所で確認した', t: 'check', req: true }];
  else if (K === '拠点情報の変更' || K === '法人情報の変更') I = [];
  else if (K === 'プランの変更') I = [
    { k: 'cnt', l: '配送回数（新しいプランで）', t: 'sel', o: ['1回', '2回', '3回', '4回'], v: '3回', h: 'プラン標準を超えた分は配送回数追加（A型オプション）で自動計上' },
    { k: 'slot', l: '納品サイクルの枠', t: 'text', req: true, ph: '例）A3 ／ B5 ／ C3', h: '配送回数の分だけ選ぶ' },
    { k: 'eq', l: '設備の入替（サイズアップ）', t: 'sel', o: ['不要', '必要（設備の異動：機種変更）'], v: '不要' },
    { k: 'eqd', l: '設備の搬入予定日（入替が必要なとき）', t: 'date' },
    /* 冷蔵庫→自販機：現場調査の結果（必須・当面は文字で。添付はあとで：台帳 2026/10/03） */
    ...(b.toVm ? [
      { k: 'svd', l: '現場調査日', t: 'date', req: true },
      { k: 'svr', l: '現場調査の結果', t: 'sel', o: ['設置できる', '設置できない'], v: '', req: true, h: '「設置できない」なら承認できません（却下の理由：設置条件を満たさない）' },
      { k: 'svm', l: '現場調査のメモ（設置場所・電源・搬入経路など）', t: 'text' },
    ] as SetItem[] : [])];
  else if (K === '設備の変更') I = [
    { k: 'sd', l: '設備の送付（搬入）予定日', t: 'date', req: true, h: '設備手配のリードタイムは1週間程度' },
    { k: 'sc', l: '設備を運ぶ運送会社', t: 'sel', o: CARS, v: 'ヤマト運輸' },
    { k: 'rd', l: '回収（引揚）予定日（回収があるとき）', t: 'date' },
    { k: 'op', l: '設置代行', t: 'sel', o: ['なし', 'あり（OP000007 設置代行）'], v: 'なし' }];
  else if (K === '配送の変更') I = [
    { k: 'rt', l: '配送ルート（倉庫・運送会社・納品会社）を確認した', t: 'check', req: true },
    { k: 'from', l: '変更後の最初の納品日', t: 'date', req: true }];
  else if (K === '休止') I = [
    { k: 'eq', l: '休止中の設備', t: 'sel', o: ['置いたまま（保管料なし）', '引き揚げる'], v: '置いたまま（保管料なし）' },
    { k: 'rd', l: '設備の引揚予定日（引き揚げるとき）', t: 'date' },
    { k: 'del', l: '休止期間の配送データ（作成済み）を取り消すことを確認した', t: 'check', req: true },
    ...INV_SKIP_ITEMS];
  else if (K === '再開') I = [
    { k: 'rt', l: '配送ルート', t: 'sel', o: ['休止前と同じ', '見直す（子契約の配送ルートで直す）'], v: '休止前と同じ' },
    { k: 'from', l: '再開後の最初の納品日', t: 'date', req: true },
    { k: 'sd', l: '設備の再設置日（引き揚げていたとき）', t: 'date' },
    ...INV_SKIP_ITEMS];
  else if (K === '解約') I = [
    { k: 'last', l: '最後の納品日', t: 'date', req: true },
    { k: 'rd', l: '設備の引揚予定日', t: 'date', req: true },
    { k: 'pen', l: '違約金（設備ごとに判定して合算）を確認した', t: 'check', req: true }];
  I = I.concat(extraSetItems(a, b));
  if (/配送の変更|プランの変更|再開/.test(K) || (K === '拠点情報の変更' && addr))   /* STEP4 A1：任意。回答がなくても承認できる */
    I.push({ k: 'qt', l: '委託配送先への見積依頼（任意）', t: 'sel', o: QT_OPTS, v: '依頼しない', h: '対応できるか・金額を委託配送先ポータルで聞きます。回答期限は2営業日。見積は必須ではなく、回答を待たずに承認できます（2026/10/01 お客様回答 A1）' });
  /* 2026/10/01 回答 P3：冷蔵庫のサイズアップは「設備の異動（機種変更）として登録 → 差額はオプション請求」 */
  if (K === '設備の変更' && isSizeUp(b)) I.push({ k: 'eqmv', l: '冷蔵庫のサイズアップを「設備の異動（機種変更）」として登録する（差額はオプション請求・承認と手配は権限のある運営管理者なら誰でも可）', t: 'check', req: true });
  return I;
}
/** 設定の今の値（入れていなければ既定値） */
export function setValueOf(b: ChangeBranch, f: SetItem): string | boolean {
  const v = b.set?.[f.k];
  return v !== undefined ? v : (f.v || '');
}
/** 必須の設定がそろっているか */
export function setDone(a: ChangeApp, i: number): boolean {
  const b = a.branches[i];
  /* 棚卸報告をスキップするときは理由が必須 */
  const skipOk = !(setValueOf(b, INV_SKIP_ITEMS[0]) === INV_SKIP && (a.kind === '休止' || a.kind === '再開') && !String(setValueOf(b, INV_SKIP_ITEMS[1])).trim());
  return skipOk && setItems(a, b).every((f) => {
    const x = setValueOf(b, f);
    return !f.req || (f.t === 'check' ? !!x : !!String(x).trim());
  });
}

/* ---------------- 休止の通算（2026/10/01 確定 D1：通算1年が上限） ---------------- */
export function pauseInfo(a: ChangeApp, b: ChangeBranch) {
  const p = b.pause;
  if (a.kind !== '休止' || !p) return null;
  const past = (p.hist || []).reduce((s, h) => s + h[1], 0), tot = past + p.cur;
  return { hist: p.hist || [], past, cur: p.cur, total: tot, left0: PAUSE_MAX - past, left1: PAUSE_MAX - tot, over: tot > PAUSE_MAX, resume: p.resume };
}

/* ---------------- 解約日の判定（2026/10/01 確定 E1・D4＝A・REQ-CT-257） ----------------
   締切前（オーダー期間中）の申込は翌月から、締切後は翌々月から適用。解約日はサイクルの終わり。
   デモでの解釈（仮置き）：適用月＝利用しなくなる最初のサイクル月／解約日＝適用月の前のサイクルの末日。
   サイクルは A1 が月曜・28日ごと。2026年10月サイクル（2026/10/12〜11/08）から数え、12月サイクルからは年末年始の7日分ずらす */
const CXL_CLOSE_DAY = 15, CXL_A1 = new Date(2026, 9, 12), CXL_BASE = 2026 * 12 + 10;
export const cxlI = (y: number, m: number) => y * 12 + m;
export function cxlYM(i: number) {
  const y = Math.floor((i - 1) / 12), m = i - y * 12;
  return { y, m, i, t: `${y}年${m}月` };
}
export function cxlEnd(i: number): Date {
  return new Date(CXL_A1.getFullYear(), CXL_A1.getMonth(), CXL_A1.getDate() + 28 * (i - CXL_BASE) + 27 + (i >= CXL_BASE + 2 ? 7 : 0));
}
/** 申込日 d から：判定に使う締切・最短の適用月・最短の解約日 */
export function cxlRule(d: Date) {
  const y = d.getFullYear(), m = d.getMonth() + 1, before = d.getDate() <= CXL_CLOSE_DAY;
  const ap = cxlYM(cxlI(y, m) + (before ? 1 : 2)), last = cxlYM(ap.i - 1);
  return { date: d, before, close: new Date(y, m - 1, CXL_CLOSE_DAY), closeFor: cxlYM(cxlI(y, m) + 1), apply: ap, last, end: cxlEnd(last.i) };
}
export type CxlRule = ReturnType<typeof cxlRule>;
/** この申請の解約日（最後のサイクル月）：代理入力は b.cxlLast、法人Webの申請は「解約をご希望の日」から読む */
function cxlWant(a: ChangeApp, b: ChangeBranch) {
  if (b.cxlLast) return cxlYM(b.cxlLast);
  const r = (a.request || []).find((x) => x[0] === '解約をご希望の日');
  const m = r && String(r[1]).match(/(\d{4})年(\d{1,2})月(?:サイクル|分)/);
  return m ? cxlYM(cxlI(+m[1], +m[2])) : null;
}
export function cxlInfo(a: ChangeApp, b: ChangeBranch) {
  if (a.kind !== '解約') return null;
  const d = pd(a.date);
  if (!d) return null;
  const R = cxlRule(d), w = cxlWant(a, b);
  return { R, want: w, wantEnd: w ? cxlEnd(w.i) : null, wantApply: w ? cxlYM(w.i + 1) : null, ok: !w || w.i >= R.last.i };
}
export function cxlWhy(a: ChangeApp, b: ChangeBranch): string {
  const C = cxlInfo(a, b);
  if (!C || C.ok || !C.want || !C.wantEnd) return '';
  return fmtDatesIn(`解約日 ${ymd(C.wantEnd)}（${C.want.t}サイクルの末日）は、申込日 ${ymd(C.R.date)}（オーダー締切 ${ymd(C.R.close)} の${C.R.before ? '前' : '後'}）で決まる最短の解約日 ${ymd(C.R.end)} より前のため承認できません。`);
}

/** 承認できない理由（空なら承認できる）。休止の通算超過／再開予定月なし、自販機の拠点を COOL便へ（決定 28-19）、ルールに合わない解約日 */
export function blockWhy(a: ChangeApp, b: ChangeBranch): string {
  const P = pauseInfo(a, b), w: string[] = [];
  if (P && P.over) w.push(`通算の休止が ${P.total}ヶ月（過去 ${P.past}ヶ月＋今回 ${P.cur}ヶ月）になり、上限の12ヶ月を ${P.total - PAUSE_MAX}ヶ月 超えるため承認できません。`);
  if (P && !P.resume) w.push('再開予定月が入っていません（必須・「未定」は不可）。');
  if (a.kind === '配送の変更' && b.vm && (b.changes || []).some((c) => /配送区分|配送方法/.test(c[2]) && RE_SHIP_COOL.test(c[4])))
    w.push('設備が自販機の拠点は配送方法が ES配送便に固定のため、COOL便への変更は承認できません。却下してください。');
  /* 冷蔵庫→自販機は現場調査で「設置できる」が要る（台帳 2026/10/03） */
  if (b.toVm && b.set?.svr === '設置できない') w.push('現場調査の結果が「設置できない」のため承認できません。却下してください（理由：設置条件を満たさない）。');
  const cx = cxlWhy(a, b);
  if (cx) w.push(cx);
  return w.join('');
}

/** 共通のルール（影響する範囲） */
export const kindImpact = (a: ChangeApp) => KIND_IMPACT[a.kind] ?? null;

/** 承認ダイアログの入力チェック。エラーの文言（なければ空） */
export function approveError(a: ChangeApp, input: { ok: boolean; checks?: Record<string, boolean>; texts?: Record<string, string> }): { msg: string; badTexts: string[] } {
  let ok = input.ok, noChk = !input.ok;
  const badTexts: string[] = [];
  (a.approveFields || []).forEach((f) => {
    if (f.check && !input.checks?.[f.key]) { ok = false; noChk = true; }
    if (!f.check && !f.opts && !String(input.texts?.[f.key] ?? f.text ?? '').trim()) { ok = false; badTexts.push(f.key); }
  });
  if (ok) return { msg: '', badTexts };
  return { msg: noChk ? '確認にチェックを入れてください。' : '必須の項目を入力してください。', badTexts };
}

/* ---------------- 新規登録（代理入力）　2026/09/28 ---------------- */
export type NfBranch = {
  kubun: string; name: string; zip: string; addr: string; plan: string; course: string; ship: string; ng: string;
  eq: string; start: string; staff: string; billTo: string; note: string;
  /** 基準数のパターン（通常／短消費期限なし。REQ-CT-300）。省く＝通常 */
  pattern?: string;
  /** 設置フロア（自販機は必須・冷蔵庫は任意：台帳 2026/10/03） */
  floor?: string;
  /** 切替（お試し→本導入）：お試し中の拠点 ID（なければ登録のときに法人のお試しの拠点から拠点名で探す。B2） */
  branchId?: string;
};
export type NfForm = {
  route: string; recv: string; es: string;
  corpKind: '新しい法人' | '既存の法人';
  cname: string; ckana: string; cbill: string; caddr: string; ctel: string; corp: string;
  pname: string; pkana: string; pmail: string; ptel: string;
  branches: NfBranch[];
  doc: string; photo: string;
};
export const nfBlankBranch = (): NfBranch => ({ kubun: '', name: '', zip: '', addr: '', plan: '', course: '', ship: '', ng: '', eq: '', start: '', staff: '', billTo: '法人', note: '' });
/** 2026/10/01 R3（決定 28-19）：設備に自販機を選んだ拠点は、配送区分を ES配送便に固定 */
export const nfVm = (b: NfBranch) => /自販機/.test(b.eq);
/** 必須の欄（未入力のキー）。拠点は b<番号>.<キー> */
export function nfErrors(f: NfForm): string[] {
  const bad: string[] = [];
  const need = (k: string, v: string) => { if (!String(v ?? '').trim()) bad.push(k); };
  need('route', f.route); need('recv', f.recv);
  if (f.corpKind === '新しい法人') { need('cname', f.cname); need('ckana', f.ckana); need('cbill', f.cbill); }
  else need('corp', f.corp);
  need('pname', f.pname); need('pkana', f.pkana); need('pmail', f.pmail);
  f.branches.forEach((b, i) => {
    const p = `b${i}.`;
    need(p + 'kubun', b.kubun); need(p + 'name', b.name); need(p + 'zip', b.zip); need(p + 'addr', b.addr);
    need(p + 'plan', b.plan); need(p + 'course', b.course); need(p + 'ship', nfVm(b) ? 'ES配送便' : b.ship);
    need(p + 'eq', b.eq); need(p + 'start', b.start);
    if (nfVm(b)) need(p + 'floor', b.floor ?? '');
    /* 拠点のご担当者（氏名とメール）は必須（運営が代理で入れるときも。空だと拠点にメイン担当者がいないまま進むため：結合テスト B9） */
    if (!isSwitch(b) || !b.branchId) if (!/[^\s@・,，、／/]+@[^\s@・,，、／/]+\.[^\s@・,，、／/]+/.test(b.staff ?? '') || !b.staff.replace(/[^\s@・,，、／/]+@[^\s@・,，、／/]+\.[^\s@・,，、／/]+/, '').replace(/[\s・,，、／/]/g, '')) bad.push(p + 'staff');
  });
  return bad;
}
/** 拠点の契約区分が「切替（お試し→本導入）」か */
export const isSwitch = (b: Pick<NfBranch, 'kubun'>) => /^切替/.test(b.kubun);
/** 登録する新規申込（共通データの apply.submitNew に渡す中身）。開始は先頭の拠点の希望（YYYY-MM） */
export function nfApply(f: NfForm) {
  const b0 = f.branches[0], k0 = b0.kubun, many = f.branches.length > 1;
  const kubun: IntakeRow['kubun'] = k0 === 'お試しキャンペーン' ? 'お試し' : /^切替/.test(k0) ? '切替' : '本導入';
  const corpId = f.corpKind === '既存の法人' ? (f.corp.match(/^(CU\d+)/) || [])[1] : undefined;
  const companyName = f.corpKind === '新しい法人' ? f.cname.trim() : f.corp.replace(/^CU\d+\s*/, '');
  const ships = uniq(f.branches.map((b) => (nfVm(b) ? 'ES配送便' : b.ship)));
  const plan = many ? `複数（${f.branches.length}拠点）` : `${b0.plan.replace(/（.*$/, '').replace(/\s+/g, ' ')}（${b0.course}）`;
  return {
    kubun, corpId, companyName,
    /* 切替は今ある（お試しの）拠点に結びつける＝同じ親契約のまま本導入へ（B2）。ほかは新しい拠点 */
    branchIds: f.branches.filter((b) => isSwitch(b) && b.branchId).map((b) => b.branchId!),
    branchNames: f.branches.filter((b) => !(isSwitch(b) && b.branchId)).map((b) => b.name.trim()), startCycle: b0.start.slice(0, 7), name: f.pname.trim(),
    request: [
      ['拠点', many ? `${f.branches.length}拠点` : f.branches[0].name.trim()], ['プラン', plan], ['配送', ships.join('・')],
      ['設備', uniq(f.branches.map((b) => b.eq)).join('・')], ['受付', `代理入力（${f.route}・${f.recv}）`],
      /* 基準数のパターン（REQ-CT-300）。拠点N＝新しい拠点（branchNames）の並び。lib/domain/lifecycle.ts の defaultSetup が読む */
      /* 拠点ごとのプラン・コース（複数拠点でも受付に渡す：結合テスト B9）。defaultSetup が読む */
      ...f.branches.filter((b) => !(isSwitch(b) && b.branchId)).map((b, i): [string, string] => [`プラン（拠点${i + 1}）`, /ES\d{6}/.test(b.plan) ? `${b.plan.match(/ES\d{6}/)![0]}（${nfVm(b) ? 'ESライト（自販機）' : b.course}）` : '']).filter((x) => x[1]),
      ...f.branches.filter((b) => !(isSwitch(b) && b.branchId)).map((b, i): [string, string] => [`基準数のパターン（拠点${i + 1}）`, nfVm(b) ? '自販機' : b.pattern === '短消費期限なし' ? '短消費期限なし' : '通常']),
      /* 代理入力で入れた法人・申込者・拠点の住所・担当者・営業担当は、受付（仮登録・本登録）に引き継ぐ（二重入力にしない）。defaultSetup が読む */
      ...(f.es ? [['ES営業担当', f.es]] : []), ...(f.corpKind === '新しい法人' ? [['法人名フリガナ', f.ckana.trim()], ['請求先法人名', f.cbill.trim()], ['法人住所', f.caddr.trim()], ['法人電話', f.ctel.trim()]] : []),
      ['申込者', f.pname.trim()], ['申込者フリガナ', f.pkana.trim()], ['申込者メール', f.pmail.trim()], ['申込者電話', f.ptel.trim()],
      ...f.branches.filter((b) => !(isSwitch(b) && b.branchId)).flatMap((b, i): [string, string][] => [
        [`郵便番号（拠点${i + 1}）`, b.zip.trim()], [`住所（拠点${i + 1}）`, b.addr.trim()], [`拠点のご担当者（拠点${i + 1}）`, b.staff.trim()],
        [`納品不可曜日（拠点${i + 1}）`, b.ng.trim()], [`配送備考（拠点${i + 1}）`, b.note.trim()],
      ]).filter((x) => x[1]),
      /* 設置フロア（拠点N）。defaultSetup が拠点の「設置フロア」に入れる */
      ...f.branches.filter((b) => !(isSwitch(b) && b.branchId)).map((b, i): [string, string] => [`設置フロア（拠点${i + 1}）`, (b.floor ?? '').trim()]),
    ] as [string, string][],
  };
}

/* ---------------- 変更申請の代理入力（2026/09/29 v1.5・28-144） ---------------- */
export type CfForm = {
  route: string; recv: string; kind: string; corp: string; br: string; start: string; resume: string;
  /** 解約日（サイクル月の番号。年×12＋月） */
  cxl: string; content: string; reason: string;
  /** 解約のときの残り在庫の扱い（全て買取／返却） */
  stock: string;
};
export const cycIdx = (s: string) => {
  const m = String(s || '').match(/(\d{4})年(\d{1,2})月/);
  return m ? +m[1] * 12 + +m[2] : null;
};
/** 解約日の選択肢（受付日で決まる最短の解約日より前は選べない） */
export function cxlOptions(recv: string) {
  const d = pdIso(recv), R = d ? cxlRule(d) : null, out: { v: string; t: string; ng: boolean }[] = [];
  for (let i = cxlI(2026, 10); i <= cxlI(2027, 6); i++) {
    const ng = !!(R && i < R.last.i);
    out.push({ v: String(i), t: fmtDatesIn(`${cxlYM(i).t}サイクルの末日（${ymd(cxlEnd(i))}）`) + (ng ? '　締切後のため選べません' : ''), ng });
  }
  return out;
}
/**
 * 入力から休止の通算・解約日を計算し、登録できない理由（bad）を返す。
 * 画面は決まった値（VMBR・PAUSE_PAST）で見せ、actions は共通データの値（ctx）で確かめる
 */
export function cfCalc(f: CfForm, ctx?: { vm: boolean; hist: [string, number][] }) {
  const kind = f.kind, cu = (f.br.match(/^(CU\d+)/) || [])[1] || '';
  const r: {
    kind: string; cu: string; vm: boolean; bad: string;
    pause: { hist: [string, number][]; past: number; cur: number | null; resume: string; total: number | null } | null;
    cxl: { R: CxlRule; sel: ReturnType<typeof cxlYM> | null } | null;
  } = { kind, cu, vm: ctx ? ctx.vm : !!VMBR[cu], bad: '', pause: null, cxl: null };
  if (kind === '休止') {
    const hist = ctx ? ctx.hist : PAUSE_PAST[cu] || [], past = hist.reduce((s, h) => s + h[1], 0);
    const s0 = cycIdx(f.start), e0 = cycIdx(f.resume);
    const cur = s0 && e0 ? e0 - s0 : null;
    r.pause = { hist, past, cur, resume: f.resume, total: cur == null ? null : past + cur };
    if (cur != null && cur <= 0) r.bad = '再開予定月は、開始（適用）するサイクル月より後を選んでください。';
    else if (r.pause.total != null && r.pause.total > PAUSE_MAX) r.bad = `通算の休止が ${r.pause.total}ヶ月（過去 ${past}ヶ月＋今回 ${cur}ヶ月）になり、上限の12ヶ月を超えるため登録できません。休止ではなく解約をご案内してください。`;
  }
  if (kind === '配送の変更' && r.vm) r.bad = '設備が自販機の拠点は配送方法が ES配送便に固定のため、配送方法の変更は登録できません。';
  if (kind === '解約') {
    const xd = pdIso(f.recv);
    r.cxl = xd ? { R: cxlRule(xd), sel: f.cxl ? cxlYM(+f.cxl) : null } : null;
    if (xd && r.cxl && r.cxl.sel && r.cxl.sel.i < r.cxl.R.last.i)
      r.bad = fmtDatesIn(`解約日 ${ymd(cxlEnd(r.cxl.sel.i))} は、受付日 ${ymd(xd)} で決まる最短の解約日 ${ymd(r.cxl.R.end)} より前のため登録できません。`);
  }
  return r;
}
/** 欄を出すか（休止のときだけ再開予定月、解約のときは開始の代わりに解約日） */
export const cfShows = (kind: string) => ({ resume: kind === '休止', cxl: kind === '解約', start: kind !== '解約' });
/** 必須の欄（未入力のキー） */
export function cfErrors(f: CfForm): string[] {
  const bad: string[] = [], show = cfShows(f.kind);
  const need = (k: keyof CfForm) => { if (!String(f[k] ?? '').trim()) bad.push(k); };
  need('route'); need('recv'); need('kind'); need('corp'); need('br');
  if (show.start) need('start');
  if (show.resume) need('resume');
  if (show.cxl) { need('cxl'); need('stock'); }
  need('content');
  return bad;
}
/** サイクル月の表示（2027年2月サイクル）→ YYYY-MM */
const cycYm = (i: number | null) => (i ? `${Math.floor((i - 1) / 12)}-${pad2(i - Math.floor((i - 1) / 12) * 12)}` : '');
/** 登録する変更申請（共通データの apply.submitChange に渡す中身） */
export function cfApply(f: CfForm, ctx?: { vm: boolean; hist: [string, number][] }) {
  const cc = cfCalc(f, ctx);
  const corpId = (f.corp.match(/^(CU\d+)/) || [])[1] || '', br = (f.br.match(/^(CU\d+)/) || [])[1] || '';
  const request: [string, string][] = [['申請の内容', f.content], ['開始したいサイクル月', f.start], ['理由', f.reason || '—'], ['受付', `代理入力（${f.route}・${f.recv}）`]];
  let startCycle = cycYm(cycIdx(f.start));
  const change: { fromCycle?: string; toCycle?: string; resumeCycle?: string; keepEquipment?: boolean; lastCycle?: string } = {};
  if (f.kind === '休止' && cc.pause) {
    request.splice(2, 0, ['再開予定月', cc.pause.resume]);
    const resume = cycIdx(f.resume);
    Object.assign(change, { fromCycle: startCycle, toCycle: cycYm(resume ? resume - 1 : null), resumeCycle: cycYm(resume), keepEquipment: true });
  }
  if (f.kind === '再開') change.resumeCycle = startCycle;
  if (f.kind === '解約' && cc.cxl && cc.cxl.sel) {   /* 2026/10/01 E1：解約日は選んだサイクルの末日。開始＝その次のサイクル月 */
    const xs = cc.cxl.sel;
    change.lastCycle = cycYm(xs.i); startCycle = cycYm(xs.i + 1);
    request.splice(1, 1, ['解約をご希望の日', `${xs.t}サイクルの最終日（${ymd(cxlEnd(xs.i))}）`]);
    request.splice(2, 0, ['残った商品（在庫）の扱い', f.stock || CXL_STOCK_BUY]);
  }
  return { kind: f.kind as ChangeApp['kind'], corpId, branchIds: f.kind === '法人情報の変更' ? [] : [br], startCycle, request, change };
}

/* ---------------- 法人・拠点・契約の画面へのリンク（元は法人画面デモを開く） ---------------- */
/** 「法人 ＞ 基本情報」などの画面名から、法人・契約管理の画面の URL */
export function entityHref(loc: string): string {
  const t = loc.split('＞').map((x) => x.trim());
  const s = ({ '法人': 'corps', '法人情報編集': 'corps', '拠点': 'branches', '拠点情報編集': 'branches', '親契約': 'branches', '子契約': 'contracts', '契約情報編集（子契約）': 'contracts' } as Record<string, string>)[t[0]] || 'branches';
  return `/ops/${s}`;
}


/* ---------------- 変更申請の代理入力（契約変更タブ。台帳 運営A Q7・Q11） ---------------- */
/** 契約変更タブの種類（法人Web の手続きの記号） */
export const PC_KINDS: { k: ChKind; t: ChangeKind }[] = [
  { k: 'chg', t: 'プランの変更' }, { k: 'opt', t: '配送の変更' }, { k: 'eqp', t: '設備の変更' }, { k: 'inf', t: '拠点情報の変更' }, { k: 'cop', t: '法人情報の変更' },
];
/** 休止・解約タブの種類（契約変更タブと同じ形のフォーム。台帳 運営A 2026-10-07 Q17） */
export const PS_KINDS: { k: ChKind; t: ChangeKind }[] = [{ k: 'sus', t: '休止' }, { k: 'rsm', t: '再開' }, { k: 'cxl', t: '解約' }];
export const PCS_KINDS = [...PC_KINDS, ...PS_KINDS];

export type PcForm = {
  route: string; recv: string; kind: ChKind; corpId: string;
  /** 選んだ拠点（法人情報の変更は空） */
  sites: string[];
  /** 拠点ごとの入力（法人情報の変更は法人ID のキー）。キーは法人Web の欄（chFields）と同じ */
  vals: Record<string, Record<string, string>>;
};

