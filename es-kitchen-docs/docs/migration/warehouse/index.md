# Kho & Item Master

## 3 Kho trong hệ thống

| ID | Tên | Vùng |
|---|---|---|
| `WH00001` | 南日本運輸倉庫株式会社 | Miền Nam/Tây |
| `WH00002` | オージーフーズ三郷物流センター | Miền Đông (chính) |
| `WH00003` | 関通_東京主管センター | Tokyo |

## Files

| File | Records | Download |
|---|---|---|
| `csv_required_number` | 7.282 | [↓ GitHub](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/csv_required_number.json) |
| `csv_arrival_info` | 252 | [↓ GitHub](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/csv_arrival_info.json) |
| `scraped_arrival_detail` | 252 | [↓ GitHub](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_arrival_detail.json) |
| `scraped_stock` | 185 | [↓ GitHub](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_stock.json) |
| `csv_item_master` | 320 | [↓ GitHub](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/csv_item_master.json) |
| `scraped_items` | 320 | [↓ GitHub](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_items.json) |
| `scraped_menu_items` | 320 | [↓ GitHub](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_menu_items.json) |
| `scraped_thomas_items` | 331 | [↓ GitHub](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_thomas_items.json) |

---

## csv_required_number — 7.282 records

Số lượng từng món cần có tại kho theo từng ngày giao — dùng để lập kế hoạch sản xuất/nhập hàng.

| Field | Type | Mô tả |
|---|---|---|
| `item_code` | `string` | Mã món ăn (→ `csv_item_master`) |
| `item_name` | `string` | Tên món |
| `menu_ym` | `YYYY-MM` | Tháng menu |
| `warehouse` | `string` | Tên kho |
| `date` | `YYYY-MM-DD` | Ngày cần hàng tại kho |
| `required_qty` | `float` | Số lượng suất cần |

---

## csv_arrival_info — 252 records

Thông tin nhập hàng vào kho: trạng thái từ đặt hàng → giao thực tế.

| Field | Type | Mô tả |
|---|---|---|
| `item_code` | `string` | Mã món ăn |
| `item_name` | `string` | Tên món |
| `menu_ym` | `YYYY-MM` | Tháng menu |
| `order_detail_no` | `string` | Số chi tiết đơn mua `P######` — liên kết với `csv_purchase_info` |
| `category` | `string` | Danh mục: `肉` / `惣菜` / `主食` / ... |
| `supplier_name` | `string` | Nhà cung cấp |
| `unit_price` | `float` | Đơn giá mua (JPY) |
| `warehouse` | `string` | Kho nhận hàng |
| `provisional_qty` | `float` | Số lượng đặt tạm |
| `confirmed_qty` | `float` | Số lượng xác nhận chính thức |
| `desired_delivery` | `YYYY-MM-DD` | Ngày giao mong muốn |
| `planned_ship_date` | `YYYY-MM-DD\|null` | Ngày xuất kho dự kiến |
| `actual_ship_date` | `YYYY-MM-DD\|null` | Ngày xuất kho thực tế |
| `expiry_date` | `string\|null` | Hạn sử dụng (dạng `MMDD`, ví dụ `0715`) |
| `status` | `string` | `（未入荷）` = chưa nhập kho / `入荷済` = đã nhập |
| `arrival_date` | `YYYY-MM-DD\|null` | Ngày nhập kho thực tế |

> `scraped_arrival_detail` có cùng schema nhưng thêm field `SlipNo` (số vận đơn từ màn hình `/Arrival`).

---

## scraped_stock — 185 records

Tồn kho thực tế tại từng kho theo item. `stock_count` có thể **âm** = đang backorder.

| Field | Type | Mô tả |
|---|---|---|
| `id` | `int` | ID record tồn kho |
| `item_id` | `string` | Mã item (→ `csv_item_master`) |
| `item_name` | `string` | Tên item |
| `category` | `string` | Danh mục |
| `warehouse_id` | `string` | ID kho `WH#####` |
| `warehouse_name` | `string` | Tên kho |
| `stock_count` | `int` | Số lượng tồn (có thể âm = thiếu) |
| `io_no` | `string` | Số phiếu nhập/xuất liên quan |
| `inout_datetime` | `YYYY-MM-DD` | Thời điểm cập nhật |
| `inout_kbn` | `string\|null` | Loại in/out |
| `input_count` | `int` | Số lượng nhập thêm |

---

## csv_item_master — 320 records

Master data món ăn: thông tin dinh dưỡng, giá, nhà cung cấp, nguyên liệu.

| Field | Type | Mô tả |
|---|---|---|
| `item_code` | `string` | Mã món, ví dụ `10001` |
| `jan_code` | `string` | JAN barcode (13 chữ số) |
| `category` | `string` | `肉` / `惣菜` / `主食` / `魚` / `サラダ・果物` / `汁物` |
| `price` | `float` | Giá bán lẻ (JPY) |
| `name` | `string` | Tên món (tiếng Nhật) |
| `name_kana` | `string` | Tên món (katakana) |
| `supplier_name` | `string` | Tên nhà cung cấp |
| `purchase_price` | `float` | Giá mua vào (JPY) |
| `lot` | `string\|null` | Quy cách đóng gói |
| `description` | `string` | Mô tả món ăn |
| `energy` | `string` | Năng lượng, ví dụ `206kcal（130g）` |
| `protein` | `string` | Protein (g) |
| `fat` | `string` | Chất béo (g) |
| `carbs` | `string` | Tinh bột (g) |
| `salt` | `string` | Muối/natri (g) |
| `allergens` | `string` | Chất gây dị ứng, ví dụ `小麦` (gluten) |
| `ingredients` | `string` | Danh sách nguyên liệu |
| `weight` | `string` | Khối lượng, ví dụ `130g` |
| `shelf_life` | `string` | Hạn sử dụng, ví dụ `45日` |
| `storage_method` | `string` | `冷蔵` (lạnh) / `冷凍` (đông) |
| `is_deleted` | `bool` | Đã xóa/ngừng kinh doanh |

---

## scraped_items — 320 records

Dữ liệu item từ web scraping — bổ sung `FirstSupId` và status từ hệ thống cũ.

| Field | Type | Mô tả |
|---|---|---|
| `ItemId` | `string` | Mã món (= `item_code`) |
| `JanCd` | `string` | JAN barcode |
| `Name` | `string` | Tên món |
| `NameKana` | `string` | Tên katakana |
| `Category` | `string` | Mã category (số) |
| `CategoryName` | `string` | Tên category |
| `SupName` | `string` | Tên supplier |
| `FirstSupId` | `string` | ID supplier trong hệ thống `SU#####` |
| `PriceS` | `string` | Giá mua dạng string |
| `Price` | `int` | Giá mua (JPY) |
| `Image` | `string` | Trạng thái ảnh: `登録済` = đã có ảnh |
| `Status` | `string` | `0` = active |
| `StatusName` | `string\|null` | Tên trạng thái |
| `ItemPrice` | `string` | Giá bán dạng hiển thị, ví dụ `100円` |
| `PriceKbn` | `string` | Phân loại giá |

> `scraped_thomas_items` (331 records) — item master từ hệ thống Thomas, có thêm 11 items so với `csv_item_master`, thêm field `CutleryKbn` (惣菜/資材) và `StorageKbnDisplay`.
