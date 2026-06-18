import { test, expect } from '@playwright/test'

// TC_AUTO_011 — /reset-success: パスワード再設定完了画面の表示確認
// Source: es-kitchen-repository/es-kitchen-web-supplier/src/pages/auth/ResetSuccessPage.tsx
//
// NOTE: /reset-success は canAccessResetSuccess() フラグが true の場合のみ表示可能。
// フラグが false の場合は /dashboard にリダイレクトされる。
// このテストはフラグなしで直接アクセスし、リダイレクト動作を確認する。
// 成功フロー (フラグあり) は reset-password フローの E2E 統合テストで確認。
test('TC_AUTO_011 — /reset-success にフラグなしで直接アクセスするとダッシュボードへリダイレクト', async ({ page }) => {
  // Arrange — フラグをセットせずに直接アクセス
  await page.goto('/reset-success')
  await page.waitForLoadState('networkidle')

  // Assert — ログイン画面またはダッシュボードへリダイレクトされること
  // canAccessResetSuccess() が false → router.replace(ROUTE.DASHBOARD) が呼ばれる
  // 未ログイン状態では /login へさらにリダイレクトされる可能性あり
  const url = page.url()
  const redirectedAway = !url.includes('/reset-success')
  expect(redirectedAway).toBe(true)
})
