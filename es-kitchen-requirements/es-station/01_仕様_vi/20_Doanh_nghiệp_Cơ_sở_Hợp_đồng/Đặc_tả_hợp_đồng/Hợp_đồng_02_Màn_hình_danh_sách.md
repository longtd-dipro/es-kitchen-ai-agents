# Đặc tả hợp đồng: Màn hình danh sách (danh sách doanh nghiệp・danh sách cơ sở・danh sách hợp đồng con)

<!-- Nguồn: 20_Doanh_nghiệp_Cơ_sở_Hợp_đồng/Doanh_nghiệp_Cơ_sở_Hợp_đồng_Hợp_đồng_con_Danh_sách_mục.md (tách ngày 03/10/2026. Nội dung chính giữ nguyên như thời điểm tách) -->

# Phần I　Danh sách hạng mục màn hình


## Màn hình danh sách (danh sách doanh nghiệp・danh sách cơ sở・danh sách hợp đồng con)　Bổ sung 28/09/2026・29/09/2026 danh sách hợp đồng → danh sách hợp đồng con (28-137)

Đây là mẫu chung của ES Kitchen (danh sách ＋ chi tiết・chỉnh sửa). Menu bên mở danh sách, chi tiết・chỉnh sửa được mở từ danh sách. **Không đặt đăng ký mới và xóa** (doanh nghiệp・cơ sở・hợp đồng mới được tạo thông qua tiếp nhận từ "Đăng ký mới (nhập hộ)" của quản lý đăng ký hợp đồng・phụ lục 28-33).

**Chung cho 3 danh sách**

| # | Hạng mục | Quy định |
|---|---|---|
| 1 | Nút phía trên | Chỉ có xuất CSV. Không đặt đăng ký mới (doanh nghiệp・cơ sở・hợp đồng mới được tạo thông qua tiếp nhận từ "Đăng ký mới (nhập hộ)" của quản lý đăng ký hợp đồng・phụ lục 28-33). Cũng không đặt nhập CSV |
| 2 | Liên kết ID | Mở chi tiết (xem). Bên phải tiêu đề chi tiết chỉ có "Chỉnh sửa" (không đặt xóa) |
| 3 | Cột thao tác | Chỉ có bút chì ＝ chỉnh sửa. Không đặt xóa (thùng rác). Trạng thái được thay đổi bằng trạng thái doanh nghiệp／trạng thái cơ sở／trạng thái hợp đồng và đơn đăng ký tạm dừng・hủy hợp đồng |
| 4 | Rời đi giữa chừng khi chỉnh sửa | Nếu đã thay đổi nội dung nhập thì hiển thị "Hủy nội dung chỉnh sửa?" |
| 5 | Tìm kiếm | Lọc bằng nút tìm kiếm (hoặc Enter). Văn bản là khớp một phần. Chỉ khi điều kiện tìm kiếm xuống từ 2 dòng trở lên mới hiển thị mũi tên ở đầu để thu gọn thành 1 dòng |
| 6 | Xuất CSV | Toàn bộ các bản ghi khớp với điều kiện tìm kiếm |
| 7 | Dòng đăng ký tạm | 【Quyết định 29/09/2026 28-146】Doanh nghiệp・cơ sở・hợp đồng con đăng ký tạm (đang giữa chừng tiếp nhận) thì không chỉnh sửa trên màn hình này (chi tiết chỉ để xem). Thay cho bút chì ở cột thao tác, đặt "Chỉnh sửa bằng đơn đăng ký" để mở chi tiết đơn đăng ký của quản lý đăng ký hợp đồng (thiết lập thông tin chi tiết). Sau khi đăng ký chính thức (xác định cơ sở) thì chỉnh sửa trên màn hình này |
| 8 | Thứ tự sắp xếp | Ban đầu theo ngày giờ đăng ký mới nhất trước. Sắp xếp được bằng tiêu đề cột là ID・tên・trạng thái・ngày giờ đăng ký |
| 9 | Phân trang | "Từ 1–10 trên N bản ghi" ＋ số trang ＋ số bản ghi hiển thị (10／50／100 bản ghi) |
| 10 | Web doanh nghiệp | Web doanh nghiệp chỉ hiển thị danh sách cơ sở・danh sách hợp đồng của doanh nghiệp mình (danh sách doanh nghiệp là 1 dòng của chính công ty). Không hiển thị cột nhân viên kinh doanh ES. Danh sách cơ sở cũng hiển thị "Tháng bắt đầu hợp đồng ban đầu" "Tháng liên tục" (trả lời STEP2 01/10/2026 Q9) |

### Màn hình: Danh sách doanh nghiệp (chi tiết・chỉnh sửa là Chỉnh sửa thông tin doanh nghiệp)

**Điều kiện tìm kiếm**

| # | Điều kiện | Loại | Lựa chọn |
|---|---|---|---|
| 1 | ID doanh nghiệp, tên doanh nghiệp, furigana | Văn bản (khớp một phần) | — |
| 2 | Mã bưu điện, số điện thoại | Văn bản (khớp một phần) | — |
| 3 | Trạng thái doanh nghiệp | Dropdown | Đăng ký tạm／Đăng ký chính thức／Ngừng hoạt động |
| 4 | Đơn vị phát hành hóa đơn | Dropdown | Phát hành gộp (1 hóa đơn cho doanh nghiệp)／Phát hành theo từng cơ sở |
| 5 | Nhân viên kinh doanh ES | Dropdown | 田中 健一／佐々木 桜／井上 悠 |

**Các cột của danh sách**

| # | Cột | Tên vật lý | Nội dung |
|---|---|---|---|
| 1 | ID doanh nghiệp | `company_code` | CU＋số thứ tự. Mở chi tiết bằng liên kết |
| 2 | Tên doanh nghiệp | `name` | — |
| 3 | Trạng thái doanh nghiệp | `status` | Đăng ký tạm (xanh dương)／Đăng ký chính thức (xanh lá)／Ngừng hoạt động (xám) |
| 4 | Đơn vị phát hành hóa đơn | `invoice_unit` | — |
| 5 | Cơ sở trực thuộc | `—（tổng hợp từ cơ sở）` | Số cơ sở |
| 6 | Lead time phát hành hóa đơn | `billing_lead_months` | Thanh toán trước … tháng |
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
| 4 | Trạng thái cơ sở | Dropdown | Đăng ký tạm／Đăng ký chính thức／Đang tạm dừng／Dự kiến đóng／Đã đóng. "Đang tạm dừng" không giữ ở cơ sở, chỉ hiển thị từ trạng thái hợp đồng của hợp đồng cha (tạm dừng sử dụng) và lịch sử tạm dừng (trước đây: giữ "Đang tạm dừng" ở trạng thái cơ sở. Sửa theo 契約_01 §6-2 ngày 03/10/2026) |
| 5 | Loại hợp đồng | Dropdown | Triển khai chính thức／Chiến dịch dùng thử |
| 6 | Trạng thái hợp đồng | Dropdown | Hiệu lực／Đăng ký tạm／Đang làm thủ tục hủy hợp đồng／Tạm dừng sử dụng／Dừng／Kết thúc |
| 7 | Người nhận hóa đơn | Dropdown | Doanh nghiệp／Cơ sở này |
| 8 | Tỉnh/thành phố | Dropdown | 東京都／大阪府／愛知県／宮城県／神奈川県 |

**Các cột của danh sách**

| # | Cột | Tên vật lý | Nội dung |
|---|---|---|---|
| 1 | ID cơ sở | `branch_code` | CU＋số thứ tự. Mở chi tiết bằng liên kết |
| 2 | Tên cơ sở | `name` | — |
| 3 | Doanh nghiệp trực thuộc | `company_id` | Không có doanh nghiệp thì hiển thị "(Không có doanh nghiệp)" |
| 4 | Trạng thái cơ sở | `status` | Đăng ký tạm (xanh dương)／Đăng ký chính thức (xanh lá)／Đang tạm dừng (vàng)／Dự kiến đóng・Đã đóng (xám). Các giá trị được giữ là Đăng ký tạm／Đăng ký chính thức／Dự kiến đóng／Đã đóng. "Đang tạm dừng" chỉ hiển thị từ trạng thái hợp đồng của hợp đồng cha (tạm dừng sử dụng) và lịch sử tạm dừng (trước đây: giữ "Đang tạm dừng" ở trạng thái cơ sở. Sửa theo 契約_01 §6-2 ngày 03/10/2026) |
| 5 | Số hợp đồng cha | `—（từ hợp đồng cha）` | CP＋số thứ tự của hợp đồng cha đang hiệu lực. 29/09/2026: vì đã đổi danh sách hợp đồng thành danh sách hợp đồng con nên tìm hợp đồng cha ở đây (28-137) |
| 6 | Trạng thái hợp đồng | `—（từ hợp đồng cha）` | Hiệu lực／Đăng ký tạm／Đang làm thủ tục hủy hợp đồng／Tạm dừng sử dụng／Dừng／Kết thúc |
| 7 | Loại hợp đồng | `—（từ hợp đồng cha）` | Triển khai chính thức／Chiến dịch dùng thử |
| 8 | Gói hiện tại | `—（từ hợp đồng con của tháng hiện tại）` | ID gói・tên gói |
| 9 | Tháng bắt đầu hợp đồng ban đầu | `—（từ ngày bắt đầu hợp đồng ban đầu của cơ sở）` | yyyy-mm (trước đây: yyyy/mm. Sửa theo "Quy tắc chung về nhập liệu" của danh sách vấn đề 03/10/2026). Cơ sở đã chuyển đổi dùng ngày bắt đầu hợp đồng của ES cũ (bảng yêu cầu dòng 107 ngày 30/09/2026). Đổi tên cột để phân biệt với "Tháng bắt đầu hợp đồng" (tháng chu kỳ bắt đầu) của hợp đồng cha (trả lời STEP2 01/10/2026 Q5) |
| 10 | Tháng liên tục | `—（tính từ ngày bắt đầu hợp đồng ban đầu）` | Ví dụ: 5 năm 3 tháng. Không đặt lại khi đổi gói・chuyển đổi (bảng yêu cầu dòng 107 ngày 30/09/2026) |
| 11 | Người nhận hóa đơn | `bill_to` | Doanh nghiệp／Cơ sở này |
| 12 | Địa chỉ | `pref / city` | Tỉnh/thành phố・quận/huyện/thành phố |
| 13 | Ngày giờ đăng ký | `created_at` | yyyy-mm-dd HH:MM (trước đây: yyyy/mm/dd hh:mm. Sửa theo "Quy tắc chung về nhập liệu" của danh sách vấn đề 03/10/2026) |
| 14 | Thao tác | `—` | Bút chì ＝ chỉnh sửa |

### Màn hình: Danh sách hợp đồng con (chi tiết・chỉnh sửa là ct)

**Điều kiện tìm kiếm**

| # | Điều kiện | Loại | Lựa chọn |
|---|---|---|---|
| 1 | ID hợp đồng con, tên cơ sở, tên doanh nghiệp | Văn bản (khớp một phần) | — |
| 2 | Hợp đồng・tháng chu kỳ | Dropdown | 2026-10／2026-09／2026-08／2026-07 |
| 3 | Loại hợp đồng | Dropdown | Triển khai chính thức／Chiến dịch dùng thử |
| 4 | Gói | Dropdown | ES000003 Gói 50／ES000004 Gói 100／ES000005 Gói 150 |
| 5 | Phân loại giao hàng | Dropdown | Chuyến giao ES／Chuyến COOL |
| 6 | Trạng thái thanh toán (trả trước) | Dropdown | Đã tạo／① Đã xác định／Cơ sở đã xác định／Doanh nghiệp đã xác định／Đã xuất hóa đơn (trả lời STEP2 01/10/2026 Q6) |
| 7 | Phương pháp tạo | Dropdown | Batch hằng ngày／Tạo thủ công／Gộp cả năm |

**Các cột của danh sách**

| # | Cột | Tên vật lý | Nội dung |
|---|---|---|---|
| 1 | ID hợp đồng con | `contract_no-yyyymm` | Số hợp đồng cha ＋ tháng chu kỳ (CP0000001-202607). Mở chi tiết hợp đồng con bằng liên kết |
| 2 | Hợp đồng・tháng chu kỳ | `cycle_month` | yyyy-mm. Hiển thị ban đầu là tháng mới ở trên |
| 3 | Cơ sở | `branch_id` | Tên cơ sở |
| 4 | Doanh nghiệp trực thuộc | `company_id` | — |
| 5 | Loại hợp đồng | `—（từ hợp đồng cha）` | Triển khai chính thức／Chiến dịch dùng thử |
| 6 | Gói | `plan_id` | Gói áp dụng cho tháng này (kèm thế hệ) |
| 7 | Phân loại giao hàng・số lần giao hàng | `ship_kind / deliveries` | — |
| 8 | Tháng thanh toán (trả trước) | `advance_billing_month` | Tháng chu kỳ ＋ lead time phát hành hóa đơn |
| 9 | Số tiền thanh toán tháng này | `advance_total` | Tổng ① số tiền cố định (trả trước)・chưa thuế |
| 10 | Trạng thái thanh toán | `billing_status` | Trả trước ／ Trả sau (vận hành có 5 bước: Đã tạo・chưa tổng hợp／① ② đã xác định／Cơ sở đã xác định／Doanh nghiệp đã xác định／Đã xuất hóa đơn. Web doanh nghiệp là Chưa xác định／Đã xác định／Đã xuất hóa đơn. Trả lời STEP2 01/10/2026 Q6) |
| 11 | Phương pháp tạo | `gen_method` | Batch hằng ngày／Tạo thủ công／Gộp cả năm. Không hiển thị trên Web doanh nghiệp |
| 12 | Thao tác | `—` | Bút chì ＝ chỉnh sửa (hợp đồng con) |
