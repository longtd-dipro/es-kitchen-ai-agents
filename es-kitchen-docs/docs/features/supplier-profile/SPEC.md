# SPEC: Supplier My Page (プロフィール)

## Mô tả nghiệp vụ

Supplier cần một màn hình chuyên dụng để xem và cập nhật thông tin tài khoản của mình sau khi đăng nhập vào E04 Supplier Web. Hiện tại, Supplier Web chưa có màn hình quản lý profile.

Màn hình Profile cho phép Supplier:
- Xem thông tin tài khoản hiện tại: mã nhà cung cấp, tên, email, thời điểm đăng nhập lần cuối
- Chỉnh sửa tên nhà cung cấp và địa chỉ email
- Lưu thay đổi và nhận phản hồi xác nhận ngay lập tức

Mã nhà cung cấp (`supplierCode`) và trạng thái (`status`) là thông tin hệ thống — chỉ hiển thị, không cho phép chỉnh sửa.

---

## Actors & Preconditions

| Actor | Vai trò | Điều kiện tiên quyết |
|---|---|---|
| E04 — Supplier | Xem và cập nhật thông tin tài khoản | Đã đăng nhập vào E04 Supplier Web |

**Phạm vi:** Single-actor — chỉ ảnh hưởng `es-kitchen-web-supplier` (FE) và `es-kitchen-api` (BE).
> Không cần Contract Lock trước Phase 3.

---

## Happy Path

1. Supplier đăng nhập vào E04 Supplier Web thành công.
2. Supplier click vào mục **プロフィール** (Profile) trong navigation menu — truy cập route `/profile`.
3. Hệ thống gọi `GET /supplier/account/me` và hiển thị thông tin hiện tại:
   - **Supplier Code** (`supplierCode`) — read-only
   - **Supplier Name** (`supplierName`) — hiển thị dưới dạng text
   - **Email** (`email`) — hiển thị dưới dạng text
   - **Last Login At** (`lastLoginAt`) — read-only, định dạng `YYYY-MM-DD HH:mm JST`
4. Supplier click nút **編集** (Edit).
5. Trường `supplierName` và `email` chuyển sang chế độ có thể chỉnh sửa (inline edit).
6. Supplier cập nhật `supplierName` và/hoặc `email` theo nhu cầu.
7. Supplier click nút **保存** (Save).
8. Hệ thống validate dữ liệu phía client:
   - `supplierName` không được rỗng
   - `email` không được rỗng và phải đúng định dạng email
9. Nếu hợp lệ, hệ thống gọi `PATCH /supplier/account/profile` với body `{ supplierName, email }`.
10. API trả về `{ "success": true }`.
11. Hệ thống hiển thị toast thông báo thành công: **`保存しました`**.
12. Hệ thống tự động refresh dữ liệu — gọi lại `GET /supplier/account/me` và cập nhật thông tin hiển thị.

---

## Alternative Flows & Edge Cases

### AF-1: Validation thất bại — `supplierName` rỗng
- Tại Bước 8, nếu `supplierName` bị xóa trống.
- Hệ thống hiển thị lỗi inline bên dưới trường: **`仕入先名を入力してください。`**
- Nút **保存** bị block — không gọi API.
- Người dùng phải điền lại giá trị hợp lệ mới có thể lưu.

### AF-2: Validation thất bại — `email` rỗng
- Tại Bước 8, nếu `email` bị xóa trống.
- Hệ thống hiển thị lỗi inline: **`メールアドレスを入力してください。`**
- Nút **保存** bị block.

### AF-3: Validation thất bại — `email` sai định dạng
- Tại Bước 8, nếu `email` không đúng format (thiếu `@`, thiếu domain...).
- Hệ thống hiển thị lỗi inline: **`メールアドレスの形式が正しくありません。`**
- Nút **保存** bị block.

### AF-4: API lỗi khi lưu
- Tại Bước 9, nếu `PATCH /supplier/account/profile` trả về lỗi (4xx / 5xx).
- Hệ thống hiển thị toast lỗi — nội dung thông báo theo HTTP error code trả về.
- Form giữ nguyên giá trị đang nhập để Supplier có thể thử lại.

### AF-5: Supplier cancel chỉnh sửa
- Tại Bước 5–6, Supplier click nút **キャンセル** (Cancel).
- Hệ thống hủy bỏ thay đổi và khôi phục dữ liệu gốc (không gọi API).

---

## Acceptance Criteria

| ID | Mô tả |
|----|-------|
| AC-1 | Supplier truy cập được màn hình Profile từ navigation menu sau khi đăng nhập |
| AC-2 | Màn hình Profile hiển thị đúng và đầy đủ: `supplierCode`, `supplierName`, `email`, `lastLoginAt` |
| AC-3 | Click nút **編集** bật chế độ chỉnh sửa cho trường `supplierName` và `email` |
| AC-4 | Lưu thành công: hiển thị toast **`保存しました`** và dữ liệu hiển thị được cập nhật ngay lập tức |
| AC-5 | `email` rỗng hoặc sai định dạng → hiển thị lỗi validation tương ứng và block submit |
| AC-6 | `supplierName` rỗng → hiển thị lỗi validation và block submit |

---

## Out of Scope

- Đổi mật khẩu (đã có màn hình Change Password riêng biệt)
- Cập nhật trạng thái (`status`) của tài khoản Supplier
- Cập nhật mã nhà cung cấp (`supplierCode`)
- Upload ảnh đại diện / logo
- Quản lý nhiều đầu mối liên hệ (multi-contact)

---

## Open Questions

| # | Câu hỏi | Ảnh hưởng nếu Yes |
|---|---|---|
| OQ-1 | Email có cần kiểm tra tính duy nhất trên toàn bộ Supplier không? | Cần thêm logic validate ở BE + error message mới |
| OQ-2 | Hệ thống có ghi audit log khi Supplier cập nhật thông tin không? | Cần thêm entity AuditLog hoặc trigger BE |
| OQ-3 | Có yêu cầu xác thực lại (nhập lại mật khẩu) trước khi đổi email không? | Cần thêm bước confirm password trong flow |

---

## Design Notes (Designer)

**Frame:** `SW_PROF_001` — node `21065:85745`, page `AI DESIGN (New member)`, file `VKAAOyoSPvgoB3H2qdeeV3`

**Input fields:** Font `Material Symbols Rounded` không available trong Figma plugin environment, nên input fields trong frame được build thủ công từ design tokens (border-radius `action` 6px, height 40px, padding 12px, border `colors.components.divider.middle`). **Dev implement vẫn dùng component Input chuẩn từ Sparkle Design library** — đây chỉ là giới hạn render của plugin, không ảnh hưởng spec.

**Navigation:** Nav item "その他" trong E04 sidebar được rename thành "プロフィール" trong frame này. Dev cần thêm route `/profile` vào navigation config của `es-kitchen-web-supplier`.

**Error state:** Frame hiển thị `メールアドレス` ở trạng thái validation error (red border + red error message) để FE có thể tham chiếu style. Normal state tham chiếu field `仕入先名`.

---

## Screens

| Screen Code | Screen | Actor | App | Screen Type | Mô tả ngắn | Figma Link |
|---|---|---|---|---|---|---|
| SW_PROF_001 | Supplier Profile | E04 | E04 (es-kitchen-web-supplier) | Detail | Xem và chỉnh sửa thông tin tài khoản Supplier: tên, email (inline edit); hiển thị read-only: supplier code, last login | [Figma](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen?node-id=21065-85745) |
