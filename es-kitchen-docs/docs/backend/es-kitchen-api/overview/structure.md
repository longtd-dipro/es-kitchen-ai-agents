# es-kitchen-api — Cấu trúc Source

> Repo: `es-kitchen-api` · Stack: NestJS 11 / TypeScript 5.7 / PostgreSQL / TypeORM 0.3.28
> Vai trò: Core API — phục vụ toàn bộ E01–E07 (Mobile, Web Admin, Company, Supplier, Outsource, Driver, User Web Ordering)

---

## Tech stack

| Layer | Package | Version |
|---|---|---|
| Framework | `@nestjs/*` | 11.0.1 |
| Language | TypeScript | 5.7.3 |
| ORM | TypeORM | 0.3.28 |
| Database driver | pg | 8.22.0 |
| Runtime | Node | 22.10.7 |
| Auth | Passport / passport-jwt | 0.7.0 / 4.0.1 |
| Cloud SDK | AWS SDK (Cognito, S3, SES), Firebase Admin | 13.7.0 |
| Validation | class-validator / class-transformer | 0.14.3 / 0.5.1 |
| Documentation | @nestjs/swagger | 11.2.5 |
| Rate limiting | @nestjs/throttler | 6.5.0 |
| Realtime | socket.io | 4.8.3 |
| Payment | elepay SDK | — |

> **Cache/Message-broker:** không dùng Redis. Socket.io cross-instance dùng **PostgreSQL LISTEN/NOTIFY** adapter (`src/commons/auth-session/postgres-socket-io.adapter.ts`).

---

## Cấu trúc thư mục

```
es-kitchen-api/
├── src/
│   ├── modules/                ← 9 role/domain modules
│   │   ├── admin/              ← System Admin (E03) — 44 controllers, có nested submodules
│   │   │   ├── delivery/       ← 12 controllers (carrier, block, cycle, warehouse, …)
│   │   │   ├── discard/        ← Disposal reports
│   │   │   ├── invoice/        ← bill-one, company-invoice
│   │   │   └── collection/     ← Collection management
│   │   ├── admin-company/      ← Company Admin (E02) — 20 controllers
│   │   ├── user/               ← End-user Mobile + Web Ordering (E01, E07) — 26 controllers
│   │   ├── supplier/           ← Supplier Portal (E04) — 7 controllers
│   │   ├── driver/             ← Driver App (E06) — 10 controllers
│   │   ├── deliverer/          ← Delivery Partner (E05) — 11 controllers
│   │   ├── ai-pro/             ← AI suggestions
│   │   └── file-upload/        ← S3 upload (shared)
│   │
│   ├── entities/               ← TypeORM entities (159 files, flat layout)
│   ├── auth/                   ← Passport strategies + guards + decorators
│   │   ├── strategies/         ← jwt.strategy, admin-cognito, company-cognito, base-cognito
│   │   ├── guards/             ← jwt-auth, optional-jwt-auth, guest-restriction, elepay-webhook
│   │   └── decorators/         ← @GetUser, @Public
│   │
│   ├── commons/                ← Shared utilities
│   │   ├── auth-session/       ← PostgresSocketIoAdapter (Redis-free realtime)
│   │   ├── decorators/         ← @Permissions, @BlockGuest, @PostgreLock, @ClientIp, @IsCommaSeparatedEnum, …
│   │   ├── framework/          ← TransformInterceptor, AllExceptionsFilter, BigIntValidationPipe, @ApiUnifiedResponse
│   │   ├── enums/
│   │   └── helpers/
│   │
│   ├── i18n/                   ← Locale files (ja, en)
│   ├── types/                  ← Ambient TS type augmentations
│   ├── assets/                 ← Static assets bundled với runtime
│   ├── app.module.ts           ← Root module
│   └── main.ts                 ← Bootstrap (global pipes/interceptors/filters, Swagger, versioning)
│
├── database/
│   └── migrations/             ← 205 migration files (chronological timestamp naming)
│
├── config/
│   ├── database.config.ts      ← TypeORM connection (synchronize: false, logging: true)
│   ├── swagger.config.ts       ← 7 separate Swagger docs (Admin, AdminCompany, User, Supplier, Driver, Deliverer, AiPro)
│   └── index.ts                ← JWT secrets per role, env parsing
│
├── test/                       ← Unit + e2e specs
├── package.json
└── nest-cli.json
```

---

## Modules (src/modules/)

| Module | Actor | Controllers | Ghi chú |
|---|---|---|---|
| `admin/` | System Admin (E03) | 44 (+ 16 trong sub-modules) | Nested: `delivery/`, `discard/`, `invoice/`, `collection/` |
| `admin-company/` | Company Admin (E02) | 20 | Company-scoped operations |
| `user/` | End User Mobile (E01) + Web (E07) | 26 | Shared code, phân biệt qua headers/session |
| `supplier/` | Supplier (E04) | 7 | Menu, order, delivery-schedule |
| `driver/` | Driver (E06) | 10 | Delivery, trouble-report, receipt upload |
| `deliverer/` | Delivery Partner (E05) | 11 | Collection report, quotation, self-service |
| `ai-pro/` | Shared AI service | 1 | AI menu suggestion |
| `file-upload/` | Shared | 1 | S3 upload handler |

### Sub-module chi tiết — `admin/delivery/` (12 controllers)

`carrier-integration`, `delivery-address`, `delivery-block`, `delivery-calendar`, `delivery-company`, `delivery-cycle`, `delivery-cycle-assignment`, `delivery-date-change-request`, `picking-calendar`, `picking-unavailable-day`, `relay-destination`, `special-delivery-rule`, `thomas-integration`, `warehouse`.

---

## Entities

Flat layout tại `src/entities/*.entity.ts` — **159 file**. Nhóm chính:

- **Auth/User:** `user.entity.ts`, `admin.entity.ts`, `company-admin.entity.ts`, `auth-session.entity.ts`, `pending-user.entity.ts`
- **Business core:** `company.entity.ts`, `contract.entity.ts`, `order.entity.ts`, `menu.entity.ts`, `product.entity.ts`, `category.entity.ts`, `supplier.entity.ts`
- **Delivery/Logistics:** `delivery-company.entity.ts`, `deliverer.entity.ts`, `delivery-cycle.entity.ts`, `delivery-block.entity.ts`, `driver.entity.ts`, `shipment-detail.entity.ts`
- **Order/Invoice:** `company-order.entity.ts`, `supplier-order.entity.ts`, `payment.entity.ts`, `company-invoice.entity.ts`, `bill-one-api-log.entity.ts`
- **Inventory/Material:** `material.entity.ts`, `inventory-item.entity.ts`, `material-order.entity.ts`, `disposal-report.entity.ts`
- **Request/Workflow:** `change-request.entity.ts`, `quotation-request.entity.ts`, `trouble-report.entity.ts`
- **AI:** `ai-suggestion-job.entity.ts`, `ai-suggestion-chat.entity.ts`, `company-ai-preference.entity.ts`
- **RBAC:** `permission.entity.ts`, `role.entity.ts`
- **Reference/Config:** `notification.entity.ts`, …

---

## Migrations

- **Path:** `database/migrations/`
- **Số lượng:** 205 file
- **Convention:** `<timestamp>-<PascalCaseName>.ts` (ví dụ `1787128139346-AddAiSuggestionChatStatus.ts`)
- **Seed pattern:** file có prefix `Seed*` (ví dụ `SeedSuperAdmin1778385166498-SeedSuperAdmin.ts`)
- **Sync mode:** OFF (`synchronize: false`) — chỉ chạy qua migration.

---

## Bootstrap — `src/main.ts`

Thiết lập global (lines 34–102):

- **Versioning:** URI-based (`api/v1`, `api/v2`, …) với `VERSION_NEUTRAL` fallback
- **Trust proxy:** enabled
- **CORS:** enabled, credentials + `Content-Disposition` exposed
- **Socket.io adapter:** `PostgresSocketIoAdapter` (LISTEN/NOTIFY)
- **Global interceptors:**
  - `TransformInterceptor` → response envelope
  - `ClassSerializerInterceptor` → DTO serialization
- **Global filter:** `AllExceptionsFilter`
- **Global pipes:**
  - `ValidationPipe` (whitelist, forbidNonWhitelisted, custom `exceptionFactory` → `ApiStatusCode.VALIDATION_ERROR`)
  - `BigIntValidationPipe`
- **Swagger:** 7 tài liệu riêng biệt cho từng role.

**Không có global prefix** — routing chia theo role qua từng Swagger doc + tag.

---

## Auth

- **Passport strategies** (`src/auth/strategies/`):
  - `jwt.strategy.ts` — Bearer token extraction
  - `base-cognito.strategy.ts` — AWS Cognito base class
  - `admin-cognito.strategy.ts` — Admin pool
  - `company-cognito.strategy.ts` — Company pool
- **Multiple JWT secrets** per role (admin, company, driver, supplier, deliverer) — định nghĩa trong `config/index.ts:59–99`.
- **Guards:** `JwtAuthGuard`, `OptionalJwtAuthGuard`, `GuestRestrictionGuard`, `ElepayWebhookGuard`.

---

## Database config

`config/database.config.ts`:

| Setting | Giá trị |
|---|---|
| type | postgres (configurable qua `DB_TYPE`) |
| synchronize | **false** — chỉ migration |
| logging | **true** — SQL query logging |
| autoLoadEntities | true |
| ssl | qua `DB_SSL` / `DB_SSL_REJECT_UNAUTHORIZED` env |
| migrations glob | `../database/migrations/*{.ts,.js}` |

Kết nối DEV/Staging: xem `.claude/workflows/db-connect-dev.md` và `db-connect-staging.md`.
