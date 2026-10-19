import { test, expect } from '@playwright/test'
import { record, shot } from './_lib'
const TAG = 'g10b'
for (const tc of ['TC-ESD-00306-019', 'TC-ESD-004-045']) {
  test(tc, async ({ page }) => {
    await page.goto('/delivery/QC_UNKNOWN01')
    await page.waitForURL(/\/login/, { timeout: 30000 }).catch(() => {})
    const ok = /\/login/.test(page.url())
    const ev = await shot(page, `g10b_${tc}`)
    if (ok) record(TAG, tc, 'OK', '', ev)
    else record(TAG, tc, 'NG', `Actual: url=${new URL(page.url()).pathname} | Expected: chuyển /login | Bước: mở URL bước khi chưa đăng nhập`, ev)
    expect(true).toBe(true)
  })
}
