# es-kitchen-web-supplier — Patterns & Conventions

> Nguồn = `es-kitchen-web-supplier@57c8179` ngày 2026-10-16 (+ file untracked `pages/profile`, `profile.service.ts`, `models/profile.ts` — chưa merge). Xác minh lại: `hooks/useMutationCustom.ts` (dùng `message` của `antd`), `hooks/useUnsavedChangesGuard.tsx`, `services/query/queryClient.ts`.

**File này nói gì:** những điểm **riêng** của E04 Supplier so với web-admin: endpoint không có prefix, đăng nhập/quên mật khẩu nhiều bước, toast dùng `message` của AntD, dữ liệu giả cho shipping, cache 5 phút.
**Đọc khi nào:** trước khi viết code React mới cho E04.

Repo này scaffold từ cùng template với `es-kitchen-web-admin` — dependencies cùng họ (React 19.2, RTK 2.12, TanStack Query 5.10x, AntD 6.4, react-hook-form 7.76, yup 1.7). **Pattern chính → đọc `frontend/es-kitchen-web-admin/overview/patterns.md`** (nguồn chuẩn). File này chỉ ghi chỗ khác.

---

## 0. Tình huống → cách xử lý → file mẫu

| Tình huống | Cách xử lý | File mẫu |
|---|---|---|
| Thêm API | Hàm export trong `services/client/<x>.service.ts`, **không** prefix `/supplier/` | `order.service.ts` |
| BE chưa xong | `USE_FAKE_DATA = true` + file `.fake.ts` | `shipping.service.ts` |
| Mutation + toast | `useMutationCustom` (toast qua `message` của antd) | `hooks/useMutationCustom.ts` |
| Trang danh sách | `useTableParams({ keyExtraParams })` | `pages/orders/OrdersPage.tsx` |
| Chặn rời trang khi form dirty | `useUnsavedChangesGuard({ when: isDirty })` | trang có form edit |
| Quên mật khẩu 4 bước | Truyền dữ liệu qua URL params | `pages/auth/*` |
| Phiên hết hạn | Đã xử lý trong interceptor + `SessionExpiredModal` | `services/http/sessionExpired.ts` |
| Form điều kiện | yup `.when()` | `orderSchema`, `shippingSchema` |

---

## 1. Stack tham chiếu

| Layer | Library | Version | Pattern doc |
|---|---|---|---|
| HTTP client | Axios | 1.16 | [web-admin — HTTP client](../../es-kitchen-web-admin/overview/patterns.md#1-http-client) |
| Server state | TanStack Query | 5.10 | [web-admin — TanStack Query](../../es-kitchen-web-admin/overview/patterns.md#3-tanstack-query-v5) |
| Client state | Redux Toolkit | 2.12 | [web-admin patterns](../../es-kitchen-web-admin/overview/patterns.md) — mục 9 "Redux Toolkit v2" |
| Routing | react-router-dom | 7.15 | [web-admin — Routing](../../es-kitchen-web-admin/overview/patterns.md#11-routing) |
| Forms | react-hook-form + yup | 7.76 / 1.7 | [web-admin patterns](../../es-kitchen-web-admin/overview/patterns.md) — mục 15 "Form" |
| UI | Ant Design + TailwindCSS | 6.4 / 4.3 | [web-admin patterns](../../es-kitchen-web-admin/overview/patterns.md) — mục 16 "Ant Design v6" |
| Auth tokens | js-cookie | 3.0 | Cookie (KHÔNG localStorage) |

---

## 2. Khác biệt với web-admin

| Khía cạnh | web-admin (E03) | web-supplier (E04) |
|---|---|---|
| Quy mô | 115 page, 52 service | 15 route path + wildcard, 10 service file (+1 untracked), 1 fake |
| Domain | System Admin — quản trị toàn hệ thống | Supplier — quản lý menu, nhận đơn |
| Locale | `'Accept-Language': 'ja'` | Giống — `Accept-Language: ja` trong `services/client/api.ts` |
| Permission model | Operation vs User accounts, `usePermissions` | Supplier account (một vai trò) — `useCan({ roles? })` |
| Mutation wrapper | `useMutationCustom` (toast `react-toastify`) | `useMutationCustom` (toast `message` của `antd`) |
| Auth flow | Single-step login (+ OTP login, socket session) | Nhiều bước: login + forgot-password + verify OTP + reset |
| Hết phiên | `SessionEndedModal` (socket + 401) | `SessionExpiredModal` (401 có Authorization) |
| Cache mặc định | `staleTime: 0`, `gcTime: 0` | `staleTime` 5 phút |

---

## 3. Endpoint — KHÔNG có prefix `/supplier/`

**Vấn đề:** dễ đoán endpoint theo tên portal, nhưng backend không đặt prefix theo portal.

**Cách làm:** viết path đúng như BE: `/auth/...`, `/account/...`, `/orders/...`.

```typescript
// ✅ Đúng — services/client/auth.service.ts
const APIs = {
  SIGNIN: "/auth/login",
  ME: "/account/me",
  LOGOUT: "/auth/logout",
  FORGOT_PASSWORD: "/auth/forgot-password/request",
  CHANGE_PASSWORD: "/account/change-password",
};

// ✅ Đúng — services/client/order.service.ts
const APIs = {
  ORDERS: "/orders",
  ORDER_DETAIL: (id: string) => `/orders/${id}`,
  SHIPPING_RESPONSE: (id: string) => `/orders/${id}/shipping-response`,
};

// ❌ SAI — không dùng /supplier/* hay /admin/*
// API.get('/supplier/orders', params)  // KHÔNG tồn tại
// API.get('/admin/orders', params)     // đó là E03
```

**Bẫy:** copy URL từ web-admin (`/admin/...`) sang đây sẽ 404.

---

## 4. Đăng nhập / quên mật khẩu nhiều bước

**Vấn đề:** quên mật khẩu đi qua 4 trang, mỗi trang cần dữ liệu của trang trước.

**Cách làm:** truyền qua **URL search params**, không dùng Redux hay session storage.

```
ForgotPasswordPage  →  VerifyPage          →  ResetPasswordPage  →  ResetSuccessPage
POST /auth/forgot-password/request   POST /auth/forgot-password/verify-otp   POST /auth/forgot-password/reset-password
?supplierCode=S001&email=...         ?supplierCode=...&email=...&otp=XXXX     (marks session + dispatch setAuthTokens)
```

- `PublicOnly` có trường hợp đặc biệt: nếu đã authenticated và đang ở `/reset-password` thì redirect sang `/reset-success` (không bị chặn).
- `markResetSuccessAccess()` / `canAccessResetSuccess()` — tiện ích bảo vệ trang success.
- OTP gửi lại có đếm ngược 60 giây, khoá bằng `resendLockRef` để tránh bấm đôi.

**Bẫy:** truy cập thẳng `/reset-success` mà không đi qua bước reset sẽ không được vào (guard bằng `canAccessResetSuccess()` — hành vi cụ thể chưa chạy thử).

---

## 5. `useMutationCustom` — wrapper mutation chuẩn

**Vấn đề:** mỗi mutation cần toast lỗi/thành công giống nhau.

**Cách làm:** mọi mutation trong E04 dùng `useMutationCustom` thay vì `useMutation` trực tiếp. Tự toast lỗi; có `customSuccessMessage` thì toast thành công.

```typescript
// ✅ hooks/useMutationCustom.ts — dùng ở toàn bộ page
import { useMutationCustom } from "@/hooks/useMutationCustom";

const mutation = useMutationCustom({
  mutationFn: changePassword,
  // Auto hiển thị error toast — không cần try/catch
  customSuccessMessage: "パスワードを変更しました",
  onSuccess: () => {
    void queryClient.invalidateQueries({ queryKey: ["supplier-profile"] });
  },
});

// skipAutoErrorHandling: true → tự xử lý error trong onError
// skipAutoSuccessHandling: true → tự xử lý success (không auto toast)
const mutation2 = useMutationCustom({
  mutationFn: verifyForgotPasswordOtp,
  skipAutoErrorHandling: true,
  onError: (error) => { message.error(error.response?.data?.message); },
});

// isPending thay vì isLoading (TanStack Query v5)
<Button loading={mutation.isPending}>実行</Button>
```

**Bẫy:**
- Hook dùng `message` **import trực tiếp từ `antd`** (không qua `App.useApp()`); `react-toastify` chỉ dùng cho `ToastContainer`. Khác E03/E02, nơi `useMutationCustom` gọi `toast` của `react-toastify`. Đừng copy nguyên hook giữa các repo mà không kiểm.
- Lý do giữ cách này (theo doc cũ): hook chạy ngoài component tree nên không dùng được `App.useApp()`.

---

## 6. Dữ liệu giả khi BE chưa sẵn sàng

**Vấn đề:** UI shipping cần chạy trước khi BE xong.

**Cách làm:** service có cờ `USE_FAKE_DATA` kèm file `.fake.ts`.

```typescript
// services/client/shipping.service.ts
export const USE_FAKE_DATA = true;
// if (USE_FAKE_DATA) { return getFakeShipmentDetail(...) }  // from shipping.fake.ts
```

- Khi BE xong: `USE_FAKE_DATA = false`, xoá import fake, xoá file `.fake.ts`.
- Đang fake (đã kiểm 2026-10-16): chỉ `shipping.service.ts` (`shipping.fake.ts`).
- Gọi API thật: `auth`, `order`, `supplier`, `notice`, `file-upload`, `error-report`, `user`, `profile` (untracked).
- `order.fake.ts` / `menu-management.service.ts` đã bị xoá.

**Bẫy:** quên tắt cờ khi BE xong → màn vẫn hiện dữ liệu giả mà không báo lỗi.

---

## 7. `useTableParams` — bảng đồng bộ với URL

**Vấn đề:** lọc/sort/phân trang phải giữ được khi F5 hoặc gửi link.

**Cách làm:** hook quản lý page, sort, filter và đồng bộ vào URL search params.

```typescript
// pages/orders/OrdersPage.tsx
const EXTRA_PARAM_KEYS = ["shippingMonth", "status"];

const { tableParams, handleFilterTable, searchParams, handleResetFilers } = useTableParams<
  OrderListItem,
  GetOrdersParams
>({
  keyExtraParams: EXTRA_PARAM_KEYS,  // keys filter được sync vào URL
});

// searchParams dùng làm queryKey cho TanStack Query
const { data, isLoading } = useQuery({
  queryKey: ["orders", searchParams],
  queryFn: () => getOrders(searchParams),
});

// Filter form submit
const onFilter = (values: FilterFormValues) => {
  handleFilterTable(values);  // reset page = 1, cập nhật URL
};

// Props cho BaseTable
<BaseTable
  page={tableParams.page}
  rowsPerPage={tableParams.rowsPerPage}
  setPage={tableParams.setPage}
  setRowsPerPage={tableParams.setRowsPerPage}
  total={total}
/>
```

- `isNotChangeUrl: true` → chế độ state cục bộ, không đổi URL (dùng cho bảng lồng).
- `handleResetFilers(keysKeep?)` → xoá filter, giữ lại một số key nếu cần.
- Hook gom các lần cập nhật URL qua `queueMicrotask` để tránh navigate nhiều lần.

---

## 8. `useUnsavedChangesGuard` — chặn rời trang khi có thay đổi chưa lưu

```typescript
// Dùng ở các page có form edit
const { guardModal, confirmNavigation, allowNextNavigation } = useUnsavedChangesGuard({
  when: isDirty,  // react-hook-form formState.isDirty
  title: "変更を破棄しますか？",
});

// Render modal vào JSX
return (
  <>
    {guardModal}
    <form>...</form>
  </>
);

// Nếu cần navigate sau save thành công (bypass guard)
allowNextNavigation(() => navigate(ROUTE.ORDERS));
```

- Dùng `useBlocker` (react-router v7) + `useBeforeUnload` (đóng tab trình duyệt).
- `DiscardChangesModal` hiển thị hộp xác nhận.
- Hook trả về `guardModal`, `confirmNavigation`, `confirmDiscard`, `allowNextNavigation`. `confirmDiscard(action?)` = `confirmNavigation` với action tuỳ chọn.

**Bẫy:** quên render `{guardModal}`; hoặc navigate thường sau Save → vẫn bị chặn (dùng `allowNextNavigation`).

---

## 9. Dùng lại component

`Base*` trong `components/Common/` được copy từ web-admin.
- **Không tự đồng bộ** sang web-admin khi sửa.
- Cần sửa bug chung → đề xuất tách package dùng chung `@eskitchen/ui` (refactor cross-repo, cần PM duyệt).

---

## 10. Tailwind & test

- **TailwindCSS v4** — cấu hình qua PostCSS (`postcss.config.js`), KHÔNG có `tailwind.config.js` kiểu cũ. Theme token trong `shared/theme/`.
- **Test:** script `test` trong `package.json` hiện là `echo "No tests configured" && exit 0`. Khi cần test đầu tiên:
  - Setup Jest + React Testing Library + msw.
  - Coverage target: ≥ 70% cho component critical path.

---

## 11. TanStack Query v5 — pattern thực tế

`queryKey` = tên ngăn cache (resource + params). `enabled` = chỉ chạy query khi điều kiện đúng. `invalidateQueries` = đánh dấu cũ để tự fetch lại.

```typescript
// List query — queryKey gồm tên resource + toàn bộ searchParams
const { data, isLoading } = useQuery({
  queryKey: ["orders", searchParams],
  queryFn: () => getOrders(searchParams),
});

// Detail query — enabled: !!id
const { data: detailData, isLoading } = useQuery({
  queryKey: ["order-detail", id],
  queryFn: () => getOrderDetail(id!),
  enabled: !!id,
});

// Sau mutation thành công — invalidate cả list lẫn detail
const mutation = useMutationCustom({
  mutationFn: (payload) => submitShippingResponse(id!, payload),
  onSuccess: () => {
    void queryClient.invalidateQueries({ queryKey: ["orders"] });
    void queryClient.invalidateQueries({ queryKey: ["order-detail", id] });
  },
});
```

**Bẫy:**
- `staleTime` 5 phút nên quay lại trang có thể thấy dữ liệu cũ nếu quên `invalidateQueries` sau mutation. (Khác E03/E02.)
- Query key ở E04 là chuỗi viết thẳng — gõ lệch giữa `useQuery` và `invalidateQueries` thì bảng không refresh.

---

## 12. Form: Controller + yup

**Cách làm:** schema đơn giản → `validation/schemas.ts` (vd `changePasswordSchema`, `signInSchema`, `forgotPasswordSchema`). Schema phức tạp, nhiều quy tắc điều kiện → inline trong file page (vd `orderSchema`, `shippingSchema`). Luôn dùng `Controller`, không dùng `register` trực tiếp.

```typescript
const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: yupResolver(schema) as Resolver<FormData>,
  defaultValues: { field1: "", field2: "" },
});

<Controller
  name="fieldName"
  control={control}
  render={({ field }) => (
    <BaseInput {...field} label="Label" error={errors.fieldName?.message} />
  )}
/>
```

**Validate theo điều kiện với `.when()`:**

```typescript
courierName: yup.string().when("deliveryMethod", {
  is: "direct",
  then: s => s.required("運送会社名は必須です"),
  otherwise: s => s.optional(),
}),
```

**Bẫy:** khác web-admin (schema đặt `schema.ts` cạnh page) — E04 gom schema đơn giản vào `validation/schemas.ts`.

---

## 13. Routing

```
createBrowserRouter([
  PublicOnly (guard)
    NonAuthLayout
      /login, /forgot-password, /verify, /reset-password
    PublicLayout
      /register (SupplierRegisterPage)

  RequireAuth (guard)
    AuthCenteredLayout
      /reset-success

    AuthLayout
      /dashboard, /orders, /orders/:id
      /menu-management, /menu-management/:id
      /shipping-management/:id
      /change-password, /other, /profile (SupplierProfilePage)

  { path: "*" → Navigate to /login }
])
```

- `withSuspense(element, className?)` — bọc `Suspense` + fallback `BaseLoading`.
- Trang auth dùng `AuthCard` (thẻ căn giữa).
- Trang sau login dùng `BaseHeadingBreadcrumb` ở đầu trang.
- `useRouter()` (bọc `useNavigate`) — dùng thay cho `useNavigate` trực tiếp:

```typescript
const router = useRouter();
router.push("/orders");    // navigate
router.replace("/login");  // replace
router.back();             // go back
```

---

## 14. Redux — chỉ slice `auth`

```typescript
// stores/reducers/auth.ts — các action chính
dispatch(setAuthTokens({ accessToken, refreshToken }))  // sau login / reset-password
dispatch(setCurrentUser(user))                           // sau bootstrap fetchCurrentAdmin
dispatch(clearAuthState())                               // logout; 401 khi đang có phiên → SessionExpiredModal (services/http/sessionExpired.ts) rồi mới clear

// SESSION_STATUS: LOADING → AUTHENTICATED | UNAUTHENTICATED
// LOADING = có cookie nhưng chưa fetch /account/me
```

- Component `AuthBootstrap` (mount trong root layout) dùng `queryClient.fetchQuery` lấy `/account/me` rồi dispatch `setCurrentUser`.
- Token lưu cookie, đọc qua `getAccessToken()` / `getRefreshToken()` từ `services/http/`.

---

## 15. Checklist làm feature mới

Khi bắt đầu từ `features/<feature>/es-kitchen-web-supplier/tasks/task-X-Y.md`:

1. Đọc DESIGN.md cùng thư mục để hiểu API contract.
2. Tạo `services/client/<feature>.service.ts`.
   - BE chưa xong: thêm `USE_FAKE_DATA = true` + file `.fake.ts`.
   - Không prefix `/supplier/` trong path.
3. Tạo page trong `pages/<feature>/`: `<Feature>Page.tsx` + `<Feature>DetailPage.tsx` + `components/`.
4. Thêm lazy import + route trong `routes/index.tsx` với `withSuspense()`.
5. Thêm route constant vào `constants/route.ts`.
6. Form: react-hook-form + yup.
   - Schema đơn giản → `validation/schemas.ts`.
   - Schema phức tạp (điều kiện) → inline trong page.
7. Server state: TanStack Query v5 (object syntax), `queryKey` gồm resource + filter params.
8. Mutation: `useMutationCustom` — không tự try/catch khi dùng hook này.
9. Có form edit: `useUnsavedChangesGuard({ when: isDirty })`.
10. Trang bảng: `useTableParams({ keyExtraParams: [...] })` để sync filter + phân trang vào URL.

Overview cũ (cần cập nhật khi repo có thêm feature) → nhờ Tech Lead: `"Hãy là Tech Lead, cập nhật overview docs cho repo es-kitchen-web-supplier"`.
