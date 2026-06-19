# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: web-supplier/supplier-profile/tc-sw-prof-001-ui-view-mode.spec.ts >> TC-SW_PROF_001-001 — UI layout màn hình Profile hiển thị đúng
- Location: e2e/web-supplier/supplier-profile/tc-sw-prof-001-ui-view-mode.spec.ts:18:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('button').filter({ hasText: /^保存$/ })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('button').filter({ hasText: /^保存$/ })

```

```yaml
- complementary:
  - img "ES STATION"
  - navigation:
    - menu:
      - menuitem "TOP":
        - img
        - text: TOP
      - menuitem "受注一覧":
        - img
        - text: 受注一覧
      - menuitem "注文管理":
        - img
        - text: 注文管理
      - menuitem "その他":
        - img
        - text: その他
      - menuitem "プロフィール":
        - img
        - text: プロフィール
  - img "sidebar mascot"
  - button "toggle sidebar":
    - img "menu-fold"
- banner:
  - link "Logo お帰りなさい":
    - /url: /dashboard
    - img "Logo"
    - text: お帰りなさい
  - button "アカウントメニューを開く":
    - img "es-supplier@yopmail.com"
    - text: es-supplier@yopmail.com
    - img
- main:
  - navigation:
    - list:
      - listitem:
        - link "TOP":
          - /url: /dashboard
  - heading "プロフィール" [level=1]
  - button "キャンセル"
  - button "保 存"
  - text: 仕入先コード SP00003
  - separator
  - text: 仕入先名 必須
  - textbox "仕入先名を入力してください": My Supplier Co. 12345
  - separator
  - text: メールアドレス 必須
  - textbox "メールアドレスを入力してください": es-supplier@yopmail.com
  - separator
  - text: 最終ログイン 2026-06-19 09:51 JST
- region "Notifications Alt+T"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.use({ storageState: '.auth/e04.json' })
  4  | 
  5  | // TC-SW_PROF_001-001 — UI: Màn hình Profile hiển thị đúng layout E04
  6  | // Figma: SW_PROF_001 node 21065:85745
  7  | //   - Sidebar ~120px width với nav items: TOP, 受注一覧, パスワード変更, プロフィール (active/blue)
  8  | //   - Header ~54px: ESSTATION logo + greeting + user avatar
  9  | //   - Page heading: "プロフィール" (font 24px medium)
  10 | //   - Profile card: 4 rows — 仕入先コード, 仕入先名, メールアドレス, 最終ログイン
  11 | //   - Buttons キャンセル + 保存 luôn hiển thị ở header action area (không có 編集 toggle)
  12 | //
  13 | // Selectors theo Figma:
  14 | //   - page heading: getByRole('heading', { name: 'プロフィール' })
  15 | //   - label 仕入先コード: getByText('仕入先コード')
  16 | //   - button キャンセル: locator('button').filter({ hasText: /キャンセル/ })
  17 | //   - button 保存: locator('button').filter({ hasText: /^保存$/ })
  18 | test('TC-SW_PROF_001-001 — UI layout màn hình Profile hiển thị đúng', async ({ page }) => {
  19 |   // Arrange
  20 |   await page.goto('/profile')
  21 |   await page.waitForLoadState('networkidle')
  22 | 
  23 |   // Assert — URL đúng
  24 |   await expect(page).toHaveURL(/\/profile/)
  25 | 
  26 |   // Assert — page heading hiển thị
  27 |   await expect(page.getByRole('heading', { name: 'プロフィール' })).toBeVisible()
  28 | 
  29 |   // Assert — 4 field labels hiển thị
  30 |   await expect(page.getByText('仕入先コード')).toBeVisible()
  31 |   await expect(page.getByText('仕入先名')).toBeVisible()
  32 |   await expect(page.getByText('メールアドレス')).toBeVisible()
  33 |   await expect(page.getByText('最終ログイン')).toBeVisible()
  34 | 
  35 |   // Assert — action buttons キャンセル + 保存 hiển thị
  36 |   await expect(page.locator('button').filter({ hasText: /キャンセル/ })).toBeVisible()
> 37 |   await expect(page.locator('button').filter({ hasText: /^保存$/ })).toBeVisible()
     |                                                                    ^ Error: expect(locator).toBeVisible() failed
  38 | 
  39 |   // Assert — input fields 仕入先名 và メールアドレス hiển thị (editable)
  40 |   await expect(page.getByPlaceholder('仕入先名を入力してください')).toBeVisible()
  41 |   await expect(page.getByPlaceholder('メールアドレスを入力してください')).toBeVisible()
  42 | })
  43 | 
```