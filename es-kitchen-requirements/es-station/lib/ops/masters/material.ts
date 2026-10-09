import type { DocRepo } from '../core/area';
import { materialsOf, materialUse, materialInUse, type MaterialFull } from '@/lib/domain/material';
import { yen } from '@/lib/format/money';
import { taxLabel } from '@/lib/domain/tax';
import type { Warehouse } from '@/lib/domain/types';
import type { MasterRec } from './types';

/*
 * 資材マスタの一覧の行（MasterRec）と詳細の値。データは共通データ dm.master.materials（lib/domain/material.ts）。
 * 一覧の row：id・photo・name・course（「・」でつなぐ）・courseq（検索用、「／」でつなぐ）・unit・price・tax・wh（取扱倉庫名を「・」）・whq（検索用）・pubst（公開ステータス。削除済は「削除済」）
 */
const whName = (r: DocRepo, id: string) => r.get<Warehouse>('dm.master.warehouses', id)?.name ?? id;

/** 資材 → 一覧の行 */
export function materialRec(r: DocRepo, m: MaterialFull, seq: number): MasterRec {
  const deleted = m.status === '削除済';
  const whs = m.warehouseIds.map((id) => whName(r, id));
  const pubst = deleted ? '削除済' : m.publish;
  return {
    id: m.id, kind: 'materials', name: m.name, deleted, seq,
    row: {
      id: m.id, photo: m.photo, name: m.name, course: m.courses.join('・'), courseq: m.courses.join('／'), unit: m.unit,
      price: m.priceYen === undefined ? '' : yen(m.priceYen), tax: taxLabel(r, m.taxRateId), wh: whs.join('・'), whq: whs.join('／'), pubst,
    },
    badge: { pubst: !deleted && m.publish === '公開' ? 'es-badge--success' : 'es-badge--neutral' },
    /* 使用中の数（プラン・未納品の資材注文・資材在庫のある倉庫の合計）。内訳は削除のときに materialUse で聞く */
    use: deleted ? 0 : (() => { const u = materialUse(r, m.id); return materialInUse(u) ? u.plans + u.orders + u.warehouses : 0; })(),
  };
}
export const materialRecs = (r: DocRepo): MasterRec[] => materialsOf(r, true).map((m, i) => materialRec(r, m, i));
