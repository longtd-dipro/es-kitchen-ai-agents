/**
 * Recon 6 — proper ant-select with keyboard + step2 + format errors
 */
const path = require('path')
const fs = require('fs')
const { open } = require('../_helpers/session.js')

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }
const REPORT_DIR = path.resolve(__dirname, '../../../reports/e05/register')

// Helper: select ant-select option by partial text
async function antSelect(page, nthSelect, optionPartial) {
  // Click the nth ant-select
  const selEl = page.locator('.ant-select:not(.ant-select-disabled)').nth(nthSelect)
  await selEl.click()
  await sleep(500)
  // Type to filter if needed
  // Wait for options to appear
  const optionsLocator = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option-content')
  await page.waitForSelector('.ant-select-dropdown:not(.ant-select-dropdown-hidden)', { timeout: 5000 }).catch(() => {})
  await sleep(200)
  const opts = await optionsLocator.allTextContents()
  const idx = opts.findIndex(o => o.includes(optionPartial))
  if (idx >= 0) {
    await optionsLocator.nth(idx).click()
  } else {
    // click first
    if (opts.length > 0) await optionsLocator.first().click()
    else await page.keyboard.press('Escape')
  }
  await sleep(300)
}

async function fillStep1Valid(page) {
  await page.getByPlaceholder('委託配送先名').fill('テスト運送')
  await page.getByPlaceholder('カナ').fill('テストウンソウ')
  await page.getByPlaceholder('郵便番号').fill('1600023')
  await page.getByRole('button', { name: '住所検索' }).click()
  await sleep(2000)

  // Check if address filled
  const city = await page.getByPlaceholder('市区町村').inputValue()
  if (!city) {
    // Select prefecture manually
    await antSelect(page, 0, '東京') // first ant-select = 都道府県
    await page.getByPlaceholder('市区町村').fill('新宿区')
    await page.getByPlaceholder('町域・番地').fill('西新宿1-1')
  }

  await page.getByPlaceholder('建物・部屋番号').fill('テストビル')
  await page.locator('[name="tel"]').fill('090-0000-0000')
  await page.getByPlaceholder('FAX番号').fill('090-0000-0000')

  // 区分 - second ant-select
  await antSelect(page, 1, 'メイン')
  await page.getByPlaceholder('担当　太郎').fill('テスト太郎')
  await page.getByPlaceholder('タントウ　タロウ').fill('テストタロウ')
  await page.getByPlaceholder('sample@gmail.com').fill('user_b@example.com')
  await page.getByPlaceholder('012-345-6789').fill('090-0000-0000')
}

async function main() {
  const { browser, page } = await open({ anonymous: true })
  try {
    // === TEST 1: Format errors ===
    await page.goto('/register')
    await page.waitForLoadState('networkidle')
    await sleep(500)

    // Fill invalid formats
    await page.getByPlaceholder('委託配送先名').fill('テスト運送')
    await page.getByPlaceholder('カナ').fill('abc') // invalid: not 全角カナ
    await page.getByPlaceholder('郵便番号').fill('12345') // 5 digits instead of 7
    await antSelect(page, 0, '東京')
    await page.getByPlaceholder('市区町村').fill('新宿区')
    await page.getByPlaceholder('町域・番地').fill('西新宿1-1')
    await page.getByPlaceholder('建物・部屋番号').fill('テストビル')
    await page.locator('[name="tel"]').fill('123') // too short
    await page.getByPlaceholder('FAX番号').fill('abc') // invalid
    await antSelect(page, 1, 'メイン')
    await page.getByPlaceholder('担当　太郎').fill('テスト太郎')
    await page.getByPlaceholder('タントウ　タロウ').fill('abc') // invalid kana
    await page.getByPlaceholder('sample@gmail.com').fill('not-an-email')
    await page.getByPlaceholder('012-345-6789').fill('123')

    await page.getByRole('button', { name: '次へ' }).click()
    await sleep(1000)

    const bodyFmt = await page.locator('body').innerText()
    const errLines = bodyFmt.split('\n').filter(l => l.trim() && (l.includes('必須') || l.includes('入力') || l.includes('選択') || l.includes('形式') || l.includes('以内') || l.includes('桁') || l.includes('カナ')))
    console.log('=== FORMAT ERRORS ===')
    errLines.forEach(e => console.log(' ', e))

    await page.screenshot({ path: path.join(REPORT_DIR, 'recon-15-format-errors.png'), fullPage: true })

    // === TEST 2: Max length errors ===
    await page.goto('/register')
    await page.waitForLoadState('networkidle')
    await sleep(500)

    await page.getByPlaceholder('委託配送先名').fill('テ'.repeat(51)) // 51 chars
    await page.getByRole('button', { name: '次へ' }).click()
    await sleep(800)
    const bodyMax = await page.locator('body').innerText()
    const maxErrors = bodyMax.split('\n').filter(l => l.trim() && (l.includes('以内') || l.includes('文字')))
    console.log('\n=== MAX LENGTH ERRORS ===')
    maxErrors.forEach(e => console.log(' ', e))

    // === TEST 3: Navigate to step 2 ===
    await page.goto('/register')
    await page.waitForLoadState('networkidle')
    await sleep(500)
    await fillStep1Valid(page)
    await page.screenshot({ path: path.join(REPORT_DIR, 'recon-16-step1-filled.png'), fullPage: true })

    await page.getByRole('button', { name: '次へ' }).click()
    await sleep(2000)

    const urlS2 = page.url()
    const bodyS2 = await page.locator('body').innerText()
    console.log('\n=== STEP 2 ===')
    console.log('URL:', urlS2)
    const isStep2 = bodyS2.includes('対応エリア') || bodyS2.includes('保有車両') || bodyS2.includes('ステップ 2')
    console.log('Is Step2:', isStep2)
    if (isStep2) {
      console.log('Body:', bodyS2.substring(0, 1000))
      await page.screenshot({ path: path.join(REPORT_DIR, 'recon-17-step2.png'), fullPage: true })

      // Buttons in step2
      const btns = await page.locator('button').all()
      console.log('\nButtons:')
      for (const btn of btns) {
        const text = await btn.innerText().catch(() => '')
        const disabled = await btn.isDisabled().catch(() => 'err')
        if (text.trim()) console.log(`  "${text.trim()}" disabled=${disabled}`)
      }

      // Checkboxes count
      const cbCount = await page.locator('input[type="checkbox"]').count()
      console.log('Checkboxes:', cbCount)

      // Radio count
      const radioCount = await page.locator('input[type="radio"]').count()
      console.log('Radios:', radioCount)

      // Tree
      const treeCount = await page.locator('.ant-tree-node-content-wrapper').count()
      console.log('Tree nodes:', treeCount)

      // Inputs in step2
      const inputs2 = await page.locator('input, textarea').all()
      console.log('\nInputs/textareas:')
      for (const inp of inputs2) {
        const type = await inp.getAttribute('type').catch(() => '')
        const name = await inp.getAttribute('name').catch(() => '')
        const ph = await inp.getAttribute('placeholder').catch(() => '')
        if (type !== 'hidden' && type !== 'search') console.log(`  type=${type} name=${name} ph=${ph}`)
      }

      // Step2 errors after clicking 登録 without filling
      const regBtn = page.getByRole('button', { name: '登録' })
      const regExists = await regBtn.count()
      console.log('\n登録 button:', regExists)
      if (regExists) {
        const isDisabled = await regBtn.isDisabled()
        console.log('登録 disabled:', isDisabled)
      }
    }

  } finally {
    await browser.close()
  }
}

main().catch(e => { console.error('RECON6 ERROR:', e.message); process.exit(1) })
