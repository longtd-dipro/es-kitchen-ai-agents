// Probe3 — kiểm tra: unreg email, XSS, SQLi, focus
const { open } = require('../_helpers/session.js')
const path = require('path')

async function waitAndGetTexts(page, timeout = 1500) {
  await page.waitForTimeout(timeout)
  return page.evaluate(() => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    const texts = []
    let node
    while ((node = walker.nextNode())) {
      const text = node.textContent.trim()
      if (text && node.parentElement && window.getComputedStyle(node.parentElement).display !== 'none') {
        texts.push(text)
      }
    }
    return texts.filter(t => t.length > 2)
  })
}

;(async () => {
  const { browser, page } = await open({ anonymous: true })
  try {
    // TEST A: OW000123 + unknown email
    console.log('=== TEST A: OW000123 + unknown email ===')
    await page.goto('/forgot-password')
    await page.waitForLoadState('networkidle')
    await page.getByPlaceholder('ログインID').fill('OW000123')
    await page.getByPlaceholder('メールアドレス').fill('unknown_z@example.com')
    await page.getByRole('button', { name: '認証コードを送信' }).click()
    await page.waitForTimeout(2000)
    const urlA = page.url()
    console.log('URL after test A:', urlA)
    await page.screenshot({ path: path.resolve(__dirname, '../../../reports/e05/reset-pw/probe_unreg_email.png'), fullPage: true })
    const textsA = await waitAndGetTexts(page, 100)
    const errUnregEmail = textsA.find(t => t.includes('登録されていません'))
    const errWrongCombination = textsA.find(t => t.includes('正しくありません'))
    const sentMsg = textsA.find(t => t.includes('送信しました'))
    console.log('unreg email error:', errUnregEmail)
    console.log('wrong combination error:', errWrongCombination)
    console.log('sent msg:', sentMsg)
    console.log('Is on forgot-password?', urlA.includes('forgot-password'))
    console.log('Is on verify?', urlA.includes('verify'))

    // TEST B: XSS
    console.log('\n=== TEST B: XSS ===')
    await page.goto('/forgot-password')
    await page.waitForLoadState('networkidle')
    const xssDialogTriggered = { value: false }
    const dialogHandler = async dialog => {
      xssDialogTriggered.value = true
      console.log('DIALOG:', dialog.message())
      await dialog.dismiss()
    }
    page.on('dialog', dialogHandler)
    await page.getByPlaceholder('ログインID').fill('<script>alert(1)</script>')
    await page.getByPlaceholder('メールアドレス').fill('user_a@example.com')
    await page.getByRole('button', { name: '認証コードを送信' }).click()
    await page.waitForTimeout(2000)
    page.off('dialog', dialogHandler)
    const urlB = page.url()
    console.log('URL after XSS:', urlB)
    console.log('XSS dialog triggered:', xssDialogTriggered.value)
    await page.screenshot({ path: path.resolve(__dirname, '../../../reports/e05/reset-pw/probe_xss.png'), fullPage: true })
    const textsB = await waitAndGetTexts(page, 100)
    const errXSS = textsB.find(t => t.includes('正しくありません'))
    const sentXSS = textsB.find(t => t.includes('送信しました'))
    console.log('Wrong ID/email error after XSS:', errXSS)
    console.log('Sent msg after XSS:', sentXSS)

    // TEST C: SQLi
    console.log('\n=== TEST C: SQLi ===')
    await page.goto('/forgot-password')
    await page.waitForLoadState('networkidle')
    await page.getByPlaceholder('ログインID').fill("' OR 1=1--")
    await page.getByPlaceholder('メールアドレス').fill('user_a@example.com')
    await page.getByRole('button', { name: '認証コードを送信' }).click()
    await page.waitForTimeout(2000)
    const urlC = page.url()
    console.log('URL after SQLi:', urlC)
    await page.screenshot({ path: path.resolve(__dirname, '../../../reports/e05/reset-pw/probe_sqli.png'), fullPage: true })
    const textsC = await waitAndGetTexts(page, 100)
    const errSQLi = textsC.find(t => t.includes('正しくありません'))
    const sentSQLi = textsC.find(t => t.includes('送信しました'))
    console.log('Wrong ID/email error after SQLi:', errSQLi)
    console.log('Sent msg after SQLi:', sentSQLi)

    // TEST D: Focus ring on input
    console.log('\n=== TEST D: Focus state ===')
    await page.goto('/forgot-password')
    await page.waitForLoadState('networkidle')

    // Normal state
    const normalBorder = await page.evaluate(() => {
      const el = document.querySelector('input[placeholder="ログインID"]')
      if (!el) return 'not found'
      return window.getComputedStyle(el).outline
    })
    console.log('Normal state outline:', normalBorder)

    // After click (focus)
    await page.getByPlaceholder('ログインID').click()
    await page.waitForTimeout(200)
    const focusBorder = await page.evaluate(() => {
      const el = document.querySelector('input[placeholder="ログインID"]')
      if (!el) return 'not found'
      const style = window.getComputedStyle(el)
      return {
        outline: style.outline,
        outlineColor: style.outlineColor,
        borderColor: style.borderColor,
        boxShadow: style.boxShadow,
      }
    })
    console.log('Focus state computed styles:', JSON.stringify(focusBorder))

    // After focus out (blur)
    await page.getByPlaceholder('メールアドレス').click()
    await page.waitForTimeout(200)
    const blurBorder = await page.evaluate(() => {
      const el = document.querySelector('input[placeholder="ログインID"]')
      if (!el) return 'not found'
      return window.getComputedStyle(el).borderColor
    })
    console.log('After blur border color:', blurBorder)

    // TEST E: Error state input styling
    console.log('\n=== TEST E: Error state input styling ===')
    await page.goto('/forgot-password')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: '認証コードを送信' }).click()
    await page.waitForTimeout(500)
    const errorBorderStyle = await page.evaluate(() => {
      const el = document.querySelector('input[placeholder="ログインID"]')
      if (!el) return 'not found'
      const style = window.getComputedStyle(el)
      return {
        borderColor: style.borderColor,
        className: el.className,
        outline: style.outline,
      }
    })
    console.log('Error state input styles:', JSON.stringify(errorBorderStyle))

    // Check if error state has specific CSS class indicator
    const errorInputClass = await page.getByPlaceholder('ログインID').getAttribute('class')
    console.log('Error input class:', errorInputClass)

    // Check error text element
    const errEls = await page.locator('[class*="error"], [class*="Error"]').all()
    console.log('Error elements count:', errEls.length)
    for (const el of errEls) {
      const text = await el.innerText().catch(() => '')
      const cls = await el.getAttribute('class').catch(() => '')
      if (text.trim()) console.log({ text: text.trim(), cls })
    }

    // Look at the DOM structure near the input
    const formStructure = await page.evaluate(() => {
      const form = document.querySelector('form')
      if (!form) return 'no form'
      return form.outerHTML.substring(0, 2000)
    })
    console.log('\n=== Form structure (first 2000 chars) ===')
    console.log(formStructure)

  } catch (e) {
    console.error('PROBE3 ERROR:', e.message)
    console.error(e.stack)
  } finally {
    await browser.close()
  }
})()
