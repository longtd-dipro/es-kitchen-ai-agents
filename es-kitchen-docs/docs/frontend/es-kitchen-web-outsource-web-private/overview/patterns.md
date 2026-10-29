# es-kitchen-web-outsource-web-private — Patterns & Conventions

> Nguồn = es-kitchen-web-outsource-web-private@9b0e677 ngày 2026-10-16 (trước đó xác nhận 2026-07-01).

**File này nói gì:** các cách làm đang chạy thật trong code E05 (Công ty vận chuyển Web): gọi API, đăng nhập, route, danh sách, form, mutation, phân quyền…
**Đọc khi:** sắp thêm trang / form / API mới vào repo này.
**Đọc trước:** `structure.md` (bản đồ thư mục).
Repo scaffold từ cùng template với `es-kitchen-web-admin` (E03). Pattern chung (TanStack Query v5, RTK v2, react-hook-form v7…) xem thêm `frontend/es-kitchen-web-admin/overview/patterns.md`.

---

## 0. Tra nhanh: tình huống → cách xử lý → file mẫu

| Tình huống | Cách xử lý | Mục | File mẫu |
|---|---|---|---|
| Gọi API mới | Thêm hàm named export trong `services/client/<domain>.service.ts`, dùng `API.get/post/...` | §2 | `delivery.service.ts` |
| Lấy dữ liệu để hiển thị | Hook `use<Domain>` bọc `useQuery` | §6 | `hooks/useDeliveries.ts` |
| Ghi dữ liệu (lưu/xóa) | `useMutationCustom` (không dùng `useMutation` trần) | §6.3 | `useUpdateDelivery` |
| Thêm trang | `lazy()` + `withSuspense` + `ROUTE` + (nav) | §4, §14 | `routes/index.tsx` |
| Trang danh sách có lọc / phân trang | `useTableParams` + FilterBar | §7, §8 | `DeliveryStatusPage.tsx` |
| Trang chi tiết có sửa | `useForm` + yup + nút 編集/保存 | §9 | `DeliveryStatusDetailForm.tsx` |
| Form | Luôn `Controller` + field `Base*` | §10 | `validation/schemas.ts` |
| Chặn người chưa đăng nhập | `RequireAuth` / `PublicOnly` | §3.5 | `routes/guards` |
| Phân quyền theo vai trò | `useCan` + `<RequiredPermission>` | §11 | `utils/client/permission.ts` |
| Phiên hết hạn | `SessionExpiredModal` + `sessionExpired.ts` | §3.6 | `services/http/sessionExpired.ts` |
| Rời form đang sửa dở | `useUnsavedChangesGuard` + `DiscardChangesModal` | §11 | — |
| Upload file | presigned URL | §12 | `file-upload.service.ts` |
| Xuất / nhập CSV | `BaseButtonExport` / `BaseButtonDownload` | §12 | `collection-report.service.ts` |

---

## Khác biệt với web-admin (E03)

| Khía cạnh | web-admin (E03) | outsource-web-private (E05) |
|---|---|---|
| Vite | 7 | 8 |
| Màu chính (sidebar active) | xanh dương `#0969DA` | xanh lá `#1a7f37` (`Nav/index.tsx` itemSelectedBg, `antd-theme.ts` colorPrimary) |
| Prefix endpoint | `/admin/*` | `/auth/*`, `/account/*` (xác nhận từ code) |
| Người dùng | System admin | Nhân viên công ty vận chuyển / tài xế (operation staff / deliverer) |
| Menu | 160 function | 7 mục (xem §5) |
| Redux slice | nhiều | **chỉ `auth`** |
| Hook dữ liệu | gọi `useQuery` trong page | hook riêng mỗi domain (`useDeliveries`…) |

---

## 1. HTTP client

**Vấn đề:** mọi request cần cùng base URL, cookie, header ngôn ngữ, token.
**Cách làm:** dùng một instance duy nhất, class `Requester`, xuất singleton `API` ở `services/client/api.ts`.

```typescript
const axiosInstance = axios.create({
  baseURL: serverConfig.api_server_url,   // import.meta.env.VITE_API_BASE_URL
  withCredentials: true,
  headers: { "Content-Type": "application/json", "Accept-Language": "ja" },
  paramsSerializer: params => serializeQueryParams(params ?? {}),
});
// interceptor request: gắn Bearer token + header timezone
// interceptor response: xem §3.6
```

Gọi bằng `API.get / post / put / patch / delete`.

**Bẫy:**
- Đừng dùng `services/http/axios.instance.ts` trực tiếp — đó là file scaffold cũ, không được dùng.
- Tải file: truyền `rawResponse: true` để lấy cả header Content-Disposition (`api.ts`).

---

## 2. Service file

**Vấn đề:** gọi API rải rác trong component thì khó sửa, khó test.
**Cách làm:** mỗi domain 1 file `services/client/<domain>.service.ts`; hàm là *named export*, không dùng class hay object method.

```typescript
// services/client/delivery.service.ts
const APIs = { LIST: "/deliveries", DETAIL: "/deliveries/:id", UPDATE: "/deliveries/:id" };

export const fetchDeliveries = async (params?: DeliveryListParams): Promise<DeliveryListResult> =>
  API.get(APIs.LIST, params);

export const fetchDeliveryById = async (id: string): Promise<DeliveryDetail> =>
  API.get(`/deliveries/${id}`);

export const updateDeliveryById = async (id: string, payload: UpdateDeliveryPayload): Promise<DeliveryDetail> =>
  API.patch(`/deliveries/${id}`, payload);
```

**Hiện trạng (2026-10-16):**
- Không còn mock data trong `src/` — mọi service gọi API thật. Dạng thường gặp `APIs = { LIST: "...", DETAIL: (id) => ... }`, unwrap `IBaseApiResponse<T>` rồi `return res.data`.
- Service chuẩn hóa params (`toText`, `removeFalsyProperty`) vì API chạy `forbidNonWhitelisted`: **param thừa (như `sortBy/order`) → HTTP 400** (xem `collection-report.service.ts`).

Endpoint đang dùng (grep `services/client/`): `/auth/*`, `/account/*`, `/register` (+`/register/regions/{prefectures,cities,towns}`), `/profile` (+`/history`), `/me/contacts`, `/notifications` (+`/unread-count`), `/quotation-requests`, `/fee-change-requests` (+`/import`), `/delivery-blocks` (+`/timeline`, `/monthly-calendar`), `/relay-destinations`, `/drivers` (+`/bulk-issue-accounts[/preview]`), `/collection-reports/by-driver` (+`/export`), `/uploads/presigned-upload-url[s]`, `/api/error/report`.

Endpoint auth thật (`auth.service.ts`):

```typescript
const APIs = {
  SIGNIN:                     "/auth/login",
  ME:                         "/account/me",
  LOGOUT:                     "/auth/logout",
  FORGOT_PASSWORD:            "/auth/forgot-password/request",
  VERIFY_FORGOT_PASSWORD_OTP: "/auth/forgot-password/verify-otp",
  RESET_PASSWORD:             "/auth/forgot-password/reset-password",
  CHANGE_PASSWORD:            "/account/change-password",
};
```

**Bẫy:** không có prefix `/operation/*` — tên domain không phản ánh URL thật. Chưa có API thì hỏi BE/TL, **không** tự thêm mock.

---

## 3. Đăng nhập và phiên

### 3.1 Token lưu ở cookie (js-cookie)

```typescript
// services/http/authToken.ts
const ACCESS_TOKEN_KEY  = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const COOKIE_OPTIONS = { expires: 7, path: "/", sameSite: "strict" };

setAuthCookies({ accessToken, refreshToken });  // set cả hai
clearAuthCookies();                             // xóa cả hai
getAccessToken();
```

### 3.2 Redux auth slice

```typescript
// stores/reducers/auth.ts
type AuthState = { accessToken, refreshToken, status, user }
// SESSION_STATUS: "loading" | "authenticated" | "unauthenticated"

setAuthTokens({ accessToken, refreshToken })  // sau login / reset-password
setCurrentUser(AuthCurrentUser)               // sau bootstrap
clearAuthState()                              // logout / 401
```

Khởi động qua component `AuthBootstrap` (mount ở root):
1. Đọc cookie → có token thì `status = "loading"`.
2. Gọi `GET /account/me` bằng `queryClient.fetchQuery`.
3. Thành công → `setCurrentUser(...)` → `status = "authenticated"`.
4. 401 hoặc lỗi → `clearAuthState()` → `status = "unauthenticated"`.

### 3.3 Quên mật khẩu — 3 bước OTP

```
ForgotPasswordPage → VerifyPage → ResetPasswordPage → ResetSuccessPage
POST /auth/forgot-password/request
        ↓ redirect ?delivererCode=&email=
POST /auth/forgot-password/verify-otp
        ↓ redirect ?delivererCode=&email=&otp=
POST /auth/forgot-password/reset-password  (trả accessToken + refreshToken)
        ↓ dispatch(setAuthTokens(...)) + router.replace(ROUTE.RESET_SUCCESS)
```

State giữa các bước đi qua **URL search params** (không dùng Redux hay sessionStorage):

```typescript
const params = new URLSearchParams({ delivererCode, email, otp });
router.push(`${ROUTE.RESET_PASSWORD}?${params.toString()}`);
```

Guard ngược: thiếu param bắt buộc → `router.replace(ROUTE.FORGOT_PASSWORD)`.

Đếm ngược gửi lại OTP (VerifyPage):

```typescript
const OTP_RESEND_COUNTDOWN_SECONDS = 60;
const resendLockRef = useRef(false);  // tránh bấm đúp
useEffect(() => {
  if (timeLeft <= 0) return;
  const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
  return () => clearInterval(timer);  // cleanup bắt buộc
}, [timeLeft]);
```

### 3.4 Login

LoginPage **không** dùng `useMutationCustom`; dùng `useState(loading)` + try/catch tay:

```typescript
const onSubmit = async (data) => {
  setLoading(true);
  try {
    const result = await signInService(data);
    dispatch(setAuthTokens({ accessToken, refreshToken }));
    router.push(searchParams.get("redirect") || ROUTE.INDEX);
  } catch (error) {
    if (isAxiosError(error)) message.error(error.response?.data?.message || MESSAGES.LOGIN_FAILED);
    else message.error(MESSAGES.LOGIN_FAILED);
  } finally { setLoading(false); }
};
```

### 3.5 Guard route

```
PublicOnly   → bọc login / forgot-password / verify / reset-password
RequireAuth  → bọc mọi route sau đăng nhập
```

```typescript
export function RequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading)        return <BaseLoading />;
  if (!isAuthenticated) return <Navigate to={`${ROUTE.LOGIN}?redirect=...`} replace />;
  return <Outlet />;
}
// PublicOnly: đã đăng nhập → <Navigate to={ROUTE.DASHBOARD} replace />
```

### 3.6 Phiên hết hạn (401)

`services/http/handleResponse.ts` phân hai loại 401:

```typescript
onError: (error) => {
  if (isSessionExpiredError(error)) notifySessionExpired();       // → SessionExpiredModal
  else if (error.response?.status === 401) store.dispatch(clearAuthState());
  return Promise.reject(error);
}
```

- `isSessionExpiredError` = 401 **và** request đã mang header `Authorization`. Lý do: login sai mật khẩu cũng trả 401 nhưng đó không phải hết phiên.
- Chỉ thấy xóa phiên trong `handleResponse.ts`; không thấy gọi refresh token ở đó (đã đọc code).
- `SessionExpiredModal` + `useSessionExpired` hiện modal thay vì đá văng đột ngột.

**Bẫy:** gắn xử lý 401 mới ở chỗ khác sẽ trùng với interceptor này. Sửa tại `handleResponse.ts`.

---

## 4. Routing

### 4.1 `useRouter` — bọc `useNavigate`

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
// cũng export: usePathname, useSearchParams, useParams<T>
```

### 4.2 Hằng `ROUTE`

Mọi route mới phải thêm vào `constants/route.ts`:

```typescript
export const ROUTE = {
  DASHBOARD: "/dashboard", ANNOUNCEMENTS: "/announcements", ORDERS: "/orders",
  PROFILE: "/profile", SCHEDULE: "/schedule", DELIVERY_STATUS: "/delivery-status",
  COLLECTION_REPORTS: "/collection-reports", DRIVER: "/driver", DRIVER_CREATE: "/driver/create",
  CHANGE_PASSWORD: "/change-password", LOGIN: "/login", REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password", VERIFY: "/verify",
  RESET_PASSWORD: "/reset-password", RESET_SUCCESS: "/reset-success",
};
```

### 4.3 Lazy load với `withSuspense`

```typescript
const DeliveryStatusPage = lazy(() => import("@/pages/delivery-status/DeliveryStatusPage"));

const withSuspense = (element: ReactElement, className?: string) => (
  <Suspense fallback={<BaseLoading className={className || ""} />}>{element}</Suspense>
);

// Route auth (public): thêm className để loading vừa khung AuthCard
{ path: ROUTE.LOGIN, element: withSuspense(<LoginPage />, "max-h-[511px] rounded-3xl") }
// Route trong app: không cần className
{ path: ROUTE.DASHBOARD, element: withSuspense(<DashboardPage />) }
```

### 4.4 Cây layout

```
PublicOnly
├── NonAuthLayout                      (ảnh nền full + khung giữa max-w-[464px])
│   └── LoginPage
├── NonAuthLayout background="gradient"   (luồng reset mật khẩu)
│   └── ForgotPasswordPage / VerifyPage / ResetPasswordPage
└── PublicPageLayout                   (PublicTopNav + PublicFooter)
    └── RegisterPage                   (stepper đăng ký công ty vận chuyển)

RequireAuth
├── AuthCenteredLayout   └── ResetSuccessPage
└── AuthLayout           (sidebar 210px + Header + Content bg-[#F0F2F5])
    ├── DashboardPage · AnnouncementDetailPage (/announcements/:id)
    ├── ProfilePage · SchedulePage
    ├── OrdersPage / :id · DeliveryStatusPage / :id
    ├── BillPage (collection-reports, chỉ list)
    ├── EmployeePage / create / :id (driver)
    └── ChangePasswordPage
```

---

## 5. Menu bên trái (sidebar)

Định nghĩa trong `constants/nav.ts`: 7 mục.

```typescript
export const NAV_ITEMS: NavItem[] = [
  { key: "dashboard",       labelJa: "ホーム",       icon: HouseIcon,         href: ROUTE.DASHBOARD },
  { key: "schedule",        labelJa: "スケジュール", icon: CalendarBlankIcon, href: ROUTE.SCHEDULE },
  { key: "delivery-status", labelJa: "配送管理",     icon: TruckIcon,         href: ROUTE.DELIVERY_STATUS },
  { key: "orders",          labelJa: "見積もり管理", icon: ClipboardTextIcon, href: ROUTE.ORDERS },
  { key: "bill",            labelJa: "集金・駐車",   icon: WalletIcon,        href: ROUTE.COLLECTION_REPORTS },
  { key: "employee",        labelJa: "配送スタッフ", icon: UsersThreeIcon,    href: ROUTE.DRIVER },
  { key: "profile",         labelJa: "プロフィール", icon: UserCircleIcon,    href: ROUTE.PROFILE },
];
```

- Đổi mật khẩu vào từ profile / route riêng, **không** nằm trong `NAV_ITEMS`.
- Màu menu override bằng AntD `ConfigProvider` (`components/Common/Nav/index.tsx`): `itemSelectedBg: "#1a7f37"`, `itemSelectedColor: "#ffffff"`, `itemHeight: 48`, `itemBorderRadius: 8`.
- Thu gọn: 210px ↔ 80px (chỉ icon). Mobile: `<Drawer>`.

---

## 6. TanStack Query (v5, object syntax)

### 6.1 Danh sách — giữ dữ liệu cũ khi đổi trang

```typescript
// hooks/useDeliveries.ts
export const useDeliveries = (params: DeliveryListParams) =>
  useQuery({
    queryKey: ["deliveries", params],     // params là dependency
    queryFn:  () => fetchDeliveries(params),
    placeholderData: keepPreviousData,    // tránh nháy khi đổi trang
  });
```

### 6.2 Chi tiết — chỉ gọi khi có id

```typescript
export const useDeliveryDetail = (id: string) =>
  useQuery({
    queryKey: ["delivery-detail", id],
    queryFn:  () => fetchDeliveryById(id),
    enabled:  !!id,
  });
```

### 6.3 Mutation — bắt buộc qua `useMutationCustom`

Wrapper tự `message.error(...)` khi thất bại.

```typescript
export const useUpdateDelivery = (id: string) => {
  const queryClient = useQueryClient();
  return useMutationCustom({
    mutationFn: (payload: UpdateDeliveryPayload) => updateDeliveryById(id, payload),
    customSuccessMessage: "保存しました。",
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["delivery-detail", id] }),
  });
};
```

Option đáng nhớ:
- `customSuccessMessage` → tự `message.success(...)`.
- `skipAutoErrorHandling: true` → tự xử lý lỗi trong `onError` (xem VerifyPage OTP).
- `skipAutoSuccessHandling: true` → tự gọi `message.success` với nội dung riêng (xem §13).

**Bẫy:** quên `invalidateQueries` sau mutation → màn hình vẫn hiện dữ liệu cũ.

---

## 7. Trang danh sách (List page)

Lặp lại ở DeliveryStatusPage, EmployeePage, BillPage.

**Vấn đề:** lọc + sắp xếp + phân trang phải giữ được khi F5 / gửi link.
**Cách làm:** `useTableParams` đồng bộ page / sort / filter lên URL query string. `keyExtraParams` quyết định field lọc nào được lưu lên URL. Reset bằng `handleResetFilers()`.

```typescript
const FILTER_KEYS = ["invoiceNo", "destination", "status", "dateFrom", "dateTo", ...];

export default function DeliveryStatusPage() {
  const { tableParams, searchParams, handleFilterTable, handleResetFilers } =
    useTableParams<DeliveryTableRecord, DeliveryListParams>({
      sortBy: DEFAULT_DELIVERY_SORT_BY,
      keyExtraParams: FILTER_KEYS,
    });

  const { data, isLoading } = useDeliveries(searchParams);
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

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
        <DeliveryFilterBar onSearch={handleFilterTable} onClear={handleResetFilers}
          sortValue={String(tableParams.sortBy)} sortOrder={tableParams.sort}
          onSortChange={v => tableParams.setSortBy(v)}
          onToggleSortOrder={() => tableParams.setSort(tableParams.sort === "ASC" ? "DESC" : "ASC")} />
        <BaseTable<Delivery> columns={columns} dataSource={items} loading={isLoading} total={total}
          rowKey="id" page={tableParams.page} rowsPerPage={tableParams.rowsPerPage}
          setPage={tableParams.setPage} setRowsPerPage={tableParams.setRowsPerPage}
          setSort={tableParams.setSort} setSortBy={tableParams.setSortBy}
          paginationSummary={`${total}件中 ${rangeStart}–${rangeEnd}件`} />
      </div>
    </div>
  );
}
```

**Bẫy:**
- Gửi thêm param ngoài whitelist lên API → 400 (xem §2).
- Quên đưa field lọc mới vào `keyExtraParams` → lọc không lưu lên URL.

---

## 8. Thanh lọc (Filter bar)

DeliveryFilterBar, EmployeeFilterBar, BillFilterBar đều có `useForm` **riêng bên trong**; trang chỉ nhận kết quả qua `onSearch`.

```typescript
const { control, handleSubmit, reset } = useForm<DeliveryFilterValues>({ defaultValues: DEFAULT_VALUES });
const handleClear = () => { reset(DEFAULT_VALUES); onClear(); };

<form onSubmit={handleSubmit(onSearch)} className="grid grid-cols-2 items-start gap-4 sm:grid-cols-3 lg:grid-cols-6">
  <Controller name="invoiceNo" control={control}
    render={({ field }) => (
      <BaseInput name="invoiceNo" className="h-10!" placeholder="送り状NO"
        isShowMessageError={false}  // ô lọc không hiện lỗi
        value={field.value} onChange={field.onChange} />
    )} />
  <BaseLinkedDatePickerFields<DeliveryFilterValues> control={control}
    fromName="dateFrom" toName="dateTo" format={DATE_FORMAT.JAPANESE_YEAR_MONTH_DAY_FORMAT} />
  <BaseSortDropdownField value={sortValue} options={DELIVERY_SORT_OPTIONS}
    sortOrder={sortOrder} onChange={onSortChange} onToggleSortOrder={onToggleSortOrder} />
  <BaseButton buttonType="outlinePrimary" htmlType="button" onClick={handleClear}>クリア</BaseButton>
  <BaseButton type="primary" htmlType="submit">検索</BaseButton>
</form>
```

Sort options và sortBy mặc định export từ `deliveryFilter.constants.ts` (cùng thư mục FilterBar).

---

## 9. Trang chi tiết (Detail page)

Lặp ở DeliveryStatusDetailPage, EmployeeDetailPage. Mặc định **chỉ xem**; bấm 「編集」 mới sửa được.

```typescript
// pages/delivery-status/components/DeliveryStatusDetailForm.tsx
const [isEditing, setIsEditing] = useState(false);
const updateMutation = useUpdateDelivery(data.id);
const { control, handleSubmit, reset, formState: { errors } } = useForm<DeliveryAssignFormValues>({
  resolver: yupResolver(deliveryAssignSchema) as Resolver<DeliveryAssignFormValues>,
  defaultValues: { assignedStaffId: data.assignedStaffId },
});

const onSubmit: SubmitHandler<DeliveryAssignFormValues> = async values => {
  await updateMutation.mutateAsync(values);
  setIsEditing(false);
};
const handleCancel = () => { reset(); setIsEditing(false); };
```

- Header: đang sửa → nút 「キャンセル」 + 「保存」; không sửa → nút 「編集」.
- Delivery bọc nội dung bằng `DetailSection`; Employee dùng `BaseCollapseSection variant="tab"`.
- Cỡ nút ở header: `h-12! w-[138.5px]!` (sửa/hủy/lưu) hoặc `h-12! w-21!` (xóa/sửa của employee).
- Mỗi detail page có `*Tabs.constants.ts` (orders, delivery-status, driver, profile).

---

## 10. Form

**Cách làm:** schema yup gom ở `validation/schemas.ts`; field luôn dùng `Controller` + `render`, **không** dùng `register` trực tiếp.

```typescript
export const deliveryAssignSchema = yup.object().shape({
  assignedStaffId: yup.string().required("配送スタッフは必須項目です。"),
});

const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
  resolver: yupResolver(schema) as Resolver<FormData>,   // cast khi TypeScript cần
  defaultValues: { ... },
});

<Controller name="fieldName" control={control}
  render={({ field }) => (
    <BaseInput {...field} label="ラベル" error={errors.fieldName?.message}
      isRequired            // hiện dấu *
      className="h-10!" />  // ô lọc h-10!; form auth h-11!
  )} />
```

Field có sẵn trong `components/Common/Fields/`:
- `BaseInput` — hỗ trợ `isUppercase`, `trimSpace`, `blockSpace`, `isShowMessageError`.
- `BaseInputPassword` — có icon mắt, `maxLength`.
- `BaseSelect` — `isShowSearch`, `allowClear`. Ngoài ra có `BaseInfiniteSelect`, `BaseTreeSelect` (chưa đọc props).
- `BaseDatePicker` (1 ngày) · `BaseLinkedDatePickerFields` (từ/đến, kiểm tra liên kết).
- `BaseOTPInput` — OTP 4 số.
- `BaseTextArea`, Checkbox/Radio.

---

## 11. Phân quyền, form dở dang

- **Phân quyền:** `useCan({ roles })` và component `<RequiredPermission>` (`components/Common/RequiredPermission`). `validateUserPermissions` chỉ kiểm `roles` (`utils/client/permission.ts`).
- **Form sửa dở:** `useUnsavedChangesGuard` (.tsx) + `DiscardChangesModal` hỏi lại trước khi rời trang.

---

## 12. Tính năng đặc thù

| Tính năng | Cách làm |
|---|---|
| Mã bưu điện / vùng | `usePostalCodeSearch`, `PostalAddressPickerModal`; dữ liệu `public/postal/` sinh bởi `npm run postal:build`; vùng đăng ký lấy từ `/register/regions/*` |
| Upload file | Presigned URL (`file-upload.service.ts`, `/uploads/presigned-upload-url[s]`) + `BaseUploadFile` / `BaseFilePreviewModal`; đính kèm giao hàng ở `delivery-status/deliveryAttachment.utils.ts` |
| Export / import CSV | `BaseButtonExport` / `BaseButtonDownload` (collection-reports export, `/fee-change-requests/import`) |
| Lịch | `components/ScheduleCalendar` (MonthCalendarGrid, CycleTag, TemperatureTag…) + `pages/schedule/components/week`; trạng thái lịch đồng bộ URL qua `scheduleUrl.ts` |

---

## 13. Trang auth và các mẫu nhỏ

**AuthCard:** 5 trang auth dùng chung khung `components/Auth/AuthCard.tsx` (nền `bg-[#ffffff]/95`, `rounded-3xl`, logo, `title`, `subtitle`, `children`).

```typescript
// pages/auth/ForgotPasswordPage.tsx — mẫu điển hình
const forgotPasswordMutation = useMutationCustom({
  mutationFn: forgotPassword,
  onSuccess: (_res, variables) => {
    const params = new URLSearchParams({ delivererCode: variables.delivererCode, email: variables.email });
    router.push(`${ROUTE.VERIFY}?${params.toString()}`);
  },
});
<AuthCard title="パスワード再設定" subtitle={"...\n..."}>
  <form onSubmit={handleSubmit(onSubmit)}>
    <BaseButtonAuth label="認証コードを送信" loading={forgotPasswordMutation.isPending} htmlType="submit" />
  </form>
</AuthCard>
```

`BaseButtonAuth` = nút full-width chỉ dùng ở trang auth (khác `BaseButton` trong app).

**BaseHeadingBreadcrumb:** đầu mọi trang trong `AuthLayout`; `children` hiện ở bên phải (nút hành động); breadcrumb có link dùng `AppLink`.

```typescript
<BaseHeadingBreadcrumb title="委託配送状況一覧"
  breadcrumbItems={[{ title: <AppLink href={ROUTE.DELIVERY_STATUS}>配送状況管理</AppLink> }]}>
  <BaseButton type="primary">編集</BaseButton>
</BaseHeadingBreadcrumb>
```

**ChangePasswordPage** (`/change-password`): dùng `skipAutoSuccessHandling: true` để tự render JSX trong `message.success`.

```typescript
const changePasswordMutation = useMutationCustom({ mutationFn: changePassword, skipAutoSuccessHandling: true });
await changePasswordMutation.mutateAsync({ oldPassword, newPassword });
message.success({ content: (<div><p className="mb-0 font-medium">成功しました</p><p className="mb-0">パスワードを変更しました。</p></div>), style: { minWidth: 320 } });
reset();
```

---

## 14. Checklist thêm tính năng mới

1. Đọc DESIGN.md + API Contract trong task file.
2. Tạo `services/client/<domain>.service.ts` — endpoint theo API Contract (không dùng `/operation/*`). Chưa có API: hỏi BE/TL, không thêm mock.
3. Tạo `hooks/use<Domain>.ts` — `useQuery` / `useMutationCustom`.
4. Tạo page trong `pages/<domain>/`:
   - List: `<Domain>Page.tsx` + `components/<Domain>FilterBar.tsx` + `components/<domain>Columns.tsx`
   - Detail: `<Domain>DetailPage.tsx` (lazy-load `<Domain>DetailForm.tsx`)
   - Hằng lọc: `components/<domain>Filter.constants.ts`
5. Thêm route vào `routes/index.tsx` (`lazy()` + `withSuspense()`).
6. Thêm hằng vào `constants/route.ts`.
7. Có menu mới → thêm vào `constants/nav.ts`.
8. Schema yup → `validation/schemas.ts`.
9. **Không** tạo Redux slice mới trừ khi có client state thật (hiện chỉ `auth`).

Cập nhật doc này: nhờ Tech Lead — "Hãy là Tech Lead, cập nhật overview docs cho repo es-kitchen-web-outsource-web-private".
