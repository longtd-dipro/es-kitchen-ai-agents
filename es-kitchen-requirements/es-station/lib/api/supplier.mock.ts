import { mockSuppliers } from '@/mocks/supplier/suppliers';
import { MOCK_MANUALS } from '@/mocks/supplier/manuals';
import { MOCK_NOTICES } from '@/mocks/supplier/notices';
import { seedOrders } from '@/lib/supplier/seed';
import { orderView, supplierView, withMainContact } from '@/lib/supplier/view';
import { supplierService, type SupplierRepo } from '@/lib/supplier/service';
import type { SupplierApi } from './supplier';

/*
 * モックの API（NEXT_PUBLIC_API_MODE=mock）。見本データをブラウザのメモリに持つ。
 * 書き換えの中身は lib/supplier/service.ts（共通 DB の app/api と同じ）。
 * このタブの中だけで動き、再読み込みで初期状態に戻る。サイトをまたいで確かめるときは http（共通 DB）にする。
 */

function memoryRepo(): SupplierRepo {
  const orders = seedOrders();
  const suppliers = mockSuppliers();
  let apps = 0;
  let ver = 1;
  return {
    getSupplier: (id) => suppliers[id],
    saveSupplier(s) { suppliers[s.id] = structuredClone(s); ver++; },
    listOrders: (id) => (id ? orders.filter((o) => o.sup === id) : orders),
    getOrder: (no) => orders.find((o) => o.no === no),
    saveOrder: () => { ver++; },
    listNotices: () => MOCK_NOTICES,
    listManuals: () => MOCK_MANUALS,
    addApplication: () => { apps++; ver++; },
    countApplications: () => apps,
    version: () => ver,
    transaction: (fn) => fn(),
  };
}

/** 運営の画面（lib/api/ops.ts のモック）からも同じデータを使う */
export const mockService = supplierService(memoryRepo());

/** 本物の API に近づけるため、少し待ってから写しを返す（画面がデータを直接書き換えないように） */
export const wait = <T,>(fn: () => T): Promise<T> =>
  new Promise((resolve, reject) => setTimeout(() => {
    try { resolve(structuredClone(fn())); } catch (e) { reject(e); }
  }, 120));

const s = mockService;

export const mockSupplierApi: SupplierApi = {
  login: (loginId, password) => wait(() => s.login(loginId, password)),
  logout: () => wait(() => undefined),
  requestPasswordReset: () => wait(() => undefined),
  verifyResetCode: (_loginId, code) => wait(() => s.verifyResetCode(code)),
  resetPassword: () => wait(() => undefined),
  submitApplication: (form) => wait(() => s.submitApplication(form)),

  getSupplier: (id) => wait(() => supplierView(withMainContact(s.getSupplier(id)))),
  updateSupplier: (x) => wait(() => supplierView(withMainContact(s.updateSupplierContact(x.id, structuredClone(x))))),
  sendPasswordResetMail: () => wait(() => undefined),

  listNotices: () => wait(() => s.listNotices()),
  listManuals: () => wait(() => s.listManuals()),
  getFileUrl: () => wait(() => 'about:blank'),

  listOrders: (id) => wait(() => s.listOrders(id).map(orderView)),
  markSeen: (no) => wait(() => orderView(s.markSeen(no))),
  answerOrders: (items) => wait(() => s.answerOrders(items).map(orderView)),
  rejectOrder: (no, reason, comment) => wait(() => orderView(s.rejectOrder(no, reason, comment))),
  approveHon: (items) => wait(() => s.approveHon(items).map(orderView)),
  reportShipment: (input) => wait(() => orderView(s.reportShipment(input))),
  saveShipDrafts: (items) => wait(() => s.saveShipDrafts(items).map(orderView)),
  reportShipments: (items) => wait(() => s.reportShipments(items).map(orderView)),

  getVersion: () => wait(() => s.version()),
};
