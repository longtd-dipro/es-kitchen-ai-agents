# es-kitchen-web-admin — Cấu trúc Source

> Repo: `es-kitchen-web-admin` · Epic: **E03 System Admin** · 60+ pages có permission guard + 5 public auth page
> Vai trò: quản trị toàn hệ thống — account, company, contract, master data, order, delivery, inventory, invoice, agency, notification.

---

## Tech stack

| Layer | Package | Version |
|---|---|---|
| Framework | React + React DOM | 19.2.0 |
| Build | Vite | 7.2.4 |
| Language | TypeScript | ~5.9.3 |
| Runtime | Node | 20 |
| UI kit | Ant Design + @ant-design/icons | 6.2.2 / 6.1.0 |
| CSS utility | TailwindCSS | 4.1.18 |
| Pre-processor | Sass | 1.95.1 |
| Client state | Redux Toolkit + react-redux | 2.11.2 / 9.2.0 |
| Server state | @tanstack/react-query | 5.90.20 |
| Router | react-router-dom | 7.13.0 |
| Forms | react-hook-form + @hookform/resolvers + yup | 7.68.0 / 5.2.2 / 1.7.1 |
| HTTP | axios | 1.13.4 |
| Realtime | socket.io-client | 4.8.3 |
| Cookies | js-cookie | 3.0.5 |
| Toast | react-toastify | 11.0.5 |
| Rich text | TipTap (starter-kit, react, text-align, PM) | 3.27.1 |
| Charts | recharts | 3.8.1 |
| Drag-drop | @dnd-kit | 0.5.0 |
| Icons | @phosphor-icons/react | 2.1.10 |
| Date | dayjs | 1.11.19 |
| Util | lodash | 4.17.23 |

---

## Cấu trúc thư mục

```
es-kitchen-web-admin/
├── src/
│   ├── components/       ← Shared UI (Auth, Common, Counter, EquipmentConfiguration)
│   ├── constants/        ← route paths, menu config, enums, errors, messages
│   ├── enums/            ← TypeScript enums
│   ├── hooks/            ← 23+ custom hooks (auth, permissions, options, tables, mutations)
│   ├── layouts/          ← AuthLayout · NonAuthLayout · AuthCenteredLayout
│   ├── models/           ← Domain types (API response shapes)
│   ├── pages/            ← Feature pages (60+ folders, xem section Pages)
│   ├── routes/           ← Router config + 3 route guards (RequireAuth, PublicOnly, RequirePermission)
│   ├── services/
│   │   ├── http/         ← axios instance + interceptors + authToken (js-cookie)
│   │   ├── query/        ← TanStack Query client (staleTime 0, gcTime 0, retry 1, no refetch on focus)
│   │   └── client/       ← 30+ domain-specific API services
│   ├── shared/           ← AntdProvider + theme configs
│   ├── statics/          ← Images, icons, fonts
│   ├── stores/           ← Redux store + reducers (auth, counter, monthlyMenuImport)
│   ├── styles/           ← tailwind.css + globals.scss + nav.scss + _variables.scss + _base.scss
│   ├── types/            ← Ambient TypeScript types
│   ├── utils/            ← Utility helpers
│   ├── validation/       ← Yup schemas cho react-hook-form
│   ├── App.tsx
│   └── main.tsx          ← StrictMode → QueryClient → Redux → AntdProvider → AntdApp → ToastContainer → App
│
├── public/               ← favicon, static assets
├── index.html
├── vite.config.ts
├── tsconfig.app.json     ← path aliases
└── package.json
```

---

## Routes (top-level)

### Public — wrapped bởi `NonAuthLayout`

`/login` · `/forgot-password` · `/verify` · `/verify-otp` · `/reset-password`

### Protected — wrapped bởi `AuthLayout` + `RequirePermission`

`/dashboard` · `/account-management` · `/company-management` · `/contract-management` · `/master-management` · `/menu-management` · `/order-management` · `/material-order` · `/sales-management` · `/agency-management` · `/delivery-management` · `/inventory-management` · `/invoice-management` · `/collection-management` · `/return-management` · `/waste-disposal-management` · `/survey-management` · `/notification-management` · `/maintain-management` · `/version-management` · `/ip-whitelist-management`

### Error / fallback

`/403` (ForbiddenPage) · `*` (redirect về `/login`)

---

## Pages (src/pages/) — feature domains

`403/`, `account-management/`, `agency-management/`, `auth/`, `collection-management/`, `company-management/`, `contract-management/`, `dashboard/`, `delivery-management/`, `inventory-management/`, `invoice-management/`, `ip-whitelist-management/`, `maintain-management/`, `master-management/`, `material-order/`, `menu-management/`, `notification-management/`, `order-management/`, `return-management/`, `sales-management/`, `survey-management/`, `version-management/`, `waste-disposal-management/`.

---

## Layouts

| Layout | Vai trò |
|---|---|
| `AuthLayout.tsx` | Main authenticated shell — sidebar (210px, accordion nav) + header (54px) + content |
| `NonAuthLayout.tsx` | Public shell cho login/auth flow |
| `AuthCenteredLayout.tsx` | Centered layout cho các trang authenticated đơn giản (reset success, …) |

---

## Redux store — `src/stores/reducers/`

| Slice | Vai trò |
|---|---|
| `auth.ts` | tokens, user, permissions, session status |
| `counter.ts` | Demo counter |
| `monthlyMenuImport.ts` | Trạng thái flow import monthly menu |

**Bootstrap:** `bootstrapAuthStateFromCookies()` dispatch trong `main.tsx` để sync cookie → Redux trước khi render.

---

## API services — `src/services/`

- **`http/axios.instance.ts`** — axios instance
- **`http/handleRequest.ts`** — thêm `Authorization: Bearer <token>` + timezone header
- **`http/handleResponse.ts`** — error handling + trigger `sessionEnded` khi 401
- **`http/authToken.ts`** — get/set/clear access + refresh token cookie
- **`query/queryClient.ts`** — TanStack Query: `staleTime: 0`, `gcTime: 0`, `retry: 1`, no refetch on focus
- **`client/*.service.ts`** — 30+ domain service (auth, dashboard, delivery-schedule, inventory, category, product-tag, survey, deliverer, agency, ip-whitelist, registration, …)

---

## Custom hooks — `src/hooks/`

**Auth/session:** `useAuth`, `usePermissions`, `useCan`, `useAdminSessionSocket`

**Table + UI:** `useTableParams`, `useTableRowDragDrop`, `useDebouncedValue`, `useInView`, `useScrolledPast`, `useUnsavedChangesGuard`

**Mutation:** `useMutationCustom`

**Options (dropdown data sources):** `useCompanyOptions`, `useMenuOptions`, `useSupplierOptions`, `useProductOptions`, `useDelivererOptions`, `useCategoryOptions`, `useFavoriteLatestMonthOptions`, `usePaymentMethodOptions`, `useProductTags`

**Router:** `router.ts`

---

## Auth strategy

- **Cookie-based JWT** (js-cookie) — `access_token` + `refresh_token`
- Expiry 7 ngày, SameSite=strict, path `/`
- Axios interceptor gắn `Authorization: Bearer <access_token>` cho mọi request
- **Session monitoring:** `useAdminSessionSocket()` lắng nghe `session:ended` từ socket.io server → dispatch `sessionEnded` → hiển thị `SessionEndedModal`
- **401 response** → dispatch `sessionEnded` (không auto-refresh — user phải login lại)
- **Redirect on login:** `?redirect=<encoded-path>` giữ đích sau login

---

## Path aliases — `tsconfig.app.json`

| Alias | Path |
|---|---|
| `@` | `src/` |
| `@components` | `src/components/` |
| `@layouts` | `src/layouts/` |
| `@pages` | `src/pages/` |
| `@routes` | `src/routes/` |
| `@services` | `src/services/` |
| `@shared` | `src/shared/` |
| `@hooks` | `src/hooks/` |
| `@utils` | `src/utils/` |
| `@types` | `src/types/` |
| `@assets` | `src/assets/` |

> **Gap:** `@assets` trỏ tới `src/assets/` nhưng thực tế thư mục là `src/statics/` — cần Dev align.

---

## Environment variables (.env.example)

| Var | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Base URL API (`/api` default) |
| `VITE_AUTH_URL` | Auth redirect URL |
| `VITE_AUTH_SECRET` | Reserved (unused hiện tại) |

---

## Bootstrap — `src/main.tsx`

Provider stack (outer → inner):

1. `StrictMode`
2. `QueryClientProvider` (TanStack Query)
3. Redux `Provider`
4. `AntdProvider` (`ConfigProvider` với `lightTheme`)
5. `AntdApp` (Ant Design app context — message, modal, notification bridge)
6. `ToastContainer` (react-toastify)
7. `App` → `AuthBootstrap` (session check) + `SessionEndedModal` + `RouterProvider`

---

## Styling

- **TailwindCSS 4** — utility-first (primary), `tailwind.css` với `@theme` override
- **Ant Design 6** — pre-built components + theme customization qua `AntdProvider`
- **SCSS** — global overrides (`globals.scss`, `nav.scss`, `_variables.scss`, `_base.scss`)
- **PostCSS 8.5.6** với autoprefixer
- **prettier-plugin-tailwindcss** để sort class

**Theme màu (E03):** primary blue `#0969DA` — mapping với `colors.semantics.company.500` trong design token (xem `.claude/rules/design_rule.md`).
