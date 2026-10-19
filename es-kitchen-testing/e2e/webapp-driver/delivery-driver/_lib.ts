import { Page, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

export type Result = 'OK' | 'NG' | 'Pending' | 'N/A'
const RAW = path.resolve(__dirname, '../../../reports/delivery-driver/raw')
const SHOT = path.resolve(__dirname, '../../../reports/delivery-driver/screenshots')

/** Ghi kết quả 1 TC (ghi đè theo tcId) vào raw/<tag>.json */
export function record(tag: string, tcId: string, result: Result, note = '', evidence = '') {
  fs.mkdirSync(RAW, { recursive: true })
  const f = path.join(RAW, `${tag}.json`)
  const cur = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : {}
  cur[tcId] = { result, note, evidence }
  fs.writeFileSync(f, JSON.stringify(cur, null, 1))
}

export async function shot(page: Page, name: string) {
  fs.mkdirSync(SHOT, { recursive: true })
  const p = path.join(SHOT, name.replace(/[^A-Za-z0-9_.-]/g, '_') + '.png')
  await page.screenshot({ path: p, fullPage: true })
  return path.relative(path.resolve(__dirname, '../../..'), p)
}

/** Đăng nhập bằng tài khoản E06 trong .env.test (không in giá trị ra log). */
export async function login(page: Page) {
  const id = process.env.E06_EMAIL!
  const pw = process.env.E06_PASSWORD!
  await page.goto('/login')
  await page.getByPlaceholder('ログインID').fill(id)
  await page.getByPlaceholder('パスワード').fill(pw)
  await page.getByRole('button', { name: 'ログイン' }).click()
  await page.waitForURL((u) => !u.pathname.startsWith('/login'), { timeout: 20_000 })
}

export { expect }
