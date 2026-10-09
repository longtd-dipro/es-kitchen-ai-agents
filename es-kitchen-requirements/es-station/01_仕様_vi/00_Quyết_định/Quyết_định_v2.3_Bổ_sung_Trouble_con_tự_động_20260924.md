> **Đã đóng băng (bản gốc · 2026-10-05). Từ nay không cập nhật.** Các quyết định đang có hiệu lực xem `docs/決定台帳.md`. Nơi chuyển nội dung của tệp này và các quyết định đã bị thay thế xem mục "G" trong sổ cái.

# Quyết định v2.3 bổ sung 2 — 2026/09/24 (Con tự động của sự cố)

> Bổ sung tiếp theo `Quyết_định_v2.3_20260923.md` (lần 4 + bổ sung #11〜#19). **Phiên bản vẫn là v2.3** (Đặc tả DEV cũng ghi "phản ánh các quyết định bổ sung ngày v2.3・2026-09-24"). Đánh số tiếp từ #20. Trích dẫn dạng [Quyết định v2.3 #NN].
> **Bản chính là Đặc tả DEV**: `01_仕様/10_Giao_hàng/Đặc_tả_DEV_Chu_kỳ_Xuất_hàng_Picking_Giao_hàng_VI_v2.3.md` §9.4・§10.2・§12.1・§12.2・§13.2.1・§13.3・§13.4・§14.6・§14.7・§14.11・§15.11・§15.12・§16.8.1・§16.9・§16.10・§16.13・§17.1・§18 (bản cập nhật hong 2026/09/24). Tài liệu này là bản tóm tắt, nếu có khác biệt thì DEV là chuẩn.
> Quy tắc phản ánh như trước: **sửa đồng thời 3 chỗ: ① mô tả nghiệp vụ ② bảng state／batch ③ mô hình dữ liệu**.

---

## 20. Báo cáo sự cố không làm thay đổi trạng thái của cha

- Cha **giữ nguyên trạng thái tại thời điểm xảy ra sự cố**: `出荷済` (Đã xuất hàng) hoặc `受取済` (Đã nhận). **Liên hệ sau giao hàng (khiếu nại) vẫn giữ `納品済` (Đã giao hàng)**. Ghi lại báo cáo sự cố và mở mục cần xác nhận.
- [Ghi đè] Bãi bỏ "出荷済／受取済 → 確認中 (báo cáo sự cố)" và "納品済 → 確認中 (liên hệ sau giao hàng)".
- **`確認中` (Đang xác nhận) trong luồng sự cố chỉ do con chưa xuất hàng (`shipped_date IS NULL`) và ứng viên phục hồi sử dụng.**
- Các trạng thái cuối như trước: `納品済`／`一部納品済` (Đã giao một phần)／`再配達待` (Chờ giao lại)／`中止` (Hủy giao)／`取消` (Hủy bỏ). Liên hệ sau giao hàng mở mục cần xác nhận, nhưng không đưa `納品済` trở lại `確認中`.

## 21. Vận hành (logistics) trực tiếp giải quyết cha

Batch không quyết định cách giải quyết cha. **Người giải quyết là vận hành (logistics)**. Nếu có con tự động (#22) thì xử lý trong cùng transaction.

| Cách giải quyết | Cha | Xử lý con tự động |
|---|---|---|
| Giao đủ toàn bộ / toàn bộ bằng hàng thay thế | `納品済` | `取消` (lý do `auto child not needed`) |
| Giao một phần | `一部納品済` | **Tái sử dụng**: `duplicate_type=remainder`, số lượng・chi tiết = số lượng còn lại |
| Giao lại toàn bộ | `再配達待` | **Tái sử dụng**: `duplicate_type=redelivery`, số lượng・chi tiết = toàn bộ |
| Quay lại trong ngày | `受取済` | `取消` |
| Không giao | `中止` | `取消` |

- Điểm xuất phát: giao một phần・giao lại・hủy giao・quay lại trong ngày đi từ `出荷済`／`受取済`. Giao đủ toàn bộ đi từ `出荷済`／`受取済`／`納品済`.
- **Nếu đã có con tự động thì không tạo con thứ 2.** API nhân bản thủ công cũng tái sử dụng con nếu sự cố đó đã có con, và từ chối con thứ 2 (`DOMAIN_TROUBLE_CHILD_EXISTS`).
- Nếu không có con tự động, với giao một phần・giao lại vẫn tạo con bằng nhân bản như trước.

## 22. Sự cố không được giải quyết đến hạn thì tạo con tự động

- `auto_duplicate_due_at = reported_at + trouble_auto_duplicate_after_minutes`. **SLA (phút) là bắt buộc trong cấu hình vận hành, không hard-code trong batch**. Thời gian là UTC giống các mốc nghiệp vụ khác.
- Điều kiện: có báo cáo sự cố chính thức／cha ở `出荷済`・`受取済`・`納品済`／báo cáo chưa được giải quyết／đã quá `auto_duplicate_due_at`／báo cáo đó chưa có con. **Không tạo chỉ vì giao hàng chưa hoàn tất.**
- Con tự động: `確認中`, `duplicate_type=trouble_pending`, `creation_source=trouble_timeout`, `schedule_confirmed=false`, `quantity_confirmed=false`.
- Giống nhân bản, sao chép toàn bộ snapshot nơi giao・điều kiện giao hàng・khung giờ nhận・`delivery_legs`. Không sao chép phiếu vận chuyển・phân công・tệp đính kèm. Giữ quan hệ cha-con 1 cấp・số nhánh 1〜9.
- Ngày dự kiến chỉ là **giá trị tạm để hiển thị**. Số lượng là **giá trị tạm theo số lượng tối đa có thể gửi lại**, không dùng cho xuất hàng・thanh toán.
- **Mỗi báo cáo sự cố có tối đa 1 con.** Khi batch chạy lại thì UPSERT／idempotent theo `source_trouble_report_id`.
- Tạo・cập nhật mục cần xác nhận `review_items.kind = trouble_auto_child_pending` (đối tượng là con).

## 23. Con tự động chưa xác nhận không tham gia bất kỳ việc gì

Con `trouble_pending` nằm ngoài đối tượng của **chỉ thị xuất hàng・phiếu vận chuyển・phân công tài xế・thanh toán・thông báo・coi như hoàn tất** cho đến khi vận hành xác nhận.

- Bổ sung vào điều kiện gửi chỉ thị xuất hàng: `schedule_confirmed=true` và `quantity_confirmed=true`, và không có `duplicate_type=trouble_pending` chưa được giải quyết.

## 24. Điều kiện đưa con tự động sang `出荷待`

- Chỉ khi vận hành (logistics) xác nhận cách giải quyết sự cố của cha cùng số lượng・ngày giao và đặt `quantity_confirmed=true`・`schedule_confirmed=true` thì mới `確認中 → 出荷待` (Chờ xuất hàng). Nếu chưa xác nhận thì `DOMAIN_TROUBLE_CHILD_UNCONFIRMED`.
- Với cách giải quyết không cần gửi lại (bảng #21), trong cùng transaction chuyển con tự động `確認中 → 取消` (bắt buộc có lý do).
- Khi giải quyết, mục cần xác nhận `trouble_auto_child_pending` cũng được đóng trong cùng transaction.

## 25. Batch

- **Tạo mới `trouble_auto_duplicate`** (DEV §16.8.1). Độc lập với chuỗi job chính. **Trong cùng ngày giờ nghiệp vụ, chạy trước `delivery_presume_complete`／`delivery_detect_missing`.**
- `delivery_presume_complete`: đơn có `status = 出荷済` và **không có báo cáo sự cố chưa giải quyết** (final leg là `parcel_carrier`).
- `delivery_detect_missing`: đơn có `status IN (出荷済, 受取済)` và **không có báo cáo sự cố chưa giải quyết** (final leg là `self`／`partner_driver`).

## 26. Mô hình dữ liệu (chi tiết xem DEV §14)

| Bảng | Bổ sung |
|---|---|
| `deliveries` | `duplicate_type(remainder｜redelivery｜alternative｜trouble_pending) NULL`, `creation_source(materialize｜ops_duplicate｜trouble_timeout)`, `source_trouble_report_id NULL`, `schedule_confirmed`, `quantity_confirmed`. **`UNIQUE(source_trouble_report_id) WHERE source_trouble_report_id IS NOT NULL`** |
| `trouble_reports` | `auto_duplicate_due_at` |
| `review_items.kind` | `trouble_auto_child_pending` |
| Mã lỗi | `DOMAIN_TROUBLE_CHILD_EXISTS`, `DOMAIN_TROUBLE_CHILD_UNCONFIRMED` |

- Tạo xác nhận thông thường: `creation_source=materialize`・`schedule_confirmed=true`・`quantity_confirmed` là true khi số lượng được xác nhận.
- Transaction: tạo con tự động = báo cáo sự cố + khóa cha + con + mục cần xác nhận + audit. Giải quyết sự cố có con tự động = giải quyết cha + cập nhật／hủy con + giải quyết mục cần xác nhận + audit.

---

## Tình trạng phản ánh

| Tài liệu | Trạng thái |
|---|---|
| `01_仕様/10_Giao_hàng/DEV仕様書_…_VI_v2.3.md` | **Đã phản ánh** (dùng nguyên bản cập nhật của hong `00_確認してほしい/サイクル/…_更新20260924.md`) |
| `04_資料/出荷ピッキング_フロー図_VI.html` | **Đã phản ánh** (dùng nguyên bản cập nhật của hong) |
| `01_仕様/10_Giao_hàng/統合仕様書_…_v2.3.md` | **Đã phản ánh**: §0-2D (mới)／§0-3〜0-6／§1-2・§1-4／§2-1／§7-7／§8-4／§10-1／§11-2・§11-4・§11-5・§11-7 (đổi tiêu đề)／§12-1／§13-1〜13-5・§13-7／§14-2・§14-3／§15-2・§15-9／§16／§17／§18／§19-5 (mới). Đã sửa hình 4 (`統合仕様書_図.py`) và tạo lại HTML |
| `01_仕様/10_Giao_hàng/Đặc_tả_Cài_đặt_chu_kỳ_giao_hàng.md` | **Đã phản ánh**: dòng phiên bản・lịch sử cập nhật／§0／§1／§4A-3B／§4A-4B／§4A-4C／§4A-4E／§4B／§4C-1／§4D-1〜3／§5.3C／§7／§8／§11-1・§11-3／§12-4／REQ-DL-635・637・801 |
| `議事録/仕様/ピッキング出荷配送ドライバー_詳細要件仕様.md` | **Đã phản ánh**: phần đầu／§8 bảng chuyển trạng thái／sửa REQ-DL-313・649-2・650・654・663・856・869・870・883・900・905／**§8P (mới)・REQ-DL-906〜914**／§9 |
| `01_仕様/10_Giao_hàng/Giao_hàng_Trouble_và_hủy_Luồng_xử_lý_vi.md` | **Đã phản ánh**: phần đầu／§0.1・§0.4／§1／§3／**§3A (mới)**／§5／§8／§9 sơ đồ trạng thái／danh sách chưa quyết・REQ |
| 2 demo + artifact | **Chưa phản ánh** |

> `決定_v2.4_20260924.md` được tạo một lần vào 2026/09/24 (quản trị hệ thống xác nhận・kèm 【cần xác nhận】・tên cột khác) đã bị **hủy do sai**. Đã chuyển sang `99_過去/破棄_v2.4誤り_20260924/`.

### Các điểm không nhất quán sẵn có phát hiện khi phản ánh (ngoài phạm vi lần này・chưa xử lý)

- Con `確認中 → 中止`: vẫn còn trong Chu kỳ §4A-4C bước 4・REQ-DL-800, Tích hợp §8-4・§13-3, Luồng sự cố §3.2. DEV §12.2 chỉ cho con thoát ra `出荷待`／`取消`.
- Luồng sự cố (vi) §5 có mô tả cũ "có thể nhân bản từ draft" (đã bãi bỏ ở REQ-DL-872), §11 REQ-DL-663 vẫn là "đề xuất".
- Việc hiển thị `取消` trước khi xuất hàng là "確認中" trên màn hình doanh nghiệp (Tích hợp §13-2 ①・Chu kỳ §4A-4B ①・Luồng sự cố §2). Không phải chuyển trạng thái, nhưng cách gọi dễ gây nhầm lẫn.
