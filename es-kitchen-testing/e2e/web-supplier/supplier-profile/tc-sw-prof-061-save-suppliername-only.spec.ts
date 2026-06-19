import { test, expect } from '@playwright/test'

test.use({ storageState: '.auth/e04.json' })

// TC-SW_PROF_001-061 — AC-4: Lưu thành công khi chỉ cập nhật supplierName
// Source: src/pages/profile/ProfilePage.tsx
//   - PATCH /supplier/account/profile body { supplierName, email }
//   - onSuccess: message.success("保存しました")
//   - onSuccess: queryClient.invalidateQueries(["supplier-profile"]) → refetch GET /me
//
// Selectors:
//   - supplierName input: getByPlaceholder('仕入先名を入力してください')
//   - save button: locator('button').filter({ hasText: /^保存$/ })
//   - toast: getByText('保存しました')
test('TC-SW_PROF_001-061 — Lưu thành công khi chỉ cập nhật 仕入先名', async ({ page }) => {
  // Arrange
  await page.goto('/profile')
  await page.waitForLoadState('networkidle')

  const supplierNameInput = page.getByPlaceholder('仕入先名を入力してください')
  const emailInput = page.getByPlaceholder('メールアドレスを入力してください')

  // Arrange — ghi lại email hiện tại (sẽ không thay đổi)
  const originalEmail = await emailInput.inputValue()

  // Act — chỉ sửa supplierName
  const newName = `更新済み食材会社_${Date.now()}`
  await supplierNameInput.clear()
  await supplierNameInput.fill(newName)

  // Act — click 保存
  await page.locator('button').filter({ hasText: /^保存$/ }).click()

  // Assert — toast 保存しました hiển thị
  await expect(page.getByText('保存しました')).toBeVisible({ timeout: 10000 })

  // Assert — supplierName cập nhật thành giá trị mới
  await page.waitForLoadState('networkidle')
  await expect(page.getByPlaceholder('仕入先名を入力してください')).toHaveValue(newName)

  // Assert — email không thay đổi
  await expect(page.getByPlaceholder('メールアドレスを入力してください')).toHaveValue(originalEmail)
})
