'use strict'
// Deep recon — understand actual delivery management screen structure
const { open } = require('../_helpers/session.js')
const path = require('path')
const fs = require('fs')

const SHOT = path.resolve(__dirname, '../../../reports/e05/delivery')
fs.mkdirSync(SHOT, { recursive: true })
async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }
async function snap(page, name) {
  const p = path.join(SHOT, `recon2_${name}.png`)
  await page.screenshot({ path: p, fullPage: true })
  console.log('  screenshot:', name)
}

async function main() {
  const { browser, page } = await open()
  const out = {}

  try {
    await page.goto('/orders')
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
    await sleep(800)

    // Get full page text to understand structure
    const bodyText = await page.locator('body').textContent()
    const bodySnippet = bodyText.replace(/\s+/g, ' ').trim().slice(0, 1000)
    out.bodySnippet = bodySnippet
    console.log('Body snippet:', bodySnippet)

    await snap(page, '01_orders_full')

    // Get ALL text content with structure
    const allText = await page.evaluate(() => {
      const els = document.querySelectorAll('h1,h2,h3,h4,p,[class*="title"],[class*="heading"],[class*="breadcrumb"],[class*="page"]')
      return Array.from(els).map(el => ({ tag: el.tagName, cls: el.className.slice(0,50), text: el.textContent.trim().slice(0,80) }))
    })
    out.allText = allText.filter(t => t.text).slice(0, 20)
    console.log('All text els:', JSON.stringify(out.allText, null, 2))

    // Check datepicker S.1 - look for date range input
    const dateInputs = await page.locator('input[type="date"], input[placeholder*="日"], [class*="datepicker"], [class*="date-picker"], input[class*="date"]').all()
    const dateInputData = []
    for (const d of dateInputs) {
      const ph = await d.getAttribute('placeholder').catch(() => '')
      const type = await d.getAttribute('type').catch(() => '')
      const val = await d.inputValue().catch(() => '')
      const cls = await d.getAttribute('class').catch(() => '')
      dateInputData.push({ ph, type, val, cls: cls?.slice(0,50) })
    }
    out.dateInputs = dateInputData
    console.log('Date inputs:', JSON.stringify(dateInputData, null, 2))

    // Look for datepicker by class
    const dateContainers = await page.locator('[class*="picker"], [class*="calendar"], [class*="rangePicker"], [class*="RangePicker"]').all()
    out.dateContainerCount = dateContainers.length
    console.log('Date containers:', dateContainers.length)

    // All input names and placeholders
    const allInputs = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input, select, textarea, [contenteditable]')
      return Array.from(inputs).map(el => ({
        tag: el.tagName, type: el.type || '', name: el.name || '', id: el.id || '',
        ph: el.placeholder || '', value: (el.value || '').slice(0,20),
        cls: el.className.slice(0,60)
      }))
    })
    out.allInputs = allInputs.slice(0, 30)
    console.log('All inputs:', JSON.stringify(allInputs.slice(0,30), null, 2))

    // All buttons
    const allBtns = await page.evaluate(() => {
      const btns = document.querySelectorAll('button, [role="button"]')
      return Array.from(btns).map(b => ({
        text: b.textContent.trim().slice(0,40),
        aria: b.getAttribute('aria-label') || '',
        cls: b.className.slice(0,60)
      })).filter(b => b.text || b.aria)
    })
    out.allBtns = allBtns.slice(0, 30)
    console.log('All buttons:', JSON.stringify(allBtns.slice(0,30), null, 2))

    // Table structure
    const tableInfo = await page.evaluate(() => {
      const tables = document.querySelectorAll('table, [class*="table"], [role="table"], [role="grid"]')
      return Array.from(tables).slice(0,3).map(t => ({
        tag: t.tagName, cls: t.className.slice(0,60),
        headerTexts: Array.from(t.querySelectorAll('th, [role="columnheader"]')).map(th => th.textContent.trim()),
        rowCount: t.querySelectorAll('tr, [role="row"]').length
      }))
    })
    out.tableInfo = tableInfo
    console.log('Table info:', JSON.stringify(tableInfo, null, 2))

    // Pagination
    const paginationInfo = await page.evaluate(() => {
      const paginators = document.querySelectorAll('[class*="pagination"], [class*="pager"], [role="navigation"]')
      return Array.from(paginators).slice(0,3).map(p => ({
        cls: p.className.slice(0,60),
        text: p.textContent.trim().slice(0,100)
      }))
    })
    out.paginationInfo = paginationInfo
    console.log('Pagination:', JSON.stringify(paginationInfo, null, 2))

    // Check if there are any links in the table rows
    const tableLinks = await page.evaluate(() => {
      const links = document.querySelectorAll('tbody a, tbody [class*="link"], [class*="table-row"] a')
      return Array.from(links).slice(0,5).map(a => ({
        href: a.href.replace(/https?:\/\/[^/]+/, 'HOST'),
        text: a.textContent.trim().slice(0,30)
      }))
    })
    out.tableLinks = tableLinks
    console.log('Table links:', JSON.stringify(tableLinks, null, 2))

    // Also check all links on page
    const allLinks = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a')).slice(0,20).map(a => ({
        href: a.href.replace(/https?:\/\/[^/]+/, 'HOST'),
        text: a.textContent.trim().slice(0,30)
      }))
    })
    out.allLinks = allLinks
    console.log('All links:', JSON.stringify(allLinks.slice(0,10), null, 2))

    // Try clicking on the first row link if any
    const firstRowLink = page.locator('tbody tr a, tbody tr [class*="link"]').first()
    const firstRowLinkCount = await firstRowLink.count()
    if (firstRowLinkCount > 0) {
      await firstRowLink.click()
      await sleep(1500)
      const detailUrl = page.url().replace(/https?:\/\/[^/]+/, 'HOST')
      out.detailUrl = detailUrl
      console.log('Detail URL after click:', detailUrl)
      await snap(page, '02_detail')

      // Detail page tabs
      const detailTabs = await page.evaluate(() => {
        const tabs = document.querySelectorAll('[role="tab"], [class*="tab-"]')
        return Array.from(tabs).map(t => t.textContent.trim()).filter(Boolean)
      })
      out.detailTabs = detailTabs
      console.log('Detail tabs:', detailTabs)

      // Detail buttons
      const detailBtns = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim()).filter(Boolean)
      })
      out.detailBtns = detailBtns.slice(0, 20)
      console.log('Detail btns:', detailBtns.slice(0,20))

      // Check for driver dropdown
      const driverDropdown = await page.evaluate(() => {
        const dropdowns = document.querySelectorAll('select, [class*="dropdown"], [class*="select"], [role="combobox"], [role="listbox"]')
        return Array.from(dropdowns).slice(0,5).map(d => ({
          tag: d.tagName, role: d.getAttribute('role') || '',
          cls: d.className.slice(0,60), text: d.textContent.trim().slice(0,60)
        }))
      })
      out.driverDropdown = driverDropdown
      console.log('Driver dropdown:', JSON.stringify(driverDropdown, null, 2))

      await snap(page, '03_detail_full')
    }

  } catch(e) {
    console.error('Recon2 error:', e.message)
    out.error = e.message
  } finally {
    fs.writeFileSync(path.join(SHOT, 'recon2_out.json'), JSON.stringify(out, null, 2))
    await browser.close()
    console.log('Recon2 done.')
  }
}

main().catch(e => { console.error(e); process.exit(1) })
