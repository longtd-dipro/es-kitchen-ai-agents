import { test as setup } from '@playwright/test'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env.test') })

setup('authenticate e06', async ({ browser }) => {
  const url = process.env.E06_URL || 'http://localhost:3006'
  const page = await browser.newPage({ baseURL: url })

  await page.goto('/login')
  await page.getByPlaceholder('メールアドレス').fill(process.env.E06_EMAIL!)
  await page.getByPlaceholder('パスワード').fill(process.env.E06_PASSWORD!)
  await page.getByRole('button', { name: 'ログイン' }).click()
  await page.waitForURL('/')

  await page.context().storageState({ path: '.auth/e06.json' })
  await page.close()
})
