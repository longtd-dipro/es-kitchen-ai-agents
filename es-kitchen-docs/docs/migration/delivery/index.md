# Giao Hàng

## Files

| File | Records | Download |
|---|---|---|
| `csv_shipping_schedule` | 3.581 | [↓ GitHub](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/csv_shipping_schedule.json) |
| `scraped_deliveries` | 3.350 | [↓ GitHub](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_deliveries.json) |
| `scraped_deliverers` | 36 | [↓ GitHub](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_deliverers.json) |
| `scraped_drivers` | 212 | [↓ GitHub](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_drivers.json) |
| `scraped_hubs` | 206 | [↓ GitHub](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_hubs.json) |
| `scraped_deliverer_deliveries` | 1.167 | [↓ GitHub](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_deliverer_deliveries.json) |
| `scraped_collect_payment` | 58 | [↓ GitHub](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_collect_payment.json) |

---

## csv_shipping_schedule — 3.581 records

Kế hoạch giao hàng đến từng công ty theo từng đợt trong tháng.

| Field | Type | Mô tả |
|---|---|---|
| `delivery_date` | `YYYY-MM-DD` | Ngày xuất kho/giao |
| `arrive_date` | `YYYY-MM-DD` | Ngày dự kiến nhận tại công ty |
| `menu_ym` | `YYYY-MM` | Tháng menu |
| `delivery_count` | `float` | Tổng số đợt giao |
| `delivery_round` | `float` | Đợt giao này (1, 2, ...) |
| `total_items` | `float` | Tổng số suất trong chuyến này |
| `contract_plan_id` | `string` | ID hợp đồng `CP#####` |
| `customer_name` | `string` | Tên công ty nhận |
| `plan_name` | `string` | Tên plan |
| `plan_fee` | `float` | Phí hợp đồng (JPY) |
| `delivery_company` | `string` | Công ty vận chuyển: `ヤマト運輸` / `自社便` |
| `delivery_type` | `string` | Loại: `COOL便` / `ES配送` |
| `delivery_note` | `string\|null` | Ghi chú giao hàng |
| `delivery_name` | `string` | Tên người/đơn vị nhận |
| `section` | `string` | Phòng ban nhận |
| `person_name` | `string` | Người nhận hàng |
| `postal_code` | `string` | Mã bưu chính |
| `prefecture` | `string` | Tỉnh |
| `city` | `string` | Thành phố/quận |
| `address` | `string` | Địa chỉ chi tiết |
| `tel` | `string` | *(anonymized: `000-0000-0000`)* |

---

## scraped_deliveries — 3.350 records

> **File lớn (~27 MB).** Dữ liệu thực thi từng chuyến giao: tài xế, công ty vận chuyển, trạng thái, ảnh xác nhận.

### Thông tin chuyến giao

| Field | Type | Mô tả |
|---|---|---|
| `DeliveryNo` | `string` | Số chuyến giao `D######` |
| `Ym` | `string` | Tháng (YYYY-MM-DD dạng end-of-month) |
| `Status` | `string` | `1` = mới / `2` = đang giao / `3` = hoàn thành |
| `StatusName` | `string` | Tên trạng thái |
| `DeliveryStatus` | `string` | Trạng thái giao chi tiết hơn |
| `DeliveryStatusName` | `string` | Tên trạng thái giao |
| `CargoName` | `string` | Tên hàng hóa, ví dụ `冷蔵総菜` |
| `CargoNum` | `int` | Số kiện hàng |
| `CargoType` | `string` | Loại hàng |
| `CoolType` | `string` | Loại giữ lạnh |
| `CoolTypeName` | `string` | `COOL便` / `ES配送` |
| `SlipNo` | `string\|null` | Số phiếu giao hàng (ヤマト slip number) |

### Tài xế & công ty vận chuyển

| Field | Type | Mô tả |
|---|---|---|
| `DriverId` | `string\|null` | ID tài xế nội bộ (→ `scraped_users` IsDriver=true) |
| `DriverName` | `string\|null` | Tên tài xế |
| `DelivererId` | `string\|null` | ID công ty vận chuyển ngoài |
| `DelivererName` | `string\|null` | Tên công ty vận chuyển |
| `DeliveryCorpKbn` | `string` | Mã loại vận chuyển |
| `DeliveryCorpKbnName` | `string` | `ヤマト運輸` / `福山通運` / `自社便` |
| `IsEsDelivery` | `bool` | Là tự giao (自社便) không |
| `DeliveryKbn` | `string` | Phân loại giao |
| `DeliveryKbnName` | `string` | `COOL便` / `ES配送` |

### Địa chỉ khách hàng (người gửi)

| Field | Type | Mô tả |
|---|---|---|
| `CustomerPlanId` | `string` | ID hợp đồng `CP#####` |
| `CustomerName` | `string` | Tên công ty |
| `CustomerId` | `string` | ID khách hàng `CU#####` |
| `CustomerPost` | `string` | Mã bưu chính |
| `CustomerPref` | `string` | Tỉnh |
| `CustomerCity` | `string` | Thành phố |
| `CustomerAddress` | `string` | Địa chỉ |
| `CustomerFullAddress` | `string` | Địa chỉ đầy đủ |
| `CustomerSection` | `string` | Phòng ban |
| `CustomerPerson` | `string` | Người liên hệ |
| `CustomerTel` | `string` | *(anonymized)* |

### Địa chỉ giao hàng (người nhận)

| Field | Type | Mô tả |
|---|---|---|
| `DeliveryName` | `string` | Tên người nhận |
| `DeliveryId` | `string` | ID địa chỉ nhận |
| `DeliveryPost` | `string` | Mã bưu chính nhận |
| `DeliveryPref` | `string` | Tỉnh nhận |
| `DeliveryCity` | `string` | Thành phố nhận |
| `DeliveryAddress` | `string` | Địa chỉ nhận |
| `DeliveryFullAddress` | `string` | Địa chỉ đầy đủ nhận |
| `DeliverySection` | `string` | Phòng ban nhận |
| `DeliveryPerson` | `string` | Người nhận |
| `DeliveryTel` | `string` | *(anonymized)* |

### Lịch & thời gian

| Field | Type | Mô tả |
|---|---|---|
| `SendEstimateDate` | `string` | Ngày xuất kho dự kiến |
| `DeliveryEstimateDate` | `string` | Ngày giao dự kiến |
| `ArriveEstimateDate` | `string` | Ngày nhận dự kiến |
| `EsDeliveryDate` | `string\|null` | Ngày giao thực tế (tự giao) |
| `DeliveryTime` | `string\|null` | Khung giờ giao |

### Kho & xác nhận giao

| Field | Type | Mô tả |
|---|---|---|
| `WarehouseId` | `string` | ID kho xuất |
| `WarehouseName` | `string` | Tên kho |
| `HubName` | `string\|null` | Hub trung chuyển |
| `ParkingFee` | `float` | Phí đậu xe (JPY) |
| `CollectCash` | `float` | Thu tiền mặt tại chỗ (JPY) |
| `DeliveryCompleteFile1`–`3` | `string\|null` | Ảnh xác nhận giao hàng (1-3) |
| `LayoutParkingFile` | `string\|null` | Sơ đồ bãi đậu xe |
| `DeliveryMemo` | `string\|null` | Ghi chú sau khi giao |
| `Report` | `string\|null` | Báo cáo chuyến giao |

---

## scraped_deliverers — 36 records

Master các công ty vận chuyển ngoài (委託配送). Phân biệt với ヤマト運輸/福山通運 (courier) — đây là các công ty **tự giao** (自社便 type).

| Field | Type | Mô tả |
|---|---|---|
| `deliverer_id` | `string` | ID công ty vận chuyển `DE#####` |
| `name` | `string` | Tên công ty |
| `name_kana` | `string` | Tên katakana |
| `postal_code` | `string` | Mã bưu chính |
| `prefecture` | `string` | Tỉnh |
| `city` | `string` | Thành phố |
| `address` | `string` | Địa chỉ |
| `full_address` | `string` | Địa chỉ đầy đủ |
| `tel` | `string` | *(anonymized)* |
| `fax` | `string\|null` | *(anonymized)* |
| `person` | `string` | Người liên hệ |
| `person_tel` | `string` | *(anonymized)* |
| `email` | `string\|null` | *(anonymized)* |
| `memo` | `string\|null` | Ghi chú (`【使用禁止】` = ngừng dùng) |
| `status` | `string` | `0` = active |
| `is_deleted` | `bool` | Đã xóa chưa |

---

## scraped_drivers — 212 records

Master tài xế — bao gồm cả tài xế nội bộ và tài xế thuộc công ty vận chuyển ngoài.

| Field | Type | Mô tả |
|---|---|---|
| `driver_id` | `string` | ID tài xế |
| `name` | `string` | Tên tài xế |
| `name_kana` | `string` | Tên katakana |
| `deliverer_id` | `string` | ID công ty thuộc `DE#####` |
| `deliverer_name` | `string` | Tên công ty vận chuyển |
| `corp_kbn` | `string` | Mã loại tổ chức |
| `corp_kbn_name` | `string` | `ESキッチン` / `委託配送` |
| `mobile` | `string` | *(anonymized)* |
| `rating` | `float\|null` | Điểm đánh giá |
| `user_id` | `string\|null` | Tài khoản đăng nhập (→ `scraped_users`) |
| `status` | `string` | Trạng thái |
| `is_deleted` | `bool` | Đã xóa chưa |

---

## scraped_hubs — 206 records

Hub / điểm trung chuyển — bưu cục, kho nhỏ làm điểm relay cho courier (佐川急便, ヤマト運輸...).

| Field | Type | Mô tả |
|---|---|---|
| `hub_id` | `string` | ID hub `HU#####` |
| `name` | `string` | Tên hub, ví dụ `佐川急便 川崎新羽営業所` |
| `name_kana` | `string` | Tên katakana |
| `name_slip` | `string` | Tên in trên phiếu giao hàng |
| `branch_code` | `string` | Mã bưu cục |
| `kbn` | `string` | Phân loại hub |
| `postal_code` | `string` | Mã bưu chính |
| `prefecture` | `string` | Tỉnh |
| `city` | `string` | Thành phố |
| `address` | `string` | Địa chỉ |
| `full_address` | `string` | Địa chỉ đầy đủ |
| `tel` | `string` | *(anonymized)* |
| `fax` | `string\|null` | *(anonymized)* |
| `person` | `string` | Người phụ trách |
| `person_tel` | `string` | *(anonymized)* |
| `person_email` | `string\|null` | *(anonymized)* |
| `memo` | `string\|null` | Ghi chú |
| `status` | `string` | `0` = active |

---

## scraped_deliverer_deliveries — 1.167 records (3 tháng)

Trạng thái từng chuyến giao hàng theo tháng — ai giao, giao đâu, hình ảnh xác nhận.

| Field | Type | Mô tả |
|---|---|---|
| `DeliveryId` | `string` | ID chuyến giao |
| `DelivererName` | `string` | Công ty/tài xế thực hiện |
| `CustomerName` | `string` | Công ty nhận hàng |
| `DeliveryDate` | `string` | Ngày giao thực tế |
| `Image` | `string\|null` | URL ảnh xác nhận giao hàng |

---

## scraped_collect_payment — 58 records (3 tháng)

Thu tiền mặt tại chỗ từ khách hàng — do tài xế tự giao (自社便) thu khi giao hàng.

| Field | Type | Mô tả |
|---|---|---|
| `DelivererName` | `string` | Tên công ty vận chuyển |
| `Tel` | `string` | *(anonymized)* |
| `Ym` | `string` | Tháng (YYYY/MM) |
| `CollectSum` | `int` | Tổng tiền thu (JPY) |
| `CollectCount` | `int` | Số lần thu |
| `ParkingFeeSum` | `int` | Tổng phí đậu xe (JPY) |
