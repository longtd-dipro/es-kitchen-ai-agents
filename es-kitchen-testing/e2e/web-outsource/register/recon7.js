/**
 * Recon 7 — check vehicle labels, 行を追加 flow, 登録 button condition
 */
const path = require('path')
const fs = require('fs')
const { open } = require('../_helpers/session.js')
const REPORT_DIR = path.resolve(__dirname, '../../../reports/e05/register')

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function antSelect(page, nthSelect, optionPartial) {
  const selEl = page.locator('.ant-select:not(.ant-select-disabled)').nth(nthSelect)
  await selEl.click()
  await sleep(500)
  await page.waitForSelector('.ant-select-dropdown:not(.ant-select-dropdown-hidden)', { timeout: 5000 }).catch(() => {})
  await sleep(200)
  const optionsLocator = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option-content')
  const opts = await optionsLocator.allTextContents()
  const idx = opts.findIndex(o => o.includes(optionPartial))
  if (idx >= 0) await optionsLocator.nth(idx).click()
  else if (opts.length > 0) await optionsLocator.first().click()
  else await page.keyboard.press('Escape')
  await sleep(300)
}

async function fillStep1Valid(page) {
  await page.goto('/register')
  await page.waitForLoadState('networkidle')
  await sleep(500)
  await page.getByPlaceholder('委託配送先名').fill('テスト運送')
  await page.getByPlaceholder('カナ').fill('テストウンソウ')
  await page.getByPlaceholder('郵便番号').fill('1600023')
  await page.getByRole('button', { name: '住所検索' }).click()
  await sleep(2000)
  const city = await page.getByPlaceholder('市区町村').inputValue()
  if (!city) {
    await antSelect(page, 0, '東京')
    await page.getByPlaceholder('市区町村').fill('新宿区')
    await page.getByPlaceholder('町域・番地').fill('西新宿1-1')
  }
  await page.getByPlaceholder('建物・部屋番号').fill('テストビル')
  await page.locator('[name="tel"]').fill('090-0000-0000')
  await page.getByPlaceholder('FAX番号').fill('090-0000-0000')
  await antSelect(page, 1, 'メイン')
  await page.getByPlaceholder('担当　太郎').fill('テスト太郎')
  await page.getByPlaceholder('タントウ　タロウ').fill('テストタロウ')
  await page.getByPlaceholder('sample@gmail.com').fill('user_b@example.com')
  await page.getByPlaceholder('012-345-6789').fill('090-0000-0000')
}

async function goToStep2(page) {
  await fillStep1Valid(page)
  await page.getByRole('button', { name: '次へ' }).click()
  await sleep(2000)
  const body = await page.locator('body').innerText()
  return body.includes('対応エリア') || body.includes('保有車両') || body.includes('ステップ 2')
}

async function main() {
  const { browser, page } = await open({ anonymous: true })
  try {
    // === RECON: Step 2 vehicle labels ===
    const isStep2 = await goToStep2(page)
    if (!isStep2) { console.log('Could not get to step 2'); return }

    const body = await page.locator('body').innerText()
    const lines = body.split('\n').map(l => l.trim()).filter(l => l)

    // Find all labels in the "保有車両" section
    const vehicleIdx = lines.findIndex(l => l.includes('保有車両'))
    if (vehicleIdx >= 0) {
      console.log('保有車両 section lines:')
      lines.slice(vehicleIdx, vehicleIdx + 30).forEach(l => console.log(' ', l))
    }

    console.log('\nAll checkboxes:')
    const allCbs = await page.locator('input[type="checkbox"]').all()
    for (let i = 0; i < allCbs.length; i++) {
      const label = await page.locator(`label`).nth(i).innerText().catch(() => '')
      const nearby = await allCbs[i].locator('xpath=../..').innerText().catch(() => '')
      console.log(`  checkbox[${i}]: nearby text = "${nearby.substring(0,50).replace(/\n/g,' ')}"`)
    }

    console.log('\nAll labels:')
    const allLabels = await page.locator('label').allTextContents()
    allLabels.forEach((l, i) => console.log(`  label[${i}]: "${l.trim().substring(0,60)}"`) )

    await page.screenshot({ path: path.join(REPORT_DIR, 'recon7-step2-full.png'), fullPage: true })

    // === RECON: 行を追加 in step 1 ===
    await page.goto('/register')
    await page.waitForLoadState('networkidle')
    await sleep(500)

    // Count initial ant-selects
    const initSels = await page.locator('.ant-select:not(.ant-select-disabled)').count()
    console.log('\nInitial ant-selects:', initSels)

    // Select メイン in 区分
    await antSelect(page, 1, 'メイン')
    await sleep(300)

    const sels1 = await page.locator('.ant-select:not(.ant-select-disabled)').count()
    console.log('After selecting メイン, ant-selects:', sels1)

    const addBtn = page.getByRole('button', { name: '行を追加' })
    const addBtnAlt = page.getByRole('button', { name: /追加/ })
    const addBtnCount = await addBtn.count()
    const addBtnAltCount = await addBtnAlt.count()
    console.log('行を追加 button count:', addBtnCount)
    console.log('追加 button (alt) count:', addBtnAltCount)

    if (addBtnCount > 0) {
      await addBtn.click()
      await sleep(800)
      const sels2 = await page.locator('.ant-select:not(.ant-select-disabled)').count()
      console.log('After 行を追加, ant-selects:', sels2)

      const selItems = await page.locator('.ant-select-selection-item').allTextContents()
      console.log('Selection items:', selItems)

      // Try selecting サブ in the new row's 区分
      if (sels2 >= 3) {
        await antSelect(page, 2, 'サブ')
        await sleep(300)
        const selItems2 = await page.locator('.ant-select-selection-item').allTextContents()
        console.log('After selecting サブ, selection items:', selItems2)
      }
    } else {
      console.log('No 行を追加 button — listing all buttons:')
      const btns = await page.locator('button').allTextContents()
      btns.forEach(t => t.trim() && console.log(' ', t.trim()))
    }

    await page.screenshot({ path: path.join(REPORT_DIR, 'recon7-step1-addrow.png'), fullPage: true })

    // === RECON: Step 2 登録 button condition ===
    const isStep2b = await goToStep2(page)
    if (isStep2b) {
      const allCbs2 = await page.locator('input[type="checkbox"]').all()
      console.log('\nStep2 checkboxes for 登録 button test:', allCbs2.length)

      // Check all checkboxes
      for (const cb of allCbs2) {
        await cb.check({ force: true }).catch(() => {})
        await sleep(100)
      }

      // Select radios
      const allRadios = await page.locator('input[type="radio"]').all()
      console.log('Step2 radios:', allRadios.length)
      if (allRadios.length >= 2) await allRadios[0].check({ force: true }).catch(() => {})
      if (allRadios.length >= 4) await allRadios[2].check({ force: true }).catch(() => {})
      if (allRadios.length >= 6) await allRadios[4].check({ force: true }).catch(() => {})
      await sleep(300)

      const regBtn = page.getByRole('button', { name: /登\s*録/ })
      const isDisabled = await regBtn.first().isDisabled().catch(() => true)
      console.log('登録 button disabled (after all checkboxes + radios checked):', isDisabled)
      await page.screenshot({ path: path.join(REPORT_DIR, 'recon7-step2-allchecked.png'), fullPage: true })
    }

  } finally {
    await browser.close()
  }
}

main().catch(e => { console.error('RECON7 ERROR:', e.message); process.exit(1) })
