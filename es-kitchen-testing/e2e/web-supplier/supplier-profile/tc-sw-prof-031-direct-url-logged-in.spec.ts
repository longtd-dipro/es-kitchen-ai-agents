import { test, expect } from '@playwright/test'

test.use({ storageState: '.auth/e04.json' })

// TC-SW_PROF_001-031 — AC-1: Truy cập trực tiếp URL /profile khi đã đăng nhập
// Source: src/pages/profile/ProfilePage.tsx — route /profile
//   - Auth guard: đã đăng nhập → hiển thị bình thường
//   - useQuery queryKey: ["supplier-profile"] → GET /supplier/account/me → data hiển thị
//
// Selectors:
//   - page heading: getByRole('heading', { name: 'プロフィール' })
//   - supplierName input: getByPlaceholder('仕入先名を入力してください')
test('TC-SW_PROF_001-031 — Truy cập /profile bằng URL trực tiếp khi đã đăng nhập', async ({ page }) => {
  // Arrange + Act — navigate trực tiếp đến /profile
  await page.goto('/profile')
  await page.waitForLoadState('networkidle')

  // Assert — màn hình Profile hiển thị bình thường
  await expect(page).toHaveURL(/\/profile/)
  await expect(page.getByRole('heading', { name: 'プロフィール' })).toBeVisible()

  // Assert — dữ liệu tài khoản đã load (input có giá trị)
  const supplierNameInput = page.getByPlaceholder('仕入先名を入力してください')
  await expect(supplierNameInput).toBeVisible()
  // Input có giá trị (không rỗng) — API đã trả về data
  const nameValue = await supplierNameInput.inputValue()
  expect(nameValue.length).toBeGreaterThan(0)
})
