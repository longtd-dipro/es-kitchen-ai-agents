# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: web-supplier/supplier-ordering/tc-auto-009-csv-download.spec.ts >> TC_AUTO_009 — /reset-password hien thi form voi 2 password fields va policy text
- Location: e2e/web-supplier/supplier-ordering/tc-auto-009-csv-download.spec.ts:15:5

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
  3  | // TC_AUTO_009 — AC-06 / SW_SUPO_003: Reset Password — form hien thi dung 2 field password
  4  | // Source: src/pages/auth/ResetPasswordPage.tsx
  5  | //   - redirect guard: neu khong co companyCode/email/otp → redirect ve /forgot-password hoac /verify
  6  | //   - field "新しいパスワード"     → placeholder "パスワードを入力してください"
  7  | //   - field "パスワード（確認用）" → placeholder "パスワードを入力してください"
  8  | //   - rule text: "・ 8〜20字の半角英数字の組み合わせ"
  9  | //   - button: "確認"
  10 | // Source: src/validation/schemas.ts — resetPasswordSchema
  11 | //   - password: min 8, max 20, matches /^(?=.*[A-Za-z])(?=.*\d).{8,20}$/
  12 | //     → error "8桁以上で英文字・数字を含めてください。"
  13 | //   - confirmedPassword: oneOf([ref('password')]) → error "パスワードが一致しません。"
  14 | // NOTE: Navigate voi params hop le de tranh redirect guard
  15 | test('TC_AUTO_009 — /reset-password hien thi form voi 2 password fields va policy text', async ({ browser }) => {
  16 |   const context = await browser.newContext({ storageState: undefined })
  17 |   const page = await context.newPage()
  18 | 
  19 |   // Arrange — navigate voi params de qua redirect guard
  20 |   await page.goto('/reset-password?companyCode=SP00003&email=test%40example.com&otp=1234')
  21 |   await page.waitForLoadState('networkidle')
  22 | 
  23 |   // Assert — dung trang /reset-password
> 24 |   await expect(page).toHaveURL(/\/reset-password/)
     |                      ^ Error: expect(page).toHaveURL(expected) failed
  25 | 
  26 |   // Assert — title (AuthCard)
  27 |   await expect(page.getByText('パスワード再設定')).toBeVisible()
  28 | 
  29 |   // Assert — email hien thi
  30 |   await expect(page.getByText('test@example.com')).toBeVisible()
  31 | 
  32 |   // Assert — 2 password fields (ResetPasswordPage.tsx)
  33 |   await expect(
  34 |     page.getByPlaceholder('パスワードを入力してください').first()
  35 |   ).toBeVisible()
  36 | 
  37 |   // Assert — policy text "8〜20字の半角英数字の組み合わせ"
  38 |   await expect(page.getByText('8〜20字の半角英数字の組み合わせ')).toBeVisible()
  39 | 
  40 |   // Assert — nut Confirm
  41 |   await expect(page.getByRole('button', { name: '確認' })).toBeVisible()
  42 | 
  43 |   await page.close()
  44 |   await context.close()
  45 | })
  46 | 
```