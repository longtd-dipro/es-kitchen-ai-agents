import { ApiError } from '@/lib/api/errors';
import type { DocRepo } from '@/lib/ops/core/area';
import { today } from '@/lib/supplier/dates';
import type { InfoEdits } from '@/lib/domain/areas/apply';
import type { Application, Branch, Contract, Corp, Course, EquipProposal, EquipRow, Loan, Model, Plan } from '@/lib/domain/types';
import { PC_KINDS, type PcForm } from './logic';
import { resumableBranches } from '@/lib/domain/lifecycle';
import { chErrors, chSummary, chWhat, cxlOpts, kindOf, KIND_OF_PROC, lenMonths, type ChKind, type ChSite } from '@/lib/corp/sites/logic';
import { addMonth, cycOfJa, fieldsToEdits, siteView } from '@/lib/corp/sites/fromDomain';

/*
 * 変更申請の代理入力（契約変更タブ）：種類ごとの項目は法人Web の『ご希望の内容』と同じ（lib/corp/sites/logic.ts の chFields を使う）。
 * 台帳 運営A 2026-10-05 契約申請管理 Q7・2026-10-06 Q11。複数の拠点を選べる（拠点ごとに入力）。受付経路＝代理入力
 */

/** 代理入力で選べる拠点（ご利用中＝本登録・契約が有効）と、その拠点でできる手続き */
export type PcSite = {
  id: string; name: string; corpId: string; corpName: string;
  /** 法人Web の欄を作るための拠点の情報 */
  ch: ChSite;
  /** いまお使いの設備（貸出中）。設備の変更の「対象の設備」の選択肢 */
  loans: { label: string; qty: number }[];
  /** 手続きごとに申し込めない理由（空＝申し込める） */
  why: Partial<Record<ChKind, string>>;
  /** 休止予定（承認済み・まだ始まっていない休止）の拠点の休止の開始サイクル（yyyy-mm）。再開は『休止予定の取消』になり、再開するサイクル月は休止の開始月で決まる */
  pausePlan?: string;
};

/** 休止・解約タブの『この拠点は申し込めるか』（法人Webの canApply と同じ。再開だけは休止予定の拠点にも出す：台帳 運営A Q12・Q14） */
function stopWhy(k: ChKind, v: ReturnType<typeof siteView>, ch: ChSite, resumable: boolean): string {
  const pend = v.pend || v.pinfo;
  if (pend) return `承認待ちの申請（${pend.no}）がある拠点です`;
  const ki = kindOf(k)!;
  if (k === 'rsm' ? !resumable : ch.state !== ki.need && ch.state !== ki.also) return ch.state === 'suspended' ? '休止中の拠点です。このお手続きの対象外です' : k === 'rsm' ? '休止中・休止予定の拠点ではないため、このお手続きの対象外です' : 'ご利用中の拠点です。このお手続きの対象外です';
  const proc = (Object.entries(KIND_OF_PROC).find(([, x]) => x === k) || [])[0];
  if (proc && v.apply.block?.includes(proc) && !(k === 'rsm' && resumable)) return `${(v.apply.blockWhy || '').replace(/のため$/, '')}のため、この手続きの対象外です`;
  return '';
}

/** 法人Web の ChSite（lib/corp/areas/corp-sites.ts の chSite と同じ） */
function chSiteOf(v: ReturnType<typeof siteView>): ChSite {
  const pn = (/(\d+プラン)/.exec(v.ct.plan) || [])[1];
  return {
    id: v.id, name: v.name, cp: v.ct.no, plan: pn ? pn + '（' + v.ct.course + '）' : v.ct.plan,
    state: v.status === '休止中' ? 'suspended' : 'active', start: v.ct.startCyc.replace(/分$/, ''), term: v.apply.term, qr: v.qr, trial: v.ct.trial, apply: v.apply,
  };
}

export function pcSites(repo: DocRepo): PcSite[] {
  const corps = new Map(repo.list<Corp>('dm.org.corps').map((c) => [c.id, c]));
  const models = new Map(repo.list<Model>('dm.master.models').map((m) => [m.id, m]));
  const loans = repo.list<Loan>('dm.org.loans').filter((l) => l.status === '貸出中');
  const cts = repo.list<Contract>('dm.org.contracts');
  const resumable = resumableBranches(repo);
  return repo.list<Branch>('dm.org.branches')
    .filter((b) => b.corpId && b.status === '本登録' && cts.some((c) => c.branchId === b.id && (c.status === '有効' || c.status === '利用休止')))
    .map((b): PcSite => {
      const v = siteView(repo, b), ch = chSiteOf(v);
      const pend = v.pend || v.pinfo;
      const stop = pend ? `承認待ちの申請（${pend.no}）がある拠点です` : '';
      const why: PcSite['why'] = {};
      for (const k of ['chg', 'opt', 'eqp', 'inf'] as ChKind[]) {
        const proc = ({ chg: 'plan', opt: 'dlv', eqp: 'eq', inf: 'info' } as Record<string, string>)[k];
        why[k] = stop || (v.apply.block?.includes(proc) ? `${(v.apply.blockWhy || '').replace(/のため$/, '')}のため、この手続きの対象外です` : '');
      }
      /* 休止・解約タブ：休止・再開・解約（休止中の拠点は、契約変更タブの手続きは使えない） */
      const rs = resumable.find((x) => x.branchId === b.id);
      for (const k of ['sus', 'rsm', 'cxl'] as ChKind[]) why[k] = stopWhy(k, v, ch, !!rs);
      if (ch.state === 'suspended') for (const k of ['chg', 'opt', 'eqp', 'inf'] as ChKind[]) why[k] = why[k] || '休止中の拠点です。このお手続きの対象外です';
      return {
        id: b.id, name: b.name, corpId: b.corpId!, corpName: corps.get(b.corpId!)?.name ?? '', ch, why, pausePlan: rs?.state === '休止予定' ? rs.fromCycle : undefined,
        loans: loans.filter((l) => l.branchId === b.id).map((l) => ({ label: `${l.modelId}　${models.get(l.modelId)?.name ?? ''}`, qty: l.qty })),
      };
    })
    .sort((x, y) => x.corpId.localeCompare(y.corpId) || x.id.localeCompare(y.id));
}

/** 『100プラン（ESスタンダード）』→ プランとコース（ライトは自販機の拠点なら自販機。lib/corp/areas/corp-sites.ts の planOf と同じ） */
function planOf(repo: DocRepo, label: string | undefined, vend: boolean): { planId?: string; course?: Course } {
  const m = /^(\d+プラン)（(.+)）$/.exec(label || '');
  if (!m) return {};
  const plan = repo.list<Plan>('dm.master.plans').find((p) => p.name === m[1] && p.status === '有効');
  const course: Course = m[2] === 'ESスタンダード' ? 'ESスタンダード' : m[2] === 'ESライト（自販機）' || vend ? 'ESライト（自販機）' : 'ESライト（冷蔵庫）';
  return plan ? { planId: plan.id, course } : {};
}

/** 配送の変更の「変更する項目を1つ以上」。標準の回数と同じ『標準』を選んだだけでも変更とみなす */
const noChange = (v: Record<string, string>, vend: boolean) => (vend || !v.ship || v.ship === '変更しない') && (!v.dcount || v.dcount === '変更しない');

/** 1拠点（法人情報の変更は法人）の入力から、申請の中身を作る。入力に不備があれば理由つきで止める */
export function pcBuild(repo: DocRepo, form: PcForm, s: PcSite | null) {
  const k = form.kind, ki = kindOf(k)!;
  let v = form.vals[s?.id ?? form.corpId] ?? {};
  /* 選べる開始月・解約日は、今日ではなく受付日から決める（申込フォーム §10-5・台帳 運営A H10）。受付日が空なら今日 */
  const t = (form.recv?.trim() || today()).replace(/-/g, '/');
  /* 休止予定の拠点の再開は『休止予定の取消』：再開するサイクル月は休止の開始月で決まる（台帳 運営A Q14） */
  if (k === 'rsm' && s?.pausePlan) v = { ...v, cyc: `${+s.pausePlan.slice(0, 4)}年${+s.pausePlan.slice(5)}月` };
  const e = chErrors(k, s?.ch ?? null, v, t);
  const who = s ? `${s.name}：` : '';
  if (Object.keys(e).length) throw new ApiError(`${who}未入力の項目があります（${Object.values(e)[0]}）`, 400);
  /* 理由・ご要望・詳しく（複数行）は500文字まで（申請・承認 §6） */
  for (const key of ['why', 'memo']) if ((v[key] ?? '').length > 500) throw new ApiError(`${who}理由・ご要望は500文字までです。`, 400);
  if (k === 'opt' && noChange(v, !!s?.ch.apply.vend)) throw new ApiError(`${who}変更する項目を1つ以上選んでください。`, 400);
  if (k === 'chg' && v.plan === s!.ch.plan) throw new ApiError(`${who}いまと同じプランは選べません。`, 400);
  if (k === 'eqp' && v.act !== '設備を追加したい') {
    const ln = s!.loans.find((l) => v.target?.startsWith(l.label.split('　')[0]));
    if (!ln) throw new ApiError(`${who}対象の設備は、いまお使いの設備（${s!.loans.map((l) => l.label.split('　')[0]).join('・') || 'なし'}）から選んでください。`, 400);
    if (parseInt(v.qty, 10) > ln.qty) throw new ApiError(`${who}台数は、いまの台数（${ln.qty}台）までです。`, 400);
  }
  let edits: InfoEdits | undefined, change: Application['change'] = {};
  if (k === 'chg') change = planOf(repo, v.plan, !!s!.ch.apply.vend);
  let start = cycOfJa(v.cyc ?? '');
  if (k === 'rsm') change = { ...planOf(repo, v.plan, !!s!.ch.apply.vend), resumeCycle: start };
  if (k === 'sus') {
    const n = lenMonths(v.len);
    change = { fromCycle: start, toCycle: addMonth(start, n - 1), resumeCycle: addMonth(start, n), keepEquipment: /^置いたまま/.test(v.eqkeep || '') };
  }
  if (k === 'cxl') {
    const o = cxlOpts(t).find((x) => v.end?.startsWith(x.v));
    start = o ? cycOfJa(o.apply) : '';
    change = start ? { lastCycle: addMonth(start, -1) } : {};
  }
  if (k === 'inf' || k === 'cop') {
    const map: Record<string, string> = { name: 'name', kana: 'kana', zip: 'zip', pref: 'pref', city: 'city', addr1: 'a1', addr2: 'a2', tel: 'tel', fax: 'fax' };
    const f: Record<string, string> = {};
    Object.entries(map).forEach(([from, to]) => { if (v[from]) f[to] = v[from]; });
    if (v.bill) f.billTo = v.bill === '法人に請求' ? '法人' : 'この拠点';
    if (v.guest) f.guest = v.guest;
    edits = fieldsToEdits(f);
    if (!Object.keys(edits).length && k === 'cop') throw new ApiError('変更したいものを選んで、変更後の内容を入れてください。', 400);
  }
  if (!ki.corp && !start) throw new ApiError(k === 'cxl' ? `${who}解約日を選んでください。` : `${who}開始したいご利用月を選んでください。`, 400);
  return { start: ki.corp ? '' : start, change, edits, summary: chSummary(k, s?.ch ?? null, v), what: chWhat(k, s?.ch ?? null, v), v };
}

/** 設備の変更：入力から設備の異動の案を作る（追加・入替・回収）。費用の案は承認の前に直せる */
export function pcEquipment(base: EquipProposal, models: Model[], v: Record<string, string>): EquipProposal {
  const qty = Math.max(1, parseInt(v.qty, 10) || 1);
  const rows: EquipRow[] = base.rows.map((x) => ({ ...x }));
  const id = (x: string | undefined) => (x ?? '').match(/(?:RF|FZ|MW|BX|VM)\d{6}/)?.[0] ?? '';
  const to = models.find((m) => m.id === id(v.model));
  if (v.act === '設備を追加したい') {
    if (to) rows.push({ category: to.category, action: '追加', fromModelId: '', toModelId: to.id, qty, loanId: '', note: '' });
  } else {
    const i = rows.findIndex((x) => x.fromModelId === id(v.target));
    if (i >= 0) {
      const row = rows[i], action: EquipRow['action'] = v.act === '設備を返却したい' ? '回収' : '入替';
      const next: EquipRow = { ...row, action, toModelId: action === '回収' ? '' : to?.id ?? row.toModelId, qty: Math.min(qty, row.qty) };
      if (qty >= row.qty) rows[i] = next;
      else { rows[i] = { ...row, qty: row.qty - qty }; rows.splice(i + 1, 0, next); }
    }
  }
  return { ...base, rows };
}

export { addMonth, lenMonths, PC_KINDS };
export type { PcForm };
