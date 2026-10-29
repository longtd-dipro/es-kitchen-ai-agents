# es-kitchen-webapp-payment — Patterns & Conventions

> Nguồn = es-kitchen-webapp-payment@4bee823 ngày 2026-10-16.

**File này nói gì:** cách làm riêng của E07 (web khách đặt hàng): vào shop bằng QR, quyền truy cập theo shop, giỏ hàng ở server, thanh toán elepay, quét mã vạch, hoàn tiền, PWA.
**Đọc khi:** sắp viết code cho E07.
**Đọc trước:** `structure.md` (bản đồ) và `../../es-kitchen-webapp-driver/overview/patterns.md` (các cách làm chung với E06).
**Stack:** cùng nhóm với E06 (shadcn + Base UI + Radix + zustand + Sonner + lucide-react), nhưng thêm **elepay SDK + @zxing scanner + PWA**. Khác E02–E05 (Ant Design + Redux).

---

## 0. Tra nhanh: tình huống → cách xử lý → file mẫu

| Tình huống | Cách xử lý | Mục | File mẫu |
|---|---|---|---|
| Trang chỉ cho khách đã vào shop | Đặt trong nhóm `RequireCompany` | §2 | `routes/index.tsx` |
| Thêm route mới | Hằng + builder trong `constants/route.ts`; chọn guard đúng | §9 | `constants/route.ts` |
| Cần state mới | Tạo `useXxxStore.ts` riêng, không gom vào store có sẵn | §3 | `stores/` |
| Thêm/sửa giỏ hàng | Gọi server qua `cart.service.ts`; đọc bằng `useCart` | §6 | `hooks/useCart.ts` |
| Thanh toán | Qua adapter `elepay.ts`, không tự gọi SDK | §5 | `services/client/elepay.ts` |
| Quét mã vạch sản phẩm | `useBarcodeScanner` + `useScanToCart` | §4 | `hooks/useBarcodeScanner.ts` |
| Hiện HTML từ CMS | Qua `sanitizeHtml`, không `dangerouslySetInnerHTML` | §7 | `utils/client/sanitizeHtml.ts` |
| Query ít đổi (vd tra QR) | Ghi đè `staleTime: Infinity` | §8 | `useResolveQrCompany` |
| Cập nhật PWA / nhắc cài app | `swUpdate.ts`, `pwa.ts`, `PWAInstall` | §10 | `main.tsx` |

---

## 1. Dùng chung với E06

Các việc sau làm **giống hệt** E06 — xem `es-kitchen-webapp-driver/overview/patterns.md` (đề mục tương ứng):

| Việc | Cách làm | Mục trong E06 |
|---|---|---|
| UI | shadcn/ui + Base UI + Radix (`components/ui/`) | §2 |
| State client | zustand (không Redux) | §1 |
| State server | TanStack Query v5, object syntax | §5 |
| Toast | `toast` từ Sonner (không react-toastify) | §6 |
| Icon | lucide-react (không Phosphor / AntD icon); SVG import `?react` | §8 |
| Gộp class | `cn()` ; biến thể component dùng `class-variance-authority` | §2 |
| Ghi dữ liệu | `useMutationCustom` (đã có trong `src/hooks/`, tự `toast.error`) | §5 |
| Form | react-hook-form + yup | — |
| Lazy load | `lazy()` + `withSuspense` (fallback `BaseLoadingFullScreen`) | §10 |
| Alias | `@/…` và các alias khác (xem `structure.md` §11) | — |

**Khác E06 ở HTTP:** interceptor request gắn `Authorization: Bearer` + header `timezone` (đừng tự thêm token). Interceptor response (`handleResponse.ts`) với 401 chỉ gọi `clearAuthCookies()` — "token cũ không được làm hỏng trang; bỏ nó và để nơi gọi thử lại ở chế độ ẩn danh". Không có `SessionExpiredModal` như E05/E06.
**Khác E06 ở query:** `staleTime` 15 giây (E06: 5 phút). Lý do trong code: menu, giỏ, đơn thay đổi trên server nên chỉ tin cache 15 giây.

---

## 2. Guard route — theo *shop*, không theo đăng nhập

**Vấn đề:** khách vào bằng QR, chưa đăng ký. Điều kiện vào trang là "đã biết đang đứng ở shop nào", không phải "đã login".
**Cách làm:** hai guard dựa trên `useCompanySession` (đọc `useCompanySessionStore`), không dùng `useAuthStore`.

| Guard | Khi nào | Chuyển đến |
|---|---|---|
| `RequireCompany` | chưa có company session | `/invalid-code` |
| `NoCompanyOnly` | đã có company session | `/` |
| (không guard) `/shop/:code` | cửa vào từ QR | — |

```tsx
// routes/guards/RequireCompany.tsx
export function RequireCompany() {
  const { hasCompany } = useCompanySession();
  if (!hasCompany) return <Navigate to={ROUTE.INVALID_CODE} replace />;
  return <Outlet />;
}
```

Cấu trúc router: `AppLayout` bọc tất cả; `/shop/:code` đứng ngoài hai guard; `NoCompanyOnly` chứa `/invalid-code` và `*` (→ `/invalid-code`); `RequireCompany` chứa mọi trang còn lại.

**Bẫy:** `/invalid-code` và `*` là ngõ cụt cho khách chưa vào shop; khách đã có shop gõ đường dẫn lạ sẽ bị đẩy về `/` (menu), không thấy lỗi.

---

## 3. Zustand — 4 store theo mối quan tâm

```
useAuthStore           accessToken (phản chiếu cookie)
useUserStore           profile người dùng (cookie + /user/me)
useCompanySessionStore shop/company đang chọn (cookie, lấy từ QR)
useCheckoutStore       paymentMethodId + cardId (persist sessionStorage) — KHÔNG chứa giỏ hàng
```

**Cách làm:** mỗi store một việc. Cần store mới → tạo `useXxxStore.ts` riêng.

**Chi tiết đáng biết (đọc từ `useCompanySessionStore`):**
- Mọi thứ khi quét QR lưu trong cookie, nên reload vẫn giữ.
- `switchCompany`: quét QR chi nhánh khác chỉ thay company, **không** cấp lại token khách (token khách dùng được giữa các chi nhánh).
- `clearCompany`: chỉ bỏ shop; token khách và cookie user thuộc về thiết bị, nên QR cấm đặt hàng cho khách không làm khách bị đăng xuất.
- `revokeCompany(code)`: như `clearCompany` nhưng nhớ mã đó, phòng khi đặt hàng cho khách được bật lại.

**Bẫy:** đừng gom mọi thứ vào một store lớn. `clearTokens` của `useAuthStore` cũng reset checkout store.

---

## 4. Quét mã vạch — `@zxing/browser`

**Vấn đề:** khách quét mã vạch sản phẩm (JAN/EAN) để thêm vào giỏ.
**Cách làm:** `hooks/useBarcodeScanner.ts` + `useScanToCart`.

```tsx
import { BrowserMultiFormatOneDReader } from "@zxing/browser";
import { BarcodeFormat } from "@zxing/library";   // EAN_13/8, UPC_A/E, CODE_128, ITF
```

- Quét **mã vạch sản phẩm**, không phải QR. QR chỉ là link `{WEB_PAYMENT_URL}/shop/{code}` mở bằng camera hệ thống.
- Giải mã khoảng 10 khung hình/giây (`SCAN_INTERVAL_MS = 100`); trì hoãn mở camera 1 nhịp để tránh xin camera hai lần do StrictMode / điều hướng.
- Kết quả đi qua `useScanToCart` → `cart.service` thêm món **ở server**; `ScanSuccessDialog` báo kết quả.
- Cách xử lý khi khách từ chối quyền camera: **(chưa kiểm trong lượt sync này)**.

**Bẫy:** không dùng `react-barcode-scanner` (đó là của E06).

---

## 5. Thanh toán — elepay SDK v2

**Vấn đề:** thanh toán qua cổng elepay mà không đụng số thẻ.
**Cách làm:** mọi thao tác SDK đi qua `services/client/elepay.ts`.

```typescript
import { type ElepayInstance, loadElepay } from "elepay-js-sdk";
```

- Public key lấy từ `GET /user/elepay/public-key`, cache instance (không cache lỗi), `locale: "ja"`. **Không** bundle key vào FE.
- Adapter trả `ElepayOutcome` = `succeeded | cancelled | failed`; gọi `handleCharge` (trả tiền) / `handleSource` (lưu thẻ).
- Sau khi trả, gateway redirect về `/orders/status` (kèm `chargeId`, `orderNo`, `status`) → `OrderStatusPage`.
- Đơn dở dang ở `/orders/pending`: thử lại `/user/orders/:id/retry-payment`, hủy `/cancel`.
- `usePaymentCountdown` / `PaymentDeadline` hiện hạn thanh toán.
- `paymentMethodId` / `cardId` giữ trong `useCheckoutStore` (sessionStorage) để reload không mất.
- Log thanh toán: `utils/client/paymentLogger.ts`, bật bằng `?debugPayment=1`.

**Bẫy (ràng buộc dự án):**
- Không xử lý số thẻ trực tiếp.
- Không dùng cổng ngoài elepay (Stripe/PayPal/VNPay cấm).
- Không in public key / giá trị `.env` vào log hay doc.

---

## 6. Giỏ hàng — lưu ở server

**Vấn đề:** giỏ phải đúng giữa các thiết bị và theo tồn kho thật.
**Cách làm:** giỏ ở BE (`/user/cart`, tự tạo khi `GET`). FE **không** lưu giỏ vào localStorage. Đọc bằng `useCart` (query key `CART_QUERY_KEY`) + `cart.service.ts`.

- `useCartStockSync`: mỗi lần mở app gọi `/user/cart/sync-stock`. BE không còn tự xóa dòng hết hàng; FE gắn cờ để khách thấy (TK-18).
- `useCartReset` + `/user/cart/reset-status|reset-ack`: BE báo giỏ bị reset, FE xác nhận (ack).
- Chặn checkout khi còn đơn chờ thanh toán (`HasPendingOrderDialog`) và khi vượt hạn mức (`/user/orders/check-limit`, `OrderAmountLimitDialog`).

**Bẫy:** đừng thêm persist giỏ ở client; dễ lệch với server.

---

## 7. Hoàn tiền, lịch sử, điều khoản

- `useRefund` + `RefundPage`: chỉ cho hoàn trong 30 phút từ `payment.paidAt`. **Server quyết định cuối cùng.**
- `useOrderHistory` → `OrderHistoryPage`.
- HTML điều khoản từ CMS đi qua `utils/client/sanitizeHtml.ts` (allowlist, trả `DocumentFragment`), **không** dùng `dangerouslySetInnerHTML`.

---

## 8. Truy vấn mặc định

`services/query/queryClient.ts`:

```typescript
queries:   { staleTime: 15 * 1000, retry: 1, refetchOnWindowFocus: false },
mutations: { retry: 0 },
```

Query ít đổi (vd `useResolveQrCompany`) ghi đè `staleTime: Infinity`.

---

## 9. Luồng đặt hàng và thêm route

```
QR (mở {URL}/shop/:code)
  → ShopEntryPage → useResolveQrCompany (staleTime: Infinity) → useSyncCompanySession + token khách
  → RequireCompany đi qua
  → / (HomePage, category) → /products/:productId → /scan → /cart → /cart/confirm
  → /cart/payment-methods → elepay → /orders/status → /payment/success
  (nhánh: /orders/pending · /orders · /orders/:orderId · /orders/:orderId/refund · /terms)
```

**Khi thêm route:**
- Cần company session → đặt trong nhóm `RequireCompany`.
- Trang landing/lỗi → `NoCompanyOnly`.
- Thêm hằng + builder vào `constants/route.ts`.

---

## 10. Mobile-first và PWA

- Khung cố định `h-dvh w-screen` (tránh bung full chiều rộng trên desktop); nội dung `max-w-3xl`.
- Manifest cho phép cài như app độc lập (`display: standalone`).
- Service worker `autoUpdate` + `skipWaiting/clientsClaim`; `utils/swUpdate.ts` tải lại trang ngay khi SW mới nắm quyền.
- `utils/pwa.ts` bắt `beforeinstallprompt` từ `main.tsx`; `components/PWAInstall` (InstallBanner, IOSInstallGuide); trạng thái "đã bỏ qua" lưu localStorage (bọc try/catch).

---

## 11. Không tự thêm

- ❌ Ant Design — dùng shadcn / Base UI / Radix.
- ❌ Redux Toolkit — dùng zustand.
- ❌ react-toastify — dùng Sonner.
- ❌ Phosphor icons — dùng lucide-react.
- ❌ Socket.IO — trạng thái thanh toán dùng redirect + polling/đếm ngược + webhook elepay.
- ❌ Stripe / PayPal / VNPay — chỉ elepay.
- ❌ Rich text editor — không có nhu cầu.
- ❌ `react-barcode-scanner` — dùng `@zxing/browser`.
- ❌ Giỏ hàng trong localStorage — giỏ ở server.

---

## 12. Màu và việc dev còn tồn đọng (2026-10-16)

**Token màu — chưa khớp thiết kế:** nền App dùng `bg-warning-200`; PWA `theme_color` = `#fee28a` (warning-200, vàng). Chưa đối chiếu toàn bộ với `design_rule.md`. Cần:
1. Hỏi Designer màu chính thức cho E07 (có thể vàng như E01 Mobile, hoặc màu mới).
2. Nối `next-themes` provider nếu cần dark mode.
3. Đưa token vào Tailwind theo `.claude/rules/design_rule.md`.

**Việc dev repo cần làm:**
1. `package.json` name `"es-kitchen-web-payment"` vẫn lệch tên repo (đã bỏ lỗi `es-kitchen-web-admin`).
2. `README.md` vẫn mô tả web-supplier (Ant Design + Redux) — viết lại.
3. Alias `@assets` (vite + tsconfig) trỏ `src/assets/` nhưng thư mục là `src/statics/`.
4. `next-themes`: chưa có `ThemeProvider`.
5. Chưa có Vitest; không còn script `lint`.
6. `pages/menu/MenuPage.tsx` không có route — xác nhận xóa hay đưa vào router.
7. Script deploy giả (có `deploy.sh` ở root, chưa đọc).
