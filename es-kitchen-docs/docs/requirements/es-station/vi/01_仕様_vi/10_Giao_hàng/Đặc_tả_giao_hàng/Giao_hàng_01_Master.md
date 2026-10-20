> Bản dịch tiếng Việt của `ja/01_仕様/10_配送/配送仕様/配送_01_マスタ.md` (nguồn es-station, bản 2026-10-20). Khi khác nhau, bản tiếng Nhật và `docs/決定台帳.md` là chuẩn.

# Đặc tả giao hàng: Master (§3)

<!-- Nguồn: 統合仕様書_サイクル・出荷・ピッキング・配送_v2.3.md (được tách theo chương vào 2026-10-03. Phần nội dung giữ nguyên như thời điểm tách) -->

## 3. Master

### 3-1. Master kho (màn hình 06B)

Dùng nguyên màn hình của **master điểm trung chuyển** hiện có làm khung, thay đổi hiển thị mục theo **loại kho** (Picking／Trung chuyển／**Điểm trả hàng**) 〔Chu kỳ §2.3A〕〔Yêu cầu REQ-DL-410・665〕〔Quyết định v2.3 #41〕. Chú thích: **◎** bắt buộc／**○** tùy chọn／**—** không có

| # | Mục | Hình thức nhập | Picking | Trung chuyển | Giải thích |
|---|---|---|---|---|---|
| 1 | ID kho | Tự động đánh số・chỉ đọc | ◎ | ◎ | Tiền tố khác nhau theo loại (`WH` / `HU` / **`RT` = điểm trả hàng** <thêm 2026/10/01・đặt tạm>). **Chữ cái đầu không được trùng với ID của master khác** (master nhà cung cấp bỏ `HU`・STEP6) |
| 2・3 | Tên kho／Tên kho (dùng cho phiếu) | Văn bản | ◎ | ◎ | Tên dùng cho phiếu là tên hiển thị ở **nơi xuất hàng của vận đơn** |
| 4 | Kana | Văn bản | ○ | ○ | Dùng để tìm kiếm. Điểm trung chuyển có số lượng lớn nên thực chất gần như bắt buộc |
| 5 | Loại kho | Chọn (Picking／Trung chuyển／**Điểm trả hàng**) | ◎ | ◎ | **Không thể thay đổi sau khi đăng ký** (chỉ đọc). **Điểm trả hàng (`warehouse_type = return`) được thêm ở phụ lục 4 ngày 2026/09/29** (ghi chú bên dưới) 〔Quyết định v2.3 #41〕 |
| 6 | Loại vận chuyển | Chọn (master công ty giao hàng) | — | ◎ | **Công ty giao hàng đang vận hành** điểm trung chuyển đó |
| 7 | Trạng thái | Chọn (Hợp lệ／Vô hiệu／Đã xóa) | ◎ | ◎ | "Cách xử lý trạng thái" bên dưới |
| 8 | Mã kho (dùng liên kết THOMAS) | Văn bản | ○ | — | **Mã dùng trong chỉ thị xuất hàng gửi THOMAS (hệ thống kho). Vì không cố định nên vận hành nhập** (khác với ID kho. Thay đổi 2026/10/01・xác nhận của vận hành D3-2. Cũ: [tạm thời] dùng nguyên ID kho <dạng `WH00001`>). Chỉ bắt buộc khi liên kết THOMAS = có |
| 8B | Liên kết THOMAS | Chọn (Có／Không) | ◎ | — | Kho **không** liên kết (ví dụ: **văn phòng ES** xuất vật tư) không gửi chỉ thị xuất hàng đến THOMAS, làm việc bằng danh sách picking (màn hình) và CSV vận đơn (thêm 2026/10/01・xác nhận của khách hàng A2) |
| ~~8C~~ | ~~Khu vực phụ trách~~ | — | — | — | **Hủy đêm 2026/10/01 (Q-E = A): kho không chia theo khu vực phụ trách. Kho của mẫu kinh doanh: nếu chỉ có một kho xử lý thì là kho đó, nếu có nhiều kho thì vận hành chọn** (cũ: thêm ở T4-2) |
| 9 | Mã văn phòng | Văn bản | — | ◎ | **Mã văn phòng của công ty giao hàng. Hiển thị trên vận đơn**. Có thể thay đổi theo giá trị được cấp |
| 10〜14 | Mã bưu điện／Tỉnh thành／Quận huyện／Khu vực・số nhà／Tên tòa nhà・số phòng | Văn bản・chọn | ◎◎◎◎○ | ◎◎◎◎○ | Tỉnh thành・**quận huyện・mã bưu điện** là khóa tìm kiếm điểm trung chuyển (thay đổi 2026/09/30. Cũ: tỉnh thành là khóa tìm kiếm điểm trung chuyển) 〔Bảng yêu cầu dòng 29・決定_要件シート一部反映_回答_20260930〕 |
| 15〜17 | Số điện thoại／Số FAX／Ghi chú | Văn bản | ◎○○ | ◎○○ | |
| 18〜22 | Người phụ trách (loại <chính／phụ>／tên người phụ trách／furigana／địa chỉ email／TEL) | Nhiều dòng | ○ | ○ | **Tất cả tùy chọn**. Không đăng ký vẫn lưu được |
| 23 | Ngưỡng số lượng | Số (**mặc định 300**) | ◎ | — | Chỉ cảnh báo ngày vượt quá, không dừng xử lý. **Giao hàng vật tư không tính vào số lượng** |
| 24 | Lead time chỉ thị xuất hàng | Số (**mặc định 3**) | ◎ | — | Chỉ thị xuất hàng gộp cho 2 tuần được đưa ra trước ngày bắt đầu kỳ đối tượng bao nhiêu ngày (= "khi nào gửi") |
| 25〜28 | Cách xử lý ngày **không thể xuất hàng**／liên kết (đơn vị xuất CSV chỉ thị xuất hàng・hủy・hạn chót gửi lại) | Hiển thị cố định | ◎ | — | **Không có kho thay thế** (không tự động chuyển, "cần xác nhận"). CSV theo **từng kho**・theo chuẩn Thomas. **Không có hủy, ghi đè bằng gửi lại có số phiên bản, dừng bằng gửi lại với số lượng 0** |

- **Điểm trả hàng (`warehouse_type = return`)**: Cơ sở được đăng ký làm nơi nhận khi gửi trả hàng còn lại về trụ sở, v.v. 〔Quyết định v2.3 #41〕. **Chỉ khi lý do sao chép là "trả hàng"** mới chọn được làm nơi giao hàng (8-4). Các mục dùng cho điểm trả hàng (tiền tố ID・thay đổi hiển thị mục bắt buộc) cũng không được ghi trong DEV nên chưa được định nghĩa
- **Master kho không có lead time.** Lead time được giữ **theo từng loại giao hàng của hợp đồng (Lạnh／Đông lạnh／Vật tư)** và **cũng không tự động bổ sung giá trị mặc định**. "Lead time theo khu vực", "Khu vực", "Ngày dự kiến đóng cửa" của bản cũ đã bị xóa, việc đóng cửa được thể hiện bằng trạng thái #7 〔Chu kỳ §2.3A・§12-1〕〔Quyết định #10／#16／#52〕
- **Điểm bắt đầu của `locked` không phải "lead time chỉ thị xuất hàng" mà là "nhập thực tích xuất hàng"** (cũ: lần đầu gửi thành công chỉ thị xuất hàng. (sổ quyết định AL・2026-10-16)). #24 chỉ quyết định **thời điểm xuất** 〔Quyết định v2.1 #3〕〔Yêu cầu REQ-DL-867・812〕
- **Master kho cũng không có vùng nhiệt độ hỗ trợ** (suy ra từ kho xử lý của sản phẩm・§3-4). Vì vậy **mục bắt buộc chỉ riêng kho picking là 1 mục "Mã kho"**, mục bắt buộc chỉ riêng điểm trung chuyển là "Loại vận chuyển" và "Mã văn phòng" 〔Chu kỳ §2.3A・§2.3B〕〔Yêu cầu REQ-DL-668〕

**Cách xử lý trạng thái** 〔Chu kỳ §2.3A〕〔Yêu cầu REQ-DL-683・684〕

| Trạng thái | Nơi gán của hợp đồng | Lịch dự kiến・dữ liệu giao hàng hiện có | Danh sách | Có thể khôi phục không |
|---|---|---|---|---|
| **Hợp lệ** | Hiển thị | Như thường lệ | Hiển thị theo mặc định | — |
| **Vô hiệu** (đã dừng sử dụng) | Không hiển thị | **Không động đến**. Hoàn thành xuất hàng・giao hàng như cũ | Mặc định ẩn. Hiển thị bằng bộ lọc | Có thể khôi phục |
| **Đã xóa** (đăng ký nhầm・trùng lặp) | Không hiển thị | **Không động đến** | Chỉ hiển thị với 「削除済みを含む」 (Bao gồm đã xóa) | Chỉ quản trị viên vận hành・bắt buộc có lý do |

- **Không xóa vật lý.** Chỉ có thể xóa **khi số lịch dự kiến・dữ liệu giao hàng đang tham chiếu là 0**, nếu có dù chỉ 1 mục thì hiển thị số lượng và nhắc "Bạn có muốn vô hiệu hóa không". Vô hiệu hóa・xóa đều bắt buộc có lý do và được lưu vào lịch sử thay đổi. **Không có đăng ký tạm**, văn phòng chưa sử dụng thì đăng ký ở trạng thái "Vô hiệu"
- Đăng ký mới chỉ có **một nút 「＋ 倉庫を追加」 (+ Thêm kho)**. Sau khi bấm sẽ chen vào **bước chọn loại kho** (**mặc định là "Điểm trung chuyển"**), chọn xong mới hiển thị form 〔Yêu cầu REQ-DL-685〕. Màn hình chọn loại kèm theo mục bắt buộc và tiền tố ID của từng loại. Nếu chọn nhầm loại: khi số tham chiếu là 0 thì xóa rồi đăng ký lại, nếu có dù chỉ 1 thì vô hiệu hóa rồi đăng ký mới. **Hợp đồng vẫn còn lịch dự kiến ở kho đã vô hiệu hóa sẽ được hiển thị trong danh sách, vận hành gán lại thủ công**. Các tab là Thông tin cơ bản／Lịch sử thay đổi 〔Nguồn gốc: Cài đặt chu kỳ giao hàng §2.3A〕
- Danh sách có **tìm kiếm (tên kho・kana・mã văn phòng・tỉnh thành・quận huyện・mã bưu điện)** (thay đổi 2026/09/30. Cũ: tên kho・kana・mã văn phòng・tỉnh thành)**／lọc theo loại kho・loại vận chuyển／phân trang／nhập hàng loạt・cập nhật hàng loạt bằng CSV**. Khi thêm mới kho, ô **không thể xuất hàng** ở trạng thái chưa thiết lập, nên danh sách hiển thị **「出荷不可枠：未設定」 (Ô không thể xuất hàng: chưa thiết lập)** và dẫn đến màn hình 01 〔Chu kỳ §2.3A〕〔Yêu cầu REQ-DL-672・673・674・686〕 Danh sách hiển thị **cột địa chỉ** (mã bưu điện・tỉnh thành・quận huyện・khu vực・số nhà). **Hệ thống không tự động xác định điểm trung chuyển (văn phòng) gần nhất**. Vận hành tìm theo địa chỉ để chọn, nếu không tìm thấy thì đăng ký mới 〔Bảng yêu cầu dòng 29・決定_要件シート一部反映_回答_20260930〕 **Chuyển đổi**: Dữ liệu điểm trung chuyển hiện có được nhập nguyên với **loại kho = Trung chuyển** (khoảng 300 mục bằng CSV). Công việc bổ sung chỉ là **đăng ký 2 kho picking**, **thiết lập ô không thể xuất hàng ở màn hình 01**, **thiết lập kho xử lý của sản phẩm** 〔Chu kỳ §2.3B〕

### 3-2. Điểm trung chuyển

> **Thêm 2026/10/01 (xác nhận của khách hàng B1)**: Việc đóng cửa văn phòng không được phát hiện tự động (không có phương tiện). Thay vào đó, trong chi tiết của điểm trung chuyển, hiển thị **danh sách cơ sở (tuyến giao hàng của hợp đồng) đang dùng điểm trung chuyển đó**, để khi biết đóng cửa có thể xác nhận ngay các cơ sở bị ảnh hưởng 〔Yêu cầu REQ-DL-209〕.

| Góc nhìn | Nội dung | Nguồn |
|---|---|---|
| Bản chất | **Văn phòng của công ty giao hàng** (văn phòng của Yamato Transport. Dự kiến sau này cũng dùng văn phòng của Sagawa Express). **Cơ sở của công ty giao hàng ủy thác cũng có thể đăng ký làm điểm trung chuyển** 〔Quyết định v2.3 #50〕. Được quản lý chung trong **master kho** như điểm trung chuyển của tuyến giao hàng | 〔Chu kỳ §2.3A・§2.3B〕〔Yêu cầu 8H-6〕 |
| Số lượng | **Khoảng 300 mục**. Tiền đề là tìm kiếm・lọc・phân trang・nhập／cập nhật hàng loạt bằng CSV | 〔Chu kỳ §2.3A〕〔Yêu cầu 8H-6〕 |
| Số bậc trung chuyển | **Không giả định trung chuyển từ 2 bậc trở lên** | 〔Yêu cầu 8H-6〕 |
| Mã văn phòng | **Được công ty giao hàng cấp và có thể thay đổi**. Hiển thị trên vận đơn. Cho phép cập nhật hàng loạt bằng CSV | 〔Chu kỳ §2.3A〕〔Yêu cầu REQ-DL-673〕 |
| Những thứ không có | **Không có lead time**. **Cũng không phát hành lại vận đơn**. Không có ngưỡng số lượng・lead time chỉ thị xuất hàng・ô **không thể xuất hàng**・ngày không thể theo từng ngày. **Cũng không lấy trạng thái trung gian** | 〔Chu kỳ §2.3B・§4C-2〕〔Yêu cầu REQ-DL-814〕 |
| Cách giữ trung chuyển | Chỉ hiển thị **2 giá trị "có／không trung chuyển"**, **suy ra từ route legs. Không lưu thành trạng thái** | 〔Chu kỳ §4C・§4C-2〕〔Yêu cầu REQ-DL-876〕〔Quyết định v2.1 #7〕 |
| Gán tài xế | **Gán theo đơn vị đoạn (leg). Đoạn do công ty vận tải (`parcel_carrier`) chở thì không gán, đoạn do công ty mình (`self`)・ủy thác (`partner_driver`) chở thì gán** (quyết định theo người chở của đoạn chứ không theo phân biệt lần 1・lần 2) (Cũ: trước mắt vận hành chỉ gán lần 2 <điểm trung chuyển → nơi giao hàng> <lần 1 do công ty vận tải chở>. Thay thế 2026/09/29 〔Quyết định v2.3 #48〕) | 〔Yêu cầu REQ-DL-836〕〔Quyết định #60〕〔Quyết định v2.3 #48〕 |
| Cách được chọn từ hợp đồng | "Điểm trung chuyển" của loại giao hàng. Chọn từ **toàn bộ trung chuyển (`HU`) của master kho** 〔Quyết định v2.3 #50〕, bằng **kiểu tìm kiếm chứ không phải pulldown** | 〔Chu kỳ §2.3A・§12-1〕〔Yêu cầu REQ-DL-674〕 |
| Xác định gần nhất (thêm 2026/09/30) | **Không tự động xác định (chỉ tìm kiếm)**. Tìm danh sách điểm trung chuyển theo tỉnh thành・quận huyện・mã bưu điện, xem cột địa chỉ để chọn. Nếu không tìm thấy thì đăng ký mới | 〔Bảng yêu cầu dòng 29・決定_要件シート一部反映_回答_20260930〕 |
| Phát hiện ngừng hoạt động・đóng cửa | Việc đóng cửa văn phòng Yamato không có API nên **xác định bằng scraping**, nếu không tìm thấy thì gắn cờ là văn phòng đã đóng cửa và thông báo [tạm thời] | 〔Yêu cầu REQ-DL-208〕 |
| Tài liệu của địa điểm | Sơ đồ đường vận chuyển・hướng dẫn được giữ ở **phía master cơ sở・điểm trung chuyển (tài liệu của địa điểm)**, không sao chép vào dữ liệu giao hàng mà hiển thị bằng tham chiếu | 〔Chu kỳ §4A-4C〕〔Yêu cầu REQ-DL-826〕 |

- Tuyến giao hàng **bỏ cấu trúc 2 bước cố định (kho picking → điểm trung chuyển), chuyển sang cấu trúc linh hoạt cho phép chỉ định nơi gửi・nơi nhận mỗi lần**. Hiển thị nơi nhận **chia thành 2 dòng** điểm trung chuyển và nơi giao hàng cuối cùng 〔Chu kỳ §0〕〔Yêu cầu REQ-DL-411〕 **Dù có trung chuyển, lead time đúng là một tổng duy nhất.** Phần trung chuyển chỉ hiển thị làm giá trị tham khảo, không dùng để tính toán 〔Quyết định #21〕

### 3-3. Master công ty giao hàng・công ty giao hàng ủy thác (màn hình 06C)

| Góc nhìn | Nội dung | Nguồn |
|---|---|---|
| **Vùng nhiệt độ hỗ trợ** | **3 giá trị: Đông lạnh／Lạnh・nhiệt độ thường／Vật tư** (nhiệt độ thường được xếp vào cùng ô với lạnh). Phương án 4 giá trị và 2 giá trị đều bị hủy. **Các lựa chọn của form đăng ký công ty giao hàng ủy thác cũng thống nhất theo 3 giá trị này** | 〔Chu kỳ §12-1〕〔Yêu cầu REQ-DL-402〕〔Quyết định #8〕 |
| Những thứ khác có | **Khu vực hỗ trợ (theo đơn vị tỉnh thành)** (thay đổi 2026/09/30. Cũ: Kanto／Chubu／Kansai／Kyushu)・**ngày trong tuần không thể giao hàng** (thứ Hai〜Chủ nhật・ngày lễ. Giữ cùng dạng với ngày trong tuần không thể giao hàng của hợp đồng. Cũ: "ngày trong tuần hỗ trợ". 2026-10-12 sổ quyết định S・sổ tiếp nhận #541)・**bảng phí** (dòng bên dưới)・**sổ quản lý túi giữ lạnh・đá giữ lạnh** (12-5. Thay đổi 2026/10/01. Cũ: mỗi thứ một túi giữ lạnh No・đá giữ lạnh No)・**mục dùng quản lý đá giữ lạnh**・**có/không máy bán hàng tự động** | 〔Chu kỳ §12-1〕〔Yêu cầu REQ-DL-412〕〔Bảng yêu cầu dòng 28・44・57・決定_要件シート一部反映_回答_20260930〕 |
| **Mẫu URL theo dõi** (thêm 2026/10/01・O-4) | Với từng công ty giao hàng (công ty vận tải・ủy thác), vận hành nhập URL trong đó chỗ điền số vận đơn được ghi là `{送り状番号}`. Trên màn hình・email, thay `{送り状番号}` để tạo liên kết. **Nếu công ty giao hàng đổi dạng URL thì vận hành sửa trong master** (không sửa code). Nếu để trống thì chỉ hiển thị số, và liên kết đến trang tra cứu (trang chủ) của công ty giao hàng. Ví dụ Yamato Transport: `https://member.kms.kuronekoyamato.co.jp/parcel/detail?pno={送り状番号}` (trang chủ tra cứu `https://toi.kuronekoyamato.co.jp/cgi-bin/tneko`). Chuyến lấy hàng do ES đánh số thì xác nhận trong chi tiết giao hàng của Web doanh nghiệp |
| **Bảng phí** (thêm 2026/09/30) | Giữ **khu vực (tỉnh thành) × phí thanh toán・phụ phí vùng** theo từng công ty giao hàng ủy thác. **Có thể nhập bằng CSV** (cũng chuyển sheet hiện có・danh sách nhà thầu và số tiền trên Notion thành CSV để nhập). Đơn vị của phí thanh toán (mỗi lần／hàng tháng) và việc có chia phí theo khu vực nhỏ hơn tỉnh thành hay không là **cần xác nhận** | 〔Bảng yêu cầu dòng 39・57・決定_要件シート一部反映_回答_20260930〕 |
| **Phụ phí vùng** (thêm 2026/09/30) | **Vận hành nhập thủ công vào master đơn vị giao hàng ủy thác (không tự động tính)**. **Phụ phí cho địa điểm thứ 2 trong khu vực lân cận cũng không xử lý tự động** (vận hành xem bảng và địa chỉ để xác định, rồi sửa sau. Quyết định 2026/10/09・sổ tiếp nhận #512). Hiển thị làm mức tham khảo trong liên hệ giao hàng (bên dưới), và trong hợp đồng thì **tính phí như tùy chọn của hợp đồng con (phí giao hàng theo vùng của master tùy chọn)** (14-2). **Cách quyết định số tiền tính phí (quyết định 2026/10/09・sổ tiếp nhận #511)**: Trong **bảng khung giá** (danh sách mục master) của tùy chọn OP000004 phí giao hàng theo vùng, **phụ phí (1 lần giao) ứng với khung số tiền thanh toán cho công ty giao hàng ủy thác do vận hành nhập × số lần giao** | 〔Bảng yêu cầu dòng 53・78・決定_要件シート一部反映_回答_20260930〕 |
| **Những thứ không làm** (thêm 2026/09/30) | **Bản đồ toàn quốc (hiển thị bản đồ)** và **tìm kiếm tổ hợp ngày trong tuần giao hàng (thứ X của tuần thứ 1 và thứ 3, v.v.)** không làm. Thay vào đó xác nhận bằng tìm kiếm địa chỉ của lịch giao hàng (15-2), hiển thị ngày trong tuần không thể giao hàng・phí của master đơn vị giao hàng ủy thác, và **"danh sách cơ sở・giao hàng đang phụ trách" của master đơn vị giao hàng ủy thác (dòng bên dưới)** | 〔Bảng yêu cầu dòng 28・39・決定_要件シート一部反映_回答_20260930〕 |
| **Danh sách cơ sở・giao hàng đang phụ trách** (thêm 2026/10/09・màn hình AW_CNSG_003) | Trong chi tiết của master đơn vị giao hàng ủy thác, hiển thị **danh sách cơ sở và giao hàng mà công ty giao hàng ủy thác đó đang phụ trách (đã phụ trách)**. **Mục đích là để gom khách hàng mới vào cùng công ty giao hàng・ngày trong tuần với khách hàng hiện có ở gần** (hiện nay dùng spreadsheet). **Các cột hiển thị**: ID cơ sở・tên cơ sở・địa chỉ (tỉnh thành・quận huyện・mã bưu điện)・tuyến giao hàng (lần 1／lần 2)・vùng nhiệt độ・ngày trong tuần giao hàng (lấy từ slot giao hàng `slot_code`)・số lần giao・trạng thái hợp đồng・ngày giao gần nhất. **Tìm kiếm**: tỉnh thành・quận huyện・mã bưu điện (giống tìm kiếm địa chỉ của 15-2) và lọc "đang phụ trách／trước đây phụ trách". Có thể xuất CSV. "Đang phụ trách" = cơ sở mà công ty này được thiết lập ở công ty giao hàng ①② của hợp đồng. "Trước đây phụ trách" = cơ sở có dữ liệu giao hàng của công ty này nhưng hiện đã đổi sang công ty khác・đã hủy hợp đồng (**lấy từ cả hợp đồng và dữ liệu giao hàng**: trả lời của hong 2026-10-12). Đối tượng **chỉ là master đơn vị giao hàng ủy thác** (công ty vận tải như Yamato không có site riêng nên không gắn: trả lời của hong 2026-10-12). **Vẫn không làm tìm kiếm tổ hợp ngày trong tuần giao hàng** (dòng trên) | 〔MM_20261009_1200 ［02:56:38〜02:59:56］, trả lời của hong 2026-10-12, sổ tiếp nhận #513〕 |
| Kiểm tra nhất quán | Đối chiếu **khu vực nơi giao hàng** của hợp đồng (từ 2026/09/30 đối chiếu theo tỉnh thành 〔Bảng yêu cầu dòng 57・決定_要件シート一部反映_回答_20260930〕) với **vùng nhiệt độ** của loại giao hàng, chỉ định không khớp thì đưa ra **cảnh báo** ("Không hỗ trợ khu vực Kansai", v.v.). **Không cấm.** Số chỉ định không khớp luôn được hiển thị bên dưới loại giao hàng. Cảnh báo chỉ là hiển thị khi nhập, **không lưu làm bản ghi, cũng không tạo mục cần xác nhận (`review_items`)**. Mỗi lần mở màn hình, đối chiếu `carriers.temp_types`・`carrier_areas` với vùng nhiệt độ của loại giao hàng・tỉnh thành của cơ sở rồi hiển thị (không có batch rà soát toàn bộ) 〔Nguồn gốc: DEV §3.2〕 | 〔Chu kỳ §12-1〕 |
| Lead time | **Không phát sinh ở phía công ty giao hàng nên không giữ.** Thay vào đó xác nhận **ngày trong tuần không thể giao hàng** ở master đơn vị giao hàng ủy thác (thay đổi 2026/09/30. Cũ: xác nhận ngày trong tuần có thể giao <nhận qua trả lời báo giá>) (không thể cam kết chỉ định buổi sáng／buổi chiều nên không thực hiện) | 〔Yêu cầu §5〕〔Bảng yêu cầu dòng 28・決定_要件シート一部反映_回答_20260930〕 |
| **Cách được chọn ở hợp đồng** | **Công ty giao hàng lần 1・lần 2** của thiết lập giao hàng hợp đồng có thể chọn từ **toàn bộ master công ty giao hàng** (công ty vận tải・ủy thác・công ty mình). **Lần 1 cũng chọn được công ty giao hàng ủy thác** (Cũ: lựa chọn lần 1 trong thiết kế chỉ có Yamato Transport・Sagawa Express・chuyến của công ty mình. Thay đổi 2026/09/29) | 〔Quyết định v2.3 #50〕 |

- **Form đăng ký mới công ty giao hàng ủy thác**: Đăng nhập bằng liên kết riêng + ID giao hàng ủy thác. Form đặt trong màn hình đăng ký doanh nghiệp, **cấu thành 2 trang** (1 = thông tin cơ bản <địa chỉ・người phụ trách>／2 = khảo sát <khu vực hỗ trợ・tình trạng sở hữu phương tiện・nguyện vọng thuê・ghi chú>). Thông tin doanh nghiệp chỉ nhập **tên công ty và địa chỉ**, khu vực giao hàng **theo đơn vị tỉnh thành** + chọn hàng loạt theo nhóm vùng, có **checkbox đồng ý** với điều khoản sử dụng・nội dung hợp đồng 〔Yêu cầu REQ-DL-401・402・403〕. Không đặt ô nhập ngày mong muốn bắt đầu hợp đồng・thực tích・giá・địa chỉ kho cụ thể・phụ phí vùng (phụ phí vùng do vận hành nhập vào master) 〔Nguồn gốc: Yêu cầu §8D-1〕〔Yêu cầu REQ-DL-401〕 **Luồng yêu cầu・trả lời báo giá**: Tiêu đề email yêu cầu là **dạng cố định bắt đầu bằng 「ESキッチン」**, nội dung là các mục của "Yêu cầu báo giá" bên dưới (tên doanh nghiệp・địa chỉ・sản phẩm xử lý <lạnh／đông lạnh>・khu vực giao hàng・hỗ trợ thứ Bảy Chủ nhật・gói <có/không máy bán hàng tự động>・nhiều ngày trong tuần・điều kiện số tiền・gộp nhiều cơ sở. Phương tiện sở hữu là hồ sơ của công ty giao hàng ủy thác) 〔trả lời của hong 2026-10-03. Cũ: 2 điểm sản phẩm xử lý và khu vực giao hàng〕. Có thể so sánh kết quả báo giá của **nhiều công ty (3 công ty)** trên màn hình quản lý, dùng **nút sao chép báo giá** để tái sử dụng dữ liệu quá khứ. Các mục trả lời là **có thể báo giá／không thể đáp ứng・phí hàng tháng・đính kèm・bình luận・điểm trung chuyển** (RD-DL-167/169), **không có chat** (thay đổi 2026/09/30. Cũ: trên màn hình trả lời đặt **ô trả lời thông tin điểm trung chuyển** và **thời hạn hiệu lực**, khi đổi số tiền thì **"Trả lời lần đầu" → "Trả lời lại"**) 〔Bảng yêu cầu dòng 41・決定_要件シート一部反映_回答_20260930〕. Có giữ thời hạn hiệu lực・trả lời lần đầu → trả lời lại hay không là **cần xác nhận** (không có trong các mục trả lời mới). Liên kết tài khoản với báo giá **không tự động hóa** mà làm thủ công. Khi xác định giao hàng sẽ **tự động gửi email xác nhận** 〔Yêu cầu REQ-DL-404〜409〕. Với khu vực đã biết số tiền thì hiển thị số tiền thực tích quá khứ (bảng phí), có thể bỏ qua yêu cầu báo giá 〔Nguồn gốc: Yêu cầu §5〕. Các mục của form yêu cầu báo giá là dòng "Yêu cầu báo giá" bên dưới (quyết định 2026-10-03)

#### Liên hệ giao hàng (tìm nơi ủy thác đang đàm phán・phụ phí vùng) (thêm 2026/09/30) 〔Bảng yêu cầu dòng 53・決定_要件シート一部反映_回答_20260930〕

〔2026-10-18 sổ quyết định AT・sổ tiếp nhận #818〕Chức năng tìm kiếm này đã được chuyển sang màn hình tạo của Web vận hành 「配送管理 ＞ 見積依頼」 (Quản lý giao hàng > Yêu cầu báo giá) (đã bỏ các tab 「検索」「見積依頼」 của master đơn vị giao hàng ủy thác. Tìm kiếm địa chỉ của điểm trung chuyển vẫn ở master kho).

Đặt màn hình để bộ phận kinh doanh・vận hành **tìm nơi ủy thác từ địa chỉ ngay cả khi đang đàm phán (trước khi đăng ký cơ sở)**. Tìm điểm trung chuyển・nơi ủy thác trong 1 màn hình.

| Góc nhìn | Nội dung |
|---|---|
| Điều kiện tìm kiếm | Địa chỉ (**tỉnh thành・quận huyện・mã bưu điện**)・vùng nhiệt độ. Ngay cả khi cơ sở chưa đăng ký vẫn tìm được chỉ bằng địa chỉ |
| Kết quả | **Công ty giao hàng ủy thác** thuộc khu vực hỗ trợ (tỉnh thành)・**khu vực hỗ trợ**・**ngày trong tuần không thể giao hàng**・vùng nhiệt độ hỗ trợ・**mức tham khảo phí thanh toán và phụ phí vùng trong bảng phí** (hiển thị nguyên giá trị của master đơn vị giao hàng ủy thác). Điểm trung chuyển gần đó hiển thị theo cùng điều kiện với tìm kiếm địa chỉ của danh sách điểm trung chuyển (3-1) (không tự động xác định) |
| Yêu cầu báo giá | Chọn công ty giao hàng ủy thác từ kết quả để gửi **yêu cầu báo giá**. **Các mục đưa vào yêu cầu**: tên doanh nghiệp・địa chỉ・sản phẩm xử lý・khu vực giao hàng・hỗ trợ thứ Bảy Chủ nhật・phương tiện sở hữu・gói (có/không máy bán hàng tự động)・nhiều ngày trong tuần・điều kiện số tiền・lạnh／đông lạnh・gộp nhiều cơ sở 〔trả lời của hong 2026-10-03〕. **Phương tiện sở hữu được giữ ở hồ sơ của công ty giao hàng ủy thác** (công ty giao hàng ủy thác hoặc quản trị hệ thống nhập), không nhập mỗi lần yêu cầu 〔Nguồn gốc: Yêu cầu §8D-2・REQ-DL-404・134〕. Trả lời được nhận qua Web công ty giao hàng ủy thác (12-6). Dữ liệu là liên hệ giao hàng `delivery_inquiries`・trả lời báo giá `carrier_quote_responses` (`配送_11` 14.5) |
| Hóa đơn phụ phí vùng | Sau khi ký hợp đồng, đưa vào hóa đơn **như tùy chọn của hợp đồng con (phí giao hàng theo vùng của master tùy chọn)** (14-2). Kết quả tìm kiếm chỉ là mức tham khảo. **Khi vận hành (quản trị viên hệ thống) gắn tùy chọn ở hợp đồng con và nhập số tiền thanh toán cho công ty giao hàng ủy thác, phụ phí (1 lần) được lấy ra từ bảng khung giá, và hiển thị số tiền hóa đơn cho khách hàng = phụ phí (1 lần) × số lần giao** (quyết định 2026/10/09. Cũ: cách đưa vào là cần xác nhận) |
| Những thứ không làm | Bản đồ toàn quốc・tìm kiếm tổ hợp ngày trong tuần giao hàng・tự động xác định nơi ủy thác |

#### Yêu cầu báo giá của vận hành (Quản lý giao hàng > Yêu cầu báo giá) (quyết định 2026-10-18・sổ quyết định AT・sổ tiếp nhận #818・#825)

| Góc nhìn | Nội dung |
|---|---|
| Danh sách | Trạng thái・số công ty đã trả lời (ví dụ 1 / 3 công ty)・phí hàng tháng rẻ nhất・hạn trả lời. Yêu cầu đã quá hạn mà không có trả lời thì là 「期限切れ」 (Hết hạn) |
| Tạo | Một màn hình. Phía trên là cơ sở (lấy từ đơn đăng ký hoặc nhập tay) và điều kiện (vùng nhiệt độ・số lần／tháng・số suất ăn／lần・hạn trả lời 〔mặc định 5 ngày〕, v.v.), phía dưới là danh sách đơn vị giao hàng ủy thác tìm được từ địa chỉ (đánh dấu chọn rồi gửi) |
| Chi tiết | Xếp cạnh nhau trả lời của từng công ty để so sánh (phí hàng tháng・chi tiết phí・ngày sớm nhất có thể bắt đầu・thời hạn hiệu lực). Quyết định (chọn 1 công ty)・hủy. Có thể gửi thêm yêu cầu cho công ty khác bao nhiêu lần cũng được |
| Chỉnh sửa | Chỉ trong khi đang 「依頼中」 (Đang yêu cầu). Nếu đổi điều kiện, công ty đã trả lời quay về 「回答待ち」 (Chờ trả lời), được thông báo để trả lời lại. Công ty đã từ chối cũng quay về chờ trả lời và được gửi điều kiện mới. Khi chỉ đổi hạn trả lời thì không đưa trả lời về lại, chỉ thông báo cho công ty đang chờ trả lời. Sau khi quyết định・hủy thì chỉ xem |
| Hạn trả lời | Dù quá hạn, nếu vẫn 「依頼中」 thì vẫn trả lời được |
| Thông báo quyết định・hủy | Gửi công ty được chọn 「御社に決まりました」 (Đã chọn quý công ty), các công ty khác 「他社に決まりました」 (Đã chọn công ty khác), khi hủy là 「取り消されました」 (Đã bị hủy). Không gửi cho công ty đã từ chối. Trạng thái trên Web đơn vị giao hàng ủy thác là 「取消」「他社に決定」 (tách biệt với 「期限切れ」). Người nhận thông báo là **công ty giao hàng ủy thác**. Thông báo bằng **cả email và màn hình Web công ty giao hàng ủy thác** (hong 2026-10-19・sổ quyết định AU・メール一覧_配送 M28b) |
| Giới hạn nhập (tạm) | Điều kiện số tiền 200 ký tự・các cơ sở hỏi gộp 2000 ký tự・số suất ăn 1〜9999. Ngày theo dạng yyyy-mm-dd |
| Quyền | Giống master đơn vị giao hàng ủy thác (người có thể chỉnh sửa master thì tạo・chỉnh sửa, người khác chỉ xem) |

Yêu cầu báo giá hết hạn (vẫn ở trạng thái đang yêu cầu mà đã quá hạn trả lời, không có công ty nào đã trả lời) được đưa vào "cần xác nhận" của vận hành (hong 2026-10-19・sổ quyết định AU. Loại 「見積の期限切れ」 (Báo giá hết hạn). Tự động đóng khi có trả lời・gia hạn・quyết định・hủy)

### 3-4. Sản phẩm và kho

**Sản phẩm và kho được giữ theo quan hệ nhiều-nhiều** (`商品マスタ ──< 商品取扱倉庫 >── 倉庫マスタ`: master sản phẩm ──< kho xử lý sản phẩm >── master kho) 〔Chu kỳ §2.3C〕〔Yêu cầu REQ-DL-675・676〕

| Bảng | Nội dung giữ |
|---|---|
| **Master sản phẩm** | Mã sản phẩm・tên sản phẩm・vùng nhiệt độ・số lượng trong gói・hạn dùng・**đơn giá**・mô tả |
| **Kho xử lý sản phẩm** (mới) | Chỉ cặp sản phẩm × kho và **trạng thái xử lý (Hợp lệ／Vô hiệu)** |

- **Cách giữ**: Sản phẩm được xử lý ở cả hai kho là 1 sản phẩm + 2 dòng xử lý, sản phẩm chuyên dùng cho Kanto・chuyên dùng cho Kansai là 1 sản phẩm + 1 dòng xử lý, **nếu cùng tên sản phẩm nhưng đơn giá・mô tả khác nhau thì chia thành 2 sản phẩm** (mỗi sản phẩm 1 dòng xử lý)
- **Không giữ thuộc tính thay đổi theo kho.** Khi thiết lập cùng một sản phẩm ở cùng một kho thì giả định **tất cả giống nhau**, **nếu đơn giá hoặc mô tả khác nhau thì đăng ký như sản phẩm khác**. Số lượng trong gói・đơn giá do master sản phẩm giữ
- **Xác định vùng nhiệt độ**: Vì **master kho** không có vùng nhiệt độ hỗ trợ, nên khi chỉ định ở loại giao hàng như "Đông lạnh × Trung tâm Kokubu" thì xác định bằng việc **kho đó có xử lý ít nhất 1 sản phẩm của vùng nhiệt độ đó không**, nếu là 0 thì cảnh báo "Hãy thiết lập kho xử lý của sản phẩm trước" 〔Yêu cầu REQ-DL-668〕 **Thứ tự**: Hợp đồng (cơ sở) → **kho** ở loại giao hàng → **sản phẩm được xử lý** ở kho đó → sản phẩm hiển thị cho doanh nghiệp. Nếu không quyết định kho trước thì không thể đưa ra sản phẩm, nên **giữ lại thiết lập chọn kho ở hợp đồng**
- **Khi đổi kho của hợp đồng**: Chỉ sản phẩm không có dòng xử lý ở nơi chuyển đến mới là đối tượng thay thế. Hiển thị tách "sản phẩm dùng nguyên được" và "sản phẩm cần thay thế", sau khi vận hành xác nhận sẽ áp dụng **từ tháng áp dụng (A1 của tháng chu kỳ)** 〔Yêu cầu REQ-DL-677〕
- **Khi sao chép để xuất từ kho khác**: Nếu nơi chuyển đến có dòng xử lý thì sao chép nguyên được. Nếu không thì coi là **hàng thay thế**, chọn lại sản phẩm. Tồn kho được giữ **theo từng kho**, **không làm việc di chuyển giữa các kho (chuyển ngang) ở giai đoạn 2** 〔Yêu cầu REQ-DL-678・681〕

### 3-5. Master ngày lễ

| Góc nhìn | Nội dung |
|---|---|
| Nguồn・cách nhập | **Lấy từ API ngày lễ được công khai và đăng ký vào master ngày lễ** (tự động lấy 1 lần mỗi năm + 「祝日を再取得」 (Lấy lại ngày lễ) trên màn hình). Vận hành có thể thêm・sửa・xóa (thay đổi 2026/10/01・xác nhận của vận hành D3-3. Cũ: [tạm thời] đăng ký thủ công 1 lần mỗi năm từ dữ liệu công khai của Văn phòng Nội các, không làm nhập từ API bên ngoài) |
| Liên kết tự động | **Làm**: Tự động lấy 1 lần mỗi năm từ API ngày lễ công khai, cũng có thể lấy lại bằng 「祝日を再取得」 trên màn hình. Hiển thị ngày giờ lấy gần nhất trên màn hình 〔trả lời của hong 2026-10-03〕 (Cũ: không làm. Không có nhập tự động từ API bên ngoài・CSV. Cũng không hiển thị ngày giờ đồng bộ・nút đồng bộ lại. Sửa theo sổ quyết định 2026-10-03) |
| Thao tác của vận hành | Có thể **thêm・sửa・xóa** từ master ngày lễ |
| Hiển thị trên màn hình・mặc định | Màn hình thiết lập chu kỳ giao hàng hiển thị **số ngày lễ và danh sách ngày lễ** trong kỳ đối tượng. Ngày lễ đã đăng ký **mặc định BẬT 「納品の祝日」 (ngày lễ giao hàng)**, có thể đổi sang TẮT theo từng ngày (Override theo ngày) |
| Ngày nghỉ thủ công | Ngoài tên ngày nghỉ + ngày, chọn riêng 「納品の祝日」 và 「**出荷不可**」 (không thể xuất hàng) để thêm. **Bắt buộc ít nhất một trong hai** |
| Áp dụng | Ngày xử lý như ngày lễ giao hàng **không phải là không thể giao hàng đồng loạt toàn công ty**. Chỉ công ty có 「祝日納品不可」 (không thể giao hàng ngày lễ) BẬT ở hợp đồng mới dời ngày giao hàng, công ty TẮT vẫn được giao hàng như thường lệ |
| Xác định ngày trong tuần | **Không tự động xác định theo ngày trong tuần** (vì kho hầu như không nghỉ). Khả năng giao thứ Bảy Chủ nhật được kiểm soát bằng **ngày trong tuần không thể giao hàng**・ngày không thể nhận hàng ở phía hợp đồng |
| Ưu tiên với tạm ngưng | **Khi tạm ngưng chu kỳ và ngày lễ trùng cùng một ngày thì ưu tiên tạm ngưng chu kỳ** (ngày tạm ngưng không có slot nên không xác định ngày lễ・**không thể xuất hàng**) |

〔Chu kỳ §6・§2.3・§4.2〕〔Yêu cầu REQ-DL-307〕〔Quyết định E#9〕

### 3-6. Ranh giới giữa phía master kho và phía thiết lập chu kỳ giao hàng

**Nguyên tắc phân chia là "những gì liên quan đến lịch・ngày thì ở thiết lập chu kỳ giao hàng, thuộc tính của bản thân kho thì ở master kho"** 〔Chu kỳ §2.3・§2.3A〕〔Yêu cầu REQ-DL-686〕

| Mục thiết lập | Nơi giữ | Đơn vị | Lý do |
|---|---|---|---|
| **Ô không thể xuất hàng (A1〜D7)** | **Tab kho của thiết lập chu kỳ giao hàng (màn hình 01)** | **1 bộ** cho mỗi kho. Áp dụng cho toàn bộ kỳ đối tượng thiết lập | Vì ô không phải ngày mà là **slot chu kỳ**, nên nếu không ở trên lịch thì không thể xác nhận "ngày nào sẽ dừng" |
| **Ngày không thể xuất hàng theo ngày** (kiểm kê・bảo trì thiết bị, v.v.) | **Tab kho của thiết lập chu kỳ giao hàng (màn hình 01)** | Theo từng kho. Có thể đăng ký theo **kỳ từ ngày bắt đầu〜ngày kết thúc** | Như trên. Ngày kiểm kê của một kho không làm dừng picking của kho khác |
| Kho nào nghỉ vào ngày lễ | **Thiết lập chu kỳ giao hàng (màn hình 01)** | Theo từng kho | Đặt thao tác đăng ký gộp các ngày lễ của kỳ đối tượng làm ngày không thể |
| Kỳ tạm ngưng chu kỳ・ngày xử lý như ngày lễ giao hàng | **Thiết lập chu kỳ giao hàng (màn hình 01)** | **Chung toàn công ty** | Vì bản thân chu kỳ giao hàng (28 slot) là chung toàn công ty |
| **Ngưỡng số lượng** (mặc định 300 mục／ngày) | **Master kho** | Theo từng kho | **Giá trị năng lực của kho**, không liên quan đến ngày. Giao hàng vật tư không tính vào số lượng. **Giao hàng mẫu kinh doanh (loại 「サンプル」 (Mẫu)) được tính vào số lượng** (sổ quyết định S・2026-10-08 #451) |
| **Lead time chỉ thị xuất hàng** (mặc định 3 ngày) | **Master kho** | Theo từng kho | Như trên. Quyết định **thời điểm xuất** (không phải điểm bắt đầu của `locked`) |
| **Liên kết** (đơn vị xuất CSV chỉ thị xuất hàng・cách xử lý hủy・hạn chót gửi lại) | **Master kho** | Theo từng kho | Như trên |
| **Lead time (picking → giao hàng)** | **Loại giao hàng của hợp đồng** | Theo từng hợp đồng (cơ sở)・từng loại (Lạnh／Đông lạnh／Vật tư) | **Cả master kho lẫn điểm trung chuyển đều không giữ. Cũng không tự động bổ sung giá trị mặc định** |
| **Loại chuyến `service_form`** | **Loại giao hàng (delivery channel)** | Theo từng loại giao hàng | **Không đặt ở tuyến của hợp đồng** 〔Quyết định v2.1 #7〕 |
| Tuyến giao hàng (kho・công ty giao hàng・trung chuyển・lead time) | **Hợp đồng cha = giá trị mặc định／Hợp đồng con = giá trị thực tế của tháng đó** | Hợp đồng・hợp đồng con | Khi tạo hợp đồng con thì chụp snapshot từ hợp đồng cha. **Khi tạo lịch dự kiến, nếu hợp đồng con của tháng đó đã được tạo thì dùng tuyến của hợp đồng con, chỉ dùng giá trị mặc định của hợp đồng cha khi chưa có hợp đồng con** 〔Quyết định v2.1 S2〕〔Yêu cầu REQ-DL-884〕 |
| **Ngày trong tuần không thể giao hàng**・ngày không thể nhận hàng・**dời sớm・dời muộn** | **Hợp đồng (cơ sở)** | Theo từng hợp đồng (cơ sở) | Chỉ kiểm soát ngày giao hàng |
| **Khung giờ nhận hàng** | **Bảng con của cơ sở `site_receive_windows`** | Theo từng cơ sở・nhiều dòng | §3-7 〔Quyết định v2.1 #8〕 |

- **Không cho chỉnh sửa ô không thể xuất hàng ở master kho.** Khi thêm mới kho thì ở trạng thái chưa thiết lập, nên danh sách hiển thị 「出荷不可枠：未設定」 và dẫn đến màn hình 01 〔Yêu cầu REQ-DL-686〕 **Người đăng ký là vận hành (logistics).** Vì kho không có màn hình trong hệ thống nên việc đăng ký ngày **không thể xuất hàng** và xem màn hình 04 đều do vận hành thực hiện. **Tab kho chỉ là bộ lọc** 〔Quyết định v2.1 #2〕〔Yêu cầu REQ-DL-680・885〕
- Khi lưu màn hình 01, hiển thị **xem trước số lượng bị ảnh hưởng** (tự động tạo lại `draft` N mục／tự động dời sớm N mục／override đã phê duyệt N mục <kèm chi tiết áp dụng・hết hiệu lực・đang đề xuất>／không thể dời sớm N mục／**đã ra chỉ thị xuất hàng (`locked`・không thể thay đổi) N mục**), xác nhận rồi mới lưu 〔Chu kỳ §2.3・§4A-5B〕〔Yêu cầu REQ-DL-688・724・823〕

### 3-7. Khung giờ nhận hàng của cơ sở (bảng con)

Tách biệt với ngày không thể nhận hàng (ngày trong tuần không thể giao hàng・ngày không thể nhận hàng), giữ **khung giờ có thể nhận hàng và cách giao hàng** làm mục của cơ sở, và **sao chép vào dữ liệu giao hàng để hiển thị cho tài xế** 〔Chu kỳ §3.1C〕〔Yêu cầu REQ-DL-838・877・878〕〔Quyết định v2.1 #8〕

| Mục | Cách giữ | Bắt buộc | Giải thích |
|---|---|---|---|
| **Khung giờ nhận hàng** | **Bảng con `site_receive_windows(site_id, from_time, to_time, sort_order)`** | ○ | Khung giờ cơ sở đó có thể nhận hàng (ví dụ `09:00`〜`12:00` và `13:00`〜`16:00`). **Một cơ sở có thể có nhiều dòng** |
| **Điều kiện giao hàng** | text | ○ | Cách nhận hàng (ví dụ: "Chuyển vào từ cửa sau", "Nộp phiếu tiếp nhận tại phòng bảo vệ", "Không đặt hàng tại cửa khi người phụ trách vắng mặt"). Bản thân sơ đồ đường vận chuyển được giữ riêng làm "tài liệu của địa điểm" |

| Vấn đề | Quy định |
|---|---|
| **Cấm giữ 1 bộ** | **Không làm dạng chỉ giữ 1 bộ `from`/`to`.** Vì có cơ sở chia buổi sáng・buổi chiều, 1 bộ không thể hiện được |
| Phía dữ liệu giao hàng | **`delivery_receive_windows(delivery_id, from_time, to_time, sort_order, snapshot_at)`** |
| **Thời điểm snapshot** | **Khi tạo dữ liệu giao hàng (tạo xác định), sao chép `site_receive_windows` nguyên danh sách sang `delivery_receive_windows`** (xử lý giống địa chỉ). Không chọn chỉ 1 dòng mà sao chép **toàn bộ các dòng tại thời điểm đó kèm `sort_order`** |
| Giai đoạn lịch dự kiến (`draft`) | **Không snapshot.** Lịch dự kiến được hiển thị bằng cách tham chiếu master cơ sở |
| Khi sao chép | Dữ liệu giao hàng con được tạo ở giao lại・giao từng phần・chuyến thay thế **sao chép nguyên snapshot của cha** (không lấy lại master cơ sở tại thời điểm sao chép) |
| Hiển thị cho tài xế | **Hiển thị tất cả khung giờ trên thẻ nơi giao hàng theo thứ tự `sort_order`.** Làm sao cho tài xế không cần đi xem master cơ sở |
| Quan hệ với tính ngày | **Khung giờ nhận hàng không dùng để tính ngày.** Ngày giao hàng được quyết định bằng ngày không thể nhận hàng・**ngày trong tuần không thể giao hàng**. Đây là thông tin để tài xế・công ty giao hàng ủy thác quyết định thứ tự đi trong ngày |

> ✅ **Cần xác nhận #1 (đã giải quyết)** — ~~Hiển thị lịch dự kiến đến đâu (trước mấy tháng・đến mục nào) trên site riêng của công ty giao hàng là chưa quyết~~ → **Đã giải quyết ở phụ lục 4 ngày 2026/09/29**. Lịch dự kiến (trước hạn chót) chỉ hiển thị **đến chu kỳ tháng sau・ngày giao hàng・tên cơ sở・vùng nhiệt độ・số lượng**, sau khi xác định thì tất cả các mục. Chỉ thấy được **giao hàng có đoạn do công ty mình phụ trách** 〔Quyết định v2.3 #34・#51〕 (11-6)

> ⚠️ **Cần xác nhận #2** — Việc thay đổi ngày "từng mục・bắt buộc có lý do" sau hạn chót đặt hàng・trước `locked` có xoay xở được bằng tay của vận hành khi số lượng nhiều hay không. **Vì ở #63 ngày 2026/09/29 đã cho phép thay đổi từng mục từ sau hạn chót đến ngày trước ngày xuất hàng nên mối lo này vẫn còn** (8-3) 〔Quyết định v2.3 #63〕 (Cũ: Đã giải quyết ở quyết định lần 3 ngày 2026/09/22 — sau hạn chót không đổi ngày mà hủy + sao chép. Sửa theo sổ quyết định 2026-10-03)

> ⚠️ **Cần xác nhận #3** — Chỉ thị xuất hàng của Thomas có I/F hủy hay không (tiến hành theo phương thức gửi lại có số phiên bản, nhưng cần xác nhận với nhà cung cấp phần mềm). Việc hỗ trợ UTF-8 của CSV Thomas cũng đang xác nhận với nhà cung cấp phần mềm 〔Quyết định §G〕〔Yêu cầu §9 điểm OPEN〕. **Phụ lục 4 ngày 2026/09/29 đã xác định phương châm**: Hủy bằng phương thức gửi lại (phiên bản mới với số lượng 0), dù có I/F hủy cũng không dùng／CSV được làm sao cho chỉ cần thay phần xuất／nếu UTF-8 không được thì khi xuất dùng Shift_JIS 〔Quyết định v2.3 #45〕. Bản thân việc xác nhận với nhà cung cấp phần mềm vẫn còn (10-3・10-4)

> ✅ **Cần xác nhận #4 (đã giải quyết)** — ~~Thời điểm bắt đầu của hạn chót gửi lại chỉ thị xuất hàng = "đến trước khi bắt đầu picking" chưa quyết~~ → **Đã giải quyết ở quyết định lần 3 ngày 2026/09/22**. Được gửi lại **cho đến khi nhận được thực tích xuất hàng của giao hàng đó**, không giữ thời điểm bắt đầu picking của kho 〔Quyết định v2.2 #4〕 (10-3)

> ⚠️ **Cần xác nhận #5** — [Tạm thời] HU = Hub (điểm trung chuyển). Ý nghĩa chính xác trong hệ thống hiện có, và ID điểm trung chuyển có đang được dùng trong liên kết bên ngoài như vận đơn・liên kết CSV・biểu mẫu hay không 〔Quyết định E#5〕

> ✅ **Cần xác nhận #6 (đã giải quyết)** — ~~[Tạm thời] Mã kho của kho picking dùng nguyên ID kho (dạng WH00001)~~ → **Đã giải quyết ở D3-2 ngày 2026/10/01**. Mã kho do vận hành nhập, tách biệt với ID kho (3-1 #8) 〔Quyết định E#6〕

> ✅ **Cần xác nhận #7 (đã giải quyết)** — ~~Nguồn dữ liệu ngày lễ~~ → Xác định là **tự động lấy 1 lần mỗi năm từ API ngày lễ công khai + 「祝日を再取得」** (D3-3 ngày 2026/10/01) 〔trả lời của hong 2026-10-03〕 (3-5). (Cũ: [tạm thời] dữ liệu công khai của Văn phòng Nội các・thủ công) 〔Quyết định E#9〕

> ⚠️ **Cần xác nhận #8** — [Tạm thời] Tên chính thức của các cách gọi 「ヤマト運輸（略称：ヤマト）」 (Yamato Transport, viết tắt: Yamato) và 「トーマス」 (Thomas) (quan hệ với Kurubin Yamato, cách viết THOMAS) 〔Quyết định E#58〕〔Chu kỳ §0-1〕

> ⚠️ **Cần xác nhận #9** — [Tạm thời] Túi giữ lạnh・đá giữ lạnh gửi qua Yamato là dùng một lần (không thu hồi), chỉ ghi lại số. Thực tế có đang thu hồi hay không, có nhờ doanh nghiệp trả lại hay không 〔Quyết định E#64〕

> ⚠️ **Cần xác nhận #10** — Có cần mục "loại tên công ty" của quản lý tài xế hay không (xác nhận với công ty D). Các ô "Đánh giá" "Ghi chú" đã bị xóa 〔Yêu cầu REQ-DL-413〕

> ✅ **Cần xác nhận #11 (đã giải quyết)** — ~~Cách vận hành khi muốn xuất hàng vào ngày bị dừng do tạm ngưng điều chỉnh (ngày thực tế kho không nghỉ)~~ → **Đã giải quyết ở quyết định lần 3 ngày 2026/09/22**. Vì quản trị viên có thể quyết định vị trí đặt ngày điều chỉnh, nếu có ngày muốn xuất hàng thì dời ngày điều chỉnh đó sang ngày khác 〔Quyết định v2.2 #2〕 (4-5 Quy tắc 4)

> [2026-10-13 rút lại: đã bỏ mục cần xác nhận 「短消費期限の注意」 (Chú ý hạn dùng ngắn) (sổ quyết định X)] ✅ **Cần xác nhận #12 (đã giải quyết)** — ~~Điều kiện xác định tự động đối với thay đổi có chứa sản phẩm hạn dùng ngắn là chưa quyết~~ → **Đã giải quyết ở phụ lục 4 ngày 2026/09/29**. Nếu **số ngày từ ngày xuất hàng〜ngày giao hàng ＞ số ngày hạn dùng − số ngày an toàn (mặc định 2 ngày)** thì cần xác nhận `shelf_life_warning`. Việc chia vẫn do vận hành quyết định 〔Quyết định v2.3 #35〕 (9-4・15-9)

---

## Lịch sử thay đổi

| Ngày họp | Đối tượng (mục・REQ) | Trước thay đổi | Sau thay đổi | Lý do thay đổi | Căn cứ (MM・thời điểm) | Trạng thái |
|---|---|---|---|---|---|---|
| 2026/10/09 | Tính phí phụ phí vùng | Cách đưa vào tùy chọn của hợp đồng con (tự động hay vận hành) là cần xác nhận | Vận hành gắn tùy chọn và nhập số tiền thanh toán. Số tiền tính phí = phụ phí (1 lần) của bảng khung giá × số lần giao | Thỏa thuận với khách hàng | 〔MM_20261009_1200 ［02:46:31〜02:50:34］〕 sổ tiếp nhận #511 | 実装待ち (chờ triển khai) |
| 2026/10/09 | Phụ phí vùng (địa điểm thứ 2 trong khu vực lân cận) | Không có ghi chép | Không xử lý tự động. Vận hành xác định rồi sửa sau | Vì khó phán đoán có phải khu vực lân cận hay không | 〔MM_20261009_1200 ［02:48:00］〕 sổ tiếp nhận #512 | 実装待ち |
| 2026/10/09 | Danh sách cơ sở・giao hàng đang phụ trách (master đơn vị giao hàng ủy thác) | Việc phân bổ công ty giao hàng・ngày trong tuần cho khách hàng mới được xem bằng spreadsheet. Trong hệ thống chỉ có tìm kiếm địa chỉ của lịch giao hàng và hiển thị ngày trong tuần hỗ trợ | Trong chi tiết của master đơn vị giao hàng ủy thác, hiển thị danh sách cơ sở・giao hàng đang (đã) phụ trách (tìm kiếm địa chỉ・đang phụ trách／trước đây phụ trách・CSV) | Để gom khách hàng mới vào cùng công ty giao hàng・ngày trong tuần với khách hàng hiện có ở gần | 〔MM_20261009_1200 ［02:56:38〜02:59:56］〕 sổ tiếp nhận #513 | 実装待ち |
