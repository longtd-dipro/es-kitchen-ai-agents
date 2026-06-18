import { test as setup } from '@playwright/test'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env.test') })

// E04 login dùng "ログインID" (supplierCode), không phải "メールアドレス"
setup('authenticate e04', async ({ browser }) => {
  const url = process.env.E04_URL || 'http://localhost:3004'
  const page = await browser.newPage({ baseURL: url })

  await page.goto('/login')
  await page.getByPlaceholder('ログインID').fill(process.env.E04_EMAIL!)
  await page.getByPlaceholder('パスワード').fill(process.env.E04_PASSWORD!)
  await page.getByRole('button', { name: 'ログイン' }).click()
  await page.waitForURL('**/dashboard')

  await page.context().storageState({ path: '.auth/e04.json' })
  await page.close()
})
