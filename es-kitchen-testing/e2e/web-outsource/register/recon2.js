/**
 * Recon 2 — check error messages, button states, select options
 */
const path = require('path')
const fs = require('fs')
const { open } = require('../_helpers/session.js')

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }
const REPORT_DIR = path.resolve(__dirname, '../../../reports/e05/register')

async function main() {
  const { browser, page } = await open({ anonymous: true })
  try {
    // Navigate to register page
    await page.goto('/register')
    await page.waitForLoadState('networkidle')
    await sleep(300)

    console.log('=== PAGE URL ===', page.url())

    // Check 次へ button initial state
    const nextBtn = page.getByRole('button', { name: '次へ' })
    const nextDisabled = await nextBtn.isDisabled()
    console.log('次へ disabled initially:', nextDisabled)

    // Check キャンセル button state
    const cancelDisabled = await page.getByRole('button', { name: 'キャンセル' }).isDisabled()
    console.log('キャンセル disabled initially:', cancelDisabled)

    // Click 次へ with empty form
    await nextBtn.click()
    await sleep(500)

    // Capture all error messages
    const errors = await page.locator('[class*="ant-form-item-explain-error"]').allTextContents()
    console.log('\n=== ERRORS after clicking 次へ (empty form) ===')
    errors.forEach((e, i) => console.log(`  [${i}]: "${e}"`))

    // Take screenshot
    await page.screenshot({ path: path.join(REPORT_DIR, 'recon-03-errors-empty.png'), fullPage: true })

    // Check if still on same page
    console.log('\nURL after click:', page.url())

    // Now check ant-select options for 区分
    await page.goto('/register')
    await page.waitForLoadState('networkidle')
    await sleep(300)

    // Click on first ant-select (区分)
    const antSelects = page.locator('.ant-select:not(.ant-select-disabled)').first()
    await antSelects.click()
    await sleep(300)

    const options = await page.locator('.ant-select-item-option-content').allTextContents()
    console.log('\n=== 区分 dropdown options ===', options)
    await page.keyboard.press('Escape')

    // Click second ant-select (都道府県)
    const antSelects2 = page.locator('.ant-select:not(.ant-select-disabled)').nth(1)
    await antSelects2.click()
    await sleep(300)
    const options2 = await page.locator('.ant-select-item-option-content').allTextContents()
    console.log('\n=== 都道府県 dropdown options (first 5) ===', options2.slice(0, 5), '...')
    await page.keyboard.press('Escape')

    // Test postalcode lookup
    await page.getByPlaceholder('郵便番号').fill('1600023')
    await page.getByRole('button', { name: '住所検索' }).click()
    await sleep(1000)
    const buildingVal = await page.getByPlaceholder('建物・部屋番号').inputValue()
    const cityVal = await page.getByPlaceholder('市区町村').inputValue()
    const streetVal = await page.getByPlaceholder('町域・番地').inputValue()
    const prefectureVal = await page.locator('.ant-select-selection-item').nth(1).textContent().catch(() => '')
    console.log('\n=== After 住所検索 with 1600023 ===')
    console.log('都道府県:', prefectureVal)
    console.log('市区町村:', cityVal)
    console.log('町域番地:', streetVal)
    console.log('建物:', buildingVal)

    // Check required mark on building
    const pageText = await page.locator('body').innerText()
    const buildingRequired = pageText.includes('建物・部屋番号*')
    console.log('\n建物・部屋番号 has * (required mark):', buildingRequired)

    // Test invalid postal code
    await page.getByPlaceholder('郵便番号').fill('0000000')
    await page.getByRole('button', { name: '住所検索' }).click()
    await sleep(1000)
    const cityAfterInvalid = await page.getByPlaceholder('市区町村').inputValue()
    console.log('\nCity after invalid postal 0000000:', cityAfterInvalid)

    // Check if building field is optional or required
    await page.getByPlaceholder('委託配送先名').fill('テスト運送')
    await page.getByPlaceholder('カナ').fill('テストウンソウ')
    await page.getByPlaceholder('郵便番号').fill('1600023')
    await page.getByRole('button', { name: '住所検索' }).click()
    await sleep(1000)

    // Fill contacts row
    await page.getByPlaceholder('担当　太郎').fill('テスト太郎')
    await page.getByPlaceholder('タントウ　タロウ').fill('テストタロウ')
    await page.getByPlaceholder('sample@gmail.com').fill('user_b@example.com')
    await page.getByPlaceholder('012-345-6789').fill('090-0000-0000')
    await page.locator('[name="tel"]').fill('090-0000-0000')

    // Select 区分 first option
    await page.locator('.ant-select:not(.ant-select-disabled)').first().click()
    await sleep(300)
    const opts = await page.locator('.ant-select-item-option-content').allTextContents()
    if (opts.length > 0) {
      await page.locator('.ant-select-item-option-content').first().click()
      await sleep(200)
    }

    // Now try submit to check building
    await nextBtn.click()
    await sleep(500)
    const errsAfterFill = await page.locator('[class*="ant-form-item-explain-error"]').allTextContents()
    console.log('\n=== ERRORS after filling required fields (building empty) ===')
    errsAfterFill.forEach((e, i) => console.log(`  [${i}]: "${e}"`))
    console.log('URL:', page.url())

    await page.screenshot({ path: path.join(REPORT_DIR, 'recon-04-errors-partial.png'), fullPage: true })

  } finally {
    await browser.close()
  }
}

main().catch(e => { console.error('RECON2 ERROR:', e.message); process.exit(1) })
