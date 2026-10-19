// Recon 3 — validation messages + delivery edit mode
const { open } = require('../_helpers/session.js')
const path = require('path')
const fs = require('fs')

const REPORT_DIR = path.resolve(__dirname, '../../../reports/e05/profile')
function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function getErrors(page) {
  const errs = await page.locator('.ant-form-item-explain-error').all()
  const msgs = []
  for (const e of errs) msgs.push(await e.textContent())
  return msgs
}

async function main() {
  const { browser, page } = await open()
  await page.goto('/profile')
  await sleep(1000)

  // Enter edit mode
  await page.getByRole('button', { name: '編集' }).click()
  await sleep(1000)

  // Test: clear name and save
  const nameInput = page.locator('input[name="delivererName"]')
  await nameInput.click()
  await nameInput.fill('')
  await sleep(300)
  const saveBtn = page.locator('button').filter({ hasText: /保/ }).first()
  await saveBtn.click()
  await sleep(1500)
  await page.screenshot({ path: path.join(REPORT_DIR, 'recon3_01_name_empty_error.png') })
  console.log('Empty name errors:', await getErrors(page))

  // Test: 51 chars name
  await nameInput.fill('A'.repeat(51))
  await saveBtn.click()
  await sleep(1000)
  console.log('51-char name errors:', await getErrors(page))

  // Restore name
  await nameInput.fill('ホアン31運送株式会社')

  // Test: katakana half-width in kana
  const kanaInput = page.locator('input[name="delivererNameKana"]')
  await kanaInput.click()
  await kanaInput.fill('ｺﾝﾊﾟﾆｰ')
  await saveBtn.click()
  await sleep(1000)
  console.log('Kana half-width errors:', await getErrors(page))

  // Restore kana
  await kanaInput.fill('ホアンサンイチウンソウ')

  // Test: empty postal code
  const zipInput = page.locator('input[name="postalCode"]')
  const zipOrig = await zipInput.inputValue()
  await zipInput.click()
  await zipInput.fill('')
  await saveBtn.click()
  await sleep(1000)
  console.log('Empty zip errors:', await getErrors(page))

  // Test: wrong format zip (6 digits)
  await zipInput.fill('100000')
  await saveBtn.click()
  await sleep(1000)
  console.log('Wrong zip format errors:', await getErrors(page))

  // Restore zip
  await zipInput.fill(zipOrig)

  // Test: empty prefecture
  const prefInput = page.locator('input[name="prefecture"]')
  const prefOrig = await prefInput.inputValue()
  await prefInput.click()
  await prefInput.fill('')
  await saveBtn.click()
  await sleep(1000)
  console.log('Empty prefecture errors:', await getErrors(page))
  await page.screenshot({ path: path.join(REPORT_DIR, 'recon3_02_prefecture_empty_error.png') })

  // Restore prefecture
  await prefInput.fill(prefOrig)

  // Test: empty city
  const cityInput = page.locator('input[name="city"]')
  const cityOrig = await cityInput.inputValue()
  await cityInput.click()
  await cityInput.fill('')
  await saveBtn.click()
  await sleep(1000)
  console.log('Empty city errors:', await getErrors(page))

  // Restore city
  await cityInput.fill(cityOrig)

  // Test: empty street
  const streetInput = page.locator('input[name="street"]')
  const streetOrig = await streetInput.inputValue()
  await streetInput.click()
  await streetInput.fill('')
  await saveBtn.click()
  await sleep(1000)
  console.log('Empty street errors:', await getErrors(page))

  // Restore street
  await streetInput.fill(streetOrig)

  // Test: empty tel
  const telInput = page.locator('input[name="tel"]')
  const telOrig = await telInput.inputValue()
  await telInput.click()
  await telInput.fill('')
  await saveBtn.click()
  await sleep(1000)
  console.log('Empty tel errors:', await getErrors(page))

  // Test: wrong tel format
  await telInput.fill('090-000-000')
  await saveBtn.click()
  await sleep(1000)
  console.log('Wrong tel format errors:', await getErrors(page))

  // Restore tel
  await telInput.fill(telOrig)

  // Test: empty contact name
  const contactNameInput = page.locator('input[name="contacts.0.name"]')
  const contactNameOrig = await contactNameInput.inputValue()
  await contactNameInput.click()
  await contactNameInput.fill('')
  await saveBtn.click()
  await sleep(1000)
  console.log('Empty contact name errors:', await getErrors(page))
  await page.screenshot({ path: path.join(REPORT_DIR, 'recon3_03_contact_name_error.png') })

  // Restore contact name
  await contactNameInput.fill(contactNameOrig)

  // Test: wrong email format
  const emailInput = page.locator('input[name="contacts.0.email"]')
  const emailOrig = await emailInput.inputValue()
  await emailInput.click()
  await emailInput.fill('notanemail')
  await saveBtn.click()
  await sleep(1000)
  console.log('Wrong email format errors:', await getErrors(page))

  // Test: email > 256 chars
  await emailInput.fill('a'.repeat(250) + '@b.com')
  await saveBtn.click()
  await sleep(1000)
  console.log('Email too long errors:', await getErrors(page))

  // Restore email
  await emailInput.fill(emailOrig)

  // Cancel all
  await page.getByRole('button', { name: /キャンセル/ }).click()
  await sleep(500)

  // Now test zip autofill
  await page.getByRole('button', { name: '編集' }).click()
  await sleep(1000)

  const zipInput2 = page.locator('input[name="postalCode"]')
  await zipInput2.click()
  await zipInput2.fill('1000001')
  await zipInput2.press('Tab')
  await sleep(2000) // wait for autofill
  const prefAfter = await page.locator('input[name="prefecture"]').inputValue()
  const cityAfter = await page.locator('input[name="city"]').inputValue()
  const streetAfter = await page.locator('input[name="street"]').inputValue()
  console.log('\nAfter zip 1000001 + tab: pref=', prefAfter, 'city=', cityAfter, 'street=', streetAfter)
  await page.screenshot({ path: path.join(REPORT_DIR, 'recon3_04_zip_autofill.png') })

  // Test kana autofill
  const nameInput2 = page.locator('input[name="delivererName"]')
  const kanaInput2 = page.locator('input[name="delivererNameKana"]')
  await kanaInput2.fill('') // Clear kana first
  await nameInput2.click()
  await nameInput2.fill('山田商事')
  await nameInput2.press('Tab')
  await sleep(2000)
  const kanaAfter = await kanaInput2.inputValue()
  console.log('After name 山田商事 + tab: kana=', kanaAfter)

  // Cancel
  await page.getByRole('button', { name: /キャンセル/ }).click()
  await sleep(500)

  // ==== DELIVERY INFO TAB EDIT MODE ====
  await page.goto('/profile?tab=delivery')
  await sleep(1000)
  const deliveryEditBtn = page.getByRole('button', { name: '編集' })
  if (await deliveryEditBtn.count() > 0) {
    await deliveryEditBtn.click()
    await sleep(1000)
    await page.screenshot({ path: path.join(REPORT_DIR, 'recon3_05_delivery_edit.png') })

    const deliveryBody = await page.locator('body').textContent()
    console.log('\nDelivery edit body (first 1500):', deliveryBody.substring(0, 1500))

    const checkboxes = await page.locator('input[type="checkbox"]').all()
    console.log('Delivery checkboxes count:', checkboxes.length)

    const radios = await page.locator('input[type="radio"]').all()
    console.log('Delivery radios count:', radios.length)

    // Check for area tags / tree
    const areaTags = await page.locator('.ant-tag, [class*="tag"]').all()
    console.log('Area tags count:', areaTags.length)
    for (const tag of areaTags.slice(0, 5)) {
      const text = await tag.textContent()
      console.log('  Tag:', text?.trim())
    }

    // Check buttons in delivery edit
    const deliveryBtns = await page.locator('button').all()
    console.log('Delivery edit buttons:')
    for (const btn of deliveryBtns) {
      const text = await btn.textContent()
      console.log('  Btn:', text?.trim().substring(0, 50))
    }

    // Try save without area selection to see error
    const deliverySaveBtn = page.locator('button').filter({ hasText: /保/ }).first()
    if (await deliverySaveBtn.count() > 0) {
      // Check if 対応エリア has selections
      const checkedAreas = await page.locator('input[type="checkbox"]:checked').count()
      console.log('Checked areas initially:', checkedAreas)
    }

    // Cancel
    const cancelBtnDelivery = page.getByRole('button', { name: /キャンセル/ })
    if (await cancelBtnDelivery.count() > 0) {
      await cancelBtnDelivery.click()
      await sleep(500)
    }
  } else {
    console.log('No 編集 button on delivery tab')
    // Check what buttons exist
    const btns = await page.locator('button').all()
    for (const btn of btns) {
      const text = await btn.textContent()
      console.log('  Btn:', text?.trim())
    }
  }

  await browser.close()
  console.log('\nRecon3 done.')
}

main().catch(e => { console.error('RECON3 ERROR:', e.message); process.exit(1) })
