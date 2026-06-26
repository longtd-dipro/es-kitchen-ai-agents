import { test, expect } from '@playwright/test'

test.use({ storageState: '.auth/e04.json' })

// TC-SW_PROF_001-112 — AF-5: Cancel sau khi có validation error → error message biến mất
// Source: src/pages/profile/ProfilePage.tsx
//   - onClickCancel: reset() → clear errors + restore original values
//   - react-hook-form reset() clears both values và errors
//
// Selectors:
//   - supplierName input: getByPlaceholder('仕入先名を入力してください')
//   - error message: getByText('仕入先名を入力してください。')
//   - cancel button: locator('button').filter({ hasText: /キャンセル/ })
test('TC-SW_PROF_001-112 — Cancel sau khi có validation error → error biến mất', async ({ page }) => {
  // Arrange
  await page.goto('/profile')
  await page.waitForLoadState('networkidle')

  const supplierNameInput = page.getByPlaceholder('仕入先名を入力してください')
  const originalName = await supplierNameInput.inputValue()

  // Act — xóa supplierName để tạo ra validation error
  await supplierNameInput.clear()
  await page.locator('button').filter({ hasText: /^保存$/ }).click()

  // Assert — error message xuất hiện
  await expect(page.getByText('仕入先名を入力してください。')).toBeVisible()

  // Act — click キャンセル
  await page.locator('button').filter({ hasText: /キャンセル/ }).click()

  // Assert — error message biến mất
  await expect(page.getByText('仕入先名を入力してください。')).not.toBeVisible()

  // Assert — giá trị gốc khôi phục
  await expect(supplierNameInput).toHaveValue(originalName)
})
