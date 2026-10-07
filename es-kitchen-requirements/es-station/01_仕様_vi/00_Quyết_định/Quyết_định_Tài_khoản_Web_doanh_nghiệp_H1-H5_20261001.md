> **Đã đóng băng (tài liệu gốc・2026-10-05). Từ nay không cập nhật.** Quyết định đang có hiệu lực nằm ở `docs/決定台帳.md`. Nội dung của file này được chuyển đi đâu và các quyết định bị thay thế thì xem "G" trong sổ quyết định.

# Quyết định: Những điểm chưa quyết của tài khoản doanh nghiệp／tài khoản cơ sở trên Web doanh nghiệp H1〜H5 (2026/10/01)

> Người yêu cầu: Long (Tran Duc Long)／Soạn: Claude (Cowork). Là trả lời cho H1〜H5 ở `Thiết_kế_cơ_bản_Đề_xuất_định_nghĩa_tổng_thể_20261001.md` §10-7-5.
> **Sau khi nhận trả lời H3 = A ngày 2026/10/01, đã phản ánh vào demo・đặc tả (v1.54).** Nội dung phản ánh ở §3.
> Tài liệu tương tự trên Mac: `01_仕様/00_Quyết_định/Quyết_định_Tài_khoản_Web_doanh_nghiệp_H1-H5_20261001.md`

## 1. Quyết định

| # | Vấn đề | Quyết định | Nội dung |
|---|---|---|---|
| H1 | Nội dung trang chủ của tài khoản doanh nghiệp (trang chủ xem tất cả cơ sở) | **Lịch trình + danh sách thông báo** | Theo cùng cách nghĩ với cổng thông tin của công ty giao hàng ủy thác, hiển thị lịch giao hàng của tất cả cơ sở và danh sách thông báo. Có thể lọc theo cơ sở (trong phạm vi đề xuất của Claude) |
| H2 | Tài khoản cơ sở có thể rút lại yêu cầu do tài khoản doanh nghiệp gửi không | **Không thể** | Người có thể rút lại chỉ là tài khoản đã gửi yêu cầu và tài khoản doanh nghiệp |
| H3 | Tài khoản đã "thêm cơ sở" có thể xem cơ sở mới được thêm đó không | **A: Không thấy** | Cơ sở mới và yêu cầu "thêm cơ sở" đó không hiển thị trong danh sách cơ sở・danh sách yêu cầu của tài khoản đã thêm. Xem bằng tài khoản cơ sở của cơ sở mới và tài khoản doanh nghiệp. Kết quả (phê duyệt・lý do từ chối) được gửi đến người đăng ký qua email (anh Long trả lời A ngày 2026/10/01) |
| H4 | Danh sách yêu cầu của tài khoản cơ sở chỉ có cơ sở của mình phải không | **Đúng** | Danh sách yêu cầu của tài khoản cơ sở chỉ có yêu cầu của cơ sở mình (vì H3 = A nên không thêm ngoại lệ) |
| H5 | Có hiển thị mã dòng máy (như RF000002) trên Web doanh nghiệp không | **Hiển thị** | Hiển thị mã dòng máy cùng với tên dòng máy để có thể xác định dòng máy khi quản lý・hỏi đáp (không chọn đề xuất "không hiển thị" của Claude) |

## 2. Các lựa chọn của H3 (đã quyết định A)

Tiền đề: Tài khoản cơ sở có một cho mỗi cơ sở (C1), phạm vi hiển thị là "chỉ cơ sở đó" (C3). Cơ sở mới được cấp tài khoản cơ sở mới, hướng dẫn đăng nhập được gửi cho người phụ trách của cơ sở đó (28-145). Nếu áp dụng nguyên H4 (danh sách yêu cầu chỉ có cơ sở của mình), thì người đã thêm cũng không thể xem tình trạng (phê duyệt・lý do từ chối) của yêu cầu "thêm cơ sở".

| Lựa chọn | Nội dung | Ưu điểm | Nhược điểm |
|---|---|---|---|
| A | Không thấy (cơ sở mới xem bằng tài khoản cơ sở mới và tài khoản doanh nghiệp) | Giữ nguyên quy định "tài khoản cơ sở = chỉ cơ sở đó". Phân quyền đơn giản | Người đã thêm không thể xác nhận kết quả yêu cầu (phê duyệt・từ chối・lý do từ chối) |
| B | Thấy (cấp quyền của cơ sở mới cho cả tài khoản đã thêm) | Người đã thêm có thể quản lý luôn | Một tài khoản cơ sở sẽ xem nhiều cơ sở, phá vỡ quy định C3. Cơ chế phân quyền phức tạp |
| **C (đề xuất)** | Không thấy cơ sở, nhưng chỉ yêu cầu "thêm cơ sở" do chính mình gửi thì thấy được trong danh sách yêu cầu (từ tiếp nhận đến phê duyệt・từ chối). Sau khi phê duyệt, xem bằng tài khoản cơ sở mới và tài khoản doanh nghiệp | Giữ quy định C3 mà người gửi vẫn xác nhận được kết quả. Lý do từ chối cũng được truyền đạt | Cần thêm 1 dòng vào H4: "yêu cầu thêm cơ sở do chính mình gửi là ngoại lệ" |

## 3. Nội dung đã phản ánh (2026/10/01・v1.54)

| # | Demo | Đặc tả |
|---|---|---|
| H1 | Không có chỗ cần sửa. Trang chủ của `20_法人_まとめ.html` (iframe fdl) từ 2026/09/30 đã hiển thị, với tài khoản doanh nghiệp, lịch trình của tất cả cơ sở (tên cơ sở ở đầu ô) + thông báo + các lần giao hàng cần xác nhận, và bộ lọc cơ sở (thay đổi bằng nút chuyển ở góc dưới bên phải "Doanh nghiệp／Cơ sở (Chi nhánh Osaka)") | Thiết kế cơ bản §10-7-2・§10-7-5, đặc tả màn hình v1.9 §4-17 |
| H2 | Với yêu cầu do tài khoản doanh nghiệp gửi, tài khoản cơ sở không thấy liên kết "Rút lại" ở banner chi tiết cơ sở và nút "Rút lại" ở chi tiết yêu cầu mà thay vào đó hiển thị lý do | Thiết kế cơ bản §10-7-2, đặc tả màn hình v1.9 §1・§4-18 |
| H3 | Ở màn hình hoàn tất tiếp nhận của form đăng ký (thêm cơ sở・tài khoản cơ sở) hiển thị hướng dẫn "Cơ sở đã thêm sẽ không hiển thị trong tài khoản này". Không hiển thị trong danh sách cơ sở・danh sách yêu cầu | Thiết kế cơ bản §10-7-2・§10-7-5, đặc tả màn hình v1.9 §2-2・§4-19 |
| H4 | Không có chỗ cần sửa (danh sách yêu cầu của tài khoản cơ sở chỉ có cơ sở của mình) | Thiết kế cơ bản §10-7-2 |
| H5 | Mã dòng máy + tên dòng máy: danh sách cho thuê・thiết bị của hợp đồng con・biến động thiết bị (quản lý cơ sở), các lựa chọn và màn hình xác nhận của đăng ký thay đổi thiết bị (form đăng ký). Mục tiêu quyết toán khi hủy đã hiển thị từ trước. Đồng thời đặt thời gian sử dụng tối thiểu của dòng máy trong form đăng ký là tủ lạnh 3 tháng・máy bán hàng tự động 12 tháng (STEP2 Q8) | Thiết kế cơ bản §10-7-2・§10-7-5, đặc tả màn hình v1.9 §4-20・§5-1 |

Script: `項目一覧_生成スクリプト/patch_h1h5_corp_20261001.py` (demo)・`patch_h1h5_spec_20261001.py` (đặc tả). Khi khôi phục: `02_デモ/履歴/v1.54_20261001_H1-H5前/`

<!-- patch_h1h5_spec_20261001 -->
