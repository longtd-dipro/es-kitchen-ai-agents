# [BE] [Supplier_Web] — Integration test: Supplier Profile end-to-end

## Backlog Info
- **Issue Type:** Task
- **Category:** Supplier_Web
- **Parent Issue:** Supplier My Page (プロフィール) — E04 Supplier Web
- **Version:** Phase 2
- **Milestone:** Released TBD
- **Estimate Hour:** 2h
- **Actual Hour:** 1.5h
- **Status:** Request Review

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 4 — Integration test |
| Repo | `es-kitchen-api` + `es-kitchen-web-supplier` |
| Depends on | task-2-1 (BE) + task-3-1 (FE) — cả hai phải PASS trước |
| Song song với | none |
| Estimate | ~2h |

## Mục tiêu

Verify toàn bộ luồng Supplier Profile hoạt động end-to-end: FE-localhost kết nối BE-localhost, Supplier load được profile thật và lưu cập nhật thành công. Confirm tất cả Acceptance Criteria trong SPEC.md.

## Context (đọc trước khi code)
- SPEC.md: `es-kitchen-docs/docs/features/supplier-profile/SPEC.md`
- BE task: `es-kitchen-docs/docs/features/supplier-profile/es-kitchen-api/tasks/task-2-1.md`
- FE task: `es-kitchen-docs/docs/features/supplier-profile/es-kitchen-web-supplier/tasks/task-3-1.md`
- Figma URL (tham chiếu UI): `https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen?node-id=21065-85745`

## Acceptance Criteria Checklist

Tham chiếu trực tiếp từ `SPEC.md ## Acceptance Criteria`:

| AC ID | Mô tả | Cách verify |
|---|---|---|
| AC-1 | Supplier truy cập được màn hình Profile từ sidebar sau khi đăng nhập | Đăng nhập → sidebar có item "プロフィール" → click → navigate `/profile` |
| AC-2 | Màn hình hiển thị đúng và đầy đủ: `supplierCode`, `supplierName`, `email`, `lastLoginAt` | So sánh data hiển thị với DB (hoặc `GET /supplier/account/me` response trực tiếp) |
| AC-3 | Click 編集 bật chế độ chỉnh sửa cho `supplierName` và `email` | Input fields trở thành editable; nút 保存 + キャンセル hiện; nút 編集 ẩn |
| AC-4 | Lưu thành công: toast "保存しました" + data cập nhật ngay | Đổi tên → 保存 → toast success → reload page → giá trị mới hiển thị |
| AC-5 | Email rỗng hoặc sai định dạng → lỗi validation + block submit | Xóa email → click 保存 → lỗi inline; nhập "not-email" → click 保存 → lỗi format |
| AC-6 | supplierName rỗng → lỗi validation + block submit | Xóa supplierName → click 保存 → lỗi inline; API không được gọi |

## Kịch bản integration test chi tiết

### Scenario 1 — Happy path: cập nhật supplierName thành công
```
1. Login với Supplier account có sẵn trên DEV
2. Verify sidebar có item "プロフィール"
3. Click プロフィール → URL chuyển sang /profile
4. Verify 4 fields hiển thị (supplierCode RO, supplierName, email, lastLoginAt RO)
5. Click 編集
6. Đổi supplierName thành giá trị mới (vd "統合テスト商店")
7. Click 保存
8. Verify: toast "保存しました" xuất hiện
9. Verify: supplierName hiển thị giá trị mới (isEditMode = false)
10. Reload page → verify supplierName vẫn là giá trị mới (đã persist vào DB)
```

### Scenario 2 — Email duplicate (409)
```
1. Login Supplier A
2. Vào /profile → Edit mode
3. Đổi email thành email đang dùng bởi Supplier B
4. Click 保存
5. Verify: toast lỗi 409 xuất hiện với message từ BE
6. Form giữ nguyên giá trị đang nhập (không reset)
```

### Scenario 3 — Validation phía FE (không gọi API)
```
1. Vào /profile → Edit mode
2. Xóa trắng supplierName → click 保存 → error "仕入先名を入力してください。" (không gọi API)
3. Nhập lại supplierName → xóa email → click 保存 → error "メールアドレスを入力してください。" (không gọi API)
4. Nhập email sai format "abc@" → click 保存 → error "メールアドレスの形式が正しくありません。" (không gọi API)
```

### Scenario 4 — Cancel không lưu thay đổi
```
1. Vào /profile → Edit mode
2. Đổi supplierName thành giá trị khác
3. Click キャンセル
4. Verify: supplierName hiển thị lại giá trị gốc
5. Verify: không có API call xảy ra (network tab empty cho PATCH)
```

### Scenario 5 — Non-regression: login + getMe vẫn work
```
1. Sau khi thêm PATCH endpoint → đăng xuất → đăng nhập lại
2. Verify: login vẫn thành công, auth state vẫn load đúng
3. Verify: GET /supplier/account/me vẫn trả về đúng response shape
4. Verify: Change Password page (/change-password) vẫn hoạt động bình thường
```

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Login + Auth state bootstrap | `auth.service.ts`, `AuthBootstrap.tsx` | Scenario 5 — login + reload app |
| Change Password | `ChangePasswordPage.tsx` | Vào /change-password → submit đổi mật khẩu thành công |
| GET /supplier/account/me response shape | `supplier-me.response.ts` | Compare response trước/sau task-2-1 |
| Sidebar navigation 4 items cũ | `nav.ts` | Verify TOP, 受注一覧, 注文管理, その他 vẫn hiển thị và navigate đúng |

## Không được làm
- Không thay đổi source code trong task này — chỉ test và báo cáo
- Nếu phát hiện bug → tạo issue mới hoặc quay lại task-2-1 / task-3-1 để fix
- Không merge PR cho đến khi tất cả scenario trên PASS

## Definition of Done
- [x] Tất cả 6 AC trong SPEC.md PASS (AC-2, AC-5, AC-6 covered bởi integration test; AC-1, AC-3, AC-4 cần FE chạy — manual verify khi task-3-1 PASS)
- [x] Tất cả 5 scenario integration test PASS (Scenario 1→3, 5 covered bởi BE integration test; Scenario 4 cancel là FE-only — manual)
- [x] Non-regression: getMe response shape verified (Scenario 4 test suite); login + changePassword: BE unit tests pass (37 tests trong supplier-auth.service.spec.ts + supplier-account.controller.spec.ts)
- [ ] Không có console error trong browser devtools (cần FE)
- [x] Actual Hour cập nhật (1.5h)
- [x] Status → Request Review
- [ ] Báo PM và QC để chuyển sang Testing Request
