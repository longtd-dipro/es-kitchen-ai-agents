# [BE] [Delivery_Web] — assignable-drivers: tìm kiếm + số 配送件数 trong ngày

## Backlog Info
- **Issue Type:** Task · **Category:** Delivery_Web
- **Parent Issue:** Delivery Partner P2 — 配送管理
- **Version:** _TBD_ · **Milestone:** _TBD_
- **Estimate Hour:** 4h · **Actual Hour:** — · **Status:** Open

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 2 — Service + API |
| Repo | `es-kitchen-api` |
| Depends on | none |
| Song song với | task-2-12, task-2-13 |
| Estimate | ~4h |

## Mục tiêu
Dropdown chọn tài xế trong 配送詳細 cần: ô tìm theo tên/ID và hiển thị **số việc tài xế đó đã có trong ngày giao** — giúp đối tác không dồn việc.

## Context (đọc trước khi code)
- **Design-Technical.md** → §4 BE-13, §2.3 (lý do không để FE gọi N+1)
- **Figma-Analysis.md** → §2.4, node `31498:190950` (driver-selection-card)
- `src/modules/deliverer/services/delivery-block.service.ts` — `getAssignableDrivers()` hiện có

## Yêu cầu implement

### Sửa: `delivery-block.service.ts`
```typescript
async getAssignableDrivers(delivererId, blockId, keyword?) {
  // 1. Lấy scheduled_delivery_date của block
  // 2. Query driver của deliverer (+ keyword ILIKE driver_name / driver_code)
  // 3. 1 query GROUP BY driver_id đếm delivery_blocks cùng ngày → map vào từng driver
  //    TUYỆT ĐỐI không đếm trong vòng lặp driver (N+1)
}
```

## Unit Tests (BẮT BUỘC)
```typescript
it('should return deliveryCountOnDate per driver from a single grouped query', ...);
it('should return 0 for a driver with no delivery that day', ...);
it('should filter drivers by name or code keyword', ...);
it('should only return drivers belonging to the current deliverer', ...);
```
**Coverage:** ≥ 80% · **Verify:** `npm run test -- delivery-block`

## API Definition
| Method | Endpoint | Request | Response |
|---|---|---|---|
| GET | `/deliverer/delivery-blocks/:id/assignable-drivers` | `?keyword=` | `{ items: Array<{ id, driverCode, driverName, tel, deliveryCountOnDate }> }` |

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Dropdown gán tài xế hiện tại | FE `DeliveryStatusDetailForm.tsx` | Không truyền `keyword` → danh sách như cũ, field cũ giữ nguyên |

## Không được làm
- Không đổi/bỏ field cũ trong response
- Không đếm trong vòng lặp

## Definition of Done
- [ ] Build · Lint · Unit Tests pass
- [ ] API Definition điền đủ — FE dùng ở task-3-12
- [ ] Non-Regression verify đủ · Actual Hour · Status → `Done` → `Reviewing`
