// Recon6 — detail page in-depth, form validation, edit mode
const { open } = require('../_helpers/session.js')
const path = require('path')
const fs = require('fs')

const REPORTS = path.resolve(__dirname, '../../../../reports/e05/staff')
fs.mkdirSync(REPORTS, { recursive: true })

const DRIVER_ID = 37  // Only available driver

async function recon6() {
  const { browser, page } = await open()
  try {
    // === Detail page ===
    await page.goto(`/driver/${DRIVER_ID}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    console.log('=== DETAIL PAGE ===')
    console.log('URL:', page.url())
    await page.screenshot({ path: path.join(REPORTS, 'recon6_01_detail_view.png'), fullPage: true })

    // Get full text content
    const bodyText = await page.locator('main, .ant-layout-content, [class*="content"]').first().textContent().catch(() => '')
    console.log('Content (first 600):', bodyText.replace(/\s+/g, ' ').substring(0, 600))

    // Check tabs structure
    const tabs = await page.locator('[role="tab"]').evaluateAll(els =>
      els.map(e => ({ text: e.textContent?.trim(), selected: e.getAttribute('aria-selected') }))
    )
    console.log('Tabs:', JSON.stringify(tabs))

    // Check all buttons
    const allBtns = await page.locator('button').evaluateAll(els =>
      els.map(e => ({ text: e.textContent?.trim(), disabled: e.disabled, cls: e.className.substring(0, 80) }))
    )
    console.log('All buttons:', JSON.stringify(allBtns, null, 2))

    // Check edit button specifically
    const editBtnSelector = 'button:not([disabled]):has-text("編集"), button:has-text("編集")'
    const editBtnCount = await page.locator('button').filter({ hasText: /編集/ }).count()
    console.log('Edit button count:', editBtnCount)

    // Check header area
    const headerText = await page.locator('h1, [class*="header"], [class*="page-title"]').first().textContent().catch(() => 'N/A')
    console.log('Header:', headerText)

    // Check password button
    const pwBtnEls = await page.locator('button').filter({ hasText: /パスワード/ }).evaluateAll(els =>
      els.map(e => ({ text: e.textContent?.trim(), disabled: e.disabled }))
    )
    console.log('Password buttons:', JSON.stringify(pwBtnEls))

    // Try clicking password button to see dialog
    const pwBtn = page.locator('button').filter({ hasText: /パスワード/ }).first()
    const pwBtnVisible = await pwBtn.isVisible().catch(() => false)
    const pwBtnEnabled = await pwBtn.isEnabled().catch(() => false)
    console.log('Password button visible/enabled:', pwBtnVisible, pwBtnEnabled)

    if (pwBtnVisible && pwBtnEnabled) {
      await pwBtn.click()
      await page.waitForTimeout(1000)
      await page.screenshot({ path: path.join(REPORTS, 'recon6_02_pw_dialog.png'), fullPage: true })
      const modalText = await page.locator('.ant-modal, [role="dialog"]').first().textContent().catch(() => 'N/A')
      console.log('PW modal text:', modalText?.trim().substring(0, 200))
      await page.keyboard.press('Escape')
      await page.waitForTimeout(500)
    }

    // Click edit button
    const editBtn = page.locator('button').filter({ hasText: /編集/ }).first()
    const editBtnEnabled = await editBtn.isEnabled().catch(() => false)
    console.log('Edit button enabled:', editBtnEnabled)

    if (editBtnEnabled) {
      await editBtn.click()
      await page.waitForTimeout(1000)
      console.log('\n=== EDIT MODE ===')
      console.log('URL after edit click:', page.url())
      await page.screenshot({ path: path.join(REPORTS, 'recon6_03_edit_mode.png'), fullPage: true })

      // Check edit mode inputs
      const editInputs = await page.locator('input').evaluateAll(els =>
        els.map(e => ({ name: e.name, placeholder: e.placeholder, readonly: e.readOnly, type: e.type, value: e.value?.substring(0, 30) }))
      )
      console.log('Edit inputs:', JSON.stringify(editInputs, null, 2))

      // Check edit mode buttons
      const editBtns = await page.locator('button').evaluateAll(els =>
        els.filter(e => e.textContent?.trim()).map(e => ({ text: e.textContent?.trim(), disabled: e.disabled }))
      )
      console.log('Edit mode buttons:', JSON.stringify(editBtns, null, 2))

      // Try to click save without making changes to see save button behavior
      const saveBtn = page.locator('button').filter({ hasText: /保存|保 存|登録/ }).first()
      const saveBtnVisible = await saveBtn.isVisible().catch(() => false)
      console.log('Save button visible:', saveBtnVisible)

      // Click cancel to go back to view mode
      const cancelBtn = page.locator('button').filter({ hasText: /キャンセル/ }).first()
      const cancelBtnVisible = await cancelBtn.isVisible().catch(() => false)
      console.log('Cancel button visible:', cancelBtnVisible)

      if (cancelBtnVisible) {
        await cancelBtn.click()
        await page.waitForTimeout(500)
        console.log('After cancel URL:', page.url())
      }
    }

    // Check tab 担当配送情報
    const tab2 = page.locator('[role="tab"]').filter({ hasText: /担当配送情報/ }).first()
    const tab2Visible = await tab2.isVisible().catch(() => false)
    if (tab2Visible) {
      await tab2.click()
      await page.waitForTimeout(1500)
      console.log('\n=== TAB 担当配送情報 ===')
      await page.screenshot({ path: path.join(REPORTS, 'recon6_04_tab2.png'), fullPage: true })
      console.log('URL:', page.url())
      const tab2Text = await page.locator('main, .ant-layout-content').first().textContent().catch(() => '')
      console.log('Tab2 content (400):', tab2Text.replace(/\s+/g, ' ').substring(0, 400))
    }

    // Check tab 変更履歴
    const tab3 = page.locator('[role="tab"]').filter({ hasText: /変更履歴/ }).first()
    const tab3Visible = await tab3.isVisible().catch(() => false)
    if (tab3Visible) {
      await tab3.click()
      await page.waitForTimeout(1500)
      console.log('\n=== TAB 変更履歴 ===')
      await page.screenshot({ path: path.join(REPORTS, 'recon6_05_tab3.png'), fullPage: true })
      console.log('URL:', page.url())
      const tab3Text = await page.locator('main, .ant-layout-content').first().textContent().catch(() => '')
      console.log('Tab3 content (400):', tab3Text.replace(/\s+/g, ' ').substring(0, 400))

      // Check table headers in 変更履歴
      const changeHeaders = await page.locator('table th').allTextContents().catch(() => [])
      console.log('変更履歴 table headers:', changeHeaders)
    }

    // === Test list page checkbox + アカウント一括発行 ===
    await page.goto('/driver')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    console.log('\n=== CHECKBOX TEST ===')

    // Find the row checkbox (not header checkbox)
    const rowCheckboxes = await page.locator('table tbody tr').filter({ has: page.locator('a') }).locator('input[type="checkbox"]')
    const rowCbCount = await rowCheckboxes.count()
    console.log('Row checkboxes count:', rowCbCount)

    // Check initial state of アカウント一括発行 button
    const bulkBtn = page.getByRole('button', { name: /アカウント一括発行/ })
    const bulkBtnDisabled = await bulkBtn.isDisabled().catch(() => false)
    console.log('Bulk button disabled initially:', bulkBtnDisabled)

    // Click row checkbox
    if (rowCbCount > 0) {
      await rowCheckboxes.first().click()
      await page.waitForTimeout(500)
      const bulkBtnDisabledAfter = await bulkBtn.isDisabled().catch(() => false)
      console.log('Bulk button disabled after selecting row:', bulkBtnDisabledAfter)

      // Now click bulk button to see modal
      if (!bulkBtnDisabledAfter) {
        await bulkBtn.click()
        await page.waitForTimeout(1000)
        await page.screenshot({ path: path.join(REPORTS, 'recon6_06_bulk_modal.png'), fullPage: true })
        const modalText = await page.locator('.ant-modal, [role="dialog"]').first().textContent().catch(() => 'N/A')
        console.log('Bulk modal text:', modalText?.trim().substring(0, 300))

        // Check modal buttons
        const modalBtns = await page.locator('.ant-modal button, [role="dialog"] button').evaluateAll(els =>
          els.map(e => ({ text: e.textContent?.trim(), disabled: e.disabled }))
        )
        console.log('Modal buttons:', JSON.stringify(modalBtns))

        // Close with キャンセル
        await page.locator('.ant-modal button').filter({ hasText: /キャンセル/ }).first().click().catch(async () => {
          await page.keyboard.press('Escape')
        })
        await page.waitForTimeout(500)

        // Check checkbox still selected after cancel
        const cbChecked = await rowCheckboxes.first().isChecked().catch(() => false)
        console.log('Row checkbox still checked after cancel:', cbChecked)
      }
    }

    // === Test form validation more carefully ===
    await page.goto('/driver/create')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    console.log('\n=== FORM VALIDATION ===')

    // Fill only name, then try to submit
    await page.locator('input[name="driverName"]').fill('テスト太郎')
    await page.waitForTimeout(300)
    await page.locator('input[name="driverName"]').press('Tab')
    await page.waitForTimeout(800)
    const kanaAfter = await page.locator('input[name="nameKana"]').inputValue().catch(() => 'N/A')
    console.log('Kana after tab from name:', kanaAfter)

    // Test name field - fill invalid kana
    await page.locator('input[name="nameKana"]').fill('やまだたろう')
    await page.locator('input[name="phone"]').fill('090-ABCD')
    await page.locator('input[name="email"]').fill('user_a_invalid')

    // Click submit
    const submitBtn = page.locator('button').filter({ hasText: /登/ }).last()
    await submitBtn.click()
    await page.waitForTimeout(1500)
    await page.screenshot({ path: path.join(REPORTS, 'recon6_07_form_validation.png'), fullPage: true })

    const errMessages = await page.locator('.ant-form-item-explain-error').allTextContents().catch(() => [])
    console.log('Error messages after submit:', errMessages)

    // Also check any tooltip or popover messages
    const tooltips = await page.locator('[class*="tooltip"], [role="tooltip"]').allTextContents().catch(() => [])
    console.log('Tooltips:', tooltips)

    // Check the state of form after invalid submit
    const bodyAfterSubmit = await page.locator('main, .ant-layout-content').first().textContent().catch(() => '')
    console.log('Content after submit (400):', bodyAfterSubmit.replace(/\s+/g, ' ').substring(0, 400))

    // Also try individual field validation
    // Clear driverName and blur
    await page.locator('input[name="driverName"]').clear()
    await page.locator('input[name="driverName"]').press('Tab')
    await page.waitForTimeout(500)
    const nameErr = await page.locator('.ant-form-item-explain-error').first().textContent().catch(() => 'N/A')
    console.log('Name error after clear+blur:', nameErr)

    // Check for file input
    const fileInput = page.locator('input[type="file"]')
    const fileVisible = await fileInput.isVisible().catch(() => false)
    console.log('File input visible:', fileVisible)

    // Check upload button
    const uploadBtn = page.getByRole('button', { name: /写真を追加|アップロード/ })
    const uploadBtnVisible = await uploadBtn.isVisible().catch(() => false)
    console.log('Upload button visible:', uploadBtnVisible)

  } catch (e) {
    console.error('Error:', e.message)
    console.error(e.stack?.substring(0, 500))
    await page.screenshot({ path: path.join(REPORTS, 'recon6_error.png'), fullPage: true }).catch(() => {})
  } finally {
    await browser.close()
  }
}

recon6().catch(console.error)
