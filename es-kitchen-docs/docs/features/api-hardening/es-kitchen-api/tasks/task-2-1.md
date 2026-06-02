# [BE] [Admin_Web] — Migration timestamptz: chuyển 9 timestamp columns sang TIMESTAMPTZ

## Backlog Info
- **Issue Type:** Task
- **Category:** Admin_Web
- **Parent Issue:** API Hardening Initiative
- **Version:** Phase 2
- **Milestone:** Phase 2 Cleanup
- **Estimate Hour:** 4h
- **Actual Hour:** — _(điền khi Resolved)_
- **Status:** Open

> **Note cho PM:** Category tạm gán `Admin_Web`. Task này là DB-level fix, ảnh hưởng correctness của tất cả timezone-dependent queries (báo cáo JST, OTP expiry, v.v.).

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 2 — Data Integrity + Testing |
| Repo | `es-kitchen-api` |
| Depends on | none |
| Song song với | task-2-2, task-2-3 |
| Estimate | ~4h |

## Mục tiêu
Tạo TypeORM migration ALTER TABLE để đổi 9 columns từ `TIMESTAMP WITHOUT TIME ZONE` sang `TIMESTAMPTZ`, đồng thời cập nhật entity type definitions. Đảm bảo rollback an toàn.

## Context (đọc trước khi code)
- DESIGN.md: `es-kitchen-docs/docs/features/api-hardening/es-kitchen-api/DESIGN.md` (Section 2.1)
- File liên quan:
  - `src/entities/payment.entity.ts` — xem column `paidAt` (line 46)
  - `src/entities/otp.entity.ts` — xem column `expiresAt` (line 22)
  - `src/entities/user.entity.ts` — xem 4 timestamp columns (line 76, 82, 98, 106)
  - `src/entities/company-admin.entity.ts` — xem 2 columns (line 50, 58)
  - `src/entities/menu.entity.ts` — xem column `autoPubDate` (line 64)
  - `database/migrations/` — xem timestamp format của migration files hiện có

> **BLOCKER:** Cần DBA/DevOps confirm maintenance window trước khi chạy migration trên STG/PROD. `ALTER COLUMN` trên bảng `users` và `payments` có thể lock table ngắn.

> **TRƯỚC KHI VIẾT MIGRATION:** Chạy `\d users` trên DB để xác nhận `deleted_at` có dùng explicit `timestamp` type hay TypeORM infer. Nếu TypeORM infer (không thấy type explicit trong entity) thì KHÔNG alter column đó.

## Yêu cầu implement

### Bước 1: Tạo migration file

**File:** `database/migrations/<timestamp>-ConvertTimestampToTimestamptz.ts`

Dùng `Date.now()` tại thời điểm tạo làm prefix (ví dụ: `1780000000000`).

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertTimestampToTimestamptz1780000000000 implements MigrationInterface {
  name = 'ConvertTimestampToTimestamptz1780000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // payments.paid_at — NULLABLE
    await queryRunner.query(`
      ALTER TABLE "payments"
        ALTER COLUMN "paid_at" TYPE TIMESTAMPTZ
        USING "paid_at" AT TIME ZONE 'UTC'
    `);

    // otps.expires_at — NOT NULL
    await queryRunner.query(`
      ALTER TABLE "otps"
        ALTER COLUMN "expires_at" TYPE TIMESTAMPTZ
        USING "expires_at" AT TIME ZONE 'UTC'
    `);

    // users.linked_at — NULLABLE
    await queryRunner.query(`
      ALTER TABLE "users"
        ALTER COLUMN "linked_at" TYPE TIMESTAMPTZ
        USING "linked_at" AT TIME ZONE 'UTC'
    `);

    // users.unlinked_at — NULLABLE
    await queryRunner.query(`
      ALTER TABLE "users"
        ALTER COLUMN "unlinked_at" TYPE TIMESTAMPTZ
        USING "unlinked_at" AT TIME ZONE 'UTC'
    `);

    // users.cart_confirm_popup_hidden_until — NULLABLE
    await queryRunner.query(`
      ALTER TABLE "users"
        ALTER COLUMN "cart_confirm_popup_hidden_until" TYPE TIMESTAMPTZ
        USING "cart_confirm_popup_hidden_until" AT TIME ZONE 'UTC'
    `);

    // users.last_login_at — NULLABLE
    await queryRunner.query(`
      ALTER TABLE "users"
        ALTER COLUMN "last_login_at" TYPE TIMESTAMPTZ
        USING "last_login_at" AT TIME ZONE 'UTC'
    `);

    // company_admins.last_login_at — NULLABLE
    await queryRunner.query(`
      ALTER TABLE "company_admins"
        ALTER COLUMN "last_login_at" TYPE TIMESTAMPTZ
        USING "last_login_at" AT TIME ZONE 'UTC'
    `);

    // company_admins.deleted_at — NULLABLE
    await queryRunner.query(`
      ALTER TABLE "company_admins"
        ALTER COLUMN "deleted_at" TYPE TIMESTAMPTZ
        USING "deleted_at" AT TIME ZONE 'UTC'
    `);

    // menus.auto_pub_date — NULLABLE
    await queryRunner.query(`
      ALTER TABLE "menus"
        ALTER COLUMN "auto_pub_date" TYPE TIMESTAMPTZ
        USING "auto_pub_date" AT TIME ZONE 'UTC'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback theo thứ tự ngược lại
    await queryRunner.query(`
      ALTER TABLE "menus"
        ALTER COLUMN "auto_pub_date" TYPE TIMESTAMP WITHOUT TIME ZONE
        USING "auto_pub_date" AT TIME ZONE 'UTC'
    `);

    await queryRunner.query(`
      ALTER TABLE "company_admins"
        ALTER COLUMN "deleted_at" TYPE TIMESTAMP WITHOUT TIME ZONE
        USING "deleted_at" AT TIME ZONE 'UTC'
    `);

    await queryRunner.query(`
      ALTER TABLE "company_admins"
        ALTER COLUMN "last_login_at" TYPE TIMESTAMP WITHOUT TIME ZONE
        USING "last_login_at" AT TIME ZONE 'UTC'
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
        ALTER COLUMN "last_login_at" TYPE TIMESTAMP WITHOUT TIME ZONE
        USING "last_login_at" AT TIME ZONE 'UTC'
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
        ALTER COLUMN "cart_confirm_popup_hidden_until" TYPE TIMESTAMP WITHOUT TIME ZONE
        USING "cart_confirm_popup_hidden_until" AT TIME ZONE 'UTC'
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
        ALTER COLUMN "unlinked_at" TYPE TIMESTAMP WITHOUT TIME ZONE
        USING "unlinked_at" AT TIME ZONE 'UTC'
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
        ALTER COLUMN "linked_at" TYPE TIMESTAMP WITHOUT TIME ZONE
        USING "linked_at" AT TIME ZONE 'UTC'
    `);

    await queryRunner.query(`
      ALTER TABLE "otps"
        ALTER COLUMN "expires_at" TYPE TIMESTAMP WITHOUT TIME ZONE
        USING "expires_at" AT TIME ZONE 'UTC'
    `);

    await queryRunner.query(`
      ALTER TABLE "payments"
        ALTER COLUMN "paid_at" TYPE TIMESTAMP WITHOUT TIME ZONE
        USING "paid_at" AT TIME ZONE 'UTC'
    `);
  }
}
```

### Bước 2: Cập nhật entity type definitions

Đổi `type: 'timestamp'` → `type: 'timestamptz'` tại các column sau:

**`src/entities/payment.entity.ts`** (column `paidAt`):
```typescript
// TRƯỚC:
@Column({ name: 'paid_at', type: 'timestamp', nullable: true })
paidAt: Date | null;

// SAU:
@Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
paidAt: Date | null;
```

**`src/entities/otp.entity.ts`** (column `expiresAt`):
```typescript
// TRƯỚC:
@Column({ name: 'expires_at', type: 'timestamp' })
expiresAt: Date;

// SAU:
@Column({ name: 'expires_at', type: 'timestamptz' })
expiresAt: Date;
```

**`src/entities/user.entity.ts`** (4 columns — xem line 76, 82, 98, 106 thực tế):
```typescript
// Đổi type: 'timestamp' → type: 'timestamptz' cho:
// - linkedAt
// - unlinkedAt
// - cartConfirmPopupHiddenUntil
// - lastLoginAt
```

**`src/entities/company-admin.entity.ts`** (2 columns — xem line 50, 58):
```typescript
// Đổi type: 'timestamp' → type: 'timestamptz' cho:
// - lastLoginAt
// - deletedAt (nếu có explicit type — nếu dùng @DeleteDateColumn không có type, skip)
```

**`src/entities/menu.entity.ts`** (column `autoPubDate` — xem line 64):
```typescript
// Đổi type: 'timestamp' → type: 'timestamptz' cho:
// - autoPubDate
```

### Bước 3: Verify không sinh migration mới sau khi update entity

```bash
npm run typeorm:generate -- --name=VerifyNochange
# Migration file được generate phải TRỐNG (không có thay đổi)
```

## Unit Tests (BẮT BUỘC)

Migration file không có unit test truyền thống. Thay vào đó, verify bằng integration test trên DB:

### Test thủ công (ghi vào DoD):
```sql
-- Sau khi chạy migration trên DEV DB:
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('payments', 'otps', 'users', 'company_admins', 'menus')
  AND column_name IN ('paid_at', 'expires_at', 'linked_at', 'unlinked_at',
                      'cart_confirm_popup_hidden_until', 'last_login_at',
                      'deleted_at', 'auto_pub_date')
ORDER BY table_name, column_name;
-- Tất cả data_type phải là 'timestamp with time zone'
```

### Test rollback:
```bash
npm run typeorm:revert
# Chạy lại query trên để verify type quay về 'timestamp without time zone'
```

**Coverage target:**
| Checklist | Target |
|---|---|
| up() hoàn thành không error | Pass |
| down() hoàn thành không error | Pass |
| Column type verified via SQL | Pass |

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| OTP expiry check | `registration.service.ts:validateOtp` | Sau migration, OTP expired/valid behavior giữ nguyên — `expiresAt > NOW()` vẫn đúng vì cả 2 UTC |
| Payment `paidAt` trong báo cáo JST | `elepay-webhook.service.ts`, `sales-analytics.service.ts` | Query "doanh thu theo ngày JST" trên STG trước/sau migration → kết quả không lệch |
| Company Admin soft delete | `company-admin.entity.ts` | Soft delete vẫn hoạt động sau khi đổi `deleted_at` type |
| Menu auto publish date | `menu.entity.ts` | Menu auto-publish scheduler vẫn trigger đúng thời gian |

## Không được làm
- Không alter column `user.deleted_at` nếu entity dùng `@DeleteDateColumn` không có explicit `type` — TypeORM quản lý type đó
- Không thay đổi bất kỳ business logic nào — chỉ ALTER COLUMN + entity type update
- Không chạy migration trên STG/PROD mà không có maintenance window được confirm

## Definition of Done
- [ ] Migration file tạo xong với đúng 9 column, có `up()` và `down()`
- [ ] Entity files đã cập nhật type `'timestamptz'`
- [ ] `npm run typeorm:generate` sau khi update entity → không sinh migration mới
- [ ] Migration chạy thành công trên DEV DB (no errors)
- [ ] SQL verify: tất cả columns đã là `timestamp with time zone`
- [ ] Rollback test: `down()` thành công trên DEV DB
- [ ] OTP expiry test manual: OTP hết hạn vẫn bị reject, OTP còn hạn vẫn pass
- [ ] Actual Hour cập nhật
- [ ] Status → Request Review
