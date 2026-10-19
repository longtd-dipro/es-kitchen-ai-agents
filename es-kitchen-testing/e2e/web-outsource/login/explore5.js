// Exploration 5 — investigate LGNAV-001 sidebar, LGN-003/020 spinner
const { open } = require('../_helpers/session.js')
const path = require('path')

;(async () => {
  const REPORT = path.resolve(__dirname, '../../../reports/e05/login')

  // --- Investigate LGNAV-001: sidebar after login ---
  const { browser, page } = await open({ anonymous: true })
  try {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page.getByPlaceholder('ログインID').fill(process.env.E05_EMAIL || '')
    await page.getByPlaceholder('パスワード').fill(process.env.E05_PASSWORD || '')
    await page.getByRole('button', { name: 'ログイン' }).click()
    await page.waitForURL(/dashboard/, { timeout: 15000 })
    await page.waitForLoadState('networkidle')
    await new Promise(r => setTimeout(r, 1000)) // wait for React to render

    console.log('=== URL after login ===', page.url())
    await page.screenshot({ path: path.join(REPORT, 'explore_dashboard.png') })

    // Try multiple selectors for menu
    const menuItem1 = await page.locator('[role="menuitem"]').count()
    const menuItem2 = await page.locator('.ant-menu-item').count()
    const menuItem3 = await page.locator('[class*="menu-item"]').count()
    const menuItem4 = await page.locator('li').count()
    console.log('menuitem role:', menuItem1)
    console.log('.ant-menu-item:', menuItem2)
    console.log('[class*=menu-item]:', menuItem3)
    console.log('li count:', menuItem4)

    // Get menu text with all approaches
    const texts1 = await page.locator('[role="menuitem"]').allTextContents()
    const texts2 = await page.locator('.ant-menu-item').allTextContents()
    console.log('texts from [role=menuitem]:', texts1)
    console.log('texts from .ant-menu-item:', texts2)

    // Wait longer and try again
    await new Promise(r => setTimeout(r, 2000))
    const textsWait = await page.locator('[role="menuitem"]').allTextContents()
    console.log('texts after wait:', textsWait)

    // What does the sidebar actually look like?
    const siderHTML = await page.locator('aside, [class*="sider"], nav').first().innerHTML().catch(() => 'not found')
    console.log('Sider HTML (first 500):', siderHTML.substring(0, 500))

    // --- Investigate spinner (LGN-003 / LGN-020) ---
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // Check what happens to button during API call
    let btnClassDuring = null
    let btnAriaDisabled = null
    let btnHasLoadingIcon = false

    await page.route('**/api/**', async route => {
      const req = route.request()
      if (req.resourceType() === 'fetch' || req.resourceType() === 'xhr') {
        await new Promise(r => setTimeout(r, 2000))
      }
      await route.continue()
    })

    await page.getByPlaceholder('ログインID').fill('OW999999')
    await page.getByPlaceholder('パスワード').fill('Wrong1234')

    const loginBtn = page.getByRole('button', { name: 'ログイン' })

    const clickP = page.getByRole('button', { name: 'ログイン' }).click()
    await new Promise(r => setTimeout(r, 300))

    // Check all button properties during load
    const btnHandle = await loginBtn.elementHandle()
    if (btnHandle) {
      btnClassDuring = await btnHandle.getAttribute('class')
      btnAriaDisabled = await btnHandle.getAttribute('aria-disabled') || await btnHandle.getAttribute('disabled')
      const loadingIcon = await page.locator('[class*="loading"], [class*="ant-btn-loading"], .ant-btn-loading').count()
      btnHasLoadingIcon = loadingIcon > 0
      console.log('\n=== BUTTON DURING LOAD ===')
      console.log('class:', btnClassDuring)
      console.log('aria-disabled:', btnAriaDisabled)
      console.log('loadingIcon count:', loadingIcon)

      // Get the button's parent/wrapper
      const btnWrapper = await page.locator('button[type="submit"]').elementHandle()
      if (btnWrapper) {
        const wrapperClass = await btnWrapper.getAttribute('class')
        const wrapperDisabled = await btnWrapper.getAttribute('disabled')
        console.log('submit button wrapper class:', wrapperClass)
        console.log('submit button disabled attr:', wrapperDisabled)
      }

      await page.screenshot({ path: path.join(REPORT, 'explore_spinner.png') })
    }

    await clickP
    await page.waitForLoadState('networkidle').catch(() => {})
    await new Promise(r => setTimeout(r, 500))

    // After load
    const btnClassAfter = await loginBtn.getAttribute('class')
    const btnDisabledAfter = await loginBtn.isDisabled()
    console.log('=== BUTTON AFTER LOAD ===')
    console.log('class after:', btnClassAfter)
    console.log('disabled after:', btnDisabledAfter)

    await page.screenshot({ path: path.join(REPORT, 'explore_after_spinner.png') })

  } catch (e) {
    console.error('ERROR:', e.message)
    await page.screenshot({ path: path.join(REPORT, 'explore5_error.png') }).catch(() => {})
  } finally {
    await browser.close()
  }
})()
