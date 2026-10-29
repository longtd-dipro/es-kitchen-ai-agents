# es-kitchen-webapp-payment — Cấu trúc Source

> Nguồn = es-kitchen-webapp-payment@4bee823 ngày 2026-10-16 (HEAD, working tree sạch; 50 commit tổng).
> Repo: `es-kitchen-webapp-payment` · Epic: **E07 User Web Ordering** (mới).

**File này nói gì:** bản đồ repo E07 — web cho khách đặt hàng: quét QR tủ/cửa hàng, xem menu, giỏ hàng, thanh toán elepay, lịch sử và hoàn tiền.
**Đọc khi:** mới vào repo, hoặc cần biết "file/route/store này nằm ở đâu, làm gì".
**Đọc tiếp:** `patterns.md` (cách làm từng việc).

Vai trò: PWA ưu tiên điện thoại, chạy song song với E01 Mobile (app native).
Chuỗi chính: quét QR cabinet/shop → menu theo category → chi tiết sản phẩm → giỏ hàng (lưu ở server) → thanh toán (elepay) → trạng thái / lịch sử / hoàn tiền.

> **Cùng nhóm stack với E06 `webapp-driver`** (shadcn + Base UI + Radix + zustand + Sonner + lucide-react). Khác với E02–E05 (Ant Design + Redux). E07 có thêm **elepay SDK + @zxing (quét mã vạch) + PWA**.

---

## 1. Tech stack

| Lớp | Package | Version |
|---|---|---|
| Framework | React + React DOM | 19.2.6 |
| Build | Vite | 8.0.13 |
| Ngôn ngữ | TypeScript | 6.0.3 |
| UI nền | **shadcn/ui** + @base-ui/react + radix-ui | 1.4.1 / 1.4.3 |
| Icon | lucide-react | 1.16.0 |
| CSS | TailwindCSS + `@tailwindcss/vite` | 4.3.0 |
| State client | **zustand** (4 store; 1 store persist sessionStorage) | 5.0.13 |
| State server (dữ liệu API) | @tanstack/react-query | 5.100.10 |
| Router | react-router-dom | 7.15.1 |
| Form | react-hook-form + @hookform/resolvers + yup | 7.76.0 / 5.2.2 / 1.7.1 |
| HTTP | axios | 1.16.1 |
| Cookie | js-cookie | 3.0.7 |
| Toast | **sonner** | 2.0.7 |
| Ngày | dayjs | 1.11.20 |
| **SDK thanh toán** | **elepay-js-sdk** | ^2.0.0 |
| **Quét mã vạch** | **@zxing/browser** + `@zxing/library` (`BrowserMultiFormatOneDReader`; JAN/EAN/UPC/CODE_128/ITF — mã vạch sản phẩm) | 0.2.1 / 0.23.0 |
| Theme | next-themes | 0.4.6 (chỉ `components/ui/sonner.tsx` dùng `useTheme`; chưa có `ThemeProvider`) |
| PWA | vite-plugin-pwa | ^1.3.0 |
| SVG | vite-plugin-svgr | 5.2.0 |
| Font | @fontsource-variable/noto-sans-jp | 5.2.10 |

---

## 2. Known gaps (chỉ ghi nhận — không tự sửa source)

| Vấn đề | Chi tiết | Ai sửa |
|---|---|---|
| `package.json` name | Đã đổi từ `es-kitchen-web-admin` thành `"es-kitchen-web-payment"` (vẫn khác tên repo `es-kitchen-webapp-payment`); version `0.0.0` | Dev repo |
| `README.md` sai | VẪN ghi "ES Kitchen Web Supplier" + Ant Design + Redux — cũ, không phản ánh stack thật | Dev repo |
| Alias `@assets` lệch | Vẫn trỏ `src/assets/` (vite + tsconfig) nhưng thư mục thật là `src/statics/` | Dev repo |
| `next-themes` chưa nối | Không có `ThemeProvider`; chỉ `sonner.tsx` gọi `useTheme` | Quyết định sản phẩm |
| Script test / deploy giả | `npm test` = echo; `deploy:*` = echo (có thêm `deploy.sh` ở root) | Dev repo / DevOps |
| Không có script `lint` | `package.json` không còn `lint`/`lint:fix` (lint-staged chỉ chạy prettier); có `eslint.config.js` | Dev repo |
| `pages/menu/MenuPage.tsx` không có route | Không file nào import nó ngoài chính nó — menu duyệt nằm ở HomePage (CategoryGrid/ProductCard) | Dev repo xác nhận dead code |

---

## 3. Cây thư mục

```
es-kitchen-webapp-payment/
├── src/
│   ├── components/
│   │   ├── ui/           shadcn/Base-UI: button, checkbox, dialog, field, input, input-group,
│   │   │                 label, password-input, radio-group, separator, sonner, spinner, textarea
│   │   ├── Common/       BaseBottomSheet, BaseEmpty, BaseLoading, BaseLoadingFullScreen,
│   │   │                 BasePressable, BaseSegmentedTabs, BaseTabs, PageHeader, ProductImage, QuantityStepper
│   │   ├── Layout/       Header (thanh trên), Footer
│   │   └── PWAInstall/   InstallBanner, IOSInstallGuide (nhắc cài PWA)
│   ├── constants/        route, thông báo lỗi/thành công, định dạng ngày
│   ├── enums/
│   ├── hooks/            29 hook (cart, checkout, order, refund, payment, quét mã vạch, guest, PWA, legal…)
│   ├── layouts/          AppLayout.tsx (1 layout duy nhất: Header + Outlet)
│   ├── lib/              cn helper
│   ├── models/           12 file (auth, user, company, cart, order, menu, payment, refund, legal, common, file-upload, Response)
│   ├── pages/            home, product, cart, orders, scan, payment, shop, legal, errors (+ menu: không route)
│   ├── routes/           Router + guards (RequireCompany, NoCompanyOnly)
│   ├── services/
│   │   ├── http/         axios + interceptor JWT + helper userData / companySession
│   │   ├── query/        TanStack Query client + base query
│   │   └── client/       api.ts + 12 service (gồm elepay.ts adapter)
│   ├── shared/           Providers, theme (chưa nối)
│   ├── statics/          ảnh (logo, icon), font
│   ├── stores/           4 store zustand (auth, user, companySession, checkout)
│   ├── styles/           Tailwind entry + SCSS toàn cục
│   ├── types/  utils/
│   ├── App.tsx · config.ts · index.css · main.tsx
├── public/               icon PWA + favicon (+ .well-known tự viết)
├── vite.config.ts        cấu hình PWA (manifest + service worker)
├── tsconfig.app.json · package.json
```

Vì sao chia vậy: `pages/` = màn hình theo chức năng; `hooks/` = logic dữ liệu (bọc TanStack Query); `services/client/` = gọi API; `stores/` = state nhỏ phía client (phiên, shop đang chọn, lựa chọn thanh toán).

---

## 4. Dữ liệu đi từ API đến màn hình

```
Page (vd CartPage)
   │
   ▼
hook (useCart, CART_QUERY_KEY)  ── TanStack Query: cache, loading, error
   │
   ▼
service (services/client/cart.service.ts)
   │ API.* (api.ts, axios)
   ▼
interceptor: gắn Bearer + header timezone; 401 → xóa cookie token
   ▼
Backend (/user/cart, /user/orders, ...)
```

- Giỏ hàng nằm **ở server**; FE không giữ cart trong localStorage hay zustand.
- zustand chỉ giữ 4 thứ nhỏ (xem §7).

---

## 5. Routes — luồng đặt hàng

Tất cả lazy-load với Suspense (`BaseLoadingFullScreen`); mọi route nằm dưới `AppLayout`. Đếm từ `src/routes/index.tsx`: **15 path + catch-all `*`** (trước: 10 + `*`; thêm `/products/:productId`, `/orders` (history), `/orders/status`, `/orders/:orderId/refund`, `/terms`).

| Path | Guard | Component | Vai trò |
|---|---|---|---|
| `/shop/:code` | — (không guard) | ShopEntryPage | Cửa vào từ QR — tìm company/branch từ code (`useResolveQrCompany`) |
| `/invalid-code` | `NoCompanyOnly` | InvalidCodePage | QR sai/hết hạn; hiện link cài app (`VITE_APP_INSTALL_URL`) cho branch chỉ cho app |
| `*` | `NoCompanyOnly` | Navigate → `/invalid-code` | Bắt mọi đường dẫn lạ (đã có company thì guard đẩy về `/`) |
| `/` (index) | `RequireCompany` | HomePage | Lưới category, ProductCard, SideMenu, nút quét mã vạch |
| `/scan` | `RequireCompany` | ScanPage | Quét mã vạch sản phẩm → thêm vào giỏ |
| `/products/:productId` | `RequireCompany` | ProductDetailPage | Chi tiết: dinh dưỡng, allergen, thành phần, nhà sản xuất |
| `/cart` | `RequireCompany` | CartPage | Xem giỏ (có cờ tồn kho) |
| `/cart/confirm` | `RequireCompany` | CartConfirmPage | Xác nhận đơn trước thanh toán |
| `/cart/payment-methods` | `RequireCompany` | PaymentMethodPage | Chọn phương thức / thẻ đã lưu |
| `/orders/pending` | `RequireCompany` | PendingOrderPage | Đơn đang chờ thanh toán (thử lại / hủy) |
| `/orders/status` | `RequireCompany` | OrderStatusPage | Đích gateway elepay chuyển về (chargeId, orderNo, status) |
| `/orders` | `RequireCompany` | OrderHistoryPage | Lịch sử đơn |
| `/orders/:orderId` | `RequireCompany` | OrderDetailPage (nằm ở `pages/cart`) | Chi tiết đơn / biên nhận |
| `/orders/:orderId/refund` | `RequireCompany` | RefundPage | Yêu cầu hoàn tiền (cửa sổ 30 phút từ `paidAt`) |
| `/terms` | `RequireCompany` | TermsPrivacyPage | Điều khoản / bảo mật (HTML từ CMS qua `sanitizeHtml`) |
| `/payment/success` | `RequireCompany` | PaymentSuccessPage | Thanh toán thành công |

**Guard:**
- **`RequireCompany`** — chưa có company session → redirect `/invalid-code`.
- **`NoCompanyOnly`** — đã có company session → redirect `/` (nên `/invalid-code` và `*` chỉ dành cho khách chưa vào shop).

---

## 6. Pages (`src/pages/`)

| Thư mục | File | Vai trò |
|---|---|---|
| `home/` | HomePage + CategoryGrid, HomeHeader, ProductCard, ProductTag, ScanBarCodeBtn, SideMenu | Duyệt menu theo category |
| `product/` | ProductDetailPage + 11 section (Allergen, Nutrition, Gallery, Lightbox, QuantitySelector…) | Chi tiết sản phẩm |
| `cart/` | CartPage, CartConfirmPage, PaymentMethodPage, PendingOrderPage, OrderDetailPage + 10 component (dialog: CartReset, CartStockError, HasPendingOrder, OrderAmountLimit, CancelPayment…) | Giỏ, checkout, chi tiết đơn |
| `orders/` | OrderHistoryPage, OrderStatusPage, RefundPage + 5 component | Lịch sử, trạng thái sau gateway, hoàn tiền |
| `scan/` | ScanPage + ScanViewport, ScanSuccessDialog | Quét mã vạch |
| `payment/` | PaymentSuccessPage | Biên nhận thành công |
| `shop/` | ShopEntryPage | Cửa vào từ QR `/shop/:code` |
| `legal/` | TermsPrivacyPage | Điều khoản / bảo mật |
| `errors/` | InvalidCodePage | QR sai / hết hạn |
| `menu/` | MenuPage | KHÔNG có route (xem §2) |

---

## 7. Stores — 4 store zustand

| Store | File | Vai trò |
|---|---|---|
| `useAuthStore` | `stores/useAuthStore.ts` | `accessToken` phản chiếu cookie; `setTokens` / `clearTokens` (clear cũng reset checkout store) |
| `useUserStore` | `stores/useUserStore.ts` | Profile từ cookie, làm mới bằng `GET /user/me` (`useSyncUserProfile`); không có action clear |
| `useCompanySessionStore` | `stores/useCompanySessionStore.ts` | Company/branch đang chọn, lưu cookie; `setCompany` / `switchCompany` / `clearCompany` / `revokeCompany` / `syncCompanyFromCookies` |
| `useCheckoutStore` | `stores/useCheckoutStore.ts` | CHỈ `paymentMethodId` + `cardId`, persist `sessionStorage` (key `checkout`) để reload không mất lựa chọn. Giỏ hàng KHÔNG ở đây (cart ở server) |

---

## 8. API services (`src/services/`)

**HTTP:** `axios.instance.ts` · `handleRequest.ts` (gắn token) · `handleResponse.ts` (401 → xóa cookie token) · `authToken.ts` · `userData.ts` (cookie profile) · `companySession.ts` (cookie company + mã bị thu hồi).

**Client services (`services/client/`, 12 + `api.ts`):**

| Service | Vai trò |
|---|---|
| `auth.service.ts` | `/auth/user/guest` — cấp token khách |
| `user.service.ts` | `/user/me`, thẻ / phương thức mặc định |
| `qr.service.ts` | `/user/orders/validate-company` — tìm company từ mã QR |
| `menu.service.ts` | `/user/categories`, danh sách / chi tiết sản phẩm |
| `cart.service.ts` | Giỏ ở SERVER: `/user/cart`, `/items`, `/stock-check`, `/sync-stock`, `/reset-status`, `/reset-ack`, `/orders/check-limit` |
| `order.service.ts` | `/user/orders/{checkout,pending,history,:id,:id/cancel,:id/retry-payment}` |
| `payment.service.ts` | `/user/payment-methods[/credit-card(s)/…]`, `/user/elepay/public-key` |
| `elepay.ts` | Adapter `elepay-js-sdk` (`loadElepay`, `handleCharge` / `handleSource`, locale `ja`) |
| `refund.service.ts` | `/user/refunds` |
| `legal.service.ts` | `/user/legal/{terms,privacy}` |
| `file-upload.service.ts` | `/files/presigned-upload-url` |
| `error-report.service.ts` | `/api/error/report` |

**Query:** `queryClient.ts` + `baseQuery.ts`.

---

## 9. Custom hooks (`src/hooks/`, 29 file)

| Nhóm | Hook |
|---|---|
| Giỏ & thanh toán | `useCart`, `useCartReset`, `useCartStockSync`, `useBranchStockStatus`, `useCheckout`, `usePaymentMethods`, `usePaymentCountdown`, `useGuestPaymentGuard` |
| Đơn & hoàn tiền | `useOrder`, `useOrderHistory`, `useRefund` |
| Menu & quét | `useCategories`, `useMenuProducts`, `useProductDetail`, `useBarcodeScanner`, `useScanToCart` |
| Phiên & auth | `useGuestLogin`, `useEnsureGuestSession`, `useCompanySession`, `useResolveQrCompany`, `useSyncCompanySession`, `useSyncUserProfile` |
| Khác | `useLegalDocument`, `usePWAInstall`, `useMutationCustom`, `useTableParams`, `useDebouncedValue`, `useInView`, `router` |

---

## 10. Phiên đăng nhập (auth)

- **Khách vào trước (guest-first):** vào shop qua QR không cần đăng ký. `useGuestLogin` gọi `/auth/user/guest`, lưu token qua `js-cookie`; `useEnsureGuestSession` đảm bảo có phiên trước khi gọi API.
- **Token:** `useAuthStore.accessToken` phản chiếu cookie; `handleRequest.ts` gắn Bearer; `handleResponse.ts` xử lý 401.
- **Profile:** `useSyncUserProfile` → `GET /user/me` → `useUserStore` (cookie).
- **Gắn với shop:** `useSyncCompanySession` kiểm lại company / cờ guest khi tải trang; `useGuestPaymentGuard` kiểm lại trước khi thanh toán (branch có thể tắt đặt hàng cho khách giữa chừng → chuyển sang màn chỉ-cho-app). Company bị thu hồi lưu cookie `revokedCompanyCode`.
- **Thẻ đã lưu / member:** `cardId` trong checkout store "chỉ set khi member trả bằng thẻ đã lưu" — luồng đăng nhập member chưa xác nhận đầy đủ trong lượt sync này.

---

## 11. Path alias (`tsconfig.app.json` + `vite.config.ts`)

| Alias | Trỏ tới |
|---|---|
| `@` / `@/*` | `src/` |
| `@components` `@layouts` `@pages` `@routes` `@services` `@shared` `@hooks` `@utils` `@types` `@assets` | thư mục tương ứng (`@assets` đang lệch, xem §2) |

---

## 12. Biến môi trường (`.env.example`)

| Biến | Dùng để |
|---|---|
| `VITE_API_BASE_URL` | URL gốc API |
| `VITE_AUTH_URL` | URL dịch vụ xác thực (có trong `.env.example`; chưa kiểm tra chỗ dùng) |
| `VITE_APP_INSTALL_URL` | Link cửa hàng app — hiện ở `/invalid-code` cho shop chỉ-cho-app |

---

## 13. Khởi động app

```
main.tsx:  createRoot → StrictMode → QueryClientProvider → App
           import "@/utils/pwa" (bắt beforeinstallprompt sớm) + watchForServiceWorkerUpdate()

App.tsx:   khung cố định (h-dvh w-screen bg-warning-200, nội dung max-w-3xl)
  ├── <RouterProvider router={router} />
  ├── <Toaster position="top-center" />   Sonner
  └── preload ảnh logo (react-dom `preload`)
```

Chưa mount `<ThemeProvider>` của next-themes (dù có dependency). Dev server cổng 3006 (`vite.config.ts`) — **trùng cổng với E06 driver**, không chạy cùng lúc.

---

## 14. Giao diện

- TailwindCSS 4.3 — `@tailwindcss/vite` (JIT).
- Base UI React (primitive không style: button, dialog, select) → style bằng Tailwind trong `components/ui/`.
- CSS toàn cục `src/index.css` (Tailwind `@import`); font Noto Sans JP variable; animation `tw-animate-css`.
- **Token màu:** nền `bg-warning-200` (vàng) trong App.tsx — class token đã có; chưa đối chiếu toàn bộ với `design_rule.md`.

---

## 15. PWA (`vite.config.ts`)

```typescript
VitePWA({
  registerType: "autoUpdate",
  workbox: { cleanupOutdatedCaches: true, skipWaiting: true, clientsClaim: true },
  injectRegister: "auto",   // + utils/swUpdate reload trang khi SW mới nắm quyền
  includeAssets: ["favicon.png", "apple-touch-icon.png"],
  manifest: {
    name: "ESKitchen Payment App", short_name: "ESKitchen",
    description: "ESKitchen ordering & payment app", lang: "ja",
    start_url: "/", scope: "/", display: "standalone", orientation: "portrait",
    theme_color: "#fee28a", background_color: "#fee28a",   // warning-200 vàng
    icons: [192×192, 512×512, 512×512 maskable]
  }
})
```

---

## 16. Tính năng đáng chú ý

| Tính năng | Cách làm |
|---|---|
| Quét mã vạch | `@zxing/browser` trong `hooks/useBarcodeScanner.ts` (100ms/khung hình) + `useScanToCart`; `ScanPage` + `ScanViewport` |
| Thanh toán | `elepay-js-sdk` v2 qua `services/client/elepay.ts` (public key lấy từ `/user/elepay/public-key`, không bundle key); gateway redirect về `/orders/status`; log ở `utils/client/paymentLogger.ts` (`?debugPayment=1`) |
| Giỏ ở server + tồn kho | `/user/cart*`; `useCartStockSync` gắn cờ dòng hết hàng (BE không còn tự xóa); dialog CartStockError / OrderAmountLimit / HasPendingOrder |
| Hoàn tiền | `RefundPage` + `useRefund`, cửa sổ 30 phút từ `payment.paidAt` |
| Điều khoản | `/terms` + `utils/client/sanitizeHtml.ts` (allowlist, trả DocumentFragment) |
| PWA | `vite-plugin-pwa` autoUpdate + skipWaiting/clientsClaim; `components/PWAInstall` (banner + hướng dẫn iOS) |
| Màu vàng | `#fee28a` (`warning-200`) — PWA theme_color + nền App |
| Cuộn vô hạn | `useInView` |

**Model (12 file):** `auth.ts` · `user.ts` · `company.ts` (CompanySession) · `cart.ts` · `order.ts` · `menu.ts` · `payment.ts` · `refund.ts` · `legal.ts` · `common.ts` · `file-upload.ts` · `Response.ts` (IBaseApiResponse).

---

## 17. Không có

- Ant Design · Redux Toolkit (dùng zustand) · react-toastify (dùng Sonner).
- Socket.IO — trạng thái thanh toán đi qua redirect `/orders/status` + polling/đếm ngược.
- Rich text editor · dark mode (next-themes chưa nối) · test framework (script giả).
