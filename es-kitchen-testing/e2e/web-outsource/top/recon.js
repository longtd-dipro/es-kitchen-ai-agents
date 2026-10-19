// Recon script for E05 HOME (OW_HOME_001) + ANNO (OW_ANNO_002)
// Run: node e2e/web-outsource/top/recon.js (from es-kitchen-testing root)
'use strict'
const { open } = require('../_helpers/session.js')
const path = require('path')
const fs = require('fs')

const SHOT = path.resolve(__dirname, '../../../reports/e05/top')
fs.mkdirSync(SHOT, { recursive: true })

async function snap(page, name, sel) {
  const p = path.join(SHOT, `recon_${name}.png`)
  if (sel) {
    try {
      const el = page.locator(sel).first()
      await el.screenshot({ path: p }).catch(() => page.screenshot({ path: p, fullPage: true }))
    } catch { await page.screenshot({ path: p, fullPage: true }) }
  } else {
    await page.screenshot({ path: p, fullPage: true })
  }
  return p
}

async function main() {
  const { browser, page } = await open()
  const out = {}

  try {
    // 1. Check current URL
    const url = page.url()
    out.currentUrl = url.replace(/https?:\/\/[^/]+/, 'HOST')

    // 2. Screenshot full home
    await snap(page, '01_home_full', null)

    // 3. Check page title / heading
    const titles = await page.locator('h1,h2,h3,h4,.card-title,[class*="title"],[class*="heading"]').allTextContents()
    out.headings = titles.slice(0, 20)

    // 4. Check sidebar items
    const sidebar = await page.locator('nav, [class*="sidebar"], [class*="menu"], [class*="sider"]').first()
    let sidebarItems = []
    try {
      sidebarItems = await sidebar.locator('a, [role="menuitem"], li').allTextContents()
    } catch {}
    out.sidebarItems = sidebarItems.slice(0, 15).map(t => t.trim()).filter(Boolean)

    // 5. Check 3 block headings (calendar, notice, estimate)
    out.allText_headings = await page.locator('[class*="card"], [class*="block"], [class*="section"]').allTextContents().then(a => a.slice(0, 5).map(t => t.slice(0, 100)))

    // 6. Check calendar cells
    const calendarCells = await page.locator('table td, [class*="calendar"] [class*="cell"], [class*="day"]').count()
    out.calendarCellCount = calendarCells

    // 7. Check if お知らせ (notification list) exists
    const noticeItems = await page.locator('[class*="notice"], [class*="announcement"], [class*="news"]').count()
    out.noticeCount = noticeItems

    // 8. Screenshot notifications section
    await snap(page, '02_notifications', '[class*="notice"], [class*="announcement"]')

    // 9. Check for スケジュールへ link
    const schedLink = await page.locator('a').filter({ hasText: 'スケジュールへ' }).count()
    out.schedLinkExists = schedLink > 0

    // 10. Check all links on page
    const links = await page.locator('a').allTextContents()
    out.allLinks = links.slice(0, 30).map(t => t.trim()).filter(Boolean)

    // 11. Check notification titles (clickable)
    const noticeTitles = await page.locator('a[href*="notice"], a[href*="announcement"], a[href*="news"], [class*="notice"] a, [class*="announce"] a').allTextContents()
    out.noticeTitleLinks = noticeTitles.slice(0, 10)

    // 12. Try clicking first notification
    let annoUrl = null
    try {
      const firstNoticeLink = page.locator('[class*="notice"] a, [class*="announce"] a, [class*="news"] a').first()
      const count = await firstNoticeLink.count()
      if (count > 0) {
        await firstNoticeLink.click()
        await page.waitForTimeout(2000)
        annoUrl = page.url().replace(/https?:\/\/[^/]+/, 'HOST')
        await snap(page, '03_anno_detail', null)
        out.annoUrl = annoUrl

        // Check anno detail page content
        const annoContent = await page.locator('h1,h2,h3,[class*="title"],[class*="heading"]').allTextContents()
        out.annoHeadings = annoContent.slice(0, 10)

        const backLink = await page.locator('a:has-text("一覧に戻る"), text=一覧に戻る').count()
        out.backLinkExists = backLink > 0

        // Go back
        await page.goBack()
        await page.waitForTimeout(1500)
      }
    } catch(e) {
      out.noticeClickError = e.message
    }

    // 13. Try schedule navigation
    try {
      const schedBtn = page.locator('a').filter({ hasText: 'スケジュールへ' }).first()
      const cnt = await schedBtn.count()
      if (cnt > 0) {
        await schedBtn.click()
        await page.waitForTimeout(2000)
        out.schedUrl = page.url().replace(/https?:\/\/[^/]+/, 'HOST')
        await snap(page, '04_schedule', null)
        await page.goBack()
        await page.waitForTimeout(1500)
      }
    } catch(e) {
      out.schedError = e.message
    }

    // 14. Try clicking calendar cell
    try {
      // Find a specific day cell (e.g. day 15)
      const dayCells = await page.locator('table td, [class*="calendar"] [class*="cell"]').all()
      out.calendarCellSample = await Promise.all(dayCells.slice(0, 5).map(c => c.textContent().then(t => t?.slice(0,50))))
    } catch(e) {
      out.calendarError = e.message
    }

    // 15. Check today marker
    const todayMarkers = await page.locator('[class*="today"], [class*="current-day"]').count()
    out.todayMarkerCount = todayMarkers

    // 16. DOM structure snapshot (key classes)
    const bodyHTML = await page.locator('body').innerHTML()
    const classMatches = bodyHTML.match(/class="[^"]*"/g) || []
    const uniqueClasses = [...new Set(classMatches)].slice(0, 40)
    out.uniqueClasses = uniqueClasses

    // 17. Check for badge elements
    const badges = await page.locator('[class*="badge"], [class*="tag"], [class*="chip"]').allTextContents()
    out.badges = badges.slice(0, 20).map(t => t.trim()).filter(Boolean)

    // 18. Sidebar - check active state
    try {
      const activeItem = await page.locator('[class*="active"], [aria-current="page"]').allTextContents()
      out.activeItems = activeItem.slice(0, 5)
    } catch {}

  } finally {
    await browser.close()
  }

  fs.writeFileSync(path.join(SHOT, 'recon_result.json'), JSON.stringify(out, null, 2))
  console.log('=== RECON RESULT ===')
  console.log(JSON.stringify(out, null, 2))
}

main().catch(e => { console.error(e); process.exit(1) })
