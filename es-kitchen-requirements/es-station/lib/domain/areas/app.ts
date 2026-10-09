import { ApiError } from '@/lib/api/errors';
import { defineArea, toDocs, type DocRepo } from '@/lib/ops/core/area';
import { formatDate, parseDate, today } from '@/lib/supplier/dates';
import { listMenus } from '../menu';
import { APP_PURCHASES, APP_REVIEWS, APP_USERS, FAVORITE_STATS, MONTHLY_SALES, REVIEW_TAGS } from '../seed/app';
import type { AppPurchase, AppReview, AppUser, AppUserAge, AppUserGender, AppUserStatus, FavoriteStat, MonthlySales, ReviewTags } from '../types';

/*
 * アプリの利用者・購入・レビュー・お気に入り・月ごとの売上（area: app）。
 * kind：dm.app.users／dm.app.purchases／dm.app.reviews／dm.app.reviewTags／dm.app.favoriteStats／dm.app.monthlySales
 *   法人Web（売上・ユーザー管理・レビュー・ご意見）・運営（売上管理・お気に入り・ダッシュボード・レビュー・アカウント一覧のユーザー）が同じデータを読む。
 *   users       利用者（branchIds で絞る）
 *   purchases   購入（branchIds で絞る。新しい順）
 *   reviews     レビュー（branchIds＝投稿した利用者の拠点で絞る。新しい順）
 *   sales       購入の集計：拠点別・商品別（branchIds・from・to＝YYYY/MM/DD で絞る）
 *   menuHistory 商品が月間メニューに出た回数・前回の月（お気に入りの「登場回数」「前回登場年月」）
 *   refund      返金（支払済み → 返金中。3ヶ月より前の購入は返金できない）
 *   setLimit    購入制限（法人Web）
 *   setStatus   利用者の状態（運営のアカウント一覧）
 * 購入は拠点の在庫の有無でロックしない（受付簿 No.134・台帳 N「切り替えのときの最初の在庫」。旧 REQ-PO-154「未登録なら個人アプリで購入不可」は置き換え済）：
 *   最初の棚卸報告の前の拠点は理論在庫 0 から始まり、前から残っている商品はスキャンで買える（理論在庫はマイナスになってよい）。この領域に在庫でかける制限はない（制限は setLimit の購入制限だけ）
 *   理論在庫がない商品は、個人アプリ・ESQR の買い物の一覧には出さない（スキャンだけ。棚卸報告で理論在庫が計算できたら一覧に出る）。一覧の出し分けは個人アプリ・ESQR 側の実装で、この領域には持たない（受付簿 No.170・2026-10-06）
 */

const K = {
  users: 'dm.app.users', purchases: 'dm.app.purchases', reviews: 'dm.app.reviews', tags: 'dm.app.reviewTags',
  fav: 'dm.app.favoriteStats', monthly: 'dm.app.monthlySales',
} as const;

/** 決済方法（Phase2 は現金なし） */
export const APP_PAY_METHODS = ['クレジットカード', 'Apple Pay', 'Google Pay', 'PayPay', 'メルペイ', 'au PAY', 'd払い', 'Aeon Pay'];

/** 性別・年代の選択肢（利用者の登録情報。条件は複数選べる） */
export const APP_GENDERS: AppUserGender[] = ['男性', '女性'];
export const APP_AGES: AppUserAge[] = ['10代', '20代', '30代', '40代', '50代', '60代以上'];
/** 利用者の絞り込み（性別・年代。空・なし＝すべて） */
export type UserCond = { genders?: string[]; ageGroups?: string[] };
const matchUser = (a?: UserCond) => (u: AppUser) => (!a?.genders?.length || a.genders.includes(u.gender)) && (!a?.ageGroups?.length || a.ageGroups.includes(u.ageGroup));

const inBranches = (ids?: string[]) => (b: string) => !ids || ids.includes(b);
const byNewest = <T extends { at: string }>(a: T, b: T) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0);

const users = (r: DocRepo, a?: { branchIds?: string[] } & UserCond) => r.list<AppUser>(K.users).filter((u) => inBranches(a?.branchIds)(u.branchId) && matchUser(a)(u));
const purchases = (r: DocRepo, a?: { branchIds?: string[]; from?: string; to?: string; productIds?: string[] } & UserCond) => {
  /* 性別・年代の条件があるときは、その利用者の購入だけ */
  const uids = a?.genders?.length || a?.ageGroups?.length ? new Set(r.list<AppUser>(K.users).filter(matchUser(a)).map((u) => u.id)) : undefined;
  return r.list<AppPurchase>(K.purchases)
    .filter((p) => (!uids || uids.has(p.userId)) && inBranches(a?.branchIds)(p.branchId) && (!a?.productIds || a.productIds.includes(p.productId)) && (!a?.from || p.at.slice(0, 10) >= a.from) && (!a?.to || p.at.slice(0, 10) <= a.to))
    .sort(byNewest);
};

/** 購入の集計（返金済みを含む購入数・購入金額、支払い回数＝支払済み、返金＝返金中・返金済み、決済方法ごと） */
export type SalesAgg = { key: string; qty: number; amountYen: number; count: number; paidCount: number; refundCount: number; refundYen: number; byPay: Record<string, number> };
function agg(ps: AppPurchase[], keyOf: (p: AppPurchase) => string): SalesAgg[] {
  const m = new Map<string, SalesAgg>();
  for (const p of ps) {
    const k = keyOf(p);
    const x = m.get(k) ?? { key: k, qty: 0, amountYen: 0, count: 0, paidCount: 0, refundCount: 0, refundYen: 0, byPay: {} };
    x.qty += p.qty; x.amountYen += p.amountYen; x.count++;
    if (p.status === '支払済') x.paidCount++; else { x.refundCount++; x.refundYen += p.amountYen; }
    x.byPay[p.payMethod] = (x.byPay[p.payMethod] ?? 0) + p.amountYen;
    m.set(k, x);
  }
  return [...m.values()];
}

/** 商品が月間メニューに出た回数と前回の月（今のサイクル月まで） */
function menuHistory(r: DocRepo, a?: { until?: string }) {
  const until = a?.until ?? today().slice(0, 7).replace('/', '-');
  const out: Record<string, { n: number; last: string }> = {};
  for (const m of listMenus(r).filter((x) => x.id <= until)) {
    for (const it of m.items) {
      const x = (out[it.productId] ??= { n: 0, last: '' });
      x.n++; if (m.id > x.last) x.last = m.id;
    }
  }
  return out;
}

/** 返金できる最も古い日（今日の3ヶ月前。運営の売上管理の画面と同じ） */
export function refundLimitOn() {
  const d = parseDate(today());
  d.setMonth(d.getMonth() - 3);
  return formatDate(d);
}

function mustUser(r: DocRepo, id: string) {
  const u = r.get<AppUser>(K.users, id);
  if (!u) throw new ApiError('ユーザーが見つかりません', 404);
  return u;
}

export default defineArea({
  name: 'app',
  seed: () => ({
    [K.users]: toDocs(APP_USERS),
    [K.purchases]: toDocs(APP_PURCHASES),
    [K.reviews]: toDocs(APP_REVIEWS),
    [K.tags]: toDocs<ReviewTags>([REVIEW_TAGS]),
    [K.fav]: toDocs(FAVORITE_STATS),
    [K.monthly]: toDocs(MONTHLY_SALES),
  }),
  queries: {
    users,
    user: (r, { id }: { id: string }) => r.get<AppUser>(K.users, id) ?? null,
    purchases,
    reviews: (r, a?: { branchIds?: string[] }) => {
      const bOf = new Map(r.list<AppUser>(K.users).map((u) => [u.id, u.branchId]));
      return r.list<AppReview>(K.reviews).filter((x) => inBranches(a?.branchIds)(bOf.get(x.userId) ?? '')).sort(byNewest);
    },
    review: (r, { id }: { id: string }) => r.get<AppReview>(K.reviews, id) ?? null,
    reviewTags: (r) => r.get<ReviewTags>(K.tags, 'tags') ?? { id: 'tags', ng: [], ok: [] },
    favoriteStats: (r) => r.list<FavoriteStat>(K.fav),
    monthlySales: (r) => r.list<MonthlySales>(K.monthly).sort((a, b) => a.id.localeCompare(b.id)),
    sales: (r, a?: { branchIds?: string[]; from?: string; to?: string; productIds?: string[] } & UserCond) => {
      const ps = purchases(r, a);
      return { byBranch: agg(ps, (p) => p.branchId), byProduct: agg(ps, (p) => p.productId), payMethods: APP_PAY_METHODS };
    },
    menuHistory,
  },
  actions: {
    /** 返金を受け付ける（支払済み → 返金中）。3ヶ月より前の購入は返金できない */
    refund: (r, { id, reason }: { id: string; reason: string }) => {
      const p = r.get<AppPurchase>(K.purchases, id);
      if (!p) throw new ApiError('購入が見つかりません', 404);
      if (p.status !== '支払済') throw new ApiError('返金できません', 409);
      if (p.at.slice(0, 10) < refundLimitOn()) throw new ApiError('3ヶ月より前の注文は返金できません', 409);
      if (!reason?.trim()) throw new ApiError('返金理由を選んでください', 400);
      r.put<AppPurchase>(K.purchases, id, { ...p, status: '返金中', refundReason: reason });
      return { id, status: '返金中' as const };
    },
    /** 購入制限（法人Web の ユーザー管理） */
    setLimit: (r, { id, limit }: { id: string; limit: AppUser['limit'] }) => {
      const u = mustUser(r, id);
      r.put<AppUser>(K.users, id, { ...u, limit });
      return { limit };
    },
    /** 利用者の状態（運営のアカウント一覧。削除は 削除済 にして残す） */
    setStatus: (r, { id, status }: { id: string; status: AppUserStatus }) => {
      const u = mustUser(r, id);
      r.put<AppUser>(K.users, id, { ...u, status });
      return { status };
    },
  },
});
