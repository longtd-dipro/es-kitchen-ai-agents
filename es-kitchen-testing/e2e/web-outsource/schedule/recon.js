// Recon script — khám phá UI thực tế của schedule screens
// Chạy: node e2e/web-outsource/schedule/recon.js
const { open } = require('../_helpers/session.js')
const path = require('path')
const fs = require('fs')

const REPORT_DIR = path.resolve(__dirname, '../../../reports/e05/schedule')

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function main() {
  const { browser, page } = await open()

  // 1. Chụp dashboard trước
  await page.screenshot({ path: path.join(REPORT_DIR, 'recon_00_dashboard.png') })
  console.log('Current URL:', page.url())

  // 2. Click sidebar スケジュール
  await sleep(500)
  const snapshot0 = await page.locator('body').textContent()
  console.log('=== SIDEBAR TEXT (first 500):', snapshot0.substring(0, 500))

  // Tìm sidebar items
  const sidebarLinks = await page.locator('aside a, nav a, [role="navigation"] a').all()
  console.log('Sidebar links count:', sidebarLinks.length)
  for (const link of sidebarLinks) {
    const text = await link.textContent()
    const href = await link.getAttribute('href')
    console.log('  Link:', text?.trim(), '->', href)
  }

  // 3. Navigate trực tiếp /schedule
  await page.goto('/schedule')
  await sleep(1000)
  await page.screenshot({ path: path.join(REPORT_DIR, 'recon_01_schedule.png') })
  console.log('Schedule URL:', page.url())

  // 4. Lấy toàn bộ text content của trang
  const bodyText = await page.locator('body').textContent()
  console.log('=== BODY TEXT (first 2000):', bodyText.substring(0, 2000))

  // 5. Tìm tất cả button/input/select
  const buttons = await page.locator('button').all()
  console.log('\n=== BUTTONS ===')
  for (const btn of buttons) {
    const text = await btn.textContent()
    const classes = await btn.getAttribute('class')
    console.log('  Button:', text?.trim().substring(0, 50), '| class:', classes?.substring(0, 50))
  }

  const inputs = await page.locator('input').all()
  console.log('\n=== INPUTS ===')
  for (const inp of inputs) {
    const placeholder = await inp.getAttribute('placeholder')
    const type = await inp.getAttribute('type')
    const name = await inp.getAttribute('name')
    console.log('  Input:', 'type=', type, 'placeholder=', placeholder, 'name=', name)
  }

  const selects = await page.locator('select, [role="combobox"]').all()
  console.log('\n=== SELECTS/COMBOBOX ===')
  for (const sel of selects) {
    const text = await sel.textContent()
    const placeholder = await sel.getAttribute('placeholder')
    console.log('  Select/Combo:', text?.trim().substring(0, 50), 'placeholder:', placeholder)
  }

  // 6. Tìm toggle 月/週
  const toggles = await page.locator('[role="tab"], button').filter({ hasText: /月|週/ }).all()
  console.log('\n=== TOGGLE 月/週 ===')
  for (const t of toggles) {
    const text = await t.textContent()
    const ariaSelected = await t.getAttribute('aria-selected')
    const classes = await t.getAttribute('class')
    console.log('  Toggle:', text?.trim(), '| aria-selected:', ariaSelected, '| class:', classes?.substring(0, 80))
  }

  // 7. Tìm nút điều hướng < > và 今日
  const navButtons = await page.locator('button').filter({ hasText: /＜|＞|今日|<|>/ }).all()
  console.log('\n=== NAV BUTTONS ===')
  for (const btn of navButtons) {
    const text = await btn.textContent()
    console.log('  NavBtn:', text?.trim())
  }

  // 8. Kiểm tra datepicker/year-month selector
  const dateInputs = await page.locator('input[type="date"], input[type="month"], [placeholder*="年"]').all()
  console.log('\n=== DATE INPUTS ===')
  for (const inp of dateInputs) {
    const placeholder = await inp.getAttribute('placeholder')
    const value = await inp.getAttribute('value')
    const type = await inp.getAttribute('type')
    console.log('  DateInput:', 'type=', type, 'placeholder=', placeholder, 'value=', value)
  }

  // 9. Tìm khu vực lưới lịch
  const gridCells = await page.locator('[role="gridcell"], td').count()
  console.log('\n=== GRID CELLS count:', gridCells)

  // 10. Tìm nút mở rộng điều kiện
  const expandBtns = await page.locator('button').all()
  for (const btn of expandBtns) {
    const text = await btn.textContent()
    if (text?.includes('⌄') || text?.includes('⌃') || text?.includes('▼') || text?.includes('▲') || text?.includes('検索') || text?.includes('クリア')) {
      console.log('\n=== EXPAND/SEARCH BTN:', text?.trim().substring(0, 50))
    }
  }

  // 11. Chụp toàn bộ
  await page.screenshot({ path: path.join(REPORT_DIR, 'recon_02_schedule_full.png'), fullPage: true })

  // 12. Thử navigate /schedule/weekly
  await page.goto('/schedule/weekly')
  await sleep(800)
  console.log('\nWeekly URL:', page.url())
  await page.screenshot({ path: path.join(REPORT_DIR, 'recon_03_weekly.png') })

  // 13. Check weekly page content
  const weeklyText = await page.locator('body').textContent()
  console.log('=== WEEKLY BODY (first 1000):', weeklyText.substring(0, 1000))

  // 14. Back to schedule and check week toggle
  await page.goto('/schedule')
  await sleep(800)
  const weekToggle = await page.locator('button, [role="tab"]').filter({ hasText: '週' }).first()
  if (await weekToggle.count() > 0) {
    await weekToggle.click()
    await sleep(800)
    console.log('\nAfter 週 toggle click URL:', page.url())
    await page.screenshot({ path: path.join(REPORT_DIR, 'recon_04_after_week_toggle.png') })
  }

  // 15. Chụp URL structure
  console.log('\n=== FINAL URLS EXPLORED ===')
  console.log('  /schedule ->', 'monthly calendar')
  console.log('  /schedule/weekly ->', 'weekly calendar')

  await browser.close()
  console.log('\nRecon complete. Screenshots in:', REPORT_DIR)
}

main().catch(err => {
  console.error('Recon error:', err.message)
  process.exit(1)
})
