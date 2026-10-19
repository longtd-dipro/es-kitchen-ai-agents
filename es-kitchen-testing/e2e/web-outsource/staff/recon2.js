// Recon2 — find sidebar structure and navigate to staff page
const { open } = require('../_helpers/session.js')
const path = require('path')
const fs = require('fs')

const REPORTS = path.resolve(__dirname, '../../../../reports/e05/staff')
fs.mkdirSync(REPORTS, { recursive: true })

async function recon2() {
  const { browser, page } = await open()
  try {
    // Get all clickable elements that contain 配送スタッフ text
    await page.waitForLoadState('networkidle')

    // Get sidebar/nav HTML
    const navHtml = await page.evaluate(() => {
      const nav = document.querySelector('nav, aside, [class*="sider"], [class*="sidebar"], [class*="menu"]')
      return nav ? nav.innerHTML.substring(0, 2000) : 'NAV NOT FOUND'
    })
    console.log('Nav HTML (first 2000):', navHtml)

    // Try clicking by exact text match
    const allEls = await page.locator('*:has-text("配送スタッフ")').all()
    console.log('Elements with text 配送スタッフ count:', allEls.length)

    // Get all elements with that text (first few)
    for (let i = 0; i < Math.min(5, allEls.length); i++) {
      const el = allEls[i]
      const tag = await el.evaluate(e => e.tagName)
      const cls = await el.evaluate(e => e.className)
      const txt = await el.textContent()
      console.log(`El[${i}]: <${tag}> class="${cls}" text="${txt?.trim().substring(0, 50)}"`)
    }

    // Try navigating directly to /drivers or /staff URLs
    const possibleUrls = ['/drivers', '/staff', '/staffs', '/delivery-staff', '/driver', '/outsource/staff', '/outsource/drivers']
    for (const u of possibleUrls) {
      await page.goto(u)
      await page.waitForTimeout(500)
      const url = page.url()
      const title = await page.locator('h1').first().textContent().catch(() => 'N/A')
      console.log(`Try ${u} → ${url} | h1: ${title}`)
      if (!url.includes('dashboard') && !url.includes('login')) {
        console.log('FOUND:', u, '→', url)
        await page.screenshot({ path: path.join(REPORTS, 'recon2_found.png'), fullPage: true })
        break
      }
    }

    // Go back to dashboard and try clicking the sidebar element
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Find the li/div containing 配送スタッフ exactly
    await page.locator('li:has-text("配送スタッフ")').first().click().catch(async () => {
      // Fallback: find span with exact text
      await page.locator('span:has-text("配送スタッフ")').first().click().catch(async () => {
        // Fallback: find div with exact text
        await page.locator('div:has-text("配送スタッフ")').last().click().catch(() => {})
      })
    })
    await page.waitForTimeout(2000)
    console.log('After clicking staff, URL:', page.url())
    await page.screenshot({ path: path.join(REPORTS, 'recon2_after_click.png'), fullPage: true })

    // Check what happened
    const h1 = await page.locator('h1').first().textContent().catch(() => 'N/A')
    console.log('H1 after click:', h1)

  } catch (e) {
    console.error('Error:', e.message)
    await page.screenshot({ path: path.join(REPORTS, 'recon2_error.png'), fullPage: true }).catch(() => {})
  } finally {
    await browser.close()
  }
}

recon2().catch(console.error)
