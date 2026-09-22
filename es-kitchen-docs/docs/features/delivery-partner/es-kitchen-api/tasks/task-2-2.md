# [BE] [Delivery_Web] — API lịch tháng: nhãn サイクル, サイクル休止, 臨時休業

## Backlog Info
- **Issue Type:** Task
- **Category:** Delivery_Web
- **Parent Issue:** Delivery Partner P2 — スケジュール
- **Version:** _TBD_
- **Milestone:** _TBD_
- **Estimate Hour:** 5h
- **Actual Hour:** —
- **Status:** Open

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 2 — Service + API |
| Repo | `es-kitchen-api` |
| Depends on | task-2-1 |
| Song song với | task-2-5 |
| Estimate | ~5h |

## Mục tiêu
Điền 4 field còn lại của `MonthlyDay`: `cycleLabel` (vd `8月サイクル A1`), `isCurrentMonthCycle`, `cycleSuspended`, `temporaryClosed` — để FE vẽ đúng nhãn và màu theo 凡例 của Figma.

## Context (đọc trước khi code)

### 🏗️ Tech Lead output
- **Design-Technical.md** → §3.1 (bảng tái dùng), §4 `MonthlyDay`
- **Figma-Analysis.md** → §2.3 + §4 **Q8-note** (nguồn 臨時休業 chưa chốt)

### 📂 File liên quan trong codebase
- `src/entities/delivery-cycle.entity.ts` — `week_label` ('A'–'D'), `group_no`, `default_weekday`, `is_active`
- `src/entities/delivery-cycle-assignment.entity.ts` — `cycle_id`, `contract_id`, `company_id`, `effective_from`, `effective_to`
- `src/entities/picking-unavailable-day.entity.ts` — `unavailable_date`, `company_id`, `contract_id`
- `src/modules/admin/delivery/services/delivery-cycle.service.ts` — **đọc trước**: admin đã có logic suy ra cycle theo ngày, tái dùng cách tính, không tự nghĩ công thức mới

## Yêu cầu implement

### Sửa: `src/modules/deliverer/services/deliverer-schedule.service.ts`
```typescript
// Thêm 1 query lấy delivery_cycle_assignments JOIN delivery_cycles
//   WHERE effective_from <= day AND (effective_to IS NULL OR effective_to >= day)
//   scope theo các contract có delivery_block thuộc deliverer hiện tại
// → cycleLabel = `${monthOfCycle}月サイクル ${week_label}${group_no}`
// → isCurrentMonthCycle = tháng của cycle === tháng đang xem
// → cycleSuspended = ngày nằm trong tháng nhưng không khớp assignment nào
```

### ⚠️ `temporaryClosed` — CHỜ XÁC NHẬN
Design-Technical đánh dấu `[PENDING]`: nguồn dự kiến là `picking_unavailable_days` nhưng **chưa có xác nhận nghiệp vụ** rằng 臨時休業 = ngày trong bảng này.

→ Trong task này: implement hàm `resolveTemporaryClosed()` đọc từ `picking_unavailable_days`, **đặt sau feature flag/env hoặc trả `false` mặc định**, và **hỏi PM trước khi bật**. Không tự khẳng định mapping trong code comment.

## Unit Tests (BẮT BUỘC)

### Test file: bổ sung vào `deliverer-schedule.service.spec.ts`
```typescript
it('should build cycleLabel from week_label + group_no', ...);
it('should mark cycleSuspended when no assignment is effective on that day', ...);
it('should flag isCurrentMonthCycle=false for cycles belonging to another month', ...);
it('should not query cycles per day (single query for the whole range)', ...);
```
**Coverage target:** ≥ 80% · **Verify:** `npm run test -- deliverer-schedule`

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Lịch chu kỳ phía Admin | `src/modules/admin/delivery/services/delivery-cycle.service.ts` | Không sửa file này; gọi `/admin/delivery-cycles` xác nhận không đổi |
| Response task-2-1 | `deliverer-schedule.response.ts` | 4 field cũ (`counts`, `unassignedCount`…) giữ nguyên |

## Không được làm
- Không sửa logic cycle của admin — chỉ đọc
- Không bật `temporaryClosed` khi PM chưa xác nhận nguồn dữ liệu
- Không thêm bảng mới

## Definition of Done
- [ ] Build · Lint · Unit Tests pass
- [ ] `temporaryClosed` có ghi chú rõ trạng thái chờ xác nhận trong PR description
- [ ] Non-Regression verify đủ
- [ ] Actual Hour · Status → `Done` → `Reviewing`
