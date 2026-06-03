# BF_ĐẶT HÀNG NCC Đặt hàng Nhà cu

> Domain slug: `dat-hang-ncc` · 18 stories

## Stories

| ID | EPIC | STORY | STORY_2 | STORY_3 | DESCRIPTION | PRIORITY | BUSINESS FLOW |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 03 | 運営管理者Web-SystemAdmin_画面一覧 | Supplier management | List of supplier accounts |  | Hiển thị danh sách tài khoản của các Nhà cung cấp (Supplier). | 6 | [ĐẶT HÀNG NCC] Đặt hàng Nhà cung cấp |
| 03 | 運営管理者Web-SystemAdmin_画面一覧 |  | Supplier Search |  | Chức năng tìm kiếm, chỉnh sửa hoặc xóa thông tin tài khoản Nhà cung cấp. | 6 | [ĐẶT HÀNG NCC] Đặt hàng Nhà cung cấp |
| 04 | 仕入れ先WEB_画面 - Website Suplier | Login+ logout + forgot pw |  |  | Đăng nhập bằng ID/Mật khẩu, đăng xuất và cấp lại mật khẩu (quên mật khẩu) dành cho nhà cung cấp. | 6 | [ĐẶT HÀNG NCC] Đặt hàng Nhà cung cấp |
| 04 | 仕入れ先WEB_画面 - Website Suplier | TOP screen | List of announcements |  | Hiển thị thông tin thông báo và danh sách quan trọng trên màn hình TOP. | 6 | [ĐẶT HÀNG NCC] Đặt hàng Nhà cung cấp |
| 04 | 仕入れ先WEB_画面 - Website Suplier |  | Announcement Details |  | Hiển thị chi tiết thông báo (dạng Dropdown khi click vào tiêu đề) và tải xuống file đính kèm. | 6 | [ĐẶT HÀNG NCC] Đặt hàng Nhà cung cấp |
| 04 | 仕入れ先WEB_画面 - Website Suplier | Order List | Order List | Display order list by status | Danh sách đơn hàng được hiển thị theo tab dựa trên từng trạng thái (ví dụ: Chờ phản hồi ngày giao, Chờ xuất hàng). Trạng thái đơn hàng sẽ được tự động cập nhật theo từng hành động. | 6 | [ĐẶT HÀNG NCC] Đặt hàng Nhà cung cấp |
| 04 | 仕入れ先WEB_画面 - Website Suplier |  |  | Search criteria | Có thể tìm kiếm đơn hàng bằng điều kiện tháng năm, ngày xuất hàng và trạng thái. | 6 | [ĐẶT HÀNG NCC] Đặt hàng Nhà cung cấp |
| 04 | 仕入れ先WEB_画面 - Website Suplier |  | Order Details / Editing | Display of order details | Hiển thị thông tin chi tiết đơn hàng: Số đơn hàng, Ngày giao mong muốn, Hạn sử dụng, Tên sản phẩm, Số lượng, Nơi giao hàng. | 6 | [ĐẶT HÀNG NCC] Đặt hàng Nhà cung cấp |
| 04 | 仕入れ先WEB_画面 - Website Suplier |  |  | Shipping schedule response | Nhập/Chỉnh sửa ngày dự kiến xuất hàng. Có ô nhập ghi chú/bình luận. | 6 | [ĐẶT HÀNG NCC] Đặt hàng Nhà cung cấp |
| 04 | 仕入れ先WEB_画面 - Website Suplier |  |  | Shipping processing and reporting | Xử lý báo cáo xuất hàng: Chọn phương thức thanh toán, nhập ngày xuất hàng, tên công ty vận chuyển, hạn sử dụng sản phẩm, ghi chú. | 6 | [ĐẶT HÀNG NCC] Đặt hàng Nhà cung cấp |
| 04 | 仕入れ先WEB_画面 - Website Suplier |  |  | CSV download (by specified period and product) | Xuất file CSV danh sách đơn hàng (theo thời gian chỉ định/từng sản phẩm). | 6 | [ĐẶT HÀNG NCC] Đặt hàng Nhà cung cấp |
| 04 | 仕入れ先WEB_画面 - Website Suplier | Change password |  |  | Thay đổi mật khẩu tài khoản nhà cung cấp. | 6 | [ĐẶT HÀNG NCC] Đặt hàng Nhà cung cấp |
|  |  | Order khi thành công thì có các mốc sau |  |  |  |  |  |
|  |  | 1 | Ngày tạo | Do Company tạo |  |  |  |
|  |  | 2 | Ngày dự kiến giao hàng : picking date | Láy từ hợp đồng qua và System Admin fill |  |  |  |
|  |  | 3 | Ngày thực tế giao hàng | Ngày do thằng Driver App chụp ảnh và submit |  |  |  |
|  |  | 4 | Ngày dự kiến xuất hàng | Ngày do phía Supplier tạo để xuất cho phía KHO |  |  |  |
|  |  | 5 | Ngày xuất hàng thực tế | Ngày do phía Supplier fill khi đã gửi cho KHO |  |  |  |