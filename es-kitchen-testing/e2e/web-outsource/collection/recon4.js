// Recon4 — date picker interaction (Ant Design range picker - readonly input)
// Run: node e2e/web-outsource/collection/recon4.js
'use strict'
const { open } = require('../_helpers/session.js')
const path = require('path')
const fs = require('fs')

const SHOT = path.resolve(__dirname, '../../../reports/e05/collection')
fs.mkdirSync(SHOT, { recursive: true })

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }
async function snap(page, name) {
  const p = path.join(SHOT, `recon4_${name}.png`)
  await page.screenshot({ path: p, fullPage: true })
  return p
}

async function main() {
  const { browser, page } = await open()
  const out = {}

  try {
    await page.goto('/collection-reports')
    await sleep(1500)

    // Method: click on start input to open datepicker
    const startInput = page.locator('input[placeholder="開始日"]')
    await startInput.click()
    await sleep(500)
    await snap(page, '01_datepicker_open')

    // Check if any calendar/dropdown opened
    const dpDropdown = page.locator('.ant-picker-dropdown')
    const dpVisible = await dpDropdown.isVisible().catch(() => false)
    out.dpVisible = dpVisible
    console.log('Datepicker dropdown visible:', dpVisible)

    if (dpVisible) {
      const dpHTML = await dpDropdown.innerHTML().catch(() => 'err')
      out.dpHTMLSample = dpHTML.slice(0, 500)
      console.log('DP HTML sample:', dpHTML.slice(0, 300))
    }

    // Try Ctrl+A then type
    await page.keyboard.press('Control+a')
    await page.keyboard.type('2026-08-01')
    await sleep(300)
    await snap(page, '02_after_type_start')
    const startVal = await startInput.inputValue()
    out.startAfterType = startVal
    console.log('Start after type:', startVal)

    // Tab to end date
    await page.keyboard.press('Tab')
    await sleep(300)
    await page.keyboard.type('2026-08-31')
    await page.keyboard.press('Enter')
    await sleep(500)
    await snap(page, '03_after_type_end')
    const endInput = page.locator('input[placeholder="終了日"]')
    const endVal = await endInput.inputValue()
    out.endAfterType = endVal
    console.log('End after type:', endVal)

    // Press Escape to close any picker
    await page.keyboard.press('Escape')
    await sleep(300)

    // Click search
    const searchBtn = page.locator('button').filter({ hasText: '検' }).first()
    await searchBtn.click()
    await sleep(2000)

    const dates = {
      start: await startInput.inputValue(),
      end: await endInput.inputValue()
    }
    out.datesAfterSearch = dates
    console.log('Dates after search:', dates)

    const bodyText = await page.locator('body').textContent()
    out.bodyTextAfterSearch = bodyText?.slice(0, 800)
    console.log('Body after search (aug):', bodyText?.slice(0, 600))
    await snap(page, '04_aug_search')

    // Check table
    const rows = await page.locator('tbody tr, .ant-table-tbody tr').count()
    out.augRows = rows
    console.log('Aug rows:', rows)

    // Try another approach: navigate datepicker via calendar
    // Click start date input
    await startInput.click()
    await sleep(500)
    const dpVisible2 = await page.locator('.ant-picker-dropdown').isVisible().catch(() => false)
    out.dpVisible2 = dpVisible2
    console.log('DP visible on 2nd click:', dpVisible2)

    if (dpVisible2) {
      // Look for input inside the dropdown
      const dpInputs = await page.locator('.ant-picker-dropdown input').all()
      out.dpInputCount = dpInputs.length
      console.log('DP inputs:', dpInputs.length)
      for (const inp of dpInputs) {
        const ph = await inp.getAttribute('placeholder')
        const val = await inp.inputValue().catch(() => 'readonly')
        console.log('  DP input:', ph, val)
      }

      // Try finding month/year header and navigate
      const monthYearHeader = await page.locator('.ant-picker-dropdown .ant-picker-header-view').textContent().catch(() => null)
      out.monthYearHeader = monthYearHeader
      console.log('Month/year header:', monthYearHeader)

      // Get all calendar cells
      const dayCells = await page.locator('.ant-picker-dropdown .ant-picker-cell').count()
      out.dayCellCount = dayCells
      console.log('Day cells:', dayCells)

      await snap(page, '05_datepicker_calendar')
    }

    // Try pressing keyboard in picker
    await page.keyboard.press('Escape')
    await sleep(300)

    // Try a different approach: use the picker wrapper
    // Look for .ant-picker element
    const antPicker = page.locator('.ant-picker, .ant-picker-range').first()
    const pickerClass = await antPicker.getAttribute('class')
    out.pickerClass = pickerClass
    console.log('Picker class:', pickerClass)

    // Check all ant-picker-input spans
    const pickerInputs = await page.locator('.ant-picker-input').all()
    out.pickerInputCount = pickerInputs.length
    for (const pi of pickerInputs) {
      const text = await pi.textContent()
      console.log('Picker input text:', text)
    }

    // Try clicking the ant-picker-input directly
    if (pickerInputs.length > 0) {
      await pickerInputs[0].click()
      await sleep(500)
      const dpVisible3 = await page.locator('.ant-picker-dropdown').isVisible().catch(() => false)
      out.dpVisible3 = dpVisible3
      console.log('DP visible on picker-input click:', dpVisible3)
      await snap(page, '06_picker_input_click')
      await page.keyboard.press('Escape')
    }

  } finally {
    await browser.close()
  }

  const outPath = path.join(SHOT, 'recon4_result.json')
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2))
  console.log('Recon4 done.')
}

main().catch(e => { console.error('RECON4 ERROR:', e.message, e.stack); process.exit(1) })
