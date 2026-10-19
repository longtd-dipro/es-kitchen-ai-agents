import { test, Page } from '@playwright/test'
import { record, shot, expect } from './_lib'

const TAG = 'g01'
const ERR_AUTH = 'ログインIDまたはパスワードが正しくありません。'
const ERR_ID = 'ログインIDを入力してください。'
const ERR_PW = 'パスワードを入力してください。'
const ERR_FMT = '8文字以上で、英字・数字を含めてください。'
const idBox = (p: Page) => p.getByPlaceholder('ログインID')
const pwBox = (p: Page) => p.getByPlaceholder('パスワード')
const btn = (p: Page) => p.getByRole('button', { name: 'ログイン' })
const txt = (p: Page, t: string) => p.getByText(t, { exact: true })

async function open(page: Page) {
  await page.goto('/login')
  await expect(idBox(page)).toBeVisible({ timeout: 30000 })
}
function trackLogin(page: Page) {
  const reqs: string[] = []
  page.on('request', (r) => { if (r.url().includes('/driver/auth/login')) reqs.push(r.method()) })
  return reqs
}
async function run(id: string, fn: () => Promise<void>, fail: (e: any) => Promise<void>) {
  try { await fn() } catch (e) { await fail(e) }
}
/** chạy 1 TC: pass -> OK, assertion lỗi -> NG (kèm actual), */
async function tc(page: Page, id: string, expected: string, fn: () => Promise<void>) {
  try {
    await fn()
    record(TAG, id, 'OK')
  } catch (e: any) {
    const ev = await shot(page, `g01_${id}`).catch(() => '')
    record(TAG, id, 'NG', `Actual: ${String(e.message).split('\n').slice(0, 3).join(' ').slice(0, 300)} | Expected: ${expected} | Evidence: ${ev}`, ev)
  }
}
async function submit(page: Page, id: string, pw: string) {
  await idBox(page).fill(id); await pwBox(page).fill(pw); await btn(page).click()
}
async function expectNoErrors(page: Page) {
  for (const t of [ERR_ID, ERR_PW, ERR_FMT, ERR_AUTH]) await expect(txt(page, t)).toHaveCount(0)
}

test.describe.configure({ mode: 'serial' })
test.setTimeout(120000)

test('G01 login', async ({ page, browser }) => {
  // ---- UI ----
  await open(page)
  await tc(page, 'TC-LGN-001', 'bố cục logo/ảnh/tiêu đề/ID/PW/link/nút, không cuộn ngang', async () => {
    await expect(page.getByText('今日も一日、')).toBeVisible()
    await expect(page.getByText('安全運転で頑張りましょう。')).toBeVisible()
    const ys = await Promise.all([page.getByText('今日も一日、'), idBox(page), pwBox(page), page.getByText('パスワードを忘れた方はこちら'), btn(page)].map(l => l.boundingBox().then(b => b!.y)))
    for (let i = 1; i < ys.length; i++) expect(ys[i]).toBeGreaterThan(ys[i - 1])
    expect(await page.locator('img').count()).toBeGreaterThanOrEqual(2)
    await expect(page.getByRole('button', { name: 'Show password' })).toBeVisible()
    const noHScroll = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    expect(noHScroll).toBe(true)
  })
  await tc(page, 'TC-LGN-003', 'ô ID trống, placeholder ログインID, không lỗi', async () => {
    await expect(idBox(page)).toHaveValue('')
    await expectNoErrors(page)
  })

  // ---- validate phía client (không gọi API) ----
  const noApi = async (id: string, pw: string, errs: string[], absent: string[], tcId: string) => {
    await open(page)
    const reqs = trackLogin(page)
    await tc(page, tcId, `hiện ${errs.join(' + ')}, không gọi API`, async () => {
      await submit(page, id, pw)
      for (const e of errs) await expect(txt(page, e)).toBeVisible()
      for (const e of absent) await expect(txt(page, e)).toHaveCount(0)
      await page.waitForTimeout(800)
      expect(page.url()).toContain('/login')
      expect(reqs.length).toBe(0)
    })
  }
  await noApi('', 'Qc2026Test1', [ERR_ID], [ERR_PW, ERR_FMT], 'TC-LGN-009')
  await noApi('QC_UNKNOWN01', '', [ERR_PW], [ERR_ID], 'TC-LGN-019')
  await noApi('QC_UNKNOWN01', 'Qc2026T', [ERR_FMT], [ERR_ID], 'TC-LGN-021')
  await noApi('QC_UNKNOWN01', 'QcTestOnly', [ERR_FMT], [ERR_ID], 'TC-LGN-023')
  await noApi('', '', [ERR_ID, ERR_PW], [], 'TC-LGN-032')
  await noApi('', 'Qc1abc', [ERR_ID, ERR_FMT], [], 'TC-LGN-033')
  await noApi('QC_UNKNOWN01', 'Qc1abc', [ERR_FMT], [ERR_AUTH], 'TC-LGN-034')

  // 035
  await open(page)
  await tc(page, 'TC-LGN-035', 'không có lỗi inline trước khi nhấn ログイン', async () => {
    await pwBox(page).click(); await pwBox(page).fill('Qc1')
    await idBox(page).click(); await pwBox(page).click(); await page.getByText('今日も一日、').click()
    await expectNoErrors(page)
  })

  // ---- toggle mắt ----
  await open(page)
  await tc(page, 'TC-LGN-037', 'nhấn mắt -> type=text, giá trị giữ nguyên', async () => {
    await pwBox(page).fill('Qc2026Test1')
    await expect(pwBox(page)).toHaveAttribute('type', 'password')
    await page.getByRole('button', { name: 'Show password' }).click()
    await expect(pwBox(page)).toHaveAttribute('type', 'text')
    await expect(pwBox(page)).toHaveValue('Qc2026Test1')
  })
  await open(page)
  await tc(page, 'TC-LGN-038', 'nhấn mắt lần 2 -> quay lại type=password, giá trị giữ nguyên', async () => {
    await pwBox(page).fill('Qc2026Test1')
    await page.getByRole('button', { name: /password/i }).click()
    await expect(pwBox(page)).toHaveAttribute('type', 'text')
    await page.getByRole('button', { name: /password/i }).click()
    await expect(pwBox(page)).toHaveAttribute('type', 'password')
    await expect(pwBox(page)).toHaveValue('Qc2026Test1')
  })

  // ---- đăng nhập sai (tối đa 8 lần, dữ liệu QC_) ----
  const wrong = async (id: string, pw: string, tcId: string, exp: string, extra?: () => Promise<void>) => {
    await open(page)
    const reqs = trackLogin(page)
    await tc(page, tcId, exp, async () => {
      await submit(page, id, pw)
      await expect(txt(page, ERR_AUTH)).toBeVisible({ timeout: 20000 })
      expect(page.url()).toContain('/login')
      expect(reqs.length).toBe(1)
      await expectNoErrors0(page)
      if (extra) await extra()
    })
  }
  const expectNoErrors0 = async (p: Page) => { for (const t of [ERR_ID, ERR_PW, ERR_FMT]) await expect(txt(p, t)).toHaveCount(0) }
  await wrong('Q', 'Qc2026Test1', 'TC-LGN-012', 'qua validate, gọi API, hiện lỗi xác thực')
  await wrong('QC_' + 'A'.repeat(252), 'Qc2026Test1', 'TC-LGN-013', '255 ký tự được nhận, gọi API, hiện lỗi xác thực', async () => {
    expect((await idBox(page).inputValue()).length).toBe(255)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  })
  await wrong('QC_UNKNOWN01', 'Qc2026Te', 'TC-LGN-020', '8 ký tự qua validate, hiện lỗi xác thực')
  await wrong('QC_UNKNOWN01', 'Qc1' + 'a'.repeat(252), 'TC-LGN-027', '255 ký tự qua validate, hiện lỗi xác thực', async () => {
    expect((await pwBox(page).inputValue()).length).toBe(255)
  })
  await wrong('QC_UNKNOWN01', 'Qc2026Test9', 'TC-LGN-044', 'lỗi xác thực, ở lại /login, giữ giá trị', async () => {
    await expect(idBox(page)).toHaveValue('QC_UNKNOWN01')
    await expect(pwBox(page)).toHaveValue('Qc2026Test9')
  })
  await wrong('QC_UNKNOWN02', 'Qc2026Test1', 'TC-LGN-045', 'cùng thông báo lỗi xác thực không tiết lộ ID tồn tại')
  await wrong('QC_UNKNOWN03', 'Qc2026Test9', 'TC-LGN-046', 'lỗi xác thực, ở lại /login')

  // 065 XSS (lần sai thứ 8)
  await open(page)
  const dialogs: string[] = []
  page.on('dialog', async (d) => { dialogs.push(d.message()); await d.dismiss() })
  await tc(page, 'TC-LGN-065', 'không alert; hiện lỗi xác thực/từ chối, không đăng nhập', async () => {
    await submit(page, '<script>alert(1)</script>', 'Qc2026Test1')
    await page.waitForTimeout(3000)
    expect(dialogs.length).toBe(0)
    expect(page.url()).toContain('/login')
    const shown = (await txt(page, ERR_AUTH).count()) + (await page.locator('[role=alert], .error, [class*=error]').count())
    expect(shown).toBeGreaterThan(0)
  })

  // ---- điều hướng ----
  await open(page)
  await tc(page, 'TC-LGN-051', 'chuyển sang /forgot-password', async () => {
    await page.getByText('パスワードを忘れた方はこちら').click()
    await expect(page).toHaveURL(/\/forgot-password/)
    await expect(page.getByText('パスワードリセット')).toBeVisible()
  })
  await open(page)
  const reqs052 = trackLogin(page)
  await tc(page, 'TC-LGN-052', 'sang forgot-password, không validate, không gọi API login', async () => {
    await idBox(page).fill('Qc1'); await pwBox(page).fill('Qc1')
    await page.getByText('パスワードを忘れた方はこちら').click()
    await expect(page).toHaveURL(/\/forgot-password/)
    await expectNoErrors(page)
    expect(reqs052.length).toBe(0)
  })
  await open(page)
  await tc(page, 'TC-LGN-053', 'back về /login; vào lại forgot-password các ô trống (không submit)', async () => {
    await page.getByText('パスワードを忘れた方はこちら').click()
    await expect(page.getByPlaceholder('メールアドレス')).toBeVisible()
    await page.getByPlaceholder('ログインID').fill('QC_UNKNOWN01')
    await page.getByPlaceholder('メールアドレス').fill('qc_nouser@example.test')
    await page.getByText('ログイン画面に戻る').click()
    await expect(page).toHaveURL(/\/login/)
    await expect(idBox(page)).toBeVisible()
    await page.getByText('パスワードを忘れた方はこちら').click()
    await expect(page.getByPlaceholder('メールアドレス')).toHaveValue('')
    await expect(page.getByPlaceholder('ログインID')).toHaveValue('')
  })
  await page.goto('/reset-password/complete')
  await tc(page, 'TC-LGN-054', 'redirect về /login', async () => {
    await expect(page).toHaveURL(/\/login/, { timeout: 15000 })
    await expect(idBox(page)).toBeVisible()
  })

  // ---- layout 320 ----
  await page.setViewportSize({ width: 320, height: 640 })
  await open(page)
  await tc(page, 'TC-LGN-070', 'không cuộn ngang, nút/link/ô trong viewport 320', async () => {
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    for (const l of [idBox(page), pwBox(page), btn(page), page.getByText('パスワードを忘れた方はこちら')]) {
      const b = (await l.boundingBox())!
      expect(b.x).toBeGreaterThanOrEqual(0); expect(b.x + b.width).toBeLessThanOrEqual(320)
    }
  })
  await page.setViewportSize({ width: 390, height: 844 })

  // ---- đăng nhập thật (tài khoản test, không ghi dữ liệu) ----
  const real = async (p: Page, dbl = false) => {
    await p.goto('/login'); await expect(idBox(p)).toBeVisible({ timeout: 30000 })
    await idBox(p).fill(process.env.E06_EMAIL!); await pwBox(p).fill(process.env.E06_PASSWORD!)
    if (dbl) await btn(p).dblclick(); else await btn(p).click()
  }
  const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 }, baseURL: new URL(page.url()).origin })
  const p2 = await ctx2.newPage()
  const r2 = trackLogin(p2)
  await tc(p2, 'TC-LGN-043', 'login thành công -> /home, không lỗi', async () => {
    await real(p2)
    await expect(p2).toHaveURL(/\/home/, { timeout: 30000 })
    await expectNoErrors(p2)
  })
  await tc(p2, 'TC-LGN-056', 'session lưu bền (cookie có expires dài hoặc token trong storage)', async () => {
    const st = await ctx2.storageState()
    const persistentCookie = st.cookies.filter(c => c.expires > Date.now() / 1000 + 86400 * 30)
    const ls = st.origins.flatMap(o => o.localStorage).filter(i => /token|auth|session|user/i.test(i.name))
    expect(persistentCookie.length + ls.length).toBeGreaterThan(0)
    // mở lại bằng context mới mang storageState (mô phỏng đóng/mở trình duyệt)
    const ctx3 = await browser.newContext({ storageState: st, viewport: { width: 390, height: 844 }, baseURL: new URL(page.url()).origin })
    const p3 = await ctx3.newPage()
    await p3.goto('/')
    await expect(p3).toHaveURL(/\/home/, { timeout: 30000 })
    await ctx3.close()
  })
  await ctx2.close()

  const ctx4 = await browser.newContext({ viewport: { width: 390, height: 844 }, baseURL: new URL(page.url()).origin })
  const p4 = await ctx4.newPage()
  const r4 = trackLogin(p4)
  await tc(p4, 'TC-LGN-048', 'double-click chỉ gửi 1 request login', async () => {
    await real(p4, true)
    await expect(p4).toHaveURL(/\/home/, { timeout: 30000 })
    expect(r4.length).toBe(1)
  })
  await ctx4.close()
})
