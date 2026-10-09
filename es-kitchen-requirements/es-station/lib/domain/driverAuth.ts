import { ApiError } from '@/lib/api/errors';
import type { DocRepo } from '@/lib/ops/core/area';
import { PASSWORD_RULE, passwordValid, randomCode } from '@/lib/auth/rules';
import { nowStamp } from '@/lib/supplier/dates';
import type { Driver, DriverResetCode } from './types';

/*
 * ドライバーのパスワードと再設定の認証コード（台帳 B「ドライバーのログイン」・配送_11 14.10・2026/10/03）。
 * ログインID＝配送スタッフID（自動採番）。再設定は4桁の認証コードを登録メールアドレスへ送る。
 * メールの送信はいまは仮：送らずにサーバーのログと画面（開発用）でコードを確かめる。本物の送信はメールサーバーができてから。
 * パスワード・コードはハッシュだけ持つ（平文では持たない）。
 */

export const RESET_KIND = 'dm.account.driverResetCodes';
/** 認証コードの有効期限（分）＝5分（台帳 K・F 2026-10-07）。誤入力の回数の上限はなく、間違えてもコードは無効にしない（アカウントもロックしない。台帳 F 2026-10-08） */
export const RESET_CODE_MIN = 5;

/* SHA-256（共通データはブラウザ（mock）でも動くので Node の crypto は使わない） */
const PRIMES: number[] = [];
for (let n = 2; PRIMES.length < 64; n++) if (PRIMES.every((p) => n % p)) PRIMES.push(n);
const K = PRIMES.map((p) => ((Math.cbrt(p) % 1) * 2 ** 32) | 0);
function sha256(text: string): string {
  const bytes = Array.from(new TextEncoder().encode(text));
  const bitLen = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  for (let i = 7; i >= 0; i--) bytes.push(i >= 4 ? 0 : (bitLen >>> (i * 8)) & 0xff);
  const h = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const rot = (x: number, n: number) => (x >>> n) | (x << (32 - n));
  for (let o = 0; o < bytes.length; o += 64) {
    const w = new Array<number>(64);
    for (let i = 0; i < 16; i++) w[i] = (bytes[o + i * 4] << 24) | (bytes[o + i * 4 + 1] << 16) | (bytes[o + i * 4 + 2] << 8) | bytes[o + i * 4 + 3];
    for (let i = 16; i < 64; i++) {
      const s0 = rot(w[i - 15], 7) ^ rot(w[i - 15], 18) ^ (w[i - 15] >>> 3), s1 = rot(w[i - 2], 17) ^ rot(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }
    let [a, b, c, d, e, f, g, hh] = h;
    for (let i = 0; i < 64; i++) {
      const t1 = (hh + (rot(e, 6) ^ rot(e, 11) ^ rot(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + w[i]) | 0;
      const t2 = ((rot(a, 2) ^ rot(a, 13) ^ rot(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
      [hh, g, f, e, d, c, b, a] = [g, f, e, (d + t1) | 0, c, b, a, (t1 + t2) | 0];
    }
    [a, b, c, d, e, f, g, hh].forEach((x, i) => { h[i] = (h[i] + x) | 0; });
  }
  return h.map((x) => (x >>> 0).toString(16).padStart(8, '0')).join('');
}
/** 塩＝配送スタッフID */
const hashOf = (driverId: string, s: string) => sha256(`${driverId}:${s}`);

/** 画面に出すメールアドレス（先頭1文字だけ見せる） */
export const maskMail = (m: string) => m.replace(/^(.)[^@]*(@.*)$/, '$1***$2');
/** 認証コードのハッシュ（運営Web のログインの認証コードも同じ・lib/domain/areas/account.ts） */
export const codeHashOf = (id: string, code: string) => hashOf(id, code);

/** ログインのパスワードを確かめる。まだ設定していない（見本の）ドライバーは、ほかのサイトと同じく空でなければ通す（開発用） */
export const passwordOk = (d: Driver, pw: string) => (d.passwordHash ? hashOf(d.id, pw) === d.passwordHash : !!pw);

const driverOf = (r: DocRepo, loginId: string) => r.get<Driver>('dm.master.drivers', String(loginId ?? '').trim().toUpperCase());
const liveCode = (r: DocRepo, driverId: string) =>
  r.list<DriverResetCode>(RESET_KIND).filter((x) => x.driverId === driverId && !x.usedAt && x.expiresMs > Date.now()).sort((x, y) => y.expiresMs - x.expiresMs)[0];

/**
 * 認証コードを出す（本人＝ログイン前の画面／代行＝運営・委託配送会社〈自社のドライバーだけ・carrierId〉）。
 * 前に出した使っていないコードは無効にする。メールは仮（ログに出し、開発用に devCode を返す）
 */
export function issueResetCode(r: DocRepo, a: { loginId: string; by?: string; carrierId?: string }) {
  const d = driverOf(r, a.loginId);
  if (!d || d.status !== '有効') throw new ApiError('ログインIDが見つからないか、利用できないアカウントです', 404);
  if (a.carrierId && d.carrierId !== a.carrierId) throw new ApiError('自社のドライバーだけ代行できます', 403);
  if (!d.email) throw new ApiError('メールアドレスが登録されていません（所属先・運営に連絡してください）', 400);
  r.list<DriverResetCode>(RESET_KIND).filter((x) => x.driverId === d.id && !x.usedAt).forEach((x) => r.put(RESET_KIND, x.id, { ...x, usedAt: nowStamp() }));
  const code = randomCode();
  const id = `RC-${d.id}-${Date.now()}`;
  r.put<DriverResetCode>(RESET_KIND, id, {
    id, driverId: d.id, codeHash: hashOf(d.id, code), issuedAt: nowStamp(), expiresMs: Date.now() + RESET_CODE_MIN * 60000,
    verifiedAt: '', usedAt: '', issuedBy: a.by ?? d.id,
  });
  console.info(`[driver] パスワード再設定の認証コード（メールは仮）：${d.id} → ${d.email}：${code}`);
  return { sentTo: maskMail(d.email), minutes: RESET_CODE_MIN, devCode: code };
}

/**
 * 認証コードを確かめる（間違えても回数は数えず、コードも無効にしない。合えば確認済み＝新しいパスワードを入れられる）。
 * 間違いは { ok: false } で返す
 */
export function verifyResetCode(r: DocRepo, a: { loginId: string; code: string }) {
  const d = driverOf(r, a.loginId);
  const c = d && liveCode(r, d.id);
  if (!d || !c) throw new ApiError('認証コードの有効期限が切れました。もう一度送信してください', 410);
  if (hashOf(d.id, String(a.code ?? '')) !== c.codeHash) {
    /* 入力回数の上限はない・間違えてもコードは無効にしない（有効期限の5分だけ。台帳 F 2026-10-08） */
    return { ok: false as const, message: '認証コードが違います' };
  }
  r.put<DriverResetCode>(RESET_KIND, c.id, { ...c, verifiedAt: nowStamp() });
  return { ok: true as const, message: '' };
}

/** 確かめた認証コードで新しいパスワードにする（コードはここで使い切る） */
export function resetPassword(r: DocRepo, a: { loginId: string; code: string; password: string }) {
  const d = driverOf(r, a.loginId);
  const c = d && liveCode(r, d.id);
  if (!d || !c) throw new ApiError('認証コードの有効期限が切れました。もう一度送信してください', 410);
  if (!c.verifiedAt || hashOf(d.id, String(a.code ?? '')) !== c.codeHash) throw new ApiError('先に認証コードを確かめてください', 400);
  if (!a.password) throw new ApiError('パスワードを入力してください', 400);
  if (!passwordValid(a.password)) throw new ApiError(`パスワードは${PASSWORD_RULE}`, 400);
  r.put<DriverResetCode>(RESET_KIND, c.id, { ...c, usedAt: nowStamp() });
  r.put<Driver>('dm.master.drivers', d.id, { ...d, passwordHash: hashOf(d.id, a.password), passwordUpdatedAt: nowStamp() });
  return { ok: true };
}
