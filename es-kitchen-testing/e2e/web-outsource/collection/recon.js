// Recon script — khám phá UI OW_CLCT_001 (集金・駐車)
// Run: node e2e/web-outsource/collection/recon.js (từ es-kitchen-testing root)
'use strict'
const { open } = require('../_helpers/session.js')
const path = require('path')
const fs = require('fs')

const SHOT = path.resolve(__dirname, '../../../reports/e05/collection')
fs.mkdirSync(SHOT, { recursive: true })

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function snap(page, name) {
  const p = path.join(SHOT, `recon_${name}.png`)
  await page.screenshot({ path: p, fullPage: true })
  return p
}

async function main() {
  const { browser, page } = await open()
  const out = {}

  try {
    await sleep(500)
    out.startUrl = page.url().replace(/https?:\/\/[^/]+/, 'HOST')

    // 1. Click sidebar 集金・駐車
    const sidebarLinks = await page.locator('aside a, nav a, [role="menuitem"], [class*="menu"] a, [class*="sider"] a').all()
    out.sidebarCount = sidebarLinks.length
    const sidebarTexts = []
    for (const link of sidebarLinks) {
      const text = await link.textContent()
      const href = await link.getAttribute('href')
      sidebarTexts.push({ text: text?.trim(), href })
    }
    out.sidebarItems = sidebarTexts.slice(0, 20)

    // Find 集金 link
    const clctLink = page.locator('aside a, nav a, [role="menuitem"]').filter({ hasText: '集金' }).first()
    const clctCount = await clctLink.count()
    out.collectionLinkFound = clctCount > 0

    if (clctCount > 0) {
      await clctLink.click()
      await sleep(1500)
    } else {
      // Try direct navigation
      await page.goto('/collection')
      await sleep(1500)
    }

    out.collectionUrl = page.url().replace(/https?:\/\/[^/]+/, 'HOST')
    await snap(page, '01_collection_default')

    // 2. Check page heading
    const headings = await page.locator('h1,h2,h3,[class*="title"],[class*="heading"],[class*="page-title"]').allTextContents()
    out.headings = headings.slice(0, 10).map(t => t.trim()).filter(Boolean)

    // 3. Check all buttons
    const buttons = await page.locator('button').all()
    out.buttons = []
    for (const btn of buttons) {
      const text = await btn.textContent()
      const disabled = await btn.isDisabled()
      out.buttons.push({ text: text?.trim(), disabled })
    }

    // 4. Check inputs
    const inputs = await page.locator('input').all()
    out.inputs = []
    for (const inp of inputs) {
      const ph = await inp.getAttribute('placeholder')
      const type = await inp.getAttribute('type')
      const val = await inp.getAttribute('value')
      out.inputs.push({ placeholder: ph, type, value: val })
    }

    // 5. Check date picker / period search
    const dateInputs = await page.locator('input[type="date"], [class*="date"], [class*="picker"], [class*="range"]').all()
    out.datePickerCount = dateInputs.length

    // 6. Check summary cards / tiles
    const summaries = await page.locator('[class*="summary"], [class*="card"], [class*="tile"], [class*="stat"]').all()
    out.summaryCount = summaries.length
    out.summaryTexts = []
    for (const s of summaries.slice(0, 5)) {
      const text = await s.textContent()
      out.summaryTexts.push(text?.trim().slice(0, 100))
    }

    // 7. Check table
    const tableHeaders = await page.locator('th, [class*="th"], thead td').allTextContents()
    out.tableHeaders = tableHeaders.map(t => t.trim()).filter(Boolean)

    const tableRows = await page.locator('tbody tr, [class*="tbody"] [class*="tr"]').count()
    out.tableRowCount = tableRows

    // 8. Check pagination
    const paginationText = await page.locator('[class*="pagination"], [class*="pager"]').first().textContent().catch(() => null)
    out.paginationText = paginationText?.trim().slice(0, 100)

    // 9. Check select/dropdown
    const selects = await page.locator('select, [class*="select"]').all()
    out.selectCount = selects.length
    for (const sel of selects.slice(0, 3)) {
      const text = await sel.textContent()
      out.selectSample = text?.trim().slice(0, 80)
    }

    // 10. Body DOM structure for class discovery
    const bodyHTML = await page.locator('body').innerHTML()
    const classMatches = bodyHTML.match(/class="[^"]*"/g) || []
    const uniqueClasses = [...new Set(classMatches)].slice(0, 60)
    out.uniqueClasses = uniqueClasses

    // 11. Check all links in table
    const tableLinks = await page.locator('tbody a, [class*="tbody"] a').all()
    out.tableLinksCount = tableLinks.length
    if (tableLinks.length > 0) {
      const firstLinkText = await tableLinks[0].textContent()
      const firstLinkHref = await tableLinks[0].getAttribute('href')
      out.firstTableLink = { text: firstLinkText?.trim(), href: firstLinkHref }
    }

    // 12. Check active sidebar
    const activeItems = await page.locator('[class*="active"], [aria-current="page"], [class*="selected"]').allTextContents()
    out.activeItems = activeItems.slice(0, 5).map(t => t.trim()).filter(Boolean)

    // 13. Check full body text (first 3000 chars)
    const bodyText = await page.locator('body').textContent()
    out.bodyTextSample = bodyText?.slice(0, 3000)

    // 14. Screenshot with table visible
    await snap(page, '02_collection_table')

    // 15. Try typing in search field
    const searchInput = page.locator('input[placeholder*="スタッフ"], input[placeholder*="ID"], input[placeholder*="名"]').first()
    const searchCount = await searchInput.count()
    if (searchCount > 0) {
      await searchInput.fill('test')
      await sleep(300)
      await searchInput.fill('')
      out.searchInputFound = true
    } else {
      out.searchInputFound = false
    }

    // 16. Check if period picker shows current month range
    const dateValues = await page.locator('input[type="date"], [class*="date-range"] input, [class*="period"] input').all()
    out.dateValues = []
    for (const d of dateValues.slice(0, 4)) {
      const v = await d.evaluate(el => el.value || el.textContent)
      out.dateValues.push(v)
    }

    // 17. Check CSV button
    const csvBtn = page.locator('button').filter({ hasText: 'CSV' }).first()
    out.csvBtnFound = (await csvBtn.count()) > 0

    // 18. Check search button
    const searchBtn = page.locator('button').filter({ hasText: '検索' }).first()
    out.searchBtnFound = (await searchBtn.count()) > 0

    // 19. Check clear button
    const clearBtn = page.locator('button').filter({ hasText: 'クリア' }).first()
    out.clearBtnFound = (await clearBtn.count()) > 0

    // 20. Try to find items per page dropdown value
    const perPageDropdown = page.locator('select, .ant-select, [class*="per-page"], [class*="page-size"]').first()
    const perPageText = await perPageDropdown.textContent().catch(() => null)
    out.perPageText = perPageText?.trim().slice(0, 50)

    await snap(page, '03_collection_fullpage')

  } finally {
    await browser.close()
  }

  const outPath = path.join(SHOT, 'recon_result.json')
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2))
  console.log('Recon done. Written to', outPath.replace(process.env.HOME || '', '~'))
  console.log('collectionUrl:', out.collectionUrl)
  console.log('headings:', out.headings)
  console.log('buttons:', out.buttons?.map(b => b.text))
  console.log('tableHeaders:', out.tableHeaders)
  console.log('tableRowCount:', out.tableRowCount)
  console.log('inputs:', out.inputs)
  console.log('bodyTextSample (first 1000):', out.bodyTextSample?.slice(0, 1000))
  console.log('uniqueClasses (first 20):', out.uniqueClasses?.slice(0, 20))
  console.log('paginationText:', out.paginationText)
  console.log('activeItems:', out.activeItems)
}

main().catch(e => { console.error('RECON ERROR:', e.message); process.exit(1) })
