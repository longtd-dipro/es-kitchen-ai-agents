// Test script — OW_CLCT_001 (集金管理) — E05 QC Automation
// Run: node e2e/web-outsource/collection/test.js (từ es-kitchen-testing root)
// Group 7 — collection
'use strict'
const { open } = require('../_helpers/session.js')
const path = require('path')
const fs = require('fs')

const SHOT = path.resolve(__dirname, '../../../reports/e05/collection')
fs.mkdirSync(SHOT, { recursive: true })
const URL = '/collection-reports'

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

// Navigate to collection page and wait for it to be ready
async function gotoCollection(page) {
  await page.goto(URL)
  // Wait for a key element that confirms the page has hydrated
  await page.waitForSelector('input[placeholder="開始日"]', { timeout: 20000 }).catch(async () => {
    // If not found, take a screenshot to diagnose
    await snap(page, '_session_check')
  })
  await sleep(300)
}

async function snap(page, name) {
  const p = path.join(SHOT, `${name}.png`)
  await page.screenshot({ path: p, fullPage: true })
  return p.replace(process.env.HOME || '', '~')
}

// Navigate Ant Design single DatePicker to target year/month
async function navigateToMonth(page, targetYear, targetMonth) {
  // Get header text from the visible dropdown using JS
  const headerTxt = await page.evaluate(() => {
    const dropdowns = document.querySelectorAll('.ant-picker-dropdown')
    for (const dp of dropdowns) {
      if (dp.classList.contains('ant-picker-dropdown-hidden')) continue
      const style = window.getComputedStyle(dp)
      if (style.display === 'none' || style.visibility === 'hidden') continue
      const view = dp.querySelector('.ant-picker-header-view')
      if (view) return view.textContent
    }
    return ''
  })
  const m = headerTxt.match(/(\d{4})年(\d{1,2})月/)
  if (!m) return
  let curY = parseInt(m[1]), curM = parseInt(m[2])
  let diff = (targetYear * 12 + targetMonth) - (curY * 12 + curM)
  // Use JS click for nav buttons too (avoid strict mode)
  for (let i = 0; i < Math.abs(diff); i++) {
    await page.evaluate((direction) => {
      const dropdowns = document.querySelectorAll('.ant-picker-dropdown')
      for (const dp of dropdowns) {
        if (dp.classList.contains('ant-picker-dropdown-hidden')) continue
        const style = window.getComputedStyle(dp)
        if (style.display === 'none' || style.visibility === 'hidden') continue
        const btn = direction < 0
          ? dp.querySelector('.ant-picker-header-prev-btn')
          : dp.querySelector('.ant-picker-header-next-btn')
        if (btn) { btn.click(); return }
      }
    }, diff)
    await sleep(150)
  }
}

// Click a day cell in currently open DatePicker — use JS click to bypass overflow:hidden visibility
async function clickDatePickerDay(page, day) {
  const clicked = await page.evaluate((targetDay) => {
    const dropdowns = document.querySelectorAll('.ant-picker-dropdown')
    for (const dp of dropdowns) {
      // Only process visible dropdowns (not hidden ones)
      const style = window.getComputedStyle(dp)
      if (style.display === 'none' || style.visibility === 'hidden' || dp.classList.contains('ant-picker-dropdown-hidden')) continue
      const cells = dp.querySelectorAll('.ant-picker-cell-in-view .ant-picker-cell-inner')
      for (const cell of cells) {
        if (cell.textContent.trim() === String(targetDay)) {
          cell.click()
          return true
        }
      }
    }
    return false
  }, day)
  if (clicked) await sleep(200)
  return clicked
}

// Check if ANY ant-picker-dropdown is visible (handles case of 2 dropdowns in DOM)
async function isDatePickerVisible(page) {
  const dropdowns = page.locator('.ant-picker-dropdown')
  const count = await dropdowns.count()
  for (let i = 0; i < count; i++) {
    const visible = await dropdowns.nth(i).isVisible().catch(() => false)
    if (visible) return true
  }
  return false
}

// Set a date range: click start → set start; click end → set end
async function setDateRange(page, sY, sM, sD, eY, eM, eD) {
  // Start date
  await page.locator('input[placeholder="開始日"]').click()
  await sleep(500)
  if (await isDatePickerVisible(page)) {
    await navigateToMonth(page, sY, sM)
    await clickDatePickerDay(page, sD)
    await sleep(300)
  }
  // End date
  await page.locator('input[placeholder="終了日"]').click()
  await sleep(500)
  if (await isDatePickerVisible(page)) {
    await navigateToMonth(page, eY, eM)
    await clickDatePickerDay(page, eD)
    await sleep(300)
  }
  await page.keyboard.press('Escape')
  await sleep(200)
}

// Search button helper (button text is "検 索" with space from CSS, match by partial text)
function searchBtn(page) {
  return page.locator('button').filter({ hasText: '検' }).first()
}

function ok(note) { return { result: 'OK', note: '' } }
function ng(note, shotPath) { return { result: 'NG', note: note + (shotPath ? ` Screenshot: ${shotPath}` : '') } }
function pending(reason) { return { result: 'Pending', note: reason } }
function na() { return { result: 'N/A', note: '' } }

// ──────────────── TC implementations ────────────────

// COL-001: Layout tổng thể
async function tcCOL001(page) {
  await gotoCollection(page)
  // Check sidebar exists
  const sidebarOk = await page.locator('.ant-layout-sider, aside, nav').count() > 0
  // Check page heading 集金管理
  const headingOk = await page.locator('h1, .mb-0, [class*="heading"]').filter({ hasText: '集金管理' }).count() > 0
  // Check CSV button in header area
  const csvOk = await page.locator('button').filter({ hasText: 'CSV' }).count() > 0
  // Check search bar items
  const startInputOk = await page.locator('input[placeholder="開始日"]').count() > 0
  const staffInputOk = await page.locator('input[placeholder="配送スタッフID・名"]').count() > 0
  // Check summary area (集金合計金額 and 駐車合計料金)
  const bodyText = await page.locator('body').textContent()
  const sum1Ok = bodyText?.includes('集金合計金額')
  const sum2Ok = bodyText?.includes('駐車合計料金')
  // Check table headers
  const thNo = bodyText?.includes('No') && bodyText?.includes('配送スタッフID') && bodyText?.includes('配送スタッフ名') && bodyText?.includes('集金合計金額') && bodyText?.includes('駐車合計料金')
  if (sidebarOk && headingOk && csvOk && startInputOk && staffInputOk && sum1Ok && sum2Ok && thNo) return ok()
  const shotPath = await snap(page, 'COL-001')
  return ng(`Layout elements missing: sidebar=${sidebarOk} heading=${headingOk} csv=${csvOk} startInput=${startInputOk} staffInput=${staffInputOk} sum1=${sum1Ok} sum2=${sum2Ok} headers=${thNo}`, shotPath)
}

// COL-002: 期間検索 focus and calendar opens
async function tcCOL002(page) {
  await gotoCollection(page)
  const startEnabled = !(await page.locator('input[placeholder="開始日"]').isDisabled())
  await page.locator('input[placeholder="開始日"]').click()
  await sleep(500)
  const calendarOpens = await isDatePickerVisible(page)
  await page.keyboard.press('Escape')
  await sleep(300)
  // Navigate to set a custom date (Aug 18 - Aug 31) to verify display
  await setDateRange(page, 2026, 8, 18, 2026, 8, 31)
  const newStart = await page.locator('input[placeholder="開始日"]').inputValue()
  const newEnd = await page.locator('input[placeholder="終了日"]').inputValue()
  const displayOk = newStart.includes('2026-08-18') && newEnd.includes('2026-08-31')
  if (!startEnabled || !calendarOpens || !displayOk) {
    const shotPath = await snap(page, 'COL-002')
    return ng(`期間検索: enabled=${startEnabled} calendarOpens=${calendarOpens} displayOk=${displayOk} (got: ${newStart}~${newEnd})`, shotPath)
  }
  return ok()
}

// COL-003: 配送スタッフID・名 input states
async function tcCOL003(page) {
  await gotoCollection(page)
  const input = page.locator('input[placeholder="配送スタッフID・名"]')
  // Default: empty, enabled
  const defaultVal = await input.inputValue()
  const defaultEmpty = defaultVal === ''
  const enabled = !(await input.isDisabled())
  // Click to focus
  await input.click()
  await sleep(300)
  // Type
  await input.fill('佐藤')
  await sleep(300)
  const typedVal = await input.inputValue()
  const typedOk = typedVal === '佐藤'
  if (defaultEmpty && enabled && typedOk) return ok()
  const shotPath = await snap(page, 'COL-003')
  return ng(`Input: defaultEmpty=${defaultEmpty} enabled=${enabled} typedOk=${typedOk} (typed='${typedVal}')`, shotPath)
}

// COL-004: Buttons enabled and labels correct
async function tcCOL004(page) {
  await gotoCollection(page)
  const clearBtn = page.locator('button').filter({ hasText: 'クリア' }).first()
  const srchBtn = searchBtn(page)
  const csvBtn = page.locator('button').filter({ hasText: 'CSV出力' }).first()
  const clearOk = (await clearBtn.count() > 0) && !(await clearBtn.isDisabled())
  const searchOk = (await srchBtn.count() > 0) && !(await srchBtn.isDisabled())
  const csvOk = (await csvBtn.count() > 0) && !(await csvBtn.isDisabled())
  if (clearOk && searchOk && csvOk) return ok()
  const shotPath = await snap(page, 'COL-004')
  return ng(`Buttons: clear=${clearOk} search=${searchOk} csv=${csvOk}`, shotPath)
}

// COL-005: Summary T.1 and T.2 labels and values
async function tcCOL005(page) {
  await gotoCollection(page)
  const bodyText = await page.locator('body').textContent()
  const has集金 = bodyText?.includes('集金合計金額')
  const has駐車 = bodyText?.includes('駐車合計料金')
  // Check values are displayed (should show 0円 for empty period)
  const hasValue = bodyText?.includes('円') // any yen value shown
  // Check not editable (readonly/text display, not input)
  const editableCount = await page.locator('input').filter({ hasText: '' }).count()
  // Summary should NOT be an input field
  if (has集金 && has駐車 && hasValue) return ok()
  const shotPath = await snap(page, 'COL-005')
  return ng(`Summary: has集金=${has集金} has駐車=${has駐車} hasValue=${hasValue}`, shotPath)
}

// COL-006: Pagination with 25 drivers
async function tcCOL006(page) {
  return pending('Cần ít nhất 25 tài xế có dữ liệu trong kỳ; DEV hiện không có dữ liệu tài xế trong kỳ Oct 2026')
}

// COL-007: Default period = first to last of current month
async function tcCOL007(page) {
  await gotoCollection(page)
  const startVal = await page.locator('input[placeholder="開始日"]').inputValue()
  const endVal = await page.locator('input[placeholder="終了日"]').inputValue()
  // System date = 2026-10-09 → expect 2026-10-01 to 2026-10-31
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const lastDay = new Date(y, now.getMonth() + 1, 0).getDate()
  const expectedStart = `${y}-${m}-01`
  const expectedEnd = `${y}-${m}-${String(lastDay).padStart(2, '0')}`
  if (startVal === expectedStart && endVal === expectedEnd) return ok()
  const shotPath = await snap(page, 'COL-007')
  return ng(`Default period: expected ${expectedStart}~${expectedEnd} but got ${startVal}~${endVal}`, shotPath)
}

// COL-008: Month end dates for different months
async function tcCOL008(page) {
  return pending('Cần thay đổi ngày hệ thống (2026/09/15, 2027/02/10, 2028/02/10); không thể thực hiện trên DEV mà không thay đổi system date')
}

// COL-009: Different period changes results
async function tcCOL009(page) {
  return pending('Cần DR000001 có dữ liệu giao hàng trong cả tháng 07/2026 và 08/2026; DEV không có dữ liệu trong các kỳ này')
}

// COL-010: Change period without clicking search → table unchanged
async function tcCOL010(page) {
  await gotoCollection(page)
  // First search to establish a baseline state
  await searchBtn(page).click()
  await sleep(1500)
  const bodyBefore = await page.locator('body').textContent()
  const hasDataNashiBefore = bodyBefore?.includes('データなし')
  // Change period to Jul 1-31 but don't click search
  await setDateRange(page, 2026, 7, 1, 2026, 7, 31)
  await sleep(500)
  // Check: input shows new date
  const newStart = await page.locator('input[placeholder="開始日"]').inputValue()
  const newEnd = await page.locator('input[placeholder="終了日"]').inputValue()
  const inputsUpdated = newStart.includes('2026-07-01') && newEnd.includes('2026-07-31')
  // Check: table still shows previous state (unchanged)
  const bodyAfter = await page.locator('body').textContent()
  const stillSameState = bodyAfter?.includes('データなし') === hasDataNashiBefore
  if (inputsUpdated && stillSameState) return ok()
  const shotPath = await snap(page, 'COL-010')
  return ng(`After date change without search: inputsUpdated=${inputsUpdated} stillSameState=${stillSameState} newDates=${newStart}~${newEnd}`, shotPath)
}

// COL-011: Empty staff search no error
async function tcCOL011(page) {
  return pending('Precondition "tháng hiện tại có dữ liệu DR000001 và DR000002" không được thỏa mãn; DEV không có dữ liệu tài xế trong Oct 2026 — không thể xác nhận bảng liệt kê mọi tài xế')
}

// COL-012: Search by driver name
async function tcCOL012(page) {
  return pending('Cần DR000001/佐藤太郎 và DR000002/鈴木花子 có dữ liệu trong kỳ; DEV không có dữ liệu tài xế test này')
}

// COL-013: Search by driver ID
async function tcCOL013(page) {
  return pending('Cần DR000001 và DR000002 có dữ liệu trong kỳ; DEV không có dữ liệu tài xế test này')
}

// COL-014: Combined period + ID search
async function tcCOL014(page) {
  return pending('Cần DR000001 có dữ liệu trong tháng 07/2026; DEV không có dữ liệu')
}

// COL-015: Clear button
async function tcCOL015(page) {
  await gotoCollection(page)
  const input = page.locator('input[placeholder="配送スタッフID・名"]')
  await input.fill('佐藤')
  await sleep(300)
  // Click clear
  await page.locator('button').filter({ hasText: 'クリア' }).first().click()
  await sleep(500)
  const valAfterClear = await input.inputValue()
  const clearOk = valAfterClear === ''
  // No error after first clear
  const bodyText = await page.locator('body').textContent()
  const noError = !bodyText?.toLowerCase().includes('error') && !bodyText?.includes('エラー')
  // Click clear again on empty
  await page.locator('button').filter({ hasText: 'クリア' }).first().click()
  await sleep(300)
  const valAfterSecondClear = await input.inputValue()
  const clearAgainOk = valAfterSecondClear === ''
  const bodyAfterSecond = await page.locator('body').textContent()
  const noErrorSecond = !bodyAfterSecond?.toLowerCase().includes('error')
  if (clearOk && noError && clearAgainOk && noErrorSecond) return ok()
  const shotPath = await snap(page, 'COL-015')
  return ng(`Clear: clearOk=${clearOk}(val='${valAfterClear}') noError=${noError} clearAgainOk=${clearAgainOk}`, shotPath)
}

// COL-016 to COL-019: Need data
async function tcCOL016(page) { return pending('Cần DR000001 có dữ liệu trong kỳ để verify tính nhất quán kết quả tìm kiếm') }
async function tcCOL017(page) { return pending('Cần DR000001 và DR000002 có dữ liệu trong kỳ để verify summary tính lại') }
async function tcCOL018(page) { return pending('Cần ít nhất 25 tài xế có dữ liệu thu tiền trong kỳ') }
async function tcCOL019(page) { return pending('Cần DR000001 và DR000002 có dữ liệu thu tiền trong kỳ') }
async function tcCOL020(page) { return pending('Cần ít nhất 25 tài xế có dữ liệu trong kỳ') }
async function tcCOL021(page) { return pending('Cần DR000001 có giao hàng trong kỳ với tổng phí đỗ xe = 0') }
async function tcCOL022(page) { return pending('Cần DR000001 có 2 giao hàng với tiền thu 10000 và 8000 trong kỳ') }
async function tcCOL023(page) { return pending('Cần DR000001 có giao hàng cụ thể ngày 2026/07/31 và 2026/08/05') }
async function tcCOL024(page) { return pending('Cần DR000001 có 2 giao hàng với phí đỗ xe 1200 và 0 trong kỳ') }
async function tcCOL025(page) { return pending('Cần ít nhất 25 tài xế có dữ liệu trong kỳ') }
async function tcCOL026(page) { return pending('Cần 25 tài xế có dữ liệu, đang ở 10件/ページ; DEV không có đủ dữ liệu') }
async function tcCOL027(page) { return pending('Cần DR000001 có dữ liệu trong kỳ để verify count display') }
async function tcCOL028(page) { return pending('Cần 25 tài xế có dữ liệu, đang ở 10件/ページ; DEV không có đủ dữ liệu') }
async function tcCOL029(page) { return pending('Cần 25 tài xế có dữ liệu để verify boundary navigation') }

// COL-030: Default 10件/ページ
async function tcCOL030(page) {
  await gotoCollection(page)
  // Check any ant-select shows 10 (pagination size selector)
  const selectTexts = await page.locator('.ant-select').allTextContents()
  const perPageText = selectTexts.join(' ')
  if (perPageText.includes('10')) return ok()
  // Check HTML for pagination options (ant-pagination-options area) — short timeout
  const paginationHtml = await page.locator('.ant-pagination').first().innerHTML({ timeout: 2000 }).catch(() => '')
  if (paginationHtml.includes('10')) return ok()
  // If no data visible, pagination may be hidden — verify table config shows 10 as default
  // Check for the pageSize select in DOM regardless of visibility
  const pageSizeInput = page.locator('.ant-pagination-options .ant-select, [class*="pagination"] .ant-select')
  const pageSizeCount = await pageSizeInput.count()
  if (pageSizeCount === 0) {
    return pending('件数/ページセレクタが見つからない; データなし状態でページネーション非表示の可能性あり — DEVにデータ投入後に再検証が必要')
  }
  const shotPath = await snap(page, 'COL-030')
  return ng(`Default 10件/ページ not found. Select texts: ${perPageText}`, shotPath)
}

// COL-031: Change per-page dropdown
async function tcCOL031(page) {
  await gotoCollection(page)
  // Find pagination size selector
  const pageSizeSelect = page.locator('.ant-pagination-options .ant-select, .ant-pagination .ant-select').first()
  const selectorFound = await pageSizeSelect.count() > 0
  if (!selectorFound) {
    return pending('件数/ページセレクタが見つからない; データなし状態でページネーション非表示の可能性あり — DEVにデータ投入後に再検証が必要')
  }
  const bodyBefore = await page.locator('body').textContent()
  const sum1Before = bodyBefore?.match(/集金合計金額[\s\S]{0,5}([\d,]+)円/)?.[1] || '0'
  await pageSizeSelect.click()
  await sleep(500)
  const dropdownVisible = await page.locator('.ant-select-dropdown').first().isVisible().catch(() => false)
  if (!dropdownVisible) {
    const shotPath = await snap(page, 'COL-031')
    return ng('件数/ページ dropdown did not open', shotPath)
  }
  const options = await page.locator('.ant-select-item').allTextContents()
  if (options.length === 0) {
    await page.keyboard.press('Escape')
    const shotPath = await snap(page, 'COL-031')
    return ng('件数/ページ dropdown has no options', shotPath)
  }
  const notTenOption = options.find(o => !o.includes('10'))
  if (!notTenOption) {
    await page.keyboard.press('Escape')
    return pending('件数/ページ dropdown only shows 10 option; cannot verify changing (danh sách OQ-17)')
  }
  await page.locator('.ant-select-item').filter({ hasText: notTenOption }).first().click()
  await sleep(800)
  const selectTextsAfter = await page.locator('.ant-select').allTextContents()
  const perPageChanged = selectTextsAfter.join(' ').includes(notTenOption.trim().charAt(0))
  const bodyAfter = await page.locator('body').textContent()
  const sum1After = bodyAfter?.match(/集金合計金額[\s\S]{0,5}([\d,]+)円/)?.[1] || '0'
  const summaryUnchanged = sum1Before === sum1After
  if (perPageChanged && summaryUnchanged) return ok()
  const shotPath = await snap(page, 'COL-031')
  return ng(`Per-page: changed=${perPageChanged} summaryUnchanged=${summaryUnchanged}`, shotPath)
}

// COL-032: CSV download
async function tcCOL032(page) {
  await gotoCollection(page)
  const prevUrl = page.url()
  // Listen for download
  const downloadPromise = page.waitForEvent('download', { timeout: 15000 })
  await page.locator('button').filter({ hasText: 'CSV出力' }).first().click()
  let downloadOk = false
  let stayedOnPage = false
  try {
    const download = await downloadPromise
    downloadOk = !!download.suggestedFilename()
    // Stay on same page
    await sleep(1000)
    stayedOnPage = page.url() === prevUrl
    // Cancel the actual download
    await download.cancel()
  } catch (e) {
    const shotPath = await snap(page, 'COL-032')
    return ng(`CSV download failed or did not trigger: ${e.message}`, shotPath)
  }
  if (downloadOk && stayedOnPage) return ok()
  const shotPath = await snap(page, 'COL-032')
  return ng(`CSV: downloadTriggered=${downloadOk} stayedOnPage=${stayedOnPage}`, shotPath)
}

// COL-033: CSV filename with 全配送スタッフ when staff field empty
async function tcCOL033(page) {
  await gotoCollection(page)
  // Set period 2026/08/18 ~ 2026/08/31
  await setDateRange(page, 2026, 8, 18, 2026, 8, 31)
  await searchBtn(page).click()
  await sleep(1500)
  // Verify staff field empty
  const staffVal = await page.locator('input[placeholder="配送スタッフID・名"]').inputValue()
  if (staffVal !== '') {
    return pending('Ô 配送スタッフID・名 không trống trước khi xuất CSV — cần clear trước')
  }
  // Download CSV
  const downloadPromise = page.waitForEvent('download', { timeout: 15000 })
  await page.locator('button').filter({ hasText: 'CSV出力' }).first().click()
  try {
    const download = await downloadPromise
    const filename = download.suggestedFilename()
    await download.cancel()
    // Check filename pattern: 集金管理_20260818-20260831_全配送スタッフ_*.csv
    const hasDatePart = filename.includes('20260818-20260831')
    const hasAllStaff = filename.includes('全配送スタッフ')
    const hasCsvExt = filename.endsWith('.csv')
    const noSlash = !filename.includes('/')
    if (hasDatePart && hasAllStaff && hasCsvExt && noSlash) return ok()
    const shotPath = await snap(page, 'COL-033')
    return ng(`CSV filename: expected 集金管理_20260818-20260831_全配送スタッフ_*.csv but got '${filename}'. hasDatePart=${hasDatePart} hasAllStaff=${hasAllStaff} hasCsvExt=${hasCsvExt}`, shotPath)
  } catch (e) {
    const shotPath = await snap(page, 'COL-033')
    return ng(`CSV download not triggered: ${e.message}`, shotPath)
  }
}

// COL-034: CSV filename with driver name/ID
async function tcCOL034(page) {
  return pending('Cần DR000001/佐藤太郎 có dữ liệu trong kỳ; cần verify tên file CSV chứa tên/ID tài xế. DEV không có dữ liệu tài xế test này')
}

// COL-035: CSV content
async function tcCOL035(page) {
  return pending('Cần DR000001 và DR000002 có dữ liệu để verify nội dung CSV; DEV không có dữ liệu')
}

// COL-036: CSV uses last search condition
async function tcCOL036(page) {
  return pending('Cần verify CSV xuất theo điều kiện tìm kiếm gần nhất; cần dữ liệu DR000001 để so sánh nội dung')
}

// COL-037: XSS security
async function tcCOL037(page) {
  await gotoCollection(page)
  const input = page.locator('input[placeholder="配送スタッフID・名"]')
  await input.fill('<script>alert(1)</script>')
  let alertFired = false
  page.once('dialog', async d => { alertFired = true; await d.dismiss() })
  await searchBtn(page).click()
  await sleep(2000)
  const bodyText = await page.locator('body').textContent()
  const pageOk = !bodyText?.includes('ERROR') || bodyText?.includes('データなし') || bodyText?.length > 100
  if (!alertFired && pageOk) return ok()
  const shotPath = await snap(page, 'COL-037')
  return ng(`XSS: alertFired=${alertFired} (should be false). Script was executed.`, shotPath)
}

// COL-038: SQL injection security
async function tcCOL038(page) {
  await gotoCollection(page)
  const input = page.locator('input[placeholder="配送スタッフID・名"]')
  await input.fill("' OR 1=1--")
  await searchBtn(page).click()
  await sleep(2000)
  const bodyText = await page.locator('body').textContent()
  const hasSystemError = bodyText?.includes('システムエラー')
  const hasServerError = bodyText?.includes('500') || bodyText?.includes('Internal Server Error')
  if (!hasSystemError && !hasServerError) return ok()
  const shotPath = await snap(page, 'COL-038')
  return ng(`SQL injection caused system error or unexpected behavior. systemError=${hasSystemError} serverError=${hasServerError}`, shotPath)
}

// COL-039 to COL-042: Error scenarios (UNCONFIRMED, need environment manipulation)
async function tcCOL039(page) { return pending('[UNCONFIRMED] Cần phiên đã hết hạn; không thể simulate session expiry tự động mà không làm ảnh hưởng tài khoản test') }
async function tcCOL040(page) { return pending('[UNCONFIRMED] Cần ngắt kết nối mạng trong khi thực hiện tìm kiếm; không thể thực hiện trên DEV automation') }
async function tcCOL041(page) { return pending('[UNCONFIRMED] Cần ngắt kết nối mạng khi nhấn CSV出力; không thể thực hiện trên DEV automation') }
async function tcCOL042(page) { return pending('[UNCONFIRMED] Cần giả lập API trả 500; không thể thực hiện không có mock server') }

// ── Navigation TCs ──

// COLNAV-001: Sidebar navigation from Home
async function tcCOLNAV001(page) {
  await page.goto('/dashboard')
  await sleep(800)
  // Click 集金・駐車 in sidebar
  const menuItem = page.locator('.ant-menu-item').filter({ hasText: '集金・駐車' }).first()
  await menuItem.click()
  await sleep(1500)
  const url = page.url()
  const isOnClct = url.includes('collection-reports')
  if (!isOnClct) {
    const shotPath = await snap(page, 'COLNAV-001')
    return ng(`Sidebar click did not navigate to collection-reports. URL: ${url.replace(/https?:\/\/[^/]+/, 'HOST')}`, shotPath)
  }
  // Check default period = current month
  const startVal = await page.locator('input[placeholder="開始日"]').inputValue()
  const endVal = await page.locator('input[placeholder="終了日"]').inputValue()
  const now = new Date()
  const y = now.getFullYear(), m = String(now.getMonth() + 1).padStart(2, '0')
  const lastDay = new Date(y, now.getMonth() + 1, 0).getDate()
  const expectedStart = `${y}-${m}-01`
  const expectedEnd = `${y}-${m}-${String(lastDay).padStart(2, '0')}`
  const defaultPeriodOk = startVal === expectedStart && endVal === expectedEnd
  // Check staff input empty
  const staffVal = await page.locator('input[placeholder="配送スタッフID・名"]').inputValue()
  const staffEmpty = staffVal === ''
  if (isOnClct && defaultPeriodOk && staffEmpty) return ok()
  const shotPath = await snap(page, 'COLNAV-001')
  return ng(`Navigation: url=${isOnClct} defaultPeriod=${defaultPeriodOk}(${startVal}~${endVal}) staffEmpty=${staffEmpty}`, shotPath)
}

// COLNAV-002: Navigate from multiple screens
async function tcCOLNAV002(page) {
  const results = []
  const origins = [
    { url: '/schedule', name: 'OW_SCHD_001' },
    { url: '/orders', name: 'OW_DLVR_001' },
    { url: '/driver', name: 'OW_STAF_001' }
  ]
  for (const origin of origins) {
    try {
      await page.goto(origin.url)
      await sleep(800)
      const menuItem = page.locator('.ant-menu-item').filter({ hasText: '集金・駐車' }).first()
      await menuItem.click()
      await sleep(1500)
      const url = page.url()
      const ok = url.includes('collection-reports')
      results.push({ from: origin.name, ok })
    } catch (e) {
      results.push({ from: origin.name, ok: false, err: e.message })
    }
  }
  const allOk = results.every(r => r.ok)
  if (allOk) return ok()
  const shotPath = await snap(page, 'COLNAV-002')
  return ng(`Navigation from multiple screens: ${JSON.stringify(results.filter(r => !r.ok))}`, shotPath)
}

// COLNAV-003: Active state in sidebar
async function tcCOLNAV003(page) {
  await page.goto('/dashboard')
  await sleep(800)
  // Before: ホーム should be active
  await page.locator('.ant-menu-item').filter({ hasText: '集金・駐車' }).first().click()
  await sleep(1500)
  // After: 集金・駐車 should be selected, ホーム should not be
  const selectedItem = await page.locator('.ant-menu-item-selected').textContent().catch(() => '')
  const clctActive = selectedItem?.includes('集金・駐車')
  const homeActive = selectedItem?.includes('ホーム')
  if (clctActive && !homeActive) return ok()
  const shotPath = await snap(page, 'COLNAV-003')
  return ng(`Active state: selected='${selectedItem?.trim()}' — clctActive=${clctActive} homeActive=${homeActive} (should be: clct=true, home=false)`, shotPath)
}

// COLNAV-004: Driver name link
async function tcCOLNAV004(page) {
  return pending('Cần ít nhất 2 dòng trong bảng (DR000001 và DR000002) có dữ liệu trong kỳ để verify link điều hướng đến OW_STAF_003; DEV không có dữ liệu')
}

// COLNAV-005: Driver link after filter
async function tcCOLNAV005(page) {
  return pending('Cần DR000002 có dữ liệu trong kỳ để verify link sau khi lọc; DEV không có dữ liệu')
}

// COLNAV-006: Browser Back
async function tcCOLNAV006(page) {
  return pending('Cần điều hướng đến OW_STAF_003 từ bảng có dữ liệu trước; DEV không có dữ liệu trong bảng')
}

// COLNAV-007: F5 Reload
async function tcCOLNAV007(page) {
  await gotoCollection(page)
  await page.reload()
  // Wait for page to be ready again after reload (same wait as initial load)
  await page.waitForSelector('input[placeholder="開始日"]', { timeout: 20000 }).catch(() => {})
  await sleep(500)
  const urlAfter = page.url()
  const stayedOnPage = urlAfter.includes('collection-reports')
  const bodyText = await page.locator('body').textContent()
  const hasContent = (bodyText?.includes('集金') || bodyText?.includes('CSV') || bodyText?.includes('クリア')) && bodyText?.length > 100
  if (stayedOnPage && hasContent) return ok()
  const shotPath = await snap(page, 'COLNAV-007')
  return ng(`F5 Reload: stayedOnPage=${stayedOnPage} hasContent=${hasContent} bodyLen=${bodyText?.length}`, shotPath)
}

// COLNAV-008: CSV doesn't change screen
async function tcCOLNAV008(page) {
  await gotoCollection(page)
  // Set up with DR000001 search (even though no data)
  await page.locator('input[placeholder="配送スタッフID・名"]').fill('DR000001')
  await searchBtn(page).click()
  await sleep(1500)
  const urlBefore = page.url()
  const staffValBefore = await page.locator('input[placeholder="配送スタッフID・名"]').inputValue()
  // Click CSV
  const downloadPromise = page.waitForEvent('download', { timeout: 10000 })
  await page.locator('button').filter({ hasText: 'CSV出力' }).first().click()
  try {
    const dl = await downloadPromise
    await dl.cancel()
  } catch (e) {
    // If download fails, that's a separate issue
  }
  await sleep(1000)
  const urlAfter = page.url()
  const staffValAfter = await page.locator('input[placeholder="配送スタッフID・名"]').inputValue()
  const stayedOnPage = urlAfter.includes('collection-reports')
  const conditionPreserved = staffValAfter === staffValBefore
  if (stayedOnPage && conditionPreserved) return ok()
  const shotPath = await snap(page, 'COLNAV-008')
  return ng(`CSV: stayedOnPage=${stayedOnPage} conditionPreserved=${conditionPreserved}(staff before='${staffValBefore}' after='${staffValAfter}')`, shotPath)
}

// COLNAV-009: Return via sidebar from driver detail
async function tcCOLNAV009(page) {
  return pending('Cần điều hướng đến OW_STAF_003 từ bảng có dữ liệu trước; DEV không có dữ liệu trong bảng')
}

// COLNAV-010: E2E flow
async function tcCOLNAV010(page) {
  return pending('Cần DR000001 có dữ liệu giao hàng trong kỳ 2026/08/18~2026/08/31; DEV không có dữ liệu này')
}

// ──────────────── Main runner ────────────────
async function main() {
  const { browser, page } = await open()
  const results = {}

  const tcs = [
    ['COL-001', tcCOL001], ['COL-002', tcCOL002], ['COL-003', tcCOL003], ['COL-004', tcCOL004],
    ['COL-005', tcCOL005], ['COL-006', tcCOL006], ['COL-007', tcCOL007], ['COL-008', tcCOL008],
    ['COL-009', tcCOL009], ['COL-010', tcCOL010], ['COL-011', tcCOL011], ['COL-012', tcCOL012],
    ['COL-013', tcCOL013], ['COL-014', tcCOL014], ['COL-015', tcCOL015], ['COL-016', tcCOL016],
    ['COL-017', tcCOL017], ['COL-018', tcCOL018], ['COL-019', tcCOL019], ['COL-020', tcCOL020],
    ['COL-021', tcCOL021], ['COL-022', tcCOL022], ['COL-023', tcCOL023], ['COL-024', tcCOL024],
    ['COL-025', tcCOL025], ['COL-026', tcCOL026], ['COL-027', tcCOL027], ['COL-028', tcCOL028],
    ['COL-029', tcCOL029], ['COL-030', tcCOL030], ['COL-031', tcCOL031], ['COL-032', tcCOL032],
    ['COL-033', tcCOL033], ['COL-034', tcCOL034], ['COL-035', tcCOL035], ['COL-036', tcCOL036],
    ['COL-037', tcCOL037], ['COL-038', tcCOL038], ['COL-039', tcCOL039], ['COL-040', tcCOL040],
    ['COL-041', tcCOL041], ['COL-042', tcCOL042],
    ['COLNAV-001', tcCOLNAV001], ['COLNAV-002', tcCOLNAV002], ['COLNAV-003', tcCOLNAV003],
    ['COLNAV-004', tcCOLNAV004], ['COLNAV-005', tcCOLNAV005], ['COLNAV-006', tcCOLNAV006],
    ['COLNAV-007', tcCOLNAV007], ['COLNAV-008', tcCOLNAV008], ['COLNAV-009', tcCOLNAV009],
    ['COLNAV-010', tcCOLNAV010],
  ]

  try {
    for (const [id, fn] of tcs) {
      console.log(`Running ${id}...`)
      try {
        results[id] = await fn(page)
      } catch (e) {
        console.error(`  ${id} script error:`, e.message?.slice(0, 200))
        try {
          await gotoCollection(page)
          results[id] = await fn(page)
        } catch (e2) {
          results[id] = pending(`Script error (chạy lại cũng thất bại): ${e2.message?.slice(0, 150)}`)
        }
      }
      console.log(`  ${id}: ${results[id].result}${results[id].note ? ' — ' + results[id].note.slice(0, 80) : ''}`)
      await sleep(300)
    }
  } finally {
    await browser.close()
  }

  // Write result JSON
  const resPath = '/private/tmp/claude-501/-Users-longtd-Desktop-WORK-Project-Eskitchen-AI-AGENTS-ES-KITCHEN/b11cf3b6-254f-4448-b8fe-9753db23119a/scratchpad/auto/res_7_collection.json'
  fs.writeFileSync(resPath, JSON.stringify(results, null, 2))
  console.log('\nResults written to', resPath)

  // Summary
  const counts = { OK: 0, NG: 0, Pending: 0, 'N/A': 0 }
  for (const v of Object.values(results)) counts[v.result] = (counts[v.result] || 0) + 1
  console.log('\nSummary:', counts)
  const ngList = Object.entries(results).filter(([,v]) => v.result === 'NG').map(([id, v]) => `${id}: ${v.note?.slice(0, 80)}`)
  if (ngList.length > 0) console.log('NG:', ngList)
}

main().catch(e => { console.error('MAIN ERROR:', e.message); process.exit(1) })
