# [FE] [Delivery_Web] — ホーム: khối お知らせ + 未回答の見積もり依頼

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
| Depends on | task-3-26, task-3-4 |
| Song song với | task-3-28 |
| Estimate | ~7h |

## Mục tiêu
Cột phải màn ホーム: danh sách お知らせ mới nhất (có badge loại) và danh sách 見積 chưa trả lời kèm hạn trả lời.

## Context (đọc trước khi code)

### 🎨 Figma
- node **`31498:189875`** — khối `お知らせ` (badge `システム更新` / `お知らせ` / `メンテナンス`) và khối `未回答の見積もり依頼` (badge `未回答`, `回答期限：YYYY/MM/DD`)

### 🏗️ Tech Lead output
- **Design-Technical.md (FE)** → FE-14, **FE-14b [PENDING Q9]**
- **BE task:** `task-2-11.md` → `announcements`, `unansweredQuotations`

### ⚠️ Vấn đề đã biết — Q9
`NotificationType` của BE có 7 giá trị và **không có giá trị nào tương ứng badge `メンテナンス`**.
→ Task này map các giá trị **đang có** sang nhãn hiển thị, các giá trị chưa xác định dùng nhãn mặc định `お知らせ`. **Không tự chế giá trị mới.** Ghi rõ mapping đã dùng trong PR để cập nhật khi Q9 có câu trả lời.

## API Definition (copy từ BE task-2-11)
```
announcements: Array<{ id, type: NotificationType, isImportant, title, createdAt, isRead }>   // ≤ 4
unansweredQuotations: Array<{ id, requestNo, title, receivedAt, deadline, status }>           // ≤ 3
```

## Yêu cầu implement

### Step 1/2 — dùng lại `useDashboardOverview()` (task-3-26), không thêm request
### Step 3
- `components/AnnouncementList.tsx`: mỗi dòng có thời điểm (`今日 · 07:00` / `昨日 · 09:00` / ngày cụ thể), badge loại, tiêu đề (link sang `/announcements/:id`), mũi tên phải; dòng chưa đọc in đậm
- `components/UnansweredQuoteList.tsx`: mỗi dòng có ngày nhận, badge `未回答`, `回答期限`, tiêu đề link sang màn 見積
- Mỗi khối có link `見積もり一覧へ` / xem tất cả ở header khối
- Thay `AnnouncementCard` cũ bằng 2 component này trong `DashboardPage.tsx`

## Unit Tests (BẮT BUỘC)
```typescript
it('renders at most 4 announcements and 3 quotations', ...);
it('formats today/yesterday labels correctly', ...);
it('falls back to the default badge for an unmapped notification type', ...);
it('links each announcement to its detail page', ...);
it('renders empty states for both blocks', ...);
```
**Coverage:** ≥ 70% · **Verify:** `npm run test -- --coverage dashboard`

## Kiểm tra Integration (BẮT BUỘC)
- [ ] Thông báo thật hiển thị đúng thứ tự mới nhất
- [ ] Bấm 1 thông báo → mở màn chi tiết (task-3-4), sau khi quay lại dòng đó hết in đậm
- [ ] Màn ホーム vẫn chỉ gọi 1 request

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| `AnnouncementCard` cũ | `pages/dashboard/components/AnnouncementCard.tsx` | Nếu gỡ hẳn → không còn chỗ nào import; chạy build kiểm tra |
| Mini calendar (task-3-26) | `MiniCalendarCard.tsx` | Layout 2 cột không vỡ ở 1280px |

## Không được làm
- Không tự thêm giá trị `NotificationType`
- Không gọi `/notifications` riêng ở màn ホーム
- Không tự đánh dấu đã đọc ở FE

## Definition of Done
- [ ] Build · Lint · Type-check · Unit Tests pass
- [ ] Mapping badge ghi rõ trong PR (chờ Q9)
- [ ] Integration check pass · Non-Regression verify đủ · Actual Hour · Status → `Done` → `Reviewing`
