> Bản dịch tiếng Việt của `ja/01_仕様/80_運営・法人の画面/運営・法人の画面.md` (nguồn es-station, bản 2026-10-20). Khi khác nhau, bản tiếng Nhật và `docs/決定台帳.md` là chuẩn.

# Màn hình vận hành・doanh nghiệp (TOP・Dashboard・Quản lý mua hàng・Đánh giá・Màn hình doanh nghiệp・Thông báo・Hạn chế truy cập)

> **Nguồn chuẩn của chủ đề này.** Ngày 2026-10-05, đã viết mới, chỉ tổng hợp "những gì đang có hiệu lực" từ bản gốc và các quyết định bên dưới. Đặt ở đây các quy tắc màn hình không thuộc đặc tả của nghiệp vụ nào.
> Quyết định đang có hiệu lực là `docs/決定台帳.md` (**K**・**M-1**・**M-3**・E・B). Nếu mâu thuẫn thì sổ quyết định là chuẩn.
> Bản gốc (đóng băng・chỉ để xem lịch sử): `docs/議事録_仕様/運営・法人画面_詳細要件仕様.md` (REQ-UI・2026/10/02).
> Quy tắc chung cho mọi màn hình (danh sách・nhập liệu・hiển thị) là sổ quyết định K・M-1. Phân quyền theo `運営Web_権限表_20261003.md`.

## 1. TOP của vận hành (Dashboard)

| # | Quy tắc | Căn cứ |
|---|---|---|
| 1-1 | Màn hình mở đầu tiên của vận hành. **Hàng 1 = Cảnh báo (alert) + Lịch, hàng 2 = Diễn biến mua hàng, hàng 3 = Yêu thích × Mua hàng (toàn chiều ngang)**. Không hiển thị biểu đồ theo phương thức thanh toán. Biểu đồ có bộ lọc | Sổ quyết định K・M-3, REQ-UI-001・003 |
| 1-2 | Lịch: theo từng ngày hiển thị **chu kỳ ES (A1〜D7)**. **Chỉ hiển thị "1 tháng"** (không có chuyển sang 4 tuần), chuyển sang tháng trước・sau. Các mục hiển thị cố định (không có chức năng tùy chỉnh). Giữ cảnh báo mẫu kinh doanh (営業サンプル) | REQ-UI-002, Sổ quyết định E・K (2026-10-05 hong) |
| 1-3 | Cảnh báo hiển thị ở TOP: menu chưa đủ điều kiện công khai (từ 3 ngày trước ngày tự động công khai) / chờ xác định hóa đơn từ ngày 21 / chênh lệch nhập hàng・chờ xử lý・thiếu tồn kho vật tư (đều là dòng của "お知らせ（アラート一覧）" (Thông báo (danh sách cảnh báo))) / thời điểm đặt hàng chính thức, v.v. (không hiển thị số lượng liên hệ: sổ quyết định AT #25) | Sổ quyết định M-2・M-3・I・E |
| 1-3b | Cách hiển thị cảnh báo: **theo mức độ nặng (đỏ→vàng→xanh) tối đa 3 dòng, phần còn lại bấm "他 n件" (còn n mục khác) thì mở ngay tại chỗ**. Trong cùng một màu, sắp theo hạn gần nhất (mục không có hạn xếp sau). Mỗi dòng khoảng 40 ký tự, chi tiết xem ở "？" hoặc nơi mở tới. Không thay đổi việc hiển thị tất cả cho mọi vai trò (sổ quyết định F D5) (chỉ hiển thị tối đa 3 dòng) | Sổ quyết định AT・sổ tiếp nhận #789 |
| 1-3c | Cảnh báo ở TOP các cơ sở đã hủy hợp đồng mà đã qua tháng phải xuất hóa đơn cuối cùng nhưng vẫn chưa tạo (từ tháng sau tháng phải xuất. Ví dụ: hủy 12/06 → tháng xuất là tháng 1 → từ tháng 2) | Sổ quyết định AS・sổ tiếp nhận #779 |
| 1-4 | Cảnh báo cơ sở có tỷ lệ hủy bỏ (廃棄率) vượt 3% (không hiển thị popup) | `60_在庫/在庫.md` §7-9 |

## 2. Quản lý mua hàng (trước đây là "売上管理" (Quản lý doanh thu))

| # | Quy tắc | Căn cứ |
|---|---|---|
| 2-1 | Tên màn hình là **"購入管理" (Quản lý mua hàng)** (cả vận hành và doanh nghiệp). "売上" (doanh thu) trên màn hình doanh nghiệp cũng thành "購入" (mua hàng). Cột là "購入数" (số lượng mua) "購入金額" (số tiền mua) | REQ-UI-004, Sổ quyết định E |
| 2-2 | Vận hành: theo dạng của Phase 1 (theo cơ sở・theo sản phẩm・theo người dùng + yêu thích). Xếp hạng và số lượng đặt hàng theo từng sản phẩm đưa vào "商品別" (theo sản phẩm) | Sổ quyết định K |
| 2-3 | Quản lý mua hàng・người dùng của doanh nghiệp **có thể lọc theo giới tính・độ tuổi** | Sổ quyết định E |
| 2-4 | **Số lượng mua・số tiền mua trừ đi "返金済" (đã hoàn tiền).** "返金中" (đang hoàn tiền) là trạng thái tạm thời khi chờ phản hồi API nên không trừ. "キャンセル" (hủy) không tính vào số lượng mua・số tiền mua・KPI・dòng tổng. Dùng cùng một định nghĩa cho KPI・dòng tổng・danh sách・CSV・quản lý mua hàng／người dùng của Web doanh nghiệp | Sổ quyết định "Định nghĩa số lượng mua・số tiền mua", hong xác nhận lại 2026-10-09 |
| 2-5 | "返金" (hoàn tiền) gọi API hoàn tiền của công ty thanh toán với đơn vị là **toàn bộ đơn hàng (mã OD)**. Nếu thành công thì chuyển ngay tất cả các dòng của đơn hàng sang "返金済". Chỉ trong lúc chờ phản hồi API mới là "返金中" | Sổ quyết định "Thực hiện hoàn tiền" "Đơn vị hoàn tiền", hong xác nhận lại 2026-10-09 |
| 2-6 | Khi API hoàn tiền thất bại hoặc không rõ kết quả, không thay đổi trạng thái mua hàng, ghi lại lỗi và hiển thị. **Không chuyển sang "返金済", cũng không thay đổi tồn kho.** Vận hành thực hiện lại hoặc xác nhận thủ công | hong trả lời 2026-10-09 |
| 2-7 | Khi API hoàn tiền thành công, số lượng sản phẩm đã hoàn tiền được **tự động cộng vào tồn kho lý thuyết của cơ sở nơi mua hàng**. Việc hoàn tiền và cộng tồn kho được ghi nhận là cùng một xử lý thành công, thực hiện hai lần không bị cộng hai lần | hong trả lời 2026-10-09 |
| 2-8 | **Quản lý mua hàng・người dùng của Web doanh nghiệp (CW_SALE)**: kỳ mặc định là **tháng hiện tại (ngày 1〜hôm nay)**. Danh sách mua hàng **không hiển thị đơn hủy・ESQR・mua hàng của khách (guest)** (doanh nghiệp chỉ xem mua hàng của hội viên thuộc cơ sở của mình). Chi tiết ở `85_購入・決済/購入・決済・返金.md` §5-6 | 2026-10-15 hong trả lời・sổ quyết định AK (SALE-Q1・Q2) |
| 2-9 | Web doanh nghiệp: **chỉ tài khoản doanh nghiệp mới bấm được "購入制限" (hạn chế mua) "制限解除" (bỏ hạn chế)** (tài khoản cơ sở không bấm được). Khi bấm, hiển thị hộp thoại xác nhận "購入制限をかけますか？" (Áp dụng hạn chế mua?) (khi bỏ hạn chế thì xác nhận bỏ hạn chế) rồi mới thực hiện | 2026-10-15 hong trả lời・sổ quyết định AK (SALE-Q3・Q4) |
| 2-10 | Danh sách người dùng của Web doanh nghiệp **hiển thị tất cả, kể cả người đã rút khỏi hệ thống・bị đình chỉ sử dụng, và thêm cột "状態" (trạng thái)**. Chi tiết người dùng **không thêm giới tính・độ tuổi** (không tăng hiển thị thông tin cá nhân. Không thay đổi bộ lọc ở 2-3) | 2026-10-15 hong trả lời・sổ quyết định AK (SALE-Q5・Q6) |
| 2-11 | Tìm kiếm・số mục hiển thị・sắp xếp của quản lý mua hàng・danh sách người dùng trên Web doanh nghiệp thống nhất theo mẫu chung (P-LIST・P-PAGESIZE) giống các danh sách khác. Thêm vào dữ liệu mẫu 1 **người dùng chưa có lượt mua nào** (cho màn hình "購入はありません" (Không có lượt mua)) | 2026-10-15 hong trả lời・sổ quyết định AK (SALE-Q7・Q8) |

## 3. Đánh giá

| # | Quy tắc | Căn cứ |
|---|---|---|
| 3-1 | Đánh giá theo từng lần mua (1 đánh giá gồm nhiều sản phẩm). Danh sách của vận hành: số lượng đánh giá・tab đánh giá・bình luận (ý kiến)・ID người dùng・biệt danh・cơ sở đã mua. Không hiển thị địa chỉ email. Có thể kiểm tra các đánh giá từ 2 sao trở xuống. Lọc theo cơ sở・xuất CSV | REQ-UI-005〜007 |
| 3-2 | **Chỉ cho doanh nghiệp xem sao・sản phẩm・tag đánh giá・biệt danh.** Không hiển thị ý kiến (văn bản tự do)・ID người dùng・địa chỉ email. Tài khoản doanh nghiệp = tất cả cơ sở, tài khoản cơ sở = cơ sở của mình | REQ-UI-008 (2026/10/02), Sổ quyết định H |
| 3-3 | **Không có ID đánh giá.** Mỗi đơn hàng đăng 1 lần; danh sách・chi tiết・tìm kiếm・URL・CSV xác định đánh giá bằng mã đơn hàng `OD` + 7 chữ số. ID người dùng là `U` + 8 chữ số. Danh sách 10 mục/trang. Từ chi tiết có link: doanh nghiệp → chi tiết doanh nghiệp・cơ sở → chi tiết cơ sở・ID sản phẩm → chi tiết master sản phẩm・ID người dùng → danh sách tài khoản (người dùng) (mã đơn hàng chỉ là chữ) | Sổ quyết định "Quy tắc đánh giá・ý kiến (Web vận hành)", hong xác nhận lại 2026-10-09 |
| 3-4 | Xuất CSV **1 dòng = 1 sản phẩm** (lặp lại các mục của đánh giá). Cột: mã đơn hàng・ngày giờ đăng・ID người dùng・biệt danh・rút khỏi hệ thống・ID doanh nghiệp・doanh nghiệp・ID cơ sở・cơ sở・ID sản phẩm・tên sản phẩm・đánh giá・tag đánh giá・bình luận. Không xuất ID đánh giá・địa chỉ email | Như trên |
| 3-5 | **Tag đánh giá cố định** (không hài lòng 6・hài lòng 6). Không sửa trên màn hình vận hành (khi thay đổi thì bên phát triển sửa dữ liệu) | Sổ quyết định "Thay đổi tag đánh giá của đánh giá" (hong 2026-10-05) |
| 3-6 | **Danh sách đánh giá của Web doanh nghiệp**: xuất CSV giữ như hiện tại (**1 dòng = 1 đánh giá**. Khác với 3-4 của vận hành là 1 dòng = 1 sản phẩm). Danh sách **giống vận hành** (10 mục/trang・sắp xếp được mọi cột). Phần "レビュー n 件・平均評価・平均の星" (n đánh giá・điểm trung bình・số sao trung bình) phía trên danh sách giữ như hiện tại. Chưa đặt biệt danh thì hiển thị **"匿名ユーザー" (người dùng ẩn danh)**. 0 mục thì hiển thị I01 chung "表示するデータがありません。" (Không có dữ liệu để hiển thị.) **bên trong bảng**. Câu chữ trên dải thông báo của màn hình theo thông điệp của thiết kế (I274・I275) là **"表示しません"** (sửa "出しません" trong code) | 2026-10-15 hong trả lời・sổ quyết định AK (REVW-Q1〜Q5・Q7) |
| 3-6b | ※Phương án bỏ danh sách đánh giá của Web doanh nghiệp, thay bằng hiển thị số sao trung bình・số lượng ở dòng sản phẩm của đơn hàng hàng tháng (sổ tiếp nhận #816) đang chờ khách hàng xác nhận. Cho đến khi quyết định thì giữ theo 3-6 | Sổ quyết định AT (tạm hoãn) |

## 4. Màn hình doanh nghiệp

| # | Quy tắc | Căn cứ |
|---|---|---|
| 4-1 | Trang chủ **lấy lịch làm trung tâm**. Lịch chỉ có ngày giao hàng (không hiển thị giờ). Trang chủ của tài khoản doanh nghiệp = lịch trình của tất cả cơ sở + thông báo | REQ-UI-010・011, Sổ quyết định K |
| 4-2 | Màn hình theo phân cấp "**cơ sở nằm dưới thông tin doanh nghiệp**" (giống vận hành) | REQ-UI-012 |
| 4-3 | Việc xuất mã QR của ESQR đặt ở màn hình **thông tin doanh nghiệp (hồ sơ)** (không đặt ở trang chủ). QR theo từng cơ sở (PDF) đặt ở chi tiết cơ sở (tài khoản cơ sở cũng xuất được phần của cơ sở mình) | REQ-UI-009・Sổ quyết định AT #35 (sổ tiếp nhận #813) |
| 4-4 | Chi tiết hóa đơn chỉ xem được **phần vận hành đã xác định**. PDF hóa đơn dùng template của Bill One | REQ-UI-013 |
| 4-5 | Những việc làm được khi tạm dừng・sau khi hủy hợp đồng, phạm vi nhìn thấy của tài khoản theo sổ quyết định K | Sổ quyết định K |
| 4-6 | Web doanh nghiệp **hỗ trợ máy tính + máy tính bảng. Chỉ báo cáo kiểm kê dùng được cả trên điện thoại**. Quy tắc cho độ rộng dưới 1280px theo thiết kế cơ bản 10-13 | Sổ quyết định H・AT #19 (sổ tiếp nhận #801) |
| 4-6b | Thiết lập theo từng doanh nghiệp "拠点アカウントに変更のお申し込みを許可する" (cho phép tài khoản cơ sở đăng ký thay đổi) **không đưa vào Phase 2** | Sổ quyết định N (hong 2026-10-05) |
| 4-7 | Link "ヘルプ" (trợ giúp) ở header của mỗi app (URL giữ trong thiết lập. Xác nhận 2026/10/09: thiết lập trên màn hình thiết lập của Web vận hành, theo từng đơn vị giao hàng ủy thác・tài xế・khách hàng. Dùng link chia sẻ Google Drive, v.v. nên không cần thay file PDF. Sổ tiếp nhận #510) | Sổ quyết định E (phạm vi chức năng B) |

### 4a. Danh sách giao hàng (Web doanh nghiệp・`/corp/deliveries`)

2026-10-18 hong trả lời (sổ quyết định AT #20・sổ tiếp nhận #802). Vì lối vào để xem giao hàng chỉ có lịch ở trang chủ, nên đã tạo màn hình danh sách, và bỏ màn hình danh sách yêu cầu thay đổi ngày giao hàng (4b bên dưới・CW_RQDT), gộp vào màn hình này (thay thế sổ quyết định F B-3 "không tạo màn hình mới"・B-5 "sang danh sách yêu cầu thay đổi ngày giao hàng").

| # | Quy tắc | Căn cứ |
|---|---|---|
| 4a-1 | **1 dòng = 1 chuyến** (cùng đơn vị với chi tiết giao hàng). Kỳ là **tháng này + tháng sau + 3 tháng trước** (theo tháng của ngày giao hàng). Không hiển thị chuyến đã hủy | Sổ quyết định AT #20 |
| 4a-2 | Cột: mã giao hàng (bấm vào mở chi tiết giao hàng)・ngày giao hàng・cơ sở (khi tài khoản doanh nghiệp có từ 2 cơ sở trở lên)・tháng sử dụng・vùng nhiệt độ・chuyến・số lượng・trạng thái・**yêu cầu thay đổi** (trạng thái của yêu cầu mới nhất của chuyến đó. Không có thì "—")・thao tác ("詳細" (chi tiết). Chuyến cần trả lời thì "ご返事する" (trả lời)) | Sổ quyết định AT #20 |
| 4a-3 | Bộ lọc: tìm kiếm trên 1 hàng (mã giao hàng・mã yêu cầu／cơ sở／kỳ〔tháng〕／trạng thái). **Không đặt bộ lọc vùng nhiệt độ** (xem bằng cột). Tab "すべて" (tất cả) "**ご返事が必要**" (cần trả lời) (chuyến cần trả lời đề xuất ngày khác. Có nhãn số lượng). Chuyến cần trả lời được hiển thị cả khi nằm ngoài kỳ (xa hơn 1 tháng). Nút "ご返事する" chỉ có ở dòng cần trả lời | Sổ quyết định AT #20・#823 (②③) |
| 4a-4 | Chi tiết giao hàng mở bằng `?from=list`: breadcrumb "お届け一覧 / お届け詳細" (danh sách giao hàng / chi tiết giao hàng)・nút quay lại "お届け一覧へ戻る" (quay lại danh sách giao hàng)・menu bên làm sáng "お届け一覧". `?from=requests` cũ cũng xử lý như vậy | Sổ quyết định 2026-10-05・cách nghĩ của sổ tiếp nhận No.157 |
| 4a-5 | Menu bên đặt **ngay dưới trang chủ**. Link "ご確認ください" (vui lòng kiểm tra) ở trang chủ là **"お届け一覧へ"** (sang danh sách giao hàng) (nếu có yêu cầu cần trả lời thì mở ở tab "ご返事が必要") | Sổ quyết định AT #20 |
| 4a-6 | Tài khoản doanh nghiệp = tất cả cơ sở của công ty mình, tài khoản cơ sở = chỉ các chuyến của cơ sở đó | Sổ quyết định K |
| 4a-7 | Thứ tự: **các lần giao từ hôm nay trở đi, gần nhất lên trước**, các lần giao đã qua xếp bên dưới theo mới nhất trước (cùng ngày thì theo cơ sở → vùng nhiệt độ) | Sổ quyết định AT #20・sổ tiếp nhận #823 (①) |
| 4a-8 | Sau khi trả lời đề xuất thì **vẫn ở chi tiết giao hàng** (hiển thị ngày giao hàng mới. Không quay về danh sách) | Sổ quyết định AT・sổ tiếp nhận #823 (④) |

### 4b. Yêu cầu thay đổi ngày giao hàng (Web doanh nghiệp・mã màn hình CW_RQDT)

> **2026-10-18 đã bỏ màn hình danh sách này** (sổ quyết định AT #20・sổ tiếp nhận #802). Trạng thái yêu cầu xem ở cột "変更申請" (yêu cầu thay đổi) của danh sách giao hàng ở 4a bên trên và ở chi tiết giao hàng. URL cũ `/corp/requests` chuyển sang danh sách giao hàng. Gửi yêu cầu・trả lời vẫn làm từ chi tiết giao hàng như trước. 4b-1 (tên trạng thái)・4b-3 (giữ ngày cũ cho đến khi duyệt) bên dưới vẫn có hiệu lực. 4b-2・4b-4・4b-5 không dùng nữa cùng với màn hình danh sách (60 ký tự của 4b-5 được kế thừa cho ô nhập mã của danh sách giao hàng).

| # | Quy tắc | Căn cứ |
|---|---|---|
| 4b-1 | Tên trạng thái của yêu cầu theo sổ quyết định F "Tên trạng thái của yêu cầu thay đổi ngày giao hàng" (申請中 (đang yêu cầu)／別の日のご提案 (đề xuất ngày khác)／承認 (duyệt)／否認 (từ chối)／お断り済 (đã khước từ)／取り下げ (rút lại)). Trạng thái vận hành đã khước từ **chỉ hiển thị "お断り済"** (bỏ phần trong ngoặc của "お断り済（ESキッチンで調整中）" trong code). Phần bổ sung "ESキッチンで調整中" (ES Kitchen đang điều chỉnh) **không đưa vào tên trạng thái, mà giữ trong câu chú giải** | 2026-10-15 hong trả lời・sổ quyết định AK (R-1), Sổ quyết định F |
| 4b-2 | Khi có 0 yêu cầu thì hiển thị I01 chung "表示するデータがありません。" (không tạo câu riêng) | 2026-10-15 hong trả lời・sổ quyết định AK (R-2) |
| 4b-3 | Ngày muốn thay đổi để trống thì hiển thị "—", khi có nguyện vọng thứ hai thì hiển thị cạnh nguyện vọng thứ nhất (ghi cách hiển thị hiện tại của code vào thiết kế). **Ngày giao hàng thực tế giữ nguyên ngày cũ cho đến khi vận hành duyệt** (lịch và các màn hình khác cũng hiển thị ngày cũ cho đến khi duyệt. Giống mục yêu cầu của 配送_04 "承認までは元の予定を維持" (giữ lịch cũ cho đến khi duyệt)) | 2026-10-15 hong trả lời・sổ quyết định AK (R-3) |
| 4b-4 | Điều kiện tìm kiếm ngày giao hàng (từ／đến) dùng DateInput, **"đến" không chọn được ngày trước "từ", "từ" không chọn được ngày sau "đến"** (giới hạn cả hai chiều. Không phải kiểu báo lỗi và không cho gửi, mà là không cho chọn) | 2026-10-15 hong trả lời・sổ quyết định AK (R-4) |
| 4b-5 | Ô nhập mã yêu cầu・mã giao hàng **tối đa 60 ký tự (tạm)** | 2026-10-15 hong trả lời・sổ quyết định AK (R-5) |

## 5. Gửi thông báo

Không có đặc tả riêng (tài liệu cũ `お知らせ配信_画面仕様_JA-VI_v1.md` không có trong git). Ghi ở đây những gì đã quyết định. Các mục theo từng màn hình nằm trong thiết kế màn hình (`docs/05_画面設計書/`・mã màn hình **AW_NOTI**).

| # | Quy tắc | Căn cứ |
|---|---|---|
| 5-1 | **Chức năng chung cho tất cả site. Do quản trị hệ thống của vận hành quản lý** | Sổ quyết định B |
| 5-2 | Màn hình: danh sách・đăng ký mới・chi tiết・chỉnh sửa・chọn riêng từng đối tượng nhận・lọc theo điều kiện (doanh nghiệp・cơ sở và người dùng app: menu／sản phẩm của năm-tháng đã đặt hàng・có／không có máy bán hàng tự động. Sổ quyết định F) (Notification Management của Figma) | STEP7 S7-17・18 |
| 5-3 | ID = **`NT-` + 5 chữ số** (tự động gán). Danh mục cố định 4 loại: **お知らせ (thông báo)／メニュー (menu)／メンテナンス (bảo trì)／システム更新 (cập nhật hệ thống)** | Sổ quyết định "ID・danh mục của thông báo" (hong 2026-10-05) |
| 5-4 | Trạng thái: mục chưa bắt đầu là **"予定中" (đã lên lịch)** (không dùng "予約中". Khảo sát cũng vậy) | Sổ quyết định (hong 2026-10-05・C2) |
| 5-5 | **Dừng gửi**: ở chi tiết và danh sách (cột thao tác) có "配信停止" (dừng gửi) (cho mục đang công khai・đã lên lịch. Dừng sau khi xác nhận. **Không thể hoàn tác**). Mục đã dừng gửi không chỉnh sửa được・xóa được | Sổ quyết định "Dừng gửi thông báo" |
| 5-6 | Đối tượng nhận: tên cột là **"ES STATION に表示"** (hiển thị trên ES STATION) (trước đây "ESSへお知らせ"). Đối tượng nhận có "仕入先" (nhà cung cấp). Người dùng chế độ khách・ESQR không thuộc đối tượng | Sổ quyết định "Tên cột đối tượng nhận・đính kèm・thứ tự của thông báo", STEP6 Q1, RD-AP-035 |
| 5-7 | Ngày giờ bắt đầu・kết thúc hiển thị: thành phần chọn ngày + giờ. Kết thúc để trống = không kết thúc | Như trên |
| 5-8 | Đính kèm: JPG・PNG・PDF・HEIC・mỗi file 5MB・tối đa 10 file. **Không đính kèm vào email** | Như trên, Sổ quyết định M-1 |
| 5-9 | Có thể có **thông báo chỉ gửi qua email** (hiển thị trên màn hình vận hành, lưu lại lịch sử). Khi gửi email, **nội dung email là bắt buộc** | Sổ quyết định M-3, như trên |
| 5-10 | **Người gửi・chữ ký của email là giá trị thiết lập** (quản trị hệ thống thay đổi được ở quản lý thiết lập. Giá trị ban đầu là giá trị trong code hiện tại) | Sổ quyết định "Người gửi・chữ ký của email thông báo" |
| 5-11 | Email của thông báo quan trọng, khi lưu thì **đề xuất thời điểm gửi** (nếu ngày bắt đầu là ngày nghỉ của khách hàng thì là ngày làm việc trước đó). Vận hành chọn | Sổ quyết định M-3 |
| 5-12 | Thứ tự ban đầu của danh sách là **ngày cập nhật cuối mới nhất trước** | Sổ quyết định "Tên cột đối tượng nhận・đính kèm・thứ tự của thông báo" |
| 5-13 | Web doanh nghiệp: từ "お知らせ" ở trang chủ mở **chi tiết thông báo** (danh mục・ngày giờ đăng・tiêu đề・nội dung・đính kèm・"一覧に戻る" (quay lại danh sách)). Chỉ hiển thị những mục mà người dùng doanh nghiệp đó là đối tượng nhận và hiện đang công khai | Quyết định v2.3 #66 |
| 5-14 | Việc phân chia gửi thông báo・thông tin (thông báo trên Web doanh nghiệp／email／app) ghi trong đặc tả của từng nghiệp vụ | — |
| 5-15 | Danh sách・chi tiết thông báo của Web doanh nghiệp (NEWS): **chỉ hiển thị mục mà người đó là đối tượng nhận và đang công khai** (phán định dựa trên chọn riêng・điều kiện・ngày kết thúc・dừng gửi. Giống 5-13). Mở trực tiếp ID của thông báo không thuộc đối tượng thì I276 "見つかりません" (không tìm thấy). Ngày giờ đăng hiển thị nguyên **ngày giờ bắt đầu hiển thị**. Bấm đính kèm thì **mở ở tab mới (PDF・ảnh)**, **HEIC thì tải xuống**. 0 mục thì I01 chung, lỗi tải thì E346 (có nút tải lại). Thứ tự **mới nhất trước・phân trang 10 mục**. Thêm vào dữ liệu mẫu thông báo có file đính kèm (ID là `NT-` + 5 chữ số theo 5-3) | 2026-10-15 hong trả lời・sổ quyết định AK (NEWS-Q1〜Q6), Sổ quyết định AK |

## 5b. Liên hệ (chỉ widget HubSpot)

| # | Quy tắc | Căn cứ |
|---|---|---|
| 5b-1 | **Liên hệ chỉ qua widget HubSpot (nút tròn ở góc dưới bên phải Web doanh nghiệp = chatbot AI)**. ES không có màn hình・bản ghi liên hệ: đã bỏ màn hình "お問い合わせ" (liên hệ) của Web doanh nghiệp (CW_CONT cũ) và mục trên menu bên, danh sách・chi tiết "お問い合わせ（法人Webから）" (liên hệ (từ Web doanh nghiệp)) của Web vận hành (AW_INQU cũ)・số lượng mới ở TOP・mục trên menu bên. URL cũ (`/corp/contact`・`/ops/inquiries`) chuyển sang trang chủ Web doanh nghiệp・TOP của Web vận hành | Sổ quyết định AT "お問い合わせ（#25）" (hong 2026-10-18)・sổ tiếp nhận #806 |
| 5b-2 | Trên Web doanh nghiệp không cần xem được lịch sử liên hệ trước đây (xem trong HubSpot) | Như trên |
| 5b-3 | **Widget chỉ hiển thị sau khi đăng nhập** (không hiển thị cho khách hàng trước khi đăng ký = màn hình đăng nhập・đăng ký mới・đặt lại mật khẩu) | Như trên |
| 5b-4 | Truyền **ID doanh nghiệp・ID cơ sở** cho widget (để phía HubSpot biết là liên hệ của ai). Tài khoản cơ sở thì là ID cơ sở đó. Tài khoản doanh nghiệp thì là ID cơ sở của màn hình cơ sở đang mở (ID cơ sở trong URL của báo cáo kiểm kê・lịch sử đặt hàng・quản lý cơ sở), màn hình không thuộc cơ sở nào thì để trống (**要確認** (cần xác nhận): cách xác định ID cơ sở truyền đi với tài khoản doanh nghiệp). Chỗ truyền trong code là `hubspotContext` của `app/corp/_ui/CorpChatbot.tsx` (bản demo hiển thị ở đầu widget) | Như trên |
| 5b-5 | Ở màn hình có dải thao tác cố định phía dưới (ví dụ: "商品を追加／クリア／報告する" (thêm sản phẩm／xóa／báo cáo) ở độ rộng điện thoại của báo cáo kiểm kê), **đặt nút widget phía trên dải** (gắn `data-bottom-bar` cho dải. `components/useBottomBarLift.ts`) | hong duyệt 2026-10-18 |
| 5b-6 | Trả lời・xử lý làm trong HubSpot. ES không giữ tình trạng trả lời・xử lý (đồng bộ CRM là Phase 3) | Sổ quyết định M-3 |

> Quyết định cũ đã thay thế (lịch sử): form liên hệ gửi sang HubSpot・cách xử lý lỗi gửi (sổ quyết định F 2026-10-05), danh sách・chi tiết của vận hành (sổ quyết định F 2026-10-05), quy tắc nhập liệu của form (sổ quyết định AK CONT-Q1〜Q6 2026-10-15), số lượng mới ở TOP (sổ quyết định S 2026-10-03).

## 5c. Nhóm menu của vận hành

- 〔2026-10-18 sổ quyết định AT #4・sổ tiếp nhận #791〕Menu bên: nhóm cha hiển thị tổng số badge của các mục con. Mỗi lần chỉ mở 1 nhóm. "要確認" (cần xác nhận) (quản lý giao hàng) đặt đầu nhóm. "資材発注" (đặt hàng vật tư) đặt ngay dưới "発注" (đặt hàng). Tên nhóm・tên mục con của quản lý mua hàng giữ như hiện tại. "お問い合わせ" không đặt lên đầu (đã bị bỏ khỏi menu theo #25・#806. 2026-10-19 hong trả lời・sổ quyết định AU)
- Tên nhóm gồm đánh giá・ý kiến／quản lý khảo sát／danh sách thông báo là **"お知らせ・ご意見" (thông báo・ý kiến)** (trước đây "お客様対応" (hỗ trợ khách hàng)). Breadcrumb cũng dùng tên này (ví dụ: お知らせ・ご意見 ＞ お知らせ一覧). Mã màn hình: đánh giá・ý kiến = AW_REVI, thông báo = AW_NOTI, khảo sát = AW_SURV (sổ quyết định・hong 2026-10-05). Liên hệ (AW_INQU) đã bỏ (sổ quyết định AT #25).

## 6. Khảo sát

- Trạng thái chưa bắt đầu là "予定中". Đối tượng gửi là **người dùng app** (doanh nghiệp・cơ sở chỉ dùng để lọc). "全員" (tất cả) = người dùng app đang sử dụng (trừ cơ sở đang tạm dừng). Sau khi bắt đầu thì khóa câu hỏi. CSV câu trả lời 1 người 1 dòng. Có thể tạo từ template (sổ quyết định M-3・E).

## 7. Hạn chế truy cập

| # | Quy tắc | Căn cứ |
|---|---|---|
| 7-1 | **IP whitelist áp dụng cho tất cả người dùng của Web vận hành**. Truy cập từ ngoài IP đã đăng ký thì cần mã xác thực qua email (OTP). Các site khác không áp dụng | Sổ quyết định B, REQ-UI-014 |
| 7-2 | Thời hạn đăng nhập ở tất cả site là 1 ngày. Đặt lại mật khẩu bằng mã xác thực (5 phút) | Sổ quyết định M-1・K |

## 7b. Khoảng cách trên màn hình (token của design system・2026-10-15 phản hồi vận hành A #7)

- Lề・khoảng cách trên màn hình dùng các token khoảng cách của design system `--space-4` (0.29rem)・`-8` (0.57rem)・`-12` (0.86rem)・`-16` (1.14rem)・`-24` (1.71rem)・`-32` (2.29rem) (đã định nghĩa trong `.ops-*` ở CSS của từng màn hình. Không thêm token mới).
- **Không để ô nhập và bảng・bảng và bảng・bảng và dải tổng quá sát nhau**: khi ô nhập (`.frow`) có bảng theo ngay bên dưới thì dùng `--space-24`, bảng và bảng・bảng và dải tổng dùng `--space-16`, tiêu đề (`.secttl`) trên `--space-24`・dưới `--space-12` (chi tiết đơn đăng ký: cuối applications.css "申請詳細：入力欄と表・表と表の間隔").

## 8. Những điều chưa quyết định

| # | Nội dung | Trạng thái |
|---|---|---|
| U1 | URL trang trợ giúp của khách hàng | Khách hàng xác nhận |

---

## Lịch sử thay đổi

| Ngày họp | Đối tượng (mục・REQ) | Trước thay đổi | Sau thay đổi | Lý do thay đổi | Căn cứ (MM・thời điểm) | Trạng thái |
|---|---|---|---|---|---|---|
| 2026/10/09 | 4-7 Link trợ giúp | URL giữ trong thiết lập | Thiết lập trên màn hình thiết lập của Web vận hành, theo từng đơn vị giao hàng ủy thác・tài xế・khách hàng (xác nhận) | Xác nhận với khách hàng | 〔MM_20261009_1200 ［02:38:28〜02:42:50］〕 sổ tiếp nhận #510 | 実装待ち (chờ triển khai) |
| 2026/10/15 | 2-8〜2-11・3-6・4b・5-15・5b-7 | Chưa ghi các quy tắc riêng về mua hàng・đánh giá・yêu cầu thay đổi・thông báo・liên hệ của Web doanh nghiệp | Phản ánh câu trả lời của hong (sổ quyết định AK) | hong trả lời | Sổ quyết định AK (SALE・REVW・R・NEWS・CONT) | 実装待ち |
| 2026/10/18 | 1-3・5b・5c | Form + lịch sử liên hệ của Web doanh nghiệp, danh sách・chi tiết・số lượng ở TOP・menu của Web vận hành | Liên hệ chỉ qua widget HubSpot (chỉ sau khi đăng nhập・truyền ID doanh nghiệp／ID cơ sở). Màn hình có dải cố định phía dưới thì đặt widget phía trên dải | hong trả lời (ghi chú chỉ ra 25)・hong duyệt 2026-10-18 | Sổ quyết định AT #25・sổ tiếp nhận #806 | 実装済 (đã triển khai) |
