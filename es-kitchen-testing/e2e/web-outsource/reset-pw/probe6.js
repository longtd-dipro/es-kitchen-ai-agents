// Probe6 — test RPWNAV-001 specifically: navigate from login via link
const { open } = require('../_helpers/session.js')
const path = require('path')

;(async () => {
  const { browser, page } = await open({ anonymous: true })
  try {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    console.log('Login page loaded')

    // Find forgot link
    const forgotLink = page.getByText('パスワードを忘れた方はこちら')
    console.log('Forgot link found:', await forgotLink.count())

    await forgotLink.click()
    // Wait for URL change
    await page.waitForURL('**/forgot-password', { timeout: 10000 })
    console.log('URL:', page.url())

    // Wait for the form elements to be visible
    await page.waitForSelector('input[placeholder="ログインID"]', { timeout: 10000 })
    await page.waitForSelector('input[placeholder="メールアドレス"]', { timeout: 10000 })

    const loginIdCount = await page.getByPlaceholder('ログインID').count()
    const emailCount = await page.getByPlaceholder('メールアドレス').count()
    console.log('ログインID input count:', loginIdCount)
    console.log('メールアドレス input count:', emailCount)

    const loginIdVal = await page.getByPlaceholder('ログインID').inputValue()
    const emailVal = await page.getByPlaceholder('メールアドレス').inputValue()
    console.log('ログインID value:', loginIdVal)
    console.log('メールアドレス value:', emailVal)

    // Check no errors
    const errorCount = await page.getByText('ログインIDは必須項目です。').count()
    console.log('Error messages:', errorCount)

    await page.screenshot({ path: path.resolve(__dirname, '../../../reports/e05/reset-pw/probe_rpwnav001.png'), fullPage: true })
    console.log('Screenshot saved')

    // Check all inputs
    const allInputs = await page.locator('input').all()
    console.log('Total inputs on page:', allInputs.length)
    for (const inp of allInputs) {
      const placeholder = await inp.getAttribute('placeholder')
      const type = await inp.getAttribute('type')
      console.log({ placeholder, type })
    }

  } catch (e) {
    console.error('PROBE6 ERROR:', e.message)
    await page.screenshot({ path: path.resolve(__dirname, '../../../reports/e05/reset-pw/probe6_error.png'), fullPage: true }).catch(() => {})
  } finally {
    await browser.close()
  }
})()
