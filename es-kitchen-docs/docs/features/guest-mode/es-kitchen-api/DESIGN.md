# DESIGN: Guest Mode — es-kitchen-api

> **Feature:** Guest Mode
> **Repo:** `es-kitchen-api`
> **SPEC:** `es-kitchen-docs/docs/features/guest-mode/SPEC.md`
> **Ngày tạo:** 2026-06-05
> **Tech Lead:** ngaht@dipro.vn

---

## 1. Tổng quan thay đổi

| Layer | File | Loại thay đổi |
|---|---|---|
| Entity | `src/entities/user.entity.ts` | Thêm column `user_type` (enum) |
| Entity | `src/entities/company.entity.ts` | Thêm column `guest_payment_allowed` (boolean) |
| Migration | `src/migrations/<timestamp>-AddGuestModeFields.ts` | Migration mới |
| Enum | `src/commons/enums/user.enum.ts` | Thêm enum `UserType` |
| Service | `src/modules/user/services/auth.service.ts` | Thêm method `guestLogin()` |
| Service | `src/modules/user/services/auth.service.ts` | Thêm method `linkEmail()` |
| Controller | `src/modules/user/http/controllers/auth.controller.ts` | Thêm 2 endpoint guest |
| Guard | `src/auth/guards/jwt-auth.guard.ts` | Đọc thêm claim `userType` từ token payload |
| DTO (Request) | `src/modules/user/http/requests/guest-link-email.request.ts` | Mới |
| DTO (Request) | `src/modules/user/http/requests/guest-verify-link-email.request.ts` | Mới |
| DTO (Request) | `src/modules/user/http/requests/guest-set-password.request.ts` | Mới |
| DTO (Response) | tái dùng `Tokens` response hiện có | Không đổi |
| Service (Admin) | `src/modules/admin/services/company.service.ts` | Thêm `guestPaymentAllowed` vào `getBasicInfo` + `updateBasicInfo` |
| DTO (Admin Request) | `src/modules/admin/http/requests/update-company-basic-info.request.ts` | Thêm field `guestPaymentAllowed` |
| DTO (Admin Response) | `src/modules/admin/http/responses/company-detail.response.ts` | Thêm field `guestPaymentAllowed` |
| Service | `src/modules/user/services/order.service.ts` | Sửa `validateCompanyCode()` — thêm check `guestPaymentAllowed` cho guest |

---

## 2. Database Changes

### 2.1 Entity / Migration

**Migration file:** `src/migrations/<timestamp>-AddGuestModeFields.ts`

#### Bảng `users` — thêm column

| Column | Type | Nullable | Default | Ghi chú |
|---|---|---|---|---|
| `user_type` | `VARCHAR(20)` | NOT NULL | `'registered'` | Enum: `'registered'`, `'guest'` |

**Rationale:** Dùng `VARCHAR` thay vì PostgreSQL native enum để tránh migration phức tạp khi cần thêm value mới. Constraint được enforce ở application layer.

Migration backfill: `UPDATE users SET user_type = 'registered' WHERE user_type IS NULL`

#### Bảng `companies` — thêm column

| Column | Type | Nullable | Default | Ghi chú |
|---|---|---|---|---|
| `guest_payment_allowed` | `BOOLEAN` | NOT NULL | `TRUE` | BR-05: mặc định cho phép guest thanh toán |

Migration backfill: `UPDATE companies SET guest_payment_allowed = TRUE WHERE guest_payment_allowed IS NULL`

#### Migration sketch

```typescript
export class AddGuestModeFields1748000000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add user_type to users
    await queryRunner.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS user_type VARCHAR(20) NOT NULL DEFAULT 'registered'
    `);

    // 2. Add guest_payment_allowed to companies
    await queryRunner.query(`
      ALTER TABLE companies
      ADD COLUMN IF NOT EXISTS guest_payment_allowed BOOLEAN NOT NULL DEFAULT TRUE
    `);

    // 3. Backfill existing rows (idempotent — DEFAULT đã cover, nhưng explicit cho clarity)
    await queryRunner.query(`UPDATE users SET user_type = 'registered' WHERE user_type IS NULL`);
    await queryRunner.query(`UPDATE companies SET guest_payment_allowed = TRUE WHERE guest_payment_allowed IS NULL`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE users DROP COLUMN IF EXISTS user_type`);
    await queryRunner.query(`ALTER TABLE companies DROP COLUMN IF EXISTS guest_payment_allowed`);
  }
}
```

### 2.2 Entity Changes

**`src/entities/user.entity.ts`** — thêm:

```typescript
@Column({
  name: 'user_type',
  type: 'varchar',
  length: 20,
  default: UserType.REGISTERED,
})
userType: UserType;
```

**`src/entities/company.entity.ts`** — thêm:

```typescript
@Column({
  name: 'guest_payment_allowed',
  type: 'boolean',
  default: true,
})
guestPaymentAllowed: boolean;
```

**`src/commons/enums/user.enum.ts`** — thêm:

```typescript
export enum UserType {
  REGISTERED = 'registered',
  GUEST = 'guest',
}
```

### 2.3 Non-regression chú ý — `password` column

`User` entity hiện có `password: string` là NOT NULL. Guest account không có password khi tạo. Cần sửa:
- `password` → thêm `nullable: true` tại entity
- Migration: `ALTER TABLE users ALTER COLUMN password DROP NOT NULL`
- AWS Cognito: guest account **không tạo Cognito user** — chỉ lưu local DB + JWT.

### 2.4 Redis Cache

Guest login không dùng cache riêng. Token validation theo flow JWT hiện có.

**Lưu ý:** Không cache `guestPaymentAllowed` ở API — FE/Mobile gọi `validateCompanyCode` mỗi lần checkout (theo BR-09), BE luôn query DB để lấy giá trị realtime.

---

## 3. API Contract

### 3.1 Endpoint mới

#### POST /auth/user/guest-login

**Mục đích:** Tạo tài khoản guest tự động, trả về token (US-01).

**Auth:** Không yêu cầu (public endpoint).

**Request:** Không có body.

**Response 201:**
```json
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "eyJhbGci..."
}
```

**Response 500:**
```json
{ "message": "ゲストアカウントの作成に失敗しました" }
```

**Logic:**
1. Sinh suffix ngẫu nhiên: 8 ký tự `[a-z0-9]` (36^8 combination) — dùng `crypto.randomBytes`.
2. Tạo `User` với `email = guest_<suffix>@eskitchen.local`, `userName = ゲスト_<suffix>`, `userType = 'guest'`, `password = null`, `companyId = null`.
3. Retry tối đa 3 lần nếu suffix bị collision (unique constraint vi phạm).
4. Gọi `getTokens({ id, email })` — cùng method hiện có trong `AuthService`.
5. JWT payload sẽ chứa `{ id, email }` — `userType` **không đưa vào JWT** (đọc từ DB khi cần validate đặc quyền).

**Không tạo Cognito user cho guest.**

---

#### POST /auth/user/link-email (Yêu cầu auth — JwtAuthGuard)

**Mục đích:** Bước 1 — Guest gửi email để nhận OTP (US-04).

**Auth:** Bearer token (guest hoặc registered — Guard chỉ verify token, không chặn theo type).

**Request body:**
```json
{ "email": "user@example.com" }
```

Validation: `@IsEmail()`, `@IsNotEmpty()`

**Response 200:**
```json
{ "message": "OTPを送信しました" }
```

**Error cases:**
- Email format sai → 400 `{ "message": "メールアドレスの形式が正しくありません" }`
- Email đã tồn tại (full account) → 400 `{ "message": "このメールアドレスは既に使用されています" }` (BR-11 — không gửi OTP)
- Rate limit (< 60s từ lần trước) → 429 `{ "message": "しばらく待ってから再試行してください" }`
- User không phải guest → 403 `{ "message": "この操作はゲストユーザーのみ許可されています" }`

**Logic:**
1. Verify user đang là `userType = 'guest'`.
2. Kiểm tra email đã có trong `users` table với `userType = 'registered'` → 400 nếu có (BR-11).
3. Tái dùng `AuthService.generateOtp(GUEST_COMPANY_CODE, email)` — OTP key dùng `'GUEST'` (const đã có tại `registration.service.ts:24`).
4. Gửi email OTP qua `MailService.sendTemplated()` (tái dùng template `otp-forgot-password` hoặc tạo template mới `otp-link-email`).

---

#### POST /auth/user/link-email/verify (Yêu cầu auth — JwtAuthGuard)

**Mục đích:** Bước 2 — Verify OTP và set password để upgrade guest thành full account (US-04).

**Auth:** Bearer token (phải là guest).

**Request body:**
```json
{
  "email": "user@example.com",
  "otp": "1234",
  "password": "newSecurePassword123"
}
```

Validation:
- `email`: `@IsEmail()`, `@IsNotEmpty()`
- `otp`: `@IsString()`, `@Length(4, 4)`, `@Matches(/^\d{4}$/)`
- `password`: `@IsString()`, `@MinLength(8)`

**Response 200:**
```json
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "eyJhbGci..."
}
```

**Error cases:**
- OTP sai → 400 `{ "message": "認証コードが正しくありません" }`
- OTP hết hạn → 400 `{ "message": "コードの有効期限が切れました" }`
- User không phải guest → 403
- Email đã tồn tại (full account) → 400 (double-check — BR-11)

**Logic:**
1. Verify user đang là `userType = 'guest'`.
2. Tái dùng `AuthService.validateOtp(GUEST_COMPANY_CODE, email, otp)`.
3. OTP valid → mark OTP as used (`markOtpAsUsed`).
4. Tạo Cognito user: `cognitoService.signUp(AwsCognitoUserPool.USER, email, password)`.
5. Update `User` entity: `email = email`, `password = hashedPassword`, `userType = 'registered'`.
6. Gọi `getTokens({ id, email })` — trả về token mới.

**Không tạo user mới** — cùng `userId`, chỉ đổi `userType` + set email/password (order history giữ nguyên — AC-04-8, AC-05-4).

---

### 3.2 Endpoint sửa

#### GET /user/orders/validate-company (existing)

**Thay đổi:** Thêm kiểm tra `guestPaymentAllowed` cho guest user.

**Sửa trong:** `OrderService.validateCompanyCode()`

**Logic bổ sung:**
```
Nếu user là guest (userType = 'guest'):
  → Nếu company.guestPaymentAllowed = false → trả về valid: false, reason: 'この会社はゲストの支払いを許可していません'
  → Nếu company.guestPaymentAllowed = true  → tiếp tục flow hiện có
```

**Response thêm field:**
```json
{
  "valid": true,
  "companyCode": "COMP001",
  "companyName": "株式会社サンプル",
  "companyId": "1",
  "reason": null,
  "guestPaymentAllowed": true
}
```

Field `guestPaymentAllowed` trả về luôn (cho cả user thường và guest) — Mobile dùng để ẩn cash option cho guest.

**Cần truyền `userType` vào service:** Controller đọc `userId` từ `@GetUser('id')`, sau đó `UserService.findById(userId)` để lấy `userType`.

---

### 3.3 Endpoint sửa — Admin Company Basic Info

#### PATCH /companies/:id/basic-info (existing)

**Thêm field vào `UpdateCompanyBasicInfoRequest`:**
```typescript
@ApiPropertyOptional({ example: true })
@IsBoolean()
@IsOptional()
guestPaymentAllowed?: boolean;
```

**Thêm field vào `CompanyBasicInfoItemResponse`:**
```typescript
@ApiProperty({ example: true })
guestPaymentAllowed: boolean;
```

**Sửa trong `company.service.ts`:**
- `getBasicInfo()`: trả về `guestPaymentAllowed: company.guestPaymentAllowed`
- `updateBasicInfo()`: map `data.guestPaymentAllowed` vào `company.guestPaymentAllowed`
- `HistoryLoggerHelper` — thêm `guestPaymentAllowed` vào `CompanyFieldDict` để log history khi thay đổi.

---

## 4. Service Layer

### 4.1 AuthService (user module)

**Method mới:**

```typescript
async guestLogin(): Promise<{ accessToken: string; refreshToken: string }>
```
- Sinh suffix 8 chars ngẫu nhiên
- Tạo User với `userType = 'guest'`, `password = null`, `companyId = null`
- Retry tối đa 3 lần khi trùng suffix
- Gọi `getTokens()` hiện có
- Không gọi Cognito

```typescript
async sendLinkEmailOtp(userId: string, email: string): Promise<void>
```
- Verify `userType = 'guest'`
- Check email chưa tồn tại trong users (registered)
- Gọi `generateOtp(GUEST_COMPANY_CODE, email)` hiện có
- Gửi email OTP

```typescript
async verifyLinkEmailOtp(
  userId: string,
  email: string,
  otp: string,
  password: string,
): Promise<{ accessToken: string; refreshToken: string }>
```
- Verify `userType = 'guest'`
- `validateOtp(GUEST_COMPANY_CODE, email, otp)`
- Mark OTP used
- Tạo Cognito user
- Update User: `email`, `password` (hashed), `userType = 'registered'`
- Gọi `getTokens()`

### 4.2 OrderService (user module) — method sửa

```typescript
async validateCompanyCode(
  companyCode: string,
  userId: string,
): Promise<ValidateCompanyCodeResponse>
```

Bổ sung:
- Load `user.userType` (join hoặc query thêm)
- Nếu `userType = 'guest'` và `company.guestPaymentAllowed = false` → return invalid
- Thêm `guestPaymentAllowed` vào response

### 4.3 Dependency mới

`AuthService` (user module) sẽ inject thêm `@InjectRepository(User)` — đã có.
Không có dependency mới với external service ngoài những cái đã có.

---

## 5. Interface với repo khác (cross-repo)

| Endpoint | Consumer | Mục đích |
|---|---|---|
| `POST /auth/user/guest-login` | `es-kitchen-payment-app` | Tạo guest session khi bấm "ゲストとして利用する" |
| `POST /auth/user/link-email` | `es-kitchen-payment-app` | Gửi OTP để upgrade |
| `POST /auth/user/link-email/verify` | `es-kitchen-payment-app` | Verify OTP + set password + upgrade type |
| `GET /user/orders/validate-company` | `es-kitchen-payment-app` | Check company code + guestPaymentAllowed trước checkout |
| `PATCH /companies/:id/basic-info` | `es-kitchen-web-admin` | Toggle `guestPaymentAllowed` |

**Token response** — cùng format `{ accessToken, refreshToken }` hiện có — không thay đổi. Mobile không cần logic đặc biệt.

**JWT payload** — `{ id, email }` — không thêm `userType` vào JWT. API xác định guest/registered từ DB khi cần (ít endpoint cần check này, không tốn nhiều query).

---

## 6. Luồng xử lý chi tiết

### Flow 1: Guest Login (US-01)

```
Mobile → POST /auth/user/guest-login
  1. Sinh suffix = crypto.randomBytes(4).toString('hex').slice(0, 8)
  2. Tạo User {
       email: `guest_${suffix}@eskitchen.local`,
       userName: `ゲスト_${suffix}`,
       userType: 'guest',
       password: null,
       companyId: null,
     }
  3. Nếu unique constraint fail → retry (tối đa 3 lần, sinh suffix mới)
  4. getTokens({ id: user.id, email: user.email })
  5. Return { accessToken, refreshToken }
```

### Flow 2: Guest Checkout Validation (US-03)

```
Mobile → GET /user/orders/validate-company?companyCode=COMP001
  [JwtAuthGuard verify token]
  1. Tìm company theo companyCode
  2. Kiểm tra status company (không SUSPENDED/CANCELLED/DELETED)
  3. Load user bằng userId từ token
  4. Nếu user.userType = 'guest' AND company.guestPaymentAllowed = false
       → return { valid: false, reason: 'この会社はゲストの支払いを許可していません' }
  5. Kiểm tra restriction hiện có (user bị restrict với company?)
  6. Return { valid: true/false, ..., guestPaymentAllowed: boolean }
```

### Flow 3: Link Email / Upgrade (US-04) — 3 step

```
Step 1: Mobile → POST /auth/user/link-email { email }
  [JwtAuthGuard]
  1. Load user, verify userType = 'guest'
  2. Check email chưa có trong users (registered)
  3. generateOtp('GUEST', email) — tái dùng rate limit 1/60s
  4. sendTemplated email OTP
  5. Return 200 { message }

Step 2: [User nhập OTP trên Mobile]

Step 3: Mobile → POST /auth/user/link-email/verify { email, otp, password }
  [JwtAuthGuard]
  1. Load user, verify userType = 'guest'
  2. validateOtp('GUEST', email, otp) → 'valid' | 'invalid' | 'expired'
  3. markOtpAsUsed('GUEST', email, otp)
  4. cognitoService.signUp(USER_POOL, email, password)
  5. UPDATE user SET
       email = email,
       password = hash(password),
       user_type = 'registered'
     WHERE id = userId
  6. getTokens({ id: userId, email })
  7. Return { accessToken, refreshToken }
```

---

## 7. Non-Regression Risks

| Tính năng hiện có | File liên quan | Rủi ro |
|---|---|---|
| Login thường (`POST /auth/user/login`) | `auth.service.ts:login()` | `password` column trở thành nullable → login query vẫn hoạt động (password không null với registered user), nhưng cần test |
| Register + Verify OTP | `registration.service.ts` | Không bị ảnh hưởng trực tiếp. `GUEST_COMPANY_CODE = 'GUEST'` const đang được dùng chung — link-email flow cũng dùng cùng const này → bảo đảm không conflict |
| Forgot Password | `auth.service.ts:forgotPassword()` | Guest không có email → nếu guest gọi forgot-password sẽ không tìm thấy user → `return` early (hiện tại đã có pattern này). An toàn |
| validateCompanyCode | `order.service.ts:validateCompanyCode()` | Sửa method này → cần đảm bảo user thường (registered) vẫn pass mà không bị chặn bởi guestPaymentAllowed check |
| Checkout (full user) | `order.service.ts:checkout()` | Checkout hiện tại không check `guestPaymentAllowed` — không bị ảnh hưởng |
| Company getBasicInfo (Admin) | `company.service.ts:getBasicInfo()` | Thêm field mới vào response — backward compatible (FE admin sẽ thấy field mới, không break cái cũ) |
| Company updateBasicInfo (Admin) | `company.service.ts:updateBasicInfo()` | Thêm field optional vào request — existing call không gửi field này → `undefined` → không thay đổi DB |
| Order History | `order.service.ts:getOrderHistory()` | Query filter theo `userId` đã đủ (BR-13) — guest chỉ thấy orders của mình. Không cần sửa |
| HistoryLoggerHelper | Company service | Cần thêm `guestPaymentAllowed` vào `CompanyFieldDict` để log history. Nếu bỏ qua → history sẽ không track thay đổi field này |

---

## 8. Security Considerations

- **Guest token scope:** JWT payload chứa `{ id, email }` — không expose `userType` trong token (tránh client-side tampering). API luôn query DB để xác nhận `userType`.
- **Guest email namespace:** Domain `@eskitchen.local` không route được email thật — loại bỏ rủi ro spam OTP từ guest accounts.
- **OTP brute force:** Tái dùng rate limit 1 lần/60 giây hiện có. OTP là 4 chữ số (1000–9999) — 9000 combinations. Không có retry limit là gap nhỏ, nhưng đây là quyết định business (tái dùng behavior hiện có theo SPEC).
- **Upgrade endpoint:** Chỉ guest mới được gọi `POST /auth/user/link-email` — check `userType = 'guest'` trả về 403 nếu không phải.
- **Company ID validation:** Guest phải nhập companyCode mỗi lần checkout (BR-09) — không lưu state, giảm rủi ro impersonation.
- **Cognito chỉ được tạo khi upgrade:** Guest account không có Cognito user — nếu guest cố login lại bằng email/password sẽ fail (Cognito không tìm thấy). Đây là hành vi đúng.

---

## 9. Migration & Rollout

| Bước | Action | Rollback |
|---|---|---|
| 1 | Chạy migration: thêm `user_type` (default `'registered'`) | `ALTER TABLE users DROP COLUMN user_type` |
| 2 | Chạy migration: thêm `guest_payment_allowed` (default `TRUE`) | `ALTER TABLE companies DROP COLUMN guest_payment_allowed` |
| 3 | Deploy API với endpoints mới | Không ảnh hưởng existing users |
| 4 | Deploy Mobile app | Users không thấy button Guest Mode nếu API chưa deploy |
| 5 | Deploy Web Admin | Toggle hiển thị, có thể bật/tắt per company |

**Migration safety:** Cả 2 column có `DEFAULT` value → migration không lock table, backward compatible với code cũ đang chạy song song.

---

## 10. Open Questions cho Tech Lead Tasks

- **OQ-1:** `password` column hiện tại là `NOT NULL` (không thấy `nullable: true` trong entity). Guest account không có password → cần thêm migration `ALTER TABLE users ALTER COLUMN password DROP NOT NULL` và update entity `@Column({ nullable: true })`. Confirm trước khi assign task.
- **OQ-2:** AWS Cognito integration cho upgrade flow: `cognitoService.signUp()` method có sẵn chưa hay cần thêm? Cần check `cognito.service.ts`.
- **OQ-3:** Email template `otp-link-email` — tạo mới hay tái dùng template `otp-forgot-password`? Nếu tái dùng, nội dung sẽ không hoàn toàn phù hợp (subject, body context). Recommend tạo template mới.
- **OQ-4:** `HistoryLoggerHelper.CompanyFieldDict` — cần bổ sung key cho `guestPaymentAllowed`. Tech Lead Tasks cần assign task riêng cho việc này.
- **OQ-5:** `validateCompanyCode` hiện inject `@InjectRepository(UserCompanyRestriction)` nhưng không inject `User` repo. Cần inject thêm hoặc gọi qua `UserService.findById()`. Blast radius nhỏ nhưng cần verify.
