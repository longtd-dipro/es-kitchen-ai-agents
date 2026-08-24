# es-kitchen-web-outsource-web-private — Cấu trúc Source

> Repo: `es-kitchen-web-outsource-web-private` · Epic: **E05 Outsource / Internal Private Admin**
> Vai trò: internal operation tool cho outsource team — quản lý delivery status, collection reports, driver/employee, schedule.

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

> **Cùng stack với E04 web-supplier** (Vite 8 + AntD 6.4). Theme màu khác (**lime green** thay vì purple).

---

## Cấu trúc thư mục

```
es-kitchen-web-outsource-web-private/
├── src/
│   ├── components/       ← Auth, Common, Public
│   ├── constants/
│   ├── enums/
│   ├── hooks/            ← useAuth, useSessionExpired, useOrderRequests, useSchedule, useDeliveries, …
│   ├── layouts/          ← AuthLayout · AuthCenteredLayout · NonAuthLayout · PublicPageLayout
│   ├── models/
│   ├── pages/            ← auth, dashboard, orders, schedule, delivery-status, collection-reports, driver, profile, …
│   ├── routes/           ← Router + guards (PublicOnly, RequireAuth)
│   ├── services/
│   │   ├── http/         ← axios + interceptors + session-expiry
│   │   ├── query/        ← TanStack Query client
│   │   └── client/       ← 10+ domain services
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

### Public — `NonAuthLayout` / `PublicPageLayout`

`/login` · `/register` · `/forgot-password` · `/verify` · `/reset-password` · `/reset-success`

### Protected — `AuthLayout`

`/dashboard` · `/orders` · `/orders/:id` · `/schedule` · `/schedule/:id` · `/delivery-status` · `/delivery-status/:id` · `/collection-reports` · `/collection-reports/:id` · `/driver` · `/driver/create` · `/driver/:id` · `/profile` · `/change-password`

---

## Pages (src/pages/)

`auth/` · `register/` · `dashboard/` · `profile/` · `orders/` (OrdersPage, OrderDetailPage) · `schedule/` (list + detail) · `delivery-status/` · `collection-reports/` (BillPage, BillDetailPage) · `driver/` (EmployeePage, EmployeeDetailPage, CreateDriverPage) · `change-password/`

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

**Client services (10+):**
`auth.service.ts` · `user.service.ts` · `company-profile.service.ts` · `company-contact.service.ts` · `order-request.service.ts` · `delivery-report.service.ts` · `driver.service.ts` · `schedule.service.ts` · `deliverer-register.service.ts` · `announcement.service.ts` · `api.ts`

**Query:** `query/queryClient.ts` · `baseQuery.ts`

---

## Custom hooks — `src/hooks/`

**Auth/session:** `useAuth`, `useSessionExpired`, `useCan`

**Data (TanStack Query wrappers):**
`useOrderRequests`, `useSchedule`, `useDeliveries`, `useDrivers`, `useFeeAreas`, `useCompanyProfile`, `useCompanyContacts`, `useAnnouncements`, `useCollectionReports`, `useDelivererRegister`

**UI/form:** `useTableParams`, `useMutationCustom`, `useUnsavedChangesGuard`, `useDebouncedValue`, `useInView`, `router`

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

**Theme màu (E05):** primary lime green `#8ACA0D`.

> ⚠️ **Lime green `#8ACA0D` KHÔNG có trong `.claude/rules/design_rule.md` token table.** Đây là màu duy nhất của E05 — dùng hex trực tiếp hoặc tạo custom token `colors.primitives.green.outsource`. Cần confirm với design system owner khi mở rộng.

---

## Vite plugins

- `vite-plugin-svgr` — SVG as React component
