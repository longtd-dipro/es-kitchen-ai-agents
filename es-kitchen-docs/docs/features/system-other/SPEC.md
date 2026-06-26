# SPEC: System Other (System Settings & Common)

> **Domain:** BF_[SYSTEM & OTHER] Cấu hình Hệ thống & Tích hợp
> **Backlog ID:** ESKITCHEN-1249
> **Phase:** Phase 2
> **SPEC Transfer:** False (chưa chuyển — tạo mới từ business flow)
> **Cập nhật:** 2026-06-25 (Q&A v1 resolved)

---

## Mô tả nghiệp vụ

Domain này bao gồm toàn bộ các tính năng vận hành nền tảng và cấu hình hệ thống, không thuộc nghiệp vụ chức năng cốt lõi (order/delivery/payment). Cụ thể:

- **Notification & Communication:** Cấu hình thông báo đẩy (push notification) tổng cho user mobile; gửi nhắc nhở tự động qua in-app + email; quản lý và phát hành thông báo nội bộ đến các đối tượng khác nhau.
- **System Administration (E03):** Quản lý tài khoản và phân quyền theo Role; IP whitelist + OTP 2FA; bật/tắt chế độ bảo trì (maintenance mode) — ảnh hưởng toàn bộ portal kể cả E03; quản lý phiên bản mobile app (CRUD + force-update); tích hợp API HubSpot; quản lý email chiến dịch thủ công.
- **Email Notifications:** Gửi email tự động cho Supplier (E04) và Carrier (E05) theo sự kiện nghiệp vụ; push notification cho Driver (E06).

> **Bỏ (per Q&A v1):** SF-10 Cá nhân hóa Dashboard, SF-11 Dashboard chỉ số HubSpot, Operation Manual cho tất cả portal (E03/E04/E05).

---

## Actors & Preconditions

### Actors liên quan

| Actor | Portal | Vai trò trong domain này |
|---|---|---|
| **E01** — End User (Mobile) | Flutter App | Bật/tắt push notification tổng (không phân loại từng loại) |
| **E02** — Company Admin | Web | Xem danh sách thông báo từ ES Kitchen; xem chi tiết + tải file đính kèm; nhận nhắc nhở chốt đơn (in-app + email) |
| **E03** — System Admin | Web | Toàn bộ quản trị hệ thống: tài khoản, phân quyền, IP whitelist, maintenance, version mobile, notification management, HubSpot API, email management |
| **E04** — Supplier | Web | Nhận email thông báo tự động (không thể tắt) |
| **E05** — Carrier Web | Web | Nhận email thông báo tự động qua email công ty |
| **E06** — Driver App | ReactJS Web App | Nhận push notification (không thể tắt) |

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
2. Hệ thống hiển thị tùy chọn **bật/tắt push notification tổng** (không phân theo từng loại sự kiện riêng).
3. User toggle Bật/Tắt push notification.
4. Hệ thống lưu trạng thái cài đặt per-user.
5. Khi đã tắt, mọi push notification đều không được gửi tới thiết bị user.

---

### SF-02: Nhắc nhở chốt đơn hàng (E02 — Company Admin)

**Actor:** E02 (nhận thông báo), hệ thống (tự động gửi)
**Precondition:** Company có hợp đồng active; đến ngày 15 hàng tháng (lịch chốt cố định toàn hệ thống)

1. Hệ thống tự động gửi thông báo nhắc nhở đến Company Admin vào ngày 15 hàng tháng để chốt đơn hàng tháng tiếp theo.
2. Hệ thống gửi qua **cả hai kênh**: in-app notification và email.
3. Lịch chốt đơn vật tư là **cố định toàn hệ thống** (không cấu hình riêng theo từng company).

---

### SF-03: Danh sách & Chi tiết thông báo hệ thống (E02 — Company Admin)

**Actor:** E02
**Precondition:** Đã đăng nhập; có thông báo được E03 phát hành

1. Company Admin truy cập menu "Thông báo" (Announcements).
2. Hệ thống hiển thị danh sách thông báo từ ES Kitchen theo thứ tự thời gian mới nhất.
3. Company Admin chọn một thông báo để xem chi tiết.
4. Hệ thống hiển thị nội dung đầy đủ và file đính kèm (nếu có).
5. Company Admin tải về file đính kèm nếu cần.

> **Đã xác nhận:** Không có phân loại category/tag. Không phân biệt trạng thái đã đọc/chưa đọc.

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
4. Hệ thống chuyển **tất cả portal** về trạng thái maintenance — hiển thị trang thông báo bảo trì cho user, **bao gồm cả E03** (System Admin cũng bị ảnh hưởng).
5. System Admin tắt maintenance khi xong việc — hệ thống trở lại hoạt động bình thường.

---

### SF-07: Quản lý phiên bản Mobile App (E03 — System Admin)

**Actor:** E03
**Precondition:** Đã đăng nhập

1. System Admin truy cập menu "Quản lý phiên bản" (Version Management).
2. Hệ thống hiển thị danh sách các phiên bản Mobile App (version name, build number, ngày phát hành, môi trường DEV/STG/PROD, trạng thái).
3. System Admin có thể **Thêm/Sửa/Xóa** bản ghi phiên bản (CRUD đầy đủ).
4. Mỗi phiên bản có thể liên kết **force-update**: khi bật, app cũ bắt buộc nâng cấp khi mở.
5. Nếu user từ chối force-update → **app tắt, không thể tiếp tục sử dụng** cho đến khi nâng cấp đúng phiên bản.

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

**Xóa tài khoản:**
1. System Admin chọn tài khoản cần xóa.
2. Nhấn "Xóa" và xác nhận hành động.
3. Hệ thống thực hiện **hard delete** — xóa vĩnh viễn, **không kích hoạt lại được**.
4. Tài khoản bị xóa không còn đăng nhập được và không xuất hiện trong danh sách.

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

### SF-10: ~~Cá nhân hóa Dashboard~~ — **BỎ**

> **Đã bỏ theo Q&A v1 (SYS-07).** Feature này không còn trong scope Phase 2.

---

### SF-11: ~~Dashboard — Danh sách chỉ số~~ — **BỎ**

> **Đã bỏ theo Q&A v1 (SYS-08).** Feature này không còn trong scope Phase 2.

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

**Xóa thông báo:**
1. System Admin chọn thông báo từ danh sách.
2. Nhấn "Xóa" và xác nhận.
3. Hệ thống xóa thông báo — thông báo **bị ẩn trên portal E02** ngay lập tức.

> **Đã xác nhận:** Thông báo **đã phát hành không thể sửa**, nhưng **có thể xóa**. Khi xóa → ẩn ngay trên E02.

---

### SF-13: ~~Operation Manual (E03)~~ — **BỎ**

> **Đã bỏ theo Q&A v1 (SYS-12/SYS-17).** Không có operation manual trong hệ thống.

---

### SF-14: Tích hợp HubSpot API 2 chiều (E03 — System Admin)

**Actor:** E03 (cấu hình), hệ thống (đồng bộ)
**Precondition:** Đã cấu hình HubSpot API key trong hệ thống; tích hợp active

1. Hệ thống đồng bộ 2 chiều dữ liệu khách hàng từ/sang HubSpot:
   - Dữ liệu gói (Plan), giá từ ES Kitchen → HubSpot
   - Thông tin thiết bị (Tủ lạnh, số lượng) từ ES Kitchen → HubSpot
   - Thông tin Liên hệ (Contact) từ HubSpot → ES Kitchen
2. System Admin có thể xem trạng thái đồng bộ và kích hoạt đồng bộ thủ công nếu cần.

**TODO (BA) — SYS-10:** Đồng bộ xảy ra tự động (scheduled job) hay chỉ khi có sự kiện cụ thể? Tần suất đồng bộ tự động là bao lâu? Cần màn hình cấu hình API key HubSpot trên UI hay chỉ qua Parameter Store?

---

### SF-15: Email Notification cho Supplier (E04)

**Actor:** E04 (nhận), hệ thống (gửi)
**Precondition:** Tài khoản E04 có email hợp lệ trong hồ sơ

1. Khi có sự kiện nghiệp vụ liên quan đến Supplier, hệ thống tự động gửi email thông báo đến địa chỉ email của Supplier.
2. Email gửi qua AWS SES.

**Danh sách sự kiện trigger (dự kiến — cần confirm final với client):**
- Có đơn đặt hàng mới từ E03
- Đơn bị hủy
- Yêu cầu báo giá
- Thanh toán được xác nhận

> **Đã xác nhận:** E04 **không thể tắt** (opt-out) bất kỳ loại email nào.

---

### SF-16: ~~Operation Manual cho Supplier (E04)~~ — **BỎ**

> **Đã bỏ theo Q&A v1 (SYS-12/SYS-17).** Không có operation manual trong hệ thống.

---

### SF-17: Email Notification cho Carrier (E05)

**Actor:** E05 (nhận), hệ thống (gửi)
**Precondition:** Tài khoản E05 có email công ty hợp lệ

1. Khi có sự kiện nghiệp vụ liên quan đến đơn vị vận chuyển, hệ thống tự động gửi email thông báo.
2. Email gửi đến **email của công ty vận chuyển** (không phải email cá nhân driver).
3. Email gửi qua AWS SES.

**Danh sách sự kiện trigger (dự kiến — cần confirm final với client):**
- Lịch giao hàng mới
- Phương thức vận chuyển cập nhật
- Lịch giao hàng bị thay đổi
- Thông báo bảo trì hệ thống

---

### SF-18: ~~Operation Manual cho Carrier (E05)~~ — **BỎ**

> **Đã bỏ theo Q&A v1 (SYS-12/SYS-17).** Không có operation manual trong hệ thống.

---

### SF-19: Push Notification cho Driver (E06)

**Actor:** E06
**Precondition:** Đã đăng nhập Driver App; thiết bị đã đăng ký FCM token

1. Khi có sự kiện liên quan đến driver, hệ thống gửi push notification qua Firebase Cloud Messaging đến thiết bị của driver.
2. Driver nhận thông báo trên thiết bị (foreground hoặc background).
3. Driver nhấn vào thông báo để điều hướng đến màn hình/nội dung liên quan.
4. Driver xem lịch sử thông báo đã nhận trong Driver App.

**Danh sách sự kiện trigger (dự kiến — cần confirm final với client):**
- Có đơn hàng mới được phân công
- Lịch giao hàng bị thay đổi
- Thông báo bảo trì hệ thống

> **Đã xác nhận:** Driver **không thể tắt** push notification.

---

### SF-20: Quản lý Email (Tạo chiến dịch thủ công — E03)

**Actor:** E03
**Precondition:** Đã đăng nhập với quyền quản lý email

1. System Admin truy cập màn hình "Quản lý Email".
2. System Admin tạo chiến dịch thông báo email thủ công: nhập tiêu đề, nội dung, chọn đối tượng nhận.
3. Gửi email chiến dịch tới danh sách đối tượng được chọn.
4. Hệ thống ghi nhận lịch sử chiến dịch email đã gửi.

---

## Alternative Flows & Edge Cases

| ID | Sub-feature | Scenario | Xử lý |
|---|---|---|---|
| AE-01 | SF-01 | User tắt quyền notification trên hệ điều hành (iOS/Android) | App không thể gửi push notification — hiển thị nhắc nhở bật lại quyền notification khi user vào màn hình cài đặt |
| AE-02 | SF-06 | Bật maintenance trong khi có user/admin đang thao tác | Xác nhận lần 2 với cảnh báo số session đang active; sau khi bật, tất cả portal (bao gồm E03) hiển thị trang bảo trì |
| AE-03 | SF-08 | Xóa tài khoản đang có session active | Hệ thống force logout session, tài khoản bị hard delete vĩnh viễn |
| AE-04 | SF-09 | Xóa Role đang được gán cho ít nhất 1 tài khoản | Từ chối xóa, hiển thị thông báo lỗi kèm danh sách tài khoản đang dùng Role |
| AE-05 | SF-09 | Admin tắt quyền của Role đang có user đang thao tác | Hệ thống **xóa cache quyền + force logout tất cả session active** của user thuộc Role đó. User đăng nhập lại sẽ load quyền mới. |
| AE-06 | SF-12 | Gửi email hàng loạt thất bại (SES bounce/error) | Ghi log lỗi, retry logic, hiển thị trạng thái gửi email trong chi tiết thông báo |
| AE-07 | SF-14 | HubSpot API timeout hoặc lỗi xác thực | Ghi log lỗi, hiển thị trạng thái đồng bộ thất bại, cho phép retry thủ công |
| AE-08 | SF-19 | FCM token của driver đã hết hạn | Hệ thống tự cập nhật token mới khi driver đăng nhập lại; push notification không đến được đến khi token được renew |
| AE-09 | SF-07 | User từ chối force-update | App tắt ngay lập tức — user không thể tiếp tục sử dụng cho đến khi nâng cấp đúng phiên bản |

---

## Acceptance Criteria

### SF-01 — Cài đặt thông báo (E01)
- [ ] User có thể toggle bật/tắt push notification tổng (không phân loại từng sự kiện)
- [ ] Khi tắt, mọi push notification đều không được gửi tới thiết bị user
- [ ] Cài đặt được lưu per-user (không ảnh hưởng user khác)

### SF-02 — Nhắc nhở chốt đơn (E02)
- [ ] Thông báo được gửi tự động vào ngày 15 hàng tháng cho tất cả Company Admin có contract active
- [ ] Thông báo gửi qua cả in-app notification và email
- [ ] Lịch chốt cố định toàn hệ thống (không thể cấu hình riêng theo company)

### SF-03 — Danh sách & Chi tiết thông báo (E02)
- [ ] Danh sách thông báo hiển thị đúng thứ tự thời gian (mới nhất trên cùng)
- [ ] Company Admin xem được nội dung đầy đủ của từng thông báo
- [ ] File đính kèm có thể tải về thành công
- [ ] Không có phân loại category/tag; không có trạng thái đã đọc/chưa đọc
- [ ] Chỉ hiển thị thông báo được E03 phát hành có chọn đối tượng là Company/Pháp nhân

### SF-04 — HubSpot Chatbot (E02)
- [ ] Widget HubSpot hiển thị trên portal Company Admin sau khi đăng nhập
- [ ] User có thể mở widget và gửi câu hỏi
- [ ] Bot phản hồi hoặc chuyển sang agent hỗ trợ

### SF-06 — Maintenance Mode (E03)
- [ ] Danh sách lịch sử maintenance hiển thị đầy đủ: thời gian bật/tắt, người thực hiện, lý do
- [ ] System Admin bật maintenance thành công — **tất cả portal** (E01/E02/E03/E04/E05/E06) đều hiển thị trang bảo trì
- [ ] System Admin tắt maintenance — các portal trở lại hoạt động bình thường
- [ ] Hành động bật/tắt được ghi log với timestamp và user thực hiện

### SF-07 — Version Management (E03)
- [ ] Danh sách phiên bản mobile app hiển thị đầy đủ thông tin (version, build, ngày, môi trường, trạng thái)
- [ ] System Admin có thể Thêm/Sửa/Xóa bản ghi phiên bản (CRUD)
- [ ] Bật force-update cho phiên bản → app cũ bắt buộc nâng cấp khi mở
- [ ] User từ chối force-update → app tắt, không sử dụng được cho đến khi nâng cấp

### SF-08 — Quản lý tài khoản (E03)
- [ ] Danh sách hiển thị đầy đủ Admin, Supplier, Carrier với tìm kiếm và lọc hoạt động
- [ ] Thêm tài khoản mới thành công với thông tin hợp lệ
- [ ] Sửa thông tin và gán Role cho Admin thành công
- [ ] Tài khoản Supplier/Carrier được cấp full quyền mặc định (không chọn Role)
- [ ] Xóa tài khoản → **hard delete** vĩnh viễn; tài khoản không thể đăng nhập và không kích hoạt lại được
- [ ] Thêm tài khoản với email đã tồn tại → hiển thị thông báo lỗi

### SF-09 — Phân quyền Role (E03)
- [ ] Bảng danh sách quyền hiển thị đúng theo Role (dạng tab)
- [ ] BẬT/TẮT hoặc CRUD từng chức năng theo Role lưu và áp dụng thành công
- [ ] Thêm Role mới thành công
- [ ] Đổi tên Role thành công
- [ ] Xóa Role không có tài khoản nào đang dùng → thành công
- [ ] Xóa Role đang được dùng → hiển thị lỗi kèm thông tin tài khoản liên quan
- [ ] Tắt quyền Role → **force logout tất cả session active** của user thuộc Role đó + xóa cache quyền ngay lập tức; user đăng nhập lại sẽ load quyền mới

### SF-12 — Notification Management (E03)
- [ ] Danh sách thông báo hiển thị đầy đủ với filter theo đối tượng
- [ ] Tạo thông báo với tiêu đề, nội dung, file đính kèm thành công
- [ ] Thông báo gửi đến đúng đối tượng được chọn
- [ ] Email hàng loạt được gửi khi bật tùy chọn email
- [ ] Thông báo đã phát hành **không thể sửa** (nút sửa không hiển thị hoặc bị disabled)
- [ ] Xóa thông báo thành công → thông báo ẩn khỏi portal E02 ngay lập tức

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
- [ ] E04 không có tùy chọn opt-out email

### SF-17 — Email cho Carrier (E05)
- [ ] Email được gửi tự động khi có sự kiện liên quan đến Carrier
- [ ] Email gửi đến **email của công ty vận chuyển** (không phải email cá nhân driver)
- [ ] Email nhận được có nội dung chính xác

### SF-19 — Push Notification Driver (E06)
- [ ] Push notification được gửi đến đúng driver khi có sự kiện liên quan
- [ ] Driver nhận được notification cả foreground và background
- [ ] Nhấn vào notification điều hướng đến màn hình đúng
- [ ] Driver xem được lịch sử thông báo đã nhận
- [ ] E06 không có tùy chọn tắt notification

### SF-20 — Email Management (E03)
- [ ] System Admin tạo chiến dịch email thủ công thành công
- [ ] Email gửi đến đúng đối tượng được chọn
- [ ] Lịch sử chiến dịch email hiển thị đầy đủ

---

## Out of Scope

- Tích hợp Yamato YBM / Sagawa Smart API (thuộc domain [GIAO HÀNG])
- Tích hợp Thomas (thuộc domain [TỒN KHO & THIẾT BỊ])
- Operation Manual (tất cả portal) — **đã bỏ per Q&A v1 (SYS-12/SYS-17)**
- Cá nhân hóa Dashboard (SF-10) — **đã bỏ per Q&A v1 (SYS-07)**
- Dashboard chỉ số HubSpot (SF-11) — **đã bỏ per Q&A v1 (SYS-08)**
- Push notification cho E01 ngoài cài đặt toggle — chi tiết payload thuộc từng domain nghiệp vụ (Order, Delivery...)
- Firebase Analytics / Crashlytics
- SMTP custom server — hệ thống dùng AWS SES

---

## Dependencies

| Dependency | Mô tả | Ảnh hưởng |
|---|---|---|
| IP Whitelist feature | SF-05 đã có SPEC riêng (`/features/ip-whitelist/SPEC.md`) | SPEC này không duplicate — Tech Lead cần merge vào DESIGN |
| Authentication feature | SF-08 tài khoản mới cần flow tạo mật khẩu / gửi invite email | Phụ thuộc `/features/authentication/SPEC.md` |
| HubSpot API key | SF-14 cần API key được cấu hình trước khi test | Cần phối hợp với client để lấy key |
| Firebase FCM | SF-01 và SF-19 cần FCM project được setup | Đã có trong Phase 1 (E01); E06 cần verify |
| AWS SES | SF-15, SF-17, SF-12, SF-20 (email) cần SES đã cấu hình domain | Đã có infra từ Phase 1 |

---

## Screens

| Screen Code | Screen | Actor | App | Screen Type | Mô tả ngắn |
|---|---|---|---|---|---|
| UA_SYSO_001 | Notification Settings | E01 | E01 (es-kitchen-payment-app) | Settings | Toggle bật/tắt push notification tổng |
| CW_SYSO_001 | Announcements List | E02 | E02 (es-kitchen-web-company) | List | Danh sách thông báo hệ thống từ ES Kitchen, sắp xếp theo thời gian mới nhất |
| CW_SYSO_002 | Announcement Detail | E02 | E02 (es-kitchen-web-company) | Detail | Nội dung đầy đủ thông báo, file đính kèm, tải về |
| AW_SYSO_003 | Maintenance Management List | E03 | E03 (es-kitchen-web-admin) | List | Lịch sử bật/tắt maintenance: thời gian, người thực hiện, lý do |
| AW_SYSO_004 | Maintenance Create/Edit | E03 | E03 (es-kitchen-web-admin) | Form | Tạo maintenance mới: nhập lý do, thời gian dự kiến, bật/tắt chế độ bảo trì toàn portal |
| AW_SYSO_005 | Version Management List | E03 | E03 (es-kitchen-web-admin) | List | Danh sách phiên bản mobile app: CRUD đầy đủ + bật/tắt force-update |
| AW_SYSO_006 | Account Management List | E03 | E03 (es-kitchen-web-admin) | List | Danh sách tài khoản Admin/Supplier/Carrier, tìm kiếm và lọc theo loại/tên/trạng thái |
| AW_SYSO_007 | Account Create/Edit | E03 | E03 (es-kitchen-web-admin) | Form | Tạo/chỉnh sửa tài khoản, gán Role cho Admin, cấp quyền mặc định cho Supplier/Carrier |
| AW_SYSO_008 | Role & Permission Management | E03 | E03 (es-kitchen-web-admin) | Settings | Bảng phân quyền theo Role (dạng tab), bật/tắt CRUD từng chức năng, thêm/đổi tên/xóa Role |
| AW_SYSO_009 | Notification Management List | E03 | E03 (es-kitchen-web-admin) | List | Danh sách thông báo nội bộ và đối tác, lọc theo đối tượng nhận |
| AW_SYSO_010 | Notification Create | E03 | E03 (es-kitchen-web-admin) | Form | Tạo thông báo: tiêu đề, nội dung, file đính kèm, chọn đối tượng nhận, tùy chọn gửi email |
| AW_SYSO_011 | Notification Detail (E03) | E03 | E03 (es-kitchen-web-admin) | Detail | Xem chi tiết thông báo, trạng thái gửi email, xóa thông báo (không sửa) |
| AW_SYSO_012 | HubSpot Sync Management | E03 | E03 (es-kitchen-web-admin) | Detail* | Trạng thái đồng bộ 2 chiều với HubSpot, kích hoạt đồng bộ thủ công *inferred |
| AW_SYSO_013 | Email Management | E03 | E03 (es-kitchen-web-admin) | List/Form | Tạo chiến dịch email thủ công, xem lịch sử chiến dịch đã gửi |
| DA_SYSO_001 | Notification History (E06) | E06 | E06 (es-kitchen-webapp-driver) | List | Lịch sử thông báo push notification đã nhận, điều hướng đến nội dung liên quan |

> **Đã bỏ:** AW_SYSO_001 (Dashboard HubSpot metrics), AW_SYSO_002 (Dashboard Personalization), Operation Manual screens (E03/E04/E05)

---

## Bước tiếp theo

**Handover:**

- Tech Lead Design: "Hãy là Tech Lead Design, làm DESIGN.md từ SPEC này: `es-kitchen-docs/docs/features/system-other/SPEC.md`"
- QC (song song): "Hãy là QC, sinh test cases từ SPEC này: `es-kitchen-docs/docs/features/system-other/SPEC.md`" (hoặc slash command `/test/generate_manual_testcases_rbt`)

**Pending BA actions:**
- **SYS-10:** Xác nhận HubSpot sync: auto hay event-driven? Tần suất? API key qua UI hay Parameter Store?
- Confirm danh sách event trigger email E04, email E05, push E06 (hiện đang là dự kiến)

→ "Hãy là Designer, tạo UI-SPEC.md + Figma từ SPEC này: es-kitchen-docs/docs/features/system-other/SPEC.md"
  (hoặc slash command: /create-ui-design es-kitchen-docs/docs/features/system-other/SPEC.md)
