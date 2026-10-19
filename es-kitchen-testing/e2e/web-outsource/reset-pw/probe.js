// Probe script — khám phá DOM màn reset PW E05
// Chạy: node e2e/web-outsource/reset-pw/probe.js
const { open } = require('../_helpers/session.js')
const path = require('path')

;(async () => {
  const { browser, page } = await open({ anonymous: true })
  try {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // Check links on login page
    const links = await page.locator('a').all()
    console.log('=== LINKS ON LOGIN PAGE ===')
    for (const lnk of links) {
      const text = (await lnk.innerText()).trim()
      const href = await lnk.getAttribute('href')
      console.log({ text, href })
    }

    // Try clicking the password forgot link
    const forgotLink = page.getByText('パスワードを忘れた方はこちら')
    const forgotLinkCount = await forgotLink.count()
    console.log('\n=== forgot link count ===', forgotLinkCount)

    if (forgotLinkCount > 0) {
      await forgotLink.click()
      await page.waitForLoadState('networkidle')
      console.log('\n=== URL after clicking forgot link ===', page.url())
      await page.screenshot({ path: path.resolve(__dirname, '../../../reports/e05/reset-pw/probe_step1.png'), fullPage: true })

      // Get all inputs on step 1
      const inputs = await page.locator('input').all()
      console.log('\n=== INPUTS STEP 1 ===')
      for (const inp of inputs) {
        const type = await inp.getAttribute('type')
        const placeholder = await inp.getAttribute('placeholder')
        const name = await inp.getAttribute('name')
        const id = await inp.getAttribute('id')
        const autocomplete = await inp.getAttribute('autocomplete')
        console.log({ type, placeholder, name, id, autocomplete })
      }

      // Buttons
      const buttons = await page.locator('button').all()
      console.log('\n=== BUTTONS STEP 1 ===')
      for (const btn of buttons) {
        const text = (await btn.innerText()).trim()
        const type = await btn.getAttribute('type')
        const disabled = await btn.isDisabled()
        console.log({ text, type, disabled })
      }

      // Headings
      const headings = await page.locator('h1, h2, h3, h4, label').allTextContents()
      console.log('\n=== HEADINGS/LABELS ===', headings)

      // Labels
      const labels = await page.locator('label').all()
      console.log('\n=== LABELS ===')
      for (const lbl of labels) {
        const text = (await lbl.innerText()).trim()
        const htmlFor = await lbl.getAttribute('for')
        console.log({ text, htmlFor })
      }

      // Check page structure
      console.log('\n=== PAGE TITLE ===', await page.title())
    } else {
      // Try looking for any "忘れ" or "パスワード" link
      const allLinks = await page.locator('a').allTextContents()
      console.log('All link texts:', allLinks)

      // Try navigate directly to common reset PW paths
      for (const path2 of ['/forgot-password', '/reset-password', '/password-reset', '/forget-password', '/auth/forgot', '/auth/reset']) {
        try {
          await page.goto(path2)
          await page.waitForLoadState('networkidle')
          const url = page.url()
          console.log(`Try ${path2} → ${url}`)
          if (!url.includes('/login')) {
            console.log('FOUND RESET PAGE AT:', url)
            break
          }
        } catch (e) {
          console.log(`${path2}: ERROR ${e.message}`)
        }
      }
    }

  } catch (e) {
    console.error('PROBE ERROR:', e.message)
    console.error(e.stack)
  } finally {
    await browser.close()
  }
})()
