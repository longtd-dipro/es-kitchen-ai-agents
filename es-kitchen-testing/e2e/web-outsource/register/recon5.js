/**
 * Recon 5 — proper ant-select interaction + navigate to step2
 */
const path = require('path')
const fs = require('fs')
const { open } = require('../_helpers/session.js')

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }
const REPORT_DIR = path.resolve(__dirname, '../../../reports/e05/register')

// Click an Ant Select and pick an option by text
async function selectAnt(page, selector, optionText) {
  await page.locator(selector).click()
  await sleep(400)
  // Wait for dropdown to appear
  await page.waitForSelector('.ant-select-dropdown:not([class*="hidden"])', { timeout: 5000 }).catch(() => {})
  await sleep(200)
  // Click option
  await page.locator(`.ant-select-item-option[title="${optionText}"]`).click().catch(async () => {
    // fallback: find by text
    await page.locator(`.ant-select-item-option-content:has-text("${optionText}")`).first().click({ force: true })
  })
  await sleep(300)
}

async function main() {
  const { browser, page } = await open({ anonymous: true })
  try {
    // Navigate to register
    await page.goto('/register')
    await page.waitForLoadState('networkidle')
    await sleep(500)

    // Find all ant-selects
    const selectors = await page.locator('.ant-select-selector').all()
    console.log('Ant select count:', selectors.length)

    // Try clicking prefecture dropdown (first ant-select) to see its options
    await page.locator('.ant-select-selector').first().click()
    await sleep(500)
    await page.screenshot({ path: path.join(REPORT_DIR, 'recon-11-pref-dropdown.png') })

    const prefOptions = await page.locator('.ant-select-item-option-content').allTextContents()
    console.log('Prefecture options:', prefOptions.slice(0, 10))
    // Find Tokyo
    const tokyoIdx = prefOptions.findIndex(o => o.includes('東京'))
    console.log('Tokyo index:', tokyoIdx)

    if (tokyoIdx >= 0) {
      await page.locator('.ant-select-item-option-content').nth(tokyoIdx).click()
    } else {
      await page.keyboard.press('Escape')
    }
    await sleep(300)

    // Check what prefecture is selected
    const prefSelected = await page.locator('.ant-select-selector').first().innerText()
    console.log('Prefecture selected:', prefSelected)

    // Now click 区分 dropdown (second ant-select) for contacts
    await page.locator('.ant-select-selector').nth(1).click()
    await sleep(500)
    await page.screenshot({ path: path.join(REPORT_DIR, 'recon-12-contact-dropdown.png') })

    const contactOptions = await page.locator('.ant-select-item-option-content').allTextContents()
    console.log('Contact 区分 options:', contactOptions)

    // Click メイン担当者
    const mainIdx = contactOptions.findIndex(o => o.includes('メイン'))
    if (mainIdx >= 0) {
      await page.locator('.ant-select-item-option-content').nth(mainIdx).click()
    } else {
      await page.keyboard.press('Escape')
    }
    await sleep(300)

    // Now fill all fields
    await page.getByPlaceholder('委託配送先名').fill('テスト運送')
    await page.getByPlaceholder('カナ').fill('テストウンソウ')
    await page.getByPlaceholder('郵便番号').fill('1600023')

    // Click 住所検索
    await page.getByRole('button', { name: '住所検索' }).click()
    await sleep(2000)
    const cityVal = await page.getByPlaceholder('市区町村').inputValue()
    const streetVal = await page.getByPlaceholder('町域・番地').inputValue()
    console.log('\nAfter 住所検索: city=', cityVal, 'street=', streetVal)

    // If city not filled, manually fill
    if (!cityVal) {
      await page.getByPlaceholder('市区町村').fill('新宿区')
      await page.getByPlaceholder('町域・番地').fill('西新宿1-1')
    }

    await page.getByPlaceholder('建物・部屋番号').fill('テストビル')
    await page.locator('[name="tel"]').fill('090-0000-0000')
    await page.getByPlaceholder('FAX番号').fill('090-0000-0000')
    await page.getByPlaceholder('担当　太郎').fill('テスト太郎')
    await page.getByPlaceholder('タントウ　タロウ').fill('テストタロウ')
    await page.getByPlaceholder('sample@gmail.com').fill('user_b@example.com')
    await page.getByPlaceholder('012-345-6789').fill('090-0000-0000')

    await page.screenshot({ path: path.join(REPORT_DIR, 'recon-13-step1-ready.png'), fullPage: true })

    // Click 次へ
    await page.getByRole('button', { name: '次へ' }).click()
    await sleep(2000)

    const urlAfterNext = page.url()
    const bodyText = await page.locator('body').innerText()
    console.log('\n=== After 次へ ===')
    console.log('URL:', urlAfterNext)

    // Check for errors
    const errLines = bodyText.split('\n').filter(l => l.trim() && (l.includes('必須') || l.includes('選択') || l.includes('入力') || l.includes('形式')))
    console.log('Errors:', errLines)

    // Check step 2 indicators
    const hasStep2 = bodyText.includes('ステップ 2') || bodyText.includes('対応エリア') || bodyText.includes('保有車両')
    console.log('In step 2:', hasStep2)
    if (hasStep2) {
      console.log('\nStep2 content:', bodyText.substring(0, 800))
      await page.screenshot({ path: path.join(REPORT_DIR, 'recon-14-step2.png'), fullPage: true })

      // Check all buttons in step 2
      const btns = await page.locator('button').all()
      console.log('\nStep2 buttons:')
      for (const btn of btns) {
        const text = await btn.innerText()
        const disabled = await btn.isDisabled()
        console.log(`  "${text.trim()}" disabled=${disabled}`)
      }

      // Check checkboxes
      const checkboxes = await page.locator('input[type="checkbox"]').count()
      console.log('Checkboxes:', checkboxes)

      // Check radio buttons
      const radios = await page.locator('input[type="radio"]').count()
      console.log('Radios:', radios)

      // Check tree
      const treeItems = await page.locator('.ant-tree-node-content-wrapper').count()
      console.log('Tree nodes:', treeItems)

      // Check ant selects in step2
      const antSels2 = await page.locator('.ant-select').count()
      console.log('Ant selects in step2:', antSels2)

      // Find 登録 button state
      const regBtn = page.getByRole('button', { name: '登録' })
      const regExists = await regBtn.count()
      const regDisabled = regExists > 0 ? await regBtn.isDisabled() : 'not found'
      console.log('登録 button exists:', regExists, 'disabled:', regDisabled)
    }

  } finally {
    await browser.close()
  }
}

main().catch(e => { console.error('RECON5 ERROR:', e.message); process.exit(1) })
