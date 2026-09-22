# [FE] [Delivery_Web] — 配送管理: bộ lọc nâng cao phần từ khoá + thu gọn

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
| Depends on | **task-2-12 (BE)** |
| Song song với | task-3-17 |
| Estimate | ~5h |

## Mục tiêu
Mở rộng `DeliveryFilterBar`: khoảng ngày + radio loại ngày, 4 ô từ khoá mới, nút thu gọn/mở rộng, `クリア` / `検索`.

## Context (đọc trước khi code)
- **Figma:** node **`31498:193284`** (bộ lọc mở rộng đầy đủ)
- **Design-Technical.md (FE)** → FE-18; **BE task:** `task-2-12.md`
- `src/pages/delivery-status/components/DeliveryFilterBar.tsx` + `deliveryFilter.constants.ts`

## API Definition (copy từ BE task-2-12)
| Method | Endpoint | Param |
|---|---|---|
| GET | `/delivery-blocks` | đã có: `shipmentNo`, `scheduledSendDateFrom/To`, `deliveryDateFrom/To`, `transitPointId`, `status`, `page`, `limit`, `sortBy`, `order` · thêm: `branchKeyword`, `addressKeyword`, `origin`, `trackingOrStaffKeyword` |

## Yêu cầu implement

### Step 1/2 — mở rộng type params của `delivery.service.ts` + `useDeliveries`
### Step 3 — `DeliveryFilterBar.tsx`
- Hàng 1: khoảng ngày `from ~ to` + **radio chọn loại ngày** `配送日（着）` / `発送予定日`
  → radio **chỉ quyết định điền vào cặp param nào** (`deliveryDateFrom/To` hay `scheduledSendDateFrom/To`) — không gửi param `dateType`
- Hàng 2: `拠点ID・名` (`branchKeyword`), `配送先住所、郵便番号、電話番号、担当者電話番号` (`addressKeyword`)
- Hàng 4: `配送元` (`origin`), `送り状番号、配送スタッフID、配送スタッフ名` (`trackingOrStaffKeyword`)
- Nút mũi tên thu gọn/mở rộng (mặc định mở như Figma)
- `クリア` xoá hết filter, giữ `page=1`

## Unit Tests (BẮT BUỘC)
```typescript
it('maps the date radio to deliveryDate* or scheduledSendDate* params', ...);
it('does not send a dateType param', ...);
it('submits the four new keyword params', ...);
it('collapses and expands the filter body', ...);
it('resets every filter on クリア', ...);
```
**Coverage:** ≥ 70% · **Verify:** `npm run test -- --coverage DeliveryFilterBar`

## Kiểm tra Integration (BẮT BUỘC)
- [ ] Lọc theo địa chỉ thật → danh sách thu hẹp đúng
- [ ] Đổi radio loại ngày → kết quả đổi tương ứng
- [ ] `クリア` trả list về trạng thái ban đầu

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Filter cũ | `DeliveryFilterBar.tsx` | `shipmentNo` / ngày / status vẫn lọc đúng |
| Phân trang | `DeliveryStatusPage.tsx` | Đổi filter → về trang 1, không giữ trang cũ |

## Không được làm
- Không thêm param `dateType`
- Không đổi tên param cũ

## Definition of Done
- [ ] Build · Lint · Type-check · Unit Tests pass
- [ ] Integration check pass · Non-Regression verify đủ
- [ ] Actual Hour · Status → `Done` → `Reviewing`
