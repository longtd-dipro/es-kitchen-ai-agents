> **Đã đóng băng (bản gốc・2026-10-05). Từ nay không cập nhật.** Quyết định hiện đang có hiệu lực nằm ở `docs/決定台帳.md`. Nơi chuyển đến của nội dung file này và các quyết định đã bị thay thế, xem mục "G" của sổ cái.

# Quyết định v2.3 bổ sung (2026/09/29) ― Các mục thêm vào Master gói, số tiền doanh nghiệp chịu và thuế suất

Trong quá trình định nghĩa các màn hình・Master khác, đã xuất hiện "các giá trị không quyết định được nếu Master gói không giữ", nên gom về một chỗ.
**Đây là nơi sở hữu quyết định.** Phiên bản vẫn là v2.3 với tên "bổ sung 2026/09/29", đánh số tiếp từ 28-147.

- Nguyên nhân: hong trả lời 2026/09/29 (số tiền doanh nghiệp chịu・thuế suất・số tiền miễn trách・số lượng giao hàng mỗi lần). Bổ sung cùng ngày: số lần giao hàng tiêu chuẩn theo dải nhiệt độ (28-154), bỏ tỷ lệ đông lạnh・không bù trừ・bảng tủ đông (28-155〜157)
- Khi tài liệu mâu thuẫn thì "lấy ngày mới, giữ cái cũ trong ngoặc". Cái chưa quyết định ghi "cần xác nhận", cái đặt tạm ghi "tạm thời"
- ~~Demo Master gói không làm lúc này như 28-128~~ → **Đã đưa vào demo theo quyết định 28-176 ngày 2026/09/30** (§8)

---

## 1. Những điều đã quyết định theo hong trả lời

| # | Mục | Quyết định |
|---|---|---|
| 28-147 | Chủ sở hữu số tiền doanh nghiệp chịu | **Master gói giữ.** Thông thường cố định **100 yên (đã gồm thuế)／1 bữa**. Được xử lý là số tiền đã nằm trong phí gói (không thanh toán thêm・như 28-134) |
| 28-148 | Tự động tính phí cơ bản | Thứ nhập vào là **phí gói (chưa gồm thuế)**. Hệ thống tự động tính **phí cơ bản (chưa gồm thuế) = phí gói (chưa gồm thuế) − phần doanh nghiệp chịu (chưa gồm thuế)**. Phần doanh nghiệp chịu (đã gồm thuế) = số tiền doanh nghiệp chịu (đã gồm thuế・1 bữa) × **tổng giới hạn cung cấp hàng tháng** |
| 28-149 | Thuế suất | **Phần doanh nghiệp chịu (tiền ăn) = 8% (thuế suất giảm), phí cơ bản = 10% (thuế suất tiêu chuẩn).** Vì thuế suất có thể tiếp tục tăng nên **chọn từ Master thuế suất (lựa chọn dropdown)**. Phần chưa gồm thuế của phần doanh nghiệp chịu được tính ngược từ giá đã gồm thuế bằng thuế suất đã chọn |
| 28-150 | Áp dụng phúc lợi | Khi bật **ON** "**Áp dụng phúc lợi**" của hợp đồng, hóa đơn chia phí gói thành **2 dòng (phí cơ bản／phúc lợi (phần doanh nghiệp chịu))**. Khi **OFF** thì gộp thành 1 dòng. **Ở cả hai trường hợp, thuế tiêu dùng đều tính theo 2 thuế suất, và cả hai đều xuất hiện trong chi tiết theo thuế suất của hóa đơn** (số tiền tổng không đổi giữa ON và OFF) |
| 28-151 | Số tiền miễn trách | **Master gói giữ.** "**Số tiền diện tích**" (REQ-PM-034／REQ-CT-206) trong biên bản・yêu cầu là **nghe nhầm của số tiền miễn trách** (cả hai đều đọc là "menseki"). Số tiền miễn trách = phạm vi cho phép của chênh lệch tồn kho (hao hụt quản lý) (REQ-PM-007. Ví dụ: gói 100 là 300 yên). Không tạo mục riêng "số tiền diện tích" |
| 28-152 | Tỷ lệ sắp hết | **Master gói giữ** (theo gói・course. REQ-PM-009／010／036). Ngưỡng = làm tròn xuống (số đơn hàng thực tế của cơ sở × tỷ lệ sắp hết) |
| 28-153 | Số lượng giao hàng mỗi lần | Tính bằng **giới hạn cung cấp hàng tháng ÷ số lần giao hàng** (không thêm ô, là tham chiếu của tự động tính). "Số bữa ES" trong đánh giá dung lượng (⑬) chỉ giá trị này. **(Bổ sung 2026/09/29・theo dải nhiệt độ theo 28-154)** Tủ lạnh = giới hạn số lượng cung cấp hàng tháng của lạnh・nhiệt độ thường ÷ số lần giao hàng tiêu chuẩn của lạnh, tủ đông = giới hạn số lượng cung cấp hàng tháng của đông lạnh ÷ số lần giao hàng tiêu chuẩn của đông lạnh. (Cũ: tổng ÷ số lần giao hàng, tủ đông là × tỷ lệ đông lạnh) |
| 28-154 | Số lần giao hàng tiêu chuẩn theo dải nhiệt độ | **Theo cấu hình tuyến giao hàng của hợp đồng (số lần giao hàng theo loại giao hàng), Master gói cũng giữ số lần giao hàng tiêu chuẩn theo dải nhiệt độ.** Tab ES Standard = 2 tab lạnh・nhiệt độ thường／đông lạnh, tab ES Lite = chỉ lạnh・nhiệt độ thường (cách đặt giống giới hạn trên・dưới của số lượng cung cấp hàng tháng). Vật tư là giao hàng theo từng lần nên không giữ. Thêm số lần giao hàng (OP000001) đếm phần vượt "số lần giao hàng của hợp đồng − số lần giao hàng tiêu chuẩn" **theo từng dải nhiệt độ** rồi cộng thêm (thay thế "so sánh theo tổng" của 28-85) |
| 28-155 | Không giữ tỷ lệ đông lạnh | **Bỏ "tỷ lệ đông lạnh" của Master gói.** Đánh giá dung lượng tủ đông được thực hiện bằng giới hạn số lượng cung cấp hàng tháng của đông lạnh ÷ số lần giao hàng tiêu chuẩn của đông lạnh (28-153・28-154). "Đông lạnh tối đa 30% của toàn bộ gói" được biểu thị bằng giá trị giới hạn của đông lạnh. Thay thế "số bữa ES × tỷ lệ đông lạnh (mặc định 30%)" của ⑫-5 C・28-14 (đóng mục cần xác nhận ⑨) |
| 28-156 | Không bù trừ dải nhiệt độ・không giữ số lần giao hàng 0 | Thêm số lần giao hàng (OP000001) đếm phần vượt theo từng dải nhiệt độ, **không bù trừ ở dải nhiệt độ còn thiếu** (đóng mục cần xác nhận ⑩). **Không cho phép số lần giao hàng 0 làm dữ liệu**: giao hàng lạnh bắt buộc từ 1 lần trở lên, ES Standard cũng giao hàng đông lạnh từ 1 lần trở lên (nếu không nhận đông lạnh thì là ES Lite) |
| 28-157 | Bảng tủ đông | Bảng tủ đông chưa nhận được, nhưng giữ theo **cùng tiền đề với tủ lạnh** (số lần giao hàng tiêu chuẩn theo dải nhiệt độ・dạng thiết bị cho mượn tiêu chuẩn của Master gói). Giá trị sẽ nhập sau khi nhận tài liệu (mục cần xác nhận ⑪ chỉ còn giá trị) |

## 2. Các mục thêm vào Master gói (tổng hợp)

Là các mục không có trong Master gói hiện tại (thiết lập gói／tab ES Standard・ES Lite: giới hạn trên・dưới số lượng cung cấp hàng tháng, bảng gói giá).

| # | Tên mục | Tên vật lý (đề xuất) | Kiểu | Nhập | Bắt buộc | Đơn vị giữ | Nội dung | Nơi dùng | Căn cứ |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Số tiền doanh nghiệp chịu (đã gồm thuế・1 bữa) | `plan.subsidy_per_meal` | integer | Nhập | ○ | Gói | Mặc định 100. Yên・đã gồm thuế | Tự động tính phí cơ bản, áp dụng phúc lợi của hợp đồng con, hiển thị 2 dòng của hóa đơn | 28-147 |
| 2 | Thuế suất của phần doanh nghiệp chịu | `plan.subsidy_tax_rate_id` | bigint (FK Master thuế suất) | Nhập | ○ | Gói | Mặc định thuế suất giảm 8% | Tính ngược phần chưa gồm thuế của phần doanh nghiệp chịu, chi tiết theo thuế suất của hóa đơn | 28-149 |
| 3 | Thuế suất của phí cơ bản | `plan.base_tax_rate_id` | bigint (FK Master thuế suất) | Nhập | ○ | Gói | Mặc định thuế suất tiêu chuẩn 10% | Chi tiết theo thuế suất của hóa đơn | 28-149 |
| 4 | Phần doanh nghiệp chịu (chưa gồm thuế・tự động tính) | `plan_price.subsidy_amount` | integer | Tham chiếu | ○ | Dòng của bảng gói giá × chuyến giao hàng | Số tiền doanh nghiệp chịu × tổng giới hạn cung cấp hàng tháng ÷ (1 + thuế suất của phần doanh nghiệp chịu) | Dòng khoản mục của hợp đồng con ①, hóa đơn | 28-148 |
| 5 | Phí cơ bản (chưa gồm thuế・tự động tính) | `plan_price.base_amount` | integer | Tham chiếu | ○ | Dòng của bảng gói giá × chuyến giao hàng | Giá (chưa gồm thuế) − phần doanh nghiệp chịu (chưa gồm thuế). **Không thể lưu giá mà kết quả nhỏ hơn 0 yên** | Dòng khoản mục của hợp đồng con ①, hóa đơn | 28-148 |
| 6 | Số tiền miễn trách | `plan.deductible_yen` | integer | Nhập | ○ | Gói (có chia theo course hay không cần xác nhận) | Phạm vi cho phép của chênh lệch tồn kho (hao hụt quản lý). Yên. Ví dụ: gói 100 là 300 | Hợp đồng con "điều kiện kế thừa từ gói", hao hụt quản lý của thanh toán thực tích (vượt miễn trách) | 28-151 |
| 7 | Tỷ lệ sắp hết (%) | `plan_course.low_stock_rate` | numeric(5,2) | Nhập | ○ | Gói × course | Ví dụ: 25 | Badge "sắp hết" của ứng dụng cá nhân | 28-152 |
| 8 | Số lần giao hàng tiêu chuẩn (theo dải nhiệt độ) | `plan_course.std_delivery_chilled` ／ `plan_course.std_delivery_frozen` | smallint | Nhập | ○ | Gói × course × dải nhiệt độ (Standard = lạnh・nhiệt độ thường và đông lạnh, Lite = chỉ lạnh・nhiệt độ thường) | Số lần mỗi tháng. **Khác nhau theo từng gói**. Lạnh theo bảng của `Quyết_định_Master_tủ_lạnh_và_cấu_hình_theo_gói_20260929.md` (ES50 = 1／ES100〜600 = 2／ES650 trở lên = 4). Giá trị đông lạnh chưa nhận | Số lượng giao hàng mỗi lần (theo dải nhiệt độ), đánh giá vượt của thêm số lần giao hàng (OP000001) (theo dải nhiệt độ), giá trị ban đầu của số lần giao hàng khi đăng ký・tiếp nhận | 28-154・28-85・`Quyết_định_v2.3_Bổ_sung_Form_đăng_ký_và_Master_20260929.md` #3・#5 |
| 9 | Số lượng giao hàng mỗi lần (tự động tính・theo dải nhiệt độ) | `—（算出）` | — | Tham chiếu | — | Gói × course × dải nhiệt độ | Giới hạn số lượng cung cấp hàng tháng của dải nhiệt độ ÷ số lần giao hàng tiêu chuẩn của dải nhiệt độ (làm tròn lên) | Đánh giá dung lượng của form đăng ký doanh nghiệp・di chuyển thiết bị (tủ lạnh dùng giá trị lạnh, tủ đông dùng giá trị đông lạnh) | 28-153・28-154 |
| 10 | ~~Tỷ lệ đông lạnh (%)~~ | `plan.frozen_ratio` | numeric(5,2) | Nhập | ○ | Gói | Mặc định 30. **Vì 28-154 cho phép tính số lượng giao hàng mỗi lần của đông lạnh từ giới hạn đông lạnh và số lần giao hàng đông lạnh nên không dùng cho đánh giá dung lượng.** Bỏ (không giữ) theo quyết định 28-155 ngày 2026/09/29 **(cũ: có bỏ hay không là mục cần xác nhận ⑨)** | (Đánh giá dung lượng tủ đông) | ⑫-5・28-14 |
| 11 | Thiết bị cho mượn tiêu chuẩn | `plan_std_equipment` (bảng con: course・mẫu (tiêu chuẩn／thay thế)・ID dòng máy・số lượng) + cờ "trao đổi để quyết định" | Mảng dòng | Cột bảng | △ | Gói × course | Thiết bị và số lượng có trong gói. Bảng cấu hình ở `Quyết_định_Master_tủ_lạnh_và_cấu_hình_theo_gói_20260929.md` (ví dụ: ES400 = tiêu chuẩn 84L + 142L／thay thế 84L×2, ES600 trở lên là trao đổi). **Miễn phí hay không được đánh giá bằng ngưỡng của Master dòng máy** (⑫B). Chỗ này chỉ giữ dòng máy và số lượng tiêu chuẩn | Form đăng ký doanh nghiệp "thiết bị có trong gói", dòng ban đầu của di chuyển thiết bị khi tiếp nhận, chuẩn của chênh lệch kích thước | Ghi chú ⑫B |

| 12 | Số người sử dụng ước tính (để hiển thị) | `plan.headcount_hint` | varchar(20) | Nhập | △ | Gói | Ví dụ: 7 người／14 người／21 người. Không dùng cho thanh toán・đánh giá | Tổng quan gói・phỏng vấn của form đăng ký doanh nghiệp | `Quyết_định_v2.3_Bổ_sung_Form_đăng_ký_và_Master_20260929.md` #3 |

**Những thứ đã có nên không thêm**: giới hạn trên・dưới của số lượng cung cấp hàng tháng (đông lạnh／lạnh・nhiệt độ thường) và tổng／bảng gói giá (vòng 1〜vòng 4, chuyến COOL・chuyến ES giao hàng)／trạng thái công bố.
**Những thứ Master gói không giữ**: số lượng bộ vật tư ban đầu (Master vật tư × gói・28-129)／tùy chọn của giao hàng・hợp đồng (Master tùy chọn・REQ-PM-021).

## 3. Ví dụ tính toán

**Phí gói (chưa gồm thuế) 49,500 yên・tổng giới hạn cung cấp hàng tháng 200 bữa・số tiền doanh nghiệp chịu 100 yên (đã gồm thuế)・8%／10%**

| Dòng | Tính toán | Chưa gồm thuế | Thuế suất | Thuế tiêu dùng |
|---|---|---|---|---|
| Phần doanh nghiệp chịu (phúc lợi) | 100 × 200 = 20,000 (đã gồm thuế) ÷ 1.08 = 18,518.5… → **18,518** | 18,518 | 8% | 1,481 |
| Phí cơ bản | 49,500 − 18,518 | **30,982** | 10% | 3,098 |
| Tổng | | 49,500 | | 4,579 |

- **Áp dụng phúc lợi ON**: Hóa đơn có 2 dòng "ES Standard 100 Phí cơ bản 30,982 yên (10%)" "ES Standard 100 Phúc lợi (phần doanh nghiệp chịu) 18,518 yên (8%)".
- **Áp dụng phúc lợi OFF**: Hóa đơn có 1 dòng "ES Standard 100 49,500 yên". Chi tiết theo thuế suất vẫn là đối tượng 8% 18,518 yên／đối tượng 10% 30,982 yên.
- Phần lẻ là【tạm thời】: tính ngược thì cộng tổng rồi làm tròn xuống dưới 1 yên, thuế tiêu dùng làm tròn xuống theo từng hóa đơn・từng thuế suất (đặt tạm hiện có). Trong trường hợp này, phần doanh nghiệp chịu đã gồm thuế thành 19,999 yên, lệch 1 yên so với 20,000 yên (cần xác nhận ① bên dưới).

**Số lượng giao hàng mỗi lần (theo dải nhiệt độ・28-154)**: Ví dụ ES Standard 100, giới hạn lạnh・nhiệt độ thường 70・số lần giao hàng tiêu chuẩn của lạnh 2, giới hạn đông lạnh 30・số lần giao hàng tiêu chuẩn của đông lạnh 1 thì lạnh = 70 ÷ 2 = **35**, đông lạnh = 30 ÷ 1 = **30**. Tủ lạnh chỉ chọn được dòng máy có sức chứa tối đa từ 35 trở lên, tủ đông từ 30 trở lên (số là ví dụ).

**Thêm số lần giao hàng (theo dải nhiệt độ・28-154)**: Hợp đồng lạnh 3 lần・đông lạnh 1 lần, tiêu chuẩn lạnh 2 lần・đông lạnh 1 lần → lạnh vượt 1 lần → OP000001 ×1. Kể cả khi có dải nhiệt độ còn thiếu cũng **không bù trừ** với phần vượt của lạnh (xác định ở 28-156). Ngoài ra, ES Standard không thể giữ đông lạnh 0 lần làm dữ liệu (28-156. Ví dụ cũ "lạnh 3 lần・đông lạnh 0 lần → ×1" bị hủy).

## 4. Cách giữ (dữ liệu)

- **Dòng khoản mục của hợp đồng con ① luôn giữ phí gói thành 2 dòng** (loại nguồn = plan. Phí cơ bản 10%／phần doanh nghiệp chịu 8%). Áp dụng phúc lợi chỉ thay đổi **cách hiển thị trên hóa đơn** (nếu OFF thì in gộp 2 dòng thành 1 dòng). Nhờ vậy, kể cả chuyển đổi ON・OFF thì số tiền và thuế không đổi.
- Khi tạo hợp đồng con, cố định vào hợp đồng con **số tiền doanh nghiệp chịu・2 thuế suất・phí cơ bản・phần doanh nghiệp chịu** của Master gói (snapshot của REQ-CT-248. Thêm vào "điều kiện kế thừa từ gói (tham chiếu)"). Kể cả sau này thay đổi Master gói hay thuế suất thì hợp đồng con đã tạo không đổi.
- Thuế suất của dòng khoản mục (`fee_line.tax_rate`) giữ **giá trị tỷ lệ tại thời điểm tạo** chứ không phải ID của Master thuế suất (vì sửa Master thuế suất cũng không làm thay đổi thanh toán quá khứ).

### Master thuế suất (tạo mới・lựa chọn dropdown)

| Mục | Tên vật lý (đề xuất) | Kiểu | Bắt buộc | Nội dung |
|---|---|---|---|---|
| ID thuế suất | `tax_rate.id` | bigint | ○ | Tự động |
| Tên hiển thị | `tax_rate.name` | varchar(40) | ○ | Ví dụ: Thuế suất tiêu chuẩn 10%／Thuế suất giảm 8% |
| Thuế suất (%) | `tax_rate.rate` | numeric(4,1) | ○ | Ví dụ: 10.0／8.0 |
| Ngày bắt đầu áp dụng | `tax_rate.valid_from` | date | ○ | Có thể chọn ở hợp đồng con・thanh toán được tạo từ ngày này trở đi |
| Ngày kết thúc áp dụng | `tax_rate.valid_to` | date | △ | Để trống = hiện đang có hiệu lực |
| Thứ tự hiển thị | `tax_rate.sort_no` | smallint | △ | Thứ tự của dropdown |
| Trạng thái | `tax_rate.status` | varchar(12) | ○ | Có hiệu lực／Vô hiệu |

Nơi dùng: Master gói (phần doanh nghiệp chịu・phí cơ bản)／Master tùy chọn (đổi sang dạng chọn `option.tax_rate` từ Master thuế suất)／dòng khoản mục của hợp đồng con ①②(cố định giá trị tỷ lệ)／chi tiết theo thuế suất của hóa đơn. Đáp ứng REQ-PM-035 "tham số hóa thuế suất, có thể chỉnh sửa・thay đổi ở màn hình thiết lập gói" theo dạng này.

## 5. Các quyết định・mục hiện có bị thay thế

| Hiện có | Thay đổi |
|---|---|
| Hợp đồng con "số tiền doanh nghiệp chịu (số tiền nhân viên chịu)" (không／50／100／150／200／300 yên・bữa) | **Thay bằng "áp dụng phúc lợi" (ON／OFF).** Số tiền dùng số tiền doanh nghiệp chịu của Master gói, không chọn ở hợp đồng |
| 28-134 "Không dựng dòng riêng ở dòng khoản mục của ① nữa" | **Giữ phí gói thành 2 dòng phí cơ bản và phần doanh nghiệp chịu** (không phải dòng cộng thêm riêng mà là chia phí gói). "Không thanh toán thêm trợ cấp bữa ăn ở thanh toán thực tích" "Bỏ hiển thị số tiền doanh nghiệp chịu và trợ cấp bữa ăn khỏi ②" giữ nguyên |
| 2026/08/07 "Số tiền pháp nhân chịu không đưa vào Master gói, chọn ở màn hình hợp đồng" (tổng hợp đặc tả Master gói) | Theo 28-147, Master gói giữ. Hợp đồng chỉ có ON／OFF của áp dụng phúc lợi |
| REQ-PM-040 "Hiển thị chi tiết phần doanh nghiệp chịu・số tiền nhân viên chịu tạm hoãn cho đến khi xác nhận công thức tính" | Công thức tính và cách hiển thị đã được quyết định ở 28-148・28-150 nên bỏ tạm hoãn |
| REQ-PM-034／REQ-CT-206 "số tiền diện tích" | Hiểu là số tiền miễn trách (28-151) |
| ⑬ "Số dùng cho đánh giá dung lượng = số bữa ES (số lượng giao hàng mỗi lần)" | Tính số lượng giao hàng mỗi lần bằng công thức 28-153 ("số bữa ES × số lần giao hàng 4" đã bị bãi bỏ ở 28-15) |
| `option.tax_rate` của Master tùy chọn (tham số 8%／10%) | Chọn từ Master thuế suất |

## 6. Những điều chưa quyết định

| # | Mục | Nội dung tiến hành tạm thời |
|---|---|---|
| ① | Phần lẻ của phần doanh nghiệp chịu chưa gồm thuế | Cộng tổng rồi làm tròn xuống dưới 1 yên. Phần doanh nghiệp chịu đã gồm thuế có thể lệch 1 yên so với 100 yên × số bữa. Có cho phép lệch hay chỉ giữ phần doanh nghiệp chịu theo giá đã gồm thuế |
| ② | Có thay đổi số tiền doanh nghiệp chịu theo từng hợp đồng không | Không thay đổi (bỏ các lựa chọn 50〜300 yên cũ). Nếu cần ngoại lệ của "thông thường cố định" thì thêm ô ghi đè vào hợp đồng con |
| ③ | Nơi đặt áp dụng phúc lợi | Hợp đồng con (theo từng tháng chu kỳ. Giống thiết lập sử dụng ứng dụng của 28-144. Khi lưu "chỉ hợp đồng con này／tất cả từ hợp đồng con này trở đi") |
| ④ | Số lần giao hàng của số lượng giao hàng mỗi lần | Chia cho **số lần giao hàng tiêu chuẩn (theo dải nhiệt độ)** của Master gói rồi làm tròn lên (vì tại thời điểm chọn thiết bị khi đăng ký thì số lần giao hàng của hợp đồng chưa được quyết định). **Nhìn từ bảng tủ lạnh (ES50 = 1 lần・ES100 = 2 lần, cả hai đều 48L), giới hạn cung cấp hàng tháng chính là con số của gói (ES100 = 100 bữa/tháng), và "số bữa × 4" có khả năng cao là lỗi của demo.** Sau đây là lưu ý cũ: nếu giữ nguyên giá trị demo (tổng giới hạn cung cấp hàng tháng = số bữa × 4, số lần giao hàng tiêu chuẩn = 2 lần/tháng) thì số lượng giao hàng mỗi lần của gói 100 là 400 ÷ 2 = 200, không khớp với "gói 100 = 100 bữa/lần" (cùng sự không khớp với mục cần xác nhận của bổ sung form đăng ký và Master). Sẽ giải quyết khi giá trị thực tế của số lần giao hàng tiêu chuẩn được quyết định |
| ⑤ | Có chia số tiền miễn trách theo course không | Một giá trị cho mỗi gói |
| ⑥ | Master thuế suất | Tạo trong Master dropdown chung hiện có, hay là Master riêng |
| ⑦ | Thuế suất của Master dòng máy | Hiện nay "thiết bị là 10%・không giữ ô thuế suất" (2026/09/25). Có chuyển sang Master thuế suất hay không chưa quyết. Trước mắt giữ nguyên |
| ~~⑨~~ | ~~Tỷ lệ đông lạnh~~ | **→ Quyết định 28-155 ngày 2026/09/29: bỏ.** (Cũ: vì 28-154 nên không dùng cho đánh giá dung lượng tủ đông. Bỏ (khuyến nghị), hay giữ lại cho mục đích khác) |
| ~~⑩~~ | ~~Bù trừ của thêm số lần giao hàng~~ | **→ Quyết định 28-156 ngày 2026/09/29: không bù trừ (xác định). Cũng không giữ số lần giao hàng 0** |
| ⑪ | Giá trị số lần giao hàng tiêu chuẩn của đông lạnh | Nhận cùng với bảng tủ đông (chưa nhận). Cách giữ giống tủ lạnh (28-157). Demo đặt tạm số lần giống lạnh |
| ⑧ | Tên dòng của hóa đơn | Đặt tạm "{tên gói} Phí cơ bản" "{tên gói} Phúc lợi (phần doanh nghiệp chịu)". Câu chữ xác nhận với kinh doanh |

## 7. Tình trạng phản ánh

| Tài liệu | Tình trạng |
|---|---|
| Tài liệu này | Tạo 2026/09/29 |
| `Quyết_định_v2.3_Bổ_sung_Liên_quan_đơn_yêu_cầu_20260928.md` 28-134 | Đã thêm ghi chú thay thế |
| Danh sách mục (`items.py` → Markdown・Excel) | Sửa hợp đồng con "số tiền doanh nghiệp chịu" → "áp dụng phúc lợi", "điều kiện kế thừa từ gói", thuế suất・loại nguồn của dòng khoản mục |
| Danh sách mục Master (thuế suất của Master tùy chọn) | Chưa phản ánh |
| Đặc tả DEV (bản chuẩn của mô hình dữ liệu) | Chưa phản ánh (cột của Master gói・Master thuế suất・2 dòng của dòng khoản mục) |
| Demo (hiển thị 2 dòng của hóa đơn・đánh giá dung lượng của form đăng ký) | Chưa phản ánh |
| Phản ánh 28-154 (bổ sung 2026/09/29) | Đã sửa giải thích của hợp đồng con "số lần giao hàng" trong danh sách mục thành so sánh theo dải nhiệt độ. **Chưa phản ánh**: đặc tả tích hợp §5-1 "số lần giao hàng và tùy chọn"／`Quyết_định_v2.3_Bổ_sung_Form_đăng_ký_và_Master_20260929.md` #3 (chỉ thêm ghi chú)／PLAN_TBL của demo form đăng ký・tiếp nhận (dstd theo dải nhiệt độ)／đặc tả DEV |
| Phản ánh 28-155〜157 (bổ sung 2026/09/29) | Đã phản ánh vào danh sách mục (items.py hợp đồng con "giới hạn số lượng cung cấp hàng tháng" "số lần giao hàng")・danh sách mục Master (sức chứa tối đa của master_items.py／gen_master.py・⑫-5・OPEN 14). **Việc ghi nhận vào tài liệu này bị thiếu do bị ghi đè bởi công việc song song nên đã bổ sung vào tối 2026/09/29** (bản cũ 99_過去/並行作業の整理前_20260929/). Chưa phản ánh: đặc tả DEV／demo đăng ký・tiếp nhận |

## 8. Phản ánh vào demo (quyết định 28-176 ngày 2026/09/30)

hong "Phản ánh Master gói vào demo. Đính kèm màn hình Master gói hiện tại. Các mục cần thêm・mục thiếu cũng phản ánh vào demo". **Hủy 28-128 "không thêm vào quản lý Master của demo tổng hợp lúc này".**

| # | Quyết định | Nội dung |
|---|---|---|
| 28-176 | Đưa Master gói vào demo và danh sách mục Master | Quản lý Master ＞ **Master gói** (danh sách・chi tiết) của demo tích hợp (10_運営_まとめ.html). Màn hình đặt chung trong 13_運営_機種プランマスタ.html. Đã thêm "Chỉnh sửa Master gói" vào danh sách mục Master (md・xlsx) (§0.12). Chồng các ô của màn hình hiện hành (4 ảnh chụp màn hình) là P1 và các ô ở §2 của tài liệu này là P2 mới |

**Cách đặt**
- **Thiết lập gói** (luôn hiển thị phía trên tab như màn hình hiện hành): ID gói／tên gói công khai・quản lý／trạng thái công bố／tổng giới hạn cung cấp hàng tháng／tỷ lệ cơ bản × lần／course (P1) + số người sử dụng ước tính (P2 mới).
- **Chi tiết phí・miễn trách (chung của gói)** (P2 mới): số tiền doanh nghiệp chịu (đã gồm thuế・1 bữa)／thuế suất của phần doanh nghiệp chịu／thuế suất của phí cơ bản (chọn từ Master thuế suất)／phần doanh nghiệp chịu (chưa gồm thuế・tự động tính)／số tiền miễn trách.
- **Tab ES Standard・ES Lite**: giới hạn trên・dưới của số lượng cung cấp hàng tháng và ghi chú (P1) + số lần giao hàng tiêu chuẩn theo dải nhiệt độ・số lượng giao hàng mỗi lần (tự động)・tỷ lệ sắp hết (P2 mới). Đã thêm cột **chi tiết (phí cơ bản／phần doanh nghiệp chịu)** vào bảng gói giá (P1), và cột **chênh lệch nâng cấp Standard** (28-170・28-174) vào bảng ES Lite (cả hai đều tự động tính・không nhập). Bảng **thiết bị cho mượn tiêu chuẩn** (mẫu tiêu chuẩn／thay thế・dòng máy・số lượng) và "trao đổi để quyết định" (P2 mới).
- **Tab lịch sử thay đổi**: ngày giờ thay đổi・nội dung thay đổi・người thay đổi (P1) + phân loại thay đổi (P2 mới).
- Danh sách: các cột hiện hành (ID gói・tên gói quản lý／công khai・số lượng giới hạn cung cấp hàng tháng・giá công khai của Standard／Lite chuyến COOL・chuyến ES giao hàng・trạng thái công bố) + course.
- Quy tắc bổ sung 2026/09/30 (【đề xuất】): không thể lưu khi tổng giới hạn cung cấp hàng tháng và tổng giới hạn của course không khớp／khi thêm dòng của gói giá thì ngày trước đó tự động được điền vào kỳ kết thúc của dòng trước／không thể lưu giá mà phí cơ bản nhỏ hơn 0 yên (28-148).
- Số tiền của demo (phí gói) đều là đặt tạm.

**Trả lời (2026/09/30 hong)**

| # | Quyết định | Nội dung |
|---|---|---|
| 28-177 | ⑫ Sửa hiển thị ID gói | Danh sách của màn hình hiện hành là ES0000001 (7 chữ số) và tất cả dòng cùng một ID. **Sửa danh sách cũng thành ES + 6 chữ số・ID theo từng dòng giống chi tiết** (sửa màn hình hiện hành) |
| 28-178 | ⑬ Giữ kiểm tra khi lưu | ① ES Standard: giới hạn đông lạnh + giới hạn lạnh・nhiệt độ thường ≧ tổng giới hạn cung cấp hàng tháng【2026/10/01 STEP5 Q5 sửa từ ＝ thành ≧. Nếu thêm đông lạnh tùy chọn thì có thể nhiều hơn tổng (hong xác nhận 2026-10-05)】 ② **ES Lite: giới hạn lạnh・nhiệt độ thường ＝ tổng giới hạn cung cấp hàng tháng** (vì không có đông lạnh) ③ Dải nhiệt độ nào cũng có giới hạn dưới ≦ giới hạn trên ④ số lần giao hàng tiêu chuẩn ≧ 1 ⑤ giá ≧ phần doanh nghiệp chịu (phí cơ bản không nhỏ hơn 0 yên) ⑥ bản công khai chỉ 1 dòng cho mỗi course・kỳ của gói giá không chồng nhau. Khi course = "chỉ 〜" thì không kiểm tra tab phía không dùng. Demo hoạt động bằng nút lưu |
| 28-179 | ⑭ Công dụng của tỷ lệ cơ bản × lần | Là bội số **để nhân với số tiêu chuẩn (mỗi 50 cái cơ bản) mà vận hành thiết lập ở màn hình đặt hàng, tự động phản ánh vào đơn hàng (số lượng tiêu chuẩn) của doanh nghiệp** |
| 28-180 | ⑮ Bản công khai | **Giống "đang chọn" của yêu cầu**. Là giá hiển thị trên Web doanh nghiệp, thế hệ dùng cho hợp đồng con mới tạo (chỉ 1 dòng) |

**Điểm nhận thấy ở màn hình hiện hành (mục cần xác nhận ban đầu・chỉ còn ⑯)**

| # | Nội dung |
|---|---|
| ⑫ | ID gói của danh sách là ES0000001 (7 chữ số), chi tiết là ES000001 (6 chữ số). Thống nhất ES + 6 chữ số (quyết định 2026/09/15). Ở mẫu danh sách, tất cả dòng đều cùng ID |
| ⑬ | Giới hạn lạnh・nhiệt độ thường ở tab ES Lite là 80 (tổng 100). Lite không có đông lạnh nên phải là 100 (demo là 100) |
| ⑭ | Công dụng của "tỷ lệ cơ bản × lần". Nếu giống với tổng giới hạn cung cấp hàng tháng ÷ 50 thì có thể tự động tính |
| ⑮ | "Bản công khai" của gói giá và trạng thái "đang chọn" của yêu cầu (REQ-PM-008) có cùng ý nghĩa không. Demo xử lý là "giá hiển thị trên Web doanh nghiệp・thế hệ dùng cho hợp đồng con mới tạo (chỉ 1 dòng)" |
| ⑯ | Ở demo đăng ký・hợp đồng, hiển thị **ID gói riêng cho từng course** như "ES000012 ES Standard 100". Master gói hiện tại có 2 tab Standard・Lite trong 1 gói nên hợp đồng giữ bằng ID gói + course (hợp đồng con "loại menu (course)") mới đúng. Cách ghi của demo đăng ký・tiếp nhận・hợp đồng chưa sửa |

### Trả lời bổ sung 2026/09/30 (28-181) và đang xem xét

| # | Luận điểm | Quyết định |
|---|---|---|
| 28-181 | Khi khách hàng hiện có tiếp tục với phí thế hệ cũ, quyết định thế hệ của gói giá ở đâu | **Có thể chọn mỗi tháng ở hợp đồng con.** Đổi "gói giá được áp dụng" của hợp đồng con từ tham chiếu sang nhập (dropdown). Giá trị ban đầu: hợp đồng con tự động tạo = cùng thế hệ với hợp đồng con trước, đăng ký mới・đổi gói = bản công khai (đang chọn・28-180). Khi chuyển dữ liệu thì nhập thế hệ hiện tại. Khi thay đổi, hộp thoại lưu hỏi "chỉ hợp đồng con này／tất cả từ hợp đồng con này trở đi". Không thay đổi sau khi thanh toán ① đã xác định. Phí gói và chênh lệch nâng cấp Standard (28-174) được tính bằng phí của thế hệ này, và số tiền được cố định vào hợp đồng con |

| 28-182 | Chủ sở hữu "thiết bị có trong gói (miễn phí)" (giữ kép thiết bị cho mượn tiêu chuẩn của Master gói và ngưỡng miễn phí của Master dòng máy) | **Thống nhất về "thiết bị cho mượn tiêu chuẩn" của Master gói** (hong: hướng A). Dòng máy・số lượng có trong đó thì phí ban đầu・phí hàng tháng đều miễn phí, mẫu thay thế cũng miễn phí. Phần vượt dòng máy・số lượng không có trong đó thì theo phí của Master dòng máy. Kích thước lớn hơn tiêu chuẩn thì có chênh lệch kích thước (chênh lệch phí hàng tháng với dòng máy tiêu chuẩn cùng phân loại・chỉ khi dương【tạm thời】). **Bỏ "số lượng cung cấp hàng tháng của đánh giá miễn phí Lite／Standard" của Master dòng máy**, chỉ còn "gói bao gồm tiêu chuẩn (tham chiếu)" (thay thế ⑫B 2026/09/23). Để giảm công thiết lập, thêm **nhập CSV thiết bị cho mượn tiêu chuẩn** và **"cấu hình giống Standard" của ES Lite** (mặc định có・tự động trừ tủ đông). Thêm vào kiểm tra khi lưu ⑦ từ 1 dòng tiêu chuẩn trở lên ⑧ sức chứa tối đa ≧ số lượng giao hàng mỗi lần (cảnh báo) |

(Ghi chép xem xét: so sánh A = thống nhất về Master gói／B = thống nhất về ngưỡng của Master dòng máy／C = phân vai cả hai, chọn A vì biểu thị được số lượng・tiêu chuẩn／thay thế・số hộp vật tư・trao đổi.)

**Chưa sửa**: demo form đăng ký doanh nghiệp (es_apply_form) vẫn đánh giá miễn phí bằng ngưỡng của Master dòng máy (bao gồm cách ghi tên dòng máy cũ・ID gói, sẽ sửa tiếp theo).

### 2026/09/30 Mẫu nhập CSV (đề xuất・bản 1 file)

hong "Master gói cần thiết lập được bằng CSV. Cần mẫu nhập" → ban đầu làm 3 file (gói／giá／thiết bị), hong "có thể làm thành 1 file không?" nên **đổi thành 1 file** (bản 3 file ở 99_過去/プランマスタCSV_3ファイル版_20260930/).
`03_Excel/プランマスタ_CSV取込テンプレート/`: plan_master_import.csv (UTF-8 BOM・có ví dụ điền) + xlsx (giải thích・sheet nhập・định nghĩa mục (Nhật-Việt)・lựa chọn). Tạo: `項目一覧_生成スクリプト/plan_csv_template.py`.
- **4 loại dòng trong 1 CSV**: "phân loại dòng" = gói (1 dòng cho mỗi gói)／course (gói × course)／giá (gói × course × thế hệ)／thiết bị (1 dòng máy của thiết bị cho mượn tiêu chuẩn). Cột dùng được quyết định theo phân loại dòng, các cột khác để trống (34 cột). Thứ tự dòng tự do.
- **Các dòng của cùng một gói được gom bằng "ID gói／khóa tạm".** Gói đã đăng ký dùng ID gói, gói mới dùng khóa tạm (ví dụ: Mới 1・bắt buộc có dòng gói). Đánh số khi đăng ký, hiển thị "khóa tạm → ID gói" trong kết quả nhập. **Một lần nhập tạo được toàn bộ gói mới.**
- Khi nhập: dòng gói・course được cập nhật (nếu mới thì đăng ký)／dòng giá nếu có course + gói giá thì cập nhật, nếu không có thì thêm (không xóa thế hệ không có trong file)／dòng thiết bị thì chỉ gói × course có dòng thiết bị trong file mới được thay thế toàn bộ cấu hình. **File chỉ cần các dòng cần thiết** (điều chỉnh phí chỉ cần dòng giá, v.v.). Không xóa bằng CSV. Giá trị tự động tính không có cột. Xuất CSV cũng cùng định dạng.
- Lỗi theo đơn vị gói (chỉ cần 1 dòng lỗi thì toàn bộ dòng của gói đó không được nhập). Kiểm tra gồm ①〜⑥ của 28-178・⑦⑧ của 28-182, ⑨ có dòng thiết bị Lite dù Lite "dùng cùng cấu hình = có" ⑩ dòng của course không có trong course có thể chọn ⑪ cột bắt buộc theo phân loại dòng bị để trống.
- 【Cần xác nhận】Có cho chỉ định ID gói mới bằng CSV hay không (hiện chỉ đánh số・liên kết bằng khóa tạm).

| # | Luận điểm | Quyết định |
|---|---|---|
| 28-183 | Phân loại NEW／UPDATE／DELETE của nhập CSV và hành vi khi có dữ liệu hiện có (2026/09/30 hong: phương án A) | **Không giữ cột phân loại.** Nếu có dữ liệu hiện có trùng khóa thì ghi đè, nếu không thì mới・thêm. Hành vi theo phân loại dòng là cố định, được ghi trong 【 】 ở tiêu đề của mẫu: gói・course【ghi đè／mới】／giá【thêm／ghi đè／xóa】(giữ lại thế hệ không có trong file)／thiết bị【thay thế】(chỉ gói × course có dòng thiết bị trong file mới thay cấu hình). **DELETE chỉ ở dòng giá**, cột "xóa" (1 = xóa・chỉ thế hệ không được hợp đồng con nào dùng). Xóa gói chỉ trên màn hình. **Dữ liệu đã được sử dụng**: giá・kỳ bắt đầu của thế hệ đang được dùng không thể ghi đè (chỉ kỳ kết thúc được・khi thay đổi phí thì thêm thế hệ mới), thế hệ đang được dùng không thể xóa／có thể ghi đè gói・course có cơ sở đang ký hợp đồng (có hiệu lực từ hợp đồng con tiếp theo・cảnh báo ở màn hình xác nhận)／thay thế thiết bị không ảnh hưởng đến thiết bị đang cho mượn (chỉ tiêu chuẩn của đăng ký・tiếp nhận sắp tới)／nếu có 2 dòng cùng khóa thì là lỗi. **Màn hình xác nhận trước khi nhập** hiển thị theo từng gói: mới／ghi đè (trước thay đổi → sau thay đổi)／thêm／xóa／thay thế (dòng máy sẽ mất hiển thị màu đỏ)／lỗi, chỉ phản ánh khi xác nhận |

### 2026/09/30 Course của ES Lite (máy bán hàng tự động) (28-184)

hong "Hiện tại Master gói chưa định nghĩa gì về máy bán hàng tự động" "Từ trước đến nay phải tính phí thủ công nên nên thêm vào Master gói. Như Lite (tủ lạnh)・Lite (máy bán hàng tự động)" "Có chọn được máy bán hàng tự động hay không thiết lập theo từng gói" "Nên là dạng khác với tiêu chuẩn".

| # | Luận điểm | Quyết định |
|---|---|---|
| 28-184 | Phí gói và thiết bị của cơ sở máy bán hàng tự động | **Thêm course "ES Lite (máy bán hàng tự động)" vào Master gói.** Tab là ES Standard／ES Lite (tủ lạnh)／ES Lite (máy bán hàng tự động). Tab máy bán hàng tự động có ① giới hạn trên・dưới của lạnh・nhiệt độ thường (giới hạn trên = tổng giới hạn cung cấp hàng tháng)・số lần giao hàng tiêu chuẩn・số lượng giao hàng mỗi lần (tự động)・tỷ lệ sắp hết ② gói giá (**chỉ chuyến ES giao hàng**. Cơ sở máy bán hàng tự động cố định chuyến ES giao hàng・28-19. **Là phí gói đã bao gồm phí cho thuê máy bán hàng tự động** nên không tính thủ công) ③ thiết bị cho mượn tiêu chuẩn (**bắt buộc có từ 1 dòng máy bán hàng tự động, không đưa tủ lạnh・tủ đông vào** = đặt máy bán hàng tự động thay cho tủ lạnh. Hộp vật tư mặc định cùng bộ với ES Lite (tủ lạnh)). **"Course" là chọn nhiều** (ES Standard／ES Lite (tủ lạnh)／ES Lite (máy bán hàng tự động)), quyết định theo từng gói có chọn được máy bán hàng tự động hay không (cũ: 3 lựa chọn tất cả／chỉ 〜). Thêm ES Lite (máy bán hàng tự động) vào "loại menu (course)" của hợp đồng con. Nhập CSV là course = Lite (máy bán hàng tự động), course có thể chọn nối bằng "・" |

- Sức chứa tối đa của máy bán hàng tự động phải từ số lượng giao hàng mỗi lần trở lên (cảnh báo). Công thức tính sức chứa tối đa của máy bán hàng tự động vẫn cần xác nhận (OPEN 10 của Master dòng máy).
- **Chưa sửa**: demo form đăng ký doanh nghiệp (máy bán hàng tự động là "báo giá riêng" nên chưa đưa ra tổng phụ của gói → sửa thành dạng đưa ra giá ES Lite (máy bán hàng tự động))／cách ghi gói của demo đăng ký・tiếp nhận・hợp đồng.
- 【Cần xác nhận】Course máy bán hàng tự động có cần bản Standard (có đông lạnh) không (hiện chỉ Lite)／cách xử lý khi đổi từ ES Lite (tủ lạnh) → ES Lite (máy bán hàng tự động) (tiếp nhận như đổi gói, hay như di chuyển thiết bị).

| # | Luận điểm | Quyết định |
|---|---|---|
| 28-185 | Course máy bán hàng tự động có cần bản Standard (có đông lạnh) không | **Không cần. Chỉ máy bán hàng tự động lạnh** (chỉ có ES Lite (máy bán hàng tự động)) (2026/09/30 hong) |

| # | Luận điểm | Quyết định |
|---|---|---|
| 28-186 | Phí ban đầu của gói máy bán hàng tự động phát sinh ở đâu (2026/09/30 hong: A) | **Giữ cột "phí ban đầu (chưa gồm thuế)" trong gói giá của ES Lite (máy bán hàng tự động) của Master gói** (theo từng thế hệ). Ở ① của **hợp đồng con dùng course máy bán hàng tự động lần đầu** (đăng ký mới máy bán hàng tự động・đổi course từ tủ lạnh → máy bán hàng tự động), tự động dựng 1 lần dòng khoản mục một lần "Phí ban đầu máy bán hàng tự động" (loại nguồn = plan). Không dựng khi đổi gói chỉ thay đổi số bữa mà vẫn là máy bán hàng tự động. Phí ban đầu của máy bán hàng tự động trong Master dòng máy chỉ dùng khi đặt thêm vượt thiết bị cho mượn tiêu chuẩn (miễn phí・28-182). Cũng đã thêm cột vào mẫu nhập CSV (chỉ Lite (máy bán hàng tự động)) |

**Tủ lạnh → máy bán hàng tự động không quyết định chỉ bằng đăng ký của khách hàng (2026/09/30 hong)**: máy bán hàng tự động khác tủ lạnh ở chỗ cần **khảo sát hiện trường** nên dù đăng ký cũng không chuyển đổi ngay được. Luồng tiếp nhận (tiếp nhận như trao đổi・ghi nhận khảo sát hiện trường・cách quyết định ngày chuyển đổi) đang xem xét.

**Những điều chưa quyết định**: số tiền phí ban đầu có thay đổi theo gói (số bữa) không (demo đặt tạm ¥50,000 cho mọi thế hệ)／khi thu hồi tủ lạnh lúc chuyển từ tủ lạnh → máy bán hàng tự động, nếu trong thời gian sử dụng tối thiểu của tủ lạnh thì có phát sinh phí hủy không.
