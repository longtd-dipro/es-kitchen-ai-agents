// Probe4 — kiểm tra RPWNAV-005 sub-test 1 (empty ログインID + có email)
// và step 2 layout tại /verify
const { open } = require('../_helpers/session.js')
const path = require('path')

;(async () => {
  const { browser, page } = await open({ anonymous: true })
  try {
    // Test: empty ログインID + filled email
    console.log('=== Empty ログインID + filled email ===')
    await page.goto('/forgot-password')
    await page.waitForLoadState('networkidle')
    await page.getByPlaceholder('ログインID').fill('')
    await page.getByPlaceholder('メールアドレス').fill('user_a@example.com')
    await page.getByRole('button', { name: '認証コードを送信' }).click()
    await page.waitForTimeout(800)
    const urlTest1 = page.url()
    console.log('URL:', urlTest1)
    const stayedAtForgot = urlTest1.includes('forgot-password')
    console.log('Stayed at forgot-password?', stayedAtForgot)

    if (stayedAtForgot) {
      const loginIdError = await page.getByText('ログインIDは必須項目です。').count()
      const emailError = await page.getByText('メールアドレスは必須項目です。').count()
      console.log('ログインID error:', loginIdError > 0)
      console.log('メールアドレス error:', emailError > 0)

      // Check focus on ログインID
      const focusedEl = await page.evaluate(() => {
        const el = document.activeElement
        return { tagName: el.tagName, placeholder: el.placeholder, name: el.name }
      })
      console.log('Focused element:', JSON.stringify(focusedEl))
    }
    await page.screenshot({ path: path.resolve(__dirname, '../../../reports/e05/reset-pw/probe_empty_loginid_with_email.png'), fullPage: true })

    // Test: Look at step 2 (/verify) page structure
    console.log('\n=== Exploring /verify page structure ===')
    // First navigate to /verify by providing valid-looking data
    await page.goto('/forgot-password')
    await page.waitForLoadState('networkidle')
    await page.getByPlaceholder('ログインID').fill('OW999999')
    await page.getByPlaceholder('メールアドレス').fill('user_a@example.com')
    await page.getByRole('button', { name: '認証コードを送信' }).click()
    await page.waitForTimeout(2000)
    const verifyURL = page.url()
    console.log('Verify URL:', verifyURL)
    await page.screenshot({ path: path.resolve(__dirname, '../../../reports/e05/reset-pw/probe_verify_step2.png'), fullPage: true })

    const inputs2 = await page.locator('input').all()
    console.log('\n=== INPUTS on verify page ===')
    for (const inp of inputs2) {
      const type = await inp.getAttribute('type')
      const placeholder = await inp.getAttribute('placeholder')
      const name = await inp.getAttribute('name')
      console.log({ type, placeholder, name })
    }

    const buttons2 = await page.locator('button').all()
    console.log('\n=== BUTTONS on verify page ===')
    for (const btn of buttons2) {
      const text = (await btn.innerText()).trim()
      const disabled = await btn.isDisabled()
      console.log({ text, disabled })
    }

    const links2 = await page.locator('a').all()
    console.log('\n=== LINKS on verify page ===')
    for (const lnk of links2) {
      const text = (await lnk.innerText()).trim()
      const href = await lnk.getAttribute('href')
      console.log({ text, href })
    }

    const headings2 = await page.locator('h1,h2,h3,p').allTextContents()
    console.log('\n=== TEXT ELEMENTS on verify page ===', headings2.filter(t => t.trim()))

    // Test empty code submit on step 2
    console.log('\n=== Submit empty code on step 2 ===')
    const confirmBtn = page.getByRole('button', { name: '確認' })
    const confirmBtnCount = await confirmBtn.count()
    console.log('確認 button count:', confirmBtnCount)
    if (confirmBtnCount > 0) {
      await confirmBtn.click()
      await page.waitForTimeout(500)
      await page.screenshot({ path: path.resolve(__dirname, '../../../reports/e05/reset-pw/probe_step2_empty_code.png'), fullPage: true })
      const emptyCodeErrors = await page.evaluate(() => {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
        const texts = []
        let node
        while ((node = walker.nextNode())) {
          const text = node.textContent.trim()
          if (text && node.parentElement && window.getComputedStyle(node.parentElement).display !== 'none') {
            texts.push(text)
          }
        }
        return texts.filter(t => t.length > 3 && (t.includes('。') || t.includes('必須') || t.includes('コード')))
      })
      console.log('Empty code errors:', emptyCodeErrors)
    }

    // Check if timer/countdown is visible
    const timerText = await page.evaluate(() => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
      const texts = []
      let node
      while ((node = walker.nextNode())) {
        const text = node.textContent.trim()
        if (text && text.match(/\d{2}:\d{2}/)) {
          texts.push(text)
        }
      }
      return texts
    })
    console.log('Timer text (mm:ss format):', timerText)

    // Check for 再送信 link
    const resendLink = page.getByText('再送信')
    const resendCount = await resendLink.count()
    console.log('再送信 link count:', resendCount)
    if (resendCount > 0) {
      const resendDisabled = await page.evaluate(() => {
        const els = [...document.querySelectorAll('*')].filter(el => el.textContent.trim() === '再送信')
        if (els.length === 0) return 'not found'
        const el = els[0]
        return {
          tagName: el.tagName,
          class: el.className,
          disabled: el.disabled,
          style: window.getComputedStyle(el).opacity,
          color: window.getComputedStyle(el).color
        }
      })
      console.log('再送信 element state:', JSON.stringify(resendDisabled))
    }

  } catch (e) {
    console.error('PROBE4 ERROR:', e.message)
    console.error(e.stack)
  } finally {
    await browser.close()
  }
})()
