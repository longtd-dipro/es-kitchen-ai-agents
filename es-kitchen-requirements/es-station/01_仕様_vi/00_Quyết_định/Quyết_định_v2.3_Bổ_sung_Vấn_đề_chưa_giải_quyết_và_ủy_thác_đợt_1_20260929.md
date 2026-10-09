> **Đã đóng băng (bản gốc, 2026-10-05). Không cập nhật thêm.** Các quyết định đang có hiệu lực hiện nay nằm ở `docs/決定台帳.md`. Nội dung file này được chuyển đi đâu và những quyết định đã bị thay thế, xem mục "G" của sổ cái quyết định.

# Quyết định v2.3 Bổ sung 4 — 29/09/2026 (Giải quyết các vấn đề chưa giải quyết, và trường hợp chặng 1 do đơn vị giao hàng ủy thác đảm nhận)

> Bổ sung tiếp theo `Quyết_định_v2.3_Bổ_sung_Rà_soát_trouble_20260929.md` (#27〜#33). **Phiên bản vẫn là v2.3**. Số thứ tự tiếp tục từ #34. Trích dẫn dạng 〔Quyết định v2.3 #NN〕.
> Nguyên nhân: `Giao_hàng_Vấn_đề_chưa_giải_quyết_và_phương_án_v1.md` (29/09/2026). **Phản hồi của hong ngày 29/09/2026: tiến hành theo phương án đề xuất / trường hợp chặng 1 là ủy thác và có trung chuyển là có thực.**
> Quy tắc phản ánh như trước: **sửa đồng thời 3 chỗ: ① mô tả nghiệp vụ ② bảng state / batch ③ mô hình dữ liệu**.

---

## A. Quy định của bên vận hành

### 34. Phạm vi hiển thị trên site chuyên dụng của công ty giao hàng ủy thác (A-1・giải quyết Tổng hợp §18 No.1)

- **Dữ liệu giao hàng đã xác định (sau hạn chốt đơn)**: toàn bộ mục (tên cơ sở・địa chỉ・ngày giao hàng・nhóm nhiệt độ・số lượng・điều kiện giao hàng・phiếu vận chuyển).
- **Dự kiến (trước hạn chốt)**: **đến Chu kỳ tháng sau**. **Chỉ ngày giao hàng・tên cơ sở・nhóm nhiệt độ・số lượng bản ghi** (không hiển thị số lượng). Gắn dấu "Dự kiến".
- Chỉ nhìn thấy **các giao hàng có chặng (leg) do công ty mình phụ trách** (#51).
- Màn hình tái sử dụng "Lịch tháng・tuần・ngày" của bên vận hành cho Web công ty giao hàng ủy thác (theme carrier).

### 35. Thông báo tự động cho sản phẩm có hạn tiêu dùng ngắn (A-2・giải quyết Tổng hợp §18 No.6)

- Giao hàng có chứa sản phẩm mà **Số ngày từ ngày xuất hàng đến ngày giao hàng ＞ Số ngày hạn tiêu dùng của sản phẩm (`products.shelf_life_days`) − Số ngày an toàn** sẽ được đưa vào Cần xác nhận **`shelf_life_warning`**.
- Số ngày an toàn là **1 thiết lập chung toàn công ty** (`shelf_life_safety_days`・mặc định **2 ngày**).
- Thời điểm phán định: khi tạo・tính lại dự kiến (khi lead time kéo dài do chuyển lịch), khi thay đổi kho, khi nhân bản.
- Có tách giao hàng hay không vẫn do **bên vận hành quyết định** như trước (không tự động tách).

### 36. Thời điểm tạo dữ liệu giao hàng vật tư (A-3・giải quyết Tổng hợp §20 #22・#35)

- **Mỗi lần xác nhận giỏ hàng vật tư** thì tạo dữ liệu giao hàng.
- **Nếu có dữ liệu giao hàng vật tư cùng cơ sở・cùng ngày giao hàng・chưa gửi chỉ thị xuất hàng thì thêm chi tiết vào đó và gộp thành 1** (không tạo mới).
- Chỉ thị xuất hàng được gửi bằng việc lấy hàng hằng ngày hiện có (catch-up).

### 37. Khi yêu cầu thay đổi của doanh nghiệp vẫn ở trạng thái "Đang xử lý" (A-4・giải quyết Tổng hợp §20 #19)

- **Hạn xử lý = hạn chốt đơn của giao hàng đó.**
- **Trước hạn chốt 3 ngày** đưa vào Cần xác nhận **`change_request_due`** (số ngày theo thiết lập `change_request_warn_days`・mặc định 3 ngày).
- Nếu quá hạn chốt mà chưa xử lý thì **giữ lại trong Cần xác nhận cho đến khi bên vận hành xử lý**. **Hệ thống không tự động từ chối** (như trước).

### 38. Ý nghĩa của lead time giao hàng từng lần (vật tư) (A-5・giải quyết Tổng hợp §20 #18)

- Giống các mẫu giao hàng khác, **ngày xuất hàng = ngày giao hàng − lead time**.
- Ngày giao hàng vật tư là **"ngày giao hàng khả dụng đầu tiên từ ngày sau ngày đặt hàng trở đi mà có thể đảm bảo lead time"** (phán định ngày lễ giao hàng・thứ không giao được・ngày không nhận được・ngày không xuất được giống bình thường. Vật tư nằm ngoài Chu kỳ nên không phán định tạm dừng Chu kỳ).

### 39. Ghi nhận hàng thay thế (A-6)

- Thêm **`substituted_from_product_id` (sản phẩm gốc được thay thế)** vào `delivery_lines`. 1 dòng = sản phẩm thực tế đã giao.
- **Thanh toán tính theo đơn giá của sản phẩm gốc** (để thực hiện được quyết định "thanh toán theo giá của sản phẩm ban đầu").
- Đăng ký khi chọn "Giao toàn bộ bằng hàng thay thế" trong xử lý sự cố, và khi sửa thực tích (chỉ bên vận hành・bắt buộc lý do).

### 40. Cước vận chuyển khi hủy (A-7)

- **Dùng cả cho trường hợp hủy** cờ "Tính / không tính cước vận chuyển" của giao lại. Đổi tên cột thành **`freight_billable`** (lý do là `freight_bill_reason`) (trước đây là `redelivery_billable`). Mặc định là "không tính", khi chuyển thành "tính" thì bắt buộc lý do.
- Không tính tiền sản phẩm (như trước). Hủy bỏ là `delivery_lines.disposed_qty`, việc trả lại sản phẩm còn lại là #41.

### 41. Trả sản phẩm còn lại về trụ sở chính (A-8)

- Thêm **"Trả hàng" (`duplicate_type = return`)** vào lý do nhân bản. **Chỉ khi trả hàng mới có thể đổi nơi giao sang nơi trả hàng**.
- Nơi trả hàng được chọn từ các cơ sở (trụ sở chính, v.v.) **đã đăng ký trong Master kho với `warehouse_type = return` (nơi trả hàng)**. Giữ ở `deliveries.return_to_warehouse_id`, snapshot địa chỉ là địa chỉ của nơi trả hàng.
- Số lượng là số lượng còn lại. **Ngoài đối tượng thanh toán**. Quy tắc cha-con 1 cấp・số nhánh giống nhân bản.

### 42. Tên hiển thị trên Web doanh nghiệp (A-9)

Ngoài trạng thái, giữ **tên hiển thị dành cho Web doanh nghiệp** (không đổi tên trạng thái của Web vận hành).

| Trạng thái・tình trạng phía vận hành | Hiển thị trên Web doanh nghiệp |
|---|---|
| Hủy (có chuyến thay thế) | Đang điều chỉnh ngày giao hàng |
| Có báo cáo sự cố chưa giải quyết (trạng thái là Đã xuất hàng, v.v.) | Giữ nguyên trạng thái + chú thích "Đang kiểm tra tình trạng giao hàng" |
| Con (đang xác nhận) | Đang chuẩn bị giao lại |
| Đã giao một phần | Đã giao một phần |
| Chờ giao lại | Dự kiến giao lại |
| Hủy (không có chuyến thay thế)・Dừng | Dừng giao hàng |

- 〔Ghi đè〕Thay thế "hiển thị là 'Đang xác nhận' cho doanh nghiệp" ở Tổng hợp §13-2 ① bằng "Đang điều chỉnh ngày giao hàng".

### 43. Cần xác nhận khi chưa đặt tài xế (A-10)

- Cần xác nhận `assignment_missing` được thống nhất thành 1 loại: **"khi đến 'ngày trước ngày giao hàng' mà chặng cần phân công (#48) vẫn chưa có người phụ trách"**.
- 〔Ghi đè〕Thay thế "nếu chưa phân công tại thời điểm lock thì Cần xác nhận" ở DEV §13.1 và "dưới 1 tuần trước ngày giao hàng mà chưa phân công" ở Tổng hợp §8-5. Trước đó xem bằng huy hiệu "Chưa phân công N mục" trong hiển thị tháng・tuần.

### 44. 6 mục tạm thời (A-11)

- Ý nghĩa của `HU`, mã kho, nguồn dữ liệu ngày lễ, tên chính thức của Yamato / Thomas, việc không thu hồi túi giữ lạnh, số điện thoại liên hệ: **tiến hành triển khai với giá trị tạm thời**. Gộp 6 mục thành 1 bảng xác nhận gửi cho bên vận hành, khi có phản hồi thì thay nội dung.

## B. Những việc cần vendor xác nhận

### 45. Chỉ thị xuất hàng của Thomas (B-1)

- Hủy **chốt theo phương thức gửi lại (phiên bản mới với số lượng 0)**. Dù có I/F hủy cũng không dùng.
- CSV triển khai với các mục tối thiểu của DEV §19.1, **thiết kế để chỉ thay được phần xuất ra**. Khi nhận được thứ tự・tên cột thì chỉ sửa phần xuất ra.
- Nếu không hỗ trợ được UTF-8 thì **chuyển sang Shift_JIS khi xuất ra**.

### 46. Các mục giao cho Yamato (B-2・tạm thời)

- Người nhận khi giao đến văn phòng giữ hàng: **công ty giao hàng ủy thác đến nhận**. Ghi tên cơ sở và số giao hàng vào ô ghi chú.
- Ngày giao dự kiến: **ngày hàng đến văn phòng** (tính từ giá trị tham khảo lead time chặng 1).
- Nếu CSV của Thomas không có cột thì **xuất riêng CSV dành cho phiếu vận chuyển**.
- Coi là **tạm thời đang chờ xác nhận với Yamato** (Tổng hợp §18 No.19 đổi thành "Tạm thời").

## C. Khi chặng 1 là công ty giao hàng ủy thác (có thực)

### 47. ES đánh số phiếu vận chuyển của chuyến lấy hàng (D-1・triển khai Quyết định #55)

- Thêm **`es_generated`** vào `delivery_tracking_numbers.issued_by`. Giữ `box_no`・`box_total`.
- Số là **Số giao hàng + số thùng 2 chữ số** (ví dụ: `DL-261020-0021-01`).
- **Tại thời điểm gửi chỉ thị xuất hàng thành công, tạo theo số thùng dự kiến**. Nếu số thùng của thực tích xuất hàng khác thì thêm phần thiếu, phần dư chuyển thành `voided`.
- Không hiển thị link trang tra cứu.

### 48. Chặng phân công tài xế (D-2)

- **Chặng do công ty vận chuyển (`parcel_carrier`) chở thì không phân công. Chặng do công ty mình (`self`)・ủy thác (`partner_driver`) chở thì phân công.** Quyết định theo người chở của chặng, không phân biệt chặng 1・chặng 2.
- 〔Ghi đè〕Thay thế Quyết định #60 "Vận hành trước mắt chỉ phân công chặng 2 (chặng 1 do công ty vận chuyển chở)".
- Với chặng ủy thác, công ty giao hàng ủy thác đó cũng có thể phân công tài xế của mình (như trước).

### 49. Ghi nhận việc bàn giao tại điểm trung chuyển (D-3)

- **Không tăng trạng thái** (giữ quyết định không có trạng thái giữa chừng của trung chuyển).
- Thêm **`picked_up_at`・`picked_up_by`** (thời điểm nhận・người nhận của từng chặng) vào `delivery_legs`.
- **Trạng thái Đã nhận là khi lần đầu tiên nhận bằng app của ES** (nếu chặng 1 là ủy thác thì là nhận tại kho). Khi tài xế chặng 2 thực hiện "Nhận hàng" tại điểm trung chuyển thì chỉ ghi thời điểm nhận của chặng đó (trạng thái vẫn là Đã nhận).
- Trường hợp chặng cuối chưa nhận mà đã đến sáng hôm sau của ngày giao hàng thì được phát hiện bằng phát hiện thiếu giao hiện có (`delivery_detect_missing`).

### 50. Công ty giao hàng・điểm trung chuyển chọn được trong thiết lập giao hàng theo hợp đồng (D-4)

- Cả chặng 1 và chặng 2 đều có thể chọn từ **toàn bộ Master công ty giao hàng** (công ty vận chuyển・ủy thác・công ty mình).
- Điểm trung chuyển được chọn từ **toàn bộ trung chuyển (`HU`) trong Master kho**. Cơ sở của công ty giao hàng ủy thác cũng có thể đăng ký làm điểm trung chuyển.

### 51. Phạm vi nhìn thấy trên Web công ty giao hàng ủy thác (D-5)

- Công ty giao hàng ủy thác chỉ nhìn thấy **các giao hàng có chặng do công ty mình phụ trách**.
- Chỉ thao tác được chặng của công ty mình (phụ trách chặng 1 đến khi nhận tại kho, phụ trách chặng 2 từ nhận tại điểm trung chuyển đến giao hàng).

## D. Công việc phía chúng tôi (không phải quyết định mà là hạng mục công việc)

- Bổ sung các mục liên quan đến giao hàng vào danh sách mục (`Doanh_nghiệp_Cơ_sở_Hợp_đồng_Hợp_đồng_con_Danh_sách_mục`): **chưa xử lý** (sửa script tạo `items.py` rồi tạo lại).
- Ước tính dung lượng lưu trữ ảnh (tạm thời): 1 ngày 600 mục × 4 ảnh × 0.3MB ≒ khoảng 0.7GB/ngày・khoảng 21GB/tháng, lưu ảnh sự cố 12 tháng khoảng 260GB. Ghi vào Tổng hợp §17-4 như giá trị tạm thời.
- Tổng hợp §18 No.3 (xác nhận đặc tả hiện tại của màn hình thanh toán・hợp đồng / đơn đăng ký): cập nhật là đã giải quyết một phần bằng các quyết định 25/09・28/09.

---

## Tóm tắt mô hình dữ liệu (chi tiết xem DEV §14)

| Đối tượng | Thay đổi | Quyết định |
|---|---|---|
| `delivery_lines` | Thêm `substituted_from_product_id NULL` | #39 |
| `deliveries` | `redelivery_billable` → **`freight_billable`** (giao lại・hủy). Thêm `return_to_warehouse_id NULL`. Thêm `return` vào `duplicate_type` | #40・#41 |
| `warehouses` | Thêm `return` (nơi trả hàng) vào `warehouse_type` | #41 |
| `delivery_tracking_numbers` | Thêm `es_generated` vào `issued_by`. Thêm `box_no`・`box_total` | #47 |
| `delivery_legs` | Thêm `picked_up_at NULL`・`picked_up_by NULL` | #49 |
| `review_items.kind` | Thêm `shelf_life_warning`・`change_request_due` | #35・#37 |
| Thiết lập vận hành | `shelf_life_safety_days` (mặc định 2)・`change_request_warn_days` (mặc định 3) | #35・#37 |

## Tình trạng phản ánh

| Tài liệu | Trạng thái |
|---|---|
| Đặc tả DEV / Đặc tả tổng hợp (+HTML) | Đã phản ánh 29/09/2026 |
| Đặc tả thiết lập Chu kỳ giao hàng / Đặc tả yêu cầu chi tiết (biên bản họp) / Flow xử lý sự cố・hủy giao hàng_vi | Đã phản ánh 29/09/2026 |
| Danh sách mục | Chưa phản ánh (hạng mục công việc) |
| Thiết kế (artifact) + demo thao tác | Đã phản ánh 29/09/2026 (Version 27). 2 demo (Picking・Dự kiến lịch) chưa phản ánh |
