# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: web-supplier/supplier-profile/tc-sw-prof-080-validation-email-empty.spec.ts >> TC-SW_PROF_001-080 — email rỗng → hiển thị error message, block submit
- Location: e2e/web-supplier/supplier-profile/tc-sw-prof-080-validation-email-empty.spec.ts:15:5

# Error details

```
Error: Channel closed
```

```
Error: locator.click: Target page, context or browser has been closed
Call log:
  - waiting for locator('button').filter({ hasText: /^保存$/ })

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.use({ storageState: '.auth/e04.json' })
  4  | 
  5  | // TC-SW_PROF_001-080 — AC-5: Validation email rỗng → error message + block submit
  6  | // Source: src/validation/schemas.ts
  7  | //   - updateProfileSchema: email → yup.string().required("メールアドレスを入力してください。")
  8  | // Source: src/pages/profile/ProfilePage.tsx
  9  | //   - Controller name="email" → BaseInput error={errors.email?.message}
  10 | //
  11 | // Selectors:
  12 | //   - email input: getByPlaceholder('メールアドレスを入力してください')
  13 | //   - save button: getByRole('button', { name: /保存/ })
  14 | //   - error message: getByText('メールアドレスを入力してください。')
  15 | test('TC-SW_PROF_001-080 — email rỗng → hiển thị error message, block submit', async ({ page }) => {
  16 |   // Arrange
  17 |   await page.goto('/profile')
  18 |   await page.waitForLoadState('networkidle')
  19 | 
  20 |   // Act — xóa hết nội dung trường email
  21 |   const emailInput = page.getByPlaceholder('メールアドレスを入力してください')
  22 |   await emailInput.clear()
  23 | 
  24 |   // Act — click 保存 (antd Button wraps text in <span> → use locator filter)
> 25 |   await page.locator('button').filter({ hasText: /^保存$/ }).click()
     |                                                            ^ Error: locator.click: Target page, context or browser has been closed
  26 | 
  27 |   // Assert — error message hiển thị
  28 |   await expect(page.getByText('メールアドレスを入力してください。')).toBeVisible()
  29 | 
  30 |   // Assert — không có toast success
  31 |   await expect(page.getByText('保存しました')).not.toBeVisible()
  32 | })
  33 | 
```