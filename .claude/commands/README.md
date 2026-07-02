# ESKITCHEN — Slash Commands

> **Canonical workflow** nằm trong `.claude/agents/*.md`. Commands là thin entry points — không chứa workflow.

## BMAD Core

| Command | Chức năng | Agent |
|---|---|---|
| `/create-spec <feature>` | Tạo SPEC.md | `ba-agent.md` |
| `/create-design <SPEC.md>` | Tạo DESIGN.md per repo | `techlead-design-agent.md` |
| `/create-ui-design <SPEC.md>` | Tạo Figma screens + URL vào SPEC.md ## Screens | `designer-agent.md` |
| `/create-tasks <feature/>` | Phân rã DESIGN → task files | `techlead-tasks-agent.md` |
| `/create-plan <feature/>` | Tạo PLAN.md | `pm-agent.md` |
| `/create-backlog <feature/>` | Sync task files → Backlog issues | `pm-agent.md` |
| `/review-code [path]` | Review code trên branch | repo-specific |
| `/generate-api <module>` | Scaffold NestJS module | `backend-agent` |
| `/create-component <Name> [admin\|company]` | Scaffold React component | `frontend-agent` |

## `/create-feature` — Full Pipeline end-to-end (Workflow orchestrator)

> 1 command duy nhất, chạy nhiều agent tự động qua tool `Workflow`, sinh ra **1 feature hoàn chỉnh** — từ SPEC đến code đã qua QA/QC. Không bao gồm PM — PM chạy riêng qua `/create-plan` nếu cần. Có 1 **gate bắt buộc** giữa Planning và Build — không tự động nối tiếp (do engine Workflow không pause giữa chừng được, gate được hiện thực bằng cách tách thành 2 lần gọi `bmad-plan-phase.js` / `bmad-build-phase.js`, cùng 1 command điều hướng theo tham số).

| Command | Chức năng | Workflow script |
|---|---|---|
| `/create-feature <feature> [mô tả]` | BA → Design (Tech Lead/QC/Designer song song) → Tech Lead Tasks. Dừng lại chờ duyệt (gate). | `bmad-plan-phase.js` |
| `/create-feature <feature> build` | **[Gate: chạy sau khi đã duyệt output ở trên]** Dev (BE → FE/Mobile song song) → QA → QC (checklist + automation song song) | `bmad-build-phase.js` |

### Cách dùng (step-by-step)

```
Bước 1  /create-feature user-login Chức năng đăng nhập bằng email và social login (Google, Apple)
        → chạy Planning phase: BA (SPEC.md) → Design song song (DESIGN.md + test cases + Figma) → Tech Lead Tasks (task files)
        → dừng lại, in ra danh sách toàn bộ file đã tạo

Bước 2  Tự review SPEC.md / DESIGN.md (từng repo) / test-cases / Figma screens / tasks/*.md
        → đây là gate — sửa/yêu cầu sửa lại nếu chưa đúng trước khi qua Bước 3

Bước 3  /create-feature user-login build
        → chạy Build phase: Dev (Backend trước, Frontend/Mobile song song sau khi có API Contract) → QA verify → QC (checklist + E2E automation song song)
        → báo cáo kết quả Dev + QA + QC cuối cùng
```

**Lưu ý khi dùng:**
- Không có tham số `build` ở cuối = **luôn luôn** chạy lại Planning phase (an toàn, không đụng tới source code).
- Chỉ khi gõ đúng `build` ở cuối thì mới chạy Build phase — đây là thao tác duyệt tường minh, không có cách nào để 2 phase tự nối tiếp nhau.
- Xem tiến trình khi đang chạy: gõ `/workflows` để xem cây tiến trình theo từng agent (label + phase), hoặc hỏi trực tiếp Claude "tới đâu rồi".
- Cần `PLAN.md` / sync Backlog thì chạy riêng `/create-plan` hoặc `/create-backlog` sau khi Planning phase xong (không nằm trong `/create-feature`).
- Nếu chỉ cần chạy 1 bước lẻ (vd chỉ tạo lại SPEC.md, hoặc chỉ re-run QA) thì dùng command riêng lẻ tương ứng ở bảng "BMAD Core" phía trên, không cần qua `/create-feature`.

## QC Automation Testing

| Command | Chức năng | Agent |
|---|---|---|
| `/qc-automation <feature-path> <figma-url> <target-app> <website-url>` | Sinh Playwright `.spec.ts` + chạy E2E test + xuất `execution-report.md` | `qc-automation-agent.md` |

> Prefer trigger tự nhiên: **"Hãy là QC Automation, test feature: `<path>`, Figma: `<url>`, app: `<app>`, website: `<url>`"**

## QC Manual Testing (`/test/*`)

> Canonical workflow: `qc-agent.md`

| Command | Chức năng | Skill |
|---|---|---|
| `/test/generate_manual_testcases_rbt` | Sinh TC theo FULL RBT 6 bước | `rbt_manual_testing` (FULL) |
| `/test/generate_testcases_from_requirements` | Sinh TC nhanh (QUICK mode) | `rbt_manual_testing` (QUICK) |
| `/test/update_testcases_from_requirements` | Delta-update TC khi SPEC thay đổi | `rbt_manual_testing` |
| `/test/generate_cross_module_test_plan` | Ma trận Pairwise đa module | `requirements_analyzer` |
| `/test/generate_regression_suite` | Chọn TC chạy lại sau code change | `rbt_manual_testing` |
| `/test/generate_test_execution_checklist` | Checklist ưu tiên trước release | `rbt_manual_testing` |
| `/test/generate_exploratory_charter` | Structured exploratory testing | `rbt_manual_testing` |
| `/test/generate_qc_onboarding_report` | Coverage map + task list QC mới | `rbt_manual_testing` + `requirements_analyzer` |
| `/test/generate_test_data` | Test data positive/negative/boundary/edge | — |
| `/test/generate_bug_report` | Chuẩn hóa bug report cho Backlog | `bug_reporter` |
| `/test/export_to_drive` | Export bảng markdown → Google Sheet | — |

> **thin entry** = command chỉ load agent, không chứa workflow. **standalone** = command có workflow riêng.
