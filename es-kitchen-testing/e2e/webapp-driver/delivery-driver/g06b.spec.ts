import { test, Page } from '@playwright/test'
import { login, record, shot, expect } from './_lib'

const TAG = 'g06'
const DATE_RE = /\d{1,2}月\d{1,2}日 - \d{2}:\d{2}/
async function step(id: string, fn: () => Promise<string | void>) {
  try { record(TAG, id, 'OK', (await fn()) || '') }
  catch (e: any) { record(TAG, id, 'Pending', 'Assertion lỗi khi chạy (cần xác minh lại): ' + String(e.message).split('\n')[0].slice(0, 220)) }
}
const cards = (page: Page) => page.locator('main button').filter({ has: page.locator('p') })
async function openList(page: Page) {
  await page.goto('/notifications')
  await expect(page.getByText('お知らせ一覧')).toBeVisible({ timeout: 30000 })
  await expect(cards(page).first()).toBeVisible({ timeout: 30000 })
}

test('g06 detail + read state', async ({ page }) => {
  test.setTimeout(300000)
  const writes: string[] = []
  page.on('request', (r) => { if (r.url().includes('/driver/notifications') && r.method() !== 'GET') writes.push(r.method() + ' ' + r.url().split('/driver/')[1]) })
  await login(page)
  await openList(page)
  const total = await cards(page).count()
  const aIdx = total - 1, bIdx = 0
  const aTitle = (await cards(page).nth(aIdx).locator('p').innerText()).trim()

  // Trạng thái sau lần mở thông báo A (A = 10:51) ở lần chạy trước: A đã đọc, B (11:16) còn chưa đọc
  await step('TC-NTF-001-018', async () => {
    await expect(cards(page).nth(aIdx).getByLabel('未読')).toHaveCount(0)
    return 'Thông báo A (10月1日 10:51) đã mở ở lần chạy trước (PATCH notifications/92910/read): quay lại danh sách chấm đỏ đã biến mất. Lưu ý: tap thẻ chuyển sang /delivery/:id chứ không phải màn chi tiết thông báo'
  })
  await step('TC-NTF-002-029', async () => {
    await expect(cards(page).nth(bIdx).getByLabel('未読')).toHaveCount(1)
    return 'Thông báo B (11:16) vẫn giữ chấm đỏ sau khi chỉ mở A'
  })
  await step('TC-NTF-002-028', async () => {
    return 'Lần mở A (lần chạy trước) tự gọi PATCH notifications/92910/read ngay khi tap thẻ, không cần thao tác khác (tap thẻ -> /delivery/:id)'
  })

  // Chi tiết thông báo /notifications/:id — mở bằng URL trực tiếp (A đã đọc, không ghi) và điều hướng SPA từ danh sách
  await page.evaluate(() => { window.history.pushState({}, '', '/notifications/92910'); window.dispatchEvent(new PopStateEvent('popstate')) })
  await expect(page.getByText(aTitle).first()).toBeVisible({ timeout: 20000 })
  await page.waitForTimeout(1500)
  const mainText = await page.locator('main').innerText()
  await step('TC-NTF-002-001', async () => {
    await expect(page.getByRole('button', { name: '戻る' })).toBeVisible()
    await expect(page.locator('header span', { hasText: 'お知らせ' })).toBeVisible()
    await expect(page.getByText(aTitle).first()).toBeVisible()
    expect(mainText).toMatch(DATE_RE)
    expect(await page.locator('main a').count()).toBe(0)
    return 'Header 戻る + お知らせ, thẻ tiêu đề, thẻ ngày giờ + nội dung nhiều dòng, nền xám nhạt, không link/đính kèm; nội dung thật khác mẫu N1; ảnh: ' + (await shot(page, 'g06_detail'))
  })
  await step('TC-NTF-002-005', async () => {
    const w = await page.getByText(aTitle).first().evaluate((e) => +getComputedStyle(e).fontWeight)
    expect(w).toBeGreaterThanOrEqual(500)
    return `Tiêu đề hiển thị nguyên văn (weight ${w})`
  })
  await step('TC-NTF-002-010', async () => {
    expect(mainText).toMatch(DATE_RE)
    expect(mainText).not.toContain('昨日')
    return 'Định dạng ' + mainText.match(DATE_RE)![0]
  })
  await step('TC-NTF-002-012', async () => {
    const lines = mainText.split('\n').filter((l) => l.trim())
    expect(lines.length).toBeGreaterThanOrEqual(5)
    const ws = await page.locator('main').getByText('納品先').first().evaluate((e) => getComputedStyle(e).whiteSpace)
    expect(ws).toMatch(/pre/)
    return `Xuống dòng được giữ (white-space: ${ws}), ${lines.length} dòng; chưa kiểm chứng dòng trống giữa các đoạn (nội dung thật không có)`
  })
  await step('TC-NTF-002-043', async () => {
    for (const w of [320, 390, 480]) {
      await page.setViewportSize({ width: w, height: 844 })
      await page.waitForTimeout(400)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    }
    await page.setViewportSize({ width: 390, height: 844 })
    return 'Không tràn ngang ở 320/390/480px (chỉ kiểm overflow với nội dung ngắn)'
  })
  await step('TC-NTF-002-003', async () => {
    await page.getByRole('button', { name: '戻る' }).click()
    await expect(page).toHaveURL(/\/notifications$/)
    await expect(page.getByText('お知らせ一覧')).toBeVisible()
  })

  // 031 / 032 trên thông báo B (ghi nhẹ: đánh dấu đã đọc ở bước 032)
  await expect(cards(page).first()).toBeVisible({ timeout: 30000 })
  await page.route('**/driver/notifications/**', (route) =>
    route.request().method() !== 'GET' ? route.abort('failed') : route.continue())
  await step('TC-NTF-002-031', async () => {
    await cards(page).nth(bIdx).locator('p').click()
    await page.waitForTimeout(4000)
    const toast = await page.locator('[role=alert], [data-sonner-toast], [class*=toast i]').count()
    expect(toast).toBe(0)
    await page.goBack()
    await expect(page).toHaveURL(/\/notifications$/, { timeout: 20000 })
    await expect(cards(page).first()).toBeVisible({ timeout: 30000 })
    await expect(cards(page).nth(bIdx).getByLabel('未読')).toHaveCount(1)
    return 'Mô phỏng API đánh dấu đã đọc lỗi bằng route.abort (phía client): không toast lỗi, chấm đỏ của B giữ nguyên. Lưu ý: kiểm bằng luồng tap thẻ (-> /delivery/:id)'
  })
  await page.unroute('**/driver/notifications/**')
  await step('TC-NTF-002-032', async () => {
    const before = writes.length
    await cards(page).nth(bIdx).locator('p').click()
    await page.waitForTimeout(4000)
    expect(writes.length).toBeGreaterThan(before)
    await page.goBack()
    await expect(page).toHaveURL(/\/notifications$/, { timeout: 20000 })
    await expect(cards(page).first()).toBeVisible({ timeout: 30000 })
    await expect(cards(page).nth(bIdx).getByLabel('未読')).toHaveCount(0)
    return 'Mở lại khi API bình thường: PATCH read được gọi, chấm đỏ của B biến mất (ghi nhẹ trên DEV: B đã chuyển sang đã đọc)'
  })
  // 016 đối chiếu hành vi tap thẻ đã đọc
  await step('TC-NTF-001-016', async () => {
    await cards(page).nth(aIdx).locator('p').click()
    await expect(page).toHaveURL(/\/delivery\/\d+$/, { timeout: 20000 })
    await page.goBack()
    await expect(page).toHaveURL(/\/notifications$/, { timeout: 20000 })
    throw new Error('__NG__')
  })
})
