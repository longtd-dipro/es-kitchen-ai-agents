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
| `es-kitchen-web-supplier` | `es-kitchen-repository/es-kitchen-web-supplier` | Supplier Web (E04) — quản lý menu, nhận đơn | React 19 / Vite 7 / Redux Toolkit |
| `es-kitchen-web-outsource-web-private` | `es-kitchen-repository/es-kitchen-web-outsource-web-private` | Outsource / Internal Private Admin Web (E05) — operation tool quản lý account & sales | React 19 / Vite 8 / Redux Toolkit |
| `es-kitchen-webapp-driver` | `es-kitchen-repository/es-kitchen-webapp-driver` | Driver Web App (E06) — nhận order, cập nhật trạng thái giao hàng | React 19 / Vite 7 / Ant Design |

**Docs:** `es-kitchen-docs/docs/features/` — **single long-memory** chứa SPEC, DESIGN, PLAN, tasks, test-cases. Folder `docs/epics/` cũ đã bị bỏ — mọi feature đặt cùng path. Chi tiết → `.claude/context/doc-structure.md`.

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
- **Handover chain:** chi tiết step-by-step ở bảng **BMAD Workflow** bên dưới. Sơ đồ trực quan ở `es-kitchen-docs/docs/index.md` (mermaid). Lưu ý: **QC chạy 2 lần** — lần 1 sau SPEC (sinh TC song song với Tech Lead Design), lần 2 sau khi dev xong (execute TC + bug report + regression).

### Sub-agents — `.claude/agents/`

| Agent | Vai trò | Trigger khi | Slash command |
|---|---|---|---|
| `ba-agent.md` | Business Analyst | Phân tích yêu cầu, tạo SPEC.md | `/create-spec` |
| `techlead-design-agent.md` | Tech Lead Design | Đọc SPEC → tạo DESIGN.md per repo | `/create-design` |
| `techlead-tasks-agent.md` | Tech Lead Tasks | Đọc DESIGN → phân rã task files | `/create-tasks` |
| `pm-agent.md` | Project Manager | Tạo PLAN.md, phase-gate, timeline | `/create-plan` |
| `backend-agent.md` | NestJS Developer | Implement/review API, service, entity, migration, Redis | `/generate-api`, `/review-code` |
| `frontend-agent.md` | React Developer | Implement/review component, hook, store (E02 + E03 + E04 + E05 + E06) | `/create-component`, `/review-code` |
| `mobile-agent.md` | Flutter Developer | Implement/review screen, Socket.IO, payment (E01) | `/review-code` |
| `qc-agent.md` | QC Manual Tester | **Sau SPEC, trước/trong khi test** — sinh TC (RBT/QUICK), regression, execution checklist, bug report, test data, exploratory charter | `/test/generate_*` (11 commands) |
| `qa-agent.md` | QA Engineer | **Sau khi dev xong task** — chạy test suite, verify coverage, validate AC, non-regression | — (chạy manual hoặc qua sub-agent) |

> **QC vs QA:** `qc-agent` = manual tester chuẩn bị/thực thi TC (output là artifact `.md` cho QC team); `qa-agent` = post-dev verification (output là QA Report per task). Không trùng nhau.

### Slash Commands — `.claude/commands/`

**BMAD core:**

| Command | Chức năng | Loại | Canonical workflow |
|---|---|---|---|
| `/create-spec <feature>` | Tạo SPEC.md | thin entry | `ba-agent.md` |
| `/create-design <SPEC.md>` | Tạo DESIGN.md per repo | thin entry | `techlead-design-agent.md` |
| `/create-tasks <feature/>` | Phân rã DESIGN → task files | thin entry | `techlead-tasks-agent.md` |
| `/create-plan <feature/>` | Tạo PLAN.md | thin entry | `pm-agent.md` |
| `/create-backlog <feature/>` | Sync task files → Backlog issues qua MCP | thin entry | `pm-agent.md` (Bước 4) |
| `/review-code [path]` | Review code thay đổi trên branch | standalone | repo-specific (BE/FE/Mobile) |
| `/generate-api <module>` | Scaffold NestJS module | standalone | follow `backend-agent` + `nestjs-best-practices` skill |
| `/create-component <Name> [admin\|company]` | Scaffold React component | standalone | follow `frontend-agent` + `react-expert` skill |

**QC manual testing (`/test/*`)** — canonical workflow: `qc-agent.md`:

| Command | Chức năng | Loại | Skill |
|---|---|---|---|
| `/test/generate_manual_testcases_rbt` | Sinh TC theo FULL RBT 6 bước từ SPEC.md | thin entry | `rbt_manual_testing` (FULL) |
| `/test/generate_testcases_from_requirements` | Sinh TC nhanh (QUICK mode) | thin entry | `rbt_manual_testing` (QUICK) |
| `/test/update_testcases_from_requirements` | Cập nhật TC khi SPEC thay đổi (delta) | thin entry | `rbt_manual_testing` |
| `/test/generate_cross_module_test_plan` | Sinh ma trận tổ hợp Pairwise đa module | thin entry | `requirements_analyzer` |
| `/test/generate_regression_suite` | Chọn TC chạy lại sau code change | thin entry | `rbt_manual_testing` |
| `/test/generate_test_execution_checklist` | Checklist ưu tiên trước release (Must/Should/Nice) | thin entry | `rbt_manual_testing` |
| `/test/generate_exploratory_charter` | Structured exploratory testing session | thin entry | `rbt_manual_testing` |
| `/test/generate_qc_onboarding_report` | Coverage map + task list cho QC mới | thin entry | `rbt_manual_testing` + `requirements_analyzer` |
| `/test/generate_test_data` | Test data positive/negative/boundary/edge | standalone | — |
| `/test/generate_bug_report` | Chuẩn hóa bug report cho Backlog | thin entry | `bug_reporter` |
| `/test/export_to_drive` | Export bảng markdown → Google Sheet | standalone | — |

> **thin entry** = command chỉ load agent canonical, không chứa workflow. **standalone** = command có workflow riêng (chưa refactor hoặc không cần agent persona).

### Skills — `.claude/skills/`

| Skill | Repo | Dùng khi |
|---|---|---|
| `nestjs-best-practices/` | `es-kitchen-api` | Viết/review NestJS |
| `postgresql/` | `es-kitchen-api` | Schema, migration, query |
| `redis-development/` | `es-kitchen-api` | Redis cache pattern |
| `react-expert/` | All FE repos (E02–E06) | React 19 hooks/component patterns |
| `frontend-review/` | All FE repos (E02–E06) | Code review React 19 / TanStack v5 / RTK v2 / AntD v6 |
| `flutter-review/` | payment-app | Code review Flutter E01 |
| `business-analyst/` | — | Discovery, SPEC template |
| `technical-writing/` | Tất cả | Viết/cập nhật docs |
| `solution-architect/` | — | Kiến trúc cross-cutting |
| `rbt_manual_testing/` | — | Sinh manual TC (QUICK + FULL RBT 6 bước) — master skill cho `qc-agent` |
| `requirements_analyzer/` | — | Phân tích requirements **đa nguồn** (cross-SPEC, Drive, Backlog) — chỉ dùng cho `/test/generate_cross_module_test_plan` + `/test/generate_qc_onboarding_report`. Không cần khi chỉ đọc 1 SPEC.md đã structured. |
| `bug_reporter/` | — | Chuẩn hóa bug report — severity/priority/repro steps cho `qc-agent` |

### Context — `.claude/context/` (đọc on-demand)

> Liệt kê chỉ tên agent — slash command tương ứng tự load context qua agent canonical (xem mapping ở bảng Sub-agents).

| File | Nội dung | Ai đọc |
|---|---|---|
| `specification.md` | Business context, epics, phase-gate G1-G6 | `ba-agent`, `pm-agent` |
| `technical.md` | Tech stack, CI/CD, known bugs | `techlead-design-agent`, `backend-agent` |
| `backlog-workflow.md` | Quy tắc tạo issue/task, status workflow | `techlead-tasks-agent` + tất cả agents khi tạo task |
| `doc-structure.md` | Cấu trúc SPEC/DESIGN/PLAN theo feature type | `ba-agent`, `techlead-design-agent`, `techlead-tasks-agent` |
| `business-flows/README.md` | Index 15 domain + map repo→domain (long-term business memory, nguồn `function_list.xlsx`) | `ba-agent`, `techlead-design-agent`, `pm-agent` |
| `business-flows/business-flow-index.md` | 23 nghiệp vụ + Target + Backlog ID + FigJam link | `ba-agent` (lookup domain), `pm-agent` (scope) |
| `business-flows/domains/<slug>.md` | Stories per domain (Hợp đồng, Menu & Order, Giao hàng…) — đọc đúng 1 domain liên quan | `ba-agent` (Discovery/SPEC), `techlead-design-agent` (Design) |
| `business-flows/function-list.md` | Master function list — Summary by epic + Phase 1/2 stories (135 KB, chỉ load khi cần lookup function cụ thể) | `pm-agent` (estimate), `techlead-design-agent` (scope check) |
| `business-flows/screen-code-rule.md` | Quy tắc `<Module>_<Feature>_<Seq>` | Dev / QC khi đặt screen code mới |
| `ai-workflow.md` | Kiến trúc AI Agent system | Khi mở rộng agent system |

### Workflows — `.claude/workflows/` (đọc on-demand)

| File | Nội dung | Ai dùng |
|---|---|---|
| `db-connect-dev.md` | Kết nối PostgreSQL DEV | `backend-agent` |
| `db-connect-staging.md` | Kết nối PostgreSQL Staging qua SSM | `backend-agent` |
| `new-feature.md` | BMAD pipeline end-to-end | Reference workflow |
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
| 3 | `/create-tasks <feature/>` | `tasks/task-*.md` | `techlead-tasks-agent` | Planning |
| 4 | `/create-plan <feature/>` | `PLAN.md` | `pm-agent` | Planning |
| 4b | (optional) `/create-backlog <feature/>` | Backlog issues (1 per task) | `pm-agent` (Bước 4) | Planning |
| 5a | Implement BE task | Working code | `backend-agent` | Build |
| 5b | Implement FE task | Working code | `frontend-agent` | Build |
| 5c | Implement Mobile task | Working code | `mobile-agent` | Build |
| 6 | QA verify per task | QA Report | `qa-agent` | Verify |
| 7a | Execute manual TC | Test execution checklist + Bug reports | `qc-agent` | Test |
| 7b | (optional) `/test/generate_regression_suite` | Regression suite | `qc-agent` | Test |

**Phase order:** Phase 1 (DB migration) → Phase 2 (API) → Phase 3 (FE + Mobile song song) → Phase 4 (Integration)

**Contract Lock** trước Phase 3: REST API + WebSocket events + Push notification payload — confirm bởi BE + FE + Mobile + PM + QC (để QC chốt TC dựa trên contract).

**QC khi nào tham gia:**
- **Sau bước 1 (SPEC ready):** chạy `/test/generate_manual_testcases_rbt` song song với Tech Lead design — TC sẵn sàng khi dev xong
- **Khi SPEC update:** `/test/update_testcases_from_requirements` để delta-update bộ TC
- **Trước release:** `/test/generate_test_execution_checklist` + `/test/generate_regression_suite`
- **Trong sprint:** `/test/generate_bug_report` mỗi lần tìm bug
- **QC mới join:** `/test/generate_qc_onboarding_report`

Chi tiết → `.claude/workflows/new-feature.md`

</bmad_workflow>

---

<memory_update_gate>

## Memory Update Gate — sau mỗi Dev task

| Thay đổi | Action |
|---|---|
| Endpoint mới / đổi method/path/response | cập nhật `api-catalog.md` |
| Entity mới / đổi column/relation | cập nhật `erd.md` |
| Pattern mới trong codebase | cập nhật `patterns.md` của repo |
| Thay đổi kiến trúc lớn | cập nhật `architecture.md` / `tech_stack.md` |
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
