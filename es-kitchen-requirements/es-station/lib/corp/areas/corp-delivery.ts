import { ApiError } from '@/lib/api/errors';
import { today } from '@/lib/supplier/dates';
import { defineArea, type DocRepo } from '@/lib/ops/core/area';
import app from '@/lib/domain/areas/app';
import domainDelivery from '@/lib/domain/areas/delivery';
import type { ChangeRequest as DCr, Contract, Cycle, Delivery, Holiday, Pause } from '@/lib/domain/types';
import { canDeliver } from '@/lib/domain/calendar';
import {
  buildCells, canApply, checkChangeRequest, CR_TONE, crOpen, homeMonths, md, mdW, mm, monthNote,
  pickCalendar, siteLong, sitePrefix, siteShort, wantText, wdOf, ymdW, type CycleLike,
} from '@/lib/corp/delivery/logic';
import { SITE_EXTRA } from '@/lib/corp/sites/seed';
import { branchesFor, crFor, deliveryFor, eventsFor, newsFor, todosFor, type BranchLike } from '@/lib/corp/delivery/fromDomain';
import type { CorpDelivery, CrView, NoticeItem } from '@/lib/corp/delivery/types';
import { fmtYm } from '@/lib/format/date';
import { orderDueWarning } from '@/lib/domain/customerNotices';
import { firstStockPending } from '@/lib/domain/areas/report';

/*
 * 法人Web のホーム（お届けカレンダー・お知らせ・確認が必要なお届け）・お届け詳細・申請（お届け日の変更）・お知らせ・レビュー。
 * 元：配送デモ 16_運営_配送.html の法人Web の画面（20_法人_まとめ.html の iframe fdl）。
 *
 * データは共通データ（lib/domain・dm.*）：拠点・契約（dm.org）、配送・明細・送り状・トラブル・お届け日の変更（dm.delivery）、
 *   お知らせ（dm.notice）、集金（dm.report）。画面の形は lib/corp/delivery/fromDomain.ts で作る。
 *   レビュー（dm.app.reviews・dm.app.users。運営Web のレビュー・ご意見と同じ投稿）。
 * queries・actions には、ログイン中のアカウントの corpId・branchId（拠点アカウントのとき）を渡す。拠点アカウントはその拠点のデータだけ。
 */

/** ログイン中のアカウント。ro＝解約後（参照のみ）：画面から渡す（corp-docs と同じ）。書き込みは断る */
type Who = { corpId: string; branchId?: string; ro?: boolean };

/** 解約後（参照のみ）は、お届け日の変更の申請・取り下げ・ご提案へのご返事をサーバーでも断る（台帳 2026-10-05・受付簿 No.157。E345） */
const refuseRo = (a: Who) => { if (a.ro) throw new ApiError('ご契約が終了しているため、できません。ESキッチンへお問い合わせください。', 403); };

const branchesOf = (repo: DocRepo, a: Who) => branchesFor(repo, a);
const todayIso = () => today().replace(/\//g, '-');
const isoOf = (d: string) => d.replace(/\//g, '-');
/** 拠点のお届けできない曜日（配送ルート設定。共通データにまだないので sites/seed.ts の値。申請で選べない日に使う：受付簿 No.82 ④） */
const ngWdOf = (site: string): string[] => SITE_EXTRA[site]?.kid.ng ?? [];
/** 配送サイクル（日付は YYYY-MM-DD） */
const cyclesOf = (repo: DocRepo): CycleLike[] => repo.list<Cycle>('dm.delivery.cycles').map((c) => ({ id: c.id, a1: isoOf(c.a1), orderCloseOn: isoOf(c.orderCloseOn) }));
/**
 * 休止の拠点の説明（「{拠点名}は {n}年{m}月分（{A1}）から休止のため、お届けはありません。」）。
 * 休止中、またはこれから休止する（休止の終わりが今月以降）拠点に出す。休止がなければ ''
 */
function pauseNote(repo: DocRepo, b: BranchLike, cycles: CycleLike[], todayYm: string) {
  const ct = repo.list<Contract>('dm.org.contracts').find((c) => c.branchId === b.id);
  const p = ct && repo.list<Pause>('dm.org.pauses').filter((x) => x.contractId === ct.id && x.toCycle >= todayYm).sort((x, y) => (x.fromCycle < y.fromCycle ? -1 : 1))[0];
  if (!p) return b.status === '休止中' ? `${siteShort(b)}は休止中のため、お届けはありません。` : '';
  const c = cycles.find((x) => x.id === p.fromCycle);
  return `${siteShort(b)}は ${+p.fromCycle.slice(0, 4)}年${+p.fromCycle.slice(5, 7)}月分${c ? `（${md(c.a1)}）` : ''}から休止のため、お届けはありません。`;
}

/** 申請（共通データ）を法人Web の形に。a があれば「取り下げられるか」（申請中・拠点アカウントは自分の申請だけ＝H2）も付ける */
function crsOf(repo: DocRepo, branches: BranchLike[], a?: Who): CrView[] {
  const ids = new Set(branches.map((b) => b.id));
  return repo.list<DCr>('dm.delivery.changeRequests').filter((c) => ids.has(c.branchId)).map((x) => {
    const c = crFor(repo, x);
    const b = branches.find((y) => y.id === c.site);
    const canWithdraw = !!a && c.status === '申請中' && (!a.branchId || c.by === a.branchId);
    return { ...c, tone: CR_TONE[c.status], siteName: b ? siteShort(b) : c.site, curText: mdW(c.cur), wantText: wantText(c), hasDetail: !!c.delivery, canWithdraw };
  });
}

/** お届け詳細を見られるか（自分の拠点のもの） */
function deliveryOf(repo: DocRepo, a: Who & { id: string }) {
  const x = repo.get<Delivery>('dm.delivery.deliveries', a.id);
  const branches = branchesOf(repo, a);
  /* 取消した便は法人には見せない（見つからないと同じ） */
  if (!x || x.status === '取消' || !branches.some((b) => b.id === x.branchId)) return null;
  return { d: deliveryFor(repo, x), branches };
}

/** お届け詳細の申請まわり（上の枠・申請できるか・これまでの申請） */
function crInfo(repo: DocRepo, d: CorpDelivery, branches: BranchLike[], a?: Who) {
  const crs = crsOf(repo, branches, a).filter((c) => c.delivery === d.id).sort((x, y) => (x.at < y.at ? 1 : -1));
  const active = crs.find((c) => (c.status === '別の日のご提案' || c.status === 'お断り済（ESキッチンで調整中）') && c.proposal) ?? null;
  const open = crs.some((c) => crOpen(c.status));
  return { crs, active, open, dateIso: d.dateIso };
}

/**
 * 申請のモーダルの月のカレンダー（版1.1・CW_DLV No.22.4）。選べない日＝全社の休日マスタ・お届けできない日（サイクル暦）・拠点のお届けできない曜日（配送ルート設定）・別の半分・今のお届け日（Q-D4）
 */
function calFor(repo: DocRepo, d: CorpDelivery) {
  const cycles = repo.list<Cycle>('dm.delivery.cycles');
  const holidays = repo.list<Holiday>('dm.delivery.holidays');
  return pickCalendar(d, (iso) => {
    const day = iso.replace(/-/g, '/');
    if (holidays.some((h) => h.date === day && h.noDelivery)) return '休日';
    if (ngWdOf(d.site).includes(wdOf(iso))) return '受け取れない曜日';
    return canDeliver(cycles, holidays, day) ? '' : '受け取れない曜日';
  });
}

/** メイン担当者（拠点の担当者の表から） */
function mainContact(b?: BranchLike) {
  const rows = (b?.form?.['#担当者（テーブル）'] ?? []) as unknown[];
  const r = rows.find((x): x is string[] => Array.isArray(x) && x[0] === 'メイン担当者');
  return r ? { name: r[1], tel: r[4] } : null;
}

const fail = (e: Record<string, string | undefined>) => { const m = Object.values(e).find(Boolean); if (m) throw new ApiError(m, 400); };
const stars = (n: number) => '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n);

export default defineArea({
  name: 'corp-delivery',
  /* 自分のデータは持たない（共通データを読む） */
  seed: () => ({}),

  queries: {
    /** ホーム：お届けカレンダー（ym の月）・お知らせ・確認が必要なお届け。site＝拠点で絞り込み（法人アカウント） */
    home: (repo, a: Who & { ym: string; site?: string }) => {
      const branches = branchesOf(repo, a);
      const ids = branches.map((b) => b.id);
      const many = !a.branchId && branches.length > 1;
      const siteF = many && a.site && ids.includes(a.site) ? a.site : 'all';
      const shown = new Set(siteF === 'all' ? ids : [siteF]);
      const multi = many && siteF === 'all';
      const prefix = Object.fromEntries(branches.map((b) => [b.id, sitePrefix(b)]));

      const crs = crsOf(repo, branches);
      const prop = new Set(crs.filter((c) => c.status === '別の日のご提案' && c.delivery).map((c) => c.delivery!));
      const all = eventsFor(repo, ids);
      const events = all.filter((e) => shown.has(e.site)).sort((x, y) => (x.d < y.d ? -1 : x.d > y.d ? 1 : 0));
      const t = todayIso();
      const cycles = cyclesOf(repo);
      /* 見られる月（決定 #54）：前はお届けのある月まで、先は予定を作ってある月まで（最大6か月先） */
      const months = homeMonths([...new Set(all.map((e) => e.d.slice(0, 7)))], t.slice(0, 7));
      const ym = months.includes(a.ym) ? a.ym : t.slice(0, 7);
      const holidays = Object.fromEntries(repo.list<Holiday>('dm.delivery.holidays').map((h) => [isoOf(h.date), h.name]));

      const news: NoticeItem[] = newsFor(repo)
        .sort((x, y) => (Number(!!y.important) - Number(!!x.important)) || (x.at < y.at ? 1 : -1))
        .map((n) => {
          const d = n.at.slice(0, 10).replace(/\//g, '-');
          return { at: `${d === t ? '今日' : mm(d)}・${n.at.slice(11, 16)}`, category: n.cat, title: n.title, href: n.detail ? `/corp/news/${n.id}` : undefined };
        });

      /* ご確認ください（決定 #58 の4種類。①のご提案は「別の日のご提案」の間だけ） */
      const todos = todosFor(repo, ids)
        .filter((x) => shown.has(x.site))
        .filter((x) => !(a.ro && x.applyOf))   /* 解約後（参照のみ）は④「申請できる予定」を出さない */
        .filter((x) => !x.crOpen || crs.find((c) => c.id === x.crOpen)?.status === '別の日のご提案');
      const pre = (x: { site: string }) => (multi ? `${prefix[x.site] ?? ''}：` : '');
      /* 解約後（参照のみ）：別の日のご提案の行は残すが、ご返事はできないと添える（hong 2026-10-06・受付簿 No.159）。 */
      const plain: NoticeItem[] = todos.filter((x) => !x.applyOf).map((x) => ({
        at: x.at, category: x.category, tone: x.tone, note: x.note,
        title: pre(x) + (a.ro && x.crOpen ? x.title.replace('にご返事ください', 'があります（解約後はご返事できません。ESキッチンへお問い合わせください）') : x.title),
        href: x.link ? `/corp/deliveries/${x.link}?from=home` : undefined,
      }));
      /* ④ 申請できる予定は、締切ごとに1行にまとめる（同じ文言の行が続いて縦に長くなり、締切の警告が埋もれるため。hong 2026-10-06）。押すとそのお届けの月のカレンダー */
      const byClose = new Map<string, ReturnType<typeof todosFor>>();
      for (const x of todos.filter((y) => y.applyOf)) byClose.set(x.note, [...(byClose.get(x.note) ?? []), x]);
      const plans: NoticeItem[] = [...byClose.values()].map((xs) => {
        const first = [...xs].sort((p, q) => p.at.localeCompare(q.at))[0];
        return { at: first.at, category: '予定', tone: 'info' as const, note: first.note, title: `お届け日の変更を申請できる予定のお届けが ${xs.length}件 あります（${first.note}）`, href: `/corp?ym=${first.applyYm ?? ''}&from=home` };
      });
      const todo: NoticeItem[] = [...plain, ...plans];

      const order = [...branches].sort((x, y) => Number(x.status === '休止中') - Number(y.status === '休止中'));
      const sites = many ? [{ value: 'all', label: 'すべての拠点' }, ...order.map((b) => ({ value: b.id, label: siteShort(b) + (b.status === '休止中' ? '（休止中）' : '') }))] : [];
      /* 拠点アカウント・拠点が1つの法人は絞り込みがないので、その拠点の休止の説明を出す */
      const siteB = !many && branches.length === 1 ? branches[0] : siteF === 'all' ? undefined : branches.find((b) => b.id === siteF);
      const siteNote = siteB ? pauseNote(repo, siteB, cycles, t.slice(0, 7)) : '';
      const note = monthNote(ym, cycles, t, !!a.ro) + (siteNote ? ' ' + siteNote : multi ? ' 法人アカウントは自社のすべての拠点のお届けを出します（マスの頭に拠点）。' : '');
      const title = ym === t.slice(0, 7) ? `今月のお届け（${fmtYm(ym)}）` : `${fmtYm(ym)} のお届け`;
      /* 締切の7日前から：まだご注文を入れていない拠点（受付簿 No.30）。「ご確認ください」の先頭の行（版1.1） */
      const orderDue = a.ro ? null : orderDueWarning(repo, [...shown], today());
      /* 最初の棚卸報告をまだしていない拠点（切り替えのあと。報告するまで出す・受付簿 No.134） */
      const firstStock = firstStockPending(repo, [...shown]);
      return { ym, site: siteF, sites, title, note, cells: buildCells(ym, t, events, multi ? prefix : null, prop, holidays, cycles), news, todo, months, orderDue, firstStock };
    },

    /** お届け詳細 */
    delivery: (repo, a: Who & { id: string }) => {
      const hit = deliveryOf(repo, a);
      if (!hit) return null;
      const { d, branches } = hit;
      const b = branches.find((x) => x.id === d.site);
      const { crs, active, open, dateIso } = crInfo(repo, d, branches, a);
      const pending = crs.find((c) => c.status === '申請中');
      const apply = canApply(d, today(), open);
      let noApplyText = d.noApplyText ?? '';
      if (active) noApplyText = 'このお届けには、ご返事が必要な申請があります（上の枠）。申請は1件ずつです。';
      else if (pending) noApplyText = 'このお届けには、ESキッチンが確認している申請があります（下の申請）。申請は1件ずつです。';
      else if (d.plan && !apply) noApplyText = `ご注文・変更の締切（${md(d.deadline!.replace(/\//g, '-'))}）を過ぎたため、日付の変更は申請できません。お急ぎの場合はESキッチンへお問い合わせください。`;
      /* 申請の履歴（版1.1・No.8）：申請中の行は上、終わった申請はその下。「取り下げる」は申請中の行だけ。拠点アカウントは法人アカウントの申請を取り下げられない（H2） */
      const hist = [...crs]   /* 提案中・お断り済の申請も表に出す（上の枠と同じ申請でも。台帳 267⑦「表で全項目」） */
        .sort((x, y) => Number(crOpen(y.status)) - Number(crOpen(x.status)))
        .map((c) => ({ ...c, canWithdraw: c.status === '申請中' && (!a.branchId || c.by === a.branchId) }));
      return {
        ...d, dateIso, date: ymdW(dateIso), dateShort: mdW(dateIso), siteName: b?.name ?? d.site, contact: mainContact(b),
        canApply: apply, noApplyText, active, hist, cal: calFor(repo, { ...d, dateIso }),
      };
    },

    /** 申請 ＞ お届け日の変更（申請日の新しい順）。att＝ご返事が必要な件数（タブの数） */
    requests: (repo, a: Who & { q?: string; st?: string; from?: string; to?: string }) => {
      const all = crsOf(repo, branchesOf(repo, a)).sort((x, y) => (x.at < y.at ? 1 : x.at > y.at ? -1 : x.id < y.id ? 1 : -1));
      const q = (a.q ?? '').trim();
      const rows = all.filter((c) => (!q || c.id.includes(q) || (c.delivery ?? '').includes(q))
        && (!a.st || c.status === a.st) && (!a.from || c.cur >= a.from) && (!a.to || c.cur <= a.to));
      return { rows, att: all.filter((c) => c.status === '別の日のご提案').length, all: all.length };
    },

    /** お知らせ一覧（詳細のあるもの・新しい順） */
    news: (repo) => newsFor(repo).filter((n) => n.detail).sort((x, y) => (x.at < y.at ? 1 : -1)),
    newsItem: (repo, a: { id: string }) => newsFor(repo).find((n) => n.id === a.id && n.detail) ?? null,

    /**
     * レビュー・ご意見（自社の拠点の利用者のもの）。REQ-UI-008（2026/10/02）：星評価・商品・ニックネームだけを出す
     * （2026/10/01 の「匿名」を上書き）。ユーザーID・メール・ご意見（自由記述）は出さない。ニックネーム未設定は「匿名ユーザー」
     */
    reviews: (repo, a: Who) => {
      const branches = branchesOf(repo, a);
      const users = app.queries.users(repo);
      const brOf = new Map(users.map((u) => [u.id, u.branchId]));
      const nickOf = new Map(users.map((u) => [u.id, u.nickname || '匿名ユーザー']));
      let tot = 0, cnt = 0;
      const rows = app.queries.reviews(repo, { branchIds: branches.map((b) => b.id) })
        .map((r) => ({ r, b: branches.find((x) => x.id === brOf.get(r.userId)) }))
        .filter((x) => x.b)
        .map(({ r, b }) => {
          for (const it of r.items) { tot += it.star; cnt++; }
          const top = r.items[0];
          return {
            id: r.id, at: r.at, site: siteLong(b!), nick: nickOf.get(r.userId) ?? '匿名ユーザー', p1: `${top.name}　${stars(top.star)}`, more: r.items.length > 1 ? `他${r.items.length - 1}品を表示` : '',
            tags: [...new Set(r.items.flatMap((it) => it.tags))],
          };
        });
      const avg = cnt ? tot / cnt : 0;
      return { rows, sum: { n: rows.length, avg: avg.toFixed(1), stars: stars(Math.round(avg)) } };
    },
    review: (repo, a: Who & { id: string }) => {
      const r = app.queries.review(repo, { id: a.id });
      const u = r && app.queries.user(repo, { id: r.userId });
      const b = u && branchesOf(repo, a).find((x) => x.id === u.branchId);
      if (!r || !b) return null;
      return { id: r.id, at: r.at, site: siteLong(b), nick: u.nickname || '匿名ユーザー', items: r.items.map((it) => ({ n: it.name, s: stars(it.star), tags: it.tags })) };
    },
  },

  actions: {
    /** お届け日の変更を申請（共通データの申請。運営Web・ドライバーにも届く） */
    requestDateChange: (repo, a: Who & { id: string; how: 'pick' | 'any'; first?: string; second?: string; reason: string }) => {
      refuseRo(a);
      const hit = deliveryOf(repo, a);
      if (!hit) throw new ApiError('お届けが見つかりません', 404);
      const { d, branches } = hit;
      const { open } = crInfo(repo, d, branches);
      /* E302・E303（サーバーの確認） */
      if (open) throw new ApiError('このお届けには申請中の変更があります。', 409);
      if (!canApply(d, today(), open)) throw new ApiError('このお届けは、お届け日の変更を申請できません。', 409);
      const cal = calFor(repo, d);
      fail(checkChangeRequest(a));
      const wants = a.how === 'pick' ? [a.first!, ...(a.second ? [a.second] : [])] : [];
      /* E304・E305（サーバーの確認：選べない日） */
      for (const w of wants) {
        const cell = cal.flat().find((x) => x.iso === w);
        if (!cell || cell.tip === '別の半分') throw new ApiError('ご希望の日は、同じご利用月の同じ半分からお選びください。', 400);
        if (cell.dis) throw new ApiError(`${md(w)}はお届けできない日です。`, 400);
      }
      /* 希望日なし（ESキッチンにおまかせ）は希望日が空のまま申請できる（受付簿 No.82）。共通データの申請（lib/domain）も空の希望日を受け付ける */
      const cr = domainDelivery.actions.requestDateChange(repo, { deliveryId: d.id, wishDates: wants.map((w) => w.replace(/-/g, '/')), reason: a.reason.trim(), accountId: a.branchId ?? a.corpId });
      const due = d.deadline ? md(d.deadline.replace(/\//g, '-')) : '';
      const to = wants.length ? `第一希望 ${md(wants[0])}${wants[1] ? `・第二希望 ${md(wants[1])}` : ''}` : '希望日なし';
      /* S200 */
      return { id: cr.id, msg: `変更申請 ${cr.id} を受け付けました（${md(d.dateIso)} → ${to}・処理期限 ${due}）。` };
    },

    /** 申請中の変更申請を取り下げる（版1.1・No.8.1。申請中だけ。拠点アカウントは法人アカウントの申請を取り下げられない：H2） */
    withdrawDateChange: (repo, a: Who & { id: string }) => {
      refuseRo(a);
      const c = crsOf(repo, branchesOf(repo, a)).find((x) => x.id === a.id);
      if (!c || c.status !== '申請中') throw new ApiError('取り下げられる申請ではありません。', 409);
      if (a.branchId && c.by && c.by !== a.branchId) throw new ApiError('法人アカウントが出した申請は、拠点アカウントでは取り下げられません。', 403);
      domainDelivery.actions.withdrawDateChange(repo, { id: c.id });
      /* S211 */
      return { msg: '申請を取り下げました。' };
    },

    /** 別の日のご提案を受ける（申請は承認になり、お届け日がご提案の日になる） */
    acceptProposal: (repo, a: Who & { id: string }) => {
      refuseRo(a);
      const c = crsOf(repo, branchesOf(repo, a)).find((x) => x.id === a.id);
      if (!c || c.status !== '別の日のご提案' || !c.proposal) throw new ApiError('ご返事できる申請ではありません。', 409);
      domainDelivery.actions.answerProposal(repo, { id: c.id, accept: true, accountId: a.branchId ?? a.corpId });
      /* S201 */
      return { msg: `${mdW(c.proposal.date)}で受けました（${c.id} は承認になります）。` };
    },

    /** 別の日のご提案をお断りする（ESキッチンが期限までに別の日を調整して連絡する） */
    declineProposal: (repo, a: Who & { id: string }) => {
      refuseRo(a);
      const c = crsOf(repo, branchesOf(repo, a)).find((x) => x.id === a.id);
      if (!c || c.status !== '別の日のご提案') throw new ApiError('ご返事できる申請ではありません。', 409);
      domainDelivery.actions.answerProposal(repo, { id: c.id, accept: false, accountId: a.branchId ?? a.corpId });
      /* S202 */
      return { msg: 'ご提案をお断りしました。ESキッチンが別の日を調整してご連絡します。' };
    },
  },
});

