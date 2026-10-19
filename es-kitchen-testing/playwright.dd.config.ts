import { defineConfig, devices } from '@playwright/test'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.test' })

// Config riêng cho automation delivery-driver (E06 mobile web) — Chromium, viewport iPhone 14
export default defineConfig({
  testDir: './e2e/webapp-driver/delivery-driver',
  timeout: 60_000,
  retries: 0,
  workers: 1,
  use: {
    ...devices['iPhone 14'],
    defaultBrowserType: 'chromium',
    baseURL: process.env.E06_URL,
    screenshot: 'off',
    trace: 'off',
    locale: 'ja-JP',
  },
  outputDir: 'reports/delivery-driver/pw-output',
  reporter: [['line']],
})
