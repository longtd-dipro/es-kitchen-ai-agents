# [FE] [Delivery_Web] — Reset mật khẩu: đếm ngược gửi lại mã + rule mật khẩu

## Backlog Info
- **Issue Type:** Task · **Category:** Delivery_Web
- **Parent Issue:** Delivery Partner P2 — Auth
- **Version:** _TBD_ · **Milestone:** _TBD_
- **Estimate Hour:** 4h · **Actual Hour:** — · **Status:** Open

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 3 — Frontend |
| Repo | `es-kitchen-web-outsource-web-private` |
| Depends on | none — API đã có sẵn |
| Song song với | task-3-1, task-3-4 |
| Estimate | ~4h |

## Mục tiêu
Hoàn thiện luồng `OW_AUTH_002` theo Figma: đếm ngược 60 giây cho link 再送信, chú thích hiệu lực 5 phút, và rule mật khẩu mới 8–20 ký tự 半角英数字.

## Context (đọc trước khi code)

### 🎨 Figma
- `31498:191164` — bước 1 nhập ログインID + メールアドレス
- **`31498:191181`** — OTP rỗng + `再送信 （00:59）`
- `31498:191218` — OTP đã nhập + `※認証コードの有効期限は5分です。`
- **`31498:191258`** — mật khẩu mới + `8〜20字の半角英数字の組み合わせ`
- `31498:191278` — hoàn tất, tự đăng nhập, nút `ホーム画面へ`

### 🏗️ Tech Lead output
- **Design-Technical.md (FE)** → FE-19

### 📂 File liên quan trong codebase
- `src/pages/auth/VerifyPage.tsx`, `ResetPasswordPage.tsx`, `ResetSuccessPage.tsx`
- `src/services/client/auth.service.ts` — endpoint đã có
- `src/validation/schemas.ts` — nơi đặt yup schema

## API Definition (đã có, không đổi)
| Method | Endpoint | Request |
|---|---|---|
| POST | `/auth/forgot-password/request` | `{ loginId, email }` |
| POST | `/auth/forgot-password/verify-otp` | `{ loginId, otp }` |
| POST | `/auth/forgot-password/reset-password` | `{ loginId, otp, newPassword }` |

## Yêu cầu implement

### Step 1 — Service: không đổi
### Step 2 — Hook: không đổi (dùng `useMutationCustom` sẵn có)
### Step 3 — UI
`VerifyPage.tsx`:
- Đếm ngược 60s từ lúc gửi mã; trong lúc đếm, link `再送信` disabled và hiện `（mm:ss）`
- Hết đếm → link bật lại; bấm gọi lại `/forgot-password/request`, reset đồng hồ
- Chú thích `※認証コードの有効期限は5分です。`
- Dọn timer trong cleanup của `useEffect` (chống memory leak khi rời trang)

`ResetPasswordPage.tsx`:
- yup: `matches(/^[A-Za-z0-9]{8,20}$/)` + trường xác nhận `oneOf([ref('newPassword')])`
- Bullet hướng dẫn `8〜20字の半角英数字の組み合わせ` dưới input

## Unit Tests (BẮT BUỘC)
### `src/pages/auth/VerifyPage.test.tsx`
```typescript
it('disables the resend link while the countdown is running', ...);
it('re-enables the resend link after 60 seconds', ...);
it('clears the timer on unmount', ...);
```
### `src/validation/schemas.test.ts`
```typescript
it('rejects a password shorter than 8 or longer than 20 chars', ...);
it('rejects full-width or symbol characters', ...);
it('requires the confirm field to match', ...);
```
**Coverage:** ≥ 70% · **Verify:** `npm run test -- --coverage auth`

## Kiểm tra Integration (BẮT BUỘC)
- [ ] Chạy FE-localhost + BE-localhost, đi hết luồng quên mật khẩu → đăng nhập được bằng mật khẩu mới
- [ ] Nhập sai OTP → hiển thị lỗi từ API, không crash
- [ ] Đợi hết 60s → 再送信 gửi lại được mã

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Đăng nhập | `LoginPage.tsx` | Luồng login không đổi |
| Đổi mật khẩu trong app | `ChangePasswordPage.tsx` | Nếu dùng chung schema yup → kiểm tra rule không bị siết nhầm |

## Không được làm
- Không tự đặt thời gian đếm ngược khác 60s khi Figma ghi `00:59`
- Không lưu OTP vào localStorage
- Không đổi endpoint đang có

## Definition of Done
- [ ] Build · Lint · Type-check · Unit Tests pass
- [ ] Integration check pass · Non-Regression verify đủ
- [ ] Actual Hour · Status → `Done` → `Reviewing`
