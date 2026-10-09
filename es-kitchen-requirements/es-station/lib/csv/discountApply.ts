import { ApiError } from '@/lib/api/errors';
import type { CsvEntity, Ctx } from '@/lib/domain/csv';
import org from '@/lib/domain/areas/org';
import { childLocked } from '@/lib/domain/snapshot';
import type { Branch, ChildContract, Discount } from '@/lib/domain/types';

/*
 * 値引きの適用（台帳「値引きマスタの適用一覧」2026/10/03）。適用一覧は子契約の値引きから作る表示だけで、別の表（discount_apply）は持たない。
 * CSV は子契約に直接書く：適用開始月から先（適用終了月まで。空欄＝ずっと）の子契約に値引きを付ける・終了月より後は外す。
 * 確定・請求済の子契約は変えない（差額は請求の調整で）。1行＝値引き × 拠点 × 適用開始月
 */

export type DiscountApplyRow = { discountId: string; branchId: string; branchName: string; from: string; to: string; months: string[] };

const kids = (x: Pick<Ctx, 'r'>, branchId: string) =>
  x.r.list<ChildContract>('dm.org.childContracts').filter((c) => c.branchId === branchId && !c.canceled).sort((a, b) => a.cycleMonth.localeCompare(b.cycleMonth));

/** 子契約から適用の行（拠点ごとに、続いて付いているサイクル月のまとまり）。to＝最後の子契約まで付いていれば ''（ずっと） */
export function discountApplyRows(x: Pick<Ctx, 'r'>, discountId?: string): DiscountApplyRow[] {
  const out: DiscountApplyRow[] = [];
  const ds = discountId ? [discountId] : x.r.list<Discount>('dm.master.discounts').map((d) => d.id);
  const branches = x.r.list<Branch>('dm.org.branches');
  for (const id of ds) {
    for (const b of branches) {
      const ks = kids(x, b.id);
      let run: string[] = [];
      const flush = (open: boolean) => { if (run.length) out.push({ discountId: id, branchId: b.id, branchName: b.name, from: run[0], to: open ? '' : run[run.length - 1], months: run }); run = []; };
      ks.forEach((k, i) => {
        if (k.discountIds.includes(id)) run.push(k.cycleMonth);
        else flush(false);
        if (i === ks.length - 1) flush(true);
      });
    }
  }
  return out;
}

type Draft = { discountId: string; branchId: string; from: string; to: string };
const bad = (m: string): never => { throw new ApiError(m, 400); };
const ymOk = (v: string) => /^\d{4}-\d{2}$/.test(v);

export const discountApply: CsvEntity<DiscountApplyRow, Draft> = {
  id: 'discountApply', screen: '値引きの適用', key: '値引きID', keyCols: ['値引きID', '拠点ID', '適用開始月'], create: true,
  list: (x) => discountApplyRows(x),
  keyOf: (a) => `${a.discountId}|${a.branchId}|${a.from}`, nameOf: (a) => `${a.discountId} ${a.branchName}`,
  /* 新しい適用（今は付いていない値引き × 拠点 × 開始月）も、値引き・拠点・月が正しければ空の行として扱う（キーの列をそのまま書けるように） */
  find: (x, k) => {
    const [discountId = '', branchId = '', from = ''] = k.split('|');
    const hit = discountApplyRows(x, discountId).find((a) => a.branchId === branchId && a.from === from);
    if (hit) return hit;
    const b = x.r.get<Branch>('dm.org.branches', branchId), d = x.r.get<Discount>('dm.master.discounts', discountId);
    return b && d && d.status !== '削除済' && ymOk(from) ? { discountId, branchId, branchName: b.name, from, to: '', months: [] } : undefined;
  },
  /* find が空で返した行（まだ付いていない値引き × 拠点 × 開始月）は、今の値と比べずに新規として保存する（比べると「変更なし」になって付かない） */
  fresh: (a) => a.months.length === 0,
  cols: [
    { label: '値引きID', reqNew: true, get: (a) => a.discountId, put: (d, v) => { d.discountId = String(v ?? '').trim(); } },
    { label: '拠点ID', reqNew: true, get: (a) => a.branchId, put: (d, v) => { d.branchId = String(v ?? '').trim(); } },
    { label: '拠点名', ro: true, get: (a) => a.branchName },
    { label: '適用開始月', reqNew: true, hint: 'YYYY-MM（サイクル月）', get: (a) => a.from, put: (d, v) => { d.from = String(v ?? '').trim(); } },
    { label: '適用終了月', clear: true, hint: 'YYYY-MM。空欄＝ずっと', get: (a) => a.to, put: (d, v) => { d.to = String(v ?? '').trim(); } },
  ],
  draftOf: (a) => ({ discountId: a.discountId, branchId: a.branchId, from: a.from, to: a.to }),
  newDraft: () => ({ discountId: '', branchId: '', from: '', to: '' }),
  warn: (_b, a, x) => {
    if (!a) return [];
    const locked = kids(x, a.branchId).filter((k) => k.cycleMonth >= a.from && childLocked(k));
    return locked.length ? [`確定・請求済の子契約（${locked.map((k) => k.cycleMonth).join('・')}）は変えません。差額は請求の調整で入れてください`] : [];
  },
  save: (x, d) => {
    const disc = x.r.get<Discount>('dm.master.discounts', d.discountId);
    if (!disc || disc.status === '削除済') bad(`値引きが見つかりません（${d.discountId}）`);
    if (!x.r.get<Branch>('dm.org.branches', d.branchId)) bad(`拠点が見つかりません（${d.branchId}）`);
    if (!ymOk(d.from) || (d.to && (!ymOk(d.to) || d.to < d.from))) bad('適用開始月・適用終了月は YYYY-MM（終了月は開始月より後）で入れてください');
    for (const k of kids(x, d.branchId).filter((c) => c.cycleMonth >= d.from && !childLocked(c))) {
      const on = !d.to || k.cycleMonth <= d.to, has = k.discountIds.includes(d.discountId);
      if (on === has) continue;
      org.actions.updateChild(x.r, { id: k.id, patch: { discountIds: on ? [...k.discountIds, d.discountId] : k.discountIds.filter((y) => y !== d.discountId) }, by: 'CSV取込' });
    }
    return `${d.discountId}|${d.branchId}|${d.from}`;
  },
};
