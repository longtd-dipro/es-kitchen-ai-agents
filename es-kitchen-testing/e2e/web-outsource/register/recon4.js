/**
 * Recon 4 — format errors, 区分 validation, navigation to step2
 */
const path = require('path')
const fs = require('fs')
const { open } = require('../_helpers/session.js')

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }
const REPORT_DIR = path.resolve(__dirname, '../../../reports/e05/register')

async function getPageErrors(page) {
  const bodyText = await page.locator('body').innerText()
  return bodyText.split('\n')
    .map(l => l.trim())
    .filter(l => l.includes('必須') || l.includes('入力') || l.includes('選択') || l.includes('形式') || l.includes('以内') || l.includes('エラー') || l.includes('使用'))
}

async function main() {
  const { browser, page } = await open({ anonymous: true })
  try {
    // === TEST 1: Format validation messages ===
    await page.goto('/register')
    await page.waitForLoadState('networkidle')

    // Fill all required fields, then test format errors
    // Fill valid basics
    await page.getByPlaceholder('委託配送先名').fill('テスト運送')
    await page.getByPlaceholder('カナ').fill('テストウンソウ')
    await page.getByPlaceholder('郵便番号').fill('12345') // invalid format

    // Select prefecture
    await page.locator('.ant-select:not(.ant-select-disabled)').first().click()
    await sleep(300)
    const prefOptions = await page.locator('.ant-select-item-option-content').allTextContents()
    console.log('Prefecture options (first 5):', prefOptions.slice(0, 5))
    if (prefOptions.length > 0) {
      await page.locator('.ant-select-item-option-content').first().click()
      await sleep(200)
    }

    await page.getByPlaceholder('市区町村').fill('新宿区')
    await page.getByPlaceholder('町域・番地').fill('西新宿1-1')
    await page.getByPlaceholder('建物・部屋番号').fill('testbuilding')
    await page.locator('[name="tel"]').fill('123') // invalid
    await page.getByPlaceholder('FAX番号').fill('abc') // invalid

    // Contact row
    await page.locator('.ant-select:not(.ant-select-disabled)').nth(1).click()
    await sleep(300)
    const contactOptions = await page.locator('.ant-select-item-option-content').allTextContents()
    console.log('Contact options:', contactOptions)
    if (contactOptions.length > 0) {
      await page.locator('.ant-select-item-option-content').first().click()
      await sleep(200)
    }
    await page.getByPlaceholder('担当　太郎').fill('テスト太郎')
    await page.getByPlaceholder('タントウ　タロウ').fill('テストタロウ')
    await page.getByPlaceholder('sample@gmail.com').fill('not-an-email')
    await page.getByPlaceholder('012-345-6789').fill('123')

    await page.getByRole('button', { name: '次へ' }).click()
    await sleep(1000)

    const errs1 = await getPageErrors(page)
    console.log('\n=== ERRORS with invalid formats ===')
    errs1.forEach(e => console.log(' ', e))

    await page.screenshot({ path: path.join(REPORT_DIR, 'recon-07-format-errors.png'), fullPage: true })

    // === TEST 2: Navigate to step2 ===
    await page.goto('/register')
    await page.waitForLoadState('networkidle')

    // Fill step 1 with all required valid data
    await page.getByPlaceholder('委託配送先名').fill('テスト運送')
    await page.getByPlaceholder('カナ').fill('テストウンソウ')
    await page.getByPlaceholder('郵便番号').fill('1600023')
    await page.getByRole('button', { name: '住所検索' }).click()
    await sleep(2000)

    // Check if address was filled
    const cityAfterSearch = await page.getByPlaceholder('市区町村').inputValue()
    console.log('\nCity after 住所検索:', cityAfterSearch)

    // If not filled, fill manually
    if (!cityAfterSearch) {
      // Try clicking prefecture and selecting
      await page.locator('.ant-select:not(.ant-select-disabled)').first().click()
      await sleep(300)
      const prefOpts2 = await page.locator('.ant-select-item-option-content').allTextContents()
      // Find 東京都
      const tokyo = prefOpts2.findIndex(o => o.includes('東京'))
      console.log('Tokyo index:', tokyo, 'All opts:', prefOpts2.slice(0, 10))
      if (tokyo >= 0) {
        await page.locator('.ant-select-item-option-content').nth(tokyo).click()
      } else if (prefOpts2.length > 0) {
        await page.locator('.ant-select-item-option-content').first().click()
      }
      await sleep(200)
      await page.getByPlaceholder('市区町村').fill('新宿区')
      await page.getByPlaceholder('町域・番地').fill('西新宿1-1')
    }

    await page.getByPlaceholder('建物・部屋番号').fill('テストビル')
    await page.locator('[name="tel"]').fill('090-0000-0000')
    await page.getByPlaceholder('FAX番号').fill('090-0000-0000')

    // Contact row - select 区分
    await page.locator('.ant-select:not(.ant-select-disabled)').nth(1).click()
    await sleep(300)
    const cntOpts = await page.locator('.ant-select-item-option-content').allTextContents()
    console.log('\nContact 区分 options:', cntOpts)
    if (cntOpts.length > 0) {
      // find メイン
      const main = cntOpts.findIndex(o => o.includes('メイン'))
      if (main >= 0) {
        await page.locator('.ant-select-item-option-content').nth(main).click()
      } else {
        await page.locator('.ant-select-item-option-content').first().click()
      }
      await sleep(200)
    }
    await page.getByPlaceholder('担当　太郎').fill('テスト太郎')
    await page.getByPlaceholder('タントウ　タロウ').fill('テストタロウ')
    await page.getByPlaceholder('sample@gmail.com').fill('user_b@example.com')
    await page.getByPlaceholder('012-345-6789').fill('090-0000-0000')

    await page.screenshot({ path: path.join(REPORT_DIR, 'recon-08-step1-filled.png'), fullPage: true })

    // Click 次へ
    await page.getByRole('button', { name: '次へ' }).click()
    await sleep(1500)

    const urlAfterNext = page.url()
    const bodyAfterNext = await page.locator('body').innerText()
    const errsAfterNext = bodyAfterNext.split('\n').filter(l => l.trim() && (l.includes('必須') || l.includes('選択') || l.includes('入力')))
    console.log('\n=== After 次へ with all fields ===')
    console.log('URL:', urlAfterNext)
    console.log('Errors:', errsAfterNext)
    console.log('Body snippet:', bodyAfterNext.substring(0, 500))

    await page.screenshot({ path: path.join(REPORT_DIR, 'recon-09-after-next.png'), fullPage: true })

    // If navigated to step 2, check step 2 structure
    if (bodyAfterNext.includes('対応エリア') || bodyAfterNext.includes('保有車両') || bodyAfterNext.includes('ステップ 2')) {
      console.log('\n=== STEP 2 DETECTED ===')
      console.log('Step 2 content:', bodyAfterNext.substring(0, 1000))

      // Check 登録 button
      const registerBtnDisabled = await page.getByRole('button', { name: '登録' }).isDisabled().catch(() => 'not found')
      console.log('登録 button disabled:', registerBtnDisabled)

      // Check checkboxes (B.3)
      const checkboxes = await page.locator('input[type="checkbox"]').all()
      console.log('Checkboxes count:', checkboxes.length)

      await page.screenshot({ path: path.join(REPORT_DIR, 'recon-10-step2.png'), fullPage: true })

      // Check radio buttons
      const radios = await page.locator('input[type="radio"]').all()
      console.log('Radio count:', radios.length)

      // Check B.1.1 area tree
      const treeNodes = await page.locator('.ant-tree-node-content-wrapper, .ant-checkbox').count()
      console.log('Tree nodes:', treeNodes)
    }

  } finally {
    await browser.close()
  }
}

main().catch(e => { console.error('RECON4 ERROR:', e.message); process.exit(1) })
