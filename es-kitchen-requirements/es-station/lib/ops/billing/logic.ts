/*
 * 請求の計算と書き換え（15_運営_請求.html の「計算」「操作」を移したもの）。
 *   const L = billingLogic(state);  L.brTot(b) など
 * 画面（表示の計算）と actions（書き換え）の両方で使う。書き換えの関数は state の中身を直接変え、トーストの文言を返す。
 * できないときは ApiError を投げる（画面ではトーストに出る）。
 *
 * 金額の決まり（元のデモと同じ）
 * - 前払い（固定額）：契約の費目。対象月＝発行月（締め月の翌月）＋請求リードタイム。プラン料金はプランマスタの料金改定から引く。
 *   1年一括（Y）は起算月の請求書に12ヶ月分。値引きは値引きマスタから（スタンダードアップ差額・お試し・固定額）
 * - 後払い（実績精算）：管理ロスの免責超過 ＋ 現金回収差額（＋ 棚卸が未完了なら事務手数料）。価格調整差額は翌月の前請求へ
 * - 税：明細は税抜。税率ごとに合計して四捨五入（負の額は絶対値で四捨五入して符号を戻す）。繰越（再請求）は税込のまま課税しない
 * - 再請求：未入金と記録した前月以前の請求書の全額を、当月の請求書に税率なしの1行で加える（元は CARRIED）
 */
import { ApiError } from '@/lib/api/errors';
import { DEMO } from '@/lib/demo';
import { nowStamp } from '@/lib/supplier/dates';
import {
  BO_FAIL_ONCE, COURSE, DUES, INVFIX, PROD, SHIP, TRIAL_PLAN, disc, model, plan, prodName,
  type Discount, type PriceRow,
} from './masters';
import type { AdjLine, BillingState, Br, Co, FixLine, InvLine, Invoice, MonthSnap, StockRow, Tax, TaxSum } from './types';
import { fmtDate, fmtYm } from '@/lib/format/date';
import { ALERT_RATE } from '@/lib/domain/stock';
import { TRIAL_DISCOUNT } from '@/lib/domain/charges';

/* ---------- 表示の道具 ---------- */
/** 金額（例 12,345円／−500円）。全サイト共通の lib/format/money */
export { yen } from '@/lib/format/money';
import { exTax, yen, yenSigned } from '@/lib/format/money';
/** 後払いの明細の行。incl＝販売価格（税込）から出した行のもとの税込の額（a はそれを税抜にした額） */
export type ArrLine = { n: string; a: number; t: Tax; src: string; incl?: number };
/** 事務手数料（棚卸の未報告）の行の名前 */
export const PENALTY_LINE = '事務手数料（棚卸の未報告）';
/** ＋／−つきの金額 */
export const sign = (n: number) => yenSigned(n);
/** 'YYYY-MM' に n ヶ月足す */
export function addM(ym: string, n: number) {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
/** 年月の表示 '2026-10'（共通の表示ルール・決定 8-1） */
export const jm = (ym: string) => fmtYm(ym);
/** 月初・月末の表示 'YYYY-MM-01'・'YYYY-MM-DD'（表示用の文字。比べるのには使わない） */
const mS = (ym: string) => `${ym.split('-')[0]}-${ym.split('-')[1]}-01`;
const mE = (ym: string) => {
  const [y, m] = ym.split('-').map(Number);
  return `${y}-${String(m).padStart(2, '0')}-${new Date(y, m, 0).getDate()}`;
};
/** 対象期間（前月21日〜当月20日） */
export const actPeriod = (m: string) => `${addM(m, -1).replace('-', '/')}/21〜${m.replace('-', '/')}/20`;
/** 文字列の部分一致（空なら一致） */
/** 検索語と比べる文字：前後の空白を取り、全角の英数字は半角に直し、大文字小文字は区別しない（入力の共通基準・台帳 M-1） */
const fold = (v: unknown) => String(v ?? '').normalize('NFKC').trim().toLowerCase();
export const hit = (q: string | undefined, ...xs: unknown[]) => !fold(q) || xs.some((x) => fold(x).includes(fold(q)));

/* ---------- 税（請求書ごと・税率ごとに四捨五入） ---------- */
/** 税額＝|税抜合計| × 税率% を四捨五入（整数で計算して浮動小数の誤差を避ける）。負の額は符号を戻す */
export function taxRound(amt: number, pct: number) {
  const n = Math.abs(amt) * pct, q = Math.floor(n / 100), v = q + ((n - q * 100) >= 50 ? 1 : 0);
  return amt < 0 ? -v : v;
}
/** 税率ごとに小計・税（四捨五入）。税率マスタのどの率でも（2026-10-05）。t＝0 の行（繰越）は税なし */
export function taxSplit(lines: { a: number; t: Tax | number }[]): TaxSum {
  const sub = new Map<number, number>();
  let t0 = 0;
  for (const l of lines) { if (!l.t) t0 += l.a; else sub.set(l.t, (sub.get(l.t) ?? 0) + l.a); }
  const by = [...sub.entries()].filter(([, v]) => v !== 0).sort((a, b) => b[0] - a[0]).map(([r, t]) => ({ r, t, x: taxRound(t, r) }));
  const of = (r: number) => by.find((x) => x.r === r);
  const net = by.reduce((s, x) => s + x.t, 0), tax = by.reduce((s, x) => s + x.x, 0);
  return { t10: of(10)?.t ?? 0, t8: of(8)?.t ?? 0, t0, x10: of(10)?.x ?? 0, x8: of(8)?.x ?? 0, net, tax, tot: net + tax + t0, by };
}

/* ---------- 入力チェック（画面と actions の両方で使う） ---------- */
/** 在庫調整：数量と理由の両方が要る（どちらか片方だけの行がエラー） */
export function checkStockRows(rows: { prod: number; q: number; r: string }[]) {
  const used = rows.filter((x) => x.q || x.r.trim());
  const bad = used.filter((x) => !x.q || !x.r.trim());
  if (bad.length) return { ok: false as const, bad: bad.map((x) => x.prod), msg: `数量と理由の両方を入力してください（${bad.length}件）` };
  return { ok: true as const, rows: used };
}
/** まとめて在庫調整：数量が1つ以上・理由は必須 */
export function checkStockBulk(cells: { q: number }[], reason: string) {
  if (!cells.some((c) => c.q)) return '調整する数量が入力されていません';
  if (!reason.trim()) return '理由を入力してください（監査ログに残ります）';
  return '';
}
/** 調整明細の追加（③ 調整） */
/** 選べる月（新しい順）のうち、開始月〜終了月（両端を含む）の月 */
export const monthsBetween = (choices: string[], from: string, to: string) => choices.filter((m) => m >= from && m <= to);

export function checkAdjLine(month: string, x: { a: number; kind: string; m: string; rep: string; to: string }) {
  if (!x.a) return '金額を入力してください';
  const m = x.kind === 'init' ? month : x.m;
  if (m < month) return '過去月は選べません（運営が選べるのは将来分だけ）';
  if (x.rep === 'every' && x.to && x.to < m) return '終了月は開始月より後にしてください';
  return '';
}

/* ---------- 計算 ---------- */
const CO_NONE: Co = { id: '', name: '（法人なし）', code: '—', issue: 'branch', lead: 1, confirmed: false, due: DUES[0] };

/** 過去の月の在庫。共通データの棚卸があればそれ、なければ（デモ用に）今月の値から作る。点検申告は済み・在庫調整はなし */
function pastRows(b: Br, m: string): StockRow[] {
  if (b.hist?.[m]) return b.hist[m];
  const mo = +m.split('-')[1], f = m === '2026-09' ? 0.97 : 0.94;
  return b.rows.map((r) => {
    const prev = Math.max(2, r.prev + ((r.id * 3 + mo) % 5) - 2), deliv = Math.round(r.deliv * f);
    const waste = (r.id + mo) % 3, sold = Math.max(0, deliv - 2 - (r.id % 3)), c = prev + deliv - sold - waste;
    return { id: r.id, prev, deliv, sold, waste, appr: 0, real: Math.max(0, c - ((r.id + mo) % 3)) };
  });
}
/** 過去の月の拠点（確定済みの記録として見せる） */
export type PastBr = Br & { _past?: boolean };

export type FixRow = FixLine & {
  amt: number; hit: boolean; state: 'paused' | 'hit' | 'cov' | 'out' | 'plan' | 'free';
  lbl: string; period: string; note: string; covered: string; next: string; dc?: Discount; auto?: boolean; pr?: PriceRow | null;
};
export type CalcRow = StockRow & { n: string; list: number; price: number; sell: number; unit: number; calcStock: number; realV: number | null; mgQty: number; mgYen: number; salesYen: number; empU: number; corpYen: number; down: number; up: number };
export type GroupView = ReturnType<ReturnType<typeof billingLogic>['gView']>;

export function billingLogic(S: BillingState, log: (who: string, what: string) => void = () => {}) {
  const month = S.month;
  const nextM = () => addM(month, 1);
  const co = (id: string) => S.cos.find((c) => c.id === id) ?? CO_NONE;
  const br = (id: string) => S.brs.find((b) => b.id === id);
  const mustBr = (id: string) => { const b = br(id); if (!b) throw new ApiError('拠点が見つかりません', 404); return b; };
  const brsOf = (cid: string) => S.brs.filter((b) => b.co === cid);
  const planOf = (b: Br) => plan(b.planId);
  /* 拠点ごとの請求書：請求先＝この拠点・法人なし・解約した拠点の最終請求書（拠点だけの1通・2026/10/03 決定） */
  const ownBill = (b: Br) => b.billTo === 'この拠点' || b.co === '' || !!b.final;
  const subNo = (b: Br, m: string) => `${b.ct.no}-${m.replace('-', '')}`;
  /* 請求リードタイム（法人）：前払い分は「請求月 ＋ lead ヶ月」を対象月とする */
  const leadOf = (b: Br) => (b.leadOv !== null && b.leadOv !== undefined) ? b.leadOv : co(b.co).lead;
  /** この請求書に載る前払いのサイクル月＝発行月（締め月の翌月）＋リードタイム（2026/09/25 決定） */
  const tgtM = (b: Br) => addM(month, 1 + leadOf(b));
  /* 免責金額・企業負担額＝共通データのプランマスタ（Br.ded・Br.welfare。2026/10/03 回答：プランマスタの設定を効かせる）。ないときだけ請求の見本の値 */
  const dedOf = (b: Br) => b.ded ?? planOf(b).ded;
  const empOf = (b: Br) => b.welfare ?? planOf(b).emp;

  /* 対象月がどの料金改定に入るか */
  function priceRow(course: 'std' | 'light' | 'vm', planId: string, ym: string) {
    const c = plan(planId)[course]; if (!c) return null;
    return c.prices.find((r) => r.from <= ym && (!r.to || ym <= r.to)) ?? c.prices[c.prices.length - 1];
  }
  function planFee(b: Br, ym: string) {
    const r = priceRow(b.course, b.planId, ym);
    return r ? { amt: r[b.ship], row: r } : { amt: 0, row: null };
  }
  /* 値引き額 ＝ スタンダード − ライト（案2） */
  function gapAmt(b: Br, ym: string) {
    const sd = priceRow('std', b.planId, ym), lt = priceRow('light', b.planId, ym);
    return (sd && lt) ? sd[b.ship] - lt[b.ship] : 0;
  }
  /* お試しキャンペーン割引：その月の固定額（値引き前）の合計＝値引きの上限 */
  function trialBase(b: Br, tgt: string) {
    const pr = priceRow(b.course, b.planId, tgt), u = pr ? pr[b.ship] : 0;
    return b.fixLines.filter((l) => l.tim === 'M').reduce((x, l) => x + (l.src === 'plan' ? u : l.a), 0);
  }
  const trialPrice = (tgt: string) => { const r = priceRow('light', TRIAL_PLAN, tgt); return r ? r.es : 0; };
  /* 1法人1回まで：先に DC000013 が付いた拠点（一覧の先頭）にだけ適用する */
  const trialFirst = (b: Br) => { const t = S.brs.filter((x) => x.co === b.co && (x.discIds || []).includes(TRIAL_DISCOUNT)); return t.length ? t[0].id : b.id; };
  const trialDup = (b: Br) => !!b.co && trialFirst(b) !== b.id;
  const discAmt = (b: Br, d: Discount, tgt: string) => d.calc === 'all' ? (trialDup(b) ? 0 : Math.min(trialPrice(tgt), trialBase(b, tgt))) : (d.auto ? gapAmt(b, tgt) : d.amt);

  /* 値引きマスタ由来の行（費目に直接マイナスを書かない） */
  function discRows(b: Br, tgt: string): FixRow[] {
    return (b.discIds || []).map((id) => {
      const d = disc(id);
      const okCourse = d.course !== 'スタンダードのみ' || b.course === 'std';
      const inTerm = d.from <= tgt && (!d.to || tgt <= d.to) && okCourse;
      const amt = discAmt(b, d, tgt);
      const sd = priceRow('std', b.planId, tgt), lt = priceRow('light', b.planId, tgt);
      return {
        id: 'DISC-' + d.id, n: d.name, a: -amt, t: 10, tim: 'M', dc: d, hit: inTerm, auto: !!d.auto,
        state: inTerm ? 'hit' : 'out', amt: inTerm ? -amt : 0,
        lbl: `${jm(tgt)}分`, period: `${d.from} 〜 ${d.to || ''}`,
        note: d.trial
          ? (trialDup(b)
            ? (ownBill(b) ? '1法人1回まで（拠点ごとに請求するため、最初の拠点（一覧の先頭）だけに適用。この拠点では値引きなし）' : '1法人1回まで（請求先が法人のため、法人の請求書に1回だけ適用。同じ請求書の別の拠点で適用済みのため、この拠点では値引きなし）')
            : `プラン50（${TRIAL_PLAN}）・ライトのプラン料金 ${yen(trialPrice(tgt))}／上限：その月の固定額 ${yen(trialBase(b, tgt))}（請求額を超えて値引きしない）`)
          : d.auto
            ? `自動算出：スタンダード ${yen(sd ? sd[b.ship] : 0)} − ライト ${yen(lt ? lt[b.ship] : 0)}`
            : `値引きマスタ ${d.code}／請求書表示名「${d.name}」`,
        covered: '—', next: addM(month, 2),
      };
    });
  }
  /** 前払いの費目（当月の請求に載る分）。M＝毎月前払い、Y＝1年一括前払い（起算月の請求書に12ヶ月分） */
  function fixRows(b: Br): FixRow[] {
    const lead = leadOf(b), tgt = tgtM(b);
    if (b.ct.st === 'paused')   // 利用休止中は固定額を止める（2026/09/11 確定）
      return b.fixLines.map((l) => ({ ...l, amt: 0, tim: l.tim || 'M', hit: false, state: 'paused', lbl: `${jm(tgt)}分`, period: `${mS(tgt)}〜${mE(tgt)}`, note: '利用休止中のため固定額を停止', covered: '—', next: '—' }));
    return b.fixLines.map((l): FixRow => {
      if (l.tim === 'Y') {
        const anchor = l.anchor ?? tgt;
        const hitY = anchor === tgt, covTo = addM(anchor, 11), inCov = anchor <= tgt && tgt <= covTo, billedOn = addM(anchor, -lead);
        return {
          ...l, amt: hitY ? l.a * 12 : 0, tim: 'Y', hit: hitY,
          lbl: `${jm(anchor)}〜${jm(covTo)}分`, period: `${mS(anchor)}〜${mE(covTo)}（12ヶ月分）`,
          note: hitY ? `${yen(l.a)} × 12ヶ月` : (inCov ? `${fmtYm(billedOn)} の請求書で請求済` : '対象期間外'),
          state: hitY ? 'hit' : (inCov ? 'cov' : 'out'), covered: `〜${mE(covTo)}`, next: addM(covTo, 1 - lead),
        };
      }
      if (l.src === 'plan') {   // プランマスタの価格プランから引く
        const pf = planFee(b, tgt), p = planOf(b);
        return {
          ...l, a: pf.amt, amt: pf.amt, tim: 'M', hit: true, state: 'plan', pr: pf.row,
          lbl: `${jm(tgt)}分`, period: `${mS(tgt)}〜${mE(tgt)}`,
          note: `${p.id} ${p.pub}／${COURSE[b.course]}／${SHIP[b.ship]}` + (pf.row ? `／${pf.row.n}（${fmtDate(pf.row.from)}〜${fmtDate(pf.row.to || '')}）` : '／該当する価格プランなし'),
          covered: `〜${mE(tgt)}`, next: addM(month, 2),
        };
      }
      const md = model(l.modelId);
      const free = !!md && md.freeAt > 0 && b.qty >= md.freeAt;   // 機種マスタの無料判定
      return {
        ...l, amt: free ? 0 : l.a, tim: 'M', hit: true, state: free ? 'free' : 'hit',
        lbl: `${jm(tgt)}分`, period: `${mS(tgt)}〜${mE(tgt)}`,
        note: free && md ? `月次提供数 ${b.qty} ≧ ${md.freeAt} のため無料` : '毎月',
        covered: `〜${mE(tgt)}`, next: addM(month, 2),
      };
    }).concat(discRows(b, tgt));
  }
  /* 年払いの行は12サイクル目（yTo）を持つ（共通データの請求書の cycleTo＝その年の子契約を請求済にする） */
  const advLines = (b: Br) => fixRows(b).filter((r) => r.amt !== 0).map((r) => ({ n: `${r.n}（${r.lbl}）`, a: r.amt, t: r.t, ...(r.tim === 'Y' ? { yTo: addM(r.anchor ?? tgtM(b), 11) } : {}), ...(r.mg ? { mg: r.mg } : {}) }));
  const advTot = (b: Br) => advLines(b).reduce((s, l) => s + l.a, 0);

  const cashOf = (b: PastBr) => (b.cash && !b._past) ? (b.cashRows || []) : [];
  const priceDelta = (b: Br) => b.adjMode === 'up' ? b.adjYen : b.adjMode === 'down' ? -b.adjYen : 0;
  /** 実績精算の計算（管理ロス・免責超過・価格調整差額・現金回収差額） */
  function calc(b: PastBr) {
    const free = b.adjMode === 'free', d = free ? 0 : priceDelta(b);
    const emp = empOf(b);
    const rows: CalcRow[] = b.rows.map((r) => {
      const m0 = S.prods.find((p) => p.id === r.id) ?? PROD.find((p) => p.id === r.id) ?? { id: r.id, n: '', list: 0 };
      /* 確定したときの単価の写しがあればそれ（マスタ・メニューが変わっても確定した金額は変わらない） */
      const m = b.prices?.[r.id] !== undefined ? { ...m0, list: b.prices[r.id] } : m0;
      const price = Math.max(0, m.list + d);            // 商品単価（定価 ± 価格調整）
      const sell = free ? 0 : price;                    // 利用者がアプリで支払う販売価格
      const unit = m.list;                              // ロス換算は価格調整の前の標準価格（在庫.md §6-1・REQ-PO-415）
      const calcStock = r.prev + r.deliv - r.sold - r.waste + r.appr;   // 計算在庫
      const realV = b.filed && !b.noCheck ? r.real : null;   // 点検申告値（棚卸なしの拠点・最初の棚卸報告の前の拠点は管理ロスを出さない：未申告なら null）
      const mgQty = realV === null ? 0 : calcStock - realV;             // 管理ロス数量
      return {
        ...r, n: m.n, list: m.list, price, sell, unit, calcStock, realV, mgQty,
        mgYen: mgQty * unit, salesYen: r.sold * sell, empU: emp, corpYen: emp * r.sold,
        down: free ? m.list * r.sold : (d < 0 ? -d * r.sold : 0),   // 値下げ・無料 ＝ 企業が負担する分
        up: d > 0 ? d * r.sold : 0,                                  // 値上げ ＝ 企業へ返す分
      };
    });
    const T = rows.reduce((a, r) => ({
      deliv: a.deliv + r.deliv, sold: a.sold + r.sold, waste: a.waste + r.waste, appr: a.appr + r.appr,
      calcStock: a.calcStock + r.calcStock, real: a.real + (r.realV || 0), mgQty: a.mgQty + r.mgQty, mgYen: a.mgYen + r.mgYen,
      sales: a.sales + r.salesYen, corp: a.corp + r.corpYen, down: a.down + r.down, up: a.up + r.up,
    }), { deliv: 0, sold: 0, waste: 0, appr: 0, calcStock: 0, real: 0, mgQty: 0, mgYen: 0, sales: 0, corp: 0, down: 0, up: 0 });
    const ded = dedOf(b);
    const over = Math.max(0, T.mgYen - ded);   // 管理ロス 免責超過分
    /*
     * 免責超過を商品の税率ごとに分ける（管理ロスの額の割合。商品マスタの税率・2026/10/03 回答：8% 固定にしない）。
     * 税率マスタのどの率でも（2026-10-05）。端数は最後（いちばん大きい割合）の率に寄せて、合計を免責超過に合わせる
     */
    const rateOfRow = (id: number) => S.prods.find((p) => p.id === id)?.t ?? 8;
    const mgPos = rows.reduce((a, x) => a + Math.max(0, x.mgYen), 0);
    const mgBy = new Map<number, number>();
    for (const x of rows) if (x.mgYen > 0) mgBy.set(rateOfRow(x.id), (mgBy.get(rateOfRow(x.id)) ?? 0) + x.mgYen);
    const overBy: Record<number, number> = {};
    if (over > 0 && mgPos > 0) {
      const es = [...mgBy.entries()].sort((a, b) => a[1] - b[1]);
      let rest = over;
      es.forEach(([t, v], i) => { const y = i === es.length - 1 ? rest : Math.round((over * v) / mgPos); overBy[t] = y; rest -= y; });
    } else if (over > 0) overBy[8] = over;
    const adjD = T.down - T.up;                // 価格調整差額（翌月分の前請求へ ± で反映。2026/09/11 決定）
    const cr = cashOf(b), cashPlan = cr.reduce((a, x) => a + x.plan, 0), cashGot = cr.reduce((a, x) => a + x.got, 0), cashDiff = cashPlan - cashGot;
    /*
     * 現金回収差額の税率は専用の設定を持たず、商品の税率に従う（hong 2026-10-06・台帳 F）。
     * 税率が混ざるときは、その拠点の販売額（税込）の割合で税率ごとに分ける（免責超過と同じ。端数はいちばん大きい割合の率に寄せる）。販売がなければ 8%
     */
    const salesBy = new Map<number, number>();
    for (const x of rows) if (x.salesYen > 0) salesBy.set(rateOfRow(x.id), (salesBy.get(rateOfRow(x.id)) ?? 0) + x.salesYen);
    const salesPos = [...salesBy.values()].reduce((a, v) => a + v, 0);
    const cashBy: Record<number, number> = {};
    if (cashDiff !== 0 && salesPos > 0) {
      const es = [...salesBy.entries()].sort((a, b) => a[1] - b[1]);
      let rest = cashDiff;
      es.forEach(([t, v], i) => { const y = i === es.length - 1 ? rest : Math.round((cashDiff * v) / salesPos); cashBy[t] = y; rest -= y; });
    } else if (cashDiff !== 0) cashBy[8] = cashDiff;
    /** 画面で金額に税率を付けるときの代表の税率（割合がいちばん大きい率。販売がなければ 8%） */
    const cashRate = [...salesBy.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 8;
    const bill = over + cashDiff;              // 当月の請求へ繰入＝免責超過 ＋ 現金回収差額（企業負担額は追加請求しない 28-134・28-135）
    return { rows, T, ded, over, overBy, adjD, corp: T.corp, bill, d, free, emp, cashPlan, cashGot, cashDiff, cashBy, cashRate };
  }
  /** 締め月がお試し（実績の月の子契約、なければ拠点の区分） */
  const isTrialAct = (b: Br) => b.trialAct ?? b.kind === 'trial';
  /** 最初の棚卸報告の前の拠点（受付簿 No.134）：始まりの数がないので管理ロスを出さない（実績精算の管理ロスの行を作らない・在庫の画面は「—」） */
  const firstWait = (b: Br) => !!b.firstPending && !b.filed && !b.noCheck;
  /** 事務手数料がかかるか（25日までに未申告。休止中・棚卸なし・お試しは除く） */
  const penaltyOn = (b: PastBr) => !b._past && (!b.filed || !!b.lateFiled) && !b.noCheck && b.ct.st !== 'paused' && !isTrialAct(b);
  /**
   * 後払い（実績精算）の明細。リードタイムに関係なく常に「先月21日〜今月20日」を当月請求。
   * 請求書の明細は税抜（税は請求書ごと・税率ごと）。販売価格（税込）から出した額（管理ロスの免責超過・現金回収差額・代替品）は
   * 税抜＝税込 ÷ (1＋税率) にして載せる（incl＝もとの税込の額。税を二重にかけない・2026/10/03 決定：販売価格は税込）。事務手数料・単発のオプションはマスタの税抜のまま
   */
  function arrLines(b: Br): ArrLine[] {
    const k = calc(b), out: ArrLine[] = [];
    const fromIncl = (n: string, incl: number, t: Tax, src: string): ArrLine => ({ n, a: exTax(incl, t), t, src, incl });
    const [pa, pb] = actPeriod(month).split('〜'), per = `${pa}〜${pb.slice(5)}`;
    const overRates = Object.keys(k.overBy).map(Number).filter((t) => k.overBy[t]).sort((a, b) => a - b);
    for (const t of overRates) {
      const v = k.overBy[t];
      if (v !== 0) out.push(fromIncl(`実績精算差額（${per}分${overRates.length > 1 ? `・${t}%` : ''}）`, v, t, `管理ロス免責超過 ${yen(v)}（税込・商品の税率 ${t}%。価格調整差額は翌月分の前請求へ）`));
    }
    /* 現金回収差額の税率は商品の税率に従う（税率が混ざるときは販売額の割合で分ける：hong 2026-10-06・台帳 F） */
    const cashRates = Object.keys(k.cashBy).map(Number).filter((t) => k.cashBy[t]).sort((a, b) => a - b);
    for (const t of cashRates) {
      const v = k.cashBy[t];
      out.push(fromIncl(`現金回収差額（${per}分・${k.cashDiff > 0 ? '不足' : '多く回収'}${cashRates.length > 1 ? `・${t}%` : ''}）`, v, t, `アプリの現金支払い 回収予定 ${yen(k.cashPlan)} − ドライバーの回収 ${yen(k.cashGot)}（税込・商品の税率 ${t}%${cashRates.length > 1 ? `。販売額の割合で分けた ${yen(v)}` : ''}）`));
    }
    /* 代替品の行（差替＝元の商品の単価・補償＝0円の行もお客様に見せる・除外は出さない。課題 3-11）。単価はメニューの販売価格（税込） */
    for (const x of ((b as PastBr)._past ? [] : b.altRows ?? [])) out.push(fromIncl(x.n, x.a, x.t, `代替品設定 ${x.altId}`));
    /* 単発のオプション（資材の追加配送 OP000036。課題 M6） */
    for (const x of ((b as PastBr)._past ? [] : b.optRows ?? [])) out.push({ n: x.n, a: x.a, t: x.t, src: x.src });
    /*
     * 事務手数料（¥3,000・2026/08/25 決定）：25日までに棚卸の申告がない拠点（判定日 25日・台帳 H 2026-10-05）。請求は保留しない。
     * お客様の入力は20日まで。21〜25日に運営が代理で入れた申告は事務手数料がかからない。25日より後の申告は実績精算に使い、事務手数料はかかる。
     * 休止中（TL-2）・棚卸なしの拠点（課題 2-1）・お試し（請求書は 0円。B4）は付けない
     */
    if (penaltyOn(b)) out.push({ n: PENALTY_LINE, a: S.cfg.penalty, t: S.cfg.penaltyTax ?? 10, src: b.filed ? '棚卸の申告が25日より後（運営が入力）' : '25日までに棚卸の申告がない' });
    return out;
  }
  const arrTot = (b: Br) => arrLines(b).reduce((s, l) => s + l.a, 0);
  /* 調整明細の適用月：単発＝その月だけ／繰越＝開始月から毎月（終了月まで、空なら無期限） */
  const adjOn = (l: AdjLine, m: string) => l.rep === 'every' ? (m >= (l.m || month) && (!l.to || m <= l.to)) : ((l.m || month) === m);
  const adjTot = (b: Br) => b.adj.filter((l) => adjOn(l, month)).reduce((s, l) => s + l.a, 0);
  const adjNext = (b: Br) => b.adj.filter((l) => adjOn(l, nextM()) || (l.rep !== 'every' && (l.m || month) > month));
  const brTot = (b: Br) => advTot(b) + arrTot(b) + adjTot(b);
  /*
   * 請求書を作れる＝前払い（固定額）を確定した（REQ-CT-301：実績精算が未確定でも請求書を発行できる。
   * 未確定の実績精算はその請求書に入れず（後払いの行なし）、確定したら翌月の請求書で精算する＝actLater）
   */
  const brOK = (b: Br) => b.fixOK;
  /** この締め月の実績精算を、請求書の発行のあとに確定する拠点（REQ-CT-301） */
  const actDeferred = (b: Br) => b.actLater === month;
  /** 実績精算を変えられないか（請求書を発行したあとでも、実績精算を後に回した拠点は変えられる） */
  const actLock = (b: Br) => (actDeferred(b) ? locked(b) : editLock(b));
  /** 後に回した実績精算を確定したときに翌月の ③ 調整にした行の印 */
  const LATER = `【${month} 締めの実績精算】`;
  const locked = (b: Br) => co(b.co).confirmed;
  /* 当月の請求書に載っているか（過去月の請求書は当月のロック判定に使わない） */
  const invNow = (b: Br) => S.invoices.find((i) => (i.m || month) === month && i.lines.some((l) => l.br === b.name && l.k !== '繰越'));
  const billedNow = (b: Br) => !!invNow(b);
  const editLock = (b: Br) => billedNow(b) || locked(b);
  const lockMsg = (b: Br) => billedNow(b) ? 'この拠点の当月分は請求済みです。金額に効く変更はできません' : locked(b) ? '法人確定中のため変更できません' : '';
  const canAdj = (b: Br) => !(locked(b) || b.actOK);

  /** 請求書に載せる明細（前払い・後払い・調整）。実績精算が未確定の拠点は後払いを載せない（REQ-CT-301） */
  const invLines = (bs: Br[]): InvLine[] => bs.flatMap((b) => [
    ...advLines(b).map((l) => ({ br: b.name, ...l, k: '前払い' as const })),
    ...(b.actOK ? arrLines(b) : []).map((l) => ({ br: b.name, ...l, k: '後払い' as const })),
    ...b.adj.filter((l) => adjOn(l, month)).map((l) => ({ br: b.name, ...l, k: '調整' as const })),
  ]);

  /* ===== 入金期限・未精算（前月以前の未入金）と再請求 ===== */
  function dueCalc(i: Invoice) {
    const iss = addM(i.m, 1), b = i.br ? br(i.br) : null, own = !!b && ownBill(b), o: { id: string; due: string } = own ? b! : co(i.co);
    const sel = o.due || DUES[0], ym = sel === DUES[1] ? addM(iss, 1) : iss;
    i.dueRule = `請求先（${own ? '拠点' : '法人'}）の設定「${sel}」・請求月 ${iss}`;
    return ym.replace('-', '/') + '/27';
  }
  const invRest = (i: Invoice) => i.total;   // 入金の額は持たないので、繰越は請求書の全額
  /** 再請求を指定できる：入金期限を過ぎた前月以前の発行済み請求書 */
  const canMark = (i: Invoice) => i.status === 'DISPATCHED' && !i.carriedTo && i.m < month && (!i.due || i.due < addM(month, 1).replace('-', '/') + '/01');
  const isUnpaid = (i: Invoice) => canMark(i) && !!i.unpaid;
  const unpaidAll = () => S.invoices.filter(isUnpaid);
  const payStatus = (i: Invoice): [string, string] => {
    if (i.carriedTo) return ['pur', `${i.carriedTo} で再請求`];
    if (i.unpaid) return ['wait', '再請求を指定'];
    if (i.rqWd) return ['mut', '未入金（再請求なし）'];
    return ['mut', '—'];
  };
  /** この請求先（法人あて or 拠点あて）に加わる再請求 */
  const carriesTo = (tco: string, tbr: string | null) =>
    unpaidAll().filter((u) => u.co === tco && (!tbr || !u.br || u.br === tbr) && (tbr || !u.br || !ownBill(br(u.br)!)));

  /* ===== 請求書のまとまり（1グループ＝1通の請求書。2026/09/29 28-138） ===== */
  type Group = { c: Co; bid: string | null; bs: Br[]; fixedInv?: Invoice | null };
  function invGroups(): Group[] {
    const out: Group[] = [];
    S.cos.forEach((c) => {
      const bs = brsOf(c.id);
      if (c.issue === 'merged') {
        const mg = bs.filter((b) => !ownBill(b));
        if (mg.length) out.push({ c, bid: null, bs: mg });
        bs.filter(ownBill).forEach((b) => out.push({ c, bid: b.id, bs: [b] }));
      } else bs.forEach((b) => out.push({ c, bid: b.id, bs: [b] }));
    });
    S.brs.filter((b) => b.co === '').forEach((b) => out.push({ c: CO_NONE, bid: b.id, bs: [b] }));
    return out;
  }
  const monthOf = (b: Br, m: string): MonthSnap | undefined => (b.months || []).find((x) => x.m === m);
  /** 選べる月：確定時の写しがある月と当月を新しい順にすべて（実績精算・棚卸し・請求の確定で共通。台帳 F 2026-10-08） */
  const monthChoices = (): string[] => [...new Set([month, ...S.brs.flatMap((b) => (b.months || []).map((x) => x.m))])].filter((m) => m <= month).sort().reverse();
  const grpInv = (g: Group, m: string) =>
    S.invoices.find((i) => (i.m || month) === m && i.co === g.c.id && (g.bid ? i.br === g.bid : !i.br) && i.status !== 'WITHDRAWN')
    ?? S.invoices.find((i) => (i.m || month) === m && i.co === g.c.id && (g.bid ? i.br === g.bid : !i.br));
  /* 過去の締め月：確定したときに載った請求書でまとめる */
  function pastGroups(m: string): Group[] {
    const map: Record<string, Group> = {}, out: Group[] = [];
    S.brs.forEach((b) => {
      const mo = monthOf(b, m), i = mo?.inv ? S.invoices.find((x) => x.id === mo.inv) ?? null : null, k = i ? i.id : '_' + b.id;
      if (!map[k]) { map[k] = { c: b.co ? co(b.co) : CO_NONE, bid: (i && !i.br) ? null : b.id, bs: [], fixedInv: i }; out.push(map[k]); }
      map[k].bs.push(b);
    });
    return out;
  }
  const pastB = (b: Br, m: string): PastBr => ({
    ...b, _past: true, rows: pastRows(b, m), filed: true, adjMode: 'none', adjYen: 0, actOK: true,
    stockDay: m.replace('-', '/') + '/' + String(18 + (+b.id.replace(/\D/g, '')) % 3), by: b.by && b.by !== '—' ? b.by : 'ES配送便ドライバー',
  });
  const carryFor = (g: Group) => unpaidAll().filter((u) => u.co === g.c.id && (g.bid ? u.br === g.bid : (!u.br || g.bs.some((b) => b.id === u.br))));

  /* 先月との比較（前払いの費目＋調整）。先月＝前の締め月に確定した内容 */
  function diffRows(b: Br) {
    const pm = addM(month, -1), mo = monthOf(b, pm), prev: Record<string, number> = {};
    type R = { n: string; kind: string; prev?: number; cur: number; note: string; adj?: boolean; diff: number; ch: string };
    const out: R[] = [];
    (mo?.snap.lines ?? []).forEach((l) => { prev[l.n] = (prev[l.n] || 0) + l.a; });
    const seen: Record<string, 1> = {};
    fixRows(b).forEach((r) => {
      const p = prev[r.n]; seen[r.n] = 1;
      if (!r.amt && p === undefined) return;
      const kind = r.dc ? '値引き（毎月）' : r.tim === 'Y' ? '年一括（12ヶ月分）' : '毎月';
      out.push({ n: r.n, kind, prev: p, cur: r.amt, note: r.state === 'paused' ? '休止中' : r.state === 'free' ? '無料（提供数の条件）' : r.state === 'cov' ? '前払い済み（カバー期間中）' : '', diff: 0, ch: '' });
    });
    Object.keys(prev).forEach((n) => { if (!seen[n]) out.push({ n, kind: '—', prev: prev[n], cur: 0, note: '今月は費目なし', diff: 0, ch: '' }); });
    b.adj.filter((l) => adjOn(l, month)).forEach((l) => {
      const ev = l.rep === 'every';
      out.push({ n: l.n, kind: ev ? `毎月（繰越・${l.m}〜${l.to || '終了月なし'}）` : '今月のみ', prev: ev && l.m < month ? l.a : undefined, cur: l.a, note: l.kind === 'spot' ? 'スポット費用' : l.kind === 'init' ? '初期費用' : '調整', adj: true, diff: 0, ch: '' });
    });
    out.forEach((r) => {
      const p = r.prev === undefined ? 0 : r.prev; r.diff = r.cur - p;
      r.ch = r.prev === undefined ? (r.cur ? '追加' : '') : !r.cur ? '終了' : r.cur !== p ? '変更' : '';
    });
    const planCh = mo && mo.snap.planId && mo.snap.planId !== b.planId ? `プラン変更（${mo.snap.plan} → ${planOf(b).pub}）` : '';
    return { rows: out, n: out.filter((r) => r.ch).length + (planCh ? 1 : 0), planCh };
  }
  const chgOf = (b: Br) => diffRows(b).n;

  /** 1通の請求書（グループ）の状態 */
  function gView(g: Group, m: string) {
    const past = m < month, i = g.fixedInv !== undefined ? g.fixedInv : grpInv(g, m);
    const n = g.bs.length, ok = past ? n : g.bs.filter(brOK).length;
    const blocked = past ? 0 : g.bs.filter((b) => !b.actOK).length;
    const amt = i ? i.total : past ? g.bs.reduce((a, b) => { const mo = monthOf(b, m); return a + (mo?.adv || 0) + (mo?.arr || 0) + (mo?.adj || 0); }, 0) : g.bs.reduce((a, b) => a + brTot(b), 0);
    let st: { k: 'sent' | 'carried' | 'made' | 'wd' | 'ready' | 'wait'; label: string; tone: string };
    if (i && i.status === 'DISPATCHED') st = { k: 'sent', label: '発行済', tone: 'ok' };
    else if (i && i.status === 'CARRIED') st = { k: 'carried', label: '発行済み（当月で再請求）', tone: 'pur' };
    else if (i && i.status === 'REGISTERED') st = i.sendErr ? { k: 'made', label: '送信エラー（再送してください）', tone: 'no' } : { k: 'made', label: '作成済み・未発行', tone: 'info' };
    else if (i && i.status === 'WITHDRAWN') st = { k: 'wd', label: '取消済', tone: 'no' };
    else if (ok === n) st = { k: 'ready', label: '請求書を作成できます', tone: 'wait' };
    else st = { k: 'wait', label: '子契約の確定待ち', tone: 'mut' };
    return { g, i: i ?? null, n, ok, blocked, amt, st, past, m, key: `${g.c.id}|${g.bid || ''}|${i ? i.id : ''}` };
  }
  /** 一覧の行：締め月ごとのグループ */
  const groupsOf = (m: string) => (m < month ? pastGroups(m) : invGroups()).map((g) => gView(g, m));
  /** URL のキー（請求書番号 or 法人ID・拠点ID）からグループを探す */
  function findGroup(id: string, m?: string) {
    if (id.startsWith('INV-')) {
      const i = S.invoices.find((x) => x.id === id); if (!i) return null;
      const im = i.m || month;
      if (im < month) {
        const ps = pastGroups(im);
        const g = ps.find((x) => x.fixedInv && x.fixedInv.id === i.id) ?? ps.find((x) => x.c.id === i.co && x.bs.some((b) => b.id === i.br));
        return g ? gView(g, im) : null;
      }
      const c = co(i.co);
      const bid = (i.br && (c.issue !== 'merged' || ownBill(br(i.br)!))) ? i.br : null;
      const g = invGroups().find((x) => x.c.id === i.co && (x.bid || null) === bid);
      return g ? gView(g, im) : null;
    }
    const [cid, bid] = id.split('.');
    const mm = m || month;
    if (mm < month) {
      const g = pastGroups(mm).find((x) => x.c.id === cid && (bid ? x.bs.some((b) => b.id === bid) : !x.bid)); return g ? gView(g, mm) : null;
    }
    const g = invGroups().find((x) => x.c.id === cid && (x.bid || null) === (bid || null));
    return g ? gView(g, mm) : null;
  }
  /** 請求書詳細の URL のキー */
  const groupHref = (x: GroupViewLite) => x.i ? x.i.id : `${x.g.c.id}${x.g.bid ? '.' + x.g.bid : ''}`;

  /* ===== 実績精算の内訳ごとの確定（v1.5 28-144） ===== */
  function partsOf(b: PastBr) {
    const k = calc(b);
    return [
      { k: 'loss' as const, t: '管理ロス（棚卸）', a: k.over, na: b.noCheck ? '棚卸なしの拠点（管理ロスなし）' : firstWait(b) ? '最初の棚卸報告の前（管理ロスなし）' : '',
        desc: (b.filed ? `管理ロス ${yen(k.T.mgYen)} − 免責 ${yen(k.ded)}（棚卸 ${fmtDate(b.stockDay)}）` : firstWait(b) ? '切り替えのあとの最初の棚卸報告がまだです。最初の棚卸報告までは管理ロスを出しません（始まりの数がないため）' : '棚卸が未申告です')
          + (penaltyOn(b) ? `。25日までに申告がなかったため、事務手数料 ${yen(S.cfg.penalty)}（税抜・${S.cfg.penaltyTax ?? 10}%）が載ります（請求は保留しません）` : !b.filed && (b.noCheck || isTrialAct(b) || b.ct.st === 'paused') ? '（この拠点は事務手数料はかかりません）' : '') },
      { k: 'cash' as const, t: '現金回収差額', a: k.cashDiff, na: b.cash ? '' : '現金利用なし', desc: 'アプリの現金支払い：回収予定額 − ドライバーの回収額' },
      { k: 'adj' as const, t: '価格調整差額（翌月の前請求へ）', a: k.adjD, na: k.adjD ? '' : '価格調整なし', desc: '値上げ・値下げ・無料提供の差額。翌月の前払いの請求に ± で載ります' },
    ];
  }
  const partOK = (b: Br, k: 'loss' | 'cash' | 'adj') => !!(b.actOK || b.actParts?.[k]);
  const partsN = (b: Br) => partsOf(b).filter((p) => partOK(b, p.k)).length;

  /* ===== 在庫（理論在庫＝計算在庫） ===== */
  const theo = (r: StockRow) => r.prev + r.deliv - r.sold - r.waste + r.appr;
  const theoTot = (b: Br) => b.rows.reduce((s, r) => s + theo(r), 0);
  const stockLoss = (b: Br) => b.rows.reduce((s, r) => s + (theo(r) - r.real), 0);
  /**
   * 差分率＝(理論 − 申告) ÷ 理論、廃棄率＝廃棄 ÷ (前回の申告 ＋ 納品)。どちらかが 10%（ALERT_RATE・いまは固定）以上ならアラート（課題 2-1）。
   * 差分率は申告がある拠点だけ（棚卸なしの拠点は null＝「棚卸なし」）。行ごとの値は rowRates
   */
  const rateOf = (rows: Pick<StockRow, 'prev' | 'deliv' | 'sold' | 'waste' | 'appr' | 'real'>[], filed: boolean, noCheck?: boolean) => {
    const th = rows.reduce((s, r) => s + theo(r as StockRow), 0), real = rows.reduce((s, r) => s + r.real, 0);
    const base = rows.reduce((s, r) => s + r.prev + r.deliv, 0), waste = rows.reduce((s, r) => s + r.waste, 0);
    const diff = noCheck || !filed ? null : th > 0 ? (th - real) / th : real > 0 ? -1 : 0;
    const wasteR = base > 0 ? waste / base : 0;
    const diffAlert = diff !== null && Math.abs(diff) >= ALERT_RATE - 1e-9, wasteAlert = wasteR >= ALERT_RATE - 1e-9;
    return { diff, waste: wasteR, diffAlert, wasteAlert, alert: diffAlert || wasteAlert, noCheck: !!noCheck };
  };
  const rates = (b: Br) => rateOf(b.rows, !!b.filed, b.noCheck);
  const rowRates = (b: Br, r: StockRow) => rateOf([r], !!b.filed, b.noCheck);

  /** 「請求書を作成」の確認に出す内容（Bill One に登録・再請求が加わって金額が変わる理由） */
  function makePreview(cid: string, bid: string | null) {
    const b0 = bid ? br(bid) ?? null : null;
    const bs = b0 ? ((brOK(b0) && !billedNow(b0) && (ownBill(b0) || co(b0.co).issue === 'branch')) ? [b0] : [])
      : brsOf(cid).filter((b) => !ownBill(b) && brOK(b) && !billedNow(b));
    if (!bs.length) return null;
    const t = taxSplit(invLines(bs)), cs = carriesTo(b0 ? b0.co : cid, b0 ? b0.id : null);
    const add = cs.reduce((s, u) => s + invRest(u), 0);
    return { tot: t.tot, add, carries: cs.map((u) => ({ id: u.id, amt: invRest(u) })) };
  }

  /* =================== 書き換え（actions から呼ぶ） =================== */
  const nowts = () => nowStamp();

  function setFix(id: string, v: boolean) {
    const b = mustBr(id);
    if (editLock(b)) throw new ApiError(lockMsg(b), 400);
    b.fixOK = v; log('佐藤', `${b.name}：① 固定額を${v ? '確定' : '確定解除'}`);
    return `${b.name} ① 固定額を${v ? '確定しました' : '解除しました'}`;
  }
  /** 前払いを確定（REQ-CT-301：実績精算が未確定でも確定・請求書の発行ができる。未確定の実績精算は翌月の請求書で精算） */
  function confirmFix(id: string) {
    return setFix(id, true);
  }
  function confirmAllFix(ids: string[]) {
    const t = ids.map((x) => br(x)).filter((b): b is Br => !!b && !b.fixOK && !editLock(b));
    t.forEach((b) => setFix(b.id, true));
    return `${t.length}件の子契約を確定しました`;
  }
  function setAct(id: string, v: boolean) {
    const b = mustBr(id);
    if (actLock(b)) throw new ApiError(lockMsg(b), 400);
    const NM = nextM(), KEY = '価格調整差額（' + month + '分の実績精算）';
    b.adj = (b.adj || []).filter((l) => l.n !== KEY && !l.n.startsWith(LATER));   // いったん取り消してから作り直す
    if (v) {
      const d = calc(b).adjD;
      if (d !== 0) { b.adj.push({ n: KEY, a: d, t: 8, kind: 'adj', m: NM, rep: 'once' }); log('システム', `${b.name}：価格調整差額 ${yenSigned(d)} を ${NM} の前請求へ繰越`); }
      /* 請求書を先に発行した拠点（REQ-CT-301）：後払いの行を翌月の請求書の ③ 調整（単発）にして精算する */
      if (actDeferred(b)) {
        const ls = arrLines(b);
        ls.forEach((l) => b.adj.push({ n: `${LATER}${l.n}`, a: l.a, t: l.t, kind: 'adj', m: NM, rep: 'once' }));
        if (ls.length) log('システム', `${b.name}：${month} 締めの実績精算（${ls.length}行・${yenSigned(ls.reduce((a, l) => a + l.a, 0))}）を ${NM} の請求書で精算`);
      }
    }
    b.actOK = v; log('佐藤', `${b.name}：② 実績精算を${v ? '確定' : '確定解除'}`);
    return `${b.name} ② 実績精算を${v ? '確定しました' : '解除しました'}`;
  }
  /** 実績精算の内訳を確定・解除。3つとも確定すると実績精算が確定する */
  function setPart(id: string, k: 'loss' | 'cash' | 'adj', v: boolean) {
    const b = mustBr(id);
    if (actLock(b)) throw new ApiError(lockMsg(b), 400);
    if (!v && b.actOK) { const keep = { ...(b.actParts || { loss: true, cash: true, adj: true }) }; const msg = setAct(id, false); keep[k] = false; b.actParts = keep; return msg; }
    b.actParts = { ...(b.actParts || {}), [k]: v };
    const p = partsOf(b).find((x) => x.k === k)!;
    log('佐藤', `${b.name}：実績精算の「${p.t}」を${v ? '確定' : '確定解除'}`);
    if (v && partsOf(b).every((x) => partOK(b, x.k))) return setAct(id, true);
    return `${p.t}を${v ? '確定しました' : '解除しました'}`;
  }
  /** 残りをまとめて確定 */
  const actAll = (id: string) => setAct(id, true);
  function unAct(id: string) { const msg = setAct(id, false); mustBr(id).actParts = {}; return msg; }
  /** まとめて確定：差分率・廃棄率のアラートがある拠点は1件ずつ確かめて確定する（課題 2-1）のでここでは確定しない */
  function bulkAct(ids: string[]) {
    let n = 0, skip = 0;
    ids.forEach((id) => { const b = br(id); if (!b || b.actOK || actLock(b)) return; if (rates(b).alert) { skip++; return; } setAct(id, true); n++; });
    return `${n}件の実績精算を確定しました` + (skip ? `（差分率・廃棄率のアラートがある ${skip}件は確定していません。詳細で確かめて確定してください）` : '');
  }
  /** 実績精算の編集：価格調整（申請の適用）と棚卸の申告（現場・申請の状態を再現） */
  function editActual(id: string, key: 'filed' | 'adjMode' | 'adjYen', v: boolean | string | number) {
    const b = mustBr(id);
    if (actLock(b) || b.actOK) throw new ApiError(lockMsg(b) || '確定済みのため変更できません', 400);
    const adjLabel = () => b.adjMode === 'free' ? '無料提供（企業負担）' : b.adjMode === 'up' ? `値上げ +${yen(b.adjYen)}` : b.adjMode === 'down' ? `値下げ ${yen(-b.adjYen)}` : 'なし';
    if (key === 'filed') {
      const on = !!v;
      b.filed = on; b.stockDay = on ? '2026/10/18' : '—'; b.by = on ? '企業担当者（山田）' : '—';
      log('現場データ', `${b.name}：棚卸の申告を${on ? '取り込み' : '取消'}`);
    } else if (key === 'adjMode') {
      b.adjMode = String(v) as Br['adjMode']; if (b.adjMode === 'none' || b.adjMode === 'free') b.adjYen = 0;
      log('佐藤', `${b.name}：価格調整を「${adjLabel()}」に適用`);
    } else {
      b.adjYen = Math.max(0, Math.round(Number(v) / 10) * 10);
      log('佐藤', `${b.name}：価格調整を「${adjLabel()}」に適用`);
    }
  }
  function remind(id: string) { const b = mustBr(id); log('佐藤', `${b.name}：棚卸の督促を送信`); return '督促を送りました'; }

  /* ----- 在庫調整（運営が直接登録。申請・承認はない） ----- */
  /** 商品の在庫の行（この締めで動きのない商品は 0 の行を足す） */
  function rowOf(b: Br, prod: number) {
    let r = b.rows.find((x) => x.id === prod);
    if (!r) { r = { id: prod, prev: 0, deliv: 0, sold: 0, waste: 0, appr: 0, real: 0 }; b.rows.push(r); }
    return r;
  }
  function newAdjId() { let n = 200 + S.adjs.length + 2; while (S.adjs.some((a) => a.id === 'ADJ-' + n)) n++; return 'ADJ-' + n; }
  function pushStockAdj(b: Br, prod: number, q: number, r: string) {
    rowOf(b, prod).appr += q;
    const seq = Math.max(0, ...S.adjs.map((a) => a.seq)) + 1;
    S.adjs.unshift({ id: newAdjId(), at: nowts(), by: '運営 佐藤', br: b.id, prod, delta: q, reason: r, seq });
    log('佐藤', `在庫調整を登録 ${b.name} / ${prodName(prod)} ${q > 0 ? '+' : ''}${q}点（${r}）`);
  }
  function addStockAdj(id: string, rows: { prod: number; q: number; r: string }[]) {
    const b = mustBr(id);
    if (actLock(b) || b.actOK) throw new ApiError(lockMsg(b) || 'この拠点は確定済みのため調整できません', 400);
    const ck = checkStockRows(rows);
    if (!ck.ok) throw new ApiError(ck.msg, 400);
    ck.rows.forEach((x) => pushStockAdj(b, x.prod, x.q, x.r.trim()));
    log('佐藤', `${b.name} の在庫調整を保存`);
    return '保存しました';
  }
  function addStockAdjBulk(ids: string[], reason: string, cells: { br: string; prod: number; q: number }[]) {
    const err = checkStockBulk(cells, reason);
    if (err) throw new ApiError(err, 400);
    const r = reason.trim();
    cells.filter((c) => c.q).forEach((c) => {
      const b = mustBr(c.br);
      if (actLock(b) || b.actOK) return;
      pushStockAdj(b, c.prod, c.q, r);
    });
    log('佐藤', `在庫調整（まとめて ${ids.length}拠点）を保存`);
    return '保存しました';
  }
  function removeAdjust(id: string) {
    const a = S.adjs.find((x) => x.id === id); if (!a) throw new ApiError('在庫調整が見つかりません', 404);
    const b = mustBr(a.br);
    if (actLock(b) || b.actOK) throw new ApiError(lockMsg(b) || 'この拠点は確定済みのため取り消せません', 400);
    rowOf(b, a.prod).appr -= a.delta;
    S.adjs = S.adjs.filter((x) => x.id !== id);
    log('佐藤', `在庫調整を取消 ${b.name} / ${prodName(a.prod)} ${a.delta > 0 ? '+' : ''}${a.delta}点`);
    return '取り消しました';
  }

  /* ----- ③ 調整（初期費用・スポット費用・調整。単発／繰越） ----- */
  function adjGuard(b: Br, what: string) { if (editLock(b) || b.fixOK) throw new ApiError(lockMsg(b) || `確定済みのため${what}できません`, 400); }
  function addAdj(id: string, x: { n: string; a: number; t: Tax; kind: AdjLine['kind']; m: string; rep: AdjLine['rep']; to: string }) {
    const b = mustBr(id); adjGuard(b, '追加');
    const err = checkAdjLine(month, x); if (err) throw new ApiError(err, 400);
    const n = x.n.trim() || '調整', m = x.kind === 'init' ? month : x.m;   // 初期費用は当月請求（REQ-CT-182）
    b.adj.push({ n, a: x.a, t: x.t, kind: x.kind, m, rep: x.rep, to: x.rep === 'every' ? x.to : '' });
    const lbl = x.rep === 'every' ? `${m}〜${x.to || '無期限'} 毎月` : `${m} 単発`;
    log('佐藤', `${b.name}：${x.kind === 'init' ? '初期費用' : x.kind === 'spot' ? 'スポット費用' : '調整'}を追加（${n} ${yen(x.a)}・${lbl}）`);
    return x.rep === 'every' ? `${m} から毎月${x.to ? `（${x.to}まで）` : ''}請求に載ります` : (m === month ? '当月の請求に載ります' : `${m} の請求に載ります（当月は変わりません）`);
  }
  /** 繰越の調整を今月で終了する（過去の請求は変えない） */
  function stopAdj(id: string, i: number) {
    const b = mustBr(id); adjGuard(b, '変更');
    const l = b.adj[i]; if (!l) throw new ApiError('調整が見つかりません', 404);
    if (l.dm) throw new ApiError('申請の承認で自動でできた調整明細は変えられません', 400);
    if (l.rep !== 'every') throw new ApiError('単発の調整です', 400);
    l.to = month; log('佐藤', `${b.name}：繰越の調整「${l.n}」を ${month} で終了`);
    return `${month} 分までで終了します（翌月からは載りません）`;
  }
  function delAdj(id: string, i: number) {
    const b = mustBr(id); adjGuard(b, '削除');
    if (b.adj[i]?.dm) throw new ApiError('申請の承認で自動でできた調整明細は消せません（直すときは新しい申請を出します）', 400);
    const l = b.adj.splice(i, 1)[0]; if (!l) throw new ApiError('調整が見つかりません', 404);
    log('佐藤', `${b.name}：調整明細を削除（${l.n}）`);
    return '削除しました';
  }

  /* ----- 請求書（Bill One への登録・発行は状態を変えるだけ。外部には送らない） ----- */
  function invNo(ym: string, key: string | null) {
    const p = 'INV-' + ym.replace('-', ''), used = (n: number) => S.invoices.some((i) => i.id === p + String(n).padStart(4, '0'));
    let n = key ? INVFIX[key] : undefined;
    if (!n || used(n)) { n = 2; const fx = Object.values(INVFIX); while (used(n) || fx.includes(n)) n++; }
    return p + String(n).padStart(4, '0');
  }
  function carrySilent(fromId: string, toId: string) {
    const f = S.invoices.find((x) => x.id === fromId), t = S.invoices.find((x) => x.id === toId);
    if (!f || !t || f.carriedTo || t.status !== 'REGISTERED') return false;
    const amt = invRest(f); if (amt <= 0) return false;
    t.lines.push({ br: f.br ? br(f.br)!.name : '（法人まとめ）', n: `前月以前のご請求の再請求（${f.id}）`, a: amt, t: 0, k: '繰越', from: f.id });
    Object.assign(t, taxSplit(t.lines)); t.total = t.tot; f.carriedTo = t.id; f.status = 'CARRIED';
    log('システム', `${f.id}（${yen(amt)}）を ${t.id} に加えて再請求`);
    return true;
  }
  /** 当月の請求書（作成済み・未発行）に、この請求先の再請求の指定をまとめて加える */
  function autoCarry(t: Invoice) {
    let n = 0;
    carriesTo(t.co, t.br).forEach((u) => { if (carrySilent(u.id, t.id)) n++; });
    return n;
  }
  function pushInvoice(cid: string, brId: string | null, bs: Br[], tgt: string) {
    const lines = invLines(bs), t = taxSplit(lines);
    /* 解約した拠点の最終請求書（拠点だけの1通・最後の実績精算・違約金・回収の費用・調整明細。2026/10/03 決定） */
    const fin = bs.length === 1 && !!bs[0].final;
    /* 実績精算が未確定の拠点（REQ-CT-301）：後払いを入れずに発行し、確定したら翌月の請求書で精算する */
    const later = bs.filter((b) => !b.actOK);
    later.forEach((b) => { b.actLater = month; log('システム', `${b.name}：実績精算（${actPeriod(month)}）が未確定のため、この請求書に入れず翌月の請求書で精算`); });
    const laterNote = later.length ? `実績精算（${actPeriod(month)}）が未確定の拠点（${later.map((b) => b.name).join('・')}）は、この請求書に含めていません。確定後、翌月の請求書で精算します。` : '';
    const inv: Invoice = {
      id: invNo(addM(month, 1), brId || cid), co: cid, br: brId, lines, ...t, total: t.tot, m: month, tgt, status: 'REGISTERED', unpaid: false, due: '',
      ...(fin ? { final: true, note: `最終請求書（${bs[0].name}・ご解約にともなう最後のご請求：最後の実績精算・違約金・回収の費用・調整）` } : {}),
    };
    if (laterNote) inv.note = [inv.note, laterNote].filter(Boolean).join(' ');
    inv.due = dueCalc(inv); S.invoices.push(inv); autoCarry(inv);
    return inv;
  }
  /** 拠点単位の発行（確定は拠点ごと、そろうのを待たない） */
  function makeInvoiceBr(bid: string) {
    const b = mustBr(bid);
    if (!brOK(b)) throw new ApiError('先にこの拠点を確定してください', 400);
    if (!(ownBill(b) || co(b.co).issue === 'branch')) throw new ApiError('まとめて発行の法人です。法人の行の「請求書を作成」から発行してください', 400);
    if (billedNow(b)) throw new ApiError('この拠点の当月の請求書はすでにあります', 400);
    pushInvoice(b.co, b.id, [b], tgtM(b));
    log('システム', `${b.name}：拠点単位で請求書を作成（Bill One 登録）`);
    return `${b.name} の請求書を作成しました（Bill One 登録）`;
  }
  /** 請求書を作成（Bill One に登録） */
  function makeInvGrp(cid: string, bid: string | null) {
    if (bid) return makeInvoiceBr(bid);
    const c = co(cid), bs = brsOf(cid).filter((b) => !ownBill(b) && brOK(b) && !billedNow(b));
    if (!bs.length) throw new ApiError('確定済みで請求書が未作成の子契約がありません', 400);
    const inv = pushInvoice(cid, null, bs, addM(month, 1 + c.lead));
    log('システム', `${c.name}：確定済み ${bs.length}件の子契約で請求書を作成（Bill One 登録）`);
    return `${inv.id} を作成し、Bill One へ登録しました`;
  }
  const issueDay = () => addM(month, 1).replace('-', '/') + '/01';
  /** Bill One で発行（DISPATCHED）。デモでは大阪キッチンあての1回目が送信エラーになる */
  function dispatch(id: string) {
    const i = S.invoices.find((x) => x.id === id); if (!i) throw new ApiError('請求書が見つかりません', 404);
    if (i.status !== 'REGISTERED') throw new ApiError('発行できるのは登録済み（REGISTERED）の請求書だけです', 400);
    /* デモ：見本データ（billing.meta の cfg.boFailOnce）か DEMO 表示のときの見本の法人だけ、1回目の送信がエラーになる */
    if (((DEMO && BO_FAIL_ONCE[i.co]) || S.cfg.boFailOnce?.includes(i.co)) && !i.retried) {
      i.retried = true; i.sendErr = 'Bill One から応答がありませんでした（タイムアウト）';
      log('システム', `${i.id}：Bill One への送信に失敗（${i.sendErr}）`);
      return false;
    }
    i.sendErr = ''; i.status = 'DISPATCHED'; i.issued = issueDay();
    log('システム', `${i.id}：Bill One で発行（DISPATCHED・発行日 ${i.issued}）`);
    return true;
  }
  function dispatchOne(id: string) {
    /* 送信エラーは記録を残すため、投げずに文言で返す（請求書には送信エラーが出て、再送できる） */
    if (!dispatch(id)) return 'Bill One への送信に失敗しました（1通）。内容を確認して再送してください。';
    return `1通の請求書を Bill One に送りました。発行日は ${fmtDate(issueDay())} です。`;
  }
  /** まとめて作成・発行（一覧で選んだ請求先） */
  function bulkGrp(kind: 'make' | 'send', keys: string[]) {
    const xs = groupsOf(month).filter((x) => keys.includes(x.key));
    const t = xs.filter((x) => x.st.k === (kind === 'make' ? 'ready' : 'made'));
    if (kind === 'make') {
      t.forEach((x) => { x.g.bid ? makeInvoiceBr(x.g.bid) : makeInvGrp(x.g.c.id, null); });
      return `${t.length}通の請求書を作成しました`;
    }
    let ok = 0, ng = 0;
    t.forEach((x) => { if (x.i && dispatch(x.i.id)) ok++; else ng++; });
    return (ok ? `${ok}通の請求書を Bill One に送りました。発行日は ${fmtDate(issueDay())} です。` : '') + (ng ? `Bill One への送信に失敗しました（${ng}通）。内容を確認して再送してください。` : '');
  }
  /** 取消して再発行（Bill One の取消は Bill One の画面で行う → ES は旧IDを取消にして、別のIDで作り直す） */
  function withdraw(id: string) {
    const i = S.invoices.find((x) => x.id === id); if (!i) throw new ApiError('請求書が見つかりません', 404);
    if (i.status !== 'DISPATCHED') throw new ApiError('取消できるのは発行済みの請求書だけです', 400);
    i.status = 'WITHDRAWN'; i.unpaid = false;
    const n: Invoice = { ...i, id: invNo(i.id.slice(4, 8) + '-' + i.id.slice(8, 10), null), status: 'REGISTERED', lines: i.lines.map((l) => ({ ...l })), reissueOf: i.id, sendErr: '', retried: true, unpaid: false, issued: '' };
    delete n.carriedTo; delete n.reissuedTo;
    i.reissuedTo = n.id; S.invoices.push(n);
    log('佐藤', `${i.id}：Bill One で取消済み → ES で取消（WITHDRAWN）にして ${n.id} を作成（再発行）`);
    return `請求書 ${i.id} を取消にし、${n.id} を作りました。「Bill One で発行」で送ってください。`;
  }
  /** 当月の請求書で再請求する（Bill One で入金がないことを運営が確かめたとき）／指定を外す */
  function markUnpaid(id: string, v: boolean) {
    const i = S.invoices.find((x) => x.id === id); if (!i) throw new ApiError('請求書が見つかりません', 404);
    if (v && !canMark(i)) throw new ApiError('入金期限を過ぎた前月以前の発行済み請求書だけ指定できます', 400);
    i.unpaid = v; i.unpaidAt = v ? '運営 佐藤' : ''; if (v) i.rqWd = false;
    log('佐藤', `${i.id}：${v ? '当月の請求書で再請求するよう指定（Bill One で入金がないことを運営が確認）' : '再請求の指定を外した'}`);
    if (v) {
      const t = S.invoices.find((x) => (x.m || month) === month && x.co === i.co && (!i.br || !x.br || x.br === i.br) && x.status === 'REGISTERED');
      if (t && carrySilent(i.id, t.id)) return `${t.id} に加えました（当月の請求書で再請求）`;
      const sent = S.invoices.find((x) => (x.m || month) === month && x.co === i.co && (!i.br || !x.br || x.br === i.br) && x.status === 'DISPATCHED');
      return sent ? '当月の請求書は発行済みのため、翌月の請求書を作成するときに加えます' : '当月の請求書を作成するときに自動で加えます';
    }
    return '再請求の指定を外しました';
  }
  function carryOver(fromId: string, toId: string) {
    const f = S.invoices.find((x) => x.id === fromId), t = S.invoices.find((x) => x.id === toId);
    if (!f || !t) throw new ApiError('請求書が見つかりません', 404);
    if (t.status === 'WITHDRAWN') throw new ApiError('取消済みの請求書には繰越できません', 400);
    if (f.carriedTo) throw new ApiError(`${f.id} はすでに ${f.carriedTo} へ繰越済みです`, 400);
    const amt = invRest(f);
    if (amt <= 0) throw new ApiError('未精算の残がありません', 400);
    t.lines.push({ br: f.br ? br(f.br)!.name : '（法人まとめ）', n: `前月以前のご請求の再請求（${f.id}）`, a: amt, t: 0, k: '繰越', from: f.id });
    Object.assign(t, taxSplit(t.lines)); t.total = t.tot;
    f.carriedTo = t.id; f.status = 'CARRIED';
    log('佐藤', `${f.id}（${f.m}分・残 ${yen(amt)}）を ${t.id} へ繰越して再請求`);
    return `${yen(amt)} を ${t.id} に繰越しました`;
  }
  /** 発行前の請求書に載せた再請求を取り下げる（行が消え、元の請求書は「未入金（再請求なし）」） */
  function unCarry(fromId: string) {
    const f = S.invoices.find((x) => x.id === fromId); if (!f || !f.carriedTo) throw new ApiError('再請求が見つかりません', 404);
    const t = S.invoices.find((x) => x.id === f.carriedTo);
    if (t) {
      if (t.status === 'DISPATCHED') throw new ApiError('再請求を載せた請求書が発行済みのため取り下げられません（発行後に入金が分かったときの扱いは確認待ち）', 400);
      t.lines = t.lines.filter((l) => l.from !== f.id);
      Object.assign(t, taxSplit(t.lines)); t.total = t.tot;
    }
    log('佐藤', `${f.id} の再請求（${f.carriedTo}）を取り下げ`);
    f.carriedTo = null; f.status = 'DISPATCHED'; f.unpaid = false; f.rqWd = true;
    return '再請求を取り下げました（行を外しました）。必要なら正しい内容で再請求し直してください';
  }
  function addCarries(id: string) {
    const t = S.invoices.find((x) => x.id === id); if (!t) throw new ApiError('請求書が見つかりません', 404);
    const n = autoCarry(t);
    return n ? `${n}通の再請求を加えました` : '加える再請求はありません';
  }
  /** 請求書の編集（品名・備考。登録済みの間だけ） */
  function saveInvoice(id: string, names: Record<number, string>, note: string) {
    const i = S.invoices.find((x) => x.id === id); if (!i) throw new ApiError('請求書が見つかりません', 404);
    if (i.status !== 'REGISTERED') throw new ApiError('発行済み（または取消済み）の請求書は編集できません', 400);
    /* 入力チェック：品名は必須・60文字まで（契約_06 #3）、備考は500文字まで（input_standard） */
    for (const [n, v] of Object.entries(names)) {
      if (!i.lines[+n]) continue;
      if (!v.trim()) throw new ApiError(`${+n + 1}行目の品名を入力してください`, 400);
      if ([...v.trim()].length > 60) throw new ApiError(`${+n + 1}行目の品名は60文字以内で入力してください`, 400);
    }
    if ([...note].length > 500) throw new ApiError('備考は500文字以内で入力してください', 400);
    Object.entries(names).forEach(([n, v]) => { const l = i.lines[+n]; if (l) l.n = v.trim(); });
    i.note = note;
    log('佐藤', `${i.id} の請求書を保存`);
    return '保存しました';
  }

  return {
    S, month, nextM, co, br, brsOf, planOf, ownBill, subNo, leadOf, tgtM, dedOf, empOf, priceRow, planFee,
    fixRows, discRows, advLines, advTot, calc, cashOf, arrLines, arrTot, penaltyOn, adjOn, adjTot, adjNext, brTot, brOK, locked, actDeferred, actLock,
    invNow, billedNow, editLock, lockMsg, canAdj, invLines, dueCalc, invRest, canMark, isUnpaid, unpaidAll, payStatus, carriesTo,
    invGroups, monthOf, monthChoices, grpInv, pastGroups, pastB, carryFor, diffRows, chgOf, gView, groupsOf, findGroup, groupHref,
    partsOf, partOK, partsN, firstWait, theo, theoTot, stockLoss, rates, rowRates, makePreview, issueDay,
    setFix, confirmFix, confirmAllFix, setAct, setPart, actAll, unAct, bulkAct, editActual, remind,
    addStockAdj, addStockAdjBulk, removeAdjust, addAdj, stopAdj, delAdj,
    makeInvGrp, dispatchOne, bulkGrp, withdraw, markUnpaid, carryOver, unCarry, addCarries, saveInvoice,
  };
}
type GroupViewLite = { i: Invoice | null; g: { c: Co; bid: string | null } };
export type BillingLogic = ReturnType<typeof billingLogic>;
