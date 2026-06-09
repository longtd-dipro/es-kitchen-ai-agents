  # SPEC — API Hardening

**Loại:** Cross-repo (internal initiative — chỉ ảnh hưởng `es-kitchen-api`)
**Ngày tạo:** 2026-06-02
**Tác giả:** BA Agent
**Status:** Draft

---

## 1. Tổng quan

API Hardening là initiative nội bộ do Tech Lead khởi động sau khi Health Check phát hiện **4 Critical** và **8 Warning** issues trong `es-kitchen-api`. Đây không phải feature mới cho end-user mà là đợt củng cố nền tảng kỹ thuật nhằm đảm bảo hệ thống đủ điều kiện đưa vào giai đoạn tích hợp và go-live (G6: 15/12/2026).

Các vấn đề được phân loại theo 5 nhóm: Security, Data Integrity, Performance, Code Quality, và Testing.

---

## 2. Mục tiêu

### 2.1 Business objectives

- Bảo vệ dữ liệu thanh toán và thông tin người dùng khỏi rủi ro bảo mật trước khi go-live
- Đảm bảo tính chính xác của nghiệp vụ phụ thuộc vào thời gian (OTP expiry, refund window, contract delivery schedule)
- Ngăn chặn sự cố downtime do memory spike hoặc truy vấn không tối ưu khi user base tăng
- Đáp ứng yêu cầu bảo mật tối thiểu của client Nhật Bản và tiêu chuẩn PCI-DSS cho payment flow

### 2.2 Technical objectives

- Đóng toàn bộ 4 Critical issues trước Phase 3 (DEV Complete, G3 W20)
- Giảm Warning issues xuống 0 trước G4 (IT Pass, W24)
- Thiết lập baseline unit test coverage cho business-critical services
- Chuẩn hóa codebase theo patterns đã được xác định là đúng trong codebase hiện tại

---

## 3. Stakeholders & Actors

### 3.1 Stakeholders trực tiếp

| Role | Trách nhiệm |
|---|---|
| Tech Lead (es-kitchen-api) | Driver của initiative — xác định implementation approach, review DESIGN |
| DevOps | Deploy hotfix Critical issues, cập nhật env vars (`ALLOWED_ORIGINS`, throttle config) |
| Security Lead | Review và sign-off các thay đổi liên quan Security group |
| PM | Phê duyệt scope, sắp xếp timeline vào backlog, phase-gate alignment |

### 3.2 Beneficiaries gián tiếp

Tất cả end-user actors hưởng lợi từ API ổn định và an toàn hơn:

| Actor | Lợi ích |
|---|---|
| E01 — End User (mobile) | OTP expire đúng, payment data không bị log, app không bị block bởi rate limit hợp lệ |
| E02 — Company Admin | Order checkout tin cậy hơn, menu load nhanh hơn |
| E03 — System Admin | Dashboard không gây full-table scan, notification publish không spike memory |
| E04 — Supplier | Menu query có cache, không overload DB |

---

## 4. Scope

### 4.1 In-scope (12 issues)

#### Security (4 Critical)

| # | Issue | File:Line |
|---|---|---|
| S1 | CORS mở hoàn toàn — credential leak vector | `src/main.ts:19-22` |
| S2 | Không có HTTP rate limiting trên auth endpoints | `src/main.ts`, `src/app.module.ts` |
| S3 | SQL injection risk — raw user input trong `orderBy` | `src/modules/admin/services/sales-analytics.service.ts:73,159` |
| S4 | `console.log` payment DTO ra stdout | `src/commons/utiliz/elepay/elepay.service.ts:70,249` |

#### Data Integrity (2 Warning)

| # | Issue | File:Line |
|---|---|---|
| D1 | Column kiểu `timestamp` thay vì `timestamptz` — nhiều bảng | `payment`, `otp`, `user`, `admin`, `menu` entities |
| D2 | `verifyOtp()` không có transaction — user có thể stuck giữa Cognito và DB | `src/modules/user/services/registration.service.ts:139-166` |

#### Performance (3 Warning)

| # | Issue | File:Line |
|---|---|---|
| P1 | `publishMenuNotification` load all users không limit — memory spike | `src/modules/admin/services/notification.service.ts:126` |
| P2 | `ORDER BY RANDOM()` — full-table scan, non-deterministic | `src/modules/admin/services/dashboard.service.ts:199` |
| P3 | Không có Redis cache layer cho menu/category queries | Toàn bộ `src/` |

#### Code Quality (2 Warning)

| # | Issue | File:Line |
|---|---|---|
| Q1 | `MenuService` inject `CartService` + `FavoriteService` — service coupling, circular risk | `MenuService` |
| Q2 | `@Global()` trên `AppModule` không exports — vô nghĩa, gây confusion | `src/app.module.ts` |

#### Testing (1 Warning)

| # | Issue | Coverage |
|---|---|---|
| T1 | 0% unit test trên business logic — chỉ 6 spec trong auth + mail utils | `OrderService.checkout`, `CartService.addItem`, `RegistrationService.verifyOtp` |

### 4.2 Out-of-scope

- Các điểm được đánh giá tốt trong Health Check (column snake_case, `eager: false`, migration `up/down`, transaction trong refund/restrict, `ClassSerializerInterceptor`, `ValidationPipe`, `ConfigService`) — giữ nguyên, không thay đổi
- Thay đổi business logic — hardening chỉ sửa kỹ thuật, không đổi nghiệp vụ
- Frontend / Mobile repositories — không nằm trong scope của initiative này
- Thay đổi API contract (method, path, request/response schema) — nếu cần thay đổi phải tạo SPEC riêng
- Performance optimization cho Yamato YBM / Sagawa integration
- Nâng cấp version NestJS, TypeORM, hay dependency lớn

---

## 5. Hardening Objectives & Acceptance Criteria

### 5.1 Security

#### S1 — CORS Whitelist

**Hiện trạng:** `origin: true, credentials: true` — chấp nhận mọi origin, kết hợp credentials tạo CSRF/credential leak vector.

**Tác động:**
- Business: Dữ liệu session và cookie có thể bị đánh cắp từ domain giả mạo
- Technical: Bất kỳ website nào cũng có thể gửi authenticated request tới API

**Priority:** Critical

**Acceptance Criteria:**
- CORS chỉ accept origin nằm trong danh sách `ALLOWED_ORIGINS` environment variable
- Request từ origin không nằm trong whitelist bị reject với status 403
- `ALLOWED_ORIGINS` được cấu hình khác nhau cho DEV / STG / PROD
- `credentials: true` chỉ được bật khi origin đã được whitelist — không bật globally
- Không có hardcode domain trong source code

---

#### S2 — HTTP Rate Limiting (Throttler)

**Hiện trạng:** Không có rate limiting — login endpoint của 3 module (admin, user, company-admin) có thể bị brute-force không giới hạn.

**Tác động:**
- Business: Tài khoản user / admin có thể bị brute-force credential
- Technical: Không có bảo vệ trước credential stuffing attack

**Priority:** Critical

**Acceptance Criteria:**
- Login endpoint (admin / user / company-admin) bị throttle: tối đa **10 request/phút per IP**
- Khi vượt ngưỡng, API trả về HTTP 429 với message rõ ràng (không leak thông tin hệ thống)
- Throttle config (limit, TTL) được đọc từ environment variable — không hardcode
- Các endpoint không phải auth không bị ảnh hưởng bởi strict throttle của auth (global throttle có thể lỏng hơn)
- Throttle counter reset sau TTL window

---

#### S3 — SQL Injection Prevention trong `orderBy`

**Hiện trạng:** `sales-analytics.service.ts:73,159` nội suy raw user input vào `orderBy` clause: `` orderBy(`"${filter.orderBy}"`, ...) ``. Pattern đúng đã tồn tại ở các service khác (whitelist map) nhưng chưa được áp dụng tại đây.

**Tác động:**
- Business: Attacker có thể leak dữ liệu nhạy cảm qua SQL injection trong analytics report
- Technical: Raw string interpolation vào query — không được TypeORM escape

**Priority:** Critical

**Acceptance Criteria:**
- `orderBy` trong `sales-analytics.service.ts` sử dụng whitelist map (pattern đã có trong codebase)
- Giá trị không nằm trong whitelist fallback về default sort an toàn (không throw error, không reflect input)
- Không còn raw string interpolation của user input vào bất kỳ query clause nào trong file này
- Unit test verify rằng invalid `orderBy` value không gây SQL error và fallback đúng

---

#### S4 — Xóa `console.log` Payment Data

**Hiện trạng:** `elepay.service.ts:70,249` log payment DTO (bao gồm thông tin thanh toán) ra stdout — vi phạm PCI-DSS và security rule của dự án.

**Tác động:**
- Business: Vi phạm tiêu chuẩn bảo mật payment — có thể gây vấn đề pháp lý với client Nhật Bản
- Technical: Payment data xuất hiện trong log aggregation system (CloudWatch, etc.), có thể bị truy cập bởi người không được phép

**Priority:** Critical

**Acceptance Criteria:**
- Toàn bộ `console.log` có chứa payment DTO, transaction data, hoặc user payment info đã được xóa hoặc thay bằng log ở level debug chỉ log metadata (không log payload)
- Không có payment data (amount, card info, token, DTO object) trong bất kỳ log output nào
- Review toàn bộ `elepay.service.ts` — không chỉ 2 dòng đã biết

---

### 5.2 Data Integrity

#### D1 — Migrate `timestamp` sang `timestamptz`

**Hiện trạng:** Các column thời gian quan trọng dùng `timestamp` (không có timezone): `payment.paid_at`, `otp.expires_at`, `user.linked_at`, `user.unlinked_at`, `user.last_login_at`, `admin.last_login_at`, `admin.deleted_at`, `menu.auto_pub_date`.

**Tác động:**
- Business:
  - OTP `expires_at` tính sai theo timezone → OTP không expire đúng giờ (security risk + UX bug)
  - `payment.paid_at` sai timezone → refund window tính sai, sai báo cáo doanh thu
  - `menu.auto_pub_date` publish sai giờ → menu xuất hiện sai thời điểm với user
- Technical: PostgreSQL lưu `timestamp` as-is, không convert timezone — gây inconsistency khi server ở UTC nhưng business ở JST (+09:00)

**Priority:** High

**Acceptance Criteria:**
- Tất cả column thời gian liệt kê ở trên được migrate sang `timestamptz`
- Migration có cả `up` và `down` — rollback được
- Dữ liệu hiện có không bị mất hoặc corrupt sau migration
- Application code đọc/ghi các column này xử lý đúng timezone (không assume UTC hay JST hardcode)
- Báo cáo tính theo giờ JST vẫn cho kết quả đúng sau migration

---

#### D2 — Transaction cho `verifyOtp()`

**Hiện trạng:** `registration.service.ts:139-166` thực hiện sequence: Cognito create account → DB user create → history save → remove pending registration — không có transaction. Nếu step 3 hoặc 4 fail, user có Cognito account nhưng không có DB record → stuck, không thể login lại và không thể re-register.

**Tác động:**
- Business: User bị khóa tài khoản vĩnh viễn, không self-service được — phải escalate support
- Technical: Data inconsistency giữa Cognito (external) và PostgreSQL (internal)

**Priority:** High

**Acceptance Criteria:**
- Toàn bộ sequence trong `verifyOtp()` được bảo vệ: nếu DB transaction fail sau khi Cognito user đã được tạo, phải có compensating action xóa Cognito user
- Nếu compensating action cũng fail, lỗi phải được log đầy đủ (Cognito user ID, timestamp, error reason) để team có thể manual cleanup
- User không bao giờ ở trạng thái "có Cognito, không có DB record" sau khi `verifyOtp()` return (dù success hay error)
- Unit test cover scenario: DB insert fail sau Cognito create thành công — verify compensating action được gọi

---

### 5.3 Performance

#### P1 — Giới hạn `publishMenuNotification` query

**Hiện trạng:** `notification.service.ts:126` dùng `userRepo.find({ select: ['id'] })` không có limit/pagination → load toàn bộ user IDs vào memory khi publish notification.

**Tác động:**
- Business: Khi số lượng user tăng (scale), publish notification gây memory spike → API pod restart → disruption cho tất cả user
- Technical: Unbounded query — không acceptable cho production

**Priority:** High

**Acceptance Criteria:**
- `publishMenuNotification` không load toàn bộ users vào memory trong 1 lần
- Giới hạn batch size được config qua environment variable (không hardcode)
- Tổng số notification vẫn được gửi đủ (không bỏ sót user)
- Memory usage trong quá trình publish không vượt quá ngưỡng hợp lý (xác định cụ thể trong DESIGN)

---

#### P2 — Thay thế `ORDER BY RANDOM()`

**Hiện trạng:** `dashboard.service.ts:199` dùng `ORDER BY RANDOM()` — PostgreSQL phải scan toàn bảng products và sort randomly, không dùng index được.

**Tác động:**
- Business: Dashboard admin load chậm khi catalog sản phẩm lớn
- Technical: Non-deterministic, không cacheable, không dùng index — tệ nhất trên bảng lớn

**Priority:** Medium

**Acceptance Criteria:**
- `ORDER BY RANDOM()` được thay thế bằng phương pháp không yêu cầu full-table scan
- Kết quả trả về vẫn đảm bảo tính "ngẫu nhiên" hoặc "đa dạng" đủ cho mục đích hiển thị dashboard (không phải cryptographic random)
- Query execution plan không còn `Seq Scan` không có filter trên bảng products cho endpoint này
- Phương pháp thay thế cụ thể do Tech Lead quyết định trong DESIGN

---

#### P3 — Redis Cache Layer cho Menu/Category

**Hiện trạng:** Toàn bộ menu và category query đi thẳng vào PostgreSQL mỗi request — không có caching. Redis đã có trong tech stack (AWS ElastiCache) nhưng chưa được dùng.

**Tác động:**
- Business: Menu load chậm, DB load cao trong giờ cao điểm order (trưa) — ảnh hưởng E01 user experience
- Technical: Redundant DB query cho data ít thay đổi (menu/category thường chỉ update 1-2 lần/ngày)

**Priority:** Medium

**Acceptance Criteria:**
- Menu list và category list được cache trong Redis với TTL rõ ràng (giá trị cụ thể do Tech Lead định nghĩa trong DESIGN)
- Khi supplier/admin cập nhật menu hoặc category, cache tương ứng bị invalidate
- Cache miss fallback về DB — không return empty/error
- Cache hit rate có thể đo lường được (log hoặc metric)
- TTL và cache key pattern được config, không hardcode

---

### 5.4 Code Quality

#### Q1 — Tách service coupling trong `MenuService`

**Hiện trạng:** `MenuService` inject trực tiếp `CartService` và `FavoriteService` — tạo tight coupling giữa các domain và tiềm năng circular dependency.

**Tác động:**
- Business: Không có tác động trực tiếp hiện tại, nhưng tăng risk của regression khi sửa một trong các service
- Technical: Circular dependency có thể xảy ra nếu `CartService` hoặc `FavoriteService` cần tham chiếu ngược về `MenuService`. Vi phạm nguyên tắc separation of concerns.

**Priority:** Medium

**Acceptance Criteria:**
- `MenuService` không inject trực tiếp `CartService` hoặc `FavoriteService`
- Dependency graph giữa 3 service này không có circular reference
- Behavior hiện tại của các endpoint dùng menu + cart + favorite không thay đổi từ góc nhìn API contract
- Phương pháp tách cụ thể (event-driven, facade, repository pattern) do Tech Lead quyết định trong DESIGN

---

#### Q2 — Xóa `@Global()` vô nghĩa

**Hiện trạng:** `AppModule` được đánh dấu `@Global()` nhưng không có `exports` array — decorator này không có tác dụng và gây nhầm lẫn khi đọc code.

**Tác động:**
- Business: Không có
- Technical: Misleading code — developer mới có thể hiểu sai về cách module injection hoạt động trong codebase

**Priority:** Low

**Acceptance Criteria:**
- `@Global()` decorator được xóa khỏi `AppModule` hoặc được giải thích rõ nếu có lý do cố tình giữ
- Không có runtime behavior thay đổi sau khi xóa

---

### 5.5 Testing

#### T1 — Unit Test Coverage cho Business-Critical Services

**Hiện trạng:** Chỉ có 6 spec file trong `auth/` và `commons/utiliz/mail/`. Các service quan trọng nhất — `OrderService.checkout`, `CartService.addItem`, `RegistrationService.verifyOtp` — không có unit test.

**Tác động:**
- Business: Bug regression trong checkout hoặc registration không được phát hiện sớm — gây incident production
- Technical: Không có safety net khi refactor, không thể verify fix của D2 (transaction) mà không có test

**Priority:** High

**Acceptance Criteria:**
- `OrderService.checkout`: có unit test cover ít nhất happy path + payment fail scenario + inventory insufficient scenario
- `CartService.addItem`: có unit test cover happy path + duplicate item + item không tồn tại
- `RegistrationService.verifyOtp`: có unit test cover happy path + OTP expired + OTP invalid + DB fail after Cognito create (verify compensating action)
- Test chạy pass trong CI pipeline (không flaky)
- Test không phụ thuộc vào external service thực — mock Cognito, mock DB, mock elepay

---

## 6. Non-functional Requirements

| NFR | Yêu cầu |
|---|---|
| Backward compatibility | Không thay đổi API contract (method, path, request/response schema) — nếu cần thay đổi phải tạo SPEC riêng |
| Zero downtime | Critical fixes (S1-S4) phải deployable mà không cần restart dài — hotfix strategy do DevOps xác nhận |
| Environment isolation | Config thay đổi (CORS whitelist, throttle limit, Redis TTL) phải khác nhau giữa DEV / STG / PROD |
| Observability | Sau khi fix P1, log phải đủ để monitor batch notification progress |
| Rollback safety | Migration D1 phải có `down()` hoạt động đúng |

---

## 7. Constraints & Assumptions

### Constraints

- Không thay đổi external API contract — các repo FE và Mobile không cần update
- Không nâng cấp major version của NestJS, TypeORM, hay các dependency liên quan
- Cognito là external service — compensating action trong D2 là best-effort; nếu Cognito API fail thì phải log đủ thông tin để manual cleanup
- Redis (ElastiCache) đã có trong infrastructure — không cần provision mới

### Assumptions

- `ALLOWED_ORIGINS` cho DEV/STG/PROD đã được PM/DevOps xác nhận danh sách trước khi deploy S1
- Ngưỡng throttle (10 req/phút) là khởi điểm — có thể điều chỉnh sau khi quan sát traffic thực tế ở STG
- Business logic của `verifyOtp()` không thay đổi — chỉ thêm transaction wrapper và compensating action
- Menu/Category cache invalidation trigger là khi admin/supplier thực hiện create/update/delete — không có real-time sync phức tạp hơn

---

## 8. Dependencies & Risks

### Dependencies

| Dependency | Mô tả | Cần trước |
|---|---|---|
| DevOps | Cấu hình `ALLOWED_ORIGINS`, throttle env vars trên DEV/STG/PROD | Trước khi deploy S1, S2 |
| Security Lead | Review và sign-off S1-S4 | Trước G3 |
| Tech Lead | Xác nhận whitelist map pattern cho S3 | Trong DESIGN phase |
| DB Admin / DevOps | Review migration plan cho D1 trước khi chạy trên STG | Trước G4 |

### Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Migration `timestamptz` (D1) gây data conversion lỗi trên STG | Medium | High | Test migration trên DB dump từ STG trước khi chạy thực |
| Compensating action D2 fail cả 2 bước → orphan Cognito account | Low | Medium | Alert + manual cleanup runbook do DevOps chuẩn bị |
| Redis cache invalidation incomplete (P3) → user thấy menu cũ | Medium | Medium | TTL ngắn làm safety net; invalidation logic được test kỹ |
| Tách service coupling Q1 gây regression ẩn | Low | High | Phải có integration test cover menu + cart + favorite flow trước khi merge |
| Throttle limit S2 quá chặt gây false positive cho automation test | Medium | Low | Whitelist IP của CI runner hoặc điều chỉnh limit cho non-PROD env |

---

## 9. Phase-gate Alignment

| Issue group | Đề xuất timing | Lý do |
|---|---|---|
| **S1, S2, S3, S4** (4 Critical) | Hotfix — trước G3 (W20), ưu tiên trong Sprint hiện tại | Security risk không thể chờ đến phase cleanup; cần deploy sớm lên STG để Security Lead review |
| **D1** (timestamptz migration) | Phase 1 DB — sớm nhất có thể, trước G3 | Migration phải chạy trước khi DEV hoàn chỉnh để tránh thêm bug mới từ timestamp |
| **D2** (verifyOtp transaction) | Phase 2 — ghép vào sprint Registration refinement, trước G3 | Blocking risk cho user onboarding |
| **P1** (unbounded notification query) | Phase 2 — trước G3 | Risk tăng theo user growth; cần fix trước khi tích hợp |
| **T1** (unit test coverage) | Phase 2 — trước G3 | Test phải có để verify D2 fix và làm safety net cho các service quan trọng |
| **P2** (ORDER BY RANDOM) | Phase 3 cleanup — trước G4 | Medium priority, không blocking |
| **P3** (Redis cache) | Phase 3 — song song với FE/Mobile integration, trước G4 | Performance optimization, không blocking correctness |
| **Q1** (service coupling) | Phase 3 cleanup — trước G4 | Refactor, cần có T1 test coverage trước khi làm |
| **Q2** (@Global cleanup) | Phase 3 cleanup — trước G4 | Low risk, low priority |

### Mapping sang Phase-gate

| Gate | Milestone | API Hardening checkpoint |
|---|---|---|
| G1 (W4) | REQ Sign-off | SPEC này được approve |
| G2 (W8) | Design Sign-off | DESIGN.md cho tất cả issues được Tech Lead hoàn thành |
| G3 (W20) | DEV Complete | S1-S4 + D1 + D2 + P1 + T1 đã implement và pass IT trên STG |
| G4 (W24) | IT Pass | P2 + P3 + Q1 + Q2 hoàn thành, Security Lead sign-off |
| G5 (W28) | UAT Sign-off | Không có hardening item mở |
| G6 (W31) | Go-Live | Tất cả 12 issues đóng |

---

## 10. References

| Tài liệu | Đường dẫn |
|---|---|
| Health Check findings | Prompt đầu vào từ Tech Lead (2026-06-02) |
| Business context & Phase-gate | `/Users/longtd/Desktop/WORK/AI_AGENTS_ES_KITCHEN/.claude/context/specification.md` |
| Doc structure | `/Users/longtd/Desktop/WORK/AI_AGENTS_ES_KITCHEN/.claude/context/doc-structure.md` |
| Security rules | `/Users/longtd/Desktop/WORK/AI_AGENTS_ES_KITCHEN/.claude/rules/security-rules.md` |
| Stack constraints | `/Users/longtd/Desktop/WORK/AI_AGENTS_ES_KITCHEN/.claude/rules/stack-constraints.md` |
| Coding style (orderBy whitelist pattern) | `/Users/longtd/Desktop/WORK/AI_AGENTS_ES_KITCHEN/.claude/rules/coding-style.md` |

---

*SPEC này không chứa giải pháp kỹ thuật (HOW). Tech Lead sẽ tạo DESIGN.md tại bước tiếp theo.*

---

## Screens

> **Lưu ý:** API Hardening là initiative nội bộ backend — không tạo màn hình mới. Bảng dưới liệt kê các màn hình hiện có bị **ảnh hưởng gián tiếp** (nhận lợi ích từ hardening). Không cần thiết kế UI mới cho feature này.

| Screen Code | Screen | Actor | App | Screen Type | Mô tả ngắn |
|---|---|---|---|---|---|
| UA_APIH_001 | Login / OTP Verification* | E01 | E01 (es-kitchen-payment-app) | Wizard | OTP expires_at tính đúng timezone sau D1; rate limiting S2 bảo vệ brute-force |
| UA_APIH_002 | Menu List / Category Browse* | E01 | E01 (es-kitchen-payment-app) | Card-list | Menu load nhanh hơn sau khi có Redis cache P3; không bị gián đoạn do pod restart P1 |
| UA_APIH_003 | Checkout / Payment* | E01 | E01 (es-kitchen-payment-app) | Wizard | Payment data không còn bị log ra stdout S4; checkout có unit test safety net T1 |
| CW_APIH_001 | Company Admin Login* | E02 | E02 (es-kitchen-web-company) | Form | Rate limiting S2 áp dụng cho company-admin login endpoint |
| CW_APIH_002 | Order List / Checkout* | E02 | E02 (es-kitchen-web-company) | List | Checkout tin cậy hơn sau khi có unit test T1 và transaction D2 |
| AW_APIH_001 | System Admin Login* | E03 | E03 (es-kitchen-web-admin) | Form | Rate limiting S2 áp dụng cho admin login endpoint |
| AW_APIH_002 | Sales Analytics / Report* | E03 | E03 (es-kitchen-web-admin) | Report | SQL injection trong orderBy được đóng S3; báo cáo thời gian đúng timezone sau D1 |
| AW_APIH_003 | Admin Dashboard* | E03 | E03 (es-kitchen-web-admin) | Dashboard | Dashboard không còn gây full-table scan P2; load nhanh hơn |
| SW_APIH_001 | Menu Management (Supplier)* | E04 | E04 (es-kitchen-web-supplier) | List | Cache invalidation P3 đảm bảo menu update phản ánh ngay sau khi supplier lưu |

*inferred — không có màn hình mới, chỉ là màn hình hiện có nhận lợi ích từ hardening backend.

---

## Bước tiếp theo

→ "Hãy là Tech Lead Design, tạo DESIGN.md từ SPEC này: es-kitchen-docs/docs/features/api-hardening/SPEC.md"
  (hoặc slash command: /create-design es-kitchen-docs/docs/features/api-hardening/SPEC.md)
→ "Hãy là Designer, tạo UI-SPEC.md + Figma từ SPEC này: es-kitchen-docs/docs/features/api-hardening/SPEC.md"
  (hoặc slash command: /create-ui-design es-kitchen-docs/docs/features/api-hardening/SPEC.md)
