# SPEC: Thanh toán & Hoàn tiền (Payment)

> Domain: `thanh-toan` · Backlog: ESKITCHEN-1241 · Priority: 1 (mobile payment) / 4 (invoice)

---

## Mô tả nghiệp vụ

Hệ thống thanh toán của ESKITCHEN bao gồm hai luồng chính:

1. **Thanh toán tại điểm mua (Point-of-Purchase Payment):** End User (E01) thanh toán món ăn trực tiếp trên Mobile App thông qua các phương thức Rakuten Pay, Alipay, WeChat Pay — tất cả đều được xử lý qua **elepay SDK** của công ty ELESTYLE.
2. **Quản lý hóa đơn hàng tháng (Monthly Invoice Management):** System Admin (E03) phát hành hóa đơn theo hợp đồng mỗi tháng; Company Admin (E02) nhận thông báo và tải PDF hóa đơn.

**TODO (BA):** Domain source đề cập "User yêu cầu hoàn tiền trong 30 phút" (từ business-flow-index) nhưng không có story cụ thể trong `thanh-toan.md`. Cần xác nhận: hoàn tiền (refund) có nằm trong scope Phase 2 không? Nếu có, actor nào xử lý refund (E01 tự yêu cầu trên app, hay E03 xử lý thủ công)?

---

## Actors & Preconditions

| Actor | Vai trò | Precondition |
|---|---|---|
| **E01** — End User (Mobile App) | Thực hiện thanh toán món ăn | Đã đăng nhập · Đã liên kết company (User Binding) · Có order đang chờ thanh toán |
| **E02** — Company Admin (Web) | Xem và tải hóa đơn | Đã đăng nhập · Company có contract đang hoạt động |
| **E03** — System Admin (Web) | Phát hành hóa đơn hàng tháng | Đã đăng nhập với quyền Kế toán/Admin |

**Phạm vi:** Cross-repo — ảnh hưởng `es-kitchen-payment-app` (E01) + `es-kitchen-web-company` (E02) + `es-kitchen-web-admin` (E03) + `es-kitchen-api` (backend). **Cần Contract Lock trước Phase 3.**

**Dependencies:**
- Domain **Menu & Order** (ESKITCHEN-1239): order phải ở trạng thái "chờ thanh toán" trước khi E01 vào màn hình payment.
- Domain **Hợp đồng** (ESKITCHEN-1235): Invoice gắn với contract ID; E03 chỉ phát hành invoice khi contract active.
- **elepay SDK** (ELESTYLE): tích hợp phía mobile (E01) và server-side payment intent (API).

---

## Happy Path

### Luồng 1 — E01 thanh toán qua Rakuten Pay / Alipay / WeChat Pay

1. E01 xem màn hình xác nhận đơn hàng (order summary: tên món, số lượng, tổng tiền, phần trợ giá của company).
2. E01 chọn phương thức thanh toán: **Rakuten Pay** hoặc **Alipay** hoặc **WeChat Pay**.
3. App khởi tạo payment intent qua API (`POST /payments/intent`) — server gọi elepay API để tạo charge token.
4. App load elepay SDK UI (native sheet) cho phương thức đã chọn.
5. E01 xác nhận thanh toán trong elepay SDK (nhập thông tin thẻ / xác thực app bên thứ ba).
6. elepay callback kết quả (success/failure) về server.
7. Server cập nhật trạng thái order sang `PAID`, ghi nhận payment record.
8. App hiển thị màn hình xác nhận thanh toán thành công (receipt).

### Luồng 2 — E03 phát hành hóa đơn hàng tháng

1. E03 vào màn hình "Invoices by Contract" — xem danh sách hợp đồng cần phát hành hóa đơn tháng này.
2. E03 chọn contract, xem preview nội dung hóa đơn (Invoice Preview).
3. Hệ thống tự điền nội dung hóa đơn (tổng đơn hàng tháng theo contract).
4. E03 xác nhận phát hành → hệ thống:
   - Tạo invoice record, generate PDF.
   - Tự động assign Task cho bộ phận Kế toán (Task Management).
   - Gửi thông báo (chuông hệ thống + email) đến Company Admin (E02) tương ứng.
5. E02 nhận thông báo → vào màn hình "List of Invoices" → xem danh sách hóa đơn → tải PDF.

---

## Alternative Flows & Edge Cases

### Luồng 1 — Thanh toán mobile

| Case | Mô tả | Xử lý kỳ vọng |
|---|---|---|
| **ALT-1** | elepay trả về lỗi (thẻ từ chối, hết hạn, insufficient funds) | Hiển thị thông báo lỗi rõ ràng; cho phép E01 thử lại hoặc chọn phương thức khác; order giữ nguyên trạng thái chờ thanh toán |
| **ALT-2** | Timeout — elepay không phản hồi trong thời gian quy định | **TODO (BA):** Xác nhận timeout threshold và hành động: hủy intent hay retry? |
| **ALT-3** | E01 thoát app giữa chừng khi đang trong elepay SDK | Order vẫn ở trạng thái chờ thanh toán; khi mở lại app hiển thị đúng trạng thái |
| **ALT-4** | Callback elepay bị delay / duplicate | Server phải idempotent: không ghi nhận double payment cho cùng charge token |
| **ALT-5** | Company có trợ giá (subsidy) — tổng tiền E01 thanh toán = giá món − trợ giá | **TODO (BA):** Luồng tính trợ giá: trừ trực tiếp trên invoice elepay hay xử lý nội bộ? |
| **ALT-6** | E01 chưa liên kết company (chưa User Binding) | Không cho phép đặt hàng (handled ở domain Menu & Order); payment screen không accessible |

### Luồng 2 — Invoice

| Case | Mô tả | Xử lý kỳ vọng |
|---|---|---|
| **ALT-7** | Contract không có order nào trong tháng | **TODO (BA):** Có phát hành invoice trống không, hay skip? |
| **ALT-8** | E03 muốn chỉnh sửa nội dung hóa đơn trước khi phát hành | **TODO (BA):** Hóa đơn có chỉnh sửa thủ công được không? Hay chỉ auto-fill? |
| **ALT-9** | E02 không nhận được notification | E02 vẫn có thể vào màn hình invoice để xem/tải thủ công |
| **ALT-10** | PDF generation thất bại | Hiển thị lỗi cho E03; retry manual; không gửi notification cho E02 khi chưa có PDF |

---

## Acceptance Criteria

### AC-PAY-01: Thanh toán Rakuten Pay (E01)
- E01 có thể chọn Rakuten Pay từ màn hình thanh toán
- elepay SDK load đúng cho Rakuten Pay
- Sau khi thanh toán thành công, order chuyển sang trạng thái `PAID`
- Màn hình xác nhận hiển thị: tên món, số tiền đã thanh toán, thời gian, mã giao dịch

### AC-PAY-02: Thanh toán Alipay (E01)
- E01 có thể chọn Alipay từ màn hình thanh toán
- elepay SDK load đúng cho Alipay
- Luồng xác nhận tương tự AC-PAY-01

### AC-PAY-03: Thanh toán WeChat Pay (E01)
- E01 có thể chọn WeChat Pay từ màn hình thanh toán
- elepay SDK load đúng cho WeChat Pay
- Luồng xác nhận tương tự AC-PAY-01

### AC-PAY-04: Xử lý lỗi thanh toán (E01)
- Khi elepay trả về lỗi, hiển thị thông báo lỗi (tiếng Nhật) cho E01
- Order không chuyển sang `PAID` khi payment thất bại
- E01 có thể retry hoặc chọn phương thức khác mà không cần tạo order mới

### AC-INV-01: Danh sách hóa đơn (E02)
- E02 xem được danh sách hóa đơn của company mình theo tháng
- Mỗi hóa đơn hiển thị: tháng phát hành, tổng tiền, trạng thái (phát hành / chưa phát hành)
- E02 tải được file PDF hóa đơn

### AC-INV-02: Thông báo hóa đơn mới (E02)
- Khi E03 phát hành hóa đơn mới, E02 nhận thông báo qua:
  - Chuông hệ thống (in-app notification)
  - Email
- Thông báo chứa link trực tiếp đến hóa đơn mới

### AC-INV-03: Phát hành hóa đơn (E03)
- E03 xem danh sách contract cần phát hành hóa đơn trong tháng
- E03 xem Invoice Preview trước khi confirm phát hành
- Sau khi confirm: hệ thống tạo invoice record + PDF + gửi thông báo E02 + assign Task Kế toán
- E03 không thể phát hành hóa đơn trùng cho cùng contract cùng tháng

### AC-INV-04: Invoice Preview (E03)
- E03 xem trước nội dung hóa đơn đầy đủ trước khi phát hành
- Preview hiển thị đúng dữ liệu tổng đơn hàng tháng theo contract

---

## Out of Scope

- Thanh toán bằng tiền mặt (cash) — không áp dụng trong hệ thống
- Stripe, PayPal, VNPay hoặc bất kỳ payment gateway nào khác ngoài elepay
- Hoàn tiền (Refund) — **TODO (BA):** cần xác nhận scope (xem mô tả nghiệp vụ)
- Quản lý thông tin thẻ / lưu card token phía hệ thống (do elepay SDK quản lý)
- Xuất hóa đơn cho Supplier (E04) — nằm trong domain Đặt hàng NCC
- Tích hợp kế toán bên thứ ba (ERP, SAP)

---

## Bước tiếp theo

SPEC này là **cross-repo** (E01 Mobile + E02 Web + E03 Web + API). Cần Contract Lock trước Phase 3.

Chạy song song:

- "Hãy là Tech Lead Design, làm DESIGN.md từ SPEC này: `/Users/longtd/Desktop/WORK/AI_AGENTS_ES_KITCHEN/es-kitchen-docs/docs/features/payment/SPEC.md`"
- "Hãy là QC, sinh test cases từ SPEC này: `/Users/longtd/Desktop/WORK/AI_AGENTS_ES_KITCHEN/es-kitchen-docs/docs/features/payment/SPEC.md`" (hoặc `/test/generate_manual_testcases_rbt`)
