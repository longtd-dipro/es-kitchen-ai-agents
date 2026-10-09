# [BE] [Delivery_Web] — API lịch tháng: khung endpoint + tổng hợp số kiện theo ngày

## Backlog Info
- **Issue Type:** Task
- **Category:** Delivery_Web
- **Parent Issue:** Delivery Partner P2 — スケジュール
- **Version:** _TBD_
- **Milestone:** _TBD_
- **Estimate Hour:** 7h
- **Actual Hour:** —
- **Status:** Open

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 2 — Service + API |
| Repo | `es-kitchen-api` |
| Depends on | none |
| Song song với | task-2-5, task-2-7 |
| Estimate | ~7h |

## Mục tiêu
Tạo `GET /deliverer/schedule/monthly` trả về khung dữ liệu lịch tháng: mỗi ngày kèm số kiện giao tách theo 温度帯 và số kiện **chưa gán tài xế**. Phần nhãn サイクル / 臨時休業 làm ở task-2-2.

## Context (đọc trước khi code)

### 🏗️ Tech Lead output
- **Design-Technical.md** → §4 **BE-01/02/03**, §5 `DelivererScheduleService`, §2.3 (lý do tách service)
- **Figma-Analysis.md** → §2.3, node `31498:190314`

### 📂 File liên quan trong codebase
- `src/modules/deliverer/http/controllers/delivery-block.controller.ts` — pattern controller + `DelivererGuard` + swagger decorator
- `src/modules/deliverer/services/delivery-block.service.ts` — pattern query builder scope theo `deliverer_id`
- `src/modules/deliverer/http/requests/delivery-block-timeline.request.ts` — pattern DTO nhận `month` / `weekStart`
- `src/entities/delivery-block.entity.ts` — cột `deliverer_id`, `driver_id`, `cargo_type`, `scheduled_delivery_date`

## Yêu cầu implement

### Tạo: `src/modules/deliverer/http/controllers/deliverer-schedule.controller.ts`
```typescript
@Controller('schedule')
// GET 'monthly' → service.monthly(delivererId, query)
// Guard: DelivererGuard (copy từ delivery-block.controller.ts)
// Swagger: @ApiUnifiedResponse + mô tả tiếng Anh như các controller khác
```

### Tạo: `src/modules/deliverer/http/requests/deliverer-schedule-query.request.ts`
```typescript
// month: string — required, @Matches(/^\d{4}-(0[1-9]|1[0-2])$/)
// keyword?: string — @MaxLength(255)        ← dùng ở task-2-4, khai báo sẵn
// addressKeyword?: string — @MaxLength(255) ← dùng ở task-2-4, khai báo sẵn
```

### Tạo: `src/modules/deliverer/services/deliverer-schedule.service.ts`
```typescript
async monthly(delivererId: string, q: DelivererScheduleQueryRequest) {
  // 1. Tính [gridStart, gridEnd] — bao cả ngày tràn tháng trước/sau cho đủ lưới 6 tuần
  // 2. 1 query GROUP BY scheduled_delivery_date, cargo_type  → counts { frozen, chilled, material }
  // 3. 1 query GROUP BY scheduled_delivery_date WHERE driver_id IS NULL → unassignedCount
  // 4. Merge vào mảng ngày liên tục; ngày không có dữ liệu vẫn trả về với count = 0
  // TUYỆT ĐỐI không query trong vòng lặp ngày (N+1)
}
```

### Tạo: `src/modules/deliverer/http/responses/deliverer-schedule.response.ts`
Field theo Design-Technical §4 `MonthlyDay`: `date`, `counts`, `unassignedCount`, `isToday`.
Các field `cycleLabel`, `isCurrentMonthCycle`, `cycleSuspended`, `temporaryClosed` **khai báo sẵn trong DTO** (trả `null`/`false`) để task-2-2 điền — tránh FE phải đổi type 2 lần.

### Đăng ký trong `src/modules/deliverer/deliverer.module.ts`

## Unit Tests (BẮT BUỘC)

### Test file: `src/modules/deliverer/services/deliverer-schedule.service.spec.ts`
```typescript
describe('DelivererScheduleService.monthly', () => {
  // createMock<Repository<DeliveryBlockEntity>>() theo pattern @golevelup/ts-jest
  it('should return a continuous day array covering the whole grid', ...);
  it('should map cargo_type to frozen/chilled/material counts', ...);
  it('should count only blocks with driver_id IS NULL as unassigned', ...);
  it('should scope every query to the current delivererId', ...);
  it('should return zero counts for days without delivery blocks', ...);
});
```
**Coverage target:** `deliverer-schedule.service.ts` ≥ 80%, controller ≥ 70%
**Verify:** `npm run test -- deliverer-schedule`

## API Definition
| Method | Endpoint | Request | Response |
|---|---|---|---|
| GET | `/deliverer/schedule/monthly` | `?month=2026-08` | `{ month, days: MonthlyDay[] }` |

```
MonthlyDay: {
  date: string                 // YYYY-MM-DD
  counts: { frozen: number, chilled: number, material: number }
  unassignedCount: number
  isToday: boolean
  cycleLabel: null             // task-2-2 điền
  isCurrentMonthCycle: false   // task-2-2 điền
  cycleSuspended: false        // task-2-2 điền
  temporaryClosed: false       // task-2-2 điền
}
```
**Auth:** Bearer JWT + `DelivererGuard`

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| `/deliverer/delivery-blocks/summary` (màn 月次サマリー hiện tại) | `delivery-block.controller.ts` | Gọi endpoint cũ, response không đổi |
| `/deliverer/delivery-blocks/timeline` | `delivery-block.controller.ts` | Gọi endpoint cũ, response không đổi |

## Không được làm
- Không sửa / xoá `/delivery-blocks/timeline` và `/summary` — FE cũ còn dùng, dọn ở task riêng sau khi FE-01/02 pass QA
- Không thêm Redis / cache — repo không dùng Redis
- Không tự đổi tên `deliverer_id` scope hay bỏ `DelivererGuard`

## Definition of Done
- [ ] Build pass · Lint pass
- [ ] Unit Tests pass — coverage đạt target
- [ ] **API Definition điền đủ** — FE có thể bắt đầu task-3-5
- [ ] Non-Regression verify đủ
- [ ] Actual Hour cập nhật · Status → `Done` → `Reviewing`
