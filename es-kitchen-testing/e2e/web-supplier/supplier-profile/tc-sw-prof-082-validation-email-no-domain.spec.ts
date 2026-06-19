import { test, expect } from '@playwright/test'

test.use({ storageState: '.auth/e04.json' })

// TC-SW_PROF_001-082 — AC-5: email thiếu domain sau @ → error format
// Source: src/validation/schemas.ts
//   - updateProfileSchema: email → yup.string().email("メールアドレスの形式が正しくありません。").required(...)
//   - "qc_prof@" → fail yup email validation
//
// Selectors:
//   - email input: getByPlaceholder('メールアドレスを入力してください')
//   - save: locator('button').filter({ hasText: /^保存$/ })
//   - error: getByText('メールアドレスの形式が正しくありません。')
test('TC-SW_PROF_001-082 — email thiếu domain sau @ → error format', async ({ page }) => {
  // Arrange
  await page.goto('/profile')
  await page.waitForLoadState('networkidle')

  // Act — nhập email thiếu domain
  const emailInput = page.getByPlaceholder('メールアドレスを入力してください')
  await emailInput.clear()
  await emailInput.fill('qc_prof@')

  // Act — click 保存
  await page.locator('button').filter({ hasText: /^保存$/ }).click()

  // Assert — error format hiển thị
  await expect(page.getByText('メールアドレスの形式が正しくありません。')).toBeVisible()

  // Assert — API không được gọi
  await expect(page.getByText('保存しました')).not.toBeVisible()
})
