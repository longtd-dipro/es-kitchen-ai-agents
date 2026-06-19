import { test, expect } from '@playwright/test'

test.use({ storageState: '.auth/e04.json' })

// TC-SW_PROF_001-071 — AC-6: supplierName chỉ có khoảng trắng → coi là rỗng, hiển thị lỗi
// Source: src/validation/schemas.ts
//   - updateProfileSchema: supplierName → yup.string().trim().required("仕入先名を入力してください。")
//   - .trim() làm cho chuỗi toàn khoảng trắng fail required validation
//
// Selectors:
//   - input: getByPlaceholder('仕入先名を入力してください')
//   - save: locator('button').filter({ hasText: /^保存$/ })
//   - error: getByText('仕入先名を入力してください。')
test('TC-SW_PROF_001-071 — supplierName chỉ có khoảng trắng → error message', async ({ page }) => {
  // Arrange
  await page.goto('/profile')
  await page.waitForLoadState('networkidle')

  // Act — nhập 3 dấu cách vào supplierName
  const supplierNameInput = page.getByPlaceholder('仕入先名を入力してください')
  await supplierNameInput.clear()
  await supplierNameInput.fill('   ')

  // Act — click 保存
  await page.locator('button').filter({ hasText: /^保存$/ }).click()

  // Assert — error message hiển thị (whitespace bị trim → coi là rỗng)
  await expect(page.getByText('仕入先名を入力してください。')).toBeVisible()

  // Assert — API không được gọi (không có toast success)
  await expect(page.getByText('保存しました')).not.toBeVisible()
})
