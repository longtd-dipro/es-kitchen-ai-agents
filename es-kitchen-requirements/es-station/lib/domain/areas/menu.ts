import { ApiError } from '@/lib/api/errors';
import { isRealDate } from '../dateCheck';
import { defineArea, toDocs, type DocRepo } from '@/lib/ops/core/area';
import { addDays, nowStamp, today } from '@/lib/supplier/dates';
import { costOn, selectedSupplier } from '../product';
import {
  addYm, avgTargetError, avgTargetOf, BASE_KINDS, BASE_LABEL, BASE_TOTAL, baseEligible, baseSums, baseWeights, getMenu, listMenus, MENU_PDF_MAX, newItem, nextAvgTarget, parseMenuCsv, phaseOf, prevInfoOf, priceSnap, suggestItems,
  MENU_PDF_KINDS, SAMPLE_QUOTA_DEFAULT, inactiveError, targetOfKind, unmetOf,
  type CsvIssue, type SaveItemIn,
} from '../menu';
import { customerOff, customerSendDay, notify, notifyApp, notifyOnce, releaseScheduled } from '../notify';
import { KARI_APPROVALS } from '../seed/order';
import type { AvgTarget } from '../types';
import type { ChildContract, Delivery, KariApproval, MenuBaseKind, MenuItem, MenuLog, MonthlyMenu, Notification, Product, ProductOrder, ProductTag } from '../types';
import { deliversIn, refreshDefaultOrders } from './order';
import sample from './sample';

/*
 * 月間メニュー（area: menu）。データは dm.order.menus（月間メニュー。平均単価の目標もメニューごとに持つ）と dm.menu.kariApprovals（仮発注の承認）。
 *   save        作る・直す（編集中・公開中・締切済。配送中・終了は直せない）。基準注文数は手で直した値（manual）以外を自動で入れ直す。種類ごとの合計は 50 でなくても保存できる（合計 50 を求めるのは公開するときだけ。受付簿 #254・#256）。
 *               公開中は商品の追加・外す・並び・タグ・公開可能・基準注文数・PDF を直せる。商品を外しても注文は止めない（登録済・ES登録済の注文には残し、自動注文・お試し（自動）は作り直す：受付簿 #266。
 *               件数は impact）。締切済（今日 ＞ オーダー締切日）は商品の追加・外す・基準注文数の変更ができない（E124。表示の項目・PDF・説明だけ直せる）。
 *               公開日・オーダー開始日は公開後は変えられない。オーダー締切日は今日以降で、元の締切日がまだ来ていないときだけ直せる。
 *               デフォルト注文は作り直す（登録済は変えない）。変更履歴（log）を残す。notify＝true で法人に再通知
 *   recalcBase  基準注文数を自動で入れ直す（lib/domain/menu.ts の suggestItems：①注文の割合で按分 → ②平均仕入単価が目標の幅に入るように調整）
 *   readiness   公開の条件のうち満たしていないもの（全商品が公開可能・メイン画像・メニューPDF・仮発注の承認）
 *   alerts      運営のダッシュボードのアラート：自動公開日の3日前から、条件が足りない自動公開のメニュー（通知は出さない）
 *   publish     公開（条件を満たしていないと 400。条件を見ない公開はない。公開の条件は PDF・全商品が公開可能・メイン画像・仮発注の承認＋種類ごとの基準注文数の合計 50）。販売価格の写し（prices）を取り、デフォルト注文を作り、法人だけに知らせる
 *   delete      論理削除（編集中で、オーダーが締まっていない月のメニューだけ。状態「削除済」で dm.order.menusDeleted に残す。同じ年月で作り直せる）
 *   impact      商品を外すときの確認（その商品を含む注文の件数：残る注文＝登録済・ES登録済／作り直される注文＝デフォルト・お試し（自動））
 *   tick        毎日の処理（開発中は POST /api/domain/menu/tick）：自動公開（メニュー公開日に条件がそろっているときだけ。足りなければ公開せず、運営へお知らせ＋ダッシュボードの警告・翌日も再判定）・路線便の「届きました」の予約と送信
 *   importCsv   CSV取込（00_確認してほしい/月間メニューCSV_Phase2テンプレート案.md）。行ごとに取り込む（エラーの行は取り込まず、ほかの行を登録。合計 50 では止めない：受付簿 #239・#248）
 */

const KARI = 'dm.menu.kariApprovals';
/** 論理削除したメニュー（状態「削除済」） */
const DELETED = 'dm.order.menusDeleted';
/** 自動公開の何日前から運営（ダッシュボード）に出すか */
const WARN_DAYS = 3;

const productOf = (r: DocRepo) => (id: string) => r.get<Product>('dm.master.products', id);
/** 画面に出す日付（YYYY/MM/DD → YYYY-MM-DD） */
const iso = (d: string) => d.replace(/\//g, '-');
const ymJa = (ym: string) => `${ym.slice(0, 4)}年${Number(ym.slice(5))}月`;
const isDate = isRealDate;
function mustMenu(r: DocRepo, menuId: string) {
  const m = getMenu(r, menuId);
  if (!m) throw new ApiError(`${menuId} のメニューがありません`, 404);
  return m;
}
const kariOf = (r: DocRepo, ym: string) => r.get<KariApproval>(KARI, ym);
const readinessOf = (r: DocRepo, m: MonthlyMenu) => unmetOf(m, productOf(r), kariOf(r, m.id));

/**
 * 基準注文数の提案（①前の3サイクル月までの注文の割合で按分 → ②平均仕入単価が目標の幅に入るように調整。lib/domain/menu.ts の suggestItems）。
 * 手で直した値はそのまま。noAdjust＝true（「調整を戻す」）なら ①だけ
 */
function recalc(r: DocRepo, ym: string, items: MenuItem[], target: AvgTarget, noAdjust?: boolean) {
  const others = listMenus(r).filter((m) => m.id !== ym);
  const prod = productOf(r);
  const cost = (id: string) => { const p = prod(id); return p ? costOn(selectedSupplier(p)) : 0; };
  return suggestItems(items, baseWeights(ym, items.map((x) => x.productId), prod, others, r.list<ProductOrder>('dm.order.orders')), prod, { cost, target, adjust: !noAdjust });
}
/** ②の調整で目標の幅に届かなかった種類の警告 */
const adjustWarnings = (m: Pick<MonthlyMenu, 'avgTarget'>, unreachable: MenuBaseKind[]) =>
  unreachable.map((k) => { const t = targetOfKind(avgTargetOf(m), k); return `${BASE_LABEL[k]}の平均仕入単価を目標（${t.min}〜${t.max}円）の幅に調整できませんでした（注文の割合の按分のままです。手で直してください）`; });
/** 基準注文数の合計が 50 でない種類（警告） */
const baseWarnings = (r: DocRepo, m: MonthlyMenu) => {
  const { sums, bad } = baseSums(m.items, productOf(r));
  return bad.map((k) => `${BASE_LABEL[k]}の合計が ${sums[k]} です（50 にしてください）`);
};
/** 変わったところの文（メニューの変更履歴） */
function diffMenu(a: MonthlyMenu, b: MonthlyMenu): string {
  const ids = (m: MonthlyMenu) => m.items.map((x) => x.productId);
  const out: string[] = [];
  const add = ids(b).filter((id) => !ids(a).includes(id)), del = ids(a).filter((id) => !ids(b).includes(id));
  if (add.length) out.push(`商品を追加（${add.join('・')}）`);
  if (del.length) out.push(`商品を外した（${del.join('・')}）`);
  const same = ids(a).filter((id) => ids(b).includes(id));
  if (same.join() !== ids(b).filter((id) => same.includes(id)).join()) out.push('表示順を変更');
  const ch = (f: (x: MenuItem) => unknown, label: string) => {
    const xs = same.filter((id) => JSON.stringify(f(a.items.find((x) => x.productId === id)!)) !== JSON.stringify(f(b.items.find((x) => x.productId === id)!)));
    if (xs.length) out.push(`${label}を変更（${xs.join('・')}）`);
  };
  ch((x) => x.tags, '商品タグ'); ch((x) => x.publishable, '公開可能'); ch((x) => x.sample, '営業サンプル'); ch((x) => x.base, '基準注文数');
  if (JSON.stringify(a.pdfs) !== JSON.stringify(b.pdfs)) out.push('メニューPDF を変更');
  if (a.publishOn !== b.publishOn || a.orderFrom !== b.orderFrom || a.orderTo !== b.orderTo) out.push(`受付期間を ${b.orderFrom}〜${b.orderTo} に変更`);
  if (a.corpPublish !== b.corpPublish) out.push(`法人向けの公開を「${b.corpPublish}${b.corpPublish === '自動公開' ? ` ${b.publishOn}` : ''}」に変更`);
  const ta = avgTargetOf(a), tb = avgTargetOf(b);
  if (JSON.stringify(ta) !== JSON.stringify(tb)) out.push(`平均単価の目標を 冷蔵庫 ${tb.fr.min}〜${tb.fr.max}円・自販機 ${tb.vm.min}〜${tb.vm.max}円 に変更`);
  return out.join('・');
}
const withLog = (m: MonthlyMenu, at: string, by: string, what: string): MonthlyMenu => (what ? { ...m, log: [{ at, by, what } as MenuLog, ...(m.log ?? [])] } : m);

/* ---------------- 法人への通知 ---------------- */

/** そのサイクルに契約（配送）がある拠点のアカウントと、その法人のアカウントに知らせる（法人だけ。アプリの利用者には出さない） */
function notifyCorps(r: DocRepo, m: MonthlyMenu, kind: 'menu_published' | 'menu_updated', sched = false) {
  const ccs = r.list<ChildContract>('dm.org.childContracts').filter((c) => c.cycleMonth === m.id && deliversIn(r, c));
  const ids = new Set<string>();
  for (const c of ccs) {
    ids.add(c.branchId);
    const corpId = r.get<{ corpId: string | null }>('dm.org.branches', c.branchId)?.corpId;
    if (corpId) ids.add(corpId);
  }
  const title = kind === 'menu_published' ? `${ymJa(m.id)}のメニューを公開しました（ご注文は ${m.orderTo} まで）` : `${ymJa(m.id)}のメニューを更新しました`;
  const body = kind === 'menu_published'
    ? [`ご注文の受付：${m.orderFrom}〜${m.orderTo}（締切 ${m.orderTo}）`,
      'ご注文の方法：法人Web の「月次注文」で、便ごとに商品と個数を選んでください（月の合計は「1回の食数 × 配送の回数」まで）。ご注文がない拠点は基準数でお届けします。',
      'ご注文のメール：受付の開始・締切の前にメールでもお知らせします。',
      'お届け日の変更：法人Web の「お届け予定」から申請できます。'].join('\n')
    : `メニューの内容が変わりました。ご注文の内容をご確認ください（締切 ${m.orderTo}）。`;
  let n = 0;
  for (const id of ids) {
    if (!r.get('dm.account.accounts', id)) continue;
    const x = { to: { site: 'corp' as const, accountId: id, role: '' }, templateId: kind, title, body, link: { type: 'menu' as const, id: m.id } };
    /* 自動公開（日次バッチ）は予定のお知らせ（sched:・休みの日には出さない） */
    if (sched) notifyOnce(r, `sched:${kind}:${m.id}:${id}`, x); else notify(r, x);
    n++;
  }
  return n;
}

/* ---------------- 運営のダッシュボードのアラート（自動公開の条件） ---------------- */

/**
 * 自動公開の3日前から、条件が足りない自動公開のメニュー（通知は出さない。運営の TOP に出す）。
 * late＝自動公開日を過ぎた（条件がそろうまで公開しない）
 */
export function menuAlerts(r: DocRepo, day = today()) {
  /* 自動公開の日＝メニュー公開日（自動公開日付はなくした：受付簿 No.240） */
  return listMenus(r).filter((m) => m.status === '編集中' && m.corpPublish === '自動公開' && m.publishOn && day >= addDays(m.publishOn, -WARN_DAYS))
    .map((m) => ({ menuId: m.id, title: `${ymJa(m.id)}のメニュー`, autoPublishOn: m.publishOn, late: day >= m.publishOn, missing: readinessOf(r, m) }))
    .filter((x) => x.missing.length);
}

/* ---------------- 保存・公開 ---------------- */

export type SaveMenuArgs = {
  menuId: string;
  /** 表示順に並べた商品（品番だけでもよい）。省くと今のまま。渡さなかった項目は今の値（新しい商品は初期値） */
  items?: SaveItemIn[];
  publishOn?: string; orderFrom?: string; orderTo?: string;
  corpPublish?: MonthlyMenu['corpPublish']; autoPublishOn?: string; pdfs?: MonthlyMenu['pdfs'];
  /** 平均仕入単価の目標（冷蔵庫・自販機の 下限〜上限）。省くと今の値（新しいメニューは前月の値・なければ見本の既定）。公開したメニューは変えられない */
  avgTarget?: AvgTarget;
  /** 標準数の提案 ②（平均単価の調整）を使わない（「調整を戻す」）。省くと今の値 */
  noAdjust?: boolean;
  /** 公開中のメニューを直したとき、法人に知らせ直すか */
  notify?: boolean;
  accountId?: string;
};

/** 保存してある商品の基準注文数が同じか（締切後は変えられない：E124） */
const sameBase = (a: MenuItem | undefined, b: MenuItem | undefined) => !!a && !!b && BASE_KINDS.every((k) => a.base[k] === b.base[k]);

/** 月間メニューを作る・直す（編集中・公開中・締切済。配送中・終了は直せない）。基準注文数は手で直した値以外を入れ直す */
export function saveMenu(r: DocRepo, a: SaveMenuArgs): MonthlyMenu {
  if (!/^\d{4}-\d{2}$/.test(a.menuId)) throw new ApiError('サイクル月が正しくありません', 400);
  const cur = getMenu(r, a.menuId);
  const phase = cur ? phaseOf(cur) : '編集中';
  /* 配送中・終了のメニューは直せない（E129） */
  if (cur && ['配送中', '終了'].includes(phase)) throw new ApiError(`オーダー締切日（${iso(cur.orderTo)}）を過ぎたため、メニューは変更できません。`, 409);
  const published = phase === '公開中' || phase === '締切済';
  /* 締切済（今日 ＞ オーダー締切日）：商品の追加・外す・基準注文数の変更はできない（E124。表示の項目・PDF・説明だけ直せる。受付簿 #255・#266） */
  const closed = phase === '締切済';
  const prod = productOf(r);
  const old = new Map((cur?.items ?? []).map((x) => [x.productId, x]));
  let items = cur?.items ?? [];
  if (a.items) {
    const seen = new Set<string>();
    items = [];
    for (const x of a.items) {
      const v = typeof x === 'string' ? { productId: x } : x;
      if (!v.productId || seen.has(v.productId)) continue;
      seen.add(v.productId);
      const p = prod(v.productId);
      if (!p) throw new ApiError(`${v.productId} は商品マスタにありません`, 400);
      if (!old.has(v.productId) && p.status === '削除済') throw new ApiError(`${v.productId} は削除済の商品です`, 400);
      /* 無効の商品は、メニューへ新しく足せない（すでに入っているものはそのまま。受付簿 #232・#278） */
      if (!old.has(v.productId) && p.status === '無効') throw new ApiError(`${v.productId} は無効の商品です`, 400);
      /* タグはメニューの商品ごと（月ごと）。新しく入れた商品は空から。NEW も特別扱いしない（台帳 F 2026-10-08） */
      const b = old.get(v.productId) ?? newItem(v.productId, 0);
      const tags = [...new Set(v.tags ?? b.tags)];
      items.push({ ...b, ...v, tags, base: { ...b.base, ...v.base }, manual: { ...b.manual, ...v.manual }, order: items.length + 1 });
    }
  }
  /* 無効・削除済の商品がすでに入っているメニューは保存できない（メニューから外せば保存できる：受付簿 #285） */
  const inactive = inactiveError(items, prod);
  if (inactive) throw new ApiError(inactive, 400);
  if (closed && cur) {
    const lock = `オーダー締切日（${iso(cur.orderTo)}）を過ぎたため、商品の追加・削除と基準注文数の変更はできません。`;
    if (items.length !== old.size || items.some((x) => !old.has(x.productId) || !sameBase(x, old.get(x.productId)))) throw new ApiError(lock, 409);
  }
  const tags = new Set(r.list<ProductTag>('dm.master.productTags').map((t) => t.name));
  for (const x of items) {
    const bad = x.tags.find((t) => !tags.has(t));
    if (bad) throw new ApiError(`商品タグ「${bad}」はタグのマスタにありません（${x.productId}）`, 400);
    for (const k of BASE_KINDS) if (!(Number.isInteger(x.base[k]) && x.base[k] >= 0)) throw new ApiError(`${x.productId} の${BASE_LABEL[k]}は 0 以上の整数にしてください`, 400);
  }
  const corpPublish = published ? '公開' : a.corpPublish ?? cur?.corpPublish ?? '非公開';
  if (published && a.corpPublish && a.corpPublish !== '公開') throw new ApiError('公開したメニューは非公開に戻せません', 409);
  if (!published && corpPublish === '公開') throw new ApiError('公開は「公開する」から行ってください（公開の条件を確かめます）', 400);
  const prev = addYm(a.menuId, -1).replace('-', '/');
  const publishOn = a.publishOn ?? cur?.publishOn ?? `${prev}/01`, orderFrom = a.orderFrom ?? cur?.orderFrom ?? `${prev}/01`, orderTo = a.orderTo ?? cur?.orderTo ?? `${prev}/15`;
  if (![publishOn, orderFrom, orderTo].every(isDate) || orderFrom > orderTo) throw new ApiError('オーダー開始日・締切日が正しくありません', 400);
  /* 公開後の日付：公開日・開始日は固定。締切日は今日以降で、元の締切日がまだ来ていないときだけ直せる（受付簿 #266 ④） */
  if (published && cur) {
    if (publishOn !== cur.publishOn || orderFrom !== cur.orderFrom) throw new ApiError('公開したメニューの公開日・オーダー開始日は変えられません', 409);
    if (orderTo !== cur.orderTo && (closed || orderTo < today())) throw new ApiError(closed ? `オーダー締切日（${iso(cur.orderTo)}）を過ぎたため、締切日は変えられません` : 'オーダー締切日は今日以降の日付にしてください', closed ? 409 : 400);
  }
  /* 自動公開の日＝メニュー公開日（自動公開日付はなくした：受付簿 No.240） */
  const autoPublishOn = corpPublish === '自動公開' ? publishOn : '';
  const pdfs = a.pdfs ?? cur?.pdfs ?? [];
  if (pdfs.some((f) => !f.name?.trim() || !(f.size >= 0))) throw new ApiError('メニューPDF のファイルが正しくありません', 400);
  if (pdfs.some((f) => !MENU_PDF_KINDS.includes(f.kind))) throw new ApiError('メニューPDF の種別（ライト用／スタンダード用）を選んでください', 400);
  /* メニューPDF は 5MB 以下（RD-MN-030） */
  const big = pdfs.filter((f) => f.size > MENU_PDF_MAX);
  if (big.length) throw new ApiError(`メニューPDF は 5MB 以下にしてください（${big.map((f) => f.name).join('・')}）`, 400);
  /* 平均単価の目標（メニューごと）：新しいメニューは前月の値。公開したメニューは公開時の値で固定（2026-10-05 台帳 F） */
  const avgTarget: AvgTarget = a.avgTarget ? { fr: { ...a.avgTarget.fr }, vm: { ...a.avgTarget.vm } } : cur?.avgTarget ?? nextAvgTarget(listMenus(r), a.menuId);
  const avgErr = avgTargetError(avgTarget);
  if (avgErr) throw new ApiError(avgErr, 400);
  if (published && a.avgTarget && JSON.stringify(avgTargetOf(cur)) !== JSON.stringify(avgTarget)) throw new ApiError('公開したメニューの平均単価の目標は変えられません（公開時の値で固定）', 409);
  const at = nowStamp(), by = a.accountId ?? 'system';
  const noAdjust = a.noAdjust ?? cur?.noAdjust ?? false;
  /* 基準注文数は種類ごとの合計が 50 でなくても保存できる（確認ダイアログだけ：受付簿 #249・#256）。締切済は今のまま */
  const nextItems = closed ? items : recalc(r, a.menuId, items, avgTarget, noAdjust).items;
  let next: MonthlyMenu = {
    ...(cur ?? { id: a.menuId, status: '編集中', publishedAt: '' }), id: a.menuId, status: cur?.status ?? '編集中', publishOn, orderFrom, orderTo, corpPublish, autoPublishOn, pdfs, avgTarget, noAdjust,
    items: nextItems, updatedAt: at, updatedBy: by,
  } as MonthlyMenu;
  /* 公開中に足した商品は、足したときの販売価格を写す（外した商品の写しは消す） */
  if (published && !closed) {
    const prices = { ...(cur!.prices ?? {}) };
    for (const id of Object.keys(prices)) if (!nextItems.some((x) => x.productId === id)) delete prices[id];
    for (const x of nextItems) if (!prices[x.productId]) prices[x.productId] = priceSnap(r, prod(x.productId)!, at);
    next.prices = prices;
  }
  next = cur ? withLog(next, at, by, diffMenu(cur, next) + (published && a.notify ? '（法人へ再通知）' : '')) : withLog(next, at, by, 'メニューを作成');
  r.put('dm.order.menus', next.id, next);
  /* 新しいメニューの営業サンプル件数は月60件（RD-MN-045。決めてあればそのまま・公開（締切）まで直せる） */
  if (!cur && sample.queries.quota(r, { ym: next.id }) == null) sample.actions.setQuota(r, { ym: next.id, n: SAMPLE_QUOTA_DEFAULT });
  /* 公開中（締切前）に直したら、自動注文・お試し（自動）を作り直す（登録済・ES登録済は変えない。合計≠50 でも比で按分する） */
  if (published && !closed) {
    /* 商品が増減したとき＝自動注文・お試し（自動）の両方。標準数（基準注文数）だけ変わったとき＝自動注文だけ（お試し（自動）は標準数を使わない）。
       調整数のある注文・登録済・ES登録済・取消は作り直さない（受付簿 #266。refreshDefaultOrders が見る） */
    const itemsChanged = nextItems.length !== old.size || nextItems.some((x) => !old.has(x.productId));
    const baseChanged = nextItems.some((x) => !sameBase(x, old.get(x.productId)));
    if (itemsChanged || baseChanged) {
      refreshDefaultOrders(r, next.id, undefined, itemsChanged
        ? { why: 'メニューの商品が変わったため（外した商品を除く）' }
        : { kinds: ['デフォルト'], why: '標準数が変わったため' });
    }
    if (a.notify) notifyCorps(r, next, 'menu_updated');
  }
  return next;
}

/** 公開する（手動・自動）。デフォルト注文を作り、法人に知らせる */
function publishCore(r: DocRepo, m: MonthlyMenu, at: string, by: string) {
  /* この月の販売価格は公開したときの値（商品マスタの価格改定は次のメニューから） */
  const prices = Object.fromEntries(m.items.map((x) => [x.productId, priceSnap(r, productOf(r)(x.productId)!, at)]));
  /* 平均単価の目標は公開時の値で固定（持っていなければ既定を書き込む） */
  const next = withLog({ ...m, status: '公開中', corpPublish: '公開', publishedAt: at, updatedAt: at, updatedBy: by, prices, avgTarget: avgTargetOf(m) }, at, by, by === 'system' ? '自動公開' : '公開');
  r.put('dm.order.menus', m.id, next);
  const orders = refreshDefaultOrders(r, m.id);
  const notified = notifyCorps(r, next, 'menu_published', by === 'system');
  return { menu: next, defaultOrders: orders, notified };
}

export default defineArea({
  name: 'menu',
  /* 平均単価の目標はメニューごと（MonthlyMenu.avgTarget。設定管理の専用画面・dm.menu.avgTarget はなくした。2026-10-05 台帳 F） */
  seed: () => ({ [KARI]: toDocs(KARI_APPROVALS) }),
  queries: {
    /** 月間メニュー（表示順の商品・基準注文数の合計・合計が 50 でない警告・公開の条件） */
    get(r, { menuId }: { menuId: string }) {
      const m = mustMenu(r, menuId);
      return { menu: m, sums: baseSums(m.items, productOf(r)).sums, warnings: baseWarnings(r, m), missing: readinessOf(r, m), kari: kariOf(r, menuId) ?? null };
    },
    /** 公開の条件のうち満たしていないもの（空なら公開できる） */
    readiness(r, { menuId }: { menuId: string }) {
      const missing = readinessOf(r, mustMenu(r, menuId));
      return { menuId, ready: !missing.length, missing };
    },
    /** 運営の TOP（ダッシュボード）のアラート：自動公開日の3日前から、条件が足りない自動公開のメニュー */
    alerts: (r, a?: { today?: string }) => menuAlerts(r, a?.today),
    /** 論理削除したメニュー（状態「削除済」。一覧で「削除済」を選んだときだけ出す。受付簿 #247） */
    deleted: (r) => r.list<MonthlyMenu>(DELETED).map((m) => ({ ...m, status: '削除済' as const })),
    /**
     * 商品を外すときの確認（保存の前。受付簿 #255・#266）：その商品を含む注文の件数。
     * keep＝残る注文（登録済・ES登録済。外した商品を自動で消さない）、rebuild＝作り直される注文（デフォルト＝自動注文・お試し（自動）。外した商品を除いて作り直す）
     */
    impact(r, { menuId, productIds }: { menuId: string; productIds: string[] }) {
      const orders = r.list<ProductOrder>('dm.order.orders').filter((o) => o.cycleMonth === menuId && o.lines.some((l) => productIds.includes(l.productId)));
      /* 調整数のある注文は作り直さない（残る側に数える：受付簿 #266） */
      const kindOf = (o: ProductOrder) => (['登録済', 'ES登録済'].includes(o.status) || (['デフォルト', 'お試し（自動）'].includes(o.status) && o.adjust?.some((x) => x.qty > 0)) ? 'keep' : ['デフォルト', 'お試し（自動）'].includes(o.status) ? 'rebuild' : null);
      const pick = (ids: string[]) => {
        const xs = orders.filter((o) => o.lines.some((l) => ids.includes(l.productId)));
        return { keep: xs.filter((o) => kindOf(o) === 'keep').map((o) => o.id), rebuild: xs.filter((o) => kindOf(o) === 'rebuild').map((o) => o.id) };
      };
      return { total: pick(productIds), byProduct: productIds.map((id) => ({ productId: id, ...pick([id]) })) };
    },
    /** 商品追加のダイアログ：前回メニュー・前回連続（productIds を省くと商品マスタ全部） */
    prevInfo(r, { menuId, productIds }: { menuId: string; productIds?: string[] }) {
      const ids = productIds ?? r.list<Product>('dm.master.products').map((p) => p.id);
      return prevInfoOf(listMenus(r), menuId, ids);
    },
    /** 仮発注の承認（メニューの月ごと） */
    kari: (r, a?: { menuId?: string }) => r.list<KariApproval>(KARI).filter((x) => !a?.menuId || x.id === a.menuId),
    /** メニューの平均単価の目標（冷蔵庫・自販機）。持っていないメニューは見本の既定 */
    avgTarget: (r, { menuId }: { menuId: string }) => avgTargetOf(mustMenu(r, menuId)),
  },
  actions: {
    save: (r, a: SaveMenuArgs) => saveMenu(r, a),
    /** 基準注文数を自動で入れ直す（手で直した値はそのまま）。公開中ならデフォルトの注文も作り直す */
    recalcBase(r, { menuId, accountId }: { menuId: string; accountId?: string }) {
      const m = mustMenu(r, menuId);
      const phase = phaseOf(m);
      if (!['編集中', '公開中'].includes(phase)) throw new ApiError(`オーダー締切日（${iso(m.orderTo)}）を過ぎたため、商品の追加・削除と基準注文数の変更はできません。`, 409);
      const { items, unreachable } = recalc(r, menuId, m.items, avgTargetOf(m), m.noAdjust);
      const next = withLog({ ...m, items, updatedAt: nowStamp(), updatedBy: accountId ?? 'system' }, nowStamp(), accountId ?? 'system', '基準注文数を自動で入れ直した');
      r.put('dm.order.menus', menuId, next);
      if (m.status === '公開中') refreshDefaultOrders(r, menuId, undefined, { kinds: ['デフォルト'], why: '標準数が変わったため' });
      return { menu: next, sums: baseSums(next.items, productOf(r)).sums, warnings: [...baseWarnings(r, next), ...adjustWarnings(next, unreachable)] };
    },
    /** 手で直した印を外す（ids を省くと全商品）。外した値は自動で入れ直す */
    resetManual(r, { menuId, ids, accountId }: { menuId: string; ids?: string[]; accountId?: string }) {
      const m = mustMenu(r, menuId);
      return saveMenu(r, { menuId, accountId, items: m.items.map((x) => (!ids || ids.includes(x.productId) ? { ...x, manual: { std: false, ns: false, vm: false } } : x)) });
    },
    /** 公開する（手動）。公開の条件を満たしていないと 400（条件を見ないで公開することはできない） */
    publish(r, { menuId, accountId }: { menuId: string; accountId?: string }) {
      const m = mustMenu(r, menuId);
      if (m.status !== '編集中') throw new ApiError('編集中のメニューだけ公開できます', 409);
      if (!m.items.length) throw new ApiError('商品を1つ以上入れてください', 400);
      const missing = readinessOf(r, m);
      if (missing.length) throw new ApiError(`公開の条件を満たしていません。${missing.join('／')}`, 400);
      return publishCore(r, m, nowStamp(), accountId ?? 'system');
    },
    /**
     * 月間メニューを削除する（論理削除：状態「削除済」で dm.order.menusDeleted に残す。同じ年月で作り直せる。受付簿 #232・#237・#247・#276）。
     * 公開したメニュー（公開中・締切済・配送中・終了）と、オーダーが締まった月のメニューは削除できない
     */
    delete(r, { menuId, accountId }: { menuId: string; accountId?: string }) {
      const m = mustMenu(r, menuId);
      if (m.status !== '編集中') throw new ApiError('公開したメニューは削除できません', 409);
      if (m.orderTo && today() > m.orderTo) throw new ApiError(`オーダー締切日（${iso(m.orderTo)}）を過ぎた月のメニューは削除できません`, 409);
      const at = nowStamp(), by = accountId ?? 'system';
      const gone = withLog({ ...m, status: '削除済', updatedAt: at, updatedBy: by }, at, by, 'メニューを削除（論理削除）');
      r.put(`${DELETED}`, `${menuId}#${r.nextSeq('menuDeleted:' + menuId)}`, gone);
      r.remove('dm.order.menus', menuId);
      return { ok: true };
    },
    /** 仮発注の承認（発注・入荷。approve＝false で取り消す） */
    approveKari(r, { menuId, approve = true, accountId }: { menuId: string; approve?: boolean; accountId?: string }) {
      if (!/^\d{4}-\d{2}$/.test(menuId)) throw new ApiError('サイクル月が正しくありません', 400);
      const next: KariApproval = approve ? { id: menuId, status: '承認', approvedAt: nowStamp(), approvedBy: accountId ?? 'system' } : { id: menuId, status: '未承認', approvedAt: '', approvedBy: '' };
      r.put(KARI, menuId, next);
      return next;
    },
    /**
     * 毎日の処理。today（YYYY/MM/DD）を省くと今日、now（予約の通知を出す時刻）を省くと today の 9:00（today も省くといま）。
     *   ・自動公開のメニュー：自動公開日以降で条件がそろっていれば公開（足りないときは公開しない。運営の TOP のアラート＝alerts に出る。通知は出さない）
     *   ・路線便（ヤマトなど）の便：お届け日の 9:00 に「お食事が本日届きます」をアプリの利用者へ（予約して、時刻が来たら出す）
     */
    tick(r, a?: { today?: string; now?: string }) {
      const day = a?.today ?? today();
      if (!isDate(day)) throw new ApiError('日付の形が違います（YYYY/MM/DD）', 400);
      const now = a?.now ?? (a?.today ? `${day} 09:00` : nowStamp());
      const out = { today: day, published: [] as string[], warned: [] as { menuId: string; missing: string[] }[], scheduled: 0, released: 0 };
      for (const m of listMenus(r)) {
        /* 自動公開の日＝メニュー公開日（自動公開日付はなくした：受付簿 No.240） */
        if (m.status !== '編集中' || m.corpPublish !== '自動公開' || !m.publishOn || day < addDays(m.publishOn, -WARN_DAYS)) continue;
        const missing = readinessOf(r, m);
        /* 自動公開日がお客様の休み（土日祝）なら前の営業日に公開する（公開のお知らせを休みの日に送らない・2026/10/03 決定） */
        if (!missing.length && day >= customerSendDay(r, m.publishOn) && !customerOff(r, day)) { publishCore(r, m, now, 'system'); out.published.push(m.id); }
        else if (missing.length) {
          out.warned.push({ menuId: m.id, missing });
          /* 自動公開の日に条件が足りないときは公開しない。運営へお知らせ（毎日。翌日も再判定する）＋ダッシュボードの警告（alerts。受付簿 #276） */
          if (day >= m.publishOn) {
            for (const role of ['ops.full', 'ops.dev']) {
              notifyOnce(r, `menu-autopublish-failed:${m.id}:${day}:${role}`, {
                to: { site: 'ops', accountId: '', role }, channels: ['site'], templateId: 'menu_autopublish_failed',
                title: `${ymJa(m.id)}のメニューを自動公開できませんでした`,
                body: `自動公開の日（${m.publishOn}）に公開の条件がそろっていないため、公開していません。足りない条件：${missing.join('／')}。条件がそろうまで毎日確かめます。`,
                link: { type: 'menu', id: m.id },
              });
            }
          }
        }
      }
      /* 路線便は届く時刻がわからないので、お届け日の 9:00 に知らせる（今日・明日の便を予約） */
      const arrived = new Set(r.list<Notification>('dm.notice.notifications').filter((n) => n.templateId === 'meal_arrived' && n.link.type === 'delivery').map((n) => n.link.id));
      for (const d of r.list<Delivery>('dm.delivery.deliveries')) {
        if (d.regime !== 'parcel_carrier' || d.temp === '資材' || ['取消', '中止'].includes(d.status) || arrived.has(d.id)) continue;
        /* お届け日がお客様の休み（土日祝）なら、前の営業日の 9:00 に「〇日に届きます」 */
        const on = customerSendDay(r, d.deliverOn);
        if (d.deliverOn < day || on > addDays(day, 1)) continue;
        const md = `${Number(d.deliverOn.slice(5, 7))}/${Number(d.deliverOn.slice(8, 10))}`;
        notifyApp(r, d.branchId, on === d.deliverOn
          ? { templateId: 'meal_arrived', title: 'お食事が本日届きます', body: `${d.deliverOn} の便（${d.plannedQty}食）は本日届きます。`, link: { type: 'delivery', id: d.id }, key: `sched:meal_arrived:${d.id}` }
          : { templateId: 'meal_arrived', title: `お食事が ${md} に届きます`, body: `${d.deliverOn} の便（${d.plannedQty}食）は ${md} に届きます。`, link: { type: 'delivery', id: d.id }, key: `sched:meal_arrived:${d.id}` }, `${on} 09:00`);
        out.scheduled++;
      }
      out.released = releaseScheduled(r, now);
      return out;
    },
    /**
     * CSV取込。行ごとに取り込む（エラーの行は取り込まず、ほかの行を登録。ファイル全体のエラー［row ≦ 1］だけ何も保存しない）。すでに商品があるメニューは overwrite＝true のときだけ上書き（公開中は notify＝true で法人に再通知）。
     * CSV の基準注文数は運営が入れた値（manual）として持つ。自販機基準注文数が空なら自動
     */
    importCsv(r, a: { menuId: string; csv: string; overwrite?: boolean; notify?: boolean; accountId?: string }) {
      const cur = getMenu(r, a.menuId);
      const fail = (errors: CsvIssue[], warnings: CsvIssue[] = [], needOverwrite = false) => ({ ok: false as const, needOverwrite, errors, warnings, menu: null });
      if (cur && !['編集中', '公開中'].includes(phaseOf(cur))) throw new ApiError('編集中か公開中のメニューにだけ取り込めます。', 409);
      if (cur?.items.length && !a.overwrite) return fail([{ row: 0, message: `${ymJa(a.menuId)}のメニューはすでにあります。上書きしてよいか確認してください${cur.status === '公開中' ? '（公開中：法人へ再通知するか選べます）' : ''}` }], [], true);
      const tagNames = new Set(r.list<ProductTag>('dm.master.productTags').map((t) => t.name));
      const p = parseMenuCsv(a.csv ?? '', { menuId: a.menuId, product: productOf(r), tagNames });
      /* ファイル全体のエラー（見出し・年月・商品の行がない）は取り込めない。行のエラーは、その行だけ取り込まない（受付簿 #239） */
      if (p.errors.some((e) => e.row <= 1)) return fail(p.errors, p.warnings);
      if (!p.items.length) return fail([...p.errors, { row: 1, message: '登録できる行がありません' }], p.warnings);
      /* エラーの行の商品がすでにメニューにあるときは、そのまま残す（受付簿 #248） */
      const keep = (cur?.items ?? []).filter((x) => p.bad.some((b) => b.productId === x.productId) && !p.items.some((y) => y.productId === x.productId));
      try {
        const menu = saveMenu(r, { menuId: a.menuId, items: [...p.items, ...keep], notify: a.notify, accountId: a.accountId ?? 'CSV取込' });
        /* 種類ごとの合計が 50 にならなくても止めない（合計はメニューの保存の確認で見る：受付簿 #248・#249） */
        return { ok: true as const, needOverwrite: false, errors: p.errors, warnings: p.warnings, menu };
      } catch (e) {
        if (e instanceof ApiError) return fail([{ row: 1, message: e.message }], p.warnings);
        throw e;
      }
    },
  },
});
