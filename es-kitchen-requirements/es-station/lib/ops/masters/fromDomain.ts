import { discountApplyRows } from '@/lib/csv/discountApply';
import type { DocRepo } from '../core/area';
import type { AuditLog, Branch, ChildContract, Contract, Course, Discount, Loan, Model, Option, Plan, PlanCoursePrice, PriceGen } from '@/lib/domain/types';
import { ApiError } from '@/lib/api/errors';
import { nowStamp } from '@/lib/supplier/dates';
import { yenOf } from '@/lib/domain/snapshot';
import { allCheckTargets, allCheckValues, fieldByName, indexOf, kubunOf, num, rowFromValues, tablesOf, useCountOf, valueOfName, valueParts, valuesOf, type Tables, type Values } from './logic';
import { CL, planDbOf, usedOf, writePlanDb, type PlanDb } from './planCsv';
import { priceGenUse } from '@/lib/domain/bulk';
import { deviceFill, PLAN_DB } from './seed';
import { DEVICES_ROWS, DISCOUNTS_ROWS, OPTIONS_ROWS, PLANS_ROWS, type SeedRow } from './seedRows';
import { materialRecs } from './material';
import type { MasterKind, MasterRec, TRow } from './types';
import { discountTax, modelTax, optionTax, planBaseTax, planWelfareTax, taxLabel } from '@/lib/domain/tax';
import { calcOf } from '@/lib/domain/charges';

/*
 * 共通データ（dm.master.plans／models／options／discounts）から、運営Web のマスタ管理の形（MasterRec）を作る。
 * 名前・区分・料金・最低利用期間・公開・状態・プランの食数とコースごとの公開中の価格は共通データ。
 * 共通データにない項目（メーカー・寸法・価格の世代・標準貸出設備・連動タイプ・計算区分など）は、
 * 元のデモの見本（seedRows.ts・seed.ts の PLAN_DB・spec の値）のまま。運営が保存した画面の値は masters.extra に持つ。
 */

export const EXTRA = 'masters.extra';
export type Extra = { id: string; values?: Values; tables?: Tables; priceUsed?: MasterRec['priceUsed']; deleted?: boolean; /** 同時更新の検知の版（保存のたびに +1・lib/ops/core/concurrency.ts） */ ver?: string };
export const extraOf = (r: DocRepo, kind: MasterKind, id: string) => r.get<Extra>(EXTRA, `${kind}:${id}`);
export const putExtra = (r: DocRepo, kind: MasterKind, id: string, x: Omit<Extra, 'id'>) =>
  r.put<Extra>(EXTRA, `${kind}:${id}`, { ...(extraOf(r, kind, id) ?? {}), ...x, id: `${kind}:${id}` });

/** A型の契約項目の表示 */
const LINK_LABEL: Record<NonNullable<Option['linkedItem']>, string> = { deliveryCount: '配送回数', esqr: 'ES-QR', guestMode: 'ゲストモード', userCash: 'ユーザー現金利用' };
/** 値引きの計算区分の表示 */
const CALC_LABEL: Record<ReturnType<typeof calcOf>, string> = { fixed: '固定額', rate: '料率', diffAuto: '差額自動', liteBase: '差額自動', refPlan: 'プラン料金を参照' };

/** 画面のマスタの種類 → 共通データのマスタ */
export const DM: Record<MasterKind, 'models' | 'plans' | 'options' | 'discounts' | 'materials'> = { devices: 'models', plans: 'plans', options: 'options', discounts: 'discounts', materials: 'materials' };
const ROWS: Record<MasterKind, SeedRow[]> = { devices: DEVICES_ROWS, plans: PLANS_ROWS, options: OPTIONS_ROWS, discounts: DISCOUNTS_ROWS, materials: [] };
const comma = (n: number) => n.toLocaleString('ja-JP');
/** コース（共通データ）→ CSV のコース */
const CMAP: Record<string, (typeof CL)[number]> = { ESスタンダード: 'スタンダード', 'ESライト（冷蔵庫）': 'ライト', 'ESライト（自販機）': 'ライト（自販機）' };

/** 項目名の値を入れる（同じ名前の欄がタブ・区分パネルに複数あれば全部） */
export function setByName(kind: MasterKind, values: Values, name: string, x: string) {
  for (const { f } of indexOf(kind).fields.filter((a) => a.f.name === name)) {
    const i = f.mi ?? 0, p = valueParts(f.ctl)[i];
    const cur = [...(values[f.k] ?? f.v)];
    cur[i] = p?.t === 'sel' ? p.o.find((o) => o === x) ?? p.o.find((o) => o.indexOf(x) === 0) ?? x : x;
    values[f.k] = cur;
  }
}

/* ---------- 使っている数（共通データの契約・貸出から） ---------- */

type Use = { kids: ChildContract[]; contracts: Contract[]; loans: Loan[]; month: string };
const useCtx = (r: DocRepo, month: string): Use => ({
  kids: r.list<ChildContract>('dm.org.childContracts').filter((k) => !k.canceled), contracts: r.list<Contract>('dm.org.contracts'), loans: r.list<Loan>('dm.org.loans'), month,
});
/** 今のサイクル月以降の子契約で使っている親契約の数 */
const contractsUsing = (u: Use, pick: (k: ChildContract) => boolean) => {
  const live = new Set(u.contracts.filter((c) => !['終了'].includes(c.status)).map((c) => c.id));
  return new Set(u.kids.filter((k) => k.cycleMonth >= u.month && live.has(k.contractId) && pick(k)).map((k) => k.contractId)).size;
};

/** 変更履歴（操作の記録 dm.account.audit・新しい順）→ 表の行（変更日時・変更内容・変更者・変更区分）。プランはタブ「変更履歴」に出す（受付簿 #101） */
export function historyRows(r: DocRepo, kind: MasterKind, id: string): TRow[] {
  return r.list<AuditLog>('dm.account.audit').filter((x) => x.target === `${DM[kind]}:${id}`).reverse()
    .map((h) => ({ c: [h.at, h.detail, h.accountId, /CSV/.test(h.accountId) ? 'CSV取込' : '手入力'].map((text) => ({ corp: '0', text })) }));
}

/**
 * 機種の「貸出中の拠点」の表（共通データ dm.org.loans・貸出日の新しい順）。列：貸出ID・拠点ID・拠点名・個体番号・未返却数・貸出日・返却予定日・貸出ステータス。
 * 個体番号は共通データにない（—）。合計（貸出中 合計・回収未完了）はこの全件から出す（受付簿 #113）
 */
export function loanRows(r: DocRepo, loans: Loan[], modelId: string, day: string): { rows: TRow[]; total: number; branches: number; overdue: Loan[] } {
  const mine = loans.filter((l) => l.modelId === modelId).sort((a, b) => b.startOn.localeCompare(a.startOn) || b.id.localeCompare(a.id));
  const name = (id: string) => r.get<Branch>('dm.org.branches', id)?.name ?? id;
  const left = (l: Loan) => (l.status === '回収済' ? 0 : l.qty);
  const rows = mine.map((l) => ({ c: [l.id, l.branchId, name(l.branchId), '—', String(left(l)), l.startOn, l.dueOn || '—', l.status].map((text, i) => ({ corp: '0', text, ...(i === 4 ? { cls: 'r' } : {}) })) }));
  const live = mine.filter((l) => left(l) > 0);
  /* 回収未完了（アラート）＝返却予定日 < 今日 かつ 未返却数 > 0 */
  const overdue = live.filter((l) => !!l.dueOn && l.dueOn < day);
  return { rows, total: live.reduce((a, l) => a + l.qty, 0), branches: new Set(live.map((l) => l.branchId)).size, overdue };
}

/* ---------- 1件 ---------- */

function base(kind: MasterKind, id: string) {
  const s = ROWS[kind].find((x) => x.id === id);
  const fill = s && kind === 'devices' ? deviceFill(s) : s?.fill;
  return { row: { ...(s?.row ?? {}) }, badge: { ...(s?.badge ?? {}) }, system: !!s?.system, fill };
}

/** サイクル月 YYYY-MM → 日付（月の初日・前の月の末日） */
const firstDay = (ym: string) => `${ym.replace('-', '/')}/01`;
const dayBefore = (ym: string) => { const [y, m] = ym.split('-').map(Number); const d = new Date(y, m - 1, 0); return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`; };

/** 世代の名前（メモの先頭。「改訂第三回目（2026/04/01〜）」→「改訂第三回目」）。価格プランの表の「価格プラン」の列 */
export const genName = (g: Pick<PriceGen, 'id' | 'note'>) => g.note.replace(/（.*$/, '').trim() || g.id;

/**
 * プラン：共通データの名前・食数・公開を画面の値に重ねる。価格プランの表（コースごと・1行＝1つの価格世代 Plan.priceGens）は価格世代から作る
 * （台帳 F「プランマスタの価格の持ち方」2026-10-05）。価格プラン＝世代の名前、開始・終了＝世代の期間（記録）、
 * 公開用＝運営が印を付けた世代（priceGens[].public。印がない古いデータは今月の世代）、価格（COOL便）／価格（ES配送便）＝配送方法ごとの価格、
 * used＝その世代を使っている子契約の数。初期料金はプランに持たない（自販機の機種マスタ・OP000008：2026/10/03）
 */
function planOnto(r: DocRepo, x: Plan, values: Values, tables: Tables, keepPubName: boolean, month: string) {
  const db: PlanDb = planDbOf({}, values, tables);
  db.plan = { ...(db.plan ?? {}), 管理用プラン名: x.name, 月次提供上限の合計: String(x.monthlyMeals), 公開ステータス: x.public ? '公開' : '非公開', 選べるコース: x.prices.map((p) => CMAP[p.course]).join('・') };
  if (!keepPubName) db.plan['公開用プラン名'] = x.name;
  /* コースごとの月の上限・標準の配送回数は共通データ（Plan.limits）。画面の見本の値（100プランの値）のままにしない */
  for (const l of x.limits ?? []) {
    const c = CMAP[l.course];
    const o = db.courses[c];
    if (!o) continue;
    if (l.temp === '冷凍') { o['冷凍_月次提供数_上限'] = String(l.meals); o['冷凍_標準の配送回数'] = String(l.deliveries); }
    else { o['冷蔵常温_月次提供数_上限'] = String(l.meals); o['冷蔵常温_標準の配送回数'] = String(l.deliveries); }
  }
  const used = priceGenUse(r, x, `${month.replace('-', '/')}/01`).map((g) => ({ id: g.id, fromCycle: g.fromCycle, until: g.until, note: g.note, prices: g.prices, used: g.used, public: !!g.public, periodFrom: g.periodFrom, periodTo: g.periodTo }));
  /* 価格世代がない古いプランは、いまの料金を1世代として出す */
  const gens = used.length ? used : [{ id: '', fromCycle: '2026-04', until: '', note: '改訂第三回目', prices: x.prices, used: 0, public: true, periodFrom: undefined, periodTo: undefined }];
  const pub = gens.find((g) => g.public) ?? gens.filter((g) => g.fromCycle <= month).pop() ?? gens[0];
  for (const p of x.prices) {
    const c = CMAP[p.course], vm = c === 'ライト（自販機）';
    db.prices[c] = gens.map((g) => {
      const y = g.prices.find((z) => z.course === p.course) ?? p;
      return {
        価格プラン: genName(g), 開始期間: g.periodFrom || firstDay(g.fromCycle), 終了期間: g.periodTo || (g.until ? dayBefore(g.until) : ''),
        '価格（COOL便）': vm ? '' : String(yenOf(y, 'COOL便')), '価格（ES配送便）': String(yenOf(y, 'ES配送便')),
        公開用: g === pub ? '1' : '', used: g.used,
      };
    });
  }
  return writePlanDb(values, tables, db);
}

/**
 * 価格プランの表（コースごと・1行＝1世代）→ 価格世代（Plan.priceGens）と公開用の価格（Plan.prices）。登録／保存で呼ぶ（受付簿 #95・#74/#84）。
 *   世代は名前（価格プラン）で同じものとする（システム全体で共通の名前）。開始期間の月＝適用開始（fromCycle）。公開用＝印の付いた行（全コースで同じ世代・1つ）
 *   子契約が使っている世代は価格・開始期間を変えない・消さない（料金を変えるときは新しい世代を足すか「誤りの訂正」）。
 *   コースの表にその名前の行がないときは、いまの世代 → プランの価格 の順で埋める（世代はプランのコース全部の価格を持つ）
 */
export function gensFromTables(r: DocRepo, plan: Plan, values: Values, tables: Tables, month: string): { priceGens: PriceGen[]; prices: PlanCoursePrice[] } {
  const db = planDbOf({}, values, tables);
  const cur = priceGenUse(r, plan, `${month.replace('-', '/')}/01`);
  const courses = (Object.entries(CMAP) as [Course, (typeof CL)[number]][]).filter(([, c]) => db.prices[c]).map(([course, c]) => ({ course, c }));
  const names: string[] = [];
  for (const { c } of courses) for (const row of db.prices[c] ?? []) { const n = String(row['価格プラン'] ?? '').trim(); if (n && !names.includes(n)) names.push(n); }
  const ym = (d: string) => { const m = /^(\d{4})[/-](\d{1,2})/.exec(d.trim()); return m ? `${m[1]}-${m[2].padStart(2, '0')}` : ''; };
  const nOr = (s: unknown, d?: number) => { const n = num(s); return String(s ?? '').trim() === '' || isNaN(n) ? d : n; };
  const norm = (x: PlanCoursePrice) => [x.course, yenOf(x, 'ES配送便'), x.course === 'ESライト（自販機）' ? null : yenOf(x, 'COOL便')];
  let maxNo = Math.max(0, ...(plan.priceGens ?? []).map((g) => Number(g.id.split('-').pop()) || 0));
  const out: PriceGen[] = [];
  for (const name of names) {
    const ex = cur.find((g) => genName(g) === name);
    const rows = courses.map(({ course, c }) => ({ course, row: (db.prices[c] ?? []).find((x) => String(x['価格プラン'] ?? '').trim() === name) }));
    const first = rows.find((x) => x.row)?.row;
    const fromCycle = ym(String(first?.['開始期間'] ?? '')) || ex?.fromCycle || month;
    const prices: PlanCoursePrice[] = courses.map(({ course }) => {
      const row = rows.find((x) => x.course === course)?.row;
      const exP = ex?.prices.find((x) => x.course === course), base = plan.prices.find((x) => x.course === course);
      const vm = course === 'ESライト（自販機）';
      const es = nOr(row?.['価格（ES配送便）'], exP ? yenOf(exP, 'ES配送便') : base ? yenOf(base, 'ES配送便') : undefined);
      const cool = vm ? undefined : nOr(row?.['価格（COOL便）'], exP ? yenOf(exP, 'COOL便') : base ? yenOf(base, 'COOL便') : undefined);
      const yen = es ?? cool;
      if (yen === undefined || !(yen > 0)) throw new ApiError(`${course}：価格プラン「${name}」の価格を入れてください`, 400);
      return { course, monthlyYen: yen, ...(es !== undefined ? { esYen: es } : {}), ...(cool !== undefined ? { coolYen: cool } : {}) };
    });
    const pub = rows.some((x) => x.row?.['公開用'] === '1');
    if (ex && ex.used > 0 && (ex.fromCycle !== fromCycle || JSON.stringify(ex.prices.map(norm)) !== JSON.stringify(prices.map(norm)))) {
      throw new ApiError(`価格プラン「${name}」は子契約 ${ex.used}件が使っているので、価格・開始期間は変えられません（料金を変えるときは新しい世代を足すか、誤りの訂正をしてください）`, 400);
    }
    out.push({
      id: ex?.id ?? `PG-${plan.id}-${String(++maxNo).padStart(2, '0')}`, fromCycle, prices: ex && ex.used > 0 ? ex.prices : prices,
      note: ex && ex.note.startsWith(name) ? ex.note : name, at: ex?.at ?? nowStamp(), by: ex?.by ?? '運営', public: pub,
      ...(String(first?.['開始期間'] ?? '').trim() ? { periodFrom: String(first?.['開始期間']).trim() } : {}), ...(String(first?.['終了期間'] ?? '').trim() ? { periodTo: String(first?.['終了期間']).trim() } : {}),
      ...(ex?.fixes ? { fixes: ex.fixes } : {}),
    });
  }
  for (const g of cur) if (!names.includes(genName(g)) && g.used > 0) throw new ApiError(`価格プラン「${genName(g)}」は子契約 ${g.used}件が使っているので消せません`, 400);
  const pubs = out.filter((g) => g.public);
  if (out.length && pubs.length !== 1) throw new ApiError(pubs.length ? `公開用の価格プランは全コースで同じ世代（1つ）にしてください（${pubs.map(genName).join('・')}）` : '公開用の価格プランを1行選んでください', 400);
  const months = out.map((g) => g.fromCycle), dup = months.find((m, i) => months.indexOf(m) !== i);
  if (dup) throw new ApiError(`開始期間が同じ月（${dup}）の価格プランが2つあります（世代の適用開始は月ごとに1つ）`, 400);
  out.sort((a, b) => a.fromCycle.localeCompare(b.fromCycle));
  return { priceGens: out, prices: pubs[0] ? pubs[0].prices.map((x) => ({ ...x })) : plan.prices };
}

function recOf(r: DocRepo, kind: MasterKind, x: Plan | Model | Option | Discount, seq: number, u: Use): MasterRec {
  const b = base(kind, x.id);
  const ext = extraOf(r, kind, x.id);
  const seedRec = { id: x.id, kind, name: x.name, row: b.row, badge: b.badge, fill: b.fill, use: 0 } as MasterRec;
  let values: Values, tables: Tables;
  if (ext?.values) ({ values, tables } = { values: { ...ext.values }, tables: { ...(ext.tables ?? tablesOf(kind, seedRec)) } });
  else if (kind === 'plans' && PLAN_DB[x.id] && x.id !== 'ES000004') ({ values, tables } = writePlanDb(valuesOf(kind, seedRec), tablesOf(kind, seedRec), PLAN_DB[x.id]));
  else ({ values, tables } = { values: valuesOf(kind, seedRec), tables: tablesOf(kind, seedRec) });
  const set = (n: string, v: string) => setByName(kind, values, n, v);
  let use = 0;
  let deleted = !!ext?.deleted;
  if (kind === 'devices') {
    const m = x as Model;
    set('機種ID', m.id); set('機種名', m.name); set('機種区分', m.category); set('月額料金（税抜き）', comma(m.monthlyYen)); set('初期料金（税抜き）', m.initFeeYen !== undefined ? comma(m.initFeeYen) : '');
    set('最低利用期間', m.minMonths ? String(m.minMonths) : ''); set('公開ステータス', m.public ? '公開' : '非公開');
    set('税率', taxLabel(r, modelTax(m)));
    if (m.status !== '削除済') set('有効状態', m.status);
    deleted ||= m.status === '削除済';
    /* 貸出中の拠点の表・合計は共通データの貸出から（見本の行・文字は使わない。受付簿 #113） */
    const ln = loanRows(r, u.loans, m.id, `${u.month.replace('-', '/')}/01`);
    tables = { ...tables, 貸出中の拠点: ln.rows };
    set('貸出中 合計', `${ln.total} 台（${ln.branches}拠点）`);
    set('回収未完了（アラート）', `${ln.overdue.length} 件${ln.overdue.length ? `（${[...new Set(ln.overdue.map((l) => l.branchId))].join('・')}）` : ''}`);
    b.row.n = `${ln.total}台`;
  } else if (kind === 'plans') {
    const p = x as Plan;
    set('プランID', p.id);
    ({ values, tables } = planOnto(r, p, values, tables, !!ext?.values, u.month));
    setByName(kind, values, '基本料金の税率', taxLabel(r, planBaseTax(p))); setByName(kind, values, '企業負担分の税率', taxLabel(r, planWelfareTax(p)));
    /* 企業負担額・免責金額・基本比×倍・利用人数目安は共通データのプラン（2026/10/03：画面で直すと請求・メニューに効く） */
    if (p.welfareYenPerMeal !== undefined) setByName(kind, values, '企業負担額（税込・1食）', String(p.welfareYenPerMeal));
    if (p.deductibleYen !== undefined) setByName(kind, values, '免責金額', String(p.deductibleYen));
    if (p.baseRatio !== undefined) setByName(kind, values, '基本比×倍', String(p.baseRatio));
    if (p.peopleText) setByName(kind, values, '利用人数目安（表示用）', p.peopleText);
    deleted ||= p.status === '削除済';
    use = contractsUsing(u, (k) => k.planId === p.id);
    /* 変更履歴のタブ：共通データの変更の記録（初期備品・プランに含む資材・プラン設定の変更）。見本の行は使わない（受付簿 #101） */
    tables = { ...tables, 変更履歴: historyRows(r, kind, p.id) };
  } else if (kind === 'options') {
    const o = x as Option;
    use = contractsUsing(u, (k) => k.optionIds.includes(o.id));
    set('オプションID', o.id); set('管理名（社内用）', o.mgmtName || o.name); set('請求書表示名', o.name);
    if (o.note) set('説明', o.note); set('オプション区分', o.category); set('料金種別', o.feeType);
    set('標準金額（税抜）', comma(o.amountYen)); set('利用状態', o.status === '停止中' || o.status === '削除済' ? '終了' : o.status);
    set('税率', taxLabel(r, optionTax(o)));
    /* 費目のマスタの項目（連動タイプ・連動する契約項目・金額の種類・単位。2026/10/03 統一モデル） */
    set('連動タイプ', o.linkType === 'A' ? 'A' : '連動しない');
    if (o.linkedItem) set('連動する契約項目', LINK_LABEL[o.linkedItem]);
    if (o.amountKind) set('金額の種類', o.amountKind === '契約ごと' || o.amountKind === '参照' ? '拠点ごと' : o.amountKind === '機種参照' ? '機種参照（機種マスタの値・契約ごとに直せる）' : o.amountKind);
    if (o.unit) set('単位', o.unit === '回' && o.linkType === 'A' ? '超過1単位' : o.unit);
    /* 対象のコース・対象の機種区分：空＝「すべて」が ON（受付簿 #119） */
    for (const [n, sel] of [['対象のコース', o.targetCourses], ['対象の機種区分', o.targetModelKinds]] as const) { const f = fieldByName(kind, n); if (f) values[f.k] = allCheckValues(f, sel); }
    deleted ||= o.status === '削除済';
    b.row.n = `${use}拠点`;
  } else {
    const d = x as Discount;
    use = contractsUsing(u, (k) => k.discountIds.includes(d.id));
    set('値引きID', d.id); set('値引き名（管理用）', d.mgmtName || d.name); set('請求書表示名', d.name); set('適用対象', d.target); set('利用状態', d.status === '使用中' ? '使用中' : '終了');
    if (d.note) set('説明', d.note);
    set('計算区分', CALC_LABEL[calcOf(d)]);
    if (d.amountYen || d.ratePct) set('値引きの値', String(d.amountYen ?? d.ratePct));
    if (d.maxPerCorp) set('回数の上限', d.maxPerCorp === 1 ? '法人ごとに1回' : '法人ごとにN回');
    set('自動で付ける条件', d.trigger === 'event.trialChild' ? '契約種別＝お試しキャンペーン' : d.auto === 'auto' ? '契約項目に連動' : '付けない');
    set('税率の扱い', discountTax(d) ? '個別に指定' : '元の費目と同じ'); if (discountTax(d)) set('税率（個別に指定）', taxLabel(r, discountTax(d)));
    /* 適用一覧は子契約の値引きから作る表示だけ（台帳 2026/10/03）。見本の行は使わない */
    const amt = d.ratePct ? `${d.ratePct}%` : d.amountYen ? comma(d.amountYen) : '—';
    tables = { ...tables, 適用一覧: discountApplyRows({ r }, d.id).map((a) => ({ c: [a.branchId, a.branchName, a.from, a.to || '—', amt, '子契約'].map((text) => ({ corp: '0', text })) })) } as Tables;
    deleted ||= d.status === '削除済';
    b.row.n = `${use}拠点`;
  }
  /* A型（契約項目に連動）はシステム定義（新規に作れない・消せない・28-43） */
  const system = b.system || (kind === 'options' && (x as Option).linkType === 'A');
  const rec: MasterRec = { id: x.id, kind, name: x.name, row: b.row, badge: b.badge, deleted, system, fill: b.fill, values, tables, use, seq };
  Object.assign(rec, rowFromValues(kind, rec, values, tables));
  if (deleted) rec.row = { ...rec.row, status: '削除済' };
  /* 価格の世代を使っている子契約の数は共通データから（課題 4b-9） */
  if (kind === 'plans') {
    rec.contracts = use; rec.priceUsed = usedOf(planDbOf({}, values, tables));
    /* 検索だけに使う（hong 2026/10/05 A〜E）：利用中＝親契約が1つ以上、更新日＝最後に保存した日（見本データは空） */
    rec.row = { ...rec.row, inuse: use > 0 ? '利用中' : '未使用', updated: ((x as Plan).updatedAt ?? '').slice(0, 10) };
  }
  else rec.use = useCountOf(kind, rec.row);
  return rec;
}

/** マスタの一覧（共通データの並び） */
export function recsOf(r: DocRepo, kind: MasterKind, month: string): MasterRec[] {
  /* 資材は spec 駆動の項目（values・tables）を持たない専用の形（lib/ops/masters/material.ts） */
  if (kind === 'materials') return materialRecs(r);
  const u = useCtx(r, month);
  return r.list<Plan | Model | Option | Discount>(`dm.master.${DM[kind]}`).map((x, i) => recOf(r, kind, x, i, u));
}
export const recOne = (r: DocRepo, kind: MasterKind, id: string, month: string) => recsOf(r, kind, month).find((x) => x.id === id);

/* ---------- 画面の値 → 共通データ ---------- */

/** 画面の値から、共通データのマスタの項目を作る（cur＝いまの共通データ。新規は undefined。taxId＝税率の表示 → 税率 ID） */
export function domainOf(kind: MasterKind, values: Values, tables: Tables, cur?: Record<string, unknown>, taxId: (label: string) => string | undefined = () => undefined): Record<string, unknown> {
  const v = (n: string, pane?: string) => valueOfName(kind, values, n, pane);
  const tx = (n: string, key = 'taxRateId') => taxId(v(n)) ?? (cur?.[key] as string | undefined);
  if (kind === 'devices') {
    const st = v('有効状態');
    return { name: v('機種名'), category: kubunOf(kind, values), monthlyYen: num(v('月額料金（税抜き）')) || 0, ...(v('初期料金（税抜き）') ? { initFeeYen: num(v('初期料金（税抜き）')) || 0 } : {}), minMonths: num(v('最低利用期間')) || 0, public: v('公開ステータス') === '公開', status: st === '無効' ? '無効' : '有効', taxRateId: tx('税率') };
  }
  if (kind === 'plans') {
    const db = planDbOf({}, values, tables);
    /* コースごとの月の上限・標準の配送回数（共通データ Plan.limits。画面のコースのタブの値） */
    const limits = Object.entries(CMAP).flatMap(([course, c]) => {
      const o = db.courses[c];
      if (!o) return [];
      const row = (temp: '冷蔵' | '冷凍', m: string, d: string) => ({ course, temp, meals: num(o[m]) || 0, deliveries: num(o[d]) || 1 });
      return course === 'ESスタンダード'
        ? [row('冷蔵', '冷蔵常温_月次提供数_上限', '冷蔵常温_標準の配送回数'), row('冷凍', '冷凍_月次提供数_上限', '冷凍_標準の配送回数')]
        : [row('冷蔵', '冷蔵常温_月次提供数_上限', '冷蔵常温_標準の配送回数')];
    });
    /* 企業負担額・免責金額・基本比×倍（請求・メニューに効く）、残りわずか率・利用人数目安（持つだけ）。2026/10/03 回答 */
    const n = (label: string, key: string) => { const x = num(v(label)); return isNaN(x) || v(label).trim() === '' ? (cur?.[key] as number | undefined) : x; };
    const rate = Object.values(db.courses).map((o) => num(o?.['残りわずか率'])).find((x) => !isNaN(x));
    const base = { name: v('管理用プラン名'), monthlyMeals: num(v('月次提供上限の合計')) || 0, public: v('公開ステータス') === '公開', limits,
      taxRateId: tx('基本料金の税率'), welfareTaxRateId: tx('企業負担分の税率', 'welfareTaxRateId'),
      welfareYenPerMeal: n('企業負担額（税込・1食）', 'welfareYenPerMeal'), deductibleYen: n('免責金額', 'deductibleYen'), baseRatio: n('基本比×倍', 'baseRatio'),
      lowStockRate: rate ?? (cur?.lowStockRate as number | undefined), peopleText: v('利用人数目安（表示用）') || (cur?.peopleText as string | undefined) };
    /* 料金は価格世代が元（課題 4b-9）。いまのプランの料金は画面から変えない。新しいプランだけ、表の公開用の行を最初の料金にする */
    /* 初期料金はプランマスタに持たない（自販機の機種マスタ・OP000008：台帳 2026/10/03） */
    if (cur) return { ...base, status: cur.status ?? '有効' };
    const prices = Object.entries(CMAP).flatMap(([course, c]) => {
      const gens = db.prices[c];
      if (!gens) return [];
      const g = gens.find((x) => x['公開用'] === '1') ?? gens[gens.length - 1];
      const es = num(g?.['価格（ES配送便）']), cool = num(g?.['価格（COOL便）']);
      const n = es || cool;
      return g && n ? [{ course, monthlyYen: n, ...(es ? { esYen: es } : {}), ...(cool && c !== 'ライト（自販機）' ? { coolYen: cool } : {}) }] : [];
    });
    return { ...base, prices, status: '有効' };
  }
  if (kind === 'options') {
    const amt = num(v('標準金額（税抜）'));
    const link = v('連動タイプ');
    return {
      /* 連動タイプ・金額の種類は画面の値（A型の契約項目・いつ発生するかはシステム定義なので今の値のまま） */
      linkType: link ? (link.startsWith('A') ? 'A' : 'none') : cur?.linkType, amountKind: v('金額の種類').replace(/（.*$/, '') || cur?.amountKind,
      /* name＝請求書表示名（請求書・法人Web に出る）、mgmtName＝管理名（社内用・運営の一覧と選択肢。2026/10/03 決定） */
      name: v('請求書表示名') || (cur?.name as string | undefined) || v('管理名（社内用）'), mgmtName: v('管理名（社内用）'), note: v('説明') || (cur?.note as string | undefined) || '', category: v('オプション区分'), feeType: v('料金種別').replace(/（.*$/, ''),
      amountYen: isNaN(amt) || v('標準金額（税抜）').trim() === '' ? (cur?.amountYen ?? 0) : amt, status: v('利用状態') === '終了' ? '終了' : '使用中', taxRateId: tx('税率'),
      /* 対象のコース・対象の機種区分（「すべて」＝空。受付簿 #119） */
      targetCourses: allCheckTargets(fieldByName(kind, '対象のコース'), values[fieldByName(kind, '対象のコース')?.k ?? '']),
      targetModelKinds: allCheckTargets(fieldByName(kind, '対象の機種区分'), values[fieldByName(kind, '対象の機種区分')?.k ?? '']),
    };
  }
  return { name: v('請求書表示名') || v('値引き名（管理用）'), mgmtName: v('値引き名（管理用）'), target: v('適用対象'), note: v('説明') || (cur?.note ?? ''), status: v('利用状態') === '終了' ? (cur?.status === '終了' ? '終了' : '停止中') : '使用中',
    taxRateId: v('税率の扱い') === '個別に指定' ? tx('税率（個別に指定）') : undefined };
}
/** 新規登録の採番に使う ID（共通データ） */
export const idsOf = (r: DocRepo, kind: MasterKind) => r.list<{ id: string }>(`dm.master.${DM[kind]}`).map((x) => x.id);
