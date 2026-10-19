// Probe2 — khám phá error states và behavior step 1
const { open } = require('../_helpers/session.js')
const path = require('path')

;(async () => {
  const { browser, page } = await open({ anonymous: true })
  try {
    await page.goto('/forgot-password')
    await page.waitForLoadState('networkidle')

    console.log('=== TEST 1: Submit empty fields ===')
    await page.getByRole('button', { name: '認証コードを送信' }).click()
    await page.waitForTimeout(500)
    await page.screenshot({ path: path.resolve(__dirname, '../../../reports/e05/reset-pw/probe_empty_error.png'), fullPage: true })

    // Find error messages
    const errorTexts = await page.locator('[class*="error"], [class*="Error"], .error-message, [role="alert"], p[class*="msg"], span[class*="msg"], .form-error').allTextContents()
    console.log('Error texts (CSS selectors):', errorTexts)

    // Try to get all paragraphs and spans near inputs
    const allParagraphs = await page.locator('p').allTextContents()
    console.log('All paragraphs:', allParagraphs)

    const allSpans = await page.locator('span').allTextContents()
    console.log('All spans:', allSpans)

    // Check for error text specifically
    const loginIdErrors = await page.getByText('ログインIDは必須項目です。').count()
    const emailErrors = await page.getByText('メールアドレスは必須項目です。').count()
    console.log('ログインID error count:', loginIdErrors)
    console.log('メールアドレス error count:', emailErrors)

    // Check input error styling
    const loginIdInput = page.getByPlaceholder('ログインID')
    const inputClass = await loginIdInput.getAttribute('class')
    console.log('Login ID input class after error:', inputClass)

    // Check full DOM structure for errors
    const bodyHTML = await page.evaluate(() => {
      // Get text content of all elements that likely contain errors
      const forms = document.querySelectorAll('form')
      let result = ''
      forms.forEach(form => {
        result += form.innerText + '\n'
      })
      return result
    })
    console.log('Form text content after submit:', bodyHTML)

    console.log('\n=== TEST 2: Focus state ===')
    await page.reload()
    await page.waitForLoadState('networkidle')
    const loginInput = page.getByPlaceholder('ログインID')
    await loginInput.click()
    const focusedClass = await loginInput.getAttribute('class')
    console.log('Focused input class:', focusedClass)

    // Compute styles
    const borderColor = await page.evaluate(() => {
      const el = document.querySelector('input[placeholder="ログインID"]')
      if (!el) return 'not found'
      return window.getComputedStyle(el).borderColor
    })
    console.log('Border color on focus:', borderColor)

    console.log('\n=== TEST 3: Wrong ID ===')
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.getByPlaceholder('ログインID').fill('OW999999')
    await page.getByPlaceholder('メールアドレス').fill('user_a@example.com')
    await page.getByRole('button', { name: '認証コードを送信' }).click()
    await page.waitForTimeout(1500)
    await page.screenshot({ path: path.resolve(__dirname, '../../../reports/e05/reset-pw/probe_wrong_id.png'), fullPage: true })
    const wrongIdErrors = await page.getByText('ログインIDまたはメールアドレスが正しくありません。').count()
    console.log('Wrong ID error visible:', wrongIdErrors > 0)
    const currentURL3 = page.url()
    console.log('URL after wrong ID:', currentURL3)

    // Get all visible error texts
    const allTexts3 = await page.evaluate(() => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
      const texts = []
      let node
      while (node = walker.nextNode()) {
        const text = node.textContent.trim()
        if (text && node.parentElement && window.getComputedStyle(node.parentElement).display !== 'none') {
          texts.push(text)
        }
      }
      return texts.filter(t => t.length > 2 && t.includes('。'))
    })
    console.log('Japanese texts with 。:', allTexts3)

    console.log('\n=== TEST 4: Unregistered email ===')
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.getByPlaceholder('ログインID').fill('OW000123')
    await page.getByPlaceholder('メールアドレス').fill('unknown_z@example.com')
    await page.getByRole('button', { name: '認証コードを送信' }).click()
    await page.waitForTimeout(1500)
    await page.screenshot({ path: path.resolve(__dirname, '../../../reports/e05/reset-pw/probe_unreg_email.png'), fullPage: true })
    const unregEmailError = await page.getByText('このメールアドレスは登録されていません。').count()
    console.log('Unregistered email error visible:', unregEmailError > 0)
    const currentURL4 = page.url()
    console.log('URL after unregistered email:', currentURL4)

    const allTexts4 = await page.evaluate(() => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
      const texts = []
      let node
      while (node = walker.nextNode()) {
        const text = node.textContent.trim()
        if (text && node.parentElement && window.getComputedStyle(node.parentElement).display !== 'none') {
          texts.push(text)
        }
      }
      return texts.filter(t => t.length > 2 && t.includes('。'))
    })
    console.log('Japanese texts with 。 (test4):', allTexts4)

    console.log('\n=== TEST 5: XSS injection ===')
    await page.reload()
    await page.waitForLoadState('networkidle')
    const xssDialogTriggered = { value: false }
    page.on('dialog', async dialog => {
      xssDialogTriggered.value = true
      console.log('DIALOG APPEARED:', dialog.message())
      await dialog.dismiss()
    })
    await page.getByPlaceholder('ログインID').fill('<script>alert(1)</script>')
    await page.getByPlaceholder('メールアドレス').fill('user_a@example.com')
    await page.getByRole('button', { name: '認証コードを送信' }).click()
    await page.waitForTimeout(1500)
    console.log('XSS dialog triggered:', xssDialogTriggered.value)
    await page.screenshot({ path: path.resolve(__dirname, '../../../reports/e05/reset-pw/probe_xss.png'), fullPage: true })
    console.log('URL after XSS:', page.url())

    console.log('\n=== TEST 6: SQLi injection ===')
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.getByPlaceholder('ログインID').fill("' OR 1=1--")
    await page.getByPlaceholder('メールアドレス').fill('user_a@example.com')
    await page.getByRole('button', { name: '認証コードを送信' }).click()
    await page.waitForTimeout(1500)
    await page.screenshot({ path: path.resolve(__dirname, '../../../reports/e05/reset-pw/probe_sqli.png'), fullPage: true })
    const sqliURL = page.url()
    console.log('URL after SQLi:', sqliURL)
    const sqliStayedOnPage = sqliURL.includes('forgot-password')
    console.log('Stayed on forgot-password page:', sqliStayedOnPage)

    const allTexts6 = await page.evaluate(() => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
      const texts = []
      let node
      while (node = walker.nextNode()) {
        const text = node.textContent.trim()
        if (text && node.parentElement && window.getComputedStyle(node.parentElement).display !== 'none') {
          texts.push(text)
        }
      }
      return texts.filter(t => t.length > 2 && t.includes('。'))
    })
    console.log('Japanese texts with 。 (SQLi):', allTexts6)

  } catch (e) {
    console.error('PROBE2 ERROR:', e.message)
    console.error(e.stack)
  } finally {
    await browser.close()
  }
})()
