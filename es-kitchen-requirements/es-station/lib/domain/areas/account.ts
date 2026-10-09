import { ApiError } from '@/lib/api/errors';
import { randomCode } from '@/lib/auth/rules';
import { defineArea, toDocs, type DocRepo } from '@/lib/ops/core/area';
import { nowStamp } from '@/lib/supplier/dates';
import { DEMO } from '@/lib/demo';
import { assertFresh, nextVersion, versionOf } from '@/lib/ops/core/concurrency';
import { codeHashOf, issueResetCode, maskMail } from '../driverAuth';
import { notify } from '../notify';
import { can, FEATURE, mergeGrants, type Grants } from '@/lib/ops/permissions';
import { ACCOUNTS, APP_VERSIONS, AUDIT, IP_RULES, LOGIN_HISTORY, ROLES, SITE_SETTINGS } from '../seed/account';
import type { Account, AppVersion, AuditLog, IpRule, LoginOtp, LoginRecord, Role, Site, SiteSetting } from '../types';

/*
 * アカウント・権限（area: account）。システム管理サイトはここを読み書きする。
 * kind：account.accounts／roles／ipRules／siteSettings／audit
 * 書き換えは必ず by（操作したアカウント）を渡し、操作の記録（audit）に残す。
 */

const accounts = (r: DocRepo) => r.list<Account>('dm.account.accounts');
const allRoles = (r: DocRepo) => r.list<Role>('dm.account.roles');
/** 削除済みでない役割（付与・権限の計算・重複チェックはこちら） */
const roles = (r: DocRepo) => allRoles(r).filter((x) => x.status !== '削除済');
const getAcc = (r: DocRepo, id: string) => {
  const a = r.get<Account>('dm.account.accounts', id);
  if (!a) throw new ApiError(`アカウントが見つかりません（${id}）`, 404);
  return a;
};

/** 操作の記録を残す（委託配送先Web のスタッフの変更履歴もここに書く） */
export function log(r: DocRepo, by: string, action: string, target: string, detail: string, site?: Site, more: Pick<AuditLog, 'items' | 'reason'> = {}) {
  const n = r.list('dm.account.audit').length + 1;
  const id = `AU-${String(n).padStart(4, '0')}`;
  r.put<AuditLog>('dm.account.audit', id, { id, at: nowStamp(), accountId: by, site: site ?? r.get<Account>('dm.account.accounts', by)?.site ?? 'sysadmin', action, target, detail, ...more });
}

/** 運営で「権限付与」の編集ができる有効なアカウント（0人にしない：役割を直せる人がいなくなる） */
const grantEditors = (r: DocRepo) => accounts(r).filter((a) => a.site === 'ops' && a.status === '有効' && can(grantsOf(roles(r), a), 'grant', 'update'));
const keepGrantEditor = (r: DocRepo) => {
  if (!grantEditors(r).length) throw new ApiError('「権限付与」を編集できる運営のアカウントが1人もいなくなるため、この変更はできません', 409);
};

/** 有効なシステム管理者（最後の1人は止めない・役割を外さない） */
const activeAdmins = (r: DocRepo) => accounts(r).filter((a) => a.roleIds.includes('sysadmin.admin') && a.status === '有効');

/** IPv4 が CIDR に入るか */
export function inCidr(ip: string, cidr: string) {
  const [net, bits = '32'] = cidr.split('/');
  const n = (x: string) => x.split('.').reduce((a, b) => (a << 8) + Number(b), 0) >>> 0;
  const mask = Number(bits) === 0 ? 0 : (~0 << (32 - Number(bits))) >>> 0;
  return (n(ip) & mask) === (n(net) & mask);
}

/** IPアドレス（CIDR 可）を確かめて、/32 を付けた値にする（E263・E264。追加・編集で同じ） */
function ipValue(cidr: string) {
  const v = (cidr ?? '').trim();
  const m = v.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})(?:\/(\d{1,2}))?$/);
  if (!m || m.slice(1, 5).some((x) => +x > 255) || (m[5] && +m[5] > 32)) throw new ApiError('IPアドレスの形式が正しくありません。', 400);
  if (['127', '0'].includes(m[1]) || (m[1] === '169' && m[2] === '254')) throw new ApiError('このIPアドレスは登録できません。', 400);
  return m[5] ? v : `${v}/32`;
}

/** ログインできる状態 */
const CAN_LOGIN: Account['status'][] = ['有効', '発行済（ログイン前）', '参照のみ'];

/* ---------------- 運営Web：IP ホワイトリスト外のログインの認証コード（OTP・受付簿 #61） ---------------- */
const OTPS = 'dm.account.otps';
/** 4桁・5分（台帳 K・F 2026-10-07/08）。入力回数の上限はなく、間違えてもコードは無効にしない（有効期限の5分だけ。アカウントもロックしない） */
export const OTP_MINUTES = 5;
const liveOtp = (r: DocRepo, accountId: string) => r.list<LoginOtp>(OTPS).find((x) => x.accountId === accountId && !x.usedAt && x.expiresMs > Date.now());
/** 認証コードを作ってメールで送る（前のコードは無効に）。DEMO ではコードを返して画面のトーストで見せる */
function issueLoginOtp(r: DocRepo, acc: Account, ip: string) {
  r.list<LoginOtp>(OTPS).filter((x) => x.accountId === acc.id && !x.usedAt).forEach((x) => r.put(OTPS, x.id, { ...x, usedAt: nowStamp() }));
  const code = randomCode();
  const id = `OTP-${acc.id}-${Date.now()}`;
  r.put<LoginOtp>(OTPS, id, { id, site: acc.site, accountId: acc.id, codeHash: codeHashOf(acc.id, code), ip, issuedAt: nowStamp(), expiresMs: Date.now() + OTP_MINUTES * 60000, usedAt: '' });
  notify(r, {
    to: { site: acc.site, accountId: acc.id, role: '' }, channels: ['mail'], templateId: 'ops_login_otp', link: { type: '', id: '' },
    title: '運営Web ログインの認証コード',
    body: `${acc.name} 様\n登録されていない接続元（${ip}）から運営Web へのログインがありました。本人の操作であれば、次の認証コードをログイン画面に入れてください。\n認証コード：${code}（${OTP_MINUTES}分間有効）\n心当たりがない場合は、このメールを破棄し、システム管理にご連絡ください。`,
  });
  if (process.env.NODE_ENV !== 'production') console.info(`[ops] ログインの認証コード（メールは仮）：${acc.id} → ${acc.email}：${code}`);
  return { sentTo: maskMail(acc.email), devCode: DEMO ? code : undefined };
}

/** 運営のアカウントの権限（機能ごとに許す操作。役割の足し算） */
export const grantsOf = (rs: Role[], a: Account) => mergeGrants(rs.filter((x) => a.roleIds.includes(x.id)).map((x) => x.grants));

/** アカウントの権限（役割の足し算。◎ > ○ > △ > ×） */
export function permsOf(rs: Role[], a: Account) {
  const rank = { '×': 0, '△': 1, '○': 2, '◎': 3 } as const;
  const out: Record<string, Role['perms'][string]> = {};
  for (const role of rs.filter((x) => a.roleIds.includes(x.id))) {
    for (const [k, v] of Object.entries(role.perms)) if (!out[k] || rank[v] > rank[out[k]]) out[k] = v;
  }
  return out;
}

export default defineArea({
  name: 'account',
  seed: () => ({
    'dm.account.accounts': toDocs(ACCOUNTS),
    'dm.account.roles': toDocs(ROLES),
    'dm.account.ipRules': toDocs(IP_RULES),
    'dm.account.siteSettings': toDocs(SITE_SETTINGS),
    'dm.account.audit': toDocs(AUDIT),
    'dm.account.loginHistory': toDocs(LOGIN_HISTORY),
    'dm.account.appVersions': toDocs(APP_VERSIONS),
    /* 運営Web のログインの認証コード（IP ホワイトリスト外。見本はなし） */
    'dm.account.otps': toDocs([] as LoginOtp[]),
  }),
  queries: {
    /**
     * 開発用のログイン：サイトとログインID からアカウント・権限・見てよい範囲を返す（パスワードは確かめない）。
     * 各サイトはこの scope で読むデータを絞る（例：拠点アカウントは delivery.forCorp({ branchId })）
     */
    login(r, { site, loginId }: { site: Site; loginId: string }) {
      const a = accounts(r).find((x) => x.site === site && x.loginId.toLowerCase() === loginId.trim().toLowerCase());
      if (!a || !CAN_LOGIN.includes(a.status)) throw new ApiError('ログインIDまたはパスワードが正しくありません', 401);
      const s = r.get<SiteSetting>('dm.account.siteSettings', site);
      if (s?.maintenance.on && site !== 'sysadmin') throw new ApiError(s.maintenance.message || 'メンテナンス中です', 503);
      return { account: a, perms: permsOf(roles(r), a), readOnly: a.status === '参照のみ' };
    },
    list: (r, a?: { site?: Site; status?: Account['status']; q?: string }) =>
      accounts(r).filter((x) => (!a?.site || x.site === a.site) && (!a?.status || x.status === a.status) &&
        (!a?.q || `${x.id} ${x.name} ${x.email}`.toLowerCase().includes(a.q.toLowerCase()))),
    get: (r, { id }: { id: string }) => { const a = getAcc(r, id); return { account: a, perms: permsOf(roles(r), a) }; },
    /** ログイン中のアカウントの今の権限（役割を直したら画面が読み直す。id はサーバーがログイン中のアカウントにする） */
    me: (r, { id }: { id: string }) => { const a = getAcc(r, id); return { account: a, perms: permsOf(roles(r), a), grants: grantsOf(roles(r), a), readOnly: a.status === '参照のみ' }; },
    roles: (r, a?: { site?: Site; all?: boolean }) => (a?.all ? allRoles(r) : roles(r)).filter((x) => !a?.site || x.site === a.site).map((x) => ({ ...x, users: accounts(r).filter((u) => u.roleIds.includes(x.id) && u.status !== '削除済').length })),
    ipRules: (r) => r.list<IpRule>('dm.account.ipRules'),
    siteSettings: (r) => r.list<SiteSetting>('dm.account.siteSettings'),
    audit: (r, a?: { accountId?: string; target?: string }) =>
      r.list<AuditLog>('dm.account.audit').filter((x) => (!a?.accountId || x.accountId === a.accountId) && (!a?.target || x.target === a.target)).reverse(),
    /** ログインの記録（新しい順） */
    loginHistory: (r, a?: { accountId?: string; site?: Site; result?: LoginRecord['result'] }) =>
      r.list<LoginRecord>('dm.account.loginHistory').filter((x) => (!a?.accountId || x.accountId === a.accountId) && (!a?.site || x.site === a.site) && (!a?.result || x.result === a.result)).reverse(),
    appVersions: (r) => r.list<AppVersion>('dm.account.appVersions'),
    /** サイトごとの件数（システム管理のダッシュボード） */
    summary(r) {
      const sites: Site[] = ['sysadmin', 'ops', 'corp', 'carrier', 'driver', 'supplier'];
      return sites.map((site) => {
        const xs = accounts(r).filter((a) => a.site === site);
        return { site, total: xs.length, active: xs.filter((a) => a.status === '有効').length, notLoggedIn: xs.filter((a) => a.status === '発行済（ログイン前）' || a.status === '未発行').length, stopped: xs.filter((a) => ['無効', '利用停止'].includes(a.status)).length };
      });
    },
  },
  actions: {
    /**
     * ログイン（記録を残す）。失敗も記録するので、エラーにはせず { ok: false, message } を返す。
     * ip を渡すと、IP ホワイトリストが効くサイトでは ip を確かめる
     */
    signIn(r, a: { site: Site; loginId: string; ip?: string; badPassword?: boolean }) {
      /* システム管理は運営Web の役割（台帳 R・受付簿 #418）：SY… は運営Web（/ops/login）で入る */
      const acc = accounts(r).find((x) => (x.site === a.site || (a.site === 'ops' && x.site === 'sysadmin')) && x.loginId.toLowerCase() === a.loginId.trim().toLowerCase());
      const rules = r.list<IpRule>('dm.account.ipRules').filter((x) => x.sites.includes(a.site));
      const s = r.get<SiteSetting>('dm.account.siteSettings', a.site);
      const outsideIp = !!a.ip && rules.length > 0 && !rules.some((x) => inCidr(a.ip!, x.cidr));
      const fail = !acc ? 'ログインIDがない' : a.badPassword ? 'パスワードが違う' : !CAN_LOGIN.includes(acc.status) ? `${acc.status}のアカウント`
        : s?.maintenance.on && a.site !== 'sysadmin' ? 'メンテナンス中'
        /* 運営Web は IP ホワイトリスト外でも止めない：メールの認証コード（OTP）で通す（台帳 E・受付簿 #61）。ほかのサイトは今までどおり止める */
        : outsideIp && a.site !== 'ops' ? 'IP ホワイトリストにない' : '';
      const otp = !fail && outsideIp && a.site === 'ops';
      const id = `LG-${String(r.list('dm.account.loginHistory').length + 1).padStart(5, '0')}`;
      /* アカウントがない・パスワード違い＝fail、アカウントはあるが止められた（状態・IP・メンテナンス）＝blocked。認証コード待ちも blocked（通ったら success を足す） */
      r.put<LoginRecord>('dm.account.loginHistory', id, {
        id, at: nowStamp(), site: a.site, loginId: a.loginId, accountId: acc?.id ?? '', ip: a.ip ?? '', result: !fail && !otp ? 'success' : acc && !a.badPassword ? 'blocked' : 'fail',
        reason: otp ? 'IP ホワイトリストにない（認証コードを送付）' : fail,
      });
      /* stopped＝利用停止のアカウント（法人Web は解約で停止した旨を出す・Message List WEB No.76） */
      if (fail) return { ok: false as const, otpRequired: false as const, stopped: acc?.status === '利用停止', stopReason: acc?.status === '利用停止' ? acc.stopReason : undefined, message: fail === 'メンテナンス中' ? s?.maintenance.message || 'メンテナンス中です' : 'ログインできませんでした（ログインID・パスワード・接続元を確かめてください）' };
      if (otp) {
        const x = issueLoginOtp(r, acc!, a.ip ?? '');
        return { ok: false as const, otpRequired: true as const, stopped: false, stopReason: undefined, sentTo: x.sentTo, minutes: OTP_MINUTES, devCode: x.devCode, message: `登録されていない接続元からのログインのため、${x.sentTo} に認証コード（${OTP_MINUTES}分間有効）を送りました。コードを入れてください` };
      }
      const next = { ...acc!, status: acc!.status === '発行済（ログイン前）' ? '有効' as const : acc!.status, lastLoginAt: nowStamp() };
      r.put('dm.account.accounts', next.id, next);
      return { ok: true as const, account: next, perms: permsOf(roles(r), next), grants: grantsOf(roles(r), next), readOnly: next.status === '参照のみ' };
    },
    /**
     * 認証コードでログインを完了する（運営Web・IP ホワイトリスト外。受付簿 #61）。
     * 間違いは { ok: false, message } で返す（回数の上限・コードの無効化はない）
     */
    verifyOtp(r, a: { site: Site; loginId: string; code: string; ip?: string }) {
      const acc = accounts(r).find((x) => (x.site === a.site || (a.site === 'ops' && x.site === 'sysadmin')) && x.loginId.toLowerCase() === a.loginId.trim().toLowerCase());
      const live = acc && liveOtp(r, acc.id);
      if (!acc || !live) throw new ApiError('認証コードの有効期限が切れました。もう一度ログインしてください', 410);
      if (!CAN_LOGIN.includes(acc.status)) throw new ApiError('ログインできませんでした（ログインID・パスワード・接続元を確かめてください）', 401);
      if (codeHashOf(acc.id, String(a.code ?? '').trim()) !== live.codeHash) {
        return { ok: false as const, message: '認証コードが違います' };
      }
      r.put<LoginOtp>(OTPS, live.id, { ...live, usedAt: nowStamp() });
      const id = `LG-${String(r.list('dm.account.loginHistory').length + 1).padStart(5, '0')}`;
      r.put<LoginRecord>('dm.account.loginHistory', id, { id, at: nowStamp(), site: a.site, loginId: a.loginId, accountId: acc.id, ip: a.ip ?? live.ip, result: 'success', reason: 'IP ホワイトリスト外・認証コードで確認' });
      const next = { ...acc, status: acc.status === '発行済（ログイン前）' ? '有効' as const : acc.status, lastLoginAt: nowStamp() };
      r.put('dm.account.accounts', next.id, next);
      return { ok: true as const, account: next, perms: permsOf(roles(r), next), grants: grantsOf(roles(r), next), readOnly: next.status === '参照のみ' };
    },
    /** システム管理：アプリのバージョン（強制アップデート） */
    setAppVersion(r, a: { os: AppVersion['os']; version: string; force: boolean; note: string; by: string; create?: boolean }) {
      if (!/^\d+\.\d+\.\d+$/.test(a.version)) throw new ApiError('バージョン名は 2.1.0 の形式で入力してください。', 400);
      const id = `${a.os}-${a.version}`;
      /* 登録（create）では同じ端末OS・バージョン名を受けない（E267）。create なし＝これまでどおり上書き（編集） */
      if (a.create && r.get('dm.account.appVersions', id)) throw new ApiError('同じ端末OS・バージョン名が既に登録されています。', 409);
      const next: AppVersion = { id, os: a.os, version: a.version, force: a.force, note: a.note, updatedAt: nowStamp() };
      r.put('dm.account.appVersions', id, next);
      log(r, a.by, 'アプリのバージョン', id, a.force ? '強制アップデート' : '任意アップデート');
      return next;
    },
    /** アカウントの発行（運営・システム管理。法人・拠点・委託配送・ドライバー・仕入先は対象の ID をそのまま使う） */
    create(r, a: { account: Omit<Account, 'issuedAt' | 'lastLoginAt' | 'status'>; by: string }) {
      const x = a.account;
      if (r.get('dm.account.accounts', x.id)) throw new ApiError(`${x.id} はもうあります`, 409);
      if (!x.name.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x.email)) throw new ApiError('氏名とメールアドレスを正しく入れてください', 400);
      if (x.roleIds.some((id) => r.get<Role>('dm.account.roles', id)?.site !== x.site)) throw new ApiError('サイトに合わない役割があります', 400);
      /* 運転免許証が未登録のドライバー（配送スタッフ）にはアカウントを発行しない（免許を登録して有効にしてから・2026/10/03 決定） */
      if (x.site === 'driver' && r.get<{ status: string }>('dm.master.drivers', x.id)?.status === '免許未登録') throw new ApiError(`${x.id} は運転免許証が未登録のため、アカウントを発行できません（免許証を登録してから発行してください）`, 409);
      const next: Account = { ...x, status: '発行済（ログイン前）', issuedAt: nowStamp(), lastLoginAt: '' };
      r.put('dm.account.accounts', x.id, next);
      log(r, a.by, 'アカウント発行', x.id, `${x.site}・${x.name}`);
      return next;
    },
    setStatus(r, { id, status, by }: { id: string; status: Account['status']; by: string }) {
      const a = getAcc(r, id);
      if (id === by && status !== '有効') throw new ApiError('自分のアカウントは止められません', 400);
      if (a.roleIds.includes('sysadmin.admin') && status !== '有効' && activeAdmins(r).length <= 1) throw new ApiError('最後のシステム管理者は止められません', 400);
      /* 運転免許証が未登録のドライバーのアカウントは発行・有効にしない（2026/10/03 決定） */
      if (a.site === 'driver' && (status === '発行済（ログイン前）' || status === '有効') && r.get<{ status: string }>('dm.master.drivers', id)?.status === '免許未登録') throw new ApiError(`${id} は運転免許証が未登録のため、アカウントを発行できません（免許証を登録してから発行してください）`, 409);
      /* 手で状態を変えたら、マスタの状態で止めた印（lockedBy・lib/domain/partnerLock.ts）は外す */
      const { lockedBy: _l, ...rest } = a;
      const next: Account = { ...rest, status };
      r.put('dm.account.accounts', id, next);
      if (a.site === 'ops') keepGrantEditor(r);
      log(r, by, '状態の変更', id, `${a.status} → ${status}`);
      return next;
    },
    setRoles(r, { id, roleIds, by }: { id: string; roleIds: string[]; by: string }) {
      const a = getAcc(r, id);
      if (id === by) throw new ApiError('自分の役割は変えられません', 400);
      if (!roleIds.length) throw new ApiError('役割を1つ以上選んでください', 400);
      if (roleIds.some((rid) => r.get<Role>('dm.account.roles', rid)?.site !== a.site)) throw new ApiError('サイトに合わない役割があります', 400);
      if (a.roleIds.includes('sysadmin.admin') && !roleIds.includes('sysadmin.admin') && activeAdmins(r).length <= 1) throw new ApiError('最後のシステム管理者の役割は外せません', 400);
      const next = { ...a, roleIds };
      r.put('dm.account.accounts', id, next);
      if (a.site === 'ops') keepGrantEditor(r);
      log(r, by, '役割の変更', id, roleIds.map((x) => r.get<Role>('dm.account.roles', x)?.name).join('・'));
      return next;
    },
    /**
     * 運営アカウントの編集（アカウント管理（運営）編集）。ユーザー名・メール・ロール（運営の権限・2つ以上可）・アカウント状態（有効／無効。無効はログインできない）。
     * E01 必須・E07 メールの形式・E09 メールの重複（運営のアカウント・削除済を除く）・E31 同時更新（baseVersion）。変更は操作の記録（audit）に残す
     */
    updateAccount(r, a: { id: string; name: string; email: string; roleIds: string[]; status: Account['status']; by: string; baseVersion?: string; force?: boolean }) {
      const cur = getAcc(r, a.id);
      if (cur.site !== 'ops') throw new ApiError('運営のアカウントだけ編集できます。', 400);
      if (cur.status === '削除済') throw new ApiError('削除済みのため編集できません。', 400); /* E36 */
      assertFresh(versionOf(cur.version), a.baseVersion, a.force);
      const name = (a.name ?? '').trim();
      const email = (a.email ?? '').trim();
      if (!name) throw new ApiError('ユーザー名は必須項目です。', 400);
      if (!email) throw new ApiError('メールは必須項目です。', 400);
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new ApiError('正しいメールアドレスの形式で入力してください。', 400);
      if (accounts(r).some((x) => x.site === 'ops' && x.id !== a.id && x.status !== '削除済' && x.email.toLowerCase() === email.toLowerCase())) throw new ApiError('メールアドレスは既に登録されています。', 409);
      const roleIds = [...new Set(a.roleIds ?? [])];
      if (!roleIds.length) throw new ApiError('ロールは必須項目です。', 400);
      if (roleIds.some((rid) => { const x = r.get<Role>('dm.account.roles', rid); return !x || x.site !== 'ops' || x.status === '削除済'; })) throw new ApiError('サイトに合わない役割があります', 400);
      /* 状態は 有効／無効 に切り替える（発行済（ログイン前）などはそのまま残せる） */
      if (a.status !== cur.status && !['有効', '無効'].includes(a.status)) throw new ApiError('アカウント状態は必須項目です。', 400);
      const sameRoles = [...roleIds].sort().join() === [...cur.roleIds].sort().join();
      if (a.id === a.by && !sameRoles) throw new ApiError('自分の役割は変えられません', 400);
      if (a.id === a.by && a.status !== cur.status && a.status !== '有効') throw new ApiError('自分のアカウントは止められません', 400);
      const { lockedBy: _l, ...rest } = cur;
      const next: Account = { ...(a.status !== cur.status ? rest : cur), name, email, roleIds, status: a.status, version: nextVersion(cur.version) };
      r.put('dm.account.accounts', a.id, next);
      keepGrantEditor(r);
      const roleName = (ids: string[]) => ids.map((x) => r.get<Role>('dm.account.roles', x)?.name ?? x).join('・');
      const diff = [
        cur.name !== name && `ユーザー名：${cur.name} → ${name}`,
        cur.email !== email && `メール：${cur.email} → ${email}`,
        !sameRoles && `ロール：${roleName(cur.roleIds)} → ${roleName(roleIds)}`,
        cur.status !== a.status && `アカウント状態：${cur.status} → ${a.status}`,
      ].filter(Boolean).join('／');
      if (diff) log(r, a.by, 'アカウントの編集', a.id, diff);
      return next;
    },
    /** 運営：ドライバーのパスワード再設定の代行（4桁の認証コードを登録メールへ。メールは仮・2026/10/03） */
    issueDriverReset(r, { id, by }: { id: string; by: string }) {
      const x = issueResetCode(r, { loginId: id, by: by || 'ops' });
      log(r, by, 'ドライバーのパスワード再設定の代行', id, x.sentTo);
      return x;
    },
    /** パスワード再設定の案内（開発中は記録だけ） */
    resetPassword(r, { id, by }: { id: string; by: string }) {
      const a = getAcc(r, id);
      log(r, by, 'パスワード再設定の案内', id, a.email);
      return { sentTo: a.email };
    },
    addIp(r, { cidr, note, sites, by }: { cidr: string; note: string; sites: Site[]; by: string }) {
      const value = ipValue(cidr);
      if (!sites.length) throw new ApiError('効かせるサイトを選んでください', 400);
      if (r.list<IpRule>('dm.account.ipRules').some((x) => x.cidr === value)) throw new ApiError('同じIPアドレスが既に登録されています。', 409);
      const n = Math.max(0, ...r.list<IpRule>('dm.account.ipRules').map((x) => Number(x.id.slice(2)))) + 1;
      const rule: IpRule = { id: `IP${String(n).padStart(3, '0')}`, cidr: value, note, sites, createdAt: nowStamp(), createdBy: by };
      r.put('dm.account.ipRules', rule.id, rule);
      log(r, by, 'IP の追加', rule.id, `${value}（${note}）`);
      return rule;
    },
    /** IP の編集（IPアドレス・管理用備考。確かめは追加と同じ：E263〜E265） */
    updateIp(r, { id, cidr, note, by }: { id: string; cidr: string; note: string; by: string }) {
      const rule = r.get<IpRule>('dm.account.ipRules', id);
      if (!rule) throw new ApiError('IP が見つかりません', 404);
      const value = ipValue(cidr);
      if (r.list<IpRule>('dm.account.ipRules').some((x) => x.id !== id && x.cidr === value)) throw new ApiError('同じIPアドレスが既に登録されています。', 409);
      const next: IpRule = { ...rule, cidr: value, note: (note ?? '').trim() };
      r.put('dm.account.ipRules', id, next);
      const diff = [rule.cidr !== value && `${rule.cidr} → ${value}`, rule.note !== next.note && `備考：${rule.note || '—'} → ${next.note || '—'}`].filter(Boolean).join('／');
      if (diff) log(r, by, 'IP の編集', id, diff);
      return next;
    },
    removeIp(r, { id, by }: { id: string; by: string }) {
      const rule = r.get<IpRule>('dm.account.ipRules', id);
      if (!rule) throw new ApiError('IP が見つかりません', 404);
      r.remove('dm.account.ipRules', id);
      log(r, by, 'IP の削除', id, rule.cidr);
      return { ok: true };
    },
    /** アプリのバージョンの削除（運営Web の一覧から） */
    removeAppVersion(r, { id, by }: { id: string; by: string }) {
      if (!r.get<AppVersion>('dm.account.appVersions', id)) throw new ApiError('バージョンが見つかりません', 404);
      r.remove('dm.account.appVersions', id);
      log(r, by, 'アプリのバージョンの削除', id, '');
      return { ok: true };
    },
    /**
     * 運営の役割の作成・変更（運営Web の「権限」画面。「権限付与」の作成・編集ができる人）。
     * grants は機能（lib/ops/permissions.ts）ごとの操作。機能にない操作は捨てる。id がなければ作る（OR＋連番）
     */
    saveRole(r, { id, name, note, grants, by }: { id?: string; name: string; note: string; grants: Grants; by: string }) {
      if (!name?.trim()) throw new ApiError('権限名を入れてください', 400);
      const clean: Grants = {};
      for (const [k, ops] of Object.entries(grants ?? {})) {
        const f = FEATURE[k];
        const v = f ? (ops ?? []).filter((o) => f.ops.includes(o)) : [];
        /* 閲覧なしで編集だけ、はできない（閲覧を足す） */
        if (v.length && !v.includes('read')) v.unshift('read');
        if (v.length) clean[k] = v;
      }
      const cur = id ? r.get<Role>('dm.account.roles', id) : undefined;
      if (id && (!cur || cur.site !== 'ops')) throw new ApiError('役割が見つかりません', 404);
      if (cur?.status === '削除済') throw new ApiError('削除済みのため編集できません。', 400); /* E36 */
      if (roles(r).some((x) => x.site === 'ops' && x.id !== id && x.name === name.trim())) throw new ApiError('同じ名前の権限があります', 409);
      const rid = id ?? `ops.r${String(r.nextSeq('account.role')).padStart(3, '0')}`;
      const next: Role = { ...(cur ?? { perms: {} }), id: rid, site: 'ops', name: name.trim(), note: note?.trim() ?? '', grants: clean, updatedAt: nowStamp(), updatedBy: r.get<Account>('dm.account.accounts', by)?.name ?? by };
      r.put('dm.account.roles', rid, next);
      keepGrantEditor(r);
      log(r, by, cur ? '権限の変更' : '権限の作成', rid, next.name);
      return next;
    },
    /** 役割の削除（持っているアカウントがあれば消さない） */
    removeRole(r, { id, by }: { id: string; by: string }) {
      const role = r.get<Role>('dm.account.roles', id);
      if (!role) throw new ApiError('役割が見つかりません', 404);
      if (role.status === '削除済') throw new ApiError('削除済みのため編集できません。', 400); /* E36 */
      if (id === 'ops.full' || id === 'sysadmin.admin') throw new ApiError('「権限付与」を編集できる運営のアカウントが1人もいなくなるため、この変更はできません', 409); /* E262 */
      /* 持っているアカウントの件数（削除済みを除く）を文言に入れる（E261） */
      const n = accounts(r).filter((a) => a.roleIds.includes(id) && a.status !== '削除済').length;
      if (n) throw new ApiError(`使用中のアカウント ${n}件のため削除できません。`, 409);
      r.put('dm.account.roles', id, { ...role, status: '削除済', updatedAt: nowStamp(), updatedBy: r.get<Account>('dm.account.accounts', by)?.name ?? by });
      keepGrantEditor(r);
      log(r, by, '役割の削除', id, role.name);
      return { ok: true };
    },
    /** メンテナンスの入り切り（入れたサイトはシステム管理以外ログインできない） */
    setMaintenance(r, { site, on, message, by }: { site: Site; on: boolean; message: string; by: string }) {
      if (site === 'sysadmin') throw new ApiError('システム管理はメンテナンスにできません', 400);
      const s = r.get<SiteSetting>('dm.account.siteSettings', site);
      if (!s) throw new ApiError('サイトが見つかりません', 404);
      const next = { ...s, maintenance: { on, message } };
      r.put('dm.account.siteSettings', site, next);
      log(r, by, on ? 'メンテナンス開始' : 'メンテナンス終了', site, message);
      return next;
    },
  },
});
