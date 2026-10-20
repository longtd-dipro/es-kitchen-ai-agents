> Bản dịch tiếng Việt của `ja/01_仕様/60_在庫/在庫.md` (nguồn es-station, bản 2026-10-20). Khi khác nhau, bản tiếng Nhật và `docs/決定台帳.md` là chuẩn.

# Tồn kho (tồn kho kho hàng・tồn kho cơ sở・báo cáo kiểm kê・điều chỉnh tồn kho)

> **Nguồn chuẩn của chủ đề này.** Ngày 2026-10-05, viết lại mới chỉ gồm "những điều đang có hiệu lực hiện nay" từ các nguyên bản và quyết định bên dưới.
> Các quyết định đang có hiệu lực nằm ở `docs/決定台帳.md` (E・H・I・K・B). Nếu có mâu thuẫn thì sổ quyết định là chuẩn.
> Nguyên bản (đóng băng・chỉ để xem quá trình): `docs/議事録_仕様/在庫管理_仕様サマリ_顧客報告用.md`, `docs/議事録_仕様/発注仕入入荷_詳細要件仕様.md` §6・§7C-7・§7D・§7E, `00_決定/決定_STEP4回答_配送_20261001.md` (W1〜W7)・`決定_STEP5回答_法人Web_20261001.md` (kiểm tra tồn kho)・`決定_v2.3追補_申請まわり_20260928.md` §18 (28-118〜126).
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
| Báo cáo kiểm kê | Khai báo kiểm tra tồn kho của cơ sở (tên màn hình. Cũ: 「在庫点検の申告」(khai báo kiểm tra tồn kho)) |
| Hao hụt quản lý | Tồn kho lý thuyết − tồn kho thực (quy ra tiền, phần vượt quá số tiền miễn trừ thì xuất hóa đơn) |

## 2. Tồn kho kho hàng

| # | Quy định | Căn cứ |
|---|---|---|
| 2-1 | Tồn kho kho hàng = **điểm khởi đầu (số kiểm kê) + nhập kho − xuất hàng ± ghi nhận tồn kho**. Xuất hàng tính theo ngày xuất. Chỉ thị xuất hàng của mẫu kinh doanh được trừ sau khi chốt tiếp nhận và chỉ thị xuất hàng đã được tạo (mẫu đã tiếp nhận trước khi chốt thì không trừ) | Danh sách vấn đề 2-3・2-5 (2026/10/02), sổ quyết định S (#448) |
| 2-2 | Nhập kho nhập thủ công theo từng đơn đặt hàng (`55_発注・仕入・入荷/発注・仕入・入荷.md` §8) | Sổ quyết định I |
| 2-3 | Điều chỉnh tồn kho (tăng giảm) thực hiện ở **modal 「この商品を記録」(ghi nhận sản phẩm này) trong chi tiết tồn kho kho hàng** (chỉ sản phẩm. Kho・sản phẩm hiển thị cố định). Nhập tăng giảm (tăng／giảm) và số lượng (0〜999,999), ghi phân loại (hao hụt hàng NG・chênh lệch kiểm kê・gửi lại・nhập kho từ đặt hàng ngoài ES・khác. 「在庫戻し」(hoàn tồn kho) thì tự động khi tạo chỉ thị xuất hàng) và lý do. Bản ghi đã đăng ký không sửa được・không xóa được (sai thì bù trừ bằng phân loại 「その他」(khác)). **Không làm màn hình danh sách・thêm・nhập CSV của 「在庫の記録」(ghi nhận tồn kho)**. **Bản ghi giảm nhiều hơn tồn kho cũng không chặn** (tồn kho âm. Tồn kho dự kiến hiển thị chữ đỏ) | Sổ quyết định F 2026-10-07・10-08, sổ quyết định S (#448), STEP4 W1, REQ-PO-151 |
| 2-4 | 「在庫戻し」, 「棚卸しを登録」(đăng ký kiểm kê), 「CSV取込」(nhập CSV) là các nút ở phía trên bên phải màn hình tồn kho kho hàng (không đặt ở menu bên) | STEP4 W2, sổ quyết định F 2026-10-08 |
| 2-5 | Xuất hàng của tồn kho kho hàng tính theo ngày xuất hàng của chuyến (không hiển thị 「出荷のリードタイム」(lead time xuất hàng) ở chi tiết tồn kho kho hàng) | Sổ quyết định F 2026-10-07 (quy định màn hình vận hành C2) |
| 2-6 | **Hoàn tồn kho** (trả sản phẩm không dùng trong tháng sau về công ty): không có chức năng tạo thủ công đơn hàng sản phẩm. Tạo **chỉ thị xuất hàng không kèm đặt hàng** ở màn hình chuyên dụng và xuất cho THOMAS bằng CSV. Giá trị ban đầu của số lượng hoàn: **chỉ sản phẩm không dùng ở menu tiếp theo là "toàn bộ số dư・tick ON"** (sản phẩm sẽ dùng là 0・OFF. Chọn thủ công thì hoàn được) | REQ-PO-603, STEP4 W6 |
| 2-7 | Nơi trả về (ES trụ sở chính) đăng ký ở master kho với **phân loại kho = nơi trả về**. Không giữ tồn kho tại trụ sở chính | STEP4 W7 |
| 2-8 | **Tồn kho vật tư** giữ ở văn phòng ES và tất cả kho picking (tồn kho lý thuyết. Sửa bằng kiểm kê định kỳ). Vật tư đóng kèm không trừ khỏi tồn kho. **Kho của chuyến vật tư (xuất hàng cho đơn đặt vật tư của khách hàng) là kho picking của tuyến phân loại giao hàng 「資材」(vật tư) của cơ sở đó**, trừ từ tồn kho vật tư của kho đó. Điều chỉnh tồn kho vật tư thực hiện bằng 「調整」(điều chỉnh) ở tab 「資材の在庫」(tồn kho vật tư) của đặt hàng vật tư | Danh sách vấn đề 2-5, sổ quyết định F, REQ-PO-219, sổ quyết định S (#450) |
| 2-9 | **Nhập kiểm kê (điểm khởi đầu)**: vận hành đăng ký theo từng kho (không liên kết với THOMAS). Cả nhập trên màn hình (AW_WHS_006) và nhập CSV định dạng ES STATION (AW_WHS_007) đều có **cột 「対象」(đối tượng) (sản phẩm／vật tư)**, điểm khởi đầu của vật tư cũng nhập ở đây. **Quyền theo từng dòng**: dòng vật tư = quản lý tồn kho (vật tư), dòng sản phẩm = tạo (C) của quản lý tồn kho (món ăn kèm). Nếu có dòng của đối tượng mà người nhập không có quyền thì **báo lỗi dòng và dừng toàn bộ** (giống "ngoại lệ nhập CSV tồn kho kho hàng" ở sổ quyết định P). Chuẩn ngày đăng ký lần trước của ngày kiểm kê (E141) là **kho × đối tượng** (sản phẩm và vật tư dù cùng kho cũng có thể khác ngày kiểm kê). Nhập trên màn hình: sản phẩm để trống = 0, **vật tư để trống thì không đăng ký** | Sổ quyết định F 2026-10-08 (điểm khởi đầu của tồn kho kho hàng), sổ quyết định S (#447) |

## 3. Tăng giảm tồn kho cơ sở

| Tăng | Giảm |
|---|---|
| Giao hàng (**cộng dồn** theo từng chuyến. Không reset) | Mua ở app cá nhân・ESQR (hoàn tất thanh toán) |
| Vào do di chuyển tồn kho (vận hành) | Đăng ký hủy bỏ |
| Điều chỉnh tồn kho của vận hành (+) | Ra do di chuyển tồn kho・điều chỉnh tồn kho của vận hành (−) |

- Sau khi chốt kiểm kê, **ghi đè tồn kho lý thuyết bằng tồn kho thực** và làm điểm bắt đầu của kỳ tiếp theo (REQ-PO-418b).
- Chuyến hàng đến sau ngày kiểm kê **được đưa vào kiểm kê kế tiếp** (danh sách vấn đề 4a-11・2026/10/03).
- Hạn sử dụng・lô được giữ theo từng chuyến.
- **Khi chuyển sang hệ thống mới**: không khóa việc mua. Tồn kho lý thuyết bắt đầu từ 0, sản phẩm còn lại từ trước mua được bằng quét. Hiển thị ở Web doanh nghiệp 「最初の棚卸報告をしてください」(Vui lòng thực hiện báo cáo kiểm kê đầu tiên) cho đến khi báo cáo. **Không tính hao hụt quản lý cho đến báo cáo kiểm kê đầu tiên sau khi chuyển** (sổ quyết định N・hong 2026-10-05). **Sản phẩm không có tồn kho lý thuyết thì không hiển thị ở danh sách mua sắm** (chỉ quét) (~~cũ~~ thay thế ngày 2026-10-08: cho đến lần kiểm kê đầu tiên cũng hiển thị giống giai đoạn 1 hiện nay 〈menu của 2 tháng〉. Sổ quyết định O "hiển thị menu trước lần kiểm kê đầu tiên"). Khi tính được tồn kho lý thuyết nhờ báo cáo kiểm kê thì sản phẩm có tồn kho sẽ hiển thị. Khách hàng hiện có thì nhập dữ liệu giao hàng tháng 2 để tính tồn kho lý thuyết, báo cáo kiểm kê từ 15/2〜20/3 (bắt buộc), cuối tháng vận hành điều chỉnh tồn kho, chuyển sang quyết toán thực tích tháng 4 (sổ quyết định N・hong 2026-10-06).

## 4. Mua ở app cá nhân・ESQR và tồn kho (điểm chính)

Diễn biến chi tiết・hình・ví dụ xem `Flow tồn kho_for dev.md`.

| # | Quy định |
|---|---|
| 4-1 | Chỉ bỏ vào giỏ hàng thì không làm thay đổi tồn kho. **Đơn hàng (trước khi thanh toán) thì giữ tạm**, **hoàn tất thanh toán thì trừ tồn kho lý thuyết** |
| 4-2 | Chờ thanh toán **30 phút** (thông báo khoảng mỗi 15 phút). Quá hạn・thất bại・hủy → gỡ giữ tạm |
| 4-3 | Hoàn tiền sau khi hoàn tất thanh toán: **chỉ khi** API hoàn tiền của công ty thanh toán **thành công** thì tự động cộng số lượng sản phẩm đã hoàn tiền vào tồn kho lý thuyết của cơ sở nơi mua. Thất bại・không rõ kết quả thì không thay đổi tồn kho. Chạy hai lần cũng không cộng hai lần. Chi tiết xem `85_購入・決済/購入・決済・返金.md` |
| 4-4 | Số lượng mua từ menu・lịch sử mua・yêu thích **tối đa đến tồn kho khả dụng** |
| 4-5 | **Mua bằng quét là ngoại lệ**: 1 lần 1 cái・không đổi được số lượng・không kiểm tra tồn kho (coi như hàng thật có sẵn). Tồn kho lý thuyết được phép âm |
| 4-6 | Tồn kho khả dụng từ 0 trở xuống: **không hiển thị** ở menu／hiển thị ở lịch sử mua・yêu thích nhưng với dòng 「次回の登場をご期待ください。」(Hãy chờ đón lần xuất hiện tiếp theo.), không xem chi tiết・không bỏ vào giỏ được／mua được bằng quét. Sản phẩm hết hàng trong giỏ sẽ bị xóa khi mở lại app |
| 4-7 | **「残りわずか」(sắp hết)**: ngưỡng = làm tròn xuống (số đơn hàng của cơ sở đó × tỷ lệ sắp hết). Hiển thị khi tồn kho khả dụng > 0・ngưỡng ≥ 1・tồn kho khả dụng ≤ ngưỡng. Tỷ lệ đặt theo từng gói ở master gói. Không hiển thị số còn lại. Doanh nghiệp không bật/tắt được. Đã bỏ quy định "gói 100 trở xuống không hiển thị" |
| 4-8 | Khi vận hành sửa thủ công từ 「キャンセル」(hủy) sang 「支払済」(đã thanh toán) thì bắt buộc có lý do・để lại log |

## 5. Báo cáo kiểm kê (kiểm tra tồn kho của cơ sở)

| # | Quy định | Căn cứ |
|---|---|---|
| 5-1 | **1 lần mỗi tháng**. Kỳ đối tượng là **ngày 21〜ngày 20 tháng sau** | REQ-PO-413, STEP3 bổ sung P7 |
| 5-2 | Người thực hiện: **cơ sở chuyến COOL = khách hàng (Web doanh nghiệp)**. **Cơ sở chuyến giao ES = tài xế** (xác nhận tồn kho・hủy bỏ khi giao hàng) + **doanh nghiệp・cơ sở cũng có thể báo cáo ở Web doanh nghiệp** (xem báo cáo của tài xế, đếm lại và báo cáo lại được). 【Thay thế bằng sổ quyết định V ngày 2026-10-12: kiểm kê của tài xế và báo cáo của doanh nghiệp đều chỉ để tham khảo. Người chốt số lượng là nhập thay của quản lý hệ thống (vận hành) (cơ sở chuyến COOL cũng vậy: doanh nghiệp báo cáo, vận hành cũng có thể nhập thay). Số mà quyết toán thực tích dùng là số do vận hành chốt = nếu có nhập thay thì là số đó, nếu không thì là báo cáo cuối cùng】~~Nếu cả hai đều có trong cùng tháng thì báo cáo cuối cùng có hiệu lực~~ | STEP3 còn lại S10, sổ quyết định "báo cáo kiểm kê: doanh nghiệp nhập cho cơ sở chuyến giao ES" (hong trả lời 2026-10-05) |
| 5-3 | Khách hàng có thể **khai báo lại nhiều lần đến ngày 20** (cái cuối cùng có hiệu lực. Nhập được cả trước ngày chốt). **Từ ngày 21, vận hành thêm・sửa thay** | Sổ quyết định H |
| 5-3b | Số kiểm kê **tự động phản ánh vào tồn kho lý thuyết mà không chờ nút của vận hành**: **ngày 25, hoặc khi chốt quyết toán thực tích, tùy cái nào sớm hơn**. Số = nếu có nhập thay của vận hành thì là số đó, nếu không thì là báo cáo cuối cùng (sổ quyết định V・2026-10-12). 「確認済」(đã xác nhận) chỉ là dấu. Sau khi phản ánh, cho đến khi chốt quyết toán thực tích vẫn có thể ghi đè bằng nhập thay・báo cáo lại, và tồn kho lý thuyết cũng được sửa |  Sổ quyết định V |
| 5-4 | Màn hình **hiển thị danh sách sản phẩm, nhập số lượng cho toàn bộ rồi hoàn tất** (sản phẩm không có thì 0). Sản phẩm không có trong danh sách thì thêm bằng quét. **Sản phẩm hủy bỏ** cũng đăng ký ở đây. Cũng kiểm tra sản phẩm đang trên đường đến. 〔Thay thế ngày 2026-10-18 bằng sổ quyết định AT・sổ tiếp nhận #810・#811・#826: báo cáo kiểm kê của Web doanh nghiệp là **thẻ 1 sản phẩm = 1 dòng** (ảnh・tên sản phẩm〔bấm vào thì mở cửa sổ nhỏ chi tiết〕・nhập ± số hiện có／số đã bỏ. Máy tính 2〜3 cột, smartphone 1 cột). **Không hiển thị kiểm kê lần trước・đang giao・sẽ hủy bỏ・số đã đến**. Sản phẩm không có thì hoàn tất bằng 0. **Sản phẩm không có trong danh sách thì thêm bằng 「商品を追加」(thêm sản phẩm)** (số lượng 0〜999,999). Sản phẩm thu hồi bằng hàng thay thế thì có dấu nhỏ ở dòng. **Bỏ cột 「届いた数」(số đã đến), hàng đang giao được tính như đã đến**: E327 là số hiện có + số đã bỏ ≦ số lần trước + số đã giao 〈bao gồm đang giao〉 + điều chỉnh tồn kho của vận hành. Không có cảnh báo E321 (W314). Chỉ dòng lỗi E327 mới hiển thị số lần trước・số đã giao. Nhập thay của vận hành (AW_STCK_005) cũng vậy〕 | Sổ quyết định E (danh sách vấn đề 4-6), REQ-PO-155・sổ quyết định AT |
| 5-5 | Kiểm kê・bảng kiểm tra hằng tháng **không hiển thị số tồn kho lý thuyết** (chỉ nhập tồn kho thực). Bảng kiểm tra xuất được bằng PDF. Việc tài xế chuyến giao ES xem tồn kho lý thuyết khi xác nhận tồn kho・hủy bỏ lúc giao hàng là tình huống khác | REQ-PO-413 (K-15) **(hong trả lời 2026-10-16: cho tài xế xem tồn kho lý thuyết và dùng làm giá trị ban đầu. Không cho doanh nghiệp・cơ sở xem. Sổ quyết định 2026-10-07・sổ tiếp nhận #707)** |
| 5-6 | Báo cáo kiểm kê của Web doanh nghiệp **hỗ trợ chiều rộng smartphone**. Ở màn hình smartphone có dải nút cố định phía dưới, nút chatbot được đặt phía trên dải đó (không chồng lên nút + của báo cáo kiểm kê) 〔trường hợp chồng lên nút + của thẻ đầu tiên ngay sau khi mở trên smartphone thì đang xác nhận vị trí đặt〕 | Sổ quyết định H・AT #826 |
| 5-6b | Kiểm kê trên app tài xế cũng tính 「お届け中」(đang giao) như đã đến (giống Web doanh nghiệp・nhập thay của vận hành. Không giữ số đã đến). Tồn kho lý thuyết ở STEP2 của chuyến giao ES là tồn kho trước lần giao này nên không cộng phần đang giao (phần hiện đang chở) | Sổ quyết định AT・sổ tiếp nhận #826 |
| 5-7 | Cơ sở không khai báo: **không giữ lại hóa đơn. Cộng phí thủ tục ¥3,000**. **Phán định vào ngày 25** (chốt chính thức của vận hành). Không cộng cho cơ sở mà vận hành nhập thay trong ngày 21〜25. Chỉ cộng cho cơ sở mà đến ngày 25 vẫn chưa có số lượng 〔sổ quyết định AS・sổ tiếp nhận #766 ngày 2026-10-18: phán định theo **ngày nhập đầu tiên**. Cơ sở đã báo cáo trước hạn (23:59 ngày 25) thì dù sau đó vận hành sửa bằng nhập thay cũng không cộng. Cơ sở chưa từng báo cáo, vận hành nhập thay sau hạn thì cộng〕 | Sổ quyết định H (hong trả lời 2026-10-05), REQ-PO-414 **(hong trả lời 2026-10-16: chỉ chu kỳ đầu tiên sau khi phát hành thì cũng miễn phí thủ tục〔sổ quyết định P〕. Nếu kiểm kê lần đầu quá 3/20 thì không miễn, cộng ¥3,000. Trường hợp nào vận hành cũng có thể gỡ・sổ tiếp nhận #707)** |
| 5-8 | Mail nhắc nhở **1 lần, 3 ngày làm việc trước ngày chốt (ngày 20)** (theo ngày làm việc・không cố định ngày. Thay đổi từ ~~9:00 của 1 ngày làm việc trước~~ theo hong trả lời 2026-10-16・sổ quyết định AL). Chỉ cơ sở chưa báo cáo. **Cũng không gửi cho cơ sở đang dùng thử**. Người nhận là **người phụ trách chính・phụ (không bao gồm người phụ trách hóa đơn)**. Hiển thị nhắc nhở trên màn hình giữ như trước. **Không gửi cho cơ sở đang tạm dừng・không kiểm kê・mua đứt món ăn kèm・ngoài đối tượng quyết toán thực tích・chuyến giao ES mà tài xế đã kiểm kê**・cũng không coi là chưa khai báo. Không đặt nút đôn đốc | Sổ quyết định H |
| 5-9 | Cơ sở **「棚卸なし」(không kiểm kê)** (cũ: không kiểm tra tồn kho) (thiết lập theo từng cơ sở): không tính hao hụt quản lý・không nhắc nhở・không phí thủ tục. Màn hình vận hành hiển thị 「点検なし」(không kiểm tra) | Danh sách vấn đề 2-1 (2026/10/02) |
| 5-10 | Hợp đồng **「惣菜買取」(mua đứt món ăn kèm)** nằm ngoài đối tượng quản lý tồn kho (không kiểm kê・không phí thủ tục・không hao hụt quản lý) | REQ-CT-305, REQ-PO-414 |
| 5-11 | **Bắt đầu tạm dừng・đang tạm dừng・tiếp tục**: báo cáo kiểm kê **đều là tùy ý** (2026-10-06). Khi báo cáo lúc bắt đầu tạm dừng thì vào tháng có lần giao cuối cùng trước khi tạm dừng, khách hàng thực hiện báo cáo kiểm kê và quyết toán thực tích phần cho đến lúc đó. Không quyết toán trong thời gian tạm dừng. Chênh lệch của phần bán được trong thời gian tạm dừng (để nguyên thiết bị) được quyết toán nếu có báo cáo kiểm kê khi tiếp tục (nếu không tiếp tục mà hủy hợp đồng thì khi hủy hợp đồng). Khi không có báo cáo, vận hành có thể chọn 「スキップ」(bỏ qua) ở màn hình phê duyệt tạm dừng・tiếp tục (lý do là tùy ý). Mốc đã bỏ qua thì không có hao hụt quản lý・phí thủ tục. Tồn kho bắt đầu lại từ 0 kể từ tháng chu kỳ tiếp tục (không dùng kiểm kê trước khi tạm dừng. Báo cáo kiểm kê đầu tiên sau khi tiếp tục là số bắt đầu. Sổ quyết định F・sổ tiếp nhận #580. Cũ: lý do bắt buộc・chênh lệch quyết toán bằng báo cáo kiểm kê kế tiếp = No.168) | Sổ quyết định E・K |
| 5-12 | Hủy hợp đồng: tồn kho còn lại do doanh nghiệp chọn 「全て買取」(mua lại toàn bộ) hoặc 「返却（全部・元払い）」(trả lại〈toàn bộ・người gửi trả phí〉) trong đơn hủy hợp đồng. **Mua lại** thì ghi vào hóa đơn cuối cùng theo tồn kho tính toán × đơn giá bán. **Trả lại** thì không tạo dòng mua lại và cũng không tính hao hụt quản lý. Tồn kho lý thuyết do vận hành sửa bằng điều chỉnh tồn kho hiện có (không làm màn hình 「返却受入」(tiếp nhận hàng trả). Sổ quyết định L・sổ tiếp nhận No.167). Trường hợp nào báo cáo kiểm kê cuối cùng cũng bắt buộc | STEP3 còn lại S4-2 |
| 5-13 | **Dùng thử → triển khai chính thức**: tồn kho ban đầu **reset về 0** rồi bắt đầu. Trước khi tồn kho triển khai chính thức đến, đưa phần còn lại về 0 (mua lại hoặc xử lý). Khách chưa đưa về 0 được thì vận hành hỏi và điều chỉnh tồn kho riêng (2026/10/06). **Việc reset do hệ thống tự động thực hiện khi chuyển đổi** (hong trả lời A ngày 2026/10/12. Sổ tiếp nhận #525). Kiểm kê trong thời gian dùng thử không dùng làm số lần trước (stockFrom của cơ sở) | Sổ tiếp nhận #203・#525 |
| 5-14 | **Kiểm kê lần đầu sau khi phát hành giai đoạn 2 (2/16)**: cần kiểm kê lần đầu để bắt đầu quản lý tồn kho nhưng **không đưa vào quyết toán thực tích**. Chốt chính thức bằng kiểm kê tháng 3. Chuyến giao ES thì tài xế kiểm kê khi giao hàng ngày 2/16, chuyến cool thì doanh nghiệp kiểm kê. Hiển thị menu trước kiểm kê giống giai đoạn 1 (hiển thị menu của 2 tháng) (hong trả lời A ngày 2026/10/08. Cũ: thay thế "sản phẩm không có tồn kho lý thuyết thì không hiển thị ở danh sách" ngày 2026/10/06. Dòng này được ưu tiên hơn mô tả tương tự ở các dòng khác). **Hạn kiểm kê đến 3/20** (hong trả lời 2026/10/12・sổ tiếp nhận #526). Phí thủ tục (¥3,000) khi quá hạn cũng áp dụng cho kiểm kê lần đầu (hong trả lời 2026/10/12. Phán định vào ngày 25 giống hằng tháng). Hiển thị menu trước kiểm kê đến 3/20. Sau 3/20 thì hiển thị theo tồn kho (sổ tiếp nhận #527). Số kiểm kê lần đầu là số bắt đầu, không tính hao hụt quản lý (StockCheck.initial) | Sổ tiếp nhận #204・#209 |

## 6. Hao hụt quản lý và quyết toán thực tích

| # | Quy định | Căn cứ |
|---|---|---|
| 6-1 | Hao hụt quản lý = (tồn kho lý thuyết − tồn kho thực), quy ra tiền theo **giá chuẩn trước khi điều chỉnh giá**. Xuất hóa đơn phần vượt quá **số tiền miễn trừ** của gói (ví dụ: 300 yên với gói 100). Phần trong phạm vi do ES chịu | REQ-PO-415 |
| 6-2 | Hủy bỏ do hết hạn sử dụng, về nguyên tắc không xuất hóa đơn | REQ-PO-416 |
| 6-3 | Hạng mục của quyết toán thực tích có 3: **hao hụt quản lý・chênh lệch thu tiền mặt・chênh lệch điều chỉnh giá**. Chốt theo từng hạng mục, cả 3 đều bắt buộc (cũng xác nhận và chốt trường hợp không có đối tượng). Điều chỉnh tồn kho là tùy ý | 28-144 ⑤・28-145 ⑦ |
| 6-4 | Tháng đã chốt quyết toán thực tích thì không sửa được điều chỉnh tồn kho. Lỗi phát hiện sau được bù trừ bằng ③ điều chỉnh trên hóa đơn của tháng sau (sổ quyết định AL・2026-10-16. Cũ: bù trừ bằng quyết toán thực tích của tháng sau) | 28-121 |
| 6-5 | Tồn kho・báo cáo kiểm kê・quyết toán thực tích khi chốt thì **lưu bản sao theo từng tháng**, các tháng quá khứ chỉ tham chiếu bản sao đó để hiển thị | 28-125 |
| 6-6 | Cách xuất hóa đơn (thời điểm・chứng từ) xem `40_マスタ・料金・請求/請求ルール_仕様_v1.md` | — |

## 7. Kiểm kê của vận hành (tồn kho cơ sở)

| # | Quy định | Căn cứ |
|---|---|---|
| 7-1 | Tên màn hình là **「棚卸し（拠点在庫）」(kiểm kê〈tồn kho cơ sở〉)** (cũ: menu 「在庫管理」(quản lý tồn kho)・danh sách = danh sách tồn kho・chỉnh sửa = điều chỉnh tồn kho. Sổ quyết định F 2026-10-07). Màn hình con là **chi tiết tồn kho** (kết quả báo cáo kiểm kê: trạng thái・ngày khai báo・người khai báo・phương pháp)／**điều chỉnh tồn kho**／**điều chỉnh tồn kho (hàng loạt)**. **Quyền**: điều chỉnh tồn kho (từng cái・hàng loạt) **chỉ dành cho toàn quyền・quản lý hệ thống**. Nhập thay và 「確認済にする」(đánh dấu đã xác nhận) dành cho **toàn quyền・CS・logistics** (「廃棄入力」(nhập hủy bỏ) trong bảng quyền = R/U. Chi tiết có thể điều chỉnh sau ở màn hình quyền). Không đặt hủy, sai thì sửa bằng điều chỉnh theo chiều ngược lại. **Không đặt 「督促を送る」(gửi đôn đốc)** (chỉ có nhắc nhở tự động hằng tuần). Danh sách: thứ tự ban đầu theo ID cơ sở tăng dần・bộ lọc 「棚卸」(kiểm kê) là tất cả／trước kiểm kê／sau kiểm kê／không kiểm kê・tìm kiếm theo tên cơ sở・ID cơ sở・số hợp đồng con | 28-120, sổ quyết định F (2026-10-07 tên màn hình・quyền・điều chỉnh của kiểm kê〈tồn kho cơ sở〉／2026-10-08 quyền nhập thay tồn kho・đánh dấu đã xác nhận) |
| 7-2 | Trước kiểm kê chỉ hiển thị tồn kho tính toán, sau kiểm kê hiển thị cả số khai báo và chênh lệch (hao hụt quản lý) | 28-119 |
| 7-3 | **Điều chỉnh tồn kho do quản lý hệ thống của vận hành thực hiện thủ công**: di chuyển tồn kho giữa các cơ sở (nơi đi −／nơi đến +), đổi hàng hư hỏng・lỗi. **Lý do là tùy ý (để trống vẫn lưu được. Dòng có số lượng trống thì dù chỉ có lý do cũng bị bỏ qua)・để lại lịch sử** (biết người đăng ký. Khi lý do trống thì hiển thị 「—」. Sổ quyết định W). **Lưu xong phản ánh ngay** (không đơn đăng ký・phê duyệt). Không điều chỉnh do doanh nghiệp trả hàng. **Di chuyển vượt cơ sở của doanh nghiệp khác do khách hàng tự di chuyển, hệ thống không tính chi phí** (sổ quyết định N) | REQ-PO-419・419b・601, 28-121 |
| 7-4 | Có thể chọn nhiều cơ sở để **điều chỉnh tồn kho hàng loạt** (điều chỉnh tồn kho (hàng loạt)). **Nhập theo tab của từng cơ sở, lưu theo từng tab (cơ sở)** (không lưu thời gian thực). Tab đã lưu được gắn ✓ và cố định nội dung nhập, vẫn ở lại cùng màn hình (lưu hết các tab hoặc bấm 「キャンセル」(hủy) thì quay về danh sách). **Ô lý do theo từng tab (cơ sở) (tùy ý)**. Cơ sở đã chốt・đã xuất hóa đơn thì không lưu được tab đó (lỗi). Không dùng "chỉ đăng ký một phần và bỏ qua phần còn lại". Điều chỉnh có thể chọn từ toàn bộ sản phẩm (di chuyển giữa các cơ sở thì nhập riêng −／+) | 28-126, sổ quyết định F (2026-10-08 lưu・sau khi lưu và ô lý do của điều chỉnh tồn kho (hàng loạt)) |
| 7-5 | **Tỷ lệ chênh lệch** = (lý thuyết − khai báo) ÷ lý thuyết. **Giá trị tuyệt đối từ 10% trở lên** thì tô màu (cả âm). **Tỷ lệ hủy bỏ = hủy bỏ ÷ (tồn kho lần trước + giao hàng)** (công thức này ở mọi màn hình・sổ quyết định H) cũng tô màu khi từ 10% trở lên. Màn hình hiển thị là 2 màn hình **điều chỉnh tồn kho và chốt quyết toán thực tích**. Ngưỡng tạm thời cố định 10% | Danh sách vấn đề 2-1・4a (2026/10/02・10/03) |
| 7-6 | Vận hành xác nhận ứng viên hóa đơn. Các dòng không có cảnh báo có thể **chọn nhiều dòng để chốt hàng loạt** | Danh sách vấn đề 2-1, 28-127 |
| 7-7 | Chọn được tháng đối tượng (giá trị ban đầu = tháng hiện tại. Tháng quá khứ chỉ tham chiếu). Tìm kiếm: tháng đối tượng・doanh nghiệp・cơ sở・kiểm kê (trước・sau)・quyết toán thực tích (đã chốt・chưa chốt) | 28-120 |
| 7-8 | Số bán = số bán được ở app trừ đi số **đã hoàn tiền**. 「返金中」(đang hoàn tiền) thì không trừ. Khi API hoàn tiền thành công thì tự động cộng số lượng sản phẩm đã hoàn tiền vào tồn kho lý thuyết của cơ sở nơi mua. Khi API thất bại hoặc không rõ kết quả thì không thay đổi trạng thái・tồn kho. Chạy hai lần không cộng hai lần | Danh sách vấn đề 4a-3, hong trả lời 2026-10-09 |
| 7-9 | Khi tỷ lệ hủy bỏ vượt 3% thì cảnh báo trên dashboard (không hiển thị popup) | REQ-PO-416 |
| 7-10 | Bỏ thao tác 「申告を取り込み」(lấy khai báo vào) của kiểm kê. Trạng thái đã báo cáo chỉ được quyết định bằng báo cáo kiểm kê (bao gồm nhập thay của vận hành) | Sổ quyết định AS・sổ tiếp nhận #775 |

## 8. Các con số chính

| Mục | Giá trị |
|---|---|
| Chờ thanh toán | 30 phút (thông báo khoảng mỗi 15 phút) |
| Kỳ kiểm kê | Ngày 21〜ngày 20 tháng sau |
| Hạn chốt khai báo của khách hàng | Ngày 20 (ngày 21〜25 vận hành nhập thay) |
| Chốt chính thức của vận hành・phán định phí thủ tục | Ngày 25 |
| Chốt hóa đơn | Ngày 25 |
| Phí thủ tục (chưa kiểm tra) | ¥3,000 |
| Số tiền miễn trừ hao hụt quản lý | Theo từng gói (ví dụ: 300 yên với gói 100) |
| Tô màu tỷ lệ chênh lệch・tỷ lệ hủy bỏ | 10% (tạm) |
| Cảnh báo tỷ lệ hủy bỏ | Vượt 3% |
| Tỷ lệ sắp hết | Theo từng gói ở master gói |

## 9. Những điều chưa quyết định

| # | Nội dung | Trạng thái |
|---|---|---|
| U3 | Giá trị tỷ lệ sắp hết (theo từng gói) | Quyết định khi vận hành |

## Lịch sử thay đổi

| Ngày họp | Đối tượng (mục・REQ) | Trước thay đổi | Sau thay đổi | Lý do thay đổi | Căn cứ (MM・thời điểm) | Trạng thái |
|---|---|---|---|---|---|---|
| 2026/10/06 | 5-12 Tồn kho sau khi hủy hợp đồng | Ghi vào hóa đơn cuối cùng dưới dạng mua lại | Doanh nghiệp chọn mua lại／trả lại. Trả lại thì vận hành điều chỉnh tồn kho. Bắt buộc kiểm kê tháng hủy hợp đồng | Vận hành thực tế của khách hàng | 〔MM_20261006_1200 ［00:28:24〜00:45:21］〕 | 実装待ち (chờ triển khai) |
| 2026/10/06 | 5-13 (mới) | — | Dùng thử → triển khai chính thức thì tồn kho ban đầu là 0 | Vận hành của khách hàng | 〔MM_20261006_1200 ［01:39:48］〕 | 実装待ち |
| 2026/10/07 | 5-14 (mới) | — | Kiểm kê lần đầu không đưa vào quyết toán thực tích (2 giai đoạn) | Chuyển đổi khi phát hành | 〔MM_20261006_1200 ［02:27:01］、MM_20261007_1301 ［00:15:25］〕 | 実装待ち |
