# [FE] [Delivery_Web] — スケジュール: service + hook + khung lưới lịch tháng

## Backlog Info
- **Issue Type:** Task · **Category:** Delivery_Web
- **Parent Issue:** Delivery Partner P2 — スケジュール
- **Version:** _TBD_ · **Milestone:** _TBD_
- **Estimate Hour:** 7h · **Actual Hour:** — · **Status:** Open

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 3 — Frontend |
| Repo | `es-kitchen-web-outsource-web-private` |
| Depends on | **task-2-1 (BE)** |
| Song song với | task-3-11 |
| Estimate | ~7h |

## Mục tiêu
Dựng `MonthlyCalendarTab` — lưới 7×6 hiển thị đúng ngày của tháng (kèm ngày tràn tháng trước/sau), lấy dữ liệu thật từ `/schedule/monthly`.

## Context (đọc trước khi code)

### 🎨 Figma
- **Screen Code:** `OW_SCHED_001` · node **`31498:190314`**

### 🏗️ Tech Lead output
- **Design-Technical.md (FE)** → FE-01, §2.1 (component tree)
- **BE task liên quan:** `task-2-1.md` → section **API Definition** (CONTRACT LOCK)

### 📂 File liên quan trong codebase
- `src/services/client/schedule.service.ts` — pattern `APIs` object + `IBaseApiResponse`
- `src/hooks/useSchedule.ts` — pattern `useQuery`
- `src/pages/schedule/SchedulePage.tsx` — pattern đổi tab qua `?tab=`
- `src/pages/schedule/components/MonthlySummaryTab.tsx` — **tab cũ, KHÔNG xoá trong task này**

## API Definition (copy từ BE task-2-1)
| Method | Endpoint | Request | Response |
|---|---|---|---|
| GET | `/schedule/monthly` | `?month=2026-08` | `{ month, days: MonthlyDay[] }` |

```
MonthlyDay: { date, counts: { frozen, chilled, material }, unassignedCount, isToday,
              cycleLabel, isCurrentMonthCycle, cycleSuspended, temporaryClosed }
```
**Base URL:** `import.meta.env.VITE_API_URL`

## Yêu cầu implement

### Step 1 — `src/services/client/schedule.service.ts`
```typescript
const APIs = { MONTHLY: '/schedule/monthly', WEEKLY: '/schedule/weekly' };  // WEEKLY dùng ở task-3-8
export const fetchMonthlySchedule = async (params: MonthlyScheduleParams): Promise<MonthlyScheduleResult> => {
  const res: IBaseApiResponse<MonthlyScheduleResult> = await API.get(APIs.MONTHLY, params);
  return res.data;
};
```
Model mới đặt trong `src/models/schedule.ts` — **không sửa type cũ** đang dùng bởi tab hiện tại.

### Step 2 — `src/hooks/useSchedule.ts`
```typescript
export const useMonthlySchedule = (params: MonthlyScheduleParams) =>
  useQuery({ queryKey: ['schedule-monthly', params], queryFn: () => fetchMonthlySchedule(params),
             placeholderData: keepPreviousData });
```

### Step 3 — `src/pages/schedule/components/MonthlyCalendarTab.tsx`
- Header cột: 月 火 水 木 金 **土 (xanh)** **日 (đỏ)**
- Lưới 7 cột; ngày ngoài tháng hiển thị mờ; ô `isToday` có viền nhấn
- Ô ngày render qua `<ScheduleDayCell>` — **task này chỉ render số ngày + placeholder**, nội dung badge làm ở task-3-6
- Loading: skeleton lưới; Error: thông báo + nút thử lại
- Đăng ký tab mới vào `scheduleTabs.constants.ts` (thêm key, **không xoá key cũ**)

## Unit Tests (BẮT BUỘC)
### `src/hooks/useSchedule.test.ts`
```typescript
it('calls /schedule/monthly with the month param', ...);   // msw mock
it('keeps previous data while refetching another month', ...);
```
### `src/pages/schedule/components/MonthlyCalendarTab.test.tsx`
```typescript
it('renders 7 weekday headers and a full 6-week grid', ...);
it('dims days outside the current month', ...);
it('highlights today', ...);
it('renders the error state when the query fails', ...);
```
**Coverage:** service ≥ 70%, hook ≥ 70%, component ≥ 70% · **Verify:** `npm run test -- --coverage schedule`

## Kiểm tra Integration (BẮT BUỘC)
- [ ] BE-localhost + FE-localhost: lưới hiển thị số ngày đúng theo `month` từ API (không mock)
- [ ] Loading hiển thị khi fetch; Error hiển thị khi API lỗi
- [ ] Tab cũ 月次サマリー vẫn mở được

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Tab 月次サマリー hiện tại | `MonthlySummaryTab.tsx` | Vẫn mở và hiển thị đủ dữ liệu |
| Tab 週間タイムライン | `WeeklyTimelineTab.tsx` | Vẫn hoạt động |

## Không được làm
- **Không xoá** `MonthlySummaryTab` / `WeeklyTimelineTab` trong task này
- Không mock data trong production code
- Không tạo Redux slice cho lịch

## Definition of Done
- [ ] Step 1/2/3 hoàn tất · Build · Lint · Type-check pass
- [ ] Unit Tests pass — coverage đạt target
- [ ] Integration check pass · Non-Regression verify đủ
- [ ] Actual Hour · Status → `Done` → `Reviewing`
