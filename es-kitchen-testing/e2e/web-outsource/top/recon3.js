// Recon3 — target calendar cells and notice links
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

    // Get full main content HTML to understand structure
    const mainHTML = await page.locator('.ant-layout-content').innerHTML()
    out.mainHTML_2000 = mainHTML.slice(0, 3000)

    // Calendar grid cells (grid-cols-7)
    const calCells = await page.locator('.grid.grid-cols-7 > div').all()
    out.calCellCount = calCells.length
    const calCellsData = []
    for (let i = 0; i < Math.min(calCells.length, 15); i++) {
      const text = await calCells[i].textContent()
      const cls = await calCells[i].getAttribute('class')
      calCellsData.push({ text: text?.slice(0, 80).trim(), cls: cls?.slice(0, 100) })
    }
    out.calCellsData = calCellsData

    // All links with href
    const allLinks = await page.locator('a').evaluateAll(els =>
      els.map(e => ({ text: e.textContent?.trim().slice(0,60), href: e.getAttribute('href') }))
        .filter(l => l.href || l.text)
    )
    out.allLinksWithHref = allLinks

    // Notice/announcement list - try to get items
    const noticeSection = await page.locator('section').all()
    for (let i = 0; i < noticeSection.length; i++) {
      const h2 = await noticeSection[i].locator('h2').textContent().catch(() => '')
      const links = await noticeSection[i].locator('a').evaluateAll(els =>
        els.map(e => ({ text: e.textContent?.trim().slice(0,80), href: e.getAttribute('href') }))
      )
      out[`section_${i}_h2`] = h2?.trim()
      out[`section_${i}_links`] = links
    }

    // Check today cell
    const todayCell = await page.locator('[class*="today"], [class*="current-day"], [class*="border-blue"], [class*="border-green"]').count()
    out.todayCellCount = todayCell

    // Check all div with border class for today indicator
    const greenBorder = await page.locator('[class*="border-green"], [class*="ring-green"], [class*="outline-green"]').count()
    out.greenBorderCount = greenBorder

    // Dump full second section (お知らせ)
    if (noticeSection.length >= 2) {
      const html = await noticeSection[1].innerHTML()
      out.noticeSectionHTML = html.slice(0, 2000)
    }

    // Notification items - check all list-like elements in section
    const lis = await page.locator('li').all()
    const liTexts = []
    for (const li of lis.slice(0, 10)) {
      const t = await li.textContent()
      const cls = await li.getAttribute('class')
      liTexts.push({ text: t?.slice(0, 100), cls: cls?.slice(0, 60) })
    }
    out.listItems = liTexts

    // Find the notice detail URL by checking link hrefs
    const noticeDetailLinks = allLinks.filter(l => l.href && l.href.includes('notice') ||
      (l.href && (l.href.includes('announcement') || l.href.includes('news'))))
    out.noticeDetailLinks = noticeDetailLinks

    // Get section with お知らせ heading
    const noticeSectionEl = await page.locator('section:has(h2:text("お知らせ"))').first()
    const noticeSectionHTML = await noticeSectionEl.innerHTML().catch(() => 'NOT FOUND')
    out.noticeSectionHTMLFull = noticeSectionHTML.slice(0, 3000)

    // Take screenshot after identifying structure
    await page.screenshot({ path: path.join(SHOT, 'recon3_home.png'), fullPage: true })

  } finally {
    await browser.close()
  }

  fs.writeFileSync(path.join(SHOT, 'recon3_result.json'), JSON.stringify(out, null, 2))
  console.log('=== RECON3 ===')
  console.log(JSON.stringify(out, null, 2))
}

main().catch(e => { console.error(e); process.exit(1) })
