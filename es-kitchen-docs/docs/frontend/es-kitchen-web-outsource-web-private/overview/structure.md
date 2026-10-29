# es-kitchen-web-outsource-web-private — Cấu trúc Source

> Nguồn = es-kitchen-web-outsource-web-private@9b0e677 ngày 2026-10-16 (HEAD; working tree có sửa `vite.config.ts` chưa commit — chỉ ghi nhận).
> Repo: `es-kitchen-web-outsource-web-private` · Epic: **E05 Công ty vận chuyển Web (委託配送会社Web; tên cũ Outsource/Logistic)**.

**File này nói gì:** bản đồ của repo E05 — dùng công nghệ gì, thư mục nào chứa gì, có những trang nào, dữ liệu đi từ API đến màn hình qua lớp nào.
**Đọc khi:** mới vào repo, hoặc cần biết "file này nằm ở đâu".
**Đọc tiếp:** `patterns.md` (cùng thư mục) để biết *làm việc X thì làm thế nào*.

> **Dễ nhầm:** E05 (repo này, màu xanh lá) khác E04 `web-supplier` (màu tím). Cùng Vite 8 + Ant Design 6.4 nhưng khác hoàn toàn nghiệp vụ.

---

## 1. App này làm gì

Web cho **công ty vận chuyển** (bên nhận giao hàng thuê). Họ dùng để:

- Xem dashboard và thông báo.
- Xem lịch giao (schedule) và trạng thái giao hàng.
- Quản lý báo giá (màn "orders").
- Xem thu tiền / đỗ xe (collection-reports).
- Quản lý tài xế (driver), hồ sơ công ty (profile).
- Đăng ký công ty mới (trang public, chưa cần đăng nhập).

`package.json`: name = `es-kitchen-web-outsource-private`, version `0.0.0`.

---

## 2. Tech stack

| Lớp | Package | Version |
|---|---|---|
| Framework | React + React DOM | 19.2.6 |
| Build | Vite | 8.0.13 |
| Ngôn ngữ | TypeScript | 6.0.3 |
| UI kit | Ant Design | 6.4.2 |
| CSS | TailwindCSS | 4.3.0 |
| State phía client | Redux Toolkit | 2.12.0 |
| State phía server (dữ liệu API) | @tanstack/react-query | 5.100.10 |
| Router | react-router-dom | 7.15.1 |
| Form | react-hook-form + yup | 7.76.0 / 1.7.1 |
| HTTP | axios | 1.16.1 |
| Khác | react-toastify 11.1.0 · @phosphor-icons/react 2.1.10 · dayjs 1.11.20 · dompurify | — |

- Không có test: `npm test` chỉ `echo "No tests configured"`.
- Có husky + lint-staged.
- Script `postal:build` (`scripts/generate-postal-data.mjs`) sinh dữ liệu mã bưu điện vào `public/postal/`.

---

## 3. Cây thư mục và lý do tổ chức

```
es-kitchen-web-outsource-web-private/
├── src/
│   ├── components/       Auth, Common (Base* + Fields/), Public, ScheduleCalendar
│   ├── config.ts         serverConfig (VITE_API_BASE_URL, VITE_AUTH_URL)
│   ├── constants/        route.ts, nav.ts, ...
│   ├── enums/
│   ├── hooks/            useAuth, useSessionExpired, useOrderRequests, useSchedule, ...
│   ├── layouts/          AuthLayout · AuthCenteredLayout · NonAuthLayout · PublicPageLayout
│   ├── models/
│   ├── pages/            auth, register, dashboard, orders, schedule, delivery-status,
│   │                     collection-reports, driver, profile, change-password
│   ├── routes/           Router + guards (PublicOnly, RequireAuth)
│   ├── services/
│   │   ├── http/         axios + interceptor + session-expiry
│   │   ├── query/        TanStack Query client
│   │   └── client/       16 file (api.ts + 15 service theo domain)
│   ├── shared/           Providers + theme
│   ├── statics/          icons, images
│   ├── stores/           Redux store (reducers/auth)
│   ├── styles/  types/  utils/ (utils/client/)  validation/
│   ├── App.tsx
│   └── main.tsx
├── vite.config.ts · tsconfig.app.json · package.json
```

Ý đồ chia lớp (đọc từ trên xuống là đi từ "màn hình" xuống "mạng"):

| Lớp | Thư mục | Việc của lớp |
|---|---|---|
| Màn hình | `pages/`, `components/` | Vẽ giao diện, không gọi axios trực tiếp |
| Logic dữ liệu | `hooks/` | Bọc TanStack Query: `useDeliveries`, `useSchedule`, ... |
| Gọi API | `services/client/` | Mỗi domain 1 file, mỗi hàm = 1 endpoint |
| HTTP nền | `services/http/` | Gắn token, bắt 401, báo phiên hết hạn |

---

## 4. Dữ liệu đi từ API đến màn hình

```
Page (vd DeliveryStatusPage)
   │ gọi
   ▼
hook (useDeliveries)  ── TanStack Query: cache, loading, error
   │ queryFn
   ▼
service (fetchDeliveries, services/client/delivery.service.ts)
   │ API.get(...)
   ▼
Requester singleton `API` (services/client/api.ts) ── axios
   │ interceptor: gắn Bearer token + header timezone; 401 → clearAuthState()
   ▼
Backend
```

- **Redux chỉ giữ phiên đăng nhập** (`auth`). Dữ liệu nghiệp vụ (đơn, lịch, tài xế…) nằm trong cache TanStack Query.
- Mutation (ghi dữ liệu) đi qua wrapper `useMutationCustom` để tự hiện toast lỗi.

---

## 5. Routes

> Đếm từ `src/routes/index.tsx`: **19 route** (5 public + 14 protected; 18 trang lazy). Bản doc cũ ghi 20 và mô tả sai `/schedule/:id`, `/collection-reports/:id`, `/profile` — đã sửa.
> Ngoài ra `/` → redirect `/login` (hoặc `/dashboard` khi đã đăng nhập); `*` → `/login`.

### Public — bọc bởi `PublicOnly` (đã đăng nhập thì bị đẩy về dashboard)

| Route | Layout |
|---|---|
| `/login` | `NonAuthLayout` |
| `/forgot-password` · `/verify` · `/reset-password` | `NonAuthLayout background="gradient"` |
| `/register` | `PublicPageLayout` |

### Protected — bọc bởi `RequireAuth` (chưa đăng nhập thì bị đẩy về `/login`)

| Layout | Route |
|---|---|
| `AuthCenteredLayout` | `/reset-success` |
| `AuthLayout` | `/dashboard` · `/announcements/:id` · `/profile` · `/orders` · `/orders/:id` · `/schedule` · `/delivery-status` · `/delivery-status/:id` · `/collection-reports` · `/driver` · `/driver/create` · `/driver/:id` · `/change-password` |

- `/schedule` và `/collection-reports` chỉ có trang danh sách (không còn trang `:id`).
- `/driver/create` phải khai báo **trước** `/driver/:id`, nếu không "create" bị hiểu là id.

---

## 6. Pages (`src/pages/`)

| Thư mục | Nội dung chính |
|---|---|
| `auth/` | Login, ForgotPassword, Verify, ResetPassword, ResetSuccess |
| `register/` | RegisterPage + RegisterStepper; section BasicInfo / ServiceArea / VehicleInfo / ContactTable |
| `dashboard/` | DashboardPage, AnnouncementDetailPage; card: Announcement, MonthlySchedule, PendingQuote |
| `profile/` | ProfilePage; tab BasicInfo / DeliveryInfo / History |
| `orders/` | OrdersPage, OrderDetailPage; tab RequestDetail / Answer / AnswerHistory |
| `schedule/` | SchedulePage — lịch tháng/tuần, dùng `components/ScheduleCalendar` |
| `delivery-status/` | list + detail; tab Overview / Address / Report / Result |
| `collection-reports/` | BillPage — danh sách, có export |
| `driver/` | EmployeePage, EmployeeDetailPage, CreateDriverPage; cấp tài khoản hàng loạt (bulk issue account) |
| `change-password/` | Đổi mật khẩu |

---

## 7. Layouts

| Layout | Vai trò |
|---|---|
| `AuthLayout.tsx` | Khung chính sau đăng nhập (sidebar + header) |
| `AuthCenteredLayout.tsx` | Khung giữa màn hình (trang reset thành công) |
| `NonAuthLayout.tsx` | Trang auth công khai (login, forgot, verify) |
| `PublicPageLayout.tsx` | Trang đăng ký (khác NonAuth về branding) |

---

## 8. Redux store (`src/stores/`)

- `index.ts` — cấu hình store RTK, bật DevTools khi dev.
- `reducers/auth.ts` — state: `accessToken`, `refreshToken`, `status`, `user`.
- Actions: `setAuthTokens`, `setCurrentUser`, `clearAuthState`, `bootstrapAuthStateFromCookies`.
- **Chỉ có slice `auth`.** Không thêm slice mới trừ khi thật sự có state phía client.

---

## 9. API services (`src/services/`)

**HTTP (`http/`):**

| File | Việc |
|---|---|
| `axios.instance.ts` | Axios instance cũ (scaffold, không dùng trực tiếp — xem `patterns.md` §1) |
| `handleRequest.ts` | Gắn token vào request |
| `handleResponse.ts` | Xử lý lỗi + phiên hết hạn |
| `authToken.ts` | Đọc/ghi cookie token |
| `sessionExpired.ts` | Phát tín hiệu "phiên hết hạn" cho modal |

**Client services (`client/`, 15 service + `api.ts`):**
`auth` · `user` · `company-profile` · `company-contact` · `order-request` · `delivery` · `collection-report` · `driver` · `schedule` · `deliverer-register` · `announcement` · `fee-area` · `file-upload` (presigned upload) · `postal-code` · `error-report` (đuôi `.service.ts`)

**Query:** `query/queryClient.ts` · `baseQuery.ts`

---

## 10. Custom hooks (`src/hooks/`)

| Nhóm | Hook |
|---|---|
| Auth / phiên | `useAuth`, `useSessionExpired`, `useCan` (kiểm `roles`; component `RequiredPermission`) |
| Dữ liệu (bọc TanStack Query) | `useOrderRequests`, `useSchedule`, `useDeliveries`, `useDrivers`, `useFeeAreas`, `useCompanyProfile`, `useCompanyContacts`, `useAnnouncements`, `useCollectionReports`, `useDelivererRegister`, `usePostalCodeSearch` |
| UI / form | `useTableParams`, `useMutationCustom`, `useUnsavedChangesGuard` (.tsx), `useDebouncedValue`, `useInView`, `router` |

> **Đặc thù E05:** mỗi domain có hook riêng bọc TanStack Query. E03 thì gọi `useQuery` thẳng trong page. Thêm tính năng mới thì theo kiểu E05 (hook riêng).

---

## 11. Phiên đăng nhập (auth)

- JWT (access + refresh) lưu **cookie** qua `js-cookie`.
- Khi app khởi động: `bootstrapAuthStateFromCookies()` nạp token vào Redux; `AuthBootstrap` gọi lấy user.
- Interceptor request gắn token. Interceptor response: lỗi 401 → xem `patterns.md` §3 (đoạn "Phiên hết hạn").
- `SessionExpiredModal` + `useSessionExpired`: báo "phiên hết hạn" nhẹ nhàng thay vì đá văng đột ngột.

---

## 12. Path alias

`@`, `@components`, `@layouts`, `@pages`, `@routes`, `@services`, `@shared`, `@hooks`, `@utils`, `@types`, `@assets`. (`@/…` trỏ `src/`.)

---

## 13. Biến môi trường

| Biến | Dùng để |
|---|---|
| `VITE_API_BASE_URL` | URL gốc của API |
| `VITE_AUTH_URL` | URL auth server ngoài |
| `VITE_AUTH_SECRET` | `src/config.ts` có đọc (`serverConfig.auth.secret`) nhưng KHÔNG có trong `.env.example` — chưa xác nhận có dùng thật |

---

## 14. Khởi động app (`src/main.tsx`)

1. Nạp token từ cookie vào Redux.
2. Render theo thứ tự lồng: `StrictMode` → `QueryClientProvider` → Redux `Provider` → `AntdProvider` (theme) → `AntdApp` → `RouterProvider`.
3. `ToastContainer` (react-toastify, góc trên phải, tự đóng sau 3 giây).

---

## 15. Giao diện (styling)

- **TailwindCSS 4.3** + `@tailwindcss/postcss`.
- **SCSS**: `_base.scss`, `_variables.scss`, `nav.scss`, `globals.scss`.
- **Ant Design 6.4**: reset CSS + theme tùy biến.
- **Tailwind safelist**: các màu động của biểu đồ (cam, xanh lá, vàng).
- **Màu chủ đạo:** xanh lá `#1a7f37` (`shared/theme/antd-theme.ts` → `colorPrimary`; = `colors.semantics.success.500` / green.500 trong `design_rule.md`, khớp Figma). Doc cũ ghi lime `#8ACA0D` là **lỗi thời**, không còn trong source.

**Vite plugin:** `vite-plugin-svgr` (import SVG thành component) · `@vitejs/plugin-react` 6.0.2.
