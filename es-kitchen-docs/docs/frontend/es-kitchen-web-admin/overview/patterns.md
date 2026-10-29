# es-kitchen-web-admin — Patterns & Conventions

> Nguồn = `es-kitchen-web-admin@633b2b7` ngày 2026-10-16. Đã đối chiếu: `services/client/api.ts`, `services/http/handleResponse.ts`, `routes/guards/RequirePermission.tsx`, `components/Common/BaseRichTextEditor`; ngoài ra xác minh lại `hooks/useMutationCustom.ts`, `hooks/useUnsavedChangesGuard.tsx`, `services/query/queryClient.ts`.

**File này nói gì:** các cách làm chuẩn của E03 (System Admin): gọi API, cache, form, bảng, phân quyền, xử lý lỗi và phiên hết hạn.
**Đọc khi nào:** trước khi viết code React mới cho E03. Follow pattern đang có — không tự refactor.
File này cũng là **tài liệu gốc** cho `es-kitchen-web-company` (E02) và `es-kitchen-web-supplier` (E04).

---

## 0. Tình huống → cách xử lý → file mẫu

| Tình huống | Cách xử lý | File / hook mẫu |
|---|---|---|
| Gọi API mới | Thêm hàm export vào service của domain | `services/client/account.service.ts` |
| Lấy dữ liệu để hiển thị | `useQuery` (object syntax) + queryKey là hằng số | `ROLE_LIST_QUERY_KEY` |
| Tạo/sửa/xoá + toast | `useMutationCustom` + `invalidateQueries` | `hooks/useMutationCustom.ts` |
| Trang danh sách có phân trang/lọc | `useTableParams` + `BaseTable` | `pages/material-management/` |
| Trang quá nhiều logic | Tách `use<Domain>Page.ts` | `useMaterialManagementPage.ts` |
| Form tạo/sửa | react-hook-form + yup, `schema.ts` cạnh page | `role-management/create/schema.ts` |
| Rời trang khi form dirty | `useUnsavedChangesGuard` | mọi create/edit page |
| Ẩn nút theo quyền | `usePermissions().can(...)` | trang IP whitelist |
| Chặn cả route theo quyền | `RequirePermission` + `ROUTE_PERMISSIONS` | `routes/guards/` |
| Select tải từ API, cuộn vô hạn | `BaseInfiniteSelect` | `components/Common/Fields/` |
| Phiên hết hạn / 401 | Đã xử lý trong interceptor, không tự xử lý lại | `handleResponse.ts` |
| Kéo thả hàng trong bảng | `useTableRowDragDrop` | `hooks/useTableRowDragDrop.ts` |

---

## 1. HTTP client

**Vấn đề:** mọi request cần cùng token, header, cách xử lý 401 — không muốn lặp ở từng service.

**Cách làm:** tất cả API đi qua một singleton `API` (instance của class `Requester`). Interceptor = đoạn code tự chạy trước mỗi request và sau mỗi response.

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

    // Response interceptor: 401 → AUTH_SESSION_* hoặc đang có session: handleSessionEnded() (SessionEndedModal);
    // chưa có session: clearAuthState(). Xem services/http/handleResponse.ts
    axiosInstance.interceptors.response.use(
      (res) => res.data,
      (error) => { /* ... */ return Promise.reject(error); }
    );
  }
}
const API = new Requester();
export default API;
```

**Bẫy:**
- Response interceptor trả `res.data` → service nhận luôn body, không phải object axios.
- Có flag `disabledToken` cho request không cần Bearer (vd login).
- Đừng sửa `api.ts` cho nhu cầu của một trang.

---

## 2. Service layer

**Vấn đề:** URL và lời gọi API rải rác trong component sẽ khó sửa và khó tái dùng.

**Cách làm:** mỗi domain có 1 file trong `services/client/`. Dùng `const APIs` chứa URL; **mỗi hàm export riêng**. Service chỉ gọi `API`, không chứa hook hay state.

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

**Bẫy:**
- Doc cũ dùng `export const companyService = { ... }`. Code hiện tại là **individual function exports** + `const APIs`. Không tạo service object mới.

---

## 3. TanStack Query v5

**Vấn đề:** cần cache, loading, refetch cho dữ liệu server mà không tự viết state.

**Cách làm:**
- `queryKey` = "tên ngăn kéo" của cache. Cùng key → cùng dữ liệu. Key gồm tên resource + params, nên đổi filter thì tự fetch lại.
- `invalidateQueries` = báo "ngăn kéo này đã cũ" → query tự fetch lại. Gọi sau mỗi mutation thành công.
- **Luôn dùng object syntax (v5).**

```typescript
// ✅ v5 syntax — queryKey + queryFn object
const { data, isLoading, isFetching } = useQuery({
  queryKey: [ROLE_LIST_QUERY_KEY, queryApiParams],
  queryFn: () => fetchRoleList(queryApiParams),
});

// ❌ v4 positional syntax — KHÔNG dùng
useQuery(['companies', filters], () => fetchCompanies(filters));
```

**queryKey convention — luôn export thành hằng số có tên:**

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

**Cấu hình mặc định** (`services/query/queryClient.ts`): `staleTime: 0`, `gcTime: 0`, `retry: 1`, `refetchOnWindowFocus: false`; mutation `retry: 0`.
- `staleTime: 0` + `gcTime: 0` nghĩa là gần như không cache: quay lại trang là gọi lại API.

**Bẫy:**
- Gõ chuỗi trực tiếp trong `queryKey` rồi gõ lệch ở `invalidateQueries` → bảng không refresh. Dùng hằng số.
- `isFetching` ≠ `isLoading`: truyền `isLoading || isFetching` cho bảng để hiện loading cả lúc refetch.

---

## 4. `useMutationCustom` — wrapper chuẩn cho mutation

**Vấn đề:** mỗi mutation đều cần toast lỗi/thành công giống nhau.

**Cách làm:** `src/hooks/useMutationCustom.ts` bọc `useMutation` v5, tự toast. Dùng ở hầu hết mutation. Toast dùng `react-toastify` (`toast.error` / `toast.success`), **không** dùng `App.useApp().message` của AntD. Message lỗi lấy từ `response.data.message`, rồi `error.message`, rồi `ERROR_MESSAGES.INTERNAL_ERROR`.

```typescript
import { useMutationCustom } from '@/hooks/useMutationCustom';

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

```typescript
// ✅ Mutation đơn giản dùng thẳng useMutation (chỉ khi cần toàn quyền kiểm soát error/success)
const { mutate } = useMutation({ mutationFn: ... });
```

**Bẫy:**
- Đã truyền message thì không `toast` thủ công thêm trong `onSuccess`/`onError` → toast đôi.
- Dùng `isPending` (v5), không dùng `isLoading` của mutation.

---

## 5. Bảng có phân trang: `useTableParams`

**Vấn đề:** user lọc/sort/sang trang rồi F5 hoặc gửi link — phải giữ nguyên trạng thái.

**Cách làm:** `src/hooks/useTableParams.ts` đồng bộ page/sort/filters vào URL query string. Dùng cho mọi list page có pagination.

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

**Bẫy:**
- Muốn không đổi URL (vd bảng lồng nhau): `isNotChangeUrl: true` → dùng local state.
- Key filter không khai trong `keyExtraParams` sẽ không lên URL.
- Tên hàm là `handleResetFilers` (đúng chính tả của code, thiếu chữ "t").

---

## 6. Phân quyền: `usePermissions` (RBAC)

**Vấn đề:** mỗi vai trò admin thấy/làm được khác nhau — cả ở cấp trang lẫn cấp nút.

**Cách làm — 3 lớp:**
1. **Route guard** `RequirePermission` (`routes/guards/RequirePermission.tsx`): map route prefix → quyền cần có qua hằng `ROUTE_PERMISSIONS`. Thiếu quyền → redirect `ROUTE.FORBIDDEN`.
2. **Hook `usePermissions`** (`src/hooks/usePermissions.ts`, đọc Redux `auth.permissions`): ẩn/hiện nút.
3. **Sidebar** lọc item theo `requiredPermissions` (xem mục 17).

```typescript
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/constants/permissions';

const { can, canAny, canAll, isSuperAdmin } = usePermissions();

const canCreate = can(PERMISSIONS.SYSTEM_IP_WHITELIST_CREATE);
const canDelete = can(PERMISSIONS.SYSTEM_IP_WHITELIST_DELETE);

{canCreate && <BaseButton onClick={handleCreate}>新規作成</BaseButton>}

// canAny: có ít nhất 1 trong danh sách
// canAll: phải có đủ tất cả
// isSuperAdmin: true → bypass mọi check
```

- Dữ liệu quyền: `auth.permissions.flatPermissions` (mảng string) + `auth.permissions.isSuperAdmin`. Được dispatch qua `setCurrentPermissions(adminPermissions)` sau khi fetch `/admin/me`.

**Bẫy:**
- `SUPER_ADMIN_ONLY_ROUTES` chặn non-super-admin **trước**; super admin bypass phần còn lại.
- Ẩn nút ở UI chưa đủ — backend vẫn phải kiểm quyền (chưa xác minh phía BE trong tài liệu này).

---

## 7. Form chưa lưu: `useUnsavedChangesGuard`

**Vấn đề:** user sửa form rồi lỡ bấm menu/đóng tab → mất dữ liệu.

**Cách làm:** `src/hooks/useUnsavedChangesGuard.tsx` chặn rời trang khi form dirty (dirty = đã bị sửa so với ban đầu). Dùng ở mọi create/edit page có form. Hook trả về `guardModal`, `confirmNavigation`, `confirmDiscard`, `allowNextNavigation`.

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

- `guardModal` render `DiscardChangesModal` (dùng `BaseModalConfirm` type "warning"). Guard cũng bắt `beforeunload` (đóng tab/refresh).

**Bẫy:**
- Quên render `{guardModal}` → guard chặn mà không có modal.
- Sau submit thành công mà navigate thường → vẫn bị chặn. Dùng `allowNextNavigation`.

---

## 8. Kéo thả hàng: `useTableRowDragDrop`

`src/hooks/useTableRowDragDrop.ts` — kéo thả để sắp xếp lại hàng trong bảng.

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

## 9. Redux Toolkit v2 (slice = một mảnh state + các hàm sửa nó)

**Vấn đề:** cần state dùng chung nhiều trang nhưng không phải dữ liệu từ server (đăng nhập, quyền).

**Cách làm:** RTK chỉ dùng cho **client state** — dữ liệu server dùng TanStack Query.

```typescript
// stores/reducers/auth.ts — auth slice hiện tại
type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  status: string;
  user: AuthCurrentUser | null;
  permissions: AdminPermissions | null;   // ← RBAC permissions
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
    setCurrentPermissions(state, action: PayloadAction<AdminPermissions>) {
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

**Bẫy:**
- Token lưu **cookie** (không phải localStorage). Đọc/ghi qua `services/http/authToken.ts`.
- Không nhét dữ liệu danh sách từ API vào Redux.

---

## 10. Luồng đăng nhập, 401, phân quyền

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
  → có errorCode AUTH_SESSION_* hoặc đang có accessToken: handleSessionEnded() → SessionEndedModal
  → chưa có session: clearAuthState() → status UNAUTHENTICATED → RequireAuth redirect /login

Permission check mỗi route
  → RequirePermission guard đọc ROUTE_PERMISSIONS[pathname]
  → canAny(required) → render | redirect ROUTE.FORBIDDEN; SUPER_ADMIN_ONLY_ROUTES chặn non-super-admin trước; super admin bypass
```

---

## 11. Routing

**Vấn đề:** vừa cần trang public/private, vừa cần chặn theo quyền, vừa cần tải trang theo nhu cầu.

**Cách làm:** `createBrowserRouter`; guard = route cha không có `path`, chỉ có `element`, bọc các route con.

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

- Hằng số route ở `constants/route.ts` — luôn dùng `ROUTE.xxx`, không gõ chuỗi trực tiếp.
- **Lazy loading bắt buộc** (trang chỉ tải khi mở) với `withSuspense()`:

```typescript
const RoleManagementPage = lazy(() => import('@/pages/account-management/role-management/page'));
// Dùng: withSuspense(<RoleManagementPage />)
```

**Checklist thêm trang:** tạo `pages/<domain>/page.tsx` (default export) → thêm `ROUTE.xxx` → lazy import + route trong `routes/index.tsx` → nếu cần quyền: khai trong `ROUTE_PERMISSIONS` và `requiredPermissions` của nav.

---

## 12. Cấu trúc một page

```
pages/<domain>/
├── page.tsx                         ← Entry point (list page) — gọi hooks, render UI
├── _column<Domain>.tsx              ← Column definitions (factory function)
├── constants.ts                     ← QUERY_KEY, enums, tab items
├── helpers.ts                       ← Pure helper functions
├── hooks/
│   └── use<Domain>Page.ts           ← Page-level hook (xem mục 13)
├── components/
│   ├── FormSearch.tsx               ← Filter bar
│   └── search.constants.ts         ← INITIAL_SEARCH_VALUES, types
└── [id]/
    ├── page.tsx                     ← Detail page entry
    ├── schema.ts                    ← Yup schema (co-located)
    └── hooks/
        └── use<Domain>DetailPage.ts
```

Ví dụ thực tế: `pages/material-management/`, `pages/order-management/`, `pages/waste-disposal-management/`.

---

## 13. Page-level hook

**Vấn đề:** list page phức tạp (filter + bảng + modal xoá + tab) làm `page.tsx` dài, khó đọc.

**Cách làm:** tách toàn bộ logic ra `pages/<domain>/hooks/use<Domain>Page.ts`; `page.tsx` chỉ gọi hook và render. Thấy ở: material, order, collection, waste-disposal, sales (3 tab), delivery-schedule, inventory, contract-detail.

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

## 14. Định nghĩa cột bảng

**Cách làm:** tách ra `_column<Domain>.tsx` cạnh page. Export một factory function nhận callback.

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

## 15. Form: react-hook-form v7 + yup

**Vấn đề:** form cần validate, hiển thị lỗi và submit nhất quán.

**Cách làm:**
- Schema đặt trong `schema.ts` **cạnh page/component dùng nó**, KHÔNG gom vào `validation/schemas.ts`. File `validation/schemas.ts` chỉ chứa auth schemas (login, forgot-password, reset-password, OTP).

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

**FormProvider** = cho form dùng chung cho cây component sâu (không phải truyền `form` qua props):

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

**Nút Submit tách khỏi form** (dùng thuộc tính `form` = id của form):

```typescript
<form id="role-create-form" onSubmit={form.handleSubmit(handleSubmit)}>
  {/* ... */}
</form>

// Button ở nơi khác (header) nhưng submit đúng form
<BaseButton htmlType="submit" form="role-create-form" loading={isPending}>
  保存
</BaseButton>
```

**Bẫy:**
- Không dùng yup cho form tìm kiếm (chỉ filter) — xem mục 13.
- Không dùng Formik hay `Form.Item rules` của AntD (ràng buộc stack).

---

## 16. Ant Design v6 — lưu ý breaking changes

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

Dùng component AntD mới: kiểm tra docs v6 trước — API có thể khác v5.

---

## 17. Component dùng chung

### BaseHeadingBreadcrumb

Header chuẩn của mọi page: breadcrumb + title + chỗ cho nút bên phải (children).

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

Select cuộn vô hạn + tìm kiếm phía server (debounce). Dùng cho mọi select lấy dữ liệu từ API.

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

Dùng `useInfiniteQuery` nội bộ. Tự debounce search 300ms. Tự giữ label cache khi cuộn qua các page.

### BaseRichTextEditor

Rich text editor (Quill 2 — `quill` + `quill/dist/quill.snow.css`; TipTap đã bỏ khỏi `package.json`). Dùng cho nội dung notification, mô tả dài.

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

Modal xác nhận huỷ thay đổi. Dùng qua `useUnsavedChangesGuard` — không render trực tiếp (hook trả về `guardModal`).

### CARD_CLASSNAME — container chuẩn

```typescript
import { CARD_CLASSNAME } from '@/constants/common';
// CARD_CLASSNAME = 'bg-white pt-4 px-4'

<div className={CARD_CLASSNAME}>
  <FilterBar />
  <BaseTable ... />
</div>

// Có thể ghép thêm class:
<div className={`${CARD_CLASSNAME} p-4 md:p-5`}>
```

### forwardRef + useImperativeHandle

Dùng khi component cha cần gọi hàm của con (ví dụ: header của page bấm nút → mở modal nằm trong content).

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

### Sidebar — hiển thị theo quyền

Sidebar dùng `usePermissions().canAny()` để ẩn mục user không có quyền. Mục menu khai `requiredPermissions` trong `constants/nav.ts`.

```typescript
// constants/nav.ts
export type NavItem = {
  key: string;
  labelJa: string;
  href?: string;
  icon: IconComponent;
  requiredPermissions?: Permission[];  // ← không khai báo → luôn hiển thị
  children?: NavItem[];
};

// Nav component tự lọc visibleNavItems dựa trên canAny(item.requiredPermissions)
// Super admin thấy tất cả (isSuperAdmin = true → bypass mọi check)
```

Thu gọn/mở rộng sidebar qua state ở `AuthLayout`. Ant Design `Menu` + `ConfigProvider` tuỳ chỉnh màu.

---

## 18. Quy ước component

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

## 19. Hook tiện ích

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

### Hook options cho dropdown

`useCompanyOptions` / `useSupplierOptions` / `useProductOptions` / `useMenuOptions` / `useCategoryOptions` / `usePaymentMethodOptions` / `useFavoriteLatestMonthOptions`… trả về `{ data, isLoading }`. Mỗi hook bọc 1 `useQuery` + mapping. Dùng để đổ dữ liệu vào dropdown trên form.

---

## 20. `useEffect` — luật dependency

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

Không dùng `// eslint-disable-next-line` để bỏ warning — sửa đúng deps (hoặc `useCallback`/`useMemo` để ổn định reference).
