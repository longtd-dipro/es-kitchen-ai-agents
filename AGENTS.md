# ESKITCHEN — Project Rules for AI Agents

<ecosystem>

## Repos

Tất cả source code nằm trong thư mục **`es-kitchen-repository/`**.

| Repo | Đường dẫn | Vai trò | Stack |
|---|---|---|---|
| `es-kitchen-api` | `es-kitchen-repository/es-kitchen-api` | Core API, Business Logic, Domain Gatekeeper | NestJS / TypeScript / PostgreSQL |
| `es-kitchen-payment-app` | `es-kitchen-repository/es-kitchen-payment-app` | User Mobile App (E01) — iOS + Android | Flutter 3.x / Dart / Riverpod |
| `es-kitchen-web-company` | `es-kitchen-repository/es-kitchen-web-company` | Company Admin Web (E02) — 58 functions | React 19 / Vite 7 / Redux Toolkit |
| `es-kitchen-web-admin` | `es-kitchen-repository/es-kitchen-web-admin` | System Admin Web (E03) — 160 functions | React 19 / Vite 7 / Redux Toolkit |
| `es-kitchen-web-supplier` | `es-kitchen-repository/es-kitchen-web-supplier` | Supplier Web (E04) — quản lý menu, nhận đơn | React 19 / Vite 8 / Redux Toolkit |
| `es-kitchen-web-outsource-web-private` | `es-kitchen-repository/es-kitchen-web-outsource-web-private` | Outsource / Internal Private Admin Web (E05) — operation tool quản lý account & sales | React 19 / Vite 8 / Redux Toolkit |
| `es-kitchen-webapp-driver` | `es-kitchen-repository/es-kitchen-webapp-driver` | Driver Web App (E06) — nhận order, cập nhật trạng thái giao hàng | React 19 / Vite 8 / Ant Design |

**Docs:** `es-kitchen-docs/docs/features/` — **single long-memory** chứa SPEC, DESIGN, PLAN, tasks, test-cases. Folder `docs/epics/` cũ đã bị bỏ — mọi feature đặt cùng path. Chi tiết → `.claude/context/doc-structure.md`.

**E2E Testing:** `es-kitchen-testing/` — repo Playwright độc lập ở root (ngang hàng với `es-kitchen-repository/`). Chứa spec files, auth setup per role, execution reports. Hướng dẫn QC → `es-kitchen-testing/QC-GUIDE.md`.

</ecosystem>

---

<core_rules>

## Nguyên tắc bắt buộc (project-specific)

> **AI behavior policy chung** (không đoán mò · stack constraints · permission per persona · ...) → xem `./POLICIES.md` (always-loaded). Dưới đây chỉ liệt kê rules **đặc thù project ESKITCHEN** mà POLICIES.md không cover.

1. **Không nhầm E02 ↔ E03** — `web-company` = Company Admin (E02), `web-admin` = System Admin (E03). Đây là bug phổ biến nhất.
2. **Không nhầm E04 ↔ E05** — `web-supplier` = Supplier domain (E04, public-facing), `web-outsource-web-private` = internal operation tool (E05).
3. **Context files đọc đúng theo role** — xem cột "Ai đọc" trong bảng Context (section `<agent_architecture>` bên dưới). Không đọc rộng ra ngoài role.
4. **Doc location single path:** mọi feature docs đặt trong `es-kitchen-docs/docs/features/<feature>/`. Folder `docs/epics/` cũ đã bị bỏ.
5. **Memory Update Gate** sau mỗi dev task (xem section `<memory_update_gate>` bên dưới) — không skip.

Chi tiết per-layer rules → `.claude/rules/`: `stack-constraints.md` · `security-rules.md` · `git-workflow.md` · `coding-style.md` · `project-structure.md`

</core_rules>

---

<tilth_rules>

## Source code analysis — dùng tilth

```bash
tilth_search(query: "OrderService")          # tìm symbol/usage
tilth_read(paths: ["<file>"])                # đọc file
tilth_files(pattern: "**/*.service.ts")      # list file
tilth_deps(path: "<file>")                   # blast radius — BẮT BUỘC trước khi đổi public interface
```

**Thứ tự:** đọc docs liên quan → `tilth_search` xác nhận thực tế → mới generate code.

</tilth_rules>

---

<red_line_rules>

## Phân công cross-repo (tính năng chạm nhiều repo)

> Mapping 1 repo → 1 epic: xem bảng **Repos** ở section `<ecosystem>`. Phần dưới chỉ liệt kê các tính năng **đụng nhiều repo cùng lúc** — dev phải đụng vào cả 2 bên.

| Tính năng cross-repo | Repos liên quan |
|---|---|
| elepay / Alipay / WeChat Pay | `es-kitchen-api` (server-side intent) + `es-kitchen-payment-app` (client SDK) |
| Push notification Firebase | `es-kitchen-api` (send via FCM) + `es-kitchen-payment-app` (receive + display) |
| Auth flow (JWT) | `es-kitchen-api` (issue + verify) + tất cả FE/Mobile (lưu cookie/secure storage) |
| WebSocket real-time | `es-kitchen-api` (socket.io server) + repo nào subscribe event đó |

</red_line_rules>

---

<agent_architecture>

## Kiến trúc Agent — `.claude/`

### Nguyên tắc — Agent vs Command

- **Agent** (`.claude/agents/*.md`) = **canonical workflow** + persona + ràng buộc + template. Single source of truth cho từng vai trò.
- **Command** (`.claude/commands/*.md`) = **thin entry point** (5–8 dòng). Mỗi BMAD command chỉ trỏ về agent tương ứng và truyền `$ARGUMENTS`. Không chứa workflow.
- Khi sửa quy trình BA / Tech Lead / PM → **chỉ sửa file agent**, không sửa command (trừ khi đổi command name hoặc cách parse args).
- User có thể trigger theo 2 cách: gõ slash command (`/create-spec login`) hoặc nói tự nhiên ("hãy là BA, làm SPEC cho login") — cả hai cùng load file agent.
- **Handover hint:** Section "Bước tiếp theo" trong Output của mỗi agent dùng natural language (vd `"Hãy là Tech Lead Design, làm DESIGN.md từ SPEC: <path>"`) — user copy-paste làm prompt turn kế tiếp. Slash command tương ứng vẫn work song song.
- **Handover chain:** chi tiết step-by-step ở bảng **BMAD Workflow** bên dưới. Sơ đồ trực quan ở `es-kitchen-docs/docs/index.md` (mermaid). Lưu ý: **Bước 2 gồm 3 agent chạy song song** — 2a Tech Lead Design (DESIGN.md) · 2b QC (test cases) · 2c Designer (Figma frames + URL điền vào SPEC.md ## Screens). **QC chạy 3 lần** — lần 1 sau SPEC (sinh TC manual), lần 2 sau dev xong (execute TC + bug report), lần 3 song song với 7a (chạy Playwright E2E tự động — `qc-automation-agent`).

### Sub-agents — `.claude/agents/`

| Agent | Vai trò | Trigger khi | Slash command |
|---|---|---|---|
| `ba-agent.md` | Business Analyst | Phân tích yêu cầu, tạo SPEC.md | `/create-spec` |
| `techlead-design-agent.md` | Tech Lead Design | Đọc SPEC → tạo DESIGN.md per repo | `/create-design` |
| `techlead-tasks-agent.md` | Tech Lead Tasks | Đọc DESIGN → phân rã task files | `/create-tasks` |
| `pm-agent.md` | Project Manager | Tạo PLAN.md, phase-gate, timeline | `/create-plan` |
| `backend-agent.md` | NestJS Developer | Implement/review API, service, entity, migration, Redis | `/generate-api`, `/review-code` |
| `frontend-agent.md` | React Developer | Implement/review component, hook, store — E02/E03/E04/E05/E06 (5 web repos, same React stack) | `/create-component`, `/review-code` |
| `mobile-agent.md` | Flutter Developer | Implement/review screen, Socket.IO, payment (E01) | `/review-code` |
| `qc-agent.md` | QC Manual Tester | **Sau SPEC, trước/trong khi test** — sinh TC (RBT/QUICK), regression, execution checklist, bug report, test data, exploratory charter | `/test/generate_*` (11 commands) |
| `designer-agent.md` | UI Designer | **Sau SPEC** — tạo Figma screens, điền Figma URL vào SPEC.md ## Screens | `/create-ui-design` |
| `qa-agent.md` | QA Engineer | **Sau khi dev xong task** — chạy test suite, verify coverage, validate AC, non-regression | `"Hãy là QA, verify task: <path/task-x-y.md>"` |
| `qc-automation-agent.md` | QC Automation Tester | **Sau khi Dev deploy lên DEV** — đọc SPEC.md + Figma + source code, sinh Playwright `.spec.ts`, chạy E2E test, xuất execution report | `"Hãy là QC Automation, test feature: <feature-path>, Figma: <url>, app: <target-app>, website: <url>"` |

> **QC vs QA vs QC-Automation:** `qc-agent` = manual tester sinh/thực thi TC (artifact `.md`); `qa-agent` = post-dev verify unit test + coverage (QA Report per task); `qc-automation-agent` = E2E test tự động trên browser sau khi website chạy (`.spec.ts` + execution report). Ba agent bổ sung nhau, không thay thế.

### Slash Commands — `.claude/commands/`

Danh sách đầy đủ (BMAD core + `/test/*`) → `.claude/commands/README.md`

### Skills — `.claude/skills/`

Danh sách đầy đủ (skill → repo → khi nào dùng) → `.claude/skills/README.md`

### Context — `.claude/context/` (đọc on-demand)

> Agent phải gọi `tilth_read` cho các file này trong Bước 1 — không tự động load. Cột "Ai đọc" chỉ định agent nào cần đọc file đó.

| File | Nội dung | Ai đọc |
|---|---|---|
| `specification.md` | Business context, epics, phase-gate G1-G6 | `ba-agent`, `pm-agent` |
| `technical.md` | Tech stack, CI/CD, known bugs | `techlead-design-agent`, `backend-agent` |
| `backlog-workflow.md` | Quy tắc tạo issue/task, status workflow | `techlead-tasks-agent`, `pm-agent`, `backend-agent`, `frontend-agent`, `mobile-agent` |
| `doc-structure.md` | Cấu trúc SPEC/DESIGN/PLAN theo feature type | `ba-agent`, `techlead-design-agent`, `techlead-tasks-agent`, `designer-agent` |
| `designer-context.md` | UI components catalog (30+ Base*) per repo, theme thực tế, conflicts (E04 color), sample data tiếng Nhật. Auto-extracted từ source code es-kitchen-repository/. | `designer-agent` (BẮT BUỘC mỗi lần chạy) |
| `business-flows/README.md` | Index 15 domain + map repo→domain (long-term business memory, nguồn `function_list.xlsx`) | `ba-agent`, `techlead-design-agent`, `pm-agent` |
| `business-flows/business-flow-index.md` | 23 nghiệp vụ + Target + Backlog ID + FigJam link | `ba-agent` (lookup domain), `pm-agent` (scope) |
| `business-flows/domains/<slug>.md` | Stories per domain (Hợp đồng, Menu & Order, Giao hàng…) — đọc đúng 1 domain liên quan | `ba-agent` (Discovery/SPEC), `techlead-design-agent` (Design) |
| `business-flows/function-list.md` | Master function list — Summary by epic + Phase 1/2 stories (135 KB, chỉ load khi cần lookup function cụ thể) | `pm-agent` (estimate), `techlead-design-agent` (scope check) |
| `business-flows/screen-code-rule.md` | Quy tắc `<Module>_<Feature>_<Seq>` | `ba-agent` (điền Screen Code vào SPEC) · `designer-agent` (đặt frame name Figma) · `frontend-agent`, `mobile-agent`, `qc-agent` (khi đặt screen code mới) |
| `ai-workflow.md` | Kiến trúc AI Agent system | Human reference — không có agent cụ thể; đọc khi thêm agent mới |

### Workflows — `.claude/workflows/` (đọc on-demand)

| File | Nội dung | Ai dùng |
|---|---|---|
| `db-connect-dev.md` | Kết nối PostgreSQL DEV | `backend-agent` |
| `db-connect-staging.md` | Kết nối PostgreSQL Staging qua SSM | `backend-agent` |
| `new-feature.md` | BMAD pipeline end-to-end | Human reference — đọc khi cần tra cứu thứ tự pipeline; `pm-agent` đọc khi lập PLAN |
| `bug-fix.md` | Quy trình điều tra và fix bug | `backend-agent` / `frontend-agent` / `mobile-agent` |

</agent_architecture>

---

<bmad_workflow>

## BMAD Workflow

| Bước | Command | Output | Agent | Phase |
|---|---|---|---|---|
| 1 | `/create-spec <feature>` | `SPEC.md` | `ba-agent` | Discovery |
| 2a | `/create-design <SPEC.md>` | `DESIGN.md` per repo | `techlead-design-agent` | Design |
| 2b | `/test/generate_manual_testcases_rbt` (parallel) | `test-cases/tc_*.md` | `qc-agent` | Design |
| 2c | `/create-ui-design <SPEC.md>` (parallel) | Figma frames + URL điền vào SPEC.md ## Screens | `designer-agent` | Design |
| 3 | `/create-tasks <feature/>` | `tasks/task-*.md` (Phase 1,2: template BE; Phase 3: template FE/Mobile Bước 6b) | `techlead-tasks-agent` | Planning |
| 4 | `/create-plan <feature/>` | `PLAN.md` | `pm-agent` | Planning |
| 4b | (optional) `/create-backlog <feature/>` | Backlog issues (1 per task) | `pm-agent` (Bước 4) | Planning |
| 5a | Implement BE task (Phase 1→2) | Working code + **API Contract table** | `backend-agent` | Build |
| 5b | Copy API Contract → task-3-x.md | Paste vào section `## API Contract` trong task-3-x.md (template Bước 6b) | — (manual step) | Build |
| 5c | Implement FE task (Phase 3): Step1 service file → Step2 hooks → Step3 wire UI | Working code + integration check | `frontend-agent` | Build |
| 5d | Implement Mobile task (Phase 3, song song với 5c) | Working code + integration check | `mobile-agent` | Build |
| 5e | task-4-x Integration test | Verify BE + FE + Mobile hoạt động end-to-end | `backend-agent` + `frontend-agent` + `mobile-agent` | Integration |
| 6 | QA verify per task | QA Report | `qa-agent` — trigger: `"Hãy là QA, verify task: <path>"` | Verify |
| 7a | Sinh/chạy execution checklist | Test execution checklist + Bug reports | `qc-agent` — trigger: `/test/generate_test_execution_checklist` | Test |
| 7b | (optional) `/test/generate_regression_suite` | Regression suite | `qc-agent` | Test |
| 7c | `"Hãy là QC Automation, test feature: <feature-path>, Figma: <figma-url>, app: <target-app>, website: <url>"` (song song với 7a) | Playwright `.spec.ts` + `execution-report.md` | `qc-automation-agent` — **điều kiện:** website đang chạy trên DEV, SPEC.md + Figma URL có sẵn | Test |

**Phase order:** Phase 1 (DB migration) → Phase 2 (API + output API Contract) → **copy API Contract vào FE task** → Phase 3 (FE + Mobile song song, mỗi task 3 sub-steps) → Phase 4 (Integration)

**Contract Lock** trước Phase 3: REST API + WebSocket events + Push notification payload — confirm bởi BE + FE + Mobile + PM + QC (để QC chốt TC dựa trên contract).

**API Contract handoff** (mới): Sau khi BE xong task Phase 2, bảng `## API Contract` trong BE output phải được copy vào section tương ứng trong task Phase 3 (FE/Mobile) trước khi FE/Mobile bắt đầu code. FE không tự đoán endpoint.

Chi tiết trigger Designer / QC + thứ tự tham gia → `.claude/workflows/new-feature.md`

</bmad_workflow>

---

<memory_update_gate>

## Memory Update Gate — sau mỗi Dev task

| Thay đổi | File cần cập nhật (full path) |
|---|---|
| Endpoint mới / đổi method/path/response | `es-kitchen-docs/docs/backend/es-kitchen-api/overview/api-catalog.md` |
| Entity mới / đổi column/relation | `es-kitchen-docs/docs/backend/es-kitchen-api/overview/erd.md` |
| Pattern mới trong BE codebase | `es-kitchen-docs/docs/backend/es-kitchen-api/overview/patterns.md` |
| Pattern mới trong FE codebase | `es-kitchen-docs/docs/frontend/<repo>/overview/patterns.md` |
| Thay đổi cấu trúc module / thư mục lớn | `es-kitchen-docs/docs/<layer>/<repo>/overview/structure.md` |
| Không có gì thay đổi | Bỏ qua |

```
✅ task-x-y hoàn thành
Files đã thay đổi:  <path> → <mô tả>
Unit Tests:         ✅ <file>.spec.ts pass, coverage X% (target Y%)
Non-Regression:     ✅ <tính năng X> vẫn hoạt động
Memory Update Gate: ✅/skipped api-catalog / erd / patterns
Bước tiếp theo:     → "Hãy là QA, verify task này: <task-x-y.md>"
                    → sau khi QA PASS: task-x-(y+1)
```

> Dev agent (`backend-agent`, `frontend-agent`, `mobile-agent`) **handover qa-agent** trước khi sang task tiếp theo. `qa-agent` chạy unit test + validate AC + check non-regression. Nếu QA FAIL, dev fix rồi loop lại; nếu QA PASS, dev mới move sang task kế tiếp.

</memory_update_gate>
