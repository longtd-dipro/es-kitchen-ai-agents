// Recon2 — Navigate to 集金・駐車 via sidebar click, explore UI
// Run: node e2e/web-outsource/collection/recon2.js
'use strict'
const { open } = require('../_helpers/session.js')
const path = require('path')
const fs = require('fs')

const SHOT = path.resolve(__dirname, '../../../reports/e05/collection')
fs.mkdirSync(SHOT, { recursive: true })

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }
async function snap(page, name) {
  const p = path.join(SHOT, `recon2_${name}.png`)
  await page.screenshot({ path: p, fullPage: true })
  return p
}

async function main() {
  const { browser, page } = await open()
  const out = {}

  try {
    await sleep(500)
    out.startUrl = page.url().replace(/https?:\/\/[^/]+/, 'HOST')

    // Find all sidebar menu items (Ant Design .ant-menu-item)
    const menuItems = await page.locator('.ant-menu-item').all()
    out.menuItemCount = menuItems.length
    out.menuItemTexts = []
    for (const item of menuItems) {
      const text = await item.textContent()
      out.menuItemTexts.push(text?.trim())
    }
    console.log('Menu items:', out.menuItemTexts)

    // Click 集金・駐車
    const clctItem = page.locator('.ant-menu-item').filter({ hasText: '集金・駐車' }).first()
    const clctCount = await clctItem.count()
    out.collectionMenuFound = clctCount > 0

    if (clctCount > 0) {
      await clctItem.click()
      await sleep(2000)
      out.collectionUrl = page.url().replace(/https?:\/\/[^/]+/, 'HOST')
      console.log('Collection URL:', out.collectionUrl)
    } else {
      // Try via link text
      await page.getByText('集金・駐車').first().click()
      await sleep(2000)
      out.collectionUrl = page.url().replace(/https?:\/\/[^/]+/, 'HOST')
    }

    await snap(page, '01_collection_page')

    // Full body text
    const bodyText = await page.locator('body').textContent()
    out.bodyText = bodyText?.slice(0, 5000)
    console.log('Body text (first 2000):', bodyText?.slice(0, 2000))

    // All inputs
    const inputs = await page.locator('input').all()
    out.inputs = []
    for (const inp of inputs) {
      const ph = await inp.getAttribute('placeholder')
      const type = await inp.getAttribute('type')
      const val = await inp.inputValue().catch(() => '')
      out.inputs.push({ placeholder: ph, type, value: val })
    }
    console.log('Inputs:', out.inputs)

    // All buttons
    const btns = await page.locator('button').all()
    out.buttons = []
    for (const btn of btns) {
      const text = await btn.textContent()
      const disabled = await btn.isDisabled()
      const cls = await btn.getAttribute('class')
      out.buttons.push({ text: text?.trim().slice(0, 50), disabled, cls: cls?.slice(0, 60) })
    }
    console.log('Buttons:', out.buttons.map(b => b.text))

    // All select/dropdown
    const selects = await page.locator('select').all()
    out.selectCount = selects.length
    // Ant Design selects
    const antSelects = await page.locator('.ant-select').all()
    out.antSelectCount = antSelects.length
    for (const s of antSelects.slice(0, 3)) {
      const text = await s.textContent()
      out.antSelectText = text?.trim().slice(0, 60)
    }

    // Table headers
    const ths = await page.locator('th, .ant-table-cell[class*="column-title"], thead td').allTextContents()
    out.tableHeaders = ths.map(t => t.trim()).filter(Boolean)
    console.log('Table headers:', out.tableHeaders)

    // Table rows
    const rows = await page.locator('tbody tr, .ant-table-tbody tr').count()
    out.tableRowCount = rows
    console.log('Table rows:', rows)

    // Table row data (first 3 rows)
    const rowData = []
    for (const row of (await page.locator('tbody tr, .ant-table-tbody tr').all()).slice(0, 3)) {
      const cells = await row.locator('td').allTextContents()
      rowData.push(cells.map(c => c.trim().slice(0, 30)))
    }
    out.sampleRows = rowData
    console.log('Sample rows:', rowData)

    // Pagination
    const pagination = await page.locator('.ant-pagination, [class*="pagination"]').first().textContent().catch(() => null)
    out.paginationText = pagination?.trim().slice(0, 200)
    console.log('Pagination:', out.paginationText)

    // Total count text
    const countTexts = await page.locator('[class*="total"], [class*="count"], [class*="件"]').allTextContents()
    out.countTexts = countTexts.slice(0, 10).map(t => t.trim()).filter(Boolean)
    console.log('Count texts:', out.countTexts)

    // Summary cards
    const summaryCards = await page.locator('[class*="summary"], [class*="card"], [class*="tile"], [class*="statistic"]').all()
    out.summaryCount = summaryCards.length
    out.summaryTexts = []
    for (const card of summaryCards.slice(0, 6)) {
      const text = await card.textContent()
      out.summaryTexts.push(text?.trim().slice(0, 80))
    }
    console.log('Summary texts:', out.summaryTexts)

    // Check ant-statistic (Ant Design statistic component)
    const stats = await page.locator('.ant-statistic, [class*="Statistic"]').all()
    out.statCount = stats.length
    for (const s of stats.slice(0, 4)) {
      const text = await s.textContent()
      out.statTexts = (out.statTexts || []).concat(text?.trim().slice(0, 80))
    }
    console.log('Statistic texts:', out.statTexts)

    // Active sidebar item
    const activeItem = await page.locator('.ant-menu-item-selected').textContent().catch(() => null)
    out.activeItem = activeItem?.trim()
    console.log('Active menu item:', out.activeItem)

    // CSV button presence
    const csvBtn = page.locator('button').filter({ hasText: 'CSV' }).first()
    out.csvFound = (await csvBtn.count()) > 0

    // Check full class list for insights
    const allClasses = await page.evaluate(() => {
      const all = document.querySelectorAll('*')
      const classes = new Set()
      all.forEach(el => el.className && el.className.split && el.className.split(' ').forEach(c => { if (c.trim()) classes.add(c.trim()) }))
      return [...classes].slice(0, 100)
    })
    out.allClasses = allClasses
    console.log('All unique classes (first 50):', allClasses.slice(0, 50))

    await snap(page, '02_collection_fullpage')

    // Navigate other screens
    // Try スケジュール
    await page.locator('.ant-menu-item').filter({ hasText: 'スケジュール' }).first().click()
    await sleep(1000)
    out.schedUrl = page.url().replace(/https?:\/\/[^/]+/, 'HOST')
    console.log('Schedule URL:', out.schedUrl)
    await page.goBack()
    await sleep(1000)

    // Check 配送スタッフ menu item
    await page.locator('.ant-menu-item').filter({ hasText: '配送スタッフ' }).first().click()
    await sleep(1000)
    out.staffUrl = page.url().replace(/https?:\/\/[^/]+/, 'HOST')
    console.log('Staff URL:', out.staffUrl)
    await snap(page, '03_staff_page')
    await page.goBack()
    await sleep(1000)

  } finally {
    await browser.close()
  }

  const outPath = path.join(SHOT, 'recon2_result.json')
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2))
  console.log('Recon2 done. Result:', outPath.replace(process.env.HOME || '', '~'))
}

main().catch(e => { console.error('RECON2 ERROR:', e.message, e.stack); process.exit(1) })
