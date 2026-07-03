# SPEC: Marketing — Giới thiệu Công ty (Referral) & Free Campaign

> Backlog ID: ESKITCHEN-1246 (Marketing/Referral)
> Business Flow: `BF_[MARKETING] Giới thiệu Công ty (Referral)`
> FigJam: https://www.figma.com/board/iCeNUokzaWdL9KhdBqp49b/ES-Kitchen---Figjam?node-id=7102-93062
> Cập nhật: 2026-07-03 — theo `es-kitchen-requirements/markerting_daily_function_list.xlsx` (sheet `BF_ MARKETING`)
> Domain nguồn: `.claude/context/business-flows/domains/marketing.md`
> **Split note:** Phần quản lý Đại lý & Hoa hồng đã tách sang [Agency Management SPEC](../agency-management/SPEC.md).

---

## Mô tả nghiệp vụ

SPEC này bao phủ 3 nhóm nghiệp vụ Marketing của ESKITCHEN:

1. **Referral Campaign (E02 Company Admin):** Khách hàng hiện tại giới thiệu công ty/đối tác mới sử dụng dịch vụ ESKITCHEN. Người giới thiệu nhận ưu đãi (ví dụ: miễn phí 1 tháng thanh toán).

2. **Free Campaign / Sample Campaign (E03 System Admin):** Chiến dịch dùng thử / phát hàng mẫu cho khách hàng mới. Từ bản cập nhật xlsx 2026-07-03: **thông tin khách hàng mới BẮT BUỘC được cập nhật vào Master Pháp nhân** khi đăng ký chiến dịch (không còn "khách vãng lai"). Hệ thống có khả năng đồng bộ dữ liệu từ HubSpot và theo dõi tỷ lệ chuyển đổi từ dùng thử sang ký hợp đồng chính thức.

3. **Referral Campaign Management — Referral Management (E03 System Admin):** System Admin phê duyệt các referral do Company Admin gửi lên, áp dụng quy tắc trả phí hoa hồng theo 4 Plan (A/B/C/D), khóa chỉnh sửa Plan sau khi duyệt và khóa toàn bộ form sau khi thanh toán hoa hồng.

> Quản lý danh sách Đại lý, tính hoa hồng cụ thể theo tháng, thanh toán, dashboard hiệu suất → nằm ở [Agency Management SPEC](../agency-management/SPEC.md).

---

## Actors & Preconditions

| Actor | Vai trò | Preconditions |
|---|---|---|
| **E02 — Company Admin** | Tạo referral form, xem lịch sử giới thiệu, xem ưu đãi nhận được | Đã login; công ty có hợp đồng active |
| **E03 — System Admin** | Quản lý chiến dịch referral, free campaign/sample; phê duyệt referral; cấu hình 4 Plan hoa hồng | Đã login; có quyền Marketing Admin |

> Phạm vi: **Cross-repo** (E02 + E03 + `es-kitchen-api`) — cần Contract Lock trước Phase 3.

> **E01 (User Mobile) không có flow Referral riêng.** Đã xác nhận với client: chỉ E02 gửi referral và E03 quản lý (Q&A MKT-01).

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
4. Xem **Detailed Introduction**:
   - Thông tin đầy đủ của referral
   - Sau khi duyệt: khóa chỉnh sửa thông tin Plan (Plan field read-only)
   - Sau khi thanh toán hoa hồng: khóa toàn bộ form (all fields read-only)

### C. Free Campaign / Sample Campaign — System Admin (E03) quản lý

1. System Admin vào **Free Campaign / Sample Management > New Registration**.
2. Điền thông tin chiến dịch dùng thử:
   - Thông tin khách hàng mới → **Cập nhật vào Master Pháp nhân** (bắt buộc, theo bản cập nhật 2026-07-03)
   - Thông tin giao hàng
   - Thời gian chiến dịch, số lượng mẫu
3. Hệ thống lưu chiến dịch **và tạo/cập nhật bản ghi Master Pháp nhân tương ứng**. Có thể tự động lấy thông tin từ **HubSpot**.
4. Admin có thể xem chi tiết và **Edit** thông tin chiến dịch.
5. Admin có thể **Delete** chiến dịch (bị chặn nếu đã có giao hàng thực tế — xem C2).
6. Admin xem **Campaign History (List View)** — danh sách tất cả đợt phát hàng mẫu/dùng thử.
7. Hệ thống tổng hợp **Success Rate** — tỷ lệ chuyển đổi từ Dùng thử sang Ký hợp đồng chính thức.

---

## Alternative Flows & Edge Cases

### A1. Company Admin xem referral nhưng chưa có lần giới thiệu nào
- Hiển thị empty state với hướng dẫn cách giới thiệu và thông tin ưu đãi.

### A2. Company Admin gửi referral cho công ty đã là khách hàng
- **Chặn cứng (hard block)** — hệ thống không cho phép gửi referral nếu công ty đó đã là khách hàng. Hiển thị thông báo lỗi rõ ràng. (Q&A MKT-02)

### B1. System Admin chỉnh sửa Plan sau khi đã duyệt
- Không cho phép — trường Plan bị khóa (read-only) sau khi duyệt.

### B2. System Admin chỉnh sửa bất kỳ thông tin nào sau khi đã thanh toán hoa hồng
- Không cho phép — toàn bộ form bị khóa (read-only) sau khi thanh toán.

### B3. Referral Process — 4 Plan hoa hồng
Quy tắc trả hoa hồng áp dụng theo Plan được chọn cho đại lý/người giới thiệu:

| Plan | Mô tả |
|---|---|
| A | **Thưởng 1 lần** (phí shot / one-time fee). Số tiền cụ thể chưa xác định. |
| B | **Thưởng đại lý** (phí shot / one-time fee). Số tiền cụ thể chưa xác định. |
| C | 10% duy trì 36 tháng |
| D | 7% vô thời hạn |

> (Q&A MKT-06) Plan A và B là phí shot (one-time). Số tiền cụ thể chưa được xác nhận — cần update khi có thông tin từ client.

### C1. Free Campaign — Đăng ký khách mới mà không tạo được Master Pháp nhân
- **Chặn tạo chiến dịch.** Từ bản 2026-07-03, chiến dịch dùng thử BẮT BUỘC gắn với Master Pháp nhân. Không còn flow "khách vãng lai" như bản cũ.
- Nếu khách hàng đã tồn tại trong Master → link vào bản ghi hiện có.
- Nếu chưa tồn tại → tạo mới bản ghi Master Pháp nhân đồng thời với chiến dịch.

**TODO (BA):** Cần confirm với client các trường tối thiểu để tạo Master Pháp nhân từ Free Campaign (mã số thuế / tên công ty / địa chỉ / người đại diện...).

### C2. Free Campaign — HubSpot không phản hồi khi tự động lấy dữ liệu
- Hệ thống tiếp tục hoạt động độc lập; hiển thị cảnh báo đồng bộ thất bại.
- **TODO (BA):** Sync HubSpot là 1 chiều hay 2 chiều? Trigger theo lịch (cron) hay theo event? Chưa có câu trả lời từ client (Q&A MKT-03 open).

### C3. Free Campaign — Delete chiến dịch đã có giao hàng thực tế
- Nếu **chưa có giao hàng**: cho phép xóa bình thường.
- Nếu **đã có giao hàng**: **chặn xóa**, hiển thị thông báo lỗi. (Q&A MKT-04)

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
- [ ] Có thể tạo mới chiến dịch dùng thử với thông tin giao hàng
- [ ] **Tạo chiến dịch mới đồng thời tạo/cập nhật bản ghi Master Pháp nhân tương ứng** (bắt buộc — theo bản cập nhật 2026-07-03)
- [ ] Chặn tạo chiến dịch nếu không đủ thông tin để lập Master Pháp nhân
- [ ] Có thể edit chiến dịch
- [ ] Xóa chiến dịch: cho phép nếu chưa có giao hàng; **chặn** nếu đã có giao hàng (hiển thị lỗi)
- [ ] Danh sách Campaign History hiển thị đầy đủ lịch sử các đợt
- [ ] Success Rate được tính và hiển thị (số chuyển đổi / tổng dùng thử)
- [ ] Tự động đồng bộ dữ liệu từ HubSpot (chi tiết trigger theo **TODO C2** — chưa xác nhận)

### AC-MARKETING-05: Referral Plan — Tính hoa hồng đúng theo Plan A/B/C/D
- [ ] Plan A: phí shot (thưởng 1 lần) — số tiền cụ thể TBD khi client xác nhận
- [ ] Plan B: phí shot (thưởng đại lý — 1 lần) — số tiền cụ thể TBD khi client xác nhận
- [ ] Plan C: tính 10% trong 36 tháng kể từ ngày ký hợp đồng
- [ ] Plan D: tính 7% vô thời hạn kể từ ngày ký hợp đồng
- [ ] Thay đổi plan hoa hồng áp dụng từ thời điểm thay đổi; không hồi tố kỳ đã qua (Q&A MKT-05)

> Việc chi trả cụ thể theo tháng, cập nhật trạng thái thanh toán, xuất CSV → xem [Agency Management SPEC](../agency-management/SPEC.md).

---

## Out of Scope

- **Quản lý danh sách Đại lý & Detail Tabs** — chuyển sang [Agency Management SPEC](../agency-management/SPEC.md).
- **Auto-generate danh sách thanh toán hoa hồng hàng tháng** — chuyển sang [Agency Management SPEC](../agency-management/SPEC.md).
- **Referral Performance Dashboard** — chuyển sang [Agency Management SPEC](../agency-management/SPEC.md).
- **Tự động chuyển khoản ngân hàng** — hoa hồng chỉ đánh dấu trạng thái thủ công, không tích hợp banking API trong Phase 2.
- **E01 (User Mobile) referral flow** — không có (đã xác nhận Q&A MKT-01).
- **Tích hợp hai chiều HubSpot ngoài sync chiến dịch dùng thử** — chờ xác nhận (TODO C2 còn mở).

---

## Dependencies

| Dependency | Lý do |
|---|---|
| `BF_[HỢP ĐỒNG] Quản lý Hợp đồng` | Referral chuyển sang `Đã ký` khi hợp đồng được tạo — cần trạng thái hợp đồng làm trigger |
| `BF_[ĐẠI LÝ] Quản lý Đại lý` | Plan hoa hồng của referral gắn với bản ghi đại lý; chi tiết thanh toán ở SPEC Agency |
| **Master Pháp nhân** (Company Master Data) | Referral form cần lookup công ty hiện có; Free Campaign bắt buộc tạo/cập nhật Master Pháp nhân |
| HubSpot Integration (`BF_[SYSTEM & OTHER]`) | Free Campaign tự động lấy dữ liệu từ HubSpot |

---

## Screens

| Screen Code | Screen | Actor | App | Screen Type | Mô tả ngắn |
|---|---|---|---|---|---|
| CW_MKTG_001 | Referral Campaign Page | E02 | E02 (es-kitchen-web-company) | Dashboard* | Trang tổng hợp Referral Campaign — entry point xem lịch sử và tạo giới thiệu mới |
| CW_MKTG_002 | Business Partner Introduction Form | E02 | E02 (es-kitchen-web-company) | Form | Form điền thông tin công ty được giới thiệu + người liên hệ + ghi chú nội bộ, submit tạo referral mới |
| CW_MKTG_003 | Referral History List (Company) | E02 | E02 (es-kitchen-web-company) | List | Danh sách referral đã gửi — tên công ty, ngày gửi, trạng thái, hiển thị bonus khi trạng thái = Đã ký |
| AW_MKTG_001 | Referral Campaign Management — List of Introductions | E03 | E03 (es-kitchen-web-admin) | List | Danh sách toàn bộ referral từ tất cả Company Admin — Plan áp dụng, trạng thái hợp đồng, ngày ký |
| AW_MKTG_002 | Referral Registration / Approval Form | E03 | E03 (es-kitchen-web-admin) | Form | Form đánh giá tín dụng và điều kiện hợp đồng, thực hiện phê duyệt hoặc từ chối referral |
| AW_MKTG_003 | Referral Detail (Detailed Introduction) | E03 | E03 (es-kitchen-web-admin) | Detail | Xem đầy đủ thông tin referral; Plan bị khóa sau duyệt; toàn bộ form bị khóa sau thanh toán |
| AW_MKTG_004 | Free Campaign / Sample Management — Campaign History List | E03 | E03 (es-kitchen-web-admin) | List | Danh sách tất cả đợt phát hàng mẫu/dùng thử, hiển thị Success Rate (tỷ lệ chuyển đổi) |
| AW_MKTG_005 | Free Campaign New Registration Form | E03 | E03 (es-kitchen-web-admin) | Form | Form tạo chiến dịch dùng thử mới — kèm bước tạo/cập nhật Master Pháp nhân (bắt buộc) |
| AW_MKTG_006 | Free Campaign Detail / Edit | E03 | E03 (es-kitchen-web-admin) | Detail | Xem và chỉnh sửa chiến dịch dùng thử; hỗ trợ đồng bộ tự động từ HubSpot |

---

## Bước tiếp theo

Chạy song song sau khi SPEC được review:

- "Hãy là Tech Lead Design, làm DESIGN.md từ SPEC này: `es-kitchen-docs/docs/features/marketing/SPEC.md`"
- "Hãy là QC, sinh test cases từ SPEC này: `es-kitchen-docs/docs/features/marketing/SPEC.md`"
  (hoặc slash command: `/test/generate_manual_testcases_rbt` cho FULL RBT / `/test/generate_testcases_from_requirements` cho QUICK)
- "Hãy là Designer, tạo UI-SPEC.md + Figma từ SPEC này: es-kitchen-docs/docs/features/marketing/SPEC.md"
  (hoặc slash command: /create-ui-design es-kitchen-docs/docs/features/marketing/SPEC.md)
