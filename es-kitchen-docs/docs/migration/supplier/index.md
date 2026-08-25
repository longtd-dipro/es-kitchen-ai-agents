# Supplier & Đặt Hàng

## Files

| File | Records | Download |
|---|---|---|
| `scraped_suppliers` | 48 | [↓ GitHub](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_suppliers.json) |
| `csv_supplier_orders` | 34 | [↓ GitHub](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/csv_supplier_orders.json) |
| `csv_purchase_info` | 460 | [↓ GitHub](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/csv_purchase_info.json) |
| `scraped_purchase_history` | 59 | [↓ GitHub](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_purchase_history.json) |
| `scraped_purchase_history_detail` | 238 | [↓ GitHub](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_purchase_history_detail.json) |

---

## scraped_suppliers — 48 records

Master nhà cung cấp nguyên liệu/món ăn.

| Field | Type | Mô tả |
|---|---|---|
| `SupId` | `string` | ID supplier, ví dụ `SU00001` |
| `Name` | `string` | Tên công ty supplier |
| `NameKana` | `string` | Tên katakana |
| `Post` | `string` | Mã bưu chính |
| `Pref` | `string` | Tỉnh |
| `City` | `string` | Thành phố/quận |
| `Address` | `string` | Địa chỉ |
| `ExAddress` | `string\|null` | Địa chỉ bổ sung (số phòng, tòa nhà) |
| `FullAddress` | `string` | Địa chỉ đầy đủ |
| `Tel` | `string` | *(anonymized)* |
| `Fax` | `string\|null` | *(anonymized)* |
| `Person` | `string` | Người liên hệ chính |
| `MailAddress1`–`5` | `string\|null` | Tối đa 5 địa chỉ email *(anonymized)* |
| `Memo` | `string\|null` | Ghi chú nội bộ (ví dụ: quy trình đặt hàng) |
| `UserId` | `string` | Tài khoản đăng nhập (→ `scraped_users`) |
| `Password` | `string\|null` | Null sau migration |
| `Status` | `string` | `0` = active |
| `IsInUse` | `bool` | Đang được dùng không |

---

## csv_supplier_orders — 34 records

Đơn đặt hàng gửi đến supplier (phát đơn mua từ ES Kitchen đến nhà cung cấp).

| Field | Type | Mô tả |
|---|---|---|
| `supplier_code` | `string` | ID supplier `SU#####` |
| `supplier_name` | `string` | Tên supplier |
| `supplier_kana` | `string` | Tên katakana |
| `item_name` | `string` | Tên món đặt |
| `category` | `string` | Danh mục món |
| `order_date` | `YYYY-MM-DD` | Ngày phát đơn |
| `ship_date` | `YYYY-MM-DD\|null` | Ngày supplier dự kiến xuất hàng |
| `unit_price` | `float` | Đơn giá (JPY) |
| `quantity` | `float` | Số lượng đặt |
| `amount` | `float` | Thành tiền (= unit_price × quantity) |
| `postal_code` | `string` | Mã bưu chính supplier |
| `prefecture` | `string` | Tỉnh |
| `city` | `string` | Thành phố |
| `address` | `string` | Địa chỉ |
| `tel` | `string` | *(anonymized)* |
| `person_name` | `string` | Người phụ trách tại supplier |
| `email1` | `string` | *(anonymized: @yopmail.com)* |
| `login_user_id` | `string` | UserId người tạo đơn (ES Kitchen staff) |
| `note` | `string\|null` | Ghi chú giao hàng đặc biệt |
| `is_deleted` | `bool` | Đã hủy chưa |

---

## csv_purchase_info — 460 records

Chi tiết phát đơn mua (purchase order) — bao gồm dự báo số lượng và xác nhận.

| Field | Type | Mô tả |
|---|---|---|
| `order_no` | `string` | Số đơn mua, ví dụ `P260600008` |
| `order_detail_no` | `string` | Số dòng chi tiết `P######` — liên kết với `csv_arrival_info` |
| `supplier_name` | `string` | Tên supplier |
| `item_code` | `string` | Mã món (→ `csv_item_master`) |
| `item_name` | `string` | Tên món |
| `menu_ym` | `YYYY-MM` | Tháng menu |
| `category` | `string` | Danh mục |
| `base_qty` | `float` | Số lượng cơ sở (căn cứ từ kế hoạch) |
| `forecast_qty` | `float` | Số lượng dự báo |
| `warehouse` | `string` | Kho nhận hàng |
| `unit_price` | `float` | Đơn giá mua (JPY) |
| `lot` | `string\|null` | Quy cách lô hàng |
| `provisional_qty` | `float` | Số lượng đặt tạm |
| `confirmed_qty` | `float` | Số lượng xác nhận chính thức |
| `desired_delivery` | `YYYY-MM-DD` | Ngày mong muốn nhận hàng tại kho |
| `planned_ship` | `YYYY-MM-DD\|null` | Ngày supplier dự kiến xuất hàng |

---

## scraped_purchase_history — 59 records

Tổng hợp lịch sử phát đơn theo supplier và tháng.

| Field | Type | Mô tả |
|---|---|---|
| `supplier_id` | `string` | ID supplier `SU#####` |
| `supplier_name` | `string` | Tên supplier |
| `order_ym` | `string` | Tháng phát đơn |
| `ship_ym` | `string` | Tháng xuất hàng |
| `order_amount` | `int` | Tổng tiền đặt hàng (JPY) |

---

## scraped_purchase_history_detail — 238 records

Chi tiết từng item trong lịch sử đặt hàng.

| Field | Type | Mô tả |
|---|---|---|
| `item_name` | `string` | Tên item |
| `category` | `string` | Danh mục |
| `order_date` | `string` | Ngày phát đơn |
| `ship_date` | `string` | Ngày xuất hàng |
| `unit_price` | `int` | Đơn giá (JPY) |
| `quantity` | `int` | Số lượng |
| `amount` | `int` | Thành tiền (JPY) |
