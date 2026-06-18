import { test, expect } from '@playwright/test'

// TC_AUTO_010 — SW_SUPO_003 NEGATIVE: Reset Password validation - mat khau khong khop
// Source: src/validation/schemas.ts — resetPasswordSchema
//   - confirmedPassword: yup.string().oneOf([yup.ref("password")], "パスワードが一致しません。")
// Source: src/pages/auth/ResetPasswordPage.tsx
//   - field password:          placeholder "パスワード" (maxLength=20)
//   - field confirmedPassword: placeholder "パスワード（確認用）" (maxLength=20)
//   - react-hook-form validate khi submit -> hien thi error tren BaseInputPassword
//   - KHONG goi API neu validation fail
// Route: ROUTE.RESET_PASSWORD = "/reset-password"
// NOTE: params supplierCode+email+otp de bypass useEffect guard
test('TC_AUTO_010 — Reset Password: mat khau khong khop → loi "パスワードが一致しません。"', async ({ browser }) => {
  const context = await browser.newContext({ storageState: undefined })
  const page = await context.newPage()

  // Arrange — params de bypass redirect guard
  await page.goto('/reset-password?supplierCode=SP00003&email=test%40example.com&otp=1234')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveURL(/\/reset-password/)

  // Act — nhap password hop le nhung confirm khong khop
  // Selector chinh xac tu ResetPasswordPage.tsx: placeholder "パスワード" va "パスワード（確認用）"
  await page.getByPlaceholder('パスワード').first().fill('Password123')
  await page.getByPlaceholder('パスワード（確認用）').fill('DifferentPass456')
  await page.getByRole('button', { name: '確認' }).click()

  // Assert — validation error tu resetPasswordSchema.confirmedPassword.oneOf
  await expect(
    page.getByText('パスワードが一致しません。')
  ).toBeVisible({ timeout: 5000 })

  // Assert — van o /reset-password (khong goi API)
  await expect(page).toHaveURL(/\/reset-password/)

  await page.close()
  await context.close()
})
