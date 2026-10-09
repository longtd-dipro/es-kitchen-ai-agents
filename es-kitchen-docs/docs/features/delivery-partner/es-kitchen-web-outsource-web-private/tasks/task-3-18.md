# [FE] [Delivery_Web] — 配送スタッフ一覧: cột 免許 + アカウント状態

## Backlog Info
- **Issue Type:** Task · **Category:** Delivery_Web
- **Parent Issue:** Delivery Partner P2 — 配送スタッフ
- **Version:** _TBD_ · **Milestone:** _TBD_
- **Estimate Hour:** 6h · **Actual Hour:** — · **Status:** Open

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 3 — Frontend |
| Repo | `es-kitchen-web-outsource-web-private` |
| Depends on | **task-2-7 (BE)** |
| Song song với | task-3-17 |
| Estimate | ~6h |

## Mục tiêu
Bổ sung cột ảnh 免許 và cột `アカウント状態` vào danh sách nhân viên giao hàng.

## Context (đọc trước khi code)

### 🎨 Figma
- **Screen Code:** `OW_STAF_001` · node **`31498:192233`**

### 🏗️ Tech Lead output
- **Design-Technical.md (FE)** → FE-07, §8 R5 (layout khi thêm cột)
- **BE task:** `task-2-7.md` → `licenseImageUrls`, `accountState`

### 📂 File liên quan
- `src/pages/driver/components/employeeColumns.tsx` — cột hiện có: No · ID · 配送スタッフ名 · 委託配送先名 · 区分 · 電話番号 · ステータス · 操作
- `src/pages/driver/components/EmployeeLicenseField.tsx` — đã có, xem tái dùng
- `src/components/Common/FileViewerModal.tsx` (task-3-1)

## API Definition (copy từ BE task-2-7)
| Method | Endpoint | Request | Response |
|---|---|---|---|
| GET | `/drivers` | `?q&type&status&accountState&page&limit&sortBy&order` | `{ items, total, page, limit, totalPages }` |

`items[]` thêm: `licenseImageUrls: string[]`, `accountState: 'ISSUED'|'NOT_ISSUED'`

## Yêu cầu implement

### Step 1/2 — mở rộng type của `driver.service.ts` + `hooks/useDrivers` (không đổi endpoint)
### Step 3 — `employeeColumns.tsx`
- Cột `免許`: thumbnail `licenseImageUrls[0]` (40×28, bo góc); rỗng → icon placeholder. Bấm → `FileViewerModal`
- Cột `アカウント状態`: `発行済み` (kiểu link) / `未発行` (xám)
- Bảng đặt `scroll.x` để không vỡ ở 1280px
- Nhãn `ステータス` bổ sung `免許未登録` **chỉ khi BE task-2-7 quyết định trả** — nếu BE dùng cờ suy ra thì FE tự render nhãn theo `licenseImageUrls.length === 0`

## Unit Tests (BẮT BUỘC)
```typescript
it('renders the license thumbnail when urls exist', ...);
it('renders a placeholder when the driver has no license image', ...);
it('renders 発行済み / 未発行 from accountState', ...);
it('opens the viewer when the thumbnail is clicked', ...);
```
**Coverage:** ≥ 70% · **Verify:** `npm run test -- --coverage employeeColumns`

## Kiểm tra Integration (BẮT BUỘC)
- [ ] Danh sách thật hiển thị ảnh giấy phép đúng nhân viên
- [ ] Nhân viên chưa phát hành tài khoản hiển thị `未発行`
- [ ] Kiểm tra layout ở 1440px và 1280px

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Danh sách nhân viên cũ | `EmployeePage.tsx` | Cột cũ + phân trang + nút sửa/xoá vẫn chạy |
| Màn chi tiết nhân viên | `EmployeeDetailPage.tsx` | Link từ tên vẫn mở đúng |

## Không được làm
- Không tải ảnh kích thước gốc cho thumbnail nếu API có URL thumbnail
- Không đổi cột cũ

## Definition of Done
- [ ] Build · Lint · Type-check · Unit Tests pass
- [ ] Integration check pass · Non-Regression verify đủ · Actual Hour · Status → `Done` → `Reviewing`
