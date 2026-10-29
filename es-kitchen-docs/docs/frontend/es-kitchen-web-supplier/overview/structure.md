# es-kitchen-web-supplier — Cấu trúc Source

> Nguồn = `es-kitchen-web-supplier@57c8179` ngày 2026-10-16 (HEAD `main`, ~16 commit từ 2026-07-01). **Chưa commit (untracked, chưa merge):** `src/pages/profile/ProfilePage.tsx`, `src/services/client/profile.service.ts`, `src/models/profile.ts` — xem ghi chú ở mục Routes.

**File này nói gì:** bản đồ repo E04 Supplier (cổng self-service cho nhà cung cấp): có những trang nào, dữ liệu và phiên đăng nhập chạy qua đâu, chỗ nào còn dữ liệu giả.
**Đọc khi nào:** ngày đầu vào dự án, hoặc khi chưa biết "file này đặt ở đâu". Cách viết code → `patterns.md` cùng thư mục.

- Repo: `es-kitchen-web-supplier` · Epic: **E04 Supplier**.
- Vai trò: supplier quản lý menu, nhận đơn hàng, cập nhật trạng thái giao — portal self-service cho nhà cung cấp thực phẩm.
- ⚠️ Đừng nhầm với E05 `es-kitchen-web-outsource-web-private` (Công ty vận chuyển).

---

## 1. App gồm những phần nào

```
Trình duyệt → main.tsx (cookie → Redux, rồi dựng providers) → App → Router
   ├─ PublicOnly: NonAuthLayout (login, quên MK…) · PublicLayout (/register)
   └─ RequireAuth: AuthCenteredLayout (/reset-success) · AuthLayout (sidebar + header)
                      └─ pages: dashboard · orders · menu-management · shipping-management · …
                           ├─ hook TanStack Query ← services/client/*.service.ts → API
                           └─ Redux: chỉ slice `auth`
```

Vì sao như vậy:
- **Redux chỉ có `auth`** — mọi dữ liệu server do TanStack Query giữ.
- **Sidebar tối giản** (~3–4 mục) — portal nhỏ hơn nhiều so với E03.
- **Hết phiên có modal riêng** (`SessionExpiredModal`) để supplier biết vì sao bị đẩy ra.

---

## 2. Tech stack

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

## 3. Cây thư mục

```
es-kitchen-web-supplier/
├── src/
│   ├── components/       ← Auth (AuthBootstrap, AuthCard, SessionExpiredModal), Common (Base*), Supplier (bảng/section thông tin NCC)
│   ├── constants/        ← routes, enums
│   ├── enums/
│   ├── hooks/            ← 12 hook (xem mục 7)
│   ├── layouts/          ← AuthLayout · NonAuthLayout · AuthCenteredLayout · PublicLayout
│   ├── models/
│   ├── pages/            ← 10 thư mục: auth, dashboard, orders, menu-management, shipping-management, change-password, other, supplier-profile, supplier-register, profile (untracked)
│   ├── routes/           ← Router + guards
│   ├── services/
│   │   ├── http/         ← axios + authToken + interceptors
│   │   ├── query/        ← TanStack Query client
│   │   └── client/       ← api.ts + 10 *.service.ts (profile.service chưa commit) + shipping.fake.ts
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

## 4. Routes (cấp cao nhất)

### Public

- `NonAuthLayout` (`PublicOnly`): `/login` · `/forgot-password` · `/verify` · `/reset-password`
- `PublicLayout`: `/register` (SupplierRegisterPage)
- `AuthCenteredLayout`: `/reset-success`

### Protected — `AuthLayout`

`/dashboard` · `/orders` · `/orders/:id` · `/menu-management` · `/menu-management/:id` · `/shipping-management/:id` · `/change-password` · `/other` · `/profile`

### Ghi chú

- Tổng 15 route path (+ index → `/dashboard`, `*` → `/login`).
- `/profile` trỏ `SupplierProfilePage` (`pages/supplier-profile/`, đã commit).
- `pages/profile/ProfilePage.tsx` (untracked, form update profile qua `/account/profile`) **chưa được import vào router** — chưa merge.
- `ROUTE.SHIPPING_MANAGEMENT` (`/shipping-management`) khai báo nhưng chưa có route (chỉ có `/:id`).

---

## 5. Pages (`src/pages/`)

`auth/` (Login, ForgotPassword, Verify, ResetPassword, ResetSuccess) · `dashboard/` · `orders/` (OrdersPage, OrderDetailPage, OrderDetailEditModal) · `menu-management/` (list + detail) · `shipping-management/` (detail only) · `change-password/` · `supplier-profile/` · `supplier-register/` (mới) · `other/` · `profile/` (untracked)

### Layouts

| Layout | Vai trò |
|---|---|
| `AuthLayout.tsx` | Khung chính sau login — sidebar (~120px, tối giản 3-4 mục) + header (~56px) + content |
| `NonAuthLayout.tsx` | Khung login / auth (public) |
| `AuthCenteredLayout.tsx` | Khung căn giữa cho reset success |
| `PublicLayout.tsx` | Khung công khai cho `/register` (đăng ký supplier) |

---

## 6. Dữ liệu đi từ API đến màn hình

```
API (backend)
  ▲ axios + interceptor (gắn token, bắt 401)
services/http/*  +  services/client/api.ts
  ▲
services/client/<domain>.service.ts   ← 1 hàm = 1 endpoint
  ▲
useQuery / useMutationCustom (hoặc hook domain như useSupplierOrders)
  ▲
page / component
```

### Redux store — `src/stores/`

- Chỉ có `reducers/auth.ts` (đã kiểm tồn tại; actions theo docs cũ: `setAuthTokens`, `setCurrentUser`, `clearAuthState`, `syncAuthStateFromCookies`).
- Không có slice khác — server state đưa hết vào TanStack Query.

### API services — `src/services/`

**HTTP:**
- `http/axios.instance.ts`
- `http/authToken.ts` — cookie helpers
- `http/handleRequest.ts` — Bearer token
- `http/handleResponse.ts` — xử lý lỗi
- `http/sessionExpired.ts` — pub/sub (cơ chế "đăng ký nghe – phát tín hiệu") `subscribeSessionExpired` / `notifySessionExpired`; `isSessionExpiredError` = 401 + request đã có header Authorization

**Query:** `query/queryClient.ts` — `staleTime` 5 phút, `retry: 1`, không refetch khi focus lại tab. (⚠️ Khác E03/E02: hai repo kia đặt `staleTime: 0`, `gcTime: 0` nên gần như không cache; E04 giữ cache 5 phút, không đặt `gcTime`.)

**Client services (`services/client/`):**
`api.ts` · `auth.service.ts` · `order.service.ts` (`/orders`) · `shipping.service.ts` · `supplier.service.ts` (`/register`, `/profile`, `/profile/history`) · `notice.service.ts` (`/notifications`) · `profile.service.ts` (**untracked**, `/account/me`, `/account/profile`) · `user.service.ts` · `file-upload.service.ts` (`/files/presigned-upload-url`) · `error-report.service.ts`
+ **`shipping.fake.ts`** — fake duy nhất còn lại.

> **Fake data:** chỉ `shipping.service.ts` còn `USE_FAKE_DATA = true` (kèm `shipping.fake.ts`). `menu-management.service.ts` và `order.fake.ts` không còn tồn tại; trang menu-management/orders dùng `hooks/useSupplierOrders.ts` (API thật). Khi BE xong shipping: bỏ flag + file fake.

---

## 7. Custom hooks — `src/hooks/`

`useAuth`, `useCan`, `useDebouncedValue`, `useInView`, `useMutationCustom`, `useTableParams`, `useUnsavedChangesGuard`, `router`, `useSessionExpired`, `useSupplierNotifications`, `useSupplierOrders`, `useSupplierSelfService`

---

## 8. Auth & phiên đăng nhập

1. Cookie-based JWT (access + refresh) qua `js-cookie`.
2. `bootstrapAuthStateFromCookies()` chạy trong `main.tsx` trước khi render.
3. Status enum: `UNAUTHENTICATED | LOADING | AUTHENTICATED`.
4. Guard: `RequireAuth` / `PublicOnly`.
5. **401 có header Authorization** → `notifySessionExpired()` → `useSessionExpired` hiện `SessionExpiredModal` (`components/Auth`); khi xác nhận → `clearAuthState` + redirect `/login?redirect=<path>`.
6. **401 ở login / forgot-password** (không có Authorization) **không** tính là hết phiên.

---

## 9. Path aliases — `tsconfig.app.json`

Chuẩn như các FE repo khác: `@`, `@components`, `@layouts`, `@pages`, `@routes`, `@services`, `@shared`, `@hooks`, `@utils`, `@types`, `@assets`.

---

## 10. Environment variables

| Var | Purpose |
|---|---|
| `VITE_API_BASE_URL` | API endpoint |
| `VITE_AUTH_URL` | Auth service URL |

---

## 11. Bootstrap — `src/main.tsx`

CSS import:
1. AntD reset (`antd/dist/reset.css`)
2. Tailwind (`src/styles/tailwind.css`)
3. Global SCSS (`src/styles/globals.scss`)
4. react-toastify CSS

Provider stack (bọc ngoài → trong):
1. `StrictMode` → `QueryClientProvider`
2. Redux `Provider`
3. `AntdProvider` (theme config) → `AntdApp`
4. `App` + `ToastContainer` (react-toastify, autoClose 3000)

Auth bootstrap từ cookie chạy trước render.

---

## 12. Styling

- **TailwindCSS 4.3.0** — utility classes.
- **Sass 1.99.0** — `_base.scss`, `nav.scss`, `globals.scss`, `_variables.scss`.
- **AntD 6.4** — light/dark theme qua `ConfigProvider`.
- **Vite plugin:** `vite-plugin-svgr` — import SVG như React component.

**Theme màu (E04):** primary purple `#6639BA` = `colors.primitives.purple.600`.

> **Lưu ý:** purple **không có trong bảng `colors.semantics.*`** — dùng primitive trực tiếp. Khi tạo component chung cross-repo → cẩn thận color token vì E04 là repo duy nhất dùng purple.
