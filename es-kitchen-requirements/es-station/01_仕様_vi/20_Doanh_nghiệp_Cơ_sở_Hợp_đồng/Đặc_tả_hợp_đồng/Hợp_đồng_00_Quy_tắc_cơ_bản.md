<!-- Nguồn: 20_Doanh_nghiệp_Cơ_sở_Hợp_đồng/Doanh_nghiệp_Cơ_sở_Hợp_đồng_Hợp_đồng_con_Danh_sách_mục.md (tách ngày 2026-10-03. Nội dung giữ nguyên như thời điểm tách) -->

# Danh sách mục: Doanh nghiệp・Cơ sở・Hợp đồng・Hợp đồng con (dựa trên màn hình thực tế của Phase 1)

> Ngày tạo: 2026/09/15　Cập nhật lần cuối: 2026/10/01 (Trả lời đóng STEP3 còn lại・STEP1: hóa đơn phát hành vào ngày 1 tháng sau S6-2)／2026/10/01 (Phản ánh trả lời STEP2: thiết lập sử dụng app thuộc hợp đồng con・hóa đơn phát hành cuối tháng (→ cùng ngày sửa lại ở S6-2 thành phát hành ngày 1 tháng sau)・hiển thị trạng thái thanh toán・tháng thanh toán (trả trước)・thời gian sử dụng tối thiểu là tủ lạnh 3／máy bán hàng tự động 12 tháng・năm tháng bắt đầu hợp đồng ban đầu・thêm bớt người phụ trách của doanh nghiệp・tên doanh nghiệp v.v. phản ánh ngay + thông báo)／2026/09/25 (Quyết định ngày gửi hóa đơn・hạn thanh toán / phản ánh trạng thái thủ tục chuyển khoản・số tiền thu hồi khi hủy hợp đồng (ghi đè))　Đối tượng: Web Vận hành (chính)・Web Doanh nghiệp
> **Tái cấu trúc dựa trên màn hình thực tế của Phase 1 (Chỉnh sửa thông tin cơ sở / Chỉnh sửa thông tin hợp đồng)**, và chồng thêm các mục mới của Phase 2.
> Có thể lọc cùng nội dung này trong `01_画面項目一覧` của bản Excel `Doanh_nghiệp_Cơ_sở_Hợp_đồng_Hợp_đồng_con_Danh_sách_mục.xlsx`.
> **Những việc xử lý ngoài hệ thống**: Đăng ký tư vấn (HubSpot) → thông báo Slack → gặp mặt kinh doanh (ngoài hệ thống) → đăng ký trên ES Station. Việc tìm kiếm HubSpot từ màn hình ký hợp đồng được hoãn. [Nguồn gốc: 契約_詳細要件 §1・§10]／Máy tính phúc lợi đặt trên trang chủ, không đưa vào hệ thống. Không có giới hạn sử dụng theo số nhân viên. [Nguồn gốc: 契約_詳細要件 §8・REQ-CT-185]

---

## 0. Cách đọc tài liệu này

### 0.1 Cấu trúc màn hình

| Màn hình | Thực thể nắm giữ | Tab |
|---|---|---|
| **Chỉnh sửa thông tin doanh nghiệp** (mới ở P2) | Doanh nghiệp | **4 tab**: Thông tin cơ bản (địa chỉ・người phụ trách)／Thanh toán (điều kiện thanh toán・danh sách hóa đơn)／Danh sách cơ sở・hợp đồng／Lịch sử thay đổi |
| **Chỉnh sửa thông tin cơ sở** | Cơ sở ＋ **Hợp đồng cha** | **5 tab**: Thông tin cơ bản (địa chỉ・người phụ trách・tài khoản)／**Hợp đồng** (danh sách hợp đồng cha・hợp đồng con)／**Thiết bị・Tùy chọn** (danh sách cho mượn・danh sách áp dụng tùy chọn/giảm giá)／Thanh toán (điều kiện thanh toán・danh sách hóa đơn)／Tài liệu・Lịch sử (tài liệu đính kèm・lịch sử thay đổi) |
| **Chỉnh sửa thông tin hợp đồng (hợp đồng con)** | Hợp đồng con (hàng tháng) | **4 tab**: Hợp đồng (hợp đồng con・thông tin cơ sở・hợp đồng・lịch giao hàng/giao nhận・ghi chú)／Giá・Thanh toán (①②・tóm tắt số tiền・giảm giá/khoản chi trả)／**Thiết bị・Tùy chọn** (cấu hình thiết bị・biến động thiết bị・biến động tùy chọn/giảm giá・lắp đặt thu hồi・nguyện vọng khi đăng ký)／Lịch sử thay đổi |

**Số mục cũng đã được giảm (2026/09/16).** Dù đã gộp tab nhưng số ô trên mỗi màn hình vẫn quá nhiều nên đã giảm từ **401 mục → 364 mục**. Chỉ giảm 2 loại sau, và **không giảm bất kỳ ô nào mà Vận hành thực sự nhập**.

| Phân loại | Cái gì | Ví dụ |
|---|---|---|
| **Bỏ** | Các mục "tham chiếu" mà cùng nội dung đã hiện ở màn hình khác hoặc phần tóm tắt phía trên màn hình | 3 mục "Thông tin cơ sở (tham chiếu)" của hợp đồng con／"① Thanh toán số tiền cố định (tham chiếu)" "② Thanh toán quyết toán theo thực tế (tham chiếu)"／"Trạng thái hợp đồng (từ hợp đồng cha)"／"Số dòng máy" |
| **Gộp** | Các mục "tham chiếu" bị chia quá nhỏ gộp thành 1 ô | Trạng thái thanh toán của ①② (kỳ áp dụng・trạng thái ghi nhận・số hóa đơn・trạng thái・người xác nhận・hạn thanh toán → **Trạng thái thanh toán (tham chiếu)**)／ghi chép tạo／điều kiện kế thừa từ gói／phán định thời gian sử dụng tối thiểu・tiền phạt vi phạm／tình trạng hợp đồng con |

Với các mục đã gộp, cột triển khai (implementation) được ghi song song ở cột tên vật lý theo dạng phân cách bằng "/" như `period_from / period_to / posted_state / invoice_no / …`. **Dữ liệu nắm giữ không giảm.**

| Màn hình・Tab | Số ô (trước → sau) |
|---|---|
| Hợp đồng con "Hợp đồng" | 29 → **17** |
| Hợp đồng con "Giá・Thanh toán" | 28 → **14** |
| Cơ sở "Hợp đồng" | 17 → **13** |
| Master giảm giá "Tính toán・Điều kiện" | 17 → **10** |

Trong demo đã thêm ô check **"Chỉ các mục nhập"**. Ẩn các ô tham chiếu・tự động để chỉ xem các ô thực sự gõ vào. Trong từng section cũng sắp xếp lại **các mục nhập lên trước, các mục tham chiếu ở sau**.

"Thông tin cơ bản" của cơ sở có tới 14 mục nên đã tách **Tiền mặt của người dùng・Số lượng giới hạn mỗi ngày・Số tiền giới hạn mỗi tháng・Chế độ khách・ES-QR thành section "Thiết lập sử dụng app"**.

> **[2026/10/01 STEP2 trả lời Q2] Chủ sở hữu của thiết lập sử dụng app là hợp đồng con (theo từng tháng Chu kỳ)**. Các mục nằm ở tab "Hợp đồng" của hợp đồng con. Trên Web Doanh nghiệp, hiện ở "Chỉnh sửa" của cơ sở; khi sửa số lượng giới hạn mỗi ngày・số tiền giới hạn mỗi tháng・chế độ khách (đều phản ánh ngay. Chế độ khách thông báo cho Vận hành) thì có hiệu lực với **tất cả hợp đồng con từ Chu kỳ hiện tại (Chu kỳ mà ngày hôm nay thuộc về) trở đi**. (Cũ: chế độ khách cần phê duyệt. Sửa theo quyết định 2026-10-02) Vận hành có thể chọn "Chỉ hợp đồng con này／Tất cả từ đây trở đi" ở hợp đồng con. ES-QR・Tiền mặt của người dùng chỉ Vận hành mới đổi được.
> <br>Chế độ khách dùng được ngay tại thời điểm lưu. Khi lưu sẽ hiện hộp thoại xác nhận cho tháng bắt đầu tính phí (quy tắc hạn chót) [hong trả lời 2026-10-03 (K3＝A)]

**Các tab được gom theo "nhóm công việc" (2026/09/16).** Cơ sở có 10 tab, doanh nghiệp 6 tab, master mỗi loại 5 tab, tình trạng phải tìm mới biết cái gì ở đâu. Không giảm mục nào, **chỉ gộp tab từ 30 → 19**. Vì vẫn giữ các section nên có thể nhảy thẳng từ mục lục dưới tab.

| Màn hình | Trước | Sau |
|---|---|---|
| Chỉnh sửa thông tin doanh nghiệp | 6 tab | **4 tab** |
| Chỉnh sửa thông tin cơ sở | 10 tab | **5 tab** |
| Chỉnh sửa thông tin hợp đồng (hợp đồng con) | 4 tab | 4 tab (**thiết bị và tùy chọn cùng một tab**) |
| Chỉnh sửa master tùy chọn | 5 tab | **3 tab** |
| Chỉnh sửa master giảm giá | 5 tab | **3 tab** |

**Tab "Thiết bị・Tùy chọn" của cơ sở và hợp đồng con là một cặp.** Cơ sở là để **xem** (hiện đang cho mượn gì, cái gì đang có hiệu lực), hợp đồng con là để **đăng ký** (biến động thiết bị／biến động tùy chọn・giảm giá). Đặt các tab cùng tên cạnh nhau ở bên trái và bên phải để biết sửa ở bên nào.

> **"Chỉnh sửa thông tin hợp đồng" của Phase 1 sẽ trở thành "Hợp đồng con" của Phase 2 nguyên như vậy.** Vì ở Phase 1 hợp đồng (CP…) cũng được tạo hàng tháng.
> Phase 2 phủ lên trên đó **1 "hợp đồng cha" có số không đổi** và quản lý như một tab của màn hình cơ sở. Không tạo màn hình chuyên dụng cho hợp đồng.

### 0.2 Phân công giữa hợp đồng cha và hợp đồng con (quyết định 2026/09/15)

| | Nắm giữ |
|---|---|
| **Hợp đồng cha** (tab của màn hình cơ sở) | Những thứ không đổi trong suốt hợp đồng: số hợp đồng cha・loại hợp đồng・trạng thái hợp đồng・ngày bắt đầu／kết thúc hợp đồng・thời gian sử dụng tối thiểu・ngày hết hạn thời gian sử dụng tối thiểu・mã đại lý (cũ: thuộc chiến dịch chuyển từ công ty khác. Đã chuyển sang giảm giá chuyển từ công ty khác của master giảm giá nên xóa) |
| **Hợp đồng con** (Chỉnh sửa thông tin hợp đồng) | Tất cả những gì quyết định hàng tháng／thay đổi giữa chừng: **gói・course・thiết lập giao hàng・lịch giao nhận・giá (khoản mục phí)・thiết bị・trạng thái thanh toán・lịch sử thay đổi** |

- **Hợp đồng con là "1 bản ghi cho mỗi Chu kỳ giao hàng".** Chi tiết xem §0.3.
- **Thay đổi hợp đồng cho tháng sau được thực hiện bằng cách sửa hợp đồng con của tháng sau, không phải hợp đồng cha.** Hợp đồng con của tháng hiện tại khi đã xác nhận・đã thanh toán thì không thể thay đổi ảnh hưởng đến số tiền.
- **Không có mục "tháng áp dụng thay đổi".** Thay vào đó, **khi bấm nút lưu của hợp đồng con, sẽ hỏi phạm vi áp dụng bằng hộp thoại**.
  - **Chỉ hợp đồng con này** … Chỉ sửa bản ghi của hợp đồng con này. Từ tháng sau trở đi vẫn được tạo theo thiết lập ban đầu
  - **Tất cả từ hợp đồng con này trở đi** … Sau khi sửa hợp đồng con này, cũng cập nhật thiết lập nguồn tạo (cơ sở・hợp đồng cha・gói) về cùng giá trị. **Việc tự động tạo sẽ tạo phần của các Chu kỳ đã qua ngày chuẩn tạo (§0.3: quyết định theo lead time phát hành hóa đơn. Thanh toán trong tháng là ngày bắt đầu đặt hàng, thanh toán trước 2 tháng là 2 tháng trước, trả theo năm là 12 Chu kỳ), nên nếu không cập nhật nguồn tạo thì các hợp đồng con được tạo sau đó sẽ quay về giá trị cũ.** (Cũ: tự động tạo trước tối đa 1 tháng. Sửa theo 契約_01 §1, 2026-10-03) Các hợp đồng con chưa xác nhận đã tạo thủ công đến các tháng sau sẽ được sửa cùng lúc, **hợp đồng con đã xác nhận・đã thanh toán thì không sửa**
  - Kết quả đã chọn được lưu ở **"Phạm vi áp dụng"** của lịch sử thay đổi theo dạng "Chỉ 2026-07", "Tất cả từ 2026-07 trở đi".
- **Khi giao hàng thay đổi giữa chừng cũng thay đổi ở hợp đồng con**, và áp dụng từ hợp đồng con của tháng sau.
- **Giá thuộc về hợp đồng con.** Vì quản lý trạng thái thanh toán (đã tạo ～ đã thanh toán) ở hợp đồng con.
- **Lịch sử thay đổi có ở cả cơ sở・hợp đồng cha và hợp đồng con.**
- Trong khi có đơn đăng ký đang chờ phê duyệt, không thể trực tiếp sửa các mục là đối tượng của đơn trong hợp đồng con của cơ sở đó. Khi phê duyệt, nếu "giá trị trước thay đổi" của đơn khác với giá trị hiện tại thì dừng phê duyệt và để Vận hành xác nhận (契約_01 §1. Thêm 2026-10-03).

### 0.3 Hợp đồng con là "1 bản ghi cho mỗi Chu kỳ giao hàng". Việc tạo không dựa vào ngày 1 dương lịch mà lấy theo ngày chuẩn (sửa đổi 2026/09/15)

Chu kỳ giao hàng quay vòng theo 4 tuần, **ngày đầu Chu kỳ (A1) luôn là thứ Hai**. Không trùng với ngày 1 dương lịch, **cũng có khi là ngày cuối tháng trước**. Vì vậy không phải "tạo 1 bản ghi vào ngày 1 hàng tháng" mà làm như sau.

- **1 Chu kỳ = 1 hợp đồng con.** Dù Chu kỳ vắt qua tháng dương lịch cũng không chia. **Tháng Chu kỳ = tháng mà ô thứ 14 (B7) thuộc về** (quyết định_v2.1・2026/09/21), `yyyymm` của số hợp đồng con chỉ tháng Chu kỳ (tháng thanh toán là mục khác).
- **Cách phân biệt phán định**: Số tiền cố định của gói và giới hạn số lượng cung cấp hàng tháng của đơn hàng được phán định theo **tháng Chu kỳ**, còn giao từng phần・giao lại・giao đột xuất được phán định theo **tháng dương lịch của ngày giao hàng**.
- **Việc tạo là batch hàng ngày** lấy "**các Chu kỳ chưa tạo đã qua ngày chuẩn**". Không cố định theo ngày dương lịch.
- **Ngày chuẩn tạo được quyết định theo lead time phát hành hóa đơn.**

| Mẫu thanh toán | Thời điểm tạo hợp đồng con | Ví dụ (Chu kỳ tháng 9/2026) |
|---|---|---|
| Thanh toán trong tháng (chuẩn) | Ngày bắt đầu đặt hàng của Chu kỳ | Tạo vào 2026-08-01 → thanh toán tháng 9/2026 |
| Thanh toán trước 2 tháng | Tạo trước **2 tháng** so với tháng Chu kỳ | Tạo trước 2026-06-25 → thanh toán tháng 7/2026 |
| Trả trước một lần cho 1 năm | **Tạo gộp 12 Chu kỳ** vào tháng bắt đầu hợp đồng・tháng gia hạn | 2026-04 tạo 12 bản ghi từ tháng 4/2026 đến tháng 3/2027 |

- **Việc có tự động tạo hay không thay đổi tùy loại hợp đồng.** **Triển khai chính thức** là tự động gia hạn, tự động tạo 1 Chu kỳ đã qua ngày chuẩn. **Chiến dịch dùng thử** không tự động tạo mà chỉ tạo đúng số tháng đã chỉ định. Cả hai khi cần các Chu kỳ xa hơn thì bấm **"Tạo hợp đồng con trước"** ở phía trên tab "Hợp đồng" của cơ sở・danh sách (hợp đồng con), chọn tháng trong hộp thoại, xác nhận các hợp đồng con sẽ được tạo rồi mới tạo (không tạo lại các Chu kỳ đã có).
- **Phát hiện sót thanh toán**: Vào ngày xác nhận thanh toán (25 hàng tháng), phát hiện **hợp đồng đang có hiệu lực nhưng không có hợp đồng con của tháng thanh toán đó** và đưa vào "Cần xác nhận". Vì nếu không có hợp đồng con thì không theo dõi được trạng thái thanh toán.
- **Khi phê duyệt hủy hợp đồng・tạm dừng, hủy các hợp đồng con tạo trước chưa thanh toán (chưa xác nhận) từ tháng áp dụng trở đi.** Hiển thị số lượng bị hủy trên màn hình phê duyệt. Tháng kết thúc hợp đồng là "tháng giao hàng cuối cùng".

> **Đã giải quyết (2026/09/21 quyết định_v2.1)**: Tháng Chu kỳ không phải là "năm tháng mà A1 thuộc về" mà là **"tháng mà B7 thuộc về"**. Ví dụ "Chu kỳ tháng 9/2026 (A1＝2026-08-31)" có B7＝2026-09-13 nên là Chu kỳ tháng 9, đúng.

### 0.4 Chiến dịch dùng thử và triển khai chính thức chuyển đổi trên cùng một hợp đồng cha (2026/09/16. Sửa theo sổ quyết định 2026-10-03)

|  | Chiến dịch dùng thử | Triển khai chính thức |
|---|---|---|
| Giá | Giảm giá chiến dịch dùng thử (DC000013): số tiền giảm = phí gói của gói 50・tủ lạnh・Lite (¥24,500). Không vượt quá số tiền thanh toán・mỗi doanh nghiệp 1 lần (**khi người nhận hóa đơn là từng cơ sở thì gắn vào cơ sở đầu tiên**). 1 cơ sở・50 Lite thì miễn phí. Nhiều cơ sở・đổi gói・kéo dài thời gian thì thanh toán phần chênh lệch (trả lời 2026/10/01 STEP1) (Cũ: không có nơi gắn khi người nhận hóa đơn là từng cơ sở. Sửa theo sổ quyết định 2026-10-03)<br>**Phần kéo dài của dùng thử không giảm giá (tính phí gói)** [hong trả lời 2026-10-03 (K1)] | Có phí |
| Thời gian | Mặc định 1 tháng. Khách hàng không chỉnh sửa được. **Chỉ Vận hành mới kéo dài được** (tạm thời không giới hạn số lần・số tháng. Nếu dài thì chuyển sang triển khai chính thức). Web Doanh nghiệp hiển thị thời gian dùng thử và phần kéo dài (thêm ở danh sách vấn đề 2026-10-03) | Tự động gia hạn (gia hạn tháng trước) |
| Đơn hàng | Doanh nghiệp không đặt hàng được (kể cả từ 2 tháng trở lên). Đơn hàng do hệ thống tự động tạo mỗi tháng (để khách trải nghiệm đồng đều nhiều sản phẩm khác nhau). Phát hộp vật tư [Nguồn gốc: 契約_詳細要件 yêu cầu (2026/10/02) REQ-CT-302] | Doanh nghiệp đặt hàng |
| Gói mặc định | Lite. Số lần giao hàng tự động điều chỉnh theo gói | Theo nội dung đăng ký |
| **Thời gian sử dụng tối thiểu** | **Không có** | Theo từng thiết bị (master dòng máy. Tủ lạnh 3 tháng・máy bán hàng tự động 12 tháng). Tính từ ngày cho mượn. Thiết bị đặt trong thời gian dùng thử tính từ ngày bắt đầu triển khai chính thức (2026/10/01 STEP2 trả lời Q8・§0.6) |
| **Tiền phạt vi phạm** | **Không phát sinh** | Phát sinh khi hủy trước ngày hết hạn |
| Hợp đồng con | Không tự động gia hạn, chỉ tạo đúng số tháng của thời gian dùng thử | Tự động gia hạn, tạo từng Chu kỳ một |

- **Khi chuyển đổi cũng không đổi số hợp đồng cha.** Hợp đồng cha giữ **lịch sử loại hợp đồng** (Dùng thử: bắt đầu～kết thúc, Triển khai chính thức: bắt đầu～), thời gian sử dụng tối thiểu・tiền phạt vi phạm・tự động gia hạn được phán định **từ ngày bắt đầu triển khai chính thức**. Cơ sở và hợp đồng cha vẫn là 1 đối 1. Khi có khoảng trống từ lúc hết hạn dùng thử đến lúc bắt đầu triển khai chính thức thì xử lý giống tạm dừng (28-35), nếu tổng cộng quá 1 năm thì không phải chuyển đổi mà là đăng ký mới (28-37). Khi thiết bị đặt trong thời gian dùng thử nhiều hơn thiết bị cho mượn tiêu chuẩn của gói thì phần chênh lệch được thanh toán 1 lần duy nhất trên hóa đơn đầu tiên của triển khai chính thức (Vận hành sửa được dòng máy・số tiền), còn nếu ít hơn thì không hoàn tiền (danh sách vấn đề 10/02). (Cũ: khi chuyển đổi thì đánh số hợp đồng cha mới, hợp đồng cha phía dùng thử vẫn ở trạng thái kết thúc và lưu lại như lịch sử. Sửa theo sổ quyết định 2026-10-03)
- Chuyển đổi chỉ thêm 1 dòng vào "lịch sử loại hợp đồng" của hợp đồng cha, không có mục trỏ lẫn nhau giữa các hợp đồng cha. Thiết lập cơ sở như chế độ khách được kế thừa, gói・thiết bị (ví dụ: CSC120→CSC180) Vận hành có thể thiết lập lại khi chuyển đổi. Chuyển đổi có thể thực hiện riêng cho từng cơ sở. (Cũ: "Chuyển đổi dùng thử・triển khai chính thức (tham chiếu)" của hợp đồng cha trỏ lẫn nhau. Sửa theo sổ quyết định 2026-10-03)
- **Không giả định** đăng ký đồng thời chiến dịch dùng thử và triển khai chính thức.

> <br>Khi có khoảng trống giữa dùng thử và triển khai chính thức, hợp đồng cha chuyển sang "Tạm ngừng sử dụng" [hong trả lời 2026-10-03 (K2)]
> Từ dùng thử → triển khai chính thức thì gói không giảm (dùng thử là gói 50 = thấp nhất). Không cần tính chênh lệch thiết bị [hong trả lời 2026-10-03 (K10)].
> 

<!-- Chuyển từ 契約_07 (nội dung giữ nguyên. Chỉ sửa đơn vị phát hành・bản sao hợp đồng con) -->

### 0.5 Về thanh toán, quyết định "cái nào là chuẩn" thành 1 (2026/09/15)

Nếu cùng tên mục có ở cả doanh nghiệp và cơ sở thì không quyết định được cái nào đúng và tính nhất quán sẽ đổ vỡ. Theo quy tắc sau, **cố định chủ sở hữu thành 1**.

| Mục | Chủ sở hữu chuẩn | Cách xử lý phía còn lại |
|---|---|---|
| **Người nhận hóa đơn** (doanh nghiệp／cơ sở này) | **Chỉ cơ sở** | **Không cho doanh nghiệp nắm giữ.** Màn hình doanh nghiệp chỉ hiển thị tổng hợp dưới dạng "Chi tiết người nhận hóa đơn (tham chiếu)", từ đó thay đổi hàng loạt người nhận hóa đơn của cơ sở |
| Đơn vị phát hành hóa đơn (gộp／từng cơ sở) | **Chỉ doanh nghiệp** | Màn hình cơ sở chỉ hiển thị tham chiếu. **Doanh nghiệp chỉ tham chiếu**, thay đổi do Vận hành (tiếp nhận qua liên hệ) (Cũ: doanh nghiệp có thể gửi yêu cầu thay đổi và bắt buộc Vận hành phê duyệt. Sửa theo 請求ルール 4-6, 2026-10-03) |
| Tên doanh nghiệp | **3 loại: tên doanh nghiệp／tên doanh nghiệp (hợp đồng)／tên doanh nghiệp người nhận hóa đơn** | Hiển thị màn hình dùng tên doanh nghiệp, hợp đồng dùng tên doanh nghiệp (hợp đồng), tên người nhận trên hóa đơn dùng tên doanh nghiệp người nhận hóa đơn. Nếu trống thì lần lượt lùi về: tên doanh nghiệp người nhận hóa đơn → tên doanh nghiệp (hợp đồng) → tên doanh nghiệp |
| Lead time phát hành hóa đơn | **Doanh nghiệp là giá trị mặc định**, cơ sở ghi đè | **Dạng chọn**: 3 tháng trước (−3)／2 tháng trước (−2)／1 tháng trước (−1)／Trong tháng (0)／Tháng sau (+1・trả sau). Tháng thanh toán ＝ tháng Chu kỳ ＋ giá trị này (thay đổi 2026/09/29). **Chỉ khi người nhận hóa đơn＝cơ sở này mới kích hoạt ghi đè** (nếu người nhận hóa đơn＝doanh nghiệp thì theo giá trị của doanh nghiệp, vô hiệu hóa và không lưu). Cơ sở không có doanh nghiệp luôn có người nhận hóa đơn là cơ sở này nên bắt buộc nhập |
| Phương thức thanh toán・chu kỳ thanh toán (khi trả theo năm là tháng khởi tính)・hạn thanh toán (ngày 27 của tháng thanh toán／ngày 27 tháng sau) | **Bên mà người nhận hóa đơn chỉ đến** | Người nhận hóa đơn＝doanh nghiệp → dùng giá trị của doanh nghiệp, phía cơ sở vô hiệu hóa và không lưu. Người nhận hóa đơn＝cơ sở này → dùng giá trị của cơ sở, phía doanh nghiệp không dùng |
| ID nơi phát hành Bill One | **Bên mà người nhận hóa đơn chỉ đến** | Như trên |
| Người phụ trách thanh toán・email nhận | **Tab người phụ trách của bên mà người nhận hóa đơn chỉ đến** | Cả doanh nghiệp và cơ sở đều giữ trong bảng người phụ trách, người có phân loại "Người phụ trách thanh toán" là nơi nhận hóa đơn. Ở ô điều kiện thanh toán chỉ đặt hiển thị tham chiếu |

> **Phía hợp đồng con là "ảnh chụp (snapshot) của giá trị có hiệu lực tại thời điểm đó".** Người nhận hóa đơn・lead time phát hành hóa đơn・phương thức thanh toán・chu kỳ thanh toán của hợp đồng con được cố định khi tạo. Tên người nhận・nơi gửi (tên doanh nghiệp người nhận hóa đơn・người phụ trách thanh toán) được cố định lúc **phát hành** hóa đơn (契約_01 §2・Q5). Dù sau này sửa master thì điều kiện thanh toán của các tháng quá khứ cũng không đổi. (Cũ: chỉ sao chép phương thức thanh toán・chu kỳ thanh toán. Sửa theo 契約_01 §2, 2026-10-03)

### 0.6 Việc cho mượn thiết bị do cơ sở nắm giữ, và việc thu hồi chỉ được bảo đảm bằng phát hiện (2026/09/16)

Nếu để hợp đồng con nắm thiết bị thì chỉ bị sao chép hàng tháng, còn sự thật trải dài qua nhiều tháng là "**cho mượn khi nào, trả về khi nào**" không được lưu ở đâu cả. Vì vậy **việc cho mượn thiết bị do tab "Thiết bị・Tùy chọn" của cơ sở làm chủ sở hữu**. Vì gắn với cơ sở nên dù qua chuyển đổi dùng thử → triển khai chính thức (cùng hợp đồng cha) hay tạm dừng・tiếp tục thì việc cho mượn vẫn tiếp tục (Cũ: vì khi dùng thử → triển khai chính thức mà hợp đồng cha đổi thì tủ lạnh vẫn để nguyên đó. Sửa theo sổ quyết định 2026-10-03).

**Đăng ký là ở hợp đồng con, xem là ở cơ sở.** Chủ sở hữu (= hiện đang cho mượn gì) chỉ đặt 1 chỗ ở cơ sở, còn **đăng ký cho mượn・thêm・thu hồi・đổi dòng máy được thực hiện ở "Biến động thiết bị (đăng ký ở hợp đồng con này)" của hợp đồng con**. Biến động luôn có "chuyện của hợp đồng nào" (đổi thiết bị khi nâng gói, thu hồi khi hủy hợp đồng), và giá cũng nằm ở ① của cùng hợp đồng con, nên tự nhiên đặt đăng ký ở hợp đồng con. **Danh sách cho mượn của cơ sở chỉ để xem**, thu hẹp chỗ sửa được về 1 nơi.

| | Hợp đồng con "Biến động thiết bị" | Cơ sở "Thiết bị・Tùy chọn" |
|---|---|---|
| Vai trò | **Đăng ký** (cho mượn mới／cho mượn thêm／thu hồi／đổi dòng máy) | **Xem** (danh sách hiện đang cho mượn gì) |
| Đơn vị dòng | 1 lần biến động | 1 lần cho mượn (LN-0001…) |
| Chỉnh sửa | Được | Không (kết quả biến động được phản ánh) |
| Thời gian | Sự việc của tháng thuộc hợp đồng con đó | Kéo dài qua nhiều tháng |

Khi đăng ký biến động, ảnh hưởng đến danh sách cho mượn của cơ sở như sau.

| Phân loại biến động | Diễn biến ở danh sách cho mượn của cơ sở |
|---|---|
| Cho mượn mới | Đánh số ID cho mượn mới và tạo dòng |
| Cho mượn thêm | Tăng **số lượng cho mượn** của khoản cho mượn hiện có |
| Thu hồi | Tăng **số lượng đã trả**. Khi số lượng chưa trả về 0 thì là đã thu hồi |
| Đổi dòng máy | Thu hồi khoản cho mượn cũ và tạo dòng với dòng máy mới |

**Không tạo trạng thái cùng một thứ có thể sửa ở 2 nơi.** Nếu dòng máy・số máy・giá đều sửa được ở cả hai màn hình thì không biết cái nào đúng.

| Cái gì | Chủ sở hữu | Cách xử lý ở hợp đồng con |
|---|---|---|
| Đặt bao nhiêu máy nào ở đâu | **"Thiết bị・Tùy chọn" của cơ sở** | Tóm tắt và liên kết ở "Cấu hình thiết bị (tham chiếu)". Tăng giảm đăng ký ở "Biến động thiết bị" |
| Phí ban đầu・phí hàng tháng của thiết bị | **Dòng khoản mục của số tiền thanh toán ở ① của hợp đồng con** (phân loại nguồn gốc＝model) | Sửa số tiền ở bảng ①. Chỉ tổng ở "Giá thiết bị (tham chiếu)" |
| Đặc tả dòng máy・giá tiêu chuẩn・thời gian sử dụng tối thiểu | **Master dòng máy** | Chỉ tham chiếu |

**Giữ 3 giá trị: số lượng cho mượn・số lượng đã trả・số lượng chưa trả.** Như vậy thì quản lý theo từng máy hay theo số lượng đều xử lý cùng một dạng (cho mượn 2 hộp, trả 1 hộp = chưa trả 1). **Số máy riêng chỉ chuẩn bị cột, hiện cho phép để trống**. Khi nắm được thì điền, sau này có thể chuyển sang tách thành 1 máy 1 dòng.

| Trạng thái | |
|---|---|
| Đang giao／Đang cho mượn／Đang yêu cầu thu hồi | Chưa trả về |
| Đã thu hồi | Số lượng chưa trả bằng 0. Mặc định ẩn |
| **Chưa trả** | Quá ngày dự kiến trả mà số lượng chưa trả > 0 |

**Chỉ có cảnh báo để bảo đảm không quên thu hồi.** Vì không tốn phí gỡ máy và dù thu hồi cũng không có tiền dịch chuyển nên **không có động cơ nào để nhắc nhở**. Thanh toán phát sinh hàng tháng nên để đó thì ai đó cũng nhận ra, nhưng việc thu hồi thì không ai gặp khó khăn nên nhiều năm cũng trôi qua.

- Vào thời điểm phê duyệt hủy hợp đồng・tạm dừng, **tự động đặt ngày dự kiến trả** cho toàn bộ thiết bị đang cho mượn (mặc định là ngày dừng＋1 tháng. Hiểu "1 tháng" của REQ-CT-144 là thời gian ân hạn đến khi thu hồi thiết bị. Việc mua trên app cá nhân đến ngày hủy hợp đồng. Cách hiểu này đang chờ xác nhận với khách hàng) (Cũ: thống nhất với việc kết thúc sử dụng app. Sửa theo 契約_01 §6-4, 2026-10-03)
- Batch hàng ngày hiển thị "**ngày dự kiến trả < hôm nay và số lượng chưa trả > 0**" vào danh sách của Vận hành là **chưa hoàn tất thu hồi**
- Khi tiếp tục chưa trả thì **không tạo** thanh toán・tiền bồi thường (vì chưa có quy trình vận hành, chỉ dừng ở phát hiện)

**Giá do master dòng máy nắm giữ.** Hộp vật tư cũng đăng ký vào master dòng máy bằng BX, và đặt các gói là đối tượng thiết bị tiêu chuẩn ở phí ban đầu 0・phí hàng tháng 0 (sau này khi có phí chỉ cần điền số). **Thiết bị 0 yên không hiện trên hóa đơn nhưng vẫn còn trong hợp đồng với trạng thái đang cho mượn.** Phần còn lại ở hợp đồng con chỉ là **phán định miễn phí** ghi lý do "miễn phí có điều kiện".

**Thời gian sử dụng tối thiểu cũng do master dòng máy nắm giữ** (tủ lạnh 3 tháng・máy bán hàng tự động 12 tháng. Đã xác nhận ở 2026/10/01 STEP2 trả lời Q8, demo master dòng máy cũng đã chỉnh về 3／12). Thời gian sử dụng tối thiểu của hợp đồng cha là **giá trị đại diện của thiết bị dài nhất (tham chiếu)**, còn **tiền phạt vi phạm được phán định theo từng thiết bị rồi cộng lại**. Vì trạng thái tủ lạnh đã hết hạn nhưng máy bán hàng tự động chưa hết là chuyện bình thường.

**Đổi dòng máy (nâng・hạ gói) là một trong các phân loại biến động của "Biến động thiết bị".** Đổi gói theo đơn vị tháng, còn đổi thiết bị là một lần vật lý, nên **đăng ký ở hợp đồng con nào thì đó chính là tháng áp dụng**. Nhờ làm theo dạng đăng ký ở hợp đồng con, đơn xin thay đổi đổi gói và việc đổi thiết bị nằm cạnh nhau trên màn hình của cùng một tháng, giúp nhận ra sự lệch như "gói đổi từ tháng 9 nhưng thiết bị vào tháng 10".

> **Có thể chọn "không có tủ lạnh"**: Ở form đăng ký và thay đổi thiết bị, có thể chọn "Không" cho tủ lạnh v.v. (khi không thì không nhập loại・số máy) [hong trả lời 2026-10-03 (K16)] [Nguồn gốc: REQ-CT-174・175].

### 0.10 Những thứ không hiển thị trên Web Doanh nghiệp (quyết định tại họp định kỳ 2026/09/15)

| Không hiển thị | Lý do |
|---|---|
| **Lịch sử thay đổi** (toàn bộ doanh nghiệp・cơ sở・hợp đồng cha・hợp đồng con) | Vì lộ tên người phụ trách của Vận hành. Khi có thay đổi thì Vận hành liên hệ, xác nhận bằng lịch sử trên Web Vận hành |
| **Toàn bộ tab "Giá・Thanh toán" của hợp đồng con** | Vì nếu thấy thiết lập giá thì sẽ thấy cả các mục không muốn cho doanh nghiệp xem |
| **Thiết lập tuyến giao hàng** (kho picking・công ty vận chuyển・qua điểm trung gian・lead time・URL liên hệ) | Vì là thông tin quản lý logistics nội bộ |
| **Tài liệu đính kèm (chỉ nội bộ・không công khai)** … tài liệu lộ trình vận chuyển vào cho đơn vị giao hàng ủy thác, tài liệu bổ sung của phía Vận hành | Vì là tài liệu cho đơn vị ủy thác・vận hành nội bộ. Tài liệu cho doanh nghiệp xem được tách thành "Tài liệu đính kèm (công khai cho doanh nghiệp)" |
| Mã đại lý (có/không giới thiệu)／ghi chú nội bộ／nhân viên kinh doanh ES／ID nơi phát hành Bill One | Vì là thông tin vận hành nội bộ |
| Tiền mặt của người dùng | Vì gây hiểu nhầm là dùng được tiền mặt |

**Hiển thị**: Số lần giao hàng・Chu kỳ giao hàng・số lần giao hàng cho phép tham chiếu để doanh nghiệp có thể gửi yêu cầu thay đổi.

### 0.12 Chú giải phase

| Ký hiệu | Ý nghĩa |
|---|---|
| **P1** | Mục đã có sẵn trên màn hình thực tế của Phase 1 |
| **P1→P2 đổi** | Có mục nhưng cách nắm giữ・ý nghĩa・nguồn của giá trị thay đổi |
| **P2 mới** | Mục thiết lập mới ở Phase 2 |

---
