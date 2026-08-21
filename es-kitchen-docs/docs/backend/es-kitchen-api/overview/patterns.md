# es-kitchen-api — Patterns & Conventions

> Đọc file này trước khi viết code NestJS mới. Follow pattern đang có — không tự refactor.

---

## 1. Module layout

Mỗi controller trong module đứng riêng — module là **role** (admin, admin-company, user, supplier, driver, deliverer), **controller** là **domain resource** (order, menu, contract, …). Không gom nhiều resource vào một controller.

```
src/modules/<role>/
├── <role>.module.ts
├── <resource>/                 ← ví dụ order/, menu/
│   ├── <resource>.controller.ts
│   ├── <resource>.service.ts
│   ├── dto/
│   │   ├── create-<resource>.dto.ts
│   │   └── list-<resource>.dto.ts
│   └── <resource>.service.spec.ts
```

**Ví dụ thực tế:** `src/modules/admin/` chứa 44 controllers (account, agency, app-version, category, dashboard, …), mỗi cái là một resource độc lập.

---

## 2. Response envelope

Tất cả response đi qua `TransformInterceptor` (`src/commons/framework/interceptors/transform.interceptor.ts`) được đăng ký global tại `main.ts`.

```typescript
// Client nhận
{
  statusCode: 200,
  message: "OK",
  data: <payload>
}
```

Không manual wrap trong controller — chỉ return raw data hoặc DTO instance (có `@Exclude()` cho sensitive fields).

---

## 3. Error handling

- `AllExceptionsFilter` (global) — bắt mọi exception, normalize về `{ statusCode, message, errorCode }`
- Custom exception factory trong `ValidationPipe` → mọi validation error trả về `ApiStatusCode.VALIDATION_ERROR`
- Không `throw new Error(...)` raw — luôn dùng `HttpException` con hoặc typed exception (`BadRequestException`, `NotFoundException`, `ForbiddenException`)

---

## 4. Authentication + Authorization

### JWT flow

```typescript
@UseGuards(JwtAuthGuard)
@Controller("admin/orders")
export class AdminOrderController {
  @Get()
  list(@GetUser() user: AuthUser) { ... }
}
```

- **`@GetUser()`** custom decorator — extract user từ `request.user` (Passport gắn vào)
- **JWT secrets per role** — admin, company, driver, supplier, deliverer có secret riêng (`config/index.ts`)

### Permission decorator (RBAC)

```typescript
@Permissions("order.view")
@Get()
list() { ... }
```

Kết hợp với `PermissionGuard` để check role capability.

### Public endpoint

```typescript
@Public()
@Post("auth/login")
login() { ... }
```

`OptionalJwtAuthGuard` cho endpoint mix (guest hoặc authenticated đều gọi được).

### Guest restriction

`@BlockGuest()` + `GuestRestrictionGuard` — chặn user chưa link email (User module có guest mode).

---

## 5. DTO + Validation

- Mọi input dùng DTO với `class-validator` decorator (`@IsString`, `@IsOptional`, `@IsEmail`, …)
- **Custom validators** trong `src/commons/decorators/`:
  - `@IsCommaSeparatedEnum()` — parse CSV enum trong query string
  - `@IsIntNonNegative()`
  - `@ClientIp()` — bind client IP
- `@Exclude()` từ `class-transformer` cho sensitive fields (password hash, internal ID) — response đi qua `ClassSerializerInterceptor`.

### orderBy whitelist (tránh SQL injection + typo)

```typescript
// ❌ SAI
.orderBy(dto.orderBy, dto.direction)

// ✅ Đúng — whitelist
const ORDER_BY_MAP = { createdAt: 'order.created_at', status: 'order.status' };
.orderBy(ORDER_BY_MAP[dto.orderBy] ?? 'order.created_at', 'DESC')
```

Đã từng có bug prod vì bỏ qua whitelist.

---

## 6. Swagger

- **7 tài liệu riêng biệt** — một cho mỗi role. Config trong `config/swagger.config.ts`.
- Custom decorator `@ApiUnifiedResponse()` (`src/commons/framework/decorators/`) auto-wrap `TransformInterceptor` envelope trong Swagger schema.
- Mỗi controller phải có `@ApiTags(...)` để group.

---

## 7. Realtime (Socket.io + Postgres)

- **Không dùng Redis.** Cross-instance messaging qua `PostgresSocketIoAdapter` (`src/commons/auth-session/postgres-socket-io.adapter.ts`) — sử dụng PostgreSQL `LISTEN`/`NOTIFY`.
- Gateway pattern chuẩn NestJS (`@WebSocketGateway`, `@SubscribeMessage`).
- Payment webhook (`elepay-webhook.guard.ts`) verify signature trước khi broadcast socket event.

---

## 8. Pessimistic locking

`@PostgreLock()` decorator (`src/commons/decorators/`) — dùng cho critical section (ví dụ trừ stock, tạo order với sequence-based code) để tránh race condition ở tầng application.

---

## 9. Migration workflow

- Tất cả DDL change qua migration file trong `database/migrations/`
- Naming: `<timestamp>-<PascalCaseChange>.ts`
- Seed data: prefix `Seed*`
- **Không sửa migration cũ** — nếu cần adjust, tạo migration mới.
- **Không dùng `synchronize: true`** ở bất kỳ môi trường nào — kể cả DEV.

---

## 10. Column naming

- **Snake_case explicit** cho DB column, camelCase cho property:

```typescript
@Column({ name: 'company_code', length: 50 })
companyCode: string;
```

- Relation: `eager: false` mặc định để tránh N+1. Load qua QueryBuilder join hoặc explicit `relations`.

```typescript
@ManyToOne(() => CompanyEntity, { eager: false })
@JoinColumn({ name: 'company_id' })
company: CompanyEntity;
```

---

## 11. File upload (S3)

- Module `src/modules/file-upload/` — dùng chung cho mọi role
- AWS SDK v3, credentials qua AWS Parameter Store (**không .env production**)
- Upload flow: FE xin presigned URL → upload trực tiếp lên S3 → gọi API confirm.

---

## 12. Payment (elepay)

- SDK server-side để create charge / verify webhook
- **Webhook signature verify** qua `ElepayWebhookGuard` trước khi mutate DB
- Alipay + WeChat Pay chỉ qua elepay — **không tích hợp Stripe/PayPal**.

---

## 13. Secrets

- **AWS Parameter Store** là nguồn duy nhất cho secret production
- Local dev: `.env` (không commit) — `config/index.ts` đọc via `process.env` với default fallback
- **Không hard-code** token/key trong code hoặc migration.

---

## 14. Logging + Observability

- SQL logging enabled qua TypeORM (`logging: true`) — dev/staging có thể tắt.
- Firebase Crashlytics tích hợp qua Firebase Admin SDK (chủ yếu cho notification, không cho error log server).
- Không log token, password, payment PII.
