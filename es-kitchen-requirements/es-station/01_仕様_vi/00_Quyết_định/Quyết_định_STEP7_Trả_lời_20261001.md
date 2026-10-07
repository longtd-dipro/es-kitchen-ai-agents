> **Đã đóng băng (tài liệu gốc・2026-10-05). Từ nay không cập nhật.** Quyết định đang có hiệu lực nằm ở `docs/決定台帳.md`. Nội dung của file này được chuyển đi đâu và các quyết định bị thay thế thì xem "G" trong sổ quyết định.

# Quyết định: Trả lời STEP7 (chức năng xuyên suốt・khác) (tối 2026/10/01 anh Long)

> Câu hỏi ở `90_デモ確認/デモ全体確認_STEP7_横断とその他の機能_20261001.md` §11・§14. Quy tắc của danh sách ở file riêng `Quyết_định_STEP7_Quy_định_về_danh_sách_20261001.md`.

| # | Nội dung | Quyết định |
|---|---|---|
| S7-6 | CU00950 là 2 cơ sở | Văn phòng kinh doanh Yokohama (Công ty cổ phần Sample) giữ CU00950. Gán số khác cho Trụ sở Nagoya của Mirai Shoji |
| S7-7 | Số yêu cầu thay đổi | Thống nhất `CR0000003` v.v. của quản lý giao hàng thành `CH-YYYYMMDD-NNNN` (NNNN là số thứ tự theo từng ngày) |
| S7-12 | Đặt lại mật khẩu | Thống nhất toàn bộ ứng dụng là "mã xác thực (hiệu lực 5 phút)" (bỏ liên kết 24 giờ của Web doanh nghiệp・liên kết 30 phút của nhà cung cấp) |
| S7-13 | Tài khoản doanh nghiệp | Đặt mục tài khoản (trạng thái・đặt lại mật khẩu・gửi lại hướng dẫn đăng nhập・tạm ngưng) ở chi tiết doanh nghiệp của Vận hành |
| S7-17・18 | Thông báo | Màn hình thông báo (màn hình) đã đủ. Xác nhận xem có màn hình nào bị sót trong quá trình nhập từ Figma không |
| S7-25 | Doanh thu・quản lý người dùng của Web doanh nghiệp | Làm lại thành màn hình của Web doanh nghiệp (Công ty cổ phần Sample・chuyển tài khoản có hiệu lực・xóa danh sách dành cho phát triển) |
| S7-11 | Lỗi rõ ràng | Sửa (thứ trong tiêu đề của quản lý giao hàng, đăng xuất khi thu gọn của cổng thông tin ủy thác, sai sót bản dịch, mẫu IP) |
| S7-24 | Màn hình mở đầu tiên của Vận hành | Là màn hình chủ (dashboard) |
| S7-1・2・5 | Thay thế thuật ngữ・nhóm cần phán đoán・diễn đạt lại của Web doanh nghiệp | Thực hiện theo đề xuất |
| S7-20 | Tiếng Việt | Không hiển thị nút chuyển (cố định tiếng Nhật)・gộp từ điển thành một dựa trên json・"拠点" là Cơ sở・dịch sau khi thay thế thuật ngữ |

Phản ánh: demo v1.69 (`02_デモ/デモ_更新履歴.md`). S7-6 đã được phản ánh ở v1.61 của phiên khác (Trụ sở Nagoya của Mirai Shoji = CU00701).

Chưa trả lời: S7-21 (tính toán đại lý・giới thiệu) và phần còn lại của §11.

## Trả lời bổ sung (tối 2026/10/01・tiếp)

| # | Nội dung | Quyết định |
|---|---|---|
| S7-17・18 | Màn hình thông báo | Nhập các màn hình có trong Figma (ES Kitchen phase 2 / Notification Management. node 33053-310713). Các màn hình đăng ký mới・chi tiết・chỉnh sửa・chọn riêng lẻ có trong Figma nhưng chưa được nhập vào demo → phản ánh ở v1.70 |
| S7-37 | Số yêu cầu đổi ngày giao hàng | Tách khỏi yêu cầu hợp đồng (CH-) và đặt là DD-YYYYMMDD-NNNN → v1.70 |
| S7-38 | Quản lý doanh thu của Vận hành | A: Dạng của giai đoạn 1 (theo cơ sở・theo sản phẩm・theo người dùng + yêu thích). Bảng xếp hạng nằm dưới tab theo sản phẩm → v1.70 |
| S7-39 | Thuật ngữ sửa theo ngữ cảnh | Đưa ra đề xuất câu chữ thay thế (tài liệu STEP7 §14-10) → chờ trả lời |
