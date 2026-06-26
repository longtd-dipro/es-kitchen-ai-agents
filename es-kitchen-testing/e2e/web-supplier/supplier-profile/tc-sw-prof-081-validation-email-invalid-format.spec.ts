import { test, expect } from '@playwright/test'

test.use({ storageState: '.auth/e04.json' })

// TC-SW_PROF_001-081 — AC-5: Email thiếu ký tự @ → error format
// Source: src/validation/schemas.ts
//   - updateProfileSchema: email → .email("メールアドレスの形式が正しくありません。")
// Source: src/pages/profile/ProfilePage.tsx
//   - Controller name="email" → BaseInput error={errors.email?.message}
//
// Selectors:
//   - email input: getByPlaceholder('メールアドレスを入力してください')
//   - save button: getByRole('button', { name: /保存/ })
//   - error message: getByText('メールアドレスの形式が正しくありません。')
test('TC-SW_PROF_001-081 — email thiếu @ → error format message', async ({ page }) => {
  // Arrange
  await page.goto('/profile')
  await page.waitForLoadState('networkidle')

  // Act — nhập email không hợp lệ (thiếu @)
  const emailInput = page.getByPlaceholder('メールアドレスを入力してください')
  await emailInput.clear()
  await emailInput.fill('qcprofeskitchen.test')

  // Act — click 保存 (antd Button wraps text in <span> → use locator filter)
  await page.locator('button').filter({ hasText: /^保存$/ }).click()

  // Assert — error message format
  await expect(page.getByText('メールアドレスの形式が正しくありません。')).toBeVisible()

  // Assert — không có toast success
  await expect(page.getByText('保存しました')).not.toBeVisible()
})
