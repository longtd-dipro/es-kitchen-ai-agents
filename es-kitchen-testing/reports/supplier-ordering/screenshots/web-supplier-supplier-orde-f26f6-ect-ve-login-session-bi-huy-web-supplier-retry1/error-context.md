# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: web-supplier/supplier-ordering/tc-auto-003-logout.spec.ts >> TC_AUTO_003 — Logout → redirect ve /login, session bi huy
- Location: e2e/web-supplier/supplier-ordering/tc-auto-003-logout.spec.ts:11:5

# Error details

```
TimeoutError: page.waitForURL: Timeout 8000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/login" until "load"
============================================================
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - img "ESSTATION Background" [ref=e6]
    - generic [ref=e8]:
      - img "ESSTATION" [ref=e10]
      - heading "ログイン" [level=1] [ref=e11]
      - generic [ref=e13]:
        - generic [ref=e15]:
          - generic [ref=e17]: ログインID
          - textbox "ログインID" [ref=e19]
        - generic [ref=e21]:
          - generic [ref=e23]: パスワード
          - generic [ref=e24]:
            - textbox "パスワード" [ref=e25]
            - button "Show" [ref=e27] [cursor=pointer]:
              - img "eye-invisible" [ref=e28]:
                - img [ref=e29]
        - button "ログイン" [ref=e32] [cursor=pointer]:
          - generic [ref=e35]: ログイン
        - link "パスワードを忘れた方はこちら" [ref=e37] [cursor=pointer]:
          - /url: /forgot-password
  - region "Notifications Alt+T"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | // TC_AUTO_003 — AC-02 / SW_SUPO_001: Logout — session bi huy, redirect ve /login
  4  | // Source: src/components/Common/Header/index.tsx
  5  | //   - Avatar button: aria-label "アカウントメニューを開く"
  6  | //   - Dropdown popup render: button voi text "ログアウト"
  7  | //   - handleFinishLogout: logout() → router.replace(ROUTE.LOGIN) → "/login"
  8  | // Source: src/constants/route.ts — ROUTE.LOGOUT = "/api/auth/signout"
  9  | test.use({ storageState: '.auth/e04.json' })
  10 | 
  11 | test('TC_AUTO_003 — Logout → redirect ve /login, session bi huy', async ({ page }) => {
  12 |   // Arrange — vao dashboard voi session da login
  13 |   await page.goto('/dashboard')
  14 |   await page.waitForLoadState('networkidle')
  15 |   await expect(page).toHaveURL(/\/dashboard/)
  16 | 
  17 |   // Act — mo dropdown tu avatar button (Header/index.tsx: aria-label "アカウントメニューを開く")
  18 |   await page.getByRole('button', { name: 'アカウントメニューを開く' }).click()
  19 |   await page.waitForTimeout(300)
  20 | 
  21 |   // Assert — dropdown hien ra voi nut ログアウト
  22 |   await expect(page.getByText('ログアウト')).toBeVisible()
  23 | 
  24 |   // Act — click ログアウト
  25 |   await page.getByText('ログアウト').click()
  26 | 
  27 |   // Assert — redirect ve /login
> 28 |   await page.waitForURL('**/login', { timeout: 8000 })
     |              ^ TimeoutError: page.waitForURL: Timeout 8000ms exceeded.
  29 |   await expect(page).toHaveURL(/\/login/)
  30 | 
  31 |   // Assert — khong the truy cap /dashboard khi da logout (RequireAuth guard)
  32 |   await page.goto('/dashboard')
  33 |   await page.waitForURL('**/login', { timeout: 5000 })
  34 |   await expect(page).toHaveURL(/\/login/)
  35 | })
  36 | 
```