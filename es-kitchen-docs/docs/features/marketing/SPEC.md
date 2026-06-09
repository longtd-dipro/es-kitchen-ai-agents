# SPEC: Marketing — Giới thiệu Công ty (Referral) & Quản lý Đại lý

> Backlog ID: ESKITCHEN-1246 (Marketing/Referral) · ESKITCHEN-1247 (Agency)
> Business Flow: `BF_[MARKETING] Giới thiệu Công ty (Referral)` · `BF_[ĐẠI LÝ] Quản lý Đại lý`
> FigJam: https://www.figma.com/board/iCeNUokzaWdL9KhdBqp49b/ES-Kitchen---Figjam?node-id=7102-93062

---

## Mô tả nghiệp vụ

Hệ thống Marketing ESKITCHEN gồm hai nhánh nghiệp vụ:

1. **Referral Campaign (Giới thiệu Công ty):** Khách hàng hiện tại (Company Admin) giới thiệu công ty/đối tác mới sử dụng dịch vụ ESKITCHEN. Người giới thiệu nhận ưu đãi (ví dụ: miễn phí 1 tháng thanh toán). System Admin quản lý toàn bộ chiến dịch, phê duyệt, theo dõi chuyển đổi.

2. **Agency Management (Quản lý Đại lý):** System Admin quản lý danh sách đại lý/đối tác tiếp thị, thiết lập gói hoa hồng theo 4 Plan (A/B/C/D), theo dõi hiệu suất và thực hiện thanh toán hoa hồng hàng tháng.

Ngoài ra, System Admin quản lý **Free Campaign / Sample Campaign** (chiến dịch dùng thử/hàng mẫu) cho phép giao hàng tới khách mới mà không cần tạo Master Pháp nhân trước, đồng thời theo dõi tỷ lệ chuyển đổi từ dùng thử sang ký hợp đồng.

---

## Actors & Preconditions

| Actor | Vai trò | Preconditions |
|---|---|---|
| **E02 — Company Admin** | Tạo referral form, xem lịch sử giới thiệu, xem ưu đãi nhận được | Đã login; công ty có hợp đồng active |
| **E03 — System Admin** | Quản lý toàn bộ chiến dịch referral, free campaign/sample, agency; phê duyệt referral; thanh toán hoa hồng | Đã login; có quyền Marketing Admin |

> Phạm vi: **Cross-repo** (E02 + E03 + `es-kitchen-api`) — cần Contract Lock trước Phase 3.

> **TODO (BA):** E01 (User Mobile) có flow Referral riêng không (ví dụ: nhân viên giới thiệu bằng app)? Domain index note "User Mobile" là target nhưng `marketing.md` không có story nào cho E01. Xác nhận với client trước khi đóng SPEC.

---

## Happy Path

### A. Referral Campaign — Company Admin (E02) gửi giới thiệu

1. Company Admin đăng nhập web, vào section **Referral Campaign**.
2. Admin điền **Business Partner / Group Company Introduction Form**:
   - Tên công ty được giới thiệu
   - Thông tin người liên hệ
   - Ghi chú nội bộ
3. Hệ thống ghi nhận referral mới, trạng thái = `Đang đàm phán`.
4. Admin có thể xem **Referral History** — danh sách các lần giới thiệu đã gửi, kèm trạng thái tiến độ (Đang đàm phán / Đã ký / Đã hủy).
5. Khi referral chuyển sang trạng thái `Đã ký`, hệ thống hiển thị **Referral Bonus** cho Admin (ví dụ: Miễn phí 1 tháng thanh toán).

### B. Referral Management — System Admin (E03) phê duyệt referral

1. System Admin vào **Referral Campaign Management > Referral Management**.
2. Xem **List of Introductions** — danh sách referral từ tất cả Company Admin, hiển thị: Plan áp dụng, trạng thái hợp đồng, ngày ký.
3. Với referral chờ duyệt, Admin thực hiện **Referral Registration (for administrators)**:
   - Đánh giá thông tin tín dụng và điều kiện hợp đồng của công ty được giới thiệu
   - Phê duyệt hoặc từ chối
4. Xem **Referral Detail**:
   - Thông tin đầy đủ của referral
   - Sau khi duyệt: khóa chỉnh sửa thông tin Plan
   - Sau khi thanh toán hoa hồng: khóa toàn bộ chỉnh sửa

### C. Free Campaign / Sample Campaign — System Admin (E03) quản lý

1. System Admin vào **Free Campaign / Sample Management > New Registration**.
2. Điền thông tin chiến dịch dùng thử:
   - Thông tin giao hàng khách mới (không yêu cầu Master Pháp nhân)
   - Thời gian chiến dịch, số lượng mẫu
3. Hệ thống lưu chiến dịch và có thể tự động lấy thông tin từ **HubSpot**.
4. Admin có thể xem chi tiết và **Edit** thông tin chiến dịch.
5. Admin có thể **Delete** chiến dịch.
6. Admin xem **Campaign History (List View)** — danh sách tất cả đợt phát hàng mẫu/dùng thử.
7. Hệ thống tổng hợp **Success Rate** — tỷ lệ chuyển đổi từ Dùng thử sang Ký hợp đồng chính thức.

### D. Agency Management — System Admin (E03) quản lý đại lý

1. System Admin vào **Referral Campaign Management > Agency Management**.
2. Xem **List of Agents** — danh sách tất cả đại lý/đối tác.
3. **Agency Registration** — đăng ký đại lý mới:
   - Tên công ty, trạng thái (Đang chạy / Đã hủy), thông tin người liên hệ
4. Xem **Agency Detail** gồm 4 tab:
   - **Basic Information:** ID Hệ thống, Tên Công ty, Trạng thái, Người liên hệ
   - **Contract and Compensation Settings:** Chọn Plan hoa hồng (A/B/C/D), tài khoản ngân hàng, khai báo thuế, ghi chú nội bộ
   - **Performance Summary:** Lũy kế số KH giới thiệu, số KH đang active, tổng hoa hồng đã trả, số chưa trả
   - **Referral History:** Chi tiết từng KH đại lý giới thiệu — tình trạng, số tháng đã trôi qua, hoa hồng tháng này
   - **Payment History:** Lịch sử thanh toán hoa hồng — Tháng, Số tiền, Trạng thái (Đã chuyển/Chưa chuyển), Ngày chuyển

---

## Alternative Flows & Edge Cases

### A1. Company Admin xem referral nhưng chưa có lần giới thiệu nào
- Hiển thị empty state với hướng dẫn cách giới thiệu và thông tin ưu đãi.

### A2. Company Admin gửi referral cho công ty đã là khách hàng
- **TODO (BA):** Hệ thống có chặn không? Hay chỉ warn? Xác nhận với client.

### B1. System Admin chỉnh sửa Plan sau khi đã duyệt
- Không cho phép — trường Plan bị khóa (read-only) sau khi duyệt.

### B2. System Admin chỉnh sửa bất kỳ thông tin nào sau khi đã thanh toán hoa hồng
- Không cho phép — toàn bộ form bị khóa (read-only) sau khi thanh toán.

### C1. HubSpot không phản hồi khi tự động lấy dữ liệu chiến dịch
- Hệ thống tiếp tục hoạt động độc lập; hiển thị cảnh báo đồng bộ thất bại.
- **TODO (BA):** Sync HubSpot là 1 chiều hay 2 chiều? Trigger theo lịch (cron) hay theo event? Xác nhận với client/tech.

### C2. Delete chiến dịch đã có giao hàng thực tế
- **TODO (BA):** Có được phép xóa không? Hay chỉ cancel/archive? Xác nhận với client.

### D1. Plan hoa hồng thay đổi sau khi đại lý đã có referral active
- Plan mới áp dụng từ thời điểm thay đổi; các kỳ trước giữ nguyên Plan cũ.
- **TODO (BA):** Xác nhận rule này với client — có hồi tố không?

### D2. Referral Process — 4 Plan hoa hồng
Quy tắc trả hoa hồng áp dụng theo Plan được chọn cho đại lý/người giới thiệu:

| Plan | Mô tả |
|---|---|
| A | Thưởng 1 lần (one-time bonus) |
| B | Thưởng đại lý (agency bonus — cấu trúc cụ thể TBD) |
| C | 10% duy trì 36 tháng |
| D | 7% vô thời hạn |

> **TODO (BA):** Tỷ lệ % trong Plan A và B là bao nhiêu? Tính % trên giá trị hợp đồng hay doanh thu thực tế? Xác nhận với client.

### D3. Đại lý bị đặt trạng thái "Đã hủy"
- Ngừng tính hoa hồng mới từ thời điểm hủy; các referral đang active của đại lý này xử lý thế nào? **TODO (BA):** Xác nhận rule.

---

## Acceptance Criteria

### AC-MARKETING-01: Company Admin — Gửi Referral Form
- [ ] Company Admin có thể điền và submit Business Partner Introduction Form
- [ ] Form yêu cầu tối thiểu: tên công ty được giới thiệu + thông tin liên hệ
- [ ] Sau khi submit, referral mới xuất hiện trong Referral History với trạng thái `Đang đàm phán`

### AC-MARKETING-02: Company Admin — Xem Referral History & Bonus
- [ ] Hiển thị danh sách tất cả referral đã gửi với: tên công ty, ngày gửi, trạng thái tiến độ
- [ ] Khi trạng thái = `Đã ký`, hiển thị thông tin ưu đãi/bonus tương ứng
- [ ] Referral History phân trang nếu có nhiều bản ghi

### AC-MARKETING-03: System Admin — Referral Registration & Approval
- [ ] System Admin có thể xem danh sách referral chờ duyệt
- [ ] Có thể phê duyệt hoặc từ chối từng referral
- [ ] Sau khi duyệt, trường Plan bị khóa (không cho sửa)
- [ ] Sau khi thanh toán hoa hồng, toàn bộ form bị khóa

### AC-MARKETING-04: System Admin — Free Campaign / Sample Management
- [ ] Có thể tạo mới chiến dịch dùng thử với thông tin giao hàng, không yêu cầu Master Pháp nhân
- [ ] Có thể edit và delete chiến dịch (ràng buộc xóa xác nhận theo **TODO C2**)
- [ ] Danh sách Campaign History hiển thị đầy đủ lịch sử các đợt
- [ ] Success Rate được tính và hiển thị (số chuyển đổi / tổng dùng thử)
- [ ] Tự động đồng bộ dữ liệu từ HubSpot (chi tiết trigger theo **TODO C1**)

### AC-MARKETING-05: System Admin — Agency Management
- [ ] Có thể tạo, xem, chỉnh sửa thông tin đại lý
- [ ] Đại lý có thể chuyển trạng thái: Đang chạy / Đã hủy
- [ ] Agency Detail hiển thị đúng 4 section: Basic Info, Contract/Compensation, Performance Summary, Referral History, Payment History

  > Lưu ý: domain mô tả 5 tab nhưng tên section là "4 tab" — **TODO (BA):** Xác nhận số lượng tab thực tế với Designer/Client.

### AC-MARKETING-06: Referral Plan — Tính hoa hồng đúng theo Plan A/B/C/D
- [ ] Plan C: tính 10% trong 36 tháng kể từ ngày ký hợp đồng
- [ ] Plan D: tính 7% vô thời hạn kể từ ngày ký hợp đồng
- [ ] Plan A/B: theo rule xác nhận (**TODO D2**)
- [ ] Sau khi thanh toán, Payment History cập nhật trạng thái `Đã chuyển` và ghi ngày chuyển

### AC-MARKETING-07: Performance Summary đại lý
- [ ] Hiển thị: tổng số KH giới thiệu (lũy kế), số KH đang active, tổng hoa hồng đã trả, số tiền chưa trả
- [ ] Dữ liệu tự động cập nhật khi có referral mới hoặc thanh toán mới

---

## Out of Scope

- Tự động chuyển khoản ngân hàng (hoa hồng được ghi nhận và đánh dấu `Đã chuyển` thủ công bởi Admin — không tích hợp banking API trong Phase 2)
- Giao diện đại lý tự đăng nhập xem hoa hồng (không có actor E04/E05 cho Agency trong domain này)
- E01 (User Mobile) referral flow — chờ xác nhận **TODO** ở mục Actors
- Tích hợp hai chiều HubSpot ngoài sync chiến dịch dùng thử — chờ xác nhận **TODO C1**

---

## Dependencies

| Dependency | Lý do |
|---|---|
| `BF_[HỢP ĐỒNG] Quản lý Hợp đồng` | Referral chuyển sang `Đã ký` khi hợp đồng được tạo — cần trạng thái hợp đồng làm trigger |
| HubSpot Integration (`BF_[SYSTEM & OTHER]`) | Free Campaign tự động lấy dữ liệu từ HubSpot |
| Company Master Data | Referral form cần lookup/validate công ty hiện có trong hệ thống |

---

## Screens

| Screen Code | Screen | Actor | App | Screen Type | Mô tả ngắn |
|---|---|---|---|---|---|
| CW_MKTG_001 | Referral Campaign Page | E02 | E02 (es-kitchen-web-company) | Dashboard* | Trang tổng hợp Referral Campaign — entry point xem lịch sử và tạo giới thiệu mới |
| CW_MKTG_002 | Business Partner Introduction Form | E02 | E02 (es-kitchen-web-company) | Form | Form điền thông tin công ty được giới thiệu + người liên hệ + ghi chú nội bộ, submit tạo referral mới |
| CW_MKTG_003 | Referral History List (Company) | E02 | E02 (es-kitchen-web-company) | List | Danh sách tất cả referral đã gửi — tên công ty, ngày gửi, trạng thái tiến độ, thông tin bonus khi trạng thái = Đã ký |
| AW_MKTG_001 | Referral Campaign Management — List of Introductions | E03 | E03 (es-kitchen-web-admin) | List | Danh sách toàn bộ referral từ tất cả Company Admin — Plan áp dụng, trạng thái hợp đồng, ngày ký |
| AW_MKTG_002 | Referral Registration / Approval Form | E03 | E03 (es-kitchen-web-admin) | Form | Form đánh giá tín dụng và điều kiện hợp đồng, thực hiện phê duyệt hoặc từ chối referral |
| AW_MKTG_003 | Referral Detail | E03 | E03 (es-kitchen-web-admin) | Detail | Xem đầy đủ thông tin referral; trường Plan bị khóa sau duyệt; toàn bộ form bị khóa sau thanh toán |
| AW_MKTG_004 | Free Campaign / Sample Management — Campaign History List | E03 | E03 (es-kitchen-web-admin) | List | Danh sách tất cả đợt phát hàng mẫu/dùng thử, hiển thị Success Rate (tỷ lệ chuyển đổi) |
| AW_MKTG_005 | Free Campaign New Registration Form | E03 | E03 (es-kitchen-web-admin) | Form | Form tạo chiến dịch dùng thử mới — thông tin giao hàng, thời gian, số lượng mẫu (không cần Master Pháp nhân) |
| AW_MKTG_006 | Free Campaign Detail / Edit | E03 | E03 (es-kitchen-web-admin) | Detail | Xem và chỉnh sửa thông tin chiến dịch dùng thử; hỗ trợ đồng bộ tự động từ HubSpot |
| AW_MKTG_007 | Agency Management — List of Agents | E03 | E03 (es-kitchen-web-admin) | List | Danh sách tất cả đại lý/đối tác tiếp thị kèm trạng thái (Đang chạy / Đã hủy) |
| AW_MKTG_008 | Agency Registration Form | E03 | E03 (es-kitchen-web-admin) | Form | Form đăng ký đại lý mới — tên công ty, trạng thái, thông tin người liên hệ |
| AW_MKTG_009 | Agency Detail — Basic Information tab | E03 | E03 (es-kitchen-web-admin) | Detail | Tab thông tin cơ bản đại lý: ID hệ thống, tên công ty, trạng thái, người liên hệ |
| AW_MKTG_010 | Agency Detail — Contract and Compensation Settings tab | E03 | E03 (es-kitchen-web-admin) | Form* | Tab cấu hình hợp đồng: chọn Plan hoa hồng (A/B/C/D), tài khoản ngân hàng, khai báo thuế, ghi chú |
| AW_MKTG_011 | Agency Detail — Performance Summary tab | E03 | E03 (es-kitchen-web-admin) | Dashboard* | Tab tổng hợp hiệu suất: lũy kế KH giới thiệu, KH active, tổng hoa hồng đã trả / chưa trả |
| AW_MKTG_012 | Agency Detail — Referral History tab | E03 | E03 (es-kitchen-web-admin) | List | Tab chi tiết từng KH đại lý đã giới thiệu — tình trạng, số tháng đã trôi qua, hoa hồng tháng này |
| AW_MKTG_013 | Agency Detail — Payment History tab | E03 | E03 (es-kitchen-web-admin) | List | Tab lịch sử thanh toán hoa hồng — tháng, số tiền, trạng thái (Đã chuyển / Chưa chuyển), ngày chuyển |

---

## Bước tiếp theo

Chạy song song sau khi SPEC được review:

- "Hãy là Tech Lead Design, làm DESIGN.md từ SPEC này: `/Users/longtd/Desktop/WORK/AI_AGENTS_ES_KITCHEN/es-kitchen-docs/docs/features/marketing/SPEC.md`"
- "Hãy là QC, sinh test cases từ SPEC này: `/Users/longtd/Desktop/WORK/AI_AGENTS_ES_KITCHEN/es-kitchen-docs/docs/features/marketing/SPEC.md`"
  (hoặc slash command: `/test/generate_manual_testcases_rbt` cho FULL RBT / `/test/generate_testcases_from_requirements` cho QUICK)
- "Hãy là Designer, tạo UI-SPEC.md + Figma từ SPEC này: es-kitchen-docs/docs/features/marketing/SPEC.md"
  (hoặc slash command: /create-ui-design es-kitchen-docs/docs/features/marketing/SPEC.md)
