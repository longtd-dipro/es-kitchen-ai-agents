import { methodOf, pricesAt, publicPricesOf, yenOf } from '@/lib/domain/snapshot';
import type { DocRepo } from '@/lib/ops/core/area';
import { today } from '@/lib/supplier/dates';
import type { ApplicationWithEdits, InfoEdits } from '@/lib/domain/areas/apply';
import { equipCtx } from '@/lib/domain/areas/apply';
import { effectiveStart, resumablePause } from '@/lib/domain/lifecycle';
import { addYm } from '@/lib/domain/menu';
import type {
  Account, Application, Branch, Carrier, ChildContract, Contract, Corp, Delivery, Invoice, Pause, Plan,
} from '@/lib/domain/types';
import { isOpenPause } from '@/lib/domain/types';
import { AP_ROUTES } from './constants';
import type { IntakeDraft } from './intake';
import type { ApproveField, ChangeApp, ChangeBranch, ChangeLine, ImpactLine, IntakeRow } from './types';
import { fmtDate } from '@/lib/format/date';
import { yen, yenSigned as signYen } from '@/lib/format/money';

/*
 * 共通データ（lib/domain・dm.apply.applications と dm.org・dm.master・dm.delivery・dm.billing）から、
 * 契約申請管理の画面の形（ChangeApp・IntakeRow）を作る。
 * 運営だけが持つもの（承認の前にする設定・締切後の承認の扱い・却下のメモ・代理入力の受付経路など）は
 * 運営の applications.state（申請ID ごと）にあり、OpsState として受け取る。
 * 変更の表・影響の表は、共通データから出せる分だけを出す（見本にあった細かい説明文は出さない）。
 */

/** 運営だけが持つ申請の状態（applications.state） */
export type OpsState = {
  id: string;
  /** 承認の前にする設定（拠点ID ごと） */
  set?: Record<string, Record<string, string | boolean>>;
  /** 締切後の承認の扱い（拠点ID ごと） */
  late?: Record<string, string>;
  /** 一覧の並び（代理入力は同じ申請日の先頭へ） */
  seq?: number;
  /** 新規申込：登録したばかり・受付経路・ES営業担当・却下した人と日時・メモ */
  fresh?: boolean;
  route?: string;
  es?: string;
  by?: string;
  memo?: string;
  /** 新規申込：受付画面の詳細情報設定の入力（保存したタブ・配送の設定・設備の異動の表など。共通データの項目に当たるものは申込の受付の中身へ入れる） */
  detail?: IntakeDraft;
};

const CLS: Record<string, string> = {
  プランの変更: 'blue', 法人情報の変更: 'teal', 配送の変更: 'ind', 設備の変更: 'pur', 拠点情報の変更: 'teal', 休止: 'amb', 再開: 'grn', 解約: 'red',
};
const EDIT_LABEL: Record<keyof InfoEdits, string> = {
  name: '拠点名', kana: 'フリガナ', zip: '郵便番号', pref: '都道府県', city: '市区町村', addr1: '町名・番地', addr2: '建物等',
  tel: '電話番号', fax: 'FAX番号', billTo: '請求先', allowGuest: 'ゲストモード',
};

/* ---------- 小さな道具 ---------- */
export const cycLabel = (ym: string) => (ym ? `${+ym.slice(0, 4)}年${+ym.slice(5, 7)}月サイクル` : '—');
const months = (from: string, to: string) => {
  const [a, b] = [from, to].map((x) => x.split('-').map(Number));
  return (b[0] - a[0]) * 12 + (b[1] - a[1]) + 1;
};
const prevCycle = (ym: string) => {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};
export const accountName = (r: DocRepo, id: string) => (id ? r.get<Account>('dm.account.accounts', id)?.name ?? id : '');
const planOf = (r: DocRepo, id?: string) => (id ? r.get<Plan>('dm.master.plans', id) : undefined);
/** プランの価格（コース × 配送方法）。cc の今のプランは子契約の世代、新しいプランは公開用の世代（台帳 E 2026-10-05） */
const priceOf = (p: Plan | undefined, course: string, cc?: ChildContract, same = false) =>
  yenOf((same && cc ? pricesAt(p, cc.cycleMonth, cc.priceGenId) : publicPricesOf(p)).find((x) => x.course === course), cc ? methodOf(cc) : undefined);
/** 法人の ES営業担当の名前 */
const salesRep = (r: DocRepo, corpId: string | null) => {
  const c = corpId ? r.get<Corp>('dm.org.corps', corpId) : undefined;
  return c ? accountName(r, c.salesRepId) : '';
};
/** 法人名を頭に付けた拠点名から、法人名を外す（大阪支店 など） */
const shortName = (name: string, company: string) => (company && name.startsWith(company + ' ') ? name.slice(company.length + 1) : name);

/** 拠点の契約まわり（親契約・その月の子契約） */
function contractOf(r: DocRepo, branchId: string, cycle: string) {
  const ct = r.list<Contract>('dm.org.contracts').find((c) => c.branchId === branchId);
  const ccs = r.list<ChildContract>('dm.org.childContracts').filter((c) => c.branchId === branchId && !c.canceled).sort((x, y) => x.cycleMonth.localeCompare(y.cycleMonth));
  const cc = ccs.filter((c) => !cycle || c.cycleMonth <= cycle).pop() ?? ccs[ccs.length - 1];
  return { ct, ccs, cc };
}
/** この拠点の、その月以降のまだ出荷していない配送 */
const openDeliveries = (r: DocRepo, branchId: string, from: string, to = '9999-99') =>
  r.list<Delivery>('dm.delivery.deliveries').filter((d) => d.branchId === branchId && d.cycleMonth >= from && d.cycleMonth <= to && ['予定', '出荷待'].includes(d.status));

/* ---------- 変更申請（CH） ---------- */

/** 開始の表示 */
function startText(a: Application) {
  if (a.kind === '法人情報の変更') return '承認後すぐ（未発行の請求書から）';
  if (a.kind === '解約' && a.change.lastCycle) return `最後のサイクル ${cycLabel(a.change.lastCycle).replace('サイクル', '')}`;
  return cycLabel(a.startCycle);
}

/** 拠点情報の変更・法人情報の変更：直す欄ごとの行（変更前は今のデータ） */
function editLines(r: DocRepo, a: ApplicationWithEdits, id: string): ChangeLine[] {
  const e = a.edits ?? {};
  const corp = a.kind === '法人情報の変更';
  const x = corp ? r.get<Corp>('dm.org.corps', id) : r.get<Branch>('dm.org.branches', id);
  const ct = r.list<Contract>('dm.org.contracts').find((c) => c.branchId === id);
  const cur = (k: keyof InfoEdits): string => {
    if (k === 'billTo') return ct?.billTo ?? '—';
    if (k === 'allowGuest') return '—';
    if (!x) return '—';
    if (k === 'name' || k === 'kana' || k === 'tel' || k === 'fax') return String((x as unknown as Record<string, string>)[k] ?? '—');
    return x.address[k] || '—';
  };
  const when = corp ? '承認と同時' : `${a.startCycle} サイクルから`;
  return (Object.keys(e) as (keyof InfoEdits)[]).map((k) => {
    const v = e[k];
    return [corp ? '法人' : '拠点', k === 'billTo' ? '請求' : '基本情報', EDIT_LABEL[k], cur(k), typeof v === 'boolean' ? (v ? '使う' : '使わない') : String(v), when];
  });
}

/** 申請の中身（[項目, 値]）を変更の行にする（共通データに直す欄がない種類） */
function requestLines(a: Application): ChangeLine[] {
  const screen = a.kind === '設備の変更' ? '拠点' : '子契約';
  /* 変更される項目には、お客様の入力の項目だけを出す（種類・開始月・受付・まとめの『申請内容』・理由は別の欄にある） */
  return a.request.filter(([k]) => !/理由|開始したいサイクル月|開始したいご利用月|反映|ご要望|ご事情|詳しく/.test(k) && !['変更したいこと', '申請内容', '受付'].includes(k))
    .map(([k, v]) => [screen, '申請の内容', k, '—', v, a.startCycle ? `${a.startCycle} 以降` : '承認と同時']);
}

/** プランの変更：変更前後の月額と、請求済みの月の差額 */
function planDiff(r: DocRepo, a: Application, branchId: string, cc?: ChildContract) {
  const np = planOf(r, a.change.planId), course = a.change.course ?? cc?.course ?? '';
  const cur = cc?.monthlyYen ?? 0;
  const next = np ? priceOf(np, course, cc, np.id === cc?.planId) + (cur - priceOf(planOf(r, cc?.planId), cc?.course ?? '', cc, true)) : cur;
  const rows = r.list<Invoice>('dm.billing.invoices')
    .filter((i) => i.status !== '取消' && i.cycleMonth >= a.startCycle && i.lines.some((l) => l.branchId === branchId && l.kind === '前払い'))
    .map((i): [string, string, string, string, string] => [cycLabel(i.cycleMonth), `${i.id}（${fmtDate(i.issuedOn)} 発行・請求済）`, yen(cur), yen(next), signYen(next - cur)]);
  return { np, course, cur, next, billed: rows.length ? { total: `${signYen((next - cur) * rows.length)}（税抜）`, rows } : undefined };
}

/** 種類ごとの、見出し・変更の行・影響の行・月額 */
function kindParts(r: DocRepo, a: ApplicationWithEdits, branchId: string): Pick<ChangeBranch, 'head' | 'changes' | 'impacts' | 'amount' | 'amtCls' | 'total' | 'billed'> {
  const { ct, ccs, cc } = contractOf(r, branchId, a.startCycle);
  const from = a.startCycle, when = from ? `${from} サイクルから` : '承認と同時';
  const st = ct?.status ?? '—';
  const ask = a.request.find(([k]) => k === '変更したいこと')?.[1] ?? a.request[0]?.[1] ?? a.kind;
  const nCc = (f: string, t = '9999-99') => ccs.filter((c) => c.cycleMonth >= f && c.cycleMonth <= t);
  if (a.kind === 'プランの変更') {
    const p = planDiff(r, a, branchId, cc), curName = planOf(r, cc?.planId)?.name ?? '—', d = p.next - p.cur;
    const list = nCc(from);
    return {
      head: `プラン ${curName}（${cc?.course ?? '—'}） → ${p.np?.name ?? '（内容は申請のとおり）'}（${p.course}）`,
      amount: d ? signYen(d) : '—', amtCls: d > 0 ? 'red' : d < 0 ? 'grn' : undefined, total: ['月額（税抜）', yen(p.cur), yen(p.next)], billed: p.billed,
      changes: [
        ['子契約', '契約', 'プランID', `${cc?.planId ?? '—'} ${curName}`, `${a.change.planId ?? '—'} ${p.np?.name ?? ''}`, `${from} 以降`],
        ['子契約', '契約', 'メニュー種別（コース）', cc?.course ?? '—', p.course, `${from} 以降`],
        ['子契約', '料金・請求', '月額（税抜）', yen(p.cur), yen(p.next), `${from} 以降`],
      ],
      impacts: [
        ['子契約の書き換え', `${list.length}件（${list.map((c) => c.cycleMonth).join('・') || '—'}）`, '承認と同時'],
        ['納品予定・注文', `${openDeliveries(r, branchId, from).length}件（1回の食数＝月次提供上限 ÷ 配送回数。デフォルトの注文は作り直し、上限を超える登録済の注文はデフォルトに戻して法人へ再注文のお願い）`, '承認と同時'],
        ['設備の異動', '「影響と設定」の設備の異動の案のとおり（承認の前に直せる）', '承認と同時'],
      ],
    };
  }
  if (a.kind === '休止') {
    const f = a.change.fromCycle ?? from, t = a.change.toCycle ?? f, n = months(f, t), keep = !!a.change.keepEquipment;
    return {
      head: `${cycLabel(f)}から ${n}サイクル休止（設備は${keep ? '置いたまま' : '引き揚げ'}）`,
      amount: cc ? signYen(-cc.monthlyYen) : '—', amtCls: 'grn',
      changes: [
        ['親契約', '契約', '契約ステータス', st, `利用休止（${f}〜${t}）`, `${f} サイクルから`],
        ['親契約', '契約', '再開予定月', '—', cycLabel(a.change.resumeCycle ?? ''), '承認と同時'],
        ['拠点', '設備・オプション', '休止中の設備', '—', keep ? '置いたまま' : '引き揚げる', '承認と同時'],
      ],
      impacts: [
        ['休止の登録', `${f}〜${t}（${n}サイクル）`, '承認と同時'],
        ['休止期間の納品予定', `${openDeliveries(r, branchId, f, t).length}件を取消（締切を過ぎたサイクルはお届けする。子契約は「取消」として残す）`, '承認と同時'],
      ],
    };
  }
  if (a.kind === '再開') {
    const res = a.change.resumeCycle ?? from;
    const tg = ct ? resumablePause(r, ct.id) : undefined;
    if (tg?.state === '休止予定') {
      /* 休止予定の取消（台帳 運営A 2026-10-06 Q14＝B）：再開予定月＝休止の開始月・休止期間0か月・注文は戻さない */
      const f = tg.pause.fromCycle;
      return {
        head: `休止予定（${cycLabel(f)}〜${isOpenPause(tg.pause) ? '未定' : cycLabel(tg.pause.toCycle)}）を取り消す（休止期間0か月）`, amount: cc ? signYen(cc.monthlyYen) : '—', amtCls: 'red',
        changes: [['親契約', '契約', '契約ステータス', st, '有効のまま（休止は始まりません）', '承認と同時']],
        impacts: [
          ['休止の履歴', `『取消した休止（0か月）』を残す（再開予定月＝休止の開始月 ${cycLabel(f)}・通算1年には入れない）`, '承認と同時'],
          ['子契約・納品予定', '取消にした子契約を未確定に戻し、納品予定を作り直す', '承認と同時'],
          ['注文', '戻りません（お客様がもう一度入れる）', '—'],
        ],
      };
    }
    return {
      head: `${cycLabel(res)}から再開`, amount: cc ? signYen(cc.monthlyYen) : '—', amtCls: 'red',
      changes: [['親契約', '契約', '契約ステータス', st, '有効', `${res} サイクルから`]],
      impacts: [['休止の再開月', cycLabel(res), '承認と同時'], ['納品予定', '再開サイクルから作り直す', '—']],
    };
  }
  if (a.kind === '解約') {
    const last = a.change.lastCycle ?? (from ? prevCycle(from) : '');
    return {
      head: `${cycLabel(last)}の最終日で解約`,
      changes: [
        ['親契約', '契約', '契約ステータス', st, '解約手続き中（承認と同時）→ 終了（解約日に）', '承認と同時／解約日'],
        ['親契約', '契約', '契約終了日', '—', `${cycLabel(last)}の最終日`, '承認と同時'],
      ],
      impacts: [
        ['親契約', '解約手続き中にする', '承認と同時'],
        ['解約のあとの納品予定', `${last ? openDeliveries(r, branchId, last).filter((d) => d.cycleMonth > last).length : 0}件を取消（委託配送先へ通知）`, '承認と同時'],
        ['設備・違約金', '貸出を「回収予定」にする（回収の配送は作らない）。違約金＝回収額 × 残り月数 ÷ 最低利用期間（設備ごと）', '承認と同時'],
        ['アカウント', '参照のみ → 最後の請求書の入金期限のあと利用停止', '承認と同時'],
      ],
    };
  }
  if (a.edits) {
    const lines = editLines(r, a, branchId);
    return {
      head: `${lines.map((l) => l[2]).join('・') || ask} の変更`, changes: lines,
      impacts: a.kind === '法人情報の変更'
        ? [['法人の基本情報', `${lines.length}項目`, '承認と同時'], ['請求書の宛先', '未発行の請求書から新しい内容（発行済みはそのまま）', '承認と同時']]
        : [['拠点の基本情報', `${lines.length}項目`, '承認と同時'], ['子契約', `${nCc(from).length}件（${from} 以降）`, '—']],
    };
  }
  if (a.kind === '設備の変更') {
    return {
      head: ask, changes: requestLines(a),
      impacts: [
        ['設備の異動（貸出）', '「影響と設定」の設備の異動の案のとおり（入替・回収＝回収予定、入替・追加＝貸出中。承認の前に直せる）', '承認と同時'],
        ['子契約の費用', `${nCc(from).length}件（${from} 以降。単発＝最初の未確定の子契約・月額＝未確定の子契約。確定・請求済の月は調整明細）`, '承認と同時'],
      ],
    };
  }
  return {
    head: ask, changes: requestLines(a),
    impacts: a.kind === '法人情報の変更' || a.kind === '拠点情報の変更'
      ? [['申請の内容', '承認のあと運営が画面で直す', '承認後']]
      : [['子契約', `${nCc(from).length}件（${from} 以降）・承認のあと運営が子契約で直す`, '承認後'], ['納品予定', `${openDeliveries(r, branchId, from).length}件`, '—']],
  };
}

/** 申請の中の1拠点（法人情報の変更は法人1件） */
function branchFor(r: DocRepo, a: ApplicationWithEdits, row: Application['results'][number], s: OpsState | undefined): ChangeBranch {
  const corp = a.kind === '法人情報の変更';
  const b = corp ? undefined : r.get<Branch>('dm.org.branches', row.branchId);
  const { ct, cc } = contractOf(r, row.branchId, a.startCycle);
  const chs = cc?.channels ?? [];
  const carriers = chs.map((c) => r.get<Carrier>('dm.master.carriers', c.carrierId)).filter(Boolean) as Carrier[];
  const pauses = ct ? r.list<Pause>('dm.org.pauses').filter((p) => p.contractId === ct.id && p.id !== a.id) : [];
  const last = a.change.lastCycle;
  return {
    name: corp ? `${r.get<Corp>('dm.org.corps', row.branchId)?.name ?? a.companyName}（法人）` : b?.name ?? row.branchId,
    ids: corp ? row.branchId : `${row.branchId} ／ ${ct?.id ?? '—'}`,
    ...kindParts(r, a, row.branchId),
    warn: [],
    vm: cc?.course === 'ESライト（自販機）',
    migrate: a.kind === 'プランの変更' && !corp ? equipCtx(r, a, row.branchId).migrate : undefined,
    toVm: a.kind === 'プランの変更' && a.change.course === 'ESライト（自販機）' && cc?.course !== 'ESライト（自販機）' || undefined,
    vmStarts: a.kind === 'プランの変更' && a.change.course === 'ESライト（自販機）' && cc?.course !== 'ESライト（自販機）'
      ? ((s0) => [0, 1, 2, 3].map((n) => addYm(s0, n)))(effectiveStart(r, addYm(today().slice(0, 7).replace('/', '-'), 1))) : undefined,
    ship: [...new Set(chs.map((c) => c.serviceForm))].join('・') || undefined,
    carrier: carriers.map((c) => (c.kind === '自社' ? '自社便' : c.name)).join('・') || undefined,
    pause: a.kind === '休止' && a.change.fromCycle && a.change.toCycle
      ? { hist: pauses.map((p) => (isOpenPause(p) ? [`${cycLabel(p.fromCycle)}〜未定（移行）`, 0] : p.voided ? [`取消した休止（${cycLabel(p.fromCycle)}・0か月・通算に入れない・${p.applicationNo}）`, 0] : [`${cycLabel(p.fromCycle)}〜${cycLabel(p.toCycle)}（${p.applicationNo}）`, months(p.fromCycle, p.toCycle)]) as [string, number]), cur: months(a.change.fromCycle, a.change.toCycle), resume: a.change.resumeCycle ? cycLabel(a.change.resumeCycle) : '' }
      : undefined,
    cxlLast: a.kind === '解約' && last ? +last.slice(0, 4) * 12 + +last.slice(5, 7) : undefined,
    res: { st: row.result, why: row.reason, by: accountName(r, row.by), late: s?.late?.[row.branchId] },
    set: s?.set?.[row.branchId] ?? {},
  };
}

/** 承認ダイアログで入れる欄（種類ごと） */
function approveFields(a: Application): ApproveField[] | undefined {
  if (a.kind === 'プランの変更') return [{ key: 'scope', label: '適用範囲（子契約の保存と同じ）', opts: [`この子契約以降すべて（${a.startCycle} 以降）`, `この子契約だけ（${a.startCycle} のみ）`] }];
  if (a.kind === '解約') return [{ key: 'pen', check: '違約金（設備ごとに判定して合算）を確認しました' }];
  return undefined;
}

/** 一覧の検索「受付経路」の値（台帳 運営A Q15）。代理入力は選んだ経路（一覧にない値はその他）、CSV の一括取込は CSV取込 */
function channelOf(a: Application, s?: OpsState): string {
  if (!a.proxy) return a.requestedBy.site === 'public' ? 'ログインなしの申込' : '法人Web';
  if (/^CSV/.test(a.request.find((x) => x[0] === '受付')?.[1] ?? '')) return 'CSV取込';
  const r = s?.route ?? /代理入力：([^）]+)）/.exec(a.requestedBy.name)?.[1] ?? '';
  return AP_ROUTES.includes(r) && r !== '法人Web' && r !== 'ログインなしの申込' && r !== 'CSV取込' ? r : 'その他';
}

/** 変更申請（共通データ）→ 契約申請管理の ChangeApp */
export function changeFor(r: DocRepo, a: Application, s?: OpsState): ChangeApp {
  const decided = a.results.length > 0 && a.results.every((x) => x.result !== '');
  const lastAt = a.results.map((x) => x.at).sort().pop() ?? '';
  return {
    id: a.id, no: a.id, kind: a.kind as ChangeApp['kind'], cls: CLS[a.kind] ?? 'blue',
    date: a.requestedAt.slice(0, 10), applicant: a.requestedBy.name, company: a.companyName, companyId: a.corpId ?? a.branchIds[0] ?? '',
    close: a.orderCloseOn || '—', start: startText(a), request: a.request,
    branches: a.results.map((row) => branchFor(r, a, row, s)),
    approveFields: approveFields(a),
    memo: a.proxy ? ['運営の代理入力で登録した申請（28-144）。法人Webからの申請と同じ手順で承認する。'] : [],
    /* すべての拠点を処理して、日をまたいだら履歴（見るだけ） */
    done: decided && lastAt.slice(0, 10) < today(),
    proxy: a.proxy || undefined, channel: channelOf(a, s), startYm: a.startCycle || undefined, seq: s?.seq ?? 0,
    es: salesRep(r, a.corpId),
  };
}

/* ---------- 新規申込（AP） ---------- */

const reqOf = (a: Application, k: string) => a.request.find((x) => x[0] === k)?.[1] ?? '';

/** 申込の「プラン」の値（ES000003 50プラン（ESライト）・複数（4拠点））をプランとコースに分ける */
function splitPlan(v: string) {
  const m = v.match(/^(ES\d+\s*\S+?プラン)（(.+)）$/);
  if (m) return { plan: m[1].replace(/\s+/g, ' '), course: m[2] };
  return { plan: v || '—', course: /複数/.test(v) ? '複数' : '—' };
}
/** 申込の「配送」の値（ES配送便・月2回）を配送区分と回数に分ける */
function splitShip(v: string, multi: boolean) {
  const parts = v.split('・').filter(Boolean);
  const ship = parts.filter((x) => /便$/.test(x)).join('・') || '—';
  const cnt = parts.filter((x) => !/便$/.test(x)).join('・') || (multi ? '拠点ごと' : '—');
  return { ship, cnt };
}
/** 法人アカウントの状態 → 一覧の「アカウント」 */
function acctOf(r: DocRepo, corpId: string | null) {
  const s = corpId ? r.get<Account>('dm.account.accounts', corpId)?.status : undefined;
  return s === '有効' ? 'ログイン済' : s === '発行済（ログイン前）' ? '発行済' : s && s !== '未発行' ? s : '未発行';
}

/** 新規申込（共通データ）→ 新規契約タブの行 */
export function intakeFor(r: DocRepo, a: Application, s?: OpsState): IntakeRow {
  const names = [...a.branchIds.map((id) => r.get<Branch>('dm.org.branches', id)?.name ?? id), ...a.branchNames].map((n) => shortName(n, a.companyName));
  const { plan, course } = splitPlan(reqOf(a, 'プラン'));
  const { ship, cnt } = splitShip(reqOf(a, '配送'), names.length > 1);
  const cc = a.branchIds.length === 1 ? contractOf(r, a.branchIds[0], a.startCycle).cc : undefined;
  const slots = cc?.channels.reduce((n, c) => n + c.slots.length, 0) ?? 0;
  const ended = a.status === '却下' || a.status === '取り下げ済';
  return {
    id: a.id, no: a.id, kubun: (a.kubun || '本導入') as IntakeRow['kubun'], company: a.companyName, branch: names.join('・'),
    plan, course, eq: /自販機/.test(course) ? '自販機' : course === '複数' ? '拠点ごと' : '冷蔵庫', ship,
    cnt: cnt === '—' && slots ? `月${slots}回` : cnt, acct: acctOf(r, a.corpId), es: s?.es ?? salesRep(r, a.corpId),
    st: a.status as IntakeRow['st'], date: a.requestedAt.slice(0, 10),
    go: ended ? -1 : a.kubun === 'お試し' ? 1 : a.kubun === '切替' ? 2 : 0,
    route: s?.route ?? (a.proxy ? a.requestedBy.name : undefined), channel: channelOf(a, s), startYm: a.startCycle || undefined,
    by: a.status === '取り下げ済' ? s?.by ?? 'お客様が取り下げ' : s?.by,
    reason: ended ? a.reason : undefined, memo: s?.memo, fresh: s?.fresh,
  };
}
