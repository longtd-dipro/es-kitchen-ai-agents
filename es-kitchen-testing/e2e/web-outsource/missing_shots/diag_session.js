'use strict'
const { open } = require('../_helpers/session.js')
const path = require('path')
const fs = require('fs')
const SHOT = path.resolve(__dirname, '../../../reports/e05/staff')
fs.mkdirSync(SHOT, { recursive: true })

async function main() {
  console.log('Session diagnostic...')
  const { browser, page } = await open()
  try {
    console.log('After open(), current URL:', page.url().replace(/https?:\/\/[^/]+/, 'HOST'))

    // Try navigating to /driver (staff list)
    await page.goto('/driver')
    await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(e => console.log('networkidle timeout:', e.message))
    const url1 = page.url().replace(/https?:\/\/[^/]+/, 'HOST')
    console.log('After goto /driver:', url1)

    // Take screenshot
    const p1 = path.join(SHOT, 'diag_driver.png')
    await page.screenshot({ path: p1, fullPage: false })
    console.log('Screenshot:', p1)

    // Check for ant-select
    const selCount = await page.locator('.ant-select').count()
    console.log('ant-select count on /driver:', selCount)

    // Check page title / h1
    const h1 = await page.locator('h1, h2, h3').first().textContent().catch(() => '')
    console.log('Page heading:', h1)

    // Try /driver/create
    await page.goto('/driver/create')
    await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(e => console.log('networkidle timeout on create:', e.message))
    const url2 = page.url().replace(/https?:\/\/[^/]+/, 'HOST')
    console.log('After goto /driver/create:', url2)

    const inputCount = await page.locator('input').count()
    console.log('Input count on /driver/create:', inputCount)
    const inputNames = await page.locator('input[name]').evaluateAll(els => els.map(e => e.getAttribute('name')))
    console.log('Input names:', inputNames)

    const p2 = path.join(SHOT, 'diag_create.png')
    await page.screenshot({ path: p2, fullPage: false })
    console.log('Screenshot:', p2)

  } finally {
    await browser.close()
  }
}
main().catch(e => { console.error('DIAG ERROR:', e.message); process.exit(1) })
