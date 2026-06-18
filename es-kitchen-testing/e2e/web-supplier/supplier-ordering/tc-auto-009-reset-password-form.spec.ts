import { test, expect } from '@playwright/test'

// TC_AUTO_009 — SW_SUPO_003: /reset-password hien thi form voi 2 password fields
// Source: src/pages/auth/ResetPasswordPage.tsx
//   - Guard (useEffect): neu khong co supplierCode/email -> redirect /forgot-password
//                        neu khong co otp -> redirect /verify
//   - AuthCard title: "パスワード再設定"
//   - email hien thi: <span className="break-all">{email}</span>
//   - field password:          placeholder "パスワード" (label="パスワード", maxLength=20)
//   - field confirmedPassword: placeholder "パスワード（確認用）" (label="パスワード（確認用）")
//   - submit button: BaseButtonAuth label="確認"
//   - KHONG co text "8〜20字" trong JSX — chi co trong validation schema error message
// Source: src/validation/schemas.ts — resetPasswordSchema
//   - password: required("パスワードは必須項目です。") + max(20) + matches REGEX.PASSWORD
//     -> error: "8桁以上で英文字・数字を含めてください。"
//   - confirmedPassword: oneOf([ref("password")]) -> "パスワードが一致しません。"
// Route: ROUTE.RESET_PASSWORD = "/reset-password" (public)
// NOTE: navigate truc tiep voi params supplierCode+email+otp de bypass useEffect guard
test('TC_AUTO_009 — /reset-password hien thi form voi 2 password fields', async ({ browser }) => {
  const context = await browser.newContext({ storageState: undefined })
  const page = await context.newPage()

  // Arrange — params: supplierCode (KHONG phai companyCode), email, otp
  await page.goto('/reset-password?supplierCode=SP00003&email=test%40example.com&otp=1234')
  await page.waitForLoadState('networkidle')

  // Assert — dung trang (guard khong redirect vi co du params)
  await expect(page).toHaveURL(/\/reset-password/)

  // Assert — AuthCard title
  await expect(page.getByText('パスワード再設定')).toBeVisible()

  // Assert — email hien thi
  await expect(page.getByText('test@example.com')).toBeVisible()

  // Assert — 2 password fields voi placeholder chinh xac tu ResetPasswordPage.tsx
  await expect(page.getByPlaceholder('パスワード').first()).toBeVisible()
  await expect(page.getByPlaceholder('パスワード（確認用）')).toBeVisible()

  // Assert — submit button
  await expect(page.getByRole('button', { name: '確認' })).toBeVisible()

  await page.close()
  await context.close()
})
