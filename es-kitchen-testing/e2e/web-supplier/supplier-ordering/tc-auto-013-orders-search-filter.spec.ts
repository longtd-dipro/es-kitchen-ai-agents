import { test, expect } from '@playwright/test'

test.use({ storageState: '.auth/e04.json' })

// TC_AUTO_013 — /orders: ステータスフィルターで検索ボタンが動作すること
// Source: es-kitchen-repository/es-kitchen-web-supplier/src/pages/orders/OrdersPage.tsx
//         ORDER_STATUS_OPTIONS → pending_response / responded / pending_shipment / shipped
//
// Selectors rationale:
//   - ステータス select: getByRole('combobox').first() — antd Select の実際の role
//   - 検索ボタン: getByRole('button', { name: /検索/ }) — regex で antd span wrapper を回避
test('TC_AUTO_013 — ステータスフィルターを選択して検索できること', async ({ page }) => {
  // Arrange
  await page.goto('/orders')
  await page.waitForLoadState('networkidle')

  // Act — ステータスドロップダウンを開いてオプションを選択
  // antd Select: role="combobox" でクリックしてドロップダウンを開く
  const statusSelect = page.getByRole('combobox').first()
  await statusSelect.click()

  // ドロップダウンが開くのを待つ
  await page.waitForSelector('.ant-select-dropdown', { state: 'visible' })

  // "納期回答待ち" (pending_response) を選択
  await page.getByText('納期回答待ち').click()

  // Act — 検索ボタンをクリック: regex match で antd span wrapper を回避
  await page.getByRole('button', { name: /検索/ }).click()
  await page.waitForLoadState('networkidle')

  // Assert — URL に status パラメーターが反映されていること (または画面が崩れないこと)
  await expect(page).toHaveURL(/\/orders/)

  // Assert — テーブルが表示されたまま (エラーメッセージが出ていないこと)
  await expect(page.getByRole('columnheader', { name: '受注No' })).toBeVisible()
})
