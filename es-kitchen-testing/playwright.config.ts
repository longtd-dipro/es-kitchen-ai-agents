import { defineConfig, devices } from '@playwright/test'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.test' })

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 1,
  workers: 1,

  use: {
    screenshot: 'only-on-failure',
    video: 'off',
    trace: 'on-first-retry',
  },

  projects: [
    // Auth setup riêng per role — mỗi project chỉ chạy setup của mình
    { name: 'setup:e02', testMatch: '**/auth.e02.setup.ts' },
    { name: 'setup:e03', testMatch: '**/auth.e03.setup.ts' },
    { name: 'setup:e04', testMatch: '**/auth.e04.setup.ts' },
    { name: 'setup:e05', testMatch: '**/auth.e05.setup.ts' },
    { name: 'setup:e06', testMatch: '**/auth.e06.setup.ts' },

    // E03 — System Admin
    {
      name: 'web-admin',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.E03_URL || 'http://localhost:3003',
        storageState: '.auth/e03.json',
      },
      dependencies: ['setup:e03'],
      testMatch: 'e2e/web-admin/**/*.spec.ts',
    },

    // E02 — Company Admin
    {
      name: 'web-company',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.E02_URL || 'http://localhost:3002',
        storageState: '.auth/e02.json',
      },
      dependencies: ['setup:e02'],
      testMatch: 'e2e/web-company/**/*.spec.ts',
    },

    // E04 — Supplier
    {
      name: 'web-supplier',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.E04_URL || 'http://localhost:3004',
        storageState: '.auth/e04.json',
      },
      dependencies: ['setup:e04'],
      testMatch: 'e2e/web-supplier/**/*.spec.ts',
    },

    // E05 — Outsource Internal
    {
      name: 'web-outsource',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.E05_URL || 'http://localhost:3005',
        storageState: '.auth/e05.json',
      },
      dependencies: ['setup:e05'],
      testMatch: 'e2e/web-outsource/**/*.spec.ts',
    },

    // E06 — Driver (mobile viewport)
    {
      name: 'webapp-driver',
      use: {
        ...devices['iPhone 14'],
        baseURL: process.env.E06_URL || 'http://localhost:3006',
        storageState: '.auth/e06.json',
      },
      dependencies: ['setup:e06'],
      testMatch: 'e2e/webapp-driver/**/*.spec.ts',
    },
  ],

  outputDir: 'reports/screenshots',
  reporter: [
    ['line'],
    ['json', { outputFile: 'reports/results.json' }],
    ['html', { outputFolder: 'reports/html', open: 'never' }],
  ],
})
