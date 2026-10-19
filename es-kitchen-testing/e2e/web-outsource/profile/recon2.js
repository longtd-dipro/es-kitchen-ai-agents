// Recon 2 — prefecture field, validation messages, delivery tab edit mode
const { open } = require('../_helpers/session.js')
const path = require('path')
const fs = require('fs')

const REPORT_DIR = path.resolve(__dirname, '../../../reports/e05/profile')
function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function main() {
  const { browser, page } = await open()
  await page.goto('/profile')
  await sleep(1000)

  // Enter edit mode
  await page.getByRole('button', { name: '編集' }).click()
  await sleep(1000)
  await page.screenshot({ path: path.join(REPORT_DIR, 'recon2_01_edit.png') })

  // Check prefecture element more carefully
  const prefEl = page.locator('[name="prefecture"]')
  const prefTag = await prefEl.evaluate(el => el.tagName)
  const prefRole = await prefEl.evaluate(el => el.getAttribute('role'))
  const prefClass = await prefEl.evaluate(el => el.getAttribute('class'))
  console.log('prefecture tag:', prefTag, 'role:', prefRole, 'class:', prefClass?.substring(0, 100))

  // Check parent element of prefecture
  const prefParentHtml = await prefEl.evaluate(el => el.parentElement?.innerHTML.substring(0, 300))
  console.log('prefecture parent HTML:', prefParentHtml)

  // Check combobox role elements
  const comboboxes = await page.locator('[role="combobox"]').all()
  console.log('Combobox elements count:', comboboxes.length)
  for (const cb of comboboxes) {
    const text = await cb.textContent()
    const name = await cb.getAttribute('name')
    const id = await cb.getAttribute('id')
    console.log('  Combobox: name=', name, 'id=', id, 'text=', text?.trim().substring(0, 40))
  }

  // Check listbox role
  const listboxes = await page.locator('[role="listbox"]').all()
  console.log('Listbox count:', listboxes.length)

  // Check Ant Design Select
  const antSelects = await page.locator('.ant-select').all()
  console.log('Ant Select count:', antSelects.length)
  for (const sel of antSelects) {
    const text = await sel.textContent()
    const classes = await sel.getAttribute('class')
    console.log('  Ant Select text:', text?.trim().substring(0, 50), 'class:', classes?.substring(0, 80))
  }

  // Try clicking prefecture to see if it's a dropdown
  try {
    await prefEl.click()
    await sleep(500)
    await page.screenshot({ path: path.join(REPORT_DIR, 'recon2_02_prefecture_click.png') })
    const dropdownItems = await page.locator('.ant-select-item, [role="option"]').all()
    console.log('Dropdown items after click:', dropdownItems.length)
    if (dropdownItems.length > 0) {
      const firstItem = await dropdownItems[0].textContent()
      console.log('First dropdown item:', firstItem)
    }
    // Press Escape to close
    await page.keyboard.press('Escape')
    await sleep(500)
  } catch (e) {
    console.log('Prefecture click error:', e.message)
  }

  // Check 担当者 table structure
  const tableRows = await page.locator('table tbody tr').all()
  console.log('\n担当者 table rows:', tableRows.length)
  for (let i = 0; i < tableRows.length; i++) {
    const cells = await tableRows[i].locator('td').all()
    const cellTexts = []
    for (const cell of cells) {
      const text = await cell.textContent()
      const inputsInCell = await cell.locator('input').count()
      const selectsInCell = await cell.locator('select, [role="combobox"]').count()
      cellTexts.push(`${text?.trim().substring(0, 20)}(inp:${inputsInCell},sel:${selectsInCell})`)
    }
    console.log('  Row', i, ':', cellTexts.join(' | '))
  }

  // Test: clear delivererName and click 保存, see error
  console.log('\n=== Testing empty name validation ===')
  const nameInput = page.locator('input[name="delivererName"]')
  const originalName = await nameInput.inputValue()
  console.log('Original name:', originalName)

  await nameInput.triple_click().catch(async () => {
    await nameInput.click()
    await page.keyboard.selectAll()
  })
  await nameInput.fill('')
  await sleep(300)

  // Click 保存 (text is "保 存")
  const saveBtn = page.locator('button').filter({ hasText: /保/ }).filter({ hasText: /存/ }).first()
  const saveBtnText = await saveBtn.textContent()
  console.log('Save button text:', saveBtnText)
  await saveBtn.click()
  await sleep(1000)
  await page.screenshot({ path: path.join(REPORT_DIR, 'recon2_03_validation_error.png') })

  // Check for error messages
  const errorMessages = await page.locator('[class*="error"], [class*="Error"], .ant-form-item-explain-error, [role="alert"]').all()
  console.log('Error messages count:', errorMessages.length)
  for (const err of errorMessages) {
    const text = await err.textContent()
    console.log('  Error:', text?.trim().substring(0, 100))
  }

  // Check all visible text containing error keywords
  const bodyText = await page.locator('body').textContent()
  const errorLines = bodyText.split('\n').filter(line =>
    line.includes('入力してください') || line.includes('以内') || line.includes('形式') || line.includes('Error')
  )
  console.log('Error-containing lines:', errorLines.join('\n'))

  // Cancel to restore
  await page.getByRole('button', { name: /キャンセル/ }).click()
  await sleep(500)

  // Go to delivery info tab and enter edit mode
  console.log('\n=== Delivery info tab edit mode ===')
  await page.goto('/profile?tab=delivery')
  await sleep(1000)
  await page.screenshot({ path: path.join(REPORT_DIR, 'recon2_04_delivery_view.png') })

  // Check buttons on delivery tab
  const deliveryButtons = await page.locator('button').all()
  console.log('Delivery tab buttons:')
  for (const btn of deliveryButtons) {
    const text = await btn.textContent()
    console.log('  Button:', text?.trim().substring(0, 50))
  }

  // Try edit mode on delivery tab
  try {
    const editBtnDelivery = page.getByRole('button', { name: '編集' })
    await editBtnDelivery.click()
    await sleep(1000)
    await page.screenshot({ path: path.join(REPORT_DIR, 'recon2_05_delivery_edit.png') })

    // Check checkboxes/radios
    const checkboxes = await page.locator('input[type="checkbox"]').all()
    const radios = await page.locator('input[type="radio"]').all()
    console.log('Checkboxes count:', checkboxes.length)
    console.log('Radios count:', radios.length)

    const editBody = await page.locator('body').textContent()
    console.log('Delivery edit body (first 1000):', editBody.substring(0, 1000))

    // Look for checkboxes/radio structure
    const checkboxLabels = await page.locator('.ant-checkbox-wrapper, .ant-radio-wrapper').all()
    console.log('Ant checkbox/radio wrappers:', checkboxLabels.length)
    for (const cb of checkboxLabels.slice(0, 10)) {
      const text = await cb.textContent()
      const checked = await cb.locator('input').getAttribute('checked').catch(() => null)
      console.log('  Checkbox/Radio:', text?.trim().substring(0, 40), 'checked:', checked)
    }

    // Check 対応エリア structure
    const areaTags = await page.locator('[class*="tag"], [class*="Tag"], .ant-tag').all()
    console.log('\n対応エリア tags count:', areaTags.length)

    // Cancel delivery edit
    const cancelBtnDelivery = page.getByRole('button', { name: /キャンセル/ })
    if (await cancelBtnDelivery.count() > 0) {
      await cancelBtnDelivery.click()
      await sleep(500)
    }
  } catch (e) {
    console.log('Delivery edit error:', e.message)
  }

  await browser.close()
  console.log('\nRecon2 done.')
}

main().catch(e => { console.error('RECON2 ERROR:', e.message); process.exit(1) })
