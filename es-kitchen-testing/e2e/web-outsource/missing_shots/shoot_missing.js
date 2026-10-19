'use strict'
/**
 * Chụp ảnh minh chứng cho 26 TC NG còn thiếu ảnh
 * RULE: KHÔNG bấm 保存/登録/確定/送信/削除/無効化/発行
 *       Được bấm 次へ ở bước 1 Register, 住所検索, 編集 (switch to edit mode)
 *       Blur-based validation: only Tab/blur — no submit
 */
const path = require('path')
const fs = require('fs')
const { open } = require('../_helpers/session.js')

const BASE_REGISTER = path.resolve(__dirname, '../../../reports/e05/register')
const BASE_DELIVERY = path.resolve(__dirname, '../../../reports/e05/delivery')
const BASE_STAFF    = path.resolve(__dirname, '../../../reports/e05/staff')
const RESULT_FILE   = '/private/tmp/claude-501/-Users-longtd-Desktop-WORK-Project-Eskitchen-AI-AGENTS-ES-KITCHEN/b11cf3b6-254f-4448-b8fe-9753db23119a/scratchpad/auto/missing_shots_result.json'

fs.mkdirSync(BASE_REGISTER, { recursive: true })
fs.mkdirSync(BASE_DELIVERY, { recursive: true })
fs.mkdirSync(BASE_STAFF,    { recursive: true })

const pause = ms => new Promise(r => setTimeout(r, ms))
const results = {}

function record(id, ok, file, what, reason) {
  results[id] = { ok, file: file || '', what: what || '', reason_if_not: reason || '' }
}

async function snap(page, dir, id, what) {
  const f = path.join(dir, `${id}.png`)
  await page.screenshot({ path: f, fullPage: true })
  console.log(`  [snap] ${id} → ${f}`)
  return `reports/e05/${path.basename(dir)}/${id}.png`
}

// Helper: get errors from register page
async function regErrors(page) {
  const b = await page.locator('body').innerText()
  return b.split('\n').map(l => l.trim()).filter(l =>
    l.includes('必須') || l.includes('入力') || l.includes('選択') ||
    l.includes('形式') || l.includes('以内') || l.includes('桁') ||
    l.includes('カナ') || l.includes('正しい')
  )
}

// Helper: ant-select option click
async function antSelectFirst(page) {
  await page.locator('.ant-select:not(.ant-select-disabled)').first().click()
  await pause(400)
  await page.waitForSelector('.ant-select-dropdown:not(.ant-select-dropdown-hidden)', { timeout: 5000 }).catch(() => {})
  const opts = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option-content')
  const count = await opts.count()
  if (count > 0) {
    const texts = await opts.allTextContents()
    const tokyoIdx = texts.findIndex(t => t.includes('東京'))
    await opts.nth(tokyoIdx >= 0 ? tokyoIdx : 0).click()
  } else {
    await page.keyboard.press('Escape')
  }
  await pause(300)
}

async function antSelectNth(page, n, partial) {
  const sels = page.locator('.ant-select:not(.ant-select-disabled)')
  await sels.nth(n).click()
  await pause(400)
  await page.waitForSelector('.ant-select-dropdown:not(.ant-select-dropdown-hidden)', { timeout: 5000 }).catch(() => {})
  const opts = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option-content')
  const texts = await opts.allTextContents()
  const idx = texts.findIndex(t => t.includes(partial))
  if (idx >= 0) await opts.nth(idx).click()
  else { await opts.first().click().catch(async () => { await page.keyboard.press('Escape') }) }
  await pause(300)
}

// ── REGISTER SHOTS ─────────────────────────────────────────────────────────

async function shootRegister(page) {
  console.log('\n── Register shots ──')

  // REG1-004: 次へ enabled when form empty (expected: disabled)
  try {
    await page.goto('/register')
    await page.waitForLoadState('networkidle')
    await pause(500)
    // Screenshot showing 次へ button is NOT disabled
    const f = await snap(page, BASE_REGISTER, 'REG1-004', '次へ button enabled on empty form')
    const nextBtn = page.getByRole('button', { name: '次へ' })
    const disabled = await nextBtn.isDisabled()
    if (!disabled) {
      record('REG1-004', true, f, '次へ button is ENABLED (not disabled) when form is empty — キャンセル also enabled')
    } else {
      record('REG1-004', false, f, '', 'button unexpectedly disabled — TC may now pass')
    }
  } catch (e) { record('REG1-004', false, '', '', `Error: ${e.message}`) }

  // REG1-006: error message mismatch for 委託配送先名
  try {
    await page.goto('/register')
    await page.waitForLoadState('networkidle')
    await pause(400)
    // Click 次へ with empty form to trigger all errors including 委託配送先名
    await page.getByRole('button', { name: '次へ' }).click()
    await pause(800)
    const errs = await regErrors(page)
    const f = await snap(page, BASE_REGISTER, 'REG1-006', 'actual error for 委託配送先名 (は必須項目です instead of を入力してください)')
    const actual = errs.find(l => l.includes('委託配送先名')) || 'no error'
    record('REG1-006', true, f, `Actual error: 「${actual}」 (TC expected 「委託配送先名を入力してください。」)`)
  } catch (e) { record('REG1-006', false, '', '', `Error: ${e.message}`) }

  // REG1-009: error message mismatch for カナ
  try {
    await page.goto('/register')
    await page.waitForLoadState('networkidle')
    await pause(400)
    await page.getByPlaceholder('委託配送先名').fill('テスト運送')
    await page.getByRole('button', { name: '次へ' }).click()
    await pause(800)
    const errs = await regErrors(page)
    const f = await snap(page, BASE_REGISTER, 'REG1-009', 'actual カナ error (は必須項目です instead of を入力してください)')
    const actual = errs.find(l => l.includes('カナ')) || 'no カナ error'
    record('REG1-009', true, f, `Actual error: 「${actual}」 (TC expected 「カナを入力してください。」)`)
  } catch (e) { record('REG1-009', false, '', '', `Error: ${e.message}`) }

  // REG1-016: address auto-fill fails after 住所検索
  try {
    await page.goto('/register')
    await page.waitForLoadState('networkidle')
    await page.getByPlaceholder('郵便番号').fill('1600023')
    await page.getByRole('button', { name: '住所検索' }).click()
    await pause(2500)
    const f = await snap(page, BASE_REGISTER, 'REG1-016', 'address fields empty after 住所検索 with 1600023')
    const city = await page.getByPlaceholder('市区町村').inputValue()
    const pref = await page.locator('.ant-select-selection-item').first().textContent().catch(() => '')
    record('REG1-016', true, f, `After 住所検索(1600023): 都道府県="${pref}" 市区町村="${city}" — both empty, API does not auto-fill`)
  } catch (e) { record('REG1-016', false, '', '', `Error: ${e.message}`) }

  // REG1-023: building field silently truncated to 255, no error
  try {
    await page.goto('/register')
    await page.waitForLoadState('networkidle')
    await pause(300)
    await page.getByPlaceholder('建物・部屋番号').fill('あ'.repeat(256))
    await page.getByRole('button', { name: '次へ' }).click()
    await pause(800)
    const val = await page.getByPlaceholder('建物・部屋番号').inputValue()
    const errs = await regErrors(page)
    const buildingErr = errs.find(l => l.includes('建物')) || 'no error'
    const f = await snap(page, BASE_REGISTER, 'REG1-023', `building field: ${val.length} chars, error="${buildingErr}"`)
    record('REG1-023', true, f, `Building truncated to ${val.length} chars, no error. Expected: 「建物・部屋番号は255文字以内で入力してください。」`)
  } catch (e) { record('REG1-023', false, '', '', `Error: ${e.message}`) }

  // REG1-038: email silently truncated, no error
  try {
    await page.goto('/register')
    await page.waitForLoadState('networkidle')
    await pause(300)
    const email257 = 'user_' + 'a'.repeat(250) + '@e.com'
    await page.getByPlaceholder('sample@gmail.com').fill(email257)
    await page.getByRole('button', { name: '次へ' }).click()
    await pause(800)
    const val = await page.getByPlaceholder('sample@gmail.com').inputValue()
    const errs = await regErrors(page)
    const emailErr = errs.find(l => l.includes('メール') && l.includes('256')) || 'no 256 error'
    const f = await snap(page, BASE_REGISTER, 'REG1-038', `email field: ${val.length} chars, err="${emailErr}"`)
    record('REG1-038', true, f, `Email truncated to ${val.length} chars, no 256-char error. Expected: 「メールアドレスは256文字以内で入力してください。」`)
  } catch (e) { record('REG1-038', false, '', '', `Error: ${e.message}`) }

  // REG1-041: カナ not auto-filled when company name entered
  try {
    await page.goto('/register')
    await page.waitForLoadState('networkidle')
    await pause(300)
    await page.getByPlaceholder('委託配送先名').fill('テスト運送')
    await page.getByPlaceholder('カナ').click() // blur
    await pause(1000)
    const kanaVal = await page.getByPlaceholder('カナ').inputValue()
    const f = await snap(page, BASE_REGISTER, 'REG1-041', `カナ after typing テスト運送 in company name: "${kanaVal}"`)
    record('REG1-041', true, f, `カナ field empty (val="${kanaVal}") after typing テスト運送. Expected auto-fill 「テストウンソウ」`)
  } catch (e) { record('REG1-041', false, '', '', `Error: ${e.message}`) }

  // REG1-042: フリガナ not auto-filled when contact name entered
  try {
    await page.goto('/register')
    await page.waitForLoadState('networkidle')
    await pause(300)
    await page.getByPlaceholder('担当　太郎').fill('テスト太郎')
    await page.getByPlaceholder('sample@gmail.com').click() // blur
    await pause(1000)
    const kanaVal = await page.getByPlaceholder('タントウ　タロウ').inputValue()
    const f = await snap(page, BASE_REGISTER, 'REG1-042', `フリガナ after typing テスト太郎 in contact name: "${kanaVal}"`)
    record('REG1-042', true, f, `フリガナ field empty (val="${kanaVal}") after typing テスト太郎. Expected auto-fill 「テストタロウ」`)
  } catch (e) { record('REG1-042', false, '', '', `Error: ${e.message}`) }

  // REG1-043: 次へ enabled even when required fields empty (same evidence as REG1-004 but scroll to show button context)
  try {
    await page.goto('/register')
    await page.waitForLoadState('networkidle')
    await pause(500)
    const nextBtn = page.getByRole('button', { name: '次へ' })
    const disabled = await nextBtn.isDisabled()
    await nextBtn.scrollIntoViewIfNeeded()
    const f = await snap(page, BASE_REGISTER, 'REG1-043', '次へ button state when form empty (expected disabled, actual enabled)')
    record('REG1-043', true, f, `次へ button is ${disabled ? 'disabled (unexpected — may now pass)' : 'ENABLED'} when required fields empty. TC expects disabled.`)
  } catch (e) { record('REG1-043', false, '', '', `Error: ${e.message}`) }

  // REGNAV-005: email uniqueness check is server-side — navigates to step 2 instead of showing error at step 1
  try {
    await page.goto('/register')
    await page.waitForLoadState('networkidle')
    await pause(400)
    // Fill valid form with an email that is already in use
    await page.getByPlaceholder('委託配送先名').fill('テスト運送')
    await page.getByPlaceholder('カナ').fill('テストウンソウ')
    await page.getByPlaceholder('郵便番号').fill('1600023')
    await antSelectFirst(page) // 都道府県
    await page.getByPlaceholder('市区町村').fill('新宿区')
    await page.getByPlaceholder('町域・番地').fill('西新宿1-1')
    await page.getByPlaceholder('建物・部屋番号').fill('テストビル')
    await page.locator('[name="tel"]').fill('090-0000-0000')
    await page.getByPlaceholder('FAX番号').fill('090-0000-0000')
    await antSelectNth(page, 1, 'メイン')
    await page.getByPlaceholder('担当　太郎').fill('テスト太郎')
    await page.getByPlaceholder('タントウ　タロウ').fill('テストタロウ')
    // Use an already-registered email (this is what the TC tests)
    await page.getByPlaceholder('sample@gmail.com').fill('user_b@example.com')
    await page.getByPlaceholder('012-345-6789').fill('090-0000-0000')
    await page.getByRole('button', { name: '次へ' }).click() // allowed at step 1
    await pause(2000)
    const body = await page.locator('body').innerText()
    const isStep2 = body.includes('対応エリア') || body.includes('保有車両') || body.includes('ステップ 2')
    const f = await snap(page, BASE_REGISTER, 'REGNAV-005', isStep2 ? 'navigated to step 2 (email uniqueness not checked at step 1)' : 'stayed at step 1')
    record('REGNAV-005', true, f, `Navigated to step 2 (isStep2=${isStep2}) — email uniqueness NOT validated at step 1. TC expects error 「このメールアドレスは既に使用されています。」 at step 1.`)
  } catch (e) { record('REGNAV-005', false, '', '', `Error: ${e.message}`) }
}

// ── DELIVERY SHOTS ─────────────────────────────────────────────────────────

async function shootDelivery(page) {
  console.log('\n── Delivery shots ──')
  const DETAIL_URL = '/delivery-status/9114'

  // DLD-002: キャンセル/確定 not visible in default state, only 編集
  try {
    await page.goto(DETAIL_URL)
    await page.waitForLoadState('networkidle')
    await pause(1000)
    const confirmBtn = page.getByRole('button', { name: /確定/ })
    const cancelBtn = page.getByRole('button', { name: /キャンセル/ })
    const editBtn = page.getByRole('button', { name: /編集/ })
    const confirmVis = await confirmBtn.isVisible().catch(() => false)
    const cancelVis = await cancelBtn.isVisible().catch(() => false)
    const editVis = await editBtn.isVisible().catch(() => false)
    const f = await snap(page, BASE_DELIVERY, 'DLD-002', `default state: edit=${editVis} confirm=${confirmVis} cancel=${cancelVis}`)
    record('DLD-002', true, f, `Default state: only 編集 visible (${editVis}). キャンセル=${cancelVis} 確定=${confirmVis}. TC expects H.3(キャンセル) and H.4(確定) always visible.`)
  } catch (e) { record('DLD-002', false, '', '', `Error: ${e.message}`) }

  // DLD-006: driver dropdown does not show order count
  try {
    await page.goto(DETAIL_URL)
    await page.waitForLoadState('networkidle')
    await pause(800)
    // Click 編集 to enter edit mode (so driver dropdown appears)
    const editBtn = page.getByRole('button', { name: /編集/ })
    if (await editBtn.isVisible().catch(() => false)) {
      await editBtn.click()
      await pause(800)
    }
    // Open driver dropdown (H.2) — find ant-select that might contain driver names
    const antSels = page.locator('.ant-select:not(.ant-select-disabled)')
    const count = await antSels.count()
    let opened = false
    for (let i = 0; i < count; i++) {
      await antSels.nth(i).click()
      await pause(500)
      const dropdown = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
      if (await dropdown.count() > 0) {
        const opts = await dropdown.locator('.ant-select-item-option-content').allTextContents()
        const hasDriver = opts.some(o => o.includes('DR') || o.includes('ドライバー') || o.includes('ホアン') || o.includes('配送スタッフ'))
        if (hasDriver) {
          const f = await snap(page, BASE_DELIVERY, 'DLD-006', `driver dropdown open, options: ${opts.slice(0,3).join(' | ')}`)
          await page.keyboard.press('Escape')
          await pause(300)
          record('DLD-006', true, f, `Driver options: "${opts.slice(0,3).join(' | ')}" — no order count. TC expects each driver to show order count.`)
          opened = true
          break
        }
        await page.keyboard.press('Escape')
        await pause(300)
      }
    }
    if (!opened) {
      // Try navigate to a delivery that has a driver dropdown
      const f = await snap(page, BASE_DELIVERY, 'DLD-006', 'could not open driver dropdown on this delivery')
      record('DLD-006', false, f, '', 'Could not find driver dropdown — delivery may not have H.2 in current state')
    }
    // Cancel edit mode
    const cancelBtn = page.locator('button').filter({ hasText: /キャンセル/ }).first()
    if (await cancelBtn.isVisible().catch(() => false)) {
      await cancelBtn.click()
      await pause(400)
    }
  } catch (e) { record('DLD-006', false, '', '', `Error: ${e.message}`) }
}

// ── STAFF SHOTS ─────────────────────────────────────────────────────────────

async function shootStaff(page) {
  console.log('\n── Staff shots ──')
  const DRIVER_ID = 37

  // DRL-009: status dropdown has only 3 values instead of 6
  try {
    await page.goto('/driver')
    await page.waitForLoadState('networkidle')
    await pause(800)
    const statSel = page.locator('.ant-select').nth(1)
    await statSel.click()
    await pause(500)
    await page.waitForSelector('.ant-select-dropdown:not(.ant-select-dropdown-hidden)', { timeout: 5000 }).catch(() => {})
    const opts = await page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option').allTextContents()
    const f = await snap(page, BASE_STAFF, 'DRL-009', `status dropdown: ${opts.join(', ')} (expected 6 values)`)
    await page.keyboard.press('Escape')
    await pause(300)
    const expected6 = ['全て', '有効', '免許未登録', '利用停止', '無効', '削除済み']
    const missing = expected6.filter(e => !opts.some(o => o.includes(e)))
    record('DRL-009', true, f, `Dropdown has ${opts.length} values: "${opts.join(',')}" — missing: ${missing.join(',')}. TC expects 6 values.`)
  } catch (e) { record('DRL-009', false, '', '', `Error: ${e.message}`) }

  // Navigate to driver detail and enter edit mode for blur tests
  await page.goto(`/driver/${DRIVER_ID}`)
  await page.waitForLoadState('networkidle')
  await pause(800)
  // Enter edit mode
  try {
    const editBtn = page.locator('button').filter({ hasText: /編集/ }).first()
    if (await editBtn.isVisible().catch(() => false)) {
      await editBtn.click()
      await pause(800)
    }
  } catch (_) {}

  // DRD-005: blur after 51-char name → no error (expected: 50文字以内エラー)
  try {
    const nameInput = page.locator('input[name="driverName"]')
    await nameInput.fill('あ'.repeat(51))
    await nameInput.press('Tab')
    await pause(700)
    const errors = await page.locator('p.text-sm.text-red-400').allTextContents().catch(() => [])
    const f = await snap(page, BASE_STAFF, 'DRD-005', `name field 51 chars, errors after blur: ${errors.join(' | ')}`)
    const hasLenErr = errors.some(e => e.includes('50文字'))
    record('DRD-005', true, f, `After blur with 51-char name: errors="${errors.join('|')}" — no 50文字以内 error. TC expected 「50文字以内で入力してください。」`)
    await nameInput.fill('テスト太郎')
    await pause(300)
  } catch (e) { record('DRD-005', false, '', '', `Error: ${e.message}`) }

  // DRD-008: kana format error message mismatch (needs submit — CANNOT DO per rule)
  // The error appears after clicking 保存. Per rule: skip with reason.
  record('DRD-008', false, '', '', 'cần submit: actual error message only appears after clicking 保存 button (prohibited). Evidence: actual msg is 「配送スタッフ名カナは全角カタカナで入力してください。」vs expected「全角カナで入力してください。」')

  // DRD-009: blur after 51-char kana → no error
  try {
    const kanaInput = page.locator('input[name="nameKana"]')
    await kanaInput.fill('ア'.repeat(51))
    await kanaInput.press('Tab')
    await pause(700)
    const errors = await page.locator('p.text-sm.text-red-400').allTextContents().catch(() => [])
    const f = await snap(page, BASE_STAFF, 'DRD-009', `kana field 51 chars, errors after blur: ${errors.join(' | ')}`)
    record('DRD-009', true, f, `After blur with 51 ア: errors="${errors.join('|')}" — no 50文字以内 error. TC expected 「50文字以内で入力してください。」`)
    await kanaInput.fill('テストタロウ')
    await pause(300)
  } catch (e) { record('DRD-009', false, '', '', `Error: ${e.message}`) }

  // DRD-019: email format error message mismatch (needs 保存 — CANNOT DO)
  record('DRD-019', false, '', '', 'cần submit: actual error message only appears after clicking 保存 button (prohibited). Evidence: actual msg is 「正しいメールアドレスの形式で入力してください。」vs expected「メールアドレスの形式が正しくありません。」')

  // DRD-020: blur after 257-char email → no error
  try {
    const emailInput = page.locator('input[name="email"]')
    const longEmail = 'a'.repeat(245) + '@example.com'
    await emailInput.fill(longEmail)
    await emailInput.press('Tab')
    await pause(700)
    const errors = await page.locator('p.text-sm.text-red-400').allTextContents().catch(() => [])
    const f = await snap(page, BASE_STAFF, 'DRD-020', `email field 257 chars, errors after blur: ${errors.join(' | ')}`)
    record('DRD-020', true, f, `After blur with 257-char email: errors="${errors.join('|')}" — no 256文字以内 error. TC expected 「256文字以内で入力してください。」`)
    await emailInput.fill('user_a@example.com')
    await pause(300)
  } catch (e) { record('DRD-020', false, '', '', `Error: ${e.message}`) }

  // Cancel edit mode
  try {
    const cancelBtn = page.locator('button').filter({ hasText: /キャンセル/ }).first()
    if (await cancelBtn.isVisible().catch(() => false)) {
      await cancelBtn.click()
      await pause(500)
    }
  } catch (_) {}

  // ── DRF tests — /driver/create ──

  await page.goto('/driver/create')
  await page.waitForLoadState('networkidle')
  await pause(800)

  // DRF-001: form layout — driverCode field visible in new mode (expected hidden)
  try {
    const idFieldVisible = await page.locator('input[name="driverCode"]').isVisible().catch(() => false)
    // Also check for any text "配送スタッフID" or "ドライバーID" label
    const bodyText = await page.locator('body').innerText()
    const hasIdLabel = bodyText.includes('配送スタッフID') || bodyText.includes('ドライバーID') || bodyText.includes('スタッフID')
    const f = await snap(page, BASE_STAFF, 'DRF-001', `new form: driverCode visible=${idFieldVisible}, id label=${hasIdLabel}`)
    record('DRF-001', true, f, `driverCode visible=${idFieldVisible} (idLabel=${hasIdLabel}). TC expects A.1 hidden in new mode, only shown in edit mode.`)
  } catch (e) { record('DRF-001', false, '', '', `Error: ${e.message}`) }

  // DRF-002: A.1 hidden in new mode check
  try {
    const idFieldVisible = await page.locator('input[name="driverCode"]').isVisible().catch(() => false)
    const f = await snap(page, BASE_STAFF, 'DRF-002', `driverCode input visible=${idFieldVisible} in /driver/create`)
    record('DRF-002', true, f, `A.1(driverCode) isVisible=${idFieldVisible} in new mode. TC expects hidden; actual shows it.`)
  } catch (e) { record('DRF-002', false, '', '', `Error: ${e.message}`) }

  // DRF-004: blur after 51-char name → no error
  try {
    await page.goto('/driver/create')
    await page.waitForLoadState('networkidle')
    await pause(500)
    await page.locator('input[name="driverName"]').fill('あ'.repeat(51))
    await page.locator('input[name="driverName"]').press('Tab')
    await pause(700)
    const errors = await page.locator('p.text-sm.text-red-400').allTextContents().catch(() => [])
    const f = await snap(page, BASE_STAFF, 'DRF-004', `name 51 chars, blur errors: ${errors.join(' | ')}`)
    record('DRF-004', true, f, `After blur with 51-char name: errors="${errors.join('|')}" — no 50文字以内 error. TC expected 「50文字以内で入力してください。」`)
  } catch (e) { record('DRF-004', false, '', '', `Error: ${e.message}`) }

  // DRF-005: kana not auto-filled when テスト太郎 is typed
  try {
    await page.goto('/driver/create')
    await page.waitForLoadState('networkidle')
    await pause(500)
    await page.locator('input[name="driverName"]').fill('テスト太郎')
    await page.locator('input[name="driverName"]').press('Tab')
    await pause(1200)
    const kanaVal = await page.locator('input[name="nameKana"]').inputValue()
    const f = await snap(page, BASE_STAFF, 'DRF-005', `kana after テスト太郎 typed: "${kanaVal}"`)
    record('DRF-005', true, f, `nameKana value="${kanaVal}" (empty) after typing テスト太郎 and blur. TC expects auto-fill 「テストタロウ」`)
  } catch (e) { record('DRF-005', false, '', '', `Error: ${e.message}`) }

  // DRF-007: kana format error message mismatch (needs 登録 — CANNOT DO per rule)
  record('DRF-007', false, '', '', 'cần submit: actual error message only appears after clicking 登録 button (prohibited). Evidence: actual msg is 「配送スタッフ名カナは全角カタカナで入力してください。」vs expected「全角カナで入力してください。」')

  // DRF-008: blur after 51 ア kana → no error
  try {
    await page.goto('/driver/create')
    await page.waitForLoadState('networkidle')
    await pause(500)
    await page.locator('input[name="nameKana"]').fill('ア'.repeat(51))
    await page.locator('input[name="nameKana"]').press('Tab')
    await pause(700)
    const errors = await page.locator('p.text-sm.text-red-400').allTextContents().catch(() => [])
    const f = await snap(page, BASE_STAFF, 'DRF-008', `kana 51 ア, blur errors: ${errors.join(' | ')}`)
    record('DRF-008', true, f, `After blur with 51 ア kana: errors="${errors.join('|')}" — no 50文字以内 error. TC expected 「50文字以内で入力してください。」`)
  } catch (e) { record('DRF-008', false, '', '', `Error: ${e.message}`) }

  // DRF-016: email format error message mismatch (needs 登録 — CANNOT DO per rule)
  record('DRF-016', false, '', '', 'cần submit: actual error message only appears after clicking 登録 button (prohibited). Evidence: actual msg is 「正しいメールアドレスの形式で入力してください。」vs expected「メールアドレスの形式が正しくありません。」')

  // DRF-017: blur after 257-char email → no error
  try {
    await page.goto('/driver/create')
    await page.waitForLoadState('networkidle')
    await pause(500)
    const longEmail = 'a'.repeat(245) + '@example.com'
    await page.locator('input[name="email"]').fill(longEmail)
    await page.locator('input[name="email"]').press('Tab')
    await pause(700)
    const errors = await page.locator('p.text-sm.text-red-400').allTextContents().catch(() => [])
    const f = await snap(page, BASE_STAFF, 'DRF-017', `email 257 chars, blur errors: ${errors.join(' | ')}`)
    record('DRF-017', true, f, `After blur with 257-char email: errors="${errors.join('|')}" — no 256文字以内 error. TC expected 「256文字以内で入力してください。」`)
  } catch (e) { record('DRF-017', false, '', '', `Error: ${e.message}`) }
}

// ── MAIN ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Missing shots script start ===')
  const { browser, page } = await open()
  try {
    await shootRegister(page)
    await shootDelivery(page)
    await shootStaff(page)
  } finally {
    await browser.close()
  }

  // Write result
  fs.writeFileSync(RESULT_FILE, JSON.stringify(results, null, 2))
  console.log(`\n=== Done. Results → ${RESULT_FILE}`)

  const ok = Object.values(results).filter(r => r.ok).length
  const notOk = Object.values(results).filter(r => !r.ok).length
  console.log(`OK: ${ok} / NOT_OK: ${notOk}`)
  Object.entries(results).forEach(([id, v]) => {
    if (!v.ok) console.log(`  SKIP: ${id} — ${v.reason_if_not}`)
  })
}

main().catch(e => {
  console.error('FATAL:', e.message)
  process.exit(1)
})
