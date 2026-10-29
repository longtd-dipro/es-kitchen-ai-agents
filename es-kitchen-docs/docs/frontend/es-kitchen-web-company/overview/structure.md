# es-kitchen-web-company — Cấu trúc Source

> Nguồn = `es-kitchen-web-company@fddcaef` ngày 2026-10-16 (commit cuối 2026-06-25, không có commit mới từ lần cập nhật docs trước; working tree chỉ sửa `vite.config.ts` port 3001→3002, **chưa commit**).

**File này nói gì:** bản đồ repo E02 Company Admin: có những trang nào, trang nào đã nối API thật, trang nào còn dữ liệu giả (mock).
**Đọc khi nào:** ngày đầu vào dự án, hoặc khi cần biết "tính năng này đã có backend chưa". Cách viết code → `patterns.md` cùng thư mục.

- Repo: `es-kitchen-web-company` · Epic: **E02 Company Admin** · 58 functions.
- Stack (installed): React 19.2.4 / Vite 7.3.1 / TypeScript ~5.9.3 / RTK 2.11.2 / TanStack Query 5.90.20 / Ant Design 6.2.2 / react-router-dom 7.13.0 / Tailwind 4.1.18 / react-hook-form 7.72.0 + yup 1.7.1 / axios 1.13.4 / react-toastify 11. **Không có** socket.io, recharts, lodash, quill.

---

## 1. Đừng nhầm với `es-kitchen-web-admin`

| | `es-kitchen-web-admin` | `es-kitchen-web-company` |
|---|---|---|
| Epic | E03 System Admin | E02 Company Admin |
| Người dùng | Internal system admin | Company staff |
| Functions | 160 | 58 |
| Default route | `/dashboard` | `/sales-management` |
| Pages hiện có | 24 thư mục domain / 115 page.tsx | 10 thư mục domain / 18 page.tsx |
| Permission guard | `RequirePermission` + `usePermissions` | Không có (chỉ `RequireAuth`, `PublicOnly`; `useCan` đọc role từ `utils/client/permission.ts`) |

> ⚠️ Hai repo dùng chung stack nhưng **nghiệp vụ hoàn toàn khác nhau**. Không copy endpoint, không nhầm lẫn.

---

## 2. App gồm những phần nào

```
Trình duyệt → main.tsx (providers) → App → Router
   ├─ Public:   PublicOnly → NonAuthLayout / RegisterLayout
   └─ Đã login: RequireAuth → AuthLayout (sidebar + header) → pages/<domain>
                                  ├─ hook TanStack Query ← services/client/*.service.ts
                                  │        ├─ API thật  → axios (api.ts) → backend
                                  │        └─ MOCK      → dữ liệu trong bộ nhớ (chưa có BE)
                                  └─ Redux: chỉ slice `auth`
```

Vì sao như vậy:
- **Không có permission guard theo route** — chỉ kiểm "đã login chưa" (`RequireAuth`) và "đã login mà vào trang login" (`PublicOnly`).
- **Nhiều trang mock:** UI đi trước backend; mock service giữ đúng hình dạng hàm để sau này chỉ thay phần ruột.

---

## 3. Cây thư mục

```
es-kitchen-web-company/
└── src/
    ├── pages/                    ← 10 domain (18 page.tsx)
    │   ├── auth/                 ← Login, ForgotPassword, Verify, ResetPassword, ResetSuccess, register/ (đăng ký company, nhiều section)
    │   ├── account-management/   ← user/[userId]
    │   ├── sales-management/     ← components/UserSales, user-purchase-history/[purchaseNumber]
    │   ├── company-management/   ← [id] (tabs: contract · history · manager), mock.ts
    │   ├── contract-management/  ← create/ (step 1-3: sections, step3)
    │   ├── menu-order/           ← create/, hooks/useMenuOrder.ts, components (ProductCard, AiDistributionDrawer, …)
    │   ├── delivery-management/  ← schedule/ (calendar) · prepared-shipping/[id] · material-shipping
    │   ├── disposal-report/      ← báo cáo phế thải
    │   ├── disposal-history/     ← lịch sử phế thải
    │   └── employee-benefits/    ← phúc lợi nhân viên (page mới nhất, ESKITCHEN-1422)
    │
    ├── components/               ← Auth/, Common/ (Base* — không có BaseRichTextEditor, ChangeHistoryTable, BaseInfiniteSelect… như web-admin)
    ├── layouts/                  ← AuthLayout · AuthCenteredLayout · NonAuthLayout · RegisterLayout
    ├── routes/                   ← index.tsx (createBrowserRouter) + guards/{RequireAuth,PublicOnly}.tsx
    ├── stores/reducers/auth.ts   ← slice duy nhất
    ├── services/
    │   ├── client/               ← api.ts (Requester) + 11 *.service.ts (xem mục 6)
    │   ├── http/                 ← axios.instance, authToken, handleRequest, handleResponse
    │   └── query/                ← queryClient (staleTime 0, gcTime 0), baseQuery
    ├── hooks/                    ← 9 file: useAuth, useCan, useDebouncedValue, useInView, useMutationCustom,
    │                               usePaymentMethodOptions, useTableParams, useUnsavedChangesGuard, router
    ├── models/                   ← account, auth, common, company, contract, delivery-schedule, disposal,
    │                               location, menu-order, prepared-shipping, sales, Response
    ├── constants/ (route, nav, menu, messages, errors, date, common, example-data) · enums/ · types/ · config.ts
    ├── data/menu-order-products.json  ← dữ liệu mẫu cho menu-order
    ├── utils/ (common.ts, client/, menu/) · validation/schemas.ts
    ├── shared/ (providers/AntdProvider.tsx, theme/antd-theme.ts) · styles/ · statics/
    └── main.tsx                  ← StrictMode → QueryClient → Redux → AntdProvider → AntdApp → ToastContainer → App
```

---

## 4. Routes (23 path, đếm từ `routes/index.tsx`)

| Nhóm | Route path | Ghi chú |
|---|---|---|
| Public (`NonAuthLayout`) | `/login` · `/forgot-password` · `/verify` · `/reset-password` | `PublicOnly`; `/` → `/login` |
| Public (`RegisterLayout`) | `/register` | Đăng ký company |
| Auth (`AuthCenteredLayout`) | `/reset-success` | |
| Auth (`AuthLayout`) | `/account-management` · `/account-management/user/:userId` | Users của company |
| | `/sales-management` · `/sales-management/user-purchase-history/:purchaseNumber` | **Default sau login** (`/` → `/sales-management`) |
| | `/company-management` · `/company-management/:id` | Mock FE-only |
| | `/contract-management` · `/contract-management/create` | Mock FE-only |
| | `/menu-order` · `/menu-order/create` | Mock FE-only |
| | `/delivery-management/schedule` · `/delivery-management/prepared-shipping` · `/delivery-management/prepared-shipping/:id` · `/delivery-management/material-shipping` | Mock FE-only |
| | `/disposal-report` · `/disposal-history` | Mock FE-only |
| | `/employee-benefits` | |
| Fallback | `*` → `/login` | |

> `ROUTE` còn khai báo `MENU_MANAGEMENT`, `PRODUCT_MASTER_MANAGEMENT` (`/menu-management`, `/product-master-management`) nhưng **chưa có route** tương ứng trong router (nằm trong `constants/route.ts`, có thể dùng cho nav) — chưa xác nhận.

---

## 5. Redux store

| Slice | State |
|---|---|
| `auth` | `accessToken`, `refreshToken`, `user`, `status` |

- Cùng pattern với web-admin — token lưu cookie.
- 401 → `clearAuthState()` (`services/http/handleResponse.ts`) → logout.
- **Không có** `handleSessionEnded` / socket session như web-admin: hết phiên là bị đẩy về `/login`, không có modal báo.

---

## 6. API service layer

Cùng pattern với `es-kitchen-web-admin`: `services/client/api.ts` — Axios `Requester` singleton; service gọi `API.get/post/put/patch/delete`; `VITE_API_BASE_URL` (+ `VITE_AUTH_URL`) trong `.env.example`.

| Nhóm | File |
|---|---|
| **API thật** | `auth.service.ts` (`/auth/login`, `/company/me`, `/auth/forgot-password/*`) · `account.service.ts` (`/users/linked*`) · `sales.service.ts` (`/orders*`, `/payment-methods`) · `user.service.ts` (`/api/v1/users/me`) · `error-report.service.ts` · `company.service.ts` (chỉ `exportCompanyQr` → `/company/export-qr`, phần còn lại mock) |
| **FE-only MOCK** | `contract.service.ts` · `disposal.service.ts` · `menu-order.service.ts` · `prepared-shipping.service.ts` · `delivery-schedule.service.ts` (+ phần còn lại của `company.service.ts`) |

---

## 7. Hiện trạng so với yêu cầu (đối chiếu source 2026-10-16)

Đã có UI:
- ✅ Auth (login, forgot password, OTP verify, reset, register company).
- ✅ Account Management (user listing + detail) · Sales Management (user sales, purchase history) — **nối API thật**.
- ✅ Company / Contract / Menu order / Delivery (schedule, prepared-shipping, material-shipping) / Disposal (report, history) / Employee benefits — **UI dùng mock data**, chưa nối BE (trừ export QR).

Chưa có trong repo: company profile settings (chưa thấy page).
