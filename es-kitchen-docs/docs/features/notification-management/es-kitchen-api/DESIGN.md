# DESIGN: Notification Management — es-kitchen-api

> **SPEC:** `es-kitchen-docs/docs/features/notification-management/SPEC.md`
> **Date:** 2026-06-02
> **Status:** Draft — phụ thuộc OQ-11 (file storage S3 + scan virus), OQ-13 (contract status enum)

---

## 0. Phân tích trạng thái hiện tại

| Artifact | File | Note |
|---|---|---|
| Entity `Notification` | `src/entities/notification.entity.ts` | Có `title, content, type (enum), body (jsonb)`. **Chỉ cover User** qua `UserNotification` |
| Entity `UserNotification` | `src/entities/user-notification.entity.ts` | Junction notification ↔ user |
| `NotificationService` (admin) | `src/modules/admin/services/notification.service.ts` | Tạo + push fan-out tới all users |
| `NotificationService` (user) | `src/modules/user/services/notification.service.ts` | Đọc list, mark read |
| `NotificationController` (admin) | `src/modules/admin/http/controllers/notification.controller.ts` | Create + assign to all users + send push |
| `FcmService` | `src/commons/utiliz/fcm-firebase/fcm.service.ts` | Firebase push |
| Email SES | `src/commons/utiliz/mail/mail.module.ts` | Đã có |
| Multi-actor recipient | — | **Chưa có** (chỉ User) |
| DRAFT/PUBLISHED/DELETED status | — | Chưa có |
| Scheduled publish | — | Chưa có |
| Attachment | — | Chưa có |
| Email send toggle | — | Chưa có |
| Filter search complex (multi-actor + product OR) | — | Chưa có |

→ Phải **mở rộng** entity Notification + thêm bảng mới, **không tạo song song** entity khác.

---

## 1. Tổng quan thay đổi

| Layer | File | Action |
|---|---|---|
| Migration | `<ts>-extend-notification-multi-actor.ts` | NEW |
| Entity | `notification.entity.ts` | EDIT — thêm cột `status, scheduled_at, published_at, deleted_at, send_email, send_to_secondary_contact, created_by_admin_id` |
| Entity | `notification-recipient.entity.ts` | NEW (junction multi-actor) |
| Entity | `notification-attachment.entity.ts` | NEW |
| Entity | `notification-read.entity.ts` | NEW (track đã đọc per recipient) |
| Service | `NotificationService` (admin existing) | EDIT — refactor: tạo Draft / Publish / Schedule / Edit / Delete |
| Service | `NotificationRecipientResolverService` | NEW (filter logic) |
| Service | `NotificationDispatchService` | NEW (fan-out: push + email) |
| Service | `NotificationSchedulerService` (`@Cron`) | NEW (check scheduled to publish) |
| Service | `NotificationAttachmentService` (S3 upload) | NEW |
| Controller | `NotificationController` (admin) | EDIT — endpoints theo SPEC section 10 |
| Controller | `NotificationController` (per actor: user/supplier/company/outsource/driver) | NEW endpoints per actor để list+read |
| Storage | S3 bucket `notification-attachments` | NEW (Parameter Store config) |
| Email template | SES template `notification-email` | NEW |

---

## 2. Database

### 2.1 EDIT `notifications`

Thêm cột:

```
status               varchar(20) NOT NULL DEFAULT 'DRAFT'   -- DRAFT/PUBLISHED/DELETED
scheduled_at         timestamptz NULL                       -- thời gian hẹn publish
published_at         timestamptz NULL                       -- khi publish thực sự
send_email           boolean DEFAULT false
send_to_secondary    boolean DEFAULT false
created_by_admin_id  bigint FK admins.id NULL
updated_at           timestamptz DEFAULT NOW()
deleted_at           timestamptz NULL                       -- soft delete
Index:
  idx_notifications_status_scheduled (status, scheduled_at) WHERE deleted_at IS NULL
  idx_notifications_admin (created_by_admin_id)
```

### 2.2 `notification_recipients` — junction multi-actor

```
PK: bigint id
Cols:
  notification_id   bigint FK notifications.id ON DELETE CASCADE
  actor_type        varchar(20)        -- user/company_admin/supplier/outsource/driver
  actor_id          bigint              -- ID trong bảng tương ứng
  delivered_at      timestamptz NULL
  Index:
    UQ (notification_id, actor_type, actor_id)
    idx_notification_recipients_actor (actor_type, actor_id)
```

### 2.3 `notification_attachments`

```
PK: bigint id
Cols:
  notification_id   bigint FK
  file_name         varchar(255)
  file_size         bigint               -- bytes
  mime_type         varchar(100)         -- pdf/jpg/jpeg/png
  s3_key            varchar(500)         -- path S3
  uploaded_at       timestamptz
```

### 2.4 `notification_reads`

```
PK: composite (notification_id, actor_type, actor_id)
Cols:
  notification_id   bigint
  actor_type        varchar(20)
  actor_id          bigint
  read_at           timestamptz NOT NULL
Index:
  idx_notification_reads_actor (actor_type, actor_id, read_at)
```

> **Note migration `UserNotification` cũ:** giữ nguyên để backward compatible. New code dùng `notification_recipients` + `notification_reads`. Existing `UserNotification` records data-migrate sang `notification_recipients` với `actor_type='user'`.

### 2.5 Redis Cache

| Key | Value | TTL |
|---|---|---|
| `notif:unread:<actor>:<id>` | Count unread | 1 phút |
| `notif:recent:<actor>:<id>` | List 20 mới nhất | 30s |

---

## 3. API Contract

### 3.1 Admin

Prefix `/admin/notifications`, guard `AdminGuard + @RequirePermission('notification.manage')`.

| Method | Path | Mô tả |
|---|---|---|
| POST | `/recipients/search` | Body `{ filter: {...} }` → preview list recipient theo filter (multi-actor + product OR) |
| POST | `/` | Create notification (draft hoặc publish ngay), multipart for attachment |
| GET | `/` | List notifications của admin (filter status/date) |
| GET | `/:id` | Detail notification |
| PUT | `/:id` | Update (chỉ DRAFT + PUBLISHED đã quy định) |
| DELETE | `/:id` | Soft delete |
| POST | `/:id/publish` | Manual publish (draft → published) |

### 3.2 Recipient endpoints (per actor)

| Actor | Prefix | Method | Path |
|---|---|---|---|
| User E01 | `/user/notifications` | GET | `/` (list), `/:id` (detail+auto-read), `/unread-count` |
| Company E02 | `/company/notifications` | GET | `/`, `/:id`, `/unread-count` |
| Supplier E04 | `/supplier/notifications` | GET | `/`, `/:id`, `/unread-count` |
| Outsource E05 | `/outsource/notifications` | GET | `/`, `/:id`, `/unread-count` |
| Driver E06 | `/driver/notifications` | GET | `/`, `/:id`, `/unread-count` |

> Pattern chung — tách controller per actor để dùng guard riêng, share `NotificationReaderService`.

### 3.3 DTO chính

```typescript
class RecipientFilter {
  actorTypes: ('user'|'company_admin'|'supplier'|'outsource'|'driver')[];
  companyName?: string;
  planName?: string;
  contractStatus?: string;
  orderMonth?: string;       // YYYY-MM
  productIds?: number[];     // OR among products
}

class CreateNotificationDto {
  title: string;             // max 255
  content: string;           // max 5000
  scheduledAt?: Date;        // null = publish ngay khi action publish
  sendEmail: boolean;
  sendToSecondary: boolean;  // chỉ valid khi sendEmail = true
  attachmentIds?: number[];  // pre-uploaded S3 attachments
  recipientFilter: RecipientFilter;
  status: 'DRAFT' | 'PUBLISHED';
}
```

---

## 4. Service Layer

### 4.1 `NotificationRecipientResolverService`

```typescript
async resolve(filter: RecipientFilter): Promise<RecipientList> {
  // Build dynamic query joining:
  //   - users (E01) JOIN orders JOIN order_items
  //   - companies JOIN company_admins
  //   - suppliers
  //   - outsource_accounts
  //   - drivers
  // Product OR: WHERE order_items.product_id IN (...)
  // Return [{actor_type, actor_id, contact_email}]
}
```

> **Performance:** OQ-12 cần định nghĩa "tháng đặt hàng" rõ — order_date hay delivered_date.
> Tránh N+1: dùng raw query union các actor type.

### 4.2 `NotificationService` (extended)

```typescript
async create(dto, actorAdminId): Promise<Notification> {
  // BEGIN TXN
  // 1. Insert notifications (status=DRAFT/PUBLISHED)
  // 2. resolve recipients → bulk insert notification_recipients
  // 3. Link attachments
  // 4. If status=PUBLISHED và scheduledAt=null:
  //    → call NotificationDispatchService.dispatch(notificationId)
  // COMMIT
}

async update(id, dto, actorAdminId) {
  // Chỉ cho phép edit content/title/attachment
  // Không re-dispatch email/push (AC-10)
  // Invalidate Redis cache recipient
}

async delete(id, actorAdminId) {
  // Soft delete; recipient list ẩn khỏi notification feed
}

async publish(id) {  // Called by scheduler hoặc manual
  // Set published_at = NOW()
  // Call NotificationDispatchService.dispatch(id)
}
```

### 4.3 `NotificationDispatchService`

```typescript
async dispatch(notificationId) {
  const noti = await ...;
  const recipients = await this.recipientRepo.find({where: {notificationId}});
  
  // Group theo actor_type
  for (const group of groupByActorType(recipients)) {
    if (group.actor_type === 'user') {
      // Mobile: gửi push
      await this.fcm.sendBatch(userTokens, payload);
    }
    // Tất cả actor: ghi UserNotification compat (cho user cũ)
  }
  
  if (noti.sendEmail) {
    // Lookup primary contact email per company
    // Optional: include secondary if noti.sendToSecondary
    const emails = await this.resolveEmails(recipients, noti.sendToSecondary);
    await this.ses.sendBatch(emails, 'notification-email', {...});
  }
}
```

### 4.4 `NotificationSchedulerService`

```typescript
@Cron('*/5 * * * *')  // every 5 minutes
async checkScheduled() {
  const due = await this.repo.find({
    where: { status: 'PUBLISHED', scheduledAt: LessThanOrEqual(new Date()), publishedAt: IsNull() }
  });
  for (const noti of due) {
    await this.notificationService.publish(noti.id);
  }
}
```

### 4.5 `NotificationAttachmentService`

```typescript
async upload(file: Express.Multer.File): Promise<Attachment> {
  // Validate size ≤5MB, extension whitelist (pdf/jpg/jpeg/png)
  // OQ-11: scan virus (ClamAV lambda) → block nếu phát hiện
  // Upload S3, return record
}
```

---

## 5. Interface với repo khác

| Repo | Cần |
|---|---|
| `es-kitchen-web-admin` | Wizard create + filter UI + list management |
| `es-kitchen-web-company` | Top notification banner + list page |
| `es-kitchen-payment-app` | Push handler + list screen + detail |
| `es-kitchen-web-supplier` | Top banner + list (giống company pattern) |
| `es-kitchen-web-outsource-web-private` | Top banner + list |
| `es-kitchen-webapp-driver` | Top banner + list |

---

## 6. Luồng Publish ngay với email

```
1. Admin POST /admin/notifications { ..., status: 'PUBLISHED', scheduledAt: null, sendEmail: true }
2. NotificationService.create():
   a. BEGIN TXN
   b. INSERT notifications (status=PUBLISHED, published_at=NOW)
   c. resolver.resolve(filter) → 1500 recipients
   d. Bulk INSERT notification_recipients
   e. Link attachments
   f. COMMIT
   g. Async (queue): NotificationDispatchService.dispatch(notiId)
3. Dispatch:
   a. Push FCM batch cho user mobile
   b. Email SES batch cho contact emails
   c. Web recipients chỉ cần record trong DB → poll bằng GET /<actor>/notifications
4. Recipients web call GET /<actor>/notifications → thấy notification
5. User mobile nhận push → tap → mở app → list
```

---

## 7. Non-Regression Risks

| Tính năng hiện có | File | Rủi ro | Mitigation |
|---|---|---|---|
| `NotificationService` (admin) create + push fan-out all users | `src/modules/admin/services/notification.service.ts` | Refactor breaking existing call sites | Wrap old API thành thin facade gọi new service với `actorTypes: ['user']` default |
| `UserNotification` entity | `src/entities/user-notification.entity.ts` | Migrate sang `notification_recipients` có thể tạo duplicate | Data migration script idempotent, dùng `INSERT ON CONFLICT DO NOTHING` |
| Mobile user push payload format | (existing FCM) | Nếu đổi key trong payload → mobile app cũ break | Giữ backward-compatible payload, thêm field mới optional |
| `NotificationType` enum | `src/commons/enums/notification.enum.ts` | Có thể đã có values → cần migrate | Add new value `'ADMIN_BROADCAST'` không xoá value cũ |

> **`tilth_deps` trên `notification.entity.ts` và 2 `notification.service.ts` BẮT BUỘC trước migration.**

---

## 8. Open Questions block design

- **OQ-3** (multi-role recipient — nhận trên cả 2 web?) → ảnh hưởng resolver
- **OQ-11** (S3 + scan virus): Phase 1 đề xuất chỉ S3 + extension/size validation; ClamAV defer Phase 2
- **OQ-13** (contract status enum values) → ảnh hưởng filter UI + query
- **OQ-15** (auto-read khi mở detail hay user phải bấm): default đề xuất auto khi GET detail
