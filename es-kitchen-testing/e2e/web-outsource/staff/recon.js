// Recon script — explore 配送スタッフ (staff) pages to discover actual URLs and selectors
const { open } = require('../_helpers/session.js')
const path = require('path')
const fs = require('fs')

const REPORTS = path.resolve(__dirname, '../../../../reports/e05/staff')
fs.mkdirSync(REPORTS, { recursive: true })

async function recon() {
  const { browser, page } = await open()
  try {
    // Step 1: Take screenshot of dashboard to see sidebar
    await page.screenshot({ path: path.join(REPORTS, 'recon_01_dashboard.png'), fullPage: true })
    console.log('--- Dashboard URL:', page.url())

    // Step 2: Find 配送スタッフ in sidebar and click it
    const staffLink = page.getByRole('link', { name: /配送スタッフ/ }).first()
    const staffLinkVisible = await staffLink.isVisible().catch(() => false)
    console.log('Staff link visible:', staffLinkVisible)

    if (staffLinkVisible) {
      await staffLink.click()
      await page.waitForTimeout(2000)
    } else {
      // Try to find it by text
      const staffText = page.getByText('配送スタッフ').first()
      const staffTextVisible = await staffText.isVisible().catch(() => false)
      console.log('Staff text visible:', staffTextVisible)
      if (staffTextVisible) {
        await staffText.click()
        await page.waitForTimeout(2000)
      }
    }

    console.log('--- After click staff URL:', page.url())
    await page.screenshot({ path: path.join(REPORTS, 'recon_02_staff_list.png'), fullPage: true })

    // Step 3: Get page title and key elements
    const title = await page.title()
    console.log('Page title:', title)

    // Check for key elements on staff list page
    const elements = {
      'H1 text': await page.locator('h1').first().textContent().catch(() => 'N/A'),
      'Page heading': await page.locator('[class*="title"], [class*="heading"], h2, h3').first().textContent().catch(() => 'N/A'),
    }
    console.log('Elements:', JSON.stringify(elements, null, 2))

    // Check for buttons in header area
    const buttons = await page.getByRole('button').allTextContents().catch(() => [])
    console.log('Buttons on page:', buttons.slice(0, 20))

    // Check all links with href
    const links = await page.locator('a[href]').evaluateAll(els =>
      els.slice(0, 10).map(el => ({ text: el.textContent?.trim(), href: el.getAttribute('href') }))
    ).catch(() => [])
    console.log('Links:', JSON.stringify(links, null, 2))

    // Check sidebar links
    const sidebarLinks = await page.locator('nav a, aside a, [class*="sidebar"] a, [class*="menu"] a').evaluateAll(
      els => els.map(el => ({ text: el.textContent?.trim(), href: el.getAttribute('href') }))
    ).catch(() => [])
    console.log('Sidebar links:', JSON.stringify(sidebarLinks, null, 2))

    // Step 4: Current URL analysis
    const currentUrl = page.url()
    console.log('Current staff list URL:', currentUrl)

    // Try clicking first row link (staff name)
    const firstStaffLink = page.locator('table tbody tr:first-child td a').first()
    const firstStaffLinkVisible = await firstStaffLink.isVisible().catch(() => false)
    console.log('First staff link visible:', firstStaffLinkVisible)

    if (firstStaffLinkVisible) {
      const staffName = await firstStaffLink.textContent().catch(() => 'N/A')
      console.log('First staff name:', staffName)
      await firstStaffLink.click()
      await page.waitForTimeout(2000)
      console.log('--- Detail URL:', page.url())
      await page.screenshot({ path: path.join(REPORTS, 'recon_03_staff_detail.png'), fullPage: true })

      // Check detail page elements
      const detailButtons = await page.getByRole('button').allTextContents().catch(() => [])
      console.log('Detail page buttons:', detailButtons)

      // Check tabs
      const tabs = await page.locator('[role="tab"]').allTextContents().catch(() => [])
      console.log('Tabs:', tabs)

      await page.goBack()
      await page.waitForTimeout(1000)
    }

    // Step 5: Check for new registration button (＋新規登録)
    const newRegBtn = page.getByRole('button', { name: /新規登録|登録/ }).first()
    const newRegVisible = await newRegBtn.isVisible().catch(() => false)
    console.log('New registration button visible:', newRegVisible)

    // Step 6: Check search area elements
    const searchInputs = await page.locator('input[type="text"], input[type="search"]').count().catch(() => 0)
    console.log('Search inputs count:', searchInputs)

    const selects = await page.locator('select, [role="combobox"]').count().catch(() => 0)
    console.log('Select/combobox count:', selects)

    // Get full page HTML structure (compressed)
    const bodyText = await page.locator('body').textContent().catch(() => '')
    console.log('Body text (first 500):', bodyText.replace(/\s+/g, ' ').substring(0, 500))

    // Step 7: Try to go to new registration page directly
    await page.screenshot({ path: path.join(REPORTS, 'recon_04_staff_list_final.png'), fullPage: true })

    // Check table structure
    const tableHeaders = await page.locator('table thead th, table thead td').allTextContents().catch(() => [])
    console.log('Table headers:', tableHeaders)

    const tableRows = await page.locator('table tbody tr').count().catch(() => 0)
    console.log('Table rows count:', tableRows)

  } catch (e) {
    console.error('Error:', e.message)
    await page.screenshot({ path: path.join(REPORTS, 'recon_error.png'), fullPage: true })
  } finally {
    await browser.close()
  }
}

recon().catch(console.error)
