import { test, expect } from '@playwright/test'

// TC_AUTO_008 — SW_SUPO_002: /verify hien thi dung khi co supplierCode + email params
// Source: src/pages/auth/VerifyPage.tsx
//   - Guard: neu khong co supplierCode hoac email -> redirect /forgot-password
//   - AuthCard title: "認証コードを入力してください。"
//   - AuthCard subtitle: "パスワード再設定用メールを送信しました。\n下記のメールアドレスをご確認ください。"
//   - email hien thi: <span className="break-all">{email}</span>
//   - OTP input: BaseOTPInput (4 digits)
//   - submit button: BaseButtonAuth label="確認"
//   - resend text: "コードが届かない場合：" + span "再送信" (KHONG co "認証コードの再送信まで")
//   - countdown: span "（{formatTime(timeLeft)}）" — visible khi timeLeft > 0
//   - note: "※認証コードの有効期限は5分です。"
// Route: ROUTE.VERIFY = "/verify" (public — PublicOnly guard)
// NOTE: navigate truc tiep voi params de bypass redirect guard, khong goi API that
test('TC_AUTO_008 — /verify hien thi dung khi co supplierCode + email params', async ({ browser }) => {
  const context = await browser.newContext({ storageState: undefined })
  const page = await context.newPage()

  // Arrange — gia lap redirect tu /forgot-password voi params hop le
  await page.goto('/verify?supplierCode=SP00003&email=test%40example.com')
  await page.waitForLoadState('networkidle')

  // Assert — dung trang /verify (guard khong redirect vi co params)
  await expect(page).toHaveURL(/\/verify/)

  // Assert — AuthCard title (VerifyPage.tsx)
  await expect(page.getByText('認証コードを入力してください。')).toBeVisible()

  // Assert — subtitle: mail da gui
  await expect(page.getByText('パスワード再設定用メールを送信しました。')).toBeVisible()

  // Assert — email hien thi trong body (span tag)
  await expect(page.getByText('test@example.com')).toBeVisible()

  // Assert — submit button "確認" (BaseButtonAuth label="確認")
  await expect(page.getByRole('button', { name: '確認' })).toBeVisible()

  // Assert — resend text (VerifyPage.tsx: "コードが届かない場合：" + "再送信")
  await expect(page.getByText('コードが届かない場合：')).toBeVisible()

  // Assert — OTP expiry note (VerifyPage.tsx)
  await expect(page.getByText('※認証コードの有効期限は5分です。')).toBeVisible()

  await page.close()
  await context.close()
})
