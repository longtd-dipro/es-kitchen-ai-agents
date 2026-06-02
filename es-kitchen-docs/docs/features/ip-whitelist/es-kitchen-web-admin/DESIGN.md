# DESIGN: IP Whitelist & 2FA — es-kitchen-web-admin

> **SPEC:** `es-kitchen-docs/docs/features/ip-whitelist/SPEC.md`
> **API DESIGN:** `../es-kitchen-api/DESIGN.md`
> **Date:** 2026-06-02

---

## 1. Tổng quan thay đổi

| Layer | File | Action |
|---|---|---|
| Page | `src/pages/system/security/IpWhitelistPage.tsx` | NEW |
| Component | `src/components/security/IpForm.tsx` (modal) | NEW |
| Component | `src/components/auth/OtpVerifyForm.tsx` | NEW |
| Page | `src/pages/auth/LoginPage.tsx` | EDIT — handle `requireOtp` response |
| Service | `src/services/ip-whitelist.service.ts` | NEW |
| Service | `src/services/auth.service.ts` | EDIT — thêm `verifyOtp`, `resendOtp` |
| Store | `src/store/slices/authSlice.ts` | EDIT — state `otpPending`, `otpToken` |
| Route | `/system/security/ip-whitelist` | NEW |

---

## 2. UI Flow — Login khi IP ngoài whitelist

```
LoginPage
  ↓ submit username + password
authService.login(credentials)
  ↓ response { requireOtp: true, otpToken } OR { accessToken, refreshToken }
  ├─ requireOtp → dispatch(setOtpPending(otpToken)) → navigate /auth/verify-otp
  └─ accessToken → dispatch(setSession(...)) → navigate /dashboard

OtpVerifyForm
  ↓ user nhập 6 digits
authService.verifyOtp({ otpToken, code })
  ↓ response { accessToken, refreshToken }
  → dispatch(setSession) → navigate /dashboard

Resend button (cooldown 60s — đồng bộ OQ-4)
```

---

## 3. Components chính

### 3.1 `IpWhitelistPage`

- AntD Table columns:
  | IP / CIDR | Description | Enabled | Master | Created at | Created by | Action |
- Filter: enabled status
- Action: Add (modal `IpForm`), Edit, Delete (disable nếu `isMaster`)
- Delete có popup warning đặc biệt — cảnh báo "Bạn có thể tự khóa mình ra ngoài" nếu IP đó match IP hiện tại của Admin

### 3.2 `IpForm` (modal)

- Form react-hook-form + yup:
  - `ipAddress`: required, validate regex IPv4/IPv6/CIDR (tham khảo lib `ip-cidr`)
  - `isCidr`: toggle — show `cidrPrefix` input khi true
  - `description`: optional
  - `isEnabled`: default true
- Inline validation
- Submit → POST/PUT → revalidate query

### 3.3 `OtpVerifyForm`

- 6 input boxes (auto-focus next), hoặc 1 input mask `______`
- Countdown timer (5 phút — đồng bộ OQ-4 backend)
- Resend button — disabled trong 60s
- Submit → call `verifyOtp` → handle success/fail

---

## 4. State Management

```typescript
// authSlice (existing — extend)
interface AuthState {
  ...,
  otpPending: boolean,
  otpToken: string | null,
  otpExpiresAt: number | null,
}
```

OTP attempt tracking client-side (UI hint) — server vẫn là source of truth.

---

## 5. Routing

```typescript
{ path: '/auth/login', element: <LoginPage /> },
{ path: '/auth/verify-otp', element: <RequireOtpPending><OtpVerifyForm /></RequireOtpPending> },  // guard nếu otpPending=false → redirect login

{
  path: '/system/security/ip-whitelist',
  element: <RequirePermission code="security.ip.view"><IpWhitelistPage /></RequirePermission>
}
```

---

## 6. Interface với repo khác

| Repo | Endpoint gọi |
|---|---|
| `es-kitchen-api` | `GET/POST/PUT/DELETE /admin/ip-whitelist`, `POST /admin/auth/login` (response union), `POST /admin/auth/verify-otp`, `POST /admin/auth/resend-otp` |

---

## 7. Non-Regression Risks

| Tính năng hiện có | File | Rủi ro | Mitigation |
|---|---|---|---|
| `LoginPage` redirect dashboard ngay sau login | `src/pages/auth/LoginPage.tsx` | Cần check `requireOtp` trước khi redirect | Refactor login submit handler, test cả 2 path |
| `authSlice` state | `src/store/slices/authSlice.ts` | Thêm field mới phải không break selector hiện tại | Backward-compatible, default values |
| Auto-refresh token interceptor | (cần grep) | OTP flow không refresh khi token chưa issued | Logic refresh chỉ activate khi đã có accessToken thật |
