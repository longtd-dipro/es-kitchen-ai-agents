# SPEC: Giao hàng — App Tài xế (Delivery Driver)

> Domain: `giao-hang-tai-xe` · Backlog: ESKITCHEN-1238 · Phase: 2 · Epic ID: E06

---

## Mô tả nghiệp vụ

App Tài xế (Driver App) là ứng dụng web dành cho nhân viên giao hàng (E06). Tài xế sử dụng app để xem danh sách đơn giao trong ngày, cập nhật trạng thái từng điểm giao, kiểm đếm hàng hóa và vật tư, chụp ảnh báo cáo trước/sau khi trưng bày sản phẩm, thu thập chữ ký xác nhận giao hàng hoàn tất, và báo cáo sự cố/trễ hàng theo thời gian thực.

Toàn bộ domain này thuộc **Phase 2** (không có story Phase 1).

---

## Actors & Preconditions

| Actor | Vai trò | Precondition |
|---|---|---|
| **E06 — Driver** | Tài xế giao hàng | Đã đăng nhập Driver App; được phân công đơn giao trong ngày |
| **E03 — System Admin** | Tiếp nhận cảnh báo sự cố từ Driver | Đang online trên hệ thống ES Station |
| **E05 — Outsource Admin** | Quản lý tài xế, xem báo cáo | Xem SPEC riêng: `delivery-outsource-partner` |

**Phạm vi SPEC này:** Chỉ bao gồm E06 (Driver App). Luồng E05 và E03 phía backend xử lý cảnh báo là dependency, không mô tả chi tiết ở đây.

**Cross-repo:** Yes — ảnh hưởng `es-kitchen-api` (BE) + `es-kitchen-webapp-driver` (E06 FE).
**Contract Lock trước Phase 3:** Bắt buộc — REST API endpoints + WebSocket events (real-time notification).

---

## Happy Path

### HP-01: Đăng nhập

1. Tài xế mở Driver App, nhập ID và mật khẩu.
2. Hệ thống xác thực thành công, chuyển tài xế đến màn hình Home.
3. Home hiển thị danh sách thông báo mới nhất và các phím tắt: Danh sách giao hàng, Báo cáo sự cố, Hỗ trợ.

### HP-02: Xem danh sách giao hàng trong ngày

1. Tài xế vào "Delivery List".
2. Hệ thống mặc định hiển thị danh sách các điểm giao trong ngày hôm nay (theo tài xế đang đăng nhập).
3. Tài xế có thể lọc theo tháng/năm hoặc ngày cụ thể.
4. Mỗi dòng trong danh sách hiển thị: tên công ty nhận, địa chỉ, trạng thái hiện tại.

### HP-03: Cập nhật trạng thái giao hàng

1. Tài xế chọn một điểm giao từ danh sách → vào màn hình Delivery Details.
2. Tài xế nhấn "Bắt đầu giao" → hệ thống ghi nhận thời gian bắt đầu + vị trí GPS.
3. Tài xế đến nơi, nhấn "Đã đến" → hệ thống ghi nhận thời gian + GPS.
4. Sau khi hoàn tất toàn bộ quy trình (kiểm đếm + chụp ảnh + ký), tài xế nhấn "Hoàn tất" → hệ thống cập nhật trạng thái.

### HP-04: Xem thông tin chi tiết điểm giao

1. Tài xế xem ghi chú lưu ý đặc thù của doanh nghiệp tại điểm giao.
2. Tài xế xem thông tin vận đơn: số vận đơn, tên công ty vận chuyển, tên kiện hàng, ngày dự kiến.
3. Tài xế xem danh sách đồ ăn (tên sản phẩm, số lượng) và danh sách vật tư dụng cụ (khay, thìa...).

### HP-05: Kiểm đếm hàng hóa

1. Tài xế mở màn hình "Delivery Inspection".
2. Tài xế tick lần lượt từng món trong danh sách sản phẩm (product inspection).
3. Hệ thống cảnh báo nếu số lượng thực tế thừa hoặc thiếu so với đơn.
4. Tài xế tick lần lượt từng mục vật tư dụng cụ (material inspection).
5. Nếu phát hiện thiếu dụng cụ, tài xế báo cáo qua màn hình material inspection.

### HP-06: Báo cáo hoàn thành giao hàng

**Bước 1 — Hướng dẫn trưng bày (Pre-display):**
1. Trước màn hình upload ảnh, hệ thống hiển thị popup slide hướng dẫn cách trưng bày sản phẩm (ví dụ ảnh trước/sau). Tài xế có thể xem ngay mà không cần thoát màn hình.

**Bước 2 — Upload ảnh TRƯỚC trưng bày:**
1. Tài xế chụp và upload ảnh trạng thái ban đầu: bên trong tủ lạnh tại điểm giao, sản phẩm bảo quản thường, hộp đựng vật tư.
2. Cho phép upload nhiều ảnh.
3. Tài xế có thể xóa ảnh đã đính kèm nếu cần.

**Bước 3 — Trưng bày và upload ảnh SAU trưng bày:**
1. Sau khi trưng bày xong, tài xế upload ảnh kết quả: toàn bộ tủ lạnh, máy bán hàng tự động, đồ thường, vật tư, đĩa/khay.
2. Cho phép upload nhiều ảnh.

**Bước 4 — Ký xác nhận:**
1. Hệ thống hiển thị nội dung báo cáo hoàn thành giao hàng.
2. Đại diện công ty nhận hàng ký xác nhận trên màn hình.
3. Tài xế ký xác nhận.

**Bước 5 — Ghi chú:**
1. Tài xế nhập ghi chú tự do: sự cố, vấn đề cần chú ý (không bắt buộc).
2. Tài xế nhấn hoàn tất → trạng thái đơn chuyển thành "Hoàn tất".

### HP-07: Báo cáo sự cố / Trễ hàng

1. Nút "Báo cáo trễ" luôn hiển thị trên màn hình delivery list và delivery details.
2. Tài xế nhấn nút → chọn lý do chậm trễ từ danh sách.
3. Nếu hàng hóa hỏng hoặc thiếu số lượng → tài xế nhấn "Báo cáo sự cố ngay" → nhập mô tả sự cố.
4. Hệ thống gửi thông báo real-time đến ES Station (E03 System Admin).
5. Cảnh báo hiển thị trực tiếp trên hệ thống ES Station để xử lý.

### HP-08: Hỗ trợ / Inquiry (HubSpot)

1. Tài xế vào màn hình Inquiry Response.
2. HubSpot Widget chatbot được nhúng, cho phép tài xế hỏi/nhận hỗ trợ.
3. Hệ thống xử lý FAQ tự động, phản hồi real-time.

### HP-09: Đăng xuất

1. Tài xế nhấn "Log out".
2. Session kết thúc, tài xế quay về màn hình đăng nhập.

---

## Alternative Flows & Edge Cases

### AF-01: Quên mật khẩu

- Tài xế nhấn "Forgot password?" tại màn hình đăng nhập.
- Hệ thống cấp lại mật khẩu (phương thức cụ thể tùy thiết kế).
- **TODO (BA):** Mật khẩu được reset qua email hay SMS OTP? Ai có quyền cấp lại — tự phục vụ hay phải qua admin?

### AF-02: Tài xế đặt cờ Chưa giao / Giao lại

- Trong màn hình Delivery Status Management, tài xế có thể thiết lập cờ "Chưa giao" hoặc "Giao lại" cho một điểm giao.
- **TODO (BA):** Khi đặt cờ "Giao lại", đơn có tự động tạo lịch giao mới hay admin xử lý thủ công? Trạng thái đơn thay đổi như thế nào trên ES Station?

### AF-03: Số lượng hàng thừa/thiếu khi kiểm đếm

- Hệ thống hiển thị cảnh báo ngay trong màn hình kiểm đếm.
- Tài xế ghi nhận sự lệch, có thể kết hợp báo cáo qua HP-07.
- **TODO (BA):** Khi thừa/thiếu được ghi nhận, hệ thống có tự động notify E03 hay chỉ lưu log?

### AF-04: Không có đại diện công ty để ký

- Tài xế không thể thu thập chữ ký của đại diện công ty (không có người).
- **TODO (BA):** Trường hợp này xử lý như thế nào — bỏ qua chữ ký đại diện và chỉ tài xế ký? Hay cần lý do bắt buộc?

### AF-05: Mất kết nối mạng trong khi giao

- **TODO (BA):** Driver App có yêu cầu offline mode không? GPS log và ảnh có được cache locally khi mất mạng rồi sync lại sau không?

### AF-06: Manual Display

- Tài xế vào màn hình Manual Display để đọc tài liệu hướng dẫn theo danh mục: "Quy trình làm việc", "Chuẩn bị", "Lấy đồ", "Cách chụp ảnh"...
- Hướng dẫn trưng bày sản phẩm chi tiết cũng có thể xem ở đây (ngoài popup trong HP-06).

---

## Acceptance Criteria

### AC-01: Đăng nhập & Xác thực
- [ ] Tài xế đăng nhập thành công bằng ID + mật khẩu đúng → vào Home.
- [ ] Đăng nhập sai thông tin → hiển thị thông báo lỗi, không vào được app.
- [ ] Chức năng quên mật khẩu cho phép tài xế khôi phục quyền truy cập.
- [ ] Đăng xuất thành công → phiên bị hủy, quay về màn hình login.

### AC-02: Home & Navigation
- [ ] Home hiển thị danh sách thông báo mới nhất.
- [ ] Phím tắt trên Home dẫn đúng đến: Danh sách giao hàng, Báo cáo sự cố, Hỗ trợ.

### AC-03: Danh sách giao hàng
- [ ] Mặc định hiển thị danh sách giao hàng trong ngày hôm nay của tài xế đang đăng nhập.
- [ ] Lọc được theo tháng/năm và ngày cụ thể.
- [ ] Không hiển thị đơn giao của tài xế khác.

### AC-04: Cập nhật trạng thái
- [ ] Ba trạng thái hoạt động đúng thứ tự: "Bắt đầu giao" → "Đã đến" → "Hoàn tất".
- [ ] Mỗi trạng thái được ghi nhận kèm timestamp và tọa độ GPS.
- [ ] Tài xế có thể thiết lập cờ "Chưa giao" hoặc "Giao lại".

### AC-05: Thông tin chi tiết điểm giao
- [ ] Ghi chú đặc thù của doanh nghiệp hiển thị đúng theo từng điểm giao (nội dung khác nhau tùy công ty).
- [ ] Thông tin vận đơn hiển thị: số vận đơn, tên công ty vận chuyển, tên kiện hàng, ngày dự kiến.
- [ ] Danh sách đồ ăn (tên + số lượng) và vật tư dụng cụ hiển thị đầy đủ.

### AC-06: Kiểm đếm
- [ ] Tài xế tick lần lượt từng món trong product list.
- [ ] Hệ thống cảnh báo khi số lượng thực tế thừa hoặc thiếu.
- [ ] Tài xế tick lần lượt từng mục trong material list.
- [ ] Tài xế báo cáo được khi thiếu dụng cụ.

### AC-07: Báo cáo hoàn thành
- [ ] Popup hướng dẫn trưng bày dạng slide hiển thị đúng trước bước upload ảnh (không cần thoát màn hình).
- [ ] Upload được nhiều ảnh ở cả hai giai đoạn: trước và sau trưng bày.
- [ ] Tài xế xóa được ảnh đã đính kèm trước khi submit.
- [ ] Màn hình ký hiển thị nội dung báo cáo hoàn thành; thu được chữ ký đại diện công ty và chữ ký tài xế.
- [ ] Ghi chú tự do không bắt buộc.
- [ ] Sau khi submit báo cáo hoàn thành, trạng thái đơn cập nhật thành "Hoàn tất".

### AC-08: Báo cáo sự cố / Trễ hàng
- [ ] Nút "Báo cáo trễ" luôn hiển thị (không bị ẩn bởi bất kỳ trạng thái nào).
- [ ] Chọn được lý do chậm trễ từ danh sách.
- [ ] Báo cáo sự cố (hàng hỏng, thiếu số lượng) gửi được kèm mô tả.
- [ ] Thông báo real-time đến ES Station (E03) ngay sau khi tài xế submit báo cáo.
- [ ] Cảnh báo hiển thị trên ES Station để admin xử lý.

### AC-09: HubSpot Chatbot
- [ ] HubSpot Widget chatbot tải được trong Driver App.
- [ ] FAQ được xử lý tự động, phản hồi real-time.

### AC-10: Manual Display
- [ ] Tài liệu hướng dẫn hiển thị đúng theo danh mục.
- [ ] Hướng dẫn chi tiết cách trưng bày sản phẩm xem được.

---

## Screens

| Screen Code | Screen | Actor | App | Screen Type | Mô tả ngắn |
|---|---|---|---|---|---|
| DA_DRVR_001 | Login Screen | E06 — Driver | E06 (es-kitchen-webapp-driver) | Form | Đăng nhập bằng ID + mật khẩu; hỗ trợ quên mật khẩu |
| DA_DRVR_002 | Home Screen | E06 — Driver | E06 (es-kitchen-webapp-driver) | Dashboard | Hiển thị thông báo mới nhất; phím tắt đến Delivery List, Báo cáo sự cố, Hỗ trợ |
| DA_DRVR_003 | Delivery List Screen | E06 — Driver | E06 (es-kitchen-webapp-driver) | List | Danh sách điểm giao trong ngày của tài xế; lọc theo ngày/tháng/năm |
| DA_DRVR_004 | Delivery Details Screen | E06 — Driver | E06 (es-kitchen-webapp-driver) | Detail | Chi tiết điểm giao: ghi chú doanh nghiệp, vận đơn, danh sách đồ ăn + vật tư; cập nhật trạng thái (Bắt đầu → Đã đến → Hoàn tất) |
| DA_DRVR_005 | Delivery Status Management Screen * inferred | E06 — Driver | E06 (es-kitchen-webapp-driver) | Form | Thiết lập cờ "Chưa giao" hoặc "Giao lại" cho điểm giao |
| DA_DRVR_006 | Delivery Inspection Screen | E06 — Driver | E06 (es-kitchen-webapp-driver) | Form | Kiểm đếm hàng hóa (product inspection) và vật tư dụng cụ (material inspection); cảnh báo thừa/thiếu |
| DA_DRVR_007 | Report Completion — Pre/Post Photo Upload Screen | E06 — Driver | E06 (es-kitchen-webapp-driver) | Wizard | Upload ảnh trước và sau khi trưng bày sản phẩm; xem popup hướng dẫn trưng bày dạng slide |
| DA_DRVR_008 | Signature Screen | E06 — Driver | E06 (es-kitchen-webapp-driver) | Form | Hiển thị nội dung báo cáo hoàn thành; thu chữ ký đại diện công ty và chữ ký tài xế; nhập ghi chú tự do |
| DA_DRVR_009 | Incident / Delay Report Screen | E06 — Driver | E06 (es-kitchen-webapp-driver) | Form | Báo cáo trễ hàng (chọn lý do) hoặc sự cố (hàng hỏng/thiếu + mô tả); gửi thông báo real-time đến E03 |
| DA_DRVR_010 | Manual Display Screen | E06 — Driver | E06 (es-kitchen-webapp-driver) | Detail | Xem tài liệu hướng dẫn theo danh mục: Quy trình, Chuẩn bị, Lấy đồ, Cách chụp ảnh, Trưng bày |
| DA_DRVR_011 | Inquiry / Support Screen | E06 — Driver | E06 (es-kitchen-webapp-driver) | Chat | HubSpot Widget chatbot nhúng; xử lý FAQ tự động và hỗ trợ real-time |

---

## Out of Scope

- Luồng phân công đơn cho tài xế (do E05 Outsource Admin hoặc E03 System Admin quản lý — xem SPEC riêng).
- Thanh toán tiền mặt và báo cáo thu tiền (thuộc domain `thu-tien-hang-huy` — ESKITCHEN-1242).
- Quản lý tài khoản tài xế / onboarding tài xế mới (thuộc E05 hoặc E03).
- Tính năng bản đồ / điều hướng route (không có trong domain stories).
- Push notification đến E01 User Mobile về trạng thái giao hàng (thuộc SPEC `menu-order`).

---

## Dependencies

| Dependency | Mô tả | SPEC liên quan |
|---|---|---|
| ES Station (E03) | Nhận real-time alert từ Driver khi có sự cố/trễ | SPEC E03 — System Admin |
| HubSpot API | Widget chatbot nhúng vào Driver App | — (external integration) |
| GPS / Location | Ghi nhận tọa độ tại mỗi cập nhật trạng thái | — (device API) |
| S3 (AWS) | Lưu trữ ảnh upload từ Driver App | — (infra) |
| Auth (JWT) | Xác thực session tài xế | Cross-cutting — `es-kitchen-api` |

---

## Bước tiếp theo

**SPEC sẵn sàng — chạy song song:**

- "Hãy là Tech Lead Design, làm DESIGN.md từ SPEC này: `/Users/longtd/Desktop/WORK/AI_AGENTS_ES_KITCHEN/es-kitchen-docs/docs/features/delivery-driver/SPEC.md`"
- "Hãy là QC, sinh test cases từ SPEC này: `/Users/longtd/Desktop/WORK/AI_AGENTS_ES_KITCHEN/es-kitchen-docs/docs/features/delivery-driver/SPEC.md`"
  (hoặc slash command: `/test/generate_manual_testcases_rbt` cho FULL RBT / `/test/generate_testcases_from_requirements` cho QUICK)
- → "Hãy là Designer, tạo UI-SPEC.md + Figma từ SPEC này: es-kitchen-docs/docs/features/delivery-driver/SPEC.md"
  (hoặc slash command: `/create-ui-design es-kitchen-docs/docs/features/delivery-driver/SPEC.md`)
