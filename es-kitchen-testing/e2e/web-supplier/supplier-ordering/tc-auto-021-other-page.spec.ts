import { test, expect } from '@playwright/test'

test.use({ storageState: '.auth/e04.json' })

// TC_AUTO_021 — /other: その他ページの基本表示確認
// Source: es-kitchen-repository/es-kitchen-web-supplier/src/pages/other/OtherPage.tsx
//
// OtherPage は現時点で最小実装: <h1>その他</h1> のみ表示。
//
// Selectors rationale:
//   - heading: getByRole('heading', { name: 'その他' }) — <h1> タグを使用しているため getByRole が有効
test('TC_AUTO_021 — その他ページが正しく表示される', async ({ page }) => {
  // Arrange
  await page.goto('/other')
  await page.waitForLoadState('networkidle')

  // Assert — URL
  await expect(page).toHaveURL(/\/other/)

  // Assert — ページタイトル (<h1> タグ)
  await expect(page.getByRole('heading', { name: 'その他' })).toBeVisible()
})
