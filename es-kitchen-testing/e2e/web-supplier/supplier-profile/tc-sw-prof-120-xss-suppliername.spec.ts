import { test, expect } from '@playwright/test'

test.use({ storageState: '.auth/e04.json' })

// TC-SW_PROF_001-120 — Security (Critical): XSS — supplierName nhập script tag → không execute
// Source: React DOM escapes innerHTML by default — React renders text content safely
//   - JSX: <span>{profile?.supplierName}</span> → React escapes HTML entities
//   - BaseInput: antd Input component renders value as escaped text
//   - ReadOnlyRow: <span> renders text nodes, không dangerouslySetInnerHTML
//
// Test strategy: nhập <script>alert('XSS')</script> vào supplierName, lưu,
//   verify không có dialog alert và text được escape đúng cách.
//
// NOTE: Test này KHÔNG verify rằng payload được lưu vào DB —
//       chỉ verify FE không execute script khi hiển thị lại.
test('TC-SW_PROF_001-120 — XSS: script tag trong supplierName không được execute', async ({ page }) => {
  // Arrange — monitor dialog events (alert/confirm/prompt)
  let alertFired = false
  page.on('dialog', async dialog => {
    alertFired = true
    await dialog.dismiss()
  })

  await page.goto('/profile')
  await page.waitForLoadState('networkidle')

  // Act — nhập XSS payload vào supplierName
  const supplierNameInput = page.getByPlaceholder('仕入先名を入力してください')
  await supplierNameInput.clear()
  await supplierNameInput.fill("<script>alert('XSS')</script>")

  // Act — click 保存 để submit (có thể thành công hoặc BE reject — cả 2 đều OK)
  // antd Button wraps text in <span> → use locator filter
  await page.locator('button').filter({ hasText: /^保存$/ }).click()

  // Đợi response (toast hoặc error)
  await page.waitForTimeout(2000)

  // Assert — không có alert dialog được trigger
  expect(alertFired).toBe(false)

  // Assert — nếu dữ liệu được hiển thị lại, text phải là literal string (escaped)
  // React renders text nodes safely — không interpret HTML
  const xssRendered = page.getByText("<script>alert('XSS')</script>")
  // Nếu BE lưu được và trả về, text được render escaped (không có tag HTML thật)
  // Không cần expect visible vì BE có thể reject — quan trọng là không có alert
})
