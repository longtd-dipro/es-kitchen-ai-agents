# es-kitchen-web-admin — Patterns & Conventions

> Đọc file này trước khi viết code React mới cho E03. Follow pattern đang có — không tự refactor.

---

## HTTP Client Pattern

Tất cả API call đi qua singleton `API` — một instance của class `Requester`:

```typescript
// services/client/api.ts — KHÔNG sửa file này
class Requester {
  constructor() {
    const axiosInstance = axios.create({
      baseURL: serverConfig.api_server_url,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': 'ja',          // ← Tiếng Nhật mặc định
      },
    });

    // Request interceptor: inject Bearer token
    axiosInstance.interceptors.request.use(async (config) => {
      const accessToken = getAccessToken();
      if (accessToken) config.headers['Authorization'] = `Bearer ${accessToken}`;
      config.headers['timezone'] = new Date().getTimezoneOffset();
      return config;
    });

    // Response interceptor: 401 → logout
    axiosInstance.interceptors.response.use(
      (res) => res.data,
      (error) => {
        if (error.response?.status === 401) store.dispatch(clearAuthState());
        return Promise.reject(error);
      }
    );
  }
}
const API = new Requester();
export default API;
```

---

## Service Layer Pattern

Mỗi domain có 1 service file trong `services/client/`. Pattern hiện tại: `const APIs` object chứa URL, mỗi hàm export riêng (không export object method). Service chỉ gọi `API`, không chứa React hook hay state.

```typescript
// services/client/account.service.ts — pattern chuẩn
import type { AccountListItemDto, FetchAccountListParams } from '@/models/account';
import type { IBaseApiResponse } from '@/models/Response';
import API from '@/services/client/api';

// ✅ URL constants tập trung
const APIs = {
  ACCOUNTS: '/accounts',
  ACCOUNT_DETAIL: (id: string | number) => `/accounts/${id}`,
};

// ✅ Export từng hàm riêng — KHÔNG export service object
export const fetchAccountList = async (
  params?: FetchAccountListParams
): Promise<IBaseApiResponse<AccountListItemDto[]>> => {
  return API.get(APIs.ACCOUNTS, params);
};

export const createAccount = async (
  data: CreateAccountRequest
): Promise<IBaseApiResponse<AccountListItemDto>> => {
  return API.post(APIs.ACCOUNTS, data);
};

export const fetchAccountDetail = async (
  id: string | number
): Promise<IBaseApiResponse<AccountListItemDto>> => {
  return API.get(APIs.ACCOUNT_DETAIL(id));
};

// ✅ queryKey constants export từ service hoặc page hook — để invalidateQueries chia sẻ được
export const ROLE_SELECT_QUERY_KEY = 'role-list-select';
```

> **Lưu ý thay đổi từ pattern cũ:** Trước đây code doc dùng `export const companyService = { ... }` (object export). Pattern thực tế trong codebase hiện tại là **individual function exports** + `const APIs`. Không tạo service object mới.

---

## TanStack Query Pattern (v5)

```typescript
// ✅ v5 syntax — queryKey + queryFn object
const { data, isLoading, isFetching } = useQuery({
  queryKey: [ROLE_LIST_QUERY_KEY, queryApiParams],
  queryFn: () => fetchRoleList(queryApiParams),
});

// ✅ Dùng useMutationCustom thay useMutation trực tiếp (xem section riêng bên dưới)
const { mutate, isPending } = useMutationCustom({
  mutationFn: (id: string) => deleteRole(id),
  customSuccessMessage: '権限が正常に削除されました。',
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: [ROLE_LIST_QUERY_KEY] });
  },
});

// ❌ v4 positional syntax — KHÔNG dùng
useQuery(['companies', filters], () => fetchCompanies(filters));

// ❌ useMutation trực tiếp — chỉ dùng khi cần toàn quyền kiểm soát error/success
const { mutate } = useMutation({ mutationFn: ... });
```

**queryKey convention — luôn export thành named constant:**
```typescript
// Trong page hook hoặc service file
export const ROLE_LIST_QUERY_KEY = 'role-list';
export const COLLECTION_QUERY_KEY = 'collection-list';
export const MATERIAL_QUERY_KEY = 'material-list';

// Trong useQuery
queryKey: [ROLE_LIST_QUERY_KEY, queryApiParams]

// Trong invalidateQueries
queryClient.invalidateQueries({ queryKey: [ROLE_LIST_QUERY_KEY] })
```

---

## useMutationCustom — Wrapper chuẩn cho mutation

`src/hooks/useMutationCustom.ts` — bọc `useMutation` với auto toast. Dùng ở hầu hết mutation trong codebase.

```typescript
import { useMutationCustom } from '@/hooks/useMutationCustom';

// ✅ Auto toast error từ response.data.message + tùy chọn success toast
const { mutate: createRoleMutate, isPending } = useMutationCustom({
  mutationFn: (data: CreateRoleRequest) => createRole(data),
  customSuccessMessage: '権限が正常に作成されました。',   // toast.success khi done
  // customErrorMessage — override message lỗi mặc định nếu cần
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: [ROLE_LIST_QUERY_KEY] });
    router.push(ROUTE.ROLE_MANAGEMENT);
  },
  onError: () => {
    // xử lý thêm sau khi đã auto-toast error
  },
});

// Options bổ sung:
// skipAutoErrorHandling: true  → tắt auto toast.error
// skipAutoSuccessHandling: true → tắt auto toast.success
```

Toast dùng `react-toastify` (`import { toast } from 'react-toastify'`), không phải `App.useApp().message` của AntD. `useMutationCustom` tự gọi `toast.error` / `toast.success` — không cần gọi thủ công trong `onError`/`onSuccess` nếu đã truyền message.

---

## useTableParams — URL-synchronized table state

`src/hooks/useTableParams.ts` — đồng bộ page/sort/filters vào URL query string. Dùng cho mọi list page có pagination.

```typescript
import useTableParams from '@/hooks/useTableParams';

const { tableParams, searchParams, handleFilterTable, handleResetFilers } = useTableParams<
  RoleRow,
  RoleSearchParams
>({
  keyExtraParams: ['keyword', 'status', 'month'],  // keys filter sẽ sync vào URL
  sortBy: 'createdAt',                              // default sort field
  sort: 'DESC',                                     // default sort direction
  rowsPerPage: 10,                                  // default page size
  setFieldValues: resetSearchFormFromQuery,          // sync URL → react-hook-form
});

// tableParams: { page, sort, sortBy, rowsPerPage, setPage, setSort, setSortBy, setRowsPerPage }
// searchParams: object chứa tất cả params kể cả extraParams, đã clean falsy
// handleFilterTable(values): set extraParams + reset về page 1
// handleResetFilers(keysKeep?): xóa hết filter ngoại trừ keys trong keysKeep

// Truyền vào BaseTable
<BaseTable
  page={tableParams.page}
  rowsPerPage={tableParams.rowsPerPage}
  setPage={tableParams.setPage}
  setRowsPerPage={tableParams.setRowsPerPage}
  total={data?.total ?? 0}
  loading={isLoading || isFetching}
  dataSource={rows}
  columns={columns}
/>
```

Option `isNotChangeUrl: true` nếu page không muốn sync URL (dùng local state).

---

## usePermissions — RBAC hook

`src/hooks/usePermissions.ts` — đọc từ Redux `auth.permissions`. Dùng để guard UI element theo quyền.

```typescript
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/constants/permissions';

const { can, canAny, canAll, isSuperAdmin } = usePermissions();

// Ẩn/hiện button theo quyền
const canCreate = can(PERMISSIONS.SYSTEM_IP_WHITELIST_CREATE);
const canDelete = can(PERMISSIONS.SYSTEM_IP_WHITELIST_DELETE);

// Guard trong JSX
{canCreate && <BaseButton onClick={handleCreate}>新規作成</BaseButton>}

// canAny: có ít nhất 1 trong danh sách
// canAll: phải có đủ tất cả
// isSuperAdmin: true → bypass mọi check
```

Permission data từ `auth.permissions.flatPermissions` (mảng string) + `auth.permissions.isSuperAdmin`. Được dispatch qua `setCurrentPermissions(adminPermissions)` sau khi fetch `/admin/me`.

Route-level guard: `RequirePermission` guard trong `routes/guards/RequirePermission.tsx` — map route prefix → required permissions qua `ROUTE_PERMISSIONS` constant.

---

## useUnsavedChangesGuard — Navigation blocker

`src/hooks/useUnsavedChangesGuard.tsx` — ngăn user rời trang khi form đang dirty. Dùng ở mọi create/edit page có form.

```typescript
import useUnsavedChangesGuard from '@/hooks/useUnsavedChangesGuard';

const form = useForm<RoleFormValues>({ ... });

const { guardModal, confirmDiscard, allowNextNavigation } = useUnsavedChangesGuard({
  when: form.formState.isDirty,   // khi nào bật guard
});

// Nút Cancel: hỏi confirm trước khi navigate
const handleCancel = () => {
  confirmDiscard(() => router.push(ROUTE.ROLE_MANAGEMENT));
};

// Sau khi submit thành công: navigate không bị chặn
const handleSubmitSuccess = () => {
  allowNextNavigation(() => router.push(ROUTE.ROLE_MANAGEMENT));
};

// Render guardModal trong JSX (BẮT BUỘC — không render thì modal không hiện)
return (
  <section>
    {/* ... form content ... */}
    {guardModal}
  </section>
);
```

`guardModal` render `DiscardChangesModal` — component dùng `BaseModalConfirm` type "warning". Guard cũng bắt `beforeunload` (đóng tab/refresh).

---

## useTableRowDragDrop — Drag-and-drop table rows

`src/hooks/useTableRowDragDrop.ts` — cho phép kéo thả sắp xếp lại hàng trong table.

```typescript
import { useTableRowDragDrop } from '@/hooks/useTableRowDragDrop';

const { getDragHandleProps, getDragHandleClassName, getRowDragProps, getRowDragClassName } =
  useTableRowDragDrop({
    enabled: true,
    onMoveRow: (fromIndex, toIndex) => {
      // cập nhật state items
    },
  });

// Trong render column:
<button
  {...getDragHandleProps(rowIndex)}
  className={getDragHandleClassName(rowIndex)}
>
  <DragHandleIcon />
</button>

// Trên <tr> row:
<tr {...getRowDragProps(rowIndex)} className={getRowDragClassName(rowIndex)}>
```

---

## Redux Toolkit Pattern (v2)

RTK chỉ dùng cho **client state** — không dùng cho server data (dùng TanStack Query cho đó).

```typescript
// stores/reducers/auth.ts — auth slice hiện tại
type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  status: string;
  user: AuthCurrentUser | null;
  permissions: AdminPermissions | null;   // ← thêm mới: RBAC permissions
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthTokens(state, action: PayloadAction<SetAuthTokensPayload>) {
      setAuthCookies(action.payload);
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.user = null;
      state.permissions = null;
      state.status = SESSION_STATUS.LOADING;
    },
    setCurrentUser(state, action: PayloadAction<AuthCurrentUser>) {
      state.user = action.payload;
      state.status = SESSION_STATUS.AUTHENTICATED;
    },
    setCurrentPermissions(state, action: PayloadAction<AdminPermissions>) {  // ← action mới
      state.permissions = action.payload;
    },
    clearAuthState(state) {
      clearAuthCookies();
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      state.permissions = null;
      state.status = SESSION_STATUS.UNAUTHENTICATED;
    },
  },
});

// Selectors
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectCurrentPermissions = (state: { auth: AuthState }) => state.auth.permissions;
```

Auth token lưu **cookie** (không phải localStorage). Đọc/ghi qua `services/http/authToken.ts`.

---

## Auth Flow

```
App khởi động
  → bootstrapAuthStateFromCookies()    ← đọc cookie vào Redux
  → RequireAuth guard check status
      LOADING → fetch /admin/me → setCurrentUser() + setCurrentPermissions()
      UNAUTHENTICATED → redirect /login
      AUTHENTICATED → render page (qua RequirePermission guard)

Login
  → POST /admin/auth/login
  → setAuthTokens({ accessToken, refreshToken })
  → cookies set + Redux update → LOADING → fetch /me

401 response (bất kỳ request nào)
  → interceptor dispatch clearAuthState()
  → Redux status = UNAUTHENTICATED
  → RequireAuth redirect /login

Permission check mỗi route
  → RequirePermission guard đọc ROUTE_PERMISSIONS[pathname]
  → canAny(required) → render | redirect /forbidden
```

---

## Routing Pattern

```typescript
// routes/index.tsx — createBrowserRouter
export const router = createBrowserRouter([
  {
    element: <PublicOnly />,    // redirect dashboard nếu đã auth
    children: [
      { path: ROUTE.LOGIN, element: withSuspense(<LoginPage />) },
    ],
  },
  {
    element: <RequireAuth />,   // redirect login nếu chưa auth
    children: [
      {
        element: <RequirePermission />,  // guard route-level permissions
        children: [
          {
            element: <AuthLayout />,   // layout có sidebar + header
            children: [
              { path: ROUTE.DASHBOARD, element: withSuspense(<DashboardPage />) },
              { path: ROUTE.ROLE_MANAGEMENT, element: withSuspense(<RoleManagementPage />) },
            ],
          },
        ],
      },
    ],
  },
]);
```

Route constants trong `constants/route.ts` — luôn dùng `ROUTE.xxx` thay vì string trực tiếp.

Lazy loading bắt buộc với `withSuspense()`:
```typescript
const RoleManagementPage = lazy(() => import('@/pages/account-management/role-management/page'));
// Dùng: withSuspense(<RoleManagementPage />)
```

---

## Page Structure Pattern

```
pages/<domain>/
├── page.tsx                         ← Entry point (list page) — gọi hooks, render UI
├── _column<Domain>.tsx              ← Column definitions (factory function)
├── constants.ts                     ← QUERY_KEY, enums, tab items
├── helpers.ts                       ← Pure helper functions
├── hooks/
│   └── use<Domain>Page.ts           ← Page-level hook (xem section bên dưới)
├── components/
│   ├── FormSearch.tsx               ← Filter bar
│   └── search.constants.ts         ← INITIAL_SEARCH_VALUES, types
└── [id]/
    ├── page.tsx                     ← Detail page entry
    ├── schema.ts                    ← Yup schema (co-located)
    └── hooks/
        └── use<Domain>DetailPage.ts
```

Ví dụ thực tế: `pages/material-management/`, `pages/order-management/`, `pages/waste-disposal-management/`

---

## Page-level Hook Pattern

Các list page phức tạp tách toàn bộ logic ra hook riêng `pages/<domain>/hooks/use<Domain>Page.ts`. Pattern thấy ở: material, order, collection, waste-disposal, sales (3 tab), delivery-schedule, inventory, contract-detail.

```typescript
// pages/material-management/hooks/useMaterialManagementPage.ts
const useMaterialManagementPage = () => {
  const router = useRouter();

  // 1. Search form (react-hook-form, KHÔNG yup ở đây — chỉ filter)
  const searchForm = useForm<MaterialSearchValues>({ defaultValues: INITIAL_SEARCH_VALUES });

  // 2. URL-synced table params (gồm filter, page, sort)
  const { tableParams, searchParams, handleFilterTable, handleResetFilers } = useTableParams<
    MaterialRow,
    MaterialTableSearchParams
  >({
    keyExtraParams: ['supplierName', 'orderMonth', 'tab'],
    setFieldValues: resetSearchFormFromQuery,   // sync URL params → form reset
  });

  // 3. Server data
  const { data, isLoading, isFetching } = useQuery({
    queryKey: [MATERIAL_QUERY_KEY, queryParams],
    queryFn: () => fetchMaterials(queryParams),
  });

  // 4. Derived state + handlers
  const rows = useMemo(() => ..., [data, tableParams]);
  const columns = useMemo(() => getColumnTableMaterial({ onEdit, onDelete }), []);

  return {
    searchForm, tableParams, rows, total, columns,
    isTableLoading, activeTab,
    handleSearch, handleClear, handleTabChange,
    isDeleteModalOpen, handleConfirmDelete, handleCloseDeleteModal,
  };
};

export default useMaterialManagementPage;
// Page component chỉ gọi hook và render:
// const { rows, columns, ... } = useMaterialManagementPage();
```

---

## Column Definition Pattern

Column definitions tách ra `_column<Domain>.tsx` co-located với page. Export factory function nhận callbacks:

```typescript
// pages/role-management/_columnTableRole.tsx
import type { ColumnsType } from 'antd/es/table';

export const getColumnTableRole = ({
  onEdit,
  onDelete,
}: {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}): ColumnsType<RoleRow> => [
  { title: 'No', dataIndex: 'no', width: 38 },
  { title: '権限名', dataIndex: 'name', width: 244, render: (value, record) => (...) },
  {
    title: '操作',
    key: 'actions',
    width: 96,
    align: 'center',
    render: (_, record) => (
      <div className="flex items-center justify-center gap-2">
        <BaseButtonAction type="edit" onClick={() => onEdit(record.id)} ariaLabel="編集" />
        <BaseButtonAction type="delete" onClick={() => onDelete(record.id)} ariaLabel="削除" />
      </div>
    ),
  },
];

// Trong page/hook:
const columns = useMemo(() => getColumnTableRole({ onEdit: handleEdit, onDelete: handleDelete }), []);
```

---

## Form Pattern (react-hook-form v7 + yup)

**Schema co-location:** Schema đặt trong `schema.ts` cạnh page/component sử dụng, KHÔNG phải `validation/schemas.ts` toàn cục. File `validation/schemas.ts` chỉ chứa auth schemas (login, forgot-password, reset-password, OTP).

```typescript
// pages/account-management/role-management/create/schema.ts
import * as yup from 'yup';
import type { RoleFormValues } from '@/models/role';

export const roleFormSchema = yup.object({
  name: yup.string().trim().required('権限名は必須項目です。').max(255),
  description: yup.string().trim(),
  permissions: yup.array().of(yup.string()),
}) as yup.ObjectSchema<RoleFormValues>;

// Trong page component
const form = useForm<RoleFormValues>({
  defaultValues: DEFAULT_VALUES,
  mode: 'onSubmit',
  resolver: yupResolver(roleFormSchema) as Resolver<RoleFormValues>,
});
```

**FormProvider cho form tree sâu** (nhiều component con cần dùng form):

```typescript
// Page: bọc form trong FormProvider
const form = useForm<CampaignCreateFormValues>({ ... });

return (
  <FormProvider {...form}>
    <form id={FORM_ID} onSubmit={form.handleSubmit(handleSubmit)}>
      <CampaignCreateForm />   {/* ← có thể gọi useFormContext() */}
    </form>
  </FormProvider>
);

// Component con:
import { useFormContext } from 'react-hook-form';
const { control, watch } = useFormContext<CampaignCreateFormValues>();
```

**Submit button tách khỏi form** (pattern dùng form `id`):

```typescript
// Form có id
<form id="role-create-form" onSubmit={form.handleSubmit(handleSubmit)}>
  {/* ... */}
</form>

// Button ở nơi khác (header) nhưng submit đúng form
<BaseButton htmlType="submit" form="role-create-form" loading={isPending}>
  保存
</BaseButton>
```

---

## Ant Design v6 — Lưu ý breaking changes

```typescript
// ❌ v5 — không dùng
import { PageHeader } from 'antd';

// ✅ v6
import { Flex, App } from 'antd';

// ✅ AntD modal/notification context (dùng cho modal confirm AntD nếu cần)
const { modal } = App.useApp();

// ❌ KHÔNG dùng App.useApp().message cho mutation feedback
// → Dùng toast từ react-toastify thay thế (hoặc useMutationCustom)
import { toast } from 'react-toastify';
toast.success('保存しました。');
toast.error('エラーが発生しました。');

// ✅ Table pagination v6
<Table
  pagination={{ pageSize: 20, showSizeChanger: true }}
  rowKey="id"
/>
```

Khi dùng component Ant Design mới: kiểm tra docs v6 trước — API có thể khác v5.

---

## Common Components — Các component thường dùng

### BaseHeadingBreadcrumb

Header chuẩn của mọi page: breadcrumb + title + action slot (children = buttons bên phải).

```tsx
import BaseHeadingBreadcrumb from '@/components/Common/BaseHeadingBreadcrumb';

<BaseHeadingBreadcrumb
  title="権限管理"
  breadcrumbItems={[
    { title: 'アカウント管理' },
    { title: <Link href={ROUTE.ROLE_MANAGEMENT}>権限</Link> },
    { title: '権限登録' },
  ]}
>
  {/* Action buttons hiển thị bên phải */}
  <BaseButton type="primary" size="large" icon={<PlusIcon />} onClick={handleCreate}>
    権限登録
  </BaseButton>
</BaseHeadingBreadcrumb>
```

### BaseInfiniteSelect

Select với infinite scroll + debounced server search. Dùng cho mọi select load dữ liệu từ API.

```tsx
import BaseInfiniteSelect from '@/components/Common/Fields/BaseInfiniteSelect';

<BaseInfiniteSelect<CompanyItem>
  queryKey="company-options"
  fetchFn={({ page, limit, search }) => fetchCompanies({ page, limit, q: search })}
  mapOption={(item) => ({ value: item.id, label: item.name })}
  value={selectedId}
  onChange={setSelectedId}
  label="会社名"
  isRequired
  placeholder="選択してください"
  mode="multiple"           // single hoặc multiple
  maxSelect={5}             // chỉ áp dụng khi multiple
  withCheckbox             // hiển thị checkbox trong option khi multiple
/>
```

Dùng `useInfiniteQuery` nội bộ. Tự debounce search 300ms. Tự giữ label cache khi scroll qua pages.

### BaseRichTextEditor

Rich text editor (Tiptap-based). Dùng cho notification content, mô tả dài.

```tsx
import BaseRichTextEditor from '@/components/Common/BaseRichTextEditor';

<Controller
  name="content"
  control={form.control}
  render={({ field, fieldState }) => (
    <BaseRichTextEditor
      value={field.value}
      onChange={field.onChange}
      onBlur={field.onBlur}
      error={fieldState.error?.message}
      placeholder="内容を入力してください"
    />
  )}
/>
```

### DiscardChangesModal

Modal xác nhận hủy thay đổi. Dùng qua `useUnsavedChangesGuard` — không cần render trực tiếp (hook trả về `guardModal` JSX).

---

## CARD_CLASSNAME — Container chuẩn

```typescript
import { CARD_CLASSNAME } from '@/constants/common';
// CARD_CLASSNAME = 'bg-white pt-4 px-4'

// Trong page:
<div className={CARD_CLASSNAME}>
  <FilterBar />
  <BaseTable ... />
</div>

// Có thể combine thêm class:
<div className={`${CARD_CLASSNAME} p-4 md:p-5`}>
```

---

## forwardRef + useImperativeHandle

Dùng khi parent cần gọi method của child component (ví dụ: page gọi `openCreate()` trong content component).

```tsx
// Content component expose handle
export type IpWhitelistContentHandle = {
  openCreate: () => void;
};

const IpWhitelistContent = forwardRef<IpWhitelistContentHandle>((_props, ref) => {
  const [formModal, setFormModal] = useState({ open: false });

  useImperativeHandle(ref, () => ({
    openCreate: () => setFormModal({ open: true }),
  }));

  return <>{/* ... */}</>;
});

IpWhitelistContent.displayName = 'IpWhitelistContent';

// Page parent
const contentRef = useRef<IpWhitelistContentHandle>(null);
const handleCreate = () => contentRef.current?.openCreate();

return (
  <>
    <BaseButton onClick={handleCreate}>新規作成</BaseButton>
    <IpWhitelistContent ref={contentRef} />
  </>
);
```

---

## Nav Sidebar — Permission-based visibility

Sidebar dùng `usePermissions().canAny()` để ẩn nav items user không có quyền. Nav items khai báo `requiredPermissions` trong `constants/nav.ts`.

```typescript
// constants/nav.ts
export type NavItem = {
  key: string;
  labelJa: string;
  href?: string;
  icon: IconComponent;
  requiredPermissions?: Permission[];  // ← nếu không khai báo → luôn hiển thị
  children?: NavItem[];
};

// Nav component tự filter visibleNavItems dựa trên canAny(item.requiredPermissions)
// Super admin thấy tất cả items (isSuperAdmin = true → bypass mọi check)
```

Sidebar collapse/expand qua state ở `AuthLayout`. Ant Design `Menu` với `ConfigProvider` customize màu sắc.

---

## Component Conventions

```typescript
// ✅ Default export cho lazy-loaded pages
const RoleManagementPage = () => { ... };
export default RoleManagementPage;

// ✅ Named export cho shared components
export const BaseHeadingBreadcrumb = (...) => { ... };

// ✅ Type props rõ ràng, đặt tên theo component
type IpWhitelistFormModalProps = {
  open: boolean;
  isLoading: boolean;
  onSubmit: (values: IpWhitelistFormValues) => void;
  onCancel: () => void;
};
```

---

## Utility Hooks

### useDebouncedValue

```typescript
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

const debouncedSearch = useDebouncedValue(searchTerm, 300);
// Dùng debouncedSearch làm queryKey / queryFn param
```

### useInView

```typescript
import { useInView } from '@/hooks/useInView';

const { ref, isVisible } = useInView(0.5); // threshold
// <div ref={ref}> — isVisible true khi element vào viewport
// Dùng cho lazy load, animation trigger
```

### useCompanyOptions / useSupplierOptions / useProductOptions / useMenuOptions / useCategoryOptions / usePaymentMethodOptions / useFavoriteLatestMonthOptions

Các hook trả về `{ data, isLoading }` cho select options. Mỗi hook wrap 1 `useQuery` + mapping. Dùng để populate dropdown trên form.

---

## useEffect — Dependency rules

```typescript
// ✅ deps đầy đủ
useEffect(() => {
  fetchData(filters);
}, [filters, fetchData]);

// ❌ bỏ sót dep — eslint sẽ warn
useEffect(() => {
  fetchData(filters);
}, []); // filters bị thiếu
```

Không `// eslint-disable-next-line` để bypass warning — fix đúng deps (hoặc dùng `useCallback`/`useMemo` để stable hóa reference nếu cần).
