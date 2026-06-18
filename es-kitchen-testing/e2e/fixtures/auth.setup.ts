import { test as setup } from '@playwright/test'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env.test') })

// Lưu ý: BaseLabel render <div><span> không phải <label> HTML
// → getByLabel() không hoạt động, dùng getByPlaceholder() thay thế

// E03 — System Admin
setup('authenticate e03', async ({ browser }) => {
  const url = process.env.E03_URL || 'http://localhost:3003'
  const page = await browser.newPage({ baseURL: url })

  await page.goto('/login')
  await page.getByPlaceholder('メールアドレス').fill(process.env.E03_EMAIL!)
  await page.getByPlaceholder('パスワード').fill(process.env.E03_PASSWORD!)
  await page.getByRole('button', { name: 'ログイン' }).click()
  await page.waitForURL('/')

  await page.context().storageState({ path: '.auth/e03.json' })
  await page.close()
})

// E02 — Company Admin
setup('authenticate e02', async ({ browser }) => {
  const url = process.env.E02_URL || 'http://localhost:3002'
  const page = await browser.newPage({ baseURL: url })

  await page.goto('/login')
  await page.getByPlaceholder('メールアドレス').fill(process.env.E02_EMAIL!)
  await page.getByPlaceholder('パスワード').fill(process.env.E02_PASSWORD!)
  await page.getByRole('button', { name: 'ログイン' }).click()
  await page.waitForURL('/')

  await page.context().storageState({ path: '.auth/e02.json' })
  await page.close()
})

// E04 — Supplier
// LoginPage.tsx: field supplierCode → placeholder "ログインID" (KHÔNG phải "メールアドレス")
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

// E05 — Outsource Internal
setup('authenticate e05', async ({ browser }) => {
  const url = process.env.E05_URL || 'http://localhost:3005'
  const page = await browser.newPage({ baseURL: url })

  await page.goto('/login')
  await page.getByPlaceholder('メールアドレス').fill(process.env.E05_EMAIL!)
  await page.getByPlaceholder('パスワード').fill(process.env.E05_PASSWORD!)
  await page.getByRole('button', { name: 'ログイン' }).click()
  await page.waitForURL('/')

  await page.context().storageState({ path: '.auth/e05.json' })
  await page.close()
})

// E06 — Driver
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
