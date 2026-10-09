import { mergeByGroup, planLineName, taxOfRate } from '@/lib/domain/invoiceTax';
/*
 * 請求書・棚卸報告・売上の計算（画面と actions の両方で使う）。元：22_法人_拠点管理.html の Bills・Inv・Stock、fsl の一覧の決まり。
 */
import { PRODUCTS } from '@/lib/domain/seed/master';
import type { BillByKind, BillDetail, BillRow, BillState, CorpInv, CorpInvLine, CorpMeta, SiteMeta, StockCfg, StockMonth, StockProduct, StockRec, WhoCand } from './types';
import { fmtYm } from '@/lib/format/date';
import { today } from '@/lib/supplier/dates';

export { yen as yenS } from '@/lib/format/money';
/** 2026/10/05 F2：消費税の端数は四捨五入（請求書ごと・税率ごとの合計に対して）。負の額は絶対値で四捨五入して符号を戻す */
export const taxR = taxOfRate;
/** 'YYYY-MM' → 表示の 'YYYY-MM'（共通の表示ルール・決定 8-1） */
export const ymJa = (v: string) => fmtYm(v);

/* ---------------- 請求書 ---------------- */

/** ご利用実績の精算の費目名・対象期間から表示の期間（2026/08/21〜2026/09/20 → 2026/08/21〜09/20） */
export function actPeriodOf(n: string) {
  const m = n.match(/(\d{4}\/\d{2}\/\d{2})〜(?:\d{4}\/)?(\d{2}\/\d{2})/);
  return m ? `${m[1]}〜${m[2]}` : '';
}

/** 明細の金額（税抜の小計・区分×税率ごとの対象額・税率ごとの対象額・消費税） */
export function sumLines(lines: CorpInvLine[]) {
  let sub = 0, fixed = 0;
  const base: Record<string, number> = {};
  const byKind: BillByKind = { 固定額: {}, ご利用実績の精算: {} };
  lines.filter((l) => l.kind !== '調整').forEach((l) => {
    sub += l.a;
    if (l.kind === '固定額') fixed += l.a;
    Object.keys(l.tx).forEach((k) => {
      base[k] = (base[k] || 0) + l.tx[k];
      const kk = byKind[l.kind as keyof BillByKind];
      if (kk) kk[k] = (kk[k] || 0) + l.tx[k];
    });
  });
  /* 税率ごとの対象額・消費税（税率マスタのどの率でも・小さい率から：2026-10-05 版1.3）。消費税は invoiceTax.taxOfRate で四捨五入 */
  const rates = Object.keys(base).map(Number).filter((r) => base[r] !== 0).sort((a, b) => a - b).map((r) => ({ r, base: base[r], tax: taxOfRate(base[r], r) }));
  const of = (r: number) => rates.find((x) => x.r === r);
  return { sub, fixed, act: sub - fixed, base8: of(8)?.base ?? 0, base10: of(10)?.base ?? 0, t8: of(8)?.tax ?? 0, t10: of(10)?.tax ?? 0, tax: rates.reduce((a, x) => a + x.tax, 0), rates, byKind };
}
const rebillOf = (lines: CorpInvLine[]) => { const r = lines.find((l) => l.kind === '調整' && l.adj === '再請求'); return r ? { no: r.from ?? '', amt: r.a } : null; };

/** 拠点の分の金額（税込）。法人あての請求書のうちこの拠点の分（参考） */
export function siteAmount(inv: CorpInv, site: string) {
  const s = sumLines(inv.lines.filter((l) => l.site === site));
  return s.sub + s.tax;
}

/**
 * 請求書の一覧（RV2-CORP-20261002）。
 * 法人アカウント：請求先が法人の請求書（法人あて）＋請求先が拠点の請求書（拠点あて）を全部。
 * 拠点アカウント（と解約後の参照のみ）：自分の拠点の分だけ（請求先が法人の拠点は、法人あての請求書のうちこの拠点の分＝内訳）。
 */
export function billRows(invs: CorpInv[], sites: SiteMeta[], corp: CorpMeta, branchMode: boolean): BillRow[] {
  const rows: (BillRow & { i: number })[] = [];
  let i0 = 0;
  const corpInvs = invs.filter((x) => !x.site).sort((a, b) => (a.id < b.id ? 1 : -1));
  if (!branchMode) corpInvs.forEach((r) => rows.push({ no: r.id, at: r.issued, mon: r.mon, to: `法人あて（${corp.name}）`, amt: r.total ?? (() => { const s = sumLines(r.lines); return s.sub + s.tax + (rebillOf(r.lines)?.amt ?? 0); })(), due: r.due, st: r.st, rebillMark: r.rebillMark, site: null, part: false, final: !!r.final, i: i0++ }));
  sites.forEach((s) => {
    const toCorp = s.billTo === '法人';
    if (toCorp && !branchMode) return;   /* 法人あての請求書にまとめて入る */
    const mine = toCorp ? corpInvs.filter((r) => r.lines.some((l) => l.site === s.id)) : invs.filter((r) => r.site === s.id).sort((a, b) => (a.id < b.id ? 1 : -1));
    mine.forEach((r) => rows.push({
      no: r.id, at: r.issued, mon: r.mon, to: toCorp ? `法人あて（${corp.name}）のうち この拠点の分` : `拠点あて（${s.name.startsWith(corp.name) ? s.name.slice(corp.name.length).trim() || s.name : s.name}）`,
      amt: toCorp ? siteAmount(r, s.id) : r.total ?? siteAmount(r, s.id), due: r.due, st: r.st, rebillMark: r.rebillMark, site: s.id, part: toCorp, final: !!r.final, i: i0++,
    }));
  });
  rows.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : a.i - b.i));
  return rows.map(({ i: _i, ...r }) => r);
}

/** 請求書詳細。siteId があれば、その拠点の画面から開いたもの（法人あてならこの拠点の分だけ＝内訳（参考）） */
export function billDetail(inv: CorpInv, corp: CorpMeta, sites: SiteMeta[], siteId: string | null): BillDetail | null {
  const s0 = siteId ? sites.find((x) => x.id === siteId) ?? null : null;
  const corpInv = !s0;
  if (s0 && inv.site && inv.site !== s0.id) return null;
  if (s0 && !inv.site && !inv.lines.some((l) => l.site === s0.id)) return null;
  const toCorp = !!s0 && !inv.site;
  const name = (id: string) => sites.find((x) => x.id === id)?.name ?? id;
  const lines = corpInv ? inv.lines : inv.lines.filter((l) => l.site === s0!.id);
  const s = sumLines(lines);
  const rebill = corpInv ? rebillOf(inv.lines) : null;
  /* 法人の請求書全体は運営Web の請求書の金額のまま */
  const whole = corpInv || !toCorp;
  const tax = whole && inv.tax !== undefined ? inv.tax : s.tax;
  const total = whole && inv.total !== undefined ? inv.total : s.sub + tax + (rebill ? rebill.amt : 0);
  const bill = s0 ? s0.staff.find((r) => r[0] === '請求担当者') : undefined;
  return {
    no: inv.id, corpInv, site: s0 ? { id: s0.id, name: s0.name } : null, toCorp,
    dest: corpInv ? `${corp.bname} 御中` : toCorp ? `${corp.bname} 御中（法人あてにまとめて発行）` : `${s0!.name} 御中`,
    sendTo: corpInv || toCorp ? corp.billTo : bill ? `請求担当者：${bill[1]} ／ ${bill[3]}` : '—',
    pay: corpInv || toCorp ? corp.pay : s0!.pay,
    issued: inv.issued, mon: inv.mon, due: inv.due, tgt: inv.tgt, actPeriod: inv.actPeriod, st: inv.st, rebillMark: inv.rebillMark,
    /* 福利厚生の適用 OFF のプラン料金の2行は1行にまとめて出す（28-150。税率ごとの内訳は下の欄に両方出る） */
    rows: mergeByGroup(lines.filter((l) => l.kind !== '調整'), (l) => l.mg, (xs) => ({
      ...xs[0], n: planLineName(xs[0].n), a: xs.reduce((s2, y) => s2 + y.a, 0), rate: xs.map((y) => y.rate).join('・'),
      tx: xs.reduce<Record<string, number>>((m, y) => { for (const [k, v] of Object.entries(y.tx)) m[k] = (m[k] ?? 0) + v; return m; }, {}),
    })).map((l) => ({ ...l, siteName: name(l.site) })),
    rebill, sub: s.sub, fixed: s.fixed, act: s.act, base8: s.base8, base10: s.base10, t8: s.t8, t10: s.t10, rates: s.rates, byKind: s.byKind, tax, total, final: !!inv.final,
  };
}
/**
 * 請求書詳細の URL。site＝拠点の分（拠点の画面から開くとき・拠点あての請求書）。
 * from＝戻り先：bills（請求書の一覧）／corp（法人情報の請求タブ）／site（拠点詳細の請求タブ）
 */
export const billHref = (no: string, site: string | null, from: 'bills' | 'corp' | 'site' = 'bills') =>
  `/corp/bills/${no}?${new URLSearchParams({ ...(site ? { site } : {}), from }).toString()}`;
/**
 * Bill One の送付（課題 0-2）→ 法人Web のバッジ（版1.1・台帳 E 2026-10-05 ⑧）：送付できた請求書だけ「送付済み」。
 * 送付前・送付できなかった請求書は ''（画面は「—」。送付のエラー・記録は法人に出さない。ESキッチンが宛先を直して送り直す）
 */
export const sentLabel = (st: string | null | undefined) => (st === '送付済' || st === '開封済' ? '送付済' : '');
/** 区分・費目の表示名（台帳 B 2026-10-03）：「固定額」「ご利用実績の精算」「調整」。「前払い」「後払い」は出さない（共通データの区分はすでにこの名前。古い名前が来ても直す） */
export const kindLabel = (k: string) => k.replace(/（前払い）|（後払い）/g, '');
/** 状態のバッジの色（B-23：確定 青・請求済み 緑・送付済み 緑・再請求 黄） */
export const billTone = (st: string) => (st === '請求済' || st === '送付済' ? 'success' : st === '確定' ? 'info' : st.indexOf('再請求') >= 0 ? 'warning' : 'neutral');
/**
 * 再請求のバッジの文言（受付簿 No.157）。相手の請求書番号 mark が自分より古ければ、自分は再請求した新しい請求書＝「再請求分を含む（INV-旧）」。
 * 新しければ、自分は再請求された古い請求書＝「再請求済み（→INV-新）」（請求書番号は発行の順に大きくなる）
 */
export const rebillBadge = (self: string, mark: string) => (mark < self ? `再請求分を含む（${mark}）` : `再請求済み（→${mark}）`);
export const BILL_STATES: BillState[] = ['確定', '請求済'];

/* ---------------- 棚卸報告（CW_STOCK） ---------------- */

/**
 * 棚卸報告の商品（共通データの商品マスタ M001〜M032 の並び。dm.master.products の元と同じ）。
 * 拠点ごと・月度ごとに扱う商品は違うので、全商品を並べる（扱っていない商品は 0）。STOCK_IDS は同じ並びの商品ID
 */
export const STOCK_IDS = PRODUCTS.map((p) => p.id);
export const STOCK_PROD = PRODUCTS.map((p) => p.name);
/**
 * 月度（今回＋過去3か月：台帳 E 2026-10-05）。先頭が今回の月度。締め日（20日）の在庫を数えて、お客様は20日まで報告する（STEP5-SK-20261001）。
 * 未報告の判定は25日（21〜25日はESキッチンが代理で追加・修正。25日までに数が入れば事務手数料はかからない：台帳 E「棚卸報告の未報告の判定」）。
 * 今回の月度＝今日が21日以降なら翌月（共通データの report.periodOf と同じ決め方）。共通データの棚卸報告は 2026-09 の締めから（それより前の記録はない）
 */
const addMonths = (ym: string, n: number) => { const [y, m] = ym.split('-').map(Number); const d = new Date(Date.UTC(y, m - 1 + n, 1)); return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`; };
/** 月度（YYYY-MM）→ 対象期間（前月21日〜当月20日）・締め日・報告期限・判定日（25日）・前の月度。t＝今日（YYYY/MM/DD） */
export function stockMonthOf(m: string, t: string = today().replace(/-/g, '/')): StockMonth {
  const prev = addMonths(m, -1), base = m.replace('-', '/');
  const close = `${base}/20`, judge = `${base}/25`;
  return { m, label: m, period: `${prev.replace('-', '/')}/21〜${m.slice(5)}/20`, close, due: close, judge, prev, open: t <= close, judged: t > judge };
}
export function stockMonths(todayYmd: string = today()): StockMonth[] {
  const t = todayYmd.replace(/-/g, '/');
  const [y, m, d] = t.split('/').map(Number);
  const cur = addMonths(`${y}-${String(m).padStart(2, '0')}`, d >= 21 ? 1 : 0);
  return [0, 1, 2, 3].map((i) => stockMonthOf(addMonths(cur, -i), t));
}
/** 報告の方法（CW_STOCK_001 No.3.9。「在庫点検」という語は使わない：hong 2026-10-05 版1.0レビュー ②） */
export const STOCK_WAY: Record<string, string> = {
  corp: '企業担当者（法人Webの棚卸報告）', driver: 'ES配送便ドライバー（ドライバーアプリ）', none: '—（休止中のため棚卸なし）', nocheck: '棚卸報告なし（この拠点は棚卸報告をしません）',
  /* ES配送便の拠点でまだ報告がないとき（ドライバーも法人も報告できる：B-21） */
  both: 'ES配送便ドライバー（ドライバーアプリ）または企業担当者（法人Webの棚卸報告）',
  paused: 'なし（休止中は棚卸報告をしません。休止の始めと再開のときに棚卸します）',
};
/** 報告の方法の短い形（棚卸一覧 CW_STOCK_002 No.36.8） */
export function stockWayShort(c: StockCfg | undefined, m: string): string {
  if (skPaused(c, m)) return 'なし';
  const w = wayAt(c, m);
  return w === 'corp' ? '企業担当者（法人Web）' : w === 'driver' ? 'ES配送便ドライバー・企業担当者' : 'なし';
}
/** 棚卸一覧・状態の絞り込みの選択肢（CW_STOCK_002 No.35.3） */
export const STOCK_FILED = '報告済';
export const STOCK_STATES = ['未報告', '未報告（ESキッチンが確認中）', STOCK_FILED, '未報告（事務手数料あり）', 'ご契約前', '棚卸なし（休止中）', '棚卸なし'];

export const skPaused = (c: StockCfg | undefined, m: string) => !!(c && c.pauseFrom && m >= c.pauseFrom);
/** その月度の棚卸する人（corp＝企業担当者／driver＝ES配送便ドライバー。どちらでも法人Webから報告できる：B-21）。休止の始めの棚卸の月度はお客様 */
export const wayAt = (c: StockCfg | undefined, m: string): StockCfg['way'] => (c && c.pauseCheck === m && c.way === 'driver' ? 'corp' : c?.way ?? 'none');
/**
 * 状態（バッジ）。empty＝その月度に報告する商品が1つもない（前回の棚卸・お届け・お届け中・廃棄のどれもない）。
 * 報告する商品がない過去の月度は、報告できない（E323）ので事務手数料もかからない → 「棚卸なし」（要確認：見本データが 2026-09 の締めから始まるため）
 */
export function stockStat(c: StockCfg | undefined, M: StockMonth, r: StockRec | null, empty = false): { t: string; tone: string } {
  if (!c || c.way === 'none' || c.way === 'nocheck') return { t: '棚卸なし', tone: 'neutral' };
  if (c.from && M.m < c.from) return { t: 'ご契約前', tone: 'neutral' };   /* STEP5-MORE：ご契約の前の月は棚卸なし */
  if (skPaused(c, M.m)) return { t: '棚卸なし（休止中）', tone: 'neutral' };   /* RV-CORP-20261002 C-q */
  if (r) return { t: STOCK_FILED, tone: 'success' };
  if (M.open) return { t: '未報告', tone: 'warning' };
  if (empty) return { t: '棚卸なし', tone: 'neutral' };
  /* 21〜25日：お客様の入力は締め切ったが、判定（25日）はまだ。ESキッチンが代理で入れれば事務手数料はかからない */
  if (!M.judged) return { t: '未報告（ESキッチンが確認中）', tone: 'warning' };
  return { t: '未報告（事務手数料あり）', tone: 'negative' };
}
/** その月度に報告する商品がない（前回の棚卸・届けた・お届け中のどれもない。廃棄だけの行は数えない：下書きは今日までの廃棄を拾うため） */
export const sheetEmpty = (items: { prev: number; delivered: number; inTransit: number }[] | undefined) => !items || items.every((x) => !x.prev && !x.delivered && !x.inTransit);
/** 状態の並び（棚卸一覧の既定：やることがある順。未報告 → 報告済み → 棚卸なし・休止中・ご契約前） */
export const stockRank = (t: string) => (t.startsWith('未報告') ? 0 : t === STOCK_FILED ? 1 : 2);
/** 棚卸数の上限（台帳 N「数量の桁」：棚卸数 999,999）。超えたら切り詰めずにエラー（E12） */
export const STOCK_MAX = 999999;
/** RV-CORP-20261002 C-g ①：全角の数字は半角に。数字だけ（桁は切り詰めない。上限は STOCK_MAX で確かめる） */
export const stockInput = (v: string) => String(v).replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xFEE0)).replace(/[^0-9]/g, '');
/** JAN コードの入力：全角の数字は半角に。数字だけ・13桁まで */
export const janInput = (v: string) => String(v).replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xFEE0)).replace(/[^0-9]/g, '').slice(0, 13);
/** 商品名の検索の正規化（全角・半角、ひらがな・カタカナ、大文字・小文字の違いを無視） */
export const normName = (v: string) => String(v).normalize('NFKC').toLowerCase().replace(/[ぁ-ん]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60)).replace(/\s+/g, '');
/** 「商品を追加」の候補：JAN（8桁か13桁）の一致、または商品名・カナの部分一致（2文字以上・最大 20件）。すでに表にある商品は出さない */
export function stockCands(products: StockProduct[], jan: string, name: string, inTable: string[]): StockProduct[] {
  const ok = products.filter((p) => !inTable.includes(p.id));
  if (jan.length === 8 || jan.length === 13) return ok.filter((p) => (p.jans?.length ? p.jans : [p.jan]).includes(jan));
  const q = normName(name);
  if (q.length < 2) return [];
  return ok.filter((p) => normName(p.name).includes(q) || normName(p.nameEn ?? '').includes(q) || normName(p.kana).includes(q)).slice(0, 20);
}
/** 申告の入力チェック（すべての商品の数。ない商品は 0） */
export function stockErrors(vals: (string | number | undefined | null)[]): string {
  if (vals.length !== STOCK_PROD.length || vals.some((x) => x === undefined || x === null || x === '')) return 'すべての商品の数を入力してください（ない商品は 0）';
  if (vals.some((x) => !/^[0-9]+$/.test(String(x)) || Number(x) > STOCK_MAX)) return '数は0〜999,999の範囲でご入力ください。';
  return '';
}

/** 申告した方の候補（共有アカウントなので、登録済みのご担当者から選ぶ）。法人アカウント＝法人＋対象拠点のご担当者／拠点アカウント＝その拠点のご担当者 */
/** 既定＝その拠点のメイン担当者（main）。先頭に置く（hong 2026-10-05 版1.0レビュー ③） */
export function whoCands(corp: CorpMeta | undefined, sites: SiteMeta[], branch: boolean): WhoCand[] {
  const out: WhoCand[] = [], seen: Record<string, 1> = {};
  const push = (st: SiteMeta['staff'], where: string, site: boolean) => st.forEach((r) => {
    const k = r[3] || r[1];
    if (!k || seen[k]) return;
    seen[k] = 1;
    out.push({ value: k, name: r[1], where, kind: r[0], mail: r[3], ...(site && r[0] === 'メイン担当者' ? { main: true } : {}) });
  });
  if (!branch && corp) push(corp.staff, '法人', false);
  sites.forEach((s) => push(s.staff, s.name, true));
  const i = out.findIndex((x) => x.main);
  if (i > 0) out.unshift(...out.splice(i, 1));
  return out;
}

/* ---------------- 売上・ユーザー管理（一覧の決まり：10件（10／20／50）・並べ替え（項目＋昇順／降順）） ---------------- */
export function sortRows<T>(rows: T[], sk: string, dir: 'asc' | 'desc'): T[] {
  let out = rows;
  if (sk) {
    out = rows.slice().sort((a, b) => {
      const x = (a as Record<string, unknown>)[sk], y = (b as Record<string, unknown>)[sk];
      if (typeof x === 'number' && typeof y === 'number') return x - y;
      return String(x).localeCompare(String(y), 'ja', { numeric: true });
    });
  }
  return dir === 'desc' ? out.slice().reverse() : out;
}
