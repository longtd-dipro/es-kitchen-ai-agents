// Exploration script 3 — format errors + auth errors + eye icon + focus behavior
const { open } = require('../_helpers/session.js')
const path = require('path')

;(async () => {
  const { browser, page } = await open({ anonymous: true })
  try {
    // --- Test pw format error: 7-char password ---
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page.getByPlaceholder('ログインID').fill('OW999999')
    await page.getByPlaceholder('パスワード').fill('Pass123')
    await page.getByRole('button', { name: 'ログイン' }).click()
    await page.waitForTimeout(500)
    const errors7char = await page.locator('body').innerText()
    console.log('=== PW FORMAT ERROR (7 chars) ===')
    const lines = errors7char.split('\n').filter(l => l.trim())
    console.log(lines.join('\n'))
    await page.screenshot({ path: path.resolve(__dirname, '../../../reports/e05/login/explore_pw_format_error.png') })

    // --- Test pw format error: all letters ---
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.getByPlaceholder('ログインID').fill('OW999999')
    await page.getByPlaceholder('パスワード').fill('Password')
    await page.getByRole('button', { name: 'ログイン' }).click()
    await page.waitForTimeout(500)
    const errorsAllLetters = await page.locator('[class*="error"], [class*="Error"], [role="alert"], p').allTextContents()
    console.log('\n=== PW FORMAT ERROR (all letters) ===', errorsAllLetters.filter(t => t.trim()))

    // --- Test auth error: wrong credentials (non-existent ID) ---
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.getByPlaceholder('ログインID').fill('OW999999')
    await page.getByPlaceholder('パスワード').fill('Pass1234')
    await page.getByRole('button', { name: 'ログイン' }).click()
    await page.waitForTimeout(3000)
    const authErrors = await page.locator('body').innerText()
    console.log('\n=== AUTH ERROR (non-existent ID) ===')
    const authLines = authErrors.split('\n').filter(l => l.trim())
    console.log(authLines.join('\n'))
    await page.screenshot({ path: path.resolve(__dirname, '../../../reports/e05/login/explore_auth_error.png') })
    console.log('\n=== PAGE URL after auth error ===', page.url())

    // --- Test: focus out without submit → no errors ---
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.getByPlaceholder('ログインID').click()
    await page.getByPlaceholder('パスワード').click()
    await page.locator('body').click()
    await page.waitForTimeout(300)
    const focusOutErrors = await page.locator('[class*="error"], [class*="Error"]').allTextContents()
    console.log('\n=== FOCUS OUT (no submit) ERRORS ===', focusOutErrors.filter(t => t.trim()))

    // --- Eye icon exploration ---
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.getByPlaceholder('パスワード').fill('Pass1234')
    const pwTypeBefore = await page.getByPlaceholder('パスワード').getAttribute('type')
    console.log('\n=== PASSWORD TYPE BEFORE EYE ===', pwTypeBefore)

    // Try clicking the Ant Design eye icon
    const eyeIcon = page.locator('[aria-label="Show"]')
    const eyeCount = await eyeIcon.count()
    console.log('Eye icon [aria-label=Show] count:', eyeCount)

    if (eyeCount > 0) {
      await eyeIcon.click()
      await page.waitForTimeout(300)
      const pwTypeAfter = await page.getByPlaceholder('パスワード').getAttribute('type')
      console.log('=== PASSWORD TYPE AFTER EYE CLICK ===', pwTypeAfter)
      const pwValue = await page.getByPlaceholder('パスワード').inputValue()
      console.log('=== PASSWORD VALUE AFTER EYE CLICK ===', pwValue)

      // Click again to hide
      const eyeHide = page.locator('[aria-label="Hide"]')
      const hideCount = await eyeHide.count()
      console.log('Eye icon [aria-label=Hide] count:', hideCount)
      if (hideCount > 0) {
        await eyeHide.click()
        await page.waitForTimeout(300)
        const pwTypeAfterHide = await page.getByPlaceholder('パスワード').getAttribute('type')
        console.log('=== PASSWORD TYPE AFTER HIDE CLICK ===', pwTypeAfterHide)
      }
    }

    // --- Test eye icon click when fields empty (should not trigger validate) ---
    await page.reload()
    await page.waitForLoadState('networkidle')
    const eyeIconEmpty = page.locator('[aria-label="Show"]')
    if (await eyeIconEmpty.count() > 0) {
      await eyeIconEmpty.click()
      await page.waitForTimeout(300)
      const errorsAfterEye = await page.locator('[class*="error"], [class*="Error"]').allTextContents()
      console.log('\n=== ERRORS AFTER EYE CLICK (empty fields) ===', errorsAfterEye.filter(t => t.trim()))
    }

    // --- Check XSS behavior ---
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page.getByPlaceholder('ログインID').fill('<script>alert(1)</script>')
    await page.getByPlaceholder('パスワード').fill('Pass1234')

    let alertFired = false
    page.on('dialog', async dialog => {
      alertFired = true
      await dialog.dismiss()
    })
    await page.getByRole('button', { name: 'ログイン' }).click()
    await page.waitForTimeout(3000)
    console.log('\n=== XSS ALERT FIRED ===', alertFired)
    console.log('=== URL after XSS test ===', page.url())
    const xssPageText = await page.locator('body').innerText()
    const xssLines = xssPageText.split('\n').filter(l => l.trim())
    console.log('=== XSS PAGE TEXT ===', xssLines.join('\n'))

    // --- Check SQL injection ---
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page.getByPlaceholder('ログインID').fill('OW999999')
    await page.getByPlaceholder('パスワード').fill("' OR 1=1--")
    await page.getByRole('button', { name: 'ログイン' }).click()
    await page.waitForTimeout(3000)
    console.log('\n=== URL after SQL injection ===', page.url())
    const sqlText = await page.locator('body').innerText()
    const sqlLines = sqlText.split('\n').filter(l => l.trim())
    console.log('=== SQL INJECTION PAGE TEXT ===', sqlLines.join('\n'))
    await page.screenshot({ path: path.resolve(__dirname, '../../../reports/e05/login/explore_sql_injection.png') })

  } catch (e) {
    console.error('EXPLORE3 ERROR:', e.message)
    await page.screenshot({ path: path.resolve(__dirname, '../../../reports/e05/login/explore3_error.png') }).catch(() => {})
  } finally {
    await browser.close()
  }
})()
