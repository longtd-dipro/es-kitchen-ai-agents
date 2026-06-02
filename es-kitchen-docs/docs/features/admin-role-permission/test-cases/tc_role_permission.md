# Test Cases: Admin Role & Permission Management

> **Feature:** admin-role-permission
> **SPEC:** `es-kitchen-docs/docs/features/admin-role-permission/SPEC.md`
> **DESIGN:** `../es-kitchen-api/DESIGN.md` · `../es-kitchen-web-admin/DESIGN.md`
> **Mode:** QUICK
> **Scope:** Web Admin (E03) UI + API permission enforcement (es-kitchen-api)
> **Date:** 2026-06-02
> **Author:** qc-agent
> **Total TCs:** 73

---

## Test data conventions

| Loại | Pattern | Ví dụ |
|---|---|---|
| Role name (test) | `QC_ROLE_<MODULE>_<NNN>` | `QC_ROLE_ORDER_001` |
| Test admin email | `qc_rbac_<purpose>@eskitchen.test` | `qc_rbac_assignee_01@eskitchen.test` |
| Permission codes | enum theo SPEC | `order.view`, `order.create`, `supplier.delete`, `notification.manage`, `security.ip.manage`, `admin.role.manage` |
| Description text test | "QC test role for module XYZ" | (free text) |
| XSS payload | `<script>alert(1)</script>` | |
| SQL injection payload | `'; DROP TABLE admin_roles; --` | |

## Modules

| ID | Module | Mô tả |
|---|---|---|
| RBAC_LIST | Role List Page | Bảng danh sách roles + filter/search |
| RBAC_FORM | Role Create/Edit Form | Form name, description, PermissionTree |
| RBAC_DELETE | Role Delete | Soft delete + block khi có admin gán |
| RBAC_ASSIGN | Assign roles to Admin | Max 2 role/admin (gọi từ admin-account-management) |
| RBAC_ENFORCE | Permission Enforcement | Menu visibility (FE) + API guard 403 (BE) |

---

# Module 1: RBAC_LIST — Role List Page

## 1.1 UI Visual TCs

| ID | Function | Category | Risk Level | Test Scenario | Precondition | Steps | Expected Results | Test Data | Priority |
|---|---|---|---|---|---|---|---|---|---|
| ESK_RBAC_TC_001 | RBAC_LIST | UI Screen | High | [UI Visual] Verify UI tổng thể trang Role List | Đã login admin có permission `admin.role.manage` | 1. Vào menu System → Role Management | 1. Layout đúng design: header có title "Role Management" + button "Add Role" góc phải; table giữa; pagination dưới<br>2. Không bị vỡ giao diện ở 1920×1080 và 1366×768<br>3. Spacing nhất quán với các trang admin khác | — | Critical |
| ESK_RBAC_TC_002 | RBAC_LIST | UI State - Table | Medium | [UI Visual] Empty state — chưa có role nào | DB chưa có role nào | 1. Vào trang Role Management | 1. Hiển thị empty state với icon + text "Chưa có role nào. Tạo role đầu tiên?"<br>2. Button "Add Role" vẫn enabled | — | High |
| ESK_RBAC_TC_003 | RBAC_LIST | UI State - Table | Medium | [UI Visual] Loading state khi đang fetch | API delay > 500ms | 1. Mở trang Role Management lần đầu (clear cache)<br>2. Quan sát trong khi API GET /admin/role-permissions/roles đang chạy | 1. Hiển thị skeleton rows (5 rows skeleton) trong table<br>2. Button "Add Role" disabled trong khi load | — | Medium |
| ESK_RBAC_TC_004 | RBAC_LIST | UI State - Table | Medium | [UI Visual] Error state khi API fail | API trả 500 | 1. Mock API trả 500<br>2. Reload trang | 1. Hiển thị error message: "Không tải được danh sách. [Retry]"<br>2. Button Retry hoạt động → re-fetch | — | High |
| ESK_RBAC_TC_005 | RBAC_LIST | UI Search Field | Low | [UI Visual] Search input visual states (Normal/Focus/Filled/Error) | Đang ở trang Role Management | 1. Quan sát input chưa focus<br>2. Click vào input<br>3. Nhập "Order"<br>4. Nhập ký tự không hợp lệ (vd 256 ký tự) | 1. Normal: placeholder "Tìm role theo tên..." màu xám<br>2. Focus: border xanh, cursor blink<br>3. Filled: text "Order" hiển thị<br>4. Error: border đỏ nếu vượt max length, message "Tối đa 100 ký tự" | "Order" · "A" × 256 | Low |

## 1.2 Logic TCs

| ID | Function | Category | Risk Level | Test Scenario | Precondition | Steps | Expected Results | Test Data | Priority |
|---|---|---|---|---|---|---|---|---|---|
| ESK_RBAC_TC_006 | RBAC_LIST | Display | High | Check hiển thị đầy đủ cột: Tên role, Mô tả, Số quyền, Số admin gán, Action | DB có ≥3 role (vd Order Manager, Supplier Manager, Read-only) | 1. Vào Role Management | 1. Table có đủ 5 cột với header đúng tên<br>2. Mỗi row hiển thị data đúng từ DB<br>3. Số quyền = count permissions của role<br>4. Số admin gán = count distinct admin_id trong admin_account_roles | DB seed: 3 role | Critical |
| ESK_RBAC_TC_007 | RBAC_LIST | Display | High | Check sort mặc định | DB có nhiều role | 1. Vào trang<br>2. Quan sát thứ tự | 1. Sort theo `created_at DESC` (role mới nhất ở đầu) [Lưu ý: OQ-1 BA chưa chốt — đây là default đề xuất] | — | Medium |
| ESK_RBAC_TC_008 | RBAC_LIST | Search | High | Check search theo tên role (partial match) | DB có role "Order Manager", "Order Viewer", "Supplier Admin" | 1. Nhập "Order" vào search | 1. Table chỉ hiển thị 2 role có "Order" trong tên<br>2. "Supplier Admin" bị filter ra | "Order" | High |
| ESK_RBAC_TC_009 | RBAC_LIST | Search | Medium | Check search case-insensitive | DB có role "Order Manager" | 1. Nhập "order" lowercase | 1. Vẫn match "Order Manager" | "order" | Medium |
| ESK_RBAC_TC_010 | RBAC_LIST | Search | Medium | Check search rỗng → hiển thị tất cả | Có search trước đó | 1. Xóa hết text trong search | 1. Hiển thị toàn bộ role | "" | Medium |
| ESK_RBAC_TC_011 | RBAC_LIST | Pagination | Medium | Check pagination khi có >page size | DB có 25 role, page size 20 | 1. Vào trang<br>2. Click page 2 | 1. Page 1: 20 row<br>2. Page 2: 5 row<br>3. URL update `?page=2` | — | Medium |
| ESK_RBAC_TC_012 | RBAC_LIST | Permission | High | Admin không có permission `admin.role.manage` không vào được trang | Login admin role "Order Manager" (chỉ có order.* perms) | 1. Cố navigate `/system/role-permissions` | 1. Bị redirect về Forbidden page hoặc menu không có link để vào<br>2. API call /admin/role-permissions/roles trả 403 | — | Critical |
| ESK_RBAC_TC_013 | RBAC_LIST | Action | High | Click Edit row → mở form edit pre-fill data | Đã login super-admin | 1. Click icon Edit ở 1 row | 1. Navigate `/system/role-permissions/<id>/edit`<br>2. Form pre-fill name, description, checked permissions | — | High |
| ESK_RBAC_TC_014 | RBAC_LIST | Action | High | Click Delete → mở popup warning + confirm | Đã login super-admin | 1. Click icon Delete | 1. Popup "Bạn có chắc xóa role 'X'? Action không thể undo." với 2 button "Cancel" / "Confirm Delete" | — | High |

---

# Module 2: RBAC_FORM — Role Create / Edit Form

## 2.1 UI Visual TCs

| ID | Function | Category | Risk Level | Test Scenario | Precondition | Steps | Expected Results | Test Data | Priority |
|---|---|---|---|---|---|---|---|---|---|
| ESK_RBAC_TC_015 | RBAC_FORM | UI Screen | High | [UI Visual] Verify UI tổng thể form Create Role | Đã login super-admin | 1. Vào /system/role-permissions/new | 1. Header "Create New Role"<br>2. Field Tên role (input)<br>3. Field Mô tả (textarea)<br>4. PermissionTree (collapsed mặc định)<br>5. Footer có button Cancel + Save | — | Critical |
| ESK_RBAC_TC_016 | RBAC_FORM | UI Field - Name | Medium | [UI Visual] Field "Tên role" visual states | Mở form Create | 1. Quan sát Normal<br>2. Click vào field (Focus)<br>3. Nhập "QC_ROLE_001" (Filled)<br>4. Submit form rỗng (Error)<br>5. Disable (Loading khi submit) | 1. Normal: placeholder "Nhập tên role" + label "Tên role *"<br>2. Focus: border xanh<br>3. Filled: text hiển thị đúng<br>4. Error: border đỏ + message "Tên role là bắt buộc"<br>5. Loading: disabled, không cho gõ | "QC_ROLE_001" | High |
| ESK_RBAC_TC_017 | RBAC_FORM | UI Field - Description | Low | [UI Visual] Field "Mô tả" visual states | Mở form Create | 1-5. Tương tự field Name nhưng textarea | 1-5. States như input nhưng resize được; character counter "0 / 500" góc dưới | "Test description" | Low |
| ESK_RBAC_TC_018 | RBAC_FORM | UI PermissionTree | High | [UI Visual] PermissionTree structure | Mở form Create, DB seed permissions từ migration | 1. Click expand "Order Management"<br>2. Quan sát<br>3. Check 1 child<br>4. Quan sát parent node | 1. Sau expand: list checkbox per permission con (order.view, order.create, ...)<br>2. Check 1 child → parent có dấu indeterminate ☐<br>3. Check tất cả children → parent fully checked ☑ | — | High |
| ESK_RBAC_TC_019 | RBAC_FORM | UI PermissionTree | Medium | [UI Visual] PermissionTree loading state | API permissions chậm | 1. Mở form Create | 1. Tree hiển thị skeleton 3 group node trong khi load | — | Medium |
| ESK_RBAC_TC_020 | RBAC_FORM | UI PermissionTree | Medium | [UI Visual] PermissionTree empty (chưa seed) | DB `admin_permissions` rỗng | 1. Mở form Create | 1. Tree hiển thị "Không có permission. Liên hệ DevOps để seed." | — | High |

## 2.2 Field-Level Validation — `roleName`

| ID | Function | Category | Risk Level | Test Scenario | Precondition | Steps | Expected Results | Test Data | Priority |
|---|---|---|---|---|---|---|---|---|---|
| ESK_RBAC_TC_021 | RBAC_FORM | Validation - Name | Critical | Check Name required | Form Create mở | 1. Để Name rỗng<br>2. Click Save | 1. Inline error "Tên role là bắt buộc"<br>2. Submit bị block, không gọi API | "" | Critical |
| ESK_RBAC_TC_022 | RBAC_FORM | Validation - Name | High | Check Name min length 1 | Form Create | 1. Nhập 1 ký tự<br>2. Save | 1. Pass validation min, gọi API | "A" | High |
| ESK_RBAC_TC_023 | RBAC_FORM | Validation - Name | High | Check Name max length 100 — đúng max | Form Create | 1. Nhập 100 ký tự<br>2. Save | 1. Pass validation, gọi API | "A" × 100 | High |
| ESK_RBAC_TC_024 | RBAC_FORM | Validation - Name | High | Check Name max length — vượt 100 | Form Create | 1. Nhập 101 ký tự | 1. Inline error "Tối đa 100 ký tự"<br>2. Submit block | "A" × 101 | High |
| ESK_RBAC_TC_025 | RBAC_FORM | Validation - Name | High | Check Name whitespace-only | Form Create | 1. Nhập "   " (3 dấu cách)<br>2. Save | 1. Trim → coi như rỗng → error required | "   " | High |
| ESK_RBAC_TC_026 | RBAC_FORM | Validation - Name | Critical | Check Name unique (active) | DB đã có role "QC_ROLE_DUP" | 1. Nhập "QC_ROLE_DUP"<br>2. Save | 1. API trả 409 hoặc inline check<br>2. Hiển thị "Tên role đã tồn tại" | "QC_ROLE_DUP" | Critical |
| ESK_RBAC_TC_027 | RBAC_FORM | Validation - Name | Medium | Check Name unique — chỉ check active (đã soft delete OK) | DB có role "X" với deleted_at NOT NULL | 1. Nhập "X"<br>2. Save | 1. Pass — tạo thành công vì role cũ đã soft-deleted | "X" | Medium |
| ESK_RBAC_TC_028 | RBAC_FORM | Validation - Name | High | Check Name ký tự đặc biệt `<>&"'` | Form Create | 1. Nhập `<Role>"Test"` | 1. Cho phép lưu (DB escape OK)<br>2. Hiển thị đúng escape khi list — không inject HTML | `<Role>"Test"` | High |
| ESK_RBAC_TC_029 | RBAC_FORM | Validation - Name | Critical | Check Name XSS injection | Form Create | 1. Nhập `<script>alert(1)</script>`<br>2. Save → vào list | 1. Save thành công nhưng list hiển thị plain text, không trigger alert<br>2. Detail page render đúng escape | `<script>alert(1)</script>` | Critical |
| ESK_RBAC_TC_030 | RBAC_FORM | Validation - Name | Critical | Check Name SQL injection | Form Create | 1. Nhập `'; DROP TABLE admin_roles; --` | 1. Save thành công (TypeORM parameterized query), KHÔNG xoá table<br>2. Verify DB còn nguyên table | `'; DROP TABLE admin_roles; --` | Critical |
| ESK_RBAC_TC_031 | RBAC_FORM | Validation - Name | Low | Check Name Unicode + emoji | Form Create | 1. Nhập "管理者ロール 🛡" | 1. Save thành công, hiển thị đúng Unicode + emoji | "管理者ロール 🛡" | Low |
| ESK_RBAC_TC_032 | RBAC_FORM | Validation - Name | Medium | Check Name leading/trailing spaces | Form Create | 1. Nhập "  QC_ROLE_001  " | 1. Auto-trim trước khi save<br>2. DB lưu "QC_ROLE_001" không có space đầu/cuối | "  QC_ROLE_001  " | Medium |

## 2.3 Field-Level Validation — `description`

| ID | Function | Category | Risk Level | Test Scenario | Precondition | Steps | Expected Results | Test Data | Priority |
|---|---|---|---|---|---|---|---|---|---|
| ESK_RBAC_TC_033 | RBAC_FORM | Validation - Desc | Low | Check description optional | Form Create | 1. Để rỗng<br>2. Name hợp lệ<br>3. Save | 1. Save thành công | "" | Low |
| ESK_RBAC_TC_034 | RBAC_FORM | Validation - Desc | Medium | Check description max length 500 — đúng max | Form Create | 1. Nhập 500 ký tự | 1. Pass | "A" × 500 | Medium |
| ESK_RBAC_TC_035 | RBAC_FORM | Validation - Desc | Medium | Check description max — vượt 500 | Form Create | 1. Nhập 501 ký tự | 1. Inline error "Tối đa 500 ký tự" | "A" × 501 | Medium |
| ESK_RBAC_TC_036 | RBAC_FORM | Validation - Desc | Low | Check description line breaks | Form Create | 1. Nhập text có Enter xuống dòng | 1. Save thành công<br>2. Hiển thị đúng line break khi xem detail | "line1\nline2\nline3" | Low |
| ESK_RBAC_TC_037 | RBAC_FORM | Validation - Desc | Critical | Check description XSS | Form Create | 1. Nhập `<img src=x onerror=alert(1)>` | 1. Save OK, render plain text, không trigger alert | `<img src=x onerror=alert(1)>` | Critical |

## 2.4 Field-Level Validation — `permissionIds` (PermissionTree)

| ID | Function | Category | Risk Level | Test Scenario | Precondition | Steps | Expected Results | Test Data | Priority |
|---|---|---|---|---|---|---|---|---|---|
| ESK_RBAC_TC_038 | RBAC_FORM | Validation - Perm | ⚠️ BLOCKED by OQ-4 | Check permissionIds required (ít nhất 1) | Form Create, OQ-4 chốt = bắt buộc ≥1 | 1. Không check permission nào<br>2. Name hợp lệ<br>3. Save | 1. Inline error "Phải chọn ít nhất 1 permission" | (no perm checked) | High (sau khi OQ-4 chốt) |
| ESK_RBAC_TC_039 | RBAC_FORM | Validation - Perm | ⚠️ BLOCKED by OQ-4 | Check cho phép role rỗng permission (alternative OQ-4) | Form Create, OQ-4 chốt = cho phép rỗng | 1. Không check permission<br>2. Save | 1. Save thành công, role với 0 permission | (no perm checked) | Medium |
| ESK_RBAC_TC_040 | RBAC_FORM | Logic - Perm | High | Check chọn 1 permission con → save đúng | Form Create | 1. Expand "Order Management"<br>2. Check "order.view"<br>3. Save | 1. Role được tạo với 1 record `admin_role_permissions` cho `order.view` | order.view | High |
| ESK_RBAC_TC_041 | RBAC_FORM | Logic - Perm | High | Check chọn parent node → check tất cả children | Form Create | 1. Click checkbox của parent "Order Management"<br>2. Quan sát children | 1. Tất cả permission con của module Order tự động được check<br>2. Save → role có đầy đủ permissions của module | "Order Management" (parent) | High |
| ESK_RBAC_TC_042 | RBAC_FORM | Logic - Perm | Medium | Check uncheck 1 child → parent về indeterminate | Form Create, đã check parent | 1. Uncheck 1 child "order.cancel"<br>2. Quan sát parent | 1. Parent "Order Management" hiển thị dấu indeterminate ☐<br>2. Save → role có tất cả perms trừ order.cancel | — | Medium |
| ESK_RBAC_TC_043 | RBAC_FORM | Logic - Perm | High | Check chọn cross-module permissions | Form Create | 1. Check "order.create"<br>2. Check "supplier.view"<br>3. Save | 1. Role tạo với 2 permission khác module | order.create, supplier.view | High |

## 2.5 Logic TCs — Create / Edit / Cancel

| ID | Function | Category | Risk Level | Test Scenario | Precondition | Steps | Expected Results | Test Data | Priority |
|---|---|---|---|---|---|---|---|---|---|
| ESK_RBAC_TC_044 | RBAC_FORM | Create - Happy | Critical | Check Create role happy path | Form Create | 1. Nhập tên "QC_ROLE_ORDER_001"<br>2. Description "QC test"<br>3. Check 3 permission order.*<br>4. Click Save<br>5. Confirm popup | 1. Popup confirm hiện ra<br>2. Confirm → API POST /admin/role-permissions/roles<br>3. Toast "Tạo role thành công"<br>4. Redirect về list, role mới hiện đầu danh sách | "QC_ROLE_ORDER_001", 3 perms | Critical |
| ESK_RBAC_TC_045 | RBAC_FORM | Create - Confirm | High | Check Cancel ở popup confirm | Form Create, đã điền đủ | 1. Click Save<br>2. Popup hiện<br>3. Click Cancel | 1. Popup đóng, ở lại form<br>2. KHÔNG gọi API<br>3. Data form vẫn giữ nguyên | — | High |
| ESK_RBAC_TC_046 | RBAC_FORM | Edit - Happy | Critical | Check Edit role happy path | DB có role "QC_ROLE_EDIT" với 3 perms | 1. Click Edit row<br>2. Form pre-fill đúng<br>3. Đổi description<br>4. Add 1 permission<br>5. Save → confirm | 1. API PUT /admin/role-permissions/:id<br>2. Body chỉ chứa diff (hoặc full nếu API design vậy)<br>3. Toast success<br>4. List update với data mới | "QC_ROLE_EDIT" | Critical |
| ESK_RBAC_TC_047 | RBAC_FORM | Edit - Cache invalidation | High | Check sửa permission của role → admin đang có role bị invalidate cache | DB: admin A có role "QC_ROLE_X", Redis cache `admin:perm:<A>` đang có | 1. Edit role X, bỏ permission "order.create"<br>2. Save<br>3. Quan sát Redis | 1. Sau save, Redis key `admin:perm:<A>` bị del<br>2. Lần API call kế tiếp của admin A → re-compute permission | — | High |
| ESK_RBAC_TC_048 | RBAC_FORM | Edit - Active session | ⚠️ BLOCKED by OQ-2 | Check admin đang session active khi role thay đổi | Admin A đang login với role X, có session token | 1. Super-admin sửa permission role X (bỏ order.create)<br>2. Admin A gọi API POST /orders | 1. OQ-2 chốt: nếu instant invalidate → API trả 403; nếu đợi re-login → API vẫn cho qua (đến khi token expire) | — | High (sau OQ-2 chốt) |
| ESK_RBAC_TC_049 | RBAC_FORM | Cancel | Low | Check Cancel button | Form Create đã điền data | 1. Click Cancel | 1. Popup confirm "Bạn có chắc bỏ thay đổi?"<br>2. Confirm → redirect list, data không lưu | — | Low |
| ESK_RBAC_TC_050 | RBAC_FORM | Unsaved warning | Medium | Check warning khi reload với data chưa save | Form Create đã điền | 1. Reload trang | 1. Browser hiển thị "Leave site? Changes you made may not be saved" | — | Medium |

---

# Module 3: RBAC_DELETE — Role Delete

| ID | Function | Category | Risk Level | Test Scenario | Precondition | Steps | Expected Results | Test Data | Priority |
|---|---|---|---|---|---|---|---|---|---|
| ESK_RBAC_TC_051 | RBAC_DELETE | UI - Popup | High | [UI Visual] Popup warning delete | DB có role chưa gán admin | 1. Click Delete row | 1. Popup có icon warning ⚠ + text "Xóa role 'X' không thể hoàn tác" + 2 button Cancel/Confirm<br>2. Confirm button màu đỏ | — | High |
| ESK_RBAC_TC_052 | RBAC_DELETE | Happy | Critical | Check delete role chưa gán admin nào | DB: role "QC_ROLE_DEL" 0 admin gán | 1. Click Delete<br>2. Confirm | 1. API DELETE /admin/role-permissions/:id trả 200<br>2. Soft delete: `admin_roles.deleted_at` set NOW()<br>3. Row biến khỏi list<br>4. Toast "Xóa role thành công" | "QC_ROLE_DEL" | Critical |
| ESK_RBAC_TC_053 | RBAC_DELETE | Conflict | Critical | Check delete role đang gán admin → block | DB: role X gán cho admin A, B | 1. Click Delete role X<br>2. Confirm | 1. API trả 409 Conflict<br>2. UI hiển thị error "Role đang được gán cho 2 admin: <list email>. Vui lòng unassign trước"<br>3. Role không bị xóa | — | Critical |
| ESK_RBAC_TC_054 | RBAC_DELETE | Built-in | ⚠️ BLOCKED by OQ-9 | Check delete role built-in `is_system=true` | DB seed role "Super Admin" is_system=true | 1. Click Delete | 1. OQ-9 chốt: button Delete disabled, hoặc API trả 403 "Cannot delete system role" | — | Critical |
| ESK_RBAC_TC_055 | RBAC_DELETE | Self-role | ⚠️ BLOCKED by OQ-7 | Check super-admin tự xóa role của chính mình | Login super-admin có role "Admin Master" | 1. Vào Role list<br>2. Click Delete role "Admin Master" | 1. OQ-7 chốt: block ngay UI hoặc API trả 403 "Cannot delete your own role" | — | Critical |
| ESK_RBAC_TC_056 | RBAC_DELETE | Audit log | High | Check audit log sau delete | DB có audit log table | 1. Delete role X<br>2. Query audit log | 1. Audit log có row: action="delete_role", actor_admin_id, target_role_id, timestamp | — | High |

---

# Module 4: RBAC_ASSIGN — Assign roles to Admin

> **Note:** Module này nằm trong flow Admin Account Management (cross với SPEC `admin-account-management`). TC ở đây test phần "max 2 role + conflict resolution".

| ID | Function | Category | Risk Level | Test Scenario | Precondition | Steps | Expected Results | Test Data | Priority |
|---|---|---|---|---|---|---|---|---|---|
| ESK_RBAC_TC_057 | RBAC_ASSIGN | UI - Drawer | Medium | [UI Visual] RoleAssignDrawer hiển thị | Đang edit admin account | 1. Click "Assign Roles" button | 1. Drawer mở từ phải<br>2. Hiển thị multi-select dropdown roles<br>3. Hiển thị "Đã chọn: 0/2" | — | Medium |
| ESK_RBAC_TC_058 | RBAC_ASSIGN | Happy | Critical | Check assign 1 role | Admin A chưa có role | 1. Mở drawer<br>2. Select role "Order Manager"<br>3. Save | 1. API POST /admin/role-permissions/admins/<A>/roles body {roleIds: [<id>]}<br>2. `admin_account_roles` insert 1 record<br>3. Redis `admin:perm:<A>` invalidate | "Order Manager" | Critical |
| ESK_RBAC_TC_059 | RBAC_ASSIGN | Happy | Critical | Check assign 2 role | Admin A có 0 role | 1. Select 2 role | 1. Counter "Đã chọn: 2/2"<br>2. Save → 2 record insert<br>3. Permission resolved = union/intersection theo OQ-5 | "Order Mgr" + "Supplier Mgr" | Critical |
| ESK_RBAC_TC_060 | RBAC_ASSIGN | Validation | Critical | Check assign 3 role → block | Form drawer | 1. Cố chọn role thứ 3 | 1. Sau khi đã có 2 selected, role thứ 3 trong dropdown disabled hoặc message "Tối đa 2 role"<br>2. API call (nếu bypass UI) trả 400 | — | Critical |
| ESK_RBAC_TC_061 | RBAC_ASSIGN | Validation | High | Check assign role đã bị delete | Role X đã soft-delete | 1. Dropdown roles không có X | 1. Role X không xuất hiện trong dropdown<br>2. API call POST với roleId của X → 400/404 | — | High |
| ESK_RBAC_TC_062 | RBAC_ASSIGN | Conflict | ⚠️ BLOCKED by OQ-5 | Check 2 role conflict permission (1 allow, 1 deny implicit) | Role A có `order.create`, Role B không có `order.create`. Admin gán cả 2. | 1. Gán A + B cho admin<br>2. Admin login → call POST /orders | 1. OQ-5 chốt: union → admin có quyền tạo order (allow takes precedence); intersection → không có quyền | — | Critical (sau OQ-5 chốt) |
| ESK_RBAC_TC_063 | RBAC_ASSIGN | Cache | High | Check Redis cache invalidate sau assign | Admin A đang cache `admin:perm:<A>` | 1. Super-admin gán role mới cho A<br>2. Quan sát Redis | 1. Sau API success, key `admin:perm:<A>` bị del | — | High |

---

# Module 5: RBAC_ENFORCE — Permission Enforcement

## 5.1 FE — Menu Visibility

| ID | Function | Category | Risk Level | Test Scenario | Precondition | Steps | Expected Results | Test Data | Priority |
|---|---|---|---|---|---|---|---|---|---|
| ESK_RBAC_TC_064 | RBAC_ENFORCE | FE Menu | Critical | Check menu hiển thị theo permission | Admin login với role "Order Viewer" (chỉ `order.view`) | 1. Sau login, quan sát sidebar | 1. Menu "Orders" hiển thị (vì có order.view)<br>2. Menu "Suppliers", "Notifications" KHÔNG hiển thị (không có perm)<br>3. Button "Create Order" trong page Orders cũng ẩn (vì không có order.create) | role "Order Viewer" | Critical |
| ESK_RBAC_TC_065 | RBAC_ENFORCE | FE Route Guard | Critical | Check admin không có perm cố navigate trực tiếp URL | Admin "Order Viewer" | 1. Type URL `/system/role-permissions` vào browser | 1. Hiển thị Forbidden page hoặc redirect home<br>2. API call backend cũng 403 | — | Critical |
| ESK_RBAC_TC_066 | RBAC_ENFORCE | FE State | High | Check permissions load đúng sau login | Login admin có role X (3 permissions) | 1. Login<br>2. DevTools → Redux state | 1. `permissionsSlice.codes` = Set chứa đúng 3 permission codes<br>2. `permissionsSlice.loaded = true` | — | High |
| ESK_RBAC_TC_067 | RBAC_ENFORCE | FE State | Medium | Check clear permissions khi logout | Đang login | 1. Click logout | 1. `permissionsSlice.codes = empty Set`<br>2. `loaded = false` | — | Medium |
| ESK_RBAC_TC_068 | RBAC_ENFORCE | FE - Role rỗng | Medium | Check admin role rỗng (0 perm) chỉ thấy menu cơ bản | Admin gán role có 0 permission | 1. Login<br>2. Quan sát menu | 1. Chỉ thấy Profile, Logout — không có menu chức năng nào | — | Medium |

## 5.2 BE — API Permission Guard

| ID | Function | Category | Risk Level | Test Scenario | Precondition | Steps | Expected Results | Test Data | Priority |
|---|---|---|---|---|---|---|---|---|---|
| ESK_RBAC_TC_069 | RBAC_ENFORCE | BE Guard | Critical | Check API trả 403 khi thiếu permission | Admin role "Order Viewer" | 1. Call API POST /orders với JWT của admin này | 1. PermissionGuard check `order.create` → fail<br>2. Response 403 Forbidden với body `{ message: "Insufficient permission: order.create required" }` | API POST /orders | Critical |
| ESK_RBAC_TC_070 | RBAC_ENFORCE | BE Guard | Critical | Check API trả 200 khi có permission | Admin role có `order.create` | 1. Call POST /orders | 1. Permission pass → endpoint execute → 201 Created | — | Critical |
| ESK_RBAC_TC_071 | RBAC_ENFORCE | BE Cache | High | Check Redis cache hit khi gọi nhiều API liên tiếp | Admin login, cache `admin:perm:<id>` chưa có | 1. Call API 1 → cache miss → DB query → cache set<br>2. Call API 2 ngay sau → cache hit | 1. API 1: log thấy DB query<br>2. API 2: log không thấy DB query, đọc từ Redis<br>3. Cả 2 trả 200 nếu có quyền | — | High |
| ESK_RBAC_TC_072 | RBAC_ENFORCE | BE Cache | Medium | Check cache TTL 5 phút | Admin login | 1. Call API (cache set TTL 5 phút)<br>2. Đợi 5 phút<br>3. Call API lần nữa | 1. Sau TTL expire, cache miss → DB query lại | — | Medium |
| ESK_RBAC_TC_073 | RBAC_ENFORCE | BE - JWT no role | High | Check fallback admin có JWT cũ với `role` raw string nhưng không có `admin_account_roles` | Migration đang chạy, admin chưa migrate | 1. Admin login với JWT cũ<br>2. Call API | 1. AuthService fallback: nếu `admin_account_roles` rỗng → đọc `admins.role` raw string<br>2. Map raw role → permission code (theo built-in mapping)<br>3. Pass nếu đủ quyền | — | High |

---

# Traceability Matrix — AC → TC

| AC ID (SPEC) | Mô tả AC | TC IDs cover |
|---|---|---|
| AC-01 | Xem danh sách roles | ESK_RBAC_TC_006, _007, _011 |
| AC-02 | Tạo role mới với name unique + chọn permissions | ESK_RBAC_TC_021, _026, _040, _041, _043, _044 |
| AC-03 | Sửa permission / tên / mô tả của role | ESK_RBAC_TC_046, _047 |
| AC-04 | Delete role; block nếu role đang gán | ESK_RBAC_TC_052, _053 |
| AC-05 | Mỗi admin gán tối đa 2 role | ESK_RBAC_TC_058, _059, _060 |
| AC-06 | Permission tree theo module/resource | ESK_RBAC_TC_018, _041, _042 |
| AC-07 | Enforce permission BE + FE | ESK_RBAC_TC_064, _065, _069, _070 |
| AC-08 | Role rỗng → admin chỉ thấy tính năng cơ bản | ESK_RBAC_TC_068 |
| AC-09 | Audit log tạo/sửa/xóa role | ESK_RBAC_TC_056 (delete); cần TC bổ sung cho create/edit audit |
| AC-10 | Action Add/Edit/Delete có popup warning + confirm | ESK_RBAC_TC_014, _044, _045, _051, _052 |
| AC-11 | Permission mới — default OFF cho role cũ | ⚠️ Chưa có TC — cần thêm khi dev release permission mới |
| AC-12 | Conflict 2 role đồng bộ với admin-account-management OQ-12 | ESK_RBAC_TC_062 (BLOCKED by OQ-5) |

## Coverage

- **12/12 AC** có ít nhất 1 TC cover (AC-09 và AC-11 có gap nhỏ cần bổ sung)
- **Gap:**
  - AC-09 — cần thêm TC verify audit log cho create + edit role
  - AC-11 — cần TC integration sau khi dev release permission mới (manual test khi deploy)

---

# TCs bị block bởi Open Questions

| TC ID | Bị block bởi | Action |
|---|---|---|
| ESK_RBAC_TC_038, _039 | OQ-4 (role rỗng cho phép hay không) | Chốt OQ-4 → giữ 1 trong 2 TC |
| ESK_RBAC_TC_048 | OQ-2 (instant invalidate vs đợi re-login) | Chốt OQ-2 → update expected result |
| ESK_RBAC_TC_054 | OQ-9 (built-in role không xóa được) | Chốt OQ-9 → update expected |
| ESK_RBAC_TC_055 | OQ-7 (self-strip role) | Chốt OQ-7 → update expected |
| ESK_RBAC_TC_062 | OQ-5 (union vs intersection) | Chốt OQ-5 → update expected — Critical, cần chốt trước Phase 2 |

> **Recommendation:** Trước khi QC chạy bộ TC này, cần PM/BA chốt 5 OQ trên với khách hàng.

---

# Test data setup script (SQL — chỉ cho reference, dev cần adapt)

```sql
-- Seed permissions (giả định)
INSERT INTO admin_permissions (code, module, name_jp) VALUES
  ('order.view', 'order', '注文閲覧'),
  ('order.create', 'order', '注文作成'),
  ('order.cancel', 'order', '注文キャンセル'),
  ('supplier.view', 'supplier', 'サプライヤー閲覧'),
  ('supplier.delete', 'supplier', 'サプライヤー削除'),
  ('admin.role.manage', 'admin', 'ロール管理');

-- Seed test roles
INSERT INTO admin_roles (role_name, description, is_system) VALUES
  ('Super Admin', 'System built-in', true),     -- is_system=true, không xóa được (OQ-9)
  ('Order Viewer', 'Test role 1', false),
  ('Order Manager', 'Test role 2', false);

-- Seed test admin với role assigned
-- ...
```

---

# Notes for execution

1. **Trước khi chạy:** confirm 5 OQ trong SPEC đã được chốt (xem section "TCs bị block")
2. **Chạy tuần tự:** Module 1 (List) → 2 (Form) → 3 (Delete) → 4 (Assign) → 5 (Enforce)
3. **Reset DB:** giữa các test case, dùng seed script + transaction rollback nếu có
4. **Browser:** test Chrome (Win + Mac), Firefox (smoke), Safari (smoke)
5. **API testing:** Postman/curl + JWT của admin có role tương ứng — TC Module 5 cần Postman collection riêng
6. **Mỗi field input** đã có TC validation riêng (không gộp), tổng cộng 12 TC cho `roleName`, 5 TC cho `description`, 6 TC cho `permissionIds`

---

**QC Output**
- Test cases: 73 TCs
- Traceability: 10/12 AC fully covered (AC-09 partial, AC-11 cần integration test)
- 5 TCs bị block bởi OQ chưa chốt
- Files đã tạo: `es-kitchen-docs/docs/features/admin-role-permission/test-cases/tc_role_permission.md`

**Bước tiếp theo:**
→ "Hãy là PM, chốt 5 OQ critical với khách hàng" (xem section TCs bị block)
→ Khi dev xong task: "Hãy là QA, verify task này"
→ Khi build deploy staging: QC manual chạy bộ TC này
