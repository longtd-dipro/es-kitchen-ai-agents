import { test, expect } from '@playwright/test'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../../.env.test') })

// TC_AUTO_001 — SW_SUPO_001: Login thanh cong -> redirect /dashboard
// Source: src/pages/auth/LoginPage.tsx
//   - field supplierCode: placeholder "ログインID"
//   - field password:     placeholder "パスワード"
//   - submit button: BaseButtonAuth label="ログイン" (render <button type="submit">)
//   - on success: dispatch setAuthTokens -> router.push(ROUTE.INDEX) -> redirect /dashboard
//   - forgot link: "パスワードを忘れた方はこちら"
// Source: src/pages/dashboard/DashboardPage.tsx
//   - h1 heading: "お知らせを確認する" (KHONG phai "ダッシュボード")
//   - breadcrumb span text: "TOP"
// Route: ROUTE.LOGIN = "/login", ROUTE.DASHBOARD = "/dashboard"
test('TC_AUTO_001 — Login thanh cong → redirect /dashboard', async ({ browser }) => {
  const url = process.env.E04_URL || 'http://localhost:3005'
  const context = await browser.newContext({ storageState: undefined, baseURL: url })
  const page = await context.newPage()

  // Arrange
  await page.goto('/login')
  await page.waitForLoadState('networkidle')

  // Assert — form hien thi dung theo LoginPage.tsx
  await expect(page.getByPlaceholder('ログインID')).toBeVisible()
  await expect(page.getByPlaceholder('パスワード')).toBeVisible()
  await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible()
  await expect(page.getByText('パスワードを忘れた方はこちら')).toBeVisible()

  // Act
  await page.getByPlaceholder('ログインID').fill(process.env.E04_EMAIL!)
  await page.getByPlaceholder('パスワード').fill(process.env.E04_PASSWORD!)
  await page.getByRole('button', { name: 'ログイン' }).click()

  // Assert — redirect den /dashboard
  await page.waitForURL('**/dashboard', { timeout: 10000 })
  await expect(page).toHaveURL(/\/dashboard/)

  // Assert — DashboardPage.tsx: h1 "お知らせを確認する" (KHONG phai "ダッシュボード")
  await expect(page.getByRole('heading', { name: 'お知らせを確認する' })).toBeVisible()

  // Save auth state cho cac TC su dung storageState
  await context.storageState({ path: path.resolve(__dirname, '../../../.auth/e04.json') })
  await page.close()
  await context.close()
})
