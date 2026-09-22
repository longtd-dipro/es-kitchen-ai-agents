# [FE] [Delivery_Web] — 配送スタッフ詳細: tab 変更履歴

## Backlog Info
- **Issue Type:** Task · **Category:** Delivery_Web
- **Parent Issue:** Delivery Partner P2 — 配送スタッフ
- **Version:** _TBD_ · **Milestone:** _TBD_
- **Estimate Hour:** 3h · **Actual Hour:** — · **Status:** Open

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 3 — Frontend |
| Repo | `es-kitchen-web-outsource-web-private` |
| Depends on | task-3-22, **task-2-15 (BE)** |
| Song song với | task-3-23 |
| Estimate | ~3h |

## Mục tiêu
Tab hiển thị lịch sử thay đổi của nhân viên: thời điểm, nội dung, người thay đổi.

## Context (đọc trước khi code)
- **Figma:** node **`31498:192891`**
  ⚠️ **Dữ liệu mẫu trong Figma là của màn sản phẩm** (`栄養成分を更新`, `商品価格を「150 → 180」に変更`) — lỗi copy-paste của bản thiết kế (C4). **Không dùng làm test data.**
- **Design-Technical.md (FE)** → FE-10
- **BE task:** `task-2-15.md`

## API Definition (copy từ BE task-2-15)
| Method | Endpoint | Request | Response |
|---|---|---|---|
| GET | `/drivers/:id/history` | `?page&limit` | `{ items: [{ changedAt, content, changedBy }], total, page, limit, totalPages }` |

## Yêu cầu implement

### Step 1 — `driver.service.ts`: `fetchDriverHistory(id, params)`
### Step 2 — `hooks/useDrivers.ts`: `useDriverHistory(id, params)` — `enabled` khi tab history đang mở
### Step 3 — `components/DriverHistoryTab.tsx`
- Bảng 3 cột: `変更日時 (YYYY/M/D HH:mm)` · `変更内容` · `変更者`
- Phân trang khi > 10 dòng
- Không có lịch sử → empty state

## Unit Tests (BẮT BUỘC)
```typescript
it('fetches history only when the tab is active', ...);
it('formats changedAt as YYYY/M/D HH:mm', ...);
it('renders the empty state when there is no history', ...);
```
**Coverage:** ≥ 70% · **Verify:** `npm run test -- --coverage DriverHistory`

## Kiểm tra Integration (BẮT BUỘC)
- [ ] Sửa 1 nhân viên → mở tab thấy dòng lịch sử mới
- [ ] Sau khi phát hành tài khoản hàng loạt (task-3-21) → có dòng log tương ứng

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| 2 tab còn lại | `EmployeeDetailPage.tsx` | Đổi qua lại không lỗi |

## Không được làm
- Không dùng nội dung mẫu sai của Figma trong test hay seed
- Không fetch history khi tab chưa mở

## Definition of Done
- [ ] Build · Lint · Type-check · Unit Tests pass
- [ ] Integration check pass · Actual Hour · Status → `Done` → `Reviewing`
