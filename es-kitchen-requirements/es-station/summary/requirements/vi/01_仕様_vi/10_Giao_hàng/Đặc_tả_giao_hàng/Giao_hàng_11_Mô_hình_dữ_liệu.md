# Đặc tả giao hàng: Mô hình dữ liệu (bảng · cột · trạng thái) — Bản chính

〔Nguồn gốc: Đặc tả DEV §14 (Nhật hóa ngày 2026-10-03)〕

<!-- Nguồn: Đặc_tả_DEV_Chu_kỳ_Xuất_hàng_Picking_Giao_hàng_VI_v2.3.md §14 (tiếng Việt). Số mục giữ nguyên như DEV (DEV §14.x = tài liệu này 14.x). -->

**Bản chính của bảng · cột · ràng buộc của giao hàng là file này.** Đã chuyển sang tiếng Nhật và dời về đây Đặc tả DEV §14 vốn là "bản chính duy nhất" từ trước đến nay (trả lời của hong: giao hàng gộp vào một bản đặc tả tích hợp, mô hình dữ liệu của DEV cũng được Nhật hóa rồi đưa vào. DEV bị đóng băng). `Giao_hàng_09_Mô_hình_dữ_liệu_và_batch.md` §16 được đọc như **mục lục** trỏ tới file này.

- Tên bảng · tên cột · giá trị enum **giữ nguyên tiếng Anh** (giống DEV · code). Tiếng Việt chỉ là phần giải thích.
- **Quyết định đang có hiệu lực hiện nay là `docs/決定台帳.md`**. Chỗ nào DEV và sổ cái lệch nhau thì theo sổ cái và ghi **【Sửa theo sổ cái】**.
- Cột · bảng không có trong DEV mà được tạo từ quyết định của sổ cái là **【Bổ sung · 2026-10-03】** (là phương án mô hình dữ liệu. Chốt sau khi phát triển xác nhận).
- Chỗ không quyết định hết được bằng DEV · chỗ không tự tin về cách dịch là **【Cần xác nhận】**.
- Những mục vốn đã là **【Phương án】** trong DEV thì giữ nguyên 【Phương án】.
- Kiểu · độ dài của cột cũng không được ghi trong DEV nên ở đây cũng không quyết định (chỉ số ký tự ở "Quy tắc chung" bên dưới là do sổ cái quyết định).

---

## 14.0 Quy tắc chung · chỗ đã sửa theo sổ cái

**Độ dài chuỗi ký tự (sổ cái B "Nhập ký tự 1 dòng")** 【Sửa theo sổ cái】

| Loại | Giới hạn | Ví dụ |
|---|---|---|
| Nhập ký tự 1 dòng | **60 ký tự** | Tên · kana · tiêu đề · `reason` (khi là 1 dòng) |
| Địa chỉ | **255 ký tự** | `address_fields` · `address_snapshot` |
| Nhập nhiều dòng | **500 ký tự** | `note` · `internal_memo` · `delivery_condition` · `resolution_reason` |

(Cũ: không dùng 120／80／50 ký tự của danh sách hạng mục · đặc tả kiểm tra nhập liệu) 【Cần xác nhận】 Cột nào là "1 dòng" hay "nhiều dòng" do ô nhập trên màn hình quyết định. Việc gán theo từng cột sẽ được lập thành danh sách ở phía phát triển.

**Những chỗ trong file này đã theo sổ cái (danh sách)**

| Chủ đề của sổ cái | Quyết định của sổ cái | Cách xử lý trong file này | Mục |
|---|---|---|---|
| Đăng nhập của tài xế | ID đăng nhập + mật khẩu. Đặt lại bằng mã xác thực 4 chữ số | `drivers.login_id` là duy nhất. Cột · bảng cho mật khẩu và mã xác thực là 【Bổ sung · 2026-10-03】 | 14.10 |
| Hạn tiêu thụ (`expiry_date`) | Không theo dõi. Không có ô nhập lẫn cột | Không đặt `expiry_date` ở `delivery_lines` hay bất kỳ bảng nào khác (`shelf_life_days` của master sản phẩm = số ngày hạn tiêu thụ thì giữ lại. Dùng cho cảnh báo hạn tiêu thụ ngắn 〈`shelf_life_warning`〉) | 14.5 · 14.7 |
| Số lần giao hàng (1 chu kỳ) | 1〜8 lần | Ràng buộc phạm vi 1〜8 cho `contract_delivery_channels.delivery_count` 【Sửa theo sổ cái】 | 14.2 |
| Báo cáo đỗ xe | Cần: tài xế nhập ảnh biên lai + phí đỗ xe. Không hiển thị phí đỗ xe trong ô thu tiền | `delivery_parking_reports` và loại tệp đính kèm là 【Bổ sung · 2026-10-03】 | 14.7 |
| Ngày của Số giao hàng | Ngày xuất hàng dự kiến tại thời điểm tạo dữ liệu giao hàng (`DL-yymmdd-nnnn`). Không đổi số 〔trả lời của hong 2026-10-03〕 | `deliveries.delivery_no` là 【Bổ sung · 2026-10-03】 | 14.6 |
| Tỷ lệ đông lạnh | Không nắm giữ | Không tạo cột (DEV cũng không có `frozen_ratio`) | 14.12 |
| Nhập ký tự 1 dòng | Tối đa 60 ký tự (địa chỉ 255 · nhiều dòng 500) | Bảng ở trên | 14.0 |

---

## 14.1 Chu kỳ · lịch

| Bảng | Cột | Ghi chú |
|---|---|---|
| `delivery_cycle_settings` | `id, first_a1_date, range_from, range_to, fixed_through, operation_start, note, saved_at, saved_by` | Cài đặt chu kỳ giao hàng. **Chỉ 1 bản ghi cho toàn hệ thống** (DEV §2.1). `fixed_through` = các tháng đến đây đã chốt và không thể chỉnh sửa |
| `delivery_cycle_pauses` | `id, setting_id, name, start_date, end_date, kind(normal｜adjust), adjust_for_pause_id NULL` | Tạm dừng chu kỳ. `normal` = tạm dừng do vận hành đăng ký／`adjust` = tạm dừng dùng để điều chỉnh cho khớp bội số của 7 ngày. `adjust` giữ **bù cho tạm dừng nào** bằng `adjust_for_pause_id` (DEV §5.2) |
| `delivery_cycles` | `id, cycle_no, cycle_month, a1_date, b7_date, d7_date, menu_open_date, order_start_date, order_close_date, marker_source(menu｜provisional), marker_copied_at` | 1 chu kỳ = 1 dòng. `cycle_month` là tháng của `b7_date` (DEV §2.2). 3 ngày mốc được sao chép từ menu. Nếu menu chưa công bố thì dùng mốc tạm với `marker_source = provisional` (14.12 · DEV §8.3) |
| `delivery_cycle_days` | `date PK, cycle_no, cycle_label, slot_code, week, is_first, is_pause` | Lịch chu kỳ đã tạo (materialized). Ngày tạm dừng không làm tăng số thứ tự khung (DEV §5.3) |
| `holidays` | `date PK, name` | Master ngày lễ. **Tự động lấy 1 lần mỗi năm từ API ngày lễ công khai + "Lấy lại ngày lễ"** (`配送_01` §3-5) 〔trả lời của hong 2026-10-03〕 |
| `delivery_holiday_days` | `id, setting_id, date, is_delivery_holiday, is_picking_closed, source, name` | Dấu "ngày lễ giao hàng" và "không xuất được" theo ngày (BẬT／TẮT theo từng ngày) |
| `warehouse_non_picking_slots` | `id, setting_id, warehouse_id, slot_code` | Khung không xuất được theo kho (`A1`〜`D7`) |
| `warehouse_non_picking_days` | `id, setting_id, warehouse_id, date_from, date_to, type(manual_closed｜business_override), reason` | Ngày không xuất được theo kho (đăng ký theo khoảng thời gian). `business_override` = khung không xuất được nhưng ngày này vẫn hoạt động |

---

## 14.2 Hợp đồng

| Bảng | Cột | Ghi chú |
|---|---|---|
| `contracts` | `id, site_id, mode(cycle｜special｜on_demand), plan_qty, delivery_count, ng_weekdays, holiday_shift(-1｜1), delivery_condition, status(provisional｜active｜change_scheduled｜suspend_scheduled｜suspended｜resume_scheduled｜cancel_scheduled｜ended), start_cycle_month, confirmed_at NULL, confirmed_by NULL, effective_from, effective_to` | `delivery_count` = **tổng số lần của từng phân loại giao hàng** (để tham chiếu · không nhập. DEV §4.9). `confirmed_at` = thời điểm chốt (đăng ký chính thức) cơ sở. Xem "Trạng thái hợp đồng trở thành đối tượng tạo" bên dưới |
| `site_receive_windows` | `id, site_id, from_time, to_time, sort_order` | Khung giờ nhận hàng của cơ sở. **Nhiều dòng cho 1 cơ sở**. Không dùng để tính ngày (DEV §3.4) |
| `contract_delivery_lines` | `id, contract_id, line_no, slot_code NULL, specified_day NULL, qty` | Chi tiết giao hàng (cài đặt của hợp đồng). **Có 2 dòng cùng `slot_code` (hoặc cùng `specified_day`) vẫn lưu được**. Màn hình chỉ cảnh báo, không chặn (2026-09-22) |
| `contract_delivery_channels` | `id, contract_id, temp_type, warehouse_id, delivery_count NULL, lead_time, service_form(es_delivery｜cool｜material), delivery_regime(self｜partner_driver｜parcel_carrier), share_pct, effective_from` | Phân loại giao hàng (giá trị mặc định của hợp đồng cha). `delivery_count` = **số lần giao hàng của từng phân loại giao hàng** (vật tư là NULL. Lạnh từ 1 trở lên, ES Standard thì đông lạnh cũng từ 1 trở lên. DEV §4.9). **Phạm vi 1〜8** 【Sửa theo sổ cái】 (sổ cái B "số lần giao hàng 1〜8 lần". DEV chỉ có cận dưới mà không có cận trên. Cũ: 1〜4). `lead_time` là 0〜7 (DEV §4.2). **Công ty vận chuyển · điểm trung chuyển không giữ ở đây mà giữ ở `contract_routes`** |
| `contract_routes` | `id, channel_id, leg_no, from_type(warehouse｜relay), from_id, to_type(relay｜destination), to_id NULL, carrier_id, delivery_regime, is_final_leg, assign_scope(ops｜carrier)` | Định nghĩa tuyến theo từng phân loại giao hàng (chặng). **Không có `driver_id`** (14.4) |
| `contract_months` | `id, contract_id, cycle_month, generated_at, generation_method, price_revision_gen` | Hợp đồng con (theo tháng chu kỳ). `price_revision_gen` = thế hệ giá đã snapshot (14.12) |
| `contract_month_delivery_channels` | `id, contract_month_id, channel_id, temp_type, warehouse_id, lead_time, service_form, delivery_regime, snapshot_at` | Phân loại giao hàng đã sao vào hợp đồng con |
| `contract_month_routes` | `id, month_channel_id, leg_no, from_type(warehouse｜relay), from_id, to_type(relay｜destination), to_id NULL, carrier_id, delivery_regime, is_final_leg, assign_scope(ops｜carrier), snapshot_at` | Tuyến đã sao vào hợp đồng con. **Không có `driver_id`** |

**Ràng buộc (phần bổ sung ở 14.2)**

```sql
CHECK (delivery_count IS NULL OR delivery_count BETWEEN 1 AND 8)   -- contract_delivery_channels【Sửa theo sổ cái】
```

**Trạng thái hợp đồng trở thành đối tượng tạo** (DEV §4.7)

| `contracts.status` | Kế hoạch (plan) | Dữ liệu giao hàng (delivery) | Hợp đồng con (contract month) |
|---|---|---|---|
| `provisional` (đăng ký tạm · tiếp nhận "đang cài đặt") | Không tạo | Không tạo | Không tạo |
| `active` · `change_scheduled` · `suspend_scheduled` (đến trước ngày bắt đầu tạm dừng) · `resume_scheduled` (sau khi tiếp tục) · `cancel_scheduled` (đến ngày hủy hợp đồng) | Tạo | Tạo | Tạo |
| `suspended` (đang tạm dừng) · `ended`, khoảng trống từ khi hết hạn dùng thử đến khi triển khai chính thức | Không tạo | Không tạo | Không tạo |

【Cần xác nhận】 DEV §4.5 viết rằng "hợp đồng／cơ sở có dấu ngày lễ (holiday flag)" nhưng `contracts` ở §14.2 không có cột. `Giao_hàng_03_Cài_đặt_giao_hàng_của_hợp_đồng.md` §5-1 nêu `receive_off_holiday` (có giao vào ngày lễ hay không) · `ai_qty_mode` (chế độ AI) · `delivery_note` (ghi chú giao hàng) là hạng mục của hợp đồng. Cần xác nhận với phía phát triển có thêm cả 3 cột vào `contracts` hay không.

---

## 14.3 Kế hoạch giao hàng (shipping plan)

| Bảng | Cột | Ghi chú |
|---|---|---|
| `shipping_plans` | `id, contract_id, line_no, channel_id, cycle_id, occurrence_key, cycle_no, cycle_label, slot_code, seed_date, delivery_date, delivery_shift_days, raw_pick_date, picking_date, pick_shift_days, lead_time, actual_lead_time, estimated_qty, lifecycle(draft｜published｜locked), override_id NULL, contract_month_id NULL, delivery_id NULL, temp_type, warehouse_id, carrier_id, manual_moved, shift_reversed, route_snapshot_source(contract_month｜contract), ungeneratable_reason NULL` | `estimated_qty` = số lượng dự kiến đã phân bổ (DEV §4.4). `lifecycle` là `plan lifecycle`, là máy trạng thái khác với `deliveries.status` (`delivery status`). `shift_reversed` = dấu đã đảo chiều chuyển ngày. `ungeneratable_reason` = lý do không tạo được kế hoạch do không có ứng viên trong vòng 20 ngày (DEV §6.4) |

```sql
UNIQUE(contract_id, line_no, channel_id, cycle_id, occurrence_key)
```

- Không dùng `(contract_id, delivery_date)` làm khóa duy nhất (cùng một ngày có thể có nhiều phân loại giao hàng. DEV §7.1).

---

## 14.4 Chặng (delivery legs)

Tuyến được lưu trong **các bảng riêng biệt**. `contract_routes`／`contract_month_routes` là định nghĩa và snapshot theo tháng (14.2), `delivery_legs` là các chặng thực tế của từng bản ghi giao hàng.

| Bảng | Cột | Ghi chú |
|---|---|---|
| `delivery_legs` | `id, delivery_id, leg_no, from_type(warehouse｜relay), from_id, to_type(relay｜destination), to_id, carrier_id, temp_type, delivery_regime, is_final_leg, driver_id NULL, assign_scope(ops｜carrier), assigned_by NULL, assigned_at NULL, picked_up_at NULL, picked_up_by NULL, snapshot_source(contract_month｜contract), snapshot_at` | Các chặng thực tế của 1 bản ghi dữ liệu giao hàng. Việc gán tài xế (`driver_id`) **chỉ có ở đây**. `picked_up_at`／`picked_up_by` = thời điểm · người nhận hàng ở chặng đó (DEV §13.1) |

```sql
UNIQUE(channel_id, leg_no)            -- contract_routes
UNIQUE(channel_id) WHERE is_final_leg
UNIQUE(month_channel_id, leg_no)      -- contract_month_routes
UNIQUE(month_channel_id) WHERE is_final_leg
UNIQUE(delivery_id, leg_no)           -- delivery_legs
UNIQUE(delivery_id) WHERE is_final_leg
```

**guard chung cho 3 bảng**

| # | Quy tắc |
|---|---|
| 1 | `leg_no` là số thứ tự liên tiếp từ 1, không được nhảy cóc |
| 2 | leg 1 có `from_type = warehouse` và `from_id = channel.warehouse_id` |
| 3 | `from_id` của leg `n+1` = `to_id` của leg `n` |
| 4 | leg có `is_final_leg = true` có đúng 1 chặng, và leg đó có `to_type = destination` |
| 5 | Không trung chuyển = 1 chặng, có trung chuyển = 2 chặng (giai đoạn 2) |
| 6 | Công ty vận chuyển ①② trên màn hình luôn bắt buộc cả hai. Điểm đi qua phải chọn "Không" một cách tường minh (mặc định "Không") 〔trả lời của hong 2026-10-03 · REQ-DL-710〕. 【Cần xác nhận · phát triển】 Khi không trung chuyển (① = ② cùng một công ty), có gộp ② vào `carrier_id` của 1 chặng hay giữ riêng |

**Quy tắc chỉ dành cho `delivery_legs`**

| Quy tắc | Nội dung |
|---|---|
| Khi nào tạo | Khi chốt tạo (materialize). Nếu có hợp đồng con thì sao từ `contract_month_routes`, nếu không có thì sao từ `contract_routes`, và lưu nguồn đã sao vào `snapshot_source` (DEV §8.1) |
| Đích của chặng cuối | `to_id` của leg cuối cùng = `deliveries.site_id` đã snapshot |
| Bất biến | **Là snapshot không đổi sau khi sao.** Sửa `contract_routes` cũng không ảnh hưởng dữ liệu giao hàng đã tạo |
| Đổi tuyến chỉ cho chuyến giao này | Sửa trực tiếp `delivery_legs` của chuyến giao đó và ghi vào audit (API đặc tả 15.13). **Không có cột riêng để ghi đè** |
| Nhân bản | Sao chép toàn bộ leg nhưng không sao chép `driver_id` · `assigned_by` · `assigned_at` (DEV §9.4). Cũng không sao chép `picked_up_at` · `picked_up_by` (`配送_09` §16-3) |
| Đơn vị gán | `contract_routes` · `contract_month_routes` không có `driver_id`. Việc gán tài xế chỉ có ở đơn vị dữ liệu giao hàng |

---

## 14.5 Master

| Bảng | Cột | Ghi chú |
|---|---|---|
| `warehouses` | `id, name, slip_name, kana, warehouse_type(picking｜relay｜return), carrier_id, status, warehouse_code, branch_code, address_fields, pick_count_threshold, ship_order_lead_days, thomas_csv_unit` | `pick_count_threshold` mặc định 300, `ship_order_lead_days` mặc định 3 (DEV §3.1). `return` = nơi trả hàng (nơi gửi trả hàng còn lại về trụ sở, v.v.). **Không có lead time** |
| `warehouse_staff` | `id, warehouse_id, role(main｜sub), name, kana, email, tel` | Người phụ trách của kho (thông tin liên hệ. Không phải chủ thể đăng nhập) |
| `carriers` | `id, name, kind(self｜outsourced), temp_types, service_weekdays, coolbag_no NULL, coolant_no NULL, has_coolant_mgmt, has_vending, inquiry_url, status` | `service_weekdays` = thứ hỗ trợ (2026-09-30). `coolbag_no`／`coolant_no` = số túi giữ lạnh · chất giữ lạnh (2026-09-30). Cũ: cột `areas` (4 vùng) → đã chuyển sang `carrier_areas` vào 2026-09-30 |
| `carrier_areas` | `carrier_id, prefecture_code` | Khu vực hỗ trợ (theo đơn vị tỉnh) (2026-09-30) |
| `carrier_rates` | `id, carrier_id, prefecture_code, pay_amount, regional_surcharge NULL, note, updated_by, updated_at` | Bảng giá. Nhập bằng CSV. `regional_surcharge` = phụ phí vùng (**vận hành nhập tay. Không tự tính**). Đơn vị của `pay_amount` (mỗi lần／theo tháng) và việc có chia nhỏ hơn cấp tỉnh hay không là 【Cần xác nhận】 (DEV §3.2 cũng chưa quyết) |
| `delivery_inquiries` | `id, site_id NULL, prospect_name NULL, postal_code NULL, prefecture_code, city NULL, address_line NULL, temp_types, note, created_by, created_at` | Yêu cầu hỏi về giao hàng (đơn vị gửi yêu cầu báo giá). Khi đang thương thảo chưa có cơ sở nên `site_id` có thể NULL |
| `carrier_quote_responses` | `id, inquiry_id, carrier_id, requested_at, result(available｜unavailable) NULL, monthly_fee NULL, comment NULL, relay_warehouse_id NULL, responded_by NULL, responded_at NULL` | 1 công ty giao hàng ủy thác được yêu cầu báo giá = 1 dòng. `result` là NULL = chưa trả lời. `relay_warehouse_id` = điểm trung chuyển mà công ty giao hàng ủy thác đề xuất (`warehouse_type = relay`) |
| `carrier_quote_attachments` | `id, response_id, file_path, uploaded_by, created_at` | Tệp đính kèm của phản hồi báo giá |
| `products` | `id, code, name, temp_type, pack_size, shelf_life_days, unit_price, description, status` | `shelf_life_days` = **số ngày** hạn tiêu thụ (thuộc tính của sản phẩm). Dùng cho cảnh báo hạn tiêu thụ ngắn (DEV §3.3). **Không theo dõi hạn tiêu thụ theo lô (`expiry_date`)** (sổ cái) |
| `product_warehouses` | `id, product_id, warehouse_id, status` | Sản phẩm × kho (nhiều-nhiều) |

```sql
UNIQUE(carrier_id, prefecture_code)   -- carrier_areas
UNIQUE(carrier_id, prefecture_code)   -- carrier_rates
```

- Bảng công ty vận chuyển · yêu cầu hỏi về giao hàng (2026-09-30) 〔Bảng yêu cầu dòng 28 · 39 · 41 · 44 · 53 · 57 · 78 · Quyết_định_Trả_lời_phản_ánh_một_phần_bảng_yêu_cầu_20260930〕: quy tắc ở `Giao_hàng_01_Master.md` §3-3. **Không tạo bảng chat.** `carrier_quote_responses` cho phép công ty giao hàng ủy thác chỉ sửa dòng của chính mình. Hạn hiệu lực của phản hồi và "phản hồi lần đầu → phản hồi lại" là 【Cần xác nhận】 (chưa có cột).

**【Cần xác nhận】 của master (những chỗ phía `Đặc_tả_giao_hàng/` có quyết định mới hơn DEV)**

| Hạng mục | Quyết định của `Đặc_tả_giao_hàng/` | DEV §14 | Nội dung 【Cần xác nhận】 |
|---|---|---|---|
| Có liên kết THOMAS hay không | `配送_01` §3-1 #8B: theo từng kho "liên kết THOMAS Có／Không" (Không = văn phòng ES xuất vật tư. Khách hàng xác nhận A2 2026/10/01) | Không có cột | Có thêm cột có／không vào `warehouses` hay không (ví dụ `thomas_enabled`) |
| Mã kho (cho THOMAS) | `配送_01` §3-1 #8: **vận hành nhập** (khác với ID kho. D3-2 2026/10/01) | Có `warehouse_code`, nhưng DEV §19.1 viết "dùng nguyên ID kho `WH00001`" | Có thể coi `warehouse_code` là giá trị do vận hành nhập hay không (API đặc tả 19.1 cũng vậy) |
| Túi giữ lạnh · chất giữ lạnh | `配送_06` §12-5 (D3-5 2026/10/01): sổ cho mượn `carrier_coolers` theo từng đơn vị ủy thác (số · loại · số lượng · ngày giao · trạng thái · ghi chú · nhân viên giao hàng đã giao). **Không sao chép số vào dữ liệu giao hàng** | `carriers.coolbag_no／coolant_no`, `deliveries.coolbag_no／coolant_no` | Có thêm bảng sổ và bỏ các cột số ở `carriers` · `deliveries` hay không |
| Mẫu URL theo dõi | `配送_01` §3-3 (O-4 2026/10/01): nhập URL chứa `{送り状番号}` theo từng công ty vận chuyển | Chỉ có `inquiry_url` | Có tách thành cột riêng với `inquiry_url` hay không (ví dụ `tracking_url_template`). 【Cần xác nhận】 "mẫu URL theo dõi" và `inquiry_url` (URL liên hệ) có phải là cùng một thứ không |
| Ngày không giao ủy thác được | `配送_01` §3-3 · `配送_00` §1-4: do công ty vận chuyển nắm giữ | Không có cột · bảng | Có thêm bảng hay không |

---

## 14.6 Dữ liệu giao hàng (delivery)

| Bảng | Cột | Ghi chú |
|---|---|---|
| `deliveries` | `id, delivery_no【Bổ sung · 2026-10-03】, shipping_plan_id, contract_id, order_id NULL, lead_time NULL, site_id, delivery_date, shipped_date, status, locked_at NULL, locked_source(ship_order_sent), parent_delivery_id NULL, branch_seq NULL, duplicate_type(remainder｜redelivery｜alternative｜trouble_pending｜return) NULL, creation_source(materialize｜ops_duplicate｜trouble_auto), source_trouble_report_id NULL, source_trouble_delivery_id NULL, schedule_confirmed, quantity_confirmed, change_request_status, address_snapshot, return_to_warehouse_id NULL, destination_name, delivery_condition_snapshot, temp_type, planned_qty, delivered_qty, delivered_at, delivery_regime, service_form, completion_source(reported｜presumed｜customer), freight_billable, freight_bill_reason NULL, coolbag_no, coolant_no, cash_expected_amount, cash_collected_amount, note, internal_memo NULL` | Bảng bên dưới |

```sql
UNIQUE(shipping_plan_id)
CHECK(branch_seq IS NULL OR branch_seq BETWEEN 1 AND 9)
UNIQUE(source_trouble_delivery_id)
  WHERE creation_source = 'trouble_auto' AND status <> '取消'
UNIQUE(delivery_no)                                   -- 【Bổ sung · 2026-10-03】
```

| Cột · quy tắc | Nội dung |
|---|---|
| Chốt tạo thông thường | `creation_source = materialize`, `schedule_confirmed = true`, `quantity_confirmed` là true khi chốt số lượng (finalize) |
| Nguồn của bản nhân bản | Bản ghi con do vận hành tạo = `ops_duplicate`. Bản ghi con do hệ thống tạo khi đăng ký báo cáo sự cố = `trouble_auto` (đổi tên từ `trouble_timeout`. 2026-09-29) |
| `lead_time` | Lead time của **riêng 1 chuyến giao này**. Chỉ được nhập khi vận hành "Chỉ định riêng ngày" (DEV §6.0) |
| `internal_memo` | Ghi chú vận hành (2026-09-30) 〔Bảng yêu cầu dòng 164 · Quyết_định_Trả_lời_phản_ánh_một_phần_bảng_yêu_cầu_20260930〕. Vận hành viết cho từng bản ghi dữ liệu giao hàng. **Chỉ trả về cho vận hành** (không xuất hiện trong API của Web doanh nghiệp) |
| `source_trouble_delivery_id` | Chuyến giao xảy ra sự cố (có thể là cha hoặc con. DEV §9.4). Nhờ UNIQUE ở trên, **mỗi chuyến giao xảy ra sự cố chỉ có 1 bản ghi con tự động còn sống** (dù có nhiều báo cáo hay có thử lại). `source_trouble_report_id` là báo cáo đầu tiên đã tạo bản ghi con tự động, dùng để tham chiếu |
| `freight_billable` | Có thanh toán cước vận chuyển hay không. Dùng cho cả chờ giao lại và dừng. Mặc định false, true thì bắt buộc có lý do (`freight_bill_reason`). Tên cũ `redelivery_billable` (DEV §13.4) |
| `return_to_warehouse_id` | Chỉ khi nhân bản "gửi trả" (`duplicate_type = return`). Nơi trả hàng (`warehouses.warehouse_type = return`). Không thuộc đối tượng thanh toán (DEV §9.4) |
| `cash_expected_amount`／`cash_collected_amount` | Số tiền thu dự kiến (sao từ cài đặt của cơ sở khi chốt tạo. Nếu không có thì 0)／số tiền thu thực tế do tài xế nhập (DEV §13.6). **Không nhập phí đỗ xe vào đây · không hiển thị trong ô thu tiền** (sổ cái. Phí đỗ xe nằm ở `delivery_parking_reports` của 14.7) |
| `delivery_no`【Bổ sung · 2026-10-03】 | **Số giao hàng = `DL-yymmdd-nnnn`. Ngày là ngày xuất hàng dự kiến tại thời điểm tạo dữ liệu giao hàng** (sổ cái B "Ngày của Số giao hàng" · 決定_STEP4回答 Q2. Ví dụ `DL-261020-0021` = xuất ngày 10/20). Bản ghi con của nhân bản là Số giao hàng của cha + số nhánh `-1`〜`-9` (`配送_00` §2-4). Phiếu vận chuyển do ES đánh số (`es_generated`) là Số giao hàng + số hộp 2 chữ số (14.7). **Ngày là ngày xuất hàng dự kiến (ngày picking) tại thời điểm tạo dữ liệu giao hàng. Số đã gán thì không đổi** (sau này đổi ngày cũng không đánh số lại). Ngày thực tế đã xuất được lưu riêng ở "Ngày xuất hàng (thực tế)" `shipped_date` và hiển thị cạnh Số giao hàng trên màn hình 〔trả lời của hong 2026-10-03〕. 【Cần xác nhận】 Phạm vi số thứ tự của `nnnn` (theo từng ngày xuất hàng hay toàn bộ) |
| `coolbag_no`／`coolant_no` | 【Cần xác nhận】 `配送_06` §12-5 (2026/10/01) ghi "không sao chép số vào dữ liệu giao hàng". Có giữ lại cột hay không (bảng ở 14.5) |

---

## 14.7 Các bảng con của dữ liệu giao hàng

| Bảng | Cột | Ghi chú |
|---|---|---|
| `delivery_receive_windows` | `id, delivery_id, from_time, to_time, sort_order, snapshot_at` | Khi chốt tạo sao **toàn bộ dòng** của `site_receive_windows` |
| `delivery_tracking_numbers` | `id, delivery_id, tracking_no, carrier_id, issued_by(carrier_csv｜manual｜api｜es_generated), box_no NULL, box_total NULL, is_relay_leg, status(active｜voided), voided_reason NULL, created_at` | Số phiếu vận chuyển là **duy nhất trong phạm vi công ty vận chuyển**. `es_generated` = ES đánh số cho chuyến mà công ty giao hàng ủy thác đến kho lấy hàng (Số giao hàng + số hộp 2 chữ số. DEV §11) |
| `trouble_types` | `code PK(qty_diff｜wrong_delivery｜damage｜absent｜delay｜other), name, default_action, auto_child, sort_order, status` | Master loại sự cố (6 phân loại) |
| `trouble_app_reasons` | `app_reason_raw PK, type_code NULL` | Bảng ánh xạ lựa chọn của app tài xế → loại |
| `trouble_reports` | `id, delivery_id, type_code NULL, reported_by, note, reported_at, app_reason_raw NULL, resolution(full｜partial｜partial_no_resend｜redelivery｜same_day_revisit｜stop) NULL, resolved_at, resolved_by, resolution_reason` | Báo cáo sự cố |
| `delivery_attachments` | `id, delivery_id, kind, audience(carrier｜customer), file_path, uploaded_by, created_at` | Tài liệu của chuyến giao này (ảnh báo cáo, v.v.). Thêm giá trị biên lai đỗ xe vào `kind` 【Bổ sung · 2026-10-03】 (ví dụ `parking_receipt`. 【Cần xác nhận】 DEV không có danh sách giá trị của `kind`) |
| `delivery_lines` | `id, delivery_id, product_id, planned_qty, delivered_qty, substituted_from_product_id NULL, stock_before NULL, stock_after NULL, disposed_qty NULL, note` | Chi tiết thực tế (theo sản phẩm). **Không có `expiry_date`** (sổ cái: không theo dõi hạn tiêu thụ. Xóa 2026-10-01) |
| `delivery_parking_reports`【Bổ sung · 2026-10-03】 | `id, delivery_id, delivery_leg_id NULL, parking_fee, receipt_attachment_id, reported_by, reported_at, note NULL, corrected_by NULL, corrected_at NULL, correction_reason NULL` | "Báo cáo đỗ xe" bên dưới |

```sql
UNIQUE(delivery_id, product_id)          -- delivery_lines
UNIQUE(carrier_id, tracking_no)          -- delivery_tracking_numbers(ràng buộc hóa câu "duy nhất trong phạm vi công ty vận chuyển") 【Cần xác nhận】 DEV chỉ viết bằng văn bản, không ghi dạng ràng buộc
```

**`delivery_lines` (2026-09-23)**

| Quy tắc | Nội dung |
|---|---|
| Nội dung | Số lượng dự kiến · số lượng giao theo sản phẩm, tồn kho thực tế trước và sau khi trưng bày, số lượng hủy bỏ |
| App tài xế | Ghi `stock_before`／`stock_after`／`disposed_qty` ở báo cáo giao hàng |
| Giao một phần | Bản ghi dữ liệu giao hàng con (nhân bản) có `delivery_lines` **của riêng mình**. **Không ghi đè chi tiết của bản ghi cha** |
| Không nhầm lẫn | Khác với chi tiết giao hàng của hợp đồng `contract_delivery_lines` (14.2) |
| Hàng thay thế | `substituted_from_product_id` = sản phẩm gốc bị thay thế. Thanh toán theo đơn giá của sản phẩm gốc (DEV §13.5) |

**`delivery_attachments` (2026-09-30)** 〔Bảng yêu cầu dòng 164 · Quyết_định_Trả_lời_phản_ánh_một_phần_bảng_yêu_cầu_20260930〕: ảnh báo cáo có thể do **không chỉ tài xế mà cả vận hành** bổ sung (từ chi tiết dữ liệu giao hàng. `uploaded_by` = người dùng vận hành). Có thể bổ sung cả sau khi giao hàng. Ghi vào audit. Modal vuốt trái phải để xem ảnh là chuyện của màn hình.

**`trouble_types`／`trouble_app_reasons` (2026-09-29)**

| Quy tắc | Nội dung |
|---|---|
| `auto_child` | Có tạo bản ghi con tự động đồng thời với việc đăng ký báo cáo hay không (DEV §13.2.1). Giá trị ban đầu: `wrong_delivery` · `absent` · `damage` = true, `qty_diff` · `delay` · `other` = false. Vận hành (logistics) có thể thay đổi |
| Bảng ánh xạ | `trouble_app_reasons` ánh xạ lựa chọn của app sang `type_code`. "Thiếu hàng · giao nhầm" là `NULL` (chưa xác định loại. Vận hành gán sau) |
| `type_code` là NULL | Chưa xác định loại. `auto_duplicate_due_at` **đã bị xóa** (2026-09-29) |
| `resolved_by` | Cũng có thể là hệ thống (tự động giải quyết khi trễ. DEV §13.2.3) |

**Báo cáo đỗ xe【Bổ sung · 2026-10-03】** (sổ cái B "Báo cáo đỗ xe": cần. Tài xế nhập ảnh biên lai + phí đỗ xe. Không hiển thị phí đỗ xe trong ô thu tiền. Căn cứ: ドライバーアプリ_仕様修正点 No.5)

| Quy tắc | Nội dung |
|---|---|
| Đơn vị 1 dòng | 1 lần đỗ xe = 1 dòng. Vì có khi đỗ từ 2 lần trở lên trong 1 chuyến giao nên làm bảng con thay vì cột của `deliveries` 【Cần xác nhận】 Nếu mỗi chuyến giao chỉ cần 1 lần thì có thể làm thành cột của `deliveries` |
| Bắt buộc | **Cả hai**: `parking_fee` (yên · số nguyên từ 0 trở lên) và `receipt_attachment_id` (dòng của `delivery_attachments`. `kind` là biên lai đỗ xe) |
| Người nhập | Tài xế được gán (app tài xế). Vận hành nhập hộ · sửa thì bắt buộc có lý do và ghi vào audit |
| Chặng | `delivery_leg_id` = đỗ xe ở chặng nào. 【Cần xác nhận】 Có cần giữ đến mức chặng hay không |
| Quan hệ với thu tiền | Không trộn với `cash_expected_amount`／`cash_collected_amount`. **Không hiển thị phí đỗ xe ở ô thu tiền · chênh lệch thu tiền mặt (quyết toán thực tế)** |
| Quyết toán | **Tài xế ứng trước → công ty giao hàng ủy thác gộp lại thanh toán cho vận hành (quản trị hệ thống). Không thanh toán cho doanh nghiệp** 〔trả lời của hong 2026-10-03〕 |
| Web doanh nghiệp | **Không hiển thị** 〔trả lời của hong 2026-10-03〕 |
| Hạn nhập · sửa | Nhập được cho đến khi giao hàng. Sửa được trong **7 ngày** sau khi giao hàng (giống các báo cáo khác) 〔trả lời của hong 2026-10-03〕 |

---

## 14.8 Lệnh xuất hàng (ship order)

| Bảng | Cột | Ghi chú |
|---|---|---|
| `ship_order_exports` | `id, warehouse_id, window_start NULL, window_end NULL, scope(window｜catch_up), file_name, row_count, exported_by, exported_at` | Bản ghi xuất CSV thủ công từ màn hình (API đặc tả 19.6). **Không tạo phiên bản · không `locked`** |
| `ship_orders` | `id, delivery_id, warehouse_id, rev, qty, payload_hash, window_start, window_end, send_target_date, export_unit, export_file_ref NULL, sent_at, sent_by, is_zeroed, send_status(pending｜ok｜failed), sent_ok_at NULL, retry_count, error_detail NULL` | Phiên bản của lệnh xuất hàng. Sao `sent_ok_at` của lần đầu có `send_status = ok` vào `deliveries.locked_at` (DEV §10.3) |

```sql
UNIQUE(delivery_id, rev)
```

---

## 14.9 Thanh toán

| Bảng | Cột | Ghi chú |
|---|---|---|
| `invoices` | `id, contract_month_id, billing_month, billing_type(advance｜settlement), payment_due_date, issued_at, billone_ref, status` | 1 hóa đơn = 1 hạn thanh toán |
| `invoice_lines` | `id, invoice_id, line_type(charge｜adjustment), adjustment(refund｜offset) NULL, plan_rate_generation, qty, amount, note` | Điều chỉnh (hoàn tiền · bù trừ) là dòng nằm trong mỗi loại ①trả trước／②quyết toán thực tế |

```sql
UNIQUE(contract_month_id, billing_type, payment_due_date)
```

---

## 14.10 Master cơ sở và tài xế

| Bảng | Cột | Ghi chú |
|---|---|---|
| `corporations` | `id, name, kana, status, billone_customer_ref, note` | Doanh nghiệp |
| `sites` | `id, corporation_id, name, kana, postal_code, address_fields, tel, contact_name, status, effective_from, effective_to` | Cơ sở (nơi giao hàng) |
| `corporate_users`【Phương án】 | `id, corporation_id, role(corp_admin｜site_staff), name, email, status` | Phạm vi nhìn thấy của Web doanh nghiệp (#55). `corp_admin` = quản trị viên doanh nghiệp, `site_staff` = người phụ trách cơ sở |
| `corporate_user_sites`【Phương án】 | `corporate_user_id, site_id` | Chỉ `site_staff` dùng (cơ sở được gán) |
| `drivers` | `id, carrier_id, name, kana, tel, email, login_id, employment_type(self｜partner), area_codes, status, password_hash【Bổ sung · 2026-10-03】, password_updated_at【Bổ sung · 2026-10-03】, failed_login_count【Bổ sung · 2026-10-03】, locked_until NULL【Bổ sung · 2026-10-03】` | Tài xế. **Đăng nhập bằng `login_id` + mật khẩu** (sổ cái B "Đăng nhập của tài xế"). `email` là địa chỉ liên hệ khi cấp tài khoản (nếu bản thân không có email thì dùng email của quản trị viên. `配送_06` §12-3), **không dùng để đăng nhập** 【Sửa theo sổ cái】 (cũ: địa chỉ email + liên kết qua email. Cách viết của tích hợp §12-2 · REQ-DL-142) |
| `driver_password_reset_codes`【Bổ sung · 2026-10-03】 | `id, driver_id, code_hash, issued_at, expires_at, attempt_count, used_at NULL, issued_by NULL` | **Mã xác thực 4 chữ số** để đặt lại mật khẩu (sổ cái). Bảng bên dưới |

```sql
UNIQUE(login_id)                                           -- drivers【Bổ sung · 2026-10-03】
```

**Đăng nhập và đặt lại mật khẩu của tài xế【Bổ sung · 2026-10-03】** (sổ cái B: ID đăng nhập + mật khẩu. Đặt lại bằng mã xác thực 4 chữ số 〈Figma là chuẩn〉. Căn cứ: ドライバーアプリ_仕様修正点 No.1)

| Quy tắc | Nội dung |
|---|---|
| ID đăng nhập | `drivers.login_id`. Duy nhất trên toàn hệ thống. **Hệ thống tự động đánh số (ví dụ `DR00001`). Không nhập tay** 〔trả lời của hong 2026-10-03〕 |
| Mật khẩu | Chỉ lưu hash (`password_hash`). Không lưu bản rõ hay dạng có thể giải mã |
| Mã xác thực | **Số 4 chữ số**. Không lưu bản thân mã mà chỉ lưu hash (`code_hash`). Dùng 1 lần thì ghi `used_at` và vô hiệu |
| Nơi gửi mã | **Gửi email đến địa chỉ email đã đăng ký (`drivers.email`)** 〔trả lời của hong 2026-10-03 · sổ cái〕. Email là nơi nhận mã, không dùng để đăng nhập |
| Hạn hiệu lực · số lần thử | 【Cần xác nhận】 Giá trị của `expires_at` (ví dụ 10 phút) và giới hạn của `attempt_count` (ví dụ 5 lần). 4 chữ số yếu trước vét cạn nên nhất định phải có giới hạn |
| Vận hành làm hộ | Vận hành có thể "làm hộ đặt lại mật khẩu" (`配送_06` §12-3). **Công ty giao hàng ủy thác cũng làm hộ được cho tài xế của chính mình** 〔trả lời của hong 2026-10-03〕. Việc làm hộ ghi người thao tác vào `issued_by` và lưu vào audit |
| Vô hiệu hóa | Khi nghỉ việc · hết hợp đồng thì vô hiệu hóa ngay `status` (`配送_06` §12-3). Tài xế bị vô hiệu không đăng nhập được |

**Ràng buộc**

- `contracts.site_id` · `site_receive_windows.site_id` trỏ tới `sites.id`.
- `deliveries.site_id` là `sites.id` của nơi giao hàng tại thời điểm chốt tạo. Địa chỉ · điều kiện giao hàng dùng snapshot của `deliveries`. Tên cột được thống nhất với `contracts.site_id` · `site_receive_windows.site_id` (2026-09-23).
- `delivery_legs.driver_id` trỏ tới `drivers.id`. Tài xế phải thuộc **công ty vận chuyển của chặng đó** (API đặc tả 15.9).
- Đổi master cơ sở cũng không ảnh hưởng dữ liệu giao hàng đã tạo (DEV §3.4).

---

## 14.11 Yêu cầu thay đổi · override · cần xác nhận

| Bảng | Cột | Ghi chú |
|---|---|---|
| `change_requests` | `id, contract_id, delivery_id NULL, shipping_plan_id NULL, request_type(date_change｜route_change｜qty_change｜cancel), requested_by_type(customer｜sales｜ops), requested_by, requested_at, current_value_json, requested_value_json, reason, status(pending｜proposed｜approved｜rejected｜withdrawn), decided_by NULL, decided_at NULL, decision_reason NULL` | Yêu cầu thay đổi |
| `delivery_overrides` | `id, contract_id, line_no NULL, channel_id NULL, cycle_id NULL, occurrence_key NULL, override_type(absolute_date｜skip), delivery_date NULL, source_request_id NULL, approved_by, approved_at, status(active｜cancelled), cancelled_by NULL, cancelled_at NULL, cancel_reason NULL` | Override đã phê duyệt. 【Cần xác nhận】 bên dưới |
| `site_receive_blocks` | `id, site_id, date_from, date_to, reason, source(request｜ops), created_by, created_at, status(active｜cancelled)` | Ngày không nhận được của cơ sở. 【Cần xác nhận】 bên dưới |
| `review_items` | `id, kind(plan_ungeneratable｜plan_recheck｜date_review｜qty_missing｜qty_mismatch｜ship_order_failed｜ship_order_diff｜tracking_anomaly｜shipment_result_ng｜missing｜assignment_missing｜trouble_open｜trouble_auto_child_pending｜billing_gap｜import_error｜shelf_life_warning｜change_request_due), target_type(shipping_plan｜delivery｜contract_month｜invoice｜import), target_id, business_date, detail_json, status(open｜resolved｜ignored), first_detected_at, last_detected_at, resolved_by NULL, resolved_at NULL, resolution_note NULL` | Bảng thực của mục cần xác nhận (17 loại) |

```sql
UNIQUE(kind, target_type, target_id) WHERE status = 'open'
```

| Ràng buộc · quy tắc | Nội dung |
|---|---|
| Tối đa 1 yêu cầu | Với 1 bản ghi dữ liệu giao hàng, `change_requests` ở `pending` hoặc `proposed` chỉ được có tối đa 1 bản ghi cùng lúc |
| Phi chuẩn hóa | `deliveries.change_request_status` là bản sao của yêu cầu đang mở. Nếu không có yêu cầu đang mở thì NULL |
| Cách áp dụng override | `shipping_plans.override_id` trỏ tới `delivery_overrides.id`. Khi tạo lại, áp dụng các override `active` theo thứ tự `approved_at` cũ trước (DEV §7.2) |
| Không xóa | Override và ngày không nhận được được hủy bằng `status = cancelled`. Không xóa vật lý (DEV §9.1) |
| Mục cần xác nhận chỉ UPSERT | Batch chỉ UPSERT `review_items`. Khi phát hiện lại cùng một vấn đề thì cập nhật `last_detected_at` |

**【Cần xác nhận】 của 14.11 (chỗ lệch với `Đặc_tả_giao_hàng/`)**

| Hạng mục | DEV §14.11 | `Đặc_tả_giao_hàng/` | Nội dung 【Cần xác nhận】 |
|---|---|---|---|
| Giá trị của `override_type` | `absolute_date｜skip` | `配送_04` §8-1: `move` (dời ngày)／`skip`／`fix` (chỉ định riêng của vận hành). Chính DEV cũng viết ở §15.4 "lưu dưới dạng override `fix`" | Có thống nhất giá trị thành `move｜skip｜fix` hay không (`absolute_date` = `move` có thể đọc như vậy) |
| Trạng thái của override | `active｜cancelled` | `配送_04` §8-1: `Đang áp dụng`／`Chưa áp dụng (cần xác nhận)`／`Hết hiệu lực`／`Hủy`, ngoài ra có **snapshot căn cứ** · **thời điểm xác minh cuối** | Có thêm giá trị trạng thái và cột (`last_verified_at` · JSON căn cứ, v.v.) hay không |
| Cách giữ ngày không nhận được | `date_from, date_to, reason, source, status(active｜cancelled)` | `配送_03` §5-5: loại (`date`／`range`／`dow`), lặp lại (`none`／`yearly`), trạng thái (đang yêu cầu／có hiệu lực／hủy), bắt đầu áp dụng | Có thêm cột hay không. Trạng thái "đang yêu cầu" của luồng doanh nghiệp đăng ký → vận hành phê duyệt sẽ giữ ở phía `change_requests` hay giữ ở đây |

Phương án cột trong nguồn gốc (Cài đặt chu kỳ giao hàng §7) (để tham khảo. Là các cột để đáp ứng ý nghĩa của 5-5 · 8-1 · 8-5 trong nội dung chính): `delivery_overrides`: `override_type(move｜skip｜fix)` · `anchor_delivery_date` (ngày giao tại thời điểm phê duyệt = khóa của re-anchor) · `new_delivery_date` (ngày tuyệt đối) · `snapshot_json` (căn cứ khi phê duyệt) · `status(applied｜unapplied｜expired｜cancelled)` · `unapplied_reason` · `last_verified_at`. `site_receive_blocks`: `block_type(date｜range｜dow)` · `dow_mask` · `repeat(none｜yearly)` · `effective_from`. `change_requests`: `request_kind(site_block｜move｜skip)` · `no_preferred_date`. Nghiêng về bên nào trong các bảng ở trên sẽ do phía phát triển quyết định 〔Nguồn gốc: Cài đặt chu kỳ giao hàng §7〕.

---

## 14.12 Master menu · đơn hàng · giá

| Bảng | Cột | Ghi chú |
|---|---|---|
| `menus` | `id, cycle_month, menu_open_date, order_start_date, order_close_date, status(draft｜published), published_at` | Menu (bản chính của các ngày mốc) |
| `order_quantities` | `id, contract_month_id, contract_id, line_no, channel_id, cycle_id, occurrence_key, confirmed_qty, source(menu_order｜ops_manual), confirmed_at, imported_at` | Số lượng đã chốt của đơn hàng (nhận từ cơ chế menu · đơn hàng) |
| `plan_rates` | `id, plan_code, generation, unit_price, effective_from, effective_to, status` | Thế hệ giá gói |
| `plan_course_delivery`【Phương án】 | `plan_code, course(standard｜lite), temp_type(chilled｜frozen), monthly_cap, std_delivery_count` | Số lần giao hàng tiêu chuẩn theo từng nhóm nhiệt độ (28-154). `std_delivery_count` ≥ 1 |
| `plan_subsidy`【Phương án】 | `plan_code, subsidy_per_meal_incl_tax, subsidy_tax_rate_id, base_tax_rate_id` | Số tiền doanh nghiệp chịu (28-147〜149). Mặc định 100 (đã gồm thuế · 1 suất). Thuế suất trỏ tới `tax_rates` (mặc định 8%／10%) |
| `tax_rates`【Phương án】 | `id, rate, label, status` | Master thuế suất (dropdown) |
| `contract_month_plan_snapshot`【Phương án】 | `contract_month_id, plan_code, generation, monthly_cap_chilled, monthly_cap_frozen, std_delivery_chilled, std_delivery_frozen NULL, subsidy_amount_excl_tax, base_amount_excl_tax, subsidy_tax_rate, base_tax_rate, welfare_split bool` | Snapshot khi tạo hợp đồng con. `welfare_split` = "áp dụng phúc lợi" (nếu true thì hóa đơn có 2 dòng) |

Trong DEV, 4 bảng từ `plan_course_delivery` trở xuống là 【Phương án — 2026-09-29, 28-147〜157, chờ phát triển xác nhận】.

```sql
UNIQUE(contract_id, line_no, channel_id, cycle_id, occurrence_key)  -- order_quantities
UNIQUE(plan_code, generation)                                       -- plan_rates
UNIQUE(plan_code, course, temp_type)                                -- plan_course_delivery
UNIQUE(contract_month_id)                                           -- contract_month_plan_snapshot
```

| Quy tắc | Nội dung |
|---|---|
| Sao ngày mốc | `delivery_cycles` sao `menu_open_date`／`order_start_date`／`order_close_date` từ `menus` có cùng `cycle_month` và đặt `marker_source = menu`. Nếu không có `menus` ở `published` thì dùng mốc tạm (DEV §8.3) |
| Chốt số lượng | `order_finalize` lấy `order_quantities.confirmed_qty` theo khóa duy nhất của kế hoạch (DEV §8.2) |
| Thế hệ giá | `contract_months.price_revision_gen` giữ `plan_rates.generation` đã snapshot, và `invoice_lines.plan_rate_generation` dùng giá trị đó (không tra lại master) |
| Tỷ lệ đông lạnh | **Không nắm giữ** (sổ cái B "Tỷ lệ đông lạnh" · 28-155). Số lượng mỗi lần giao theo từng nhóm nhiệt độ là `monthly_cap ÷ std_delivery_count` (làm tròn lên) |

**【Cần xác nhận】 của 14.12**

| Hạng mục | Nội dung |
|---|---|
| `order_id` | DEV §8.2 viết "`deliveries.order_id` = `order_quantities.order_id`", nhưng `order_quantities` không có cột `order_id`. Có thêm cột hay không |
| Nguồn của số lượng | `配送_04` §7-8 · `配送_08` §14-5 lưu nguồn của số lượng đã chốt là `ordered`／`standard`／`ai` (chế độ AI). `source` của DEV chỉ có `menu_order｜ops_manual`. Thống nhất giá trị như thế nào |

**Đơn hàng đăng ký tạm và bộ khởi tạo vật tư【Phương án — chờ phát triển xác nhận · DEV §4.8 (bổ sung 6 · 7)】**

Những thứ được đặt là 【Phương án】 ở DEV §4.8 nhưng chưa được đưa vào DEV §14. Quy tắc ở `配送_04` §7-5 · §7-9.

| Bảng | Cột | Ghi chú |
|---|---|---|
| `order_quantities` (thêm cột) | `contract_month_id NULL, cycle_month, occurrence_no, product_id, source(menu_order｜ops_manual｜trial_auto), customer_editable bool, cancelled_at NULL` | `contract_month_id` là NULL trong thời gian đăng ký tạm (hợp đồng con chưa có). `occurrence_no` = lần thứ mấy của chu kỳ đó (1〜số lần giao hàng. Là số trước khi có `occurrence_key`). `trial_auto` = tự động tạo cho dùng thử, `customer_editable = false`. `cancelled_at` khi từ chối · rút lại |
| `material_orders` | `id, contract_id, site_id, kind(initial_set｜regular), delivery_date, warehouse_id, charge(free｜paid), status, cancelled_at NULL` | Đơn hàng vật tư (nếu giỏ hàng vật tư chưa có bảng riêng). `delivery_date` của bộ khởi tạo là NULL cho đến khi vận hành nhập ở tab "Hợp đồng con". Khi tạo dữ liệu giao hàng ở đăng ký chính thức thì nhập `delivery_id` (【Cần xác nhận】 nội dung DEV dùng `material_orders.delivery_id` nhưng danh sách cột không có `delivery_id`) |
| `material_initial_sets` | `material_product_id, plan_code, qty` | Số lượng bộ khởi tạo theo từng gói (bổ sung 7 · 28-129). `qty = 0`／không có dòng = không nằm trong bộ khởi tạo |

```sql
UNIQUE(material_product_id, plan_code)   -- material_initial_sets
```

- Khi `plan_rollout`／`delivery_materialize` tạo kế hoạch · dữ liệu giao hàng ở đăng ký chính thức, liên kết `order_quantities` (`cycle_month` · phân loại giao hàng · `occurrence_no`) với `occurrence_key` tương ứng và nhập `contract_month_id`.
- Ngày chốt đặt hàng dùng thử (B7 · D7) được suy ra từ ngày của khung trong `delivery_cycles`. Không thêm bảng lịch.
- Dữ liệu giao hàng của bộ khởi tạo vật tư **được tạo ở đăng ký chính thức** (bổ sung 7 · 28-130. Giống với việc không tạo dữ liệu giao hàng trong thời gian đăng ký tạm #52).

---

## 14.13 Snapshot theo tháng: tồn kho · báo cáo kiểm kê · quyết toán thực tế (bổ sung 7 · 2026-09-29)

Quyết định: phần liên quan đến đăng ký 28-121 · 28-125. Màn hình của vận hành (quản lý tồn kho／quyết toán thực tế／chốt thanh toán) **xem được cả tháng trước**. Tháng đã chốt thì **chỉ đọc snapshot** và không tính lại từ dữ liệu hiện tại.

| Hạng mục | Quy tắc |
|---|---|
| Kỳ | Giữ theo `cycle_month` của hợp đồng con. Kỳ của tồn kho = ngày 21 tháng trước〜ngày 20 tháng hiện tại |
| Điều chỉnh tồn kho | Vận hành nhập trực tiếp. **Không cần phê duyệt**, tại thời điểm lưu sẽ **có hiệu lực ngay** lên tồn kho tính toán (`calc_qty`). Chỉ nhập được cho tháng mà quyết toán thực tế (`settlement_snapshots`) **chưa chốt**. Bắt buộc có lý do. Có thể nhập gộp cùng một lý do cho nhiều cơ sở |
| Sau khi chốt | Không sửa điều chỉnh của tháng đó. Lỗi phát hiện sau được đưa vào `settlement` của **tháng sau** bằng dòng `invoice_lines.line_type = adjustment` (DEV §13.7) |
| Báo cáo kiểm kê | 1 bản ghi cho cơ sở × tháng. Số lượng theo sản phẩm. Dù đến ngày 25 chưa có báo cáo vẫn chốt được, nhưng sẽ phát sinh phí hành chính (quy định phía thanh toán) |
| Chốt quyết toán thực tế | Khi chốt, ghi `monthly_stock_snapshots` (theo sản phẩm) và `settlement_snapshots` (tổng) trong **1 transaction**. `prev_counted_qty` của tháng sau = `counted_qty` của snapshot tháng này |
| Hủy chốt | Chỉ khi hợp đồng con đó chưa có hóa đơn. Ghi `unconfirmed_at` vào snapshot cũ (không xóa). Chốt lại thì thành snapshot mới. Màn hình đọc `unconfirmed_at IS NULL` |

| Bảng | Cột | Ghi chú |
|---|---|---|
| `stock_counts` | `id, site_id, contract_month_id, cycle_month, period_from, period_to, status(not_filed｜filed), filed_at NULL, filed_by NULL, filed_via(driver_app｜corp_web) NULL` | Báo cáo kiểm kê (tên màn hình cũng là "Báo cáo kiểm kê". Không dùng "Khai báo kiểm tra tồn kho" 〔trả lời của hong 2026-10-03〕) |
| `stock_count_lines` | `id, stock_count_id, product_id, counted_qty` | Số lượng theo sản phẩm của báo cáo kiểm kê |
| `stock_adjustments` | `id, site_id, cycle_month, product_id, delta_qty, reason, bulk_id NULL, created_by, created_at, cancelled_at NULL` | Điều chỉnh tồn kho (vận hành · không phê duyệt · có hiệu lực ngay). `bulk_id` = nhóm khi nhập gộp cho nhiều cơ sở |
| `monthly_stock_snapshots` | `id, contract_month_id, site_id, cycle_month, product_id, prev_counted_qty, delivered_qty, sold_qty, disposed_qty, adjusted_qty, calc_qty, counted_qty NULL, loss_qty, unit_price, loss_amount, snapshot_at, unconfirmed_at NULL` | Ghi khi chốt quyết toán thực tế |
| `settlement_snapshots` | `id, contract_month_id, cycle_month, sales_amount, loss_amount, deductible_amount, over_amount, price_adjust_diff, admin_fee, settlement_amount, cash_expected_amount, cash_collected_amount, cash_diff_amount, confirmed_at, confirmed_by, unconfirmed_at NULL` | Không giữ số tiền hỗ trợ bữa ăn (số tiền doanh nghiệp chịu đã nằm trong giá của gói · 28-134). `cash_*` = chỉ phần chọn thanh toán tiền mặt trên app (28-135). **Không đưa phí đỗ xe vào** (sổ cái) |

```sql
UNIQUE(site_id, cycle_month)                                           -- stock_counts
UNIQUE(stock_count_id, product_id)                                     -- stock_count_lines
UNIQUE(contract_month_id, product_id) WHERE unconfirmed_at IS NULL     -- monthly_stock_snapshots
UNIQUE(contract_month_id) WHERE unconfirmed_at IS NULL                 -- settlement_snapshots
```

- `delivered_qty` lấy từ `delivery_lines.delivered_qty` của dữ liệu giao hàng trong kỳ (14.7). `sold_qty` lấy từ dữ liệu bán hàng của app (ngoài phạm vi tài liệu này. Chỉ nhận tổng theo sản phẩm).
- Không còn chốt theo từng doanh nghiệp (chốt doanh nghiệp · 28-123). Chốt chỉ theo đơn vị hợp đồng con.
- 【Cần xác nhận】 UNIQUE của `monthly_stock_snapshots` là `(contract_month_id, product_id)` và không chứa `site_id`. Nếu tiền đề là hợp đồng con = 1 cơ sở thì không vấn đề, nhưng cần xác nhận.

---

## 14.14 Bảng · cột được dùng trong `Đặc_tả_giao_hàng/` nhưng không có trong DEV §14 【Cần xác nhận】

Xuất hiện trong nội dung chính của `配送_09` §16 và các chỗ khác nhưng không có định nghĩa cột trong DEV §14 (= tài liệu này). Cần đưa vào mô hình dữ liệu hay không thì phải xác nhận với phía phát triển.

| Tên | Ghi ở đâu | Nội dung |
|---|---|---|
| `site_attachments` | `配送_09` §16-4 | `id, owner_type(site｜warehouse｜relay), owner_id, kind(route_map｜manual｜parking｜other), audience(carrier｜customer), file_path, uploaded_by, updated_at`. Tài liệu của địa điểm (sơ đồ lối vận chuyển vào · hướng dẫn · hướng dẫn bãi đỗ xe). Không sao chép vào dữ liệu giao hàng mà tham chiếu |
| `delivery_notifications` | `配送_09` §16-5 | `id, delivery_id, type(assignment_missing_3d｜assignment_missing_1d｜confirmed_mail), sent_at, to`. DEV coi thông báo là ngoài phạm vi (DEV §1) |
| `batch_errors` | `配送_09` §17-1 | Bản ghi lỗi của batch (có phải cùng thứ với log ở API đặc tả 16.14 không 【Cần xác nhận】) |
| `carrier_coolers` | `配送_06` §12-5 | Sổ cho mượn túi giữ lạnh · chất giữ lạnh (bảng ở 14.5) |
| Lịch sử thay đổi hàng loạt tuyến giao hàng | `配送_03` §5-10 (tối 2026/10/01) | Số · ngày giờ thực thi · phương pháp (lọc／CSV) · bắt đầu áp dụng · số cơ sở · nội dung · đơn vị ủy thác đã thông báo của mỗi lần thay đổi hàng loạt |
| Có liên kết THOMAS hay không · mã kho của `warehouses` | `配送_01` §3-1 | Bảng ở 14.5 |
| Mẫu URL theo dõi · ngày không giao ủy thác được của `carriers` | `配送_01` §3-3 | Bảng ở 14.5 |
| `contracts.receive_off_holiday` · `ai_qty_mode` · `delivery_note` | `配送_03` §5-1 | 【Cần xác nhận】 của 14.2 |
| Nguồn của số lượng đã chốt (`ordered`／`standard`／`ai`) | `配送_04` §7-8 · `配送_08` §14-5 | 【Cần xác nhận】 của 14.12 |
| Trạng thái override · snapshot căn cứ · thời điểm xác minh cuối | `配送_04` §8-1 | 【Cần xác nhận】 của 14.11 |
| Loại · lặp lại · trạng thái của ngày không nhận được | `配送_03` §5-5 | 【Cần xác nhận】 của 14.11 |
| Cài đặt hàng thay thế (3 mẫu: thay thế／bồi thường／chỉ loại bỏ) | `配送_07` §13-6 · sổ cái B "Xử lý hàng thay thế" | Sửa đồng thời chi tiết của đơn hàng và dữ liệu giao hàng, nhập `substituted_from_product_id`. Bảng của chính cài đặt thuộc phạm vi đặc tả quản lý menu 【Cần xác nhận】 định nghĩa ở đâu |

---

## 【Cần xác nhận】 về cách dịch

| DEV (tiếng Việt · tiếng Anh) | Cách dịch này | Chỗ phân vân |
|---|---|---|
| hub | Điểm trung chuyển | Theo `Đặc_tả_giao_hàng/`. Cùng thứ với `warehouse_type = relay` |
| proxy (ops đăng ký thay) | Đăng ký hộ | — |
| ops logistics／ops CS | Vận hành (logistics)／Vận hành (CS) | — |
| partner／đối tác | Công ty giao hàng ủy thác | Có chương viết là "đơn vị ủy thác" "bên ủy thác" |
| bộ vật tư ban đầu | Bộ khởi tạo vật tư | — |
| ngày chốt đặt hàng (dùng thử) | Ngày chốt đặt hàng (dùng thử) | Theo `配送_04` §7-9 |
| quyết toán thực tế | Quyết toán thực tế | — |
| báo cáo kiểm kê | Báo cáo kiểm kê | Thống nhất "Báo cáo kiểm kê" (không dùng "Khai báo kiểm tra tồn kho") 〔trả lời của hong 2026-10-03〕 |
| điều chỉnh tồn kho | Điều chỉnh tồn kho | — |
| phí hành chính | Phí hành chính | Tên chính thức 〔trả lời của hong 2026-10-03〕 |
| phần doanh nghiệp chịu | Số tiền doanh nghiệp chịu | — |
| gửi trả | Gửi trả | — |
| memo nội bộ | Ghi chú vận hành | Theo `配送_09` |
| parking receipt (biên lai đỗ xe) | Biên lai đỗ xe | Giá trị tiếng Anh của `kind` là phương án (`parking_receipt`) |
