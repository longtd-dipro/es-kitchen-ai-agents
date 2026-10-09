import { ApiError } from '@/lib/api/errors';
import { nowStamp } from '@/lib/supplier/dates';
import { toNum } from '@/lib/format/money';
import account, { log as auditLog } from '@/lib/domain/areas/account';
import org from '@/lib/domain/areas/org';
import domainOrder from '@/lib/domain/areas/order';
import { childLocked, methodOf, pricesAt, publicGenOf, publicPricesOf, yenOf } from '@/lib/domain/snapshot';
import { switchRange, switchTrialByOps } from '@/lib/domain/lifecycle';
import type { Branch as DBranch, ChildContract as DChild, Contract, Corp as DCorp } from '@/lib/domain/types';
import { defineArea, type DocRepo } from '../core/area';
import { assertFresh } from '../core/concurrency';
import {
  amountBlock, applyDeps, baseFill, BR_MSG, BRANCH_NEXT, EMAIL_MSG, EMAIL_RE, CONTRACT_STATUS_OPTS, cellText, CHILD_TABLE, CLOSED_EDITABLE_TABLE, FORMS, genPlan, laterOf,
  sumOf, tablesFor, validate, valuesOf,
} from '../contracts/logic';
import {
  addressOf, billingOf, branchFill, branchOpsOf, branchRow, channelsFromRows, slotRoutesFromRows, childFill, childRow, contactsFromRows, corpFill, corpRow,
  byId, currentOf, deadlineOf, extraOf, leadOfOpt, load, putExtra, thisMonth, type Ctx,
} from '../contracts/fromDomain';
import type {
  Branch, ChildContract, Corp, DetailData, Entity, FormFill, FormVal, TableRow,
} from '../contracts/types';
import { SLOT_ROUTE_TABLE } from '../contracts/forms';

/*
 * 法人・契約管理（法人一覧・拠点一覧・子契約一覧と、その詳細・編集）。配送ルートの一括変更の画面は廃止（課題 7-2：マスタのモーダル＝lib/domain/bulk.ts）。
 * 元：部品/12_運営_法人拠点契約.html ＋ main_script2.js の renderRtBulk。
 *
 * データは共通データ（lib/domain）：法人・拠点・担当者・親契約・子契約・休止・貸出・代理店（dm.org.*）、
 *   プラン・機種・オプション・値引き・倉庫・配送会社（dm.master.*）、申請（dm.apply）、請求書（dm.billing）、アカウント（dm.account）。
 *   画面の形は lib/ops/contracts/fromDomain.ts で作る。保存は共通データの action（org.updateCorp など）で書く。
 * 共通データにないものだけ運営Web の kind に持つ：
 *   contracts.extra     詳細画面の、共通データにない項目を運営が直した値（id＝<entity>:<ID>）
 *   contracts.routeRuns 配送ルートの一括変更の履歴（廃止した画面のもの。一括変更の履歴はいまは dm.bulk.changes）
 */
export const K = { extra: 'contracts.extra', routeRuns: 'contracts.routeRuns' } as const;

type Row = Corp | Branch | ChildContract;
const NOUN: Record<Entity, string> = { corp: '法人', branch: '拠点', child: '子契約' };
const notFound = (e: Entity, id: string) => new ApiError(`${NOUN[e]}（${id}）が見つかりません`, 404);

/** 項目に紐づく入力エラー（CSV取込では、行エラーの列名にこの項目名が出る：lib/domain/csv.ts） */
export class FieldError extends ApiError {
  constructor(readonly col: string, message: string, status = 400) { super(message, status); this.name = 'FieldError'; }
}

/** 契約終了日の入力 → 保存の形（YYYY/MM/DD。空・「—」＝なし）。日付でないときは入力エラー */
function endOnOf(raw: string): string {
  const t = raw.trim();
  if (!t || /^—/.test(t)) return '';
  const m = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/.exec(t);
  const d = m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  if (!m || !d || d.getFullYear() !== +m[1] || d.getMonth() !== +m[2] - 1 || d.getDate() !== +m[3]) throw new FieldError('契約終了日', BR_MSG.NEW_END_DATE);
  return `${m[1]}/${m[2].padStart(2, '0')}/${m[3].padStart(2, '0')}`;
}
/** 契約終了日の月より後の未確定の子契約の件数（W105） */
const openAfter = (cx: Ctx, contractId: string, endOn: string) =>
  cx.children.filter((k) => k.contractId === contractId && !childLocked(k) && k.cycleMonth > endOn.slice(0, 7).replace('/', '-')).length;
/** 契約終了日の確認：確定済み・発行済みの子契約の月より前は E53（エラー）、未確定の子契約が残れば W105（警告の文言を返す） */
function endOnCheck(cx: Ctx, contractId: string, endOn: string): string[] {
  if (!endOn) return [];
  const ym = endOn.slice(0, 7).replace('/', '-');
  const locked = cx.children.filter((k) => k.contractId === contractId && childLocked(k)).map((k) => k.cycleMonth).sort().pop();
  if (locked && ym < locked) throw new FieldError('契約終了日', BR_MSG.E53(locked));
  const n = openAfter(cx, contractId, endOn);
  return n ? [BR_MSG.W105(n)] : [];
}
/** CSV取込の確認用：保存後の拠点で、契約終了日より後に未確定の子契約が残るときの警告（W105） */
export function endOnWarnings(repo: DocRepo, branchId: string): string[] {
  const cx = load(repo);
  const ct = cx.contracts.find((c) => c.branchId === branchId);
  const n = ct?.endOn ? openAfter(cx, ct.id, ct.endOn) : 0;
  return n ? [BR_MSG.W105(n)] : [];
}

/** 画面の行（共通データから作る） */
function findRow(repo: DocRepo, cx: Ctx, entity: Entity, id: string): Row | undefined {
  if (entity === 'corp') { const c = byId(cx.corps, id); return c && corpRow(repo, cx, c); }
  if (entity === 'branch') { const b = byId(cx.branches, id); return b && branchRow(repo, cx, b); }
  /* 取り消した子契約（canceled）も開ける（参照のみ。一覧は灰で残す：台帳 Q-C7） */
  const k = byId(cx.allChildren, id);
  return k && childRow(repo, cx, k);
}
/** 共通データから作る項目（運営だけの値と分けるときに使う） */
function domainFill(cx: Ctx, entity: Entity, id: string): FormFill {
  if (entity === 'corp') return corpFill(cx, byId(cx.corps, id)!);
  if (entity === 'branch') return branchFill(cx, byId(cx.branches, id)!);
  return childFill(cx, byId(cx.allChildren, id)!);
}
const branchOfContract = (cx: Ctx, cp: string) => byId(cx.branches, byId(cx.contracts, cp)?.branchId);

/** 一覧の検索で使う、詳細の値（郵便番号・電話番号・市区町村・旧ES ユーザーID） */
function searchExtra(entity: Entity, row: Row) {
  const v = valuesOf(FORMS[entity], baseFill(entity, row));
  const s = (n: string) => String(v[n] ?? '');
  return entity === 'corp'
    ? { zip: s('郵便番号（請求書に載る住所）'), tel: s('電話番号（請求書に載る住所）'), kana: s('法人名フリガナ') }
    : { zip: s('郵便番号'), tel: s('電話番号'), city: s('市区町村'), legacy: s('旧ES ユーザーID') };
}

/**
 * 画面が読み込んだ版（E31・同時更新の検知）。画面に出す値と表の中身から作るので、画面の保存・CSV取込・一括変更・承認のどれで変わっても版が変わる。
 * 保存のとき、読み込んだ版（baseVersion）といまの版が違えば 409 STALE（「上書きして保存」＝force で通す。lib/ops/core/concurrency.ts）
 */
function verOf(values: Record<string, FormVal>, tables: Record<string, TableRow[]>): string {
  const t = JSON.stringify([values, tables]);
  let h = 2166136261;
  for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); }
  return `${(h >>> 0).toString(36)}-${t.length.toString(36)}`;
}

function detailOf<R extends Row>(entity: Entity, row: R): DetailData<R> & { version: string } {
  const fill = baseFill(entity, row);
  const values = valuesOf(FORMS[entity], fill);
  const shown = applyDeps(entity, values).values, tables = tablesFor(FORMS[entity], fill);
  return { row, values: shown, tables, sum: sumOf(entity, values, fill), version: verOf(shown, tables) };
}

/* ---------- 編集中の印（I02：ほかの人が同じ画面を編集中。ロックしない） ---------- */
const EDITING = 'contracts.editing';
/** 編集の画面が開いている間、30秒ごとに送る。この秒数を過ぎた印は無効（閉じ忘れ・通信切れ） */
const EDITING_TTL_MS = 90_000;
type Editing = { id: string; target: string; accountId: string; name: string; since: string; at: number };
const hhmm = (ms: number) => new Date(ms + 9 * 3600_000).toISOString().slice(11, 16);

/** 子契約の詳細で使う、拠点の一覧（子契約）と承認待ちの申請 */
function childCtx(repo: DocRepo, cx: Ctx, ch: ChildContract) {
  const b = branchOfContract(cx, ch.parentNo);
  const br = b ? branchRow(repo, cx, b) : undefined;
  const rows = br ? tablesFor(FORMS.branch, baseFill('branch', br))[CHILD_TABLE] : [];
  return { branch: br ?? null, later: laterOf(ch.id, rows), pending: br?.pending ?? null, deadline: deadlineOf(repo, ch.month) };
}

/* ---------- 保存：画面の値 → 共通データ ---------- */

type Changed = Record<string, FormVal>;
type Tabs = Record<string, TableRow[]>;
const str = (v: Record<string, FormVal>) => (n: string) => String(v[n] ?? '');
const dash = (x: string) => /^—/.test(x);
const touched = (ch: Changed, keys: string[]) => keys.some((k) => k in ch);

const CORP_BILL = ['請求書発行リードタイム', '請求書の発行単位', '支払方法', '口座振替の手続きステータス', '支払サイクル', '入金期限', 'Bill One 発行先ID'];
function writeCorp(repo: DocRepo, cx: Ctx, id: string, v: Record<string, FormVal>, ch: Changed, tb: Tabs) {
  const c = byId(cx.corps, id)!;
  const s = str(v);
  const patch: Partial<DCorp> = {};
  const map: [string, keyof DCorp][] = [['法人名', 'name'], ['法人名（契約）', 'contractName'], ['法人名フリガナ', 'kana'], ['請求先法人名', 'billToName']];
  for (const [n, k] of map) if (n in ch) Object.assign(patch, { [k]: s(n) });
  if ('ES営業担当' in ch) {
    const a = cx.accounts.find((x) => x.site === 'ops' && x.name === s('ES営業担当'));
    if (!a) throw new ApiError(`運営アカウントに「${s('ES営業担当')}」がいません`, 400);
    patch.salesRepId = a.id;
  }
  if (Object.keys(ch).some((k) => k.endsWith('（請求書に載る住所）'))) Object.assign(patch, addressOf(v, '（請求書に載る住所）'));
  if (touched(ch, CORP_BILL)) {
    patch.billing = { ...billingOf(c.billing, v), lead: leadOfOpt(s('請求書発行リードタイム')) ?? c.billing.lead, invoiceUnit: s('請求書の発行単位') as DCorp['billing']['invoiceUnit'] };
  }
  const contacts = tb['担当者（テーブル）'] ? contactsFromRows(tb['担当者（テーブル）']) : undefined;
  if (Object.keys(patch).length || contacts) org.actions.updateCorp(repo, { id, patch, contacts });
}

const ADDR = ['郵便番号', '都道府県', '市区町村', '町名・番地', '建物等', '電話番号', 'FAX番号'];
const BR_BILL = ['請求書発行リードタイムの上書き', '支払方法', '口座振替の手続きステータス', '支払サイクル', '入金期限', 'Bill One 発行先ID'];
function writeBranch(repo: DocRepo, cx: Ctx, id: string, v: Record<string, FormVal>, ch: Changed, tb: Tabs): string[] {
  const b = byId(cx.branches, id)!;
  const ct = cx.contracts.find((c) => c.branchId === id);
  const s = str(v);
  const patch: Partial<DBranch> = {};
  const warnings: string[] = [];
  if ('拠点名' in ch) patch.name = s('拠点名');
  if ('拠点名フリガナ' in ch) patch.kana = s('拠点名フリガナ');
  if ('従業員数' in ch) patch.employees = Number(s('従業員数'));
  if ('当初契約開始年月' in ch) patch.originalStartOn = dash(s('当初契約開始年月')) ? '' : s('当初契約開始年月');
  if ('備考' in ch) patch.note = s('備考');
  /* 棚卸報告なし（課題 2-1。台帳 H：在庫点検という語は使わない） */
  if ('棚卸報告' in ch) patch.noStockCheck = s('棚卸報告').startsWith('なし');
  /* 拠点ステータス：先の状態にだけ変えられる（E118。画面・CSV 共通）。休止中は持たない（休止は契約の利用休止） */
  if ('拠点ステータス' in ch) {
    const to = s('拠点ステータス');
    if (to !== b.status) {
      if (!(BRANCH_NEXT[b.status] ?? []).includes(to)) throw new FieldError('拠点ステータス', BR_MSG.E118(b.status, to));
      patch.status = to as DBranch['status'];
    }
  }
  if (touched(ch, ADDR)) Object.assign(patch, addressOf(v));
  /* 親契約の項目は、書き込む前にすべて確かめる（途中まで書かない） */
  const cp: Partial<Contract> = {};
  if (ct) {
    if ('契約ステータス' in ch) {
      const to = s('契約ステータス');
      if (!CONTRACT_STATUS_OPTS.includes(to)) throw new FieldError('契約ステータス', '契約ステータスを選択してください。');
      cp.status = to as Contract['status'];
    }
    if ('開始サイクル月' in ch) { const m = /(\d{4})年(\d{1,2})月/.exec(s('開始サイクル月')); if (m) cp.startCycle = `${m[1]}-${m[2].padStart(2, '0')}`; }
    if ('契約終了日' in ch) { cp.endOn = endOnOf(s('契約終了日')); warnings.push(...endOnCheck(cx, ct.id, cp.endOn)); }
    if ('代理店コード（紹介有無）' in ch) cp.agencyId = /^(AG\d{5})/.exec(s('代理店コード（紹介有無）'))?.[1] ?? '';
    if (cp.agencyId && cp.agencyId !== ct.agencyId) { const ag = repo.get<{ status: string }>('dm.org.agencies', cp.agencyId); if (ag && ag.status !== '有効') throw new FieldError('代理店コード（紹介有無）', `${ag.status}の代理店は指定できません。有効な代理店を選んでください。`); }
    if ('請求先' in ch) cp.billTo = s('請求先') as Contract['billTo'];
    if ((cp.billTo ?? ct.billTo) === 'この拠点' && touched(ch, ['請求先', ...BR_BILL])) {
      const corp = cx.corps.find((c) => c.id === b.corpId);
      const base = ct.billing ?? (corp ? { ...corp.billing, invoiceUnit: '拠点ごと発行' as const } : null);
      if (base) cp.billing = { ...billingOf(base, v), lead: leadOfOpt(s('請求書発行リードタイムの上書き')) ?? base.lead };
    }
  }
  /* 基準数のパターン（REQ-CT-300：変更は運営だけ。拠点の注文の設定 dm.order.prefs に入れる） */
  if ('基準数のパターン' in ch) domainOrder.actions.setBasePattern(repo, { branchId: id, noShortLife: s('基準数のパターン') === '短消費期限なし', by: 'ops' });
  const contacts = tb['担当者（テーブル）'] ? contactsFromRows(tb['担当者（テーブル）']) : undefined;
  /* 拠点の状態が変わると法人ステータス（休眠・正式登録）も決め直す：org.updateBranch の中（lifecycle.syncCorpStatus） */
  if (Object.keys(patch).length || contacts) org.actions.updateBranch(repo, { id, patch, contacts });
  if (ct && Object.keys(cp).length) org.actions.updateContract(repo, { id: ct.id, patch: cp });
  return warnings;
}

const APP_KEYS = ['ユーザー現金利用', '1日上限数（1人あたり）', 'ゲストモード', 'ES-QR'];
/** 子契約の直した項目 → 共通データの子契約の変更（後ろの子契約にも同じ考えで当てる） */
function childPatch(cx: Ctx, k: DChild, v: Record<string, FormVal>, ch: Changed, tb: Tabs): Partial<DChild> {
  const s = str(v);
  const p: Partial<DChild> = {};
  if (touched(ch, ['プランID', 'メニュー種別（コース）'])) {
    const planId = /^(ES\d{6})/.exec(s('プランID'))?.[1] ?? k.planId;
    const course = s('メニュー種別（コース）') as DChild['course'];
    /* 価格はコース × 配送方法（COOL便／ES配送便）。いまのプランは子契約の世代（priceGenId・なければサイクル月）、別のプランへ変えるときは公開用の世代（台帳 E 2026-10-05） */
    const planOf = (pid: string) => cx.plans.find((x) => x.id === pid);
    const price = (pid: string, c: string, same: boolean) => { const x = (same ? pricesAt(planOf(pid), k.cycleMonth, k.priceGenId) : publicPricesOf(planOf(pid))).find((y) => y.course === c); return x ? yenOf(x, methodOf(k)) : undefined; };
    const same = planId === k.planId;
    const now = price(planId, course, same);
    if (now === undefined) throw new ApiError(`${planId} には ${course} の料金がありません`, 400);
    Object.assign(p, { planId, course, monthlyYen: now + (k.monthlyYen - (price(k.planId, k.course, true) ?? k.monthlyYen)), ...(same ? {} : { priceGenId: publicGenOf(planOf(planId))?.id }) });
  }
  /* 福利厚生の適用：請求書の表示（プラン料金を2行／1行）だけ変わる。① 費目・税は変わらない（28-150） */
  if ('福利厚生の適用' in ch) p.welfareOn = s('福利厚生の適用') === 'ON';
  if (touched(ch, APP_KEYS)) {
    p.app = { ...k.app, allowCash: s('ユーザー現金利用') === '可', dailyCapMeals: Number(s('1日上限数（1人あたり）')) || 0, allowGuest: /^利用する/.test(s('ゲストモード')), allowEsqr: /^利用する/.test(s('ES-QR')) };
  }
  const form = s('配送区分') as DChild['channels'][number]['serviceForm'];
  if ('配送区分' in ch) p.channels = k.channels.map((c) => (c.temp === '資材' ? c : { ...c, serviceForm: form }));
  if (tb['配送ルート設定（テーブル）']) {
    try { p.channels = channelsFromRows(cx, tb['配送ルート設定（テーブル）'], k.channels, form); } catch (e) { throw new ApiError((e as Error).message, 400); }
  }
  /* 回ごとのルート（2026/10/03 案B）。上の行を直しただけのときは今の上書きを残す（便の回から外れた回は落とす） */
  try {
    const chs = p.channels ?? k.channels;
    const next = tb[SLOT_ROUTE_TABLE] ? slotRoutesFromRows(cx, tb[SLOT_ROUTE_TABLE], chs)
      : chs.map((c) => (c.slotRoutes ? { ...c, slotRoutes: Object.fromEntries(Object.entries(c.slotRoutes).filter(([s]) => c.slots.includes(s))) } : c));
    if (JSON.stringify(next) !== JSON.stringify(k.channels)) p.channels = next;
  } catch (e) { throw new ApiError((e as Error).message, 400); }
  const ot = tb['オプション・割引（このサイクル月）'];
  if (ot) {
    const codes = ot.flatMap((r) => ('c' in r && cellText(r.c[0]) !== '終了' ? [/^((OP|DC)\d{6})/.exec(cellText(r.c[2]))?.[1] ?? ''] : [])).filter(Boolean);
    p.optionIds = codes.filter((x) => x.startsWith('OP'));
    p.discountIds = codes.filter((x) => x.startsWith('DC'));
    /* オプションの金額（税抜）の上書き（REQ-CT-304：契約ごと・ES-QR など）。入力欄の金額がマスタと同じなら上書きを外す。入力欄でない行は今のまま（終了した行は外す） */
    const amt: Record<string, number> = {};
    for (const r of ot) {
      if (!('c' in r) || cellText(r.c[0]) === '終了') continue;
      const id = /^(OP\d{6})/.exec(cellText(r.c[2]))?.[1];
      if (!id) continue;
      const c4 = r.c[4], o = cx.options.find((x) => x.id === id);
      /* 子契約ごとに直せるオプション（金額の種類＝契約ごと・ES-QR・すでに上書きがある）だけ。入力欄が空・読み取り専用の行は今のまま */
      const eligible = !!o && ((o.amountKind === '契約ごと' || o.amountKind === '機種参照') || o.linkedItem === 'esqr' || k.amounts?.[id] !== undefined);
      if (!eligible) continue;
      if (typeof c4 === 'object' && c4.t === 'in' && !c4.ro && c4.v.trim() !== '' && c4.v.trim() !== '—') {
        const n = toNum(c4.v);
        if (!Number.isInteger(n) || n < 0) throw new ApiError(`オプション ${id} の金額（税抜）は 0以上の整数の円で入力してください`, 400);
        if (n !== o!.amountYen) amt[id] = n;
      } else if (k.amounts?.[id] !== undefined) amt[id] = k.amounts[id];
    }
    const sorted = (m?: Record<string, number>) => JSON.stringify(Object.entries(m ?? {}).sort(([a], [b]) => a.localeCompare(b)));
    if (sorted(amt) !== sorted(k.amounts)) p.amounts = Object.keys(amt).length ? amt : undefined;
  }
  return p;
}
/** lockedOk＝請求済・確定の子契約を、契約変更の受付の締切までに直す（金額に効く項目も。E54 は締切のあとだけ） */
function writeChild(repo: DocRepo, cx: Ctx, k: DChild, v: Record<string, FormVal>, ch: Changed, tb: Tabs, by = 'Ad00010', lockedOk = false) {
  const p = childPatch(cx, k, v, ch, tb);
  if (Object.keys(p).length) org.actions.updateChild(repo, { id: k.id, patch: p, by, lockedOk });
  if ('配送備考' in ch || '設置フロア' in ch) {
    const b = byId(cx.branches, k.branchId)!;
    org.actions.updateReceive(repo, { id: b.id, receiveWindows: b.receiveWindows, deliveryNote: String(v['配送備考'] ?? b.deliveryNote), floor: String(v['設置フロア'] ?? b.floor ?? '') });
  }
}

/** 文字の月（2026年11月）→ YYYY-MM */

export default defineArea({
  name: 'contracts',
  /* 法人・拠点・契約は共通データ（dm.org.*）。ここには持たない */
  seed: () => ({}),
  queries: {
    /** 法人一覧 */
    corps: (repo: DocRepo) => { const cx = load(repo); return cx.corps.map((c) => corpRow(repo, cx, c)).map((r) => ({ ...r, extra: searchExtra('corp', r) })); },
    /** 拠点一覧（corpId を渡すとその法人の拠点だけ） */
    branches: (repo: DocRepo, a?: { corpId?: string }) => {
      const cx = load(repo);
      return cx.branches.filter((b) => !a?.corpId || b.corpId === a.corpId).map((b) => branchRow(repo, cx, b)).map((r) => ({ ...r, extra: searchExtra('branch', r) }));
    },
    /** 子契約一覧（サイクル月の新しい順） */
    children: (repo: DocRepo, a?: { parentNo?: string }) => {
      const cx = load(repo);
      return cx.allChildren.filter((k) => !a?.parentNo || k.contractId === a.parentNo).map((k) => childRow(repo, cx, k));
    },
    corp: (repo: DocRepo, a: { id: string }) => { const r = findRow(repo, load(repo), 'corp', a.id) as Corp | undefined; return r ? detailOf('corp', r) : null; },
    branch: (repo: DocRepo, a: { id: string }) => {
      const cx = load(repo);
      const r = findRow(repo, cx, 'branch', a.id) as Branch | undefined;
      /* ops＝別操作（所属法人の付け替え・本導入への切替）ができるか・できない理由 */
      if (!r) return null;
      const ops = branchOpsOf(cx, cx.branches.find((x) => x.id === a.id)!);
      const ct = cx.contracts.find((c) => c.branchId === a.id);
      /* 切替の「本導入の開始年月」の最小・既定 */
      const range = ct && !ops.switch ? switchRange(repo, ct.id) : null;
      return { ...detailOf('branch', r), ops: range ? { ...ops, switchMin: range.min, switchFrom: range.def } : ops };
    },
    child: (repo: DocRepo, a: { id: string }) => {
      const cx = load(repo);
      const r = findRow(repo, cx, 'child', a.id) as ChildContract | undefined;
      return r ? { ...detailOf('child', r), ...childCtx(repo, cx, r) } : null;
    },
    /** 親契約番号 → 拠点ID（親契約は拠点の「契約」タブ） */
    parent: (repo: DocRepo, a: { no: string }) => branchOfContract(load(repo), a.no)?.id ?? null,
    /** 拠点の「子契約で変更する」：今のサイクル月の子契約（なければいちばん新しいもの） */
    currentChild: (repo: DocRepo, a: { branchId: string }) => {
      const cx = load(repo);
      if (!cx.branches.some((b) => b.id === a.branchId)) throw notFound('branch', a.branchId);
      const ct = cx.contracts.find((c) => c.branchId === a.branchId);
      return (ct && currentOf(cx, ct.id)?.id) ?? null;
    },
    /** 拠点の「お試しを延長する」：お試しの期間・延長の記録・延長できない理由（共通データの org.trial） */
    trial: (repo: DocRepo, a: { branchId: string }) => {
      const ct = repo.list<Contract>('dm.org.contracts').find((c) => c.branchId === a.branchId);
      return ct ? { contractId: ct.id, ...org.queries.trial(repo, { contractId: ct.id }) } : null;
    },
  },
  actions: {
    /**
     * 詳細の保存。values＝項目の値（全部）、tables＝表の行（全部）。
     * 共通データにある項目は共通データの action で書き、ない項目は contracts.extra に見本と違う値だけ残す。
     * 子契約で scope='after' のときは、未確定の後ろの子契約にも、直した項目を写す。
     */
    save: (repo: DocRepo, a: { entity: Entity; id: string; values: Record<string, FormVal>; tables: Record<string, TableRow[]>; scope?: 'only' | 'after'; by?: string; baseVersion?: string; force?: boolean }) => {
      const cx = load(repo);
      const row = findRow(repo, cx, a.entity, a.id);
      if (!row) throw notFound(a.entity, a.id);
      if (row.apNo) throw new ApiError('仮登録の間は、契約申請管理の申請詳細で編集してください', 409);
      /* 取消の拠点は全項目が参照のみ（I107）。閉鎖の拠点は担当者の表（請求書の送り先メールを含む）だけ（I108） */
      const brStatus = a.entity === 'branch' ? (row as Branch).status : '';
      if (brStatus === '取消') throw new ApiError(BR_MSG.I107, 409);
      /* 取消の法人も全項目が参照のみ（台帳 F 運営A(1)） */
      if (a.entity === 'corp' && (row as Corp).status === '取消') throw new ApiError(BR_MSG.NEW_CORP_CANCEL, 409);
      /* 取消の子契約も参照のみ */
      if (a.entity === 'child' && (row as ChildContract).canceled) throw new ApiError(BR_MSG.NEW_CHILD_CANCEL, 409);
      const def = FORMS[a.entity];
      const fill = baseFill(a.entity, row);
      const before = applyDeps(a.entity, valuesOf(def, fill)).values;   /* 画面と同じく、非活性の項目は「—」にしてから比べる */
      /* 同時更新（E31）：読み込んだ版と違えば 409 STALE。force＝上書きして保存。baseVersion を送らない呼び出し（CSV取込など）は確かめない */
      assertFresh(verOf(before, tablesFor(def, fill)), a.baseVersion, a.force);
      const ctx = a.entity === 'child' ? childCtx(repo, cx, row as ChildContract) : null;
      const locked = ctx?.pending?.fields ?? [];
      const errs = validate(a.entity, a.values, locked);
      if (Object.keys(errs).length) throw new FieldError(Object.keys(errs)[0], '入力内容を確認してください（' + Object.values(errs)[0] + '）');
      const changed: Changed = {};
      for (const [k, v] of Object.entries(a.values)) if (!locked.includes(k) && JSON.stringify(before[k]) !== JSON.stringify(v)) changed[k] = v;
      const tBefore = tablesFor(def, fill);
      const tChanged: Tabs = {};
      for (const [t, rows] of Object.entries(a.tables ?? {})) if (JSON.stringify(tBefore[t]) !== JSON.stringify(rows)) tChanged[t] = rows;
      /* 請求済・確定の子契約は、契約変更の受付の締切（オーダー締切）のあとは金額に効く項目の変更を保存できない（E54。直した項目の下に出す）。締切までは直せる */
      if (a.entity === 'child') {
        const kd = byId(cx.allChildren, a.id);
        const blk = kd && amountBlock(kd.billStatus, before, changed, tBefore, tChanged, deadlineOf(repo, kd.cycleMonth));
        if (blk) throw new FieldError(blk.name, blk.msg);
      }
      /* 担当者のメールアドレスの形（E07。CSV取込と同じ決まり） */
      for (const r of tChanged['担当者（テーブル）'] ?? []) {
        const em = 'c' in r ? cellText(r.c[3]).normalize('NFKC').trim() : '';
        if (em && !EMAIL_RE.test(em)) throw new FieldError('メールアドレス', EMAIL_MSG);
      }
      if (brStatus === '閉鎖' && (Object.keys(changed).length || Object.keys(tChanged).some((t) => t !== CLOSED_EDITABLE_TABLE))) throw new ApiError(BR_MSG.I108, 409);
      /* 所属法人・契約種別は編集では変えられない（別操作：reassignCorp・switchToHon） */
      if ('所属法人' in changed || '契約種別' in changed) throw new ApiError('所属法人・契約種別は編集では変えられません（別の操作から変えてください）', 400);
      /* 共通データの項目と、運営だけの項目に分ける */
      const dm = domainFill(cx, a.entity, a.id);
      const extra: FormFill = { ...extraOf(repo, a.entity, a.id) };
      const dmCh: Changed = {}; const dmTb: Tabs = {};
      for (const [k, v] of Object.entries(changed)) if (k in dm) dmCh[k] = v; else extra[k] = v;
      for (const [t, rows] of Object.entries(tChanged)) if ('#' + t in dm) dmTb[t] = rows; else extra['#' + t] = rows;
      let warnings: string[] = [];
      if (a.entity === 'corp') writeCorp(repo, cx, a.id, a.values, dmCh, dmTb);
      else if (a.entity === 'branch') warnings = writeBranch(repo, cx, a.id, a.values, dmCh, dmTb);
      else writeChild(repo, cx, byId(cx.children, a.id)!, a.values, dmCh, dmTb, a.by, childLocked(byId(cx.children, a.id)!) && !deadlineOf(repo, byId(cx.children, a.id)!.cycleMonth).passed);
      putExtra(repo, a.entity, a.id, extra);
      let more = '';
      if (a.entity === 'child' && a.scope === 'after' && ctx) {
        let n = 0;
        for (const x of ctx.later.later) {
          const k = byId(cx.children, x.id);
          /* 確定・請求済の子契約は変えない（④・影響一覧 A3） */
          if (!k || childLocked(k) || /(^|[^未])確定|請求済/.test(x.st)) continue;
          const p = childPatch(cx, k, a.values, dmCh, dmTb);
          if (Object.keys(p).length) org.actions.updateChild(repo, { id: k.id, patch: p, by: a.by ?? 'Ad00010' });
          const ex = Object.fromEntries(Object.entries(changed).filter(([key]) => !(key in dm)));
          if (Object.keys(ex).length) putExtra(repo, 'child', k.id, { ...extraOf(repo, 'child', k.id), ...ex });
          n++;
        }
        more = String(n);
      }
      return { changed: Object.keys(changed).length + Object.keys(tChanged).length, extra: more, warnings };
    },

    /**
     * 編集中の印（I02）。編集の画面が開いている間、30秒ごとに送る（leave＝画面を離れた）。ほかの人の印（TTL 内）を返す。
     * ロックはしない：保存はできる（あとから保存した内容で上書きされることがある。保存の衝突は E31）
     */
    editing: (repo: DocRepo, a: { entity: Entity; id: string; accountId: string; name: string; leave?: boolean }) => {
      const target = `${a.entity}:${a.id}`, key = `${target}:${a.accountId}`, now = Date.now();
      if (a.leave) repo.remove(EDITING, key);
      else {
        const cur = repo.get<Editing>(EDITING, key);
        repo.put<Editing>(EDITING, key, { id: key, target, accountId: a.accountId, name: a.name, since: cur && now - cur.at < EDITING_TTL_MS ? cur.since : hhmm(now), at: now });
      }
      return { others: repo.list<Editing>(EDITING).filter((x) => x.target === target && x.accountId !== a.accountId && now - x.at < EDITING_TTL_MS).map((x) => ({ name: x.name, since: x.since })) };
    },

    /** 法人アカウントの操作（S7C-20261001）。pw・resend は案内を送るだけ。stop・resume はアカウントの状態を変える（dm.account） */
    corpAccount: (repo: DocRepo, a: { id: string; op: 'pw' | 'resend' | 'stop' | 'resume' }) => {
      const corp = repo.get<DCorp>('dm.org.corps', a.id);
      if (!corp) throw notFound('corp', a.id);
      if (corp.status === '取消') throw new ApiError(BR_MSG.NEW_CORP_CANCEL, 409);
      if (a.op === 'stop' || a.op === 'resume') account.actions.setStatus(repo, { id: a.id, status: a.op === 'stop' ? '利用停止' : '有効', by: 'ops' });
      return { at: nowStamp() };
    },
    /** 拠点アカウントの操作（台帳 F 運営A Q9・法人と同じ操作。権限＝拠点の編集）。取消の拠点は参照のみ（I107） */
    branchAccount: (repo: DocRepo, a: { id: string; op: 'pw' | 'resend' | 'stop' | 'resume' }) => {
      const b = repo.get<DBranch>('dm.org.branches', a.id);
      if (!b) throw notFound('branch', a.id);
      if (b.status === '取消') throw new ApiError(BR_MSG.I107, 409);
      if (a.op === 'stop' || a.op === 'resume') account.actions.setStatus(repo, { id: a.id, status: a.op === 'stop' ? '利用停止' : '有効', by: 'ops' });
      return { at: nowStamp() };
    },

    /** 法人の「拠点の請求先を一括変更」（2026/09/28・運営だけ）。親契約の請求先を書く。発行済みの請求書はそのまま */
    bulkBillTo: (repo: DocRepo, a: { corpId: string; changes: { id: string; billTo: '法人' | 'この拠点' }[] }) => {
      const cx = load(repo);
      const corp = cx.corps.find((c) => c.id === a.corpId);
      if (!corp) throw notFound('corp', a.corpId);
      if (corp.status === '取消') throw new ApiError(BR_MSG.NEW_CORP_CANCEL, 409);
      let n = 0;
      for (const c of a.changes) {
        const b = cx.branches.find((x) => x.id === c.id);
        const ct = cx.contracts.find((x) => x.branchId === c.id);
        if (!b || !ct || b.corpId !== a.corpId || ct.billTo === c.billTo) continue;
        const billing = c.billTo === 'この拠点' && !ct.billing ? { ...corp.billing, invoiceUnit: '拠点ごと発行' as const } : ct.billing;
        org.actions.updateContract(repo, { id: ct.id, patch: { billTo: c.billTo, billing } });
        n++;
      }
      const ids = cx.branches.filter((b) => b.corpId === a.corpId).map((b) => b.id);
      const all = repo.list<Contract>('dm.org.contracts').filter((c) => ids.includes(c.branchId));
      return { n, corp: all.filter((c) => c.billTo === '法人').length, own: all.filter((c) => c.billTo === 'この拠点').length };
    },

    /**
     * 所属法人の付け替え（システム管理だけ・編集とは別の操作で、その場で保存する。台帳 F 運営A 法人・拠点の最後の open (2)）。
     * 発行済み・確定済みの請求書がない／承認待ちの申請がない拠点だけ。請求先・請求条件は新しい法人のもの（親契約の請求先を法人・拠点の上書きを外す）。変更履歴に「付け替え」を残す
     */
    reassignCorp: (repo: DocRepo, a: { branchId: string; corpId: string; by?: string }) => {
      const cx = load(repo);
      const b = cx.branches.find((x) => x.id === a.branchId);
      if (!b) throw notFound('branch', a.branchId);
      if (branchRow(repo, cx, b).apNo) throw new ApiError('仮登録の間は、契約申請管理の申請詳細で編集してください', 409);
      if (b.status === '取消') throw new ApiError(BR_MSG.I107, 409);
      const corp = cx.corps.find((c) => c.id === a.corpId);
      if (!corp) throw notFound('corp', a.corpId);
      if (b.corpId === corp.id) throw new ApiError('いまの所属法人と同じです。別の法人を選んでください', 400);
      const ops = branchOpsOf(cx, b);
      if (ops.reassign) throw new ApiError(ops.reassign, 409);
      /* 付け替え先は取消でない法人。お試し割引（DC000013）は1法人1回：先に使っている法人へはお試しの拠点を移せない */
      const to = ops.corps.find((c) => c.id === corp.id);
      if (!to) throw new ApiError(BR_MSG.NEW_REASSIGN_TARGET, 409);
      if (to.block) throw new ApiError(to.block, 409);
      const old = cx.corps.find((c) => c.id === b.corpId);
      /* 元の法人・新しい法人の法人ステータス（休眠・正式登録）は updateBranch が決め直す */
      org.actions.updateBranch(repo, { id: b.id, patch: { corpId: corp.id } });
      const ct = cx.contracts.find((c) => c.branchId === b.id);
      if (ct) org.actions.updateContract(repo, { id: ct.id, patch: { billTo: '法人', billing: null } });
      const what = `付け替え：所属法人「${old ? `${old.id} ${old.name}` : '（法人なし）'}」→「${corp.id} ${corp.name}」（請求先・請求条件は新しい法人のものに変更）`;
      auditLog(repo, a.by || 'ops', '付け替え', b.id, what, 'ops');
      /* 元の法人の変更履歴にも出す（法人の履歴は今の配下の拠点の記録しか拾わないので、元の法人あてにも1行） */
      if (old) auditLog(repo, a.by || 'ops', '付け替え', old.id, `${what}：拠点 ${b.id} ${b.name}`, 'ops');
      return { corpName: corp.name };
    },
    /**
     * お試し→本導入の「切替」（編集とは別の操作で、その場で保存する。台帳 F 運営A 法人・拠点の最後の open (3)・契約_01 §6-1）。
     * startYm（YYYY-MM）から、申込の切替と同じ処理（lifecycle.switchTrial）：その月から本導入の子契約にしてお試し割引（DC000013）を外す・
     * 契約種別の履歴にお試し（前の月まで）→本導入（startYm から）・最低利用期間／違約金の数え始めを本導入の開始日にする・メール M3
     */
    switchToHon: (repo: DocRepo, a: { branchId: string; startYm?: string; by?: string }) => {
      const cx = load(repo);
      const b = cx.branches.find((x) => x.id === a.branchId);
      if (!b) throw notFound('branch', a.branchId);
      const ct = cx.contracts.find((c) => c.branchId === b.id);
      if (!ct) throw new ApiError(`拠点 ${b.id} の親契約が見つかりません`, 404);
      const block = branchOpsOf(cx, b).switch;
      if (block) throw new ApiError(block, 409);
      const startYm = (a.startYm ?? '').trim() || switchRange(repo, ct.id).def;
      const out = switchTrialByOps(repo, b.id, startYm, a.by || 'ops');
      auditLog(repo, a.by || 'ops', '契約種別の切替', ct.id,
        `契約種別の切替：お試しキャンペーン → 本導入（${startYm} から。お試しは ${out.trialEnd} まで。${startYm} 以降の子契約 ${out.honChildren}件を本導入にし、お試しキャンペーン割引（DC000013）を外した。最低利用期間・違約金・自動更新は本導入の開始日（${out.countFrom || startYm}）から数える）`, 'ops');
      return { contractId: ct.id, startYm, note: out.note };
    },

    /** お試しを延長する（運営だけ。共通データの org.extendTrial：月数ぶん お試し・無料の子契約を足し、法人へ通知） */
    extendTrial: (repo: DocRepo, a: { branchId: string; months: number; note?: string; by?: string }) => {
      const ct = repo.list<Contract>('dm.org.contracts').find((c) => c.branchId === a.branchId);
      if (!ct) throw new ApiError(`拠点 ${a.branchId} の親契約が見つかりません`, 404);
      const br = load(repo).branches.find((x) => x.id === a.branchId);
      const block = br ? branchOpsOf(load(repo), br).extend : '';
      if (block) throw new ApiError(block, 409);
      const out = org.actions.extendTrial(repo, { contractId: ct.id, months: a.months, note: a.note, by: a.by ?? 'Ad00012' });
      return { from: out.period.from, to: out.period.to, months: out.period.months, ext: out.ext };
    },
    /** 子契約を先まで作る（いちばん新しい子契約と同じ中身で、共通データに子契約を足す） */
    genChildren: (repo: DocRepo, a: { branchId: string; until: string }) => {
      const cx = load(repo);
      const b = cx.branches.find((x) => x.id === a.branchId);
      if (!b) throw notFound('branch', a.branchId);
      const br = branchRow(repo, cx, b);
      if (br.apNo) throw new ApiError('仮登録の間は、契約申請管理の申請詳細で編集してください', 409);
      const rows = tablesFor(FORMS.branch, baseFill('branch', br))[CHILD_TABLE];
      const plan = genPlan(rows, thisMonth(), a.until);
      if (!plan.top || !plan.months.length) throw new ApiError(`作れる月がありません（上限 ${plan.limit} まで作成済み）`, 400);
      for (const m of plan.months) org.actions.addChild(repo, { contractId: plan.cid, cycleMonth: m });
      return { n: plan.months.length, first: plan.months[0], last: plan.months[plan.months.length - 1] };
    },

  },
});
