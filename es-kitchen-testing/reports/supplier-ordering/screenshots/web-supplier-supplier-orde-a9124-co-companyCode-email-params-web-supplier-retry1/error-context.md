# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: web-supplier/supplier-ordering/tc-auto-008-order-detail.spec.ts >> TC_AUTO_008 — /verify hien thi dung khi co companyCode + email params
- Location: e2e/web-supplier/supplier-ordering/tc-auto-008-order-detail.spec.ts:15:5

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/verify/
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
  3  | // TC_AUTO_008 — AC-06 / SW_SUPO_002: Forgot Password — submit hop le → redirect /verify
  4  | // Source: src/pages/auth/ForgotPasswordPage.tsx
  5  | //   - on success: router.push("/verify?companyCode=...&email=...")
  6  | //   - forgotPassword API call → nếu success → chuyển tới verify page
  7  | // Source: src/pages/auth/VerifyPage.tsx
  8  | //   - title "認証コードを入力してください。"
  9  | //   - subtitle "パスワード再設定用メールを送信しました。..."
  10 | //   - OTP input field (4 digits)
  11 | //   - countdown: "認証コードの再送信まで：" + timer
  12 | //   - button "確認"
  13 | //   - link "再送信" (sau khi het countdown)
  14 | // NOTE: Fresh context, dung email gia dinh — test redirect flow, khong test API that
  15 | test('TC_AUTO_008 — /verify hien thi dung khi co companyCode + email params', async ({ browser }) => {
  16 |   const context = await browser.newContext({ storageState: undefined })
  17 |   const page = await context.newPage()
  18 | 
  19 |   // Arrange — navigate thang toi /verify voi params hop le (gia lap redirect tu forgot-password)
  20 |   await page.goto('/verify?companyCode=SP00003&email=test%40example.com')
  21 |   await page.waitForLoadState('networkidle')
  22 | 
  23 |   // Assert — dung trang /verify (khong redirect)
> 24 |   await expect(page).toHaveURL(/\/verify/)
     |                      ^ Error: expect(page).toHaveURL(expected) failed
  25 | 
  26 |   // Assert — title "認証コードを入力してください。" (AuthCard title)
  27 |   await expect(page.getByText('認証コードを入力してください。')).toBeVisible()
  28 | 
  29 |   // Assert — subtitle co noi dung gui mail (VerifyPage.tsx)
  30 |   await expect(page.getByText('パスワード再設定用メールを送信しました。')).toBeVisible()
  31 | 
  32 |   // Assert — email hien thi trong body
  33 |   await expect(page.getByText('test@example.com')).toBeVisible()
  34 | 
  35 |   // Assert — nut Confirm hien thi
  36 |   await expect(page.getByRole('button', { name: '確認' })).toBeVisible()
  37 | 
  38 |   // Assert — countdown timer hien thi "認証コードの再送信まで："
  39 |   await expect(page.getByText(/認証コードの再送信まで/)).toBeVisible()
  40 | 
  41 |   await page.close()
  42 |   await context.close()
  43 | })
  44 | 
```