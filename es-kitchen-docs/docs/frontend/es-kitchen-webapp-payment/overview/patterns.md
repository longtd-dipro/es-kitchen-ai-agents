# es-kitchen-webapp-payment — Patterns & Conventions

> Nguồn = es-kitchen-webapp-payment@4bee823 ngày 2026-10-16.

> Đọc file này trước khi viết code cho E07. **Cùng nhóm stack với E06** (shadcn + zustand + Sonner + lucide-react) nhưng có thêm **elepay SDK + @zxing scanner + PWA**.

---

## Kế thừa từ E06 webapp-driver

Đa số pattern áp dụng nguyên vẹn — xem `../es-kitchen-webapp-driver/overview/patterns.md`:

- #1 UI stack: shadcn/ui + Base UI + Radix
- #2 State: zustand + TanStack Query v5 object syntax
- #3 Toast: Sonner (không react-toastify)
- #4 Icons: lucide-react (không Phosphor/AntD icons)
- #5 Class merging: `cn()` utility
- #6 Component variant: `class-variance-authority`
- #10 Forms: react-hook-form + Yup
- #11 HTTP interceptors — không tự thêm token
- #12 Lazy loading + Suspense
- #13 Path aliases

---

## Đặc thù E07

### 1. Route guards — company session, không auth-based

Khác E02–E06 (dùng `RequireAuth`/`PublicOnly`), E07 dùng:

- **`RequireCompany`** — chưa có company session → `Navigate` `/invalid-code`
- **`NoCompanyOnly`** — đã có company session → `Navigate` `/` (nên `/invalid-code` và `*` là dead-end chỉ dành cho khách chưa vào shop)
- `/shop/:code` (ShopEntryPage) nằm ngoài cả hai guard.

Auth flow ở E07 là **guest-first**: user vào shop qua QR không cần đăng ký → `useGuestLogin` cấp token (`/auth/user/guest`). Guard check `useCompanySession` (hook đọc `useCompanySessionStore`), không phải `useAuthStore`.

### 2. Zustand — 4 store phân tách theo domain

```
useAuthStore       ← accessToken (mirror cookie)
useUserStore       ← User profile (cookie + /user/me)
useCompanySessionStore ← Active shop/company (cookie, resolved từ QR)
useCheckoutStore   ← paymentMethodId + cardId (persist sessionStorage) — KHÔNG chứa cart
```

**Rule:** không gom vào mega-store. Store phải scope theo domain concern. Nếu cần store mới → tạo `useXxxStore.ts` riêng.

### 3. Barcode Scanner — `@zxing/browser`

```tsx
// hooks/useBarcodeScanner.ts
import { BrowserMultiFormatOneDReader } from "@zxing/browser";
import { BarcodeFormat } from "@zxing/library";   // EAN_13/8, UPC_A/E, CODE_128, ITF
```

Quét **mã vạch sản phẩm** (JAN/EAN) để thêm vào cart — không phải QR. QR chỉ là link `{WEB_PAYMENT_URL}/shop/{code}` mở bằng camera hệ thống. Không dùng `react-barcode-scanner` (E06).

**Rule khi scan (từ code):**
- Giải mã ~10fps (`SCAN_INTERVAL_MS = 100`); trì hoãn mở camera 1 tick để tránh double-acquire do StrictMode/điều hướng
- Kết quả đi qua `useScanToCart` → `cart.service` thêm item server-side; `ScanSuccessDialog` báo kết quả
- Xử lý từ chối quyền camera — chi tiết fallback chưa kiểm trong lượt sync này

### 4. Payment — elepay SDK v2

```typescript
// services/client/elepay.ts
import { type ElepayInstance, loadElepay } from "elepay-js-sdk";
```

- Public key lấy từ `GET /user/elepay/public-key`, cache instance (không cache lỗi), `locale: "ja"`; không bundle key vào FE
- Adapter trả `ElepayOutcome` = `succeeded | cancelled | failed`; gọi `handleCharge` / `handleSource` (lưu thẻ)
- Gateway redirect về `/orders/status` (kèm chargeId, orderNo, status) → `OrderStatusPage`; order dở ở `/orders/pending` (retry `/user/orders/:id/retry-payment`, cancel `/cancel`)
- `usePaymentCountdown` / `PaymentDeadline` hiển thị hạn thanh toán; `paymentMethodId`/`cardId` giữ trong `useCheckoutStore` (sessionStorage) để reload không mất
- Log thanh toán: `utils/client/paymentLogger.ts` (bật/tắt `?debugPayment=1`)
- **Không xử lý card number trực tiếp**, không gateway ngoài elepay

### 5. Cart — server-side (đổi so với doc cũ)

Cart nằm ở BE (`/user/cart`, tự tạo khi `GET`); FE không còn persist cart vào localStorage. `useCart` (query key `CART_QUERY_KEY`) + `cart.service.ts`.
- `useCartStockSync`: mỗi lần mở app gọi `/user/cart/sync-stock` — BE không còn tự xoá dòng hết hàng, FE gắn cờ để user thấy (TK-18)
- `useCartReset` + `/user/cart/reset-status|reset-ack`: BE báo cart bị reset, FE ack
- Chặn checkout khi còn order pending (`HasPendingOrderDialog`) và khi vượt hạn mức (`/user/orders/check-limit`, `OrderAmountLimitDialog`)

### 5b. Hoàn tiền / Lịch sử / Legal

- `useRefund` + `RefundPage`: chỉ cho hoàn trong 30 phút tính từ `payment.paidAt` (server là nguồn quyết định cuối)
- `useOrderHistory` → `OrderHistoryPage`
- Legal HTML từ CMS đi qua `utils/client/sanitizeHtml.ts` (allowlist, trả `DocumentFragment`, không `dangerouslySetInnerHTML`)

### 6. Mobile-first + PWA

- Viewport fixed `h-dvh w-screen` — tránh full width trên desktop
- PWA manifest cho phép install standalone
- Service worker autoUpdate — không cần manual reload khi có version mới

### 7. Session ordering flow

```
QR (mở {URL}/shop/:code)
  → ShopEntryPage → useResolveQrCompany (staleTime: Infinity) → useSyncCompanySession + guest token
  → RequireCompany passes
  → / (HomePage, category) → /products/:productId → /scan (barcode) → /cart → /cart/confirm
  → /cart/payment-methods → elepay → /orders/status → /payment/success
  (nhánh: /orders/pending · /orders · /orders/:orderId · /orders/:orderId/refund · /terms)
```

**Rule khi thêm route trong flow:**
- Cần company session → thêm vào group `RequireCompany`
- Landing/error → `NoCompanyOnly`; thêm hằng + builder vào `constants/route.ts`

### 8. TanStack Query default

`queryClient.ts`: `staleTime: 15s`, `retry: 1`, `refetchOnWindowFocus: false`, mutation `retry: 0`. Query ít đổi (vd resolve QR) override `staleTime: Infinity`.

### 9. PWA update & install

`vite-plugin-pwa` autoUpdate + `skipWaiting/clientsClaim`; `utils/swUpdate.ts` reload trang ngay khi SW mới nắm quyền. `utils/pwa.ts` bắt `beforeinstallprompt` ở `main.tsx`; `components/PWAInstall` (InstallBanner, IOSInstallGuide), dismiss lưu localStorage (bọc try/catch).

---

## Không tự thêm

- ❌ **Ant Design** — dùng shadcn/Base UI/Radix
- ❌ **Redux Toolkit** — dùng zustand
- ❌ **react-toastify** — dùng Sonner
- ❌ **Phosphor icons** — dùng lucide-react
- ❌ **Socket.IO** — payment status dùng polling + elepay webhook
- ❌ **Stripe/PayPal/VNPay** — chỉ elepay
- ❌ **Rich text editor** — không có use case
- ❌ **react-barcode-scanner** — dùng `@zxing/browser`
- ❌ **Cart trong localStorage** — cart server-side

---

## Design token — chưa align

Nền App dùng class `bg-warning-200`; PWA `theme_color` là `#fee28a` (warning-200 yellow). Chưa đối chiếu toàn bộ token với `design_rule.md`. Khi UI trưởng thành → cần:

1. Confirm với Designer về màu primary chính thức cho E07 (có thể là yellow như E01 Mobile, hoặc màu mới)
2. Wire `next-themes` provider nếu cần dark mode
3. Import design token qua Tailwind config theo `.claude/rules/design_rule.md`

---

## Fix cần thiết (Dev repo work — còn lại 2026-10-16)

1. `package.json` name `"es-kitchen-web-payment"` — vẫn lệch tên repo (đã bỏ lỗi `es-kitchen-web-admin`)
2. `README.md` vẫn mô tả web-supplier (Ant Design + Redux) — rewrite
3. `@assets` alias (vite + tsconfig) trỏ `src/assets/` nhưng folder là `src/statics/`
4. `next-themes`: chưa có `ThemeProvider`
5. Chưa có Vitest; không còn script `lint`
6. `pages/menu/MenuPage.tsx` không được route — xác nhận xoá hay đưa vào router
7. Deploy script placeholder (có `deploy.sh` ở root, chưa đọc)
