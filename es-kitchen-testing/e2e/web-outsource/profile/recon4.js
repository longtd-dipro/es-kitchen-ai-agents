// Recon 4 — find actual error element structure
const { open } = require('../_helpers/session.js')
const path = require('path')
const fs = require('fs')

const REPORT_DIR = path.resolve(__dirname, '../../../reports/e05/profile')
function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function main() {
  const { browser, page } = await open()
  await page.goto('/profile')
  await sleep(1000)

  await page.getByRole('button', { name: '編集' }).click()
  await sleep(1000)

  // Clear name and save
  const nameInput = page.locator('input[name="delivererName"]')
  await nameInput.click()
  await nameInput.fill('')

  const saveBtn = page.locator('button').filter({ hasText: /保/ }).first()
  await saveBtn.click()
  await sleep(2000)

  await page.screenshot({ path: path.join(REPORT_DIR, 'recon4_01_after_save.png') })

  // Dump all text content to find errors
  const body = await page.locator('body').textContent()
  console.log('=== BODY AFTER EMPTY NAME SAVE ===\n', body.substring(0, 3000))

  // Find all elements with red/error color
  const allElements = await page.locator('div, span, p').all()
  const errorEls = []
  for (const el of allElements) {
    const text = await el.textContent()
    if (text && (text.includes('入力してください') || text.includes('以内') || text.includes('形式'))) {
      const tag = await el.evaluate(e => e.tagName)
      const cls = await el.evaluate(e => e.className)
      errorEls.push({ text: text.trim().substring(0, 80), tag, cls: cls?.substring(0, 80) })
    }
  }
  console.log('\n=== ERROR ELEMENTS ===')
  for (const e of errorEls) console.log(e)

  // Check URL - did it navigate?
  console.log('\nURL after save:', page.url())

  // Check if page shows validation errors at all
  // Search for any red-colored text
  const redTexts = await page.evaluate(() => {
    const allEls = document.querySelectorAll('*')
    const results = []
    for (const el of allEls) {
      const style = window.getComputedStyle(el)
      const color = style.color
      if (el.textContent.trim() && (color === 'rgb(255, 0, 0)' || color === 'rgb(207, 34, 46)' || color === 'rgb(250, 69, 73)')) {
        results.push({ text: el.textContent.trim().substring(0, 60), color })
      }
    }
    return results.slice(0, 20)
  })
  console.log('\n=== RED COLORED TEXT ELEMENTS ===')
  for (const t of redTexts) console.log(t)

  // Check form item structure
  const formItems = await page.locator('.ant-form-item').all()
  console.log('\nAnt form items count:', formItems.length)
  for (const fi of formItems.slice(0, 5)) {
    const html = await fi.evaluate(e => e.outerHTML.substring(0, 200))
    console.log('Form item:', html)
  }

  // Check if there's a toast/notification
  const toasts = await page.locator('.ant-message, .ant-notification, [class*="toast"], [class*="Toast"]').all()
  console.log('\nToast count:', toasts.length)
  for (const t of toasts) {
    const text = await t.textContent()
    console.log('Toast:', text?.trim().substring(0, 100))
  }

  // After save with empty name, check if we're still in edit mode
  const cancelBtnCount = await page.getByRole('button', { name: /キャンセル/ }).count()
  const editBtnCount = await page.getByRole('button', { name: '編集' }).count()
  console.log('\nキャンセル btn count:', cancelBtnCount, '編集 btn count:', editBtnCount)
  console.log('→ Still in edit mode:', cancelBtnCount > 0)

  // Check if validation is happening on any element that has data-error or similar
  const htmlWithError = await page.evaluate(() => {
    const parent = document.body
    const walker = document.createTreeWalker(parent, NodeFilter.SHOW_ELEMENT)
    const errors = []
    while (walker.nextNode()) {
      const el = walker.currentNode
      const attrs = Array.from(el.attributes).map(a => `${a.name}="${a.value}"`).join(' ')
      if (attrs.includes('error') || attrs.includes('invalid') || el.className.includes('error') || el.className.includes('Error')) {
        if (el.textContent.trim()) {
          errors.push({ tag: el.tagName, cls: el.className.substring(0, 80), text: el.textContent.trim().substring(0, 60) })
        }
      }
    }
    return errors.slice(0, 20)
  })
  console.log('\n=== ELEMENTS WITH ERROR IN ATTR/CLASS ===')
  for (const e of htmlWithError) console.log(e)

  await browser.close()
}

main().catch(e => { console.error('RECON4 ERROR:', e.message, e.stack?.substring(0, 500)); process.exit(1) })
