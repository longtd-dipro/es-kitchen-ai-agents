# SPEC: Thanh toán & Hoàn tiền (Payment)

> Domain: `thanh-toan` · Backlog: ESKITCHEN-1241 · Priority: 1 (mobile payment) / 4 (invoice)

---

## Mô tả nghiệp vụ

Hệ thống thanh toán của ESKITCHEN bao gồm hai luồng chính:

1. **Thanh toán tại điểm mua (Point-of-Purchase Payment):** End User (E01) thanh toán món ăn trực tiếp trên Mobile App thông qua các phương thức Alipay, WeChat Pay — tất cả đều được xử lý qua **elepay SDK** của công ty ELESTYLE. Người nhận mặc định là `es_admin`.
2. **Quản lý hóa đơn hàng tháng (Monthly Invoice Management):** Cuối tháng hệ thống tự động phát hành Invoice cho từng Company. Company thanh toán **ngoài hệ thống** (qua bên thứ ba hoặc chuyển khoản trực tiếp). Hệ thống chỉ xuất đúng Invoice — không xử lý thanh toán B2B trong app.
3. **Hoàn tiền (Refund):** ~~Đã được xây dựng trong Phase 1~~ theo luồng 2 bước: E01 gửi yêu cầu hoàn tiền trên app → E03 phê duyệt và xử lý trên màn hình quản trị → thực thi qua Refund API của elepay.

> **Lưu ý:** Thanh toán tiền mặt tại điểm bán (bỏ tiền vào két tủ lạnh) được thu bởi tài xế (E06) và quản lý trong domain **Thu tiền & Hàng hủy** — không xử lý trong app.

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

### Luồng 2 — Phát hành hóa đơn hàng tháng (tự động & E03)

1. Cuối tháng hệ thống tự động phát hành Invoice cho từng Company có contract active.
2. Nếu contract không có order trong tháng → **bỏ qua** (không phát hành invoice trống).
3. E03 vào màn hình "Invoices by Contract" — xem danh sách hợp đồng cần phát hành hóa đơn tháng này.
4. E03 chọn contract, xem preview nội dung hóa đơn (Invoice Preview) — nội dung được auto-fill từ dữ liệu đơn hàng tháng. **Không thể chỉnh sửa thủ công.**
5. E03 xác nhận phát hành → hệ thống:
   - Tạo invoice record, generate PDF.
   - Gửi thông báo (chuông hệ thống + email) đến Company Admin (E02) tương ứng.
6. E02 nhận thông báo → vào màn hình "List of Invoices" → xem danh sách hóa đơn → tải PDF.
7. Company thanh toán **ngoài hệ thống** — hệ thống không theo dõi trạng thái thanh toán B2B.

---

## Alternative Flows & Edge Cases

### Luồng 1 — Thanh toán mobile

| Case | Mô tả | Xử lý kỳ vọng |
|---|---|---|
| **ALT-1** | elepay trả về lỗi (thẻ từ chối, hết hạn, insufficient funds) | Hiển thị thông báo lỗi rõ ràng; cho phép E01 thử lại hoặc chọn phương thức khác; order giữ nguyên trạng thái chờ thanh toán |
| **ALT-2** | Timeout — elepay không phản hồi trong thời gian quy định | **Threshold: 6 tiếng** (kể cả khi đang chờ thanh toán hay elepay lỗi không phản hồi). Sau 6 tiếng → **hủy intent** tự động. |
| **ALT-3** | E01 thoát app giữa chừng khi đang trong elepay SDK | Order vẫn ở trạng thái chờ thanh toán; khi mở lại app hiển thị đúng trạng thái |
| **ALT-4** | Callback elepay bị delay / duplicate | Server phải idempotent: không ghi nhận double payment cho cùng charge token |
| **ALT-5** | Company có trợ giá (subsidy) — tổng tiền E01 thanh toán = giá món − trợ giá | **Trợ giá xử lý nội bộ** — không trừ trực tiếp trên invoice elepay. Company đối soát và thanh toán phần trợ giá vào cuối tháng. |
| **ALT-6** | E01 chưa liên kết company (chưa User Binding) | Không cho phép đặt hàng (handled ở domain Menu & Order); payment screen không accessible |

### Luồng 2 — Invoice

| Case | Mô tả | Xử lý kỳ vọng |
|---|---|---|
| **ALT-7** | Contract không có order nào trong tháng | **Skip** — không phát hành invoice trống. |
| **ALT-8** | E03 muốn chỉnh sửa nội dung hóa đơn trước khi phát hành | **Không cho phép** — Invoice chỉ auto-fill từ dữ liệu đơn hàng, không chỉnh sửa thủ công. |
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
- E03 xem Invoice Preview trước khi confirm phát hành (nội dung auto-fill, không chỉnh sửa thủ công)
- Sau khi confirm: hệ thống tạo invoice record + PDF + gửi thông báo E02
- Contract không có order trong tháng: **bỏ qua** (không phát hành)
- E03 không thể phát hành hóa đơn trùng cho cùng contract cùng tháng

### AC-INV-04: Invoice Preview (E03)
- E03 xem trước nội dung hóa đơn đầy đủ trước khi phát hành
- Preview hiển thị đúng dữ liệu tổng đơn hàng tháng theo contract

---

## Out of Scope

- Thanh toán bằng tiền mặt (cash) tại điểm bán — thu bởi tài xế, quản lý trong domain **Thu tiền & Hàng hủy**
- Stripe, PayPal, VNPay hoặc bất kỳ payment gateway nào khác ngoài elepay
- Hoàn tiền (Refund) — **đã xây dựng trong Phase 1** (E01 yêu cầu → E03 phê duyệt → elepay Refund API)
- Theo dõi trạng thái thanh toán B2B (Company → es_admin) — Company thanh toán ngoài hệ thống
- Chỉnh sửa thủ công nội dung hóa đơn — Invoice chỉ auto-fill
- Quản lý thông tin thẻ / lưu card token phía hệ thống (do elepay SDK quản lý)
- Xuất hóa đơn cho Supplier (E04) — nằm trong domain Đặt hàng NCC
- Tích hợp kế toán bên thứ ba (ERP, SAP)

---

## Screens

| Screen Code | Screen | Actor | App | Screen Type | Mô tả ngắn |
|---|---|---|---|---|---|
| UA_PAYM_001 | Order Summary (Payment Entry) | E01 | E01 (es-kitchen-payment-app) | Detail | Xem tóm tắt đơn hàng (tên món, số lượng, tổng tiền, trợ giá company) trước khi thanh toán |
| UA_PAYM_002 | Payment Method Selection | E01 | E01 (es-kitchen-payment-app) | Form | Chọn phương thức thanh toán: Rakuten Pay / Alipay / WeChat Pay |
| UA_PAYM_003 | elepay SDK Payment Sheet | E01 | E01 (es-kitchen-payment-app) | Modal | Native sheet của elepay SDK — E01 xác nhận thanh toán trong luồng bên thứ ba |
| UA_PAYM_004 | Payment Success / Receipt | E01 | E01 (es-kitchen-payment-app) | Detail | Xác nhận thanh toán thành công: tên món, số tiền, thời gian, mã giao dịch |
| UA_PAYM_005 | Payment Error *inferred | E01 | E01 (es-kitchen-payment-app) | Detail | Hiển thị lỗi thanh toán (elepay trả lỗi), cho phép retry hoặc đổi phương thức |
| CW_PAYM_001 | List of Invoices | E02 | E02 (es-kitchen-web-company) | List | Danh sách hóa đơn theo tháng của company: tháng phát hành, tổng tiền, trạng thái, tải PDF |
| AW_PAYM_001 | Invoices by Contract | E03 | E03 (es-kitchen-web-admin) | List | Danh sách hợp đồng cần phát hành hóa đơn tháng này; E03 chọn contract để xem preview |
| AW_PAYM_002 | Invoice Preview | E03 | E03 (es-kitchen-web-admin) | Detail | Xem trước toàn bộ nội dung hóa đơn (tổng đơn hàng tháng theo contract) trước khi confirm phát hành |

---

## Bước tiếp theo

SPEC này là **cross-repo** (E01 Mobile + E02 Web + E03 Web + API). Cần Contract Lock trước Phase 3.

Chạy song song:

- "Hãy là Tech Lead Design, làm DESIGN.md từ SPEC này: `/Users/longtd/Desktop/WORK/AI_AGENTS_ES_KITCHEN/es-kitchen-docs/docs/features/payment/SPEC.md`"
- "Hãy là QC, sinh test cases từ SPEC này: `/Users/longtd/Desktop/WORK/AI_AGENTS_ES_KITCHEN/es-kitchen-docs/docs/features/payment/SPEC.md`" (hoặc `/test/generate_manual_testcases_rbt`)
→ "Hãy là Designer, tạo UI-SPEC.md + Figma từ SPEC này: es-kitchen-docs/docs/features/payment/SPEC.md"
  (hoặc slash command: /create-ui-design es-kitchen-docs/docs/features/payment/SPEC.md)
