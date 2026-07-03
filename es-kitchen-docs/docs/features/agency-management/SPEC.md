# SPEC: Đại lý (Agency & Partner Management)

> Domain: `dai-ly` · Backlog: ESKITCHEN-1247 · EPIC ID: 03 (System Admin)
> Business Flow: `BF_[ĐẠI LÝ] Quản lý Đại lý (Agency & Partner)`
> Target Actor: **E03 — System Admin**
> Phase: Phase 2
> Cross-repo: Single-actor (E03 + API) — Contract Lock **không bắt buộc** trước Phase 3
> Cập nhật: 2026-07-03 — theo `es-kitchen-requirements/markerting_daily_function_list.xlsx` (sheet `BF_ ĐẠI LÝ` + Agency Detail block trong sheet `BF_ MARKETING`)
> Domain nguồn: `.claude/context/business-flows/domains/dai-ly.md`
> **Split note:** Phần **Referral Campaign, Free Campaign, Referral Approval** đã tách sang [Marketing SPEC](../marketing/SPEC.md).

---

## Mô tả nghiệp vụ

Hệ thống cho phép System Admin quản lý toàn bộ vòng đời của đại lý/đối tác phân phối (Agency & Partner):

1. **CRUD đại lý** — danh sách, đăng ký mới, chỉnh sửa thông tin cơ bản, cấu hình Plan hoa hồng.
2. **Referral từ đại lý** — theo dõi cơ hội giới thiệu khách hàng của từng đại lý.
3. **Sales theo đại lý** — báo cáo doanh số/doanh thu bắt nguồn từ mỗi đại lý.
4. **Fee payment** — tự động tạo dự toán hoa hồng hàng tháng, cập nhật trạng thái thanh toán, xuất CSV.
5. **Performance dashboard** — biểu đồ xu hướng số pháp nhân được giới thiệu và doanh thu.
6. **Agency Detail (5 tabs)** — drill-down cho từng đại lý: Basic Info, Contract & Compensation, Performance Summary, Referral History, Payment History.

> Việc **phê duyệt referral từ Company Admin**, **4 Plan hoa hồng A/B/C/D** (rule chung), **Free Sample Campaign** thuộc SPEC Marketing — không lặp lại tại đây.

---

## Actors & Preconditions

| Actor | Repo liên quan | Quyền cần có |
|---|---|---|
| **E03 — System Admin** | `es-kitchen-web-admin` + `es-kitchen-api` | Đăng nhập thành công · Role System Admin |

**Preconditions:**
- System Admin đã xác thực (JWT hợp lệ).
- Dữ liệu doanh thu theo đại lý phải liên kết được với domain **[HỢP ĐỒNG]** (contract) và domain **[MENU & ORDER]** (order) — xem mục Dependencies.

**Dependencies với domain khác:**
- **[HỢP ĐỒNG] Quản lý Hợp đồng** — pháp nhân (công ty) được giới thiệu cần tồn tại trong hệ thống contract.
- **[MENU & ORDER] Quản lý Thực đơn & Đặt hàng** — dữ liệu doanh thu theo đại lý bắt nguồn từ đơn hàng thực tế.
- **[MARKETING]** — 4 Plan hoa hồng A/B/C/D được định nghĩa ở Marketing SPEC; Agency SPEC chỉ áp dụng khi tính fee.

---

## Happy Path

### Story 1 — Xem danh sách đại lý/đối tác (List of Agents and Partners)

1. System Admin truy cập màn hình **Danh sách Đại lý & Đối tác**.
2. Hệ thống hiển thị bảng danh sách: tên đại lý, điều kiện hợp đồng, tỷ lệ hoa hồng (%), trạng thái (Đang chạy / Đã hủy).
3. System Admin có thể tìm kiếm / lọc theo tên đại lý.
4. System Admin chọn một đại lý để xem chi tiết (điều hướng vào Agency Detail — Story 10).

### Story 2 — Đăng ký đại lý/đối tác mới (New Agent/Partner Registration)

1. System Admin nhấn **[Đăng ký mới]** trên màn hình danh sách.
2. Hệ thống hiển thị form nhập thông tin: tên đại lý, thông tin liên hệ, điều kiện hợp đồng, tỷ lệ hoa hồng.
3. System Admin điền đầy đủ thông tin và nhấn **[Lưu]**.
4. Hệ thống validate dữ liệu và tạo bản ghi đại lý mới với trạng thái mặc định `Đang chạy`.
5. Hệ thống điều hướng về danh sách, hiển thị đại lý vừa tạo.

### Story 3 — Xem danh sách cơ hội giới thiệu (List of referral opportunities)

1. System Admin truy cập mục **Quản lý Giới thiệu** của một đại lý.
2. Hệ thống hiển thị danh sách pháp nhân (công ty) đã được đại lý đó giới thiệu: tên công ty, trạng thái tiến độ (Đang đàm phán / Ký / Hủy).
3. System Admin chọn một mục để xem chi tiết.

### Story 4 — Xem/chỉnh sửa/xóa cơ hội giới thiệu (Referral details, editing, deletion)

1. Từ danh sách referral, System Admin chọn một cơ hội.
2. Hệ thống hiển thị chi tiết: thông tin pháp nhân được giới thiệu, trạng thái tiến độ, lịch sử cập nhật.
3. System Admin cập nhật trạng thái tiến độ hoặc chỉnh sửa nội dung và nhấn **[Lưu]**.
4. System Admin có thể xóa một cơ hội giới thiệu (bước confirm bắt buộc).

### Story 5 — Xem doanh số/doanh thu theo đại lý (Sales management by agency)

1. System Admin truy cập màn hình **Doanh số theo Đại lý**.
2. Hệ thống hiển thị bảng: từng đại lý, tổng doanh thu phát sinh từ kênh đại lý đó theo kỳ (tháng/quý).
3. System Admin có thể lọc theo kỳ thời gian.

### Story 6 — Xem danh sách thanh toán hoa hồng (List of fee payment options)

1. System Admin truy cập màn hình **Danh sách Thanh toán Hoa hồng**.
2. Hệ thống hiển thị danh sách các khoản hoa hồng cần/đã thanh toán cho từng đại lý theo tháng.
3. Filter theo trạng thái (Chưa thanh toán / Đã thanh toán) và theo đại lý.

### Story 7 — Tự động tạo danh sách dự toán hoa hồng tháng (Auto-generated monthly fee payment list)

1. Vào đầu tháng (hoặc System Admin kích hoạt thủ công), hệ thống tự động tính toán số tiền hoa hồng dự kiến cho từng đại lý dựa trên Plan hoa hồng × doanh thu tháng trước.
2. Hệ thống tạo bản ghi dự toán và hiển thị trong danh sách Fee.
3. System Admin review danh sách dự toán vừa được tạo.

**TODO (BA):** Trigger tự động (cron job đầu tháng) hay System Admin kích hoạt thủ công? Cần xác nhận với client.

### Story 8 — Cập nhật trạng thái thanh toán hoa hồng (Payment status update)

1. System Admin chọn một khoản hoa hồng trong danh sách.
2. Hệ thống hiển thị trạng thái hiện tại: **Chưa thanh toán** hoặc **Đã thanh toán**.
3. System Admin thay đổi trạng thái và nhấn **[Cập nhật]**.
4. Hệ thống lưu thay đổi và hiển thị trạng thái mới trong danh sách; ghi ngày chuyển tương ứng.

### Story 9 — Tải xuống CSV danh sách thanh toán hoa hồng (CSV Download)

1. Tại màn hình danh sách Fee, System Admin nhấn **[Tải CSV]**.
2. Hệ thống xuất file CSV chứa dữ liệu thanh toán hoa hồng (tên đại lý, tháng, số tiền, trạng thái).
3. Trình duyệt tự động tải file xuống máy.

### Story 10 — Xem chi tiết một đại lý (Agency Detail — 5 tabs)

Từ Story 1, System Admin chọn 1 đại lý và vào màn hình chi tiết gồm 5 tab:

**10a. Basic Information tab**
- ID Hệ thống, Tên Công ty, Trạng thái (Đang chạy / Đã hủy), thông tin người liên hệ.

**10b. Contract and Compensation Settings tab**
- Chọn Gói trả hoa hồng cho Đại lý: A / B / C / D (rule chi tiết ở Marketing SPEC).
- Thông tin tài khoản ngân hàng chuyển khoản.
- Khai báo thuế.
- Ghi chú nội bộ.

**10c. Performance Summary tab**
- Lũy kế số KH giới thiệu.
- Số KH đang active.
- Tổng số tiền hoa hồng đã trả.
- Số tiền chưa trả.

**10d. Referral History tab**
- Liệt kê chi tiết khách hàng mà Đại lý giới thiệu.
- Mỗi bản ghi: Tình trạng (Đang đàm phán / Ký / Hủy), Số tháng đã trôi qua, Tiền hoa hồng tháng này.

**10e. Payment History tab**
- Lịch sử thanh toán hoa hồng cho Đại lý.
- Mỗi bản ghi: Tháng thanh toán, Số tiền, Trạng thái (Đã chuyển / Chưa chuyển), Ngày chuyển.

### Story 11 — Xem Referral Performance Dashboard

1. System Admin truy cập màn hình **Dashboard Hiệu suất Giới thiệu**.
2. Hệ thống hiển thị:
   - Tổng số pháp nhân đã được giới thiệu thành công.
   - Tổng doanh thu phát sinh từ kênh giới thiệu.
   - Biểu đồ xu hướng theo thời gian (tháng/quý).
3. System Admin có thể lọc theo kỳ thời gian hoặc theo đại lý cụ thể.

---

## Alternative Flows & Edge Cases

### AF-01: Đăng ký đại lý — tên trùng lặp
- Hệ thống hiển thị thông báo lỗi validation: "Tên đại lý đã tồn tại."
- Form giữ nguyên dữ liệu đã nhập để chỉnh sửa.

### AF-02: Đăng ký đại lý — thiếu trường bắt buộc
- Hệ thống hiển thị lỗi inline tại trường còn thiếu.
- Không cho phép submit cho đến khi dữ liệu hợp lệ.

**TODO (BA):** Các trường bắt buộc cụ thể khi đăng ký đại lý mới (tên, email, số điện thoại, tỷ lệ hoa hồng…) — cần client confirm danh sách đầy đủ.

### AF-03: Xóa cơ hội giới thiệu — có ràng buộc dữ liệu
- Nếu cơ hội đã liên kết với pháp nhân đang có hợp đồng active, hệ thống ngăn xóa và hiển thị thông báo cảnh báo.

**TODO (BA):** Business rule xóa referral khi pháp nhân đã có hợp đồng — có cho phép xóa mềm (soft delete) không?

### AF-04: Tự động tạo dự toán hoa hồng — đại lý không có doanh thu tháng
- Hệ thống vẫn tạo bản ghi với số tiền = 0, trạng thái Chưa thanh toán.
- System Admin có thể xem và không cần hành động.

### AF-05: Tải CSV — không có dữ liệu trong kỳ được chọn
- Hệ thống xuất file CSV rỗng (chỉ có header row) hoặc hiển thị thông báo "Không có dữ liệu."

**TODO (BA):** Cần xác nhận format CSV (encoding UTF-8 / Shift-JIS cho client Nhật Bản) và các cột bắt buộc trong file export.

### AF-06: Dashboard — chưa có dữ liệu giới thiệu
- Hệ thống hiển thị empty state thay vì biểu đồ trống.

### AF-07: Cập nhật trạng thái thanh toán — thao tác đồng thời
- Nếu 2 admin cập nhật cùng 1 bản ghi, hệ thống áp dụng optimistic locking hoặc hiển thị thông báo conflict.

**TODO (BA):** Có yêu cầu audit log (ai thay đổi trạng thái, lúc mấy giờ) cho cập nhật trạng thái thanh toán hoa hồng không?

### AF-08: Đại lý bị đặt trạng thái "Đã hủy" nhưng còn referral active
- Hiển thị **warning** trước khi hủy.
- Ngừng tính hoa hồng mới từ thời điểm hủy (không hồi tố kỳ đã qua) — theo rule Marketing Q&A MKT-07.

### AF-09: Plan hoa hồng thay đổi giữa chừng
- Áp dụng Plan mới từ thời điểm thay đổi trở đi; các kỳ trước giữ nguyên Plan cũ. Không hồi tố (Q&A MKT-05).

### AF-10: Contract & Compensation Settings — form bị khóa
- Sau khi đã có kỳ thanh toán hoa hồng đầu tiên: **khóa** trường Plan (read-only) để tránh sai lệch báo cáo.
- Chỉnh sửa các trường khác (tài khoản ngân hàng, khai báo thuế, ghi chú) vẫn cho phép.

---

## Acceptance Criteria

### AC-01: Danh sách đại lý
- [ ] Hiển thị đúng: tên đại lý, điều kiện hợp đồng, tỷ lệ hoa hồng (%), trạng thái (Đang chạy / Đã hủy).
- [ ] Có chức năng tìm kiếm theo tên đại lý (partial match).
- [ ] Phân trang hoặc lazy load khi danh sách > N bản ghi.

**TODO (BA):** Ngưỡng phân trang (page size) và các trường filter/sort khác ngoài tên cần xác nhận.

### AC-02: Đăng ký đại lý mới
- [ ] Tất cả trường bắt buộc phải được validate trước khi lưu.
- [ ] Không cho phép tên đại lý trùng lặp trong hệ thống.
- [ ] Sau khi tạo thành công, bản ghi xuất hiện trong danh sách với trạng thái `Đang chạy`.

### AC-03: Quản lý Referral — danh sách
- [ ] Hiển thị danh sách pháp nhân được giới thiệu kèm trạng thái tiến độ.
- [ ] Có thể điều hướng vào màn hình chi tiết từng cơ hội.

### AC-04: Quản lý Referral — chi tiết/edit/delete
- [ ] Cập nhật trạng thái tiến độ thành công và phản ánh ngay lập tức.
- [ ] Xóa có bước confirm (dialog xác nhận).
- [ ] Xóa bị ngăn nếu pháp nhân đang có hợp đồng active (hiển thị lý do).

### AC-05: Doanh số theo đại lý
- [ ] Hiển thị đúng tổng doanh thu theo kỳ (tháng/quý) cho từng đại lý.
- [ ] Có bộ lọc theo kỳ thời gian.

### AC-06: Danh sách Fee
- [ ] Hiển thị danh sách thanh toán hoa hồng theo tháng và từng đại lý.
- [ ] Có thể filter theo trạng thái (Chưa thanh toán / Đã thanh toán).

### AC-07: Auto-generate dự toán hoa hồng tháng
- [ ] Dự toán được tạo đầy đủ cho tất cả đại lý active trong tháng.
- [ ] Số tiền tính đúng theo Plan hoa hồng (A/B/C/D) × doanh thu thực tế tháng đó.
- [ ] Đại lý không có doanh thu vẫn có bản ghi với số tiền = 0.

### AC-08: Cập nhật trạng thái thanh toán
- [ ] Trạng thái thay đổi giữa **Chưa thanh toán** ↔ **Đã thanh toán**.
- [ ] Thay đổi lưu thành công và hiển thị ngay trong danh sách; ghi ngày chuyển.

### AC-09: CSV Export
- [ ] File CSV tải về đúng dữ liệu tương ứng với filter đang chọn.
- [ ] CSV có header row rõ ràng (tên cột tiếng Nhật hoặc tiếng Anh — cần confirm).
- [ ] Encoding phù hợp với client Nhật Bản.

### AC-10: Agency Detail — 5 tabs
- [ ] **Basic Information tab** hiển thị đầy đủ: ID Hệ thống, Tên Công ty, Trạng thái, người liên hệ.
- [ ] **Contract and Compensation Settings tab** cho phép chọn Plan A/B/C/D + nhập tài khoản ngân hàng, khai báo thuế, ghi chú.
- [ ] **Performance Summary tab** hiển thị: lũy kế KH giới thiệu, KH active, tổng hoa hồng đã trả, chưa trả.
- [ ] **Referral History tab** hiển thị chi tiết từng KH đại lý giới thiệu — tình trạng, số tháng đã trôi qua, hoa hồng tháng này.
- [ ] **Payment History tab** hiển thị lịch sử thanh toán hoa hồng — tháng, số tiền, trạng thái, ngày chuyển.

### AC-11: Referral Performance Dashboard
- [ ] Hiển thị tổng số pháp nhân được giới thiệu thành công.
- [ ] Hiển thị tổng doanh thu từ kênh giới thiệu.
- [ ] Biểu đồ xu hướng (line chart hoặc bar chart) theo tháng/quý.
- [ ] Bộ lọc theo kỳ thời gian và theo đại lý cụ thể hoạt động đúng.

---

## Out of Scope

- **Phê duyệt Referral từ Company Admin (E02)** — thuộc [Marketing SPEC](../marketing/SPEC.md).
- **Free Sample Campaign / HubSpot sync** — thuộc [Marketing SPEC](../marketing/SPEC.md).
- **Rule chi tiết 4 Plan hoa hồng (A/B/C/D)** — định nghĩa ở [Marketing SPEC](../marketing/SPEC.md); Agency SPEC chỉ áp dụng khi tính fee.
- **E01 Mobile App** — Đại lý không có giao diện trên mobile app.
- **E02 Company Admin** — Company Admin không quản lý đại lý; đại lý là khái niệm nội bộ của System Admin.
- **E04 Supplier / E06 Driver** — Không liên quan.
- **Tích hợp thanh toán hoa hồng tự động** (elepay/chuyển khoản) — hệ thống chỉ quản lý trạng thái thanh toán, không thực hiện chuyển khoản tự động.
- **Portal đăng nhập cho đại lý** — Đại lý không có tài khoản truy cập hệ thống trong Phase 2.
- **Real-time update / WebSocket / Push notification** — Không yêu cầu cho module này.

---

## Screens

| Screen Code | Screen | Actor | App | Screen Type | Mô tả ngắn |
|---|---|---|---|---|---|
| AW_AGCY_001 | Danh sách Đại lý & Đối tác (List of Agents) | E03 | E03 (System Admin) | List | Danh sách đại lý — tên, điều kiện hợp đồng, tỷ lệ hoa hồng, trạng thái; tìm kiếm/lọc theo tên |
| AW_AGCY_002 | Đăng ký Đại lý Mới (Agency Registration) | E03 | E03 (System Admin) | Form | Form nhập thông tin đại lý (tên, liên hệ, điều kiện hợp đồng, tỷ lệ hoa hồng) |
| AW_AGCY_003 | Agency Detail — Basic Information tab | E03 | E03 (System Admin) | Detail | ID hệ thống, tên công ty, trạng thái (Đang chạy / Đã hủy), người liên hệ |
| AW_AGCY_004 | Agency Detail — Contract and Compensation Settings tab | E03 | E03 (System Admin) | Form | Chọn Plan hoa hồng (A/B/C/D), tài khoản ngân hàng, khai báo thuế, ghi chú |
| AW_AGCY_005 | Agency Detail — Performance Summary tab | E03 | E03 (System Admin) | Dashboard* | Lũy kế KH giới thiệu, KH active, tổng hoa hồng đã trả / chưa trả |
| AW_AGCY_006 | Agency Detail — Referral History tab | E03 | E03 (System Admin) | List | Chi tiết KH đại lý đã giới thiệu — tình trạng, số tháng đã trôi qua, hoa hồng tháng này |
| AW_AGCY_007 | Agency Detail — Payment History tab | E03 | E03 (System Admin) | List | Lịch sử thanh toán hoa hồng — tháng, số tiền, trạng thái (Đã chuyển / Chưa chuyển), ngày chuyển |
| AW_AGCY_008 | Danh sách Cơ hội Giới thiệu (Referral List) | E03 | E03 (System Admin) | List | Danh sách pháp nhân được đại lý giới thiệu kèm trạng thái tiến độ |
| AW_AGCY_009 | Chi tiết / Chỉnh sửa Cơ hội Giới thiệu | E03 | E03 (System Admin) | Detail | Xem, cập nhật trạng thái, xóa (có confirm) một cơ hội giới thiệu |
| AW_AGCY_010 | Doanh số theo Đại lý (Sales by Agency) | E03 | E03 (System Admin) | Report | Bảng tổng doanh thu từng đại lý theo kỳ (tháng/quý); bộ lọc theo kỳ |
| AW_AGCY_011 | Danh sách Thanh toán Hoa hồng (Fee List) | E03 | E03 (System Admin) | List | Danh sách khoản hoa hồng cần/đã thanh toán; filter theo trạng thái; nút Tải CSV |
| AW_AGCY_012 | Cập nhật Trạng thái Thanh toán Hoa hồng *inferred | E03 | E03 (System Admin) | Modal | Inline hoặc modal cập nhật trạng thái Chưa thanh toán ↔ Đã thanh toán |
| AW_AGCY_013 | Dashboard Hiệu suất Giới thiệu (Referral Performance) | E03 | E03 (System Admin) | Dashboard | Tổng số pháp nhân giới thiệu thành công, tổng doanh thu, biểu đồ xu hướng; filter theo kỳ/đại lý |

---

## Bước tiếp theo

Sau khi SPEC được BA/PM sign-off:

- "Hãy là Tech Lead Design, làm DESIGN.md từ SPEC này: `es-kitchen-docs/docs/features/agency-management/SPEC.md`" (cần DESIGN cho `es-kitchen-api` + `es-kitchen-web-admin`)
- "Hãy là QC, sinh test cases từ SPEC này: `es-kitchen-docs/docs/features/agency-management/SPEC.md`" (hoặc `/test/generate_manual_testcases_rbt`)
- "Hãy là Designer, tạo UI-SPEC.md + Figma từ SPEC này: es-kitchen-docs/docs/features/agency-management/SPEC.md"
  (hoặc slash command: /create-ui-design es-kitchen-docs/docs/features/agency-management/SPEC.md)
