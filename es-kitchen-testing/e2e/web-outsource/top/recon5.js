// Recon5 — check week labels, today border, holiday bar, and sidebar navigation
'use strict'
const { open } = require('../_helpers/session.js')
const path = require('path')
const fs = require('fs')
const SHOT = path.resolve(__dirname, '../../../reports/e05/top')

async function main() {
  const { browser, page } = await open()
  const out = {}
  try {
    await page.waitForTimeout(1500)
    const schedSection = page.locator('section:has(h2:text("今月の配送スケジュール"))')

    // Get ALL buttons with full class and innerHTML
    const buttons = await schedSection.locator('button').all()
    out.buttonCount = buttons.length
    const allButtonData = []
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent()
      const cls = await buttons[i].getAttribute('class')
      const innerHTML = await buttons[i].innerHTML()
      allButtonData.push({
        text: text?.trim().slice(0, 80),
        cls: cls,
        innerHTML: innerHTML.slice(0, 400)
      })
    }
    out.allButtonData = allButtonData

    // Look for week label badges (A/B/C/D)
    const weekBadges = await page.locator('span').evaluateAll(els =>
      els.filter(e => ['A', 'B', 'C', 'D'].includes(e.textContent?.trim() || ''))
        .map(e => ({ text: e.textContent?.trim(), cls: e.getAttribute('class') }))
    )
    out.weekBadges = weekBadges

    // Look for holiday bar (red horizontal bar)
    const redBars = await page.locator('[class*="bg-red"], [class*="red-"], [style*="background"]').evaluateAll(els =>
      els.filter(e => e.className.includes('red') || e.className.includes('holiday'))
        .map(e => ({ cls: e.className.slice(0, 100), text: e.textContent?.trim().slice(0, 30) }))
    )
    out.redBars = redBars.slice(0, 10)

    // Check today's button border class
    for (const btn of allButtonData) {
      if (btn.text?.startsWith('9') || btn.cls?.includes('border-primary')) {
        out.todayBtn = btn
        break
      }
    }

    // Check if any button has "ring" or special border for today
    const primaryBorder = await schedSection.locator('[class*="border-primary"]').count()
    out.primaryBorderCount = primaryBorder

    // Look for badge labels in cells
    const badgeSpans = await schedSection.locator('span').evaluateAll(els =>
      els.map(e => ({ text: e.textContent?.trim().slice(0, 30), cls: e.className?.slice(0, 80) }))
        .filter(e => e.text && e.text.length < 15)
    )
    out.badgeSpans = badgeSpans.slice(0, 30)

    // Try sidebar navigation to find URLs
    const sidebarItems = [
      { text: '配送管理', nameCheck: 'delivery/orders' },
      { text: '集金・駐車', nameCheck: 'collection/payment' },
      { text: '配送スタッフ', nameCheck: 'staff/driver' },
      { text: 'プロフィール', nameCheck: 'profile' },
    ]

    for (const item of sidebarItems) {
      const menuItem = page.locator('.ant-menu-item').filter({ hasText: item.text }).first()
      const cnt = await menuItem.count()
      if (cnt > 0) {
        await menuItem.click()
        await page.waitForTimeout(1500)
        out[`nav_${item.text}`] = page.url().replace(/https?:\/\/[^/]+/, 'HOST')
        await page.goBack()
        await page.waitForTimeout(1000)
      }
    }

    // Check scroll for お知らせ section
    const noticeSection = page.locator('section:has(h2:text("お知らせ"))')
    const noticeHTML = await noticeSection.innerHTML()
    out.noticeSectionPartial = noticeHTML.slice(0, 200)

    // Check estimate section
    const estimateSection = page.locator('section:has(h2:text("未回答の見積もり依頼"))')
    const estimateText = await estimateSection.textContent()
    out.estimateText = estimateText?.trim()

    // Check no horizontal scrollbar
    const noHScroll = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 5)
    out.noHScroll = noHScroll

  } finally {
    await browser.close()
  }

  fs.writeFileSync(path.join(SHOT, 'recon5_result.json'), JSON.stringify(out, null, 2))
  console.log('=== RECON5 ===')
  console.log(JSON.stringify(out, null, 2))
}

main().catch(e => { console.error(e); process.exit(1) })
