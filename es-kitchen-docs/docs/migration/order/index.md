# Đơn Order Khách Hàng

## Files

| File | Records | Download |
|---|---|---|
| `csv_customer_order` | 121.248 | [↓ GitHub](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/csv_customer_order.json) |
| `scraped_orders` | 2.086 | [↓ GitHub](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_orders.json) |
| `scraped_sales_samples` | 26 | [↓ GitHub](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_sales_samples.json) |

---

## csv_customer_order — 121.248 records

> **File lớn nhất (~87 MB).** Mỗi record = 1 món ăn trong 1 đợt giao của 1 công ty.

| Field | Type | Mô tả |
|---|---|---|
| `menu_ym` | `YYYY-MM` | Tháng menu |
| `customer_id` | `string` | ID công ty `CU#####` |
| `customer_name` | `string` | Tên công ty |
| `plan_name` | `string` | Tên plan, ví dụ `700プラン` |
| `order_no` | `string` | Số đơn hàng `O######` |
| `delivery_count` | `float` | Tổng số đợt giao trong tháng |
| `delivery_round` | `float` | Đợt giao này (1, 2, 3, 4) |
| `ship_date` | `YYYY-MM-DD` | Ngày xuất kho |
| `arrive_date` | `YYYY-MM-DD` | Ngày dự kiến nhận hàng |
| `item_name` | `string` | Tên món ăn |
| `order_count` | `float` | Số lượng món này trong đơn |
| `service_count` | `float` | Số lượng tặng kèm (サービス品) |
| `postal_code` | `string` | Mã bưu chính địa chỉ giao |
| `prefecture` | `string` | Tỉnh |
| `city` | `string` | Thành phố/quận |
| `address` | `string` | Địa chỉ chi tiết |
| `main_contact_name` | `string` | Người liên hệ nhận hàng |
| `main_contact_email` | `string` | *(anonymized: @yopmail.com)* |
| `payment_method` | `string` | `クレジット決済` / `お振込み` |
| `status` | `string` | Trạng thái đơn (xem enum bên dưới) |

**Enum `status`:**

| Giá trị | Ý nghĩa |
|---|---|
| `顧客入力済み` | Khách hàng đã nhập order |
| `ESキッチン入力済み` | ES Kitchen đã xác nhận |
| `基準数セット済み` | Đã set số lượng cơ sở (production planning) |

---

## scraped_orders — 2.086 records

Header đơn hàng theo tháng/công ty — dùng để tra cứu tổng quan (1 record = 1 tháng × 1 công ty, không phân theo món).

| Field | Type | Mô tả |
|---|---|---|
| `order_no` | `string` | Số đơn `O######` — liên kết với `csv_customer_order` |
| `customer_plan_id` | `string` | ID hợp đồng `CP#####` |
| `plan_name` | `string` | Tên plan |
| `customer_name` | `string` | Tên công ty |
| `customer_kana` | `string` | Tên katakana |
| `menu_ym` | `YYYY/MM` | Tháng menu (chú ý: dùng `/` không phải `-`) |
| `order_date` | `string\|null` | Ngày đặt hàng |
| `status` | `string` | Trạng thái order |
| `delivery_count` | `string` | Số đợt giao |
| `order_count` | `string` | Tổng số suất |
| `service_count` | `string` | Số suất tặng |
| `service_rate` | `string` | Tỉ lệ tặng, ví dụ `0% (0個)` |
| `memo` | `string\|null` | Ghi chú đặc biệt của khách |

---

## scraped_sales_samples — 26 records (3 tháng)

Mẫu bán hàng gửi cho khách tiềm năng — tương tự `scraped_trial_plans` nhưng là sản phẩm mẫu (không phải dùng thử toàn bộ plan).
