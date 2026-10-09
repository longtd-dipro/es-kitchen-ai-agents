import type { DocRepo } from '@/lib/ops/core/area';
import { nowStamp } from '@/lib/supplier/dates';
import type { Account } from './types';

/*
 * 取引先のマスタ（仕入先・委託配送先・倉庫・配送スタッフ）の変更履歴（dm.master.partnerHistory）。
 * 運営の各マスタの詳細の「変更履歴」タブ（P-HIST：変更日時・変更内容・変更者。新しい順）。hong 2026-10-06
 *   登録＝「データ登録」・変更＝変わった項目（短い値は「前 → 後」）・削除＝「削除」・CSV取込は変更者「CSV取込」
 * 記録するところ：master.create／update／addDriver／updateDriver／setDriverStatus（倉庫・委託配送先・配送スタッフ）と、
 *   仕入先の保存（lib/ops/general：画面・CSV取込・申込の承認／却下・削除）
 */

export const PARTNER_HIST = 'dm.master.partnerHistory';
export type PartnerHistKind = 'suppliers' | 'carriers' | 'warehouses' | 'drivers';
export type PartnerHist = { id: string; kind: PartnerHistKind; targetId: string; at: string; what: string; by: string };

/** 変更者が CSV取込 のとき（lib/csv/master.ts の OPS_BY と同じ） */
export const BY_CSV = 'CSV取込';

/** 履歴を1つ足す（what が空なら足さない） */
export function addPartnerHistory(r: DocRepo, kind: PartnerHistKind, targetId: string, what: string, by?: string) {
  if (!what) return;
  const n = r.list<PartnerHist>(PARTNER_HIST).filter((h) => h.kind === kind && h.targetId === targetId).length + 1;
  const id = `${kind}:${targetId}:${String(n).padStart(4, '0')}`;
  r.put<PartnerHist>(PARTNER_HIST, id, { id, kind, targetId, at: nowStamp(), what, by: by || 'system' });
}

/** 変更者の名前（運営のアカウント名。CSV取込はそのまま。ほかのサイトのアカウントはその名前） */
const byName = (r: DocRepo, by: string) => (by === BY_CSV ? BY_CSV : r.get<Account>('dm.account.accounts', by)?.name || by);

/** 画面の表（新しい順） */
export function partnerHistory(r: DocRepo, kind: PartnerHistKind, targetId: string) {
  return r.list<PartnerHist>(PARTNER_HIST).filter((h) => h.kind === kind && h.targetId === targetId)
    .sort((a, b) => b.at.localeCompare(a.at) || b.id.localeCompare(a.id))
    .map((h) => ({ at: h.at, what: h.what, by: byName(r, h.by) }));
}

/** 値の見せ方（配列は「・」でつなぐ。オブジェクトは中身を見せない） */
const showVal = (v: unknown) => (Array.isArray(v) ? v.map((x) => (typeof x === 'object' ? '' : String(x))).filter(Boolean).join('・') : v == null ? '' : typeof v === 'object' ? '' : String(v));

/**
 * 変わった項目の文（例：「名前を「A → B」に変更・住所を更新」）。labels＝項目 → 名前。
 * 短い値（文字・数・短い配列）は「前 → 後」、長い値・表は「○○を更新」
 */
export function diffWhat(labels: Record<string, string>, prev: Record<string, unknown>, next: Record<string, unknown>) {
  const out: string[] = [];
  for (const [k, label] of Object.entries(labels)) {
    if (!(k in next)) continue;
    const a = prev[k], b = next[k];
    if (JSON.stringify(a ?? '') === JSON.stringify(b ?? '')) continue;
    /* 空の配列と未設定は同じ */
    if ((a == null || (Array.isArray(a) && !a.length) || a === '') && (b == null || (Array.isArray(b) && !b.length) || b === '')) continue;
    const pa = showVal(a), pb = showVal(b);
    const short = (typeof a !== 'object' || Array.isArray(a)) && (typeof b !== 'object' || Array.isArray(b)) && pa.length <= 40 && pb.length <= 40 && !String(pb).startsWith('data:');
    out.push(short ? `${label}を「${pa || '（空）'} → ${pb || '（空）'}」に変更` : `${label}を更新`);
  }
  return out.join('・');
}

/** 共通データの項目の名前（master.update／create の自動の記録） */
export const PARTNER_LABELS: Record<Exclude<PartnerHistKind, 'suppliers'>, Record<string, string>> = {
  carriers: {
    name: '委託配送先名', kind: '区分', areas: '対応エリア', weekdays: '対応曜日', temps: '温度帯', feePerDelivery: '1件の支払額', areaFees: 'エリア別の支払額',
    trackingUrl: '追跡URLのひな形', payTerms: '支払条件', note: '備考', status: 'ステータス',
  },
  warehouses: {
    name: '倉庫名', slipName: '倉庫名（伝票用）', kana: '倉庫名カナ', type: '倉庫区分', forMaterial: 'ピッキング倉庫（資材）', relayKind: '中継倉庫区分', carrierId: '運営している委託配送会社',
    branchCode: '営業所コード', thomasCode: '倉庫コード', address: '住所', tel: '電話番号', fax: 'FAX番号', note: '備考', contacts: '担当者', status: 'ステータス',
  },
  drivers: {
    name: '配送スタッフ名', kana: '配送スタッフ名カナ', staffKind: '区分', employment: '雇用形態', tel: '電話番号', email: 'メールアドレス', areas: '対応エリア', licenseImg: '免許証', status: 'ステータス',
  },
};

/** 削除（論理削除）か */
export const isDeleted = (s: unknown) => s === '削除済' || s === '削除済';
