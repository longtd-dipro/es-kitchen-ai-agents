# DESIGN: Notification Management — es-kitchen-web-admin

> **SPEC:** `es-kitchen-docs/docs/features/notification-management/SPEC.md`
> **API DESIGN:** `../es-kitchen-api/DESIGN.md`
> **Date:** 2026-06-02

---

## 1. Tổng quan thay đổi

| Layer | File | Action |
|---|---|---|
| Page | `src/pages/notification/NotificationListPage.tsx` | NEW |
| Page | `src/pages/notification/NotificationCreatePage.tsx` (wizard 4 step) | NEW |
| Page | `src/pages/notification/NotificationDetailPage.tsx` | NEW |
| Component | `src/components/notification/wizard/Step1RecipientFilter.tsx` | NEW |
| Component | `src/components/notification/wizard/Step2Content.tsx` | NEW |
| Component | `src/components/notification/wizard/Step3Preview.tsx` | NEW |
| Component | `src/components/notification/wizard/Step4Publish.tsx` | NEW |
| Component | `src/components/notification/AttachmentUpload.tsx` | NEW |
| Component | `src/components/notification/RecipientPreviewTable.tsx` | NEW |
| Component | `src/components/notification/ProductMultiSelect.tsx` | NEW (OR logic indicator) |
| Hook | `src/hooks/notification/useNotifications.ts` | NEW |
| Hook | `src/hooks/notification/useRecipientPreview.ts` | NEW (debounced filter preview) |
| Service | `src/services/notification.service.ts` | NEW |
| Route | `/notifications` group | NEW |

---

## 2. Wizard Flow (Create)

```
Step 1 — Recipient Filter
  ▸ Multi-select actor types (User/Company/Supplier/Outsource/Driver)
  ▸ Search company name (autocomplete)
  ▸ Plan name (dropdown)
  ▸ Contract status (dropdown — chốt enum khi OQ-13)
  ▸ Order month (date picker - YYYY-MM)
  ▸ Product multi-select (OR logic, badge "OR" hiển thị giữa items)
  ▸ Live preview table với count "1,250 recipients matched"
  ▸ User có thể check/uncheck từng row trong preview
  → Next

Step 2 — Content
  ▸ Title (max 255, counter)
  ▸ Content (rich text or plain — chốt OQ scope)
  ▸ Attachment upload (drag-drop, max 5 files, 5MB each)
  ▸ Scheduled at (optional, datetime picker — không cho phép past)
  ▸ Send email toggle
    └─ Send to secondary contact (chỉ show khi email ON)
  → Next

Step 3 — Preview
  ▸ Render notification preview (theo template web/mobile)
  ▸ Recipient count + breakdown by actor type
  ▸ Edit để quay lại
  → Next

Step 4 — Publish
  ▸ Save as Draft / Publish Now / Schedule
  ▸ Popup warning + confirm (Common Rules)
  ▸ Success → redirect list
```

---

## 3. Components chính

### 3.1 `<ProductMultiSelect>`

- Source autocomplete via API
- Selected items hiển thị dạng tag, **separator "OR"** giữa các tag để user hiểu logic
- Tooltip "Recipients sẽ match nếu đã order bất kỳ sản phẩm nào trong list"

### 3.2 `<RecipientPreviewTable>`

- Source: TanStack Query mutation `POST /admin/notifications/recipients/search` với debounce 500ms
- Columns: Actor type / Name / Email / Company / Last order date
- Checkable rows → user có thể loại trừ
- Footer: "1,250 selected of 1,800 matched"

### 3.3 `<AttachmentUpload>`

- AntD Upload component
- `beforeUpload`: validate ≤5MB, extension whitelist
- Multipart upload to `/admin/notifications/attachments`
- Return attachment IDs để link vào notification

### 3.4 NotificationListPage

- Tabs: All / Draft / Published / Deleted
- Columns: Title / Status / Recipients count / Scheduled at / Published at / Created by / Action
- Action: Edit (DRAFT/PUBLISHED), Delete (popup warning)
- Filter: status, date range, search title

### 3.5 NotificationDetailPage

- Hiển thị full content + attachment download links
- Audit info: created/updated/published timestamps
- Statistics: Total recipients / Read count / Unread count (per actor type)

---

## 4. State Management

| State | Loại |
|---|---|
| Wizard draft (in-progress) | RTK slice `notificationDraftSlice` — persist localStorage để không mất khi reload |
| List notifications | TanStack Query |
| Recipient preview | TanStack Query mutation (debounced) |
| Attachment upload | TanStack Query mutation |

---

## 5. Routing

```typescript
{ path: '/notifications', element: <RequirePermission code="notification.view"><NotificationListPage /></RequirePermission> },
{ path: '/notifications/new', element: <RequirePermission code="notification.manage"><NotificationCreatePage /></RequirePermission> },
{ path: '/notifications/:id', element: <RequirePermission code="notification.view"><NotificationDetailPage /></RequirePermission> },
{ path: '/notifications/:id/edit', element: <RequirePermission code="notification.manage"><NotificationCreatePage mode="edit" /></RequirePermission> },
```

---

## 6. Interface với repo khác

| Repo | Endpoint |
|---|---|
| `es-kitchen-api` | `POST /admin/notifications/recipients/search`, `POST/GET/PUT/DELETE /admin/notifications`, `POST /admin/notifications/attachments`, `POST /admin/notifications/:id/publish` |

---

## 7. Non-Regression Risks

| Tính năng hiện có | File | Rủi ro | Mitigation |
|---|---|---|---|
| Admin layout menu | `src/layouts/...` | Thêm menu mới — không ảnh hưởng | — |
| Upload component existing | (cần grep) | Reuse pattern | Dùng config wrapper, không tạo lib mới |
