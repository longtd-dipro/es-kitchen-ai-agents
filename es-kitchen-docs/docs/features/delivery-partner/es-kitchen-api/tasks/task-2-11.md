# [BE] [Delivery_Web] — API tổng hợp màn ホーム (dashboard overview)

## Backlog Info
- **Issue Type:** Task · **Category:** Delivery_Web
- **Parent Issue:** Delivery Partner P2 — ホーム
- **Version:** _TBD_ · **Milestone:** _TBD_
- **Estimate Hour:** 8h · **Actual Hour:** — · **Status:** Open

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 2 — Service + API |
| Repo | `es-kitchen-api` |
| Depends on | task-2-1 |
| Song song với | task-2-9 |
| Estimate | ~8h |

## Mục tiêu
Tạo `GET /deliverer/dashboard/overview` gộp 3 khối của màn ホーム trong 1 lần gọi: mini-calendar tháng hiện tại, 4 お知らせ mới nhất, 3 見積 chưa trả lời.

## Context (đọc trước khi code)
- **Design-Technical.md** → §4 BE-10, §2.3 (lý do gộp 1 endpoint)
- **Figma-Analysis.md** → §2.2, node `31498:189875`
- `src/modules/deliverer/services/deliverer-notification.service.ts`
- `src/modules/deliverer/services/deliverer-quotation-request.service.ts`
- `src/commons/enums/notification.enum.ts` — **7 giá trị**, KHÔNG có giá trị cho badge `メンテナンス`

## Yêu cầu implement

### Tạo: `src/modules/deliverer/http/controllers/deliverer-dashboard.controller.ts` + `services/deliverer-dashboard.service.ts`
```typescript
async overview(delivererId) {
  const [calendar, announcements, quotations] = await Promise.all([
    this.scheduleService.monthly(delivererId, { month: currentMonth }),  // rút gọn field
    this.notificationService.list(delivererId, { page: 1, limit: 4 }),
    this.quotationService.listUnanswered(delivererId, { limit: 3 }),
  ]);
  // Service này KHÔNG tự query bảng — chỉ gọi 3 service con
}
```
Mini-calendar chỉ trả `date, cycleLabel, totalCount, unassignedCount, temporaryClosed` — **không** trả danh sách điểm giao (payload).

### ⚠️ Badge loại thông báo — `[PENDING Q9]`
Figma hiển thị 3 badge `システム更新 / お知らせ / メンテナンス`. Enum hiện tại không có giá trị cho `メンテナンス`.
→ Task này **trả thẳng `type: NotificationType` + `isImportant`**, KHÔNG tự chế giá trị mới. FE map tạm; khi PM trả lời Q9 mới bổ sung enum (task riêng).

## Unit Tests (BẮT BUỘC)
### Test file: `deliverer-dashboard.service.spec.ts`
```typescript
it('should call the three child services in parallel', ...);
it('should limit announcements to 4 and quotations to 3', ...);
it('should strip per-day item list from the calendar payload', ...);
it('should not query repositories directly', ...);
it('should scope every child call to the current delivererId', ...);
```
**Coverage:** service ≥ 80%, controller ≥ 70% · **Verify:** `npm run test -- dashboard`

## API Definition
| Method | Endpoint | Request | Response |
|---|---|---|---|
| GET | `/deliverer/dashboard/overview` | — | `{ calendar, announcements, unansweredQuotations }` |

```
calendar: Array<{ date, cycleLabel, totalCount, unassignedCount, temporaryClosed }>
announcements: Array<{ id, type: NotificationType, isImportant, title, createdAt, isRead }>   // tối đa 4
unansweredQuotations: Array<{ id, requestNo, title, receivedAt, deadline, status }>           // tối đa 3
```

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| `/deliverer/notifications` | `deliverer-notification.service.ts` | Không sửa service; endpoint cũ vẫn chạy |
| `/deliverer/quotation-requests` | `deliverer-quotation-request.service.ts` | Nếu thêm `listUnanswered()` thì chỉ THÊM method, không sửa method cũ |
| `/schedule/monthly` | `deliverer-schedule.service.ts` | Endpoint đầy đủ vẫn trả nguyên field |

## Không được làm
- Không query bảng trực tiếp trong dashboard service
- Không chế giá trị `NotificationType` mới
- Không trả toàn bộ danh sách điểm giao trong mini-calendar

## Definition of Done
- [ ] Build · Lint · Unit Tests pass
- [ ] API Definition điền đủ — FE bắt đầu được task-3-26
- [ ] Ghi chú `[PENDING Q9]` trong PR
- [ ] Non-Regression verify đủ · Actual Hour · Status → `Done` → `Reviewing`
