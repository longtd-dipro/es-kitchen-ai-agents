# [FE] [Delivery_Web] — スケジュール tuần: service + hook + khung 7 cột

## Backlog Info
- **Issue Type:** Task · **Category:** Delivery_Web
- **Parent Issue:** Delivery Partner P2 — スケジュール
- **Version:** _TBD_ · **Milestone:** _TBD_
- **Estimate Hour:** 6h · **Actual Hour:** — · **Status:** Open

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 3 — Frontend |
| Repo | `es-kitchen-web-outsource-web-private` |
| Depends on | **task-2-3 (BE)**, task-3-5 |
| Song song với | task-3-7 |
| Estimate | ~6h |

## Mục tiêu
Dựng `WeeklyListTab` — 7 cột ngày, mỗi cột có tiêu đề ngày + サイクル + tổng số kiện, lấy dữ liệu thật từ `/schedule/weekly`.

## Context (đọc trước khi code)

### 🎨 Figma
- **Screen Code:** `OW_SCHED_002` · node **`31498:191010`**
- ⚠️ **KHÔNG dùng** frame `weekly-schedule` (`31498:194865`) — thuộc vùng nháp, có 午前便/午後便/夕方便 không nằm trong scope

### 🏗️ Tech Lead output
- **Design-Technical.md (FE)** → FE-02
- **BE task:** `task-2-3.md` → API Definition

### 📂 File liên quan
- `src/services/client/schedule.service.ts` (task-3-5), `src/hooks/useSchedule.ts`
- `src/pages/schedule/components/ScheduleDayColumn.tsx` — **component cũ cùng tên**, đọc trước để quyết định tái dùng hay tạo mới

## API Definition (copy từ BE task-2-3)
| Method | Endpoint | Request | Response |
|---|---|---|---|
| GET | `/schedule/weekly` | `?week=2026-W32` hoặc `?from=&to=` | `{ from, to, days: WeeklyDay[] }` |

```
WeeklyDay: { date, cycleLabel, isCurrentMonthCycle, totalCount,
             items: Array<{ deliveryBlockId, shipmentNo, destinationName, cargoType }> }
```

## Yêu cầu implement

### Step 1 — `schedule.service.ts`: thêm `fetchWeeklySchedule(params)` dùng `APIs.WEEKLY`
### Step 2 — `useSchedule.ts`: thêm `useWeeklySchedule(params)` (`useQuery` + `keepPreviousData`)
### Step 3 — `src/pages/schedule/components/WeeklyListTab.tsx`
- 7 cột đều nhau, tiêu đề `8月3日 月` (thứ 土 xanh / 日 đỏ)
- Dưới tiêu đề: `cycleLabel` + tổng `配送：N件`
- Vùng danh sách để trống ở task này (task-3-9 điền), có chiều cao cố định + scroll

## Unit Tests (BẮT BUỘC)
```typescript
// useSchedule.test.ts
it('calls /schedule/weekly with the week param', ...);
// WeeklyListTab.test.tsx
it('renders exactly 7 day columns', ...);
it('colors Saturday blue and Sunday red', ...);
it('renders the loading and error states', ...);
```
**Coverage:** ≥ 70% · **Verify:** `npm run test -- --coverage Weekly`

## Kiểm tra Integration (BẮT BUỘC)
- [ ] Dữ liệu thật: 7 cột đúng ngày của tuần đang chọn
- [ ] Đổi tuần bằng `<` `>` (task-3-7) → gọi API đúng tuần mới

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| `WeeklyTimelineTab` cũ | `WeeklyTimelineTab.tsx` | Vẫn mở được, chưa xoá |
| `ScheduleDayColumn` cũ | `ScheduleDayColumn.tsx` | Nếu tái dùng → màn cũ không vỡ layout |

## Không được làm
- Không implement 午前/午後/夕方便
- Không xoá tab cũ trong task này
- Không mock data

## Definition of Done
- [ ] Step 1/2/3 hoàn tất · Build · Lint · Type-check · Unit Tests pass
- [ ] Integration check pass · Non-Regression verify đủ
- [ ] Actual Hour · Status → `Done` → `Reviewing`
