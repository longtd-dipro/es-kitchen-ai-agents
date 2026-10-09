# ES KIT — QC Automation Package

> Package standalone chỉ chứa **1 agent duy nhất**: `qc-automation-agent`.

## Agent

| Agent | Vai trò | Trigger | Slash command |
|---|---|---|---|
| `qc-automation-agent.md` | QC Automation Tester | Sinh Playwright `.spec.ts` từ SPEC.md + Figma → chạy E2E test → xuất execution report | `"Hãy là QC Automation, test feature: <feature-path>, Figma: <url>"` hoặc `/qc-automation` |

Agent tự **cài Playwright** lần đầu và **hỏi kỹ input** nếu thiếu (SPEC, Figma URL, target app, website URL, test cases).

## Skills

| Skill | Nội dung |
|---|---|
| `automation_engineer` | Playwright + Page Object patterns + selector guidelines |
| `bug_reporter` | Format bug report chuẩn (severity/priority/steps to reproduce) |

## Slash Command

| Command | Nội dung |
|---|---|
| `/qc-automation <feature-path> <figma-url> [testcases]` | Entry point cho QC Automation Agent |

## Ecosystem context

Package này target 5 web app của ESKITCHEN:

| Target app | Repo tương ứng | Epic |
|---|---|---|
| `web-admin` | es-kitchen-web-admin | E03 System Admin |
| `web-company` | es-kitchen-web-company | E02 Company Admin |
| `web-supplier` | es-kitchen-web-supplier | E04 Supplier |
| `web-outsource` | es-kitchen-web-outsource-web-private | E05 Internal |
| `webapp-driver` | es-kitchen-webapp-driver | E06 Driver |

**Lưu ý phân biệt:**
- E02 ≠ E03 — `web-company` là Company Admin (E02), `web-admin` là System Admin (E03)
- E04 ≠ E05 — `web-supplier` là Supplier (E04, public-facing), `web-outsource` là internal tool (E05)

## Không có trong package này

Package minimal — chỉ QC Automation. Các agent BA / Tech Lead / PM / Dev / QC manual / QA / Designer KHÔNG có ở đây. Nếu bạn muốn full BMAD pipeline → dùng repository chính của ESKITCHEN.
