# DESIGN — es-kitchen-api · webapp-payment-oneqr

> **SPEC:** `../SPEC.md`
> **Repo:** `es-kitchen-api`
> **Author:** Tech Lead Design · 2026-08-21
> **Verdict:** ~95% endpoints đã tồn tại. Effort BE **rất nhỏ** (~1.5–2.5 人日) — chủ yếu là gap-fill + verify guest-first path đúng.

---

## 1. Executive summary

Sau khi grep source `es-kitchen-api`, **hầu hết infrastructure đã có sẵn** để support E07:

| Feature từ SPEC | BE status |
|---|---|
| Resolve QR → company info | ✅ **`GET /public/qr/companies/:code`** đã có (`CompanyQrController`) — response bao gồm `isGuestPaymentAllowed` |
| Guest session (JWT) | ✅ **`POST /auth/user/guest`** đã có (`AuthController.loginAsGuest`) — tạo user guest + trả JWT |
| Company config `isGuestPaymentAllowed` / `isCashPaymentAllowed` / `orderLimit` | ✅ Cả 3 field đã có trong `Company` entity |
| Menu + Product | ✅ `MenuController` · `CompanyMenuController` · Product endpoints |
| Cart CRUD (server-side) | ✅ `CartController` — 6 endpoints (BA-03 conflict: SPEC nói localStorage nhưng BE đã có server cart — xem section 4.1) |
| Checkout + payment strategies | ✅ `OrderController.checkout` + 13 payment strategies (Cash + 12 Elepay) |
| Payment webhook | ✅ `ElepayWebhookController` + `ElepayWebhookGuard` (signature verify) |
| Order history / pending / detail / cancel / retry | ✅ Full `OrderController` |
| Refund | ✅ `RefundController.POST /user/refunds` |
| Legal (Terms + Privacy) | ✅ 2 endpoints riêng biệt `GET /user/legal/terms` + `/privacy` (BA-08 nói 1 URL — xem 4.2) |
| Daily limit theo Company | ✅ `OrderLimitService` — parse `Company.orderLimit` (varchar hỗ trợ 半角/全角 số, JST timezone) |
| Order number generator | ✅ `generateOrderNumber()` private method trong `order.service.ts` — dùng `ORDER_NUMBER_CHARS` + `ORDER_NUMBER_LENGTH` constants (BA-18 confirmed reuse) |
| Barcode scan → product detail | ❌ **KHÔNG có endpoint riêng** — cần build (xem 3.1) |
| Reject Aeon Pay ở E07 | ⚠️ Strategy `ElepayAeonpayStrategy` tồn tại nhưng BA-06 chốt bỏ khỏi E07 — filter ở BE hoặc chỉ FE hide (xem 3.2) |

**Việc BE thực sự cần làm cho E07:**

1. **Verify guest-first path end-to-end** — mọi controller đang có `@UseGuards(JwtAuthGuard)` → check với guest JWT (từ `loginAsGuest`) có work không, `getUser('id')` trả về guest user id không (nếu có thì hoạt động out-of-the-box)
2. **Enforce `isGuestPaymentAllowed` check** — hiện field có nhưng chưa chắc service layer đã guard checkout khi company disable guest
3. **New endpoint `GET /user/products/scan/:barcode`** — resolve JAN code → product ID (SPEC AC-06)
4. **Filter payment method list per E07** — nếu client là guest webapp (via header/UA), hide Aeon Pay + Wechat Pay khỏi `paymentMethod.list` response
5. **(Optional) Consolidate Legal endpoint** — theo BA-08 chỉ cần 1 URL → thêm `GET /user/legal` gộp cả 2, OR để FE gọi 2 endpoints hiện tại rồi concat

**KHÔNG cần migration DB mới** (dùng `orderLimit`, `isGuestPaymentAllowed`, `isCashPaymentAllowed` đã có sẵn).

---

## 2. Blast radius — impacted files

### Verify (không đổi code, chỉ chạy test)
- `src/modules/user/services/auth.service.ts` — method `loginAsGuest()`
- `src/modules/user/services/order.service.ts` — `checkout()`, `getOrderHistory()`, `getPendingOrder()`, `retryPayment()`, `cancelOrder()`, `getOrderById()`
- `src/modules/user/services/refund.service.ts` — `createRefund()`
- `src/modules/user/services/order-limit.service.ts` — `getDailyLimitInfo()`
- `src/modules/user/services/payment-method.service.ts` — `list()`

### Có thể phải chỉnh (guest guard hoặc filter)
- `src/modules/user/services/order.service.ts` — verify checkout khi `!company.isGuestPaymentAllowed` → throw 403 (nếu chưa có)
- `src/modules/user/services/payment-method.service.ts` — thêm filter param `context: 'app' | 'web'` để hide Aeon Pay + Wechat Pay ở web (hoặc dùng `payment_method.web_enabled` flag mới — xem 3.2)

### Thêm mới
- `src/modules/user/http/controllers/product.controller.ts` — endpoint scan (hoặc gộp vào `MenuController` — thảo luận với team)
- `src/modules/user/services/product-lookup.service.ts` — service để scan JAN code
- `src/modules/user/http/controllers/legal.controller.ts` — (optional) thêm 1 `GET /user/legal` gộp
- `src/modules/user/http/responses/product-lookup.response.ts` — response DTO

**Blast radius: LOW.** Không đổi entity, không migration, không đổi public interface hiện có.

---

## 3. Endpoints chi tiết

### 3.1 New — `GET /user/products/scan/:barcode`

**Path:** `GET /user/products/scan/:barcode`

**Guard:** `@UseGuards(JwtAuthGuard)` — bắt buộc guest JWT (để BE biết company scope qua user's active session/company)

**Response DTO:**
```typescript
export class ProductScanResponse {
  @ApiProperty() id: string;
  @ApiProperty() productCode: string | null;
  @ApiProperty() janCode: string | null;
  @ApiProperty() name: string;
  @ApiProperty() price: number;
  @ApiProperty() available: boolean;  // false nếu product không thuộc company hiện tại hoặc out-of-stock
  @ApiPropertyOptional() menuId: string | null;  // để FE navigate `/product/:menuId`
}
```

**Logic:**
```typescript
// product-lookup.service.ts
async findByBarcode(
  barcode: string,
  companyId: string,
): Promise<ProductScanResponse> {
  // 1. Look up by janCode (barcode chuẩn) first, fallback productCode
  const product = await this.productRepository.findOne({
    where: [
      { janCode: barcode },
      { productCode: barcode },
    ],
  });

  if (!product) throw new NotFoundException('Product not found for barcode');

  // 2. Check product thuộc active menu của company hiện tại
  const menuProduct = await this.menuProductRepository.findOne({
    where: {
      productId: product.id,
      menu: { companyId, isActive: true, publishedMonth: <current YYYY-MM> },
    },
  });

  return {
    id: product.id,
    productCode: product.productCode,
    janCode: product.janCode,
    name: product.name,
    price: computeSubsidy(product.price, company.subsidy).userPays,
    available: !!menuProduct,
    menuId: menuProduct?.menuId ?? null,
  };
}
```

**Error cases:**
- Barcode không tồn tại → 404 `NotFoundException`
- Product tồn tại nhưng không thuộc menu company hiện tại → response 200 với `available: false`

### 3.2 Modify — `GET /user/payment-methods` filter Aeon Pay + Wechat Pay for E07

**Vấn đề:** `PaymentMethod` entity global — mobile app (E01) có thể muốn Aeon Pay, web (E07) không.

**Option A — Query param filter (simpler):**
```typescript
@Get()
list(
  @GetUser('id') userId: string,
  @Query('context') context?: 'app' | 'web',
): PaymentMethodResponse[] {
  const excluded = context === 'web' ? ['aeonpay', 'wechatpay'] : [];
  return this.paymentMethodService.list(userId, { excludeCodes: excluded });
}
```

FE E07 luôn gọi `?context=web`. Không cần migration.

**Option B — Column mới `web_enabled` boolean (rigorous):**
- Migration: `ALTER TABLE payment_methods ADD COLUMN web_enabled boolean DEFAULT true`
- Migration seed: `UPDATE payment_methods SET web_enabled = false WHERE code IN ('aeonpay', 'wechatpay')`
- Service filter by column
- Admin (E03) có UI toggle → cần thêm feature admin panel

**Recommendation:** **Option A** cho E07 — simple, không đổi DB, admin không cần UI mới. Nếu tương lai cần dynamic → migrate lên Option B.

### 3.3 Verify — Guest checkout guard

Hiện tại `OrderController.checkout` chỉ có `@UseGuards(JwtAuthGuard)`. Guest JWT vẫn qua guard nhưng service phải:

```typescript
// order.service.ts checkout()
async checkout(userId: string, body: CheckoutRequest) {
  const company = await this.getCompanyByCode(body.companyCode);

  const user = await this.userRepository.findOne({ where: { id: userId } });
  if (user.isGuest && !company.isGuestPaymentAllowed) {
    throw new ForbiddenException(
      this.i18n.t('user.order.guest_payment_disabled'),
    );
  }

  // ... rest of checkout logic
}
```

**Action item:** Grep `user.entity.ts` để confirm có field `isGuest` — nếu chưa có, cần đọc lại `AuthService.loginAsGuest()` để hiểu cách distinguish guest vs member (có thể dùng `user.email IS NULL` hoặc `user.type = 'guest'` enum).

### 3.4 Optional — Consolidate Legal endpoint (BA-08)

BA-08 chốt "1 URL cho Legal". 2 lựa chọn:

**Option A (recommended) — FE tự concat:** Giữ 2 endpoint hiện có (`/user/legal/terms` + `/privacy`), FE gọi song song 2 request và render trong cùng 1 page `/legal`. **Không cần đổi BE.**

**Option B — Thêm endpoint gộp:**
```typescript
// legal.controller.ts
@Get()
@Public()
async getAll(): Promise<{ terms: LegalDocumentResponse; privacy: LegalDocumentResponse }> {
  const [terms, privacy] = await Promise.all([
    this.legalService.getTerms(),
    this.legalService.getPrivacy(),
  ]);
  return { terms, privacy };
}
```

**Recommendation:** Option A — 0 effort BE, 1 dòng FE. Nếu latency quan trọng (2 round-trip) → chuyển Option B.

---

## 4. Design decisions cần confirm với PM/BA

### 4.1 Cart persistence — CONFLICT giữa SPEC và code hiện có

**SPEC BA-03 chốt:** cart lưu client-side `localStorage`.

**Reality:** FE `es-kitchen-webapp-payment/src/services/client/cart.service.ts` HIỆN ĐANG gọi BE endpoint `/user/cart/*` (server-side). BE `CartController` đầy đủ (getCart, addItem, updateItem, removeItem, clearCart, reset-status, reset-ack).

**3 lựa chọn:**

| Option | Pros | Cons |
|---|---|---|
| **A.** Giữ server-side cart (như code hiện có), cập nhật SPEC BA-03 | Đã build xong 100%, có cart-reset-event pattern, atomic checkout | Trái với answer BA-03; overhead round-trip mỗi lần +/- qty |
| **B.** Rip out server cart, migrate FE sang localStorage 100% | Match BA-03 chính xác, giảm BE load | Effort dev FE cao, mất `CartResetEvent` feature (menu change → reset cart), phải đổi checkout signature (nhận list items thay vì reference cart) |
| **C.** Hybrid — cart local, sync lên BE khi checkout | Match spirit của BA-03, giữ atomicity checkout | Mid effort, cần rewrite checkout DTO |

**Recommendation:** **Option A** — client trả lời BA-03 có thể chưa biết BE đã build server cart. Đề xuất **re-ask client BA-19: "Server cart đã có sẵn support atomic checkout + cart-reset khi menu thay tháng. Có OK giữ server-side không? Compromise: FE cache mirror trong localStorage để offline UX."**

### 4.2 Guest history retention

SPEC BA-04: history bind với guest session cookie/localStorage. Đổi browser → mất history.

**Reality BE:** `getOrderHistory(userId, query)` filter theo `userId`. Nếu guest user được tạo mỗi session mới → user id mới → history rỗng. **Đúng expectation.**

**Nhưng:** nếu FE có cơ chế "reuse guest JWT trong cookie" (BA-19 hàm ý — session persist) → cùng browser = cùng guest user = có history. Cần verify `authToken.ts` FE có persist token qua browser refresh không.

### 4.3 Menu-reset khi tháng mới

BE có `CartResetEvent` entity + `getCartResetStatus`/`ackCartReset` endpoints — khi admin publish menu tháng mới, cart cũ của user bị auto-reset và show modal.

Nếu chuyển sang localStorage (Option B của 4.1) → mất feature này. Cần confirm với BA có cần preserve không.

---

## 5. Testing strategy

### 5.1 Unit test (Nest test framework)

Files cần add/update spec:

- `src/modules/user/services/company-qr.service.spec.ts` — đã có, verify test case: inactive company, unknown code, mixed-case code
- `src/modules/user/services/auth.service.spec.ts` — thêm case `loginAsGuest()` cho company `isGuestPaymentAllowed = false`
- `src/modules/user/services/order.service.spec.ts` — thêm case:
  - Guest user + company allow guest → checkout success
  - Guest user + company disable guest → 403 Forbidden
  - Guest user daily limit theo `Company.orderLimit`
- `src/modules/user/services/product-lookup.service.spec.ts` — **NEW** — cover: barcode found + in menu, found + not in menu, not found
- `src/modules/user/services/refund.service.spec.ts` — verify refund window 30 phút cho guest order

### 5.2 Integration test

- `checkout → payment webhook → order status COMPLETED` — end-to-end guest flow
- `resolve QR → guest login → checkout` — full flow

### 5.3 Manual smoke (before deploy DEV)

```bash
# 1. Guest session
curl -X POST https://dev-es-qr.es-kitchen.co.jp/auth/user/guest

# 2. Resolve QR
curl https://dev-es-qr.es-kitchen.co.jp/public/qr/companies/CU001

# 3. Payment methods (context=web filter)
curl -H "Authorization: Bearer $GUEST_JWT" \
  "https://dev-es-qr.es-kitchen.co.jp/user/payment-methods?context=web"
# Expect: no aeonpay, no wechatpay

# 4. Scan barcode
curl -H "Authorization: Bearer $GUEST_JWT" \
  https://dev-es-qr.es-kitchen.co.jp/user/products/scan/4901234567890
```

---

## 6. Migration

**Không cần migration mới cho E07 nếu chọn Option A ở 3.2 (payment filter qua query param).**

Nếu chọn Option B (column `payment_methods.web_enabled`):

```typescript
// database/migrations/1787XXXXX-AddWebEnabledToPaymentMethod.ts
export class AddWebEnabledToPaymentMethod1787XXXXX implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE payment_methods
      ADD COLUMN web_enabled boolean NOT NULL DEFAULT true
    `);
    await queryRunner.query(`
      UPDATE payment_methods
      SET web_enabled = false
      WHERE code IN ('aeonpay', 'wechatpay')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE payment_methods DROP COLUMN web_enabled
    `);
  }
}
```

---

## 7. Configuration

### 7.1 Env vars

Không cần env mới. Reuse:
- `JWT_SECRET_USER` — cho guest JWT
- `ELEPAY_*` — payment SDK
- `DATABASE_URL` — Postgres
- `APP_TIMEZONE=Asia/Tokyo` — OrderLimitService dùng JST

### 7.2 CORS

Cần bổ sung origin cho 3 domain E07 vào CORS config (`main.ts`):

```typescript
app.enableCors({
  origin: [
    // ... existing
    'https://es-qr.es-kitchen.co.jp',
    'https://stg-es-qr.es-kitchen.co.jp',
    'https://dev-es-qr.es-kitchen.co.jp',
  ],
  credentials: true,
  // ...
});
```

**Blast radius:** verify không có regression khi bổ sung origin (config-level, không đổi controller).

### 7.3 Swagger

Endpoint scan mới sẽ tự động appear trong Swagger doc `/docs/user` (đã có UserModule include). Không cần config thêm.

---

## 8. Tasks estimate

| # | Task | Effort (人日) |
|---|---|---|
| 1 | Verify guest login → checkout end-to-end (đọc code + local test) | 0.25 |
| 2 | Add `isGuestPaymentAllowed` check trong `OrderService.checkout` (nếu chưa có) | 0.25 |
| 3 | Add `GET /user/products/scan/:barcode` — controller + service + response DTO + unit test | 0.5 |
| 4 | Add payment method filter `?context=web` (Option A) | 0.25 |
| 5 | CORS config bổ sung 3 domain E07 | 0.125 |
| 6 | (Optional) Consolidate Legal endpoint | 0.125 |
| 7 | Integration test guest flow + fix bug phát sinh | 0.5 |
| **Tổng BE** | | **~2.0 人日** |

**Nhỏ hơn nhiều estimate ban đầu** — vì FE estimate 12.875 人日 nhưng SPEC ngầm định BE cần build nhiều endpoint. Reality: BE gần như xong.

---

## 9. Handover cho Tech Lead Tasks

Sau khi Tech Lead Design confirm với BA/PM về section 4 (cart persistence conflict + follow-up questions), Tech Lead Tasks phân rã:

**Phase 1 — Migration/config (0.125 人日):** CORS · optional payment column
**Phase 2 — API (1.0 人日):** scan endpoint · guest guard · payment filter
**Phase 3 — Handover FE:** đã có sẵn 95%, xem `../es-kitchen-webapp-payment/DESIGN.md`
**Phase 4 — Integration test (0.5 人日):** end-to-end guest flow

**API Contract sau khi implement Phase 2** phải copy sang FE task Phase 3 (theo BMAD workflow) — format:

```markdown
## API Contract — E07 delta

### POST /auth/user/guest
Existing — no change. Returns `{ accessToken, refreshToken, user: { id, isGuest: true } }`.

### GET /public/qr/companies/:code
Existing — response `{ companyId, companyCode, companyName, isGuestPaymentAllowed }`.

### GET /user/products/scan/:barcode  ← NEW
Guard: JwtAuthGuard
Params: barcode (string) — JAN or productCode
Response: `{ id, productCode, janCode, name, price, available, menuId }`

### GET /user/payment-methods?context=web  ← MODIFIED
Optional query param `context` — when `web`, excludes aeonpay + wechatpay.
Existing response shape unchanged.

### GET /user/legal/terms
### GET /user/legal/privacy
Existing — FE concat 2 responses vào 1 page.
```

---

## 10. Open questions cho BA (block Phase 2)

Chuyển tiếp vào SPEC BA TODOs 11.3 khi feedback:

- **BA-19 (mới):** Cart client-side (BA-03) vs server-side (đã build). Đề xuất giữ server cart — client có OK không?
- **BA-20 (mới):** `Company.orderLimit` là `varchar` chứa cả text "オーダー制限なし". OrderLimitService parse text này thành -1 (no limit). Confirm với admin flow (E02/E03) rằng đây là expected UX cho web guest checkout không? (không có UI web hiển thị text limit — chỉ dùng number)
- **BA-21 (mới):** Guest user record — có xoá auto sau X ngày không hoạt động không? Guest table có thể phình to. (Cần confirm data retention policy)
