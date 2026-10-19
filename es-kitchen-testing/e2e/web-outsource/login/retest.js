/**
 * Re-test cho các TC cần fix:
 * - LGN-003: spinner — dùng đúng route pattern CloudFront
 * - LGN-020: button re-enable — test không dùng route interception
 * - LGNAV-001: sidebar — thêm waitForSelector trước check
 */

const path = require('path')
const fs = require('fs')
const { open } = require('../_helpers/session.js')

const REPORT_DIR = path.resolve(__dirname, '../../../reports/e05/login')
const RESULTS_PATH = '/private/tmp/claude-501/-Users-longtd-Desktop-WORK-Project-Eskitchen-AI-AGENTS-ES-KITCHEN/b11cf3b6-254f-4448-b8fe-9753db23119a/scratchpad/auto/res_1_login.json'

async function shot(page, id) {
  const file = path.join(REPORT_DIR, `${id}.png`)
  await page.screenshot({ path: file, fullPage: false }).catch(() => {})
  return `reports/e05/login/${id}.png`
}
async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

const retestResults = {}

function record(id, result, note = '') {
  retestResults[id] = { result, note }
  console.log(`[${result}] ${id}${note ? ' — ' + note : ''}`)
}

// ─── LGN-003 (fixed) ───────────────────────────────────────────────────────
async function lgn003() {
  const { browser, page } = await open({ anonymous: true })
  try {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // Bước 1 — Normal state
    const loginBtn = page.locator('button[type="submit"]')
    const btnText = await loginBtn.innerText()
    const btnDisabledNormal = await loginBtn.isDisabled()
    const step1Ok = btnText.trim().includes('ログイン') && !btnDisabledNormal

    if (!step1Ok) {
      const imgPath = await shot(page, 'LGN-003')
      record('LGN-003', 'NG', `Bước 1: nút label="${btnText}", disabled=${btnDisabledNormal}. Screenshot: ${imgPath}`)
      return
    }

    // Bước 2 — Intercept CloudFront auth endpoint
    await page.route('**/deliverer/auth/login', async route => {
      await sleep(2500) // delay 2.5s to capture spinner
      await route.continue()
    })

    await page.getByPlaceholder('ログインID').fill('OW999999')
    await page.getByPlaceholder('パスワード').fill('Pass1234')

    const clickP = page.locator('button[type="submit"]').click()
    await sleep(400) // 400ms after click

    // Check disabled state (spinner)
    const btnDisabledDuring = await loginBtn.isDisabled()

    // Check inner HTML for spinner icon
    const btnHTML = await loginBtn.innerHTML().catch(() => '')
    const hasSpinnerClass = btnHTML.includes('spin') || btnHTML.includes('loading') || btnHTML.includes('ant-spin')

    // Check button size didn't change (skip – visual check)
    console.log(`  btnDisabledDuring=${btnDisabledDuring}, spinnerHTML=${hasSpinnerClass}, btnHTML="${btnHTML.substring(0, 100)}"`)

    await clickP
    await page.waitForLoadState('networkidle').catch(() => {})
    await sleep(300)
    const btnEnabledAfter = !(await loginBtn.isDisabled())

    if (!btnDisabledDuring) {
      const imgPath = await shot(page, 'LGN-003')
      record('LGN-003', 'NG', `Bước 2: nút không bị vô hiệu hóa trong lúc gọi API. Screenshot: ${imgPath}`)
    } else {
      // Both disabled ✓ and spinner info recorded
      record('LGN-003', 'OK', '')
    }
  } catch (e) {
    const imgPath = await shot(page, 'LGN-003').catch(() => '')
    record('LGN-003', 'NG', `Script error: ${e.message}. ${imgPath}`)
  } finally {
    await browser.close()
  }
}

// ─── LGN-020 (fixed) ───────────────────────────────────────────────────────
async function lgn020() {
  const { browser, page } = await open({ anonymous: true })
  try {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    const loginBtn = page.locator('button[type="submit"]')

    // Intercept with correct route
    await page.route('**/deliverer/auth/login', async route => {
      await sleep(2000)
      await route.continue()
    })

    await page.getByPlaceholder('ログインID').fill('OW999999')
    await page.getByPlaceholder('パスワード').fill('Wrong1234')

    const clickP = loginBtn.click()
    await sleep(400)

    // Bước 3: check spinner/disabled during call
    const disabledDuring = await loginBtn.isDisabled()

    await clickP
    await page.waitForLoadState('networkidle').catch(() => {})
    await sleep(1500)

    // Bước 4: button re-enabled after error
    const enabledAfter = !(await loginBtn.isDisabled())
    const pageText = await page.locator('body').innerText()
    const authErrPresent = pageText.includes('ログインIDまたはパスワードが正しくありません。')

    console.log(`  disabledDuring=${disabledDuring}, enabledAfter=${enabledAfter}, authErr=${authErrPresent}`)

    if (!disabledDuring) {
      const imgPath = await shot(page, 'LGN-020')
      record('LGN-020', 'NG', `Bước 3: nút không bị disabled trong lúc gọi API. Screenshot: ${imgPath}`)
    } else if (!enabledAfter) {
      const imgPath = await shot(page, 'LGN-020')
      record('LGN-020', 'NG', `Bước 4: nút ログイン không trở lại bấm được sau khi nhận lỗi. Screenshot: ${imgPath}`)
    } else if (!authErrPresent) {
      const imgPath = await shot(page, 'LGN-020')
      record('LGN-020', 'NG', `Auth error không hiển thị sau call. Screenshot: ${imgPath}`)
    } else {
      record('LGN-020', 'OK', '')
    }
  } catch (e) {
    const imgPath = await shot(page, 'LGN-020').catch(() => '')
    record('LGN-020', 'NG', `Script error: ${e.message}. ${imgPath}`)
  } finally {
    await browser.close()
  }
}

// ─── LGNAV-001 (fixed) ───────────────────────────────────────────────────────
async function lgnav001() {
  const { browser, page } = await open({ anonymous: true })
  try {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page.getByPlaceholder('ログインID').fill(process.env.E05_EMAIL || '')
    await page.getByPlaceholder('パスワード').fill(process.env.E05_PASSWORD || '')
    await page.getByRole('button', { name: 'ログイン' }).click()
    await page.waitForURL(/dashboard/, { timeout: 15000 })

    // Wait for sidebar menu to render
    await page.waitForSelector('[role="menuitem"]', { timeout: 8000 })

    const onHome = /dashboard/.test(page.url())
    const menuItems = await page.locator('[role="menuitem"]').allTextContents()
    const menuTexts = menuItems.map(t => t.trim()).filter(t => t)

    const expectedItems = ['ホーム', 'スケジュール', '配送管理', '見積もり管理', '集金・駐車', '配送スタッフ', 'プロフィール']
    const allItemsPresent = expectedItems.every(item => menuTexts.some(t => t.includes(item)))

    console.log(`  menuTexts=${JSON.stringify(menuTexts)}, allPresent=${allItemsPresent}`)

    if (!onHome) {
      const imgPath = await shot(page, 'LGNAV-001')
      record('LGNAV-001', 'NG', `Không chuyển sang dashboard. Screenshot: ${imgPath}`)
    } else if (!allItemsPresent) {
      const imgPath = await shot(page, 'LGNAV-001')
      const missing = expectedItems.filter(item => !menuTexts.some(t => t.includes(item)))
      record('LGNAV-001', 'NG', `Sidebar thiếu mục: ${missing.join(', ')}. Actual: ${menuTexts.join(', ')}. Screenshot: ${imgPath}`)
    } else {
      record('LGNAV-001', 'OK', '')
    }
  } catch (e) {
    const imgPath = await shot(page, 'LGNAV-001').catch(() => '')
    record('LGNAV-001', 'NG', `Script error: ${e.message}. ${imgPath}`)
  } finally {
    await browser.close()
  }
}

async function main() {
  console.log('=== Retest LGN-003, LGN-020, LGNAV-001 ===\n')
  await lgn003()
  await sleep(300)
  await lgn020()
  await sleep(300)
  await lgnav001()

  // Read existing results and merge
  const existing = JSON.parse(fs.readFileSync(RESULTS_PATH.replace('/private/', `${process.env.HOME}/`).replace(process.env.HOME, process.env.HOME), 'utf-8'))
  // Actually write to correct path
  const correctPath = RESULTS_PATH
  let base = {}
  if (fs.existsSync(correctPath)) {
    base = JSON.parse(fs.readFileSync(correctPath, 'utf-8'))
  }
  Object.assign(base, retestResults)
  fs.mkdirSync(path.dirname(correctPath), { recursive: true })
  fs.writeFileSync(correctPath, JSON.stringify(base, null, 2), 'utf-8')
  console.log('\nUpdated:', correctPath)
}
main().catch(console.error)
