# Tồn kho (tồn kho kho hàng・tồn kho cơ sở・báo cáo kiểm kê・điều chỉnh tồn kho)

> **Nguồn chính thức của chủ đề này.** Ngày 2026-10-05, viết lại mới chỉ gồm "những điều đang có hiệu lực hiện nay" từ các nguồn gốc và quyết định bên dưới.
> Các quyết định đang có hiệu lực nằm ở `docs/決定台帳.md` (E・H・I・K・B). Nếu có mâu thuẫn thì sổ cái quyết định là chuẩn.
> Nguồn gốc (đóng băng・chỉ để xem quá trình): `docs/議事録_仕様/在庫管理_仕様サマリ_顧客報告用.md`, `docs/議事録_仕様/発注仕入入荷_詳細要件仕様.md` §6・§7C-7・§7D・§7E, `00_Quyết_định/Quyết_định_STEP4_Trả_lời_Giao_hàng_20261001.md` (W1〜W7)・`Quyết_định_STEP5_Trả_lời_Web_doanh_nghiệp_20261001.md` (kiểm tra tồn kho)・`Quyết_định_v2.3_Bổ_sung_Liên_quan_đơn_yêu_cầu_20260928.md` §18 (28-118〜126).
> Tham khảo: `docs/議事録_仕様/Flow tồn kho_for dev.md` (diễn biến tồn kho của app cá nhân・ESQR. Dành cho nhà phát triển・tiếng Việt. Có hình và ví dụ).

## 1. Thuật ngữ

| Thuật ngữ | Ý nghĩa |
|---|---|
| Tồn kho kho hàng | Số lượng có ở kho picking (Kanto・Kansai〈THOMAS〉・văn phòng ES) |
| Tồn kho cơ sở | Số lượng có trong tủ lạnh・máy bán hàng tự động của cơ sở khách hàng. Giữ **theo từng cơ sở** |
| Tồn kho lý thuyết | Tồn kho cơ sở do hệ thống tính (giao hàng − mua − hủy bỏ ± điều chỉnh). **Được phép âm** |
| Tồn kho thực | Số đếm được khi kiểm kê |
| Giữ tạm | Số lượng được giữ bằng đơn hàng (trước khi thanh toán) |
| Tồn kho khả dụng | Tồn kho lý thuyết − giữ tạm |
| Báo cáo kiểm kê | Khai báo kiểm tra tồn kho của cơ sở (tên màn hình. Cũ: "Khai báo kiểm tra tồn kho") |
| Hao hụt quản lý | Tồn kho lý thuyết − tồn kho thực (quy ra tiền, phần vượt quá số tiền miễn trừ thì thanh toán) |

## 2. Tồn kho kho hàng

| # | Quy định | Căn cứ |
|---|---|---|
| 2-1 | Tồn kho kho hàng = **điểm khởi đầu (số kiểm kê) + nhập kho − xuất hàng ± ghi nhận tồn kho**. Xuất hàng tính theo ngày xuất | Danh sách vấn đề 2-3・2-5 (2026/10/02) |
| 2-2 | Nhập kho nhập thủ công theo từng đơn đặt hàng (`55_Đặt_hàng_Nhập_mua_Nhập_kho/Đặt_hàng_Nhập_mua_Nhập_kho.md` §8) | Sổ cái I |
| 2-3 | Ghi nhận tồn kho (tăng giảm) dùng màn hình danh sách + "Thêm ghi nhận". Nhập riêng số tăng và số giảm, ghi phân loại・lý do | STEP4 W1, REQ-PO-151 |
| 2-4 | "Ghi nhận tồn kho" và "Hoàn tồn kho" là nút ở phía trên bên phải màn hình tồn kho kho hàng (không đặt ở menu bên) | STEP4 W2 |
| 2-5 | Ngày xuất của tồn kho kho hàng được tính theo lead time của từng kho | STEP4 W4 |
| 2-6 | **Hoàn tồn kho** (trả sản phẩm không dùng trong tháng sau về công ty): không có chức năng tạo thủ công đơn hàng sản phẩm. Tạo **chỉ thị xuất hàng không kèm đặt hàng** ở màn hình chuyên dụng và xuất cho THOMAS bằng CSV. Giá trị ban đầu của số lượng hoàn: **chỉ sản phẩm "không dùng ở menu tiếp theo" là "toàn bộ số dư・tick ON"** (sản phẩm sẽ dùng là 0・OFF. Chọn thủ công thì hoàn được) | REQ-PO-603, STEP4 W6 |
| 2-7 | Nơi trả về (ES trụ sở chính) đăng ký ở master kho với **phân loại kho = nơi trả về**. Không giữ tồn kho tại trụ sở chính | STEP4 W7 |
| 2-8 | **Tồn kho vật tư** giữ ở văn phòng ES và tất cả kho picking (tồn kho lý thuyết. Sửa bằng kiểm kê định kỳ). Vật tư đóng kèm không trừ khỏi tồn kho | Danh sách vấn đề 2-5, Sổ cái F, REQ-PO-219 |

## 3. Tăng giảm tồn kho cơ sở

| Tăng | Giảm |
|---|---|
| Giao hàng (**cộng dồn** theo từng chuyến. Không reset) | Mua ở app cá nhân・ESQR (hoàn tất thanh toán) |
| Vào do di chuyển tồn kho (vận hành) | Đăng ký hủy bỏ |
| Điều chỉnh tồn kho của vận hành (+) | Ra do di chuyển tồn kho・điều chỉnh tồn kho của vận hành (−) |

- Sau khi chốt kiểm kê, **ghi đè tồn kho lý thuyết bằng tồn kho thực** và làm điểm bắt đầu của kỳ tiếp theo (REQ-PO-418b).
- Chuyến hàng đến sau ngày kiểm kê **được đưa vào kiểm kê kế tiếp** (Danh sách vấn đề 4a-11・2026/10/03).
- Hạn sử dụng・lô được giữ theo từng chuyến.
- **Khi chuyển sang hệ thống mới**: không khóa việc mua. Tồn kho lý thuyết bắt đầu từ 0, sản phẩm còn lại từ trước mua được bằng quét. Hiển thị ở Web doanh nghiệp "Vui lòng thực hiện báo cáo kiểm kê đầu tiên" cho đến khi báo cáo. **Không tính hao hụt quản lý cho đến báo cáo kiểm kê đầu tiên sau khi chuyển** (Sổ cái N・hong 2026-10-05).

## 4. Mua ở app cá nhân・ESQR và tồn kho (điểm chính)

Diễn biến chi tiết・hình・ví dụ xem `Flow tồn kho_for dev.md`.

| # | Quy định |
|---|---|
| 4-1 | Chỉ bỏ vào giỏ hàng thì không làm thay đổi tồn kho. **Đơn hàng (trước khi thanh toán) giữ tạm**, **hoàn tất thanh toán thì trừ tồn kho lý thuyết** |
| 4-2 | Chờ thanh toán **30 phút** (thông báo khoảng mỗi 15 phút). Quá hạn・thất bại・hủy → gỡ giữ tạm |
| 4-3 | Hoàn tiền sau khi hoàn tất thanh toán (hàng lỗi, v.v.) **không hoàn lại tồn kho lý thuyết** (sửa bằng kiểm kê) |
| 4-4 | Số lượng mua từ menu・lịch sử mua・yêu thích **tối đa đến tồn kho khả dụng** |
| 4-5 | **Mua bằng quét là ngoại lệ**: 1 lần 1 cái・không đổi được số lượng・không kiểm tra tồn kho (coi như hàng thật có sẵn). Tồn kho lý thuyết được phép âm |
| 4-6 | Tồn kho khả dụng từ 0 trở xuống: **không hiển thị** ở menu / hiển thị ở lịch sử mua・yêu thích nhưng với dòng "Hãy chờ đón lần xuất hiện tiếp theo.", không xem chi tiết・không bỏ vào giỏ được / mua được bằng quét. Sản phẩm hết hàng trong giỏ sẽ bị xóa khi mở lại app |
| 4-7 | **"Sắp hết"**: ngưỡng = làm tròn xuống (số đơn hàng của cơ sở đó × tỷ lệ sắp hết). Hiển thị khi tồn kho khả dụng > 0・ngưỡng ≥ 1・tồn kho khả dụng ≤ ngưỡng. Tỷ lệ đặt theo từng gói ở master gói. Không hiển thị số còn lại. Doanh nghiệp không bật/tắt được. Đã bỏ quy định "gói 100 trở xuống không hiển thị" |
| 4-8 | Khi vận hành sửa thủ công từ "Hủy" sang "Đã thanh toán" thì bắt buộc có lý do・để lại log |

## 5. Báo cáo kiểm kê (kiểm tra tồn kho của cơ sở)

| # | Quy định | Căn cứ |
|---|---|---|
| 5-1 | **1 lần mỗi tháng**. Kỳ đối tượng là **ngày 21〜ngày 20 tháng sau** | REQ-PO-413, STEP3 bổ sung P7 |
| 5-2 | Người thực hiện: **cơ sở chuyến COOL = khách hàng (Web doanh nghiệp)**. **Cơ sở chuyến giao ES = tài xế** (xác nhận tồn kho・hủy bỏ khi giao hàng) + **doanh nghiệp・cơ sở cũng có thể báo cáo ở Web doanh nghiệp** (xem báo cáo của tài xế, đếm lại và báo cáo lại được). Nếu cả hai đều có trong cùng tháng thì **báo cáo cuối cùng có hiệu lực** | STEP3 còn lại S10, Sổ cái "Báo cáo kiểm kê: doanh nghiệp nhập cho cơ sở chuyến giao ES" (hong trả lời 2026-10-05) |
| 5-3 | Khách hàng có thể **khai báo lại nhiều lần đến ngày 20** (cái cuối cùng có hiệu lực. Nhập được cả trước ngày chốt). **Từ ngày 21, vận hành thêm・sửa thay** | Sổ cái H |
| 5-4 | Màn hình **hiển thị danh sách sản phẩm, nhập số lượng cho toàn bộ rồi hoàn tất** (sản phẩm không có thì 0). Sản phẩm không có trong danh sách thì thêm bằng quét. **Sản phẩm hủy bỏ** cũng đăng ký ở đây. Cũng kiểm tra sản phẩm đang trên đường đến | Sổ cái E (Danh sách vấn đề 4-6), REQ-PO-155 |
| 5-5 | Kiểm kê・bảng kiểm tra hằng tháng **không hiển thị số tồn kho lý thuyết** (chỉ nhập tồn kho thực). Bảng kiểm tra xuất được bằng PDF. Việc tài xế xem tồn kho lý thuyết khi xác nhận tồn kho・hủy bỏ lúc giao hàng của chuyến giao ES là tình huống khác | REQ-PO-413 (K-15) |
| 5-6 | Báo cáo kiểm kê của Web doanh nghiệp **hỗ trợ chiều rộng smartphone** | Sổ cái H |
| 5-7 | Cơ sở không khai báo: **không giữ lại thanh toán. Cộng phí thủ tục ¥3,000**. **Phán định vào ngày 25** (chốt chính thức của vận hành). Không cộng cho cơ sở mà vận hành nhập thay trong ngày 21〜25. Chỉ cộng cho cơ sở mà đến ngày 25 vẫn chưa có số lượng | Sổ cái H (hong trả lời 2026-10-05), REQ-PO-414 |
| 5-8 | Nhắc nhở hằng tuần. **Không gửi cho cơ sở đang tạm dừng**・cũng không coi là chưa khai báo | Sổ cái H |
| 5-9 | Cơ sở **"không kiểm kê"** (cũ: không kiểm tra tồn kho) (thiết lập theo từng cơ sở): không tính hao hụt quản lý・không nhắc nhở・không phí thủ tục. Màn hình vận hành hiển thị "Không kiểm tra" | Danh sách vấn đề 2-1 (2026/10/02) |
| 5-10 | Hợp đồng **"mua đứt món ăn kèm"** nằm ngoài đối tượng quản lý tồn kho (không kiểm kê・không phí thủ tục・không hao hụt quản lý) | REQ-CT-305, REQ-PO-414 |
| 5-11 | **Bắt đầu tạm dừng**: vào tháng có lần giao cuối cùng trước khi tạm dừng, khách hàng thực hiện báo cáo kiểm kê. Quyết toán thực tích phần cho đến lúc đó. Không quyết toán trong thời gian tạm dừng. Chênh lệch của phần bán được trong thời gian tạm dừng (để nguyên thiết bị) được quyết toán bằng kiểm kê khi tiếp tục (nếu không tiếp tục mà hủy hợp đồng thì khi hủy hợp đồng) | Sổ cái E・K |
| 5-12 | Hủy hợp đồng: tồn kho còn lại được ghi vào hóa đơn cuối cùng dưới dạng **mua lại** theo tồn kho tính toán × đơn giá bán | STEP3 còn lại S4-2 |

## 6. Hao hụt quản lý và quyết toán thực tích

| # | Quy định | Căn cứ |
|---|---|---|
| 6-1 | Hao hụt quản lý = (tồn kho lý thuyết − tồn kho thực), quy ra tiền theo **giá chuẩn trước khi điều chỉnh giá**. Thanh toán phần vượt quá **số tiền miễn trừ** của gói (ví dụ: 300 yên với gói 100). Phần trong phạm vi do ES chịu | REQ-PO-415 |
| 6-2 | Hủy bỏ do hết hạn sử dụng, về nguyên tắc không thanh toán | REQ-PO-416 |
| 6-3 | Hạng mục của quyết toán thực tích có 3: **hao hụt quản lý・chênh lệch thu tiền mặt・chênh lệch điều chỉnh giá**. Chốt theo từng hạng mục, cả 3 đều bắt buộc (cũng xác nhận và chốt trường hợp không có đối tượng). Điều chỉnh tồn kho là tùy chọn | 28-144 ⑤・28-145 ⑦ |
| 6-4 | Tháng đã chốt quyết toán thực tích thì không sửa được điều chỉnh tồn kho. Lỗi phát hiện sau được bù trừ bằng quyết toán thực tích của tháng sau | 28-121 |
| 6-5 | Tồn kho・báo cáo kiểm kê・quyết toán thực tích khi chốt thì **lưu bản sao theo từng tháng**, các tháng quá khứ chỉ tham chiếu bản sao đó để hiển thị | 28-125 |
| 6-6 | Cách thanh toán (thời điểm・chứng từ) xem `40_Master_Phí_Thanh_toán/Quy_tắc_thanh_toán_Đặc_tả_v1.md` | — |

## 7. Quản lý tồn kho của vận hành (tồn kho cơ sở)

| # | Quy định | Căn cứ |
|---|---|---|
| 7-1 | Menu là "Quản lý tồn kho". Danh sách = danh sách tồn kho, chi tiết = chi tiết tồn kho (kết quả báo cáo kiểm kê: trạng thái・ngày khai báo・người khai báo・phương pháp), chỉnh sửa = điều chỉnh tồn kho | 28-120 |
| 7-2 | Trước kiểm kê chỉ hiển thị tồn kho tính toán, sau kiểm kê hiển thị cả số khai báo và chênh lệch (hao hụt quản lý) | 28-119 |
| 7-3 | **Điều chỉnh tồn kho do quản lý hệ thống của vận hành thực hiện thủ công**: di chuyển tồn kho giữa các cơ sở (nơi đi −/nơi đến +), đổi hàng hư hỏng・lỗi. **Bắt buộc có lý do・để lại lịch sử** (biết người đăng ký). **Lưu xong phản ánh ngay** (không đơn đăng ký・phê duyệt). Không điều chỉnh do doanh nghiệp trả hàng. **Di chuyển vượt cơ sở của doanh nghiệp khác do khách hàng tự di chuyển, hệ thống không tính chi phí** (Sổ cái N) | REQ-PO-419・419b・601, 28-121 |
| 7-4 | Có thể chọn nhiều cơ sở để **điều chỉnh tồn kho hàng loạt** | 28-126 |
| 7-5 | **Tỷ lệ chênh lệch** = (lý thuyết − khai báo) ÷ lý thuyết. **Giá trị tuyệt đối từ 10% trở lên** thì tô màu (cả âm). **Tỷ lệ hủy bỏ = hủy bỏ ÷ (tồn kho lần trước + giao hàng)** (công thức này ở mọi màn hình・Sổ cái H) cũng tô màu khi từ 10% trở lên. Màn hình hiển thị là 2 màn hình **điều chỉnh tồn kho và chốt quyết toán thực tích**. Ngưỡng tạm thời cố định 10% | Danh sách vấn đề 2-1・4a (2026/10/02・10/03) |
| 7-6 | Vận hành xác nhận ứng viên thanh toán. Các dòng không có cảnh báo có thể **chọn nhiều dòng để chốt hàng loạt** | Danh sách vấn đề 2-1, 28-127 |
| 7-7 | Chọn được tháng đối tượng (giá trị ban đầu = tháng hiện tại. Tháng quá khứ chỉ tham chiếu). Tìm kiếm: tháng đối tượng・doanh nghiệp・cơ sở・kiểm kê (trước・sau)・quyết toán thực tích (đã chốt・chưa chốt) | 28-120 |
| 7-8 | Số bán = số bán được ở app trừ đi số đã hoàn tiền | Danh sách vấn đề 4a-3 (2026/10/03) |
| 7-9 | Khi tỷ lệ hủy bỏ vượt 3% thì cảnh báo trên dashboard (không hiển thị popup) | REQ-PO-416 |

## 8. Các con số chính

| Mục | Giá trị |
|---|---|
| Chờ thanh toán | 30 phút (thông báo khoảng mỗi 15 phút) |
| Kỳ kiểm kê | Ngày 21〜ngày 20 tháng sau |
| Hạn chốt khai báo của khách hàng | Ngày 20 (ngày 21〜25 vận hành nhập thay) |
| Chốt chính thức của vận hành・phán định phí thủ tục | Ngày 25 |
| Chốt thanh toán | Ngày 25 |
| Phí thủ tục (chưa kiểm tra) | ¥3,000 |
| Số tiền miễn trừ hao hụt quản lý | Theo từng gói (ví dụ: 300 yên với gói 100) |
| Tô màu tỷ lệ chênh lệch・tỷ lệ hủy bỏ | 10% (tạm) |
| Cảnh báo tỷ lệ hủy bỏ | Vượt 3% |
| Tỷ lệ sắp hết | Theo từng gói ở master gói |

## 9. Những điều chưa quyết định

| # | Nội dung | Trạng thái |
|---|---|---|
| U3 | Giá trị tỷ lệ sắp hết (theo từng gói) | Quyết định khi vận hành |
