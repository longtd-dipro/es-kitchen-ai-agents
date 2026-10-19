// Exploration 6 — find actual API endpoint, check spinner, fix LGNAV-001 wait
const { open } = require('../_helpers/session.js')
const path = require('path')

;(async () => {
  const REPORT = path.resolve(__dirname, '../../../reports/e05/login')
  const { browser, page } = await open({ anonymous: true })
  try {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // Capture all network requests
    const requests = []
    page.on('request', req => {
      if (req.resourceType() === 'fetch' || req.resourceType() === 'xhr') {
        requests.push({ url: req.url(), method: req.method(), type: req.resourceType() })
      }
    })

    await page.getByPlaceholder('ログインID').fill('OW999999')
    await page.getByPlaceholder('パスワード').fill('Pass1234')
    await page.getByRole('button', { name: 'ログイン' }).click()
    await new Promise(r => setTimeout(r, 4000))

    console.log('=== API REQUESTS ===')
    requests.forEach(r => console.log(r))

    // Now test spinner with correct route pattern
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // Use broader route to intercept all requests
    let interceptedUrl = null
    await page.route('**/*', async route => {
      const req = route.request()
      const url = req.url()
      if ((req.resourceType() === 'fetch' || req.resourceType() === 'xhr') && !url.endsWith('.js') && !url.endsWith('.css') && !url.endsWith('.png') && !url.endsWith('.webp')) {
        console.log('INTERCEPTED:', req.method(), url.split('?')[0].replace(/https?:\/\/[^/]+/, ''))
        interceptedUrl = url
        await new Promise(r => setTimeout(r, 2500)) // delay 2.5s
      }
      await route.continue()
    })

    await page.getByPlaceholder('ログインID').fill('OW999999')
    await page.getByPlaceholder('パスワード').fill('Pass1234')

    const loginBtn = page.locator('button[type="submit"]')

    const clickP = loginBtn.click()
    await new Promise(r => setTimeout(r, 400))

    // Check button state during intercepted call
    const submitBtn = page.locator('button[type="submit"]')
    const submitClass = await submitBtn.getAttribute('class')
    const submitDisabled = await submitBtn.getAttribute('disabled')
    const ariaDisabled = await submitBtn.getAttribute('aria-disabled')
    const isDisabledAPI = await submitBtn.isDisabled()

    // Check for any loading indicators
    const loadingEl = await page.locator('[class*="ant-btn-loading"], [class*="loading-icon"], .ant-spin-spinning').count()

    console.log('\n=== BUTTON STATE DURING API CALL ===')
    console.log('submit class:', submitClass)
    console.log('submit disabled attr:', submitDisabled)
    console.log('aria-disabled:', ariaDisabled)
    console.log('isDisabled():', isDisabledAPI)
    console.log('loading elements:', loadingEl)

    await page.screenshot({ path: path.join(REPORT, 'explore6_spinner.png') })

    await clickP.catch(() => {})
    await page.waitForLoadState('networkidle').catch(() => {})
    await new Promise(r => setTimeout(r, 500))

    // After API complete
    const submitClassAfter = await submitBtn.getAttribute('class')
    const isDisabledAfter = await submitBtn.isDisabled()
    console.log('\n=== BUTTON STATE AFTER API CALL ===')
    console.log('class after:', submitClassAfter)
    console.log('isDisabled after:', isDisabledAfter)

    // LGNAV-001: test sidebar wait
    await page.unroute('**/*')
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page.getByPlaceholder('ログインID').fill(process.env.E05_EMAIL || '')
    await page.getByPlaceholder('パスワード').fill(process.env.E05_PASSWORD || '')
    await page.getByRole('button', { name: 'ログイン' }).click()
    await page.waitForURL(/dashboard/, { timeout: 15000 })

    // Wait for menu to render
    await page.waitForSelector('[role="menuitem"]', { timeout: 5000 })
    const menuItems = await page.locator('[role="menuitem"]').allTextContents()
    console.log('\n=== MENU ITEMS AFTER PROPER WAIT ===', menuItems)

  } catch (e) {
    console.error('ERROR:', e.message)
    await page.screenshot({ path: path.join(REPORT, 'explore6_error.png') }).catch(() => {})
  } finally {
    await browser.close()
  }
})()
