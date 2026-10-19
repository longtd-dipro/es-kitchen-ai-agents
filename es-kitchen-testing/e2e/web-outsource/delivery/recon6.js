'use strict'
// Recon6 — find assigned driver detail + check selects + dropdown behavior
const { open } = require('../_helpers/session.js')
const path = require('path')
const fs = require('fs')

const SHOT = path.resolve(__dirname, '../../../reports/e05/delivery')
fs.mkdirSync(SHOT, { recursive: true })
async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }
async function snap(page, name) {
  const p = path.join(SHOT, `r6_${name}.png`)
  await page.screenshot({ path: p, fullPage: true })
  console.log('  screenshot:', name)
}

async function main() {
  const { browser, page } = await open()
  const out = {}

  try {
    // 1. Get all row detail URLs and check for assigned drivers
    await page.goto('/delivery-status')
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
    await sleep(800)

    // Get all 配送No detail links
    const detailLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('tbody td'))
      const results = []
      for (const td of links) {
        const a = td.querySelector('a, button[class*="link"], [class*="detail"]')
        const text = td.textContent.trim()
        if (text === '詳細' || (a && text)) {
          const parent = td.parentElement // tr
          const cells = Array.from(parent.querySelectorAll('td')).map(c => c.textContent.trim())
          const link = a ? (a.getAttribute('href') || a.getAttribute('data-href') || '') : ''
          results.push({ cells: cells.slice(0,12), link })
        }
      }
      return results.slice(0,10)
    })
    out.detailLinks = detailLinks
    console.log('Detail links:', JSON.stringify(detailLinks, null, 2))

    // 2. Try to find rows by clicking on them
    const rows = await page.locator('tbody tr').all()
    const rowDetails = []
    for (let i = 0; i < Math.min(rows.length, 7); i++) {
      const cells = await rows[i].locator('td').allTextContents()
      rowDetails.push(cells.map(c => c.trim()))
    }
    out.allRowData = rowDetails
    console.log('All rows:', JSON.stringify(rowDetails, null, 2))

    // 3. Try clicking each row to get URLs - just first 3
    const detailUrls = []
    for (let i = 0; i < Math.min(rows.length, 5); i++) {
      await page.goto('/delivery-status')
      await sleep(500)
      const currentRows = await page.locator('tbody tr').all()
      if (currentRows.length <= i) break
      const detailBtn = currentRows[i].locator('a, [class*="link"], [class*="detail"]').first()
      const detailBtnCount = await detailBtn.count()
      if (detailBtnCount > 0) {
        await detailBtn.click()
      } else {
        await currentRows[i].click().catch(() => {})
      }
      await sleep(1000)
      const url = page.url().replace(/https?:\/\/[^/]+/, 'HOST')
      const driverText = await page.locator('body').evaluate(b => {
        const body = b.textContent
        return body.includes('未設定') ? '未設定' : (body.match(/DR\d+|配送スタッフ/) || [''])[0]
      })
      detailUrls.push({ idx: i, url, driverInfo: driverText })
      console.log(`Row ${i}: url=${url}, driver=${driverText}`)
    }
    out.detailUrls = detailUrls

    // 4. Check expanded search selects options
    await page.goto('/delivery-status')
    await sleep(600)
    const expandBtn = page.locator('button[aria-label="詳細条件を開く"]')
    await expandBtn.click()
    await sleep(600)

    // Click each ant-select to see options
    const antSelects = await page.locator('.ant-select:not(.ant-select-input)').all()
    const selectOptions = []
    for (let i = 0; i < Math.min(antSelects.length - 1, 5); i++) { // -1 to skip page size select at end
      try {
        await antSelects[i].click()
        await sleep(500)
        const opts = await page.locator('.ant-select-item-option').allTextContents()
        selectOptions.push({ idx: i, options: opts.slice(0,10) })
        console.log(`Select ${i} options:`, opts.slice(0,10))
        await page.keyboard.press('Escape')
        await sleep(300)
      } catch(e) { console.log(`Select ${i} error:`, e.message) }
    }
    out.selectOptions = selectOptions

    // 5. Check detail driver dropdown - navigate to an unassigned detail
    await page.goto('/delivery-status/9114')
    await sleep(1000)
    await snap(page, '01_detail_9114')

    // Check if driver dropdown is interactive (without clicking 編集 first)
    const driverSelect = page.locator('.ant-select').filter({ hasText: /配送スタッフ/ }).first()
    const driverSelectAlt = page.locator('[class*="ant-select"]').nth(1) // second ant-select
    const driverSelCount = await driverSelect.count()
    console.log('Driver select count:', driverSelCount)

    if (driverSelCount > 0) {
      try {
        await driverSelect.click()
        await sleep(600)
        const options = await page.locator('.ant-select-item-option, .ant-select-dropdown .ant-select-item').allTextContents()
        out.driverOptions = options.slice(0,5)
        console.log('Driver options after click (no edit):', options.slice(0,5))
        await snap(page, '02_driver_dropdown_open')
        await page.keyboard.press('Escape')
        await sleep(300)
      } catch(e) { console.log('Driver dropdown click error:', e.message) }
    }

    // Try clicking 編集 and see what changes
    const editBtn = page.locator('button').filter({ hasText: '編集' }).first()
    const editBtnCount = await editBtn.count()
    console.log('Edit btn count:', editBtnCount)
    if (editBtnCount > 0) {
      await editBtn.click()
      await sleep(800)
      await snap(page, '03_after_edit_click')
      const bodyAfterEdit = await page.locator('body').textContent()
      out.bodyAfterEdit = bodyAfterEdit.replace(/\s+/g, ' ').trim().slice(0, 400)
      console.log('Body after edit click:', out.bodyAfterEdit.slice(0,300))

      // Now try clicking driver dropdown
      const driverSelectAfterEdit = page.locator('.ant-select').filter({ hasText: /配送スタッフ/ }).first()
      if (await driverSelectAfterEdit.count() > 0) {
        await driverSelectAfterEdit.click()
        await sleep(600)
        const options2 = await page.locator('.ant-select-item-option').allTextContents()
        out.driverOptionsAfterEdit = options2.slice(0,10)
        console.log('Driver options after 編集:', options2.slice(0,10))
        await snap(page, '04_driver_dropdown_after_edit')

        // Check if options show count
        const firstOption = await page.locator('.ant-select-item-option').first().textContent().catch(() => '')
        out.firstDriverOption = firstOption
        console.log('First driver option:', firstOption)

        // Try searching in dropdown
        const searchInDropdown = page.locator('.ant-select-dropdown input, .ant-select-search input').first()
        const searchCount = await searchInDropdown.count()
        if (searchCount > 0) {
          await searchInDropdown.fill('DR000001')
          await sleep(500)
          const filteredOpts = await page.locator('.ant-select-item-option').allTextContents()
          out.filteredDriverOpts = filteredOpts.slice(0,5)
          console.log('Filtered driver opts for DR000001:', filteredOpts.slice(0,5))
          out.driverSearchBox = 'found'
        } else {
          out.driverSearchBox = 'not found'
        }
        await page.keyboard.press('Escape')
        await sleep(300)
      }

      // Check for キャンセル and 確定 buttons after 編集
      const btnTexts = await page.locator('button').allTextContents()
      out.btnsAfterEdit = btnTexts.filter(Boolean)
      console.log('Buttons after 編集:', out.btnsAfterEdit)
    }

    // 6. Tab navigation and tab 配送住所 detail check
    await page.goto('/delivery-status/9114')
    await sleep(800)
    // Click 配送住所 tab
    await page.locator('[role="tab"]').filter({ hasText: '配送住所' }).click()
    await sleep(600)
    await snap(page, '05_tab_chiso')
    const addressTabText = await page.locator('body').textContent()
    out.addressTabSnippet = addressTabText.replace(/\s+/g, ' ').trim().slice(0, 300)
    // Check for upload button
    const uploadBtnText = await page.locator('button, [class*="upload"]').allTextContents()
    out.uploadBtns = uploadBtnText.filter(Boolean)
    console.log('Upload btns:', uploadBtnText.filter(Boolean))

    // 7. Check 実績 tab with different detail
    await page.goto('/delivery-status')
    await sleep(600)
    // Click first row
    const firstRow2 = page.locator('tbody tr').first()
    const btn2 = firstRow2.locator('a, [class*="link"]').first()
    if (await btn2.count() > 0) await btn2.click()
    else await firstRow2.click()
    await sleep(1000)
    await page.locator('[role="tab"]').filter({ hasText: '実績' }).click()
    await sleep(600)
    await snap(page, '06_tab_jisseki')
    const jissekiText = await page.locator('body').textContent()
    out.jissekiSnippet = jissekiText.replace(/\s+/g, ' ').trim().slice(0, 300)
    console.log('実績 tab content:', out.jissekiSnippet.slice(0,200))

  } catch(e) {
    console.error('Recon6 error:', e.message)
    out.error = e.message
  } finally {
    fs.writeFileSync(path.join(SHOT, 'recon6_out.json'), JSON.stringify(out, null, 2))
    await browser.close()
    console.log('Recon6 done.')
  }
}

main().catch(e => { console.error(e); process.exit(1) })
