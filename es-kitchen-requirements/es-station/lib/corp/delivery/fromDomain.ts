import type { DocRepo } from '@/lib/ops/core/area';
import { corpTerm } from '@/lib/domain/terms';
import { today } from '@/lib/supplier/dates';
import type {
  Branch as DBranch, ChangeRequest as DCr, Contact, Contract, Corp, Cycle, Delivery, DeliveryLine, DeliveryReport, Product, Tracking, Trouble,
  Announcement, Carrier, Warehouse,
} from '@/lib/domain/types';
import { altLabel, excludedFor } from '@/lib/domain/alt';
import { shownName } from '@/lib/domain/snapshot';
import { trackingUrlOf } from '@/lib/domain/tracking';
import { addDaysIso, md, mdW, mm, wdOf } from './logic';
import type { CorpCr, CorpDelivery, CorpEvent, CorpNews, CorpTodo, CrStatus, Tone } from './types';
import { yen } from '@/lib/format/money';

/*
 * 共通データ（lib/domain・dm.*）から、法人Web の画面の形（CorpEvent・CorpDelivery・CorpCr・お知らせ）を作る。
 * 法人には倉庫・出荷日・運び手・ドライバー・運営のメモを見せない。
 */

const iso = (d: string) => d.replace(/\//g, '-');
const slash = (d: string) => d.replace(/-/g, '/');

/** 画面の拠点（運営の Branch と同じ使い方：name・corpName・status・form の担当者の表） */
export type BranchLike = { id: string; name: string; corpId: string; corpName: string; status: string; form: Record<string, unknown> };

export function branchLike(r: DocRepo, b: DBranch): BranchLike {
  const corp = b.corpId ? r.get<Corp>('dm.org.corps', b.corpId) : undefined;
  const ct = r.list<Contract>('dm.org.contracts').find((c) => c.branchId === b.id);
  const contacts = r.list<Contact>('dm.org.contacts').filter((c) => c.owner.type === 'branch' && c.owner.id === b.id);
  return {
    id: b.id, name: b.name, corpId: b.corpId ?? '', corpName: corp?.name ?? '',
    status: ct?.status === '利用休止' ? '休止中' : b.status,
    form: { '#担当者（テーブル）': contacts.map((c) => [c.kind, c.name, c.kana, c.email, c.tel]) },
  };
}

/** 見られる拠点（法人アカウント＝自社のすべての拠点、拠点アカウント＝その拠点だけ） */
export const branchesFor = (r: DocRepo, a: { corpId: string; branchId?: string }) =>
  r.list<DBranch>('dm.org.branches').filter((b) => b.corpId === a.corpId && (!a.branchId || b.id === a.branchId)).map((b) => branchLike(r, b));

/* ---------- 状態の言い方 ---------- */

const ST: Record<Delivery['status'], [string, Tone]> = {
  予定: ['予定', 'info'], 出荷待: ['出荷待', 'info'], 出荷済: ['配送中', 'info'], 受取済: ['配送中', 'info'], 納品済: ['お届け済', 'success'],
  一部納品済: ['一部お届け済', 'warning'], 再配達待: ['再配送準備中', 'warning'], 確認中: ['配送状況を確認中です', 'warning'], 中止: ['お届け中止', 'negative'], 取消: ['取消', 'neutral'],
};
const openTrouble = (r: DocRepo, id: string) => r.list<Trouble>('dm.delivery.troubles').some((t) => t.deliveryId === id && !t.resolution);
const cycleLabel = (m: string) => (m ? `${+m.slice(5, 7)}月分` : '資材');

/** カレンダーのお届け */
export function eventsFor(r: DocRepo, branchIds: string[]): CorpEvent[] {
  return r.list<Delivery>('dm.delivery.deliveries').filter((d) => branchIds.includes(d.branchId) && d.status !== '取消').map((d) => {
    const [st, tone] = ST[d.status];
    return {
      id: d.id, d: iso(d.deliverOn), site: d.branchId, t: d.temp, st, tone,
      note: d.temp === '資材' ? '' : `${d.deliveredQty ?? d.plannedQty}食`, rec: d.id, plan: d.status === '予定',
      chk: openTrouble(r, d.id) || undefined,
      moved: d.changeState === '調整済' ? 'お届け日の変更でこの日になりました' : undefined,
    };
  });
}

/**
 * 納品書の発行元＝会社マスタ（共通データ dm.master.warehouses の返品・本社「ESキッチン…」の名前・住所・電話。旧・月ごとの納品書と同じ元）。
 * なければ undefined（納品書は見本の値を使う）
 */
function issuerOf(r: DocRepo): CorpDelivery['issuer'] {
  const es = r.list<Warehouse>('dm.master.warehouses').find((w) => w.type === 'return' && w.name.startsWith('ESキッチン'));
  if (!es) return undefined;
  const a = es.address;
  const address = [a.zip ? `〒${a.zip}` : '', `${a.pref}${a.city}${a.addr1}${a.addr2}`].filter(Boolean).join(' ');
  return { name: es.name, address, tel: es.tel };
}

/** お届けの状況が空のとき（お届け完了の前）の見出しと説明。状態に合わせる（お届け中止に「お届け日に表示されます」は出さない） */
function noResultOf(st: Delivery['status'], mdText: string, parcel: boolean): { noResultTitle: string; noResultText: string } {
  switch (st) {
    case '中止': return { noResultTitle: 'お届けしません', noResultText: 'このお届けは中止になりました。ご不明な点はESキッチンへお問い合わせください。' };
    case '確認中': return { noResultTitle: 'お届けの状況を確認しています', noResultText: '確認が済みしだい、ESキッチンからご連絡します。' };
    case '再配達待': return { noResultTitle: 'まだお届けしていません', noResultText: 'ESキッチンが再配送の日を調整しています。決まりしだいご連絡します。' };
    case '出荷済': case '受取済': return { noResultTitle: 'まだお届けしていません', noResultText: parcel ? 'お届けが完了すると表示されます。' : `お届け日（${mdText}）に、担当者の報告で表示されます。` };
    default: return { noResultTitle: 'まだお届けしていません', noResultText: `お届け日（${mdText}）に、担当者の報告で表示されます。` };
  }
}

/** お届け詳細 */
export function deliveryFor(r: DocRepo, d: Delivery): CorpDelivery {
  const [st, tone] = ST[d.status];
  const cyc = r.get<Cycle>('dm.delivery.cycles', d.cycleMonth);
  const lines = r.list<DeliveryLine>('dm.delivery.lines').filter((l) => l.deliveryId === d.id);
  const rep = r.get<DeliveryReport>('dm.report.deliveryReports', d.id);
  const tracking = r.list<Tracking>('dm.delivery.tracking').filter((t) => t.deliveryId === d.id && t.status === 'active');
  const done = d.deliveredQty !== null;
  const plan = d.status === '予定';
  const short = done ? d.plannedQty - (d.deliveredQty ?? 0) : 0;
  const trouble = openTrouble(r, d.id);
  const pname = (id: string) => r.get<Product>('dm.master.products', id)?.name ?? id;
  const pen = (id: string) => r.get<Product>('dm.master.products', id)?.nameEn?.trim() || undefined; /* 商品名（英語）：受付簿 #280 */
  const main = r.list<Contact>('dm.org.contacts').find((c) => c.owner.type === 'branch' && c.owner.id === d.branchId && c.kind === 'メイン担当者');
  /* 申請で選べる日：同じサイクルの同じ半分（A・B／C・D）。選べない日（休日・曜日）はモーダルのカレンダー（corp-delivery の cal）で出す */
  let window: CorpDelivery['window'];
  let cycleRange: CorpDelivery['cycleRange'];
  if (plan && cyc) {
    const firstHalf = d.slot[0] <= 'B';
    const from = firstHalf ? iso(cyc.a1) : addDaysIso(iso(cyc.a1), 14);
    window = { from, to: addDaysIso(from, 13), label: firstHalf ? 'ご利用月の前半（第1・第2週）' : 'ご利用月の後半（第3・第4週）', note: '同じご利用月の同じ半分の中で選べます。前半と後半をまたぐ日はESキッチンにご相談ください。' };
    cycleRange = { from: iso(cyc.a1), to: iso(cyc.d7) };
  }
  /* 取消した便は法人には見せない（「取消」を名前のまま出さない） */
  const related = r.list<Delivery>('dm.delivery.deliveries').filter((x) => (x.parentId === d.id || x.id === d.parentId) && x.status !== '取消')
    .map((x) => ({ id: x.id, text: `${mdW(iso(x.deliverOn))} ${x.parentId === d.id ? `残り ${x.plannedQty}食の再配送` : '元のお届け'}`, st: ST[x.status][0], tone: ST[x.status][1], date: iso(x.deliverOn), child: x.parentId === d.id, qty: x.plannedQty }));
  const msg: CorpDelivery['msg'] = trouble ? { tone: 'warning', title: '配送状況を確認しています', text: 'このお届けで確認が必要なことがありました。ESキッチンからご連絡します。' }
    : short > 0 ? { tone: 'warning', title: `${short}食が足りませんでした`, text: related.some((x) => x.child) ? `残りの${related.filter((x) => x.child).reduce((n, x) => n + (x.qty ?? 0), 0)}食は、${related.filter((x) => x.child).map((x) => mdW(x.date)).join('・')} に再配送でお届けします。` : 'ESキッチンからご連絡します。' }
    : undefined;
  const corp = r.get<Corp>('dm.org.corps', r.get<DBranch>('dm.org.branches', d.branchId)?.corpId ?? '');
  const ad = d.destination.address;
  return {
    id: d.id, site: d.branchId, cycle: cycleLabel(d.cycleMonth), st, tone, dateIso: iso(d.deliverOn), plan,
    deadline: plan && cyc ? cyc.orderCloseOn : undefined, window, cycleRange,
    svc: corpTerm(d.serviceForm), temp: d.temp, kindText: `${d.temp} ・ ${corpTerm(d.serviceForm)}${d.serviceForm === 'ES配送便' ? '（陳列まで）' : ''}`,
    /* 納品書（PDF）：確定（出荷待）以降の便。予定の便・資材便には出さない（版1.1・CW_DLV No.17） */
    canPdf: !plan && d.status !== '取消' && d.temp !== '資材', msg,
    corpName: corp?.name ?? '', address: `${ad.zip ? `〒${ad.zip} ` : ''}${ad.pref}${ad.city}${ad.addr1}${ad.addr2}`,
    parentId: d.parentId || undefined, short: short > 0 ? short : undefined,
    itemsTitle: done ? 'お届けした商品' : 'お届けする商品',
    /* 代替品の行は備考に「代替品（元：〇〇）」、届けない不良商品（除外）は「納品分に含まれません」（納品書も同じ行） */
    items: [...lines.map((l) => {
      const diff = l.deliveredQty === null ? '' : String(l.deliveredQty - l.plannedQty).replace('-', '−');
      const lineShort = l.deliveredQty !== null && l.deliveredQty < l.plannedQty ? l.plannedQty - l.deliveredQty : undefined;
      const altFrom = l.kind === '差替' || l.kind === '補償' ? pname(l.substitutedFrom ?? '') : undefined;
      /* 納品した明細は納品したときの商品名（変わっていれば「旧名（現：新名）」） */
      return { n: shownName(l.productName, pname(l.productId)), nEn: pen(l.productId), o: `${l.plannedQty}個`, f: l.deliveredQty === null ? '—' : `${l.deliveredQty}個`, diff, dCls: lineShort ? 'ua' : '', note: altLabel(l, pname), oq: l.plannedQty, fq: l.deliveredQty, altFrom, short: lineShort };
    }), ...excludedFor(r, d).map((l) => ({ n: pname(l.productId), nEn: pen(l.productId), o: '0個', f: '—', diff: '', dCls: '', note: `${altLabel(l, pname)}（${l.qty}個）`, oq: 0, fq: null }))],
    /* 予定（ご注文・変更の締切の前）は商品・数量を出さない（#56）。資材便は表の代わりに案内（宿題 D3） */
    noItemsText: d.temp === '資材' ? '資材のお届けです（中身は資材のご注文をご覧ください）' : plan ? 'ご注文・変更の締切の後に表示されます。' : undefined,
    doneAt: done ? `${iso(d.deliveredAt.slice(0, 10))}（${wdOf(iso(d.deliveredAt.slice(0, 10)))}）${d.deliveredAt.slice(11)}` : undefined,
    receiver: done && d.regime !== 'parcel_carrier' ? main?.name : undefined,
    collected: rep?.cash && rep.cash.collectedYen > 0 ? yen(rep.cash.collectedYen) : undefined,
    ...(done ? {} : noResultOf(d.status, md(iso(d.deliverOn)), d.regime === 'parcel_carrier')),
    issuer: issuerOf(r),
    track: tracking.map((t) => {
      /* 追跡ページ（ヤマトは番号をクエリに入れた URL。課題 0-2） */
      const c = r.get<Carrier>('dm.master.carriers', t.carrierId);
      return { no: t.trackingNo, box: `箱 ${t.boxNo}/${t.boxTotal}`, url: trackingUrlOf(c, t.trackingNo), carrier: c?.name ?? '' };
    }),
    noTrackText: tracking.length ? undefined : d.regime === 'parcel_carrier' ? '出荷すると送り状番号が表示されます。' : 'ES配送便は送り状番号がありません。',
    noApplyText: done ? 'お届け済みのため、変更は申請できません。' : !plan ? '確定したお届けのため、日付の変更は申請できません。' : undefined,
    related,
  };
}

/** お届け日の変更申請（法人Web の形） */
export function crFor(r: DocRepo, c: DCr): CorpCr & { status: CrStatus } {
  const d = r.get<Delivery>('dm.delivery.deliveries', c.deliveryId);
  const cyc = d && r.get<Cycle>('dm.delivery.cycles', d.cycleMonth);
  const status: CrStatus = c.declinedAt && c.status === '申請中' ? 'お断り済（ESキッチンで調整中）' : c.status;
  const reply = c.status === '承認' ? `${mdW(iso(d?.deliverOn ?? c.currentDate))}に変更しました`
    : c.status === '否認' ? c.decisionReason
    : c.status === '別の日のご提案' ? `${mdW(iso(c.proposedDate))}はいかがでしょうか`
    : c.status === '取り下げ' ? '取り下げました' : '';
  return {
    id: c.id, site: c.branchId, delivery: c.deliveryId, at: c.requestedAt.slice(0, 10), cur: iso(c.currentDate), wants: c.wishDates.map(iso), reason: c.reason,
    st: status, status, reply, due: c.decidedAt ? `${mm(iso(c.decidedAt.slice(0, 10)))} 処理` : cyc ? `処理期限 ${md(iso(cyc.orderCloseOn))}` : '',
    limit: cyc ? iso(cyc.orderCloseOn) : undefined, by: c.requestedBy.accountId,
    /* ご提案は、お断りしたあと（お断り済・ESキッチンで調整中）も枠に出す（#58・#62・宿題 D2） */
    proposal: (c.status === '別の日のご提案' || status === 'お断り済（ESキッチンで調整中）') && c.proposedDate
      ? { date: iso(c.proposedDate), note: c.decisionReason, msg: `${mdW(iso(c.proposedDate))}でいかがでしょうか`, deadline: cyc ? slash(cyc.orderCloseOn) : '' } : undefined,
    declinedAt: c.declinedAt, approved: c.status === '承認' && d ? iso(d.deliverOn) : undefined,
  };
}

/** お知らせ（法人Web 向け） */
export const newsFor = (r: DocRepo): CorpNews[] =>
  r.list<Announcement>('dm.notice.announcements').filter((a) => a.sites.includes('corp') && a.publishFrom <= today()).map((a) => ({
    id: a.id, at: `${a.publishFrom} 09:00`, cat: a.category, title: a.title, important: a.important,
    blocks: a.body.split('\n').filter(Boolean).map((p) => ({ p })), att: a.files.length ? a.files : undefined, detail: true,
  }));

/**
 * 確認が必要なお届け（ホームの「ご確認ください」の行。決定 #58 の4種類・この順）：
 *   ① 別の日のご提案（ご返事が必要） ② 届かなかった・遅れたお届け（一部お届け済み／再配送準備中／お届け中止・配送状況を確認中）
 *   ③ 申請の結果（承認・否認になってから14日間） ④ 申請できる予定（締切の3週間前から締切まで・まだ申請していないもの）
 */
export function todosFor(r: DocRepo, branchIds: string[]): CorpTodo[] {
  const out: CorpTodo[] = [];
  const t = iso(today());
  const crs = r.list<DCr>('dm.delivery.changeRequests').filter((x) => branchIds.includes(x.branchId));
  const dlv = (id: string) => r.get<Delivery>('dm.delivery.deliveries', id);
  /* ① 別の日のご提案 */
  for (const c of crs.filter((x) => x.status === '別の日のご提案')) {
    out.push({ id: `todo-${c.id}`, site: c.branchId, at: mm(iso(c.decidedAt.slice(0, 10) || today())), category: 'ご返事', tone: 'warning', note: '別の日のご提案',
      title: `${md(iso(c.currentDate))} のお届け：${md(iso(c.proposedDate))} のご提案にご返事ください`, link: c.deliveryId, crOpen: c.id });
  }
  /* ② 届かなかった・遅れたお届け（状態）と、配送状況を確認中（未解決のトラブル） */
  const SHORT_OF: Partial<Record<Delivery['status'], [string, string]>> = {
    一部納品済: ['一部お届け', '一部のお届けになりました'], 再配達待: ['再配送準備', '再配送を準備しています'], 中止: ['お届け中止', 'お届けを中止しました'],
  };
  const checking = new Set<string>();
  for (const tr of r.list<Trouble>('dm.delivery.troubles').filter((x) => !x.resolution)) {
    const d = dlv(tr.deliveryId);
    if (!d || !branchIds.includes(d.branchId) || checking.has(d.id)) continue;
    checking.add(d.id);
    out.push({ id: `todo-${tr.id}`, site: d.branchId, at: mm(iso(tr.reportedAt.slice(0, 10))), category: '配送', tone: 'warning', note: '確認中',
      title: `${md(iso(d.deliverOn))} のお届け：配送状況を確認しています`, link: d.id });
  }
  for (const d of r.list<Delivery>('dm.delivery.deliveries').filter((x) => branchIds.includes(x.branchId) && !checking.has(x.id) && SHORT_OF[x.status])) {
    const [note, text] = SHORT_OF[d.status]!;
    out.push({ id: `todo-st-${d.id}`, site: d.branchId, at: mm(iso(d.deliverOn)), category: '配送', tone: 'warning', note,
      title: `${md(iso(d.deliverOn))} のお届け：${text}`, link: d.id });
  }
  /* ③ 申請の結果（承認・否認から14日間） */
  for (const c of crs.filter((x) => (x.status === '承認' || x.status === '否認') && x.decidedAt)) {
    const dAt = iso(c.decidedAt.slice(0, 10));
    if (t < dAt || t > addDaysIso(dAt, 14)) continue;
    const d = dlv(c.deliveryId);
    out.push({ id: `todo-${c.id}`, site: c.branchId, at: mm(dAt), category: '申請', tone: c.status === '承認' ? 'success' : 'negative', note: c.status,
      title: `${md(iso(d?.deliverOn ?? c.currentDate))} のお届け：変更申請 ${c.id} は${c.status}になりました`, link: c.deliveryId });
  }
  /* ④ 申請できる予定（翌月以降の予定・締切の3週間前から締切まで・まだ決まっていない申請がない） */
  const openCr = new Set(crs.filter((x) => x.status === '申請中' || x.status === '別の日のご提案').map((x) => x.deliveryId));
  for (const d of r.list<Delivery>('dm.delivery.deliveries').filter((x) => branchIds.includes(x.branchId) && x.status === '予定' && !openCr.has(x.id))) {
    const cyc = r.get<Cycle>('dm.delivery.cycles', d.cycleMonth);
    if (!cyc) continue;
    const close = iso(cyc.orderCloseOn);
    if (t < addDaysIso(close, -21) || t > close || d.cycleMonth <= t.slice(0, 7)) continue;
    out.push({ id: `todo-plan-${d.id}`, site: d.branchId, at: mm(iso(d.deliverOn)), category: '予定', tone: 'info', note: `締切 ${md(close)}`,
      title: `${md(iso(d.deliverOn))} のお届け：お届け日の変更を申請できます（締切 ${md(close)}）`, link: d.id, applyOf: d.id, applyYm: iso(d.deliverOn).slice(0, 7) });
  }
  return out;
}
