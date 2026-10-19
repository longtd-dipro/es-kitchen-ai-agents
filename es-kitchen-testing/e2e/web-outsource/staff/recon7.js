// Recon7 — find exact error message selectors and check specific behaviors
const { open } = require('../_helpers/session.js')
const path = require('path')
const fs = require('fs')

const REPORTS = path.resolve(__dirname, '../../../../reports/e05/staff')
fs.mkdirSync(REPORTS, { recursive: true })

async function recon7() {
  const { browser, page } = await open()
  try {
    await page.goto('/driver/create')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Fill invalid data to trigger errors
    await page.locator('input[name="driverName"]').fill('テスト太郎')
    await page.locator('input[name="nameKana"]').fill('やまだたろう') // invalid katakana
    await page.locator('input[name="phone"]').fill('090-ABCD') // invalid phone
    await page.locator('input[name="email"]').fill('invalid_email') // invalid email

    // Click 登録
    await page.locator('button').filter({ hasText: /登/ }).last().click()
    await page.waitForTimeout(1500)

    // Try many possible error selectors
    const selectors = [
      '.ant-form-item-explain-error',
      '.ant-form-item-explain',
      '[class*="explain-error"]',
      '[class*="error-message"]',
      '[class*="error-msg"]',
      '[class*="field-error"]',
      '[class*="validation"]',
      '.ant-form-explain',
      'p.text-red',
      'span.text-red-500',
      '[class*="text-red"]',
      '[class*="text-danger"]',
      '.ant-form-item-has-error .ant-form-item-explain',
    ]

    for (const sel of selectors) {
      const count = await page.locator(sel).count().catch(() => 0)
      if (count > 0) {
        const texts = await page.locator(sel).allTextContents().catch(() => [])
        console.log(`Selector "${sel}" (${count}):`, texts)
      }
    }

    // Get all elements with error-related text
    const allErrEls = await page.evaluate(() => {
      const results = []
      const allEls = document.querySelectorAll('*')
      for (const el of allEls) {
        const text = el.textContent?.trim()
        if (text && text.includes('入力してください') && el.children.length === 0) {
          results.push({
            tag: el.tagName,
            cls: el.className?.substring(0, 80),
            text: text.substring(0, 100)
          })
        }
      }
      return results.slice(0, 20)
    })
    console.log('Elements with error text:', JSON.stringify(allErrEls, null, 2))

    // Specifically check nameKana error
    const kanaErrEls = await page.evaluate(() => {
      const results = []
      const allEls = document.querySelectorAll('*')
      for (const el of allEls) {
        const text = el.textContent?.trim()
        if (text && text.includes('カタカナ') && el.children.length === 0) {
          results.push({
            tag: el.tagName,
            cls: el.className?.substring(0, 80),
            text: text.substring(0, 100)
          })
        }
      }
      return results
    })
    console.log('Katakana error elements:', JSON.stringify(kanaErrEls, null, 2))

    // Check nameKana required error
    await page.goto('/driver/create')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // Fill name but clear kana, submit
    await page.locator('input[name="driverName"]').fill('テスト太郎')
    await page.waitForTimeout(300)
    await page.locator('input[name="nameKana"]').clear()
    await page.locator('input[name="phone"]').fill('090-ABCD') // keep phone invalid to prevent save
    await page.locator('input[name="email"]').fill('invalid@') // keep email invalid
    await page.locator('button').filter({ hasText: /登/ }).last().click()
    await page.waitForTimeout(1500)

    const allErrEls2 = await page.evaluate(() => {
      const results = []
      const allEls = document.querySelectorAll('*')
      for (const el of allEls) {
        const text = el.textContent?.trim()
        if (text && (text.includes('入力してください') || text.includes('選択してください') || text.includes('アップロード')) && el.children.length === 0) {
          results.push({
            tag: el.tagName,
            cls: el.className?.substring(0, 100),
            text: text.substring(0, 120)
          })
        }
      }
      return results.slice(0, 30)
    })
    console.log('All error elements (second submit):', JSON.stringify(allErrEls2, null, 2))

    // Check for 区分 required error
    await page.goto('/driver/create')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    await page.locator('input[name="driverName"]').fill('テスト太郎')
    await page.locator('input[name="nameKana"]').fill('テストタロウ')
    // Don't select 区分 (maybe it has a default) - check
    // 区分 select
    const divSelect = page.locator('.ant-select').nth(0)
    const divValue = await divSelect.locator('.ant-select-selection-item').textContent().catch(() => 'N/A')
    console.log('区分 default value:', divValue)

    // check ステータス default
    const statSelect = page.locator('.ant-select').nth(1)
    const statValue = await statSelect.locator('.ant-select-selection-item').textContent().catch(() => 'N/A')
    console.log('ステータス default value:', statValue)

    // Check toggle button behavior more carefully
    await page.goto('/driver')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Get the toggle button
    const toggleBtn = page.locator('button.text-txt-middle').first()

    // Measure search area height/visibility before click
    const searchInputBefore = await page.locator('input[name="q"]').isVisible().catch(() => false)
    console.log('\nSearch input visible BEFORE toggle:', searchInputBefore)

    // Get parent's style
    const searchAreaBefore = await page.evaluate(() => {
      const input = document.querySelector('input[name="q"]')
      if (!input) return null
      let parent = input.parentElement
      while (parent) {
        const style = window.getComputedStyle(parent)
        if (style.display === 'none' || style.visibility === 'hidden' || style.height === '0px' || parseFloat(style.opacity) < 0.1) {
          return { cls: parent.className?.substring(0, 80), display: style.display, vis: style.visibility, height: style.height, opacity: style.opacity }
        }
        parent = parent.parentElement
        if (parent === document.body) break
      }
      return null
    })
    console.log('Search area hidden ancestor before:', searchAreaBefore)

    // Click toggle
    await toggleBtn.click()
    await page.waitForTimeout(800)
    await page.screenshot({ path: path.join(REPORTS, 'recon7_collapsed.png'), fullPage: true })

    const searchInputAfter = await page.locator('input[name="q"]').isVisible().catch(() => false)
    console.log('Search input visible AFTER toggle:', searchInputAfter)

    const searchAreaAfter = await page.evaluate(() => {
      const input = document.querySelector('input[name="q"]')
      if (!input) return null
      let parent = input.parentElement
      while (parent) {
        const style = window.getComputedStyle(parent)
        if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.height) === 0 || parseFloat(style.opacity) < 0.1) {
          return { cls: parent.className?.substring(0, 80), display: style.display, vis: style.visibility, height: style.height, opacity: style.opacity }
        }
        parent = parent.parentElement
        if (parent === document.body) break
      }
      return null
    })
    console.log('Search area hidden ancestor after toggle:', searchAreaAfter)

    // Click again to expand
    await toggleBtn.click()
    await page.waitForTimeout(800)
    const searchInputFinal = await page.locator('input[name="q"]').isVisible().catch(() => false)
    console.log('Search input visible AFTER expand:', searchInputFinal)

    // Check if the search button text is exactly "検 索" (with space) or "検索"
    const searchBtnText = await page.locator('button').filter({ hasText: /検/ }).last().textContent()
    console.log('Search button exact text:', JSON.stringify(searchBtnText))

    // Check for anonymous redirect
    await browser.close()

    // Test unauthenticated access
    const { browser: b2, page: p2 } = await require('../_helpers/session.js').open({ anonymous: true })
    try {
      await p2.goto('/driver')
      await p2.waitForTimeout(1500)
      console.log('\nUnauthenticated /driver URL:', p2.url())
    } finally {
      await b2.close()
    }

  } catch (e) {
    console.error('Error:', e.message)
    console.error(e.stack?.substring(0, 500))
    await page.screenshot({ path: path.join(REPORTS, 'recon7_error.png'), fullPage: true }).catch(() => {})
    await browser.close()
  }
}

recon7().catch(console.error)
