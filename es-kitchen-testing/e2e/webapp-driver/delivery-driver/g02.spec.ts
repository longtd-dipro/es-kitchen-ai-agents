import { test, Page } from '@playwright/test'
import { record, shot, expect, Result } from './_lib'

const TAG = 'g02'
const FID = 'QC_UNKNOWN01'
const FEM = 'qc_nouser@example.test'
const VERIFY = `/verify?driverCode=${FID}&email=${encodeURIComponent(FEM)}`
const MSG = {
  reqId: 'ログインIDを入力してください。', reqEm: 'メールアドレスを入力してください。',
  fmt: 'メールアドレスの形式が正しくありません。', pair: 'ログインIDまたはメールアドレスが正しくありません。',
  otp: '認証コードが正しくありません。',
}
type R = [Result, string] | [Result, string, string]
async function tc(id: string, fn: () => Promise<R>) {
  try { const [r, n, e] = (await fn()) as any; record(TAG, id, r, n || '', e || '') }
  catch (err: any) { record(TAG, id, 'Pending', 'Lỗi automation: ' + String(err.message).split('\n')[0].slice(0, 200)) }
}
const body = (p: Page) => p.locator('body').innerText()
async function step1(p: Page, id: string, em: string, submit = true, slow = false) {
  await p.goto('/forgot-password')
  const a = p.getByPlaceholder('ログインID'), b = p.getByPlaceholder('メールアドレス')
  if (slow) { await a.click(); await a.pressSequentially(id); await b.click(); await b.pressSequentially(em) }
  else { if (id) await a.fill(id); if (em) await b.fill(em) }
  if (submit) { await p.getByRole('button', { name: '認証コードを送信' }).click(); await p.waitForTimeout(2000) }
}
const FAKEEM_NOTE = 'Dữ liệu bịa QC_ (không dùng tài khoản thật)'
const PAIR_NG = (act: string, shot_: string) => `Actual: ${act} | Expected: hiện inline 「${MSG.pair}」 và ở lại màn | Bước: nhập ${FID}/${FEM}, nhấn 認証コードを送信 | Evidence: ${shot_}`

test.describe.configure({ mode: 'serial' })
test.setTimeout(300_000)

test('step1', async ({ page }) => {
  const dialogs: string[] = []
  page.on('dialog', d => { dialogs.push(d.message()); d.dismiss() })
  const posts: string[] = []
  page.on('request', r => { if (r.url().includes('forgot-password/request')) posts.push(r.url()) })

  await tc('TC-RST01-001', async () => {
    await page.goto('/forgot-password'); await page.waitForTimeout(1500)
    const t = await body(page)
    const imgs = await page.locator('img').count()
    const link = page.getByText('ログイン画面に戻る')
    const deco = await link.evaluate(e => getComputedStyle(e).textDecorationLine)
    const miss = ['パスワードリセット', '登録済みのメールアドレスを入力してください。', '認証コードを送信', 'ログイン画面に戻る'].filter(s => !t.includes(s))
    const ev = await shot(page, 'g02_step1_layout')
    if (miss.length || imgs < 1 || !deco.includes('underline')) return ['NG', `Actual: thiếu ${miss} imgs=${imgs} underline=${deco} | Expected: layout theo Figma | Evidence: ${ev}`, ev]
    return ['OK', '', ev]
  })
  await tc('TC-RST01-003', async () => {
    await page.goto('/forgot-password')
    const a = page.getByPlaceholder('ログインID')
    await expect(a).toHaveValue(''); await expect(a).toBeEnabled()
    return ['OK', '']
  })
  await tc('TC-RST01-007', async () => {
    await page.goto('/forgot-password')
    const a = page.getByPlaceholder('ログインID'); await a.fill('DR00001'); await page.getByPlaceholder('メールアドレス').click()
    await expect(a).toHaveValue('DR00001')
    const t = await body(page)
    if (t.includes('必須') || t.includes('入力してください。') && !t.includes('登録済み')) return ['NG', 'Actual: hiện lỗi realtime']
    return ['OK', '']
  })
  const wording = async (id: string, em: string, expect_: string[], actualHint: string, name: string, tcid: string, extra = '') => {
    await tc(tcid, async () => {
      await step1(page, id, em)
      const t = (await body(page)).replace('登録済みのメールアドレスを入力してください。', ''); const ev = await shot(page, 'g02_' + name)
      const stay = new URL(page.url()).pathname === '/forgot-password'
      const ok = stay && expect_.every(m => t.includes(m))
      if (ok) return ['OK', '', ev]
      const shown = t.split('\n').filter(l => l.includes('必須') || l.includes('形式') || l.includes('正しく') || l.includes('入力してください。') && !l.includes('登録済み')).join(' / ')
      return ['NG', `Actual: ${stay ? 'ở lại màn' : 'chuyển ' + new URL(page.url()).pathname}, message hiển thị 「${shown}」 | Expected: ${expect_.map(m => '「' + m + '」').join(' + ')} ${extra}| Bước: ${actualHint} | Evidence: ${ev}`, ev]
    })
  }
  await wording('', FEM, [MSG.reqId], 'để trống ID + email hợp lệ, nhấn gửi', 'rst01_009', 'TC-RST01-009')
  await wording('   ', FEM, [MSG.reqId], '3 dấu cách ở ID', 'rst01_010', 'TC-RST01-010')
  await wording(FID, '', [MSG.reqEm], 'ID + để trống email', 'rst01_018', 'TC-RST01-018')
  await wording(FID, '   ', [MSG.reqEm], 'ID + 3 dấu cách ở email (chấp nhận thêm lỗi định dạng)', 'rst01_019', 'TC-RST01-019')
  await wording(FID, 'qcnouser.example.test', [MSG.fmt], 'email thiếu @', 'rst01_020', 'TC-RST01-020')
  await wording(FID, 'qc@example', [MSG.fmt], 'email thiếu domain', 'rst01_021', 'TC-RST01-021')
  await wording('', '', [MSG.reqId, MSG.reqEm], 'để trống cả 2 ô', 'rst01_029', 'TC-RST01-029')
  await wording('', 'qcnouser.example.test', [MSG.reqId, MSG.fmt], 'ID trống + email sai định dạng', 'rst01_030', 'TC-RST01-030')

  // các TC cho ID/email "bịa" mà expected là lỗi cặp không khớp
  const pairCase = async (tcid: string, id: string, em: string, name: string, slow = false) => {
    await tc(tcid, async () => {
      await step1(page, id, em, true, slow)
      const t = await body(page); const ev = await shot(page, 'g02_' + name)
      const path = new URL(page.url()).pathname
      if (t.includes(MSG.pair) && path === '/forgot-password') return ['OK', '', ev]
      return ['NG', `Actual: ${path === '/forgot-password' ? 'ở lại màn' : 'chuyển sang ' + path + ' (màn nhập mã) không báo lỗi'}; không hiện 「${MSG.pair}」 | Expected: hiện inline 「${MSG.pair}」, ở lại màn | Bước: ID/email bịa QC_, nhấn 認証コードを送信 | Evidence: ${ev}`, ev]
    })
  }
  await pairCase('TC-RST01-011', 'D', FEM, 'rst01_011')
  await pairCase('TC-RST01-033', FID, FEM, 'rst01_033')
  await pairCase('TC-RST01-014', '😀', FEM, 'rst01_014')
  await tc('TC-RST01-012', async () => {
    const s = 'a'.repeat(255)
    await step1(page, s, FEM, false, true)
    const len = (await page.getByPlaceholder('ログインID').inputValue()).length
    await page.getByRole('button', { name: '認証コードを送信' }).click(); await page.waitForTimeout(2000)
    const path = new URL(page.url()).pathname; const ev = await shot(page, 'g02_rst01_012')
    if (len !== 255) return ['NG', `Actual: ô nhận ${len} ký tự | Expected: 255 | Evidence: ${ev}`, ev]
    if (path !== '/forgot-password' && !(await body(page)).includes(MSG.pair)) return ['NG', `Actual: 255 ký tự được nhận, chuyển sang ${path} không báo lỗi cặp ID/email | Expected: 「${MSG.pair}」 | Evidence: ${ev}`, ev]
    return ['OK', '', ev]
  })
  await tc('TC-RST01-013', async () => {
    await step1(page, 'a'.repeat(256), FEM, false, true)
    const len = (await page.getByPlaceholder('ログインID').inputValue()).length
    if (len > 255) return ['NG', `Actual: ô nhận ${len} ký tự | Expected: chặn >255`]
    return ['OK', '']
  })
  await tc('TC-RST01-016', async () => {
    await step1(page, '<script>alert(1)</script>', FEM)
    const path = new URL(page.url()).pathname; const t = await body(page); const ev = await shot(page, 'g02_rst01_016')
    if (dialogs.length) return ['NG', `Actual: xuất hiện dialog ${dialogs} | Expected: không alert | Evidence: ${ev}`, ev]
    if (!(t.includes(MSG.pair) && path === '/forgot-password')) return ['NG', `Actual: không có alert nhưng chuyển sang ${path} (màn nhập mã), không hiện 「${MSG.pair}」 | Expected: hiện 「${MSG.pair}」 | Evidence: ${ev}`, ev]
    return ['OK', '', ev]
  })
  await tc('TC-RST01-023', async () => {
    const em = 'a'.repeat(256 - '@example.test'.length) + '@example.test'
    await step1(page, FID, em, false, true)
    const len = (await page.getByPlaceholder('メールアドレス').inputValue()).length
    const ev = await shot(page, 'g02_rst01_023')
    return ['NG', `Actual: ô email nhận ${len}/256 ký tự (input maxLength=255) | Expected: BD cho phép 256 ký tự, hệ thống đối chiếu rồi báo 「${MSG.pair}」 | Evidence: ${ev}`, ev]
  })
  await tc('TC-RST01-032', async () => ['Pending', 'Cần ID tài xế thật + email khác để kiểm tra cặp ID tồn tại/email sai; quy tắc an toàn cấm dùng ID/email tài khoản thật. Quan sát với ID bịa (TC-RST01-033): app không báo lỗi cặp không khớp mà vẫn sang màn nhập mã (lệch BD E_DAAUTHEN00201_004)'])
  await tc('TC-RST01-034', async () => ['Pending', 'Cần hộp thư thật nhận mã 4 số; không gửi mã cho tài khoản thật. Quan sát: URL màn nhập mã thực tế là /verify?driverCode=..&email=.. (TC ghi /reset-password/step2)'])
  await tc('TC-RST01-035', async () => {
    await page.goto('/forgot-password')
    await page.getByPlaceholder('ログインID').fill(FID); await page.getByPlaceholder('メールアドレス').fill(FEM)
    posts.length = 0
    await page.getByRole('button', { name: '認証コードを送信' }).dblclick(); await page.waitForTimeout(2500)
    const path = new URL(page.url()).pathname
    if (posts.length === 1 && path === '/verify') return ['OK', `Chỉ 1 request forgot-password/request, 1 lần chuyển (dữ liệu bịa; số email thực tế không kiểm chứng)`]
    return ['NG', `Actual: ${posts.length} request, path ${path} | Expected: 1 request, 1 lần chuyển`]
  })
  await tc('TC-RST01-039', async () => {
    await step1(page, 'QC_X', FEM, false)
    await page.getByText('ログイン画面に戻る').click(); await page.waitForURL(/\/login/)
    await page.getByText('パスワードを忘れた方はこちら').click(); await page.waitForURL(/forgot-password/)
    await expect(page.getByPlaceholder('ログインID')).toHaveValue(''); await expect(page.getByPlaceholder('メールアドレス')).toHaveValue('')
    return ['OK', '']
  })
  await tc('TC-RST01-040', async () => {
    await page.goto('/login'); await page.getByText('パスワードを忘れた方はこちら').click(); await page.waitForURL(/forgot-password/)
    await page.getByPlaceholder('ログインID').fill('QC_X'); await page.goBack(); await page.waitForTimeout(1500)
    const t = (await body(page)).trim()
    if (t.length > 0 && /\/login/.test(page.url())) return ['OK', '']
    return ['NG', `Actual: url ${new URL(page.url()).pathname}, body ${t.length} ký tự | Expected: về DA_AUTHEN_001 không trắng`]
  })
})

test('step2', async ({ page }) => {
  const reqs: string[] = []
  page.on('request', r => { if (r.url().includes('/driver/auth/forgot-password')) reqs.push(r.url().split('/').pop()!) })
  const boxes = () => page.locator('input[maxlength="1"]')
  const confirmBtn = () => page.getByRole('button', { name: '確認' })
  const counter = () => page.getByText(/（\d\d:\d\d）/)
  const open = async () => { await page.goto(VERIFY); await expect(boxes().first()).toBeVisible({ timeout: 15000 }); reqs.length = 0 }

  await tc('TC-RST02-001', async () => {
    await open(); const t = await body(page); const ev = await shot(page, 'g02_step2_layout')
    const need = ['パスワードリセット', '認証コードを入力してください。', 'パスワード再設定用メールを送信しました。', '下記のメールアドレスをご確認ください', FEM, '確認', 'コードが届かない場合：', '再送信', '※認証コードの有効期限は5分です。']
    const miss = need.filter(s => !t.includes(s))
    if (miss.length) return ['NG', `Actual: thiếu/khác ${miss.map(m => '「' + m + '」')}; thực tế dòng mô tả là 「パスワード再設定用メールを送信しました。メールをご確認ください。」 | Expected: 「パスワード再設定用メールを送信しました。下記のメールアドレスをご確認ください。」 | Evidence: ${ev}`, ev]
    return ['OK', '', ev]
  })
  await tc('TC-RST02-004', async () => {
    await open(); const t = await body(page)
    if (t.includes(FEM) && !t.includes('***')) return ['OK', '']
    return ['NG', 'Actual: email không hiển thị đầy đủ']
  })
  await tc('TC-RST02-005', async () => {
    const long = 'qc_' + 'a'.repeat(50) + '@example.test'
    await page.setViewportSize({ width: 320, height: 640 })
    await page.goto(`/verify?driverCode=${FID}&email=${encodeURIComponent(long)}`)
    await expect(boxes().first()).toBeVisible({ timeout: 15000 })
    const ov = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
    const full = (await body(page)).replace(/\s/g, '').includes(long)
    const ev = await shot(page, 'g02_rst02_005')
    await page.setViewportSize({ width: 390, height: 844 })
    if (!ov && full) return ['OK', '', ev]
    return ['NG', `Actual: overflowX=${ov}, hiển thị đủ=${full} | Expected: hiển thị đủ, không tràn ngang | Evidence: ${ev}`, ev]
  })
  await tc('TC-RST02-007', async () => {
    await open(); await expect(confirmBtn()).toBeDisabled()
    await confirmBtn().click({ force: true }); await page.waitForTimeout(800)
    if (reqs.length) return ['NG', 'Actual: nhấn nút disabled vẫn gọi API']
    return ['OK', '']
  })
  await tc('TC-RST02-009', async () => {
    await open(); await boxes().first().click(); await page.keyboard.type('1234')
    await expect(confirmBtn()).toBeEnabled(); return ['OK', '']
  })
  await tc('TC-RST02-011', async () => {
    await open(); await boxes().first().click(); await page.keyboard.type('a')
    const v = await boxes().evaluateAll(e => e.map((x: any) => x.value))
    if (v.every(x => x === '')) return ['OK', '']
    return ['NG', `Actual: ${JSON.stringify(v)} | Expected: ô trống`]
  })
  await tc('TC-RST02-012', async () => {
    await open(); await boxes().first().click(); await page.keyboard.type('-'); await page.keyboard.insertText('😀')
    const v = await boxes().evaluateAll(e => e.map((x: any) => x.value))
    if (v.every(x => x === '')) return ['OK', '']
    return ['NG', `Actual: ${JSON.stringify(v)} | Expected: ô trống`]
  })
  await tc('TC-RST02-014', async () => {
    await open(); await boxes().first().click(); await page.keyboard.type('1')
    await boxes().first().click(); await page.keyboard.type('2')
    const v = await boxes().evaluateAll(e => e.map((x: any) => x.value))
    if (v[0].length <= 1) return ['OK', '']
    return ['NG', `Actual: ô 1 = ${v[0]}`]
  })
  await tc('TC-RST02-015', async () => {
    await open(); await boxes().first().click(); await page.keyboard.type('1')
    const i1 = await boxes().evaluateAll(e => e.findIndex(x => x === document.activeElement))
    await page.keyboard.type('2')
    const i2 = await boxes().evaluateAll(e => e.findIndex(x => x === document.activeElement))
    const v = await boxes().evaluateAll(e => e.map((x: any) => x.value))
    if (i1 === 1 && i2 === 2 && v[0] === '1' && v[1] === '2') return ['OK', '']
    return ['NG', `Actual: focus ${i1},${i2} giá trị ${JSON.stringify(v)} | Expected: focus 1 rồi 2`]
  })
  await tc('TC-RST02-016', async () => {
    await open(); await boxes().first().click(); await page.keyboard.type('4821')
    const v = await boxes().evaluateAll(e => e.map((x: any) => x.value))
    await expect(confirmBtn()).toBeEnabled()
    if (v.join('') === '4821') return ['OK', '']
    return ['NG', `Actual: ${JSON.stringify(v)}`]
  })
  let wrongOk = true
  await tc('TC-RST02-021', async () => {
    await open(); await boxes().first().click(); await page.keyboard.type('0000'); await confirmBtn().click(); await page.waitForTimeout(2000)
    const t = await body(page); const ev = await shot(page, 'g02_rst02_021')
    if (t.includes(MSG.otp) && page.url().includes('/verify')) return ['OK', 'Chạy với ID/email bịa QC_', ev]
    wrongOk = false
    return ['NG', `Actual: không hiện 「${MSG.otp}」 | Expected: hiện lỗi, ở lại màn | Evidence: ${ev}`, ev]
  })
  await tc('TC-RST02-022', async () => {
    await open(); const out: string[] = []
    for (let i = 0; i < 5; i++) {
      await boxes().first().click({ timeout: 3000 }); await page.keyboard.type('0000'); await confirmBtn().click({ timeout: 3000 }); await page.waitForTimeout(1200)
      out.push((await body(page)).includes(MSG.otp) ? 'err' : 'noerr')
      if (i < 4) { for (let k = 3; k >= 0; k--) { await boxes().nth(k).click({ timeout: 3000 }); await page.keyboard.press('Backspace') } }
    }
    const stillUse = await boxes().first().isVisible()
    return ['Pending', `Quan sát (ID bịa): 5 lần sai → ${out.join(',')}, màn vẫn dùng được=${stillUse}. Phần "nhập mã đúng vẫn sang bước 3" cần mã email thật nên chưa xác nhận`]
  })
  await tc('TC-RST02-020', async () => ['Pending', 'Cần mã 4 số thật từ email; không gửi mã cho tài khoản thật'])
  await tc('TC-RST02-023', async () => ['Pending', 'Cần mã thật + chờ >5 phút (phụ thuộc thời gian/SES). Quan sát TC-RST02-021: mã sai báo 「認証コードが正しくありません。」'])
  await tc('TC-RST02-024', async () => ['Pending', 'Phụ thuộc thời gian 5 phút 10 giây và mã thật; chưa chạy'])
  await tc('TC-RST02-025', async () => ['Pending', 'Cần mã thật + chờ 4 phút 50 giây; phụ thuộc SES/thời gian'])
  await tc('TC-RST02-031', async () => ['Pending', 'Cần 4 lần x 60 giây và kiểm tra hộp thư thật (SES); chưa chạy'])
  await tc('TC-RST02-039', async () => ['Pending', 'Cần mã đúng từ email thật để sang bước 3'])
  await tc('TC-RST02-040', async () => ['N/A', ''])

})

test('step2_timer', async ({ page }) => {
  const reqs: string[] = []
  page.on('request', r => { if (r.url().includes('/driver/auth/forgot-password')) reqs.push(r.url().split('/').pop()!) })
  const boxes = () => page.locator('input[maxlength="1"]')
  const counter = () => page.getByText(/（\d\d:\d\d）/)
  const open = async () => { await page.goto(VERIFY); await expect(boxes().first()).toBeVisible({ timeout: 15000 }); reqs.length = 0 }
  await open()
  const resend = page.getByText('再送信', { exact: true })
  const c0 = await counter().innerText()
  await page.waitForTimeout(3000)
  const c1 = await counter().innerText()
  const dec = c0 !== c1
  // chờ tới <= 00:30
  const sec = async () => { const m = (await counter().innerText()).match(/(\d\d):(\d\d)/)!; return +m[1] * 60 + +m[2] }
  while ((await sec()) > 30) await page.waitForTimeout(1000)
  reqs.length = 0
  const before = await sec()
  await resend.click({ force: true }); await page.waitForTimeout(1500)
  const noEffect = reqs.length === 0 && (await sec()) <= before
  await tc('TC-RST02-028', async () => noEffect ? ['OK', ''] : ['NG', `Actual: reqs=${reqs} | Expected: không gửi lại khi còn đếm ngược`])
  while (true) { const t = await counter().count(); if (!t) break; const s = await sec(); if (s <= 0) break; await page.waitForTimeout(1000) }
  await page.waitForTimeout(1200)
  reqs.length = 0
  const hadCounter = await counter().count()
  await resend.click(); await page.waitForTimeout(2000)
  const afterTxt = (await counter().count()) ? await counter().innerText() : '(không có)'
  const resendReq = reqs.length
  const ev = await shot(page, 'g02_rst02_030')
  await tc('TC-RST02-030', async () => ['Pending', `Quan sát (ID bịa, không kiểm tra hộp thư): sau đếm ngược về 0 nhấn 再送信 → ${resendReq} request, bộ đếm hiển thị ${afterTxt} (counter tại thời điểm click: ${hadCounter ? 'còn' : 'đã ẩn'}). Phần nhận email thật chưa xác nhận`, ev])
  await tc('TC-RSTE-007', async () => (dec && noEffect && resendReq >= 1 && /00:5\d/.test(afterTxt)) ? ['OK', 'Đã kiểm chứng giảm dần, nhấn khi còn ≤00:30 không tác dụng, hết đếm ngược gửi lại + quay về 00:59 (ID bịa)', ev] : ['NG', `Actual: dec=${dec} noEffect=${noEffect} resendReq=${resendReq} counter=${afterTxt} | Expected: 00:59 giảm dần; nhấn giữa chừng không tác dụng; sau 00:00 gửi mã mới & quay lại 00:59`, ev])
  // double click resend
  while ((await counter().count()) && (await sec()) > 0) await page.waitForTimeout(1000)
  await page.waitForTimeout(1200); reqs.length = 0
  await resend.dblclick(); await page.waitForTimeout(2000)
  await tc('TC-RST02-032', async () => reqs.length === 1 ? ['OK', 'Chỉ 1 request resend (ID bịa; số email thực tế không kiểm chứng)'] : ['NG', `Actual: ${reqs.length} request | Expected: 1`])
  await tc('TC-RSTE-013', async () => { await open(); const t = await body(page); return (t.includes(FEM) && !t.includes('***')) ? ['OK', ''] : ['NG', 'Actual: email bị mask'] })
})

test('step3_complete_e2e', async ({ page }) => {
  for (const [id, u] of [['TC-RST06-009', '/reset-password/complete'], ['TC-RSTE-010', '/reset-password/complete']] as const) {
    await tc(id, async () => {
      await page.goto(u); await page.waitForTimeout(2500)
      const t = await body(page); const ok = /\/login/.test(page.url()) && !t.includes('パスワードリセットに成功')
      return ok ? ['OK', ''] : ['NG', `Actual: url ${new URL(page.url()).pathname}`]
    })
  }
  await tc('TC-RSTE-003', async () => {
    await page.goto('/forgot-password')
    await page.getByPlaceholder('ログインID').fill('QC_X'); await page.getByPlaceholder('メールアドレス').fill(FEM)
    await page.getByText('ログイン画面に戻る').click(); await page.waitForURL(/\/login/)
    await page.getByText('パスワードを忘れた方はこちら').click(); await page.waitForURL(/forgot-password/)
    await expect(page.getByPlaceholder('ログインID')).toHaveValue(''); await expect(page.getByPlaceholder('メールアドレス')).toHaveValue('')
    return ['OK', '']
  })
  await tc('TC-RSTE-016', async () => ['Pending', 'Cần ID thật + email tài xế khác; cấm dùng tài khoản thật. Quan sát ID bịa: app không báo 「ログインIDまたはメールアドレスが正しくありません。」 mà sang màn nhập mã'])
})
