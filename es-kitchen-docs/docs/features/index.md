# OVERVIEW

> Trang tổng hợp toàn bộ SPEC.md trong `/features`.
> Mỗi dòng = 1 Feature → 1 SPEC.md tương ứng.

**Tổng:** 13 Business Flows + 12 Features khác = 25 SPEC.md
**Last updated:** 2026-07-14

---

## 1. Business Flow

| BF# | Business Flow | Mô tả ngắn gọn | URL |
|---|---|---|---|
| BF01 | Contract Management (Hợp đồng) | Đăng ký dùng thử, hợp đồng chính thức, plan, location, yêu cầu thay đổi/hủy. | [SPEC](http://wiki.es-kitchen.co.jp/features/contract-management/SPEC/) |
| BF02 | Menu & Order (Thực đơn & Đặt hàng) | Quản lý menu (PDF + AI PRO recommendation), End User đặt món, chốt đơn theo deadline. | [SPEC](http://wiki.es-kitchen.co.jp/features/menu-order/SPEC/) |
| BF03 | Delivery Dispatching (Giao hàng — Điều phối) | Sắp lịch picking/delivery, tích hợp Yamato API + Thomas CSV, duyệt yêu cầu đổi ngày. | [SPEC](http://wiki.es-kitchen.co.jp/features/delivery-dispatching/SPEC/) |
| BF04 | Supplier Ordering (Đặt hàng NCC) | Tạo đơn đặt hàng nhà cung cấp, NCC (E04) phản hồi ngày xuất, đơn tạm tính đầu tháng. | [SPEC](http://wiki.es-kitchen.co.jp/features/supplier-ordering/SPEC/) |
| BF05 | Delivery Partner (Giao hàng — Đối tác E05) | Portal đối tác vận chuyển: quản lý nhân viên, nhận đơn từ ES Station, phản hồi lịch. | [SPEC](http://wiki.es-kitchen.co.jp/features/delivery-partner/SPEC/) |
| BF06 | Delivery Driver (Giao hàng — Tài xế E06) | Tài xế (E06) nhận đơn, GPS log, ký nhận, xử lý giao lại, đếm hàng. | [SPEC](http://wiki.es-kitchen.co.jp/features/delivery-driver/SPEC/) |
| BF07 | Payment (Thanh toán) | Thanh toán elepay, hóa đơn hàng tháng, tích hợp Bill One, refund. | [SPEC](http://wiki.es-kitchen.co.jp/features/payment/SPEC/) |
| BF08 | Collection & Cancellation (Thu tiền & Hủy) | Tài xế (E06) thu tiền mặt, báo cáo hàng hủy, biên lai đỗ xe; admin đối soát chênh lệch. | [SPEC](http://wiki.es-kitchen.co.jp/features/collection-cancellation/SPEC/) |
| BF09 | Inventory & Equipment (Tồn kho & Thiết bị) | Quản lý thiết bị bếp, vật tư, tồn kho, nhập hàng dự kiến, import CSV Thomas. | [SPEC](http://wiki.es-kitchen.co.jp/features/inventory-equipment/SPEC/) |
| BF10 | User Binding (Liên kết Nhân viên) | End User (E01) quét QR liên kết tài khoản với công ty, giới hạn mua/ngày, trợ giá. | [SPEC](http://wiki.es-kitchen.co.jp/features/user-binding/SPEC/) |
| BF11 | User Engagement (Tương tác & Khảo sát) | Tutorial, lọc allergen, rating sản phẩm/tài xế, survey, recommendation. | [SPEC](http://wiki.es-kitchen.co.jp/features/user-engagement/SPEC/) |
| BF12 | Agency Management (Đại lý) | Quản lý đại lý giới thiệu, tính hoa hồng, theo dõi referral & trạng thái thanh toán. | [SPEC](http://wiki.es-kitchen.co.jp/features/agency-management/SPEC/) |
| BF13 | System Other (Cài đặt & Common) | Notification, maintenance mode, version management, dashboard, HubSpot sync, email/push trigger. | [SPEC](http://wiki.es-kitchen.co.jp/features/system-other/SPEC/) |

---

## 2. Các tài liệu khác

| Feature | Mô tả ngắn gọn | URL |
|---|---|---|
| Admin Account Management | Quản lý tài khoản admin nội bộ — tạo, sửa, vô hiệu hóa, phân quyền cơ bản. | [http://wiki.es-kitchen.co.jp/features/admin-account-management/SPEC/](http://wiki.es-kitchen.co.jp/features/admin-account-management/SPEC/) |
| Admin Role & Permission | Định nghĩa role và phân quyền chi tiết cho System Admin (E03). | [http://wiki.es-kitchen.co.jp/features/admin-role-permission/SPEC/](http://wiki.es-kitchen.co.jp/features/admin-role-permission/SPEC/) |
| AI Recommendation Engine | Engine gợi ý món ăn dựa trên lịch sử và preference của End User (E01). | [http://wiki.es-kitchen.co.jp/features/ai-recommendation/SPEC/](http://wiki.es-kitchen.co.jp/features/ai-recommendation/SPEC/) |
| API Hardening | Tăng cường bảo mật API: rate limit, validation, audit log, error handling. | [http://wiki.es-kitchen.co.jp/features/api-hardening/SPEC/](http://wiki.es-kitchen.co.jp/features/api-hardening/SPEC/) |
| Authentication | Authentication chung — đăng nhập, JWT, refresh token, OTP. | [http://wiki.es-kitchen.co.jp/features/authentication/SPEC/](http://wiki.es-kitchen.co.jp/features/authentication/SPEC/) |
| Guest Mode | End User (E01) đăng nhập nhanh không cần tài khoản — block cash, nhập Company ID per checkout, upgrade qua OTP email. Admin (E03) toggle `guestPaymentAllowed` per company. | [http://wiki.es-kitchen.co.jp/features/guest-mode/SPEC/](http://wiki.es-kitchen.co.jp/features/guest-mode/SPEC/) |
| IP Whitelist | Kiểm soát truy cập theo IP cho các portal admin nội bộ. | [http://wiki.es-kitchen.co.jp/features/ip-whitelist/SPEC/](http://wiki.es-kitchen.co.jp/features/ip-whitelist/SPEC/) |
| Maintain Management | Quản lý chế độ bảo trì hệ thống — bật/tắt portal, thông báo người dùng. | [http://wiki.es-kitchen.co.jp/features/maintain-management/SPEC/](http://wiki.es-kitchen.co.jp/features/maintain-management/SPEC/) |
| Notification Management | Quản lý thông báo đẩy/email/in-app gửi đến các actor. | [http://wiki.es-kitchen.co.jp/features/notification-management/SPEC/](http://wiki.es-kitchen.co.jp/features/notification-management/SPEC/) |
| Order List | Danh sách đơn hàng dành cho Supplier (E04) — filter, status, phản hồi. | [http://wiki.es-kitchen.co.jp/features/order-list/SPEC/](http://wiki.es-kitchen.co.jp/features/order-list/SPEC/) |
| Survey Management | Quản lý khảo sát người dùng — tạo, gửi, thu thập kết quả. | [http://wiki.es-kitchen.co.jp/features/survey-management/SPEC/](http://wiki.es-kitchen.co.jp/features/survey-management/SPEC/) |
| Version Management | Quản lý phiên bản app mobile — force-update, release note. | [http://wiki.es-kitchen.co.jp/features/version-management/SPEC/](http://wiki.es-kitchen.co.jp/features/version-management/SPEC/) |

---

## 3. Tài liệu tham chiếu

| Tài liệu | Mô tả | URL |
|---|---|---|
| BA TODOs — Client Questions | 130 câu hỏi cần khách hàng xác nhận trước Design phase, gom từ 15 SPEC. | [http://wiki.es-kitchen.co.jp/features/BA_TODO_for_client/](http://wiki.es-kitchen.co.jp/features/BA_TODO_for_client/) |
