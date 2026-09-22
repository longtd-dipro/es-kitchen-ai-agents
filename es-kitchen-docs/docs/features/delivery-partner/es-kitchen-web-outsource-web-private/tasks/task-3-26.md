# [FE] [Delivery_Web] — ホーム: lịch tháng thu nhỏ (今月の配送スケジュール)

## Backlog Info
- **Issue Type:** Task · **Category:** Delivery_Web
- **Parent Issue:** Delivery Partner P2 — ホーム
- **Version:** _TBD_ · **Milestone:** _TBD_
- **Estimate Hour:** 7h · **Actual Hour:** — · **Status:** Open

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 3 — Frontend |
| Repo | `es-kitchen-web-outsource-web-private` |
| Depends on | **task-2-11 (BE)**, task-3-6 |
| Song song với | task-3-27 |
| Estimate | ~7h |

## Mục tiêu
Khối trái màn ホーム: lịch tháng thu nhỏ hiển thị サイクル, số kiện, cảnh báo chưa gán tài xế, kèm link `スケジュールへ`.

## Context (đọc trước khi code)

### 🎨 Figma
- **Screen Code:** `OW_HOME_001` · node **`31498:189875`** — khối `今月の配送スケジュール` + 凡例 rút gọn

### 🏗️ Tech Lead output
- **Design-Technical.md (FE)** → FE-14, §2.1
- **BE task:** `task-2-11.md` → `calendar[]`

### 📂 File liên quan
- `src/pages/dashboard/DashboardPage.tsx` — hiện chỉ có `AnnouncementCard`
- `src/pages/schedule/components/ScheduleDayCell.tsx` (task-3-6) — **tái dùng ở chế độ compact**, không copy code

## API Definition (copy từ BE task-2-11)
| Method | Endpoint | Response |
|---|---|---|
| GET | `/dashboard/overview` | `{ calendar, announcements, unansweredQuotations }` |

```
calendar: Array<{ date, cycleLabel, totalCount, unassignedCount, temporaryClosed }>
```

## Yêu cầu implement

### Step 1 — `src/services/client/dashboard.service.ts`: `fetchDashboardOverview()`
### Step 2 — `src/hooks/useDashboard.ts`: `useDashboardOverview()`
### Step 3 — `src/pages/dashboard/components/MiniCalendarCard.tsx`
- Lưới tháng hiện tại, mỗi ô: số ngày · `cycleLabel` · `配送：N件` · badge `⚠ 未N件` · tag `臨時休業`
- Thêm prop `compact` cho `ScheduleDayCell` thay vì viết component thứ hai
- Link `スケジュールへ` → `/schedule?tab=monthly`
- Bấm 1 ngày → `/delivery-status?dateFrom=&dateTo=`
- Khối 凡例 rút gọn theo Figma

## Unit Tests (BẮT BUỘC)
```typescript
it('renders the current month grid from the overview payload', ...);
it('shows the unassigned warning badge', ...);
it('links to the full schedule page', ...);
it('renders loading and error states', ...);
```
**Coverage:** ≥ 70% · **Verify:** `npm run test -- --coverage MiniCalendar`

## Kiểm tra Integration (BẮT BUỘC)
- [ ] Số liệu trên ホーム khớp với màn スケジュール cùng tháng
- [ ] Bấm ngày → sang 配送管理 lọc đúng ngày
- [ ] 1 request duy nhất cho cả màn ホーム (kiểm tra tab Network)

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Dashboard cũ | `DashboardPage.tsx` | `AnnouncementCard` cũ vẫn hiển thị cho tới khi task-3-27 thay |
| `ScheduleDayCell` | `ScheduleDayCell.tsx` | Màn スケジュール không đổi giao diện khi thêm prop `compact` |

## Không được làm
- Không gọi `/schedule/monthly` riêng ở màn ホーム (đã có trong overview)
- Không copy-paste `ScheduleDayCell`

## Definition of Done
- [ ] Step 1/2/3 hoàn tất · Build · Lint · Type-check · Unit Tests pass
- [ ] Integration check pass · Non-Regression verify đủ · Actual Hour · Status → `Done` → `Reviewing`
