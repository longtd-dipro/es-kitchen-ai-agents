# [BE] Admin_Web — DB Migration: Add user_type + guest_payment_allowed

## Backlog Info
- **Issue Type:** Task
- **Category:** Admin_Web
- **Parent Issue:** Guest Mode — Phase 2 Implementation
- **Version:** Phase 2
- **Milestone:** Released xxx
- **Estimate Hour:** 3h
- **Actual Hour:** — _(điền khi Resolved)_
- **Status:** Open

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 1 — DB Migration |
| Repo | `es-kitchen-api` |
| Depends on | none |
| Song song với | none |
| Estimate | ~3h |

## Mục tiêu

Thêm 2 column mới vào DB: `user_type` (varchar) vào bảng `users`, `guest_payment_allowed` (boolean) vào bảng `companies`. Đây là prerequisite cứng cho toàn bộ Phase 2 — không task nào trong Phase 2 có thể chạy nếu migration chưa xong.

## Context (đọc trước khi code)

- DESIGN.md: `es-kitchen-docs/docs/features/guest-mode/es-kitchen-api/DESIGN.md` (section 2 — Database Changes)
- File liên quan:
  - `es-kitchen-repository/es-kitchen-api/src/entities/user.entity.ts` — xem column conventions, đặc biệt line 57-59: `password: string` hiện là `NOT NULL` (không có `nullable: true`)
  - `es-kitchen-repository/es-kitchen-api/src/entities/company.entity.ts` — xem pattern column line 63-64: `isCashPaymentAllowed` dùng `type: 'boolean'`
  - `es-kitchen-repository/es-kitchen-api/src/commons/enums/user.enum.ts` — xem enums hiện có để thêm đúng chỗ

## Yêu cầu implement

### Tạo: `src/commons/enums/user.enum.ts` (sửa file hiện có, thêm enum mới)

```typescript
export enum UserType {
  REGISTERED = 'registered',
  GUEST = 'guest',
}
```

### Tạo: `src/entities/user.entity.ts` (sửa — thêm 2 column)

**Column 1 — user_type:**
```typescript
@Column({
  name: 'user_type',
  type: 'varchar',
  length: 20,
  default: UserType.REGISTERED,
})
userType: UserType;
```

**Column 2 — password nullable (QUAN TRỌNG — task này phải handle riêng):**

Hiện tại dòng 57-59 của `user.entity.ts`:
```typescript
@Column()
@Exclude()
password: string;
```

Phải sửa thành:
```typescript
@Column({ nullable: true, default: null })
@Exclude()
password: string | null;
```

Rationale: Guest account không có password khi tạo → column phải nullable trước khi code service chạy.

### Tạo: `src/entities/company.entity.ts` (sửa — thêm 1 column)

Thêm sau `isCashPaymentAllowed`:
```typescript
@Column({
  name: 'guest_payment_allowed',
  type: 'boolean',
  default: true,
})
guestPaymentAllowed: boolean;
```

### Tạo: `src/migrations/<timestamp>-AddGuestModeFields.ts` (file migration mới)

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGuestModeFields<TIMESTAMP> implements MigrationInterface {
  name = 'AddGuestModeFields<TIMESTAMP>';

  async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Add user_type to users (safe — has DEFAULT)
    await queryRunner.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS user_type VARCHAR(20) NOT NULL DEFAULT 'registered'
    `);

    // Step 2: Backfill existing rows (idempotent)
    await queryRunner.query(
      `UPDATE users SET user_type = 'registered' WHERE user_type IS NULL`,
    );

    // Step 3: Make password nullable (SEPARATE ALTER — rollback dễ hơn)
    await queryRunner.query(`
      ALTER TABLE users
      ALTER COLUMN password DROP NOT NULL
    `);

    // Step 4: Add guest_payment_allowed to companies (safe — has DEFAULT)
    await queryRunner.query(`
      ALTER TABLE companies
      ADD COLUMN IF NOT EXISTS guest_payment_allowed BOOLEAN NOT NULL DEFAULT TRUE
    `);

    // Step 5: Backfill (idempotent)
    await queryRunner.query(
      `UPDATE companies SET guest_payment_allowed = TRUE WHERE guest_payment_allowed IS NULL`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback order: reverse of up()
    await queryRunner.query(
      `ALTER TABLE companies DROP COLUMN IF EXISTS guest_payment_allowed`,
    );
    await queryRunner.query(
      `ALTER TABLE users ALTER COLUMN password SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE users DROP COLUMN IF EXISTS user_type`,
    );
  }
}
```

**Lưu ý timestamp:** Đặt timestamp theo convention hiện có của repo (format `YYYYMMDDHHmmss`). Xem các migration file hiện có trong `src/migrations/` để đặt đúng.

## Unit Tests (BẮT BUỘC)

### Test file: `src/migrations/__tests__/AddGuestModeFields.migration.spec.ts`

```typescript
describe('AddGuestModeFields migration', () => {
  let queryRunner: jest.Mocked<QueryRunner>;

  beforeEach(() => {
    queryRunner = {
      query: jest.fn().mockResolvedValue(undefined),
    } as any;
  });

  it('should call ALTER TABLE users ADD COLUMN user_type in up()', async () => {
    const migration = new AddGuestModeFields<TIMESTAMP>();
    await migration.up(queryRunner);
    expect(queryRunner.query).toHaveBeenCalledWith(
      expect.stringContaining('ADD COLUMN IF NOT EXISTS user_type'),
    );
  });

  it('should call ALTER COLUMN password DROP NOT NULL in up()', async () => {
    const migration = new AddGuestModeFields<TIMESTAMP>();
    await migration.up(queryRunner);
    expect(queryRunner.query).toHaveBeenCalledWith(
      expect.stringContaining('ALTER COLUMN password DROP NOT NULL'),
    );
  });

  it('should call ALTER TABLE companies ADD COLUMN guest_payment_allowed in up()', async () => {
    const migration = new AddGuestModeFields<TIMESTAMP>();
    await migration.up(queryRunner);
    expect(queryRunner.query).toHaveBeenCalledWith(
      expect.stringContaining('ADD COLUMN IF NOT EXISTS guest_payment_allowed'),
    );
  });

  it('should rollback all changes in down()', async () => {
    const migration = new AddGuestModeFields<TIMESTAMP>();
    await migration.down(queryRunner);
    expect(queryRunner.query).toHaveBeenCalledWith(
      expect.stringContaining('DROP COLUMN IF EXISTS guest_payment_allowed'),
    );
    expect(queryRunner.query).toHaveBeenCalledWith(
      expect.stringContaining('ALTER COLUMN password SET NOT NULL'),
    );
    expect(queryRunner.query).toHaveBeenCalledWith(
      expect.stringContaining('DROP COLUMN IF EXISTS user_type'),
    );
  });
});
```

**Coverage target:**
| File | Target |
|---|---|
| Migration `up()` / `down()` | ≥ 80% |

**Verify:** `npm run test -- AddGuestModeFields`

## Non-Regression Table

| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Login thường (`POST /auth/user/login`) | `src/modules/user/services/auth.service.ts:login()` | Verify `password` không null với user `registered` → login vẫn pass. Test: `npm run test -- auth.service` |
| Argon2 verify password | `src/modules/user/services/auth.service.ts` | `argon2.verify(user.hashedRefreshToken, rt)` không bị ảnh hưởng — chỉ password column thay đổi nullable |
| User entity existing columns | `src/entities/user.entity.ts` | Build pass: `npm run build` — TypeScript phải không có lỗi type |
| Company entity existing columns | `src/entities/company.entity.ts` | Build pass: `npm run build` |
| Migration idempotent | Migration file | `IF NOT EXISTS` đảm bảo chạy lại không fail |

## Không được làm

- Không gộp migration này với task khác — phải là migration file riêng để rollback độc lập
- Không thêm enum vào PostgreSQL native enum — dùng VARCHAR theo rationale trong DESIGN (tránh phức tạp khi thêm value mới)
- Không sửa `hashedRefreshToken` hoặc các column nullable khác trong user entity — ngoài scope
- Không sửa bất kỳ service hay controller nào trong task này

## Definition of Done

- [ ] Build pass (`npm run build`)
- [ ] Lint pass (`npm run lint`)
- [ ] Unit Tests pass — coverage đạt target
- [ ] Migration `up()` chạy thành công trên môi trường local: `npm run migration:run`
- [ ] Migration `down()` chạy thành công (rollback test): `npm run migration:revert`
- [ ] `user.entity.ts` compile không lỗi với `password: string | null`
- [ ] Non-Regression verify đủ (login thường vẫn pass)
- [ ] Actual Hour cập nhật
- [ ] Status → Request Review
