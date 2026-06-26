# SPEC: Giao hàng - Web Đối tác Vận chuyển (Delivery Partner)

> Backlog ID: ESKITCHEN-1237
> Domain: `giao-hang-doi-tac`
> Phase: 2 (toàn bộ 16 stories đều Priority 2)
> Actor chính: **E05** — Contract Delivery Destination (Công ty vận chuyển / Outsource Admin)

---

## Mô tả nghiệp vụ

Web portal dành riêng cho **công ty vận chuyển được ủy thác** (outsource delivery partner). Mục tiêu: cho phép đối tác vận chuyển tự quản lý danh sách giao hàng được giao, theo dõi trạng thái từng lô hàng, phân công tài xế nội bộ của họ, và tra cứu báo cáo thu tiền — tất cả không cần thông qua nhân viên vận hành của ES Kitchen.

Hệ thống này là cầu nối giữa **ES Kitchen (System Admin / E03)** và **tài xế thực tế (E06)** — đối tác không thấy dữ liệu kinh doanh của ES Kitchen, chỉ thấy phần việc được ủy thác.

**Repo liên quan:** `es-kitchen-web-outsource-web-private` (E05 portal) + `es-kitchen-api` (backend data)

---

## Actors & Preconditions

| Actor | Vai trò | Precondition |
|---|---|---|
| **E05** — Outsource Admin (Delivery Partner) | Actor chính — đăng nhập, quản lý toàn bộ nghiệp vụ trong portal | Có tài khoản được System Admin (E03) cấp; đã đổi mật khẩu lần đầu |
| **E03** — System Admin | Cấp tài khoản cho đối tác; gửi thông báo | Ngoài phạm vi SPEC này |
| **E06** — Driver | Nhân viên giao hàng được đối tác đăng ký vào hệ thống | Được E05 tạo trước khi phân công |

**Preconditions chung:**
- E05 đã có tài khoản hợp lệ (ID / mật khẩu) do E03 cấp.
- Dữ liệu đơn hàng được ủy thác đã tồn tại phía API (do luồng [GIAO HÀNG] Lịch trình & Điều phối tạo ra).

**[Confirmed]:** Tài khoản E05 do **E03 (System Admin) cấp thủ công** — không có flow tự đăng ký.

**[Confirmed]:** Portal có phân role nội bộ: **1 main admin** và **nhiều sub admin** trong cùng tài khoản đối tác.

---

## Happy Path

### F01 — Đăng nhập / Đăng xuất / Quên mật khẩu

**Luồng đăng nhập:**
1. E05 truy cập portal, nhập ID và mật khẩu.
2. Hệ thống xác thực, chuyển đến màn hình TOP.
3. E05 chọn "Đăng xuất" → hệ thống huỷ session, chuyển về màn hình đăng nhập.

**Luồng quên mật khẩu:**
1. E05 chọn "Quên mật khẩu" từ màn hình đăng nhập.
2. Nhập địa chỉ email đăng ký.
3. Hệ thống gửi link đặt lại mật khẩu qua email.
4. E05 click link, nhập mật khẩu mới, xác nhận.

---

### F02 — Màn hình TOP

1. Sau khi đăng nhập, E05 thấy màn hình TOP với:
   - Danh sách thông báo (announcement list) — hiển thị tiêu đề, ngày, trạng thái đã đọc/chưa.
   - Các thông tin quan trọng khác (shortcut đến quản lý giao hàng, quản lý thu tiền).
2. E05 click vào một thông báo → xem chi tiết thông báo.
3. Trong màn hình chi tiết thông báo, E05 có thể tải xuống file đính kèm (nếu có).

---

### F03 — Quản lý trạng thái giao hàng (Delivery Status Management)

**Tìm kiếm:**
1. E05 vào mục "Quản lý trạng thái giao hàng".
2. Nhập tiêu chí tìm kiếm: tháng/năm giao hàng, ngày giao hàng cụ thể, trạng thái, nhân viên giao hàng.
3. Hệ thống hiển thị danh sách kết quả.

**Xem danh sách:**
4. Danh sách hiển thị mặc định theo ngày/tháng hiện tại.
5. Mỗi mục hiển thị: trạng thái (Chưa xác định / Đang chuẩn bị / Đã sắp xếp xuất hàng / Hoàn tất), mã vận đơn cho từng thùng carton.

**Phân công nhân viên giao hàng:**
6. E05 chọn một đơn trong danh sách.
7. Chọn nhân viên giao hàng từ dropdown (danh sách E06 đã đăng ký).
8. Lưu phân công.

**Xem chi tiết:**
9. E05 click vào một đơn → xem chi tiết chia theo tab:
   - Tab 1: Địa chỉ giao hàng
   - Tab 2: Thông tin điểm trung chuyển
   - Tab 3: Thông tin hàng hóa
   - Tab 4: Thông tin báo cáo

---

### F04 — Quản lý danh sách số tiền thu (Collected Amount Management)

**Tìm kiếm:**
1. E05 vào mục "Số tiền thu".
2. Tìm kiếm bằng: ngày giao hàng, tên nhân viên giao hàng.
3. Hệ thống hiển thị danh sách tổng hợp.

**Xem danh sách:**
4. Danh sách hiển thị tổng số tiền thu của mỗi nhân viên giao hàng.

**Xem chi tiết cá nhân:**
5. E05 click vào một nhân viên → xem chi tiết số tiền thu cá nhân.
6. Trang chi tiết hiển thị kèm hình ảnh biên lai và báo cáo đỗ xe đính kèm.

**Tải CSV:**
7. E05 click "Tải CSV" → hệ thống xuất file CSV dữ liệu danh sách số tiền thu.

---

### F05 — Quản lý nhân viên giao hàng (Delivery Staff Management)

**Tìm kiếm:**
1. E05 vào mục "Nhân viên giao hàng".
2. Tìm kiếm bằng: tên, phân loại. Có option check để hiển thị cả dữ liệu đã xóa.
3. Hệ thống hiển thị danh sách.

**Xem danh sách:**
4. Danh sách hiển thị: tên nhân viên, phân loại, đánh giá (rating), nút xóa.

**Đăng ký nhân viên mới:**
5. E05 click "Đăng ký mới".
6. Nhập thông tin: tên nhân viên, phân loại và các thông tin cần thiết khác.
7. Tải lên hình ảnh giấy phép lái xe.
8. Lưu → nhân viên xuất hiện trong danh sách.

**Chỉnh sửa / Xóa:**
9. E05 click vào nhân viên → chỉnh sửa thông tin và lưu.
10. Hoặc nhấn nút "Xóa" → xác nhận → nhân viên bị xóa (soft delete, vẫn tìm được khi check "hiển thị đã xóa").

---

### F06 — Thay đổi mật khẩu

1. E05 vào mục "Thay đổi mật khẩu".
2. Nhập mật khẩu hiện tại, mật khẩu mới, xác nhận mật khẩu mới.
3. Lưu → hệ thống cập nhật mật khẩu, thông báo thành công.

---

## Alternative Flows & Edge Cases

### Auth
- **Sai mật khẩu nhiều lần:** Hiển thị thông báo lỗi rõ ràng. **Không có lockout** — tài khoản không bị khóa dù nhập sai nhiều lần.
- **Link quên mật khẩu hết hạn:** Hiển thị thông báo, cho phép yêu cầu lại.
- **Session hết hạn:** Tự redirect về trang đăng nhập, bảo toàn URL trước đó để redirect sau khi login lại.

### Delivery Status
- **Không có đơn hàng nào trong khoảng tìm kiếm:** Hiển thị empty state rõ ràng (không phải blank page).
- **Đơn đã ở trạng thái "Hoàn tất":** Nút phân công nhân viên bị disable — không thể thay đổi.
- **Nhân viên được chọn đã bị xóa (soft delete):** Không hiện trong dropdown phân công; nếu đã được phân công trước khi xóa thì vẫn hiển thị tên trong lịch sử.

### Collected Amount
- **Không có dữ liệu thu tiền:** Empty state, không phải lỗi.
- **File đính kèm biên lai không tải được:** Hiển thị thông báo lỗi, cho phép thử lại.
- **CSV export rỗng (không có kết quả):** Vẫn tải được file CSV với chỉ header.

### Delivery Staff
- **Tải ảnh giấy phép sai định dạng / quá kích thước:** Hiển thị lỗi validation trước khi submit.
- **Xóa nhân viên đang được phân công cho đơn chưa hoàn tất:** **Block xóa** — hiển thị error message: _"Không thể xóa nhân viên đang phân công đơn"_.
- **Tìm kiếm không có kết quả:** Hiển thị empty state.

### Change Password
- **Mật khẩu mới không khớp xác nhận:** Hiển thị lỗi inline, không submit.
- **Mật khẩu hiện tại sai:** Hiển thị lỗi, không cập nhật.
- **Password complexity [Confirmed]:** Mật khẩu phải bao gồm cả chữ cái và số, tối thiểu **8 ký tự**.

---

## Acceptance Criteria

### F01 — Auth
- [ ] AC1.1: Đăng nhập thành công bằng ID/mật khẩu đúng → chuyển đến màn hình TOP.
- [ ] AC1.2: Đăng nhập sai thông tin → hiển thị thông báo lỗi, không cho vào hệ thống.
- [ ] AC1.3: Đăng xuất → session bị huỷ, không thể dùng session cũ để truy cập lại.
- [ ] AC1.4: Quên mật khẩu → nhận email chứa link đặt lại → đặt lại thành công → đăng nhập được bằng mật khẩu mới.
- [ ] AC1.5: Mọi route trong portal đều yêu cầu đăng nhập — truy cập trực tiếp khi chưa login phải redirect về trang login.

### F02 — TOP Screen
- [ ] AC2.1: Màn hình TOP hiển thị danh sách thông báo với tiêu đề và ngày.
- [ ] AC2.2: Click thông báo → xem chi tiết nội dung đầy đủ.
- [ ] AC2.3: File đính kèm trong thông báo có thể tải xuống thành công.

### F03 — Delivery Status Management
- [ ] AC3.1: Tìm kiếm theo tháng/năm, ngày, trạng thái, nhân viên — trả về kết quả đúng.
- [ ] AC3.2: Danh sách mặc định hiển thị đơn của ngày/tháng hiện tại.
- [ ] AC3.3: Mỗi dòng trong danh sách hiển thị trạng thái và mã vận đơn đúng.
- [ ] AC3.4: Phân công nhân viên giao hàng cho đơn → lưu thành công → phản ánh ngay trong danh sách.
- [ ] AC3.5: Không thể phân công lại nhân viên cho đơn đã "Hoàn tất".
- [ ] AC3.6: Chi tiết đơn hiển thị đầy đủ 4 tab: Địa chỉ / Điểm trung chuyển / Hàng hóa / Báo cáo.

### F04 — Collected Amount
- [ ] AC4.1: Tìm kiếm theo ngày giao hàng và tên nhân viên → kết quả đúng.
- [ ] AC4.2: Danh sách hiển thị tổng số tiền thu theo từng nhân viên.
- [ ] AC4.3: Chi tiết cá nhân hiển thị đúng số tiền và hình ảnh biên lai/báo cáo đỗ xe.
- [ ] AC4.4: Xuất CSV thành công — file chứa đúng dữ liệu đang hiển thị trên màn hình.

### F05 — Delivery Staff Management
- [ ] AC5.1: Tìm kiếm theo tên và phân loại — kết quả đúng.
- [ ] AC5.2: Khi check "hiển thị đã xóa" → danh sách bao gồm cả nhân viên đã soft-delete.
- [ ] AC5.3: Đăng ký nhân viên mới với đầy đủ thông tin và ảnh giấy phép → lưu thành công → xuất hiện trong danh sách.
- [ ] AC5.4: Ảnh giấy phép không đúng định dạng / quá kích thước → hiển thị lỗi validation, không lưu.
- [ ] AC5.5: Chỉnh sửa thông tin nhân viên → lưu thành công → dữ liệu cập nhật đúng.
- [ ] AC5.6: Xóa nhân viên đang phân công đơn → hệ thống **block và hiển thị error** "Không thể xóa nhân viên đang phân công đơn".
- [ ] AC5.6b: Xóa nhân viên không còn phân công đơn → xác nhận → nhân viên không còn trong danh sách thường (vẫn tìm được khi check "đã xóa").
- [ ] AC5.7: Nhân viên đã xóa không xuất hiện trong dropdown phân công đơn hàng.

### F06 — Change Password
- [ ] AC6.1: Thay đổi mật khẩu thành công → đăng nhập được bằng mật khẩu mới.
- [ ] AC6.2: Nhập mật khẩu hiện tại sai → hiển thị lỗi, không cập nhật.
- [ ] AC6.3: Mật khẩu mới và xác nhận không khớp → hiển thị lỗi inline, không submit.
- [ ] AC6.4: Mật khẩu không đáp ứng yêu cầu (dưới 8 ký tự hoặc không có cả chữ lẫn số) → hiển thị lỗi validation, không submit.

---

## Dependencies

| Feature phụ thuộc | Mô tả |
|---|---|
| [GIAO HÀNG] Lịch trình & Điều phối (ESKITCHEN-1236) | Dữ liệu đơn ủy thác giao hàng phải được tạo trước mới có data cho F03. |
| [GIAO HÀNG] App Tài xế — E06 (ESKITCHEN-1238) | E06 là đối tượng được E05 phân công. E05 tạo hồ sơ tài xế trong F05, E06 dùng để login App Tài xế. Cần confirm chung data model `driver/delivery_staff`. |
| [THU TIỀN & HÀNG HỦY] (ESKITCHEN-1242) | Dữ liệu thu tiền và biên lai do E06 báo cáo từ Driver App — F04 đọc lại dữ liệu đó. |
| Quản lý tài khoản E05 (thuộc E03) | E03 cấp tài khoản cho đối tác — cần API `POST /outsource-accounts` trước khi F01 hoạt động. |

---

## Out of Scope

- Quản lý hợp đồng với đối tác vận chuyển (thuộc nghiệp vụ Hợp đồng — E03).
- Tạo/cấp tài khoản E05 (do E03 thực hiện, không có UI trên portal này).
- Xem báo cáo doanh thu hay thông tin kinh doanh của ES Kitchen.
- Đối tác không có quyền tạo/sửa đơn hàng — chỉ xem và phân công.
- Push notification: **không có push notification khi có đơn mới** (đã xác nhận không cần).

---

## Screens

| Screen Code | Screen | Actor | App | Screen Type | Mô tả ngắn |
|---|---|---|---|---|---|
| OW_DLVP_001 | Login | E05 | E05 (es-kitchen-web-outsource-web-private) | Form | Nhập ID + mật khẩu để đăng nhập portal đối tác vận chuyển |
| OW_DLVP_002 | Forgot Password | E05 | E05 (es-kitchen-web-outsource-web-private) | Form | Nhập email để nhận link đặt lại mật khẩu |
| OW_DLVP_003 | Reset Password | E05 | E05 (es-kitchen-web-outsource-web-private) | Form | Nhập mật khẩu mới sau khi click link từ email |
| OW_DLVP_004 | TOP Screen | E05 | E05 (es-kitchen-web-outsource-web-private) | Dashboard | Dashboard chính — danh sách thông báo, shortcut đến các mục quản lý |
| OW_DLVP_005 | Announcement Detail | E05 | E05 (es-kitchen-web-outsource-web-private) | Detail | Xem nội dung chi tiết thông báo và tải file đính kèm |
| OW_DLVP_006 | Delivery Status List | E05 | E05 (es-kitchen-web-outsource-web-private) | List | Tìm kiếm và xem danh sách đơn giao hàng được ủy thác theo trạng thái |
| OW_DLVP_007 | Delivery Status Detail | E05 | E05 (es-kitchen-web-outsource-web-private) | Detail | Xem chi tiết 4 tab (địa chỉ / trung chuyển / hàng hóa / báo cáo) và phân công tài xế |
| OW_DLVP_008 | Collected Amount List | E05 | E05 (es-kitchen-web-outsource-web-private) | List | Danh sách tổng hợp số tiền thu theo nhân viên giao hàng, hỗ trợ xuất CSV |
| OW_DLVP_009 | Collected Amount Detail | E05 | E05 (es-kitchen-web-outsource-web-private) | Detail | Chi tiết số tiền thu của từng nhân viên kèm hình ảnh biên lai và báo cáo đỗ xe |
| OW_DLVP_010 | Delivery Staff List | E05 | E05 (es-kitchen-web-outsource-web-private) | List | Danh sách nhân viên giao hàng, tìm kiếm, xem cả bản đã xóa |
| OW_DLVP_011 | Delivery Staff Register / Edit Form | E05 | E05 (es-kitchen-web-outsource-web-private) | Form | Đăng ký mới hoặc chỉnh sửa thông tin nhân viên giao hàng và upload ảnh giấy phép lái xe |
| OW_DLVP_012 | Change Password | E05 | E05 (es-kitchen-web-outsource-web-private) | Form | Thay đổi mật khẩu tài khoản đối tác |

---

## Bước tiếp theo

Chạy song song sau khi SPEC được sign-off:

- "Hãy là Tech Lead Design, làm DESIGN.md từ SPEC này: `/Users/longtd/Desktop/WORK/AI_AGENTS_ES_KITCHEN/es-kitchen-docs/docs/features/delivery-partner/SPEC.md`"
- "Hãy là QC, sinh test cases từ SPEC này: `/Users/longtd/Desktop/WORK/AI_AGENTS_ES_KITCHEN/es-kitchen-docs/docs/features/delivery-partner/SPEC.md`"
  (slash command: `/test/generate_manual_testcases_rbt` cho FULL RBT / `/test/generate_testcases_from_requirements` cho QUICK)
- "Hãy là Designer, tạo UI-SPEC.md + Figma từ SPEC này: es-kitchen-docs/docs/features/delivery-partner/SPEC.md"
  (hoặc slash command: /create-ui-design es-kitchen-docs/docs/features/delivery-partner/SPEC.md)
