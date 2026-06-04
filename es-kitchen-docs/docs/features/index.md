# OVERVIEW

> Trang tổng hợp toàn bộ SPEC.md trong `/features`.
> Mỗi dòng = 1 Feature → 1 SPEC.md tương ứng.

**Tổng:** 15 Business Flows + 11 Features khác = 26 SPEC.md
**Last updated:** 2026-06-04

---

## 1. Business Flow

| Business Flow | Mô tả ngắn gọn | URL |
|---|---|---|
| Agency Management (Đại lý) | Quản lý đại lý giới thiệu, tính hoa hồng, theo dõi referral & trạng thái thanh toán. | [http://wiki.es-kitchen.co.jp/features/agency-management/SPEC/](http://wiki.es-kitchen.co.jp/features/agency-management/SPEC/) |
| Collection & Cancellation (Thu tiền & Hủy) | Tài xế (E06) thu tiền mặt, báo cáo hàng hủy, biên lai đỗ xe; admin đối soát chênh lệch. | [http://wiki.es-kitchen.co.jp/features/collection-cancellation/SPEC/](http://wiki.es-kitchen.co.jp/features/collection-cancellation/SPEC/) |
| Contract Management (Hợp đồng) | Đăng ký dùng thử, hợp đồng chính thức, plan, location, yêu cầu thay đổi/hủy. | [http://wiki.es-kitchen.co.jp/features/contract-management/SPEC/](http://wiki.es-kitchen.co.jp/features/contract-management/SPEC/) |
| Delivery Dispatching (Giao hàng — Điều phối) | Sắp lịch picking/delivery, tích hợp Yamato API + Thomas CSV, duyệt yêu cầu đổi ngày. | [http://wiki.es-kitchen.co.jp/features/delivery-dispatching/SPEC/](http://wiki.es-kitchen.co.jp/features/delivery-dispatching/SPEC/) |
| Delivery Driver (Giao hàng — Tài xế) | Tài xế (E06) nhận đơn, GPS log, ký nhận, xử lý giao lại, đếm hàng. | [http://wiki.es-kitchen.co.jp/features/delivery-driver/SPEC/](http://wiki.es-kitchen.co.jp/features/delivery-driver/SPEC/) |
| Delivery Partner (Giao hàng — Đối tác E05) | Portal đối tác vận chuyển: quản lý nhân viên, nhận đơn từ ES Station, phản hồi lịch. | [http://wiki.es-kitchen.co.jp/features/delivery-partner/SPEC/](http://wiki.es-kitchen.co.jp/features/delivery-partner/SPEC/) |
| Inventory & Equipment (Tồn kho & Thiết bị) | Quản lý thiết bị bếp, vật tư, tồn kho, nhập hàng dự kiến, import CSV Thomas. | [http://wiki.es-kitchen.co.jp/features/inventory-equipment/SPEC/](http://wiki.es-kitchen.co.jp/features/inventory-equipment/SPEC/) |
| Marketing | Chiến dịch marketing, đồng bộ HubSpot, commission plan A/B, hủy đại lý. | [http://wiki.es-kitchen.co.jp/features/marketing/SPEC/](http://wiki.es-kitchen.co.jp/features/marketing/SPEC/) |
| Menu & Order | Quản lý menu (PDF + AI PRO recommendation), End User đặt món, chốt đơn theo deadline. | [http://wiki.es-kitchen.co.jp/features/menu-order/SPEC/](http://wiki.es-kitchen.co.jp/features/menu-order/SPEC/) |
| Payment (Thanh toán) | Thanh toán elepay/Alipay/WeChat Pay, hóa đơn hàng tháng, trợ giá, refund. | [http://wiki.es-kitchen.co.jp/features/payment/SPEC/](http://wiki.es-kitchen.co.jp/features/payment/SPEC/) |
| Supplier Ordering (Đặt hàng NCC) | Tạo đơn đặt hàng nhà cung cấp, NCC (E04) phản hồi ngày xuất, đơn tạm tính đầu tháng. | [http://wiki.es-kitchen.co.jp/features/supplier-ordering/SPEC/](http://wiki.es-kitchen.co.jp/features/supplier-ordering/SPEC/) |
| System Other (Cài đặt & Common) | Notification, maintenance mode, version management, dashboard, HubSpot sync, email/push trigger. | [http://wiki.es-kitchen.co.jp/features/system-other/SPEC/](http://wiki.es-kitchen.co.jp/features/system-other/SPEC/) |
| Task Management | Quản lý task nội bộ System Admin, Kanban, auto-create theo trigger, Slack notification. | [http://wiki.es-kitchen.co.jp/features/task-management/SPEC/](http://wiki.es-kitchen.co.jp/features/task-management/SPEC/) |
| User Binding | End User (E01) quét QR liên kết tài khoản với công ty, giới hạn mua/ngày, trợ giá. | [http://wiki.es-kitchen.co.jp/features/user-binding/SPEC/](http://wiki.es-kitchen.co.jp/features/user-binding/SPEC/) |
| User Engagement | Tutorial, lọc allergen, rating sản phẩm/tài xế, survey, feedback form, recommendation. | [http://wiki.es-kitchen.co.jp/features/user-engagement/SPEC/](http://wiki.es-kitchen.co.jp/features/user-engagement/SPEC/) |

---

## 2. Các tài liệu khác

| Feature | Mô tả ngắn gọn | URL |
|---|---|---|
| Admin Account Management | Quản lý tài khoản admin nội bộ — tạo, sửa, vô hiệu hóa, phân quyền cơ bản. | [http://wiki.es-kitchen.co.jp/features/admin-account-management/SPEC/](http://wiki.es-kitchen.co.jp/features/admin-account-management/SPEC/) |
| Admin Role & Permission | Định nghĩa role và phân quyền chi tiết cho System Admin (E03). | [http://wiki.es-kitchen.co.jp/features/admin-role-permission/SPEC/](http://wiki.es-kitchen.co.jp/features/admin-role-permission/SPEC/) |
| AI Recommendation Engine | Engine gợi ý món ăn dựa trên lịch sử và preference của End User (E01). | [http://wiki.es-kitchen.co.jp/features/ai-recommendation/SPEC/](http://wiki.es-kitchen.co.jp/features/ai-recommendation/SPEC/) |
| API Hardening | Tăng cường bảo mật API: rate limit, validation, audit log, error handling. | [http://wiki.es-kitchen.co.jp/features/api-hardening/SPEC/](http://wiki.es-kitchen.co.jp/features/api-hardening/SPEC/) |
| Authentication | Authentication chung — đăng nhập, JWT, refresh token, OTP. | [http://wiki.es-kitchen.co.jp/features/authentication/SPEC/](http://wiki.es-kitchen.co.jp/features/authentication/SPEC/) |
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
