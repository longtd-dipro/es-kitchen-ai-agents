// Recon4 — announcement detail + calendar cells structure
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

    // 1. Calendar buttons - get all buttons (day cells)
    const buttons = await page.locator('.grid.grid-cols-7 + .grid.grid-cols-7 button, section:has(h2:text("今月の配送スケジュール")) button').all()
    out.buttonCount = buttons.length
    const buttonData = []
    for (let i = 0; i < Math.min(buttons.length, 10); i++) {
      const text = await buttons[i].textContent()
      const cls = await buttons[i].getAttribute('class')
      const innerHTML = await buttons[i].innerHTML()
      buttonData.push({ text: text?.slice(0,120).trim(), cls: cls?.slice(0,150), innerHTML: innerHTML?.slice(0,300) })
    }
    out.buttonData = buttonData

    // 2. Find all button grids in the schedule section
    const schedSection = page.locator('section:has(h2:text("今月の配送スケジュール"))')
    const allGrids = await schedSection.locator('.grid.grid-cols-7').count()
    out.gridCount = allGrids

    // Get all grid divs
    for (let g = 0; g < Math.min(allGrids, 3); g++) {
      const grid = schedSection.locator('.grid.grid-cols-7').nth(g)
      const children = await grid.locator('> *').all()
      const items = []
      for (let j = 0; j < Math.min(children.length, 8); j++) {
        const t = await children[j].textContent()
        const cls = await children[j].getAttribute('class')
        items.push({ t: t?.slice(0,60).trim(), cls: cls?.slice(0,60) })
      }
      out[`grid_${g}`] = items
    }

    // 3. Navigate to announcement detail
    await page.goto('/announcements/91432')
    await page.waitForTimeout(2000)
    out.annoDetailUrl = page.url().replace(/https?:\/\/[^/]+/, 'HOST')
    await page.screenshot({ path: path.join(SHOT, 'recon4_anno_detail.png'), fullPage: true })

    // Check detail page structure
    const detailHTML = await page.locator('.ant-layout-content').innerHTML().catch(() => '')
    out.annoDetailHTML = detailHTML.slice(0, 3000)

    const h1 = await page.locator('h1').allTextContents()
    const h2 = await page.locator('h2').allTextContents()
    out.annoDetailH1 = h1
    out.annoDetailH2 = h2

    const bodyText = await page.locator('body').textContent()
    out.annoDetailBodyText = bodyText?.slice(0, 1000)

    // Check for 一覧に戻る
    const backLinks = await page.locator('a').filter({ hasText: '一覧に戻る' }).count()
    out.backLinkCount = backLinks

    // Badges
    const badges = await page.locator('[class*="badge"], .ant-tag, [class*="tag"], span[class*="bg-"]').allTextContents()
    out.annoDetailBadges = badges.slice(0, 10)

    // Date format
    const dateEls = await page.locator('[class*="date"], [class*="time"], [class*="posted"], span').allTextContents()
    // Filter for date-like patterns
    const datePatterns = dateEls.filter(t => /\d{4}年|\d+日前|今日|昨日/.test(t))
    out.datePatterns = datePatterns.slice(0, 10)

    // Links
    const allLinks = await page.locator('a').evaluateAll(els => els.map(e => ({ text: e.textContent?.trim().slice(0,60), href: e.getAttribute('href') })))
    out.annoDetailLinks = allLinks

    // Back to home
    await page.goto('/dashboard')
    await page.waitForTimeout(1500)

    // 4. Try clicking a calendar cell (day 9 = today based on date 2026-10-09)
    const calSection = page.locator('section:has(h2:text("今月の配送スケジュール"))')
    const dayButtons = await calSection.locator('button').all()
    const todayButton = dayButtons.find ? null : null
    // Try to find button with today's date (Oct 9)
    let foundToday = false
    for (const btn of dayButtons) {
      const text = await btn.textContent()
      if (text?.includes('9') && !text?.includes('19') && !text?.includes('29')) {
        const cls = await btn.getAttribute('class')
        // Check if it has border indicator for today
        out.day9ButtonClass = cls?.slice(0, 200)
        out.day9ButtonText = text?.trim().slice(0, 100)
        if (!foundToday) {
          await btn.click()
          await page.waitForTimeout(2000)
          out.day9ClickUrl = page.url().replace(/https?:\/\/[^/]+/, 'HOST')
          await page.screenshot({ path: path.join(SHOT, 'recon4_after_day_click.png'), fullPage: true })
          await page.goBack()
          await page.waitForTimeout(1500)
          foundToday = true
        }
        break
      }
    }

    // 5. Check sidebar navigation
    const menuItems = await page.locator('.ant-menu-item').all()
    for (const item of menuItems) {
      const text = await item.textContent()
      if (text?.includes('スケジュール') && !text?.includes('ホーム')) {
        await item.click()
        await page.waitForTimeout(2000)
        out.schedNavUrl = page.url().replace(/https?:\/\/[^/]+/, 'HOST')
        await page.goBack()
        await page.waitForTimeout(1500)
        break
      }
    }

  } finally {
    await browser.close()
  }

  fs.writeFileSync(path.join(SHOT, 'recon4_result.json'), JSON.stringify(out, null, 2))
  console.log('=== RECON4 ===')
  console.log(JSON.stringify(out, null, 2))
}

main().catch(e => { console.error(e); process.exit(1) })
