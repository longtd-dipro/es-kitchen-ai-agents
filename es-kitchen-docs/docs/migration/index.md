# Migration Data Dictionary

Mô tả toàn bộ **32 file JSON** đã được export & scrape từ hệ thống cũ **ES Station**, sau đó transform và anonymize. Dữ liệu nằm tại thư mục [`data/transformed/`](https://github.com/longtd-dipro/es-kitchen-ai-agents/tree/main/data/transformed) trong repo này.

---

## Tổng quan các file

| Domain | File | Records | Download |
|---|---|---|---|
| Khách hàng | `csv_customer_info` | 701 | [↓](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/csv_customer_info.json) |
| Khách hàng (scraped) | `scraped_customers` | 725 | [↓](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_customers.json) |
| **Hợp đồng** ⭐ | `scraped_customer_plans` | 2.052 | [↓](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_customer_plans.json) |
| Loại plan | `scraped_plans` | 41 | [↓](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_plans.json) |
| Hợp đồng dùng thử | `scraped_trial_plans` | 30 | [↓](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_trial_plans.json) |
| User tài khoản | `scraped_users` | 841 | [↓](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_users.json) |
| Kho — số lượng cần | `csv_required_number` | 7.282 | [↓](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/csv_required_number.json) |
| Kho — nhập hàng | `csv_arrival_info` | 252 | [↓](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/csv_arrival_info.json) |
| Kho — nhập (chi tiết) | `scraped_arrival_detail` | 252 | [↓](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_arrival_detail.json) |
| Tồn kho | `scraped_stock` | 185 | [↓](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_stock.json) |
| Item master (CSV) | `csv_item_master` | 320 | [↓](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/csv_item_master.json) |
| Item master (scraped) | `scraped_items` | 320 | [↓](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_items.json) |
| Item menu | `scraped_menu_items` | 320 | [↓](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_menu_items.json) |
| Item Thomas | `scraped_thomas_items` | 331 | [↓](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_thomas_items.json) |
| Supplier | `scraped_suppliers` | 48 | [↓](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_suppliers.json) |
| Đơn đặt hàng supplier | `csv_supplier_orders` | 34 | [↓](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/csv_supplier_orders.json) |
| Purchase info | `csv_purchase_info` | 460 | [↓](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/csv_purchase_info.json) |
| Lịch sử đặt hàng | `scraped_purchase_history` | 59 | [↓](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_purchase_history.json) |
| Lịch sử chi tiết | `scraped_purchase_history_detail` | 238 | [↓](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_purchase_history_detail.json) |
| Đơn order (chi tiết) | `csv_customer_order` | 121.248 | [↓](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/csv_customer_order.json) |
| Đơn order (header) | `scraped_orders` | 2.086 | [↓](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_orders.json) |
| Mẫu bán hàng | `scraped_sales_samples` | 26 | [↓](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_sales_samples.json) |
| Lịch giao hàng | `csv_shipping_schedule` | 3.581 | [↓](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/csv_shipping_schedule.json) |
| Thực thi giao hàng | `scraped_deliveries` | 3.350 | [↓](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_deliveries.json) |
| **Công ty vận chuyển** ⭐ | `scraped_deliverers` | 36 | [↓](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_deliverers.json) |
| **Tài xế** ⭐ | `scraped_drivers` | 212 | [↓](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_drivers.json) |
| Hub trung chuyển | `scraped_hubs` | 206 | [↓](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_hubs.json) |
| Trạng thái giao (tháng) | `scraped_deliverer_deliveries` | 1.167 | [↓](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_deliverer_deliveries.json) |
| Thu tiền mặt | `scraped_collect_payment` | 58 | [↓](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_collect_payment.json) |
| Hao hụt (tổng hợp) | `scraped_loss` | 1.077 | [↓](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_loss.json) |
| Hao hụt (chi tiết) | `scraped_loss_report` | 2.052 | [↓](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_loss_report.json) |
| Thông báo hệ thống | `scraped_information` | 172 | [↓](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_information.json) |

---

## Thứ tự import vào ESKITCHEN mới

```
1. company     → /companies/seed
2. supplier    → /suppliers/seed
3. menu        → /menus/seed
4. user        → /users/seed
5. contract    → /contracts/seed   ← scraped_customer_plans + scraped_plans
6. order       → /orders/seed
7. delivery    → /deliveries/seed
8. payment     → /payments/seed
```

## Quan hệ chính giữa các file

```
scraped_plans ─────── PlanId (ES30, ES700...)
                          │
scraped_customer_plans ── plan_id + customer_id
                          │             │
                    CP##### ←───── CU#####
                          │             │
csv_shipping_schedule     │    csv_customer_info
scraped_deliveries        │    scraped_customers
scraped_orders ───────────┘

scraped_suppliers ── SU##### ── csv_item_master
                                csv_purchase_info
                                csv_arrival_info

scraped_users ── CorpId → CU##### / SU##### / DE#####
```

## Anonymization đã áp dụng

| Trường | Trước | Sau |
|---|---|---|
| Email | `user@company.co.jp` | `user@yopmail.com` |
| Tel / Fax | `03-1234-5678` | `000-0000-0000` |
| Password | `null` (không có giá trị thực) | — |
| Tên cá nhân | Giữ nguyên | — |
| Địa chỉ | Giữ nguyên | — |

> **Phạm vi:** Chỉ 3 tháng T6, T7, T8 / 2026.
