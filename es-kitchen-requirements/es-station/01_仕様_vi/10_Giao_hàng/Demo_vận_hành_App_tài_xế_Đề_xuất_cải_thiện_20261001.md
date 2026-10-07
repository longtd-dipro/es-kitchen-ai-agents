# Đề xuất cải thiện Demo vận hành × Ứng dụng tài xế (quyết định 2026/10/01・đã phản ánh)

Danh sách gốc: `Demo_vận_hành_App_tài_xế_Danh_sách_bất_nhất_20261001.md`

## Tình trạng phản ánh (2026/10/01)

- **Ứng dụng tài xế**: đã phản ánh (A7・B3・C1・C2・C3・C4). A2〜A6 không có thay đổi phía ứng dụng.
- **Cổng thông tin nơi nhận ủy thác**: đã phản ánh. Ngày chuẩn 2026/10/05, thêm 1 mục giao hàng chuyến COOL làm đối tượng phân công, ghi chú "cả chuyến ES giao hàng và chuyến COOL đều là đối tượng phân công", "nơi trung chuyển xác nhận nhận hàng theo từng thùng".
- **Demo vận hành**: đã phản ánh (A1・ghi chú A2・ghi chú A3・A4・A5・A6・B1・B2・C1・C2).
  - Cột nhân viên của chuyến COOL ở danh sách giao hàng (A2), và bảng đối ứng cho màn hình đăng ký thay sự cố・quyết định cách xử lý (A3) ở mức ghi chú. Chưa làm chi tiết màn hình.
  - Các câu chữ mới thêm chưa được đăng ký vào từ điển dịch tiếng Việt.

## Quyết định và nội dung đã sửa

| No | Vấn đề | Quyết định | Demo vận hành | Ứng dụng tài xế |
|---|---|---|---|---|
| A1 | Hạn sử dụng | Không theo dõi | ✅ Xóa cột "Hạn sử dụng・hạn tiêu thụ" và ghi chú expiry_date | Không |
| A2 | Ai vận chuyển chuyến COOL | Tài xế cũng vận chuyển | ✅ Ghi chú "chuyến ES giao hàng・chuyến COOL đều phân công theo từng chặng". △ Cột nhân viên của danh sách giao hàng chưa xử lý | Giữ màn hình chuyến COOL |
| A3 | Lựa chọn sự cố → 6 phân loại | Bảng đối ứng cố định (bảng dưới) | ✅ Ghi chú ở tab sự cố. △ Màn hình đăng ký thay・quyết định cách xử lý chưa xử lý | Lựa chọn giữ nguyên hiện tại |
| A4 | Tên bước của chuyến ES giao hàng | Theo ứng dụng: ① Trước khi trưng bày ② Tồn kho/hủy ③ Trưng bày (kiểm hàng) ④ Sau khi trưng bày ⑤ Đăng ký thu tiền | ✅ Đã đổi chi tiết giao hàng・chi tiết giao hàng dành cho doanh nghiệp. Tồn kho sau trưng bày = ② − hủy + ③ | Không |
| A5 | Hiển thị trạng thái | Giữ nguyên hiển thị riêng của ứng dụng | ✅ Ghi chú "Hoàn tất giao hàng của ứng dụng = đã báo cáo. Trong lúc chưa giải quyết vẫn là đã nhận" | Không |
| A6 | Nhận hàng tại nơi trung chuyển | Xác nhận theo từng thùng | ✅ Thêm cột thùng vào "Nhận hàng theo từng chặng" (2 / 2), đổi câu chữ | Không |
| A7 | Số vận đơn | Thống nhất theo ES đánh số | Không | ✅ Nhận hàng tại kho theo định dạng DL-261005-0011-01, hiển thị Số giao hàng |
| B1 | Báo cáo đỗ xe | Thêm vào vận hành | ✅ Thêm phí đỗ xe vào kết quả giao hàng, biên lai đỗ xe vào tài liệu đính kèm | Không |
| B2 | Dự kiến đến | Thêm vào vận hành・doanh nghiệp | ✅ Thêm dự kiến đến vào tổng quan giao hàng・chi tiết giao hàng dành cho doanh nghiệp | Không |
| B3 | Tài liệu cho bên ủy thác | Hiển thị trên ứng dụng | Không | ✅ Thêm "Tài liệu (dành cho bên ủy thác)" ở nơi giao hàng・nơi trung chuyển |
| C1 | ID nhân viên giao hàng | 5 chữ số + dùng chung danh sách | ✅ Thay bằng định dạng DR00001, thêm DR00011 Saito Kenta vào master | ✅ DR00001 Kobayashi Sho |
| C2 | Cách ghi COOL | Thống nhất "chuyến COOL" | ✅ Thay thế toàn bộ | ✅ Tiêu đề hướng dẫn |
| C3 | Kho | Theo master | Không | ✅ WH00001 Kho Kanto |
| C4 | "Hôm nay" của demo | 2026/10/05 | Không | ✅ Lấy ngày 10/05 làm chuẩn (cả cổng thông tin nơi nhận ủy thác) |

## A3 Bảng đối ứng lựa chọn sự cố

| Tình huống | Lựa chọn của ứng dụng (nguyên văn) | 6 phân loại của vận hành | Tự động tạo con |
|---|---|---|---|
| Nhận hàng | Thiếu số thùng | Chênh lệch số lượng (thiếu・thừa) | Không tạo |
| Nhận hàng | Giao nhầm | Giao nhầm | Tạo |
| Nhận hàng | Hàng hư hỏng | Hư hỏng・chất lượng kém | Tạo |
| Nhận hàng | Khác | Khác | Không tạo |
| Tự động (nhận hàng) | Hoàn tất khi còn một phần chưa nhận (nguyên văn: Thiếu số thùng) | Chênh lệch số lượng (thiếu・thừa) | Không tạo |
| Giao hàng | Thiếu hàng・giao nhầm | Chưa định loại (gán 6 phân loại khi giải quyết) | Xét khi đã gán loại |
| Giao hàng | Kẹt xe・tai nạn | Chậm trễ (kẹt xe・tai nạn・thời tiết) | Không tạo |
| Giao hàng | Vắng mặt・không liên lạc được | Vắng mặt・không thể nhận | Tạo |
| Giao hàng | Khác | Khác | Không tạo |
| Tự động (chuyến ES giao hàng) | ③ Chênh lệch trưng bày (nguyên văn: Thiếu hàng・giao nhầm) | Chưa định loại | Xét khi đã gán loại |
| Tự động (chuyến COOL) | Hoàn tất khi còn một phần chưa giao | Chênh lệch số lượng (thiếu・thừa) | Không tạo (giao lại chọn ở "Quyết định cách xử lý") |

## Các điểm còn cần xác nhận

- A2: Vận đơn của chuyến COOL do bên ủy thác・tự công ty vận chuyển có phải do ES đánh số không (nếu theo cách nghĩ của A7 thì là ES đánh số).
- A6: Khi nơi trung chuyển thiếu thùng, ai sẽ hỏi công ty vận tải cấp 1 (Yamato).

## Thay đổi bổ sung (chiều 2026/10/01)

- Chuẩn hóa tìm kiếm mã bưu điện của địa chỉ cho cả 3 demo: nhập mã bưu điện và bấm "Tìm địa chỉ" để tự động nhập tỉnh/thành phố・quận/huyện・phường/xã (linh kiện: `項目一覧_生成スクリプト/zipkit/`). Đã phản ánh vào demo vận hành (nút trước đây là mock)・cổng thông tin nơi nhận ủy thác (đăng ký mới・hồ sơ). Ứng dụng tài xế không có nhập địa chỉ nên không áp dụng
- Xóa tab "Phí theo khu vực phụ trách" khỏi hồ sơ của cổng thông tin nơi nhận ủy thác (không hiển thị phí cho công ty giao hàng). Đổi tỉnh/thành phố trong hồ sơ thành lựa chọn trong 47 tỉnh/thành
