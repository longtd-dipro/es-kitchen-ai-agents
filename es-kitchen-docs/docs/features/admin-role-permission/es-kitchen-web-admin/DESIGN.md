# DESIGN: Admin Role & Permission — es-kitchen-web-admin

> **SPEC:** `es-kitchen-docs/docs/features/admin-role-permission/SPEC.md`
> **API DESIGN:** `../es-kitchen-api/DESIGN.md`
> **Date:** 2026-06-02

---

## 1. Tổng quan thay đổi

| Layer | File | Action |
|---|---|---|
| Page | `src/pages/system/role-permissions/RoleListPage.tsx` | NEW |
| Page | `src/pages/system/role-permissions/RoleEditPage.tsx` | NEW |
| Component | `src/components/role-permission/PermissionTree.tsx` | NEW |
| Component | `src/components/role-permission/RoleAssignDrawer.tsx` | NEW (gán role cho admin từ Account Management) |
| Hook | `src/hooks/role-permission/useRoles.ts` | NEW |
| Hook | `src/hooks/role-permission/usePermissions.ts` | NEW |
| Hook | `src/hooks/role-permission/useMyPermissions.ts` | NEW (cached, dùng cho menu visibility) |
| Store | `src/store/slices/permissionsSlice.ts` | NEW (client state — current admin's permissions set) |
| Service | `src/services/role-permission.service.ts` | NEW (axios wrappers) |
| Route | `src/router/index.tsx` | EDIT — thêm `/system/role-permissions` |
| Layout | `src/layouts/AdminLayout.tsx` | EDIT — wrap menu items với `<RequirePermission>` |

---

## 2. State Management

| State | Loại | Lý do |
|---|---|---|
| Danh sách roles (paginated) | TanStack Query | Server state, cache theo filter |
| Detail role + permissions | TanStack Query | Server state |
| **Permissions của admin đang login** | Redux Toolkit (`permissionsSlice`) | Client state global, đọc khắp app để ẩn menu/button |
| Permissions master tree | TanStack Query, `staleTime: Infinity` | Hiếm khi đổi, load 1 lần |

### permissionsSlice

```typescript
interface PermissionsState {
  codes: Set<string>;
  loading: boolean;
  loaded: boolean;
}
// Action: setPermissions(codes), clearPermissions() (on logout)
```

Load qua `useMyPermissions` ngay sau khi auth state thành công → dispatch vào slice.

---

## 3. Components chính

### 3.1 `<RequirePermission code="...">`

```tsx
const RequirePermission: FC<{ code: string; children: ReactNode; fallback?: ReactNode }> = ({code, children, fallback}) => {
  const has = useSelector((s) => s.permissions.codes.has(code));
  return has ? <>{children}</> : (fallback ?? null);
};
```

Dùng bọc menu, button, route guard.

### 3.2 `<PermissionTree>` (Ant Design Tree)

- Source: `useQuery(['permissions', 'all'])` lấy từ `GET /admin/role-permissions/permissions`
- Group theo `module` → tạo tree:
  ```
  ▸ Order Management
    □ order.view
    □ order.create
    □ order.cancel
  ```
- Checkable, expand/collapse
- Output: `permissionIds: number[]`

### 3.3 RoleListPage

- AntD Table columns: Tên / Mô tả / Số quyền / Số admin gán / Action
- Search + filter (OQ-1)
- Action buttons: Edit, Delete (popup confirm), Add new
- Delete có popup warning + nếu API 409 → hiển thị danh sách admin đang assign

### 3.4 RoleEditPage

- Form react-hook-form + yup:
  - `roleName`: required, min 1 max 100
  - `description`: optional, max 500
  - `permissionIds`: array, validation theo OQ-4 (nếu bắt buộc ≥1 thì add min(1))
- `<PermissionTree>` để check/uncheck
- Submit: `POST` (create) hoặc `PUT` (update)
- Popup confirm trước submit (Common Rules)

---

## 4. Routing

```typescript
{
  path: '/system/role-permissions',
  element: <RequirePermission code="admin.role.manage" fallback={<Forbidden />}><RoleListPage /></RequirePermission>,
},
{
  path: '/system/role-permissions/new',
  element: <RequirePermission code="admin.role.manage"><RoleEditPage mode="create" /></RequirePermission>,
},
{
  path: '/system/role-permissions/:id/edit',
  element: <RequirePermission code="admin.role.manage"><RoleEditPage mode="edit" /></RequirePermission>,
}
```

---

## 5. Interface với repo khác

| Repo | Endpoint gọi |
|---|---|
| `es-kitchen-api` | `GET /admin/role-permissions/permissions` · `GET /admin/role-permissions/roles` · `GET /:id` · `POST /roles` · `PUT /:id` · `DELETE /:id` · `POST /admins/:adminId/roles` · `GET /me/permissions` |

---

## 6. Luồng — Login → Load permissions → Render menu

```
1. User login → /admin/auth/login → nhận JWT
2. App init (sau khi có JWT):
   - useMyPermissions() → GET /admin/role-permissions/me/permissions
   - Response: { codes: ["order.view", "order.create", ...] }
   - dispatch(setPermissions(codes))
3. AdminLayout render menu items, mỗi item wrap <RequirePermission code="...">
4. Item nào không có code trong store → ẩn (return null)
5. Route guard cùng cơ chế
```

---

## 7. Non-Regression Risks

| Tính năng hiện có | File | Rủi ro | Mitigation |
|---|---|---|---|
| Menu admin hiện check `role === 'SUPPER_ADMIN'` raw string | `src/layouts/AdminLayout.tsx` (giả định) | Đổi sang `<RequirePermission>` có thể ẩn sai menu | Phase migration: giữ song song cả 2 check (`role === 'SUPPER_ADMIN'` OR `permissions.has(...)`) trong thời gian transition |
| Page nào hiện hardcode check role | (cần grep) | Như trên | Audit từng page, refactor cùng PR |
| Routes hiện không có permission guard | `src/router/index.tsx` | User old session có thể vào page mới mà không có quyền | API enforce permission → trả 403 → FE hiển thị Forbidden |

---

## 8. Open Questions block design

- **OQ-12** (SPEC): UI ẩn button hay disable + tooltip → ảnh hưởng `<RequirePermission>` API (cần thêm prop `mode="hide" | "disable"`)
- **OQ-11**: Granularity per module hay per endpoint → ảnh hưởng tree structure
