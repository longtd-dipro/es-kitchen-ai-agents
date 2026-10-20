> Tóm tắt tiếng Việt các quyết định mới trong `docs/決定台帳.md` (mục AS · AT · AU và dòng #830–#837, ngày 2026-10-18 → 2026-10-19). Đây **không** phải bản dịch đầy đủ; bản JA `ja/決定台帳.md` là chuẩn.

# Sổ quyết định – tóm tắt các quyết định mới (2026-10-20)

## Theo nghiệp vụ

| Nghiệp vụ | Chủ đề | Quy tắc mới | Nguồn |
|---|---|---|---|
| **Hợp đồng** | Thế hệ giá | Hợp đồng con luôn mang `priceGenId`. Tháng sau kế thừa thế hệ giá của tháng trước. Hợp đồng mới dùng thế hệ đang công khai lúc đăng ký. Tăng giá hợp đồng đang chạy chỉ qua đổi hàng loạt từ tháng bắt đầu chu kỳ | #769, #780 |
| | Dùng thử → chính thức (tháng đã chốt / đã xuất hóa đơn) | Chuyển được nếu còn trước hạn chốt đơn của tháng đó. Khi đăng ký tạm, hợp đồng con thành chính thức. Bị từ chối / rút lại thì trả về như cũ. Quá hạn thì không cho chuyển | #782, #783 |
| | Đổi COOL便 ⇔ ES配送便 | Tháng chưa chốt: đổi giá gói và gắn lại phí OP000004. Thấp hơn mức dưới bảng giá thì bỏ phí; cao hơn mức trên thì vận hành nhập tay | #773 |
| | Danh sách đơn xin hợp đồng | Thêm nút "Sửa". Đơn đã từ chối / đã rút chỉ xem | #817 |
| **Hóa đơn** | Hóa đơn cuối | Không còn gì để thu vẫn tạo hóa đơn 0 yên: ghi trong ES, không gửi Bill One, không hiện trên Web doanh nghiệp. Tài khoản ngừng từ ngày sau hạn thanh toán | #779 |
| | Cảnh báo thiếu hóa đơn cuối | Cơ sở đã hủy mà quá tháng vẫn chưa có hóa đơn cuối → cảnh báo ở TOP vận hành, từ tháng sau tháng phải phát hành | #779 |
| | Chênh lệch khi chuyển sang chính thức | Tháng đã xuất hóa đơn: phần chênh vào phiếu điều chỉnh của hóa đơn sau. Tháng đã chốt: bỏ chốt để tính lại | #782 |
| | Phí trễ kiểm kê | Xét theo ngày nhập lần đầu. Đã báo trước hạn (23:59 ngày 25) thì không tính phí. Chưa từng báo, vận hành nhập hộ sau hạn thì tính phí | #766 |
| **Đại lý** | Đổi người giới thiệu (đại lý ⇔ doanh nghiệp) | Giới thiệu từ đại lý cũng tự tạo lịch sử giới thiệu. Chưa có lịch sử thanh toán thì đổi sang phí giới thiệu của bên mới và lưu lịch sử; đã có thanh toán thì không đổi được | #768 |
| | Đổi đại lý | Như trên. Mốc 36 tháng = ngày bắt đầu hợp đồng chính thức, tính riêng từng cơ sở | #777 |
| **Lịch trình** | Duyệt thay đổi giao hàng | Vận hành nhập chuyến và tuyến trên màn duyệt. Sắp lại lịch **ngay khi duyệt**, không chờ batch đêm. Chuyến đã gửi lệnh xuất kho chuyển sang "cần kiểm tra". Tháng chưa chốt thì đơn trở về đơn mặc định mới | #765 |
| | Duyệt đổi ngày giao | Xử lý như dời lịch: lưu lịch sử MV-, báo đơn vị giao hàng ủy thác và tài xế. Không đổi chuyến (slot). Sau khi gửi lệnh xuất kho thì tăng phiên bản | #772 |
| | Gửi lại lệnh xuất kho | Sửa số lượng sau khi đã gửi thì gửi lại (phiên bản +1). Đã có thực tế xuất kho thì không gửi lại. "Đã gửi" = vận hành bấm 「送信済にする」 | #774 |
| | CSV migration giao hàng | Đội dev nạp bằng script, không làm màn hình. Lịch giao được tạo khi hợp đồng con có chuyến và tháng có chu kỳ giao | #778 |
| | Cột "Thao tác" của danh sách giao hàng (Web doanh nghiệp) | Giữ cột này; nút 「ご返事する」 chỉ ở dòng cần trả lời | #830 |
| **Nhà cung cấp** | Nơi lưu đơn đặt hàng | Gộp về một chỗ (DB chung với site NCC), chuyển cả 205 đơn mẫu. NCC không có site thì vận hành nhập hộ | #767 |
| | Màn đặt hàng | NCC đặt qua email mà có tài khoản cũng xem được trên site NCC. Tháng chọn là mọi tháng có menu. Sản phẩm lấy từ master sản phẩm | #776 |
| **Menu và Order** | Menu công khai sau khi đăng ký tạm | Khi menu công khai thì tự tạo hợp đồng con và đơn mặc định cho cơ sở đăng ký tạm. Màn đặt hàng hiện ngày bắt đầu nhận đơn | #771 |
| | Đơn tự động AI | Trạng thái vẫn là 「自動注文」, kèm dấu "AI". Chỉ dùng số AI cho cơ sở đã chọn 「次回以降も適用」 | AT #28 |
| | Danh sách giao hàng (Web doanh nghiệp) | Màn mới: chuyến sắp tới gần nhất lên trước. Bỏ màn danh sách yêu cầu đổi ngày giao; đổi ngày giao làm từ danh sách / chi tiết giao hàng | AT #20 |
| **Tồn kho** | Báo cáo kiểm kê | Bỏ cột "số đã nhận", hàng đang giao tính là đã nhận (E327). Bỏ cảnh báo E321. Giữ "thêm sản phẩm". Số lượng 0–999.999 | AT #31, #826 |
| | Lấy số từ tờ khai | Bỏ. "Đã báo" chỉ dựa vào báo cáo kiểm kê (kể cả vận hành nhập hộ) | #775 |
| | CSV báo cáo kiểm kê | 1 dòng = 1 cơ sở × 1 sản phẩm | #831 |
| | Mức chênh tồn kho cho phép | Hiện sau khi chốt; chưa định nghĩa chốt ở màn nào nên tạm thời chưa hiện | #832 |
| **Tài xế** | Kiểm kê | Hàng đang giao tính là đã nhận, giống Web doanh nghiệp | #826 |
| | Tồn lý thuyết khi giao ES配送便 | Là tồn trước lần giao này, không cộng hàng đang chở | #826 |
| | Không tải được dữ liệu | Dải 「オフラインです」 + nút 「再読み込み」, giữ nội dung đã tải; dải có mã thông báo | #822, #835 |
| | Hộp xác nhận | Hủy bên trái, thực hiện bên phải (giống Web) | #833 |
| **Đối tác vận chuyển** | Yêu cầu báo giá (chức năng mới) | Vận hành tạo yêu cầu, gửi nhiều công ty → so sánh → chọn 1 công ty hoặc hủy. Tìm theo địa chỉ chuyển sang màn tạo yêu cầu | AT #41 |
| | Chi tiết báo giá | Chỉ đổi hạn thì không xóa trả lời. Đổi điều kiện thì gửi lại cả công ty đã từ chối. Quá hạn mà vẫn 「依頼中」 thì vẫn trả lời được | AT #41 |
| | Thông báo chọn / hủy | Gửi mail và trên màn hình cho các công ty, trừ công ty đã từ chối | AU #827 |
| | Yêu cầu quá hạn | Không công ty nào trả lời → vào "cần kiểm tra" của vận hành; tự đóng khi có trả lời, gia hạn, chọn hoặc hủy | AU #828 |
| | Tiêu đề mail báo giá (M28, M28b) | Bắt đầu bằng 「ESキッチン」 | #836 |
| **Đăng ký doanh nghiệp** | 「この拠点に請求」 | Mọi cơ sở đều tính riêng thì ẩn mục tính tiền của doanh nghiệp. 1 cơ sở: lấy thông tin cơ sở làm giá trị ban đầu | AT #16 |
| | 「法人の担当者情報と同じ」 | Chép toàn bộ người phụ trách (chính, phụ, nhận hóa đơn) tại thời điểm đăng ký | AT #17 |
| | Vận hành nhập hộ đăng ký | Cơ sở tự nhận hóa đơn thì phải chọn phương thức và chu kỳ thanh toán (mặc định hằng tháng) | AT #12, #16 |
| | Cơ sở và đơn xin | Xem và tạo đơn xin từ chi tiết cơ sở. Xuất QR (PDF) | AT #33, #35 |
| | Tài khoản và mật khẩu | Web doanh nghiệp bỏ đổi mật khẩu. Mail cấp tài khoản luôn kèm mật khẩu ban đầu. Link đặt lại mật khẩu ở mọi site là 「パスワードを忘れた方」 | AT #36, AU #827 |
| | Liên hệ | Chỉ còn widget HubSpot; không hiện trước khi đăng nhập; widget nhận mã doanh nghiệp, mã cơ sở | AT #25, AU #829 |

## Quy tắc chung (mọi site)

| Chủ đề | Quy tắc | Nguồn |
|---|---|---|
| Tên nút hủy trong hộp xác nhận | Thống nhất 「キャンセル」 | #834 |
| Câu lỗi E01 | Giữ 「{項目名}は必須項目です。」 | #837 |
| Bảng danh sách | Tìm kiếm 1 dòng + 「詳細条件」 thu gọn; cột đầu cố định; ô không xuống dòng; cột thao tác cố định khi cuộn ngang | AT #6, #40 |
| Placeholder | Là tên mục; ví dụ / định dạng để dưới ô hoặc 「？」 | AT #15 |
| Hộp thoại chung | 3 cỡ S/M/L; đóng bằng ×/Esc/nền (trừ thao tác nguy hiểm); hủy trái, thực hiện phải | AT #37, #40 |
