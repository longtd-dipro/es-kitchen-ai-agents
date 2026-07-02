**Last updated:** 02/06/2026
**Maintained by:** TRAN DUC LONG

---

## 1. Tổng quan

Hệ thống AI Agent của ESKITCHEN được tổ chức trong thư mục `.claude/` tại root project. Thiết kế theo nguyên tắc **load đúng thứ gì, đúng lúc** — tránh tốn token không cần thiết.

```
.claude/
├── agents/        ← Sub-agents chuyên biệt (load khi spawn)
├── commands/      ← Slash commands (chi tiết: .claude/commands/README.md)
├── skills/        ← Knowledge packs chuyên sâu (load khi invoke)
├── rules/         ← Constraints & conventions (AUTO-LOAD mọi session)
├── context/       ← Project background knowledge (load on-demand)
└── workflows/     ← Workflow scripts + operational runbooks (load on-demand)
```

Source code: `es-kitchen-repository/` (7 repos). Docs: `es-kitchen-docs/docs/features/` (single long-memory).

> Danh sách đầy đủ command / skill / workflow script → `.claude/commands/README.md`. README này chỉ giữ phần overview + cách chạy nhanh.

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
| `.claude/workflows/*` | On-demand | Agent chủ động, hoặc Workflow tool khi gọi theo `name` |

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
| `designer-agent.md` | UI Designer | Read, Write, Edit, Figma tools | **Sau SPEC** — tạo Figma screens, điền URL vào SPEC.md ## Screens |
| `qa-agent.md` | QA Engineer | Read, Bash, tilth_* | **Sau khi dev xong task** — chạy test, validate AC, non-regression |
| `qc-automation-agent.md` | QC Automation Tester | Read, Write, Edit, Bash, Figma tools | **Sau khi deploy DEV** — sinh Playwright, chạy E2E headed mode |

> **QC vs QA vs QC-Automation:** `qc-agent` = manual tester (output `.md` cho QC team); `qa-agent` = post-dev verification (output QA Report per task); `qc-automation-agent` = E2E tự động trên browser. Không trùng nhau.

---

## 4. Rules — `.claude/rules/`

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

## 5. Context — `.claude/context/`

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

## 6. Muốn chạy full-flow? Dùng `/create-feature`

Nếu chỉ muốn **1 lệnh chạy hết toàn bộ pipeline** để ra sản phẩm hoàn chỉnh (SPEC → DESIGN → tasks → code đã qua QA/QC), không cần biết trình tự 11 agent bên trên — dùng:

```
Bước 1   /create-feature <feature> <mô tả>
         → BA → Design (Tech Lead/QC/Designer song song) → Tech Lead Tasks
         → dừng lại, in ra toàn bộ file đã tạo (SPEC.md, DESIGN.md, test-cases, Figma, tasks/*.md)

Bước 2   Tự review lại các file trên (gate bắt buộc — không tự động chạy tiếp)

Bước 3   /create-feature <feature> build
         → Dev (Backend trước → Frontend/Mobile song song) → QA verify → QC (checklist + E2E automation song song)
         → báo cáo kết quả cuối
```

**Ví dụ:**
```
/create-feature user-login Chức năng đăng nhập bằng email và social login (Google, Apple)
... (review SPEC/DESIGN/tasks) ...
/create-feature user-login build
```

Ghi chú:
- Không có PM trong flow này (không sinh PLAN.md/backlog) — nếu cần, chạy riêng `/create-plan` hoặc `/create-backlog` sau Bước 1.
- Xem tiến trình khi đang chạy: gõ `/workflows`, hoặc hỏi trực tiếp Claude.
- Muốn kiểm soát từng bước riêng lẻ (chỉ tạo lại SPEC, chỉ re-run QA...) → xem mục 8 bên dưới hoặc `.claude/commands/README.md`.

---

## 7. BMAD Pipeline (chi tiết từng bước — khi cần kiểm soát thủ công)

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
      ▼ [pm-agent] /create-plan (optional)
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

## 8. trigger agent riêng lẻ

Mọi agent đều có thể trigger theo 2 cách (dùng khi không cần full-flow của `/create-feature`, chỉ cần 1 bước cụ thể):

### Natural language (recommended cho discovery / iterative work)

```
"Hãy là BA, làm SPEC cho feature import CSV"
"Hãy là Tech Lead Design, làm DESIGN.md từ SPEC: <path>"
"Hãy là QC, sinh test cases từ SPEC: <path>"
"Hãy là QA, verify task: <task-X-Y.md>"
```

---

## 9. AI Policy

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
