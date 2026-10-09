# ES KIT — QC Automation Package

Package standalone chạy **Playwright E2E test tự động** cho dự án ESKITCHEN, dùng AI Agent (Claude Code CLI).

---

## Prerequisites (chỉ 2 thứ)

- **Node.js 20+** — https://nodejs.org
- **Claude Code CLI** — https://docs.claude.com/claude-code

> Playwright + Chromium browser: **Agent tự cài lần đầu**, bạn không cần chạy `npm install` tay.

## Sử dụng (2 bước)

### 1. Bật Claude tại folder này

```bash
cd es-kit-qc-automation
claude
```

### 2. Gọi Agent

```
Hãy là QC Automation, test feature: <feature-path>,
  Figma: <figma-url>,
  app: <target-app>,
  testcases: <path-to-test-cases.md>
```

Agent sẽ:
1. **Tự cài Playwright** (nếu chưa có) — chạy `npm install` + `npx playwright install chromium` trong es-kitchen-testing/
2. **Hỏi kỹ input** nếu thiếu bất kỳ item nào (SPEC, Figma URL, target app, website URL, test cases, credentials)
3. Sinh Playwright `.spec.ts` (1 file / TC)
4. Chạy E2E test với browser hiển thị (headed mode)
5. Sinh `execution-report.md` + screenshots FAIL

## Cấu trúc package

```
es-kit-qc-automation/
├── README.md
├── CLAUDE.md              ← Rules & policies (auto-load)
├── POLICIES.md            ← Ràng buộc AI
├── AGENTS.md              ← Metadata agent
├── .claude/
│   ├── settings.json      ← MCP config (tilth, figma)
│   ├── agents/
│   │   └── qc-automation-agent.md    ⭐ Agent duy nhất
│   ├── skills/
│   │   ├── automation_engineer/      Playwright + selector patterns
│   │   └── bug_reporter/             Format bug report
│   ├── commands/
│   │   └── qc-automation.md          Slash /qc-automation
│   └── rules/             Coding style · security · git
└── es-kitchen-testing/
    ├── package.json                  ← Playwright deps (đã declare)
    ├── playwright.config.ts          ← Config đã có sẵn
    ├── .env.test.example             ← Template env
    └── e2e/
        ├── fixtures/                 ← Auth setup templates
        ├── web-admin/                E03 System Admin
        ├── web-company/              E02 Company Admin
        ├── web-supplier/             E04 Supplier
        ├── web-outsource/            E05 Internal
        └── webapp-driver/            E06 Driver
```

## Input agent sẽ hỏi bạn

Nếu thiếu, agent hỏi tất cả 5 nhóm trong 1 turn (không hỏi rời rạc):

1. **SPEC.md** của feature — paste nội dung, path, hoặc mô tả ngắn
2. **Figma URL** cho screens — có `node-id` (hoặc "skip")
3. **Target app** — web-admin / web-company / web-supplier / web-outsource / webapp-driver
4. **Website URL** — localhost / staging / production / custom
5. **Test cases file** — nếu có → TC-driven; nếu không → SPEC-driven (tối đa 10 TC)

Nếu cần login → agent hỏi thêm credentials (login ID + password).

## Output

```
es-kitchen-testing/
├── e2e/
│   └── <target-app>/<feature-name>/
│       └── tc-*.spec.ts              ← 1 file / TC
└── reports/
    └── <feature-name>/
        ├── execution-report.md       ← BÁO CÁO CHÍNH (4 section)
        └── screenshots/
            └── TC_*.png              ← Chỉ FAIL
```

Execution report có 4 section:
1. **Kết quả execution** — bảng TC + status (PASS/FAIL/SKIP)
2. **Logic-UI Diff vs Figma** — so sánh text label, color token, missing UI state, logic missing
3. **Lỗi cần xử lý** — TC FAIL + error + nguyên nhân dự đoán
4. **Bước tiếp theo** — recommend cho Dev/Designer

## Bảo mật

- `.env.test` (chứa credentials) KHÔNG commit vào git — đã có sẵn trong `.gitignore`
- `.auth/` folder chứa session token — không share
- Package này KHÔNG chứa credentials thật, chỉ template `.env.test.example`

## Tài liệu chi tiết

Xem file **HƯỚNG DẪN CÀI VÀ SỬ DỤNG AGENTS ES KIT.docx** đi kèm.
