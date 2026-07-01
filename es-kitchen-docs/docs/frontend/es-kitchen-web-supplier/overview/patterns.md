# es-kitchen-web-supplier — Patterns & Conventions

> Repo này được scaffold từ cùng template với `es-kitchen-web-admin` — **dependencies giống hệt** (cùng version React 19.2, Vite, RTK 2.12, TanStack Query 5.10, Ant Design 6.4, react-hook-form 7.76, yup 1.7).
>
> **Pattern chính → tham chiếu `frontend/es-kitchen-web-admin/overview/patterns.md`** (single source of truth). File này chỉ note những điểm **khác biệt** hoặc **ràng buộc riêng** của repo Supplier.

---

## Stack reference

| Layer | Library | Version | Pattern doc |
|---|---|---|---|
| HTTP client | Axios | 1.16 | [web-admin patterns — HTTP Client](../../es-kitchen-web-admin/overview/patterns.md#http-client-pattern) |
| Server state | TanStack Query | 5.10 | [web-admin patterns — TanStack Query](../../es-kitchen-web-admin/overview/patterns.md#tanstack-query-pattern-v5) |
| Client state | Redux Toolkit | 2.12 | [web-admin patterns — Redux Toolkit](../../es-kitchen-web-admin/overview/patterns.md#redux-toolkit-pattern-v2) |
| Routing | react-router-dom | 7.15 | [web-admin patterns — Routing](../../es-kitchen-web-admin/overview/patterns.md#routing-pattern) |
| Forms | react-hook-form + yup | 7.76 / 1.7 | [web-admin patterns — Form](../../es-kitchen-web-admin/overview/patterns.md) — section "Form Pattern" |
| UI | Ant Design + TailwindCSS | 6.4 / 4.3 | [web-admin patterns — Ant Design v6](../../es-kitchen-web-admin/overview/patterns.md) — section "Ant Design v6" |
| Auth tokens | js-cookie | 3.0 | Cookie storage (KHÔNG localStorage) |

---

## Khác biệt với web-admin

| Khía cạnh | web-admin (E03) | web-supplier (E04) |
|---|---|---|
| Stage | Đầy đủ 24 routes, 13 services | 13 routes + wildcard, 7 service files |
| Domain | System Admin — quản trị toàn hệ thống | Supplier — quản lý menu, nhận đơn |
| Locale | `'Accept-Language': 'ja'` | Giống — `Accept-Language: ja` trong `services/client/api.ts` |
| Permission model | Operation vs User accounts | Supplier account (single role) — `useCan({ roles? })` |
| Mutation wrapper | useMutation trực tiếp | `useMutationCustom` — auto error/success toast |
| Auth flow | Single-step login | Multi-step: login + forgot-password + verify OTP + reset |
| `message` API | `App.useApp()` hook | `message` import trực tiếp từ `antd` (trong `useMutationCustom`) |

---

## Ràng buộc riêng

### 1. Endpoint path — KHÔNG có prefix `/supplier/`

Endpoint thực tế trong codebase không dùng prefix `/supplier/`. Đây là quy ước của backend:

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

### 2. Auth flow — multi-step forgot password

Luồng khôi phục mật khẩu truyền dữ liệu qua URL search params, không dùng Redux hay session storage:

```
ForgotPasswordPage  →  VerifyPage          →  ResetPasswordPage  →  ResetSuccessPage
POST /auth/forgot-password/request   POST /auth/forgot-password/verify-otp   POST /auth/forgot-password/reset-password
?supplierCode=S001&email=...         ?supplierCode=...&email=...&otp=XXXX     (marks session + dispatch setAuthTokens)
```

- `PublicOnly` guard xử lý trường hợp đặc biệt: nếu đã authenticated và đang ở `/reset-password` thì redirect sang `/reset-success` (không bị block)
- `markResetSuccessAccess()` / `canAccessResetSuccess()` — utility guard cho trang success
- OTP resend countdown 60 giây, lock bằng `resendLockRef` để tránh double-submit

### 3. `useMutationCustom` — wrapper mutation tiêu chuẩn

Mọi mutation trong E04 đều dùng `useMutationCustom` thay vì `useMutation` trực tiếp.

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

**Lưu ý:** `useMutationCustom` dùng `message` import trực tiếp từ `antd` (KHÔNG qua `App.useApp()`). Đây là exception so với Ant Design v6 guidelines — chấp nhận ở E04 vì hook này chạy ngoài component tree.

### 4. Fake data pattern — BE endpoint chưa ready

Khi BE chưa implement endpoint, service file dùng `USE_FAKE_DATA` flag kèm file `.fake.ts`:

```typescript
// services/client/order.service.ts
// NOTE: BE endpoints are not yet implemented.
export const USE_FAKE_DATA = true;

export const getOrders = (params?: GetOrdersParams) => {
  if (USE_FAKE_DATA) return getFakeOrders(params);  // from order.fake.ts
  return API.get(APIs.ORDERS, params);
};
```

- Khi BE ready: set `USE_FAKE_DATA = false`, xóa import fake, xóa file `.fake.ts`
- Các service đang dùng fake: `order.service.ts`, `shipping.service.ts`, `menu-management.service.ts`
- Service không cần fake: `auth.service.ts`, `profile.service.ts` (BE đã ready)

### 5. `useTableParams` — table state đồng bộ với URL

Hook quản lý toàn bộ trạng thái bảng (phân trang, sort, filter) và đồng bộ vào URL search params:

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

- `isNotChangeUrl: true` → local state mode, không đổi URL (dùng cho nested table)
- `handleResetFilers(keysKeep?)` → clear filter, giữ lại một số keys nếu cần
- Batches URL updates qua `queueMicrotask` để tránh multiple navigation

### 6. `useUnsavedChangesGuard` — chặn navigation khi có thay đổi chưa lưu

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

- Dùng `useBlocker` (react-router v7) + `useBeforeUnload` (browser tab close)
- `DiscardChangesModal` hiển thị confirm dialog
- `confirmDiscard(action?)` — trigger modal kèm custom action khi confirm

### 7. Component reuse

`Base*` components trong `components/Common/` được copy từ web-admin. Khi sửa logic:
- **Không tự sync** sang web-admin
- Đề xuất tách thành package `@eskitchen/ui` shared nếu cần fix bug (cross-repo refactor — cần PM approve)

### 8. Tailwind config

TailwindCSS v4 — config qua PostCSS (`postcss.config.js`), KHÔNG có file `tailwind.config.js` cũ. Theme tokens trong `shared/theme/`.

### 9. Test coverage

`package.json` script `test` hiện là `echo "No tests configured" && exit 0`. Khi implement feature đầu tiên cần test:
- Setup Jest + React Testing Library + msw
- Coverage target: ≥ 70% cho component critical path

---

## TanStack Query v5 — pattern thực tế

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

---

## Form pattern — Controller + yup

```typescript
// Schema trong validation/schemas.ts (shared) hoặc inline nếu page-specific + phức tạp
// Ví dụ: changePasswordSchema, signInSchema, forgotPasswordSchema → validation/schemas.ts
// Ví dụ: orderSchema, shippingSchema (nhiều conditional rule) → inline trong page file

const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: yupResolver(schema) as Resolver<FormData>,
  defaultValues: { field1: "", field2: "" },
});

// Luôn dùng Controller, không dùng register trực tiếp
<Controller
  name="fieldName"
  control={control}
  render={({ field }) => (
    <BaseInput {...field} label="Label" error={errors.fieldName?.message} />
  )}
/>
```

**Conditional validation với `.when()`:**
```typescript
courierName: yup.string().when("deliveryMethod", {
  is: "direct",
  then: s => s.required("運送会社名は必須です"),
  otherwise: s => s.optional(),
}),
```

---

## Routing pattern

```
createBrowserRouter([
  PublicOnly (guard)
    NonAuthLayout
      /login, /forgot-password, /verify, /reset-password

  RequireAuth (guard)
    AuthCenteredLayout
      /reset-success

    AuthLayout
      /dashboard, /orders, /orders/:id
      /menu-management, /menu-management/:id
      /shipping-management/:id
      /change-password, /other, /profile

  { path: "*" → Navigate to /login }
])
```

- `withSuspense(element, className?)` — wrapper `Suspense` + `BaseLoading` fallback
- Auth pages dùng `AuthCard` component (centered card layout)
- Authenticated pages dùng `BaseHeadingBreadcrumb` ở đầu trang
- `useRouter()` custom hook (wrap `useNavigate`) — dùng thay vì `useNavigate` trực tiếp:
  ```typescript
  const router = useRouter();
  router.push("/orders");    // navigate
  router.replace("/login");  // replace
  router.back();             // go back
  ```

---

## Redux — auth slice duy nhất

```typescript
// stores/reducers/auth.ts — các action chính
dispatch(setAuthTokens({ accessToken, refreshToken }))  // sau login / reset-password
dispatch(setCurrentUser(user))                           // sau bootstrap fetchCurrentAdmin
dispatch(clearAuthState())                               // logout + 401

// SESSION_STATUS: LOADING → AUTHENTICATED | UNAUTHENTICATED
// LOADING = có cookie nhưng chưa fetch /account/me
```

- `AuthBootstrap` component (mount trong root layout) dùng `queryClient.fetchQuery` để lấy `/account/me` và dispatch `setCurrentUser`
- Tokens lưu trong cookie, đọc qua `getAccessToken()` / `getRefreshToken()` từ `services/http/`

---

## Implementing feature mới — checklist

Khi bắt đầu task implementation từ `features/<feature>/es-kitchen-web-supplier/tasks/task-X-Y.md`:

1. Đọc DESIGN.md cùng folder để hiểu API contract
2. Tạo service file trong `services/client/<feature>.service.ts`
   - Nếu BE chưa ready: thêm `USE_FAKE_DATA = true` + file `.fake.ts`
   - Không prefix `/supplier/` trong path endpoint
3. Tạo page trong `pages/<feature>/` → `<Feature>Page.tsx` + `<Feature>DetailPage.tsx` + `components/`
4. Add lazy import + route vào `routes/index.tsx` với `withSuspense()`
5. Add route constant vào `constants/route.ts`
6. Form: react-hook-form + yup
   - Schema đơn giản → `validation/schemas.ts`
   - Schema phức tạp (conditional) → inline trong page file
7. Server state: TanStack Query v5 (object syntax), `queryKey` gồm resource + filter params
8. Mutations: dùng `useMutationCustom` — không tự try/catch khi dùng hook này
9. Unsaved changes: `useUnsavedChangesGuard({ when: isDirty })` nếu page có form edit
10. Table page: `useTableParams({ keyExtraParams: [...] })` để sync filter + pagination vào URL

---

## Trigger Tech Lead khi cần update overview

Khi repo này đã có thêm feature → outdated overview:

```
"Hãy là Tech Lead, cập nhật overview docs cho repo es-kitchen-web-supplier"
```
