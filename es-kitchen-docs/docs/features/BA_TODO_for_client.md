# BA TODOs — Câu hỏi cần khách hàng xác nhận

> Tổng hợp toàn bộ TODO (BA) inline từ 15 SPEC.md được tạo từ Business Flow domains.
> Mỗi dòng = 1 câu hỏi cần khách hàng trả lời để Tech Lead bắt đầu Design phase.
> Cách dùng: Khách hàng fill cột **"Trả lời của khách hàng"**. BA cập nhật SPEC.md tương ứng sau khi có câu trả lời.

**Tổng số câu hỏi:** ~130
**Created:** 2026-06-04

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

## 2. CONTRACT MANAGEMENT (Hợp đồng)

SPEC: `contract-management/SPEC.md`

| ID | Section | Câu hỏi | Trả lời của khách hàng |
|---|---|---|---|
| CTR-01 | Kỳ nghỉ dài | Định nghĩa "kỳ nghỉ dài" do hệ thống quy định hay admin cấu hình? | |
| CTR-02 | Ngày loại trừ | Khoảng thời gian tối thiểu báo trước? Có giới hạn số ngày loại trừ/tháng không? | |
| CTR-03 | Ẩn gói | Gói đã ẩn nhưng đang có hợp đồng active → xử lý thế nào (tồn tại hay cảnh báo)? | |
| CTR-04 | Xóa | Soft delete hay hard delete? Domain Giao hàng cần biết để giữ lịch sử. | |
| CTR-05 | Yêu cầu thay đổi | Có SLA xử lý (vd 3 ngày làm việc)? Có cần email xác nhận tự động về Company Admin? | |
| CTR-06 | Lifecycle thiết bị | Ai quản lý lifecycle (System Admin hay quy trình ngoài hệ thống)? | |
| CTR-07 | Export CSV | Encoding UTF-8 hay Shift-JIS (tiêu chuẩn Nhật)? Fields nào cần export? | |

---

## 3. SUPPLIER ORDERING (Đặt hàng NCC)

SPEC: `supplier-ordering/SPEC.md`

| ID | Section | Câu hỏi | Trả lời của khách hàng |
|---|---|---|---|
| SUP-01 | Tạo tài khoản Supplier | System Admin tạo thủ công hay có flow tự đăng ký? | |
| SUP-02 | Sửa đơn sau khi Supplier phản hồi | System Admin đổi số lượng → Supplier có nhận thông báo không? Status đơn có reset về "Chờ phản hồi"? | |
| SUP-03 | Ngày dự kiến xuất hàng | Validate phải trước/bằng picking date? Vi phạm → lỗi hay cảnh báo? | |
| SUP-04 | Xóa Supplier có đơn pending | Block hay cho phép? Đơn pending xử lý thế nào? | |
| SUP-05 | Danh sách trạng thái | Xác nhận toàn bộ status & tên tab hiển thị (domain mới đề cập 2 status). | |
| SUP-06 | Đơn tạm tính đầu tháng | Auto hay manual? Gửi qua kênh nào (email/web)? Format lấy từ Google Sheet — cần confirm. | |
| SUP-07 | Lockout login | Số lần đăng nhập sai tối đa? Thời gian lock? | |
| SUP-08 | File đính kèm trong thông báo | Loại file cho phép (PDF/Excel/image)? Dung lượng tối đa? Ai có quyền đăng? | |
| SUP-09 | CSV encoding | UTF-8 BOM hay Shift-JIS? | |
| SUP-10 | Password policy | Độ dài, ký tự đặc biệt? | |

---

## 4. DELIVERY DISPATCHING (Giao hàng — Điều phối)

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

## 5. DELIVERY PARTNER (Giao hàng — Đối tác E05)

SPEC: `delivery-partner/SPEC.md`

| ID | Section | Câu hỏi | Trả lời của khách hàng |
|---|---|---|---|
| DPT-01 | Cấp tài khoản E05 | E03 cấp thủ công hay có flow tự động đăng ký? | |
| DPT-02 | Phân role nội bộ E05 | Portal có phân role (admin đối tác vs nhân viên) hay 1 role duy nhất? | |
| DPT-03 | Sai password nhiều lần | Có khóa tài khoản sau N lần sai? Flow mở khóa bởi E03 thế nào? | |
| DPT-04 | Xóa nhân viên đang phân công đơn | Block hay cho xóa rồi cảnh báo? | |
| DPT-05 | Password complexity | Độ dài tối thiểu, ký tự đặc biệt? | |
| DPT-06 | Push notification | Có cần thông báo đẩy khi có đơn mới không? | |

---

## 6. DELIVERY DRIVER (Giao hàng — Tài xế E06)

SPEC: `delivery-driver/SPEC.md`

| ID | Section | Câu hỏi | Trả lời của khách hàng |
|---|---|---|---|
| DRV-01 | Reset password | Qua email hay SMS OTP? Tự phục vụ hay qua admin? | |
| DRV-02 | Cờ "Giao lại" | Hệ thống tự tạo lịch mới hay admin xử lý thủ công? Status đơn thay đổi thế nào? | |
| DRV-03 | Thừa/thiếu hàng | Hệ thống tự notify E03 hay chỉ lưu log? | |
| DRV-04 | Không có đại diện ký | Bỏ qua chữ ký đại diện và chỉ tài xế ký? Hay cần lý do bắt buộc? | |
| DRV-05 | Offline mode | App có cần cache GPS + ảnh khi mất mạng rồi sync lại? | |

---

## 7. MARKETING

SPEC: `marketing/SPEC.md`

| ID | Section | Câu hỏi | Trả lời của khách hàng |
|---|---|---|---|
| MKT-01 | E01 Mobile Referral | E01 có flow Referral riêng (giới thiệu từ app) không? Domain index note nhưng không có story. | |
| MKT-02 | Referral trùng khách hàng | Hệ thống chặn hay chỉ warn khi referral công ty đã là khách hàng? | |
| MKT-03 | HubSpot sync | 1 chiều hay 2 chiều? Trigger cron hay event? | |
| MKT-04 | Xóa chiến dịch đã có giao hàng | Cho phép xóa hay chỉ cancel/archive? | |
| MKT-05 | Hủy referral | Rule này có hồi tố không (commission đã trả)? | |
| MKT-06 | Plan A/B commission | Tỷ lệ % cụ thể? Tính trên giá trị hợp đồng hay doanh thu thực tế? | |
| MKT-07 | Hủy đại lý | Referral đang active của đại lý xử lý thế nào? | |
| MKT-08 | Số tab UI | Domain mô tả 5 tab nhưng section là "4 tab" — xác nhận với Designer/Client. | |

---

## 8. MENU & ORDER

SPEC: `menu-order/SPEC.md`

| ID | Section | Câu hỏi | Trả lời của khách hàng |
|---|---|---|---|
| MNO-01 | Deadline chốt đơn | Cấu hình trong hợp đồng hay toàn hệ thống? E03 có gia hạn được không? | |
| MNO-02 | Vượt ngân sách | Cảnh báo có block submit hay chỉ warning? | |
| MNO-03 | Gói hợp đồng thay đổi giữa tháng | Giữ nguyên đơn cũ hay tính lại? | |
| MNO-04 | Upload PDF menu | Ngưỡng dung lượng PDF tự nén là bao nhiêu MB? | |
| MNO-05 | AI PRO | Phân quyền theo gói hợp đồng (chỉ cao cấp) hay tất cả E02? | |

---

## 9. SYSTEM OTHER (System Settings & Common)

SPEC: `system-other/SPEC.md`

| ID | Section | Câu hỏi | Trả lời của khách hàng |
|---|---|---|---|
| SYS-01 | SF-01 Notification | Liệt kê loại thông báo có thể bật/tắt (đặt hàng, giao hàng, khuyến mãi…)? | |
| SYS-02 | SF-02 Nhắc đặt vật tư | Kênh gửi (in-app/email/cả hai)? Lịch chốt đơn cố định hay cấu hình theo company? | |
| SYS-03 | SF-03 Notification category | Có phân loại (category/tag)? Có đã đọc/chưa đọc? | |
| SYS-04 | SF-06 Maintenance mode | Ảnh hưởng tất cả portal hay chọn riêng? E03 có bị ảnh hưởng (admin vẫn vào)? | |
| SYS-05 | SF-07 Version management | Read-only hay CRUD? Có liên kết force-update? | |
| SYS-06 | SF-09 Xóa tài khoản | Soft hay hard delete? Có kích hoạt lại được không? | |
| SYS-07 | SF-11 Personalization | Lưu per-user hay per-role? Default layout cho user mới? | |
| SYS-08 | SF-12 Dashboard metrics | Filter theo ngày/tuần/tháng? HubSpot real-time hay cache? | |
| SYS-09 | SF-13 Thông báo đã gửi | Sửa/xóa được? Nếu xóa, có ẩn trên portal E02? | |
| SYS-10 | SF-14 HubSpot sync | Tự động (scheduled) hay event? Tần suất? Cấu hình API key trên UI hay Parameter Store? | |
| SYS-11 | SF-15 Email E04 | Danh sách event trigger? E04 có opt-out từng loại? | |
| SYS-12 | SF-16 Operation Manual | Upload trực tiếp hay hard-link S3? E03 cập nhật được không? | |
| SYS-13 | SF-17 Email E05 | Danh sách event trigger? Email cá nhân driver hay email công ty? | |
| SYS-14 | SF-19 Push E06 | Danh sách event trigger? Driver tắt từng loại được không? | |
| SYS-15 | SF-09 Tắt Role active session | Quyền thu hồi ở request kế tiếp (không retroactive) — confirm behavior. | |
| SYS-16 | SF-07 Force-update | Flow từ chối user trên app khi chưa nâng cấp thế nào? | |
| SYS-17 | SF-16 Operation Manual upload | Ai upload và qua kênh nào? | |
| SYS-18 | SF-18 Email template | Có cần màn hình quản lý template email không? | |

---

## 10. TASK MANAGEMENT

SPEC: `task-management/SPEC.md`

| ID | Section | Câu hỏi | Trả lời của khách hàng |
|---|---|---|---|
| TSK-01 | Role nội bộ | Liệt kê Role nội bộ nào (ngoài System Admin) được phép xem/thao tác Task — cấu trúc phòng ban. | |
| TSK-02 | System Admin scope | Xem Task của TẤT CẢ phòng ban hay chỉ phòng ban mình? | |
| TSK-03 | Trigger auto-create | Liệt kê đầy đủ trigger ngoài "tạo hợp đồng" (hết hạn, sự cố giao hàng, hủy đơn…). | |
| TSK-04 | Chuyển trạng thái ngược | Done → In Progress có cho phép không? | |
| TSK-05 | Quyền sửa Task | Mọi người trong phòng ban đều sửa được, hay chỉ Assignee + Admin? | |
| TSK-06 | Story 5 placeholder | Confirm tính năng cụ thể của story này — hiện đang chờ mô tả. | |
| TSK-07 | Tạo Task thủ công | Role nào ngoài System Admin được phép? | |
| TSK-08 | Template variable | Liệt kê Trigger chính thức và biến động template được hỗ trợ. | |
| TSK-09 | Slack notification | Channel chung hay DM Assignee? Phân channel theo phòng ban? | |
| TSK-10 | Kanban touch drag-drop | Hỗ trợ mobile/tablet hay chỉ desktop? | |
| TSK-11 | Template Assignee = phòng ban rỗng | Task vẫn tạo nhưng unassigned, hay không tạo + báo lỗi? | |

---

## 11. PAYMENT (Thanh toán)

SPEC: `payment/SPEC.md`

| ID | Section | Câu hỏi | Trả lời của khách hàng |
|---|---|---|---|
| PAY-01 | Refund 30 phút | Trong scope Phase 2 không? Actor nào xử lý (E01 tự yêu cầu hay E03 thủ công)? | |
| PAY-02 | elepay timeout | Threshold? Hành động khi timeout (hủy intent hay retry)? | |
| PAY-03 | Subsidy | Trừ trực tiếp trên invoice elepay hay xử lý nội bộ? | |
| PAY-04 | Invoice contract không có order | Phát hành invoice trống hay skip? | |
| PAY-05 | E03 chỉnh hóa đơn | Chỉnh thủ công được không hay chỉ auto-fill? | |
| PAY-06 | Refund | Confirm scope refund. | |

---

## 12. COLLECTION & CANCELLATION (Thu tiền & Hủy)

SPEC: `collection-cancellation/SPEC.md`

| ID | Section | Câu hỏi | Trả lời của khách hàng |
|---|---|---|---|
| COL-01 | Upload biên lai E06 | Camera upload hay chỉ file picker từ gallery? | |
| COL-02 | Chênh lệch thu tiền | Tài xế nhập lý do bắt buộc? Real-time alert tới Outsource/System Admin? | |
| COL-03 | Disposal Report | Bắt buộc per ca hay optional? | |
| COL-04 | Xóa báo cáo "Đã thanh toán" | Cho phép xóa? Cần audit log? | |
| COL-05 | Nhiều lô cùng mặt hàng khác HSD | Giao diện hỗ trợ thêm nhiều dòng? | |
| COL-06 | Lịch sử báo cáo tài xế | Cho phép tài xế xem lại sau submit? | |
| COL-07 | Push notification submit | Cần push tới System/Outsource Admin? | |
| COL-08 | Export CSV thu tiền/hàng hủy | Có yêu cầu export không? | |

---

## 13. INVENTORY & EQUIPMENT (Tồn kho & Thiết bị)

SPEC: `inventory-equipment/SPEC.md`

| ID | Section | Câu hỏi | Trả lời của khách hàng |
|---|---|---|---|
| INV-01 | E02 scope | E02 Company Admin có quyền xem/thao tác bất kỳ màn hình nào không? Index ghi target có E02 nhưng story chỉ có E03. | |
| INV-02 | Equipment upgrade request | Yêu cầu từ E02 hay E03 tự tạo? Flow phê duyệt thế nào? | |
| INV-03 | Hàng dự kiến nhập kho upstream | Từ đơn đặt NCC hay import CSV Thomas? | |
| INV-04 | CSV Thomas spec | Định dạng đã được Thomas cung cấp chưa (cột/encoding/delimiter)? | |
| INV-05 | CSV Thomas lỗi xen kẽ | All-or-nothing hay skip dòng lỗi? | |
| INV-06 | Tồn kho âm | Cảnh báo hay block? | |
| INV-07 | Nhập thủ công ad-hoc | Cho phép tạo lô ngoài kế hoạch hay chỉ confirm từ danh sách dự kiến? | |

---

## 14. USER BINDING

SPEC: `user-binding/SPEC.md`

| ID | Section | Câu hỏi | Trả lời của khách hàng |
|---|---|---|---|
| UBD-01 | E01 đã liên kết công ty khác | Cho phép chuyển liên kết? Hủy cũ trước hay tự động thay thế? | |
| UBD-02 | E01 hủy liên kết | E01 tự hủy từ app được không hay cần Company Admin? | |
| UBD-03 | Thay đổi giới hạn mua | Áp dụng ngay hay ngày sau? Ảnh hưởng đơn đang chờ? | |
| UBD-04 | Giới hạn = 0 | Nghĩa là không giới hạn hay không được mua? | |
| UBD-05 | Trợ giá 100% | E01 có cần đăng ký thẻ không khi trợ giá 100%? | |
| UBD-06 | Tắt trợ giá | Ảnh hưởng đơn đang chờ thanh toán? | |
| UBD-07 | Trợ giá thay đổi giữa tháng | Áp dụng ngay hay đầu tháng sau? | |
| UBD-08 | Refund có trợ giá | Phần trợ giá có hoàn về công ty? Quy trình chia ai chịu? | |
| UBD-09 | Quản lý nhân viên đã liên kết | Trong scope Phase 2 không? | |
| UBD-10 | QR Generation | Ai tạo (System Admin hay Company Admin)? Tần suất hết hạn? | |

---

## 15. USER ENGAGEMENT

SPEC: `user-engagement/SPEC.md`

| ID | Section | Câu hỏi | Trả lời của khách hàng |
|---|---|---|---|
| UEN-01 | Tutorial nội dung | System Admin cấu hình hay hard-code? Có xem lại thủ công từ Settings? | |
| UEN-02 | Allergen filter | Mặc định: ẩn hay cảnh báo hay highlight? | |
| UEN-03 | Product rating | Ngưỡng điểm kích hoạt cảnh báo? Email hay notification nội bộ? | |
| UEN-04 | Recommendation | Rule-based hay ML? Tiêu chí "tương tự" là gì (category/supplier/giá…)? | |
| UEN-05 | Wish Survey | Survey riêng hay template trong ST-06? Ai xem kết quả (E03 hay E02)? | |
| UEN-06 | Feedback Form | Gửi E03 hay E02 hay cả hai? Có lưu lịch sử trong app? | |
| UEN-07 | Driver Rating | E03 xem lịch sử đánh giá tài xế? Tài xế xem điểm mình? | |
| UEN-08 | Survey kết quả | Ẩn danh hay hiển thị tên? Export PDF hay chỉ CSV? | |
| UEN-09 | Tutorial xem lại | Có nút "Xem lại hướng dẫn" trong Settings không? | |

---

## Hướng dẫn fill cho khách hàng

1. Fill cột **"Trả lời của khách hàng"** trực tiếp trên file này (hoặc copy sang Google Sheets).
2. Câu hỏi có **nhiều phần** → tách ra trả lời từng phần.
3. Nếu **chưa quyết được** → ghi `[ĐANG XEM XÉT]` để BA biết priority.
4. Nếu **không cần thiết cho Phase 2** → ghi `[PHASE 3]` để defer.

## Hướng dẫn cho BA sau khi có câu trả lời

- Cập nhật trực tiếp vào SPEC.md tương ứng (xóa marker `**TODO (BA):**`).
- Commit message: `docs(spec): resolve client clarifications batch 1`.
- Notify Tech Lead Design sau khi clear hết TODO ưu tiên cao của 1 feature.
