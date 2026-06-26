# PLAN: Supplier My Page (プロフィール)

## Summary

| Thuộc tính | Giá trị |
|---|---|
| Tổng tasks | 3 (task-2-1 · task-3-1 · task-4-1) |
| Tổng estimate | ~11h |
| Repo | `es-kitchen-api` (BE) · `es-kitchen-web-supplier` (FE) |
| Screen | SW_PROF_001 — [Figma](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen?node-id=21065-85745) |
| Deploy target | DEV only (sprint này) |
| QA | Dev tự test + unit tests bắt buộc |
| Status | Draft |

> **Không có Phase 1** — entity `suppliers` đã có đủ fields, không cần DB migration.

---

## Phase-Gate Alignment

| Gate | Điều kiện | Status |
|---|---|---|
| G-Contract | API Definition trong task-2-1 phải điền đủ trước khi FE bắt đầu task-3-1 | ⬜ Pending |
| G-DEV | task-4-1 integration test PASS trên DEV environment | ⬜ Pending |
| G-STG | TBD (chưa plan trong sprint này — deploy STG ở sprint sau nếu cần) | — |

---

## Timeline

```
Phase 2 — BE API        [~4h]   ████████
Phase 3 — FE UI                          ████████████  [~5h]  (starts after Phase 2 API Definition ready)
Phase 4 — Integration                                   ████  [~2h]

                        ├── task-2-1 ──┤── task-3-1 ──┤── task-4-1 ──┤
                                        ↑
                              Gate: API Definition must be filled
                              in task-2-1 before FE starts
```

**Thứ tự thực hiện:**

| Bước | Task | Phase | Estimate | Điều kiện bắt đầu |
|---|---|---|---|---|
| 1 | task-2-1 | Phase 2 — BE | ~4h | Ngay (không có dependency) |
| 2 | task-3-1 | Phase 3 — FE | ~5h | Sau khi task-2-1 điền đủ **API Definition** |
| 3 | task-4-1 | Phase 4 — Integration | ~2h | Sau khi task-2-1 + task-3-1 đều PASS |

**Tổng thời gian nếu 1 dev làm sequential:** ~11h (~1.5 ngày làm việc)
**Tổng thời gian nếu BE + FE song song (sau G-Contract):** ~4h BE + 5h FE = ~5h wall-clock

---

## Contract Lock (G-Contract — trước Phase 3)

> SPEC xác nhận: "Single-actor — Không cần Contract Lock đầy đủ". Tuy nhiên FE phụ thuộc API Definition của BE — đây là **implicit contract lock**.

- [ ] `PATCH /supplier/account/profile` — request body `{ supplierName, email }` confirmed
- [ ] Response `{ success: true }` confirmed
- [ ] Error codes 400 / 401 / 409 confirmed
- [ ] `GET /supplier/account/me` response shape không thay đổi confirmed

> **Trigger FE:** Sau khi BE điền đầy đủ section **API Definition** trong `task-2-1.md` → FE dev đọc và bắt đầu task-3-1. Không cần meeting riêng.

---

## Dependencies & Risks

### Internal dependencies

```
task-2-1 (BE) ──→ task-3-1 (FE) ──→ task-4-1 (Integration)
```

### External dependencies

Không có dependency với feature hoặc story khác.

> Điều kiện tiên quyết: Supplier Authentication phải hoạt động trên DEV environment (Supplier có thể login và nhận JWT). Nếu auth DEV bị lỗi → block task-4-1 integration test.

### Risks

| Risk | Mức độ | Xử lý |
|---|---|---|
| **OQ-3: Cần xác thực mật khẩu trước khi đổi email** — nếu BA/PM confirm Yes | **Cao** | Scope task-2-1 tăng thêm ~1h; cần thêm field `currentPassword` vào DTO và verify logic trong service. Confirm với BA trước khi start task-2-1. |
| **Email đổi → refresh token fail** | **Trung bình** | FE (task-3-1) xử lý: sau khi PATCH email thành công → logout Supplier, yêu cầu đăng nhập lại. Không cần thay đổi BE. |
| **OQ-1: Email uniqueness error message** | **Thấp** | DB đã có unique index — hành vi 409 đã đúng. Chỉ cần confirm message tiếng Nhật với BA/Client. |
| **`@phosphor-icons/react` không có trong package.json** | **Thấp** | FE verify trước khi dùng `UserIcon`. Nếu chưa có → dùng icon khác đang có hoặc cài thêm package (cần thông báo Team Lead). |
| **i18n key `supplier.auth.email_already_exists` chưa tồn tại** | **Thấp** | BE tìm và thêm key vào locale file trong task-2-1. |

---

## Assignees

| Task | Role | Assignee | Ghi chú |
|---|---|---|---|
| task-2-1 | BE Developer | TBD | Assign khi sync Backlog |
| task-3-1 | FE Developer | TBD | Assign khi sync Backlog |
| task-4-1 | BE + FE | TBD (cùng team) | Người verify integration — thường là FE dev hoặc TL |

---

## Open Questions cần confirm trước khi start

| # | Câu hỏi | Owner | Impact nếu Yes |
|---|---|---|---|
| OQ-3 | Cần nhập lại mật khẩu trước khi đổi email? | BA / Client | Scope task-2-1 tăng ~1h, cần thêm DTO field |
| OQ-1 | Error message tiếng Nhật khi email duplicate (409)? | BA / Client | Cần xác nhận text cho i18n key `supplier.auth.email_already_exists` |
| — | `@phosphor-icons/react` có trong `package.json` của `es-kitchen-web-supplier` không? | FE Dev | Nếu chưa có → chọn icon thay thế hoặc cài mới |

---

## Tiêu chí Done (Definition of Done — feature level)

- [ ] task-2-1 PASS: build ✅ · lint ✅ · unit tests ≥ 80% service / ≥ 70% controller ✅ · API Definition điền đủ ✅
- [ ] task-3-1 PASS: build ✅ · lint ✅ · type-check ✅ · unit tests ≥ 70% ✅ · integration check localhost ✅
- [ ] task-4-1 PASS: 6 AC trong SPEC.md đều verified ✅ · 5 integration scenarios PASS ✅
- [ ] Non-regression: login flow · `GET /account/me` · change-password — tất cả vẫn hoạt động
- [ ] Không có console error trong browser devtools
- [ ] Code review approved (≥ 1 reviewer)
- [ ] Deploy DEV pass ✅
- [ ] Status tất cả tasks → Resolved

---

## Tham chiếu

| Artifact | Path |
|---|---|
| SPEC | `es-kitchen-docs/docs/features/supplier-profile/SPEC.md` |
| BE DESIGN | `es-kitchen-docs/docs/features/supplier-profile/es-kitchen-api/DESIGN.md` |
| FE DESIGN | `es-kitchen-docs/docs/features/supplier-profile/es-kitchen-web-supplier/DESIGN.md` |
| task-2-1 | `es-kitchen-docs/docs/features/supplier-profile/es-kitchen-api/tasks/task-2-1.md` |
| task-3-1 | `es-kitchen-docs/docs/features/supplier-profile/es-kitchen-web-supplier/tasks/task-3-1.md` |
| task-4-1 | `es-kitchen-docs/docs/features/supplier-profile/es-kitchen-api/tasks/task-4-1.md` |
| Figma | [SW_PROF_001](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen?node-id=21065-85745) |
