import type { ApplicationForm } from '@/lib/api/supplier';
import type { DocRepo } from '../core/area';
import { nowStamp } from '@/lib/supplier/dates';
import type { SupplierApp } from './types';
import { blankSupplier, listSuppliers, nextSupplierId, OLD_APPS, SUPPLIERS, type SupplierRec } from './suppliers';

/*
 * 仕入先の申込（B5）。仕入先サイトの申込フォーム（POST /api/supplier/applications）と運営の「仕入先の申込」を同じデータにする。
 * 置き場は共通 DB の仕入先（suppliers テーブル・kind db.suppliers。lib/ops/general/suppliers.ts）：状態＝申込中で、申込の中身（受付番号・メモ）も持つ。
 * 承認すると同じ行が本登録になり、仕入先サイトのアカウントを発行する（＝そのままログインできる・課題 11）
 */

/** 受付番号の続き（SA-YYYYMMDD-NNNN。その日の番号のいちばん大きい数。古い置き場 general.supplierApp の番号も数える） */
export function lastReceiptSeq(repo: DocRepo, ymd: string) {
  const prefix = `SA-${ymd}-`;
  const nos = [...listSuppliers(repo).map((x) => x.apply?.receiptNo ?? ''), ...repo.list<SupplierApp>(OLD_APPS).map((x) => x.no ?? '')];
  return Math.max(0, ...nos.filter((n) => n.startsWith(prefix)).map((n) => Number(n.slice(prefix.length)) || 0));
}

/** 申込を登録する：仕入先ID（SP＋5桁）を割り当て、共通 DB の仕入先に「申込中」で入れる（運営の一覧・申込の画面に出る） */
export function addSupplierApplication(repo: DocRepo, receiptNo: string, f: ApplicationForm) {
  const id = nextSupplierId(repo);
  const s: SupplierRec = {
    ...blankSupplier(id), name: f.company.trim(), kana: (f.companyKana ?? '').trim(), picKana: (f.picKana ?? '').trim(), addr: f.addr.trim(), zip: f.zip.trim(), tel: f.tel.trim(), pic: f.pic.trim(), picTel: (f.picTel || f.tel).trim(),
    mail: f.mail.trim(), rep: f.rep.trim(), bizDay: f.biz === 'はい' ? 'はい' : 'いいえ', goods: (f.goods ?? []).join('・'), cert: f.cert ?? '', kind: f.kind ?? '',
    status: '申込中', method: 'ESステーション',
    apply: { receiptNo, appliedAt: nowStamp(), memo: [f.kind && `業種：${f.kind}`, f.memo].filter(Boolean).join('\n') },
  };
  repo.put<SupplierRec>(SUPPLIERS, id, s);
  return { id };
}
