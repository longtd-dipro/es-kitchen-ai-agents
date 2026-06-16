# ESKITCHEN — Skills Registry

> Skills được load on-demand trong từng agent. File này là registry tra cứu — không phải always-loaded.

| Skill | Repo | Dùng khi |
|---|---|---|
| `nestjs-best-practices/` | `es-kitchen-api` | Viết/review NestJS |
| `postgresql/` | `es-kitchen-api` | Schema, migration, query |
| `redis-development/` | `es-kitchen-api` | Redis cache pattern |
| `react-expert/` | All FE repos (E02–E06) | React 19 hooks/component patterns |
| `frontend-review/` | All FE repos (E02–E06) | Code review React 19 / TanStack v5 / RTK v2 / AntD v6 |
| `flutter-review/` | `payment-app` | Code review Flutter E01 |
| `business-analyst/` | — | Discovery, SPEC template |
| `solution-architect/` | — | Kiến trúc cross-cutting |
| `rbt_manual_testing/` | — | Sinh manual TC (QUICK + FULL RBT 6 bước) — master skill cho `qc-agent` |
| `requirements_analyzer/` | — | Phân tích requirements đa nguồn — chỉ dùng cho `/test/generate_cross_module_test_plan` + `/test/generate_qc_onboarding_report` |
| `bug_reporter/` | — | Chuẩn hóa bug report — severity/priority/repro steps |
| `figma-design/` | All FE repos (E02–E06) + E01 Mobile | Figma MCP tools (read + write), token mapping Figma → ESKITCHEN |
| `task-decomposition/` | — | Phân rã task từ DESIGN.md — dùng bởi `techlead-tasks-agent` |
| `project-planning/` | — | Risk, dependency, critical path — dùng bởi `pm-agent` |
