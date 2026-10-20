> Bản dịch tiếng Việt của `ja/01_仕様/20_法人・拠点・契約/契約仕様/契約_02_一覧画面.md` (nguồn es-station, bản 2026-10-20). Khi khác nhau, bản tiếng Nhật và `docs/決定台帳.md` là chuẩn.

# Đặc tả hợp đồng: Màn hình danh sách (danh sách doanh nghiệp・danh sách cơ sở・danh sách hợp đồng con)

> **2026-10-15 sổ quyết định AK (hong trả lời)**: thống nhất tên loại hợp đồng thành 「本導入」(Triển khai chính thức) và 「お試し」(Dùng thử) (không dùng tên cũ. Tên giảm giá 「お試しキャンペーン割引」 thì không đổi).

<!-- Nguồn: 20_Doanh_nghiệp_Cơ_sở_Hợp_đồng/Doanh_nghiệp_Cơ_sở_Hợp_đồng_Hợp_đồng_con_Danh_sách_mục.md (tách ngày 03/10/2026. Nội dung chính giữ nguyên như thời điểm tách) -->

# Phần I　Danh sách hạng mục màn hình


> **Nội dung chính đã được sửa ngày 2026-10-06 cho khớp với sổ quyết định F (Vận hành A).** Các dòng đã sửa được ghi kèm "(2026-10-0x sổ quyết định F)".
>
> **Những điểm thay đổi theo sổ quyết định F (Vận hành A) ngày 2026-10-05 (sổ quyết định là chuẩn)**: ① Nhập CSV được đặt **chỉ để cập nhật** (thay thế #1 "Cũng không đặt nhập CSV"). ② Điều kiện tìm kiếm áp dụng phần bổ sung của code (doanh nghiệp ＝ ngày đăng ký／cơ sở ＝ gói hiện tại・tháng bắt đầu hợp đồng ban đầu・ngày đăng ký). Màu badge theo component chung (status.ts). ③ Tên trạng thái của hóa đơn khớp với Vận hành E. ④ Điểm không đặt đăng ký mới・xóa (#1・#2・#3) không thay đổi (giữ nguyên). ⑤ 2026-10-06: bỏ "Dừng" khỏi các giá trị của trạng thái hợp đồng.

## Màn hình danh sách (danh sách doanh nghiệp・danh sách cơ sở・danh sách hợp đồng con)　Bổ sung 28/09/2026・29/09/2026 danh sách hợp đồng → danh sách hợp đồng con (28-137)

Đây là mẫu chung của ES Kitchen (danh sách ＋ chi tiết・chỉnh sửa). Menu bên mở danh sách, chi tiết・chỉnh sửa được mở từ danh sách. **Không đặt đăng ký mới và xóa** (doanh nghiệp・cơ sở・hợp đồng mới được tạo thông qua tiếp nhận từ "Đăng ký mới (nhập hộ)" của quản lý đăng ký hợp đồng・phụ lục 28-33).

**Chung cho 3 danh sách**

| # | Hạng mục | Quy định |
|---|---|---|
| 1 | Nút phía trên | Xuất CSV và nhập CSV (danh sách doanh nghiệp・danh sách cơ sở. Chỉ hiển thị cho vai trò CRUD・chỉ cập nhật・là một màn hình. #11). Không đặt đăng ký mới (doanh nghiệp・cơ sở・hợp đồng mới được tạo thông qua tiếp nhận từ "Đăng ký mới (nhập hộ)" của quản lý đăng ký hợp đồng・phụ lục 28-33. 2026-10-05 sổ quyết định F Vận hành A Q1). (2026-10-05 sổ quyết định F: thay thế quy định cũ "Cũng không đặt nhập CSV") |
| 2 | Liên kết ID | Mở chi tiết (xem). Bên phải tiêu đề chi tiết chỉ có "Chỉnh sửa" (không đặt xóa) |
| 3 | Cột thao tác | Chỉ có bút chì ＝ chỉnh sửa. Không đặt xóa (thùng rác) (giữ nguyên・2026-10-05 sổ quyết định F Q1). Trạng thái cơ sở・trạng thái hợp đồng・ngày kết thúc hợp đồng có thể sửa trực tiếp trên màn hình chỉnh sửa (tạm dừng không hiện trong lựa chọn, thực hiện qua đơn yêu cầu thay đổi. Dù sửa trực tiếp thì việc hủy hợp đồng con・dừng tài khoản v.v. cũng không tự động chạy). Trạng thái doanh nghiệp không sửa tay, được quyết định tự động từ trạng thái của cơ sở (toàn bộ cơ sở đã đóng → ngừng hoạt động, có cơ sở mới → quay lại. Hủy bỏ chỉ khi đăng ký tạm bị từ chối・rút lại). (2026-10-05／06 sổ quyết định F) |
| 4 | Rời đi giữa chừng khi chỉnh sửa | Nếu đã thay đổi nội dung nhập thì hiển thị "Hủy nội dung chỉnh sửa?" |
| 5 | Tìm kiếm | Lọc bằng nút tìm kiếm (hoặc Enter). Văn bản là khớp một phần. Chỉ khi điều kiện tìm kiếm xuống từ 2 dòng trở lên mới hiển thị mũi tên ở đầu để thu gọn thành 1 dòng |
| 6 | Xuất CSV | Toàn bộ các bản ghi khớp với điều kiện tìm kiếm. Cột ＝ toàn bộ hạng mục của chi tiết (không chỉ các cột của danh sách) ＋ ID doanh nghiệp trực thuộc・tên doanh nghiệp trực thuộc・ngày giờ đăng ký (hiển thị cho mọi vai trò có quyền xem) (2026-10-05 sổ quyết định F. Theo thiết kế màn hình AW_CORP／AW_BRCH) |
| 7 | Dòng đăng ký tạm | 【Quyết định 29/09/2026 28-146】Doanh nghiệp・cơ sở・hợp đồng con đăng ký tạm (đang giữa chừng tiếp nhận) thì không chỉnh sửa trên màn hình này (chi tiết chỉ để xem). Thay cho bút chì ở cột thao tác, đặt "Chỉnh sửa bằng đơn đăng ký" để mở chi tiết đơn đăng ký của quản lý đăng ký hợp đồng (thiết lập thông tin chi tiết). Sau khi đăng ký chính thức (xác định cơ sở) thì chỉnh sửa trên màn hình này |
| 8 | Thứ tự sắp xếp | Ban đầu theo ngày giờ đăng ký mới nhất trước. Sắp xếp được bằng tiêu đề cột là ID・tên・trạng thái・ngày giờ đăng ký |
| 9 | Phân trang | "Từ 1–10 trên N bản ghi" ＋ số trang ＋ số bản ghi hiển thị (10／50／100 bản ghi) |
| 10 | Web doanh nghiệp | Web doanh nghiệp chỉ hiển thị danh sách cơ sở・danh sách hợp đồng của doanh nghiệp mình (danh sách doanh nghiệp là 1 dòng của chính công ty). Không hiển thị cột nhân viên kinh doanh ES. Danh sách cơ sở cũng hiển thị "Tháng bắt đầu hợp đồng ban đầu" "Tháng liên tục" (trả lời STEP2 01/10/2026 Q9) |
| 11 | Nhập CSV (danh sách doanh nghiệp・danh sách cơ sở・danh sách hợp đồng con) (2026-10-05／06 sổ quyết định F) | Đặt chức năng nhập **chỉ để cập nhật** (chỉ vai trò CRUD). Không phải modal mà là **một màn hình** (doanh nghiệp ＝ AW_CORP_004／cơ sở ＝ AW_BRCH_004. Code hiện vẫn là modal ＝ việc còn tồn). Cột ＝ các hạng mục nhập của chi tiết ＋ ID (định nghĩa cột ghi ở định nghĩa hạng mục của thiết kế màn hình). Dòng mới・dòng đăng ký tạm・thay đổi hạng mục chỉ xem là lỗi dòng. Dòng có ID doanh nghiệp・ID cơ sở không tồn tại là lỗi dòng (E100). Nếu cột không hợp lệ theo điều kiện mà có giá trị thì là lỗi dòng (E109). Dòng lỗi không được nhập, các dòng khác vẫn được đăng ký (cũng có thể xuất CSV danh sách lỗi). Giới hạn là 5,000 dòng (không quy định giới hạn dung lượng file). Người phụ trách không có CSV riêng, xử lý bằng CSV chung của danh sách doanh nghiệp・danh sách cơ sở (đối chiếu bằng phân loại ＋ email. Có thì cập nhật・không có thì thêm・không xóa bằng CSV). Quy định chi tiết của màn hình nhập danh sách hợp đồng con cần xác nhận (sổ quyết định F chỉ đến mức "chỉ cập nhật") |

### Màn hình: Danh sách doanh nghiệp (chi tiết・chỉnh sửa là Chỉnh sửa thông tin doanh nghiệp)

**Điều kiện tìm kiếm**

| # | Điều kiện | Loại | Lựa chọn |
|---|---|---|---|
| 1 | ID doanh nghiệp, tên doanh nghiệp, furigana | Văn bản (khớp một phần) | — |
| 2 | Mã bưu điện, số điện thoại | Văn bản (khớp một phần) | — |
| 3 | Trạng thái doanh nghiệp | Dropdown | Đăng ký tạm／Đăng ký chính thức／Ngừng hoạt động／Hủy bỏ (hủy bỏ chỉ khi đăng ký tạm bị từ chối・rút lại. 2026-10-06 sổ quyết định F) |
| 4 | Đơn vị phát hành hóa đơn | Dropdown | Phát hành gộp (1 hóa đơn cho doanh nghiệp)／Phát hành theo từng cơ sở |
| 5 | Nhân viên kinh doanh ES | Dropdown | 田中 健一／佐々木 桜／井上 悠 |
| 6 | Ngày đăng ký (từ・đến) | Khoảng ngày (chỉ một đầu cũng được) | — (2026-10-05 sổ quyết định F: áp dụng điều kiện bổ sung của code) |

**Các cột của danh sách**

| # | Cột | Tên vật lý | Nội dung |
|---|---|---|---|
| 1 | ID doanh nghiệp | `company_code` | CU＋số thứ tự. Mở chi tiết bằng liên kết |
| 2 | Tên doanh nghiệp | `name` | — |
| 3 | Trạng thái doanh nghiệp | `status` | Đăng ký tạm／Đăng ký chính thức／Ngừng hoạt động／Hủy bỏ. Màu badge theo component chung (status.ts) (sổ quyết định M-1. Đang dừng là xám ＝ M-1 không có đỏ). "Ngừng hoạt động" tự động khi toàn bộ cơ sở đã đóng (quay lại khi có cơ sở mới) (trước đây: quy định màu trong nội dung chính là Đăng ký tạm (xanh dương)／Đăng ký chính thức (xanh lá)／Ngừng hoạt động (xám). 2026-10-05 sổ quyết định F Q8. Màu của hủy bỏ cần xác nhận) |
| 4 | Đơn vị phát hành hóa đơn | `invoice_unit` | — |
| 5 | Cơ sở trực thuộc | `—（tổng hợp từ cơ sở）` | Số cơ sở |
| 6 | Lead time phát hành hóa đơn | `billing_lead_months` | Xuất hóa đơn trước … tháng |
| 7 | Nhân viên kinh doanh ES | `sales_staff` | Không hiển thị trên Web doanh nghiệp |
| 8 | Ngày giờ đăng ký | `created_at` | yyyy-mm-dd HH:MM (trước đây: yyyy/mm/dd hh:mm. Sửa theo "Quy tắc chung về nhập liệu" của danh sách vấn đề 03/10/2026) |
| 9 | Thao tác | `—` | Bút chì ＝ chỉnh sửa |

### Màn hình: Danh sách cơ sở (chi tiết・chỉnh sửa là Chỉnh sửa thông tin cơ sở)

**Điều kiện tìm kiếm**

| # | Điều kiện | Loại | Lựa chọn |
|---|---|---|---|
| 1 | ID cơ sở, tên cơ sở, số hợp đồng cha | Văn bản (khớp một phần) | — |
| 2 | Mã bưu điện, số điện thoại, quận/huyện/thành phố, ID người dùng ES cũ | Văn bản (khớp một phần) | — |
| 3 | Doanh nghiệp trực thuộc | Dropdown | 株式会社サンプル／株式会社みらい商事／株式会社あおば工業／(Không có doanh nghiệp) |
| 4 | Trạng thái cơ sở | Dropdown | Đăng ký tạm／Đăng ký chính thức／Đang tạm dừng／Dự kiến đóng／Đã đóng／Hủy bỏ (hủy bỏ ＝ toàn bộ hạng mục chỉ xem・2026-10-06 sổ quyết định F). "Đang tạm dừng" không giữ ở cơ sở, chỉ hiển thị từ trạng thái hợp đồng của hợp đồng cha (tạm dừng sử dụng) và lịch sử tạm dừng (trước đây: giữ "Đang tạm dừng" ở trạng thái cơ sở. Sửa theo 契約_01 §6-2 ngày 03/10/2026) |
| 5 | Loại hợp đồng | Dropdown | Triển khai chính thức／Dùng thử |
| 6 | Trạng thái hợp đồng | Dropdown | Hiệu lực／Đăng ký tạm／Đang làm thủ tục hủy hợp đồng／Tạm dừng sử dụng／Kết thúc (đã bỏ "Dừng". Việc dừng là trạng thái hiệu lực・dừng của chính tài khoản ＝ sổ quyết định K／契約_01 §6-3) (2026-10-06 sổ quyết định F) |
| 7 | Người nhận hóa đơn | Dropdown | Doanh nghiệp／Cơ sở này |
| 8 | Tỉnh/thành phố | Dropdown | 東京都／大阪府／愛知県／宮城県／神奈川県 |
| 9 | Gói hiện tại | Dropdown | Gói trong master gói (2026-10-05 sổ quyết định F: áp dụng điều kiện bổ sung của code) |
| 10 | Tháng bắt đầu hợp đồng ban đầu (từ・đến) | Khoảng tháng yyyy-mm | — (tháng chu kỳ. Không phải ngày. 2026-10-05 sổ quyết định F) |
| 11 | Ngày đăng ký (từ・đến) | Khoảng ngày | — (2026-10-05 sổ quyết định F) |

Hiển thị 4 điều kiện dùng hằng ngày ở dòng 1, các điều kiện khác đưa vào "Điều kiện chi tiết" (mặc định đóng・hiển thị số n điều kiện đang áp dụng). 4 điều kiện nào thì theo thiết kế màn hình (AW_BRCH) (2026-10-05 sổ quyết định F xem xét lại).
**Các cột của danh sách**

| # | Cột | Tên vật lý | Nội dung |
|---|---|---|---|
| 1 | ID cơ sở | `branch_code` | CU＋số thứ tự. Mở chi tiết bằng liên kết |
| 2 | Tên cơ sở | `name` | — |
| 3 | Doanh nghiệp trực thuộc | `company_id` | Không có doanh nghiệp thì hiển thị "(Không có doanh nghiệp)" |
| 4 | Trạng thái cơ sở | `status` | Màu badge theo component chung (status.ts) (bảng màu của trạng thái cơ sở・trạng thái hợp đồng・tài khoản chỉ có 1. Sổ quyết định M-1・F) (trước đây: quy định màu trong nội dung chính là Đăng ký tạm (xanh dương)／Đăng ký chính thức (xanh lá)／Đang tạm dừng (vàng)／Dự kiến đóng・Đã đóng (xám). 2026-10-05 sổ quyết định F Q8). Các giá trị được giữ là Đăng ký tạm／Đăng ký chính thức／Dự kiến đóng／Đã đóng／Hủy bỏ. "Đang tạm dừng" chỉ hiển thị từ trạng thái hợp đồng của hợp đồng cha (tạm dừng sử dụng) và lịch sử tạm dừng (trước đây: giữ "Đang tạm dừng" ở trạng thái cơ sở. Sửa theo 契約_01 §6-2 ngày 03/10/2026) |
| 5 | Số hợp đồng cha | `—（từ hợp đồng cha）` | CP＋số thứ tự của hợp đồng cha đang hiệu lực. 29/09/2026: vì đã đổi danh sách hợp đồng thành danh sách hợp đồng con nên tìm hợp đồng cha ở đây (28-137) |
| 6 | Trạng thái hợp đồng | `—（từ hợp đồng cha）` | Hiệu lực／Đăng ký tạm／Đang làm thủ tục hủy hợp đồng／Tạm dừng sử dụng／Kết thúc (đã bỏ "Dừng". 2026-10-06 sổ quyết định F) |
| 7 | Loại hợp đồng | `—（từ hợp đồng cha）` | Triển khai chính thức／Dùng thử |
| 8 | Gói hiện tại | `—（từ hợp đồng con của tháng hiện tại）` | ID gói・tên gói |
| 9 | Tháng bắt đầu hợp đồng ban đầu | `—（từ tháng bắt đầu hợp đồng ban đầu của cơ sở）` | yyyy-mm. Thời điểm bắt đầu hợp đồng ban đầu của cơ sở là năm-tháng (tháng chu kỳ・không phải ngày) (2026-10-05 sổ quyết định F). (trước đây: yyyy/mm. Sửa theo "Quy tắc chung về nhập liệu" của danh sách vấn đề 03/10/2026). Cơ sở đã chuyển đổi dùng ngày bắt đầu hợp đồng của ES cũ (bảng yêu cầu dòng 107 ngày 30/09/2026). Đổi tên cột để phân biệt với "Tháng bắt đầu hợp đồng" (tháng chu kỳ bắt đầu) của hợp đồng cha (trả lời STEP2 01/10/2026 Q5) |
| 10 | Tháng liên tục | `—（tính từ tháng bắt đầu hợp đồng ban đầu）` | Ví dụ: 5 năm 3 tháng. Không tính khoảng thời gian tạm dừng (trong lúc tạm dừng thì ngừng đếm. 2026-10-05 sổ quyết định F). Không đặt lại khi đổi gói・chuyển đổi (bảng yêu cầu dòng 107 ngày 30/09/2026) |
| 11 | Người nhận hóa đơn | `bill_to` | Doanh nghiệp／Cơ sở này |
| 12 | Địa chỉ | `pref / city` | Tỉnh/thành phố・quận/huyện/thành phố |
| 13 | Ngày giờ đăng ký | `created_at` | yyyy-mm-dd HH:MM (trước đây: yyyy/mm/dd hh:mm. Sửa theo "Quy tắc chung về nhập liệu" của danh sách vấn đề 03/10/2026) |
| 14 | Thao tác | `—` | Bút chì ＝ chỉnh sửa |

### Màn hình: Danh sách hợp đồng con (chi tiết・chỉnh sửa là ct)

Đặt 1 nút "Thay đổi hàng loạt" ở header, bấm vào sẽ mở modal 4 bước hiện có ở chế độ thế hệ giá (2026-10-05 sổ quyết định F Vận hành A Q-C2). Trang hợp đồng cha (/ops/contracts/parents/[no]) không gắn mã màn hình (Q-C5).

**Điều kiện tìm kiếm**

| # | Điều kiện | Loại | Lựa chọn |
|---|---|---|---|
| 1 | ID hợp đồng con, tên cơ sở, tên doanh nghiệp | Văn bản (khớp một phần) | — |
| 2 | Hợp đồng・tháng chu kỳ | Dropdown | 2026-10／2026-09／2026-08／2026-07 |
| 3 | Loại hợp đồng | Dropdown | Triển khai chính thức／Dùng thử |
| 4 | Gói | Dropdown | ES000003 Gói 50／ES000004 Gói 100／ES000005 Gói 150 |
| 5 | Phân loại giao hàng | Dropdown | Chuyến giao ES／Chuyến COOL |
| 6 | Trạng thái hóa đơn (trả trước) | Dropdown | Chưa xác định／Đã xác định／Đã xuất hóa đơn (giá trị của trả sau khớp với Vận hành E) (2026-10-05 sổ quyết định F Vận hành A Q-C3. Trước đây: Đã tạo／① Đã xác định／Cơ sở đã xác định／Doanh nghiệp đã xác định／Đã xuất hóa đơn・trả lời STEP2 01/10/2026 Q6) |
| 7 | Phương pháp tạo | Dropdown | Batch hằng ngày／Tạo thủ công／Gộp cả năm |

**Các cột của danh sách**

| # | Cột | Tên vật lý | Nội dung |
|---|---|---|---|
| 1 | ID hợp đồng con | `contract_no-yyyymm` | Số hợp đồng cha ＋ tháng chu kỳ (CP0000001-202607). Mở chi tiết hợp đồng con bằng liên kết |
| 2 | Hợp đồng・tháng chu kỳ | `cycle_month` | yyyy-mm. Hiển thị ban đầu là tháng mới ở trên |
| 3 | Cơ sở | `branch_id` | Tên cơ sở |
| 4 | Doanh nghiệp trực thuộc | `company_id` | — |
| 5 | Loại hợp đồng | `—（từ hợp đồng cha）` | Triển khai chính thức／Dùng thử |
| 6 | Gói | `plan_id` | Gói áp dụng cho tháng này (kèm thế hệ) |
| 7 | Phân loại giao hàng・số lần giao hàng | `ship_kind / deliveries` | — |
| 8 | Tháng xuất hóa đơn (trả trước) | `advance_billing_month` | Tháng chu kỳ ＋ lead time phát hành hóa đơn |
| 9 | Số tiền hóa đơn tháng này | `advance_total` | Tổng ① số tiền cố định (trả trước)・chưa thuế. **Là số tiền đã trừ giảm giá (giảm giá chiến dịch dùng thử v.v.) ＝ bằng số tiền cố định trên hóa đơn** (2026-10-08 sổ quyết định F Vận hành A QC2. Trước đây: không trừ giảm giá). Khi sửa tháng đã xuất hóa đơn trước hạn chốt, số tiền hóa đơn tháng này vẫn giữ là "số tiền đã xuất hóa đơn" (phần chênh lệch được ghi vào hóa đơn kỳ sau dưới dạng dòng điều chỉnh: QC6) |
| 10 | Trạng thái hóa đơn | `billing_status` | Trả trước ／ Trả sau. Trả trước・trả sau đều là Chưa xác định／Đã xác định／Đã xuất hóa đơn (giá trị của trả sau khớp với Vận hành E) (2026-10-05 sổ quyết định F Vận hành A Q-C3. Trước đây: vận hành có 5 bước・Web doanh nghiệp có 3 bước. Trả lời STEP2 01/10/2026 Q6) |
| 11 | Phương pháp tạo | `gen_method` | Batch hằng ngày／Tạo thủ công／Gộp cả năm. Không hiển thị trên Web doanh nghiệp |
| 12 | Thao tác | `—` | Bút chì ＝ chỉnh sửa (hợp đồng con) |
