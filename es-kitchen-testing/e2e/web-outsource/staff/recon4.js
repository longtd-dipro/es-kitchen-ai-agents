// Recon4 — inspect rows, detail page, and key selectors
const { open } = require('../_helpers/session.js')
const path = require('path')
const fs = require('fs')

const REPORTS = path.resolve(__dirname, '../../../../reports/e05/staff')
fs.mkdirSync(REPORTS, { recursive: true })

async function recon4() {
  const { browser, page } = await open()
  try {
    await page.goto('/driver')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    // Get all table rows data
    const rowData = await page.locator('table tbody tr').evaluateAll(rows =>
      rows.map(row => ({
        cells: Array.from(row.querySelectorAll('td')).map(td => td.textContent?.trim()),
        links: Array.from(row.querySelectorAll('a')).map(a => ({ text: a.textContent?.trim(), href: a.getAttribute('href') })),
        buttons: Array.from(row.querySelectorAll('button')).map(b => ({ text: b.textContent?.trim(), cls: b.className.substring(0, 60) })),
        checkboxes: row.querySelectorAll('input[type="checkbox"]').length
      }))
    ).catch(() => [])
    console.log('Row data:', JSON.stringify(rowData, null, 2))

    // Check select options for 区分
    const select1 = page.locator('.ant-select').nth(0)
    await select1.click().catch(() => {})
    await page.waitForTimeout(500)
    const opts1 = await page.locator('.ant-select-item-option').allTextContents().catch(() => [])
    console.log('Select 1 options:', opts1)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)

    // Check select options for ステータス
    const select2 = page.locator('.ant-select').nth(1)
    await select2.click().catch(() => {})
    await page.waitForTimeout(500)
    const opts2 = await page.locator('.ant-select-item-option').allTextContents().catch(() => [])
    console.log('Select 2 options:', opts2)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)

    // Check pagination selector
    const select3 = page.locator('.ant-select').nth(2)
    await select3.click().catch(() => {})
    await page.waitForTimeout(500)
    const opts3 = await page.locator('.ant-select-item-option').allTextContents().catch(() => [])
    console.log('Select 3 options:', opts3)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)

    // Check if there's a toggle/collapse button
    const toggleBtn = page.locator('button:has(svg)').all()

    // Check search area and collapse toggle
    const searchSection = await page.evaluate(() => {
      // Find the collapsible search section
      const searchArea = document.querySelector('[class*="search"], [class*="filter"], .ant-collapse')
      return searchArea ? { cls: searchArea.className.substring(0, 100), visible: true } : null
    })
    console.log('Search section:', JSON.stringify(searchSection))

    // Check the toggle/collapse button for search area
    const collapseBtn = await page.locator('button').evaluateAll(els =>
      els.filter(e => {
        const hasChevron = e.innerHTML.includes('svg') && (e.textContent?.trim() === '' || e.classList.toString().includes('collapse'))
        return hasChevron
      }).map(e => ({ cls: e.className.substring(0, 80), innerHTML: e.innerHTML.substring(0, 100) }))
    ).catch(() => [])
    console.log('Collapse-like buttons:', JSON.stringify(collapseBtn.slice(0, 3), null, 2))

    // Check actual text button for 検索
    const searchBtn = await page.getByRole('button', { name: /検.*索|検索/ }).first().textContent().catch(() => 'N/A')
    console.log('Search button text:', searchBtn)

    // Navigate to first row detail page
    const firstNameLink = page.locator('table tbody tr:first-child').getByRole('link').first()
    const firstNameVisible = await firstNameLink.isVisible().catch(() => false)
    console.log('First name link visible:', firstNameVisible)

    if (firstNameVisible) {
      await firstNameLink.click()
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1500)

      console.log('\n=== DETAIL PAGE ===')
      console.log('URL:', page.url())
      await page.screenshot({ path: path.join(REPORTS, 'recon4_detail.png'), fullPage: true })

      // Get all text content
      const mainText = await page.locator('main, .ant-layout-content').first().textContent().catch(() => '')
      console.log('Main content (first 800):', mainText.replace(/\s+/g, ' ').substring(0, 800))

      // Check tabs
      const tabBtns = await page.locator('[role="tab"]').evaluateAll(els =>
        els.map(e => ({ text: e.textContent?.trim(), selected: e.getAttribute('aria-selected'), cls: e.className.substring(0, 60) }))
      )
      console.log('Tabs:', JSON.stringify(tabBtns, null, 2))

      // Check header buttons
      const headerBtns = await page.locator('button').evaluateAll(els =>
        els.filter(e => e.textContent?.trim().length > 0).map(e => ({ text: e.textContent?.trim(), disabled: e.disabled }))
      )
      console.log('Header/action buttons:', JSON.stringify(headerBtns, null, 2))

      // Check form fields in view mode
      const formItems = await page.locator('.ant-form-item').evaluateAll(items =>
        items.map(item => ({
          label: item.querySelector('.ant-form-item-label, label')?.textContent?.trim(),
          value: item.querySelector('.ant-form-item-control input, .ant-form-item-control .ant-select-selection-item, .ant-form-item-control span:not(.ant-form-item-children-icon)')?.textContent?.trim()
        }))
      ).catch(() => [])
      console.log('Form items:', JSON.stringify(formItems, null, 2))

      // Check the edit button
      const editBtn = await page.getByRole('button', { name: /編集/ }).isVisible().catch(() => false)
      console.log('Edit button visible:', editBtn)

      // Click edit button
      if (editBtn) {
        await page.getByRole('button', { name: /編集/ }).click()
        await page.waitForTimeout(1000)
        console.log('\n=== EDIT MODE ===')
        await page.screenshot({ path: path.join(REPORTS, 'recon4_edit_mode.png'), fullPage: true })

        const editBtns = await page.locator('button').evaluateAll(els =>
          els.filter(e => e.textContent?.trim().length > 0).map(e => ({ text: e.textContent?.trim(), type: e.type }))
        )
        console.log('Edit mode buttons:', JSON.stringify(editBtns, null, 2))

        const editInputs = await page.locator('input:not([type="search"])').evaluateAll(els =>
          els.map(e => ({ name: e.name, placeholder: e.placeholder, readonly: e.readOnly, type: e.type }))
        )
        console.log('Edit mode inputs:', JSON.stringify(editInputs, null, 2))
      }
    }

    // Check new form more thoroughly
    await page.goto('/driver/create')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    console.log('\n=== NEW FORM DETAILED ===')
    await page.screenshot({ path: path.join(REPORTS, 'recon4_new_form.png'), fullPage: true })

    // Try clicking 登録 without filling anything
    const regBtn = page.getByRole('button', { name: /^登\s*録$/ })
    const regBtnVisible = await regBtn.isVisible().catch(() => false)
    console.log('Registration button visible:', regBtnVisible)

    if (regBtnVisible) {
      await regBtn.click()
      await page.waitForTimeout(1000)
      await page.screenshot({ path: path.join(REPORTS, 'recon4_empty_submit.png'), fullPage: true })

      // Check validation errors
      const errors = await page.locator('.ant-form-item-explain-error, [class*="error"], [class*="invalid"]').allTextContents().catch(() => [])
      console.log('Validation errors on empty submit:', errors)

      const errorMessages = await page.locator('.ant-form-item-explain-error').allTextContents().catch(() => [])
      console.log('Form item errors:', errorMessages)
    }

  } catch (e) {
    console.error('Error:', e.message)
    console.error(e.stack)
    await page.screenshot({ path: path.join(REPORTS, 'recon4_error.png'), fullPage: true }).catch(() => {})
  } finally {
    await browser.close()
  }
}

recon4().catch(console.error)
