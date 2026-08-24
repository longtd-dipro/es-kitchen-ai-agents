# es-kitchen-web-supplier — Cấu trúc Source

> Repo: `es-kitchen-web-supplier` · Epic: **E04 Supplier**
> Vai trò: supplier quản lý menu, nhận đơn hàng, cập nhật trạng thái giao — self-service portal cho nhà cung cấp thực phẩm.

---

## Tech stack

| Layer | Package | Version |
|---|---|---|
| Framework | React + React DOM | 19.2.6 |
| Build | Vite | 8.0.13 |
| Dev port | 3004 | |
| Language | TypeScript | 6.0.3 |
| UI kit | Ant Design + @ant-design/icons | 6.4.2 / 6.2.3 |
| CSS utility | TailwindCSS + @tailwindcss/postcss | 4.3.0 |
| Pre-processor | Sass | 1.99.0 |
| Client state | Redux Toolkit + react-redux | 2.12.0 / 9.3.0 |
| Server state | @tanstack/react-query | 5.100.10 |
| Router | react-router-dom | 7.15.1 |
| Forms | react-hook-form + @hookform/resolvers + yup | 7.76.0 / 5.2.2 / 1.7.1 |
| HTTP | axios | 1.16.1 |
| Cookies | js-cookie | 3.0.7 |
| Toast | react-toastify | 11.1.0 |
| Icons | @phosphor-icons/react | 2.1.10 |
| Date | dayjs | 1.11.20 |

> **Khác E03/E02:** dùng **Vite 8** (mới hơn Vite 7) và **AntD 6.4** (mới hơn 6.2). Khi share code cross-repo → check compatibility.

---

## Cấu trúc thư mục

```
es-kitchen-web-supplier/
├── src/
│   ├── components/       ← Auth, Common
│   ├── constants/        ← routes, enums
│   ├── enums/
│   ├── hooks/            ← useAuth, useCan, useDebouncedValue, useMutationCustom, useTableParams, …
│   ├── layouts/          ← AuthLayout · NonAuthLayout · AuthCenteredLayout
│   ├── models/
│   ├── pages/            ← auth, dashboard, orders, menu-management, shipping-management, …
│   ├── routes/           ← Router + guards
│   ├── services/
│   │   ├── http/         ← axios + authToken + interceptors
│   │   ├── query/        ← TanStack Query client
│   │   └── client/       ← 10+ services + *.fake.ts cho dev
│   ├── shared/           ← Providers + theme
│   ├── statics/          ← Images, icons
│   ├── stores/           ← Redux (auth reducer)
│   ├── styles/           ← Tailwind + SCSS
│   ├── types/
│   ├── utils/
│   ├── validation/
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

### Public — `NonAuthLayout`

`/login` · `/forgot-password` · `/verify` · `/reset-password` · `/reset-success`

### Protected — `AuthLayout`

`/dashboard` · `/orders` · `/orders/:id` · `/menu-management` · `/menu-management/:id` · `/shipping-management/:id` · `/change-password` · `/other` · `/profile`

---

## Pages (src/pages/)

`auth/` (Login, ForgotPassword, Verify, ResetPassword, ResetSuccess) · `dashboard/` · `orders/` (OrdersPage, OrderDetailPage) · `menu-management/` (list + detail) · `shipping-management/` (detail only) · `change-password/` · `profile/` · `other/`

---

## Layouts

| Layout | Vai trò |
|---|---|
| `AuthLayout.tsx` | Main authenticated shell — sidebar (~120px, minimal 3-4 items) + header (~56px) + content |
| `NonAuthLayout.tsx` | Public login/auth |
| `AuthCenteredLayout.tsx` | Centered layout cho reset success |

---

## Redux store — `src/stores/`

Single `reducers/auth.ts` — actions: `setAuthTokens`, `setCurrentUser`, `clearAuthState`, `syncAuthStateFromCookies`. Không có slice khác — server state đưa hết vào TanStack Query.

---

## API services — `src/services/`

**HTTP:**
- `http/axios.instance.ts`
- `http/authToken.ts` — cookie helpers
- `http/handleRequest.ts` — Bearer token
- `http/handleResponse.ts` — error handling

**Query:** `query/queryClient.ts`

**Client services (16 files):**
`api.ts` · `auth.service.ts` · `order.service.ts` · `shipping.service.ts` · `menu-management.service.ts` · `notice.service.ts` · `profile.service.ts` · `user.service.ts` · `file-upload.service.ts` · `error-report.service.ts`
+ **`*.fake.ts`** — fake data services cho dev/testing offline

> **Fake data pattern:** repo này có sẵn `*.fake.ts` để chạy offline. Khi implement API thật, remove fake và swap sang service thật — không giữ song song.

---

## Custom hooks — `src/hooks/`

`useAuth`, `useCan`, `useDebouncedValue`, `useInView`, `useMutationCustom`, `useTableParams`, `useUnsavedChangesGuard`, `router`

---

## Auth strategy

- Cookie-based JWT (access + refresh) qua `js-cookie`
- Bootstrap `bootstrapAuthStateFromCookies()` trong `main.tsx`
- Status enum: `UNAUTHENTICATED | LOADING | AUTHENTICATED`
- `RequireAuth` / `PublicOnly` guard
- 401 → clear auth state → redirect login

---

## Path aliases — `tsconfig.app.json`

Chuẩn như các FE repo khác: `@`, `@components`, `@layouts`, `@pages`, `@routes`, `@services`, `@shared`, `@hooks`, `@utils`, `@types`, `@assets`.

---

## Environment variables

| Var | Purpose |
|---|---|
| `VITE_API_BASE_URL` | API endpoint |
| `VITE_AUTH_URL` | Auth service URL |

---

## Bootstrap — `src/main.tsx`

CSS imports:
1. AntD reset (`antd/dist/reset.css`)
2. Tailwind (`src/styles/tailwind.css`)
3. Global SCSS (`src/styles/globals.scss`)
4. react-toastify CSS

Provider stack:
1. Redux `Provider`
2. `QueryClientProvider`
3. `AntdProvider` (theme config)
4. `ToastContainer` (react-toastify)

Auth bootstrap từ cookies chạy trước render.

---

## Styling

- **TailwindCSS 4.3.0** — utility classes
- **Sass 1.99.0** — `_base.scss`, `nav.scss`, `globals.scss`, `_variables.scss`
- **AntD 6.4** — light/dark theme qua `ConfigProvider`

**Theme màu (E04):** primary purple `#6639BA` = `colors.primitives.purple.600`.

> **Lưu ý:** purple **không có trong `colors.semantics.*` table** — dùng primitive trực tiếp. Khi tạo component chung cross-repo → cẩn thận color token vì E04 là repo duy nhất dùng purple.

---

## Vite plugins

- `vite-plugin-svgr` — import SVG as React component
