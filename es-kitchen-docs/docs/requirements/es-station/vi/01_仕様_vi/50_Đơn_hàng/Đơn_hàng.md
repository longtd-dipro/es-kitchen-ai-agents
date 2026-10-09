# Đơn hàng (đơn hàng hằng tháng・đơn hàng vật tư・quản lý đơn hàng của Vận hành)

> **Nguồn chuẩn của chủ đề này.** Ngày 2026-10-05, viết lại mới bằng cách tổng hợp các tài liệu gốc và quyết định bên dưới.
> Các quyết định đang có hiệu lực hiện nay nằm ở `docs/決定台帳.md` (chủ đề này chủ yếu thuộc **H**・**F**・**B**). Nếu có mâu thuẫn thì sổ cái quyết định là chuẩn.
> Tài liệu gốc (đóng băng・chỉ xem lịch sử): `Đề_xuất_Số_chuẩn_và_mặc_định_riêng_cho_cơ_sở_20261001.md`, `Demo_đơn_hàng_hàng_tháng_Chênh_lệch_với_hợp_đồng_gói_20260930.md`, `00_Quyết_định/Quyết_định_STEP5_Trả_lời_Web_doanh_nghiệp_20261001.md`, tổng hợp định nghĩa yêu cầu chủ đề 4-15 (RD-AP-112〜151・chỉ ở local).
> Tham khảo: `Order-Spec-for-AI-Team.md` (tài liệu bàn giao cho đội AI), `spec_Giá_bán_theo_cơ_sở_Giỏ_hàng_vi.md` (giá trong giỏ hàng của ứng dụng cá nhân).

## 0. Các đặc tả liên quan

| Muốn biết | Xem ở đâu |
|---|---|
| Cách đề xuất menu・master sản phẩm・số lượng tiêu chuẩn của Vận hành | Sổ cái F (đặc tả menu chưa được sắp xếp) |
| Gói・giới hạn trên/dưới của số lượng cung cấp hằng tháng・số lần giao hàng tiêu chuẩn | `議事録_仕様/プランマスタ_仕様まとめ.md` |
| Số lần giao hàng・chu kỳ giao hàng (cài đặt giao hàng của hợp đồng con) | `10_Giao_hàng/Đặc_tả_giao_hàng/Giao_hàng_03_Cài_đặt_giao_hàng_của_hợp_đồng.md` |
| Bắt đầu dùng thử・ngày chốt đặt hàng | `10_Giao_hàng/Đặc_tả_giao_hàng/Giao_hàng_04_Lịch_dự_kiến_dữ_liệu_giao_hàng_và_thay_đổi.md` §7-9 |
| Đặt hàng (đơn hàng → số lượng đặt hàng) | `55_Đặt_hàng_Nhập_mua_Nhập_kho/` |
| Báo cáo kiểm kê (kiểm tra tồn kho)・tồn kho lý thuyết | `60_Tồn_kho/` |
| Hàng thay thế | `65_Hàng_thay_thế/` |

## 1. Nguyên tắc cơ bản của đơn hàng hằng tháng

| # | Quy định | Căn cứ |
|---|---|---|
| 1-1 | **1 cơ sở＝1 đơn hàng** (theo từng tháng chu kỳ). Tài khoản doanh nghiệp chuyển tab của cơ sở để nhập được phần của tất cả cơ sở. Tài khoản cơ sở chỉ nhập cơ sở của mình | Order-Spec §4.1, sổ cái K |
| 1-2 | Thời gian tiếp nhận là **từ lúc công bố menu (＝bắt đầu đặt hàng. Mặc định là ngày 1 tháng trước) đến hạn chốt (mặc định là ngày 15 tháng trước)**. Ngày do menu giữ, Vận hành sửa được. Hạn chốt là 1 lần mỗi tháng | RD-AP-112, sổ cái F |
| 1-3 | Đến hạn chốt có thể đăng ký lại bao nhiêu lần cũng được. **Không có thao tác đơn hàng tạm・bản nháp・phê duyệt** (cái đã nhấn "Đăng ký" chính là đơn hàng) | RD-AP-114 |
| 1-4 | Cơ sở chưa đăng ký lần nào đến hạn chốt thì được xác định bằng **đơn hàng mặc định**. Nội dung ở §4 ("Áp dụng cho các lần sau" BẬT＝bản nháp của AI／TẮT＝số lượng tiêu chuẩn của Vận hành nhân với cài đặt của cơ sở) | RD-AP-113, sổ cái H |
| 1-5 | Trạng thái chỉ có **một** (chưa đăng ký／khách hàng đã đăng ký／ES Kitchen đã thay đổi／đơn hàng mặc định). Không tách thành hai phía khách hàng・phía ES. **Ai・khi nào** nhập・sửa được lưu vào lịch sử thay đổi (kể cả thay đổi của ES sau hạn chốt) | RD-AP-114・124 |
| 1-6 | **ES Kitchen (Vận hành) sửa được bất cứ lúc nào, ở bất kỳ trạng thái nào.** Khách hàng không thể hủy・dừng đơn hàng. Tạm dừng thực hiện bằng đơn đăng ký (Vận hành phê duyệt) | RD-AP-115 |
| 1-7 | Ngoài thời gian tiếp nhận vẫn **xem được** màn hình đơn hàng (không nhập được) | RD-AP-132 |
| 1-8 | Từ 7 ngày trước hạn chốt đến ngày hạn chốt, hiển thị cảnh báo cho cơ sở chưa đăng ký (ở trang chủ và màn hình đơn hàng). Doanh nghiệp bật/tắt được lời nhắc hạn chốt (thông báo・email) | Sổ cái E "Cảnh báo chưa đặt hàng" |
| 1-9 | Khi xác định bằng đơn hàng mặc định thì có thông báo trên Web doanh nghiệp + gửi email cho người phụ trách chính của cơ sở (mỗi chu kỳ 1 lần) | Sổ cái E |
| 1-10 | Sản phẩm hiển thị trên màn hình đơn hàng chỉ gồm **sản phẩm thuộc course của cơ sở (Light＝lạnh・nhiệt độ thường／Standard＝cả đông lạnh) và kho picking của hợp đồng xử lý**. Số lượng tiêu chuẩn・ứng viên của AI cũng vậy | Sổ cái H, Order-Spec §2 |
| 1-11 | Không làm màn hình chỉ xem menu. Chọn trong lúc xem ảnh・chi tiết ở màn hình đơn hàng (mặc định là hiển thị kèm ảnh). Hiển thị course・máy bán hàng tự động trong gói | RD-AP-117 |

## 2. Quy định về số lượng

### 2-1. Không đăng ký được (lỗi)

| # | Quy định | Căn cứ |
|---|---|---|
| 2-1 | **Tổng＝số lượng của gói** (tổng giới hạn số lượng cung cấp hằng tháng). Nhiều hơn hay ít hơn đều không đăng ký được. Không làm chức năng đặt thêm vượt giới hạn trên | RD-AP-120, sổ cái N |
| 2-2 | Số lượng theo từng chuyến (lần giao hàng) **đều nhau**. Khi không chia hết thì **chênh lệch giữa các chuyến trong ±1**, tổng khớp là được (ví dụ: 250・4 lần＝62／62／63／63) | RD-AP-120, Order-Spec §4.3 |
| 2-3 | Chuyến được **đếm theo từng nhóm nhiệt độ** (chuyến lạnh・nhiệt độ thường／chuyến đông lạnh. Giống cài đặt giao hàng của hợp đồng con) | Sổ cái H |
| 2-4 | **Theo từng nhóm nhiệt độ: giới hạn dưới ≦ số lượng ≦ giới hạn trên**. Giá trị là giới hạn trên・dưới của số lượng cung cấp hằng tháng đã sao chép sang hợp đồng con. Số lượng đông lạnh được quyết định bằng **số cái** (không giữ tỷ lệ). Giới hạn trên của đông lạnh + giới hạn trên của lạnh・nhiệt độ thường có thể lớn hơn tổng (trong phạm vi đó khách hàng chọn được cách phân bổ) | Sổ cái B "Tỷ lệ đông lạnh"・sổ cái H, RD-AP-128・129 |
| 2-5 | **Không giữ giới hạn trên theo từng sản phẩm** | Sổ cái B |
| 2-6 | Máy bán hàng tự động: **không đặt 2 loại sản phẩm vào 1 cột**. Mỗi lần giao hàng tối đa 50 cái (màn hình ghi "Tối đa 50 cái") | RD-AP-125 |

### 2-2. Chỉ cảnh báo (vẫn đăng ký được)

| # | Quy định | Căn cứ |
|---|---|---|
| 2-7 | **Vượt số lượng chứa** của cột máy bán hàng tự động → cảnh báo mang tính tham khảo (số lượng của gói được ưu tiên) | RD-AP-126, sổ cái H |
| 2-8 | **Tổng sản phẩm tương thích băng tải ＞ tổng sức chứa của các cột băng tải** → cảnh báo | RD-AP-126 (yêu cầu dòng 32) |
| 2-9 | **Số lượng đơn hàng đông lạnh 1 lần ＞ sức chứa tối đa của tủ đông** → cảnh báo | RD-AP-128 (yêu cầu dòng 173) |
| 2-10 | Sản phẩm không vừa máy bán hàng tự động cũng vẫn hiển thị trên màn hình đơn hàng. Có đặt hay không **do doanh nghiệp quyết định** (cách nhận hàng là trách nhiệm của doanh nghiệp・hiển thị ghi chú lưu ý) | Sổ cái H |

### 2-3. Cơ sở có máy bán hàng tự động

- Chỉ cơ sở có course "ES Light (máy bán hàng tự động)" đặt hàng **theo từng khung (đôi・đơn・băng tải)**. Chênh lệch số chuyến giao giữa các khung thì chấp nhận được.
- **1 hợp đồng＝1 máy bán hàng tự động** (nếu 2 máy thì tách cơ sở・hợp đồng). Không làm cơ chế tách đơn hàng theo từng máy.
- Xem được số lượng chứa tối đa và số lượng tồn kho tại thời điểm đặt hàng (RD-AP-127).

## 3. Cách nhập

| # | Quy định | Căn cứ |
|---|---|---|
| 3-1 | Có 2 cách nhập: ① **Nhập theo từng lần giao hàng** (tối đa 8 lần・"Sao chép lần 1") ② **Nhập tổng và tự động phân bổ** (phần dư dồn nhiều hơn vào các lần trước). Sau khi phân bổ có thể sửa tay | RD-AP-118 |
| 3-2 | Ô số lượng khi nhấn thì **chọn toàn bộ** và ghi đè luôn được (cả Web doanh nghiệp lẫn Web Vận hành) | RD-AP-121 |
| 3-3 | **CSV**: xuất template, nhập vào để đặt hàng được | RD-AP-116 |
| 3-4 | Thống kê: tổng theo danh mục và số lượng theo từng lần giao hàng (không hiển thị số tiền). Danh sách cho thấy chi tiết lạnh・đông lạnh | RD-AP-122 |
| 3-5 | Nhóm nhiệt độ hiển thị bằng **biểu tượng＋chữ ngắn** (phân biệt cả màu) | Sổ cái H |
| 3-6 | Sản phẩm có hạn tiêu thụ ngắn chỉ hiển thị là "Hạn sử dụng ngắn" (phân loại short／semi-short là dùng nội bộ) | RD-AP-056 |

## 4. AI (đề xuất tự động) và "Áp dụng cho các lần sau"

| # | Quy định | Căn cứ |
|---|---|---|
| 4-1 | Từ "AI" trên màn hình đơn hàng chọn được 3 cách: **phân bổ đều／tham chiếu dữ liệu quá khứ／chỉ thị cho AI bằng chat**. Mỗi cách đều hiển thị giải thích cách dùng | RD-AP-136・151 |
| 4-2 | Kết quả được cho xem bằng **xem trước**, nhấn "Xác nhận" thì vào màn hình đơn hàng (không vào bằng "Quay lại"・"×"). **Sau đó nhấn "Đăng ký" thì mới thành đơn hàng** | RD-AP-137・138 |
| 4-3 | Màn hình AI bên trái là chat, bên phải là xem trước. Lọc được theo danh mục・hạn sử dụng・số lượng・số tiền | RD-AP-139 |
| 4-4 | Đề xuất của AI cũng nhất định tuân thủ các quy định ở §2. Hỗ trợ cả đông lạnh | RD-AP-140・144 |
| 4-5 | Đầu vào của "Tham chiếu dữ liệu quá khứ": **đơn hàng quá khứ・tỷ lệ hủy bỏ・tồn kho (kết quả bán hàng)** của cơ sở đó. Dùng đến dữ liệu đã xác định tại thời điểm đặt hàng (ví dụ: với đơn hàng tháng 11 thì dùng đến kiểm kê của tháng 9) | RD-AP-141, sổ cái H |
| 4-6 | Tỷ lệ hủy bỏ＝**hủy bỏ ÷ (tồn kho lần trước ＋ giao hàng)** (cùng công thức với màn hình tồn kho) | Sổ cái H (hong trả lời 2026-10-05) |
| 4-7 | **"Áp dụng cho các lần sau"**: cơ sở đã tích chọn ở bản xem trước và áp dụng thì từ tháng sau, vào ngày bắt đầu đặt hàng, **tự động đưa đề xuất của AI vào bản nháp bằng menu mới**. Nếu đến hạn chốt chưa đăng ký thì xác định bằng bản nháp đó. Đã thay thế "chế độ AI" cũ bằng tính năng này | Sổ cái H |
| 4-8 | Cơ sở không tích chọn・cơ sở chưa đăng ký thì xác định bằng **số lượng tiêu chuẩn của Vận hành nhân với cài đặt mặc định của cơ sở (§5)** | Sổ cái H, RD-AP-146 |
| 4-9 | Không làm đề xuất theo trung bình của các công ty khác (từ giai đoạn sau trở đi) | RD-AP-143 |

## 5. Cài đặt mặc định của cơ sở

Giữ theo từng cơ sở, tiếp tục cả từ tháng sau. Sửa được cả từ đơn hàng hằng tháng của Web doanh nghiệp lẫn từ phía Vận hành (ở "cài đặt của cơ sở" trong chi tiết đặt hàng sản phẩm).

| Cài đặt | Mặc định | Căn cứ |
|---|---|---|
| Có／không theo từng danh mục | Tất cả có | RD-AP-148 |
| Lấy／không lấy sản phẩm có hạn tiêu thụ ngắn | **Lấy** | Sổ cái H |
| Sản phẩm đặt về 0 mỗi tháng (ví dụ: các loại bánh mì) | Không có | RD-AP-145 |
| Số tiền sản phẩm: tích chọn "sản phẩm 100 yên", "sản phẩm 200 yên". Sản phẩm có số tiền bị bỏ chọn sẽ không đưa vào đơn hàng mặc định và đề xuất của AI (đặt tay thì được). Giá là giá bán của master sản phẩm | Cả hai BẬT | Sổ cái H (hong trả lời 2026-10-05), RD-AP-148 |
| "Áp dụng cho các lần sau" (bản nháp của AI) | TẮT | §4-7 |

## 6. Số lượng tiêu chuẩn (số lượng chuẩn) của Vận hành

- Theo từng menu, Vận hành nhập **trọng số** của sản phẩm và chỉ định **sản phẩm・danh mục không đưa vào tiêu chuẩn**. Hệ thống phân bổ theo 3 loại (thông thường／không có hạn tiêu thụ ngắn／máy bán hàng tự động)×course, và tuân thủ các quy định ở §2 (tổng・chênh lệch chuyến ±1・giới hạn trên dưới theo nhóm nhiệt độ・số lượng chứa của máy bán hàng tự động). **Số lượng Vận hành sửa tay được ưu tiên** (sổ cái H).
- Chuẩn là trên 50 gói. Số lượng của cơ sở là **số lượng tiêu chuẩn × tỷ lệ cơ bản (100 gói＝gấp 2 lần)** (28-179).
- Cách đề xuất (tỷ lệ đơn hàng → điều chỉnh giá nhập trung bình về khoảng mục tiêu) và mục tiêu của đơn giá trung bình nằm ở sổ cái F.
- Máy bán hàng tự động được tạo theo từng khung・từng dòng máy (sổ cái H).

## 7. Đơn hàng dùng thử

| # | Quy định | Căn cứ |
|---|---|---|
| 7-1 | Dùng thử **chỉ có ES Light (tủ lạnh)** (gói 50・số lần giao hàng tiêu chuẩn là 1 lần) | Sổ cái H |
| 7-2 | Đơn hàng **do hệ thống tự động tạo** (kể cả từ tháng thứ 2). **Phân bổ giới hạn trên số lượng cung cấp hằng tháng của gói cho toàn bộ sản phẩm của menu** (không dùng số lượng tiêu chuẩn của Vận hành). Chênh lệch chuyến ±1 | Sổ cái H |
| 7-3 | **Doanh nghiệp chỉ được tham chiếu** (số lượng・sản phẩm・ngày giao hàng. Không hiển thị nút chỉnh sửa・AI) | Sổ cái H |
| 7-4 | Từ dòng "Dùng thử (tự động)" trong quản lý đặt hàng sản phẩm, Vận hành sửa được số lượng・sản phẩm **đến ngày chốt đặt hàng (B7・D7)** | Sổ cái H |
| 7-5 | Đăng ký tạm (hoàn tất xác nhận nội dung đăng ký) thì tạo đơn hàng và bộ vật tư ban đầu. Không có tài khoản cũng tạo | 28-94・95・98 (`Đơn_yêu_cầu_và_phê_duyệt.md`) |
| 7-6 | Chu kỳ đầu tiên sau khi chuyển sang triển khai chính thức là đơn hàng hằng tháng thông thường (doanh nghiệp nhập) | Sổ cái H |

## 8. Đơn hàng khi phê duyệt thay đổi hợp đồng

| Nội dung được phê duyệt | Đơn hàng của chu kỳ đó | Căn cứ |
|---|---|---|
| Tạm dừng・hủy hợp đồng | Hủy | Sổ cái H |
| Đổi gói・đổi số lần giao hàng | **Đưa về đơn hàng mặc định theo điều kiện mới**. Nhập lại được đến hạn chốt (nếu không nhập lại thì xác định nguyên trạng) | Sổ cái H |
| Xác nhận nội dung đăng ký mới (triển khai chính thức) | Nếu trong thời gian tiếp nhận của tháng chu kỳ bắt đầu thì doanh nghiệp nhập được. Nếu đã qua hạn chốt thì Vận hành chọn "dời sang chu kỳ sau／Vận hành đặt hộ" | 28-97, sổ cái B |

- Việc tự động sửa được hiển thị ở "phạm vi ảnh hưởng" của màn hình phê duyệt. Thông báo cho doanh nghiệp là **Vận hành gửi tùy ý**.
- Sau khi xác định đơn hàng, việc đổi lịch giao hàng từ khách hàng được tiếp nhận bằng "đơn đề nghị đổi ngày giao hàng" (`配送仕様`).

## 9. Đơn hàng vật tư

| # | Quy định | Căn cứ |
|---|---|---|
| 9-1 | **Đặt được bất cứ lúc nào.** Mỗi đơn hàng tạo dữ liệu giao hàng của chuyến vật tư (giao thẳng từ văn phòng ES bằng Yamato) và hiển thị ở lịch của trang chủ | Sổ cái H, STEP4 A2 |
| 9-2 | **Đến 1 lần mỗi tháng chu kỳ thì đã bao gồm trong phí. Từ lần thứ 2 thì gắn OP000036 "Giao thêm vật tư (đơn lẻ・1 lần)" vào hợp đồng con** 【tạm ¥2,000／lần】. Màn hình đơn hàng hiển thị "Đơn hàng vật tư tháng này là lần 1 (đã bao gồm trong phí)／từ lần 2 tính phí riêng" | Sổ cái H |
| 9-3 | Phần vượt quá số lượng miễn phí (theo từng vật tư・từng gói. Giá trị ban đầu là số suất ăn của gói) thì thanh toán theo giá・thuế suất của master vật tư | Sổ cái B "Số lượng miễn phí của vật tư" |
| 9-4 | Bộ ban đầu (miễn phí) được tự động tạo khi đăng ký tạm, không tính vào số lần. Số lượng là bảng "vật tư × gói" | 28-129, sổ cái H |
| 9-5 | Master vật tư tách biệt với master sản phẩm. Hộp vật tư không đưa vào bộ ban đầu | 28-169, `00_Quyết_định/Quyết_định_v2.3_Bổ_sung_Liên_quan_đơn_yêu_cầu_20260928.md` §19 |

## 10. Màn hình của Vận hành (quản lý đơn hàng)

| # | Quy định | Căn cứ |
|---|---|---|
| 10-1 | Xác nhận đơn hàng **theo khách hàng (đơn hàng sản phẩm)・theo sản phẩm・theo vật tư**. Theo khách hàng hiển thị loại hình giao hàng (chuyến giao ES／chuyến COOL). Đơn vị là theo từng gói | RD-AP-130 |
| 10-2 | Danh sách・chi tiết quản lý đặt hàng sản phẩm có 2 cột "**Đăng ký của doanh nghiệp (ngày giờ・người phụ trách)**" và "**Thay đổi của ES (ngày giờ・người phụ trách)**" | Sổ cái H |
| 10-3 | Theo sản phẩm tìm kiếm được theo ngày xuất hàng・ngày đến, và xuất các dòng đã chọn ra CSV. Chọn được bao gồm／không bao gồm gói đã hủy hợp đồng | RD-AP-131 |
| 10-4 | Ô "**Điều chỉnh**" để thêm bằng tay việc xử lý hàng thay thế・hàng lỗi (không hiển thị ở danh sách). Cài đặt hàng thay thế xem ở `65_Hàng_thay_thế/` | RD-AP-123 |
| 10-5 | Cơ sở dùng thử có dòng "Dùng thử (tự động)" (§7-4) | Sổ cái H |

## 11. Các nội dung khác của Web doanh nghiệp (liên quan đến đơn hàng)

| # | Quy định | Căn cứ |
|---|---|---|
| 11-1 | **Phiếu giao hàng**: chỉ xuất từ chi tiết giao hàng (theo từng chuyến) (không xuất từ lịch sử đơn hàng). Trừ vật tư. Xuất được nếu việc giao hàng của chuyến đó đã bắt đầu. PDF tải trực tiếp dưới dạng tệp | Sổ cái F (review ① của phiên bản 1.1) |
| 11-2 | **Đánh giá**: thứ hiển thị cho doanh nghiệp chỉ gồm sao・sản phẩm・tag đánh giá・nickname (không hiển thị ý kiến・ID người dùng・địa chỉ email) | Sổ cái H (REQ-UI-008) |
| 11-3 | Với cơ sở dùng thử, hiển thị thời gian dùng thử (tháng chu kỳ bắt đầu・kết thúc) và gia hạn | STEP5 §2-5 T3 |

## 12. Ứng dụng cá nhân (tham khảo)

- Giá trong giỏ hàng・xác nhận thanh toán (giá bán theo từng cơ sở・ESQR) xem ở `spec_Giá_bán_theo_cơ_sở_Giỏ_hàng_vi.md` (2026/09/10. Đặc tả phía ứng dụng cá nhân).
- Thời gian có thể mua khi đang tạm dừng・sau khi hủy hợp đồng xem sổ cái K.

## 13. Những điều chưa quyết

| # | Nội dung | Trạng thái |
|---|---|---|
| U2 | Số lần giao hàng tiêu chuẩn của đông lạnh (【tạm】giống lạnh)・bảng sức chứa tối đa của tủ đông | Chờ bảng của khách hàng |
| U3 | Cách tính sức chứa tối đa của cột băng tải (danh sách mục master §0.9 OPEN #10)・cấu hình cột thực tế theo từng dòng máy | Xác nhận với khách hàng |
| U4 | Số tiền chính thức của OP000036 | Xác nhận với khách hàng |
| U5 | Điều cần truyền cho đội AI: bỏ giới hạn trên theo từng sản phẩm／mặc định của hạn tiêu thụ ngắn là "lấy"／chuyến theo từng nhóm nhiệt độ／đầu vào gồm tồn kho・tỷ lệ hủy bỏ (công thức là hủy bỏ ÷〈tồn kho lần trước＋giao hàng〉)・kết quả bán hàng／1 hợp đồng＝1 máy (sửa Order-Spec §4.2・§4.4・§7.3・§8) | Từ hong đến đội AI |
