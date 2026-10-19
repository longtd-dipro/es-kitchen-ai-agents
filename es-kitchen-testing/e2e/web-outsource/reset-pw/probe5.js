// Probe5 — Step 2: 4-digit inputs, 再送信, submit wrong code, empty validation
const { open } = require('../_helpers/session.js')
const path = require('path')

;(async () => {
  const { browser, page } = await open({ anonymous: true })
  try {
    // Navigate to step 2 with non-existent account
    await page.goto('/forgot-password')
    await page.waitForLoadState('networkidle')
    await page.getByPlaceholder('ログインID').fill('ZZ999999')
    await page.getByPlaceholder('メールアドレス').fill('zztest_noreply@example.com')
    await page.getByRole('button', { name: '認証コードを送信' }).click()
    await page.waitForTimeout(2000)
    const verifyURL = page.url()
    console.log('Verify URL:', verifyURL)

    // Full page DOM exploration
    const allElements = await page.evaluate(() => {
      const result = {
        inputs: [],
        buttons: [],
        allText: [],
        links: [],
        spans: [],
      }
      document.querySelectorAll('input').forEach(el => {
        result.inputs.push({
          type: el.type, placeholder: el.placeholder, name: el.name,
          disabled: el.disabled, maxLength: el.maxLength, value: el.value
        })
      })
      document.querySelectorAll('button').forEach(el => {
        result.buttons.push({ text: el.innerText.trim(), disabled: el.disabled, type: el.type })
      })
      document.querySelectorAll('a').forEach(el => {
        result.links.push({ text: el.innerText.trim(), href: el.href, class: el.className })
      })
      // Get all text nodes
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
      let node
      while ((node = walker.nextNode())) {
        const text = node.textContent.trim()
        if (text) result.allText.push(text)
      }
      return result
    })
    console.log('\n=== Inputs ===', JSON.stringify(allElements.inputs, null, 2))
    console.log('\n=== Buttons ===', JSON.stringify(allElements.buttons, null, 2))
    console.log('\n=== Links ===', JSON.stringify(allElements.links, null, 2))
    console.log('\n=== All text (filtered) ===', allElements.allText.filter(t => t.length > 1))

    // Try to find 再送信 anywhere
    const resendText = await page.evaluate(() => {
      const all = document.querySelectorAll('*')
      for (const el of all) {
        if (el.childNodes.length === 1 && el.firstChild.nodeType === 3) {
          if (el.textContent.includes('再送信')) {
            return {
              tag: el.tagName,
              class: el.className,
              text: el.textContent.trim(),
              disabled: el.disabled,
              style: window.getComputedStyle(el).pointerEvents
            }
          }
        }
      }
      return null
    })
    console.log('\n=== 再送信 element ===', JSON.stringify(resendText))

    // Check for countdown timer
    const timerEl = await page.evaluate(() => {
      const all = document.querySelectorAll('*')
      for (const el of all) {
        if (el.textContent.match(/^\d{2}:\d{2}$/)) {
          return {
            tag: el.tagName,
            class: el.className,
            text: el.textContent,
          }
        }
      }
      return null
    })
    console.log('\n=== Timer element ===', JSON.stringify(timerEl))

    // Try entering digits into the 4 input fields
    console.log('\n=== TEST: Fill 4-digit code ===')
    const codeInputs = await page.locator('input').all()
    console.log('Number of inputs:', codeInputs.length)

    // Try typing into OTP-style inputs
    // Method 1: try each input separately
    if (codeInputs.length >= 4) {
      try {
        await codeInputs[0].fill('0')
        await page.waitForTimeout(100)
        await codeInputs[1].fill('0')
        await page.waitForTimeout(100)
        await codeInputs[2].fill('0')
        await page.waitForTimeout(100)
        await codeInputs[3].fill('0')
        await page.waitForTimeout(200)
        const btnDisabled = await page.locator('button[type="submit"]').isDisabled()
        console.log('Submit button disabled after filling 4 digits:', btnDisabled)
        await page.screenshot({ path: path.resolve(__dirname, '../../../reports/e05/reset-pw/probe_step2_filled_0000.png'), fullPage: true })
      } catch (e) {
        console.log('Fill 4 inputs error:', e.message)
      }
    }

    // Try submitting with 0000
    console.log('\n=== TEST: Submit code 0000 ===')
    const submitBtn = page.locator('button[type="submit"]')
    const isDisabledBefore = await submitBtn.isDisabled()
    console.log('Button disabled before submit:', isDisabledBefore)

    if (!isDisabledBefore) {
      await submitBtn.click({ force: false })
      await page.waitForTimeout(1500)
      const urlAfterSubmit = page.url()
      console.log('URL after submit 0000:', urlAfterSubmit)
      await page.screenshot({ path: path.resolve(__dirname, '../../../reports/e05/reset-pw/probe_step2_submit_0000.png'), fullPage: true })
      const textsAfterSubmit = await page.evaluate(() => {
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
      console.log('Texts after submit 0000:', textsAfterSubmit.filter(t => t.includes('。') || t.includes('コード') || t.includes('期限')))
    }

    // Check: can we click disabled button?
    if (isDisabledBefore) {
      // Try force click
      try {
        await submitBtn.click({ force: true })
        await page.waitForTimeout(500)
        console.log('Force clicked disabled submit - URL now:', page.url())
        const textsForceClick = await page.evaluate(() => {
          return [...document.querySelectorAll('p')].map(p => p.textContent.trim()).filter(t => t)
        })
        console.log('Paragraphs after force click:', textsForceClick)
      } catch (e) {
        console.log('Force click error:', e.message)
      }
    }

  } catch (e) {
    console.error('PROBE5 ERROR:', e.message)
    console.error(e.stack)
  } finally {
    await browser.close()
  }
})()
