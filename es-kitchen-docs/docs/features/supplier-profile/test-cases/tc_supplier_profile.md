# Test Cases — Supplier My Page (プロフィール)

**Feature:** Supplier Profile  
**Screen:** SW_PROF_001  
**Actor:** E04 — Supplier  
**App:** es-kitchen-web-supplier  
**Mode:** QUICK  
**Ngày tạo:** 2026-06-18  
**Người tạo:** QC Agent  
**Note:** TC base only — refine sau khi Designer hoàn thành Figma cho SW_PROF_001.

---

## Mục lục

1. [UI Tổng thể — SW_PROF_001](#1-ui-tổng-thể--sw_prof_001)
2. [Visual States — Field supplierName](#2-visual-states--field-suppliername)
3. [Visual States — Field email](#3-visual-states--field-email)
4. [AC-1: Truy cập màn hình Profile](#4-ac-1-truy-cập-màn-hình-profile)
5. [AC-2: Hiển thị thông tin tài khoản](#5-ac-2-hiển-thị-thông-tin-tài-khoản)
6. [AC-3: Bật chế độ chỉnh sửa](#6-ac-3-bật-chế-độ-chỉnh-sửa)
7. [AC-4: Lưu thành công](#7-ac-4-lưu-thành-công)
8. [AC-5 + AC-6: Validation — supplierName và email](#8-ac-5--ac-6-validation--suppliername-và-email)
9. [AF-4: API lỗi khi lưu](#9-af-4-api-lỗi-khi-lưu)
10. [AF-5: Cancel chỉnh sửa](#10-af-5-cancel-chỉnh-sửa)
11. [Security Validation](#11-security-validation)
12. [Boundary / Edge Cases](#12-boundary--edge-cases)
13. [Traceability — AC → TC](#13-traceability--ac--tc)

---

## 1. UI Tổng thể — SW_PROF_001

| TC ID | Tên TC | Precondition | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| TC-SW_PROF_001-001 | Verify UI tổng thể màn hình Profile — chế độ xem | Đã đăng nhập E04 với tài khoản Supplier hợp lệ. Truy cập route `/profile`. API `GET /supplier/account/me` trả về dữ liệu thành công. | 1. Mở màn hình `/profile`. 2. Quan sát toàn bộ layout. | - Màn hình hiển thị đúng layout E04 (sidebar ~120px, header ~56px, theme purple `#6639BA`). - Có 4 trường thông tin: Supplier Code, Supplier Name, Email, Last Login At. - Nút **編集** hiển thị và có thể click. - Không hiển thị nút **保存** hoặc **キャンセル** ở chế độ xem. | High |
| TC-SW_PROF_001-002 | Verify UI tổng thể màn hình Profile — chế độ chỉnh sửa | Đã ở màn hình `/profile`. Đã click nút **編集**. | 1. Click nút **編集**. 2. Quan sát layout thay đổi. | - Trường `supplierName` và `email` chuyển sang dạng input có thể nhập. - Trường `supplierCode` và `lastLoginAt` vẫn read-only, không có input box. - Nút **保存** và **キャンセル** hiển thị thay thế nút **編集**. | High |

---

## 2. Visual States — Field supplierName

| TC ID | Tên TC | Precondition | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| TC-SW_PROF_001-010 | supplierName — State Normal (chế độ xem) | Màn hình Profile ở chế độ xem (chưa click **編集**). Dữ liệu hiện tại: `supplierName = "株式会社テスト食材"`. | 1. Quan sát trường Supplier Name. | Trường hiển thị text `株式会社テスト食材` dưới dạng read-only (không có border input). Không có icon edit inline. | Medium |
| TC-SW_PROF_001-011 | supplierName — State Normal (chế độ edit, chưa focus) | Đã click **編集**. Trường `supplierName` đang hiển thị dạng input nhưng chưa được click vào. | 1. Quan sát input `supplierName` sau khi vào chế độ edit. | Input box hiển thị với giá trị hiện tại `株式会社テスト食材` đã prefill. Border mặc định (không highlight). | Medium |
| TC-SW_PROF_001-012 | supplierName — State Focus | Đã click **編集**. | 1. Click vào input `supplierName`. | Input có border highlight (focus ring, màu `#096cdc`). Cursor đặt ở cuối text. | Medium |
| TC-SW_PROF_001-013 | supplierName — State Filled (đã nhập giá trị) | Đã click **編集**. Đang focus vào input `supplierName`. | 1. Xóa hết text cũ. 2. Nhập `テスト仕入先株式会社`. | Input hiển thị đúng text vừa nhập. Không hiển thị error message. | Medium |
| TC-SW_PROF_001-014 | supplierName — State Error (rỗng) | Đã click **編集**. | 1. Xóa hết nội dung trường `supplierName`. 2. Click vào trường `email` hoặc click **保存**. | Border input chuyển màu đỏ (error). Hiển thị message lỗi inline bên dưới: `仕入先名を入力してください。` | High |
| TC-SW_PROF_001-015 | supplierName — State Disabled | Màn hình Profile ở chế độ xem (chưa vào edit mode). | 1. Thử click trực tiếp vào text `supplierName`. | Không có phản hồi click. Trường không chuyển sang input mode. Cursor không đổi. | Medium |

---

## 3. Visual States — Field email

| TC ID | Tên TC | Precondition | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| TC-SW_PROF_001-020 | email — State Normal (chế độ xem) | Màn hình Profile ở chế độ xem. Dữ liệu hiện tại: `email = "qc_prof_001@eskitchen.test"`. | 1. Quan sát trường Email. | Trường hiển thị text `qc_prof_001@eskitchen.test` dạng read-only. Không có input border. | Medium |
| TC-SW_PROF_001-021 | email — State Normal (chế độ edit, chưa focus) | Đã click **編集**. Input `email` chưa được click. | 1. Quan sát input `email` sau khi vào chế độ edit. | Input box hiển thị với giá trị hiện tại `qc_prof_001@eskitchen.test` đã prefill. Border mặc định. | Medium |
| TC-SW_PROF_001-022 | email — State Focus | Đã click **編集**. | 1. Click vào input `email`. | Input có border highlight (focus ring, màu `#096cdc`). Cursor đặt ở cuối text. | Medium |
| TC-SW_PROF_001-023 | email — State Filled (đã nhập giá trị hợp lệ) | Đã click **編集**. Đang focus vào input `email`. | 1. Xóa hết text cũ. 2. Nhập `qc_prof_updated_20260618@eskitchen.test`. | Input hiển thị đúng text vừa nhập. Không hiển thị error message. | Medium |
| TC-SW_PROF_001-024 | email — State Error (rỗng) | Đã click **編集**. | 1. Xóa hết nội dung trường `email`. 2. Click **保存**. | Border input chuyển màu đỏ. Hiển thị message lỗi inline: `メールアドレスを入力してください。` Nút **保存** bị block (không gọi API). | High |
| TC-SW_PROF_001-025 | email — State Error (sai định dạng) | Đã click **編集**. | 1. Nhập `qc_prof_invalid_email` (không có `@`). 2. Click **保存**. | Border input chuyển màu đỏ. Hiển thị message lỗi inline: `メールアドレスの形式が正しくありません。` Nút **保存** bị block. | High |
| TC-SW_PROF_001-026 | email — State Disabled | Màn hình Profile ở chế độ xem (chưa vào edit mode). | 1. Thử click trực tiếp vào text `email`. | Không có phản hồi click. Trường không chuyển sang input mode. | Medium |

---

## 4. AC-1: Truy cập màn hình Profile

| TC ID | Tên TC | Precondition | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| TC-SW_PROF_001-030 | Truy cập màn hình Profile từ navigation menu | Đã đăng nhập E04 thành công với tài khoản: `username: qc_supplier_test`, `password: (dùng account test DEV)`. Đang ở màn hình TOP (trang chủ). | 1. Quan sát navigation menu bên trái. 2. Click mục **プロフィール** trong menu. | - Route chuyển sang `/profile`. - Màn hình Profile hiển thị (không có lỗi 404 hay redirect). - API `GET /supplier/account/me` được gọi. - Thông tin tài khoản hiển thị sau khi load. | High |
| TC-SW_PROF_001-031 | Truy cập màn hình Profile bằng URL trực tiếp — đã đăng nhập | Đã đăng nhập E04. | 1. Nhập trực tiếp `<base_url>/profile` vào thanh địa chỉ. 2. Nhấn Enter. | Màn hình Profile hiển thị bình thường. | Medium |
| TC-SW_PROF_001-032 | Truy cập màn hình Profile bằng URL trực tiếp — chưa đăng nhập | Chưa đăng nhập E04. Session đã hết hạn hoặc chưa có. | 1. Nhập trực tiếp `<base_url>/profile` vào thanh địa chỉ. 2. Nhấn Enter. | Hệ thống redirect về trang Login. Không hiển thị dữ liệu Profile. | High |

---

## 5. AC-2: Hiển thị thông tin tài khoản

| TC ID | Tên TC | Precondition | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| TC-SW_PROF_001-040 | Hiển thị đủ 4 trường thông tin | Đã đăng nhập E04. API `GET /supplier/account/me` trả về: `{ supplierCode: "SUP-001", supplierName: "株式会社テスト食材", email: "qc_prof_001@eskitchen.test", lastLoginAt: "2026-06-17T10:30:00+09:00" }`. | 1. Truy cập màn hình `/profile`. 2. Đợi dữ liệu load xong. | - **Supplier Code:** `SUP-001` — hiển thị đúng. - **Supplier Name:** `株式会社テスト食材` — hiển thị đúng. - **Email:** `qc_prof_001@eskitchen.test` — hiển thị đúng. - **Last Login At:** `2026-06-17 10:30 JST` — định dạng `YYYY-MM-DD HH:mm JST`. | High |
| TC-SW_PROF_001-041 | Supplier Code và Last Login At là read-only | Đã đăng nhập. Đã click **編集** để vào chế độ edit. | 1. Quan sát trường `supplierCode`. 2. Quan sát trường `lastLoginAt`. 3. Thử click vào từng trường. | - `supplierCode`: không có input box, không thể click để chỉnh sửa. - `lastLoginAt`: không có input box, không thể click để chỉnh sửa. | High |
| TC-SW_PROF_001-042 | Loading state — khi API đang fetch | Đã đăng nhập. API `GET /supplier/account/me` bị delay (simulate slow network). | 1. Truy cập màn hình `/profile`. 2. Quan sát trong khi API đang chờ response. | Màn hình hiển thị loading indicator (spinner hoặc skeleton). Không hiển thị dữ liệu rỗng hoặc lỗi sớm. | Medium |
| TC-SW_PROF_001-043 | Định dạng lastLoginAt hiển thị đúng | Đã đăng nhập. API trả về `lastLoginAt: "2026-06-17T00:00:00+09:00"`. | 1. Truy cập `/profile`. | `lastLoginAt` hiển thị: `2026-06-17 00:00 JST`. Không hiển thị UTC offset (+09:00) trong UI. | Medium |

---

## 6. AC-3: Bật chế độ chỉnh sửa

| TC ID | Tên TC | Precondition | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| TC-SW_PROF_001-050 | Click 編集 — chuyển supplierName và email sang input | Đã ở màn hình `/profile`. Dữ liệu đã load. Đang ở chế độ xem. | 1. Click nút **編集**. | - Trường `supplierName` chuyển thành input text, có giá trị hiện tại prefill. - Trường `email` chuyển thành input email, có giá trị hiện tại prefill. - Trường `supplierCode` và `lastLoginAt` vẫn giữ nguyên dạng text (read-only). - Nút **編集** ẩn đi. - Nút **保存** và **キャンセル** hiển thị. | High |
| TC-SW_PROF_001-051 | Giá trị prefill trong input khớp với dữ liệu hiển thị trước đó | Dữ liệu hiển thị trước khi edit: `supplierName = "株式会社テスト食材"`, `email = "qc_prof_001@eskitchen.test"`. | 1. Click **編集**. 2. Quan sát giá trị trong input. | - Input `supplierName` chứa `株式会社テスト食材`. - Input `email` chứa `qc_prof_001@eskitchen.test`. | High |

---

## 7. AC-4: Lưu thành công

| TC ID | Tên TC | Precondition | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| TC-SW_PROF_001-060 | Lưu thành công — cập nhật cả supplierName và email | Đã click **編集**. API `PATCH /supplier/account/profile` được mock trả về `{ "success": true }`. | 1. Sửa `supplierName` thành `テスト食材株式会社（更新）`. 2. Sửa `email` thành `qc_prof_updated_20260618@eskitchen.test`. 3. Click **保存**. | - Toast thông báo thành công hiển thị: `保存しました`. - API `PATCH /supplier/account/profile` được gọi với body `{ "supplierName": "テスト食材株式会社（更新）", "email": "qc_prof_updated_20260618@eskitchen.test" }`. - API `GET /supplier/account/me` được gọi lại sau khi lưu. - Dữ liệu hiển thị cập nhật thành giá trị mới. - Form trở về chế độ xem. Nút **保存** / **キャンセル** ẩn. Nút **編集** hiển thị lại. | Critical |
| TC-SW_PROF_001-061 | Lưu thành công — chỉ cập nhật supplierName | Đã click **編集**. | 1. Sửa `supplierName` thành `更新済み食材会社`. 2. Giữ nguyên `email`. 3. Click **保存**. | - Toast `保存しました` hiển thị. - `supplierName` hiển thị `更新済み食材会社`. - `email` không thay đổi. | High |
| TC-SW_PROF_001-062 | Lưu thành công — chỉ cập nhật email | Đã click **編集**. | 1. Giữ nguyên `supplierName`. 2. Sửa `email` thành `qc_prof_emailonly_20260618@eskitchen.test`. 3. Click **保存**. | - Toast `保存しました` hiển thị. - `email` hiển thị `qc_prof_emailonly_20260618@eskitchen.test`. - `supplierName` không thay đổi. | High |
| TC-SW_PROF_001-063 | Lưu khi không thay đổi gì — nhấn 保存 với dữ liệu gốc | Đã click **編集**. Không thay đổi gì trong input. | 1. Click **保存** ngay mà không sửa gì. | - API `PATCH /supplier/account/profile` được gọi với giá trị hiện tại. - Toast `保存しました` hiển thị. - Dữ liệu không thay đổi. | Medium |

---

## 8. AC-5 + AC-6: Validation — supplierName và email

### 8.1 Validation — supplierName

| TC ID | Tên TC | Precondition | Test Data | Steps | Expected Result | Priority |
|---|---|---|---|---|---|---|
| TC-SW_PROF_001-070 | supplierName — validation: rỗng (xóa hết text) | Đã click **編集**. | `supplierName = ""` (chuỗi rỗng) | 1. Xóa hết nội dung trường `supplierName`. 2. Click **保存**. | - Error message hiển thị inline bên dưới field: `仕入先名を入力してください。` - API `PATCH` không được gọi. - Nút **保存** bị block. | High |
| TC-SW_PROF_001-071 | supplierName — validation: chỉ có khoảng trắng | Đã click **編集**. | `supplierName = "   "` (3 spaces) | 1. Nhập 3 dấu cách vào trường `supplierName`. 2. Click **保存**. | - Error message: `仕入先名を入力してください。` (trim khoảng trắng → coi là rỗng). - API không được gọi. | High |

### 8.2 Validation — email

| TC ID | Tên TC | Precondition | Test Data | Steps | Expected Result | Priority |
|---|---|---|---|---|---|---|
| TC-SW_PROF_001-080 | email — validation: rỗng | Đã click **編集**. | `email = ""` | 1. Xóa hết nội dung trường `email`. 2. Click **保存**. | Error message: `メールアドレスを入力してください。` Nút **保存** bị block. API không được gọi. | High |
| TC-SW_PROF_001-081 | email — validation: thiếu ký tự @ | Đã click **編集**. | `email = "qcprofeskitchen.test"` | 1. Nhập `qcprofeskitchen.test` vào trường `email`. 2. Click **保存**. | Error message: `メールアドレスの形式が正しくありません。` Nút **保存** bị block. | High |
| TC-SW_PROF_001-082 | email — validation: thiếu domain sau @ | Đã click **編集**. | `email = "qc_prof@"` | 1. Nhập `qc_prof@` vào trường `email`. 2. Click **保存**. | Error message: `メールアドレスの形式が正しくありません。` Nút **保存** bị block. | High |
| TC-SW_PROF_001-083 | email — validation: thiếu TLD (top-level domain) | Đã click **編集**. | `email = "qc_prof@eskitchen"` | 1. Nhập `qc_prof@eskitchen` vào trường `email`. 2. Click **保存**. | Error message: `メールアドレスの形式が正しくありません。` Nút **保存** bị block. | Medium |
| TC-SW_PROF_001-084 | email — validation: có khoảng trắng trong email | Đã click **編集**. | `email = "qc prof@eskitchen.test"` | 1. Nhập `qc prof@eskitchen.test` vào trường `email`. 2. Click **保存**. | Error message: `メールアドレスの形式が正しくありません。` Nút **保存** bị block. | Medium |
| TC-SW_PROF_001-085 | email — validation hợp lệ (positive) | Đã click **編集**. | `email = "qc_prof_valid_20260618@eskitchen.test"` | 1. Nhập `qc_prof_valid_20260618@eskitchen.test`. 2. Click **保存**. | Không hiển thị error. API được gọi bình thường. | High |

### 8.3 Validation — cả 2 field cùng rỗng

| TC ID | Tên TC | Precondition | Test Data | Steps | Expected Result | Priority |
|---|---|---|---|---|---|---|
| TC-SW_PROF_001-090 | Cả supplierName và email đều rỗng | Đã click **編集**. | `supplierName = ""`, `email = ""` | 1. Xóa hết `supplierName`. 2. Xóa hết `email`. 3. Click **保存**. | - Error message của `supplierName`: `仕入先名を入力してください。` - Error message của `email`: `メールアドレスを入力してください。` - Cả 2 error hiển thị đồng thời. - API không được gọi. | High |

---

## 9. AF-4: API lỗi khi lưu

| TC ID | Tên TC | Precondition | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| TC-SW_PROF_001-100 | API lỗi 400 khi lưu | Đã click **編集**. API `PATCH /supplier/account/profile` được mock trả về HTTP 400. | 1. Nhập dữ liệu hợp lệ: `supplierName = "エラーテスト株式会社"`, `email = "qc_prof_error400@eskitchen.test"`. 2. Click **保存**. | - Toast lỗi hiển thị với nội dung tương ứng HTTP 400. - Form giữ nguyên giá trị vừa nhập (không bị reset về giá trị gốc). - Không chuyển về chế độ xem. Supplier có thể thử lại. | High |
| TC-SW_PROF_001-101 | API lỗi 500 khi lưu | Đã click **編集**. API `PATCH /supplier/account/profile` được mock trả về HTTP 500. | 1. Nhập: `supplierName = "サーバーエラーテスト"`, `email = "qc_prof_error500@eskitchen.test"`. 2. Click **保存**. | - Toast lỗi hiển thị. - Form giữ nguyên giá trị đang nhập. - Supplier có thể click **保存** lại để retry. | High |
| TC-SW_PROF_001-102 | Mất kết nối mạng khi lưu (network timeout) | Đã click **編集**. Simulate: tắt mạng hoặc throttle đến offline. | 1. Nhập dữ liệu hợp lệ. 2. Click **保存**. | - Hệ thống hiển thị thông báo lỗi (network error hoặc timeout). - Form giữ nguyên giá trị. - Không hiển thị toast `保存しました`. | Medium |

---

## 10. AF-5: Cancel chỉnh sửa

| TC ID | Tên TC | Precondition | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| TC-SW_PROF_001-110 | Cancel — dữ liệu khôi phục về giá trị gốc | Đã click **編集**. Dữ liệu gốc: `supplierName = "株式会社テスト食材"`, `email = "qc_prof_001@eskitchen.test"`. | 1. Sửa `supplierName` thành `変更しないこと`. 2. Sửa `email` thành `qc_prof_changed@eskitchen.test`. 3. Click **キャンセル**. | - `supplierName` hiển thị lại `株式会社テスト食材`. - `email` hiển thị lại `qc_prof_001@eskitchen.test`. - Form trở về chế độ xem (không có input box). - Nút **編集** hiển thị lại. - Nút **保存** / **キャンセル** ẩn. - API không được gọi. | High |
| TC-SW_PROF_001-111 | Cancel — không gọi API | Đã click **編集**. | 1. Nhập bất kỳ giá trị mới vào `supplierName` hoặc `email`. 2. Click **キャンセル**. | Network tab không ghi nhận request `PATCH /supplier/account/profile`. | High |
| TC-SW_PROF_001-112 | Cancel sau khi đã có validation error | Đã click **編集**. Đã xóa `supplierName` → đang có error message. | 1. Xóa hết `supplierName` → error message xuất hiện. 2. Click **キャンセル**. | - Error message biến mất. - `supplierName` khôi phục về giá trị gốc. - Form trở về chế độ xem bình thường. | Medium |

---

## 11. Security Validation

| TC ID | Tên TC | Precondition | Test Data | Steps | Expected Result | Priority |
|---|---|---|---|---|---|---|
| TC-SW_PROF_001-120 | XSS — supplierName: nhập script tag | Đã click **編集**. | `supplierName = "<script>alert('XSS')</script>"` | 1. Nhập `<script>alert('XSS')</script>` vào trường `supplierName`. 2. Click **保存** (giả sử pass validation vì có ký tự). | - Không có dialog alert xuất hiện. - Giá trị được render dưới dạng text thuần (escaped), không được execute. - API nhận chuỗi escaped an toàn. | Critical |
| TC-SW_PROF_001-121 | XSS — supplierName: nhập event handler | Đã click **編集**. | `supplierName = "<img src=x onerror=alert(1)>"` | 1. Nhập `<img src=x onerror=alert(1)>` vào trường `supplierName`. 2. Lưu và xem lại. | - Không có alert hoặc script nào được thực thi. - Giá trị hiển thị dưới dạng text escaped. | Critical |
| TC-SW_PROF_001-122 | SQL Injection — supplierName | Đã click **編集**. | `supplierName = "'; DROP TABLE suppliers; --"` | 1. Nhập `'; DROP TABLE suppliers; --` vào trường `supplierName`. 2. Click **保存**. | - Hệ thống xử lý bình thường (lưu chuỗi literal hoặc sanitize). - Không có lỗi SQL hay crash server. - Dữ liệu khác trong hệ thống không bị ảnh hưởng. | Critical |
| TC-SW_PROF_001-123 | XSS — email: nhập giá trị có HTML | Đã click **編集**. | `email = "<b>test</b>@eskitchen.test"` | 1. Nhập `<b>test</b>@eskitchen.test` vào trường `email`. 2. Click **保存**. | - Validation frontend bắt lỗi định dạng email (chứa ký tự `<>` không hợp lệ). - Nếu pass validation, không render HTML khi hiển thị lại. | High |

---

## 12. Boundary / Edge Cases

| TC ID | Tên TC | Precondition | Test Data | Steps | Expected Result | Priority |
|---|---|---|---|---|---|---|
| TC-SW_PROF_001-130 | supplierName — boundary: 1 ký tự (min) | Đã click **編集**. | `supplierName = "A"` | 1. Nhập 1 ký tự `A`. 2. Click **保存**. | Lưu thành công. Toast `保存しました` hiển thị. | Medium |
| TC-SW_PROF_001-131 | supplierName — chuỗi rất dài (255 ký tự) | Đã click **編集**. | `supplierName = "テ" × 255` (255 ký tự kanji) | 1. Nhập chuỗi 255 ký tự. 2. Click **保存**. | - Nếu hệ thống có giới hạn: hiển thị thông báo lỗi max-length rõ ràng. - Nếu không giới hạn: lưu thành công. | Medium |
| TC-SW_PROF_001-132 | email — boundary: email rất dài (254 ký tự — RFC 5321 max) | Đã click **編集**. | `email = "aaa...254chars...@eskitchen.test"` (tổng 254 ký tự) | 1. Nhập email 254 ký tự hợp lệ. 2. Click **保存**. | Lưu thành công (nếu trong giới hạn RFC). | Medium |
| TC-SW_PROF_001-133 | supplierName — ký tự đặc biệt hợp lệ | Đã click **編集**. | `supplierName = "株式会社テスト・食材（東京）"` | 1. Nhập ký tự tiếng Nhật có dấu chấm giữa và dấu ngoặc. 2. Click **保存**. | Lưu thành công. Hiển thị đúng ký tự tiếng Nhật. | Medium |
| TC-SW_PROF_001-134 | email — địa chỉ email với subdomain | Đã click **編集**. | `email = "qc_prof@test.subdomain.eskitchen.test"` | 1. Nhập email với subdomain. 2. Click **保存**. | Validation pass (định dạng hợp lệ). Lưu thành công. | Low |
| TC-SW_PROF_001-135 | Reload trang giữa chừng khi đang edit | Đã click **編集**. Đã nhập dữ liệu mới nhưng chưa lưu. | — | 1. Sửa `supplierName` thành giá trị mới. 2. Nhấn F5 reload trang. | - Trang reload và hiển thị dữ liệu gốc từ API (không bị lưu). - Form trở về chế độ xem. | Medium |

---

## 13. Traceability — AC → TC

| AC ID (SPEC.md) | Mô tả AC | TC IDs cover |
|---|---|---|
| AC-1 | Supplier truy cập được màn hình Profile từ navigation menu sau khi đăng nhập | TC-SW_PROF_001-030, TC-SW_PROF_001-031, TC-SW_PROF_001-032 |
| AC-2 | Màn hình Profile hiển thị đúng và đầy đủ: `supplierCode`, `supplierName`, `email`, `lastLoginAt` | TC-SW_PROF_001-040, TC-SW_PROF_001-041, TC-SW_PROF_001-042, TC-SW_PROF_001-043 |
| AC-3 | Click nút **編集** bật chế độ chỉnh sửa cho trường `supplierName` và `email` | TC-SW_PROF_001-050, TC-SW_PROF_001-051 |
| AC-4 | Lưu thành công: hiển thị toast **`保存しました`** và dữ liệu hiển thị được cập nhật ngay lập tức | TC-SW_PROF_001-060, TC-SW_PROF_001-061, TC-SW_PROF_001-062, TC-SW_PROF_001-063 |
| AC-5 | `email` rỗng hoặc sai định dạng → hiển thị lỗi validation tương ứng và block submit | TC-SW_PROF_001-080, TC-SW_PROF_001-081, TC-SW_PROF_001-082, TC-SW_PROF_001-083, TC-SW_PROF_001-084, TC-SW_PROF_001-085, TC-SW_PROF_001-024, TC-SW_PROF_001-025 |
| AC-6 | `supplierName` rỗng → hiển thị lỗi validation và block submit | TC-SW_PROF_001-070, TC-SW_PROF_001-071, TC-SW_PROF_001-014 |

**Tổng kết coverage:** 6/6 AC được cover (100%).

---

## Thống kê bộ TC

| Nhóm | Số TC | Priority Breakdown |
|---|---|---|
| UI Tổng thể (SW_PROF_001) | 2 | 2 High |
| Visual States — supplierName | 6 | 1 High, 5 Medium |
| Visual States — email | 7 | 2 High, 5 Medium |
| AC-1: Truy cập | 3 | 2 High, 1 Medium |
| AC-2: Hiển thị thông tin | 4 | 2 High, 2 Medium |
| AC-3: Bật chế độ edit | 2 | 2 High |
| AC-4: Lưu thành công | 4 | 1 Critical, 2 High, 1 Medium |
| AC-5+6: Validation | 10 | 6 High, 3 Medium, 1 High |
| AF-4: API lỗi | 3 | 2 High, 1 Medium |
| AF-5: Cancel | 3 | 2 High, 1 Medium |
| Security | 4 | 3 Critical, 1 High |
| Boundary / Edge Cases | 6 | 4 Medium, 1 Medium, 1 Low |
| **Tổng** | **54** | **4 Critical · 25 High · 24 Medium · 1 Low** |

---

## Open Questions cần xác nhận trước khi test

> Các câu hỏi sau từ SPEC.md ## Open Questions có thể ảnh hưởng đến bộ TC. QC cần xác nhận với BA/BE trước khi thực thi.

| OQ ID | Câu hỏi | TC bị ảnh hưởng | Hành động cần làm |
|---|---|---|---|
| OQ-1 | Email có cần kiểm tra tính duy nhất trên toàn bộ Supplier không? | TC-SW_PROF_001-085, 060, 061, 062 | Nếu YES: thêm TC mới "email trùng với supplier khác → lỗi 409 + error message". |
| OQ-2 | Hệ thống có ghi audit log khi Supplier cập nhật thông tin không? | TC-SW_PROF_001-060 đến 063 | Nếu YES: thêm TC verify audit log entry sau khi lưu thành công. |
| OQ-3 | Có yêu cầu xác thực lại (nhập lại mật khẩu) trước khi đổi email không? | TC-SW_PROF_001-060, 062 | Nếu YES: cần thêm nhóm TC cho bước confirm password — cả happy path lẫn wrong password. |
