# BA TODOs — Câu hỏi cần khách hàng xác nhận

> Tổng hợp toàn bộ TODO (BA) inline từ các SPEC.md còn chưa được xác nhận.
> Mỗi dòng = 1 câu hỏi cần khách hàng trả lời để Tech Lead bắt đầu Design phase.
> Cách dùng: Khách hàng fill cột **"Trả lời của khách hàng"**. BA cập nhật SPEC.md tương ứng sau khi có câu trả lời.

**Tổng số câu hỏi còn mở:** 30  
**Cập nhật:** 2026-06-26 — đã xóa các câu đã được trả lời trong Qna_response_v1.xlsx

> **Đã clear hoàn toàn:** Contract Management · Delivery Partner · Delivery Driver · Menu & Order · Payment · Collection & Cancellation · Inventory & Equipment · User Binding

---

## 1. AGENCY MANAGEMENT (Đại lý)

SPEC: `agency-management/SPEC.md`

| ID | Section | Câu hỏi | Trả lời của khách hàng |
|---|---|---|---|
| AGN-01 | Auto-generate hoa hồng | Trigger tự động (cron job đầu tháng) hay System Admin kích hoạt thủ công? | |
| AGN-02 | Đăng ký đại lý | Trường bắt buộc cụ thể là gì (tên, email, SĐT, tỷ lệ hoa hồng…) — confirm danh sách đầy đủ. | |
| AGN-03 | Xóa referral | Khi pháp nhân đã có hợp đồng — có cho phép soft delete không? | |
| AGN-04 | Export CSV | Encoding (UTF-8 / Shift-JIS)? Các cột bắt buộc trong file export? | |
| AGN-05 | Audit log | Có yêu cầu audit log cho việc cập nhật trạng thái thanh toán hoa hồng không? | |
| AGN-06 | Phân trang | Ngưỡng page size? Các trường filter/sort khác ngoài tên? | |

---

## 2. SUPPLIER ORDERING (Đặt hàng NCC)

SPEC: `supplier-ordering/SPEC.md`

| ID | Section | Câu hỏi | Trả lời của khách hàng |
|---|---|---|---|
| SUP-02 | Sửa đơn sau khi Supplier phản hồi | System Admin đổi số lượng → Supplier có nhận thông báo không? Status đơn có reset về "Chờ phản hồi"? | |
| SUP-03 | Ngày dự kiến xuất hàng | Validate phải trước/bằng picking date? Vi phạm → lỗi hay cảnh báo? | |
| SUP-05 | Danh sách trạng thái | Xác nhận toàn bộ status & tên tab hiển thị (domain mới đề cập 2 status). | |
| SUP-06 | Đơn tạm tính đầu tháng | Auto hay manual? Gửi qua kênh nào (email/web)? Format lấy từ Google Sheet — cần confirm. | |
| SUP-07 | Lockout login | Số lần đăng nhập sai tối đa? Thời gian lock? | |
| SUP-08 | File đính kèm trong thông báo | Loại file cho phép (PDF/Excel/image)? Dung lượng tối đa? Ai có quyền đăng? | |
| SUP-09 | CSV encoding | UTF-8 BOM hay Shift-JIS? | |
| SUP-10 | Password policy | Độ dài, ký tự đặc biệt? | |

---

## 3. DELIVERY DISPATCHING (Giao hàng — Điều phối)

SPEC: `delivery-dispatching/SPEC.md`

| ID | Section | Câu hỏi | Trả lời của khách hàng |
|---|---|---|---|
| DSP-01 | Dời lịch khi picking rơi vào ngày nghỉ | Dời lên ngày trước hay ngày sau? Quy tắc cố định hay Admin chọn? | |
| DSP-02 | Import CSV ngày không picking | All-or-nothing hay partial import (skip lỗi)? | |
| DSP-03 | Yamato API fail | Admin có nhận alert không? Kênh nào (email/notification)? | |
| DSP-04 | Đổi lịch picking | Có gửi notification tự động cho Company Admin bị ảnh hưởng? | |
| DSP-05 | Duyệt yêu cầu đổi ngày | System Admin duyệt qua màn hình nào? Có SLA xử lý không? | |
| DSP-06 | Từ chối yêu cầu | Company Admin có nhận thông báo kèm lý do không? | |
| DSP-07 | CSV Thomas | Spec format Thomas — cần file sample hoặc tài liệu API. | |
| DSP-08 | Đề xuất delivery company | Thuật toán scoring tự tính hay có input từ System Admin? | |
| DSP-09 | List Recommended Delivery Companies | Có nằm trong Phase 2 scope không? | |
| DSP-10 | Thomas API integration | Cung cấp file spec Thomas. | |

---

## 4. MARKETING

SPEC: `marketing/SPEC.md`

| ID | Section | Câu hỏi | Trả lời của khách hàng |
|---|---|---|---|
| MKT-03 | HubSpot sync | 1 chiều hay 2 chiều? Trigger cron hay event? Tần suất? | |
| MKT-08 | Số tab UI | Domain mô tả 5 tab nhưng section là "4 tab" — xác nhận với Designer/Client. | |

---

## 5. SYSTEM OTHER (System Settings & Common)

SPEC: `system-other/SPEC.md`

| ID | Section | Câu hỏi | Trả lời của khách hàng |
|---|---|---|---|
| SYS-10 | SF-14 HubSpot sync | Tự động (scheduled) hay event? Tần suất? Cấu hình API key trên UI hay Parameter Store? | |

---

## 6. USER ENGAGEMENT

SPEC: `user-engagement/SPEC.md`

> Các mục dưới đây thuộc **CR (Change Request)** — chưa chốt với khách hàng.

| ID | Section | Câu hỏi | Trả lời của khách hàng |
|---|---|---|---|
| UEN-01 | Tutorial nội dung | System Admin cấu hình hay hard-code? | |
| UEN-03 | Product rating | Ngưỡng điểm kích hoạt cảnh báo (⚠️ badge) là bao nhiêu sao / bao nhiêu lượt? | |
| UEN-09 | Tutorial xem lại | Có nút "Xem lại hướng dẫn" trong Settings không? | |

---

## Hướng dẫn fill cho khách hàng

1. Fill cột **"Trả lời của khách hàng"** trực tiếp trên file này (hoặc copy sang Google Sheets).
2. Câu hỏi có **nhiều phần** → tách ra trả lời từng phần.
3. Nếu **chưa quyết được** → ghi `[ĐANG XEM XÉT]` để BA biết priority.
4. Nếu **không cần thiết cho Phase 2** → ghi `[PHASE 3]` để defer.

## Hướng dẫn cho BA sau khi có câu trả lời

- Cập nhật trực tiếp vào SPEC.md tương ứng (xóa marker `**TODO (BA):**`).
- Commit message: `docs(spec): resolve client clarifications batch 2`.
- Notify Tech Lead Design sau khi clear hết TODO ưu tiên cao của 1 feature.
