# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: web-supplier/supplier-profile/tc-sw-prof-040-display-profile-fields.spec.ts >> TC-SW_PROF_001-040 — Hiển thị đủ 4 trường thông tin tài khoản
- Location: e2e/web-supplier/supplier-profile/tc-sw-prof-040-display-profile-fields.spec.ts:21:5

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
  5  | // TC-SW_PROF_001-040 — AC-2: Hiển thị đủ 4 trường thông tin tài khoản
  6  | // Source: es-kitchen-repository/es-kitchen-web-supplier/src/pages/profile/ProfilePage.tsx
  7  | //   - ReadOnlyRow label="仕入先コード"    → giá trị từ profile.supplierCode
  8  | //   - Controller name="supplierName"       → input với giá trị prefill
  9  | //   - Controller name="email"              → input với giá trị prefill
  10 | //   - ReadOnlyRow label="最終ログイン"      → format "YYYY-MM-DD HH:mm JST"
  11 | //   - useQuery queryKey: ["supplier-profile"] → GET /supplier/account/me
  12 | //
  13 | // Selectors:
  14 | //   - label "仕入先コード":  getByText('仕入先コード')
  15 | //   - label "仕入先名":      getByText('仕入先名')
  16 | //   - label "メールアドレス": getByText('メールアドレス')
  17 | //   - label "最終ログイン":   getByText('最終ログイン')
  18 | //   - input supplierName:    getByPlaceholder('仕入先名を入力してください')
  19 | //   - input email:           getByPlaceholder('メールアドレスを入力してください')
  20 | //   - 必須 badge (x2):       getByText('必須')
  21 | test('TC-SW_PROF_001-040 — Hiển thị đủ 4 trường thông tin tài khoản', async ({ page }) => {
  22 |   // Arrange
  23 |   await page.goto('/profile')
  24 |   await page.waitForLoadState('networkidle')
  25 | 
  26 |   // Assert — URL đúng
  27 |   await expect(page).toHaveURL(/\/profile/)
  28 | 
  29 |   // Assert — 4 label rows hiển thị
  30 |   await expect(page.getByText('仕入先コード')).toBeVisible()
  31 |   await expect(page.getByText('仕入先名')).toBeVisible()
  32 |   await expect(page.getByText('メールアドレス')).toBeVisible()
  33 |   await expect(page.getByText('最終ログイン')).toBeVisible()
  34 | 
  35 |   // Assert — input fields hiển thị với placeholder (page is always-edit per Figma design)
  36 |   await expect(page.getByPlaceholder('仕入先名を入力してください')).toBeVisible()
  37 |   await expect(page.getByPlaceholder('メールアドレスを入力してください')).toBeVisible()
  38 | 
  39 |   // Assert — Required badges (必須) hiển thị cho cả 2 editable fields
  40 |   const requiredBadges = page.getByText('必須')
  41 |   await expect(requiredBadges).toHaveCount(2)
  42 | 
  43 |   // Assert — buttons キャンセル + 保存 hiển thị (always visible per Figma)
  44 |   // antd Button wraps text in <span> — use locator filter instead of getByRole name
  45 |   await expect(page.locator('button').filter({ hasText: /キャンセル/ })).toBeVisible()
> 46 |   await expect(page.locator('button').filter({ hasText: /^保存$/ })).toBeVisible()
     |                                                                    ^ Error: expect(locator).toBeVisible() failed
  47 | })
  48 | 
```