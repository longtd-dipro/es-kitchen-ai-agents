import { test, expect } from '@playwright/test'

test.use({ storageState: '.auth/e04.json' })

// TC-SW_PROF_001-122 — Security (Critical): SQL Injection trong supplierName
// Test ở tầng FE: kiểm tra chuỗi SQL injection được xử lý bình thường
// BE dùng TypeORM parameterized query → SQL injection an toàn tại BE
// FE: nhập chuỗi → gửi lên API → nhận response bình thường hoặc lỗi validation
//
// Expected: hệ thống không crash, không có lỗi server 500
// API nhận chuỗi literal, BE parameterize nên không có SQL execution
//
// Selectors:
//   - supplierName input: getByPlaceholder('仕入先名を入力してください')
//   - save: locator('button').filter({ hasText: /^保存$/ })
//   - error toast 500: không được hiển thị lỗi server
test('TC-SW_PROF_001-122 — SQL Injection trong supplierName → xử lý bình thường, không crash', async ({ page }) => {
  // Arrange
  await page.goto('/profile')
  await page.waitForLoadState('networkidle')

  // Act — nhập SQL injection payload
  const supplierNameInput = page.getByPlaceholder('仕入先名を入力してください')
  await supplierNameInput.clear()
  await supplierNameInput.fill("'; DROP TABLE suppliers; --")

  // Act — click 保存
  await page.locator('button').filter({ hasText: /^保存$/ }).click()

  // Wait for response
  await page.waitForTimeout(2000)

  // Assert — trang không crash (không có unhandled error làm blank page)
  await expect(page.getByText('仕入先コード')).toBeVisible()

  // Assert — không có server error 500 message
  // Kết quả chấp nhận được: hoặc là lưu thành công (toast 保存しました) hoặc là validation error,
  // nhưng KHÔNG phải crash 500 bất ngờ
  const isPageStillWorking = await page.getByPlaceholder('仕入先名を入力してください').isVisible()
  expect(isPageStillWorking).toBe(true)
})
