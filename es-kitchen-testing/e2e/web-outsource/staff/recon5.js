// Recon5 — check validation, detail page, dropdowns carefully
const { open } = require('../_helpers/session.js')
const path = require('path')
const fs = require('fs')

const REPORTS = path.resolve(__dirname, '../../../../reports/e05/staff')
fs.mkdirSync(REPORTS, { recursive: true })

async function recon5() {
  const { browser, page } = await open()
  try {
    // === Check form validation more carefully ===
    await page.goto('/driver/create')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    console.log('=== FORM CREATE ===')

    // Check the 区分 dropdown
    const divisionSelect = page.locator('.ant-select').nth(0)
    await divisionSelect.click()
    await page.waitForTimeout(500)
    const divOpts = await page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option').allTextContents().catch(() => [])
    console.log('区分 options:', divOpts)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)

    // Check ステータス dropdown
    const statusSelect = page.locator('.ant-select').nth(1)
    await statusSelect.click()
    await page.waitForTimeout(500)
    const statOpts = await page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option').allTextContents().catch(() => [])
    console.log('ステータス options:', statOpts)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)

    // Try to click 登録 without anything
    await page.getByRole('button', { name: /登/ }).last().click()
    await page.waitForTimeout(1500)
    await page.screenshot({ path: path.join(REPORTS, 'recon5_empty_submit.png'), fullPage: true })

    // Check error messages
    const errMsgs = await page.locator('.ant-form-item-explain-error').allTextContents().catch(() => [])
    console.log('Error messages:', errMsgs)

    // Check all elements with error text
    const allErrors = await page.locator('[class*="error"]').evaluateAll(els =>
      els.filter(e => e.textContent?.trim().length > 0).map(e => ({ cls: e.className.substring(0, 60), text: e.textContent?.trim() }))
    ).catch(() => [])
    console.log('All error elements:', JSON.stringify(allErrors.slice(0, 20), null, 2))

    // Fill name and check katakana auto-fill
    await page.locator('input[name="driverName"]').fill('テスト太郎')
    await page.locator('input[name="driverName"]').press('Tab')
    await page.waitForTimeout(1000)
    const kanaValue = await page.locator('input[name="nameKana"]').inputValue().catch(() => 'N/A')
    console.log('Katakana auto-fill value:', kanaValue)

    // === Check driver list page in more detail ===
    await page.goto('/driver')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    console.log('\n=== LIST PAGE DETAILED ===')

    // Check 区分 dropdown options properly
    await page.locator('.ant-select').nth(0).click()
    await page.waitForTimeout(500)
    const listDivOpts = await page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option').allTextContents().catch(() => [])
    console.log('List 区分 options:', listDivOpts)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)

    // Check ステータス dropdown
    await page.locator('.ant-select').nth(1).click()
    await page.waitForTimeout(500)
    const listStatOpts = await page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option').allTextContents().catch(() => [])
    console.log('List ステータス options:', listStatOpts)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)

    // Check pagination 件数/ページ dropdown
    const paginationSelects = await page.locator('.ant-pagination-options-size-changer .ant-select, .ant-pagination .ant-select').first()
    const pagSelectVisible = await paginationSelects.isVisible().catch(() => false)
    console.log('Pagination select visible:', pagSelectVisible)
    if (pagSelectVisible) {
      await paginationSelects.click()
      await page.waitForTimeout(500)
      const pageOpts = await page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option').allTextContents().catch(() => [])
      console.log('Pagination options:', pageOpts)
      await page.keyboard.press('Escape')
    }

    // Check the collapse/toggle button for search area
    // Look for button that has chevron/caret icon
    const toggleBtn = page.locator('button.text-txt-middle')
    const toggleBtnCount = await toggleBtn.count().catch(() => 0)
    console.log('Toggle button count:', toggleBtnCount)

    if (toggleBtnCount > 0) {
      const toggleBtnEl = toggleBtn.first()
      const isVisible = await toggleBtnEl.isVisible().catch(() => false)
      console.log('Toggle button visible:', isVisible)

      if (isVisible) {
        // Take screenshot before collapse
        await page.screenshot({ path: path.join(REPORTS, 'recon5_before_collapse.png'), fullPage: true })

        // Click toggle
        await toggleBtnEl.click()
        await page.waitForTimeout(500)
        await page.screenshot({ path: path.join(REPORTS, 'recon5_after_collapse.png'), fullPage: true })

        // Check if search area is hidden
        const searchInput = page.locator('input[name="q"]')
        const searchVisible = await searchInput.isVisible().catch(() => false)
        console.log('Search input visible after collapse:', searchVisible)

        // Click again to expand
        await toggleBtnEl.click()
        await page.waitForTimeout(500)
        const searchVisibleAfterExpand = await searchInput.isVisible().catch(() => false)
        console.log('Search input visible after expand:', searchVisibleAfterExpand)
      }
    }

    // Check if there's a sort button
    const sortBtn = page.locator('button').filter({ has: page.locator('svg') }).last()
    console.log('Sort button check done')

    // Get the 2nd row (actual data row - first row with ID like DR00xxx)
    const dataRows = await page.locator('table tbody tr').evaluateAll(rows =>
      rows.filter(row => row.querySelector('a')).map(row => ({
        id: row.querySelector('td:nth-child(4)')?.textContent?.trim(),
        name: row.querySelector('a')?.textContent?.trim(),
        href: row.querySelector('a')?.getAttribute('href'),
        status: row.querySelector('td:nth-child(8)')?.textContent?.trim(),
        accountStatus: row.querySelector('td:nth-child(9)')?.textContent?.trim()
      }))
    ).catch(() => [])
    console.log('Actual data rows:', JSON.stringify(dataRows, null, 2))

    // Navigate to detail page for first driver found
    if (dataRows.length > 0 && dataRows[0].href) {
      await page.goto(dataRows[0].href)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1500)

      console.log('\n=== DETAIL PAGE ===')
      console.log('URL:', page.url())
      await page.screenshot({ path: path.join(REPORTS, 'recon5_detail.png'), fullPage: true })

      // Check all detail content
      const content = await page.evaluate(() => {
        const items = []
        document.querySelectorAll('.ant-form-item, [class*="field"], [class*="row"]').forEach(item => {
          const label = item.querySelector('label')?.textContent?.trim()
          const value = item.querySelector('input')?.value || item.querySelector('.ant-select-selection-item')?.textContent?.trim() || item.querySelector('span')?.textContent?.trim()
          if (label && value) items.push({ label, value })
        })
        return items
      }).catch(() => [])
      console.log('Detail form content:', JSON.stringify(content.slice(0, 20), null, 2))

      // Check delete button
      const deleteBtn = await page.getByRole('button', { name: /削除/ }).isVisible().catch(() => false)
      console.log('Delete button visible:', deleteBtn)

      // Check password send button
      const pwBtn = await page.getByRole('button', { name: /パスワード|password/ }).isVisible().catch(() => false)
      console.log('Password button visible:', pwBtn)

      // Click delete button to check modal
      if (deleteBtn) {
        await page.getByRole('button', { name: /削除/ }).click()
        await page.waitForTimeout(1000)
        await page.screenshot({ path: path.join(REPORTS, 'recon5_delete_modal.png'), fullPage: true })

        const modalVisible = await page.locator('.ant-modal').isVisible().catch(() => false)
        console.log('Delete modal visible:', modalVisible)

        const modalText = await page.locator('.ant-modal').textContent().catch(() => 'N/A')
        console.log('Delete modal text:', modalText?.trim().substring(0, 200))

        // Close modal
        await page.keyboard.press('Escape')
        await page.waitForTimeout(500)
      }
    }

    // Test icon click from list
    await page.goto('/driver')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Find edit icon (pencil) in operation column
    const editIcons = page.locator('table tbody tr').filter({ has: page.locator('a') }).locator('button').nth(0)
    const editIconVisible = await editIcons.isVisible().catch(() => false)
    console.log('Edit icon visible:', editIconVisible)

    if (editIconVisible) {
      await editIcons.click()
      await page.waitForTimeout(1000)
      console.log('After edit click URL:', page.url())
      await page.screenshot({ path: path.join(REPORTS, 'recon5_edit_form.png'), fullPage: true })
      await page.goBack()
      await page.waitForTimeout(500)
    }

    // Find delete icon in operation column
    const deleteIcons = page.locator('table tbody tr').filter({ has: page.locator('a') }).locator('button').nth(1)
    const deleteIconVisible = await deleteIcons.isVisible().catch(() => false)
    console.log('Delete icon visible:', deleteIconVisible)

    if (deleteIconVisible) {
      await deleteIcons.click()
      await page.waitForTimeout(1000)
      await page.screenshot({ path: path.join(REPORTS, 'recon5_delete_from_list.png'), fullPage: true })

      const modalVisible = await page.locator('.ant-modal').isVisible().catch(() => false)
      console.log('Delete modal from list visible:', modalVisible)

      const modalText = await page.locator('.ant-modal').textContent().catch(() => 'N/A')
      console.log('Delete modal text from list:', modalText?.trim().substring(0, 300))

      // Close modal without deleting
      await page.keyboard.press('Escape')
      await page.waitForTimeout(500)
    }

  } catch (e) {
    console.error('Error:', e.message)
    console.error(e.stack)
    await page.screenshot({ path: path.join(REPORTS, 'recon5_error.png'), fullPage: true }).catch(() => {})
  } finally {
    await browser.close()
  }
}

recon5().catch(console.error)
