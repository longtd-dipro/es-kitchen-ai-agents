import { ApiError } from '@/lib/api/errors';
import { recordLockedSkip } from '../locked';
import { defineArea, toDocs, type DocRepo } from '@/lib/ops/core/area';
import { notify } from '../notify';
import { assertAgencyUsable } from './referral';
import { contactChangedNotice, contactManualNotice } from '../mails';
import { today } from '@/lib/supplier/dates';
import { buildChildContracts } from '../seed/delivery';
import { childLocked, FEE_KEYS, feesNow, lockMsg } from '../snapshot';
import { AGENCIES, BRANCHES, CONTACTS, CONTRACTS, CORPS, LOANS, PAUSES } from '../seed/org';
import { annualCovered, prepayOf, settleChange, settleMonth } from '../adjust';
import type { Branch, ChildContract, Contact, Contract, Corp, Loan, Option, Pause } from '../types';
import { CHARGE_IDS, monthlyOptionsYen, syncLinked } from '../charges';
import { log as auditLog } from './account';
import { extendTrial, trialExtendBlock, trialPeriod } from '../trial';
import { syncCorpStatus } from '../lifecycle';
import { rerouteSlots } from '../route';
import { setMigrationPause, todoOf } from '../migrate';

/* 法人・拠点・契約（area: org）。kind：org.corps／org.branches／org.contacts／org.contracts／org.childContracts／org.pauses／org.agencies／org.loans */

const corps = (r: DocRepo) => r.list<Corp>('dm.org.corps');
const branches = (r: DocRepo) => r.list<Branch>('dm.org.branches');
const contracts = (r: DocRepo) => r.list<Contract>('dm.org.contracts');
/** 子契約（休止・解約で取り消したもの＝canceled は一覧に出さない・決定 28-12） */
const children = (r: DocRepo) => r.list<ChildContract>('dm.org.childContracts').filter((x) => !x.canceled);

/** キーの順に関係なく同じ値か */
const stable = (x: unknown): string => JSON.stringify(x, (_k, v) => (v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b))) : v));
const same = (a: unknown, b: unknown) => stable(a) === stable(b);
/** 確定・請求済の子契約でも変えてよい項目（料金のないアプリの設定）。請求の状態・① 費目の写しは別の action で変える */
const FREE_KEYS = ['app'];

/** 拠点の表示用の状態（休止は契約から） */
export const branchState = (b: Branch, c?: Contract) =>
  c?.status === '利用休止' ? '休止中' : c?.status === '解約手続き中' ? '解約手続き中' : b.status;

function branchRow(r: DocRepo, b: Branch, cycleMonth?: string) {
  const contract = contracts(r).find((c) => c.branchId === b.id);
  const ch = children(r).filter((x) => x.branchId === b.id).sort((x, y) => y.cycleMonth.localeCompare(x.cycleMonth));
  const current = cycleMonth ? ch.find((x) => x.cycleMonth === cycleMonth) : ch[0];
  return { branch: b, state: branchState(b, contract), contract: contract ?? null, child: current ?? null };
}

export default defineArea({
  name: 'org',
  seed: () => ({
    'dm.org.corps': toDocs(CORPS),
    'dm.org.branches': toDocs(BRANCHES),
    'dm.org.contacts': toDocs(CONTACTS),
    'dm.org.contracts': toDocs(CONTRACTS),
    'dm.org.childContracts': toDocs(buildChildContracts()),
    'dm.org.pauses': toDocs(PAUSES),
    'dm.org.agencies': toDocs(AGENCIES),
    'dm.org.loans': toDocs(LOANS),
  }),
  queries: {
    /** お試しの期間（開始・終了のサイクル月・月数・本導入へ切り替える申込の期限）と延長の記録。block＝延長できない理由（lib/domain/trial.ts） */
    trial(r, { contractId }: { contractId: string }) {
      const ct = r.get<Contract>('dm.org.contracts', contractId);
      if (!ct) throw new ApiError(`親契約が見つかりません（${contractId}）`, 404);
      return { ...trialPeriod(r, ct.id), kind: ct.kind, ext: ct.trialExt ?? [], block: trialExtendBlock(r, ct) };
    },
    corps: (r) => corps(r).map((c) => ({ ...c, branchCount: branches(r).filter((b) => b.corpId === c.id).length })),
    /** 法人と配下の拠点（法人Web の法人アカウント・運営の法人詳細） */
    corp(r, { id, cycleMonth }: { id: string; cycleMonth?: string }) {
      const corp = r.get<Corp>('dm.org.corps', id);
      if (!corp) throw new ApiError(`法人が見つかりません（${id}）`, 404);
      return {
        corp,
        contacts: r.list<Contact>('dm.org.contacts').filter((c) => c.owner.type === 'corp' && c.owner.id === id),
        branches: branches(r).filter((b) => b.corpId === id).map((b) => branchRow(r, b, cycleMonth)),
      };
    },
    /** 拠点の一覧。corpId を渡すとその法人の拠点だけ */
    branches: (r, args?: { corpId?: string; cycleMonth?: string }) =>
      branches(r).filter((b) => !args?.corpId || b.corpId === args.corpId).map((b) => branchRow(r, b, args?.cycleMonth)),
    /** 拠点の詳細（契約・子契約・休止・貸出・担当者） */
    branch(r, { id }: { id: string }) {
      const b = r.get<Branch>('dm.org.branches', id);
      if (!b) throw new ApiError(`拠点が見つかりません（${id}）`, 404);
      const contract = contracts(r).find((c) => c.branchId === id) ?? null;
      return {
        branch: b,
        state: branchState(b, contract ?? undefined),
        corp: b.corpId ? r.get<Corp>('dm.org.corps', b.corpId) ?? null : null,
        contract,
        children: children(r).filter((x) => x.branchId === id).sort((x, y) => x.cycleMonth.localeCompare(y.cycleMonth)),
        pauses: contract ? r.list<Pause>('dm.org.pauses').filter((p) => p.contractId === contract.id) : [],
        loans: r.list<Loan>('dm.org.loans').filter((l) => l.branchId === id),
        contacts: r.list<Contact>('dm.org.contacts').filter((c) => c.owner.type === 'branch' && c.owner.id === id),
      };
    },
    /** 移行した拠点のうち補完する項目が残っているもの（拠点ごと・足りない項目つき）。受付簿 No.28・lib/domain/migrate.ts */
    migrationTodo: (r) => todoOf(r),
    contracts: (r) => contracts(r),
    childContracts: (r, args?: { contractId?: string; branchId?: string; cycleMonth?: string }) =>
      children(r).filter((x) => (!args?.contractId || x.contractId === args.contractId) && (!args?.branchId || x.branchId === args.branchId) && (!args?.cycleMonth || x.cycleMonth === args.cycleMonth)),
    contacts: (r, args?: { ownerId?: string }) => r.list<Contact>('dm.org.contacts').filter((c) => !args?.ownerId || c.owner.id === args.ownerId),
    agencies: (r) => r.list('dm.org.agencies'),
    loans: (r, args?: { branchId?: string }) => r.list<Loan>('dm.org.loans').filter((l) => !args?.branchId || l.branchId === args.branchId),
    /** 取り消した子契約（休止・解約。一覧には出さないが、データとして見る） */
    canceledChildren: (r, args?: { branchId?: string }) => r.list<ChildContract>('dm.org.childContracts').filter((x) => x.canceled && (!args?.branchId || x.branchId === args.branchId)),
  },
  actions: {
    /** 運営：設備を回収した（回収予定 → 回収済。回収の配送はシステムで作らない・課題 3-4） */
    returnLoan(r, { id, on }: { id: string; on?: string }) {
      const l = r.get<Loan>('dm.org.loans', id);
      if (!l) throw new ApiError(`貸出が見つかりません（${id}）`, 404);
      if (l.status !== '回収予定') throw new ApiError(`回収予定の貸出だけ回収済にできます（${l.status}）`, 409);
      const next: Loan = { ...l, status: '回収済', returnedOn: on || today() };
      r.put('dm.org.loans', id, next);
      return next;
    },
    /** 受取時間帯・納品の条件の変更（法人Web・運営。承認なしで反映し、まだ作っていない配送から使う） */
    updateReceive(r, { id, receiveWindows, deliveryNote, floor }: { id: string; receiveWindows: Branch['receiveWindows']; deliveryNote: string; floor?: string }) {
      const b = r.get<Branch>('dm.org.branches', id);
      if (!b) throw new ApiError(`拠点が見つかりません（${id}）`, 404);
      if (!receiveWindows.length || receiveWindows.some((w) => !(w.from < w.to))) throw new ApiError('受取時間帯の開始と終了を正しく入れてください', 400);
      const next = { ...b, receiveWindows, deliveryNote, ...(floor !== undefined ? { floor: floor.trim() } : {}) };
      r.put('dm.org.branches', id, next);
      return next;
    },
    /** 拠点の、承認なしで直せる欄（従業員数・備考・FAX）とご担当者（法人Web の拠点の編集。ご担当者の変更は運営へ通知） */
    updateBranchNow(r, { id, employees, note, fax, contacts }: { id: string; employees?: number; note?: string; fax?: string; contacts?: ContactRow[] }) {
      const b = r.get<Branch>('dm.org.branches', id);
      if (!b) throw new ApiError(`拠点が見つかりません（${id}）`, 404);
      if (employees !== undefined && !(Number.isInteger(employees) && employees >= 0)) throw new ApiError('従業員数は0以上の整数で入れてください', 400);
      const next = { ...b, employees: employees ?? b.employees, note: note ?? b.note, fax: fax ?? b.fax };
      r.put('dm.org.branches', id, next);
      if (contacts) setContacts(r, { type: 'branch', id }, contacts, b.name);
      return next;
    },
    /** 法人の、承認なしで直せる欄（法人名・契約名・フリガナ・請求先法人名）とご担当者（法人Web の法人情報の編集。運営へ通知） */
    updateCorpNow(r, { id, name, contractName, kana, billToName, contacts }: { id: string; name?: string; contractName?: string; kana?: string; billToName?: string; contacts?: ContactRow[] }) {
      const c = r.get<Corp>('dm.org.corps', id);
      if (!c) throw new ApiError(`法人が見つかりません（${id}）`, 404);
      const next = { ...c, name: name ?? c.name, contractName: contractName ?? c.contractName, kana: kana ?? c.kana, billToName: billToName ?? c.billToName };
      if (!next.name.trim()) throw new ApiError('法人名を入れてください', 400);
      r.put('dm.org.corps', id, next);
      if (name !== undefined || contractName !== undefined || kana !== undefined || billToName !== undefined) {
        notify(r, { to: { site: 'ops', accountId: '', role: 'ops.sales' }, templateId: '', title: `法人情報が変わりました（${next.name}）`, body: '法人Web で法人名などを直しました（承認は不要）。', link: { type: '', id } });
      }
      if (contacts) setContacts(r, { type: 'corp', id }, contacts, next.name);
      return next;
    },
    /** ご注文のリマインド（締切の7日前・3日前）を送るか（法人ごと。法人Web の法人情報） */
    setOrderReminder(r, { id, on }: { id: string; on: boolean }) {
      const c = r.get<Corp>('dm.org.corps', id);
      if (!c) throw new ApiError(`法人が見つかりません（${id}）`, 404);
      const next = { ...c, orderReminder: !!on };
      r.put('dm.org.corps', id, next);
      return next;
    },
    /** アプリの1日上限数（1人あたり）。fromCycle 以降の子契約に書く（料金のない設定なので承認なし） */
    /**
     * ゲストモードの ON／OFF（法人Web・保存した時点で使える／止まる：台帳 2026/10/03）。
     * フラグ＝今のサイクル月から先の子契約すべて。料金（OP000003）＝feeFrom（締切ルールの最初の月）から先だけ変え、それより前は今のまま（guestSplit で印）。
     * 確定・請求済の子契約は料金を変えない
     */
    setGuest(r, { branchId, on, nowCycle, feeFrom, by }: { branchId: string; on: boolean; nowCycle: string; feeFrom: string; by?: string }) {
      const opt = CHARGE_IDS['item.guest'];
      const targets = children(r).filter((x) => x.branchId === branchId && !x.canceled && x.cycleMonth >= nowCycle).sort((a, b) => a.cycleMonth.localeCompare(b.cycleMonth));
      for (const cc of targets) {
        const fee = cc.cycleMonth >= feeFrom && !childLocked(cc) ? on : cc.optionIds.includes(opt);
        const optionIds = fee ? [...cc.optionIds.filter((x) => x !== opt), opt] : cc.optionIds.filter((x) => x !== opt);
        const app = { ...cc.app, allowGuest: on, guestSplit: fee !== on || undefined };
        if (!app.guestSplit) delete app.guestSplit;
        if (fee === cc.optionIds.includes(opt)) r.put('dm.org.childContracts', cc.id, { ...cc, app });
        else this.updateChild(r, { id: cc.id, patch: { app, optionIds }, by });
      }
      return { n: targets.length };
    },
    setAppLimits(r, { branchId, fromCycle, dailyCapMeals }: { branchId: string; fromCycle: string; dailyCapMeals: number }) {
      if (!(Number.isInteger(dailyCapMeals) && dailyCapMeals >= 0)) throw new ApiError('1日上限数は0以上の整数で入れてください', 400);
      const targets = children(r).filter((x) => x.branchId === branchId && x.cycleMonth >= fromCycle);
      for (const cc of targets) r.put('dm.org.childContracts', cc.id, { ...cc, app: { ...cc.app, dailyCapMeals } });
      return { n: targets.length };
    },
    /** 運営の法人の編集（法人・契約管理）。ID は変えない。contacts を渡すとご担当者も入れ替える */
    updateCorp(r, { id, patch, contacts }: { id: string; patch: Partial<Omit<Corp, 'id'>>; contacts?: ContactRow[] }) {
      const c = r.get<Corp>('dm.org.corps', id);
      if (!c) throw new ApiError(`法人が見つかりません（${id}）`, 404);
      const next: Corp = { ...c, ...patch, id };
      if (!next.name.trim()) throw new ApiError('法人名を入れてください', 400);
      /* 移行で空だった請求条件（要補完）：請求条件を直したら外す */
      if (patch.billing && next.billingBlank) delete next.billingBlank;
      r.put('dm.org.corps', id, next);
      if (contacts) setContacts(r, { type: 'corp', id }, contacts, next.name, false);
      return next;
    },
    /** 運営の拠点の編集（法人・契約管理）。休止は契約（利用休止）で決まるので、ここでは変えない */
    updateBranch(r, { id, patch, contacts }: { id: string; patch: Partial<Omit<Branch, 'id'>>; contacts?: ContactRow[] }) {
      const b = r.get<Branch>('dm.org.branches', id);
      if (!b) throw new ApiError(`拠点が見つかりません（${id}）`, 404);
      const next: Branch = { ...b, ...patch, id };
      if (!next.name.trim()) throw new ApiError('拠点名を入れてください', 400);
      if (next.corpId && !r.get('dm.org.corps', next.corpId)) throw new ApiError(`法人が見つかりません（${next.corpId}）`, 404);
      if (!(Number.isInteger(next.employees) && next.employees >= 0)) throw new ApiError('従業員数は0以上の整数で入れてください', 400);
      r.put('dm.org.branches', id, next);
      if (contacts) setContacts(r, { type: 'branch', id }, contacts, next.name, false);
      /* 拠点の状態・所属法人が変わったら、法人ステータス（休眠・正式登録）を決め直す（元の法人も） */
      if (next.status !== b.status || next.corpId !== b.corpId) { syncCorpStatus(r, b.corpId); syncCorpStatus(r, next.corpId); }
      return next;
    },
    /** 運営の親契約の編集（契約種別・状態・代理店・請求先・請求条件）。ID・拠点は変えない */
    updateContract(r, { id, patch }: { id: string; patch: Partial<Omit<Contract, 'id' | 'branchId'>> }) {
      const c = r.get<Contract>('dm.org.contracts', id);
      if (!c) throw new ApiError(`親契約が見つかりません（${id}）`, 404);
      const next: Contract = { ...c, ...patch, id, branchId: c.branchId };
      if (next.agencyId && !r.get('dm.org.agencies', next.agencyId)) throw new ApiError(`代理店が見つかりません（${next.agencyId}）`, 404);
      if (next.agencyId && next.agencyId !== c.agencyId) assertAgencyUsable(r, next.agencyId);
      if (next.kind !== c.kind) next.kindHistory = [...c.kindHistory, { kind: next.kind, from: today().slice(0, 7).replace('/', '-') }];
      /* 移行で空だった請求条件（要補完）：請求条件を直したら外す */
      if (patch.billing && next.billingBlank) delete next.billingBlank;
      r.put('dm.org.contracts', id, next);
      return next;
    },
    /** 運営の子契約の編集（プラン・コース・配送・オプション・値引き・アプリの設定など）。ID・親契約・サイクル月は変えない */
    /**
     * lockedOk＝確定・請求済の子契約を、契約変更の受付の締切（オーダー締切）までに直す（運営の子契約の編集。年払い・先の請求書のお客様のため。台帳 F 運営A QC3）。
     * 確定（まだ請求書を出していない）の子契約は、子契約と ① 費目の写しを新しい中身にする（確定解除のあと新しい中身で計算される）。
     * 請求済の子契約は、すでに出した請求書を変えない：子契約は新しい中身、① 費目の写しは請求したときの値のまま、
     * 差額（変更後の固定額 − 請求した額。マイナス＝減額）を調整明細（契約の変更）にして次の請求書に載せる（台帳 F 運営A QC6・2026-10-08）
     */
    updateChild(r, { id, patch, by, lockedOk }: { id: string; patch: Partial<Omit<ChildContract, 'id' | 'contractId' | 'branchId' | 'cycleMonth'>>; by?: string; lockedOk?: boolean }) {
      const cc = r.get<ChildContract>('dm.org.childContracts', id);
      if (!cc) throw new ApiError(`子契約が見つかりません（${id}）`, 404);
      /* 請求の状態（setBillStatus・請求書の発行）と ① 費目の写し（下で作り直す）は patch で変えない */
      const next: ChildContract = { ...cc, ...patch, id, contractId: cc.contractId, branchId: cc.branchId, cycleMonth: cc.cycleMonth, billStatus: cc.billStatus, fees: cc.fees };
      /* A型：契約項目（ES-QR・ゲスト・現金・配送回数）とオプションを1つにそろえる（lib/domain/charges.ts・2026/10/03） */
      /* 自販機リース（OP000037）：コースで付け外し・台数は貸出中の自販機の台数・1台の金額は上書きがなければ機種マスタ（台帳 2026/10/03） */
      const frozen = childLocked(cc) && !lockedOk;   /* 確定・請求済で、締切のあと（または運営の編集以外）は金額を変えない */
      const synced = syncLinked(r, next, cc);
      Object.assign(next, (({ optionIds, app, deliveryExtra }) => ({ optionIds, app, deliveryExtra }))(synced));
      /* 確定・請求済の子契約は台数・金額を変えない（請求調整） */
      if (!frozen) for (const k of ['amounts', 'optionQty'] as const) { if (synced[k]) next[k] = synced[k]; else delete next[k]; }
      /* 確定・請求済の子契約は変えられない（④・マスタ・データ変更の影響一覧 A3）。差額は請求調整 */
      const changed = (Object.keys(next) as (keyof ChildContract)[]).filter((k) => !same(cc[k], next[k]));
      /* A型の項目だけを変えて金額が変わらない（0円のオプション）ときは、確定・請求済でも変えられる（アプリの設定と同じ） */
      const linkedOnly = changed.every((k) => [...FREE_KEYS, 'optionIds', 'deliveryExtra'].includes(k)) && same(feesNow(r, next).lines, (cc.fees ?? feesNow(r, cc)).lines);
      if (frozen && changed.some((k) => !FREE_KEYS.includes(k)) && !linkedOnly) throw new ApiError(lockMsg(cc), 409);
      /* 未確定の子契約でプラン・コース・オプション・値引きを変えたら ① 費目をいまのマスタで作り直す */
      /* 請求済で締切までに直すときは ① 費目の写しを書き換えない（請求した額のまま。差額は下で調整明細） */
      const billed = !!lockedOk && cc.billStatus === '請求済';
      if (!frozen && !billed && (FEE_KEYS.some((k) => changed.includes(k)) || !next.fees)) next.fees = feesNow(r, next);
      if (billed && !next.fees) next.fees = feesNow(r, cc);
      const miss = (kind: string, x: string) => !r.get(kind, x);
      if (miss('dm.master.plans', next.planId)) throw new ApiError(`プランが見つかりません（${next.planId}）`, 404);
      const badOpt = next.optionIds.find((x) => miss('dm.master.options', x)) ?? next.discountIds.find((x) => miss('dm.master.discounts', x));
      if (badOpt) throw new ApiError(`オプション・値引きのマスタにありません（${badOpt}）`, 400);
      /* 削除済のオプション・値引きは新しく付けられない（付いているものはそのまま・課題 4-9） */
      const gone = [...next.optionIds.filter((x) => !cc.optionIds.includes(x) && r.get<{ status: string }>('dm.master.options', x)?.status === '削除済'),
        ...next.discountIds.filter((x) => !cc.discountIds.includes(x) && r.get<{ status: string }>('dm.master.discounts', x)?.status === '削除済')];
      if (gone.length) throw new ApiError(`削除済のオプション・値引きは付けられません（${gone.join('・')}）`, 400);
      for (const ch of next.channels) {
        if (miss('dm.master.warehouses', ch.warehouseId)) throw new ApiError(`倉庫が見つかりません（${ch.warehouseId}）`, 404);
        if (miss('dm.master.carriers', ch.carrierId) || miss('dm.master.carriers', ch.carrier2Id)) throw new ApiError('配送会社①②が見つかりません（①②とも必須）', 404);
        /* 中継しないときは①②に同じ会社（2026/10/03・REQ-DL-710） */
        if (!ch.hubId && ch.carrier2Id !== ch.carrierId) throw new ApiError('中継しないときは配送会社①②に同じ会社を入れてください', 400);
        /* 回ごとのルートの上書き（2026/10/03 案B）：便の回だけ・中身は上と同じ決まり */
        for (const [slot, o] of Object.entries(ch.slotRoutes ?? {})) {
          if (!ch.slots.includes(slot)) throw new ApiError(`回ごとのルート（${ch.temp} ${slot}）がこの便の回にありません`, 400);
          if (miss('dm.master.warehouses', o.warehouseId) || miss('dm.master.carriers', o.carrierId) || miss('dm.master.carriers', o.carrier2Id) || (o.hubId && miss('dm.master.warehouses', o.hubId))) throw new ApiError(`回ごとのルート（${ch.temp} ${slot}）の倉庫・配送会社・中継先が見つかりません`, 404);
          if (!o.hubId && o.carrier2Id !== o.carrierId) throw new ApiError(`回ごとのルート（${ch.temp} ${slot}）：中継しないときは配送会社①②に同じ会社を入れてください`, 400);
        }
        if (ch.hubId && miss('dm.master.warehouses', ch.hubId)) throw new ApiError(`中継先が見つかりません（${ch.hubId}）`, 404);
      }
      /* 金額の上書き（amounts・REQ-CT-304）を直したら、月額（税抜）の差を月額に足し、履歴に残す（運営の契約の画面の「変更履歴」） */
      if (changed.includes('optionQty') && !changed.includes('amounts')) next.monthlyYen = cc.monthlyYen + monthlyOptionsYen(r, next) - monthlyOptionsYen(r, cc);
      if (changed.includes('amounts')) {
        for (const [oid, v] of Object.entries(next.amounts ?? {})) {
          if (!Number.isInteger(v) || v < 0) throw new ApiError(`オプションの金額は 0以上の整数の円で入れてください（${oid}）`, 400);
          if (!next.optionIds.includes(oid)) throw new ApiError(`この子契約にないオプションの金額は上書きできません（${oid}）`, 400);
        }
        next.monthlyYen = cc.monthlyYen + monthlyOptionsYen(r, next) - monthlyOptionsYen(r, cc);
        const was = (oid: string) => cc.amounts?.[oid] ?? r.get<Option>('dm.master.options', oid)?.amountYen ?? 0;
        const now = (oid: string) => next.amounts?.[oid] ?? r.get<Option>('dm.master.options', oid)?.amountYen ?? 0;
        const ids = [...new Set([...Object.keys(cc.amounts ?? {}), ...Object.keys(next.amounts ?? {})])].filter((oid) => was(oid) !== now(oid));
        if (ids.length) {
          auditLog(r, by ?? 'ops', 'org.updateChild', id, `オプションの金額（税抜）を変更：${ids.map((oid) => `${oid} ${was(oid).toLocaleString('ja-JP')}円 → ${now(oid).toLocaleString('ja-JP')}円`).join('、')}`, 'ops');
        }
      }
      r.put('dm.org.childContracts', id, next);
      /* 請求済の月の金額に効く項目を直したら、差額を調整明細にする（まだ載せていない分は作り直す＝続けて直せば合算・請求した額に戻せば消える） */
      if (billed && FEE_KEYS.some((k) => changed.includes(k))) {
        /* 請求書の行の名前に出す理由は、変えた項目の種類だけ（前後の中身は変更履歴に残す）。続けて直したときは種類を合わせる */
        const reason = [
          changed.includes('planId') && 'プラン', changed.includes('course') && 'コース', changed.includes('optionIds') && 'オプション', changed.includes('discountIds') && '値引き',
          (changed.includes('amounts') || changed.includes('optionQty')) && 'オプションの金額・数量', (changed.includes('channels') || changed.includes('deliveryExtra')) && '配送', changed.includes('priceGenId') && '価格プラン',
        ].filter(Boolean).join('、');
        const nm = (kind: string, x: string) => r.get<{ name: string }>(kind, x)?.name ?? x;
        const detail = [
          changed.includes('planId') && `プラン ${nm('dm.master.plans', cc.planId)} → ${nm('dm.master.plans', next.planId)}`,
          changed.includes('course') && `コース ${cc.course} → ${next.course}`,
          changed.includes('optionIds') && `オプション ${cc.optionIds.map((x) => nm('dm.master.options', x)).join('・') || 'なし'} → ${next.optionIds.map((x) => nm('dm.master.options', x)).join('・') || 'なし'}`,
          changed.includes('discountIds') && `値引き ${cc.discountIds.map((x) => nm('dm.master.discounts', x)).join('・') || 'なし'} → ${next.discountIds.map((x) => nm('dm.master.discounts', x)).join('・') || 'なし'}`,
        ].filter(Boolean).join('、');
        const adj = settleChange(r, cc, prepayOf(cc, feesNow(r, cc)), prepayOf(next, feesNow(r, next)), { kind: '契約の変更', reason, applicationId: '', by: by ?? '' });
        auditLog(r, by ?? 'ops', 'org.updateChild', id, adj
          ? `請求済の月の契約を変更${detail ? `（${detail}）` : ''}：請求した額との差額 ${(adj.afterYen - adj.billedYen).toLocaleString('ja-JP')}円（税抜）を調整明細 ${adj.id} にし、次の請求書に載せる`
          : `請求済の月の契約を変更${detail ? `（${detail}）` : ''}：請求した額と同じになったため、次の請求書に載せる差額はありません`, 'ops');
      }
      /* 回ごとのルートを直したら、その回のまだ予定の配送を直す（2026/10/03 案B） */
      if (changed.includes('channels')) rerouteSlots(r, cc, next);
      /* 法人ごとの回数の上限のある値引き（お試しキャンペーン割引）を付け外ししたら、同じ法人・同じ月のほかの拠点の ① 費目も作り直す（先頭の拠点だけ・未確定だけ） */
      if (changed.includes('discountIds')) {
        const capped = new Set([...cc.discountIds, ...next.discountIds].filter((x) => r.get<{ maxPerCorp?: number }>('dm.master.discounts', x)?.maxPerCorp));
        const corpId = r.get<Branch>('dm.org.branches', next.branchId)?.corpId;
        if (capped.size && corpId) {
          for (const o of children(r).filter((x) => x.id !== id && x.cycleMonth === next.cycleMonth && !x.canceled && !childLocked(x) && x.discountIds.some((d) => capped.has(d)) && r.get<Branch>('dm.org.branches', x.branchId)?.corpId === corpId)) {
            r.put('dm.org.childContracts', o.id, { ...o, fees: feesNow(r, o) });
          }
        }
      }
      return next;
    },
    /** お試しを延長する（運営だけ。月数ぶん お試し・無料の子契約を足し、法人へ通知。lib/domain/trial.ts） */
    extendTrial: (r, a: { contractId: string; months: number; note?: string; by: string }) => extendTrial(r, a),
    /** 移行した「休止中」の休止の期間・再開月を決める（要補完の画面。受付簿 No.28） */
    setMigrationPause: (r, a: { contractId: string; fromCycle?: string; resumeCycle: string }) => setMigrationPause(r, a),
    /** 子契約を先まで作る（運営）。その月より前のいちばん新しい子契約と同じ中身で、請求は未確定・手動生成 */
    addChild(r, { contractId, cycleMonth }: { contractId: string; cycleMonth: string }) {
      const id = `${contractId}-${cycleMonth.replace('-', '')}`;
      if (r.get('dm.org.childContracts', id)) throw new ApiError(`子契約はもうあります（${id}）`, 409);
      const base = children(r).filter((x) => x.contractId === contractId && x.cycleMonth < cycleMonth).sort((x, y) => y.cycleMonth.localeCompare(x.cycleMonth))[0];
      if (!base) throw new ApiError(`元にする子契約がありません（${contractId}）`, 404);
      /* ① 費目は作ったときのマスタの金額で固める（v2.3） */
      /* 費用（extras）は月額だけ引き継ぐ（単発は最初の月だけ） */
      /* 年払いで前払いを請求済みの年の月（起算月の請求書の cycleTo まで）は請求済で作る（S3-1） */
      const billed = annualCovered(r, base.branchId, cycleMonth);
      /* 単発料金のオプション（初期費用など）はその月だけ（引き継がない） */
      const optionIds = base.optionIds.filter((x) => r.get<Option>('dm.master.options', x)?.feeType !== '単発料金');
      const cc0 = { ...base, id, cycleMonth, optionIds };
      const next: ChildContract = { ...cc0, billStatus: billed ? '請求済' : '未確定', gen: '手動生成', fees: billed ? base.fees : feesNow(r, cc0), extras: (base.extras ?? []).filter((e) => e.kind === '月額') };
      r.put('dm.org.childContracts', id, next);
      return next;
    },
    /**
     * 請求の状態（請求の画面の「確定」・「確定解除」）。未確定 ⇔ 確定 だけ。請求済は請求書の発行（billing.issue）で付き、ここでは変えられない。
     * 確定した子契約は変えられない（org.updateChild が 409）
     */
    setBillStatus(r, { id, status }: { id: string; status: '未確定' | '確定'; by?: string }) {
      const cc = r.get<ChildContract>('dm.org.childContracts', id);
      if (!cc) throw new ApiError(`子契約が見つかりません（${id}）`, 404);
      if (cc.billStatus === '請求済') throw new ApiError(`子契約 ${id} は請求済みのため${status === '未確定' ? '確定解除' : '確定'}できません（請求書を取り消すと確定に戻ります）`, 409);
      if (cc.billStatus === status) return cc;
      const next: ChildContract = { ...cc, billStatus: status, fees: cc.fees ?? feesNow(r, cc) };
      r.put('dm.org.childContracts', id, next);
      return next;
    },
    /**
     * 作った子契約の ① 費目を、いまのマスタの金額で作り直す（価格世代の切り替え・誤りの訂正。決定 7-1 Q1）。
     * fromCycle 以降で、そのプラン・オプション・値引きを使っている 未確定 の子契約だけ。確定・請求済は変えずに locked で返す（請求調整の一覧）。
     * 誤りの訂正は理由が要る
     */
    repriceChildren(r, a: { fromCycle: string; planId?: string; optionId?: string; discountId?: string; mode: '価格世代' | '誤りの訂正'; reason?: string; by?: string; contractIds?: string[]; untilCycle?: string; childIds?: string[]; priceGenId?: string }) {
      if (!/^\d{4}-\d{2}$/.test(a.fromCycle)) throw new ApiError('適用開始のサイクル月を選んでください', 400);
      if (!a.planId && !a.optionId && !a.discountId) throw new ApiError('プラン・オプション・値引きのどれかを選んでください', 400);
      if (a.mode === '誤りの訂正' && !a.reason?.trim()) throw new ApiError('誤りの訂正は理由を入れてください', 400);
      const uses = (cc: ChildContract) => (a.planId && cc.planId === a.planId) || (a.optionId && cc.optionIds.includes(a.optionId)) || (a.discountId && cc.discountIds.includes(a.discountId));
      /* contractIds＝この親契約だけ（一括変更で選んだ契約） */
      /* untilCycle＝この月の前まで（価格世代の誤りの訂正：その世代の期間だけ。課題 4b-9） */
      /* childIds＝この子契約だけ（一括変更の条件「価格の世代」で絞ったもの） */
      const targets = children(r).filter((cc) => cc.cycleMonth >= a.fromCycle && (!a.untilCycle || cc.cycleMonth < a.untilCycle) && uses(cc) && (!a.contractIds || a.contractIds.includes(cc.contractId)) && (!a.childIds || a.childIds.includes(cc.id))).sort((x, y) => x.id.localeCompare(y.id));
      const updated: string[] = [], locked: { id: string; billStatus: ChildContract['billStatus'] }[] = [], adjusted: string[] = [];
      for (const cc of targets) {
        if (childLocked(cc)) {
          locked.push({ id: cc.id, billStatus: cc.billStatus });
          /* 誤りの訂正は請求済みの月も差額を調整明細にする（① 費目は請求したときの値のまま・TL-7 A）。価格改定（価格世代）は作らない（S3-2・仕様整理 §1-1） */
          /* 誤りの訂正で確定（未発行）の月は反映待ちに残す（確定解除してから billing.reapplyLocked・2026/10/03 決定） */
          if (a.mode === '誤りの訂正' && cc.billStatus === '確定') recordLockedSkip(r, cc, { source: '誤りの訂正', applicationId: '', reason: a.reason?.trim() ?? '', by: a.by ?? '' });
          if (a.mode === '誤りの訂正' && cc.billStatus === '請求済' && settleMonth(r, cc, prepayOf(cc, feesNow(r, cc)), { kind: '誤りの訂正', reason: a.reason?.trim() ?? '', applicationId: '', by: a.by ?? '' })) adjusted.push(cc.id);
          continue;
        }
        /* 価格世代の切替：切り替える先の世代を子契約の「適用された価格プラン」に書く（28-181。省くとサイクル月の世代のまま） */
        const next: ChildContract = a.priceGenId && a.mode === '価格世代' ? { ...cc, priceGenId: a.priceGenId } : cc;
        const fees = feesNow(r, next);
        if (same(fees.lines, cc.fees?.lines) && next.priceGenId === cc.priceGenId) continue;
        r.put<ChildContract>('dm.org.childContracts', cc.id, { ...next, fees });
        updated.push(cc.id);
      }
      return {
        updated, locked, adjusted,
        message: [
          locked.length ? `確定・請求済の子契約 ${locked.length}件は変えていません` + (a.mode === '誤りの訂正' ? '（確定の月は反映待ちに残しました。確定解除してから「反映」してください）' : '（価格改定は次の未確定の月から）') : '',
          adjusted.length ? `請求済みの ${adjusted.length}件の差額を調整明細にし、次の請求書で精算します` : '',
        ].filter(Boolean).join('。'),
      };
    },
  },
});

/** ご担当者の1行（法人Web の表の形） */
export type ContactRow = { kind: Contact['kind']; name: string; kana: string; email: string; tel: string };

/** ご担当者を入れ替える（メイン担当者・請求担当者は1名ずつ要る）。ID は PC＋5桁の続き番号 */
function setContacts(r: DocRepo, owner: Contact['owner'], rows: ContactRow[], ownerName: string, notifyOps = true) {
  if (rows.filter((x) => x.kind === 'メイン担当者').length !== 1 || rows.filter((x) => x.kind === '請求担当者').length !== 1) throw new ApiError('メイン担当者と請求担当者は1名ずつ必要です', 400);
  if (rows.some((x) => !x.name.trim() || !x.email.trim())) throw new ApiError('担当者名とメールアドレスを入れてください', 400);
  const all = r.list<Contact>('dm.org.contacts');
  const old = all.filter((c) => c.owner.type === owner.type && c.owner.id === owner.id);
  let max = Math.max(0, ...all.map((c) => Number(c.id.slice(2)) || 0));
  rows.forEach((x, i) => {
    const id = old[i]?.id ?? `PC${String(++max).padStart(5, '0')}`;
    r.put<Contact>('dm.org.contacts', id, { id, owner, ...x });
  });
  for (const c of old.slice(rows.length)) r.remove('dm.org.contacts', c.id);
  /* 担当者変更フォロー（旧システム・すぐ）：お客様へ（法人Web・運営のどちらで直しても。変わっていなければ出さない） */
  contactChangedNotice(r, owner, ownerName, old, rows);
  /* 新しいご担当者へマニュアルのご案内 M13 */
  contactManualNotice(r, ownerName, old, rows);
  /* 運営が直したときは運営へ通知しない */
  if (notifyOps) notify(r, { to: { site: 'ops', accountId: '', role: 'ops.sales' }, templateId: '', title: `ご担当者が変わりました（${ownerName}）`, body: rows.map((x) => `${x.kind}：${x.name}`).join('・'), link: { type: '', id: owner.id } });
}
