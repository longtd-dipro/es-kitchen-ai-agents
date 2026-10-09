> **凍結（原典）2026-10-03：以降は更新しない。** 配送の仕様の正は `docs/01_仕様/10_配送/配送仕様/`、いま有効な決定は `docs/決定台帳.md`。データモデルは 配送仕様/配送_11、API・バッチは 配送_12、業務ルールは 配送_00〜10 に日本語で移した。

# DEV Functional Specification — Chu kỳ giao hàng / Picking / Xuất kho / Giao hàng

（配送サイクル・出荷・ピッキング・配送　開発向け機能仕様書）

**Bản**: v2.3 — 2026-09-23, bổ sung quyết định trouble auto-child ngày 2026-09-24, **sửa lại xử lý trouble ngày 2026-09-29**, **bổ sung vấn đề tồn đọng + chặng 1 do đối tác ngày 2026-09-29**, **bổ sung tiếp nhận hồ sơ (kho, số lần giao, order, bộ vật tư ban đầu, dùng thử) ngày 2026-09-29 (追補6)**, **bộ vật tư ban đầu + snapshot tháng cho tồn kho / kiểm kê / quyết toán ngày 2026-09-29 (追補7)**, **ngày giao bộ vật tư ban đầu + số lần giao theo nhiệt độ / plan master ngày 2026-09-30 (28-145, 28-147〜157)**, **phản hồi bảng yêu cầu Phase2 ngày 2026-09-30 (carrier master, hỏi giao hàng / báo giá, driver chưa assign D-3 / D-1, memo nội bộ của delivery)**　**Phạm vi**: ES Station / ES Kitchen Phase 2

Tài liệu này là **nguồn chuẩn duy nhất cho data model** (bảng, cột, ràng buộc) của mảng chu kỳ / picking / xuất kho / giao hàng. Nếu có tài liệu nào khác mô tả bảng hoặc cột của mảng này mà lệch với tài liệu này, **tài liệu này đúng** — đừng tự suy luận, báo BrSE.

Các quyết định nghiệp vụ nằm ở bộ văn bản quyết định do BrSE quản lý (bản tiếng Nhật, không phát cho dev). Tài liệu này đã phản ánh tới bản **v2.3 (2026-09-23)** và quyết định bổ sung **trouble auto-child (2026-09-24)**, **sửa lại xử lý trouble (2026-09-29)** — auto-child tạo ngay khi báo cáo theo loại trouble, bỏ SLA và batch `trouble_auto_duplicate`; và **bổ sung 2026-09-29 (#34–#51)** cùng **#52–#53** (bắt đầu sinh plan/delivery khi chốt điểm giao; nút xuất/nhập CSV THOMAS): phạm vi site đối tác, cảnh báo hạn dùng ngắn, material, hạn xử lý change request, hàng thay thế, cước khi dừng, gửi trả, nhãn hiển thị cho khách, driver chưa assign, THOMAS / Yamato, chặng 1 do đối tác (đánh số tracking, assign theo regime của leg, giờ nhận theo leg); và **phản hồi bảng yêu cầu Phase2 (2026-09-30)**: carrier master (khu vực theo tỉnh, thứ nhận giao, bảng giá + phụ phí vùng, số túi giữ lạnh / đá giữ lạnh), hỏi giao hàng + trả lời báo giá của đối tác, driver chưa assign (D-3 và D-1), memo nội bộ và ảnh do ops thêm vào delivery, đếm material theo loại chuyến của site, tháng bắt đầu của đăng ký mới. **Cần tra nguồn của một quy tắc thì hỏi BrSE**, đừng dựa vào bản spec cũ đang có trong máy.

Tài liệu này định nghĩa các quy tắc chức năng mà backend, database, API và batch phải thực hiện.

**Ngoài phạm vi** (2026-09-23): UI/UX; migration; test case; quy trình quản lý dự án; và **toàn bộ spec thông báo / notification** — danh sách thông báo, trigger, người nhận, kênh gửi và nội dung được định nghĩa ở tài liệu riêng của chức năng お知らせ配信, không nằm ở đây.

---

## 1. Phạm vi và nguyên tắc

Hệ thống quản lý:

1. Master kho, hub, carrier, product và driver.
2. Chu kỳ giao hàng 28 slot.
3. Quy tắc giao hàng của hợp đồng.
4. Sinh kế hoạch giao hàng.
5. Chuyển kế hoạch thành delivery thực tế.
6. Chốt quantity.
7. Picking và chỉ thị xuất kho.
8. Tracking, assignment và thực hiện delivery.
9. Trouble, giao một phần, giao lại và thay thế hàng.
10. Dữ liệu đầu vào cho billing.

**Không** quản lý: gửi thông báo cho khách hàng / driver / công ty vận chuyển (xem "Ngoài phạm vi" ở trên).

Các mảng sau **nằm ngoài tài liệu này**. Mỗi mảng có tài liệu riêng — **cần thì yêu cầu BrSE gửi**, đừng chờ nó xuất hiện trong tài liệu này:

- Pháp nhân / điểm giao / hợp đồng / hợp đồng con — danh sách trường của màn hình
- Màn hình duyệt đơn đăng ký của ops
- Form đăng ký của doanh nghiệp
- Master thiết bị / option / giảm giá
- Phát hành hoá đơn và kết nối Bill One
- Menu / order / giỏ hàng
- Tồn kho / đặt hàng / nhập hàng
- Thông báo (お知らせ配信) và khảo sát

Tài liệu này **có chạm** tới hợp đồng, order và billing, nhưng chỉ ở mức **đầu vào / đầu ra** của luồng giao hàng: đọc cấu hình giao hàng của hợp đồng (§4), đọc confirmed quantity từ order (§8.2), và bàn giao dữ liệu cho billing (§13.7). Ba chỗ đó là **ranh giới**: bên trong ranh giới thì theo tài liệu này, bên ngoài thì hỏi BrSE.

Nguyên tắc:

- Tách `shipping plan` và `delivery` thành hai lớp dữ liệu.
- Tách `plan lifecycle` và `delivery status` thành hai state machine.
- Chỉ lớp plan được tính và tính lại ngày.
- Delivery đã materialize không tự động tính lại.
- Không hard-code thứ Bảy, Chủ nhật hoặc ngày lễ là ngày nghỉ.
- Mọi phép tính ngày sử dụng UTC cố định.
- Mọi mutation API phải kiểm tra lifecycle, status, quyền và business milestone.
- Mọi thay đổi dữ liệu đã xác nhận phải có audit log.

---

## 2. Khái niệm chính

### 2.1. Delivery cycle

- Một cycle gồm 28 slot: `A1..A7`, `B1..B7`, `C1..C7`, `D1..D7`.
- `A1` luôn là thứ Hai.
- A/B/C/D là tuần; 1–7 là thứ trong tuần.
- Pause day không tiêu thụ slot.
- Hệ thống chỉ có một delivery-cycle setting dùng chung.

### 2.2. Cycle month

```text
cycle_month = month(b7_date)
```

- `B7` là slot thứ 14.
- Nếu cycle chia đều 14 ngày ở hai tháng, cycle thuộc tháng trước.
- Không tạo nhánh ngoại lệ riêng cho trường hợp 14–14.

### 2.3. Shipping plan và delivery

Shipping plan giữ ngày, slot, line, channel, warehouse, carrier, lead time, estimated quantity và lifecycle.

Delivery được materialize từ plan và giữ snapshot destination/route, quantity chính thức, delivery status, assignment, tracking, actual, trouble và billing-related data.

### 2.4. Ba trục delivery

| Trục | Giá trị | Ý nghĩa |
|---|---|---|
| `delivery_regime` | `self`, `partner_driver`, `parcel_carrier` | Người thực hiện vận chuyển |
| `service_form` | `es_delivery`, `cool`, `material` | Quy trình nghiệp vụ của chuyến |
| relay | Không lưu enum | Suy ra từ số leg của `delivery_legs` (≥ 2 leg là có trung chuyển) |

`delivery_regime` của final leg quyết định presumed completion và missing detection.

---

## 3. Master data rules

### 3.1. Warehouse

Warehouse gồm `picking`, `relay` và **`return`** (điểm nhận hàng gửi trả, ví dụ trụ sở — §9.5, 2026-09-29), giữ tên, tên in phiếu, mã kho, mã chi nhánh, địa chỉ, trạng thái, picking threshold và số ngày chuẩn bị ship order.

Giá trị mặc định (2026-09-23):

| Cột | Mặc định | Ý nghĩa |
|---|---|---|
| `pick_count_threshold` | **300** | Số chuyến/ngày của một kho. Vượt thì chỉ cảnh báo, không chặn. Material không tính vào đây (§10.1) |
| `ship_order_lead_days` | **3** | Ship order cho 2 tuần được xuất trước ngày bắt đầu bao nhiêu ngày (thứ Sáu). Đây là "khi nào gửi", không phải mốc `locked` (§9.2) |

Warehouse không giữ lead time giao hàng. Lead time nằm ở delivery channel của contract.

### 3.2. Carrier

Carrier giữ loại self/outsourced, temperature groups, khu vực, trạng thái và capability. Mismatch nhiệt độ/khu vực tạo warning nhưng không tự động block cấu hình.

Warning này (2026-09-23):

- **Hiện ngay tại màn hình cấu hình** delivery channel / route của hợp đồng, ở dòng carrier bị lệch. Vẫn lưu được.
- **Không lưu thành bản ghi riêng** và **không tạo `review_items`** — đây là cảnh báo lúc nhập, không phải việc tồn đọng.
- Tính lại mỗi lần mở màn hình bằng cách so `carriers.temp_types` / `carriers.areas` với `temp_type` của channel và tỉnh/thành của site. Không có job nào quét lại toàn bộ.

**Bổ sung 2026-09-30** 〔要件シート 行28・39・41・44・53・57・78・決定_要件シート一部反映_回答_20260930〕:

- **Khu vực phục vụ theo tỉnh/thành**: lưu ở bảng con `carrier_areas(carrier_id, prefecture_code)` (đổi 2026-09-30; cũ: `carriers.areas` = 4 vùng Kanto / Chubu / Kansai / Kyushu). Warning ở trên so tỉnh/thành của site với `carrier_areas`.
- **Thứ nhận giao**: `carriers.service_weekdays`. **Không** làm tìm kiếm theo tổ hợp thứ (kiểu 「第1第3○曜日」) và **không** làm bản đồ toàn quốc.
- **Bảng giá** `carrier_rates`: tỉnh/thành × `pay_amount` (giá trả cho carrier) + `regional_surcharge` (phụ phí vùng). **Nhập bằng CSV** (theo §19.5); dữ liệu cũ (sheet / Notion) cũng chuyển thành CSV để nhập. `regional_surcharge` do **ops nhập tay**, hệ thống **không tự tính**. Đơn vị của `pay_amount` (mỗi chuyến hay theo tháng) và có chia giá nhỏ hơn cấp tỉnh hay không: **要確認** (chưa quyết định, đừng tự suy luận).
- **Số túi giữ lạnh / đá giữ lạnh**: `carriers.coolbag_no`, `carriers.coolant_no`. `deliveries.coolbag_no` / `coolant_no` giữ nguyên; có tự copy từ carrier sang delivery hay không: **要確認**.
- **Hỏi giao hàng (配送問い合わせ)**: tìm theo địa chỉ (tỉnh/thành, quận/thành phố, mã bưu điện) + nhiệt độ, dùng được cả khi đang thương lượng (chưa có `sites`). Trả về carrier có `carrier_areas` chứa tỉnh/thành đó, kèm `service_weekdays`, `temp_types` và `carrier_rates` (giá, phụ phí vùng) làm **giá tham khảo**. Không tự chọn carrier / hub. Khi gửi yêu cầu báo giá: tạo `delivery_inquiries` và mỗi carrier được gửi một dòng `carrier_quote_responses` (§14.5).
- **Trả lời báo giá của đối tác**: chỉ gồm `result(available|unavailable)`, `monthly_fee`, file đính kèm (`carrier_quote_attachments`), `comment`, hub (`relay_warehouse_id`). **Không có chat** (không có bảng tin nhắn). Thời hạn hiệu lực và trả lời lại (一次回答 → 再回答): **要確認**.
- Phụ phí vùng được tính tiền như **option của hợp đồng con** (オプションマスタ 地域配送料) — master option nằm ngoài tài liệu này (§1).

Khi cấu hình route của hợp đồng (2026-09-29): carrier của **mọi leg (leg 1 và leg 2)** chọn từ **toàn bộ** `carriers` đang active (hãng vận chuyển, đối tác, tự vận hành); hub chọn từ **toàn bộ** `warehouses` loại `relay` (có thể đăng ký cả cơ sở của công ty đối tác làm hub).

### 3.3. Product

- Product có temperature type, pack size, shelf-life và unit price.
- Product và warehouse là quan hệ nhiều-nhiều.
- Khi đổi warehouse, product phải được warehouse mới hỗ trợ.
- **Cảnh báo hạn dùng ngắn** (2026-09-29): delivery có sản phẩm mà `delivery_date − picking_date > products.shelf_life_days − shelf_life_safety_days` → UPSERT review `shelf_life_warning` (target = delivery hoặc plan). Kiểm tra khi sinh / tính lại plan, đổi warehouse và duplicate. Không tự chia; ops quyết định.

### 3.6. Cấu hình vận hành (2026-09-29)

| Key | Mặc định | Dùng ở |
|---|---|---|
| `shelf_life_safety_days` | 2 | §3.3 cảnh báo hạn dùng ngắn |
| `change_request_warn_days` | 3 | §9.1.1 hạn xử lý change request |

(`trouble_auto_duplicate_after_minutes` đã bỏ 2026-09-29.)

### 3.4. Receive windows

```text
site_receive_windows(site_id, from_time, to_time, sort_order)
```

- Một site có nhiều receive windows.
- Receive windows không tham gia tính delivery date.
- Khi tạo delivery, copy toàn bộ danh sách sang `delivery_receive_windows`.
- Delivery đã tạo không bị thay đổi khi site master thay đổi.

### 3.5. Holiday và non-picking

- Holiday master giữ ngày và tên ngày lễ.
- Delivery holiday có thể bật/tắt theo ngày.
- Warehouse giữ non-picking theo slot và theo date/range.
- `business_override` cho phép một ngày hoạt động dù slot thường bị cấm.

---

## 4. Contract delivery rules

### 4.1. Delivery mode

| Mode | Cách xác định delivery date |
|---|---|
| `cycle` | Ngày của slot A1–D7 |
| `special` | Ngày N từ 1–28 hoặc ngày cuối tháng |
| `on_demand` | Tạo theo material order |

`on_demand` chỉ áp dụng cho material và không tạo plan `draft`.

**Material (on_demand) — 2026-09-29:**

- Tạo delivery **mỗi lần giỏ material được xác nhận**. Nếu đã có delivery material cùng `site_id` + cùng `delivery_date` mà **chưa có ship order `ok`** thì **thêm dòng vào delivery đó**, không tạo mới.
- Lead time có cùng nghĩa với các mode khác: `picking_date = delivery_date − lead_time`.
- `delivery_date` = **ngày giao hợp lệ sớm nhất từ ngày sau ngày đặt**, sao cho giữ được lead time (áp dụng delivery holiday, `ng_weekdays`, receive block, non-picking như bình thường, §6; **không** áp dụng cycle pause vì material ngoài cycle).
- Ship order được gửi bằng daily catch-up hiện có (§10.4).
- **Đếm số chuyến material** (2026-09-30) 〔要件シート 行124・決定_要件シート一部反映_回答_20260930〕: danh sách delivery material hiển thị số chuyến theo `shipped_date`, chia theo `service_form` (`cool` / `es_delivery`) của channel thực phẩm (lạnh / đông) của **cùng site**. Suy ra lúc query, **không** thêm cột vào delivery material (`service_form` của nó vẫn là `material`). Site có các channel thực phẩm khác `service_form` nhau thì đếm thế nào: **要確認**.

### 4.2. Delivery channel

Một channel giữ temperature/material type, picking warehouse, lead time 0–7, service form, default delivery regime, share percentage và effective date.

Carrier và hub **không** nằm ở channel mà nằm ở `contract_routes` (§4.6).

Một contract có thể tạo nhiều plan/delivery trong cùng ngày nếu có nhiều line hoặc channel.

### 4.3. Parent contract và contract month

- Parent contract giữ default configuration.
- Contract month giữ snapshot thực tế của cycle month.
- Nếu contract month đã tồn tại, plan dùng snapshot của contract month.
- Chỉ khi contract month chưa tồn tại mới dùng parent contract.
- Thay parent contract không ghi đè contract month đã tạo.

### 4.4. Quantity allocation

```text
base = floor(total_quantity / delivery_count)
remainder = total_quantity % delivery_count
```

- Mỗi lần nhận `base`.
- Phần dư được cộng từ lần giao đầu tiên.
- Allocation thực hiện riêng theo từng channel.
- Kết quả ghi vào `shipping_plans.estimated_qty`.

### 4.5. Ràng buộc nhận hàng

Contract/site giữ `ng_weekdays`, holiday flag, `holiday_shift`, receive blocks và delivery condition.

Receive block và `ng_weekdays` tham gia tính ngày. Receive windows và delivery condition chỉ được snapshot vào delivery.

### 4.6. Route của hợp đồng

Mỗi delivery channel có một route, mô tả bằng các **leg** nối tiếp nhau từ kho picking tới điểm giao.

| | Không trung chuyển | Có trung chuyển |
|---|---|---|
| Số leg | 1 | 2 (Phase 2 tối đa 2) |
| Leg 1 | kho → điểm giao | kho → hub |
| Leg 2 | — | hub → điểm giao |

- Leg 1 luôn xuất phát từ `channel.warehouse_id`.
- Leg cuối có `is_final_leg = true` và `to_type = destination`.
- Mỗi leg giữ `carrier_id`, `delivery_regime` và `assign_scope` của riêng nó.
- **`delivery_regime` của leg cuối** quyết định presumed completion và missing detection (§12.3).
- Trung chuyển có hay không **suy ra từ số leg**, không lưu enum riêng (§2.4).
- Route được version theo chính channel: đổi carrier hoặc hub tạo channel mới với `effective_from` mới, kèm bộ route mới.
- Contract month snapshot cả channel lẫn route (`contract_month_routes`), và plan/delivery dùng bản snapshot đó khi contract month đã tồn tại (§4.3).


### 4.7. Hợp đồng nào được sinh plan / delivery / contract month (2026-09-29, #52)

| Trạng thái hợp đồng (`contracts.status`) | Plan | Delivery | Contract month |
|---|---|---|---|
| `provisional` — đăng ký tạm (受付「設定中」) | **Không sinh** | **Không sinh** | **Không sinh** |
| `active` — đã chốt điểm giao (本登録), gồm cả `change_scheduled` / `cancel_scheduled` | Sinh | Sinh | Sinh |
| `suspended` (休止中), khoảng trống sau khi hết thời gian dùng thử (28-35), `ended` | Không sinh | Không sinh | Không sinh |

- Lý do: khi còn đăng ký tạm, route (kho, carrier, lead time, slot) chưa nhập hoặc còn thay đổi. Sinh rồi xoá sẽ làm plan tạm hiện trên lịch của doanh nghiệp, web đối tác và ngưỡng số đơn.
- **Chốt theo từng điểm giao.** Khi ops chốt (本登録) điểm giao, ngay sau thao tác đó hệ thống chạy cho **riêng các hợp đồng của điểm giao đó**: `contract_monthly_generate` → `plan_rollout` (từ cycle tháng bắt đầu tới hết range) → `delivery_materialize` (chỉ cycle đã qua `order_start_date`). Batch hằng ngày vẫn nhặt được vì mọi bước idempotent.
- Nếu thời điểm chốt đã qua `order_close_date` của cycle tháng bắt đầu, cycle tháng bắt đầu được **tự dời sang cycle kế tiếp trước khi sinh** (quyết định 28-27).
- **Tháng bắt đầu của đăng ký mới** (2026-09-30) 〔要件シート 行159・決定_要件シート一部反映_回答_20260930〕: cũng theo hạn chốt order như thay đổi / tạm dừng / huỷ — đăng ký **trước** `order_close_date` đang mở → bắt đầu **tháng sau**; đăng ký **sau** hạn đó → bắt đầu **tháng sau nữa**. Quy tắc dời khi 本登録 ở dòng trên giữ nguyên.
- Tái khởi động (再開) được chốt → `active` từ cycle tái khởi động và sinh plan từ cycle đó.

---

### 4.8. Order và bộ vật tư ban đầu lúc đăng ký tạm (2026-09-29, 追補6)

Quyết định: 申請まわり 28-93〜28-109 (bản tiếng Nhật). §4.7 (#52) **giữ nguyên** cho contract month / plan / delivery. Phần dưới là **ngoại lệ cho order và bộ vật tư ban đầu**.

**Quy tắc nghiệp vụ**

| Mục | Quy tắc |
|---|---|
| Thời điểm nhập kho + số lần giao | Ops nhập **kho picking** và **số lần giao** (theo từng channel) ở bước 「申込内容確認」, **trước khi đăng ký tạm**. Carrier leg 1/2, hub, lead time, pattern, slot nhập ở tab 「子契約｜契約」 trước khi 本登録 (guard §15.16 giữ nguyên). Carrier leg 2 bắt buộc khi có hub. Pattern mặc định `cycle`. Slot chọn đúng bằng số lần giao, không chọn được slot rơi vào `ng_weekdays`. |
| Order lúc đăng ký tạm | Khi hoàn tất 「申込内容確認」 (contract `provisional`): **hợp đồng chính thức** — doanh nghiệp nhập order được từ kỳ order của cycle tháng bắt đầu nếu có account (account điểm giao, **hoặc account doanh nghiệp đã có sẵn**); không có account nào → chốt theo số lượng chuẩn tại `order_close_date` như hiện tại. Nếu hoàn tất sau `order_close_date` của cycle tháng bắt đầu → dời sang cycle kế tiếp (28-27). |
| Order dùng thử | **Tự sinh** lúc đăng ký tạm, kể cả khi chưa có account. Số lượng = `monthly_cap` của plan **chia đều cho toàn bộ sản phẩm**; chia theo số lần giao như §4.4 (chênh lệch giữa các lần tối đa 1, phần dư cộng từ lần đầu). **Doanh nghiệp không sửa được**; ops sửa được **cả số lượng lẫn sản phẩm** tới **ngày chốt đặt hàng (発注締め日)**. |
| Ngày chốt đặt hàng (dùng thử) | **B7 và D7** (ngày thứ 7 của tuần B và tuần D) của mỗi cycle (STEP5 T1, 2026-10-01: thay B5/D5). Kịp B7 → giao từ **cycle kế tiếp** (cả nửa đầu và nửa sau); kịp D7 → giao từ **nửa sau (tuần C) của cycle kế tiếp**; nếu số lần giao từ 2 trở lên và kịp D7 → từ **tuần A của cycle sau nữa**. Cycle bắt đầu từ nửa sau vẫn tính là tháng dùng thử thứ 1; slot của lần giao đầu (nửa sau) do ops chọn ở 「申込内容確認」, từ cycle sau quay lại slot của hợp đồng. Qua mốc → mốc kế tiếp. Không dùng `order_close_date` cho dùng thử. |
| Bộ vật tư ban đầu | Tự sinh lúc đăng ký tạm (cả chính thức và dùng thử). **Ngày giao do ops nhập ở tab 「子契約」 của 「詳細情報設定」, ngay dưới route (bắt buộc; không chốt 本登録 được nếu chưa nhập)** (28-145, 2026-09-29; trước đây: nhập ở 「申込内容確認」), kho = kho của channel vật tư, **miễn phí**. Nội dung = **số lượng bộ ban đầu định nghĩa trong master vật tư, khác nhau theo plan (số suất/tháng)** (追補7, 28-129). **Delivery của bộ vật tư ban đầu sinh khi 本登録** (28-130): lúc đăng ký tạm chỉ sinh `material_orders(kind=initial_set)` (`delivery_date` NULL cho tới khi ops nhập ở tab 「子契約」); khi 本登録 sinh delivery với ngày giao đó và gắn vào order. |
| Từ chối / rút hồ sơ khi còn `provisional` | Huỷ order và bộ vật tư ban đầu đã sinh. |
| Sửa kho / số lần giao sau đăng ký tạm | Cho phép ở tab 「子契約｜契約」; UI cảnh báo ảnh hưởng tới order / bộ vật tư đã sinh, ops tự điều chỉnh. |
| Option theo số lần giao | **So theo từng nhiệt độ** (28-154, 28-156): số lần giao của channel lạnh vượt số lần chuẩn lạnh của plan, hoặc channel đông vượt số lần chuẩn đông → option A 「配送回数追加」 (OP000001) tự sinh dòng ở ① của contract month với qty = tổng phần vượt. **Không bù trừ** giữa nhiệt độ thiếu và nhiệt độ vượt. (Trước đây: so tổng — 28-85, đã thay.) Chi tiết §4.9. |

**Data model 【案 — chờ dev xác nhận, chưa phản ánh vào §14】**

```text
order_quantities(
  ...,                                  -- các cột hiện có (§14.12)
  contract_month_id NULL,               -- NULL khi còn provisional (chưa có contract month)
  cycle_month,                          -- cycle tháng của order (để gắn khi materialize)
  occurrence_no,                        -- lần giao thứ n trong cycle (1..delivery_count), trước khi có occurrence_key
  product_id,
  source(menu_order|ops_manual|trial_auto),
  customer_editable bool,               -- false với trial_auto
  cancelled_at NULL                     -- huỷ khi hồ sơ bị từ chối / rút
)

material_orders(                        -- nếu chưa có bảng riêng cho giỏ vật tư
  id, contract_id, site_id,
  kind(initial_set|regular), delivery_date, warehouse_id,
  charge(free|paid), status, cancelled_at NULL
)

material_initial_sets(                  -- 追補7 (28-129): số lượng bộ ban đầu theo plan
  material_product_id, plan_code, qty   -- qty = 0 / không có dòng → không thuộc bộ ban đầu
)
-- UNIQUE(material_product_id, plan_code)
```

- Khi 本登録 → `plan_rollout` / `delivery_materialize` sinh plan/delivery, gắn `order_quantities` (cycle_month, channel, occurrence_no) vào `occurrence_key` tương ứng và set `contract_month_id`.
- Ngày chốt đặt hàng dùng thử tính từ ngày của slot B7 / D7 trong `delivery_cycles`; không thêm bảng lịch.
- Delivery của bộ vật tư ban đầu: **sinh khi 本登録** (追補7, 28-130; nhất quán với #52 — không sinh delivery khi `provisional`). `material_orders.delivery_id` được set khi 本登録.

### 4.9. Số lần giao theo nhiệt độ và giá trị lấy từ plan master (2026-09-29, 28-147〜157)

Quyết định: 決定_v2.3追補_プランマスタ 28-147〜157 (bản tiếng Nhật). Plan master nằm ngoài phạm vi tài liệu này; ở đây chỉ ghi phần ảnh hưởng tới channel / số lần giao / contract month.

| Mục | Quy tắc |
|---|---|
| Số lần giao | Giữ **theo từng channel** (`contract_delivery_channels.delivery_count`). Channel vật tư (`on_demand`) = NULL. `contracts.delivery_count` chỉ còn là tổng (tham chiếu, không nhập). |
| Không cho 0 lần (28-156) | Channel lạnh **≥ 1**. Course ESスタンダード: channel đông cũng **≥ 1** (không nhận đông → course ESライト). Vi phạm → lỗi validation, không lưu. |
| Số lần chuẩn của plan (28-154) | Plan master giữ số lần chuẩn **theo nhiệt độ**: lạnh/thường và đông (ESライト chỉ có lạnh). Snapshot vào contract month lúc sinh. |
| Số lượng 1 lần giao (28-153) | = giới hạn cung cấp tháng của nhiệt độ đó ÷ số lần chuẩn của nhiệt độ đó (làm tròn lên). Dùng cho kiểm tra dung tích tủ lạnh (lạnh) / tủ đông (đông). **Không còn `frozen_ratio`** (28-155). |
| Option 「配送回数追加」 | Xem §4.8: so theo từng nhiệt độ, không bù trừ (28-156). |
| Giá plan và phần doanh nghiệp chịu (28-147〜150) | Plan master giữ phần doanh nghiệp chịu (mặc định 100 yên đã gồm thuế / suất) và thuế suất lấy từ **master thuế suất** (dropdown). Giá plan (chưa thuế) được chia thành **phí cơ bản (10%)** + **phần doanh nghiệp chịu (8%)**. Contract month snapshot các giá trị này; cờ 「福利厚生の適用」 ON → hoá đơn in 2 dòng, OFF → 1 dòng (thuế vẫn tính theo 2 thuế suất). Chi tiết billing nằm ở tài liệu billing, tài liệu này chỉ yêu cầu snapshot (§14.12). |

## 5. Cycle generation rules

### 5.1. A1 và range

- A1 phải là thứ Hai; input khác được normalize về thứ Hai ngay trước đó.
- A1 mặc định là ngày sau D7 của cycle trước.
- Plan chỉ sinh trong `range_from..range_to`.
- Batch không tự động mở rộng range.
- Month không có cycle hợp lệ không tạo plan hoặc delivery.

### 5.2. Pause

- Pause có `start_date`, `end_date` và `kind`.
- Ngày pause không nhận slot.
- Sau pause tiếp tục slot kế tiếp.
- Tổng số ngày dừng của một đợt phải là **bội số của 7**, nếu không A1 của cycle kế tiếp sẽ không rơi vào thứ Hai.
- Khi chưa đủ, hệ thống **tính số ngày `adjust` còn thiếu** bằng `7 − (tổng ngày dừng mod 7)` và hiển thị cho admin, **nhưng không tự chèn**.
- **Admin tự chọn vị trí đặt các ngày `adjust`** — liền sau đợt pause, rải trong tuần đó, hay dồn về cuối tháng — và sửa lại được bất cứ lúc nào trước khi cycle được fix.
- Không lưu được cấu hình khi tổng ngày dừng của một đợt chưa chia hết cho 7.
- `adjust` dùng `adjust_for_pause_id` để biết nó bù cho đợt pause nào.

Hệ quả: nếu kho thực tế vẫn làm việc vào một ngày `adjust` và cần xuất hàng, admin dời ngày `adjust` đó sang ngày khác thay vì tạo ngoại lệ (2026-09-22).

### 5.3. Materialized calendar

`delivery_cycle_days` lưu date, cycle number/label, slot code, week, `is_first` và `is_pause`. Pause không tăng slot index.

---

## 6. Date calculation rules

### 6.0. Lead time nào được dùng

Thứ tự ưu tiên khi tính picking date (2026-09-23):

1. `deliveries.lead_time` — lead time chỉ áp cho **riêng chuyến đó**, do ops đặt bằng thao tác "chỉ định ngày riêng" (§15.4). Chỉ tồn tại ở delivery, không có ở plan.
2. `contract_month_delivery_channels.lead_time` — nếu contract month đã có.
3. `contract_delivery_channels.lead_time` — mặc định của hợp đồng mẹ.

Warehouse **không** giữ lead time và **không** tự điền (§3.1). Khi `deliveries.lead_time` khác lead time của hợp đồng, màn hình hiển thị `調整済` và mọi lần dời ngày sau đó **giữ nguyên** lead time riêng này.

### 6.1. Invalid delivery date

Một delivery date không hợp lệ khi thuộc:

1. Cycle pause.
2. Delivery holiday áp dụng cho contract.
3. `ng_weekdays`.
4. Site receive block.

### 6.2. Invalid picking date

Một picking date không hợp lệ khi thuộc:

1. Cycle pause.
2. Warehouse non-picking date/range.
3. Warehouse non-picking slot của chính ngày picking.

`business_override` mở lại ngày bị cấm theo slot.

### 6.3. Pseudocode

```text
seed = ngày slot hoặc ngày special
direction = contract.holiday_shift
best = null
plusOneCandidate = null

for i = 0..20:
    deliveryDate = seed + i * direction
    if isInvalidDeliveryDate(deliveryDate): continue

    rawPickingDate = deliveryDate - leadTime
    pickingDate = rawPickingDate
    while isInvalidPickingDate(pickingDate):
        pickingDate = pickingDate - 1 day

    actualLeadTime = deliveryDate - pickingDate
    gap = actualLeadTime - leadTime
    update best candidate by minimum gap

    if gap == 0: return valid candidate
    if gap <= 1 and plusOneCandidate is null:
        plusOneCandidate = candidate

if plusOneCandidate exists: return tolerance candidate
if best exists: return requires-review candidate
return ungeneratable
```

### 6.4. Result rules

| Kết quả | Điều kiện | Xử lý |
|---|---|---|
| Bình thường | Gap = 0 | Tự xác nhận |
| Cho phép | Gap = +1 | Tự xác nhận, ghi tolerance flag |
| Cần kiểm tra | Gap > +1 | Không tự xác nhận |
| Không thể sinh | Không có candidate trong 20 ngày | Ghi `ungeneratable_reason` |

Quy tắc bổ sung:

- Picking date luôn dời về trước.
- Không rút ngắn contract lead time.
- Nếu chỉ dời picking không đạt tolerance, tìm delivery date khác.
- Lệch quá 3 ngày so với seed phải đánh dấu review.
- Đảo hướng phải ghi `shift_reversed=true`.
- Slot tiếp tục sau cycle pause chỉ được dời về sau.
- Special delivery dùng cùng `holiday_shift` với contract.

---

## 7. Shipping plan rules

### 7.1. Unique key

```sql
UNIQUE(contract_id, line_no, channel_id, cycle_id, occurrence_key)
```

Không dùng `(contract_id, delivery_date)`.

### 7.2. Regenerate

1. Chọn plan `draft` trong phạm vi.
2. Replace bằng UPSERT theo unique key.
3. Dùng contract-month snapshot nếu tồn tại.
4. Áp dụng site constraints.
5. Áp dụng approved overrides theo thời gian approve.
6. Không sửa `published` hoặc `locked`.

### 7.3. Lifecycle

```text
draft → published → locked
```

| Lifecycle | Trigger |
|---|---|
| `draft` | Plan được sinh |
| `published` | Delivery được materialize |
| `locked` | Ship order được gửi thành công lần đầu |

Cấm `published → draft`, `locked → published`, rollback lock và duplicate từ draft.

---

## 8. Materialize và finalize

### 8.1. Materialize delivery

Khi qua `order_start_date`:

1. Chọn plan `draft` chưa có delivery.
2. Tạo delivery trong cùng transaction.
3. Copy schedule, channel và estimated quantity.
4. Sinh `delivery_legs` từ `contract_month_routes`; chỉ khi contract month chưa tồn tại mới dùng `contract_routes` (§4.3).
5. Snapshot address, condition và receive windows.
6. Set `deliveries.status = 出荷待`.
7. Set plan lifecycle `published`.
8. Liên kết plan và delivery.

`deliveries.shipping_plan_id` phải unique.

### 8.2. Finalize quantity

Khi qua `order_close_date`:

1. Lấy confirmed quantity từ `order_quantities` (§14.12), khớp theo `contract_id + line_no + channel_id + cycle_id + occurrence_key` của plan.
2. Update delivery hiện có. Không tạo delivery mới.
3. Không tìm thấy record quantity → **không finalize**; tạo review item `qty_missing`.
4. `confirmed_qty = 0` là giá trị hợp lệ và được xử lý như hủy trước xuất (§10.3), không coi là thiếu dữ liệu.

`order_quantities` là dữ liệu nhận từ hệ thống menu/order. ES không tự tính lại quantity ở bước này.

5. Set `deliveries.order_id` = `order_quantities.order_id` của record vừa khớp (2026-09-23). Không khớp được thì để NULL cùng với review item `qty_missing` ở bước 3.
6. Tạo `delivery_lines` theo từng `product_id` của order, với `planned_qty` = confirmed quantity của sản phẩm đó (§14.7). Order không có chi tiết sản phẩm thì chưa tạo `delivery_lines`; nó sẽ được tạo khi ghi thực tế giao hàng (§13.2).

### 8.3. Provisional marker guard

Khi `marker_source=provisional`:

- Cho phép đóng change request và chạy recheck.
- Cấm finalize quantity.
- Cấm kích hoạt mọi luồng gửi thông báo xác nhận (chi tiết nội dung thông báo nằm ngoài phạm vi tài liệu này — §1).
- Cấm gửi ship order.
- Cấm chuyển `locked`.

---

## 9. Change, lock và duplicate

### 9.1. Approved override

- Approval tạo `delivery_overrides` hoặc `site_receive_blocks` (§14.11).
- Override giữ absolute date hoặc skip instruction.
- Regenerate draft phải áp dụng lại override.
- Cancel override phải có reason và audit.

#### 9.1.1. Hạn xử lý change request (2026-09-29)

- Hạn xử lý = `order_close_date` của delivery/plan mục tiêu.
- Từ `order_close_date − change_request_warn_days` (mặc định 3 ngày) mà request vẫn `pending` / `proposed` → UPSERT review `change_request_due`.
- Quá hạn vẫn chưa xử lý: giữ review cho tới khi ops xử lý. **Hệ thống không tự reject.**

### 9.2. Change policy

| Thời điểm | Quy tắc |
|---|---|
| Trước order close | Cho phép single/bulk theo quyền |
| Sau order close → trước ngày xuất 1 ngày | **Ops đổi từng record** (màn edit của chi tiết giao hàng; không bulk/kéo thả). Lý do bắt buộc. Chỉ sang ngày **cùng cycle, cùng nửa (A·B hoặc C·D)**; ngày xuất đi theo lead time hợp đồng; cùng cơ sở + cùng ngày giao thì đông lạnh/lạnh dời cùng; không đổi kho (#63, 2026-09-29) |
| Từ ngày xuất trở đi | **Cấm update ngày.** Muốn đổi thì cancel + duplicate (cũ: cấm toàn bộ sau order close — #v2.2-1) |

Quyết định 2026-09-22: bỏ nhánh "sau order close, trước lock ops sửa từng record" của quyết định v2.1 #1. Order close là mốc duy nhất; `locked` không còn là mốc của việc đổi ngày mà chỉ là mốc của ship order.

### 9.3. Lock trigger

Chỉ first successful ship-order send tạo lock. Export CSV, send failed, tracking import và resend không tạo hoặc thay đổi lock.

Tracking xuất hiện trước successful ship order tạo anomaly nhưng không lock.

### 9.4. Duplicate

- Dùng cho redelivery, remainder và alternative shipment.
- Source phải là delivery `published` hoặc `locked`.
- Quan hệ parent-child chỉ một tầng; branch 1–9.
- Copy destination, condition, receive windows và toàn bộ `delivery_legs` của parent.
- Không copy tracking, assignment hoặc delivery attachment.
- Child với ngày chưa xác nhận bắt đầu `確認中`.
- Ngoài duplicate do ops, hệ thống tự tạo một child `trouble_pending` **ngay khi đăng ký trouble report** thuộc loại có `trouble_types.auto_child = true` (§13.2.1, 2026-09-29). Child này vẫn tuân theo depth/branch/copy rules ở trên. Mỗi delivery phát sinh trouble chỉ có **tối đa một child còn sống** (không phải `取消`), unique theo `source_trouble_delivery_id`.
- **Gửi trả** (`duplicate_type=return`, 2026-09-29): duplicate để gửi hàng còn lại về điểm gửi trả. Chỉ loại này được **đổi điểm giao** sang `warehouses` loại `return`: set `return_to_warehouse_id`, `address_snapshot` / `destination_name` = của điểm gửi trả. Quantity = số còn lại. **Không billing.** Depth / branch như duplicate khác.
- **Trouble phát sinh ở một child** (2026-09-29): không duplicate từ child. Tạo **branch tiếp theo của parent gốc** (`parent_delivery_id` = parent của child đó); nội dung (destination, condition, receive windows, `delivery_legs`) copy từ **chính child bị trouble**. Vượt branch 9 → `DOMAIN_BRANCH_LIMIT` và tạo review item để ops xử lý.

---

## 10. Picking và ship order

### 10.1. Picking rules

- Group theo warehouse, picking date và temperature type.
- Đông lạnh, lạnh/thường và material là record riêng.
- Material không tham gia picking threshold.
- Non-picking change chỉ tự tính lại draft.
- Published bị ảnh hưởng được đưa vào review; locked không tự sửa.

### 10.2. Ship-order eligibility

Delivery được gửi khi:

- Lifecycle `published`.
- Status `出荷待`.
- Quantity đã sẵn sàng.
- `schedule_confirmed=true` và `quantity_confirmed=true`.
- Không ở `確認中`, `取消`, `中止`.
- Không có `duplicate_type=trouble_pending` chưa được ops resolve.
- Marker không provisional.
- Warehouse và channel active.

### 10.3. Send/resend

- Ship order có revision.
- First successful send set `locked`.
- Resend tăng revision nhưng không đổi `locked_at`.
- Hủy trước xuất được truyền bằng quantity 0 ở revision mới.
- Lưu payload hash để phát hiện chênh lệch.
- **Resend được cho tới khi nhận shipment result của chuyến đó.** Nhận rồi thì khóa, không resend nữa. Hệ thống không đặt hạn theo giờ bắt đầu picking của kho (2026-09-22).

Transaction khi success:

```text
BEGIN
  update ship_order as successful
  if delivery.locked_at is null:
      set delivery.locked_at and locked_source
      set shipping_plan.lifecycle = locked
COMMIT
```

Operation phải idempotent theo delivery và revision.

### 10.4. Cửa sổ gửi và ngày gửi

Ship order được gửi theo **lô 2 tuần**, không gửi rời từng ngày.

```text
window_start     = ngày bắt đầu của cửa sổ 14 ngày kế tiếp
window_end       = window_start + 13 ngày
send_target_date = window_start - warehouses.ship_order_lead_days
```

- Một lô gồm các delivery có `picking_date` nằm trong `window_start..window_end`.
- `ship_order_lead_days` mặc định 3 ngày làm việc, nên ngày gửi chuẩn rơi vào thứ Sáu trước cửa sổ. Giá trị đặt riêng theo từng kho.
- `window_start`, `window_end` và `send_target_date` được ghi vào revision khi tạo (§14.8).
- **Daily catch-up**: delivery đã qua `send_target_date` mà chưa có revision `ok` được gửi ở lần chạy kế tiếp, không bỏ qua.
- Delivery được tạo mới hoặc đổi ngày sau khi lô đã gửi thì gửi riêng bằng revision mới.
- Lô chia theo `warehouse_id` và `warehouses.thomas_csv_unit`; mỗi tổ hợp là một file (§19.1).

---

## 11. Tracking và shipment result

```text
delivery 1 : N tracking numbers
tracking number N : 1 delivery
```

- Không cho một tracking number chứa nhiều delivery.
- Một delivery có thể có nhiều thùng.
- Hub không phát hành lại tracking.
- **Chuyến đối tác đến kho lấy hàng** (không có tracking của hãng): ES tự đánh số, `issued_by = es_generated`, số = **delivery No + số thùng 2 chữ số** (ví dụ `DL-261020-0021-01`). Tạo theo **số thùng dự kiến** khi ship order gửi thành công lần đầu; khi nhận shipment result có số thùng khác thì thêm phần thiếu, phần thừa chuyển `voided`. Không có link tra cứu (2026-09-29).
- Child redelivery có tracking riêng.
- Import shipment result hợp lệ chuyển `出荷待 → 出荷済`.
- Tracking import không set lock.
- Nếu shipment result có chi tiết theo sản phẩm thì ghi vào `delivery_lines.planned_qty` (§14.7); không có thì `delivery_lines` được tạo lúc materialize từ `order_quantities` (§8.2).

---

## 12. Delivery status

### 12.1. Values

```text
出荷待 / 出荷済 / 受取済 / 納品済 / 一部納品済 /
再配達待 / 確認中 / 中止 / 取消
```

| Status | Ý nghĩa | Kết thúc? |
|---|---|---|
| `出荷待` | Delivery đã tạo, chưa rời kho | Không |
| `出荷済` | Kho đã xuất (import shipment result) | Không |
| `受取済` | Driver đã nhận tại kho/hub. Đang trên đường cũng ở trạng thái này. **Chỉ vào được từ app driver của ES** | Không |
| `納品済` | Đã giao đủ. Presumed completion ghi `completion_source=presumed` | **Có** — ngoại lệ: `納品済` với `completion_source=presumed` được ops resolve sang `再配達待` / `中止` khi xác nhận hàng không tới (§13.2.2) |
| `一部納品済` | Giao được một phần và **đóng ở đây**. Phần còn lại nằm ở record con, **hoặc không giao phần còn lại** (resolution `partial_no_resend`, không có con — 2026-09-29) | **Có** |
| `再配達待` | Không giao được và **đóng ở đây**. Lần giao lại nằm ở record con | **Có** |
| `確認中` | Child/recovery candidate đang chờ ops chốt ngày, quantity và hướng xử lý. Parent đang vận chuyển **không** chuyển sang status này chỉ vì có trouble report | Không |
| `中止` | Quyết định không giao nữa. Actual 0, **không tính tiền**. **Dùng cho cả trước và sau khi xuất kho** | **Có** |
| `取消` | Huỷ **trước khi hàng rời kho**. Actual 0, không tính tiền. Ship order được triệt tiêu bằng revision `qty=0` (§10.3) | **Có** |

Phân biệt `中止` / `取消` theo **đã xuất kho hay chưa** (2026-09-23):

- Chưa rời kho → `取消`. Guard: chỉ cho phép khi `shipped_date IS NULL`.
- Đã rời kho rồi mới dừng → `中止`. Hàng đã ra ngoài nên cước và huỷ hàng xử lý riêng.

**Record cha không đổi theo record con.** `一部納品済` và `再配達待` là trạng thái cuối của chính record đó; billing tính theo actual quantity và ngày giao của **từng record** (§13.7), nên không cần ghi đè cha thành `納品済`. Con bị `中止` / `取消` cũng không làm cha đổi. Parent-child chỉ một tầng, branch 1–9 (§9.4).

### 12.2. Transition table

| From | Event | To |
|---|---|---|
| Không status | Materialize | 出荷待 |
| 出荷待 | Import shipment result | 出荷済 |
| 出荷待 | Cancel trước xuất | 取消 |
| 出荷済 | Driver nhận hàng | 受取済 |
| 出荷済 | Trouble report | 出荷済 (giữ nguyên status, mở trouble/review) |
| 出荷済, final leg carrier | Presume-complete batch | 納品済 |
| 受取済 | Giao đủ | 納品済 |
| 受取済 | Quantity difference/trouble | 受取済 (giữ nguyên status, mở trouble/review) |
| 納品済 | Khiếu nại sau giao | 納品済 (giữ nguyên status, mở trouble/review) |
| 出荷済 | Không giao được nữa sau khi đã xuất kho (hỏng xe, tuyết lớn, hàng sự cố). Reason bắt buộc | 中止 |
| 受取済 | Không giao được nữa sau khi driver đã nhận. Reason bắt buộc | 中止 |
| 出荷済 / 受取済 / 納品済 | Ops resolve: giao đủ | 納品済; auto-child nếu có → 取消 |
| 出荷済 / 受取済 | Ops resolve: giao một phần | 一部納品済 + reuse/create child remainder |
| 出荷済 / 受取済 | Ops resolve: giao một phần, **không giao phần còn lại** (`partial_no_resend`, 2026-09-29) | 一部納品済; không tạo child; auto-child nếu có → 取消 |
| 出荷済 / 受取済 | Ops resolve: giao lại toàn bộ | 再配達待 + reuse/create child full quantity |
| 出荷済 / 受取済 | Ops resolve: không giao nữa | 中止; auto-child nếu có → 取消 |
| 出荷済 / 受取済 | Ops resolve: quay lại trong ngày | 受取済; auto-child nếu có → 取消 |
| 納品済 (`completion_source=presumed`) | Ops resolve: xác nhận hàng không tới, giao lại (2026-09-29) | 再配達待 + reuse/create child full quantity |
| 納品済 (`completion_source=presumed`) | Ops resolve: xác nhận hàng không tới, không giao nữa (2026-09-29) | 中止; auto-child nếu có → 取消 |
| 受取済 (chỉ có trouble `delay` chưa resolve) | Driver báo giao đủ (2026-09-29) | 納品済; hệ thống tự resolve các report `delay` = giao đủ (§13.2.3) |
| 確認中 (child) | Đã chốt hướng xử lý, quantity và ngày giao — **từ đây mới vào ship order** | 出荷待 |
| 確認中 (child) | Không cần giao lại | 取消 |

Transition ngoài bảng phải bị từ chối.

Guard bổ sung (2026-09-23):

- `取消` chỉ hợp lệ khi `shipped_date IS NULL`. Sau khi đã xuất kho chỉ còn `中止`.
- `納品済`, `一部納品済`, `再配達待`, `中止`, `取消` là trạng thái cuối. Khiếu nại sau giao mở trouble/review nhưng không đổi parent `納品済` sang `確認中`. **Ngoại lệ duy nhất** (2026-09-29): `納品済` với `completion_source=presumed` được ops resolve sang `再配達待` / `中止` (§13.2.2). `納品済` với `completion_source = reported / customer` không có ngoại lệ này.
- Trouble report không đổi status parent. `確認中` trong luồng này chỉ dùng cho child/recovery candidate chưa xuất kho (`shipped_date IS NULL`).
- Với child `duplicate_type=trouble_pending`, `確認中 → 出荷待` còn yêu cầu `schedule_confirmed=true`, `quantity_confirmed=true` và ops đã chốt resolution của parent trouble (§13.2.1).
- Khi resolution không cần giao lại, auto-child phải chuyển `確認中 → 取消` trong cùng transaction với việc resolve parent.
- Reason bắt buộc cho mọi transition sang `中止`, `取消`, `一部納品済`, `再配達待`.

### 12.3. Final-leg completion

Final leg là `delivery_legs` có `is_final_leg = true`.

| Final-leg regime | Xử lý |
|---|---|
| `parcel_carrier` | Batch set `納品済`, `completion_source=presumed` |
| `self`, `partner_driver` | Không presumed; quá hạn đưa missing queue |

---

### 12.4. Nhãn hiển thị cho khách (2026-09-29)

API cho web doanh nghiệp trả **nhãn hiển thị** tách khỏi status (web vận hành giữ nguyên tên status). Nhãn suy ra, không lưu.

| Status / tình huống | Nhãn cho khách |
|---|---|
| `取消` và có delivery thay thế (child `alternative` còn sống) | 配送日調整中 |
| Có trouble report chưa resolve (status giữ `出荷済` …) | Status như cũ + ghi chú 「配送状況を確認中です」 |
| Child `確認中` | 再配送準備中 |
| `一部納品済` | 一部お届け済み |
| `再配達待` | 再配送予定 |
| `取消` không có delivery thay thế, `中止` | お届け中止 |

### 12.5. Web doanh nghiệp: trang chủ (lịch tháng) và chi tiết giao hàng (2026-09-29, #54–#57)

- **Trang chủ = lịch tháng hiện tại** (màn 07). Chuyển tháng tới tháng đã có plan (tối đa 6 tháng). Ô ngày: nhiệt độ + số lượng (sau khi chốt) hoặc 「お届け予定」 (plan), badge = nhãn §12.4, 「変更申請中」. Plan: viền nét đứt + nhãn 「予定」. Bỏ màn 「配送状況」 (danh sách theo kỳ). Bố cục giống trang chủ web công ty giao hàng ủy thác: **trái = lịch tháng này**, **phải = thông báo** (お知らせ配信, audience company: category + tiêu đề) **và 「確認が必要なお届け」** (一部お届け済み・変更申請中・plan còn yêu cầu được) (2026-09-29).
- **Phạm vi xem theo quyền**: `corp_admin` = mọi site của công ty (lọc theo site); `site_staff` = chỉ site được gán (`corporate_user_sites`). **Lọc ở API**, không chỉ ẩn trên UI.
- **API chi tiết giao hàng cho khách** chỉ trả: ngày giao (ngày đến), khung giờ nhận, nhiệt độ + loại chuyến, nhãn hiển thị, danh sách sản phẩm (plan: không trả số lượng/sản phẩm trước hạn chốt đơn; sau giao: `planned_qty`/`delivered_qty`/`substituted_from_product_id`), kết quả giao (thời điểm hoàn tất, người nhận, thu tiền) — **không trả 5 bước, `stock_before`/`disposed_qty`/`stock_after`/`expiry_date`, ảnh** (#60, 2026-09-29; cũ: có trả), số vận đơn + link tra cứu (**không trả `carrier_id`/tên hãng**; `issued_by = es_generated` thì không trả), delivery con liên quan.
- **Không trả**: `shipped_date` (ngày picking), kho, carrier, relay, driver, cước, audit log, tài liệu `audience = carrier`.
- **「確認が必要なお届け」 (#58)**, thứ tự: (1) CR `提案中` — khách phải trả lời (chấp nhận → duyệt ngày đề xuất; từ chối/không trả lời → ops quyết định); (2) nhãn §12.4 bất thường hoặc có trouble chưa resolve; (3) CR `承認`/`否認` trong 14 ngày sau khi xử lý; (4) plan còn yêu cầu được, từ 3 tuần trước hạn chốt đơn. Component DS `NoticeList`.
- **Hiển thị yêu cầu đổi ngày (#62)**: khi có CR `申請中`/`提案中`, màn chi tiết (ops: trên tab 配送概要; khách: trên cùng màn お届け詳細) hiện khung yêu cầu (ngày hiện tại → mong muốn 1/2 hoặc ngày đề xuất, lý do, người yêu cầu, hạn). Ops xử lý qua modal 「変更申請の確認」 (giống xử lý CR trên lịch): thông tin cơ bản + bảng tuyến; bảng ngày mong muốn (ngày giao, cycle, ngày xuất, cycle ngày xuất, lead time, số đơn ngày xuất) chọn bằng radio; bảng ngày khác (cùng cycle, cùng nửa). Giá trị có vấn đề (thiếu lead time, vượt số đơn tối đa, ngày không xuất được → disabled) hiển thị màu đỏ. Nút 「選択した日で承認」: chọn ngày mong muốn = đổi ngày; chọn ngày khác = gửi đề xuất cho khách (状態 提案中, hạn = hạn chốt đơn). 「否認する」 bắt buộc lý do (旧: modal check ①〜⑦ + ngày thay thế); khách tạo yêu cầu qua modal từ nút ở header. Không có quyền → **ẩn nút** (quy ước DS). Bỏ tab 「変更申請」 và màn chi tiết yêu cầu riêng.
- **Danh sách yêu cầu của khách (#59)**: menu 「申請」 tab 「お届け日の変更」; trạng thái 申請中 / 別の日のご提案 (`提案中`) / 承認 / 否認 / 取り下げ (【案】 khách tự rút khi còn 申請中).
- **Yêu cầu đổi ngày** từ màn chi tiết: chỉ plan tháng sau trở đi, trước hạn chốt đơn (§15.4). Tháng hiện tại / quá khứ / đã chốt: không hiện nút, hiện lý do. Chọn ngày trong cùng cycle, cùng nửa (A·B hoặc C·D); ngày 1 = mong muốn 1, ngày 2 = mong muốn 2; hoặc 「希望日なし」. Lý do bắt buộc.

- **Chi tiết thông báo (web doanh nghiệp, #66, 2026-09-29)**: mở từ khối 「お知らせ」 trang chủ. Hiện category (badge), thời điểm đăng (`2026/09/29 07:00`), tiêu đề, nội dung (giữ xuống dòng), file đính kèm (chỉ file của thông báo trên ESS; xem/tải), 「‹ 一覧に戻る」. Chỉ thông báo **đang hiển thị** mà user thuộc đối tượng nhận. API list/detail phía người nhận thuộc tài liệu お知らせ配信 (ngoài phạm vi tài liệu này — §1); ở đây chỉ ghi quy tắc màn hình.
- **Chỉ UI (#67)**: thêm 「要確認（件数）」 vào menu 「配送管理」 của ops; bỏ nút chọn 「基準」 ở lịch tháng; menu trái thu gọn được (tự thu khi < 1280px, DS ES Kitchen v19). Không đổi data/API.

## 13. Assignment, trouble và billing handoff

### 13.1. Driver assignment

- Assignment theo từng `delivery_legs`.
- **Leg nào cần assign** (2026-09-29): leg có `delivery_regime = parcel_carrier` (hãng vận chuyển) **không assign**; leg `self` / `partner_driver` **phải assign** — không phân biệt leg 1 hay leg 2. (Cũ: "Phase 2 chỉ assign leg 2 / chặng 2次", bỏ 2026-09-29.)
- Ops assign/reassign mọi delivery, **từng bản ghi một**. Phase 2 **không có** chức năng gán lại hàng loạt (2026-09-23).
- Partner carrier chỉ thao tác trong công ty mình.
- Assignment được phép sau lock.
- Duplicate child không kế thừa assignment.
- Leg cần assign mà **từ 3 ngày trước ngày giao** vẫn chưa có driver → UPSERT review `assignment_missing`; **hiển thị cả trên web đối tác** (đối tác của leg đó) và **gửi email cho đối tác** của leg đó vào **D-3 và D-1** (leg `self` chỉ hiện review, không email). Không block shipment. (Đổi 2026-09-30 〔要件シート 行142・決定_要件シート一部反映_回答_20260930〕; cũ: tới ngày trước ngày giao (D-1), chỉ review, không email — 2026-09-29; cũ hơn: tại thời điểm lock.) Nội dung / kênh email theo tài liệu お知らせ配信 (§1); ở đây chỉ định nghĩa thời điểm và đối tượng.
- **Điểm nhận hàng trên driver app** (2026-09-30) 〔要件シート 行37・決定_要件シート一部反映_回答_20260930〕: API delivery cho driver trả điểm nhận của leg: kho (`warehouses.name`, địa chỉ) hoặc hub (`warehouses.name` = tên văn phòng, địa chỉ, `branch_code`, `tel`).
- **Không có chat** trong driver app và web đối tác; khẩn cấp thì dùng nút gọi điện 〔要件シート 行49・決定_要件シート一部反映_回答_20260930〕.
- **Giờ nhận hàng theo leg** (2026-09-29): khi driver thao tác 「荷物受取」 ở leg nào thì ghi `delivery_legs.picked_up_at` / `picked_up_by` của leg đó. Status `出荷済 → 受取済` chỉ ở **lần nhận đầu tiên bằng app ES**; các lần nhận sau (ví dụ driver leg 2 nhận ở hub) chỉ ghi giờ, status giữ `受取済`. Không có status trung gian của relay.

### 13.2. Trouble

Categories (master `trouble_types`, 6 loại — §14.7):

```text
qty_diff / wrong_delivery / damage / absent / delay / other
```

Trouble giữ category, reporter, time, raw content, attachments, resolution, reason và resolver.

- Driver app gửi lựa chọn của app (`app_reason_raw`). Hệ thống map sang category qua `trouble_app_reasons`; lựa chọn thuộc hai loại (「商品不足・誤配送」) có `type_code = NULL` (chưa xác định) cho tới khi ops phân loại.
- Ops đăng ký thay (proxy) thì chọn category trực tiếp.
- Mỗi trouble report chưa resolve tạo/cập nhật review item `trouble_open` (target = delivery) ngay khi đăng ký.

`qty_diff` phải kèm chi tiết theo sản phẩm: ghi `delivery_lines.delivered_qty` cho từng `product_id` (§14.7). Tổng `delivered_qty` của `delivery_lines` phải bằng `deliveries.delivered_qty`.

**Resolve theo đơn vị delivery** (2026-09-29): một lần resolve đóng **toàn bộ** trouble report chưa resolve của delivery đó, ghi cùng `resolution` / `resolved_at` / `resolved_by` / `resolution_reason` cho từng report.

#### 13.2.1. Auto-child tạo ngay khi báo cáo, theo loại trouble (quyết định 2026-09-29, thay cho 2026-09-24)

Khi đăng ký trouble report thuộc loại có `trouble_types.auto_child = true`, hệ thống tạo **một child tạm thời trong cùng transaction** để chuẩn bị luồng giao lại. Trouble report **không đổi status parent**.

| Loại | `auto_child` (giá trị ban đầu) |
|---|---|
| `wrong_delivery` | true |
| `absent` | true |
| `damage` | true |
| `qty_diff` | false — ops chọn giao / không giao phần thiếu lúc resolve |
| `delay` | false — tự resolve khi driver báo giao đủ (§13.2.3) |
| `other` | false |

- **Bỏ SLA**: không còn `auto_duplicate_due_at`, `trouble_auto_duplicate_after_minutes` và batch `trouble_auto_duplicate` (quyết định 2026-09-24 #22/#25 bị thay thế).
- Report có `type_code = NULL` không tạo child. Khi ops phân loại sang loại `auto_child = true` thì tạo child **tại thời điểm phân loại**, trong cùng transaction.
- Điều kiện: delivery phát sinh trouble đang ở `出荷済`, `受取済` hoặc `納品済`, và chưa có child còn sống (khác `取消`) theo `source_trouble_delivery_id`. Report thứ hai của cùng delivery **không** tạo child mới mà dùng lại child hiện có.
- Delivery phát sinh trouble là child → tạo branch tiếp theo của parent gốc (§9.4).
- Parent giữ nguyên trạng thái vận chuyển tại thời điểm phát sinh trouble: `出荷済` hoặc `受取済`; khiếu nại sau giao giữ `納品済`. Hệ thống không tự chọn resolution cho parent.
- Child bắt đầu ở `確認中`, `duplicate_type=trouble_pending`, `creation_source=trouble_auto`, `source_trouble_report_id` (report đầu tiên), `source_trouble_delivery_id`, `schedule_confirmed=false`, `quantity_confirmed=false`.
- Child copy destination snapshot, condition, receive windows và toàn bộ `delivery_legs` của delivery phát sinh trouble; không copy tracking, assignment hoặc attachment.
- Ngày giao trên child chỉ là candidate tạm để hiển thị. Số lượng tạm là mức tối đa có thể phải giao lại; không được dùng cho xuất hàng hoặc billing.
- Child `trouble_pending` bị loại khỏi ship order, tracking, assignment, billing, notification và presumed completion cho tới khi ops xác nhận.
- Tạo/cập nhật `review_items.kind=trouble_auto_child_pending` (target = child).
- Không tự tạo child chỉ vì delivery chưa hoàn tất. Phải có trouble report chính thức.

Khi ops resolve:

| Resolution | Parent | Xử lý auto-child |
|---|---|---|
| Giao đủ / replacement đủ | `納品済` | `取消` với reason `auto child not needed` |
| Giao một phần | `一部納品済` | Reuse child, set `duplicate_type=remainder`, quantity/lines = phần còn lại |
| Giao một phần, không giao phần còn lại (`partial_no_resend`) | `一部納品済` | `取消`; không có child |
| Giao lại toàn bộ | `再配達待` | Reuse child, set `duplicate_type=redelivery`, quantity/lines = toàn bộ |
| Quay lại trong ngày | `受取済` | `取消` |
| Không giao nữa | `中止` | `取消` |

Không tạo child thứ hai khi auto-child đã tồn tại. Sau khi ops chốt quantity và delivery date, set `quantity_confirmed=true`, `schedule_confirmed=true`; chỉ khi đó child mới được chuyển `確認中 → 出荷待`.

#### 13.2.2. Hàng không tới sau presumed completion (2026-09-29)

- Khách báo chưa nhận hàng với delivery `納品済` + `completion_source=presumed` → ops đăng ký trouble thay (proxy) và yêu cầu hãng vận chuyển điều tra (ngoài hệ thống).
- Xác nhận thất lạc / không giao → ops resolve: `再配達待` (reuse/create child full quantity) hoặc `中止`. Reason bắt buộc.
- Không áp dụng cho `completion_source = reported / customer`.
- Billing theo actual: phần này không tính tiền. Invoice đã xác nhận thì **không sửa ngược**, dùng adjustment tháng sau (§13.7).
- **Chưa quyết**: trường hợp chỉ một phần thùng không tới (có cho `一部納品済` hay không).

#### 13.2.3. Tự resolve trouble `delay` (2026-09-29)

- Delivery chỉ có trouble report chưa resolve thuộc loại `delay`, và driver báo **giao đủ** (`delivered_qty = planned_qty`) → trong cùng transaction với transition `→ 納品済`, hệ thống resolve các report đó với resolution = giao đủ, `resolved_by` = system (`actor_type=system`), và đóng review `trouble_open`.
- Còn report loại khác chưa resolve, hoặc số giao khác số dự kiến → không tự resolve; ops resolve.
- `delay` không giao được trong ngày → vẫn là trouble chưa resolve trong review; ops resolve (giao lại, v.v.).

### 13.3. Partial delivery

- Parent ghi actual đã giao và chuyển `一部納品済`. Đây là **trạng thái cuối của parent** (§12.1).
- Parent ghi `delivery_lines.delivered_qty` theo từng sản phẩm đã giao được (§14.7).
- Child giữ remainder và bắt đầu `確認中`. Nếu đã có auto-child của trouble thì **reuse child đó**, không tạo child thứ hai. Ops cũng có thể chọn **không giao phần còn lại** (`partial_no_resend`): parent `一部納品済`, không có child, phần thiếu không tính tiền; không có ngưỡng số lượng, ops quyết định, reason bắt buộc. Child có `delivery_lines` **của riêng nó** với `planned_qty` = phần còn lại; **không sửa `delivery_lines` của parent**.
- Child không vào ship order khi còn `確認中`. Vào được sau khi chuyển `確認中 → 出荷待` (§12.2).

### 13.4. Redelivery

- Parent chuyển `再配達待`.
- Child giữ full quantity, date, tracking và assignment riêng. Nếu đã có auto-child của trouble thì **reuse child đó**, cập nhật `duplicate_type=redelivery`, không tạo child thứ hai.
- Không tính lại product charge.
- Cước giao lại dùng flag `freight_billable` (mặc định false; true thì reason bắt buộc). Flag này dùng chung cho `再配達待` và `中止` (§13.5) — đổi tên từ `redelivery_billable` (2026-09-29).

### 13.5. Replacement/waste

- Replacement không phải status.
- Giao đủ bằng replacement vẫn là `納品済`.
- Billing theo giá product gốc: dòng hàng thay thế ghi `delivery_lines.substituted_from_product_id` = sản phẩm gốc, billing lấy đơn giá của sản phẩm gốc (2026-09-29). Ghi khi ops resolve "giao đủ bằng hàng thay thế" hoặc sửa actual (ops, reason bắt buộc).
- `中止`: không tính tiền hàng; cước theo `freight_billable` (mặc định false). Hàng còn lại gửi về trụ sở bằng duplicate `return` (§9.4).
- Waste không billing và cập nhật inventory. Số lượng huỷ ghi vào `delivery_lines.disposed_qty` theo từng sản phẩm (§14.7).
- Driver app báo tồn thực trước/sau khi trưng bày: ghi `delivery_lines.stock_before` / `stock_after`. (2026-10-01: bỏ `expiry_date` — không theo dõi hạn dùng.)

### 13.6. Thu tiền mặt

Hệ thống **không xử lý tiền mặt** (chức năng thu tiền đã bỏ hẳn — REQ-DL-415). Chỉ giữ hai số để đối chiếu (2026-09-23):

| Cột | Ai ghi | Khi nào |
|---|---|---|
| `deliveries.cash_expected_amount` | Hệ thống | Lúc materialize, copy từ cấu hình của site. Không có cấu hình → 0 |
| `deliveries.cash_collected_amount` | Driver, qua app (bước cuối của ES配送便) | Lúc báo cáo giao hàng |

- **Lệch thì vào quyết toán thực tế (2026-09-29, 28-135 — thay quy tắc 2026-09-23 "không vào billing").** Với phần khách chọn **trả tiền mặt trong app**: cộng theo site × kỳ quyết toán, `cash_diff = Σ cash_expected_amount − Σ cash_collected_amount`. `cash_diff ≠ 0` → một dòng trong `settlement` của contract month (thiếu = thu thêm, thừa = giảm). `cash_diff = 0` → không sinh dòng. Tiền đã thanh toán qua app **không** hiển thị / không vào quyết toán.
- `cash_expected_amount = 0` thì màn hình **ẩn** mục thu tiền (REQ-DL-315). Phí đỗ xe không hiển thị.
- Lệch giữa hai số **không** tự tạo `review_items`; số lệch hiện ở màn hình quyết toán thực tế (実績精算) và xuất CSV theo từng site cho công ty vận chuyển (REQ-DL-310 / 8E-3).

### 13.7. Billing handoff

- Billing month theo tháng dương lịch của ngày giao thực tế.
- Split delivery qua nhiều tháng phân bổ theo actual quantity từng tháng.
- Quantity không giao không billing.
- Không sửa ngược invoice đã xác nhận; dùng adjustment.
- Adjustment thuộc `advance` hoặc `settlement`, type `refund|offset`.
- Một invoice chỉ có một `payment_due_date`.

---

## 14. Data model

### 14.1. Cycle/calendar

```text
delivery_cycle_settings(
  id, first_a1_date, range_from, range_to,
  fixed_through, operation_start, note, saved_at, saved_by
)

delivery_cycle_pauses(
  id, setting_id, name, start_date, end_date,
  kind(normal|adjust),
  adjust_for_pause_id NULL
)

delivery_cycles(
  id, cycle_no, cycle_month, a1_date, b7_date, d7_date,
  menu_open_date, order_start_date, order_close_date,
  marker_source(menu|provisional), marker_copied_at
)

delivery_cycle_days(
  date PK, cycle_no, cycle_label, slot_code,
  week, is_first, is_pause
)

holidays(date PK, name)

delivery_holiday_days(
  id, setting_id, date, is_delivery_holiday,
  is_picking_closed, source, name
)

warehouse_non_picking_slots(
  id, setting_id, warehouse_id, slot_code
)

warehouse_non_picking_days(
  id, setting_id, warehouse_id, date_from, date_to,
  type(manual_closed|business_override), reason
)
```

### 14.2. Contract

```text
contracts(
  id, site_id, mode(cycle|special|on_demand),
  plan_qty, delivery_count, ng_weekdays,  -- delivery_count = tổng của các channel (tham chiếu, 2026-09-29 §4.9)
  holiday_shift(-1|1), delivery_condition,
  status(provisional|active|change_scheduled|suspend_scheduled|suspended|
         resume_scheduled|cancel_scheduled|ended),
  start_cycle_month, confirmed_at NULL, confirmed_by NULL,
  effective_from, effective_to
)
-- Chỉ `active`, `change_scheduled`, `suspend_scheduled`, `resume_scheduled` (trước ngày bắt đầu nghỉ / sau khi tái khởi động)
-- và `cancel_scheduled` (tới ngày huỷ) là đối tượng sinh plan/delivery/contract month (§4.7).
-- `confirmed_at` = thời điểm chốt điểm giao (本登録).

site_receive_windows(
  id, site_id, from_time, to_time, sort_order
)

contract_delivery_lines(
  id, contract_id, line_no,
  slot_code NULL, specified_day NULL, qty
)
-- Hai line cùng `slot_code` (hoặc cùng `specified_day`) được phép lưu;
-- màn hình chỉ hiện cảnh báo, không chặn (2026-09-22).

contract_delivery_channels(
  id, contract_id, temp_type, warehouse_id,
  delivery_count NULL,                  -- theo channel; NULL với vật tư; lạnh ≥ 1, đông ≥ 1 với ESスタンダード (§4.9)
  lead_time, service_form(es_delivery|cool|material),
  delivery_regime(self|partner_driver|parcel_carrier),
  share_pct, effective_from
)

contract_routes(
  id, channel_id, leg_no,
  from_type(warehouse|relay), from_id,
  to_type(relay|destination), to_id NULL,
  carrier_id, delivery_regime,
  is_final_leg, assign_scope(ops|carrier)
)

contract_months(
  id, contract_id, cycle_month, generated_at,
  generation_method, price_revision_gen
)

contract_month_delivery_channels(
  id, contract_month_id, channel_id, temp_type,
  warehouse_id, lead_time, service_form,
  delivery_regime, snapshot_at
)

contract_month_routes(
  id, month_channel_id, leg_no,
  from_type(warehouse|relay), from_id,
  to_type(relay|destination), to_id NULL,
  carrier_id, delivery_regime,
  is_final_leg, assign_scope(ops|carrier),
  snapshot_at
)
```

### 14.3. Shipping plan

```text
shipping_plans(
  id,
  contract_id, line_no, channel_id, cycle_id, occurrence_key,
  cycle_no, cycle_label, slot_code,
  seed_date, delivery_date, delivery_shift_days,
  raw_pick_date, picking_date, pick_shift_days,
  lead_time, actual_lead_time, estimated_qty,
  lifecycle(draft|published|locked),
  override_id NULL, contract_month_id NULL, delivery_id NULL,
  temp_type, warehouse_id, carrier_id,
  manual_moved, shift_reversed,
  route_snapshot_source(contract_month|contract),
  ungeneratable_reason NULL
)
```

```sql
UNIQUE(contract_id, line_no, channel_id, cycle_id, occurrence_key)
```

### 14.4. Delivery legs

Route được giữ ở **hai bảng tách rời**: `contract_routes` / `contract_month_routes` là định nghĩa và bản snapshot tháng (§14.2), `delivery_legs` là chặng thực tế của từng chuyến.

```text
delivery_legs(
  id, delivery_id, leg_no,
  from_type(warehouse|relay), from_id,
  to_type(relay|destination), to_id,
  carrier_id, temp_type, delivery_regime,
  is_final_leg,
  driver_id NULL, assign_scope(ops|carrier),
  assigned_by NULL, assigned_at NULL,
  picked_up_at NULL, picked_up_by NULL,
  snapshot_source(contract_month|contract), snapshot_at
)
```

```sql
UNIQUE(channel_id, leg_no)            -- contract_routes
UNIQUE(channel_id) WHERE is_final_leg
UNIQUE(month_channel_id, leg_no)      -- contract_month_routes
UNIQUE(month_channel_id) WHERE is_final_leg
UNIQUE(delivery_id, leg_no)           -- delivery_legs
UNIQUE(delivery_id) WHERE is_final_leg
```

Guards dùng chung cho cả ba bảng:

- `leg_no` liên tục từ 1, không đứt quãng.
- Leg 1 có `from_type = warehouse` và `from_id = channel.warehouse_id`.
- `from_id` của leg `n+1` bằng `to_id` của leg `n`.
- Đúng một leg có `is_final_leg = true`, và leg đó có `to_type = destination`.
- Không trung chuyển: 1 leg. Có trung chuyển: 2 legs (Phase 2).

Riêng `delivery_legs`:

- Sinh khi materialize, từ `contract_month_routes` nếu contract month tồn tại, ngược lại từ `contract_routes`; nguồn ghi vào `snapshot_source` (§8.1).
- `to_id` của leg cuối là `deliveries.site_id` đã snapshot.
- Là **snapshot bất biến**: sửa `contract_routes` không ảnh hưởng delivery đã tạo.
- Sửa route của một chuyến là sửa chính `delivery_legs` của chuyến đó kèm audit (§15.13). **Không có cột override riêng.**
- Duplicate copy toàn bộ legs nhưng **không** copy `driver_id`, `assigned_by`, `assigned_at` (§9.4).
- `contract_routes` và `contract_month_routes` **không** có `driver_id`: gán driver chỉ tồn tại ở mức delivery.

### 14.5. Master tables

```text
warehouses(
  id, name, slip_name, kana,
  warehouse_type(picking|relay|return), carrier_id, status,
  warehouse_code, branch_code, address_fields,
  pick_count_threshold, ship_order_lead_days, thomas_csv_unit
)

warehouse_staff(
  id, warehouse_id, role(main|sub),
  name, kana, email, tel
)

carriers(
  id, name, kind(self|outsourced), temp_types,
  service_weekdays,                     -- 2026-09-30: thứ nhận giao
  coolbag_no NULL, coolant_no NULL,     -- 2026-09-30: số túi giữ lạnh / đá giữ lạnh
  has_coolant_mgmt, has_vending, inquiry_url, status
)                                       -- cũ: có cột areas (4 vùng), bỏ 2026-09-30 → carrier_areas

carrier_areas(                          -- 2026-09-30: khu vực phục vụ theo tỉnh/thành
  carrier_id, prefecture_code
)

carrier_rates(                          -- 2026-09-30: bảng giá, nhập bằng CSV
  id, carrier_id, prefecture_code,
  pay_amount, regional_surcharge NULL,  -- phụ phí vùng: ops nhập tay, không tự tính
  note, updated_by, updated_at
)

delivery_inquiries(                     -- 2026-09-30: hỏi giao hàng (đơn vị gửi yêu cầu báo giá)
  id, site_id NULL, prospect_name NULL, -- đang thương lượng thì chưa có site
  postal_code NULL, prefecture_code, city NULL, address_line NULL,
  temp_types, note, created_by, created_at
)

carrier_quote_responses(                -- 2026-09-30: mỗi carrier được gửi yêu cầu = 1 dòng
  id, inquiry_id, carrier_id, requested_at,
  result(available|unavailable) NULL,   -- NULL = chưa trả lời
  monthly_fee NULL, comment NULL,
  relay_warehouse_id NULL,              -- hub đối tác đề xuất (warehouses loại relay)
  responded_by NULL, responded_at NULL
)

carrier_quote_attachments(              -- 2026-09-30: file đính kèm của câu trả lời
  id, response_id, file_path, uploaded_by, created_at
)

products(
  id, code, name, temp_type, pack_size,
  shelf_life_days, unit_price, description, status
)

product_warehouses(
  id, product_id, warehouse_id, status
)
```

```sql
UNIQUE(carrier_id, prefecture_code)   -- carrier_areas
UNIQUE(carrier_id, prefecture_code)   -- carrier_rates
```

Bảng carrier / hỏi giao hàng (2026-09-30) 〔要件シート 行28・39・41・44・53・57・78・決定_要件シート一部反映_回答_20260930〕: quy tắc ở §3.2. **Không có bảng chat.** `carrier_quote_responses`: đối tác chỉ sửa dòng của công ty mình; thời hạn hiệu lực và trả lời lại: 要確認 (chưa có cột).

### 14.6. Delivery

```text
deliveries(
  id,
  shipping_plan_id,
  contract_id,
  order_id NULL,
  lead_time NULL,
  site_id,
  delivery_date,
  shipped_date,
  status,
  locked_at NULL,
  locked_source(ship_order_sent),
  parent_delivery_id NULL,
  branch_seq NULL,
  duplicate_type(remainder|redelivery|alternative|trouble_pending|return) NULL,
  creation_source(materialize|ops_duplicate|trouble_auto),
  source_trouble_report_id NULL,
  source_trouble_delivery_id NULL,
  schedule_confirmed,
  quantity_confirmed,
  change_request_status,
  address_snapshot,
  return_to_warehouse_id NULL,
  destination_name,
  delivery_condition_snapshot,
  temp_type,
  planned_qty,
  delivered_qty,
  delivered_at,
  delivery_regime,
  service_form,
  completion_source(reported|presumed|customer),
  freight_billable,
  freight_bill_reason NULL,
  coolbag_no,
  coolant_no,
  cash_expected_amount,
  cash_collected_amount,
  note,
  internal_memo NULL                    -- 2026-09-30: memo nội bộ của ops
)
```

```sql
UNIQUE(shipping_plan_id)
CHECK(branch_seq IS NULL OR branch_seq BETWEEN 1 AND 9)
UNIQUE(source_trouble_delivery_id)
  WHERE creation_source = 'trouble_auto' AND status <> '取消'
```

- Delivery materialize bình thường có `creation_source=materialize`, `schedule_confirmed=true`, `quantity_confirmed` theo milestone finalize.
- Child do ops tạo có `creation_source=ops_duplicate`; child do hệ thống tạo lúc đăng ký trouble có `creation_source=trouble_auto` (đổi tên từ `trouble_timeout`, 2026-09-29).
- `internal_memo` (2026-09-30) 〔要件シート 行164・決定_要件シート一部反映_回答_20260930〕: memo nội bộ do ops ghi cho từng delivery. **Chỉ trả cho ops** — không trả trong API của web doanh nghiệp.
- `source_trouble_delivery_id` = delivery phát sinh trouble (có thể là parent hoặc một child — §9.4). Unique ở trên bảo đảm **mỗi delivery phát sinh trouble chỉ có một auto-child còn sống**, dù có nhiều trouble report hoặc retry. `source_trouble_report_id` giữ report đầu tiên đã tạo child, chỉ để tra cứu.

### 14.7. Delivery child tables

```text
delivery_receive_windows(
  id, delivery_id, from_time, to_time, sort_order, snapshot_at
)

delivery_tracking_numbers(
  id, delivery_id, tracking_no, carrier_id,
  issued_by(carrier_csv|manual|api|es_generated),
  box_no NULL, box_total NULL,
  is_relay_leg, status(active|voided),
  voided_reason NULL, created_at
)

trouble_types(
  code PK(qty_diff|wrong_delivery|damage|absent|delay|other),
  name, default_action, auto_child, sort_order, status
)

trouble_app_reasons(
  app_reason_raw PK, type_code NULL
)

trouble_reports(
  id, delivery_id,
  type_code NULL,
  reported_by, note, reported_at, app_reason_raw NULL,
  resolution(full|partial|partial_no_resend|redelivery|same_day_revisit|stop) NULL,
  resolved_at, resolved_by, resolution_reason
)

delivery_attachments(
  id, delivery_id, kind, audience(carrier|customer),
  file_path, uploaded_by, created_at
)

delivery_lines(
  id, delivery_id, product_id,
  planned_qty, delivered_qty,
  substituted_from_product_id NULL,
  stock_before NULL, stock_after NULL,
  disposed_qty NULL, note
)
```

```sql
UNIQUE(delivery_id, product_id)
```

`delivery_lines` là chi tiết theo sản phẩm của một chuyến (2026-09-23):

- Chứa số dự kiến / số đã giao theo sản phẩm, tồn thực trước và sau khi trưng bày, và số huỷ.
- Driver app ghi `stock_before` / `stock_after` / `disposed_qty` khi báo cáo giao hàng.
- **Giao một phần**: delivery con (duplicate) giữ `delivery_lines` của riêng nó; **không** sửa chi tiết của delivery cha.
- Không nhầm với `contract_delivery_lines` (§14.2) — đó là dòng cấu hình giao hàng của hợp đồng.

`delivery_attachments` (2026-09-30) 〔要件シート 行164・決定_要件シート一部反映_回答_20260930〕: ảnh báo cáo nghiệp vụ được thêm bởi driver **và cả ops** (từ màn chi tiết delivery; `uploaded_by` = user ops), kể cả sau khi đã giao; ghi audit. Xem ảnh dạng modal lướt trái / phải là việc của UI.

`trouble_types` / `trouble_app_reasons` (2026-09-29):

- `trouble_types.auto_child` quyết định có tạo auto-child ngay khi đăng ký report hay không (§13.2.1). Giá trị ban đầu: `wrong_delivery`, `absent`, `damage` = true; `qty_diff`, `delay`, `other` = false. Ops logistics sửa được.
- `trouble_app_reasons` map lựa chọn của driver app sang `type_code`. 「商品不足・誤配送」 map sang `NULL` (chưa xác định, ops phân loại sau).
- `trouble_reports.type_code` NULL = chưa xác định. `auto_duplicate_due_at` **đã bỏ** (2026-09-29).
- `resolved_by` có thể là system (tự resolve `delay`, §13.2.3).

Tracking number unique trong phạm vi carrier.

### 14.8. Ship order

```text
ship_order_exports(
  id, warehouse_id, window_start NULL, window_end NULL,
  scope(window|catch_up), file_name, row_count,
  exported_by, exported_at
)
-- Xuất CSV thủ công từ màn hình (§19.6). Không tạo revision, không lock.

ship_orders(
  id, delivery_id, warehouse_id,
  rev, qty, payload_hash,
  window_start, window_end, send_target_date,
  export_unit, export_file_ref NULL,
  sent_at, sent_by, is_zeroed,
  send_status(pending|ok|failed),
  sent_ok_at NULL,
  retry_count, error_detail NULL
)
```

```sql
UNIQUE(delivery_id, rev)
```

### 14.9. Billing

```text
invoices(
  id, contract_month_id, billing_month,
  billing_type(advance|settlement),
  payment_due_date, issued_at, billone_ref, status
)

invoice_lines(
  id, invoice_id,
  line_type(charge|adjustment),
  adjustment(refund|offset) NULL,
  plan_rate_generation, qty, amount, note
)
```

```sql
UNIQUE(contract_month_id, billing_type, payment_due_date)
```

### 14.10. Site và driver master

```text
corporations(
  id, name, kana, status, billone_customer_ref, note
)

sites(
  id, corporation_id, name, kana,
  postal_code, address_fields, tel, contact_name,
  status, effective_from, effective_to
)

-- 【案】phạm vi xem của web doanh nghiệp (#55)
corporate_users(
  id, corporation_id, role(corp_admin|site_staff),
  name, email, status
)

corporate_user_sites(
  corporate_user_id, site_id   -- chỉ dùng cho site_staff
)

drivers(
  id, carrier_id, name, kana, tel, email,
  login_id, employment_type(self|partner),
  area_codes, status
)
```

Ràng buộc:

- `contracts.site_id` và `site_receive_windows.site_id` tham chiếu `sites.id`.
- `deliveries.site_id` giữ `sites.id` của điểm giao tại thời điểm materialize; địa chỉ và điều kiện vẫn dùng snapshot trong `deliveries`. Tên cột thống nhất với `contracts.site_id` và `site_receive_windows.site_id` (2026-09-23).
- `delivery_legs.driver_id` tham chiếu `drivers.id`; driver phải thuộc carrier của chính leg đó (§15.9).
- Thay đổi site master không ảnh hưởng delivery đã tạo (§3.4).

### 14.11. Request, override và review

```text
change_requests(
  id, contract_id,
  delivery_id NULL, shipping_plan_id NULL,
  request_type(date_change|route_change|qty_change|cancel),
  requested_by_type(customer|sales|ops), requested_by, requested_at,
  current_value_json, requested_value_json, reason,
  status(pending|proposed|approved|rejected|withdrawn),
  decided_by NULL, decided_at NULL, decision_reason NULL
)

delivery_overrides(
  id, contract_id,
  line_no NULL, channel_id NULL,
  cycle_id NULL, occurrence_key NULL,
  override_type(absolute_date|skip),
  delivery_date NULL,
  source_request_id NULL,
  approved_by, approved_at,
  status(active|cancelled),
  cancelled_by NULL, cancelled_at NULL, cancel_reason NULL
)

site_receive_blocks(
  id, site_id, date_from, date_to, reason,
  source(request|ops), created_by, created_at,
  status(active|cancelled)
)

review_items(
  id,
  kind(
    plan_ungeneratable|plan_recheck|date_review|
    qty_missing|qty_mismatch|
    ship_order_failed|ship_order_diff|
    tracking_anomaly|shipment_result_ng|
    missing|assignment_missing|trouble_open|trouble_auto_child_pending|
    billing_gap|import_error|
    shelf_life_warning|change_request_due
  ),
  target_type(shipping_plan|delivery|contract_month|invoice|import),
  target_id,
  business_date, detail_json,
  status(open|resolved|ignored),
  first_detected_at, last_detected_at,
  resolved_by NULL, resolved_at NULL, resolution_note NULL
)
```

```sql
UNIQUE(kind, target_type, target_id) WHERE status = 'open'
```

Ràng buộc:

- Một delivery chỉ có tối đa một `change_requests` ở `pending` hoặc `proposed`.
- `deliveries.change_request_status` là bản denormalize của request đang mở; không có request mở thì để NULL.
- `shipping_plans.override_id` tham chiếu `delivery_overrides.id`. Regenerate áp dụng override `active` theo thứ tự `approved_at` (§7.2).
- Override và receive block bị hủy bằng `status = cancelled`, không hard delete (§9.1).
- Batch chỉ **UPSERT** `review_items`; phát hiện lại cùng một vấn đề chỉ cập nhật `last_detected_at`.

### 14.12. Menu, order và price master

```text
menus(
  id, cycle_month,
  menu_open_date, order_start_date, order_close_date,
  status(draft|published), published_at
)

order_quantities(
  id, contract_month_id, contract_id,
  line_no, channel_id, cycle_id, occurrence_key,
  confirmed_qty, source(menu_order|ops_manual),
  confirmed_at, imported_at
)

plan_rates(
  id, plan_code, generation, unit_price,
  effective_from, effective_to, status
)

-- 【案 — 2026-09-29, 28-147〜157, chờ dev xác nhận】
plan_course_delivery(                   -- số lần chuẩn theo nhiệt độ (28-154)
  plan_code, course(standard|lite), temp_type(chilled|frozen),
  monthly_cap, std_delivery_count       -- std_delivery_count ≥ 1
)
plan_subsidy(                           -- phần doanh nghiệp chịu (28-147〜149)
  plan_code, subsidy_per_meal_incl_tax, -- mặc định 100
  subsidy_tax_rate_id, base_tax_rate_id -- FK tax_rates (mặc định 8% / 10%)
)
tax_rates(id, rate, label, status)       -- master thuế suất (dropdown)
contract_month_plan_snapshot(           -- snapshot lúc sinh contract month
  contract_month_id, plan_code, generation,
  monthly_cap_chilled, monthly_cap_frozen,
  std_delivery_chilled, std_delivery_frozen NULL,
  subsidy_amount_excl_tax, base_amount_excl_tax,
  subsidy_tax_rate, base_tax_rate,
  welfare_split bool                    -- 「福利厚生の適用」: true → hoá đơn 2 dòng
)
```

```sql
UNIQUE(contract_id, line_no, channel_id, cycle_id, occurrence_key)  -- order_quantities
UNIQUE(plan_code, generation)                                       -- plan_rates
UNIQUE(plan_code, course, temp_type)                                -- plan_course_delivery
UNIQUE(contract_month_id)                                           -- contract_month_plan_snapshot
```

Ràng buộc:

- `delivery_cycles` copy `menu_open_date` / `order_start_date` / `order_close_date` từ `menus` của cùng `cycle_month` và set `marker_source = menu`. Không có `menus` `published` thì dùng mốc provisional (§8.3).
- `order_finalize` lấy `confirmed_qty` từ `order_quantities` theo unique key của plan (§8.2).
- `contract_months.price_revision_gen` giữ `plan_rates.generation` đã snapshot; `invoice_lines.plan_rate_generation` dùng lại giá trị đó, không tra lại master.

---

### 14.13. Snapshot tháng: tồn kho, báo cáo kiểm kê, quyết toán thực tế (追補7, 2026-09-29)

Quyết định: 申請まわり 28-121・28-125 (bản tiếng Nhật). Màn hình ops (在庫管理 / 実績精算 / 請求の確定) xem được **các tháng trước**; các tháng đã xác nhận **chỉ đọc từ snapshot**, không tính lại từ dữ liệu hiện tại.

**Quy tắc**

| Mục | Quy tắc |
|---|---|
| Kỳ | Theo `cycle_month` của contract month; kỳ tồn kho = ngày 21 tháng trước ~ ngày 20 tháng đó. |
| Điều chỉnh tồn kho (在庫調整) | Ops nhập trực tiếp, **không có duyệt**, **áp dụng ngay** vào tồn kho tính toán (`calc_qty`) khi lưu. Chỉ nhập được cho tháng mà quyết toán (`settlement_snapshots`) **chưa xác nhận**. Lý do bắt buộc. Có thể nhập nhiều điểm giao cùng lúc (cùng một lý do). |
| Sau khi xác nhận | Không sửa điều chỉnh của tháng đó. Sai sót phát hiện sau → dòng `invoice_lines.line_type = adjustment` thuộc `settlement` của **tháng sau** (§13.7). |
| Báo cáo kiểm kê (棚卸報告) | Một bản ghi mỗi điểm giao × tháng; số đếm theo sản phẩm. Chưa báo cáo tới ngày 25 → vẫn xác nhận được, phát sinh phí hành chính (theo billing). |
| Xác nhận quyết toán | Khi xác nhận: ghi `monthly_stock_snapshots` (từng sản phẩm) và `settlement_snapshots` (tổng) trong **một transaction**. `prev_counted_qty` của tháng sau = `counted_qty` của snapshot tháng này. |
| Huỷ xác nhận | Chỉ khi invoice của contract month đó chưa tạo. Set `unconfirmed_at` cho snapshot cũ (không xoá); xác nhận lại → snapshot mới. Màn hình đọc snapshot có `unconfirmed_at IS NULL`. |

```text
stock_counts(                           -- 棚卸報告 (在庫点検の申告)
  id, site_id, contract_month_id, cycle_month,
  period_from, period_to,
  status(not_filed|filed),
  filed_at NULL, filed_by NULL, filed_via(driver_app|corp_web) NULL
)
stock_count_lines(id, stock_count_id, product_id, counted_qty)

stock_adjustments(                      -- 在庫調整 (ops, không duyệt, áp dụng ngay)
  id, site_id, cycle_month, product_id,
  delta_qty, reason, bulk_id NULL,      -- bulk_id: nhập nhiều điểm giao cùng lúc
  created_by, created_at, cancelled_at NULL
)

monthly_stock_snapshots(                -- ghi khi xác nhận quyết toán
  id, contract_month_id, site_id, cycle_month, product_id,
  prev_counted_qty, delivered_qty, sold_qty, disposed_qty, adjusted_qty,
  calc_qty, counted_qty NULL, loss_qty, unit_price, loss_amount,
  snapshot_at, unconfirmed_at NULL
)

settlement_snapshots(
  id, contract_month_id, cycle_month,
  sales_amount, loss_amount, deductible_amount, over_amount,
  price_adjust_diff, admin_fee, settlement_amount,   -- không có tiền trợ cấp suất ăn: 企業負担額 đã nằm trong giá plan (28-134)
  cash_expected_amount, cash_collected_amount, cash_diff_amount,   -- 28-135: chỉ phần trả tiền mặt trong app
  confirmed_at, confirmed_by, unconfirmed_at NULL
)
```

```sql
UNIQUE(site_id, cycle_month)                                           -- stock_counts
UNIQUE(stock_count_id, product_id)                                     -- stock_count_lines
UNIQUE(contract_month_id, product_id) WHERE unconfirmed_at IS NULL     -- monthly_stock_snapshots
UNIQUE(contract_month_id) WHERE unconfirmed_at IS NULL                 -- settlement_snapshots
```

- `delivered_qty` lấy từ `delivery_lines.delivered_qty` của các delivery trong kỳ (§14.7); `sold_qty` từ dữ liệu bán hàng của app (ngoài phạm vi tài liệu này, chỉ nhận số tổng theo sản phẩm).
- Không còn bước xác nhận theo doanh nghiệp (法人確定, 28-123): xác nhận chỉ theo contract month.


## 15. API guards

### 15.1. Guard chung

Mọi mutation API phải:

1. Authenticate actor.
2. Authorize theo role và data scope.
3. Lock/read record hiện tại trong transaction.
4. Validate lifecycle.
5. Validate delivery status.
6. Validate business date/time.
7. Validate related master active.
8. Thực hiện idempotently.
9. Ghi audit log.

### 15.2. Permission matrix

| Action | Ops logistics | Ops CS | Sales | Customer | Partner | Driver |
|---|---:|---:|---:|---:|---:|---:|
| Save cycle/master | Có | Không | Không | Không | Không | Không |
| Edit contract delivery | Có | Không | Có | Không | Không | Không |
| Change date trước close | Có | Không | Không | Request | Không | Không |
| Approve/reject request | Có | Có | Không | Không | Không | Không |
| Cancel/stop/duplicate | Có | Không | Không | Không | Không | Không |
| Assign/reassign | Có | Không | Không | Không | Leg của công ty mình | Không |
| Xem delivery (site đối tác) | Tất cả | Tất cả | Tất cả | `corp_admin`: mọi site của công ty; `site_staff`: site được gán (#55) | Chỉ delivery có leg của công ty mình (§15.15) | Được assign |
| Report delivery/trouble | Proxy | Proxy | Không | Không | Trong công ty | Được assign |

### 15.3. Save cycle setting

Guard:

- Actor là ops logistics.
- A1 được normalize.
- Không sửa month đã fixed.
- Range hợp lệ.
- Pause hợp lệ.
- **Mỗi đợt pause có tổng ngày dừng (`normal` + `adjust` gắn với nó) chia hết cho 7**; chưa đủ thì từ chối lưu và trả về số ngày `adjust` còn thiếu.
- Warehouse references tồn tại.

Effect: save setting, generate cycle days, trigger rollout/recheck và ghi audit.

### 15.4. Change delivery date

Chỉ cho phép trước order close:

- Actor có quyền.
- Chưa tới `order_close_date`.
- Ngày mới vượt qua date validation.

Sau `order_close_date`: chỉ cho qua khi (1) hôm nay < `shipped_date` (ngày xuất hiện tại) − 0 ngày, tức là muộn nhất ngày trước ngày xuất, và ngày xuất mới ≥ ngày mai (2) ngày giao mới cùng `cycle_id` và cùng nửa (tuần A·B hoặc C·D) (3) request 1 record (4) có `reason`. Sai (1) → `DOMAIN_ORDER_CLOSED`; sai (2) → `DOMAIN_DATE_OUT_OF_RANGE` (【案】). Không đổi `warehouse_id`. Nếu ship order đã gửi thì tạo `ship_order_diff` và gửi lại bản mới. Lưu thành override `fix` (#63, 2026-09-29). (Cũ: sau order close luôn trả `DOMAIN_ORDER_CLOSED`, không có nhánh ngoại lệ cho ops.)

### 15.5. Approve request/cancel override

Approve guard:

- Actor ops logistics hoặc ops CS.
- Request pending/proposed.
- Target chưa locked.
- Ngày đề xuất hợp lệ.

Cancel override guard:

- Ops logistics.
- Reason bắt buộc.
- Target chưa locked.

Override bị cancel bằng trạng thái, không hard delete.

### 15.6. Materialize/finalize

Materialize guard:

- Plan `draft`.
- Đã tới `order_start_date`.
- Plan không ungeneratable.
- Chưa có delivery.

Finalize guard:

- Đã tới `order_close_date`.
- Marker là `menu`.
- Quantity hợp lệ.

### 15.7. Send ship order

Guard:

- Delivery đủ eligibility.
- Revision hợp lệ.
- Chưa nhận shipment result cho delivery này.
- Payload hash từ canonical payload.

Success: ghi success và lock nếu lần đầu. Failure: ghi failed, không lock.

### 15.8. Import tracking/shipment result

- Delivery tồn tại.
- Tracking không thuộc delivery khác.
- Carrier khớp với một leg trong `delivery_legs` của delivery đó.
- Delivery không ở `中止` hoặc `取消`.
- Tracking trước ship order success tạo anomaly, không lock.

### 15.9. Assign driver

- Actor là ops hoặc partner đúng scope.
- Leg có `delivery_regime` = `self` / `partner_driver` (leg `parcel_carrier` không assign — §13.1).
- Driver active và thuộc carrier phù hợp.
- Leg thuộc chính delivery đó (`delivery_legs.delivery_id`).
- Delivery chưa kết thúc.
- Cho phép sau lock.

### 15.10. Status transition

- Transition phải có trong bảng 12.2.
- Actor được phép thực hiện event.
- Required actual/trouble fields đầy đủ.
- Reason bắt buộc với `取消`, `中止` và resolution ngoại lệ.

### 15.11. Duplicate

- API duplicate thủ công yêu cầu actor ops logistics. Auto-child do hệ thống tạo lúc đăng ký/phân loại trouble (§13.2.1) với `actor_type=system`.
- Source là delivery published/locked.
- Depth bằng 0. **Ngoại lệ trouble ở child** (§9.4): nhận child làm source nội dung nhưng record mới gắn `parent_delivery_id` = parent của child.
- Branch tiếp theo không vượt 9.
- Duplicate type hợp lệ.
- Nếu delivery phát sinh trouble đã có auto-child còn sống (theo `source_trouble_delivery_id`), API phải reuse child đó và từ chối tạo child thứ hai (`DOMAIN_TROUBLE_CHILD_EXISTS`).

Tạo child và audit trong cùng transaction.

### 15.12. Resolve trouble

- Actor ops logistics.
- Delivery có ít nhất một trouble report chưa resolve; delivery giữ `出荷済`, `受取済` hoặc `納品済`. Auto-child nếu đã tạo phải đang `確認中`.
- **Resolve theo đơn vị delivery**: đóng mọi report chưa resolve của delivery trong cùng transaction (§13.2).
- Từ `納品済` chỉ cho resolution giao đủ; riêng `completion_source=presumed` cho thêm giao lại toàn bộ / không giao nữa (§13.2.2).
- `partial_no_resend`: không tạo child; auto-child nếu có → `取消`.
- Resolution hợp lệ.
- Actual quantity hợp lệ.
- Reason bắt buộc.
- Lock delivery, các trouble report chưa resolve và auto-child (nếu có) trong cùng transaction.
- Resolution partial/redelivery phải reuse auto-child, cập nhật quantity, `delivery_lines`, candidate date và `duplicate_type`.
- Resolution không cần giao lại phải chuyển auto-child sang `取消` với reason.
- Chỉ cho auto-child chuyển `出荷待` khi `schedule_confirmed=true` và `quantity_confirmed=true`.
- Resolve review item `trouble_open` và `trouble_auto_child_pending` trong cùng transaction.
- **Field bắt buộc theo resolution** (2026-09-29, #65 — UI 2 bước: chọn resolution → chỉ hiện field cần thiết). Mọi report `type_code = NULL` của delivery phải được phân loại trước khi resolve (thiếu → `VALIDATION_REQUIRED`).

  | resolution | Số lượng (`delivery_lines.delivered_qty`) | Child (reuse auto-child) | `freight_billable` | `resolution_reason` |
  |---|---|---|---|---|
  | `full` | bắt buộc (mặc định = số đã chốt); `substituted_from_product_id` tùy chọn | — | — | bắt buộc |
  | `partial` | bắt buộc; phần còn lại = chênh lệch → quantity của child | bắt buộc `candidate_date` | — | bắt buộc |
  | `partial_no_resend` | bắt buộc | — (auto-child → `取消`) | — | bắt buộc |
  | `redelivery` | — (tất cả 0) | bắt buộc `candidate_date` | bắt buộc (mặc định false) | bắt buộc |
  | `same_day_revisit` | — | — (auto-child → `取消`) | — | bắt buộc |
  | `stop` | — (tất cả 0) | — (auto-child → `取消`) | bắt buộc (mặc định false) | bắt buộc |

  Field không thuộc resolution đã chọn thì bỏ qua (không lưu).

### 15.12.1. Register / classify trouble (2026-09-29)

- Actor: driver được assign, partner trong công ty, hoặc ops (proxy).
- Delivery ở `出荷済`, `受取済` hoặc `納品済`.
- UI (#64, 2026-09-29): tab 「トラブル」 và nút 「トラブルを代理登録」 ở màn chi tiết **không hiển thị** khi delivery ở `予定` hoặc `出荷待` (child `確認中` vẫn hiển thị). Guard API giữ nguyên như trên.
- `type_code` lấy từ `trouble_app_reasons` (driver) hoặc ops chọn (proxy); có thể NULL.
- Trong cùng transaction: tạo report + UPSERT review `trouble_open` + nếu `trouble_types.auto_child = true` và chưa có auto-child còn sống thì tạo auto-child (§13.2.1) + UPSERT review `trouble_auto_child_pending` + audit.
- Ops phân loại lại (`type_code` từ NULL/khác sang loại `auto_child = true`) → tạo auto-child tại thời điểm đó nếu chưa có. Đổi sang loại `auto_child = false` **không** tự huỷ child đã tạo; ops xử lý khi resolve.

### 15.13. Sửa route của delivery

Không có cột override riêng: sửa route của một chuyến là sửa `delivery_legs` của chính chuyến đó.

Guard:

- Actor là ops logistics.
- Delivery không ở `納品済`, `中止` hoặc `取消`.
- Reason bắt buộc.
- Sau khi sửa, `delivery_legs` vẫn phải thỏa ràng buộc ở §14.4 (leg liên tục, đúng một final leg, leg cuối `to_type = destination`).
- Không đổi `warehouse_id` sau khi đã gửi ship order thành công; đổi kho xuất thì dùng cancel + duplicate.

Sau lock vẫn cho sửa carrier/driver của leg, nhưng phải tạo review item `ship_order_diff` để resend (§16.12).

Ghi audit cho từng leg thay đổi, kèm `before_json` / `after_json`.

### 15.14. Đổi địa chỉ điểm giao của một delivery

Cho phép đổi `address_snapshot` / `destination_name` của riêng một chuyến (2026-09-22).

Guard:

- Actor là ops logistics.
- Delivery không ở `納品済`, `中止` hoặc `取消`.
- Reason bắt buộc.

Khi delivery **đã có ship order gửi thành công**:

1. Tạo revision ship order mới với địa chỉ mới (§19.2).
2. Đánh dấu toàn bộ tracking hiện có là `voided` — phiếu cũ đã in sai địa chỉ.
3. Phát hành lại tracking sau khi revision mới được gửi thành công.
4. Không đổi `locked_at`.

Đổi `warehouse_id` vẫn cấm sau khi ship order đã gửi thành công; trường hợp đó dùng cancel + duplicate (§15.13).

---

### 15.15. Phạm vi dữ liệu của site đối tác (2026-09-29)

- Đối tác chỉ thấy delivery có **ít nhất một leg** mà `carrier_id` = công ty mình; chỉ thao tác trên leg của mình (leg 1: tới lúc nhận ở kho; leg 2: từ lúc nhận ở hub tới giao).
- Delivery đã materialize và qua `order_close_date`: trả đủ trường (tên site, địa chỉ, ngày giao, nhiệt độ, quantity, điều kiện giao, tracking).
- Plan (`draft`) và delivery trước `order_close_date`: chỉ trả **tới cycle tháng sau**, và chỉ `delivery_date`, tên site, `temp_type`, số chuyến; **không** trả quantity.

### 15.16. Chốt điểm giao (本登録) → bắt đầu sinh (2026-09-29, #52)

Guard:

- Actor là ops.
- Mọi tab bắt buộc của điểm giao đã lưu; route của từng delivery channel đã đủ (kho, carrier leg 1, lead time, pattern, slot — hub/leg 2 khi có trung chuyển).
- (2026-09-29, 追補6) Kho picking và số lần giao đã được nhập từ 「申込内容確認」 (trước đăng ký tạm); order / bộ vật tư ban đầu đã sinh lúc đăng ký tạm được gắn vào plan/delivery ở bước này (§4.8).
- Hợp đồng đang `provisional`.

Effect (trong cùng transaction với việc đổi `contracts.status` → `active`, set `confirmed_at` / `confirmed_by`):

1. Nếu đã qua `order_close_date` của `start_cycle_month` → dời `start_cycle_month` sang cycle kế tiếp và ghi audit.
2. Enqueue chạy ngay cho riêng hợp đồng này: `contract_monthly_generate` → `plan_rollout` → `delivery_materialize` (§16.1–16.3).
3. Lỗi ở bước sinh không rollback việc chốt; tạo review item `plan_recheck` để ops chạy lại.

## 16. Batch specification

Batch sử dụng daily catch-up: chọn mọi record đã qua milestone nhưng chưa xử lý.

### 16.1. `contract_monthly_generate`

- Chỉ hợp đồng thuộc §4.7 (không chạy cho `provisional`, `suspended`, `ended`), và chỉ từ `start_cycle_month`.
- Ngoài batch hằng ngày, chạy ngay cho riêng hợp đồng vừa chốt điểm giao (§15.16).
- Tạo contract month.
- Snapshot `contract_month_delivery_channels` và `contract_month_routes`.
- Snapshot price revision generation.
- Idempotency key: `contract_id + cycle_month`.

### 16.2. `plan_rollout`

Trigger hằng ngày, sau thay đổi cycle/contract ảnh hưởng draft, và **ngay khi chốt điểm giao** (§15.16).

Đối tượng: hợp đồng thuộc §4.7, từ `start_cycle_month`. Hợp đồng `provisional` không có plan nào.

Xử lý:

1. Chọn cycle range.
2. Sinh/regenerate draft.
3. Tính estimated quantity.
4. Dùng contract-month snapshot nếu có.
5. Áp dụng override.
6. UPSERT theo unique key.

Không sửa published/locked.

### 16.3. `delivery_materialize`

```text
lifecycle = draft
AND order_start_date <= business_date
AND delivery_id IS NULL
AND ungeneratable_reason IS NULL
AND contracts.status thuộc §4.7
```

Xử lý mỗi plan trong transaction riêng. Delivery và `delivery_legs` được tạo trong cùng transaction đó.

### 16.4. `order_finalize`

```text
order_close_date <= business_date
AND marker_source = menu
AND quantity_not_finalized
AND tồn tại order_quantities khớp unique key của plan
```

Update delivery hiện có. Plan đã tới `order_close_date` nhưng không có `order_quantities` thì tạo review item `qty_missing` và để nguyên delivery.

### 16.5. `plan_recheck`

Kiểm tra override, lead time, non-picking, warehouse/carrier active, published delivery bị ảnh hưởng và plan ungeneratable. Chỉ tạo review item; không sửa published/locked.

Bổ sung 2026-09-29: UPSERT `shelf_life_warning` (§3.3), `change_request_due` (§9.1.1) và `assignment_missing` cho leg cần assign chưa có driver khi `delivery_date − 3 ≤ business_date` (§13.1; đổi 2026-09-30, cũ: `delivery_date − 1 ≤ business_date`) 〔要件シート 行142・決定_要件シート一部反映_回答_20260930〕. Email cho đối tác chỉ gửi 2 lần: ngày `delivery_date − 3` và ngày `delivery_date − 1`.

### 16.6. `ship_order_send`

```text
delivery đủ điều kiện §10.2
AND (chưa có revision nào OR business_date >= send_target_date)
AND không tồn tại revision có send_status = ok
```

Xử lý:

1. Tính `window_start` / `window_end` / `send_target_date` theo §10.4.
2. Group theo `warehouse_id` + `warehouses.thomas_csv_unit`.
3. Tạo revision `pending`, sinh canonical payload và `payload_hash` (§19.1).
4. Gửi idempotent theo `(delivery_id, rev)`.
5. Thành công lần đầu → set `locked_at`, `locked_source = ship_order_sent` và plan lifecycle `locked` trong cùng transaction (§10.3).
6. Thất bại → `send_status = failed`, **không lock**; retry theo §16.14. Quá số lần retry tạo review item `ship_order_failed`.

Không chạy với delivery thuộc cycle có `marker_source = provisional` (§8.3).

### 16.7. `billing_issue`

- Chọn contract month đến billing milestone.
- Group theo billing type + payment due date.
- Tạo invoice idempotently.
- Tạo charge/adjustment lines.

### 16.8. `billing_gap_detect`

Phát hiện contract active thiếu contract month hoặc billing month thiếu invoice/line. Chỉ tạo review item.

### 16.8.1. ~~`trouble_auto_duplicate`~~ (đã bỏ 2026-09-29)

Batch này **không còn**. Auto-child được tạo ngay trong transaction đăng ký / phân loại trouble (§13.2.1, §15.12.1). Không có SLA, không có `auto_duplicate_due_at`.

### 16.9. `delivery_presume_complete`

```text
delivery_date < business_date
AND delivery_legs(is_final_leg).delivery_regime = parcel_carrier
AND status = 出荷済
AND NOT EXISTS unresolved trouble_report
```

Set `status=納品済`, `completion_source=presumed`.

### 16.10. `delivery_detect_missing`

```text
delivery_date < business_date
AND delivery_legs(is_final_leg).delivery_regime IN (self, partner_driver)
AND status IN (出荷済, 受取済)
AND NOT EXISTS unresolved trouble_report
```

Không đổi status; UPSERT missing-review item. Chạy sau presume-complete.

### 16.11. `tracking_anomaly_detect`

Chọn delivery có tracking nhưng không có successful ship order. Tạo anomaly-review item và không lock.

### 16.12. `ship_order_diff`

So payload canonical hiện tại với payload hash của revision success gần nhất. Nếu khác, tạo review item cần resend.

### 16.13. Job chain

```text
contract_monthly_generate
→ plan_rollout
→ delivery_materialize
→ order_finalize
→ ship_order_send
→ plan_recheck
```

- Job sau không chạy nếu job trước thất bại toàn cục.
- Lỗi một contract được cô lập bằng transaction.
- Billing và delivery-result jobs chạy độc lập. (`trouble_auto_duplicate` đã bỏ 2026-09-29.)

### 16.14. Retry, lock và log

- Retry lỗi tạm thời tối đa 3 lần với khoảng tăng dần.
- Job-level lock ngăn chạy trùng.
- Mọi batch idempotent.
- Log job name, start/end, business date, target/success/failure/skipped count, duration và error summary.

---

## 17. Transaction, concurrency và audit

### 17.1. Transaction boundaries

- Materialize: plan + delivery.
- Ship-order success: ship order + delivery lock + plan lifecycle.
- Status transition: delivery + actual/trouble + audit.
- Duplicate: parent link + child + audit.
- Đăng ký / phân loại trouble: trouble report + delivery lock + auto-child (nếu loại `auto_child = true`) + review items (`trouble_open`, `trouble_auto_child_pending`) + audit.
- Driver báo giao đủ khi chỉ có trouble `delay`: transition `→ 納品済` + resolve report `delay` + đóng review `trouble_open` + audit (§13.2.3).
- Resolve trouble (theo delivery): resolution của mọi report chưa resolve + status delivery + child update/cancel + review-item resolution + audit.
- Invoice issue: invoice + lines.

### 17.2. Concurrency

- Mutation quan trọng lock record hoặc kiểm tra version.
- Lifecycle/status đổi giữa read và write trả conflict.
- Unique constraints là lớp bảo vệ cuối cho idempotency.

### 17.3. Audit log

```text
id
target_type
target_id
action
before_json
after_json
reason NULL
actor_type
actor_id
created_at
correlation_id
```

Audit bắt buộc cho cycle/master/contract changes, date changes, override, ship order, lock, status, assignment, cancel/stop/duplicate, actual correction và billing adjustment.

---

## 18. Error codes

| Code | Ý nghĩa |
|---|---|
| `DOMAIN_INVALID_TRANSITION` | Lifecycle/status transition không hợp lệ |
| `DOMAIN_DELIVERY_LOCKED` | Delivery đã lock |
| `DOMAIN_ORDER_CLOSED` | Action bị cấm sau order close |
| `DOMAIN_DATE_OUT_OF_RANGE` | 【案】Ngày mới ngoài phạm vi cho phép sau order close (khác cycle / khác nửa A·B–C·D) — #63 |
| `DOMAIN_REASON_REQUIRED` | Thiếu reason bắt buộc |
| `DOMAIN_PLAN_UNGENERATABLE` | Không thể sinh plan |
| `DOMAIN_PROVISIONAL_MARKER` | Action bị chặn vì provisional marker |
| `DOMAIN_DUPLICATE_NOT_ALLOWED` | Source không đủ điều kiện duplicate |
| `DOMAIN_TROUBLE_CHILD_EXISTS` | Delivery phát sinh trouble đã có auto-child còn sống; phải reuse thay vì tạo thêm |
| `DOMAIN_TROUBLE_CHILD_UNCONFIRMED` | Auto-child chưa chốt date/quantity nên không thể chuyển `出荷待` |
| `DOMAIN_BRANCH_LIMIT` | Vượt branch limit |
| `DOMAIN_TRACKING_CONFLICT` | Tracking thuộc delivery khác |
| `DOMAIN_DRIVER_SCOPE` | Actor/driver ngoài scope |
| `DOMAIN_ROUTE_INVALID` | Route/final leg không hợp lệ |
| `DOMAIN_MASTER_INACTIVE` | Master liên quan không active |
| `DOMAIN_CONCURRENT_MODIFICATION` | Concurrent update conflict |

---

## 19. Giao diện ngoài

### 19.1. Chỉ thị xuất kho gửi THOMAS

Canonical payload của một delivery. Thứ tự trường cố định và được dùng để tính `payload_hash`.

| Trường | Nguồn |
|---|---|
| `ship_order_no` | `ship_orders.id` + `rev` |
| `warehouse_code` | `warehouses.warehouse_code` |
| `branch_code` | `warehouses.branch_code` |
| `picking_date` | `shipping_plans.picking_date` |
| `delivery_date` | `deliveries.delivery_date` |
| `delivery_id` | `deliveries.id` — khóa đối chiếu khi nhận kết quả |
| `destination_name` / `address_snapshot` / `tel` | snapshot trong `deliveries` |
| `temp_type` | `deliveries.temp_type` |
| `service_form` / `delivery_regime` | `deliveries.service_form` và `delivery_legs` có `is_final_leg` |
| `carrier_code` | `delivery_legs.carrier_id` của `leg_no = 1` |
| `product_code` / `qty` | dòng hàng của delivery |
| `receive_windows` | `delivery_receive_windows` theo `sort_order` |
| `delivery_condition` | `delivery_condition_snapshot` |
| `is_zeroed` | cờ hủy (§19.2) |

Chuẩn hóa trước khi hash: trim khoảng trắng, ngày ở dạng `YYYY-MM-DD`, số không có dấu phân cách, trường rỗng là chuỗi rỗng.

- Một file cho mỗi `warehouse_id` + `warehouses.thomas_csv_unit`; tên file chứa `business_date` và `rev`.
- `warehouse_code` dùng chính ID kho dạng `WH00001`.
- **Layout vật lý (thứ tự cột, encoding, ký tự phân cách, header) theo định nghĩa của THOMAS và cần xác nhận với vendor trước khi implement.** Bảng trên là tập trường tối thiểu bắt buộc phải có.
- **Cách làm trong lúc chờ vendor (2026-09-29):** implement bằng tập trường tối thiểu ở trên và **tách riêng tầng xuất file** (thứ tự cột, tên cột, header, encoding) để chỉ cần thay tầng này khi nhận layout của THOMAS. Nếu THOMAS không nhận UTF-8 thì **chuyển sang Shift_JIS ở tầng xuất**. Huỷ vẫn dùng revision `qty = 0`, kể cả khi THOMAS có I/F huỷ.

### 19.1.1. Thông tin gửi Yamato (tạm — chờ Yamato xác nhận, 2026-09-29)

- Giữ tại văn phòng (営業所止め): người nhận = **công ty đối tác đến nhận**; ghi tên site và delivery No vào ô ghi chú (記事).
- Ngày giao dự kiến = **ngày tới văn phòng Yamato** (tính từ lead time tham khảo của leg 1).
- CSV của THOMAS không có cột cần cho vận đơn Yamato → **xuất thêm một CSV riêng cho vận đơn**.

### 19.2. Hủy và sửa sau khi đã gửi

- Không dùng I/F hủy riêng. Hủy và sửa đều thực hiện bằng **revision mới**.
- Hủy → revision mới với `qty = 0` và `is_zeroed = true`.
- Sửa số lượng hoặc nội dung → revision mới mang giá trị mới.
- **Đổi địa chỉ điểm giao → revision mới, tracking cũ chuyển `voided` và phát hành lại** (§15.14).
- Resend chỉ được cho tới khi nhận shipment result của chuyến đó.
- Revision mới **không** thay đổi `locked_at` (§10.3).
- `ship_order_diff` (§16.12) so payload canonical hiện tại với payload của revision `ok` gần nhất và tạo review item cần resend khi lệch.

### 19.3. Import tracking number

Nguồn: file từ hãng vận chuyển. Mỗi thùng một dòng.

| Trường | Bắt buộc | Ghi chú |
|---|---|---|
| `delivery_id` | Có | Khóa đối chiếu, lấy từ payload đã gửi |
| `tracking_no` | Có | |
| `carrier_code` | Có | Phải khớp carrier của một leg |
| `box_no` / `box_total` | Không | Dùng để hiển thị số thùng |
| `shipped_at` | Không | |

Xử lý từng dòng:

| Điều kiện | Kết quả |
|---|---|
| `delivery_id` không tồn tại | Từ chối dòng |
| `tracking_no` đã thuộc delivery khác | Từ chối dòng, `DOMAIN_TRACKING_CONFLICT` |
| `tracking_no` đã thuộc chính delivery đó | Bỏ qua, coi là thành công (idempotent) |
| `carrier_code` không khớp leg nào của delivery | Từ chối dòng |
| Delivery ở `中止` hoặc `取消` | Từ chối dòng |
| Chưa có ship order gửi thành công | Nhận dòng, **không lock**, tạo `tracking_anomaly` (§16.11) |

Import tracking không thay đổi delivery status.

### 19.4. Import shipment result

| Trường | Bắt buộc |
|---|---|
| `delivery_id` | Có |
| `shipped_date` | Có |
| `result_code(ok\|ng)` | Có |
| `shipped_qty` | Không |
| `note` | Không |

| Điều kiện | Kết quả |
|---|---|
| `ok` và delivery đang `出荷待` | `出荷済`, set `shipped_date` |
| `ok` và delivery không ở `出荷待` | Bỏ qua, ghi log (idempotent) |
| `ng` | Không đổi status, tạo review item `shipment_result_ng` |
| `shipped_qty` khác `planned_qty` | Tạo review item `qty_mismatch`, không tự sửa quantity |

### 19.5. Quy tắc chung cho import

- Mỗi file có `import_id`. Chạy lại cùng file không tạo dữ liệu trùng.
- Xử lý theo từng dòng; một dòng lỗi không làm hỏng cả file.
- Kết quả import ghi số dòng nhận / bỏ qua / lỗi và lý do từng dòng; lỗi tạo review item `import_error`.
- Mọi thay đổi do import sinh ra đều ghi audit với `actor_type = system` và `correlation_id = import_id`.

### 19.6. Nút xuất / nhập CSV trên màn hình (2026-09-29, #53)

Màn hình 「出荷指示・取込」 (chỉ ops logistics):

| Nút | Xử lý |
|---|---|
| Xuất CSV chỉ thị xuất kho (THOMAS) | Chọn kho + phạm vi (cửa sổ 2 tuần / phần bổ sung). Xuất canonical payload hiện tại (§19.1) theo tầng xuất file. **Không phải gửi**: không tạo revision, không đổi `send_status`, **không lock** (§9.3). Ghi `ship_order_exports` + audit |
| CSV ở từng dòng lịch sử gửi | Tải lại đúng file của revision đó (`ship_orders.export_file_ref`) |
| Xuất CSV vận đơn (Yamato) | Theo §19.1.1 (tạm) |
| Nhập CSV thực tế xuất kho (THOMAS) | Xử lý như §19.4 + §19.5 |
| Nhập CSV số vận đơn | Xử lý như §19.3 + §19.5 |
| Mẫu (thực tế xuất kho / số vận đơn) | Tải file mẫu: dòng tiêu đề + dòng ví dụ |
| Dòng lỗi (ở lịch sử nhập) | Tải các dòng bị từ chối: số dòng, delivery No, lý do |

- Encoding Shift_JIS ở tầng xuất (§19.1). Thứ tự / tên cột là tạm cho tới khi nhận layout của THOMAS.
