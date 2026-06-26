import { test, expect } from '@playwright/test'

test.use({ storageState: '.auth/e04.json' })

// TC-SW_PROF_001-080 — AC-5: Validation email rỗng → error message + block submit
// Source: src/validation/schemas.ts
//   - updateProfileSchema: email → yup.string().required("メールアドレスを入力してください。")
// Source: src/pages/profile/ProfilePage.tsx
//   - Controller name="email" → BaseInput error={errors.email?.message}
//
// Selectors:
//   - email input: getByPlaceholder('メールアドレスを入力してください')
//   - save button: getByRole('button', { name: /保存/ })
//   - error message: getByText('メールアドレスを入力してください。')
test('TC-SW_PROF_001-080 — email rỗng → hiển thị error message, block submit', async ({ page }) => {
  // Arrange
  await page.goto('/profile')
  await page.waitForLoadState('networkidle')

  // Act — xóa hết nội dung trường email
  const emailInput = page.getByPlaceholder('メールアドレスを入力してください')
  await emailInput.clear()

  // Act — click 保存 (antd Button wraps text in <span> → use locator filter)
  await page.locator('button').filter({ hasText: /^保存$/ }).click()

  // Assert — error message hiển thị
  await expect(page.getByText('メールアドレスを入力してください。')).toBeVisible()

  // Assert — không có toast success
  await expect(page.getByText('保存しました')).not.toBeVisible()
})
