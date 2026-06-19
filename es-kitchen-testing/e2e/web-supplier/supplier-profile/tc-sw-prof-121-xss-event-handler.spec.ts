import { test, expect } from '@playwright/test'

test.use({ storageState: '.auth/e04.json' })

// TC-SW_PROF_001-121 — Security (Critical): XSS — event handler trong supplierName
// React renders tất cả string values dưới dạng text node (escaped tự động)
// → <img src=x onerror=alert(1)> sẽ hiển thị như text, không được execute
//
// Source: src/pages/profile/ProfilePage.tsx
//   - BaseInput → React controlled input → value được sanitize khi render lại
//   - React's JSX: {value} → text node, không interpret HTML
//
// Selectors:
//   - supplierName input: getByPlaceholder('仕入先名を入力してください')
//   - save: locator('button').filter({ hasText: /^保存$/ })
//   - XSS check: page.evaluate(() => window.__xssTriggered) phải là undefined
test('TC-SW_PROF_001-121 — XSS: event handler trong supplierName không được execute', async ({ page }) => {
  // Arrange — inject flag để detect nếu XSS thực sự chạy
  await page.addInitScript(() => {
    // @ts-ignore
    window.__xssTriggered = false
    // @ts-ignore
    window.alert = () => { window.__xssTriggered = true }
  })

  await page.goto('/profile')
  await page.waitForLoadState('networkidle')

  // Act — nhập XSS payload vào supplierName
  const supplierNameInput = page.getByPlaceholder('仕入先名を入力してください')
  await supplierNameInput.clear()
  await supplierNameInput.fill('<img src=x onerror=alert(1)>')

  // Act — click 保存
  await page.locator('button').filter({ hasText: /^保存$/ }).click()

  // Wait một chút để XSS có cơ hội thực thi (nếu có)
  await page.waitForTimeout(1000)

  // Assert — XSS không được execute
  const xssTriggered = await page.evaluate(() => {
    // @ts-ignore
    return window.__xssTriggered ?? false
  })
  expect(xssTriggered).toBe(false)

  // Assert — không có alert dialog xuất hiện
  // (Playwright tự động fail nếu có unexpected dialog mà không handle)
})
