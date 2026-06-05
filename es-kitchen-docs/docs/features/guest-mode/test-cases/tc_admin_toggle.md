# TC: System Admin Toggle Guest Payment (US-06)

> **Module:** Admin — Toggle guestPaymentAllowed per company
> **Scope:** Admin Web E03
> **Related US:** US-06
> **Related BR:** BR-04, BR-05
> **Related AC:** AC-06-1, AC-06-2, AC-06-3, AC-06-4, AC-06-5

---

## Fields phân tích trước khi sinh TC

**Form: Edit Company (form hiện có, có thêm field mới)**
- Field: Toggle `ゲスト支払いを許可する` — kiểu Boolean/Toggle switch
- Validation: không required riêng, submit cùng form Edit Company
- Default: ON (true)

---

## Bảng Test Cases

| ID | Function Name | Category | Risk Level | Test Scenario | Precondition | Steps | Expected Results | Test Data | Priority |
|---|---|---|---|---|---|---|---|---|---|
| GM_ADMIN_TC_001 | Admin Toggle | UI Visual — Edit Company Form | Medium | [UI Visual] Verify UI toggle "ゲスト支払いを許可する" trong form Edit Company | Đã đăng nhập System Admin E03, company `COMP-ADMIN-TEST-001` tồn tại | 1. Mở form Edit Company của `COMP-ADMIN-TEST-001`<br>2. Quan sát toàn bộ form, tìm toggle guest payment | 1. Toggle "ゲスト支払いを許可する" hiển thị trong form Edit Company (không phải tab mới, không phải trang mới)<br>2. Toggle có label rõ ràng<br>3. Toggle nằm gần khu vực Payment settings hoặc cuối form<br>4. Form layout không vỡ khi có thêm toggle | Company: `COMP-ADMIN-TEST-001` | High |
| GM_ADMIN_TC_002 | Admin Toggle | UI Visual — Toggle Normal ON | Low | [UI Visual] Toggle — trạng thái Normal khi ON | Đang ở form Edit Company, company chưa có setting (default) | 1. Quan sát toggle khi form mới mở | 1. Toggle ở trạng thái ON (switch to right, màu brand/green)<br>2. Label "ゲスト支払いを許可する" hiển thị rõ<br>3. Visual ON state thống nhất với design system toggle component | — | Low |
| GM_ADMIN_TC_003 | Admin Toggle | UI Visual — Toggle Normal OFF | Low | [UI Visual] Toggle — trạng thái Normal khi OFF | Toggle đã được tắt trước đó | 1. Quan sát toggle ở trạng thái OFF | 1. Toggle ở trạng thái OFF (switch to left, màu neutral/gray)<br>2. Visual OFF state thống nhất với design system | — | Low |
| GM_ADMIN_TC_004 | Admin Toggle | UI Visual — Toggle Loading | Low | [UI Visual] Toggle / form — trạng thái Loading khi đang lưu | Đang bấm Save trong form | 1. Bấm Save (submit form)<br>2. Quan sát form trong khi gọi API | 1. Loading indicator hiển thị (spinner hoặc button "Save" đổi thành "Saving...")<br>2. Form hoặc toggle disabled trong khi lưu<br>3. Không thể double-submit | — | Low |
| GM_ADMIN_TC_005 | Admin Toggle | AC-06-1 — Toggle trong form Edit Company | High | Check toggle hiển thị trong form Edit Company, không tạo tab/trang mới | Đã đăng nhập System Admin E03 | 1. Mở form Edit Company của bất kỳ company<br>2. Kiểm tra xem toggle có xuất hiện trong form không | 1. Toggle hiển thị trong body của form Edit Company<br>2. Không có tab mới, không có trang con riêng cho guest payment setting<br>3. Toggle cùng form submit với Save button của Edit Company | — | High |
| GM_ADMIN_TC_006 | Admin Toggle | AC-06-2 — Default value = ON | High | Check default value của toggle = ON khi tạo company mới | Chưa tạo company | 1. Tạo company mới (không set toggle)<br>2. Sau khi tạo, mở form Edit Company vừa tạo | 1. Toggle hiển thị với giá trị ON (true)<br>2. `guestPaymentAllowed` = true trong DB | Company mới: `COMP-NEW-DEFAULT-001` | High |
| GM_ADMIN_TC_007 | Admin Toggle | AC-06-2 — Default value company chưa có setting | High | Check company chưa có field `guestPaymentAllowed` → mặc định là ON | Company cũ (trước khi feature này deploy), không có field `guestPaymentAllowed` | 1. Mở form Edit Company của company cũ<br>2. Quan sát toggle | 1. Toggle hiển thị ON (default = true khi field null/undefined)<br>2. Guest vẫn có thể thanh toán với company này (guestPaymentAllowed mặc định true) | Company cũ: ví dụ `COMP-LEGACY-001` | High |
| GM_ADMIN_TC_008 | Admin Toggle | AC-06-3 — Lưu toggle ON→OFF | Critical | Check Admin bật Save sau khi tắt toggle → API cập nhật `guestPaymentAllowed = false` | Toggle hiện đang ON, Admin đã tắt toggle | 1. Mở Edit Company `COMP-TOGGLE-TEST-001`<br>2. Tắt toggle (ON → OFF)<br>3. Bấm Save | 1. API `PUT /companies/:id` (hoặc tương đương) được gọi<br>2. Request body có `guestPaymentAllowed: false`<br>3. Response thành công (200)<br>4. Reload form: toggle ở trạng thái OFF<br>5. Success toast/notification hiển thị | Company: `COMP-TOGGLE-TEST-001` | Critical |
| GM_ADMIN_TC_009 | Admin Toggle | AC-06-3 — Lưu toggle OFF→ON | Critical | Check Admin bật toggle từ OFF→ON → API cập nhật `guestPaymentAllowed = true` | Toggle hiện đang OFF | 1. Mở Edit Company `COMP-TOGGLE-TEST-002` (đang OFF)<br>2. Bật toggle (OFF → ON)<br>3. Bấm Save | 1. API cập nhật `guestPaymentAllowed: true`<br>2. Response 200<br>3. Reload form: toggle ở ON<br>4. Guest có thể thanh toán với company này trong lần checkout tiếp theo | Company: `COMP-TOGGLE-TEST-002` | Critical |
| GM_ADMIN_TC_010 | Admin Toggle | AC-06-4 — Thay đổi có hiệu lực với lần checkout tiếp theo | High | Check tắt toggle → guest không thanh toán được trong checkout tiếp theo (không cần reload server) | Company `COMP-TOGGLE-TEST-001` vừa được tắt guestPaymentAllowed (TC_008 pass) | 1. Guest bắt đầu checkout mới với Company ID `COMP-TOGGLE-TEST-001`<br>2. Submit Company ID | 1. API validate trả về `guestPaymentAllowed = false`<br>2. App block checkout với message "この会社はゲストの支払いを許可していません"<br>3. Hiệu lực ngay không cần server restart | Company: `COMP-TOGGLE-TEST-001` (vừa tắt) | High |
| GM_ADMIN_TC_011 | Admin Toggle | AC-06-5 — Toggle submit cùng form | High | Check toggle không có endpoint riêng, submit cùng với form Edit Company | Đang ở form Edit Company | 1. Thay đổi toggle (ON → OFF)<br>2. KHÔNG bấm Save ngay<br>3. Thay đổi một field khác trong form (ví dụ: tên công ty)<br>4. Bấm Save | 1. Một request API duy nhất được gửi (không phải 2 request riêng cho toggle và form)<br>2. Cả toggle value và field khác đều được lưu trong cùng 1 request<br>3. Nếu Save thất bại → cả hai thay đổi đều không được lưu (atomic) | Toggle: OFF<br>Tên công ty: `テスト会社 Updated` | High |
| GM_ADMIN_TC_012 | Admin Toggle | AC-06-5 — Bỏ qua (discard changes) | Medium | Check nếu Admin thay đổi toggle nhưng không Save → không có thay đổi | Đang ở form Edit Company, toggle đang ON | 1. Tắt toggle (ON → OFF)<br>2. Bấm Cancel / Navigate away mà không Save<br>3. Mở lại form Edit Company | 1. Toggle vẫn ở trạng thái ON (thay đổi không được lưu)<br>2. `guestPaymentAllowed` vẫn = true trong DB | — | Medium |
| GM_ADMIN_TC_013 | Admin Toggle | AC-06-1 — Company Admin E02 không có toggle | High | Check Company Admin Web (E02) KHÔNG có toggle guest payment (chỉ E03 có) | Đã đăng nhập Company Admin E02 | 1. Mở form Edit Company trong E02<br>2. Tìm toggle "ゲスト支払いを許可する" | 1. Toggle không hiển thị trong E02<br>2. E02 không có khả năng thay đổi setting này | Account E02: `qc_e02_admin@eskitchen.test` | High |
