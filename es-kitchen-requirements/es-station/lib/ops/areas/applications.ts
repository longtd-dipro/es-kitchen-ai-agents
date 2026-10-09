import { closeOf, hasPendingSwitch, PENDING_SWITCH_WHY, resumableBranches } from '@/lib/domain/lifecycle';
import { ApiError } from '@/lib/api/errors';
import { today } from '@/lib/supplier/dates';
import apply from '@/lib/domain/areas/apply';
import { lockedSkips } from '@/lib/domain/locked';
import { formMasterOf } from '@/lib/domain/formMaster';
import type { InfoEdits } from '@/lib/domain/areas/apply';
import type { Application, Branch, ChangeKind, Carrier, Channel, ChildContract, Contract, EquipProposal, Model, NewSetup, Pause, Plan, Warehouse } from '@/lib/domain/types';
import { isOpenPause } from '@/lib/domain/types';
import { INTAKE_REJECTER } from '../applications/constants';
import { changeFor, cycLabel, intakeFor, type OpsState } from '../applications/fromDomain';
import { realCfg } from '../applications/intakeReal';
import { pcBuild, pcEquipment, pcSites, type PcForm } from '../applications/proxyChange';
import { kindOf } from '@/lib/corp/sites/logic';
import { MAPPED_KEYS, routesToChannels, type IntakeDraft } from '../applications/intake';
import {
  appState, approveError, blockWhy, chRows, filterChanges, filterIntakes, isSwitch, nfApply, nfErrors, pendingSplit, pendingTip, PCS_KINDS, rangeError, setDone,
  type NfForm,
} from '../applications/logic';
import { seedIntakeSamples } from '../applications/seed';
import type { ChangeApp, ChangeBranch, IntakeCfg, IntakeRow, IntakeStatus, ListFilter, Logistics } from '../applications/types';
import { yen, yenSigned } from '@/lib/format/money';
import { defineArea, type DocRepo } from '../core/area';

/*
 * 契約申請管理（メニュー「契約申請管理」・元：11_運営_申請受付.html）。
 * 申請は共通データ（lib/domain・dm.apply.applications）。承認・却下・新規申込の受付・代理入力は apply の action を呼ぶので、
 * 承認したときの契約の書き換え（子契約・休止・親契約）と法人Web へのお知らせは lib/domain で1回だけ起きる。
 * 画面の形は lib/ops/applications/fromDomain.ts で作る。
 * 運営だけが持つもの（共通データにない）：
 *   applications.state        … 申請ごとの、承認の前にする設定・締切後の承認の扱い・代理入力の受付経路・却下のメモなど
 *   applications.intakeSample … 受付画面の見本（新規・お試し・切替の3つ。画面の定義で、申込の中身ではない）
 */
const K = { state: 'applications.state', sample: 'applications.intakeSample' } as const;
/** 承認・代理入力をする運営アカウント（見本：井上 悠） */
const OPS_ID = 'Ad00003';
/** 操作したアカウント。サーバーは lib/server/access.ts の gate がログイン中のアカウントを args.by に入れる（ないときはログインのない mock：見本） */
type By = { by?: string };
const opsBy = (by?: string) => (typeof by === 'string' && by ? by : OPS_ID);

/** 配送ルートの選択肢（共通データの 倉庫・中継・運び手。有効なものだけ） */
function logisticsOf(repo: DocRepo): Logistics {
  const wh = repo.list<Warehouse>('dm.master.warehouses').filter((w) => w.status === '有効');
  return {
    warehouses: wh.filter((w) => w.type === 'picking').map((w) => ({ id: w.id, name: w.name })),
    hubs: wh.filter((w) => w.type === 'relay').map((w) => ({ id: w.id, name: w.name })),
    carriers: repo.list<Carrier>('dm.master.carriers').filter((c) => c.status === '有効').map((c) => ({ id: c.id, name: c.name, kind: c.kind })),
  };
}

/** 詳細情報設定のタブの保存で、共通データへ入れる欄（key → 値）と表（担当者・設備） */
type DetailScope = { ti: number; tab: string; vals: Record<string, string>; corpStaff?: string[][]; staff?: string[][]; eq?: string[][] };
function applyScope(setup: NewSetup, sc: DetailScope) {
  const b = setup.branches[sc.ti];
  if (!b) return;
  const v = sc.vals, locked = b.stage === '本登録';
  const addr = (a: NewSetup['branches'][number]['address'], k: [string, string, string, string, string]) => ({
    zip: k[0] in v ? v[k[0]] : a.zip, pref: k[1] in v ? v[k[1]] : a.pref, city: k[2] in v ? v[k[2]] : a.city, addr1: k[3] in v ? v[k[3]] : a.addr1, addr2: k[4] in v ? v[k[4]] : a.addr2,
  });
  const main = (rows?: string[][]) => { const r = rows?.find((x) => x[0] === 'メイン担当者') ?? rows?.[0]; return r ? { name: r[1] ?? '', email: r[3] ?? '', tel: r[4] ?? '' } : null; };
  if (sc.tab === 'corp' && setup.corp) {
    setup.corp = { ...setup.corp, name: v.cn ?? setup.corp.name, kana: v.ckana ?? setup.corp.kana, tel: v.ctel ?? setup.corp.tel, address: addr(setup.corp.address, ['czip', 'cpref', 'ccity', 'cad1', 'cad2']), contact: main(sc.corpStaff) ?? setup.corp.contact };
  }
  if (locked) return;
  if (sc.tab === 'br') {
    b.name = v.bn ?? b.name; b.kana = v.bkana ?? b.kana; b.tel = v.tel ?? b.tel;
    if ('emp' in v) b.employees = Math.max(0, Math.floor(Number(v.emp) || 0));
    b.address = addr(b.address, ['zip', 'pref', 'city', 'ad1', 'ad2']);
    b.contact = main(sc.staff) ?? b.contact;
  }
  if (sc.tab === 'bill' && v.billto) b.billTo = v.billto === 'この拠点' ? 'この拠点' : '法人';
  if (sc.tab === 'mc') {
    const changed = (v.plan && v.plan !== b.planId) || (v.course && v.course !== b.course);
    if (v.plan) b.planId = v.plan;
    if (v.course) b.course = v.course as typeof b.course;
    if (changed) b.equipment = [];
    if ('dnote' in v) b.deliveryNote = v.dnote;
    if (v.ship) b.channels = b.channels.map((c) => ({ ...c, serviceForm: v.ship === 'COOL便' ? 'COOL便' : 'ES配送便' }));
  }
  if (sc.tab === 'eq' && sc.eq) {
    const eq = sc.eq.filter((r) => /新規貸出|追加貸出/.test(r[0])).map((r) => ({ modelId: (r[3].match(/(?:RF|FZ|MW|BX|VM)\d{6}/) ?? [''])[0], qty: Math.max(1, Math.floor(Number(r[4]) || 1)) })).filter((x) => x.modelId);
    b.equipment = eq;
  }
}
const all = (repo: DocRepo) => apply.queries.list(repo, {}) as Application[];
/**
 * 請求済みの月にかかる差額（TL-7 A）：承認の前は承認したらできる調整明細の試算、承認のあとは作った調整明細。
 * 行＝[サイクル月（種類）, 元の請求書, 請求した額, 変更後の額, 差額]（税抜）
 */
function billedOf(repo: DocRepo, no: string, branchId: string): ChangeBranch['billed'] {
  if (!branchId) return undefined;
  const pv = apply.queries.billedPreview(repo, { id: no, branchId });
  const rows = pv.rows.map((x): [string, string, string, string, string] => [
    `${x.cycleMonth ? cycLabel(x.cycleMonth) : '—'}（${x.kind}）`, x.fromInvoiceId ? `${x.fromInvoiceId}（請求済）` : '—',
    yen(x.billedYen), yen(x.afterYen), yenSigned(x.afterYen - x.billedYen),
  ]);
  const sum = pv.rows.reduce((s, x) => s + x.afterYen - x.billedYen, 0);
  /* 確定（未発行）でロックしたまま変えない月：承認の前＝試算、承認のあと＝反映待ちの記録（2026/10/03 決定） */
  const skips = pv.done ? lockedSkips(repo, { applicationId: no, branchId, all: true }).map((x) => ({ id: x.id, cycleMonth: x.cycleMonth, billStatus: x.billStatus, canApply: x.canApply, status: x.status })) : [];
  return { total: `${yenSigned(sum)}（税抜）`, rows, done: pv.done, ids: pv.rows.map((x) => x.id), err: pv.error, locked: pv.locked, skips };
}
const stateOf = (repo: DocRepo, id: string) => repo.get<OpsState>(K.state, id);
const putState = (repo: DocRepo, id: string, patch: Partial<OpsState>) => repo.put<OpsState>(K.state, id, { ...stateOf(repo, id), ...patch, id });
const changes = (repo: DocRepo) => all(repo).filter((a) => a.type === 'change').map((a) => changeFor(repo, a, stateOf(repo, a.id)));
const intakes = (repo: DocRepo) => all(repo).filter((a) => a.type === 'new').map((a) => intakeFor(repo, a, stateOf(repo, a.id)));

function mustApp(repo: DocRepo, no: string, type: Application['type']) {
  const a = repo.get<Application>('dm.apply.applications', no);
  if (!a || a.type !== type) throw new ApiError(type === 'new' ? '申込が見つかりません' : '申請が見つかりません', 404);
  return a;
}
const mustChange = (repo: DocRepo, no: string) => changeFor(repo, mustApp(repo, no, 'change'), stateOf(repo, no));
/** 承認・却下できる拠点か（処理済みの申請は不可）。拠点ID も返す */
function openBranch(a: ChangeApp, app: Application, i: number) {
  const b = a.branches[i], row = app.results[i];
  if (!b || !row) throw new ApiError('拠点が見つかりません', 404);
  if (a.done) throw new ApiError('処理済みの申請は変更できません', 409);
  return { b, branchId: row.branchId };
}
/** 代理入力の申請の確かめに使う、拠点の共通データ（自販機か・これまでの休止） */
function proxyCtx(repo: DocRepo, br: string) {
  const ct = repo.list<Contract>('dm.org.contracts').find((c) => c.branchId === br);
  const cc = repo.list<ChildContract>('dm.org.childContracts').filter((c) => c.branchId === br).pop();
  const hist = repo.list<Pause>('dm.org.pauses').filter((p) => p.contractId === ct?.id)
    .map((p): [string, number] => isOpenPause(p) ? [`${cycLabel(p.fromCycle)}〜未定（移行）`, 0]
      : p.voided ? [`取消した休止（${cycLabel(p.fromCycle)}・0か月・通算に入れない・${p.applicationNo}）`, 0]
      : [`${cycLabel(p.fromCycle)}〜${cycLabel(p.toCycle)}（${p.applicationNo}）`, (+p.toCycle.slice(0, 4) - +p.fromCycle.slice(0, 4)) * 12 + (+p.toCycle.slice(5) - +p.fromCycle.slice(5)) + 1]);
  return { vm: cc?.course === 'ESライト（自販機）', hist };
}

/**
 * 切替（お試し→本導入）の拠点を、法人のお試し中の拠点に結びつける（B2）。拠点 ID が選ばれていなければ拠点名で探す。
 * 見つからない・決められないときは登録しない（新しい拠点・親契約を作らないため）
 */
function withTrialBranches(repo: DocRepo, form: NfForm): NfForm {
  if (!form.branches.some(isSwitch)) return form;
  const corpId = form.corpKind === '既存の法人' ? (form.corp.match(/^(CU\d+)/) || [])[1] : undefined;
  if (!corpId) throw new ApiError('切替（お試し→本導入）は既存の法人を選んでください', 400);
  const trials = repo.list<Branch>('dm.org.branches').filter((b) => b.corpId === corpId).filter((b) => {
    const ct = repo.list<Contract>('dm.org.contracts').find((c) => c.branchId === b.id);
    return ct?.kind === 'お試しキャンペーン' && ['有効', '仮登録'].includes(ct.status);
  });
  const used = new Set<string>();
  const branches = form.branches.map((b) => {
    if (!isSwitch(b)) return b;
    if (b.branchId) {
      if (!trials.some((t) => t.id === b.branchId)) throw new ApiError(`${b.branchId} はこの法人のお試し中の拠点ではありません`, 400);
      used.add(b.branchId);
      return b;
    }
    const n = b.name.trim();
    const hit = trials.filter((t) => !used.has(t.id) && (t.name === n || t.name.endsWith(` ${n}`) || t.name.endsWith(n)));
    if (hit.length !== 1) {
      throw new ApiError(trials.length
        ? `切替の拠点「${n}」をお試し中の拠点（${trials.map((t) => `${t.id} ${t.name}`).join('・')}）から決められません。拠点名を合わせてください`
        : 'この法人にお試し中の拠点がありません（切替はできません）', 400);
    }
    used.add(hit[0].id);
    return { ...b, branchId: hit[0].id };
  });
  return { ...form, branches };
}

export default defineArea({
  name: 'applications',
  /* 申請は共通データ。ここは受付画面の見本だけ */
  seed: () => ({ [K.sample]: seedIntakeSamples().map((x) => ({ id: x.id, data: x.cfg })) }),
  queries: {
    /** 一覧（新規契約タブの行と変更申請の全件） */
    overview: (repo) => ({ intakes: intakes(repo), changes: changes(repo) }),
    /**
     * 一覧の検索（3つのタブ共通。台帳 運営A Q5：申請日の範囲・法人・開始サイクル月・受付経路ほか）。条件に合う申請の番号を、一覧の並びで返す。
     * 申請日の範囲が逆（まで が から より前）のときは検索しない（E08）
     */
    search: (repo, { f }: { f: ListFilter }) => {
      if (rangeError(f)) throw new ApiError(rangeError(f), 400);
      return f.tab === 'new'
        ? { nos: filterIntakes(intakes(repo), f).map((x) => x.no) }
        : { nos: filterChanges(chRows(changes(repo), today()), f).map((x) => x.no) };
    },
    /** 変更申請1件（請求済みの月にかかる差額＝調整明細の試算・承認で作った調整明細つき） */
    change: (repo, { no }: { no: string }) => {
      const a = repo.get<Application>('dm.apply.applications', no);
      if (a?.type !== 'change') return null;
      const x = changeFor(repo, a, stateOf(repo, no));
      if (a.kind === '法人情報の変更') return x;
      return { ...x, branches: x.branches.map((b, i) => ({ ...b, billed: billedOf(repo, no, a.results[i]?.branchId ?? '') })) };
    },
    /**
     * 申込1件と、その受付画面の定義。見本（テンプレート）は画面の形だけで、中身（法人・拠点・住所・担当者・プラン・配送・設備・ID）は
     * 申込の受付の中身（共通データ）から作る（台帳 運営A 2026-10-06 (2)）。運営が保存した入力（detail）も戻す
     */
    intake: (repo, { no }: { no: string }) => {
      const a = repo.get<Application>('dm.apply.applications', no);
      if (a?.type !== 'new') return null;
      const row = intakeFor(repo, a, stateOf(repo, no));
      const tpl = row.go >= 0 ? repo.get<IntakeCfg>(K.sample, String(row.go)) ?? null : null;
      if (!tpl) return { row, cfg: null };
      /* master＝受付の機種・オプション・値引き・標準の配送回数・配送ルートの選択肢の元（共通データのマスタ。マスタを直すと画面も読み直す） */
      const master = { ...formMasterOf(repo), logistics: logisticsOf(repo) };
      const view = apply.queries.setup(repo, { id: no });
      const opsName = repo.get<{ name: string }>('dm.account.accounts', OPS_ID)?.name ?? '';
      const cfg = realCfg({ r: repo, app: a, row, tpl, st: stateOf(repo, no), opsName, view, lg: master.logistics, plans: master.plans, models: master.models });
      return { row, cfg: { ...cfg, master } };
    },
    /** 設備の異動の案（プランの変更の拠点 i。保存した案があればそれ・課題 3-6） */
    equipment: (repo, { no, i }: { no: string; i: number }) => {
      const app = mustApp(repo, no, 'change'), row = app.results[i];
      if (!row) throw new ApiError('拠点が見つかりません', 404);
      return apply.queries.equipment(repo, { id: no, branchId: row.branchId });
    },
    /** 受付・設備の異動の画面の選択肢（プラン・機種・ピッキング倉庫・運び手） */
    masters: (repo) => ({
      plans: repo.list<Plan>('dm.master.plans').filter((p) => p.status === '有効').map((p) => ({ id: p.id, name: p.name, courses: p.prices.map((x) => x.course) })),
      models: repo.list<Model>('dm.master.models').filter((m) => m.status === '有効').map((m) => ({ id: m.id, name: m.name, category: m.category, monthlyYen: m.monthlyYen })),
      warehouses: repo.list<Warehouse>('dm.master.warehouses').filter((w) => w.type === 'picking' && w.status === '有効').map((w) => ({ id: w.id, name: w.name })),
      carriers: repo.list<Carrier>('dm.master.carriers').filter((c) => c.status === '有効').map((c) => ({ id: c.id, name: c.name, kind: c.kind })),
    }),
    /** 新規申込の受付の中身・本登録に足りない情報（課題 3-2・3-7） */
    setup: (repo, { no }: { no: string }) => { mustApp(repo, no, 'new'); return apply.queries.setup(repo, { id: no }); },
    /** 『再開』の対象の拠点（休止中・休止予定。台帳 運営A Q12・Q14）と、過去の休止（取消した休止は0か月）。代理入力の選択肢に使う */
    resumable: (repo) => resumableBranches(repo).map((x) => ({ ...x, ...proxyCtx(repo, x.branchId) })),
    /** 変更申請（契約変更タブ）の代理入力：選べる拠点（ご利用中）と、法人Web の『ご希望の内容』の欄を作る元・申し込めない理由（台帳 運営A Q7・Q11） */
    proxyBranches: (repo) => pcSites(repo),
    /** 代理入力の確かめ用：拠点の共通データ（自販機か・これまでの休止＝取消した休止は0か月で通算に入れない） */
    proxyCtx: (repo, { branchId }: { branchId: string }) => proxyCtx(repo, branchId),
    /** 承認待ちの『切替』申請がある拠点か（拠点の『本導入に切り替える』を非活性にする理由つき） */
    pendingSwitch: (repo, { branchId }: { branchId: string }) => ({ pending: hasPendingSwitch(repo, branchId), why: hasPendingSwitch(repo, branchId) ? PENDING_SWITCH_WHY : '' }),
    /** メニューのバッジ：対応が必要な申請の数。マウスを乗せると内訳（RV4-OPS-20261002 #1） */
    navBadge: (repo) => {
      const p = pendingSplit(intakes(repo), changes(repo));
      return { count: p.u + p.c + p.w, tip: pendingTip(p) };
    },
  },
  actions: {
    /** 拠点を承認する（必須の設定がそろい、承認できない理由がないこと）。共通データの apply.decide で契約に反映する */
    approve: (repo, { no, i, ok, checks, texts, late, migrate, startCycle, by }: { no: string; i: number; ok: boolean; checks?: Record<string, boolean>; texts?: Record<string, string>; late?: string; migrate?: boolean; startCycle?: string } & By) => {
      const app = mustApp(repo, no, 'change'), a = mustChange(repo, no), { b, branchId } = openBranch(a, app, i);
      if (b.res.st) throw new ApiError('この拠点は処理済みです', 409);
      const why = blockWhy(a, b);
      if (why) throw new ApiError(why, 400);
      if (!setDone(a, i)) throw new ApiError('承認の前にする設定が終わっていません', 400);
      const err = approveError(a, { ok, checks, texts });
      if (err.msg) throw new ApiError(err.msg, 400);
      /* 冷蔵庫→自販機：開始月は運営が承認のときに決める（法人の希望月は参考：台帳 2026/10/03） */
      if (b.toVm) {
        if (!startCycle || !b.vmStarts?.includes(startCycle)) throw new ApiError('自販機に切り替える開始月を選んでください', 400);
        repo.put('dm.apply.applications', no, { ...app, startCycle, orderCloseOn: closeOf(repo, startCycle) });
      }
      /* 締切後の承認：繰り下げ（翌サイクルから・既定）／運営が今月分を代理でオーダー（開始月は変えない）。28-27・E-7' */
      const res = apply.actions.decide(repo, { id: no, branchId, result: 'ok', by: opsBy(by), late: late && /代理/.test(late) ? '代理' : '繰り下げ',
        /* 移行割：対象の拠点だけ。チェックを外したら付けない（受付簿 No.16） */
        ...(b.migrate ? { migrate: migrate !== false } : {}) }) as { note?: string };
      if (late) putState(repo, no, { late: { ...stateOf(repo, no)?.late, [branchId]: late } });
      return { name: b.name, state: appState(mustChange(repo, no)).t, note: res.note ?? '' };
    },
    /** 拠点を却下する（理由は必須・28-25）。法人Web へ理由つきでお知らせ */
    reject: (repo, { no, i, why, note, by }: { no: string; i: number; why: string; note?: string } & By) => {
      const app = mustApp(repo, no, 'change'), a = mustChange(repo, no), { b, branchId } = openBranch(a, app, i);
      if (b.res.st) throw new ApiError('この拠点は処理済みです', 409);
      if (!why) throw new ApiError('却下の理由を選んでください。', 400);
      apply.actions.decide(repo, { id: no, branchId, result: 'ng', reason: note?.trim() ? `${why}（${note.trim()}）` : why, by: opsBy(by) });
      return { name: b.name };
    },
    /** 承認の前にする設定を1つ入れる（運営だけの入力） */
    setValue: (repo, { no, i, k, v }: { no: string; i: number; k: string; v: string | boolean }) => {
      const app = mustApp(repo, no, 'change'), { b, branchId } = openBranch(mustChange(repo, no), app, i);
      if (b.res.st) throw new ApiError('この拠点は処理済みです', 409);
      const set = stateOf(repo, no)?.set ?? {};
      putState(repo, no, { set: { ...set, [branchId]: { ...set[branchId], [k]: v } } });
    },
    /**
     * 変更申請の代理入力（契約変更タブ・休止・解約タブ）。種類ごとの項目は法人Web の『ご希望の内容』と同じ。
     * 複数の拠点を選べる：開始サイクル月・中身が同じ拠点は1件の申請にまとめ、違えば申請を分ける（法人Web と同じ）。受付経路＝代理入力
     */
    createChanges: (repo, { form, by }: { form: PcForm } & By) => {
      const pk = PCS_KINDS.find((x) => x.k === form.kind);
      if (!pk) throw new ApiError('申請の種類を選んでください', 400);
      if (!form.route?.trim()) throw new ApiError('受付経路を選んでください', 400);
      if (!form.corpId) throw new ApiError('法人を選んでください', 400);
      const ki = kindOf(form.kind)!;
      const sites = pcSites(repo);
      const targets = ki.corp ? [null] : form.sites.map((id) => {
        const s = sites.find((x) => x.id === id && x.corpId === form.corpId);
        if (!s) throw new ApiError(`拠点 ${id} は、この法人のご利用中の拠点ではありません`, 400);
        if (s.why[form.kind]) throw new ApiError(`${s.name}：${s.why[form.kind]}`, 409);
        return s;
      });
      if (!targets.length) throw new ApiError('拠点を1つ以上選んでください', 400);
      /* 先に全部の拠点を確かめる（途中で止まって一部だけ申請にならないように） */
      type G = { start: string; change: Application['change']; edits?: InfoEdits; sites: NonNullable<(typeof targets)[number]>[]; whats: string[]; summary: [string, string][]; vals: Record<string, string>[] };
      const groups = new Map<string, G>();
      for (const s of targets) {
        const b = pcBuild(repo, form, s);
        const key = JSON.stringify([b.start, b.change, b.edits ?? null, b.summary]);
        const g = groups.get(key) ?? { start: b.start, change: b.change, edits: b.edits, sites: [], whats: [], summary: b.summary, vals: [] };
        if (s) g.sites.push(s);
        g.whats.push(b.what);
        g.vals.push(b.v);
        groups.set(key, g);
      }
      const nos: string[] = [];
      const models = repo.list<Model>('dm.master.models');
      for (const g of groups.values()) {
        const who = `運営（代理入力：${form.route}）`;
        const request: [string, string][] = [['変更したいこと', pk.t], ...g.summary, ['申請内容', [...new Set(g.whats)].join('／')], ['受付', `代理入力（${form.route}・${form.recv}）`]];
        const made = apply.actions.submitChange(repo, {
          kind: pk.t as ChangeKind, corpId: form.corpId, branchIds: g.sites.map((s) => s.id), accountId: form.corpId, name: who, startCycle: g.start, request, change: g.change, receivedOn: form.recv,
          ...(g.edits ? { edits: g.edits } : {}),
        });
        apply.actions.markProxy(repo, { id: made.id, accountId: opsBy(by), name: who });
        /* 設備の変更：入力から設備の異動の案を作っておく（承認の前に直せる） */
        if (form.kind === 'eqp') {
          g.sites.forEach((s, i) => {
            const base = apply.queries.equipment(repo, { id: made.id, branchId: s.id }).proposal;
            apply.actions.saveEquipment(repo, { id: made.id, branchId: s.id, proposal: pcEquipment(base, models, g.vals[i]), recalc: true, by: opsBy(by) });
          });
        }
        const seq = Math.min(0, ...repo.list<OpsState>(K.state).map((x) => x.seq ?? 0)) - 1;
        putState(repo, made.id, { seq });
        nos.push(made.id);
      }
      return { no: nos[0], nos };
    },
    /** 新規登録（代理入力）。受付中の申込が1件でき、Webの申込と同じ受付で進める（共通データの submitNew → markProxy） */
    createIntake: (repo, { form, mainContact, by }: { form: NfForm; mainContact?: { name: string; email: string } } & By) => {
      const bad = nfErrors(form);
      if (bad.length) throw new ApiError(`入力されていない項目があります（${bad.length}件）`, 400);
      /* お試しはプラン50・ESライト（冷蔵庫）だけ（台帳 R・受付簿 #422） */
      for (const b of form.branches.filter((x) => x.kubun === 'お試しキャンペーン')) {
        const pl = repo.get<Plan>('dm.master.plans', b.plan.match(/ES\d{6}/)?.[0] ?? '');
        if (!pl || pl.monthlyMeals !== 50 || /スタンダード/.test(b.course) || /自販機/.test(b.eq)) throw new ApiError(`お試しはプラン50・ESライト（冷蔵庫）だけです（${b.name}）`, 400);
      }
      /* M1：お申し込み者（とわかっていればメイン担当者。CSV の取込）へ。文面を作るだけ */
      const mailTo = [{ name: form.pname, email: form.pmail }, ...(mainContact ? [mainContact] : [])];
      const made = apply.actions.submitNew(repo, { ...nfApply(withTrialBranches(repo, form)), mailTo });
      apply.actions.markProxy(repo, { id: made.id, accountId: opsBy(by), name: `運営（代理入力：${form.route}）` });
      /* 前に登録した行の「登録したばかり」は外す */
      repo.list<OpsState>(K.state).filter((s) => s.fresh).forEach((s) => putState(repo, s.id, { fresh: false }));
      putState(repo, made.id, { fresh: true, route: form.route, es: form.es || undefined });
      return { no: made.id };
    },
    /**
     * RV3-OPS-20261002 #2：受付画面で仮登録・確定したら、申込の状態を変える（受付中 → 契約設定中 → 完了）。
     * 仮登録は共通データの apply.provisional（法人・拠点・親契約・アカウント・最初の注文・資材の初期セットを作る・課題 3-2）。
     * 完了は全拠点の本登録（apply.register）でだけ付く。見本の画面の「確定」では完了にしない（共通データの拠点を本登録してから）
     */
    intakeStatus: (repo, { no, st, acct, by }: { no: string; st: Extract<IntakeStatus, '契約設定中' | '完了'>; acct?: boolean } & By) => {
      const x = mustApp(repo, no, 'new');
      const cur = x.status as IntakeRow['st'];
      if (cur === '却下' || cur === '取り下げ済' || cur === '完了') return cur;
      if (st === '契約設定中' && cur !== '受付中') return cur;
      /* 仮登録の確認のチェック（アカウント発行・既定ON）。OFFなら仮登録では発行せず、本登録で発行する */
      if (cur === '受付中' && acct === false) {
        const view = apply.queries.setup(repo, { id: no });
        apply.actions.saveSetup(repo, { id: no, setup: { ...structuredClone(view.setup), accountsOff: true } });
      }
      if (cur === '受付中') apply.actions.provisional(repo, { id: no, by: opsBy(by) });
      return (repo.get<Application>('dm.apply.applications', no)?.status ?? cur) as IntakeRow['st'];
    },
    /**
     * 締切後の開始月の扱いを選ぶ（受付の『開始スケジュール』タブ。申込フォーム §10-5・台帳 B）：繰り下げ（開始サイクル月を締切に間に合う翌サイクルへ）／
     * 代理（運営が代理でオーダーし、希望の月から開始）。選んだ内容は変更履歴に残り、仮登録で反映する
     */
    intakeLate: (repo, { no, late }: { no: string; late: '繰り下げ' | '代理' }) => { mustApp(repo, no, 'new'); apply.actions.setLate(repo, { id: no, late, by: OPS_ID }); },
    /** 受付の中身を保存する（共通データの拠点・プラン・配送の設定・運営の確認） */
    saveSetup: (repo, { no, setup }: { no: string; setup: NewSetup }) => { mustApp(repo, no, 'new'); apply.actions.saveSetup(repo, { id: no, setup }); },
    /** 仮登録（受付中の申込） */
    provisional: (repo, { no, by }: { no: string } & By) => { mustApp(repo, no, 'new'); return apply.actions.provisional(repo, { id: no, by: opsBy(by) }).status; },
    /**
     * 本登録（拠点ごと・受付画面の『この拠点を本登録』）。必須の情報がそろった拠点だけ（足りなければ理由つきで止める）。
     * 押した人が「すべて入れたことを確かめた」ことになる。押すと共通データの 拠点・親契約・法人（最初の拠点で正式登録）が変わり、
     * 全拠点が本登録になれば申込は完了（台帳 運営A 2026-10-06 (1)。画面だけで変わる『確定』は無い）
     */
    register: (repo, { no, index, by }: { no: string; index: number } & By) => {
      mustApp(repo, no, 'new');
      const view = apply.queries.setup(repo, { id: no });
      if (view.status !== '契約設定中') throw new ApiError('仮登録のあとに本登録してください（申込内容の確認を完了すると仮登録されます）', 409);
      const setup = structuredClone(view.setup);
      if (!setup.branches[index]) throw new ApiError('拠点が見つかりません', 404);
      const miss = view.branches[index].missing;
      if (miss.length) throw new ApiError(`本登録に必要な情報が足りません：${miss.join('・')}`, 400);
      setup.branches[index].checked = true;
      apply.actions.saveSetup(repo, { id: no, setup });
      try {
        const x = apply.actions.register(repo, { id: no, index, by: opsBy(by) });
        return { status: x.app.status, note: x.note };
      } catch (e) {
        setup.branches[index].checked = false;
        apply.actions.saveSetup(repo, { id: no, setup });
        throw e;
      }
    },
    /**
     * 受付の入力を保存する（詳細情報設定のタブの『保存』・配送の設定の『保存』）。再読込しても残る（J1-6）。
     * 共通データの項目に当たるもの（拠点名・住所・電話・担当者・プラン・コース・配送区分・納品先の備考・請求先・設備・配送ルート＝便）は申込の受付の中身へ入れ、
     * 画面だけの入力（そのほかの欄・表の行・保存した印）は運営の applications.state に残す
     */
    saveDetail: (repo, { no, draft, scope }: { no: string; draft: IntakeDraft; scope?: DetailScope }) => {
      const app = mustApp(repo, no, 'new');
      if (!['受付中', '契約設定中'].includes(app.status)) throw new ApiError(`${app.status} の申込は直せません`, 409);
      const view = apply.queries.setup(repo, { id: no });
      const setup = structuredClone(view.setup);
      const lg = logisticsOf(repo);
      /* 配送ルート → 便（本登録した拠点は変えない） */
      (draft.route ?? []).forEach((rs, i) => {
        const b = setup.branches[i];
        if (!b || b.stage === '本登録' || !rs.length) return;
        const form = (scope?.ti === i && scope.vals.ship ? scope.vals.ship : b.channels[0]?.serviceForm ?? app.request.find((x) => x[0] === '配送')?.[1].split('・')[0]) as Channel['serviceForm'];
        b.channels = routesToChannels(rs, form === 'COOL便' ? 'COOL便' : 'ES配送便', lg, b.channels);
      });
      if (scope) applyScope(setup, scope);
      apply.actions.saveSetup(repo, { id: no, setup });
      /* 共通データへ入れた欄・表は、画面だけの入力から外す（共通データを正とする） */
      const val = Object.fromEntries(Object.entries(draft.val ?? {}).filter(([id]) => !MAPPED_KEYS.has(id.split('_').slice(3).join('_'))));
      putState(repo, no, { detail: { ...draft, val } });
    },
    /** 設備の異動の案を保存する（recalc＝行から費用の案を作り直す）。新規申込（お試し→本導入）は branchId、変更申請は i */
    saveEquipment: (repo, { no, i, branchId, proposal, recalc, by }: { no: string; i?: number; branchId?: string; proposal: EquipProposal; recalc?: boolean } & By) => {
      const app = repo.get<Application>('dm.apply.applications', no);
      const br = branchId ?? app?.results[i ?? -1]?.branchId;
      if (!app || !br) throw new ApiError('申請・拠点が見つかりません', 404);
      if (app.type === 'change') openBranch(mustChange(repo, no), app, i ?? -1);
      return apply.actions.saveEquipment(repo, { id: no, branchId: br, proposal, recalc, by: opsBy(by) });
    },
    /** 設備の異動の案を今のデータから作り直す */
    resetEquipment: (repo, { no, i, branchId }: { no: string; i?: number; branchId?: string }) => {
      const app = repo.get<Application>('dm.apply.applications', no);
      const br = branchId ?? app?.results[i ?? -1]?.branchId;
      if (!app || !br) throw new ApiError('申請・拠点が見つかりません', 404);
      return apply.actions.resetEquipment(repo, { id: no, branchId: br });
    },
    /** 受付画面（申込内容確認）からの却下。理由は必須（28-25）。却下した人・メモは運営だけが持つ */
    intakeReject: (repo, { no, reason, memo, by }: { no: string; reason: string; memo?: string } & By) => {
      mustApp(repo, no, 'new');
      if (!reason) throw new ApiError('却下理由を選んでください。', 400);
      apply.actions.advanceNew(repo, { id: no, status: '却下', reason, by: opsBy(by) });
      putState(repo, no, { memo: memo || '', by: `${by ? repo.get<{ name: string }>('dm.account.accounts', by)?.name ?? by : INTAKE_REJECTER}　${today()}` });
    },
    /** 新規申込の取り下げ（お客様からのご連絡で運営が。仮登録のあとは運営だけ：台帳 2026/10/03） */
    intakeWithdraw: (repo, { no, reason, by }: { no: string; reason: string } & By) => {
      mustApp(repo, no, 'new');
      if (!reason?.trim()) throw new ApiError('取り下げの理由を入れてください。', 400);
      apply.actions.advanceNew(repo, { id: no, status: '取り下げ済', reason: reason.trim(), by: opsBy(by) });
      /* 受付中・仮登録のあとのどちらも、運営がお客様のご連絡を受けて取り下げる（台帳 運営A Q9）。取り下げた人・日 */
      putState(repo, no, { by: `${repo.get<{ name: string }>('dm.account.accounts', opsBy(by))?.name ?? '運営'}が取り下げ（お客様のご連絡）　${today()}` });
    },
  },
});
