# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: web-supplier/supplier-profile/tc-sw-prof-060-save-success.spec.ts >> TC-SW_PROF_001-060 — Lưu thành công → toast 保存しました
- Location: e2e/web-supplier/supplier-profile/tc-sw-prof-060-save-success.spec.ts:21:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button').filter({ hasText: /^保存$/ })

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - complementary [ref=e5]:
      - generic [ref=e7]:
        - img "ES STATION" [ref=e9]
        - generic [ref=e10]:
          - navigation [ref=e11]:
            - menu [ref=e12]:
              - menuitem "TOP" [ref=e13] [cursor=pointer]:
                - img [ref=e14]
                - generic [ref=e16]: TOP
              - menuitem "受注一覧" [ref=e17] [cursor=pointer]:
                - img [ref=e18]
                - generic [ref=e20]: 受注一覧
              - menuitem "注文管理" [ref=e21] [cursor=pointer]:
                - img [ref=e22]
                - generic [ref=e24]: 注文管理
              - menuitem "その他" [ref=e25] [cursor=pointer]:
                - img [ref=e26]
                - generic [ref=e28]: その他
              - menuitem "プロフィール" [ref=e29] [cursor=pointer]:
                - img [ref=e30]
                - generic [ref=e32]: プロフィール
          - generic [ref=e33]:
            - img "sidebar mascot" [ref=e35]
            - button "toggle sidebar" [ref=e37] [cursor=pointer]:
              - img "menu-fold" [ref=e38]:
                - img [ref=e39]
    - generic [ref=e41]:
      - banner [ref=e42]:
        - link "Logo お帰りなさい" [ref=e44] [cursor=pointer]:
          - /url: /dashboard
          - img "Logo" [ref=e45]
          - generic [ref=e46]: お帰りなさい
        - button "アカウントメニューを開く" [ref=e47] [cursor=pointer]:
          - img "es-supplier@yopmail.com" [ref=e48]
          - generic [ref=e49]: es-supplier@yopmail.com
          - img [ref=e50]
      - main [ref=e52]:
        - generic [ref=e53]:
          - generic [ref=e54]:
            - generic [ref=e55]:
              - navigation [ref=e56]:
                - list [ref=e57]:
                  - listitem [ref=e58]:
                    - link "TOP" [ref=e60] [cursor=pointer]:
                      - /url: /dashboard
              - heading "プロフィール" [level=1] [ref=e61]
            - generic [ref=e63]:
              - button "キャンセル" [ref=e64] [cursor=pointer]:
                - generic [ref=e65]: キャンセル
              - button "保 存" [ref=e66] [cursor=pointer]:
                - generic [ref=e67]: 保 存
          - generic [ref=e69]:
            - generic [ref=e70]:
              - generic [ref=e71]: 仕入先コード
              - generic [ref=e72]: SP00003
            - separator
            - generic [ref=e73]:
              - generic [ref=e74]:
                - generic [ref=e75]: 仕入先名
                - generic [ref=e76]: 必須
              - textbox "仕入先名を入力してください" [active] [ref=e80]: テスト食材株式会社_1781842817906
            - separator
            - generic [ref=e81]:
              - generic [ref=e82]:
                - generic [ref=e83]: メールアドレス
                - generic [ref=e84]: 必須
              - textbox "メールアドレスを入力してください" [ref=e88]: es-supplier@yopmail.com
            - separator
            - generic [ref=e89]:
              - generic [ref=e90]: 最終ログイン
              - generic [ref=e91]: 2026-06-19 09:51 JST
  - region "Notifications Alt+T"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.use({ storageState: '.auth/e04.json' })
  4  | 
  5  | // TC-SW_PROF_001-060 — AC-4 (Critical): Lưu thành công → toast 保存しました + data refresh
  6  | // Source: src/pages/profile/ProfilePage.tsx
  7  | //   - useMutationCustom: mutationFn=updateProfile, skipAutoSuccessHandling=true
  8  | //   - onSuccess: message.success("保存しました") → antd message toast
  9  | //   - onSuccess: queryClient.invalidateQueries({ queryKey: ["supplier-profile"] })
  10 | //     → trigger refetch GET /supplier/account/me → UI update
  11 | //   - API: PATCH /supplier/account/profile body { supplierName, email }
  12 | //
  13 | // Selectors:
  14 | //   - supplierName input: getByPlaceholder('仕入先名を入力してください')
  15 | //   - email input:        getByPlaceholder('メールアドレスを入力してください')
  16 | //   - save button:        getByRole('button', { name: /保存/ })
  17 | //   - success toast:      getByText('保存しました') — antd message component
  18 | //
  19 | // NOTE: Test sửa supplierName với timestamp để tránh trùng lặp giữa các lần chạy.
  20 | //       Email giữ nguyên để tránh conflict 409 nếu email đã tồn tại trong hệ thống.
  21 | test('TC-SW_PROF_001-060 — Lưu thành công → toast 保存しました', async ({ page }) => {
  22 |   // Arrange
  23 |   await page.goto('/profile')
  24 |   await page.waitForLoadState('networkidle')
  25 | 
  26 |   // Arrange — capture giá trị supplierName hiện tại từ input
  27 |   const supplierNameInput = page.getByPlaceholder('仕入先名を入力してください')
  28 |   await expect(supplierNameInput).toBeVisible()
  29 | 
  30 |   // Act — sửa supplierName (thêm timestamp để tránh trùng)
  31 |   const newName = `テスト食材株式会社_${Date.now()}`
  32 |   await supplierNameInput.clear()
  33 |   await supplierNameInput.fill(newName)
  34 | 
  35 |   // Act — click 保存 (antd Button wraps text in <span> → use locator filter)
> 36 |   await page.locator('button').filter({ hasText: /^保存$/ }).click()
     |                                                            ^ Error: locator.click: Test timeout of 30000ms exceeded.
  37 | 
  38 |   // Assert — toast 保存しました hiển thị (antd message toast)
  39 |   await expect(page.getByText('保存しました')).toBeVisible({ timeout: 10000 })
  40 | 
  41 |   // Assert — sau khi toast hiển thị, input hiển thị giá trị mới (data đã refresh)
  42 |   // invalidateQueries trigger GET /me → reset form với data mới
  43 |   await page.waitForLoadState('networkidle')
  44 |   await expect(page.getByPlaceholder('仕入先名を入力してください')).toHaveValue(newName)
  45 | })
  46 | 
```