import type { AvgTarget, VmLayout } from '../types';

/*
 * マスタ・メニューの設定の見本。
 *   自販機の列の構成（dm.master.vmLayouts）：機種マスタの自販機ごと。もとは運営の masters.vmLayout と menu.vmLayout（同じ値が2か所）。値は仮
 *   平均単価の目標（AVG_TARGET）：メニューごとの目標（MonthlyMenu.avgTarget）の既定。最初のメニュー・前月のメニューがないときの初期値。値は仮
 */

export const VM_LAYOUTS: VmLayout[] = [
  { id: 'VM000001', maker: '富士電機', lanes: { W: [[10, 5], [8, 6]], S: [[10, 6]], B: [[5, 8]] } },
  { id: 'VM000002', maker: 'サンデン', lanes: { W: [[10, 4]], S: [[8, 8]], B: [] } },
];

export const AVG_TARGET: AvgTarget = { fr: { min: 170, max: 179 }, vm: { min: 140, max: 159 } };
