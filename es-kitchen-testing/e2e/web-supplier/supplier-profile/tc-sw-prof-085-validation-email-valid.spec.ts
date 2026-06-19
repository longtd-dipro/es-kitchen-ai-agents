import { test, expect } from '@playwright/test'

test.use({ storageState: '.auth/e04.json' })

// TC-SW_PROF_001-085 — AC-5 (positive): email hợp lệ → không hiển thị error, API được gọi
// Source: src/validation/schemas.ts
//   - updateProfileSchema: email → yup.string().email(...).required(...)
//   - Email hợp lệ với @ và domain đầy đủ → pass validation
//
// Selectors:
//   - email input: getByPlaceholder('メールアドレスを入力してください')
//   - save: locator('button').filter({ hasText: /^保存$/ })
//   - toast: getByText('保存しました')
//   - error: getByText('メールアドレスの形式が正しくありません。') — should NOT be visible
test('TC-SW_PROF_001-085 — email hợp lệ → validation pass, API được gọi', async ({ page }) => {
  // Arrange
  await page.goto('/profile')
  await page.waitForLoadState('networkidle')

  // Arrange — ghi lại supplierName để không thay đổi
  const supplierNameInput = page.getByPlaceholder('仕入先名を入力してください')
  const currentName = await supplierNameInput.inputValue()

  // Act — nhập email hợp lệ (timestamp để tránh trùng)
  const emailInput = page.getByPlaceholder('メールアドレスを入力してください')
  const validEmail = `qc_prof_valid_${Date.now()}@eskitchen.test`
  await emailInput.clear()
  await emailInput.fill(validEmail)

  // Act — click 保存
  await page.locator('button').filter({ hasText: /^保存$/ }).click()

  // Assert — không có error format
  await expect(page.getByText('メールアドレスの形式が正しくありません。')).not.toBeVisible()

  // Assert — toast 保存しました hiển thị (API được gọi bình thường)
  await expect(page.getByText('保存しました')).toBeVisible({ timeout: 10000 })
})
