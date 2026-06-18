import { test, expect } from '@playwright/test'

// TC_AUTO_005 — SW_SUPO_002: /forgot-password hien thi form dung 2 field
// Source: src/pages/auth/ForgotPasswordPage.tsx
//   - AuthCard title prop: "パスワード再設定"
//   - subtitle: "登録済みのメールアドレスを入力してください。\n再設定用認証コードをお送りします。"
//   - field supplierCode: placeholder "ログインID" (BaseInput name="supplierCode")
//   - field email:        placeholder "メールアドレス" (BaseInput name="email")
//   - submit button: BaseButtonAuth label="認証コードを送信" (render <button>)
//   - on success: router.push("/verify?supplierCode=...&email=...")
// Route: ROUTE.FORGOT_PASSWORD = "/forgot-password" (public — PublicOnly guard)
// NOTE: fresh context, khong can auth
test('TC_AUTO_005 — /forgot-password hien thi form voi 2 field va nut gui OTP', async ({ browser }) => {
  const context = await browser.newContext({ storageState: undefined })
  const page = await context.newPage()

  // Arrange
  await page.goto('/forgot-password')
  await page.waitForLoadState('networkidle')

  // Assert — dung trang (khong redirect sang /login hay /dashboard)
  await expect(page).toHaveURL(/\/forgot-password/)

  // Assert — title card (AuthCard title prop = "パスワード再設定")
  await expect(page.getByText('パスワード再設定')).toBeVisible()

  // Assert — subtitle tu ForgotPasswordPage.tsx
  await expect(page.getByText('登録済みのメールアドレスを入力してください。')).toBeVisible()

  // Assert — 2 input fields (ForgotPasswordPage.tsx: supplierCode + email)
  await expect(page.getByPlaceholder('ログインID')).toBeVisible()
  await expect(page.getByPlaceholder('メールアドレス')).toBeVisible()

  // Assert — submit button (BaseButtonAuth label="認証コードを送信")
  await expect(page.getByRole('button', { name: '認証コードを送信' })).toBeVisible()

  await page.close()
  await context.close()
})
