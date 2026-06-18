import { test, expect } from '@playwright/test'

test.use({ storageState: '.auth/e04.json' })

// TC_AUTO_012 — /orders: 受注一覧画面の基本表示確認
// Source: es-kitchen-repository/es-kitchen-web-supplier/src/pages/orders/OrdersPage.tsx
//
// Selectors rationale:
//   - heading: getByRole('heading') — ページタイトル "受注一覧"
//   - 検索ボタン: getByRole('button', { name: /検索/ }) — regex で antd Button accessible name にマッチ
//     (antd Button の children "検索" は <button><span>検索</span></button> と描画されるため exact string より regex が安定)
//   - Select: getByRole('combobox') — antd Select の実際の role
test('TC_AUTO_012 — 受注一覧画面が正しく表示される', async ({ page }) => {
  // Arrange
  await page.goto('/orders')
  await page.waitForLoadState('networkidle')

  // Assert — URL
  await expect(page).toHaveURL(/\/orders/)

  // Assert — ページタイトル
  await expect(page.getByRole('heading', { name: '受注一覧' })).toBeVisible()

  // Assert — 検索ボタン: regex match で antd span wrapper を回避
  await expect(page.getByRole('button', { name: /検索/ })).toBeVisible()

  // Assert — ステータスドロップダウン: antd Select は role="combobox" で描画される
  await expect(page.getByRole('combobox').first()).toBeVisible()

  // Assert — テーブルヘッダー列が存在すること
  await expect(page.getByRole('columnheader', { name: '受注No' })).toBeVisible()
  await expect(page.getByRole('columnheader', { name: '受注日' })).toBeVisible()
  await expect(page.getByRole('columnheader', { name: '商品名' })).toBeVisible()
  await expect(page.getByRole('columnheader', { name: '受注状況' })).toBeVisible()
  await expect(page.getByRole('columnheader', { name: '希望納期' })).toBeVisible()
})
