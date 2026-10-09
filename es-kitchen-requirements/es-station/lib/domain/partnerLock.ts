import type { DocRepo } from '@/lib/ops/core/area';
import { log } from './areas/account';
import type { Account, AccountStatus } from './types';

/*
 * マスタの状態とアカウントのログイン（台帳 F 2026-10-06「運営Web マスタの登録・編集・削除」③・受付簿 No.178）。
 * 仕入先・委託配送先・配送スタッフ・倉庫を「無効」「削除済」（配送スタッフは「利用停止」も）にしたら、そのアカウントはログインできない。
 *   止める：ログインできる状態（有効・発行済（ログイン前）・参照のみ）のアカウントを 無効（削除のときは 削除済）にし、前の状態を lockedBy に残す
 *   戻す：マスタを「有効」などに戻したら、lockedBy のあるアカウント（＝マスタの状態だけで止めたもの）を前の状態に戻す
 *   未発行・ほかの理由で止めたアカウント（lockedBy なし）は変えない
 * 画面の削除・保存、CSV取込（master.update・updateDriver・setDriverStatus）、どこから変えても同じ（ここを呼ぶ）。
 * ログインの判定は lib/domain/areas/account.ts の CAN_LOGIN（無効・削除済は既存のログインのエラー）。
 */

export type PartnerType = 'supplier' | 'carrier' | 'driver' | 'warehouse';
const CAN_LOGIN: AccountStatus[] = ['有効', '発行済（ログイン前）', '参照のみ'];
const KIND = 'dm.account.accounts';

/** そのマスタに付いているアカウント（ID がマスタの ID・または scope がそのマスタ） */
export function partnerAccounts(r: DocRepo, type: PartnerType, id: string): Account[] {
  return r.list<Account>(KIND).filter((a) => {
    const s = a.scope;
    if (type === 'supplier') return s.type === 'supplier' && s.supplierId === id;
    if (type === 'carrier') return a.site === 'carrier' && s.type === 'carrier' && s.carrierId === id;
    if (type === 'driver') return (s.type === 'driver' && s.driverId === id) || (a.site === 'driver' && a.id === id);
    return s.type === 'warehouse' && s.warehouseId === id;
  });
}

/** マスタの状態 → 止めるか（null＝止めない）。削除＝削除済、ほか＝無効 */
export function lockOf(type: PartnerType, status: string): AccountStatus | null {
  if (status === '削除済' || status === '削除済') return '削除済';
  if (status === '無効') return '無効';
  if (type === 'driver' && status === '利用停止') return '無効';
  return null;
}

const audit = (r: DocRepo, by: string, a: Account, from: AccountStatus, to: AccountStatus, why: string) =>
  log(r, by, '状態の変更', a.id, `${from} → ${to}（${why}）`);

/**
 * マスタの状態に合わせてアカウントを止める・戻す。返り値＝変えたアカウントの ID
 * （マスタの状態が「有効」などに戻ったときは、lockedBy のあるアカウントだけ戻す）
 */
export function syncPartnerAccounts(r: DocRepo, a: { type: PartnerType; id: string; status: string; by?: string }): string[] {
  const lock = lockOf(a.type, a.status);
  const changed: string[] = [];
  for (const acc of partnerAccounts(r, a.type, a.id)) {
    if (acc.status === '未発行') continue;
    if (lock) {
      if (acc.status === lock || acc.status === '削除済') continue;
      /* ほかの理由で止めたアカウント（lockedBy なし・ログインできない状態）は、削除のときだけ 削除済 にする */
      if (!acc.lockedBy && !CAN_LOGIN.includes(acc.status) && lock !== '削除済') continue;
      const next: Account = { ...acc, status: lock, lockedBy: acc.lockedBy ?? { prev: acc.status } };
      r.put<Account>(KIND, acc.id, next);
      audit(r, a.by ?? 'system', acc, acc.status, lock, `マスタの状態「${a.status}」`);
      changed.push(acc.id);
    } else if (acc.lockedBy && acc.status !== '削除済') {
      const { lockedBy, ...rest } = acc;
      const next: Account = { ...rest, status: lockedBy.prev };
      r.put<Account>(KIND, acc.id, next);
      audit(r, a.by ?? 'system', acc, acc.status, lockedBy.prev, `マスタの状態「${a.status}」`);
      changed.push(acc.id);
    }
  }
  return changed;
}
