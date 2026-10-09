/*
 * 申込フォームの計算と入力チェック（画面と action の両方で使う）。元の 21_法人_申込フォーム.html の関数をそのまま移したもの。
 *   見積：quoteOf（契約1件）・quoteAll（申込全体・お試し割引）
 *   入力欄の定義：corpFields・planFields・destFields
 *   入力チェック：step1Errors・step2Errors・submitError（全角→半角は z2h／normalizeApply）
 *   運営Web の契約申請管理に出す行：intakeRow
 */
import type { IntakeRow } from '@/lib/ops/applications/types';
import {
  BILL_LEAD, CAMPAIGN_DISCOUNT, COURSES, DLV_ADD, EMP_RANGE, MEALS, MODEL, MODELS, PAY_CYCLE, PAY_METHODS, PLAN_TBL, PREF, SVC_OPT,
  type Model, type Plan,
} from './data';
import type { ApplyBranch, ApplyCorp, ApplyKind, ApplyState, ApplySubmit, FieldDef, FormErrors, Quote, QuoteAll, Staff } from './types';

import { yen as yenOf } from '@/lib/format/money';
export const yen = (n: number | null | undefined) => yenOf(n || 0);
export const num = (n: number | null | undefined) => Number(n || 0).toLocaleString('ja-JP');

/* ---------------- プラン・配送回数 ---------------- */
export const planOf = (b: Pick<ApplyBranch, 'meals' | 'course'>): Plan => PLAN_TBL[(b.meals || '100') + '|' + (b.course || 'ライト')] || PLAN_TBL['100|ライト'] || Object.values(PLAN_TBL)[0];
export const dStd = (b: ApplyBranch) => planOf(b).dstd || 1;
export function dCount(b: ApplyBranch) {
  const n = parseInt(String(b.dcount || ''), 10);
  return n && n >= dStd(b) ? n : dStd(b);
}
export const dExtra = (b: ApplyBranch) => Math.max(0, dCount(b) - dStd(b));
export function dText(b: ApplyBranch) {
  const x = dExtra(b);
  return dCount(b) + '回' + (x ? '（プラン標準 ' + dStd(b) + '回 ＋ 追加 ' + x + '回）' : '（プラン標準）');
}
export function dOpts(b: ApplyBranch) {
  const n = dStd(b), o = [{ v: String(n), t: n + '回（プラン標準）' }];
  for (let x = 1; x <= 2; x++) o.push({ v: String(n + x), t: (n + x) + '回（標準＋' + x + '回・お届け回数追加 ＋' + yen(DLV_ADD.fee * x) + '／月）' });
  return o;
}

/* ---------------- 設備（2026/09/30 整合チェック A3・決定 28-182） ----------------
   容量の判定：1回のお届け数（28-153・28-154）＝ 温度帯の月次提供数上限 ÷ 温度帯の標準のお届け回数 */
export function needOf(b: ApplyBranch, grp: string) {
  const p = planOf(b);
  if (grp === 'rf' || grp === 'vm') return Math.ceil(p.chill / (p.dstd || 1));
  if (grp === 'fz') return p.dfz ? Math.ceil(p.frz / p.dfz) : 0;
  return 0;
}
export function capOK(b: ApplyBranch, m: Model | undefined) {
  if (!m) return true;
  const need = needOf(b, m.grp);
  if (!need) return true; /* 判定しない区分 */
  return Number(m.cap || 0) >= need;
}
/** その枠で選べる機種（同じ grp・公開）。cap が足りないものも返し、画面でグレーにする */
export const sizeChoices = (grp: string) => MODELS.filter((m) => m.grp === grp && m.pub);
/** プランに含まれる設備（無料貸し出し）。自動販売機は ESライト（自販機）の標準：自販機×1＋資材ボックス（28-184） */
export function inclBase(b: ApplyBranch): [string, number][] {
  const p = planOf(b);
  if ((b.dev || 'rf') === 'vm') return p.vm ? [['vend', 1], ...p.box] : [];
  return p.std.slice();
}
export type InclRow = { k: string; qty: number; baseK: string; diff: number; up: boolean };
/** いま選ばれている設備。差額 ＝ 選んだ機種の月額 − 無料になる同じ区分の月額（マイナスなら 0） */
export function inclOf(b: ApplyBranch): InclRow[] {
  const ov = b._incl || {};
  return inclBase(b).map(([k, qty]) => {
    const base = MODEL[k];
    if (!base) return { k, qty, baseK: k, diff: 0, up: false };
    const pm = MODEL[ov[base.grp]];
    const use = pm && pm.grp === base.grp && capOK(b, pm) ? pm : base;
    const d = use.fee == null || base.fee == null ? 0 : Math.max(0, use.fee - base.fee);
    return { k: use.k, qty, baseK: base.k, diff: d * qty, up: use.k !== base.k && d > 0 };
  });
}
/** 追加でご希望いただける設備（有料・公開だけ）。資材ボックスは初期セットをESキッチンが手配するので申込では選ばせない（STEP1_20261001 C5・C7） */
export function addableOf(b: ApplyBranch) {
  const vm = (b.dev || 'rf') === 'vm';
  return MODELS.filter((m) => m.pub && m.grp !== 'bx' && (vm ? m.grp === 'mw' : m.grp !== 'vm')).map((m) => m.k);
}
export const eqQty = (b: ApplyBranch, k: string) => Number((b._eq || {})[k] || 0);

/** 契約の値をそろえる（元の eqInit：自販機はライト・ES配送便に固定、配送回数は標準より少なければ標準、追加設備の台数は 0 で埋める）。渡したものを書き換える */
export function eqInit(b: ApplyBranch) {
  if (!b._eq) b._eq = {};
  if (!b._so) b._so = {};
  if (!b._ng) b._ng = {};
  if (!b._files) b._files = [];
  if ((b.dev || 'rf') === 'vm') { b.course = 'ライト'; b.ship = 'ES配送便'; }
  b.dcount = String(dCount(b));
  addableOf(b).forEach((k) => { if (b._eq[k] == null) b._eq[k] = 0; });
  return b;
}

/* ---------------- 見積 ---------------- */
export function quoteOf(b0: ApplyBranch): Quote {
  const b = eqInit(structuredClone(b0));
  const dev = b.dev || 'rf', p = planOf(b);
  /* 2026/09/30 整合チェック A4：自動販売機は ESライト（自販機）の価格（28-184）。初期料金は初回のご請求で1回（28-186）。自販機を選べないプランは別途見積 */
  const vmOK = dev === 'vm' && !!p.vm;
  const q: Quote = {
    /* 価格は配送方法で選ぶ（COOL便＝価格（COOL便）、ES配送便＝価格（ES配送便）。台帳 E 2026-10-05） */
    plan: vmOK ? p.vm!.fee : b.ship === 'COOL便' ? p.feeCool || p.fee : p.fee, planName: vmOK ? p.name.replace('（ESライト）', '（ESライト（自販機））') : p.name,
    opt: 0, byQuote: dev === 'vm' && !p.vm, lines: [], incl: [], total: 0,
  };
  if (vmOK) {
    /* 自販機月額料金（OP000037）：プラン料金とは別の月額（機種マスタの月額 × 台数・台帳 2026/10/03） */
    const v = p.vm!, lease = v.lease * v.units;
    q.opt += lease;
    q.lines.push({ l: '自販機月額料金' + (v.units > 1 ? '（' + yen(v.lease) + ' × ' + v.units + '台）' : ''), v: lease });
    q.lines.push({ l: '自販機 初期料金（1回・' + yen(v.init) + '・初回のご請求。設置前に現場調査があります）', v: null, once: true });
  }
  /* プランに含まれる設備。標準のままなら 0円、上位サイズを選んだら差額だけ請求する */
  inclOf(b).forEach((r) => {
    const m = MODEL[r.k];
    if (!m || !r.qty) return;
    q.incl.push({ l: m.label + ' × ' + r.qty, v: r.diff, code: m.code, up: r.up, base: MODEL[r.baseK]?.label });
    if (r.diff) {
      q.opt += r.diff;
      q.lines.push({ l: m.label + '（サイズ差額 ／ 標準 ' + MODEL[r.baseK]?.label + '）', v: r.diff });
    }
  });
  /* 追加でご希望の設備（有料） */
  addableOf(b).forEach((k) => {
    const m = MODEL[k], n = eqQty(b, k);
    if (!n) return;
    if (m.fee === null) { q.byQuote = true; q.lines.push({ l: m.label + ' × ' + n + '（追加）', v: null }); return; }
    if (m.fee === 0) { q.lines.push({ l: m.label + ' × ' + n + '（追加）', v: 0 }); return; }
    q.opt += m.fee * n;
    q.lines.push({ l: m.label + ' × ' + n + '（追加）', v: m.fee * n });
  });
  /* 配送回数追加（プラン標準を超えた分・月額） */
  const dx = dExtra(b);
  if (dx) { q.opt += DLV_ADD.fee * dx; q.lines.push({ l: DLV_ADD.name + ' × ' + dx + '回（標準 ' + dStd(b) + '回 → ' + dCount(b) + '回）', v: DLV_ADD.fee * dx }); }
  SVC_OPT.forEach((o) => {
    if (o.dev.indexOf(dev) < 0 || !(b._so || {})[o.k]) return;
    /* 単発料金は月額に入れない（初回のご請求で別に案内） */
    if (o.once) { if (o.fee === null) q.byQuote = true; q.lines.push({ l: o.label + '（1回・' + (o.fee === null ? '別途見積' : yen(o.fee)) + '）', v: null }); return; }
    if (o.fee === null) { q.byQuote = true; q.lines.push({ l: o.label, v: null }); return; }
    q.opt += o.fee;
    q.lines.push({ l: o.label, v: o.fee });
  });
  q.total = q.plan + q.opt;
  return q;
}
/** 申込全体。お試し割引は1回だけ（STEP1B_20261001 Q2）：「法人に請求」の契約があれば法人の請求に1回（法人あて契約の月額合計が上限）、
 *  すべて「この拠点に請求」なら一覧の最初の拠点だけ（その拠点の月額が上限） */
export function quoteAll(A: Pick<ApplySubmit, 'kind' | 'branches'>): QuoteAll {
  const r: QuoteAll = { sum: 0, n: 0, nq: 0, discount: 0, discTo: '', corpSum: 0, corpN: 0, net: 0 };
  A.branches.forEach((b) => {
    const q = quoteOf(b);
    if (q.byQuote) r.nq++;
    else {
      r.sum += q.total; r.n++;
      if (b.bill !== 'この拠点に請求') { r.corpSum += q.total; r.corpN++; }
    }
  });
  if (A.kind === 'trial' && r.n > 0) {
    if (r.corpN > 0) { r.discTo = 'corp'; r.discount = Math.min(CAMPAIGN_DISCOUNT, r.corpSum); }
    else { const q0 = quoteOf(A.branches[0]); r.discTo = 'first'; r.discount = q0.byQuote ? 0 : Math.min(CAMPAIGN_DISCOUNT, q0.total); }
  }
  r.net = Math.max(0, r.sum - r.discount);
  return r;
}
/** お試し割引の適用先の呼び名 */
export const discWho = (A: Pick<ApplySubmit, 'branches'>) =>
  A.branches.some((b) => b.bill !== 'この拠点に請求') ? '法人の請求' : '一覧の最初の拠点の請求';

/* ---------------- 新しい申込 ---------------- */
/** 初期は1契約だけ。複数の拠点を申し込む方だけ「契約を追加」していただく */
/** お試しのプラン（50 個・ライト）。台帳 R・受付簿 #422 */
export const TRIAL_MEALS = '50';
export function newBranch(i: number, trial = false): ApplyBranch {
  return eqInit({ _o: i === 0, dev: 'rf', meals: trial ? TRIAL_MEALS : '100', course: 'ライト', bill: '法人に請求', _ng: {}, _so: {}, _eq: {}, _files: [] });
}
export function newApply(kind: ApplyKind = 'main'): ApplyState {
  return { kind, step: 1, sent: false, corp: {}, who: '', agree: false, branches: [newBranch(0, kind === 'trial')] };
}

/* ---------------- 入力欄 ---------------- */
export function corpFields(): FieldDef[] {
  return [
    { id: 'c_name', key: 'name', label: '法人名', req: true, type: 'text', ph: '例）株式会社サンプルフーズ' },
    { id: 'c_kana', key: 'kana', label: '法人名フリガナ', req: true, type: 'text', ph: '例）カブシキガイシャサンプルフーズ' },
    { id: 'c_billname', key: 'billname', label: '請求先法人名', req: true, type: 'text', ph: '例）株式会社サンプルフーズ', wide: true,
      hint: '<b>請求書の宛名になる法人名</b>です（法人名と同じ場合も、ご入力ください）。' },
    { id: 'c_zip', key: 'zip', label: '郵便番号', req: true, vt: 'zip', type: 'zip', scope: 'c_', ph: '例）100-0005',
      hint: '郵便番号を入れて<b>「住所検索」</b>を押すと、都道府県・市区町村・町域・番地が入ります。' },
    { id: 'c_pref', key: 'pref', label: '都道府県', req: true, type: 'sel', ph: '選択してください', opts: PREF },
    { id: 'c_city', key: 'city', label: '市区町村', req: true, type: 'text', ph: '例）千代田区' },
    { id: 'c_addr1', key: 'addr1', label: '町域・番地', req: true, type: 'text', ph: '例）丸の内1-9-2' },
    { id: 'c_addr2', key: 'addr2', label: '建物・部屋番号', req: false, type: 'text', ph: '例）グラントウキョウサウスタワー 12F', wide: true },
    { id: 'c_tel', key: 'tel', label: '電話番号', req: true, vt: 'tel', type: 'text', ph: '例）03-5555-0100' },
    { id: 'c_fax', key: 'fax', label: 'FAX番号', req: false, vt: 'tel', type: 'text' },
    { id: 'c_pay', key: 'pay', label: '支払い方法', req: true, type: 'sel', ph: '選択してください', opts: PAY_METHODS, wide: true,
      hint: '請求先が「法人に請求」の拠点に使います。拠点ごとに請求する場合は、その拠点の支払い方法を使います。' },
    /* 2026/09/29 hong：支払サイクルと請求書の発行時期も申込で聞く（法人はあとから直せない＝参照のみの項目のため）。既定は月払い（固定額は前もって請求） */
    { id: 'c_cycle', key: 'cycle', label: 'お支払いの周期（月払い・年払い）', req: true, type: 'sel', opts: PAY_CYCLE,
      hint: '<b>固定額は前もってご請求します。</b>月払いは毎月1ヶ月分、年払いは12ヶ月分をまとめてご請求します。' },
    { id: 'c_lead', key: 'lead', label: '請求書の発行時期', req: true, type: 'sel', opts: BILL_LEAD,
      hint: 'ご利用のご利用月に対して、<b>いつ請求書をお送りするか</b>です。例：1ヶ月前なら、2026年11月分のご利用の請求書を10月にお送りします。' },
  ];
}
/** 契約（希望プラン）の欄。設備タイプと契約区分で出す欄が変わる */
export function planFields(A: Pick<ApplySubmit, 'kind' | 'branches'>, i: number): FieldDef[] {
  const b = A.branches[i], p = 'b' + i + '_', isT = A.kind === 'trial', isVM = b.dev === 'vm';
  const f: FieldDef[] = [
    /* お試しはプラン50・ESライト（冷蔵庫）だけ（台帳 R・受付簿 #422・結合テスト B12） */
    isT
      ? { id: p + 'meals', key: 'meals', label: '月のお届け数（プラン）', type: 'ro', value: TRIAL_MEALS + ' 個（お試しは固定です）' }
      : { id: p + 'meals', key: 'meals', label: '月のお届け数（プラン）', req: true, type: 'sel', ph: '選択してください',
        opts: MEALS.map((m) => ({ v: m, t: m + ' 個' })), onch: true,
        hint: '<b>一度にお届けする食品の数</b>です。目安の利用人数は右のお見積に出ます。' },
    /* 自販機はコースと配送方法が固定（ライト／ES配送便） */
    isT
      ? { id: p + 'course', key: 'course', label: 'コース', type: 'ro', value: 'ライト（お試しは固定です）' }
      : isVM
      ? { id: p + 'course', key: 'course', label: 'コース', type: 'ro', value: 'ライト（自動販売機は固定です）' }
      : { id: p + 'course', key: 'course', label: 'コース', req: true, type: 'sel', ph: '選択してください', opts: COURSES, onch: true,
        hint: '<b>冷凍庫の無料貸し出しが付くかどうか</b>です。スタンダードは冷蔵庫1台＋冷凍庫1台、ライトは冷蔵庫1台です。' + (isT ? '　お試しの既定は<b>ライト</b>です。' : '') },
    isVM
      ? { id: p + 'ship', key: 'ship', label: '配送方法', type: 'ro', value: 'ES配送便（自動販売機は固定です）' }
      : { id: p + 'ship', key: 'ship', label: '配送方法', req: true, type: 'sel', ph: '選択してください', opts: [{ v: 'ES配送便', t: 'ES配送便' }, { v: 'COOL便', t: 'クール便（宅配便）' }],
        hint: '<b>ES配送便</b>は当社（ESキッチン）の便、<b>クール便</b>は宅配便でのお届けです。<b>ご利用いただけるエリアと料金は担当者にご確認ください。</b><span style="color:#C02339">事前に営業担当者へご相談ください。</span>' },
    isT
      ? { id: p + 'dcount', key: 'dcount', label: 'お届け回数', type: 'ro', value: dStd(b) + '回（プラン標準・お試しは変えられません）' }
      : { id: p + 'dcount', key: 'dcount', label: 'お届け回数（月）', req: true, type: 'sel', opts: dOpts(b), onch: true,
        hint: '<b>プラン標準は月' + dStd(b) + '回</b>です。増やした分は<b>お届け回数追加（1回あたり月額 ' + yen(DLV_ADD.fee) + '）</b>がかかり、右のお見積に入ります。'
          + 'お届けの曜日・週はESキッチンが決めてご連絡します（お届けできない曜日は下でお選びください）。' },
  ];
  if (!isT) f.push({ id: p + 'start', key: 'start', label: '契約開始希望年月', req: true, type: 'month', hint: '設備の手配に1週間ほどかかります。<b>拠点ごとに違う月をご希望いただけます。</b>' });
  /* 設置フロアはすべての拠点で聞く（自販機は必須・冷蔵庫は任意：台帳 2026/10/03） */
  f.push({ id: p + 'floor', key: 'floor', label: '設置フロア', req: isVM, type: 'text', ph: '例）2F 給湯室・リフレッシュスペース' });
  /* REQ-CT-300（2026/10/02）：基準数のパターンは申込で選ぶ（自販機は自販機の基準数なので出さない）。料金は変わらない */
  if (!isVM) f.push({ id: p + 'pattern', key: 'pattern', label: '消費期限の短い商品（サラダなど）の扱い', req: false, type: 'sel', opts: ['通常', '短消費期限なし'],
    hint: '<b>短消費期限なし</b>にすると、消費期限の短い商品（サラダなど）を自動注文に入れません。料金は変わりません。<b>ご契約後の変更はESキッチンへご依頼ください。</b>' });
  f.push({ id: p + 'note', key: 'note', label: 'プラン外の備考', req: false, type: 'ta', wide: true });
  return f;
}
/** 納品先情報の欄（STEP1_20261001 C8：支払い方法・支払サイクルは「この拠点に請求」のとき必須） */
export function destFields(A: Pick<ApplySubmit, 'branches'>, i: number): FieldDef[] {
  const p = 'b' + i + '_', bb = (A.branches[i] || {}).bill === 'この拠点に請求';
  return [
    { id: p + 'name', key: 'name', label: 'お届け先名', req: true, type: 'text', ph: '例）東京本社' },
    { id: p + 'kana', key: 'kana', label: '拠点名フリガナ', req: true, type: 'text', ph: '例）トウキョウホンシャ' },
    { id: p + 'zip', key: 'zip', label: '郵便番号', req: true, vt: 'zip', type: 'zip', scope: p, ph: '例）100-0005' },
    { id: p + 'pref', key: 'pref', label: '都道府県', req: true, type: 'sel', ph: '選択してください', opts: PREF },
    { id: p + 'city', key: 'city', label: '市区町村', req: true, type: 'text' },
    { id: p + 'addr1', key: 'addr1', label: '町域・番地', req: true, type: 'text' },
    { id: p + 'addr2', key: 'addr2', label: '建物・部屋番号', req: false, type: 'text', wide: true },
    { id: p + 'tel', key: 'tel', label: '電話番号', req: true, vt: 'tel', type: 'text' },
    { id: p + 'fax', key: 'fax', label: 'FAX番号', req: false, vt: 'tel', type: 'text' },
    { id: p + 'emp', key: 'emp', label: '従業員数概算', req: true, type: 'sel', ph: '選択してください', opts: EMP_RANGE },
    { id: p + 'bill', key: 'bill', label: '請求書', req: true, type: 'sel', ph: '選択してください', opts: ['この拠点に請求', '法人に請求'], onch: true,
      hint: 'この拠点ぶんの請求書を、どちらあてに出すかです。' },
    { id: p + 'pay', key: 'pay', label: '支払い方法', req: bb, type: 'sel', ph: bb ? '選択してください' : null,
      opts: bb ? PAY_METHODS : ['', ...PAY_METHODS],
      hint: '請求書が「この拠点に請求」のときに使います（<b>このとき必須</b>）。' },
    { id: p + 'cycle', key: 'cycle', label: 'お支払いの周期（月払い・年払い）', req: bb, type: 'sel', opts: PAY_CYCLE,
      hint: '請求書が「この拠点に請求」のときに使います（<b>このとき必須</b>）。固定額は前もってご請求します。請求書の発行時期は法人と同じです。' },
    { id: p + 'ngmove', key: 'ngmove', label: 'お届けできない日になった場合', req: true, type: 'sel', ph: '選択してください', opts: ['前倒す', '後倒す'] },
  ];
}

/* ---------------- 入力チェック ---------------- */
/** STEP1_20261001 C9：形式チェックはこの3つだけ（zip 7桁／tel 数字とハイフン／mail 形式）。空欄は必須チェックに任せる */
export const VT = {
  zip: { re: /^[0-9]{3}-?[0-9]{4}$/, msg: '郵便番号は数字7桁でご入力ください（ハイフンはあってもなくても構いません）。' },
  tel: { re: /^[0-9][0-9-]*$/, msg: '電話番号は数字とハイフンだけでご入力ください。' },
  mail: { re: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, msg: 'メールアドレスの形式が正しくありません。' },
};
export function vtBad(vt: keyof typeof VT, v: unknown) {
  const s = String(v == null ? '' : v).trim();
  return !!(s && VT[vt] && !VT[vt].re.test(s));
}
/** 2026/10/01 ：全角の数字・英字・記号は、保存（確認へ進む）のときに自動で半角に直す。
 *  対象は 郵便番号・電話番号・FAX番号・メールアドレス・数量。全角スペースは半角に、ー・－などのハイフンは「-」に */
export const Z2H_KEYS = /^(zip|tel|fax|mail|m|qty)$/;
export const z2h = (v: unknown) =>
  String(v == null ? '' : v)
    .replace(/[！-～]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[‐-―−ーｰ]/g, '-')
    .replace(/　/g, ' ')
    .trim();
const fixObj = (o: Record<string, unknown>, list: FieldDef[]) => {
  list.forEach((f) => {
    if (f.type === 'ro') return;
    if ((f.vt || Z2H_KEYS.test(f.key)) && o[f.key] != null) o[f.key] = z2h(o[f.key]);
    /* 「選択してください」のない選択欄は、未選択なら先頭の値（画面に出ている値）にする */
    if (f.type === 'sel' && !f.ph && (o[f.key] == null || o[f.key] === '') && f.opts?.length) {
      const o0 = f.opts[0];
      o[f.key] = typeof o0 === 'object' ? o0.v : o0;
    }
  });
};
const fixStaff = (st: Staff[] | undefined) => (st || []).forEach((r) => { if (r.mail != null) r.mail = z2h(r.mail); if (r.tel != null) r.tel = z2h(r.tel); });
/** 保存のときの全角→半角（step を渡すとそのステップの欄だけ）。渡したものを書き換える */
export function normalizeApply(A: ApplySubmit, step?: 1 | 2) {
  if (!step || step === 1) A.branches.forEach((b, i) => { eqInit(b); fixObj(b as Record<string, unknown>, [...planFields(A, i), ...destFields(A, i)]); if (!b._same) fixStaff(b._st); });
  if (!step || step === 2) { fixObj(A.corp as Record<string, unknown>, corpFields()); fixStaff(A.corp._st); }
  return A;
}

/** 欄ごとの入力チェック：欄 ID → 文言 */
export function fieldErrors(list: FieldDef[], store: Record<string, unknown>) {
  const out: Record<string, string> = {};
  list.forEach((f) => {
    if (f.type === 'ro') return;
    const v = String(store[f.key] ?? '');
    if (f.req && !v.trim()) out[f.id] = f.err || f.label + 'をご入力ください。';
    else if (f.vt && vtBad(f.vt, v)) out[f.id] = VT[f.vt].msg;
  });
  return out;
}
/** 担当者テーブルがなければ区分だけの行を作る（元の staffRows） */
export function staffRows(obj: { _st?: Staff[] }, def: string[]) {
  if (!obj._st || !obj._st.length) obj._st = def.map((k) => ({ kind: k }));
  return obj._st;
}
/** 担当者テーブルの入力チェック：メイン担当者ちょうど1名（needBill なら請求担当者も1名） */
export function staffErrors(rows: Staff[], needBill: boolean) {
  const msg: string[] = [], bad: number[] = [];
  let nMain = 0, nBill = 0, blank = false, badMail = false, badTel = false;
  rows.forEach((r, i) => {
    const ng = !String(r.name || '').trim() || !String(r.kana || '').trim() || !String(r.mail || '').trim();
    if (ng) { blank = true; bad.push(i); }
    if (vtBad('mail', r.mail)) { badMail = true; if (!bad.includes(i)) bad.push(i); }
    if (vtBad('tel', r.tel)) { badTel = true; if (!bad.includes(i)) bad.push(i); }
    if (r.kind === 'メイン担当者') nMain++;
    if (r.kind === '請求担当者') nBill++;
  });
  if (blank) msg.push('担当者名・フリガナ・メールアドレスはご入力ください。');
  if (badMail) msg.push(VT.mail.msg);
  if (badTel) msg.push(VT.tel.msg);
  if (nMain !== 1) msg.push('メイン担当者はちょうど1名にしてください。');
  if (needBill && nBill !== 1) msg.push('請求担当者はちょうど1名にしてください。');
  return { msg, rows: bad };
}
const emptyErr = (): FormErrors => ({ fields: {}, staff: {} });
/** ステップ1（希望内容と納品先）の入力チェック */
export function step1Errors(A: Pick<ApplySubmit, 'kind' | 'branches'>): FormErrors {
  const e = emptyErr();
  A.branches.forEach((b, i) => {
    Object.assign(e.fields, fieldErrors(planFields(A, i), b as Record<string, unknown>), fieldErrors(destFields(A, i), b as Record<string, unknown>));
    if (!b._same) {
      const s = staffErrors(staffRows({ _st: structuredClone(b._st) }, ['メイン担当者']), b.bill === 'この拠点に請求');
      if (s.msg.length) e.staff['b' + i] = { msg: s.msg.join('　'), rows: s.rows };
    }
  });
  return e;
}
/** ステップ2（法人情報）の入力チェック */
export function step2Errors(A: Pick<ApplySubmit, 'corp'>): FormErrors {
  const e = emptyErr();
  e.fields = fieldErrors(corpFields(), A.corp as Record<string, unknown>);
  const s = staffErrors(staffRows({ _st: structuredClone(A.corp._st) }, ['メイン担当者', '請求担当者']), true);
  if (s.msg.length) e.staff.c = { msg: s.msg.join('　'), rows: s.rows };
  return e;
}
export const errCount = (e: FormErrors) => Object.keys(e.fields).length + Object.keys(e.staff).length;
/** 最初にだめな契約の番号（-1＝なし） */
export function firstBadBranch(A: Pick<ApplySubmit, 'branches'>, e: FormErrors) {
  for (let i = 0; i < A.branches.length; i++) {
    const p = 'b' + i + '_';
    if (Object.keys(e.fields).some((k) => k.startsWith(p)) || e.staff['b' + i]) return i;
  }
  return -1;
}

/* ---------------- ご担当者・お申し込み者 ---------------- */
export function mainStaff(obj: { _st?: Staff[] }): Staff {
  const r = (obj._st || []).filter((x) => x.kind === 'メイン担当者')[0];
  return r || (obj._st || [])[0] || ({} as Staff);
}
export type Applicant = { name?: string; mail?: string; tel?: string; kind: string; where: string };
/** STEP1_20261001 C2：新規のお申し込みは、入力したご担当者（法人＋拠点）から選ぶ */
export function applicantCands(A: Pick<ApplySubmit, 'corp' | 'branches'>): Applicant[] {
  const out: Applicant[] = [], seen: Record<string, 1> = {};
  const push = (st: Staff[] | undefined, where: string) => (st || []).forEach((x) => {
    const k = x.mail || x.name;
    if (!k || seen[k]) return;
    seen[k] = 1;
    out.push({ name: x.name, mail: x.mail, tel: x.tel, kind: x.kind, where });
  });
  push(A.corp._st, '法人');
  A.branches.forEach((b) => { if (!b._same) push(b._st, b.name || 'お届け先'); });
  return out;
}
export const whoOf = (mail: string, A: Pick<ApplySubmit, 'corp' | 'branches'>) => applicantCands(A).filter((x) => x.mail === mail)[0] || null;

/** 登録できない理由（なければ ''）。action で入力チェックをやり直す */
export function submitError(A: ApplySubmit): string {
  if (!A || !Array.isArray(A.branches) || !A.branches.length || !A.corp) return 'お申し込みの内容がありません。';
  if (A.kind !== 'main' && A.kind !== 'trial') return '契約区分が正しくありません。';
  const n = errCount(step1Errors(A)) + errCount(step2Errors(A));
  if (n) return n + '件の入力が足りません';
  if (A.kind === 'trial' && A.branches.some((b) => String(b.meals) !== TRIAL_MEALS || b.course !== 'ライト' || b.dev === 'vm')) return 'お試しキャンペーンは、プラン50・ESライト（冷蔵庫）だけお申し込みいただけます。';
  if (!A.who || !whoOf(A.who, A)) return 'お申し込み者を選んでください。';
  if (!A.agree) return '同意にチェックを入れてください。';
  return '';
}

/* ---------------- 確認画面の文言 ---------------- */
export function ngText(b: ApplyBranch) {
  const d = Object.keys(b._ng || {}).filter((k) => b._ng[k]);
  return d.length ? d.join('・') : 'なし';
}
export function svcText(b: ApplyBranch) {
  const dev = b.dev || 'rf';
  const on = SVC_OPT.filter((o) => o.dev.indexOf(dev) >= 0 && (b._so || {})[o.k]).map((o) => o.label);
  return on.length ? on.join('／') : 'なし';
}
/** 最低利用期間＝いちばん長い設備の代表値（違約金は設備ごとに判定して合算する） */
export function termOf(b: ApplyBranch) {
  let mx = 0;
  inclOf(b).forEach((r) => { const m = MODEL[r.k]; if (m && m.term) mx = Math.max(mx, m.term); });
  addableOf(b).forEach((k) => { const m = MODEL[k]; if (m && m.term && eqQty(b, k)) mx = Math.max(mx, m.term); });
  return mx;
}
export function inclText(b: ApplyBranch) {
  return inclOf(b).map((r) => {
    const m = MODEL[r.k];
    if (!m) return '';
    return m.label + ' × ' + r.qty + (r.diff ? '（サイズ差額 +' + yen(r.diff) + '／月）' : '');
  }).filter(Boolean).join('／') || 'なし';
}
export function eqText(b: ApplyBranch) {
  return addableOf(b).filter((k) => eqQty(b, k)).map((k) => MODEL[k].label + ' × ' + eqQty(b, k)).join('／') || 'なし';
}
/** 郵便番号は 123-4567 の形にそろえる（ハイフンなしの入力も。結合テスト B6） */
const zipText = (z: string | undefined) => String(z ?? '').trim().replace(/^(\d{3})-?(\d{4})$/, '$1-$2');
/** 郵便番号を除いた住所（都道府県から建物名。受付の parseAddr が読む形） */
const addrBody = (o: ApplyCorp | ApplyBranch) => `${o.pref ?? ''}${o.city ?? ''}${o.addr1 ?? ''}${o.addr2 ? ' ' + o.addr2 : ''}`.trim();
export const addrText =(o: ApplyCorp | ApplyBranch) => [o.zip ? '〒' + o.zip : '', o.pref, o.city, o.addr1, o.addr2].filter(Boolean).join(' ');

/* ---------------- 運営Web の契約申請管理（applications.intake）に出す行 ---------------- */
const EQ_NAME: [string, string][] = [['rf', '冷蔵庫'], ['fz', '冷凍庫'], ['vm', '自販機'], ['mw', '電子レンジ']];
/** 契約で使う設備の区分（プランに含まれる分＋追加分。資材ボックスは数えない） */
function eqKinds(b: ApplyBranch) {
  const g = new Set<string>();
  inclOf(b).forEach((r) => { const m = MODEL[r.k]; if (m && r.qty) g.add(m.grp); });
  addableOf(b).forEach((k) => { if (eqQty(b, k)) g.add(MODEL[k].grp); });
  return EQ_NAME.filter(([k]) => g.has(k)).map(([, t]) => t);
}
const courseText = (b: ApplyBranch) => (b.dev === 'vm' ? 'ESライト（自販機）' : 'ES' + (b.course || 'ライト'));
const shipText = (b: ApplyBranch) => (b.dev === 'vm' ? 'ES配送便' : b.ship || '');
const cntText = (b: ApplyBranch) => '月' + dCount(b) + '回' + (dExtra(b) ? '（お届け回数追加）' : '');
const uniq = (xs: string[]) => xs.filter((x, i) => x && xs.indexOf(x) === i);

/** 新規契約タブの1行（受付中・一覧の先頭）。複数の契約は applications.json の書き方（複数（N拠点）・拠点ごと）に合わせる */
export function intakeRow(A: ApplySubmit, no: string, date: string): IntakeRow {
  const bs = A.branches.map((b) => eqInit(structuredClone(b))), b0 = bs[0], many = bs.length > 1;
  const eqAll = bs.flatMap(eqKinds), eq = EQ_NAME.map(([, t]) => t).filter((t) => eqAll.includes(t));
  const courses = uniq(bs.map(courseText));
  return {
    id: no, no,
    kubun: A.kind === 'trial' ? 'お試し' : '本導入',
    company: String(A.corp.name || '').trim(),
    branch: bs.map((b) => String(b.name || '').trim()).join('・'),
    plan: many ? `複数（${bs.length}拠点）` : `${planOf(b0).id} ${b0.meals}プラン`,
    course: many ? (courses.length === 1 ? courses[0] : '複数') : courseText(b0),
    eq: eq.length ? eq.join('・') : 'なし',
    ship: uniq(bs.map(shipText)).join('・'),
    cnt: many ? '拠点ごと' : cntText(b0),
    acct: '未発行',
    es: '',
    st: '受付中',
    date,
    go: A.kind === 'trial' ? 1 : 0,
    fresh: true,
  };
}

/* ---------------- 共通データの新規申込（dm.apply.applications）に入れる中身 ---------------- */

/** 開始のサイクル月：拠点のご希望の月のいちばん早い月（お試しなど月がないときは来月） */
export function startCycleOf(A: Pick<ApplySubmit, 'branches'>, today: string) {
  const ms = A.branches.map((b) => b.start || '').filter((m) => /^\d{4}-\d{2}$/.test(m)).sort();
  if (ms.length) return ms[0];
  const [y, m] = today.split('/').map(Number), d = new Date(y, m, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
/** 基準数のパターンの表示（自販機は自販機の基準数・REQ-CT-300） */
export const patternOf = (b: Pick<ApplyBranch, 'dev' | 'pattern'>) => (b.dev === 'vm' ? '自販機' : b.pattern === '短消費期限なし' ? '短消費期限なし' : '通常');
/** 申請の中身（[項目, 値]）。運営の受付で見る要点 */
export function requestRows(A: ApplySubmit): [string, string][] {
  const r = intakeRow(A, '', ''), q = quoteAll(A), w = whoOf(A.who, A);
  return [
    ['区分', r.kubun], ['法人名', r.company], ['法人の住所', addrText(A.corp)],
    ...A.branches.map((b, i): [string, string] => [`拠点${i + 1}`, `${String(b.name || '').trim()}（${addrText(b)}）`]),
    ['プラン', r.plan], ['コース', r.course], ['設備', r.eq], ['配送', r.ship], ['配送回数', r.cnt],
    /* 基準数のパターン（REQ-CT-300。仮登録で拠点の注文の設定に入れる・lib/domain/lifecycle.ts） */
    ...A.branches.map((b, i): [string, string] => [`基準数のパターン（拠点${i + 1}）`, patternOf(b)]),
    /* 設置フロア（仮登録で拠点の「設置フロア」に入れる・lib/domain/lifecycle.ts） */
    ...A.branches.map((b, i): [string, string] => [`設置フロア（拠点${i + 1}）`, String(b.floor ?? '').trim()]),
    /* 法人Web の申込の入力も、代理入力・CSV と同じ項目で受付に渡す（運営に入れ直させない：台帳 R・受付簿 #421。lib/domain/lifecycle.ts defaultSetup が読む） */
    ...([['法人名フリガナ', A.corp.kana], ['請求先法人名', A.corp.billname], ['法人郵便番号', zipText(A.corp.zip)], ['法人住所', addrBody(A.corp)], ['法人電話', A.corp.tel]] as [string, string | undefined][])
      .map(([k, v]): [string, string] => [k, String(v ?? '').trim()]).filter((x) => x[1]),
    ['申込者', w?.name ?? ''], ['申込者メール', w?.mail ?? A.who], ['申込者電話', w?.tel ?? ''],
    ...A.branches.flatMap((b, i): [string, string][] => {
      const st = b._same ? mainStaff(A.corp) : mainStaff(b);
      return ([
        [`プラン（拠点${i + 1}）`, `${planOf(b).id}（${courseText(b)}）`], [`郵便番号（拠点${i + 1}）`, zipText(b.zip)], [`住所（拠点${i + 1}）`, addrBody(b)],
        [`電話番号（拠点${i + 1}）`, String(b.tel ?? '')],
        [`拠点のご担当者（拠点${i + 1}）`, [st.name, st.mail].filter(Boolean).join(' ')], [`配送備考（拠点${i + 1}）`, String(b.note ?? '')],
      ] as [string, string][]).map(([k, v]): [string, string] => [k, v.trim()]).filter((x) => x[1]);
    }),
    ['お申し込み者', w ? `${w.name ?? ''}（${w.mail ?? ''}）` : A.who],
    ['見積（月額）', yen(q.net) + (q.nq ? `＋お見積り ${q.nq}件` : '')],
  ];
}
