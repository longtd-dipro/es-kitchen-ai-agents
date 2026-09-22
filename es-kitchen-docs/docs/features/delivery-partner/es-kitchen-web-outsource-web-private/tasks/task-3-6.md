# [FE] [Delivery_Web] — スケジュール: ô ngày (サイクル, badge 件数, 臨時休業) + 凡例

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
| Depends on | task-3-5, **task-2-2 (BE)** |
| Song song với | task-3-11 |
| Estimate | ~7h |

## Mục tiêu
Hoàn thiện nội dung ô ngày: nhãn サイクル, badge số kiện theo 温度帯, tag `臨時休業`, text `サイクル休止`, badge cảnh báo `⚠ 未N件`, và khối 凡例 dưới lịch.

## Context (đọc trước khi code)
- **Figma:** node **`31498:190314`** — đọc kỹ khối 凡例 ở cuối trang, copy đúng nhãn
- **Design-Technical.md (FE)** → FE-01
- **BE task:** `task-2-2.md` → 4 field `cycleLabel`, `isCurrentMonthCycle`, `cycleSuspended`, `temporaryClosed`
- `src/components/Common/BaseBadgeStatus.tsx` — badge có sẵn, ưu tiên tái dùng
- `.claude/rules/design_rule.md` §1–§3 — token màu, **không hard-code hex**

## API Definition
Dùng lại response của task-2-1/2-2 (không thêm endpoint).

## Yêu cầu implement

### Step 1/2 — không đổi service/hook
### Step 3 — `src/pages/schedule/components/ScheduleDayCell.tsx`
| Dữ liệu | Hiển thị |
|---|---|
| `date` | số ngày, góc trên trái |
| `temporaryClosed` | tag đỏ `臨時休業` góc trên phải |
| `cycleLabel` | dòng `8月サイクル A1`; `isCurrentMonthCycle=false` → màu nhạt hơn |
| `cycleSuspended` | text `サイクル休止`, ẩn badge số kiện |
| `counts.frozen / chilled / material` | 3 badge `N件` kèm icon 温度帯 (ẩn badge khi = 0) |
| `unassignedCount > 0` | badge cảnh báo `⚠ 未N件` |
| `isToday` | viền nhấn |

- Khối `凡例` đặt cuối `MonthlyCalendarTab`, liệt kê đủ mục như Figma
- Click ô ngày → `navigate('/delivery-status?dateFrom=<d>&dateTo=<d>')`

## Unit Tests (BẮT BUỘC)
### `ScheduleDayCell.test.tsx`
```typescript
it('hides a temperature badge when its count is zero', ...);
it('renders the unassigned warning badge only when unassignedCount > 0', ...);
it('renders サイクル休止 and hides count badges when cycleSuspended', ...);
it('renders the 臨時休業 tag when temporaryClosed', ...);
it('navigates to the delivery list with the clicked date', ...);
```
**Coverage:** ≥ 70% · **Verify:** `npm run test -- --coverage ScheduleDayCell`

## Kiểm tra Integration (BẮT BUỘC)
- [ ] Dữ liệu thật: ngày có kiện hiển thị đúng số lượng theo 温度帯
- [ ] Bấm ô ngày → sang màn 配送管理 lọc đúng ngày đó
- [ ] Ngày `temporaryClosed` hiển thị tag (nếu BE đã bật cờ; nếu BE trả `false` thì không có tag — đúng như thiết kế)

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Lưới lịch (task-3-5) | `MonthlyCalendarTab.tsx` | Test suite task-3-5 vẫn pass |
| Màn 配送状況 | `DeliveryStatusPage.tsx` | Nhận query param ngày không làm vỡ filter hiện có |

## Không được làm
- Không hard-code mã màu — dùng token trong `design_rule.md`
- Không tự chế nhãn 凡例 khác Figma
- Không gọi thêm API cho từng ô ngày

## Definition of Done
- [ ] Build · Lint · Type-check · Unit Tests pass
- [ ] Integration check pass · Non-Regression verify đủ
- [ ] Actual Hour · Status → `Done` → `Reviewing`
