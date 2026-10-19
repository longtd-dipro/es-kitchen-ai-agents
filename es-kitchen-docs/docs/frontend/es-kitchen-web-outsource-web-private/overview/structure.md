# es-kitchen-web-outsource-web-private — Cấu trúc Source

> Nguồn = es-kitchen-web-outsource-web-private@9b0e677 ngày 2026-10-16 (HEAD; working tree có sửa `vite.config.ts` chưa commit — chỉ ghi nhận)
> Repo: `es-kitchen-web-outsource-web-private` · Epic: **E05 Công ty vận chuyển Web (委託配送会社Web; tên cũ Outsource/Logistic)**
> Vai trò: web cho công ty vận chuyển — dashboard + thông báo, lịch (schedule), quản lý báo giá (orders), trạng thái giao hàng, thu tiền/đỗ xe (collection-reports), tài xế (driver), profile công ty, đăng ký công ty (public). `package.json` name = `es-kitchen-web-outsource-private`, version `0.0.0`.

---

## Tech stack

| Layer | Package | Version |
|---|---|---|
| Framework | React + React DOM | 19.2.6 |
| Build | Vite | 8.0.13 |
| Language | TypeScript | 6.0.3 |
| UI kit | Ant Design | 6.4.2 |
| CSS utility | TailwindCSS | 4.3.0 |
| Client state | Redux Toolkit | 2.12.0 |
| Server state | @tanstack/react-query | 5.100.10 |
| Router | react-router-dom | 7.15.1 |
| Forms | react-hook-form + yup | 7.76.0 / 1.7.1 |
| HTTP | axios | 1.16.1 |
| Toast / Icon | react-toastify 11.1.0 · @phosphor-icons/react 2.1.10 · dayjs 1.11.20 · dompurify | — |

> **Cùng stack với E04 web-supplier** (Vite 8 + AntD 6.4) nhưng KHÁC domain/theme (green, không phải purple) — đừng nhầm E04↔E05. Không có test (`npm test` = echo "No tests configured"); có husky + lint-staged; script `postal:build` (`scripts/generate-postal-data.mjs`) sinh dữ liệu mã bưu điện vào `public/postal/`.

---

## Cấu trúc thư mục

```
es-kitchen-web-outsource-web-private/
├── src/
│   ├── components/       ← Auth, Common (Base* + Fields/), Public, ScheduleCalendar
│   ├── config.ts         ← serverConfig (VITE_API_BASE_URL, VITE_AUTH_URL)
│   ├── constants/
│   ├── enums/
│   ├── hooks/            ← useAuth, useSessionExpired, useOrderRequests, useSchedule, useDeliveries, …
│   ├── layouts/          ← AuthLayout · AuthCenteredLayout · NonAuthLayout · PublicPageLayout
│   ├── models/
│   ├── pages/            ← auth, register, dashboard, orders, schedule, delivery-status, collection-reports, driver, profile, change-password
│   ├── routes/           ← Router + guards (PublicOnly, RequireAuth)
│   ├── services/
│   │   ├── http/         ← axios + interceptors + session-expiry
│   │   ├── query/        ← TanStack Query client
│   │   └── client/       ← 16 file (api.ts + 15 domain services)
│   ├── shared/           ← Providers + theme
│   ├── statics/          ← icons, images
│   ├── stores/           ← Redux store (reducers/auth)
│   ├── styles/
│   ├── types/
│   ├── utils/            ← utils/client/
│   ├── validation/
│   ├── App.tsx
│   └── main.tsx
│
├── vite.config.ts
├── tsconfig.app.json
└── package.json
```

---

## Routes (top-level)

> Đếm từ `src/routes/index.tsx`: **19 route** (5 public + 14 protected; 18 lazy page) — trước đây doc ghi 20 (có `/schedule/:id`, `/collection-reports/:id`, `/profile` mô tả sai). Ngoài ra `/` → redirect `/login` (hoặc `/dashboard` khi đã login) và `*` → `/login`.

### Public — `PublicOnly` + `NonAuthLayout` / `PublicPageLayout` (5)

`/login` · `/forgot-password` · `/verify` · `/reset-password` (NonAuthLayout `background="gradient"` cho 3 route reset) · `/register` (PublicPageLayout)

### Protected — `RequireAuth` (14)

`AuthCenteredLayout`: `/reset-success`
`AuthLayout`: `/dashboard` · `/announcements/:id` · `/profile` · `/orders` · `/orders/:id` · `/schedule` · `/delivery-status` · `/delivery-status/:id` · `/collection-reports` · `/driver` · `/driver/create` · `/driver/:id` · `/change-password`

> `/schedule` và `/collection-reports` chỉ có trang list (không còn trang `:id`). `/driver/create` khai báo trước `/driver/:id`.

---

## Pages (src/pages/)

`auth/` (Login, ForgotPassword, Verify, ResetPassword, ResetSuccess) · `register/` (RegisterPage + RegisterStepper, BasicInfo/ServiceArea/VehicleInfo/ContactTable section) · `dashboard/` (DashboardPage, AnnouncementDetailPage; card: Announcement, MonthlySchedule, PendingQuote) · `profile/` (ProfilePage; tab BasicInfo/DeliveryInfo/History) · `orders/` (OrdersPage, OrderDetailPage; tab RequestDetail/Answer/AnswerHistory) · `schedule/` (SchedulePage — lịch tháng/tuần dùng `components/ScheduleCalendar`) · `delivery-status/` (list + detail; tab Overview/Address/Report/Result) · `collection-reports/` (BillPage — list, có export) · `driver/` (EmployeePage, EmployeeDetailPage, CreateDriverPage; bulk issue account) · `change-password/`

---

## Layouts

| Layout | Vai trò |
|---|---|
| `AuthLayout.tsx` | Main authenticated shell (sidebar + nav) |
| `AuthCenteredLayout.tsx` | Centered layout (reset success) |
| `NonAuthLayout.tsx` | Public auth pages (login, forgot, verify) |
| `PublicPageLayout.tsx` | Register page (khác NonAuth về branding) |

---

## Redux store — `src/stores/`

- `index.ts` — store config (RTK), DevTools enabled trong dev
- `reducers/auth.ts` — state: `accessToken`, `refreshToken`, `status`, `user` — actions: `setAuthTokens`, `setCurrentUser`, `clearAuthState`, `bootstrapAuthStateFromCookies`

---

## API services — `src/services/`

**HTTP:**
- `http/axios.instance.ts` — base URL từ `VITE_API_BASE_URL`
- `http/handleRequest.ts` — auth token inject
- `http/handleResponse.ts` — error + session expiry handling
- `http/authToken.ts`

**Client services (`services/client/`, 15 domain + `api.ts` Requester singleton):**
`auth` · `user` · `company-profile` · `company-contact` · `order-request` · `delivery` · `collection-report` · `driver` · `schedule` · `deliverer-register` · `announcement` · `fee-area` · `file-upload` (presigned upload) · `postal-code` · `error-report` (`.service.ts`)

**Query:** `query/queryClient.ts` · `baseQuery.ts`

---

## Custom hooks — `src/hooks/`

**Auth/session:** `useAuth`, `useSessionExpired`, `useCan` (check `roles`; component `RequiredPermission`)

**Data (TanStack Query wrappers):**
`useOrderRequests`, `useSchedule`, `useDeliveries`, `useDrivers`, `useFeeAreas`, `useCompanyProfile`, `useCompanyContacts`, `useAnnouncements`, `useCollectionReports`, `useDelivererRegister`, `usePostalCodeSearch`

**UI/form:** `useTableParams`, `useMutationCustom`, `useUnsavedChangesGuard` (.tsx), `useDebouncedValue`, `useInView`, `router`

> **Đặc thù:** E05 có nhiều hook wrap TanStack Query per-domain (`useOrderRequests`, `useSchedule`, …) — pattern này khác E03 (E03 gọi trực tiếp `useQuery` trong page). Follow pattern hiện có khi thêm feature.

---

## Auth strategy

- Cookie-based JWT (access + refresh) qua `js-cookie`
- Bootstrap `bootstrapAuthStateFromCookies()` khi app init
- Interceptor request inject token; response handle 401 → refresh hoặc clear session
- `SessionExpiredModal` component + `useSessionExpired` hook cho UX logout mềm
- `AuthBootstrap` component check user on mount

---

## Path aliases

Chuẩn: `@`, `@components`, `@layouts`, `@pages`, `@routes`, `@services`, `@shared`, `@hooks`, `@utils`, `@types`, `@assets`.

---

## Environment variables

| Var | Purpose |
|---|---|
| `VITE_API_BASE_URL` | API server base URL |
| `VITE_AUTH_URL` | External auth server URL |
| `VITE_AUTH_SECRET` | Được `src/config.ts` đọc (`serverConfig.auth.secret`) nhưng KHÔNG có trong `.env.example` — chưa xác nhận có dùng thật |

---

## Bootstrap — `src/main.tsx`

1. Load auth tokens từ cookie → Redux
2. Render app với:
   - `StrictMode`
   - `QueryClientProvider`
   - Redux `Provider`
   - `AntdProvider` (theme)
   - `AntdApp`
   - `RouterProvider`
3. `ToastContainer` (react-toastify — top-right, 3s auto-close)

---

## Styling

- **TailwindCSS 4.3** + `@tailwindcss/postcss`
- **SCSS modules** — `_base.scss`, `_variables.scss`, `nav.scss`, `globals.scss`
- **AntD 6.4** — reset CSS + theme customization
- **Tailwind safelist:** dynamic chart color (orange, green, yellow tones)

**Theme màu (E05):** primary green `#1a7f37` (`shared/theme/antd-theme.ts` `colorPrimary`; = `colors.semantics.success.500` / green.500 trong `design_rule.md` — khớp Figma). Doc cũ ghi lime `#8ACA0D` là LỖI THỜI, không còn trong source.

---

## Vite plugins

- `vite-plugin-svgr` — SVG as React component
- `@vitejs/plugin-react` 6.0.2 · alias `@/…` trỏ `src/`
