> **Đã đóng băng (bản gốc · 2026-10-05). Từ nay không cập nhật nữa.** Các quyết định đang có hiệu lực hiện nay nằm ở `docs/決定台帳.md`. Nội dung của file này được chuyển đi đâu và các quyết định đã bị thay thế, xem mục "G" của sổ cái.

# Quyết định: STEP6 bổ sung (trả lời các OPEN R1~R13 còn lại và yêu cầu xác nhận nhập kho của kho) (2026/10/01)

> Người yêu cầu: Long (Tran Duc Long) / Soạn: Claude (Cowork). Câu hỏi: `01_仕様/90_デモ確認/デモ全体確認_STEP6_発注・仕入先_20261001.md` §9. Quyết định trước: `Quyết_định_STEP6_Trả_lời_Đặt_hàng_Nhà_cung_cấp_20261001.md` (Q1~Q10).
> Chưa phản ánh vào demo · đặc tả.

## 1. Trả lời

| # | Vấn đề | Quyết định | Bổ sung · điểm còn cần xác nhận |
|---|---|---|---|
| R1 | Thời hạn có thể sửa đơn đặt hàng | **C Cho đến khi nhà cung cấp phê duyệt đặt hàng chính thức** | Sau khi phê duyệt thì vận hành không sửa được. **Mâu thuẫn với bảng yêu cầu (thay đổi đặt hàng · cả đặt hàng tạm / chính thức đều sửa được sau phê duyệt) · REQ-PO-304**, nên cách xử lý khi muốn thay đổi sau phê duyệt sẽ xác nhận ở §2 |
| R2 | Vận hành phê duyệt giao hàng từng phần · đổi hạn giao | **A Không phê duyệt (chỉ cảnh báo trên màn hình) + kiểm soát phạm vi giao từng phần** | Không cho đăng ký giao từng phần không kịp xuất hàng. Quy tắc xác nhận ở §2 |
| R3 | Nhà cung cấp dùng hệ thống đặt hàng bên ngoài | **A Vận hành chỉ ghi nhận dữ liệu đặt hàng và nhập kho** | |
| R4 | Nhà cung cấp có phương thức đặt hàng = email | **B Email có liên kết đến màn hình trả lời không cần đăng nhập** | Thời hạn hiệu lực của liên kết · ngăn tái sử dụng, v.v. ở §2 |
| R5 | Đặt hàng vật tư | **A Theo đặc tả, chỉ đặt hàng chính thức · bất kỳ lúc nào** | Làm lại cách "đặt hàng tạm gộp theo tháng → đặt hàng chính thức" hiện nay |
| R6 | Màn hình lịch sử đặt hàng · nhập kho | **A Tích hợp vào danh sách đặt hàng** (số thùng · số tiền · trạng thái đối chiếu thanh toán cũng nằm ở danh sách đặt hàng) | |
| R7 | Phê duyệt đăng ký của nhà cung cấp | **A Màn hình "Xác nhận đăng ký" ở Master nhà cung cấp** | |
| R8 | Nhiều người dùng cho một nhà cung cấp | **A 1 công ty 1 tài khoản**, người phụ trách là nhiều địa chỉ nhận email | |
| R9 | Phương thức giao hàng và công ty vận chuyển | **A Giao thẳng (dùng công ty vận chuyển) / Giao hàng tự công ty / Mang đến kho, công ty vận chuyển chọn từ danh sách** | |
| R10 | Điểm chi tiết mà đặc tả và demo ngược nhau | **Theo đặc tả** | Giá trị ban đầu của ngày mong muốn nhập kho = ngày hôm nay, bỏ cột "Slot" "Ngày giao cho khách" khỏi chi tiết đặt hàng, + nút +3 / +5 / +10 |
| R11 | "Khác" trong số lượng cần thiết | **A Phần của hợp đồng đăng ký tạm là "Tạm", dữ liệu có ngày gửi để trống là lỗi** | |
| R12 | Tên sản phẩm | **A Hai loại: tên công khai và tên lúc nhập mua** | Đặt hàng · site nhà cung cấp dùng tên lúc nhập mua |
| R13 | Số lượng đặt hàng · xếp hạng theo sản phẩm | **A Tab "Theo sản phẩm" ở Quản lý doanh thu** | |

## 2. Yêu cầu mới: Xác nhận nhập kho của kho (2026/10/01 anh Long)

- Hiện đang vận hành bằng Google Spreadsheet "[ES Kitchen] Bảng tính số thùng xuất hàng" (sheet: Món ăn lạnh · hàng nhiệt độ thường / Tươi sống / Quy tắc vận hành).
  - Nhà cung cấp nhập: Dấu thời gian · Ngày nhập kho · Tên nhà cung cấp · Tên sản phẩm · Số thùng đã xuất · Số món ăn đã xuất
  - Kho nhập: Kiểm tra của kho (Đã đến (chưa xử lý) / Đúng như ghi / NG · ES cần xác nhận / ES đã xử lý / Chưa nhập kho) · Ô ghi chú liên quan
- Yêu cầu: khi nhận được lịch nhập kho, muốn hệ thống có **màn hình để phía kho xác nhận số thùng và số lượng món ăn** (nếu có thể).
- Yêu cầu liên quan: REQ-PO-142 (ngày nhập kho · số thùng · kiểm tra của kho · ghi chú), REQ-PO-143 (quyền để nhân viên kho nhập kiểm hàng · chỉ chia sẻ màn hình cụ thể), REQ-PO-131 (số thùng của nhà cung cấp).
- Các câu hỏi thiết kế (W1~W5) ở Tài liệu xác nhận §10.

## 3. Trả lời xác nhận C1~C3 · Xác nhận nhập kho của kho W1~W5 (2026/10/01 anh Long)

| # | Vấn đề | Quyết định | Bổ sung |
|---|---|---|---|
| C1 | Muốn đổi số lượng sau khi phê duyệt đặt hàng chính thức | **A** Sau khi phê duyệt thì không sửa được. Tăng = đặt hàng bổ sung, giảm = hủy rồi đặt lại (cả hai đều lưu lịch sử) | |
| C2 | Phạm vi giao từng phần | **A+C** Ngày giao của mỗi lần đến ngày mong muốn nhập kho đầu tiên (lần không kịp thì không đăng ký được) + giới hạn số lần | Giá trị giới hạn đang xác nhận (đề xuất: 3 lần · tạm) |
| C3 | Liên kết trả lời không cần đăng nhập (R4 = B) | **Lo ngại về bảo mật. Đang xác nhận phương án không đặt liên kết trả lời** | §4 |
| W1 | Nơi người của kho nhập liệu | **A** Quyền "Nhân viên kho" ở Web vận hành. Chỉ hiển thị màn hình xác nhận nhập kho chuyên dụng cho nhân viên kho | |
| W2 | Đơn vị xác nhận | **A** Theo từng báo cáo xuất hàng (nếu giao từng phần thì mỗi lần) | |
| W3 | Trạng thái kiểm tra của kho | **A** 5 trạng thái hiện tại (Đã đến (chưa xử lý) / Đúng như ghi / NG · ES cần xác nhận / ES đã xử lý / Chưa nhập kho) | |
| W4 | Khi khác với dự kiến | **A** Tự động thành "NG · ES cần xác nhận", thông báo trên dải của vận hành và nhà cung cấp | |
| W5 | Hàng tươi sống | Đã nhận màn hình của tab Tươi sống (các cột giống Món ăn lạnh · hàng nhiệt độ thường: Dấu thời gian · Ngày nhập kho · Tên nhà cung cấp · Tên sản phẩm · Số thùng đã xuất · Số món ăn đã xuất · Kiểm tra của kho · Ô ghi AF) | Đang xác nhận ở §4 |

## 4. Đang xác nhận (2026/10/01)

- C3: nếu không đặt liên kết trả lời, phương án đưa nhà cung cấp có phương thức đặt hàng = email về R4 = A (email đơn đặt hàng + vận hành nhập hộ).
- C2: giá trị giới hạn số lần giao từng phần.
- W5: phương án dùng cùng một màn hình cho cả hàng tươi sống (lọc theo phân loại), chỉ hàng tươi sống nhập hạn sử dụng. Trong dữ liệu thực của hàng tươi sống có nhầm lẫn khi nhập như "số thùng 378 · số món ăn 18" (ES đã xử lý), nên đề xuất kiểm tra "số thùng × số lượng mỗi thùng (lot) có khớp với số lượng không" khi nhập báo cáo xuất hàng.

## 5. Trả lời §4 (2026/10/01 anh Long)

| # | Vấn đề | Quyết định |
|---|---|---|
| C3 | Liên kết trả lời | **Không đặt liên kết** (hủy R4 = B). Khi cần, vận hành có thể nhập hộ (bất kể phương thức đặt hàng, với đơn đặt hàng của nhà cung cấp nào cũng được). **Email gửi cho cả nhà cung cấp có đăng nhập (ES Station) lẫn không đăng nhập (email)**. Nội dung không phải đơn đặt hàng (PDF) mà là **văn bản trong nội dung email** (số đơn đặt hàng · sản phẩm · số lượng · ngày mong muốn nhập kho · kho nhận hàng, v.v.) |
| C2 | Giới hạn số lần giao từng phần | **A Tối đa 3 lần** (tạm. Có thể thay đổi bằng thiết lập của vận hành) |
| Kiểm tra nhập liệu | Nhầm lẫn trong báo cáo xuất hàng | **A** Ở báo cáo xuất hàng của nhà cung cấp, so sánh "số thùng × số lượng mỗi thùng (lot)" với số lượng, nếu không khớp thì cảnh báo. Nếu số thùng nhiều hơn số lượng thì lỗi |
| W5 | Hàng tươi sống | **Cùng một màn hình** (2026/10/01 anh Long đồng ý). Giá trị ban đầu của ngày nhập kho là hôm nay, phía trên có tab "Tất cả / Món ăn lạnh · hàng nhiệt độ thường / Tươi sống" (kèm số lượng), chỉ dòng hàng tươi sống nhập hạn sử dụng |

## 6. Phản ánh

- Vì phiên của các bước khác đang cập nhật demo nên **không phản ánh cho đến khi có tín hiệu của anh Long** (2026/10/01). Thứ tự phản ánh: demo vận hành → demo nhà cung cấp → đặc tả. Đọc lại ngay trước khi phản ánh, và để lại bản trước khi phản ánh ở `02_デモ/履歴/`
