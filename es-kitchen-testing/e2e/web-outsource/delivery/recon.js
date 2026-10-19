'use strict'
// Recon — discover delivery screen UI for E05
const { open } = require('../_helpers/session.js')
const path = require('path')
const fs = require('fs')

const SHOT = path.resolve(__dirname, '../../../reports/e05/delivery')
fs.mkdirSync(SHOT, { recursive: true })
async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }
async function snap(page, name) {
  const p = path.join(SHOT, `recon_${name}.png`)
  await page.screenshot({ path: p, fullPage: true })
  console.log('  screenshot:', name)
  return p
}

async function main() {
  const { browser, page } = await open()
  const out = {}

  try {
    // 1. Find sidebar link for 配送管理
    const sidebar = await page.locator('aside a, nav a, [role="menuitem"], [class*="menu"] a, [class*="sider"] a, [class*="nav"] a').all()
    const sidebarItems = []
    for (const el of sidebar) {
      const text = await el.textContent().catch(() => '')
      const href = await el.getAttribute('href').catch(() => '')
      if (text.trim()) sidebarItems.push({ text: text.trim().slice(0,40), href })
    }
    out.sidebarItems = sidebarItems
    console.log('Sidebar items:', JSON.stringify(sidebarItems, null, 2))

    // 2. Try clicking 配送管理
    const delivLink = page.locator('aside a, nav a, [role="menuitem"], [class*="menu"] a').filter({ hasText: '配送管理' }).first()
    const delivCount = await delivLink.count()
    out.delivLinkFound = delivCount > 0

    if (delivCount > 0) {
      await delivLink.click()
      await sleep(1500)
    } else {
      await page.goto('/orders')
      await sleep(1500)
    }
    out.ordersUrl = page.url().replace(/https?:\/\/[^/]+/, 'HOST')
    console.log('Orders URL:', out.ordersUrl)
    await snap(page, '01_orders_list')

    // 3. Page structure
    const headings = await page.locator('h1,h2,h3,[class*="title"],[class*="heading"],[class*="breadcrumb"]').allTextContents()
    out.headings = headings.map(t => t.trim()).filter(Boolean).slice(0, 15)
    console.log('Headings:', out.headings)

    // 4. Buttons in search area
    const buttons = await page.locator('button').all()
    const buttonTexts = []
    for (const b of buttons) {
      const text = await b.textContent().catch(() => '')
      const ariaLabel = await b.getAttribute('aria-label').catch(() => '')
      if (text.trim() || ariaLabel) buttonTexts.push({ text: text.trim().slice(0,30), ariaLabel })
    }
    out.buttons = buttonTexts
    console.log('Buttons:', JSON.stringify(buttonTexts, null, 2))

    // 5. Inputs
    const inputs = await page.locator('input, select, [role="combobox"]').all()
    const inputData = []
    for (const inp of inputs) {
      const ph = await inp.getAttribute('placeholder').catch(() => '')
      const type = await inp.getAttribute('type').catch(() => '')
      const name = await inp.getAttribute('name').catch(() => '')
      const value = await inp.inputValue().catch(() => '')
      inputData.push({ ph, type, name, value: value.slice(0,20) })
    }
    out.inputs = inputData.slice(0, 20)
    console.log('Inputs:', JSON.stringify(inputData.slice(0,20), null, 2))

    // 6. Table headers
    const ths = await page.locator('th, thead td').allTextContents()
    out.tableHeaders = ths.map(t => t.trim()).filter(Boolean)
    console.log('Table headers:', out.tableHeaders)

    // 7. Check rows in table
    const rows = await page.locator('tbody tr').all()
    out.rowCount = rows.length
    console.log('Table rows:', rows.length)

    // If rows, get first row data
    if (rows.length > 0) {
      const cells = await rows[0].locator('td').allTextContents()
      out.firstRowCells = cells.map(t => t.trim()).slice(0, 15)
      console.log('First row:', out.firstRowCells)

      // Try clicking first 配送No link
      const linkCell = rows[0].locator('a, [class*="link"], button').first()
      const linkCount = await linkCell.count()
      out.firstRowHasLink = linkCount > 0
    }

    // 8. Pagination
    const pagination = await page.locator('[class*="pagination"], [class*="pager"], nav[aria-label*="pagination"]').count()
    out.hasPagination = pagination > 0

    // 9. Try expand search
    const expandBtn = page.locator('button').filter({ hasText: /絞り込み|詳細|展開|もっと|拡張|▼/ }).first()
    const expandBtnByPlus = page.locator('button').filter({ hasText: /\+1|\+/ }).first()
    const expandBtnCount = await expandBtn.count()
    const expandBtnPlusCount = await expandBtnByPlus.count()
    out.expandBtnFound = expandBtnCount > 0
    out.expandBtnPlusFound = expandBtnPlusCount > 0
    console.log('Expand search btn found:', expandBtnCount, expandBtnPlusCount)
    await snap(page, '02_orders_before_expand')

    // Try to expand search
    if (expandBtnCount > 0) {
      await expandBtn.click()
      await sleep(800)
      await snap(page, '03_orders_after_expand')
    } else if (expandBtnPlusCount > 0) {
      await expandBtnByPlus.click()
      await sleep(800)
      await snap(page, '03_orders_after_expand_plus')
    }

    // Check inputs after expand
    const inputsAfter = await page.locator('input, select, [role="combobox"]').all()
    const inputDataAfter = []
    for (const inp of inputsAfter) {
      const ph = await inp.getAttribute('placeholder').catch(() => '')
      const type = await inp.getAttribute('type').catch(() => '')
      const name = await inp.getAttribute('name').catch(() => '')
      const value = await inp.inputValue().catch(() => '')
      inputDataAfter.push({ ph, type, name, value: value.slice(0,20) })
    }
    out.inputsAfterExpand = inputDataAfter.slice(0, 30)
    console.log('Inputs after expand:', JSON.stringify(inputDataAfter.slice(0,30), null, 2))

    // 10. Try clicking on first row to see detail
    await page.goto(out.ordersUrl.replace('HOST', ''))
    await sleep(1500)
    if (rows.length > 0) {
      await page.waitForSelector('tbody tr', { timeout: 5000 }).catch(() => {})
      const firstLink = page.locator('tbody tr').first().locator('a').first()
      const firstLinkCount = await firstLink.count()
      if (firstLinkCount > 0) {
        await firstLink.click()
        await sleep(1500)
        out.detailUrl = page.url().replace(/https?:\/\/[^/]+/, 'HOST')
        console.log('Detail URL:', out.detailUrl)
        await snap(page, '04_orders_detail')

        // Check detail tabs
        const tabs = await page.locator('[role="tab"], [class*="tab"]').allTextContents()
        out.detailTabs = tabs.map(t => t.trim()).filter(Boolean).slice(0, 10)
        console.log('Detail tabs:', out.detailTabs)

        // Check header area
        const headerBtns = await page.locator('button').allTextContents()
        out.detailButtons = headerBtns.map(t => t.trim()).filter(Boolean).slice(0, 20)
        console.log('Detail buttons:', out.detailButtons)
      }
    }
  } catch(e) {
    console.error('Recon error:', e.message)
    out.error = e.message
  } finally {
    fs.writeFileSync(path.join(SHOT, 'recon_out.json'), JSON.stringify(out, null, 2))
    await browser.close()
    console.log('Recon done. Output:', path.join(SHOT, 'recon_out.json'))
  }
}

main().catch(e => { console.error(e); process.exit(1) })
