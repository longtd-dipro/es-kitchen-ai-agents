/**
 * Recon script — explore /register page structure
 * Run: node e2e/web-outsource/register/recon.js
 */
const path = require('path')
const fs = require('fs')
const { open } = require('../_helpers/session.js')

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

const REPORT_DIR = path.resolve(__dirname, '../../../reports/e05/register')
if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true })

async function main() {
  const { browser, page } = await open({ anonymous: true })
  try {
    // 1. Go to login page and click 新規契約
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: path.join(REPORT_DIR, 'recon-01-login.png') })

    // Detect register button
    const btn契約 = await page.getByRole('button', { name: '新規契約' }).count()
    const btn登録 = await page.getByRole('button', { name: '新規登録' }).count()
    console.log('btn新規契約:', btn契約, 'btn新規登録:', btn登録)

    // Click whichever exists
    if (btn契約 > 0) {
      await page.getByRole('button', { name: '新規契約' }).click()
    } else if (btn登録 > 0) {
      await page.getByRole('button', { name: '新規登録' }).click()
    } else {
      // try any secondary button
      const buttons = await page.locator('button').all()
      console.log('All buttons:', await Promise.all(buttons.map(b => b.innerText())))
      throw new Error('No register button found')
    }

    await page.waitForLoadState('networkidle')
    await sleep(500)
    console.log('URL after click:', page.url())
    await page.screenshot({ path: path.join(REPORT_DIR, 'recon-02-register-step1.png'), fullPage: true })

    // Inspect form structure
    const pageText = await page.locator('body').innerText()
    console.log('Page text (first 2000):', pageText.substring(0, 2000))

    // Find all inputs
    const inputs = await page.locator('input').all()
    console.log('\n=== INPUTS ===')
    for (const inp of inputs) {
      const ph = await inp.getAttribute('placeholder')
      const type = await inp.getAttribute('type')
      const name = await inp.getAttribute('name')
      const id = await inp.getAttribute('id')
      const cls = await inp.getAttribute('class')
      console.log(`  type=${type} name=${name} id=${id} placeholder=${ph} class=${cls?.substring(0,60)}`)
    }

    // Find all textareas
    const textareas = await page.locator('textarea').all()
    console.log('\n=== TEXTAREAS ===')
    for (const ta of textareas) {
      const ph = await ta.getAttribute('placeholder')
      const name = await ta.getAttribute('name')
      console.log(`  name=${name} placeholder=${ph}`)
    }

    // Find all selects
    const selects = await page.locator('select').all()
    console.log('\n=== SELECTS ===', selects.length)

    // Find Ant Design selects
    const antSelects = await page.locator('.ant-select').all()
    console.log('\n=== ANT SELECTS ===', antSelects.length)
    for (const sel of antSelects.slice(0, 10)) {
      const placeholder = await sel.locator('.ant-select-selection-placeholder').count()
      const value = await sel.locator('.ant-select-selection-item').count()
      const cls = await sel.getAttribute('class')
      console.log(`  class=${cls?.substring(0,80)} placeholder_count=${placeholder} value_count=${value}`)
    }

    // Find all buttons
    const buttons = await page.locator('button').all()
    console.log('\n=== BUTTONS ===')
    for (const btn of buttons) {
      const text = await btn.innerText()
      const disabled = await btn.isDisabled()
      console.log(`  "${text.trim()}" disabled=${disabled}`)
    }

    // Find error messages
    const errs = await page.locator('[class*="error"], [class*="ant-form-item-explain"]').allTextContents()
    console.log('\n=== INITIAL ERRORS ===', errs)

    // Find headings/labels
    const labels = await page.locator('label').allTextContents()
    console.log('\n=== LABELS ===', labels.slice(0, 30))

    // Check step indicator
    const stepText = pageText.match(/ステップ.{0,20}/g) || []
    console.log('\n=== STEP INDICATORS ===', stepText)

    // Try to find 次へ button
    const nextBtn = await page.getByRole('button', { name: '次へ' }).count()
    const cancelBtn = await page.getByRole('button', { name: 'キャンセル' }).count()
    console.log('\nnextBtn(次へ):', nextBtn, 'cancelBtn(キャンセル):', cancelBtn)

  } finally {
    await browser.close()
  }
}

main().catch(e => { console.error('RECON ERROR:', e.message); process.exit(1) })
