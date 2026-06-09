# SPEC: Contract Management — Quản lý Hợp đồng

> **Backlog ID:** ESKITCHEN-1235
> **Business Flow:** [HỢP ĐỒNG] Quản lý Hợp đồng
> **FigJam:** https://www.figma.com/board/iCeNUokzaWdL9KhdBqp49b/ES-Kitchen---Figjam?node-id=7102-91612
> **Domain slug:** `hop-dong` · 56 stories
> **Phase:** Phase 2
> **SPEC Transfer:** True

---

## Mô tả nghiệp vụ

Quản lý toàn bộ vòng đời hợp đồng giữa ES Kitchen và doanh nghiệp khách hàng (Pháp nhân / Company), bao gồm:

1. Doanh nghiệp đăng ký dùng thử (Trial) → System Admin phê duyệt → cấp tài khoản
2. Doanh nghiệp chuyển đổi từ Trial sang hợp đồng chính thức (Plan Contract)
3. System Admin quản lý danh mục gói dịch vụ (Plan), đăng ký / sửa / ẩn gói
4. Company Admin quản lý các cơ sở (Location) trực thuộc pháp nhân: thêm, sửa, theo dõi lịch sử
5. System Admin nhóm cơ sở vào cấu trúc cây Pháp nhân (Company Grouping)
6. Company Admin và System Admin xem / thay đổi gói hợp đồng, lịch giao hàng, thiết bị tủ lạnh
7. Company Admin gửi yêu cầu hủy hoặc đổi gói hợp đồng

Domain này là điểm khởi đầu của toàn bộ nghiệp vụ vận hành: khi hợp đồng được kích hoạt, các domain khác (Menu & Order, Giao hàng, Thanh toán) mới có thể hoạt động.

---

## Actors & Preconditions

### Actors

| Actor | Repo | Vai trò trong domain này |
|---|---|---|
| **E02 — Company Admin** | `es-kitchen-web-company` | Đăng ký Trial, đăng ký hợp đồng chính thức, quản lý Location, xem/yêu cầu đổi gói, cập nhật thông tin My Page |
| **E03 — System Admin** | `es-kitchen-web-admin` | Phê duyệt Trial, đăng ký/sửa gói Plan, nhóm Location thành Company, quản lý Plan Contract, xem danh sách hợp đồng toàn hệ thống |

> Feature này là **cross-repo** (E02 + E03 + API). PM cần Contract Lock trước Phase 3.

### Preconditions

| Precondition | Áp dụng cho |
|---|---|
| Company Admin đã có tài khoản (hoặc đang ở bước đăng ký Trial) | E02 |
| System Admin đã đăng nhập | E03 |
| Gói dịch vụ (Plan) đã được System Admin tạo trong hệ thống | Đăng ký hợp đồng chính thức |
| Location đã được tạo trong hệ thống | Gán Plan Contract cho Location |

---

## Happy Path

### HP-01: Đăng ký dùng thử (Trial Contract) — E02

1. Company Admin truy cập form đăng ký Trial.
2. Điền thông tin pháp nhân: Tên công ty (Kanji), Tên công ty (Kana), Mã bưu chính, Tỉnh/TP, Quận/Huyện, Địa chỉ chi tiết, Tên tòa nhà/Số phòng (optional), Số nhân viên (dropdown, mặc định "10人以下"), Số điện thoại, Số FAX (optional), Phương thức thanh toán.
3. Điền thông tin người phụ trách (担当者情報): Tên, SĐT, Email.
4. Điền thông tin người phụ trách thanh toán (請求者情報): Tên, SĐT, Email. Có checkbox "Sao chép từ 担当者" để tự động điền.
5. Điền thông tin địa chỉ giao hàng (納品先情報): Tên nơi nhận, Phòng ban (optional), địa chỉ đầy đủ, Người phụ trách nhận hàng, SĐT, Lối vào giao hàng (Radio: なし / あり), File đính kèm (optional). Có checkbox "Sao chép từ thông tin phía trên".
6. Điền thông tin đơn hàng và điều kiện giao nhận: Gói dịch vụ (dropdown), Phương thức giao hàng (dropdown), Mẫu số lượng chuẩn (dropdown), Tháng bắt đầu hợp đồng (YYYY/MM), Ngày không nhận hàng (Radio + Checkbox), Ghi chú.
7. Đọc và tick đồng ý Điều khoản sử dụng (bắt buộc trước khi submit).
8. Nhấn nút Xác nhận (確認) → hệ thống gửi yêu cầu đến System Admin để phê duyệt.
9. System Admin nhận yêu cầu, phê duyệt → hệ thống cấp tài khoản Trial cho Company Admin.

### HP-02: Đăng ký hợp đồng chính thức — E02

1. Company Admin (đã có tài khoản Trial) truy cập form chuyển đổi hợp đồng chính thức.
2. Điền đầy đủ thông tin theo cùng cấu trúc form Trial (HP-01 bước 2–7).
3. Nhấn Xác nhận → hệ thống gửi yêu cầu chuyển đổi đến System Admin.
4. System Admin xem xét và phê duyệt → hợp đồng chính thức được kích hoạt.

### HP-03: Phê duyệt Trial Contract — E03

1. System Admin vào màn hình xử lý đăng ký Trial.
2. Xem thông tin đơn đăng ký.
3. Phê duyệt → hệ thống tự động tạo tài khoản và cấp quyền truy cập Trial cho doanh nghiệp.

### HP-04: Quản lý Location (Company Admin) — E02

1. Company Admin vào trang Quản lý cơ sở (Site Management).
2. Xem danh sách cơ sở: Tên, Địa chỉ, Người phụ trách.
3. Xem chi tiết từng cơ sở: thông tin liên hệ, thông tin thiết bị (tủ lạnh).
4. Chỉnh sửa thông tin liên hệ và địa chỉ cơ sở.
5. Khai báo địa chỉ mới khi chuyển văn phòng.
6. Đăng ký ngày tòa nhà cúp điện / bảo trì để loại trừ khỏi lịch giao hàng.
7. Xem lịch sử thay đổi người phụ trách tại cơ sở.

### HP-05: Quản lý Location (System Admin) — E03

1. System Admin vào trang Quản lý Pháp nhân / Cơ sở.
2. Nhóm nhiều cơ sở vào một Pháp nhân theo cấu trúc cây (cha–con).
3. Đăng ký thủ công cơ sở mới: Tên, Pháp nhân sở hữu, Địa chỉ, Người phụ trách, Quy tắc giao hàng, Thông tin thiết bị.
4. Xem lịch sử di dời/chuyển đổi địa chỉ của cơ sở.
5. Xóa thông tin cơ sở khỏi hệ thống.

### HP-06: Quản lý Plan (System Admin) — E03

1. System Admin vào trang Quản lý Gói (Plan Management).
2. Xem danh sách gói: hỗ trợ tìm kiếm theo loại menu, bao gồm cả gói đã xóa.
3. Đăng ký gói mới: chọn loại Menu, thiết lập chi tiết gói.
4. Xem chi tiết/sửa gói: bật/ẩn (Show/Hide) gói dịch vụ.

### HP-07: Quản lý Plan Contract (System Admin) — E03

1. System Admin vào trang Danh sách Hợp đồng Plan.
2. Xem danh sách hợp đồng theo Pháp nhân, lọc theo năm/tháng, loại menu, tên pháp nhân, trạng thái hợp đồng.
3. Tải xuống CSV danh sách hợp đồng.
4. Xem chi tiết / chỉnh sửa hợp đồng: cài đặt giao hàng tự động, phí khởi tạo, phí hàng tháng, trạng thái hủy/đổi và lý do.
5. Thêm hợp đồng Plan mới: thông tin Plan, thiết lập ngày giao hàng tự động, địa điểm giao hàng, tùy chọn không nhận hàng.
6. Xóa hợp đồng Plan.

### HP-08: Xem / Yêu cầu đổi hoặc hủy gói (Company Admin) — E02

1. Company Admin vào trang Quản lý hợp đồng doanh nghiệp.
2. Xem gói hợp đồng hiện tại đang sử dụng tại từng cơ sở.
3. Xem lịch sử ký kết / thay đổi hợp đồng.
4. Xem danh sách ID thiết bị (tủ lạnh/máy bán hàng) đang thuê.
5. Gửi yêu cầu đổi sang gói hợp đồng khác hoặc yêu cầu hủy hợp đồng.

### HP-09: Cập nhật My Page (Company Admin) — E02

1. Company Admin vào My Page.
2. Chỉnh sửa thông tin liên hệ của quản trị viên doanh nghiệp.
3. Xem Điều khoản sử dụng và Chính sách bảo mật (tick đồng ý nếu yêu cầu).

### HP-10: Dashboard sử dụng (Company Admin) — E02

1. Company Admin xem màn hình Dashboard.
2. Hiển thị ngày dự kiến giao hàng tiếp theo (áp dụng cho tất cả cơ sở).
3. Hiển thị biểu đồ trực quan hóa số liệu sử dụng: tổng tiền, tỷ lệ sử dụng, top 3 sản phẩm phổ biến, số lần giao hàng.

---

## Alternative Flows & Edge Cases

### AF-01: Checkbox "Sao chép thông tin"
- Khi tick checkbox "Sao chép từ 担当者" trong mục 請求者情報 → hệ thống tự động điền các trường tương ứng, người dùng không cần nhập lại.
- Khi tick checkbox "Sao chép từ thông tin phía trên" trong mục 納品先情報 → hệ thống tự động điền toàn bộ thông tin địa chỉ từ phần trên.
- Nếu untick sau khi đã điền tự động → các trường trở lại trạng thái rỗng, cho phép nhập tay.

### AF-02: Validation form đăng ký
- Tất cả trường Required phải có giá trị trước khi submit.
- Nút 確認 bị disabled nếu chưa tick đồng ý Điều khoản sử dụng.
- Mã bưu chính: định dạng 123-4567, chỉ nhập số half-width, cho phép dấu (-).
- Số điện thoại / FAX: cho phép dấu (-), chỉ nhập số half-width.
- Email: validate định dạng email hợp lệ.
- Tháng bắt đầu hợp đồng: định dạng YYYY/MM, chỉ nhập tháng — không nhập ngày cụ thể.

### AF-03: Ngày không nhận hàng
- Nếu chọn "受け取れない曜日がある": hiển thị checkbox 月〜金 (thứ 2 đến thứ 6), không bao gồm thứ 7 và Chủ nhật.
- Nếu chọn "お任せ": hệ thống tự sắp xếp, ngoại trừ kỳ nghỉ dài (golden week, năm mới...).
- **TODO (BA):** Định nghĩa "kỳ nghỉ dài" do hệ thống quy định hay do admin cấu hình?

### AF-04: Đăng ký ngày loại trừ giao hàng (bảo trì tòa nhà)
- Company Admin đăng ký ngày cúp điện / kiểm tra tòa nhà → hệ thống loại ngày đó khỏi lịch giao hàng tự động.
- **TODO (BA):** Khoảng thời gian tối thiểu báo trước là bao lâu? Có giới hạn số ngày loại trừ mỗi tháng không?

### AF-05: Ẩn/Hiện gói Plan
- System Admin có thể bật/ẩn (Show/Hide) từng gói dịch vụ.
- Gói đang ẩn không hiển thị trong dropdown chọn gói của Company Admin.
- **TODO (BA):** Gói đã ẩn nhưng đang có hợp đồng active → xử lý thế nào? Cho phép tồn tại hay cần cảnh báo?

### AF-06: Xóa Location hoặc Plan Contract
- Xóa Location: cần xác nhận — kiểm tra xem Location có hợp đồng đang active không.
- Xóa Plan Contract: cần xác nhận — kiểm tra hợp đồng có ảnh hưởng đến lịch giao hàng đang chạy không.
- **TODO (BA):** Quy tắc xóa mềm (soft delete) hay xóa cứng? Domain Giao hàng cần biết để giữ lịch sử.

### AF-07: Yêu cầu hủy / đổi gói từ Company Admin
- Khi Company Admin gửi yêu cầu hủy hoặc đổi gói → System Admin nhận thông báo để xử lý.
- **TODO (BA):** Có SLA xử lý yêu cầu này không (ví dụ: xử lý trong 3 ngày làm việc)? Có cần email xác nhận tự động gửi về Company Admin không?

### AF-08: Lịch sử thay đổi người phụ trách
- Hệ thống ghi nhận mỗi lần người phụ trách tại cơ sở thay đổi (ai thay đổi, thời điểm, giá trị cũ → mới).

### AF-09: Cơ sở có nhiều thiết bị
- Một Location có thể gắn nhiều ID thiết bị (tủ lạnh/máy bán hàng).
- Company Admin xem danh sách ID thiết bị → chỉ xem, không thêm/xóa thiết bị.
- **TODO (BA):** Ai quản lý lifecycle thiết bị (thêm/xóa/thay)? System Admin hay quy trình ngoài hệ thống?

### AF-10: CSV Export hợp đồng Plan
- System Admin tải CSV danh sách hợp đồng Plan.
- **TODO (BA):** Encoding CSV là UTF-8 hay Shift-JIS (tiêu chuẩn Nhật)? Fields nào cần export?

---

## Acceptance Criteria

### AC-01: Form đăng ký Trial / Hợp đồng chính thức
- [ ] Form hiển thị đầy đủ 4 nhóm thông tin: Pháp nhân, Người phụ trách, Người phụ trách thanh toán, Địa chỉ giao hàng, Đơn hàng & Điều kiện giao nhận.
- [ ] Tất cả trường Required validate trước khi submit; hiển thị thông báo lỗi rõ ràng khi thiếu.
- [ ] Checkbox "Sao chép" hoạt động đúng cho cả 2 nhóm thông tin áp dụng.
- [ ] Nút Xác nhận bị disabled khi chưa tick đồng ý Điều khoản sử dụng.
- [ ] Sau submit, hệ thống hiển thị xác nhận đã gửi yêu cầu và System Admin được thông báo.
- [ ] Validate định dạng: mã bưu chính (123-4567), số điện thoại (half-width + dấu -), email, tháng hợp đồng (YYYY/MM).

### AC-02: Phê duyệt Trial (System Admin)
- [ ] System Admin thấy danh sách yêu cầu Trial chờ phê duyệt.
- [ ] Sau khi System Admin phê duyệt, hệ thống tự động tạo tài khoản và Company Admin nhận được thông tin truy cập.

### AC-03: Quản lý Location (Company Admin)
- [ ] Company Admin xem được danh sách cơ sở trực thuộc pháp nhân của mình.
- [ ] Xem chi tiết cơ sở: thông tin liên hệ + danh sách thiết bị.
- [ ] Chỉnh sửa thông tin cơ sở thành công, lưu lại lịch sử thay đổi.
- [ ] Đăng ký địa chỉ mới (chuyển văn phòng) → địa chỉ giao hàng cập nhật tương ứng.
- [ ] Đăng ký ngày loại trừ → ngày đó không xuất hiện trong lịch giao hàng tự động.
- [ ] Lịch sử thay đổi người phụ trách hiển thị đúng thứ tự thời gian.

### AC-04: Quản lý Location (System Admin)
- [ ] System Admin nhóm được nhiều Location vào 1 Company theo cấu trúc cây.
- [ ] Đăng ký thủ công Location mới với đầy đủ thông tin.
- [ ] Lịch sử di dời/chuyển đổi địa chỉ hiển thị đầy đủ.
- [ ] Xóa Location thành công sau khi xác nhận.

### AC-05: Quản lý Plan (System Admin)
- [ ] Danh sách Plan hỗ trợ tìm kiếm theo loại menu; bao gồm toggle hiển thị Plan đã xóa.
- [ ] Đăng ký Plan mới thành công.
- [ ] Bật/Ẩn Plan: Plan đang ẩn không xuất hiện trong dropdown phía Company Admin.
- [ ] Plan có thông tin mô tả hiển thị bên cạnh dropdown khi Company Admin chọn gói.

### AC-06: Quản lý Plan Contract (System Admin)
- [ ] Danh sách hợp đồng Plan lọc được theo: năm/tháng, loại menu, tên pháp nhân, trạng thái.
- [ ] Tải xuống CSV danh sách hợp đồng thành công.
- [ ] Thêm / sửa / xóa Plan Contract thành công.
- [ ] Khi sửa hợp đồng: cài đặt giao hàng tự động, phí khởi tạo, phí hàng tháng, trạng thái hủy/đổi và lý do đều lưu đúng.

### AC-07: Xem / Yêu cầu đổi hoặc hủy gói (Company Admin)
- [ ] Company Admin xem được gói hợp đồng hiện tại theo từng cơ sở.
- [ ] Xem lịch sử ký kết/thay đổi hợp đồng.
- [ ] Xem danh sách ID thiết bị đang thuê.
- [ ] Gửi yêu cầu đổi gói / hủy hợp đồng thành công → System Admin nhận được yêu cầu.

### AC-08: My Page & Dashboard (Company Admin)
- [ ] Cập nhật thông tin liên hệ quản trị viên thành công.
- [ ] Hiển thị ngày giao hàng dự kiến tiếp theo đúng với lịch thực tế.
- [ ] Dashboard hiển thị đúng: tổng tiền, tỷ lệ sử dụng, top 3 sản phẩm, số lần giao hàng.

---

## Out of Scope

- Xử lý thanh toán phí hợp đồng (thuộc domain [THANH TOÁN])
- Quản lý tồn kho thiết bị tủ lạnh / Serial number lifecycle (thuộc domain [TỒN KHO & THIẾT BỊ])
- Tạo lịch giao hàng chi tiết (thuộc domain [GIAO HÀNG] Lịch trình & Điều phối)
- Quản lý menu theo Plan (thuộc domain [MENU & ORDER])
- Gửi email thông báo tự động (liên quan cấu hình trong domain [SYSTEM & OTHER])
- Tích hợp HubSpot để đồng bộ thông tin doanh nghiệp (scope của [SYSTEM & OTHER])
- E01 Mobile App: không có màn hình liên quan đến quản lý hợp đồng
- E04 Supplier: không tham gia vào vòng đời hợp đồng

---

## Dependencies với domain khác

| Domain liên quan | Điểm giao |
|---|---|
| [GIAO HÀNG] Lịch trình & Điều phối | Ngày giao hàng tự động, ngày loại trừ, tháng bắt đầu hợp đồng |
| [MENU & ORDER] Quản lý Thực đơn & Đặt hàng | Plan liên kết loại Menu; Order chỉ tạo được khi có hợp đồng active |
| [THANH TOÁN] Thanh toán & Hoàn tiền | Phương thức thanh toán, phí hàng tháng, phí khởi tạo được khai báo trong hợp đồng |
| [TỒN KHO & THIẾT BỊ] | ID thiết bị gắn với Location trong hợp đồng |
| [TASK MANAGEMENT] | Hợp đồng mới / thay đổi → trigger tạo Task tự động cho nhân viên vận hành |

---

## TODO (BA) — Danh sách câu hỏi còn mở

| # | Vị trí | Câu hỏi |
|---|---|---|
| 1 | AF-03 | "Kỳ nghỉ dài" trong tùy chọn お任せ — do hệ thống cố định hay admin cấu hình từng năm? |
| 2 | AF-04 | Khoảng thời gian tối thiểu báo trước khi đăng ký ngày loại trừ giao hàng? Giới hạn số ngày/tháng? |
| 3 | AF-05 | Plan đang ẩn nhưng vẫn có hợp đồng active → hiển thị cảnh báo hay cho phép tồn tại song song? |
| 4 | AF-06 | Xóa Location/Plan Contract: soft delete (ẩn, giữ lịch sử) hay hard delete? |
| 5 | AF-07 | SLA xử lý yêu cầu hủy/đổi gói? Có email xác nhận tự động gửi về Company Admin không? |
| 6 | AF-09 | Ai quản lý lifecycle thiết bị (thêm/xóa/thay thế)? System Admin hay quy trình ngoài hệ thống? |
| 7 | AF-10 | Encoding file CSV export: UTF-8 hay Shift-JIS? Fields nào cần xuất? |
| 8 | HP-03 | Sau khi System Admin phê duyệt Trial → hệ thống gửi thông tin tài khoản qua email hay phương thức khác? |

---

## Screens

| Screen | Actor | App | Mô tả ngắn |
|---|---|---|---|
| Trial Registration Form | E02 | E02 (Company Admin Web) | Form đăng ký dùng thử — điền thông tin pháp nhân, người phụ trách, địa chỉ giao hàng, điều kiện đơn hàng, xác nhận điều khoản |
| Official Contract Registration Form | E02 | E02 (Company Admin Web) | Form chuyển đổi sang hợp đồng chính thức — cùng cấu trúc Trial form, gửi yêu cầu lên System Admin |
| Site Management - List *inferred | E02 | E02 (Company Admin Web) | Danh sách cơ sở trực thuộc pháp nhân: Tên, Địa chỉ, Người phụ trách |
| Site Management - Detail & Edit | E02 | E02 (Company Admin Web) | Chi tiết cơ sở: thông tin liên hệ, danh sách thiết bị, chỉnh sửa địa chỉ/người phụ trách |
| Site Management - Exclusion Days *inferred | E02 | E02 (Company Admin Web) | Đăng ký ngày tòa nhà cúp điện/bảo trì — loại trừ khỏi lịch giao hàng tự động |
| Site Management - Change History *inferred | E02 | E02 (Company Admin Web) | Lịch sử thay đổi người phụ trách tại cơ sở |
| Contract Management - Current Plan | E02 | E02 (Company Admin Web) | Xem gói hợp đồng hiện tại theo từng cơ sở và danh sách ID thiết bị đang thuê |
| Contract Management - History *inferred | E02 | E02 (Company Admin Web) | Lịch sử ký kết và thay đổi hợp đồng |
| Contract Change / Cancel Request | E02 | E02 (Company Admin Web) | Form gửi yêu cầu đổi sang gói hợp đồng khác hoặc yêu cầu hủy hợp đồng |
| My Page | E02 | E02 (Company Admin Web) | Chỉnh sửa thông tin liên hệ quản trị viên, xem Điều khoản & Chính sách bảo mật |
| Dashboard | E02 | E02 (Company Admin Web) | Ngày giao hàng dự kiến tiếp theo, biểu đồ tổng tiền, tỷ lệ sử dụng, top 3 sản phẩm, số lần giao hàng |
| Trial Approval - List | E03 | E03 (System Admin Web) | Danh sách yêu cầu Trial chờ phê duyệt |
| Trial Approval - Detail | E03 | E03 (System Admin Web) | Xem thông tin đơn đăng ký Trial, thực hiện phê duyệt |
| Location Management - List | E03 | E03 (System Admin Web) | Danh sách tất cả cơ sở trong hệ thống, hỗ trợ cấu trúc cây Pháp nhân cha–con |
| Location Management - Detail & Edit | E03 | E03 (System Admin Web) | Đăng ký/sửa thông tin cơ sở thủ công: Pháp nhân, địa chỉ, người phụ trách, quy tắc giao hàng, thiết bị |
| Location Move History *inferred | E03 | E03 (System Admin Web) | Lịch sử di dời/chuyển đổi địa chỉ của cơ sở |
| Plan Management - List | E03 | E03 (System Admin Web) | Danh sách gói dịch vụ, tìm kiếm theo loại menu, bao gồm gói đã ẩn |
| Plan Management - Create & Edit | E03 | E03 (System Admin Web) | Đăng ký gói mới hoặc chỉnh sửa gói: loại menu, chi tiết gói, bật/ẩn (Show/Hide) |
| Plan Contract - List | E03 | E03 (System Admin Web) | Danh sách hợp đồng Plan, lọc theo năm/tháng/loại menu/tên pháp nhân/trạng thái, tải CSV |
| Plan Contract - Detail & Edit | E03 | E03 (System Admin Web) | Chi tiết hợp đồng: giao hàng tự động, phí khởi tạo, phí hàng tháng, trạng thái hủy/đổi và lý do |
| Plan Contract - Create | E03 | E03 (System Admin Web) | Thêm hợp đồng Plan mới: thông tin Plan, ngày giao hàng tự động, địa điểm, tùy chọn không nhận hàng |

---

## Bước tiếp theo

SPEC này ảnh hưởng **2 repo giao diện** (E02 `es-kitchen-web-company` + E03 `es-kitchen-web-admin`) và **1 repo API** (`es-kitchen-api`). Cần Contract Lock REST API trước Phase 3.

Handover hint để trigger bước tiếp theo (chạy song song):

> "Hãy là Tech Lead Design, làm DESIGN.md từ SPEC này: `es-kitchen-docs/docs/features/contract-management/SPEC.md`"

> "Hãy là QC, sinh test cases từ SPEC này: `es-kitchen-docs/docs/features/contract-management/SPEC.md`"
> (hoặc slash command `/test/generate_manual_testcases_rbt` cho FULL RBT / `/test/generate_testcases_from_requirements` cho QUICK)

> "Hãy là Designer, tạo UI-SPEC.md + Figma từ SPEC này: es-kitchen-docs/docs/features/contract-management/SPEC.md"
> (hoặc slash command: /create-ui-design es-kitchen-docs/docs/features/contract-management/SPEC.md)
