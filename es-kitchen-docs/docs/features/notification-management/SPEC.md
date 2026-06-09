# SPEC: Notification Management (Admin → All Actors)

> **Loại:** Cross-repo (Admin tạo → all repos nhận)
> **Repos liên quan:** `es-kitchen-api` · `es-kitchen-web-admin` (E03) · `es-kitchen-web-company` (E02) · `es-kitchen-payment-app` (E01) · `es-kitchen-web-supplier` (E04) · `es-kitchen-web-outsource-web-private` (E05) · `es-kitchen-webapp-driver` (E06)
> **Actor chính:** System Admin (E03) tạo; tất cả actor còn lại nhận
> **Ngày:** 2026-06-02
> **Status:** Draft — input từ requirement chi tiết
> **Source:** `es-kitchen-requirements/notification management/requirement.md`

---

## 1. Mô tả nghiệp vụ

System Admin có thể tạo, lên lịch và gửi thông báo (notification) đến **5 nhóm đối tượng** trong hệ thống ESKITCHEN. Mục đích chính:

- Thông báo sự cố sản phẩm (lỗi, hết hàng)
- Gửi xin lỗi / liên hệ khẩn cấp tới user đã đặt món liên quan
- Thông báo cập nhật hệ thống, chính sách mới

Notification được gửi qua **2 kênh đồng thời:**
- Hiển thị trên màn hình TOP của browser / list trong app
- (Optional) Email gửi tới người phụ trách

Có cơ chế **DRAFT → PUBLISHED → DELETED**, **scheduled publish**, **read tracking**, và **chỉnh sửa sau publish**.

---

## 2. Actors & Preconditions

| Actor | Vai trò | Receive UI |
|---|---|---|
| System Admin (E03) | Tạo, sửa, publish, xóa notification | — |
| Company Admin (E02) | Nhận notification | Top màn hình browser |
| End User (E01) | Nhận notification | List notification trong app + Push notification |
| Supplier (E04) | Nhận notification | Top màn hình browser |
| Outsource / Contract Delivery (E05) | Nhận notification | Top màn hình browser |
| Driver (E06) | Nhận notification | Top màn hình browser |

**Precondition:** Admin có quyền "Notification Management"; recipient đã đăng nhập app/web tương ứng.

---

## 3. Happy Path — Admin tìm kiếm và chọn đối tượng

1. Admin vào **Notification Management → Create Notification**
2. Bước 1: **Filter đối tượng nhận**
   - Loại đối tượng (Company / User / Supplier / Outsource / Driver — multi-select)
   - Tên công ty (lookup)
   - Tên plan
   - Trạng thái hợp đồng
   - Tháng đặt hàng
   - Tên sản phẩm / Mã sản phẩm (multi-select, điều kiện **OR** giữa sản phẩm)
3. Click **Search** → hệ thống hiển thị danh sách đối tượng match
4. Admin có thể **chọn lại** (check/uncheck) từ danh sách trước khi tạo notification

> Use case nổi bật: "Sản phẩm A bị lỗi" → tìm tất cả user đã đặt sản phẩm A trong tháng X → gửi thông báo xin lỗi

## 4. Happy Path — Admin tạo Notification

1. Sau khi chọn đối tượng → click **Next** → bước 2 nhập nội dung
2. Fields:
   - **Tiêu đề** (max 255 ký tự)
   - **Nội dung** (max 5000 ký tự)
   - **File đính kèm** (PDF/JPG/JPEG/PNG, ≤5MB/file, ≤5 file)
   - **Thời gian bắt đầu hiển thị** (không quá khứ)
   - **Có gửi mail không** (toggle)
   - **Có gửi cho người phụ trách phụ không** (toggle — chỉ khi mail ON)
3. Admin chọn 1 trong 2:
   - **Save Draft** → status `DRAFT`, không gửi
   - **Publish** → status `PUBLISHED`, gửi ngay (hoặc đến giờ scheduled)

## 5. Happy Path — Recipient nhận và đọc Notification

### Web (E02/E04/E05/E06)
1. User đăng nhập → thấy badge notification trên TOP browser
2. Click badge → mở list (sắp xếp: mới nhất trước)
3. Item chưa đọc: highlight + nhãn `NEW`
4. Item đã đọc: màu xám
5. Click vào 1 item → mở chi tiết → tự động đánh dấu đã đọc

### Mobile (E01)
1. Push notification trigger → user thấy thông báo
2. Tap push → mở app, list notification
3. Tap item → chi tiết → đánh dấu đã đọc
4. List vẫn hiện trong app dù không tap push

### Email
- Nếu Admin bật "Gửi mail" → SES gửi mail đến người phụ trách chính (và phụ nếu toggle ON)
- Email gửi 1 lần tại thời điểm Publish — không gửi lại khi edit

---

## 6. Happy Path — Admin chỉnh sửa Notification sau Publish

1. Admin vào list notification → chọn item status `PUBLISHED` → Edit
2. Sửa nội dung → Save
3. Hệ thống cập nhật nội dung mới trên TOP / list (nội dung mới nhất hiển thị)
4. **KHÔNG** gửi lại email, **KHÔNG** gửi lại push notification
5. *OQ-1: chỉnh sửa có log version không (để audit)?*

---

## 7. Happy Path — Admin xóa Notification

1. Admin chọn item → Delete → popup warning + confirm (Common Rules)
2. Logical delete — status `DELETED`
3. Behavior:
   - `DRAFT` → không hiện trong list nữa, không ai nhận
   - `PUBLISHED` → ẩn khỏi TOP / list của recipient (đã gửi email không thu hồi được)

---

## 8. Alternative Flows & Edge Cases

| Tình huống | Xử lý |
|---|---|
| Admin lọc 0 đối tượng | Không cho phép publish — error "Cần ít nhất 1 recipient" |
| File >5MB | Upload fail, hiển thị error rõ size |
| >5 file | Block button "Add file" sau 5 file |
| Extension không cho phép | Reject upload, error message |
| Thời gian hiển thị = past | Block submit, error "Không cho phép thời gian quá khứ" |
| Scheduled publish — Admin xóa trước giờ scheduled | *OQ-2: cancel scheduled publish? Status về DELETED?* |
| Recipient có nhiều role (vd vừa là Driver vừa là Outsource) | *OQ-3: nhận trên cả 2 web hay 1 web duy nhất?* |
| Recipient bị Disabled / Deleted khi notification đến giờ gửi | *OQ-4: skip hay vẫn gửi và lưu lại?* |
| Notification list quá dài | Pagination / virtual scroll *(OQ-5: page size?)* |
| Push notification fail (token expired, app uninstalled) | *OQ-6: retry policy? Log fail?* |
| Email bounce (mail invalid) | *OQ-7: alert Admin? Log?* |

---

## 9. Acceptance Criteria

| # | Criteria |
|---|---|
| AC-01 | Admin có thể filter đối tượng nhận theo loại / công ty / plan / contract status / sản phẩm (OR multi-select) |
| AC-02 | Admin có thể tạo notification với title, content, attachment, schedule time, email toggle |
| AC-03 | Validation đúng quy định: title ≤255, content ≤5000, file ≤5MB, ≤5 file, extension whitelist, thời gian không quá khứ |
| AC-04 | Save Draft → status DRAFT, không gửi |
| AC-05 | Publish ngay → status PUBLISHED, đẩy lên TOP recipient và (nếu bật) gửi email |
| AC-06 | Schedule Publish → đến giờ scheduled mới gửi |
| AC-07 | Recipient (web): notification hiển thị trên TOP, sắp xếp mới nhất trước, chưa đọc highlight + NEW |
| AC-08 | Recipient (mobile E01): nhận push + thấy trong list |
| AC-09 | Mở chi tiết notification → tự động đánh dấu đã đọc |
| AC-10 | Edit notification sau publish → nội dung mới hiển thị, KHÔNG gửi lại email / push |
| AC-11 | Delete notification → logical delete; PUBLISHED ẩn khỏi recipient; DRAFT chưa từng gửi |
| AC-12 | Email gửi đến người phụ trách chính (luôn), người phụ trách phụ (nếu toggle ON) |
| AC-13 | Audit log: ai tạo/sửa/publish/delete, khi nào |
| AC-14 | API endpoints chuẩn (xem section 10 requirement gốc): GET list/detail, POST create, PUT update, DELETE, POST publish, POST read |

---

## 10. Open Questions — Cần confirm

| # | Câu hỏi | Tầm quan trọng |
|---|---|---|
| OQ-1 | Edit sau publish có log version (audit history hiển thị các bản sửa) không? | 🟠 Medium |
| OQ-2 | Scheduled publish — Admin xóa trước giờ → cancel? Hay vẫn fire? | 🟡 High |
| OQ-3 | User có nhiều role (vd Driver + Outsource) — nhận trên cả 2 web hay chỉ 1? | 🟡 High |
| OQ-4 | Recipient bị Disabled/Deleted khi đến giờ gửi — skip hay vẫn lưu? | 🟠 Medium |
| OQ-5 | List notification recipient — page size? Hiển thị bao nhiêu cũ? Có archive sau N ngày? | 🟠 Medium |
| OQ-6 | Push notification fail — retry policy? Log fail? Báo Admin? | 🟡 High |
| OQ-7 | Email bounce — alert Admin? Log? | 🟠 Medium |
| OQ-8 | Người dùng đã đọc rồi có thấy NEW trên TOP khi notification được edit không? | 🟠 Medium |
| OQ-9 | Khi recipient đang offline (mobile) — push hết hạn sau bao lâu? FCM TTL? | 🟠 Medium |
| OQ-10 | Có hỗ trợ multi-language cho notification không (JP / VN / EN)? | 🟡 High |
| OQ-11 | File đính kèm lưu ở đâu (S3?), có scan virus không? | 🔴 Critical |
| OQ-12 | Filter "Tháng đặt hàng" — định nghĩa rõ: tháng nào của order_date? | 🟠 Medium |
| OQ-13 | Filter "Trạng thái hợp đồng" — có những trạng thái nào? | 🟡 High |
| OQ-14 | Notification quan trọng / khẩn cấp — có flag priority để hiển thị nổi bật không? | 🟠 Medium |
| OQ-15 | API `POST /api/notices/{id}/read` — endpoint này được gọi tự động khi mở detail, hay user phải bấm "đánh dấu đã đọc"? | 🟠 Medium |

---

## 11. Out of Scope

- Notification 2 chiều (recipient reply Admin) — chỉ 1 chiều
- Recipient tự subscribe / unsubscribe topic — Admin tự chọn
- Template notification (lưu sẵn để dùng lại)
- Notification trong mobile app of Driver/Supplier/Outsource (chỉ web theo requirement)
- SMS notification — chỉ in-app + email
- Notification scheduling lặp lại (vd mỗi tuần)
- Phân tích thống kê đọc (ai đã đọc, % đọc...) — chỉ track đã đọc per user, không dashboard

---

## Screens

| Screen | Actor | App | Mô tả ngắn |
|---|---|---|---|
| Notification Management List | System Admin | E03 (es-kitchen-web-admin) | Danh sách tất cả notification (DRAFT / PUBLISHED / DELETED), tìm kiếm, filter, action Delete |
| Create Notification — Step 1: Filter Recipients | System Admin | E03 (es-kitchen-web-admin) | Lọc đối tượng nhận theo loại / tên công ty / plan / contract status / tháng đặt hàng / sản phẩm; hiển thị danh sách match để check/uncheck |
| Create Notification — Step 2: Enter Content | System Admin | E03 (es-kitchen-web-admin) | Nhập tiêu đề, nội dung, file đính kèm, thời gian hiển thị, toggle email / người phụ trách phụ; action Save Draft / Publish |
| Notification Detail & Edit (Admin) | System Admin | E03 (es-kitchen-web-admin) | Xem chi tiết, chỉnh sửa nội dung notification đã PUBLISHED; Save cập nhật nội dung mới |
| Notification Badge & List — TOP Bar | Company Admin | E02 (es-kitchen-web-company) | Badge đếm chưa đọc trên TOP browser; dropdown list sắp xếp mới nhất trước, chưa đọc highlight + nhãn NEW |
| Notification Detail (Company Admin) | Company Admin | E02 (es-kitchen-web-company) | Xem chi tiết notification; tự động đánh dấu đã đọc khi mở |
| Notification Badge & List — TOP Bar * inferred | End User | E01 (es-kitchen-payment-app) | List notification trong app; item chưa đọc highlight; nhận push notification trigger |
| Notification Detail (End User) | End User | E01 (es-kitchen-payment-app) | Xem chi tiết notification từ list hoặc tap push; tự động đánh dấu đã đọc |
| Notification Badge & List — TOP Bar | Supplier | E04 (es-kitchen-web-supplier) | Badge đếm chưa đọc trên TOP browser; dropdown list sắp xếp mới nhất trước, chưa đọc highlight + nhãn NEW |
| Notification Detail (Supplier) | Supplier | E04 (es-kitchen-web-supplier) | Xem chi tiết notification; tự động đánh dấu đã đọc khi mở |
| Notification Badge & List — TOP Bar | Outsource | E05 (es-kitchen-web-outsource-web-private) | Badge đếm chưa đọc trên TOP browser; dropdown list sắp xếp mới nhất trước, chưa đọc highlight + nhãn NEW |
| Notification Detail (Outsource) | Outsource | E05 (es-kitchen-web-outsource-web-private) | Xem chi tiết notification; tự động đánh dấu đã đọc khi mở |
| Notification Badge & List — TOP Bar | Driver | E06 (es-kitchen-webapp-driver) | Badge đếm chưa đọc trên TOP browser; dropdown list sắp xếp mới nhất trước, chưa đọc highlight + nhãn NEW |
| Notification Detail (Driver) | Driver | E06 (es-kitchen-webapp-driver) | Xem chi tiết notification; tự động đánh dấu đã đọc khi mở |
