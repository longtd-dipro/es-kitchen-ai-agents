# Các đặc tả liên quan Xuất hàng・Picking — Kiểm tra tính nhất quán giữa các tài liệu (danh sách chênh lệch) v1

**Tạo**: 2026/09/22　**Đối tượng**: ES Station (ES Kitchen) Phase 2
**Mục đích**: Đối chiếu xem nội dung của 4 tài liệu liên quan đến xuất hàng・picking・giao hàng・Chu kỳ có đồng bộ với nhau không, và liệt kê **chỉ những chỗ cần sửa**. Tài liệu này là danh sách các điểm chỉ ra, không phải đặc tả.

---

## Tình hình phản ánh (nhật ký công việc)

> Ngày 2026/09/22 đã cập nhật các tài liệu thực tế dựa trên danh sách này. **Xong** = đã phản ánh vào cả 3 tài liệu và đã grep lại xác nhận không còn sót.

| # | Mục | Tích hợp (A) | Chu kỳ (B) | Yêu cầu (C) | DEV (D) | Trạng thái |
|---|---|---|---|---|---|---|
| A-1 | Thống nhất việc đổi ngày sau hạn chót thành "không được" | ✅ 12 chỗ | ✅ 9 chỗ | ✅ 13 chỗ | ✅ vốn đã có | **Xong** (09/22. Tạo mới REQ-DL-886) |
| A-2 | Ngày điều chỉnh thành "không tự động chèn" | ✅ 7 chỗ | ✅ 11 chỗ | ✅ 4 chỗ | ✅ vốn đã có | **Xong** (09/22. Tạo mới `adjust_for_pause_id` và REQ-DL-887) |
| A-3 | Thay đổi sau chỉ thị xuất hàng (địa chỉ・công ty vận chuyển ②) | ✅ Tạo mới §15-13 | ✅ Tạo mới §4D-4 | ✅ REQ-DL-888〜890 | ✅ vốn đã có | **Xong** (09/22. Thêm `status(active｜voided)` vào vận đơn) |
| A-4 | Hạn gửi lại thành "đến khi có kết quả xuất hàng" | ✅ 2 chỗ | ✅ 3 chỗ | ✅ 4 chỗ | ✅ vốn đã có | **Xong** (09/22. Tạo mới REQ-DL-891, câu hỏi xác nhận chuyển sang đã giải quyết) |
| A-5 | Trùng Slot cùng loại = cảnh báo vẫn lưu được | ✅ Bổ sung nguồn vào nội dung | ✅ Hủy §12 #10 | ✅ REQ-DL-892 | ✅ vốn đã có | **Xong** (09/22. Giải quyết mâu thuẫn nội tại của B) |
| A-6 | Cách đếm badge yêu cầu thay đổi | ✅ Bổ sung vào §15-1 | — Ngoài phạm vi | ✅ REQ-DL-893 | — Ngoài phạm vi | **Xong** (09/22. Không đưa vào đặc tả DEV) |
| D-1 | Kiểm kê §18／§20・cập nhật phiên bản | ✅ Tạo mới §19-3／giải quyết 5 mục §18／cần xác nhận 12 mục／phiên bản v2.2／tạo lại HTML | ✅ Phiên bản v2.2・thêm tóm tắt cập nhật・ghi chú ở §12 | ✅ Tạo mới §8N・phiên bản v2.2 | — | **Xong** (09/22. Tên file cũng đổi sang v2.2, bản cũ chuyển vào 99_過去) |
| Nhóm B | 7 điểm khác nhau nằm ngoài quyết định | ✅ | ✅ | ✅ | ✅ | **Xong** (09/23. Lập thành `Quyết_định_v2.3_20260923.md` và phản ánh vào 4 tài liệu) |
| R-0 | Thống nhất nguồn chuẩn của mô hình dữ liệu về DEV | ✅ Đầu §16 | ✅ Đầu §7 | ✅ REQ-DL-894 | ✅ Chuẩn | **Xong** (09/23) |
| R-1 | Tách tuyến thành 3 bảng (`contract_routes` / `contract_month_routes` / `delivery_legs`) | ✅ §16-3 và 9 chỗ khác | ✅ §7 DDL và 16 chỗ khác | ✅ REQ-DL-895 | ✅ vốn đã có | **Xong** (09/23) |
| R-2 | Bỏ `route_override`・phần việc của carrier・bỏ `route_id` | ✅ | ✅ | ✅ REQ-DL-896〜898 | ✅ vốn đã có | **Xong** (09/23. Lead time riêng chuyển vào `deliveries.lead_time`) |
| R-3 | Đổi tên `change_requests`・tạo mới `review_items`・đổi tên `site_id` | ✅ | ✅ | ✅ REQ-DL-899〜901 | ✅ (đổi tên thành `site_id`) | **Xong** (09/23) |
| R-4 | Tạo mới `delivery_lines`・chuyển `order_id`・giá trị mặc định về DEV | ✅ §16-5 | ✅ §7 DDL | ✅ REQ-DL-902・903 | ✅ §14.7・§3.1 | **Xong** (09/23. Giải quyết §18 No.17) |

---

## 0. Về tài liệu này

### 0-1. Các tài liệu đã đối chiếu (4 tài liệu)

| Ký hiệu | Tài liệu | Phiên bản | Số dòng |
|---|---|---|---|
| **A** | `01_仕様/10_Giao_hàng/Đặc_tả_tích_hợp_Chu_kỳ_Xuất_hàng_Picking_Giao_hàng_v2.3.md` | v2.1 (2026-09-21) | 3,004 |
| **B** | `01_仕様/10_Giao_hàng/Đặc_tả_Cài_đặt_chu_kỳ_giao_hàng.md` | v2.1 (2026-09-21) | 3,795 |
| **C** | `議事録/仕様/ピッキング出荷配送ドライバー_詳細要件仕様.md` | v2.1 (2026-09-21) | 1,457 |
| **D** | `01_仕様/10_Giao_hàng/Đặc_tả_DEV_Chu_kỳ_Xuất_hàng_Picking_Giao_hàng_VI_v2.3.md` | Đã phản ánh 2026-09-22 | 1,442 |

### 0-2. Các quyết định dùng làm thước đo

1. `01_仕様/00_Quyết_định/Cần_xác_nhận_Trả_lời_20260921.md` (lần 1)
2. `01_仕様/00_Quyết_định/Quyết_định_v2.1_20260921.md` (lần 2) ← ưu tiên hơn lần 1
3. `01_仕様/00_Quyết_định/Quyết_định_v2.2_20260922.md` (lần 3) ← **ưu tiên cao nhất**

### 0-3. Kết luận (3 dòng trước)

- **Đến v2.1 (quyết định lần 2), cả 4 tài liệu A・B・C・D đều đồng bộ.** Đã xác nhận cả 4 đều có: `occurrence_key`／`delivery_regime`／`service_form`／`site_receive_windows`／`final leg`／`anomaly`／`marker_source`／`estimated_qty`／xóa `Quản lý kho`.
- **v2.2 (quyết định lần 3) chỉ D đã phản ánh, A・B・C chưa phản ánh.** Cả 6 mục đều vẫn còn lệch (→ §1). Đây là chênh lệch lớn nhất hiện nay.
- Ngoài ra còn **7 điểm khác nhau không có trong văn bản quyết định** (→ §2), **2 mâu thuẫn nội tại trong tài liệu** (→ §3), và **5 hệ thống・tổng cộng 19 chỗ vẫn ghi là "chưa quyết" dù đã được giải quyết** (→ §4).

---

## 1. 【Ưu tiên cao nhất】 Quyết định v2.2 (lần 3) chưa phản ánh — 6 mục

Kết luận giống với bảng "Tình hình phản ánh" của `Quyết_định_v2.2_20260922.md`. Chỉ D đã được sửa trước, **A・B・C vẫn theo logic của v2.1**.

### 1-1. Danh sách

| # | Quy tắc v2.2 | D (DEV) | A (Tích hợp) | B (Chu kỳ) | C (Yêu cầu) |
|---|---|---|---|---|---|
| **A-1** | Đổi ngày sau hạn chót đặt hàng **thống nhất là không được**. Mốc phân chia **chỉ còn 1 là hạn chót đặt hàng** | ✅ | ✅ Đã phản ánh | ✅ Đã phản ánh | ✅ Đã phản ánh |
| **A-2** | Ngày điều chỉnh (`adjust`) **không tự động chèn**. Chỉ tính và hiển thị, **chỗ đặt do quản trị viên quyết định** | ✅ | ✅ Đã phản ánh | ✅ Đã phản ánh | ✅ Đã phản ánh |
| **A-3** | Dù sau chỉ thị xuất hàng vẫn **có thể đổi công ty vận chuyển ②・nhân viên giao hàng・địa chỉ** (địa chỉ thì chuyển vận đơn sang `voided` và phát hành lại) | ✅ | ✅ Đã phản ánh | ✅ Đã phản ánh | ✅ Đã phản ánh |
| **A-4** | Hạn gửi lại chỉ thị xuất hàng là **đến khi nhận được kết quả xuất hàng**. **Không giữ giờ bắt đầu picking** | ✅ | ✅ Đã phản ánh | ✅ Đã phản ánh | ✅ Đã phản ánh |
| **A-5** | Gán trùng Slot cùng loại **lưu được kèm thẻ cảnh báo** (không chọn phương án lỗi) | ✅ | ✅ Đã phản ánh | ✅ Đã phản ánh | ✅ Đã phản ánh |
| **A-6** | Badge yêu cầu thay đổi **chỉ đếm những mục đã đến hạn nhưng chưa xử lý** | (Ngoài phạm vi) | ✅ Đã phản ánh | — | ✅ Đã phản ánh |

> **↑ Đã phản ánh xong ngày 2026/09/22.** Các mục §1-2〜§1-7 dưới đây được giữ lại như ghi chép về "đã lệch ở đâu và lệch thế nào" (số dòng là của **trước** khi phản ánh).

### 1-2. A-1 — Đổi ngày sau hạn chót (3 giai đoạn → 2 giai đoạn)

**Chuẩn**: Trước hạn chót = Vận hành có thể đổi từng bản ghi hoặc hàng loạt／**Sau hạn chót = không đổi ngày. Hủy + sao chép**.
Quy định "sau hạn chót・trước `locked` chỉ Vận hành đổi từng bản ghi・bắt buộc có lý do・giới hạn ở bản ghi cần xác nhận" của v2.1 #1 đã bị **hủy**. `locked` là mốc của chỉ thị xuất hàng, không còn là mốc của việc đổi ngày.

| Tài liệu | Hiện trạng (chỗ cần sửa) |
|---|---|
| **D** | ✅ Bảng §9.3 "Sau order close → Cấm update ngày. Muốn đổi thì cancel + duplicate" (L371). §15.4 "Sau `order_close_date` trả `DOMAIN_ORDER_CLOSED`…**Không có nhánh ngoại lệ cho ops**" (L1043) |
| **A** | ❌ **9 chỗ**: L19 (bảng thay đổi v2.0→v2.1)／L172 (tổng quan ⑤)／L936 (bảng 3 giai đoạn của 8-4)／L1377〜1386・L1395 (chính sách đổi ngày 15-8)／L1625 (15-9)／L2412・L2415 (chế độ đổi ngày)／L2438／L2566 (phán định `locked_at`)／L2632 (cần hay không cần lý do)／L2643 (bảng quyền hạn) |
| **B** | ❌ **8 chỗ**: L260 (thao tác của `published`)／L1973 (chỉ định ngày riêng)／L1983・L1991 (ô lý do)／L2069〜2080 (chính sách đổi ngày §4A-5)／L2632 (REQ-DL-817)／L2707〜2710・L2722 (chế độ đổi ngày §5.0) |
| **C** | ❌ **9 chỗ**: L1033・L1040・L1045〜1046 (chế độ đổi ngày §8J)／REQ-DL-728 (L1056)／REQ-DL-750 (L1061)／REQ-DL-735 (L1064)／REQ-DL-817 (L1127)／REQ-DL-851 (L1184)／REQ-DL-865 (L1225)／L1419 (lịch sử thay đổi) |

> **Lưu ý**: Khi sửa xong thì nhánh phân chia trước/sau `locked` được gộp hoàn toàn thành 1. `locked_at` chỉ còn **là mốc của chỉ thị xuất hàng**, việc có đổi ngày được hay không phán định bằng `order_close_date` (như D).

### 1-3. A-2 — Không tự động đưa ngày điều chỉnh vào

**Chuẩn**: Số ngày thiếu `7 − (số ngày dừng mod 7)` chỉ **tính và hiển thị**. **Không tự động chèn**. Chỗ đặt (ngay sau tạm dừng／trong tuần đó／gộp vào cuối tháng) do **quản trị viên quyết định theo từng trường hợp và sau này có thể sửa**. **Không lưu được** khi chưa đủ bội số của 7. Dùng `adjust_for_pause_id` để giữ việc bù cho lần tạm dừng nào.

| Tài liệu | Hiện trạng |
|---|---|
| **D** | ✅ §5.2 (L197〜202) "tính số ngày `adjust` còn thiếu…**nhưng không tự chèn**" "**Admin tự chọn vị trí đặt**"／guard lưu §15.3 (L1030)／`delivery_cycle_pauses.adjust_for_pause_id` (L576) |
| **A** | ❌ L169 (tổng quan ②: "`7 −（số ngày tạm dừng mod 7）` ngày **thêm vào ngay sau tạm dừng**")／L562 (giải thích hình 2)／**L581〜591 (4-5 Quy tắc 4 "tự động thêm ngay sau tạm dừng" = phần chính)**／L2493 (`delivery_cycle_pauses` không có `adjust_for_pause_id`) |
| **B** | ❌ L16 (tóm tắt cập nhật v1.55)／L503・L511 (ví dụ §2.2)／**L551〜581 ("Điều chỉnh độ lệch" = phần chính)**／REQ-DL-819 (L2634)／L2940 (chú thích DDL. Không có `adjust_for_pause_id`) |
| **C** | ❌ REQ-DL-633 (L734)／REQ-DL-819 (L1129)／L1390 (lịch sử thay đổi) |

> **Tác dụng phụ**: Khi sửa xong thì mục A §18 No.4／cần xác nhận #11・#15・#26・#37・#51 ("cách vận hành khi muốn xuất hàng vào ngày bị dừng bởi điều chỉnh") **hoàn toàn không còn cần thiết**. Vì quản trị viên chỉ cần dời `adjust` sang ngày khác.

### 1-4. A-3 — Thay đổi sau chỉ thị xuất hàng

**Chuẩn**:

| Cái thay đổi | Cách xử lý |
|---|---|
| Công ty vận chuyển ②・nhân viên giao hàng | **Có thể đổi.** Dựng `ship_order_diff` và gửi lại |
| Địa chỉ nơi giao | **Có thể đổi.** Tuy nhiên phải phát hành chỉ thị xuất hàng phiên bản mới, **chuyển vận đơn hiện có sang `voided` và phát hành lại** |
| Kho picking | **Không đổi.** Hủy + sao chép |
| Ngày giao | **Không đổi** (A-1) |

| Tài liệu | Hiện trạng |
|---|---|
| **D** | ✅ §15.14 (L1150〜1162)／§19.2 (L1390)／`delivery_tracking_numbers.status(active｜voided)` + `voided_reason` (L807〜811)／§16.12 `ship_order_diff` (L1272) |
| **A** | ❌ **Không có mô tả**. Ngược lại §18 No.18 (L2712) còn ghi "**Chưa quyết**: sau chỉ thị xuất hàng có được đổi công ty vận chuyển②・nhân viên giao hàng・địa chỉ nơi giao chỉ cho lần giao này không". Cần tạo mới ở 15-6 (tab tuyến giao hàng) và 16-5 (bảng vận đơn) |
| **B** | ❌ Không có mô tả. §4D-2 (vận đơn) không có `status(active｜voided)` |
| **C** | ❌ Không có mô tả. REQ-DL-303／661 (vận đơn) không có yêu cầu vô hiệu hóa・phát hành lại |

### 1-5. A-4 — Hạn gửi lại

**Chuẩn**: Có thể gửi lại **đến khi nhận được kết quả xuất hàng của lần giao đó**. **Hệ thống không giữ giờ bắt đầu picking của kho.**

| Tài liệu | Hiện trạng |
|---|---|
| **D** | ✅ §10.3／§15.7 |
| **A** | ❌ L2607 (bảng batch §17: "**chỉ gửi lại được trước khi bắt đầu picking**")／cần xác nhận #4 (L412)・#31・#47／§18 No.22 (L2714 "giờ bắt đầu picking của kho") |
| **B** | ❌ §2.3A #28 (L761 "hạn gửi lại = trước khi bắt đầu picking. Giờ bắt đầu **cần xác nhận với kho・vendor**")／L1792 ("sau khi bắt đầu picking chuyển sang liên lạc qua điện thoại") |
| **C** | ❌ L789 ("**chỉ gửi lại được trước khi bắt đầu picking**")／L1451 (câu hỏi xác nhận "Vui lòng xác nhận giờ kho bắt đầu picking trong ngày" = **không cần hỏi nữa**) |

### 1-6. A-5 — Gán trùng cùng một Slot

**Chuẩn**: **Hiện thẻ cảnh báo và vẫn lưu được** (giữ nguyên hành vi hiện tại). Đề xuất "cùng Slot + cùng loại giao hàng là lỗi" ở §18 No.21 **không được chọn**.

| Tài liệu | Hiện trạng |
|---|---|
| **D** | ✅ Chú thích của `contract_delivery_lines` (L625〜626) "Hai line cùng `slot_code`…được phép lưu; màn hình chỉ hiện cảnh báo, không chặn (2026-09-22)" |
| **A** | △ Nội dung L907 là "chỉ thẻ cảnh báo, lưu được" nên **khớp**. Tuy nhiên §18 No.21 (L2713) còn ghi "**Đề xuất: cùng Slot + cùng loại giao hàng là lỗi**" khiến người đọc hiểu ngược lại |
| **B** | ❌ **Mâu thuẫn nội tại** (→ §3-1). L1036 là "hiện thẻ cảnh báo (vẫn lưu được)", L3383 (§12 #10) là "**cùng Slot + cùng loại giao hàng là Lỗi**" |
| **C** | — Không có mô tả (không cần bổ sung) |

### 1-7. A-6 — Badge yêu cầu thay đổi

**Chuẩn**: Badge chỉ đếm **số lượng đã đến hạn xử lý nhưng chưa xử lý**. Tổng số xem ở màn hình danh sách. Vì thuộc phần màn hình nên không đưa vào đặc tả DEV.

- **A** ❌ Còn ở trạng thái "chưa quyết" tại §18 No.21 (L2713). Bổ sung cách đếm vào 15-1／15-2／15-3 và bỏ khỏi §18.
- B・C không có mô tả liên quan.

---

## 2. Điểm khác nhau không có trong văn bản quyết định — 7 mục

Những điểm **khác nhau giữa các tài liệu** mà không có trong bất kỳ quyết định nào của v2.1／v2.2. Nhiều chỗ **D đã quyết trước**, nên chưa rõ cái nào là chuẩn.

### 2-1. 【Lớn】 Cách giữ tuyến giao hàng — 1 bảng vs 3 bảng

| | Cách giữ |
|---|---|
| **D** | **Chia 3 bảng**. `contract_routes` (định nghĩa tuyến của hợp đồng cha)／`contract_month_routes` (snapshot hàng tháng của hợp đồng con)／`delivery_legs` (leg thực tế của 1 lần giao). L689 "Route được giữ ở **hai bảng tách rời**" |
| **A** | **1 bảng**. `delivery_routes` (dùng cho 2 mục đích `contract_id NULL, delivery_id NULL`・L2521). Xuất hiện 17 lần |
| **B** | **1 bảng**. `delivery_routes`. Xuất hiện 11 lần |
| **C** | `delivery_legs` (REQ-DL-871・chỉ 1 lần) |

Hơn nữa **cách giữ override cũng bị chia rẽ**:

- **A**: `route_override` (3 chỗ)／**B**: `route_override` (2 chỗ) — thể hiện "thay đổi chỉ 1 lần" bằng cột override
- **D**: L726 "Sửa route của một chuyến là sửa chính `delivery_legs` của chuyến đó kèm audit. **Không có cột override riêng**" = **không có cột override**

> A §18 No.18・§20 #46/#57 nêu điểm này là "**chưa quyết** (chia 2 bảng hay gộp 1 bảng)". Tuy nhiên D đã viết xong theo **3 bảng + không có cột override**. **Cần quyết định bên nào là chuẩn và lưu vào văn bản quyết định.**
> Kèm theo `shipping_plans.route_id`: **A có nhưng D không có** (D chỉ giữ `route_snapshot_source`).

### 2-2. Ai giữ công ty vận chuyển・điểm trung chuyển

| | Các cột của `contract_delivery_channels` |
|---|---|
| **A** (L2520) | `…warehouse_id, **carrier1_id, relay_warehouse_id NULL, carrier2_id NULL**, lead_time, service_form, delivery_regime, share_pct, effective_from` |
| **D** (L628) | `…warehouse_id, lead_time, service_form, delivery_regime, share_pct, effective_from` (**không giữ carrier1／relay／carrier2**. Tất cả chuyển vào leg của `contract_routes`) |

Phù hợp với quyết định "tuyến giao hàng có số chặng thay đổi được" và "không chen quá 2 tầng trung chuyển" là **phía D**. Định nghĩa cột của A・B còn lại ở **dạng trước khi linh hoạt hóa tuyến giao hàng (2026/09/04)**.

### 2-3. Dao động tên bảng

| Khái niệm | D | A | B |
|---|---|---|---|
| Yêu cầu thay đổi | `change_requests` | `delivery_change_requests` | `delivery_change_requests` |
| Hàng đợi cần xác nhận | **`review_items`** (`kind` 13 loại, `UNIQUE(kind, target_type, target_id) WHERE status='open'`) | Không có tên vật lý (chỉ có tên gọi "cần xác nhận") | Như bên trái |
| Leg giao hàng | `delivery_legs` | `delivery_routes` (chú thích "= `delivery_legs` của yêu cầu") | `delivery_routes` |

"Cần xác nhận" là khái niệm cốt lõi xuất hiện hàng chục lần trong nội dung A・B, nhưng **ER của A §16／B §7 không có bảng vật lý**. Cách tự nhiên là viết lại lấy `review_items` của D làm chuẩn.

### 2-4. Bảng chỉ có ở D

`menus` / `order_quantities` / `plan_rates` / `corporations` / `sites` — ER của A §16・B §7 không có định nghĩa tương ứng. Cùng tính chất với lỗ hổng "bảng chi tiết kết quả không có trong nguồn gốc" mà A §18 No.17 nêu. **Số lượng đặt hàng và giá là đầu vào của xuất hàng・thanh toán** nên việc không có trong ER cần được lấp trước khi triển khai.

### 2-5. Dao động ký hiệu bên trong D

`deliveries.branch_id` (L767) giữ `sites.id` (ghi rõ ở L892). Trong cùng D, `contracts.site_id`・`site_receive_windows.site_id` dùng `site_id`. **Thống nhất `branch_id` → `site_id`**, hoặc ghi chú lý do dùng `branch`.

### 2-6. Giá trị mặc định của ngưỡng số lượng

- **A・B・C**: Ghi rõ **300 bản ghi／ngày** (sửa từ 150 bản ghi cũ). A L1580／B L2776／C REQ-DL-616・671
- **D**: Chỉ có cột `pick_count_threshold`, **không ghi giá trị mặc định** (L81・L737)

Khi triển khai phải ghi giá trị mặc định ở đâu đó mới nhập được, nên cần thêm "mặc định 300" vào D.

### 2-7. Lead time của chỉ thị xuất hàng

- **A**: Ghi rõ `warehouses.ship_order_lead_days` (**mặc định 3**) (L2545・L641)
- **D**: Có cột `ship_order_lead_days` (L737) nhưng không có giá trị mặc định

---

## 3. Mâu thuẫn nội tại trong tài liệu — 2 mục

### 3-1. B (Đặc tả cài đặt Chu kỳ giao hàng) — Trùng Slot

| Dòng | Mô tả |
|---|---|
| L1036 (guard lưu §3.2) | "Trùng Slot (hoặc cùng ngày chỉ định) → **hiện thẻ cảnh báo (vẫn lưu được. Do vận hành phán đoán)**" |
| L3383 (§12 "Phương châm thiết kế thu hẹp độ tự do (đề xuất 2026-09-12)" #10) | "Cùng Slot + cùng loại giao hàng là **Lỗi** (không có ý nghĩa gì khi xuất 2 chuyến từ cùng 1 kho trong cùng 1 ngày)" |

**L1036 là chuẩn** (v2.2 #5). §12 là **chương đề xuất** tại thời điểm 2026-09-12 được giữ nguyên, các mục khác cũng nhiều khả năng khác với hiện hành. Nên **kiểm kê theo từng chương, hoặc ghi rõ ở đầu "đây là ghi chép tại thời điểm đề xuất, không phải đặc tả hiện hành"**.

### 3-2. A (Đặc tả tích hợp) — Cột "chương／mục liên quan" của §20 không đáng tin

> **Đính chính (2026/09/22)**: Ban đầu đã ghi "script tạo đang lấy sai mục", nhưng **nguyên nhân không phải là script**. Khi kiểm tra nội dung thì thấy dấu `⚠️ Cần xác nhận #N` **được đặt gộp ở cuối chương** (ví dụ: #1〜12 ở cuối chương 3, #16〜21 ở cuối chương 6). Cột của §20 chỉ phản ánh đúng **mục mà dấu được đặt vật lý**, bản thân giá trị không sai.

| Phạm vi dòng | Mục đang hiển thị | Thực tế |
|---|---|---|
| #1〜12 | Tất cả là "3-7. Khung giờ nhận hàng của cơ sở (bảng con)" | Được đặt gộp ở **cuối** chương 3 (nội dung không liên quan đến khung giờ nhận hàng) |
| #16〜21 | Tất cả là "6-5. Phân loại phán định và câu chữ hiển thị" | Cuối chương 6 |
| #22〜27 | Tất cả là "8-9. Cách cho doanh nghiệp xem" | Cuối chương 8 |
| #28〜39 | Tất cả là "10-8. Giao hàng vật tư" | Cuối chương 10 |
| #40〜47 | Tất cả là "14-5. Chuyển giao số lượng đặt hàng đã xác nhận" | Cuối chương 14 |

**Vấn đề còn lại là "không thể dựa vào cột này để đi sửa"** (vì là chỗ đặt dấu chứ không phải mục mà nội dung thuộc về). Ngày 2026/09/22 đã xử lý bằng cách đưa **ghi chú cách đọc cột** vào đầu §20. Để sửa tận gốc cần công việc chuyển dấu về đúng mục của nội dung (chưa thực hiện).

---

## 4. Những mô tả đã được giải quyết nhưng vẫn còn ở trạng thái "chưa quyết" — 5 hệ thống・tổng cộng 19 chỗ

Trong §18 (mục chưa quyết) và §20 (chênh lệch còn lại) của A, **các vấn đề đã có câu trả lời ở v2.2** vẫn còn được ghi là chưa quyết. Khi phản ánh v2.2 thì bỏ luôn những chỗ này.

| §18 | Nội dung | Trả lời của v2.2 | Bỏ cùng lúc |
|---|---|---|---|
| **No.2** | Khi số lượng nhiều thì việc đổi ngày từng bản ghi sau hạn chót・trước `locked` có xoay xở được không | **#1** (sau hạn chót không đổi nên vấn đề biến mất) | Cần xác nhận #2 (L408)・#23 (L1511)・#49 (L2718)／§20 #2・#20・#23・#49 |
| **No.4** | Cách vận hành khi muốn xuất hàng vào ngày bị dừng bởi điều chỉnh | **#2** (quản trị viên dời `adjust`) | Cần xác nhận #11 (L426)・#15・#26・#37・#51／§20 #11・#15・#26・#37・#51 |
| **No.20** | Sau chỉ thị xuất hàng có được đổi công ty vận chuyển②・nhân viên giao hàng・địa chỉ không | **#3** (được đổi. Địa chỉ thì phát hành lại vận đơn) | — |
| **No.21** | Cách đếm badge yêu cầu thay đổi／cách xử lý trùng Slot | **#6**／**#5** | — |
| **No.22** | Giờ bắt đầu picking của kho／ngày chốt thanh toán | **#4** (không giữ giờ bắt đầu. Ngày chốt theo mặc định là tháng dương lịch của ngày giao) | Cần xác nhận #4 (L412)・#31・#47／§20 #4・#31・#47／câu hỏi xác nhận ở C L1451 |

**Mục chưa quyết còn lại chỉ là §18 No.1 (hiển thị lịch dự kiến đến đâu trên trang chuyên dụng của công ty vận chuyển)**. Mục này "đã quyết・có màn hình" nên **đang chờ cung cấp tài liệu**. Khi tài liệu đến thì đóng đồng thời cần xác nhận #1・#36・#40・#48 và §18 No.1.

---

## 5. Những điểm trùng khớp và không cần sửa (đã xác nhận)

Những điểm đã đối chiếu để chắc chắn và thấy **cả 4 tài liệu đều khớp**. Không động vào.

| Quy tắc | Nguồn | A | B | C | D |
|---|---|---|---|---|---|
| Phương thức khóa duy nhất `occurrence_key` của kế hoạch | v2.1 #6 | 15 | 11 | 5 | 7 |
| `delivery_regime` (3 giá trị) | v2.1 #7 | 25 | 15 | 8 | 13 |
| Chủ sở hữu `service_form` = loại giao hàng | v2.1 #7 | 28 | 8 | 7 | 5 |
| 2 bảng con khung giờ nhận hàng | v2.1 #8 | 18/12 | 7/7 | 4/4 | 3/3 |
| `marker_source` (giới hạn hạn chót tạm) | v2.1 #9 | 16 | 10 | 5 | 5 |
| Phán định coi như hoàn tất bằng final leg | v2.1 #4 | 33 | 19 | 18 | 4 |
| Mốc `locked` = lần gửi chỉ thị xuất hàng đầu tiên thành công／vận đơn gửi trước là `anomaly` | v2.1 #3 | 13 | 9 | 7 | 6 |
| Xóa hoàn toàn vai trò `Quản lý kho` | v2.1 #2 | 12※ | 8※ | 10※ | 0 |
| `shipping_plans.estimated_qty` | v2.1 S1 | 19 | 8 | 6 | 2 |
| Tách hóa đơn (`billing_type` / `payment_due_date`) | v2.1 #10 | 6/10 | 7/11 | 3/3 | 2/3 |
| Tháng Chu kỳ = tháng mà `B7` thuộc về | v2.1 #11 | ✅ | ✅ | ✅ | ✅ |
| Ngưỡng số lượng 300 bản ghi／ngày・không tính vật tư | Lần 1 | ✅ | ✅ | ✅ | △ (§2-6) |
| Vận đơn và dữ liệu giao hàng là 1 nhiều | Lần 1 #54/#55 | ✅ | ✅ | ✅ | ✅ |
| Chỉ thị xuất hàng không có hủy mà gửi lại có số phiên bản・dừng là số lượng 0 | Lần 1 | ✅ | ✅ | ✅ | ✅ |
| Không tạo cuốn chiếu (rolling) | 2026/09/19 | ✅ | ✅ | ✅ | ✅ |
| Số hậu tố tối đa 9・cha con 1 tầng | Lần 1 | ✅ | ✅ | ✅ | ✅ (`CHECK … BETWEEN 1 AND 9`) |

※ Đã xác nhận mọi lần xuất hiện của `Quản lý kho` **đều là mô tả phủ định・lịch sử "đã xóa"** (không được dùng như vai trò hiện hành).

---

## 6. Đề xuất thứ tự sửa

Dùng nguyên quy tắc phản ánh của v2.1 (**với mỗi quy tắc, sửa đồng thời 3 chỗ: ① giải thích nghiệp vụ ② bảng state／batch ③ mô hình dữ liệu**). Vì D đã ở v2.2 nên **vừa dùng D để đối chiếu đáp án vừa sửa theo thứ tự A → B → C** là nhanh nhất.

| Thứ tự | Việc cần làm | Đối tượng | 3 chỗ |
|---|---|---|---|
| 1 | **A-1 Chuyển đổi ngày sau hạn chót sang 2 giai đoạn** | A・B・C | ①A §9-2／§15-4・B §4A-5・C §8J ②bảng quyền hạn・bảng chế độ đổi ngày ③khả năng đổi của `deliveries` (phán định bằng `order_close_date`) |
| 2 | **A-2 Ngày điều chỉnh thành "không tự động chèn"** | A・B・C | ①A 4-5 Quy tắc 4・B §2.2 "Điều chỉnh độ lệch"・C REQ-DL-633/819 ②guard lưu (không lưu được nếu không phải bội số của 7) ③`delivery_cycle_pauses.adjust_for_pause_id` |
| 3 | **A-3 Tạo mới thay đổi sau chỉ thị xuất hàng** | A・B・C | ①A 15-14 tạo mới ②quy tắc gửi lại A 19-2 ③`delivery_tracking_numbers.status(active｜voided)` |
| 4 | **A-4 Hạn gửi lại thành "đến kết quả xuất hàng"** | A・B・C | ①A 10-3 ②A 15-7 guard・bảng batch §17 ③không thêm cột |
| 5 | **A-5／A-6** | A・B | ①A 15-1〜15-3 (badge)・hủy B §12 #10 ②không đổi ③chú thích vào `contract_delivery_lines` |
| 6 | **Kiểm kê §18／§20** | A | Bỏ No.2・4・20・21・22, xóa 19 chỗ cần xác nhận liên quan |
| 7 | **Quyết định 7 điểm khác nhau ở §2** | Văn bản quyết định | Đặc biệt **2-1 Cách giữ tuyến** liên quan trực tiếp đến triển khai nên muốn quyết trước |
| 8 | **Phản ánh vào 2 demo + artifact** | 02_デモ | **Cả hai** `picking_schedule_setting_demo_ja.html` / `delivery_schedule_plan_demo_ja.html` (vì phần giao hàng được triển khai riêng ở 2 file) |

> **Về bản HTML**: Không sửa trực tiếp HTML xem của A, mà sửa Markdown rồi chạy lại `項目一覧_生成スクリプト/統合仕様書_html生成.py`. Lỗi cột mục ở §3-2 cũng sửa ở phía script này.

---

## 7. Những việc muốn được quyết trước (3 mục)

| # | Vấn đề | Vì sao quyết trước |
|---|---|---|
| 1 | **Tuyến giao hàng chia 3 bảng (`contract_routes` / `contract_month_routes` / `delivery_legs`) hay 1 bảng (`delivery_routes`)**. Kèm theo đó là có giữ hay không giữ cột `route_override` | Là khung xương của ER, toàn bộ việc tạo kế hoạch・snapshot・phân công tài xế・chỉ thị xuất hàng đều dựa vào đó. D đã viết theo 3 bảng (§2-1) |
| 2 | **Có bỏ carrier1／relay／carrier2 khỏi `contract_delivery_channels` hay không** | Mặt trái của quyết định 1 (§2-2) |
| 3 | **Có đặt bảng vật lý của "cần xác nhận" là `review_items` hay không** | Là khái niệm xuất hiện nhiều nhất trong nội dung A・B nhưng không có trong ER (§2-3) |

---

*Tài liệu này là danh sách các điểm chỉ ra. Nếu anh/chị chỉ định sửa cái nào, tôi sẽ cập nhật trực tiếp các tài liệu hiện có (A・B・C) theo thứ tự ở trên.*
