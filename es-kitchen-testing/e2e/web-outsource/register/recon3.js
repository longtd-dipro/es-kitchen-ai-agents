/**
 * Recon 3 — detailed error message investigation
 */
const path = require('path')
const fs = require('fs')
const { open } = require('../_helpers/session.js')

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }
const REPORT_DIR = path.resolve(__dirname, '../../../reports/e05/register')

async function main() {
  const { browser, page } = await open({ anonymous: true })
  try {
    await page.goto('/register')
    await page.waitForLoadState('networkidle')
    await sleep(500)

    // Click 次へ
    await page.getByRole('button', { name: '次へ' }).click()
    await sleep(1000)

    // Check full page text
    const pageText = await page.locator('body').innerText()
    console.log('=== page text after 次へ click ===')
    // Look for error patterns
    const lines = pageText.split('\n').filter(l => l.trim())
    lines.forEach(l => {
      if (l.includes('入力') || l.includes('選択') || l.includes('必須') || l.includes('以内') || l.includes('形式') || l.includes('エラー')) {
        console.log('  ERROR LINE:', l)
      }
    })

    // Check all classes containing 'error'
    const allErrorEls = await page.locator('[class*="error"]').all()
    console.log('\n=== Error elements count:', allErrorEls.length)
    for (const el of allErrorEls.slice(0, 20)) {
      const text = await el.innerText().catch(() => '')
      const cls = await el.getAttribute('class')
      if (text.trim()) console.log(`  class=${cls?.substring(0,60)} text="${text.trim()}"`)
    }

    // Check all ant-form-item-explain
    const explains = await page.locator('[class*="ant-form-item-explain"]').all()
    console.log('\n=== ant-form-item-explain count:', explains.length)
    for (const el of explains.slice(0, 30)) {
      const text = await el.innerText().catch(() => '')
      const cls = await el.getAttribute('class')
      console.log(`  class=${cls?.substring(0,80)} text="${text.trim()}"`)
    }

    await page.screenshot({ path: path.join(REPORT_DIR, 'recon-05-errors-detail.png'), fullPage: true })

    // Try clicking 委託配送先名, type then delete, then blur
    await page.reload()
    await page.waitForLoadState('networkidle')
    await sleep(300)

    // Type in delivererName then clear
    await page.getByPlaceholder('委託配送先名').fill('テスト')
    await page.getByPlaceholder('委託配送先名').fill('')
    await page.getByPlaceholder('カナ').click() // blur
    await sleep(500)

    const explainsAfterBlur = await page.locator('[class*="ant-form-item-explain"]').all()
    console.log('\n=== After fill+clear+blur explains:', explainsAfterBlur.length)
    for (const el of explainsAfterBlur) {
      const text = await el.innerText().catch(() => '')
      const cls = await el.getAttribute('class')
      if (text.trim()) console.log(`  "${text.trim()}"`)
    }

    // Also click 次へ once more with reload
    await page.reload()
    await page.waitForLoadState('networkidle')
    await sleep(300)

    // Just fill delivererName and click next
    await page.getByPlaceholder('委託配送先名').fill('テスト運送')
    await page.getByRole('button', { name: '次へ' }).click()
    await sleep(1000)

    const bodyText = await page.locator('body').innerText()
    console.log('\n=== After fill name only + click next ===')
    const errLines = bodyText.split('\n').filter(l => l.trim() && (l.includes('入力') || l.includes('選択') || l.includes('必須') || l.includes('以内') || l.includes('形式')))
    errLines.forEach(l => console.log('  ', l))

    // Check all spans and divs that might be error
    const allSpans = await page.locator('div[role="alert"], span[role="alert"]').all()
    console.log('\nAlert elements:', allSpans.length)
    for (const el of allSpans.slice(0, 10)) {
      const text = await el.innerText().catch(() => '')
      if (text.trim()) console.log('  ALERT:', text.trim())
    }

    // Check STEP 2 access
    // Can we go directly to /register step2?
    // Let's try clicking 配送対応情報 tab button
    const tab2 = page.getByRole('button', { name: '配送対応情報' })
    const tab2count = await tab2.count()
    console.log('\n配送対応情報 tab exists:', tab2count)
    if (tab2count > 0) {
      await tab2.click()
      await sleep(500)
      const url2 = page.url()
      const bodyText2 = await page.locator('body').innerText()
      console.log('URL after tab2 click:', url2)
      console.log('Has 登録:', bodyText2.includes('登録'))
      console.log('Has 対応エリア:', bodyText2.includes('対応エリア'))
    }

    await page.screenshot({ path: path.join(REPORT_DIR, 'recon-06-tab2.png'), fullPage: true })

  } finally {
    await browser.close()
  }
}

main().catch(e => { console.error('RECON3 ERROR:', e.message); process.exit(1) })
