# TC: Order History Guest Session (US-05)

> **Module:** Order History — Guest session data persistence
> **Scope:** Mobile App E01 + API (indirect)
> **Related US:** US-05
> **Related BR:** BR-13
> **Related AC:** AC-05-1, AC-05-2, AC-05-3, AC-05-4

---

## Bảng Test Cases

| ID | Function Name | Category | Risk Level | Test Scenario | Precondition | Steps | Expected Results | Test Data | Priority |
|---|---|---|---|---|---|---|---|---|---|
| GM_HISTORY_TC_001 | Order History | UI Visual — Order History Screen | Medium | [UI Visual] Verify UI màn hình Order History với guest | Đã đăng nhập guest, đã đặt ít nhất 1 đơn | 1. Đăng nhập guest<br>2. Navigate tới Order History | 1. Màn Order History accessible (không redirect)<br>2. Danh sách orders hiển thị đúng<br>3. Có thể xem chi tiết order | — | Medium |
| GM_HISTORY_TC_002 | Order History | AC-05-1 — Xem order history của mình | High | Check guest xem được order history của chính session hiện tại | Đã đăng nhập guest (userId = `guest_uid_001`), đã đặt 2 đơn | 1. Đặt đơn 1 (Order ID: ghi lại)<br>2. Đặt đơn 2 (Order ID: ghi lại)<br>3. Mở Order History | 1. Danh sách hiển thị đúng 2 orders đã đặt<br>2. Order IDs khớp với IDs ghi lại<br>3. Filter đúng theo userId của guest hiện tại | Orders thuộc guest userId `guest_uid_001` | High |
| GM_HISTORY_TC_003 | Order History | AC-05-2 — Chỉ thấy orders của session hiện tại | High | Check guest KHÔNG thấy orders của guest khác (isolation theo userId) | Guest A (userId A) và Guest B (userId B) đều đã đặt đơn | 1. Đăng nhập với Guest A<br>2. Mở Order History | 1. Chỉ thấy orders của Guest A<br>2. Không thấy orders của Guest B<br>3. API filter đúng theo `userId` của guest hiện tại | Guest A userId: khác Guest B userId | High |
| GM_HISTORY_TC_004 | Order History | AC-05-3 — Xóa app + cài lại → Order History rỗng | High | Check xóa app rồi cài lại → guest mới → Order History rỗng | Đã đặt đơn với guest session cũ, xóa app | 1. Ghi lại Order IDs của guest cũ<br>2. Xóa app<br>3. Cài lại app<br>4. Bấm Guest Mode → guest mới được tạo<br>5. Mở Order History | 1. Order History trống (empty state)<br>2. Không có orders từ guest cũ hiển thị<br>3. Empty state message thân thiện (ví dụ: "注文履歴はありません") | Guest cũ userId: ghi lại để so sánh | High |
| GM_HISTORY_TC_005 | Order History | AC-05-4 — Order history sau upgrade | Critical | Check sau khi upgrade thành full account, order history của guest giữ nguyên | Đã đăng nhập guest, đặt 3 đơn hàng (ghi lại Order IDs), vừa upgrade thành công | 1. Ghi lại 3 Order IDs trước upgrade<br>2. Upgrade thành full account<br>3. Mở Order History | 1. 3 orders hiển thị đầy đủ trong Order History<br>2. Order IDs khớp<br>3. Orders gắn vào full account (không mất data)<br>4. Full account đăng xuất + đăng nhập lại cũng vẫn thấy orders cũ | 3 Order IDs từ guest session | Critical |
| GM_HISTORY_TC_006 | Order History | BR-13 — Token invalid → không truy cập được history cũ | High | Check khi token bị expire/revoke, guest không thể truy cập order history của session cũ | Guest session cũ với orders, token đã bị expire | 1. Force expire token của guest<br>2. App tạo guest mới (BR-08)<br>3. Mở Order History | 1. Order History rỗng (guest mới chưa có orders)<br>2. Orders từ guest cũ không hiển thị (khác userId)<br>3. Không có data leak giữa 2 guest session | — | High |
| GM_HISTORY_TC_007 | Order History | US-05 — Order History empty state | Low | Check màn hình Order History khi guest chưa đặt đơn nào | Đã đăng nhập guest, chưa đặt đơn nào | 1. Đăng nhập guest mới<br>2. Mở Order History ngay | 1. Màn Order History hiển thị empty state<br>2. Message thân thiện (ví dụ: "まだ注文がありません")<br>3. Không crash, không hiển thị lỗi không rõ ràng | — | Medium |
| GM_HISTORY_TC_008 | Order History | US-05 — Xem chi tiết order | Medium | Check guest xem được chi tiết từng order trong history | Đã đặt ít nhất 1 đơn trong session | 1. Mở Order History<br>2. Tap vào 1 order trong danh sách | 1. Màn chi tiết order hiển thị đúng thông tin: tên món, số lượng, giá, tổng, trạng thái đơn<br>2. Không hiển thị thông tin của user khác | Order đã đặt trong session | Medium |
