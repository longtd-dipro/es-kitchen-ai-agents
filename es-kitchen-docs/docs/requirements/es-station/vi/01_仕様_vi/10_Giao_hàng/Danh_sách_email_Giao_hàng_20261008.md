> Bản dịch tiếng Việt của `ja/01_仕様/10_配送/メール一覧_配送_20261008.md` (nguồn es-station, bản 2026-10-20). Khi khác nhau, bản tiếng Nhật và `docs/決定台帳.md` là chuẩn.

# Danh sách email (vận hành D giao hàng) 2026/10/08【hong đã xác nhận 2026-10-08】

> Người soạn: Claude (hong chỉ thị 2026-10-08・S-8, sổ quyết định E "Định nghĩa email của vận hành D", sổ tiếp nhận No.308). Cùng dạng với danh sách email đăng ký・đơn yêu cầu (`../30_申請/メール一覧_申込・申請_20261001.md`) và danh sách email đặt hàng・nhà cung cấp・nhập kho (`../30_申請/メール一覧_発注・仕入先・入荷_20261001.md`).
> **ID email là đề xuất**: số lớn nhất hiện có là **M13** (danh sách đăng ký・đơn yêu cầu. Ngoài ra có X1〜X18, S1〜S11, N1〜N5). Tài liệu này dùng **M14〜M37** (M9 là "配送停止のお知らせ" (Thông báo dừng giao hàng) đã có nên dùng lại). `MessageList_MAIL_20261001.csv` không có dòng số M nên không trùng. Khi hong chấp nhận thì đánh No. của sheet "メール" (Email) trong Excel sau.
> **Thật hay chỉ thông báo**: theo sổ quyết định E #105 (2026-10-05), **hiện tại chỉ soạn nội dung, không gửi email thật**. Lưu vào bản ghi thông báo `dm.notice.notifications` với "kênh email". Cái chỉ là thông báo trên màn hình thì ghi "chỉ màn hình".
> **Trạng thái**: hong đã xác nhận (2026-10-08 "ừa cám ơn" → các mục cần xác nhận bên dưới được xử lý theo đúng khuyến nghị). Ban đầu là "Claude案" (đề xuất của Claude). Chỗ nào đặc tả không có quy định thì không bịa ra mà ghi "**要確認**" (cần xác nhận), gom lại ở mục cuối "Những điều muốn hong xác nhận".
> 【 】 là giá trị được chèn vào. Nội dung văn bản là bản đề xuất.

## 0. Quy định chung (giống danh sách hiện có)

| Mục | Quy định | Nguồn |
|---|---|---|
| Người gửi・tiêu đề | Người gửi là giá trị cài đặt (giá trị ban đầu "ESキッチン運営事務局 <no-reply@es-kitchen.jp>"). Tiêu đề khi gửi được gắn "【ESステーション】" ở đầu (tiêu đề bên dưới ghi ở dạng đã gắn). Ngoại lệ: yêu cầu báo giá (M28) thì 配送_01 đã quy định dạng cố định bắt đầu bằng "ESキッチン" → cần xác nhận (xác nhận 6) | Sổ quyết định E 2026-10-05 (N5・giá trị mặc định), 配送_01 §3-3 |
| Câu mở đầu・chữ ký | Bắt đầu bằng "ESステーションをご利用いただきありがとうございます。" (Cảm ơn quý khách đã sử dụng ES Station), cuối thư là chữ ký thư chỉ gửi (giống §0 của danh sách hiện có) | Danh sách email §0 |
| Người nhận phía doanh nghiệp | Người phụ trách của doanh nghiệp・cơ sở. Trong **chính／hóa đơn／phụ**, thông báo giao hàng nào đặc tả ghi "người phụ trách chính・phụ" thì theo đó. Cái đặc tả không ghi thì "cần xác nhận" | 配送_05 (hoàn tất gửi hàng), 配送_04 (đổi ngày) |
| Người nhận phía công ty giao hàng ủy thác | Người phụ trách (chính・phụ) trong master đơn vị giao hàng ủy thác. Nếu không có tài khoản site thì chỉ email (`partnerTo` của code) | 配送_01, lib/domain/notify.ts |
| Thời điểm gửi | **Ngay** theo sự việc xảy ra. Khác với thông báo theo lịch (bắt đầu order v.v.), **không đẩy sớm sang ngày làm việc trước** (việc đẩy sớm khi trùng ngày nghỉ chỉ áp dụng cho thông báo theo lịch) | Sổ quyết định E "Thông báo trùng ngày nghỉ của khách hàng" |
| Đính kèm | Không đính kèm. Nội dung chi tiết để người nhận xem trên màn hình của từng site | Danh sách email §0 |
| Từ ngữ không cho doanh nghiệp thấy | Không cho doanh nghiệp thấy chữ "取消" (hủy) (ghi là "配送日調整中" (đang điều chỉnh ngày giao hàng)) | 配送_07 (phát hiện không thể trước khi xuất hàng) |
| Trong thời gian hạn chót tạm | **Không gửi email xác nhận** (cho đến khi hạn chót thật từ menu đến) | 配送_02／配送_04／配送_08 |

## 1. Danh sách (Claude案)

| ID | Tình huống | Người nhận | Thật／chỉ ghi lại | Trạng thái |
|---|---|---|---|---|
| M14 | Email xác nhận (gửi doanh nghiệp) | Doanh nghiệp・cơ sở (chính・phụ) | Chỉ ghi lại (kênh email) | Claude案 (người nhận・nội dung **cần xác nhận**) |
| M15 | Email xác nhận (gửi công ty giao hàng ủy thác) | Công ty giao hàng ủy thác | Chỉ ghi lại (email＋màn hình) | Claude案 (nội dung **cần xác nhận**) |
| M16 | Email hoàn tất gửi hàng | Doanh nghiệp・cơ sở (chính・phụ) | Chỉ ghi lại (kênh email) | Claude案 (có trong đặc tả) |
| M17 | Vận hành đổi ngày giao hàng・ngày xuất hàng (sau hạn chót) | Doanh nghiệp・cơ sở (chính・phụ) | Chỉ ghi lại (email)＋thông báo ở trang chủ | Claude案 (có trong đặc tả・lệch với code→xác nhận 2) |
| M18 | Kết quả yêu cầu đổi ngày giao hàng (phê duyệt・đề xuất ngày khác・từ chối) | Doanh nghiệp・cơ sở đã yêu cầu | Chỉ ghi lại (có cần email hay không **cần xác nhận**) | Claude案 (**cần xác nhận**) |
| M19 | Yêu cầu đổi ngày giao hàng・trả lời đề xuất ngày khác | Vận hành (phụ trách giao hàng) | Chỉ màn hình | Claude案 |
| M20 | Vận hành đã di chuyển ngày (gửi công ty giao hàng ủy thác) | Công ty giao hàng ủy thác | Chỉ ghi lại (email＋màn hình) | Claude案 |
| M21 | Vận hành đã di chuyển ngày (gửi tài xế) | Tài xế | Chỉ màn hình | Claude案 |
| M22 | Chưa đặt tài xế (3 ngày trước・ngày trước ngày giao hàng) | Công ty giao hàng ủy thác (vận hành chỉ màn hình) | Chỉ ghi lại (email＋màn hình) | Claude案 (có trong đặc tả) |
| (M9) | Hủy hợp đồng của cơ sở dùng chuyến ES giao hàng | Công ty giao hàng ủy thác | Chỉ ghi lại | **Dùng M9 hiện có** (danh sách đăng ký・đơn yêu cầu) |
| M23 | Hủy giao hàng (đổi gói・tạm ngưng・hủy hợp đồng・vận hành hủy) | Công ty giao hàng ủy thác | Chỉ ghi lại (email＋màn hình) | Claude案 (có trong code・câu chữ trong đặc tả **cần xác nhận**) |
| M24 | Đang điều chỉnh ngày giao hàng (khi vận hành hủy trước xuất hàng) | Doanh nghiệp・cơ sở | Thông báo ở trang chủ (có cần email hay không **cần xác nhận**) | Claude案 (**cần xác nhận**) |
| M25 | Đã nhận báo cáo sự cố (gửi doanh nghiệp) | Doanh nghiệp・cơ sở | Chỉ ghi lại (có cần hay không・người nhận **cần xác nhận**) | **Cần xác nhận** |
| M26 | Báo cáo sự cố (gửi vận hành) | Vận hành (phụ trách giao hàng) | Chỉ màn hình | Claude案 |
| M27 | Đã quyết định giao lại・hàng thay thế・hủy bỏ (gửi doanh nghiệp) | Doanh nghiệp・cơ sở | — | **Cần xác nhận** (đặc tả không có quy định) |
| M28 | Yêu cầu báo giá (vận hành→công ty giao hàng ủy thác) | Công ty giao hàng ủy thác | Chỉ ghi lại (email＋màn hình) | Claude案 (tiêu đề・mục có trong đặc tả) |
| M28b | Quyết định・công ty khác được chọn・hủy yêu cầu báo giá (vận hành→công ty giao hàng ủy thác) | Công ty giao hàng ủy thác | Chỉ ghi lại (email＋màn hình) | hong trả lời 2026-10-19 (sổ quyết định AU). Số là tạm |
| M29 | Trả lời báo giá (công ty giao hàng ủy thác→vận hành) | Vận hành (phụ trách giao hàng) | Màn hình (có cần email hay không **cần xác nhận**) | **Cần xác nhận** |
| M30 | Thêm nơi giao mới của chuyến ES giao hàng | Công ty giao hàng ủy thác | Chỉ ghi lại (email＋màn hình) | Claude案 (có trong code) |
| M31 | Kết thúc phụ trách (đổi đơn vị ủy thác) | Công ty giao hàng ủy thác bị rút ra | Chỉ ghi lại (email＋màn hình) | Claude案 (phần mà đặc tả ghi nội dung sẽ quyết ở STEP7) |
| M32 | Thêm phụ trách (đổi đơn vị ủy thác) | Công ty giao hàng ủy thác mới | Chỉ ghi lại (email＋màn hình) | Như trên |
| M33 | Yêu cầu giao hàng (đã đủ phiếu vận chuyển・chỉ thị xuất hàng) | Công ty giao hàng ủy thác | Chỉ ghi lại (email＋màn hình) | **Cần xác nhận** (chỉ có trong code・khác biệt với M15) |
| M34 | Phân công giao hàng (gửi tài xế) | Tài xế | Màn hình (kênh **cần xác nhận**) | **Cần xác nhận** |
| M35 | Cảnh báo gửi vận hành (cần xác nhận・lỗi nhập v.v.) | Vận hành | **Chỉ màn hình** (không email) | Claude案 (có trong đặc tả. Một phần **cần xác nhận**) |
| M36 | Báo cáo đỗ xe・chênh lệch kiểm kê | Vận hành | Chỉ màn hình (đỗ xe là phương án không thông báo) | **Cần xác nhận** |
| M37 | Đặt vật tư | Vận hành (phụ trách giao hàng) | Chỉ màn hình | Claude案 (có trong code) |

---

## 2. Email gửi doanh nghiệp・cơ sở

### M14　Email xác nhận (gửi doanh nghiệp)

| Mục | Nội dung |
|---|---|
| Tình huống gửi | Khi số lượng được xác nhận ở hạn chót order và dữ liệu giao hàng đã được tạo (xác nhận giao hàng). **Không gửi cho đến khi hạn chót thật từ menu đến** (không gửi ở hạn chót tạm) |
| Người gửi | ESキッチン運営事務局 (hệ thống gửi tự động) |
| Người nhận | Đặc tả chỉ ghi "thông báo xác nhận cho doanh nghiệp・công ty giao hàng ủy thác". Người phụ trách nào của doanh nghiệp, theo từng cơ sở hay gộp theo doanh nghiệp thì **không ghi** → **cần xác nhận (xác nhận 1)** |
| Thời điểm gửi | Khi xử lý xác nhận hạn chót order (batch hằng ngày). Trong thời gian hạn chót tạm thì không gửi |
| Thật／chỉ ghi lại | Chỉ ghi lại (sổ quyết định E #105) |
| Nguồn | 配送_02 "確定メールの送信" (gửi email xác nhận), 配送_04 (bảng hạn chót tạm), 配送_08 (như trên) |

Tiêu đề: 【ESステーション】{chu kỳ} のお届けが確定しました（{tên cơ sở}） (Việc giao hàng {chu kỳ} đã được xác nhận ({tên cơ sở}))
```
Kính gửi người phụ trách {tên cơ sở}

Ngày giao hàng của {chu kỳ} đã được xác nhận.

■ Ngày giao hàng ：【YYYY/MM/DD (thứ)】 (vùng nhiệt độ: 【lạnh／đông lạnh】)
■ Số lượng       ：【n suất】
(khi có nhiều chuyến thì tiếp tục theo cùng dạng)

Ngày mới nhất có thể xác nhận trên lịch ở trang chủ của Web doanh nghiệp.
```
- Đưa vào nội dung: chu kỳ, tên cơ sở, ngày giao hàng (ngày mới nhất), vùng nhiệt độ, số lượng.
- Không đưa vào nội dung: tên công ty giao hàng ủy thác, tài xế, phí giao hàng・số tiền, trạng thái nội bộ của vận hành.
- Cần xác nhận: nội dung thư (chỉ ngày, hay đưa cả số lượng・sản phẩm). Khi vận hành đổi ngày trước hạn chót thì "ngày mới nhất có trong email xác nhận" nên không gửi email bổ sung (配送_04). → Phương án ghi ngày, vùng nhiệt độ và số lượng.

### M16　Email hoàn tất gửi hàng

| Mục | Nội dung |
|---|---|
| Tình huống gửi | Khi đã nhập thực tế xuất hàng (hoàn tất gửi hàng). 1 thư cho 1 lần giao |
| Người gửi | ESキッチン運営事務局 |
| Người nhận | **Người phụ trách chính và người phụ trách phụ** của doanh nghiệp・cơ sở (theo đúng đặc tả) |
| Thời điểm gửi | Khi đã nhập xong thực tế xuất hàng (ngay) |
| Thật／chỉ ghi lại | Chỉ ghi lại (sổ quyết định E #105). "発送準備中" (đang chuẩn bị gửi hàng) chỉ là hiển thị trên Web doanh nghiệp, không làm email |
| Nguồn | 配送_05 (bảng liên kết ngoài・phiếu vận chuyển "発送完了メール"), 配送_99 (O-5・P11), 配送_01 §3 (mẫu URL theo dõi) |

Tiêu đề: 【ESステーション】商品を発送しました（{tên cơ sở}・お届け予定 {YYYY/MM/DD}） (Đã gửi hàng ({tên cơ sở}・dự kiến giao {YYYY/MM/DD}))
```
Kính gửi người phụ trách {tên cơ sở}

Chúng tôi đã gửi sản phẩm quý khách đặt.

■ Ngày gửi hàng        ：【YYYY/MM/DD】
■ Ngày dự kiến giao    ：【YYYY/MM/DD】
■ Công ty giao hàng    ：【tên công ty giao hàng】
■ Số phiếu vận chuyển  ：【số】 (khi có nhiều thì ghi tất cả)
■ Theo dõi kiện hàng   ：【URL theo dõi】 (trang tra cứu của công ty giao hàng)

Tình trạng giao hàng cũng có thể xác nhận ở trang chủ của Web doanh nghiệp.
```
- Đưa vào nội dung: ngày gửi hàng, ngày dự kiến giao, tên công ty giao hàng, số phiếu vận chuyển, URL theo dõi (tạo bằng cách thay `{送り状番号}` trong "mẫu URL theo dõi" của master công ty giao hàng).
- Không đưa vào nội dung: tài xế, số tiền, địa chỉ kho.
- Cần xác nhận: chuyến của công ty mình・chuyến ủy thác (chuyến ES giao hàng) không có số phiếu vận chuyển, khi đó có gửi không (đặc tả chỉ ghi "1 thư khi nhập thực tế xuất hàng (hoàn tất gửi hàng)") → gom vào xác nhận 3.

### M17　Thông báo khi vận hành đổi ngày giao hàng・ngày xuất hàng (gửi doanh nghiệp)

| Mục | Nội dung |
|---|---|
| Tình huống gửi | Khi vận hành **đổi ngày giao hàng hoặc ngày xuất hàng** bằng di chuyển lịch・sửa ngày của dữ liệu giao hàng. Theo lựa chọn "**法人に通知する**" (Thông báo cho doanh nghiệp) (ban đầu ON) của màn hình di chuyển |
| Người gửi | ESキッチン運営事務局 |
| Người nhận | **Người phụ trách chính và người phụ trách phụ** của doanh nghiệp・cơ sở. Thông báo ở trang chủ Web doanh nghiệp là cho tài khoản cơ sở và tài khoản doanh nghiệp |
| Thời điểm gửi | Khi đã xác nhận di chuyển (ngay) |
| Thật／chỉ ghi lại | **Thông báo ở trang chủ Web doanh nghiệp: luôn có** (hiển thị ngày giao hàng mới nhất). **Email: chỉ khi vận hành đổi sau hạn chót order** (chỉ ghi lại). **Thay đổi trước hạn chót thì không gửi email** (vì email xác nhận M14 có ngày mới nhất) |
| Nguồn | 配送_04 (P11・khi đổi ngày giao hàng và ngày gửi hàng), 配送_08 (như trên), sổ quyết định F "運営D スケジュール…⑥『法人に通知する』は残す（初期ON）" (giữ lại "Thông báo cho doanh nghiệp" (ban đầu ON)) |

Tiêu đề: 【ESステーション】お届け日を変更しました（{tên cơ sở}） (Đã đổi ngày giao hàng ({tên cơ sở}))
```
Kính gửi người phụ trách {tên cơ sở}

Chúng tôi đã đổi ngày giao hàng.

■ Trước khi đổi ：chuyến 【YYYY/MM/DD】
■ Sau khi đổi   ：giao vào 【YYYY/MM/DD】
■ Lý do         ：【lý do vận hành nhập】 (chỉ khi có nhập)

Ngày giao hàng mới nhất có thể xác nhận ở trang chủ của Web doanh nghiệp.
```
- Đưa vào nội dung: ngày trước・sau khi đổi, ngày mới nhất, lý do (nếu vận hành đã nhập).
- Không đưa vào nội dung: từ "取消" (hủy), tên công ty giao hàng ủy thác・tài xế, trạng thái nội bộ (rev・cần xác nhận v.v.).
- Lệch nhau: code (`lib/domain/move.ts`) khi bật "法人に通知する" ON thì **bất kể trước hay sau hạn chót đều ghi lại cả thông báo và email**. Đặc tả thì trước hạn chót chỉ có thông báo ở trang chủ → xác nhận 2.

### M18　Kết quả yêu cầu đổi ngày giao hàng (phê duyệt・đề xuất ngày khác・từ chối)

| Mục | Nội dung |
|---|---|
| Tình huống gửi | Khi vận hành trả lời "yêu cầu đổi ngày giao hàng" mà doanh nghiệp đã gửi. ① Phê duyệt　② Đề xuất ngày khác　③ Từ chối. Khi doanh nghiệp tự rút lại thì ghi vào lịch sử và thông báo |
| Người gửi | ESキッチン運営事務局 |
| Người nhận | Doanh nghiệp・cơ sở đã yêu cầu (gửi email cho ai = chính／hóa đơn／phụ) thì đặc tả **không ghi** → **cần xác nhận (xác nhận 3)** |
| Thời điểm gửi | Khi vận hành đã chốt câu trả lời (ngay) |
| Thật／chỉ ghi lại | Thông báo trên Web doanh nghiệp là luôn có. Có cần email hay không **cần xác nhận**. Chỉ ghi lại |
| Nguồn | 配送_04 (bảng trạng thái thay đổi "否認・法人が取り下げ：履歴に残し、法人へ通知" (từ chối・doanh nghiệp rút lại: ghi lịch sử, thông báo cho doanh nghiệp) "代替日を提案" (đề xuất ngày thay thế)), 納品サイクル設定 §3.4 (câu chữ đã điều chỉnh), `date_change` của code `lib/domain/areas/delivery.ts` |

Tiêu đề: 【ESステーション】お届け日の変更の申請の結果（{số yêu cầu}） (Kết quả yêu cầu đổi ngày giao hàng ({số yêu cầu}))
```
Kính gửi người phụ trách {tên cơ sở}

Chúng tôi xin thông báo kết quả về yêu cầu đổi ngày giao hàng.

■ Số yêu cầu ：【DD-YYYYMMDD-NNNN】
■ Kết quả    ：【Phê duyệt／Đề xuất ngày khác／Không thể chấp nhận】
(Phê duyệt)  Đã xác nhận vào 【YYYY/MM/DD】. Nếu cần thay đổi chúng tôi sẽ liên hệ.
(Ngày khác)  Ngày 【YYYY/MM/DD】 có được không? Xin vui lòng trả lời trên Web doanh nghiệp.
(Từ chối)    Lý do: 【lý do vận hành nhập】
```
- Đưa vào nội dung: số yêu cầu, kết quả, ngày đã xác nhận／ngày đề xuất／lý do từ chối. Câu phê duyệt là cách nói đã quy định trong đặc tả ("〈日付〉で確定しました。変更が必要になった場合はご連絡します" (Đã xác nhận vào 〈ngày〉. Nếu cần thay đổi chúng tôi sẽ liên hệ)).
- Không đưa vào nội dung: giải thích dạng phủ định kiểu "không phải 〜", tên trạng thái nội bộ, tên người phụ trách vận hành.
- Cần xác nhận: có gửi cả email hay chỉ thông báo ở trang chủ.

### M24　Đang điều chỉnh ngày giao hàng (gửi doanh nghiệp・hủy trước xuất hàng)

| Mục | Nội dung |
|---|---|
| Tình huống gửi | Khi phát hiện không giao được trước khi xuất hàng, vận hành **hủy** dữ liệu giao hàng và tạo chuyến thay thế (hỏng thiết bị kho・không sắp xếp được xe・tuyết lớn v.v.) |
| Người gửi | ESキッチン運営事務局 |
| Người nhận | Doanh nghiệp・cơ sở (gửi email cho ai thì **cần xác nhận**) |
| Thời điểm gửi | Khi hủy |
| Thật／chỉ ghi lại | Hiển thị trên Web doanh nghiệp là "配送日調整中" (đang điều chỉnh ngày giao hàng) ＋ bình luận của vận hành (đặc tả). **Có cần email hay không thì đặc tả không có** → **cần xác nhận (xác nhận 4)**. Chỉ ghi lại |
| Nguồn | 配送_07 (phát hiện không thể trước khi xuất hàng), code `lib/domain/areas/delivery.ts` |

Tiêu đề: 【ESステーション】お届け日を調整しています（{tên cơ sở}） (Chúng tôi đang điều chỉnh ngày giao hàng ({tên cơ sở}))
```
Kính gửi người phụ trách {tên cơ sở}

Về việc giao hàng ngày 【YYYY/MM/DD】, chúng tôi đang điều chỉnh lịch.
Ngay khi quyết định được ngày giao hàng mới, chúng tôi sẽ liên hệ lại.

■ Bình luận từ vận hành: 【bình luận vận hành nhập】 (chỉ khi có)
```
- Đưa vào nội dung: ngày giao hàng ban đầu, cách nói "đang điều chỉnh", bình luận của vận hành.
- Không đưa vào nội dung: **chữ "取消" (hủy)**, ghi chú nội bộ về lý do, tên công ty giao hàng ủy thác.
- Lệch nhau: code (hủy trong `delivery.ts`) đưa ra thông báo "お届けの取消" (hủy giao hàng)・"お届けを取り消しました" (đã hủy giao hàng) cho doanh nghiệp. Đặc tả là "không cho doanh nghiệp thấy chữ '取消'" → xác nhận 4.

### M25　Khi nhận được báo cáo sự cố (gửi doanh nghiệp)

| Mục | Nội dung |
|---|---|
| Tình huống gửi | Khi báo cáo sự cố được đăng ký bởi tài xế・vận hành (đăng ký thay) v.v. |
| Người gửi | ESキッチン運営事務局 |
| Người nhận | Doanh nghiệp・cơ sở. Code hiển thị "配送状況を確認しています" (đang xác nhận tình trạng giao hàng) cho tài khoản của cơ sở・doanh nghiệp. Người nhận email thì **đặc tả không ghi** |
| Thời điểm gửi | Khi đăng ký báo cáo (ngay) |
| Thật／chỉ ghi lại | Không tìm thấy quy định "thông báo cho doanh nghiệp" trong đặc tả. Code ghi lại bằng kênh thông báo＋email → **cần xác nhận (xác nhận 4)** |
| Nguồn | 配送_07, 配送トラブル・中止_対応フロー, `trouble` của code `lib/domain/areas/delivery.ts` |

Tiêu đề: 【ESステーション】配送状況を確認しています（{số giao hàng}） (Chúng tôi đang xác nhận tình trạng giao hàng ({số giao hàng}))
```
Kính gửi người phụ trách {tên cơ sở}

Với chuyến ngày 【YYYY/MM/DD】, có việc cần xác nhận.
Ngay khi nắm được tình hình, vận hành sẽ liên hệ.
```
- Đưa vào nội dung: ngày giao hàng, sự việc "đang xác nhận".
- Không đưa vào nội dung: loại・nguyên nhân sự cố (hư hỏng・tai nạn v.v.), tên tài xế, thông tin công ty khác.
- Ghi chú: liên lạc sau giao hàng (khiếu nại) thì vẫn giữ là đã giao. Phương án này không đưa ra thông báo gửi doanh nghiệp.

### M27　Khi đã quyết định giao lại・hàng thay thế・hủy bỏ (gửi doanh nghiệp)

| Mục | Nội dung |
|---|---|
| Tình huống gửi | Khi vận hành (logistics) quyết định giao lại／hàng thay thế／hủy (phế bỏ)／hủy bỏ như cách xử lý sự cố |
| Người nhận・thời điểm・nội dung | **Đặc tả không có quy định thông báo cho doanh nghiệp**. Hàng thay thế có quy định riêng (X17 thông báo hàng thay thế・đã có). Báo ngày mới của giao lại cho doanh nghiệp thế nào (có xử lý giống đổi ngày M17 không), khi hủy bỏ thì báo gì là **cần xác nhận (xác nhận 4)** |
| Thật／chỉ ghi lại | Chưa định |
| Nguồn | 配送_07 (giải quyết sự cố), hủy bỏ là "đăng ký thay → quyết định xử lý → kết thúc mà không giao" (sổ quyết định F vận hành D xuất hàng・quản lý giao hàng ②), X17 |

Phương án (bản nháp để xác nhận. Không triển khai cho đến khi hong quyết định): giao lại **giống M17** (ngày mới là thông báo ở trang chủ ＋ email nếu sau hạn chót), hàng thay thế là **X17**, hủy bỏ thì vận hành liên hệ riêng với doanh nghiệp để xin lỗi và báo tình hình (không có email hệ thống).

---

## 3. Email gửi công ty giao hàng ủy thác

### M15　Email xác nhận (gửi công ty giao hàng ủy thác)

| Mục | Nội dung |
|---|---|
| Tình huống gửi | Xác nhận giao hàng (cùng thời điểm với hạn chót order). **Không gửi ở hạn chót tạm** |
| Người gửi | ESキッチン運営事務局 (email xác nhận tự động) |
| Người nhận | **Công ty giao hàng ủy thác** phụ trách chặng (leg) của lần giao đó. Không gửi cho chặng chỉ có chuyến của công ty mình |
| Thời điểm gửi | Khi xử lý xác nhận hạn chót order |
| Thật／chỉ ghi lại | Chỉ ghi lại (email＋thông báo trên Web công ty giao hàng ủy thác) |
| Nguồn | 配送_06 (thời điểm xác nhận), 配送_02／配送_04／配送_08 (gửi email xác nhận) |

Tiêu đề: 【ESステーション】{chu kỳ} の配送が確定しました（{số đơn}件） (Việc giao hàng {chu kỳ} đã được xác nhận ({số đơn} đơn))
```
Kính gửi người phụ trách {tên công ty giao hàng ủy thác}

Việc giao hàng của {chu kỳ} đã được xác nhận. Xin vui lòng xác nhận ở "スケジュール" (Lịch) trên Web công ty giao hàng ủy thác.

■ Ngày giao hàng・nơi giao・vùng nhiệt độ・số lượng (theo số đơn)
・【YYYY/MM/DD】【tên cơ sở】【lạnh／đông lạnh】【n suất】
```
- Đưa vào nội dung: chu kỳ, ngày giao hàng, nơi giao (tên cơ sở), vùng nhiệt độ, số lượng, hướng dẫn đến Web công ty giao hàng ủy thác.
- Không đưa vào nội dung: số tiền hóa đơn, thông tin cá nhân ngoài thông tin liên hệ của doanh nghiệp, chuyến của công ty khác.
- Cần xác nhận: đơn vị gộp thành 1 thư (theo công ty・theo ngày xuất hàng) và khác biệt với M33 (xác nhận 7).

### M20　Khi vận hành đã di chuyển ngày (gửi công ty giao hàng ủy thác)

| Mục | Nội dung |
|---|---|
| Tình huống gửi | Khi vận hành đổi ngày bằng di chuyển lịch・sửa ngày của dữ liệu giao hàng. Nếu sau khi đã gửi chỉ thị xuất hàng thì tăng phiên bản và gửi lại, thông báo cho đơn vị giao hàng ủy thác và tài xế |
| Người nhận | **Công ty giao hàng ủy thác** phụ trách chặng của chuyến đã thay đổi (chặng của công ty mình không thuộc đối tượng) |
| Thời điểm gửi | Khi đã xác nhận di chuyển (ngay). 1 thư cho mỗi bên vận chuyển |
| Thật／chỉ ghi lại | Chỉ ghi lại (email＋thông báo trên Web công ty giao hàng ủy thác) |
| Nguồn | 配送_04 (tăng phiên bản và gửi lại), code `lib/domain/move.ts` |

Tiêu đề: 【ESステーション】お届け日の変更（{số đơn}件） (Thay đổi ngày giao hàng ({số đơn} đơn))
```
Kính gửi người phụ trách {tên công ty giao hàng ủy thác}

Ngày giao hàng của các lần giao sau đã thay đổi. Chỉ thị xuất hàng cũng đã được cập nhật (phiên bản: 【n】).

・【tên cơ sở】　【YYYY/MM/DD】 → 【YYYY/MM/DD】
```
- Đưa vào nội dung: tên cơ sở, ngày giao hàng trước・sau khi đổi, phiên bản chỉ thị xuất hàng.
- Không đưa vào nội dung: có thông báo cho doanh nghiệp hay không, ghi chú lý do nội bộ của vận hành (có ghi lý do hay không do vận hành quyết định → phương án không ghi).

### M22　Chưa đặt tài xế (gửi công ty giao hàng ủy thác)

| Mục | Nội dung |
|---|---|
| Tình huống gửi | Vào **3 ngày trước** và **ngày trước** ngày giao hàng, khi vẫn còn lần giao mà chặng cần phân công chưa có tài xế. **Chỉ gửi email cho chặng ủy thác** (chặng của công ty mình chỉ hiển thị cần xác nhận cho vận hành) |
| Người gửi | ESキッチン運営事務局 |
| Người nhận | **Công ty giao hàng ủy thác** phụ trách. Với vận hành là hiển thị cần xác nhận `assignment_missing`, cũng hiển thị trên Web công ty giao hàng ủy thác (email chỉ cho công ty giao hàng ủy thác) |
| Thời điểm gửi | Ngày được lấy ra bởi batch hằng ngày `plan_recheck` (mỗi ngày 03:00) (2 lần: ngày 3 ngày trước và ngày trước). Không dừng xuất hàng |
| Thật／chỉ ghi lại | Chỉ ghi lại (email＋màn hình). Lưu vào `delivery_notifications` với loại `assignment_missing_3d`／`_1d` |
| Nguồn | 配送_05 (thông báo chưa đặt tài xế), 配送_06 (3 ngày trước・ngày trước ngày giao hàng), 配送_08 §15-9, 配送_09 (`delivery_notifications`) |

Tiêu đề: 【ESステーション】ドライバーが決まっていない配送があります（{số đơn}件・{3日前／前日}） (Có lần giao chưa quyết định tài xế ({số đơn} đơn・{3 ngày trước／ngày trước}))
```
Kính gửi người phụ trách {tên công ty giao hàng ủy thác}

Trong các lần giao có ngày giao hàng sắp tới, có chặng chưa quyết định tài xế.
Xin vui lòng phân công tài xế trên Web công ty giao hàng ủy thác.

■ Đối tượng
・【YYYY/MM/DD】【tên cơ sở】【số giao hàng】
```
- Đưa vào nội dung: số đơn, ngày giao hàng, tên cơ sở, số giao hàng, hướng dẫn màn hình phân công, là "3 ngày trước" hay "ngày trước".
- Không đưa vào nội dung: tên・số điện thoại người phụ trách của doanh nghiệp, số tiền.
- Cần xác nhận: cùng một lần giao sẽ nhận 2 lần vào 3 ngày trước và ngày trước (theo đúng đặc tả). Người nhận có phải là tất cả người chính・phụ không (xác nhận 7).

### (M9) Hủy hợp đồng của cơ sở dùng chuyến ES giao hàng (gửi công ty giao hàng ủy thác)

**Không tạo ID mới. Dùng M9 "解約にともなう配送停止のお知らせ" (Thông báo dừng giao hàng do hủy hợp đồng) của danh sách email đăng ký・đơn yêu cầu** (tự động khi vận hành phê duyệt hủy hợp đồng. Người nhận = công ty giao hàng của tuyến giao hàng của cơ sở đó. Không gửi cho cơ sở chỉ có chuyến của công ty mình, mà thông báo trên màn hình cho người phụ trách giao hàng nội bộ). 配送_04 (hủy hợp đồng của cơ sở dùng chuyến ES giao hàng)・配送_06 (thông báo hủy hợp đồng) cũng cùng quy định. Ở đây không thay đổi.

### M23　Hủy giao hàng (gửi công ty giao hàng ủy thác)

| Mục | Nội dung |
|---|---|
| Tình huống gửi | Khi các lần giao sắp tới bị hủy do đổi gói・tạm ngưng・hủy hợp đồng (tự động). Khi vận hành hủy dữ liệu giao hàng |
| Người nhận | Công ty giao hàng ủy thác phụ trách chặng của lần giao đó (chỉ công ty "委託・引き取り" (ủy thác・nhận hàng). Chặng của công ty mình không thuộc đối tượng). Khi hủy hợp đồng và dừng toàn bộ thì trùng với M9 → khi hủy hợp đồng là **phương án chỉ gửi M9, không gửi M23** |
| Thời điểm gửi | Khi hủy (ngay). 1 thư cho mỗi cơ sở・lý do |
| Thật／chỉ ghi lại | Chỉ ghi lại (email＋thông báo trên Web công ty giao hàng ủy thác) |
| Nguồn | Code `lib/domain/lifecycle.ts` (`notifyCarriers`). **Đặc tả không có quy định về câu chữ** → câu là phương án, việc trùng với hủy hợp đồng **cần xác nhận** |

Tiêu đề: 【ESステーション】配送の取消のお知らせ（{tên cơ sở}・{số đơn}件） (Thông báo hủy giao hàng ({tên cơ sở}・{số đơn} đơn))
```
Kính gửi người phụ trách {tên công ty giao hàng ủy thác}

Do {đổi gói／tạm ngưng／lý do của vận hành}, chúng tôi đã hủy các lần giao sau.

・【YYYY/MM/DD】【tên cơ sở】【số giao hàng】
```
- Đưa vào nội dung: lý do (đổi gói・tạm ngưng v.v.), ngày giao hàng, tên cơ sở, số giao hàng.
- Không đưa vào nội dung: nội dung hợp đồng・số tiền của doanh nghiệp.

### M28　Yêu cầu báo giá (vận hành → công ty giao hàng ủy thác)

| Mục | Nội dung |
|---|---|
| Tình huống gửi | Khi vận hành ở màn hình tạo "配送管理 ＞ 見積依頼" (Quản lý giao hàng ＞ Yêu cầu báo giá) chọn công ty giao hàng ủy thác tìm theo địa chỉ và gửi yêu cầu báo giá (cả khi "ほかの会社へ追加で依頼" (yêu cầu thêm công ty khác) ở chi tiết・khi đổi điều kiện. Cũng gửi điều kiện mới cho công ty đã từ chối. Chỉ đổi hạn thì chỉ thông báo cho công ty đang chờ trả lời: sổ quyết định AT #818・#825). Cũng có thể gửi tùy chọn từ chi tiết đơn yêu cầu thay đổi của chuyến ES giao hàng (không có báo giá vẫn phê duyệt được) |
| Người gửi | ESキッチン運営事務局 |
| Người nhận | Công ty giao hàng ủy thác đã chọn (nhiều công ty = giả định 3 công ty) |
| Thời điểm gửi | Khi gửi yêu cầu (ngay) |
| Thật／chỉ ghi lại | Chỉ ghi lại (email＋"見積もり依頼一覧" (Danh sách yêu cầu báo giá) trên Web công ty giao hàng ủy thác) |
| Nguồn | 配送_01 §3-3 (yêu cầu báo giá), 配送_06 (Web công ty giao hàng ủy thác), 配送_99 (đơn yêu cầu thay đổi và yêu cầu báo giá ủy thác RS-09), code `quote_request` |

Tiêu đề: 配送の見積依頼（{số yêu cầu}） (Yêu cầu báo giá giao hàng ({số yêu cầu}))　※Đặc tả là dạng cố định bắt đầu bằng "ESキッチン" → cần xác nhận (xác nhận 6)
```
Kính gửi người phụ trách {tên công ty giao hàng ủy thác}

Xin vui lòng báo giá cho việc giao hàng dưới đây. Hạn trả lời: 【YYYY/MM/DD】

■ Tên doanh nghiệp      ：【tên doanh nghiệp】
■ Địa chỉ               ：【địa chỉ】
■ Sản phẩm xử lý        ：【lạnh／đông lạnh】
■ Khu vực giao hàng     ：【tỉnh/thành・quận/huyện】
■ Đáp ứng thứ Bảy, CN   ：【có／không】
■ Gói                   ：【có／không có máy bán hàng tự động】
■ Thứ giao hàng         ：【có／không có nhiều thứ】
■ Điều kiện số tiền     ：【điều kiện】
■ Gộp nhiều cơ sở       ：【có／không】

Xin vui lòng trả lời từ "見積もり依頼一覧" (Danh sách yêu cầu báo giá) trên Web công ty giao hàng ủy thác
(có thể báo giá／không đáp ứng được・phí hàng tháng・đính kèm・bình luận・điểm trung chuyển).
```
- Đưa vào nội dung: các mục yêu cầu đã quy định trong đặc tả (tên doanh nghiệp・địa chỉ・sản phẩm xử lý・khu vực giao hàng・đáp ứng thứ Bảy CN・gói・nhiều thứ・điều kiện số tiền・lạnh／đông lạnh・gộp nhiều cơ sở), hạn trả lời, hướng dẫn màn hình trả lời. Xe sở hữu có trong hồ sơ của công ty giao hàng ủy thác nên không đưa vào từng yêu cầu.
- Không đưa vào nội dung: báo giá của công ty khác, thông tin cá nhân của người phụ trách bên đối tác đang thương lượng.
- Cần xác nhận: số ngày của hạn trả lời, có lưu hạn hiệu lực・trả lời lại hay không (配送_06 có ghi "要確認").

### M28b　Quyết định・công ty khác được chọn・hủy yêu cầu báo giá (vận hành → công ty giao hàng ủy thác) (2026-10-19 hong trả lời・sổ quyết định AU・sổ tiếp nhận #827)

| Mục | Nội dung |
|---|---|
| Tình huống gửi | Khi vận hành chọn 1 công ty trong yêu cầu báo giá／khi hủy yêu cầu (chi tiết "配送管理 ＞ 見積依頼" trên Web vận hành) |
| Người nhận | Công ty giao hàng ủy thác đã nhận yêu cầu. Công ty được chọn nhận "御社に決まりました" (đã chọn quý công ty), công ty khác nhận "他社に決まりました" (đã chọn công ty khác), hủy thì "取り消されました" (đã bị hủy). **Không gửi cho công ty đã từ chối** |
| Cách truyền đạt | **Cả email và màn hình Web công ty giao hàng ủy thác**. Trạng thái trên Web công ty giao hàng ủy thác là "取消" (hủy)・"他社に決定" (đã chọn công ty khác) (tách với "期限切れ" (hết hạn)) |
| Thật／chỉ ghi lại | Chỉ ghi lại (email＋màn hình) |
| Nội dung văn bản | Chưa soạn (tiêu đề・nội dung soạn theo cùng cách viết với M28: cần xác nhận) |
| Nguồn | Sổ quyết định AT #41・AU, sổ tiếp nhận #825・#827 |

### M30　Khi thêm nơi giao mới của chuyến ES giao hàng (gửi công ty giao hàng ủy thác)

| Mục | Nội dung |
|---|---|
| Tình huống gửi | Khi đăng ký tạm cơ sở dùng chuyến ES giao hàng (nếu chưa thiết lập chuyến thì khi đăng ký chính thức). 1 lần cho mỗi cơ sở・công ty |
| Người nhận | Công ty giao hàng ủy thác cấp 1・cấp 2 (chỉ công ty "委託・引き取り" (ủy thác・nhận hàng)) |
| Thời điểm gửi | Sau đăng ký tạm・đăng ký chính thức (ngay) |
| Thật／chỉ ghi lại | Chỉ ghi lại (email＋màn hình). `es_plan_added` |
| Nguồn | 配送_06 (thông báo yêu cầu đầu tiên cho đơn vị giao hàng ủy thác: tên khách hàng・địa chỉ・gói・giao mấy lần mỗi tháng・tháng bắt đầu), code `lib/domain/mails.ts` (`esPlanNotices`) |

Tiêu đề: 【ESステーション】新しいお届け先が追加されます（{tên cơ sở}） (Sẽ thêm nơi giao mới ({tên cơ sở}))
```
Kính gửi người phụ trách {tên công ty giao hàng ủy thác}

Nơi giao mới (chuyến ES giao hàng) đã được {đăng ký tạm／đăng ký chính thức}.

■ Nơi giao              ：【tên cơ sở】 (【địa chỉ】)
■ Gói                   ：【tên gói】／giao 【n】 lần mỗi tháng
■ Bắt đầu               ：chu kỳ 【tháng M năm YYYY】
■ Vùng nhiệt độ・khung  ：【lạnh／đông lạnh】【thứ Hai tuần 1 v.v.】
■ Giờ nhận hàng         ：【HH:MM〜HH:MM】
```
- Đưa vào nội dung: tên・địa chỉ nơi giao, gói, số lần giao mỗi tháng, chu kỳ bắt đầu, vùng nhiệt độ và khung, giờ nhận hàng. Quy định của đặc tả là "tên khách hàng・địa chỉ・gói・giao mấy lần mỗi tháng・tháng bắt đầu".
- Không đưa vào nội dung: thông tin hóa đơn・số tiền của doanh nghiệp.

### M31　Kết thúc phụ trách／M32　Thêm phụ trách (khi đổi đơn vị ủy thác)

| Mục | M31 Kết thúc phụ trách | M32 Thêm phụ trách |
|---|---|---|
| Tình huống gửi | Khi công ty giao hàng ủy thác cấp 1・cấp 2 thay đổi do thay đổi hàng loạt (lọc／CSV) hoặc thay đổi hợp đồng 1 đơn | Giống |
| Người nhận | Công ty giao hàng ủy thác **bị rút ra** | Công ty giao hàng ủy thác **mới** |
| Thời điểm gửi | Khi đã xác nhận thay đổi (ngay) | Giống |
| Thật／chỉ ghi lại | Chỉ ghi lại (email＋thông báo trên portal đơn vị giao hàng ủy thác) | Giống |
| Nguồn | 配送_03 §5-10 (thông báo cho đơn vị ủy thác. Có ghi "メールの文面は STEP7（メール一覧）で決める" (nội dung email quyết định ở STEP7 (danh sách email)) → đã làm phương án trong tài liệu này) | Giống |

M31　Tiêu đề: 【ESステーション】担当の終了のお知らせ（{tên cơ sở}） (Thông báo kết thúc phụ trách ({tên cơ sở}))
```
Kính gửi người phụ trách {tên công ty giao hàng ủy thác}

Việc phụ trách cơ sở dưới đây sẽ kết thúc.

■ Tên cơ sở              ：【tên cơ sở】
■ Ngày phụ trách cuối    ：【YYYY/MM/DD】
```
M32　Tiêu đề: 【ESステーション】担当の追加のお知らせ（{tên cơ sở}） (Thông báo thêm phụ trách ({tên cơ sở}))
```
Kính gửi người phụ trách {tên công ty giao hàng ủy thác}

Việc phụ trách cơ sở dưới đây sẽ được thêm vào.

■ Tên cơ sở              ：【tên cơ sở】 (【địa chỉ】)
■ Ngày phụ trách đầu     ：【YYYY/MM/DD】
■ Khung giờ nhận hàng    ：【HH:MM〜HH:MM】
■ Tài liệu               ：Xin xem tài liệu của cơ sở (sơ đồ đường vận chuyển vào v.v.) trên Web công ty giao hàng ủy thác
```
- Đưa vào nội dung: tên cơ sở, ngày phụ trách cuối／ngày phụ trách đầu, địa chỉ, khung giờ nhận hàng, hướng dẫn tài liệu.
- Không đưa vào nội dung: lý do đổi đơn vị ủy thác, tên công ty・phí của bên cũ và bên mới.

### M33　Yêu cầu giao hàng (gửi công ty giao hàng ủy thác・khi đã đủ phiếu vận chuyển／chỉ thị xuất hàng)

| Mục | Nội dung |
|---|---|
| Tình huống gửi | Khi các lần giao cùng ngày xuất hàng・cùng công ty đã đủ phiếu vận chuyển (chuyến tuyến) hoặc chỉ thị xuất hàng (ủy thác・nhận hàng) |
| Người nhận | Công ty giao hàng ủy thác đó |
| Thời điểm gửi | Khi đã đủ. 1 lần cho cùng ngày xuất hàng・cùng công ty |
| Thật／chỉ ghi lại | Chỉ ghi lại. Code `delivery_request` |
| Nguồn | **Chỉ có trong code** (`deliveryRequestCheck` của `lib/domain/mails.ts`). Đặc tả giao hàng có "gửi chỉ thị xuất hàng" nhưng không tìm thấy mô tả email này → **cần xác nhận (xác nhận 7)** |

Tiêu đề: 【ESステーション】配送のご依頼（{MM/DD} 出荷・{số đơn}件） (Yêu cầu giao hàng (xuất hàng {MM/DD}・{số đơn} đơn))
```
Kính gửi người phụ trách {tên công ty giao hàng ủy thác}

Chúng tôi xin yêu cầu giao hàng cho các lần xuất hàng ngày {YYYY/MM/DD} (đã đủ phiếu vận chuyển・chỉ thị xuất hàng).

・【số giao hàng】【tên cơ sở】【lạnh／đông lạnh】【n suất】 (giao 【YYYY/MM/DD】)
```
- Chưa xác nhận cách giữ khác biệt với M15 (email xác nhận = khi hạn chót order). Cũng có phương án chỉ giữ M15 và bỏ M33.

---

## 4. Thông báo gửi tài xế

### M21　Khi vận hành đã di chuyển ngày (gửi tài xế)

| Mục | Nội dung |
|---|---|
| Tình huống gửi | Khi vận hành đổi ngày và gửi lại chỉ thị xuất hàng. Chỉ chuyến có tài xế phụ trách |
| Người nhận | Tài xế phụ trách (khi có tài khoản) |
| Thật／chỉ ghi lại | **Chỉ màn hình** (thông báo của ứng dụng tài xế. Không email) |
| Nguồn | 配送_04 (tăng phiên bản và gửi lại. Thông báo cho đơn vị giao hàng ủy thác・tài xế), code `lib/domain/move.ts` |

Thông báo trên màn hình: "お届け日が変わりました" (Ngày giao hàng đã thay đổi)／nội dung: 【tên cơ sở】【trước khi đổi】→【sau khi đổi】. Không đưa vào nội dung: ghi chú lý do, số tiền.

### M34　Phân công giao hàng (gửi tài xế)

| Mục | Nội dung |
|---|---|
| Tình huống gửi | Khi phân công kế hoạch giao hàng cho tài xế |
| Người nhận | Tài xế được phân công |
| Thật／chỉ ghi lại | X6 của danh sách hiện có chỉ ghi "ドライバー（通知一覧・トップのお知らせはなし）" (tài xế (danh sách thông báo・không có thông báo ở trang đầu)), **không đọc ra được là email hay màn hình**. Code chỉ ghi lại "配送が割り当てられました" (đã được phân công giao hàng) trên màn hình (site) → **cần xác nhận (xác nhận 8)** |
| Nguồn | X6 của danh sách đăng ký・đơn yêu cầu (2026/06/02), code `lib/domain/areas/delivery.ts` |

Phương án: tiêu đề "配送が割り当てられました" (Đã được phân công giao hàng)／nội dung "【YYYY/MM/DD】【tên cơ sở】". Không cho tài xế thấy: nội dung yêu cầu・số tiền (quy định của X8).

※ Việc cấp tài khoản tài xế (X7) và mã 4 chữ số để đặt lại mật khẩu (sổ quyết định B "ドライバーのログイン" (đăng nhập của tài xế). **Việc gửi email là tạm**) giữ nguyên quy định hiện có, tài liệu này không đề cập.

---

## 5. Thông báo gửi vận hành (chỉ màn hình)

### M19　Yêu cầu đổi ngày giao hàng・trả lời đề xuất ngày khác (gửi vận hành)

Chỉ thông báo trên màn hình (vai trò = phụ trách giao hàng `ops.delivery`). Tiêu đề "お届け日の変更の申請（{số yêu cầu}）" (Yêu cầu đổi ngày giao hàng ({số yêu cầu})), nội dung "【tên cơ sở】: 【ngày hiện tại】→【nguyện vọng 1〜3】". Khi doanh nghiệp trả lời đề xuất ngày khác thì "ご提案への返事：受ける／断る" (Trả lời đề xuất: nhận／từ chối). Không email. Nguồn: code `lib/domain/areas/delivery.ts`, sổ quyết định E #105 (thông báo cho vận hành là trên màn hình).

### M26　Báo cáo sự cố (gửi vận hành)

Chỉ thông báo trên màn hình (`ops.delivery`). Tiêu đề "トラブルの報告（{ID sự cố}）" (Báo cáo sự cố ({ID sự cố})), nội dung "【tên cơ sở】【ngày】: 【loại】【ghi chú】". Không email (phương án). Nguồn: 配送_07, code.

### M35　Cảnh báo gửi vận hành (cần xác nhận・lỗi nhập v.v.)

| Mục | Nội dung |
|---|---|
| 【2026-10-13 rút lại: đã bỏ cần xác nhận "Chú ý hạn sử dụng ngắn" (sổ quyết định X)】 Tình huống gửi | Các loại cần xác nhận: chưa đặt tài xế `assignment_missing`, hạn sử dụng ngắn `shelf_life_warning`, 3 ngày trước hạn chót yêu cầu thay đổi `change_request_due`, phiếu vận chuyển ra trước `tracking_anomaly`, **lỗi nhập** thực tế xuất hàng・số phiếu vận chuyển (dòng không nhập được), đảo chiều, thất bại khi tạo xác nhận, phát hiện văn phòng đã đóng cửa |
| Người nhận | Vận hành (phụ trách giao hàng). Email cho công ty giao hàng ủy thác chỉ có M22 |
| Thật／chỉ ghi lại | **Chỉ hiển thị ở cảnh báo "要確認" (cần xác nhận) của màn hình lịch vận hành. Không gửi email cũng không push** (quyết định 2026/09/12) |
| Nguồn | 納品サイクル設定 "通知先" (nơi nhận thông báo), 配送_04 (thông báo cần xác nhận), 配送_05 (lỗi nhập), 配送_08 §15-9, 配送_12 (batch) |

- Cần xác nhận: lỗi nhập・phiếu vận chuyển ra trước・phát hiện văn phòng đã đóng cửa, đặc tả chỉ ghi "phát hiện・thông báo" "thông báo cờ", **không ghi rõ chỉ cần hiển thị ở cần xác nhận trên màn hình hay cũng cần email cho vận hành** → phương án chỉ màn hình (xác nhận 9).
- Lý do chỉ màn hình: vì "sẽ quá nhiều thông báo" (納品サイクル設定 §10-1).

### M36　Báo cáo đỗ xe・chênh lệch kiểm kê (gửi vận hành)

| Mục | Nội dung |
|---|---|
| Báo cáo đỗ xe | Tài xế nhập ảnh hóa đơn và phí đỗ xe (cả hai bắt buộc). **Đặc tả không có mô tả thông báo cho vận hành**. Vận hành xem・sửa ở tab thực tế của dữ liệu giao hàng. Phương án không tạo thông báo |
| Chênh lệch kiểm kê | Khi có chênh lệch thì **thông báo cho quản trị viên vận hành** (配送_06). Không ghi kênh (màn hình hay email). Phương án chỉ màn hình |
| Nguồn | 配送_06 (báo cáo đỗ xe・phế bỏ／kiểm kê), sổ quyết định F (phí đỗ xe sửa ở tab thực tế) |
| Trạng thái | **Cần xác nhận (xác nhận 9)** |

### M37　Đặt vật tư (gửi vận hành)

Chỉ thông báo trên màn hình (`ops.delivery`). Tiêu đề "資材の注文（{ID}）" (Đặt vật tư ({ID})), nội dung "【tên cơ sở】: giao 【YYYY/MM/DD】 (lần thứ 2・khi có phí thì ghi như vậy)". Không email. Nguồn: code `lib/domain/areas/delivery.ts`. Đặc tả không có quy định, là ghi lại cái có trong code (phương án).

---

## 6. Những cái đã quyết định ở danh sách khác (ở đây không làm lại)

| Tình huống | Vị trí |
|---|---|
| Dừng giao hàng do hủy hợp đồng (công ty giao hàng ủy thác) | M9 (danh sách đăng ký・đơn yêu cầu) |
| Thông báo hàng thay thế (doanh nghiệp) | X17 (như trên) |
| Thông báo ngày dự kiến gửi・giao hàng tháng sau／nhắc bắt đầu・hạn chót order／xác nhận bằng đặt hàng mặc định | X1・X2・X18 |
| Phát thông báo hàng loạt | X13 (chức năng chung. Không đưa vào đặc tả giao hàng: sổ quyết định B) |
| Cấp tài khoản tài xế・mã xác thực đặt lại mật khẩu | X7・M10・sổ quyết định B |

---

## Những điều muốn hong xác nhận (trong 10 mục・mỗi mục kèm khuyến nghị của Claude)

1. **Người nhận và nội dung email xác nhận (M14・M15)**: đặc tả chỉ ghi "thông báo xác nhận cho doanh nghiệp・công ty giao hàng ủy thác". Với doanh nghiệp thì gửi cho ai? → **Khuyến nghị**: doanh nghiệp gửi **người phụ trách chính・phụ** giống M16・M17, nội dung theo từng cơ sở là "ngày giao hàng・vùng nhiệt độ・số lượng". Ủy thác là danh sách các chuyến của chặng phụ trách (1 thư cho mỗi công ty). Ngoài ra vì nội dung trùng với "次月の発送/納品予定日のお知らせ" (thông báo ngày dự kiến gửi/giao hàng tháng sau) (X1・ngày 21 tháng trước), nên email xác nhận chỉ truyền đạt việc "đã xác nhận".
2. **Email đổi ngày giao hàng・ngày xuất hàng (M17)**: đặc tả là "sau hạn chót thì gửi cả email. Trước hạn chót thì có trong email xác nhận nên không gửi thêm". Code thì nếu "法人に通知する" ON thì **lúc nào cũng ghi lại thông báo＋email**. → **Khuyến nghị**: sửa code theo đúng đặc tả (trước hạn chót chỉ thông báo ở trang chủ).
3. **Người nhận・có cần email hay không của kết quả yêu cầu thay đổi (M18) và hoàn tất gửi hàng (M16)**: có gửi cả email cho phê duyệt・ngày khác・từ chối không? Nếu gửi thì gửi ai? → **Khuyến nghị**: thông báo ở trang chủ＋email cho người đã yêu cầu (theo cách nghĩ của M4・M5). Hoàn tất gửi hàng theo đúng đặc tả là chính・phụ, và gửi cả với chuyến của công ty mình・chuyến ES giao hàng (không có số phiếu vận chuyển).
4. **Thông báo cho doanh nghiệp về hủy・sự cố・giao lại・hủy bỏ (M24・M25・M27)**: đặc tả chỉ có "không cho doanh nghiệp thấy chữ '取消' (đang điều chỉnh ngày giao hàng)", không có quy định về email. Code thì hiển thị "お届けの取消" (hủy giao hàng) cho doanh nghiệp. → **Khuyến nghị**: hủy thì sửa thành "配送日調整中" (đang điều chỉnh ngày giao hàng) và chỉ thông báo ở trang chủ. Sự cố thì không thông báo cho doanh nghiệp, chỉ màn hình của vận hành (khi đã rõ vấn đề thì vận hành liên hệ riêng). Giao lại giống M17, hủy bỏ không có email hệ thống.
5. **Hủy giao hàng do hủy hợp đồng・tạm ngưng・đổi gói (M23) và việc trùng với M9 của hủy hợp đồng**: khi hủy hợp đồng chỉ gửi M9, không gửi M23 có được không? → **Khuyến nghị**: như vậy là được (chỉ khi tạm ngưng・đổi gói mới gửi M23).
6. **Tiêu đề yêu cầu báo giá (M28)**: 配送_01 là dạng cố định bắt đầu bằng "ESキッチン", sổ quyết định quy định gắn "【ESステーション】" ở đầu tất cả email. → **Khuyến nghị**: xác nhận xem yêu cầu báo giá có được làm ngoại lệ bắt đầu bằng "ESキッチン" theo đúng đặc tả không (ví dụ: "ESキッチン　配送の見積依頼（QT-…）").
7. **Người nhận email của công ty giao hàng ủy thác và M33**: tất cả người chính・phụ có được không? "配送のご依頼" (yêu cầu giao hàng) (M33) chỉ có trong code trùng vai trò với email xác nhận (M15). → **Khuyến nghị**: người nhận là tất cả người chính・phụ. M33 gộp vào M15 và bỏ (việc gửi lại chỉ thị xuất hàng truyền đạt bằng M20). Chưa đặt tài xế (M22) là 2 thư vào 3 ngày trước và ngày trước theo đúng đặc tả.
8. **Kênh thông báo phân công cho tài xế (M34)**: X6 không đọc ra được kênh. → **Khuyến nghị**: chỉ thông báo của ứng dụng tài xế (màn hình). Không gửi email.
9. **Thông báo gửi vận hành (M35・M36)**: lỗi nhập・phiếu vận chuyển ra trước・văn phòng đã đóng cửa・chênh lệch kiểm kê・báo cáo đỗ xe chỉ cần cần xác nhận／thông báo trên màn hình có được không? → **Khuyến nghị**: chỉ màn hình (không email). Không tạo thông báo báo cáo đỗ xe.
10. **Trả lời báo giá (M29)**: khi công ty giao hàng ủy thác trả lời, có gửi email cho vận hành không? → **Khuyến nghị**: chỉ thông báo trên màn hình (mục mới trong danh sách báo giá của vận hành). Phần email trong "màn hình＋email" của 配送_01 thì chưa tạo cho đến khi quyết định có cần nhắc hạn trả lời hay không.

## Tổng hợp nguồn

- Sổ quyết định: E #105 (M1 chỉ soạn nội dung・lưu vào bản ghi), B "担当者の変更のメール" (email thay đổi người phụ trách)・"ドライバーのログイン" (đăng nhập của tài xế)・"お知らせ配信・メール送信元" (phát thông báo・người gửi email), E "お知らせのメールの差出人・署名" (người gửi・chữ ký của email thông báo)・"件名の既定" (mặc định tiêu đề), F "運営D のメールの定義" (định nghĩa email của vận hành D)・"運営D スケジュール・出荷指示…（⑥法人に通知する）" (lịch・chỉ thị xuất hàng của vận hành D… (⑥ thông báo cho doanh nghiệp))・"運営D 出荷・配送管理（中止のボタンは作らない）" (xuất hàng・quản lý giao hàng của vận hành D (không tạo nút hủy bỏ)).
- Đặc tả: `配送仕様/配送_02`・`04`・`05`・`06`・`07`・`08`・`09`・`01`・`03`・`99`, `納品サイクル設定_仕様書.md`, `配送トラブル・中止_対応フロー_vi.md`, `ドライバーアプリ_仕様修正点_20260930.md`.
- Code (hoạt động hiện tại): `lib/domain/areas/delivery.ts`, `lib/domain/move.ts`, `lib/domain/lifecycle.ts` (`notifyCarriers`), `lib/domain/mails.ts`, `lib/domain/notify.ts`, `lib/domain/seed/notice.ts`.
