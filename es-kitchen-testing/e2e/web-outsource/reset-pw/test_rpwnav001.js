// Fix RPWNAV-001 test (timing fix: wait for URL + inputs before checking)
'use strict'
const { open } = require('../_helpers/session.js')
const path = require('path')
const fs = require('fs')

const SCREENSHOT_DIR = path.resolve(__dirname, '../../../reports/e05/reset-pw')
const RESULTS_PATH = '/private/tmp/claude-501/-Users-longtd-Desktop-WORK-Project-Eskitchen-AI-AGENTS-ES-KITCHEN/b11cf3b6-254f-4448-b8fe-9753db23119a/scratchpad/auto/res_3_resetpw.json'

;(async () => {
  const { browser, page } = await open({ anonymous: true })
  try {
    console.log('[RPWNAV-001] Re-test: Navigation from login to reset PW page')
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    const forgotLink = page.getByText('パスワードを忘れた方はこちら')
    const forgotLinkCount = await forgotLink.count()
    if (forgotLinkCount === 0) {
      console.log('FAIL: Link not found')
    } else {
      await forgotLink.click()
      // Wait for URL change explicitly
      await page.waitForURL('**/forgot-password', { timeout: 10000 })
      // Wait for both inputs
      await page.waitForSelector('input[placeholder="ログインID"]', { timeout: 10000 })
      await page.waitForSelector('input[placeholder="メールアドレス"]', { timeout: 10000 })
      const urlAfter = page.url()
      const isForgotPage = urlAfter.includes('forgot-password')
      const loginIdInput = await page.getByPlaceholder('ログインID').count()
      const emailInput = await page.getByPlaceholder('メールアドレス').count()
      const loginIdVal = await page.getByPlaceholder('ログインID').inputValue()
      const emailVal = await page.getByPlaceholder('メールアドレス').inputValue()
      const noErrors = await page.getByText('ログインIDは必須項目です。').count() === 0
      console.log(`url_ok=${isForgotPage} loginId=${loginIdInput} email=${emailInput} empty=${loginIdVal===''&&emailVal===''} noErrors=${noErrors}`)

      const passed = isForgotPage && loginIdInput > 0 && emailInput > 0 && loginIdVal === '' && emailVal === '' && noErrors
      console.log('RPWNAV-001 result:', passed ? 'OK' : 'NG')

      // Update results JSON
      const results = JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf-8'))
      if (passed) {
        results['RPWNAV-001'] = { result: 'OK', note: '' }
      } else {
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'RPWNAV-001.png'), fullPage: true })
        results['RPWNAV-001'] = { result: 'NG', note: `Expected forgot-password page with empty inputs. url_ok=${isForgotPage} loginId=${loginIdInput} email=${emailInput}` }
      }
      fs.writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2), 'utf-8')
      console.log('Results updated.')
    }
  } catch (e) {
    console.error('ERROR:', e.message)
  } finally {
    await browser.close()
  }
})()
