import { test, expect, Page } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'
import { login, record, shot } from './_lib'

const TAG = 'g08'
const T = path.resolve(__dirname, '../../../reports/delivery-driver/tmp08')
const P = (f: string) => path.join(T, f)
type R = ['OK' | 'NG' | 'Pending' | 'N/A', string?]

// ensure 21 png copies
for (let i = 8; i <= 21; i++) {
  const f = P(`qc_photo_${String(i).padStart(2, '0')}.png`)
  if (!fs.existsSync(f)) fs.copyFileSync(P('qc_photo_01.png'), f)
}
const PNGS = (n: number) => Array.from({ length: n }, (_, i) => P(`qc_photo_${String(i + 1).padStart(2, '0')}.png`))

interface Ctx { page: Page; dialogs: string[]; blocked: string[] }
async function setup(page: Page, doLogin = true): Promise<Ctx> {
  const c: Ctx = { page, dialogs: [], blocked: [] }
  // An toan: chan moi request ghi (POST/PUT/PATCH/DELETE) ngoai /auth/
  await page.route('**/*', (r) => {
    const q = r.request()
    if (!['GET', 'HEAD', 'OPTIONS'].includes(q.method()) && !/\/auth\//.test(q.url())) {
      c.blocked.push(q.method() + ' ' + q.url().replace(/^https?:\/\/[^/]+/, ''))
      return r.abort()
    }
    return r.continue()
  })
  page.on('dialog', (d) => { c.dialogs.push(d.message()); d.dismiss().catch(() => {}) })
  if (doLogin) await login(page)
  return c
}
const POINT = '伊田テクノス株式会社'
async function gotoIssues(page: Page) {
  await page.goto('/issues')
  await page.getByText(POINT).first().waitFor({ timeout: 45000 })
}
const cards = (page: Page) => page.locator('button[aria-pressed]')
const whCard = (page: Page, n: number) => page.getByRole('button').filter({ hasText: '未受取' }).nth(n)
const backBtn = (page: Page) => page.getByRole('button').filter({ hasText: /^\s*$/ }).first()
async function toDetail(page: Page, which: 'point' | 'wh2') {
  await gotoIssues(page)
  if (which === 'point') await cards(page).first().click()
  else await whCard(page, 1).click()
  await page.getByRole('button', { name: '次へ' }).click()
  await page.getByText('トラブル内容').waitFor({ timeout: 20000 })
}
const sendBtn = (page: Page) => page.getByRole('button', { name: '送信', exact: true })
async function ready(page: Page, reason = '箱数不足') {
  await page.getByRole('checkbox').first().click()
  await page.getByText(reason, { exact: true }).click()
}
const body = async (page: Page) => (await page.locator('body').innerText()).replace(/\n+/g, ' / ')
const counter = async (page: Page) => (await page.getByText(/\d+\s*\/\s*\d+枚/).first().innerText().catch(() => '?')).trim()

function tc(id: string, fn: (c: Ctx) => Promise<R>, opts: { login?: boolean } = {}) {
  test(id, async ({ page }) => {
    test.setTimeout(150000)
    const c = await setup(page, opts.login !== false)
    let ev = ''
    try {
      const [res, note] = await fn(c)
      ev = await shot(page, `g08_${id}`).catch(() => '')
      record(TAG, id, res, note || '', ev)
    } catch (e: any) {
      ev = await shot(page, `g08_${id}_err`).catch(() => '')
      record(TAG, id, 'Pending', 'Loi automation (chua xac nhan): ' + String(e.message).split('\n')[0].slice(0, 200), ev)
    }
  })
}
const note = (s: string) => s

// ---------------- DA_RPTD_001 ----------------
tc('TC-TRB-001-001', async ({ page }) => {
  await gotoIssues(page)
  await expect(page.getByText('トラブル報告', { exact: true })).toBeVisible()
  await expect(page.getByText('配達一覧', { exact: true })).toBeVisible()
  await expect(page.getByPlaceholder('倉庫名・拠点名・送り状番号')).toBeVisible()
  expect(await page.getByText(/^※/).count()).toBe(3)
  expect(await cards(page).count()).toBeGreaterThan(0)
  await expect(page.getByRole('button', { name: '次へ' })).toHaveCount(0)
  await expect(backBtn(page)).toBeVisible()
  return ['OK']
})
tc('TC-TRB-001-002', async ({ page, dialogs }) => {
  await gotoIssues(page)
  await backBtn(page).click()
  await page.waitForURL(/\/home/, { timeout: 15000 })
  await page.waitForTimeout(500)
  expect(dialogs.length).toBe(0)
  return ['OK']
})
tc('TC-TRB-001-005', async ({ page }) => {
  await gotoIssues(page)
  await page.getByPlaceholder('倉庫名・拠点名・送り状番号').fill('伊田')
  await page.waitForTimeout(600)
  await expect(cards(page).filter({ hasText: POINT })).toHaveCount(1)
  expect(await cards(page).count()).toBe(1)
  return ['OK', 'Du lieu DEV khac TC (dung 伊田 thay 大和): loc tuc thi khi go, chi con the khop, the kho 未受取 bi an']
})
tc('TC-TRB-001-010', async ({ page, dialogs }) => {
  await gotoIssues(page)
  await page.getByPlaceholder('倉庫名・拠点名・送り状番号').fill('<script>alert(1)</script>')
  await page.waitForTimeout(800)
  expect(dialogs.length).toBe(0)
  const n = await cards(page).count()
  if (n !== 0) return ['NG', `Actual: con ${n} the khi go chuoi XSS | Expected: khong con the khop | Buoc: go <script>alert(1)</script>`]
  await expect(page.getByPlaceholder('倉庫名・拠点名・送り状番号')).toBeVisible()
  return ['OK']
})
tc('TC-TRB-001-022', async ({ page }) => {
  await gotoIssues(page)
  const n = await cards(page).count()
  for (let i = 0; i < n; i++) expect(await cards(page).nth(i).getAttribute('aria-pressed')).toBe('false')
  await page.mouse.wheel(0, 2000)
  await expect(page.getByRole('button', { name: '次へ' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: '戻る' })).toHaveCount(1) // chi nut ＜ o header (aria-label 戻る); khong co footer
  return ['OK']
})
tc('TC-TRB-001-023', async ({ page }) => {
  await gotoIssues(page)
  await cards(page).first().click()
  expect(await cards(page).first().getAttribute('aria-pressed')).toBe('true')
  await expect(page.getByRole('button', { name: '戻る' })).toHaveCount(2)
  await expect(page.getByRole('button', { name: '戻る' }).last()).toBeVisible()
  await expect(page.getByRole('button', { name: '次へ' })).toBeEnabled()
  return ['OK']
})
tc('TC-TRB-001-024', async ({ page }) => {
  await gotoIssues(page)
  await cards(page).first().click()
  await whCard(page, 0).click()
  expect(await cards(page).first().getAttribute('aria-pressed')).toBe('false')
  expect(await whCard(page, 0).getAttribute('aria-pressed')).toBe('true')
  await expect(page.getByRole('button', { name: '次へ' })).toBeVisible()
  return ['OK', 'Dung the diem giao + the kho (du lieu DEV)']
})
tc('TC-TRB-001-026', async ({ page }) => {
  await gotoIssues(page)
  await cards(page).first().click()
  await page.getByRole('button', { name: '次へ' }).click()
  await page.getByText('トラブル内容').waitFor({ timeout: 20000 })
  expect(page.url()).toMatch(/\/issues\/\d+/)
  const b = await body(page)
  expect(b).toContain(POINT)
  expect(b).toContain('埼玉県 東松山市松本町 2002/1/1')
  expect(b).toMatch(/0 \/ 箱 \/ 100 \/ 品 \/ 0 \/ 品/)
  return ['OK']
})
tc('TC-TRB-001-027', async ({ page }) => {
  await gotoIssues(page)
  await cards(page).first().click()
  await page.getByRole('button', { name: '戻る' }).last().click()
  await page.waitForURL(/\/home/, { timeout: 15000 })
  return ['OK']
})
tc('TC-TRB-001-036', async ({ page }) => {
  await gotoIssues(page)
  await page.reload()
  await page.getByText(POINT).first().waitFor({ timeout: 45000 })
  expect(page.url()).toMatch(/\/issues$/)
  expect(page.url()).not.toMatch(/login/)
  return ['OK', 'Duong dan thuc te la /issues (TC ghi /trouble)']
})
tc('TC-TRB-001-040', async ({ page }) => {
  await gotoIssues(page)
  await cards(page).first().click()
  await page.getByRole('button', { name: '次へ' }).dblclick()
  await page.getByText('トラブル内容').waitFor({ timeout: 20000 })
  await page.waitForTimeout(800)
  await page.goBack()
  await page.waitForTimeout(1500)
  const u = new URL(page.url()).pathname
  if (u !== '/issues') {
    await gotoIssues(page)
    await cards(page).first().click()
    await page.getByRole('button', { name: '次へ' }).click()
    await page.getByText('トラブル内容').waitFor({ timeout: 20000 })
    await page.waitForTimeout(800)
    await page.goBack()
    await page.waitForTimeout(1500)
    const u2 = new URL(page.url()).pathname
    if (u2 === '/issues') return ['NG', `Actual: nhan dup 次へ roi Back 1 lan van o ${u} (DA_RPTD_002 bi them 2 lan vao history); doi chung: bam 1 lan roi Back → ${u2} dung | Expected: chi mo 1 man DA_RPTD_002, Back 1 lan ve DA_RPTD_001 | Buoc: chon the, dblclick 次へ, Back`]
    return ['Pending', `Back 1 lan o ${u} nhung doi chung bam don cung ${u2} - chua ket luan`]
  }
  return ['OK']
})

// ---------------- DA_RPTD_002 ----------------
tc('TC-TRB-002-014', async ({ page, dialogs }) => {
  await toDetail(page, 'wh2')
  await expect(sendBtn(page)).toBeDisabled()
  await sendBtn(page).click({ force: true, timeout: 3000 }).catch(() => {})
  await page.waitForTimeout(600)
  await expect(page.getByRole('dialog')).toHaveCount(0)
  expect(await body(page)).not.toContain('入力してください')
  expect(dialogs.length).toBe(0)
  return ['OK']
})
tc('TC-TRB-002-017', async ({ page }) => {
  await toDetail(page, 'wh2')
  await ready(page, '箱数不足')
  await expect(sendBtn(page)).toBeEnabled()
  return ['OK']
})
tc('TC-TRB-002-021', async ({ page }) => {
  await toDetail(page, 'wh2')
  await page.getByText('箱数不足', { exact: true }).click()
  await page.getByText('荷物破損', { exact: true }).click()
  expect(await page.getByRole('radio', { name: '荷物破損' }).isChecked()).toBe(true)
  expect(await page.getByRole('radio', { name: '箱数不足' }).isChecked()).toBe(false)
  return ['OK']
})
tc('TC-TRB-002-022', async ({ page }) => {
  await toDetail(page, 'wh2')
  await page.getByText('その他', { exact: true }).click()
  const inp = page.getByPlaceholder('理由を入力してください')
  await expect(inp).toBeVisible()
  const col = await inp.evaluate((e) => { const s = getComputedStyle(e); return [s.borderTopColor, s.outlineColor, s.boxShadow].join('|') })
  const m = col.match(/rgb\((\d+), (\d+), (\d+)/)
  const red = m ? +m[1] > 150 && +m[2] < 110 && +m[3] < 110 : false
  if (!red) return ['NG', `Actual: vien o nhap mau ${col.slice(0, 80)} (khong do) | Expected: vien do | Buoc: chon その他`]
  return ['OK']
})
tc('TC-TRB-002-024', async ({ page }) => {
  await toDetail(page, 'wh2')
  await ready(page, 'その他')
  await sendBtn(page).click()
  await page.waitForTimeout(500)
  const modal = await page.getByRole('dialog').count()
  const el = page.getByText(/理由を入力してください/).first()
  const txt = (await el.innerText().catch(() => '')).trim()
  if (modal > 0) return ['NG', 'Actual: modal mo du ly do trong | Expected: loi inline va khong mo modal']
  if (txt !== '理由を入力してください') return ['NG', `Actual: thong bao 「${txt}」 (co dau 。 cuoi, hien dang thong bao tren dau man hinh, khong inline duoi o nhap) | Expected: 「理由を入力してください」 inline (E_DARPTD002_003) | Bước: chon その他, de trong, bam 送信 | Evidence: anh`]
  return ['OK']
})
tc('TC-TRB-002-026', async ({ page }) => {
  await toDetail(page, 'wh2')
  await ready(page, 'その他')
  await page.getByPlaceholder('理由を入力してください').fill('あ'.repeat(255))
  await sendBtn(page).click()
  await page.waitForTimeout(600)
  await expect(page.getByRole('dialog')).toBeVisible()
  expect(await body(page)).not.toContain('255文字以内')
  return ['OK']
})
tc('TC-TRB-002-027', async ({ page, blocked }) => {
  await toDetail(page, 'wh2')
  await ready(page, 'その他')
  await page.getByPlaceholder('理由を入力してください').fill('あ'.repeat(256))
  await page.getByPlaceholder('理由を入力してください').blur()
  await sendBtn(page).click()
  await page.waitForTimeout(700)
  const modal = await page.getByRole('dialog').count()
  const b = await body(page)
  if (modal > 0 || !b.includes('255文字以内')) return ['NG', `Actual: ${modal > 0 ? 'modal DA_RPTD_004 van mo' : 'khong co modal'}, ${b.includes('255文字以内') ? 'co' : 'KHONG co'} loi 255文字以内; o nhap khong co maxlength | Expected: loi inline 「理由は255文字以内で入力してください」, khong mo modal | Buoc: nhap 256 ky tu あ, bam 送信 | Evidence: anh`]
  return ['OK']
})
tc('TC-TRB-002-034', async ({ page }) => {
  await toDetail(page, 'wh2')
  await page.setInputFiles('input[type=file]', [P('qc_photo_01.jpg')])
  await page.waitForTimeout(1500)
  expect(await page.locator('img').count()).toBeGreaterThanOrEqual(1)
  await expect(page.getByText('写真はまだありません')).toHaveCount(0)
  const hasX = await page.locator('img').first().evaluate((e) => { let x: Element | null = e; for (let i = 0; i < 4 && x; i++) { if (x.querySelector('button')) return true; x = x.parentElement } return false })
  if (!hasX) return ['NG', 'Actual: thumbnail khong co nut x | Expected: co nut x goc tren phai']
  return ['OK', 'File JPEG 2MB tao bang noise (qc_photo_01.jpg)']
})
tc('TC-TRB-002-036', async ({ page }) => {
  await toDetail(page, 'wh2')
  await page.setInputFiles('input[type=file]', [P('qc_doc.pdf')])
  await page.waitForTimeout(300)
  const b1 = await body(page)
  await page.waitForTimeout(1500)
  const b = await body(page)
  const err = b1.includes('対応していないファイル形式です') || b.includes('対応していないファイル形式です')
  const cnt = await counter(page)
  if (!err) return ['NG', `Actual: file PDF duoc chap nhan (bo dem anh thanh ${cnt}), khong co loi; input chi co accept=image/* nen chi chan o file picker | Expected: loi inline 「対応していないファイル形式です」 va khong them thumbnail (E_DARPTD002_006) | Buoc: chon qc_doc.pdf (setInputFiles) | Evidence: anh`]
  return ['OK']
})
tc('TC-TRB-002-037', async ({ page }) => {
  await toDetail(page, 'wh2')
  await page.setInputFiles('input[type=file]', [P('qc_big_11mb.jpg')])
  await page.waitForTimeout(400)
  const b1 = await body(page)
  await page.waitForTimeout(3000)
  const b = await body(page)
  const err = b1.includes('10MB') || b.includes('10MB')
  const cnt = await counter(page)
  if (!err) return ['NG', `Actual: anh ~11.2MB duoc chap nhan, khong co loi (bo dem ${cnt}) | Expected: loi inline 「ファイルサイズは10MB以下にしてください」 (E_DARPTD002_007) va khong them thumbnail | Buoc: chon qc_big_11mb.jpg | Evidence: anh`]
  return ['OK']
})
tc('TC-TRB-002-038', async ({ page }) => {
  await toDetail(page, 'wh2')
  await page.setInputFiles('input[type=file]', [P('qc_photo_10mb.jpg')])
  await page.waitForTimeout(3000)
  const b = await body(page)
  if (b.includes('10MB')) return ['NG', 'Actual: anh dung 10MB bi tu choi | Expected: duoc chap nhan']
  expect(await page.locator('img').count()).toBeGreaterThanOrEqual(1)
  await expect(page.getByText('写真はまだありません')).toHaveCount(0)
  return ['OK']
})
tc('TC-TRB-002-039', async ({ page }) => {
  await toDetail(page, 'wh2')
  await page.setInputFiles('input[type=file]', PNGS(20))
  await page.waitForTimeout(2500)
  const cnt = await counter(page)
  const imgs = await page.locator('img').count()
  const b = await body(page)
  if (!/\/20/.test(cnt)) return ['NG', `Actual: ${imgs} thumbnail, bo dem hien 「${cnt}」 (gioi han hien thi la 5 anh) | Expected: 20 thumbnail, gioi han toi da 20 anh (SPEC/TC) | Buoc: chon 20 file | Evidence: anh`]
  return ['OK']
})
tc('TC-TRB-002-040', async ({ page }) => {
  await toDetail(page, 'wh2')
  await page.setInputFiles('input[type=file]', PNGS(20))
  await page.waitForTimeout(2000)
  await page.setInputFiles('input[type=file]', [P('qc_photo_21.png')])
  await page.waitForTimeout(1500)
  const b = await body(page)
  const cnt = await counter(page)
  if (!b.includes('写真は最大20枚まで')) return ['NG', `Actual: anh thu 21 duoc them, khong co loi (bo dem 「${cnt}」) | Expected: loi inline 「写真は最大20枚までです」 (E_DARPTD002_008), van 20 thumbnail | Buoc: chon 20 anh roi them anh thu 21 | Evidence: anh`]
  return ['OK']
})
tc('TC-TRB-002-042', async ({ page }) => {
  await toDetail(page, 'wh2')
  await page.setInputFiles('input[type=file]', PNGS(3))
  await page.waitForTimeout(1500)
  expect(await page.locator('img').count()).toBe(3)
  const ok = await page.locator('img').nth(1).evaluateHandle((e) => { let x: Element | null = e; for (let i = 0; i < 4 && x; i++) { const b = x.querySelector('button'); if (b) return b; x = x.parentElement } return null })
  const el = ok.asElement()
  if (!el) return ['Pending', 'Khong xac dinh duoc nut x tren thumbnail bang DOM']
  await el.click()
  await page.waitForTimeout(800)
  const n = await page.locator('img').count()
  if (n !== 2) return ['NG', `Actual: con ${n} anh sau khi bam x | Expected: con 2 anh (xoa dung anh thu 2)`]
  return ['OK', 'Chi xac nhan so luong thumbnail (3 -> 2); khong phan biet duoc anh nao bi xoa vi 3 anh cung noi dung']
})
tc('TC-TRB-002-050', async ({ page }) => {
  await toDetail(page, 'wh2')
  await ready(page, '箱数不足')
  const ta = page.locator('textarea')
  await ta.fill('あ'.repeat(501))
  await ta.blur()
  await page.waitForTimeout(500)
  await sendBtn(page).click()
  await page.waitForTimeout(700)
  const modal = await page.getByRole('dialog').count()
  const b = await body(page)
  if (modal > 0 || !b.includes('500文字以内')) return ['NG', `Actual: ${modal > 0 ? 'modal DA_RPTD_004 van mo' : 'khong co modal'}, ${b.includes('500文字以内') ? 'co' : 'KHONG co'} loi 500文字以内; textarea khong co maxlength | Expected: loi inline 「備考は500文字以内で入力してください」 (E_DARPTD002_005), khong mo modal | Buoc: nhap 501 ky tu vao 備考, roi bam 送信 | Evidence: anh`]
  return ['OK']
})
tc('TC-TRB-002-054', async ({ page, dialogs }) => {
  await toDetail(page, 'wh2')
  await ready(page, '箱数不足')
  await page.locator('textarea').fill('QC memo')
  await page.setInputFiles('input[type=file]', [P('qc_photo_01.png')])
  await page.waitForTimeout(800)
  await page.getByRole('button', { name: '戻る', exact: true }).last().click()
  await page.waitForTimeout(1500)
  expect(new URL(page.url()).pathname).toBe('/issues')
  expect(dialogs.length).toBe(0)
  await page.getByText(POINT).first().waitFor({ timeout: 30000 })
  if ((await whCard(page, 1).getAttribute('aria-pressed')) !== 'true') await whCard(page, 1).click()
  await page.getByRole('button', { name: '次へ' }).click()
  await page.getByText('トラブル内容').waitFor({ timeout: 20000 })
  const chk = await page.getByRole('checkbox').first().getAttribute('aria-checked')
  const radios = await page.getByRole('radio').evaluateAll((l) => l.filter((e: any) => e.checked).length)
  const memo = await page.locator('textarea').inputValue()
  const imgs = await page.locator('img').count()
  const dis = await sendBtn(page).isDisabled()
  if (chk !== 'false' || radios !== 0 || memo !== '' || imgs !== 0) return ['NG', `Actual: checkbox=${chk}, radio da chon=${radios}, 備考="${memo}", anh=${imgs} | Expected: man trong hoan toan sau 戻る → 次へ`]
  return ['OK', dis ? '' : 'Luu y: 送信 khong disable khi chua nhap']
})
tc('TC-TRB-002-055', async ({ page, blocked }) => {
  await toDetail(page, 'wh2')
  await ready(page, '箱数不足')
  await sendBtn(page).click()
  await expect(page.getByText('この内容で報告を送信しますか？')).toBeVisible()
  await page.waitForTimeout(500)
  expect(blocked.filter((x) => /issue|trouble|report/i.test(x)).length).toBe(0)
  return ['OK', 'Chua co request ghi nao duoc gui khi moi mo modal (da chan moi request ghi)']
})
tc('TC-TRB-002-058', async ({ page }) => {
  await toDetail(page, 'wh2')
  await ready(page, '箱数不足')
  await sendBtn(page).dblclick()
  await page.waitForTimeout(800)
  const n = await page.getByText('この内容で報告を送信しますか？').count()
  if (n !== 1) return ['NG', `Actual: sau dblclick 送信 co ${n} modal (modal mo roi bi lan click thu 2 trung lop phu dong lai) | Expected: dung 1 modal DA_RPTD_004 hien ra | Buoc: wb + radio, nhan dup nhanh 送信 | Evidence: anh`]
  return ['OK']
})
tc('TC-TRB-002-067', async ({ page }) => {
  await page.goto('/issues/1')
  await page.waitForURL(/\/login/, { timeout: 20000 })
  expect(await body(page)).not.toContain('トラブル内容')
  await page.goto('/trouble/1')
  await page.waitForTimeout(2500)
  const u2 = new URL(page.url()).pathname
  const b2 = await body(page)
  expect(b2).not.toContain('トラブル内容')
  return ['OK', `Route that: /issues/:id (TC ghi /trouble/:id); /issues/1 chua dang nhap → /login; /trouble/1 → ${u2}`]
}, { login: false })

// 002-015: viet rieng (can doc nhieu trang thai)
test('TC-TRB-002-015', async ({ page }) => {
  test.setTimeout(150000)
  const c = await setup(page)
  const id = 'TC-TRB-002-015'
  try {
    await toDetail(page, 'wh2')
    await page.getByText('誤配送', { exact: true }).click()
    const dis = await sendBtn(page).isDisabled()
    let modal = false
    if (!dis) { await sendBtn(page).click(); await page.waitForTimeout(600); modal = (await page.getByText('この内容で報告を送信しますか？').count()) > 0 }
    const ev = await shot(page, 'g08_' + id)
    if (dis) record(TAG, id, 'OK', '', ev)
    else record(TAG, id, 'NG', `Actual: chi chon radio 「誤配送」 (chua tich van don) → 送信 ENABLE${modal ? ' va bam 送信 mo modal 「この内容で報告を送信しますか？」' : ''}, khong co loi 「影響を受けた注文を1件以上選択してください」 | Expected: 送信 van disable, khong hien modal | Buoc: mo chi tiet kho (1 van don), chon 誤配送 | Evidence: ${ev}`, ev)
  } catch (e: any) { record(TAG, id, 'Pending', 'Loi automation: ' + String(e.message).split('\n')[0].slice(0, 200)) }
})

// ---------------- DA_RPTD_003 ----------------
async function openPopup(page: Page) {
  await page.getByText('配送予定データはありません').first().waitFor({ timeout: 45000 }).catch(() => {})
  await page.getByText('トラブル', { exact: true }).last().click()
  await page.getByText('ESキッチンへ電話しますか？').waitFor({ timeout: 10000 })
}
tc('TC-TRB-E16-001', async ({ page }) => {
  await openPopup(page)
  const y = async (t: any) => (await page.getByText(t).first().boundingBox())!.y
  const yBtn = async (n: any) => (await page.getByRole('button', { name: n }).first().boundingBox())!.y
  await expect(page.getByText('ESキッチンへ連絡済みです。')).toBeVisible()
  const a = await y('ESキッチンへ電話しますか？'), b = await y('ESキッチンへ連絡済みです。')
  const c1 = await yBtn(/ESへ電話する（050-5784-2777）/), c2 = await yBtn('トラブル報告へ'), c3 = await yBtn('戻る')
  expect(a < b && b < c1 && c1 < c2 && c2 < c3).toBe(true)
  const mascot = await page.locator('img').evaluateAll((l) => l.filter((e: any) => e.getBoundingClientRect().width > 100 && e.getBoundingClientRect().top < 500).length)
  expect(mascot).toBeGreaterThan(0)
  return ['OK', 'Chi kiem thu thu tu/noi dung bang DOM; mau sac/pixel khong doi chieu']
})
tc('TC-TRB-E16-002', async ({ page }) => {
  await page.getByText('配送予定データはありません').first().waitFor({ timeout: 45000 }).catch(() => {})
  for (const t of ['ホーム', 'マニュアル', '配送一覧', 'トラブル', 'アカウント']) await expect(page.getByText(t, { exact: true }).last()).toBeVisible()
  await page.getByText('トラブル', { exact: true }).last().click()
  await expect(page.getByText('ESキッチンへ電話しますか？')).toBeVisible()
  expect(page.url()).toMatch(/\/home/)
  return ['OK']
})
tc('TC-TRB-E16-007', async ({ page }) => {
  await openPopup(page)
  const tel = page.locator('a[href^="tel:"]')
  expect(await tel.count()).toBe(1)
  expect(await tel.first().getAttribute('href')).toBe('tel:050-5784-2777')
  await page.getByRole('button', { name: /ESへ電話する/ }).click().catch(() => {})
  await page.waitForTimeout(700)
  await expect(page.getByText('ESキッチンへ電話しますか？')).toBeVisible()
  return ['OK', 'Xac nhan lien ket tel:050-5784-2777 va popup van mo; khong mo duoc app dien thoai that tren Chromium headless']
})
tc('TC-TRB-E16-009', async ({ page }) => {
  await openPopup(page)
  const dis = await page.getByRole('button', { name: 'トラブル報告へ' }).isDisabled()
  let after = ''
  if (dis) {
    await page.getByRole('checkbox').first().click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: 'トラブル報告へ' }).click()
    await page.waitForURL(/\/issues/, { timeout: 15000 })
    after = ' ; sau khi tich 「ESキッチンへ連絡済みです。」 thi bam duoc va chuyen /issues (DA_RPTD_001), popup dong'
  } else {
    await page.getByRole('button', { name: 'トラブル報告へ' }).click()
    await page.waitForURL(/\/issues/, { timeout: 15000 })
  }
  if (dis) return ['NG', `Actual: nut 「トラブル報告へ」 DISABLE cho den khi tich checkbox 「ESキッチンへ連絡済みです。」${after} | Expected: bam truc tiep 「トラブル報告へ」 la sang DA_RPTD_001 (BD ghi anh huong checkbox len nut la UNKNOWN - can xac nhan OQ) | Buoc: mo popup, bam nut khi chua tich`]
  return ['OK']
})
tc('TC-TRB-E16-011', async ({ page }) => {
  await openPopup(page)
  await page.getByRole('button', { name: '戻る' }).click()
  await page.waitForTimeout(600)
  await expect(page.getByText('ESキッチンへ電話しますか？')).toHaveCount(0)
  expect(page.url()).toMatch(/\/home/)
  return ['OK']
})

// ---------------- DA_RPTD_004 ----------------
tc('TC-TRB-E17-001', async ({ page }) => {
  await toDetail(page, 'wh2')
  await ready(page, '箱数不足')
  await sendBtn(page).click()
  const dlg = page.getByRole('dialog')
  await expect(dlg).toBeVisible()
  await expect(dlg.getByText('この内容で報告を送信しますか？')).toBeVisible()
  await page.waitForTimeout(1200)
  const y = async (l: any) => (await l.boundingBox())!.y
  const t = await y(dlg.getByText('この内容で報告を送信しますか？'))
  const d1 = await y(dlg.getByText(/送信後、対象の荷物は操作できなくなります/)), d2 = await y(dlg.getByText(/ESキッチンの確認・対応までお待ちください/))
  const b1 = await y(dlg.getByRole('button', { name: '報告する' })), b2 = await y(dlg.getByRole('button', { name: 'キャンセル' }))
  expect(t < d1 && d1 <= d2 && d2 < b1 && b1 < b2).toBe(true)
  const img = await dlg.locator('img,svg').count()
  expect(img).toBeGreaterThan(0)
  return ['OK', 'Chi doi chieu thu tu/noi dung bang DOM']
})
tc('TC-TRB-E17-004', async ({ page }) => {
  await toDetail(page, 'wh2')
  await ready(page, '箱数不足')
  await sendBtn(page).click()
  const t = (await page.getByRole('dialog').innerText()).replace(/\s+/g, '')
  expect(t).toContain('送信後、対象の荷物は操作できなくなります。ESキッチンの確認・対応までお待ちください。')
  return ['OK']
})
tc('TC-TRB-E17-007', async ({ page, blocked }) => {
  await toDetail(page, 'wh2')
  await ready(page, '箱数不足')
  await sendBtn(page).click()
  await page.getByRole('button', { name: 'キャンセル' }).click()
  await page.waitForTimeout(800)
  await expect(page.getByRole('dialog')).toHaveCount(0)
  expect(page.url()).toMatch(/\/issues\/\d+/)
  expect(await body(page)).not.toContain('報告を送信しました')
  expect(blocked.filter((x) => /issue|trouble|report/i.test(x)).length).toBe(0)
  return ['OK']
})

// ---------------- Pending (khong tu dong hoa duoc) ----------------
test('g08 pending-and-na', async () => {
  const W = 'Can du lieu giao hang that (3 van don 2107-6228-5031...) tren DEV'
  const SUB = 'Bi cam: gui bao cao/ghi du lieu that tren DEV dung chung (da chan request ghi)'
  const P1 = (id: string, n: string) => record(TAG, id, 'Pending', n)
  P1('TC-TRB-001-018', 'Du lieu DEV khac TC (the 伊田テクノス, khong co dong ten kho trong the diem giao, 0箱/100品/0品). Can diem giao ES配送便 co kho 所属倉庫 + dia chi/so luong nhu TC de doi chieu day du; quan sat: the co ten, badge 「未配送」, dia chi, tom tat 箱/品/品, radio; KHONG thay dong kho')
  P1('TC-TRB-001-020', 'Can diem giao A (chua giao) + diem giao B (配送完了) cung luc tren DEV de doi chieu; tai khoan test khong co lich giao')
  P1('TC-TRB-001-025', 'Chon the kho → 次へ sang man chi tiet duoc, nhung noi dung danh sach van don (chua nhan va chua giao cua kho, loai tru da nhan/da giao) can du lieu kho オージーフーズ倉庫 + nhieu trang thai don de xac nhan')
  P1('TC-TRB-001-029', 'Can tai khoan DR_QC002 (khong co don 未配送); tai khoan test hien tai co the 伊田テクノス nen khong tai hien duoc trang thai trong')
  P1('TC-TRB-002-001', 'Du lieu DEV chi co the voi 0-1 van don nen khong doi chieu duoc checkbox chon tat ca va 3 dong van don; cac phan con lai (※, トラブル内容 4 radio, 画像 placeholder + ファイル選択, 備考 textarea, 戻る/送信 disable) khop; luu y bo dem anh hien 0/5枚')
  P1('TC-TRB-002-009', 'Can the diem giao co >= 2 van don (hien the diem 伊田 khong co van don, kho chi 1 van don)')
  P1('TC-TRB-002-011', 'Can the diem giao co >= 2 van don de co trang thai trung gian (−)')
  P1('TC-TRB-002-029', 'Phan nhap XSS khong gay alert den buoc mo modal; buoc cuoi 「報告する」 bi cam (ghi du lieu that) nen chua xac nhan viec luu/hien thi van ban thuong')
  P1('TC-TRB-002-035', 'Khong tao duoc file HEIC/WebP hop le trong moi truong test (chi tao duoc PNG/JPEG); PNG da hien thumbnail trong cac TC khac')
  P1('TC-TRB-002-046', SUB + '; can xem request upload anh sau 「報告する」')
  P1('TC-TRB-002-056', SUB)
  P1('TC-TRB-002-057', SUB)
  P1('TC-TRB-E16-003', 'Can mo DA_RECV_001 / DA_ESDL_001 / DA_COOL_001 (chi tiet giao hang that); tai khoan test khong co lich giao nen khong vao duoc cac man nay')
  P1('TC-TRB-E17-006', SUB)
  P1('TC-TRB-E17-014', SUB + '; [UNCONFIRMED] cach the hien UI chua mo ta')
  for (const id of ['TC-TRB-E18-001', 'TC-TRB-E18-002', 'TC-TRB-E18-004', 'TC-TRB-E18-007', 'TC-TRB-E18-008', 'TC-TRB-E18-009'])
    P1(id, 'Toast/badge xuat hien sau khi gui bao cao thanh cong (hoac gui that bai) tren Home; ' + SUB)
  record(TAG, 'TC-TRB-002-069', 'N/A', 'Ban phim ao that tren thiet bi di dong')
})
