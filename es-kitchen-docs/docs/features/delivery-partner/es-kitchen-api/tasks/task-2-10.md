# [BE] [Delivery_Web] — 集金・駐車: tổng phí đỗ xe + chuẩn hoá CSV

## Backlog Info
- **Issue Type:** Task · **Category:** Delivery_Web
- **Parent Issue:** Delivery Partner P2 — 集金・駐車
- **Version:** _TBD_ · **Milestone:** _TBD_
- **Estimate Hour:** 6h · **Actual Hour:** — · **Status:** Open

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 2 — Service + API |
| Repo | `es-kitchen-api` |
| Depends on | none |
| Song song với | task-2-7 |
| Estimate | ~6h |

## Mục tiêu
Thêm `駐車合計料金` vào list response và đổi CSV export sang 7 cột + quy tắc tên file của Figma.

## Context (đọc trước khi code)
- **Design-Technical.md** → §4 BE-07 (bảng so sánh cột hiện tại vs Figma), §8 R6
- **Figma-Analysis.md** → §2.5, node `31498:192123`, note `31498:194115` (tên file) và `31498:194116` (cột)
- `src/modules/deliverer/services/deliverer-collection-report.service.ts` — `buildCsvBuffer()` đã có, **đã xuất UTF-8 BOM** → giữ nguyên encoding
- `src/modules/deliverer/http/responses/deliverer-collection-report.response.ts` — `summary` đã có `totalParkingFee`, list thì chưa

## Yêu cầu implement

### Sửa: `deliverer-collection-report.service.ts`
```typescript
// 1. list(): thêm parkingTotal cho mỗi dòng (SUM parking_fee theo driver trong khoảng lọc)
//            thêm grandTotal { collected, parking } cho banner summary trên màn list
// 2. buildCsvBuffer(): đổi headers thành
//    ['配送日','配送ID','配送スタッフID','配送スタッフ名','配送先名','集金金額','駐車料金']
//    → 1 dòng = 1 配送 (không phải 1 dòng = 1 staff)
// 3. buildFilename(from, to, staffCond): 集金管理_{YYYYMMDD}-{YYYYMMDD}_{staffCond}_{YYYYMMDDHHmmss}.csv
//    staffCond = '全配送スタッフ' khi không lọc; ngược lại = tên hoặc ID tài xế đã lọc
//    → sanitize staffCond: bỏ ký tự không hợp lệ cho tên file
// GIỮ NGUYÊN: BOM EF BB BF, Content-Type, cách set Content-Disposition
```

## Unit Tests (BẮT BUỘC)
```typescript
it('should emit exactly the 7 Figma columns in order', ...);
it('should keep the UTF-8 BOM at the head of the buffer', ...);
it('should build filename 集金管理_20260818-20260831_全配送スタッフ_<ts>.csv when no staff filter', ...);
it('should use the staff name in the filename when filtered', ...);
it('should escape values containing comma or quote', ...);
it('should return parkingTotal per row in the list response', ...);
```
**Coverage:** service ≥ 80% · **Verify:** `npm run test -- collection-report`

## API Definition
| Method | Endpoint | Thay đổi |
|---|---|---|
| GET | `/deliverer/collection-reports` | thêm `parkingTotal` mỗi dòng + `grandTotal { collected, parking }` |
| GET | `/deliverer/collection-reports/summary` | không đổi (đã có `totalParkingFee`) |
| GET | `/deliverer/collection-reports/export` | 7 cột mới + tên file mới, encoding giữ UTF-8 BOM |

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| **Vận hành đang dùng file CSV cũ** | — | ⚠️ Đổi cột là **breaking change** — PM phải xác nhận trước khi merge (§8 R6) |
| `/collection-reports/report` (.csv theo tháng) | cùng service | Quyết định rõ: report có đổi cột theo không? Nếu không → tách hàm build riêng |
| Màn 集金額 FE hiện tại | FE `BillPage.tsx` | List cũ vẫn load, không lỗi field thiếu |

## Không được làm
- Không đổi encoding (đang đúng UTF-8 BOM)
- Không tự ý đổi cột của `/report` khi chưa hỏi PM
- Không ghép tên file ở FE — BE set qua `Content-Disposition`

## Definition of Done
- [ ] Build · Lint · Unit Tests pass
- [ ] Xác nhận của PM về đổi cột CSV được ghi trong PR
- [ ] API Definition điền đủ — FE bắt đầu được task-3-25
- [ ] Non-Regression verify đủ · Actual Hour · Status → `Done` → `Reviewing`
