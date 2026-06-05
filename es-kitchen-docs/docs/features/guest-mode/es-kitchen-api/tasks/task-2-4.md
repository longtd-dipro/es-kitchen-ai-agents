# [BE] Payment_App_Mobile — Contract Lock Review (BE sign-off trước Phase 3)

## Backlog Info
- **Issue Type:** Task
- **Category:** Payment_App_Mobile
- **Parent Issue:** Guest Mode — Phase 2 Implementation
- **Version:** Phase 2
- **Milestone:** Released xxx
- **Estimate Hour:** 2h
- **Actual Hour:** — _(điền khi Resolved)_
- **Status:** Open

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 2 — Contract Lock (Gate trước Phase 3) |
| Repo | `es-kitchen-api` |
| Depends on | task-2-1, task-2-2, task-2-3 |
| Song song với | none — BLOCKING task-3-x cho tất cả repo |
| Estimate | ~2h |

## Mục tiêu

Task này là **gate review** do Tech Lead / PM chạy — xác nhận API contract đầy đủ và đúng trước khi unblock Phase 3 (Mobile + Admin FE implement). Không có code mới, chỉ verify và document sign-off.

**Phase 3 KHÔNG được bắt đầu cho đến khi task này được chuyển sang Resolved.**

## Context (đọc trước khi review)

- DESIGN.md: `es-kitchen-docs/docs/features/guest-mode/es-kitchen-api/DESIGN.md` (section 3 — API Contract, section 5 — Interface với repo khác)
- DESIGN Mobile: `es-kitchen-docs/docs/features/guest-mode/es-kitchen-payment-app/DESIGN.md` (section 8 — Contract Lock items)
- DESIGN Admin: `es-kitchen-docs/docs/features/guest-mode/es-kitchen-web-admin/DESIGN.md` (section 7)

## Checklist Contract Lock

### Endpoint 1: POST /auth/user/guest-login

- [ ] **Public** (không cần auth) — verify trong Swagger UI không có lock icon
- [ ] **Request:** Không có body
- [ ] **Response 201:**
  ```json
  { "accessToken": "eyJ...", "refreshToken": "eyJ..." }
  ```
- [ ] **Response 500:** `{ "message": "ゲストアカウントの作成に失敗しました" }`
- [ ] Gọi thực từ Postman/curl → trả về 2 token hợp lệ (JWT decode được)
- [ ] Token type: same format với login thường → Mobile có thể tái dùng cùng logic lưu token

### Endpoint 2: POST /auth/user/link-email

- [ ] **Auth required:** Bearer token
- [ ] **Request body:** `{ "email": "user@example.com" }` — `@IsEmail()` validation
- [ ] **Response 200:** `{ "message": "OTPを送信しました" }`
- [ ] **Error 400:** Email format sai → `{ "message": "メールアドレスの形式が正しくありません" }`
- [ ] **Error 400:** Email tồn tại (full account) → `{ "message": "このメールアドレスは既に使用されています" }` — KHÔNG gửi OTP (BR-11)
- [ ] **Error 403:** User không phải guest → `403 Forbidden`
- [ ] **Error 429:** Rate limit < 60s → `429`
- [ ] Test với guest token thực → OTP email nhận được

### Endpoint 3: POST /auth/user/link-email/verify

- [ ] **Auth required:** Bearer token (guest)
- [ ] **Request body:** `{ "email": "...", "otp": "1234", "password": "..." }`
- [ ] **OTP format:** 4 chữ số (`@Length(4,4)` + `@Matches(/^\d{4}$/)`)
- [ ] **Password:** `@MinLength(8)`
- [ ] **Response 200:** `{ "accessToken": "...", "refreshToken": "..." }` — token mới (account upgraded)
- [ ] **Error 400:** OTP sai → `{ "message": "認証コードが正しくありません" }`
- [ ] **Error 400:** OTP expired → `{ "message": "コードの有効期限が切れました" }`
- [ ] **Error 403:** User không phải guest → `403`
- [ ] Sau verify thành công: DB `user_type = 'registered'`, Cognito user tồn tại
- [ ] Order history giữ nguyên (cùng `userId`) — AC-04-8

### Endpoint 4: GET /user/orders/validate-company (modified)

- [ ] **Auth required:** Bearer token
- [ ] **Response thêm field `guestPaymentAllowed: boolean`** — luôn có trong response dù user là guest hay registered
- [ ] **Với guest + `guestPaymentAllowed=false`:** `{ "valid": false, "guestPaymentAllowed": false, "reason": "この会社はゲストの支払いを許可していません" }`
- [ ] **Với guest + `guestPaymentAllowed=true`:** `{ "valid": true, "guestPaymentAllowed": true }`
- [ ] **Với registered user + `guestPaymentAllowed=false`:** `{ "valid": true, "guestPaymentAllowed": false }` — registered không bị chặn (non-regression test)
- [ ] **`companyId` không tồn tại:** vẫn trả về `valid: false` như cũ

### Endpoint 5: PATCH /companies/:id/basic-info (modified — Admin)

- [ ] **Request body thêm optional:** `"guestPaymentAllowed": boolean`
- [ ] **Response thêm field:** `"guestPaymentAllowed": boolean` trong `data`
- [ ] **Default:** Company cũ không có field → response trả về `true` (BR-05)
- [ ] **Không gửi field trong PATCH:** DB giữ nguyên giá trị cũ

### GET /user/me — Confirm field userType

- [ ] **OPEN QUESTION từ DESIGN Mobile OQ-1:** Response của `GET /user/me` có trả về `userType` không?
- [ ] Nếu chưa → BE cần thêm field này vào response (Mobile cần `userType` ngay sau `guestLogin()`)
- [ ] Tìm file: `src/modules/user/http/controllers/user.controller.ts` → method `me()` → check response DTO
- [ ] **Action:** Nếu thiếu → tạo sub-task thêm `userType` vào `/user/me` response trước khi close task này

## Sign-off Record

| Người review | Role | Ngày | Status |
|---|---|---|---|
| — | Tech Lead (BE) | — | Pending |
| — | Tech Lead (Mobile) | — | Pending |
| — | Tech Lead (FE Admin) | — | Pending |
| — | PM | — | Pending |

**Tất cả 4 người phải sign-off → chuyển sang Resolved → unblock Phase 3.**

## Definition of Done

- [ ] Tất cả 5 endpoint verify đầy đủ với Postman/curl trên môi trường DEV
- [ ] `GET /user/me` response confirm có `userType` field (hoặc sub-task được tạo)
- [ ] Sign-off record điền đủ 4 người
- [ ] Không còn Open Question nào liên quan API contract
- [ ] Status → Request Review → Resolved (sau khi đủ 4 sign-off)
- [ ] Phase 3 tasks được chuyển sang In Progress sau task này Resolved
