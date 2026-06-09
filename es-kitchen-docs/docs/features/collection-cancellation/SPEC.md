# SPEC: Thu tiền & Hàng Hủy (Collection & Cancellation)

> Backlog ID: ESKITCHEN-1242
> Domain: `thu-tien-huy`
> Phase: 2

---

## Mô tả nghiệp vụ

Sau mỗi chuyến giao hàng, tài xế (E06) thực hiện 3 nghiệp vụ cuối ca:

1. **Thu tiền mặt**: Nhập số tiền thực tế thu được tại điểm giao, hệ thống tự động đối chiếu với số tiền dự kiến và cảnh báo khi có chênh lệch.
2. **Báo cáo hàng hủy**: Nhập số lượng món ăn quá hạn cần tiêu hủy tại điểm giao (bao gồm cả sản phẩm bảo quản nhiệt độ thường với ngày hết hạn cụ thể).
3. **Báo cáo phí đỗ xe**: Upload biên lai và nhập số tiền phí đỗ xe phát sinh.

Tài xế xem lại toàn bộ báo cáo cuối ca trước khi xác nhận gửi. Sau khi gửi, dữ liệu đồng bộ lên hai phía quản lý:

- **E03 System Admin**: Đối soát dữ liệu thu tiền mặt theo công ty vận chuyển ủy thác, quản lý toàn bộ vòng đời hàng hủy (nhập liệu → xuất báo cáo → ghi nhận thanh toán).
- **E02 Company Admin**: Xem báo cáo và lịch sử hàng hủy của công ty mình.

---

## Actors & Preconditions

| Actor | Repo | Điều kiện tiên quyết |
|---|---|---|
| **E06 — Driver** | `es-kitchen-webapp-driver` | Đã đăng nhập · Đã có chuyến giao hàng được giao (delivery assignment) trong ngày |
| **E03 — System Admin** | `es-kitchen-web-admin` | Đã đăng nhập với quyền System Admin |
| **E02 — Company Admin** | `es-kitchen-web-company` | Đã đăng nhập · Chỉ xem dữ liệu thuộc company của mình |

**Phạm vi repo:** Cross-repo (3 repos FE + 1 BE) — cần Contract Lock trước Phase 3.

**TODO (BA):** Driver App (E06) là React Web App (không phải native) — xác nhận luồng nhập liệu có dùng camera upload cho biên lai đỗ xe không, hay chỉ chọn file từ gallery?

---

## Happy Path

### HP-1: Tài xế báo cáo thu tiền (E06)

1. Tài xế hoàn thành giao hàng, vào màn hình "Collection Report".
2. Nhập số tiền mặt thực tế đã thu được từ điểm nhận hàng.
3. Hệ thống tự động so sánh với số tiền dự kiến của đơn hàng.
4. Nếu khớp — hệ thống cho phép tiếp tục. Nếu lệch — hiển thị cảnh báo chênh lệch (vẫn cho phép tiếp tục sau khi tài xế xác nhận).
5. Tài xế lưu và chuyển sang màn hình tiếp theo.

### HP-2: Tài xế báo cáo hàng hủy (E06)

1. Tài xế vào màn hình "Disposal Report".
2. Chọn tháng/năm của menu liên quan.
3. Nhập số lượng hàng cần hủy cho từng mặt hàng.
4. Với sản phẩm bảo quản nhiệt độ thường: nhập thêm ngày hết hạn và số lượng từng lô (Individual disposal report).
5. Tài xế lưu dữ liệu.

### HP-3: Tài xế báo cáo phí đỗ xe (E06)

1. Tài xế vào màn hình "Parking Report".
2. Upload ảnh biên lai đỗ xe.
3. Nhập số tiền phí đỗ xe.
4. Lưu báo cáo.

### HP-4: Tài xế xem lại & submit báo cáo cuối ca (E06)

1. Tài xế vào màn hình "Final report confirmation".
2. Xem toàn bộ nội dung: Thu tiền + Hàng hủy + Phí đỗ xe.
3. Nếu cần sửa — nhấn "Edit" để quay về màn hình tương ứng.
4. Xác nhận đúng — nhấn "Confirm and Submit".
5. Hệ thống ghi nhận báo cáo, trả về màn hình kết thúc ca.

### HP-5: System Admin quản lý thu tiền (E03)

1. Admin chọn "Collection Management".
2. Nhập điều kiện tìm kiếm: Tháng giao hàng + Công ty vận chuyển ủy thác.
3. Xem danh sách tổng số tiền thu được theo từng công ty/nhà vận chuyển.
4. Chọn một công ty để xem chi tiết thu tiền theo từng tài xế cụ thể.

### HP-6: System Admin quản lý hàng hủy & thu tiền hàng hủy (E03)

1. Admin chọn "Waste disposal and collection management".
2. Tìm kiếm theo Năm/Tháng và Khách hàng (pháp nhân).
3. Xem danh sách: số lượng hàng hủy, số tiền, tổng tiền thanh toán theo từng khách hàng.
4. Chọn khách hàng để xem danh sách hóa đơn thanh toán hàng hủy.
5. Quản lý trạng thái thu tiền hàng hủy: **Chưa xuất → Đã xuất → Đã thanh toán**.
6. Nếu cần — xóa báo cáo hàng hủy.

### HP-7: System Admin nhập liệu hàng hủy (E03)

1. Admin chọn "Discard Input".
2. Tìm kiếm theo Năm/Tháng, Tên khách hàng, Tên công ty vận chuyển.
3. Xem danh sách dữ liệu nhập hàng hủy phân chia theo từng gói hợp đồng.
4. Với đơn chưa có dữ liệu — hiển thị trạng thái "Chưa nhập hàng hủy".
5. Admin nhập hoặc chỉnh sửa số liệu hàng hủy.
6. Đăng ký mặt hàng hủy mới nếu cần (New product registration).

### HP-8: Company Admin xem báo cáo & lịch sử hàng hủy (E02)

1. Admin chọn "Disposal Report/History".
2. Xem báo cáo số lượng hàng hóa (bảo quản nhiệt độ thường) bị hết hạn/cần vứt bỏ.
3. Chọn "Disposal History" để xem danh sách lịch sử hàng hủy theo tháng.

---

## Alternative Flows & Edge Cases

### AF-1: Chênh lệch số tiền thu

- Tài xế nhập số tiền thực tế khác với số tiền dự kiến.
- Hệ thống hiển thị cảnh báo rõ ràng kèm số tiền chênh lệch (dương/âm).
- Tài xế vẫn có thể xác nhận và tiếp tục — không bị block.
- **TODO (BA):** Chênh lệch có cần tài xế nhập lý do không? Có cần gửi alert tới Outsource Admin hoặc System Admin real-time không?

### AF-2: Không có hàng hủy trong ca

- Tài xế không nhập dữ liệu hàng hủy (bỏ qua màn hình hoặc nhập số lượng = 0).
- Hệ thống vẫn cho phép submit báo cáo cuối ca.
- **TODO (BA):** Disposal Report có phải là bắt buộc điền hay optional per ca giao hàng?

### AF-3: Không có phí đỗ xe

- Tài xế bỏ qua màn hình Parking Report.
- Hệ thống ghi nhận phí đỗ xe = 0, không yêu cầu biên lai.

### AF-4: Tài xế sửa báo cáo sau khi xem lại

- Tại màn hình Final Confirmation, tài xế nhấn "Edit".
- Hệ thống cho phép quay về màn hình tương ứng (Collection / Disposal / Parking) để sửa.
- Sau khi sửa, tài xế quay lại màn hình xác nhận và submit lại.

### AF-5: Xóa báo cáo hàng hủy (E03)

- System Admin xóa một báo cáo hàng hủy.
- Hệ thống yêu cầu xác nhận trước khi xóa.
- Dữ liệu liên quan (số tiền, trạng thái thanh toán) bị xóa theo.
- **TODO (BA):** Có cho phép xóa báo cáo đã ở trạng thái "Đã thanh toán" không? Có cần audit log không?

### AF-6: Trạng thái "Chưa nhập hàng hủy" (E03)

- Với đơn hàng đã giao nhưng chưa có dữ liệu hàng hủy từ tài xế — hệ thống hiển thị trạng thái "Chưa nhập hàng hủy".
- System Admin có thể chủ động nhập thay thế.

### AF-7: Sản phẩm nhiệt độ thường — nhập từng lô

- Khi báo cáo hàng hủy loại "nhiệt độ thường", tài xế phải nhập hạn sử dụng + số lượng cho từng lô riêng biệt.
- **TODO (BA):** Một ca giao có thể có nhiều lô cùng mặt hàng nhưng hết hạn khác ngày không? Giao diện có hỗ trợ thêm nhiều dòng không?

---

## Acceptance Criteria

### AC-1: Tài xế nhập thu tiền (HP-1)

- [ ] Form nhập số tiền mặt thực tế hiển thị đúng đơn vị tiền tệ (Yên).
- [ ] Hệ thống tự động tính và hiển thị chênh lệch so với số tiền dự kiến.
- [ ] Khi chênh lệch != 0, hiển thị cảnh báo rõ ràng (không block submit).
- [ ] Dữ liệu thu tiền được lưu đúng theo delivery assignment tương ứng.

### AC-2: Tài xế nhập hàng hủy (HP-2)

- [ ] Tài xế có thể chọn tháng/năm menu.
- [ ] Có thể nhập số lượng hủy theo từng mặt hàng.
- [ ] Với sản phẩm nhiệt độ thường: form cho phép nhập hạn sử dụng + số lượng riêng biệt.
- [ ] Dữ liệu được lưu liên kết với delivery assignment và khách hàng pháp nhân tương ứng.

### AC-3: Tài xế nhập phí đỗ xe (HP-3)

- [ ] Tài xế có thể upload ảnh biên lai (định dạng: JPG/PNG, tối đa TODO MB).
- [ ] Nhập số tiền phí đỗ xe.
- [ ] Cả hai trường (ảnh + số tiền) không bắt buộc — có thể bỏ qua.

### AC-4: Tài xế xem lại & submit (HP-4)

- [ ] Màn hình Final Confirmation hiển thị đầy đủ: thu tiền, hàng hủy, phí đỗ xe.
- [ ] Nút "Edit" hoạt động đúng — quay về màn hình tương ứng.
- [ ] Sau khi nhấn "Confirm and Submit", dữ liệu được gửi lên server và không thể sửa lại từ phía tài xế.
- [ ] **TODO (BA):** Sau khi submit, có cho phép tài xế xem lại lịch sử báo cáo đã gửi không?

### AC-5: System Admin — Collection Management (HP-5)

- [ ] Tìm kiếm được theo Tháng giao hàng + Công ty vận chuyển ủy thác.
- [ ] Danh sách hiển thị tổng tiền thu theo từng công ty.
- [ ] Drill-down được vào chi tiết theo từng tài xế.

### AC-6: System Admin — Waste Disposal & Collection (HP-6)

- [ ] Tìm kiếm được theo Năm/Tháng và Khách hàng pháp nhân.
- [ ] Danh sách hiển thị: số lượng hàng hủy, số tiền, tổng tiền thanh toán.
- [ ] Trạng thái thanh toán hàng hủy được chuyển đúng theo luồng: Chưa xuất → Đã xuất → Đã thanh toán.
- [ ] Tính năng xóa báo cáo yêu cầu xác nhận trước khi thực thi.

### AC-7: System Admin — Discard Input (HP-7)

- [ ] Tìm kiếm được theo Năm/Tháng, Tên khách hàng, Tên công ty vận chuyển.
- [ ] Danh sách phân chia đúng theo gói hợp đồng.
- [ ] Đơn chưa có dữ liệu hiển thị trạng thái "Chưa nhập hàng hủy".
- [ ] Admin có thể nhập/chỉnh sửa số liệu và đăng ký mặt hàng hủy mới.

### AC-8: Company Admin — Disposal Report & History (HP-8)

- [ ] Báo cáo chỉ hiển thị dữ liệu của company đang đăng nhập (không xem chéo công ty).
- [ ] Báo cáo hiển thị số lượng hàng hóa nhiệt độ thường bị hết hạn/hủy.
- [ ] Lịch sử hủy hiển thị được theo tháng.

---

## Out of Scope

- Tích hợp thanh toán điện tử cho khoản thu tiền mặt (thuộc domain `[THANH TOÁN]`).
- Hoàn tiền hàng hủy cho người dùng cuối (E01) — nếu có, thuộc domain `[THANH TOÁN]`.
- Quản lý lộ trình tài xế (thuộc domain `[GIAO HÀNG] App Tài xế`).
- Push notification / real-time alert khi tài xế submit báo cáo — **TODO (BA):** xác nhận có cần push notification tới System Admin hoặc Outsource Admin không?
- Export CSV dữ liệu thu tiền / hàng hủy — **TODO (BA):** có yêu cầu export không?

---

## Screens

| Screen | Actor | App | Mô tả ngắn |
|---|---|---|---|
| Collection Report | E06 | E06 (es-kitchen-webapp-driver) | Nhập số tiền mặt thực tế thu được tại điểm giao; hiển thị chênh lệch với số tiền dự kiến |
| Disposal Report | E06 | E06 (es-kitchen-webapp-driver) | Nhập số lượng hàng hủy theo từng mặt hàng; hỗ trợ nhập hạn sử dụng + số lượng từng lô cho sản phẩm nhiệt độ thường |
| Parking Report | E06 | E06 (es-kitchen-webapp-driver) | Upload ảnh biên lai đỗ xe và nhập số tiền phí đỗ xe |
| Final Report Confirmation | E06 | E06 (es-kitchen-webapp-driver) | Xem toàn bộ báo cáo cuối ca (thu tiền + hàng hủy + phí đỗ xe); xác nhận gửi hoặc quay về sửa |
| Collection Management List | E03 | E03 (es-kitchen-web-admin) | Tìm kiếm và xem tổng tiền thu theo từng công ty vận chuyển ủy thác theo tháng giao hàng |
| Collection Management Detail | E03 | E03 (es-kitchen-web-admin) | Xem chi tiết thu tiền theo từng tài xế thuộc một công ty vận chuyển |
| Waste Disposal & Collection List | E03 | E03 (es-kitchen-web-admin) | Tìm kiếm và xem danh sách hàng hủy + trạng thái thanh toán theo khách hàng pháp nhân; chuyển trạng thái Chưa xuất → Đã xuất → Đã thanh toán |
| Waste Disposal Invoice Detail | E03 | E03 (es-kitchen-web-admin) | Xem danh sách hóa đơn thanh toán hàng hủy của một khách hàng; xóa báo cáo hàng hủy |
| Discard Input List | E03 | E03 (es-kitchen-web-admin) | Tìm kiếm và xem danh sách dữ liệu nhập hàng hủy phân chia theo gói hợp đồng; hiển thị trạng thái "Chưa nhập hàng hủy" |
| Discard Input Form | E03 | E03 (es-kitchen-web-admin) | Nhập hoặc chỉnh sửa số liệu hàng hủy; đăng ký mặt hàng hủy mới |
| Disposal Report (Company) | E02 | E02 (es-kitchen-web-company) | Xem báo cáo số lượng hàng hóa nhiệt độ thường bị hết hạn/cần hủy của công ty mình |
| Disposal History | E02 | E02 (es-kitchen-web-company) | Xem lịch sử hàng hủy theo tháng của công ty mình |

---

## Dependencies

| Dependency | Mô tả | Domain/Feature liên quan |
|---|---|---|
| Delivery Assignment | Tài xế phải có chuyến giao hàng được giao để báo cáo. | `[GIAO HÀNG] App Tài xế` |
| Contract / Plan | Dữ liệu hàng hủy phân chia theo gói hợp đồng (Discard Input). | `[HỢP ĐỒNG] Quản lý Hợp đồng` |
| Menu | Báo cáo hàng hủy tham chiếu menu theo tháng/năm. | `[MENU & ORDER]` |
| Outsource Admin (E05) | Công ty vận chuyển ủy thác — dùng trong điều kiện tìm kiếm Collection Management. | `[GIAO HÀNG] Web Đối tác Vận chuyển` |

---

## Bước tiếp theo

Chạy song song:

- "Hãy là Tech Lead Design, làm DESIGN.md từ SPEC này: `/Users/longtd/Desktop/WORK/AI_AGENTS_ES_KITCHEN/es-kitchen-docs/docs/features/collection-cancellation/SPEC.md`"
- "Hãy là QC, sinh test cases từ SPEC này: `/Users/longtd/Desktop/WORK/AI_AGENTS_ES_KITCHEN/es-kitchen-docs/docs/features/collection-cancellation/SPEC.md`"
  (slash command: `/test/generate_manual_testcases_rbt` cho FULL RBT / `/test/generate_testcases_from_requirements` cho QUICK)
→ "Hãy là Designer, tạo UI-SPEC.md + Figma từ SPEC này: es-kitchen-docs/docs/features/collection-cancellation/SPEC.md"
  (hoặc slash command: /create-ui-design es-kitchen-docs/docs/features/collection-cancellation/SPEC.md)
