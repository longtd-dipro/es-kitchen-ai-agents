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