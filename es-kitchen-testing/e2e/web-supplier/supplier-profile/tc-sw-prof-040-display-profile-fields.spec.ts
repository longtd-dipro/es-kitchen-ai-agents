import { test, expect } from '@playwright/test'

test.use({ storageState: '.auth/e04.json' })

// TC-SW_PROF_001-040 — AC-2: Hiển thị đủ 4 trường thông tin tài khoản
// Source: es-kitchen-repository/es-kitchen-web-supplier/src/pages/profile/ProfilePage.tsx
//   - ReadOnlyRow label="仕入先コード"    → giá trị từ profile.supplierCode
//   - Controller name="supplierName"       → input với giá trị prefill
//   - Controller name="email"              → input với giá trị prefill
//   - ReadOnlyRow label="最終ログイン"      → format "YYYY-MM-DD HH:mm JST"
//   - useQuery queryKey: ["supplier-profile"] → GET /supplier/account/me
//
// Selectors:
//   - label "仕入先コード":  getByText('仕入先コード')
//   - label "仕入先名":      getByText('仕入先名')
//   - label "メールアドレス": getByText('メールアドレス')
//   - label "最終ログイン":   getByText('最終ログイン')
//   - input supplierName:    getByPlaceholder('仕入先名を入力してください')
//   - input email:           getByPlaceholder('メールアドレスを入力してください')
//   - 必須 badge (x2):       getByText('必須')
test('TC-SW_PROF_001-040 — Hiển thị đủ 4 trường thông tin tài khoản', async ({ page }) => {
  // Arrange
  await page.goto('/profile')
  await page.waitForLoadState('networkidle')

  // Assert — URL đúng
  await expect(page).toHaveURL(/\/profile/)

  // Assert — 4 label rows hiển thị
  await expect(page.getByText('仕入先コード')).toBeVisible()
  await expect(page.getByText('仕入先名')).toBeVisible()
  await expect(page.getByText('メールアドレス')).toBeVisible()
  await expect(page.getByText('最終ログイン')).toBeVisible()

  // Assert — input fields hiển thị với placeholder (page is always-edit per Figma design)
  await expect(page.getByPlaceholder('仕入先名を入力してください')).toBeVisible()
  await expect(page.getByPlaceholder('メールアドレスを入力してください')).toBeVisible()

  // Assert — Required badges (必須) hiển thị cho cả 2 editable fields
  const requiredBadges = page.getByText('必須')
  await expect(requiredBadges).toHaveCount(2)

  // Assert — buttons キャンセル + 保存 hiển thị (always visible per Figma)
  // antd Button wraps text in <span> — use locator filter instead of getByRole name
  await expect(page.locator('button').filter({ hasText: /キャンセル/ })).toBeVisible()
  await expect(page.locator('button').filter({ hasText: /^保存$/ })).toBeVisible()
})
