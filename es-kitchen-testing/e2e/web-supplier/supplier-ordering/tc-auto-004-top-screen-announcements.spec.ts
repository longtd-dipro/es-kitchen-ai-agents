import { test, expect } from '@playwright/test'

// TC_AUTO_004 — SW_SUPO_004: /dashboard hien thi dung sau khi login
// Source: src/pages/dashboard/DashboardPage.tsx
//   - breadcrumb span: "TOP" (span tag, KHONG phai heading)
//   - h1 heading: "お知らせを確認する" (KHONG phai "ダッシュボード")
//   - tabs: "すべて" | "重要" | "お知らせ" (TABS constant trong DashboardPage.tsx)
//   - empty state text: "お知らせはありません" (khi khong co notice nao)
// Source: src/constants/nav.ts
//   - NAV_ITEMS[0]: { labelJa: "TOP", href: "/dashboard" } (KHONG phai "ダッシュボード")
//   - NAV_ITEMS[1]: { labelJa: "受注一覧", href: "/orders" }
test.use({ storageState: '.auth/e04.json' })

test('TC_AUTO_004 — Dashboard /dashboard hien thi heading va tabs お知らせ', async ({ page }) => {
  // Arrange
  await page.goto('/dashboard')
  await page.waitForLoadState('networkidle')

  // Assert — dung URL
  await expect(page).toHaveURL(/\/dashboard/)

  // Assert — h1 heading thuc te (DashboardPage.tsx: "お知らせを確認する")
  await expect(page.getByRole('heading', { name: 'お知らせを確認する' })).toBeVisible()

  // Assert — breadcrumb text "TOP" (span trong DashboardPage.tsx)
  await expect(page.getByText('TOP').first()).toBeVisible()

  // Assert — tabs hien thi (TABS constant: すべて / 重要 / お知らせ)
  await expect(page.getByRole('tab', { name: 'すべて' })).toBeVisible()
  await expect(page.getByRole('tab', { name: '重要' })).toBeVisible()
  await expect(page.getByRole('tab', { name: 'お知らせ' })).toBeVisible()

  // Assert — sidebar co menu item "TOP" (NAV_ITEMS[0].labelJa = "TOP")
  await expect(page.getByText('受注一覧').first()).toBeVisible()
})
