import { test, expect } from '@playwright/test'

test.use({ storageState: '.auth/e04.json' })

// TC_AUTO_017 — /menu-management/:id: 注文詳細編集画面の基本表示確認
// Source: es-kitchen-repository/es-kitchen-web-supplier/src/pages/menu-management/MenuManagementDetailPage.tsx
//
// NOTE: 実際の purchase order ID は DEV 環境データに依存する。
// ID が存在しない場合は空テーブルが表示される (API エラーにはならない設計)。
//
// Selectors rationale:
//   - heading: getByRole('heading', { name: '注文詳細編集' }) — titleClassName="font-medium"
//   - ブレッドクラム: getByRole('link', { name: '注文管理' })
//   - CSV出力ボタン: getByRole('button', { name: 'CSV出力' })
//   - 仮発注ボタン: getByRole('button', { name: '仮発注' })
//   - 本発注ボタン: getByRole('button', { name: '本発注' })
//   - 検索フォームの表示切替: getByRole('button', { name: '検索フォームの表示切替' })
//   - 商品名フィルター input: getByPlaceholder('商品名')
//   - 注文年月フィルター: getByPlaceholder('注文年月')
//   - 検索ボタン: getByRole('button', { name: '検索' })
//   - 契約登録ボタン: getByRole('button', { name: '契約登録' })
test('TC_AUTO_017 — 存在しない注文IDでアクセスしても画面が表示されること', async ({ page }) => {
  // Arrange — 存在しない ID でアクセス (空テーブルが表示されるはず)
  await page.goto('/menu-management/nonexistent-id-000')
  await page.waitForLoadState('networkidle')

  // Assert — ページタイトル: breadcrumb + title span の両方に "注文詳細編集" が存在するため
  // exact: true でも 2 要素 hit する → breadcrumb span を除外して title span を特定する
  // BaseHeadingBreadcrumb の title は <h1> 内の <span> として描画される
  await expect(page.getByRole('heading').getByText('注文詳細編集', { exact: true })).toBeVisible()

  // Assert — 主要ボタンが存在すること
  await expect(page.getByRole('button', { name: 'CSV出力' })).toBeVisible()
  await expect(page.getByRole('button', { name: '仮発注' })).toBeVisible()
  await expect(page.getByRole('button', { name: '本発注' })).toBeVisible()

  // Assert — フィルターフォーム
  await expect(page.getByRole('button', { name: '検索フォームの表示切替' })).toBeVisible()
  await expect(page.getByPlaceholder('商品名')).toBeVisible()

  // Assert — テーブルヘッダー
  await expect(page.getByRole('columnheader', { name: '商品名' })).toBeVisible()
  await expect(page.getByRole('columnheader', { name: 'カテゴリ' })).toBeVisible()
  await expect(page.getByRole('columnheader', { name: 'ステータス' })).toBeVisible()
  await expect(page.getByRole('columnheader', { name: '操作' })).toBeVisible()
})

test('TC_AUTO_017b — 注文詳細編集: 注文管理ブレッドクラムをクリックすると注文管理一覧に戻ること', async ({ page }) => {
  // Arrange
  await page.goto('/menu-management/nonexistent-id-000')
  await page.waitForLoadState('networkidle')

  // Act — ブレッドクラム「注文管理」リンクをクリック
  await page.getByRole('link', { name: '注文管理' }).click()
  await page.waitForLoadState('networkidle')

  // Assert — 注文管理一覧画面に遷移すること
  await expect(page).toHaveURL(/\/menu-management$/)
  await expect(page.getByRole('heading', { name: '注文管理' })).toBeVisible()
})
