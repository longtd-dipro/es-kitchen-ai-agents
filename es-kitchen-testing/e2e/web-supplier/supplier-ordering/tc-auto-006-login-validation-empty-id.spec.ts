import { test, expect } from '@playwright/test'

// TC_AUTO_006 — SW_SUPO_001 NEGATIVE: Login de trong supplierCode -> validation error
// Source: src/validation/schemas.ts — signInSchema
//   - supplierCode: yup.string().required("ログインIDは必須項目です。")
//   - password:     yup.string().required("パスワードは必須項目です。")
// Source: src/pages/auth/LoginPage.tsx
//   - Controller name="supplierCode" → BaseInput error prop render error message
//   - react-hook-form validate truoc khi goi API
// Route: /login (public)
test('TC_AUTO_006 — Login de trong supplierCode → hien thi loi "ログインIDは必須項目です。"', async ({ browser }) => {
  const context = await browser.newContext({ storageState: undefined })
  const page = await context.newPage()

  // Arrange
  await page.goto('/login')
  await page.waitForLoadState('networkidle')

  // Act — bo trong supplierCode, chi dien password
  await page.getByPlaceholder('ログインID').fill('')
  await page.getByPlaceholder('パスワード').fill('SomePassword123')
  await page.getByRole('button', { name: 'ログイン' }).click()

  // Assert — hien thi validation error (signInSchema.supplierCode.required)
  await expect(
    page.getByText('ログインIDは必須項目です。')
  ).toBeVisible({ timeout: 5000 })

  // Assert — van o /login, khong redirect
  await expect(page).toHaveURL(/\/login/)

  await page.close()
  await context.close()
})
