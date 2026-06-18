# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: web-supplier/supplier-ordering/tc-auto-010-change-password-form.spec.ts >> TC_AUTO_010 — Reset Password validation: mat khau khong khop → loi "パスワードが一致しません。"
- Location: e2e/web-supplier/supplier-ordering/tc-auto-010-change-password-form.spec.ts:10:5

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/reset-password/
Received string:  "https://dev-sp.es-kitchen.co.jp/forgot-password"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    14 × unexpected value "https://dev-sp.es-kitchen.co.jp/forgot-password"

```

```yaml
- img "ESSTATION Background"
- img "ESSTATION"
- heading "パスワード再設定" [level=1]
- text: 登録済みのメールアドレスを入力してください。 再設定用認証コードをお送りします。 ログインID
- textbox "ログインID"
- text: メールアドレス
- textbox "メールアドレス"
- button "認証コードを送信"
- region "Notifications Alt+T"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | // TC_AUTO_010 — AC-06 / SW_SUPO_003: Reset Password — validation error khi mat khau khong khop
  4  | // Source: src/validation/schemas.ts — resetPasswordSchema
  5  | //   - confirmedPassword: oneOf([yup.ref("password")]) → "パスワードが一致しません。"
  6  | // Source: src/pages/auth/ResetPasswordPage.tsx
  7  | //   - 2 BaseInputPassword fields, cung dung placeholder "パスワードを入力してください"
  8  | //   - submit form → react-hook-form validate truoc khi goi API
  9  | // NOTE: Navigate voi params hop le de qua redirect guard
  10 | test('TC_AUTO_010 — Reset Password validation: mat khau khong khop → loi "パスワードが一致しません。"', async ({ browser }) => {
  11 |   const context = await browser.newContext({ storageState: undefined })
  12 |   const page = await context.newPage()
  13 | 
  14 |   // Arrange
  15 |   await page.goto('/reset-password?companyCode=SP00003&email=test%40example.com&otp=1234')
  16 |   await page.waitForLoadState('networkidle')
  17 | 
  18 |   // Assert — dung trang
> 19 |   await expect(page).toHaveURL(/\/reset-password/)
     |                      ^ Error: expect(page).toHaveURL(expected) failed
  20 | 
  21 |   // Act — nhap password hop le nhung confirm khac
  22 |   const passwordFields = page.getByPlaceholder('パスワードを入力してください')
  23 |   await passwordFields.first().fill('Password123')
  24 |   await passwordFields.nth(1).fill('DifferentPass456')
  25 |   await page.getByRole('button', { name: '確認' }).click()
  26 | 
  27 |   // Assert — validation error "パスワードが一致しません。" (resetPasswordSchema)
  28 |   await expect(
  29 |     page.getByText('パスワードが一致しません。')
  30 |   ).toBeVisible({ timeout: 5000 })
  31 | 
  32 |   // Assert — van o /reset-password
  33 |   await expect(page).toHaveURL(/\/reset-password/)
  34 | 
  35 |   await page.close()
  36 |   await context.close()
  37 | })
  38 | 
```