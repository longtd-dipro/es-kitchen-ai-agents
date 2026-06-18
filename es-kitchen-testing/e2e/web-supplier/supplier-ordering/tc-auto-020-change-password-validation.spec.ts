import { test, expect } from '@playwright/test'

test.use({ storageState: '.auth/e04.json' })

// TC_AUTO_020 — /change-password: バリデーションエラーの確認
// Source: es-kitchen-repository/es-kitchen-web-supplier/src/validation/schemas.ts
//
// changePasswordSchema のバリデーションルール:
//   oldPassword: required("現在のパスワードは必須項目です。") + max(20) + matches(REGEX.PASSWORD, "8桁以上で英文字・数字を含めてください。")
//   newPassword: required("新しいパスワードは必須項目です。") + max(20) + matches(REGEX.PASSWORD, "8桁以上で英文字・数字を含めてください。")
//   confirmNewPassword: required("パスワード（確認用）は必須項目です。") + oneOf([ref("newPassword")], "パスワードが一致しません。")
//
// Selectors rationale:
//   - 実行ボタン: getByRole('button', { name: /実行/ }) — regex で antd <span> wrapper を回避
//     (screenshot 確認済み: button は紫背景 "実行" として描画される)
//   - エラーメッセージ: getByText('...') — BaseInputPassword の error prop で表示
test('TC_AUTO_020 — 空のまま送信すると必須エラーが表示される', async ({ page }) => {
  // Arrange
  await page.goto('/change-password')
  await page.waitForLoadState('networkidle')

  // Act — 何も入力せずに実行ボタンをクリック
  await page.getByRole('button', { name: /実行/ }).click()

  // Assert — 必須エラーメッセージが表示されること
  await expect(page.getByText('現在のパスワードは必須項目です。')).toBeVisible()
  await expect(page.getByText('新しいパスワードは必須項目です。')).toBeVisible()
  await expect(page.getByText('パスワード（確認用）は必須項目です。')).toBeVisible()
})

test('TC_AUTO_020b — 新しいパスワードと確認用が不一致の場合エラーが表示される', async ({ page }) => {
  // Arrange
  await page.goto('/change-password')
  await page.waitForLoadState('networkidle')

  const currentPwInput = page.getByPlaceholder('現在のパスワードを入力してください')
  const newPwInputs = page.getByPlaceholder('新しいパスワードを入力してください')

  // Act — 現在のパスワードと新しいパスワードを入力 (確認用を意図的に別の値にする)
  await currentPwInput.fill('OldPass123')
  await newPwInputs.first().fill('NewPass456')
  await newPwInputs.nth(1).fill('DifferentPass789')

  // Act — 送信
  await page.getByRole('button', { name: /実行/ }).click()

  // Assert — パスワード不一致エラー
  await expect(page.getByText('パスワードが一致しません。')).toBeVisible()
})

test('TC_AUTO_020c — パスワードフォーマット不正の場合エラーが表示される', async ({ page }) => {
  // Arrange
  await page.goto('/change-password')
  await page.waitForLoadState('networkidle')

  const currentPwInput = page.getByPlaceholder('現在のパスワードを入力してください')
  const newPwInputs = page.getByPlaceholder('新しいパスワードを入力してください')

  // Act — 数字のみ (英字なし) を入力 → REGEX.PASSWORD に不一致
  await currentPwInput.fill('12345678')
  await newPwInputs.first().fill('12345678')
  await newPwInputs.nth(1).fill('12345678')

  await page.getByRole('button', { name: /実行/ }).click()

  // Assert — フォーマットエラー
  await expect(page.getByText('8桁以上で英文字・数字を含めてください。').first()).toBeVisible()
})
