/**
 * Profile rerun — capture actual error messages for NG TCs
 * Run: node e2e/web-outsource/profile/profile-rerun.js
 */
const { open } = require('../_helpers/session.js')
const path = require('path')
const fs = require('fs')

const REPORT_DIR = path.resolve(__dirname, '../../../reports/e05/profile')
fs.mkdirSync(REPORT_DIR, { recursive: true })

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function shot(page, id) {
  const fp = path.join(REPORT_DIR, `${id}_rerun.png`)
  await page.screenshot({ path: fp, fullPage: false })
  return `reports/e05/profile/${id}_rerun.png`
}

/** Collect all visible error texts on page */
async function collectErrors(page) {
  return page.evaluate(() => {
    const selectors = [
      '.ant-form-item-explain-error',
      '[role="alert"]',
      '.ant-form-explain',
      '.ant-form-item-with-help .ant-form-item-explain',
      '[class*="text-red"]',
      '[class*="error"]',
      '.ant-message-notice-content',
      '.ant-notification-notice-message',
      '.ant-notification-notice-description',
      '.ant-modal-body',
      '.ant-modal-confirm-content',
    ]
    const texts = []
    for (const sel of selectors) {
      document.querySelectorAll(sel).forEach(el => {
        const t = el.innerText && el.innerText.trim()
        if (t && !texts.includes(t)) texts.push(t)
      })
    }
    return texts
  })
}

/** Collect dialog info (modal/confirm dialog) */
async function collectDialog(page) {
  return page.evaluate(() => {
    const modal = document.querySelector('.ant-modal-confirm, .ant-modal')
    if (!modal) return null
    const content = modal.querySelector('.ant-modal-confirm-content, .ant-modal-body')
    const btns = Array.from(modal.querySelectorAll('button')).map(b => b.innerText.trim()).filter(t => t)
    return {
      text: content ? content.innerText.trim() : modal.innerText.trim().substring(0, 200),
      buttons: btns
    }
  })
}

function saveBtn(page) {
  return page.locator('button').filter({ hasText: /保/ }).filter({ hasText: /存/ }).first()
}

async function isViewMode(page) {
  const editCount = await page.getByRole('button', { name: '編集' }).count()
  const cancelCount = await page.getByRole('button', { name: /キャンセル/ }).count()
  return editCount > 0 && cancelCount === 0
}

async function isEditMode(page) {
  return await page.getByRole('button', { name: /キャンセル/ }).count() > 0
}

async function goToProfile(page) {
  await page.goto('/profile')
  await sleep(1000)
}

async function enterEditMode(page) {
  const editBtn = page.getByRole('button', { name: '編集' })
  await editBtn.waitFor({ timeout: 8000 })
  await editBtn.click()
  await sleep(800)
}

async function cancelEdit(page) {
  const btn = page.getByRole('button', { name: /キャンセル/ })
  if (await btn.count() > 0) {
    await btn.click()
    await sleep(600)
    // If a confirmation dialog appears, click discard (変更を破棄 / キャンセル / はい / OK / 破棄)
    const dialog = await collectDialog(page)
    if (dialog) {
      // Click the discard/yes button (not the "keep editing" button)
      // Common JP patterns: 変更を破棄, 破棄する, はい, OK, 戻る, キャンセルする
      const discardPatterns = ['破棄', 'はい', 'OK', '変更', '戻る', 'キャンセルする']
      const btns = await page.locator('.ant-modal-confirm button, .ant-modal button').all()
      let clicked = false
      for (const btn of btns) {
        const text = (await btn.innerText()).trim()
        if (discardPatterns.some(p => text.includes(p))) {
          await btn.click()
          clicked = true
          await sleep(500)
          break
        }
      }
      if (!clicked && btns.length > 0) {
        // Click first button as fallback
        await btns[0].click()
        await sleep(500)
      }
    }
  }
}

// ==================== MAIN ====================

const MESSAGES = {}
const RESULTS = {}

async function main() {
  console.log('Opening browser...')
  const { browser, page } = await open()

  try {

    // ============================================================
    // PRB-009: キャンセル hủy thay đổi
    // ============================================================
    console.log('[PRB-009] キャンセル behavior')
    await goToProfile(page)
    try {
      const origName = await page.locator('input[name="delivererName"]').inputValue()
      await enterEditMode(page)
      await page.locator('input[name="delivererName"]').fill('Công ty XYZ')
      await sleep(300)
      await page.getByRole('button', { name: /キャンセル/ }).click()
      await sleep(800)

      // Check for confirmation dialog
      const dialogInfo = await collectDialog(page)
      const errors = await collectErrors(page)
      const bodyText = await page.locator('body').textContent()

      // Check if in view mode after cancel (possibly with dialog click needed)
      const inViewAfterCancel = await isViewMode(page)
      let finalName = null

      if (dialogInfo) {
        // Record dialog, click discard
        console.log('  [PRB-009] Dialog found:', dialogInfo)
        const btns = await page.locator('.ant-modal-confirm button, .ant-modal button').all()
        const discardPatterns = ['破棄', 'はい', 'OK', '変更', '戻る', 'キャンセルする']
        for (const btn of btns) {
          const text = (await btn.innerText()).trim()
          if (discardPatterns.some(p => text.includes(p))) {
            await btn.click()
            await sleep(600)
            break
          }
        }
      }

      await sleep(800)
      const inViewFinal = await isViewMode(page)
      try { finalName = await page.locator('input[name="delivererName"]').inputValue() } catch (e) {}
      const nameReverted = finalName === origName

      MESSAGES['PRB-009'] = {
        errors,
        dialog: dialogInfo,
        state: { inViewAfterCancel, inViewFinal, origName, finalName, nameReverted }
      }

      if (inViewFinal && nameReverted) {
        RESULTS['PRB-009'] = { result: 'OK', note: '' }
      } else {
        const imgPath = await shot(page, 'PRB-009')
        RESULTS['PRB-009'] = { result: 'NG', note: `inViewFinal=${inViewFinal}, nameReverted=${nameReverted} (expected="${origName}", got="${finalName}"). Dialog: ${JSON.stringify(dialogInfo)}. Screenshot: ${imgPath}` }
      }
    } catch (e) {
      RESULTS['PRB-009'] = { result: 'NG', note: `Script error: ${e.message.substring(0, 150)}` }
      MESSAGES['PRB-009'] = { errors: [], error: e.message }
      await cancelEdit(page).catch(() => {})
    }

    // ============================================================
    // PRB-012: カナ tự sinh từ 委託配送先名
    // ============================================================
    console.log('[PRB-012] Kana autofill')
    await goToProfile(page)
    try {
      await enterEditMode(page)
      const kanaInput = page.locator('input[name="delivererNameKana"]')
      const origKana = await kanaInput.inputValue()
      await kanaInput.fill('')
      // Click name field, type, then blur
      const nameInput = page.locator('input[name="delivererName"]')
      await nameInput.click()
      await nameInput.fill('山田商事')
      await sleep(300)
      // Click kana field to trigger blur on name
      await kanaInput.click()
      await sleep(1500)
      const kanaAfterClick = await kanaInput.inputValue()
      // Also try pressing Tab from name
      await nameInput.click()
      await nameInput.fill('山田商事')
      await nameInput.press('Tab')
      await sleep(2000)
      const kanaAfterTab = await kanaInput.inputValue()

      const errors = await collectErrors(page)
      MESSAGES['PRB-012'] = {
        errors,
        state: { origKana, kanaAfterClick, kanaAfterTab }
      }

      const kanaFilled = kanaAfterTab.length > 0 || kanaAfterClick.length > 0
      if (kanaFilled) {
        RESULTS['PRB-012'] = { result: 'OK', note: '' }
      } else {
        const imgPath = await shot(page, 'PRB-012')
        RESULTS['PRB-012'] = { result: 'NG', note: `カナ not auto-filled. origKana="${origKana}", afterClick="${kanaAfterClick}", afterTab="${kanaAfterTab}". Screenshot: ${imgPath}` }
      }
      await cancelEdit(page)
    } catch (e) {
      RESULTS['PRB-012'] = { result: 'NG', note: `Script error: ${e.message.substring(0, 150)}` }
      MESSAGES['PRB-012'] = { errors: [], error: e.message }
      await cancelEdit(page).catch(() => {})
    }

    // ============================================================
    // PRB-014: 郵便番号 tự điền địa chỉ
    // ============================================================
    console.log('[PRB-014] Zip autofill')
    await goToProfile(page)
    try {
      await enterEditMode(page)
      const zipInput = page.locator('input[name="postalCode"]')
      await zipInput.click()
      await zipInput.fill('1000001')
      await sleep(300)
      // Blur by clicking elsewhere
      await page.locator('input[name="delivererName"]').click()
      await sleep(2500)
      const prefAfter = await page.locator('input[name="prefecture"]').inputValue()
      const cityAfter = await page.locator('input[name="city"]').inputValue()
      const streetAfter = await page.locator('input[name="street"]').inputValue()
      const errors = await collectErrors(page)

      MESSAGES['PRB-014'] = {
        errors,
        state: { prefAfter, cityAfter, streetAfter }
      }

      const prefOk = prefAfter === '東京都'
      const cityOk = cityAfter === '千代田区' || cityAfter.includes('千代田')
      if (prefOk && cityOk) {
        RESULTS['PRB-014'] = { result: 'OK', note: '' }
      } else {
        const imgPath = await shot(page, 'PRB-014')
        RESULTS['PRB-014'] = { result: 'NG', note: `Expected pref=東京都 city=千代田区, got pref="${prefAfter}" city="${cityAfter}" street="${streetAfter}". Screenshot: ${imgPath}` }
      }
      await cancelEdit(page)
    } catch (e) {
      RESULTS['PRB-014'] = { result: 'NG', note: `Script error: ${e.message.substring(0, 150)}` }
      MESSAGES['PRB-014'] = { errors: [], error: e.message }
      await cancelEdit(page).catch(() => {})
    }

    // ============================================================
    // PRB-018: 担当者名 → フリガナ autofill
    // ============================================================
    console.log('[PRB-018] Contact furigana autofill')
    await goToProfile(page)
    try {
      await enterEditMode(page)
      const furiganaInput = page.locator('input[name="contacts.0.nameKana"]')
      const origFurigana = await furiganaInput.inputValue().catch(() => '')
      await furiganaInput.fill('')
      const nameInput = page.locator('input[name="contacts.0.name"]')
      await nameInput.click()
      await nameInput.fill('山田太郎')
      await sleep(300)
      // Click furigana to blur name
      await furiganaInput.click()
      await sleep(1500)
      const furiganaAfterClick = await furiganaInput.inputValue()
      // Also try Tab
      await nameInput.click()
      await nameInput.fill('山田太郎')
      await nameInput.press('Tab')
      await sleep(2000)
      const furiganaAfterTab = await furiganaInput.inputValue()
      const errors = await collectErrors(page)

      MESSAGES['PRB-018'] = {
        errors,
        state: { origFurigana, furiganaAfterClick, furiganaAfterTab }
      }

      const filled = furiganaAfterTab.length > 0 || furiganaAfterClick.length > 0
      if (filled) {
        RESULTS['PRB-018'] = { result: 'OK', note: '' }
      } else {
        const imgPath = await shot(page, 'PRB-018')
        RESULTS['PRB-018'] = { result: 'NG', note: `フリガナ not auto-filled. afterClick="${furiganaAfterClick}", afterTab="${furiganaAfterTab}". Screenshot: ${imgPath}` }
      }
      await cancelEdit(page)
    } catch (e) {
      RESULTS['PRB-018'] = { result: 'NG', note: `Script error: ${e.message.substring(0, 150)}` }
      MESSAGES['PRB-018'] = { errors: [], error: e.message }
      await cancelEdit(page).catch(() => {})
    }

    // ============================================================
    // PRB-019: 委託配送先名 trống → error message
    // ============================================================
    console.log('[PRB-019] Empty name error message')
    await goToProfile(page)
    try {
      await enterEditMode(page)
      await page.locator('input[name="delivererName"]').fill('')
      await saveBtn(page).click()
      await sleep(1500)
      const errors = await collectErrors(page)
      const body = await page.locator('body').textContent()
      const stillEdit = await isEditMode(page)

      MESSAGES['PRB-019'] = { errors, state: { stillEdit } }
      console.log('  [PRB-019] errors:', errors)

      const hasExpected = errors.some(e => e.includes('委託配送先名を入力してください'))
      const hasActual = errors.some(e => e.includes('委託配送先名'))
      if (hasExpected && stillEdit) {
        RESULTS['PRB-019'] = { result: 'OK', note: '' }
      } else if (hasActual && stillEdit) {
        const actualMsg = errors.filter(e => e.includes('委託配送先名')).join(' | ')
        const imgPath = await shot(page, 'PRB-019')
        RESULTS['PRB-019'] = { result: 'NG', note: `Expected:「委託配送先名を入力してください。」 Actual:「${actualMsg}」. Screenshot: ${imgPath}` }
      } else {
        const imgPath = await shot(page, 'PRB-019')
        RESULTS['PRB-019'] = { result: 'NG', note: `No error for 委託配送先名. errors=${JSON.stringify(errors).substring(0,200)}. Screenshot: ${imgPath}` }
      }
      await cancelEdit(page)
    } catch (e) {
      RESULTS['PRB-019'] = { result: 'NG', note: `Script error: ${e.message.substring(0, 150)}` }
      MESSAGES['PRB-019'] = { errors: [], error: e.message }
      await cancelEdit(page).catch(() => {})
    }

    // ============================================================
    // PRB-021: カナ half-width katakana error message
    // ============================================================
    console.log('[PRB-021] Kana half-width error')
    await goToProfile(page)
    try {
      await enterEditMode(page)
      await page.locator('input[name="delivererNameKana"]').fill('ｺﾝﾊﾟﾆｰ')
      await saveBtn(page).click()
      await sleep(1500)
      const errors = await collectErrors(page)
      const stillEdit = await isEditMode(page)

      MESSAGES['PRB-021'] = { errors, state: { stillEdit } }
      console.log('  [PRB-021] errors:', errors)

      const hasExpected = errors.some(e => e.includes('カナは全角カナで入力してください'))
      const hasKanaErr = errors.some(e => e.includes('カナ') || e.includes('全角'))
      if (hasExpected && stillEdit) {
        RESULTS['PRB-021'] = { result: 'OK', note: '' }
      } else if (hasKanaErr && stillEdit) {
        const actualMsg = errors.filter(e => e.includes('カナ') || e.includes('全角')).join(' | ')
        const imgPath = await shot(page, 'PRB-021')
        RESULTS['PRB-021'] = { result: 'NG', note: `Expected:「カナは全角カナで入力してください。」 Actual:「${actualMsg}」. Screenshot: ${imgPath}` }
      } else {
        const imgPath = await shot(page, 'PRB-021')
        RESULTS['PRB-021'] = { result: 'NG', note: `No カナ/全角 error found. errors=${JSON.stringify(errors).substring(0,200)}. stillEdit=${stillEdit}. Screenshot: ${imgPath}` }
      }
      await cancelEdit(page)
    } catch (e) {
      RESULTS['PRB-021'] = { result: 'NG', note: `Script error: ${e.message.substring(0, 150)}` }
      MESSAGES['PRB-021'] = { errors: [], error: e.message }
      await cancelEdit(page).catch(() => {})
    }

    // ============================================================
    // PRB-022: 郵便番号 trống
    // ============================================================
    console.log('[PRB-022] Empty zip error')
    await goToProfile(page)
    try {
      await enterEditMode(page)
      await page.locator('input[name="postalCode"]').fill('')
      await saveBtn(page).click()
      await sleep(1500)
      const errors = await collectErrors(page)
      const stillEdit = await isEditMode(page)

      MESSAGES['PRB-022'] = { errors, state: { stillEdit } }
      console.log('  [PRB-022] errors:', errors)

      const hasExpected = errors.some(e => e.includes('郵便番号を入力してください'))
      const hasZipErr = errors.some(e => e.includes('郵便番号'))
      if (hasExpected && stillEdit) {
        RESULTS['PRB-022'] = { result: 'OK', note: '' }
      } else if (hasZipErr && stillEdit) {
        const actualMsg = errors.filter(e => e.includes('郵便番号')).join(' | ')
        const imgPath = await shot(page, 'PRB-022')
        RESULTS['PRB-022'] = { result: 'NG', note: `Expected:「郵便番号を入力してください」 Actual:「${actualMsg}」. Screenshot: ${imgPath}` }
      } else {
        const imgPath = await shot(page, 'PRB-022')
        RESULTS['PRB-022'] = { result: 'NG', note: `No 郵便番号 error. errors=${JSON.stringify(errors).substring(0,200)}. stillEdit=${stillEdit}. Screenshot: ${imgPath}` }
      }
      await cancelEdit(page)
    } catch (e) {
      RESULTS['PRB-022'] = { result: 'NG', note: `Script error: ${e.message.substring(0, 150)}` }
      MESSAGES['PRB-022'] = { errors: [], error: e.message }
      await cancelEdit(page).catch(() => {})
    }

    // ============================================================
    // PRB-023: 郵便番号 sai định dạng (6 digits)
    // ============================================================
    console.log('[PRB-023] Wrong zip format error')
    await goToProfile(page)
    try {
      await enterEditMode(page)
      await page.locator('input[name="postalCode"]').fill('100000')
      await saveBtn(page).click()
      await sleep(1500)
      const errors = await collectErrors(page)
      const stillEdit = await isEditMode(page)

      MESSAGES['PRB-023'] = { errors, state: { stillEdit } }
      console.log('  [PRB-023] errors:', errors)

      const hasExpected = errors.some(e => e.includes('郵便番号は7桁の半角数字で入力してください'))
      const hasZipErr = errors.some(e => e.includes('郵便番号'))
      if (hasExpected && stillEdit) {
        RESULTS['PRB-023'] = { result: 'OK', note: '' }
      } else if (hasZipErr && stillEdit) {
        const actualMsg = errors.filter(e => e.includes('郵便番号')).join(' | ')
        const imgPath = await shot(page, 'PRB-023')
        RESULTS['PRB-023'] = { result: 'NG', note: `Expected:「郵便番号は7桁の半角数字で入力してください」 Actual:「${actualMsg}」. Screenshot: ${imgPath}` }
      } else {
        const imgPath = await shot(page, 'PRB-023')
        RESULTS['PRB-023'] = { result: 'NG', note: `No zip format error. errors=${JSON.stringify(errors).substring(0,200)}. stillEdit=${stillEdit}. Screenshot: ${imgPath}` }
      }
      await cancelEdit(page)
    } catch (e) {
      RESULTS['PRB-023'] = { result: 'NG', note: `Script error: ${e.message.substring(0, 150)}` }
      MESSAGES['PRB-023'] = { errors: [], error: e.message }
      await cancelEdit(page).catch(() => {})
    }

    // ============================================================
    // PRB-024: 都道府県 trống — also check if 区分 shows error when untouched
    // ============================================================
    console.log('[PRB-024] Empty prefecture error + 区分 untouched check')
    await goToProfile(page)
    try {
      await enterEditMode(page)
      // First, screenshot of 区分 in edit mode before touching (check if it shows validation hint)
      const errorsBeforeSave = await collectErrors(page)
      const kubunSelectVal = await page.locator('.ant-select-selector').first().textContent().catch(() => '')

      await page.locator('input[name="prefecture"]').fill('')
      await saveBtn(page).click()
      await sleep(1500)
      const errors = await collectErrors(page)
      const stillEdit = await isEditMode(page)

      MESSAGES['PRB-024'] = {
        errors,
        state: { stillEdit, kubunSelectVal, errorsBeforeSave }
      }
      console.log('  [PRB-024] errors:', errors)
      console.log('  [PRB-024] kubunSelectVal:', kubunSelectVal)

      const hasExpected = errors.some(e => e.includes('都道府県を選択してください'))
      const hasPrefErr = errors.some(e => e.includes('都道府県'))
      if (hasExpected && stillEdit) {
        RESULTS['PRB-024'] = { result: 'OK', note: '' }
      } else if (hasPrefErr && stillEdit) {
        const actualMsg = errors.filter(e => e.includes('都道府県')).join(' | ')
        const imgPath = await shot(page, 'PRB-024')
        RESULTS['PRB-024'] = { result: 'NG', note: `Expected:「都道府県を選択してください。」 Actual:「${actualMsg}」. Screenshot: ${imgPath}` }
      } else {
        const imgPath = await shot(page, 'PRB-024')
        RESULTS['PRB-024'] = { result: 'NG', note: `No 都道府県 error. errors=${JSON.stringify(errors).substring(0,200)}. stillEdit=${stillEdit}. Screenshot: ${imgPath}` }
      }
      await cancelEdit(page)
    } catch (e) {
      RESULTS['PRB-024'] = { result: 'NG', note: `Script error: ${e.message.substring(0, 150)}` }
      MESSAGES['PRB-024'] = { errors: [], error: e.message }
      await cancelEdit(page).catch(() => {})
    }

    // ============================================================
    // PRB-025: 市区町村 trống
    // ============================================================
    console.log('[PRB-025] Empty city error')
    await goToProfile(page)
    try {
      await enterEditMode(page)
      await page.locator('input[name="city"]').fill('')
      await saveBtn(page).click()
      await sleep(1500)
      const errors = await collectErrors(page)
      const stillEdit = await isEditMode(page)

      MESSAGES['PRB-025'] = { errors, state: { stillEdit } }
      console.log('  [PRB-025] errors:', errors)

      const hasExpected = errors.some(e => e.includes('市区町村を入力してください'))
      const hasCityErr = errors.some(e => e.includes('市区町村'))
      if (hasExpected && stillEdit) {
        RESULTS['PRB-025'] = { result: 'OK', note: '' }
      } else if (hasCityErr && stillEdit) {
        const actualMsg = errors.filter(e => e.includes('市区町村')).join(' | ')
        const imgPath = await shot(page, 'PRB-025')
        RESULTS['PRB-025'] = { result: 'NG', note: `Expected:「市区町村を入力してください。」 Actual:「${actualMsg}」. Screenshot: ${imgPath}` }
      } else {
        const imgPath = await shot(page, 'PRB-025')
        RESULTS['PRB-025'] = { result: 'NG', note: `No 市区町村 error. errors=${JSON.stringify(errors).substring(0,200)}. stillEdit=${stillEdit}. Screenshot: ${imgPath}` }
      }
      await cancelEdit(page)
    } catch (e) {
      RESULTS['PRB-025'] = { result: 'NG', note: `Script error: ${e.message.substring(0, 150)}` }
      MESSAGES['PRB-025'] = { errors: [], error: e.message }
      await cancelEdit(page).catch(() => {})
    }

    // ============================================================
    // PRB-026: 町域・番地 trống
    // ============================================================
    console.log('[PRB-026] Empty street error')
    await goToProfile(page)
    try {
      await enterEditMode(page)
      await page.locator('input[name="street"]').fill('')
      await saveBtn(page).click()
      await sleep(1500)
      const errors = await collectErrors(page)
      const stillEdit = await isEditMode(page)

      MESSAGES['PRB-026'] = { errors, state: { stillEdit } }
      console.log('  [PRB-026] errors:', errors)

      const hasExpected = errors.some(e => e.includes('町域・番地を入力してください'))
      const hasStreetErr = errors.some(e => e.includes('町域') || e.includes('番地'))
      if (hasExpected && stillEdit) {
        RESULTS['PRB-026'] = { result: 'OK', note: '' }
      } else if (hasStreetErr && stillEdit) {
        const actualMsg = errors.filter(e => e.includes('町域') || e.includes('番地')).join(' | ')
        const imgPath = await shot(page, 'PRB-026')
        RESULTS['PRB-026'] = { result: 'NG', note: `Expected:「町域・番地を入力してください。」 Actual:「${actualMsg}」. Screenshot: ${imgPath}` }
      } else {
        const imgPath = await shot(page, 'PRB-026')
        RESULTS['PRB-026'] = { result: 'NG', note: `No 町域/番地 error. errors=${JSON.stringify(errors).substring(0,200)}. stillEdit=${stillEdit}. Screenshot: ${imgPath}` }
      }
      await cancelEdit(page)
    } catch (e) {
      RESULTS['PRB-026'] = { result: 'NG', note: `Script error: ${e.message.substring(0, 150)}` }
      MESSAGES['PRB-026'] = { errors: [], error: e.message }
      await cancelEdit(page).catch(() => {})
    }

    // ============================================================
    // PRB-029: 電話番号 trống
    // ============================================================
    console.log('[PRB-029] Empty tel error')
    await goToProfile(page)
    try {
      await enterEditMode(page)
      await page.locator('input[name="tel"]').fill('')
      await saveBtn(page).click()
      await sleep(1500)
      const errors = await collectErrors(page)
      const stillEdit = await isEditMode(page)

      MESSAGES['PRB-029'] = { errors, state: { stillEdit } }
      console.log('  [PRB-029] errors:', errors)

      const hasExpected = errors.some(e => e.includes('電話番号を入力してください'))
      const hasTelErr = errors.some(e => e.includes('電話番号'))
      if (hasExpected && stillEdit) {
        RESULTS['PRB-029'] = { result: 'OK', note: '' }
      } else if (hasTelErr && stillEdit) {
        const actualMsg = errors.filter(e => e.includes('電話番号')).join(' | ')
        const imgPath = await shot(page, 'PRB-029')
        RESULTS['PRB-029'] = { result: 'NG', note: `Expected:「電話番号を入力してください。」 Actual:「${actualMsg}」. Screenshot: ${imgPath}` }
      } else {
        const imgPath = await shot(page, 'PRB-029')
        RESULTS['PRB-029'] = { result: 'NG', note: `No 電話番号 error. errors=${JSON.stringify(errors).substring(0,200)}. stillEdit=${stillEdit}. Screenshot: ${imgPath}` }
      }
      await cancelEdit(page)
    } catch (e) {
      RESULTS['PRB-029'] = { result: 'NG', note: `Script error: ${e.message.substring(0, 150)}` }
      MESSAGES['PRB-029'] = { errors: [], error: e.message }
      await cancelEdit(page).catch(() => {})
    }

    // ============================================================
    // PRB-030: 電話番号 sai định dạng
    // ============================================================
    console.log('[PRB-030] Wrong tel format error')
    await goToProfile(page)
    try {
      await enterEditMode(page)
      await page.locator('input[name="tel"]').fill('090-000-000')
      await saveBtn(page).click()
      await sleep(1500)
      const errors = await collectErrors(page)
      const stillEdit = await isEditMode(page)

      MESSAGES['PRB-030'] = { errors, state: { stillEdit } }
      console.log('  [PRB-030] errors:', errors)

      const hasExpected = errors.some(e => e.includes('電話番号の形式が正しくありません'))
      const hasTelErr = errors.some(e => e.includes('電話番号'))
      if (hasExpected && stillEdit) {
        RESULTS['PRB-030'] = { result: 'OK', note: '' }
      } else if (hasTelErr && stillEdit) {
        const actualMsg = errors.filter(e => e.includes('電話番号')).join(' | ')
        const imgPath = await shot(page, 'PRB-030')
        RESULTS['PRB-030'] = { result: 'NG', note: `Expected:「電話番号の形式が正しくありません（半角数字・ハイフン、10〜11桁）」 Actual:「${actualMsg}」. Screenshot: ${imgPath}` }
      } else {
        const imgPath = await shot(page, 'PRB-030')
        RESULTS['PRB-030'] = { result: 'NG', note: `No tel format error. errors=${JSON.stringify(errors).substring(0,200)}. stillEdit=${stillEdit}. Screenshot: ${imgPath}` }
      }
      await cancelEdit(page)
    } catch (e) {
      RESULTS['PRB-030'] = { result: 'NG', note: `Script error: ${e.message.substring(0, 150)}` }
      MESSAGES['PRB-030'] = { errors: [], error: e.message }
      await cancelEdit(page).catch(() => {})
    }

    // ============================================================
    // PRB-033: 担当者名 trống
    // ============================================================
    console.log('[PRB-033] Empty contact name error')
    await goToProfile(page)
    try {
      await enterEditMode(page)
      await page.locator('input[name="contacts.0.name"]').fill('')
      await saveBtn(page).click()
      await sleep(1500)
      const errors = await collectErrors(page)
      const stillEdit = await isEditMode(page)

      MESSAGES['PRB-033'] = { errors, state: { stillEdit } }
      console.log('  [PRB-033] errors:', errors)

      const hasExpected = errors.some(e => e.includes('担当者名を入力してください'))
      const hasTanErr = errors.some(e => e.includes('担当者名'))
      if (hasExpected && stillEdit) {
        RESULTS['PRB-033'] = { result: 'OK', note: '' }
      } else if (hasTanErr && stillEdit) {
        const actualMsg = errors.filter(e => e.includes('担当者名')).join(' | ')
        const imgPath = await shot(page, 'PRB-033')
        RESULTS['PRB-033'] = { result: 'NG', note: `Expected:「担当者名を入力してください」 Actual:「${actualMsg}」. Screenshot: ${imgPath}` }
      } else {
        const imgPath = await shot(page, 'PRB-033')
        RESULTS['PRB-033'] = { result: 'NG', note: `No 担当者名 error. errors=${JSON.stringify(errors).substring(0,200)}. stillEdit=${stillEdit}. Screenshot: ${imgPath}` }
      }
      await cancelEdit(page)
    } catch (e) {
      RESULTS['PRB-033'] = { result: 'NG', note: `Script error: ${e.message.substring(0, 150)}` }
      MESSAGES['PRB-033'] = { errors: [], error: e.message }
      await cancelEdit(page).catch(() => {})
    }

    // ============================================================
    // PRB-035: メールアドレス sai định dạng
    // ============================================================
    console.log('[PRB-035] Wrong email format error')
    await goToProfile(page)
    try {
      await enterEditMode(page)
      await page.locator('input[name="contacts.0.email"]').fill('notanemail')
      await saveBtn(page).click()
      await sleep(1500)
      const errors = await collectErrors(page)
      const stillEdit = await isEditMode(page)

      MESSAGES['PRB-035'] = { errors, state: { stillEdit } }
      console.log('  [PRB-035] errors:', errors)

      const hasExpected = errors.some(e => e.includes('メールアドレスの形式が正しくありません'))
      const hasMailErr = errors.some(e => e.includes('メールアドレス'))
      if (hasExpected && stillEdit) {
        RESULTS['PRB-035'] = { result: 'OK', note: '' }
      } else if (hasMailErr && stillEdit) {
        const actualMsg = errors.filter(e => e.includes('メールアドレス')).join(' | ')
        const imgPath = await shot(page, 'PRB-035')
        RESULTS['PRB-035'] = { result: 'NG', note: `Expected:「メールアドレスの形式が正しくありません。」 Actual:「${actualMsg}」. Screenshot: ${imgPath}` }
      } else {
        const imgPath = await shot(page, 'PRB-035')
        RESULTS['PRB-035'] = { result: 'NG', note: `No email format error. errors=${JSON.stringify(errors).substring(0,200)}. stillEdit=${stillEdit}. Screenshot: ${imgPath}` }
      }
      await cancelEdit(page)
    } catch (e) {
      RESULTS['PRB-035'] = { result: 'NG', note: `Script error: ${e.message.substring(0, 150)}` }
      MESSAGES['PRB-035'] = { errors: [], error: e.message }
      await cancelEdit(page).catch(() => {})
    }

    // ============================================================
    // PRB-036: メールアドレス vượt 256 ký tự
    // ============================================================
    console.log('[PRB-036] Email > 256 chars error')
    await goToProfile(page)
    try {
      await enterEditMode(page)
      const longEmail = 'a'.repeat(250) + '@b.com'
      await page.locator('input[name="contacts.0.email"]').fill(longEmail)
      await saveBtn(page).click()
      await sleep(1500)
      const errors = await collectErrors(page)
      const stillEdit = await isEditMode(page)

      MESSAGES['PRB-036'] = { errors, state: { stillEdit } }
      console.log('  [PRB-036] errors:', errors)

      const hasExpected = errors.some(e => e.includes('メールアドレスは256文字以内で入力してください'))
      const hasMailErr = errors.some(e => e.includes('メールアドレス'))
      if (hasExpected && stillEdit) {
        RESULTS['PRB-036'] = { result: 'OK', note: '' }
      } else if (hasMailErr && stillEdit) {
        const actualMsg = errors.filter(e => e.includes('メールアドレス')).join(' | ')
        const imgPath = await shot(page, 'PRB-036')
        RESULTS['PRB-036'] = { result: 'NG', note: `Expected:「メールアドレスは256文字以内で入力してください。」 Actual:「${actualMsg}」. Screenshot: ${imgPath}` }
      } else {
        const imgPath = await shot(page, 'PRB-036')
        RESULTS['PRB-036'] = { result: 'NG', note: `No email length error. errors=${JSON.stringify(errors).substring(0,200)}. stillEdit=${stillEdit}. Screenshot: ${imgPath}` }
      }
      await cancelEdit(page)
    } catch (e) {
      RESULTS['PRB-036'] = { result: 'NG', note: `Script error: ${e.message.substring(0, 150)}` }
      MESSAGES['PRB-036'] = { errors: [], error: e.message }
      await cancelEdit(page).catch(() => {})
    }

    // ============================================================
    // PRFNAV-007: キャンセル → view mode, old values
    // ============================================================
    console.log('[PRFNAV-007] キャンセル navigation check')
    await goToProfile(page)
    try {
      const origName = await page.locator('input[name="delivererName"]').inputValue()
      await enterEditMode(page)
      await page.locator('input[name="delivererName"]').fill('Công ty XYZ')
      await sleep(300)
      await page.getByRole('button', { name: /キャンセル/ }).click()
      await sleep(800)

      const dialogInfo = await collectDialog(page)
      const inViewAfterCancel = await isViewMode(page)
      let finalName = null

      if (dialogInfo) {
        console.log('  [PRFNAV-007] Dialog:', dialogInfo)
        const btns = await page.locator('.ant-modal-confirm button, .ant-modal button').all()
        const discardPatterns = ['破棄', 'はい', 'OK', '変更', '戻る', 'キャンセルする']
        for (const btn of btns) {
          const text = (await btn.innerText()).trim()
          if (discardPatterns.some(p => text.includes(p))) {
            await btn.click()
            await sleep(600)
            break
          }
        }
      }

      await sleep(800)
      const inViewFinal = await isViewMode(page)
      try { finalName = await page.locator('input[name="delivererName"]').inputValue() } catch (e) {}
      const reverted = finalName === origName
      const errors = await collectErrors(page)

      MESSAGES['PRFNAV-007'] = {
        errors,
        dialog: dialogInfo,
        state: { inViewAfterCancel, inViewFinal, origName, finalName, reverted }
      }

      if (inViewFinal && reverted) {
        RESULTS['PRFNAV-007'] = { result: 'OK', note: '' }
      } else {
        const imgPath = await shot(page, 'PRFNAV-007')
        RESULTS['PRFNAV-007'] = { result: 'NG', note: `inViewFinal=${inViewFinal}, reverted=${reverted} (expected="${origName}", got="${finalName}"). Dialog: ${JSON.stringify(dialogInfo)}. Screenshot: ${imgPath}` }
      }
    } catch (e) {
      RESULTS['PRFNAV-007'] = { result: 'NG', note: `Script error: ${e.message.substring(0, 150)}` }
      MESSAGES['PRFNAV-007'] = { errors: [], error: e.message }
      await cancelEdit(page).catch(() => {})
    }

    // ============================================================
    // PRFNAV-010: After キャンセル → 編集 again shows DB value
    // ============================================================
    console.log('[PRFNAV-010] After cancel, edit again')
    await goToProfile(page)
    try {
      const origName = await page.locator('input[name="delivererName"]').inputValue()
      await enterEditMode(page)
      await page.locator('input[name="delivererName"]').fill('Tên Tạm')
      await sleep(300)
      // Click キャンセル
      await page.getByRole('button', { name: /キャンセル/ }).click()
      await sleep(800)

      // Handle dialog if present
      const dialogInfo = await collectDialog(page)
      if (dialogInfo) {
        console.log('  [PRFNAV-010] Dialog:', dialogInfo)
        const btns = await page.locator('.ant-modal-confirm button, .ant-modal button').all()
        const discardPatterns = ['破棄', 'はい', 'OK', '変更', '戻る', 'キャンセルする']
        for (const btn of btns) {
          const text = (await btn.innerText()).trim()
          if (discardPatterns.some(p => text.includes(p))) {
            await btn.click()
            await sleep(600)
            break
          }
        }
      }

      await sleep(800)
      // Now should be in view mode — try to click 編集 again
      const inView = await isViewMode(page)
      if (!inView) {
        const imgPath = await shot(page, 'PRFNAV-010')
        RESULTS['PRFNAV-010'] = { result: 'NG', note: `Not in view mode after キャンセル. Dialog was: ${JSON.stringify(dialogInfo)}. Screenshot: ${imgPath}` }
        MESSAGES['PRFNAV-010'] = { errors: [], dialog: dialogInfo, state: { inView } }
      } else {
        // Click 編集 again
        const editBtn = page.getByRole('button', { name: '編集' })
        await editBtn.waitFor({ timeout: 5000 })
        await editBtn.click()
        await sleep(800)
        const nameInSecondEdit = await page.locator('input[name="delivererName"]').inputValue()
        const showsOriginal = nameInSecondEdit === origName

        MESSAGES['PRFNAV-010'] = {
          errors: [],
          dialog: dialogInfo,
          state: { inView, origName, nameInSecondEdit, showsOriginal }
        }

        if (showsOriginal) {
          RESULTS['PRFNAV-010'] = { result: 'OK', note: '' }
        } else {
          const imgPath = await shot(page, 'PRFNAV-010')
          RESULTS['PRFNAV-010'] = { result: 'NG', note: `After cancel+edit, expected "${origName}" but got "${nameInSecondEdit}". Screenshot: ${imgPath}` }
        }
        await cancelEdit(page)
      }
    } catch (e) {
      RESULTS['PRFNAV-010'] = { result: 'NG', note: `Script error: ${e.message.substring(0, 150)}` }
      MESSAGES['PRFNAV-010'] = { errors: [], error: e.message }
      await cancelEdit(page).catch(() => {})
    }

    // ============================================================
    // PRD-002: Delivery tab validation — area error
    // ============================================================
    console.log('[PRD-002] Delivery area validation')
    try {
      await page.goto('/profile')
      await sleep(800)
      // Click tab 配送対応情報
      const tab2 = page.getByRole('tab', { name: /配送対応情報/ })
      if (await tab2.count() > 0) {
        await tab2.click()
      } else {
        await page.getByText('配送対応情報').first().click()
      }
      await sleep(1000)

      const editBtnD2 = page.getByRole('button', { name: '編集' })
      if (await editBtnD2.count() === 0) {
        RESULTS['PRD-002'] = { result: 'Pending', note: '[UNCONFIRMED] 編集 button not found on 配送対応情報 tab.' }
        MESSAGES['PRD-002'] = { errors: [], state: { editBtnFound: false } }
      } else {
        await editBtnD2.click()
        await sleep(800)

        // Uncheck all area checkboxes
        const checkedBoxes = await page.locator('input[type="checkbox"]:checked').all()
        for (const cb of checkedBoxes) {
          await cb.uncheck()
          await sleep(100)
        }
        await sleep(300)

        await saveBtn(page).click()
        await sleep(1500)

        const errors = await collectErrors(page)
        const stillEdit = await isEditMode(page)
        const body = await page.locator('body').textContent()

        MESSAGES['PRD-002'] = { errors, state: { stillEdit, uncheckedCount: checkedBoxes.length } }
        console.log('  [PRD-002] errors:', errors)

        const hasAreaErr = errors.some(e => e.includes('対応エリア') || e.includes('エリア'))
        if (hasAreaErr && stillEdit) {
          const actualMsg = errors.filter(e => e.includes('エリア')).join(' | ')
          // Compare to expected E_PROF002_001
          RESULTS['PRD-002'] = { result: 'NG', note: `[UNCONFIRMED] Area error found but need to compare with E_PROF002_001 message. Actual:「${actualMsg}」` }
        } else if (stillEdit) {
          const imgPath = await shot(page, 'PRD-002')
          RESULTS['PRD-002'] = { result: 'NG', note: `[UNCONFIRMED] No area error shown. errors=${JSON.stringify(errors).substring(0,200)}. Screenshot: ${imgPath}` }
        } else {
          RESULTS['PRD-002'] = { result: 'Pending', note: '[UNCONFIRMED] Form navigated away — may have saved (no checked areas = OK?). Luật 2: Pending.' }
        }
        await cancelEdit(page).catch(() => {})
      }
    } catch (e) {
      RESULTS['PRD-002'] = { result: 'NG', note: `Script error: ${e.message.substring(0, 150)}` }
      MESSAGES['PRD-002'] = { errors: [], error: e.message }
      await cancelEdit(page).catch(() => {})
    }

    // ============================================================
    // PRD-003: 保有車両 not selected error
    // ============================================================
    console.log('[PRD-003] Vehicle validation')
    try {
      await page.goto('/profile')
      await sleep(800)
      const tab2 = page.getByRole('tab', { name: /配送対応情報/ })
      if (await tab2.count() > 0) {
        await tab2.click()
      } else {
        await page.getByText('配送対応情報').first().click()
      }
      await sleep(1000)

      const editBtnD3 = page.getByRole('button', { name: '編集' })
      if (await editBtnD3.count() === 0) {
        RESULTS['PRD-003'] = { result: 'Pending', note: '[UNCONFIRMED] 編集 not found on delivery tab.' }
        MESSAGES['PRD-003'] = { errors: [], state: { editBtnFound: false } }
      } else {
        await editBtnD3.click()
        await sleep(800)

        // Try to find 保有車両 section specifically and uncheck those checkboxes
        // Look for checkboxes near 保有車両 label
        const body = await page.locator('body').textContent()
        const hasVehicleSection = body.includes('保有車両')
        console.log('  [PRD-003] has保有車両 section:', hasVehicleSection)

        // Get all checkboxes and screenshot for analysis
        const allChecked = await page.locator('input[type="checkbox"]:checked').all()
        const imgPath0 = await shot(page, 'PRD-003-before')

        // Try to find vehicle checkboxes by proximity to 保有車両 label
        // Uncheck all for now (since area might already be unchecked after PRD-002 test)
        for (const cb of allChecked) {
          await cb.uncheck()
          await sleep(100)
        }
        await sleep(300)

        await saveBtn(page).click()
        await sleep(1500)

        const errors = await collectErrors(page)
        const stillEdit = await isEditMode(page)

        MESSAGES['PRD-003'] = { errors, state: { stillEdit, hasVehicleSection } }
        console.log('  [PRD-003] errors:', errors)

        const hasVehicleErr = errors.some(e => e.includes('保有車両'))
        if (hasVehicleErr && stillEdit) {
          const actualMsg = errors.filter(e => e.includes('保有車両')).join(' | ')
          RESULTS['PRD-003'] = { result: 'NG', note: `[UNCONFIRMED] Vehicle error found. Actual:「${actualMsg}」` }
        } else if (stillEdit) {
          const imgPath = await shot(page, 'PRD-003')
          RESULTS['PRD-003'] = { result: 'NG', note: `[UNCONFIRMED] No 保有車両 error. errors=${JSON.stringify(errors).substring(0,200)}. Screenshot: ${imgPath}` }
        } else {
          RESULTS['PRD-003'] = { result: 'Pending', note: '[UNCONFIRMED] Form navigated away. Luật 2: Pending.' }
        }
        await cancelEdit(page).catch(() => {})
      }
    } catch (e) {
      RESULTS['PRD-003'] = { result: 'NG', note: `Script error: ${e.message.substring(0, 150)}` }
      MESSAGES['PRD-003'] = { errors: [], error: e.message }
      await cancelEdit(page).catch(() => {})
    }

  } finally {
    await browser.close()
    console.log('\nAll rerun TCs done.')

    // Write real-messages.json
    const msgPath = path.join(REPORT_DIR, 'real-messages.json')
    fs.writeFileSync(msgPath, JSON.stringify(MESSAGES, null, 2), 'utf8')
    console.log('Messages written to:', msgPath)

    // Write rerun results
    const resPath = '/private/tmp/claude-501/-Users-longtd-Desktop-WORK-Project-Eskitchen-AI-AGENTS-ES-KITCHEN/b11cf3b6-254f-4448-b8fe-9753db23119a/scratchpad/auto/res_9b_profile_rerun.json'
    fs.writeFileSync(resPath, JSON.stringify(RESULTS, null, 2), 'utf8')
    console.log('Rerun results written to:', resPath)

    const counts = { OK: 0, NG: 0, Pending: 0, 'N/A': 0 }
    for (const v of Object.values(RESULTS)) counts[v.result] = (counts[v.result] || 0) + 1
    console.log('Summary:', counts)
  }
}

main().catch(e => {
  console.error('MAIN ERROR:', e.message)
  const resPath = '/private/tmp/claude-501/-Users-longtd-Desktop-WORK-Project-Eskitchen-AI-AGENTS-ES-KITCHEN/b11cf3b6-254f-4448-b8fe-9753db23119a/scratchpad/auto/res_9b_profile_rerun.json'
  fs.writeFileSync(resPath, JSON.stringify(RESULTS, null, 2), 'utf8')
  process.exit(1)
})
