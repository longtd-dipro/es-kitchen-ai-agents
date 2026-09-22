# [FE] [Delivery_Web] — 配送スタッフ詳細: khung 3 tab + tab 基本情報

## Backlog Info
- **Issue Type:** Task · **Category:** Delivery_Web
- **Parent Issue:** Delivery Partner P2 — 配送スタッフ
- **Version:** _TBD_ · **Milestone:** _TBD_
- **Estimate Hour:** 5h · **Actual Hour:** — · **Status:** Open

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 3 — Frontend |
| Repo | `es-kitchen-web-outsource-web-private` |
| Depends on | **task-2-7 (BE)** |
| Song song với | task-3-20 |
| Estimate | ~5h |

## Mục tiêu
Chuyển màn chi tiết nhân viên sang 3 tab (`基本情報 / 担当配送情報 / 変更履歴`) và hoàn thiện tab 基本情報 với ảnh 免許証 + khối ログイン情報.

## Context (đọc trước khi code)

### 🎨 Figma
- **Screen Code:** `OW_STAF_003` · node **`31498:192537`** (tab 基本情報)
- Header: nút `削除` · `パスワード送信` · `編集`

### 🏗️ Tech Lead output
- **Design-Technical.md (FE)** → FE-10

### 📂 File liên quan
- `src/pages/driver/EmployeeDetailPage.tsx`, `components/EmployeeDetailForm.tsx`
- `src/pages/driver/components/EmployeeLicenseField.tsx`
- `src/pages/orders/orderDetailTabs.constants.ts` — pattern tab constants

## API Definition (đã có)
| Method | Endpoint | Response |
|---|---|---|
| GET | `/drivers/:id` | `{ id, driverCode, driverName, nameKana, status, phone, email, licenseImageUrls[], lastLoginAt, canDelete }` |

## Yêu cầu implement

### Step 3
1. `employeeDetailTabs.constants.ts`: `basic | assigned | history`
2. `EmployeeDetailPage.tsx`: render tab + đồng bộ `?tab=`
3. Tab `基本情報`:
   - Khối `基本情報`: 配送スタッフID · 配送スタッフ名 · カナ · 区分 · ステータス · 電話番号 · **免許証 (ảnh, bấm mở `FileViewerModal`)**
   - Khối `ログイン情報`: ログインID · メールアドレス · 最終ログイン日時
4. Tab `担当配送情報` / `変更履歴`: placeholder (task-3-23 / 3-24)
5. Nút `削除` giữ nguyên rule hiện có (`canDelete`) — **không nới lỏng**

## Unit Tests (BẮT BUỘC)
```typescript
it('renders three tabs and defaults to basic', ...);
it('renders every field of the basic tab from the API', ...);
it('opens the viewer when the license image is clicked', ...);
it('keeps the delete button disabled when canDelete is false', ...);
```
**Coverage:** ≥ 70% · **Verify:** `npm run test -- --coverage EmployeeDetail`

## Kiểm tra Integration (BẮT BUỘC)
- [ ] Mở 1 nhân viên thật → đủ field, ảnh giấy phép xem được
- [ ] Nút `パスワード送信` vẫn gửi được mail
- [ ] Nút `編集` vào form sửa như cũ

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Màn chi tiết cũ | `EmployeeDetailForm.tsx` | Không mất field nào sau khi tab hoá |
| Xoá nhân viên | `EmployeeDetailPage.tsx` | Rule `canDelete` giữ nguyên |

## Không được làm
- Không đổi rule xoá
- Không gọi thêm API cho tab chưa mở

## Definition of Done
- [ ] Build · Lint · Type-check · Unit Tests pass
- [ ] Integration check pass · Non-Regression verify đủ · Actual Hour · Status → `Done` → `Reviewing`
