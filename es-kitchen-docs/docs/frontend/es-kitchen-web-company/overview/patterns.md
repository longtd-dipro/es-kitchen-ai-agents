# es-kitchen-web-company — Patterns & Conventions

> Đọc file này trước khi viết code React mới cho E02. Cùng stack với web-admin nhưng scope nghiệp vụ khác.
> Tham chiếu thêm: `es-kitchen-web-admin/overview/patterns.md` — các pattern cốt lõi giống nhau.

---

## Điểm khác biệt so với web-admin

| | `es-kitchen-web-admin` (E03) | `es-kitchen-web-company` (E02) |
|---|---|---|
| API prefix | `/admin/...` | `/admin-company/...` |
| Default route | `/dashboard` | `/sales-management` |
| RTK slices | `auth`, `monthlyMenuImport`, `counter` | `auth` only |
| Service files | 13 files | 12 files (6 real API + 6 FE-only mock) |
| Pages hiện có | 8 groups | 12 route groups |

> ⚠️ Không copy endpoint từ web-admin sang — prefix khác nhau hoàn toàn.

---

## HTTP Client Pattern

**Giống hệt web-admin** — cùng `Requester` class, cùng interceptor pattern.

```typescript
// services/client/api.ts — identical to web-admin
const API = new Requester();  // singleton
export default API;
```

Điểm khác biệt duy nhất: `baseURL` trỏ cùng server nhưng endpoint prefix là `/admin-company/...`

---

## Service Layer

Hiện có 12 service files. Chia thành hai nhóm:

**Real API (gọi BE thật):**
- `auth.service.ts` — login, logout, forgot/reset password, verify
- `account.service.ts` — linked users, purchase history, restrict/unrestrict
- `sales.service.ts` — orders list, export, summary, payment methods

**FE-only Mock (chưa có BE endpoint):**
- `company.service.ts`, `contract.service.ts`, `disposal.service.ts`
- `menu-order.service.ts`, `delivery-schedule.service.ts`, `prepared-shipping.service.ts`

Xem chi tiết pattern mock ở section **Mock Service Pattern** bên dưới.

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

## Mock Service Pattern

Khi BE endpoint chưa sẵn sàng, service file dùng in-memory data với hàm `ok()` giả lập response shape. Tất cả 6 mock services đều theo cùng convention:

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

> Khi BE sẵn sàng: thay body hàm bằng `return API.get(...)` — giữ nguyên function signature. Consumer (hooks, page) không cần sửa.

---

## TanStack Query Pattern (v5)

Cùng pattern với web-admin:

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

---

## useMutationCustom

Wrapper quanh `useMutation` (TanStack Query v5) — tự động hiển thị `toast.error` khi mutation thất bại và `toast.success` khi thành công. Dùng thay `useMutation` trực tiếp ở mọi mutation có toast notification.

```typescript
// ✅ Dùng useMutationCustom thay vì useMutation trực tiếp
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

---

## Redux Store

Chỉ có 1 slice: `auth`. Không có `monthlyMenuImport` hay `counter` như web-admin.

```typescript
// stores/reducers/auth.ts — same pattern as web-admin
// setAuthTokens / setCurrentUser / clearAuthState

// Selectors
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.status === SESSION_STATUS.AUTHENTICATED;
```

Khi thêm state mới: tạo slice mới trong `stores/reducers/` — không nhét vào `auth` slice.

---

## Auth Flow

Giống web-admin, nhưng gọi endpoint `/admin-company/auth/`:

```
App khởi động → bootstrapAuthStateFromCookies()
Login → POST /admin-company/auth/login
  → setAuthTokens() → cookies + Redux
401 → clearAuthState() → redirect /login
```

---

## Routing Pattern

12 route groups hiện tại. Layout có thêm `AuthCenteredLayout` (reset-success) và `RegisterLayout` (công khai):

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

---

## Page Structure Pattern

Pattern thư mục hiện tại:

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

Các page phức tạp được co-locate hooks vào thư mục riêng:

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

## Form Pattern

### Cơ bản (single form)

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

### FormProvider — multi-section form

Dùng khi một page có nhiều section component đều cần đọc/ghi cùng 1 form. Tất cả detail page lớn đều theo pattern này:

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

### savedDetailRef — ref-based save state

Dùng khi form load dữ liệu từ API và cần hỗ trợ "Cancel" (revert về state đã lưu) mà không gọi lại API:

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

---

## Committed Filter Pattern

Dùng khi filter bar không nên trigger query ngay khi user gõ — chỉ apply khi nhấn nút "検索". Tách biệt `draft` (state cục bộ của filter bar) và `appliedFilter` (state gửi vào queryKey):

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

Khi filter bar tích hợp với `useTableParams` (có URL sync): dùng `handleFilterTable` từ hook đó thay vì `setAppliedFilter` tự quản lý.

Áp dụng tại: `menu-order`, `delivery-management/schedule`, `employee-benefits/StaffLinkTableSection`, `company-management/[id]/ContractHistorySection`.

---

## Hook Library hiện có

```
src/hooks/
├── useAuth.ts                   ← Lấy current user từ Redux
├── useCan.ts                    ← Kiểm tra role/permission (dùng useAuth + validateUserPermissions)
├── useDebouncedValue.ts         ← Debounce giá trị (stable với JSON compare)
├── useInView.ts                 ← IntersectionObserver — lazy load / animate on scroll
├── useMutationCustom.ts         ← useMutation + auto toast (xem section riêng)
├── usePaymentMethodOptions.ts   ← Fetch payment method options (wrapped useQuery)
├── useTableParams.ts            ← Table state (page/sort/filter) ↔ URL query params
├── useUnsavedChangesGuard.tsx   ← Chặn navigate khi form dirty (useBlocker + DiscardChangesModal)
└── router.ts                    ← Re-export useNavigate / useParams / useRouter / usePathname / useSearchParams
```

**`useUnsavedChangesGuard`** — dùng khi detail page ở edit mode cần chặn user navigate ra ngoài khi có unsaved changes:

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

---

## Thêm page mới — Checklist

Khi thêm feature page mới vào web-company:

- [ ] Tạo folder trong `src/pages/<domain>/`
- [ ] Thêm lazy import trong `routes/index.tsx`
- [ ] Thêm route path vào `createBrowserRouter`
- [ ] Thêm constant vào `constants/route.ts`
- [ ] Nếu cần API thật: tạo `services/client/<domain>.service.ts` với prefix `/admin-company/...`
- [ ] Nếu BE chưa sẵn sàng: tạo mock service theo **Mock Service Pattern** — comment `FE-only MOCK`, helper `ok()`, giữ đúng function signature
- [ ] Dùng `useMutationCustom` thay `useMutation` khi mutation cần toast notification
- [ ] Form nhiều section: dùng `FormProvider` + `useFormContext` trong section
- [ ] Detail page có Cancel/Save: dùng `savedDetailRef` pattern
- [ ] Edit mode có navigate guard: dùng `useUnsavedChangesGuard`
- [ ] Filter bar không apply ngay: dùng **Committed Filter Pattern** (draft + applied)
- [ ] API endpoint prefix phải là `/admin-company/...` — không dùng `/admin/...`
- [ ] Nếu cần state phức tạp: tạo RTK slice mới trong `stores/reducers/`
