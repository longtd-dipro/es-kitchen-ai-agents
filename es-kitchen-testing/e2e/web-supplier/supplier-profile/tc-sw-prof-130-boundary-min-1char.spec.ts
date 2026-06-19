import { test, expect } from '@playwright/test'

test.use({ storageState: '.auth/e04.json' })

// TC-SW_PROF_001-130 — Boundary: supplierName 1 ký tự (giá trị min hợp lệ)
// Source: src/validation/schemas.ts
//   - updateProfileSchema: supplierName → yup.string().trim().required(...)
//   - Không có min() constraint → 1 ký tự sau trim() là hợp lệ
//
// Selectors:
//   - supplierName input: getByPlaceholder('仕入先名を入力してください')
//   - save: locator('button').filter({ hasText: /^保存$/ })
//   - toast: getByText('保存しました')
test('TC-SW_PROF_001-130 — supplierName 1 ký tự → lưu thành công', async ({ page }) => {
  // Arrange
  await page.goto('/profile')
  await page.waitForLoadState('networkidle')

  // Act — nhập chỉ 1 ký tự
  const supplierNameInput = page.getByPlaceholder('仕入先名を入力してください')
  await supplierNameInput.clear()
  await supplierNameInput.fill('A')

  // Act — click 保存
  await page.locator('button').filter({ hasText: /^保存$/ }).click()

  // Assert — lưu thành công (1 ký tự hợp lệ)
  await expect(page.getByText('保存しました')).toBeVisible({ timeout: 10000 })

  // Assert — không có error message
  await expect(page.getByText('仕入先名を入力してください。')).not.toBeVisible()
})
