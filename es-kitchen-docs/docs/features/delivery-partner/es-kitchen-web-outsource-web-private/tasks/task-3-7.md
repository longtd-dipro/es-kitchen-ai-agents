# [FE] [Delivery_Web] — スケジュール: thanh điều khiển 月/週 + điều hướng tháng + đồng bộ URL

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
| Depends on | task-3-5 |
| Song song với | task-3-8 |
| Estimate | ~6h |

## Mục tiêu
Thanh công cụ trên lịch: nút `月` / `週`, chọn tháng, `<` `>`, `今日`; toàn bộ trạng thái đồng bộ lên URL để reload/chia sẻ link giữ nguyên màn hình.

## Context (đọc trước khi code)
- **Figma:** node `31498:190314` (trạng thái 月) và `31498:191010` (trạng thái 週)
- **Design-Technical.md (FE)** → FE-01, §2.3 (lý do đặt state trên URL)
- `src/pages/schedule/SchedulePage.tsx` — đã có cơ chế `?tab=`, mở rộng thêm `?month=` / `?week=`
- `src/hooks/router.ts` — `useRouter`, `useSearchParams`

## Yêu cầu implement

### Step 3 — `src/pages/schedule/components/ScheduleToolbar.tsx` + sửa `SchedulePage.tsx`
```typescript
// URL: /schedule?tab=monthly&month=2026-08   |   /schedule?tab=weekly&week=2026-W32
// 月/週: đổi tab + chuyển đổi giá trị tương ứng (tháng ↔ tuần đầu tiên của tháng)
// < >  : lùi/tiến 1 tháng (tab monthly) hoặc 1 tuần (tab weekly)
// 今日 : nhảy về tháng/tuần hiện tại
// router.replace (không push) để không làm phình history khi bấm liên tục
```

## Unit Tests (BẮT BUỘC)
### `ScheduleToolbar.test.tsx`
```typescript
it('writes month to the URL when navigating with the next arrow', ...);
it('switches tab and keeps an equivalent period when toggling 月/週', ...);
it('jumps back to the current period on 今日', ...);
it('reads the initial period from the URL on mount', ...);
it('falls back to the current month for an invalid month param', ...);
```
**Coverage:** ≥ 70% · **Verify:** `npm run test -- --coverage ScheduleToolbar`

## Kiểm tra Integration (BẮT BUỘC)
- [ ] Bấm `>` nhiều lần → API được gọi đúng tháng mới, dữ liệu đổi
- [ ] Copy URL mở tab mới → hiển thị đúng tháng/tuần đó
- [ ] Đổi 月 ↔ 週 giữ đúng khoảng thời gian đang xem

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| `?tab=` hiện có | `SchedulePage.tsx` | Link cũ `/schedule?tab=weekly` vẫn mở đúng tab |
| Tab cũ | `MonthlySummaryTab.tsx`, `WeeklyTimelineTab.tsx` | Vẫn hoạt động |

## Không được làm
- Không dùng `router.push` cho mỗi lần bấm mũi tên
- Không lưu tháng đang xem vào Redux hay localStorage

## Definition of Done
- [ ] Build · Lint · Type-check · Unit Tests pass
- [ ] Integration check pass · Non-Regression verify đủ
- [ ] Actual Hour · Status → `Done` → `Reviewing`
