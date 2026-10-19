// Recon6 — calendar navigation with force click for end date
// Run: node e2e/web-outsource/collection/recon6.js
'use strict'
const { open } = require('../_helpers/session.js')
const path = require('path')
const fs = require('fs')

const SHOT = path.resolve(__dirname, '../../../reports/e05/collection')
fs.mkdirSync(SHOT, { recursive: true })

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }
async function snap(page, name) {
  const p = path.join(SHOT, `recon6_${name}.png`)
  await page.screenshot({ path: p, fullPage: true })
  return p
}

// Click a specific day in the ant date range picker
// monthOffset: 0=left panel, 1=right panel
async function clickDay(page, day, useForce = false) {
  // Try all panels
  const allCells = await page.locator('.ant-picker-dropdown .ant-picker-cell-in-view').all()
  for (const cell of allCells) {
    const inner = cell.locator('.ant-picker-cell-inner')
    const text = await inner.textContent().catch(() => null)
    if (text?.trim() === String(day)) {
      if (useForce) {
        await inner.click({ force: true })
      } else {
        await inner.click()
      }
      console.log('Clicked day', day, '(force:', useForce, ')')
      return true
    }
  }
  console.log('Could not find day', day)
  return false
}

async function selectDateRange(page, startYear, startMonth, startDay, endYear, endMonth, endDay) {
  const startInput = page.locator('input[placeholder="開始日"]')

  // Click to open
  await startInput.click()
  await sleep(600)

  const dpOpen = await page.locator('.ant-picker-dropdown').isVisible().catch(() => false)
  if (!dpOpen) { console.log('DP not open'); return false }

  // Navigate to start month
  const headerTexts = await page.locator('.ant-picker-dropdown .ant-picker-header-view').allTextContents()
  const leftHeader = headerTexts[0] || ''
  const m = leftHeader.match(/(\d{4})年(\d{1,2})月/)
  if (!m) { console.log('Cannot parse', leftHeader); return false }

  const currentYear = parseInt(m[1])
  const currentMonth = parseInt(m[2])
  const diff = (startYear * 12 + startMonth) - (currentYear * 12 + currentMonth)

  console.log('Navigate diff:', diff)
  for (let i = 0; i < Math.abs(diff); i++) {
    if (diff < 0) {
      await page.locator('.ant-picker-dropdown .ant-picker-header-prev-btn').first().click()
    } else {
      await page.locator('.ant-picker-dropdown .ant-picker-header-next-btn').first().click()
    }
    await sleep(150)
  }

  await sleep(300)
  await snap(page, '01_calendar_at_start_month')

  // Click start day (force click if needed)
  const startClicked = await clickDay(page, startDay, true)
  if (!startClicked) return false

  await sleep(400)
  await snap(page, '02_after_start_click')

  // Check headers after start click
  const h2 = await page.locator('.ant-picker-dropdown .ant-picker-header-view').allTextContents()
  console.log('Headers after start click:', h2)

  // If end month differs from start month, navigate
  if (endYear !== startYear || endMonth !== startMonth) {
    const leftHeader2 = h2[0] || ''
    const m2 = leftHeader2.match(/(\d{4})年(\d{1,2})月/)
    if (m2) {
      const currYear2 = parseInt(m2[1])
      const currMonth2 = parseInt(m2[2])
      const diff2 = (endYear * 12 + endMonth) - (currYear2 * 12 + currMonth2)
      for (let i = 0; i < Math.abs(diff2); i++) {
        if (diff2 < 0) {
          await page.locator('.ant-picker-dropdown .ant-picker-header-prev-btn').first().click()
        } else {
          await page.locator('.ant-picker-dropdown .ant-picker-header-next-btn').first().click()
        }
        await sleep(150)
      }
      await sleep(300)
    }
  }

  // Click end day (force)
  const endClicked = await clickDay(page, endDay, true)
  if (!endClicked) {
    console.log('Trying end day in second panel...')
    // Try right panel specifically
    const rightCells = await page.locator('.ant-picker-dropdown .ant-picker-panel').last().locator('.ant-picker-cell-in-view').all()
    for (const cell of rightCells) {
      const inner = cell.locator('.ant-picker-cell-inner')
      const text = await inner.textContent().catch(() => null)
      if (text?.trim() === String(endDay)) {
        await inner.click({ force: true })
        console.log('Clicked end day in right panel')
        break
      }
    }
  }

  await sleep(500)
  await snap(page, '03_after_end_click')

  const sv = await startInput.inputValue()
  const ev = await page.locator('input[placeholder="終了日"]').inputValue()
  console.log('Result dates:', sv, '-', ev)
  return { start: sv, end: ev }
}

async function main() {
  const { browser, page } = await open()
  const out = {}

  try {
    await page.goto('/collection-reports')
    await sleep(1500)

    // === Test 1: Select August 2026 ===
    console.log('\n=== SELECT AUGUST 2026 ===')
    const range = await selectDateRange(page, 2026, 8, 1, 2026, 8, 31)
    out.rangeResult = range

    if (!range || !range.start?.includes('2026-08')) {
      console.log('Range select may have failed, trying again...')
      // Try pressing Escape first
      await page.keyboard.press('Escape')
      await sleep(300)
    }

    // Click search regardless
    const searchBtn = page.locator('button').filter({ hasText: '検' }).first()
    await searchBtn.click()
    await sleep(2000)
    await snap(page, '04_aug_search_result')

    const startVal = await page.locator('input[placeholder="開始日"]').inputValue()
    const endVal = await page.locator('input[placeholder="終了日"]').inputValue()
    out.searchedDates = { start: startVal, end: endVal }
    console.log('Searched dates:', startVal, '-', endVal)

    const bodyText = await page.locator('body').textContent()
    const hasNoData = bodyText?.includes('No data') || bodyText?.includes('データなし')
    out.hasNoDataAug = hasNoData
    console.log('No data for Aug:', hasNoData)

    const rows = await page.locator('.ant-table-tbody tr').count()
    out.augRows = rows

    // Get table data
    const allRows = []
    for (const row of await page.locator('.ant-table-tbody tr').all()) {
      const cells = await row.locator('td').allTextContents()
      allRows.push(cells.map(c => c.trim()))
    }
    out.augTableData = allRows
    console.log('Aug table data:', allRows)

    // Check pagination count
    const bodyFull = await page.locator('body').textContent()
    const countM = bodyFull?.match(/(\d+)件中\s*(\d+)[−-](\d+)件/)
    out.countText = countM ? countM[0] : null
    console.log('Count text:', out.countText)

    // Check summary values
    const summaryContainer = page.locator('.ant-card, [class*="summary"], [class*="statistic"]')
    const summaryHTML = await summaryContainer.first().innerHTML().catch(() => null)
    out.summaryHTML = summaryHTML?.slice(0, 300)

    // Get exact summary texts
    const fullBodyNested = await page.locator('body').innerHTML()
    const collSummaryMatch = fullBodyNested?.match(/集金合計金額[^<]*<[^>]*>([^<]+)</)
    out.collSummaryMatch = collSummaryMatch?.[0]?.slice(0, 50)

    // Better: find elements containing money amounts near 集金/駐車
    const moneyElements = await page.locator('[class*="amount"], [class*="value"], [class*="price"]').allTextContents()
    out.moneyElements = moneyElements.slice(0, 10).map(t => t.trim()).filter(Boolean)
    console.log('Money elements:', out.moneyElements)

    // Check pagination element
    const pager = await page.locator('.ant-pagination').first().innerHTML().catch(() => null)
    out.pagerHTML = pager?.slice(0, 500)
    console.log('Pager HTML:', out.pagerHTML)

    // Check per-page select
    const perPage = await page.locator('.ant-select').allTextContents()
    out.antSelectTexts = perPage.map(t => t.trim()).filter(Boolean)
    console.log('Ant select texts:', out.antSelectTexts)

    // Check driver links
    const links = await page.locator('.ant-table-tbody a').all()
    out.driverLinkCount = links.length
    if (links.length > 0) {
      out.driverLinks = []
      for (const link of links.slice(0, 5)) {
        const text = await link.textContent()
        const href = await link.getAttribute('href')
        out.driverLinks.push({ text: text?.trim(), href })
      }
      console.log('Driver links:', out.driverLinks)

      // Click first driver link
      const firstHref = await links[0].getAttribute('href')
      await links[0].click()
      await sleep(2000)
      out.driverDetailUrl = page.url().replace(/https?:\/\/[^/]+/, 'HOST')
      console.log('Driver detail URL:', out.driverDetailUrl)
      await snap(page, '05_driver_detail')

      // Check tabs
      const tabs = await page.locator('[role="tab"], .ant-tabs-tab').allTextContents()
      out.tabs = tabs.map(t => t.trim()).filter(Boolean)
      console.log('Tabs:', out.tabs)

      const activeTab = await page.locator('.ant-tabs-tab-active, [aria-selected="true"]').textContent().catch(() => null)
      out.activeTab = activeTab?.trim()
      console.log('Active tab:', out.activeTab)

      // Back
      await page.goBack()
      await sleep(1500)
    }

    // Try all months from Jan to Dec 2026 to find where data exists
    console.log('\n=== CHECK ALL MONTHS ===')
    out.monthData = {}

    // Reset to collection page
    await page.goto('/collection-reports')
    await sleep(1000)

    // Try each month by clicking search directly (use the already-loaded page)
    // For this check, we'll try to navigate to different months
    for (const month of [8, 9, 10]) { // Try Aug, Sep, Oct
      if (month === 10) {
        await page.goto('/collection-reports')
        await sleep(800)
      } else {
        // Navigate with calendar
        await page.goto('/collection-reports')
        await sleep(800)
        await selectDateRange(page, 2026, month, 1, 2026, month, 28)
        await sleep(200)
        await page.keyboard.press('Escape')
        await sleep(200)
      }

      await searchBtn.click()
      await sleep(1500)

      const b = await page.locator('body').textContent()
      const noData = b?.includes('No data') || b?.includes('データなし')
      const r = await page.locator('.ant-table-tbody tr').count()
      out.monthData[`2026-${String(month).padStart(2,'0')}`] = { noData, rows: r }
      console.log(`Month 2026-${month}:`, { noData, rows: r })
    }

  } finally {
    await browser.close()
  }

  const outPath = path.join(SHOT, 'recon6_result.json')
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2))
  console.log('\nRecon6 done.')
}

main().catch(e => { console.error('RECON6 ERROR:', e.message); process.exit(1) })
