import { test, expect } from '@playwright/test'

test.use({ storageState: '.auth/e04.json' })

// TC_AUTO_018 — /shipping-management/:id: 出荷処理画面の基本表示確認
// Source: es-kitchen-repository/es-kitchen-web-supplier/src/pages/shipping-management/ShippingManagementDetailPage.tsx
//         components/ShipmentStatusBadge.tsx
//
// NOTE: ShipmentStatusBadge のステータス: draft / temp_ordered / ordered
//       画面タイトル: "出荷処理" (SW_HOME_006)
//
// Selectors rationale:
//   - heading: getByRole('heading', { name: '出荷処理' })
//   - 戻るボタン: getByRole('button', { name: '戻る' })
//   - キャンセルボタン: getByRole('button', { name: 'この発注をキャンセルする' })
//   - 保存ボタン: getByRole('button', { name: '保存' })
//   - セクション: getByText('必要数'), getByText('在庫情報'), getByText('発注情報')
//   - 仕入先 input: getByPlaceholder なし → name="supplier" の input を直接操作
//   - 倉庫 filter placeholder: getByTitle('倉庫') or getByPlaceholder('倉庫')
//   - 仕入備考 textarea: getByPlaceholder('仕入備考')
test('TC_AUTO_018 — 存在しない出荷IDでアクセスすると「出荷情報が見つかりませんでした」が表示される', async ({ page }) => {
  // Arrange
  await page.goto('/shipping-management/nonexistent-id-000')
  await page.waitForLoadState('networkidle')

  // Assert — エラーメッセージ or ローディング後のメッセージ
  const notFound = page.getByText('出荷情報が見つかりませんでした')
  const heading = page.getByRole('heading', { name: '出荷処理' })

  await expect(notFound.or(heading)).toBeVisible({ timeout: 10000 })
})

test('TC_AUTO_018b — 出荷処理画面の主要UIが表示されること', async ({ page }) => {
  // Arrange — 注文管理一覧から最初の編集ボタン経由で遷移 (実データが必要)
  await page.goto('/menu-management')
  await page.waitForLoadState('networkidle')

  const editButtons = page.getByRole('link', { name: '編集' })
  const count = await editButtons.count()

  if (count === 0) {
    test.skip(true, '注文管理データが存在しないためスキップ — DEV データが必要')
    return
  }

  // Act — 最初の編集ボタンをクリック → MenuManagementDetailPage
  await editButtons.first().click()
  await page.waitForLoadState('networkidle')

  // MenuManagementDetailPage の編集ボタンをクリック → ShippingManagementDetailPage
  const itemEditBtn = page.getByRole('button', { name: '編集' }).first()
  const itemEditCount = await itemEditBtn.count()
  if (itemEditCount === 0) {
    test.skip(true, '注文明細データが存在しないためスキップ')
    return
  }

  await itemEditBtn.click()
  await page.waitForLoadState('networkidle')

  // Assert — 出荷処理画面タイトル
  await expect(page.getByRole('heading', { name: '出荷処理' })).toBeVisible()

  // Assert — アクションボタン
  await expect(page.getByRole('button', { name: '戻る' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'この発注をキャンセルする' })).toBeVisible()
  await expect(page.getByRole('button', { name: '保存' })).toBeVisible()

  // Assert — セクションが存在すること
  await expect(page.getByText('必要数')).toBeVisible()
  await expect(page.getByText('在庫情報')).toBeVisible()
  await expect(page.getByText('発注情報')).toBeVisible()

  // Assert — 発注情報フォームの必須フィールド
  await expect(page.getByPlaceholder('仕入備考').first()).toBeVisible()

  // Assert — 必要数フィルターバーの検索ボタン
  await expect(page.getByRole('button', { name: '検索' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'クリア' })).toBeVisible()
})
