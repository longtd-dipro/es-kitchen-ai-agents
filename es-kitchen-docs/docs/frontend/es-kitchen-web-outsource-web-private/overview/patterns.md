# es-kitchen-web-outsource-web-private — Patterns & Conventions

> Repo được scaffold từ cùng template với `es-kitchen-web-admin`. Dependencies giống hệt.
> File này document **pattern cụ thể đang chạy trong code** (xác nhận từ source, 2026-07-01).
> Pattern chung (TanStack Query v5, RTK v2, react-hook-form v7 ...) → tham chiếu thêm
> `frontend/es-kitchen-web-admin/overview/patterns.md`.

---

## Stack reference

| Layer | Library | Version |
|---|---|---|
| HTTP client | Axios | 1.16 |
| Server state | TanStack Query | 5.10 |
| Client state | Redux Toolkit | 2.12 |
| Routing | react-router-dom | 7.15 |
| Forms | react-hook-form + yup | 7.76 / 1.7 |
| UI | Ant Design + TailwindCSS | 6.4 / 4.3 |
| Build tool | Vite | 8 (web-admin dùng 7) |
| Cookie | js-cookie | — |

---

## Khác biệt với web-admin (E03)

| Khía cạnh | web-admin (E03) | outsource-web-private (E05) |
|---|---|---|
| Vite | 7 | 8 |
| Màu primary (sidebar active) | blue `#0969DA` | lime green `#8ACA0D` |
| Endpoint prefix | `/admin/*` | `/auth/*`, `/account/*` (xác nhận từ code) |
| User type | System admin | Operation staff / deliverer |
| Navigation scope | 160 functions | 5 mục: TOP / 配送状況 / 集金額 / スタッフ / パスワード変更 |
| Redux slices | nhiều | **chỉ `auth`** |

---

## 1. HTTP Client Pattern

Primary HTTP instance: `services/client/api.ts` — class `Requester` (singleton `API`).

```typescript
// services/client/api.ts
const axiosInstance = axios.create({
  baseURL: serverConfig.api_server_url,   // import.meta.env.VITE_API_BASE_URL
  withCredentials: true,
  headers: { "Content-Type": "application/json", "Accept-Language": "ja" },
  paramsSerializer: params => serializeQueryParams(params ?? {}),
});

// interceptor request: inject Bearer token + timezone header
// interceptor response: 401 → store.dispatch(clearAuthState())
```

Dùng `API.get / API.post / API.put / API.patch / API.delete` — không dùng `axiosInstance` trong
`services/http/axios.instance.ts` (file đó là legacy scaffold, không được sử dụng trực tiếp).

---

## 2. Service File Pattern

Mỗi domain có file riêng trong `services/client/`. Quy ước:

```typescript
// services/client/delivery.service.ts
const APIs = {
  LIST:   "/deliveries",
  DETAIL: "/deliveries/:id",
  UPDATE: "/deliveries/:id",
};

// Named export functions (không dùng class / object với method)
export const fetchDeliveries = async (params?: DeliveryListParams): Promise<DeliveryListResult> => {
  return API.get(APIs.LIST, params);
};

export const fetchDeliveryById = async (id: string): Promise<DeliveryDetail> => {
  return API.get(`/deliveries/${id}`);
};

export const updateDeliveryById = async (id: string, payload: UpdateDeliveryPayload): Promise<DeliveryDetail> => {
  return API.patch(`/deliveries/${id}`, payload);
};
```

**Lưu ý quan trọng:** Nhiều service hiện đang dùng **mock data** trong khi chờ API thật.
Mỗi mock function có comment chỉ rõ endpoint thật để swap vào:

```typescript
// Mock data sourced from Figma node 83:7639.
// Swap to the real API once the endpoint exists:
//   return API.get("/deliveries", params);
```

Khi endpoint BE sẵn sàng: xóa mock, uncomment dòng `return API.xxx(...)`, xóa constant mock.

Endpoint thực tế đã xác nhận trong `auth.service.ts`:

```typescript
const APIs = {
  SIGNIN:                    "/auth/login",
  ME:                        "/account/me",
  LOGOUT:                    "/auth/logout",
  FORGOT_PASSWORD:           "/auth/forgot-password/request",
  VERIFY_FORGOT_PASSWORD_OTP:"/auth/forgot-password/verify-otp",
  RESET_PASSWORD:            "/auth/forgot-password/reset-password",
  CHANGE_PASSWORD:           "/account/change-password",
};
```

Không dùng prefix `/operation/*` — tên domain không phản ánh URL path thực tế.

---

## 3. Auth Flow Pattern

### 3.1 Token storage — js-cookie

```typescript
// services/http/authToken.ts
const ACCESS_TOKEN_KEY  = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const COOKIE_OPTIONS = { expires: 7, path: "/", sameSite: "strict" };

setAuthCookies({ accessToken, refreshToken });   // set cả hai
clearAuthCookies();                              // remove cả hai
getAccessToken();                                // lấy access token
```

### 3.2 Redux auth slice

```typescript
// stores/reducers/auth.ts
type AuthState = { accessToken, refreshToken, status, user }
// SESSION_STATUS: "loading" | "authenticated" | "unauthenticated"

// Actions:
setAuthTokens({ accessToken, refreshToken })  // sau login/reset-password
setCurrentUser(AuthCurrentUser)               // sau bootstrap
clearAuthState()                              // logout / 401
```

Bootstrap flow khởi động qua `AuthBootstrap` component (được mount ở root):
1. Đọc cookies → nếu có token → `status = "loading"`
2. Gọi `GET /account/me` qua `queryClient.fetchQuery`
3. Response → `dispatch(setCurrentUser(...))` → `status = "authenticated"`
4. 401 hoặc lỗi → `dispatch(clearAuthState())` → `status = "unauthenticated"`

### 3.3 Forgot password — 3-step OTP flow

```
ForgotPasswordPage → VerifyPage → ResetPasswordPage → ResetSuccessPage
POST /auth/forgot-password/request
          ↓ redirect với ?delivererCode=&email=
POST /auth/forgot-password/verify-otp
          ↓ redirect với ?delivererCode=&email=&otp=
POST /auth/forgot-password/reset-password  (returns accessToken + refreshToken)
          ↓ dispatch(setAuthTokens(...)) + router.replace(ROUTE.RESET_SUCCESS)
```

State giữa các bước truyền qua **URL search params** (không dùng Redux / sessionStorage):

```typescript
// ForgotPasswordPage → VerifyPage
const params = new URLSearchParams({ delivererCode, email });
router.push(`${ROUTE.VERIFY}?${params.toString()}`);

// VerifyPage → ResetPasswordPage
const params = new URLSearchParams({ delivererCode, email, otp });
router.push(`${ROUTE.RESET_PASSWORD}?${params.toString()}`);
```

Guard ngược: nếu thiếu param bắt buộc → `router.replace(ROUTE.FORGOT_PASSWORD)`.

**OTP countdown** (VerifyPage):

```typescript
const OTP_RESEND_COUNTDOWN_SECONDS = 60;
const [timeLeft, setTimeLeft] = useState(OTP_RESEND_COUNTDOWN_SECONDS);
const resendLockRef = useRef(false);  // tránh double-click race

useEffect(() => {
  if (timeLeft <= 0) return;
  const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
  return () => clearInterval(timer);  // cleanup bắt buộc
}, [timeLeft]);
```

### 3.4 Login pattern

LoginPage không dùng `useMutationCustom` — dùng `useState(loading)` + manual try/catch:

```typescript
// pages/auth/LoginPage.tsx
const [loading, setLoading] = useState(false);
const onSubmit = async (data) => {
  setLoading(true);
  try {
    const result = await signInService(data);
    dispatch(setAuthTokens({ accessToken, refreshToken }));
    router.push(searchParams.get("redirect") || ROUTE.INDEX);
  } catch (error) {
    if (isAxiosError(error)) message.error(error.response?.data?.message || MESSAGES.LOGIN_FAILED);
    else message.error(MESSAGES.LOGIN_FAILED);
  } finally {
    setLoading(false);
  }
};
```

---

## 4. Route Guard Pattern

```
PublicOnly    → bọc login / forgot-password / verify / reset-password
RequireAuth   → bọc tất cả route sau login
```

```typescript
// RequireAuth.tsx
export function RequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading)        return <BaseLoading />;
  if (!isAuthenticated) return <Navigate to={`${ROUTE.LOGIN}?redirect=...`} replace />;
  return <Outlet />;
}

// PublicOnly.tsx — xử lý thêm case reset-password sau login thành công
export function PublicOnly() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading)        return <BaseLoading />;
  if (isAuthenticated)  return <Navigate to={ROUTE.DASHBOARD} replace />;
  return <Outlet />;
}
```

---

## 5. Routing Pattern

### 5.1 useRouter wrapper

```typescript
// hooks/router.ts — KHÔNG dùng useNavigate trực tiếp trong component
export function useRouter() {
  const navigate = useNavigate();
  return {
    push:    (href) => navigate(href),
    replace: (href) => navigate(href, { replace: true }),
    back:    ()     => navigate(-1),
    refresh: ()     => window.location.reload(),
  };
}
export function usePathname()      { return useLocation().pathname; }
export function useSearchParams()  { return useRouterSearchParams()[0]; }
export function useParams<T>()     { return useRouteParams() as T; }
```

### 5.2 ROUTE constant

```typescript
// constants/route.ts — thêm mọi route mới vào đây
export const ROUTE = {
  DASHBOARD:       "/dashboard",
  DELIVERY_STATUS: "/delivery-status",
  BILL:            "/bill",
  EMPLOYEE:        "/employee",
  CHANGE_PASSWORD: "/change-password",
  LOGIN:           "/login",
  FORGOT_PASSWORD: "/forgot-password",
  VERIFY:          "/verify",
  RESET_PASSWORD:  "/reset-password",
  RESET_SUCCESS:   "/reset-success",
};
```

### 5.3 Lazy load với withSuspense

```typescript
// routes/index.tsx
const DeliveryStatusPage = lazy(() => import("@/pages/delivery-status/DeliveryStatusPage"));

const withSuspense = (element: ReactElement, className?: string) => (
  <Suspense fallback={<BaseLoading className={className || ""} />}>{element}</Suspense>
);

// Auth routes (public): className để size loading khớp AuthCard
{ path: ROUTE.LOGIN, element: withSuspense(<LoginPage />, "max-h-[511px] rounded-3xl") }
// App routes (authenticated): không cần className
{ path: ROUTE.DASHBOARD, element: withSuspense(<DashboardPage />) }
```

### 5.4 Layout hierarchy

```
PublicOnly
└── NonAuthLayout          (background image fullscreen + centered max-w-[464px])
    ├── LoginPage
    ├── ForgotPasswordPage
    ├── VerifyPage
    └── ResetPasswordPage

RequireAuth
├── AuthCenteredLayout     (giống NonAuthLayout — dùng cho ResetSuccessPage sau login)
│   └── ResetSuccessPage
└── AuthLayout             (sidebar 210px + Header + Content bg-[#F0F2F5])
    ├── DashboardPage
    ├── DeliveryStatusPage / :id
    ├── BillPage / :id
    ├── EmployeePage / :id
    └── ChangePasswordPage
```

---

## 6. Navigation Pattern

NAV_ITEMS được định nghĩa trong `constants/nav.ts`:

```typescript
export const NAV_ITEMS: NavItem[] = [
  { key: "dashboard",       labelJa: "TOP",            icon: DashboardIcon, href: ROUTE.DASHBOARD },
  { key: "delivery-status", labelJa: "配送状況",        icon: TruckIcon,     href: ROUTE.DELIVERY_STATUS },
  { key: "bill",            labelJa: "集金額",          icon: BillIcon,      href: ROUTE.BILL },
  { key: "employee",        labelJa: "スタッフ",        icon: EmployeeIcon,  href: ROUTE.EMPLOYEE },
  { key: "change-password", labelJa: "パスワード変更",  icon: LockIcon,      href: ROUTE.CHANGE_PASSWORD },
];
```

Sidebar dùng AntD `ConfigProvider` để override màu menu:

```typescript
// components/Common/Nav/index.tsx
<ConfigProvider theme={{ components: { Menu: {
  itemSelectedBg:    "#8ACA0D",  // E05 lime green
  itemSelectedColor: "#ffffff",
  itemBg:            "transparent",
  itemHeight:        48,
  itemBorderRadius:  8,
  itemMarginBlock:   2,
} } }}>
```

Sidebar collapse: 210px (expanded) ↔ 80px (collapsed icon-only). Mobile: `<Drawer>`.

---

## 7. TanStack Query Pattern (v5)

### 7.1 List query với keepPreviousData

```typescript
// hooks/useDeliveries.ts
export const useDeliveries = (params: DeliveryListParams) =>
  useQuery({
    queryKey: ["deliveries", params],   // params object là dependency
    queryFn:  () => fetchDeliveries(params),
    placeholderData: keepPreviousData,  // tránh flash khi đổi trang
  });
```

### 7.2 Detail query với enabled guard

```typescript
export const useDeliveryDetail = (id: string) =>
  useQuery({
    queryKey: ["delivery-detail", id],
    queryFn:  () => fetchDeliveryById(id),
    enabled:  !!id,                     // không fetch khi id rỗng
  });
```

### 7.3 Mutation qua `useMutationCustom`

Không dùng `useMutation` trực tiếp — bắt buộc dùng wrapper `useMutationCustom`:

```typescript
// hooks/useMutationCustom.ts — tự động message.error khi thất bại
export function useMutationCustom<TData, TError, TVariables, TContext>(
  options: UseMutationCustomOptions<...>
) {
  return useMutation({
    onError: (error) => {
      if (!skipAutoErrorHandling) message.error(getErrorMessage(error));
      onError?.(error);
    },
    onSuccess: (data, variables, context) => {
      if (!skipAutoSuccessHandling && customSuccessMessage) message.success(customSuccessMessage);
      onSuccess?.(data, variables, context);
    },
  });
}
```

```typescript
// Dùng trong hook domain
export const useUpdateDelivery = (id: string) => {
  const queryClient = useQueryClient();
  return useMutationCustom({
    mutationFn: (payload: UpdateDeliveryPayload) => updateDeliveryById(id, payload),
    customSuccessMessage: "保存しました。",
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-detail", id] });
    },
  });
};
```

Options đáng chú ý:
- `customSuccessMessage` → auto `message.success(...)` khi thành công
- `skipAutoErrorHandling: true` → tự xử lý error trong `onError` (xem VerifyPage OTP)
- `skipAutoSuccessHandling: true` → tự gọi `message.success(...)` với format tùy chỉnh (xem ChangePasswordPage)

---

## 8. List Page Pattern

Cấu trúc lặp lại ở DeliveryStatusPage, EmployeePage, BillPage:

```typescript
// pages/delivery-status/DeliveryStatusPage.tsx
const FILTER_KEYS = ["invoiceNo", "destination", "status", "dateFrom", "dateTo", ...];

export default function DeliveryStatusPage() {
  const { tableParams, searchParams, handleFilterTable, handleResetFilers } =
    useTableParams<DeliveryTableRecord, DeliveryListParams>({
      sortBy: DEFAULT_DELIVERY_SORT_BY,
      keyExtraParams: FILTER_KEYS,       // sync filter keys lên URL
    });

  const { data, isLoading } = useDeliveries(searchParams);
  const items  = data?.items ?? [];
  const total  = data?.total ?? 0;

  const columns = useMemo(
    () => getDeliveryColumns({ page: tableParams.page, rowsPerPage: tableParams.rowsPerPage }),
    [tableParams.page, tableParams.rowsPerPage]
  );

  const rangeStart = total === 0 ? 0 : (tableParams.page - 1) * tableParams.rowsPerPage + 1;
  const rangeEnd   = Math.min(tableParams.page * tableParams.rowsPerPage, total);

  return (
    <div className="py-6">
      <BaseHeadingBreadcrumb title="..." breadcrumbItems={[{ title: "..." }]} />
      <div className="space-y-5 rounded-lg bg-white p-5">
        <DeliveryFilterBar
          onSearch={handleFilterTable}
          onClear={handleResetFilers}
          sortValue={String(tableParams.sortBy)}
          sortOrder={tableParams.sort}
          onSortChange={value => tableParams.setSortBy(value)}
          onToggleSortOrder={() => tableParams.setSort(tableParams.sort === "ASC" ? "DESC" : "ASC")}
        />
        <BaseTable<Delivery>
          columns={columns}
          dataSource={items}
          loading={isLoading}
          total={total}
          rowKey="id"
          page={tableParams.page}
          rowsPerPage={tableParams.rowsPerPage}
          setPage={tableParams.setPage}
          setRowsPerPage={tableParams.setRowsPerPage}
          setSort={tableParams.setSort}
          setSortBy={tableParams.setSortBy}
          paginationSummary={`${total}件中 ${rangeStart}–${rangeEnd}件`}
        />
      </div>
    </div>
  );
}
```

**useTableParams**: sync page / sort / filter vào URL query string. `keyExtraParams` xác định
field nào được persist. Reset filter dùng `handleResetFilers()`.

---

## 9. Filter Bar Pattern

FilterBar (DeliveryFilterBar, EmployeeFilterBar, BillFilterBar) luôn có `useForm` nội bộ:

```typescript
// pages/delivery-status/components/DeliveryFilterBar.tsx
const DeliveryFilterBar = ({ onSearch, onClear, sortValue, sortOrder, onSortChange, onToggleSortOrder }) => {
  const { control, handleSubmit, reset } = useForm<DeliveryFilterValues>({
    defaultValues: DEFAULT_VALUES,
  });

  const handleClear = () => {
    reset(DEFAULT_VALUES);
    onClear();
  };

  return (
    <form onSubmit={handleSubmit(onSearch)}
          className="grid grid-cols-2 items-start gap-4 sm:grid-cols-3 lg:grid-cols-6">
      <Controller name="invoiceNo" control={control}
        render={({ field }) => (
          <BaseInput name="invoiceNo" className="h-10!" placeholder="送り状NO"
            isShowMessageError={false}   // filter field không show lỗi
            prefix={<img src={SearchIcon} ... />}
            value={field.value} onChange={field.onChange} />
        )}
      />
      {/* ... các field khác ... */}
      <BaseLinkedDatePickerFields<DeliveryFilterValues>
        control={control} fromName="dateFrom" toName="dateTo"
        format={DATE_FORMAT.JAPANESE_YEAR_MONTH_DAY_FORMAT}
      />
      <BaseSortDropdownField
        value={sortValue} options={DELIVERY_SORT_OPTIONS}
        sortOrder={sortOrder} onChange={onSortChange} onToggleSortOrder={onToggleSortOrder}
      />
      <div className="flex items-center gap-3">
        <BaseButton buttonType="outlinePrimary" htmlType="button" onClick={handleClear}>クリア</BaseButton>
        <BaseButton type="primary"              htmlType="submit">検索</BaseButton>
      </div>
    </form>
  );
};
```

Sort options và default sortBy được export từ file `deliveryFilter.constants.ts`
cùng thư mục với FilterBar.

---

## 10. Detail Page Pattern

Cấu trúc lặp ở DeliveryStatusDetailPage, EmployeeDetailPage:

```typescript
// pages/delivery-status/components/DeliveryStatusDetailForm.tsx
export default function DeliveryStatusDetailForm({ data }: { data: DeliveryDetail }) {
  const [isEditing, setIsEditing] = useState(false);
  const updateMutation = useUpdateDelivery(data.id);

  const { control, handleSubmit, reset, formState: { errors } } =
    useForm<DeliveryAssignFormValues>({
      resolver: yupResolver(deliveryAssignSchema) as Resolver<DeliveryAssignFormValues>,
      defaultValues: { assignedStaffId: data.assignedStaffId },
    });

  const onSubmit: SubmitHandler<DeliveryAssignFormValues> = async values => {
    await updateMutation.mutateAsync(values);
    setIsEditing(false);
  };

  const handleCancel = () => { reset(); setIsEditing(false); };

  return (
    <div className="py-6">
      <BaseHeadingBreadcrumb title="..." breadcrumbItems={[{ title: <AppLink href={ROUTE.DELIVERY_STATUS}>...</AppLink> }]}>
        {isEditing ? (
          <div className="flex gap-3">
            <BaseButton buttonType="default" onClick={handleCancel} className="h-12! w-[138.5px]!">キャンセル</BaseButton>
            <BaseButton type="primary" loading={updateMutation.isPending}
              onClick={handleSubmit(onSubmit)} className="h-12! w-[138.5px]!">保存</BaseButton>
          </div>
        ) : (
          <BaseButton type="primary" onClick={() => setIsEditing(true)} className="h-12! w-[138.5px]!">編集</BaseButton>
        )}
      </BaseHeadingBreadcrumb>

      {/* Delivery: DetailSection wrapper */}
      <DetailSection title="配送スタッフ選択">
        <Controller name="assignedStaffId" control={control} render={...} />
      </DetailSection>

      {/* Employee: BaseCollapseSection variant="tab" */}
      <BaseCollapseSection variant="tab" title="基本情報" className="rounded-none">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* fields */}
        </div>
      </BaseCollapseSection>
    </div>
  );
}
```

Button sizes trong detail header: `h-12! w-[138.5px]!` (edit/cancel/save) hoặc `h-12! w-21!` (employee delete/edit).

---

## 11. Form Pattern

```typescript
// Tất cả schema trong validation/schemas.ts
export const deliveryAssignSchema = yup.object().shape({
  assignedStaffId: yup.string().required("配送スタッフは必須項目です。"),
});

// Trong component — luôn cast Resolver khi TypeScript cần
const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
  resolver: yupResolver(schema) as Resolver<FormData>,
  defaultValues: { ... },
});

// Field luôn dùng Controller + render (không dùng register trực tiếp)
<Controller
  name="fieldName"
  control={control}
  render={({ field }) => (
    <BaseInput
      {...field}           // hoặc value={field.value} onChange={field.onChange}
      label="ラベル"
      error={errors.fieldName?.message}
      isRequired           // hiển thị dấu *
      className="h-10!"    // filter fields; h-11! cho auth forms
    />
  )}
/>
```

Các field component hay dùng (tất cả trong `components/Common/Fields/`):
- `BaseInput` — text, hỗ trợ `isUppercase`, `trimSpace`, `blockSpace`, `isShowMessageError`
- `BaseInputPassword` — password với eye icon, `maxLength`
- `BaseSelect` — dropdown, `isShowSearch`, `allowClear`
- `BaseDatePicker` — single date
- `BaseLinkedDatePickerFields` — date range (from/to), linked validation
- `BaseOTPInput` — 4-digit OTP input
- `BaseTextArea` — multiline

---

## 12. Auth Page Pattern

Tất cả 5 trang auth dùng `AuthCard` wrapper:

```typescript
// components/Auth/AuthCard.tsx
<div className="auth-card flex w-full flex-col items-center rounded-3xl bg-[#ffffff]/95 p-8 shadow-2xl backdrop-blur">
  {/* Logo */}
  {title && <h1 className="text-txt-high mb-4 text-2xl font-bold">{title}</h1>}
  {subtitle && <div className="... whitespace-pre-line">{subtitle}</div>}
  <div className="w-full">{children}</div>
</div>
```

```typescript
// pages/auth/ForgotPasswordPage.tsx — mẫu điển hình
export default function ForgotPasswordPage() {
  const forgotPasswordMutation = useMutationCustom({
    mutationFn: forgotPassword,
    onSuccess: (_response, variables) => {
      const params = new URLSearchParams({ delivererCode: variables.delivererCode, email: variables.email });
      router.push(`${ROUTE.VERIFY}?${params.toString()}`);
    },
  });

  return (
    <AuthCard title="パスワード再設定" subtitle={"...\n..."}>
      <form onSubmit={handleSubmit(onSubmit)} className="w-full">
        {/* Controller fields */}
        <BaseButtonAuth label="認証コードを送信" loading={forgotPasswordMutation.isPending} htmlType="submit" />
      </form>
    </AuthCard>
  );
}
```

`BaseButtonAuth` — full-width button dùng riêng cho auth pages (khác `BaseButton` dùng trong app).

---

## 13. BaseHeadingBreadcrumb Pattern

Dùng ở đầu mọi page trong AuthLayout:

```typescript
// components/Common/BaseHeadingBreadcrumb/index.tsx
<BaseHeadingBreadcrumb
  title="委託配送状況一覧"
  breadcrumbItems={[{ title: "配送状況管理" }]}
  // breadcrumb có link dùng AppLink:
  // breadcrumbItems={[{ title: <AppLink href={ROUTE.DELIVERY_STATUS}>配送状況管理</AppLink> }]}
>
  {/* children hiển thị ở bên phải (action buttons) */}
  <BaseButton type="primary" ...>編集</BaseButton>
</BaseHeadingBreadcrumb>
```

---

## 14. ChangePasswordPage Pattern

ChangePasswordPage (route `/change-password`) đặc biệt ở chỗ dùng `skipAutoSuccessHandling: true`
để render JSX trong `message.success`:

```typescript
const changePasswordMutation = useMutationCustom({
  mutationFn: changePassword,
  skipAutoSuccessHandling: true,  // tự gọi message.success với JSX
});

const onSubmit = async (data) => {
  await changePasswordMutation.mutateAsync({ oldPassword, newPassword });
  message.success({
    content: (
      <div className="text-txt-high">
        <p className="mb-0 font-medium">成功しました</p>
        <p className="mb-0">パスワードを変更しました。</p>
      </div>
    ),
    style: { minWidth: 320 },
  });
  reset();
};
```

---

## 15. Implementing Feature Mới — Checklist

1. Đọc DESIGN.md + API Contract trong task file
2. Tạo service file trong `services/client/<domain>.service.ts`
   - Endpoint thực tế theo API Contract (không dùng prefix `/operation/*`)
   - Nếu chưa có API: dùng mock + comment swap pattern
3. Tạo hooks trong `hooks/use<Domain>.ts` — `useQuery` / `useMutationCustom`
4. Tạo page trong `pages/<domain>/`:
   - List: `<Domain>Page.tsx` + `components/<Domain>FilterBar.tsx` + `components/<domain>Columns.tsx`
   - Detail: `<Domain>DetailPage.tsx` (lazy-loads `<Domain>DetailForm.tsx`)
   - Filter constants: `components/<domain>Filter.constants.ts`
5. Thêm route vào `routes/index.tsx`: `lazy()` + `withSuspense()`
6. Thêm route constant vào `constants/route.ts`
7. Thêm NAV_ITEMS entry vào `constants/nav.ts` nếu có menu mới
8. Yup schema vào `validation/schemas.ts`
9. **KHÔNG** tạo Redux slice mới trừ khi có client state thực sự (auth là slice duy nhất hiện tại)

---

## Trigger Tech Lead khi cần update overview

```
"Hãy là Tech Lead, cập nhật overview docs cho repo es-kitchen-web-outsource-web-private"
```
