# SPEC: User Binding — Liên kết Nhân viên & Phúc lợi

> Backlog: ESKITCHEN-1244
> Domain: BF_[USER BINDING] Liên kết Nhân viên & Phúc lợi
> Phase: 2
> Tạo bởi: BA Agent · 2026-06-03

---

## Mô tả nghiệp vụ

Tính năng cho phép nhân viên (E01) liên kết tài khoản cá nhân với công ty đang sử dụng dịch vụ ESKITCHEN thông qua mã QR. Sau khi liên kết, Company Admin (E02) có thể thiết lập hai chính sách phúc lợi áp dụng cho toàn bộ nhân viên trong công ty:

1. **Giới hạn số lượng mua trong ngày** — quy định số món ăn tối đa một nhân viên được phép mua trong 1 ngày (ví dụ: 1–3 món/ngày).
2. **Trợ giá (Price Subsidy)** — doanh nghiệp hỗ trợ một phần hoặc toàn bộ chi phí bữa ăn cho nhân viên.

---

## Actors & Preconditions

| Actor | Role | Preconditions |
|---|---|---|
| **E01** — End User (Mobile App) | Quét mã QR, liên kết tài khoản với công ty | Đã đăng nhập app · Chưa liên kết với công ty nào (hoặc muốn chuyển liên kết) |
| **E02** — Company Admin (Web) | Thiết lập giới hạn mua và mức trợ giá | Đã đăng nhập web · Công ty đang có hợp đồng hiệu lực |

> Phạm vi: **Cross-repo** — ảnh hưởng `es-kitchen-payment-app` (E01) + `es-kitchen-web-company` (E02) + `es-kitchen-api` (BE).
> Contract Lock cần thiết trước Phase 3.

---

## Happy Path

### Story 1 — E01: Liên kết tài khoản nhân viên với công ty (QR Binding)

1. E01 mở màn hình "Liên kết công ty" trong app.
2. App hiển thị tính năng quét mã QR.
3. E01 quét mã QR do Company Admin cung cấp (mã QR đại diện cho công ty).
4. Hệ thống xác thực mã QR: kiểm tra mã hợp lệ, công ty còn hợp đồng.
5. Hệ thống liên kết tài khoản E01 với công ty.
6. App hiển thị thông báo liên kết thành công, hiển thị tên công ty đã liên kết.
7. Từ lần đặt hàng tiếp theo, chính sách giới hạn mua và trợ giá của công ty được áp dụng cho E01.

### Story 2 — E02: Thiết lập giới hạn số lượng mua trong ngày

1. Company Admin đăng nhập web (E02).
2. Truy cập màn hình cài đặt phúc lợi nhân viên.
3. Nhập số lượng món tối đa 1 nhân viên được mua trong 1 ngày (ví dụ: 1, 2 hoặc 3 món).
4. Lưu cài đặt.
5. Hệ thống áp dụng ngay cho toàn bộ nhân viên đã liên kết với công ty này.
6. Khi E01 đặt hàng, nếu đã đạt giới hạn trong ngày, hệ thống từ chối đơn hàng mới.

### Story 3 — E02: Thiết lập mức trợ giá (Price Subsidy)

1. Company Admin đăng nhập web (E02).
2. Truy cập màn hình cài đặt phúc lợi nhân viên.
3. Chọn loại trợ giá:
   - Hỗ trợ một phần: nhập số tiền hoặc phần trăm được công ty chi trả.
   - Hỗ trợ 100%: công ty thanh toán toàn bộ chi phí bữa ăn cho nhân viên.
4. Lưu cài đặt.
5. Hệ thống áp dụng mức trợ giá cho toàn bộ nhân viên đã liên kết.
6. Khi E01 thanh toán, số tiền được hiển thị sau khi trừ phần trợ giá.

---

## Alternative Flows & Edge Cases

### QR Binding

| Tình huống | Xử lý |
|---|---|
| Mã QR hết hạn hoặc không hợp lệ | Hiển thị thông báo lỗi rõ ràng, cho phép quét lại |
| Công ty đã hết hạn hợp đồng | Từ chối liên kết, hiển thị thông báo |
| E01 đã liên kết với công ty khác | **TODO (BA):** Hệ thống có cho phép chuyển liên kết không? Cần hủy liên kết cũ trước hay tự động thay thế? |
| E01 muốn hủy liên kết | **TODO (BA):** E01 có thể tự hủy liên kết từ app không, hay cần Company Admin thực hiện? |
| Nhiều nhân viên cùng quét QR cùng lúc | Hệ thống xử lý đồng thời, không conflict |

### Giới hạn mua trong ngày

| Tình huống | Xử lý |
|---|---|
| E01 đạt giới hạn mua trong ngày | App hiển thị thông báo đã đạt giới hạn, không cho thêm vào giỏ |
| Company Admin thay đổi giới hạn trong ngày | **TODO (BA):** Áp dụng ngay hay từ ngày hôm sau? Ảnh hưởng đến đơn hàng đang chờ xử lý không? |
| Giới hạn = 0 | **TODO (BA):** 0 có nghĩa là không giới hạn hay không được mua? |
| E01 chưa liên kết với công ty nào | Không áp dụng giới hạn — E01 mua tự do |

### Trợ giá

| Tình huống | Xử lý |
|---|---|
| Trợ giá 100% nhưng E01 không có phương thức thanh toán | **TODO (BA):** E01 có cần đăng ký thẻ không khi trợ giá 100%? |
| Company Admin tắt trợ giá | **TODO (BA):** Ảnh hưởng đến đơn hàng đang chờ thanh toán không? |
| Trợ giá thay đổi giữa chừng trong tháng | **TODO (BA):** Áp dụng từ thời điểm thay đổi hay từ đầu tháng tiếp theo? |
| Đơn hàng bị hoàn tiền (refund) khi có trợ giá | **TODO (BA):** Phần trợ giá có được hoàn về công ty không? Quy trình hoàn tiền chia theo ai chịu? |

---

## Acceptance Criteria

### Story 1 — QR Binding (E01)

- AC1.1: E01 có thể mở màn hình quét QR từ app.
- AC1.2: Khi quét QR hợp lệ của công ty có hợp đồng hiệu lực → tài khoản E01 được liên kết với công ty đó.
- AC1.3: Sau khi liên kết, app hiển thị tên công ty trên màn hình hồ sơ.
- AC1.4: Khi quét QR không hợp lệ hoặc hết hạn → hiển thị thông báo lỗi, không liên kết.
- AC1.5: Khi công ty hết hạn hợp đồng → không cho phép liên kết mới.

### Story 2 — Giới hạn mua trong ngày (E02)

- AC2.1: Company Admin có thể truy cập màn hình thiết lập giới hạn mua.
- AC2.2: Company Admin có thể nhập và lưu số lượng tối đa (số nguyên dương).
- AC2.3: Giới hạn được áp dụng cho toàn bộ nhân viên đã liên kết với công ty.
- AC2.4: Khi E01 đã đạt giới hạn trong ngày → không thể thêm món vào giỏ hàng, hiển thị thông báo rõ ràng.
- AC2.5: Giới hạn reset về 0 vào đầu ngày tiếp theo (theo timezone Nhật Bản — JST).

### Story 3 — Trợ giá (E02)

- AC3.1: Company Admin có thể thiết lập trợ giá theo hai chế độ: một phần hoặc 100%.
- AC3.2: Khi trợ giá một phần: E01 thấy giá sau trợ giá trên màn hình giỏ hàng và thanh toán.
- AC3.3: Khi trợ giá 100%: E01 thấy giá = 0 (hoặc "Miễn phí") trên màn hình thanh toán.
- AC3.4: Cài đặt trợ giá được lưu và áp dụng cho toàn bộ nhân viên đã liên kết.
- AC3.5: Lịch sử thay đổi cài đặt trợ giá được ghi lại (audit log).

---

## Out of Scope

- Quản lý danh sách nhân viên đã liên kết (xem/xóa từng người) — **TODO (BA):** xác nhận có trong scope Phase 2 không.
- Trợ giá theo từng nhân viên (không phải theo company) — chưa có trong domain.
- QR Generation — **TODO (BA):** mã QR được tạo ở đâu (System Admin hay Company Admin)? Tần suất hết hạn?
- Thống kê sử dụng phúc lợi per nhân viên — chưa xác định scope.
- Tích hợp HubSpot/Thomas cho domain này — không đề cập trong business flow.

---

## Screens

| Screen | Actor | App | Mô tả ngắn |
|---|---|---|---|
| Màn hình Liên kết Công ty (QR Scan) | E01 | E01 (es-kitchen-payment-app) | Hiển thị camera quét mã QR công ty; xác nhận liên kết thành công hoặc thông báo lỗi |
| Màn hình Hồ sơ — Trạng thái liên kết * inferred | E01 | E01 (es-kitchen-payment-app) | Hiển thị tên công ty đã liên kết; điểm vào để xem hoặc hủy liên kết |
| Màn hình Giỏ hàng / Checkout — Hiển thị trợ giá * inferred | E01 | E01 (es-kitchen-payment-app) | Hiển thị giá sau trợ giá (một phần hoặc 100% / "Miễn phí"); khóa thêm món khi đạt giới hạn ngày |
| Màn hình Thiết lập Phúc lợi Nhân viên | E02 | E02 (es-kitchen-web-company) | Cấu hình giới hạn số lượng mua trong ngày và mức trợ giá (một phần / 100%) cho toàn công ty |

---

## Bước tiếp theo

Chạy song song:

- "Hãy là Tech Lead Design, làm DESIGN.md từ SPEC này: `/Users/longtd/Desktop/WORK/AI_AGENTS_ES_KITCHEN/es-kitchen-docs/docs/features/user-binding/SPEC.md`"
- "Hãy là QC, sinh test cases từ SPEC này: `/Users/longtd/Desktop/WORK/AI_AGENTS_ES_KITCHEN/es-kitchen-docs/docs/features/user-binding/SPEC.md`"
  (slash command: `/test/generate_manual_testcases_rbt` cho FULL RBT / `/test/generate_testcases_from_requirements` cho QUICK)
- "Hãy là Designer, tạo UI-SPEC.md + Figma từ SPEC này: es-kitchen-docs/docs/features/user-binding/SPEC.md"
  (hoặc slash command: /create-ui-design es-kitchen-docs/docs/features/user-binding/SPEC.md)
