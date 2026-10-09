import { CARRIERS, METHODS, SPLIT_MAX } from './constants';
import { addDays, parseDate, today } from './dates';
import type { Order, Part, Supplier, Tab } from './types';
import { fmtDate } from '@/lib/format/date';

export const TABS: Tab[] = ['納期回答待ち', '本発注の承認待ち', '出荷待ち', '出荷済', '受注不可', 'キャンセル'];

/** 最後に出荷した回の値を、発注の一覧用の欄に写す */
export function syncOrder(o: Order): Order {
  const ps = o.parts ?? [];
  const sh = ps.filter((x) => x.st === '出荷済');
  const last: Partial<Part> = sh[sh.length - 1] ?? {};
  o.eta = ps.length ? ps.map((x) => x.eta).sort()[0] : '';
  o.ship = sh.length ? sh.map((x) => x.ship ?? '').sort().pop()! : '';
  o.carrier = last.carrier ?? '';
  o.slip = last.slip ?? '';
  o.bb = last.bb ?? '';
  o.method = last.method ?? '';
  return o;
}

/* ===== 状態の判定 ===== */
/** 本発注を承認していて、出荷報告ができる */
export const canShip = (o: Order) => o.ans === '納期回答済' && o.hon > 0 && o.honAck;
/** 本発注が届いていて、承認がまだ */
export const needHon = (o: Order) => o.ans === '納期回答済' && o.hon > 0 && !o.honAck;
/** 本発注の欄を出すか。納期回答待ち（仮発注の段階）は出さない（RV-SUP S-g） */
export const honVisible = (o: Order) => o.hon > 0 && o.ans !== '納期回答待ち';
export const qtyOf = (o: Order) => (o.hon > 0 ? o.hon : o.kari);
export const nShipped = (o: Order) => (o.parts ?? []).filter((x) => x.st === '出荷済').length;
/**
 * 送り状番号が必須か。2026/10/02 改定（REQ-PO-135・hong 回答 Q18）で送り状番号は「すべて任意」（普段はチェックせず、未着時の追跡に使う）。
 * 旧：直送のときだけ必須（2026/10/01 R9）。呼び出し側を残すため関数は残し、常に false
 */
export const needSlip = (_method?: string) => false;
export const groupKey = (o: Order) => o.pid + '|' + o.ym;

export const tabOf = (o: Order): Tab =>
  o.ans === '納期回答待ち' ? '納期回答待ち'
  : needHon(o) ? '本発注の承認待ち'
  : o.ans === '納期回答済' ? '出荷待ち'
  : o.ans === '受注不可' ? '受注不可'
  : o.ans === 'キャンセル' ? 'キャンセル'
  : '出荷済';

/** 入荷希望日の範囲（表示用。例：2026-11-07 〜 2026-11-12） */
export const wishRange = (o: Order) => {
  const w = (o.rows ?? []).map((r) => r.wish).filter(Boolean).sort();
  return !w.length ? '—' : w[0] === w[w.length - 1] ? fmtDate(w[0]) : fmtDate(w[0]) + ' 〜 ' + fmtDate(w[w.length - 1]);
};
export const firstWish = (o: Order) => (o.rows ?? []).map((r) => r.wish).filter(Boolean).sort()[0];

/** 本発注から営業日24時間ごとに送ったアラートの回数 */
export function alertCount(o: Order, sup: Supplier): number {
  if (!needHon(o) || !o.honAt) return 0;
  const isBiz = (d: string) => {
    const w = parseDate(d).getDay();
    return sup.bizDay === 'はい' || (w !== 0 && w !== 6);
  };
  const t = today();
  let d = o.honAt.slice(0, 10);
  let n = 0;
  while (d < t) {
    d = addDays(d, 1);
    if (d <= t && isBiz(d)) n++;
  }
  return n;
}

/** 同じ商品・同じ月の発注のまとめ（一覧の「商品・月でまとめる」） */
export function groupInfo(o: Order, mine: Order[]) {
  const g = mine.filter((x) => groupKey(x) === groupKey(o) && !['受注不可', 'キャンセル'].includes(x.ans));
  return {
    n: g.length,
    qty: g.reduce((a, x) => a + qtyOf(x), 0),
    kari: g.filter((x) => x.ans !== '納期回答待ち').length,
    hon: g.filter((x) => honVisible(x)).length,
    honOk: g.filter((x) => honVisible(x) && x.honAck).length,
    shipped: g.filter((x) => x.ans === '出荷済').length,
  };
}

/* ===== 入力チェック ===== */
export type Errors = Record<string, string>;

/** 仮発注への回答（承認＝出荷予定日） */
export type RespDraft = { mode: 'approve' | 'reject'; split: boolean; parts: { eta: string; qty: number | '' }[]; reason: string; comment: string };

export function validateResp(o: Order, r: RespDraft): Errors {
  const er: Errors = {};
  if (r.mode === 'reject') {
    if (!r.reason) er.reason = '理由を選択してください';
    if (!r.comment.trim()) er.comment = 'コメントを入力してください';
    return er;
  }
  const total = qtyOf(o);
  r.parts.forEach((x, i) => {
    if (!x.eta) er['e' + i] = '出荷予定日を入力してください';
    else if (x.eta < today()) er['e' + i] = '今日以降の日付を入力してください';
    if (!(+x.qty > 0)) er['q' + i] = '1以上の数量を入力してください';
  });
  const sum = r.parts.reduce((a, x) => a + (+x.qty || 0), 0);
  if (sum !== total) er.sum = `回答数量の合計（${sum}）が発注数量（${total}）と一致しません`;
  const fw = firstWish(o);
  if (r.parts.length > SPLIT_MAX) er.sum = `分納は${SPLIT_MAX}回までです`;
  r.parts.forEach((x, i) => {
    if (x.eta && fw && x.eta >= fw && !er['e' + i]) er['e' + i] = `最初の入荷希望日（${fmtDate(fw)}）より前に出荷してください（分納の各回とも）`;
  });
  return er;
}

/** 入力チェックはここ（画面）でも API でも同じものを使う想定。本番では API 側でも必ず検証する */

/** 本発注の承認（納品日・入荷箱数・賞味期限（必須・資材は持たない：台帳 E 2026-10-05。REQ-PO-606））。warned＝箱数×入り数の確認を一度出した回 */
export type HonDraft = { split: boolean; parts: { eta: string; dlv: string; qty: number | ''; box: number | '' | string; bb?: string }[]; warned: Record<number, boolean> };

export function validateHon(o: Order, h: HonDraft): { errors: Errors; warned: Record<number, boolean> } {
  const er: Errors = {};
  const warned = { ...h.warned };
  h.parts.forEach((x, i) => {
    if (!x.eta) er['he' + i] = '出荷予定日を入力してください';
    else if (x.eta < today()) er['he' + i] = '今日以降の日付を入力してください';
    if (!x.dlv) er['hd' + i] = '納品日を入力してください';
    else if (x.dlv < today()) er['hd' + i] = '今日以降の日付を入力してください';
    else if (x.eta && x.dlv < x.eta) er['hd' + i] = '出荷予定日以降の日付を入力してください';
    if (!(+x.qty > 0)) er['hq' + i] = '1以上の数量を入力してください';
    if (!/^[1-9]\d*$/.test(String(x.box))) er['hb' + i] = '1以上の整数を入力してください';
    /* 賞味期限（消費期限）は必須（資材は持たない・台帳 E 2026-10-05）。出荷予定日より後。出荷報告の初期値になる */
    if (o.type !== '資材' && !x.bb) er['hbb' + i] = (o.type === '短消費期限' ? '消費期限' : '賞味期限') + 'を入力してください';
    else if (x.bb && x.eta && x.bb <= x.eta) er['hbb' + i] = (o.type === '短消費期限' ? '消費期限' : '賞味期限') + 'は出荷予定日より後の日付にしてください';
  });
  const sum = h.parts.reduce((a, x) => a + (+x.qty || 0), 0);
  if (sum !== o.hon) er.hsum = `数量の合計（${sum}）が本発注数（${o.hon}）と一致しません`;

  /* 決定 C2：分納の回数・納品日の範囲／箱数×入り数の確認 */
  const fw = firstWish(o);
  const lot = o.lot || 1;
  if (h.parts.length > SPLIT_MAX) er.hsum = `分納は${SPLIT_MAX}回までです`;
  h.parts.forEach((x, i) => {
    if (x.dlv && fw && x.dlv > fw && !er['hd' + i]) er['hd' + i] = `納品日は最初の入荷希望日（${fmtDate(fw)}）までにしてください（分納の各回とも）`;
    const b = +x.box;
    const q = +x.qty;
    if (b && q && b > q) er['hb' + i] = '箱数が数量より多くなっています（箱数と数量が逆になっていませんか）';
    else if (b && q && lot > 1 && Math.abs(b * lot - q) >= lot && !er['hb' + i] && !warned[i]) {
      warned[i] = true;
      er['hb' + i] = `箱数×入り数（${b}×${lot}＝${(b * lot).toLocaleString()}）と数量（${q.toLocaleString()}）が合いません。このままでよければ、もう一度承認を押してください`;
    }
  });
  return { errors: er, warned };
}

/** 出荷報告の入力 */
export type ShipDraft = { method: string; ship: string; carrier: string; slip: string; bb: string; note: string };

export function validateShip(o: Order, v: ShipDraft): Errors {
  const e: Errors = {};
  const short = o.type === '短消費期限';
  if (!v.method) e.method = '配送方法を選択してください';
  if (!v.ship) e.ship = '出荷日を入力してください';
  /* 直送（運送会社利用）のときは運送会社が必須（台帳 I・2026-10-08）。自社配送・倉庫へ持込は任意 */
  if (v.method.startsWith('直送') && !v.carrier) e.carrier = '運送会社を選択してください';
  /* 送り状番号は任意（REQ-PO-135 2026/10/02 改定）で、形式（桁数）は見ない（台帳 I・2026-10-07） */
  if (o.type !== '資材') {
    const label = short ? '消費期限' : '賞味期限';
    if (!v.bb) e.bb = label + 'を入力してください';
    else if (v.ship && v.bb <= v.ship) e.bb = label + 'は出荷日より後の日付にしてください';
  }
  return e;
}

/**
 * 出荷報告の初期値（REQ-PO-619）。保存した値（一括保存・本発注の承認の賞味期限）→ 前回の出荷報告の配送方法・運送会社 → プロフィールの納品条件の順。
 * 選択肢にない値は使わない
 */
export function shipDefaults(p: Part, me: Pick<Supplier, 'defMethod' | 'defCarrier' | 'lastMethod' | 'lastCarrier'>): ShipDraft {
  const pick = (list: string[], ...vs: (string | undefined)[]) => vs.find((x) => x && list.includes(x)) ?? '';
  return {
    method: pick(METHODS, p.method, me.lastMethod, me.defMethod), ship: p.ship || today(), carrier: pick(CARRIERS, p.carrier, me.lastCarrier, me.defCarrier),
    slip: p.slip ?? '', bb: p.bb ?? '', note: p.note ?? '',
  };
}

export const MAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
