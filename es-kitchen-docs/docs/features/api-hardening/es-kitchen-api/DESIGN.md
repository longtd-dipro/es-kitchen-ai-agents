# DESIGN: API Hardening — es-kitchen-api

**Ngày tạo:** 2026-06-02
**Tác giả:** Tech Lead
**SPEC:** `../SPEC.md`
**Scope:** Internal tech-debt — chỉ `es-kitchen-api`. Không thay đổi API contract, không ảnh hưởng FE/Mobile.

---

## 1. Tổng quan thay đổi

| Layer | File | Loại thay đổi | Issue |
|---|---|---|---|
| Bootstrap | `src/main.ts:19-22` | Sửa CORS config — đổi `origin: true` sang whitelist từ env var | S1 |
| Bootstrap | `src/main.ts` | Thêm ThrottlerModule + override guard | S2 |
| Module | `src/app.module.ts:19` | Xóa decorator `@Global()` | Q2 |
| Module | `src/app.module.ts` | Import `ThrottlerModule.forRoot()` + APP_GUARD | S2 |
| Module | `src/commons/cache/redis-cache.module.ts` | Tạo mới — RedisCacheModule | P3 |
| Service | `src/modules/admin/services/sales-analytics.service.ts:73,159` | Thay raw interpolation bằng whitelist map | S3 |
| Service | `src/commons/utiliz/elepay/elepay.service.ts:70,249` | Xóa `console.log` payment DTO | S4 |
| Service | `src/modules/user/services/registration.service.ts:154-189` | Bọc bước 3-5 trong `dataSource.transaction()` + compensating action | D2 |
| Service | `src/modules/admin/services/notification.service.ts:127` | Đổi `userRepo.find()` unbounded → cursor pagination theo batch | P1 |
| Service | `src/modules/admin/services/dashboard.service.ts:204-215` | Thay `ORDER BY RANDOM()` bằng pool-based random | P2 |
| Service | `src/modules/user/services/menu.service.ts:44-45` | Tách inject `CartService` + `FavoriteService` → inject repository trực tiếp | Q1 |
| Service | `src/modules/user/services/menu.service.ts` | Thêm cache-aside với RedisCacheModule | P3 |
| Migration | `database/migrations/<timestamp>-ConvertTimestampToTimestamptz.ts` | Tạo mới — alter 8 columns | D1 |
| Entity | `src/entities/payment.entity.ts:46` | Đổi `type: 'timestamp'` → `'timestamptz'` | D1 |
| Entity | `src/entities/otp.entity.ts:22` | Đổi `type: 'timestamp'` → `'timestamptz'` | D1 |
| Entity | `src/entities/user.entity.ts:76,82,98,106` | Đổi 4 columns `type: 'timestamp'` → `'timestamptz'` | D1 |
| Entity | `src/entities/company-admin.entity.ts:50,58` | Đổi 2 columns `type: 'timestamp'` → `'timestamptz'` | D1 |
| Entity | `src/entities/menu.entity.ts:64` | Đổi `type: 'timestamp'` → `'timestamptz'` | D1 |
| Test | `src/modules/user/services/order.service.spec.ts` | Tạo mới | T1 |
| Test | `src/modules/user/services/cart.service.spec.ts` | Tạo mới | T1 |
| Test | `src/modules/user/services/registration.service.spec.ts` | Tạo mới | T1 |

---

## 2. Database Changes

### 2.1 Migration: timestamptz conversion (D1)

**File:** `database/migrations/<timestamp>-ConvertTimestampToTimestamptz.ts`

**Timestamp prefix:** dùng `Date.now()` tại thời điểm tạo — ví dụ `1780000000000`.

**Columns cần alter:**

| Table | Column | Entity field | Nullable |
|---|---|---|---|
| `payments` | `paid_at` | `Payment.paidAt` | YES |
| `otps` | `expires_at` | `Otp.expiresAt` | NO |
| `users` | `linked_at` | `User.linkedAt` | YES |
| `users` | `unlinked_at` | `User.unlinkedAt` | YES |
| `users` | `cart_confirm_popup_hidden_until` | `User.cartConfirmPopupHiddenUntil` | YES |
| `users` | `last_login_at` | `User.lastLoginAt` | YES |
| `company_admins` | `last_login_at` | `CompanyAdmin.lastLoginAt` | YES |
| `company_admins` | `deleted_at` | `CompanyAdmin.deletedAt` | YES |
| `menus` | `auto_pub_date` | `Menu.autoPubDate` | YES |

**Lưu ý:** `user.deleted_at` dùng `@DeleteDateColumn` — TypeORM không dùng `type` explicit nên TypeORM tự infer. Kiểm tra lại bằng `\d users` trên DB trước khi thêm vào migration.

**ALTER TABLE strategy (up):**

```sql
-- Ví dụ cho paid_at — lặp tương tự cho 8 columns
ALTER TABLE payments
  ALTER COLUMN paid_at TYPE TIMESTAMPTZ
  USING paid_at AT TIME ZONE 'UTC';
```

Lý do dùng `USING ... AT TIME ZONE 'UTC'`: dữ liệu hiện tại được lưu theo UTC (server AWS chạy UTC) nhưng TypeORM lưu dạng naive timestamp. Cast sang UTC là cách an toàn nhất để không mất hoặc lệch data.

**Rollback strategy (down):**

```sql
ALTER TABLE payments
  ALTER COLUMN paid_at TYPE TIMESTAMP WITHOUT TIME ZONE
  USING paid_at AT TIME ZONE 'UTC';
```

**Risk:** Migration chạy `ALTER COLUMN` có thể lock table trong vài giây. Với bảng `users` và `payments` có volume lớn → cần maintenance window ngắn (DEV/STG không cần; PROD cần).

**Entity update song song:** Sau migration, cập nhật `type` trong entity từ `'timestamp'` sang `'timestamptz'` để TypeORM không generate lại migration sai lần sau.

### 2.2 Không có entity mới, không có table mới

Tất cả thay đổi là `ALTER COLUMN` trên bảng hiện có.

### 2.3 Redis Cache (P3) — module mới

**Package:** `@nestjs/cache-manager` + `cache-manager-ioredis-yet` (compatible với `cache-manager` v5+).

**Module path:** `src/commons/cache/redis-cache.module.ts`

**Key patterns:**

| Key | TTL | Invalidate khi |
|---|---|---|
| `menu:user:<yearMonth>` | 600s | Admin publish/unpublish menu của `yearMonth` đó |
| `categories:active` | 3600s | Admin/Supplier update/create/delete category |
| `allergens:all` | 3600s | Admin update allergen |

**Cache-aside pattern:**

```
GET redis_key
  ├─ HIT  → return parsed JSON
  └─ MISS → query DB → SET key (TTL) → return result
```

**Invalidation:** Gọi `cacheManager.del(key)` trực tiếp trong service sau khi DB update thành công. TTL là safety net, không phải primary mechanism.

**Module design:**

```typescript
// src/commons/cache/redis-cache.module.ts
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: (config: ConfigService) => ({
        store: redisStore,
        host: config.get('REDIS_HOST'),
        port: config.get('REDIS_PORT'),
        ttl: 600,
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [CacheModule],
})
export class RedisCacheModule {}
```

`REDIS_HOST` và `REDIS_PORT` lấy từ AWS Parameter Store qua `ConfigService` — không hardcode.

---

## 3. API Contract

### 3.1 Không thay đổi public endpoint

100% backward compatible. Tất cả method, path, request/response schema giữ nguyên. FE/Mobile không cần update.

### 3.2 Throttle rate limits (S2) — thay đổi behavior, không thay đổi schema

| Endpoint | Limit | Window | Scope |
|---|---|---|---|
| `POST /admin/auth/login` | 10 req | 60s | per IP |
| `POST /user/auth/login` | 10 req | 60s | per IP |
| `POST /company-admin/auth/login` | 10 req | 60s | per IP |
| Global default | 100 req | 60s | per IP |

Khi vượt ngưỡng: HTTP 429, body theo format `TransformInterceptor` chuẩn của project:

```json
{
  "statusCode": 429,
  "message": "Too Many Requests",
  "data": null
}
```

Config đọc từ env vars `THROTTLE_LIMIT` và `THROTTLE_TTL` (giây) — không hardcode. DEV/STG có thể set cao hơn để tránh block automation test.

---

## 4. Service Layer Changes

### 4.1 S1 — CORS Whitelist (`src/main.ts`)

**Hiện trạng:** `origin: true` — chấp nhận mọi origin.

**Thay đổi:**

```typescript
// Đọc từ env var, production bắt buộc có
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) ?? [];
if (process.env.NODE_ENV === 'production' && allowedOrigins.length === 0) {
  throw new Error('ALLOWED_ORIGINS must be set in production');
}

app.enableCors({
  origin: (origin, callback) => {
    // Cho phép request không có origin (curl, mobile native, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  exposedHeaders: ['Content-Disposition'],
});
```

`ALLOWED_ORIGINS` được cấu hình khác nhau:
- DEV: `http://localhost:3001,http://localhost:3002,...`
- STG: `https://stg-admin.eskitchen.jp,https://stg-company.eskitchen.jp,...`
- PROD: `https://admin.eskitchen.jp,https://company.eskitchen.jp,...`

Không có domain nào hardcode trong source code.

### 4.2 S2 — ThrottlerModule (`src/app.module.ts`)

**Thêm import:**

```typescript
ThrottlerModule.forRootAsync({
  useFactory: (config: ConfigService) => ({
    throttlers: [
      {
        ttl: config.get<number>('THROTTLE_TTL') ?? 60,
        limit: config.get<number>('THROTTLE_LIMIT') ?? 100,
      },
    ],
  }),
  inject: [ConfigService],
}),
```

**Thêm global guard:**

```typescript
{ provide: APP_GUARD, useClass: ThrottlerGuard },
```

**Override per-route trên auth controllers:**

```typescript
@Throttle({ default: { ttl: 60, limit: 10 } })
@Post('login')
async login(...) {}
```

**Storage:** In-memory (default) cho Phase 1. Nếu cần scale multi-instance trong tương lai → chuyển sang `ThrottlerStorageRedisService` (tách task riêng, out-of-scope hiện tại).

### 4.3 S3 — orderBy Whitelist (`src/modules/admin/services/sales-analytics.service.ts`)

**Vấn đề xác nhận:** Dòng 73 và 159 dùng `` `"${filter.orderBy}"` `` — raw interpolation vào query. Dòng 375-391 trong `getByProduct` ĐÃ có `sortMapping` đúng chuẩn. Cần áp dụng pattern tương tự cho `getByCompany` và `exportCsvByCompany`.

**DTO validation hiện có:** `SalesAnalyticsCompanyRequest` đã có `@IsIn([...])` validation trên `orderBy` field (line 74-92 trong request file) — đây là tầng đầu tiên. Tuy nhiên vẫn cần whitelist map ở service layer vì defense in depth.

**Thay đổi tại `getByCompany` (line 73) và `exportCsvByCompany` (line 159):**

```typescript
// Thêm constant ở đầu service (trước class hoặc trong method)
const COMPANY_ORDER_BY_MAP: Record<string, string> = {
  companyCode: '"companyCode"',
  companyName: '"companyName"',
  totalQuantity: '"totalQuantity"',
  totalSales: '"totalSales"',
  countPaymentPaid: '"countPaymentPaid"',
  countPaymentRefunded: '"countPaymentRefunded"',
  totalPaymentRefunded: '"totalPaymentRefunded"',
  totalPaymentByCash: '"totalPaymentByCash"',
  totalPaymentByElepayApplepay: '"totalPaymentByElepayApplepay"',
  totalPaymentByElepayAupay: '"totalPaymentByElepayAupay"',
  totalPaymentByElepayCodes: '"totalPaymentByElepayCodes"',
  totalPaymentByElepayCreditCard: '"totalPaymentByElepayCreditCard"',
  totalPaymentByElepayDpay: '"totalPaymentByElepayDpay"',
  totalPaymentByElepayGooglepay: '"totalPaymentByElepayGooglepay"',
  totalPaymentByElepayMerpay: '"totalPaymentByElepayMerpay"',
  totalPaymentByElepayPaypay: '"totalPaymentByElepayPaypay"',
  totalPaymentByElepayAeonpay: '"totalPaymentByElepayAeonpay"',
  totalPaymentCashless: '"totalPaymentCashless"',
};

// Thay dòng 73 và 159:
// TRƯỚC: baseQb.orderBy(`"${filter.orderBy}"`, filter.order);
// SAU:
const safeOrderBy = COMPANY_ORDER_BY_MAP[filter.orderBy] ?? '"totalQuantity"';
baseQb.orderBy(safeOrderBy, filter.order);
```

Giá trị không nằm trong map → fallback `"totalQuantity"` (không throw, không reflect input).

### 4.4 S4 — Payment log redaction (`src/commons/utiliz/elepay/elepay.service.ts`)

**Dòng 70:** Xóa `console.log('Creating Elepay charge with DTO:', dto)`.

**Dòng 249-258:** Xóa toàn bộ `console.log(...)` block.

Thay thế (nếu cần trace) bằng NestJS Logger ở mức metadata-only:

```typescript
// Chỉ log charge ID sau khi tạo thành công — KHÔNG log payload đầu vào
private readonly logger = new Logger(ElepayService.name);

// Sau khi createCharge thành công:
this.logger.log(`Charge created: ${result.id}`);
// Sau khi createEasyQRCode thành công:
this.logger.log(`EasyQR code created: ${result.codeId}`);
```

Review toàn bộ `elepay.service.ts` — không chỉ 2 dòng đã biết — để xác nhận không có `console.log` nào khác chứa payment data.

### 4.5 D2 — verifyOtp transaction (`src/modules/user/services/registration.service.ts`)

**Phân tích hiện trạng (line 154-189):**
1. `cognitoService.createUserAndConfirm()` — external, không roll back được (line 155-166)
2. `userService.createUser()` — DB (line 168-179)
3. `historyRepository.insert()` — DB (line 182-186)
4. `pendingUserRepository.remove()` + `markOtpAsUsed()` — DB (line 189-190)

Step 1 là external và không transactional. Steps 2-4 là DB và phải atomic.

**Xác nhận:** `CognitoService.deleteUser(userPool, email)` đã có tại line 288-312 của `cognito.service.ts` — không cần thêm method mới.

**Pattern thay đổi:**

```typescript
// TRƯỚC khi transaction: Cognito create (irreversible — làm trước)
try {
  await this.cognitoService.createUserAndConfirm(AwsCognitoUserPool.USER, {...});
} catch (e) {
  throw new InternalServerErrorException(...);
}

// Sau khi Cognito thành công: wrap DB steps trong transaction
try {
  await this.dataSource.transaction(async (manager) => {
    // Step a: create user
    const user = manager.create(User, { ... });
    await manager.save(user);

    // Step b: save company history if linked
    if (user.companyId) {
      await manager.insert(UserCompanyHistory, {
        userId: user.id,
        companyId: user.companyId,
      });
    }

    // Step c: remove pending user
    await manager.remove(pendingUser);

    // Step d: mark OTP used — nếu markOtpAsUsed dùng repo riêng cần dùng manager
    await manager.update(Otp, { ... }, { isUsed: true });
  });
} catch (dbError) {
  // Compensating action: xóa Cognito user vừa tạo
  this.logger.error(
    `DB transaction failed after Cognito user created for ${request.email}. Attempting rollback.`,
    dbError,
  );
  try {
    await this.cognitoService.deleteUser(AwsCognitoUserPool.USER, request.email);
    this.logger.log(`Cognito user ${request.email} rolled back successfully.`);
  } catch (cognitoRollbackError) {
    // Compensating action cũng fail — orphan account, cần manual cleanup
    this.logger.error(
      `CRITICAL: Cognito rollback failed for ${request.email}. Manual cleanup required.`,
      { cognitoRollbackError, originalError: dbError },
    );
  }
  throw new InternalServerErrorException(
    this.i18n.t('user.auth.create_account_failed', { lang: I18nContext.current()?.lang }),
  );
}
```

**Lưu ý implementation:** `userService.createUser()` hiện là method của `UserService` inject riêng. Để dùng cùng transaction manager, cần hoặc (a) inline logic trực tiếp trong `registration.service.ts` dùng `manager`, hoặc (b) `UserService.createUser()` nhận optional `EntityManager` parameter. Option (a) đơn giản hơn cho context này.

**Dependency:** `dataSource` cần được inject vào `RegistrationService`:

```typescript
constructor(
  // existing...
  @InjectDataSource() private readonly dataSource: DataSource,
) {}
```

### 4.6 P1 — NotificationService cursor pagination (`src/modules/admin/services/notification.service.ts`)

**Hiện trạng (line 127):** `userRepo.find({ select: ['id'] })` — load all users vào memory.

**Phân tích:** Code phía dưới line 127 đã có chunking CHUNK_SIZE=1000 cho DB insert, nhưng vẫn load toàn bộ vào array trước. Vấn đề là bước 2 (load users) mới là unbounded.

**Thay đổi:** Đổi sang streaming theo batch:

```typescript
const BATCH_SIZE = parseInt(process.env.NOTIFICATION_BATCH_SIZE ?? '1000', 10);
let skip = 0;
let hasMore = true;

while (hasMore) {
  const batch = await this.userRepo.find({
    select: ['id'],
    take: BATCH_SIZE,
    skip,
  });

  if (batch.length === 0) break;
  hasMore = batch.length === BATCH_SIZE;

  const userNotiData = batch.map((user) => ({
    notificationId: notification.id,
    userId: user.id,
  }));
  await this.userNotificationRepo.insert(userNotiData);

  skip += BATCH_SIZE;
}
```

`NOTIFICATION_BATCH_SIZE` đọc từ env var (default 1000). Log progress mỗi batch để có observability.

**Lưu ý:** Bước 3 (collect device tokens) sau đó cũng query `userDeviceRepo` — không unbounded vì join với `userNotificationId` đã có. Không cần thay đổi bước 3.

### 4.7 P2 — Thay thế ORDER BY RANDOM() (`src/modules/admin/services/dashboard.service.ts`)

**Hiện trạng (line 204-215):** Dùng `ORDER BY RANDOM()` để pad thêm sản phẩm ngẫu nhiên vào dashboard khi top-selling < 10.

**Phân tích context:** Mục đích là "pad randomly remaining products" — không cần cryptographic random, chỉ cần "đủ đa dạng" cho dashboard display.

**Giải pháp: pool-based random bằng `TABLESAMPLE SYSTEM`**

PostgreSQL `TABLESAMPLE SYSTEM(pct)` lấy mẫu ngẫu nhiên dựa trên block sampling — nhanh hơn full-table scan, không dùng index nhưng không cần sort toàn bảng. Phù hợp với mục đích "diversity" không cần đảm bảo uniform distribution.

```typescript
if (targetProductIds.length < 10) {
  const needed = 10 - targetProductIds.length;

  // TABLESAMPLE SYSTEM lấy ~5% block ngẫu nhiên, giới hạn lại bằng LIMIT
  // Không dùng ORDER BY RANDOM() → không full-table scan
  let padRaw: { productId: string }[];
  if (targetProductIds.length > 0) {
    padRaw = await this.orderRepository.manager.query(
      `SELECT id::text AS "productId"
       FROM products TABLESAMPLE SYSTEM(5)
       WHERE id NOT IN (${targetProductIds.map((_, i) => `$${i + 1}`).join(',')})
       LIMIT $${targetProductIds.length + 1}`,
      [...targetProductIds, needed],
    );
  } else {
    padRaw = await this.orderRepository.manager.query(
      `SELECT id::text AS "productId" FROM products TABLESAMPLE SYSTEM(5) LIMIT $1`,
      [needed],
    );
  }

  targetProductIds.push(...padRaw.map((r) => r.productId));
}
```

**Tradeoff:** `TABLESAMPLE SYSTEM(5)` có thể không trả đủ `needed` rows nếu bảng nhỏ (< 20 rows). Với bảng nhỏ → fallback thêm query không có TABLESAMPLE nếu cần. Confirm với PM: nếu số sản phẩm catalog nhỏ thì padding logic có thể bỏ hoàn toàn thay bằng "show all remaining".

### 4.8 Q1 — MenuService decoupling (`src/modules/user/services/menu.service.ts`)

**Hiện trạng:** `MenuService` inject `CartService` (line 45) và `FavoriteService` (line 44). Hai service này đều inject nhiều repo riêng của chúng.

**Phân tích circular risk:** Hiện tại `FavoriteService` không inject `MenuService` nhưng có `resolveActiveYearMonths` duplicated (line 214 của `favorite.service.ts`) — cho thấy đã có friction. `CartService` không inject `MenuService`. Circular chưa xảy ra nhưng rủi ro khi mở rộng là thực.

**Giải pháp: inject repository trực tiếp thay vì service**

`MenuService` chỉ cần từ `CartService`: lấy cart items của user. Từ `FavoriteService`: lấy set product IDs đã favorite của user. Cả hai đều là read query đơn giản.

```typescript
// Thay vì inject CartService + FavoriteService:
constructor(
  // existing repositories...
  @InjectRepository(CartItem)
  private readonly cartItemRepository: Repository<CartItem>,
  @InjectRepository(UserFavorite)
  private readonly userFavoriteRepository: Repository<UserFavorite>,
  // bỏ: private readonly favoriteService: FavoriteService,
  // bỏ: private readonly cartService: CartService,
  private readonly i18n: I18nService,
) {}
```

Inline query thay vì gọi service method:

```typescript
// Lấy cart items — thay vì this.cartService.getCartItems(userId)
const cartItems = await this.cartItemRepository.find({
  where: { cart: { userId } },
  select: ['productId', 'quantity'],
  relations: ['cart'],
});

// Lấy favorites — thay vì this.favoriteService.getFavoriteProductIds(userId)
const favorites = await this.userFavoriteRepository.find({
  where: { userId },
  select: ['productId'],
});
const favoriteIds = new Set(favorites.map(f => f.productId));
```

**Cần thêm `CartItem` và `UserFavorite` vào `TypeOrmModule.forFeature([...])` trong `UserModule` nếu chưa có.**

**Verify:** Response DTO của menu endpoints không thay đổi — chỉ đổi nguồn data từ service call sang repository query.

---

## 5. Interface với repo khác

Không có. Tech-debt internal. Không thay đổi:
- REST endpoint method/path/schema
- WebSocket events
- Push notification payload
- Behavior mà FE/Mobile đang dùng

---

## 6. Luồng xử lý chi tiết

### 6.1 verifyOtp transaction + compensating action (D2)

```
verifyOtp(request):
  1. validateOtp() → OTP expired/invalid? throw 400
  2. cognitoService.createUserAndConfirm()   ← OUTSIDE transaction (external, irreversible)
     └─ fail? → throw 500, không cần compensate (Cognito không tạo được)
  3. dataSource.transaction(manager =>
       a. manager.save(User entity)
       b. if (companyId): manager.insert(UserCompanyHistory)
       c. manager.remove(PendingUser)
       d. manager.update(Otp, isUsed: true)
     )
     └─ DB fail? → catch:
          LOG error (email, timestamp, reason)
          cognitoService.deleteUser(email)   ← compensating action
          └─ deleteUser fail? → LOG CRITICAL (manual cleanup required)
          throw 500
  4. authService.getTokens()
  5. return { user, tokens }
```

### 6.2 Cache-aside pattern (P3)

```
User request → MenuController.getMenuProducts(userId, query)
  │
  ▼
MenuService.getMenuProducts()
  │
  ├─ cacheManager.get(`menu:user:${yearMonth}`)
  │    ├─ HIT  → parse JSON → apply user-specific filters (cart, favorites) → return
  │    └─ MISS → query DB (existing logic)
  │                └─ cacheManager.set(key, JSON.stringify(result), TTL=600)
  │                └─ apply user-specific filters → return
  │
  └─ (cart items và favorites KHÔNG được cache — user-specific, thay đổi nhiều)
```

**Quan trọng:** Chỉ cache phần menu/product data không phụ thuộc user. Cart status và favorite status của từng user KHÔNG cache — query trực tiếp DB mỗi request.

### 6.3 Notification batch flow (P1)

```
publishMenuNotification(data):
  1. Create Notification record
  2. LOOP (cursor pagination):
     skip = 0
     WHILE hasMore:
       batch = userRepo.find({ take: BATCH_SIZE, skip })
       INSERT UserNotification records (batch)
       log progress: "Batch X: inserted Y records"
       skip += BATCH_SIZE
       hasMore = (batch.length == BATCH_SIZE)
  3. Query device tokens (join UserNotification) — unchanged
  4. Send FCM push notifications — unchanged
```

---

## 7. Non-Regression Risks

| Tính năng hiện có | File liên quan | Rủi ro | Mức độ | Mitigation |
|---|---|---|---|---|
| Admin/Company-Admin login | `admin-auth.controller.ts`, `admin-company-auth.controller.ts` | Throttle 10 req/phút có thể block automation test CI hoặc staging test manual | Medium | Set `THROTTLE_LIMIT=1000` trong DEV/STG env; whitelist CI IP nếu cần |
| User registration | `registration.service.ts` | Transaction rollback + compensating fail → orphan Cognito account | Low | Log đầy đủ với email + timestamp; chuẩn bị manual cleanup script |
| Payment charge (checkout + history) | `elepay.service.ts`, `order.service.ts` | Xóa `console.log` mất trace khi debug payment issue | Low | Thay bằng structured Logger chỉ log charge/code ID (không payload) |
| Sales analytics report | `sales-analytics.service.ts` | orderBy whitelist fallback về `totalQuantity` thay vì throw → behavior thay đổi nhẹ | Low | DTO đã có `@IsIn()` validation nên invalid orderBy không đến service; whitelist = defense in depth |
| Menu screen (mobile E01) | `menu.service.ts` | Tách inject CartService/FavoriteService có thể đổi behavior nếu repo query khác service method | Medium | Verify response schema bằng integration test trước khi merge Q1 |
| Dashboard admin | `dashboard.service.ts` | `TABLESAMPLE SYSTEM(5)` có thể không trả đủ rows nếu catalog nhỏ | Low | Confirm số lượng product hiện tại với team; nếu < 200 rows, bỏ padding logic |
| Notification publish | `notification.service.ts` | Batch insert thay vì 1 bulk insert → chậm hơn 1 chút nếu user ít | Low | Không ảnh hưởng correctness; chỉ là latency trade-off |
| OTP expiry check | `registration.service.ts` | Sau migration timestamptz, comparison `expiresAt > NOW()` vẫn đúng vì cả 2 là UTC | None | Test migration trên DB dump trước khi chạy STG |
| Payment `paidAt` timezone | `elepay-webhook.service.ts` | Sau migration, `paidAt` giờ có timezone context → báo cáo JST cần verify | Medium | Test query "doanh thu theo ngày JST" trước/sau migration trên STG |
| CORS | Tất cả FE clients | `ALLOWED_ORIGINS` cấu hình sai → toàn bộ FE bị reject 403 | High | DevOps verify env var trên DEV trước; test từng origin trước deploy STG |

---

## 8. Phase Breakdown

### Phase 1 — Security Hotfix (Critical, deploy trước G3)

**Target:** Merge vào develop và deploy lên STG trong Sprint hiện tại, trước G3 (W20).

| Task ID | Mô tả | File | Issue |
|---|---|---|---|
| task-1-1 | CORS whitelist — đổi `origin: true` sang env var whitelist | `src/main.ts:19-22` | S1 |
| task-1-2 | ThrottlerModule — import + global guard + auth override | `src/app.module.ts`, auth controllers | S2 |
| task-1-3 | orderBy whitelist `sales-analytics.service.ts` | `src/modules/admin/services/sales-analytics.service.ts:73,159` | S3 |
| task-1-4 | Payment log redaction — xóa `console.log` trong `elepay.service.ts` | `src/commons/utiliz/elepay/elepay.service.ts:70,249` | S4 |

**Deploy requirement:** task-1-1 cần DevOps cấu hình `ALLOWED_ORIGINS` trước khi deploy.

### Phase 2 — Data Integrity + Testing (High, trước G3)

| Task ID | Mô tả | File | Issue |
|---|---|---|---|
| task-2-1 | Migration timestamptz — tạo migration file + update 6 entity files | `database/migrations/`, 6 entity files | D1 |
| task-2-2 | verifyOtp transaction + compensating action | `src/modules/user/services/registration.service.ts` | D2 |
| task-2-3 | NotificationService batch pagination | `src/modules/admin/services/notification.service.ts:127` | P1 |
| task-2-4 | Unit test OrderService.checkout | `src/modules/user/services/order.service.spec.ts` | T1 |
| task-2-5 | Unit test CartService.addItem | `src/modules/user/services/cart.service.spec.ts` | T1 |
| task-2-6 | Unit test RegistrationService.verifyOtp (bao gồm D2 compensating) | `src/modules/user/services/registration.service.spec.ts` | T1 |

**Constraint:** task-2-1 cần review DB Admin trước khi chạy trên STG. task-2-4/2-5/2-6 cần làm sau task-2-2 để verify compensating action.

### Phase 3 — Performance + Code Quality (Medium/Low, trước G4)

| Task ID | Mô tả | File | Issue |
|---|---|---|---|
| task-3-1 | Dashboard — thay ORDER BY RANDOM() bằng TABLESAMPLE | `src/modules/admin/services/dashboard.service.ts:204-215` | P2 |
| task-3-2 | Redis cache layer — tạo RedisCacheModule + cache-aside trong MenuService | `src/commons/cache/`, `menu.service.ts` | P3 |
| task-3-3 | MenuService decoupling — tách CartService/FavoriteService | `src/modules/user/services/menu.service.ts` | Q1 |
| task-3-4 | AppModule @Global() cleanup | `src/app.module.ts:19` | Q2 |

**Constraint:** task-3-3 (MenuService decoupling) phải có integration test cover menu+cart+favorite flow trước khi merge. task-3-2 (Redis) cần DevOps confirm ElastiCache endpoint cho DEV/STG.

---

*Bước tiếp theo: Hãy là Tech Lead Tasks, phân rã DESIGN thành tasks cho feature: `es-kitchen-docs/docs/features/api-hardening/`*
