# [BE] [Delivery_Web] — API lịch tuần: danh sách điểm giao theo ngày

## Backlog Info
- **Issue Type:** Task
- **Category:** Delivery_Web
- **Parent Issue:** Delivery Partner P2 — スケジュール
- **Version:** _TBD_ · **Milestone:** _TBD_
- **Estimate Hour:** 8h · **Actual Hour:** — · **Status:** Open

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 2 — Service + API |
| Repo | `es-kitchen-api` |
| Depends on | task-2-1 |
| Song song với | task-2-5, task-2-7 |
| Estimate | ~8h |

## Mục tiêu
Tạo `GET /deliverer/schedule/weekly` — mỗi ngày trong tuần trả về cycle, tổng số kiện và **danh sách điểm giao** để FE render cột ngày.

## Context (đọc trước khi code)

### 🏗️ Tech Lead output
- **Design-Technical.md** → §4 BE-01/02/03 (`WeeklyDay`), §5 `DelivererScheduleService.weekly`
- **Figma-Analysis.md** → §2.3, node **`31498:191010`**

> ⚠️ **Đọc kỹ:** bản tuần đúng là danh sách điểm giao. Frame `weekly-schedule` (`31498:194865`) với 午前便/午後便/夕方便 thuộc **vùng nháp**, KHÔNG implement.

### 📂 File liên quan trong codebase
- `src/modules/deliverer/services/deliverer-schedule.service.ts` — file tạo ở task-2-1
- `src/modules/deliverer/http/requests/delivery-block-timeline.request.ts` — DTO cũ nhận `weekStart`, tham khảo format
- `src/entities/delivery-address.entity.ts` — nguồn tên điểm giao

## Yêu cầu implement

### Sửa: `deliverer-schedule-query.request.ts`
```typescript
// week?: string — @Matches(/^\d{4}-W(0[1-9]|[1-4]\d|5[0-3])$/)
// from?, to?: string — @IsDateString(); dùng khi không truyền week
// Validate: phải có `week` HOẶC cặp `from`+`to`; khoảng tối đa 7 ngày
```

### Sửa: `deliverer-schedule.service.ts`
```typescript
async weekly(delivererId, q) {
  // 1. Resolve [from, to] từ week hoặc from/to
  // 2. 1 query lấy delivery_blocks trong khoảng + JOIN delivery_address/company để lấy destinationName
  //    SELECT id, shipment_no, scheduled_delivery_date, cargo_type, destinationName
  // 3. Group theo ngày trong application layer (dữ liệu 1 tuần đủ nhỏ)
  // 4. Tái dùng hàm resolveCycle() của task-2-2 cho cycleLabel
}
```

### Sửa: `deliverer-schedule.response.ts` — thêm `WeeklyDay`

## Unit Tests (BẮT BUỘC)
### Test file: bổ sung `deliverer-schedule.service.spec.ts`
```typescript
it('should resolve ISO week string to the correct 7-day range', ...);
it('should group delivery blocks into the right day bucket', ...);
it('should return empty items array for days without deliveries', ...);
it('should reject a range longer than 7 days', ...);
it('should scope to the current delivererId', ...);
```
**Coverage:** ≥ 80% · **Verify:** `npm run test -- deliverer-schedule`

## API Definition
| Method | Endpoint | Request | Response |
|---|---|---|---|
| GET | `/deliverer/schedule/weekly` | `?week=2026-W32` hoặc `?from=&to=` | `{ from, to, days: WeeklyDay[] }` |

```
WeeklyDay: {
  date, cycleLabel, isCurrentMonthCycle, totalCount,
  items: Array<{ deliveryBlockId, shipmentNo, destinationName, cargoType }>
}
```
**Auth:** Bearer JWT + `DelivererGuard`

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| `/delivery-blocks/timeline` | `delivery-block.controller.ts` | Endpoint cũ vẫn trả đúng shape cho FE hiện tại |
| `monthly` (task-2-1/2-2) | `deliverer-schedule.service.ts` | `npm run test -- deliverer-schedule` toàn bộ pass |

## Không được làm
- Không implement breakdown 午前/午後/夕方便 (thuộc frame nháp)
- Không xoá `/delivery-blocks/timeline`
- Không trả toàn bộ field của delivery_block trong `items` — chỉ 4 field FE cần (payload tuần có thể rất lớn)

## Definition of Done
- [ ] Build · Lint · Unit Tests pass
- [ ] API Definition điền đủ — FE bắt đầu được task-3-8
- [ ] Non-Regression verify đủ · Actual Hour · Status → `Done` → `Reviewing`
