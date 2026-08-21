# DESIGN — es-kitchen-webapp-payment · webapp-payment-oneqr

> **SPEC:** `../SPEC.md`
> **BE DESIGN:** `../es-kitchen-api/DESIGN.md`
> **Repo:** `es-kitchen-webapp-payment` (E07)
> **Author:** Tech Lead Design · 2026-08-21
> **Verdict:** ~70% pages + services đã có sẵn. Effort FE **~6–8 人日** — chủ yếu là **history/refund/legal pages** + **verify Aeon Pay removal** + **integration polish**.

---

## 1. Executive summary

Repo `es-kitchen-webapp-payment` đã được scaffold trước với **hầu hết pages ordering flow**. Sau khi grep:

### 1.1 Đã có sẵn (không cần build lại)

| SPEC screen | Route file | Page component | Status |
|---|---|---|---|
| WP_SHOP_001 Shop entry | `/shop/:code` | `pages/shop/ShopEntryPage.tsx` | ✅ |
| WP_ERROR_001 Invalid code | `/invalid-code` | `pages/errors/InvalidCodePage.tsx` | ✅ |
| WP_MENU_001 Home | `/` | `pages/home/HomePage.tsx` | ✅ |
| WP_SCAN_001 Scan | `/scan` | `pages/scan/ScanPage.tsx` + `ScanViewport`, `ScanSuccessDialog` | ✅ (FE) — BE endpoint chưa có |
| WP_CART_001 Cart | `/cart` | `pages/cart/CartPage.tsx` + `CartItemRow`, `CartSummaryBar`, `CartResetDialog` | ✅ |
| WP_CART_002 Cart confirm | `/cart/confirm` | `pages/cart/CartConfirmPage.tsx` + `CartConfirmDialog` | ✅ |
| WP_PAY_001 Payment methods | `/cart/payment-methods` | `pages/cart/PaymentMethodPage.tsx` | ✅ (cần lọc Aeon Pay — xem 3.2) |
| WP_PAY_002 Payment success | `/payment/success` | `pages/payment/PaymentSuccessPage.tsx` + `SuccessBadge` | ✅ |
| WP_PAY_004 Pending / failed | `/orders/pending` | `pages/cart/PendingOrderPage.tsx` + `CancelPaymentDialog`, `HasPendingOrderDialog` | ✅ |
| WP_HIST_002 Order detail | `/orders/:orderId` | `pages/cart/OrderDetailPage.tsx` | ✅ (dùng chung cho pending + history detail) |

**Services đã có:** `qr.service`, `order.service` (checkout/pending/retry/cancel/get), `cart.service` (server-side — xem 4.1), `menu.service`, `payment.service`, `elepay.ts` (loadElepay + handleCharge), `auth.service`, `user.service`, `file-upload.service`, `error-report.service`.

**Routes/guards đã có:** `RequireCompany` + `NoCompanyOnly` — dùng `useCompanySession` hook.

### 1.2 Gap — cần build cho E07

| SPEC screen | Route | Page component | Priority |
|---|---|---|---|
| WP_PROD_001/002/003 Product detail | `/product/:id` | **NEW** `pages/product/ProductDetailPage.tsx` (+ zoom modal) | High |
| WP_PAY_003 Payment canceled | `/payment/canceled` | **NEW** `pages/payment/PaymentCanceledPage.tsx` | Medium |
| WP_HIST_001 Purchase history list | `/history` | **NEW** `pages/history/HistoryPage.tsx` | High |
| WP_REFUND_001 Refund form | `/history/:orderId/refund` | **NEW** `pages/history/RefundPage.tsx` | High |
| WP_REFUND_002/003 Refund result | modal | **NEW** `components/RefundResultDialog.tsx` | Medium |
| WP_LEGAL_001 Terms + Privacy | `/legal` | **NEW** `pages/legal/LegalPage.tsx` (gộp Terms + Privacy 1 URL theo BA-08) | Medium |

**Services thiếu:**
- `services/client/refund.service.ts` — call `POST /user/refunds`
- `services/client/legal.service.ts` — call 2 endpoints legal + concat
- `services/client/history.service.ts` — call `GET /user/orders/history`
- **Modify** `services/client/order.service.ts` — thêm barcode scan wrapper `POST /user/products/scan/:barcode`

**Stores thiếu (nếu cần):**
- Không cần store mới — history dùng TanStack Query cache, refund dùng local state trong page.

---

## 2. Blast radius — impacted files

### Modify
- `src/routes/index.tsx` — thêm 6 routes mới (product detail, canceled, history, history detail, refund, legal)
- `src/constants/route.ts` — thêm 6 route path constants
- `src/services/client/order.service.ts` — thêm `scanBarcode()` + `getHistory()`
- `src/services/client/payment.service.ts` — verify Aeon Pay filter qua `?context=web` (nếu BE dùng Option A)
- `src/pages/cart/PaymentMethodPage.tsx` — verify hidden Aeon Pay (nếu BE trả list đã filter thì tự OK)
- `src/pages/cart/OrderDetailPage.tsx` — thêm "返金申請" button với điều kiện 30 phút

### Add
- `src/pages/product/ProductDetailPage.tsx`
- `src/pages/product/components/ProductZoomModal.tsx`
- `src/pages/payment/PaymentCanceledPage.tsx`
- `src/pages/history/HistoryPage.tsx`
- `src/pages/history/RefundPage.tsx`
- `src/pages/history/components/RefundResultDialog.tsx`
- `src/pages/history/components/HistoryItemRow.tsx`
- `src/pages/legal/LegalPage.tsx`
- `src/services/client/refund.service.ts`
- `src/services/client/legal.service.ts`
- `src/services/client/history.service.ts`

**Blast radius: MODERATE.** Đa số là additive — route/page mới không breaking. Chỉ 2 file existing bị chỉnh (OrderDetailPage thêm refund button, order.service.ts thêm methods).

---

## 3. Route + guard design

### 3.1 Route table (updated)

```tsx
// src/routes/index.tsx (delta highlighted)
{
  element: <RequireCompany />,
  children: [
    { index: true, element: withSuspense(<HomePage />) },
    { path: ROUTE.SCAN, element: withSuspense(<ScanPage />) },
    { path: ROUTE.PRODUCT_DETAIL, element: withSuspense(<ProductDetailPage />) },  // ← NEW /product/:id
    { path: ROUTE.CART, element: withSuspense(<CartPage />) },
    { path: ROUTE.CART_CONFIRM, element: withSuspense(<CartConfirmPage />) },
    { path: ROUTE.PAYMENT_METHODS, element: withSuspense(<PaymentMethodPage />) },
    { path: ROUTE.PENDING_ORDER, element: withSuspense(<PendingOrderPage />) },
    { path: ROUTE.ORDER_DETAIL, element: withSuspense(<OrderDetailPage />) },
    { path: ROUTE.PAYMENT_SUCCESS, element: withSuspense(<PaymentSuccessPage />) },
    { path: ROUTE.PAYMENT_CANCELED, element: withSuspense(<PaymentCanceledPage />) },  // ← NEW
    { path: ROUTE.HISTORY, element: withSuspense(<HistoryPage />) },  // ← NEW /history
    { path: ROUTE.HISTORY_REFUND, element: withSuspense(<RefundPage />) },  // ← NEW /history/:orderId/refund
    { path: ROUTE.LEGAL, element: withSuspense(<LegalPage />) },  // ← NEW /legal
  ],
},
```

### 3.2 Route constants — `src/constants/route.ts` (delta)

```typescript
export const ROUTE = {
  // ... existing
  PRODUCT_DETAIL: '/product/:id',
  PAYMENT_CANCELED: '/payment/canceled',
  HISTORY: '/history',
  HISTORY_REFUND: '/history/:orderId/refund',
  LEGAL: '/legal',
} as const;
```

### 3.3 Guard reuse

Tất cả route mới nằm dưới `RequireCompany` — user phải có company session mới truy cập được. Không cần guard mới.

**Note quan trọng:** `/history` cần thấy được **cả khi cart trống** (user chỉ vào xem history không cần thêm item). Guard hiện `RequireCompany` chỉ check `hasCompany` — OK cho trường hợp này (không require cart items).

---

## 4. Design decisions cần confirm với Tech Lead + BA

### 4.1 Cart client-side vs server-side (BA-19 mới từ BE DESIGN)

**Reality:** FE `cart.service.ts` đang gọi BE endpoints (server-side cart). SPEC BA-03 chốt "localStorage".

**Recommendation:** **Giữ server-side** — code đã build, có cart-reset-event pattern. Update SPEC BA-03 nếu client OK.

**Nếu client kiên quyết localStorage** — cần refactor:
- Xoá `cart.service.ts` calls đến BE
- Move state vào zustand `useCartStore` (với `persist` middleware sang localStorage)
- Đổi `POST /user/orders/checkout` body signature: nhận `items: [{ productId, quantity }]` thay vì reference cart
- BE cần adjust `checkout()` method + update DTO
- **Effort:** +2 人日 FE + 0.5 人日 BE + regression test

### 4.2 Payment method filter — BE query param vs FE hard filter

**Nếu BE apply Option A (`?context=web`):**
```typescript
// payment.service.ts — 1 dòng thay đổi
export const listPaymentMethods = async () => {
  return API.get('/user/payment-methods', { context: 'web' });
};
```

**Nếu BE giữ nguyên:**
```typescript
// PaymentMethodPage.tsx — filter FE-side
const HIDDEN_CODES = ['aeonpay', 'wechatpay'];
const visible = paymentMethods.filter(pm => !HIDDEN_CODES.includes(pm.code));
```

**Recommendation:** Follow BE Option A (server-side filter) — an toàn hơn (không lộ payment method trong API response).

### 4.3 Refund button visibility — 30 phút window

`OrderDetailPage.tsx` cần thêm logic:

```tsx
const canRefund =
  order.status === OrderStatus.COMPLETED &&
  !order.refund &&
  dayjs().diff(order.paidAt, 'minute') <= 30;

{canRefund && (
  <Button onClick={() => navigate(`/history/${order.id}/refund`)}>
    返金申請
  </Button>
)}
```

**Countdown UX (recommend):** hiển thị "残り X 分" bên cạnh button để user không confuse khi button ẩn.

### 4.4 History pagination

BE `/user/orders/history` trả `OrderListResponse` (paginated). Client BA-12 chưa rõ ("Lấy từ FIGMA URL"). Recommendation:
- **Default:** infinite scroll với `useInfiniteQuery` (TanStack Query), 20 items/page
- **Nếu Figma explicit về cap → adjust theo Figma**

---

## 5. New pages spec

### 5.1 `ProductDetailPage.tsx` (`/product/:id`)

**Data fetch:**
```tsx
const { data: product } = useQuery({
  queryKey: ['product', id],
  queryFn: () => menuService.getProductDetail(id),
});
```

**Layout (theo Figma WP_PROD_001):**
- Header: back button + product name
- Full-width photo (tap để mở `ProductZoomModal` — WP_PROD_003)
- Name, description, allergen list, nutrition (kcal/100g), price
- Quantity picker (default 1, min 1, max: theo `orderLimit` company)
- Sticky bottom: "カートに追加" primary button

**Empty photo state (WP_PROD_002):** Show placeholder icon nếu `product.photoUrl` null.

**Add to cart:**
- Nếu server-side cart (recommendation 4.1): `cartService.addItem({ productId, quantity })`
- Toast success + optional navigate back to home (UX decision)

### 5.2 `PaymentCanceledPage.tsx` (`/payment/canceled`)

**Trigger:** elepay redirect với `?status=cancelled` hoặc `handleCharge()` return `{ kind: 'cancelled' }`.

**Layout:**
- Icon warning
- Message "決済がキャンセルされました"
- CTA 1: "もう一度支払う" → `/cart/payment-methods`
- CTA 2: "トップへ" → `/`

**Data:** cart KHÔNG clear (khác payment success).

### 5.3 `HistoryPage.tsx` (`/history`)

**Data fetch:**
```tsx
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['orders', 'history'],
  queryFn: ({ pageParam = 1 }) =>
    historyService.list({ page: pageParam, limit: 20 }),
  getNextPageParam: (last) =>
    last.data.hasMore ? last.data.page + 1 : undefined,
});
```

**Layout:**
- Header: back + title "購入履歴"
- List: `HistoryItemRow` component per order — thumbnail (first item) + name + purchase date + total + status badge (決済完了 / 決済失敗)
- Sort mới nhất trên đầu (BE đã sort)
- Empty state: icon + "購入履歴がありません"
- Note dưới footer: "ブラウザを変更すると履歴は引き継がれません" (BA-04 warning)
- Infinite scroll trigger qua `useInView` hook

**Tap 1 order** → navigate `/orders/:orderId` (reuse `OrderDetailPage`).

### 5.4 `RefundPage.tsx` (`/history/:orderId/refund`)

**Guard trong page:** verify order `canRefund` (30 phút) — nếu không, redirect back với toast error.

**Form (react-hook-form + yup):**
```tsx
const schema = yup.object({
  reason: yup.string().required('理由を入力してください').max(500),
});
```

**Layout:**
- Header: back + "返金申請"
- Order summary readonly
- Textarea reason (max 500 chars, char counter)
- CTA: "送信"

**Submit:**
```tsx
const mutation = useMutationCustom({
  mutationFn: (reason: string) => refundService.create({ orderId, reason }),
  onSuccess: () => setDialog({ status: 'success' }),
  onError: () => setDialog({ status: 'failed' }),
});
```

**Result:** modal `RefundResultDialog` với 2 variants (success / failed).

### 5.5 `LegalPage.tsx` (`/legal`)

**Data fetch (nếu BE Option A concat):**
```tsx
const { data: terms } = useQuery({
  queryKey: ['legal', 'terms'],
  queryFn: legalService.getTerms,
});
const { data: privacy } = useQuery({
  queryKey: ['legal', 'privacy'],
  queryFn: legalService.getPrivacy,
});
```

**Layout:**
- Header: back + "利用規約・プライバシーポリシー"
- Scrollable body:
  - Section 1: 利用規約 (render markdown/HTML content)
  - Divider
  - Section 2: プライバシーポリシー
- Không có CTA (chỉ read-only)

**Content format decision (BA-17 mới):** cần confirm với BE — nếu HTML → dùng `dangerouslySetInnerHTML` (sanitize trước); nếu markdown → render qua `react-markdown`.

---

## 6. New services

### 6.1 `refund.service.ts`

```typescript
import API from '@/services/client/api';
import type { IBaseApiResponse } from '@/models/Response';

const APIs = {
  CREATE_REFUND: '/user/refunds',
};

type CreateRefundBody = {
  orderId: string;
  reason: string;
};

type RefundResponse = {
  id: string;
  chargeId: string;
  amount: number;
  currency: string;
  status: string;
  reason: string;
};

export const createRefund = async (body: CreateRefundBody): Promise<IBaseApiResponse<RefundResponse>> => {
  return API.post(APIs.CREATE_REFUND, body);
};
```

### 6.2 `legal.service.ts`

```typescript
const APIs = {
  TERMS: '/user/legal/terms',
  PRIVACY: '/user/legal/privacy',
};

export const getTerms = async () => API.get(APIs.TERMS, undefined, { disabledToken: true });
export const getPrivacy = async () => API.get(APIs.PRIVACY, undefined, { disabledToken: true });
```

### 6.3 `history.service.ts`

```typescript
const APIs = {
  HISTORY: '/user/orders/history',
};

type ListParams = {
  page?: number;
  limit?: number;
};

export const listHistory = async (params: ListParams = {}) => {
  return API.get(APIs.HISTORY, params);
};
```

### 6.4 Modify `order.service.ts` — thêm scan barcode

```typescript
const APIs = {
  // ... existing
  SCAN_BARCODE: (barcode: string) => `/user/products/scan/${encodeURIComponent(barcode)}`,
};

export const scanBarcode = async (barcode: string) => {
  return API.get(APIs.SCAN_BARCODE(barcode));
};
```

**Actually should live in `menu.service.ts` hoặc `product.service.ts`** — theo domain, không phải order. Recommend tạo `product.service.ts` mới.

---

## 7. State management

### 7.1 Zustand stores hiện có (giả định — cần verify)

Từ scaffold docs `docs/frontend/es-kitchen-webapp-payment/overview/structure.md`:
- `useAuthStore` — JWT
- `useUserStore` — user profile
- `useCompanySessionStore` — active shop/company
- `useCheckoutStore` — cart + order + payment state

**E07 KHÔNG cần store mới.** Refund/history state cục bộ trong page qua `useState` + TanStack Query cache.

### 7.2 Session persistence

`useCompanySessionStore` cần persist qua `zustand/middleware/persist` sang `localStorage` — để user reload browser vẫn giữ được shop context. **Verify** hiện đã có chưa; nếu chưa, thêm.

### 7.3 Cart store (nếu chọn Option 4.1B — localStorage)

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type CartItem = { productId: string; quantity: number; snapshot: ProductSnapshot };

export const useCartStore = create(
  persist<{ items: CartItem[]; add, remove, update, clear }>(
    (set) => ({ /* ... */ }),
    { name: 'e07-cart' },
  ),
);
```

Chỉ implement khi 4.1 chốt Option B.

---

## 8. Testing strategy

### 8.1 Manual smoke (before PR)

1. Scan QR (dev URL: paste `dev-es-qr.es-kitchen.co.jp/CU001` vào browser)
2. Verify home load menu
3. Add items → cart
4. Cart confirm → agree terms → payment methods
5. Verify Aeon Pay + Wechat Pay KHÔNG hiển thị
6. Test 1 payment (credit card sandbox elepay)
7. Payment success → history → verify order xuất hiện
8. Refund ngay (trong 30 phút) → verify success
9. Đợi 30+ phút → verify refund button ẩn

### 8.2 E2E (Playwright — trong `es-kitchen-testing/`)

- `e07-happy-path.spec.ts` — full flow QR → order → payment success
- `e07-refund.spec.ts` — refund trong 30 phút window
- `e07-guest-session-persist.spec.ts` — reload browser vẫn giữ session

### 8.3 Cross-browser

Test bắt buộc (theo SPEC section 7):
- iPhone Safari (iOS 16+) — quan trọng cho elepay SameSite=strict redirect
- Android Chrome
- Desktop Chrome (max-w-3xl centering)

---

## 9. Config

### 9.1 Env vars

```bash
# .env.development
VITE_API_BASE_URL=https://dev-es-qr.es-kitchen.co.jp/api
VITE_AUTH_URL=https://dev-es-qr.es-kitchen.co.jp
VITE_APP_INSTALL_URL=https://apps.apple.com/jp/app/eskitchen  # cho InvalidCodePage fallback
```

### 9.2 PWA manifest — sync theme_color với primary (BA-11)

Đang là `#fee28a` (warning-200). Nếu BA-11 confirm primary `#FAC215` → update `vite.config.ts`:

```typescript
VitePWA({
  manifest: {
    theme_color: '#FAC215',  // ← was #fee28a
    background_color: '#FAC215',
    // ...
  },
}),
```

### 9.3 Vite dev host

```typescript
// vite.config.ts
server: {
  host: true,  // expose LAN cho mobile test
  port: 3007,  // E07 (E06 driver = 3006)
},
```

---

## 10. Tasks estimate

| # | Task | Effort (人日) |
|---|---|---|
| 1 | `ProductDetailPage` + zoom modal + service integration | 1.0 |
| 2 | `HistoryPage` với infinite scroll | 0.75 |
| 3 | `RefundPage` + `RefundResultDialog` | 0.5 |
| 4 | Thêm 返金申請 button vào `OrderDetailPage` với countdown | 0.25 |
| 5 | `LegalPage` (Terms + Privacy 1 URL) | 0.5 |
| 6 | `PaymentCanceledPage` | 0.25 |
| 7 | 3 new services (refund, legal, history) + 1 modify (order + product scan) | 0.5 |
| 8 | Update `routes/index.tsx` + `ROUTE` constants + route imports | 0.125 |
| 9 | Filter Aeon Pay trong `PaymentMethodPage` (theo BE decision) | 0.125 |
| 10 | PWA manifest theme_color update (BA-11 confirm rồi mới đổi) | 0.125 |
| 11 | Persist `useCompanySessionStore` sang localStorage (nếu chưa) | 0.25 |
| 12 | Cross-browser test + polish + fix bug integration | 1.5 |
| 13 | (Contingent) Cart migrate sang zustand localStorage nếu client kiên quyết BA-03 | +2.0 |
| **Tổng FE (không tính contingent)** | | **~5.9 人日** |
| **Tổng FE (worst case với cart migrate)** | | **~7.9 人日** |

**Vs SPEC estimate 12.875 人日:** hiện tại thấp hơn vì hầu hết pages đã có scaffold. Buffer ~3-4 人日 cho:
- BA-17 legal content format bug (HTML vs markdown)
- iOS Safari SameSite issue với elepay redirect
- Design polish (font, spacing, color tokens theo Figma exact)
- CORS + PWA install debugging

---

## 11. Handover cho Tech Lead Tasks

Phân rã tasks theo Phase (BMAD):

**Phase 1 — Foundation:**
- Task 1-1: Route + constants + Env config
- Task 1-2: 3 services mới (refund, legal, history) + 1 modify (order + product scan)

**Phase 2 — API integration (chờ BE done):**
- Task 2-1: Product scan wrapper + integration test

**Phase 3 — Pages (parallel với 2):**
- Task 3-1: ProductDetailPage + zoom modal
- Task 3-2: HistoryPage + infinite scroll
- Task 3-3: RefundPage + dialog
- Task 3-4: LegalPage
- Task 3-5: PaymentCanceledPage
- Task 3-6: OrderDetailPage refund button

**Phase 4 — Integration:**
- Task 4-1: E2E smoke on DEV
- Task 4-2: Cross-browser test
- Task 4-3: Playwright specs

---

## 12. Open questions cần feedback

Ngoài 3 BA TODOs mới ở BE DESIGN section 10, riêng FE:

- **BA-22:** Product detail — có cần review/rating giống mobile app không? Hiện đang recommend NO (guest-first — không review).
- **BA-23:** History empty state message final wording? "購入履歴がありません" hay khác?
- **BA-24:** Refund reason required hay optional? Character limit 500 OK?
- **BA-25:** Sau refund success, có redirect về đâu — history list hay order detail refreshed?
