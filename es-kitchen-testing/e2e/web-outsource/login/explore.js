// Exploration script — khám phá DOM màn login E05
// Chạy: node e2e/web-outsource/login/explore.js
const { open } = require('../_helpers/session.js')
const path = require('path')

;(async () => {
  const { browser, page } = await open({ anonymous: true })
  try {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // Chụp ảnh toàn màn
    await page.screenshot({ path: path.resolve(__dirname, '../../../reports/e05/login/explore_login.png'), fullPage: true })

    // Lấy tất cả input fields
    const inputs = await page.locator('input').all()
    console.log('=== INPUT FIELDS ===')
    for (const inp of inputs) {
      const type = await inp.getAttribute('type')
      const placeholder = await inp.getAttribute('placeholder')
      const name = await inp.getAttribute('name')
      const id = await inp.getAttribute('id')
      console.log({ type, placeholder, name, id })
    }

    // Lấy tất cả buttons
    const buttons = await page.locator('button').all()
    console.log('\n=== BUTTONS ===')
    for (const btn of buttons) {
      const text = (await btn.innerText()).trim()
      const type = await btn.getAttribute('type')
      const disabled = await btn.isDisabled()
      console.log({ text, type, disabled })
    }

    // Lấy links
    const links = await page.locator('a').all()
    console.log('\n=== LINKS ===')
    for (const lnk of links) {
      const text = (await lnk.innerText()).trim()
      const href = await lnk.getAttribute('href')
      console.log({ text, href })
    }

    // Check page URL
    console.log('\n=== PAGE URL ===', page.url())

    // Check for logo/images
    const imgs = await page.locator('img').all()
    console.log('\n=== IMAGES ===')
    for (const img of imgs) {
      const src = await img.getAttribute('src')
      const alt = await img.getAttribute('alt')
      console.log({ src, alt })
    }

    // Check card structure
    const cardTitle = await page.locator('h1, h2, h3').allTextContents()
    console.log('\n=== HEADINGS ===', cardTitle)

    // Check current URL pattern
    console.log('\n=== FINAL URL ===', page.url())

  } catch (e) {
    console.error('EXPLORE ERROR:', e.message)
  } finally {
    await browser.close()
  }
})()
