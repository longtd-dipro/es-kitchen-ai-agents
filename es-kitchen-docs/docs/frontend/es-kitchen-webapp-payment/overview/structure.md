# es-kitchen-webapp-payment — Cấu trúc Source

> Repo: `es-kitchen-webapp-payment` · Epic: **E07 User Web Ordering** (mới)
> Vai trò: web variant cho end user đặt hàng — QR scan → chọn shop → menu → cart → payment (elepay). PWA mobile-first, song song với E01 Mobile.

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
| Client state | **zustand** (4 stores) | 5.0.13 |
| Server state | @tanstack/react-query | 5.100.10 |
| Router | react-router-dom | 7.15.1 |
| Forms | react-hook-form + @hookform/resolvers + yup | 7.76.0 / 5.2.2 / 1.7.1 |
| HTTP | axios | 1.16.1 |
| Cookies | js-cookie | 3.0.7 |
| Toast | **sonner** | 2.0.7 |
| Date | dayjs | 1.11.20 |
| **Payment SDK** | **elepay-js-sdk** | ^2.0.0 |
| **QR Scanner** | **@zxing/browser** + `@zxing/library` | 0.2.1 / 0.23.0 |
| Theme | next-themes | 0.4.6 (**imported nhưng chưa wire**) |
| PWA | vite-plugin-pwa | ^1.3.0 |
| SVG | vite-plugin-svgr | 5.2.0 |
| Font | @fontsource-variable/noto-sans-jp | 5.2.10 |

> **Cùng nhóm stack với E06 webapp-driver** (shadcn + Base UI + Radix + zustand + Sonner + lucide-react) nhưng có thêm **elepay SDK + @zxing scanner + PWA**.

---

## Known gaps (chỉ note — không tự sửa source)

| Vấn đề | Chi tiết | Ai fix |
|---|---|---|
| `package.json` name sai | Đang là `"es-kitchen-web-admin"` — copy-paste error khi scaffold. Đúng phải là `"es-kitchen-webapp-payment"`. | Dev repo |
| `README.md` mô tả sai | Mô tả "ES Kitchen Web Supplier" với Ant Design + Redux — stale/copy-paste, không phản ánh stack thật. | Dev repo |
| `@assets` alias mismatch | Alias trỏ `src/assets/` nhưng folder thực là `src/statics/`. | Dev repo |
| `next-themes` chưa wire | Import vào deps nhưng chưa mount `ThemeProvider` — dark mode chưa dùng. | Product decision |
| Test script placeholder | `pnpm run test` return exit 0 — chưa có Vitest/Jest. | Dev repo |
| Deploy scripts placeholder | `deploy:preview` / `deploy:production` chưa config. | DevOps |

---

## Cấu trúc thư mục

```
es-kitchen-webapp-payment/
├── src/
│   ├── components/
│   │   ├── ui/           ← shadcn/Base-UI: button, input, label, textarea, dialog, separator, spinner, field, password-input, sonner
│   │   ├── Common/       ← BaseLoading, BaseLoadingFullScreen, BaseBottomSheet, PageHeader, ProductImage, BaseTabs
│   │   └── Layout/       ← Header (top app bar: back + cart button)
│   ├── constants/        ← route paths, error/success messages, date formats
│   ├── enums/
│   ├── hooks/            ← 15+ custom hooks (cart, checkout, payment, QR scan, session, mutations)
│   ├── layouts/          ← AppLayout.tsx (single layout: Header + Outlet)
│   ├── lib/              ← utility libs (cn helper)
│   ├── models/           ← 10 domain types (auth, user, company, cart, order, menu, payment, common, file-upload, Response)
│   ├── pages/            ← home, menu, cart, scan, payment, shop, errors
│   ├── routes/           ← Router + guards (RequireCompany, NoCompanyOnly)
│   ├── services/
│   │   ├── http/         ← axios instance + JWT interceptors + userData/companySession helpers
│   │   ├── query/        ← TanStack Query client + base query
│   │   └── client/       ← 10 domain services + elepay integration
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
├── public/               ← PWA icons + favicon
├── vite.config.ts        ← PWA config (manifest + service worker)
├── tsconfig.app.json
└── package.json
```

---

## Routes — user ordering flow

Tất cả lazy-loaded với Suspense.

| Path | Guard | Component | Vai trò |
|---|---|---|---|
| `/` | — | AppLayout outlet | Root wrapper |
| `/shop/:code` | `NoCompanyOnly` | ShopEntryPage | QR entry — resolve shop từ code |
| `/invalid-code` | `NoCompanyOnly` | InvalidCodePage | QR invalid/expired fallback |
| `/` (index) | `RequireCompany` | HomePage | Menu home sau khi resolve shop |
| `/scan` | `RequireCompany` | ScanPage | QR scanner (thêm item vào cart) |
| `/cart` | `RequireCompany` | CartPage | Xem cart |
| `/cart/confirm` | `RequireCompany` | CartConfirmPage | Confirm order trước checkout |
| `/cart/payment-methods` | `RequireCompany` | PaymentMethodPage | Chọn payment method |
| `/orders/pending` | `RequireCompany` | PendingOrderPage | Trạng thái order pending |
| `/orders/:orderId` | `RequireCompany` | OrderDetailPage | Chi tiết order/receipt |
| `/payment/success` | `RequireCompany` | PaymentSuccessPage | Xác nhận payment thành công |
| `*` | `NoCompanyOnly` | Navigate to `/invalid-code` | Catch-all |

### Route guards

- **`RequireCompany`** — chặn nếu chưa resolve company session (chưa scan QR shop)
- **`NoCompanyOnly`** — dành cho guest flow (chưa vào shop)

---

## Pages (src/pages/)

| Folder | Files | Vai trò |
|---|---|---|
| `home/` | HomePage, CategoryGrid, SelectCategory | Browse menu theo category |
| `menu/` | MenuPage | Menu list theo category (pagination + infinite scroll) |
| `cart/` | CartPage, CartConfirmPage, PaymentMethodPage, PendingOrderPage, OrderDetailPage + 7 sub-components | Shopping cart, checkout flow, order tracking |
| `scan/` | ScanPage | QR scanner UI (thêm item bằng scan) |
| `payment/` | PaymentSuccessPage | Success receipt |
| `shop/` | ShopEntryPage | Shop code validation (entry point sau khi scan QR ngoài shop) |
| `errors/` | InvalidCodePage | Fallback cho invalid/expired QR |

---

## Stores — 4 zustand stores

| Store | File | Vai trò |
|---|---|---|
| `useAuthStore` | `stores/useAuthStore.ts` | JWT token, login state, token refresh (guest flow chủ yếu) |
| `useUserStore` | `stores/useUserStore.ts` | User profile (name, email) |
| `useCompanySessionStore` | `stores/useCompanySessionStore.ts` | Active shop/company session — resolved từ QR code trong `/shop/:code` |
| `useCheckoutStore` | `stores/useCheckoutStore.ts` | Cart items, order summary, payment status, checkout flow state |

---

## API services — `src/services/`

**HTTP:**
- `axios.instance.ts` — instance với JWT interceptor
- `handleRequest.ts` — add auth token vào header
- `handleResponse.ts` — global error handling
- `authToken.ts` — token refresh/management
- `userData.ts` — user profile fetch
- `companySession.ts` — shop/branch data endpoints

**Client services (10):**
| Service | Vai trò |
|---|---|
| `auth.service.ts` | Guest login, logout, session validation |
| `user.service.ts` | User profile, update preferences |
| `order.service.ts` | Create order, order history, order detail |
| `menu.service.ts` | Menu items, categories, item detail |
| `cart.service.ts` | Local cart state (persist localStorage) |
| `payment.service.ts` | Initiate payment, check payment status |
| `qr.service.ts` | Validate QR code, fetch shop info |
| `elepay.ts` | Elepay payment SDK integration |
| `file-upload.service.ts` | Upload avatar, receipt image |
| `error-report.service.ts` | Client error reporting |
| `api.ts` | Centralized API client export |

**Query:** `queryClient.ts` + `baseQuery.ts`

---

## Custom hooks — 15+ trong `src/hooks/`

**Cart & checkout:** `useCart`, `useCheckout`, `useCartReset`, `usePaymentMethods`, `usePaymentCountdown`

**Menu & scan:** `useCategories`, `useScanToCart`

**Session & auth:** `useGuestLogin`, `useEnsureGuestSession`, `useSyncCompanySession`

**UI/utility:** `useMutationCustom`, `useTableParams`, `useDebouncedValue`, `useInView`, `router`

---

## Auth strategy

- **Session type:** Guest (không bắt buộc password login) — user vào shop qua QR không cần đăng ký
- **Token:** JWT lưu qua `js-cookie`
- **Flow:**
  - `useAuthStore` giữ JWT token
  - Axios request interceptor (`handleRequest.ts`) gắn token vào header
  - Token refresh khi 401 (`handleResponse.ts`)
  - Logout → clear token → redirect `/invalid-code`
- **Session binding:** `useCompanySessionStore` gắn user vào shop/company (resolved từ QR code trong `/shop/:code`)

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
| `VITE_AUTH_URL` | Authentication service URL (SSO redirect nếu cần) |
| `VITE_APP_INSTALL_URL` | App store link — hiển thị trên `/invalid-code` cho shop app-only |

---

## Bootstrap — `src/main.tsx` + `App.tsx`

```
main.tsx:
  createRoot → StrictMode → QueryClientProvider → App

App.tsx:
  Fixed viewport container (h-dvh w-screen, mobile-first)
  ├── <RouterProvider router={router} />
  ├── <Toaster position="top-center" /> — Sonner
  └── Preload logo image
```

**Chưa mount:** `<ThemeProvider>` từ next-themes (mặc dù dep có).

---

## Styling

- **TailwindCSS 4.3** — `@tailwindcss/vite` (JIT)
- **Base UI React** — unstyled primitive (button, dialog, select) → custom style qua Tailwind trong `components/ui/`
- **Global CSS:** `src/index.css` — Tailwind `@import`
- **Fonts:** Noto Sans JP variable font qua `@fontsource-variable`
- **Animation:** `tw-animate-css`
- **Design token:** chưa import từ Figma token — mặc định TailwindCSS palette

---

## PWA — `vite.config.ts`

```typescript
VitePWA({
  registerType: "autoUpdate",
  injectRegister: "auto",
  includeAssets: ["favicon.png", "apple-touch-icon.png"],
  manifest: {
    name: "ESKitchen Payment App",
    short_name: "ESKitchen",
    description: "ESKitchen ordering & payment app",
    lang: "ja",
    start_url: "/",
    display: "standalone",
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
| QR Scanner | `@zxing/browser` trong `ScanPage.tsx` + `useScanToCart` hook |
| Payment | `elepay-js-sdk` v2 trong `services/client/elepay.ts` — redirect flow tại `/cart/payment-methods` |
| PWA | `vite-plugin-pwa` — autoUpdate, standalone display |
| Theme yellow | `#fee28a` (`colors.primitives.yellow.200`) — theme_color trong PWA manifest |
| Toast | Sonner top-center |
| Mobile-first layout | Fixed viewport `h-dvh w-screen`, max-w-3xl container |
| Infinite scroll | `useInView` hook cho menu pagination |
| Image lazy load | `ProductImage` component |
| Font Japanese | Noto Sans JP variable |

---

## Models — 10 file

`auth.ts` · `user.ts` · `company.ts` (shop/branch info) · `cart.ts` · `order.ts` · `menu.ts` · `payment.ts` (method + transaction + elepay req/resp) · `common.ts` (pagination) · `file-upload.ts` · `Response.ts` (generic API response wrapper)

---

## Không có

- ❌ Ant Design
- ❌ Redux Toolkit (dùng zustand — 4 store)
- ❌ react-toastify (dùng Sonner)
- ❌ Socket.IO — payment status qua polling + webhook
- ❌ Rich text editor
- ❌ Dark mode wire-up (next-themes imported nhưng chưa dùng)
- ❌ Test framework (placeholder script)
