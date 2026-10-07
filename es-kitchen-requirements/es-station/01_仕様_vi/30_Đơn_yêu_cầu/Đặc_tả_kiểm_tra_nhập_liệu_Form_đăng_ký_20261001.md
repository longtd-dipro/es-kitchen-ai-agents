> **Đóng băng (bản gốc) 03/10/2026: từ nay không cập nhật nữa.** Nguồn chuẩn của kiểm tra đầu vào là các quy tắc chung về nhập liệu và bảng tổng hợp trong `20_Doanh_nghiệp_Cơ_sở_Hợp_đồng/Form_đăng_ký.md` (1 dòng 60／địa chỉ 255／nhiều dòng 500). Các quyết định hiện đang có hiệu lực xem tại `docs/決定台帳.md`.

# Đặc tả kiểm tra đầu vào (Biểu mẫu đăng ký・yêu cầu thay đổi của Web doanh nghiệp) 01/10/2026

> Người yêu cầu: Long (Tran Duc Long)／Soạn thảo: Claude (Cowork). Tài liệu ứng với quyết định 2-6 của STEP1 "Đưa 3 hạng mục chính (email・mã bưu điện・điện thoại) vào demo, các hạng mục khác ghi trong đặc tả".
> Đối tượng: Biểu mẫu đăng ký của Web doanh nghiệp (đăng ký mới・dùng thử, 8 loại đăng ký thay đổi) và nhập hộ của vận hành.
> Số chữ số được khớp theo kiểu (độ dài varchar) trong `Doanh_nghiệp_Cơ_sở_Hợp_đồng_Hợp_đồng_con_Danh_sách_mục.md`. Hạng mục nào không có kiểu trong danh sách hạng mục thì ghi là **đề xuất**.

## 1. Các quy định chung

| # | Quy định | Nội dung |
|---|---|---|
| C1 | Thời điểm kiểm tra | Khi bấm "Tiến tới xác nhận", kiểm tra cùng lúc tất cả hạng mục trên màn hình. Hạng mục lỗi được viền đỏ, hiển thị câu thông báo bên dưới hạng mục. Cuộn màn hình tới hạng mục lỗi đầu tiên |
| C2 | Để trống | Khi hạng mục bắt buộc bị để trống thì chỉ hiển thị "kiểm tra bắt buộc" (kiểm tra định dạng chỉ thực hiện khi đã có giá trị) |
| C3 | Khoảng trắng đầu cuối | Loại bỏ khoảng trắng ở đầu và cuối (toàn chiều rộng・nửa chiều rộng) rồi mới lưu・kiểm tra |
| C4 | Toàn chiều rộng・nửa chiều rộng | Chữ số・dấu gạch nối・chữ cái Latinh dù nhập toàn chiều rộng cũng được chuyển sang nửa chiều rộng rồi mới kiểm tra (mã bưu điện・số điện thoại・FAX・địa chỉ email) |
| C5 | Số ký tự | Vượt quá số ký tự tối đa là lỗi (không tự động cắt bớt) |
| C6 | Ký tự phụ thuộc môi trường | Không chấp nhận emoji・ký tự điều khiển. Các hạng mục in trên hóa đơn・phiếu giao hàng (tên gọi・địa chỉ) nằm trong phạm vi JIS cấp 1・cấp 2 (**đề xuất**) |
| C7 | Gửi trùng | Sau khi bấm "Gửi" thì vô hiệu hóa nút, không cho bấm cho đến khi hiển thị số tiếp nhận |

### Câu thông báo lỗi (chung)

| Loại | Câu thông báo |
|---|---|
| Bắt buộc | Vui lòng nhập [Tên hạng mục]. (Với hạng mục để chọn: "Vui lòng chọn [Tên hạng mục].") |
| Số ký tự tối đa | [Tên hạng mục] vui lòng nhập trong vòng [n] ký tự. |
| Katakana | [Tên hạng mục] vui lòng nhập bằng katakana toàn chiều rộng. |

## 2. Kiểm tra định dạng đã đưa vào demo (3 hạng mục chính)

| Hạng mục | Quy tắc | Câu thông báo | Demo |
|---|---|---|---|
| Mã bưu điện | 7 chữ số. Có hoặc không có dấu gạch nối đều được (`^[0-9]{3}-?[0-9]{4}$`). Lưu kèm dấu gạch nối (ví dụ: 105-0011) | Vui lòng nhập mã bưu điện gồm 7 chữ số (có hoặc không có dấu gạch nối đều được). | Đã đưa vào |
| Số điện thoại | Chỉ gồm chữ số và dấu gạch nối. Ký tự đầu là chữ số (`^[0-9][0-9-]*$`) | Vui lòng nhập số điện thoại chỉ gồm chữ số và dấu gạch nối. | Đã đưa vào |
| Địa chỉ email | Có ký tự ở trước và sau `@`, và sau `@` có `.` (`^[^@\s]+@[^@\s]+\.[^@\s]+$`) | Định dạng địa chỉ email không đúng. | Đã đưa vào |

**Những điều bổ sung vào đặc tả (không đưa vào demo)**

- Số điện thoại: chỉ gồm chữ số, 10 hoặc 11 chữ số (đếm không tính dấu gạch nối). Tối đa 20 ký tự (varchar(20)).
- Địa chỉ email: tối đa 160 ký tự (varchar(160)). Phần tên miền không chứa ký tự toàn chiều rộng.
- "Tìm kiếm địa chỉ" theo mã bưu điện: khi không có kết quả thì hiển thị "Không tìm thấy địa chỉ tương ứng. Vui lòng nhập thủ công.", và vẫn có thể tiếp tục nhập.

## 3. Đăng ký mới (triển khai chính thức・dùng thử)

### 3-1 Thông tin doanh nghiệp

| Hạng mục | Bắt buộc | Loại | Tối đa | Quy tắc |
|---|---|---|---|---|
| Tên doanh nghiệp | ○ | Văn bản | 120 | — |
| Tên doanh nghiệp (kana) | ○ | Văn bản | 120 | Katakana toàn chiều rộng・trường âm・khoảng trắng (`^[ァ-ヶー　 ]+$`) |
| Tên doanh nghiệp nhận hóa đơn | ○ | Văn bản | 120 | — |
| Mã bưu điện | ○ | Mã bưu điện | 8 | §2 |
| Tỉnh/thành phố | ○ | Lựa chọn | — | Chọn từ 47 tỉnh/thành phố (không cho nhập tự do) |
| Quận/huyện/thành phố | ○ | Văn bản | 60 | — |
| Khu vực・số nhà | ○ | Văn bản | 120 | — |
| Tòa nhà・số phòng | — | Văn bản | 120 | — |
| Số điện thoại | ○ | Điện thoại | 20 | §2 |
| Số FAX | — | Điện thoại | 20 | Cùng định dạng với số điện thoại |
| Phương thức thanh toán | ○ | Lựa chọn | — | Chuyển khoản tự động／Chuyển khoản ngân hàng／Thẻ tín dụng (28-32. Thẻ tín dụng giữ lại trong lựa chọn, việc thanh toán nằm ngoài hệ thống. ES chỉ giữ phân loại・S7＝B) |
| Chu kỳ thanh toán | ○ | Lựa chọn | — | Thanh toán hằng tháng／Thanh toán hằng năm |
| Thời điểm phát hành hóa đơn | ○ | Lựa chọn | — | Các lựa chọn của lead time phát hành hóa đơn |

### 3-2 Người phụ trách (bảng theo doanh nghiệp・cơ sở)

| Hạng mục | Bắt buộc | Tối đa | Quy tắc |
|---|---|---|---|
| Phân loại | ○ | — | Người phụ trách chính／Người phụ trách thanh toán／Người phụ trách phụ. **Doanh nghiệp: bắt buộc 1 người phụ trách chính・1 người phụ trách thanh toán**. **Cơ sở: bắt buộc 1 người phụ trách chính** (không cần nếu đã đánh dấu "Giống người phụ trách của doanh nghiệp"). Nếu người nhận hóa đơn = cơ sở đó thì người phụ trách thanh toán cũng bắt buộc |
| Tên người phụ trách | ○ | 60 | — |
| Furigana | ○ | 60 | Katakana toàn chiều rộng |
| Địa chỉ email | ○ | 160 | §2. Được phép trùng trong cùng một bảng (1 người kiêm nhiều phân loại) |
| Số điện thoại | — | 20 | §2 |
| Người đăng ký | ○ | — | Chọn 1 người từ danh sách người phụ trách (màn hình xác nhận). Không chọn thì không gửi được |

### 3-3 Theo từng cơ sở (nơi giao hàng)

| Hạng mục | Bắt buộc | Loại | Tối đa | Quy tắc |
|---|---|---|---|---|
| Loại thiết bị | ○ | Lựa chọn | — | Tủ lạnh・tủ đông／Máy bán hàng tự động |
| Số lượng thực phẩm ES (gói) | ○ | Lựa chọn | — | Các gói đang công khai trong master gói. Máy bán hàng tự động từ 100 gói trở lên (không chọn được gói 50) |
| Course | ○ | Lựa chọn | — | Máy bán hàng tự động cố định là "Light (máy bán hàng tự động)" (chỉ hiển thị) |
| Phương thức giao hàng | ○ | Lựa chọn | — | Chuyến giao ES／Chuyến COOL. Máy bán hàng tự động cố định là chuyến giao ES (28-19) |
| Số lần giao hàng (tháng) | ○ | Lựa chọn | — | Từ số lần tiêu chuẩn của gói trở lên (không được ít hơn tiêu chuẩn) |
| Tháng bắt đầu hợp đồng mong muốn | ○ | Năm tháng | — | Từ tháng chu kỳ sớm nhất có thể chọn tại thời điểm hôm nay trở đi. Không chọn được tháng đã quá hạn chót |
| Tầng lắp đặt | ○ | Văn bản | 40 (**đề xuất**) | — |
| Tên nơi giao hàng | ○ | Văn bản | 120 | — |
| Tên nơi giao hàng (kana) | ○ | Văn bản | 120 | Katakana toàn chiều rộng |
| Địa chỉ・điện thoại・FAX | — | — | — | Cùng quy tắc với §3-1 (mã bưu điện・tỉnh/thành phố・quận/huyện/thành phố・khu vực・số nhà・điện thoại là bắt buộc) |
| Số nhân viên ước tính | ○ | Lựa chọn | — | Từ các lựa chọn |
| Hóa đơn | ○ | Lựa chọn | — | Thanh toán cho doanh nghiệp／Thanh toán cho cơ sở này. **Nếu thanh toán cho cơ sở này thì phương thức thanh toán・chu kỳ thanh toán là bắt buộc** (trả lời STEP1) |
| Khi không giao được | ○ | Lựa chọn | — | Đẩy sớm lên ngày trước／Dời muộn sang ngày sau |
| Thứ không giao được | — | Chọn nhiều | — | Không được chọn tất cả các thứ (phải còn ngày có thể giao) |
| Ghi chú ngoài gói | — | Nhiều dòng | 1,000 (**đề xuất**) | — |

### 3-4 Tệp đính kèm

| Quy tắc | Nội dung |
|---|---|
| Dung lượng | Tối đa 5MB mỗi tệp |
| Số lượng | Tối đa 10 tệp |
| Loại | PDF・JPEG・PNG (**đề xuất**. Có nhận Word・Excel hay không cần xác nhận) |
| Câu thông báo | "Mỗi tệp tối đa 5MB, tối đa 10 tệp." |

### 3-5 "Người đăng ký" của đăng ký không đăng nhập

| Hạng mục | Bắt buộc | Tối đa | Quy tắc |
|---|---|---|---|
| Họ tên | ○ | 60 | — |
| Địa chỉ email | ○ | 160 | §2 |
| Số điện thoại | ○ | 20 | §2 |

## 4. Đăng ký thay đổi (8 loại)

Chung cho mọi yêu cầu: **tháng chu kỳ muốn bắt đầu** (bắt buộc・từ tháng chu kỳ sớm nhất có thể chọn tại thời điểm hôm nay trở đi), **Lý do・yêu cầu** (tùy chọn・1,000 ký tự・**đề xuất**).

| Yêu cầu | Hạng mục bắt buộc và quy tắc |
|---|---|
| Thay đổi gói | Gói sau thay đổi (không chọn được gói giống hiện tại) |
| Thay đổi giao hàng | Phương thức giao hàng (cơ sở máy bán hàng tự động là cố định・không chọn được), số lần giao hàng (từ mức tiêu chuẩn trở lên). Nếu toàn là "Không thay đổi" thì không gửi được ("Vui lòng chọn ít nhất 1 hạng mục cần thay đổi.") |
| Thay đổi thiết bị | Nội dung mong muốn, thiết bị đối tượng (đang sử dụng hiện tại), số lượng (từ 1 trở lên・tối đa bằng số lượng hiện tại) |
| Thay đổi thông tin cơ sở | Hạng mục muốn thay đổi (từ 1 hạng mục trở lên). Chỉ các hạng mục đã chọn là bắt buộc: tên nơi giao hàng・kana, bộ địa chỉ (§3-1), số điện thoại, hóa đơn, chế độ khách (cần vận hành phê duyệt・D5), thứ không giao được, ngày mong muốn của thiết bị (ngày sau hôm nay). **FAX không đưa vào yêu cầu này** (phản ánh ngay bằng "Chỉnh sửa" trong quản lý cơ sở・U14) |
| Thay đổi thông tin doanh nghiệp | Mã bưu điện・địa chỉ・điện thoại・FAX (chỉ tài khoản doanh nghiệp mới đăng ký được) |
| Tạm dừng | Lý do tạm dừng, thiết bị đang tạm dừng, khoảng thời gian muốn tạm dừng. **Không chọn được khoảng thời gian làm tổng thời gian tạm dừng vượt quá 12 tháng**. Tháng dự kiến mở lại là bắt buộc (không chọn được "Chưa định") |
| Mở lại | Tháng chu kỳ mở lại, gói sau khi mở lại |
| Hủy hợp đồng | Ngày hủy (chọn từ ngày cuối chu kỳ kể từ ngày hủy sớm nhất có thể chọn theo quy tắc trở đi), lý do hủy |

**Cơ sở đang có yêu cầu chờ phê duyệt** thì không gửi được yêu cầu mới ("Hiện có đăng ký đang chờ phê duyệt, vui lòng đăng ký sau khi được phê duyệt.").

## 5. Nhập hộ của vận hành

- Kiểm tra theo cùng quy tắc với §3・§4.
- Các hạng mục chỉ của vận hành (số tháng thời gian dùng thử, thiết lập sử dụng ES-QR, có phát hành tài khoản hay không, v.v.) tuân theo quy tắc của màn hình vận hành.
- Phương thức tiếp nhận nhập hộ (điện thoại・email, v.v.) là bắt buộc.

## 6. Cần xác nhận

1. Số ký tự tối đa của tầng lắp đặt・ghi chú・yêu cầu (có thể quyết định theo đề xuất không)
2. Loại tệp đính kèm (có nhận Word・Excel hay không)
3. Phạm vi ký tự dùng được trong tên gọi・địa chỉ (C6)
