# DEV Functional Specification — Kết quả rà soát

**Đối tượng**: `01_仕様/10_配送/DEV仕様書_サイクル・出荷・ピッキング・配送_VI_v2.3.md` (1086 dòng, 2026-09-21 14:18)
**Đối chiếu với**: `決定_v2.1_20260921.md`（第2次） / `要確認_回答_20260921.md`（第1次84件） / `統合仕様書_サイクル・出荷・ピッキング・配送_v2.3.md`
**Ngày rà soát**: 2026-09-22　**Bản**: v1

---

## 0. Kết luận

**Phần quy tắc nghiệp vụ: đã đủ.** 11 quyết định v2.1 đều có mặt, và đều xuất hiện ở **cả 3 chỗ** (nghiệp vụ / state-batch / data model) đúng như quy ước đã chốt.

**Nhưng chưa đủ để giao cho dev.** Ba nhóm còn thiếu:

1. **~9 thực thể được tham chiếu nhưng không có định nghĩa bảng** (sites, drivers, change_requests, delivery_overrides, site_receive_blocks, review/missing/anomaly queue, plan rate master, nguồn quantity).
2. **Không có batch gửi ship order** — §16 có 12 job nhưng không có job nào gửi chỉ thị xuất kho, trong khi §10.3 và `locked` lại phụ thuộc vào nó.
3. **Không có spec giao diện ngoài** (THOMAS CSV, import tracking / shipment result) và không có spec notification.

Ngoài ra bảng transition §12.2 **chưa đóng** (có state không có đường ra), và tài liệu **không có mục 未決** nên 12 điểm chưa quyết đang bị ẩn.

> **Cập nhật 2026-09-22** — B1 / B2 / B3 / B4 **đã bổ sung** (§7). **Mục 5 đã chốt: tách 2 bảng** `contract_routes` + `delivery_legs`, bỏ `deliveries.route_override` (§8). D1 / D2 do đó cũng đã xử lý. Còn lại: **B5** và **B6**. Nhóm C ở §3 **không đưa vào** theo chỉ thị.

---

## 1. Đối chiếu quyết định v2.1 — 3 chỗ

| Quyết định | ① Nghiệp vụ | ② State / Batch | ③ Data model | |
|---|---|---|---|---|
| #1 Đổi ngày sau order close | §9.2 | §15.4 | `deliveries.locked_at` / `change_request_status` | ✅ |
| #2 Xóa role kho | §3.1 | §15.2 permission matrix | (không còn role kho) | ✅ |
| #3 Lock = first successful send | §9.3 / §10.3 | §7.3 / §16.10 | `locked_at` / `locked_source` / `ship_orders` | ✅ |
| #4 Final leg | §2.4 / §12.3 | §16.8 / §16.9 | `delivery_routes.is_final_leg` / `completion_source` | ✅ |
| #5 Cấm duplicate từ draft | §9.4 | §7.3 | §15.11 / `parent_delivery_id` | ✅ |
| #6 Unique key của plan | §7.1 | §7.2 / §16.2 | `UNIQUE(contract_id, line_no, channel_id, cycle_id, occurrence_key)` | ✅ |
| #7 Ba trục | §2.4 / §4.2 | §12.3 / §16.8 | `contract_delivery_channels` / `delivery_routes` | ✅ |
| #8 Receive windows | §3.4 | §8.1 | `site_receive_windows` / `delivery_receive_windows` | ✅ |
| #9 Provisional guard | §8.3 | §15.6 / §16.4 | `delivery_cycles.marker_source` | ✅ |
| #10 Tách invoice theo due date | §13.6 | §16.6 | `UNIQUE(contract_month_id, billing_type, payment_due_date)` | ✅ |
| #11 Cycle month = B7 | §2.2 | §16.1 | `delivery_cycles.b7_date` / `cycle_month` | ✅ |
| S1 `estimated_qty` | §4.4 | — | `shipping_plans.estimated_qty` | ⚠ thiếu quy tắc **không trả `estimated_qty` cho khách khi draft** |
| S2 Ưu tiên snapshot contract month | §4.3 | §7.2 / §16.2 | `contract_month_delivery_channels` | ✅ |
| S3 Ghi bản v2.1 | — | — | — | ❌ tài liệu **không có bản / ngày / quan hệ tài liệu gốc** |
| S4 Đổi tiêu đề 委託便 | §12.3 "Final-leg completion" | — | — | ✅ |
| S5 Tách 2 state machine | §1 / §7.3 / §12 | §12.2 | `lifecycle` / `status` | ✅ |

---

## 2. Thiếu — chặn dev (phải bổ sung trước khi code)

| # | Nội dung | Vị trí liên quan |
|---|---|---|
| B1 | **9 thực thể được dùng nhưng không định nghĩa**: `sites`(site_id, và `deliveries.branch_id`), `drivers`, `change_requests`(§15.5 nói pending/proposed), `delivery_overrides`(§9.1), `site_receive_blocks`(§6.1, §9.1), bảng hàng đợi **review / missing / anomaly**(§16 tạo "review item" 5 lần), master **料金改定世代**(`plan_rate_generation`, `price_revision_gen`), nguồn **menu / order** (order_start/close, confirmed quantity) | §14 |
| B2 | **Không có batch gửi ship order.** §16 có 12 job, không job nào gửi chỉ thị xuất kho. Quy tắc "gộp 2 tuần, gửi thứ Sáu trước ngày bắt đầu 3 ngày" và `warehouses.ship_order_lead_days` không có chỗ dùng | §10.3 / §16 |
| B3 | **Không có spec I/F ngoài**: layout CSV chỉ thị xuất kho cho THOMAS; có hay không I/F hủy (đang là 未確認); format import tracking / shipment result (cột, khóa đối chiếu, xử lý lỗi/trùng). §15.8 chỉ có guard, không có format | §10 / §11 / §15.8 |
| B4 | **Nguồn confirmed quantity không định nghĩa** — §8.2 nói "lấy confirmed quantity" nhưng không nói lấy từ đâu, thời điểm nào, xử lý khi thiếu | §8.2 / §16.4 |
| B5 | **Bảng transition chưa đóng**: `一部納品済` và `再配達待` **không có đường ra**; thiếu `出荷済/受取済 → 取消/中止`; thiếu `確認中 → 取消`. Và **chưa định nghĩa ý nghĩa từng status** (`中止` khác `取消` ở đâu) | §12.1 / §12.2 |
| B6 | **Không có spec notification.** §8.3 cấm "confirmation notification" khi provisional, nhưng cả tài liệu không có danh sách notification / trigger / người nhận / nội dung | §8.3 |

**Trạng thái 2026-09-22**: B1 ✅　B2 ✅　B3 ✅　B4 ✅　B5 ❌ chưa làm　B6 ❌ chưa làm

---

## 3. Thiếu — cần bổ sung (không chặn nhưng sẽ hỏi lại)

| # | Nội dung | Quyết định gốc |
|---|---|---|
| C1 | Header tài liệu: **bản v2.1**, ngày, và quan hệ với `決定_v2.1` / `要確認_回答` / `統合仕様書` | S3 |
| C2 | **Không có mục 未決** — 12 điểm chưa quyết (6 暫定値 + 6 điểm §G) đang bị ẩn hoàn toàn | 第1次 E / G |
| C3 | `temp_type` **chưa liệt kê enum**: 冷凍 / 冷蔵・常温 / 資材 (3 giá trị) | #8 |
| C4 | **Ngưỡng picking 300件/日** (đã sửa từ 150) không ghi; và không ghi xử lý khi vượt ngưỡng | 第1次 F |
| C5 | Chuyến **kho tự lấy hàng**: ES tự đánh số tracking **từ delivery ID** | #55 |
| C6 | Relay lead time: **tổng là chuẩn**, phần trung chuyển chỉ là giá trị tham khảo | #21 |
| C7 | `contract_monthly_generate` **chưa ghi mốc = `order_start_date`** | #40 |
| C8 | Range cycle **mặc định 6 tháng** | 第1次 F |
| C9 | Holiday master: nguồn 内閣府, nhập tay 1 lần/năm, **không làm API/auto-import** | #9 |
| C10 | **Tự phát hiện hàng hạn ngắn** khi có thay đổi — có `products.shelf_life_days` nhưng không có quy tắc nào dùng | §G (chưa quyết điều kiện) |
| C11 | **Không làm gán lại driver hàng loạt** ở Phase 2 — nên ghi là ngoài phạm vi | #65 |
| C12 | Bao lạnh / đá khô: **dùng một lần, không thu hồi, chỉ ghi số** | #64 |

---

## 4. Mâu thuẫn / mơ hồ

| # | Nội dung |
|---|---|
| D1 | ✅ Đã xử lý 2026-09-22 — §14.10 ghi rõ `deliveries.branch_id` giữ `sites.id` của điểm giao tại thời điểm materialize |
| D2 | ✅ Đã xử lý 2026-09-22 — bỏ `deliveries.route_override`; sửa route của một chuyến là sửa `delivery_legs` của chuyến đó (§15.13) |
| D3 | `cash_expected_amount` / `cash_collected_amount` có cột nhưng **không có một quy tắc nghiệp vụ nào** (thu hộ? ai nhập? vào billing thế nào?) |
| D4 | §3.2 "mismatch nhiệt độ/khu vực tạo warning" — warning hiện ở đâu, có lưu không, ai xử lý: chưa nói |
| D5 | §13.1 "Ops assign/reassign mọi delivery" đứng cạnh C11 (không có bulk) → nên nói rõ là **từng bản ghi một** |

---

## 5. Cấu trúc route — **đã chốt 2026-09-22**

Điểm treo ở `統合仕様書 v2.1 §18 No.18` đã được quyết: **tách 2 bảng**.

| | Bảng | Vai trò |
|---|---|---|
| Định nghĩa | `contract_routes` | Route của từng delivery channel, dạng leg. Version theo `effective_from` của chính channel |
| Snapshot tháng | `contract_month_routes` | Bản chụp lúc sinh contract month |
| Thực tế | `delivery_legs` | Chặng thực tế của từng chuyến. Nơi duy nhất có `driver_id` |

Kèm theo: **bỏ `deliveries.route_override JSON`**; sửa route của một chuyến là sửa thẳng `delivery_legs` của chuyến đó kèm audit.

Chi tiết đã phản ánh vào tài liệu — xem §8.

---

## 6. Thứ tự việc cần làm

1. Chốt D1 / D2 / mục 5 (cấu trúc) — vì đụng vào data model.
2. Bổ sung B1 (9 bảng thiếu).
3. Bổ sung B2 + B3 + B4 (ship order, I/F ngoài, nguồn quantity).
4. Đóng B5 (bảng transition + định nghĩa status).
5. Thêm B6 (notification).
6. Thêm C1 + C2 (header bản v2.1 + mục 未決), rồi C3–C12.
7. Cập nhật `法人拠点契約子契約_項目一覧.md` cho khớp (hiện vẫn chưa lên v2.1).

---

## 7. Đã bổ sung vào tài liệu — 2026-09-22

Bản trước khi sửa: `99_過去/DEV仕様書_サイクル・出荷・ピッキング・配送_VI_v2.3_旧_20260922.md`（1086 dòng → 1343 dòng）

| Lỗ hổng | Đã thêm | Vị trí |
|---|---|---|
| **B1** 9 thực thể thiếu | `corporations` / `sites` / `drivers`；`change_requests` / `delivery_overrides` / `site_receive_blocks` / `review_items`；`menus` / `order_quantities` / `plan_rates` — kèm ràng buộc và quan hệ với các bảng cũ | §14.10 / §14.11 / §14.12 mới |
| **B2** batch gửi ship order | Quy tắc lô 2 tuần + `send_target_date = window_start − ship_order_lead_days` + daily catch-up；batch `ship_order_send`；cột `window_start` / `window_end` / `send_target_date` / `retry_count` / `error_detail` / `export_unit` | §10.4 mới、§16.6 mới、§14.8、job chain |
| **B3** I/F ngoài | Canonical payload gửi THOMAS + quy tắc chuẩn hóa để tính `payload_hash`；hủy/sửa bằng revision (`qty=0`, `is_zeroed`)；format import tracking và import shipment result kèm bảng xử lý từng dòng；quy tắc chung cho import | §19 mới (19.1–19.5) |
| **B4** nguồn confirmed quantity | Lấy từ `order_quantities` theo unique key của plan；không có → review item `qty_missing`；`confirmed_qty = 0` xử lý như hủy trước xuất | §8.2、§16.5、§14.12 |

Quy ước 3 chỗ đều được giữ:

| | ① Nghiệp vụ | ② State / Batch | ③ Data model |
|---|---|---|---|
| B2 | §10.4 | §16.6 | §14.8 |
| B3 | §10.4 / §11 | §16.6 / §16.11 / §16.12 | §19 |
| B4 | §8.2 | §16.5 | §14.12 |

Đánh số cũ 16.6–16.13 đã dời thành 16.7–16.14; tham chiếu duy nhất theo số (`bảng 12.2`) không bị ảnh hưởng.

Còn lại chưa làm: **B5**（đóng bảng transition + định nghĩa từng status）、**B6**（spec notification）、**mục 5**（chốt `delivery_routes` một bảng hay tách `delivery_legs`）。

---

## 8. Tách bảng route — 2026-09-22

`carrier1_id` / `relay_warehouse_id` / `carrier2_id` đã **bị gỡ khỏi** `contract_delivery_channels` và `contract_month_delivery_channels`; channel chỉ còn kho picking, lead time, service form, delivery regime mặc định và share.

| Chỗ | Nội dung |
|---|---|
| §2.4 | relay suy ra từ **số leg của `delivery_legs`** |
| §4.2 | channel không còn giữ carrier/hub |
| §4.6 mới | Route của hợp đồng: bảng 1 leg / 2 leg, leg 1 xuất từ `channel.warehouse_id`, leg cuối `is_final_leg` + `to_type = destination`, version theo channel |
| §8.1 | Materialize sinh `delivery_legs` từ `contract_month_routes`, chỉ khi chưa có contract month mới dùng `contract_routes` |
| §9.4 | Duplicate copy toàn bộ legs, **không** copy driver |
| §12.3 | Final leg = `delivery_legs.is_final_leg` |
| §13.1 | Assignment theo từng `delivery_legs` |
| §14.2 | Thêm `contract_routes` + `contract_month_routes`; channel đã gỡ 3 cột |
| §14.3 | Bỏ `shipping_plans.route_id` |
| §14.4 | Đổi thành **Delivery legs**: `delivery_legs` + 6 unique constraint + guard dùng chung cho cả 3 bảng |
| §14.6 | Bỏ `deliveries.route_override JSON` |
| §15.8 / §19.1 / §19.3 | Carrier đối chiếu theo leg thay vì "route" |
| §15.9 | Leg phải thuộc chính delivery đó |
| §15.13 mới | Guard cho việc sửa route của một delivery |
| §16.1 | Snapshot `contract_month_delivery_channels` + `contract_month_routes` |
| §16.3 | Delivery và legs tạo trong cùng transaction |
| §16.9 / §16.10 | Điều kiện đọc `delivery_legs(is_final_leg).delivery_regime` |

Ràng buộc mới:

```sql
UNIQUE(channel_id, leg_no)             -- contract_routes
UNIQUE(channel_id) WHERE is_final_leg
UNIQUE(month_channel_id, leg_no)       -- contract_month_routes
UNIQUE(month_channel_id) WHERE is_final_leg
UNIQUE(delivery_id, leg_no)            -- delivery_legs
UNIQUE(delivery_id) WHERE is_final_leg
```

Điểm phải theo dõi: Phase 2 giới hạn 2 leg. Nếu Phase 3 cần nhiều hơn, `contract_routes` đã ở dạng leg nên **không cần đổi cấu trúc**, chỉ nới guard.

Còn lại chưa làm: **B5**（đóng bảng transition + định nghĩa từng status）、**B6**（spec notification）。


---

# Cập nhật 2026-09-23

## Trạng thái hiện tại

| Nhóm | Trạng thái |
|---|---|
| B1 / B2 / B3 / B4 | ✅ đã xong (2026-09-22, §7) |
| **B5** — đóng bảng transition + định nghĩa status | ✅ **đã xong** (2026-09-23) |
| **B6** — spec notification | ✅ **đã đóng — đưa ra ngoài phạm vi** (2026-09-23). Notification không thuộc DEV Functional Specification; đã ghi vào mục "Ngoài phạm vi" ở đầu tài liệu. Nội dung thông báo do tài liệu riêng của chức năng お知らせ配信 định nghĩa |
| D1 / D2 | ✅ đã xong (2026-09-22) |
| **D3** — quy tắc thu tiền mặt | ✅ **đã xong** — §13.6 mới |
| **D4** — warning lệch nhiệt độ/khu vực | ✅ **đã xong** — §3.2 |
| **D5** — assign từng bản ghi một | ✅ **đã xong** — §13.1 |
| **C1** — header bản/ngày | ✅ **đã xong** — đầu tài liệu, ghi rõ đây là nguồn chuẩn của data model |
| C2–C12 | ❌ chưa làm (trước đây có chỉ thị không đưa vào). **C4 (ngưỡng 300件/日) đã vào §3.1 cùng v2.3** |
| Mục 7 — `法人拠点契約子契約_項目一覧.md` | ❌ **chưa làm**, vẫn chưa lên v2.1/v2.2/v2.3 |

## B5 — nội dung đã chốt (決定_v2.3 追補 #11)

- `取消` = huỷ **trước khi hàng rời kho** (`shipped_date IS NULL`). `中止` = dừng **sau khi đã xuất kho**. Cả hai actual 0, không tính tiền.
- Trạng thái cuối: `納品済` / `一部納品済` / `再配達待` / `中止` / `取消`. `確認中` không phải trạng thái cuối.
- `一部納品済` và `再配達待` **đóng tại record cha**; phần còn lại / lần giao lại nằm ở record con, chạy từ `確認中`. **Con không làm cha đổi trạng thái.**
- Transition thêm: `出荷済 → 中止`、`受取済 → 中止`、`確認中 → 出荷待`、`確認中 → 取消`（chỉ khi chưa xuất kho）.
- Mỗi status đã có định nghĩa và cột "trạng thái cuối?" ở §12.1.

## Quy tắc nghiệp vụ cho các cột thêm ở v2.3 (追補 #12–#14)

| Cột | Quy tắc | Vị trí |
|---|---|---|
| `deliveries.lead_time` | Ưu tiên `deliveries` > contract month > contract. Chỉ có ở delivery, không có ở plan | §6.0 mới |
| `delivery_lines` | Ghi lúc materialize / báo cáo giao hàng / trouble `qty_diff`. Con giữ chi tiết riêng, không sửa của cha | §8.2 / §11 / §13.2 / §13.3 / §13.5 |
| `deliveries.order_id` | Set lúc finalize quantity, từ `order_quantities` đã khớp. Không khớp → NULL + `qty_missing` | §8.2 |

## Còn lại để giao dev

1. **`法人拠点契約子契約_項目一覧.md`** cập nhật theo v2.1/v2.2/v2.3.
2. C2–C12 nếu muốn làm nốt (trước có chỉ thị bỏ qua).

> **B6 đã đóng** bằng cách đưa notification ra ngoài phạm vi (2026-09-23), không phải bằng cách viết spec.
