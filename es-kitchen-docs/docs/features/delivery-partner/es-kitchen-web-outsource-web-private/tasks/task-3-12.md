# [FE] [Delivery_Web] — 配送詳細: panel chọn 配送スタッフ + khoá chỉnh sửa

## Backlog Info
- **Issue Type:** Task · **Category:** Delivery_Web
- **Parent Issue:** Delivery Partner P2 — 配送管理
- **Version:** _TBD_ · **Milestone:** _TBD_
- **Estimate Hour:** 7h · **Actual Hour:** — · **Status:** Open

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 3 — Frontend |
| Repo | `es-kitchen-web-outsource-web-private` |
| Depends on | task-3-11, **task-2-6 (BE)**, **task-2-14 (BE)** |
| Song song với | task-3-13 |
| Estimate | ~7h |

## Mục tiêu
Panel `配送スタッフ選択` với 3 trạng thái (chưa gán / đã gán / bị khoá) và dropdown chọn tài xế có ô tìm kiếm + số việc trong ngày.

## Context (đọc trước khi code)

### 🎨 Figma
- `31498:190718` — chưa gán: badge `⚠ 未設定` + nút `キャンセル` / `確定`
- `31498:190790` — đã gán: nút `編集` **bật**
- **`31498:190870`** — nút `編集` **disabled** (rule khoá 7 ngày)
- **`31498:190950`** — dropdown mở: ô search + `ID: DRV-003` + `08/20の配送件数：3件`
- Toast: `31498:193795` — `配送スタッフ設定完了しました。`

### 🏗️ Tech Lead output
- **Design-Technical.md (FE)** → FE-04, §7.3 (luồng khoá 7 ngày)
- **BE task:** `task-2-6.md` (`editLock`), `task-2-14.md` (`deliveryCountOnDate`)

### 📂 File liên quan
- `src/pages/delivery-status/components/DeliveryStatusDetailForm.tsx` — panel gán tài xế hiện tại
- `src/hooks/useMutationCustom.ts` — **bắt buộc dùng**, không gọi `useMutation` trực tiếp

## API Definition (copy từ BE)
| Method | Endpoint | Request | Response |
|---|---|---|---|
| GET | `/delivery-blocks/:id/assignable-drivers` | `?keyword=` | `{ items: [{ id, driverCode, driverName, tel, deliveryCountOnDate }] }` |
| PATCH | `/delivery-blocks/:id/assign-driver` | `{ driverId }` | detail đã cập nhật · lỗi `409 SHIPMENT_EDIT_LOCKED` |

Detail trả kèm: `editLock: { canEditDriver: boolean, reason: 'LOCKED_AFTER_7_DAYS' | null }`

## Yêu cầu implement

### Step 1 — `delivery.service.ts`: thêm `keyword` vào `fetchAssignableDrivers`
### Step 2 — `hooks/useDeliveries.ts`: `useAssignableDrivers(id, keyword)` + `useAssignDriver(id)` (`useMutationCustom`)
### Step 3 — `components/DriverAssignPanel.tsx`
- Chưa gán → badge `⚠ 未設定`, select + `キャンセル` / `確定`
- Đã gán → hiển thị `tên · ID · 配送件数`, nút `編集`
- `editLock.canEditDriver === false` → nút `編集` **disabled** + tooltip lý do
- Dropdown: ô `配送スタッフ名・IDで検索`, mỗi dòng hiện `ID` + `MM/DDの配送件数：N件` (ẩn khi không có số)
- `確定` thành công → toast `配送スタッフ設定完了しました。` + `invalidateQueries(['delivery-detail', id])` và `['deliveries']`
- Nhận `409 SHIPMENT_EDIT_LOCKED` → hiện thông báo lỗi và refetch detail (trạng thái khoá có thể đã đổi)

## Unit Tests (BẮT BUỘC)
```typescript
it('disables the edit button when editLock.canEditDriver is false', ...);
it('shows the 未設定 badge when no driver is assigned', ...);
it('filters the dropdown via the keyword param', ...);
it('shows the delivery count per driver', ...);
it('invalidates the detail query after a successful assign', ...);
it('surfaces the 409 locked error without crashing', ...);
```
**Coverage:** ≥ 70% · **Verify:** `npm run test -- --coverage DriverAssignPanel`

## Kiểm tra Integration (BẮT BUỘC)
- [ ] Gán tài xế cho 1 đơn mới → dữ liệu lưu thật, list 配送管理 cập nhật
- [ ] Mở đơn có 発送予定日 cách hiện tại ≥ 7 ngày → nút `編集` mờ
- [ ] Gõ tên trong dropdown → danh sách lọc đúng

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Gán tài xế cũ | `DeliveryStatusDetailForm.tsx` | Sau khi chuyển sang panel mới, chức năng cũ bị gỡ sạch, không còn 2 nơi gán |
| Tab 配送概要 | `OverviewTab.tsx` | Panel nằm ngoài tab, hiển thị ở mọi tab như Figma |

## Không được làm
- Không tự tính rule 7 ngày ở FE — luôn dùng `editLock` từ BE
- Không dùng `useMutation` trực tiếp
- Không cho phép gán khi nút đang disabled (kể cả qua devtools — BE vẫn chặn)

## Definition of Done
- [ ] Build · Lint · Type-check · Unit Tests pass
- [ ] Integration check pass · Non-Regression verify đủ
- [ ] Actual Hour · Status → `Done` → `Reviewing`
