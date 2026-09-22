# es-kitchen-testing

E2E automation tests cho ESKITCHEN — sinh tự động bởi `qc-automation-agent` từ SPEC.md + Figma.

## Cấu trúc

```
es-kitchen-testing/
├── playwright.config.ts          ← config chính, 5 project per app
├── package.json
├── .env.test                     ← KHÔNG commit (copy từ .env.test.example)
├── .env.test.example             ← template credentials
├── .gitignore
├── e2e/
│   ├── fixtures/
│   │   └── auth.setup.ts         ← login state per role (chạy 1 lần trước all tests)
│   ├── web-admin/                ← E03 System Admin tests
│   │   └── <feature>/
│   │       └── tc_auto_001.spec.ts
│   ├── web-company/              ← E02 Company Admin tests
│   ├── web-supplier/             ← E04 Supplier tests
│   ├── web-outsource/            ← E05 Internal tests
│   └── webapp-driver/            ← E06 Driver tests
├── .auth/                        ← gitignored, login state JSON
└── reports/                      ← gitignored, sinh tự động
    ├── <feature>/
    │   ├── execution-report.md
    │   └── screenshots/
    ├── results.json
    └── html/
```

## Setup lần đầu

```bash
# 1. Cài dependencies
npm install
npx playwright install chromium

# 2. Tạo file credentials
cp .env.test.example .env.test
# Điền email/password thực cho từng role vào .env.test
```

## Chạy test

```bash
# Chạy tất cả
npm test

# Chạy theo app
npm run test:web-admin
npm run test:web-company

# Chạy 1 feature cụ thể
npx playwright test e2e/web-admin/company-account/ --project=chromium

# Xem report sau khi chạy
npm run report
```

## Prerequisite trước khi chạy

Website phải đang chạy trên localhost:

| App | Port mặc định | Lệnh khởi động |
|---|---|---|
| E03 web-admin | 5173 | `cd ../es-kitchen-repository/es-kitchen-web-admin && npm run dev` |
| E02 web-company | 5174 | `cd ../es-kitchen-repository/es-kitchen-web-company && npm run dev` |
| E04 web-supplier | 5175 | `cd ../es-kitchen-repository/es-kitchen-web-supplier && npm run dev` |
| E05 web-outsource | 5176 | `cd ../es-kitchen-repository/es-kitchen-web-outsource-web-private && npm run dev` |
| E06 webapp-driver | 5177 | `cd ../es-kitchen-repository/es-kitchen-webapp-driver && npm run dev` |

## Sinh test tự động

Dùng AI agent — không viết tay:

```
/qc-automation <feature-path> <figma-url> <target-app> <localhost-url>

Ví dụ:
/qc-automation es-kitchen-docs/docs/features/company-account \
               https://www.figma.com/file/xxx/... \
               web-admin \
               http://localhost:5173
```
