> **Đóng băng (bản gốc・05/10/2026). Từ nay không cập nhật nữa.** Các quyết định đang có hiệu lực hiện nay xem tại `docs/決定台帳.md`. Nơi chuyển đến của nội dung tệp này và các quyết định đã bị thay thế xem mục "G" của bảng tổng hợp quyết định.

# Quyết định v2.2 — 22/09/2026 (lần 3)

> Quyết định phát sinh sau `Quyết_định_v2.1_20260921.md` (lần 2). **Nếu có điểm không khớp thì tài liệu này được ưu tiên**.
> Quy tắc phản ánh giống v2.1: **mỗi một quy tắc, sửa đồng thời 3 chỗ: ① giải thích nghiệp vụ ② bảng state／batch ③ mô hình dữ liệu**.
> Nguồn gốc: Trả lời cho các vấn đề chưa quyết No.2／No.4／No.20／No.21／No.22 của §18 trong bản tổng hợp đặc tả v2.1.

---

## 1. Đổi ngày sau hạn chót đặt hàng — **Thống nhất là không được**

| Giai đoạn | Việc có thể làm |
|---|---|
| **Trước hạn chót** | Vận hành có thể thay đổi từng cái hoặc hàng loạt |
| **Sau hạn chót** | **Không thay đổi ngày.** Xử lý bằng hủy ＋ nhân bản |

- 〔Ghi đè〕**Hủy bỏ "sau hạn chót・trước `locked` thì chỉ vận hành mới thay đổi được từng cái một・bắt buộc có lý do・giới hạn ở bản ghi cần xác nhận" của quyết định v2.1 #1.**
- Mốc phân chia chỉ có **một là hạn chót đặt hàng**. `locked` là mốc của chỉ thị xuất hàng, không còn là mốc của việc đổi ngày.
- Nhờ đó §18 No.2 (khi số lượng nhiều thì vận hành có xoay xở kịp không) được **giải quyết**.
- 3 chỗ: ① §9-2 ② xóa dòng "sau hạn chót・trước lock" khỏi guard・bảng quyền hạn của §15-4 ③ điều kiện cho phép thay đổi của `deliveries`.

## 2. Cách tạo ngày điều chỉnh (`adjust`) — **Không tự động chèn**

- Số ngày dừng của mỗi lần tạm dừng chu kỳ **phải là bội số của 7** (nếu không thì A1 của chu kỳ tiếp theo không rơi vào thứ Hai).
- Khi thiếu, **hệ thống chỉ tính và hiển thị số ngày thiếu `7 − (số ngày dừng mod 7)`**. **Không tự động chèn.**
- **Quản trị viên quyết định vị trí đặt** — ngay sau tạm dừng, trong tuần đó, gộp vào cuối tháng, v.v. **tùy từng trường hợp**. Có thể chỉnh sửa sau.
- Nếu chưa đủ bội số của 7 thì **không lưu được**.
- `adjust` giữ bằng `adjust_for_pause_id` việc nó bù cho lần tạm dừng nào.
- 〔Ghi đè〕**Hủy bỏ** "Tự động chèn điều chỉnh `7 − (pause_days mod 7)` ngày ngay sau tạm dừng" của 19/09/2026.
- Nhờ đó §18 No.4 (khi muốn xuất hàng vào ngày dừng do điều chỉnh) cũng được **giải quyết**: nếu muốn xuất hàng vào ngày đó thì quản trị viên dời `adjust` sang ngày khác.
- 3 chỗ: ① §5-2 ② guard lưu của §15-3 ③ `delivery_cycle_pauses.adjust_for_pause_id`.

## 3. Thay đổi sau chỉ thị xuất hàng — **Được**

| Đối tượng thay đổi | Cách xử lý |
|---|---|
| Công ty giao hàng ②・nhân viên giao hàng | Thay đổi được ngay. Bật `ship_order_diff` và gửi lại |
| **Địa chỉ nơi giao hàng** | Thay đổi được. Tuy nhiên **phát hành chỉ thị xuất hàng phiên bản mới, chuyển phiếu giao hàng hiện có thành `voided` và phát hành lại** |
| Kho picking | **Không thay đổi.** Hủy ＋ nhân bản |
| Ngày giao hàng | **Không thay đổi** (mục 1 ở trên) |

- Lý do: thay đổi đột xuất thực sự có xảy ra. Địa chỉ đã được in trên phiếu giao hàng, nên nếu chỉ sửa dữ liệu thì sẽ lệch với thực tế.
- 3 chỗ: ① §15-14 (thiết lập mới) ② quy tắc gửi lại của §19-2 ③ bổ sung `delivery_tracking_numbers.status(active|voided)`.

## 4. Hạn chót gửi lại chỉ thị xuất hàng — **Không phân chia theo giờ bắt đầu picking của kho**

- Có thể gửi lại **cho đến khi nhận được thực tế xuất hàng của lần giao hàng đó**. Sau khi nhận thì đóng.
- Hệ thống không giữ giờ bắt đầu picking của kho (không xem tới mức đó).
- Ngày chốt thanh toán mặc định là **tháng dương lịch của ngày giao hàng thực tế**, nên không cần quyết định lại.
- Nhờ đó §18 No.22 được **giải quyết**.
- 3 chỗ: ① §10-3 ② guard của §15-7 ③ (không cần cột mới).

## 5. Phân bổ trùng cùng một Slot — **Như hiện hành**

- Dù cùng một hợp đồng có 2 lần giao hàng rơi vào cùng một khung (Slot) thì cũng **không coi là vấn đề**. **Hiển thị thẻ cảnh báo và vẫn lưu được** (giữ nguyên hành vi hiện hành).
- 〔Hủy bỏ〕Đề xuất ghi ở §18 No.21 "Cùng Slot ＋ cùng phân loại giao hàng là lỗi" **không áp dụng**.
- Về mặt kỹ thuật cũng không có trở ngại: khóa duy nhất của dự kiến là `contract_id + line_no + channel_id + cycle_id + occurrence_key` (quyết định v2.1 #6), nên 2 bản ghi trong cùng một khung vẫn thành lập như các bản ghi riêng.
- 3 chỗ: ① đặc tả màn hình thiết lập số lần giao hàng của hợp đồng ② (không thay đổi điều kiện batch) ③ bổ sung chú thích vào `contract_delivery_lines`.

## 6. Huy hiệu số lượng "Yêu cầu thay đổi (chưa xử lý)" — **Chỉ đếm những mục chưa xử lý đã đến hạn**

- Huy hiệu chỉ đếm **số lượng đã đến hạn xử lý mà chưa xử lý**.
- Tổng số lượng xem ở màn hình danh sách.
- Vì là vấn đề liên quan đến màn hình nên không đưa vào đặc tả DEV. **Nếu có ý kiến khác thì sẽ thay thế.**

---

## Những điều chưa quyết định

| # | Nội dung | Trạng thái |
|---|---|---|
| §18 No.1 | Hiển thị dự kiến tới mức nào trên trang web chuyên dụng của công ty giao hàng | **Đã quyết định・nghe nói có màn hình. Chờ cung cấp tài liệu.** 4 tài liệu hiện tại (`Đặc_tả_Cài_đặt_chu_kỳ_giao_hàng` / `統合仕様書 v2.1` / `Cần_xác_nhận_Trả_lời_20260921` / `ES_Phase2_作業引き継ぎ`) đều vẫn ở trạng thái "chưa quyết", nên khi nhận được tài liệu sẽ đóng các mục cần xác nhận #1・#36・#40・#48 và §18 No.1 |

---

## Tình trạng phản ánh

| Tài liệu | Trạng thái |
|---|---|
| `01_仕様/10_Giao_hàng/Đặc_tả_DEV_Chu_kỳ_Xuất_hàng_Picking_Giao_hàng_VI_v2.3.md` | **Đã phản ánh** (22/09/2026・1442 dòng). §5-2／§9-2／§10-3／§14-1／§14-2／§14-7／§15-2／§15-3／§15-4／§15-7／§15-14 (thiết lập mới)／§19-2 |
| `01_仕様/10_Giao_hàng/Đặc_tả_Cài_đặt_chu_kỳ_giao_hàng.md` | **Đã phản ánh** (22/09/2026・**v2.2**). §1.5／§2.2 (điều chỉnh độ lệch)／§2.3A #28／§3.2／§4A-4B／§4A-4D／§4A-5／§4D-2／**§4D-4 (thiết lập mới)**／§5.0／§7 (DDL: `adjust_for_pause_id`・`delivery_tracking_numbers.status`)／giải quyết các vấn đề chưa quyết #2・#4 của §8／bảng quyền hạn §11-3／chú thích "Ghi lại đề xuất" ở §12／REQ-DL-817・819・820・886 |
| `議事録/仕様/ピッキング出荷配送ドライバー_詳細要件仕様.md` | **Đã phản ánh** (22/09/2026・**v2.2**). Chuyển trạng thái §8／§8G／§8J／**§8N (thiết lập mới)**／câu hỏi xác nhận §9 (chuyển giờ bắt đầu picking sang đã giải quyết)／lịch sử thay đổi／sửa đổi REQ-DL-633・728・735・750・817・819・820・851・865・866, **thiết lập mới REQ-DL-886〜893** |
| `01_仕様/10_Giao_hàng/Đặc_tả_tích_hợp_Chu_kỳ_Xuất_hàng_Picking_Giao_hàng_v2.3.md` | **Đã phản ánh** (22/09/2026. Đổi tên tệp từ v2.1 → **v2.2**. Bản cũ được chuyển sang `99_過去/`). **§0-2B (thiết lập mới)**／§1-3／§4-5 quy tắc 4／§5-8／§8-3／§10-3／§10-5／§15-1／§15-9／§15-12／**§15-13 (thiết lập mới)**／§16-1／§16-5／§17-1／§17-2／§17-3／giải quyết §18 No.2・4・20・21・22／**§19-3 (thiết lập mới)**／§20 (giải quyết 12 mục cần xác nhận・bổ sung cách đọc cột) |
| `02_デモ/統合仕様書_…_v2.2.html` | **Đã tạo lại** (cập nhật `項目一覧_生成スクリプト/統合仕様書_html生成.py` cho v2.2 rồi chạy. HTML v2.1 cũ được chuyển sang `99_過去/`) |
| 2 bản demo ＋ artifact | **Chưa phản ánh** (`picking_schedule_setting_demo_ja.html` / `delivery_schedule_plan_demo_ja.html`. Phần giao hàng được triển khai riêng trong 2 tệp nên cần xác nhận cả hai) |
| `01_仕様/20_Doanh_nghiệp_Cơ_sở_Hợp_đồng/Doanh_nghiệp_Cơ_sở_Hợp_đồng_Hợp_đồng_con_Danh_sách_mục.md` | **Chưa phản ánh** (bao gồm cả phần của v2.1 cũng chưa phản ánh. Nơi nắm giữ `delivery_regime`／`service_form`・`site_receive_windows`・tách `invoices`・`shipping_plans.estimated_qty` và `lifecycle`・`delivery_tracking_numbers.status` lần này) |
