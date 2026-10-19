// Recon3 — detailed inspection of /driver page
const { open } = require('../_helpers/session.js')
const path = require('path')
const fs = require('fs')

const REPORTS = path.resolve(__dirname, '../../../../reports/e05/staff')
fs.mkdirSync(REPORTS, { recursive: true })

async function recon3() {
  const { browser, page } = await open()
  try {
    await page.goto('/driver')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    console.log('=== DRIVER LIST PAGE ===')
    console.log('URL:', page.url())
    await page.screenshot({ path: path.join(REPORTS, 'recon3_01_list.png'), fullPage: true })

    // Check all buttons
    const buttons = await page.locator('button').evaluateAll(els =>
      els.map(e => ({ text: e.textContent?.trim(), disabled: e.disabled, cls: e.className.substring(0, 50) }))
    )
    console.log('Buttons:', JSON.stringify(buttons, null, 2))

    // Check table headers
    const thTexts = await page.locator('table th, thead td').allTextContents().catch(() => [])
    console.log('Table headers:', thTexts)

    // Check row count
    const rows = await page.locator('table tbody tr').count().catch(() => 0)
    console.log('Table rows:', rows)

    // Check first row data
    if (rows > 0) {
      const firstRowCells = await page.locator('table tbody tr:first-child td').allTextContents().catch(() => [])
      console.log('First row cells:', firstRowCells)
    }

    // Check inputs in search area
    const inputs = await page.locator('input').evaluateAll(els =>
      els.map(e => ({ type: e.type, placeholder: e.placeholder, name: e.name, value: e.value }))
    )
    console.log('Inputs:', JSON.stringify(inputs, null, 2))

    // Check selects/dropdowns
    const selects = await page.locator('select, .ant-select').evaluateAll(els =>
      els.map(e => ({ tag: e.tagName, cls: e.className.substring(0, 60) }))
    )
    console.log('Selects/dropdowns count:', selects.length)

    // Check pagination
    const pagination = await page.locator('.ant-pagination, [class*="pagination"]').first().textContent().catch(() => 'N/A')
    console.log('Pagination text:', pagination?.trim().substring(0, 200))

    // Check for checkboxes
    const checkboxes = await page.locator('input[type="checkbox"]').count().catch(() => 0)
    console.log('Checkboxes:', checkboxes)

    // Check status badges
    const badges = await page.locator('.ant-tag, [class*="badge"], [class*="status"], [class*="tag"]').allTextContents().catch(() => [])
    console.log('Badges/Tags:', badges.slice(0, 20))

    // Get text of any search area
    const searchArea = await page.locator('[class*="search"], [class*="filter"], .ant-form, form').first().textContent().catch(() => 'N/A')
    console.log('Search area text:', searchArea?.trim().substring(0, 300))

    // === Navigate to detail page ===
    // Try clicking first name link
    const nameLink = page.locator('table tbody tr:first-child td a').first()
    const nameLinkVisible = await nameLink.isVisible().catch(() => false)

    if (nameLinkVisible) {
      const nameText = await nameLink.textContent()
      console.log('First name link text:', nameText)
      await nameLink.click()
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      console.log('\n=== DETAIL PAGE ===')
      console.log('URL:', page.url())
      await page.screenshot({ path: path.join(REPORTS, 'recon3_02_detail.png'), fullPage: true })

      // Check detail page buttons
      const detailButtons = await page.locator('button').evaluateAll(els =>
        els.map(e => ({ text: e.textContent?.trim(), disabled: e.disabled }))
      )
      console.log('Detail buttons:', JSON.stringify(detailButtons, null, 2))

      // Check tabs
      const tabs = await page.locator('[role="tab"]').evaluateAll(els =>
        els.map(e => ({ text: e.textContent?.trim(), selected: e.getAttribute('aria-selected') }))
      )
      console.log('Tabs:', JSON.stringify(tabs, null, 2))

      // Check form fields
      const labels = await page.locator('label, .ant-form-item-label').allTextContents().catch(() => [])
      console.log('Form labels:', labels)

      // Check inputs/readonly fields
      const detailInputs = await page.locator('input').evaluateAll(els =>
        els.map(e => ({ type: e.type, name: e.name, value: e.value?.substring(0, 30), readonly: e.readOnly, placeholder: e.placeholder }))
      )
      console.log('Detail inputs:', JSON.stringify(detailInputs, null, 2))
    }

    // === Navigate to new registration form ===
    await page.goto('/driver')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Click new registration button
    const newBtn = page.getByRole('button', { name: /新規登録/ }).first()
    const newBtnVisible = await newBtn.isVisible().catch(() => false)
    console.log('\nNew registration button visible:', newBtnVisible)

    if (newBtnVisible) {
      await newBtn.click()
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      console.log('\n=== NEW REGISTRATION FORM ===')
      console.log('URL:', page.url())
      await page.screenshot({ path: path.join(REPORTS, 'recon3_03_new_form.png'), fullPage: true })

      // Check form fields
      const formLabels = await page.locator('label, .ant-form-item-label').allTextContents().catch(() => [])
      console.log('Form labels:', formLabels)

      const formInputs = await page.locator('input').evaluateAll(els =>
        els.map(e => ({ type: e.type, name: e.name, placeholder: e.placeholder, required: e.required }))
      )
      console.log('Form inputs:', JSON.stringify(formInputs, null, 2))

      const formButtons = await page.locator('button').evaluateAll(els =>
        els.map(e => ({ text: e.textContent?.trim(), type: e.type }))
      )
      console.log('Form buttons:', JSON.stringify(formButtons, null, 2))

      // Check selects
      const formSelects = await page.locator('.ant-select').evaluateAll(els =>
        els.map(e => ({ cls: e.className.substring(0, 80) }))
      )
      console.log('Form selects count:', formSelects.length)
    }

  } catch (e) {
    console.error('Error:', e.message)
    console.error(e.stack)
    await page.screenshot({ path: path.join(REPORTS, 'recon3_error.png'), fullPage: true }).catch(() => {})
  } finally {
    await browser.close()
  }
}

recon3().catch(console.error)
