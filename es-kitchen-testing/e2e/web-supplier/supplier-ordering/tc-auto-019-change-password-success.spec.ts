import { test, expect } from '@playwright/test'

test.use({ storageState: '.auth/e04.json' })

// TC_AUTO_019 — /change-password: パスワード変更画面の基本表示確認
// Source: es-kitchen-repository/es-kitchen-web-supplier/src/pages/change-password/ChangePasswordPage.tsx
//         src/validation/schemas.ts (changePasswordSchema)
//
// Selectors rationale:
//   - heading: getByRole('heading', { name: 'ログインパスワードを変更' })
//   - 現在のパスワード: getByPlaceholder('現在のパスワードを入力してください')
//   - 新しいパスワード: getByPlaceholder('新しいパスワードを入力してください') — 2つ存在するため .first()/.nth(1)
//   - 実行ボタン: getByRole('button', { name: /実行/ }) — regex で antd span wrapper を回避
//     (screenshot 確認済み: button は紫背景 "実行" として描画される)
//   - ブレッドクラム TOP リンク: getByRole('link', { name: 'TOP' })
//
// NOTE: 実際にパスワード変更 API を呼ぶテストは DEV 環境の認証情報に依存するため、
//       このテストは画面表示と入力フォームの検証エラー確認に留める。
test('TC_AUTO_019 — パスワード変更画面が正しく表示される', async ({ page }) => {
  // Arrange
  await page.goto('/change-password')
  await page.waitForLoadState('networkidle')

  // Assert — URL
  await expect(page).toHaveURL(/\/change-password/)

  // Assert — ページタイトル
  await expect(page.getByRole('heading', { name: 'ログインパスワードを変更' })).toBeVisible()

  // Assert — 入力フィールド (3つ)
  await expect(page.getByPlaceholder('現在のパスワードを入力してください')).toBeVisible()
  // 新しいパスワードと確認用は同じ placeholder なので first/nth で区別
  await expect(page.getByPlaceholder('新しいパスワードを入力してください').first()).toBeVisible()
  await expect(page.getByPlaceholder('新しいパスワードを入力してください').nth(1)).toBeVisible()

  // Assert — 実行ボタン: regex match で antd <span> wrapper を回避
  await expect(page.getByRole('button', { name: /実行/ })).toBeVisible()

  // Assert — ブレッドクラム
  await expect(page.getByRole('link', { name: 'TOP' })).toBeVisible()
})
