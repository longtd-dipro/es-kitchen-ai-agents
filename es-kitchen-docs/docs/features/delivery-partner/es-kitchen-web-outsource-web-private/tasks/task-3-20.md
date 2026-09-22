# [FE] [Delivery_Web] — Modal アカウント一括発行: bước xác nhận + đang xử lý

## Backlog Info
- **Issue Type:** Task · **Category:** Delivery_Web
- **Parent Issue:** Delivery Partner P2 — 配送スタッフ
- **Version:** _TBD_ · **Milestone:** _TBD_
- **Estimate Hour:** 7h · **Actual Hour:** — · **Status:** Open

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 3 — Frontend |
| Repo | `es-kitchen-web-outsource-web-private` |
| Depends on | task-3-19, **task-2-9 (BE)** |
| Song song với | task-3-22 |
| Estimate | ~7h |

## Mục tiêu
Modal xác nhận trước khi phát hành hàng loạt: bảng nhân viên đã chọn, cảnh báo reset mật khẩu, nút `キャンセル` / `発行する` và trạng thái đang xử lý.

## Context (đọc trước khi code)

### 🎨 Figma
- **Screen Code:** `OW_STAF_005` · node **`31498:194129`** (Section 6) — frame 1 (xác nhận), frame 2 (có dòng lỗi sẵn), frame 3 (loading)
- Copy đúng câu cảnh báo: `既存アカウントがある場合、パスワードはリセットされ、再ログインが必要になります。`

### 🏗️ Tech Lead output
- **Design-Technical.md (FE)** → FE-08, §7.1
- **BE task:** `task-2-9.md` → endpoint + shape response

### 📂 File liên quan
- `src/hooks/useMutationCustom.ts` — **bắt buộc dùng**
- `src/pages/driver/EmployeePage.tsx` (task-3-19)

## API Definition (copy từ BE task-2-9)
| Method | Endpoint | Request | Response |
|---|---|---|---|
| POST | `/drivers/bulk-issue-account` | `{ driverIds: string[] }` (1–100) | `{ total, succeeded, failed, results[] }` |

> **HTTP 200 kể cả khi `failed > 0`** — không coi là lỗi mạng.

## Yêu cầu implement

### Step 1 — `driver.service.ts`: `bulkIssueAccount(driverIds)`
### Step 2 — `hooks/useDrivers.ts`: `useBulkIssueAccount()` bằng `useMutationCustom`
### Step 3 — `src/pages/driver/components/BulkIssueAccountModal.tsx`
- State machine: `confirm → loading → (success | partialError)` — **1 component, không tách 4 modal**
- `confirm`: tiêu đề `アカウント一括発行のメール送信の確認`, mô tả, cảnh báo, bảng `No · 配送スタッフID · 配送スタッフ名 · ステータス · メールアドレス`
- `loading`: nút `発行する` hiện spinner, khoá `キャンセル` và đóng modal
- Task này **chưa** làm 2 màn kết quả (task-3-21) — tạm `onSuccess` đóng modal

## Unit Tests (BẮT BUỘC)
```typescript
it('lists every selected driver in the confirm table', ...);
it('shows the password reset warning text', ...);
it('switches to the loading state on submit and blocks closing', ...);
it('sends exactly the selected driverIds', ...);
```
**Coverage:** ≥ 70% · **Verify:** `npm run test -- --coverage BulkIssueAccountModal`

## Kiểm tra Integration (BẮT BUỘC)
- [ ] Chọn 2 nhân viên thật → modal hiển thị đúng 2 dòng
- [ ] Bấm `発行する` → API được gọi 1 lần, mail gửi tới hộp thư test
- [ ] Trong lúc loading không đóng được modal

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| `パスワード送信` cho 1 nhân viên | `EmployeeDetailPage.tsx` | Nút cũ vẫn gửi mail bình thường |
| Danh sách nhân viên | `EmployeePage.tsx` | Sau khi đóng modal, danh sách refetch |

## Không được làm
- Không dùng `useMutation` trực tiếp
- Không coi `failed > 0` là lỗi và hiện toast đỏ chung chung
- Không gửi quá 100 id/lần

## Definition of Done
- [ ] Step 1/2/3 hoàn tất · Build · Lint · Type-check · Unit Tests pass
- [ ] Integration check pass · Non-Regression verify đủ · Actual Hour · Status → `Done` → `Reviewing`
