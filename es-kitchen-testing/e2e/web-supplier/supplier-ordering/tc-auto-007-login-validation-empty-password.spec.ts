import { test, expect } from '@playwright/test'

// TC_AUTO_007 — SW_SUPO_001 NEGATIVE: Login de trong password -> validation error
// Source: src/validation/schemas.ts — signInSchema
//   - password: yup.string().required("パスワードは必須項目です。")
// Source: src/pages/auth/LoginPage.tsx
//   - Controller name="password" → BaseInputPassword error prop render error message
//   - react-hook-form validate truoc khi goi API
// Route: /login (public)
test('TC_AUTO_007 — Login de trong password → hien thi loi "パスワードは必須項目です。"', async ({ browser }) => {
  const context = await browser.newContext({ storageState: undefined })
  const page = await context.newPage()

  // Arrange
  await page.goto('/login')
  await page.waitForLoadState('networkidle')

  // Act — dien supplierCode, bo trong password
  await page.getByPlaceholder('ログインID').fill('SP00003')
  await page.getByPlaceholder('パスワード').fill('')
  await page.getByRole('button', { name: 'ログイン' }).click()

  // Assert — hien thi validation error (signInSchema.password.required)
  await expect(
    page.getByText('パスワードは必須項目です。')
  ).toBeVisible({ timeout: 5000 })

  // Assert — van o /login
  await expect(page).toHaveURL(/\/login/)

  await page.close()
  await context.close()
})
