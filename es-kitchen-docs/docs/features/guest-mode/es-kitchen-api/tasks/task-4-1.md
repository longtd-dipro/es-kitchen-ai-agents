# [BE] Payment_App_Mobile — Integration Test: Guest Mode End-to-End Verification

## Backlog Info
- **Issue Type:** Task
- **Category:** Payment_App_Mobile
- **Parent Issue:** Guest Mode — Phase 2 Implementation
- **Version:** Phase 2
- **Milestone:** Released xxx
- **Estimate Hour:** 4h
- **Actual Hour:** — _(điền khi Resolved)_
- **Status:** Open

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 4 — Integration Test |
| Repo | `es-kitchen-api` + `es-kitchen-payment-app` + `es-kitchen-web-admin` |
| Depends on | task-3-1, task-3-2, task-3-3, task-3-4 (tất cả Phase 3 task done) |
| Song song với | none |
| Estimate | ~4h |

## Mục tiêu

Verify toàn bộ Guest Mode flow hoạt động đúng end-to-end trên môi trường DEV với tất cả repo đã deploy. Task này do QA Engineer thực hiện theo checklist — không viết code mới.

## Môi trường

- Backend: DEV API với migration đã chạy
- Mobile: Flutter app build DEV (`flutter run --flavor dev`)
- Admin Web: `es-kitchen-web-admin` build DEV

## Flow 1: Guest Login cơ bản (US-01)

| # | Bước | Expected | Status |
|---|---|---|---|
| 1 | Mở app → Login screen | Button "ゲストとして利用する" hiển thị, phân biệt với button Login | — |
| 2 | Bấm button Guest Mode | Spinner → navigate vào app shell trong ≤ 3s (AC-01-2) | — |
| 3 | Kiểm tra DB | Record mới trong `users` table: `user_type = 'guest'`, `email = guest_xxx@eskitchen.local`, `password = NULL` | — |
| 4 | Kiểm tra token | Token hợp lệ (decode JWT được, `id` và `email` có trong payload) | — |
| 5 | Tắt app → mở lại | App tái dùng session cũ, không tạo guest mới (AC-01-5) | — |
| 6 | Uninstall + install lại | Bấm Guest Mode → guest MỚI được tạo (AC-01-6) | — |

## Flow 2: UI Restrictions cho Guest (US-02)

| # | Bước | Expected | Status |
|---|---|---|---|
| 1 | Mở UserPage với guest session | "プロフィール", "支払い方法", "ログアウト", "アカウント削除" KHÔNG hiển thị | — |
| 2 | "メールアドレスを連携する" | Hiển thị trong UserPage (AC-02-1) | — |
| 3 | Tab Favorites | Hiển thị placeholder "登録が必要です" (không crash, không show content) | — |
| 4 | Tab Notifications | Hiển thị placeholder "登録が必要です" | — |
| 5 | Browse menu, add to cart | Hoạt động bình thường (AC-02-3) | — |
| 6 | Truy cập URL profile trực tiếp | Redirect về màn chính hoặc inline placeholder (AC-02-2) | — |

## Flow 3: Thanh toán Guest (US-03)

| # | Bước | Expected | Status |
|---|---|---|---|
| 1 | Add item to cart → Checkout | Bước nhập Company ID xuất hiện (AC-03-0) | — |
| 2 | Company ID không tồn tại | Error: "会社IDが見つかりません" (AC-03-2) | — |
| 3 | Company có `guestPaymentAllowed = false` | Block hoàn toàn với message rõ ràng, CTA "アカウントを作成する" (AC-03-3) | — |
| 4 | Company có `guestPaymentAllowed = true` | Tiếp tục checkout, không có option tiền mặt (AC-03-1, AC-03-4) | — |
| 5 | Admin tắt `guestPaymentAllowed` giữa checkout | Lần gọi API checkout tiếp theo trả về lỗi phù hợp (AC-03-5) | — |

**Setup cho Flow 3:**
- Cần 1 company có `guest_payment_allowed = true` và 1 company có `guest_payment_allowed = false` trong DEV DB

## Flow 4: Upgrade Guest → Full Account (US-04)

| # | Bước | Expected | Status |
|---|---|---|---|
| 1 | Bấm "メールアドレスを連携する" → nhập email mới | OTP gửi tới email trong ≤ 60s (AC-04-2) | — |
| 2 | Email đã tồn tại (full account) | Error message rõ ràng, không gửi OTP, không merge data (AC-04-5) | — |
| 3 | Nhập OTP đúng → màn set password | Navigate sang set password screen | — |
| 4 | Nhập OTP sai | Error, có thể nhập lại (không bị block) | — |
| 5 | OTP expire (chờ > 5 phút) | Message "コードの有効期限が切れました" + Resend button | — |
| 6 | Resend button trong 60s | Disabled (rate limit) | — |
| 7 | Resend button sau 60s | Active, gọi lại API | — |
| 8 | Set password → Confirm | Account upgraded: `user_type = 'registered'` trong DB | — |
| 9 | Sau upgrade — session vẫn active | Không bị logout, token vẫn valid (AC-04-4) | — |
| 10 | Sau upgrade — tính năng restricted | "プロフィール", "支払い方法", "ログアウト" trở nên accessible ngay (AC-04-3) | — |
| 11 | Cognito user | Sau upgrade: Cognito user tồn tại với email mới | — |

## Flow 5: Order History Guest (US-05)

| # | Bước | Expected | Status |
|---|---|---|---|
| 1 | Guest đặt hàng → xem Order History | Hiển thị orders của session guest hiện tại (AC-05-1) | — |
| 2 | Uninstall + install (guest mới) → xem History | Rỗng — không recover history cũ (AC-05-3) | — |
| 3 | Upgrade → xem Order History | Order history từ guest session giữ nguyên (AC-05-4) | — |

## Flow 6: Admin Toggle (US-06)

| # | Bước | Expected | Status |
|---|---|---|---|
| 1 | Admin login → vào Company Detail | Toggle "ゲスト支払いを許可する" hiển thị trong form Edit Company | — |
| 2 | Default value | Toggle = ON cho company mới hoặc chưa có field (AC-06-2) | — |
| 3 | Admin bật/tắt → Save | API cập nhật `guest_payment_allowed` trong DB (AC-06-3) | — |
| 4 | Verify cross-repo | Mobile guest checkout lần tiếp theo reflect đúng giá trị mới (AC-06-4) | — |

## Non-Regression Checks

| Tính năng | Cách verify |
|---|---|
| Login thường (email + password) | Login với account thường → vào app bình thường |
| Register flow | Đăng ký user mới → OTP → tạo account thành công |
| Forgot Password | Reset password với account thường → hoạt động bình thường |
| Admin getBasicInfo | Các field khác của company không bị ảnh hưởng (name, isCashPaymentAllowed, etc.) |
| validateCompanyCode — registered user | Registered user với company có `guestPaymentAllowed = false` → vẫn checkout được |

## Bug Report

Nếu có lỗi → tạo Bug issue trong Backlog với:
- Parent Issue: Guest Mode
- Severity: Critical / Major / Minor
- Steps to reproduce (Postman/UI)
- Expected vs Actual
- Link task liên quan

## Definition of Done

- [ ] Tất cả checklist Flow 1-6 pass (ghi kết quả vào bảng trên)
- [ ] Non-Regression checks pass
- [ ] Không có Bug severity Critical hoặc Major còn mở
- [ ] QA sign-off bằng cách chuyển task này → Resolved
- [ ] Bug reports (nếu có Minor) đã được tạo với đủ thông tin
- [ ] Actual Hour cập nhật
