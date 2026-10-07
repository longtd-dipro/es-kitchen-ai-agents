# Designer Kit — prototype-to-figma

> Package standalone chỉ chứa **1 agent**: `designer-agent` (KIT MODE — Prototype → Figma).

## Agent

| Agent | Vai trò | Trigger | Slash command |
|---|---|---|---|
| `designer-agent.md` | UI/UX 2D Designer | Chuyển HTML Prototype (± SPEC.md) thành Figma HIGH-FIDELITY theo design system ES Kitchen | `"Hãy là Designer, chuyển prototype sang Figma: prototype: <path>, figma: <url>"` · `/prototype-to-figma` · `/create-ui-design <SPEC.md>` |

Agent **bắt buộc** chạy Bước 0 trước khi vẽ:
`0.I AskUserQuestion input (prototype · tài liệu · Figma đích · tên output)` → `0.0 check design system` → `0.1 learning` → `0.2 AskUserQuestion platform` → `0.2b AskUserQuestion naming (vi-ja-en)` → `0.3–0.4 learning + tóm tắt`.

## Skills · Rules · Context

| Loại | File | Nội dung |
|---|---|---|
| Skill | `.claude/skills/figma-design/` | Cách dùng Figma MCP, multi-flow layout |
| Design spec | `.claude/designer-agent/design-spec/` | Token đã đo + spec 7 platform + `tokens.json` + ảnh `refs/` |
| Rule | `.claude/rules/design_rule.md` | Token system + per-site layout (§10–11) |
| Rule | `.claude/rules/designer-preflight.md` | Gate A/B design system + component library |
| Rule | `.claude/rules/RELIABILITY.md` · `POLICY.md` | Không đoán mò · bảo mật |
| Context | `.claude/context/designer-context.md` | Component keys library ES Kitchen, clone pattern, theme per repo |
| Context | `.claude/context/business-flows/screen-code-rule.md` | Quy tắc Screen Code `<Module>_<Feature>_<Seq>` |
| Memory | `.claude/memory/` | Quyết định đã chốt (màu, bẫy đặt tên, viewport, naming) |

## Platform hỗ trợ

| Platform | Repo | Epic | Primary | Viewport |
|---|---|---|---|---|
| Admin Web | es-kitchen-web-admin | E03 | `#0969DA` | 1440 × 1024 |
| Company Web | es-kitchen-web-company | E02 | `#F4860C` | 1440 × 1024 |
| Supplier Web | es-kitchen-web-supplier | E04 | `#6639BA` | 1440 × 1024 |
| Công ty vận chuyển Web (委託配送会社) | es-kitchen-web-outsource-web-private | E05 | `#1A7F37` | 1440 × 1024 |
| User Mobile App | es-kitchen-payment-app | E01 | gradient `#FAC215→#FFC562` | 390 × 844 |
| WebApp ES_QR (mới) | chưa có repo | — | gradient vàng | 390 × 844 |
| WebApp Driver | es-kitchen-webapp-driver | E06 | `#0969DA` + COOL `#5A3AE9` | 390 × 844 |

**Không nhầm:** E02 Company = cam (Figma variable tên `admin/*`) · E03 Admin = xanh dương (Figma variable tên `company/*`).

## Không có trong package này

BA / Tech Lead / PM / Dev / QC / QA agent. Muốn full BMAD pipeline → dùng repository chính `AI_AGENTS_ES_KITCHEN`.
