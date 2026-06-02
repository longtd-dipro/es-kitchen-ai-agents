# SPEC: Admin Account Management

> **Loại:** Single-repo (E03 System Admin Web + API)
> **Repos liên quan:** `es-kitchen-api` · `es-kitchen-web-admin` (E03)
> **Actor chính:** System Admin (E03)
> **Ngày:** 2026-06-02
> **Status:** Draft
> **Source:** `es-kitchen-requirements/role_permission/requirement.md` (section 2 "Granting admin privileges") + assets `admin_list_1.png`, `admin_permission_1.png`, `admin_permission_2.png`
> **Liên quan:** SPEC `admin-role-permission` (Roles & Access Control — Section 3 cùng requirement)

---

## 1. Mô tả nghiệp vụ

System Admin (super-admin) có thể **quản lý tài khoản admin cấp dưới** — tạo, sửa, vô hiệu hóa, xóa admin account. Mỗi admin account được gán **1-2 role** (xem SPEC `admin-role-permission`). Đây là entry point để khởi tạo admin cho các module quản trị.

> **Phân biệt:** SPEC này quản lý **admin** trong System Admin Web (E03). Supplier (E04), Outsource (E05), Driver (E06) có flow tạo account riêng (xem SPEC `authentication`).

---

## 2. Actors & Preconditions

| Actor | Vai trò | Precondition |
|---|---|---|
| Super Admin / System Admin (E03) — chủ động | Tạo/sửa/disable/delete admin khác | Có quyền "Admin Account Management" (root role) |
| Admin user vừa được tạo | Login bằng credential super-admin cấp | Đã có ID + temp password |

---

## 3. Happy Path — Xem danh sách Admin

1. Super Admin vào **System → Admin Accounts**
2. Hiển thị bảng danh sách (`admin_list_1.png`):
   - ID / Username
   - Email
   - Họ tên
   - Role(s) (1-2 role)
   - Status (Active / Disabled)
   - Last login
   - Created date
   - Action (Edit / Disable / Delete)
3. *OQ-1: filter / search theo trường nào? Pagination size?*

## 4. Happy Path — Tạo Admin mới

1. Click **Add Admin** → mở form
2. Fields:
   - Username / ID (unique, validate format)
   - Email (unique, validate format)
   - Họ tên
   - Password ban đầu (auto-generate hoặc admin nhập — *OQ-2*)
   - Role(s) — multi-select (chọn 1-2 role từ danh sách, **trừ super-admin role hiện tại** *OQ-3*)
   - Status (mặc định Active)
3. Click **Save** → popup warning + confirm
4. Confirm → tạo account → gửi email thông báo credential cho admin mới *(OQ-4)*

## 5. Happy Path — Edit Admin Information

1. Click **Edit** trên 1 row
2. Form pre-fill thông tin hiện tại
3. Cho phép sửa: Email, Họ tên, Role(s), Status
4. **KHÔNG** cho sửa username/ID *(OQ-5)*
5. Đổi password — có nút riêng "Reset Password" *(OQ-6)*
6. Save → popup confirm → update

## 6. Happy Path — Disable Admin

1. Click **Disable** → popup warning + confirm
2. Status → `Disabled`
3. Admin bị disable không login được (theo SPEC `authentication` AC-09)
4. Vẫn giữ data trong DB, có thể Enable lại

## 7. Happy Path — Delete Admin

1. Click **Delete** → popup warning + confirm (nguy hiểm cao — *OQ-7: cần nhập tên/yes confirm cho chắc?*)
2. Logical delete — status `DELETED`
3. Không hiển thị trong list mặc định, có thể filter "Show deleted"
4. *OQ-8: có cho restore không?*

---

## 8. Alternative Flows & Edge Cases

| Tình huống | Xử lý |
|---|---|
| Tạo username đã tồn tại | Error inline "Username đã được dùng" |
| Tạo email đã tồn tại | Error inline "Email đã được dùng" |
| Gán role không tồn tại / đã bị xóa | Filter ra khỏi dropdown |
| Super Admin tự disable mình | *OQ-9: block — không cho phép self-disable* |
| Super Admin tự xóa mình | *OQ-9: block — không cho phép self-delete* |
| Đổi role của admin đang có session active | *OQ-10: invalidate session ngay hay đến lần login tiếp?* |
| Reset password — gửi link email hay show password trên màn hình? | *OQ-11* |
| Tạo admin khi role chưa được setup | Cho phép tạo nhưng cảnh báo "Account chưa có role" |
| 2 role conflict (vd role A cho phép X, role B cấm X) | *OQ-12: rule resolution — allow takes precedence? Deny takes precedence?* |

---

## 9. Acceptance Criteria

| # | Criteria |
|---|---|
| AC-01 | Super Admin có thể xem danh sách admin với cột: ID, email, name, roles, status, last login |
| AC-02 | Super Admin có thể tạo admin mới với username + email unique, gán 1-2 role |
| AC-03 | Username và email phải unique — validate inline khi nhập |
| AC-04 | Super Admin có thể edit thông tin (email, name, role, status), KHÔNG sửa username |
| AC-05 | Super Admin có thể reset password admin khác |
| AC-06 | Super Admin có thể Disable admin → không login được |
| AC-07 | Super Admin có thể Enable lại admin đã Disable |
| AC-08 | Super Admin có thể Delete (logical) admin |
| AC-09 | Mọi action Add/Edit/Disable/Delete có popup warning + confirm |
| AC-10 | Super Admin không thể tự disable/delete mình |
| AC-11 | Mỗi admin được gán tối đa 2 role |
| AC-12 | Audit log đầy đủ: ai làm gì, khi nào, với account nào |

---

## 10. Open Questions — Cần confirm

| # | Câu hỏi | Tầm quan trọng |
|---|---|---|
| OQ-1 | Filter / search list theo trường nào? Page size mặc định? | 🟠 Medium |
| OQ-2 | Password ban đầu: auto-generate strong random hay Super Admin nhập? | 🟡 High |
| OQ-3 | "Danh sách roles lấy trừ web-admin hiện tại" — confirm: super-admin role không xuất hiện trong dropdown gán cho người khác? | 🔴 Critical |
| OQ-4 | Gửi credential qua email gì? Template? Bao gồm password rõ trong email? | 🔴 Critical |
| OQ-5 | Username có cho sửa không? (Hiện đang đề xuất KHÔNG) | 🟠 Medium |
| OQ-6 | Reset password: gửi email link reset, hay show password mới trên màn hình? | 🟡 High |
| OQ-7 | Delete có cần nhập confirm string (vd nhập username để xác nhận)? | 🟠 Medium |
| OQ-8 | Có cho phép restore admin đã delete không? Permanent delete sau N ngày? | 🟠 Medium |
| OQ-9 | Self-disable/delete: block? Hay vẫn cho phép với warning đặc biệt? | 🔴 Critical |
| OQ-10 | Đổi role admin đang active session: invalidate ngay hay đến lần login tiếp? | 🟡 High |
| OQ-11 | Reset password — kênh gửi link? Expiry? | 🟡 High |
| OQ-12 | 2 role conflict: allow takes precedence (union) hay deny takes precedence (intersection)? | 🔴 Critical |
| OQ-13 | Khi gán role thay đổi, có notification gì cho admin đó không? | 🟠 Medium |
| OQ-14 | Có quota giới hạn số lượng admin trong hệ thống không? | 🟠 Low |
| OQ-15 | Last login: hiển thị địa chỉ IP / device không? (liên quan SPEC `ip-whitelist`) | 🟠 Medium |

---

## 11. Out of Scope

- Tạo admin cho actor khác (Supplier/Outsource/Driver) — có SPEC `authentication` riêng
- Self-service signup admin
- 2FA hardware key (chỉ OTP qua IP whitelist, xem SPEC `ip-whitelist`)
- Phân quyền theo level (level 1/2/3) — chỉ role-based
- Multi-tenant isolation (1 admin chỉ thấy data của 1 company)
- Activity dashboard chi tiết per admin (chỉ audit log)
