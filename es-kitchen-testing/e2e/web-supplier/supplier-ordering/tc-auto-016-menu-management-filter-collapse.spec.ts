import { test, expect } from '@playwright/test'

test.use({ storageState: '.auth/e04.json' })

// TC_AUTO_016 — /menu-management: FilterCollapseの開閉動作確認
// Source: es-kitchen-repository/es-kitchen-web-supplier/src/pages/menu-management/components/FilterCollapse.tsx
//
// FilterCollapse は初期状態で開いている (isSearchOpen = true)。
// トグルボタンをクリックすると閉じ、もう一度クリックすると開く。
// aria-expanded 属性でアクセシブルに制御されている。
//
// Selectors rationale:
//   - トグルボタン: getByRole('button', { name: '検索フォームの表示切替' })
//   - フォーム内コンテンツ: getByPlaceholder('注文年月') (表示/非表示を確認)
test('TC_AUTO_016 — FilterCollapse のトグルで検索フォームが開閉される', async ({ page }) => {
  // Arrange
  await page.goto('/menu-management')
  await page.waitForLoadState('networkidle')

  const toggleBtn = page.getByRole('button', { name: '検索フォームの表示切替' })
  const filterInput = page.getByPlaceholder('注文年月')

  // Assert — 初期状態: フォームが表示されている
  await expect(filterInput).toBeVisible()
  await expect(toggleBtn).toHaveAttribute('aria-expanded', 'true')

  // Act — トグルボタンをクリックして閉じる
  await toggleBtn.click()

  // Assert — フォームが非表示になること
  await expect(toggleBtn).toHaveAttribute('aria-expanded', 'false')
  // FilterCollapse は max-height + opacity CSS でアニメーションする。
  // Playwright の toBeHidden() は display:none / visibility:hidden のみ検知し、
  // max-height:0 による clip は "hidden" と判定しない。
  // そのため親コンテナの CSS クラスで閉じ状態を確認する。
  await expect(toggleBtn.locator('xpath=ancestor::div[contains(@class,"border-l-2")]')
    .locator('div').nth(1)).toHaveClass(/max-h-8/, { timeout: 2000 })

  // Act — 再度クリックして開く
  await toggleBtn.click()

  // Assert — フォームが再表示されること
  await expect(toggleBtn).toHaveAttribute('aria-expanded', 'true')
  await expect(filterInput).toBeVisible({ timeout: 1000 })
})
