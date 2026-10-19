'use strict'
// Recon3 — Detailed element check for delivery screen
const { open } = require('../_helpers/session.js')
const path = require('path')
const fs = require('fs')

const SHOT = path.resolve(__dirname, '../../../reports/e05/delivery')
fs.mkdirSync(SHOT, { recursive: true })
async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }
async function snap(page, name) {
  const p = path.join(SHOT, `r3_${name}.png`)
  await page.screenshot({ path: p, fullPage: true })
}

async function main() {
  const { browser, page } = await open()
  const out = {}

  try {
    await page.goto('/orders')
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
    await sleep(1000)
    await snap(page, '01_orders')

    // 1. Check datepicker details — is it a range picker?
    const dpInfo = await page.evaluate(() => {
      const pickers = document.querySelectorAll('.ant-picker, [class*="datepicker"], [class*="date-picker"]')
      return Array.from(pickers).map(p => ({
        cls: p.className.slice(0,80),
        html: p.outerHTML.slice(0, 300),
        inputCount: p.querySelectorAll('input').length,
        text: p.textContent.trim().slice(0,50)
      }))
    })
    out.dpInfo = dpInfo
    console.log('Datepicker info:', JSON.stringify(dpInfo, null, 2))

    // 2. Check for any expand/more search button
    const allBtnTexts = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button, [role="button"]')).map(b => ({
        text: b.textContent.trim(),
        cls: b.className.slice(0,60),
        aria: b.getAttribute('aria-label') || ''
      }))
    })
    out.allBtnTexts = allBtnTexts
    console.log('All btns:', JSON.stringify(allBtnTexts, null, 2))

    // 3. Check select/combobox details
    const selectInfo = await page.evaluate(() => {
      const sels = document.querySelectorAll('select, [role="combobox"], .ant-select')
      return Array.from(sels).map(s => ({
        tag: s.tagName, cls: s.className.slice(0,60),
        text: s.textContent.trim().slice(0,60),
        label: (document.querySelector(`label[for="${s.id}"]`) || {}).textContent || ''
      }))
    })
    out.selectInfo = selectInfo
    console.log('Select/combobox:', JSON.stringify(selectInfo, null, 2))

    // 4. Check breadcrumb
    const breadcrumb = await page.evaluate(() => {
      const bc = document.querySelector('[class*="breadcrumb"], .ant-breadcrumb')
      return bc ? { cls: bc.className, text: bc.textContent.trim() } : null
    })
    out.breadcrumb = breadcrumb
    console.log('Breadcrumb:', breadcrumb)

    // 5. Check page heading exactly
    const h1Text = await page.locator('h1').first().textContent().catch(() => '')
    out.h1 = h1Text.trim()
    console.log('H1:', h1Text.trim())

    // 6. Try search with empty then observe table/pagination
    const searchBtn = page.locator('button').filter({ hasText: '検 索' }).first()
    if (await searchBtn.count() > 0) {
      await searchBtn.click()
      await sleep(1500)
      const rowsAfter = await page.locator('tbody tr').count()
      out.rowsAfterSearch = rowsAfter
      const noDataText = await page.locator('[class*="empty"], [class*="no-data"]').textContent().catch(() => '')
      out.noDataText = noDataText.trim()
      console.log('Rows after search:', rowsAfter, 'No data text:', noDataText.trim())
    }

    // 7. Try クリア button
    const clearBtn = page.locator('button', { hasText: 'クリア' }).first()
    if (await clearBtn.count() > 0) {
      await clearBtn.click()
      await sleep(500)
      const inputValAfterClear = await page.locator('input[name="search"]').inputValue().catch(() => 'N/A')
      out.inputValAfterClear = inputValAfterClear
      console.log('Input after clear:', inputValAfterClear)
    }

    // 8. Check for status select options
    const statusSelect = page.locator('.ant-select').first()
    if (await statusSelect.count() > 0) {
      await statusSelect.click()
      await sleep(500)
      const options = await page.locator('.ant-select-item-option').allTextContents().catch(() => [])
      out.statusOptions = options
      console.log('Status options:', options)
      // Close by pressing escape
      await page.keyboard.press('Escape')
      await sleep(300)
    }

    // 9. Sidebar navigation check — get exact href for 配送管理
    const sidebarLinks = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a[href]')).map(a => ({
        href: a.getAttribute('href'),
        text: a.textContent.trim().slice(0,30)
      })).filter(l => l.href)
    })
    out.sidebarLinks = sidebarLinks
    console.log('All links with href:', JSON.stringify(sidebarLinks.slice(0,10), null, 2))

    await snap(page, '02_after_interactions')

  } catch(e) {
    console.error('Recon3 error:', e.message)
    out.error = e.message
  } finally {
    fs.writeFileSync(path.join(SHOT, 'recon3_out.json'), JSON.stringify(out, null, 2))
    await browser.close()
    console.log('Recon3 done.')
  }
}

main().catch(e => { console.error(e); process.exit(1) })
