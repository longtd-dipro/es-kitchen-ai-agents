import type { SupplierApi } from './supplier';
import { ApiError } from './errors';
import { onUnauthorized, siteHeader } from './site';

/*
 * 本物の API につなぐ実装（NEXT_PUBLIC_API_MODE=http）。
 * エンドポイントは仮置き。バックエンドの API 定義が決まったら合わせる。
 * 認証は Cookie（セッション）を想定して credentials: 'include' にしている。
 */
const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

export async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
  const sentAt = Date.now();
  const res = await fetch(BASE + path, {
    method,
    credentials: 'include',
    headers: { ...siteHeader(), ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    onUnauthorized(res.status, sentAt);
    const data = await res.json().catch(() => ({}));
    throw new ApiError(data.message ?? `エラーが起きました（${res.status}）`, res.status);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

export const httpSupplierApi: SupplierApi = {
  login: (loginId, password) => call('POST', '/supplier/auth/login', { loginId, password }),
  logout: () => call('POST', '/supplier/auth/logout'),
  requestPasswordReset: (loginId, mail) => call('POST', '/supplier/auth/password-reset', { loginId, mail }),
  verifyResetCode: (loginId, code) => call('POST', '/supplier/auth/password-reset/verify', { loginId, code }),
  resetPassword: (token, password) => call('POST', '/supplier/auth/password-reset/complete', { token, password }),
  submitApplication: (form) => call('POST', '/supplier/applications', form),

  getSupplier: (id) => call('GET', `/supplier/suppliers/${id}`),
  updateSupplier: (s) => call('PUT', `/supplier/suppliers/${s.id}`, s),
  sendPasswordResetMail: (id) => call('POST', `/supplier/suppliers/${id}/password-reset-mail`),

  listNotices: (id) => call('GET', `/supplier/suppliers/${id}/notices`),
  listManuals: () => call('GET', '/supplier/manuals'),
  getFileUrl: (file) => call<{ url: string }>('GET', `/supplier/files?name=${encodeURIComponent(file)}`).then((r) => r.url),

  listOrders: (id) => call('GET', `/supplier/suppliers/${id}/orders`),
  markSeen: (no) => call('POST', `/supplier/orders/${encodeURIComponent(no)}/seen`),
  answerOrders: (items) => call('POST', '/supplier/orders/answers', { items }),
  rejectOrder: (no, reason, comment) => call('POST', `/supplier/orders/${encodeURIComponent(no)}/reject`, { reason, comment }),
  approveHon: (items) => call('POST', '/supplier/orders/hon-approvals', { items }),
  reportShipment: ({ no, ...body }) => call('POST', `/supplier/orders/${encodeURIComponent(no)}/shipments`, body),
  saveShipDrafts: (items) => call('POST', '/supplier/orders/ship-drafts', { items }),
  reportShipments: (items) => call('POST', '/supplier/orders/shipments', { items }),

  getVersion: () => call<{ version: number }>('GET', '/sync/version').then((r) => r.version),
};
