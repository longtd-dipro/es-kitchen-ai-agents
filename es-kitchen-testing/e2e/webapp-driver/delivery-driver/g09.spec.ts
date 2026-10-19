import { test, expect, Page } from '@playwright/test'
import { login, record, shot } from './_lib'

const TAG = 'g09'
test.describe.configure({ mode: 'serial' })

test('TC-CLD-001-030 URL trực tiếp khi chưa đăng nhập', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page = await ctx.newPage()
  const base = process.env.E06_URL!
  const res: string[] = []
  for (const p of ['/delivery/QC_FAKE01', '/cool/QC_FAKE01']) {
    await page.goto(base.replace(/\/$/, '') + p)
    await page.waitForURL(/\/login/, { timeout: 20_000 })
    res.push(`${p}->login`)
  }
  await expect(page.getByPlaceholder('ログインID')).toBeVisible()
  const ev = await shot(page, 'g09_unauth_redirect')
  record(TAG, 'TC-CLD-001-030', 'OK',
    'Route thực tế của chi tiết là /delivery/:id (không có /cool/:id; /cool/* rơi vào wildcard). Cả hai URL chưa đăng nhập đều chuyển về /login (DA_AUTHEN_001).', ev)
  await ctx.close()
})

test('Xác nhận không có đơn COOL cho tài khoản test', async ({ page }) => {
  await login(page)
  await page.goto('/home')
  await expect(page.getByText('配送予定データはありません').first()).toBeVisible({ timeout: 40_000 })
  const coolCount = await page.getByText('COOL便').count()
  const ev = await shot(page, 'g09_home_no_data')
  expect(coolCount).toBe(0)
  // đơn không tồn tại khi đã đăng nhập: quan sát
  await page.goto('/delivery/QC_FAKE01')
  await page.waitForTimeout(8000)
  const ev2 = await shot(page, 'g09_delivery_fake_id')
  test.info().annotations.push({ type: 'obs', description: page.url() })
  record(TAG, '_obs', 'N/A', `Home không có thẻ COOL便; /delivery/QC_FAKE01 sau login -> ${new URL(page.url()).pathname}`, ev + ' ; ' + ev2)
})
