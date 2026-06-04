# SPEC: Tồn kho & Thiết bị (Inventory & Equipment)

> Backlog ID: ESKITCHEN-1243
> Domain: `ton-kho-thiet-bi` · 19 stories
> SPEC Transfer: False (chưa transfer) → file này là canonical source

---

## Mô tả nghiệp vụ

Hệ thống quản lý toàn bộ tài sản vật lý phục vụ vận hành ESKITCHEN, bao gồm:

1. **Thiết bị** — Tủ lạnh, tủ đông, máy bán hàng, lò vi sóng: đăng ký serial, tạo mã QR, quản lý phí cài đặt / phí tháng / tiền phạt, xử lý yêu cầu nâng cấp/đổi thiết bị.
2. **Vật tư** (Material Master) — Đũa, thìa, khay...: định nghĩa bộ tiêu chuẩn (bộ 50, bộ 100...) và số lượng phân bổ theo kích cỡ tủ.
3. **Tồn kho vật tư** — Quản lý nhập/xuất/tồn thực tế của món ăn chế biến sẵn, vật tư và hàng mẫu.
4. **Nhập hàng (Arrival)** — Theo dõi lịch dự kiến nhập hàng, xác nhận thủ công, đối chiếu với phản hồi nhà cung cấp.
5. **Tích hợp Thomas** — Đồng bộ hai chiều với hệ thống kho Thomas qua CSV (xuất lệnh, nhập kết quả thực tế).

---

## Actors & Preconditions

| Actor | Role | Phạm vi |
|---|---|---|
| **E03 — System Admin** | Toàn quyền CRUD thiết bị, vật tư, tồn kho; thực hiện import/export CSV Thomas | Primary actor — mọi story trong domain này |

> **Phạm vi: Single-actor (E03 only)** — không có E01/E02/E04/E06 trong domain này.
> Contract Lock trước Phase 3: **không bắt buộc** (single-actor).

**Preconditions chung:**
- E03 đã đăng nhập và có quyền truy cập module Inventory & Equipment.
- Master data nhà cung cấp và sản phẩm đã tồn tại trong hệ thống (dependency: domain [ĐẶT HÀNG NCC]).
- **TODO (BA):** Company Admin (E02) có quyền xem/thao tác bất kỳ màn hình nào trong module này không? Business Flow Index ghi "Target: System Admin, Company Admin" nhưng tất cả 19 stories đều EPIC = E03 (SystemAdmin). Cần xác nhận phạm vi E02.

---

## Happy Path

### Module A — Quản lý Thiết bị (Equipment Management)

#### A1. Xem danh sách thiết bị
1. E03 vào màn hình Equipment Management.
2. Hệ thống hiển thị danh sách thiết bị phân tab theo loại: Tủ lạnh / Tủ đông / Máy bán hàng / Lò vi sóng.
3. Mỗi dòng hiển thị: ID thiết bị, kích thước, vị trí lắp đặt, thời hạn thuê.
4. E03 có thể tìm kiếm/lọc danh sách.

#### A2. Đăng ký thiết bị mới
1. E03 nhấn "Đăng ký thiết bị mới".
2. E03 nhập: số sê-ri, loại thiết bị, kích thước.
3. Hệ thống tự động sinh ID thiết bị và xuất mã QR.
4. E03 thiết lập các loại phí liên quan (phí cài đặt, phí tháng, tiền phạt).
5. E03 xác nhận — thiết bị được lưu vào hệ thống.

#### A3. Xem chi tiết & chỉnh sửa thiết bị
1. E03 chọn thiết bị từ danh sách.
2. Hệ thống hiển thị chi tiết: sê-ri, kích thước, trạng thái hoạt động, lịch sử phí.
3. E03 chỉnh sửa thông số (sê-ri, kích thước, trạng thái hoạt động) và lưu.

**TODO (BA):** Tính năng "quản lý yêu cầu nâng cấp/đổi thiết bị" (từ mô tả Equipment Management) hoạt động thế nào? Yêu cầu đến từ E02 Company Admin hay E03 tự tạo? Flow phê duyệt có không?

---

### Module B — Quản lý Vật tư (Material Master)

#### B1. Xem danh sách vật tư
1. E03 vào màn hình Material Master Management.
2. Hệ thống hiển thị danh sách vật tư (đũa, thìa, khay...).
3. Hiển thị bộ tiêu chuẩn (bộ 50, bộ 100...) và số lượng phân bổ theo kích cỡ tủ.

#### B2. Thêm vật tư mới
1. E03 nhấn "Thêm vật tư mới".
2. E03 nhập: tên vật tư, thiết lập số lượng theo từng bộ tiêu chuẩn, cấu hình số lượng phân bổ theo kích cỡ tủ.
3. E03 lưu — vật tư xuất hiện trong danh sách.

#### B3. Xem chi tiết & chỉnh sửa / xóa vật tư
1. E03 chọn vật tư từ danh sách.
2. Hệ thống hiển thị thông tin chi tiết.
3. E03 chỉnh sửa hoặc xóa vật tư đã đăng ký.

---

### Module C — Quản lý Tồn kho Vật tư (Inventory Management — Materials)

#### C1. Xem danh sách tồn kho
1. E03 vào màn hình Inventory Management.
2. Hệ thống hiển thị danh sách tồn kho: món ăn chế biến sẵn, vật tư, hàng mẫu.
3. E03 tìm kiếm theo tên hoặc địa điểm bảo quản.

#### C2. Đăng ký tồn kho (nhập/xuất)
1. E03 nhập dữ liệu tăng/giảm tồn kho.
2. Hệ thống tự động tính toán tồn kho thực tế: tồn = nhập − xuất − phân bổ.
3. Kết quả tồn kho được cập nhật ngay.

#### C3. Xem chi tiết & chỉnh sửa / xóa tồn kho
1. E03 chọn mục tồn kho từ danh sách.
2. Hệ thống hiển thị chi tiết.
3. E03 chỉnh sửa hoặc xóa dữ liệu tồn kho hiện tại.

---

### Module D — Nhập hàng (Arrival Management)

#### D1. Xem danh sách hàng dự kiến nhập kho
1. Hệ thống tự động tổng hợp và hiển thị danh sách hàng dự kiến Arrival trong ngày và trong tháng.
2. E03 xem danh sách, tìm kiếm lọc theo Tháng/Năm, kho bảo quản, trạng thái.

#### D2. Xác nhận nhập hàng thủ công
1. E03 chọn lô hàng dự kiến.
2. E03 click nút xác nhận "Đã nhập hàng".
3. E03 nhập thông tin hạn sử dụng của lô hàng.
4. Hệ thống ghi nhận trạng thái nhập kho.

#### D3. Xem chi tiết lô hàng đã nhập
1. E03 chọn lô hàng đã xác nhận.
2. Hệ thống hiển thị chi tiết lô hàng, cho phép đối chiếu với phản hồi từ nhà cung cấp và dữ liệu đặt hàng gốc.

**TODO (BA):** Dữ liệu "hàng dự kiến nhập kho" được tạo ra từ đâu? Từ đơn đặt hàng nhà cung cấp (domain [ĐẶT HÀNG NCC]) hay từ import CSV Thomas? Cần xác nhận luồng upstream để xác định dependency chính xác.

---

### Module E — Tích hợp Thomas (Thomas Integration)

#### E1. Xuất CSV lệnh xuất hàng (Outgoing)
1. E03 chọn kỳ/lô cần xuất.
2. Hệ thống generate file CSV chứa lệnh xuất hàng / chỉ thị xuất.
3. E03 tải file CSV về để đồng bộ với hệ thống kho Thomas.

#### E2. Import CSV kết quả thực tế từ Thomas (Incoming — thực tế)
1. E03 có file CSV kết quả nhập/xuất hàng thực tế từ Thomas.
2. E03 upload file CSV lên hệ thống.
3. Hệ thống parse và cập nhật dữ liệu tồn kho thực tế theo kết quả Thomas.

#### E3. Xuất Product Master cho Thomas
1. E03 trigger xuất dữ liệu Product Master.
2. Hệ thống generate file CSV Product Master.
3. E03 tải về để đẩy lên hệ thống Thomas.

#### E4. Xuất CSV chỉ thị Nhập hàng cho Thomas (Incoming Delivery Instruction)
1. E03 chọn lô hàng cần nhập.
2. Hệ thống generate file CSV chứa chỉ thị nhập hàng gửi Thomas.
3. E03 tải về.

#### E5. Import CSV báo cáo nhập hàng thực tế từ Thomas
1. E03 có file CSV báo cáo nhập hàng thực tế trả về từ Thomas.
2. E03 upload file CSV.
3. Hệ thống parse và ghi nhận thành tích nhập hàng thực tế vào tồn kho.

**TODO (BA):** Định dạng CSV Thomas (cột, encoding, delimiter) đã được Thomas cung cấp spec chưa? Cần Thomas API/CSV spec trước khi Design phase.

---

## Alternative Flows & Edge Cases

| Case | Mô tả | Xử lý mong đợi |
|---|---|---|
| Đăng ký thiết bị trùng sê-ri | E03 nhập sê-ri đã tồn tại trong hệ thống | Hệ thống báo lỗi, không cho phép lưu trùng |
| Xóa vật tư đang được phân bổ vào tủ/hợp đồng | E03 xóa vật tư còn đang được tham chiếu | Cảnh báo dependency, block xóa hoặc yêu cầu xác nhận |
| Import CSV Thomas sai định dạng | File CSV không đúng cấu trúc Thomas | Hệ thống báo lỗi rõ ràng, không cập nhật dữ liệu một phần |
| Import CSV Thomas có dòng lỗi xen kẽ dòng hợp lệ | File có một số dòng sai | **TODO (BA):** Xử lý all-or-nothing hay skip dòng lỗi và tiếp tục? |
| Tồn kho tính ra âm | Xuất nhiều hơn tồn thực tế | **TODO (BA):** Hệ thống cảnh báo hay block? |
| Nhập hàng thủ công cho lô không có trong danh sách dự kiến | E03 muốn xác nhận lô hàng ngoài kế hoạch | **TODO (BA):** Có cho phép tạo mới ad-hoc hay chỉ confirm từ danh sách dự kiến? |
| Tìm kiếm lịch sử tồn kho không có kết quả | Không có dữ liệu theo điều kiện lọc | Hiển thị empty state rõ ràng |

---

## Acceptance Criteria

### Module A — Thiết bị

- [ ] **A-AC-01:** Danh sách thiết bị hiển thị đúng tab theo loại (Tủ lạnh / Tủ đông / Máy bán hàng / Lò vi sóng), mỗi dòng có: ID, kích thước, vị trí lắp, thời hạn thuê.
- [ ] **A-AC-02:** Đăng ký thiết bị mới thành công → hệ thống sinh ID tự động + mã QR có thể tải xuống.
- [ ] **A-AC-03:** Đăng ký thiết bị với sê-ri đã tồn tại → hiển thị lỗi, không lưu.
- [ ] **A-AC-04:** Chỉnh sửa thông số thiết bị (sê-ri, kích thước, trạng thái) → lưu thành công và hiển thị cập nhật ngay.

### Module B — Vật tư

- [ ] **B-AC-01:** Danh sách vật tư hiển thị đúng với bộ tiêu chuẩn và số lượng phân bổ theo kích cỡ tủ.
- [ ] **B-AC-02:** Thêm vật tư mới với đầy đủ thông tin → lưu thành công, xuất hiện trong danh sách.
- [ ] **B-AC-03:** Chỉnh sửa / xóa vật tư → phản ánh ngay trong danh sách.

### Module C — Tồn kho Vật tư

- [ ] **C-AC-01:** Tìm kiếm tồn kho theo tên và địa điểm bảo quản → kết quả đúng.
- [ ] **C-AC-02:** Nhập dữ liệu tăng/giảm tồn kho → hệ thống tự tính tồn thực tế = nhập − xuất − phân bổ đúng.
- [ ] **C-AC-03:** Tồn kho thực tế phản ánh ngay sau khi lưu thay đổi.

### Module D — Arrival

- [ ] **D-AC-01:** Danh sách hàng dự kiến hiển thị đúng cho ngày hiện tại và tháng hiện tại, tự động cập nhật.
- [ ] **D-AC-02:** Lọc lịch sử theo Tháng/Năm, kho bảo quản, trạng thái → kết quả đúng.
- [ ] **D-AC-03:** Xác nhận nhập hàng thủ công + nhập hạn sử dụng → trạng thái lô hàng cập nhật thành "Đã nhập".
- [ ] **D-AC-04:** Chi tiết lô hàng hiển thị đủ thông tin để đối chiếu với phản hồi nhà cung cấp và đơn đặt hàng gốc.

### Module E — Thomas Integration

- [ ] **E-AC-01:** Xuất CSV lệnh xuất hàng → file tải xuống đúng định dạng Thomas, đủ dữ liệu.
- [ ] **E-AC-02:** Import CSV kết quả từ Thomas → tồn kho cập nhật đúng theo nội dung file.
- [ ] **E-AC-03:** Import CSV sai định dạng → hiển thị lỗi rõ ràng, không cập nhật một phần dữ liệu.
- [ ] **E-AC-04:** Xuất Product Master CSV → file đúng cấu trúc Thomas.
- [ ] **E-AC-05:** Xuất CSV chỉ thị nhập hàng (Incoming Delivery Instruction) → file đúng cấu trúc Thomas.
- [ ] **E-AC-06:** Import CSV báo cáo nhập hàng thực tế từ Thomas → tồn kho nhập kho cập nhật đúng.

---

## Out of Scope

- Giao diện E02 Company Admin (xem lại TODO: cần xác nhận trước Design phase).
- Tích hợp Thomas theo thời gian thực (real-time API) — chỉ hỗ trợ CSV batch.
- Quản lý phí hợp đồng thiết bị (Contract billing) — thuộc domain [HỢP ĐỒNG].
- Quản lý driver phân bổ vật tư khi giao hàng — thuộc domain [GIAO HÀNG].
- Báo cáo / Dashboard tổng hợp tồn kho — chưa có trong 19 stories, cần xác nhận với client nếu cần.
- Yamato / Sagawa integration — không liên quan domain này.

---

## Dependencies

| Dependency | Loại | Ghi chú |
|---|---|---|
| Domain [ĐẶT HÀNG NCC] | Upstream data | Đơn đặt hàng NCC là nguồn tạo "hàng dự kiến nhập kho" trong Module D |
| Domain [HỢP ĐỒNG] | Reference | Thiết bị được gán cho Company theo hợp đồng — liên quan phí thiết bị |
| Thomas CSV spec | External | Cần spec định dạng CSV từ Thomas trước khi Design phase E |
| Product Master | Prerequisite | Module E3 (Product Master Output) yêu cầu Product data đã có trong hệ thống |

---

## Bước tiếp theo

SPEC hoàn thành. Chạy song song 2 bước:

- "Hãy là Tech Lead Design, làm DESIGN.md từ SPEC này: `/Users/longtd/Desktop/WORK/AI_AGENTS_ES_KITCHEN/es-kitchen-docs/docs/features/inventory-equipment/SPEC.md`"
- "Hãy là QC, sinh test cases từ SPEC này: `/Users/longtd/Desktop/WORK/AI_AGENTS_ES_KITCHEN/es-kitchen-docs/docs/features/inventory-equipment/SPEC.md`"
  (hoặc slash command `/test/generate_manual_testcases_rbt` cho FULL RBT / `/test/generate_testcases_from_requirements` cho QUICK)

**Ưu tiên giải quyết TODO (BA) trước Design phase:**
1. Phạm vi E02 trong module này (xác nhận với client/PM).
2. Upstream của "hàng dự kiến nhập kho" — từ đơn NCC hay Thomas CSV?
3. Xử lý import CSV lỗi một phần (all-or-nothing vs skip).
4. Thomas CSV spec (định dạng, encoding).
