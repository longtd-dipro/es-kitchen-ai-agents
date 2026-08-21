# es-kitchen-web-company — Cấu trúc Source

> Repo: `es-kitchen-web-company` · Epic: **E02 Company Admin**
> Vai trò: company admin quản lý sales, account, contract, order, delivery, disposal report, employee benefits — scope trong company của mình (không toàn hệ thống như E03).

---

## Tech stack

| Layer | Package | Version |
|---|---|---|
| Framework | React + React DOM | 19.2.0 |
| Build | Vite | 7.2.4 |
| Language | TypeScript | ~5.9.3 |
| UI kit | Ant Design + @ant-design/icons | 6.2.2 / 6.1.0 |
| CSS utility | TailwindCSS | 4.1.18 |
| Pre-processor | Sass | 1.95.1 |
| Client state | Redux Toolkit + react-redux | 2.11.2 / 9.2.0 |
| Server state | @tanstack/react-query | 5.90.20 |
| Router | react-router-dom | 7.13.0 |
| Forms | react-hook-form + yup | 7.68.0 / 1.7.1 |
| HTTP | axios | 1.13.4 |
| Cookies | js-cookie | 3.0.5 |
| Toast | react-toastify | 11.0.5 |
| Date | dayjs | 1.11.19 |

> **Cùng stack với E03 web-admin** (React 19, Vite 7, AntD 6.2, Redux Toolkit 2, TanStack Query 5). Phân biệt bằng scope nghiệp vụ + theme màu orange (`#FAA51D`).

---

## Cấu trúc thư mục

```
es-kitchen-web-company/
├── src/
│   ├── components/       ← Auth, Common
│   ├── constants/        ← route, messages, menus, dates, errors
│   ├── data/             ← Static data
│   ├── enums/
│   ├── hooks/            ← useAuth, useDebouncedValue, useTableParams, useMutationCustom, …
│   ├── layouts/          ← AuthLayout · AuthCenteredLayout · NonAuthLayout · RegisterLayout
│   ├── models/
│   ├── pages/            ← auth, sales-management, account-management, company-management, …
│   ├── routes/           ← Router + guards (RequireAuth, PublicOnly)
│   ├── services/
│   │   ├── http/         ← axios (30s timeout) + authToken (js-cookie) + interceptors
│   │   ├── query/        ← TanStack Query client
│   │   └── client/       ← 12 domain services
│   ├── shared/           ← AntdProvider + theme
│   ├── statics/          ← Static assets
│   ├── stores/           ← Redux store + reducers/auth
│   ├── styles/           ← Tailwind + global SCSS
│   ├── types/
│   ├── utils/
│   ├── validation/       ← Yup schemas
│   ├── App.tsx
│   └── main.tsx
│
├── public/
├── vite.config.ts
├── tsconfig.app.json
└── package.json
```

---

## Routes (top-level)

### Public — `NonAuthLayout` / `RegisterLayout`

`/login` · `/forgot-password` · `/verify` · `/reset-password` · `/register` · `/reset-success` (AuthCenteredLayout)

### Protected — `AuthLayout`

`/sales-management` · `/account-management` · `/company-management` · `/contract-management` · `/menu-order` · `/delivery-management/*` (schedule, prepared shipping, material shipping) · `/disposal-report` · `/disposal-history` · `/employee-benefits`

---

## Pages (src/pages/)

`auth/` (LoginPage, RegisterPage, ForgotPasswordPage, VerifyPage, ResetPasswordPage, ResetSuccessPage) · `account-management/` · `sales-management/` · `company-management/` · `contract-management/` · `menu-order/` · `delivery-management/` (schedule / prepared-shipping / material-shipping) · `disposal-report/` · `disposal-history/` · `employee-benefits/`

---

## Layouts

| Layout | Vai trò |
|---|---|
| `AuthLayout.tsx` | Main authenticated shell — sidebar (~180px, orange accent) + header (~56px) + stats row + content |
| `NonAuthLayout.tsx` | Public login/forgot-password |
| `RegisterLayout.tsx` | Registration wrapper (khác NonAuth ở branding + CTA) |
| `AuthCenteredLayout.tsx` | Centered layout (reset success) |

---

## Redux store — `src/stores/`

- `index.ts` — `combineReducers` config
- `reducers/auth.ts` — actions: `setAuthTokens`, `setCurrentUser`, `clearAuthState`, `syncAuthStateFromCookies`; selectors: `state`, `status`, `user`, `isAuthenticated`

Bootstrap trong `main.tsx`: `bootstrapAuthStateFromCookies()` chạy trước render.

---

## API services — `src/services/`

**HTTP:**
- `http/axios.instance.ts` — timeout 30s
- `http/authToken.ts` — cookie helpers (access + refresh)
- `http/handleRequest.ts` — Bearer token inject
- `http/handleResponse.ts` — error handling
- `http/index.ts`

**Query:** `query/queryClient.ts` + `baseQuery.ts`

**Client services (12):**
`api.ts` (Requester class) · `auth.service.ts` · `account.service.ts` · `company.service.ts` · `contract.service.ts` · `sales.service.ts` · `menu-order.service.ts` · `delivery-schedule.service.ts` · `prepared-shipping.service.ts` · `user.service.ts` · `error-report.service.ts` · `disposal.service.ts`

---

## Custom hooks — `src/hooks/`

`useAuth`, `useCan`, `useDebouncedValue`, `useInView`, `useMutationCustom`, `usePaymentMethodOptions`, `useTableParams`, `useUnsavedChangesGuard`, `router`

> **Ít hook hơn E03** (không có socket session hook — company admin không cần session-ended broadcast).

---

## Auth strategy

- Cookie-based JWT (access + refresh) qua `js-cookie`
- `bootstrapAuthStateFromCookies()` sync trước render
- Axios interceptor gắn `Authorization: Bearer ...` cho mọi request
- 401 → dispatch `clearAuthState()` → logout
- `RequireAuth` guard show `BaseLoading` khi đang check session, redirect kèm `?redirect=<encoded-path>`
- `PublicOnly` guard chặn logged-in user vào login/register

---

## Path aliases

| Alias | Path |
|---|---|
| `@` | `src/` |
| `@components` `@layouts` `@pages` `@routes` `@services` `@shared` `@hooks` `@utils` `@types` `@assets` | các folder tương ứng |

---

## Environment variables (.env.example)

| Var | Purpose |
|---|---|
| `VITE_API_BASE_URL` | API endpoint (`/api` fallback) |
| `VITE_AUTH_URL` | Auth/login redirect URL |

---

## Bootstrap — `src/main.tsx`

Provider stack:

1. `QueryClientProvider`
2. Redux `Provider`
3. `AntdProvider` (theme customization)
4. `AntdApp`
5. `ToastContainer` (top-right, 3s auto-close, light theme, no icons)

Pre-render: `bootstrapAuthStateFromCookies()`.

---

## Styling

- **TailwindCSS 4** — utility-first (primary)
- **Ant Design 6** — theme customization trong `src/shared/theme/antd-theme.ts`
- **SCSS** — `_base.scss`, `_variables.scss`, `globals.scss`, `nav.scss`
- **PostCSS + autoprefixer**
- **prettier-plugin-tailwindcss** — class sorting

**Theme màu (E02):** primary orange `#FAA51D` — mapping với `colors.primitives.orange.400` / `colors.semantics.admin.400` trong design token.

---

## Session storage

Post-reset-password flag lưu trong `sessionStorage` (không persistent qua tab close).
