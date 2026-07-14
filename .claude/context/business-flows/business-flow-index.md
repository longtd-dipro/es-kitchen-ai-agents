# Business Flow — Master Index

> Tổng quan các nghiệp vụ của dự án ESKITCHEN (từ sheet `Business Flow`).

## Danh sách 23 nghiệp vụ

| No | Nhóm | Nghiệp Vụ | Target | Nội dung | Danh sách chức năng | BACKLOG ID | FLOW FIGJAM | SPEC TRANSFER |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Vận hành Cốt lõi | [HỢP ĐỒNG] Quản lý Hợp đồng | System Admin, Company Admin, Outsource Admin | Đăng ký dùng thử, chuyển đổi hợp đồng, thay đổi gói (Plan), thiết lập ngày giao hàng và quản lý thiết bị tủ lạnh. | BF_[HỢP ĐỒNG] Quản lý Hợp đồng | ESKITCHEN-1235 | https://www.figma.com/board/iCeNUokzaWdL9KhdBqp49b/ES-Kitchen---Figjam?node-id=7102-91612&t=wYM5dtKPLQknYTa6-4 | True |
| 2 | Vận hành Cốt lõi | [MENU & ORDER] Quản lý Thực đơn & Đặt hàng | System Admin, Company Admin, User Mobile | Tổng bộ lên Menu. Doanh nghiệp chốt đơn (thủ công, CSV hoặc AI tự động đề xuất/chat). User chọn mua món ăn trên App. | BF_[MENU & ORDER] Quản lý Thực đơn & Đặt hàng | ESKITCHEN-1239 |  | True |
| 3 | Vận hành Cốt lõi | [GIAO HÀNG] Lịch trình & Điều phối | System Admin, Company Admin | Tổng bộ thiết lập lịch picking, lên chu kỳ giao hàng. Doanh nghiệp xem lịch dự kiến hoặc gửi yêu cầu đổi ngày do sự cố. | BF_[GIAO HÀNG] Lịch trình & Điều phối | ESKITCHEN-1236 |  | True |
| 4 | Vận hành Cốt lõi | [ĐẶT HÀNG NCC] Đặt hàng Nhà cung cấp | System Admin, Supplier (Web Nhà cung cấp) | Tổng bộ chốt số lượng đặt hàng gửi Nhà cung cấp. Nhà cung cấp vào Web xác nhận ngày giao và tải CSV. Đầu tháng sẽ gửi 1 đơn tạm tính tới NCC https://docs.google.com/spreadsheets/d/1tHmr2ZS5z8ZjJf0oLtBfsMFENk7GFxPJTpDDHsWm9DM/edit?gid=493112000#gid=493112000 | BF_[ĐẶT HÀNG NCC] Đặt hàng Nhà cung cấp | ESKITCHEN-1240 |  | False |
| 5 | Vận hành Cốt lõi | [GIAO HÀNG] Web Đối tác Vận chuyển | Công ty vận chuyển (Outsource Admin) | Web dành riêng cho bên trung gian xem danh sách đơn hàng được ủy thác, quản lý tài xế của họ và xem báo cáo. | BF_[GIAO HÀNG] Web Đối tác Vận chuyển | ESKITCHEN-1237 |  | True |
| 6 | Vận hành Cốt lõi | [GIAO HÀNG] App Tài xế | Nhân viên giao hàng (Driver) | Xem lộ trình, check-in, kiểm đếm, chụp ảnh báo cáo trước/sau khi trưng bày món ăn vào tủ lạnh. | BF_[GIAO HÀNG] App Tài xế | ESKITCHEN-1238 |  | True |
| 7 | Vận hành Cốt lõi | [THANH TOÁN] Thanh toán & Hoàn tiền | User Mobile, Company Admin, System Admin | User thanh toán qua Elepay (Credit card, PayPay, Apple Pay...). User yêu cầu hoàn tiền trong 30 phút. Quản lý hóa đơn (Invoice). | BF_[THANH TOÁN] Thanh toán & Hoàn tiền | ESKITCHEN-1241 |  | False |
| 8 | Vận hành Cốt lõi | [THU TIỀN & HÀNG HỦY] Báo cáo Thu tiền & Tiêu hủy | Driver App, Outsource Admin, System Admin | Tài xế báo cáo số tiền mặt thu được và nhập số lượng món ăn quá hạn cần hủy. Tổng bộ đối soát doanh thu và ghi nhận hàng hủy. | BF_[THU TIỀN & HÀNG HỦY] | ESKITCHEN-1242 |  | False |
| 9 | Quản lý Tài sản & CSKH | [TỒN KHO & THIẾT BỊ] Quản lý Tồn kho & Vật tư | System Admin, Company Admin | Quản lý số lượng tồn kho chế biến sẵn, vật tư (đũa, thìa) và thiết bị (Serial tủ lạnh). Xuất nhập CSV liên kết kho Thomas. | BF_[TỒN KHO & THIẾT BỊ] Quản lý Tồn kho | ESKITCHEN-1243 |  | False |
| 10 | Quản lý Tài sản & CSKH | [USER BINDING] Liên kết Nhân viên & Phúc lợi | User Mobile, Company Admin | User quét mã QR liên kết công ty. Company Admin thiết lập mức trợ giá và Giới hạn số lượng mua tối đa trong ngày (1-3 món/ngày). | BF_[USER BINDING] Liên kết Nhân viên & Phúc lợi | ESKITCHEN-1244 |  | False |
| 11 | Quản lý Tài sản & CSKH | [USER ENGAGEMENT] Tương tác & Khảo sát | User Mobile, System Admin | User đánh giá món ăn, tham gia khảo sát, báo cáo sức khỏe (dị ứng). Hệ thống tặng Điểm (Point) và Tem thưởng (Stamp). | BF_[USER ENGAGEMENT] Tương tác & Khảo sát | ESKITCHEN-1245 |  | False |
| 13 | Quản lý Tài sản & CSKH | [ĐẠI LÝ] Quản lý Đại lý (Agency & Partner) | System Admin | Quản lý danh sách đại lý phân phối, tính toán tỷ lệ hoa hồng và tạo danh sách thanh toán hoa hồng hàng tháng. | BF_[ĐẠI LÝ] Quản lý Đại lý (Agency & Partner) | ESKITCHEN-1247 | https://www.figma.com/board/iCeNUokzaWdL9KhdBqp49b/ES-Kitchen---Figjam?node-id=7102-93062&t=gdoZgWbnkOLwqAau-4 | False |
| 14 | Nền tảng & Quản trị | [SYSTEM & OTHER] Cấu hình Hệ thống & Tích hợp | System Admin | Quản lý quyền (Role), IP Whitelist, Notification (thông báo đẩy), Email tự động và liên kết API ngoài (Hubspot, Thomas, Yamato/Sagawa). | BF_[SYSTEM & OTHER] Cấu hình Hệ thống & Tích hợp | ESKITCHEN-1249 |  | False |
| Chú Thích |  |  |  |  |  |  |  |  |
| ID | EPIC | Target |  |  |  |  |  |  |
| 01 | ユーザーモバイルアプリ-UserMobileApp_画面一覧 | User Mobile |  |  |  |  |  |  |
| 02 | 法人顧客向けWEB-Company Admin_画面一覧 | Company Admin |  |  |  |  |  |  |
| 03 | 運営管理者Web-SystemAdmin_画面一覧 | System Admin |  |  |  |  |  |  |
| 04 | 仕入れ先WEB_画面 - Website Suplier | Supplier (Web nhà cung cấp) |  |  |  |  |  |  |
| 05 | 委託配送先WEB_画面一覧 - Contract Delivery Destination | Công ty vận chuyển (Outsource Admin) |  |  |  |  |  |  |
| 06 | ドライバーAPP(driver app)_P2 | Nhân viên giao hàng (Driver) |  |  |  |  |  |  |
---

## Phase 2 Scope Changes — Tổng hợp (2026-07)

> Nguồn: `management/specification/Business_flow_scope_change.xlsx`
> Cập nhật: 2026-07-14

| BF# | Nghiệp Vụ | Nhóm | Tổng | Thêm mới | Xóa đi | Cập nhật | Domain File |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BF01 | [HỢP ĐỒNG] Quản lý Hợp đồng | Vận hành Cốt lõi | 25 | 21 | 4 | 0 | `domains/hop-dong.md` |
| BF02 | [MENU & ORDER] Quản lý Thực đơn & Đặt hàng | Vận hành Cốt lõi | 18 | 10 | 8 | 0 | `domains/menu-order.md` |
| BF03 | [GIAO HÀNG] Lịch trình & Điều phối | Vận hành Cốt lõi | 16 | 12 | 4 | 0 | `domains/giao-hang-dieu-phoi.md` |
| BF04 | [ĐẶT HÀNG NCC] Đặt hàng Nhà cung cấp | Vận hành Cốt lõi | 8 | 7 | 1 | 0 | `domains/dat-hang-ncc.md` |
| BF05 | [GIAO HÀNG] Web Đối tác Vận chuyển | Vận hành Cốt lõi | 16 | 15 | 1 | 0 | `domains/giao-hang-doi-tac.md` |
| BF06 | [GIAO HÀNG] App Tài xế | Vận hành Cốt lõi | 5 | 2 | 3 | 0 | `domains/giao-hang-tai-xe.md` |
| BF07 | [THANH TOÁN] Thanh toán & Hoàn tiền | Vận hành Cốt lõi | 6 | 2 | 4 | 0 | `domains/thanh-toan.md` |
| BF08 | [THU TIỀN & HÀNG HỦY] Báo cáo Thu tiền & Tiêu hủy | Vận hành Cốt lõi | 6 | 4 | 2 | 0 | `domains/thu-tien-huy.md` |
| BF09 | [TỒN KHO & THIẾT BỊ] Quản lý Tồn kho & Vật tư | Quản lý Tài sản & CSKH | 10 | 8 | 2 | 0 | `domains/ton-kho-thiet-bi.md` |
| BF10 | [USER BINDING] Liên kết Nhân viên & Phúc lợi | Quản lý Tài sản & CSKH | — | — | — | — | `domains/user-binding.md` (không thay đổi) |
| BF11 | [USER ENGAGEMENT] Tương tác & Khảo sát | Quản lý Tài sản & CSKH | 2 | 0 | 1 | 1 | `domains/user-engagement.md` |
| BF12 | [ĐẠI LÝ] Quản lý Đại lý (Agency & Partner) | Quản lý Tài sản & CSKH | 12 | 7 | 5 | 0 | `domains/dai-ly.md` |
| BF13 | [SYSTEM & OTHER] Cấu hình Hệ thống & Tích hợp | Nền tảng & Quản trị | 9 | 0 | 9 | 0 | `domains/system-other.md` |
| **Tổng** | | | **133** | **88** | **44** | **1** | |

### Highlights thay đổi quan trọng

1. **BF01 Hợp đồng (+21/-4)**: Thêm luồng phê duyệt đăng ký HĐ mới hoàn toàn (E03 + E02); thêm quản lý PLAN giá + tùy chọn dịch vụ + quản lý giảm giá; xóa invoice cũ → thay Bill One API.
2. **BF02 Menu & Order (+10/-8)**: Thêm QL danh mục SP, tag SP, thống kê menu, checklist picking; xóa màn hình menu riêng E02, đánh giá sao tài xế, dashboard task, sao chép menu cũ.
3. **BF03 Lịch trình (+12/-4)**: Thêm toàn bộ luồng QL YC vận chuyển (báo giá, so sánh, chốt bên VC); thêm bulk CSV/account cho bên VC; xóa cài đặt số lần giao/loại hàng từ E02.
4. **BF05 Web ĐT Vận chuyển (+15/-1)**: Domain E05 xây mới gần như hoàn toàn — thêm login, form đăng ký, hồ sơ, lịch trình giao, QL yêu cầu báo giá.
5. **BF06 App Tài xế (+2/-3)**: **Đổi platform App → Web**; xóa vật tư, chữ ký, HubSpot; thêm forgot PW + chi tiết thông báo.
6. **BF07 Thanh toán (+2/-4)**: Xóa Rakuten Pay + Alipay; xóa hóa đơn E02 cũ; thêm Bill One API integration.
7. **BF12 Đại lý (+7/-5)**: Thay thế mô hình campaign E02 bằng QL giới thiệu tập trung E03; thêm DS đại lý, DS giới thiệu, thanh toán phí GT.
8. **BF13 System & Other (0/+9 xóa)**: Toàn bộ Task Management (kanban, auto-gen, template, Slack) bị xóa theo yêu cầu của Chủ tịch Hosono.
