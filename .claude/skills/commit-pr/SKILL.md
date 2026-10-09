---
name: commit-pr
description: Sinh mô tả commit message hoặc PR description cho dự án recruitment dựa trên diff thật của git. Dùng khi người dùng nói "viết commit message", "gen mô tả commit", "viết mô tả PR", "tóm tắt thay đổi", "commit này viết sao", hoặc sau khi làm xong một thay đổi cần mô tả. Chọn ngôn ngữ bằng tham số vi/en, chọn loại bằng commit/pr. Chỉ sinh chữ — không stage, không commit, không tạo PR.
---

# Commit / PR description

Skill này **chỉ sinh chữ để người dùng tự copy**.

Chỉ được chạy lệnh git **read-only**: `git diff`, `git status`, `git log`, `git branch`.
**Cấm** `git add`, `git commit`, `git push`, `gh pr create` — kể cả khi người dùng có vẻ muốn.
Muốn commit là một yêu cầu riêng, phải hỏi lại.

## 0. Tham số

`/commit-pr [mode] [lang]` — thứ tự tự do, thiếu thì lấy mặc định.

| Tham số | Giá trị | Mặc định | Ghi chú |
|---|---|---|---|
| `mode` | `commit` \| `pr` | `commit` | `pr` khi người dùng nói "PR", "pull request", "merge request" |
| `lang` | `en` \| `vi` | `vi` | Chỉ áp cho **body mô tả PR**. Commit message luôn tiếng Anh |

**Commit message (subject + body + footer) và tiêu đề PR luôn viết bằng tiếng Anh** — bắt buộc theo
[rule 06 §1.1](../../rules/06-git-ci-workflow.md), `lang=vi` **không** đổi được điều này.
`lang` chỉ chọn ngôn ngữ cho phần mô tả PR ở mode `pr`. Không trộn hai ngôn ngữ trong một output.

## 1. Thu thập diff

```bash
git branch --show-current
git status --short
```

Chọn nguồn diff theo `mode`:

```bash
# mode=commit — ưu tiên staged
git diff --cached --stat && git diff --cached
# nếu không có staged, dùng working tree và BÁO RÕ "đang mô tả thay đổi chưa stage"
git diff --stat && git diff

# mode=pr — so với nhánh nền
git diff master...HEAD --stat && git diff master...HEAD
```

**Diff lớn (>20 file hoặc >800 dòng):** đọc `--stat` trước, rồi đọc diff theo từng nhóm tầng kiến trúc,
không đọc một lần cả cây:

```bash
git diff --cached -- prisma/
git diff --cached -- src/repository/
git diff --cached -- src/pages/api/
git diff --cached -- src/libs/
git diff --cached -- src/app/ src/components/
```

**Không được** suy mô tả từ danh sách tên file. Phải đọc nội dung diff.

## 2. Suy ra `type` và `scope`

`scope` luôn là `RECRUITMENT` (toàn repo đang dùng scope này).

| Diff chứa | `type` |
|---|---|
| Chỉ file `*.test.ts(x)` | `test` |
| Chỉ `.scss` / `.css` / class Tailwind | `style` |
| Chỉ `package.json` / lockfile / `Dockerfile` / `next.config.js` | `build` |
| Chỉ `.github/workflows/` | `ci` |
| Chỉ `*.md` / JSDoc `@swagger` | `docs` |
| File **mới** trong `src/app/`, `src/pages/api/`, `prisma/migrations/` | `feat` |
| Sửa logic file có sẵn, hành vi cũ sai → đúng | `fix` |
| Đổi cấu trúc, hành vi không đổi | `refactor` |
| Thêm index, bỏ N+1, thêm `select` | `perf` |

Nhiều loại lẫn nhau → lấy loại của **thay đổi chính**, và ghi phần còn lại vào body.

## 3. Viết commit message

### Khung

```
<type>(RECRUITMENT): <subject>

<lead — 1-2 câu: bối cảnh / lý do thay đổi. BẮT BUỘC, kể cả commit nhỏ>

- <tag>: <nội dung>
- <tag>: <nội dung>

<footer — chỉ khi có>
```

### Ràng buộc cứng (commitlint `config-conventional`, `header-max-length: 150`)

- **Tiếng Anh**, subject chữ thường, **không** dấu chấm cuối, nhắm ≤ 72 ký tự (trần cứng 150).
- Mỗi phần cách nhau **đúng một dòng trống**.
- Mọi dòng trong body **≤ 100 ký tự** (`body-max-line-length`). Dài hơn thì tách ý, không xuống dòng giữa câu.
- **Mọi commit đều phải có body** — không có commit chỉ một dòng subject. Xem quy tắc commit nhỏ bên dưới.

### Body — gạch đầu dòng có tag, căn thẳng cột

Tag lấy từ whitelist, viết thường, **căn lề bằng khoảng trắng cho thẳng cột dấu `:`**:

| Tag | Ứng với |
|---|---|
| `db` | `prisma/schema.prisma`, `prisma/migrations/` |
| `repo` | `src/repository/` |
| `api` | `src/pages/api/` |
| `auth` | `src/libs/middleware/`, `src/middleware.ts`, NextAuth |
| `ui` | `src/app/`, `src/components/` |
| `deps` | `package.json`, lockfile |
| `test` | `*.test.ts(x)` |
| `config` | `next.config.js`, `tsconfig.json`, `.eslintrc`, `.stylelintrc` |

- **Tối đa 6 gạch đầu dòng.** Nhiều hơn thì gộp theo tag, không liệt kê từng file.
- Mỗi dòng nói **cái gì đổi**, không kể thao tác ("đã sửa", "cập nhật lại file X"). Viết tiếng Anh.
- Không lặp lại nội dung subject xuống body.
- **Commit nhỏ (một tầng, một file) vẫn phải có mô tả ngắn** — tối thiểu **một** trong hai:
  một câu lead nói *vì sao* đổi, **hoặc** đúng một gạch đầu dòng có tag nói *cái gì* đổi.
  Không bao giờ để trống body.
- Mô tả ngắn phải thêm thông tin subject chưa nói — nguyên nhân, phạm vi ảnh hưởng, hoặc
  hành vi cũ → mới. Cấm diễn đạt lại subject bằng từ khác cho đủ dòng.

### Footer — chỉ in khi thật sự có

```
BREAKING CHANGE: <mô tả cái gì vỡ và người dùng phải làm gì>
Refs: #<số issue>
```

### Ví dụ đạt chuẩn

```text
feat(RECRUITMENT): add policy management with consent tracking

Candidates must accept the privacy policy before applying, so each consent is stored
against the policy version that was shown.

- db  : add PolicyVersion, ConsentRecord, ConsentSource models with migration
- repo: add policyVersion, consentRecord, consentSource repos with explicit select
- api : CRUD /api/admin/policy plus submit and publish endpoints
- auth: attach roleAuth to every /api/admin route, add role field to JWT callback
- ui  : admin page /admin/policy and public page /policy/[version]
- test: cover checkAuth, roleAuth, routeGuard and policySchemas
```

Commit nhỏ thì gọn lại, nhưng **vẫn có mô tả ngắn** — một câu lead:

```text
fix(RECRUITMENT): reset page to 1 when location filter changes

Filtering while on page 3 kept the old offset and showed an empty result list.
```

Hoặc một gạch đầu dòng có tag, khi thay đổi thuần kỹ thuật:

```text
perf(RECRUITMENT): add composite index on job listing query

- db: index (status, publishedAt) to drop the sequential scan on /jobs
```

### Blacklist — commit có thật trong repo, không được lặp lại kiểu này

```
fix: remove console
fix(RECRUITMENT): fix func search
fix(RECRUITMENT): fix eslint error
feat(RECRUITMENT): update template mail
feat(RECRUITMENT): quản lý phiên bản chính sách bảo mật
```

Dòng cuối vi phạm thêm một lỗi nữa: **commit message viết tiếng Việt**. Luôn dịch sang tiếng Anh.

Subject phải trả lời "cái gì thay đổi và thành ra sao", không phải "tôi đã làm hành động gì".
Cấm mở đầu rỗng nghĩa: `update code`, `fix bug`, `improve`, `refactor code`, `some changes`.

| Xấu | Tốt |
|---|---|
| `fix(RECRUITMENT): fix func search` | `fix(RECRUITMENT): reset page to 1 when location filter changes` |
| `fix: remove console` | `fix(RECRUITMENT): replace console.log with logger in job apply handler` |
| `feat(RECRUITMENT): update model jobs` | `feat(RECRUITMENT): add level and employee type to job model` |
| `feat(RECRUITMENT): quản lý phiên bản chính sách` | `feat(RECRUITMENT): add privacy policy version management` |

## 4. Validate trước khi in ra — bắt buộc

```bash
printf '%s' "$MESSAGE" | pnpm exec commitlint
```

Dùng `pnpm exec`, **không** dùng `yarn` (hook `.husky/commit-msg` đang gọi `yarn` — đó là lỗi đã biết
của repo, xem rule 06 §4). Fail thì sửa message rồi chạy lại. **Không in ra message chưa pass.**

## 5. Mode `pr` — khung mô tả

Tiêu đề PR = một dòng Conventional Commits **bằng tiếng Anh**, cũng phải qua bước 4
(CI kiểm bằng `action-semantic-pull-request`).

Body bám 4 mục bắt buộc của [rule 06 §2](../../rules/06-git-ci-workflow.md), thêm phần tóm tắt ở đầu:

````markdown
## Tóm tắt

<2-3 câu: PR này làm gì, cho ai, chạm vào đâu>

## Thay đổi

| Tầng | Nội dung |
|---|---|
| DB | <migration, model mới/đổi — bỏ dòng nếu không chạm> |
| API | <endpoint thêm/sửa> |
| UI | <trang, component> |
| Khác | <middleware, config, dependency> |

## Vì sao

- <vấn đề đang gặp hoặc yêu cầu nghiệp vụ, không mô tả lại code>

## Cách kiểm thử

```bash
pnpm test -- <đường dẫn>
```

1. <bước bấm tay 1>
2. <bước bấm tay 2>

## Ảnh hưởng DB / env

- Migration `<tên>` — chạy `pnpm migrate:deploy` **trước** khi deploy app
- Biến mới `<TÊN_BIẾN>` — đã bổ sung `.env.example`
````

Quy tắc trình bày:

- Bảng **Thay đổi**: bỏ hẳn dòng của tầng không chạm tới. Không để ô trống hay dấu `-`.
- Mục **Ảnh hưởng DB / env**: không có gì thì **xoá cả tiêu đề**, đừng ghi "Không có".
- Mỗi gạch đầu dòng một ý, không quá 2 dòng màn hình.
- Không emoji, không ảnh, không câu dẫn kiểu "PR này nhằm mục đích...".

## 6. Quét bắt buộc để điền mục "Ảnh hưởng"

```bash
# migration mới → phải ghi thứ tự deploy trong PR
git diff --cached --name-only | grep "^prisma/migrations/"

# biến môi trường mới mà .env.example không đổi → CẢNH BÁO trong output
git diff --cached -U0 | grep -oE "(process\.env\.[A-Z_]+|serverConfig\.[a-zA-Z.]+)" | sort -u
git diff --cached --name-only | grep "^\.env\.example$"

# dependency đổi → ghi lý do (CVE / bug / tính năng)
git diff --cached -- package.json | grep -E "^[+-]\s+\""

# breaking change → thêm footer BREAKING CHANGE:
git diff --cached -U0 | grep -E "^-.*export (default |const |function |class )"
```

## 7. Gợi ý tách commit

Diff chạm **≥ 3 tầng** trong `prisma/` · `src/repository/` · `src/pages/api/` · `src/libs/` ·
`src/app/` → viết thêm mục *"Gợi ý tách commit"* với danh sách commit đề xuất kèm file tương ứng.

Chỉ **gợi ý**. Không tự chạy `git add` để tách.

## 8. Định dạng output — bám đúng thứ tự này

**Phần 1 — khối copy.** Luôn là thứ đầu tiên, không có câu dẫn phía trên.
Dùng fence ` ```text ` (không phải ```bash / ```md) để GitHub và terminal không tô màu sai.
Chỉ **một** khối duy nhất, bên trong **chỉ có** message hoặc mô tả — không chú thích, không `<...>`.

**Phần 2 — bảng "Đã quét".** Chỉ in khi §6 phát hiện được thứ gì:

| Hạng mục | Phát hiện |
|---|---|
| Migration | `20260907083738_add_consent_records...` |
| Biến môi trường | không có biến mới |
| Dependency | `next 15.1.2 → 15.1.9` |

**Phần 3 — Cảnh báo.** Chỉ in khi có vấn đề thật. Mỗi cảnh báo một dòng, mở đầu bằng
**Cảnh báo:** rồi tới việc cần làm.

```
**Cảnh báo:** thêm `process.env.POLICY_TTL` nhưng `.env.example` không đổi — cần bổ sung.
```

**Phần 4 — Gợi ý tách commit.** Chỉ khi §7 kích hoạt.

Nguyên tắc chung: **phần nào không có nội dung thì bỏ cả tiêu đề.** Không in bảng rỗng,
không viết "Không có cảnh báo", không emoji, không tổng kết lại những gì vừa in.
