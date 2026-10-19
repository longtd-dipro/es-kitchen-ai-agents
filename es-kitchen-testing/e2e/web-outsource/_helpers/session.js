// Helper QC-automation E05 — đọc URL/tài khoản từ .env.test lúc chạy, KHÔNG in ra
const { chromium } = require('@playwright/test')
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env.test') })
const STATE = require('path').resolve(__dirname, '../../../.auth/e05.json')

async function login(page) {
  await page.goto('/login')
  await page.getByPlaceholder('ログインID').fill(process.env.E05_EMAIL)
  await page.getByPlaceholder('パスワード').fill(process.env.E05_PASSWORD)
  await page.getByRole('button', { name: 'ログイン' }).click()
  await page.waitForURL(/dashboard/, { timeout: 15000 })
}
// anonymous=true → chưa đăng nhập (test Login/Register/Reset PW). Mặc định: đã đăng nhập, tự đăng nhập lại nếu phiên hết hạn
async function open({ anonymous = false, viewport = { width: 1440, height: 1024 } } = {}) {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ baseURL: process.env.E05_URL, viewport, ...(anonymous ? {} : { storageState: STATE }) })
  const page = await ctx.newPage()
  if (!anonymous) {
    await page.goto('/dashboard')
    if (/login/.test(page.url())) await login(page)
  }
  return { browser, ctx, page, login }
}
module.exports = { open, login }
