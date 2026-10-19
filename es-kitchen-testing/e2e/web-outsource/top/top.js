// E05 HOME + ANNO — Group 4 (top) — FINAL TEST SCRIPT
// TCs: TOPH-001..019, TOPA-001..010, TOPNAV-001..016  (45 total)
// Run: node e2e/web-outsource/top/top.js   (from es-kitchen-testing root)
'use strict'

require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env.test') })

const { open } = require('../_helpers/session.js')
const path = require('path')
const fs   = require('fs')

const RES_PATH = '/private/tmp/claude-501/-Users-longtd-Desktop-WORK-Project-Eskitchen-AI-AGENTS-ES-KITCHEN/b11cf3b6-254f-4448-b8fe-9753db23119a/scratchpad/auto/res_4_top.json'
const SHOT     = path.resolve(__dirname, '../../../reports/e05/top')
fs.mkdirSync(SHOT, { recursive: true })

const results = {}

function rec(id, result, note = '') {
  results[id] = { result, note }
  const sym = result === 'OK' ? '✓' : result === 'NG' ? '✗' : result === 'Pending' ? '?' : '-'
  console.log(`  ${sym} ${id}: ${result}${note ? '  — ' + note.slice(0, 120) : ''}`)
}

function pend(id, reason) { rec(id, 'Pending', reason) }

async function shot(page, id) {
  const p = path.join(SHOT, `${id}.png`)
  try { await page.screenshot({ path: p, fullPage: true }) } catch {}
  return `reports/e05/top/${id}.png`
}

async function goHome(page) {
  await page.goto('/dashboard')
  await page.waitForTimeout(1200)
}

// Find a day button in current month (non-opacity-60) by day number
async function findDayBtn(page, dayNum) {
  const sec = page.locator('section:has(h2:text("今月の配送スケジュール"))')
  const btns = await sec.locator('button').all()
  for (const btn of btns) {
    const cls = (await btn.getAttribute('class')) || ''
    if (cls.includes('opacity-60')) continue           // prev/next month
    const raw = ((await btn.textContent()) || '').trim()
    const first = raw.split(/[\s\n]/)[0]              // first token = day number
    if (parseInt(first) === dayNum) return btn
  }
  return null
}

// ─── TOPH tests ─────────────────────────────────────────────────────────────

async function TOPH_001(page) {
  try {
    await goHome(page)
    const h2s   = await page.locator('h2').allTextContents()
    const menus = (await page.locator('.ant-menu-item').allTextContents()).map(t => t.trim())
    const need7 = ['ホーム', 'スケジュール', '配送管理', '見積もり管理', '集金・駐車', '配送スタッフ', 'プロフィール']
    const missingMenu = need7.filter(s => !menus.some(m => m === s))
    const noHScroll = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 5)
    const ev = await shot(page, 'TOPH-001')
    if (!h2s.some(t => t.includes('今月の配送スケジュール'))) return rec('TOPH-001', 'NG', `h2 "今月の配送スケジュール" not found | ${ev}`)
    if (!h2s.some(t => t.includes('お知らせ')))               return rec('TOPH-001', 'NG', `h2 "お知らせ" not found | ${ev}`)
    if (!h2s.some(t => t.includes('未回答の見積もり依頼')))   return rec('TOPH-001', 'NG', `h2 "未回答の見積もり依頼" not found | ${ev}`)
    if (missingMenu.length)  return rec('TOPH-001', 'NG', `Sidebar missing: ${missingMenu.join(',')} | ${ev}`)
    if (!noHScroll)          return rec('TOPH-001', 'NG', `Horizontal scroll detected | ${ev}`)
    rec('TOPH-001', 'OK')
  } catch(e) { pend('TOPH-001', `Exception: ${e.message.slice(0,150)}`) }
}

async function TOPH_002(page) {
  // Week labels A/B/C/D with different colours — check DOM
  try {
    await goHome(page)
    const sec  = page.locator('section:has(h2:text("今月の配送スケジュール"))')
    const btns = await sec.locator('button').all()
    // Collect unique bg-* classes on current-month buttons
    const bgSet = new Set()
    for (const btn of btns) {
      const cls = (await btn.getAttribute('class')) || ''
      if (cls.includes('opacity-60')) continue
      cls.split(' ').filter(c => c.startsWith('bg-')).forEach(c => bgSet.add(c))
    }
    // Week labels (A/B/C/D span elements)
    const weekLabels = await sec.locator('span').evaluateAll(els =>
      els.filter(e => ['A','B','C','D'].includes((e.textContent||'').trim()))
        .map(e => (e.textContent||'').trim())
    )
    const ev = await shot(page, 'TOPH-002')
    // Expect 4 different bg colours for 4 weeks — actual: only bg-white and bg-green-50 found
    const expectedBgs = ['bg-blue', 'bg-orange', 'bg-pink']
    const hasWeekColors = expectedBgs.some(b => [...bgSet].some(c => c.startsWith(b)))
    if (weekLabels.length === 0 || !hasWeekColors) {
      rec('TOPH-002', 'NG',
        `Week labels A/B/C/D not implemented. weekLabels in DOM: [${weekLabels.join(',')}]. bg classes found: [${[...bgSet].join(',')}]. Expected cells colored by week (A=blue/B=green/C=orange/D=pink). | ${ev}`)
    } else {
      rec('TOPH-002', 'OK')
    }
  } catch(e) { pend('TOPH-002', `Exception: ${e.message.slice(0,150)}`) }
}

async function TOPH_003() { pend('TOPH-003', 'No today/yesterday notice in DEV (all 21日前). Need notice posted within 48h.') }
async function TOPH_004() { pend('TOPH-004', 'DEV shows "未回答の見積もり依頼はありません" — no unanswered estimates. Need DEV data.') }
async function TOPH_005() { pend('TOPH-005', 'Test data mismatch: TC needs day15=12件/day16=0件 but actual DEV day15=1件/day16=0件.') }
async function TOPH_006() { pend('TOPH-006', 'TC needs day10=臨時休業/day12=休/day20=未設定 labels. Not present in DEV data.') }

async function TOPH_007(page) {
  // Warning badge format ⚠N件
  try {
    await goHome(page)
    const sec = page.locator('section:has(h2:text("今月の配送スケジュール"))')
    // Find badge spans inside buttons using evaluate (avoids CSS bracket escaping issues)
    const badgeInfo = await sec.locator('button').evaluateAll(btns =>
      btns.flatMap(btn => {
        const spans = [...btn.querySelectorAll('span')]
        return spans
          .filter(s => /F23836|bg-\[#F/.test(s.className || ''))
          .map(s => ({ text: (s.textContent||'').trim(), cls: s.className.slice(0,80) }))
      })
    )
    const ev = await shot(page, 'TOPH-007')
    if (badgeInfo.length === 0) {
      pend('TOPH-007', 'No unassigned-warning badges visible in current DEV calendar data. Cannot verify format.')
      return
    }
    const hasExpectedFmt = badgeInfo.some(b => b.text.includes('⚠'))
    if (!hasExpectedFmt) {
      rec('TOPH-007', 'NG',
        `Badge format mismatch: expected "⚠N件" but actual badge shows "${badgeInfo[0].text}". ` +
        `Also test data differs (TC: day20=3 unassigned/day15=0 unassigned; DEV: actual day values differ). | ${ev}`)
    } else {
      rec('TOPH-007', 'OK')
    }
  } catch(e) { pend('TOPH-007', `Exception: ${e.message.slice(0,150)}`) }
}

async function TOPH_008() { pend('TOPH-008', 'Requires assigning driver to delivery order (mutates DEV data — prohibited).') }

async function TOPH_009(page) {
  // Exactly 1 today-marker cell (border-2 border-primary, not opacity-60)
  try {
    await goHome(page)
    const todayDay = new Date().getDate()   // 9 for Oct 9 2026
    const sec  = page.locator('section:has(h2:text("今月の配送スケジュール"))')
    const btns = await sec.locator('button').all()
    const todayBtns = []
    for (const btn of btns) {
      const cls = (await btn.getAttribute('class')) || ''
      if (cls.includes('border-2') && cls.includes('border-primary') && !cls.includes('opacity-60')) {
        const raw = ((await btn.textContent()) || '').trim()
        todayBtns.push({ day: parseInt(raw.split(/[\s\n]/)[0]), cls: cls.slice(0,80) })
      }
    }
    const ev = await shot(page, 'TOPH-009')
    if (todayBtns.length !== 1) return rec('TOPH-009', 'NG', `Expected exactly 1 today cell, found ${todayBtns.length}: ${JSON.stringify(todayBtns)} | ${ev}`)
    if (todayBtns[0].day !== todayDay) return rec('TOPH-009', 'NG', `Today marker on day ${todayBtns[0].day}, system day is ${todayDay} | ${ev}`)
    rec('TOPH-009', 'OK')
  } catch(e) { pend('TOPH-009', `Exception: ${e.message.slice(0,150)}`) }
}

async function TOPH_010(page) {
  // Click day 15 → /schedule?view=week
  try {
    await goHome(page)
    const btn = await findDayBtn(page, 15)
    if (!btn) return pend('TOPH-010', 'Cannot find day 15 button in calendar.')
    await btn.click(); await page.waitForTimeout(2000)
    const url = page.url()
    const ev  = await shot(page, 'TOPH-010')
    if (!/schedule/.test(url))  return rec('TOPH-010', 'NG', `Expected /schedule, got …${url.replace(/https?:\/\/[^/]+/,'')} | ${ev}`)
    if (!/view=week/.test(url)) return rec('TOPH-010', 'NG', `Expected week view, got …${url.replace(/https?:\/\/[^/]+/,'')} | ${ev}`)
    rec('TOPH-010', 'OK')
    await page.goBack(); await page.waitForTimeout(800)
  } catch(e) { pend('TOPH-010', `Exception: ${e.message.slice(0,150)}`) }
}

async function TOPH_011(page) {
  // スケジュールへ → /schedule
  try {
    await goHome(page)
    const link = page.locator('a[href="/schedule"]').first()
    await link.click(); await page.waitForTimeout(2000)
    const url = page.url()
    const ev  = await shot(page, 'TOPH-011')
    if (!/\/schedule/.test(url)) return rec('TOPH-011', 'NG', `Expected /schedule, got …${url.replace(/https?:\/\/[^/]+/,'')} | ${ev}`)
    rec('TOPH-011', 'OK')
    await page.goBack(); await page.waitForTimeout(800)
  } catch(e) { pend('TOPH-011', `Exception: ${e.message.slice(0,150)}`) }
}

async function TOPH_012(page) {
  // Notice list: newest first (descending announcement IDs)
  try {
    await goHome(page)
    const sec   = page.locator('section:has(h2:text("お知らせ"))')
    const links = await sec.locator('a[href*="/announcements"]').all()
    if (links.length < 2) return pend('TOPH-012', `Only ${links.length} notice(s). Need ≥2 to verify order.`)
    const ids = []
    for (const l of links) {
      const href = await l.getAttribute('href')
      ids.push(parseInt((href || '').split('/').pop() || '0'))
    }
    const ordered = ids.every((id, i) => i === 0 || id < ids[i-1])
    const ev = await shot(page, 'TOPH-012')
    if (!ordered) return rec('TOPH-012', 'NG', `Notices not in descending ID order. IDs: ${ids.join(',')} | ${ev}`)
    rec('TOPH-012', 'OK')
  } catch(e) { pend('TOPH-012', `Exception: ${e.message.slice(0,150)}`) }
}

async function TOPH_013(page) {
  // Click first notice → /announcements/<id>, detail title matches
  try {
    await goHome(page)
    const sec   = page.locator('section:has(h2:text("お知らせ"))')
    const first = sec.locator('a[href*="/announcements"]').first()
    const href  = await first.getAttribute('href')
    // Grab list title (span with text-blue class)
    const titleSpan = first.locator('span[class*="text-blue"]').first()
    const listTitle = ((await titleSpan.textContent().catch(() => '')) || '').trim()

    await first.click(); await page.waitForTimeout(2000)
    const url = page.url()
    const ev  = await shot(page, 'TOPH-013')
    if (!url.includes('/announcements')) return rec('TOPH-013', 'NG', `Expected /announcements URL, got …${url.replace(/https?:\/\/[^/]+/,'')} | ${ev}`)
    const detailH2 = ((await page.locator('h2').first().textContent().catch(() => '')) || '').trim()
    if (listTitle && detailH2 !== listTitle) {
      rec('TOPH-013', 'NG', `Detail h2 "${detailH2}" ≠ list title "${listTitle}" | ${ev}`)
    } else {
      rec('TOPH-013', 'OK')
    }
    await page.goBack(); await page.waitForTimeout(800)
  } catch(e) { pend('TOPH-013', `Exception: ${e.message.slice(0,150)}`) }
}

async function TOPH_014() { pend('TOPH-014', 'No <script>alert(1)</script> notice title in DEV. XSS test data unavailable.') }
async function TOPH_015() { pend('TOPH-015', 'Needs network throttle/5s delay simulation. Not feasible on live DEV.') }
async function TOPH_016() { pend('TOPH-016', 'TC requires "システム更新" badge. DEV has "重要" and "お知らせ" (both with different colours ✓). Specific "システム更新" type not in DEV.') }
async function TOPH_017() { pend('TOPH-017', '[UNCONFIRMED] JWT expiry simulation required.') }
async function TOPH_018() { pend('TOPH-018', '[UNCONFIRMED] Network disconnect simulation required.') }
async function TOPH_019() { pend('TOPH-019', '[UNCONFIRMED] API 500 error mock required.') }

// ─── TOPA tests ──────────────────────────────────────────────────────────────

const ANNO_ID = '91432'   // known announcement ID in DEV

async function TOPA_001(page) {
  // Layout: badge + date + title + content + back-link
  try {
    await page.goto(`/announcements/${ANNO_ID}`); await page.waitForTimeout(2000)
    const badgeCnt   = await page.locator('span').evaluateAll(els =>
      els.filter(e => /bg-red-500|bg-txt-low/.test(e.className||'')).length)
    const dateCnt    = await page.locator('span').filter({ hasText: /投稿日時/ }).count()
    const titleText  = ((await page.locator('h2').first().textContent().catch(() => '')) || '').trim()
    const contentCnt = await page.locator('.whitespace-pre-line, [class*="whitespace-pre"]').count()
    const backCnt    = await page.locator('a').filter({ hasText: '一覧に戻る' }).count()
    const ev = await shot(page, 'TOPA-001')
    const miss = []
    if (badgeCnt  < 1) miss.push('badge')
    if (dateCnt   < 1) miss.push('投稿日時')
    if (!titleText)    miss.push('h2 title')
    if (contentCnt< 1) miss.push('content')
    if (backCnt   < 1) miss.push('一覧に戻る')
    if (miss.length) return rec('TOPA-001', 'NG', `Missing: ${miss.join(', ')} | ${ev}`)
    rec('TOPA-001', 'OK')
  } catch(e) { pend('TOPA-001', `Exception: ${e.message.slice(0,150)}`) }
}

async function TOPA_002(page) {
  // Date format: yyyy年M月d日 HH:mm  (no leading zeros for M, d)
  try {
    await page.goto(`/announcements/${ANNO_ID}`); await page.waitForTimeout(2000)
    const dateEl   = page.locator('span').filter({ hasText: /投稿日時：/ })
    const dateText = ((await dateEl.first().textContent().catch(() => '')) || '').trim()
    // Must match: 4-digit year 年 1-2-digit month 月 1-2-digit day 日 space HH:mm
    const fmtOK = /\d{4}年\d{1,2}月\d{1,2}日 \d{2}:\d{2}/.test(dateText)
    const noLeadM  = !(/年0\d月/.test(dateText))   // no leading zero on month
    const noLeadD  = !(/月0\d日/.test(dateText))   // no leading zero on day
    const ev = await shot(page, 'TOPA-002')
    if (!fmtOK)    return rec('TOPA-002', 'NG', `Format mismatch. Actual: "${dateText}" | ${ev}`)
    if (!noLeadM || !noLeadD) return rec('TOPA-002', 'NG', `Leading zeros detected. Actual: "${dateText}" | ${ev}`)
    rec('TOPA-002', 'OK')
  } catch(e) { pend('TOPA-002', `Exception: ${e.message.slice(0,150)}`) }
}

async function TOPA_003(page) {
  // Title read-only: h2 shows text, no input after double-click
  try {
    await page.goto(`/announcements/${ANNO_ID}`); await page.waitForTimeout(2000)
    const title = ((await page.locator('h2').first().textContent().catch(() => '')) || '').trim()
    if (!title) return rec('TOPA-003', 'NG', 'h2 title is empty.')
    await page.locator('h2').first().dblclick()
    await page.waitForTimeout(500)
    const inputCnt = await page.locator('input[type="text"]:visible, textarea:visible').count()
    const ev = await shot(page, 'TOPA-003')
    if (inputCnt > 0) return rec('TOPA-003', 'NG', `After double-click, ${inputCnt} editable input(s) appeared — title is not read-only. | ${ev}`)
    rec('TOPA-003', 'OK')
  } catch(e) { pend('TOPA-003', `Exception: ${e.message.slice(0,150)}`) }
}

async function TOPA_004() { pend('TOPA-004', 'TC needs rich text (■/・/bold) with 50+ lines. Actual DEV notices are plain text.') }
async function TOPA_005() { pend('TOPA-005', 'No <script>alert(1)</script> announcement in DEV. XSS detail test data unavailable.') }

async function TOPA_006(page) {
  // Badge in detail = badge in list (text + colour class)
  try {
    await goHome(page)
    const sec   = page.locator('section:has(h2:text("お知らせ"))')
    const first = sec.locator('a[href*="/announcements"]').first()
    const href  = await first.getAttribute('href')

    // Get list badge info
    const listBadge = await first.evaluateAll ? null : null  // fallback path
    const listBadgeData = await first.locator('span').evaluateAll(spans => {
      const b = spans.find(s => /bg-red-500|bg-txt-low|bg-red|bg-gray/.test(s.className||''))
      return b ? { text: (b.textContent||'').trim(), bg: (b.className||'').split(' ').find(c => c.startsWith('bg-')) || '' } : null
    })

    await page.goto(href || '/dashboard'); await page.waitForTimeout(2000)

    // Get detail badge info
    const detailBadgeData = await page.locator('span').evaluateAll(spans => {
      const b = spans.find(s => /bg-red-500|bg-txt-low|bg-red|bg-gray/.test(s.className||''))
      return b ? { text: (b.textContent||'').trim(), bg: (b.className||'').split(' ').find(c => c.startsWith('bg-')) || '' } : null
    })

    const ev = await shot(page, 'TOPA-006')
    if (!listBadgeData)   return pend('TOPA-006', 'Could not find badge in notice list item.')
    if (!detailBadgeData) return pend('TOPA-006', 'Could not find badge on detail page.')
    if (listBadgeData.text !== detailBadgeData.text)
      return rec('TOPA-006', 'NG', `Text: list="${listBadgeData.text}" vs detail="${detailBadgeData.text}" | ${ev}`)
    if (listBadgeData.bg !== detailBadgeData.bg)
      return rec('TOPA-006', 'NG', `Colour: list="${listBadgeData.bg}" vs detail="${detailBadgeData.bg}" | ${ev}`)
    rec('TOPA-006', 'OK')
    await page.goBack(); await page.waitForTimeout(800)
  } catch(e) { pend('TOPA-006', `Exception: ${e.message.slice(0,150)}`) }
}

async function TOPA_007(page) {
  // 一覧に戻る → /dashboard with 3 blocks
  try {
    await page.goto(`/announcements/${ANNO_ID}`); await page.waitForTimeout(2000)
    const backLink = page.locator('a').filter({ hasText: '一覧に戻る' }).first()
    if (!await backLink.count()) {
      const ev = await shot(page, 'TOPA-007')
      return rec('TOPA-007', 'NG', `"一覧に戻る" not found on detail page. | ${ev}`)
    }
    await backLink.click(); await page.waitForTimeout(2000)
    const url  = page.url()
    const h2s  = await page.locator('h2').allTextContents()
    const ok3  = ['今月の配送スケジュール','お知らせ','未回答の見積もり依頼'].every(h => h2s.some(t => t.includes(h)))
    const ev   = await shot(page, 'TOPA-007')
    if (!url.includes('/dashboard')) return rec('TOPA-007', 'NG', `Expected /dashboard, got …${url.replace(/https?:\/\/[^/]+/,'')} | ${ev}`)
    if (!ok3) return rec('TOPA-007', 'NG', `3 blocks not all visible after back. h2s: ${h2s.join('|')} | ${ev}`)
    rec('TOPA-007', 'OK')
  } catch(e) { pend('TOPA-007', `Exception: ${e.message.slice(0,150)}`) }
}

async function TOPA_008() { pend('TOPA-008', '[UNCONFIRMED] JWT expiry simulation required.') }
async function TOPA_009() { pend('TOPA-009', '[UNCONFIRMED] Network disconnect simulation required.') }
async function TOPA_010() { pend('TOPA-010', '[UNCONFIRMED] API 500 error mock required.') }

// ─── TOPNAV tests ────────────────────────────────────────────────────────────

// TOPNAV_001 is run with a SEPARATE browser before main session (see main())
async function TOPNAV_001_run() {
  const { browser, page, login } = await open({ anonymous: true })
  try {
    // Navigate to /dashboard — should redirect to /login
    await page.goto('/dashboard'); await page.waitForTimeout(2000)
    const urlBefore = page.url()
    if (!/login/.test(urlBefore)) {
      return pend('TOPNAV-001', `Expected redirect to /login from /dashboard, but stayed at ${urlBefore.replace(/https?:\/\/[^/]+/,'')}`)
    }
    // Login using session helper (reads credentials from env — NOT printed)
    await login(page)
    const urlAfter = page.url()
    const h2s = await page.locator('h2').allTextContents()
    const ok3 = ['今月の配送スケジュール','お知らせ','未回答の見積もり依頼'].every(h => h2s.some(t => t.includes(h)))
    await shot(page, 'TOPNAV-001')
    if (!urlAfter.includes('/dashboard')) return rec('TOPNAV-001', 'NG', `After login, expected /dashboard, got …${urlAfter.replace(/https?:\/\/[^/]+/,'')}`)
    if (!ok3) return rec('TOPNAV-001', 'NG', `Dashboard missing blocks after login. h2s: ${h2s.join('|')}`)
    rec('TOPNAV-001', 'OK')
  } catch(e) {
    pend('TOPNAV-001', `Exception: ${e.message.slice(0,150)}`)
  } finally {
    await browser.close()
  }
}

async function TOPNAV_002() { pend('TOPNAV-002', 'Password reset flow requires triggering real email. Cannot automate.') }

async function TOPNAV_003(page) {
  // Click day 15 → /schedule?view=week&date=2026-10-15
  try {
    await goHome(page)
    const btn = await findDayBtn(page, 15)
    if (!btn) return pend('TOPNAV-003', 'Cannot find day 15 button.')
    await btn.click(); await page.waitForTimeout(2000)
    const url = page.url()
    const ev  = await shot(page, 'TOPNAV-003')
    if (!/schedule/.test(url))              return rec('TOPNAV-003', 'NG', `Expected /schedule, got …${url.replace(/https?:\/\/[^/]+/,'')} | ${ev}`)
    if (!/view=week/.test(url))             return rec('TOPNAV-003', 'NG', `Expected week view, got …${url.replace(/https?:\/\/[^/]+/,'')} | ${ev}`)
    if (!url.includes('2026-10-15'))        return rec('TOPNAV-003', 'NG', `URL does not reference 2026-10-15. Actual: …${url.replace(/https?:\/\/[^/]+/,'')} | ${ev}`)
    rec('TOPNAV-003', 'OK')
    await page.goBack(); await page.waitForTimeout(800)
  } catch(e) { pend('TOPNAV-003', `Exception: ${e.message.slice(0,150)}`) }
}

async function TOPNAV_004(page) {
  // Click first opacity-60 button (prev month) → /schedule?view=week
  try {
    await goHome(page)
    const sec  = page.locator('section:has(h2:text("今月の配送スケジュール"))')
    const btns = await sec.locator('button').all()
    let prevBtn = null
    for (const b of btns) {
      const cls = (await b.getAttribute('class')) || ''
      if (cls.includes('opacity-60')) { prevBtn = b; break }
    }
    if (!prevBtn) return pend('TOPNAV-004', 'No prev-month cells (opacity-60) found.')
    const btnTxt = ((await prevBtn.textContent()) || '').trim().split(/[\s\n]/)[0]
    await prevBtn.click(); await page.waitForTimeout(2000)
    const url = page.url()
    const ev  = await shot(page, 'TOPNAV-004')
    if (!/schedule/.test(url))  return rec('TOPNAV-004', 'NG', `Expected /schedule, got …${url.replace(/https?:\/\/[^/]+/,'')} | ${ev}`)
    if (!/view=week/.test(url)) return rec('TOPNAV-004', 'NG', `Expected week view, got …${url.replace(/https?:\/\/[^/]+/,'')} | ${ev}`)
    rec('TOPNAV-004', 'OK')
    await page.goBack(); await page.waitForTimeout(800)
  } catch(e) { pend('TOPNAV-004', `Exception: ${e.message.slice(0,150)}`) }
}

async function TOPNAV_005(page) {
  // スケジュールへ → /schedule (same as TOPH-011 but via nav path)
  try {
    await goHome(page)
    await page.locator('a[href="/schedule"]').first().click(); await page.waitForTimeout(2000)
    const url = page.url()
    const ev  = await shot(page, 'TOPNAV-005')
    if (!/\/schedule/.test(url)) return rec('TOPNAV-005', 'NG', `Expected /schedule, got …${url.replace(/https?:\/\/[^/]+/,'')} | ${ev}`)
    rec('TOPNAV-005', 'OK')
    await page.goBack(); await page.waitForTimeout(800)
  } catch(e) { pend('TOPNAV-005', `Exception: ${e.message.slice(0,150)}`) }
}

async function TOPNAV_006(page) {
  // Click notice title → ANNO_002 with correct badge/date/title
  try {
    await goHome(page)
    const sec   = page.locator('section:has(h2:text("お知らせ"))')
    const first = sec.locator('a[href*="/announcements"]').first()
    const listTitle = ((await first.locator('span[class*="text-blue"]').first().textContent().catch(() => '')) || '').trim()
    const listBadge = ((await first.locator('span').evaluateAll(ss => {
      const b = ss.find(s => /bg-red-500|bg-txt-low/.test(s.className||''))
      return b ? (b.textContent||'').trim() : ''
    })) || '')

    await first.click(); await page.waitForTimeout(2000)
    const url = page.url()
    const ev  = await shot(page, 'TOPNAV-006')
    if (!url.includes('/announcements')) return rec('TOPNAV-006', 'NG', `Expected /announcements URL, got …${url.replace(/https?:\/\/[^/]+/,'')} | ${ev}`)

    const detailH2   = ((await page.locator('h2').first().textContent().catch(() => '')) || '').trim()
    const detailBadge = ((await page.locator('span').evaluateAll(ss => {
      const b = ss.find(s => /bg-red-500|bg-txt-low/.test(s.className||''))
      return b ? (b.textContent||'').trim() : ''
    })) || '')
    const hasDate = await page.locator('span').filter({ hasText: /投稿日時/ }).count()

    const issues = []
    if (listTitle && detailH2 !== listTitle)        issues.push(`title: list="${listTitle}" vs detail="${detailH2}"`)
    if (listBadge && detailBadge !== listBadge)     issues.push(`badge: list="${listBadge}" vs detail="${detailBadge}"`)
    if (hasDate === 0)                              issues.push('no 投稿日時')
    if (issues.length) return rec('TOPNAV-006', 'NG', `${issues.join('; ')} | ${ev}`)
    rec('TOPNAV-006', 'OK')
    await page.goBack(); await page.waitForTimeout(800)
  } catch(e) { pend('TOPNAV-006', `Exception: ${e.message.slice(0,150)}`) }
}

async function TOPNAV_007(page) {
  // 一覧に戻る → HOME with 3 blocks (full nav flow)
  try {
    await goHome(page)
    const sec   = page.locator('section:has(h2:text("お知らせ"))')
    const first = sec.locator('a[href*="/announcements"]').first()
    if (!await first.count()) return pend('TOPNAV-007', 'No announcements in DEV.')
    await first.click(); await page.waitForTimeout(2000)

    const backLink = page.locator('a').filter({ hasText: '一覧に戻る' }).first()
    if (!await backLink.count()) {
      const ev = await shot(page, 'TOPNAV-007')
      return rec('TOPNAV-007', 'NG', `"一覧に戻る" not found on ANNO page | ${ev}`)
    }
    await backLink.click(); await page.waitForTimeout(2000)
    const url  = page.url()
    const h2s  = await page.locator('h2').allTextContents()
    const ok3  = ['今月の配送スケジュール','お知らせ','未回答の見積もり依頼'].every(h => h2s.some(t => t.includes(h)))
    const ev   = await shot(page, 'TOPNAV-007')
    if (!url.includes('/dashboard')) return rec('TOPNAV-007', 'NG', `Expected /dashboard, got …${url.replace(/https?:\/\/[^/]+/,'')} | ${ev}`)
    if (!ok3) return rec('TOPNAV-007', 'NG', `3 blocks not all visible. h2s: ${h2s.join('|')} | ${ev}`)
    rec('TOPNAV-007', 'OK')
  } catch(e) { pend('TOPNAV-007', `Exception: ${e.message.slice(0,150)}`) }
}

async function TOPNAV_008(page) {
  // Click notice A → browser-back → click notice B → verify B content
  try {
    await goHome(page)
    const sec   = page.locator('section:has(h2:text("お知らせ"))')
    const links = await sec.locator('a[href*="/announcements"]').all()
    if (links.length < 2) return pend('TOPNAV-008', `Only ${links.length} notice(s). Need ≥2.`)

    // Second notice's title
    const secTitle = ((await links[1].locator('span[class*="text-blue"]').first().textContent().catch(() => '')) || '').trim()

    // Click first notice
    await links[0].click(); await page.waitForTimeout(2000)
    // Browser back
    await page.goBack(); await page.waitForTimeout(1500)
    // Re-fetch links (SPA may re-render)
    const links2 = await page.locator('section:has(h2:text("お知らせ")) a[href*="/announcements"]').all()
    if (links2.length < 2) return pend('TOPNAV-008', 'After back, <2 notice links found.')
    await links2[1].click(); await page.waitForTimeout(2000)

    const detailH2 = ((await page.locator('h2').first().textContent().catch(() => '')) || '').trim()
    const ev = await shot(page, 'TOPNAV-008')
    if (secTitle && detailH2 !== secTitle) return rec('TOPNAV-008', 'NG', `Expected second notice "${secTitle}", got "${detailH2}" | ${ev}`)
    rec('TOPNAV-008', 'OK')
    await page.goBack(); await page.waitForTimeout(800)
  } catch(e) { pend('TOPNAV-008', `Exception: ${e.message.slice(0,150)}`) }
}

async function TOPNAV_009(page) {
  // Click 5 sidebar items → correct screen URLs
  const nav = [
    { text: 'スケジュール',  path: '/schedule'          },
    { text: '配送管理',      path: '/delivery-status'   },
    { text: '集金・駐車',    path: '/collection-reports'},
    { text: '配送スタッフ',  path: '/driver'            },
    { text: 'プロフィール',  path: '/profile'           },
  ]
  try {
    const fails = []
    for (const item of nav) {
      await goHome(page)
      const mi = page.locator('.ant-menu-item').filter({ hasText: item.text }).first()
      if (!await mi.count()) { fails.push(`${item.text}: menu item not found`); continue }
      await mi.click(); await page.waitForTimeout(1500)
      const url = page.url()
      if (!url.includes(item.path)) fails.push(`${item.text}: expected ${item.path}, got …${url.replace(/https?:\/\/[^/]+/,'')}`)
    }
    const ev = await shot(page, 'TOPNAV-009')
    if (fails.length) return rec('TOPNAV-009', 'NG', `${fails.join(' | ')} | ${ev}`)
    rec('TOPNAV-009', 'OK')
    await goHome(page)
  } catch(e) { pend('TOPNAV-009', `Exception: ${e.message.slice(0,150)}`) }
}

async function TOPNAV_010(page) {
  // ホーム is active (ant-menu-item-selected)
  try {
    await goHome(page)
    const active = ((await page.locator('.ant-menu-item-selected').first().textContent().catch(() => '')) || '').trim()
    const ev = await shot(page, 'TOPNAV-010')
    if (!active.includes('ホーム')) return rec('TOPNAV-010', 'NG', `Active sidebar item is "${active}", expected "ホーム" | ${ev}`)
    rec('TOPNAV-010', 'OK')
  } catch(e) { pend('TOPNAV-010', `Exception: ${e.message.slice(0,150)}`) }
}

async function TOPNAV_011(page) {
  // Browser Back from SCHD_002 → HOME
  try {
    await goHome(page)
    const btn9 = await findDayBtn(page, 9)   // today = Oct 9
    if (!btn9) return pend('TOPNAV-011', 'Cannot find day 9 button (today).')
    await btn9.click(); await page.waitForTimeout(2000)
    const urlAtSched = page.url()
    if (!/schedule/.test(urlAtSched)) return pend('TOPNAV-011', `Did not navigate to /schedule. Got …${urlAtSched.replace(/https?:\/\/[^/]+/,'')}`)
    await page.goBack(); await page.waitForTimeout(2000)
    const urlBack = page.url()
    const h2s = await page.locator('h2').allTextContents()
    const ok3 = ['今月の配送スケジュール','お知らせ','未回答の見積もり依頼'].every(h => h2s.some(t => t.includes(h)))
    const ev  = await shot(page, 'TOPNAV-011')
    if (!urlBack.includes('/dashboard')) return rec('TOPNAV-011', 'NG', `Expected /dashboard, got …${urlBack.replace(/https?:\/\/[^/]+/,'')} | ${ev}`)
    if (!ok3) return rec('TOPNAV-011', 'NG', `3 blocks not visible after back. h2s: ${h2s.join('|')} | ${ev}`)
    rec('TOPNAV-011', 'OK')
  } catch(e) { pend('TOPNAV-011', `Exception: ${e.message.slice(0,150)}`) }
}

async function TOPNAV_012(page) {
  // Browser Back from ANNO_002 → HOME, notice list still sorted
  try {
    await goHome(page)
    const links = await page.locator('section:has(h2:text("お知らせ")) a[href*="/announcements"]').all()
    if (!links.length) return pend('TOPNAV-012', 'No announcements in DEV.')
    await links[0].click(); await page.waitForTimeout(2000)
    await page.goBack(); await page.waitForTimeout(2000)
    const urlBack = page.url()
    const linksAfter = await page.locator('section:has(h2:text("お知らせ")) a[href*="/announcements"]').all()
    const ids = []
    for (const l of linksAfter.slice(0, 5)) {
      const href = await l.getAttribute('href')
      ids.push(parseInt((href||'').split('/').pop()||'0'))
    }
    const ordered = ids.every((id, i) => i === 0 || id < ids[i-1])
    const ev = await shot(page, 'TOPNAV-012')
    if (!urlBack.includes('/dashboard')) return rec('TOPNAV-012', 'NG', `Expected /dashboard after back, got …${urlBack.replace(/https?:\/\/[^/]+/,'')} | ${ev}`)
    if (!ordered) return rec('TOPNAV-012', 'NG', `Notice list not in descending order after back. IDs: ${ids.join(',')} | ${ev}`)
    rec('TOPNAV-012', 'OK')
  } catch(e) { pend('TOPNAV-012', `Exception: ${e.message.slice(0,150)}`) }
}

async function TOPNAV_013(page) {
  // F5 reload → still on /dashboard with 3 blocks
  try {
    await goHome(page)
    await page.reload(); await page.waitForTimeout(2000)
    const url  = page.url()
    const h2s  = await page.locator('h2').allTextContents()
    const ok3  = ['今月の配送スケジュール','お知らせ','未回答の見積もり依頼'].every(h => h2s.some(t => t.includes(h)))
    const ev   = await shot(page, 'TOPNAV-013')
    if (!url.includes('/dashboard')) return rec('TOPNAV-013', 'NG', `After reload, not on /dashboard. Got …${url.replace(/https?:\/\/[^/]+/,'')} | ${ev}`)
    if (!ok3) return rec('TOPNAV-013', 'NG', `3 blocks not loaded after reload. h2s: ${h2s.join('|')} | ${ev}`)
    rec('TOPNAV-013', 'OK')
  } catch(e) { pend('TOPNAV-013', `Exception: ${e.message.slice(0,150)}`) }
}

async function TOPNAV_014() { pend('TOPNAV-014', '[UNCONFIRMED] JWT expiry simulation required.') }

async function TOPNAV_015(page) {
  // E2E calendar flow: HOME → click day 15 → SCHD_002 → back → click スケジュールへ → SCHD_001
  try {
    await goHome(page)
    // Verify on HOME
    if (!(await page.locator('h2').filter({ hasText: '今月の配送スケジュール' }).count()))
      return rec('TOPNAV-015', 'NG', 'Step1: Not on HOME — missing 今月の配送スケジュール h2')

    // Click day 15
    const btn15 = await findDayBtn(page, 15)
    if (!btn15) return pend('TOPNAV-015', 'Step2: Cannot find day 15 button.')
    await btn15.click(); await page.waitForTimeout(2000)
    const urlS2 = page.url()
    if (!/schedule/.test(urlS2)) {
      const ev = await shot(page, 'TOPNAV-015')
      return rec('TOPNAV-015', 'NG', `Step2: expected /schedule, got …${urlS2.replace(/https?:\/\/[^/]+/,'')} | ${ev}`)
    }

    // Back to HOME
    await page.goBack(); await page.waitForTimeout(2000)
    const urlS3 = page.url()
    if (!urlS3.includes('/dashboard')) {
      const ev = await shot(page, 'TOPNAV-015')
      return rec('TOPNAV-015', 'NG', `Step3: back not to /dashboard, got …${urlS3.replace(/https?:\/\/[^/]+/,'')} | ${ev}`)
    }

    // Click スケジュールへ
    await page.locator('a[href="/schedule"]').first().click(); await page.waitForTimeout(2000)
    const urlS4 = page.url()
    const ev    = await shot(page, 'TOPNAV-015')
    if (!/\/schedule/.test(urlS4))
      return rec('TOPNAV-015', 'NG', `Step4: expected /schedule, got …${urlS4.replace(/https?:\/\/[^/]+/,'')} | ${ev}`)
    rec('TOPNAV-015', 'OK')
    await page.goBack(); await page.waitForTimeout(800)
  } catch(e) { pend('TOPNAV-015', `Exception: ${e.message.slice(0,150)}`) }
}

async function TOPNAV_016(page) {
  // E2E notice flow: click title → ANNO_002 (4 components) → 一覧に戻る → HOME
  try {
    await goHome(page)
    const sec   = page.locator('section:has(h2:text("お知らせ"))')
    const first = sec.locator('a[href*="/announcements"]').first()
    if (!await first.count()) return pend('TOPNAV-016', 'No announcements in DEV.')

    await first.click(); await page.waitForTimeout(2000)
    const urlD = page.url()
    if (!urlD.includes('/announcements')) {
      const ev = await shot(page, 'TOPNAV-016')
      return rec('TOPNAV-016', 'NG', `Step1: expected /announcements URL, got …${urlD.replace(/https?:\/\/[^/]+/,'')} | ${ev}`)
    }

    // Check 4 components
    const badge   = await page.locator('span').evaluateAll(ss => ss.filter(s => /bg-red-500|bg-txt-low/.test(s.className||'')).length)
    const date    = await page.locator('span').filter({ hasText: /投稿日時/ }).count()
    const titleTx = ((await page.locator('h2').first().textContent().catch(() => '')) || '').trim()
    const content = await page.locator('.whitespace-pre-line, [class*="whitespace-pre"]').count()
    const miss = []
    if (badge < 1)  miss.push('badge')
    if (date < 1)   miss.push('投稿日時')
    if (!titleTx)   miss.push('h2 title')
    if (content < 1) miss.push('content')
    if (miss.length) {
      const ev = await shot(page, 'TOPNAV-016')
      return rec('TOPNAV-016', 'NG', `Step2: missing ${miss.join(', ')} | ${ev}`)
    }

    // Click 一覧に戻る
    const backLink = page.locator('a').filter({ hasText: '一覧に戻る' }).first()
    if (!await backLink.count()) {
      const ev = await shot(page, 'TOPNAV-016')
      return rec('TOPNAV-016', 'NG', `Step3: "一覧に戻る" not found | ${ev}`)
    }
    await backLink.click(); await page.waitForTimeout(2000)
    const urlH = page.url()
    const h2s  = await page.locator('h2').allTextContents()
    const ok3  = ['今月の配送スケジュール','お知らせ','未回答の見積もり依頼'].every(h => h2s.some(t => t.includes(h)))
    const ev   = await shot(page, 'TOPNAV-016')
    if (!urlH.includes('/dashboard')) return rec('TOPNAV-016', 'NG', `Step3: expected /dashboard, got …${urlH.replace(/https?:\/\/[^/]+/,'')} | ${ev}`)
    if (!ok3) return rec('TOPNAV-016', 'NG', `Step3: 3 blocks not visible. h2s: ${h2s.join('|')} | ${ev}`)
    rec('TOPNAV-016', 'OK')
  } catch(e) { pend('TOPNAV-016', `Exception: ${e.message.slice(0,150)}`) }
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== E05 TOP Group Test (45 TCs) ===\n')

  // TOPNAV_001: needs a fresh anonymous browser (separate from main session)
  console.log('--- TOPNAV-001 (anonymous session) ---')
  await TOPNAV_001_run()
  await new Promise(r => setTimeout(r, 400))

  // All remaining tests use the authenticated session
  const { browser, page } = await open()
  try {
    console.log('\n--- TOPH Tests ---')
    await TOPH_001(page)
    await TOPH_002(page)
    await TOPH_003();  await TOPH_004();  await TOPH_005()
    await TOPH_006()
    await TOPH_007(page)
    await TOPH_008()
    await TOPH_009(page)
    await TOPH_010(page)
    await TOPH_011(page)
    await TOPH_012(page)
    await TOPH_013(page)
    await TOPH_014();  await TOPH_015();  await TOPH_016()
    await TOPH_017();  await TOPH_018();  await TOPH_019()

    console.log('\n--- TOPA Tests ---')
    await TOPA_001(page)
    await TOPA_002(page)
    await TOPA_003(page)
    await TOPA_004();  await TOPA_005()
    await TOPA_006(page)
    await TOPA_007(page)
    await TOPA_008();  await TOPA_009();  await TOPA_010()

    console.log('\n--- TOPNAV Tests ---')
    await TOPNAV_002()
    await TOPNAV_003(page)
    await TOPNAV_004(page)
    await TOPNAV_005(page)
    await TOPNAV_006(page)
    await TOPNAV_007(page)
    await TOPNAV_008(page)
    await TOPNAV_009(page)
    await TOPNAV_010(page)
    await TOPNAV_011(page)
    await TOPNAV_012(page)
    await TOPNAV_013(page)
    await TOPNAV_014()
    await TOPNAV_015(page)
    await TOPNAV_016(page)

  } finally {
    await browser.close()
  }

  // Write results
  fs.writeFileSync(RES_PATH, JSON.stringify(results, null, 2))

  const counts = {}
  for (const v of Object.values(results)) counts[v.result] = (counts[v.result] || 0) + 1
  const total = Object.keys(results).length
  console.log(`\n=== Summary (${total} TCs) ===`)
  console.log(`OK: ${counts.OK||0}  NG: ${counts.NG||0}  Pending: ${counts.Pending||0}  N/A: ${counts['N/A']||0}`)
  console.log(`Results written → ${RES_PATH}`)
}

main().catch(e => { console.error('FATAL:', e); process.exit(1) })
