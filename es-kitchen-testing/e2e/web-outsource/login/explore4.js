// Exploration 4 — login success, sidebar, back navigation, LGN button class
const { open } = require('../_helpers/session.js')
const path = require('path')

;(async () => {
  const { browser, page } = await open({ anonymous: true })
  try {
    // Check login button class (primary or default?)
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    const loginBtn = page.getByRole('button', { name: 'ログイン' })
    const loginBtnClass = await loginBtn.getAttribute('class')
    console.log('=== LOGIN BUTTON CLASS ===', loginBtnClass)
    const loginBtnType = await loginBtn.getAttribute('type')
    console.log('=== LOGIN BUTTON TYPE ===', loginBtnType)

    // Register button class
    const regBtn = page.locator('button:not([type="submit"])').first()
    const regBtnClass = await regBtn.getAttribute('class')
    console.log('=== REGISTER BUTTON CLASS ===', regBtnClass)

    // Login with valid credentials (LGNAV-001)
    await page.getByPlaceholder('ログインID').fill(process.env.E05_EMAIL || 'OW000123')
    await page.getByPlaceholder('パスワード').fill(process.env.E05_PASSWORD || 'Pass1234')
    await page.getByRole('button', { name: 'ログイン' }).click()
    await page.waitForURL(/dashboard/, { timeout: 15000 })
    console.log('\n=== URL AFTER SUCCESSFUL LOGIN ===', page.url())
    await page.screenshot({ path: path.resolve(__dirname, '../../../reports/e05/login/explore_home_after_login.png') })

    // Check sidebar items
    const sidebarItems = await page.locator('nav, [class*="sider"], [class*="sidebar"], [class*="menu"], .ant-menu').allTextContents()
    console.log('\n=== SIDEBAR ITEMS (all) ===', sidebarItems)

    // Get all nav links/menu items
    const menuItems = await page.locator('.ant-menu-item, [role="menuitem"]').allTextContents()
    console.log('\n=== MENU ITEMS ===', menuItems)

    // Get full page text
    const homeText = await page.locator('body').innerText()
    console.log('\n=== HOME PAGE TEXT (first 1000) ===', homeText.substring(0, 1000))

    // --- Back navigation: from register to login ---
    await page.goBack()
    await page.waitForLoadState('networkidle')
    console.log('\n=== URL AFTER BACK FROM HOME ===', page.url())

  } catch (e) {
    console.error('EXPLORE4 ERROR:', e.message)
    await page.screenshot({ path: path.resolve(__dirname, '../../../reports/e05/login/explore4_error.png') }).catch(() => {})
  } finally {
    await browser.close()
  }
})()
