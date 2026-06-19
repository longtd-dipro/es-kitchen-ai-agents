import { test, expect } from '@playwright/test'

test.use({ storageState: '.auth/e04.json' })

// TC-SW_PROF_001-030 — AC-1: Truy cập màn hình Profile từ navigation menu
// Source: es-kitchen-repository/es-kitchen-web-supplier/src/constants/nav.ts
//   - NAV_ITEMS: key "profile", labelJa "プロフィール", href ROUTE.PROFILE = "/profile"
//   - icon: UserIcon from @phosphor-icons/react
// Source: src/pages/profile/ProfilePage.tsx
//   - BaseHeadingBreadcrumb title="プロフィール"
//   - breadcrumbItems: [{ title: <Link to={ROUTE.DASHBOARD}>TOP</Link> }]
//   - heading h1: "プロフィール" (font.display xs.medium — 24px)
// Source: src/components/Common/Nav/index.tsx
//   - renders NAV_ITEMS as links/buttons in sidebar
//
// Selectors:
//   - nav link "プロフィール": getByRole('link', { name: /プロフィール/ })
//   - page heading:           getByRole('heading', { name: 'プロフィール' })
//   - breadcrumb TOP link:    getByRole('link', { name: 'TOP' })
test('TC-SW_PROF_001-030 — Truy cập màn hình Profile từ nav menu', async ({ page }) => {
  // Arrange — đến trang TOP trước
  await page.goto('/dashboard')
  await page.waitForLoadState('networkidle')

  // Assert — sidebar hiển thị item プロフィール
  // Nav dùng antd Menu → render <li role="menuitem"> không phải <a>
  // Dùng getByRole('menuitem') hoặc getByText để locate
  await expect(page.getByRole('menuitem', { name: /プロフィール/ })).toBeVisible()

  // Act — click nav item プロフィール
  await page.getByRole('menuitem', { name: /プロフィール/ }).click()
  await page.waitForLoadState('networkidle')

  // Assert — URL chuyển sang /profile
  await expect(page).toHaveURL(/\/profile/)

  // Assert — heading page hiển thị đúng
  await expect(page.getByRole('heading', { name: 'プロフィール' })).toBeVisible()

  // Assert — breadcrumb TOP link hiển thị
  await expect(page.getByRole('link', { name: 'TOP' })).toBeVisible()
})
