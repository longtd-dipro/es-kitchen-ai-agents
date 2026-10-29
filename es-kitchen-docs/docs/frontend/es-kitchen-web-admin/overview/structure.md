# es-kitchen-web-admin — Cấu trúc Source

> Nguồn = `es-kitchen-web-admin@633b2b7` ngày 2026-10-16 (HEAD `main`; working tree chỉ có `yarn.lock` untracked). ~49 commit từ 2026-08-21 đã được đối chiếu.

**File này nói gì:** bản đồ của repo E03 System Admin: app có những phần nào, thư mục nào chứa gì, dữ liệu và phiên đăng nhập chạy qua đâu.
**Đọc khi nào:** ngày đầu vào dự án, hoặc khi chưa biết "file này nên đặt ở đâu". Cách viết code cụ thể → xem `patterns.md` cùng thư mục.

- Repo: `es-kitchen-web-admin` · Epic: **E03 System Admin** · 115 `page.tsx` (121 lazy import trong router, 130 key trong `ROUTE`) có permission guard + 5 public auth page.
- Vai trò: quản trị toàn hệ thống — account, company, contract, master data, order, delivery, inventory, invoice, agency, notification.
- ⚠️ Đây là **E03**. Đừng nhầm với `es-kitchen-web-company` (E02 Company Admin).

---

## 1. App gồm những phần nào (nhìn từ xa)

```
Trình duyệt
  └─ main.tsx (dựng các "provider" bọc ngoài)
       └─ App → Router (routes/index.tsx)
            ├─ Public:  NonAuthLayout  → trang login, quên mật khẩu…
            └─ Đã login: RequireAuth → RequirePermission → AuthLayout (sidebar + header)
                           └─ pages/<domain>/page.tsx  (115 trang)
                                 ├─ hooks (TanStack Query)  ← server data
                                 ├─ Redux store             ← auth, vài state client
                                 └─ services/client/*.service.ts → API (axios)
```

Vì sao tổ chức như vậy:
- **Chia theo domain** (`pages/order-management`, `pages/invoice-management`…) để mỗi nghiệp vụ nằm gọn một chỗ.
- **Server data ≠ client state:** dữ liệu từ API do TanStack Query giữ; Redux chỉ giữ thứ phía client (đăng nhập, quyền, trạng thái flow import).
- **Mọi API đi qua một cửa** (`services/client/api.ts`) nên token, header, xử lý 401 chỉ viết một lần.

---

## 2. Tech stack

| Layer | Package | Version |
|---|---|---|
| Framework | React + React DOM | ^19.2.0 (installed 19.2.4) |
| Build | Vite | ^7.2.4 (installed 7.3.1) |
| Language | TypeScript | ~5.9.3 |
| Runtime | Node | 20 |
| UI kit | Ant Design + @ant-design/icons | 6.2.2 / 6.1.0 |
| CSS utility | TailwindCSS | 4.1.18 |
| Pre-processor | Sass | ^1.95.1 |
| Client state | Redux Toolkit + react-redux | 2.11.2 / 9.2.0 |
| Server state | @tanstack/react-query | 5.90.20 |
| Router | react-router-dom | 7.13.0 |
| Forms | react-hook-form + @hookform/resolvers + yup | ^7.68.0 (installed 7.72.0) / 5.2.2 / 1.7.1 |
| HTTP | axios | 1.13.4 |
| Realtime | socket.io-client | 4.8.3 |
| Cookies | js-cookie | 3.0.5 |
| Toast | react-toastify | 11.0.5 |
| Rich text | Quill (`BaseRichTextEditor`; TipTap đã bỏ) | ^2.0.3 |
| Charts | recharts | 3.8.1 |
| Drag-drop | @dnd-kit/react + @dnd-kit/helpers | ^0.5.0 |
| Class merge | tailwind-merge | 3.5.0 |
| Icons | @phosphor-icons/react | 2.1.10 |
| Date | dayjs | 1.11.19 |
| Util | lodash | 4.17.23 |

> Version lấy từ `package.json` + `node_modules` (socket.io-client, @dnd-kit, quill chưa có trong `node_modules` local → chỉ biết range `package.json`).
> **Không có test runner** (`npm test` = echo).

---

## 3. Cây thư mục

```
es-kitchen-web-admin/
├── src/
│   ├── components/       ← UI dùng chung (Auth, Common, Counter, EquipmentConfiguration)
│   ├── constants/        ← route paths, menu config, enums, errors, messages
│   ├── enums/            ← TypeScript enums
│   ├── hooks/            ← 24 custom hooks (auth, permissions, options, tables, mutations)
│   ├── layouts/          ← AuthLayout · NonAuthLayout · AuthCenteredLayout
│   ├── models/           ← Kiểu dữ liệu domain (hình dạng response của API)
│   ├── pages/            ← Trang theo domain (24 thư mục domain / 115 page.tsx)
│   ├── routes/           ← `index.tsx` (createBrowserRouter) + `guards/` 3 route guards (RequireAuth, PublicOnly, RequirePermission)
│   ├── services/
│   │   ├── http/         ← axios.instance + handleRequest/handleResponse + authToken (js-cookie)
│   │   ├── session/      ← handleSessionEnded
│   │   ├── socket/       ← adminSessionSocket (socket.io)
│   │   ├── query/        ← TanStack Query client (staleTime 0, gcTime 0, retry 1, no refetch on focus)
│   │   └── client/       ← `api.ts` (singleton Requester) + 52 `*.service.ts` + `mock/`
│   ├── shared/           ← AntdProvider + theme configs
│   ├── statics/          ← Images, icons, fonts
│   ├── stores/           ← Redux store + reducers (auth, counter, monthlyMenuImport)
│   ├── styles/           ← tailwind.css + globals.scss + nav.scss + _variables.scss + _base.scss
│   ├── types/            ← Ambient TypeScript types
│   ├── utils/            ← Hàm tiện ích
│   ├── validation/       ← chỉ còn `schemas.ts` (schema chung); schema form đặt co-located `schema.ts` cạnh page
│   ├── config.ts         ← `serverConfig` (api_server_url, auth) từ `import.meta.env`
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

## 4. Bảng "cần tìm X thì mở đâu"

| Cần… | Mở | Ghi chú |
|---|---|---|
| Gọi một API | `services/client/<domain>.service.ts` | Dùng singleton `API` từ `api.ts` |
| Hiểu 401 / hết phiên | `services/http/handleResponse.ts`, `services/client/api.ts`, `services/session/handleSessionEnded` | Xem mục 9 |
| Thêm route | `routes/index.tsx` + `constants/route.ts` | Luôn dùng `ROUTE.xxx` |
| Chặn trang theo quyền | `routes/guards/RequirePermission.tsx` | Map qua `ROUTE_PERMISSIONS` |
| Ẩn/hiện nút theo quyền | `hooks/usePermissions` | Xem `patterns.md` |
| Menu bên trái | `constants/nav.ts` | Có `requiredPermissions` |
| Đổi theme AntD | `shared/` (AntdProvider + theme) | Màu chính xem mục 12 |
| Dropdown lấy từ API | `hooks/use*Options.ts` | Xem mục 7 |

---

## 5. Routes (cấp cao nhất)

### Public — bọc bởi `NonAuthLayout`

`/login` · `/forgot-password` · `/verify` · `/verify-login-otp` · `/reset-password` (+ `/reset-success` cho `AuthCenteredLayout`)

### Protected — bọc bởi `AuthLayout` + `RequirePermission`

`/dashboard` · `/account-management` (user · operation · role-management) · `/company-management` · `/corporate-management` · `/contract-management` (+ `/registration`) · `/master-management` (product · shipping · deliverer · relay-destination · supplier · plan · category · device · machine-model) · `/menu-management` (monthly · product-tag · service-option · discount) · `/order-management` · `/material-order` · `/category-management` · `/sales-management` · `/agency-management` · `/delivery-management` (date-change-requests · material-shipping · prepared-shipping · quotation-requests · schedule · shipments) · `/inventory-management` · `/invoice-management` · `/collection-management` · `/return-management` · `/waste-disposal-management` · `/review-management` · `/survey-management` · `/notification-management` · `/maintain-management` · `/version-management` · `/ip-whitelist-management`

### Lỗi / fallback

`ROUTE.FORBIDDEN` (ForbiddenPage, `pages/403`) · `*` (redirect về `/login`)

---

## 6. Pages (`src/pages/`) — các domain

`403/`, `account-management/`, `agency-management/`, `auth/`, `collection-management/`, `company-management/`, `contract-management/`, `corporate-management/` (mới, có `mock.ts`), `dashboard/`, `delivery-management/`, `inventory-management/`, `invoice-management/`, `ip-whitelist-management/`, `maintain-management/`, `master-management/`, `material-order/`, `menu-management/`, `notification-management/`, `order-management/`, `return-management/`, `review-management/` (mới), `sales-management/`, `survey-management/`, `version-management/`, `waste-disposal-management/`.

### Layouts

| Layout | Vai trò |
|---|---|
| `AuthLayout.tsx` | Khung chính sau khi login — sidebar (210px, accordion nav) + header (54px) + content |
| `NonAuthLayout.tsx` | Khung cho login / auth flow (public) |
| `AuthCenteredLayout.tsx` | Khung căn giữa cho trang đơn giản (reset success, …) |

---

## 7. Dữ liệu đi từ API đến màn hình

```
API (backend)
  ▲
  │  axios + interceptor (gắn token, bắt 401)
services/client/api.ts  (singleton `API`, class Requester)
  ▲
services/client/<domain>.service.ts   ← mỗi hàm = 1 endpoint, không có React
  ▲
hook dùng useQuery / useMutationCustom   ← cache, loading, invalidate
  ▲
component / page   ← chỉ render; filter + trang + sort sync lên URL qua useTableParams
```

- **Service** = file gọi API thuần (không hook, không state).
- **Hook TanStack Query** = lớp giữ cache + trạng thái loading/error.
- **Redux** = chỉ client state. Ví dụ: `auth` giữ token, user, quyền.

### Redux store — `src/stores/reducers/`

| Slice | Vai trò |
|---|---|
| `auth.ts` | tokens, user, permissions, session status |
| `counter.ts` | Demo counter |
| `monthlyMenuImport.ts` | Trạng thái flow import monthly menu |

**Bootstrap:** `bootstrapAuthStateFromCookies()` dispatch trong `main.tsx` để sync cookie → Redux trước khi render.

### API services — `src/services/`

- **`client/api.ts`** — singleton `API` (class `Requester`): `baseURL=VITE_API_BASE_URL`, `Accept-Language: ja`, `paramsSerializer`, flag `disabledToken`; mọi `*.service.ts` dùng class này.
- **`http/axios.instance.ts`** — axios instance.
- **`http/handleRequest.ts`** — thêm `Authorization: Bearer <token>` + timezone header.
- **`http/handleResponse.ts`** — xử lý lỗi + gọi `handleSessionEnded` khi 401.
- **`http/authToken.ts`** — get/set/clear access + refresh token cookie.
- **`query/queryClient.ts`** — TanStack Query: `staleTime: 0`, `gcTime: 0`, `retry: 1`, không refetch khi focus lại tab. Nghĩa là: **gần như không cache** — mở lại trang là gọi lại API.
- **`client/*.service.ts`** — 52 service theo domain (auth, dashboard, delivery-schedule, inventory, category, product-tag, survey, deliverer, agency, ip-whitelist, registration, review, quotation-request, machine-model, referral/referral-fee-plan, shipment-management, …).

### Custom hooks — `src/hooks/`

- **Auth/session:** `useAuth`, `usePermissions`, `useCan`, `useAdminSessionSocket`
- **Table + UI:** `useTableParams`, `useTableRowDragDrop`, `useDebouncedValue`, `useInView`, `useScrolledPast`, `useUnsavedChangesGuard`
- **Mutation:** `useMutationCustom`
- **Options (dữ liệu cho dropdown):** `useCompanyOptions`, `useMenuOptions`, `useSupplierOptions`, `useProductOptions`, `useDelivererOptions`, `useCategoryOptions`, `useFavoriteLatestMonthOptions`, `usePaymentMethodOptions`, `useProductTags`, `useAllergenOptions`, `useRelayDestinationOptions`, `useWarehouseOptions`
- **Router:** `router.ts`

---

## 8. Bootstrap — `src/main.tsx`

Provider = component bọc ngoài để cho cả app dùng chung một thứ (cache, store, theme). Thứ tự từ ngoài vào trong:

1. `StrictMode`
2. `QueryClientProvider` (TanStack Query)
3. Redux `Provider`
4. `AntdProvider` (`ConfigProvider` với `lightTheme`)
5. `AntdApp` (Ant Design app context — cầu nối message, modal, notification)
6. `ToastContainer` (react-toastify)
7. `App` → `AuthBootstrap` (kiểm tra phiên) + `SessionEndedModal` + `RouterProvider`

---

## 9. Auth & phiên đăng nhập

- **JWT lưu cookie** (js-cookie) — `access_token` + `refresh_token`. Hạn 7 ngày, SameSite=strict, path `/`.
- Axios interceptor (hàm chạy trước mỗi request / sau mỗi response) gắn `Authorization: Bearer <access_token>` cho mọi request.
- **Theo dõi phiên:** `useAdminSessionSocket()` lắng nghe `session:ended` từ socket.io server → dispatch `sessionEnded` → hiện `SessionEndedModal`.
- **Khi API trả 401** (`http/handleResponse.ts`, `client/api.ts`):
  1. Có `errorCode` dạng AUTH_SESSION_* hoặc đang có session → `handleSessionEnded()` (hiện `SessionEndedModal`).
  2. Chưa có session → `clearAuthState()`.
  - **Không auto-refresh token** — user phải login lại.
- **Redirect sau login:** `?redirect=<encoded-path>` giữ đích ban đầu.

---

## 10. Path aliases — `tsconfig.app.json`

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

- Bản cũ còn ghi thêm alias `@assets` (mỗi alias có thêm `/*`).
- ⚠️ **Gap còn lại:** `@assets` → `src/assets/` nhưng thư mục thật là `src/statics/` (đã kiểm 2026-10-16, `src/assets` không tồn tại). Đừng dùng `@assets`.
- Code hiện chủ yếu import qua `@/...`.

---

## 11. Environment variables (`.env.example`)

| Var | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Base URL API (`/api` default) |
| `VITE_AUTH_URL` | Auth redirect URL |
| `VITE_AUTH_SECRET` | Reserved (hiện chưa dùng) |

---

## 12. Styling

- **TailwindCSS 4** — utility-first (chính), `tailwind.css` với `@theme` override.
- **Ant Design 6** — component dựng sẵn + theme tuỳ chỉnh qua `AntdProvider`.
- **SCSS** — override toàn cục (`globals.scss`, `nav.scss`, `_variables.scss`, `_base.scss`).
- **PostCSS 8.5.6** với autoprefixer; `prettier-plugin-tailwindcss` để sắp xếp class.

**Theme màu (E03):** primary blue `#0969DA` — ứng với `colors.semantics.company.500` trong design token (xem `.claude/rules/design_rule.md`).
