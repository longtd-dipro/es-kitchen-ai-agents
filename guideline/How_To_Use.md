# Workflow — How to use AI Agent system

> Mỗi task làm theo 5 bước. Không bỏ bước nào, đặc biệt bước 5.

---

## Bước 1 — Mở đúng thư mục

```bash
cd /Users/longtd/Desktop/WORK/AI_AGENTS_ES_KITCHEN
claude
```

AI cần đọc được toàn bộ source (**7 repos**) + docs cùng lúc. Nếu mở sai thư mục, AI sẽ không tìm thấy context và đoán mò.

**7 repos thuộc `es-kitchen-repository/`:**

| Repo | Epic | Stack |
|---|---|---|
| `es-kitchen-api` | — | NestJS + PostgreSQL |
| `es-kitchen-payment-app` | E01 | Flutter |
| `es-kitchen-web-company` | E02 | React |
| `es-kitchen-web-admin` | E03 | React |
| `es-kitchen-web-supplier` | E04 | React |
| `es-kitchen-web-outsource-web-private` | E05 | React |
| `es-kitchen-webapp-driver` | E06 | React |

---

## Bước 2 — Gọi AI bằng đúng vai

Mỗi vai có quyền và nhiệm vụ khác nhau. Gọi sai vai → AI làm quá scope hoặc thiếu depth.

| Việc cần làm | Prompt mẫu (natural language) | Slash command (alias) |
|---|---|---|
| Phân tích yêu cầu mới | `Hãy là BA, làm SPEC cho feature: <mô tả ngắn>` | `/create-spec <feature>` |
| Thiết kế technical | `Hãy là Tech Lead Design, làm DESIGN từ SPEC: <path/SPEC.md>` | `/create-design <SPEC.md>` |
| **Thiết kế UI + Figma** (sau SPEC) | `Hãy là Designer, tạo UI-SPEC.md + Figma từ SPEC: <path/SPEC.md>` | `/create-ui-design <SPEC.md>` |
| Tạo task files | `Hãy là Tech Lead Tasks, phân rã tasks: <path/feature-folder/>` | `/create-tasks <feature/>` |
| Lập kế hoạch sprint | `Hãy là PM, làm PLAN.md: <path/feature-folder/>` | `/create-plan <feature/>` |
| Sync tasks → Backlog | `Hãy là PM, sync tasks lên Backlog: <feature-folder/>` | `/create-backlog <feature/>` |
| **Sinh test cases** (sau SPEC) | `Hãy là QC, sinh test cases từ SPEC: <path/SPEC.md>` | `/test/generate_manual_testcases_rbt` |
| **Implement code** | `Hãy là Backend/Frontend/Mobile Developer, implement task: <path/task-x-y.md>` | — |
| **QA verify** (sau dev) | `Hãy là QA, verify task: <path/task-x-y.md>` | — |
| **Bug report** (khi QC tìm bug) | `Hãy là QC, sinh bug report từ mô tả lỗi: <mô tả>` | `/test/generate_bug_report` |

> **Cả 2 cách cùng load chung file `.claude/agents/<role>.md` canonical workflow.** Natural language tốt cho discovery / iterative. Slash command tốt cho repeated task.

**Ví dụ thực tế — BE developer nhận task:**

AI sẽ tự đọc: task file → DESIGN.md → source code liên quan → NestJS guidelines → rồi mới bắt đầu code. Dev không cần giải thích thêm gì nếu task file đã đầy đủ.

**Ví dụ thực tế — khi có yêu cầu mới từ client:**

BA sẽ hỏi thêm **10 câu** trước khi viết SPEC — đừng ngắt, cứ trả lời hết.

**Ví dụ thực tế — sau khi SPEC xong (chạy song song):**

- "Hãy là Tech Lead Design, làm DESIGN từ SPEC: docs/features/import-csv/SPEC.md"
- "Hãy là Designer, tạo UI-SPEC.md + Figma từ SPEC: docs/features/import-csv/SPEC.md"
- "Hãy là QC, sinh test cases từ SPEC: docs/features/import-csv/SPEC.md"

→ 3 prompts chạy song song. Khi dev implement: có DESIGN.md (kỹ thuật) + UI-SPEC.md / Figma context (giao diện) + TC (test) sẵn sàng.

---

## Bước 3 — Xác nhận scope trước khi AI code

Trước khi viết dòng code đầu tiên, AI luôn tóm tắt lại kế hoạch:

- Đúng → `OK, tiến hành`
- Có file sai → `File đó không thuộc scope task này, bỏ qua`
- Hiểu sai yêu cầu → Giải thích lại ngay, đừng để AI code xong rồi mới phát hiện

---

## Bước 4 — Review output của AI

AI không bao giờ sai 100% nhưng cũng không bao giờ đúng 100%. Dev phải review.

**Ví dụ review phát hiện vấn đề:**

Dev thấy AI dùng `repository.findOne({ where: { id } })` nhưng project pattern dùng QueryBuilder để handle soft-delete. Phản hồi đúng cách:

> Sai. Project dùng QueryBuilder để handle soft-delete. Xem `docs/backend/es-kitchen-api/overview/patterns.md`. Sửa lại.

---

## Bước 5 — Memory Update Gate *(bắt buộc trước khi đóng session)*

Đây là bước quan trọng nhất để AI session sau không bị mù thông tin. Nếu bỏ qua, đồng nghiệp mở session mới sẽ nhận context lỗi thời.

Nói với AI sau khi task hoàn thành:

> Chạy Memory Update Gate.

AI tự kiểm tra và cập nhật đúng file:

| Loại thay đổi | File AI sẽ cập nhật |
|---|---|
| Thêm endpoint / đổi method, path, request, response | `docs/backend/es-kitchen-api/overview/api-catalog.md` |
| Thêm entity / đổi column / đổi relation | `docs/backend/es-kitchen-api/overview/erd.md` |
| Dùng pattern mới chưa có trong docs | `docs/<layer>/<repo>/overview/patterns.md` của repo tương ứng |
| Thêm module / đổi auth flow / thêm Redis strategy / DESIGN feature | `docs/features/<feature>/<repo>/DESIGN.md` |
| Không có gì thay đổi ở trên | Bỏ qua, không cần cập nhật |

**Ví dụ output AI sau Memory Update Gate:**

```
✅ task-2-1 hoàn thành
Files đã thay đổi:  src/modules/order/order.service.ts → thêm method cancelOrder
Unit Tests:         ✅ order.service.spec.ts pass, coverage 87% (target 80%)
Non-Regression:     ✅ create/update order vẫn hoạt động
Memory Update Gate: ✅ api-catalog.md cập nhật endpoint POST /orders/:id/cancel
                    ✅ patterns.md skipped (không có pattern mới)
Bước tiếp theo:     → "Hãy là QA, verify task này: task-2-1.md"
                    → sau khi QA PASS: task-2-2
```

---

## Khi AI đề xuất sai

| Tình huống | Cách phản hồi đúng |
|---|---|
| Sai pattern | `Sai. Project dùng <pattern X>, xem <path/patterns.md>. Sửa lại.` |
| Sai endpoint | `Endpoint này đã có trong api-catalog. Đừng tạo trùng, dùng lại.` |
| Tạo entity trùng | `Entity này đã có trong erd.md (tên: X). Dùng lại, không tạo mới.` |
| Vượt scope | `Phần này không thuộc task-x-y. Bỏ qua, chỉ làm đúng scope.` |
| Muốn refactor code lân cận | `Không. Chỉ làm đúng yêu cầu task. Refactor tách thành task riêng.` |
| Nhầm E02 ↔ E03 | `E02 = web-company, E03 = web-admin. Đọc lại AGENTS.md.` |
| Nhầm E04 ↔ E05 | `E04 = web-supplier (public), E05 = outsource-private (internal). Đọc lại AGENTS.md.` |

Khi phát hiện pattern quan trọng bị AI bỏ qua nhiều lần → yêu cầu cập nhật `patterns.md` để session sau AI không lặp lại lỗi đó.

---

## Docs cần biết trước khi code

| File | Đọc khi nào |
|---|---|
| `docs/backend/es-kitchen-api/overview/api-catalog.md` | Trước khi tạo endpoint mới — để không tạo trùng |
| `docs/backend/es-kitchen-api/overview/erd.md` | Trước khi tạo entity / migration |
| `docs/backend/es-kitchen-api/overview/patterns.md` | Khi không chắc NestJS pattern của project |
| `docs/frontend/es-kitchen-web-admin/overview/patterns.md` | Trước khi viết component E03 |
| `docs/frontend/es-kitchen-web-company/overview/patterns.md` | Trước khi viết component E02 |
| `docs/frontend/es-kitchen-web-supplier/overview/patterns.md` | Trước khi viết component E04 |
| `docs/frontend/es-kitchen-web-outsource-web-private/overview/patterns.md` | Trước khi viết component E05 |
| `docs/frontend/es-kitchen-webapp-driver/overview/patterns.md` | Trước khi viết component E06 |
| `docs/mobile/es-kitchen-payment-app/overview/structure.md` | Trước khi code Flutter |
| `.claude/context/technical.md` | Khi cần xác nhận version / known bugs |
| `.claude/context/specification.md` | Khi cần business context, phase-gate G1–G6 |

> **Patterns single source of truth:** web-supplier, outsource-private, driver patterns trỏ về web-admin patterns (cùng stack React 19 / TanStack v5 / RTK v2 / AntD v6) — chỉ note khác biệt domain.

---

## Flow tóm tắt 1 task

```
1. cd PROJECT_ES_KITCHEN  →  claude
2. "Hãy là [Role]. <Task>"
3. AI tóm tắt scope  →  Dev xác nhận
4. AI code  →  Dev review (4 checkbox)
5. "Hãy là QA, verify task"  →  QA Report
6. "Chạy Memory Update Gate"  →  AI cập nhật docs
```

---

## BMAD Pipeline cô đọng

```
SPEC (BA)
  ├─→ DESIGN.md    (Tech Lead Design) ─┐
  ├─→ UI-SPEC.md   (Designer Agent)   ─┼──→ Tasks (Tech Lead Tasks) ──→ PLAN (PM)
  └─→ Test Cases   (QC) song song     ─┘         │                        │
                                                  │                        ├─→ /create-backlog (optional)
                                                  │                        ▼
                                                  │                Contract Lock 🔒
                                                  │                        │
                              ┌───────────────────┴──────────┬─────────────┘
                              ▼                              ▼             ▼
                          Backend                        Frontend        Mobile
                          (Phase 1-2)                    (Phase 3)       (Phase 3)
                                                         ↑ đọc Figma     ↑ đọc Figma
                              │                              │             │
                              └──────────────────────────────┴─────────────┘
                                                            │
                                                            ▼ Mỗi task done
                                                          QA verify (qa-agent)
                                                            │
                                                            ▼
                                                   QC execute TC + bug report
                                                            │
                                                            ▼
                                                      Deploy STG → PROD
```

Chi tiết sơ đồ mermaid đầy đủ → `es-kitchen-docs/docs/index.md` section "Sơ đồ pipeline".

---

## Cheat sheet: 7 prompt thường dùng nhất

```
1. "Hãy là BA, làm SPEC cho feature <X>"
2. "Hãy là Tech Lead Design, làm DESIGN từ SPEC: <path>"           ─┐ song song
   "Hãy là Designer, tạo UI-SPEC.md + Figma từ SPEC: <path>"      ─┤ sau SPEC
   "Hãy là QC, sinh test cases từ SPEC: <path>"                    ─┘
3. "Hãy là Tech Lead Tasks, phân rã tasks cho: <feature folder>"
4. "Hãy là PM, làm PLAN.md cho: <feature folder>"
5. "Hãy là <Backend/Frontend/Mobile> Developer, implement task: <path>"
6. "Hãy là QA, verify task: <path>"
```

Hết. Mỗi prompt tự load đúng agent + docs cần thiết.
