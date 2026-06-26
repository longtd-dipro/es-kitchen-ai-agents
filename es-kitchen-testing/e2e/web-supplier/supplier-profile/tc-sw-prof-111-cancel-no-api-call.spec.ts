import { test, expect } from '@playwright/test'

test.use({ storageState: '.auth/e04.json' })

// TC-SW_PROF_001-111 — AF-5: Cancel → không gọi API PATCH
// Source: src/pages/profile/ProfilePage.tsx
//   - onClickCancel: reset({ supplierName: profile?.supplierName ?? "", email: profile?.email ?? "" })
//   - Không gọi mutate() khi cancel → không có PATCH request
//   - Kiểm tra: sau cancel, không có toast 保存しました
//
// Selectors:
//   - supplierName input: getByPlaceholder('仕入先名を入力してください')
//   - cancel button: locator('button').filter({ hasText: /キャンセル/ })
//   - toast (should not appear): getByText('保存しました')
test('TC-SW_PROF_001-111 — Cancel → API PATCH không được gọi', async ({ page }) => {
  // Arrange
  await page.goto('/profile')
  await page.waitForLoadState('networkidle')

  // Act — thay đổi giá trị input
  const supplierNameInput = page.getByPlaceholder('仕入先名を入力してください')
  await supplierNameInput.clear()
  await supplierNameInput.fill('キャンセルテスト_APIコールなし')

  // Act — click キャンセル
  await page.locator('button').filter({ hasText: /キャンセル/ }).click()

  // Assert — không có toast success (API không được gọi)
  await expect(page.getByText('保存しました')).not.toBeVisible()

  // Assert — form trở về trạng thái bình thường (giá trị gốc)
  // Input không còn giá trị vừa nhập
  const currentValue = await supplierNameInput.inputValue()
  expect(currentValue).not.toBe('キャンセルテスト_APIコールなし')
})
