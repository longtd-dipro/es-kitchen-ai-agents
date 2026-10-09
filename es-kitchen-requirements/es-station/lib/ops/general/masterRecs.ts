import { ApiError } from '@/lib/api/errors';
import master from '@/lib/domain/areas/master';
import { parseAreaFees } from '@/lib/domain/carrierFee';
import { notify } from '@/lib/domain/notify';
import { addPartnerHistory, partnerHistory, type PartnerHistKind } from '@/lib/domain/partnerHistory';
import { partnerAccounts, syncPartnerAccounts, type PartnerType } from '@/lib/domain/partnerLock';
import { shortPref, weekdaysOfNg } from '@/lib/domain/prefs';
import { CARRIER_ES_FEES } from '@/lib/domain/seed/master';
import type { Account, Carrier, CarrierEsFee, Cooler, Driver, Warehouse } from '@/lib/domain/types';
import type { DocRepo } from '../core/area';
import { assertFresh } from '../core/concurrency';
import { opsKind, opsRowOf, whKind } from './fromDomain';
import {
  AREA_FEE_SPLIT, formDiff, SUPPLIER_KINDS, list, MSG, normalizeForm, rowsOf, shownFields, str, validateForm, versionOfData, zipOf,
  type FormVals, type FRow, type MKey, type Opt,
} from './masterForms';
import { carrierInUse, driverInUse, supplierInUse, warehouseInUse } from './masterUse';
import {
  carrierAll, contactOfRow, driverAccount, type CarrierAll, goodsOf, licenseOf, putCarrierContacts, putCarrierProfile, relayKindOf, rowOfContact, SAMPLE_LICENSE, staffKindOf, warehouseContacts,
} from './partnerParts';
import {
  addressesOf, applyDetail, blankSupplier, contactsOf, getSupplierRec, nextSupplierId, SUPPLIERS, withParts, type SupplierAddress, type SupplierRec,
} from './suppliers';
import type { GenRow } from './types';

/*
 * 運営Web マスタ（仕入先・委託配送先・倉庫・配送スタッフ）の詳細・登録・編集・削除・変更履歴・パスワード送信（台帳 F 2026-10-06・受付簿 No.178／No.179・hong 2026-10-06）。
 * 保存は CSV取込（lib/csv/master.ts）と同じ置き場・同じ関数（master.create／update・addDriver／updateDriver・共通 DB の仕入先・委託配送先Web のプロフィール）。
 * 変更履歴は lib/domain/partnerHistory.ts（変更内容＝フォームの前後で変わった項目）。
 * 削除は論理削除（状態＝削除済）で、使用中は 409（E241〜E244 の文言・lib/ops/general/masterUse.ts）。
 * 削除・無効にしたマスタのアカウントはログインできない（lib/domain/partnerLock.ts）。
 */

/** 操作した人の既定（ログインのない mock のときだけ。サーバーは lib/server/access.ts の gate がログイン中のアカウントを by に入れる） */
export const DEFAULT_BY = 'Ad00010';
const s = (v: unknown) => (v == null ? '' : String(v));
const nextNo = (ids: string[], head: string, w: number) =>
  `${head}${String(Math.max(0, ...ids.filter((x) => x.startsWith(head)).map((x) => Number(x.slice(head.length)) || 0)) + 1).padStart(w, '0')}`;
const bad = (m: string, status = 400): never => { throw new ApiError(m, status); };

const carriers = (r: DocRepo) => r.list<Carrier>('dm.master.carriers');
const coolersOut = (r: DocRepo, carrierId: string) =>
  r.list<Cooler>('dm.carrier.coolers').filter((b) => b.carrierId === carrierId && b.kind === '保冷バッグ' && b.status === '貸与中').reduce((t, b) => t + b.qty, 0);
/** 自社（DE00000）は所属先の選択肢で「ES配送便」 */
const carrierLabel = (c?: Carrier) => (!c ? '' : c.kind === '自社' ? 'ES配送便' : c.name);
const PARTNER: Record<MKey, PartnerType> = { supplier: 'supplier', consign: 'carrier', warehouse: 'warehouse', driver: 'driver' };
export const HIST_KIND: Record<MKey, PartnerHistKind> = { supplier: 'suppliers', consign: 'carriers', warehouse: 'warehouses', driver: 'drivers' };

/** アカウントの状態（未発行・有効・無効・利用停止・削除済…）。倉庫はその倉庫のアカウント */
function accountState(r: DocRepo, key: MKey, id: string) {
  if (key === 'warehouse') {
    const xs = partnerAccounts(r, 'warehouse', id);
    return xs.length ? [...new Set(xs.map((a) => a.status))].join('・') : '未発行';
  }
  return r.get<Account>('dm.account.accounts', id)?.status ?? '未発行';
}
/** パスワード送信の宛先（仕入先・委託配送先＝メイン担当者、配送スタッフ＝本人）。倉庫は送らない */
function passwordTo(r: DocRepo, key: MKey, id: string, form: FormVals) {
  if (key === 'driver') return str(form, 'email');
  if (key === 'warehouse') return '';
  return rowsOf(form, 'contacts')[0]?.email ?? '';
}
/** パスワード送信を押せるか（アカウントが 未発行・無効・削除済 でない） */
const canSendPassword = (acc?: Account) => !!acc && !['無効', '削除済'].includes(acc.status);

/* ---------- 読む（詳細・編集の値） ---------- */

type Raw = { form: FormVals; status: string; name: string; data: unknown; extra: [string, string][] };

const addrRow = (a: SupplierAddress): FRow => ({ kind: a.kind, zip: a.zip, pref: a.pref, city: a.city, addr1: a.addr1, addr2: a.addr2, tel: a.tel, fax: a.fax });

function rawOf(r: DocRepo, key: MKey, id: string): Raw | null {
  switch (key) {
    case 'supplier': {
      const x = getSupplierRec(r, id);
      if (!x) return null;
      return {
        form: {
          name: x.name, kana: x.kana ?? '', status: x.status, goods: goodsOf(x.goods), kind: (SUPPLIER_KINDS as readonly string[]).includes(x.kind) ? x.kind : SUPPLIER_KINDS.find((k) => (x.kind ?? '').includes(k)) ?? '', biz: x.bizDay, method: x.method || 'ESステーション', note: x.note ?? '',
          addresses: addressesOf(x).map(addrRow), contacts: contactsOf(x).map((c) => ({ kind: c.kind, name: c.name, kana: c.kana, email: c.mail, tel: c.tel })),
        },
        status: x.status, name: x.name, data: x, extra: applyDetail(x) ?? [],
      };
    }
    case 'consign': {
      const c = r.get<Carrier>('dm.master.carriers', id);
      if (!c || c.kind === '自社') return null;
      const a = carrierAll(r, c);
      return {
        form: consignForm(a),
        status: c.status, name: c.name, data: a,
        extra: [['保冷バッグ（貸与中）', `${coolersOut(r, id)}`]],
      };
    }
    case 'warehouse': {
      const w = r.get<Warehouse>('dm.master.warehouses', id);
      if (!w) return null;
      const o = opsRowOf(r, 'warehouse', id);
      const a = w.address ?? { zip: '', pref: '', city: '', addr1: '', addr2: '' };
      return {
        form: {
          status: w.status === '削除済' ? '有効' : w.status, name: w.name, slipName: w.slipName ?? w.name, kana: w.kana ?? '', kind: whKind(w, o), relayKind: relayKindOf(w),
          carrierId: w.carrierId, branchCode: w.branchCode, thomas: w.thomasCode, note: w.note ?? '',
          zip: a.zip, pref: a.pref, city: a.city, addr1: a.addr1, addr2: a.addr2, tel: w.tel, fax: w.fax ?? '',
          contacts: warehouseContacts(r, w).map(rowOfContact),
        },
        status: w.status === '削除済' ? '削除済' : w.status, name: w.name, data: w, extra: [],
      };
    }
    case 'driver': {
      const d = r.get<Driver>('dm.master.drivers', id);
      if (!d) return null;
      const acc = driverAccount(r, id);
      return {
        form: {
          name: d.name, kana: d.kana, carrierId: d.carrierId, staffKind: staffKindOf(d), status: d.status === '削除済' ? '有効' : d.status, tel: d.tel, license: licenseOf(d),
          loginId: d.id, email: d.email, lastLogin: acc?.lastLoginAt || '',
        },
        status: d.status, name: d.name, data: d, extra: [],
      };
    }
  }
}

/** 委託配送先の画面の値（詳細・編集。CSV取込の変更履歴の文にも使う） */
export function consignForm(a: CarrierAll): FormVals {
  const c = a.c;
  return {
    name: c.name, kana: a.kana, status: c.status === '削除済' ? '有効' : c.status, kind: c.kind === '路線' ? '路線（中継あり）' : c.kind, temps: c.temps ?? [],
    payTerms: a.payTerms, fee: String(c.feePerDelivery ?? 0), areaFees: (c.areaFees ?? []).map((x) => `${x.area}:${x.feeYen}`).join(' / '), track: c.trackingUrl, note: a.note,
    zip: a.zip, pref: a.pref, city: a.city, addr1: a.addr1, addr2: a.addr2, tel: a.tel, fax: a.fax,
    prefs: a.prefs, ngDays: a.ngDays, areaNote: a.areaNote, cars: a.cars, frz: a.frz, ref: a.ref, sp: a.sp, carNote: a.carNote,
    contacts: a.contacts.map(rowOfContact),
  };
}

/**
 * 委託配送先を書く（画面の保存・CSV取込で同じ）。共通データ（master.create／update）・担当者（dm.org.contacts）・プロフィール（carrier.profiles）。
 * 対応エリアは都道府県、対応曜日は配送不可曜日から作る（配送の画面の表示に使う）。hist＝変更履歴の文。返り値＝ID
 */
export function putCarrierAll(r: DocRepo, id: string | null, a: CarrierAll, by: string, hist: string): string {
  const { c } = a;
  const patch: Partial<Carrier> = {
    name: c.name, kind: c.kind, areas: a.prefs, weekdays: weekdaysOfNg(a.ngDays), temps: c.temps, feePerDelivery: c.feePerDelivery, trackingUrl: c.trackingUrl,
    status: c.status, payTerms: a.payTerms, note: a.note,
  };
  const areaFees = c.areaFees ?? [];
  let cid = id;
  if (cid) {
    const cur = r.get<Carrier>('dm.master.carriers', cid)!;
    const { areaFees: _a, ...rest } = cur;
    /* エリア別の支払額は空＝なし（項目を消す） */
    r.put<Carrier>('dm.master.carriers', cid, areaFees.length ? cur : (rest as Carrier));
    master.actions.update(r, { kind: 'carriers', id: cid, patch: { ...patch, ...(areaFees.length ? { areaFees } : {}) }, by, hist });
  } else {
    cid = nextNo(carriers(r).map((x) => x.id), 'DE', 5);
    master.actions.create(r, { kind: 'carriers', data: { ...patch, id: cid, ...(areaFees.length ? { areaFees } : {}) } as Carrier, by, hist });
  }
  const contacts = putCarrierContacts(r, cid, a.contacts);
  putCarrierProfile(r, cid, {
    kana: a.kana, zip: zipOf(a.zip), pref: a.pref, city: a.city, addr: a.addr1, bld: a.addr2, tel: a.tel, fax: a.fax,
    contacts, areas: a.prefs.map(shortPref), ngDays: a.ngDays, areaNote: a.areaNote, cars: a.cars, frz: a.frz, ref: a.ref, sp: a.sp, carNote: a.carNote,
  });
  return cid;
}

/** 選択肢（所属先・運営している委託配送会社）。今の値は選べなくても出す */
export function genFormOpts(r: DocRepo, key: MKey, cur?: FormVals): Record<string, Opt[]> {
  if (key === 'driver') {
    const xs = carriers(r).filter((c) => c.status === '有効' || c.id === cur?.carrierId);
    return { carrierId: xs.map((c) => ({ v: c.id, l: c.kind === '自社' ? 'ES配送便（自社）' : `${c.name}（${c.id}）`, ...(c.kind === '自社' ? { self: true } : {}) })) };
  }
  if (key === 'warehouse') {
    const xs = carriers(r).filter((c) => c.kind !== '自社' && (c.status !== '削除済' || c.id === cur?.carrierId));
    return { carrierId: xs.map((c) => ({ v: c.id, l: `${c.name}（${c.id}）` })) };
  }
  return {};
}

/** 詳細・編集の値（ないときは null） */
export function genRec(r: DocRepo, key: MKey, id: string) {
  const x = rawOf(r, key, id);
  if (!x) return null;
  const deleted = x.status === '削除済';
  const labels: Record<string, string> = {};
  if (key === 'driver') labels.carrierId = carrierLabel(r.get<Carrier>('dm.master.carriers', str(x.form, 'carrierId'))) || str(x.form, 'carrierId');
  if (key === 'warehouse' && str(x.form, 'carrierId')) labels.carrierId = carriers(r).find((c) => c.id === str(x.form, 'carrierId'))?.name ?? str(x.form, 'carrierId');
  const acc = key === 'warehouse' ? undefined : r.get<Account>('dm.account.accounts', id);
  const mail = passwordTo(r, key, id, x.form);
  return {
    id, name: x.name, status: x.status, deleted, form: x.form, labels, extra: x.extra, account: accountState(r, key, id),
    /** パスワード送信（仕入先・委託配送先・配送スタッフ。アカウントが 未発行・無効・削除済 のときは押せない） */
    password: key === 'warehouse' ? null : { to: mail, ok: !deleted && canSendPassword(acc) && !!mail },
    opts: genFormOpts(r, key, x.form), version: versionOfData(x.data),
  };
}

/** 変更履歴（新しい順。P-HIST） */
export const genHistory = (r: DocRepo, key: MKey, id: string) => partnerHistory(r, HIST_KIND[key], id);

/* ---------- 保存 ---------- */

/** by＝操作した人（変更履歴の変更者。サーバーはログイン中のアカウント） */
export type SaveArgs = { key: MKey; id?: string; form: FormVals; baseVersion?: string; force?: boolean; by?: string };

/** 登録・保存。返り値＝ID と新しい版 */
export function saveGen(r: DocRepo, a: SaveArgs): { id: string; version: string } {
  const mode = a.id ? 'edit' : 'new';
  const cur = a.id ? rawOf(r, a.key, a.id) : null;
  if (a.id && !cur) bad('データが見つかりません', 404);
  if (cur?.status === '削除済') bad(MSG.E36);
  if (cur) assertFresh(versionOfData(cur.data), a.baseVersion, a.force);
  const v = normalizeForm(a.key, a.form);
  /* 登録後は変えない項目・システムが決める項目は今の値 */
  if (cur) for (const f of shownFields(a.key, cur.form)) if (f.newOnly || f.auto) v[f.k] = cur.form[f.k];
  /* 委託配送先の 1件の支払額・エリア別の支払額は画面に出さない（CSV取込で直す）。編集は今の値のまま、新規はなし */
  if (a.key === 'consign') { v.fee = cur ? cur.form.fee : '0'; v.areaFees = cur ? cur.form.areaFees : ''; }
  const errs = validateForm(a.key, v, mode);
  const first = Object.values(errs)[0];
  if (first) bad(first);
  const hist = cur ? formDiff(a.key, cur.form, v) : 'データ登録';
  const id = SAVE[a.key](r, a.id ?? null, v, hist, a.by || DEFAULT_BY);
  return { id, version: versionOfData(rawOf(r, a.key, id)?.data) };
}

const SAVE: Record<MKey, (r: DocRepo, id: string | null, v: FormVals, hist: string, by: string) => string> = {
  supplier(r, id, v, hist, by) {
    const cur = id ? getSupplierRec(r, id) : undefined;
    if (cur && ['申込中', '却下'].includes(cur.status)) bad(`${cur.status}の仕入先は申込の確認から処理してください`, 409);
    const sid = cur?.id ?? nextSupplierId(r);
    const base: SupplierRec = cur ?? { ...blankSupplier(sid), status: '未発行' };
    const addresses = rowsOf(v, 'addresses').map((x, i): SupplierAddress => ({
      kind: i === 0 ? '本社' : '製造場所', zip: zipOf(x.zip ?? ''), pref: x.pref ?? '', city: x.city ?? '', addr1: x.addr1 ?? '', addr2: x.addr2 ?? '', tel: x.tel ?? '', fax: x.fax ?? '',
    }));
    const contacts = rowsOf(v, 'contacts').map((x, i) => ({ kind: i === 0 ? 'メイン担当者' : 'サブ担当者', name: x.name ?? '', kana: x.kana ?? '', mail: x.email ?? '', tel: x.tel ?? '' }));
    const next = withParts({
      ...base, name: str(v, 'name'), kana: str(v, 'kana'), goods: list(v, 'goods').join('・'), kind: str(v, 'kind'),
      bizDay: str(v, 'biz') === 'はい' ? 'はい' : 'いいえ', method: str(v, 'method') || 'ESステーション', note: str(v, 'note'),
    }, addresses, contacts);
    r.put<SupplierRec>(SUPPLIERS, sid, next);
    addPartnerHistory(r, 'suppliers', sid, hist, by);
    return sid;
  },
  consign(r, id, v, hist, by) {
    const base = id ? r.get<Carrier>('dm.master.carriers', id)! : ({ id: '', name: '', kind: '委託・引き取り', areas: [], weekdays: '', temps: [], feePerDelivery: 0, trackingUrl: '', status: '有効' } as Carrier);
    const areaFees = parseAreaFees(str(v, 'areaFees').split(AREA_FEE_SPLIT).join('・'));
    const c: Carrier = {
      ...base, name: str(v, 'name'), kind: str(v, 'kind') === '委託・引き取り' ? '委託・引き取り' : '路線', temps: list(v, 'temps') as Carrier['temps'],
      feePerDelivery: Number(str(v, 'fee').replace(/,/g, '') || 0), trackingUrl: str(v, 'track'), status: str(v, 'status') === '無効' ? '無効' : '有効', areaFees,
    };
    return putCarrierAll(r, id, {
      c, kana: str(v, 'kana'), zip: str(v, 'zip'), pref: str(v, 'pref'), city: str(v, 'city'), addr1: str(v, 'addr1'), addr2: str(v, 'addr2'), tel: str(v, 'tel'), fax: str(v, 'fax'),
      prefs: list(v, 'prefs'), ngDays: list(v, 'ngDays'), areaNote: str(v, 'areaNote'), cars: list(v, 'cars'), frz: str(v, 'frz'), ref: str(v, 'ref'), sp: str(v, 'sp'), carNote: str(v, 'carNote'),
      payTerms: str(v, 'payTerms'), note: str(v, 'note'), contacts: rowsOf(v, 'contacts').map(contactOfRow),
    }, by, hist);
  },
  warehouse(r, id, v, hist, by) {
    const kind = str(v, 'kind');
    const type: Warehouse['type'] = kind === '中継倉庫' ? 'relay' : kind === '返送先' ? 'return' : 'picking';
    const relay = type === 'relay';
    const relayKind = relay ? (str(v, 'relayKind') as Warehouse['relayKind']) : undefined;
    const viaCarrier = relay && relayKind === '運送会社';
    const contacts = rowsOf(v, 'contacts').map(contactOfRow);
    const patch: Omit<Warehouse, 'id'> = {
      type, name: str(v, 'name'), address: { zip: zipOf(str(v, 'zip')), pref: str(v, 'pref'), city: str(v, 'city'), addr1: str(v, 'addr1'), addr2: str(v, 'addr2') },
      tel: str(v, 'tel'), thomasCode: relay ? '' : str(v, 'thomas'), carrierId: viaCarrier ? str(v, 'carrierId') : '', branchCode: relay ? str(v, 'branchCode') : '',
      status: str(v, 'status') === '無効' ? '無効' : '有効',
      slipName: str(v, 'slipName'), kana: str(v, 'kana'), fax: str(v, 'fax'), note: str(v, 'note'), contacts,
      ...(relayKind ? { relayKind } : {}),
      ...(type === 'picking' ? { forMaterial: kind === 'ピッキング倉庫（資材）' } : {}),
    };
    if (viaCarrier && !r.get('dm.master.carriers', patch.carrierId)) bad(MSG.E01('運営している委託配送会社'));
    let wid = id;
    if (wid) master.actions.update(r, { kind: 'warehouses', id: wid, patch: patch as unknown as Record<string, unknown>, by, hist });
    else {
      wid = nextNo(r.list<Warehouse>('dm.master.warehouses').map((w) => w.id), { picking: 'WH', relay: 'HU', return: 'RT' }[type], 5);
      master.actions.create(r, { kind: 'warehouses', data: { ...patch, id: wid } as unknown as { id: string }, by, hist });
    }
    /* 一覧の担当者の列（運営の見本の行 general.warehouse）もメイン担当者にそろえる */
    const o = opsRowOf(r, 'warehouse', wid);
    const uid = s(o?._uid) || `w${wid}`;
    r.put<GenRow>(opsKind('warehouse'), uid, { ...(o ?? {}), _uid: uid, id: wid, name: patch.name, pic: contacts[0]?.name ?? '', picTel: contacts[0]?.tel ?? '' });
    return wid;
  },
  driver(r, id, v, hist, by) {
    const email = str(v, 'email');
    if (r.list<Driver>('dm.master.drivers').some((d) => d.id !== id && d.status !== '削除済' && d.email.toLowerCase() === email.toLowerCase())) bad(MSG.E09('メールアドレス'), 409);
    const lic = str(v, 'license');
    if (lic && lic !== SAMPLE_LICENSE && !/^data:image\/(png|jpe?g|gif|webp|svg\+xml)[;,]/.test(lic)) bad('免許証の写真は画像のファイルを選んでください。');
    if (lic.length > 7_000_000) bad('免許証の写真は5MBまでです。');
    const staffKind = str(v, 'staffKind') === '個人' ? '個人' : '会社所属';
    let status = str(v, 'status') as Driver['status'];
    /* 免許証の写真がなく、アカウントもないスタッフは「免許未登録」（台帳 K・hong 2026-10-06） */
    const acc = id ? driverAccount(r, id) : undefined;
    if (!lic && (!acc || acc.status === '削除済')) status = '免許未登録';
    if (id) {
      const d = r.get<Driver>('dm.master.drivers', id)!;
      const licenseImg = lic === SAMPLE_LICENSE ? d.licenseImg : lic;
      const { licenseImg: _l, ...rest } = d;
      if (licenseImg !== d.licenseImg || staffKind !== d.staffKind) {
        r.put<Driver>('dm.master.drivers', id, { ...rest, staffKind, ...(licenseImg ? { licenseImg } : {}) });
      }
      master.actions.updateDriver(r, { id, name: str(v, 'name'), kana: str(v, 'kana'), tel: str(v, 'tel'), email, status, by, hist });
      return id;
    }
    const c = r.get<Carrier>('dm.master.carriers', str(v, 'carrierId'));
    if (!c || c.status !== '有効') bad(MSG.E01('所属先'));
    const employment: Driver['employment'] = c!.kind === '自社' ? 'self' : 'partner';
    const n = master.actions.addDriver(r, {
      carrierId: c!.id, name: str(v, 'name'), kana: str(v, 'kana'), tel: str(v, 'tel'), email, employment, areas: [], staffKind, ...(lic ? { licenseImg: lic } : {}), by,
    });
    if (status && status !== '有効') master.actions.setDriverStatus(r, { id: n.id, status, by, hist: '' });
    return n.id;
  },
};

/* ---------- 削除（論理削除・使用中は削除できない） ---------- */

/** 使用中のときの文言（E241〜E244）。0件なら '' */
export function deleteBlocked(r: DocRepo, key: MKey, id: string): string {
  switch (key) {
    case 'supplier': { const n = supplierInUse(r, id); return n ? `進行中の発注 ${n}件があるため削除できません。` : ''; }
    case 'warehouse': { const n = warehouseInUse(r, id); return n ? `在庫または利用中の契約 ${n}件があるため削除できません。` : ''; }
    case 'consign': { const n = carrierInUse(r, id); return n ? `利用中の契約・配送予定、または所属する配送スタッフ ${n}件があるため削除できません。` : ''; }
    case 'driver': { const n = driverInUse(r, id); return n ? `割り当て済みの配送 ${n}件があるため削除できません。` : ''; }
  }
}

export function deleteGen(r: DocRepo, key: MKey, id: string, by = DEFAULT_BY) {
  const x = rawOf(r, key, id);
  if (!x) bad('データが見つかりません', 404);
  if (x!.status === '削除済') bad(MSG.E36);
  const why = deleteBlocked(r, key, id);
  if (why) bad(why, 409);
  switch (key) {
    case 'supplier': r.put<SupplierRec>(SUPPLIERS, id, { ...getSupplierRec(r, id)!, status: '削除済' }); addPartnerHistory(r, 'suppliers', id, '削除', by); break;
    case 'consign': master.actions.update(r, { kind: 'carriers', id, patch: { status: '削除済' }, by }); break;
    case 'warehouse': master.actions.update(r, { kind: 'warehouses', id, patch: { status: '削除済' }, by }); break;
    case 'driver': master.actions.setDriverStatus(r, { id, status: '削除済', by }); break;
  }
  /* 仕入先は共通 DB の行を直接書くので、ここでアカウントを止める（ほかは master の action が止める） */
  if (key === 'supplier') syncPartnerAccounts(r, { type: PARTNER[key], id, status: '削除済', by });
}

/* ---------- パスワード送信（Q173 → S173） ---------- */

/** パスワード設定（再設定）の案内を送る。宛先＝メイン担当者（配送スタッフは本人）のメール。返り値＝送ったメールアドレス */
export function sendPassword(r: DocRepo, key: MKey, id: string, by = DEFAULT_BY) {
  if (key === 'warehouse') bad('倉庫にはパスワード送信はありません');
  const x = rawOf(r, key, id);
  if (!x) bad('データが見つかりません', 404);
  if (x!.status === '削除済') bad(MSG.E36);
  const acc = r.get<Account>('dm.account.accounts', id);
  if (!canSendPassword(acc)) bad('アカウントが「未発行」「無効」「削除済」のため送れません。', 409);
  const to = passwordTo(r, key, id, x!.form);
  if (!to) bad(MSG.E01('メールアドレス'));
  notify(r, {
    to: { site: acc!.site, accountId: id, role: '' }, channels: ['mail'], templateId: 'password_setup', link: { type: '', id: '' },
    title: 'ES Station パスワード設定のご案内',
    body: `${x!.name} 様\nログインID ${acc!.loginId} のパスワード設定のご案内です。メールのリンクからパスワードを設定してください。\n送り先：${to}`,
  });
  addPartnerHistory(r, HIST_KIND[key], id, 'パスワード設定のご案内を送信', by);
  return { to };
}

/* ---------- 委託配送先の ES配送費（CSV取込・CSV出力で直す。画面は表示だけ） ---------- */

export const ES_FEES = 'dm.master.carrierEsFees';
/** ES配送費の全部。見本を入れる前に作った共通 DB（data/es.db）には行がないので、そのときは見本を読む（取込で書くときに見本も入れる：ensureEsFees） */
const allEsFees = (r: DocRepo) => { const xs = r.list<CarrierEsFee>(ES_FEES); return xs.length ? xs : CARRIER_ES_FEES; };
export const esFeesOf = (r: DocRepo, carrierId: string) =>
  allEsFees(r).filter((x) => x.carrierId === carrierId).sort((a, b) => a.id.localeCompare(b.id));
/** 取込で書く前に、見本だけを読んでいる DB に見本の行を入れる */
export function ensureEsFees(r: DocRepo) {
  if (!r.list(ES_FEES).length) for (const x of CARRIER_ES_FEES) r.put<CarrierEsFee>(ES_FEES, x.id, x);
}
