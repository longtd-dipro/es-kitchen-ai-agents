import { test, expect } from '@playwright/test'

// TC_AUTO_003 — SW_SUPO_001: Logout -> session bi huy, redirect ve /login
// Source: src/components/Common/Header/index.tsx
//   - Trigger button: aria-label="アカウントメニューを開く" (Dropdown trigger)
//   - Popup dropdown: button type="button" nen dung getByRole('button', { name: 'ログアウト' })
//     (render: <button className={styles.logoutButton}><span>ログアウト</span></button>)
//   - handleFinishLogout: logout() -> router.replace(ROUTE.LOGIN) = "/login"
// Source: src/routes/guards/RequireAuth.tsx — redirect /login neu chua auth
test.use({ storageState: '.auth/e04.json' })

test('TC_AUTO_003 — Logout → redirect ve /login, session bi huy', async ({ page }) => {
  // Arrange
  await page.goto('/dashboard')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveURL(/\/dashboard/)

  // Act — click avatar button de mo dropdown (aria-label tu Header/index.tsx)
  await page.getByRole('button', { name: 'アカウントメニューを開く' }).click()

  // Assert — dropdown hien ra voi button "ログアウト" (render <button>...<span>ログアウト</span></button>)
  await expect(page.getByRole('button', { name: 'ログアウト' })).toBeVisible()

  // Act — click logout
  await page.getByRole('button', { name: 'ログアウト' }).click()

  // Assert — redirect ve /login
  // Dung /login$ de match ca localhost va staging URL
  await page.waitForURL(/\/login/, { timeout: 10000 })
  await expect(page).toHaveURL(/\/login/)

  // Assert — RequireAuth guard: khong the truy cap /dashboard sau khi logout
  await page.goto('/dashboard')
  await page.waitForURL(/\/login/, { timeout: 8000 })
  await expect(page).toHaveURL(/\/login/)
})
