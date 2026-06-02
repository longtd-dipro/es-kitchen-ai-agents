# DESIGN: IP Whitelist & 2FA — es-kitchen-api

> **SPEC:** `es-kitchen-docs/docs/features/ip-whitelist/SPEC.md`
> **Liên quan:** `admin-account-management/es-kitchen-api/DESIGN.md` (đã đề cập `admin_ip_whitelist`)
> **Date:** 2026-06-02
> **Status:** Draft — phụ thuộc OQ-3 (OTP channel), OQ-5 (IP source), OQ-1 (scope)

---

## 0. Phân tích trạng thái hiện tại

| Artifact | File | Note |
|---|---|---|
| `AdminGuard` | `src/modules/admin/guards/admin.guard.ts` | Chỉ check JWT, không check IP |
| `AuthService.login` | `src/modules/admin/services/auth.service.ts` | Trả JWT ngay, không có bước OTP |
| Mail infra | `src/commons/utiliz/mail/mail.module.ts` | Đã có (SES) — dùng cho gửi OTP qua email |
| `admin_ip_whitelist` table | — | Chưa có |
| `admin_otp_codes` table | — | Chưa có |

---

## 1. Tổng quan thay đổi

| Layer | File | Action |
|---|---|---|
| Migration | `<ts>-create-admin-ip-whitelist.ts` | NEW |
| Migration | `<ts>-create-admin-otp-codes.ts` | NEW |
| Entity | `admin-ip-whitelist.entity.ts` | NEW |
| Entity | `admin-otp-code.entity.ts` | NEW |
| Service | `IpWhitelistService` | NEW |
| Service | `OtpService` | NEW |
| Service | `AuthService` (existing) | EDIT — login flow 2 bước khi IP ngoài whitelist |
| Controller | `IpWhitelistController` (Admin CRUD) | NEW |
| Controller | `AuthController` (existing) | EDIT — thêm endpoint verify-otp |
| Middleware | `IpExtractorMiddleware` (parse X-Forwarded-For) | NEW |
| Cache | Redis `admin:whitelist:active` | NEW |

---

## 2. Database Changes

### 2.1 `admin_ip_whitelist`

```
PK: bigint id
Cols:
  ip_address     varchar(45)            -- IPv4 max 15, IPv6 max 39, CIDR thêm
  is_cidr        boolean DEFAULT false  -- TRUE nếu range (OQ-2)
  cidr_prefix    int2 NULL              -- nếu is_cidr, vd 24
  description    varchar(255) NULL
  is_enabled     boolean DEFAULT true
  is_master      boolean DEFAULT false  -- master IP không xóa được (OQ-8)
  created_by     bigint FK admins.id
  created_at, updated_at, deleted_at (soft)
Index:
  idx_admin_ip_whitelist_enabled (is_enabled) WHERE deleted_at IS NULL
```

### 2.2 `admin_otp_codes`

```
PK: bigint id
Cols:
  admin_id       bigint FK admins.id
  code_hash      varchar(255)            -- bcrypt hash, không lưu raw
  channel        varchar(20)             -- email/sms/totp (OQ-3)
  sent_to        varchar(255)            -- email hoặc phone (lưu hash hoặc masked)
  expires_at     timestamptz
  used_at        timestamptz NULL
  attempts       int2 DEFAULT 0
  ip_origin      varchar(45)             -- IP request (audit)
  created_at     timestamptz
Index:
  idx_admin_otp_codes_admin_active (admin_id, expires_at) WHERE used_at IS NULL
```

> Default channel Phase 1: **email** (đã có SES). TOTP/SMS để OQ-3 chốt.

### 2.3 Redis Cache

| Key | Value | TTL |
|---|---|---|
| `admin:whitelist:active` | Array `{ip, isCidr, cidrPrefix}` enabled | 60s |
| `admin:otp:fails:<adminId>` | Count fail attempts | 15 phút |

---

## 3. API Contract

### 3.1 Admin manage whitelist

| Method | Path | Permission |
|---|---|---|
| GET | `/admin/ip-whitelist` | `security.ip.view` |
| POST | `/admin/ip-whitelist` | `security.ip.manage` |
| PUT | `/admin/ip-whitelist/:id` | `security.ip.manage` |
| DELETE | `/admin/ip-whitelist/:id` | `security.ip.manage` |

DTO `CreateIpWhitelistDto { ipAddress, isCidr?, cidrPrefix?, description? }` — validate IPv4/IPv6/CIDR format.

### 3.2 Auth flow updates

| Method | Path | Mô tả |
|---|---|---|
| POST | `/admin/auth/login` | Sửa: nếu IP ngoài whitelist → trả `{ requireOtp: true, otpToken: <session-jwt-short> }`. Nếu trong → JWT đầy đủ luôn |
| POST | `/admin/auth/verify-otp` | Body `{ otpToken, code }` → verify → trả JWT đầy đủ |
| POST | `/admin/auth/resend-otp` | Body `{ otpToken }` → resend (rate-limited) |

`otpToken` = short-lived JWT (5 phút) chỉ chứa `adminId` + `purpose: 'otp-pending'`.

---

## 4. Service Layer

### 4.1 `IpWhitelistService`

```typescript
isWhitelistEmpty(): Promise<boolean>    // nếu rỗng → bypass OTP (default state)
matchIp(ip: string): Promise<boolean>   // dùng Redis cache, CIDR matching qua `ip-range-check` lib
addIp(dto, actorId)
removeIp(id, actorId)                   // block nếu isMaster=true
```

### 4.2 `OtpService`

```typescript
generateAndSend(adminId, channel, ipOrigin)
  // 1. Generate code 6 digits
  // 2. Hash + insert admin_otp_codes (expires 5 phút — OQ-4)
  // 3. Send qua channel (Phase 1: email via SES)
  // 4. Return otpToken (JWT 5 phút)

verify(adminId, code, ipOrigin)
  // 1. Find active otp_code → match hash
  // 2. Increment attempts; nếu >5 → invalidate (OQ-7)
  // 3. Mark used_at
  // 4. Log audit
  // 5. Return true/false
```

### 4.3 `AuthService` flow update

```typescript
async login(dto, request) {
  const admin = await this.validateCredentials(dto);
  const ip = request.extractedIp;  // từ middleware

  const empty = await this.ipWhitelist.isWhitelistEmpty();
  const match = empty ? true : await this.ipWhitelist.matchIp(ip);

  if (match) {
    return this.issueFullJwt(admin);
  } else {
    const otpToken = await this.otp.generateAndSend(admin.id, 'email', ip);
    return { requireOtp: true, otpToken };
  }
}

async verifyOtpAndLogin(otpToken, code, request) {
  const { adminId } = this.jwt.verify(otpToken);
  const ok = await this.otp.verify(adminId, code, request.extractedIp);
  if (!ok) throw new UnauthorizedException();
  const admin = await this.adminRepo.findOne({ where: { id: adminId } });
  return this.issueFullJwt(admin);
}
```

### 4.4 `IpExtractorMiddleware`

```typescript
// Lấy IP đúng nguồn (OQ-5):
// Phase 1 đề xuất: TRUST_PROXY = true (sau ALB), đọc X-Forwarded-For[0]
// Cấu hình qua AWS Parameter Store: TRUSTED_PROXY_LIST
```

---

## 5. Interface với repo khác

| Repo | Cần gì |
|---|---|
| `es-kitchen-web-admin` | UI manage whitelist + login form 2 bước (nhận `requireOtp` → show OTP screen) |
| Các web khác (OQ-1) | Nếu áp dụng → cần update auth flow tương tự |

---

## 6. Luồng login với IP ngoài whitelist

```
1. POST /admin/auth/login { username, password }
2. AuthService.login():
   a. Verify credentials
   b. Get ip from middleware
   c. IpWhitelistService.matchIp(ip) → false
   d. OtpService.generateAndSend(adminId, 'email', ip)
   e. Trả { requireOtp: true, otpToken }
3. FE: hiển thị OTP screen
4. POST /admin/auth/verify-otp { otpToken, code: "123456" }
5. AuthService.verifyOtpAndLogin():
   a. Verify otpToken JWT (chưa expire)
   b. OtpService.verify(adminId, code, ip)
   c. Issue full JWT
6. FE: login thành công
```

---

## 7. Non-Regression Risks

| Tính năng hiện có | File | Rủi ro | Mitigation |
|---|---|---|---|
| `AuthService.login` hiện trả JWT ngay | `auth.service.ts` | Response shape thay đổi (có thể là JWT hoặc requireOtp object) | FE phải handle union response — coordinate với FE team trước khi deploy |
| Refresh token flow | `auth.service.ts` `refresh()` | OTP chỉ áp khi login mới, refresh không yêu cầu OTP | Confirm chính sách: refresh check IP lại? (OQ-9, OQ-10) |
| Test e2e login | (cần grep) | Tests cũ break vì response shape mới | Update test với 2 paths: whitelist=empty → JWT, whitelist=active → otp flow |
| App đang chạy production có user đang dùng | Operation | Bật whitelist đầu tiên → tất cả user phải qua OTP | Phase rollout: setup whitelist với IP công ty trước, document trước cho admin |

> **BẮT BUỘC `tilth_deps` trên `auth.service.ts` và `admin.guard.ts`.**
