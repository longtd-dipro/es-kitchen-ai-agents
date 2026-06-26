import { test, expect } from '@playwright/test'

test.use({ storageState: '.auth/e04.json' })

// TC-SW_PROF_001-070 — AC-6: Validation supplierName rỗng → error message + block submit
// Source: es-kitchen-repository/es-kitchen-web-supplier/src/validation/schemas.ts
//   - updateProfileSchema: supplierName → yup.string().required("仕入先名を入力してください。")
// Source: src/pages/profile/ProfilePage.tsx
//   - Controller name="supplierName" → BaseInput error={errors.supplierName?.message}
//   - BaseInput: renders error via BaseErrorForm bên dưới input
//   - useMutationCustom: handleSubmit blocks khi có validation error
//
// Selectors:
//   - input: getByPlaceholder('仕入先名を入力してください')
//   - save button: getByRole('button', { name: /保存/ })
//   - error message: getByText('仕入先名を入力してください。')
test('TC-SW_PROF_001-070 — supplierName rỗng → hiển thị error message, block submit', async ({ page }) => {
  // Arrange
  await page.goto('/profile')
  await page.waitForLoadState('networkidle')

  // Act — xóa hết nội dung trường supplierName
  const supplierNameInput = page.getByPlaceholder('仕入先名を入力してください')
  await supplierNameInput.clear()

  // Act — click 保存 (antd Button wraps text in <span> → use locator filter)
  await page.locator('button').filter({ hasText: /^保存$/ }).click()

  // Assert — error message hiển thị
  await expect(page.getByText('仕入先名を入力してください。')).toBeVisible()

  // Assert — API PATCH không được gọi (không có toast 保存しました)
  await expect(page.getByText('保存しました')).not.toBeVisible()
})
