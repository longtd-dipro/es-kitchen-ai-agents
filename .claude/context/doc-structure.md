# Doc Structure — ESKITCHEN (BMAD)

> **Một path duy nhất cho mọi feature** — `es-kitchen-docs/docs/features/<feature-name>/`.
> Folder `docs/epics/` đã được xóa — `docs/features/` đóng vai trò **long-memory** của dự án (tất cả SPEC/DESIGN/PLAN/tasks đều ở đây).

---

## Single-actor feature

Khi feature chỉ ảnh hưởng **1 repo duy nhất** (ví dụ: supplier authentication chỉ ở `es-kitchen-web-supplier` + `es-kitchen-api`) — DESIGN.md có thể nằm thẳng trong subfolder repo:

```
es-kitchen-docs/docs/features/<feature-name>/
├── SPEC.md                  ← BA tạo (nghiệp vụ)
├── PLAN.md                  ← PM tạo (kế hoạch)
└── es-kitchen-api/
    ├── DESIGN.md            ← Tech Lead tạo
    └── tasks/
        ├── task-1-1.md
        └── task-2-1.md
```

---

## Cross-repo feature

Khi feature ảnh hưởng **nhiều repo** (BE + FE, BE + Mobile, hoặc cả 3):

```
es-kitchen-docs/docs/features/<feature-name>/
├── SPEC.md                          ← BA tạo (1 file, góc nhìn nghiệp vụ)
├── PLAN.md                          ← PM tạo (tổng hợp tất cả repo)
├── es-kitchen-api/
│   ├── DESIGN.md                    ← Tech Lead (kỹ thuật BE)
│   └── tasks/
│       ├── task-1-1.md              ← Phase 1: DB migration
│       ├── task-2-1.md              ← Phase 2: Service
│       └── task-2-2.md              ← Phase 2: API endpoint
├── es-kitchen-web-admin/            ← nếu E03 liên quan
│   ├── DESIGN.md
│   └── tasks/
│       └── task-3-1.md
├── es-kitchen-web-company/          ← nếu E02 liên quan
│   ├── DESIGN.md
│   └── tasks/
│       └── task-3-2.md
├── es-kitchen-web-supplier/         ← nếu E04 liên quan
│   ├── DESIGN.md
│   └── tasks/
│       └── task-3-3.md
└── es-kitchen-payment-app/          ← nếu E01 Mobile liên quan
    ├── DESIGN.md
    └── tasks/
        └── task-3-4.md
```

> Sự khác biệt single-actor vs cross-repo **không nằm ở path** (cùng `docs/features/`) mà nằm ở **metadata trong SPEC** (số lượng Actors) — quyết định PM có cần `Contract Lock` trước Phase 3 hay không.

---

## Phân công

| Role | Trách nhiệm |
|---|---|
| BA | Tạo **1 SPEC** — nghiệp vụ, actors, flow, AC. Không cần biết ranh giới repo. |
| Tech Lead | Đọc SPEC → xác định repo → tạo **DESIGN per repo** + tasks |
| PM | Tổng hợp → tạo **1 PLAN** với timeline cross-repo |
| Dev | Implement task của repo mình |

---

## Khi nào Mobile cần DESIGN riêng?

Flutter (`es-kitchen-payment-app`) cần subfolder + DESIGN.md khi SPEC có:

- Người dùng thao tác trên mobile app (E01)
- WebSocket event mới (socket_io)
- Push notification (Firebase)
- API endpoint mới mà Mobile gọi

---

## Khi nào cần Contract Lock?

**Cần** khi feature ảnh hưởng từ **2 repo trở lên** (cross-repo).
**Không cần** khi feature chỉ ảnh hưởng 1 repo (single-actor).

Contract Lock = confirm trước Phase 3:

- REST API endpoints (method/path/DTO/error codes)
- WebSocket events (nếu có)
- Push notification payload (nếu có)
