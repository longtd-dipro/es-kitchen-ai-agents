# DESIGN: Admin Role & Permission — es-kitchen-api

> **SPEC:** `es-kitchen-docs/docs/features/admin-role-permission/SPEC.md`
> **Liên quan:** `admin-account-management/es-kitchen-api/DESIGN.md` (đã reference bảng `admin_roles` + `admin_role_permissions` cần tạo)
> **Date:** 2026-06-02
> **Status:** Draft — phụ thuộc OQ Critical (xem cuối file)

---

## 0. Phân tích trạng thái hiện tại

| Artifact | File | Note |
|---|---|---|
| Entity `Admin` | `src/entities/admin.entity.ts` | Có cột `role: varchar(255) nullable` raw string (vd `"ADMIN"`, `"SUPPER_ADMIN"`) |
| Guard `AdminGuard` | `src/modules/admin/guards/admin.guard.ts` | Strategy `admin-jwt`, chưa kiểm permission chi tiết |
| Service `AuthService` | `src/modules/admin/services/auth.service.ts` | JWT payload chỉ có `adminId + role string` |
| `AdminRole`, `Permission` table | — | **Chưa có** |

**Vấn đề:** Permission check hiện tại dựa raw string → không scale với 16 OQ về role granularity, conflict resolution, dynamic permission tree.

---

## 1. Tổng quan thay đổi

| Layer | File | Action |
|---|---|---|
| Migration | `src/database/migrations/<ts>-create-admin-roles-permissions.ts` | NEW |
| Migration | `src/database/migrations/<ts>-migrate-admin-role-to-relation.ts` | NEW (data migration) |
| Entity | `src/entities/admin-role.entity.ts` | NEW |
| Entity | `src/entities/admin-permission.entity.ts` | NEW |
| Entity | `src/entities/admin-role-permission.entity.ts` | NEW (junction) |
| Entity | `src/entities/admin-account-role.entity.ts` | NEW (junction, max 2 roles) |
| Entity | `src/entities/admin.entity.ts` | EDIT — deprecate `role` field (giữ tạm, nullable) |
| Module | `src/modules/admin/role-permission/role-permission.module.ts` | NEW |
| Service | `RolePermissionService` | NEW |
| Service | `PermissionResolverService` (Redis cache) | NEW |
| Controller | `RolePermissionController` (CRUD role) | NEW |
| Guard | `PermissionGuard` (decorator `@RequirePermission(...)`) | NEW |
| Cache | Redis keys `admin:perm:<adminId>` | NEW |

---

## 2. Database Changes

### 2.1 `admin_permissions` — Master list (seed từ migration)

```
PK: bigint id
Cols:
  code           varchar(100) UNIQUE   -- vd "order.create", "supplier.delete"
  module         varchar(50)            -- "order" / "supplier" / "report" ...
  name_jp        varchar(255)
  name_vi        varchar(255)
  description    text NULL
  is_system      bool DEFAULT true      -- TRUE = ko cho admin xóa
  created_at     timestamptz
```

> Permission seed = enum được dev maintain, không cho admin tạo permission mới qua UI (OQ-11 — granularity per module).

### 2.2 `admin_roles`

```
PK: bigint id
Cols:
  role_name      varchar(100)
  description    text NULL
  is_system      bool DEFAULT false     -- TRUE = role "Super Admin" built-in (OQ-9)
  created_by     bigint FK → admins.id NULL
  created_at, updated_at, deleted_at (soft delete)
Index:
  idx_admin_roles_name_active UNIQUE (role_name) WHERE deleted_at IS NULL
```

### 2.3 `admin_role_permissions` (junction)

```
PK: composite (role_id, permission_id)
Cols:
  role_id        bigint FK → admin_roles.id ON DELETE CASCADE
  permission_id  bigint FK → admin_permissions.id ON DELETE CASCADE
  granted_at     timestamptz
```

### 2.4 `admin_account_roles` (junction)

```
PK: composite (admin_id, role_id)
Cols:
  admin_id       bigint FK → admins.id ON DELETE CASCADE
  role_id        bigint FK → admin_roles.id ON DELETE RESTRICT (block delete role nếu còn assign)
  assigned_by    bigint FK → admins.id NULL
  assigned_at    timestamptz
Constraint (DB-level):
  CHECK: (SELECT COUNT(*) FROM admin_account_roles WHERE admin_id = NEW.admin_id) <= 2
  -- Hoặc enforce ở Service layer (đề xuất ở Service)
```

### 2.5 Migration data từ `admins.role` raw

- Seed roles built-in từ `admins.role` distinct values hiện có (`"SUPPER_ADMIN"`, `"ADMIN"`, etc.) → tạo row trong `admin_roles` với `is_system=true`
- Tạo `admin_account_roles` map từng admin → role tương ứng
- Giữ cột `admins.role` (nullable, deprecated) — fallback đọc khi migration chưa hoàn tất

### 2.6 Redis Cache

| Key | Value | TTL | Invalidate khi |
|---|---|---|---|
| `admin:perm:<adminId>` | `Set<string>` permission codes của admin | 5 phút | Role assignment thay đổi (OQ-2), permission role thay đổi |
| `admin:role:<roleId>:permissions` | `Set<string>` | 10 phút | Permission của role update |

---

## 3. API Contract

Tất cả endpoints prefix `/admin/role-permissions`, guard `AdminGuard` + `@RequirePermission('admin.role.manage')`.

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/role-permissions/permissions` | List tất cả permission (cho UI tree) |
| GET | `/admin/role-permissions/roles` | List roles (filter, paginate) |
| GET | `/admin/role-permissions/roles/:id` | Detail role + assigned permissions + admin count |
| POST | `/admin/role-permissions/roles` | Create role + assign permissions |
| PUT | `/admin/role-permissions/roles/:id` | Update role name/desc/permissions |
| DELETE | `/admin/role-permissions/roles/:id` | Soft delete (block nếu còn assign — trả 409) |
| POST | `/admin/role-permissions/admins/:adminId/roles` | Assign roles (max 2) cho admin — body `{ roleIds: [1, 2] }` |
| GET | `/admin/role-permissions/me/permissions` | Lấy permission của admin đang login (cho FE menu visibility) |

**DTO chính:** `CreateRoleDto { roleName, description?, permissionIds: number[] }`

**Validation:** `class-validator` — roleName length 1-100, permissionIds non-empty (OQ-4 sẽ chốt cho phép role rỗng hay không).

---

## 4. Service Layer

### 4.1 `RolePermissionService`

```typescript
createRole(dto, actorAdminId): Promise<AdminRole>
  // validate unique name (active)
  // start txn
  // insert admin_roles
  // bulk insert admin_role_permissions
  // commit

updateRole(roleId, dto, actorAdminId)
  // diff permissions added/removed
  // bulk insert/delete
  // invalidate Redis: admin:role:<roleId>:permissions
  // invalidate tất cả admin có role này: admin:perm:<adminId> (query admin_account_roles)

deleteRole(roleId)
  // check còn admin assign → throw ConflictException
  // soft delete

assignRolesToAdmin(adminId, roleIds: number[])
  // validate roleIds.length <= 2 (Service-level enforce)
  // txn: delete old admin_account_roles, insert new
  // invalidate admin:perm:<adminId>
```

### 4.2 `PermissionResolverService`

```typescript
getEffectivePermissions(adminId): Promise<Set<string>>
  // 1. Try Redis: admin:perm:<adminId>
  // 2. Cache miss → query admin_account_roles JOIN admin_role_permissions JOIN admin_permissions
  // 3. Apply conflict resolution rule (OQ-5: union vs intersection — DEFAULT proposed = UNION)
  // 4. Cache 5 phút
  // 5. Return Set
```

### 4.3 `PermissionGuard`

```typescript
@Injectable()
export class PermissionGuard implements CanActivate {
  canActivate(ctx) {
    const required = Reflect.getMetadata('permission', ctx.getHandler());
    const adminId = ctx.switchToHttp().getRequest().user.id;
    const perms = await this.resolver.getEffectivePermissions(adminId);
    return perms.has(required);
  }
}

// Decorator usage:
@RequirePermission('order.create')
@Post('/orders')
createOrder() {...}
```

---

## 5. Interface với repo khác

| Repo | Cần gì |
|---|---|
| `es-kitchen-web-admin` | Gọi `/admin/role-permissions/*` để CRUD; gọi `/admin/role-permissions/me/permissions` ngay sau login để render menu/button |

---

## 6. Luồng xử lý chính — Admin tạo role mới

```
1. FE → POST /admin/role-permissions/roles { roleName, permissionIds }
2. PermissionGuard check admin có "admin.role.manage" → pass
3. RolePermissionService.createRole():
   a. Validate name unique
   b. BEGIN TXN
   c. INSERT admin_roles
   d. INSERT admin_role_permissions × N
   e. COMMIT
4. (Không cần invalidate Redis vì role mới chưa assign cho admin nào)
5. Return DTO { id, roleName, permissions: [...] }
```

---

## 7. Non-Regression Risks

| Tính năng hiện có | File | Rủi ro | Mitigation |
|---|---|---|---|
| `AdminGuard` đọc `admins.role` raw | `src/modules/admin/guards/admin.guard.ts` | Migration `admins.role` → relation có thể break check role string | Giữ cột `admins.role` nullable; fallback đọc nếu `admin_account_roles` rỗng |
| `AuthService.login` set JWT payload `{ role: admin.role }` | `src/modules/admin/services/auth.service.ts` | JWT cũ vẫn dùng role string, có thể conflict với permission check mới | Phase 1: JWT giữ field cũ + add `permissions: []` cache; Phase 2: bỏ field role |
| `account.controller.ts` các endpoint check role manual | `src/modules/admin/http/controllers/account.controller.ts` | Đổi sang `@RequirePermission` có thể bỏ sót endpoint | Audit toàn bộ admin controllers — refactor dần per endpoint |
| `bulk-issue-account.service.ts` | (ref tilth) | Nếu tạo account batch + assign role string raw → conflict | Update batch flow tạo cả `admin_account_roles` record |

> **BẮT BUỘC chạy `tilth_deps` trên `admin.entity.ts` và `admin.guard.ts` trước khi deploy migration.**

---

## 8. Open Questions block design

Trong SPEC, các OQ sau **phải chốt trước khi implement**:
- **OQ-2**: Sửa permission → instant refresh JWT hay đợi re-login → ảnh hưởng `PermissionResolverService` cache strategy
- **OQ-5**: Conflict resolution (union/intersection) → ảnh hưởng `getEffectivePermissions` logic
- **OQ-7**: Super Admin tự xóa role của mình — DB constraint hay Service-level check
- **OQ-8/9**: Built-in roles từ `role_list.xlsx` → cần list cụ thể để seed migration
- **OQ-14**: Data scope per admin (company isolation) → có ảnh hưởng đến `Permission.code` granularity
