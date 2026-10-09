import type { DocRepo } from '../core/area';
import { getSupplierRec, listSuppliers, supplierRow } from './suppliers';
import { carrierContacts, carrierProfile, licenseOf, staffKindOf } from './partnerParts';
import type {
  AppUser,
  Account, Announcement, AppVersion, Carrier, Cooler, Driver, IpRule, Product, Role, Site, SiteSetting, TaxRate, Warehouse,
} from '@/lib/domain/types';
import { NT_KEYS, ntModeText, ntTgText, ntTodayStatus } from './logic';
import type { GenKey, GenRow, NoticeDetail, NoticeForm, NoticeTarget } from './types';
import { yen } from '@/lib/format/money';
import { areaFeesText } from '@/lib/domain/carrierFee';
import { TAX_STD, taxLabel } from '@/lib/domain/tax';
import { costOn, jansOf, mgmtNameOf, shelfText, shortLabel, supplierNameOf } from '@/lib/domain/product';

/*
 * 共通データ（dm.*）から、運営Web の一覧だけの画面の行（GenRow）を作る。列のキーは画面（app/ops/_general/gen.ts）のまま。
 * 共通データにない列（商品の仕入単価・資材のコース／JAN・倉庫の担当者・お知らせのメール設定など）は、
 * 運営の見本（general.<key> の行。ID で引く）を重ねる。
 *   product → dm.master.products   consign → dm.master.carriers（＋dm.org.contacts・保冷バッグの数）
 *   warehouse → dm.master.warehouses   driver → dm.master.drivers（＋所属先・アカウントの状態）   cooler → dm.carrier.coolers
 *   perm → dm.account.roles（運営）   version → dm.account.appVersions   ip → dm.account.ipRules
 *   accounts → dm.account.accounts（ユーザー＝アプリの利用者は dm.app.users）
 *   notices → dm.notice.announcements（配信方法・メール・個別選択・アプリユーザーは運営の見本 general.noticeDetail）
 */

/** 運営の見本の行（ID で引く。共通データにない列だけ使う） */
export const opsKind = (key: GenKey) => `general.${key}`;
export const NOTICE_DETAIL = 'general.noticeDetail';
const overlay = (r: DocRepo, key: GenKey) => {
  const m = new Map<string, GenRow>();
  for (const x of r.list<GenRow>(opsKind(key))) if (x.id != null) m.set(String(x.id), x);
  return m;
};
export const opsRowOf = (r: DocRepo, key: GenKey, id: string) => r.list<GenRow>(opsKind(key)).find((x) => String(x.id) === id);

const s = (v: unknown) => (v == null ? '' : String(v));
const carrierName = (r: DocRepo, id: string) => r.get<Carrier>('dm.master.carriers', id)?.name ?? id;

/* ---------- 商品・資材 ---------- */

/** 商品に運営が付けた項目（いまは共通データの Product の項目。master.update で直す） */
export type ProductExtra = { pickWarehouseIds?: string[]; status?: string };
type Prod = Product & ProductExtra;

export const supplierName = (r: DocRepo, id: string) =>
  r.get<Account>('dm.account.accounts', id)?.name || getSupplierRec(r, id)?.name || id;

/** 倉庫区分（運営の画面の言い方）。ES事務所（資材）は運営の見本で ピッキング倉庫（資材） */
export function whKind(w: Warehouse, o?: GenRow) {
  if (w.type === 'picking') return w.forMaterial !== undefined ? (w.forMaterial ? 'ピッキング倉庫（資材）' : 'ピッキング倉庫') : s(o?.kind) === 'ピッキング倉庫（資材）' || w.name.includes('資材') ? 'ピッキング倉庫（資材）' : 'ピッキング倉庫';
  return w.type === 'relay' ? '中継倉庫' : '返送先';
}
/** 商品の編集で選べるピッキング倉庫（ピッキング倉庫・有効） */
export function pickWarehouses(r: DocRepo) {
  const o = overlay(r, 'warehouse');
  return r.list<Warehouse>('dm.master.warehouses').filter((w) => whKind(w, o.get(w.id)) === 'ピッキング倉庫' && w.status === '有効');
}

export function productRow(r: DocRepo, p: Prod, o?: GenRow): GenRow {
  /* 短消費期限は商品の区分（shelfLife.shortClass）から。タグではない（RD-MN-099） */
  const short = !!shortLabel(p);
  /* 仕入単価＝選択中の仕入先の仕入単価（税抜）。粗利率は販売価格（税込）を税抜にして出す */
  const sel = p.suppliers?.find((x) => x.selected);
  /* 仕入単価の改定（RD-MN-076）は適用開始日から */
  const cost = sel ? String(costOn(sel)) : s(o?.cost);
  const rate = r.get<TaxRate>('dm.master.taxRates', p.taxRateId ?? '')?.rate;
  const net = rate != null ? p.priceYen / (1 + rate / 100) : p.priceYen;
  const wh = r.list<Warehouse>('dm.master.warehouses');
  const pick = p.pickWarehouseIds ? p.pickWarehouseIds.map((id) => wh.find((w) => w.id === id)?.name ?? id).join('・') : s(o?.pick);
  /* 保管情報＝保管方法（表示用）、検索の「保管方法（管理用）」＝keepAdmin */
  const keep = p.storage?.display ?? p.temp;
  return {
    /* 運営の一覧は管理名（品番と並べる）。公開名（法人・アプリ）は検索にかかるように持つ（英語名は列に出すだけ・検索しない：受付簿 #245）。pname＝仕入先向けの名前（2026/10/03 決定） */
    _uid: p.id, id: p.id, name: mgmtNameOf(p), pubName: p.name, nameEn: p.nameEn ?? '', pname: supplierNameOf(p), cat: p.category,
    course: (p.courses ?? []).join('・') || '—', exp: p.shelfLife?.esValue ? `${shelfText(p)}${shortLabel(p) ? `（${p.shelfLife.shortClass}）` : ''}` : '—', keep, keepAdmin: p.storage?.admin ?? p.temp,
    sup: p.supplierId ? supplierName(r, p.supplierId) : s(o?.sup), cost: sel ? yen(+cost) : cost, price: yen(p.priceYen),
    /* 粗利率は小数2桁まで（例 10.99%・10.5%・41%） */
    gm: cost && p.priceYen ? `${Number((((net - +cost) / net) * 100).toFixed(2))}%` : s(o?.gm),
    /* 商品タグ・営業サンプルは商品マスタの一覧に出さない（メニューで指定する。台帳 F 2026-10-08） */
    jan: jansOf(p).join(';'), pick, short,
    ...(p.status ? { status: p.status } : {}),
  };
}

/* ---------- 配送関連 ---------- */

/** 貸与中の保冷バッグの数 */
const coolersOut = (r: DocRepo, carrierId: string) =>
  r.list<Cooler>('dm.carrier.coolers').filter((b) => b.carrierId === carrierId && b.kind === '保冷バッグ' && b.status === '貸与中').reduce((t, b) => t + b.qty, 0);

function consignRow(r: DocRepo, c: Carrier, o?: GenRow): GenRow {
  /* メイン担当者・住所は委託配送先の担当者・プロフィール（lib/ops/general/partnerParts.ts。運営の画面・委託配送先Web で同じ） */
  const ct = carrierContacts(r, c.id)[0];
  const p = carrierProfile(r, c.id);
  const acc = r.get<Account>('dm.account.accounts', c.id);
  return {
    _uid: c.id, id: c.id, name: c.name, kind: c.kind === '路線' ? '路線（中継あり）' : c.kind, area: c.areas.join('・'), days: c.weekdays,
    addr: p ? `${p.zip ? `〒${p.zip} ` : ''}${p.pref}${p.city}${p.addr}${p.bld ? ` ${p.bld}` : ''}`.trim() || '—' : '—',
    fee: c.kind === '委託・引き取り' ? (c.areaFees?.length ? `エリア別（${areaFeesText(c)}）` : `1件 ${yen(c.feePerDelivery)}`) : s(o?.fee) || '運賃表（送り状ごと）',
    cool: String(coolersOut(r, c.id)), pic: ct?.name ?? s(o?.pic), tel: ct?.tel ?? s(o?.tel),
    /* 状態：止めた会社は無効、アカウントがあれば本登録、なければ未発行 */
    status: c.status === '無効' || c.status === '削除済' ? c.status : acc && acc.status !== '削除済' ? '本登録' : '未発行',
    track: c.trackingUrl || s(o?.track) || '（未設定）',
  };
}

function warehouseRow(w: Warehouse, o?: GenRow): GenRow {
  const a = w.address;
  /* 担当者はメイン担当者（倉庫の登録・編集の担当者の表。古い倉庫は運営の見本の行 pic・picTel） */
  const main = w.contacts?.find((c) => c.kind === 'メイン担当者') ?? w.contacts?.[0];
  return {
    _uid: w.id, id: w.id, name: w.name, kind: whKind(w, o), addr: `${a.pref}${a.city}${a.addr1}${a.addr2}`, area: s(o?.area) || '—',
    pic: main ? main.name : s(o?.pic), tel: (main ? main.tel : s(o?.picTel)) || w.tel || s(o?.tel), status: w.status === '削除済' ? '削除済' : w.status,
    thomas: w.type === 'relay' ? '—' : w.thomasCode ? 'あり' : 'なし', tcode: w.thomasCode || '—',
  };
}

function driverRow(r: DocRepo, d: Driver): GenRow {
  const acc = r.get<Account>('dm.account.accounts', d.id);
  return {
    /* 区分は 個人／会社所属（hong 2026-10-06）。免許＝免許証の写真（一覧はサムネイル） */
    _uid: d.id, id: d.id, name: d.name, org: d.carrierId === 'DE00000' ? 'ES配送便' : carrierName(r, d.carrierId), kind: staffKindOf(d), tel: d.tel,
    status: d.status, lic: licenseOf(d) ? 1 : 0, licImg: licenseOf(d).length < 400_000 ? licenseOf(d) : '', cid: d.carrierId, acct: acc?.status ?? '未発行',
  };
}

const coolerRow = (r: DocRepo, c: Cooler): GenRow => ({
  _uid: c.id, no: c.id, kind: c.kind, qty: String(c.qty), cid: c.carrierId, did: c.driverId, carrier: carrierName(r, c.carrierId), pref: c.pref,
  staff: c.driverId ? `${c.driverId} ${r.get<Driver>('dm.master.drivers', c.driverId)?.name ?? ''}`.trim() : '—', date: c.issuedOn, status: c.status, memo: c.memo,
});

/* ---------- アカウント・権限・設定 ---------- */

const usersOf = (r: DocRepo, roleId: string) => r.list<Account>('dm.account.accounts').filter((a) => a.roleIds.includes(roleId) && a.status !== '削除済').length;
const permRow = (r: DocRepo, x: Role): GenRow => ({ _uid: x.id, id: x.id, name: x.name, note: x.note, users: String(usersOf(r, x.id)), status: x.status ?? '有効' });
const versionRow = (v: AppVersion): GenRow => ({ _uid: v.id, id: v.id, os: v.os === 'iOS' ? 'IOS' : v.os, ver: v.version, note: v.note, force: v.force ? 'ON' : 'OFF', upd: v.updatedAt });
const ipRow = (x: IpRule): GenRow => ({ _uid: x.id, id: x.id, note: x.note, ip: x.cidr.replace(/\/32$/, ''), sites: x.sites.join('・') });

/** アカウント一覧のタブ（0 運営・1 拠点・2 ユーザー・3 委託配送・4 仕入先・5 配送スタッフ）。倉庫スタッフは運営のロールの1つなので運営タブ（hong 2026-10-07） */
export const ACCOUNT_TABS = ['運営', '拠点', 'ユーザー', '委託配送', '仕入先', '配送スタッフ'] as const;
/** ユーザー（アプリの利用者 U＋8桁。dm.app.users）のタブ */
export const APP_USER_TAB = 2;
const appUserRow = (u: AppUser): GenRow => ({
  _uid: u.id, id: u.id, name: u.name, mail: u.email, role: 'アプリユーザー', status: u.status, last: u.lastLoginAt, tab: APP_USER_TAB, noLink: true,
});
function tabOf(a: Account): number {
  if (a.site === 'ops') return 0;
  return ({ corp: 1, carrier: 3, supplier: 4, driver: 5 } as Partial<Record<Site, number>>)[a.site] ?? -1;
}
/** アカウントの名前を押したとき行く先（法人・拠点・委託配送・仕入先は各マスタの詳細。運営・倉庫・配送スタッフはモーダルなので無し：受付簿 No.172） */
function accountHref(a: Account): string | undefined {
  const sc = a.scope;
  if (sc.type === 'corp') return `/ops/corps/${sc.corpId}`;
  if (sc.type === 'branch') return `/ops/branches/${sc.branchId}`;
  if (sc.type === 'carrier') return `/ops/masters/consignees/${sc.carrierId}`;
  if (sc.type === 'supplier') return `/ops/masters/suppliers/${sc.supplierId}`;
  return undefined;
}
function accountRow(roles: Role[], a: Account, tab: number): GenRow {
  return {
    _uid: a.id, id: a.id, name: a.name, mail: a.email, role: a.roleIds.map((id) => roles.find((x) => x.id === id)?.name ?? id).join(', '),
    status: a.status, last: a.lastLoginAt || '—', tab, href: accountHref(a),
  };
}

/* ---------- お知らせ ---------- */

/** 配信対象の区分 → 共通データのサイト（アプリユーザーは共通データにない） */
export const NT_SITE: Record<string, Site | null> = { corp: 'corp', app: null, dlv: 'carrier', staff: 'driver', sup: 'supplier' };
const OFF: NoticeTarget = { ess: false, mail: [], mode: 'all', picks: [] };
/** メールの宛先の区分の名前（送信の記録に出す） */
const NT_MAIL_LABEL: Record<string, string> = { corp: '法人・拠点', app: 'アプリユーザー', dlv: '委託配送先', staff: '配送スタッフ', sup: '仕入先' };

/** お知らせの詳細（配信対象・期間・本文は共通データ、メール・個別選択・アプリユーザーは運営の見本） */
export function noticeDetailOf(a: Announcement, d?: NoticeDetail): NoticeDetail {
  /* 運営の詳細がないお知らせ（共通データの見本）は、共通データのメールの宛先（「区分：役割・役割」）から戻す */
  const mailOf = (k: string) => (a.mail?.to ?? []).map((x) => x.split('：')).find(([lb]) => lb === NT_MAIL_LABEL[k])?.[1]?.replace(/（(個別|条件).*$/, '').split('・').filter(Boolean) ?? [];
  const tg = Object.fromEntries(NT_KEYS.map((k) => {
    const site = NT_SITE[k], cur = d?.tg[k] ?? { ...OFF, mail: mailOf(k) };
    return [k, { ...cur, ess: site ? a.sites.includes(site) : cur.ess }];
  })) as Record<string, NoticeTarget>;
  const hm = (v: string | undefined, def: string) => (v && v.length >= 16 ? v.slice(11, 16) : def);
  return {
    tg, start: `${a.publishFrom} ${hm(d?.start, '00:00')}`, end: a.publishTo ? `${a.publishTo} ${hm(d?.end, '23:59')}` : '',
    files: a.files.length, body: a.body, subj: d?.subj || a.mail?.subject || a.title, mailAt: d?.mailAt ?? a.mail?.sendAt ?? '', mailBody: d?.mailBody ?? '',
  };
}
export function noticeRow(a: Announcement, d: NoticeDetail, o?: GenRow): GenRow {
  const essSites = a.sites.filter((x) => Object.values(NT_SITE).includes(x));
  const how = NT_KEYS.some((k) => d.tg[k].mail.length) || a.mail ? (essSites.length || d.tg.app?.ess ? 'ESS＋メール' : 'メールのみ') : 'ESSのみ';
  const stopped = ['配信停止', '削除済'].includes(s(o?.status));
  const period = `${a.publishFrom}〜${a.publishTo ? a.publishTo.slice(5) : ''}`;
  return {
    _uid: a.id, id: a.id, cat: a.category, title: a.title, how, att: String(a.files.length),
    upd: s(o?.upd) || a.publishFrom.replace(/\//g, '-') + ' ' + d.start.slice(11),
    send: s(o?.send) || (how !== 'ESSのみ' && d.mailAt ? d.mailAt : d.start).replace(/\//g, '-'),
    /* 削除・配信停止のときは止めたときの期間（共通データは公開を終わらせてある） */
    period: stopped && o?.period ? s(o.period) : period,
    status: stopped ? s(o?.status) : ntTodayStatus(d.start, d.end), tgsTxt: ntTgText(d), sites: a.sites.join('・') || '—（メールのみ）',
  };
}
export const announcements = (r: DocRepo) => r.list<Announcement>('dm.notice.announcements');
export function noticeOf(r: DocRepo, id: string) {
  const a = r.get<Announcement>('dm.notice.announcements', id);
  if (!a) return null;
  const detail = noticeDetailOf(a, r.get<NoticeDetail>(NOTICE_DETAIL, id));
  return { a, detail, row: noticeRow(a, detail, opsRowOf(r, 'notices', id)) };
}
/** 運営の画面のフォーム → 共通データのお知らせ（ops・sysadmin あてのサイトは残す） */
export function announcementOf(form: NoticeForm, cur?: Announcement): Omit<Announcement, 'id'> {
  const keep = (cur?.sites ?? []).filter((x) => !Object.values(NT_SITE).includes(x));
  const sites = [...keep, ...NT_KEYS.map((k) => (form.tg[k].ess ? NT_SITE[k] : null)).filter((x): x is Site => !!x)];
  const files = Array.from({ length: form.files }, (_, i) => cur?.files[i] ?? `添付${i + 1}`);
  /* メールの宛先（区分：宛先）。メールだけのお知らせ（サイトなし）も置ける（課題 5-4） */
  const mailTo = NT_KEYS.filter((k) => form.tg[k].mail.length).map((k) => `${NT_MAIL_LABEL[k] ?? k}：${form.tg[k].mail.join('・')}${ntModeText(form.tg[k])}`);
  const mailAt = (form.mailAt || form.start).replace(/-/g, '/').slice(0, 16);
  return {
    sites, category: form.cat, important: form.important ?? cur?.important ?? false, title: form.title, body: form.body,
    publishFrom: form.start.slice(0, 10), publishTo: form.end ? form.end.slice(0, 10) : '', files,
    ...(mailTo.length ? { mail: { subject: form.subj || form.title, sendAt: mailAt, to: mailTo } } : {}),
  };
}

/* ---------- 一覧 ---------- */

/** 一覧だけの画面の行（共通データから）。supplier は共通データにないので null（運営の見本を読む） */
export function genRowsFromDomain(r: DocRepo, key: GenKey, tab = 0): GenRow[] | null {
  switch (key) {
    case 'product': {
      const o = overlay(r, 'product');
      /* 削除済も出す（一覧の「状態」で絞り込む：受付簿 #232） */
      return r.list<Prod>('dm.master.products').map((p) => productRow(r, p, o.get(p.id)));
    }
    case 'consign': {
      const o = overlay(r, 'consign');
      /* DE00000＝ES配送便（自社）は自社ドライバーの所属先で、委託配送先ではない */
      return r.list<Carrier>('dm.master.carriers').filter((c) => c.kind !== '自社').map((c) => consignRow(r, c, o.get(c.id)));
    }
    case 'warehouse': {
      const o = overlay(r, 'warehouse');
      return r.list<Warehouse>('dm.master.warehouses').map((w) => warehouseRow(w, o.get(w.id)));
    }
    case 'driver': return r.list<Driver>('dm.master.drivers').map((d) => driverRow(r, d));
    /* 仕入先は共通 DB の suppliers（仕入先サイトと同じ置き場・課題 11）。削除済は出さない */
    case 'supplier': return listSuppliers(r).filter((x) => x.status !== '削除済').map(supplierRow);
    case 'cooler': return r.list<Cooler>('dm.carrier.coolers').map((c) => coolerRow(r, c));
    case 'perm': return r.list<Role>('dm.account.roles').filter((x) => x.site === 'ops').map((x) => permRow(r, x));
    case 'version': return r.list<AppVersion>('dm.account.appVersions').slice().sort((x, y) => y.updatedAt.localeCompare(x.updatedAt)).map(versionRow);
    case 'ip': return r.list<IpRule>('dm.account.ipRules').map(ipRow);
    case 'accounts': {
      /* ユーザー＝アプリの利用者（dm.app.users。法人Web の売上・ユーザー管理・レビューと同じ） */
      if (tab === APP_USER_TAB) return r.list<AppUser>('dm.app.users').map((u) => appUserRow(u));
      const roles = r.list<Role>('dm.account.roles');
      return r.list<Account>('dm.account.accounts').filter((a) => tabOf(a) === tab).map((a) => accountRow(roles, a, tab));
    }
    case 'notices':
      return announcements(r).slice().sort((x, y) => Number(y.id) - Number(x.id)).map((a) => {
        const d = noticeDetailOf(a, r.get<NoticeDetail>(NOTICE_DETAIL, a.id));
        return noticeRow(a, d, opsRowOf(r, 'notices', a.id));
      });
    default: return null;
  }
}

/** メンテナンス（サイトごと。システム管理は入れられない） */
export const siteMaint = (r: DocRepo) =>
  r.list<SiteSetting>('dm.account.siteSettings').filter((x) => x.id !== 'sysadmin').map((x) => ({ site: x.id, name: x.name, on: x.maintenance.on, message: x.maintenance.message }));
