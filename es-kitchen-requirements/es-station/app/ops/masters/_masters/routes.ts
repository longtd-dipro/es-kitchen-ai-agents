import type { MasterKind } from '@/lib/ops/masters/types';

/** 画面の URL（lib/ops/menu.ts の href と同じ） */
export const BASE: Record<MasterKind, string> = {
  plans: '/ops/masters/plans',
  devices: '/ops/masters/devices',
  options: '/ops/masters/options',
  discounts: '/ops/masters/discounts',
  materials: '/ops/masters/materials',
};
/** 元の画面の id（#s-mdl など）。masters.css の .s-pm などに合わせる */
export const LIST_CLS: Record<MasterKind, string> = { devices: 'mdl', plans: 'pml', options: 'opl', discounts: 'dcl', materials: 'mtl' };
export const DETAIL_CLS: Record<MasterKind, string> = { devices: 'md', plans: 'pm', options: 'op', discounts: 'dc', materials: 'mt' };
