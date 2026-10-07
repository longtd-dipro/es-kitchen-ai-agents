# Đặc tả giao hàng: Master (§3)

<!-- Nguồn: Đặc_tả_tích_hợp_Chu_kỳ_Xuất_hàng_Picking_Giao_hàng_v2.3.md (được tách theo chương vào 2026-10-03. Phần nội dung giữ nguyên như thời điểm tách) -->

## 3. Master

### 3-1. Master kho (màn hình 06B)

Dùng nguyên màn hình của **master điểm trung chuyển** hiện có làm khung, thay đổi hiển thị mục theo **loại kho** (Picking／Trung chuyển／**Điểm trả hàng**) 〔Chu kỳ §2.3A〕〔Yêu cầu REQ-DL-410・665〕〔Quyết định v2.3 #41〕. Chú thích: **◎** bắt buộc／**○** tùy chọn／**—** không có

| # | Mục | Hình thức nhập | Picking | Trung chuyển | Giải thích |
|---|---|---|---|---|---|
| 1 | ID kho | Tự động đánh số・chỉ đọc | ◎ | ◎ | Tiền tố khác nhau theo loại (`WH` / `HU` / **`RT` = điểm trả hàng** <thêm 2026/10/01・đặt tạm>). **Chữ cái đầu không được trùng với ID của master khác** (master nhà cung cấp bỏ `HU`・STEP6) |
| 2・3 | Tên kho／Tên kho (dùng cho phiếu) | Văn bản | ◎ | ◎ | Tên dùng cho phiếu là tên hiển thị trên **nơi xuất hàng của vận đơn** |
| 4 | Kana | Văn bản | ○ | ○ | Dùng để tìm kiếm. Điểm trung chuyển có nhiều nên thực chất gần như bắt buộc |
| 5 | Loại kho | Chọn (Picking／Trung chuyển／**Điểm trả hàng**) | ◎ | ◎ | **Không thể thay đổi sau khi đăng ký** (chỉ đọc). **Điểm trả hàng (`warehouse_type = return`) được thêm trong phụ lục 4 ngày 2026/09/29** (ghi chú bên dưới) 〔Quyết định v2.3 #41〕 |
| 6 | Loại vận chuyển | Chọn (master công ty giao hàng) | — | ◎ | **Công ty giao hàng đang vận hành** điểm trung chuyển đó |
| 7 | Trạng thái | Chọn (Hợp lệ／Vô hiệu／Đã xóa) | ◎ | ◎ | "Cách xử lý trạng thái" bên dưới |
| 8 | Mã kho (dùng liên kết THOMAS) | Văn bản | ○ | — | **Mã dùng cho chỉ thị xuất hàng đến THOMAS (hệ thống kho). Vì không cố định nên vận hành nhập** (khác với ID kho. Thay đổi 2026/10/01・xác nhận của vận hành D3-2. Cũ: [tạm thời] dùng nguyên ID kho <dạng `WH00001`>). Chỉ bắt buộc khi liên kết THOMAS = có |
| 8B | Liên kết THOMAS | Chọn (Có／Không) | ◎ | — | Kho **không** liên kết (ví dụ: **văn phòng ES** xuất vật tư) không gửi chỉ thị xuất hàng đến THOMAS, làm việc bằng danh sách picking (màn hình) và CSV vận đơn (thêm 2026/10/01・xác nhận của khách hàng A2) |
| ~~8C~~ | ~~Khu vực phụ trách~~ | — | — | — | **Hủy đêm 2026/10/01 (Q-E = A): kho không chia theo khu vực phụ trách. Kho của mẫu kinh doanh: nếu chỉ có một kho xử lý thì là kho đó, nếu có nhiều kho thì vận hành chọn** (cũ: thêm ở T4-2) |
| 9 | Mã văn phòng | Văn bản | — | ◎ | **Mã văn phòng của công ty giao hàng. Hiển thị trên vận đơn**. Có thể thay đổi theo giá trị được cấp |
| 10〜14 | Mã bưu điện／Tỉnh thành／Quận huyện／Khu vực・số nhà／Tên tòa nhà・số phòng | Văn bản・chọn | ◎◎◎◎○ | ◎◎◎◎○ | Tỉnh thành・**quận huyện・mã bưu điện** là khóa tìm kiếm điểm trung chuyển (thay đổi 2026/09/30. Cũ: tỉnh thành là khóa tìm kiếm điểm trung chuyển) 〔Bảng yêu cầu dòng 29・Quyết định_Phản ánh một phần bảng yêu cầu_Trả lời_20260930〕 |
| 15〜17 | Số điện thoại／Số FAX／Ghi chú | Văn bản | ◎○○ | ◎○○ | |
| 18〜22 | Người phụ trách (loại <chính／phụ>／tên người phụ trách／furigana／địa chỉ email／TEL) | Nhiều dòng | ○ | ○ | **Tất cả tùy chọn**. Không đăng ký vẫn lưu được |
| 23 | Ngưỡng số lượng | Số (**mặc định 300**) | ◎ | — | Chỉ cảnh báo ngày vượt quá, không dừng xử lý. **Giao hàng vật tư không tính vào số lượng** |
| 24 | Lead time chỉ thị xuất hàng | Số (**mặc định 3**) | ◎ | — | Chỉ thị xuất hàng gộp cho 2 tuần được đưa ra trước ngày bắt đầu của kỳ đối tượng bao nhiêu ngày (= "khi nào gửi") |
| 25〜28 | Cách xử lý ngày **không thể xuất hàng**／liên kết (đơn vị xuất CSV chỉ thị xuất hàng・hủy・hạn chót gửi lại) | Hiển thị cố định | ◎ | — | **Không có kho thay thế** (không tự động chuyển, "cần xác nhận"). CSV theo **từng kho**・theo chuẩn Thomas. **Không có hủy, ghi đè bằng gửi lại có số phiên bản, dừng bằng gửi lại với số lượng 0** |

- **Điểm trả hàng (`warehouse_type = return`)**: Cơ sở đăng ký làm nơi nhận khi gửi trả hàng còn lại về trụ sở, v.v. 〔Quyết định v2.3 #41〕. **Chỉ khi lý do sao chép là "trả hàng"** mới chọn được làm nơi giao hàng (8-4). Các mục dùng cho điểm trả hàng (tiền tố ID・thay đổi hiển thị mục bắt buộc) cũng không được ghi trong DEV nên chưa được định nghĩa
- **Master kho không có lead time.** Lead time được giữ **theo từng loại giao hàng của hợp đồng (Lạnh／Đông lạnh／Vật tư)** và **cũng không tự động bổ sung giá trị mặc định**. "Lead time theo khu vực", "Khu vực", "Ngày dự kiến đóng cửa" của bản cũ đã bị xóa, việc đóng cửa được thể hiện bằng trạng thái #7 〔Chu kỳ §2.3A・§12-1〕〔Quyết định #10／#16／#52〕
- **Điểm bắt đầu của `locked` không phải "lead time chỉ thị xuất hàng" mà là "lần đầu gửi thành công chỉ thị xuất hàng"**. #24 chỉ quyết định **thời điểm xuất** 〔Quyết định v2.1 #3〕〔Yêu cầu REQ-DL-867・812〕
- **Master kho cũng không có vùng nhiệt độ hỗ trợ** (suy ra từ kho xử lý của sản phẩm・§3-4). Vì vậy **mục bắt buộc chỉ riêng kho picking là 1 mục "Mã kho"**, mục bắt buộc chỉ riêng điểm trung chuyển là "Loại vận chuyển" và "Mã văn phòng" 〔Chu kỳ §2.3A・§2.3B〕〔Yêu cầu REQ-DL-668〕

**Cách xử lý trạng thái** 〔Chu kỳ §2.3A〕〔Yêu cầu REQ-DL-683・684〕

| Trạng thái | Nơi gán của hợp đồng | Lịch dự kiến・dữ liệu giao hàng hiện có | Danh sách | Có thể khôi phục không |
|---|---|---|---|---|
| **Hợp lệ** | Hiển thị | Như thường lệ | Hiển thị theo mặc định | — |
| **Vô hiệu** (đã dừng sử dụng) | Không hiển thị | **Không động đến**. Hoàn thành xuất hàng・giao hàng như cũ | Mặc định ẩn. Hiển thị bằng bộ lọc | Có thể khôi phục |
| **Đã xóa** (đăng ký nhầm・trùng lặp) | Không hiển thị | **Không động đến** | Chỉ hiển thị với "Bao gồm đã xóa" | Chỉ quản trị viên vận hành・bắt buộc có lý do |

- **Không xóa vật lý.** Chỉ có thể xóa **khi số lịch dự kiến・dữ liệu giao hàng đang tham chiếu là 0**, nếu có dù chỉ 1 mục thì hiển thị số lượng và nhắc "Bạn có muốn vô hiệu hóa không". Vô hiệu hóa・xóa đều bắt buộc có lý do và lưu vào lịch sử thay đổi. **Không có đăng ký tạm**, văn phòng chưa sử dụng thì đăng ký ở trạng thái "Vô hiệu"
- Đăng ký mới là **một nút "＋ Thêm kho"**. Sau khi bấm sẽ chen vào **bước chọn loại kho** (**mặc định là "Điểm trung chuyển"**), sau khi chọn mới hiển thị form 〔Yêu cầu REQ-DL-685〕. Màn hình chọn loại kèm theo mục bắt buộc và tiền tố ID của từng loại. Nếu chọn nhầm loại, khi số tham chiếu là 0 thì xóa rồi đăng ký lại, nếu có dù chỉ 1 thì vô hiệu hóa rồi đăng ký mới. **Hợp đồng vẫn còn lịch dự kiến ở kho đã vô hiệu hóa sẽ hiển thị trong danh sách, vận hành gán lại thủ công**. Các tab là Thông tin cơ bản／Lịch sử thay đổi 〔Nguồn gốc: Cài đặt chu kỳ giao hàng §2.3A〕
- Danh sách có **tìm kiếm (tên kho・kana・mã văn phòng・tỉnh thành・quận huyện・mã bưu điện)** (thay đổi 2026/09/30. Cũ: tên kho・kana・mã văn phòng・tỉnh thành)**／lọc theo loại kho・loại vận chuyển／phân trang／nhập hàng loạt・cập nhật hàng loạt bằng CSV**. Khi thêm mới kho, ô **không thể xuất hàng** ở trạng thái chưa thiết lập, nên danh sách hiển thị **"Ô không thể xuất hàng: chưa thiết lập"** và dẫn đến màn hình 01 〔Chu kỳ §2.3A〕〔Yêu cầu REQ-DL-672・673・674・686〕 Danh sách hiển thị **cột địa chỉ** (mã bưu điện・tỉnh thành・quận huyện・khu vực・số nhà). **Hệ thống không tự động xác định điểm trung chuyển (văn phòng) gần nhất**. Vận hành tìm bằng địa chỉ để chọn, nếu không tìm thấy thì đăng ký mới 〔Bảng yêu cầu dòng 29・Quyết định_Phản ánh một phần bảng yêu cầu_Trả lời_20260930〕 **Chuyển đổi**: Dữ liệu điểm trung chuyển hiện có được nhập vào nguyên như **loại kho = Trung chuyển** (khoảng 300 mục bằng CSV). Công việc bổ sung chỉ là **đăng ký 2 kho picking**, **thiết lập ô không thể xuất hàng ở màn hình 01**, **thiết lập kho xử lý của sản phẩm** 〔Chu kỳ §2.3B〕

### 3-2. Điểm trung chuyển

> **Thêm 2026/10/01 (xác nhận của khách hàng B1)**: Việc đóng cửa văn phòng không được phát hiện tự động (không có phương tiện). Thay vào đó, trong chi tiết của điểm trung chuyển, hiển thị **danh sách cơ sở (tuyến giao hàng của hợp đồng) đang dùng điểm trung chuyển đó**, để khi biết đóng cửa có thể xác nhận ngay các cơ sở bị ảnh hưởng 〔Yêu cầu REQ-DL-209〕.

| Góc nhìn | Nội dung | Nguồn |
|---|---|---|
| Bản chất | **Văn phòng của công ty giao hàng** (văn phòng của Yamato Transport. Dự kiến sau này cũng dùng văn phòng của Sagawa Express). **Cơ sở của công ty giao hàng ủy thác cũng có thể đăng ký làm điểm trung chuyển** 〔Quyết định v2.3 #50〕. Được quản lý cùng trong **master kho** như điểm trung chuyển của tuyến giao hàng | 〔Chu kỳ §2.3A・§2.3B〕〔Yêu cầu 8H-6〕 |
| Số lượng | **Khoảng 300 mục**. Tiền đề là tìm kiếm・lọc・phân trang・nhập／cập nhật hàng loạt bằng CSV | 〔Chu kỳ §2.3A〕〔Yêu cầu 8H-6〕 |
| Số bậc trung chuyển | **Không giả định trung chuyển từ 2 bậc trở lên** | 〔Yêu cầu 8H-6〕 |
| Mã văn phòng | **Được công ty giao hàng cấp và có thể thay đổi**. Hiển thị trên vận đơn. Cho phép cập nhật hàng loạt bằng CSV | 〔Chu kỳ §2.3A〕〔Yêu cầu REQ-DL-673〕 |
| Những thứ không có | **Không có lead time**. **Cũng không phát hành lại vận đơn**. Không có ngưỡng số lượng・lead time chỉ thị xuất hàng・ô **không thể xuất hàng**・ngày không thể theo từng ngày. **Cũng không lấy trạng thái trung gian** | 〔Chu kỳ §2.3B・§4C-2〕〔Yêu cầu REQ-DL-814〕 |
| Cách giữ trung chuyển | Chỉ hiển thị **2 giá trị "có／không trung chuyển"**, **suy ra từ route legs. Không lưu thành trạng thái** | 〔Chu kỳ §4C・§4C-2〕〔Yêu cầu REQ-DL-876〕〔Quyết định v2.1 #7〕 |
| Gán tài xế | **Gán theo đơn vị đoạn (leg). Đoạn do nhà vận chuyển (`parcel_carrier`) vận chuyển thì không gán, đoạn do công ty (`self`)・ủy thác (`partner_driver`) vận chuyển thì gán** (quyết định theo người vận chuyển của đoạn chứ không phải phân biệt 1 lần・2 lần) (Cũ: hiện tại chỉ gán lần 2 <điểm trung chuyển → nơi giao hàng> <lần 1 do nhà vận chuyển chở>. Thay thế 2026/09/29 〔Quyết định v2.3 #48〕) | 〔Yêu cầu REQ-DL-836〕〔Quyết định #60〕〔Quyết định v2.3 #48〕 |
| Cách được chọn từ hợp đồng | "Điểm trung chuyển" của loại giao hàng. Từ **toàn bộ trung chuyển (`HU`) của master kho** 〔Quyết định v2.3 #50〕, chọn bằng **kiểu tìm kiếm chứ không phải pulldown** | 〔Chu kỳ §2.3A・§12-1〕〔Yêu cầu REQ-DL-674〕 |
| Xác định gần nhất (thêm 2026/09/30) | **Không tự động xác định (chỉ tìm kiếm)**. Tìm danh sách điểm trung chuyển theo tỉnh thành・quận huyện・mã bưu điện, xem cột địa chỉ để chọn. Nếu không tìm thấy thì đăng ký mới | 〔Bảng yêu cầu dòng 29・Quyết định_Phản ánh một phần bảng yêu cầu_Trả lời_20260930〕 |
| Phát hiện ngừng hoạt động・đóng cửa | Việc đóng cửa văn phòng Yamato không có API nên **xác định bằng scraping**, nếu không tìm thấy thì đánh cờ là văn phòng đóng cửa và thông báo [tạm thời] | 〔Yêu cầu REQ-DL-208〕 |
| Tài liệu của địa điểm | Sơ đồ đường vận chuyển・hướng dẫn được giữ ở **phía master cơ sở・điểm trung chuyển (tài liệu của địa điểm)**, không sao chép vào dữ liệu giao hàng mà hiển thị bằng tham chiếu | 〔Chu kỳ §4A-4C〕〔Yêu cầu REQ-DL-826〕 |

- Tuyến giao hàng **bỏ 2 bước cố định (kho picking → điểm trung chuyển) và là cấu trúc biến đổi cho phép chỉ định nơi gửi・nơi nhận mỗi lần**. Hiển thị nơi nhận **chia thành 2 dòng** điểm trung chuyển và nơi giao hàng cuối cùng 〔Chu kỳ §0〕〔Yêu cầu REQ-DL-411〕 **Dù có trung chuyển, lead time chuẩn là một tổng.** Phần trung chuyển chỉ hiển thị làm giá trị tham khảo, không dùng để tính toán 〔Quyết định #21〕

### 3-3. Master công ty giao hàng・công ty giao hàng ủy thác (màn hình 06C)

| Góc nhìn | Nội dung | Nguồn |
|---|---|---|
| **Vùng nhiệt độ hỗ trợ** | **3 giá trị: Đông lạnh／Lạnh・nhiệt độ thường／Vật tư** (nhiệt độ thường được xếp vào cùng ô với lạnh). 4 giá trị・2 giá trị đều bị hủy. **Các lựa chọn của form đăng ký công ty giao hàng ủy thác cũng thống nhất theo 3 giá trị này** | 〔Chu kỳ §12-1〕〔Yêu cầu REQ-DL-402〕〔Quyết định #8〕 |
| Những thứ khác có | **Khu vực hỗ trợ (theo đơn vị tỉnh thành)** (thay đổi 2026/09/30. Cũ: Kanto／Chubu／Kansai／Kyushu)・**ngày trong tuần hỗ trợ**・**bảng phí** (dòng bên dưới)・**sổ cái túi giữ lạnh・túi đá giữ lạnh** (12-5. Thay đổi 2026/10/01. Cũ: mỗi lần một túi giữ lạnh No・đá giữ lạnh No)・**ngày không thể giao hàng ủy thác**・**mục dùng quản lý đá giữ lạnh**・**có/không máy bán hàng tự động** | 〔Chu kỳ §12-1〕〔Yêu cầu REQ-DL-412〕〔Bảng yêu cầu dòng 28・44・57・Quyết định_Phản ánh một phần bảng yêu cầu_Trả lời_20260930〕 |
| **Mẫu URL theo dõi** (thêm 2026/10/01・O-4) | Với từng công ty giao hàng (nhà vận chuyển・ủy thác), vận hành nhập URL có ghi `{送り状番号}` tại chỗ điền số vận đơn. Trên màn hình・email, thay `{送り状番号}` để tạo liên kết. **Nếu công ty giao hàng đổi dạng URL thì vận hành sửa trong master** (không sửa code). Nếu để trống thì chỉ hiển thị số, và là liên kết đến trang liên hệ (trang chủ) của công ty giao hàng. Ví dụ Yamato Transport: `https://member.kms.kuronekoyamato.co.jp/parcel/detail?pno={送り状番号}` (trang chủ liên hệ `https://toi.kuronekoyamato.co.jp/cgi-bin/tneko`). Chuyến lấy hàng do ES đánh số thì xác nhận trong chi tiết giao hàng của Web doanh nghiệp |
| **Bảng phí** (thêm 2026/09/30) | Giữ **khu vực (tỉnh thành) × phí thanh toán・phụ phí vùng** theo từng công ty giao hàng ủy thác. **Có thể nhập bằng CSV** (cũng chuyển sheet hiện có・danh sách nhà thầu và số tiền của Notion thành CSV để nhập). Đơn vị của phí thanh toán (mỗi lần／hàng tháng) và việc có chia phí theo khu vực nhỏ hơn tỉnh thành hay không là **cần xác nhận** | 〔Bảng yêu cầu dòng 39・57・Quyết định_Phản ánh một phần bảng yêu cầu_Trả lời_20260930〕 |
| **Phụ phí vùng** (thêm 2026/09/30) | **Vận hành nhập thủ công vào master nơi giao hàng ủy thác (không tự động tính)**. Hiển thị làm mức tham khảo trong liên hệ giao hàng (bên dưới), và sau khi ký hợp đồng được **tính phí như tùy chọn của hợp đồng con (phí giao hàng theo vùng của master tùy chọn)** (14-2) | 〔Bảng yêu cầu dòng 53・78・Quyết định_Phản ánh một phần bảng yêu cầu_Trả lời_20260930〕 |
| **Những thứ không làm** (thêm 2026/09/30) | **Bản đồ toàn quốc (hiển thị bản đồ)** và **tìm kiếm tổ hợp ngày trong tuần giao hàng (thứ X tuần thứ 1 thứ 3, v.v.)** không làm. Thay vào đó xác nhận bằng tìm kiếm địa chỉ của lịch giao hàng (15-2) và hiển thị ngày trong tuần hỗ trợ・phí của master nơi giao hàng ủy thác | 〔Bảng yêu cầu dòng 28・39・Quyết định_Phản ánh một phần bảng yêu cầu_Trả lời_20260930〕 |
| Kiểm tra nhất quán | Đối chiếu **khu vực nơi giao hàng** của hợp đồng (từ 2026/09/30 đối chiếu theo tỉnh thành 〔Bảng yêu cầu dòng 57・Quyết định_Phản ánh một phần bảng yêu cầu_Trả lời_20260930〕) và **vùng nhiệt độ** của loại giao hàng, nếu chỉ định không khớp thì đưa ra **cảnh báo** ("Không hỗ trợ khu vực Kansai", v.v.). **Không cấm.** Số chỉ định không khớp luôn hiển thị bên dưới loại giao hàng. Cảnh báo chỉ là hiển thị khi nhập, **không lưu làm bản ghi, cũng không tạo mục cần xác nhận (`review_items`)**. Mỗi lần mở màn hình, đối chiếu `carriers.temp_types`・`carrier_areas` với vùng nhiệt độ của loại giao hàng・tỉnh thành của cơ sở rồi hiển thị (không có batch xem lại toàn bộ) 〔Nguồn gốc: DEV §3.2〕 | 〔Chu kỳ §12-1〕 |
| Lead time | **Không phát sinh ở phía công ty giao hàng nên không giữ.** Thay vào đó xác nhận **ngày trong tuần hỗ trợ** ở master nơi giao hàng ủy thác (thay đổi 2026/09/30. Cũ: xác nhận ngày trong tuần có thể giao <nhận qua trả lời báo giá>) (không thể cam kết chỉ định buổi sáng／buổi chiều nên không thực hiện) | 〔Yêu cầu §5〕〔Bảng yêu cầu dòng 28・Quyết định_Phản ánh một phần bảng yêu cầu_Trả lời_20260930〕 |
| **Cách được chọn ở hợp đồng** | **Công ty giao hàng lần 1・lần 2** của thiết lập giao hàng hợp đồng có thể chọn từ **toàn bộ master công ty giao hàng** (nhà vận chuyển・ủy thác・công ty). **Lần 1 cũng chọn được công ty giao hàng ủy thác** (Cũ: lựa chọn lần 1 của thiết kế chỉ có Yamato Transport・Sagawa Express・chuyến của công ty. Thay đổi 2026/09/29) | 〔Quyết định v2.3 #50〕 |

- **Form đăng ký mới công ty giao hàng ủy thác**: Đăng nhập bằng liên kết riêng + ID giao hàng ủy thác. Form đặt trong màn hình đăng ký doanh nghiệp, **cấu thành 2 trang** (1 = thông tin cơ bản <địa chỉ・người phụ trách>／2 = khảo sát <khu vực hỗ trợ・tình trạng sở hữu phương tiện・nguyện vọng thuê・ghi chú>). Thông tin doanh nghiệp chỉ nhập **tên công ty và địa chỉ**, khu vực giao hàng **theo đơn vị tỉnh thành** + chọn hàng loạt theo nhóm vùng, có **checkbox đồng ý** điều khoản sử dụng・nội dung hợp đồng 〔Yêu cầu REQ-DL-401・402・403〕. Không đặt ô nhập ngày mong muốn bắt đầu hợp đồng・thực tích・giá・địa chỉ kho cụ thể・phụ phí vùng (phụ phí vùng do vận hành nhập vào master) 〔Nguồn gốc: Yêu cầu §8D-1〕〔Yêu cầu REQ-DL-401〕 **Luồng yêu cầu・trả lời báo giá**: Tiêu đề email yêu cầu là **dạng cố định bắt đầu bằng "ESキッチン"**, nội dung là các mục của "Yêu cầu báo giá" bên dưới (tên doanh nghiệp・địa chỉ・sản phẩm xử lý <lạnh／đông lạnh>・khu vực giao hàng・hỗ trợ thứ bảy chủ nhật・gói <có/không máy bán hàng tự động>・nhiều ngày trong tuần・điều kiện số tiền・gộp nhiều cơ sở. Phương tiện sở hữu là hồ sơ của công ty giao hàng ủy thác) 〔Trả lời của hong 2026-10-03. Cũ: 2 điểm sản phẩm xử lý và khu vực giao hàng〕. Có thể so sánh kết quả báo giá của **nhiều công ty (3 công ty)** trên màn hình quản lý, **nút sao chép báo giá** để tái sử dụng dữ liệu quá khứ. Các mục trả lời là **có thể báo giá／không thể đáp ứng・phí hàng tháng・đính kèm・bình luận・điểm trung chuyển** (RD-DL-167/169), **không có chat** (thay đổi 2026/09/30. Cũ: trên màn hình trả lời đặt **ô trả lời thông tin điểm trung chuyển** và **thời hạn hiệu lực**, khi đổi số tiền thì **"Trả lời lần đầu" → "Trả lời lại"**) 〔Bảng yêu cầu dòng 41・Quyết định_Phản ánh một phần bảng yêu cầu_Trả lời_20260930〕. Có giữ thời hạn hiệu lực・trả lời lần đầu → trả lời lại hay không là **cần xác nhận** (không có trong các mục trả lời mới). Liên kết tài khoản và báo giá **không tự động hóa** mà làm thủ công. Khi xác định giao hàng sẽ **tự động gửi email xác nhận** 〔Yêu cầu REQ-DL-404〜409〕. Với khu vực biết số tiền thì hiển thị số tiền thực tích quá khứ (bảng phí), có thể bỏ qua yêu cầu báo giá 〔Nguồn gốc: Yêu cầu §5〕. Các mục của form yêu cầu báo giá là dòng "Yêu cầu báo giá" bên dưới (quyết định 2026-10-03)

#### Liên hệ giao hàng (tìm nơi ủy thác đang đàm phán・phụ phí vùng) (thêm 2026/09/30) 〔Bảng yêu cầu dòng 53・Quyết định_Phản ánh một phần bảng yêu cầu_Trả lời_20260930〕

Đặt màn hình để bộ phận kinh doanh・vận hành **tìm nơi ủy thác từ địa chỉ ngay cả khi đang đàm phán (trước khi đăng ký cơ sở)**. Tìm điểm trung chuyển・nơi ủy thác trong 1 màn hình.

| Góc nhìn | Nội dung |
|---|---|
| Điều kiện tìm kiếm | Địa chỉ (**tỉnh thành・quận huyện・mã bưu điện**)・vùng nhiệt độ. Ngay cả khi cơ sở chưa đăng ký vẫn tìm được chỉ bằng địa chỉ |
| Kết quả | **Công ty giao hàng ủy thác** thuộc khu vực hỗ trợ (tỉnh thành)・**khu vực hỗ trợ**・**ngày trong tuần hỗ trợ**・vùng nhiệt độ hỗ trợ・**mức tham khảo phí thanh toán và phụ phí vùng của bảng phí** (hiển thị nguyên giá trị của master nơi giao hàng ủy thác). Điểm trung chuyển gần đó hiển thị theo cùng điều kiện với tìm kiếm địa chỉ danh sách điểm trung chuyển (3-1) (không tự động xác định) |
| Yêu cầu báo giá | Chọn công ty giao hàng ủy thác từ kết quả để gửi **yêu cầu báo giá**. **Các mục đưa vào yêu cầu**: tên doanh nghiệp・địa chỉ・sản phẩm xử lý・khu vực giao hàng・hỗ trợ thứ bảy chủ nhật・phương tiện sở hữu・gói (có/không máy bán hàng tự động)・nhiều ngày trong tuần・điều kiện số tiền・lạnh／đông lạnh・gộp nhiều cơ sở 〔Trả lời của hong 2026-10-03〕. **Phương tiện sở hữu được giữ ở hồ sơ của công ty giao hàng ủy thác** (công ty giao hàng ủy thác hoặc quản trị hệ thống nhập), không nhập mỗi lần yêu cầu 〔Nguồn gốc: Yêu cầu §8D-2・REQ-DL-404・134〕. Trả lời nhận qua Web công ty giao hàng ủy thác (12-6). Dữ liệu là liên hệ giao hàng `delivery_inquiries`・trả lời báo giá `carrier_quote_responses` (`配送_11` 14.5) |
| Tính phí phụ phí vùng | Sau khi ký hợp đồng, **tính phí như tùy chọn của hợp đồng con (phí giao hàng theo vùng của master tùy chọn)** (14-2). Kết quả tìm kiếm chỉ là mức tham khảo. Cách đưa vào tùy chọn của hợp đồng con (tự động tạo hay vận hành nhập) là **cần xác nhận** |
| Những thứ không làm | Bản đồ toàn quốc・tìm kiếm tổ hợp ngày trong tuần giao hàng・tự động xác định nơi ủy thác |

### 3-4. Sản phẩm và kho

**Sản phẩm và kho được giữ theo quan hệ nhiều-nhiều** (`master sản phẩm ──< kho xử lý sản phẩm >── master kho`) 〔Chu kỳ §2.3C〕〔Yêu cầu REQ-DL-675・676〕

| Bảng | Nội dung giữ |
|---|---|
| **Master sản phẩm** | Mã sản phẩm・tên sản phẩm・vùng nhiệt độ・số lượng trong gói・hạn dùng・**đơn giá**・mô tả |
| **Kho xử lý sản phẩm** (mới) | Chỉ cặp sản phẩm × kho và **trạng thái xử lý (Hợp lệ／Vô hiệu)** |

- **Cách giữ**: Sản phẩm được xử lý ở cả hai kho là 1 sản phẩm + 2 dòng xử lý, sản phẩm chuyên dùng cho Kanto・chuyên dùng cho Kansai là 1 sản phẩm + 1 dòng xử lý, **nếu cùng tên sản phẩm nhưng đơn giá・mô tả khác nhau thì chia thành 2 sản phẩm** (mỗi sản phẩm 1 dòng xử lý)
- **Không giữ thuộc tính thay đổi theo kho.** Khi thiết lập cùng một sản phẩm ở cùng một kho thì giả định **tất cả giống nhau**, **nếu đơn giá hoặc mô tả khác nhau thì đăng ký như sản phẩm khác**. Số lượng trong gói・đơn giá do master sản phẩm giữ
- **Xác định vùng nhiệt độ**: Vì **master kho** không có vùng nhiệt độ hỗ trợ, nên khi chỉ định ở loại giao hàng như "Đông lạnh × Trung tâm Kokubu" thì xác định bằng **kho đó có xử lý ít nhất 1 sản phẩm của vùng nhiệt độ đó không**, nếu là 0 thì cảnh báo "Hãy thiết lập kho xử lý của sản phẩm trước" 〔Yêu cầu REQ-DL-668〕 **Thứ tự**: Hợp đồng (cơ sở) → **kho** ở loại giao hàng → **sản phẩm có xử lý** ở kho đó → sản phẩm hiển thị cho doanh nghiệp. Nếu không quyết định kho trước thì không thể đưa ra sản phẩm, nên **giữ thiết lập chọn kho ở hợp đồng**
- **Khi đổi kho của hợp đồng**: Chỉ sản phẩm không có dòng xử lý ở nơi chuyển đến mới là đối tượng thay thế. Hiển thị tách "sản phẩm dùng nguyên" và "sản phẩm cần thay thế", sau khi vận hành xác nhận sẽ áp dụng **từ tháng áp dụng (A1 của tháng chu kỳ)** 〔Yêu cầu REQ-DL-677〕
- **Khi sao chép để xuất từ kho khác**: Nếu nơi chuyển đến có dòng xử lý thì sao chép nguyên. Nếu không thì coi là **hàng thay thế**, chọn lại sản phẩm. Tồn kho giữ **theo từng kho**, **không làm di chuyển giữa các kho (chuyển ngang) ở giai đoạn 2** 〔Yêu cầu REQ-DL-678・681〕

### 3-5. Master ngày lễ

| Góc nhìn | Nội dung |
|---|---|
| Nguồn・cách nhập | **Lấy từ API ngày lễ được công khai và đăng ký vào master ngày lễ** (tự động lấy 1 lần mỗi năm + "Lấy lại ngày lễ" trên màn hình). Vận hành có thể thêm・sửa・xóa (thay đổi 2026/10/01・xác nhận của vận hành D3-3. Cũ: [tạm thời] đăng ký thủ công 1 lần mỗi năm từ dữ liệu công khai của Văn phòng Nội các, không làm nhập từ API bên ngoài) |
| Liên kết tự động | **Làm**: Tự động lấy 1 lần mỗi năm từ API ngày lễ công khai, cũng có thể lấy lại bằng "Lấy lại ngày lễ" trên màn hình. Hiển thị ngày giờ lấy gần nhất trên màn hình 〔Trả lời của hong 2026-10-03〕 (Cũ: không làm. Không có nhập tự động API bên ngoài・CSV. Cũng không hiển thị ngày giờ đồng bộ・nút đồng bộ lại. Sửa theo sổ cái 2026-10-03) |
| Thao tác của vận hành | Có thể **thêm・sửa・xóa** từ master ngày lễ |
| Hiển thị trên màn hình・mặc định | Màn hình thiết lập chu kỳ giao hàng hiển thị **số ngày lễ và danh sách ngày lễ** trong kỳ đối tượng. Ngày lễ đã đăng ký **mặc định BẬT "ngày lễ giao hàng"**, có thể đổi sang TẮT theo từng ngày (Override theo ngày) |
| Ngày nghỉ thủ công | Ngoài tên ngày nghỉ + ngày, chọn riêng "ngày lễ giao hàng" và "**không thể xuất hàng**" để thêm. **Bắt buộc ít nhất một trong hai** |
| Áp dụng | Ngày xử lý như ngày lễ giao hàng **không phải là không thể giao hàng đồng loạt toàn công ty**. Chỉ doanh nghiệp có "không thể giao hàng ngày lễ" BẬT ở hợp đồng mới dời ngày giao hàng, doanh nghiệp TẮT vẫn giao hàng như thường lệ |
| Xác định ngày trong tuần | **Không tự động xác định theo ngày trong tuần** (vì kho hầu như không nghỉ). Khả năng thứ bảy chủ nhật được kiểm soát bằng **ngày trong tuần không thể giao hàng**・ngày không thể nhận hàng phía hợp đồng |
| Ưu tiên với tạm ngưng | **Khi tạm ngưng chu kỳ và ngày lễ trùng ngày thì ưu tiên tạm ngưng chu kỳ** (ngày tạm ngưng không có slot nên không xác định ngày lễ・**không thể xuất hàng**) |

〔Chu kỳ §6・§2.3・§4.2〕〔Yêu cầu REQ-DL-307〕〔Quyết định E#9〕

### 3-6. Ranh giới giữa phía master kho và phía thiết lập chu kỳ giao hàng

**Nguyên tắc phân chia là "những gì liên quan đến lịch・ngày thì ở thiết lập chu kỳ giao hàng, thuộc tính của bản thân kho thì ở master kho"** 〔Chu kỳ §2.3・§2.3A〕〔Yêu cầu REQ-DL-686〕

| Mục thiết lập | Nơi giữ | Đơn vị | Lý do |
|---|---|---|---|
| **Ô không thể xuất hàng (A1〜D7)** | **Tab kho của thiết lập chu kỳ giao hàng (màn hình 01)** | **1 bộ** cho mỗi kho. Áp dụng cho toàn bộ kỳ đối tượng thiết lập | Vì ô không phải ngày mà là **slot chu kỳ**, nên không trên lịch thì không thể xác nhận "ngày nào sẽ dừng" |
| **Ngày không thể xuất hàng theo ngày** (kiểm kê・bảo trì thiết bị, v.v.) | **Tab kho của thiết lập chu kỳ giao hàng (màn hình 01)** | Theo từng kho. Có thể đăng ký theo **kỳ từ ngày bắt đầu〜ngày kết thúc** | Như trên. Ngày kiểm kê của một kho không làm dừng picking của kho khác |
| Kho nào nghỉ vào ngày lễ | **Thiết lập chu kỳ giao hàng (màn hình 01)** | Theo từng kho | Đặt thao tác đăng ký gộp ngày lễ của kỳ đối tượng làm ngày không thể |
| Kỳ tạm ngưng chu kỳ・ngày xử lý như ngày lễ giao hàng | **Thiết lập chu kỳ giao hàng (màn hình 01)** | **Chung toàn công ty** | Vì bản thân chu kỳ giao hàng (28 slot) chung toàn công ty |
| **Ngưỡng số lượng** (mặc định 300 mục／ngày) | **Master kho** | Theo từng kho | **Giá trị năng lực của kho** không liên quan đến ngày. Giao hàng vật tư không tính vào số lượng |
| **Lead time chỉ thị xuất hàng** (mặc định 3 ngày) | **Master kho** | Theo từng kho | Như trên. Quyết định **thời điểm xuất** (không phải điểm bắt đầu của `locked`) |
| **Liên kết** (đơn vị xuất CSV chỉ thị xuất hàng・cách xử lý hủy・hạn chót gửi lại) | **Master kho** | Theo từng kho | Như trên |
| **Lead time (picking → giao hàng)** | **Loại giao hàng của hợp đồng** | Theo từng hợp đồng (cơ sở)・từng loại (Lạnh／Đông lạnh／Vật tư) | **Master kho và điểm trung chuyển đều không giữ. Cũng không tự động bổ sung giá trị mặc định** |
| **Loại chuyến `service_form`** | **Loại giao hàng (delivery channel)** | Theo từng loại giao hàng | **Không đặt ở tuyến của hợp đồng** 〔Quyết định v2.1 #7〕 |
| Tuyến giao hàng (kho・công ty giao hàng・trung chuyển・lead time) | **Hợp đồng cha = giá trị mặc định／Hợp đồng con = giá trị thực tế của tháng đó** | Hợp đồng・hợp đồng con | Khi tạo hợp đồng con, chụp snapshot từ hợp đồng cha. **Khi tạo lịch dự kiến, nếu hợp đồng con của tháng đó đã được tạo thì dùng tuyến của hợp đồng con, chỉ dùng giá trị mặc định của hợp đồng cha khi chưa có hợp đồng con** 〔Quyết định v2.1 S2〕〔Yêu cầu REQ-DL-884〕 |
| **Ngày trong tuần không thể giao hàng**・ngày không thể nhận hàng・**dời sớm・dời muộn** | **Hợp đồng (cơ sở)** | Theo từng hợp đồng (cơ sở) | Chỉ kiểm soát ngày giao hàng |
| **Khung giờ nhận hàng** | **Bảng con của cơ sở `site_receive_windows`** | Theo từng cơ sở・nhiều dòng | §3-7 〔Quyết định v2.1 #8〕 |

- **Không cho chỉnh sửa ô không thể xuất hàng ở master kho.** Khi thêm mới kho thì ở trạng thái chưa thiết lập, nên danh sách hiển thị "Ô không thể xuất hàng: chưa thiết lập" và dẫn đến màn hình 01 〔Yêu cầu REQ-DL-686〕 **Người đăng ký là vận hành (logistics).** Vì kho không có màn hình trong hệ thống nên việc đăng ký ngày **không thể xuất hàng** và xem màn hình 04 đều do vận hành thực hiện. **Tab kho chỉ là bộ lọc** 〔Quyết định v2.1 #2〕〔Yêu cầu REQ-DL-680・885〕
- Khi lưu màn hình 01, hiển thị **xem trước số lượng bị ảnh hưởng** (tạo lại tự động `draft` N mục／tự động dời sớm N mục／override đã phê duyệt N mục <kèm chi tiết áp dụng・hết hiệu lực・đang đề xuất>／không thể dời sớm N mục／**đã ra chỉ thị xuất hàng (`locked`・không thể thay đổi) N mục**), xác nhận rồi mới lưu 〔Chu kỳ §2.3・§4A-5B〕〔Yêu cầu REQ-DL-688・724・823〕

### 3-7. Khung giờ nhận hàng của cơ sở (bảng con)

Tách biệt với ngày không thể nhận hàng (ngày trong tuần không thể giao hàng・ngày không thể nhận hàng), giữ **khung giờ có thể nhận hàng và cách giao hàng** làm mục của cơ sở, và **sao chép vào dữ liệu giao hàng để hiển thị cho tài xế** 〔Chu kỳ §3.1C〕〔Yêu cầu REQ-DL-838・877・878〕〔Quyết định v2.1 #8〕

| Mục | Cách giữ | Bắt buộc | Giải thích |
|---|---|---|---|
| **Khung giờ nhận hàng** | **Bảng con `site_receive_windows(site_id, from_time, to_time, sort_order)`** | ○ | Khung giờ cơ sở có thể nhận hàng (ví dụ `09:00`〜`12:00` và `13:00`〜`16:00`). **Một cơ sở có thể có nhiều dòng** |
| **Điều kiện giao hàng** | text | ○ | Cách nhận hàng (ví dụ: "Chuyển vào từ cửa sau", "Nộp phiếu tiếp nhận tại phòng bảo vệ", "Không đặt hàng ở cửa nếu người phụ trách vắng mặt"). Bản thân sơ đồ đường vận chuyển được giữ riêng làm "tài liệu của địa điểm" |

| Vấn đề | Quy định |
|---|---|
| **Cấm giữ 1 bộ** | **Không làm dạng chỉ giữ 1 bộ `from`/`to`.** Vì có cơ sở chia buổi sáng・buổi chiều, 1 bộ không thể hiện được |
| Phía dữ liệu giao hàng | **`delivery_receive_windows(delivery_id, from_time, to_time, sort_order, snapshot_at)`** |
| **Thời điểm snapshot** | **Khi tạo dữ liệu giao hàng (tạo xác định), sao chép `site_receive_windows` nguyên danh sách sang `delivery_receive_windows`** (xử lý giống địa chỉ). Không chọn chỉ 1 dòng mà sao chép **toàn bộ dòng của thời điểm đó theo từng `sort_order`** |
| Giai đoạn lịch dự kiến (`draft`) | **Không snapshot.** Lịch dự kiến hiển thị bằng cách tham chiếu master cơ sở |
| Khi sao chép | Dữ liệu giao hàng con được tạo ở giao lại・giao từng phần・chuyến thay thế **sao chép nguyên snapshot của cha** (không lấy lại master cơ sở tại thời điểm sao chép) |
| Hiển thị cho tài xế | **Hiển thị tất cả khung giờ trên thẻ nơi giao hàng theo thứ tự `sort_order`.** Làm sao cho tài xế không cần đi xem master cơ sở |
| Quan hệ với tính ngày | **Khung giờ nhận hàng không dùng để tính ngày.** Ngày giao hàng được quyết định bằng ngày không thể nhận hàng・**ngày trong tuần không thể giao hàng**. Là thông tin để tài xế・công ty giao hàng ủy thác quyết định thứ tự đi trong ngày |

> ✅ **Cần xác nhận #1 (đã giải quyết)** — ~~Việc hiển thị lịch dự kiến đến đâu (trước mấy tháng・đến mục nào) trên trang riêng của công ty giao hàng là chưa quyết~~ → **Đã giải quyết ở phụ lục 4 ngày 2026/09/29**. Lịch dự kiến (trước hạn chót) chỉ hiển thị **đến chu kỳ tháng sau・ngày giao hàng・tên cơ sở・vùng nhiệt độ・số lượng**, sau khi xác định thì tất cả mục. Chỉ thấy **giao hàng có đoạn do công ty mình phụ trách** 〔Quyết định v2.3 #34・#51〕 (11-6)

> ⚠️ **Cần xác nhận #2** — Việc thay đổi ngày "từng mục・bắt buộc có lý do" sau hạn chót đặt hàng・trước `locked` có vận hành được bằng tay của vận hành khi số lượng nhiều hay không. **Vì ở #63 ngày 2026/09/29 đã cho phép thay đổi từng mục từ sau hạn chót đến trước ngày xuất hàng nên mối lo này vẫn còn** (8-3) 〔Quyết định v2.3 #63〕 (Cũ: Giải quyết ở quyết định lần 3 ngày 2026/09/22 — sau hạn chót không thay đổi ngày mà hủy + sao chép. Sửa theo sổ cái 2026-10-03)

> ⚠️ **Cần xác nhận #3** — Thomas có I/F hủy chỉ thị xuất hàng hay không (tiến hành theo phương thức gửi lại có số phiên bản, nhưng cần xác nhận với nhà cung cấp). Việc hỗ trợ UTF-8 của CSV Thomas cũng đang xác nhận với nhà cung cấp 〔Quyết định §G〕〔Yêu cầu §9 điểm OPEN〕. **Phụ lục 4 ngày 2026/09/29 đã xác định phương châm**: Hủy bằng phương thức gửi lại (phiên bản mới với số lượng 0), dù có I/F hủy cũng không dùng／CSV có cấu trúc chỉ thay thế phần xuất／nếu UTF-8 không được thì khi xuất dùng Shift_JIS 〔Quyết định v2.3 #45〕. Bản thân việc xác nhận với nhà cung cấp vẫn còn (10-3・10-4)

> ✅ **Cần xác nhận #4 (đã giải quyết)** — ~~Thời điểm bắt đầu của hạn chót gửi lại chỉ thị xuất hàng = "đến trước khi bắt đầu picking" chưa quyết~~ → **Đã giải quyết ở quyết định lần 3 ngày 2026/09/22**. Gửi lại **cho đến khi nhận được thực tích xuất hàng của giao hàng đó**, không giữ thời điểm bắt đầu picking của kho 〔Quyết định v2.2 #4〕 (10-3)

> ⚠️ **Cần xác nhận #5** — [Tạm thời] HU = Hub (điểm trung chuyển). Ý nghĩa chính xác trong hệ thống hiện có, và ID điểm trung chuyển có đang được dùng trong liên kết bên ngoài như vận đơn・liên kết CSV・biểu mẫu hay không 〔Quyết định E#5〕

> ✅ **Cần xác nhận #6 (đã giải quyết)** — ~~[Tạm thời] Mã kho của kho picking dùng nguyên ID kho (dạng WH00001)~~ → **Đã giải quyết ở D3-2 ngày 2026/10/01**. Mã kho do vận hành nhập, tách biệt với ID kho (3-1 #8) 〔Quyết định E#6〕

> ✅ **Cần xác nhận #7 (đã giải quyết)** — ~~Nguồn dữ liệu ngày lễ~~ → Xác định là **tự động lấy 1 lần mỗi năm từ API ngày lễ công khai + "Lấy lại ngày lễ"** (D3-3 ngày 2026/10/01) 〔Trả lời của hong 2026-10-03〕 (3-5). (Cũ: [tạm thời] dữ liệu công khai của Văn phòng Nội các・thủ công) 〔Quyết định E#9〕

> ⚠️ **Cần xác nhận #8** — [Tạm thời] Tên chính thức của cách gọi "Yamato Transport (viết tắt: Yamato)" "Thomas" (quan hệ với Kurubin Yamato, cách viết THOMAS) 〔Quyết định E#58〕〔Chu kỳ §0-1〕

> ⚠️ **Cần xác nhận #9** — [Tạm thời] Túi giữ lạnh・đá giữ lạnh gửi qua Yamato là dùng một lần (không thu hồi), chỉ ghi lại số. Thực tế có thu hồi hay không, có nhờ doanh nghiệp trả lại hay không 〔Quyết định E#64〕

> ⚠️ **Cần xác nhận #10** — Có cần mục "loại tên công ty" của quản lý tài xế hay không (xác nhận với công ty D). Các ô "Đánh giá" "Ghi chú" đã bị xóa 〔Yêu cầu REQ-DL-413〕

> ✅ **Cần xác nhận #11 (đã giải quyết)** — ~~Vận hành khi muốn xuất hàng vào ngày bị dừng do tạm ngưng điều chỉnh (thực tế kho không nghỉ)~~ → **Đã giải quyết ở quyết định lần 3 ngày 2026/09/22**. Vì quản trị viên có thể quyết định nơi đặt ngày điều chỉnh, nếu có ngày muốn xuất hàng thì dời ngày điều chỉnh đó sang ngày khác 〔Quyết định v2.2 #2〕 (4-5 Quy tắc 4)

> ✅ **Cần xác nhận #12 (đã giải quyết)** — ~~Điều kiện xác định tự động đối với thay đổi có sản phẩm hạn dùng ngắn là chưa quyết~~ → **Đã giải quyết ở phụ lục 4 ngày 2026/09/29**. **Số ngày từ ngày xuất hàng〜ngày giao hàng ＞ số ngày hạn dùng − số ngày an toàn (mặc định 2 ngày)** thì cần xác nhận `shelf_life_warning`. Việc chia vẫn do vận hành quyết định 〔Quyết định v2.3 #35〕 (9-4・15-9)
