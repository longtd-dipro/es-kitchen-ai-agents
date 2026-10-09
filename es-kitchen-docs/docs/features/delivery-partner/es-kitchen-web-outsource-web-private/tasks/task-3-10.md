# [FE] [Delivery_Web] — スケジュール: thanh tìm kiếm 2 nhóm điều kiện

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
| Depends on | **task-2-4 (BE)**, task-3-5 |
| Song song với | task-3-9 |
| Estimate | ~6h |

## Mục tiêu
Thanh tìm kiếm dùng chung cho cả lịch tháng và tuần: ô `法人ID・名、拠点ID・名、契約ID` và ô `住所、郵便番号、電話番号、担当者電話番号`, kèm nút `クリア` / `検索`.

## Context (đọc trước khi code)
- **Figma:** node `31498:190314` (thanh search phía trên lịch) và component `31498:191825`
- **Design-Technical.md (FE)** → FE-03
- **BE task:** `task-2-4.md` → param `keyword`, `addressKeyword`
- `src/pages/delivery-status/components/DeliveryFilterBar.tsx` — pattern filter bar hiện có
- `src/pages/delivery-status/components/deliveryFilter.constants.ts` — pattern constants

## API Definition (copy từ BE task-2-4)
| Method | Endpoint | Param thêm |
|---|---|---|
| GET | `/schedule/monthly` | `keyword`, `addressKeyword` |
| GET | `/schedule/weekly` | `keyword`, `addressKeyword` |

## Yêu cầu implement

### Step 1/2 — mở rộng type params của service + hook (không tạo service mới)
### Step 3 — `src/pages/schedule/components/ScheduleFilterBar.tsx`
- 2 ô input với placeholder đúng như Figma
- `検索` → ghi `keyword` / `addressKeyword` vào URL query → hook refetch
- `クリア` → xoá 2 param khỏi URL, giữ nguyên `tab` và `month`/`week`
- Dùng `react-hook-form` theo convention repo; **không** gọi API khi đang gõ (chỉ khi submit)

## Unit Tests (BẮT BUỘC)
```typescript
it('submits both keyword fields into the URL query', ...);
it('clears only the keyword params and keeps tab/month', ...);
it('does not trigger a request while typing', ...);
it('restores field values from the URL on mount', ...);
```
**Coverage:** ≥ 70% · **Verify:** `npm run test -- --coverage ScheduleFilterBar`

## Kiểm tra Integration (BẮT BUỘC)
- [ ] Nhập tên công ty thật → lịch chỉ còn ngày có đơn của công ty đó
- [ ] `クリア` → lịch trở lại đầy đủ, vẫn giữ tháng đang xem
- [ ] Filter áp dụng được cho cả tab 月 và 週

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Toolbar (task-3-7) | `ScheduleToolbar.tsx` | Đổi tháng khi đang có filter → filter được giữ |
| Lịch không filter | `MonthlyCalendarTab.tsx` | Không nhập gì → kết quả như trước |

## Không được làm
- Không thêm điều kiện lọc ngoài 2 nhóm Figma vẽ
- Không debounce gọi API theo từng ký tự

## Definition of Done
- [ ] Build · Lint · Type-check · Unit Tests pass
- [ ] Integration check pass · Non-Regression verify đủ
- [ ] Actual Hour · Status → `Done` → `Reviewing`
