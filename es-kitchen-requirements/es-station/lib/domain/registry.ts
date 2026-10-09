import type { Area, Seed } from '@/lib/ops/core/area';
import { memoryRepo } from '@/lib/ops/core/memoryRepo';
import { seedAlt } from './seed/alt';
import account from './areas/account';
import app from './areas/app';
import referral from './areas/referral';
import sample from './areas/sample';
import apply from './areas/apply';
import billing from './areas/billing';
import carrier from './areas/carrier';
import check from './areas/check';
import delivery from './areas/delivery';
import master from './areas/master';
import menu from './areas/menu';
import notice from './areas/notice';
import order from './areas/order';
import org from './areas/org';
import report from './areas/report';
import survey from './areas/survey';
import stock from './areas/stock';
import bulk from './areas/bulk';
import csv from './areas/csv';
import batch from './areas/batch';

/** 全サイト共通の業務データの領域（API：POST /api/domain/<領域>/<名前>） */
export const DOMAIN_AREAS: Record<string, Area> = Object.fromEntries([org, master, delivery, order, menu, apply, billing, report, carrier, notice, account, app, referral, sample, survey, stock, bulk, csv, batch, check].map((a) => [a.name, a as Area]));

/**
 * 見本（領域ごとの seed）。領域をまたぐ見本（代替品設定：注文・配送・追加発注・仕入先への請求・通知を一度に作る）は、
 * 全部の見本を入れたメモリの DocRepo で action（lib/domain/seed/alt.ts）を動かして作る
 */
export function domainSeeds(): Seed[] {
  const seeds = Object.values(DOMAIN_AREAS).map((a) => a.seed());
  const merged: Seed = Object.assign({}, ...seeds);
  const r = memoryRepo(merged);
  seedAlt(r);
  return [Object.fromEntries(Object.keys(merged).map((k) => [k, r.list<{ id: string }>(k).map((data) => ({ id: data.id, data }))]))];
}
