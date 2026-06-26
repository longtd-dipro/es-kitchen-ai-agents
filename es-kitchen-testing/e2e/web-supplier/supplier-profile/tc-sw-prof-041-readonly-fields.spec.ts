import { test, expect } from '@playwright/test'

test.use({ storageState: '.auth/e04.json' })

// TC-SW_PROF_001-041 — AC-2: supplierCode và lastLoginAt là read-only (không có input box)
// Source: src/pages/profile/ProfilePage.tsx
//   - ReadOnlyRow label="仕入先コード" → render <p> text (không phải input)
//   - ReadOnlyRow label="最終ログイン" → render <p> text, format "YYYY-MM-DD HH:mm JST"
//   - Không có Controller / BaseInput cho 2 field này
//
// Figma: nodes 21081:86343 (仕入先コード row) và 21081:86369 (最終ログイン row)
//   → cả 2 đều là <p> text thuần, không có input element
//
// Selectors:
//   - label 仕入先コード: getByText('仕入先コード')
//   - label 最終ログイン: getByText('最終ログイン')
//   - input supplierCode: KHÔNG tồn tại — expect count = 0
test('TC-SW_PROF_001-041 — 仕入先コード và 最終ログイン là read-only, không có input box', async ({ page }) => {
  // Arrange
  await page.goto('/profile')
  await page.waitForLoadState('networkidle')

  // Assert — labels hiển thị
  await expect(page.getByText('仕入先コード')).toBeVisible()
  await expect(page.getByText('最終ログイン')).toBeVisible()

  // Assert — không có input placeholder cho 仕入先コード
  // (chỉ có 2 input: 仕入先名 và メールアドレス)
  const allInputs = page.getByRole('textbox')
  await expect(allInputs).toHaveCount(2)

  // Assert — giá trị 仕入先コード hiển thị dạng text (không phải input)
  // getByRole('textbox') không match 仕入先コード value
  // Kiểm tra gián tiếp: input[placeholder="仕入先名を入力してください"] và [placeholder="メールアドレスを入力してください"] là 2 input duy nhất
  await expect(page.getByPlaceholder('仕入先名を入力してください')).toBeVisible()
  await expect(page.getByPlaceholder('メールアドレスを入力してください')).toBeVisible()
})
