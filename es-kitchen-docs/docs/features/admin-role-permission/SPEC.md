# SPEC: Admin Role & Permission Management

> **Loại:** Single-repo (E03 System Admin Web + API)
> **Repos liên quan:** `es-kitchen-api` · `es-kitchen-web-admin` (E03)
> **Actor chính:** System Admin / Super Admin (E03)
> **Ngày:** 2026-06-02
> **Status:** Draft — nhiều Open Questions
> **Source:** `es-kitchen-requirements/role_permission/requirement.md` (section 3 "Access control") + `role_list.xlsx`
> **Liên quan:** SPEC `admin-account-management` (gán role cho account), SPEC `ip-whitelist` (lớp bảo mật song song)

---

## 1. Mô tả nghiệp vụ

Hệ thống admin có cơ chế **Role-Based Access Control (RBAC)**:

- **Role** = bộ quyền được nhóm sẵn (vd "Order Manager", "Supplier Manager", "Read-only Auditor")
- **Permission** = quyền hạn cụ thể (xem / tạo / sửa / xóa / export... per module)
- **Mỗi admin account** được gán **1-2 role** (giới hạn từ requirement)

Super Admin có thể tạo / sửa / xóa role và cấu hình permission cho từng role.

---

## 2. Actors & Preconditions

| Actor | Vai trò | Precondition |
|---|---|---|
| Super Admin (E03) | Quản lý roles + permissions | Có root role "Role Management" |
| Admin user (E03) được gán role | Sử dụng quyền theo role | Đã có account + role assigned |

---

## 3. Happy Path — Xem danh sách Role

1. Super Admin vào **System → Roles & Permissions**
2. Hiển thị danh sách roles:

| Tên role | Mô tả | Số quyền | Số admin đang gán | Action |
|---|---|---|---|---|
| Order Manager | Quản lý order toàn hệ thống | 24 | 5 | Edit / Delete |

3. *OQ-1: filter / search role theo gì?*

## 4. Happy Path — Tạo Role mới

1. Click **Add Role** → form:
   - Tên role (unique, validate)
   - Mô tả (optional)
   - **Permissions** — danh sách quyền dạng tree theo module:
     ```
     ▸ Order Management
       □ View order
       □ Create order
       □ Edit order
       □ Cancel order
       □ Export order list
     ▸ Customer Management
       □ View customer
       □ ...
     ```
2. Check/uncheck permission → Save
3. Popup warning + confirm
4. Confirm → tạo role → hiển thị trong list

## 5. Happy Path — Edit Role

1. Click **Edit** trên row → form pre-fill
2. Sửa permission (thêm/bớt checkbox) hoặc đổi tên/mô tả
3. Save → popup confirm
4. *OQ-2: admin đang có role này — quyền cập nhật ngay (session active) hay đến lần login tiếp?*

## 6. Happy Path — Delete Role

1. Click **Delete** → popup warning + confirm
2. Validate: nếu role đang được gán cho ≥1 admin → block, yêu cầu unassign trước *(OQ-3)*
3. Confirm → logical delete

## 7. Happy Path — Sử dụng quyền

1. Admin login → JWT chứa role(s) → API + Web load permissions
2. UI: menu / button bị ẩn nếu không có permission
3. API: middleware check permission, trả 403 nếu thiếu

---

## 8. Alternative Flows & Edge Cases

| Tình huống | Xử lý |
|---|---|
| Tạo role tên trùng | Error inline "Role đã tồn tại" |
| Tạo role không check permission nào | *OQ-4: cho phép tạo role rỗng hay bắt buộc ≥1 permission?* |
| Admin có 2 role với permission conflict | *OQ-5: union (allow takes precedence) hay intersection (deny takes precedence)?* — phải đồng bộ với SPEC `admin-account-management` OQ-12 |
| Delete role có admin đang gán | Block + show danh sách admin để unassign trước |
| Sửa permission của role → admin đang có session | *OQ-2: instant refresh hay đợi re-login?* |
| Permission mới được thêm vào hệ thống (do dev release) | Default OFF cho mọi role hiện có *(OQ-6)* |
| Permission cũ bị xóa (deprecated) | Tự ẩn khỏi role config, audit log lại |
| Super Admin tự xóa role của chính mình | *OQ-7: block self-strip role?* |
| 1 admin chỉ được gán 1-2 role theo requirement | Validate khi gán: nếu đã có 2 role + thêm role 3 → block |
| Role được dùng trong audit log nhưng đã bị delete | Hiển thị tên cũ + "(deleted)" |

---

## 9. Acceptance Criteria

| # | Criteria |
|---|---|
| AC-01 | Super Admin xem được danh sách tất cả role hiện có |
| AC-02 | Super Admin có thể tạo role mới với tên unique + chọn permissions từ tree |
| AC-03 | Super Admin có thể sửa permission / tên / mô tả của role |
| AC-04 | Super Admin có thể delete role; bị block nếu role đang được gán cho admin |
| AC-05 | Mỗi admin được gán tối đa 2 role |
| AC-06 | Permission được tổ chức dạng tree theo module/resource |
| AC-07 | Hệ thống enforce permission ở BE (API middleware) và FE (UI ẩn menu/button) |
| AC-08 | Khi role rỗng → admin chỉ thấy / làm được tính năng cơ bản (login/logout/profile) |
| AC-09 | Audit log: ai tạo/sửa/xóa role, khi nào, permission gì đổi |
| AC-10 | Action Add/Edit/Delete có popup warning + confirm |
| AC-11 | Permission mới (do dev release) — mặc định OFF cho mọi role cũ |
| AC-12 | Quy tắc conflict 2 role: thống nhất với SPEC `admin-account-management` OQ-12 |

---

## 10. Open Questions — Cần confirm

| # | Câu hỏi | Tầm quan trọng |
|---|---|---|
| OQ-1 | Filter / search role theo gì? Sort? Pagination? | 🟠 Medium |
| OQ-2 | Sửa permission role → admin đang session: instant refresh JWT hay đợi re-login? | 🔴 Critical |
| OQ-3 | Delete role có admin đang gán: block + yêu cầu unassign trước, hay tự động unassign? | 🟡 High |
| OQ-4 | Cho phép tạo role rỗng (0 permission) không? | 🟠 Medium |
| OQ-5 | 2 role conflict: allow takes precedence (union) hay deny takes precedence (intersection)? Đồng bộ admin-account-management OQ-12 | 🔴 Critical |
| OQ-6 | Permission mới (do dev release) — default OFF? Có notification cho Super Admin biết để config? | 🟡 High |
| OQ-7 | Super Admin tự xóa role chính mình đang có — block? | 🔴 Critical |
| OQ-8 | `role_list.xlsx` — list role nào đã có (built-in) hay tất cả do Super Admin tạo từ đầu? | 🔴 Critical (cần đọc xlsx) |
| OQ-9 | Có role "Super Admin" / "System Admin" built-in không thể xóa không? | 🔴 Critical |
| OQ-10 | Role cũ trong audit log hiển thị thế nào khi đã bị xóa? (giữ tên cũ + flag deleted?) | 🟠 Medium |
| OQ-11 | Permission tree — granularity: per module hay per endpoint? | 🟡 High |
| OQ-12 | UI: chỉ ẩn button / menu, hay disable + tooltip "Không có quyền"? | 🟠 Medium |
| OQ-13 | Có cơ chế "tạm thời ủy quyền role" (temporary role assignment có expiry) không? | 🟠 Low |
| OQ-14 | Có phân quyền theo data scope không (vd Admin A chỉ thấy company B, C — không phải tất cả)? | 🟡 High |
| OQ-15 | Permission Export — có log riêng (audit export) không? | 🟠 Medium |
| OQ-16 | Permission gán cho mỗi role — có template "common roles" sẵn không (vd "Read-only", "Order Manager") để Super Admin tạo nhanh? | 🟠 Medium |

---

## 11. Out of Scope

- Attribute-Based Access Control (ABAC) — chỉ RBAC
- Phân quyền tự động theo company/region (data scope) — Phase sau nếu cần
- Self-service role request workflow (admin xin role)
- Cross-actor role (role áp dụng cả admin + supplier) — chỉ scope admin E03
- Multi-tenant role isolation
- Role inheritance (role cha-con)
- Time-based permission (chỉ active business hour)

---

## Screens

| Screen | Actor | App | Mô tả ngắn |
|---|---|---|---|
| Role List | Super Admin (E03) | E03 (es-kitchen-web-admin) | Danh sách tất cả role: tên, mô tả, số quyền, số admin đang gán, action Edit/Delete |
| Create Role | Super Admin (E03) | E03 (es-kitchen-web-admin) | Form tạo role mới: nhập tên, mô tả, chọn permissions từ tree theo module |
| Edit Role | Super Admin (E03) | E03 (es-kitchen-web-admin) | Form sửa role pre-filled: cập nhật tên, mô tả, thêm/bớt permission checkbox |
| Delete Role Confirmation* | Super Admin (E03) | E03 (es-kitchen-web-admin) | Popup confirm xóa role; block + hiển thị danh sách admin cần unassign nếu role đang được dùng |
| Permission Tree (embedded)* | Super Admin (E03) | E03 (es-kitchen-web-admin) | Component tree phân cấp module → action (View/Create/Edit/Delete/Export); hiển thị trong Create/Edit Role |
| Admin Dashboard (permission-enforced)* | Admin user (E03) | E03 (es-kitchen-web-admin) | Giao diện admin sau login — menu và button bị ẩn/disable tự động theo permission của role được gán |
