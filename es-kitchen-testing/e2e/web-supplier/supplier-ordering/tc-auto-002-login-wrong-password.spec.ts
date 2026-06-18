import { test, expect } from '@playwright/test'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../../.env.test') })

// TC_AUTO_002 — SW_SUPO_001 NEGATIVE: Login sai password -> toast error, van o /login
// Source: src/pages/auth/LoginPage.tsx
//   - catch(AxiosError): message.error(error.response?.data?.message || MESSAGES.LOGIN_FAILED)
//   - MESSAGES.LOGIN_FAILED (src/constants/messages.ts) = "ログインIDまたはパスワードが正しくありません。"
//   - Khong redirect sau khi error — van o /login
test('TC_AUTO_002 — Login sai password → toast loi, van o /login', async ({ browser }) => {
  const url = process.env.E04_URL || 'https://dev-sp.es-kitchen.co.jp'
  const context = await browser.newContext({ storageState: undefined, baseURL: url })
  const page = await context.newPage()

  // Arrange
  await page.goto('/login')
  await page.waitForLoadState('networkidle')

  // Act — nhap dung supplierCode nhung sai password
  await page.getByPlaceholder('ログインID').fill(process.env.E04_EMAIL!)
  await page.getByPlaceholder('パスワード').fill('WrongPass999!')
  await page.getByRole('button', { name: 'ログイン' }).click()

  // Assert — toast error hien thi (MESSAGES.LOGIN_FAILED tu src/constants/messages.ts)
  await expect(
    page.getByText('ログインIDまたはパスワードが正しくありません。')
  ).toBeVisible({ timeout: 8000 })

  // Assert — van o /login, khong redirect
  await expect(page).toHaveURL(/\/login/)

  await page.close()
  await context.close()
})
