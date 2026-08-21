# ESKITCHEN Documentation

Tài liệu kỹ thuật và nghiệp vụ cho dự án **ESKITCHEN Phase 2** — hệ thống quản lý bếp doanh nghiệp cho client Nhật Bản.

## Hệ sinh thái — 9 repos

| Repo | Epic | Vai trò | Stack |
|---|---|---|---|
| `es-kitchen-api` | — | Core API · Business Logic · Database · Auth · Integrations | NestJS 11 / TypeScript / PostgreSQL / TypeORM 0.3 |
| `es-kitchen-payment-app` | E01 | User Mobile App — order, menu, delivery, payment | Flutter 3.10 / Dart / Riverpod 3 / Retrofit / auto_route |
| `es-kitchen-web-company` | E02 | Company Admin Web | React 19 / Vite 7 / Redux Toolkit / AntD 6.2 |
| `es-kitchen-web-admin` | E03 | System Admin Web (60+ pages) | React 19 / Vite 7 / Redux Toolkit / AntD 6.2 |
| `es-kitchen-web-supplier` | E04 | Supplier Web — menu, nhận đơn | React 19 / Vite 8 / Redux Toolkit / AntD 6.4 |
| `es-kitchen-web-outsource-web-private` | E05 | Outsource / Internal Private Admin Web | React 19 / Vite 8 / Redux Toolkit / AntD 6.4 |
| `es-kitchen-webapp-driver` | E06 | Driver Web App (mobile-first web) | React 19 / Vite 8 / **shadcn + Base UI** / **Zustand** |
| `es-kitchen-webapp-payment` | E07 | User Web Ordering (QR scan · cart · elepay) — parallel to E01 Mobile | React 19 / Vite 8 / **shadcn + Base UI** / **Zustand** / PWA |
| `es-kitchen-testing` | — | E2E Testing — Playwright specs + execution reports (độc lập, root level) | Playwright / TypeScript |

## BMAD Workflow 

![BMAD Flow](assets/bmad-flow.png)

Mỗi role là một sub-agent có canonical workflow trong `.claude/agents/`. 

| Bước | Prompt | Output | Agent |
|---|---|---|---|
| 1 | **"Hãy là BA, làm SPEC cho feature `<tên>`"** | `SPEC.md` | `ba-agent` |
| 2a | **"Hãy là Tech Lead Design, làm DESIGN.md từ SPEC: `<path>`"** _(song song)_ | `DESIGN.md` per repo | `techlead-design-agent` |
| 2b | **"Hãy là Designer, tạo UI-SPEC.md + Figma từ SPEC: `<path>`"** _(song song)_ | `UI-SPEC.md` + `figma/*.md` | `designer-agent` |
| 2c | **"Hãy là QC, sinh test cases từ SPEC: `<path>`"** _(song song)_ | `test-cases/tc_*.md` | `qc-agent` |
| 3 | **"Hãy là Tech Lead Tasks, phân rã tasks cho feature: `<feature folder>`"** | `tasks/task-*.md` | `techlead-tasks-agent` |
| 4 | **"Hãy là PM, làm PLAN.md cho feature: `<feature folder>`"** | `PLAN.md` | `pm-agent` |
| 4b _(optional)_ | **"Hãy là PM, sync tasks lên Backlog: `<feature folder>`"** _(slash: `/create-backlog`)_ | Backlog issues qua MCP | `pm-agent` (Bước 4) |
| 5a | **"Hãy là Backend Developer, implement task: `<task-X-Y.md>`"** | Working code | `backend-agent` |
| 5b | **"Hãy là Frontend Developer, implement task: `<task-X-Y.md>`"** | Working code + đọc Figma context | `frontend-agent` |
| 5c | **"Hãy là Mobile Developer, implement task: `<task-X-Y.md>`"** | Working code + đọc Figma context | `mobile-agent` |
| 6 | **"Hãy là QA, verify task: `<task-X-Y.md>`"** | QA Report | `qa-agent` |
| 7a | Execute manual TC + bug reports | Test execution checklist | `qc-agent` |
| 7b _(optional)_ | **"Hãy là QC, sinh regression suite: `<feature>`"** | Regression suite | `qc-agent` |
| 7c | **"Hãy là QC Automation, test feature: `<path>`, Figma: `<url>`"** _(song song với 7a — thêm `testcases: <path>` nếu có TC file)_ | Playwright `.spec.ts` + `execution-report.md` | `qc-automation-agent` |


## Sơ đồ pipeline — Từ yêu cầu đến deploy
## Pipeline — Từ yêu cầu đến deploy

```mermaid
flowchart TB

    %% ===== STAGE 1 =====

    subgraph S1["① INPUT & ANALYSIS"]

        INPUT["📥 Input
        PDF · Figma · Backlog · Meeting"]

        TRIGGER{"Trigger"}

        NL["💬 Natural Language"]
        CMD["⌨️ Slash Command"]

        BA["🟦 BA Agent"]

        SPEC["📄 SPEC.md"]

        INPUT --> TRIGGER
        TRIGGER --> NL
        TRIGGER --> CMD

        NL --> BA
        CMD --> BA

        BA --> SPEC

    end

    %% ===== STAGE 2 =====

    subgraph S2["② DESIGN"]

        TLD["🟦 Tech Lead Design"]
        DES["🟨 Designer"]
        QC["🟪 QC Agent"]

        DESIGN["📄 DESIGN.md"]
        UISPEC["📄 UI-SPEC.md"]
        TC["📄 Test Cases"]

        SPEC --> TLD
        SPEC --> DES
        SPEC --> QC

        TLD --> DESIGN
        DES --> UISPEC
        QC --> TC

    end

    %% ===== STAGE 3 =====

    subgraph S3["③ PLANNING"]

        TASK["🟦 Tech Lead Tasks"]

        TASKDOC["📄 Tasks"]

        PM["🟦 PM Agent"]

        PLAN["📄 PLAN.md"]

        BACKLOG["📋 Backlog"]

        DESIGN --> TASK
        UISPEC --> TASK

        TASK --> TASKDOC

        TASKDOC --> PM

        PM --> PLAN
        PM -. Sync .-> BACKLOG

    end

    %% ===== STAGE 4 =====

    subgraph S4["④ CONTRACT LOCK"]

        LOCK{"🔒 Contract Lock

        BE + FE + Mobile + PM

        API + WebSocket + Push"}

    end

    PLAN --> LOCK
    BACKLOG -.-> LOCK

    %% ===== STAGE 5 =====

    subgraph S5["⑤ IMPLEMENTATION"]

        BE["🟩 Backend Agent"]
        FE["🟩 Frontend Agent"]
        MOB["🟩 Mobile Agent"]

        CODE["💻 Working Code
        + Unit Tests"]

        LOCK --> BE
        LOCK --> FE
        LOCK --> MOB

        UISPEC -.-> FE
        UISPEC -.-> MOB

        BE --> CODE
        FE --> CODE
        MOB --> CODE

    end

    %% ===== STAGE 6 =====

    subgraph S6["⑥ QA"]

        QA["🟪 QA Agent"]

        REPORT["📊 QA Report"]

        CODE --> QA

        TC -.-> QA
        BACKLOG -.-> QA

        QA --> REPORT

    end

    %% ===== STAGE 7 =====

    subgraph S7["⑦ TESTING"]

        MANUAL["🟪 Manual Testing"]

        AUTO["🟪 Playwright E2E"]

        BUG["📊 Bug Reports"]

        E2E["📊 E2E Report"]

        REPORT --> MANUAL
        REPORT --> AUTO

        MANUAL --> BUG
        AUTO --> E2E

    end

    %% ===== STAGE 8 =====

    subgraph S8["⑧ DEPLOY"]

        DEPLOY["🚀 STG → PROD"]

    end

    BUG --> DEPLOY
    E2E --> DEPLOY


    %% ===== STYLE =====

    classDef ba fill:#DBEAFE,stroke:#2563EB,color:#1E3A8A
    classDef dev fill:#DCFCE7,stroke:#16A34A,color:#14532D
    classDef qa fill:#F3E8FF,stroke:#9333EA,color:#581C87
    classDef design fill:#FEF3C7,stroke:#D97706,color:#78350F
    classDef artifact fill:#F9FAFB,stroke:#6B7280,color:#111827
    classDef gate fill:#FEE2E2,stroke:#DC2626,color:#7F1D1D

    class BA,TLD,TASK,PM ba
    class BE,FE,MOB dev
    class QC,QA,MANUAL,AUTO qa
    class DES design

    class SPEC,DESIGN,UISPEC,TC,TASKDOC,PLAN,BACKLOG,CODE,REPORT,BUG,E2E artifact

    class TRIGGER,LOCK gate
```


**Đọc sơ đồ:**

- 🟦 Planning agents (BA · Tech Lead Design · Tech Lead Tasks · PM) — đọc requirement, sinh docs
- 🟨 Designer agent — tạo Figma screens + UI-SPEC.md (song song bước 2b)
- 🟩 Dev agents (Backend · Frontend · Mobile) — implement task
- 🟪 Quality agents (QC · QA · QC-Automation) — sinh test cases · verify code · E2E test tự động
- 🟡 Artifacts (`SPEC.md` · `DESIGN.md` · `UI-SPEC.md` · `tasks/*.md` · `PLAN.md` · code · test cases · QA Report)
- 🟥 Decision points (cách trigger · phân nhánh · Contract Lock)


---


## Cấu trúc tài liệu

```
docs/
├── backend/                          ← Overview docs per backend repo
│   └── es-kitchen-api/overview/      ← Structure · ERD · API catalog · Patterns
├── frontend/                                  ← Overview docs per FE repo
│   ├── es-kitchen-web-admin/                  ← E03 — System Admin
│   ├── es-kitchen-web-company/                ← E02 — Company Admin
│   ├── es-kitchen-web-supplier/               ← E04 — Supplier
│   ├── es-kitchen-web-outsource-web-private/  ← E05 — Outsource/Internal
│   ├── es-kitchen-webapp-driver/              ← E06 — Driver
│   └── es-kitchen-webapp-payment/             ← E07 — User Web Ordering
├── mobile/
│   └── es-kitchen-payment-app/       ← E01 — Mobile App
├── features/                         ← Long-memory cho mọi feature (BMAD output)
│   └── <feature-name>/
│       ├── SPEC.md                   ← BA (nghiệp vụ + ## Screens table)
│       ├── UI-SPEC.md                ← Designer (screen inventory, components, token usage)
│       ├── PLAN.md                   ← PM
│       ├── figma/                    ← Designer
│       │   ├── figma_<Component>_context.md
│       │   └── figma_<Component>.png
│       └── <repo-name>/              ← per repo bị ảnh hưởng
│           ├── DESIGN.md             ← Tech Lead Design
│           └── tasks/task-X-Y.md     ← Tech Lead Tasks
└── quality/                          ← Manual QC reports (TC execution, bug reports)

# E2E test results (Playwright) → es-kitchen-testing/reports/<feature>/execution-report.md
```

