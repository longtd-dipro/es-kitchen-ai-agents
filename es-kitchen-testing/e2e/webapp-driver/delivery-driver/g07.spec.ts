import { test, expect } from '@playwright/test'
import { login, record, shot } from './_lib'

const T = 'g07'
const probes: Record<string, any> = {}

test('g07 anon direct URL', async ({ page }) => {
  for (const [k, u] of [['wh', '/warehouse/QC_NOEXIST01'], ['dl', '/delivery/QC_NOEXIST01?type=WAREHOUSE_RECEIPT']]) {
    await page.goto(u)
    await page.waitForTimeout(4000)
    probes['anon_' + k] = { url: new URL(page.url()).pathname + new URL(page.url()).search, hasLoginForm: await page.getByPlaceholder('ログインID').isVisible().catch(() => false) }
  }
  const sp = await shot(page, 'g07_anon')
  probes.anon_shot = sp
  const ok = probes.anon_wh.url.startsWith('/login') && probes.anon_wh.hasLoginForm
  const ok2 = probes.anon_dl.url.startsWith('/login') && probes.anon_dl.hasLoginForm
  console.log('PROBE', JSON.stringify(probes))
  record(T, 'TC-RCV-003-018', ok ? 'OK' : 'NG', ok ? '' : `Actual: ${JSON.stringify(probes.anon_wh)} | Expected: chuyển sang DA_AUTHEN_001 | Bước: mở /warehouse/<id> chưa đăng nhập | Evidence: ${sp}`, sp)
  if (ok) {
    record(T, 'TC-RCV-001-060', 'Pending', `Bước 1 đã xác nhận (chưa login mở /warehouse/<id> -> /login, không lộ dữ liệu; route thực tế /delivery/:id?type=WAREHOUSE_RECEIPT cũng ${ok2 ? '-> /login' : 'KHÁC: ' + JSON.stringify(probes.anon_dl)}). Vế "sau đăng nhập mở đúng kho" cần kho thật của tài xế (DEV không có lịch) và Safari iOS.`, sp)
  } else {
    record(T, 'TC-RCV-001-060', 'NG', `Actual: ${JSON.stringify(probes.anon_wh)} | Expected: chuyển sang DA_AUTHEN_001 | Evidence: ${sp}`, sp)
  }
})

test('g07 logged-in unknown id', async ({ page }) => {
  await login(page)
  for (const [k, u] of [['wh', '/warehouse/QC_NOEXIST01'], ['dl', '/delivery/QC_NOEXIST01?type=WAREHOUSE_RECEIPT']]) {
    await page.goto(u)
    await page.waitForTimeout(8000)
    probes['auth_' + k] = { url: new URL(page.url()).pathname + new URL(page.url()).search, text: (await page.locator('body').innerText()).replace(/\s+/g, ' ').slice(0, 200) }
    probes['auth_' + k + '_shot'] = await shot(page, 'g07_auth_' + k)
  }
  console.log('PROBE2', JSON.stringify(probes))
})
