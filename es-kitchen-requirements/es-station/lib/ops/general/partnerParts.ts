import type { DocRepo } from '../core/area';
import type { Contact as CarrierProfileContact, Profile } from '@/lib/carrier/types';
import { expandAreas, ngDaysOfWeekdays } from '@/lib/domain/prefs';
import type { Account, Carrier, Contact, Driver, PartnerContact, Warehouse } from '@/lib/domain/types';
import type { GenRow } from './types';
import { GOODS, PAY_TERMS, type FRow } from './masterForms';

/*
 * 委託配送先・倉庫・配送スタッフ・仕入先の、共通データの項目と運営の画面の項目のつなぎ（詳細・登録・編集・CSV で同じ）。
 *   委託配送先：名前・区分・対応エリア（都道府県）・温度帯・支払額・追跡URL・支払条件・備考・状態＝dm.master.carriers、
 *     カナ・住所・電話・FAX・配送不可曜日・対応エリアの備考・車両・設備＝carrier.profiles（委託配送先Web のプロフィールと同じ置き場）、
 *     担当者＝dm.org.contacts（メイン担当者・サブ担当者。委託配送先Web のプロフィールの担当者にも写す）
 *   古いデータ（地方の名前の対応エリア・対応曜日）は読むときに都道府県・配送不可曜日に直す（lib/domain/prefs.ts）
 */

export const PROFILES = 'carrier.profiles';
type ProfileDoc = Omit<Profile, 'name' | 'kind' | 'masterArea'>;

export const carrierProfile = (r: DocRepo, id: string) => r.get<ProfileDoc>(PROFILES, id);

/** 委託配送先の担当者（メイン担当者が1行目）。dm.org.contacts になければ委託配送先Web のプロフィールの担当者 */
export function carrierContacts(r: DocRepo, id: string): PartnerContact[] {
  const xs = r.list<Contact>('dm.org.contacts').filter((x) => x.owner.type === 'carrier' && x.owner.id === id && (x.kind === 'メイン担当者' || x.kind === 'サブ担当者'));
  const rows: PartnerContact[] = xs.length
    ? xs.map((x) => ({ kind: x.kind as PartnerContact['kind'], name: x.name, kana: x.kana, email: x.email, tel: x.tel }))
    : (carrierProfile(r, id)?.contacts ?? []).map((c) => ({ kind: c.k === 'メイン担当者' ? 'メイン担当者' : 'サブ担当者', name: c.n ?? '', kana: c.f ?? '', email: c.m ?? '', tel: c.t ?? '' }));
  return mainFirst(rows);
}
/** メイン担当者を1行目に・ちょうど1人に */
export function mainFirst(rows: PartnerContact[]): PartnerContact[] {
  if (!rows.length) return [];
  const main = rows.find((c) => c.kind === 'メイン担当者') ?? rows[0];
  return [{ ...main, kind: 'メイン担当者' }, ...rows.filter((c) => c !== main).map((c) => ({ ...c, kind: 'サブ担当者' as const }))];
}

/** 委託配送先の担当者を書く（dm.org.contacts を入れ替え、委託配送先Web のプロフィールにも写す） */
export function putCarrierContacts(r: DocRepo, id: string, rows: PartnerContact[]) {
  const all = r.list<Contact>('dm.org.contacts');
  const old = all.filter((x) => x.owner.type === 'carrier' && x.owner.id === id && (x.kind === 'メイン担当者' || x.kind === 'サブ担当者'));
  let max = Math.max(0, ...all.map((c) => Number(c.id.slice(2)) || 0));
  rows.forEach((c, i) => {
    const cid = old[i]?.id ?? `PC${String(++max).padStart(5, '0')}`;
    r.put<Contact>('dm.org.contacts', cid, { id: cid, owner: { type: 'carrier', id }, kind: c.kind, name: c.name, kana: c.kana, email: c.email, tel: c.tel });
  });
  for (const x of old.slice(rows.length)) r.remove('dm.org.contacts', x.id);
  return rows.map((c): CarrierProfileContact => ({ k: c.kind, n: c.name, f: c.kana, m: c.email, t: c.tel }));
}

/** 委託配送先の運営の画面の値（共通データ＋プロフィール） */
export type CarrierAll = {
  c: Carrier; kana: string; zip: string; pref: string; city: string; addr1: string; addr2: string; tel: string; fax: string;
  prefs: string[]; ngDays: string[]; areaNote: string; cars: string[]; frz: string; ref: string; sp: string; carNote: string; payTerms: string; note: string;
  contacts: PartnerContact[];
};
export function carrierAll(r: DocRepo, c: Carrier): CarrierAll {
  const p = carrierProfile(r, c.id);
  return {
    c, kana: p?.kana ?? '', zip: p?.zip ?? '', pref: p?.pref ?? '', city: p?.city ?? '', addr1: p?.addr ?? '', addr2: p?.bld ?? '', tel: p?.tel ?? '', fax: p?.fax ?? '',
    /* 対応エリアは共通データ（地方の名前は都道府県に広げる）。ないときはプロフィールの都道府県 */
    prefs: expandAreas(c.areas?.length ? c.areas : p?.areas),
    ngDays: p?.ngDays ?? ngDaysOfWeekdays(c.weekdays),
    areaNote: p?.areaNote ?? '', cars: p?.cars ?? [], frz: p?.frz || '不要', ref: p?.ref || '不要', sp: p?.sp || 'あり', carNote: p?.carNote ?? '',
    /* 支払条件がまだない委託配送先は、確認済みの「月末締め翌月末払い」 */
    payTerms: c.payTerms || PAY_TERMS[0], note: c.note ?? '',
    contacts: carrierContacts(r, c.id),
  };
}
/** プロフィール（carrier.profiles）を書く */
export function putCarrierProfile(r: DocRepo, id: string, patch: Partial<ProfileDoc>) {
  const cur = carrierProfile(r, id);
  const base: ProfileDoc = cur ?? {
    company: id, kana: '', zip: '', pref: '', city: '', addr: '', bld: '', tel: '', fax: '', contacts: [], areas: [], ngDays: [], areaNote: '', cars: [], frz: '不要', ref: '不要', sp: 'あり', carNote: '',
  };
  r.put<ProfileDoc>(PROFILES, id, { ...base, ...patch, company: id });
}

/* ---------- 倉庫 ---------- */

/** 倉庫の担当者。省くと運営の見本の行（general.warehouse の pic・picTel）から */
export function warehouseContacts(r: DocRepo, w: Warehouse): PartnerContact[] {
  if (w.contacts?.length) return mainFirst(w.contacts);
  /* 運営の見本の行（lib/ops/general/fromDomain.ts の opsRowOf と同じ） */
  const o = r.list<GenRow>('general.warehouse').find((x) => String(x.id) === w.id);
  return [{ kind: 'メイン担当者', name: String(o?.pic ?? ''), kana: '', email: '', tel: String(o?.picTel ?? '') }];
}
/** 中継倉庫区分（省くと：運営している委託配送会社があれば運送会社） */
export const relayKindOf = (w: Warehouse) => (w.type !== 'relay' ? '' : w.relayKind ?? (w.carrierId ? '運送会社' : 'それ以外（SC含む）'));

/* ---------- 配送スタッフ ---------- */

/** スタッフ区分（省くと会社所属） */
export const staffKindOf = (d: Driver) => d.staffKind ?? '会社所属';
/** 免許証の見本の画像（免許未登録でないのに写真がない見本のスタッフ） */
export const SAMPLE_LICENSE = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200" viewBox="0 0 320 200"><rect width="320" height="200" rx="14" fill="#e8f1e4" stroke="#7aa36a" stroke-width="3"/>'
  + '<rect x="18" y="44" width="80" height="100" rx="6" fill="#c9d9c1"/><circle cx="58" cy="78" r="18" fill="#9fb894"/><rect x="34" y="102" width="48" height="30" rx="12" fill="#9fb894"/>'
  + '<text x="160" y="32" font-size="18" text-anchor="middle" fill="#3f5e33" font-family="sans-serif">運転免許証（見本）</text>'
  + '<rect x="116" y="56" width="180" height="10" rx="5" fill="#b9cdb0"/><rect x="116" y="80" width="150" height="10" rx="5" fill="#b9cdb0"/><rect x="116" y="104" width="170" height="10" rx="5" fill="#b9cdb0"/><rect x="116" y="128" width="120" height="10" rx="5" fill="#b9cdb0"/>'
  + '<text x="300" y="186" font-size="12" text-anchor="end" fill="#7aa36a" font-family="sans-serif">SAMPLE</text></svg>',
)}`;
/** 免許証の写真（なければ ''）。見本のスタッフ（写真なし・免許未登録でない）は見本の画像 */
export const licenseOf = (d: Driver) => d.licenseImg || (d.status === '免許未登録' ? '' : SAMPLE_LICENSE);
export const driverAccount = (r: DocRepo, id: string) => r.get<Account>('dm.account.accounts', id);

/* ---------- 仕入先 ---------- */

/** 作れる商品（「惣菜・肉類」）→ 選択肢（選択肢に「サラダ・スープ」のように「・」を含むものがあるので、選択肢の名前で探す） */
export function goodsOf(s: string): string[] {
  let t = s ?? '';
  const out: string[] = [];
  for (const g of [...GOODS].sort((a, b) => b.length - a.length)) if (t.includes(g)) { out.push(g); t = t.replace(g, ''); }
  return GOODS.filter((g) => out.includes(g));
}
/** 表の行（画面）→ 担当者 */
export const contactOfRow = (x: FRow, i: number): PartnerContact => ({ kind: i === 0 ? 'メイン担当者' : 'サブ担当者', name: x.name ?? '', kana: x.kana ?? '', email: x.email ?? '', tel: x.tel ?? '' });
export const rowOfContact = (c: PartnerContact): FRow => ({ kind: c.kind, name: c.name, kana: c.kana, email: c.email, tel: c.tel });
