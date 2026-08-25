# Ghi Chú Kỹ Thuật

## Prefix file

| Prefix | Nguồn | Đặc điểm |
|---|---|---|
| `csv_` | CSV export từ ES Station (`/Csv`) | Encoding CP932/Shift-JIS, header tiếng Nhật |
| `scraped_` | Web scraping jqGrid AJAX | Field PascalCase, có `.NET /Date(ms)/` đã convert tự động |

## Khóa liên kết chính

| ID | Format | Entity |
|---|---|---|
| `customer_id` / `CustomerId` | `CU#####` | Khách hàng |
| `contract_plan_id` / `CustomerPlanId` | `CP#####` | Hợp đồng |
| `plan_id` / `PlanId` | `ES###` | Loại plan |
| `SupId` / `supplier_code` | `SU#####` | Supplier |
| `UserId` | `ES######` | Tài khoản đăng nhập |
| `deliverer_id` / `DelivererId` | `DE#####` | Công ty vận chuyển ngoài |
| `hub_id` / `HubId` | `HU#####` | Hub trung chuyển |
| `warehouse_id` / `WarehouseId` | `WH#####` | Kho |

## 3 Kho

| ID | Tên |
|---|---|
| `WH00001` | 南日本運輸倉庫株式会社 |
| `WH00002` | オージーフーズ三郷物流センター (chính) |
| `WH00003` | 関通_東京主管センター |

## Format ngày tháng

| Format | Ví dụ | Xuất hiện ở |
|---|---|---|
| `YYYY-MM-DD` | `2026-06-15` | Phần lớn CSV |
| `YYYY-MM` | `2026-06` | `contract_start`, `contract_end` |
| `YYYY/MM` | `2026/06` | `scraped_orders.menu_ym`, `LossYm` |
| `.NET /Date(ms)/` | đã convert tự động về `YYYY-MM-DD` | — |

## Anonymization

| Trường | Trước | Sau |
|---|---|---|
| Email | `user@company.co.jp` | `user@yopmail.com` |
| Tel / Fax | `03-1234-5678` | `000-0000-0000` |
| Password | `null` (không có giá trị thực trong data) | — |
| Tên cá nhân | Giữ nguyên | — |
| Địa chỉ | Giữ nguyên | — |

## Scripts scraping

| Script | Mục đích |
|---|---|
| `scripts/01_download_csv.py` | Download 8 loại CSV từ `/Csv` |
| `scripts/02_scrape_pages.py` | Scrape `/Delivery/Search/` (Playwright + requests) |
| `scripts/07_scrape_missing.py` | Scrape 17 endpoint còn lại (CustomerPlan, Plan, Deliverer, Driver, Hub, Stock, ...) |
| `scripts/03_transform.py` | Transform + validate toàn bộ raw → `data/transformed/` |
| `scripts/04_import.py` | Import vào ESKITCHEN API (chưa implement) |

## File lớn

| File | Size | Records |
|---|---|---|
| `csv_customer_order.json` | ~87 MB | 121.248 |
| `scraped_deliveries.json` | ~27 MB | 3.350 |
| `scraped_loss_report.json` | ~7 MB | 2.052 |
| `scraped_customer_plans.json` | ~2.4 MB | 2.052 |

> **Phạm vi dữ liệu:** Chỉ 3 tháng T6, T7, T8 / 2026. Lịch sử trước đó không được export.
