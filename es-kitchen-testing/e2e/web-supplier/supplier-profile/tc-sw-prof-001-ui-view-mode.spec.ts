import { test, expect } from '@playwright/test'

test.use({ storageState: '.auth/e04.json' })

// TC-SW_PROF_001-001 — UI: Màn hình Profile hiển thị đúng layout E04
// Figma: SW_PROF_001 node 21065:85745
//   - Sidebar ~120px width với nav items: TOP, 受注一覧, パスワード変更, プロフィール (active/blue)
//   - Header ~54px: ESSTATION logo + greeting + user avatar
//   - Page heading: "プロフィール" (font 24px medium)
//   - Profile card: 4 rows — 仕入先コード, 仕入先名, メールアドレス, 最終ログイン
//   - Buttons キャンセル + 保存 luôn hiển thị ở header action area (không có 編集 toggle)
//
// Selectors theo Figma:
//   - page heading: getByRole('heading', { name: 'プロフィール' })
//   - label 仕入先コード: getByText('仕入先コード')
//   - button キャンセル: locator('button').filter({ hasText: /キャンセル/ })
//   - button 保存: locator('button').filter({ hasText: /^保存$/ })
test('TC-SW_PROF_001-001 — UI layout màn hình Profile hiển thị đúng', async ({ page }) => {
  // Arrange
  await page.goto('/profile')
  await page.waitForLoadState('networkidle')

  // Assert — URL đúng
  await expect(page).toHaveURL(/\/profile/)

  // Assert — page heading hiển thị
  await expect(page.getByRole('heading', { name: 'プロフィール' })).toBeVisible()

  // Assert — 4 field labels hiển thị
  await expect(page.getByText('仕入先コード')).toBeVisible()
  await expect(page.getByText('仕入先名')).toBeVisible()
  await expect(page.getByText('メールアドレス')).toBeVisible()
  await expect(page.getByText('最終ログイン')).toBeVisible()

  // Assert — action buttons キャンセル + 保存 hiển thị
  await expect(page.locator('button').filter({ hasText: /キャンセル/ })).toBeVisible()
  await expect(page.locator('button').filter({ hasText: /^保存$/ })).toBeVisible()

  // Assert — input fields 仕入先名 và メールアドレス hiển thị (editable)
  await expect(page.getByPlaceholder('仕入先名を入力してください')).toBeVisible()
  await expect(page.getByPlaceholder('メールアドレスを入力してください')).toBeVisible()
})
