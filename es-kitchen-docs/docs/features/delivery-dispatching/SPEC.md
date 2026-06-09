# SPEC: Giao hàng — Lịch trình & Điều phối (Delivery Dispatching)

> Backlog ID: ESKITCHEN-1236
> Domain: `giao-hang-dieu-phoi` · 31 stories
> Phase: Phase 2
> Ngày tạo: 2026-06-03

---

## Mô tả nghiệp vụ

Hệ thống quản lý toàn bộ vòng đời lịch giao hàng: từ thiết lập chu kỳ picking, điều phối đối tác vận chuyển, quản lý tài xế, đến tích hợp kho bãi (Thomas) và hãng vận chuyển (Yamato YBM). Company Admin xem lịch dự kiến hoặc gửi yêu cầu đổi ngày đột xuất. System Admin điều phối toàn bộ từ phân chia chu kỳ, phân công tài xế, đến theo dõi trạng thái giao hàng thực tế.

---

## Actors & Preconditions

| Actor | Repo | Vai trò |
|---|---|---|
| **E02** — Company Admin | `es-kitchen-web-company` | Xem lịch năm, đăng ký quy tắc giao đặc biệt, gửi yêu cầu đổi ngày |
| **E03** — System Admin | `es-kitchen-web-admin` | Quản lý toàn bộ lịch picking, đối tác vận chuyển, tài xế, tích hợp ngoài |
| **E06** — Driver | `es-kitchen-webapp-driver` | Nhận dữ liệu phân công, đồng bộ báo cáo giao hàng |
| **es-kitchen-api** | Backend | Xử lý business logic, tích hợp Thomas/Yamato, lưu trữ lịch trình |

> Cross-repo: E02 + E03 + E06 + API — **cần Contract Lock trước Phase 3**.

**Preconditions chung:**
- Actor đã đăng nhập và có đúng role
- Hợp đồng (Contract) đã được kích hoạt (Company Admin phải có contract hợp lệ)
- Master data đối tác vận chuyển và tài xế đã được System Admin cài đặt trước khi lên lịch

---

## Happy Path

### Nhóm 1 — Company Admin: Xem lịch & Yêu cầu đổi ngày (E02)

**1.1 Hiển thị lịch năm (Annual Calendar Display)**
1. Company Admin truy cập màn hình Lịch giao hàng
2. Hệ thống hiển thị lịch năm với các ngày giao hàng dự kiến được đánh dấu
3. Admin có thể chuyển xem theo tháng/tuần/chu kỳ

**1.2 Đăng ký quy tắc giao hàng đặc biệt (Special Delivery Rule Registration)**
1. Company Admin vào mục Quy tắc giao hàng đặc biệt
2. Admin nhập thông tin: loại quy tắc (cần gọi bảo vệ, đường cấm tải, v.v.), địa điểm áp dụng, ghi chú cho tài xế
3. Hệ thống lưu quy tắc và gắn vào profile địa điểm giao của company
4. Khi tài xế nhận lịch, quy tắc đặc biệt hiển thị kèm thông tin chuyến

**1.3 Yêu cầu đổi ngày giao hàng (Request to Change Delivery Date)**
1. Company Admin chọn ngày giao cần thay đổi trên lịch
2. Admin điền lý do (lễ, tết, sự kiện công ty) và ngày mong muốn thay thế
3. Hệ thống gửi yêu cầu tới System Admin để xét duyệt
4. Admin nhận thông báo khi yêu cầu được xử lý

---

### Nhóm 2 — System Admin: Quản lý đối tác vận chuyển ủy thác (E03)

**2.1 Quản lý công ty vận chuyển ủy thác (Consignment Delivery Management)**
1. System Admin truy cập màn hình Danh sách đối tác vận chuyển
2. Hiển thị danh sách với bộ lọc tìm kiếm

**2.2 Đăng ký đối tác vận chuyển mới (Register Delivery Address)**
1. Admin nhập thông tin công ty: tên, địa chỉ, thông tin liên hệ, khu vực phụ trách
2. Hệ thống lưu và hiển thị trong danh sách

**2.3 Tìm kiếm / Sửa / Xóa đối tác (Consignment Delivery Search)**
1. Admin tìm kiếm theo tên, khu vực
2. Chọn bản ghi để xem chi tiết, chỉnh sửa hoặc xóa
3. Hệ thống validate trước khi xóa (không xóa nếu đang có lịch giao active)

---

### Nhóm 3 — System Admin: Quản lý tài xế (E03)

**3.1 Danh sách tài xế (Delivery Staff List)**
1. System Admin xem danh sách tài xế với tìm kiếm theo tên, trạng thái

**3.2 Đăng ký tài xế mới (New Delivery Staff Registration)**
1. Admin nhập: tên, thông tin liên hệ, đối tác vận chuyển liên kết, loại phương tiện
2. Hệ thống tạo tài khoản Driver (E06) và gửi thông tin đăng nhập

**3.3 Xem chi tiết / Sửa / Xóa tài xế (Delivery Staff Details/Edit/Delete)**
1. Admin chọn tài xế từ danh sách
2. Xem lịch sử phân công, chỉnh sửa thông tin hoặc deactivate tài khoản
3. Không xóa cứng nếu tài xế đang có lịch giao chưa hoàn thành

---

### Nhóm 4 — System Admin: Quản lý trạm trung chuyển (E03)

**4.1 Danh sách trạm trung chuyển (List of Relay Destinations)**
1. System Admin xem danh sách trạm trung chuyển với tìm kiếm

**4.2 Đăng ký trạm trung chuyển mới (Register as Relay Destination)**
1. Admin nhập: tên trạm, địa chỉ, thông tin liên hệ, giờ hoạt động
2. Hệ thống lưu và cho phép gắn vào lịch giao hàng

**4.3 Sửa / Xóa trạm trung chuyển (Edit/Delete Relay Destination)**
1. Admin cập nhật thông tin hoặc xóa trạm
2. Hệ thống cảnh báo nếu trạm đang được sử dụng trong lịch active

---

### Nhóm 5 — System Admin: Lịch picking & Chu kỳ giao hàng (E03)

**5.1 Hiển thị lịch picking (Calendar Display)**
1. System Admin truy cập màn hình Schedule
2. Hệ thống hiển thị lịch với chế độ xem Tuần/Tháng/Chu kỳ
3. Admin lọc theo Gói (Plan), Khách hàng, Ưu tiên giao

**5.2 Tự động lấy ngày nghỉ lễ Nhật (Auto Retrieve Japan Public Holidays)**
1. Hệ thống tự động tính toán và đánh dấu các ngày lễ Nhật trên lịch
2. Các ngày lễ được block mặc định — không tạo lịch picking vào ngày này

**5.3 Đăng ký thủ công ngày không picking (Manually Register Picking Unavailable Days)**
1. Admin chọn ngày trên lịch và đánh dấu là "Không picking"
2. Hệ thống lưu và hiển thị trạng thái blocked trên lịch

**5.4 Import danh sách ngày không picking (Import Picking Unavailable Days)**
1. Admin tải lên file CSV danh sách ngày không picking
2. Hệ thống validate format, import và block các ngày trong CSV

**5.5 Tự động phân chia chu kỳ giao hàng (Auto-Divide Schedule into Delivery Cycles)**
1. System Admin trigger phân chia tự động
2. Hệ thống chia lịch thành 20 chu kỳ: Trục dọc Tuần A-D × Trục ngang Nhóm 1-5
3. Kết quả hiển thị trên lịch dạng ma trận

**5.6 Sửa / Dời chu kỳ giao hàng (Edit/Delete Delivery Cycles)**
1. Admin kéo thả trên lịch để đổi ngày hoặc di chuyển chu kỳ
2. Hệ thống cập nhật và tính lại các ngày liên quan

**5.7 Tự động cập nhật ngày picking (Automatic Update of Delivery Data)**
1. Sau khi thiết lập lịch giao tự động và Lead time, hệ thống tự tính ngày picking
2. Nếu ngày picking tính ra rơi vào ngày nghỉ → hệ thống tự báo lỗi và yêu cầu Admin xử lý

**5.8 Logic dời lịch thủ công (Manual Movement Logic)**
1. Admin chọn dời 1 đơn đơn lẻ hoặc dời cả group trong chu kỳ
2. Admin nhập số ngày cần dời (trước/sau)
3. Hệ thống cập nhật lịch và kiểm tra conflict với ngày nghỉ/blocked

---

### Nhóm 6 — System Admin: Xuất hàng & Giao hàng (E03)

**6.1 Danh sách Xuất hàng / Giao hàng (Shipping and Delivery List)**
1. System Admin xem bảng danh sách với bộ lọc: Contract ID, tên Pháp nhân, Plan, Trạng thái

**6.2 Chi tiết block giao hàng (Shipping and Delivery Data Details)**
1. Admin chọn 1 bản ghi để xem: Mã xuất hàng, Lịch lấy hàng, Kho trung chuyển, Trạng thái tracking (từ API hãng vận chuyển)

**6.3 Đăng ký thủ công dữ liệu giao hàng (New Shipping and Delivery Data Registration)**
1. Admin tạo mới bản ghi giao hàng thủ công
2. Liên kết trực tiếp với Đơn hàng (Order) hiện có trong hệ thống
3. Hệ thống lưu và hiển thị trong danh sách

---

### Nhóm 7 — System Admin: Tích hợp Thomas (E03)

**7.1 Xuất chỉ thị giao hàng cho Thomas (Shipping Instructions for Thomas)**
1. System Admin chọn các bản ghi xuất hàng cần gửi
2. Hệ thống tạo file CSV đúng format Thomas và cho phép download/gửi

**7.2 Import kết quả từ Thomas (Thomas Integration - Shipping Record)**
1. Admin tải lên file CSV báo cáo thực tế từ Thomas
2. Hệ thống validate, import và cập nhật trạng thái giao hàng tương ứng

---

### Nhóm 8 — System Admin: Tích hợp Yamato YBM & Đồng bộ (E03)

**8.1 Tích hợp API Yamato YBM (Yamato Transport YBM API)**
1. Hệ thống kết nối API "YBM For Developer" của Yamato Express
2. Tạo mã Tracking cho mỗi chuyến giao
3. Nhận cập nhật tự động về giờ giao và trạng thái giao hàng thực tế

**8.2 Chia sẻ thông tin với công ty vận chuyển ủy thác (Info Sharing with Contracted Delivery Companies)**
1. Hệ thống tự động đồng bộ trạng thái giao hàng với các đối tác ủy thác
2. Đối tác nhận dữ liệu qua API hoặc portal (E05)

**8.3 Đồng bộ 2 chiều với App Tài xế (Drivers and Information Collaboration)**
1. App Tài xế (E06) gửi lên: ảnh chụp báo cáo trưng bày tủ lạnh, dữ liệu thu tiền, dữ liệu hàng hủy
2. Hệ thống nhận, lưu và hiển thị trong màn hình quản lý của System Admin

---

### Nhóm 9 — System Admin: Đề xuất & Mở rộng đối tác (E03)

**9.1 Danh sách đề xuất công ty vận chuyển (List of Recommended Delivery Companies)**
1. Hệ thống phân tích và đề xuất đối tác vận chuyển phù hợp dựa trên: tương thích kho bãi, ghép chuyến (hiệu suất tải), độ tin cậy (thành tích), tối ưu chi phí/thời gian
2. System Admin xem danh sách đề xuất và lựa chọn

**9.2 Xuất CSV cho Google MyMaps (CSV Output for Google MyMaps)**
1. System Admin chọn lịch giao cần visualize
2. Hệ thống xuất file CSV chứa địa chỉ các điểm giao hàng
3. Admin import vào Google MyMaps để xem lộ trình trực quan

**9.3 Cấu hình đối tác kho bãi / vận chuyển mới (Response from New Warehouse and Delivery Company)**
1. Admin cấu hình Master Data cho đối tác mới
2. Admin thiết lập kết nối API (nếu đối tác có API)
3. Hệ thống verify kết nối và kích hoạt đối tác

---

## Alternative Flows & Edge Cases

### Lịch picking rơi vào ngày nghỉ
- Hệ thống tự động phát hiện conflict khi tính ngày picking
- Hiển thị cảnh báo rõ ràng, không tự dời lịch — yêu cầu Admin xác nhận hướng xử lý
- **TODO (BA):** Logic ưu tiên khi dời: dời lên ngày trước hay ngày sau? Có quy tắc cố định hay Admin chọn mỗi lần?

### Import CSV ngày không picking — format lỗi
- Validate trước khi import: báo lỗi từng dòng sai format
- Không import partial (all-or-nothing) hay cho phép import một phần?
- **TODO (BA):** Xác nhận behavior: import tất cả hàng hợp lệ và bỏ qua lỗi, hay reject toàn bộ file khi có lỗi?

### Yamato API không phản hồi / lỗi kết nối
- Hệ thống retry tự động (số lần retry cụ thể cần Tech Lead xác định)
- Trạng thái tracking hiển thị "Đang chờ cập nhật" thay vì báo lỗi với user
- **TODO (BA):** Admin có nhận alert khi Yamato API liên tục fail không? Kênh nào (email/notification)?

### Tài xế đang có lịch giao — Admin muốn deactivate
- Hệ thống cảnh báo danh sách chuyến giao chưa hoàn thành
- Không deactivate tài xế khi còn chuyến active — Admin phải chuyển giao trước

### Dời lịch hàng loạt (cả group chu kỳ) — ảnh hưởng nhiều Company
- Hệ thống hiển thị danh sách Company bị ảnh hưởng trước khi confirm
- **TODO (BA):** Có gửi notification tự động cho Company Admin bị ảnh hưởng không?

### Yêu cầu đổi ngày giao của Company Admin — quy trình duyệt
- **TODO (BA):** System Admin duyệt qua màn hình nào? Có SLA xử lý yêu cầu không?
- **TODO (BA):** Nếu System Admin từ chối, Company Admin có nhận thông báo kèm lý do không?

### Thomas CSV — format không khớp
- **TODO (BA):** Spec format CSV Thomas: cần file sample hoặc link tài liệu Thomas API để Tech Lead implement đúng.

### Đề xuất công ty vận chuyển (Recommended Delivery Companies) — Priority 4
- **TODO (BA):** Thuật toán đề xuất (scoring) do phía hệ thống tự tính hay có input từ System Admin?
- Story này có Priority 4 — xác nhận có nằm trong scope Phase 2 hay Phase 3?

---

## Acceptance Criteria

### Nhóm 1 — Company Admin (E02)

**AC-1.1 Annual Calendar Display**
- [ ] Company Admin thấy lịch năm với ngày giao được đánh dấu
- [ ] Có thể chuyển chế độ xem tháng/tuần/chu kỳ
- [ ] Chỉ hiển thị lịch giao của company mình

**AC-1.2 Special Delivery Rule Registration**
- [ ] Admin tạo được quy tắc giao đặc biệt với tất cả thông tin bắt buộc
- [ ] Quy tắc hiển thị trên thông tin chuyến giao của tài xế E06
- [ ] Admin sửa/xóa được quy tắc đã tạo

**AC-1.3 Request to Change Delivery Date**
- [ ] Admin gửi yêu cầu đổi ngày với lý do và ngày mong muốn
- [ ] Yêu cầu xuất hiện trong queue xử lý của System Admin
- [ ] Admin nhận thông báo khi yêu cầu được duyệt/từ chối

### Nhóm 2 — Quản lý đối tác vận chuyển ủy thác (E03)

**AC-2.1 – 2.3 Consignment Delivery Management**
- [ ] CRUD đầy đủ cho đối tác vận chuyển
- [ ] Tìm kiếm theo tên, khu vực hoạt động
- [ ] Không xóa được đối tác đang có lịch giao active (hiển thị lý do lỗi)

### Nhóm 3 — Quản lý tài xế (E03)

**AC-3.1 – 3.3 Delivery Staff Management**
- [ ] CRUD đầy đủ cho tài xế
- [ ] Tạo tài xế mới đồng thời tạo tài khoản E06
- [ ] Không deactivate tài xế đang có chuyến active
- [ ] Tìm kiếm theo tên, trạng thái, đối tác

### Nhóm 4 — Trạm trung chuyển (E03)

**AC-4.1 – 4.3 Relay Destination Management**
- [ ] CRUD đầy đủ cho trạm trung chuyển
- [ ] Cảnh báo khi xóa trạm đang dùng trong lịch active

### Nhóm 5 — Lịch picking & Chu kỳ (E03)

**AC-5.2 Auto Retrieve Japan Public Holidays**
- [ ] Lịch nghỉ lễ Nhật được đánh dấu tự động đúng năm đang xét
- [ ] Không tạo lịch picking vào ngày lễ tự động

**AC-5.4 Import Picking Unavailable Days**
- [ ] Hệ thống accept file CSV và import thành công
- [ ] Báo lỗi rõ ràng khi format sai (dòng nào, lỗi gì)

**AC-5.5 Auto-Divide Delivery Cycles**
- [ ] Hệ thống tạo đúng 20 chu kỳ (4 tuần × 5 nhóm)
- [ ] Ma trận hiển thị rõ trên lịch

**AC-5.7 Automatic Update of Delivery Data**
- [ ] Ngày picking được tính tự động sau khi thiết lập lead time
- [ ] Conflict với ngày nghỉ được báo lỗi — không tự dời

**AC-5.8 Manual Movement Logic**
- [ ] Dời được 1 đơn đơn lẻ
- [ ] Dời được cả group trong chu kỳ
- [ ] Hệ thống kiểm tra conflict sau khi dời

### Nhóm 6 — Xuất hàng & Giao hàng (E03)

**AC-6.1 – 6.3 Shipping and Delivery**
- [ ] Danh sách lọc được theo Contract ID, Pháp nhân, Plan, Trạng thái
- [ ] Chi tiết hiển thị trạng thái tracking real-time từ Yamato API
- [ ] Tạo thủ công được bản ghi giao hàng, liên kết với Order

### Nhóm 7 — Thomas Integration (E03)

**AC-7.1 Shipping Instructions for Thomas**
- [ ] Export CSV đúng format Thomas
- [ ] Chọn nhiều bản ghi để export 1 lần

**AC-7.2 Shipping Record Import**
- [ ] Import CSV từ Thomas, cập nhật trạng thái giao hàng đúng bản ghi
- [ ] Báo lỗi nếu có mã xuất hàng không khớp trong hệ thống

### Nhóm 8 — Yamato & Đồng bộ (E03 + E06)

**AC-8.1 Yamato YBM API**
- [ ] Mã Tracking được tạo tự động khi lịch giao được xác nhận
- [ ] Trạng thái giao hàng được cập nhật tự động từ Yamato

**AC-8.3 Driver Sync**
- [ ] Ảnh báo cáo từ tài xế lưu được vào hệ thống và hiển thị trên Admin
- [ ] Dữ liệu thu tiền và hàng hủy từ tài xế được ghi nhận đúng đơn hàng

### Nhóm 9 — Đề xuất & Mở rộng (E03)

**AC-9.2 CSV for Google MyMaps**
- [ ] CSV xuất đủ cột địa chỉ, tên điểm giao, ngày giao
- [ ] File import được vào Google MyMaps và hiển thị pins đúng vị trí

---

## Screens

| Screen Code | Screen | Actor | App | Screen Type | Mô tả ngắn |
|---|---|---|---|---|---|
| CW_DISP_001 | Lịch giao hàng năm (Annual Delivery Calendar) | E02 | E02 — es-kitchen-web-company | Calendar | Xem lịch năm với ngày giao được đánh dấu, chuyển chế độ tháng/tuần/chu kỳ |
| CW_DISP_002 | Quy tắc giao hàng đặc biệt (Special Delivery Rules) | E02 | E02 — es-kitchen-web-company | List | Tạo/sửa/xóa quy tắc giao đặc biệt (bảo vệ, đường cấm tải, ghi chú tài xế) |
| CW_DISP_003 | Yêu cầu đổi ngày giao hàng (Delivery Date Change Request) | E02 | E02 — es-kitchen-web-company | Form | Chọn ngày giao cần thay đổi, điền lý do và ngày mong muốn, gửi yêu cầu tới System Admin |
| AW_DISP_001 | Danh sách đối tác vận chuyển ủy thác (Consignment Delivery Partners List) | E03 | E03 — es-kitchen-web-admin | List | Xem/tìm kiếm danh sách đối tác vận chuyển theo tên, khu vực |
| AW_DISP_002 | Chi tiết / Đăng ký đối tác vận chuyển (Consignment Delivery Partner Detail/Register) | E03 | E03 — es-kitchen-web-admin | Form | Tạo mới hoặc xem/sửa/xóa thông tin đối tác vận chuyển ủy thác |
| AW_DISP_003 | Danh sách tài xế (Delivery Staff List) | E03 | E03 — es-kitchen-web-admin | List | Xem/tìm kiếm tài xế theo tên, trạng thái, đối tác vận chuyển |
| AW_DISP_004 | Chi tiết / Đăng ký tài xế (Delivery Staff Detail/Register) | E03 | E03 — es-kitchen-web-admin | Detail | Tạo tài xế mới (đồng thời tạo tài khoản E06), xem lịch sử phân công, sửa/deactivate |
| AW_DISP_005 | Danh sách trạm trung chuyển (Relay Destination List) | E03 | E03 — es-kitchen-web-admin | List | Xem/tìm kiếm danh sách trạm trung chuyển |
| AW_DISP_006 | Chi tiết / Đăng ký trạm trung chuyển (Relay Destination Detail/Register) | E03 | E03 — es-kitchen-web-admin | Form | Tạo mới hoặc sửa/xóa thông tin trạm trung chuyển |
| AW_DISP_007 | Lịch picking & Chu kỳ giao hàng (Picking Schedule & Delivery Cycles) | E03 | E03 — es-kitchen-web-admin | Calendar | Xem lịch tuần/tháng/chu kỳ, đánh dấu ngày không picking, trigger phân chia 20 chu kỳ tự động, kéo thả dời lịch |
| AW_DISP_008 | Import ngày không picking (Import Picking Unavailable Days) | E03 | E03 — es-kitchen-web-admin | Form* | Upload CSV danh sách ngày không picking, xem kết quả validate và lỗi từng dòng |
| AW_DISP_009 | Danh sách xuất hàng & giao hàng (Shipping and Delivery List) | E03 | E03 — es-kitchen-web-admin | List | Xem bảng danh sách với bộ lọc Contract ID, Pháp nhân, Plan, Trạng thái |
| AW_DISP_010 | Chi tiết block giao hàng (Shipping and Delivery Detail) | E03 | E03 — es-kitchen-web-admin | Detail | Xem mã xuất hàng, lịch lấy hàng, kho trung chuyển, trạng thái tracking real-time từ Yamato |
| AW_DISP_011 | Đăng ký thủ công dữ liệu giao hàng (Manual Shipping Data Registration) | E03 | E03 — es-kitchen-web-admin | Form | Tạo bản ghi giao hàng thủ công, liên kết với Order hiện có |
| AW_DISP_012 | Xuất chỉ thị giao hàng Thomas (Thomas Shipping Instructions Export) | E03 | E03 — es-kitchen-web-admin | List* | Chọn bản ghi xuất hàng, xuất file CSV format Thomas để download/gửi |
| AW_DISP_013 | Import kết quả Thomas (Thomas Shipping Record Import) | E03 | E03 — es-kitchen-web-admin | Form* | Upload CSV báo cáo thực tế từ Thomas, xem kết quả cập nhật trạng thái giao hàng |
| AW_DISP_014 | Danh sách đề xuất công ty vận chuyển (Recommended Delivery Companies) * *inferred | E03 | E03 — es-kitchen-web-admin | List | Xem danh sách đề xuất đối tác vận chuyển phù hợp (scoring theo kho bãi, hiệu suất, chi phí) |
| AW_DISP_015 | Xuất CSV Google MyMaps (Google MyMaps CSV Export) | E03 | E03 — es-kitchen-web-admin | Detail* | Chọn lịch giao, xuất CSV địa chỉ điểm giao để import vào Google MyMaps |
| AW_DISP_016 | Cấu hình đối tác kho bãi / vận chuyển mới (New Partner Configuration) *inferred | E03 | E03 — es-kitchen-web-admin | Form | Cấu hình Master Data và kết nối API cho đối tác kho bãi/vận chuyển mới |
| DA_DISP_001 | Xem thông tin chuyến giao kèm quy tắc đặc biệt (Driver Assignment Detail) *inferred | E06 | E06 — es-kitchen-webapp-driver | Detail | Xem thông tin phân công chuyến giao, hiển thị quy tắc giao đặc biệt từ E02 |

---

## Out of Scope

- Tính toán cước vận chuyển, thanh toán với đối tác vận chuyển
- Sagawa API (domain này chỉ scope Yamato YBM — Sagawa thuộc feature khác nếu có)
- Giao diện Driver App (E06) — chi tiết UX Driver xem SPEC riêng `delivery-driver-app`
- Giao diện Outsource Admin (E05) — xem SPEC riêng `delivery-outsource-web`
- Real-time tracking map cho Company Admin hoặc End User (E01)
- Quản lý tồn kho — thuộc domain `[TỒN KHO & THIẾT BỊ]`
- Thu tiền mặt và hàng hủy chi tiết — thuộc domain `[THU TIỀN & HÀNG HỦY]`
- Story "List of Recommended Delivery Companies" (Priority 4) — **TODO (BA):** Xác nhận có trong Phase 2 scope không

---

## Dependencies

| Dependency | Mô tả |
|---|---|
| `hop-dong-quan-ly` SPEC | Company phải có contract hợp lệ trước khi thiết lập lịch giao |
| `menu-order` SPEC | Order data phải tồn tại để gắn vào bản ghi giao hàng thủ công |
| Thomas API (external) | Format CSV cần document từ Thomas — **TODO (BA):** lấy file spec Thomas |
| Yamato YBM For Developer (external) | API credentials và sandbox cần được cấp trước Phase 2 dev |
| E06 Driver App SPEC | Đồng bộ 2 chiều với Driver — cần Contract Lock với E06 team |

---

## Bước tiếp theo

Chạy song song sau khi SPEC được sign-off:

- "Hãy là Tech Lead Design, làm DESIGN.md từ SPEC này: `/Users/longtd/Desktop/WORK/AI_AGENTS_ES_KITCHEN/es-kitchen-docs/docs/features/delivery-dispatching/SPEC.md`"
- "Hãy là QC, sinh test cases từ SPEC này: `/Users/longtd/Desktop/WORK/AI_AGENTS_ES_KITCHEN/es-kitchen-docs/docs/features/delivery-dispatching/SPEC.md`"
  (slash command: `/test/generate_manual_testcases_rbt` cho FULL RBT / `/test/generate_testcases_from_requirements` cho QUICK)
- "Hãy là Designer, tạo UI-SPEC.md + Figma từ SPEC này: es-kitchen-docs/docs/features/delivery-dispatching/SPEC.md"
  (hoặc slash command: /create-ui-design es-kitchen-docs/docs/features/delivery-dispatching/SPEC.md)
