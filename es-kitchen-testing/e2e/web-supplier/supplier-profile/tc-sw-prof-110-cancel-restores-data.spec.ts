import { test, expect } from '@playwright/test'

test.use({ storageState: '.auth/e04.json' })

// TC-SW_PROF_001-110 — AF-5: Cancel → khôi phục giá trị gốc, không gọi API
// Source: src/pages/profile/ProfilePage.tsx
//   - onClickCancel: reset({ supplierName: profile?.supplierName ?? "", email: profile?.email ?? "" })
//   - BaseButton キャンセル: onClick={onClickCancel}, disabled khi isPending
//   - Sau cancel: form hiển thị giá trị gốc từ profile data
//
// Selectors:
//   - supplierName input: getByPlaceholder('仕入先名を入力してください')
//   - email input:        getByPlaceholder('メールアドレスを入力してください')
//   - cancel button:      getByRole('button', { name: /キャンセル/ })
test('TC-SW_PROF_001-110 — Cancel khôi phục giá trị gốc, không gọi API', async ({ page }) => {
  // Arrange
  await page.goto('/profile')
  await page.waitForLoadState('networkidle')

  // Arrange — ghi lại giá trị gốc
  const supplierNameInput = page.getByPlaceholder('仕入先名を入力してください')
  const emailInput = page.getByPlaceholder('メールアドレスを入力してください')
  await expect(supplierNameInput).toBeVisible()
  await expect(emailInput).toBeVisible()

  const originalName = await supplierNameInput.inputValue()
  const originalEmail = await emailInput.inputValue()

  // Act — thay đổi cả 2 field
  await supplierNameInput.clear()
  await supplierNameInput.fill('変更しないこと_キャンセルテスト')
  await emailInput.clear()
  await emailInput.fill('cancel_test@eskitchen.test')

  // Act — click キャンセル (antd Button wraps text in <span> → use locator filter)
  await page.locator('button').filter({ hasText: /キャンセル/ }).click()

  // Assert — giá trị khôi phục về gốc
  await expect(supplierNameInput).toHaveValue(originalName)
  await expect(emailInput).toHaveValue(originalEmail)

  // Assert — không có toast success (API không được gọi)
  await expect(page.getByText('保存しました')).not.toBeVisible()
})
