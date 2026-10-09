/*
 * 委託配送先Web のアカウント。ログインID＝委託配送先ID（運営Web の委託配送先マスタ general.consign の id）。
 * ご担当者で共有のアカウント。開発中は見本のアカウントだけ（パスワードは確かめない）。本番は API の認証に置き換える。
 */
export type CarrierAccount = {
  /** ログインID（委託配送先ID） */
  loginId: string;
  /** 委託配送会社ID（領域の args で渡す。自社の配送データだけを見る） */
  company: string;
  /** 委託配送先名（ヘッダーに出す名前） */
  name: string;
};

/** 委託配送先マスタの「委託・引き取り」の会社（路線の運送会社は委託配送先Web を使わない） */
export const ACCOUNTS: CarrierAccount[] = [
  { loginId: 'DE00001', company: 'DE00001', name: '栄成ロジ' },
  { loginId: 'DE00006', company: 'DE00006', name: 'みどり便' },
  { loginId: 'DE00007', company: 'DE00007', name: '山本配送（個人）' },
];

export const accountOf = (loginId: string) => ACCOUNTS.find((a) => a.loginId.toLowerCase() === loginId.trim().toLowerCase());
