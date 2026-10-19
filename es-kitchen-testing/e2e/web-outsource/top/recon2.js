// Recon2 — deep explore of HOME structure
'use strict'
const { open } = require('../_helpers/session.js')
const path = require('path')
const fs = require('fs')
const SHOT = path.resolve(__dirname, '../../../reports/e05/top')

async function main() {
  const { browser, page } = await open()
  const out = {}
  try {
    await page.waitForTimeout(2000)
    await page.screenshot({ path: path.join(SHOT, 'recon2_01_full.png'), fullPage: true })

    // Sidebar items (ant-menu)
    const menuItems = await page.locator('.ant-menu-item, .ant-menu-submenu-title').allTextContents()
    out.menuItems = menuItems.map(t => t.trim()).filter(Boolean)

    // Active sidebar
    const activeMenu = await page.locator('.ant-menu-item-selected').textContent().catch(() => '')
    out.activeMenu = activeMenu?.trim()

    // Headings (h1, h2, h3, text with certain font sizes)
    const h1 = await page.locator('h1').allTextContents()
    const h2 = await page.locator('h2').allTextContents()
    const h3 = await page.locator('h3').allTextContents()
    out.h1 = h1; out.h2 = h2; out.h3 = h3

    // Breadcrumb
    const bc = await page.locator('.ant-breadcrumb').textContent().catch(() => '')
    out.breadcrumb = bc?.trim()

    // Full page text content (truncated)
    const body = await page.locator('body').textContent()
    out.bodyText = body?.slice(0, 3000)

    // Calendar-like grid (table or custom)
    const tables = await page.locator('table').count()
    out.tables = tables
    if (tables > 0) {
      const tableHTML = await page.locator('table').first().innerHTML()
      out.tableHTML_first200 = tableHTML.slice(0, 500)
    }

    // Check specific JP labels
    for (const label of ['今月の配送スケジュール', 'お知らせ', '未回答の見積もり依頼', 'スケジュールへ', '一覧に戻る']) {
      const cnt = await page.getByText(label, { exact: true }).count()
      out[`label_exact_${label}`] = cnt
      // Also try partial
      const cntP = await page.locator(`text=${label}`).count()
      out[`label_partial_${label}`] = cntP
    }

    // Notification section
    const annoSection = await page.locator('[class*="announce"], [class*="notice"]').count()
    out.annoSectionCount = annoSection

    // All cards / panels
    const cards = await page.locator('.ant-card, [class*="card"]').count()
    out.cardCount = cards
    const cardTitles = await page.locator('.ant-card-head-title, [class*="card-title"], [class*="cardTitle"]').allTextContents()
    out.cardTitles = cardTitles

    // Check for calendar
    const calGrid = await page.locator('[class*="calendar"], [class*="Calendar"]').count()
    out.calGridCount = calGrid
    const calGridHTML = await page.locator('[class*="calendar"], [class*="Calendar"]').first().innerHTML().catch(() => '')
    out.calGridHTML_300 = calGridHTML.slice(0, 500)

    // Check notification items
    const noticeLinkHrefs = await page.locator('[class*="announce"] a, [class*="notice"] a').evaluateAll(els => els.map(e => ({ text: e.textContent?.slice(0,80), href: e.getAttribute('href') })))
    out.noticeLinkHrefs = noticeLinkHrefs.slice(0, 10)

    // Direct page innerHTML (limited)
    const mainContent = await page.locator('.ant-layout-content').innerHTML().catch(() => '')
    out.mainContentHTML_500 = mainContent.slice(0, 1000)

    // Check for schedule section with スケジュールへ
    const schedLinkHref = await page.locator('a').filter({ hasText: 'スケジュールへ' }).first().getAttribute('href').catch(() => null)
    out.schedLinkHref = schedLinkHref

    // Check 見積もり一覧へ link
    const estimateLinkHref = await page.locator('a').filter({ hasText: '見積もり一覧へ' }).first().getAttribute('href').catch(() => null)
    out.estimateLinkHref = estimateLinkHref

    // Screenshot specific sections
    await page.screenshot({ path: path.join(SHOT, 'recon2_02_full.png'), fullPage: true })

    // Try clicking a notification to go to detail
    const noticeLinks = await page.locator('[class*="announce"] a, [class*="notice"] a').all()
    if (noticeLinks.length > 0) {
      const firstHref = await noticeLinks[0].getAttribute('href')
      out.firstNoticeHref = firstHref
      await noticeLinks[0].click()
      await page.waitForTimeout(2000)
      out.annoDetailUrl = page.url().replace(/https?:\/\/[^/]+/, 'HOST')
      await page.screenshot({ path: path.join(SHOT, 'recon2_03_anno_detail.png'), fullPage: true })

      // Detail page structure
      const detailBody = await page.locator('body').textContent()
      out.annoDetailBodyText = detailBody?.slice(0, 1000)

      // Check for 一覧に戻る
      const backLinkCnt = await page.locator('a').filter({ hasText: '一覧に戻る' }).count()
      out.backLinkCount = backLinkCnt

      // Badge on detail
      const badges = await page.locator('[class*="badge"], [class*="tag"], [class*="chip"], .ant-tag, .ant-badge').allTextContents()
      out.annoDetailBadges = badges.slice(0, 10)

      // Date format
      const dateTexts = await page.locator('[class*="date"], [class*="time"], [class*="posted"]').allTextContents()
      out.annoDetailDates = dateTexts.slice(0, 5)

      // Go back
      await page.goBack()
      await page.waitForTimeout(1500)
    }

    // Check sidebar items with hrefs
    const sidebarLinks = await page.locator('.ant-menu-item a, .ant-menu-item').evaluateAll(els =>
      els.map(e => ({ text: e.textContent?.trim().slice(0,30), href: e.querySelector('a')?.getAttribute('href') || null }))
    )
    out.sidebarLinks = sidebarLinks.filter(l => l.text)

    // Check today highlighted cell
    const todayCells = await page.locator('[class*="today"], [class*="current"]').count()
    out.todayCellCount = todayCells

  } finally {
    await browser.close()
  }

  fs.writeFileSync(path.join(SHOT, 'recon2_result.json'), JSON.stringify(out, null, 2))
  console.log('=== RECON2 RESULT ===')
  console.log(JSON.stringify(out, null, 2))
}

main().catch(e => { console.error(e); process.exit(1) })
