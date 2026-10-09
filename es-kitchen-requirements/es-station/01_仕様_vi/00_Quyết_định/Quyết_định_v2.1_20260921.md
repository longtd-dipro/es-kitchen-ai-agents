> **Đóng băng (bản gốc・05/10/2026). Từ nay không cập nhật nữa.** Các quyết định đang có hiệu lực hiện nay xem tại `docs/決定台帳.md`. Nơi chuyển đến của nội dung tệp này và các quyết định đã bị thay thế xem mục "G" của bảng tổng hợp quyết định.

# Quyết định v2.1 — 21/09/2026 (lần 2)

> **Các quyết định bổ sung・sửa đổi** phát sinh sau quyết định lần 1 ngày 21/09/2026 (`Cần_xác_nhận_Trả_lời_20260921.md`).
> **Nếu có điểm không khớp thì tài liệu này được ưu tiên**. Quyết định nào bị ghi đè được ghi ở cột "Ghi đè".
> Quy tắc phản ánh: **mỗi một quy tắc, nhất định phải sửa đồng thời 3 chỗ** — ① giải thích nghiệp vụ ② bảng state／batch ③ mô hình dữ liệu.
> Để ngăn tai nạn chỉ sửa phần đầu mà phần cuối vẫn là logic cũ.

## Thứ tự xử lý (sửa theo thứ tự này)

1. Xác định chính sách đổi ngày và `locked` → 2. Xác định final leg và "coi là hoàn tất" → 3. Sửa bảng chuyển trạng thái →
4. Sửa mô hình dữ liệu và ràng buộc duy nhất → 5. Sửa điều kiện batch → 6. **Cuối cùng** thống nhất UI・quyền hạn・thuật ngữ (2 bản demo ở bước này)

---

## 1. Đổi ngày sau hạn chót đặt hàng

| Giai đoạn | Việc có thể làm |
|---|---|
| **Trước hạn chót** | Vận hành có thể thay đổi **từng cái hoặc hàng loạt** |
| **Sau hạn chót・trước `locked`** | **Chỉ vận hành mới thay đổi được từng cái một**. **Bắt buộc có lý do**. Đối tượng **chỉ giới hạn ở bản ghi cần xác nhận** |
| **Sau `locked`** | **Không thay đổi ngày.** Xử lý bằng hủy ＋ nhân bản |

- 〔Ghi đè〕"Chỉ định ngày riêng lẻ thì lý do là tùy chọn" của #26 lần 1 **chỉ áp dụng cho thay đổi thông thường trước hạn chót**. **Thay đổi ngoại lệ sau hạn chót quay lại bắt buộc có lý do**.
- 〔Ghi đè〕Bổ sung điều kiện **"chỉ giới hạn ở bản ghi cần xác nhận"** vào "sau hạn chót, chỉ vận hành mới thay đổi được từng cái một ở màn hình chi tiết".
- 3 chỗ: ① §8-4 ② bảng chế độ đổi ngày・bảng quyền hạn ③ điều kiện cho phép thay đổi của `deliveries`.

## 2. Vai trò kho

- **Xóa hoàn toàn `Quản lý kho`.** Mọi thao tác của kho đều do **vận hành (logistics)** thực hiện.
- "Tab kho" trên màn hình **chỉ là bộ lọc dữ liệu** (không phải đơn vị quyền hạn).
- 3 chỗ: ① §9・§12 ② bảng quyền hạn ③ định nghĩa vai trò.

## 3. Điểm khởi đầu của `locked`

- **Chỉ có một trigger: thời điểm chỉ thị xuất hàng được gửi thành công lần đầu.**
- **Dù đã gắn số phiếu giao hàng cũng không `locked`.**
- Nếu số phiếu giao hàng xuất hiện trước chỉ thị xuất hàng thì **phát hiện・thông báo là anomaly (bất thường)**.
- 〔Ghi đè〕"Điểm khởi đầu của `locked` = thời điểm xuất ra vào 3 ngày (thứ Sáu) trước ngày bắt đầu gộp 2 tuần" của lần 1 được sửa thành dạng **điểm khởi đầu không phải là xuất ra mà là "gửi thành công"** (việc xuất gộp 2 tuần vẫn giữ lại như vấn đề "khi nào gửi").
- 3 chỗ: ① §8-2・§10-1 ② chuyển trạng thái・điều kiện batch ③ `deliveries.locked_at` và nhật ký chỉ thị xuất hàng.

## 4. Coi là hoàn tất và thiếu giao (phán đoán bằng final leg)

| Người vận chuyển của final leg (chặng cuối) | Cách xử lý hoàn tất | Cách xử lý thiếu giao |
|---|---|---|
| **Ứng dụng tài xế của ES** | **Không coi là hoàn tất** | Nếu sáng hôm sau vẫn chưa hoàn tất thì **chuyển vào missing queue (cần xác nhận)** |
| **Công ty vận tải giao trực tiếp** | **Coi là hoàn tất** | Chỉ khi khách hàng・công ty giao hàng liên lạc có bất thường thì mới chuyển xuống **Đang xác nhận** |

- 〔Ghi đè〕Bỏ phán đoán dựa trên loại chuyến "chuyến ủy thác thì xác định hoàn tất giao hàng bằng cách coi là", chuyển sang **phán đoán bằng final leg**.
- 3 chỗ: ① §11-2・§11-5 ② chuyển trạng thái・batch phát hiện thiếu giao ③ cờ chặng cuối của `delivery_legs`.

## 5. Nhân bản từ draft

- **Không thể nhân bản dữ liệu giao hàng từ draft.** Việc có thể làm ở draft chỉ là **"sao chép／thay đổi dự kiến"**.
- **Nhân bản** kèm `parent_delivery_id`・số nhánh・trạng thái **Đang xác nhận** **chỉ được thực hiện từ `published` hoặc `locked`**.
- 〔Ghi đè〕"Có thể thực hiện nhân bản từ bất kỳ `draft` / `published` / `locked` nào" của lần 1 bị **hủy bỏ**.
- 3 chỗ: ① §8-3 ② bảng chuyển trạng thái ③ ràng buộc của `parent_delivery_id`.

## 6. Khóa duy nhất của dự kiến (plan)

- Lấy **`contract_id` + `line_no` + `channel_id` + `cycle_id` + `occurrence_key`** làm khóa.
- **Không dùng `(contract_id, delivery_date)`.** Vì một hợp đồng có thể có nhiều nhóm nhiệt độ・phân loại giao hàng trong cùng một ngày.
- 〔Ghi đè〕"Dự kiến giao hàng duy nhất theo (ID hợp đồng, ngày giao hàng)" của REQ-DL-721 bị **hủy bỏ**.
- 3 chỗ: ① §7-2 ② điều kiện tạo lại (thay thế) ③ ràng buộc duy nhất của `shipping_plans`.

## 7. 3 trục của chuyến

- **Thêm `delivery_regime`**: `self` (tự công ty)／`partner_driver` (tài xế ủy thác)／`parcel_carrier` (công ty vận tải).
- **`service_form` (loại chuyến = chuyến COOL／chuyến giao ES) đặt ở phân loại giao hàng (delivery channel). Không đặt ở tuyến của hợp đồng.**
- **`relay` (trung chuyển) được suy ra từ route legs. Không lưu dưới dạng trạng thái.**
- 〔Ghi đè〕"Loại chuyến là hạng mục nhập do hợp đồng (hợp đồng con) nắm giữ" của #29 lần 1 được sửa thành dạng **giới hạn nơi nắm giữ ở "phân loại giao hàng"**. Việc không suy ra từ có hay không trung chuyển vẫn không đổi.
- 3 chỗ: ① §5-3・§11-1 ② phân nhánh theo loại chuyến ③ cột của `delivery_channels`・`delivery_legs`.

## 8. Khi có nhiều khung giờ nhận hàng

- Tạo bảng con **`site_receive_windows(site_id, from_time, to_time, sort_order)`**.
- Khi tạo dữ liệu giao hàng thì **chụp snapshot nguyên danh sách** (`delivery_receive_windows`).
- **Không giữ dưới dạng chỉ 1 cặp from/to.**
- 〔Ghi đè〕Cụ thể hóa "Giữ khung giờ nhận hàng dưới dạng một hạng mục" của #22 lần 1 thành **phương thức bảng con**.
- 3 chỗ: ① §5-5・§12-2 ② thời điểm snapshot ③ 2 bảng.

## 9. Hạn chót tạm (provisional deadline)

- Khi `marker_source = provisional`, việc có thể làm chỉ là **hạn chót tiếp nhận thay đổi và khởi động kiểm tra**.
- **Không chạy xác định số lượng・gửi email xác nhận・chỉ thị xuất hàng cho đến khi hạn chót thật từ menu tới.**
- 〔Ghi đè〕Bổ sung giới hạn **phạm vi được phép làm bằng hạn chót tạm** vào #33 lần 1 "Nếu chưa đăng ký menu thì lấy ngày 15 tháng trước làm hạn chót tạm".
- 3 chỗ: ① §4-3・§7-4 ② điều kiện kích hoạt batch ③ `delivery_cycles.marker_source`.

## 10. Hạn thanh toán (hạn nhận tiền)

- **Tách hóa đơn bằng `billing_type` hoặc `payment_due_date`.**
- **Một hóa đơn chỉ có một hạn thanh toán.** Nếu trả trước và quyết toán thực tế có hạn khác nhau thì **tách thành 2 hóa đơn**.
- Việc chọn một hạn chung **không áp dụng vì khó đối chiếu (bù trừ)**.
- 〔Ghi đè〕Cụ thể hóa #71 lần 1 "Giữ hạn nhận tiền dưới dạng hạng mục (phần trả trước／phần quyết toán thực tế)" thành dạng **tách hóa đơn**.
- 3 chỗ: ① §14-4 ② batch thanh toán ③ khóa tách của `invoices`.

## 11. Khi tháng chu kỳ rơi vào tình huống 14 đối 14

- Định nghĩa **tháng chu kỳ ＝ tháng chứa ô thứ 14 (`B7`)**.
- Quy tắc này cho **kết quả giống** với "tháng có nhiều ngày hơn", và khi 14 đối 14 thì **tự động là tháng trước**.
- **Không tạo nhánh ngoại lệ.**
- 〔Ghi đè〕"Khi bằng nhau thì chưa quyết・tạm thời" của #41 lần 1 đã được **giải quyết**. Loại khỏi các vấn đề chưa quyết của §18.
- 3 chỗ: ① §2-3 ② đánh số hợp đồng con ③ suy ra `delivery_cycles.cycle_month`.

---

## Những điều sửa kèm

| # | Nội dung | 3 chỗ |
|---|---|---|
| S1 | **`shipping_plans` giữ `estimated_qty` bên trong.** Tuy nhiên **ở draft không cho doanh nghiệp thấy số lượng**. Không ghi "dự kiến không có số lượng" trong khi schema đang có số dự kiến | ① §7-1・hình 1・hình 4 ② điều kiện hiển thị của draft ③ `shipping_plans.estimated_qty` |
| S2 | **Trường hợp hợp đồng con đã được tạo trước do trả trước một lần cả năm, v.v., dự kiến dùng snapshot tuyến của hợp đồng con.** Chỉ dùng hợp đồng cha **khi chưa có con** | ① §5-2・§7-6 ② batch tạo dự kiến ③ phán đoán nguồn snapshot |
| S3 | **Đặt tiêu đề・phiên bản của tài liệu là v2.1** | — |
| S4 | **Đổi tiêu đề của §11-2 từ "Chuyến ủy thác" → "Trường hợp công ty vận tải giao trực tiếp chặng cuối"** | ① §11-2 |
| S5 | **Tách 2 máy trạng thái.** `plan lifecycle` ＝ `draft / published / locked`, `delivery status` ＝ `Chờ xuất hàng / … / Đã giao`. **Không gọi gộp cả hai là "trạng thái"** | ① thuật ngữ ② chia bảng chuyển trạng thái thành 2 ③ `shipping_plans.lifecycle` và `deliveries.status` |
