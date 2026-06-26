import { test, expect } from '@playwright/test'

test.use({ storageState: '.auth/e04.json' })

// TC-SW_PROF_001-090 — AC-5+6: Cả supplierName và email rỗng → 2 error messages đồng thời
// Source: src/validation/schemas.ts
//   - updateProfileSchema validates cả 2 fields
//   - react-hook-form: handleSubmit triggers all field validation at once
// Source: src/pages/profile/ProfilePage.tsx
//   - errors.supplierName?.message + errors.email?.message đều được render
//
// Selectors:
//   - supplierName input: getByPlaceholder('仕入先名を入力してください')
//   - email input:        getByPlaceholder('メールアドレスを入力してください')
//   - save button:        getByRole('button', { name: /保存/ })
//   - error 1: getByText('仕入先名を入力してください。')
//   - error 2: getByText('メールアドレスを入力してください。')
test('TC-SW_PROF_001-090 — Cả 2 fields rỗng → 2 error messages hiển thị đồng thời', async ({ page }) => {
  // Arrange
  await page.goto('/profile')
  await page.waitForLoadState('networkidle')

  // Act — xóa cả 2 fields
  await page.getByPlaceholder('仕入先名を入力してください').clear()
  await page.getByPlaceholder('メールアドレスを入力してください').clear()

  // Act — click 保存 (antd Button wraps text in <span> → use locator filter)
  await page.locator('button').filter({ hasText: /^保存$/ }).click()

  // Assert — cả 2 error message hiển thị đồng thời
  await expect(page.getByText('仕入先名を入力してください。')).toBeVisible()
  await expect(page.getByText('メールアドレスを入力してください。')).toBeVisible()

  // Assert — API không được gọi
  await expect(page.getByText('保存しました')).not.toBeVisible()
})
