# Hao Hụt & Thông Tin

## Files

| File | Records | Download |
|---|---|---|
| `scraped_loss` | 1.077 | [↓ GitHub](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_loss.json) |
| `scraped_loss_report` | 2.052 | [↓ GitHub](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_loss_report.json) |
| `scraped_information` | 172 | [↓ GitHub](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_information.json) |
| `scraped_sales_samples` | 26 | [↓ GitHub](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_sales_samples.json) |

---

## scraped_loss — 1.077 records

Ghi nhận hao hụt/thất thoát sản phẩm theo công ty và theo tháng.

| Field | Type | Mô tả |
|---|---|---|
| `CustomerId` | `string` | ID khách hàng `CU#####` |
| `Name` | `string` | Tên công ty |
| `LossYm` | `YYYY/MM` | Tháng phát sinh hao hụt |
| `Sum` | `int` | Tổng giá trị hao hụt (JPY) |
| `LossCount` | `int` | Số lượng suất hao hụt |
| `LossCost` | `float` | Chi phí hao hụt (JPY) |
| `BankBoxSum` | `int` | Hao hụt thùng hàng ngân hàng |
| `BankBoxSumS` | `string` | Dạng hiển thị có format số |
| `LossCountS` | `string` | Số lượng dạng string |
| `LossCostS` | `string` | Chi phí dạng string có format tiền |
| `SumS` | `string` | Tổng dạng string có format tiền |

---

## scraped_loss_report — 2.052 records (3 tháng)

Chi tiết hao hụt theo từng hợp đồng/tháng — cùng data với `scraped_loss` nhưng phân theo `contract_plan_id`.

| Field quan trọng | Mô tả |
|---|---|
| `CustomerPlanId` | ID hợp đồng `CP#####` |
| `CustomerName` | Tên công ty |
| `LossYm` | Tháng hao hụt |
| `LossCount` | Số lượng hao hụt |
| `LossCost` | Chi phí (JPY) |
| `DeliveryCorpKbnName` | Công ty vận chuyển |
| `WarehouseName` | Kho liên quan |

---

## scraped_information — 172 records

Thông báo nội bộ hệ thống — hiển thị trên dashboard ES Station.

| Field | Type | Mô tả |
|---|---|---|
| `Title` | `string` | Tiêu đề thông báo |
| `TargetRange` | `string` | Phạm vi: toàn hệ thống / nhóm cụ thể |
| `From` | `YYYY-MM-DD` | Ngày bắt đầu hiển thị |
| `To` | `YYYY-MM-DD\|null` | Ngày kết thúc hiển thị |
| `RegisterDate` | `string` | Ngày tạo |
| `InformationNo` | `string` | Số thông báo |
