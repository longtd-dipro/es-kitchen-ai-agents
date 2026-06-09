# MANUAL: Setup AI Agents Template cho Dự Án Mới

> Hướng dẫn từng bước cấu hình lại cấu trúc **ESKITCHEN AI Agents** thành template cho dự án bất kỳ.

---

## Tổng quan cấu trúc Template

```
<project-root>/
├── CLAUDE.md                        ← Entry point — always-loaded, trỏ tới POLICIES + AGENTS
├── POLICIES.md                      ← AI behavior policy (nguyên tắc, phân quyền, forbidden actions)
├── AGENTS.md                        ← Project identity (repos, agents, commands, context table)
├── .claude/
│   ├── agents/                      ← Canonical workflow cho từng vai trò (10 agents)
│   ├── commands/                    ← Slash commands (thin entry points)
│   ├── rules/                       ← Coding style, git, security, stack, design tokens
│   ├── context/                     ← Business knowledge + technical spec (viết lại theo dự án)
│   ├── skills/                      ← Reusable skills (BA, QC, NestJS, React, Flutter, Redis...)
│   └── workflows/                   ← Quy trình phức tạp (new-feature, bug-fix, db-connect)
├── <project>-docs/                  ← MkDocs documentation site
│   ├── mkdocs.yml
│   └── docs/
│       ├── index.md
│       └── features/                ← BMAD output (SPEC, DESIGN, tasks, test-cases)
└── <project>-repository/            ← Source code repos (không thuộc template)
```

---

## Phân loại file: Giữ nguyên vs Cần thay đổi

| File / Folder | Hành động | Ghi chú |
|---|---|---|
| `CLAUDE.md` | Sửa nhẹ | Chỉ đổi tên project, đường dẫn POLICIES/AGENTS |
| `POLICIES.md` | Giữ nguyên hoặc sửa nhẹ | Phần lớn generic — chỉ sửa nếu project có policy riêng |
| `AGENTS.md` | **Viết lại hoàn toàn** | Repos, epic codes, stack, agent table — toàn bộ theo project mới |
| `.claude/agents/*.md` | Sửa có chọn lọc | Thay stack-specific: NestJS → Spring, React → Vue, Flutter → React Native... |
| `.claude/commands/` | Giữ nguyên | Slash commands là generic — chỉ thêm nếu cần |
| `.claude/rules/stack-constraints.md` | **Viết lại** | Tech stack của project mới |
| `.claude/rules/design_rule.md` | **Viết lại** | Design tokens, color system, layout rules của project mới |
| `.claude/rules/coding-style.md` | Sửa | Đổi code examples theo stack mới |
| `.claude/rules/security-rules.md` | Sửa nhẹ | Đổi payment gateway, secret management tool |
| `.claude/context/specification.md` | **Viết lại** | Business context, epics, phase-gate của project mới |
| `.claude/context/technical.md` | **Viết lại** | Tech stack, CI/CD, known bugs của project mới |
| `.claude/context/doc-structure.md` | Sửa nhẹ | Đổi tên repo trong ví dụ |
| `.claude/context/backlog-workflow.md` | Sửa nhẹ | Đổi PM tool (Backlog → Jira → Linear...) |
| `.claude/context/business-flows/` | **Viết lại** | Domain knowledge: domains, function list, screen code rule |
| `.claude/skills/` | Giữ nguyên | Skills là generic — chỉ thêm/bỏ skill theo stack |
| `.claude/workflows/` | Sửa nhẹ | Đổi DB connection info, deploy steps |
| `<project>-docs/mkdocs.yml` | Sửa | Đổi `site_name`, nav structure theo project |
| `<project>-docs/docs/index.md` | **Viết lại** | Overview của project mới |

---

## Ma trận Skip theo loại dự án

Đọc cột tương ứng với loại dự án của bạn — ✅ = phải làm, ⏭ = skip, 🔁 = làm sau (incremental).

| Bước | Full-stack<br/>(API+Web+Mobile) | API only<br/>(no FE/Mobile) | Same stack<br/>NestJS+React+Flutter | Early stage<br/>(chưa có requirements) | Small project<br/>(không cần docs) |
|---|:---:|:---:|:---:|:---:|:---:|
| 0 — Clone repos | ✅ | ✅ | ✅ | ✅ | ✅ |
| 1 — Copy template | ✅ | ✅ | ✅ | ✅ | ✅ |
| 2 — CLAUDE + AGENTS | ✅ | ✅ | ✅ | ✅ | ✅ |
| 3.1 Stack Constraints | ✅ | ✅ | ⏭ giữ nguyên | ✅ | ✅ |
| 3.2 Design Tokens | ✅ | ⏭ không có UI | ⏭ giữ nguyên | ⏭ chưa có Figma | ⏭ |
| 3.3 Coding Style | ✅ | ✅ | ⏭ giữ nguyên | ✅ | ✅ |
| 3.4 Security Rules | ✅ | ✅ | ⏭ giữ nguyên | ✅ | ✅ |
| 4.1 specification.md | ✅ | ✅ | ✅ | ✅ | ✅ |
| 4.2 technical.md | ✅ | ✅ | ✅ | ✅ | ✅ |
| 4.3 business-flows/ | ✅ | ✅ | ✅ | 🔁 làm dần theo feature | 🔁 |
| 4.4 doc-structure.md | ✅ | ⏭ đổi tên repo là đủ | ⏭ giữ nguyên | ⏭ | ⏭ |
| 4.5 backlog-workflow.md | ✅ nếu đổi PM tool | ✅ nếu đổi PM tool | ⏭ dùng Backlog | ⏭ | ⏭ |
| 5 — Agents | ✅ | ✅ xoá mobile-agent | ✅ chỉ replace tên | ✅ | ✅ |
| 6 — Skills | ✅ | ✅ xoá flutter-review | ⏭ giữ nguyên | ⏭ | ⏭ |
| 7 — MkDocs | ✅ | ✅ | ✅ | 🔁 setup sau | ⏭ |
| 8 — Memory | ✅ | ✅ | ✅ | ✅ | ✅ |
| 9 — Test | ✅ | ✅ | ✅ | ✅ | ✅ |

### Điều kiện skip chi tiết

| Section | Skip khi | Làm gì thay thế |
|---|---|---|
| **3.2 Design Tokens** | Không có Figma design system, hoặc project thuần backend | Xoá section 1–11, giữ "AI Usage Rules" generic |
| **3.3 Coding Style** | Giữ nguyên stack NestJS + React + Flutter | Chỉ đổi tên project trong file, không đổi code examples |
| **3.4 Security Rules** | Giữ nguyên elepay + AWS Parameter Store | Không cần sửa |
| **4.3 business-flows/domains** | Chưa có tài liệu yêu cầu | Tạo README + screen-code-rule trước, domains thêm dần khi có feature |
| **4.4 doc-structure.md** | Tên repo đủ tương đồng với ESKITCHEN pattern | Chỉ grep-replace tên repo |
| **4.5 backlog-workflow.md** | Vẫn dùng Backlog như ESKITCHEN | Không cần sửa |
| **6 Skills** | Cùng stack NestJS + React + Flutter + PostgreSQL + Redis | Không cần thêm/bỏ skill nào |
| **7 MkDocs** | Project nhỏ, docs viết thẳng vào repo wiki/README | Bỏ qua folder `<project>-docs/` |
| **mobile-agent** | Không có mobile app | Xoá `.claude/agents/mobile-agent.md` |
| **designer-agent** | Không có Figma / designer trong team | Xoá `.claude/agents/designer-agent.md` |

> **Minimum viable setup** (nhanh nhất có thể dùng được): Bước 0 → 1 → 2 → 3.1 → 4.1 → 4.2 → 5 → 9
> Tổng thời gian: **~4–6 giờ**. Các bước còn lại bổ sung dần trong sprint đầu.

---

## Bước 0 — Tạo Folder Gốc và Gắn Source Code Repos

> Đây là bước **làm trước tiên**, trước khi config bất kỳ thứ gì. Claude Code cần `<project>-repository/` chứa source code để `tilth_*` tools có thể đọc và phân tích code.

### 0.1 Tạo cấu trúc thư mục gốc

```bash
mkdir AI_AGENTS_<PROJECT_NAME>
cd AI_AGENTS_<PROJECT_NAME>
mkdir <project-name>-repository
```

> **Dùng Claude:** Bước này làm thủ công trên terminal — Claude chưa có context để hỗ trợ.

### 0.2 Clone từng repo vào trong `<project>-repository/`

```bash
cd <project-name>-repository/

git clone git@github.com:<org>/<api-repo>.git        <api-repo>
git clone git@github.com:<org>/<web-admin-repo>.git  <web-admin-repo>
git clone git@github.com:<org>/<web-company-repo>.git <web-company-repo>
git clone git@github.com:<org>/<mobile-repo>.git     <mobile-repo>

cd ..
```

Kết quả:
```
AI_AGENTS_<PROJECT_NAME>/
└── <project-name>-repository/
    ├── <api-repo>/          ← git clone ✅
    ├── <web-admin-repo>/    ← git clone ✅
    ├── <web-company-repo>/  ← git clone ✅
    └── <mobile-repo>/       ← git clone ✅
```

> **Dùng Claude:** Sau khi clone xong, mở Claude Code từ `AI_AGENTS_<PROJECT_NAME>/` và kiểm tra:
> ```
> Kiểm tra tilth đã nhận diện source code chưa — thử tilth_files tìm file TypeScript
> ```

### 0.3 Mở Claude Code đúng cách

Claude Code **phải được mở từ thư mục gốc** (`AI_AGENTS_<PROJECT_NAME>/`) — không phải từ bên trong repo con. Lý do: `tilth_*` MCP server index toàn bộ source code trong working directory.

```bash
cd AI_AGENTS_<PROJECT_NAME>/
claude   # hoặc mở VS Code / IDE từ đây
```

> **Lưu ý quan trọng:** Tên folder `<project-name>-repository/` phải khớp với đường dẫn trong `AGENTS.md` (bảng Repos, cột "Đường dẫn"). Nếu đặt tên khác thì cập nhật `AGENTS.md` tương ứng.

---

## Bước 1 — Clone Template Config

```bash
# Copy toàn bộ .claude/, CLAUDE.md, POLICIES.md, AGENTS.md, docs/ vào project root
cp -r AI_AGENTS_ES_KITCHEN/.claude         AI_AGENTS_<PROJECT_NAME>/
cp    AI_AGENTS_ES_KITCHEN/CLAUDE.md       AI_AGENTS_<PROJECT_NAME>/
cp    AI_AGENTS_ES_KITCHEN/POLICIES.md     AI_AGENTS_<PROJECT_NAME>/
cp    AI_AGENTS_ES_KITCHEN/AGENTS.md       AI_AGENTS_<PROJECT_NAME>/
cp -r AI_AGENTS_ES_KITCHEN/es-kitchen-docs AI_AGENTS_<PROJECT_NAME>/<project-name>-docs

cd AI_AGENTS_<PROJECT_NAME>/
```

> **Dùng Claude:** Sau khi copy xong, nhờ Claude dọn sạch context cũ của ESKITCHEN:
> ```
> Xoá toàn bộ nội dung ESKITCHEN-specific trong project này:
> - .claude/context/business-flows/domains/ (xoá hết file trong folder)
> - .claude/context/business-flows/function-list.md
> - <project-name>-docs/docs/features/ (xoá hết)
> - <project-name>-docs/docs/backend/, frontend/, mobile/
> Giữ lại cấu trúc folder, chỉ xoá nội dung file cũ.
> ```

---

## Bước 2 — Cấu hình Project Identity

### 2.1 Sửa `CLAUDE.md`

Chỉ cần đổi 2 dòng `@` trỏ tới POLICIES và AGENTS:

```markdown
@./POLICIES.md
@./AGENTS.md
```

> **Dùng Claude:**
> ```
> Cập nhật CLAUDE.md: đổi tên project từ "ESKITCHEN" sang "<PROJECT_NAME>"
> trong phần description (nếu có). Giữ nguyên 2 dòng @./POLICIES.md và @./AGENTS.md.
> ```

### 2.2 Viết lại `AGENTS.md`

Đây là file **quan trọng nhất** cần cập nhật. Thay toàn bộ section `<ecosystem>`.

**Checklist AGENTS.md:**
- [ ] Bảng **Repos** — liệt kê đúng tên repo, epic code (E01, E02...), vai trò, stack
- [ ] Section **`<core_rules>`** — đổi rule "Không nhầm E02 ↔ E03" thành quy tắc đặc thù project mới
- [ ] Bảng **Sub-agents** — giữ nguyên cấu trúc, chỉ ghi chú nếu bỏ agent nào
- [ ] Bảng **Context** — cột "Ai đọc" phải khớp với file context mới
- [ ] Section **`<red_line_rules>`** — cập nhật cross-repo features thực tế của project

> **Dùng Claude:**
> ```
> Viết lại AGENTS.md cho project <PROJECT_NAME>. Thông tin repos:
> - <api-repo>: NestJS API, vai trò backend/business logic
> - <web-admin-repo>: React admin web (E01), 160 functions
> - <web-company-repo>: React company web (E02), 58 functions
> - <mobile-repo>: Flutter mobile app (E03)
>
> Actors: [liệt kê actors thực tế]
> Cross-repo features: [payment, push notification, auth...]
>
> Giữ nguyên toàn bộ phần agents, commands, skills, workflows — chỉ đổi
> phần ecosystem (repos, epic codes) và core_rules theo project mới.
> ```

---

## Bước 3 — Cấu hình Rules

### 3.1 Stack Constraints (`.claude/rules/stack-constraints.md`)

Viết lại bảng **Tech Stack Cố định** theo project:

```markdown
| Layer       | Bắt buộc dùng           | Tuyệt đối không dùng    |
|-------------|--------------------------|--------------------------|
| Database    | PostgreSQL + TypeORM     | MySQL, MongoDB, Prisma   |
| API Style   | REST                     | GraphQL, gRPC            |
| ...         | ...                      | ...                      |
```

Và bảng **Version Cố định** — liệt kê đúng version đang dùng.

> **Dùng Claude:**
> ```
> Viết lại .claude/rules/stack-constraints.md cho project <PROJECT_NAME>.
> Tech stack thực tế:
> - Backend: <framework> + <ORM> + <DB>
> - Frontend: <framework> + <state management> + <UI library>
> - Mobile: <platform> + <state management>
> - Payment: <gateway>
> - Secrets: <tool>
>
> Versions đang dùng: [list package@version]
> Giữ nguyên cấu trúc bảng, chỉ đổi nội dung.
> ```

### 3.2 Design Tokens (`.claude/rules/design_rule.md`)

> ⏭ **Skip nếu:** project thuần backend (không có FE/Mobile), hoặc chưa có Figma design system. Xem điều kiện chi tiết ở bảng Ma trận Skip.

Nếu project có Figma design system:
1. Export variables từ Figma (colors, typography, spacing, border-radius, effects)
2. Convert sang bảng token như format hiện tại
3. Điền section **Per-Site Layout Rules** theo từng app thực tế

Nếu chưa có design system → xoá hết section 1–11, chỉ giữ lại section **AI Usage Rules** với rules generic.

> **Dùng Claude** (nếu có Figma):
> ```
> /read-figma <figma-file-url> DesignSystem <project-name>
> ```
> Sau khi đọc xong Figma, Claude sẽ sinh figma context. Tiếp theo:
> ```
> Dựa trên figma context vừa đọc, viết lại .claude/rules/design_rule.md
> theo đúng format của file hiện tại (bảng token, per-site layout rules).
> Project có các apps: [list apps + viewport]
> ```

> **Dùng Claude** (nếu chưa có Figma):
> ```
> Cập nhật .claude/rules/design_rule.md: xoá section 1–11 (color primitives,
> semantics, typography, spacing...). Giữ lại phần "AI Usage Rules" cuối file
> nhưng đổi thành rules generic không phụ thuộc token cụ thể.
> ```

### 3.3 Coding Style (`.claude/rules/coding-style.md`)

> ⏭ **Skip nếu:** giữ nguyên stack NestJS + React + Flutter — file đã đúng, không cần đổi.

Đổi code examples sang ngôn ngữ/framework của project:
- NestJS → Spring Boot / FastAPI / Laravel...
- React → Vue / Angular / Svelte...
- Flutter → React Native / SwiftUI / Kotlin...

> **Dùng Claude:**
> ```
> Cập nhật .claude/rules/coding-style.md: đổi tất cả code examples từ
> NestJS/TypeScript → <backend-framework>, React → <frontend-framework>,
> Flutter → <mobile-framework>.
> Giữ nguyên các nguyên tắc chung (tối giản, nhất quán, đặt tên rõ nghĩa...).
> Chỉ thay code snippet minh hoạ.
> ```

### 3.4 Security Rules (`.claude/rules/security-rules.md`)

> ⏭ **Skip nếu:** vẫn dùng elepay + AWS Parameter Store — giữ nguyên file.

Đổi:
- Payment gateway section nếu không dùng elepay
- Secret management tool nếu không dùng AWS Parameter Store

> **Dùng Claude:**
> ```
> Cập nhật .claude/rules/security-rules.md:
> - Đổi payment gateway: elepay → <gateway-name>
> - Đổi secret management: AWS Parameter Store → <tool>
> - Đổi mobile secure storage nếu không dùng Flutter
> Giữ nguyên các quy tắc JWT, input validation, XSS, CORS.
> ```

---

## Bước 4 — Cấu hình Context (Business Knowledge)

Đây là phần **tốn thời gian nhất** — cần kiến thức domain của project mới.

### 4.1 `specification.md`

Viết business context:
```markdown
# Project Name — Business Specification

## Tổng quan dự án
[Mô tả: client là ai, domain là gì, mục tiêu phase hiện tại]

## Actors
| Actor | App | Vai trò |
|-------|-----|---------|
| ...   | ... | ...     |

## Phase-gate G1–G6
[Hoặc milestone tương ứng của project]

## Epics
[Liệt kê epic codes + tên + scope]
```

> **Dùng Claude:**
> ```
> Viết .claude/context/specification.md cho project <PROJECT_NAME>.
>
> Thông tin:
> - Client: <tên client, quốc gia>
> - Domain: <lĩnh vực>
> - Mục tiêu phase hiện tại: <mô tả>
> - Actors: <list actor + app + vai trò>
> - Epics: <list epic + scope>
> - Phase-gate hoặc milestone: <list>
>
> Giữ nguyên cấu trúc headings của file gốc, chỉ thay nội dung.
> ```

### 4.2 `technical.md`

Viết tech stack thực tế:
```markdown
# Technical Context

## Stack
[Per-repo: framework, DB, cache, message queue, CI/CD...]

## Known Bugs / Constraints
[Những quirks quan trọng dev cần biết]

## Infrastructure
[AWS/GCP/Azure, environments: DEV/STG/PROD]
```

> **Dùng Claude:**
> ```
> Viết .claude/context/technical.md cho project <PROJECT_NAME>.
>
> Stack per repo:
> - <api-repo>: <framework>, <DB>, <cache>, <queue>
> - <web-repo>: <framework>, <state mgmt>, <UI lib>
> - <mobile-repo>: <platform>, <packages>
>
> Infrastructure: <cloud provider>, environments: DEV/STG/PROD
> CI/CD: <tool>
> Known bugs hoặc constraints: <nếu có>
>
> Giữ nguyên cấu trúc headings của file gốc.
> ```

### 4.3 `business-flows/`

> 🔁 **Làm dần nếu:** chưa có tài liệu yêu cầu — tạo `README.md` + `screen-code-rule.md` trước, thêm từng `domains/<name>.md` khi feature được assign trong sprint.

Cấu trúc cần tạo:
```
business-flows/
├── README.md                    ← Index domains + repo→domain map
├── business-flow-index.md       ← Danh sách nghiệp vụ + Backlog ID + link
├── screen-code-rule.md          ← Quy tắc đặt tên screen (<Module>_<Feature>_<Seq>)
├── function-list.md             ← Master function list (load khi cần)
└── domains/
    ├── <domain-1>.md            ← User stories per domain
    ├── <domain-2>.md
    └── ...
```

> **Dùng Claude** — tạo file index và rule trước:
> ```
> Tạo .claude/context/business-flows/README.md cho project <PROJECT_NAME>.
> Domains của project: [list domain names]
> Mỗi domain map sang repo: [domain → repo]
> Giữ format như file gốc của ESKITCHEN.
> ```
>
> ```
> Tạo .claude/context/business-flows/screen-code-rule.md.
> Convention đặt tên screen: <PREFIX>_<MODULE>_<SEQ>_<Tên>
> Prefixes: [list prefix per app — ví dụ AW=Admin Web, CW=Company Web...]
> ```
>
> **Dùng Claude** — tạo từng domain file từ tài liệu yêu cầu:
> ```
> Hãy là BA. Đọc tài liệu yêu cầu dưới đây và tạo file
> .claude/context/business-flows/domains/<domain-name>.md
> theo đúng format của ESKITCHEN (user stories, actors, flows).
>
> [Paste nội dung tài liệu yêu cầu]
> ```

### 4.4 `doc-structure.md`

> ⏭ **Skip nếu:** tên repo mới có cấu trúc tương tự ESKITCHEN — chỉ cần grep-replace tên repo ở Bước 5 là đủ.

Đổi tên repo trong ví dụ path.

> **Dùng Claude:**
> ```
> Cập nhật .claude/context/doc-structure.md: thay tất cả tên repo
> es-kitchen-api → <api-repo>
> es-kitchen-web-admin → <web-admin-repo>
> es-kitchen-web-company → <web-company-repo>
> es-kitchen-payment-app → <mobile-repo>
> ```

### 4.5 `backlog-workflow.md`

> ⏭ **Skip nếu:** vẫn dùng Backlog như ESKITCHEN — không cần sửa gì.

Nếu đổi PM tool (Backlog → Jira/Linear/Notion):
- Đổi tên tool trong mô tả
- Cập nhật MCP server name trong agents (`mcp__backlog__*` → `mcp__jira__*`...)
- Đổi issue ID format

> **Dùng Claude:**
> ```
> Cập nhật .claude/context/backlog-workflow.md: project này dùng <PM_TOOL>
> thay vì Backlog. Đổi tên tool, MCP server prefix (mcp__backlog__ → mcp__<tool>__),
> và issue ID format (ESKITCHEN-XXX → <PROJECT>-XXX).
> ```

---

## Bước 5 — Cấu hình Agents

Mỗi agent trong `.claude/agents/` có phần **stack-specific** cần sửa.

### Checklist per agent

| Agent | Cần sửa |
|---|---|
| `ba-agent.md` | Tên project, actors, phase-gate format |
| `techlead-design-agent.md` | Tên repos trong DB schema / API section |
| `techlead-tasks-agent.md` | Tên repos trong task template |
| `pm-agent.md` | PM tool (Backlog → Jira...), MCP tool names |
| `backend-agent.md` | Framework (NestJS → ...), DB ORM, package names |
| `frontend-agent.md` | Framework (React → ...), state management, UI library |
| `mobile-agent.md` | Platform (Flutter → React Native...), packages |
| `qc-agent.md` | Ít cần sửa — phần lớn generic |
| `designer-agent.md` | Design system tokens, app list, screen naming |
| `qa-agent.md` | Ít cần sửa — phần lớn generic |

> **Dùng Claude** — batch replace toàn bộ một lần:
> ```
> Cập nhật tất cả files trong .claude/agents/ cho project <PROJECT_NAME>.
> Thay thế:
> - "ESKITCHEN" → "<PROJECT_NAME>"
> - "es-kitchen-api" → "<api-repo>"
> - "es-kitchen-web-admin" → "<web-admin-repo>"
> - "es-kitchen-web-company" → "<web-company-repo>"
> - "es-kitchen-payment-app" → "<mobile-repo>"
> - "NestJS" → "<backend-framework>" (chỉ trong backend-agent.md)
> - "Flutter" → "<mobile-platform>" (chỉ trong mobile-agent.md)
> - "Backlog" → "<PM_TOOL>" (trong pm-agent.md)
>
> Giữ nguyên toàn bộ workflow logic, chỉ đổi tên project/repo/tool.
> ```
>
> Sau khi Claude sửa, verify bằng:
> ```
> grep -rn "es-kitchen\|ESKITCHEN" .claude/agents/
> ```

---

## Bước 6 — Cấu hình Skills

> ⏭ **Skip nếu:** giữ nguyên stack NestJS + React + Flutter + PostgreSQL + Redis — tất cả skills đã phù hợp, không cần thêm/bỏ.

Skills phần lớn là **generic** — giữ nguyên nếu vẫn dùng cùng stack.

### Skills cần đánh giá

| Skill | Giữ nếu | Bỏ / Thay nếu |
|---|---|---|
| `nestjs-best-practices/` | Dùng NestJS | Dùng framework khác → tạo skill mới |
| `postgresql/` | Dùng PostgreSQL | Dùng DB khác |
| `redis-development/` | Dùng Redis | Không dùng Redis |
| `react-expert/` | Dùng React | Dùng Vue/Angular → tạo skill mới |
| `frontend-review/` | Dùng React | Đổi stack review nếu khác |
| `flutter-review/` | Dùng Flutter | Dùng React Native → tạo skill mới |
| `rbt_manual_testing/` | Giữ nguyên | Generic — không cần đổi |
| `business-analyst/` | Giữ nguyên | Generic — chỉ đổi project name |
| `solution-architect/` | Giữ nguyên | Generic |

> **Dùng Claude** — xoá skill không dùng:
> ```
> Project này không dùng NestJS và Flutter.
> Xoá .claude/skills/nestjs-best-practices/ và .claude/skills/flutter-review/.
> Giữ nguyên tất cả skills khác.
> ```

> **Dùng Claude** — tạo skill mới cho stack thay thế:
> ```
> Tạo .claude/skills/<framework>-best-practices/SKILL.md
> cho framework <framework-name>.
> Bao gồm: architecture patterns, coding conventions, common pitfalls,
> security best practices, testing patterns.
> Tham khảo format của .claude/skills/react-expert/SKILL.md.
> ```

---

## Bước 7 — Setup MkDocs

> ⏭ **Skip nếu:** project nhỏ, docs viết thẳng vào repo wiki hoặc README. Bỏ qua toàn bộ folder `<project>-docs/`.

### 7.1 Đổi tên folder docs

```bash
mv es-kitchen-docs/ <project-name>-docs/
```

> **Dùng Claude:**
> ```
> Cập nhật tất cả references đến "es-kitchen-docs" trong AGENTS.md và các
> file .claude/ sang "<project-name>-docs".
> ```

### 7.2 Cập nhật `mkdocs.yml`

```yaml
site_name: <Project Name> Documentation
theme:
  name: material
  palette:
    primary: <color>  # đổi màu theme theo brand
    accent: <color>
```

> **Dùng Claude:**
> ```
> Cập nhật <project-name>-docs/mkdocs.yml:
> - site_name: "<Project Name> Documentation"
> - primary color: <màu brand> (ví dụ: blue, deep-orange, teal...)
> - nav: đổi tên các repo trong navigation sang đúng tên repo mới
> ```

### 7.3 Cài dependencies

```bash
/opt/homebrew/Cellar/mkdocs/*/libexec/bin/python -m pip install \
  pymdown-extensions \
  mkdocs-material
```

> **Dùng Claude** (nếu gặp lỗi khi chạy mkdocs):
> ```
> mkdocs serve bị lỗi: [paste lỗi]. Hãy giúp tôi fix.
> ```

### 7.4 Viết lại `docs/index.md`

- Đổi tên project, mô tả
- Cập nhật bảng repos
- Giữ nguyên phần BMAD Workflow table + mermaid diagram (generic)

> **Dùng Claude:**
> ```
> Viết lại <project-name>-docs/docs/index.md cho project <PROJECT_NAME>.
> Repos: [list repos + epic + role + stack]
> Giữ nguyên phần BMAD Workflow table, mermaid diagram, và cấu trúc tài liệu.
> Chỉ đổi phần "Hệ sinh thái" và mô tả đầu trang.
> ```

### 7.5 Chạy thử

```bash
cd <project-name>-docs/
mkdocs serve
# → http://127.0.0.1:8000/
```

---

## Bước 8 — Setup Memory System

Memory system nằm ở `~/.claude/projects/<project-path>/memory/`.

> **Dùng Claude** — khởi tạo memory ngay trong session đầu tiên:
> ```
> Hãy nhớ các thông tin sau cho project này:
> - Tôi là [role] tại [công ty]
> - Project <PROJECT_NAME>: [mô tả ngắn về domain, client, giai đoạn hiện tại]
> - Tech stack chính: [list]
> - PM tool: [Jira/Backlog/Linear]
> ```
>
> Claude sẽ tự tạo các file memory trong thư mục memory/ của project.

---

## Bước 9 — Test Chạy Thử

Sau khi config xong, kiểm tra từng agent bằng cách trigger trong Claude Code:

```
# Test 1: BA Agent — hỏi đúng 10 câu discovery, đọc đúng context files
"Hãy là BA, làm SPEC cho feature login"

# Test 2: Tech Lead Design — DESIGN.md đúng format, đúng tên repo
"/create-design <path/to/SPEC.md>"

# Test 3: QC Agent — test cases có đủ precondition, steps, expected
"/test/generate_manual_testcases_rbt"

# Test 4: PM Agent — PLAN.md có đúng repo names, estimate hợp lý
"/create-plan <feature-folder>"

# Test 5: Backend Agent — agent đọc đúng stack, dùng đúng framework
"Hãy là Backend Developer, implement task: <task-file>"
```

> **Dấu hiệu config đúng:**
> - Agent tự gọi đúng tên repo (không còn "es-kitchen-...")
> - BA hỏi đúng actors của project mới
> - Tech Lead Design tạo DESIGN.md với đúng tên repo trong path
> - Backend Agent recommend đúng framework/package của project

> **Dấu hiệu cần fix:**
> - Agent vẫn nhắc "ESKITCHEN" hoặc "es-kitchen" → chạy lại Bước 5
> - Agent hỏi về NestJS khi project dùng framework khác → kiểm tra lại `backend-agent.md` và `stack-constraints.md`
> - tilth không tìm thấy source code → kiểm tra tên folder repository khớp với AGENTS.md

---

## Checklist Tổng — Trước Khi Bàn Giao Cho Team

- [ ] `CLAUDE.md` trỏ đúng POLICIES + AGENTS
- [ ] `AGENTS.md` có đúng tên repo, epic codes, stack
- [ ] `stack-constraints.md` khớp với tech stack thực tế
- [ ] `design_rule.md` có design tokens từ Figma của project (hoặc đã dọn về generic)
- [ ] `specification.md` mô tả đúng business context, actors, phases
- [ ] `technical.md` mô tả đúng infrastructure, known bugs
- [ ] `business-flows/` có ít nhất README + screen-code-rule
- [ ] Tất cả agents: `grep "es-kitchen" .claude/agents/` → 0 kết quả
- [ ] MkDocs chạy được: `mkdocs serve` không lỗi
- [ ] Test thử BA agent với 1 feature dummy → pass
- [ ] Memory system khởi tạo

---

## Thời gian ước tính

| Công việc | Người thực hiện | Thời gian |
|---|---|---|
| Tạo folder, clone repos | Dev | 30–60 phút |
| Clone template config + dọn context cũ | Dev + Claude | 30 phút |
| Viết AGENTS.md + rules | Tech Lead + Claude | 1–2 giờ |
| Viết specification.md + technical.md | BA + Claude | 2–4 giờ |
| Viết business-flows/ domains | BA + Claude | 4–8 giờ |
| Cấu hình agents (batch replace qua Claude) | Tech Lead + Claude | 30 phút |
| Đánh giá skills, thêm/bỏ | Tech Lead + Claude | 30 phút |
| Setup MkDocs + index.md | Dev + Claude | 30 phút |
| Test end-to-end | Tech Lead + BA | 1–2 giờ |
| **Tổng** | | **~2–3 ngày** |
