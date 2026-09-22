# [FE] [Delivery_Web] — 集金・駐車: cột 駐車合計料金 + xuất CSV

## Backlog Info
- **Issue Type:** Task · **Category:** Delivery_Web
- **Parent Issue:** Delivery Partner P2 — 集金・駐車
- **Version:** _TBD_ · **Milestone:** _TBD_
- **Estimate Hour:** 8h · **Actual Hour:** — · **Status:** Open

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 3 — Frontend |
| Repo | `es-kitchen-web-outsource-web-private` |
| Depends on | **task-2-10 (BE)** |
| Song song với | task-3-22 |
| Estimate | ~8h |

## Mục tiêu
Cập nhật màn 集金管理 theo Figma: 2 ô tổng (集金 + 駐車), cột 駐車合計料金, tìm theo nhân viên + khoảng ngày, nút `CSV出力`.

## Context (đọc trước khi code)

### 🎨 Figma
- **Screen Code:** `OW_CLCT_001` · node **`31498:192123`**
- Note tên file: node `31498:194115` · Note cột CSV: node `31498:194116`

### 🏗️ Tech Lead output
- **Design-Technical.md (FE)** → FE-09
- **BE task:** `task-2-10.md` → `parkingTotal`, `grandTotal`, CSV mới

### 📂 File liên quan
- `src/pages/collection-reports/BillPage.tsx`, `components/billColumns.tsx`, `BillFilterBar.tsx`, `BillSummaryBanner.tsx`
- `src/services/http/axios.instance.ts` — kiểm tra `Content-Disposition` có được expose không

## API Definition (copy từ BE task-2-10)
| Method | Endpoint | Request | Response |
|---|---|---|---|
| GET | `/collection-reports` | `?driverId&dateFrom&dateTo&page&limit` | `{ items[], grandTotal: { collected, parking }, total, page, limit, totalPages }` |
| GET | `/collection-reports/export` | filter hiện tại | **blob CSV** (UTF-8 BOM), tên file trong `Content-Disposition` |

`items[]`: `{ driverId, driverCode, driverName, collectedTotal, parkingTotal }`

## Yêu cầu implement

### Step 1 — `collection-report.service.ts`
```typescript
export const exportCollectionCsv = async (params) =>
  API.get(APIs.EXPORT, params, { responseType: 'blob' });   // trả cả headers để đọc filename
```
### Step 2 — `hooks/useCollectionReports.ts`: thêm `useExportCollectionCsv()` (`useMutationCustom`)
### Step 3 — UI
- `BillSummaryBanner`: 2 ô `集金合計金額` · `駐車合計料金`
- `billColumns`: `No · 配送スタッフID · 配送スタッフ名 (link) · 集金合計金額 · 駐車合計料金` (số căn phải, có dấu phân cách nghìn)
- `BillFilterBar`: khoảng ngày + ô `配送スタッフID・名` + `クリア` / `検索`
- Nút `CSV出力` góc phải header:
  - tải blob, lấy tên file từ `Content-Disposition` (**không tự ghép ở FE**)
  - đang tải → disable nút + spinner
  - lỗi → hiển thị message, không tải file rỗng

## Unit Tests (BẮT BUỘC)
```typescript
it('renders both summary totals', ...);
it('formats amounts with thousand separators', ...);
it('requests the export with the current filter params', ...);
it('uses the filename from Content-Disposition', ...);
it('disables the export button while downloading', ...);
```
**Coverage:** ≥ 70% · **Verify:** `npm run test -- --coverage collection`

## Kiểm tra Integration (BẮT BUỘC)
- [ ] Lọc 1 khoảng ngày thật → 2 ô tổng khớp dữ liệu bảng
- [ ] Bấm `CSV出力` → file tải về có tên `集金管理_...csv`, mở bằng Excel JP không lỗi font
- [ ] Bấm tên nhân viên → sang tab 担当配送情報 (task-3-23)

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Màn 集金額 cũ | `BillPage.tsx` | Phân trang + link chi tiết vẫn chạy |
| `BillDetailPage` | `BillDetailPage.tsx` | Mở chi tiết vẫn hiển thị đủ |
| Export cũ | — | ⚠️ Cột CSV đổi — đảm bảo PM đã duyệt (BE task-2-10) |

## Không được làm
- Không tự ghép tên file CSV ở FE
- Không tự chuyển encoding blob
- Không tính tổng từ trang hiện tại

## Definition of Done
- [ ] Step 1/2/3 hoàn tất · Build · Lint · Type-check · Unit Tests pass
- [ ] Integration check pass · Non-Regression verify đủ · Actual Hour · Status → `Done` → `Reviewing`
