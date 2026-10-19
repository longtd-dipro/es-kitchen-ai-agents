// Recon 3 — expand section details + home shortcuts + weekly delivery rows
const { open } = require('../_helpers/session.js')
const path = require('path')

const REPORT_DIR = path.resolve(__dirname, '../../../reports/e05/schedule')
async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function main() {
  const { browser, page } = await open()

  // 1. Home page - look for schedule shortcuts
  await page.goto('/dashboard')
  await sleep(800)
  await page.screenshot({ path: path.join(REPORT_DIR, 'recon3_00_home.png'), fullPage: true })
  const homeLinks = await page.locator('a').all()
  console.log('=== HOME LINKS ===')
  for (const link of homeLinks) {
    const text = await link.textContent()
    const href = await link.getAttribute('href')
    if (text?.includes('スケジュール') || text?.includes('月') || text?.includes('週') || href?.includes('schedule')) {
      console.log('  Link:', text?.trim().substring(0, 60), '->', href)
    }
  }

  // 2. Schedule monthly - click expand button
  await page.goto('/schedule')
  await sleep(800)
  const expandBtn = page.locator('button[aria-label="詳細条件を開く"]')
  const expandCount = await expandBtn.count()
  console.log('\nExpand btn count:', expandCount)

  if (expandCount > 0) {
    await expandBtn.click()
    await sleep(500)
    await page.screenshot({ path: path.join(REPORT_DIR, 'recon3_01_expanded.png') })
    const expandedBody = await page.locator('body').textContent()
    console.log('=== BODY AFTER EXPAND (3000):', expandedBody.substring(0, 3000))

    // Find new inputs/selects after expand
    const expandedInputs = await page.locator('input, select, [role="combobox"]').all()
    console.log('\n=== INPUTS AFTER EXPAND ===')
    for (const inp of expandedInputs) {
      const ph = await inp.getAttribute('placeholder')
      const role = await inp.getAttribute('role')
      const name = await inp.getAttribute('name')
      const val = await inp.inputValue().catch(() => '')
      console.log('  Input/Select: role=', role, 'name=', name, 'ph=', ph, 'val=', val)
    }

    // Check new aria-label on expand button (should change to 詳細条件を閉じる)
    const allBtns = await page.locator('button').all()
    for (let i = 0; i < 15; i++) {
      const btn = allBtns[i]
      const aria = await btn.getAttribute('aria-label')
      const text = await btn.textContent()
      if (aria || !text?.trim()) {
        console.log(`Btn[${i}] aria='${aria}' text='${text?.trim()}'`)
      }
    }

    // Check dropdowns/selects for temperature, status, etc.
    const selects = await page.locator('[role="listbox"], [class*="select"], [class*="dropdown"]').count()
    console.log('\nListbox/select/dropdown count:', selects)

    const antSelects = await page.locator('.ant-select').all()
    console.log('\n=== ANT SELECTS ===')
    for (const sel of antSelects) {
      const text = await sel.textContent()
      const placeholder = await sel.locator('.ant-select-selection-placeholder').textContent().catch(() => '')
      console.log('  AntSelect placeholder:', placeholder, 'text:', text?.trim().substring(0, 60))
    }
  }

  // 3. Weekly view - find delivery row structure
  await page.goto('/schedule?view=week&date=2026-10-05')
  await sleep(1000)
  await page.screenshot({ path: path.join(REPORT_DIR, 'recon3_02_weekly_current.png'), fullPage: true })

  // Find all clickable rows in weekly
  const weeklyRows = await page.locator('[class*="cursor-pointer"]:not(button)').all()
  console.log('\n=== WEEKLY CLICKABLE ITEMS ===')
  for (let i = 0; i < Math.min(weeklyRows.length, 10); i++) {
    const item = weeklyRows[i]
    const text = await item.textContent()
    const cls = await item.getAttribute('class')
    console.log(`  Row[${i}]: text='${text?.trim().substring(0, 60)}' cls='${cls?.substring(0, 80)}'`)
  }

  // Find delivery items with icons
  const allElements = await page.locator('body *').filter({ hasText: /❄|🗄|📦|冷凍|冷蔵|資材/ }).all()
  console.log('\n=== DELIVERY TYPE ELEMENTS ===')
  for (let i = 0; i < Math.min(allElements.length, 10); i++) {
    const el = allElements[i]
    const tag = await el.evaluate(e => e.tagName)
    const text = await el.textContent()
    console.log(`  ${tag}: ${text?.trim().substring(0, 80)}`)
  }

  // 4. Weekly header - check date display
  const weeklyHeaders = await page.locator('th, [class*="header"]').all()
  console.log('\n=== WEEKLY HEADERS ===')
  for (let i = 0; i < Math.min(weeklyHeaders.length, 15); i++) {
    const h = weeklyHeaders[i]
    const text = await h.textContent()
    if (text?.trim()) {
      console.log(`  Header: '${text?.trim().substring(0, 50)}'`)
    }
  }

  // 5. Check monthly day today marker
  await page.goto('/schedule')
  await sleep(800)
  // Today is Oct 9, 2026
  const todayBtn = await page.locator('button').filter({ hasText: /^9$/ }).all()
  console.log('\n=== BUTTONS WITH TEXT "9" ===')
  for (const btn of todayBtn) {
    const cls = await btn.getAttribute('class')
    console.log('  Btn9 class:', cls)
  }

  // 6. Check month picker interaction - click and navigate to 2025/01
  const monthInput = page.locator('input[placeholder="月を選択"]')
  await monthInput.click()
  await sleep(500)

  // Look for year navigation in picker
  const pickerPanel = page.locator('.ant-picker-panel, [class*="picker-panel"]')
  const pickerCount = await pickerPanel.count()
  console.log('\nPicker panel count:', pickerCount)

  const pickerHeader = page.locator('.ant-picker-header, [class*="picker-header"]')
  const pickerHeaderText = await pickerHeader.first().textContent().catch(() => 'N/A')
  console.log('Picker header text:', pickerHeaderText)

  const pickerBtns = await page.locator('.ant-picker-header button').all()
  console.log('Picker header buttons:')
  for (const btn of pickerBtns) {
    const text = await btn.textContent()
    const aria = await btn.getAttribute('aria-label')
    console.log('  Picker btn:', text?.trim(), 'aria:', aria)
  }

  await page.keyboard.press('Escape')
  await sleep(300)

  // 7. Check how many day buttons and their text for today
  // Today = 9 Oct 2026, so check cell for 9
  const allDayBtns = await page.locator('button[class*="flex flex-col gap"]').all()
  console.log('\nDay buttons count:', allDayBtns.length)
  // Check day 9 (today)
  for (const btn of allDayBtns) {
    const text = await btn.textContent()
    if (text?.trim().startsWith('9') || text?.trim() === '9') {
      const cls = await btn.getAttribute('class')
      console.log('  Day 9 class:', cls?.substring(0, 150))
      break
    }
  }

  // 8. Check sidebar navigation - find スケジュール link
  const sidebarItems = await page.locator('aside a, nav li, aside li, [class*="nav"] a, [class*="sidebar"] a').all()
  console.log('\n=== SIDEBAR ITEMS ===')
  for (const item of sidebarItems) {
    const text = await item.textContent()
    const href = await item.getAttribute('href')
    const tagName = await item.evaluate(e => e.tagName)
    console.log(`  ${tagName}: '${text?.trim().substring(0, 50)}' href='${href}'`)
  }

  // Also check sidebar with non-link clicks
  const sidebarDivs = await page.locator('[class*="sidebar"] [class*="cursor"], aside [class*="cursor"]').all()
  console.log('\n=== SIDEBAR CLICKABLE ITEMS ===')
  for (let i = 0; i < Math.min(sidebarDivs.length, 15); i++) {
    const div = sidebarDivs[i]
    const text = await div.textContent()
    const cls = await div.getAttribute('class')
    console.log(`  Div: '${text?.trim().substring(0, 50)}' cls='${cls?.substring(0, 60)}'`)
  }

  await browser.close()
  console.log('\nRecon3 complete')
}

main().catch(err => {
  console.error('Recon3 error:', err)
  process.exit(1)
})
