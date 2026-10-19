import { test } from '@playwright/test'
import { login, record, shot } from './_lib'

test('g10a probe: ES detail route with fake id (read-only)', async ({ page }) => {
  await login(page)
  await page.goto('/delivery')
  await page.waitForTimeout(8000)
  const listText = (await page.locator('body').innerText()).slice(0, 300)
  const ev1 = await shot(page, 'g10a_delivery_list')
  await page.goto('/delivery/QC_FAKE_ES01')
  await page.waitForTimeout(8000)
  const ev2 = await shot(page, 'g10a_es_detail_fake')
  const t = (await page.locator('body').innerText()).slice(0, 300)
  record('g10a', '_probe', 'N/A', JSON.stringify({ listText, detailText: t, url: page.url() }), ev1 + ';' + ev2)
})
