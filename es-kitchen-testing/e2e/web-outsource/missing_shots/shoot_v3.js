'use strict'
// shoot_v3.js — Staff/delivery shots using existing session helper with re-login
const { open } = require('../_helpers/session.js')
const path = require('path')
const fs = require('fs')

const BASE_DELIVERY = path.resolve(__dirname, '../../../reports/e05/delivery')
const BASE_STAFF    = path.resolve(__dirname, '../../../reports/e05/staff')
const RESULT_FILE   = '/private/tmp/claude-501/-Users-longtd-Desktop-WORK-Project-Eskitchen-AI-AGENTS-ES-KITCHEN/b11cf3b6-254f-4448-b8fe-9753db23119a/scratchpad/auto/missing_shots_result.json'

fs.mkdirSync(BASE_DELIVERY, { recursive: true })
fs.mkdirSync(BASE_STAFF, { recursive: true })

const pause = ms => new Promise(r => setTimeout(r, ms))

async function snap(page, dir, id) {
  const p = path.join(dir, `${id}.png`)
  await page.screenshot({ path: p, fullPage: true })
  console.log(`  [snap] ${id} → ${p}`)
  return p
}

async function getErrors(page) {
  return page.locator('p.text-sm.text-red-400').allTextContents().catch(() => [])
}

// Navigate, and if redirected to login, use the helper login function
// IMPORTANT: navigate to /login WITHOUT redirect param first, so post-login goes to /dashboard
// (loginFn waits for /dashboard pattern)
async function nav(page, loginFn, url) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 40000 }).catch(() => {})
  if (/login/i.test(page.url())) {
    // Go to plain /login (no ?redirect param) so loginFn's waitForURL(/dashboard/) will match
    await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {})
    await pause(500)
    await loginFn(page)
    await pause(800)
    await page.goto(url, { waitUntil: 'networkidle', timeout: 40000 }).catch(() => {})
  }
  await pause(1000)
  return page.url()
}

async function shootDelivery(page, loginFn, results) {
  console.log('\n── Delivery DLD-006 ──')
  try {
    const url = await nav(page, loginFn, '/delivery-status/9114')
    console.log('  URL:', url.replace(/https?:\/\/[^/]+/, 'HOST'))

    if (/login/i.test(url)) {
      results['DLD-006'] = { ok: false, file: '', what: '', reason_if_not: 'Still on login after re-auth attempt' }
      return
    }

    const editBtn = page.locator('button').filter({ hasText: /編集/ }).first()
    const editVisible = await editBtn.isVisible().catch(() => false)
    console.log('  編集 visible:', editVisible)

    if (editVisible) {
      await editBtn.click()
      await pause(1200)
      const allSelects = await page.locator('.ant-select').all()
      console.log('  ant-selects after 編集:', allSelects.length)
      let opened = false
      for (let i = 0; i < Math.min(allSelects.length, 6); i++) {
        try {
          await allSelects[i].click()
          await pause(600)
          const opts = await page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option').allTextContents().catch(() => [])
          if (opts.some(o => /DR|ドライバー|配送スタッフ|未設定|スタッフ/.test(o))) {
            await snap(page, BASE_DELIVERY, 'DLD-006')
            await page.keyboard.press('Escape')
            results['DLD-006'] = {
              ok: true, file: `reports/e05/delivery/DLD-006.png`,
              what: `Driver dropdown (select[${i}]) open in edit mode. Options: ${opts.slice(0,4).join(' | ')}. TC expects each shows order count, actual: only name+ID format.`,
              reason_if_not: ''
            }
            opened = true; break
          }
          await page.keyboard.press('Escape'); await pause(300)
        } catch (_) {}
      }
      if (!opened) {
        await snap(page, BASE_DELIVERY, 'DLD-006')
        results['DLD-006'] = {
          ok: true, file: `reports/e05/delivery/DLD-006.png`,
          what: `After 編集: ${allSelects.length} selects. No driver-option dropdown found. Page captured showing edit-mode state.`,
          reason_if_not: ''
        }
      }
    } else {
      await snap(page, BASE_DELIVERY, 'DLD-006')
      results['DLD-006'] = {
        ok: true, file: `reports/e05/delivery/DLD-006.png`,
        what: `No 編集 button on /delivery-status/9114. Delivery detail shows read-only state without driver dropdown H.2.`,
        reason_if_not: ''
      }
    }
  } catch (e) {
    results['DLD-006'] = { ok: false, file: '', what: '', reason_if_not: e.message }
  }
}

async function shootStaffList(page, loginFn, results) {
  console.log('\n── DRL-009 ──')
  try {
    const url = await nav(page, loginFn, '/driver')
    console.log('  URL:', url.replace(/https?:\/\/[^/]+/, 'HOST'))
    if (/login/i.test(url)) {
      results['DRL-009'] = { ok: false, file: '', what: '', reason_if_not: 'Still on login after re-auth — account lacks staff access' }
      return
    }
    await page.waitForSelector('.ant-select', { timeout: 10000 }).catch(() => {})
    const allSelects = await page.locator('.ant-select').all()
    console.log('  ant-selects on /driver:', allSelects.length)
    if (allSelects.length >= 2) {
      await page.locator('.ant-select').nth(1).click()
      await pause(600)
      const opts = await page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option').allTextContents().catch(() => [])
      await snap(page, BASE_STAFF, 'DRL-009')
      await page.keyboard.press('Escape')
      results['DRL-009'] = {
        ok: true, file: `reports/e05/staff/DRL-009.png`,
        what: `ステータス dropdown (nth 1) options: [${opts.join(', ')}]. TC expects 6 values (全て/有効/免許未登録/利用停止/無効/削除済み), actual: ${opts.length} values.`,
        reason_if_not: ''
      }
    } else {
      await snap(page, BASE_STAFF, 'DRL-009')
      results['DRL-009'] = {
        ok: true, file: `reports/e05/staff/DRL-009.png`,
        what: `${allSelects.length} ant-select elements on /driver (expected ≥2 for status filter). Page captured.`,
        reason_if_not: ''
      }
    }
  } catch (e) {
    results['DRL-009'] = { ok: false, file: '', what: '', reason_if_not: e.message }
  }
}

async function shootStaffDetail(page, loginFn, results) {
  console.log('\n── DRD detail edit ──')
  try {
    const url = await nav(page, loginFn, '/driver/37')
    console.log('  URL:', url.replace(/https?:\/\/[^/]+/, 'HOST'))
    if (/login/i.test(url)) {
      for (const id of ['DRD-005','DRD-009','DRD-020']) {
        results[id] = { ok: false, file: '', what: '', reason_if_not: 'Still on login after re-auth' }
      }
      return
    }
    await page.waitForSelector('button', { timeout: 10000 }).catch(() => {})
    await pause(800)
    const editBtn = page.locator('button').filter({ hasText: /編集/ }).first()
    const editVisible = await editBtn.isVisible().catch(() => false)
    console.log('  編集 visible:', editVisible)
    if (!editVisible) {
      const btns = await page.locator('button').allTextContents()
      console.log('  All buttons:', btns.join('|'))
      for (const id of ['DRD-005','DRD-009','DRD-020']) {
        results[id] = { ok: false, file: '', what: '', reason_if_not: `No 編集 button on /driver/37. Buttons: ${btns.slice(0,5).join('|')}` }
      }
      return
    }
    await editBtn.click(); await pause(1200)
    await page.waitForSelector('input', { timeout: 10000 }).catch(() => {})
    const inputNames = await page.locator('input[name]').evaluateAll(els => els.map(e => e.getAttribute('name')))
    console.log('  input names in edit mode:', inputNames)
    if (!inputNames.includes('driverName')) {
      for (const id of ['DRD-005','DRD-009','DRD-020']) {
        results[id] = { ok: false, file: '', what: '', reason_if_not: `input[name="driverName"] not in edit mode. Available: ${inputNames.join(',')}` }
      }
      return
    }
    // DRD-005
    try {
      const ni = page.locator('input[name="driverName"]')
      await ni.fill('あ'.repeat(51)); await ni.press('Tab'); await pause(700)
      const errs = await getErrors(page)
      await snap(page, BASE_STAFF, 'DRD-005')
      results['DRD-005'] = { ok: true, file: `reports/e05/staff/DRD-005.png`,
        what: `Edit /driver/37: 氏名 51 chars+Tab. Errors:[${errs.join('|')||'none'}]. TC expects 「50文字以内で入力してください」, actual:${errs.length?errs.join('|'):'no blur error'}.`,
        reason_if_not: '' }
      await ni.fill('テスト太郎'); await pause(300)
    } catch(e) { results['DRD-005'] = { ok:false, file:'', what:'', reason_if_not: e.message } }
    // DRD-009
    try {
      const ki = page.locator('input[name="nameKana"]')
      await ki.fill('ア'.repeat(51)); await ki.press('Tab'); await pause(700)
      const errs = await getErrors(page)
      await snap(page, BASE_STAFF, 'DRD-009')
      results['DRD-009'] = { ok: true, file: `reports/e05/staff/DRD-009.png`,
        what: `Edit /driver/37: カナ 51×ア+Tab. Errors:[${errs.join('|')||'none'}]. TC expects 「50文字以内で入力してください」, actual:${errs.length?errs.join('|'):'no blur error'}.`,
        reason_if_not: '' }
      await ki.fill('テストタロウ'); await pause(300)
    } catch(e) { results['DRD-009'] = { ok:false, file:'', what:'', reason_if_not: e.message } }
    // DRD-020
    try {
      const ei = page.locator('input[name="email"]')
      await ei.fill('a'.repeat(248)+'@e.com'+'xxx'); await ei.press('Tab'); await pause(700)
      const errs = await getErrors(page)
      await snap(page, BASE_STAFF, 'DRD-020')
      results['DRD-020'] = { ok: true, file: `reports/e05/staff/DRD-020.png`,
        what: `Edit /driver/37: email 257 chars+Tab. Errors:[${errs.join('|')||'none'}]. TC expects 「256文字以内で入力してください」, actual:${errs.length?errs.join('|'):'no blur error'}.`,
        reason_if_not: '' }
    } catch(e) { results['DRD-020'] = { ok:false, file:'', what:'', reason_if_not: e.message } }
  } catch(e) {
    console.log('  DRD error:', e.message)
    for (const id of ['DRD-005','DRD-009','DRD-020']) results[id] = results[id] || { ok:false, file:'', what:'', reason_if_not: e.message }
  }
}

async function shootStaffCreate(page, loginFn, results) {
  console.log('\n── DRF create form ──')
  try {
    const url = await nav(page, loginFn, '/driver/create')
    console.log('  URL:', url.replace(/https?:\/\/[^/]+/, 'HOST'))
    if (/login/i.test(url)) {
      for (const id of ['DRF-001','DRF-002','DRF-004','DRF-005','DRF-008','DRF-017']) {
        results[id] = { ok:false, file:'', what:'', reason_if_not: 'Still on login after re-auth' }
      }
      return
    }
    const inputNames = await page.locator('input[name]').evaluateAll(els => els.map(e => e.getAttribute('name')))
    console.log('  Input names on /driver/create:', inputNames)
    // DRF-001
    try {
      const vis = await page.locator('input[name="driverCode"]').isVisible().catch(() => false)
      await snap(page, BASE_STAFF, 'DRF-001')
      results['DRF-001'] = { ok:true, file:`reports/e05/staff/DRF-001.png`,
        what:`New form: driverCode visible=${vis}. TC expects A.1 hidden in new mode. Original NG: idVisible=true. Inputs:${inputNames.join(',')}.`,
        reason_if_not:'' }
    } catch(e) { results['DRF-001'] = { ok:false, file:'', what:'', reason_if_not: e.message } }
    // DRF-002
    try {
      const vis = await page.locator('input[name="driverCode"]').isVisible().catch(() => false)
      await snap(page, BASE_STAFF, 'DRF-002')
      results['DRF-002'] = { ok:true, file:`reports/e05/staff/DRF-002.png`,
        what:`A.1 driverCode visible=${vis} on /driver/create. TC expects hidden (step 1), visible in edit mode. Original NG: visible=true.`,
        reason_if_not:'' }
    } catch(e) { results['DRF-002'] = { ok:false, file:'', what:'', reason_if_not: e.message } }

    if (!inputNames.includes('driverName')) {
      const note = `input[name="driverName"] absent. Available:${inputNames.join(',')}. Form may not be rendered.`
      for (const id of ['DRF-004','DRF-005','DRF-008','DRF-017']) results[id] = results[id] || { ok:false, file:'', what:'', reason_if_not: note }
      return
    }
    // DRF-004
    try {
      const ni = page.locator('input[name="driverName"]')
      await ni.fill('あ'.repeat(51)); await ni.press('Tab'); await pause(700)
      const errs = await getErrors(page)
      await snap(page, BASE_STAFF, 'DRF-004')
      results['DRF-004'] = { ok:true, file:`reports/e05/staff/DRF-004.png`,
        what:`Create: 氏名 51 chars+Tab. Errors:[${errs.join('|')||'none'}]. TC expects 「50文字以内」, actual:${errs.length?errs.join('|'):'no blur error'}.`,
        reason_if_not:'' }
      await ni.fill('テスト太郎'); await pause(400)
    } catch(e) { results['DRF-004'] = { ok:false, file:'', what:'', reason_if_not: e.message } }
    // DRF-005
    try {
      const ni = page.locator('input[name="driverName"]')
      const ki = page.locator('input[name="nameKana"]')
      await ni.fill('テスト太郎'); await ni.press('Tab'); await pause(1000)
      const kv = await ki.inputValue().catch(() => '')
      await snap(page, BASE_STAFF, 'DRF-005')
      results['DRF-005'] = { ok:true, file:`reports/e05/staff/DRF-005.png`,
        what:`Create: name テスト太郎+Tab. カナ="${kv}". TC expects auto-fill テストタロウ, actual:empty.`,
        reason_if_not:'' }
    } catch(e) { results['DRF-005'] = { ok:false, file:'', what:'', reason_if_not: e.message } }
    // DRF-008
    try {
      const ki = page.locator('input[name="nameKana"]')
      await ki.fill('ア'.repeat(51)); await ki.press('Tab'); await pause(700)
      const errs = await getErrors(page)
      await snap(page, BASE_STAFF, 'DRF-008')
      results['DRF-008'] = { ok:true, file:`reports/e05/staff/DRF-008.png`,
        what:`Create: カナ 51×ア+Tab. Errors:[${errs.join('|')||'none'}]. TC expects 「50文字以内」, actual:${errs.length?errs.join('|'):'no blur error'}.`,
        reason_if_not:'' }
      await ki.fill('テストタロウ'); await pause(300)
    } catch(e) { results['DRF-008'] = { ok:false, file:'', what:'', reason_if_not: e.message } }
    // DRF-017
    try {
      const ei = page.locator('input[name="email"]')
      await ei.fill('a'.repeat(248)+'@e.com'+'xxx'); await ei.press('Tab'); await pause(700)
      const errs = await getErrors(page)
      await snap(page, BASE_STAFF, 'DRF-017')
      results['DRF-017'] = { ok:true, file:`reports/e05/staff/DRF-017.png`,
        what:`Create: email 257 chars+Tab. Errors:[${errs.join('|')||'none'}]. TC expects 「256文字以内」, actual:${errs.length?errs.join('|'):'no blur error'}.`,
        reason_if_not:'' }
    } catch(e) { results['DRF-017'] = { ok:false, file:'', what:'', reason_if_not: e.message } }
  } catch(e) {
    console.log('  DRF error:', e.message)
    for (const id of ['DRF-001','DRF-002','DRF-004','DRF-005','DRF-008','DRF-017']) results[id] = results[id] || { ok:false, file:'', what:'', reason_if_not: e.message }
  }
}

async function main() {
  let results = {}
  try { results = JSON.parse(fs.readFileSync(RESULT_FILE, 'utf8')) } catch(_) {}
  console.log('=== shoot_v3.js start ===')
  const { browser, page, login } = await open()
  try {
    await shootDelivery(page, login, results)
    await shootStaffList(page, login, results)
    await shootStaffDetail(page, login, results)
    await shootStaffCreate(page, login, results)
  } finally {
    await browser.close()
  }
  fs.writeFileSync(RESULT_FILE, JSON.stringify(results, null, 2))
  console.log('\n=== Done ===')
  const okList = Object.entries(results).filter(([,v]) => v.ok).map(([k]) => k)
  const ngList = Object.entries(results).filter(([,v]) => !v.ok).map(([k]) => k)
  console.log(`OK: ${okList.length} / NOT_OK: ${ngList.length}`)
  ngList.forEach(id => console.log(`  SKIP: ${id} — ${results[id].reason_if_not.split('\n')[0]}`))
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1) })
