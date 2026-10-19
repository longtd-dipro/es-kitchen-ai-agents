// Recon script — khám phá UI màn プロフィール (OW_PROF_001 / OW_PROF_002)
// Chạy: node e2e/web-outsource/profile/recon.js
const { open } = require('../_helpers/session.js')
const path = require('path')
const fs = require('fs')

const REPORT_DIR = path.resolve(__dirname, '../../../reports/e05/profile')
fs.mkdirSync(REPORT_DIR, { recursive: true })

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function main() {
  const { browser, page } = await open()

  // 1. Dashboard
  await page.screenshot({ path: path.join(REPORT_DIR, 'recon_00_dashboard.png') })
  console.log('Dashboard URL:', page.url())

  // 2. Đọc sidebar links
  await sleep(500)
  const sidebarLinks = await page.locator('aside a, nav a, [role="navigation"] a, [class*="sidebar"] a, [class*="menu"] a').all()
  console.log('Sidebar links count:', sidebarLinks.length)
  for (const link of sidebarLinks) {
    const text = await link.textContent()
    const href = await link.getAttribute('href')
    console.log('  Link:', text?.trim(), '->', href)
  }

  // 3. Tìm プロフィール trong sidebar
  let profLink = null
  try {
    profLink = page.getByRole('link', { name: /プロフィール/ })
    await profLink.click()
    await sleep(1500)
  } catch (e) {
    console.log('No link with プロフィール, trying text...')
    try {
      await page.getByText('プロフィール').first().click()
      await sleep(1500)
    } catch (e2) {
      console.log('Trying /profile URL directly...')
      await page.goto('/profile')
      await sleep(1500)
    }
  }

  console.log('Profile URL:', page.url())
  await page.screenshot({ path: path.join(REPORT_DIR, 'recon_01_profile_view.png') })

  // 4. Đọc body text
  const bodyText = await page.locator('body').textContent()
  console.log('=== BODY TEXT (first 2000):\n', bodyText.substring(0, 2000))

  // 5. Tìm tất cả buttons
  const buttons = await page.locator('button').all()
  console.log('\n=== BUTTONS ===')
  for (const btn of buttons) {
    const text = await btn.textContent()
    const classes = await btn.getAttribute('class')
    const disabled = await btn.getAttribute('disabled')
    console.log('  Button:', text?.trim().substring(0, 60), '| disabled:', disabled, '| class:', classes?.substring(0, 60))
  }

  // 6. Tìm tabs
  const tabs = await page.locator('[role="tab"], button').filter({ hasText: /基本情報|配送対応情報/ }).all()
  console.log('\n=== TABS ===')
  for (const t of tabs) {
    const text = await t.textContent()
    const ariaSelected = await t.getAttribute('aria-selected')
    const classes = await t.getAttribute('class')
    console.log('  Tab:', text?.trim(), '| aria-selected:', ariaSelected, '| class:', classes?.substring(0, 80))
  }

  // 7. Tìm inputs
  const inputs = await page.locator('input').all()
  console.log('\n=== INPUTS ===')
  for (const inp of inputs) {
    const placeholder = await inp.getAttribute('placeholder')
    const type = await inp.getAttribute('type')
    const name = await inp.getAttribute('name')
    const disabled = await inp.getAttribute('disabled')
    const value = await inp.inputValue().catch(() => '')
    console.log('  Input:', 'type=', type, 'name=', name, 'placeholder=', placeholder, 'disabled=', disabled, 'value=', value?.substring(0, 30))
  }

  // 8. Tìm selects/combobox
  const selects = await page.locator('select, [role="combobox"]').all()
  console.log('\n=== SELECTS/COMBOBOX ===')
  for (const sel of selects) {
    const text = await sel.textContent()
    const name = await sel.getAttribute('name')
    const classes = await sel.getAttribute('class')
    console.log('  Select:', 'name=', name, 'text=', text?.trim().substring(0, 50))
  }

  // 9. Tìm labels
  const labels = await page.locator('label').all()
  console.log('\n=== LABELS ===')
  for (const lbl of labels) {
    const text = await lbl.textContent()
    const htmlFor = await lbl.getAttribute('for')
    console.log('  Label:', text?.trim().substring(0, 50), '| for:', htmlFor)
  }

  // 10. Click 編集 button nếu có
  console.log('\n=== TRYING 編集 ===')
  try {
    await page.getByRole('button', { name: /編集/ }).click()
    await sleep(1500)
    console.log('Clicked 編集, URL:', page.url())
    await page.screenshot({ path: path.join(REPORT_DIR, 'recon_02_profile_edit.png') })

    // Đọc lại inputs khi ở chế độ sửa
    const editInputs = await page.locator('input').all()
    console.log('\n=== EDIT MODE INPUTS ===')
    for (const inp of editInputs) {
      const placeholder = await inp.getAttribute('placeholder')
      const name = await inp.getAttribute('name')
      const disabled = await inp.getAttribute('disabled')
      const value = await inp.inputValue().catch(() => '')
      console.log('  Input:', 'name=', name, 'placeholder=', placeholder, 'disabled=', disabled, 'value=', value?.substring(0, 30))
    }

    // Tìm キャンセル
    const cancelBtn = await page.getByRole('button', { name: /キャンセル/ }).count()
    const saveBtn = await page.getByRole('button', { name: /保存/ }).count()
    console.log('キャンセル count:', cancelBtn, '保存 count:', saveBtn)

    // Tìm 住所検索
    const searchBtn = await page.getByRole('button', { name: /住所検索/ }).count()
    console.log('住所検索 count:', searchBtn)

    // Đọc lại body text
    const editBodyText = await page.locator('body').textContent()
    console.log('=== EDIT BODY TEXT (first 2000):\n', editBodyText.substring(0, 2000))

    // Tìm 担当者 table
    const tables = await page.locator('table').all()
    console.log('\n=== TABLES count:', tables.length)
    for (const tbl of tables) {
      const text = await tbl.textContent()
      console.log('  Table text:', text?.trim().substring(0, 200))
    }

    // Cancel
    await page.getByRole('button', { name: /キャンセル/ }).click()
    await sleep(1000)
    console.log('After cancel URL:', page.url())
    await page.screenshot({ path: path.join(REPORT_DIR, 'recon_03_after_cancel.png') })

  } catch (e) {
    console.log('Error clicking 編集:', e.message)
  }

  // 11. Click tab 配送対応情報
  console.log('\n=== TRYING tab 配送対応情報 ===')
  try {
    await page.getByRole('tab', { name: /配送対応情報/ }).click()
    await sleep(1500)
    console.log('配送対応情報 URL:', page.url())
    await page.screenshot({ path: path.join(REPORT_DIR, 'recon_04_delivery_info.png') })

    const deliveryBody = await page.locator('body').textContent()
    console.log('=== DELIVERY INFO BODY (first 2000):\n', deliveryBody.substring(0, 2000))
  } catch (e) {
    // Try non-role tab
    try {
      await page.getByText('配送対応情報').first().click()
      await sleep(1500)
      await page.screenshot({ path: path.join(REPORT_DIR, 'recon_04_delivery_info.png') })
      console.log('配送対応情報 (text click) URL:', page.url())
    } catch (e2) {
      console.log('Error clicking 配送対応情報:', e.message, '|', e2.message)
    }
  }

  await browser.close()
  console.log('\nRecon done. Screenshots saved to', REPORT_DIR)
}

main().catch(e => { console.error('RECON ERROR:', e.message); process.exit(1) })
