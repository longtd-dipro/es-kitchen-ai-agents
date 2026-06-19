import { test, expect } from '@playwright/test'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../../.env.test') })

// TC-SW_PROF_001-032 — AC-1: Truy cập /profile khi chưa đăng nhập → redirect về login
// Source: es-kitchen-repository/es-kitchen-web-supplier/src/routes/index.tsx
//   - Route /profile nằm trong RequireAuth guard
//   - Khi chưa auth → redirect về ROUTE.LOGIN = "/login"
// Source: src/routes/guards/RequireAuth.tsx
//   - Check auth state → Navigate to /login if not authenticated
//
// NOTE: Test này chạy KHÔNG dùng storageState (unauthenticated context)
test('TC-SW_PROF_001-032 — Chưa đăng nhập truy cập /profile → redirect về /login', async ({ browser }) => {
  const url = process.env.E04_URL || 'http://localhost:3004'

  // Arrange — tạo context mới không có auth state
  const context = await browser.newContext({ storageState: undefined, baseURL: url })
  const page = await context.newPage()

  // Act — truy cập /profile trực tiếp
  await page.goto('/profile')
  await page.waitForLoadState('networkidle')

  // Assert — bị redirect về /login
  await expect(page).toHaveURL(/\/login/)

  // Assert — trang login hiển thị (không có dữ liệu profile)
  await expect(page.getByPlaceholder('ログインID')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'プロフィール' })).not.toBeVisible()

  await page.close()
  await context.close()
})
