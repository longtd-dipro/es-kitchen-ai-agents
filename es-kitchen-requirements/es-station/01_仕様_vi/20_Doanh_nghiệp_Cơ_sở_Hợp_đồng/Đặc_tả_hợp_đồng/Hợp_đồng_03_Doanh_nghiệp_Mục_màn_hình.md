# Đặc tả hợp đồng: Các mục màn hình Chỉnh sửa thông tin doanh nghiệp

<!-- Nguồn: 20_Doanh_nghiệp_Cơ_sở_Hợp_đồng/Doanh_nghiệp_Cơ_sở_Hợp_đồng_Hợp_đồng_con_Danh_sách_mục.md (tách ngày 2026-10-03. Nội dung giữ nguyên như thời điểm tách) -->

## Màn hình: Chỉnh sửa thông tin doanh nghiệp (62 mục)

### Tab: Thông tin cơ bản (22 mục)

**Thông tin cơ bản**　<small>Doanh nghiệp</small>

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Hiển thị cho DN | Đơn đăng ký thay đổi | Vận hành phê duyệt | Thông báo | Giá trị・Lựa chọn／Nội dung | Phase |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Tên doanh nghiệp | `name` | varchar(60) | Nhập | ○ | ○ | Được | Không cần (phản ánh ngay) | Cần (phản ánh ngay・thông báo cho bên vận hành. 2026/10/01 STEP2 trả lời Q3) | Tên doanh nghiệp do ES quản lý. Dùng để hiển thị trên màn hình・danh sách. Khi đăng ký mới không cần vận hành phê duyệt (chỉ thông báo). Tối đa 60 ký tự (cũ: varchar(120). Sửa theo Sổ quyết định 2026-10-03) | **P2 mới** |
| 2 | Tên doanh nghiệp (hợp đồng) | `contract_name` | varchar(60) | Nhập | ○ | ○ | Được | Không cần (phản ánh ngay) | Cần (phản ánh ngay・thông báo cho bên vận hành. 2026/10/01 STEP2 trả lời Q3) | Tên doanh nghiệp ghi trên hợp đồng. Có thể khác tên doanh nghiệp nên giữ riêng. Khi để trống thì dùng tên doanh nghiệp. Tối đa 60 ký tự (cũ: varchar(120). Sửa theo Sổ quyết định 2026-10-03) | **P2 mới** |
| 3 | Furigana tên doanh nghiệp | `name_kana` | varchar(60) | Nhập | ○ | ○ | Được | Không cần (phản ánh ngay) | Cần (phản ánh ngay・thông báo cho bên vận hành. 2026/10/01 STEP2 trả lời Q3) | Thống nhất katakana. Tối đa 60 ký tự (cũ: varchar(120). Sửa theo Sổ quyết định 2026-10-03) | **P2 mới** |
| 4 | Tên doanh nghiệp nơi nhận hóa đơn | `bill_to_name` | varchar(60) | Nhập | ○ | ○ | Được | Không cần (phản ánh ngay) | Cần (phản ánh ngay・thông báo cho bên vận hành. 2026/10/01 STEP2 trả lời Q3) | Tên doanh nghiệp dùng làm người nhận trên hóa đơn. Tên doanh nghiệp trong hợp đồng và tên doanh nghiệp nơi nhận hóa đơn có thể khác nhau nên giữ riêng. Khi để trống thì dùng theo thứ tự: tên doanh nghiệp (hợp đồng) → tên doanh nghiệp. Tối đa 60 ký tự (cũ: varchar(120). Sửa theo Sổ quyết định 2026-10-03) | **P2 mới** |
| 5 | Nhân viên kinh doanh ES | `sales_staff_user_id` | bigint | Nhập | △ | — | Không được | — | — | Chọn từ người dùng bên vận hành (để lọc theo người phụ trách trên danh sách. Theo quyết định 2026/09/29, đổi từ văn bản tự do). Người phụ trách nhập khi nhập hộ・tiếp nhận ở quản lý đăng ký sẽ vào đây | **P2 mới** |
| 6 | Ghi chú nội bộ | `internal_note` | text | Nhập | △ | — | Không được | — | — | Văn bản tự do phục vụ vận hành nội bộ. Không hiển thị cho doanh nghiệp. Nhiều dòng・tối đa 500 ký tự (cũ: không giới hạn. Sửa theo Sổ quyết định 2026-10-03) | **P2 mới** |
| 7 | ID doanh nghiệp | `company_id / company_code` | bigserial / varchar(20) | Tự động | ○ | ○ | Không được | — | — | CU ＋ số thứ tự (ví dụ: CU00001). Không cố định số chữ số, có thể kéo dài. 【2026/09/29: Đăng nhập Web doanh nghiệp không theo từng người phụ trách mà các người phụ trách của doanh nghiệp dùng chung ID doanh nghiệp này (tài khoản doanh nghiệp)】【Quyết định 28-145 ngày 2026/09/29: Với đăng ký mới, khi tiếp nhận・đăng ký tạm sẽ cấp luôn tài khoản doanh nghiệp cùng với tài khoản cơ sở, và gửi hướng dẫn đăng nhập cho người phụ trách chính・phụ・thanh toán của doanh nghiệp】 | **P2 mới** |
| 8 | Trạng thái doanh nghiệp | `status` | varchar(20) | Tham chiếu | ○ | ○ (tham chiếu) | Không được | — | — | Đăng ký tạm／Đăng ký chính thức／Ngủ đông 【Quyết định 28-146 ngày 2026/09/29: Trong thời gian đăng ký tạm, không chỉnh sửa được trên màn hình doanh nghiệp・hợp đồng (chỉ tham chiếu). Việc chỉnh sửa thực hiện ở chi tiết đơn đăng ký của quản lý đơn đăng ký hợp đồng (thiết lập thông tin chi tiết), và sau khi chốt cơ sở (đăng ký chính thức) thì chỉnh sửa trên màn hình này】 | **P2 mới** |

**Địa chỉ (địa chỉ ghi trên hóa đơn)**　<small>Doanh nghiệp</small>

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Hiển thị cho DN | Đơn đăng ký thay đổi | Vận hành phê duyệt | Thông báo | Giá trị・Lựa chọn／Nội dung | Phase |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Mã bưu điện (địa chỉ ghi trên hóa đơn) | `zip` | varchar(8) | Nhập | ○ | ○ | Được | Bắt buộc | — | Chấp nhận cả có và không có dấu gạch ngang. Nút "Tìm địa chỉ" bên cạnh sẽ tự động nhập các mục dưới đây | **P2 mới** |
| 2 | Tỉnh/thành phố (địa chỉ ghi trên hóa đơn) | `pref` | varchar(10) | Nhập | ○ | ○ | Được | Bắt buộc | — | Chọn từ dropdown 47 tỉnh/thành (không cho nhập tự do). Giá trị nhập qua tìm địa chỉ cũng khớp theo lựa chọn này | **P2 mới** |
| 3 | Quận/huyện/thành phố (địa chỉ ghi trên hóa đơn) | `city` | varchar(255) | Nhập | ○ | ○ | Được | Bắt buộc | — | Địa chỉ tối đa 255 ký tự (cũ: varchar(60). Sửa theo Sổ quyết định 2026-10-03) | **P2 mới** |
| 4 | Tên phố・số nhà (địa chỉ ghi trên hóa đơn) | `addr1` | varchar(255) | Nhập | ○ | ○ | Được | Bắt buộc | — | Địa chỉ tối đa 255 ký tự (cũ: varchar(120). Sửa theo Sổ quyết định 2026-10-03) | **P2 mới** |
| 5 | Tòa nhà, v.v. (địa chỉ ghi trên hóa đơn) | `addr2` | varchar(255) | Nhập | △ | ○ | Được | Bắt buộc | — | Địa chỉ tối đa 255 ký tự (cũ: varchar(120). Sửa theo Sổ quyết định 2026-10-03) | **P2 mới** |
| 6 | Số điện thoại (địa chỉ ghi trên hóa đơn) | `tel` | varchar(20) | Nhập | ○ | ○ | Được | Bắt buộc | — | — | **P2 mới** |
| 7 | Số FAX (địa chỉ ghi trên hóa đơn) | `fax` | varchar(20) | Nhập | △ | ○ | Được | Bắt buộc | — | — | **P2 mới** |
| 8 | Tìm địa chỉ | `—（Thao tác）` | — | Thao tác | — | ○ | Được | Bắt buộc | — | Đặt bên cạnh ô mã bưu điện. Nhập mã bưu điện rồi nhấn nút này sẽ tự điền tỉnh/thành・quận/huyện・tên phố・số nhà (không điền tòa nhà, v.v.). Nếu không lấy được thì giữ nguyên nhập tay. Sau khi lấy về, từng mục vẫn sửa được bằng tay | **P2 mới** |

**Người phụ trách (bảng)**　<small>Doanh nghiệp</small>

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Hiển thị cho DN | Đơn đăng ký thay đổi | Vận hành phê duyệt | Thông báo | Giá trị・Lựa chọn／Nội dung | Phase |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Phân loại | `contact.kind` | varchar(20) | Cột bảng | ○ | ○ | Được | Không cần | Cần (chỉ thông báo) | Người phụ trách chính／Người phụ trách thanh toán／Người phụ trách phụ. Bắt buộc 1 người chính・1 người thanh toán. Có thể khác với người phụ trách của cơ sở | **P2 mới** |
| 2 | Tên người phụ trách | `contact.name` | varchar(60) | Cột bảng | ○ | ○ | Được | Không cần | Cần (chỉ thông báo) | — | **P2 mới** |
| 3 | Furigana | `contact.kana` | varchar(60) | Cột bảng | ○ | ○ | Được | Không cần | Cần (chỉ thông báo) | Thống nhất katakana・bắt buộc | **P2 mới** |
| 4 | Địa chỉ email | `contact.email` | varchar(160) | Cột bảng | ○ | ○ | Được | Không cần | Cần (chỉ thông báo) | Người có phân loại = người phụ trách thanh toán sẽ là nơi nhận hóa đơn・nơi nhận thông báo khi thanh toán gộp theo doanh nghiệp.<br>Địa chỉ email cũng tối đa 60 ký tự (cũ: varchar(160)) 〔hong trả lời 2026-10-03 (K8)〕| **P2 mới** |
| 5 | Số điện thoại (người phụ trách) | `contact.tel` | varchar(20) | Cột bảng | △ | ○ | Được | Không cần | — | — | **P2 mới** |
| 6 | Thêm・xóa dòng | `—（Thao tác）` | — | Thao tác | — | ○ | Được | Không cần | Cần (chỉ thông báo) | Thêm／xóa dòng. Web doanh nghiệp cũng thêm・xóa được (phản ánh ngay・thông báo cho bên vận hành. Bắt buộc 1 người chính・1 người thanh toán. 2026/10/01 STEP2 trả lời Q10) | **P2 mới** |

### Tab: Thanh toán (23 mục)

**Điều kiện thanh toán**　<small>Doanh nghiệp</small>

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Hiển thị cho DN | Đơn đăng ký thay đổi | Vận hành phê duyệt | Thông báo | Giá trị・Lựa chọn／Nội dung | Phase |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Thời gian chuẩn bị phát hành hóa đơn | `billing_lead_months` | smallint (-3〜+1) | Nhập | ○ | ○ (tham chiếu) | Không được | — | — | Chọn phát hành hóa đơn vào tháng nào so với tháng chu kỳ: 3 tháng trước (−3)／2 tháng trước (−2)／1 tháng trước (−1)／tháng hiện tại (0)／tháng sau (+1・trả sau). Mặc định là 1 tháng trước (−1). Tháng thanh toán ＝ tháng chu kỳ ＋ giá trị này (ví dụ: tháng chu kỳ 2026-09 → nếu −2 thì tháng 7/2026, nếu 0 thì tháng 9, nếu +1 thì tháng 10). 【2026/09/29: Đổi từ nhập số (thanh toán trước … tháng) sang chọn. Cũng chọn được tháng hiện tại・tháng sau (trả sau)】【Thanh toán một lần cả năm được biểu thị bằng chu kỳ thanh toán = trả theo năm】【2026/09/29 hong: Với đăng ký mới do doanh nghiệp chọn (mặc định 1 tháng trước). Sau khi đăng ký, doanh nghiệp chỉ tham chiếu】 | **P2 mới** |
| 2 | Đơn vị phát hành hóa đơn | `invoice_unit` | varchar(10) | Nhập | ○ | ○ (tham chiếu) | Không được | — | — | Phát hành gộp (1 hóa đơn cho doanh nghiệp)／Phát hành theo từng cơ sở. 【2026/09/28: Doanh nghiệp chỉ tham chiếu. Cho đến khi có cổng đơn đăng ký thay đổi thông tin doanh nghiệp thì tiếp nhận qua liên hệ và bên vận hành sửa (trước đây là "doanh nghiệp có thể gửi đơn thay đổi, bắt buộc vận hành phê duyệt"). Việc có bãi bỏ chính đơn vị phát hành hay không là chưa quyết】 | **P2 mới** |
| 3 | Phương thức thanh toán | `pay_method` | varchar(20) | Nhập | ○ | ○ (tham chiếu) | Không được | — | — | Chuyển khoản tự động／Chuyển khoản ngân hàng／Thẻ tín dụng. 【2026/09/28: Giữ lại cả thẻ tín dụng (đổi so với "chuyển khoản tự động／chuyển khoản ngân hàng" ngày 9/15)】Khách hàng chỉ tham chiếu. 【Chỉ dùng cho cơ sở có nơi nhận hóa đơn = doanh nghiệp】 | **P2 mới** |
| 4 | Trạng thái thủ tục chuyển khoản tự động | `debit_setup_status` | varchar(12) | Nhập | △ | ○ (tham chiếu) | Không được | — | — | 【Quyết định 6C ngày 2026/09/23／đổi theo phụ lục 2026/09/28】Chưa làm thủ tục／Đang làm thủ tục／Hoàn tất. Doanh nghiệp không thể gửi đơn thay đổi phương thức thanh toán (chỉ tham chiếu). Dùng khi bên vận hành đổi phương thức thanh toán sang chuyển khoản tự động; cho đến khi hoàn tất thì in "chuyển khoản" lên hóa đơn và ghi nơi chuyển khoản (không dừng việc thanh toán). Từ hóa đơn kế tiếp sau khi hoàn tất sẽ ghi là chuyển khoản tự động | **P2 mới** |
| 5 | Chu kỳ thanh toán | `pay_cycle` | varchar(20) | Nhập | ○ | ○ (tham chiếu) | Không được | — | — | Trả theo tháng／Trả theo năm. Khách hàng chỉ tham chiếu. 【Chỉ dùng cho cơ sở có nơi nhận hóa đơn = doanh nghiệp】【2026/09/29 hong: Với đăng ký mới do doanh nghiệp chọn (mặc định trả theo tháng・trả trước)】 | **P2 mới** |
| 6 | Tháng khởi tính (khi trả theo năm) | `anchor_month` | char(7) | Nhập | △ | ○ (tham chiếu) | Không được | — | — | Chọn yyyy-mm bằng dropdown. 【Chỉ kích hoạt khi chu kỳ thanh toán = trả theo năm】Là tháng chu kỳ đầu tiên của 12 chu kỳ được thanh toán gộp trong 1 hóa đơn (2026/09/29: chuyển từ "đơn vị trả trước" "tháng khởi tính" của hợp đồng con) | **P2 mới** |
| 7 | Hạn thanh toán | `due_rule` | varchar(12) | Nhập | ○ | ○ (tham chiếu) | Không được | — | — | Chọn ngày 27 của tháng thanh toán (tháng phát hành)／ngày 27 của tháng sau tháng thanh toán. Cả phần trả trước lẫn phần quyết toán theo thực tế đều chỉ có 1 hạn thanh toán trên 1 hóa đơn. Ngày trừ tiền của chuyển khoản tự động・thẻ tín dụng cũng là ngày này. 【Quyết định 2026/09/29: Đổi so với quy tắc cố định ngày 2026/09/25 (cuối tháng trước tháng chu kỳ・cuối tháng gửi)】 | **P2 mới** |
| 8 | ID nơi phát hành Bill One | `billone_payer_id` | varchar(40) | Nhập | ○ | — | Không được | — | — | 【Chỉ dùng cho cơ sở có nơi nhận hóa đơn = doanh nghiệp】 | **P2 mới** |
| 9 | Thay đổi hàng loạt nơi nhận hóa đơn của cơ sở | `—（Thao tác）` | — | Thao tác | — | — | Không được | — | — | 【Quyết định 2026/09/28・chỉ bên vận hành】Khi nhấn, hộp thoại hiển thị danh sách các cơ sở trực thuộc, chọn lại nơi nhận hóa đơn (doanh nghiệp／cơ sở này) cho từng cơ sở rồi lưu một lần. Khi lưu, "Nơi nhận hóa đơn" của từng cơ sở thay đổi (chủ sở hữu vẫn là cơ sở). Không hiển thị cơ sở chưa có doanh nghiệp. Hóa đơn đã phát hành giữ nguyên, nơi nhận mới áp dụng từ hóa đơn chưa phát hành (phụ lục 28-6). Không hiển thị trên Web doanh nghiệp | **P2 mới** |

**Danh sách (hóa đơn đã phát hành)**　<small>Doanh nghiệp</small>

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Hiển thị cho DN | Đơn đăng ký thay đổi | Vận hành phê duyệt | Thông báo | Giá trị・Lựa chọn／Nội dung | Phase |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Số hóa đơn | `invoice.*` | — | Cột bảng | — | ○ (tham chiếu) | Không được | — | — | Cấp số khi phát hành. Một hóa đơn có thể chứa nhiều cơ sở・nhiều hợp đồng con | **P2 mới** |
| 2 | Ngày phát hành | `invoice.*` | — | Cột bảng | — | ○ (tham chiếu) | Không được | — | — | Chốt vào ngày 25 tháng trước → phát hành bằng Bill One vào ngày mùng 1 của tháng thanh toán (2026/10/01 S6-2. Đính chính "cuối tháng trước" của STEP2 trả lời Q4) | **P2 mới** |
| 3 | Tháng thanh toán | `invoice.*` | — | Cột bảng | — | ○ (tham chiếu) | Không được | — | — | Tháng thanh toán của hóa đơn này (phát hành vào mùng 1 của tháng đó) | **P2 mới** |
| 4 | Nơi nhận hóa đơn | `invoice.*` | — | Cột bảng | — | ○ (tham chiếu) | Không được | — | — | Doanh nghiệp／tên cơ sở. Quyết định theo thiết lập nơi nhận hóa đơn của cơ sở | **P2 mới** |
| 5 | Số cơ sở đối tượng | `invoice.*` | — | Cột bảng | — | ○ (tham chiếu) | Không được | — | — | Khi phát hành gộp thì có nhiều cơ sở. Nhấn để xem chi tiết | **P2 mới** |
| 6 | Số tiền cố định (trả trước) | `invoice.*` | — | Cột bảng | — | ○ (tham chiếu) | Không được | — | — | Tổng phần trả trước có trong hóa đơn này (chưa thuế). Khi thanh toán một lần cả năm thì là 12 tháng | **P2 mới** |
| 7 | Đối tượng trả trước | `invoice.*` | — | Cột bảng | — | ○ (tham chiếu) | Không được | — | — | Hợp đồng・tháng chu kỳ của phần trả trước. Ví dụ: phần chu kỳ 2026-09 | **P2 mới** |
| 8 | Quyết toán theo thực tế (trả sau) | `invoice.*` | — | Cột bảng | — | ○ (tham chiếu) | Không được | — | — | Tổng phần quyết toán theo thực tế có trong hóa đơn này (chưa thuế). Đến từ hợp đồng con của tháng khác với phần trả trước | **P2 mới** |
| 9 | Đối tượng quyết toán theo thực tế | `invoice.*` | — | Cột bảng | — | ○ (tham chiếu) | Không được | — | — | Kỳ đối tượng của phần quyết toán theo thực tế. Ví dụ: 2026/06/21〜07/20 | **P2 mới** |
| 10 | Thuế tiêu dùng | `invoice.*` | — | Cột bảng | — | ○ (tham chiếu) | Không được | — | — | Tính theo từng thuế suất (8%・10%) rồi cộng lại. Phần lẻ được làm tròn 四捨五入 trên tổng của từng hóa đơn・từng thuế suất (số âm làm tròn theo giá trị tuyệt đối). Thuế theo từng cơ sở chỉ để tham khảo, số thuế của doanh nghiệp là chuẩn (cũ: làm tròn xuống・tạm đặt trong demo. Sửa theo quy tắc thanh toán 2-4 ngày 2026-10-03) | **P2 mới** |
| 11 | Số tiền thanh toán (đã gồm thuế) | `invoice.*` | — | Cột bảng | — | ○ (tham chiếu) | Không được | — | — | Tổng chưa thuế của số tiền cố định (trả trước) ＋ quyết toán theo thực tế (trả sau) ＋ thuế tiêu dùng. Thường cả hai cùng nằm trong 1 hóa đơn | **P2 mới** |
| 12 | Hạn thanh toán | `invoice.*` | — | Cột bảng | — | ○ (tham chiếu) | Không được | — | — | Hạn thanh toán của hóa đơn này. 1 hóa đơn chỉ có 1 hạn. Theo thiết lập nơi nhận hóa đơn là ngày 27 của tháng thanh toán hoặc ngày 27 của tháng sau tháng thanh toán (2026/09/29) | **P2 mới** |
| 13 | Trạng thái hóa đơn | `invoice.*` | — | Cột bảng | — | ○ (tham chiếu) | Không được | — | — | Đã tạo／Đã chốt (ngày 25 tháng trước)／Đã phát hành (mùng 1 của tháng thanh toán)／Đã chuyển kỳ／Đã hủy. Việc đính chính chỉ có 1 cách cho mỗi hóa đơn (hóa đơn đã chuyển kỳ không hủy được・hóa đơn đã hủy không đưa vào đối tượng bù trừ) (cũ: Chưa chốt／Đã chốt／Đã phát hành／Đã hủy. Sửa theo Hợp đồng_01 §3 ngày 2026-10-03). Khác với trạng thái thanh toán ①② bên hợp đồng con (bên đó là tiến độ theo từng hợp đồng con) | **P2 mới** |
| 14 | Mở chi tiết hóa đơn | `—（Thao tác）` | — | Thao tác | — | ○ (tham chiếu) | Không được | — | — | Nhấn số hóa đơn sẽ mở màn hình chi tiết hóa đơn (thông tin hóa đơn・số tiền thanh toán・chi tiết = khoản mục・đối tượng・số lượng・số tiền chưa thuế・thuế suất, tạm tính・thuế tiêu dùng・số tiền thanh toán). Khi mở từ màn hình cơ sở thì dù là hóa đơn gửi doanh nghiệp cũng chỉ hiển thị phần của cơ sở đó. 【2026/09/29 hong: Việc phát hành hóa đơn・PDF thực hiện bằng Bill One nên hệ thống không hiển thị・tải PDF (cũ: "Hiển thị・tải hóa đơn"). Bản gốc nhận qua email từ Bill One】 | **P2 mới** |

### Tab: Danh sách cơ sở・hợp đồng (9 mục)

**Danh sách**　<small>Doanh nghiệp</small>

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Hiển thị cho DN | Đơn đăng ký thay đổi | Vận hành phê duyệt | Thông báo | Giá trị・Lựa chọn／Nội dung | Phase |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | ID cơ sở | `—（Cột của danh sách）` | — | Cột bảng | — | ○ (tham chiếu) | Không được | — | — | Dạng CU00643 | **P2 mới** |
| 2 | Tên cơ sở | `—（Cột của danh sách）` | — | Cột bảng | — | ○ (tham chiếu) | Không được | — | — | — | **P2 mới** |
| 3 | Số hợp đồng cha | `—（Cột của danh sách）` | — | Cột bảng | — | ○ (tham chiếu) | Không được | — | — | CP ＋ số thứ tự | **P2 mới** |
| 4 | Loại hợp đồng | `—（Cột của danh sách）` | — | Cột bảng | — | ○ (tham chiếu) | Không được | — | — | Chiến dịch dùng thử／Triển khai chính thức | **P2 mới** |
| 5 | Trạng thái hợp đồng | `—（Cột của danh sách）` | — | Cột bảng | — | ○ (tham chiếu) | Không được | — | — | Đăng ký tạm／Có hiệu lực／Đang làm thủ tục hủy／Dừng／Tạm ngưng sử dụng／Kết thúc | **P2 mới** |
| 6 | Gói áp dụng tháng hiện tại | `—（Cột của danh sách）` | — | Cột bảng | — | ○ (tham chiếu) | Không được | — | — | Lấy từ hợp đồng con mới nhất | **P2 mới** |
| 7 | Tháng thanh toán (trả trước) | `—（Cột của danh sách）` | — | Cột bảng | — | ○ (tham chiếu) | Không được | — | — | Tháng thanh toán trả trước của hợp đồng con thuộc chu kỳ hiện tại (tháng chu kỳ ＋ thời gian chuẩn bị phát hành hóa đơn. Ví dụ: tháng 9/2026). Không gắn "phần …" (2026/10/01 STEP2 trả lời Q7. Cũ: "Tháng thanh toán đối tượng (phần trả trước)") | **P2 mới** |
| 8 | Số tiền thanh toán tháng hiện tại | `—（Cột của danh sách）` | — | Cột bảng | — | ○ (tham chiếu) | Không được | — | — | Số tiền của hợp đồng con | **P2 mới** |
| 9 | Số lượng hợp đồng con | `—（Cột của danh sách）` | — | Cột bảng | — | ○ (tham chiếu) | Không được | — | — | Luồng đi tới danh sách | **P2 mới** |

### Tab: Lịch sử thay đổi (8 mục)

**Lịch sử (tham chiếu cơ sở・hợp đồng trực thuộc)**　<small>Doanh nghiệp</small>

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Hiển thị cho DN | Đơn đăng ký thay đổi | Vận hành phê duyệt | Thông báo | Giá trị・Lựa chọn／Nội dung | Phase |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Ngày giờ thay đổi | `—（Tham chiếu lịch sử cơ sở・hợp đồng）` | — | Cột bảng | — | — | Không được | — | — | Màn hình chỉ tham chiếu gộp các thay đổi của chính doanh nghiệp (tên doanh nghiệp・điều kiện thanh toán, v.v.) và thay đổi của cơ sở・hợp đồng・hợp đồng con trực thuộc. Việc đăng ký・chỉnh sửa thực hiện trên từng màn hình tương ứng. Vì hiển thị tên người phụ trách bên vận hành nên không hiển thị trên Web doanh nghiệp | **P2 mới** |
| 2 | Đối tượng | `—（Tham chiếu lịch sử cơ sở・hợp đồng）` | — | Cột bảng | — | — | Không được | — | — | Cơ sở／Hợp đồng cha／Hợp đồng con | **P2 mới** |
| 3 | Tên đối tượng | `—（Tham chiếu lịch sử cơ sở・hợp đồng）` | — | Cột bảng | — | — | Không được | — | — | Tên cơ sở・ID hợp đồng・ID hợp đồng con | **P2 mới** |
| 4 | Nội dung thay đổi | `—（Tham chiếu lịch sử cơ sở・hợp đồng）` | — | Cột bảng | — | — | Không được | — | — | Ghi theo dạng item_name "value1" → "value2" | **P2 mới** |
| 5 | Người thay đổi | `—（Tham chiếu lịch sử cơ sở・hợp đồng）` | — | Cột bảng | — | — | Không được | — | — | Vận hành／Doanh nghiệp／Hệ thống (batch) | **P2 mới** |
| 6 | Phạm vi áp dụng | `—（Tham chiếu lịch sử cơ sở・hợp đồng）` | — | Cột bảng | — | — | Không được | — | — | Thay đổi đó có hiệu lực đến đâu. Thay đổi của hợp đồng con là "chỉ 2026-07"／"từ 2026-07 trở đi tất cả", thay đổi của cơ sở・hợp đồng cha là "từ 2026-03 trở đi tất cả" | **P2 mới** |
| 7 | Người phê duyệt | `—（Tham chiếu lịch sử cơ sở・hợp đồng）` | — | Cột bảng | — | — | Không được | — | — | Chỉ với thay đổi cần phê duyệt | **P2 mới** |
| 8 | Có thông báo hay không | `—（Tham chiếu lịch sử cơ sở・hợp đồng）` | — | Cột bảng | — | — | Không được | — | — | — | **P2 mới** |
