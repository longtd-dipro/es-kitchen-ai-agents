import { test, expect } from '@playwright/test'

test.use({ storageState: '.auth/e04.json' })

// TC-SW_PROF_001-133 — Boundary: supplierName với ký tự đặc biệt tiếng Nhật
// Test: ký tự có dấu chấm giữa (・) và dấu ngoặc (（）) → hợp lệ
// Source: src/validation/schemas.ts — không có ký tự blacklist
// Source: TypeORM entity: supplierName → VARCHAR(255) → nhận UTF-8 đầy đủ
//
// Selectors:
//   - supplierName input: getByPlaceholder('仕入先名を入力してください')
//   - save: locator('button').filter({ hasText: /^保存$/ })
//   - toast: getByText('保存しました')
test('TC-SW_PROF_001-133 — supplierName ký tự đặc biệt tiếng Nhật → lưu thành công', async ({ page }) => {
  // Arrange
  await page.goto('/profile')
  await page.waitForLoadState('networkidle')

  // Act — nhập chuỗi tiếng Nhật với ký tự đặc biệt
  const specialName = '株式会社テスト・食材（東京）'
  const supplierNameInput = page.getByPlaceholder('仕入先名を入力してください')
  await supplierNameInput.clear()
  await supplierNameInput.fill(specialName)

  // Act — click 保存
  await page.locator('button').filter({ hasText: /^保存$/ }).click()

  // Assert — lưu thành công
  await expect(page.getByText('保存しました')).toBeVisible({ timeout: 10000 })

  // Assert — sau refresh, giá trị hiển thị đúng ký tự tiếng Nhật
  await page.waitForLoadState('networkidle')
  await expect(page.getByPlaceholder('仕入先名を入力してください')).toHaveValue(specialName)
})
