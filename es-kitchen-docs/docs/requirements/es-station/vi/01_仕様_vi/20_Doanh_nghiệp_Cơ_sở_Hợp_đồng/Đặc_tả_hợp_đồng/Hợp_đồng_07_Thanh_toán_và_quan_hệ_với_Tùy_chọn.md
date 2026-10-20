> Bản dịch tiếng Việt của `ja/01_仕様/20_法人・拠点・契約/契約仕様/契約_07_請求・オプションとの関係.md` (nguồn es-station, bản 2026-10-20). Khi khác nhau, bản tiếng Nhật và `docs/決定台帳.md` là chuẩn.

# Đặc tả hợp đồng: Quan hệ với hóa đơn, tùy chọn và phí vi phạm (§0.5, 0.7, 0.8, 0.9, 0.11) — Danh sách nơi chuyển đến

<!-- 元：20_法人・拠点・契約/法人拠点契約子契約_項目一覧.md（2026-10-03 に分割）。2026-10-03 に中身を正のファイルへ移し、重複を消した。旧の節番号で探したときの行き先だけを残す -->

| Mục cũ | Nội dung | Nơi chuẩn hiện nay |
|---|---|---|
| §0.5 Phần hóa đơn: quyết định một nơi duy nhất "cái nào là chuẩn" | Chủ sở hữu của nơi nhận hóa đơn, đơn vị phát hành, tên doanh nghiệp, lead time, phương thức thanh toán, ID nơi phát hành Bill One, người phụ trách hóa đơn; bản sao ở hợp đồng con | **契約_00 §0.5** (đã chuyển. Đơn vị phát hành: "doanh nghiệp chỉ xem, thay đổi do vận hành"; đã thêm nơi nhận hóa đơn và lead time vào bản sao của hợp đồng con) |
| §0.7 Tùy chọn và giảm giá: tạo master và… | Chủ sở hữu, liên động (kiểu A), đối tượng áp dụng, thứ tự cộng dồn, thiết bị không đưa vào tùy chọn, khoản doanh nghiệp chịu và điều chỉnh giá | Cách nghĩ về tùy chọn và giảm giá: chuẩn là **マスタ項目一覧 §0.2〜0.5**. Các mục phía hợp đồng ở 契約_04 (xem) và 契約_05 (đăng ký). Điều chỉnh giá do hợp đồng con giữ (28-144) ở 契約_05 giảm giá・khoản chịu #2 |
| §0.8 Hai bảng ① số tiền cố định và ② thanh toán theo thực tế | Cấu trúc 2 bảng, kỳ đối tượng theo từng dòng, số hóa đơn theo từng bảng, tổng chỉ để tham khảo | **契約_06 §0.8** (đã chuyển). Các giai đoạn chốt, xác nhận, phát hành, hạn nộp tiền, thuế tiêu dùng, trạng thái hóa đơn ở **請求ルール §1・2-4** |
| §0.9 Ngày phát hành hóa đơn và hạn nộp tiền | Công thức, ví dụ theo lead time, trả một lần theo năm | **請求ルール §1** (1-1・1-2・1-5, ví dụ theo lead time ở 1-9)・4-3 |
| §0.11 Phí vi phạm | Bãi bỏ. Chuẩn là 請求ルール §3-4, 契約_04 danh sách cho thuê #13・#14 (thay đổi 2026/10/09: không phân bổ theo tỷ lệ. Phí hủy thiết bị (master model máy, dưới 1 năm) cộng nguyên, riêng phí vi phạm hợp đồng ¥12,000. 受付簿 #504) | Thời gian sử dụng tối thiểu theo từng thiết bị (tủ lạnh 3 tháng, máy bán hàng tự động 12 tháng) tính từ ngày cho thuê; phí vi phạm = số tiền thu hồi khi hủy × số tháng còn lại ÷ thời gian sử dụng tối thiểu, cộng dồn theo từng thiết bị. Nếu tại thời điểm nhập ngày mong muốn hủy mà phát sinh phí vi phạm thì cảnh báo trước khi xác nhận (請求ルール 3-4). (Cũ: tính từ ngày bắt đầu hợp đồng, pulldown 6／12／24／36 tháng. Đã sửa theo sổ quyết định ngày 2026-10-03) |
