// Recon3 — explore date picker, search with different periods, check staff page URL
// Run: node e2e/web-outsource/collection/recon3.js
'use strict'
const { open } = require('../_helpers/session.js')
const path = require('path')
const fs = require('fs')

const SHOT = path.resolve(__dirname, '../../../reports/e05/collection')
fs.mkdirSync(SHOT, { recursive: true })

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }
async function snap(page, name) {
  const p = path.join(SHOT, `recon3_${name}.png`)
  await page.screenshot({ path: p, fullPage: true })
  return p
}

async function main() {
  const { browser, page } = await open()
  const out = {}

  try {
    // Navigate to collection page
    await page.goto('/collection-reports')
    await sleep(1500)
    await snap(page, '00_default')

    // Check default state
    const startDate = await page.locator('input[placeholder="開始日"]').inputValue()
    const endDate = await page.locator('input[placeholder="終了日"]').inputValue()
    out.defaultStartDate = startDate
    out.defaultEndDate = endDate
    console.log('Default dates:', startDate, '-', endDate)

    // Check summary values
    const bodyText1 = await page.locator('body').textContent()
    out.defaultBodyText = bodyText1?.slice(0, 1000)
    console.log('Default body:', bodyText1?.slice(0, 500))

    // Try setting dates to 2026/08/01 - 2026/08/31 (August has data)
    // First clear and set start date
    const startInput = page.locator('input[placeholder="開始日"]')
    const endInput = page.locator('input[placeholder="終了日"]')

    // Try fill directly
    await startInput.click()
    await sleep(300)
    await snap(page, '01_startdate_click')

    // Check if a datepicker opens
    const dpVisible = await page.locator('.ant-picker-dropdown, [class*="datepicker"], [class*="calendar"]').isVisible().catch(() => false)
    out.datepickerOpens = dpVisible
    console.log('Datepicker opens:', dpVisible)

    await snap(page, '02_after_startdate_click')

    // Try typing in the start date
    await startInput.fill('2026-08-01')
    await sleep(300)
    const startVal = await startInput.inputValue()
    out.startFillResult = startVal
    console.log('Start after fill:', startVal)

    // Click end date
    await endInput.fill('2026-08-31')
    await sleep(300)
    const endVal = await endInput.inputValue()
    out.endFillResult = endVal
    console.log('End after fill:', endVal)

    // Click 検索
    const searchBtn = page.locator('button').filter({ hasText: '検' })
    const searchBtnText = await searchBtn.first().textContent()
    out.searchBtnText = searchBtnText
    console.log('Search button text:', searchBtnText)

    await searchBtn.first().click()
    await sleep(2000)
    await snap(page, '03_after_search_aug')

    const bodyText2 = await page.locator('body').textContent()
    out.augBodyText = bodyText2?.slice(0, 2000)
    console.log('August body:', bodyText2?.slice(0, 1000))

    const rows2 = await page.locator('tbody tr, .ant-table-tbody tr').count()
    out.augRowCount = rows2
    console.log('August rows:', rows2)

    const sampleRows = []
    for (const row of (await page.locator('tbody tr, .ant-table-tbody tr').all()).slice(0, 5)) {
      const cells = await row.locator('td').allTextContents()
      sampleRows.push(cells.map(c => c.trim().slice(0, 40)))
    }
    out.augSampleRows = sampleRows
    console.log('August sample rows:', sampleRows)

    // Check summary values after search
    const summaryTexts = await page.locator('[class*="statistic"], .ant-statistic, [class*="summary"]').allTextContents()
    out.summaryAfterSearch = summaryTexts.slice(0, 10).map(t => t.trim().slice(0, 80))
    console.log('Summary after search:', out.summaryAfterSearch)

    // Try to find summary by looking for 集金合計金額 text
    const collectionSummary = await page.locator(':has-text("集金合計金額")').first().textContent().catch(() => null)
    out.collectionSummaryText = collectionSummary?.trim().slice(0, 100)
    console.log('Collection summary text:', out.collectionSummaryText)

    // Check pagination after search
    const paginationHTML = await page.locator('.ant-pagination').innerHTML().catch(() => 'not found')
    out.paginationHTML = paginationHTML?.slice(0, 500)
    console.log('Pagination HTML:', out.paginationHTML)

    // Page count text (件数表示)
    const countText = await page.locator('[class*="total"], .ant-pagination-total-text, [class*="page-info"]').textContent().catch(() => null)
    out.pageCountText = countText?.trim()
    console.log('Page count text:', countText)

    // Check if there are links in table
    const tableLinks = await page.locator('tbody a, .ant-table-tbody a').all()
    out.tableLinkCount = tableLinks.length
    if (tableLinks.length > 0) {
      const firstHref = await tableLinks[0].getAttribute('href')
      const firstText = await tableLinks[0].textContent()
      out.firstTableLink = { href: firstHref, text: firstText?.trim() }
      console.log('First table link:', out.firstTableLink)
    }

    // Snapshot full page
    await snap(page, '04_aug_full')

    // Try July 2026
    await startInput.fill('2026-07-01')
    await endInput.fill('2026-07-31')
    await sleep(200)
    await searchBtn.first().click()
    await sleep(2000)
    const rows3 = await page.locator('tbody tr, .ant-table-tbody tr').count()
    out.julRowCount = rows3
    console.log('July rows:', rows3)
    const bodyText3 = await page.locator('body').textContent()
    out.julBodyText = bodyText3?.slice(0, 1500)
    console.log('July body:', bodyText3?.slice(0, 1000))
    await snap(page, '05_jul_full')

    // Test search by driver name
    const staffInput = page.locator('input[placeholder="配送スタッフID・名"]')
    await staffInput.fill('佐藤')
    await sleep(300)
    await searchBtn.first().click()
    await sleep(1500)
    const rows4 = await page.locator('tbody tr, .ant-table-tbody tr').count()
    out.searchByNameCount = rows4
    const bodyText4 = await page.locator('body').textContent()
    out.searchByNameBodyText = bodyText4?.slice(0, 800)
    console.log('Search 佐藤 rows:', rows4)
    console.log('Search 佐藤 body:', bodyText4?.slice(0, 500))
    await snap(page, '06_search_sato')

    // Test DR000001 search
    await staffInput.fill('DR000001')
    await sleep(300)
    await searchBtn.first().click()
    await sleep(1500)
    const rows5 = await page.locator('tbody tr, .ant-table-tbody tr').count()
    out.searchByIDCount = rows5
    const bodyText5 = await page.locator('body').textContent()
    out.searchByIDBodyText = bodyText5?.slice(0, 800)
    console.log('Search DR000001 rows:', rows5)
    console.log('Search DR000001 body:', bodyText5?.slice(0, 500))
    await snap(page, '07_search_DR000001')

    // Test clear button
    const clearBtn = page.locator('button').filter({ hasText: 'クリア' })
    await clearBtn.click()
    await sleep(500)
    const staffVal = await staffInput.inputValue()
    out.afterClearStaffVal = staffVal
    console.log('After clear, staff input:', staffVal)
    const startAfterClear = await startInput.inputValue()
    const endAfterClear = await endInput.inputValue()
    out.afterClearStart = startAfterClear
    out.afterClearEnd = endAfterClear
    console.log('After clear dates:', startAfterClear, '-', endAfterClear)

    // Try clicking staff name link if available (need data)
    // Go to driver page to understand URL structure
    await page.goto('/driver')
    await sleep(1500)
    out.driverPageUrl = page.url().replace(/https?:\/\/[^/]+/, 'HOST')
    const driverBodyText = await page.locator('body').textContent()
    out.driverBodyTextSample = driverBodyText?.slice(0, 500)
    console.log('Driver page URL:', out.driverPageUrl)
    console.log('Driver body:', driverBodyText?.slice(0, 300))
    await snap(page, '08_driver_page')

    // Check table links on driver page
    const driverLinks = await page.locator('tbody a, .ant-table-tbody a').all()
    if (driverLinks.length > 0) {
      const firstHref = await driverLinks[0].getAttribute('href')
      out.driverDetailHref = firstHref
      console.log('Driver detail href:', firstHref)
    }

  } finally {
    await browser.close()
  }

  const outPath = path.join(SHOT, 'recon3_result.json')
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2))
  console.log('Recon3 done.')
}

main().catch(e => { console.error('RECON3 ERROR:', e.message, e.stack); process.exit(1) })
