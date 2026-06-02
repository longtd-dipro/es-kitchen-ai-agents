# DESIGN: Notification Management — es-kitchen-web-company (Recipient UI)

> **SPEC:** `es-kitchen-docs/docs/features/notification-management/SPEC.md`
> **API DESIGN:** `../es-kitchen-api/DESIGN.md` (section 3.2 - actor `company`)
> **Date:** 2026-06-02
> **Pattern note:** UI này là pattern recipient chung cho `web-company` (E02), `web-supplier` (E04), `web-outsource-web-private` (E05), `webapp-driver` (E06). 3 repo còn lại theo cùng design, chỉ đổi endpoint prefix.

---

## 1. Tổng quan thay đổi

| Layer | File | Action |
|---|---|---|
| Component | `src/components/notification/NotificationBell.tsx` | NEW (badge trên top header) |
| Component | `src/components/notification/NotificationDropdown.tsx` | NEW (preview 5 mới nhất) |
| Page | `src/pages/notification/NotificationListPage.tsx` | NEW (full list) |
| Page | `src/pages/notification/NotificationDetailPage.tsx` | NEW |
| Hook | `src/hooks/notification/useUnreadCount.ts` | NEW (poll every 30s) |
| Hook | `src/hooks/notification/useNotificationList.ts` | NEW (infinite scroll) |
| Hook | `src/hooks/notification/useMarkAsRead.ts` | NEW |
| Service | `src/services/notification.service.ts` | NEW |
| Layout | `src/layouts/CompanyLayout.tsx` | EDIT — chèn `<NotificationBell />` vào header |
| Route | `/notifications`, `/notifications/:id` | NEW |

---

## 2. UX

### Top header

```
[Logo]  Menu1 Menu2 Menu3  ...  [🔔 (3)]  [User Avatar]
                                  ↓ click
                          NotificationDropdown
                          ┌──────────────────────┐
                          │ NEW · Title 1        │
                          │      2 hours ago     │
                          │ ─────────────────    │
                          │ NEW · Title 2        │
                          │      Yesterday       │
                          │ ─────────────────    │
                          │   View all (3 mới)   │
                          └──────────────────────┘
```

- Badge `NEW` + highlight khi unread, gray khi read
- Click 1 item → navigate detail → tự động mark as read
- Click "View all" → list page

### NotificationListPage

- Infinite scroll, page size 20
- Filter: All / Unread
- Sort: newest first (cố định)
- Item: title preview + content snippet + relative time + NEW badge nếu unread

### NotificationDetailPage

- Full content (rendered từ text plain hoặc rich nếu có)
- Attachment download links
- Tự `useMarkAsRead(id)` khi mount

---

## 3. State Management

| State | Loại |
|---|---|
| Unread count | TanStack Query `useQuery` với `refetchInterval: 30000` |
| List notifications | TanStack Query `useInfiniteQuery` |
| Mark as read | TanStack Query mutation — invalidate unread count + list |
| Realtime push (optional) | (Phase 2) WebSocket subscription, fallback poll |

---

## 4. Routing

```typescript
{ path: '/notifications', element: <NotificationListPage /> },
{ path: '/notifications/:id', element: <NotificationDetailPage /> },
```

Không cần `RequirePermission` — recipient feature mặc định ai login cũng có.

---

## 5. Interface với repo khác

| Repo | Endpoint |
|---|---|
| `es-kitchen-api` | `GET /company/notifications`, `GET /company/notifications/:id` (auto-read), `GET /company/notifications/unread-count` |

> **Cho web-supplier**, đổi `/company/` → `/supplier/`. Cho web-outsource đổi → `/outsource/`. Cho webapp-driver đổi → `/driver/`. Logic UI giống hệt — share pattern.

---

## 6. Non-Regression Risks

| Tính năng hiện có | File | Rủi ro | Mitigation |
|---|---|---|---|
| Top header layout | `src/layouts/CompanyLayout.tsx` | Chèn bell có thể đẩy layout responsive | Test trên mobile width breakpoint |
| Polling 30s — load API | Performance | Nếu nhiều tab → spam API | TanStack Query tự dedupe theo queryKey |

---

## 7. Future — Realtime (Phase 2)

Hiện tại dùng poll 30s. Khi cần realtime:
- Backend: socket.io namespace `/notifications` + push event `notification:new`
- FE: `socket.on('notification:new', () => queryClient.invalidateQueries(['notifications']))`
- Fallback: poll khi WebSocket down
