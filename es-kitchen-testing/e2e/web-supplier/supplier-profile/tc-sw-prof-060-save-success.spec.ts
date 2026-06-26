import { test, expect } from '@playwright/test'

test.use({ storageState: '.auth/e04.json' })

// TC-SW_PROF_001-060 — AC-4 (Critical): Lưu thành công → toast 保存しました + data refresh
// Source: src/pages/profile/ProfilePage.tsx
//   - useMutationCustom: mutationFn=updateProfile, skipAutoSuccessHandling=true
//   - onSuccess: message.success("保存しました") → antd message toast
//   - onSuccess: queryClient.invalidateQueries({ queryKey: ["supplier-profile"] })
//     → trigger refetch GET /supplier/account/me → UI update
//   - API: PATCH /supplier/account/profile body { supplierName, email }
//
// Selectors:
//   - supplierName input: getByPlaceholder('仕入先名を入力してください')
//   - email input:        getByPlaceholder('メールアドレスを入力してください')
//   - save button:        getByRole('button', { name: /保存/ })
//   - success toast:      getByText('保存しました') — antd message component
//
// NOTE: Test sửa supplierName với timestamp để tránh trùng lặp giữa các lần chạy.
//       Email giữ nguyên để tránh conflict 409 nếu email đã tồn tại trong hệ thống.
test('TC-SW_PROF_001-060 — Lưu thành công → toast 保存しました', async ({ page }) => {
  // Arrange
  await page.goto('/profile')
  await page.waitForLoadState('networkidle')

  // Arrange — capture giá trị supplierName hiện tại từ input
  const supplierNameInput = page.getByPlaceholder('仕入先名を入力してください')
  await expect(supplierNameInput).toBeVisible()

  // Act — sửa supplierName (thêm timestamp để tránh trùng)
  const newName = `テスト食材株式会社_${Date.now()}`
  await supplierNameInput.clear()
  await supplierNameInput.fill(newName)

  // Act — click 保存 (antd Button wraps text in <span> → use locator filter)
  await page.locator('button').filter({ hasText: /^保存$/ }).click()

  // Assert — toast 保存しました hiển thị (antd message toast)
  await expect(page.getByText('保存しました')).toBeVisible({ timeout: 10000 })

  // Assert — sau khi toast hiển thị, input hiển thị giá trị mới (data đã refresh)
  // invalidateQueries trigger GET /me → reset form với data mới
  await page.waitForLoadState('networkidle')
  await expect(page.getByPlaceholder('仕入先名を入力してください')).toHaveValue(newName)
})
