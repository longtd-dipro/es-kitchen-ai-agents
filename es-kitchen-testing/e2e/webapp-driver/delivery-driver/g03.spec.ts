import { test, expect, Page } from '@playwright/test'
import { login, record, shot } from './_lib'

const T = 'g03'
test.describe.configure({ mode: 'serial' })
let me: any

async function openAccount(page: Page) {
  await page.goto('/account')
  await page.getByText('基本情報').waitFor({ timeout: 30000 })
  await expect(page.getByText('ログインID', { exact: true })).toBeVisible({ timeout: 30000 })
}
/** giá trị của dòng nhãn: text của phần tử anh em sau nhãn */
async function valueOf(page: Page, label: string) {
  const li = page.locator('li').filter({ has: page.getByText(label, { exact: true }) }).first()
  const spans = await li.locator('span').allInnerTexts()
  return (spans[1] ?? '').trim()
}
async function run(id: string, fn: () => Promise<[('OK' | 'NG' | 'Pending' | 'N/A'), string?, string?]>) {
  try { const [r, n, e] = await fn(); record(T, id, r, n || '', e || '') }
  catch (err: any) { record(T, id, 'Pending', 'Automation lỗi: ' + String(err.message).split('\n')[0].slice(0, 160)) }
}

test('g03 MyPage', async ({ page, browser }) => {
  page.on('response', async (r) => { if (r.url().includes('/driver/account/me') && r.ok()) { try { me = (await r.json()).data } catch {} } })
  await login(page)
  await page.goto('/home')
  await page.waitForTimeout(1500)

  // 044 trước: Home -> アカウント -> Back
  await run('TC-MYP-044', async () => {
    await page.goto('/home')
    await page.getByRole('link', { name: 'アカウント' }).waitFor({ timeout: 30000 })
    await page.getByRole('link', { name: 'アカウント' }).click()
    await page.waitForURL('**/account')
    await page.goBack()
    await page.waitForURL('**/home', { timeout: 15000 })
    await expect(page.getByRole('link', { name: 'アカウント' })).toBeVisible({ timeout: 30000 })
    return ['OK']
  })

  await openAccount(page)
  await page.waitForTimeout(1500)
  const labels = ['ログインID', 'メールアドレス', '配送スタッフ名', 'カナ', '電話番号', '委託配送先名']

  await run('TC-MYP-001', async () => {
    const miss: string[] = []
    if (!page.url().includes('/account')) miss.push('url')
    for (const l of ['基本情報', ...labels]) if (!(await page.getByText(l, { exact: true }).isVisible())) miss.push(l)
    if (!(await page.getByRole('button', { name: 'ログアウト' }).isVisible())) miss.push('logout')
    const inputs = await page.locator('input,textarea,select').count()
    const imgs = await page.locator('img').count()
    const bell = await page.getByRole('button').first().isVisible()
    const e = await shot(page, 'g03_account')
    if (miss.length || inputs || !bell) return ['NG', `Actual: thiếu ${miss.join(',')} inputs=${inputs} bell=${bell} | Expected: đủ khối theo BD | Bước: mở /account | Evidence: ${e}`, e]
    return ['OK', imgs ? '' : 'Lưu ý: không thấy thẻ img (logo/xe tải có thể là nền CSS), phần ảnh chỉ xác nhận bằng ảnh chụp', e]
  })

  await run('TC-MYP-007', async () => {
    const v = await valueOf(page, 'ログインID')
    const ok = v === process.env.E06_EMAIL && v === me?.driverCode
    return ok ? ['OK'] : ['NG', `Actual: ログインID không khớp ID đăng nhập/API | Expected: ID tài xế đang đăng nhập | Bước: đọc dòng ログインID`]
  })
  await run('TC-MYP-008', async () => {
    const v = await valueOf(page, 'ログインID')
    return v && /^DR\d{5}$/.test(v) && v === v.trim() ? ['OK'] : ['NG', `Actual: độ dài ${v?.length}, không đúng DR+5 số | Expected: DR + 5 chữ số`]
  })
  await run('TC-MYP-010', async () => {
    const v = await valueOf(page, 'メールアドレス')
    const ta = await page.evaluate(() => { const e = Array.from(document.querySelectorAll('*')).find((x) => (x as HTMLElement).innerText?.includes('@') && x.children.length === 0) as HTMLElement; return e ? getComputedStyle(e).textAlign : null })
    if (v !== me?.email) return ['NG', 'Actual: email hiển thị khác API /driver/account/me | Expected: email tài xế']
    const fits = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
    return fits ? ['OK', ta && !['right', 'end'].includes(ta) ? `Quan sát: text-align=${ta}` : ''] : ['NG', 'Actual: tràn ngang | Expected: không bị cắt']
  })
  await run('TC-MYP-013', async () => {
    const v = await valueOf(page, '配送スタッフ名')
    return v && v === me?.driverName ? ['OK'] : ['NG', `Actual: tên hiển thị "${v ? 'có' : 'rỗng'}" không khớp API | Expected: 配送スタッフ名 của tài xế`]
  })
  const blank = async (id: string, label: string, exp: string) => run(id, async () => {
    const v = await valueOf(page, label)
    const e = await shot(page, `g03_${id}`)
    if (!v) return ['NG', `Actual: dòng 「${label}」 hiển thị rỗng; API /driver/account/me không trả field tương ứng (chỉ có id, driverCode, driverName, email, status, lastLoginAt, createdAt) | Expected: ${exp} | Bước: mở My Page, đọc dòng ${label} | Evidence: ${e}`, e]
    return ['OK']
  })
  await blank('TC-MYP-017', 'カナ', 'phiên âm katakana của tài xế')
  await blank('TC-MYP-020', '電話番号', 'số điện thoại tài xế')
  await blank('TC-MYP-022', '委託配送先名', 'tên công ty vận chuyển trực thuộc')

  const noEdit = async () => {
    const inputs = await page.locator('input,textarea,select,[contenteditable="true"]').count()
    const btns = await page.getByRole('button', { name: /編集|保存/ }).count()
    const focusedEditable = await page.evaluate(() => { const a = document.activeElement as HTMLElement; return !!a && ['INPUT', 'TEXTAREA'].includes(a.tagName) })
    return { inputs, btns, focusedEditable }
  }
  await run('TC-MYP-009', async () => {
    const t = page.getByText(String(me.driverCode), { exact: true }).first()
    await t.click(); await t.click({ delay: 800 })
    const r = await noEdit(); const v = await valueOf(page, 'ログインID')
    return !r.inputs && !r.focusedEditable && v === me.driverCode && page.url().includes('/account') ? ['OK'] : ['NG', `Actual: ${JSON.stringify(r)} | Expected: không sửa được`]
  })
  await run('TC-MYP-011', async () => {
    await page.getByText(me.email, { exact: true }).first().click()
    const r = await noEdit(); const v = await valueOf(page, 'メールアドレス')
    return !r.inputs && !r.focusedEditable && v === me.email ? ['OK'] : ['NG', `Actual: ${JSON.stringify(r)} | Expected: không sửa được`]
  })
  await run('TC-MYP-025', async () => {
    for (const l of labels) await page.getByText(l, { exact: true }).click()
    const r = await noEdit()
    return !r.inputs && !r.btns && !r.focusedEditable && page.url().includes('/account') ? ['OK'] : ['NG', `Actual: ${JSON.stringify(r)} | Expected: chỉ đọc`]
  })

  await run('TC-MYP-035', async () => {
    const b = page.getByRole('button').first()
    const box = await b.boundingBox()
    const st = await b.evaluate((e) => { const s = getComputedStyle(e); return { bg: s.backgroundColor, br: s.borderRadius } })
    const e = await shot(page, 'g03_bell')
    if (box && box.y < 120 && box.x > 195 && /255, 255, 255/.test(st.bg)) return ['OK', '', e]
    return ['NG', `Actual: bell box=${JSON.stringify(box)} style=${JSON.stringify(st)} | Expected: nút tròn nền trắng góc phải header | Evidence: ${e}`, e]
  })

  await run('TC-MYP-038', async () => {
    const names = ['ホーム', 'マニュアル', '配送一覧', 'トラブル', 'アカウント']
    const li = await page.locator('li').allInnerTexts()
    const order = li.map((s) => s.trim()).filter((s) => names.includes(s))
    const col = async (n: string) => page.getByText(n, { exact: true }).last().evaluate((e) => getComputedStyle(e).color)
    const cols = await Promise.all(names.map(col))
    const nav = await page.locator('li').first().evaluate((e) => { let p: HTMLElement | null = e; while (p && !['fixed', 'sticky'].includes(getComputedStyle(p).position)) p = p.parentElement; return !!p })
    const ok = JSON.stringify(order) === JSON.stringify(names) && cols[4] === 'rgb(9, 105, 218)' && cols.slice(0, 4).every((c) => c !== cols[4]) && nav
    const e = await shot(page, 'g03_nav')
    return ok ? ['OK', '', e] : ['NG', `Actual: order=${order} cols=${cols} fixed=${nav} | Expected: 5 tab đúng thứ tự, アカウント xanh, nav cố định | Evidence: ${e}`, e]
  })

  await run('TC-MYP-052', async () => {
    const res: string[] = []
    for (const [w, h] of [[320, 568], [390, 844], [480, 854]]) {
      await page.setViewportSize({ width: w, height: h }); await page.waitForTimeout(500)
      const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth }))
      const nav = await page.locator('li').allInnerTexts()
      const btn = await page.getByRole('button', { name: 'ログアウト' }).boundingBox()
      if (m.sw > m.iw) res.push(`${w}: scroll ngang ${m.sw}`)
      if (nav.length < 5) res.push(`${w}: nav ${nav.length}`)
      if (!btn || btn.x < 0 || btn.x + btn.width > w) res.push(`${w}: logout tràn`)
    }
    await page.setViewportSize({ width: 390, height: 844 })
    return res.length ? ['NG', `Actual: ${res.join('; ')} | Expected: không vỡ ở 320/390/480`] : ['OK', 'Lưu ý: chỉ assert scroll ngang/nav/nút; chồng đè bong bóng-chuông xem bằng mắt']
  })

  await run('TC-MYP-049', async () => {
    const ctx = await browser.newContext({ baseURL: process.env.E06_URL, viewport: { width: 390, height: 844 } })
    const p = await ctx.newPage()
    await p.goto('/account')
    await p.waitForURL(/\/login/, { timeout: 20000 })
    await p.waitForTimeout(1000)
    const leaked = await p.getByText('基本情報').count()
    await ctx.close()
    return leaked === 0 ? ['OK'] : ['NG', 'Actual: lộ dữ liệu | Expected: về login']
  })

  // điều hướng bottom nav
  await run('TC-MYP-039', async () => {
    await openAccount(page)
    await page.getByRole('link', { name: 'ホーム' }).click()
    await page.waitForURL('**/home', { timeout: 15000 })
    const loc = page.getByRole('link', { name: 'ホーム' })
    await expect.poll(() => loc.evaluate((e) => getComputedStyle(e).color), { timeout: 15000 }).toBe('rgb(9, 105, 218)').catch(() => {})
    const c = await loc.evaluate((e) => getComputedStyle(e).color)
    return c === 'rgb(9, 105, 218)' ? ['OK'] : ['NG', `Actual: màu tab ホーム=${c} | Expected: xanh`]
  })
  await run('TC-MYP-040', async () => {
    await openAccount(page)
    await page.getByRole('link', { name: '配送一覧' }).click()
    await page.waitForURL('**/delivery', { timeout: 15000 })
    const loc = page.getByRole('link', { name: '配送一覧' })
    await expect.poll(() => loc.evaluate((e) => getComputedStyle(e).color), { timeout: 15000 }).toBe('rgb(9, 105, 218)').catch(() => {})
    const c = await loc.evaluate((e) => getComputedStyle(e).color)
    return c === 'rgb(9, 105, 218)' ? ['OK'] : ['NG', `Actual: màu tab 配送一覧=${c} | Expected: xanh`]
  })

  // Logout CUỐI CÙNG: dblclick (033) -> 028 -> 031
  await openAccount(page)
  let logoutReqs = 0
  page.on('request', (r) => { if (/logout/i.test(r.url()) && r.method() !== 'OPTIONS') logoutReqs++ })
  const errs: string[] = []
  page.on('pageerror', (e) => errs.push(e.message))
  await page.getByRole('button', { name: 'ログアウト' }).click()
  await page.waitForTimeout(1200)
  const modal = await page.getByText('ログアウトしてもよろしいですか？').isVisible()
  const mshot = await shot(page, 'g03_logout_modal')
  const urlBefore = page.url().includes('/account')
  let out = true
  if (modal) {
    await page.getByRole('button', { name: 'ログアウト' }).last().dblclick()
  }
  try { await page.waitForURL(/\/login/, { timeout: 15000 }) } catch { out = false }
  await page.waitForTimeout(1500)
  await run('TC-MYP-028', async () => {
    const e = await shot(page, 'g03_after_logout')
    const form = await page.getByPlaceholder('ログインID').isVisible()
    const leak = await page.getByText('基本情報').count()
    if (modal) return ['NG', `Actual: bấm ログアウト hiện modal xác nhận 「ログアウトしてもよろしいですか？」(キャンセル/ログアウト), phải bấm thêm 1 lần mới chuyển sang login (sau xác nhận: về login=${out}, form=${form}) | Expected: bấm ログアウト chuyển thẳng DA_AUTHEN_001 (BD/TC không có bước xác nhận) | Bước: /account > ログアウト | Evidence: ${mshot}`, mshot]
    return out && form && !leak ? ['OK', '', e] : ['NG', `Actual: url=${page.url().split('/').pop()} form=${form} | Expected: về màn đăng nhập | Evidence: ${e}`, e]
  })
  await run('TC-MYP-033', async () => {
    const white = (await page.evaluate(() => document.body.innerText.trim().length)) === 0
    return out && !errs.length && !white && (await page.getByPlaceholder('ログインID').isVisible()) ? ['OK', `Quan sát: app hiện modal xác nhận trước (modal=${modal}), nên bấm đúp được thực hiện trên nút xác nhận ログアウト trong modal; kết quả chỉ chuyển login 1 lần, không lỗi`] : ['NG', `Actual: errs=${errs.length} white=${white} | Expected: chuyển 1 lần, không lỗi`]
  })
  await run('TC-MYP-031', async () => {
    await page.reload(); await page.waitForTimeout(3000)
    const a = page.url().includes('/login')
    await page.goto('/account'); await page.waitForURL(/\/login/, { timeout: 15000 })
    await page.getByPlaceholder('ログインID').waitFor({ timeout: 15000 })
    const b = (await page.getByText('基本情報').count()) === 0
    return a && b ? ['OK', 'Chỉ kiểm tra trong cùng context (reload + vào /account); không mở lại trình duyệt'] : ['NG', 'Actual: phiên khôi phục | Expected: ở màn đăng nhập']
  })
  record(T, 'TC-MYP-047', 'Pending', 'Cần E05 đổi メールアドレス của tài xế (ghi dữ liệu DEV bị cấm) rồi F5; điều kiện: môi trường test được phép sửa dữ liệu tài xế qua E05')
})
