// Exploration 7 — focused tests for LGN-003 spinner and LGN-020 button re-enable
const { open } = require('../_helpers/session.js')
const path = require('path')
const REPORT = path.resolve(__dirname, '../../../reports/e05/login')

;(async () => {
  // --- Test A: Check button state after normal auth error (no interception) ---
  const { browser: b1, page: p1 } = await open({ anonymous: true })
  try {
    await p1.goto('/login')
    await p1.waitForLoadState('networkidle')
    await p1.getByPlaceholder('ログインID').fill('OW999999')
    await p1.getByPlaceholder('パスワード').fill('Wrong1234')
    await p1.getByRole('button', { name: 'ログイン' }).click()
    await new Promise(r => setTimeout(r, 4000))

    const submitBtn = p1.locator('button[type="submit"]')
    const isDisabled = await submitBtn.isDisabled()
    const disabledAttr = await submitBtn.getAttribute('disabled')
    const ariaDisabled = await submitBtn.getAttribute('aria-disabled')
    console.log('=== AFTER AUTH ERROR (no intercept) ===')
    console.log('isDisabled:', isDisabled, 'disabled attr:', disabledAttr, 'aria-disabled:', ariaDisabled)
    await p1.screenshot({ path: path.join(REPORT, 'explore7_after_auth_error.png') })
  } finally {
    await b1.close()
  }

  // --- Test B: Check spinner with correct route (drwjtwqy9xtnf.cloudfront.net) ---
  const { browser: b2, page: p2 } = await open({ anonymous: true })
  try {
    await p2.goto('/login')
    await p2.waitForLoadState('networkidle')

    let btnStatesDuring = []
    // Intercept the exact CloudFront auth endpoint
    await p2.route('**/deliverer/auth/login', async route => {
      console.log('Intercepted auth/login — delaying 2s')
      await new Promise(r => setTimeout(r, 2000))
      await route.continue()
    })

    await p2.getByPlaceholder('ログインID').fill('OW999999')
    await p2.getByPlaceholder('パスワード').fill('Pass1234')

    const submitBtn = p2.locator('button[type="submit"]')
    const p = submitBtn.click()

    // Sample button state multiple times
    for (let i = 0; i < 5; i++) {
      await new Promise(r => setTimeout(r, 100))
      const d = await submitBtn.isDisabled().catch(() => null)
      btnStatesDuring.push(d)
    }
    console.log('\n=== BUTTON STATES DURING API DELAY (sampled every 100ms) ===', btnStatesDuring)

    await p
    await p2.waitForLoadState('networkidle').catch(() => {})
    await new Promise(r => setTimeout(r, 500))

    const btnAfter = await submitBtn.isDisabled()
    console.log('=== BUTTON STATE AFTER API COMPLETE ===', btnAfter)
    await p2.screenshot({ path: path.join(REPORT, 'explore7_after_spinner.png') })

  } catch (e) {
    console.error('Test B error:', e.message)
  } finally {
    await b2.close()
  }
})()
