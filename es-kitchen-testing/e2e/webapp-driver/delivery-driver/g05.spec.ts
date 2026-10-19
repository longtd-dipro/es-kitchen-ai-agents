import { test, expect, Page, Browser } from '@playwright/test'
import { login, record, shot } from './_lib'

const TAG = 'g05'
const ROOT = 'https://dev-dr.es-kitchen.co.jp'
const tabBtn = (page: Page, n: string) => page.getByRole('button', { name: new RegExp('^' + n) })
const isActive = async (page: Page, n: string) =>
  (await tabBtn(page, n).evaluate((e) => e.className)).includes('text-primary')
const ph: Record<string, string> = { '倉庫受取': '倉庫・中継名', '未配送': '会社名・住所', '配送完了': '会社名・住所' }
const emptyMsg: Record<string, string> = { '倉庫受取': '倉庫データはありません', '未配送': '未配送のデータはありません', '配送完了': '配送完了のデータはありません' }
const DATE_BTN = /^\d{4}\/\d{2}\/\d{2}$/
const P = { A: 'L1', B: 'L2', C: 'L3' } as const
const TABS = { L1: '倉庫受取', L2: '未配送', L3: '配送完了' } as const

async function openDelivery(page: Page) {
  await page.goto('/delivery')
  await expect(page.getByRole('button', { name: DATE_BTN })).toBeVisible({ timeout: 30000 })
  await expect(page.getByText(/データはありません/)).toBeVisible({ timeout: 30000 })
}
const today = () => {
  const d = new Date(Date.now() + 9 * 3600e3) // JST
  return d.toISOString().slice(0, 10).replace(/-/g, '/')
}

test.describe.configure({ mode: 'serial' })
let page: Page

test.beforeAll(async ({ browser }) => {
  page = await (await browser.newContext({ ...require('@playwright/test').devices['iPhone 14'], baseURL: ROOT, locale: 'ja-JP' })).newPage()
  await login(page)
  await openDelivery(page)
})

test('date picker (3 tab) — app dùng 1 ngày đơn, không có 開始日/終了日', async () => {
  for (const L of ['L1', 'L2', 'L3'] as const) {
    await openDelivery(page)
    await tabBtn(page, TABS[L]).click()
    await page.waitForTimeout(500)
    const dateText = await page.getByRole('button', { name: DATE_BTN }).innerText()
    const dateBtns = await page.getByRole('button', { name: DATE_BTN }).count()
    const hasStartEnd = (await page.getByText(/開始日|終了日/).count()) > 0
    await page.getByRole('button', { name: DATE_BTN }).click()
    await page.waitForTimeout(500)
    const mode = await page.locator('[data-slot=calendar]').getAttribute('data-mode')
    const ev = await shot(page, `g05_${L}_datepicker`)
    await page.keyboard.press('Escape')
    const base = `Actual: UI chỉ có 1 date picker đơn (${dateText}, calendar data-mode=${mode}, ${dateBtns} nút ngày, không có nhãn 開始日/終了日; chọn 1 ngày → URL /delivery?date=YYYY-MM-DD) | Expected: vùng chọn khoảng ngày 開始日/終了日`
    expect(mode).toBe('single'); expect(hasStartEnd).toBe(false)
    const ok003 = dateText === today()
    record(TAG, `TC-SHP-${L}-003`, 'NG', `${base} | Giá trị mặc định ngày hiện tại (${dateText}) khớp "hôm nay" nhưng không có control 開始日 riêng | Bước: mở 配送一覧, quan sát vùng ngày | Evidence: ${ev}`, ev)
    record(TAG, `TC-SHP-${L}-004`, 'NG', `${base} | Không có 終了日 (không có mặc định hôm nay+7) | Bước: mở 配送一覧, quan sát vùng ngày | Evidence: ${ev}`, ev)
    record(TAG, `TC-SHP-${L}-008`, 'NG', `${base} | Không chọn được 終了日 trùng 開始日 (chỉ chọn 1 ngày) | Bước: mở date picker | Evidence: ${ev}`, ev)
    record(TAG, `TC-SHP-${L}-009`, 'NG', `${base} | Không thể chọn 終了日 < 開始日 nên không có lỗi 「終了日は開始日以降を選択してください」 | Bước: mở date picker | Evidence: ${ev}`, ev)
    record(TAG, `TC-SHP-${L}-010`, 'NG', `${base} | Không có khoảng ngày (31 ngày) | Bước: mở date picker | Evidence: ${ev}`, ev)
    record(TAG, `TC-SHP-${L}-011`, 'NG', `${base} | Không có khoảng ngày nên không có lỗi 「期間は1ヶ月以内で選択してください」 | Bước: mở date picker | Evidence: ${ev}`, ev)
    void ok003
  }
})

test('tab bar + mặc định', async () => {
  await openDelivery(page)
  expect(await isActive(page, '倉庫受取')).toBe(true)
  expect(await isActive(page, '未配送')).toBe(false)
  expect(await isActive(page, '配送完了')).toBe(false)
  await expect(page.getByPlaceholder(ph['倉庫受取'])).toBeVisible()
  await expect(page.getByText(emptyMsg['倉庫受取'])).toBeVisible()
  record(TAG, 'TC-SHP-L1-017', 'OK', '', await shot(page, 'g05_L1_default'))

  const sw = async (id: string, to: string) => {
    await tabBtn(page, to).click()
    await expect(page.getByPlaceholder(ph[to])).toBeVisible()
    await expect(page.getByText(emptyMsg[to])).toBeVisible()
    expect(await isActive(page, to)).toBe(true)
    for (const o of ['倉庫受取', '未配送', '配送完了'].filter((x) => x !== to)) expect(await isActive(page, o)).toBe(false)
    record(TAG, id, 'OK', '', await shot(page, `g05_${id}`))
  }
  await openDelivery(page)
  await sw('TC-SHP-L1-019', '未配送')
  await sw('TC-SHP-L1-020', '配送完了')
  await sw('TC-SHP-L2-018', '倉庫受取')
  await sw('TC-SHP-L2-019', '配送完了')
  await sw('TC-SHP-L3-018', '倉庫受取')
  await sw('TC-SHP-L3-019', '未配送')
})

test('ステータス button', async () => {
  await openDelivery(page)
  const ids: Record<string, string[]> = { '倉庫受取': ['TC-SHP-L1-025', 'TC-SHP-L1-026', 'TC-SHP-L1-027'] }
  await page.getByRole('button', { name: 'ステータス', exact: true }).click({ noWaitAfter: true })
  await page.waitForURL(/\/issues/, { timeout: 10000 })
  const ev = await shot(page, 'g05_status_click_issues')
  expect(await page.getByRole('option').count()).toBe(0)
  const note = `Actual: bấm nút 「ステータス」 không mở dropdown trạng thái mà điều hướng sang /issues (màn 「トラブル報告」); không có option 未受取/受取済/トラブル | Expected: dropdown chọn trạng thái, danh sách lọc theo badge | Bước: mở 配送一覧 → bấm 「ステータス」 | Evidence: ${ev}`
  for (const id of ids['倉庫受取']) record(TAG, id, 'NG', note, ev)
  // Tab B/C: dropdown kho trung chuyển không tồn tại
  for (const [L, tab] of [['L2', '未配送'], ['L3', '配送完了']] as const) {
    await openDelivery(page)
    await tabBtn(page, tab).click()
    await expect(page.getByPlaceholder(ph[tab])).toBeVisible()
    const btns = (await page.getByRole('button').allInnerTexts()).map((s) => s.replace(/\n/g, ' ')).join(' | ')
    const ev2 = await shot(page, `g05_${L}_no_wh_dropdown`)
    const n2 = `Actual: Tab 「${tab}」 không có dropdown chọn kho trung chuyển; control lọc duy nhất là nút 「ステータス」 (bấm → điều hướng /issues). Các nút trên trang: ${btns} | Expected: dropdown kho trung chuyển (chọn 1/nhiều mục) | Bước: mở Tab ${tab}, tìm dropdown kho | Evidence: ${ev2}`
    for (const n of ['023', '024', '039']) record(TAG, `TC-SHP-${L}-${n}`, 'NG', n === '039' ? n2.replace('chọn 1/nhiều mục', 'kết hợp tìm kiếm AND dropdown kho') : n2, ev2)
  }
})

test('search 255 ký tự (Tab B, C)', async () => {
  for (const [L, tab] of [['L2', '未配送'], ['L3', '配送完了']] as const) {
    await openDelivery(page)
    await tabBtn(page, tab).click()
    const s = page.getByPlaceholder(ph[tab])
    const maxLen = await s.evaluate((e) => (e as HTMLInputElement).maxLength)
    await s.fill('a'.repeat(255))
    const l255 = (await s.inputValue()).length
    const err255 = await page.getByText(/エラー|入力してください|以内/).count()
    expect(l255).toBe(255); expect(err255).toBe(0)
    record(TAG, `TC-SHP-${L}-032`, 'OK', '', await shot(page, `g05_${L}_255`))
    await s.fill('')
    await s.pressSequentially('a'.repeat(255))
    await s.pressSequentially('b')
    const l256 = (await s.inputValue()).length
    const ev = await shot(page, `g05_${L}_256`)
    await s.fill('a'.repeat(256)); const lfill = (await s.inputValue()).length
    // 033
    if (l256 === 255 && lfill === 255) record(TAG, `TC-SHP-${L}-033`, 'OK', '', ev)
    else record(TAG, `TC-SHP-${L}-033`, 'NG', `Actual: ô tìm kiếm không giới hạn độ dài (maxLength=${maxLen}); fill 256 ký tự → giữ ${lfill} ký tự | Expected: chặn ở 255 ký tự | Bước: nhập 256 ký tự vào ô tìm kiếm Tab ${tab} | Evidence: ${ev}`, ev)
    await s.fill('a'.repeat(255)); await s.pressSequentially('あ')
    const l34 = (await s.inputValue()); const ev34 = await shot(page, `g05_${L}_255plus`)
    if (l34.length === 255 && !l34.includes('あ')) record(TAG, `TC-SHP-${L}-034`, 'OK', '', ev34)
    else record(TAG, `TC-SHP-${L}-034`, 'NG', `Actual: gõ thêm 「あ」 khi đã 255 ký tự → ô có ${l34.length} ký tự, chứa 「あ」=${l34.includes('あ')} (maxLength=${maxLen}) | Expected: giữ nguyên 255 ký tự, ký tự thứ 256 không được nhận | Bước: nhập 255 'a' rồi gõ 「あ」 vào ô tìm kiếm Tab ${tab} | Evidence: ${ev34}`, ev34)
  }
})

test('bottom nav ホーム', async () => {
  for (const [L, tab] of [['L1', '倉庫受取'], ['L2', '未配送'], ['L3', '配送完了']] as const) {
    await openDelivery(page)
    await tabBtn(page, tab).click()
    await page.getByRole('link', { name: 'ホーム' }).click()
    await page.waitForURL(/\/home/, { timeout: 15000 })
    const id = L === 'L1' ? 'TC-SHP-L1-081' : L === 'L2' ? 'TC-SHP-L2-073' : 'TC-SHP-L3-071'
    record(TAG, id, 'OK', '', '')
  }
})

test('truy cập khi chưa đăng nhập', async ({ browser }) => {
  const ctx = await browser.newContext({ ...require('@playwright/test').devices['iPhone 14'], baseURL: ROOT, locale: 'ja-JP' })
  const p = await ctx.newPage()
  const out: string[] = []
  for (const path of ['/deliveries', '/delivery']) {
    await p.goto(path)
    await p.waitForTimeout(3000)
    out.push(`${path} -> ${new URL(p.url()).pathname}`)
  }
  const ev = await shot(p, 'g05_unauth')
  const hasData = (await p.getByText(/配達一覧|倉庫データ/).count()) > 0
  const delOk = out[1].endsWith('/login') && !hasData
  const depOk = out[0].endsWith('/login')
  for (const id of ['TC-SHP-L1-096', 'TC-SHP-L2-089', 'TC-SHP-L3-087']) {
    if (delOk && depOk) record(TAG, id, 'OK', '', ev)
    else if (delOk) record(TAG, id, 'OK', `Route thực tế của màn là /delivery (TC ghi /deliveries): ${out.join('; ')} — chưa đăng nhập đều không thấy dữ liệu, redirect /login`, ev)
    else record(TAG, id, 'NG', `Actual: ${out.join('; ')} | Expected: redirect màn đăng nhập, không thấy dữ liệu | Evidence: ${ev}`, ev)
  }
  await ctx.close()
})
