# How To Run — ESKITCHEN Docs (MkDocs)

Hướng dẫn build và chạy bộ tài liệu `es-kitchen-docs` (MkDocs + Material theme).

---

## 1. Yêu cầu môi trường

| Thành phần | Version | Ghi chú |
|---|---|---|
| Python | 3.10+ | Đã test với 3.14 |
| pip | latest | `python3 -m pip install --upgrade pip` |
| (Tùy chọn) PM2 | latest | Chạy daemon ở production |

Kiểm tra:

```bash
python3 --version
pip --version
```

---

## 2. Setup môi trường (lần đầu)

```bash
cd es-kitchen-docs

# Tạo virtualenv
python3 -m venv venv

# Kích hoạt venv
source venv/bin/activate          # macOS / Linux
# venv\Scripts\activate           # Windows PowerShell

# Cài dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Verify
mkdocs --version
```

> **Lưu ý:** Nếu copy folder `venv/` từ máy khác sang, shebang sẽ trỏ sai path → `mkdocs` chạy lỗi `bad interpreter`. Cách fix: xóa và tạo lại venv:
> ```bash
> rm -rf venv && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt
> ```

---

## 3. Chạy dev server (live-reload)

```bash
cd es-kitchen-docs
source venv/bin/activate
mkdocs serve --dev-addr=0.0.0.0:8001
```

- Mở browser: **http://localhost:8001/**
- Tự động reload khi sửa file trong `docs/` hoặc `mkdocs.yml`
- Dừng server: `Ctrl + C`

**Chạy ở port khác (nếu 8001 bị chiếm):**

```bash
mkdocs serve --dev-addr=127.0.0.1:8765
```

---

## 4. Build static site (production)

```bash
cd es-kitchen-docs
source venv/bin/activate
mkdocs build
```

- Output: thư mục `site/`
- Deploy: copy `site/` lên S3, Nginx, GitHub Pages, hoặc bất kỳ static host nào

**Build sạch (xóa output cũ trước):**

```bash
mkdocs build --clean
```

**Build strict (fail khi có warning, nên dùng trong CI):**

```bash
mkdocs build --strict
```

---

## 5. Chạy daemon qua PM2 (production)

Project đã có sẵn `ecosystem.config.js`:

```bash
cd es-kitchen-docs

# Start
pm2 start ecosystem.config.js

# Xem log realtime
pm2 logs eskitchen-docs

# Status
pm2 status

# Restart sau khi đổi mkdocs.yml
pm2 restart eskitchen-docs

# Stop
pm2 stop eskitchen-docs

# Xóa khỏi PM2 (nếu muốn không quản lý nữa)
pm2 delete eskitchen-docs
```

PM2 sẽ chạy `mkdocs serve` trên `0.0.0.0:8001` — truy cập được từ máy khác trong LAN.

---

## 6. Troubleshooting

### Lỗi: `bad interpreter: ... no such file or directory`

Venv bị copy từ project khác → shebang trỏ sai path. Fix:

```bash
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Lỗi: `Address already in use` (port 8001 bị chiếm)

```bash
# Tìm PID đang chiếm port
lsof -nP -iTCP:8001 -sTCP:LISTEN

# Kill PID (thay <PID> bằng số thực tế)
kill <PID>

# Hoặc dùng port khác
mkdocs serve --dev-addr=127.0.0.1:8765
```

### Warning: `pages exist in docs directory, but are not included in nav`

File `.md` mới chưa được khai báo trong `nav:` của `mkdocs.yml`.

Cách xử lý:
- Thêm vào mục `nav:` trong `mkdocs.yml` để hiển thị trên sidebar, **HOẶC**
- Cho phép page tồn tại ngoài nav (vẫn build được, chỉ là warning)

### Lỗi: Mermaid diagram không render

Đã có sẵn config trong `mkdocs.yml`:

```yaml
markdown_extensions:
  - pymdownx.superfences:
      custom_fences:
        - name: mermaid
          class: mermaid
          format: !!python/name:pymdownx.superfences.fence_code_format
```

Nếu vẫn không render → kiểm tra cú pháp ```` ```mermaid ```` trong file `.md`.

---

## 7. Cấu trúc thư mục

```
es-kitchen-docs/
├── mkdocs.yml              # Config chính (nav, theme, plugins)
├── requirements.txt        # Python deps: mkdocs, mkdocs-material, pymdown-extensions
├── ecosystem.config.js     # PM2 config
├── docs/                   # Nội dung markdown
│   ├── index.md
│   ├── backend/
│   ├── frontend/
│   ├── mobile/
│   ├── epics/
│   └── features/
├── site/                   # Output sau khi build (auto-generated)
└── venv/                   # Python virtualenv (auto-generated, không commit)
```

---

## 8. Khi có doc mới trong `docs/`

> **Quy tắc vàng:** Mỗi file `.md` mới **PHẢI** được khai báo trong `nav:` của `mkdocs.yml`. ESKITCHEN dùng explicit nav — file orphan sẽ không hiện trên sidebar và bị warning khi build `--strict`.

### 8.1 Quy trình tổng quan

```
1. Tạo file .md đúng path BMAD
2. Thêm entry vào mkdocs.yml nav (đúng pattern theo loại artifact)
3. Verify local (mkdocs serve hoặc mkdocs build --strict)
4. Apply lên server đang chạy (auto-reload / pm2 restart)
5. Commit cả file .md + mkdocs.yml
```

---

### 8.2 Đặt file đúng path (theo BMAD)

| Loại doc | Tác giả | Path |
|---|---|---|
| **SPEC** | BA (`ba-agent`) | `features/<feature>/SPEC.md` |
| **DESIGN** | Tech Lead (`techlead-design-agent`) | `features/<feature>/<repo-name>/DESIGN.md` |
| **Tasks** | Tech Lead Tasks | `features/<feature>/<repo-name>/tasks/task-X-Y.md` |
| **PLAN** | PM (`pm-agent`) | `features/<feature>/PLAN.md` |
| **Test Cases** | QC (`qc-agent`) | `features/<feature>/test-cases/tc_<module>.md` |
| **Bug Reports** | QC (`qc-agent`) | `features/<feature>/bug-reports/<BUG_ID>.md` |
| **Backend overview** | Backend dev | `backend/es-kitchen-api/overview/<topic>.md` |
| **Frontend overview** | Frontend dev | `frontend/<repo>/overview/<topic>.md` |
| **Mobile overview** | Mobile dev | `mobile/es-kitchen-payment-app/overview/<topic>.md` |
| **Quality reports** | QC Lead | `quality/<topic>.md` |

`<repo-name>` ∈ `es-kitchen-api` · `es-kitchen-web-admin` · `es-kitchen-web-company` · `es-kitchen-web-supplier` · `es-kitchen-web-outsource-web-private` · `es-kitchen-webapp-driver` · `es-kitchen-payment-app`

---

### 8.3 Thêm vào `mkdocs.yml` nav — theo pattern

#### Pattern A: Feature cross-repo (đầy đủ artifact)

```yaml
- <Feature Name>:
  - Specification: features/<feature>/SPEC.md
  - API Design: features/<feature>/es-kitchen-api/DESIGN.md
  - Web Admin Design: features/<feature>/es-kitchen-web-admin/DESIGN.md
  - Web Company Design: features/<feature>/es-kitchen-web-company/DESIGN.md
  - Web Supplier Design: features/<feature>/es-kitchen-web-supplier/DESIGN.md
  - Mobile Design: features/<feature>/es-kitchen-payment-app/DESIGN.md
  - Test Cases: features/<feature>/test-cases/tc_<module>.md
  - Plan: features/<feature>/PLAN.md
  - API Tasks:
    - Task 1-1: features/<feature>/es-kitchen-api/tasks/task-1-1.md
    - Task 2-1: features/<feature>/es-kitchen-api/tasks/task-2-1.md
```

> Chỉ include subfolder repo **thực sự có** DESIGN — không tạo entry rỗng.

#### Pattern B: Feature single-repo

```yaml
- <Feature Name>:
  - Specification: features/<feature>/SPEC.md
  - API Design: features/<feature>/es-kitchen-api/DESIGN.md
  - Test Cases: features/<feature>/test-cases/tc_<module>.md
```

#### Pattern C: Thêm 1 file lẻ vào section đã có

Ví dụ: vừa tạo `tc_role_permission.md`, đã có section "Admin Role & Permission":

```yaml
- Admin Role & Permission:
  - Specification: features/admin-role-permission/SPEC.md
  - API Design: features/admin-role-permission/es-kitchen-api/DESIGN.md
  - Web Admin Design: features/admin-role-permission/es-kitchen-web-admin/DESIGN.md
  - Test Cases: features/admin-role-permission/test-cases/tc_role_permission.md  # ← THÊM DÒNG NÀY
```

#### Quy ước đặt tên section nav (nhất quán giữa features)

| File | Nav label |
|---|---|
| `SPEC.md` | `Specification` |
| `es-kitchen-api/DESIGN.md` | `API Design` |
| `es-kitchen-web-admin/DESIGN.md` | `Web Admin Design` |
| `es-kitchen-web-company/DESIGN.md` | `Web Company Design` |
| `es-kitchen-web-supplier/DESIGN.md` | `Web Supplier Design` |
| `es-kitchen-web-outsource-web-private/DESIGN.md` | `Web Outsource Design` |
| `es-kitchen-webapp-driver/DESIGN.md` | `Driver Web Design` |
| `es-kitchen-payment-app/DESIGN.md` | `Mobile Design` |
| `test-cases/tc_*.md` | `Test Cases` (hoặc `Test Cases - <Module>` nếu nhiều file) |
| `PLAN.md` | `Plan` |
| `tasks/task-*.md` (group) | `<Repo> Tasks` (vd `API Tasks`, `Web Admin Tasks`) |

---

### 8.4 Verify trước khi commit

```bash
cd es-kitchen-docs
source venv/bin/activate

# Cách 1 — Dev server (live preview, recommended khi đang viết)
mkdocs serve --dev-addr=127.0.0.1:8001
# → Mở http://localhost:8001/ check sidebar có entry mới
# → Tự reload khi sửa mkdocs.yml hoặc file .md
# → Ctrl+C để dừng

# Cách 2 — Build strict (BẮT BUỘC trước khi commit / merge)
mkdocs build --strict
# Fail trong các trường hợp:
#   ⚠ File trong docs/ nhưng không có trong nav (orphan)
#   ⚠ Path trong nav trỏ file không tồn tại (broken link)
#   ⚠ Markdown/mermaid syntax lỗi
#   ⚠ Internal link [..](path) broken
```

---

### 8.5 Apply thay đổi lên server đang chạy

| Tình huống | Action |
|---|---|
| `mkdocs serve` đang chạy local | **Auto-reload** — chỉ cần F5 browser |
| PM2 daemon chạy production | `pm2 restart eskitchen-docs` |
| Build static site → deploy | `mkdocs build --clean --strict` rồi sync `site/` lên host (S3/Nginx/GitHub Pages) |
| CI/CD pipeline | Push branch → CI tự rebuild + deploy |

---

### 8.6 Checklist trước khi tạo PR

- [ ] File `.md` đặt đúng path theo bảng 8.2
- [ ] Đã thêm entry vào `mkdocs.yml` nav theo pattern 8.3
- [ ] Nav label nhất quán với quy ước (Specification / API Design / Test Cases / ...)
- [ ] Chạy `mkdocs build --strict` không có warning/error
- [ ] Local preview verify: sidebar đúng + nội dung render đúng (table, mermaid, code highlight)
- [ ] Commit **cả** file `.md` mới **và** `mkdocs.yml` trong cùng PR

---

### 8.7 Common pitfalls

| ❌ Lỗi | ✅ Cách tránh |
|---|---|
| Tạo file `.md` nhưng quên update nav | Chạy `mkdocs build --strict` trước commit |
| Đặt file sai thư mục (vd test-cases ngoài folder feature) | Theo bảng 8.2 — BMAD path |
| Tên nav label không nhất quán (vd "Backend Design" vs "API Design") | Theo bảng 8.3 nhất quán project-wide |
| Tạo entry trong nav nhưng file chưa tồn tại | Tạo file trước, nav sau |
| Đổi tên file `.md` mà quên update nav | Search/replace trong `mkdocs.yml` |
| Commit file mới nhưng không commit `mkdocs.yml` | Luôn `git add mkdocs.yml` cùng PR |
| `.DS_Store` lọt vào commit | Trong `.gitignore` (đã có) |

---

### 8.8 Workflow nhanh — copy-paste

Vừa tạo xong `features/my-feature/SPEC.md`:

```bash
# 1. Verify file path đúng
ls es-kitchen-docs/docs/features/my-feature/SPEC.md

# 2. Edit mkdocs.yml — thêm vào dưới section "- Features:"
#    (giữ alphabet order với các feature khác)
#    - My Feature:
#      - Specification: features/my-feature/SPEC.md

# 3. Verify
cd es-kitchen-docs
source venv/bin/activate
mkdocs build --strict   # phải pass

# 4. Local preview (optional)
mkdocs serve --dev-addr=127.0.0.1:8001

# 5. Commit
git add docs/features/my-feature/SPEC.md mkdocs.yml
git commit -m "docs(my-feature): add SPEC + nav entry"
```

---

## Tham khảo

- MkDocs: https://www.mkdocs.org/
- Material theme: https://squidfunk.github.io/mkdocs-material/
- PyMdown Extensions: https://facelessuser.github.io/pymdown-extensions/