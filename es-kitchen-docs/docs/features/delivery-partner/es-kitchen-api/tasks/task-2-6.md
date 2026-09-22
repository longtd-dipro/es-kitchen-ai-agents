# [BE] [Delivery_Web] — 配送詳細: khối 陳列結果確認, 添付資料 và khoá chỉnh sửa

## Backlog Info
- **Issue Type:** Task · **Category:** Delivery_Web
- **Parent Issue:** Delivery Partner P2 — 配送管理
- **Version:** _TBD_ · **Milestone:** _TBD_
- **Estimate Hour:** 7h · **Actual Hour:** — · **Status:** Open

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 2 — Service + API |
| Repo | `es-kitchen-api` |
| Depends on | task-2-5 |
| Song song với | task-2-7 |
| Estimate | ~7h |

## Mục tiêu
Hoàn thiện response 配送詳細: khối `display` (陳列結果確認), khối `attachments` (駐車報告 + 集金報告) và cờ `editLock` để FE khoá nút 編集.

## Context (đọc trước khi code)
- **Design-Technical.md** → §4 BE-04, §5 `canEditDriver()`, §7.2
- **Figma-Analysis.md** → §2.4, node `31498:193469` (実績), `31498:193742` (添付資料), `31498:190870` (state 編集 disabled), note `31498:194738`
- `src/entities/shipment-detail.entity.ts` — `quantity` (予定数), `actual_quantity` (実際数)
- `src/entities/delivery-report.entity.ts` — `parking_fee`, `parking_fee_receipt_photo_urls`, `expected_amount`, `collected_amount`, `difference`

## Yêu cầu implement

### Sửa: `delivery-block.service.ts`
```typescript
// display: từ shipment_details của block
//   plannedQty = quantity, actualQty = actual_quantity, diffQty = quantity - (actual_quantity ?? 0)
//   display = null khi không có shipment_detail nào có actual_quantity
// attachments: parking { fee, receiptUrls }, collection { expectedAmount, collectedAmount, difference }

private canEditDriver(block): { canEditDriver: boolean; reason: string | null } {
  // diffDays(today, block.scheduledSendDate) >= 7 → { false, 'LOCKED_AFTER_7_DAYS' }
  // ⚠️ [PENDING Q4] mốc tính (発送予定日 vs 配送日（着）) CHƯA được PM xác nhận.
  //    Hiện dùng scheduledSendDate theo state Figma node 31498:190870.
  //    Đặt hằng số LOCK_AFTER_DAYS = 7 ở 1 chỗ để đổi nhanh khi có quyết định.
}
```

### Sửa: `PATCH /deliverer/delivery-blocks/:id/assign-driver`
Gọi lại `canEditDriver()` trước khi ghi; vi phạm → `409` với code `SHIPMENT_EDIT_LOCKED`.
→ **BE chặn thật**, không chỉ dựa vào FE disable.

## Unit Tests (BẮT BUỘC)
```typescript
it('should compute diffQty as planned minus actual', ...);
it('should return display=null when no shipment detail has actual_quantity', ...);
it('should expose parking fee and receipt urls from delivery_reports', ...);
it('should lock editing when scheduledSendDate is 7+ days in the past', ...);
it('should allow editing at exactly 6 days', ...);          // biên
it('should reject assign-driver with 409 when locked', ...); // chống bypass FE
```
**Coverage:** ≥ 80% · **Verify:** `npm run test -- delivery-block`

## API Definition
| Method | Endpoint | Field thêm |
|---|---|---|
| GET | `/deliverer/delivery-blocks/:id` | `display`, `attachments`, `editLock` |
| PATCH | `/deliverer/delivery-blocks/:id/assign-driver` | thêm error `409 SHIPMENT_EDIT_LOCKED` |

```
display: { plannedTotal, actualTotal, diffTotal,
           items: Array<{ no, productCode, productName, category, photoUrl, plannedQty, actualQty, diffQty }> } | null
attachments: { parking: { fee, receiptUrls[] },
               collection: { expectedAmount, collectedAmount, difference } }
editLock: { canEditDriver: boolean, reason: 'LOCKED_AFTER_7_DAYS' | null }
```

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Gán tài xế phía Admin | `src/modules/admin/delivery/...` | Rule khoá **chỉ đặt trong service deliverer**; admin vẫn gán được đơn cũ |
| Gán tài xế hiện tại của portal | `delivery-block.service.ts` | Đơn trong 7 ngày vẫn gán bình thường |
| Response task-2-5 | `delivery-block-detail.response.ts` | Khối `disposal` không bị ảnh hưởng |

## Không được làm
- Không đặt rule khoá vào service dùng chung với admin (§8 R2)
- Không hard-code số 7 rải rác — 1 hằng số duy nhất
- Không đổi field cũ của response

## Definition of Done
- [ ] Build · Lint · Unit Tests pass (có test biên 6/7 ngày)
- [ ] API Definition điền đủ — FE bắt đầu được task-3-12, task-3-14, task-3-15
- [ ] Ghi chú `[PENDING Q4]` trong PR description
- [ ] Non-Regression verify đủ · Actual Hour · Status → `Done` → `Reviewing`
