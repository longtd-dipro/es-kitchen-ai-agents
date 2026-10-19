// Recon5 — calendar navigation, find data in any month, check driver detail
// Run: node e2e/web-outsource/collection/recon5.js
'use strict'
const { open } = require('../_helpers/session.js')
const path = require('path')
const fs = require('fs')

const SHOT = path.resolve(__dirname, '../../../reports/e05/collection')
fs.mkdirSync(SHOT, { recursive: true })

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }
async function snap(page, name) {
  const p = path.join(SHOT, `recon5_${name}.png`)
  await page.screenshot({ path: p, fullPage: true })
  return p
}

// Navigate to target month in ant picker (negative=prev months, positive=next)
async function navigateMonths(page, months) {
  const btnSel = months < 0 ? '.ant-picker-prev-icon, button[class*="prev-btn"]' : '.ant-picker-next-icon, button[class*="next-btn"]'
  const n = Math.abs(months)
  for (let i = 0; i < n; i++) {
    // Click prev/next month button in the left panel
    const btn = page.locator('.ant-picker-dropdown .ant-picker-header-prev-btn').first()
    const count = await btn.count()
    if (count === 0) {
      // Try super-prev
      await page.locator('.ant-picker-dropdown button').filter({ has: page.locator('.ant-picker-prev-icon') }).first().click().catch(() => {})
    } else {
      await btn.click()
    }
    await sleep(200)
  }
}

// Select a range in ant date range picker: clicks start date, then end date
// Params: startYYYYMMDD, endYYYYMMDD (same or adjacent months only; handles same month case)
async function selectRange(page, startYear, startMonth, startDay, endYear, endMonth, endDay) {
  const startInput = page.locator('input[placeholder="開始日"]')

  // Click on start input to open picker
  await startInput.click()
  await sleep(600)

  const dpOpen = await page.locator('.ant-picker-dropdown').isVisible().catch(() => false)
  if (!dpOpen) { console.log('DP not open!'); return false }

  // Get current displayed month
  const headerTexts = await page.locator('.ant-picker-dropdown .ant-picker-header-view').allTextContents()
  console.log('Current headers:', headerTexts)

  // The left panel shows current month, right panel shows next month
  // We need to navigate to reach the start month
  // Parse current year/month from header (format: "2026年10月")
  const leftHeader = headerTexts[0] || ''
  const m = leftHeader.match(/(\d{4})年(\d{1,2})月/)
  if (!m) { console.log('Cannot parse header:', leftHeader); return false }

  const currentYear = parseInt(m[1])
  const currentMonth = parseInt(m[2])

  const targetStart = startYear * 12 + startMonth
  const current = currentYear * 12 + currentMonth
  const diff = targetStart - current

  console.log(`Navigate ${diff} months from ${currentYear}/${currentMonth} to ${startYear}/${startMonth}`)

  if (diff < 0) {
    // Go back
    for (let i = 0; i < Math.abs(diff); i++) {
      await page.locator('.ant-picker-dropdown .ant-picker-header-prev-btn').first().click()
      await sleep(200)
    }
  } else if (diff > 0) {
    for (let i = 0; i < diff; i++) {
      await page.locator('.ant-picker-dropdown .ant-picker-header-next-btn').first().click()
      await sleep(200)
    }
  }

  await sleep(300)
  const headerTexts2 = await page.locator('.ant-picker-dropdown .ant-picker-header-view').allTextContents()
  console.log('After navigation headers:', headerTexts2)

  // Click start day - find cell by text and not disabled
  // Cells in left panel (first table)
  const leftCells = page.locator('.ant-picker-dropdown .ant-picker-panel').first().locator('.ant-picker-cell')
  const allLeftCells = await leftCells.all()
  let startClicked = false
  for (const cell of allLeftCells) {
    const inner = await cell.locator('.ant-picker-cell-inner').textContent().catch(() => null)
    const isDisabled = await cell.getAttribute('class').then(c => c?.includes('disabled'))
    const inMonth = await cell.getAttribute('class').then(c => c?.includes('ant-picker-cell-in-view'))
    if (inner?.trim() === String(startDay) && inMonth && !isDisabled) {
      await cell.locator('.ant-picker-cell-inner').click()
      startClicked = true
      console.log('Clicked start day:', startDay)
      break
    }
  }

  if (!startClicked) {
    console.log('Could not click start day', startDay)
    await page.keyboard.press('Escape')
    return false
  }

  await sleep(400)

  // Now click end day
  // Navigate to end month if needed
  const headerTexts3 = await page.locator('.ant-picker-dropdown .ant-picker-header-view').allTextContents()
  console.log('Headers after start click:', headerTexts3)

  // Find end day
  const allPanels = page.locator('.ant-picker-dropdown .ant-picker-panel')
  let endClicked = false

  // Try all panels for end day
  for (let pi = 0; pi < 2; pi++) {
    const panel = allPanels.nth(pi)
    const panelCells = panel.locator('.ant-picker-cell')
    const allCells = await panelCells.all()

    for (const cell of allCells) {
      const inner = await cell.locator('.ant-picker-cell-inner').textContent().catch(() => null)
      const inMonth = await cell.getAttribute('class').then(c => c?.includes('ant-picker-cell-in-view'))
      if (inner?.trim() === String(endDay) && inMonth) {
        await cell.locator('.ant-picker-cell-inner').click()
        endClicked = true
        console.log('Clicked end day:', endDay, 'in panel', pi)
        break
      }
    }
    if (endClicked) break
  }

  if (!endClicked) {
    console.log('Could not click end day', endDay)
  }

  await sleep(500)

  const startVal = await startInput.inputValue()
  const endVal = await page.locator('input[placeholder="終了日"]').inputValue()
  console.log('Selected range:', startVal, '-', endVal)

  return { startVal, endVal }
}

async function main() {
  const { browser, page } = await open()
  const out = {}

  try {
    await page.goto('/collection-reports')
    await sleep(1500)

    // Try to select August 2026
    console.log('=== Trying to select August 2026 ===')
    const rangeResult = await selectRange(page, 2026, 8, 1, 2026, 8, 31)
    out.rangeSelectResult = rangeResult
    await snap(page, '01_after_range_select')

    // Check dates
    const startVal = await page.locator('input[placeholder="開始日"]').inputValue()
    const endVal = await page.locator('input[placeholder="終了日"]').inputValue()
    out.selectedDates = { start: startVal, end: endVal }
    console.log('Selected dates:', startVal, '-', endVal)

    // Click search
    const searchBtn = page.locator('button').filter({ hasText: '検' }).first()
    await searchBtn.click()
    await sleep(2000)
    await snap(page, '02_aug_search_result')

    const bodyText = await page.locator('body').textContent()
    out.augBodyText = bodyText?.slice(0, 1500)
    console.log('August body:', bodyText?.slice(0, 1000))

    // Check rows (use specific table row selector to avoid calendar)
    const rows = await page.locator('.ant-table-tbody tr').count()
    out.augTableRows = rows
    console.log('Aug table rows:', rows)

    const sampleRows = []
    for (const row of (await page.locator('.ant-table-tbody tr').all()).slice(0, 5)) {
      const cells = await row.locator('td').allTextContents()
      sampleRows.push(cells.map(c => c.trim().slice(0, 40)))
    }
    out.augSampleRows = sampleRows
    console.log('Aug sample rows:', sampleRows)

    // Check summary values
    const summaryContainers = await page.locator(':has-text("集金合計金額"), :has-text("駐車合計料金")').all()
    for (const s of summaryContainers.slice(0, 4)) {
      const text = await s.textContent()
      if (text && text.trim().length < 100 && (text.includes('集金') || text.includes('駐車'))) {
        out.summaryTexts = (out.summaryTexts || []).concat(text.trim())
      }
    }
    console.log('Summary texts:', out.summaryTexts)

    // Check count text
    // Look for "N件中 M-L件" pattern
    const bodyFull = await page.locator('body').textContent()
    const countMatch = bodyFull?.match(/(\d+)件中\s*(\d+)[−-](\d+)件/)
    out.countMatch = countMatch ? countMatch[0] : null
    console.log('Count match:', out.countMatch)

    // Check links in table (driver names)
    const tableLinks = await page.locator('.ant-table-tbody a').all()
    out.tableLinkCount = tableLinks.length
    if (tableLinks.length > 0) {
      out.driverLinks = []
      for (const link of tableLinks.slice(0, 5)) {
        const text = await link.textContent()
        const href = await link.getAttribute('href')
        out.driverLinks.push({ text: text?.trim(), href })
      }
      console.log('Driver links:', out.driverLinks)
    }

    // Check pagination
    const paginationBody = await page.locator('.ant-pagination').first().textContent().catch(() => null)
    out.paginationText = paginationBody?.trim().slice(0, 100)
    console.log('Pagination:', out.paginationText)

    // Check 件数/ページ dropdown
    const perPageSel = page.locator('.ant-select, select').last()
    const perPageText = await perPageSel.textContent().catch(() => null)
    out.perPageText = perPageText?.trim().slice(0, 50)
    console.log('Per page text:', out.perPageText)

    // Also find per page selector by text
    const perPageAnt = await page.locator('.ant-select-selector').allTextContents()
    out.antSelectTexts = perPageAnt
    console.log('Ant select texts:', perPageAnt)

    await snap(page, '03_aug_fullpage')

    // Now try to click on a driver name link to see where it goes
    if (tableLinks.length > 0) {
      const firstLink = tableLinks[0]
      const driverHref = await firstLink.getAttribute('href')
      await firstLink.click()
      await sleep(2000)
      out.driverDetailUrl = page.url().replace(/https?:\/\/[^/]+/, 'HOST')
      console.log('Driver detail URL:', out.driverDetailUrl)
      await snap(page, '04_driver_detail')

      // Check tabs
      const tabs = await page.locator('[role="tab"], .ant-tabs-tab').allTextContents()
      out.driverDetailTabs = tabs.map(t => t.trim()).filter(Boolean)
      console.log('Driver detail tabs:', out.driverDetailTabs)

      // Check active tab
      const activeTab = await page.locator('.ant-tabs-tab-active, [aria-selected="true"]').textContent().catch(() => null)
      out.activeTab = activeTab?.trim()
      console.log('Active tab:', out.activeTab)

      // Go back
      await page.goBack()
      await sleep(1500)
    }

    // Check what happens when no data (go back to Oct 2026)
    await page.goto('/collection-reports')
    await sleep(1000)
    const emptyBodyText = await page.locator('body').textContent()
    // Check "No data" text
    const hasNoData = emptyBodyText?.includes('No data') || emptyBodyText?.includes('データなし')
    out.octoberHasNoData = hasNoData
    out.octoberBodySnippet = emptyBodyText?.slice(0, 500)
    console.log('Oct 2026 has no data:', hasNoData)

    // Final full page screenshot of Aug
    const rangeResult2 = await selectRange(page, 2026, 8, 1, 2026, 8, 31)
    await searchBtn.click()
    await sleep(2000)
    await snap(page, '05_aug_final')
    const finalRows = await page.locator('.ant-table-tbody tr').count()
    out.finalAugRows = finalRows
    console.log('Final aug rows:', finalRows)

    // Get all row data for Aug
    const allRows = []
    for (const row of await page.locator('.ant-table-tbody tr').all()) {
      const cells = await row.locator('td').allTextContents()
      allRows.push(cells.map(c => c.trim()))
    }
    out.allAugRows = allRows
    console.log('All aug rows:', allRows.slice(0, 10))

  } finally {
    await browser.close()
  }

  const outPath = path.join(SHOT, 'recon5_result.json')
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2))
  console.log('Recon5 done.')
}

main().catch(e => { console.error('RECON5 ERROR:', e.message, e.stack?.slice(0, 300)); process.exit(1) })
