import type { DocRepo } from '@/lib/ops/core/area';
import type { Discount, Model, Option, Plan } from './types';

/*
 * 申込・受付の画面が読むマスタ（2026/10/03：画面にマスタのコピー・見本の seed を持たない）。
 *   運営Web の受付（lib/ops/applications/intake.ts）と法人Web の申込フォーム（lib/corp/docs/apply/data.ts）が、
 *   これを読んで プラン・機種・オプション・値引きの表を作る。マスタを直すと、開いている画面も読み直して変わる。
 *   プラン・機種は有効なものだけ、オプション・値引きは削除済を除く（使用中かどうかは画面側で見る）
 */
export type FormMaster = { plans: Plan[]; models: Model[]; options: Option[]; discounts: Discount[] };

export const formMasterOf = (r: DocRepo): FormMaster => ({
  plans: r.list<Plan>('dm.master.plans').filter((p) => p.status === '有効'),
  models: r.list<Model>('dm.master.models').filter((m) => m.status === '有効'),
  options: r.list<Option>('dm.master.options').filter((o) => o.status !== '削除済'),
  discounts: r.list<Discount>('dm.master.discounts').filter((d) => d.status !== '削除済'),
});
