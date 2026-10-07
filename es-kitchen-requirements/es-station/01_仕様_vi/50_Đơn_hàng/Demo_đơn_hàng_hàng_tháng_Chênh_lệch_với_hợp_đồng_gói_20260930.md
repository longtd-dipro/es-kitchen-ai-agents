> **Đóng băng (bản gốc・05/10/2026). Từ nay không cập nhật nữa.** Nguồn chuẩn của đơn hàng là `docs/01_仕様/50_Đơn_hàng/Đơn_hàng.md`, các quyết định đang có hiệu lực hiện nay là `docs/決定台帳.md` (H・F). Đây là bản ghi chênh lệch so với bản demo (HTML) cũ, không phải là nội dung của ứng dụng hiện tại.

# Chênh lệch giữa demo đơn hàng hằng tháng và đặc tả gói・hợp đồng (30/09/2026)

> hong: "Màn hình đặt hàng đính kèm hơi cũ, đặc tả gói và đặc tả hợp đồng hơi khác".
> Đối tượng: `02_デモ/部品/23_法人_月次注文.html` (v1.25). Tài liệu đối chiếu: `Quyết_định_v2.3_Bổ_sung_Master_Gói_20260929.md` (28-147〜186), `Quyết_định_Master_tủ_lạnh_và_cấu_hình_theo_gói_20260929.md`, danh sách hạng mục `items.py` (thiết lập tuyến giao hàng của hợp đồng con・giới hạn số lượng cung cấp hằng tháng), demo master gói (mẫu gói 100).
> Sau khi hong trả lời ngày 30/09/2026, **đã phản ánh toàn bộ vào demo v1.26** (xem "Tình trạng phản ánh" bên dưới). Mức ưu tiên: Cao = phán đoán số lượng・khả năng đăng ký bị lệch／Trung bình = cách ghi・nguồn gốc khác／Thấp = chỉ là vấn đề của demo.

## A. Lệch so với đặc tả gói

| # | Ưu tiên | Demo hiện tại | Đúng (đặc tả) | Cách sửa (đề xuất) |
|---|---|---|---|---|
| P1 | Cao | Giới hạn trên của đồ đông lạnh ＝ **30% số gói** (gói 100 thì 30 cái) | Không giữ tỷ lệ đồ đông lạnh (28-155). Phán đoán bằng **giới hạn trên・dưới của số lượng cung cấp hằng tháng theo từng nhóm nhiệt độ**. Gói 100 ES Standard ＝ đông lạnh giới hạn trên 20・dưới 1／lạnh・nhiệt độ thường giới hạn trên 80・dưới 0 | Đổi phán đoán thành "theo từng nhóm nhiệt độ, giới hạn dưới ≦ số lượng ≦ giới hạn trên". Giới hạn trên・dưới lấy từ giá trị đã cố định ở hợp đồng con (snapshot giới hạn số lượng cung cấp hằng tháng) |
| P2 | Cao | Đồ đông lạnh **1 lần (1 chuyến đông lạnh)** | Số lần giao hàng tiêu chuẩn theo từng nhóm nhiệt độ (28-154). Đồ đông lạnh của gói 100 là **2 lần** (đặt tạm・chưa nhận bảng đồ đông lạnh). Số lượng giao mỗi lần: đông lạnh 10・lạnh 40 | Số chuyến đông lạnh cũng lấy từ hợp đồng (C1 bên dưới) |
| P3 | Cao | Trụ sở chính (ES Standard ＋ máy bán hàng tự động) hiển thị "khung máy bán hàng tự động" | Máy bán hàng tự động là **course riêng "ES Light (máy bán hàng tự động)"** (28-184). Đặt máy bán hàng tự động thay cho tủ lạnh・chỉ đồ lạnh・cố định chuyến giao ES (28-185) | Hiển thị theo khung chỉ **cho cơ sở có course = ES Light (máy bán hàng tự động)**. Trụ sở chính dùng màn hình ES Standard thông thường |
| P4 | Trung bình | Cơ sở máy bán hàng tự động cũng có khung "Sản phẩm không cho vào máy bán hàng tự động (giao bằng tủ lạnh)" | ES Light (máy bán hàng tự động) không có tủ lạnh (thiết bị cho thuê tiêu chuẩn là máy bán hàng tự động ＋ hộp vật tư) | Hoặc không hiển thị／hoặc không cho đặt các sản phẩm không cho vào máy bán hàng tự động (cần xác nhận Q2) |
| P5 | Trung bình | Tên course "ES Light" | Có 2 loại ES Light (tủ lạnh)／ES Light (máy bán hàng tự động) | Sửa cách ghi |
| P6 | Trung bình | Cách ghi gói "Gói 100 ES Standard" | Toàn bộ demo ghi "ES000004 Gói 100 (ES Standard)" (v1.21) | Thống nhất cùng dạng |
| P7 | Trung bình | Đơn hàng mặc định (số lượng cơ sở) ＝ chia đều cho mọi sản phẩm | Số lượng tiêu chuẩn của vận hành (trên mỗi 50 cái cơ bản) × **tỷ lệ cơ bản × lần** (gói 100 ＝ 2 lần) tự động phản ánh vào số lượng tiêu chuẩn của doanh nghiệp (28-179) | Tạo số lượng đơn hàng mặc định bằng "số lượng tiêu chuẩn × bội số", và hiển thị nội dung đó trên màn hình |
| P8 | Thấp | Tên course của vật tư "Light・Standard" | Có 3 loại course. Hộp vật tư của ES Light (máy bán hàng tự động) là bộ giống ES Light (tủ lạnh) (28-184). Số lượng của bộ vật tư ban đầu là master vật tư × gói (28-129) | Sửa cách ghi thành 3 course |

## B. Lệch so với đặc tả hợp đồng

| # | Ưu tiên | Demo hiện tại | Đúng (đặc tả) | Cách sửa (đề xuất) |
|---|---|---|---|---|
| C1 | Cao | Số chuyến・ngày được ấn định cứng trong demo (trụ sở chính: lạnh 2・đông lạnh 1, Osaka: 06/11・20/11) | Số lần giao hàng và chu kỳ giao hàng (các khung A1〜D7) do **thiết lập tuyến giao hàng của hợp đồng con** (theo giao hàng lạnh・giao hàng đông lạnh) nắm giữ. Nếu nhiều hơn tiêu chuẩn thì thêm số lần giao hàng (OP000001) | Số chuyến・ngày lấy từ **hợp đồng con của tháng đó (ví dụ: CP0000001-202611)**. Ngày thống nhất với lịch của demo giao hàng (chi nhánh Osaka: 25 bữa mỗi lần・2 lần mỗi tháng) |
| C2 | Cao | Giữ giới hạn trên・dưới ngay trong demo | Khi tạo hợp đồng con thì cố định giá trị của master gói (snapshot giới hạn số lượng cung cấp hằng tháng). Dù sau đó thay đổi master gói thì hợp đồng con đã tạo cũng không đổi | Lấy hợp đồng con làm nguồn phán đoán. Hiển thị trên màn hình "Hợp đồng chu kỳ tháng 11: Gói 100 (ES Standard) lạnh 2 lần・đông lạnh 2 lần" |
| C3 | Trung bình | Quan hệ với hợp đồng con của tháng đối tượng không hiển thị trên màn hình | 1 chu kỳ ＝ 1 hợp đồng con (phương án A). Đổi gói・tạm dừng có hiệu lực lên hợp đồng con theo đơn vị chu kỳ | Nếu chu kỳ đối tượng đã được phê duyệt đổi gói thì cho đặt hàng theo điều kiện của hợp đồng con sau khi thay đổi. Chu kỳ tạm dừng thì không có đơn hàng (trụ sở chính tạm dừng chu kỳ tháng 12〜tháng 2) |
| C4 | Trung bình | Trong màn hình AI có "Số lượng khi bắt đầu đặt hàng (từ lần sau)" | Chế độ AI (khi không có đơn hàng đến hạn chót thì nhập số lượng bằng AI) là **ON／OFF theo từng cơ sở (hợp đồng)** (19/09/2026) | Bỏ khỏi màn hình AI, chỉ hiển thị tham chiếu như một thiết lập của hợp đồng (nơi nắm giữ cần xác nhận Q4) |

## C. Các điểm cần xác nhận của bản thân đặc tả

| # | Nội dung |
|---|---|
| Q1 | **Tổng giới hạn trên của gói 100 ＝ tổng giới hạn cung cấp hằng tháng (28-178 ①), nên khi đông lạnh 20・lạnh 80 thì đơn hàng chắc chắn là đông lạnh 20／lạnh 80** (dù đặt giới hạn dưới cũng không có chỗ để thay đổi). Khách hàng có thể thay đổi việc phân bổ giữa đông lạnh và lạnh hay là cố định |
| Q2 | Ở cơ sở ES Light (máy bán hàng tự động), có đặt được các sản phẩm không vào được máy bán hàng tự động (cơm hộp, v.v.) hay không |
| Q3 | Chênh lệch số lượng giữa các chuyến trong vòng ±1 (24/07/2026). Phán đoán theo từng nhóm nhiệt độ (đông lạnh 2 lần thì 10／10) có được không |
| Q4 | Nắm giữ ON／OFF của chế độ AI ở đâu (hợp đồng con／cơ sở). Có thay đổi được trên Web doanh nghiệp không |

## Trả lời (hong 30/09/2026) và tình trạng phản ánh (demo v1.26)

| # | Trả lời | Phản ánh |
|---|---|---|
| Q1 Phân bổ đông lạnh và lạnh | **Tự do trong phạm vi giới hạn trên・dưới** | Đã đổi phán đoán thành giới hạn dưới〜giới hạn trên theo từng nhóm nhiệt độ. **Tuy nhiên, nếu giữ nguyên giá trị master gói hiện tại (đông lạnh giới hạn trên 20 ＋ lạnh・nhiệt độ thường giới hạn trên 80 ＝ tổng 100) và kiểm tra khi lưu 28-178① (tổng giới hạn trên ＝ tổng), thì với tổng 100 chắc chắn là đông lạnh 20／lạnh 80.** Để tự do thì cần đổi 28-178① thành "tổng giới hạn trên ≧ tổng giới hạn cung cấp hằng tháng" và nới rộng giới hạn trên (ví dụ: lạnh・nhiệt độ thường giới hạn trên 99) 【Cần xác nhận・demo master gói chưa thay đổi】 |
| Ví dụ máy bán hàng tự động | **Thêm 1 cơ sở** | Văn phòng Yokohama (CU00950・ES000004 Gói 100 ES Light (máy bán hàng tự động)・chuyến giao ES・lạnh 2 lần A2・C2・máy bán hàng tự động VM000001・chế độ AI ON). **Chỉ có trong demo đơn hàng hằng tháng** (chưa có trong demo quản lý cơ sở・giao hàng・vận hành) |
| Q2 Sản phẩm không vào máy bán hàng tự động | **Hiển thị** | Có thể đặt ở khung "Sản phẩm không vào máy bán hàng tự động". Cách nhận hàng (không có tủ lạnh) vẫn là 【Cần xác nhận】 |
| Phản ánh | **Toàn bộ** | Đã phản ánh toàn bộ P1〜P8・C1〜C4. Trụ sở chính: lạnh 2 lần・đông lạnh 2 lần (A3・C3 ＝ 11/11・25/11), chi nhánh Osaka: 10/11・24/11 (giống demo giao hàng), chu kỳ tháng 11 A1 ＝ 9/11 |

**Còn lại**: Thay đổi phía master gói của Q1 (28-178①)／cách nhận sản phẩm không vào máy bán hàng tự động／nơi nắm giữ chế độ AI (Q4)／có thêm Văn phòng Yokohama vào các demo khác hay không.
