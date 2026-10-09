# [FE] [Delivery_Web] — 配送管理: filter enum (温度帯/自販機/配送方法) + sắp xếp + đồng bộ URL

## Backlog Info
- **Issue Type:** Task · **Category:** Delivery_Web
- **Parent Issue:** Delivery Partner P2 — 配送管理
- **Version:** _TBD_ · **Milestone:** _TBD_
- **Estimate Hour:** 5h · **Actual Hour:** — · **Status:** Open

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 3 — Frontend |
| Repo | `es-kitchen-web-outsource-web-private` |
| Depends on | **task-2-13 (BE)**, task-3-16 |
| Song song với | task-3-18 |
| Estimate | ~5h |

## Mục tiêu
Bổ sung 3 dropdown enum và nút sắp xếp `配送日（着）`, đồng thời đưa toàn bộ filter lên URL để chia sẻ link được.

## Context (đọc trước khi code)
- **Figma:** node **`31498:193284`** — hàng 3 (4 dropdown) + nút sort góc phải
- **Design-Technical.md (FE)** → FE-18; **BE task:** `task-2-13.md`
- `src/enums/` — enum FE hiện có; **đồng bộ giá trị với `commons/enums` của BE**

## API Definition (copy từ BE task-2-13)
| Param | Giá trị |
|---|---|
| `cargoType` | theo `CargoType` của BE |
| `deliveryMethod` | theo `DeliveryType` của BE |
| `vendingMachine` | **chỉ implement nếu BE task-2-13 xác nhận được nguồn dữ liệu** |
| `sortBy` / `order` | whitelist do BE quy định |

## Yêu cầu implement

### Step 3 — `DeliveryFilterBar.tsx` + `deliveryFilter.constants.ts`
- 4 dropdown: `荷物温度帯`, `配送状況`, `自販機`, `配送方法` (dropdown 配送状況 đã có → giữ)
- Nút sort hiển thị cột đang sắp xếp + chiều mũi tên; bấm đổi `order`
- Toàn bộ filter + sort ghi vào URL query; mount đọc lại từ URL
- Nếu BE bỏ `vendingMachine` khỏi scope → **ẩn dropdown đó** và ghi chú trong PR (không để dropdown chết)

## Unit Tests (BẮT BUỘC)
```typescript
it('sends the selected enum values as query params', ...);
it('toggles the sort order and sends sortBy/order', ...);
it('restores all filters from the URL on mount', ...);
it('hides the vending machine dropdown when the option list is empty', ...);
```
**Coverage:** ≥ 70% · **Verify:** `npm run test -- --coverage DeliveryFilterBar`

## Kiểm tra Integration (BẮT BUỘC)
- [ ] Chọn 温度帯 `冷凍` → chỉ còn đơn đông lạnh
- [ ] Bấm sort → thứ tự đảo, gọi API với `order` đúng
- [ ] Copy URL có filter mở tab mới → list giữ nguyên điều kiện

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Filter từ khoá (task-3-16) | `DeliveryFilterBar.tsx` | Test suite task-3-16 pass |
| Sort mặc định | `DeliveryStatusPage.tsx` | Không chọn sort → thứ tự như trước |

## Không được làm
- Không tự định nghĩa giá trị enum không có ở BE
- Không giữ filter trong Redux

## Definition of Done
- [ ] Build · Lint · Type-check · Unit Tests pass
- [ ] Integration check pass · Non-Regression verify đủ · Actual Hour · Status → `Done` → `Reviewing`
