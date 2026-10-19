# es-kitchen-webapp-payment — Cấu trúc Source

> Nguồn = es-kitchen-webapp-payment@4bee823 ngày 2026-10-16 (HEAD, working tree sạch; 50 commit tổng).
> Repo: `es-kitchen-webapp-payment` · Epic: **E07 User Web Ordering** (mới)
> Vai trò: web variant cho end user đặt hàng — quét QR cabinet/shop → menu theo category → chi tiết sản phẩm → cart (server-side) → payment (elepay) → trạng thái / lịch sử / hoàn tiền đơn. PWA mobile-first, song song với E01 Mobile.

---

## Tech stack

| Layer | Package | Version |
|---|---|---|
| Framework | React + React DOM | 19.2.6 |
| Build | Vite | 8.0.13 |
| Language | TypeScript | 6.0.3 |
| UI base | **shadcn/ui** + @base-ui/react + radix-ui | 1.4.1 / 1.4.3 |
| Icons | lucide-react | 1.16.0 |
| CSS utility | TailwindCSS + `@tailwindcss/vite` | 4.3.0 |
| Client state | **zustand** (4 stores; 1 persist sessionStorage) | 5.0.13 |
| Server state | @tanstack/react-query | 5.100.10 |
| Router | react-router-dom | 7.15.1 |
| Forms | react-hook-form + @hookform/resolvers + yup | 7.76.0 / 5.2.2 / 1.7.1 |
| HTTP | axios | 1.16.1 |
| Cookies | js-cookie | 3.0.7 |
| Toast | **sonner** | 2.0.7 |
| Date | dayjs | 1.11.20 |
| **Payment SDK** | **elepay-js-sdk** | ^2.0.0 |
| **Barcode Scanner** | **@zxing/browser** + `@zxing/library` (`BrowserMultiFormatOneDReader`, JAN/EAN/UPC/CODE_128/ITF — quét mã vạch sản phẩm) | 0.2.1 / 0.23.0 |
| Theme | next-themes | 0.4.6 (chỉ `components/ui/sonner.tsx` dùng `useTheme`; chưa có `ThemeProvider`) |
| PWA | vite-plugin-pwa | ^1.3.0 |
| SVG | vite-plugin-svgr | 5.2.0 |
| Font | @fontsource-variable/noto-sans-jp | 5.2.10 |

> **Cùng nhóm stack với E06 webapp-driver** (shadcn + Base UI + Radix + zustand + Sonner + lucide-react) nhưng có thêm **elepay SDK + @zxing scanner + PWA**.

---

## Known gaps (chỉ note — không tự sửa source)

| Vấn đề | Chi tiết | Ai fix |
|---|---|---|
| `package.json` name | Đã đổi từ `es-kitchen-web-admin` thành `"es-kitchen-web-payment"` (vẫn khác tên repo `es-kitchen-webapp-payment`); version `0.0.0` | Dev repo |
| `README.md` mô tả sai | VẪN là "ES Kitchen Web Supplier" + Ant Design + Redux — stale, không phản ánh stack thật | Dev repo |
| `@assets` alias mismatch | Vẫn trỏ `src/assets/` (vite + tsconfig) nhưng folder thực là `src/statics/` | Dev repo |
| `next-themes` chưa wire | Không có `ThemeProvider`; chỉ `sonner.tsx` gọi `useTheme` | Product decision |
| Test / deploy script placeholder | `npm test` = echo; `deploy:*` = echo (có thêm `deploy.sh` ở root) | Dev repo / DevOps |
| Không có script `lint` | `package.json` không còn `lint`/`lint:fix` (lint-staged chỉ chạy prettier); có `eslint.config.js` | Dev repo |
| `pages/menu/MenuPage.tsx` không được route | Không có import nào ngoài chính nó — menu duyệt nằm ở HomePage (CategoryGrid/ProductCard) | Dev repo xác nhận dead code |

---

## Cấu trúc thư mục

```
es-kitchen-webapp-payment/
├── src/
│   ├── components/
│   │   ├── ui/           ← shadcn/Base-UI: button, checkbox, dialog, field, input, input-group, label, password-input, radio-group, separator, sonner, spinner, textarea
│   │   ├── Common/       ← BaseBottomSheet, BaseEmpty, BaseLoading, BaseLoadingFullScreen, BasePressable, BaseSegmentedTabs, BaseTabs, PageHeader, ProductImage, QuantityStepper
│   │   ├── Layout/       ← Header (top app bar), Footer
│   │   └── PWAInstall/   ← InstallBanner, IOSInstallGuide (prompt cài PWA)
│   ├── constants/        ← route paths, error/success messages, date formats
│   ├── enums/
│   ├── hooks/            ← 29 hook (cart, checkout, order, refund, payment, barcode scan, guest session, PWA, legal…)
│   ├── layouts/          ← AppLayout.tsx (single layout: Header + Outlet)
│   ├── lib/              ← utility libs (cn helper)
│   ├── models/           ← 12 file (auth, user, company, cart, order, menu, payment, refund, legal, common, file-upload, Response)
│   ├── pages/            ← home, product, cart, orders, scan, payment, shop, legal, errors (+ menu: không route)
│   ├── routes/           ← Router + guards (RequireCompany, NoCompanyOnly)
│   ├── services/
│   │   ├── http/         ← axios instance + JWT interceptors + userData/companySession helpers
│   │   ├── query/        ← TanStack Query client + base query
│   │   └── client/       ← api.ts + 12 service (gồm elepay.ts adapter)
│   ├── shared/           ← Providers, theme (chưa wire)
│   ├── statics/          ← images (logo, icons), fonts
│   ├── stores/           ← 4 zustand stores (auth, user, companySession, checkout)
│   ├── styles/           ← Tailwind entrypoint + global SCSS
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   ├── config.ts
│   ├── index.css
│   └── main.tsx
│
├── public/               ← PWA icons + favicon (+ .well-known tự viết)
├── vite.config.ts        ← PWA config (manifest + service worker)
├── tsconfig.app.json
└── package.json
```

---

## Routes — user ordering flow

Tất cả lazy-loaded với Suspense (`BaseLoadingFullScreen`); mọi route nằm dưới `AppLayout`. Đếm từ `src/routes/index.tsx`: **15 path + catch-all `*`** (trước: 10 + `*`; thêm `/products/:productId`, `/orders` (history), `/orders/status`, `/orders/:orderId/refund`, `/terms`).

| Path | Guard | Component | Vai trò |
|---|---|---|---|
| `/shop/:code` | — (không guard) | ShopEntryPage | QR entry — resolve company/branch từ code (`useResolveQrCompany`) |
| `/invalid-code` | `NoCompanyOnly` | InvalidCodePage | QR invalid/expired; hiển thị link cài app (`VITE_APP_INSTALL_URL`) cho branch app-only |
| `*` | `NoCompanyOnly` | Navigate → `/invalid-code` | Catch-all (đã có company thì guard đẩy về `/`) |
| `/` (index) | `RequireCompany` | HomePage | Home: category grid, ProductCard, SideMenu, nút scan barcode |
| `/scan` | `RequireCompany` | ScanPage | Quét barcode sản phẩm → thêm vào cart |
| `/products/:productId` | `RequireCompany` | ProductDetailPage | Chi tiết SP: dinh dưỡng, allergen, thành phần, nhà sản xuất |
| `/cart` | `RequireCompany` | CartPage | Xem cart (flag tồn kho) |
| `/cart/confirm` | `RequireCompany` | CartConfirmPage | Confirm order trước checkout |
| `/cart/payment-methods` | `RequireCompany` | PaymentMethodPage | Chọn payment method / thẻ đã lưu |
| `/orders/pending` | `RequireCompany` | PendingOrderPage | Order đang chờ thanh toán (retry/cancel) |
| `/orders/status` | `RequireCompany` | OrderStatusPage | Đích redirect của gateway Elepay (chargeId, orderNo, status) |
| `/orders` | `RequireCompany` | OrderHistoryPage | Lịch sử đơn |
| `/orders/:orderId` | `RequireCompany` | OrderDetailPage (pages/cart) | Chi tiết order/receipt |
| `/orders/:orderId/refund` | `RequireCompany` | RefundPage | Yêu cầu hoàn tiền (cửa sổ 30 phút từ `paidAt`) |
| `/terms` | `RequireCompany` | TermsPrivacyPage | Điều khoản / privacy (HTML CMS qua `sanitizeHtml`) |
| `/payment/success` | `RequireCompany` | PaymentSuccessPage | Xác nhận payment thành công |

### Route guards

- **`RequireCompany`** — chưa có company session → redirect `/invalid-code`
- **`NoCompanyOnly`** — đã có company session → redirect `/` (nên `/invalid-code` + `*` chỉ cho khách chưa vào shop)

---

## Pages (src/pages/)

| Folder | Files | Vai trò |
|---|---|---|
| `home/` | HomePage + CategoryGrid, HomeHeader, ProductCard, ProductTag, ScanBarCodeBtn, SideMenu | Browse menu theo category |
| `product/` | ProductDetailPage + 11 section (Allergen, Nutrition, Gallery, Lightbox, QuantitySelector…) | Chi tiết sản phẩm |
| `cart/` | CartPage, CartConfirmPage, PaymentMethodPage, PendingOrderPage, OrderDetailPage + 10 component (dialog: CartReset, CartStockError, HasPendingOrder, OrderAmountLimit, CancelPayment…) | Cart, checkout, order detail |
| `orders/` | OrderHistoryPage, OrderStatusPage, RefundPage + 5 component | Lịch sử, trạng thái sau gateway, hoàn tiền |
| `scan/` | ScanPage + ScanViewport, ScanSuccessDialog | Quét barcode |
| `payment/` | PaymentSuccessPage | Success receipt |
| `shop/` | ShopEntryPage | Entry từ QR `/shop/:code` |
| `legal/` | TermsPrivacyPage | Terms/Privacy |
| `errors/` | InvalidCodePage | Fallback invalid/expired QR |
| `menu/` | MenuPage | KHÔNG được route (xem Known gaps) |

---

## Stores — 4 zustand stores

| Store | File | Vai trò |
|---|---|---|
| `useAuthStore` | `stores/useAuthStore.ts` | `accessToken` phản chiếu cookie; `setTokens`/`clearTokens` (clear cũng reset checkout store) |
| `useUserStore` | `stores/useUserStore.ts` | Profile từ cookie, refresh bằng `GET /user/me` (`useSyncUserProfile`); không có action clear |
| `useCompanySessionStore` | `stores/useCompanySessionStore.ts` | Company/branch đang chọn, lưu cookie; `setCompany/switchCompany/clearCompany/revokeCompany/syncCompanyFromCookies` |
| `useCheckoutStore` | `stores/useCheckoutStore.ts` | CHỈ `paymentMethodId` + `cardId`, persist `sessionStorage` (key `checkout`) để reload không mất lựa chọn. Cart KHÔNG ở đây nữa (cart server-side) |

---

## API services — `src/services/`

**HTTP:** `axios.instance.ts` · `handleRequest.ts` (gắn token) · `handleResponse.ts` · `authToken.ts` · `userData.ts` (cookie profile) · `companySession.ts` (cookie company + revoked code)

**Client services (`services/client/`, 12 + `api.ts`):**
| Service | Vai trò |
|---|---|
| `auth.service.ts` | `/auth/user/guest` — cấp guest token |
| `user.service.ts` | `/user/me`, thẻ/phương thức mặc định |
| `qr.service.ts` | `/user/orders/validate-company` — resolve company từ QR code |
| `menu.service.ts` | `/user/categories`, danh sách/chi tiết sản phẩm |
| `cart.service.ts` | Cart SERVER-SIDE: `/user/cart`, `/items`, `/stock-check`, `/sync-stock`, `/reset-status`, `/reset-ack`, `/orders/check-limit` |
| `order.service.ts` | `/user/orders/{checkout,pending,history,:id,:id/cancel,:id/retry-payment}` |
| `payment.service.ts` | `/user/payment-methods[/credit-card(s)/…]`, `/user/elepay/public-key` |
| `elepay.ts` | Adapter `elepay-js-sdk` (`loadElepay`, `handleCharge`/`handleSource`, locale `ja`) |
| `refund.service.ts` | `/user/refunds` |
| `legal.service.ts` | `/user/legal/{terms,privacy}` |
| `file-upload.service.ts` | `/files/presigned-upload-url` |
| `error-report.service.ts` | `/api/error/report` |

**Query:** `queryClient.ts` + `baseQuery.ts`

---

## Custom hooks — 15+ trong `src/hooks/`

**Cart & checkout:** `useCart`, `useCartReset`, `useCartStockSync`, `useBranchStockStatus`, `useCheckout`, `usePaymentMethods`, `usePaymentCountdown`, `useGuestPaymentGuard`

**Order & refund:** `useOrder`, `useOrderHistory`, `useRefund`

**Menu & scan:** `useCategories`, `useMenuProducts`, `useProductDetail`, `useBarcodeScanner`, `useScanToCart`

**Session & auth:** `useGuestLogin`, `useEnsureGuestSession`, `useCompanySession`, `useResolveQrCompany`, `useSyncCompanySession`, `useSyncUserProfile`

**Khác:** `useLegalDocument`, `usePWAInstall`, `useMutationCustom`, `useTableParams`, `useDebouncedValue`, `useInView`, `router`

---

## Auth strategy

- **Guest-first:** vào shop qua QR không cần đăng ký — `useGuestLogin` gọi `/auth/user/guest`, lưu token qua `js-cookie`; `useEnsureGuestSession` đảm bảo có session trước khi gọi API
- **Token:** `useAuthStore.accessToken` phản chiếu cookie; `handleRequest.ts` gắn Bearer; `handleResponse.ts` xử lý lỗi/401
- **Profile:** `useSyncUserProfile` → `GET /user/me` → `useUserStore` (cookie)
- **Company binding:** `useSyncCompanySession` kiểm tra lại company/guest flag khi load; `useGuestPaymentGuard` kiểm lại trước khi thanh toán (branch có thể tắt guest ordering giữa chừng → chuyển sang màn app-only); company bị thu hồi lưu `revokedCompanyCode` cookie
- **Thẻ đã lưu / member:** `cardId` trong checkout store "chỉ set khi member trả bằng thẻ đã lưu" — luồng đăng nhập member chưa xác nhận đầy đủ trong lượt sync này

---

## Path aliases — `tsconfig.app.json` + `vite.config.ts`

| Alias | Path |
|---|---|
| `@` / `@/*` | `src/` |
| `@components` `@layouts` `@pages` `@routes` `@services` `@shared` `@hooks` `@utils` `@types` `@assets` | các folder tương ứng |

---

## Environment variables (.env.example)

| Var | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Backend API base URL |
| `VITE_AUTH_URL` | Authentication service URL (có trong `.env.example`; chưa kiểm tra chỗ dùng) |
| `VITE_APP_INSTALL_URL` | App store link — hiển thị trên `/invalid-code` cho shop app-only |

---

## Bootstrap — `src/main.tsx` + `App.tsx`

```
main.tsx:
  createRoot → StrictMode → QueryClientProvider → App

App.tsx:
  Fixed viewport container (h-dvh w-screen bg-warning-200, content max-w-3xl)
  ├── <RouterProvider router={router} />
  ├── <Toaster position="top-center" /> — Sonner
  └── preload logo image (react-dom `preload`)

main.tsx: import "@/utils/pwa" (bắt beforeinstallprompt sớm) + watchForServiceWorkerUpdate()
```

**Chưa mount:** `<ThemeProvider>` từ next-themes (mặc dù dep có).
**Dev server:** port 3006 (`vite.config.ts`) — trùng port với E06 driver.

---

## Styling

- **TailwindCSS 4.3** — `@tailwindcss/vite` (JIT)
- **Base UI React** — unstyled primitive (button, dialog, select) → custom style qua Tailwind trong `components/ui/`
- **Global CSS:** `src/index.css` — Tailwind `@import`
- **Fonts:** Noto Sans JP variable font qua `@fontsource-variable`
- **Animation:** `tw-animate-css`
- **Design token:** nền `bg-warning-200` (yellow) trong App.tsx — class token đã có; chưa đối chiếu toàn bộ với `design_rule.md`

---

## PWA — `vite.config.ts`

```typescript
VitePWA({
  registerType: "autoUpdate",
  workbox: { cleanupOutdatedCaches: true, skipWaiting: true, clientsClaim: true },
  injectRegister: "auto",   // + utils/swUpdate reload trang khi SW mới takeover
  includeAssets: ["favicon.png", "apple-touch-icon.png"],
  manifest: {
    name: "ESKitchen Payment App",
    short_name: "ESKitchen",
    description: "ESKitchen ordering & payment app",
    lang: "ja",
    start_url: "/", scope: "/",
    display: "standalone", orientation: "portrait",
    theme_color: "#fee28a",   // warning-200 yellow
    background_color: "#fee28a",
    icons: [192×192, 512×512, 512×512 maskable]
  }
})
```

---

## Notable features

| Feature | Implementation |
|---|---|
| Barcode scan | `@zxing/browser` trong `hooks/useBarcodeScanner.ts` (100ms/frame) + `useScanToCart`; `ScanPage` + `ScanViewport` |
| Payment | `elepay-js-sdk` v2 qua `services/client/elepay.ts` (public key từ `/user/elepay/public-key`, không bundle key); gateway redirect về `/orders/status`; log qua `utils/client/paymentLogger.ts` (`?debugPayment=1`) |
| Cart server-side + stock | `/user/cart*`; `useCartStockSync` gắn cờ dòng hết hàng (BE không còn tự xoá); dialog CartStockError / OrderAmountLimit / HasPendingOrder |
| Refund | `RefundPage` + `useRefund`, cửa sổ 30 phút tính từ `payment.paidAt` |
| Legal | `/terms` + `utils/client/sanitizeHtml.ts` (allowlist, trả DocumentFragment) |
| PWA | `vite-plugin-pwa` autoUpdate + skipWaiting/clientsClaim; `components/PWAInstall` (banner + hướng dẫn iOS) |
| Theme yellow | `#fee28a` (`warning-200`) — PWA theme_color + nền App |
| Toast | Sonner top-center |
| Infinite scroll | `useInView` |
| Font | Noto Sans JP variable |

---

## Models — 12 file

`auth.ts` · `user.ts` · `company.ts` (CompanySession) · `cart.ts` · `order.ts` · `menu.ts` · `payment.ts` · `refund.ts` · `legal.ts` · `common.ts` · `file-upload.ts` · `Response.ts` (IBaseApiResponse)

---

## Không có

- ❌ Ant Design
- ❌ Redux Toolkit (dùng zustand — 4 store)
- ❌ react-toastify (dùng Sonner)
- ❌ Socket.IO — payment status qua redirect `/orders/status` + polling/countdown
- ❌ Rich text editor
- ❌ Dark mode wire-up (next-themes imported nhưng chưa dùng)
- ❌ Test framework (placeholder script)
