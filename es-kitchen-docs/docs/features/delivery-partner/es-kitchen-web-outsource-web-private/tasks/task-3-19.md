# [FE] [Delivery_Web] — 配送スタッフ一覧: chọn nhiều dòng, lọc và sắp xếp

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
| Depends on | task-3-18 |
| Song song với | task-3-20 |
| Estimate | ~6h |

## Mục tiêu
Thêm checkbox chọn nhiều dòng (chuẩn bị cho phát hành tài khoản hàng loạt), dropdown lọc `区分` / `ステータス` / `アカウント状態` và nút `並べ替え`.

## Context (đọc trước khi code)
- **Figma:** node **`31498:192233`** — checkbox cột đầu, nút `並べ替え`, nút `アカウント一括発行` (disabled khi chưa chọn)
- **Design-Technical.md (FE)** → FE-07
- **BE task:** `task-2-7.md` → `accountState`, `sortBy`, `order`
- `src/pages/driver/components/EmployeeFilterBar.tsx`, `employeeFilter.constants.ts`

## API Definition
Dùng param của task-2-7 (không thêm endpoint).

## Yêu cầu implement

### Step 3
- `rowSelection` của AntD Table: chọn từng dòng + chọn tất cả trang hiện tại
- State `selectedRowKeys` giữ ở `EmployeePage` (state cục bộ, **không Redux**)
- Đổi trang → giữ lựa chọn của trang cũ hay xoá? → **xoá** và hiển thị số đã chọn, để tránh phát hành nhầm ngoài tầm nhìn; ghi rõ hành vi này trong PR
- Nút `アカウント一括発行` disabled khi `selectedRowKeys.length === 0` (mở modal ở task-3-20)
- Filter bar thêm dropdown `アカウント状態`; nút `並べ替え` đổi `sortBy`/`order`

## Unit Tests (BẮT BUỘC)
```typescript
it('disables the bulk button when nothing is selected', ...);
it('selects and deselects all rows on the current page', ...);
it('clears the selection when changing page', ...);
it('sends accountState and sort params on filter submit', ...);
```
**Coverage:** ≥ 70% · **Verify:** `npm run test -- --coverage Employee`

## Kiểm tra Integration (BẮT BUỘC)
- [ ] Chọn vài dòng → nút bulk bật
- [ ] Lọc `未発行` → chỉ còn nhân viên chưa phát hành
- [ ] Sắp xếp theo tên hoạt động

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Cột 免許 / アカウント状態 (task-3-18) | `employeeColumns.tsx` | Test suite task-3-18 pass |
| Nút 新規登録 | `EmployeePage.tsx` | Vẫn mở form tạo mới |

## Không được làm
- Không giữ `selectedRowKeys` trong Redux hay URL
- Không tự gọi API phát hành ở task này

## Definition of Done
- [ ] Build · Lint · Type-check · Unit Tests pass
- [ ] Hành vi "đổi trang xoá lựa chọn" ghi trong PR
- [ ] Integration check pass · Non-Regression verify đủ · Actual Hour · Status → `Done` → `Reviewing`
