> **Đã đóng băng (bản gốc・2026-10-05). Từ nay không cập nhật nữa.** Quyết định đang có hiệu lực hiện nay là `docs/決定台帳.md`. Xem sổ quyết định "G" để biết nội dung của file này đã chuyển đi đâu và những quyết định đã bị thay thế.

# Quyết định: Trả lời cho 50 mục "Phản ánh một phần" và 5 mục "Chưa phản ánh" của Bảng yêu cầu Phase2 (2026/09/30)

Kết quả hong chọn cách tiến hành cho 50 mục "Phản ánh một phần" sau khi đối chiếu ESS_Bảng yêu cầu mới (Phase2) với đặc tả hiện tại.
"Nội dung yêu cầu (đã chốt)" là câu có thể ghi nguyên văn vào cột bổ sung của bảng yêu cầu. Tình trạng phản ánh vào đặc tả ở "Nơi phản ánh" nằm ở bảng cuối (phản ánh 2026/09/30).
Số dòng là theo bảng yêu cầu sau lần cập nhật 08:45 ngày 2026/09/30 (dòng cũ 141・180 đã bị xóa, các dòng từ 142 trở đi dồn lên 1 dòng).
Dữ liệu gốc: `03_Excel/新ESS_要件シート_Phase2_仕様反映チェック_20260930.xlsx` các sheet "一部反映_要件内容", "更新差分_0930"

## Các dòng cần xác nhận

- **Dòng 13 Lịch sử thay đổi đặt hàng và gửi lại**: Lo ngại (hong): nếu sau khi chốt đặt hàng vẫn sửa được thì ý nghĩa của việc chốt sẽ sụp đổ. Cần quyết định hạn chót có thể sửa (ví dụ: đến ○ ngày làm việc trước ngày giao hàng)
- **Dòng 15 Cách nhận giao từng phần・thay đổi ngày giao**: Lựa chọn là "nhập ở ô trả lời" nhưng trong ghi chú có "nút yêu cầu giao từng phần" nên đã ghi theo cách dùng nút. Cần xác nhận
- **Dòng 27 Luồng đưa nhà vận chuyển ủy thác vào yêu cầu thay đổi**: Trả lời cho câu hỏi của hong: "Thay đổi" trong bảng yêu cầu gồm 4 loại: ①số lần giao hàng ②thứ giao hàng ③chuyến ES giao→chuyến COOL ④địa chỉ giao hàng. Việc sắp xếp bên được ủy thác thay đổi chủ yếu ở ②④ (vẫn là chuyến ES giao). Cần trả lời lại về cách xử lý
- **Dòng 32 Số lượng có thể bố trí của máy bán hàng tự động**: Công thức tính sức chứa tối đa sẽ xác định riêng (Danh sách mục master §0.9 OPEN #10)
- **Dòng 43 Mô phỏng tủ lạnh**: Đang chờ nhận từ khách hàng sức chứa tối đa・bảng tủ đông
- **Dòng 45 Thông tin chi tiết nơi giao hàng ủy thác (bảng bàn giao)**: Đổi phán định thành "Đã phản ánh"
- **Dòng 68 Tài liệu cho đề xuất đổi gói**: Đổi phán định thành "Ngoài đối tượng"
- **Dòng 69 Phân tích thông tin hủy hợp đồng**: Đổi phán định thành "Ngoài đối tượng"
- **Dòng 71 Email khi đổi người phụ trách**: Cần thống nhất cách diễn đạt với ghi chú bổ sung của bảng yêu cầu "Khi đổi người phụ trách thì thực hiện gửi email"
- **Dòng 76 Dữ liệu dùng cho đề xuất đặt hàng bằng AI**: Truyền cho nhóm AI làm dữ liệu đầu vào
- **Dòng 87 Phương châm thiết kế tổng thể (hướng tới sản xuất của nhà máy)**: Đổi phán định thành "Ngoài đối tượng"
- **Dòng 112 Hóa đơn (lọc・ngày phát hành・thay thế)**: Cần chú ý: kết luận ngược với danh sách mục §0.9 (quyết định 2026/09/29: gửi ngày 1 tháng sau・1 bản). Cần đối chiếu cả với ghi chú quyết định (決定_請求書発行_20260925 v.v.) và xác nhận lại bên nào là chuẩn
- **Dòng 127 Email chờ xuất hàng・đã xuất hàng**: Cần cập nhật ghi chú bổ sung của bảng yêu cầu (gửi email OK)
- **Dòng 135 Chỉ định thời gian của hàng thay thế**: OPEN-1・3・4 sẽ xác nhận riêng với anh/chị Aoyama
- **Dòng 139 Đặt hàng không qua ES**: Cần xác nhận phạm vi của "đơn giản"
- **Dòng 157 Mục có thể thiết lập từ quản lý doanh nghiệp (ES-QR)**: Cần xác nhận riêng việc đổi Chế độ khách có cần Vận hành phê duyệt hay không
- **Dòng 170 Giới hạn dưới・trên của số đặt hàng đông lạnh**: Thay mô tả "tối đa 30%" bằng chỉ định số lượng
- **Dòng 173 Giao hàng đông lạnh (cảnh báo vượt dung lượng)**: Đang chờ nhận từ khách hàng bảng tủ đông
- **Dòng 188 (thêm 9/30) Sửa số tiền sau khi gửi hóa đơn**: Cần sắp xếp cùng kết luận của dòng 112 (lấy tổng hợp §14-4 làm chuẩn)

## Nội dung yêu cầu theo từng dòng

### Sản phẩm

| Dòng | Tiêu đề | Nội dung yêu cầu (đã chốt) | Nơi phản ánh |
|---|---|---|---|
| 13 | Lịch sử thay đổi đặt hàng và gửi lại | Ở cả đặt hàng tạm và đặt hàng chính thức, Vận hành có thể sửa đơn đặt hàng ngay cả sau khi nhà cung cấp đã phê duyệt. Khi sửa thì thông báo lại bằng hiển thị trên Top của nhà cung cấp ＋ email, và nhận phê duyệt lại của nhà cung cấp. Số lượng trước và sau khi sửa được lưu ở tab lịch sử thay đổi của chi tiết đặt hàng. | Đặt hàng・nhập mua・nhập kho REQ-PO-304／RD-PO-061 |
| 14 | Phản hồi nhận đơn của nhà cung cấp | Sau khi đặt hàng chính thức, cứ 24 giờ (chỉ đếm ngày làm việc) kiểm tra tình trạng xử lý của nhà cung cấp, nếu chưa xử lý thì gửi email cảnh báo cho nhà cung cấp (lặp lại mỗi 24 giờ cho đến khi được xử lý) ＋ hiển thị trên Top của Vận hành. Master nhà cung cấp có mục "có coi thứ Bảy・Chủ nhật・ngày lễ là ngày làm việc hay không", cũng nhập được trong form đăng ký mới (nhà cung cấp hiện có thì nhập tay theo kết quả hỏi). | Đặt hàng・nhập mua・nhập kho REQ-PO-302・REQ-PO-301／RD-PO-070・RD-PO-065 |
| 15 | Cách nhận giao từng phần・thay đổi ngày giao | Nhà cung cấp có thể đăng ký ngày dự kiến đến・số thùng theo từng lần từ nút "Yêu cầu giao từng phần" cho mỗi đơn đặt hàng. Nếu có đăng ký giao từng phần・thay đổi ngày giao thì hiển thị cảnh báo trên màn hình Top của Vận hành (không gửi email). | Đặt hàng・nhập mua・nhập kho REQ-PO-303・REQ-PO-133／RD-PO-073・074 |
| 139 | Đặt hàng không qua ES | Với ③ đặt hàng qua hệ thống đặt hàng phía nhà cung cấp cũng xử lý đơn giản để quản lý được tồn kho kho hàng (ví dụ: Vận hành chỉ ghi lại đặt hàng và nhập kho). ② là gửi đơn đặt hàng bằng email ＋ Vận hành nhập hộ. Master nhà cung cấp giữ phương thức đặt hàng (ES Station／email／bên ngoài). | Đặt hàng・nhập mua・nhập kho RD-PO-057／Master nhà cung cấp RD-PO-065 |
| 170 | Giới hạn dưới・trên của số đặt hàng đông lạnh | Số đặt hàng đông lạnh được quyết định theo số lượng của từng gói (số lượng cung cấp hàng tháng đông lạnh của master gói). Không giữ giới hạn dưới・trên theo tỷ lệ. | Master gói REQ-PM-039／RD-AP-129 |
| 173 | Giao hàng đông lạnh (cảnh báo vượt dung lượng) | Khi số đặt hàng đông lạnh 1 lần vượt sức chứa tối đa của tủ đông thì đưa ra cảnh báo (không dừng đơn hàng). Khi chia giao hàng đông lạnh thành nhiều lần thì phân bổ đều. | Đặc tả màn hình đặt hàng RD-AP-128 |
| 174 | Phí tủ đông của khách hàng hiện hữu | Thêm vào master tùy chọn tùy chọn thuê tủ đông theo kích thước và tùy chọn phí khởi tạo 20.000 yên làm phí tủ đông của khách hàng hiện hữu (có thể gán hàng loạt bằng CSV). | Danh sách mục master Master tùy chọn／thay thế OP-RENT-FZ trong chi tiết đơn đăng ký |
| 175 | Chuyển sang Standard của khách hàng hiện hữu | Khi chuyển dữ liệu thì đặt course của hợp đồng hiện hữu là Lite, phần muốn Standard thì đổi hàng loạt bằng CSV (giữ nguyên phí hàng tháng bằng giảm giá chênh lệch). | Đặc tả chuyển dữ liệu |

### Logistics

| Dòng | Tiêu đề | Nội dung yêu cầu (đã chốt) | Nơi phản ánh |
|---|---|---|---|
| 26 | Thông báo yêu cầu hủy hợp đồng và giữ chân khách | Yêu cầu hủy hợp đồng được xác định qua chọn lý do và đề xuất thay thế rồi Vận hành phê duyệt. Với cơ sở chuyến ES giao, tại thời điểm Vận hành phê duyệt thì thông báo hủy hợp đồng cho công ty vận chuyển ủy thác phụ trách bằng hiển thị Web ủy thác ＋ email. Kịch bản giữ chân khách sẽ phản ánh sau khi nhận bản nền do anh/chị Aoyama tạo. | Tổng hợp §8-7／Chi tiết đơn đăng ký AP-CXL／Hợp đồng REQ-CT-192 |
| 27 | Luồng đưa nhà vận chuyển ủy thác vào yêu cầu thay đổi | (Bảo lưu) Có nối yêu cầu báo giá cho công ty vận chuyển ủy thác vào yêu cầu thay đổi chuyến ES giao hay không. | Chi tiết đơn đăng ký 28-144／Định nghĩa yêu cầu RD-DL-163 |
| 28 | Tìm kiếm tổ hợp thứ giao hàng và gợi ý bên ủy thác | Không tạo tìm kiếm tổ hợp thứ giao hàng (thứ ○ của tuần 1 tuần 3, v.v.). Thay thế bằng tìm kiếm địa chỉ của lịch giao hàng (tỉnh・quận huyện・mã bưu điện) và hiển thị thứ phục vụ・phí của master nơi giao hàng ủy thác. | Tổng hợp §3-3・DEV §14 carriers (thứ phục vụ・phí)／REQ-DL-205 |
| 29 | Xác định văn phòng gần nhất (điểm trung chuyển) | Danh sách điểm trung chuyển cũng tìm kiếm được theo quận huyện・mã bưu điện, và hiển thị cột địa chỉ trong danh sách. Không tự động xác định văn phòng gần nhất (chỉ tìm kiếm). | Tổng hợp §3-1 |
| 31 | Phê duyệt nâng kích thước tủ lạnh | Không đưa luồng phê duyệt (MG Hayashi phê duyệt) vào việc nâng kích thước tủ lạnh. Vận hành thay đổi bằng biến động thiết bị của hợp đồng con, chênh lệch được thanh toán bằng tùy chọn. | Chi tiết đơn đăng ký Thông tin thiết bị／28-163 |
| 32 | Số lượng có thể bố trí của máy bán hàng tự động | Khi số đơn hàng của sản phẩm tương thích băng tải vượt tổng sức chứa của các cột băng tải thì đưa ra cảnh báo (không dừng đơn hàng). | Order-Spec §7／REQ-DL-213 |
| 37 | Hiển thị điểm trung chuyển nhận hàng của ứng dụng tài xế | Hiển thị tên văn phòng・địa chỉ・mã văn phòng・điện thoại của điểm trung chuyển tại điểm nhận hàng của ứng dụng tài xế. | Tổng hợp §12-2 |
| 39 | Quản lý bản đồ toàn quốc・bảng phí | Không tạo bản đồ toàn quốc (hiển thị bản đồ). Master nơi giao hàng ủy thác giữ bảng phí (khu vực × phí thanh toán・phụ thu khu vực), có thể nhập bằng CSV. | Tổng hợp §3-3・DEV §14 |
| 41 | Yêu cầu báo giá cho bên ủy thác và phản hồi | Các mục phản hồi cho yêu cầu báo giá gửi bên ủy thác là "có thể báo giá／không thể đáp ứng・phí hàng tháng・đính kèm・bình luận・điểm trung chuyển" (RD-DL-167/169), không có chat. | Tổng hợp §12-6／DEV (thêm bảng hỏi đáp giao hàng・phản hồi báo giá) |
| 43 | Mô phỏng tủ lạnh | Mô phỏng tủ lạnh được thay thế bằng bảng cấu hình tiêu chuẩn theo gói ＋ phán định sức chứa tối đa (không tạo màn hình tính dung lượng). | Danh sách mục master §0.9-3／Đặc tả master gói |
| 44 | Số túi giữ lạnh・Số đá giữ lạnh | Master nơi giao hàng ủy thác giữ số túi giữ lạnh・số đá giữ lạnh. | DEV §14 carriers／Tổng hợp §3-3・§12-5／REQ-DL-210 ("nơi giao hàng" → "nơi giao hàng ủy thác") |
| 45 | Thông tin chi tiết nơi giao hàng ủy thác (bảng bàn giao) | Nội dung bảng bàn giao là đủ với các mục của master công ty vận chuyển ủy thác hiện tại, không thêm. | — (không thay đổi) |
| 49 | Liên lạc với tài xế (xóa chat) | Ứng dụng tài xế・Web công ty vận chuyển ủy thác không có chat (chức năng nhắn tin). Khi khẩn cấp thì liên lạc bằng nút gọi điện. | Tổng hợp §12-2・§12-6／Xóa chat khỏi REQ-DL-153 |
| 53 | Tìm kiếm bên ủy thác・phụ thu khu vực khi đang đàm phán | Ngay cả khi đang đàm phán vẫn tìm kiếm được bên ủy thác・khu vực phục vụ・mức phụ thu khu vực từ địa chỉ (hiển thị từ phí của master nơi giao hàng ủy thác). Phụ thu khu vực được ghi vào thanh toán dưới dạng tùy chọn của hợp đồng con. | Tổng hợp (màn hình hỏi đáp giao hàng)／Master tùy chọn Phí giao hàng theo khu vực |
| 57 | Nhập danh sách nhà thầu・dữ liệu số tiền | Khu vực phục vụ của nơi giao hàng ủy thác giữ theo đơn vị tỉnh và cũng giữ số tiền. Có thể nhập từ sheet hiện có・Notion. | Tổng hợp §3-3・DEV §14 |
| 127 | Email chờ xuất hàng・đã xuất hàng | Dù chuyển sang chờ xuất hàng・đã xuất hàng cũng không gửi email. Hiển thị trạng thái・số vận đơn・liên kết theo dõi ở trang chủ doanh nghiệp. | Tổng hợp §10 (như đặc tả hiện tại) |
| 142 | Thông báo bỏ sót liên kết tài xế | Với hàng chưa đặt tài xế thì hiển thị trên mục cần xác nhận của Vận hành và Web công ty vận chuyển ủy thác vào 3 ngày trước và 1 ngày trước ngày giao hàng, đồng thời gửi email cho công ty vận chuyển ủy thác. | Quyết định v2.3 #43／Tổng hợp §10-5 (sửa "chưa phát hành vận đơn" thành chưa đặt tài xế) |
| 164 | Ảnh báo cáo công việc (modal・ghi chú Vận hành) | Ảnh báo cáo công việc có thể xem bằng cách lướt trái phải trong modal. Giữ ghi chú Vận hành (internal_memo) theo từng dữ liệu giao hàng, Vận hành cũng có thể thêm ảnh. | Tổng hợp §15-7／Đặc tả màn hình chi tiết dữ liệu giao hàng／Demo 16 |

### CS

| Dòng | Tiêu đề | Nội dung yêu cầu (đã chốt) | Nơi phản ánh |
|---|---|---|---|
| 62 | Gửi email tránh ngày nghỉ | Email bắt đầu・hạn chót・nhắc nhở đặt hàng, nếu ngày gửi rơi vào thứ Bảy・Chủ nhật・ngày lễ・ngày toàn công ty không thể giao hàng thì gửi sớm vào ngày làm việc trước đó (không xét ngày nghỉ riêng của từng khách hàng). | Đặc tả thông báo (bổ sung vào 01_仕様)／RD-NT-030 |
| 68 | Tài liệu cho đề xuất đổi gói | Đề xuất đổi gói thực hiện theo vận hành của CS, Phase2 không thêm chức năng hệ thống. | — |
| 69 | Phân tích thông tin hủy hợp đồng | Phân tích thông tin hủy hợp đồng (liên kết với thực tế gần đây) là Phase3. Phase2 chỉ đến mức ghi lại lý do hủy・thời gian hợp đồng. | Hợp đồng RD-CT-176 |
| 71 | Email khi đổi người phụ trách | Thông báo khi đổi người phụ trách chỉ gửi cho Vận hành (đặc tả hiện tại). Không gửi email cho doanh nghiệp (người phụ trách mới). | — (như đặc tả hiện tại) |
| 129 | Chọn toàn bộ ô số đặt hàng | Khi bấm vào ô số đặt hàng thì chọn toàn bộ giá trị, có thể nhập ghi đè luôn (cả Web Vận hành và Web doanh nghiệp). | RD-AP-121 |
| 130 | Trạng thái đơn hàng (khách hàng/ES) | Trạng thái đơn hàng được theo dõi bằng một trạng thái duy nhất ＋ lịch sử thay đổi (khi nào・ai). Không chia thành 2 trục. Trả lời cho khách hàng là kết quả xem xét kỹ. | Đặc tả đơn hàng |
| 134 | Thông báo sau khi đổi ngày giao hàng | Thông báo cho doanh nghiệp khi đổi ngày giao・ngày gửi sẽ hiển thị ngày giao mới nhất trong thông báo ở trang chủ doanh nghiệp (không gửi email). | Quyết định #63／Đặc tả thông báo |
| 157 | Mục có thể thiết lập từ quản lý doanh nghiệp (ES-QR) | Thiết lập sử dụng ES-QR chỉ Vận hành mới thay đổi được (Web doanh nghiệp chỉ hiển thị). Chế độ khách・số lượng giới hạn 1 ngày・số tiền giới hạn 1 tháng có thể thay đổi từ Web doanh nghiệp. | Danh sách mục／Đặc tả màn hình Web doanh nghiệp_Quản lý cơ sở |
| 159 | Tháng bắt đầu của hợp đồng mới cũng liên động với hạn chót | Tháng bắt đầu của đăng ký mới cũng liên động với hạn chót đặt hàng (đăng ký trước hạn chót thì bắt đầu tháng sau, sau hạn chót thì bắt đầu tháng sau nữa). | Hợp đồng REQ-CT-257／Tổng hợp §8-7 |
| 165 | Tạm dừng sử dụng | Tạm dừng sử dụng được xử lý bằng yêu cầu của doanh nghiệp → Vận hành phê duyệt, giới hạn là tổng cộng 1 năm (K-04). Trong thời gian tạm dừng không tạo hợp đồng con. Cập nhật ghi chú bổ sung của bảng yêu cầu theo nội dung này và xác nhận với anh/chị Aoyama. | Liên quan đến đơn đăng ký 28-1・28-10・28-11／Đặc tả chi tiết đơn đăng ký §6 (sửa quy tắc mở lại cho khớp 28-11) |
| 168 | Đặt lịch họp kick-off | Ở màn hình hoàn tất đăng ký mới, hướng dẫn URL đặt lịch họp kick-off (booking.receptionist.jp/kickoff-mtg-schedule/60min) cho tất cả mọi người (không hỏi về kinh nghiệm). | Form đăng ký doanh nghiệp_Sắp xếp_v2／Demo 21／REQ-CT-122 |
| 178 | Định dạng phiếu giao hàng | Phiếu giao hàng kế thừa mẫu hiện hành, nếu các dòng menu không vừa 1 trang thì ngắt sang nhiều trang. | REQ-DL-316／RD-DL-066 |

### Kinh doanh

| Dòng | Tiêu đề | Nội dung yêu cầu (đã chốt) | Nơi phản ánh |
|---|---|---|---|
| 76 | Dữ liệu dùng cho đề xuất đặt hàng bằng AI | Đề xuất đặt hàng bằng AI đề xuất số lượng dựa trên thực tế đơn hàng của doanh nghiệp trong quá khứ・tỷ lệ hủy bỏ・tồn kho. | Order-Spec §2・§6・§8-C4／RD-AP-141 |
| 78 | Xác định phụ thu giao hàng theo khu vực | Phụ thu giao hàng theo khu vực do Vận hành nhập tay vào master nơi giao hàng ủy thác (không tự động tính). | Master nơi giao hàng ủy thác／Master gói |
| 86 | Quản lý mẫu (hướng tới nhà máy) | Phase2 chỉ quản lý mẫu kinh doanh. Mẫu đặc biệt của nhà máy・liên kết với sản xuất sẽ xử lý ở phần định nghĩa yêu cầu trong tương lai. | Tổng hợp đặc tả mẫu |
| 87 | Phương châm thiết kế tổng thể (hướng tới sản xuất của nhà máy) | Thiết kế tổng thể bao gồm sản xuất của nhà máy là ngoài đối tượng (Phase3 trở đi) và Close. | — |
| 93 | Dữ liệu doanh thu (danh sách thanh toán＋CSV) | Để phân tích doanh thu, từ danh sách thanh toán có thể xuất CSV gồm doanh thu・số doanh nghiệp hợp đồng・số cơ sở hợp đồng・số tháng liên tục・nhân viên kinh doanh phụ trách・loại hợp đồng・đơn giá (không hiển thị trong danh sách trên màn hình). | Định nghĩa mục CSV thanh toán／Demo 15 |
| 95 | Nhập khi phóng to cỡ chữ | Form đăng ký có thể nhập được ngay cả khi đổi cỡ chữ của trình duyệt・zoom 200% (yêu cầu phi chức năng・góc nhìn kiểm thử). | Form đăng ký doanh nghiệp_Sắp xếp_v2 |
| 99 | Chỉ thị trả mẫu thừa về ES | Phần thừa sau khi chốt mẫu thì ra chỉ thị trả về ES ở màn hình chỉ thị xuất hàng trả lại tồn kho (REQ-PO-603) (kế thừa vận hành hiện hành). | Tổng hợp đặc tả mẫu §1-6 |
| 156 | Đăng ký lắp đặt hộ tủ lạnh | Doanh nghiệp có thể chọn lắp đặt hộ tủ lạnh (OP000007) ở cả đăng ký mới và yêu cầu thay đổi. Ghi vào chi tiết thanh toán dưới dạng phí một lần. | Form đăng ký doanh nghiệp_Sắp xếp_v2／Demo 21／RD-PM-076・RD-BL-071 |

### Kế toán

| Dòng | Tiêu đề | Nội dung yêu cầu (đã chốt) | Nơi phản ánh |
|---|---|---|---|
| 112 | Hóa đơn (lọc・ngày phát hành・thay thế) | Hóa đơn lấy tổng hợp đặc tả §14-4 làm chuẩn (ngày 25 xác nhận → phát hành cuối tháng, nếu hạn thanh toán khác nhau thì 2 hóa đơn). Thêm bộ lọc phương thức thanh toán vào danh sách hóa đơn. | Tổng hợp §14-4／Sửa cùng danh sách mục §0.9・REQ-CT-242 |
| 151 | Phản ánh thủ công việc sửa đổi giá | Việc sửa đổi giá có thể lọc hợp đồng con theo thế hệ gói giá・course đối tượng, chỉ định chu kỳ bắt đầu áp dụng và chuyển hàng loạt sang thế hệ mới. Thông báo trước thực hiện thủ công bằng gửi thông báo. | Danh sách mục／Quyết định_v2.3 bổ sung_Master gói／REQ-PM-023 |

### Picking

| Dòng | Tiêu đề | Nội dung yêu cầu (đã chốt) | Nơi phản ánh |
|---|---|---|---|
| 124 | Tổng hợp số lượng giao vật tư | Ở danh sách dữ liệu giao vật tư, hiển thị số lượng theo từng ngày dự kiến gửi, tổng hợp theo chuyến giao thực phẩm của cơ sở (chuyến COOL／chuyến ES giao). | Tổng hợp §10-9・DEV |
| 135 | Chỉ định thời gian của hàng thay thế | Hàng thay thế có thể thiết lập bằng cách chỉ định thời gian đối tượng (phần gửi từ ngày bắt đầu〜ngày kết thúc). | Đặc tả yêu cầu chi tiết xử lý hàng thay thế／RD-MN-151・REQ-ALT-502 |

## 5 mục bổ sung (chưa phản ánh・phần cập nhật 9/30)

| Dòng | Tiêu đề | Nội dung yêu cầu (đã chốt) | Nơi phản ánh |
|---|---|---|---|
| 107 | Hiển thị số năm hợp đồng | Hiển thị "Tháng năm bắt đầu hợp đồng" và "Thời gian liên tục (ví dụ: 5 năm 3 tháng)" trong danh sách cơ sở. Cơ sở giữ "Ngày bắt đầu hợp đồng ban đầu", khi chuyển dữ liệu thì nhập ngày bắt đầu hợp đồng của ES cũ vào đây, thời gian liên tục tính từ ngày này (không đặt lại khi đổi gói・chuyển đổi). | Danh sách mục doanh nghiệp・cơ sở・hợp đồng・hợp đồng con (cột của cơ sở・danh sách cơ sở)／Đặc tả chuyển dữ liệu (khớp với 28-175)／Demo 12 |
| 161 | ID người dùng của ES cũ | Cơ sở giữ "ID người dùng ES cũ" (ví dụ: ES000001). Nhập khi chuyển đổi, trên màn hình chỉ tham chiếu. Tìm kiếm được trong danh sách cơ sở, có trong xuất CSV. Nhãn hiển thị phải là "ID người dùng ES cũ", để phân biệt với ID gói mới. | Danh sách mục doanh nghiệp・cơ sở・hợp đồng・hợp đồng con (cơ sở)／Đặc tả chuyển dữ liệu／Demo 12 |
| 162 | Tìm kiếm khách hàng bằng mã bưu điện・số điện thoại | Thêm mã bưu điện・số điện thoại・quận huyện (khớp một phần) vào điều kiện tìm kiếm của danh sách cơ sở, thêm mã bưu điện・số điện thoại vào điều kiện tìm kiếm của danh sách doanh nghiệp. | Danh sách mục doanh nghiệp・cơ sở・hợp đồng・hợp đồng con (điều kiện tìm kiếm của danh sách doanh nghiệp・danh sách cơ sở)／Demo 12 |
| 182 | Lấy ngày giao hàng làm điểm xuất phát của gửi mẫu | Gửi mẫu nhập ngày giao hàng, tính ngược từ lead time để ra ngày gửi. Nếu ngày gửi tính ngược rơi vào ngày không thể picking thì dời sớm lên ngày có thể picking ngay trước đó, không đổi ngày giao hàng. | Tổng hợp đặc tả mẫu |
| 186 | Ghi chú khi thanh toán (chỉ nội bộ) | Hợp đồng gốc giữ "Ghi chú khi thanh toán (nội bộ)". Cũng hiển thị・chỉnh sửa được ở màn hình thanh toán, không hiển thị trên Web doanh nghiệp. Ô "ghi chú nội bộ không phản ánh lên hóa đơn" của dòng 150 cũng được đảm nhiệm bằng mục này. | Danh sách mục doanh nghiệp・cơ sở・hợp đồng・hợp đồng con (hợp đồng gốc)／Màn hình thanh toán (demo 15) |


## Tình trạng phản ánh vào đặc tả (2026/09/30)

| Nơi phản ánh | Nội dung |
|---|---|
| `01_仕様/10_Giao_hàng/統合仕様書_v2.3`・`DEV仕様書_VI_v2.3` | Dòng 26・28・29・37・39・41・44・49・53・57・78・124・134・142・159・164 (danh sách ở tổng hợp §0-2L) |
| `01_仕様/20_Doanh_nghiệp_Cơ_sở_Hợp_đồng/Doanh_nghiệp_Cơ_sở_Hợp_đồng_Hợp_đồng_con_Danh_sách_mục` (tự sinh) | Dòng 107・157・161・162・186 |
| `01_仕様/40_Master_Phí_Thanh_toán/マスタ項目一覧` (tự sinh) | Dòng 156・174 |
| `01_仕様/20_Doanh_nghiệp_Cơ_sở_Hợp_đồng/法人Web_拠点管理_画面仕様`・`Form_đăng_ký_doanh_nghiệp_Sắp_xếp_v2` | Dòng 95・107・156・157・168 |
| `01_仕様/50_Đơn_hàng/Order-Spec-for-AI-Team` | Dòng 32・76・129・130・170・173 |
| `議事録/仕様/` (đặt hàng・mẫu・hàng thay thế・hợp đồng・picking・tổng hợp định nghĩa yêu cầu・master gói) | Ghi "sửa đổi 2026/09/30" và lịch sử thay đổi vào từng REQ／RD |
| Demo | 10_Vận hành_tổng hợp・thành phần/12・thành phần/14 (v1.30) |

Chưa phản ánh: dòng 27・188 (bảo lưu), ngày phát hành・số bản của dòng 112 (đang xác nhận lại). `申込区分別_申請詳細画面_仕様書_v1` cũ nằm trong 99_過去 nên ngoài đối tượng.


## Trả lời bổ sung (xác nhận sau khi phản ánh 2026/09/30)

| Hạng mục | hong trả lời | Nơi phản ánh |
|---|---|---|
| Dòng 165 Phí lưu kho khi tạm dừng | Không thu (khi tạm dừng không tạo hợp đồng con・dù để nguyên thiết bị cũng không có phí lưu kho) | Thêm ghi chú xác nhận lại vào quyết định 28-1a (phí lưu kho・phí hàng tháng khi tạm dừng trong đặc tả chi tiết đơn đăng ký cũ chỉ có ở tài liệu cũ trong 99_過去) |
| Tỷ lệ đông lạnh 30% (bản nháp của quyết định 28-14) | Không dùng tỷ lệ mà dùng số lượng theo gói (số lượng cung cấp hàng tháng đông lạnh của master gói) | Ghi chú vào quyết định 28-14・quyết định v2.3 "tỷ lệ đông lạnh"／Danh sách mục master (giới hạn trên_số lượng cung cấp hàng tháng đông lạnh)／giải quyết OPEN "quy tắc giới hạn dưới của đơn hàng" trong danh sách mục／Đặt hàng・nhập mua・nhập kho REQ-PO-408／Tóm tắt quản lý tồn kho |
| Chọn tháng bắt đầu khi đăng ký (REQ-CT-225) và liên động hạn chót | Kiểm soát tháng có thể chọn: đăng ký trước hạn chót chỉ chọn được từ tháng sau trở đi, đăng ký sau hạn chót chỉ chọn được từ tháng sau nữa trở đi | Hợp đồng REQ-CT-225・Tổng hợp định nghĩa yêu cầu RD-CT-053 (vào quyết định)・Form đăng ký doanh nghiệp #14・Danh sách mục "tháng chu kỳ bắt đầu" |
