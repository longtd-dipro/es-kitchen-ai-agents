// Recon 2 — chi tiết tìm arrow nav, expand, month picker, weekly grid
const { open } = require('../_helpers/session.js')
const path = require('path')

const REPORT_DIR = path.resolve(__dirname, '../../../reports/e05/schedule')

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function main() {
  const { browser, page } = await open()

  // 1. Schedule page - tìm nút < >
  await page.goto('/schedule')
  await sleep(800)

  console.log('=== ALL BUTTONS with details ===')
  const allBtns = await page.locator('button').all()
  for (let i = 0; i < allBtns.length; i++) {
    const btn = allBtns[i]
    const text = await btn.textContent()
    const ariaLabel = await btn.getAttribute('aria-label')
    const title = await btn.getAttribute('title')
    const cls = await btn.getAttribute('class')
    if (!text?.trim() || text.trim().length < 3) {
      // short buttons - likely icons
      const innerHTML = await btn.innerHTML()
      console.log(`Btn[${i}]: text='${text?.trim()}' aria='${ariaLabel}' title='${title}' html_len=${innerHTML.length} cls_start='${cls?.substring(0,60)}'`)
    }
  }

  // 2. Check month input / datepicker
  const monthInput = page.locator('input[placeholder="月を選択"]')
  const monthBox = await monthInput.boundingBox()
  console.log('\nMonth input bbox:', monthBox)
  await monthInput.click()
  await sleep(500)
  await page.screenshot({ path: path.join(REPORT_DIR, 'recon2_01_datepicker_open.png') })
  const pickerPopup = await page.locator('[role="dialog"], .ant-picker-dropdown, [class*="picker"]').count()
  console.log('Picker popup count:', pickerPopup)
  const pickerText = await page.locator('body').textContent()
  console.log('Body after picker click (snippet):', pickerText.substring(pickerText.indexOf('月を選択') - 10, pickerText.indexOf('月を選択') + 200))

  // Get current year/month shown
  const headerText = await page.locator('[class*="picker-header"], [class*="calendar-header"]').first().textContent().catch(() => 'N/A')
  console.log('Picker header:', headerText)

  // 3. Press Escape to close picker
  await page.keyboard.press('Escape')
  await sleep(300)

  // 4. Look for expand button
  console.log('\n=== LOOKING FOR EXPAND ===')
  // Button with down arrow icon - check all short-text buttons
  for (let i = 0; i < Math.min(allBtns.length, 20); i++) {
    const btn = allBtns[i]
    const innerHTML = await btn.innerHTML()
    if (innerHTML.includes('svg') || innerHTML.includes('path')) {
      const ariaLabel = await btn.getAttribute('aria-label')
      const cls = await btn.getAttribute('class')
      console.log(`Btn[${i}] has SVG: aria='${ariaLabel}' cls='${cls?.substring(0,80)}'`)
    }
  }

  // 5. Check page layout for expand section
  const expandArea = await page.locator('[class*="expand"], [class*="collapse"], [class*="filter"]').count()
  console.log('\nExpand/filter areas:', expandArea)

  // 6. Check current month display
  const currentMonth = await page.locator('input[placeholder="月を選択"]').inputValue()
  console.log('\nCurrent month value:', currentMonth)

  // 7. Navigate to weekly and explore
  await page.goto('/schedule?view=week&date=2026-10-09')
  await sleep(800)
  await page.screenshot({ path: path.join(REPORT_DIR, 'recon2_02_weekly.png'), fullPage: true })

  const weeklyBody = await page.locator('body').textContent()
  console.log('\n=== WEEKLY BODY (2000 chars):', weeklyBody.substring(0, 2000))

  // 8. Weekly buttons
  console.log('\n=== WEEKLY BUTTONS ===')
  const weekBtns = await page.locator('button').all()
  for (let i = 0; i < Math.min(weekBtns.length, 30); i++) {
    const btn = weekBtns[i]
    const text = await btn.textContent()
    console.log(`WeekBtn[${i}]: '${text?.trim().substring(0, 60)}'`)
  }

  // 9. Weekly inputs
  const weekInputs = await page.locator('input').all()
  console.log('\n=== WEEKLY INPUTS ===')
  for (const inp of weekInputs) {
    const ph = await inp.getAttribute('placeholder')
    const val = await inp.inputValue()
    console.log('  Input placeholder:', ph, 'value:', val)
  }

  // 10. Check weekly row structure
  const rows = await page.locator('[class*="row"], tr, [role="row"]').count()
  console.log('\nWeekly rows:', rows)

  // 11. Check if there are delivery items visible
  const deliveryItems = await page.locator('[class*="delivery"], [class*="order"], [class*="schedule"]').count()
  console.log('Delivery item divs:', deliveryItems)

  // 12. Check OW_SCHD_002 URL structure - navigate to past date with data
  await page.goto('/schedule?view=week&date=2025-01-08')
  await sleep(1000)
  await page.screenshot({ path: path.join(REPORT_DIR, 'recon2_03_weekly_jan2025.png'), fullPage: true })
  const weekJanBody = await page.locator('body').textContent()
  console.log('\n=== WEEKLY JAN 2025 (1500 chars):', weekJanBody.substring(0, 1500))

  // 13. Check expand button SVG content more carefully on monthly
  await page.goto('/schedule')
  await sleep(500)

  // Find button with size-8 (from recon1: `flex size-8 shrink-0 cursor-pointer`)
  const size8Btn = page.locator('button[class*="size-8"]')
  const size8Count = await size8Btn.count()
  console.log('\nSize-8 buttons count:', size8Count)
  for (let i = 0; i < size8Count; i++) {
    const btn = size8Btn.nth(i)
    const cls = await btn.getAttribute('class')
    const text = await btn.textContent()
    const innerHTML = await btn.innerHTML()
    console.log(`  Size8Btn[${i}]: text='${text?.trim()}' cls='${cls}' html_len=${innerHTML.length}`)
  }

  // 14. Get all SVG buttons more carefully
  const allBtns2 = await page.locator('button').all()
  for (let i = 0; i < allBtns2.length; i++) {
    const btn = allBtns2[i]
    const cls = await btn.getAttribute('class') || ''
    // Only log non-day, non-main buttons
    if (!cls.includes('flex flex-col') && i < 20) {
      const text = await btn.textContent()
      const ariaLabel = await btn.getAttribute('aria-label')
      const innerHTML = await btn.innerHTML()
      console.log(`Btn2[${i}]: text='${text?.trim().substring(0,30)}' aria='${ariaLabel}' html=${innerHTML.substring(0,100)}`)
    }
  }

  await browser.close()
  console.log('\nRecon2 complete')
}

main().catch(err => {
  console.error('Recon2 error:', err)
  process.exit(1)
})
