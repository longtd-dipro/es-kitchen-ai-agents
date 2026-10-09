/*
 * 法人Web のアカウント。法人アカウント＝法人ID、拠点アカウント＝拠点ID でログインする（ご担当者で共有のアカウント）。
 * 認証（Cognito）は作らない（課題 0-2：フェイク）。共通データのアカウント（dm.account・site＝corp）なら、どの法人・拠点でもログインできる
 * （パスワードは確かめない・空でなければよい。ほかのサイトと同じ開発の決まり）。利用停止のアカウントはログインできない。
 * 本番は API の認証に置き換える。
 */
export type CorpRole = 'admin' | 'branch' | 'trial';

export type CorpAccount = {
  /** ログインID（法人ID または 拠点ID） */
  loginId: string;
  role: CorpRole;
  /** 法人ID */
  corpId: string;
  corpName: string;
  /** 拠点アカウントのときの拠点ID */
  branchId?: string;
  branchName?: string;
  /** ヘッダーに出す名前 */
  label: string;
};

/** DEMO 帯の「アカウント」の切替の先頭に出す見本（共通データのアカウントはどれでもログインできる） */
export const ACCOUNTS: CorpAccount[] = [
  { loginId: 'CU00001', role: 'admin', corpId: 'CU00001', corpName: '株式会社サンプル', label: '株式会社サンプル（法人アカウント）' },
  { loginId: 'CU00871', role: 'branch', corpId: 'CU00001', corpName: '株式会社サンプル', branchId: 'CU00871', branchName: '大阪支店', label: '株式会社サンプル 大阪支店（拠点アカウント）' },
  { loginId: 'CU00071', role: 'trial', corpId: 'CU00071', corpName: '株式会社みちのく商事', label: '株式会社みちのく商事（法人アカウント）' },
];

export const accountOf = (loginId: string) => ACCOUNTS.find((a) => a.loginId.toLowerCase() === loginId.trim().toLowerCase());

/** 共通データのアカウント → 法人Web のアカウント（法人アカウントで、その法人の契約がすべてお試しなら trial） */
export function corpAccountOf(
  a: { id: string; loginId: string; scope: { type: string; corpId?: string; branchId?: string } },
  corp: { id: string; name: string },
  branch: { id: string; name: string } | null,
  contractKinds: string[],
): CorpAccount {
  const trial = contractKinds.length > 0 && contractKinds.every((k) => k === 'お試しキャンペーン');
  if (branch) {
    const short = branch.name.replace(corp.name, '').trim() || branch.name;
    return { loginId: a.loginId.toUpperCase(), role: 'branch', corpId: corp.id, corpName: corp.name, branchId: branch.id, branchName: short, label: `${branch.name}（拠点アカウント）` };
  }
  return { loginId: a.loginId.toUpperCase(), role: trial ? 'trial' : 'admin', corpId: corp.id, corpName: corp.name, label: `${corp.name}（法人アカウント）` };
}

/** 共通データのアカウントの状態 → 画面の状態（参照のみ＝解約後・利用停止＝停止後） */
export const viewOfStatus = (status: string | undefined): CorpView => (status === '参照のみ' ? 'ro' : status === '利用停止' ? 'stopped' : 'in');

/**
 * 画面の状態。in＝ふつう／ro＝解約後（最後のご請求の入金期限まで参照のみ）／stopped＝停止後（ログインできない）。
 * 共通データのアカウントの状態（apply.tick が 参照のみ → 利用停止 にする・課題 3-12）から決める。DEMO 帯の「デモの表示」は上書き（見本を見るため）。
 * 休止中は拠点ごと（契約の利用休止）に拠点の画面で出す。
 */
export type CorpView = 'in' | 'ro' | 'stopped';
