import { ApiError } from '@/lib/api/errors';
import { nowStamp, today } from '@/lib/supplier/dates';
import master from '@/lib/domain/areas/master';
import type { Model, OptionCategory, Plan } from '@/lib/domain/types';
import { defineArea, type DocRepo } from '../core/area';
import {
  DEVICE_HEAD, deleteBlockedText, filterRows, ID_HEAD, indexOf, kubunOf, mainValue, nextId, num, planDerive, sortRows, tablesOf, validate, valuesOf,
  type SortKey, type Tables, type Values,
} from '../masters/logic';
import { analyze, applyRows, exportPlans, planDbOf, usedOf, valuesForNewPlan, writePlanDb, type PlanDb } from '../masters/planCsv';
import { DM, domainOf, extraOf, genName, gensFromTables, idsOf, putExtra, recOne, recsOf } from '../masters/fromDomain';
import { priceGenUse } from '@/lib/domain/bulk';
import type { MasterKind, MasterRec, VmLayout } from '../masters/types';
import { taxIdByLabel } from '@/lib/domain/tax';
import { inputOf, matOf, materialErrors, materialCtx, materialsOf, materialUse, materialWarehouses, nextMaterialId, patchOf, MATERIAL_COURSES, type MaterialInput } from '@/lib/domain/material';
import type { AuditLog, Material } from '@/lib/domain/types';
import { touchPresence } from '../core/presence';
import { assertFresh, nextVersion, versionOf } from '../core/concurrency';

/*
 * マスタ管理のうち、プランマスタ・機種マスタ・オプションマスタ・値引きマスタ・資材マスタ。
 * 元：部品/13_運営_機種プランマスタ.html・14_運営_オプション値引きマスタ.html（一覧＋詳細・編集・新規登録）
 *   - データは共通データ（dm.master.plans／models／options／discounts）。画面の形は lib/ops/masters/fromDomain.ts で作り、
 *     保存は共通データの master.update／master.create で書く。共通データにない項目の値（画面の値・表）は masters.extra に持つ
 *   - 削除は論理削除（共通データの状態＝削除済。一覧は既定で隠す・選択肢に出さない。課題 4-9）。使用中のプラン／オプション／値引きは削除できない（RV-OPS-20261002 O-b）
 *   - プランマスタは保存時のチェック（決定 28-178）と CSV取込・CSV出力（決定 28-183）
 *   - 資材マスタは一覧だけ上の仕組み（MasterRec）、詳細・登録・編集は専用（materialGet・createMaterial・saveMaterial。項目と決まりは lib/domain/material.ts）。
 *     削除は論理削除（共通データの状態＝削除済）。使用中（プランの初期備品・月の無料数量／未納品の資材注文／倉庫の資材在庫 > 0）は E259 で削除できない（共通データの master.update が止める）
 *   - 自販機の列の構成は共通データ（dm.master.vmLayouts。機種ID ごと）。名前・状態は機種マスタ（dm.master.models）。月間メニュー（menu の領域）も同じものを読む
 */

const KINDS: MasterKind[] = ['devices', 'plans', 'options', 'discounts', 'materials'];
const month = () => today().slice(0, 7).replace('/', '-');

const all = (repo: DocRepo, kind: MasterKind) => recsOf(repo, kind, month());
function must(repo: DocRepo, kind: MasterKind, id: string) {
  const r = recOne(repo, kind, id, month());
  if (!r) throw new ApiError(`${id} が見つかりません`, 404);
  return r;
}
const assertKind = (kind: string): MasterKind => {
  if (!KINDS.includes(kind as MasterKind)) throw new ApiError(`マスタの種類 ${kind} がありません`, 400);
  return kind as MasterKind;
};

/** 一覧に出す分（詳細の値は持たない） */
const lite = (r: MasterRec) => ({ id: r.id, name: r.name, row: r.row, badge: r.badge, deleted: !!r.deleted, system: !!r.system, use: r.use });
export type MasterRow = ReturnType<typeof lite>;

/** 保存の前のチェック（画面と同じ）。だめなら最初のエラーを返す */
function check(kind: MasterKind, values: Values, tables: Tables, mode: 'edit' | 'new') {
  const c = validate(kind, values, tables, mode);
  if (c.errs.length) throw new ApiError(c.box ? `保存できません（${c.errs.length}件）：${c.errs[0]}` : c.errs[0], 400);
}

/** 1件を書く：共通データの項目は dm.master.*、画面の値（共通データにない項目も含む）は masters.extra */
/** 操作したアカウント（変更履歴の変更者）。サーバーは lib/server/access.ts の gate がログイン中のアカウントを args.by に入れる。ないとき（ログインのない mock）は共通データの既定（system） */
type By = { by?: string };
const actorOf = (a: unknown): string | undefined => { const b = (a as By | null | undefined)?.by; return typeof b === 'string' && b ? b : undefined; };

function write(repo: DocRepo, kind: MasterKind, id: string, values: Values, tables: Tables, isNew: boolean, priceUsed?: MasterRec['priceUsed'], by?: string) {
  const cur = isNew ? undefined : repo.get<Record<string, unknown>>(`dm.master.${DM[kind]}`, id);
  const dom = domainOf(kind, values, tables, cur, (l) => taxIdByLabel(repo, l));
  /* プラン：価格プランの表（1行＝1世代）→ 価格世代と公開用の価格（台帳 F・受付簿 #95）。表に行がなければ、登録した料金を最初の世代にする */
  if (kind === 'plans') {
    const stub = { ...(cur ?? {}), ...dom, id } as Plan;
    const g = gensFromTables(repo, stub, values, tables, month());
    if (g.priceGens.length) { dom.priceGens = g.priceGens; dom.prices = g.prices; }
    else if (!stub.priceGens?.length) dom.priceGens = [{ id: `PG-${id}-01`, fromCycle: month(), prices: (stub.prices ?? []).map((x) => ({ ...x })), note: '登録時の料金', at: nowStamp(), by: '運営', public: true }];
  }
  if (isNew) master.actions.create(repo, { kind: DM[kind], data: { id, ...dom }, ...(by ? { by } : {}) });
  else master.actions.update(repo, { kind: DM[kind], id, patch: { ...dom, ...(kind === 'plans' ? { updatedAt: nowStamp() } : {}) }, ...(by ? { by } : {}) });
  /* プランの更新日（一覧の検索 E・hong 2026/10/05）：新規も保存の日時を持つ */
  if (isNew && kind === 'plans') { const p = repo.get<Plan>('dm.master.plans', id); if (p) repo.put<Plan>('dm.master.plans', id, { ...p, updatedAt: nowStamp() }); }
  putExtra(repo, kind, id, { values, tables, ...(priceUsed ? { priceUsed } : {}), ver: nextVersion(extraOf(repo, kind, id)?.ver) });
}
/** いまの版（同時更新の検知。lib/ops/core/concurrency.ts） */
const verNow = (repo: DocRepo, kind: MasterKind, id: string) => versionOf(extraOf(repo, kind, id)?.ver);

/** いまのプラン（CSV の形） */
const planDbs = (repo: DocRepo): Record<string, PlanDb> =>
  Object.fromEntries(all(repo, 'plans').filter((r) => !r.deleted).map((r) => [r.id, planDbOf(r, valuesOf('plans', r), tablesOf('plans', r))]));
/** CSV取込で使える機種（冷蔵庫・冷凍庫・自販機・資材ボックス） */
const models = (repo: DocRepo) => Object.fromEntries(all(repo, 'devices').filter((r) => !r.deleted && /^(RF|FZ|VM|BX)/.test(r.id)).map((r) => [r.id, r.name]));

function saveVm(repo: DocRepo, id: string, maker: string, lanes?: VmLayout['lanes']) {
  if (!lanes) return;
  master.actions.setVmLayout(repo, { id, maker, lanes });
}
/** 自販機の列の構成（共通データ）→ 画面の形（名前・状態は機種マスタ） */
export function vmView(repo: DocRepo, id: string): VmLayout | null {
  const v = master.queries.vmLayout(repo, { id });
  const m = repo.get<Model>('dm.master.models', id);
  if (!v || !m) return null;
  return { id, name: m.name, maker: v.maker, status: m.status, lanes: { W: v.lanes.W ?? [], S: v.lanes.S ?? [], B: v.lanes.B ?? [] } };
}
const vmViews = (repo: DocRepo) => master.queries.vmLayouts(repo).map((v) => vmView(repo, v.id)).filter((x): x is VmLayout => !!x);
/** 機種ID → 最大収納数（機種区分のパネルの「最大収納数（…）」の値。プランマスタの W03 に使う） */
/** オプション区分マスタ（並び順 → ID。終了も含む：既にその区分のオプションがあるため） */
const optionCategories = (repo: DocRepo) => repo.list<OptionCategory>('dm.master.optionCategories').sort((a, b) => a.sortNo - b.sortNo || a.id.localeCompare(b.id));
function modelCapacities(repo: DocRepo): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of all(repo, 'devices')) {
    if (r.deleted) continue;
    const values = valuesOf('devices', r), kb = kubunOf('devices', values) ?? '';
    const at = indexOf('devices').fields.find((x) => x.kpanel === kb && /^最大収納数/.test(x.f.name ?? ''));
    const n = at ? num(mainValue(at.f, values)) : NaN;
    if (!isNaN(n) && n > 0) out[r.id] = n;
  }
  return out;
}
/** 新しい ID（共通データの ID の続き） */
const newId = (repo: DocRepo, head: string, kind: MasterKind) => nextId(head, idsOf(repo, kind));

export default defineArea({
  name: 'masters',
  /* マスタ・自販機の列の構成は共通データ（dm.master.*） */
  seed: () => ({}),
  queries: {
    /** 編集中の知らせ（I02）。編集・新規でない詳細画面では呼ばない。読み取りだが記録を書く（lib/ops/core/presence.ts） */
    presence: (repo, a: { kind: MasterKind; id: string; accountId: string; name: string; leave?: boolean; now?: number }) =>
      touchPresence(repo, 'masters.presence', { entity: assertKind(a.kind), id: a.id, accountId: a.accountId, name: a.name, leave: a.leave, now: a.now }),
    /** 一覧。q＝検索条件（data-keys → 値）、hideDeleted＝削除済みを表示しない、sort＝並べ替え（省くと初期の並び。受付簿 #87） */
    list: (repo, a: { kind: MasterKind; q?: Record<string, string>; hideDeleted?: boolean; sort?: SortKey | null }) => {
      const kind = assertKind(a.kind);
      const recs = all(repo, kind);
      /* dyn のドロップダウンの選択肢（プラン：価格プランの世代名・標準貸出設備の機種名。削除済みでない行から） */
      const live = recs.filter((r) => !r.deleted);
      /* オプション区分マスタ（並び順 → ID）：オプションの検索の選択肢と、一覧の初期の並び（区分の並び順 → オプションID） */
      const cats = optionCategories(repo);
      const opts = kind === 'plans'
        ? { gen: [...new Set(live.flatMap((r) => (r.row.gen ?? '').split('／').filter(Boolean)))], equip: [...new Set(live.flatMap((r) => (r.row.equip ?? '').split('／').filter(Boolean)))] }
        : kind === 'options' ? { kind: cats.map((c) => c.name) }
          : kind === 'materials' ? { whq: materialWarehouses(repo).map((w) => w.name) } : {};
      return { rows: sortRows(kind, filterRows(kind, recs, a.q ?? {}, a.hideDeleted ?? true), a.sort, cats.map((c) => c.name)).map(lite), total: recs.length, opts };
    },
    /** 1件（共通データ＋画面の値） */
    get: (repo, a: { kind: MasterKind; id: string }) => {
      const kind = assertKind(a.kind);
      const r = recOne(repo, kind, a.id, month());
      if (!r) return null;
      /* プラン：価格世代（表の行）の情報：使っている子契約の数・直せるか・誤りの訂正の記録（PriceGens カードを表に統合・受付簿 #95） */
      const plan = kind === 'plans' ? repo.get<Plan>('dm.master.plans', a.id) : undefined;
      const gens = plan ? priceGenUse(repo, plan).map((g) => ({ id: g.id, name: genName(g), fromCycle: g.fromCycle, used: g.used, editable: g.editable, why: g.why, public: !!g.public, prices: g.prices, fixes: g.fixes ?? [], at: g.at, by: g.by })) : [];
      return { rec: lite(r), fill: r.fill ?? null, saved: !!r.values, values: valuesOf(kind, r), tables: tablesOf(kind, r), gens, courses: plan ? plan.prices.map((x) => x.course) : [], version: verNow(repo, kind, a.id) };
    },
    /**
     * 価格世代の名前（全プラン・古い順・重複なし）。プランマスタの新規登録で価格プランの表の初期の行にする（受付簿 #105）。
     * on＝false のときは読まない（新規登録のときだけ使う）
     */
    planGenNames: (repo, a?: { on?: boolean }) => {
      if (!a?.on) return [] as string[];
      const seen = new Map<string, string>();
      for (const p of repo.list<Plan>('dm.master.plans').filter((x) => x.status !== '削除済')) {
        for (const g of p.priceGens ?? []) { const name = g.note.replace(/（.*$/, '').trim() || g.id; if (!seen.has(name) || seen.get(name)! > g.fromCycle) seen.set(name, g.fromCycle); }
      }
      return [...seen.entries()].sort((x, y) => x[1].localeCompare(y[1])).map(([n]) => n);
    },
    /** オプション区分マスタの選択肢（使用中・並び順 → ID）。オプションマスタの「オプション区分」のドロップダウン（受付簿 #117） */
    optionCategories: (repo) => optionCategories(repo).filter((c) => c.status === '使用中').map((c) => c.name),
    /** 機種ID → 最大収納数（プランマスタの保存時の警告 W03。on＝プランマスタのときだけ読む） */
    modelCapacities: (repo, a?: { on?: boolean }) => (a?.on ? modelCapacities(repo) : ({} as Record<string, number>)),
    /** 自販機の列の構成（機種ID） */
    vmLayout: (repo, a: { id: string }) => vmView(repo, a.id),
    /** 自販機の列の構成（全部。月間メニューなどが読む） */
    vmLayouts: (repo) => vmViews(repo),
    /** 資材1件（詳細・編集）：項目・使用状況（E259 の {n}{m}{k} と同じ数え方）・変更履歴・版（同時更新の検知 E31） */
    materialGet: (repo, a: { id: string }) => {
      const raw = repo.get<Material>('dm.master.materials', a.id);
      if (!raw) return null;
      const m = matOf(raw);
      const who = (id: string) => repo.get<{ name: string }>('dm.account.accounts', id)?.name ?? id;
      /* 変更履歴は P-HIST の列。1回の保存＝1行（項目・変更前・変更後は行の中に並べる）。古い記録（items なし）は変更内容の文を項目に出し、前後は「—」 */
      const hist = repo.list<AuditLog>('dm.account.audit').filter((x) => x.target === `materials:${a.id}`).reverse().map((h) => {
        const csv = /CSV/.test(h.accountId);
        const items = h.items?.length ? h.items : [{ field: h.detail === 'データ登録' ? '—' : h.detail, before: '—', after: '—' }];
        const op = csv ? 'CSV取込' : h.detail === 'データ登録' ? '登録' : items.some((x) => x.field === '状態' && x.after === '削除済') ? '削除' : '変更';
        return { at: h.at, by: csv ? h.accountId : who(h.accountId), op, items, reason: h.reason ?? '' };
      });
      return { m, input: inputOf(m), use: materialUse(repo, a.id), hist, version: versionOf(raw.ver) };
    },
    /** 資材の使用状況（削除できるか。E259 の件数） */
    materialUse: (repo, a: { id: string }) => materialUse(repo, a.id),
    /** 資材の登録・編集の選択肢：コース・取扱倉庫（倉庫区分「ピッキング倉庫（資材）」・有効）・ほかの資材の名前（重複 E09）・次の資材ID */
    materialOpts: (repo, a?: { id?: string }) => ({
      courses: MATERIAL_COURSES as string[], warehouses: materialWarehouses(repo).map((w) => ({ id: w.id, name: w.name })), ctx: materialCtx(repo, a?.id),
      nextId: nextMaterialId(repo), names: materialsOf(repo).map((m) => ({ id: m.id, name: m.name })),
    }),
    /** プランマスタ：CSV取込の確認（確定までデータは変えない） */
    planCsvPreview: (repo, a: { text: string }) => analyze(a.text, planDbs(repo), models(repo)),
    /** プランマスタ：CSV出力（取込と同じ形式） */
    planCsvExport: (repo) => exportPlans(Object.entries(planDbs(repo))),
  },
  actions: {
    /** 資材の登録。ID は S＋3桁の続き番号。項目のチェックは画面と同じ（lib/domain/material.ts の materialErrors） */
    createMaterial: (repo, a: { kind: 'materials'; data: MaterialInput } & By) => {
      const first = Object.values(materialErrors(a.data, materialCtx(repo)))[0];
      if (first) throw new ApiError(first, 400);
      const id = nextMaterialId(repo);
      master.actions.create(repo, { kind: 'materials', data: { id, ...patchOf(a.data) }, ...(actorOf(a) ? { by: actorOf(a) } : {}) });
      return { id, version: versionOf(repo.get<Material>('dm.master.materials', id)?.ver) };
    },
    /** 資材の保存（編集）。削除済は編集できない（E36）・読み込んだ版と違えば E31（force＝上書き） */
    saveMaterial: (repo, a: { kind: 'materials'; id: string; data: MaterialInput; baseVersion?: string; force?: boolean } & By) => {
      const cur = repo.get<Material>('dm.master.materials', a.id);
      if (!cur) throw new ApiError(`${a.id} が見つかりません`, 404);
      if (matOf(cur).status === '削除済') throw new ApiError('削除済みのため編集できません。', 400);
      assertFresh(versionOf(cur.ver), a.baseVersion, a.force);
      const first = Object.values(materialErrors(a.data, materialCtx(repo, a.id)))[0];
      if (first) throw new ApiError(first, 400);
      const next = master.actions.update(repo, { kind: 'materials', id: a.id, patch: patchOf(a.data), ...(actorOf(a) ? { by: actorOf(a) } : {}) });
      return { id: a.id, version: versionOf((next as Material).ver) };
    },
    /** 保存（編集） */
    save: (repo, a: { kind: MasterKind; id: string; values: Values; tables: Tables; lanes?: VmLayout['lanes']; baseVersion?: string; force?: boolean } & By) => {
      const kind = assertKind(a.kind);
      if (kind === 'materials') throw new ApiError('資材は saveMaterial で保存します', 400);
      const r = must(repo, kind, a.id);
      if (r.deleted) throw new ApiError('削除済みのため編集できません', 400);
      /* 同時更新（E31）：読み込んだ版と違えば 409 STALE。force＝上書きして保存 */
      assertFresh(verNow(repo, kind, r.id), a.baseVersion, a.force);
      let { values, tables } = a;
      if (kind === 'plans') ({ values, tables } = planDerive(values, tables));
      check(kind, values, tables, 'edit');
      write(repo, kind, r.id, values, tables, false, undefined, actorOf(a));
      const next = must(repo, kind, r.id);
      if (kind === 'devices' && /^VM/.test(r.id)) saveVm(repo, r.id, String(next.row.maker ?? ''), a.lanes);
      return { id: r.id, version: verNow(repo, kind, r.id) };
    },
    /** 新規登録。ID は登録時に採番（機種は機種区分の2文字 ＋6桁） */
    create: (repo, a: { kind: MasterKind; values: Values; tables: Tables; lanes?: VmLayout['lanes'] } & By) => {
      const kind = assertKind(a.kind);
      if (kind === 'materials') throw new ApiError('資材は createMaterial で登録します', 400);
      let { values, tables } = a;
      if (kind === 'plans') ({ values, tables } = planDerive(values, tables));
      check(kind, values, tables, 'new');
      const head = kind === 'devices' ? DEVICE_HEAD[kubunOf(kind, values) ?? ''] ?? ID_HEAD.devices : ID_HEAD[kind];
      const id = newId(repo, head, kind);
      /* ID の欄に採番した ID を入れる */
      for (const [k, v] of Object.entries(values)) if (v[0] === '（登録時に採番）') values[k] = [id, ...v.slice(1)];
      write(repo, kind, id, values, tables, true, undefined, actorOf(a));
      const rec = must(repo, kind, id);
      if (kind === 'devices' && /^VM/.test(id)) saveVm(repo, id, String(rec.row.maker ?? ''), a.lanes);
      return { id };
    },
    /** 削除（論理削除）。使用中は削除できない。共通データの状態を削除済にする（オプション・値引きも削除済。課題 4-9：一覧・選択肢には既定で出さない） */
    remove: (repo, a: { kind: MasterKind; id: string } & By) => {
      const kind = assertKind(a.kind);
      const r = must(repo, kind, a.id);
      /* 資材：使用中（プラン・未納品の資材注文・資材在庫のある倉庫）は E259 で止まる（共通データの master.update が確かめる） */
      if (kind === 'materials') {
        master.actions.update(repo, { kind: 'materials', id: r.id, patch: { status: '削除済' }, ...(actorOf(a) ? { by: actorOf(a) } : {}) });
        return { id: r.id };
      }
      if (r.system) throw new ApiError('システム定義のため削除できません', 400);
      if (r.use > 0) throw new ApiError(deleteBlockedText(r.use), 400);
      const status = '削除済';
      master.actions.update(repo, { kind: DM[kind], id: r.id, patch: { status }, ...(actorOf(a) ? { by: actorOf(a) } : {}) });
      putExtra(repo, kind, r.id, { ...(extraOf(repo, kind, r.id) ?? {}), deleted: true, ver: nextVersion(extraOf(repo, kind, r.id)?.ver) });
      return { id: r.id };
    },
    /** プランマスタ：CSV取込の確定。エラーのないプランだけ取り込み、仮キーは採番する */
    planCsvCommit: (repo, a: { text: string } & By) => {
      const res = analyze(a.text, planDbs(repo), models(repo));
      if (res.fatal) throw new ApiError(res.fatal, 400);
      const ok = res.plans.filter((p) => !p.errors.length);
      if (!ok.length) throw new ApiError('取り込めるプランがありません', 400);
      const news: string[] = [];
      for (const p of ok) {
        if (p.isNew) {
          const id = newId(repo, 'ES', 'plans');
          news.push(`${p.key} → ${id}`);
          const db = applyRows(a.text, p.key, null);
          const { values, tables } = valuesForNewPlan(db);
          const fid = Object.keys(values).find((k) => values[k][0] === '（登録時に採番）');
          if (fid) values[fid] = [id];
          write(repo, 'plans', id, values, tables, true, usedOf(db), actorOf(a));
        } else {
          const r = must(repo, 'plans', p.key);
          const cur = planDbOf(r, valuesOf('plans', r), tablesOf('plans', r));
          const db = applyRows(a.text, p.key, cur);
          const { values, tables } = writePlanDb(valuesOf('plans', r), tablesOf('plans', r), db);
          write(repo, 'plans', r.id, values, tables, false, usedOf(db), actorOf(a));
        }
      }
      return { message: `取り込みました：${ok.length}プラン` + (news.length ? `（採番 ${news.join('、')}）` : ''), ids: ok.map((p) => p.key) };
    },
  },
});
