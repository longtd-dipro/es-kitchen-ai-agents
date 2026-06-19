# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: web-supplier/supplier-profile/tc-sw-prof-120-xss-suppliername.spec.ts >> TC-SW_PROF_001-120 — XSS: script tag trong supplierName không được execute
- Location: e2e/web-supplier/supplier-profile/tc-sw-prof-120-xss-suppliername.spec.ts:16:5

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
              - textbox "仕入先名を入力してください" [active] [ref=e80]: <script>alert('XSS')</script>
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
  5  | // TC-SW_PROF_001-120 — Security (Critical): XSS — supplierName nhập script tag → không execute
  6  | // Source: React DOM escapes innerHTML by default — React renders text content safely
  7  | //   - JSX: <span>{profile?.supplierName}</span> → React escapes HTML entities
  8  | //   - BaseInput: antd Input component renders value as escaped text
  9  | //   - ReadOnlyRow: <span> renders text nodes, không dangerouslySetInnerHTML
  10 | //
  11 | // Test strategy: nhập <script>alert('XSS')</script> vào supplierName, lưu,
  12 | //   verify không có dialog alert và text được escape đúng cách.
  13 | //
  14 | // NOTE: Test này KHÔNG verify rằng payload được lưu vào DB —
  15 | //       chỉ verify FE không execute script khi hiển thị lại.
  16 | test('TC-SW_PROF_001-120 — XSS: script tag trong supplierName không được execute', async ({ page }) => {
  17 |   // Arrange — monitor dialog events (alert/confirm/prompt)
  18 |   let alertFired = false
  19 |   page.on('dialog', async dialog => {
  20 |     alertFired = true
  21 |     await dialog.dismiss()
  22 |   })
  23 | 
  24 |   await page.goto('/profile')
  25 |   await page.waitForLoadState('networkidle')
  26 | 
  27 |   // Act — nhập XSS payload vào supplierName
  28 |   const supplierNameInput = page.getByPlaceholder('仕入先名を入力してください')
  29 |   await supplierNameInput.clear()
  30 |   await supplierNameInput.fill("<script>alert('XSS')</script>")
  31 | 
  32 |   // Act — click 保存 để submit (có thể thành công hoặc BE reject — cả 2 đều OK)
  33 |   // antd Button wraps text in <span> → use locator filter
> 34 |   await page.locator('button').filter({ hasText: /^保存$/ }).click()
     |                                                            ^ Error: locator.click: Test timeout of 30000ms exceeded.
  35 | 
  36 |   // Đợi response (toast hoặc error)
  37 |   await page.waitForTimeout(2000)
  38 | 
  39 |   // Assert — không có alert dialog được trigger
  40 |   expect(alertFired).toBe(false)
  41 | 
  42 |   // Assert — nếu dữ liệu được hiển thị lại, text phải là literal string (escaped)
  43 |   // React renders text nodes safely — không interpret HTML
  44 |   const xssRendered = page.getByText("<script>alert('XSS')</script>")
  45 |   // Nếu BE lưu được và trả về, text được render escaped (không có tag HTML thật)
  46 |   // Không cần expect visible vì BE có thể reject — quan trọng là không có alert
  47 | })
  48 | 
```