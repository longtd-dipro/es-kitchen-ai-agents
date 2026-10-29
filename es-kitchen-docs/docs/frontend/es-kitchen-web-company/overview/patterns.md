# es-kitchen-web-company — Patterns & Conventions

> Nguồn = `es-kitchen-web-company@fddcaef` ngày 2026-10-16. Đối chiếu: `services/client/*`, `routes/index.tsx`, `constants/route.ts`, `hooks/`; xác minh lại `hooks/useMutationCustom.ts` (dùng `react-toastify`) và `services/query/queryClient.ts`.

**File này nói gì:** cách làm chuẩn của E02 (Company Admin), chủ yếu là những điểm **khác** web-admin: mock service, form nhiều section, nút Cancel/Save của trang chi tiết, filter bấm nút mới áp dụng.
**Đọc khi nào:** trước khi viết code React mới cho E02. Các pattern cốt lõi (HTTP client, TanStack Query, Redux, form cơ bản) giống `es-kitchen-web-admin/overview/patterns.md` — đọc file đó trước.

---

## 0. Tình huống → cách xử lý → file mẫu

| Tình huống | Cách xử lý | File mẫu |
|---|---|---|
| BE chưa có endpoint | Mock service: hàm `ok()` + dữ liệu trong bộ nhớ, giữ nguyên signature | `contract.service.ts`, `disposal.service.ts` |
| Gọi API thật | `const APIs` + hàm export riêng | `account.service.ts`, `sales.service.ts` |
| Tải file (export) | `API.get(..., { responseType: 'blob' })` | `exportUserSalesOrders` |
| Form lớn nhiều section | `FormProvider` + `useFormContext` trong section | `company-management/[id]` |
| Trang chi tiết có Cancel/Save | `savedDetailRef` + `form.reset` | `employee-benefits` |
| Filter chỉ chạy khi bấm「検索」 | Committed Filter (`draft` + `appliedFilter`) | `delivery-management/schedule` |
| Rời trang khi đang sửa | `useUnsavedChangesGuard` | trang detail ở edit mode |
| Toast sau mutation | `useMutationCustom` | `company-management/[id]` |

---

## 1. Điểm khác biệt so với web-admin

| | `es-kitchen-web-admin` (E03) | `es-kitchen-web-company` (E02) |
|---|---|---|
| API endpoint | `/admin/...` (theo docs cũ) | `/auth/*`, `/company/*`, `/users/linked*`, `/orders*`, `/payment-methods` (path thật trong `services/client/*.service.ts`; docs cũ ghi prefix `/admin-company/` nhưng **không tìm thấy** chuỗi này trong `src/` — prefix có thể nằm ở `VITE_API_BASE_URL`, chưa xác nhận) |
| Default route | `/dashboard` | `/sales-management` |
| RTK slices | `auth`, `monthlyMenuImport`, `counter` | `auth` only |
| Service files | 52 `*.service.ts` | 11 `*.service.ts` + `api.ts` (5 real + `company` hybrid + 5 FE-only mock) |
| Pages hiện có | 24 thư mục / 115 page | 10 thư mục / 18 page / 23 route |
| Permission guard | `RequirePermission`, `usePermissions` | không có |

> ⚠️ Không copy endpoint từ web-admin sang — prefix khác nhau hoàn toàn.

---

## 2. HTTP client

**Giống hệt web-admin** — cùng class `Requester`, cùng interceptor (hàm tự chạy trước request/sau response: gắn token, bắt 401).

```typescript
// services/client/api.ts — identical to web-admin
const API = new Requester();  // singleton
export default API;
```

- `baseURL` trỏ cùng server, nhưng endpoint thực trong source là `/auth/*`, `/company/*`, `/users/linked*`, `/orders*` (không thấy prefix `/admin-company/` trong `src/`).
- Khác web-admin ở 401: chỉ `clearAuthState()`, không có `SessionEndedModal`.

---

## 3. Service layer

**Vấn đề:** một số màn đã có BE, một số chưa — làm sao để UI vẫn chạy được và sau này nối dễ?

**Cách làm:** 11 service file (+ `api.ts`), chia hai nhóm.

**Real API (gọi BE thật):**
- `auth.service.ts` — login, logout, forgot/reset password, verify
- `user.service.ts` (`/api/v1/users/me`), `error-report.service.ts`
- `account.service.ts` — linked users, purchase history, restrict/unrestrict
- `sales.service.ts` — orders list, export, summary, payment methods

**FE-only Mock (chưa có BE endpoint):**
- `company.service.ts` (hybrid: chỉ `exportCompanyQr` gọi `/company/export-qr`), `contract.service.ts`, `disposal.service.ts`
- `menu-order.service.ts`, `delivery-schedule.service.ts`, `prepared-shipping.service.ts`

```typescript
// ✅ Real API — services/client/account.service.ts
const APIs = {
  ACCOUNTS: '/users/linked',
  ACCOUNT_DETAIL: (id: string | number) => `/users/linked/${id}`,
  RESTRICT_LINKED_USER: (userCode: string) => `/users/linked/${userCode}/restrict`,
};

export const fetchLinkedUsers = async (
  params?: FetchLinkedUsersParams
): Promise<IBaseApiResponse<LinkedUserListResponseDto>> => {
  return API.get(APIs.ACCOUNTS, params);
};

// ✅ Real API — services/client/sales.service.ts (export trả Blob)
export const exportUserSalesOrders = async (
  params?: ExportUserSalesOrdersParams
): Promise<Blob> => {
  return API.get(APIs.USER_SALES_ORDERS_EXPORT, params, { responseType: 'blob' });
};
```

---

## 4. Mock service

**Vấn đề:** UI cần chạy khi BE chưa sẵn sàng, nhưng không muốn viết lại hook/page khi BE xong.

**Cách làm:** service dùng dữ liệu trong bộ nhớ và hàm `ok()` giả lập response 200. Cả 6 mock service theo cùng convention.

```typescript
// ✅ Mock service — bắt đầu bằng comment bắt buộc:
// <Domain> data source — FE-only MOCK (no backend).
// Swap for a real API call when the E02 <domain> endpoint is available.

import type { IBaseApiResponse } from '@/models/Response';

// Helper giả lập HTTP 200 response
const ok = <T>(data: T): IBaseApiResponse<T> => ({
  statusCode: '200',
  message: 'OK',
  data,
});

// In-memory seed data
const ALL_ITEMS: SomeDto[] = Array.from({ length: 14 }, (_, index) => ({
  id: String(index + 1),
  // ... fields
}));

// Export function giữ đúng signature như real API sẽ có
export const fetchItems = (
  params?: FetchItemsParams
): Promise<IBaseApiResponse<ItemListResponseDto>> => {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const total = ALL_ITEMS.length;
  const start = (page - 1) * limit;
  return Promise.resolve(
    ok({ items: ALL_ITEMS.slice(start, start + limit), total, page, limit })
  );
};
```

**Khi BE sẵn sàng:** thay phần thân hàm bằng `return API.get(...)`, giữ nguyên signature. Hook và page không phải sửa.

**Bẫy:**
- Mock phải tự cắt trang (`slice`) giống BE, nếu không `useTableParams` + bảng sẽ không giống thật.
- Đừng xoá comment `FE-only MOCK` — đó là dấu hiệu để tìm lại những chỗ cần nối BE.

---

## 5. TanStack Query v5

Cùng pattern với web-admin (object syntax bắt buộc). `queryKey` = tên ngăn cache; `invalidateQueries` = đánh dấu cũ để tự fetch lại.

```typescript
// ✅ v5 syntax — useQuery
const { data, isLoading, isFetching } = useQuery({
  queryKey: ['users', filters],
  queryFn: () => fetchLinkedUsers(filters),
  // select để trích data.data tránh lặp .data.data ở consumer
  select: response => response.data,
});

// ✅ v5 syntax — useMutation cơ bản
const { mutate: refund } = useMutation({
  mutationFn: (orderId: string) => salesService.refundOrder(orderId),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['sales'] });
  },
});

// ✅ useInfiniteQuery — dùng trong BaseInfiniteSelect
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: [queryKey, debouncedSearch],
  queryFn: ({ pageParam = 1 }) => fetchFn({ page: pageParam, limit }),
  getNextPageParam: lastPage => {
    const { page, totalPages } = lastPage?.data ?? { page: 1, totalPages: 1 };
    return page < totalPages ? page + 1 : undefined;
  },
  initialPageParam: 1,
});
```

- Cấu hình mặc định `queryClient`: `staleTime: 0`, `gcTime: 0`, `retry: 1`, không refetch khi focus.
- Khác web-admin: queryKey ở đây thường là chuỗi viết thẳng (`'users'`, `'sales'`) hoặc hằng `QUERY_KEY` trong `constants.ts` của page.

---

## 6. `useMutationCustom`

**Vấn đề:** mỗi mutation cần toast lỗi/thành công giống nhau.

**Cách làm:** wrapper quanh `useMutation` (v5), tự `toast.error` khi lỗi và `toast.success` khi thành công (`react-toastify`). Dùng thay `useMutation` ở mọi mutation có toast.

```typescript
import { useMutationCustom } from '@/hooks/useMutationCustom';

const { mutate: updateBasicInfo, isPending } = useMutationCustom({
  mutationFn: (values: CompanyDetailForm) =>
    updateCompanyBasicInfo(companyId, mapFormToUpdateBasicInfoRequest(values)),
  customSuccessMessage: '基本情報が正常に更新されました。',
  onSuccess: response => {
    void queryClient.invalidateQueries({ queryKey: [QUERY_KEY, companyId] });
    setIsEditMode(false);
  },
});

// Tùy chọn:
// skipAutoErrorHandling: true  → không tự toast.error (xử lý thủ công trong onError)
// skipAutoSuccessHandling: true → không tự toast.success
// customErrorMessage: '...'    → override thông báo lỗi mặc định
```

**Bẫy:** đã có message tự động thì đừng `toast` tay thêm → toast đôi.

---

## 7. Redux store

Chỉ có 1 slice: `auth`. Không có `monthlyMenuImport` hay `counter` như web-admin.

```typescript
// stores/reducers/auth.ts — same pattern as web-admin
// setAuthTokens / setCurrentUser / clearAuthState

// Selectors
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.status === SESSION_STATUS.AUTHENTICATED;
```

**Bẫy:** cần state mới → tạo slice mới trong `stores/reducers/`, không nhét vào slice `auth`.

---

## 8. Luồng đăng nhập

Giống web-admin, gọi endpoint `/auth/*` (xem `auth.service.ts`):

```
App khởi động → bootstrapAuthStateFromCookies()
Login → POST /auth/login
  → setAuthTokens() → cookies + Redux
401 → clearAuthState() → redirect /login
```

---

## 9. Routing

23 route path (5 public + register, reset-success, 17 authenticated). Ngoài `NonAuthLayout` có thêm `AuthCenteredLayout` (reset-success) và `RegisterLayout` (công khai).

```typescript
// routes/index.tsx — cấu trúc hiện tại (rút gọn)
export const router = createBrowserRouter([
  {
    element: <PublicOnly />,
    children: [
      {
        element: <NonAuthLayout />,      // login / forgot / verify / reset
        children: [...authRoutes],
      },
      {
        element: <RegisterLayout />,     // đăng ký company mới (công khai)
        children: [{ path: ROUTE.REGISTER, element: withSuspense(<RegisterPage />) }],
      },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AuthCenteredLayout />, // reset-success (1 trang)
        children: [...],
      },
      {
        element: <AuthLayout />,         // mọi trang authenticated
        children: [
          // Default redirect: / → /sales-management
          { index: true, element: <Navigate to={ROUTE.SALES_MANAGEMENT} replace /> },
          { path: ROUTE.ACCOUNT_MANAGEMENT, element: withSuspense(<AccountManagementPage />) },
          { path: '/account-management/user/:userId', element: withSuspense(<UserAccountDetailPage />) },
          { path: ROUTE.SALES_MANAGEMENT, element: withSuspense(<SalesManagementPage />) },
          { path: ROUTE.COMPANY_MANAGEMENT, element: withSuspense(<CompanyManagementPage />) },
          { path: '/company-management/:id', element: withSuspense(<CompanyDetailPage />) },
          { path: ROUTE.CONTRACT_MANAGEMENT, element: withSuspense(<ContractManagementPage />) },
          { path: ROUTE.CONTRACT_MANAGEMENT_CREATE, element: withSuspense(<ContractCreatePage />) },
          { path: '/sales-management/user-purchase-history/:purchaseNumber', element: withSuspense(<UserPurchaseHistoryPage />) },
          { path: ROUTE.MENU_ORDER, element: withSuspense(<MenuOrderPage />) },
          { path: ROUTE.MENU_ORDER_CREATE, element: withSuspense(<MenuOrderCreatePage />) },
          { path: ROUTE.DELIVERY_MANAGEMENT_SCHEDULE, element: withSuspense(<DeliveryNavSchedulePage />) },
          { path: ROUTE.DELIVERY_MANAGEMENT_PREPARED_SHIPPING, element: withSuspense(<DeliveryPreparedShippingPage />) },
          { path: '/delivery-management/prepared-shipping/:id', element: withSuspense(<DeliveryPreparedShippingDetailPage />) },
          { path: ROUTE.DELIVERY_MANAGEMENT_MATERIAL_SHIPPING, element: withSuspense(<DeliveryMaterialShippingPage />) },
          { path: ROUTE.DISPOSAL_REPORT, element: withSuspense(<DisposalReportPage />) },
          { path: ROUTE.DISPOSAL_HISTORY, element: withSuspense(<DisposalHistoryPage />) },
          { path: ROUTE.EMPLOYEE_BENEFITS, element: withSuspense(<EmployeeBenefitsPage />) },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to={ROUTE.LOGIN} replace /> },
]);
```

**Bẫy:** một số route detail đang viết chuỗi trực tiếp (`'/company-management/:id'`…) thay vì `ROUTE.xxx` — khi thêm route mới nên khai `ROUTE.xxx` trong `constants/route.ts`.

---

## 10. Cấu trúc một page

```
pages/<domain>/
├── page.tsx                     ← Entry point (lazy-loaded)
├── _columnTable.tsx             ← Column defs (tách riêng khi >3 columns)
├── helpers.ts                   ← Pure mappers (dto → row, form → request)
├── types.ts                     ← Types cục bộ của feature
├── page.module.scss             ← SCSS chỉ khi cần override AntD
├── components/
│   ├── FormSearch.tsx           ← Thanh filter
│   └── <FeatureModal>.tsx       ← Modal riêng cho feature
└── [id]/                        ← Detail page
    ├── page.tsx
    ├── schema.ts                ← yup schema riêng
    ├── types.ts
    ├── helpers.ts
    └── components/
        └── <Section>.tsx        ← Mỗi nhóm field = 1 Section
```

Page phức tạp co-locate hook vào thư mục riêng:

```
pages/menu-order/
├── page.tsx
├── create/page.tsx
├── constants.ts
├── hooks/
│   └── useMenuOrder.ts          ← Hook domain chứa toàn bộ state + query
└── components/
    ├── ProductCard/index.tsx
    ├── AiDistributionDrawer/index.tsx
    └── ...

pages/delivery-management/schedule/
├── page.tsx
├── hooks/
│   └── useScheduleData.ts       ← Thin wrapper useQuery
└── components/
    ├── ScheduleFilterBar.tsx
    └── calendar/CalendarMonthView.tsx
```

---

## 11. Form

### Form đơn

```typescript
// validation/schemas.ts — yup schemas
export const loginSchema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().min(8).required(),
});

// Trong component
const { control, handleSubmit, formState: { errors } } = useForm({
  resolver: yupResolver(loginSchema),
  mode: 'onSubmit',
});
```

### FormProvider — form nhiều section

**Vấn đề:** một page có nhiều section, đều cần đọc/ghi cùng một form; truyền `form` qua props từng tầng rất rối.

**Cách làm:** cha bọc `FormProvider`, con dùng `useFormContext()`.

```tsx
// ✅ Parent page: bọc FormProvider
const DetailPage = () => {
  const form = useForm<MyForm>({
    resolver: yupResolver(mySchema) as Resolver<MyForm>,
    mode: 'onSubmit',
  });

  return (
    <FormProvider {...form}>
      <SectionA />          {/* useFormContext() bên trong */}
      <SectionB />
    </FormProvider>
  );
};

// ✅ Section component: dùng useFormContext thay vì nhận form qua props
import { useFormContext } from 'react-hook-form';

const SectionA = ({ isEditMode }: { isEditMode: boolean }) => {
  const { control, formState: { errors } } = useFormContext<MyForm>();
  // ...
};
```

Áp dụng tại: `company-management/[id]`, `delivery-management/prepared-shipping/[id]`, `contract-management/create`, `employee-benefits`, `auth/register`.

### `savedDetailRef` — Cancel không cần gọi lại API

**Vấn đề:** trang chi tiết có nút Sửa / Huỷ / Lưu. Bấm Huỷ phải quay về dữ liệu đã lưu, không muốn gọi lại API.

**Cách làm:** giữ bản "đã lưu" trong `useRef`.

```tsx
const savedDetailRef = useRef<MyForm | null>(null);

// Khi data load về: đồng bộ vào form VÀ ref
useEffect(() => {
  if (!data) return;
  const nextValues = mapDtoToForm(data);
  savedDetailRef.current = nextValues;
  form.reset(nextValues);
}, [data, form]);

// Cancel: reset về ref (không call API)
const handleCancel = () => {
  if (savedDetailRef.current) form.reset(savedDetailRef.current);
  setIsEditMode(false);
};

// Save thành công: cập nhật ref với giá trị mới
const handleSaveSuccess = () => {
  savedDetailRef.current = form.getValues();
  form.reset(form.getValues()); // xóa dirty state
  setIsEditMode(false);
};
```

Áp dụng tại: `company-management/[id]`, `delivery-management/prepared-shipping/[id]`, `employee-benefits`.

**Bẫy:** quên cập nhật ref sau khi Save → lần Huỷ sau quay về giá trị cũ.

---

## 12. Committed Filter (lọc chỉ chạy khi bấm「検索」)

**Vấn đề:** user gõ trong ô lọc mà mỗi ký tự lại gọi API.

**Cách làm:** tách `draft` (state cục bộ của filter bar) và `appliedFilter` (state đưa vào `queryKey`). Chỉ khi bấm「検索」mới đẩy `draft` thành `appliedFilter`.

```tsx
// ✅ State separation — trong page hoặc Calendar component
const [appliedFilter, setAppliedFilter] = useState<FilterState>(INITIAL_FILTERS);

const { data } = useQuery({
  queryKey: [QUERY_KEY, appliedFilter],   // ← chỉ re-fetch khi appliedFilter thay đổi
  queryFn: () => fetchData(appliedFilter),
});

// ✅ Filter bar giữ draft state nội bộ, emit ra khi submit
const ScheduleFilterBar = ({ onSearch, onClear }: FilterBarProps) => {
  const [draft, setDraft] = useState<FilterState>(INITIAL_FILTERS);

  return (
    <>
      <Input value={draft.keyword} onChange={v => setDraft(prev => ({ ...prev, keyword: v }))} />
      <Button onClick={() => onSearch(draft)}>検索</Button>
      <Button onClick={() => { setDraft(INITIAL_FILTERS); onClear(); }}>クリア</Button>
    </>
  );
};

// ✅ Trong page: cập nhật applied khi nhận từ filter bar
const handleSearch = (filters: FilterState) => setAppliedFilter(filters);
const handleClear = () => setAppliedFilter(INITIAL_FILTERS);
```

- Khi filter bar tích hợp `useTableParams` (có sync URL): dùng `handleFilterTable` của hook đó thay vì `setAppliedFilter` tự quản.
- Áp dụng tại: `menu-order`, `delivery-management/schedule`, `employee-benefits/StaffLinkTableSection`, `company-management/[id]/ContractHistorySection`.

**Bẫy:** đưa `draft` thẳng vào `queryKey` → gõ đến đâu gọi API đến đó.

---

## 13. Thư viện hook hiện có

```
src/hooks/
├── useAuth.ts                   ← Lấy current user từ Redux
├── useCan.ts                    ← Kiểm tra role/permission (dùng useAuth + validateUserPermissions)
├── useDebouncedValue.ts         ← Debounce giá trị (stable với JSON compare)
├── useInView.ts                 ← IntersectionObserver — lazy load / animate on scroll
├── useMutationCustom.ts         ← useMutation + auto toast (xem mục 6)
├── usePaymentMethodOptions.ts   ← Fetch payment method options (wrapped useQuery)
├── useTableParams.ts            ← Table state (page/sort/filter) ↔ URL query params
├── useUnsavedChangesGuard.tsx   ← Chặn navigate khi form dirty (useBlocker + DiscardChangesModal)
└── router.ts                    ← Re-export useNavigate / useParams / useRouter / usePathname / useSearchParams
```

**`useUnsavedChangesGuard`** — dùng khi trang chi tiết ở edit mode cần chặn user đi chỗ khác lúc còn thay đổi chưa lưu:

```tsx
const { guardModal, confirmDiscard } = useUnsavedChangesGuard({
  when: isEditMode && Object.keys(dirtyFields).length > 0,
});

const handleCancel = () => {
  confirmDiscard(() => {
    form.reset(savedDetailRef.current);
    setIsEditMode(false);
  });
};

// Render modal (đặt trong JSX của page)
return (
  <>
    {guardModal}
    {/* ... page content */}
  </>
);
```

**Bẫy:** quên `{guardModal}` trong JSX → guard chặn nhưng không có modal.

---

## 14. Checklist thêm page mới

- [ ] Tạo folder trong `src/pages/<domain>/`
- [ ] Thêm lazy import trong `routes/index.tsx`
- [ ] Thêm route path vào `createBrowserRouter`
- [ ] Thêm constant vào `constants/route.ts`
- [ ] Cần API thật: tạo `services/client/<domain>.service.ts` — hỏi BE endpoint thật (docs cũ ghi `/admin-company/...` nhưng source hiện dùng `/company/...`, `/users/linked`, `/orders`)
- [ ] BE chưa sẵn sàng: tạo mock service theo mục 4 — comment `FE-only MOCK`, helper `ok()`, giữ đúng function signature
- [ ] Mutation cần toast: dùng `useMutationCustom` thay `useMutation`
- [ ] Form nhiều section: `FormProvider` + `useFormContext` trong section
- [ ] Detail page có Cancel/Save: dùng `savedDetailRef`
- [ ] Edit mode có chặn navigate: dùng `useUnsavedChangesGuard`
- [ ] Filter bar không áp dụng ngay: dùng Committed Filter (mục 12)
- [ ] Không copy endpoint `/admin/...` từ web-admin sang — E02 dùng endpoint riêng (xem service hiện có)
- [ ] Cần state phức tạp: tạo RTK slice mới trong `stores/reducers/`
