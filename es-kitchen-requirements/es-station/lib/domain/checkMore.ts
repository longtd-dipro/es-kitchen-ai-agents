import type { DocRepo } from '@/lib/ops/core/area';
import { usedOf } from './areas/sample';
import type {
  Agency, AppPurchase, AppReview, AppUser, Contract, FavoriteStat, FeePayment, FeePlan, Model, MonthlyMenu, MonthlySales, Referral, ReviewTags, SalesSample, SampleQuota, SampleWeekClose, VmLayout, Warehouse,
} from './types';

/*
 * check.run の続き：アプリの利用者・購入・レビュー・お気に入り・売上の集計（dm.app）、代理店・紹介フィー（dm.org.agencies・dm.referral）、
 * 営業サンプル（dm.sample）、自販機の列の構成（dm.master.vmLayouts）、平均単価の目標（メニューごと）のつながりと合計。
 */

export const MORE_COUNT_KINDS = [
  'dm.app.users', 'dm.app.purchases', 'dm.app.reviews', 'dm.app.favoriteStats', 'dm.app.monthlySales',
  'dm.org.agencies', 'dm.referral.feePlans', 'dm.referral.referrals', 'dm.referral.payments', 'dm.sample.samples', 'dm.master.vmLayouts',
];

export function moreProblems(r: DocRepo): string[] {
  const p: string[] = [];
  const has = (kind: string, id: string) => !!id && !!r.get(kind, id);
  const need = (cond: boolean, msg: string) => { if (!cond) p.push(msg); };
  const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

  /* ---------- アプリ ---------- */
  const users = r.list<AppUser>('dm.app.users');
  for (const u of users) {
    need(/^U\d{8}$/.test(u.id), `アプリの利用者 ${u.id} の ID の形が違う（U＋8桁）`);
    need(has('dm.org.branches', u.branchId), `アプリの利用者 ${u.id} の拠点 ${u.branchId} がない`);
    need(['男性', '女性'].includes(u.gender) && ['10代', '20代', '30代', '40代', '50代', '60代以上'].includes(u.ageGroup), `アプリの利用者 ${u.id} の性別・年代がない`);
  }
  for (const x of r.list<AppPurchase>('dm.app.purchases')) {
    const u = r.get<AppUser>('dm.app.users', x.userId);
    need(!!u, `購入 ${x.id} の利用者 ${x.userId} がない`);
    if (u) need(u.branchId === x.branchId, `購入 ${x.id} の拠点 ${x.branchId} が利用者の拠点 ${u.branchId} と違う`);
    need(has('dm.master.products', x.productId), `購入 ${x.id} の商品 ${x.productId} がない`);
    need(Number.isInteger(x.qty) && x.qty >= 1 && x.amountYen === x.qty * x.unitPriceYen, `購入 ${x.id} の金額 ${x.amountYen} が 数量 × 単価 と合わない`);
    need(x.status === '支払済' ? !x.refundReason : !!x.refundReason, `購入 ${x.id} の返金理由が状態 ${x.status} と合わない`);
  }
  const tags = r.get<ReviewTags>('dm.app.reviewTags', 'tags');
  const tagSet = new Set([...(tags?.ng ?? []), ...(tags?.ok ?? [])]);
  for (const x of r.list<AppReview>('dm.app.reviews')) {
    need(has('dm.app.users', x.userId), `レビュー ${x.id} の利用者 ${x.userId} がない`);
    need(x.items.length > 0 && new Set(x.items.map((i) => i.productId)).size === x.items.length, `レビュー ${x.id} の商品がない・重なっている`);
    for (const i of x.items) {
      need(has('dm.master.products', i.productId), `レビュー ${x.id} の商品 ${i.productId} がない`);
      need(Number.isInteger(i.star) && i.star >= 1 && i.star <= 5, `レビュー ${x.id} の ${i.productId} の評価 ${i.star} が 1〜5 でない`);
      need(i.tags.every((t) => tagSet.has(t)), `レビュー ${x.id} の ${i.productId} の評価タグが評価タグの一覧にない`);
    }
  }
  for (const f of r.list<FavoriteStat>('dm.app.favoriteStats')) {
    need(has('dm.master.products', f.id), `お気に入りの集計の商品 ${f.id} がない`);
    need(f.male + f.female === f.total && f.ages.length === 6 && sum(f.ages) === f.total, `お気に入りの集計 ${f.id} の男女・年代の合計が ${f.total} と合わない`);
    need(sum(f.cells[0]) === f.male && sum(f.cells[1]) === f.female && f.ages.every((a, i) => f.cells[0][i] + f.cells[1][i] === a && f.cells[0][i] >= 0 && f.cells[1][i] >= 0), `お気に入りの集計 ${f.id} の性別×年代が男女・年代の合計と合わない`);
  }
  for (const m of r.list<MonthlySales>('dm.app.monthlySales')) {
    need(/^\d{4}-\d{2}$/.test(m.id), `月ごとの売上 ${m.id} の ID の形が違う`);
    for (const b of Object.keys(m.byBranch)) need(has('dm.org.branches', b), `月ごとの売上 ${m.id} の拠点 ${b} がない`);
    for (const x of Object.keys(m.byProduct)) need(has('dm.master.products', x), `月ごとの売上 ${m.id} の商品 ${x} がない`);
    need(sum(Object.values(m.byBranch)) <= m.totalYen && sum(Object.values(m.byProduct)) <= m.totalYen, `月ごとの売上 ${m.id} の拠点別・商品別の合計が全体 ${m.totalYen} を超える`);
    const pay = Object.values(m.byPay);
    if (pay.length) need(sum(pay) === m.totalYen, `月ごとの売上 ${m.id} の決済方法別の合計 ${sum(pay)} が全体 ${m.totalYen} と合わない`);
  }

  /* ---------- 代理店・紹介フィー ---------- */
  const plans = r.list<FeePlan>('dm.referral.feePlans');
  for (const x of plans) {
    need(/^RFP\d{6}$/.test(x.id), `紹介フィー ${x.id} の ID の形が違う`);
    const okCalc = x.calc === '固定額' ? x.amount != null && x.amount >= 0 : x.calc === '請求額割合' ? x.rate != null && x.rate > 0 && x.rate <= 100
      : !!x.tiers?.length && x.tiers.every((t, i) => i === 0 || t[0] > x.tiers![i - 1][0]);
    need(okCalc, `紹介フィー ${x.id} の計算方法 ${x.calc} の値がない・正しくない`);
    need(x.pay !== '継続（ヶ月）' || (x.months ?? 0) > 0, `紹介フィー ${x.id} の継続の月数がない`);
  }
  for (const a of r.list<Agency>('dm.org.agencies')) {
    need(/^AG\d{5}$/.test(a.id), `代理店 ${a.id} の ID の形が違う`);
    need(has('dm.referral.feePlans', a.feePlanId), `代理店 ${a.id} の紹介フィー ${a.feePlanId} がない`);
  }
  const refs = r.list<Referral>('dm.referral.referrals');
  for (const x of refs) {
    const c = r.get<Contract>('dm.org.contracts', x.contractId);
    need(!!c, `紹介 ${x.id} の親契約 ${x.contractId} がない`);
    need(refs.filter((y) => y.contractId === x.contractId).length === 1, `親契約 ${x.contractId} に紹介が複数ある`);
    need(has('dm.referral.feePlans', x.feePlanId), `紹介 ${x.id} の紹介フィー ${x.feePlanId} がない`);
    need(!!c?.agencyId !== !!x.srcCorpId, `紹介 ${x.id} の紹介元がない・代理店と法人の両方ある（親契約の代理店 ${c?.agencyId || 'なし'}・紹介元の法人 ${x.srcCorpId || 'なし'}）`);
    if (x.srcCorpId) need(has('dm.org.corps', x.srcCorpId), `紹介 ${x.id} の紹介元の法人 ${x.srcCorpId} がない`);
    if (c && x.payStart) need(x.payStart >= c.startCycle, `紹介 ${x.id} の支払い開始年月 ${x.payStart} が親契約の開始 ${c.startCycle} より前`);
    if (c?.endOn && x.end) need(x.end <= c.endOn.slice(0, 7).replace('/', '-'), `紹介 ${x.id} の終了 ${x.end} が親契約の終了日 ${c.endOn} より後`);
  }
  for (const pay of r.list<FeePayment>('dm.referral.payments')) {
    need(/^FP\d{6}-\d{4}$/.test(pay.id) && pay.id.slice(2, 8) === pay.month.replace('-', ''), `支払 ${pay.id} の ID が対象年月 ${pay.month} と合わない`);
    need(has(pay.type === '代理店' ? 'dm.org.agencies' : 'dm.org.corps', pay.targetId), `支払 ${pay.id} の支払先 ${pay.targetId} がない`);
    need(pay.status !== '支払済' || /^\d{4}\/\d{2}\/\d{2}$/.test(pay.paidOn), `支払 ${pay.id} は支払済みなのに支払日がない`);
    for (const l of pay.lines) {
      const x = refs.find((y) => y.id === l.referralId);
      need(!!x, `支払 ${pay.id} の紹介 ${l.referralId} がない`);
      if (!x) continue;
      const c = r.get<Contract>('dm.org.contracts', x.contractId);
      const src = c?.agencyId ? { type: '代理店', id: c.agencyId } : { type: '法人', id: x.srcCorpId };
      need(src.type === pay.type && src.id === pay.targetId, `支払 ${pay.id} の支払先 ${pay.targetId} が紹介 ${x.id} の紹介元 ${src.id} と違う`);
      need(!x.payStart || pay.month >= x.payStart, `支払 ${pay.id} の対象年月 ${pay.month} が紹介 ${x.id} の支払い開始 ${x.payStart} より前`);
      const cond = x.cond;
      if (cond?.calc === '固定額') need(l.feeYen === cond.amount, `支払 ${pay.id} の ${x.id} のフィー ${l.feeYen} が固定額 ${cond.amount} と合わない`);
      if (cond?.calc === '請求額割合') need(l.feeYen === Math.round((l.baseYen * (cond.rate ?? 0)) / 100), `支払 ${pay.id} の ${x.id} のフィー ${l.feeYen} が 請求額 ${l.baseYen} × ${cond.rate}% と合わない`);
      if (cond?.calc === '月次提供数別の金額') need(!!cond.tiers?.some((t) => t[1] === l.feeYen), `支払 ${pay.id} の ${x.id} のフィー ${l.feeYen} が提供数別の金額にない`);
      need(Number.isInteger(l.adjYen), `支払 ${pay.id} の調整額が整数でない`);
    }
  }

  /* ---------- 営業サンプル ---------- */
  const samples = r.list<SalesSample>('dm.sample.samples');
  const quotas = r.list<SampleQuota>('dm.sample.quotas');
  for (const x of samples) {
    const w = r.get<Warehouse>('dm.master.warehouses', x.warehouseId);
    need(!!w && w.type === 'picking', `営業サンプル ${x.id} の倉庫 ${x.warehouseId} がない（ピッキング倉庫）`);
    for (const i of x.items) need(has('dm.master.products', i.productId) && i.qty >= 1, `営業サンプル ${x.id} の商品 ${i.productId} がない・数が正しくない`);
    need(x.id === x.base || x.id.startsWith(x.base + '-'), `営業サンプル ${x.id} の番号が元の番号 ${x.base} と合わない`);
    need(/^[0-9A-Za-z-]{0,30}$/.test(x.trackingNo ?? ''), `営業サンプル ${x.id} の送り状番号の形が違う`);
    if (x.status === '締め済') need(has('dm.sample.weekCloses', x.week) && !!x.shipOrder, `営業サンプル ${x.id} は締め済なのに出荷週 ${x.week} の締め・出荷指示がない`);
    if (x.status === '受付済') need(!has('dm.sample.weekCloses', x.week), `営業サンプル ${x.id} は受付済なのに出荷週 ${x.week} を締めている`);
  }
  for (const q of quotas) need(usedOf(samples, q.id) <= q.n, `営業サンプルの ${q.id} の件数 ${usedOf(samples, q.id)} が月の件数 ${q.n} を超える`);
  for (const w of r.list<SampleWeekClose>('dm.sample.weekCloses')) need(/^\d{4}-\d{2}-\d{2}$/.test(w.id), `出荷週の締め ${w.id} の形が違う`);

  /* ---------- 自販機の列の構成・平均単価の目標 ---------- */
  for (const v of r.list<VmLayout>('dm.master.vmLayouts')) {
    need(r.get<Model>('dm.master.models', v.id)?.category === '自販機', `自販機の列の構成 ${v.id} の機種がない（自販機）`);
    need(Object.values(v.lanes).every((ls) => (ls ?? []).every(([n, k]) => Number.isInteger(n) && n > 0 && Number.isInteger(k) && k > 0)), `自販機の列の構成 ${v.id} の列の数が正しくない`);
  }
  /* 平均単価の目標はメニューごと（持っていないメニューは既定）。下限 ≦ 上限 */
  for (const m of r.list<MonthlyMenu>('dm.order.menus')) {
    const t = m.avgTarget;
    need(!t || (t.fr.min <= t.fr.max && t.vm.min <= t.vm.max), `メニュー ${m.id} の平均単価の目標の下限が上限より大きい`);
  }
  return p;
}
