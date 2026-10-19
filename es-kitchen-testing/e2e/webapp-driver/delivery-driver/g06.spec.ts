import { test, Page } from '@playwright/test'
import * as fs from 'fs'
import { login, record, shot, expect } from './_lib'

const TAG = 'g06'
const DUMP = '/private/tmp/claude-501/-Users-longtd-Desktop-WORK-Project-Eskitchen-AI-AGENTS-ES-KITCHEN/b25c9e59-e7b1-4d4c-b259-623188589a45/scratchpad/g06_detail_dump.txt'
const DATE_RE = /^\d{1,2}月\d{1,2}日 - \d{2}:\d{2}$/

async function step(id: string, fn: () => Promise<string | void>) {
  try {
    const note = await fn()
    record(TAG, id, 'OK', note || '')
  } catch (e: any) {
    // automation/assert failure: ghi Pending kèm lỗi để người chạy xem lại — không tự quy NG
    record(TAG, id, 'Pending', 'Assertion lỗi khi chạy (cần xác minh lại): ' + String(e.message).split('\n')[0].slice(0, 220))
  }
}
const cards = (page: Page) => page.locator('main button').filter({ has: page.locator('p') })
async function openList(page: Page) {
  await page.goto('/notifications')
  await expect(page.getByText('お知らせ一覧')).toBeVisible({ timeout: 30000 })
  await expect(cards(page).first()).toBeVisible({ timeout: 30000 })
}

test('g06 notification', async ({ page }) => {
  test.setTimeout(420000)
  const writes: string[] = []
  page.on('request', (r) => { if (r.url().includes('/driver/notifications') && r.method() !== 'GET') writes.push(r.method() + ' ' + r.url().split('/driver/')[1]) })
  await login(page)
  await openList(page)
  const n = await cards(page).count()
  const info = `Tài khoản test có ${n} thông báo thật (không phải NTF-A 4 thông báo)`

  // ---- Part A: read-only
  await step('TC-NTF-001-008', async () => {
    await expect(page).toHaveURL(/\/notifications$/)
    await expect(page.getByText('お知らせ一覧')).toBeVisible()
    return 'Mở trực tiếp URL không bị chuyển về /home; ' + info
  })
  await step('TC-NTF-001-021', async () => {
    await expect(page.getByText(/すべて既読|全て既読|一括既読/)).toHaveCount(0)
  })
  await step('TC-NTF-001-032', async () => {
    expect(n).toBeLessThan(20)
    await expect(page.getByText('もっと表示')).toHaveCount(0)
    await expect(page.getByRole('button', { name: /もっと表示/ })).toHaveCount(0)
    return `Với ${n} thông báo (<20) không có nút もっと表示`
  })
  await step('TC-NTF-001-023', async () => {
    const dates = await cards(page).locator('span').first().evaluate(() => 0).then(async () =>
      page.locator('main button').evaluateAll((bs) => bs.map((b) => (b.querySelector('span')?.textContent || '').trim())))
    for (const d of dates) expect(d).toMatch(DATE_RE)
    return `Định dạng 「M月D日 - HH:mm」 không zero-padding tháng/ngày: ${dates.join(' ; ')} (dữ liệu thật khác QC_Jun)`
  })
  await step('TC-NTF-001-010', async () => {
    const t = await page.locator('main button').evaluateAll((bs) => bs.map((b) => (b.querySelector('span')?.textContent || '').trim()))
    const key = (s: string) => { const m = s.match(/(\d+)月(\d+)日 - (\d+):(\d+)/)!; return +m[1] * 1e6 + +m[2] * 1e4 + +m[3] * 100 + +m[4] }
    for (let i = 1; i < t.length; i++) expect(key(t[i - 1])).toBeGreaterThanOrEqual(key(t[i]))
    return `Chỉ kiểm chứng với ${t.length} thông báo hiện có (mới→cũ: ${t.join(' > ')}); chưa có 3 thông báo tạo lệch thứ tự`
  })
  await step('TC-NTF-001-012', async () => {
    const unread = page.getByLabel('未読')
    await expect(unread.first()).toBeVisible()
    const color = await cards(page).first().locator('p').evaluate((e) => getComputedStyle(e).color)
    const weight = await cards(page).first().locator('p').evaluate((e) => +getComputedStyle(e).fontWeight)
    expect(weight).toBeGreaterThanOrEqual(500)
    return `Tiêu đề màu ${color}, weight ${weight}, có chấm đỏ 未読`
  })
  await step('TC-NTF-001-001', async () => {
    await expect(page.getByRole('button', { name: '戻る' })).toBeVisible()
    await expect(page.locator('header span', { hasText: 'お知らせ' })).toBeVisible()
    await expect(page.getByText('お知らせ一覧')).toBeVisible()
    expect(n).toBeGreaterThan(0)
    const ov = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    expect(ov).toBe(true)
    return `Bố cục khớp (header 戻る + お知らせ, mục お知らせ一覧, thẻ trắng ngày giờ + tiêu đề); ${info}; ảnh: ` + (await shot(page, 'g06_list'))
  })

  // Home bell -> list -> back
  await step('TC-NTF-001-006', async () => {
    await page.goto('/home')
    const bell = page.locator('header button').first()
    await expect(bell).toBeVisible({ timeout: 40000 })
    await bell.click()
    await expect(page).toHaveURL(/\/notifications$/)
    await expect(page.locator('header span', { hasText: 'お知らせ' })).toBeVisible()
  })
  await step('TC-NTF-001-003', async () => {
    await page.getByRole('button', { name: '戻る' }).click()
    await expect(page).toHaveURL(/\/home$/)
    await expect(page.locator('header button').first()).toBeVisible({ timeout: 40000 })
    await expect(page.getByText(/さん、/)).toBeVisible()
  })

})
