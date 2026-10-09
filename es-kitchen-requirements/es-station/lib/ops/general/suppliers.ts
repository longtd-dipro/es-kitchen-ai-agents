import type { DocRepo } from '../core/area';
import type { Contact as SupplierContact, Supplier } from '@/lib/supplier/types';
import { addPartnerHistory, BY_CSV } from '@/lib/domain/partnerHistory';
import { PREFS } from '@/lib/domain/prefs';
import type { GenRow, SupplierApp } from './types';

/*
 * 仕入先の置き場を1つにする（課題 11・追加）：運営の仕入先マスタ・仕入先の申込（仕入先サイトの申込フォーム）・承認・仕入先サイトのログインは、
 * 共通 DB の suppliers テーブル（仕入先サイトが読む Supplier の形）だけを読み書きする。DocRepo では kind 'db.suppliers'
 * （lib/server/docs.ts が suppliers テーブルに当てる。メモリの DocRepo では見本を入れた kind）。
 * 仕入先ID（SP＋5桁）はそのまま。運営の古い置き場（general.supplier・general.supplierApp）は、共通 DB に足りない仕入先を移す元にだけ使う
 * （lib/server/db.ts の ensureSuppliers）。ログインできる仕入先＝本登録で、仕入先サイトのアカウント（dm.account.accounts）が有効なもの
 */
export const SUPPLIERS = 'db.suppliers';
/** 運営の古い置き場（移す元） */
export const OLD_ROWS = 'general.supplier';
export const OLD_APPS = 'general.supplierApp';

/** 運営の一覧に出す状態 */
export type SupplierStatus = '申込中' | '却下' | '本登録' | '未発行' | '削除済';
/** 申込の中身（仕入先の申込フォーム。申込中・却下の仕入先が持つ） */
export type SupplierApply = { receiptNo: string; appliedAt: string; memo: string };
/**
 * 仕入先の住所（運営の仕入先マスタの「住所」の表・hong 2026-10-06）。本社はちょうど1件、製造場所は0件以上。
 * 古い仕入先（addresses なし）は zip・addr・tel（本社）・factory（製造場所）から作る（addressesOf）
 */
export type SupplierAddress = { kind: '本社' | '製造場所'; zip: string; pref: string; city: string; addr1: string; addr2: string; tel: string; fax: string };
/** 共通 DB の仕入先（仕入先サイトの Supplier ＋ 運営の発注方法・申込の中身・住所の表・備考） */
export type SupplierRec = Supplier & { method?: string; apply?: SupplierApply; addresses?: SupplierAddress[]; note?: string };

/** 住所の1行の文字（「東京都中央区日本橋1-2-3 サンプルビル5F」）→ 都道府県・市区町村・町域・番地・建物 */
export function parseAddr(s: string): Pick<SupplierAddress, 'pref' | 'city' | 'addr1' | 'addr2'> {
  let t = (s ?? '').trim();
  const pref = PREFS.find((p) => t.startsWith(p)) ?? '';
  t = t.slice(pref.length);
  const m = /^(.+?郡.+?[町村]|.+?市.+?区|.+?[市区町村])(.*)$/.exec(t);
  const city = m ? m[1] : '';
  const rest = (m ? m[2] : t).trim();
  const sp = rest.search(/[\s　]/);
  return { pref, city, addr1: sp < 0 ? rest : rest.slice(0, sp), addr2: sp < 0 ? '' : rest.slice(sp + 1).trim() };
}
/** 住所の表示（都道府県から建物まで） */
export const joinAddr = (a: Pick<SupplierAddress, 'pref' | 'city' | 'addr1' | 'addr2'>) => `${a.pref}${a.city}${a.addr1}${a.addr2 ? ` ${a.addr2}` : ''}`;

/** 住所の表（本社が1行目）。古い仕入先は zip・addr・tel・factory から作る */
export function addressesOf(s: SupplierRec): SupplierAddress[] {
  if (s.addresses?.length) {
    const main = s.addresses.find((a) => a.kind === '本社') ?? s.addresses[0];
    return [{ ...main, kind: '本社' }, ...s.addresses.filter((a) => a !== main).map((a) => ({ ...a, kind: '製造場所' as const }))];
  }
  const out: SupplierAddress[] = [{ kind: '本社', zip: s.zip ?? '', ...parseAddr(s.addr ?? ''), tel: s.tel ?? '', fax: '' }];
  /* 製造場所は「〒123-4567 住所」の形なら郵便番号も読む */
  for (const f of (s.factory ?? '').split(/[、\n]/).map((x) => x.trim()).filter(Boolean)) {
    const m = /^〒?\s*(\d{3}-?\d{4})\s+(.*)$/.exec(f);
    out.push({ kind: '製造場所', zip: m ? m[1] : '', ...parseAddr(m ? m[2] : f), tel: '', fax: '' });
  }
  return out;
}
/** 担当者の表（メイン担当者が1行目・ちょうど1人）。古い仕入先は pic・picKana・mail・picTel から作る */
export function contactsOf(s: SupplierRec): SupplierContact[] {
  const xs = s.contacts ?? [];
  if (!xs.length) return [{ kind: 'メイン担当者', name: s.pic ?? '', kana: s.picKana ?? '', mail: s.mail ?? '', tel: s.picTel || s.tel || '' }];
  const main = xs.find((c) => c.kind === 'メイン担当者') ?? xs[0];
  return [{ ...main, kind: 'メイン担当者' }, ...xs.filter((c) => c !== main).map((c) => ({ ...c, kind: 'サブ担当者' }))];
}
/** 住所・担当者の表を入れ、仕入先サイトが読む古い項目（本社の住所・メイン担当者）もそろえる */
export function withParts(s: SupplierRec, addresses: SupplierAddress[], contacts: SupplierContact[]): SupplierRec {
  const hq = addresses[0], main = contacts[0];
  return {
    ...s, addresses, contacts,
    zip: hq?.zip ?? '', addr: hq ? joinAddr(hq) : '', tel: hq?.tel ?? s.tel,
    factory: addresses.slice(1).map(joinAddr).join('、'),
    pic: main?.name ?? '', picKana: main?.kana ?? '', mail: main?.mail ?? '', picTel: main?.tel ?? '',
  };
}

/** 空の仕入先（運営の一覧の行・申込から作るとき） */
export function blankSupplier(id: string): SupplierRec {
  return {
    id, name: '', kana: '', kind: '', goods: '', status: '未発行', zip: '', addr: '', tel: '', pic: '', picKana: '', mail: '', picTel: '', since: '',
    rep: '', corpNo: '', invoice: '', factory: '', whs: '', days: '', bizDay: 'いいえ', defMethod: '', defCarrier: '', cert: '', close: '', pay: '',
    bank: { name: '', branch: '', type: '', no: '', holder: '' }, lastLogin: '', contacts: [], products: [], method: 'ESステーション',
  };
}

export const listSuppliers = (r: DocRepo) => r.list<SupplierRec>(SUPPLIERS).sort((a, b) => a.id.localeCompare(b.id));
export const getSupplierRec = (r: DocRepo, id: string) => r.get<SupplierRec>(SUPPLIERS, id);

/** 運営の仕入先マスタの一覧の行（_uid＝仕入先ID） */
export function supplierRow(s: SupplierRec): GenRow {
  const hq = addressesOf(s)[0], main = contactsOf(s)[0];
  return {
    _uid: s.id, id: s.id, name: s.name, addr: hq ? joinAddr(hq) : s.addr, pic: main?.name ?? s.pic, tel: main?.tel || s.picTel || s.tel, status: s.status,
    biz: s.bizDay, method: s.method || 'ESステーション', kind: s.kind, goods: s.goods,
  };
}

/** 一覧の行の形の値を仕入先に重ねる（運営の CSV取込・一覧の画面） */
export function putSupplierRow(r: DocRepo, row: GenRow, by = BY_CSV) {
  const id = String(row.id);
  const had = getSupplierRec(r, id);
  const cur = had ?? blankSupplier(id);
  const str = (k: string, d: string) => (row[k] === undefined ? d : String(row[k] ?? ''));
  /* 本社住所・担当者名・担当者の電話番号は、住所の表の本社・担当者の表のメイン担当者に入れる */
  const adds = addressesOf(cur), cts = contactsOf(cur);
  const hq = adds[0], main = cts[0];
  const addr = str('addr', joinAddr(hq));
  const nextAdds = [addr === joinAddr(hq) ? hq : { ...hq, ...parseAddr(addr) }, ...adds.slice(1)];
  const nextCts = [{ ...main, name: str('pic', main.name), tel: str('tel', main.tel) }, ...cts.slice(1)];
  const next: SupplierRec = withParts({
    ...cur, name: str('name', cur.name),
    bizDay: (str('biz', cur.bizDay) === 'はい' ? 'はい' : 'いいえ'), method: str('method', cur.method || 'ESステーション'), status: str('status', cur.status),
  }, nextAdds, nextCts);
  r.put<SupplierRec>(SUPPLIERS, id, next);
  const L: [string, string, string][] = [['仕入先名', cur.name, next.name], ['本社住所', joinAddr(hq), addr], ['担当者名', main.name, nextCts[0].name], ['担当者の電話番号', main.tel, nextCts[0].tel],
    ['土日祝を営業日', cur.bizDay, next.bizDay], ['発注方法', cur.method || 'ESステーション', next.method || 'ESステーション']];
  addPartnerHistory(r, 'suppliers', id, had ? L.filter(([, a, b]) => a !== b).map(([l, a, b]) => `${l}を「${a || '（空）'} → ${b || '（空）'}」に変更`).join('・') : 'データ登録', by);
  return next;
}

/** 申込の中身（運営の「仕入先の申込」の画面の形） */
export function applyOf(s: SupplierRec): SupplierApp | null {
  if (!s.apply) return null;
  return {
    no: s.apply.receiptNo, at: s.apply.appliedAt, rep: s.rep, zip: s.zip, addr: s.addr, tel: s.tel, pic: s.pic, mail: s.mail, biz: s.bizDay,
    goods: s.goods, cert: s.cert, memo: s.apply.memo,
  };
}

/** 運営の古い置き場の行・申込 → 共通 DB の仕入先（足りない仕入先を移すとき） */
export function fromOld(row: GenRow, app?: SupplierApp | null): SupplierRec {
  const s = blankSupplier(String(row.id));
  return {
    ...s, name: String(row.name ?? ''), addr: app?.addr || String(row.addr ?? ''), pic: app?.pic || String(row.pic ?? ''), picTel: String(row.tel ?? ''),
    tel: app?.tel || String(row.tel ?? ''), status: String(row.status ?? '未発行'), bizDay: (app?.biz || row.biz) === 'はい' ? 'はい' : 'いいえ', method: String(row.method ?? 'ESステーション'),
    ...(app ? { rep: app.rep, zip: app.zip, mail: app.mail, goods: app.goods, cert: app.cert, apply: { receiptNo: app.no, appliedAt: app.at, memo: app.memo } } : {}),
  };
}

/** 次の仕入先ID（共通 DB の仕入先・仕入先サイトのアカウントの続き） */
export function nextSupplierId(r: DocRepo) {
  const ids = [...listSuppliers(r).map((s) => s.id), ...r.list<{ id: string; site: string }>('dm.account.accounts').filter((a) => a.site === 'supplier').map((a) => a.id)];
  const n = Math.max(0, ...ids.map((x) => Number(/^SP(\d{5})$/.exec(x)?.[1] ?? 0))) + 1;
  return `SP${String(n).padStart(5, '0')}`;
}

/**
 * 申込の内容（AW_SUPP_007：仕入先Web の申込フォームに入れた項目を全部。表示だけ）。[見出し, 値]。申込から作った仕入先でなければ null
 */
export function applyDetail(s: SupplierRec): [string, string][] | null {
  if (!s.apply) return null;
  const main = contactsOf(s)[0];
  /* 申込のメモは「業種：…」の行と、取扱・得意分野（フォームの memo） */
  const memo = (s.apply.memo ?? '').split('\n').filter((l) => !l.startsWith('業種：')).join('\n');
  return [
    ['受付番号', s.apply.receiptNo], ['申込日時', s.apply.appliedAt], ['会社名', s.name], ['会社名カナ', s.kana], ['郵便番号', s.zip], ['本社住所', s.addr],
    ['代表電話', s.tel], ['代表者', s.rep], ['担当者名', main?.name ?? s.pic], ['担当者カナ', main?.kana ?? s.picKana], ['担当者メール', main?.mail ?? s.mail],
    ['担当者の電話番号', main?.tel ?? s.picTel], ['土日祝を営業日', s.bizDay], ['仕入れ先区分', s.kind], ['作れる商品', s.goods], ['許可・認証', s.cert],
    ['取扱・得意分野', memo], ['申込時のメモ', s.apply.memo],
  ];
}
