# es-kitchen-web-admin — Patterns & Conventions

> Đọc file này trước khi viết code React mới cho E03. Follow pattern đang có — không tự refactor.

---

## 1. Lazy loading + Suspense

Mọi page dùng `lazy()` với `Suspense` fallback (`BaseLoading`).

```tsx
const DashboardPage = lazy(() => import('@pages/dashboard/DashboardPage'));

<Suspense fallback={<BaseLoading />}>
  <DashboardPage />
</Suspense>
```

Có helper `withSuspense()` để wrap và apply class name cho loader.

---

## 2. Route guards — 3 tầng

| Guard | Vai trò |
|---|---|
| `PublicOnly` | Redirect authenticated user khỏi trang login/auth |
| `RequireAuth` | Redirect unauthenticated user về `/login`, show `BaseLoading` khi đang check session |
| `RequirePermission` | Nested guard — check `usePermissions()` cho từng route protected |

Config trong `src/routes/index.tsx`. Không tự bypass guard cho trang mới.

---

## 3. Redux — chỉ cho client/UI state

- `auth`, `counter`, `monthlyMenuImport` — client state
- **Server state qua TanStack Query** — không đưa vào Redux
- **Auth bootstrap:** `bootstrapAuthStateFromCookies()` dispatch trong `main.tsx` trước render

Không thêm slice mới cho data fetch từ API — dùng `useQuery`.

---

## 4. TanStack Query v5 — object syntax bắt buộc

```tsx
// ✅ Đúng
const { data } = useQuery({
  queryKey: ['orders', filters],
  queryFn: () => orderService.list(filters),
});

// ❌ v4 positional — SAI
const { data } = useQuery(['orders'], () => orderService.list());
```

**Config mặc định** (`services/query/queryClient.ts`):
`staleTime: 0` · `gcTime: 0` · `retry: 1` · `refetchOnWindowFocus: false`

Override per query khi cần cache dài.

---

## 5. Mutation — `useMutationCustom`

Wrapper trong `hooks/useMutationCustom.ts` chuẩn hoá error/success handling — dùng thay `useMutation` raw để không lặp code toast/error.

```tsx
const { mutate } = useMutationCustom({
  mutationFn: orderService.create,
  successMessage: 'Order created',
});
```

---

## 6. Forms — react-hook-form + Yup

- Schema Yup trong `src/validation/`
- `resolver: yupResolver(schema)` khi khai báo `useForm`
- Không dùng AntD `Form.Item` rules native — dùng `Controller` từ react-hook-form kết hợp AntD input

```tsx
const { control, handleSubmit } = useForm({ resolver: yupResolver(schema) });
```

---

## 7. HTTP interceptors — không tự thêm token

- **Request interceptor:** tự động add `Authorization: Bearer <token>` + timezone header
- **Response interceptor:** unwrap `data` envelope + trigger `sessionEnded` khi 401

Trong service không cần gắn token/header manual — chỉ gọi `axios.get(...)`.

---

## 8. API service pattern — `src/services/client/*`

Mỗi domain một file service (`auth.service.ts`, `order.service.ts`, …) export các function pure return `Promise<T>` — không class.

```typescript
// services/client/order.service.ts
export const orderService = {
  list: (params: ListParams) => api.get<Paginated<Order>>('/orders', { params }),
  detail: (id: string) => api.get<Order>(`/orders/${id}`),
};
```

---

## 9. Session monitoring — socket.io

`useAdminSessionSocket()` chạy trong `AuthBootstrap` component:

- Connect socket khi authenticated
- Lắng nghe `session:ended` → dispatch action → `SessionEndedModal` hiển thị lý do logout (đăng nhập từ device khác, admin revoke, …)

Không tự viết socket connection cho page cụ thể — dùng hook này.

---

## 10. Path aliases — luôn dùng, không relative `../..`

Import phải qua alias (`@components`, `@services`, …). Không dùng `../../../pages/...`.

---

## 11. Column-scoped table state — `useTableParams`

```tsx
const { params, onChange } = useTableParams({
  defaultPageSize: 20,
  defaultSort: { field: 'createdAt', order: 'descend' },
});

<Table {...} pagination={params.pagination} onChange={onChange} />
```

Query key derive từ `params` để tự động refetch khi user đổi page/sort/filter.

---

## 12. Drag-drop tables — `@dnd-kit`

`useTableRowDragDrop` cho các bảng cần reorder (menu items, monthly menu, …). Không viết drag handler manual.

---

## 13. Unsaved changes guard

`useUnsavedChangesGuard(isDirty)` cảnh báo user khi rời trang có form đang chỉnh sửa. Bật cho mọi form CRUD lớn.

---

## 14. Toast — `react-toastify`

- Global `ToastContainer` mount trong `main.tsx`
- Dùng `toast.success()` / `toast.error()` — không dùng AntD `message` cho global toast (giữ nhất quán)
- AntD `message`/`notification` chỉ dùng cho modal-local feedback qua `AntdApp` context

---

## 15. Rich text — TipTap

Editor dùng TipTap (`starter-kit`, `text-align`) trong notification/announcement/marketing content. Không thêm library rich text khác.

---

## 16. Charts — recharts

Dashboard analytics dùng `recharts`. Không dùng Chart.js/ECharts/D3 khác.

---

## 17. Component export

Named export ưu tiên. Interface Props đặt cùng file:

```tsx
interface OrderCardProps { orderId: string; }
export const OrderCard: React.FC<OrderCardProps> = ({ orderId }) => { ... };
```

Không default export cho component thường — trừ page (để lazy load ergonomic).

---

## 18. Env vars — `import.meta.env.VITE_*`

- Không hard-code URL trong code
- Prefix bắt buộc `VITE_` (Vite convention)
- Xem `.env.example` để tra danh sách var hợp lệ

---

## 19. Không dùng

- ❌ `useEffect` cho data fetching — dùng `useQuery`
- ❌ Context API cho auth/global state — dùng Redux
- ❌ TanStack Query v4 positional syntax
- ❌ Native AntD `Form` validation rules cho form phức tạp — dùng react-hook-form
- ❌ Chart.js / ECharts — dùng recharts
- ❌ Zustand / Jotai — dùng Redux Toolkit
- ❌ `localStorage` cho JWT — dùng cookie (js-cookie)
