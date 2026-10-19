'use strict'
// Recon4 — explore /delivery-status (actual sidebar destination)
const { open } = require('../_helpers/session.js')
const path = require('path')
const fs = require('fs')

const SHOT = path.resolve(__dirname, '../../../reports/e05/delivery')
fs.mkdirSync(SHOT, { recursive: true })
async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }
async function snap(page, name) {
  const p = path.join(SHOT, `r4_${name}.png`)
  await page.screenshot({ path: p, fullPage: true })
  console.log('  screenshot:', name)
}

async function main() {
  const { browser, page } = await open()
  const out = {}

  try {
    // Navigate to /delivery-status
    await page.goto('/delivery-status')
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
    await sleep(800)
    await snap(page, '01_delivery_status')

    // H1 heading
    const h1 = await page.locator('h1').first().textContent().catch(() => '')
    out.h1 = h1.trim()
    console.log('H1:', h1.trim())

    // Breadcrumb
    const breadcrumb = await page.evaluate(() => {
      const bc = document.querySelector('[class*="breadcrumb"]')
      return bc ? bc.textContent.trim() : null
    })
    out.breadcrumb = breadcrumb
    console.log('Breadcrumb:', breadcrumb)

    // Table headers
    const thTexts = await page.locator('th, [role="columnheader"]').allTextContents()
    out.thTexts = thTexts.map(t => t.trim()).filter(Boolean)
    console.log('Table headers:', out.thTexts)

    // Row count
    const rowCount = await page.locator('tbody tr').count()
    out.rowCount = rowCount
    console.log('Rows:', rowCount)

    // All inputs
    const allInputs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('input, select')).map(el => ({
        type: el.type || '', name: el.name || '', ph: el.placeholder || '',
        val: (el.value || '').slice(0, 20), cls: el.className.slice(0,50)
      }))
    })
    out.allInputs = allInputs
    console.log('Inputs:', JSON.stringify(allInputs.slice(0,15), null, 2))

    // All buttons
    const allBtns = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button, [role="button"]')).map(b => ({
        text: b.textContent.trim().slice(0,30),
        aria: b.getAttribute('aria-label') || ''
      })).filter(b => b.text || b.aria)
    })
    out.allBtns = allBtns
    console.log('Buttons:', JSON.stringify(allBtns, null, 2))

    // Check for datepicker
    const dpInfo = await page.evaluate(() => {
      const pickers = document.querySelectorAll('.ant-picker input')
      return Array.from(pickers).map(p => ({ ph: p.placeholder, val: p.value }))
    })
    out.dpInfo = dpInfo
    console.log('Datepicker:', dpInfo)

    // Check for radio buttons
    const radioCount = await page.locator('input[type="radio"]').count()
    out.radioCount = radioCount
    console.log('Radio count:', radioCount)

    // Check for any expand button
    const hasExpand = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'))
      return btns.some(b => /詳細|絞り込み|展開|もっと|\+/.test(b.textContent.trim()))
    })
    out.hasExpand = hasExpand
    console.log('Has expand btn:', hasExpand)

    // Check for sort button
    const sortBtnInfo = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'))
      return btns.filter(b => /配送日|ソート|並び替え/.test(b.textContent.trim())).map(b => b.textContent.trim().slice(0,40))
    })
    out.sortBtns = sortBtnInfo
    console.log('Sort btns:', sortBtnInfo)

    // Check body text snippet
    const bodyText = await page.locator('body').textContent()
    out.bodySnippet = bodyText.replace(/\s+/g, ' ').trim().slice(0, 500)
    console.log('Body snippet:', out.bodySnippet)

    // Try clicking first row to see detail URL
    if (rowCount > 0) {
      const firstLink = page.locator('tbody tr a, tbody tr [class*="clickable"]').first()
      const firstLinkCount = await firstLink.count()
      if (firstLinkCount > 0) {
        await firstLink.click()
        await sleep(1500)
        out.detailUrl = page.url().replace(/https?:\/\/[^/]+/, 'HOST')
        console.log('Detail URL:', out.detailUrl)
        await snap(page, '02_detail')
      } else {
        // Try clicking on first row directly
        await page.locator('tbody tr').first().click().catch(() => {})
        await sleep(1000)
        out.detailUrlAfterRowClick = page.url().replace(/https?:\/\/[^/]+/, 'HOST')
        console.log('URL after row click:', out.detailUrlAfterRowClick)
        await snap(page, '02_after_row_click')
      }
    }

    // Check pagination
    const paginationText = await page.evaluate(() => {
      const pag = document.querySelector('.ant-pagination, [class*="pagination"]')
      return pag ? pag.textContent.trim().slice(0,80) : null
    })
    out.paginationText = paginationText
    console.log('Pagination:', paginationText)

  } catch(e) {
    console.error('Recon4 error:', e.message)
    out.error = e.message
  } finally {
    fs.writeFileSync(path.join(SHOT, 'recon4_out.json'), JSON.stringify(out, null, 2))
    await browser.close()
    console.log('Recon4 done.')
  }
}

main().catch(e => { console.error(e); process.exit(1) })
