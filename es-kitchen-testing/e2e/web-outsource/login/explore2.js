// Exploration script 2 — khám phá error states, eye icon, navigation
const { open } = require('../_helpers/session.js')
const path = require('path')

;(async () => {
  const { browser, page } = await open({ anonymous: true })
  try {
    // --- Test 1: Empty submit → check error messages ---
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: 'ログイン' }).click()
    await page.waitForTimeout(500)
    await page.screenshot({ path: path.resolve(__dirname, '../../../reports/e05/login/explore_empty_errors.png') })
    const errorTexts1 = await page.locator('[class*="error"], [class*="Error"], [role="alert"], p').allTextContents()
    console.log('=== EMPTY SUBMIT ERRORS ===', errorTexts1.filter(t => t.trim()))

    // Check input border/aria attributes for error state
    const loginIdInput = page.getByPlaceholder('ログインID')
    const pwInput = page.getByPlaceholder('パスワード')
    const idAriaInvalid = await loginIdInput.getAttribute('aria-invalid')
    const pwAriaInvalid = await pwInput.getAttribute('aria-invalid')
    console.log('aria-invalid: loginId=', idAriaInvalid, ', pw=', pwAriaInvalid)

    // Get all visible text after submit
    const allText = await page.locator('body').innerText()
    console.log('\n=== ALL PAGE TEXT (first 2000 chars) ===')
    console.log(allText.substring(0, 2000))

    // --- Test 2: Eye icon ---
    await page.reload()
    await page.waitForLoadState('networkidle')
    const eyeButtons = await page.locator('button[type="button"], [role="button"]').all()
    console.log('\n=== EYE/ICON BUTTONS ===')
    for (const btn of eyeButtons) {
      const text = (await btn.innerText()).trim()
      const ariaLabel = await btn.getAttribute('aria-label')
      const type = await btn.getAttribute('type')
      const classes = await btn.getAttribute('class')
      console.log({ text, ariaLabel, type, classes: classes?.substring(0, 80) })
    }

    // SVG icons in buttons
    const svgBtns = await page.locator('button svg').all()
    console.log('\n=== SVG IN BUTTONS ===', svgBtns.length)

    // --- Test 3: Password input type after eye click ---
    await page.getByPlaceholder('パスワード').fill('Pass1234')
    const pwType1 = await page.getByPlaceholder('パスワード').getAttribute('type')
    console.log('\n=== PASSWORD TYPE BEFORE EYE CLICK ===', pwType1)

    // Find and click eye icon button
    // Try various selectors for the eye toggle
    const eyeToggle = page.locator('button').filter({ has: page.locator('svg') }).first()
    const eyeExists = await eyeToggle.count()
    console.log('Eye toggle button (first svg button) exists:', eyeExists)

    if (eyeExists > 0) {
      await eyeToggle.click()
      await page.waitForTimeout(300)
      const pwType2 = await page.getByPlaceholder('パスワード').getAttribute('type')
      console.log('=== PASSWORD TYPE AFTER EYE CLICK ===', pwType2)

      // Click again
      await eyeToggle.click()
      await page.waitForTimeout(300)
      const pwType3 = await page.getByPlaceholder('パスワード').getAttribute('type')
      console.log('=== PASSWORD TYPE AFTER 2nd EYE CLICK ===', pwType3)
    }

    // --- Test 4: 新規契約 button destination ---
    await page.reload()
    await page.waitForLoadState('networkidle')
    const regBtnText = await page.locator('button:not([type="submit"])').first().innerText()
    console.log('\n=== REGISTER BUTTON TEXT ===', regBtnText)
    await page.locator('button:not([type="submit"])').first().click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    console.log('=== URL AFTER REGISTER CLICK ===', page.url())
    await page.screenshot({ path: path.resolve(__dirname, '../../../reports/e05/login/explore_register_page.png') })
    const regPageTitle = await page.locator('h1, h2, h3').allTextContents()
    console.log('=== REGISTER PAGE HEADINGS ===', regPageTitle)

    // Check if registration form has step indicator
    const stepText = await page.locator('body').innerText()
    console.log('=== REGISTER PAGE (first 500) ===', stepText.substring(0, 500))

    // --- Test 5: Password reset link ---
    await page.goBack()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
    await page.getByText('パスワードを忘れた方はこちら').click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
    console.log('\n=== URL AFTER FORGOT PW CLICK ===', page.url())
    const fgpTitle = await page.locator('h1, h2, h3').allTextContents()
    console.log('=== FORGOT PW PAGE HEADINGS ===', fgpTitle)
    await page.screenshot({ path: path.resolve(__dirname, '../../../reports/e05/login/explore_forgot_pw.png') })

  } catch (e) {
    console.error('EXPLORE2 ERROR:', e.message)
    await page.screenshot({ path: path.resolve(__dirname, '../../../reports/e05/login/explore2_error.png') }).catch(() => {})
  } finally {
    await browser.close()
  }
})()
