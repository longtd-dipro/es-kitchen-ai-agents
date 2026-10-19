'use strict'
// Recon5 — detailed recon of /delivery-status and its detail page
const { open } = require('../_helpers/session.js')
const path = require('path')
const fs = require('fs')

const SHOT = path.resolve(__dirname, '../../../reports/e05/delivery')
fs.mkdirSync(SHOT, { recursive: true })
async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }
async function snap(page, name) {
  const p = path.join(SHOT, `r5_${name}.png`)
  await page.screenshot({ path: p, fullPage: true })
  console.log('  screenshot:', name)
}

async function main() {
  const { browser, page } = await open()
  const out = {}

  try {
    // 1. Check /delivery-status expanded search
    await page.goto('/delivery-status')
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
    await sleep(800)

    // Click expand button
    const expandBtn = page.locator('button[aria-label="詳細条件を開く"]')
    const expandBtnCount = await expandBtn.count()
    out.expandBtnFound = expandBtnCount > 0
    console.log('Expand btn found:', expandBtnCount)

    if (expandBtnCount > 0) {
      await expandBtn.click()
      await sleep(800)
      await snap(page, '01_expanded_search')

      // Get all inputs after expand
      const expandedInputs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('input, select, .ant-select, [class*="dropdown"]')).map(el => ({
          tag: el.tagName, type: el.type || '', ph: el.placeholder || '',
          name: el.name || '', cls: el.className.slice(0,60)
        }))
      })
      out.expandedInputs = expandedInputs
      console.log('Expanded inputs:', JSON.stringify(expandedInputs.slice(0,20), null, 2))

      // Get all visible text in search area
      const searchAreaText = await page.evaluate(() => {
        const labels = document.querySelectorAll('label, [class*="label"], .ant-form-item-label')
        return Array.from(labels).map(l => l.textContent.trim()).filter(Boolean)
      })
      out.searchAreaLabels = searchAreaText
      console.log('Search labels:', searchAreaText)

      // Look for collapse button
      const collapseBtn = page.locator('button[aria-label*="閉じ"], button[aria-label*="たたむ"], button[aria-label*="詳細条件を閉じる"]')
      const collapseBtnCount = await collapseBtn.count()
      out.collapseBtnFound = collapseBtnCount > 0
      console.log('Collapse btn found:', collapseBtnCount)
    }

    // 2. Check sort functionality
    const thWithSort = await page.evaluate(() => {
      const ths = document.querySelectorAll('th, [role="columnheader"]')
      return Array.from(ths).map(th => ({
        text: th.textContent.trim(),
        cls: th.className.slice(0,60),
        hasSort: th.querySelector('.ant-table-column-sorter, [class*="sort"], [class*="sorter"]') !== null
      }))
    })
    out.thWithSort = thWithSort
    console.log('TH with sort:', JSON.stringify(thWithSort, null, 2))

    // 3. Check data rows
    const rows = await page.locator('tbody tr').all()
    out.rowCount = rows.length
    console.log('Rows:', rows.length)

    // Get first row cells
    if (rows.length > 0) {
      const firstRowCells = await rows[0].locator('td').allTextContents()
      out.firstRowCells = firstRowCells.map(t => t.trim())
      console.log('First row:', out.firstRowCells)

      // Check driver columns (L.8 = 配送スタッフID, L.9 = 配送スタッフ名)
      // Column indices: 0=No, 1=配送日, 2=荷物温度帯, 3=配送No, 4=荷受け住所, 5=届け先拠点名, 6=届け先住所, 7=配送スタッフID, 8=配送スタッフ名, 9=送り状No, 10=配送状況, 11=配送区分
      out.driverIdColIdx = 7
      out.driverNameColIdx = 8

      // Check if any row has empty driver
      const rowData = []
      for (const row of rows.slice(0, 5)) {
        const cells = await row.locator('td').allTextContents()
        rowData.push(cells.map(c => c.trim()))
      }
      out.rowData = rowData
      out.rowsWithEmptyDriver = rowData.filter(r => r.length > 8 && (!r[7] || r[7] === '')).length
      console.log('Rows with empty driver ID:', out.rowsWithEmptyDriver)
    }

    // 4. Check pagination
    const paginationEl = await page.evaluate(() => {
      const p = document.querySelector('.ant-pagination, [class*="pagination"], [role="navigation"]')
      return p ? { cls: p.className, text: p.textContent.trim().slice(0,100) } : null
    })
    out.pagination = paginationEl
    console.log('Pagination:', paginationEl)

    // 5. Navigate to detail
    const detailLink = page.locator('tbody tr td a, tbody tr [class*="link"]').first()
    const detailLinkCount = await detailLink.count()
    if (detailLinkCount > 0) {
      const detailHref = await detailLink.getAttribute('href')
      out.detailHref = detailHref
      await detailLink.click()
      await sleep(1500)
    } else {
      // Try clicking 詳細 text
      const detailBtn = page.locator('tbody').locator('text=詳細').first()
      if (await detailBtn.count() > 0) {
        await detailBtn.click()
        await sleep(1500)
      } else {
        // Try clicking first row
        await page.locator('tbody tr').first().click().catch(() => {})
        await sleep(1000)
      }
    }

    const detailUrl = page.url().replace(/https?:\/\/[^/]+/, 'HOST')
    out.detailUrl = detailUrl
    console.log('Detail URL:', detailUrl)
    await snap(page, '02_detail_page')

    // 5a. Detail page structure
    const detailH1 = await page.locator('h1').first().textContent().catch(() => '')
    out.detailH1 = detailH1.trim()
    console.log('Detail H1:', detailH1.trim())

    // 5b. Tabs
    const tabs = await page.evaluate(() => {
      const tabs = document.querySelectorAll('[role="tab"], .ant-tabs-tab')
      return Array.from(tabs).map(t => t.textContent.trim()).filter(Boolean)
    })
    out.detailTabs = tabs
    console.log('Detail tabs:', tabs)

    // 5c. Tab active
    const activeTab = await page.evaluate(() => {
      const active = document.querySelector('[role="tab"][aria-selected="true"], .ant-tabs-tab-active')
      return active ? active.textContent.trim() : null
    })
    out.activeTab = activeTab
    console.log('Active tab:', activeTab)

    // 5d. Buttons
    const detailBtns = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim()).filter(Boolean)
    })
    out.detailBtns = detailBtns
    console.log('Detail btns:', detailBtns)

    // 5e. Check for driver dropdown/select (H.2)
    const driverSelect = await page.evaluate(() => {
      const selects = document.querySelectorAll('.ant-select, [class*="dropdown"], [role="combobox"]')
      return Array.from(selects).slice(0,5).map(s => ({
        cls: s.className.slice(0,60), text: s.textContent.trim().slice(0,60)
      }))
    })
    out.driverSelect = driverSelect
    console.log('Driver select:', JSON.stringify(driverSelect, null, 2))

    // 5f. Check for badge 未設定
    const bodyText = await page.locator('body').textContent()
    out.hasUnsetBadge = bodyText.includes('未設定')
    out.hasEditBtn = bodyText.includes('編集')
    out.hasCancelBtn = bodyText.includes('キャンセル')
    out.hasConfirmBtn = bodyText.includes('確定')
    console.log('Has 未設定 badge:', out.hasUnsetBadge)
    console.log('Has 編集 btn:', out.hasEditBtn)
    console.log('Has キャンセル btn:', out.hasCancelBtn)
    console.log('Has 確定 btn:', out.hasConfirmBtn)

    // 5g. Body snippet
    out.detailBodySnippet = bodyText.replace(/\s+/g, ' ').trim().slice(0, 600)
    console.log('Detail body:', out.detailBodySnippet)

    // 6. Click tab 配送住所
    const tabAddressBtn = page.locator('[role="tab"]').filter({ hasText: '配送住所' })
    if (await tabAddressBtn.count() > 0) {
      await tabAddressBtn.click()
      await sleep(800)
      await snap(page, '03_tab_address')
      const addressBody = await page.locator('body').textContent()
      out.addressTabContent = addressBody.replace(/\s+/g, ' ').trim().slice(0, 400)
      console.log('Address tab content:', out.addressTabContent.slice(0,200))

      // Check for file thumbnails
      const thumbnails = await page.locator('[class*="thumbnail"], img[class*="thumb"], [class*="file-item"], [class*="attachment"]').count()
      out.thumbnailCount = thumbnails
      console.log('Thumbnail count:', thumbnails)
    }

    // 7. Click tab 実績
    await page.goto(detailUrl.replace('HOST', ''))
    await sleep(800)
    const tabJisseki = page.locator('[role="tab"]').filter({ hasText: '実績' })
    if (await tabJisseki.count() > 0) {
      await tabJisseki.click()
      await sleep(800)
      await snap(page, '04_tab_jisseki')
      const jissekiBody = await page.locator('body').textContent()
      out.jissekiTabContent = jissekiBody.replace(/\s+/g, ' ').trim().slice(0, 400)
      console.log('Jisseki tab content:', out.jissekiTabContent.slice(0,200))

      // Table in 実績
      const jissekiThs = await page.locator('th, [role="columnheader"]').allTextContents()
      out.jissekiHeaders = jissekiThs.map(t => t.trim()).filter(Boolean)
      console.log('実績 headers:', out.jissekiHeaders)
    }

    // 8. Click tab 添付資料
    await page.goto(detailUrl.replace('HOST', ''))
    await sleep(800)
    const tabAttach = page.locator('[role="tab"]').filter({ hasText: '添付資料' })
    if (await tabAttach.count() > 0) {
      await tabAttach.click()
      await sleep(800)
      await snap(page, '05_tab_attachment')
      const attachBody = await page.locator('body').textContent()
      out.attachTabContent = attachBody.replace(/\s+/g, ' ').trim().slice(0, 400)
      console.log('Attachment tab content:', out.attachTabContent.slice(0,200))
    }

  } catch(e) {
    console.error('Recon5 error:', e.message)
    out.error = e.message
  } finally {
    fs.writeFileSync(path.join(SHOT, 'recon5_out.json'), JSON.stringify(out, null, 2))
    await browser.close()
    console.log('Recon5 done.')
  }
}

main().catch(e => { console.error(e); process.exit(1) })
