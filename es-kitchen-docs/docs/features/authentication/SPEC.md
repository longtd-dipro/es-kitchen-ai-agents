# SPEC: Authentication (Supplier · Outsource · Driver)

> **Loại:** Cross-repo (3 actor, 3 frontend repo + 1 API)
> **Repos liên quan:** `es-kitchen-api` · `es-kitchen-web-supplier` (E04) · `es-kitchen-web-outsource-web-private` (E05 — Contract Delivery / Outsource) · `es-kitchen-webapp-driver` (E06)
> **Actor chính:** Supplier (E04), Outsource/Contract Delivery (E05), Driver (E06)
> **Ngày:** 2026-06-02
> **Status:** Draft — có Open Questions cần confirm
> **Source:** `es-kitchen-requirements/authen/requirement.md`
> **Liên quan:** SPEC `admin-account-management` (System Admin tạo account cho Supplier + Outsource), feature `driver-authentication` (folder đã có DESIGN)

---

## 1. Mô tả nghiệp vụ

Hệ thống cần cơ chế authentication chuẩn cho 3 actor non-end-user: **Supplier** (E04), **Outsource / Contract Delivery** (E05) và **Driver** (E06). Cả 3 actor đều **không tự đăng ký** — tài khoản được khởi tạo bởi cấp trên (System Admin tạo cho Supplier/Outsource, Outsource tạo cho Driver).

Mục tiêu: 4 chức năng auth thống nhất giữa 3 actor — Login, Logout, Forgot Password, Change Password — với cùng UX/API contract, khác biệt chỉ ở **scope role** và **endpoint** mỗi web.

---

## 2. Actors & Preconditions

| Actor | Repo / Web | Account tạo bởi | Precondition |
|---|---|---|---|
| Supplier (E04) | `es-kitchen-web-supplier` | System Admin (E03) qua `admin-account-management` | Đã được Admin tạo account, có ID + password ban đầu |
| Outsource / Contract Delivery (E05) | `es-kitchen-web-outsource-web-private` | System Admin (E03) qua `admin-account-management` | Đã được Admin tạo account |
| Driver (E06) | `es-kitchen-webapp-driver` (ReactJS mobile web — không phải native) | Outsource (E05) qua Outsource web | Đã được Outsource tạo account |

> **Lưu ý:** End User (E01 Mobile) và Company Admin (E02) auth không nằm trong SPEC này — có flow riêng (E01 dùng đăng ký + social login; E02 thuộc admin-account-management khác).

---

## 3. Happy Path — Login

1. Actor mở URL của web tương ứng (Supplier/Outsource/Driver)
2. Hệ thống hiển thị form Login: ID + Password
3. Actor nhập ID + Password → click "Login"
4. API verify credentials → trả về JWT token (access + refresh)
5. Web lưu token (HTTP-only cookie hoặc localStorage — *OQ-1*) → redirect dashboard

## 4. Happy Path — Logout

1. Actor click nút Logout (header/menu)
2. Web gọi API logout (invalidate refresh token nếu có) → xóa token client
3. Redirect về Login page

## 5. Happy Path — Forgot Password

1. Tại Login page, actor click "Forgot password?"
2. Hệ thống hiển thị form nhập **ID hoặc email** *(OQ-2)*
3. Actor nhập → submit
4. API gửi **email reset password** chứa link một lần dùng *(OQ-3: link expiry, format)*
5. Actor mở email → click link → màn hình "Set new password"
6. Nhập password mới + confirm → submit → thành công → redirect Login

## 6. Happy Path — Change Password (sau login)

1. Actor vào trang Profile / Settings (có quyền change password)
2. Form: Current Password + New Password + Confirm New Password
3. Submit → API verify current → update → thành công thông báo, có thể yêu cầu re-login *(OQ-4)*

---

## 7. Alternative Flows & Edge Cases

| Tình huống | Xử lý |
|---|---|
| Login sai password nhiều lần liên tiếp | *OQ-5: lock account sau N lần? CAPTCHA?* |
| Account bị Disabled (Admin disable) | Login fail với message rõ "Account disabled, contact administrator" |
| Account bị Delete (logical) | Login fail như "Invalid credentials" — không tiết lộ account tồn tại |
| Reset link đã dùng / hết hạn | Hiển thị "Link đã hết hạn, vui lòng request lại" |
| Reset link bị mở trong khi đã login session khác | Force logout session cũ rồi cho set password mới *(OQ-6)* |
| Driver app (E06) — token expire khi đang giao | *OQ-7: behavior — silent refresh? force re-login?* |
| First login sau khi Admin tạo account | *OQ-8: bắt buộc đổi password lần đầu không?* |

---

## 8. Acceptance Criteria

| # | Criteria |
|---|---|
| AC-01 | Supplier (E04) có thể login bằng ID + password được System Admin cấp |
| AC-02 | Outsource (E05) có thể login bằng ID + password được System Admin cấp |
| AC-03 | Driver (E06) có thể login bằng ID + password được Outsource cấp |
| AC-04 | Tất cả 3 actor có chức năng Logout — xóa token client, không thể dùng token cũ |
| AC-05 | Tất cả 3 actor có chức năng Forgot Password qua email reset link |
| AC-06 | Tất cả 3 actor có chức năng Change Password sau khi đã login |
| AC-07 | Reset link chỉ dùng được 1 lần, hết hạn sau thời gian quy định |
| AC-08 | API auth dùng JWT (access + refresh) đúng spec NestJS chuẩn ESKITCHEN |
| AC-09 | Account bị Disabled / Deleted không login được |
| AC-10 | Password validation: theo policy thống nhất *(OQ-9)* |

---

## 9. Open Questions — Cần confirm

| # | Câu hỏi | Tầm quan trọng | Ảnh hưởng |
|---|---|---|---|
| OQ-1 | Token storage: HTTP-only cookie hay localStorage? (security vs cross-domain) | 🔴 Critical | Auth strategy, XSS exposure |
| OQ-2 | Forgot Password form nhập gì: ID hay email hay cả hai? | 🟡 High | Form design + lookup logic |
| OQ-3 | Reset link expiry: bao lâu? Format URL? Token 1 lần dùng? | 🟡 High | Security + email template |
| OQ-4 | Change Password thành công có force re-login không? | 🟠 Medium | UX flow |
| OQ-5 | Lock account sau N lần login fail? CAPTCHA? Rate limit IP? | 🔴 Critical | Security policy |
| OQ-6 | Reset link mở khi đang login khác — xử lý thế nào? | 🟠 Medium | Session management |
| OQ-7 | Driver app — JWT expire khi đang giao hàng: silent refresh / force re-login? | 🟡 High | Driver UX, không gián đoạn giao hàng |
| OQ-8 | First login: có bắt buộc đổi password lần đầu không? | 🟠 Medium | Security + onboarding |
| OQ-9 | Password policy: min length, complexity (uppercase/number/special), reuse cũ không? | 🔴 Critical | Validation rules cho cả 3 actor |
| OQ-10 | Email reset gửi qua provider nào (AWS SES đang dùng)? | 🟠 Medium | Email template + infra |
| OQ-11 | "Outsource Web" trong requirement = repo `es-kitchen-web-outsource-web-private` (E05 Contract Delivery)? Confirm tên epic. | 🟡 High | Repo mapping |
| OQ-12 | Có 2FA / OTP không (liên quan SPEC `ip-whitelist`)? | 🔴 Critical | Auth flow, cần integrate với IP whitelist |

---

## 10. Out of Scope

- End User (E01 mobile) authentication — flow riêng
- Company Admin (E02) authentication — flow riêng
- Social login (Google/Apple/LINE) — không trong scope 3 actor này
- Self-registration — tất cả account đều do cấp trên tạo
- SSO với hệ thống ngoài
- Password recovery qua SMS — chỉ qua email

---

## Screens

| Screen Code | Screen | Actor | App | Screen Type | Mô tả ngắn |
|---|---|---|---|---|---|
| SW_AUTH_001 | Login | Supplier | E04 (es-kitchen-web-supplier) | Form | Form nhập ID + Password; submit để lấy JWT và redirect dashboard |
| OW_AUTH_001 | Login | Outsource | E05 (es-kitchen-web-outsource-web-private) | Form | Form nhập ID + Password; submit để lấy JWT và redirect dashboard |
| DA_AUTH_001 | Login | Driver | E06 (es-kitchen-webapp-driver) | Form | Form nhập ID + Password trên mobile web; submit để lấy JWT và redirect dashboard |
| SW_AUTH_002 | Forgot Password | Supplier | E04 (es-kitchen-web-supplier) | Form | Form nhập ID hoặc email để request email reset password |
| OW_AUTH_002 | Forgot Password | Outsource | E05 (es-kitchen-web-outsource-web-private) | Form | Form nhập ID hoặc email để request email reset password |
| DA_AUTH_002 | Forgot Password | Driver | E06 (es-kitchen-webapp-driver) | Form | Form nhập ID hoặc email để request email reset password trên mobile web |
| SW_AUTH_003 | Reset Password (via email link) * inferred | Supplier | E04 (es-kitchen-web-supplier) | Form | Màn hình set password mới sau khi click link từ email; nhập New Password + Confirm |
| OW_AUTH_003 | Reset Password (via email link) * inferred | Outsource | E05 (es-kitchen-web-outsource-web-private) | Form | Màn hình set password mới sau khi click link từ email; nhập New Password + Confirm |
| DA_AUTH_003 | Reset Password (via email link) * inferred | Driver | E06 (es-kitchen-webapp-driver) | Form | Màn hình set password mới trên mobile web sau khi click link từ email |
| SW_AUTH_004 | Change Password | Supplier | E04 (es-kitchen-web-supplier) | Form | Form đổi mật khẩu sau login: Current Password + New Password + Confirm; nằm trong Profile/Settings |
| OW_AUTH_004 | Change Password | Outsource | E05 (es-kitchen-web-outsource-web-private) | Form | Form đổi mật khẩu sau login: Current Password + New Password + Confirm; nằm trong Profile/Settings |
| DA_AUTH_004 | Change Password | Driver | E06 (es-kitchen-webapp-driver) | Form | Form đổi mật khẩu sau login trên mobile web; nằm trong Profile/Settings |

---

## Bước tiếp theo

→ "Hãy là Designer, tạo UI-SPEC.md + Figma từ SPEC này: es-kitchen-docs/docs/features/authentication/SPEC.md"
  (hoặc slash command: /create-ui-design es-kitchen-docs/docs/features/authentication/SPEC.md)
