> Bản dịch tiếng Việt của `ja/01_仕様/20_法人・拠点・契約/契約仕様/契約_03_法人_画面項目.md` (nguồn es-station, bản 2026-10-20). Khi khác nhau, bản tiếng Nhật và `docs/決定台帳.md` là chuẩn.

# Đặc tả hợp đồng: Các mục màn hình Chỉnh sửa thông tin doanh nghiệp

> **Nội dung chính đã được sửa ngày 2026-10-06 cho khớp với sổ quyết định F (vận hành A).** Các dòng đã sửa được gắn "(2026-10-0x sổ quyết định F)".
>
> **2026-10-05 sổ quyết định F (vận hành A)**: Lịch sử thay đổi gồm 7 cột của P-HIST ＋ "対象" (Đối tượng)・"対象名" (Tên đối tượng) (bỏ phạm vi áp dụng・người phê duyệt・thông báo). Nhắc đặt hàng được chỉnh sửa・lưu như một mục của thông tin cơ bản. Tên trạng thái hóa đơn khớp theo vận hành E.
> **2026-10-06 sổ quyết định F (vận hành A)**: Bỏ "停止" (Dừng) khỏi các giá trị trạng thái hợp đồng. Các nút của tài khoản theo đúng bảng trong sổ quyết định F.
> **2026-10-15 sổ quyết định AK (hong trả lời・CORP-Q1〜Q6)**: Việc nhập thông tin doanh nghiệp trên Web doanh nghiệp giống với Web vận hành (tên doanh nghiệp・tên doanh nghiệp (hợp đồng)・furigana・tên doanh nghiệp nơi nhận hóa đơn là 60 ký tự, bắt buộc chỉ có tên doanh nghiệp và furigana, E13 không cho emoji・W02 cảnh báo in ấn). Nhắc đặt hàng là mục của màn hình chỉnh sửa, lưu bằng "保存" (Lưu). Câu chữ dùng ID・câu chữ chung. Trang chỉnh sửa cũng giữ phiên bản đã tải, chỉ khi người khác cập nhật trước thì báo E31. Xuất QR không đưa ra cơ sở đang tạm ngưng. Danh sách hóa đơn ở tab hóa đơn không đặt cột "再請求（税込）" (Xuất lại hóa đơn (gồm thuế)) (xem ở chi tiết hóa đơn). Tên loại hợp đồng là "お試し" (Dùng thử) và "本導入" (Triển khai chính thức).


<!-- Nguồn: 20_法人・拠点・契約/法人拠点契約子契約_項目一覧.md (tách ngày 2026-10-03. Nội dung giữ nguyên như thời điểm tách) -->

## Màn hình: Chỉnh sửa thông tin doanh nghiệp (69 mục)

### Tab: Thông tin cơ bản (28 mục)

**Thông tin cơ bản**　<small>Doanh nghiệp</small>

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Hiển thị cho DN | Đơn đăng ký thay đổi | Vận hành phê duyệt | Thông báo | Giá trị・Lựa chọn／Nội dung | Phase |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Tên doanh nghiệp | `name` | varchar(60) | Nhập | ○ | ○ | Được | Không cần (phản ánh ngay) | Cần (phản ánh ngay・thông báo cho bên vận hành. 2026/10/01 STEP2 trả lời Q3) | Tên doanh nghiệp do ES quản lý. Dùng để hiển thị trên màn hình・danh sách. Khi đăng ký mới không cần vận hành phê duyệt (chỉ thông báo). Tối đa 60 ký tự (cũ: varchar(120). Sửa theo sổ quyết định 2026-10-03). **Không cho emoji (E13). Ký tự không in được trên hóa đơn・phiếu gửi hàng thì cảnh báo (W02)**. Nhập trên Web doanh nghiệp cũng giống vậy (2026-10-15 sổ quyết định AK CORP-Q2) | **P2 mới** |
| 2 | Tên doanh nghiệp (hợp đồng) | `contract_name` | varchar(60) | Nhập | △ | ○ | Được | Không cần (phản ánh ngay) | Cần (phản ánh ngay・thông báo cho bên vận hành. 2026/10/01 STEP2 trả lời Q3) | Tên doanh nghiệp ghi trên hợp đồng. Có thể khác tên doanh nghiệp nên giữ riêng. Khi để trống thì dùng tên doanh nghiệp (tùy chọn. Bắt buộc chỉ có tên doanh nghiệp và furigana. 2026-10-15 sổ quyết định AK CORP-Q2). Tối đa 60 ký tự (cũ: varchar(120). Sửa theo sổ quyết định 2026-10-03) | **P2 mới** |
| 3 | Furigana tên doanh nghiệp | `name_kana` | varchar(60) | Nhập | ○ | ○ | Được | Không cần (phản ánh ngay) | Cần (phản ánh ngay・thông báo cho bên vận hành. 2026/10/01 STEP2 trả lời Q3) | Thống nhất katakana. Tối đa 60 ký tự (cũ: varchar(120). Sửa theo sổ quyết định 2026-10-03) | **P2 mới** |
| 4 | Tên doanh nghiệp nơi nhận hóa đơn | `bill_to_name` | varchar(60) | Nhập | △ | ○ | Được | Không cần (phản ánh ngay) | Cần (phản ánh ngay・thông báo cho bên vận hành. 2026/10/01 STEP2 trả lời Q3) | Tên doanh nghiệp dùng làm người nhận trên hóa đơn. Tên doanh nghiệp trong hợp đồng và tên doanh nghiệp nơi nhận hóa đơn có thể khác nhau nên giữ riêng. Khi để trống thì dùng theo thứ tự: tên doanh nghiệp (hợp đồng) → tên doanh nghiệp (tùy chọn. 2026-10-15 sổ quyết định AK CORP-Q2). Tối đa 60 ký tự (cũ: varchar(120). Sửa theo sổ quyết định 2026-10-03) | **P2 mới** |
| 5 | Nhân viên kinh doanh ES | `sales_staff_user_id` | bigint | Nhập | △ | — | Không được | — | — | Chọn từ người dùng bên vận hành (để lọc theo người phụ trách trên danh sách. Theo quyết định 2026/09/29, đổi từ văn bản tự do). Người phụ trách nhập khi nhập hộ・tiếp nhận ở quản lý đăng ký sẽ vào đây | **P2 mới** |
| 6 | Ghi chú nội bộ | `internal_note` | text | Nhập | △ | — | Không được | — | — | Văn bản tự do phục vụ vận hành nội bộ. Không hiển thị cho doanh nghiệp. Nhiều dòng・tối đa 500 ký tự (cũ: không giới hạn. Sửa theo sổ quyết định 2026-10-03) | **P2 mới** |
| 7 | ID doanh nghiệp | `company_id / company_code` | bigserial / varchar(20) | Tự động | ○ | ○ | Không được | — | — | CU ＋ số thứ tự (ví dụ: CU00001). Không cố định số chữ số, có thể kéo dài. 【2026/09/29: Đăng nhập Web doanh nghiệp không theo từng người phụ trách mà các người phụ trách của doanh nghiệp dùng chung ID doanh nghiệp này (tài khoản doanh nghiệp)】【Quyết định 28-145 ngày 2026/09/29: Với đăng ký mới, khi tiếp nhận・đăng ký tạm sẽ cấp luôn tài khoản doanh nghiệp cùng với tài khoản cơ sở, và gửi hướng dẫn đăng nhập cho người phụ trách chính・phụ・hóa đơn của doanh nghiệp】 | **P2 mới** |
| 8 | Trạng thái doanh nghiệp | `status` | varchar(20) | Tham chiếu | ○ | ○ (tham chiếu) | Không được | — | — | Đăng ký tạm／Đăng ký chính thức／Ngủ đông／Hủy bỏ. **Không đổi bằng tay mà tự động quyết định từ trạng thái của cơ sở**: đăng ký tạm→đăng ký chính thức = khi cơ sở đầu tiên được đăng ký chính thức／tất cả cơ sở đóng cửa→tự động ngủ đông, khi có cơ sở mới được đăng ký thì tự động trở lại／hủy bỏ = chỉ khi đăng ký tạm bị từ chối・rút lại, không trở lại được (tạo đơn đăng ký mới). Doanh nghiệp đang ngủ đông vẫn chỉnh sửa được thông tin. Doanh nghiệp đã hủy bỏ chỉ tham chiếu (2026-10-06 sổ quyết định F. Điều kiện đăng ký tạm→đăng ký chính thức là đề xuất của Claude được hong phê duyệt). Màu badge theo đúng component chung (status.ts) 【Quyết định 28-146 ngày 2026/09/29: Trong thời gian đăng ký tạm, không chỉnh sửa được trên màn hình doanh nghiệp・hợp đồng (chỉ tham chiếu). Việc chỉnh sửa thực hiện ở chi tiết đơn đăng ký của quản lý đơn đăng ký hợp đồng (thiết lập thông tin chi tiết), và sau khi chốt cơ sở (đăng ký chính thức) thì chỉnh sửa trên màn hình này】 | **P2 mới** |
| 9 | Nhắc đặt hàng | `order_reminder` (tên vật lý cần xác nhận) | boolean | Nhập | ○ | ○ | Được | Không cần (phản ánh ngay) | — | ON／OFF. Có gửi thông báo・email cho cơ sở và doanh nghiệp chưa đặt hàng vào 7 ngày trước・3 ngày trước hạn chót hay không (chỉ thông báo・email, không tắt cảnh báo trên màn hình). **Chỉnh sửa như một mục của thông tin cơ bản, lưu bằng nút lưu của màn hình** (được ghi vào lịch sử thay đổi・giống cột CSV). Bỏ việc lưu ngay trên dải ở màn hình chi tiết. Ở thông tin doanh nghiệp của Web doanh nghiệp cũng chuyển đổi như một mục của màn hình chỉnh sửa, lưu bằng "保存" (Lưu) của màn hình (không lưu ngay lúc bấm) (2026-10-05 sổ quyết định F vận hành A Q5, 2026-10-15 sổ quyết định AK CORP-Q1) | **P2 mới** |

**Địa chỉ (địa chỉ ghi trên hóa đơn)**　<small>Doanh nghiệp</small>

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Hiển thị cho DN | Đơn đăng ký thay đổi | Vận hành phê duyệt | Thông báo | Giá trị・Lựa chọn／Nội dung | Phase |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Mã bưu điện (địa chỉ ghi trên hóa đơn) | `zip` | varchar(8) | Nhập | ○ | ○ | Được | Bắt buộc | — | Chấp nhận cả có và không có dấu gạch ngang. Nút "住所検索" (Tìm địa chỉ) bên cạnh sẽ tự động nhập các mục dưới đây | **P2 mới** |
| 2 | Tỉnh/thành phố (địa chỉ ghi trên hóa đơn) | `pref` | varchar(10) | Nhập | ○ | ○ | Được | Bắt buộc | — | Chọn từ dropdown 47 tỉnh/thành (không cho nhập tự do). Giá trị nhập qua tìm địa chỉ cũng khớp theo lựa chọn này | **P2 mới** |
| 3 | Quận/huyện/thành phố (địa chỉ ghi trên hóa đơn) | `city` | varchar(255) | Nhập | ○ | ○ | Được | Bắt buộc | — | Địa chỉ tối đa 255 ký tự (cũ: varchar(60). Sửa theo sổ quyết định 2026-10-03) | **P2 mới** |
| 4 | Tên phố・số nhà (địa chỉ ghi trên hóa đơn) | `addr1` | varchar(255) | Nhập | ○ | ○ | Được | Bắt buộc | — | Địa chỉ tối đa 255 ký tự (cũ: varchar(120). Sửa theo sổ quyết định 2026-10-03) | **P2 mới** |
| 5 | Tòa nhà, v.v. (địa chỉ ghi trên hóa đơn) | `addr2` | varchar(255) | Nhập | △ | ○ | Được | Bắt buộc | — | Địa chỉ tối đa 255 ký tự (cũ: varchar(120). Sửa theo sổ quyết định 2026-10-03) | **P2 mới** |
| 6 | Số điện thoại (địa chỉ ghi trên hóa đơn) | `tel` | varchar(20) | Nhập | ○ | ○ | Được | Bắt buộc | — | — | **P2 mới** |
| 7 | Số FAX (địa chỉ ghi trên hóa đơn) | `fax` | varchar(20) | Nhập | △ | ○ | Được | Bắt buộc | — | — | **P2 mới** |
| 8 | Tìm địa chỉ | `—（操作）` | — | Thao tác | — | ○ | Được | Bắt buộc | — | Đặt bên cạnh ô mã bưu điện. Nhập mã bưu điện rồi nhấn nút này sẽ tự điền tỉnh/thành・quận/huyện・tên phố・số nhà (không điền tòa nhà, v.v.). Nếu không lấy được thì giữ nguyên nhập tay. Sau khi lấy về, từng mục vẫn sửa được bằng tay | **P2 mới** |

**Người phụ trách (bảng)**　<small>Doanh nghiệp</small>

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Hiển thị cho DN | Đơn đăng ký thay đổi | Vận hành phê duyệt | Thông báo | Giá trị・Lựa chọn／Nội dung | Phase |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Phân loại | `contact.kind` | varchar(20) | Cột bảng | ○ | ○ | Được | Không cần | Cần (chỉ thông báo) | Người phụ trách chính／Người phụ trách hóa đơn／Người phụ trách phụ. Bắt buộc 1 người chính・1 người phụ trách hóa đơn. Có thể khác với người phụ trách của cơ sở | **P2 mới** |
| 2 | Tên người phụ trách | `contact.name` | varchar(60) | Cột bảng | ○ | ○ | Được | Không cần | Cần (chỉ thông báo) | — | **P2 mới** |
| 3 | Furigana | `contact.kana` | varchar(60) | Cột bảng | ○ | ○ | Được | Không cần | Cần (chỉ thông báo) | Thống nhất katakana・bắt buộc | **P2 mới** |
| 4 | Địa chỉ email | `contact.email` | varchar(160) | Cột bảng | ○ | ○ | Được | Không cần | Cần (chỉ thông báo) | Người có phân loại = người phụ trách hóa đơn sẽ là nơi nhận hóa đơn・nơi nhận thông báo khi xuất hóa đơn gộp theo doanh nghiệp.<br>Địa chỉ email cũng tối đa 60 ký tự (cũ: varchar(160)) 〔hong trả lời 2026-10-03 (K8)〕| **P2 mới** |
| 5 | Số điện thoại (người phụ trách) | `contact.tel` | varchar(20) | Cột bảng | △ | ○ | Được | Không cần | — | — | **P2 mới** |
| 6 | Thêm・xóa dòng | `—（操作）` | — | Thao tác | — | ○ | Được | Không cần | Cần (chỉ thông báo) | Thêm／xóa dòng. Web doanh nghiệp cũng thêm・xóa được (phản ánh ngay・thông báo cho bên vận hành. Bắt buộc 1 người chính・1 người phụ trách hóa đơn. 2026/10/01 STEP2 trả lời Q10) | **P2 mới** |

**Tài khoản (doanh nghiệp)**　<small>Doanh nghiệp</small>

> 2026-10-05／06 sổ quyết định F (vận hành A): Tài khoản doanh nghiệp (ID đăng nhập = ID doanh nghiệp). Tài khoản của cơ sở xem 契約_04. Các thao tác chỉ hiển thị cho vai trò có quyền chỉnh sửa doanh nghiệp. Có hiệu lực・dừng không quyết định từ trạng thái hợp đồng mà do chính tài khoản giữ (sổ quyết định K).

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Hiển thị cho DN | Đơn đăng ký thay đổi | Vận hành phê duyệt | Thông báo | Giá trị・Lựa chọn／Nội dung | Phase |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | ID đăng nhập (ID doanh nghiệp) | `account.login_id` | varchar(20) | Tham chiếu | ○ | — | Không được | — | — | Giống ID doanh nghiệp. Mỗi doanh nghiệp 1 cái (tài khoản doanh nghiệp). Các người phụ trách dùng chung, không cấp cho từng người phụ trách. Khi chọn cấp tài khoản ở tiếp nhận・đăng ký tạm thì cấp cùng với tài khoản cơ sở (2026-10-05 sổ quyết định F) | **P2 mới** |
| 2 | Trạng thái tài khoản | `account.status` | — | Tham chiếu | ○ | — | Không được | — | — | **5 trạng thái: 未発行 (Chưa cấp)／発行済（ログイン前） (Đã cấp (chưa đăng nhập))／ログイン済 (Đã đăng nhập)／参照のみ (Chỉ tham chiếu)／停止中 (Đang dừng)** (doanh nghiệp・cơ sở giống nhau・2026-10-05 sổ quyết định F rà soát lại (2)). Dữ liệu chỉ giữ có hiệu lực／dừng (sổ quyết định K). "参照のみ" là hiển thị quyết định từ trạng thái hợp đồng (với doanh nghiệp là từ sau khi tất cả cơ sở hủy hợp đồng〜hạn thanh toán của hóa đơn cuối cùng). "停止中" là khi vận hành dừng・khi tự động dừng vào ngày sau hạn thanh toán. Ưu tiên hiển thị: 停止中＞参照のみ＞ログイン済＞発行済＞未発行. Trên màn hình chỉnh sửa cũng chỉ tham chiếu (không làm ô nhập. Chỉ thay đổi bằng thao tác dừng・mở lại). Màu theo đúng component chung (停止中 là xám) (2026-10-06 sổ quyết định F) | **P2 mới** |
| 3 | Ngày giờ đăng nhập cuối | `account.last_login_at` | timestamptz | Tham chiếu | — | — | Không được | — | — | yyyy-mm-dd HH:MM | **P2 mới** |
| 4 | Đặt lại mật khẩu | `—（操作）` | — | Thao tác | — | — | Không được | — | — | Gửi email hướng dẫn mã xác thực (hiệu lực 5 phút) cho người phụ trách chính của doanh nghiệp. Vận hành chỉ làm khi nhận được yêu cầu. **Trạng thái hiển thị: 発行済（ログイン前）・ログイン済・参照のみ** (không hiển thị khi 未発行・停止中). Xác nhận (Q100) → ghi vào lịch sử thay đổi là "パスワード再設定" (Đặt lại mật khẩu) | **P2 mới** |
| 5 | Gửi lại hướng dẫn đăng nhập | `—（操作）` | — | Thao tác | — | — | Không được | — | — | Vận hành nhấn khi nhận được liên lạc "chưa nhận được・bị mất". Người nhận = người phụ trách chính・phụ・hóa đơn của doanh nghiệp (cùng một người thì 1 email). **Trạng thái hiển thị: 未発行・発行済（ログイン前）**. Xác nhận (Q101) → ghi vào lịch sử thay đổi là "ログイン案内の再送" (Gửi lại hướng dẫn đăng nhập) | **P2 mới** |
| 6 | Dừng／mở lại tài khoản | `—（操作）` | — | Thao tác | — | — | Không được | — | — | Dừng: làm cho không đăng nhập được bằng tài khoản doanh nghiệp (tài khoản cơ sở không bị dừng). **Trạng thái hiển thị: 発行済（ログイン前）・ログイン済・参照のみ** (không hiển thị khi 未発行). Mở lại: **chỉ khi 停止中** thì hiển thị thay cho "停止" (Dừng). Xác nhận (Q102・Q103) → ghi vào lịch sử thay đổi là "アカウント停止" (Dừng tài khoản)・"アカウント再開" (Mở lại tài khoản) | **P2 mới** |

**Bảng nút của tài khoản** (doanh nghiệp・cơ sở giống nhau・2026-10-06 sổ quyết định F)

| Trạng thái | Nút hiển thị |
|---|---|
| 未発行 (Chưa cấp) | Gửi lại |
| 発行済（ログイン前） (Đã cấp (chưa đăng nhập)) | Đặt lại・gửi lại・dừng |
| ログイン済 (Đã đăng nhập) | Đặt lại・dừng |
| 参照のみ (Chỉ tham chiếu) | Đặt lại・dừng |
| 停止中 (Đang dừng) | Mở lại |

### Tab: Hóa đơn (23 mục)

**Điều kiện hóa đơn**　<small>Doanh nghiệp</small>

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Hiển thị cho DN | Đơn đăng ký thay đổi | Vận hành phê duyệt | Thông báo | Giá trị・Lựa chọn／Nội dung | Phase |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Lead time phát hành hóa đơn | `billing_lead_months` | smallint (-3〜+1) | Nhập | ○ | ○ (tham chiếu) | Không được | — | — | Chọn phát hành hóa đơn vào tháng nào so với tháng chu kỳ: 3 tháng trước (−3)／2 tháng trước (−2)／1 tháng trước (−1)／tháng hiện tại (0)／tháng sau (+1・trả sau). Mặc định là 1 tháng trước (−1). Tháng xuất hóa đơn ＝ tháng chu kỳ ＋ giá trị này (ví dụ: tháng chu kỳ 2026-09 → nếu −2 thì tháng 7/2026, nếu 0 thì tháng 9, nếu +1 thì tháng 10). 【2026/09/29: Đổi từ nhập số (xuất hóa đơn trước … tháng) sang chọn. Cũng chọn được tháng hiện tại・tháng sau (trả sau)】【Thanh toán một lần cả năm được biểu thị bằng chu kỳ thanh toán = trả theo năm】【2026/09/29 hong: Với đăng ký mới do doanh nghiệp chọn (mặc định 1 tháng trước). Sau khi đăng ký, doanh nghiệp chỉ tham chiếu】 | **P2 mới** |
| 2 | Đơn vị phát hành hóa đơn | `invoice_unit` | varchar(10) | Nhập | ○ | ○ (tham chiếu) | Không được | — | — | Phát hành gộp (1 hóa đơn cho doanh nghiệp)／Phát hành theo từng cơ sở. 【2026/09/28: Doanh nghiệp chỉ tham chiếu. Cho đến khi có cổng đơn đăng ký thay đổi thông tin doanh nghiệp thì tiếp nhận qua liên hệ và bên vận hành sửa (trước đây là "doanh nghiệp có thể gửi đơn thay đổi, bắt buộc vận hành phê duyệt"). Việc có bãi bỏ chính đơn vị phát hành hay không là chưa quyết】 | **P2 mới** |
| 3 | Phương thức thanh toán | `pay_method` | varchar(20) | Nhập | ○ | ○ (tham chiếu) | Không được | — | — | Chuyển khoản tự động／Chuyển khoản ngân hàng／Thẻ tín dụng. 【2026/09/28: Giữ lại cả thẻ tín dụng (đổi so với "chuyển khoản tự động／chuyển khoản ngân hàng" ngày 9/15)】Khách hàng chỉ tham chiếu. 【Chỉ dùng cho cơ sở có nơi nhận hóa đơn = doanh nghiệp】 | **P2 mới** |
| 4 | Trạng thái thủ tục chuyển khoản tự động | `debit_setup_status` | varchar(12) | Nhập | △ | ○ (tham chiếu) | Không được | — | — | 【Quyết định 6C ngày 2026/09/23／đổi theo phụ lục 2026/09/28】Chưa làm thủ tục／Đang làm thủ tục／Hoàn tất. Doanh nghiệp không thể gửi đơn thay đổi phương thức thanh toán (chỉ tham chiếu). Dùng khi bên vận hành đổi phương thức thanh toán sang chuyển khoản tự động; cho đến khi hoàn tất thì in "お振込" (chuyển khoản) lên hóa đơn và ghi nơi chuyển khoản (không dừng việc xuất hóa đơn). Từ hóa đơn kế tiếp sau khi hoàn tất sẽ ghi là chuyển khoản tự động | **P2 mới** |
| 5 | Chu kỳ thanh toán | `pay_cycle` | varchar(20) | Nhập | ○ | ○ (tham chiếu) | Không được | — | — | Trả theo tháng／Trả theo năm. Khách hàng chỉ tham chiếu. 【Chỉ dùng cho cơ sở có nơi nhận hóa đơn = doanh nghiệp】【2026/09/29 hong: Với đăng ký mới do doanh nghiệp chọn (mặc định trả theo tháng・trả trước)】 | **P2 mới** |
| 6 | Tháng khởi tính (khi trả theo năm) | `anchor_month` | char(7) | Nhập | △ | ○ (tham chiếu) | Không được | — | — | Chọn yyyy-mm bằng dropdown. 【Chỉ kích hoạt khi chu kỳ thanh toán = trả theo năm】Là tháng chu kỳ đầu tiên của 12 chu kỳ được xuất gộp trong 1 hóa đơn (2026/09/29: chuyển từ "đơn vị trả trước" "tháng khởi tính" của hợp đồng con) | **P2 mới** |
| 7 | Hạn thanh toán | `due_rule` | varchar(12) | Nhập | ○ | ○ (tham chiếu) | Không được | — | — | Chọn ngày 27 của tháng xuất hóa đơn (tháng phát hành)／ngày 27 của tháng sau tháng xuất hóa đơn. Cả phần trả trước lẫn phần quyết toán theo thực tế đều chỉ có 1 hạn thanh toán trên 1 hóa đơn. Ngày trừ tiền của chuyển khoản tự động・thẻ tín dụng cũng là ngày này. 【Quyết định 2026/09/29: Đổi so với quy tắc cố định ngày 2026/09/25 (cuối tháng trước tháng chu kỳ・cuối tháng gửi)】 | **P2 mới** |
| 8 | ID nơi phát hành Bill One | `billone_payer_id` | varchar(40) | Nhập | ○ | — | Không được | — | — | 【Chỉ dùng cho cơ sở có nơi nhận hóa đơn = doanh nghiệp】 | **P2 mới** |
| 9 | Thay đổi hàng loạt nơi nhận hóa đơn của cơ sở | `—（操作）` | — | Thao tác | — | — | Không được | — | — | 【Quyết định 2026/09/28・chỉ bên vận hành】Khi nhấn, hộp thoại hiển thị danh sách các cơ sở trực thuộc, chọn lại nơi nhận hóa đơn (doanh nghiệp／cơ sở này) cho từng cơ sở rồi lưu một lần. Khi lưu, "Nơi nhận hóa đơn" của từng cơ sở thay đổi (chủ sở hữu vẫn là cơ sở). Sau khi lưu thì tải lại màn hình (không chỉ hiện toast). Giải thích của nút ghi trong 1 dòng rằng "chỉ đổi nơi nhận hóa đơn của hợp đồng cha của các cơ sở trực thuộc" và điều kiện hóa đơn ở trên (cấp doanh nghiệp) không thay đổi. Không hiển thị cơ sở không có doanh nghiệp. Hóa đơn đã phát hành giữ nguyên, nơi nhận mới áp dụng từ hóa đơn chưa phát hành (phụ lục 28-6). Không hiển thị trên Web doanh nghiệp | **P2 mới** |

**Danh sách (hóa đơn đã phát hành)**　<small>Doanh nghiệp</small>

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Hiển thị cho DN | Đơn đăng ký thay đổi | Vận hành phê duyệt | Thông báo | Giá trị・Lựa chọn／Nội dung | Phase |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Số hóa đơn | `invoice.*` | — | Cột bảng | — | ○ (tham chiếu) | Không được | — | — | Cấp số khi phát hành. Một hóa đơn có thể chứa nhiều cơ sở・nhiều hợp đồng con | **P2 mới** |
| 2 | Ngày phát hành | `invoice.*` | — | Cột bảng | — | ○ (tham chiếu) | Không được | — | — | Chốt vào ngày 25 tháng trước → phát hành bằng Bill One vào ngày mùng 1 của tháng xuất hóa đơn (2026/10/01 S6-2. Đính chính "cuối tháng trước" của STEP2 trả lời Q4) | **P2 mới** |
| 3 | Tháng xuất hóa đơn | `invoice.*` | — | Cột bảng | — | ○ (tham chiếu) | Không được | — | — | Tháng xuất hóa đơn của hóa đơn này (phát hành vào mùng 1 của tháng đó) | **P2 mới** |
| 4 | Nơi nhận hóa đơn | `invoice.*` | — | Cột bảng | — | ○ (tham chiếu) | Không được | — | — | Doanh nghiệp／tên cơ sở. Quyết định theo thiết lập nơi nhận hóa đơn của cơ sở | **P2 mới** |
| 5 | Số cơ sở đối tượng | `invoice.*` | — | Cột bảng | — | ○ (tham chiếu) | Không được | — | — | Khi phát hành gộp thì có nhiều cơ sở. Nhấn để xem chi tiết | **P2 mới** |
| 6 | Số tiền cố định (trả trước) | `invoice.*` | — | Cột bảng | — | ○ (tham chiếu) | Không được | — | — | Tổng phần trả trước có trong hóa đơn này (chưa thuế). Khi thanh toán một lần cả năm thì là 12 tháng | **P2 mới** |
| 7 | Đối tượng trả trước | `invoice.*` | — | Cột bảng | — | ○ (tham chiếu) | Không được | — | — | Hợp đồng・tháng chu kỳ của phần trả trước. Ví dụ: phần chu kỳ 2026-09 | **P2 mới** |
| 8 | Quyết toán theo thực tế (trả sau) | `invoice.*` | — | Cột bảng | — | ○ (tham chiếu) | Không được | — | — | Tổng phần quyết toán theo thực tế có trong hóa đơn này (chưa thuế). Đến từ hợp đồng con của tháng khác với phần trả trước | **P2 mới** |
| 9 | Đối tượng quyết toán theo thực tế | `invoice.*` | — | Cột bảng | — | ○ (tham chiếu) | Không được | — | — | Kỳ đối tượng của phần quyết toán theo thực tế. Ví dụ: 2026/06/21〜07/20 | **P2 mới** |
| 10 | Thuế tiêu thụ | `invoice.*` | — | Cột bảng | — | ○ (tham chiếu) | Không được | — | — | Tính theo từng thuế suất (8%・10%) rồi cộng lại. Phần lẻ được làm tròn (làm tròn số học) trên tổng của từng hóa đơn・từng thuế suất (số âm làm tròn theo giá trị tuyệt đối). Thuế theo từng cơ sở chỉ để tham khảo, số thuế của doanh nghiệp là chuẩn (cũ: làm tròn xuống・tạm đặt trong demo. Sửa theo quy tắc hóa đơn 2-4 ngày 2026-10-03) | **P2 mới** |
| 11 | Số tiền hóa đơn (đã gồm thuế) | `invoice.*` | — | Cột bảng | — | ○ (tham chiếu) | Không được | — | — | Tổng chưa thuế của số tiền cố định (trả trước) ＋ quyết toán theo thực tế (trả sau) ＋ thuế tiêu thụ. Thường cả hai cùng nằm trong 1 hóa đơn | **P2 mới** |
| 12 | Hạn thanh toán | `invoice.*` | — | Cột bảng | — | ○ (tham chiếu) | Không được | — | — | Hạn thanh toán của hóa đơn này. 1 hóa đơn chỉ có 1 hạn. Theo thiết lập nơi nhận hóa đơn là ngày 27 của tháng xuất hóa đơn hoặc ngày 27 của tháng sau tháng xuất hóa đơn (2026/09/29) | **P2 mới** |
| 13 | Trạng thái hóa đơn | `invoice.*` | — | Cột bảng | — | ○ (tham chiếu) | Không được | — | — | **未確定 (Chưa chốt)／確定 (Đã chốt)／請求済 (Đã xuất hóa đơn)** (đặt cùng tên với danh sách hóa đơn của vận hành E. Không hiển thị đã nhận tiền・chưa nhận tiền) (2026-10-05 sổ quyết định F vận hành A Q7・Phase B (7). Cũ: Đã tạo／Đã chốt／Đã phát hành／Đã chuyển kỳ／Đã hủy. Cách hiển thị đã chuyển kỳ・đã hủy・xuất lại hóa đơn khớp theo câu trả lời của vận hành E = cần xác nhận). Việc đính chính chỉ có 1 cách cho mỗi hóa đơn (hóa đơn đã chuyển kỳ không hủy được・hóa đơn đã hủy không đưa vào đối tượng bù trừ. 契約_01 §3). Khác với trạng thái hóa đơn ①② bên hợp đồng con (bên đó là tiến độ theo từng hợp đồng con) | **P2 mới** |
| 14 | Mở chi tiết hóa đơn | `—（操作）` | — | Thao tác | — | ○ (tham chiếu) | Không được | — | — | Nhấn số hóa đơn sẽ mở màn hình chi tiết hóa đơn (thông tin hóa đơn・số tiền hóa đơn・chi tiết = khoản mục・đối tượng・số lượng・số tiền chưa thuế・thuế suất, tạm tính・thuế tiêu thụ・số tiền hóa đơn). Khi mở từ màn hình cơ sở thì dù là hóa đơn gửi doanh nghiệp cũng chỉ hiển thị phần của cơ sở đó. 【2026/09/29 hong: Việc phát hành hóa đơn・PDF thực hiện bằng Bill One nên hệ thống không hiển thị・tải PDF (cũ: "Hiển thị・tải hóa đơn"). Bản gốc nhận qua email từ Bill One】 | **P2 mới** |

### Tab: Danh sách cơ sở・hợp đồng (9 mục)

**Danh sách**　<small>Doanh nghiệp</small>

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Hiển thị cho DN | Đơn đăng ký thay đổi | Vận hành phê duyệt | Thông báo | Giá trị・Lựa chọn／Nội dung | Phase |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | ID cơ sở | `—（一覧の列）` | — | Cột bảng | — | ○ (tham chiếu) | Không được | — | — | Dạng CU00643 | **P2 mới** |
| 2 | Tên cơ sở | `—（一覧の列）` | — | Cột bảng | — | ○ (tham chiếu) | Không được | — | — | — | **P2 mới** |
| 3 | Số hợp đồng cha | `—（一覧の列）` | — | Cột bảng | — | ○ (tham chiếu) | Không được | — | — | CP ＋ số thứ tự | **P2 mới** |
| 4 | Loại hợp đồng | `—（一覧の列）` | — | Cột bảng | — | ○ (tham chiếu) | Không được | — | — | お試し (Dùng thử)／本導入 (Triển khai chính thức) | **P2 mới** |
| 5 | Trạng thái hợp đồng | `—（一覧の列）` | — | Cột bảng | — | ○ (tham chiếu) | Không được | — | — | Đăng ký tạm／Có hiệu lực／Đang làm thủ tục hủy／Tạm ngưng sử dụng／Kết thúc (đã bỏ "停止" (Dừng). Việc dừng là có hiệu lực・dừng của chính tài khoản = sổ quyết định K／契約_01 §6-3) (2026-10-06 sổ quyết định F) | **P2 mới** |
| 6 | Gói áp dụng tháng hiện tại | `—（一覧の列）` | — | Cột bảng | — | ○ (tham chiếu) | Không được | — | — | Lấy từ hợp đồng con mới nhất | **P2 mới** |
| 7 | Tháng xuất hóa đơn (trả trước) | `—（一覧の列）` | — | Cột bảng | — | ○ (tham chiếu) | Không được | — | — | Tháng xuất hóa đơn trả trước của hợp đồng con thuộc chu kỳ hiện tại (tháng chu kỳ ＋ lead time phát hành hóa đơn. Ví dụ: tháng 9/2026). Không gắn "〜分" (phần …) (2026/10/01 STEP2 trả lời Q7. Cũ: "請求対象月（前払い分）" (Tháng xuất hóa đơn đối tượng (phần trả trước))) | **P2 mới** |
| 8 | Số tiền hóa đơn tháng hiện tại | `—（一覧の列）` | — | Cột bảng | — | ○ (tham chiếu) | Không được | — | — | Số tiền của hợp đồng con | **P2 mới** |
| 9 | Số lượng hợp đồng con | `—（一覧の列）` | — | Cột bảng | — | ○ (tham chiếu) | Không được | — | — | Đường dẫn tới danh sách | **P2 mới** |

### Tab: Lịch sử thay đổi (9 mục)

**Lịch sử (tham chiếu cơ sở・hợp đồng trực thuộc)**　<small>Doanh nghiệp</small>

> 2026-10-05 sổ quyết định F (vận hành A Q4・Q-C6): **7 cột của P-HIST ＋ chỉ riêng chi tiết doanh nghiệp có "対象" (Đối tượng)・"対象名" (Tên đối tượng)**. Bỏ phạm vi áp dụng・người phê duyệt・có thông báo hay không. Người thay đổi là tên tài khoản (ghi kèm ID). Người phê duyệt・thông báo chỉ ghi vào "理由" (Lý do) khi phê duyệt đơn đăng ký thay đổi. Không có cột "影響した拠点数" (Số cơ sở bị ảnh hưởng)・"バージョン" (Phiên bản).

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Hiển thị cho DN | Đơn đăng ký thay đổi | Vận hành phê duyệt | Thông báo | Giá trị・Lựa chọn／Nội dung | Phase |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Ngày giờ thay đổi | `—（拠点・契約の履歴を参照）` | — | Cột bảng | — | — | Không được | — | — | yyyy-mm-dd HH:MM. Mới nhất ở trên. Không sửa được・không xóa được. Màn hình chỉ tham chiếu gộp các thay đổi của chính doanh nghiệp (tên doanh nghiệp・điều kiện hóa đơn, v.v.) và thay đổi của cơ sở・hợp đồng・hợp đồng con trực thuộc. Việc đăng ký・chỉnh sửa thực hiện trên từng màn hình tương ứng. Vì hiển thị tên người phụ trách bên vận hành nên không hiển thị trên Web doanh nghiệp | **P2 mới** |
| 2 | Đối tượng | `—（拠点・契約の履歴を参照）` | — | Cột bảng | — | — | Không được | — | — | Doanh nghiệp／Cơ sở／Hợp đồng cha／Hợp đồng con. **Cột chỉ có ở chi tiết doanh nghiệp** (2026-10-05 sổ quyết định F) | **P2 mới** |
| 3 | Tên đối tượng | `—（拠点・契約の履歴を参照）` | — | Cột bảng | — | — | Không được | — | — | ID doanh nghiệp・tên cơ sở・ID hợp đồng・ID hợp đồng con. **Cột chỉ có ở chi tiết doanh nghiệp** (2026-10-05 sổ quyết định F) | **P2 mới** |
| 4 | Người thao tác (người thay đổi) | `—（拠点・契約の履歴を参照）` | — | Cột bảng | — | — | Không được | — | — | Tên tài khoản (ghi kèm ID. Ví dụ 井上 悠（Ad00010）). Thay đổi của hệ thống (batch) là "システム" (Hệ thống) (2026-10-05 sổ quyết định F. Cũ: Vận hành／Doanh nghiệp／Hệ thống (batch)) | **P2 mới** |
| 5 | Thao tác | `—（拠点・契約の履歴を参照）` | — | Cột bảng | — | — | Không được | — | — | Đăng ký／Thay đổi／Cập nhật bằng nhập CSV／Thay đổi hàng loạt／Đặt lại mật khẩu／Gửi lại hướng dẫn đăng nhập／Dừng tài khoản／Mở lại tài khoản／Tạo trước hợp đồng con／Gia hạn dùng thử. Các mục thay đổi trong 1 lần lưu được gộp vào 1 thao tác (không tách dòng theo từng mục) (2026-10-05 sổ quyết định F・P-HIST) | **P2 mới** |
| 6 | Mục (nội dung thay đổi) | `—（拠点・契約の履歴を参照）` | — | Cột bảng | — | — | Không được | — | — | Tên mục đã thay đổi. Khi có nhiều mục thì xếp xuống dòng theo từng mục trong các ô mục・trước thay đổi・sau thay đổi (2026-10-05 sổ quyết định F. Cũ: 1 cột dạng item_name "value1" → "value2") | **P2 mới** |
| 7 | Trước thay đổi | `—（拠点・契約の履歴を参照）` | — | Cột bảng | — | — | Không được | — | — | (2026-10-05 sổ quyết định F) | **P2 mới** |
| 8 | Sau thay đổi | `—（拠点・契約の履歴を参照）` | — | Cột bảng | — | — | Không được | — | — | (2026-10-05 sổ quyết định F) | **P2 mới** |
| 9 | Lý do | `—（拠点・契約の履歴を参照）` | — | Cột bảng | — | — | Không được | — | — | Nếu có. Khi phê duyệt đơn đăng ký thay đổi thì ghi người phê duyệt・có thông báo hay không vào đây (cũ: đã bỏ các cột "適用範囲" (Phạm vi áp dụng)・"承認者" (Người phê duyệt)・"通知の有無" (Có thông báo hay không). 2026-10-05 sổ quyết định F) | **P2 mới** |
