# [BE] [Delivery_Web] — 配送詳細 tab 実績: khối 廃棄数確認

## Backlog Info
- **Issue Type:** Task · **Category:** Delivery_Web
- **Parent Issue:** Delivery Partner P2 — 配送管理
- **Version:** _TBD_ · **Milestone:** _TBD_
- **Estimate Hour:** 7h · **Actual Hour:** — · **Status:** Open

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 2 — Service + API |
| Repo | `es-kitchen-api` |
| Depends on | none |
| Song song với | task-2-1, task-2-7 |
| Estimate | ~7h |

## Mục tiêu
Mở rộng `GET /deliverer/delivery-blocks/:id` trả thêm `completedAt` và khối `disposal` (廃棄数確認): tổng 廃棄数/理論在庫/実在庫/差異 + bảng item kèm 賞味期限.

## Context (đọc trước khi code)

### 🏗️ Tech Lead output
- **Design-Technical.md** → §3.1 (bảng tái dùng — **KHÔNG tạo bảng mới**), §4 BE-04, §8 R1/R3
- **Figma-Analysis.md** → §2.4, node `31498:193469`

### 📂 File liên quan trong codebase
- `src/modules/deliverer/services/delivery-block.service.ts` — hàm detail hiện tại
- `src/modules/deliverer/http/responses/delivery-block-detail.response.ts` — **chỉ THÊM field, không đổi field cũ**
- `src/entities/delivery-report.entity.ts` — `submitted_at`, `remarks`, `disposed_items`
- `src/entities/disposal-report.entity.ts` + `disposal-report-item.entity.ts` — `product_name`, `quantity`, `unit`, `expiry_date`
- `src/entities/inventory-check.entity.ts` + `inventory-check-item.entity.ts` — `logical_stock`, `actual_stock`, `difference`

## Yêu cầu implement

### Sửa: `delivery-block.service.ts`
```typescript
// Trong findDetail(): leftJoinAndSelect thêm
//   delivery_reports (theo delivery_block_id)
//   disposal_reports → disposal_report_items
//   inventory_checks → inventory_check_items
// Ghép item theo product_id/product_name:
//   disposedQty   ← disposal_report_items.quantity
//   expiryDate    ← disposal_report_items.expiry_date
//   logicalStock  ← inventory_check_items.logical_stock
//   actualStock   ← inventory_check_items.actual_stock
// Trả disposal = null khi KHÔNG có disposal_report lẫn inventory_check
```

### Sửa: `delivery-block-detail.response.ts` — thêm `completedAt`, `performanceNote`, `disposal`

## Unit Tests (BẮT BUỘC)
### Test file: `src/modules/deliverer/services/delivery-block.service.spec.ts`
```typescript
it('should return disposal=null when driver has not submitted any report', ...);
it('should sum totalDisposed / totalLogicalStock / totalActualStock correctly', ...);
it('should merge disposal item and inventory item of the same product into one row', ...);
it('should keep every existing detail field unchanged', ...);  // ← chống regression R1
it('should reject access when the block does not belong to the current deliverer', ...);
```
**Coverage:** service ≥ 80% · **Verify:** `npm run test -- delivery-block`

## API Definition
| Method | Endpoint | Field thêm |
|---|---|---|
| GET | `/deliverer/delivery-blocks/:id` | `completedAt`, `performanceNote`, `disposal` |

```
disposal: {
  totalDisposed, totalLogicalStock, totalActualStock, totalDifference: number
  items: Array<{ no, productCode, productName, category, photoUrl,
                 disposedQty, expiryDate, logicalStock, actualStock }>
} | null
```

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Màn 配送詳細 FE hiện tại | FE `DeliveryStatusDetailForm.tsx` | 5 section cũ vẫn hiển thị đủ (field cũ không đổi tên/kiểu) |
| Driver App nộp report | `src/modules/driver/services/driver-es-delivery.service.ts` | Không sửa file này; chạy test driver suite |
| Query performance | — | Detail phải là **1 query** — kiểm tra log SQL không có N+1 |

## Không được làm
- **Không tạo bảng mới** — dữ liệu đã có đủ (Design-Technical §3.1)
- Không đổi tên / kiểu / bỏ field cũ trong response detail
- Không ghi (write) vào `disposal_reports` / `inventory_checks` — portal chỉ đọc

## Definition of Done
- [ ] Build · Lint · Unit Tests pass
- [ ] API Definition điền đủ — FE bắt đầu được task-3-13
- [ ] Non-Regression verify đủ · Actual Hour · Status → `Done` → `Reviewing`
