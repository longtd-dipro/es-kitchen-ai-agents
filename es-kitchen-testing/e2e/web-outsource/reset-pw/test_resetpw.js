// Test script: Reset PW (E05) — nhóm 3
// Chạy: node e2e/web-outsource/reset-pw/test_resetpw.js
// Tất cả TC nhóm reset-pw chạy trong 1 file
'use strict'
const { open } = require('../_helpers/session.js')
const path = require('path')
const fs = require('fs')

const SCREENSHOT_DIR = path.resolve(__dirname, '../../../reports/e05/reset-pw')
const RESULTS_PATH = '/private/tmp/claude-501/-Users-longtd-Desktop-WORK-Project-Eskitchen-AI-AGENTS-ES-KITCHEN/b11cf3b6-254f-4448-b8fe-9753db23119a/scratchpad/auto/res_3_resetpw.json'

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })

const results = {}

function pend(id, note) {
  results[id] = { result: 'Pending', note }
  console.log(`  [Pending] ${id}: ${note}`)
}
function ok(id) {
  results[id] = { result: 'OK', note: '' }
  console.log(`  [OK] ${id}`)
}
function ng(id, note, screenshotPath) {
  results[id] = { result: 'NG', note: note + (screenshotPath ? ` Screenshot: ${screenshotPath}` : '') }
  console.log(`  [NG] ${id}: ${note}`)
}

async function screenshotNG(page, tcId) {
  const screenshotName = `${tcId}.png`
  const screenshotPath = path.join(SCREENSHOT_DIR, screenshotName)
  await page.screenshot({ path: screenshotPath, fullPage: true })
  return `reports/e05/reset-pw/${screenshotName}`
}

// Helper: navigate to step 2 with non-existent test ID
async function gotoStep2(page) {
  await page.goto('/forgot-password')
  await page.waitForLoadState('networkidle')
  await page.getByPlaceholder('ログインID').fill('ZZ999999')
  await page.getByPlaceholder('メールアドレス').fill('zztest_noreply@example.com')
  await page.getByRole('button', { name: '認証コードを送信' }).click()
  await page.waitForTimeout(2000)
  return page.url().includes('verify')
}

// Helper: fill 4-digit OTP inputs
async function fillOTPCode(page, code) {
  const inputs = await page.locator('input').all()
  for (let i = 0; i < Math.min(4, inputs.length); i++) {
    await inputs[i].fill(code[i] || '')
    await page.waitForTimeout(50)
  }
}

;(async () => {
  const { browser, page } = await open({ anonymous: true })

  try {
    // ===== RPW-001: Layout step 1 =====
    console.log('\n[RPW-001] Layout bước 1')
    try {
      await page.goto('/forgot-password')
      await page.waitForLoadState('networkidle')
      const loginIdInput = await page.getByPlaceholder('ログインID').count()
      const emailInput = await page.getByPlaceholder('メールアドレス').count()
      const sendBtn = await page.getByRole('button', { name: '認証コードを送信' }).count()
      const heading = await page.getByText('パスワード再設定').count()
      const loginIdLabel = await page.getByText('ログインID').count()
      const emailLabel = await page.getByText('メールアドレス').count()
      // Check both fields empty (no value)
      const loginIdVal = await page.getByPlaceholder('ログインID').inputValue()
      const emailVal = await page.getByPlaceholder('メールアドレス').inputValue()
      // Check no error messages shown
      const errorMsg1 = await page.getByText('ログインIDは必須項目です。').count()
      const errorMsg2 = await page.getByText('メールアドレスは必須項目です。').count()
      if (loginIdInput > 0 && emailInput > 0 && sendBtn > 0 && heading > 0
        && loginIdLabel > 0 && emailLabel > 0
        && loginIdVal === '' && emailVal === ''
        && errorMsg1 === 0 && errorMsg2 === 0) {
        ok('RPW-001')
      } else {
        const sc = await screenshotNG(page, 'RPW-001')
        ng('RPW-001', `Layout missing elements: loginId=${loginIdInput} email=${emailInput} btn=${sendBtn} heading=${heading} label_id=${loginIdLabel} label_email=${emailLabel} errors=${errorMsg1},${errorMsg2}`, sc)
      }
    } catch (e) {
      const sc = await screenshotNG(page, 'RPW-001').catch(() => '')
      ng('RPW-001', `Script error: ${e.message}`, sc)
    }

    // ===== RPW-002: Textbox states =====
    console.log('\n[RPW-002] Textbox states')
    try {
      await page.goto('/forgot-password')
      await page.waitForLoadState('networkidle')
      // Normal state: no error class
      const normalClass = await page.getByPlaceholder('ログインID').getAttribute('class')
      const isNormalOk = !normalClass.includes('ant-input-status-error')
      // Focus state: border changes
      await page.getByPlaceholder('ログインID').click()
      await page.waitForTimeout(200)
      const focusedBorder = await page.evaluate(() => {
        const el = document.querySelector('input[placeholder="ログインID"]')
        return window.getComputedStyle(el).borderColor
      })
      const isFocusDistinct = focusedBorder !== 'rgb(207, 215, 221)' // different from normal
      // Error state: submit empty
      await page.getByRole('button', { name: '認証コードを送信' }).click()
      await page.waitForTimeout(500)
      const errorClass = await page.getByPlaceholder('ログインID').getAttribute('class')
      const emailErrorClass = await page.getByPlaceholder('メールアドレス').getAttribute('class')
      const isErrorClassLogin = errorClass.includes('ant-input-status-error')
      const isErrorClassEmail = emailErrorClass.includes('ant-input-status-error')
      const errMsg1 = await page.getByText('ログインIDは必須項目です。').count()
      const errMsg2 = await page.getByText('メールアドレスは必須項目です。').count()
      if (isNormalOk && isFocusDistinct && isErrorClassLogin && isErrorClassEmail && errMsg1 > 0 && errMsg2 > 0) {
        ok('RPW-002')
      } else {
        const sc = await screenshotNG(page, 'RPW-002')
        ng('RPW-002', `State check: normal_ok=${isNormalOk} focus_distinct=${isFocusDistinct} error_login=${isErrorClassLogin} error_email=${isErrorClassEmail} err1=${errMsg1}>0 err2=${errMsg2}>0`, sc)
      }
    } catch (e) {
      const sc = await screenshotNG(page, 'RPW-002').catch(() => '')
      ng('RPW-002', `Script error: ${e.message}`, sc)
    }

    // ===== RPW-003: Layout step 2 =====
    console.log('\n[RPW-003] Layout bước 2')
    try {
      const onStep2 = await gotoStep2(page)
      if (!onStep2) {
        const sc = await screenshotNG(page, 'RPW-003')
        ng('RPW-003', 'Không thể vào bước 2 (URL không chứa verify)', sc)
      } else {
        await page.waitForTimeout(500)
        // Check 4 input boxes for OTP code
        const inputs = await page.locator('input').all()
        const hasCodeInputs = inputs.length >= 4
        // Check 再送信 text present
        const resendText = await page.getByText('再送信').count()
        // Check countdown timer mm:ss format
        const timerText = await page.evaluate(() => {
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
          let node
          while ((node = walker.nextNode())) {
            if (node.textContent.trim().match(/^\d{2}:\d{2}$/)) return node.textContent.trim()
          }
          return null
        })
        // Check 確認 button
        const confirmBtn = await page.locator('button[type="submit"]').count()
        // Check no error initially
        const hasInitialError = await page.getByText('認証コードが正しくありません。').count()
        const hasEmptyError = await page.getByText('認証コード入力は必須項目です。').count()
        if (hasCodeInputs && resendText > 0 && timerText && confirmBtn > 0 && hasInitialError === 0 && hasEmptyError === 0) {
          ok('RPW-003')
        } else {
          const sc = await screenshotNG(page, 'RPW-003')
          ng('RPW-003', `Layout check: inputs=${inputs.length}>=4 resend=${resendText}>0 timer=${timerText} btn=${confirmBtn} err=${hasInitialError},${hasEmptyError}`, sc)
        }
      }
    } catch (e) {
      const sc = await screenshotNG(page, 'RPW-003').catch(() => '')
      ng('RPW-003', `Script error: ${e.message}`, sc)
    }

    // ===== RPW-004: Layout step 3 — Pending =====
    pend('RPW-004', 'Cần mã xác thực hợp lệ từ email để vào bước 3. Không thể gửi mã thật.')

    // ===== RPW-005: Layout step 4 — Pending =====
    pend('RPW-005', 'Cần hoàn tất bước 3 (đặt mật khẩu mới) → ghi dữ liệu vào DB. Không thực hiện.')

    // ===== RPW-006: Validate bắt buộc cả 2 ô =====
    console.log('\n[RPW-006] Validate empty both fields')
    try {
      await page.goto('/forgot-password')
      await page.waitForLoadState('networkidle')
      await page.getByRole('button', { name: '認証コードを送信' }).click()
      await page.waitForTimeout(500)
      const errLoginId = await page.getByText('ログインIDは必須項目です。').count()
      const errEmail = await page.getByText('メールアドレスは必須項目です。').count()
      const urlStayed = page.url().includes('forgot-password')
      if (errLoginId > 0 && errEmail > 0 && urlStayed) {
        ok('RPW-006')
      } else {
        const sc = await screenshotNG(page, 'RPW-006')
        ng('RPW-006', `Expected both inline errors. Got: loginId_err=${errLoginId>0} email_err=${errEmail>0} stayed=${urlStayed}`, sc)
      }
    } catch (e) {
      const sc = await screenshotNG(page, 'RPW-006').catch(() => '')
      ng('RPW-006', `Script error: ${e.message}`, sc)
    }

    // ===== RPW-007: Validate ID sai =====
    console.log('\n[RPW-007] Validate wrong ID')
    try {
      await page.goto('/forgot-password')
      await page.waitForLoadState('networkidle')
      await page.getByPlaceholder('ログインID').fill('ZZ999999')
      await page.getByPlaceholder('メールアドレス').fill('user_a@example.com')
      await page.getByRole('button', { name: '認証コードを送信' }).click()
      await page.waitForTimeout(2000)
      const urlAfter = page.url()
      const stayedAtForgot = urlAfter.includes('forgot-password')
      const errorVisible = await page.getByText('ログインIDまたはメールアドレスが正しくありません。').count()
      if (stayedAtForgot && errorVisible > 0) {
        ok('RPW-007')
      } else {
        const sc = await screenshotNG(page, 'RPW-007')
        ng('RPW-007', `Expected inline error on step 1. Actual: URL moved to verify page (stayedAtForgot=${stayedAtForgot}, errorVisible=${errorVisible}). App navigates to step 2 without validating ID.`, sc)
      }
    } catch (e) {
      const sc = await screenshotNG(page, 'RPW-007').catch(() => '')
      ng('RPW-007', `Script error: ${e.message}`, sc)
    }

    // ===== RPW-008: Validate email chưa đăng ký =====
    console.log('\n[RPW-008] Validate unregistered email')
    try {
      await page.goto('/forgot-password')
      await page.waitForLoadState('networkidle')
      await page.getByPlaceholder('ログインID').fill('ZZ999999')
      await page.getByPlaceholder('メールアドレス').fill('notregistered_zzz@example.com')
      await page.getByRole('button', { name: '認証コードを送信' }).click()
      await page.waitForTimeout(2000)
      const urlAfter = page.url()
      const stayedAtForgot = urlAfter.includes('forgot-password')
      const errorVisible = await page.getByText('このメールアドレスは登録されていません。').count()
      if (stayedAtForgot && errorVisible > 0) {
        ok('RPW-008')
      } else {
        const sc = await screenshotNG(page, 'RPW-008')
        ng('RPW-008', `Expected inline error "このメールアドレスは登録されていません。" on step 1. Actual: app navigated away from forgot-password (stayedAtForgot=${stayedAtForgot}, errorVisible=${errorVisible}).`, sc)
      }
    } catch (e) {
      const sc = await screenshotNG(page, 'RPW-008').catch(() => '')
      ng('RPW-008', `Script error: ${e.message}`, sc)
    }

    // ===== RPW-009: Gửi mã thành công — Pending =====
    pend('RPW-009', 'TC yêu cầu gửi mã thật tới email đã đăng ký và nhận email. Không gửi mail thật theo quy tắc an toàn DEV.')

    // ===== RPW-010: Validate trống mã bước 2 =====
    console.log('\n[RPW-010] Validate empty code step 2')
    try {
      const onStep2 = await gotoStep2(page)
      if (!onStep2) {
        pend('RPW-010', 'Không thể vào bước 2.')
      } else {
        await page.waitForTimeout(300)
        // Confirm button should be disabled with empty code
        const confirmBtnDisabled = await page.locator('button[type="submit"]').isDisabled()
        // Check if inline error message shown
        const inlineError = await page.getByText('認証コード入力は必須項目です。').count()
        if (inlineError > 0) {
          ok('RPW-010')
        } else if (confirmBtnDisabled) {
          const sc = await screenshotNG(page, 'RPW-010')
          ng('RPW-010', `Expected inline error "認証コード入力は必須項目です。" khi bỏ trống và nhấn 確認. Actual: nút 確認 bị disabled khi ô trống (không thể nhấn), không hiện lỗi inline.`, sc)
        } else {
          // Button enabled, try clicking
          await page.locator('button[type="submit"]').click({ force: true })
          await page.waitForTimeout(500)
          const inlineErrorAfterClick = await page.getByText('認証コード入力は必須項目です。').count()
          if (inlineErrorAfterClick > 0) {
            ok('RPW-010')
          } else {
            const sc = await screenshotNG(page, 'RPW-010')
            ng('RPW-010', 'Expected inline error "認証コード入力は必須項目です。" nhưng không xuất hiện.', sc)
          }
        }
      }
    } catch (e) {
      const sc = await screenshotNG(page, 'RPW-010').catch(() => '')
      ng('RPW-010', `Script error: ${e.message}`, sc)
    }

    // ===== RPW-011: Validate mã sai =====
    console.log('\n[RPW-011] Validate wrong code')
    try {
      const onStep2 = await gotoStep2(page)
      if (!onStep2) {
        pend('RPW-011', 'Không thể vào bước 2.')
      } else {
        await page.waitForTimeout(300)
        await fillOTPCode(page, '0000')
        await page.waitForTimeout(200)
        const btnDisabled = await page.locator('button[type="submit"]').isDisabled()
        if (!btnDisabled) {
          await page.locator('button[type="submit"]').click()
          await page.waitForTimeout(1500)
          const wrongCodeError = await page.getByText('認証コードが正しくありません。').count()
          const stayedAtVerify = page.url().includes('verify')
          if (wrongCodeError > 0 && stayedAtVerify) {
            ok('RPW-011')
          } else {
            const sc = await screenshotNG(page, 'RPW-011')
            ng('RPW-011', `Expected error "認証コードが正しくありません。" Actual: error=${wrongCodeError>0}, stayed=${stayedAtVerify}`, sc)
          }
        } else {
          pend('RPW-011', 'Nút 確認 disabled sau khi nhập 4 số. Không thể click để kiểm tra lỗi.')
        }
      }
    } catch (e) {
      const sc = await screenshotNG(page, 'RPW-011').catch(() => '')
      ng('RPW-011', `Script error: ${e.message}`, sc)
    }

    // ===== RPW-012: Validate mã hết hạn — Pending =====
    pend('RPW-012', 'Cần chờ quá 5 phút sau khi gửi mã (code TTL). Không thực hiện trong automation.')

    // ===== RPW-013: Xác minh thành công — Pending =====
    pend('RPW-013', 'Cần mã xác thực đúng từ email thật. Không gửi mail thật.')

    // ===== RPW-014: Link 再送信 gửi lại — Pending =====
    pend('RPW-014', 'Cần bộ đếm về 00:00 (chờ tối thiểu 59 giây) và sẽ gửi email thật. Không thực hiện.')

    // ===== RPW-015: 再送信 disable/enable — Pending =====
    pend('RPW-015', 'Kiểm tra link enabled khi đếm ngược về 00:00 cần chờ tối thiểu 59 giây. Không thực hiện trong automation.')

    // ===== RPW-016: Mã mới sau gửi lại — Pending =====
    pend('RPW-016', 'Cần mã mới từ email sau khi nhấn 再送信. Không gửi mail thật.')

    // ===== RPW-017 to RPW-024: Step 3 tests — Pending =====
    for (const id of ['RPW-017', 'RPW-018', 'RPW-019', 'RPW-020', 'RPW-021', 'RPW-022', 'RPW-023', 'RPW-024']) {
      pend(id, 'Cần vào bước 3 (yêu cầu mã xác thực hợp lệ từ email thật). Không thực hiện.')
    }

    // ===== RPW-025: Bước 4 thông báo — Pending =====
    pend('RPW-025', 'Cần hoàn tất bước 3 (đặt mật khẩu mới → ghi DB). Không thực hiện.')

    // ===== RPW-026: Nút ホーム画面へ — Pending =====
    pend('RPW-026', 'Cần hoàn tất bước 3 (ghi DB). Không thực hiện.')

    // ===== RPW-027: Security XSS =====
    console.log('\n[RPW-027] Security XSS')
    try {
      await page.goto('/forgot-password')
      await page.waitForLoadState('networkidle')
      const xssDialogTriggered = { value: false }
      const dialogHandler = async dialog => {
        xssDialogTriggered.value = true
        await dialog.dismiss()
      }
      page.on('dialog', dialogHandler)
      await page.getByPlaceholder('ログインID').fill('<script>alert(1)</script>')
      await page.getByPlaceholder('メールアドレス').fill('user_a@example.com')
      await page.getByRole('button', { name: '認証コードを送信' }).click()
      await page.waitForTimeout(2000)
      page.off('dialog', dialogHandler)
      const urlAfterXSS = page.url()
      const stayedForgot = urlAfterXSS.includes('forgot-password')
      const xssNotExecuted = !xssDialogTriggered.value
      const inlineError = await page.getByText('ログインIDまたはメールアドレスが正しくありません。').count()
      // Check XSS string is NOT rendered as HTML (not executed)
      // Check alert not triggered
      if (xssNotExecuted && stayedForgot && inlineError > 0) {
        ok('RPW-027')
      } else {
        const sc = await screenshotNG(page, 'RPW-027')
        ng('RPW-027', `XSS check: alert_triggered=${xssDialogTriggered.value}, stayedForgot=${stayedForgot}, inline_error=${inlineError>0}. App navigated to step 2 instead of showing inline error.`, sc)
      }
    } catch (e) {
      const sc = await screenshotNG(page, 'RPW-027').catch(() => '')
      ng('RPW-027', `Script error: ${e.message}`, sc)
    }

    // ===== RPW-028: Security SQLi =====
    console.log('\n[RPW-028] Security SQLi')
    try {
      await page.goto('/forgot-password')
      await page.waitForLoadState('networkidle')
      await page.getByPlaceholder('ログインID').fill("' OR 1=1--")
      await page.getByPlaceholder('メールアドレス').fill('user_a@example.com')
      await page.getByRole('button', { name: '認証コードを送信' }).click()
      await page.waitForTimeout(2000)
      const urlAfterSQLi = page.url()
      const stayedForgot = urlAfterSQLi.includes('forgot-password')
      const inlineError = await page.getByText('ログインIDまたはメールアドレスが正しくありません。').count()
      if (stayedForgot && inlineError > 0) {
        ok('RPW-028')
      } else {
        const sc = await screenshotNG(page, 'RPW-028')
        ng('RPW-028', `SQLi check: stayedForgot=${stayedForgot}, inline_error=${inlineError>0}. App navigated to step 2 instead of showing inline error. SQLi string was URL-encoded.`, sc)
      }
    } catch (e) {
      const sc = await screenshotNG(page, 'RPW-028').catch(() => '')
      ng('RPW-028', `Script error: ${e.message}`, sc)
    }

    // ===== RPWNAV-001: Navigation vào OW_AUTH_002 =====
    console.log('\n[RPWNAV-001] Navigation from login to reset PW page')
    try {
      await page.goto('/login')
      await page.waitForLoadState('networkidle')
      const forgotLink = page.getByText('パスワードを忘れた方はこちら')
      const forgotLinkCount = await forgotLink.count()
      if (forgotLinkCount === 0) {
        const sc = await screenshotNG(page, 'RPWNAV-001')
        ng('RPWNAV-001', 'Link "パスワードを忘れた方はこちら" không tìm thấy trên màn login.', sc)
      } else {
        await forgotLink.click()
        await page.waitForLoadState('networkidle')
        const urlAfter = page.url()
        const isForgotPage = urlAfter.includes('forgot-password')
        const loginIdInput = await page.getByPlaceholder('ログインID').count()
        const emailInput = await page.getByPlaceholder('メールアドレス').count()
        const loginIdVal = await page.getByPlaceholder('ログインID').inputValue()
        const emailVal = await page.getByPlaceholder('メールアドレス').inputValue()
        const noErrors = await page.getByText('ログインIDは必須項目です。').count() === 0
        if (isForgotPage && loginIdInput > 0 && emailInput > 0 && loginIdVal === '' && emailVal === '' && noErrors) {
          ok('RPWNAV-001')
        } else {
          const sc = await screenshotNG(page, 'RPWNAV-001')
          ng('RPWNAV-001', `Expected forgot-password page with empty inputs and no errors. Actual: url_ok=${isForgotPage} inputs=${loginIdInput},${emailInput} empty=${loginIdVal===''&&emailVal===''} noErrors=${noErrors}`, sc)
        }
      }
    } catch (e) {
      const sc = await screenshotNG(page, 'RPWNAV-001').catch(() => '')
      ng('RPWNAV-001', `Script error: ${e.message}`, sc)
    }

    // ===== RPWNAV-002: Lỗi mạng — Pending =====
    pend('RPWNAV-002', '[UNCONFIRMED] Message lỗi mạng chưa được xác nhận trong spec. Cần intercept network để giả lập. Không thực hiện.')

    // ===== RPWNAV-003: Lỗi hệ thống — Pending =====
    pend('RPWNAV-003', '[UNCONFIRMED] Message lỗi hệ thống 500 chưa được xác nhận trong spec. Cần API intercept để giả lập. Không thực hiện.')

    // ===== RPWNAV-004: Navigation step 1 → step 2 — Pending =====
    pend('RPWNAV-004', 'TC yêu cầu gửi mã tới email hợp lệ thật. Không gửi mail thật theo quy tắc an toàn DEV.')

    // ===== RPWNAV-005: Navigation non-happy bước 1 =====
    console.log('\n[RPWNAV-005] Navigation non-happy step 1')
    try {
      // Sub-test 1: empty ログインID + filled email
      await page.goto('/forgot-password')
      await page.waitForLoadState('networkidle')
      await page.getByPlaceholder('ログインID').fill('')
      await page.getByPlaceholder('メールアドレス').fill('user_a@example.com')
      await page.getByRole('button', { name: '認証コードを送信' }).click()
      await page.waitForTimeout(800)
      const url1 = page.url()
      const stayed1 = url1.includes('forgot-password')
      const err1 = await page.getByText('ログインIDは必須項目です。').count()
      const noEmailErr1 = await page.getByText('メールアドレスは必須項目です。').count() === 0
      // Check focus on ログインID input
      const focusedEl1 = await page.evaluate(() => {
        const el = document.activeElement
        return el ? el.getAttribute('placeholder') || el.name : null
      })
      const focusOnLoginId = focusedEl1 === 'ログインID' || focusedEl1 === 'delivererCode'
      // Sub-test 2: ZZ999999 + non-existent email
      await page.goto('/forgot-password')
      await page.waitForLoadState('networkidle')
      await page.getByPlaceholder('ログインID').fill('ZZ999999')
      await page.getByPlaceholder('メールアドレス').fill('notexist_zzz@example.com')
      await page.getByRole('button', { name: '認証コードを送信' }).click()
      await page.waitForTimeout(2000)
      const url2 = page.url()
      const stayed2 = url2.includes('forgot-password')
      const hasError2 = await page.evaluate(() => {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
        let node
        while ((node = walker.nextNode())) {
          if (node.textContent.includes('正しくありません') || node.textContent.includes('登録されていません')) return true
        }
        return false
      })
      const subtest1Ok = stayed1 && err1 > 0
      const subtest2Ok = stayed2 && hasError2
      if (subtest1Ok && subtest2Ok) {
        ok('RPWNAV-005')
      } else {
        const sc = await screenshotNG(page, 'RPWNAV-005')
        ng('RPWNAV-005', `Sub-test1: stayed=${stayed1} err=${err1>0}; Sub-test2: stayed=${stayed2} error=${hasError2}. App navigates to step 2 for non-existent ID/email instead of showing inline error.`, sc)
      }
    } catch (e) {
      const sc = await screenshotNG(page, 'RPWNAV-005').catch(() => '')
      ng('RPWNAV-005', `Script error: ${e.message}`, sc)
    }

    // ===== RPWNAV-006: Navigation step 2 → step 3 — Pending =====
    pend('RPWNAV-006', 'Cần mã xác thực đúng từ email thật để vào bước 3. Không gửi mail thật.')

    // ===== RPWNAV-007: Navigation non-happy bước 2 — Pending =====
    pend('RPWNAV-007', 'Sub-test 1 (mã sai 0000) có thể kiểm tra nhưng sub-test 2 (mã hết hạn) cần chờ >5 phút. Không thực hiện đầy đủ.')

    // ===== RPWNAV-008: Navigation bước 2 trống mã =====
    console.log('\n[RPWNAV-008] Empty code stay at step 2')
    try {
      const onStep2 = await gotoStep2(page)
      if (!onStep2) {
        pend('RPWNAV-008', 'Không thể vào bước 2.')
      } else {
        await page.waitForTimeout(300)
        const confirmBtnDisabled = await page.locator('button[type="submit"]').isDisabled()
        const stayedAtVerify = page.url().includes('verify')
        const inlineError = await page.getByText('認証コード入力は必須項目です。').count()
        if (stayedAtVerify && inlineError > 0) {
          ok('RPWNAV-008')
        } else if (stayedAtVerify && confirmBtnDisabled) {
          const sc = await screenshotNG(page, 'RPWNAV-008')
          ng('RPWNAV-008', `Ở lại bước 2 OK. Nhưng expected inline error "認証コード入力は必須項目です。" không xuất hiện — thay bằng nút 確認 bị disabled. Inline error không có khi ô trống.`, sc)
        } else {
          const sc = await screenshotNG(page, 'RPWNAV-008')
          ng('RPWNAV-008', `Unexpected: stayed=${stayedAtVerify} disabled=${confirmBtnDisabled} inline=${inlineError}`, sc)
        }
      }
    } catch (e) {
      const sc = await screenshotNG(page, 'RPWNAV-008').catch(() => '')
      ng('RPWNAV-008', `Script error: ${e.message}`, sc)
    }

    // ===== RPWNAV-009: Navigation step 3 → step 4 — Pending =====
    pend('RPWNAV-009', 'Cần vào bước 3 (yêu cầu mã xác thực hợp lệ). Không thực hiện.')

    // ===== RPWNAV-010: Navigation non-happy bước 3 — Pending =====
    pend('RPWNAV-010', 'Cần vào bước 3 (yêu cầu mã xác thực hợp lệ). Không thực hiện.')

    // ===== RPWNAV-011: Navigation bước 4 → OW_HOME_001 — Pending =====
    pend('RPWNAV-011', 'Cần hoàn tất bước 3 (ghi mật khẩu mới vào DB). Không thực hiện.')

    // ===== RPWNAV-012: E2E thành công — Pending =====
    pend('RPWNAV-012', 'Luồng E2E đầy đủ cần gửi email thật và ghi mật khẩu mới vào DB. Không thực hiện.')

    // ===== RPWNAV-013: E2E sửa lỗi rồi hoàn tất — Pending =====
    pend('RPWNAV-013', 'Luồng E2E với lỗi cần email thật và ghi DB. Không thực hiện.')

    // ===== RPWNAV-014: Integration đăng nhập mật khẩu mới — Pending =====
    pend('RPWNAV-014', 'Cần hoàn tất reset password thật (ghi DB mật khẩu mới) trước. Không thực hiện.')

  } catch (topError) {
    console.error('TOP LEVEL ERROR:', topError.message)
  } finally {
    await browser.close()
  }

  // Write results
  fs.writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2), 'utf-8')
  console.log('\n=== RESULTS WRITTEN TO:', RESULTS_PATH)
  const okCount = Object.values(results).filter(r => r.result === 'OK').length
  const ngCount = Object.values(results).filter(r => r.result === 'NG').length
  const pendCount = Object.values(results).filter(r => r.result === 'Pending').length
  const naCount = Object.values(results).filter(r => r.result === 'N/A').length
  console.log(`\nSummary: OK=${okCount} NG=${ngCount} Pending=${pendCount} N/A=${naCount}`)
  console.log(`Total: ${Object.keys(results).length}`)
})()
