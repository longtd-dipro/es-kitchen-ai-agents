# Các điểm sửa đặc tả Ứng dụng tài xế (Driver Mobile Web P2) — 2026/09/30

Nội dung được quyết định theo trả lời của anh Long sau khi đối chiếu Figma "Driver Moblie Web (P2)_review 可" với đặc tả giao hàng (bản đặc tả tích hợp v2.3 §12-2・§13-1, 納品サイクル設定 §4B-5, DEV仕様書 v2.3 §11〜§13). Chưa phản ánh vào bản đặc tả.

## Các điều đã quyết định

| No | Vấn đề | Quyết định | Chỗ cần sửa trong đặc tả |
|---|---|---|---|
| 1 | Phương thức đăng nhập | **ID đăng nhập + mật khẩu**. Đặt lại mật khẩu là **nhập mã xác thực 4 chữ số** (Figma là chuẩn) | Sửa "địa chỉ email và mật khẩu／phương thức liên kết email" ở Tích hợp §12-2・Chu kỳ §4B-5 |
| 2 | Hiển thị thẻ nơi giao hàng | Hiển thị khung giờ nhận hàng (nếu nhiều thì hiển thị tất cả) và điều kiện giao hàng (đặc tả là chuẩn. Thêm vào Figma) | Sửa phía thiết kế |
| 3 | Báo cáo sự cố khi đang giao hàng | Có thể báo cáo sự cố cả khi đang giao hàng. **Thiếu hàng (một phần chưa nhận／một phần chưa giao／chênh lệch kiểm hàng) được tự động ghi nhận là sự cố** và chuyển cho Vận hành | Bổ sung "tự động ghi nhận khi thiếu" vào Tích hợp §12-2・§13-1 (quyết định giá trị của app_reason_raw) |
| 4 | Hạn sử dụng | **Không cần theo dõi hạn theo từng cơ sở.** Hàng hết hạn thì tài xế xem tại hiện trường và hủy. **Bỏ `delivery_lines.expiry_date` khỏi đặc tả, cũng không làm ô nhập.** Nếu cần thì làm từ giai đoạn 3 trở đi (khi đó phương án là đưa lô／hạn vào kết quả xuất hàng của THOMAS để nhập) | DEV §13.5・§14.7・§12.5 (mục loại trừ của API cho khách hàng), Tích hợp §13-1B, Chu kỳ §7 DDL |
| 5 | Báo cáo đỗ xe | **Cần** (ảnh biên lai + phí đỗ xe). Thiếu sót của đặc tả | Xác nhận tính nhất quán với DEV §13.6 "không hiển thị phí đỗ xe", rồi thêm mục・mô hình dữ liệu |
| 6 | Tìm kiếm・lọc danh sách giao hàng | Có tìm kiếm theo số vận đơn・tên kho, lọc theo trạng thái (theo đặc tả) | Không |
| 7 | Nơi nhận báo cáo sự cố | Về cơ bản gửi cho Vận hành | Không (chỉ xác nhận) |
| 8 | Tên nút của chuyến COOL | "Hoàn tất khi còn một phần chưa giao" (theo đặc tả) | Không |
| 9 | STEP5 Thu tiền | Tùy chọn. Nếu số tiền thu dự kiến là 0 yên thì không hiển thị mục (theo đặc tả) | Không |
| 10 | Sửa sau khi hoàn tất | **Có thể sửa từng bước đến 7 ngày kể từ khi hoàn tất** | Bổ sung thời hạn 7 ngày vào Tích hợp §12-2 "sau khi hoàn tất vẫn có thể chỉnh sửa nội dung từng bước" |

## Các màn hình có trong đặc tả nhưng không có trong Figma nên đã được thêm (đã phản ánh vào prototype)

- Nhận hàng tại nơi trung chuyển (tên văn phòng・địa chỉ・mã văn phòng・điện thoại)
- Nhận lại hàng cùng ngày・cùng địa điểm
- Đăng ký hủy／kiểm kê (chênh lệch được thông báo cho quản trị viên vận hành)
- Chia sẻ khung giờ dự kiến đến
- Hiển thị N mục chưa gửi và gửi lại (giữ offline)
- Danh sách・chi tiết hướng dẫn
