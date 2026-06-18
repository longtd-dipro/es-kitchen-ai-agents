import { test, expect } from '@playwright/test'

test.use({ storageState: '.auth/e04.json' })

// TC_AUTO_015 — /menu-management: 注文管理画面の基本表示確認
// Source: es-kitchen-repository/es-kitchen-web-supplier/src/pages/menu-management/MenuManagementPage.tsx
//         components/FilterCollapse.tsx, components/PurchaseOrderStatusBadge.tsx
//
// Selectors rationale:
//   - heading: getByRole('heading', { name: '注文管理' })
//   - フィルター開閉ボタン: getByRole('button', { name: '検索フォームの表示切替' }) (aria-label)
//   - 注文年月 placeholder: getByPlaceholder('注文年月')
//   - メニュー種別 placeholder: getByTitle('メニュー種別') (antd Select)
//   - ステータス placeholder: getByTitle('ステータス') (antd Select)
//   - 検索ボタン: getByRole('button', { name: '検索' })
//   - クリアボタン: getByRole('button', { name: 'クリア' })
test('TC_AUTO_015 — 注文管理画面が正しく表示される', async ({ page }) => {
  // Arrange
  await page.goto('/menu-management')
  await page.waitForLoadState('networkidle')

  // Assert — URL
  await expect(page).toHaveURL(/\/menu-management/)

  // Assert — ページタイトル
  await expect(page.getByRole('heading', { name: '注文管理' })).toBeVisible()

  // Assert — FilterCollapse のトグルボタン (aria-label="検索フォームの表示切替")
  await expect(page.getByRole('button', { name: '検索フォームの表示切替' })).toBeVisible()

  // Assert — フィルターフォームが初期状態で表示されていること
  await expect(page.getByPlaceholder('注文年月')).toBeVisible()

  // Assert — 検索・クリアボタン
  await expect(page.getByRole('button', { name: '検索' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'クリア' })).toBeVisible()

  // Assert — テーブルヘッダー
  await expect(page.getByRole('columnheader', { name: '注文年月' })).toBeVisible()
  await expect(page.getByRole('columnheader', { name: 'メニュー種別' })).toBeVisible()
  await expect(page.getByRole('columnheader', { name: '出荷予定日' })).toBeVisible()
  await expect(page.getByRole('columnheader', { name: 'ステータス' })).toBeVisible()
  await expect(page.getByRole('columnheader', { name: '操作' })).toBeVisible()
})
