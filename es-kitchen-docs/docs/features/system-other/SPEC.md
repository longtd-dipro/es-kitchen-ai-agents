# SPEC: System Other (System Settings & Common)

> **Domain:** BF_[SYSTEM & OTHER] Cấu hình Hệ thống & Tích hợp
> **Backlog ID:** ESKITCHEN-1249
> **Phase:** Phase 2
> **SPEC Transfer:** False (chưa chuyển — tạo mới từ business flow)

---

## Mô tả nghiệp vụ

Domain này bao gồm toàn bộ các tính năng vận hành nền tảng và cấu hình hệ thống, không thuộc nghiệp vụ chức năng cốt lõi (order/delivery/payment). Cụ thể:

- **Notification & Communication:** Cấu hình thông báo đẩy (push notification) cho user mobile và driver; gửi nhắc nhở tự động; quản lý và phát hành thông báo nội bộ đến các đối tượng khác nhau; tích hợp chatbot HubSpot cho Company Admin.
- **System Administration (E03):** Quản lý tài khoản và phân quyền theo Role; IP whitelist + OTP 2FA; bật/tắt chế độ bảo trì (maintenance mode); quản lý phiên bản mobile app; cá nhân hóa dashboard; tích hợp API HubSpot 2 chiều.
- **Operational Manuals:** Tải xuống tài liệu hướng dẫn dành riêng cho từng portal (E03/E04/E05).
- **Email Notifications:** Gửi email tự động cho Supplier (E04) và Driver/Outsource (E05) theo sự kiện nghiệp vụ.

---

## Actors & Preconditions

### Actors liên quan

| Actor | Portal | Vai trò trong domain này |
|---|---|---|
| **E01** — End User (Mobile) | Flutter App | Bật/tắt cài đặt thông báo cá nhân |
| **E02** — Company Admin | Web | Xem danh sách thông báo từ ES Kitchen; xem chi tiết + tải file đính kèm; nhận nhắc nhở chốt đơn; chatbot HubSpot |
| **E03** — System Admin | Web | Toàn bộ quản trị hệ thống: tài khoản, phân quyền, IP whitelist, maintenance, version mobile, dashboard, notification management, operation manual, HubSpot API |
| **E04** — Supplier | Web | Nhận email thông báo; tải operation manual |
| **E05** — Outsource/Driver Web | Web | Nhận email thông báo; tải operation manual |
| **E06** — Driver App | ReactJS Web App | Nhận push notification |

> **Cross-repo:** Domain này ảnh hưởng **6 repo** (es-kitchen-api + es-kitchen-payment-app + es-kitchen-web-admin + es-kitchen-web-company + es-kitchen-web-supplier + es-kitchen-webapp-driver). **Contract Lock bắt buộc trước Phase 3.**

### Preconditions chung

- E01: Đã đăng nhập, đã cấp quyền notification trên thiết bị (iOS/Android)
- E02: Đã đăng nhập với tài khoản Company Admin hợp lệ
- E03: Đã đăng nhập với tài khoản System Admin có quyền tương ứng theo Role
- E04/E05: Đã đăng nhập với tài khoản được cấp bởi E03
- E06: Đã đăng nhập Driver App, thiết bị đã đăng ký nhận push notification

---

## Happy Path

Domain này gồm nhiều sub-feature độc lập. Mỗi sub-feature được mô tả riêng.

---

### SF-01: Cài đặt thông báo (E01 — User Mobile)

**Actor:** E01
**Precondition:** Đã đăng nhập app, thiết bị đã cấp quyền notification

1. User mở màn hình Cài đặt (Settings) trên mobile app.
2. Hệ thống hiển thị danh sách các loại thông báo có thể bật/tắt.
3. User toggle Bật/Tắt từng loại thông báo.
4. Hệ thống lưu trạng thái cài đặt theo từng loại thông báo của user đó.
5. Các thông báo thuộc loại đã tắt sẽ không được gửi tới thiết bị của user.

**TODO (BA):** Liệt kê cụ thể các loại thông báo có thể bật/tắt (ví dụ: thông báo đặt hàng, giao hàng, khuyến mãi...)?

---

### SF-02: Nhắc nhở chốt đơn hàng (E02 — Company Admin)

**Actor:** E02 (nhận thông báo), hệ thống (tự động gửi)
**Precondition:** Company có hợp đồng active; ngày 15 hàng tháng hoặc đến hạn chốt đơn vật tư

1. Hệ thống tự động gửi thông báo nhắc nhở đến Company Admin vào ngày 15 hàng tháng để chốt đơn hàng tháng tiếp theo.
2. Hệ thống tự động gửi thông báo nhắc nhở đến Company Admin khi đến hạn chốt đơn vật tư định kỳ.
3. Company Admin nhận thông báo (qua web notification hoặc email).

**TODO (BA):** Kênh gửi nhắc nhở là gì: in-app notification, email, hay cả hai? Lịch chốt đơn vật tư là cố định hay cấu hình theo từng company?

---

### SF-03: Danh sách & Chi tiết thông báo hệ thống (E02 — Company Admin)

**Actor:** E02
**Precondition:** Đã đăng nhập; có thông báo được E03 phát hành

1. Company Admin truy cập menu "Thông báo" (Announcements).
2. Hệ thống hiển thị danh sách thông báo từ ES Kitchen (sự cố hệ thống, trễ lịch giao hàng, cập nhật hệ thống...) theo thứ tự thời gian mới nhất.
3. Company Admin chọn một thông báo để xem chi tiết.
4. Hệ thống hiển thị nội dung đầy đủ của thông báo và các file đính kèm (nếu có).
5. Company Admin tải về file đính kèm nếu cần.

**TODO (BA):** Thông báo có phân loại (category/tag) không? Có phân biệt "đã đọc / chưa đọc" không?

---

### SF-04: Tích hợp HubSpot Chatbot (E02 — Company Admin)

**Actor:** E02
**Precondition:** Đã đăng nhập; HubSpot Widget đã được cấu hình bởi E03

1. Company Admin trong quá trình sử dụng web gặp câu hỏi hoặc cần hỗ trợ.
2. Widget Chatbot HubSpot hiển thị ở góc màn hình.
3. Company Admin nhấn mở widget, nhập câu hỏi.
4. Bot tự động phản hồi FAQ hoặc chuyển sang nhân viên hỗ trợ trực tiếp.

> **Note:** Đây là tích hợp frontend-side (embed HubSpot Widget script). Không có business logic phía API.

---

### SF-05: IP Whitelist & OTP 2FA (E03 — System Admin)

> **Note:** Feature này đã có SPEC riêng tại `/es-kitchen-docs/docs/features/ip-whitelist/SPEC.md`. Domain này chỉ đề cập để ghi nhận phạm vi — không mở rộng thêm ở SPEC này.

**Tóm tắt:** System Admin quản lý danh sách IP được phép truy cập hệ thống. Truy cập từ IP ngoài whitelist yêu cầu OTP 2FA.

---

### SF-06: Maintenance Mode (E03 — System Admin)

**Actor:** E03
**Precondition:** Đã đăng nhập với quyền quản trị hệ thống

**Xem lịch sử maintenance:**
1. System Admin truy cập menu "Bảo trì" (Maintenance Management).
2. Hệ thống hiển thị danh sách các lần bật/tắt maintenance trước đây (thời gian bật, tắt, người thực hiện, lý do).

**Bật/Tắt maintenance:**
1. System Admin nhấn nút tạo maintenance mới hoặc bật chế độ bảo trì.
2. Nhập thông tin: lý do, thời gian dự kiến (optional).
3. Xác nhận bật maintenance.
4. Hệ thống chuyển toàn bộ portal về trạng thái maintenance (hiển thị trang thông báo bảo trì cho user).
5. System Admin tắt maintenance khi xong việc — hệ thống trở lại hoạt động bình thường.

**TODO (BA):** Khi bật maintenance, các portal bị ảnh hưởng là tất cả (E01/E02/E03/E04/E05/E06) hay có thể chọn riêng từng portal? E03 có bị ảnh hưởng không (để admin vẫn vào được)?

---

### SF-07: Quản lý phiên bản Mobile App (E03 — System Admin)

**Actor:** E03
**Precondition:** Đã đăng nhập

1. System Admin truy cập menu "Quản lý phiên bản" (Version Management).
2. Hệ thống hiển thị danh sách các phiên bản Mobile App đã phát hành (version name, build number, ngày phát hành, môi trường DEV/STG/PROD, trạng thái).

**TODO (BA):** Chức năng này chỉ là xem (read-only) hay có thể thêm/sửa/xóa bản ghi version? Có liên kết đến force-update (yêu cầu user nâng cấp bắt buộc) không?

---

### SF-08: Quản lý Tài khoản & Phân quyền (E03 — System Admin)

**Actor:** E03
**Precondition:** Đã đăng nhập với quyền quản trị tài khoản

**Danh sách tài khoản:**
1. System Admin truy cập menu "Quản lý tài khoản" (Account Management).
2. Hệ thống hiển thị danh sách tài khoản bao gồm: Admin (E03), Nhà cung cấp (E04), Đơn vị vận chuyển (E05).
3. System Admin tìm kiếm/lọc theo loại tài khoản, tên, trạng thái.

**Thêm/Sửa tài khoản:**
1. System Admin chọn "Thêm tài khoản" hoặc nhấn "Sửa" trên tài khoản hiện có.
2. Nhập/chỉnh sửa thông tin: tên, email, loại tài khoản.
3. Với tài khoản Admin (E03): gán một hoặc nhiều Role tùy quyền hạn.
4. Với tài khoản Nhà cung cấp (E04) hoặc Vận chuyển (E05): không phân Role — cấp full quyền mặc định của web tương ứng.
5. Lưu thông tin.

**Xóa/Vô hiệu hóa tài khoản:**
1. System Admin chọn tài khoản cần xóa hoặc vô hiệu hóa.
2. Nhấn "Xóa" hoặc "Vô hiệu hóa".
3. Xác nhận hành động.
4. Hệ thống thực hiện xóa vĩnh viễn hoặc chuyển tài khoản sang trạng thái inactive (không thể đăng nhập).

**TODO (BA):** Xóa tài khoản là soft delete hay hard delete? Tài khoản bị vô hiệu hóa có thể kích hoạt lại không?

---

### SF-09: Quản lý Phân quyền theo Role (E03 — System Admin)

**Actor:** E03
**Precondition:** Đã đăng nhập với quyền quản trị phân quyền

**Xem danh sách quyền:**
1. System Admin truy cập menu "Phân quyền" (Access Control).
2. Hệ thống hiển thị bảng danh sách các chức năng (function) theo từng Role dưới dạng tab.
3. Mỗi chức năng có thể bật/tắt hoặc thiết lập CRUD riêng lẻ cho từng Role.

**Thêm/Sửa/Xóa Role:**
1. Mỗi Role hiển thị dưới dạng Tab riêng.
2. System Admin có thể thêm Role mới, đổi tên Role, hoặc xóa Role.
3. Điều kiện xóa Role: **không có tài khoản Admin nào đang được gán vào Role đó**.
4. Hệ thống kiểm tra điều kiện trước khi cho phép xóa — nếu vi phạm, hiển thị thông báo lỗi kèm số lượng tài khoản đang dùng Role.

---

### SF-10: Cá nhân hóa Dashboard (E03 — System Admin)

**Actor:** E03
**Precondition:** Đã đăng nhập

1. System Admin truy cập Dashboard.
2. Hệ thống hiển thị các thẻ (card) thông tin theo cấu hình hiện tại.
3. System Admin nhấn "Chỉnh sửa bố cục" (Personalize).
4. Kéo thả để sắp xếp lại vị trí các thẻ.
5. Ẩn các thẻ không cần thiết bằng cách toggle off.
6. Lưu cấu hình — bố cục được lưu theo từng tài khoản (per-user).

**TODO (BA):** Cấu hình cá nhân hóa lưu per-user hay per-role? Nếu tài khoản mới, bố cục mặc định là gì?

---

### SF-11: Dashboard — Danh sách chỉ số (E03 — System Admin)

**Actor:** E03
**Precondition:** Đã đăng nhập

1. System Admin mở Dashboard.
2. Hệ thống hiển thị các chỉ số:
   - Số lượng yêu cầu từ HubSpot (tổng/theo trạng thái)
   - Lịch xuất hàng / giao hàng trong tuần
   - Tỉ lệ hoàn thành giao hàng trong tuần

**TODO (BA):** Các chỉ số này có filter theo ngày/tuần/tháng không? Dữ liệu từ HubSpot lấy real-time hay cache định kỳ?

---

### SF-12: Quản lý Thông báo nội bộ (E03 — System Admin)

**Actor:** E03
**Precondition:** Đã đăng nhập với quyền quản lý thông báo

**Xem danh sách thông báo:**
1. System Admin truy cập menu "Quản lý Thông báo" (Notification Management).
2. Hệ thống hiển thị danh sách tất cả thông báo nội bộ và thông báo gửi đối tác (Company Admin, Driver, Supplier).

**Tìm kiếm / Lọc đối tượng nhận:**
1. System Admin sử dụng tìm kiếm phân luồng để lọc thông báo theo đối tượng nhận: Pháp nhân (Company), Người dùng cá nhân (User), Tài xế (Driver), Nhà cung cấp (Supplier).

**Tạo thông báo mới:**
1. System Admin nhấn "Tạo thông báo mới".
2. Nhập tiêu đề, nội dung thông báo.
3. Đính kèm file (nếu cần).
4. Chọn đối tượng nhận (Pháp nhân / Người dùng / Tài xế / Nhà cung cấp).
5. Cấu hình gửi email hàng loạt đồng thời: bật/tắt tùy chọn gửi email tới toàn bộ người phụ trách của Pháp nhân.
6. Đăng tải thông báo.
7. Hệ thống gửi notification đến đối tượng được chọn. Nếu bật email: gửi email đồng thời.

**Xem chi tiết / Sửa / Xóa thông báo:**
1. System Admin chọn thông báo từ danh sách.
2. Xem nội dung đầy đủ, có thể sửa tiêu đề/nội dung/file đính kèm.
3. Hoặc xóa thông báo (xác nhận trước khi xóa).

**TODO (BA):** Thông báo đã gửi có thể sửa/xóa không? Nếu xóa, thông báo đã hiển thị trên portal E02 có bị ẩn không?

---

### SF-13: Operation Manual (E03 — System Admin)

**Actor:** E03
**Precondition:** Đã đăng nhập

1. System Admin truy cập menu "Tài liệu hướng dẫn" (Operation Manual).
2. Hệ thống hiển thị danh sách file PDF tài liệu hướng dẫn sử dụng nội bộ.
3. System Admin chọn tài liệu và tải về (download PDF).

> **Note:** Tài liệu này chỉ dành cho nội bộ (internal use only) — không hiển thị trên các portal khác.

---

### SF-14: Tích hợp HubSpot API 2 chiều (E03 — System Admin)

**Actor:** E03 (cấu hình), hệ thống (đồng bộ)
**Precondition:** Đã cấu hình HubSpot API key trong hệ thống; tích hợp active

1. Hệ thống đồng bộ 2 chiều dữ liệu khách hàng từ/sang HubSpot:
   - Dữ liệu gói (Plan), giá từ ES Kitchen → HubSpot
   - Thông tin thiết bị (Tủ lạnh, số lượng) từ ES Kitchen → HubSpot
   - Thông tin Liên hệ (Contact) từ HubSpot → ES Kitchen
2. System Admin có thể xem trạng thái đồng bộ và kích hoạt đồng bộ thủ công nếu cần.

**TODO (BA):** Đồng bộ xảy ra tự động (scheduled job) hay chỉ khi có sự kiện cụ thể? Tần suất đồng bộ tự động là bao lâu? Cần màn hình cấu hình API key HubSpot trên UI hay chỉ qua Parameter Store?

---

### SF-15: Email Notification cho Supplier (E04)

**Actor:** E04 (nhận), hệ thống (gửi)
**Precondition:** Tài khoản E04 có email hợp lệ trong hồ sơ

1. Khi có sự kiện nghiệp vụ liên quan đến Supplier (đơn hàng mới, thay đổi lịch giao, xác nhận...), hệ thống tự động gửi email thông báo đến địa chỉ email của Supplier.
2. Email gửi qua AWS SES.

**TODO (BA):** Liệt kê đầy đủ các loại sự kiện trigger email cho E04? E04 có thể opt-out / cấu hình từng loại email không?

---

### SF-16: Operation Manual cho Supplier (E04)

**Actor:** E04
**Precondition:** Đã đăng nhập Supplier Web

1. E04 truy cập menu "Hướng dẫn sử dụng" (Operation Manual).
2. Hệ thống hiển thị tài liệu hướng dẫn thao tác dành cho Supplier.
3. E04 tải về file tài liệu.

**TODO (BA):** File tài liệu được quản lý ở đâu (upload trực tiếp trên hệ thống hay hard-link S3)? E03 có thể cập nhật file này không?

---

### SF-17: Email Notification cho Outsource/Driver (E05)

**Actor:** E05 (nhận), hệ thống (gửi)
**Precondition:** Tài khoản E05 có email hợp lệ

1. Khi có sự kiện nghiệp vụ liên quan đến đơn vị vận chuyển (lịch giao hàng, thay đổi lộ trình...), hệ thống tự động gửi email thông báo đến E05.
2. Email gửi qua AWS SES.

**TODO (BA):** Liệt kê đầy đủ các loại sự kiện trigger email cho E05? Gửi đến email cá nhân của driver hay email của công ty vận chuyển?

---

### SF-18: Operation Manual cho Outsource (E05)

**Actor:** E05
**Precondition:** Đã đăng nhập Outsource Web

1. E05 truy cập menu "Hướng dẫn sử dụng".
2. Hệ thống hiển thị tài liệu hướng dẫn dành cho đơn vị vận chuyển.
3. E05 tải về file.

---

### SF-19: Push Notification cho Driver (E06)

**Actor:** E06
**Precondition:** Đã đăng nhập Driver App; thiết bị đã đăng ký FCM token

1. Khi có sự kiện liên quan đến driver (đơn mới được phân công, thay đổi lộ trình, cảnh báo...), hệ thống gửi push notification qua Firebase Cloud Messaging đến thiết bị của driver.
2. Driver nhận thông báo trên thiết bị (foreground hoặc background).
3. Driver nhấn vào thông báo để điều hướng đến màn hình/nội dung liên quan.
4. Driver có thể xem lại lịch sử thông báo đã nhận trong Driver App.

**TODO (BA):** Liệt kê đầy đủ các loại sự kiện trigger push notification cho E06? Driver có thể tắt từng loại thông báo không (tương tự SF-01)?

---

## Alternative Flows & Edge Cases

| ID | Sub-feature | Scenario | Xử lý |
|---|---|---|---|
| AE-01 | SF-01 | User tắt quyền notification trên hệ điều hành (iOS/Android) | App không thể gửi push notification — hiển thị nhắc nhở bật lại quyền notification khi user vào màn hình cài đặt |
| AE-02 | SF-06 | Bật maintenance trong khi có user/admin đang thao tác | Xác nhận lần 2 với cảnh báo số session đang active; sau khi bật, session hiện tại bị force logout hoặc tiếp tục (cần confirm) |
| AE-03 | SF-08 | Xóa tài khoản đang có session active | Hệ thống force logout session, tài khoản không thể đăng nhập lại |
| AE-04 | SF-09 | Xóa Role đang được gán cho ít nhất 1 tài khoản | Từ chối xóa, hiển thị thông báo lỗi kèm danh sách tài khoản đang dùng Role |
| AE-05 | SF-09 | Tắt quyền của Role đang có user đang thao tác | Quyền bị thu hồi ở request kế tiếp (không retroactive với session hiện tại) — **TODO (BA):** confirm behavior |
| AE-06 | SF-12 | Gửi email hàng loạt thất bại (SES bounce/error) | Ghi log lỗi, retry logic, hiển thị trạng thái gửi email trong chi tiết thông báo |
| AE-07 | SF-14 | HubSpot API timeout hoặc lỗi xác thực | Ghi log lỗi, hiển thị trạng thái đồng bộ thất bại, cho phép retry thủ công |
| AE-08 | SF-19 | FCM token của driver đã hết hạn | Hệ thống tự cập nhật token mới khi driver đăng nhập lại; push notification không đến được đến khi token được renew |
| AE-09 | SF-07 | Kiểm tra version mobile | **TODO (BA):** Nếu có force-update, cần xác nhận flow từ chối user trên app khi chưa nâng cấp |

---

## Acceptance Criteria

### SF-01 — Cài đặt thông báo (E01)
- [ ] User có thể xem danh sách các loại thông báo có thể bật/tắt
- [ ] Toggle trạng thái Bật/Tắt được lưu và áp dụng ngay lập tức
- [ ] Thông báo thuộc loại đã tắt không được gửi đến thiết bị user
- [ ] Cài đặt được lưu per-user (không ảnh hưởng user khác)

### SF-02 — Nhắc nhở chốt đơn (E02)
- [ ] Thông báo được gửi tự động vào ngày 15 hàng tháng cho tất cả Company Admin có contract active
- [ ] Thông báo nhắc nhở đơn vật tư được gửi đúng theo lịch định kỳ đã cấu hình
- [ ] Company Admin nhận được thông báo qua kênh đã cấu hình

### SF-03 — Danh sách & Chi tiết thông báo (E02)
- [ ] Danh sách thông báo hiển thị đúng thứ tự thời gian (mới nhất trên cùng)
- [ ] Company Admin xem được nội dung đầy đủ của từng thông báo
- [ ] File đính kèm có thể tải về thành công
- [ ] Chỉ hiển thị thông báo được E03 phát hành có chọn đối tượng là Company/Pháp nhân

### SF-04 — HubSpot Chatbot (E02)
- [ ] Widget HubSpot hiển thị trên portal Company Admin sau khi đăng nhập
- [ ] User có thể mở widget và gửi câu hỏi
- [ ] Bot phản hồi hoặc chuyển sang agent hỗ trợ

### SF-06 — Maintenance Mode (E03)
- [ ] Danh sách lịch sử maintenance hiển thị đầy đủ: thời gian bật/tắt, người thực hiện, lý do
- [ ] System Admin bật maintenance thành công — các portal liên quan hiển thị trang bảo trì
- [ ] System Admin tắt maintenance — các portal trở lại hoạt động bình thường
- [ ] Hành động bật/tắt được ghi log với timestamp và user thực hiện

### SF-07 — Version Management (E03)
- [ ] Danh sách phiên bản mobile app hiển thị đầy đủ thông tin (version, build, ngày, môi trường, trạng thái)

### SF-08 — Quản lý tài khoản (E03)
- [ ] Danh sách hiển thị đầy đủ Admin, Supplier, Outsource với tìm kiếm và lọc hoạt động
- [ ] Thêm tài khoản mới thành công với thông tin hợp lệ
- [ ] Sửa thông tin và gán Role cho Admin thành công
- [ ] Tài khoản Supplier/Outsource được cấp full quyền mặc định (không chọn Role)
- [ ] Xóa/Vô hiệu hóa tài khoản thành công; tài khoản bị vô hiệu hóa không thể đăng nhập
- [ ] Thêm tài khoản với email đã tồn tại → hiển thị thông báo lỗi

### SF-09 — Phân quyền Role (E03)
- [ ] Bảng danh sách quyền hiển thị đúng theo Role (dạng tab)
- [ ] BẬT/TẮT hoặc CRUD từng chức năng theo Role lưu và áp dụng thành công
- [ ] Thêm Role mới thành công
- [ ] Đổi tên Role thành công
- [ ] Xóa Role không có tài khoản nào đang dùng → thành công
- [ ] Xóa Role đang được dùng → hiển thị lỗi kèm thông tin tài khoản liên quan

### SF-10 — Cá nhân hóa Dashboard (E03)
- [ ] Kéo thả sắp xếp thẻ hoạt động đúng
- [ ] Ẩn/hiện thẻ hoạt động đúng
- [ ] Cấu hình được lưu và áp dụng khi đăng nhập lại

### SF-11 — Dashboard chỉ số (E03)
- [ ] Hiển thị đúng số lượng yêu cầu từ HubSpot
- [ ] Hiển thị lịch xuất hàng/giao hàng trong tuần
- [ ] Hiển thị tỉ lệ hoàn thành giao hàng trong tuần

### SF-12 — Notification Management (E03)
- [ ] Danh sách thông báo hiển thị đầy đủ với filter theo đối tượng
- [ ] Tạo thông báo với tiêu đề, nội dung, file đính kèm thành công
- [ ] Thông báo gửi đến đúng đối tượng được chọn
- [ ] Email hàng loạt được gửi khi bật tùy chọn email (đến toàn bộ người phụ trách Pháp nhân)
- [ ] Sửa nội dung thông báo thành công
- [ ] Xóa thông báo thành công (với xác nhận)

### SF-13 — Operation Manual (E03)
- [ ] Danh sách tài liệu PDF hiển thị thành công
- [ ] Tải về file PDF thành công
- [ ] Menu này không hiển thị trên portal E02/E04/E05

### SF-14 — HubSpot API Integration (E03)
- [ ] Dữ liệu Plan/giá đồng bộ từ ES Kitchen sang HubSpot thành công
- [ ] Dữ liệu thiết bị đồng bộ từ ES Kitchen sang HubSpot thành công
- [ ] Thông tin Contact được lấy từ HubSpot về ES Kitchen thành công
- [ ] Trạng thái đồng bộ hiển thị trên UI (thành công / thất bại / đang chạy)
- [ ] Có thể kích hoạt đồng bộ thủ công

### SF-15 — Email cho Supplier (E04)
- [ ] Email được gửi tự động khi có sự kiện nghiệp vụ liên quan đến Supplier
- [ ] Email nhận được có nội dung chính xác, đúng Supplier
- [ ] Gửi thất bại được ghi log

### SF-16 — Operation Manual Supplier (E04)
- [ ] E04 có thể tải về tài liệu hướng dẫn từ portal Supplier

### SF-17 — Email cho Outsource (E05)
- [ ] Email được gửi tự động khi có sự kiện liên quan đến Outsource/Driver
- [ ] Email nhận được có nội dung chính xác

### SF-18 — Operation Manual Outsource (E05)
- [ ] E05 có thể tải về tài liệu hướng dẫn từ portal Outsource

### SF-19 — Push Notification Driver (E06)
- [ ] Push notification được gửi đến đúng driver khi có sự kiện liên quan
- [ ] Driver nhận được notification cả foreground và background
- [ ] Nhấn vào notification điều hướng đến màn hình đúng
- [ ] Driver xem được lịch sử thông báo đã nhận

---

## Out of Scope

- Tích hợp Yamato YBM / Sagawa Smart API (thuộc domain [GIAO HÀNG])
- Tích hợp Thomas (thuộc domain [TỒN KHO & THIẾT BỊ])
- Quản lý nội dung Operation Manual (upload/update file) — **TODO (BA):** xác nhận ai upload và qua kênh nào
- Push notification cho E01 (User Mobile) ngoài cài đặt toggle — chi tiết payload thuộc từng domain nghiệp vụ (Order, Delivery...)
- Firebase Analytics / Crashlytics
- SMTP custom server — hệ thống dùng AWS SES
- Quản lý template email (nội dung HTML của email) — **TODO (BA):** confirm có cần màn hình quản lý email template không

---

## Dependencies

| Dependency | Mô tả | Ảnh hưởng |
|---|---|---|
| IP Whitelist feature | SF-05 đã có SPEC riêng (`/features/ip-whitelist/SPEC.md`) | SPEC này không duplicate — Tech Lead cần merge vào DESIGN |
| Authentication feature | SF-08 tài khoản mới cần flow tạo mật khẩu / gửi invite email | Phụ thuộc `/features/authentication/SPEC.md` |
| HubSpot API key | SF-14 cần API key được cấu hình trước khi test | Cần phối hợp với client để lấy key |
| Firebase FCM | SF-01 và SF-19 cần FCM project được setup | Đã có trong Phase 1 (E01); E06 cần verify |
| AWS SES | SF-15, SF-17, SF-12 (email) cần SES đã cấu hình domain | Đã có infra từ Phase 1 |

---

## Screens

| Screen | Actor | App | Mô tả ngắn |
|---|---|---|---|
| Notification Settings | E01 | E01 (es-kitchen-payment-app) | Danh sách các loại thông báo, toggle Bật/Tắt từng loại |
| Announcements List | E02 | E02 (es-kitchen-web-company) | Danh sách thông báo hệ thống từ ES Kitchen, sắp xếp theo thời gian mới nhất |
| Announcement Detail | E02 | E02 (es-kitchen-web-company) | Nội dung đầy đủ thông báo, file đính kèm, tải về |
| Dashboard | E03 | E03 (es-kitchen-web-admin) | Hiển thị chỉ số HubSpot, lịch giao hàng trong tuần, tỉ lệ hoàn thành giao hàng |
| Dashboard Personalization | E03 | E03 (es-kitchen-web-admin) | Kéo thả sắp xếp lại thẻ dashboard, ẩn/hiện thẻ, lưu cấu hình per-user |
| Maintenance Management List | E03 | E03 (es-kitchen-web-admin) | Lịch sử bật/tắt maintenance: thời gian, người thực hiện, lý do |
| Maintenance Create/Edit | E03 | E03 (es-kitchen-web-admin) | Tạo maintenance mới: nhập lý do, thời gian dự kiến, bật/tắt chế độ bảo trì |
| Version Management List | E03 | E03 (es-kitchen-web-admin) | Danh sách phiên bản mobile app: version name, build number, ngày, môi trường, trạng thái |
| Account Management List | E03 | E03 (es-kitchen-web-admin) | Danh sách tài khoản Admin/Supplier/Outsource, tìm kiếm và lọc theo loại/tên/trạng thái |
| Account Create/Edit | E03 | E03 (es-kitchen-web-admin) | Tạo/chỉnh sửa tài khoản, gán Role cho Admin, cấp quyền mặc định cho Supplier/Outsource |
| Role & Permission Management | E03 | E03 (es-kitchen-web-admin) | Bảng phân quyền theo Role (dạng tab), bật/tắt CRUD từng chức năng, thêm/đổi tên/xóa Role |
| Notification Management List | E03 | E03 (es-kitchen-web-admin) | Danh sách thông báo nội bộ và đối tác, lọc theo đối tượng nhận |
| Notification Create/Edit | E03 | E03 (es-kitchen-web-admin) | Tạo/chỉnh sửa thông báo: tiêu đề, nội dung, file đính kèm, chọn đối tượng nhận, tùy chọn gửi email |
| Notification Detail (E03) | E03 | E03 (es-kitchen-web-admin) | Xem chi tiết thông báo, trạng thái gửi email, tùy chọn sửa/xóa |
| Operation Manual (E03) | E03 | E03 (es-kitchen-web-admin) | Danh sách tài liệu PDF nội bộ, tải về file hướng dẫn sử dụng |
| HubSpot Sync Management | E03 | E03 (es-kitchen-web-admin) | Trạng thái đồng bộ 2 chiều với HubSpot, kích hoạt đồng bộ thủ công *inferred |
| Operation Manual (E04) | E04 | E04 (es-kitchen-web-supplier) | Tài liệu hướng dẫn dành cho Supplier, tải về file |
| Operation Manual (E05) | E05 | E05 (es-kitchen-web-outsource-web-private) | Tài liệu hướng dẫn dành cho đơn vị vận chuyển, tải về file |
| Notification History (E06) | E06 | E06 (es-kitchen-webapp-driver) | Lịch sử thông báo push notification đã nhận, điều hướng đến nội dung liên quan |

---

## Bước tiếp theo

**Handover:**

- Tech Lead Design: "Hãy là Tech Lead Design, làm DESIGN.md từ SPEC này: `/Users/longtd/Desktop/WORK/AI_AGENTS_ES_KITCHEN/es-kitchen-docs/docs/features/system-other/SPEC.md`"
- QC (song song): "Hãy là QC, sinh test cases từ SPEC này: `/Users/longtd/Desktop/WORK/AI_AGENTS_ES_KITCHEN/es-kitchen-docs/docs/features/system-other/SPEC.md`" (hoặc slash command `/test/generate_manual_testcases_rbt`)

**Pending BA actions (trước khi handover):**
- Trả lời toàn bộ các `TODO (BA)` được đánh dấu inline — đặc biệt SF-02, SF-06, SF-07, SF-12, SF-14, SF-15, SF-17, SF-19
- Xác nhận behavior maintenance mode: portal nào bị ảnh hưởng
- Xác nhận flow quản lý file Operation Manual (ai upload, từ đâu)
→ "Hãy là Designer, tạo UI-SPEC.md + Figma từ SPEC này: es-kitchen-docs/docs/features/system-other/SPEC.md"
  (hoặc slash command: /create-ui-design es-kitchen-docs/docs/features/system-other/SPEC.md)
