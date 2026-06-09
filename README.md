**Last updated:** 02/06/2026
**Maintained by:** TRAN DUC LONG

---

## 1. Tổng quan

Hệ thống AI Agent của ESKITCHEN được tổ chức trong thư mục `.claude/` tại root project. Thiết kế theo nguyên tắc **load đúng thứ gì, đúng lúc** — tránh tốn token không cần thiết.

```
.claude/
├── agents/        ← Sub-agents chuyên biệt (load khi spawn) · 9 files
├── commands/      ← Slash commands · BMAD core (8) + /test/* (11)
├── skills/        ← Knowledge packs chuyên sâu (load khi invoke)
├── rules/         ← Constraints & conventions (AUTO-LOAD mọi session)
├── context/       ← Project background knowledge (load on-demand)
└── workflows/     ← Operational runbooks (load on-demand)
```

Source code: `es-kitchen-repository/` (7 repos). Docs: `es-kitchen-docs/docs/features/` (single long-memory).

---

## 2. Load Policy

| Thành phần | Khi nào load | Ai load |
|---|---|---|
| `POLICIES.md` (root) | Mọi session | Claude Code auto qua `@CLAUDE.md` |
| `AGENTS.md` (root) | Mọi session | Claude Code auto qua `@CLAUDE.md` |
| `.claude/rules/*.md` | Mọi session | Claude Code tự động |
| `.claude/agents/*.md` | Khi agent được spawn | Claude Code khi dùng Agent tool |
| `.claude/commands/*.md` | Khi gọi `/command` | Claude Code khi user gõ slash command |
| `.claude/skills/` | Khi invoke skill | Agent chủ động invoke |
| `.claude/context/*.md` | On-demand | Agent chủ động `tilth_read` |
| `.claude/workflows/*.md` | On-demand | Agent chủ động `tilth_read` |

**Token tối ưu:** Chỉ `POLICIES.md` + `AGENTS.md` + `rules/` always-loaded (~350 dòng total). Chi tiết per-role chỉ load khi cần.

---

## 3. Sub-agents — `.claude/agents/`

Mỗi agent có tool set giới hạn đúng vai trò. Không dùng agent sai role.

| Agent | Vai trò | Tool chính | Trigger khi |
|---|---|---|---|
| `ba-agent.md` | Business Analyst | Read, Write, tilth_read, tilth_files | Phân tích yêu cầu, tạo SPEC.md |
| `techlead-design-agent.md` | Tech Lead Design | Read, Write, Edit, tilth_* | Đọc SPEC → tạo DESIGN.md per repo |
| `techlead-tasks-agent.md` | Tech Lead Tasks | Read, Write, Edit, tilth_* | Đọc DESIGN → phân rã task-x-y.md |
| `pm-agent.md` | Project Manager | Read, Write, Edit, tilth_read | Tạo PLAN.md, phase-gate, timeline, sync Backlog |
| `backend-agent.md` | NestJS Developer | Read, Edit, Write, Bash, tilth_* | Implement/review API, service, entity, migration, Redis |
| `frontend-agent.md` | React Developer | Read, Edit, Write, tilth_* | Implement/review component, hook, store (**E02 + E03 + E04 + E05 + E06**) |
| `mobile-agent.md` | Flutter Developer | Read, Edit, Write, tilth_* | Implement/review screen, Socket.IO, payment (E01) |
| `qc-agent.md` | QC Manual Tester | Read, Write, tilth_* | **Sau SPEC** — sinh TC (RBT/QUICK), regression, execution checklist, bug report |
| `qa-agent.md` | QA Engineer | Read, Bash, tilth_* | **Sau khi dev xong task** — chạy test, validate AC, non-regression |

> **QC vs QA:** `qc-agent` = manual tester (output `.md` cho QC team); `qa-agent` = post-dev verification (output QA Report per task). Không trùng nhau.

---

## 4. Slash Commands — `.claude/commands/`

### BMAD core (8 commands)

| Command | Loại | Canonical agent | Output |
|---|---|---|---|
| `/create-spec <feature>` | thin entry | `ba-agent.md` | `SPEC.md` |
| `/create-design <SPEC.md>` | thin entry | `techlead-design-agent.md` | `DESIGN.md` per repo |
| `/create-tasks <feature/>` | thin entry | `techlead-tasks-agent.md` | `task-*.md` |
| `/create-plan <feature/>` | thin entry | `pm-agent.md` | `PLAN.md` |
| `/create-backlog <feature/>` | thin entry | `pm-agent.md` (Bước 4) | Backlog issues qua MCP |
| `/review-code [path]` | standalone | repo-specific | Review report |
| `/generate-api <module>` | standalone | `backend-agent` + `nestjs-best-practices` | NestJS scaffold |
| `/create-component <Name>` | standalone | `frontend-agent` + `react-expert` | React scaffold |

### QC manual testing (`/test/*`) — canonical: `qc-agent.md`

| Command | Chức năng |
|---|---|
| `/test/generate_manual_testcases_rbt` | Sinh TC theo FULL RBT 6 bước |
| `/test/generate_testcases_from_requirements` | Sinh TC QUICK mode |
| `/test/update_testcases_from_requirements` | Delta-update TC khi SPEC đổi |
| `/test/generate_cross_module_test_plan` | Ma trận tổ hợp Pairwise đa module |
| `/test/generate_regression_suite` | Chọn TC chạy lại sau code change |
| `/test/generate_test_execution_checklist` | Checklist ưu tiên trước release |
| `/test/generate_exploratory_charter` | Structured exploratory testing |
| `/test/generate_qc_onboarding_report` | Coverage map cho QC mới |
| `/test/generate_test_data` | Test data positive/negative/boundary/edge |
| `/test/generate_bug_report` | Chuẩn hóa bug report cho Backlog |
| `/test/export_to_drive` | Export bảng markdown → Google Sheet |

> **thin entry** = command chỉ load agent canonical, không chứa workflow. **standalone** = command có workflow riêng. Khi sửa workflow BA/Tech Lead/PM/QC → chỉ sửa file agent.

---

## 5. Skills — `.claude/skills/`

Knowledge packs chuyên sâu. Agents invoke khi cần expertise cụ thể.

| Skill | Áp dụng | Dùng khi |
|---|---|---|
| `nestjs-best-practices/` | `es-kitchen-api` | Viết/review NestJS, DI, module structure |
| `postgresql/` | `es-kitchen-api` | Schema, migration, query optimization, index |
| `redis-development/` | `es-kitchen-api` | Redis cache pattern, TTL, key naming |
| `react-expert/` | All FE repos (E02–E06) | React 19 hooks, component design |
| `frontend-review/` | All FE repos (E02–E06) | Code review React 19 / TanStack v5 / RTK v2 / AntD v6 |
| `flutter-review/` | `es-kitchen-payment-app` | Code review Flutter E01 |
| `business-analyst/` | — | Discovery, SPEC template, interview framework |
| `technical-writing/` | Tất cả | Viết/cập nhật SPEC/DESIGN/PLAN |
| `solution-architect/` | — | Kiến trúc cross-cutting, integration |
| `rbt_manual_testing/` | — | Sinh manual TC (QUICK + FULL RBT 6 bước) — master skill `qc-agent` |
| `requirements_analyzer/` | — | Phân tích requirements (Drive/Docs/Figma/Backlog) — extract AC, ambiguity |
| `bug_reporter/` | — | Chuẩn hóa bug report — severity/priority/repro steps |

---

## 6. Rules — `.claude/rules/`

Auto-load mọi session. Đây là những ràng buộc cứng không được vi phạm.

| File | Nội dung |
|---|---|
| `stack-constraints.md` | Tech stack cố định, version lock, mobile convention |
| `security-rules.md` | Secret management, JWT, payment, mobile security |
| `git-workflow.md` | Branch naming (`feat/<STORY-ID>_desc`), commit format, PR checklist |
| `coding-style.md` | NestJS / React / Flutter style rules |
| `project-structure.md` | Module structure, doc structure, tilth usage |

> **AI behavior policy canonical** → `./POLICIES.md` (always-loaded qua CLAUDE.md). File này chứa Persona permission matrix, 5 nguyên tắc cốt lõi, forbidden actions, stack constraints, retro-actions khi vi phạm.

---

## 7. Context — `.claude/context/`

Background knowledge. Agents đọc on-demand theo role.

| File | Nội dung | Ai đọc |
|---|---|---|
| `specification.md` | Business context, 6 epics, phase-gate G1–G6, actors, budget | `ba-agent`, `pm-agent` |
| `technical.md` | Tech stack detail, git convention, CI/CD, known bugs | `techlead-design-agent`, `backend-agent` |
| `backlog-workflow.md` | Issue types, status workflow, title format | `techlead-tasks-agent` + tất cả agents khi tạo task |
| `doc-structure.md` | Cấu trúc SPEC/DESIGN/task — single-actor vs cross-repo (cùng path `docs/features/`) | `ba-agent`, `techlead-design-agent`, `techlead-tasks-agent` |
| `ai-workflow.md` | Reference architecture AI Agent system | Khi mở rộng/debug agent system |

> Folder `docs/epics/` cũ đã bị bỏ — mọi feature đặt trong `docs/features/<feature-name>/`. Single-actor vs cross-repo phân biệt qua section Actors trong SPEC, không qua path.

---

## 8. Workflows — `.claude/workflows/`

Operational runbooks — quy trình từng bước. Đọc khi yêu cầu cụ thể.

| File | Nội dung | Ai dùng |
|---|---|---|
| `new-feature.md` | BMAD pipeline end-to-end từ requirement đến deploy | Reference cho tất cả roles |
| `bug-fix.md` | Quy trình điều tra root cause → fix → QA verify | `backend-agent`, `frontend-agent`, `mobile-agent` |
| `db-connect-dev.md` | Kết nối PostgreSQL DEV qua DBeaver | `backend-agent` |
| `db-connect-staging.md` | Kết nối PostgreSQL Staging qua AWS SSM tunnel | `backend-agent` |

---

## 9. BMAD Pipeline

Luồng chuẩn từ yêu cầu đến production. Sơ đồ trực quan đầy đủ (mermaid) ở `es-kitchen-docs/docs/index.md`.

```
User requirement
      │
      ▼ [ba-agent] "Hãy là BA..." hoặc /create-spec
   SPEC.md
      │
      ├──────────────────────────────────┐
      ▼ [techlead-design-agent]          ▼ [qc-agent] (song song)
DESIGN.md per repo               test-cases/tc_*.md
      │                                  │
      ▼ [techlead-tasks-agent] /create-tasks
tasks/task-*.md
      │
      ▼ [pm-agent] /create-plan
   PLAN.md
      │
      ├ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ▼ optional /create-backlog
      │                       Backlog issues qua MCP
      ▼ ⚠️ CONTRACT LOCK
      │   REST API + WebSocket + Push notification payload
      │   confirm: BE + FE + Mobile + PM (+ QC để chốt TC dựa contract)
      │
      ┌──────────────┬──────────────────┐
      │              │                  │
[backend-agent] [frontend-agent]  [mobile-agent]
 Phase 1-2        Phase 3 (FE)     Phase 3 (Mobile)
      │              │                  │
      └──────────────┴──────────────────┘
      │
      ▼ [qa-agent] "Hãy là QA, verify task ..."
  QA Report (PASS / FAIL)
      │
      ▼ [qc-agent] execute manual TC + bug report + regression
  Deploy STG → PROD
```

**Phase order (global, cross-repo):**

| Phase | Nội dung | Repo |
|---|---|---|
| 1 | DB migration / schema | `es-kitchen-api` |
| 2 | Service + API endpoint | `es-kitchen-api` |
| 3 | Frontend E02–E06 + Mobile E01 (song song) | web + payment-app |
| 4 | Integration test | tất cả repo |

BMAD document : https://docs.bmad-method.org/vi-vn/reference/workflow-map/

---

## 10. 2 cách trigger agent

Mọi agent đều có thể trigger theo 2 cách:

### Natural language (recommended cho discovery / iterative work)

```
"Hãy là BA, làm SPEC cho feature import CSV"
"Hãy là Tech Lead Design, làm DESIGN.md từ SPEC: <path>"
"Hãy là QC, sinh test cases từ SPEC: <path>"
"Hãy là QA, verify task: <task-X-Y.md>"
```

### Slash command (recommended cho repeated task)

```
/create-spec import-csv
/create-design <path/SPEC.md>
/test/generate_manual_testcases_rbt
```

Cả 2 cùng load chung file agent canonical. Agent output (section "Bước tiếp theo") luôn dùng natural language để user copy-paste làm prompt turn kế tiếp.

---

## 11. AI Policy

> **Canonical policy → `./POLICIES.md`** (always-loaded). Đọc file đó để biết:
>
> - 5 nguyên tắc cốt lõi (không đoán mò · đọc trước · stateless · tool-first · blast radius check)
> - Bảng Persona permission (BA/TechLead/PM/QC/QA/Dev × actions)
> - 11 forbidden actions
> - Bắt buộc hỏi khi thiếu info
> - Stack constraints + version pinning
> - Mobile version convention
> - Quy trình khi AI vi phạm

Nguyên tắc cô đọng: **đọc đúng file, không đoán mò, blast radius check trước khi đổi public interface, không sửa source khi role là BA/TechLead/PM/QC/QA**.
