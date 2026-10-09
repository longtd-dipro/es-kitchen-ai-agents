import { ApiError } from '@/lib/api/errors';
import { grantsOf, permsOf } from '@/lib/domain/areas/account';
import type { Account, Branch, Contract, Perm, Role, Site } from '@/lib/domain/types';
import type { DocRepo } from '@/lib/ops/core/area';
import { DEMO } from '@/lib/demo';
import { OPS_ROLES } from '@/lib/domain/seed/account';
import { can, FEATURE, OP_LABEL, type Grants, type PermOp } from '@/lib/ops/permissions';
import { ruleOf } from '@/lib/ops/apiPerm';
import { sessionId } from './session';

/*
 * API の権限（6-1）：ログイン中のアカウントが、自分の範囲のデータだけ読める・書けるようにする（サーバー側）。
 *
 *   1. どのサイトから呼んだか：ヘッダー x-es-site（lib/api/site.ts）。ログインはそのサイトの Cookie（lib/server/session.ts）
 *   2. サイトごとに呼んでよい API を決める（下の表にないものは 403）
 *   3. 「自分」を表す引数（法人Web の who・acc・acct・corpId・branchId、委託配送先Web の company、ドライバーの staff …）は
 *      画面が送った値を使わず、ログイン中のアカウントの値で上書きする。ID を指定する引数は自分の範囲か確かめる
 *   4. 運営Web は役割の権限（機能ごとに許す操作：lib/ops/permissions.ts）。API → 機能・操作は lib/ops/apiPerm.ts（参照のみのアカウントは書き換え不可）
 *
 * 呼べる API の表は、各サイトの画面が実際に呼んでいるものだけ。画面に新しい呼び出しを足したら、ここにも足す。
 */

export type Call = { kind: 'domain' | 'ops'; area: string; op: string; action: boolean; args: unknown };

/** ログイン中のアカウントと見てよい範囲 */
export type Principal = {
  site: Site;
  account: Account;
  perms: Record<string, Perm>;
  /** 運営：機能ごとに許す操作（役割の足し算） */
  grants: Grants;
  readOnly: boolean;
  /** 法人Web：法人ID・見てよい拠点（拠点アカウントは自分の拠点だけ）・拠点アカウントの拠点 */
  corpId?: string;
  branchIds?: string[];
  branchId?: string;
  role?: 'admin' | 'branch' | 'trial';
  carrierId?: string;
  driverId?: string;
  supplierId?: string;
};

const CAN_LOGIN: Account['status'][] = ['有効', '発行済（ログイン前）', '参照のみ'];
const SITES: Site[] = ['ops', 'corp', 'carrier', 'driver', 'supplier'];

export const siteOf = (req: Request): Site | null => {
  const s = req.headers.get('x-es-site') as Site | null;
  return s && SITES.includes(s) ? s : null;
};

const deny = (msg = 'この操作の権限がありません') => new ApiError(msg, 403);
const needLogin = () => new ApiError('ログインしてください（ログインの有効期限が切れた場合は、もう一度ログインしてください）', 401);

/** Cookie のアカウントを共通データで確かめ、見てよい範囲を作る（止めたアカウント・サイト違いは null） */
export async function principalOf(repo: DocRepo, site: Site | null): Promise<Principal | null> {
  if (!site) return null;
  upgradeOpsRoles(repo);
  const id = await sessionId(site);
  if (!id) return null;
  const account = repo.get<Account>('dm.account.accounts', id);
  /* システム管理（SY…）は運営Web の役割：運営Web では入れる（台帳 R・受付簿 #418） */
  if (!account || (account.site !== site && !(site === 'ops' && account.site === 'sysadmin')) || !CAN_LOGIN.includes(account.status)) return null;
  const p: Principal = { site, account, perms: permsOf(repo.list<Role>('dm.account.roles'), account), grants: site === 'ops' ? grantsOf(repo.list<Role>('dm.account.roles'), account) : {}, readOnly: account.status === '参照のみ' };
  const sc = account.scope;
  const branches = () => repo.list<Branch>('dm.org.branches');
  if (sc.type === 'corp') {
    p.corpId = sc.corpId;
    p.branchIds = branches().filter((b) => b.corpId === sc.corpId).map((b) => b.id);
    const kinds = repo.list<Contract>('dm.org.contracts').filter((c) => p.branchIds!.includes(c.branchId)).map((c) => c.kind);
    p.role = kinds.length > 0 && kinds.every((k) => k === 'お試しキャンペーン') ? 'trial' : 'admin';
  } else if (sc.type === 'branch') {
    const b = repo.get<Branch>('dm.org.branches', sc.branchId);
    if (!b?.corpId) return null;
    Object.assign(p, { corpId: b.corpId, branchId: b.id, branchIds: [b.id], role: 'branch' });
  } else if (sc.type === 'carrier') p.carrierId = sc.carrierId;
  else if (sc.type === 'driver') Object.assign(p, { driverId: sc.driverId, carrierId: sc.carrierId });
  else if (sc.type === 'supplier') p.supplierId = sc.supplierId;
  return p;
}

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => !!v && typeof v === 'object' && !Array.isArray(v);
const key = (c: Call) => `${c.kind}:${c.area}.${c.op}`;

/* ================= ログインしなくても呼べるもの ================= */

/** ログイン・新規のお申し込み（ログイン前の画面）。DEMO はアカウントの切替のための一覧も */
const PUBLIC = new Set([
  'domain:account.signIn', 'domain:account.verifyOtp', 'ops:driver.login', 'ops:driver.requestReset', 'ops:driver.verifyReset', 'ops:driver.setPassword',
  'ops:corp-docs.applyMaster', 'ops:corp-docs.submitApply', 'ops:carrier.apply',
]);
const PUBLIC_DEMO = new Set(['ops:driver.staffList', 'domain:account.list']);

/** 全サイトの画面が読む共通のもの（ログインしていれば） */
const COMMON_READ = new Set<string>([]);

/* ================= 法人Web ================= */

const CORP_AREAS = new Set(['corp-delivery', 'corp-docs', 'corp-order', 'corp-sites']);
/** 参照のみ（解約後）の法人Web でもできる操作：お問い合わせ・棚卸報告（台帳 E「法人Web 解約後（参照のみ）にできること」） */
const CORP_RO_ACTIONS = new Set(['domain:notice.sendInquiry', 'ops:corp-docs.fileStock']);
const CORP_DOMAIN = new Set(['account.list', 'apply.closeInfo', 'delivery.forCorp', 'notice.inquiries', 'notice.sendInquiry', 'org.branch', 'org.corp']);
const isId = (v: unknown): v is string => typeof v === 'string' && /^[A-Z]{2}\d{3,}$/.test(v);

/** 法人Web の引数：自分（who・acc・acct・corpId・branchId）を上書きし、拠点の指定（site・sites・id）を確かめる */
function scopeCorp(p: Principal, c: Call): unknown {
  const a: Obj = isObj(c.args) ? { ...c.args } : {};
  const own = (b: unknown) => isId(b) && p.branchIds!.includes(b);
  const me = (v: Obj) => {
    const x: Obj = { ...v, corpId: p.corpId, role: p.role };
    if (p.branchId) x.branchId = p.branchId;
    else if (x.branchId !== undefined && x.branchId !== null && x.branchId !== '' && !own(x.branchId)) throw deny('この拠点のデータは見られません');
    return x;
  };
  for (const k of ['who', 'acc', 'acct']) if (isObj(a[k])) a[k] = me(a[k] as Obj);
  if ('corpId' in a || 'branchId' in a) Object.assign(a, me(a));
  /* site は拠点ID（法人の分を指すときは法人ID） */
  if (isId(a.site) && !own(a.site) && a.site !== p.corpId) throw deny('この拠点のデータは見られません');
  if (isId(a.branchId) && !own(a.branchId)) throw deny('この拠点のデータは見られません');
  if (Array.isArray(a.sites) && a.sites.some((s) => isId(s) && !own(s))) throw deny('この拠点のデータは見られません');
  if (c.kind === 'domain') {
    if (c.op === 'branch' && !own(a.id)) throw deny('この拠点のデータは見られません');
    if (c.op === 'corp' && (a.id !== p.corpId || p.branchId)) throw deny('この法人のデータは見られません');
    if (c.area === 'account' && c.op === 'list') a.site = 'corp';
    if (c.op === 'sendInquiry') a.accountId = p.account.loginId;
  }
  return a;
}

/* ================= 委託配送先Web・ドライバー ================= */

/** 委託配送先Web が呼ぶ共通データ（carrierId を自社で上書き） */
const CARRIER_DOMAIN = new Set(['carrier.monthly']);

/* ================= CSV（法人Web・委託配送先Web・仕入先） ================= */

/** サイトごとに取込・出力してよい CSV（lib/csv の entity）と、出力だけの一覧（records）で読んでよい文書 */
const CSV_ENTITIES: Partial<Record<Site, string[]>> = { carrier: ['carrierStaff'], supplier: ['supplierAnswers'] };
const CSV_RECORDS: Partial<Record<Site, string[]>> = { corp: ['dm.billing.invoices', 'dm.app.purchases'] };

/** CSV の引数：範囲（scope）・操作した人（by）を自分にし、種類・文書を確かめる */
function scopeCsv(repo: DocRepo, p: Principal, c: Call): unknown {
  const a: Obj = isObj(c.args) ? { ...c.args } : {};
  const scope = p.site === 'corp' ? { site: 'corp', corpId: p.corpId, ...(p.branchId ? { branchId: p.branchId } : {}) }
    : p.site === 'supplier' ? { site: 'supplier', supplierId: p.supplierId } : { site: p.site, carrierId: p.carrierId };
  const okEntity = (e: unknown) => (CSV_ENTITIES[p.site] ?? []).includes(String(e));
  switch (c.op) {
    case 'template': case 'export':
      if (!okEntity(a.entity)) throw deny();
      return { ...a, scope: { ...(isObj(a.scope) ? a.scope : {}), ...scope } };
    case 'importPreview':
      if (!okEntity(a.entity) || p.readOnly) throw deny();
      return { ...a, scope: { ...(isObj(a.scope) ? a.scope : {}), ...scope }, by: p.account.id };
    case 'importCommit': {
      const pv = repo.get<{ by: string }>('dm.csv.previews', String(a.token));
      if (!okEntity(a.entity) || p.readOnly || !pv || pv.by !== p.account.id) throw deny();
      return a;
    }
    case 'jobStep': {
      const j = repo.get<{ importId: string }>('dm.csv.jobs', String(a.id));
      const log = j && repo.get<{ by: string }>('dm.csv.imports', j.importId);
      if (!log || log.by !== p.account.id) throw deny();
      return a;
    }
    case 'logExport':
      return { ...a, site: p.site, by: p.account.loginId };
    case 'records': {
      if (!(CSV_RECORDS[p.site] ?? []).includes(String(a.kind))) throw deny();
      /* 自分の法人・拠点の文書だけ（ほかは渡さない） */
      const ids = (Array.isArray(a.ids) ? a.ids : []).filter((id) => {
        const d = repo.get<{ corpId?: string; branchId?: string | null }>(String(a.kind), String(id));
        if (!d) return false;
        if (a.kind === 'dm.billing.invoices') return d.corpId === p.corpId && (!p.branchId || !d.branchId || d.branchId === p.branchId);
        return !!d.branchId && p.branchIds!.includes(d.branchId);
      });
      /* 拠点アカウントは、法人あての請求書でも自分の拠点の明細だけ（ほかの拠点の明細を CSV に出さない）。sites＝請求書番号→見てよい拠点 */
      const branchOnly = p.branchId && a.kind === 'dm.billing.invoices'
        ? Object.fromEntries(ids.filter((id) => !repo.get<{ branchId?: string | null }>(String(a.kind), String(id))?.branchId).map((id) => [String(id), p.branchId]))
        : undefined;
      return { ...a, ids, ...(branchOnly ? { onlyBranch: branchOnly } : {}) };
    }
    default:
      throw deny();
  }
}

/* ================= 運営Web（役割の権限：機能ごとの操作） ================= */

/** 運営Web の領域（法人Web・委託配送先Web・ドライバーの領域は運営Web からは呼ばない） */
const OPS_AREAS = new Set(['applications', 'billing', 'contracts', 'delivery', 'general', 'masters', 'menu', 'purchasing', 'reviews']);
/** 書き換えの操作者（args.by）をログイン中のアカウントにする運営Web の領域（contracts は上の gate で別に入れる） */
const ACTOR_AREAS = new Set(['general', 'purchasing', 'menu', 'applications', 'billing', 'delivery', 'masters']);

/** 役割の grants（見本の役割が grants を持つ前の DB は、見本の値を入れる・lib/domain/seed/account.ts の OPS_ROLES） */
let rolesUpgraded = false;
function upgradeOpsRoles(repo: DocRepo) {
  if (rolesUpgraded) return;
  rolesUpgraded = true;
  for (const seed of OPS_ROLES) {
    const cur = repo.get<Role>('dm.account.roles', seed.id);
    if (!cur) repo.put('dm.account.roles', seed.id, seed);
    else if (!cur.grants) repo.put('dm.account.roles', seed.id, { ...cur, name: seed.name, note: seed.note, grants: seed.grants });
  }
}

/** 運営Web：機能の操作ができるか（閲覧は alsoRead の機能の閲覧でもよい）。参照のみのアカウントは書き換え不可 */
export function checkOps(p: Principal, feature: string, op: PermOp, alsoRead: string[] = []) {
  if (op !== 'read' && op !== 'csvExport' && p.readOnly) throw deny('参照のみのアカウントは変更できません');
  if (can(p.grants, feature, op)) return;
  if (op === 'read' && alsoRead.some((f) => can(p.grants, f, 'read'))) return;
  const f = FEATURE[feature]?.label ?? feature;
  throw deny(op === 'read' ? `この画面を見る権限がありません（${f}）` : `この操作の権限がありません（${f}：${OP_LABEL[op]}）`);
}

/* ================= 入口 ================= */

/**
 * API を呼んでよいか確かめ、ログイン中のアカウントの範囲に合わせた引数を返す。
 * 戻り値の filter は結果を自分の範囲に絞る（ないときはそのまま）
 */
export function gate(repo: DocRepo, p: Principal | null, site: Site | null, c: Call): { args: unknown; filter?: (out: unknown) => unknown } {
  const k = key(c);
  const short = `${c.area}.${c.op}`;
  /* 開発用の確認（check.run など）は本番以外ならだれでも */
  if (c.kind === 'domain' && c.area === 'check' && process.env.NODE_ENV !== 'production') return { args: c.args };
  if (PUBLIC.has(k) || (DEMO && PUBLIC_DEMO.has(k))) {
    /* ログインは、呼んだサイトのアカウントだけ */
    if ((k === 'domain:account.signIn' || k === 'domain:account.verifyOtp') && isObj(c.args) && c.args.site !== site) throw deny();
    return { args: c.args };
  }
  if (!p) throw needLogin();
  if (p.site !== site) throw deny();
  if (COMMON_READ.has(k) && !c.action) return { args: c.args };
  if (c.action && p.readOnly && p.site !== 'corp' && p.site !== 'ops') throw deny('参照のみのアカウントは変更できません');

  switch (p.site) {
    case 'ops': {
      if (c.kind === 'ops' && !OPS_AREAS.has(c.area)) throw deny();
      const r = ruleOf(c.kind, c.area, c.op, c.action, c.args);
      if (r === 'any') { if (c.action && p.readOnly && c.op !== 'logExport') throw deny('参照のみのアカウントは変更できません'); }
      else checkOps(p, r.feature, r.op, r.alsoRead);
      /* 自分の権限はログイン中のアカウントの分だけ。アカウント・権限の変更の記録（by）はログイン中のアカウント */
      if (k === 'domain:account.me') return { args: { id: p.account.id } };
      if (c.kind === 'domain' && c.area === 'account' && c.action && isObj(c.args) && 'by' in c.args) return { args: { ...c.args, by: p.account.id } };
      /* 法人・契約管理の書き換えの操作者（履歴・操作の記録の by）も、画面から来た値は使わずログイン中のアカウント */
      if (c.kind === 'ops' && c.area === 'contracts' && c.action && isObj(c.args)) return { args: { ...c.args, by: p.account.id } };
      /* マスタ・アカウント・設定・代理・紹介（general）・発注・入荷（purchasing）・メニュー・注文（menu）・契約申請（applications）・請求（billing）・
         配送（delivery）・マスタ管理（masters）の書き換えの操作者（変更履歴の変更者・承認した人）も同じ。
         各領域は args.by を使い、ないとき（ログインのない mock）だけ既定のアカウント */
      if (c.kind === 'ops' && ACTOR_AREAS.has(c.area) && c.action && (isObj(c.args) || c.args == null)) return { args: { ...(isObj(c.args) ? c.args : {}), by: p.account.id } };
      return { args: c.args };
    }
    case 'corp': {
      if (c.kind === 'domain' && c.area === 'csv') return { args: scopeCsv(repo, p, c) };
      if (!(c.kind === 'ops' ? CORP_AREAS.has(c.area) : CORP_DOMAIN.has(short))) throw deny();
      /* 参照のみ（解約後）は見るだけ（お問い合わせと、最終請求書の在庫差額のための棚卸報告だけできる：台帳 E 2026-10-05） */
      if (c.action && p.readOnly && !CORP_RO_ACTIONS.has(k)) throw deny('参照のみのアカウントは変更できません');
      const args = scopeCorp(p, c);
      /* アカウントの一覧は自分の法人・拠点のものだけ（拠点アカウントは自分だけ） */
      if (k === 'domain:account.list') {
        const mine = new Set(p.branchId ? [p.branchId] : [p.corpId, ...p.branchIds!]);
        return { args, filter: (out) => (out as Account[]).filter((x) => mine.has(x.id)) };
      }
      return { args };
    }
    case 'carrier': {
      if (c.kind === 'domain' && c.area === 'csv') return { args: scopeCsv(repo, p, c) };
      if (c.kind === 'ops' && c.area === 'carrier') return { args: { ...(isObj(c.args) ? c.args : {}), company: p.carrierId } };
      if (c.kind === 'domain' && CARRIER_DOMAIN.has(short)) return { args: { ...(isObj(c.args) ? c.args : {}), carrierId: p.carrierId } };
      throw deny();
    }
    case 'supplier':
      /* 仕入先サイトは自分の API（app/api/supplier）を使う。共通データは CSV（受注の回答の取込）だけ */
      if (c.kind === 'domain' && c.area === 'csv') return { args: scopeCsv(repo, p, c) };
      throw deny();
    case 'driver': {
      if (c.kind === 'ops' && c.area === 'driver') return { args: { ...(isObj(c.args) ? c.args : {}), staff: p.driverId } };
      throw deny();
    }
    default:
      throw deny();
  }
}

/** 運営Web の発注・入荷の API（app/api/ops/orders）：運営のログインと役割の権限（発注管理・入荷管理） */
export async function requireOps(req: Request, repo: DocRepo, feature: string, op: PermOp, alsoRead: string[] = []) {
  const site = siteOf(req);
  const p = await principalOf(repo, site);
  if (!p) throw needLogin();
  if (p.site !== 'ops') throw deny();
  checkOps(p, feature, op, alsoRead);
  return p;
}
