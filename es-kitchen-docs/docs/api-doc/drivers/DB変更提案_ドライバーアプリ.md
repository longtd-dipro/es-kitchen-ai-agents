# ドライバーアプリ — DB適合性レビュー & 変更提案 (Driver App / E06)

> Tài liệu **DB / quyết định nghiệp vụ** (KHÔNG chứa đặc tả API — xem [`API設計_ドライバーアプリ.md`](./API設計_ドライバーアプリ.md) + [`apis/`](./apis/README.md)).
> Giai đoạn THIẾT KẾ. Mục tiêu: schema `database/db.dbml` (dòng **1674–1844**, ~10 bảng giao/nhận) đã đủ dựng UI app tài xế chưa? chỗ nào TBD / cần chốt?
> Phạm vi UI: `dashboard/` · `delivery-list/` · `warehouse/` · `es-delivery/` · `cool-driver/` · `trouble-report/`.

## Quyết định kiến trúc đã chốt
1. Phạm vi: **App tài xế (`/driver`)** — đối xứng chiều giao với Deliverer/Admin (`../deliverer/`).
2. **`deliveryId` = `shipment_companies.id`** (1 delivery = 1 lần giao cho 1 công ty). **`receiptId` = `id` điểm nhận** (kho / 中継).
3. Resource `/driver/deliveries/:id` **dùng chung** COOL + ES — phân nhánh theo `shipmentType` (mỗi id chỉ 1 loại).
4. Cờ "delivery đã giao" = **`delivery_completion_reports.submitted_at != null`** (`deliveryStatus=DELIVERED`), **không** dựa `shipments.status` (cấp chuyến).
5. Quản lý ảnh: **presigned S3** (`/files/*`), endpoint bước chỉ nhận **mảng URL**.

---

# 1. KẾT LUẬN DB ADEQUACY (theo domain)

| Domain (màn) | Bảng chính | Đủ? | Ghi chú |
|---|---|---|---|
| ダッシュボード (DA_HOME) | `shipments` + `shipment_companies` + `delivery_completion_reports` | ✅ Đủ | KPI/progress = aggregate; `deliveryStatus` suy ra (DELIVERED ⇐ submitted_at, TROUBLE ⇐ trouble report). Không có cột status cấp công ty, không có `DELIVERING` |
| 配送一覧 (DA_LIST_00) | `shipments` + `shipment_companies` + `shipment_cargo_boxes` | ✅ Đủ | `tabCounts` = aggregate; đếm 箱/品 dẫn xuất theo `cargo_type` |
| 荷物受取 (DA_RECV_001/003) | điểm nhận (kho/中継) + `shipment_cargo_boxes` | ⚠️ Cần chốt nguồn | "receipt" là **aggregate** — nguồn key `receiptId` chưa rõ là bảng nào (G10). 伝票番号 placement TBD (G9) |
| ES配送便 wizard (DA_ESDL) | `shipment_companies` + `shipment_cargo_boxes` + `shipment_details` + `inventory_checks` + `inventory_check_items` + `disposal_report_items` + `delivery_completion_reports` + `shipment_status_histories` | ⚠️ Gần đủ | Thiếu/TBD: 確認 checkbox (G1), 次回納品日 (G2), logical_stock seed (G3), event cấp công ty (G4), ARRIVED trigger (G5), mốc khóa 7 ngày (G6) |
| COOL便 (DA_COOL_001) | `shipment_companies` + `shipment_cargo_boxes` + `delivery_completion_reports` | ✅ Đủ | One-shot; `PARTIALLY_DELIVERED` cần `esKitchenContacted` (G7) |
| トラブル報告 (DA_RPTD) | `trouble_reports` + `trouble_report_items` | ⚠️ Chưa đủ | Thiếu cột `es_kitchen_contacted` (G7); `report_no` seq (chốt) |
| Upload ảnh (Step 1/4, 駐車, トラブル) | module `file-upload` (S3 presigned) | ⚠️ Guard | `/files/*` gắn `AdminGuard` — cần mở Driver pool (G8) |

---

# 2. ĐIỂM DB CHƯA PHÙ HỢP — CẦN ĐỔI / CHỐT

> ⚠️ Bộ tài liệu raw đã grounding cẩn thận theo 10 bảng và **không bịa field**. Các gap dưới đây phần lớn là **TBD** (client-side / lookup ngoài phạm vi), **không** phải "bắt buộc thêm cột". Migration §6 chỉ là **đề xuất** khi quyết định persist.

| # | Gap | Màn liên quan | Đề xuất / Trạng thái |
|---|---|---|---|
| **G1** ❓ MỞ | `確認` checkbox (確認 mỗi dòng) **không có cột** trên `inventory_check_items` / `shipment_details` | DA_ESDL_002 (S2.8) · DA_ESDL_003 (S3.6) | Hiện **client-side** (chỉ phục vụ filter 未確認のみ表示). Nếu cần lưu → thêm `confirmed boolean` (đề xuất §6.2) |
| **G2** ❓ MỞ | `次回納品日` (`nextDeliveryDate`) **không có** trong 10 bảng | DA_ESDL_002 (S2.6) | Cần lookup chu kỳ giao (`delivery_cycles`?) bên ngoài — **chưa rõ nguồn** |
| **G3** ❓ MỞ | `理論在庫` (`logical_stock`) — cột **có sẵn** trên `inventory_check_items` nhưng **nguồn seed** (stock master tính tồn lý thuyết) nằm ngoài 10 bảng | DA_ESDL_002 (S2.9) | Xác nhận nguồn seed trước khi tính |
| **G4** ❓ MỞ | `shipment_status_histories` **không có** `shipment_company_id` → không quy event về đúng công ty ở cấp DB | ES wizard (lịch sử cấp công ty) | Tạm dựa `note`/thời điểm. Nếu cần lịch sử cấp công ty → thêm cột `shipment_company_id` (đề xuất §6.3) |
| **G5** ❓ MỞ | Enum `ARRIVED` (到着) **không có bước nào** trong wizard kích hoạt | `shipment_status_histories` | Xác nhận điểm phát event 到着 (hoặc bỏ khỏi luồng driver) |
| **G6** ❓ MỞ | Mốc khóa `LOCKED` ("編集可能：7日前まで") neo vào **ngày nào** | DA_ESDL_000 (editMode) | Phụ thuộc nguồn `nextDeliveryDate` (G2); xác nhận anchor (`scheduled_send_date` kỳ kế / `actual_delivery_date`) |
| **G7** ❓ MỞ | `esKitchenContacted` (đã liên hệ ES về phần chưa giao/nhận) **không có cột riêng** | DA_COOL partial · DA_RECV partial · DA_RPTD (C.6) | Tạm map `admin_note` hoặc bỏ qua. Nếu cần audit → thêm `es_kitchen_contacted boolean` (đề xuất §6.4) |
| **G8** 🔴 MỞ | `/files/*` (presigned upload) gắn **`AdminGuard`** — Driver không gọi được | Step 1/4, 駐車報告, トラブル報告 ảnh | **Mở cho Driver Cognito pool** hoặc thêm biến thể `/driver/uploads/*` cùng pattern. **Chặn triển khai upload** nếu chưa xử lý |
| **G9** ❓ MỞ | `伝票番号` (`slipNumber`, import free-format) **chưa render** ở mockup hiện tại | DA_RECV_001 (A.5) | Placement TBD — field đã có (`slipNumber` nullable), chỉ chờ vị trí UI |
| **G10** ❓ MỞ | Nguồn key của **"điểm nhận" (`receiptId`)** chưa rõ là bảng nào (aggregate kho/中継) | DA_RECV_001 · delivery-list Tab A · trouble-targets | Cần BA/Tech Lead xác nhận entity/aggregate backing receipt (warehouse master? relay? shipment grouped by location?) |

---

# 3. QUYẾT ĐỊNH NGHIỆP VỤ ĐÃ CHỐT (log)
- **`deliveryId`** = `shipment_companies.id`; **`receiptId`** = id điểm nhận; danh tính tài xế từ **Bearer token** (không nhận `driverId` body).
- **"Delivery đã giao"** = `delivery_completion_reports.submitted_at != null` → `deliveryStatus=DELIVERED` → biến mất khỏi `/delivery-list`. **Không** poll `shipments.status` cho 1 công ty.
- **`shipments.status`** cấp CHUYẾN: `ASSIGNED → IN_TRANSIT` (Step 1 lần đầu) → `COMPLETED` **chỉ khi** mọi `shipment_companies` anh em xong (`shipmentCompleted=true`).
- **`difference = actualStock − logicalStock`** (server tính, không nhận từ client). DB **không ràng buộc** `actual = logical − waste` → FE soft-validation. `廃棄数` lưu **riêng** ở `disposal_report_items.quantity`, tổng vào `disposal_total_quantity`.
- **`inspection_status`** (Step 3) server tự suy: `actual==quantity`→MATCHED · `<`→SHORTAGE · `>`→EXCESS. Kiện ES (棚入れ) → `shipment_cargo_boxes.inspection_status=CHECKED`.
- **Ảnh:** Step 1 → `pre_display_photo_urls` (jsonb); Step 4 → `post_display_photo_urls`; 駐車 → `parking_fee_receipt_photo_urls`; sự cố → `trouble_reports.photo_urls`. Tối đa 5 ảnh.
- **完了 toàn bộ/một phần:** Receipt FULL/PARTIAL đều set `receiptStatus=RECEIVED`; PARTIAL & COOL partial **bắt buộc** `esKitchenContacted=true`.
- **Trouble:** tạo `trouble_reports` (`status=PENDING`, `report_no=TR{seq}`, `submitted_at=now`) + N `trouble_report_items` (snapshot `tracking_no`); target → `TROUBLE` & bị khóa; 1 target chỉ 1 report mở (trùng → 409).
- **Resume wizard:** server tính `currentStep` = bước đầu tiên `submitted=false`; `POST .../complete` chặn nếu thiếu bước trước (400).

---

# 4. CÒN MỞ — CẦN BA / TECH LEAD CHỐT (không chặn schema lõi)
1. **G10 — nguồn "điểm nhận" (`receiptId`)**: entity/aggregate backing receipt (kho master / relay / shipment grouped). Ảnh hưởng `GET /driver/receipts/:id` và Tab A delivery-list.
2. **G2 + G6 — `nextDeliveryDate` & mốc khóa 7 ngày**: nguồn chu kỳ giao + ngày anchor.
3. **G3 — seed `logical_stock`**: master tính tồn lý thuyết.
4. **G1 / G4 / G7 — có persist hay không**: `confirmed`, `shipment_company_id` (history), `es_kitchen_contacted`. Hiện client-side/tạm bỏ; chỉ thêm cột khi nghiệp vụ yêu cầu audit.
5. **G5 — event `ARRIVED`**: điểm phát trong luồng driver (hoặc bỏ).
6. **G8 — quyền upload `/files/*`** cho Driver pool (chặn triển khai upload).
7. **G9 — vị trí UI `伝票番号`** (`slipNumber`).

---

# 5. DANH SÁCH THAY ĐỔI DB (tổng hợp — checklist)

> Schema **lõi đã đủ** cho luồng giao/nhận cơ bản (10 bảng `database/db.dbml` 1674–1844). Các mục dưới là **đề xuất theo gap**, phần lớn **chưa chốt** (đợi §4).

| # | Thay đổi | Trạng thái | Gap |
|---|---|---|---|
| 1 | Seq `trouble_report_no_seq` (`TR\d+`) cho `trouble_reports.report_no` | ✔ Chốt (nếu chưa có) | — |
| 2 | Quyền Driver pool cho `/files/*` (hoặc `/driver/uploads/*`) | 🔴 Cần xử lý | G8 |
| 3 | `inventory_check_items.confirmed boolean` | ⏸ Đề xuất (chưa chốt) | G1 |
| 4 | `shipment_status_histories.shipment_company_id bigint` | ⏸ Đề xuất (chưa chốt) | G4 |
| 5 | `delivery_completion_reports.es_kitchen_contacted boolean` (+ `trouble_reports`) | ⏸ Đề xuất (chưa chốt) | G7 |
| 6 | Index khuyến nghị (xem README §4.4) | ✔ Khuyến nghị | — |
| 7 | Xác nhận entity backing `receiptId` | ❓ Chờ BA | G10 |

---

# 6. MIGRATION SQL (DDL — PostgreSQL, **ĐỀ XUẤT**)

> ⚠️ Phần lớn là **đề xuất chưa chốt** (§4). **Dev KHÔNG tự chạy** — đề xuất với Tech Lead trước (POLICIES.md). Chỉ §6.1 là an toàn (nếu chưa tồn tại). §6.2–6.4 chỉ thêm khi nghiệp vụ chốt persist. Bọc trong 1 transaction; chạy DB DEV trước (`.claude/workflows/db-connect-dev.md`).

## 6.1 Seq cho trouble report_no (✔ nếu chưa có)
```sql
CREATE SEQUENCE IF NOT EXISTS trouble_report_no_seq START 1;
-- report_no = 'TR' || lpad(nextval('trouble_report_no_seq')::text, 9, '0'); sinh ở service khi tạo report.
```

## 6.2 G1 — `inventory_check_items.confirmed` (⏸ chỉ khi chốt persist checkbox 確認)
```sql
ALTER TABLE inventory_check_items ADD COLUMN confirmed boolean NOT NULL DEFAULT false;
-- Hiện 確認 là client-side (filter 未確認のみ表示). Chỉ thêm nếu cần lưu trạng thái đã xác nhận từng dòng.
```

## 6.3 G4 — `shipment_status_histories.shipment_company_id` (⏸ chỉ khi cần lịch sử cấp công ty)
```sql
ALTER TABLE shipment_status_histories
  ADD COLUMN shipment_company_id bigint REFERENCES shipment_companies(id);
CREATE INDEX idx_ssh_shipment_company ON shipment_status_histories (shipment_company_id, created_at);
-- Hiện event ở cấp CHUYẾN (shipments). Thêm cột này để quy event STARTED_DELIVERY/COMPLETED về đúng 1 công ty.
```

## 6.4 G7 — `es_kitchen_contacted` (⏸ chỉ khi cần audit liên hệ ES)
```sql
ALTER TABLE delivery_completion_reports ADD COLUMN es_kitchen_contacted boolean NOT NULL DEFAULT false;
ALTER TABLE trouble_reports            ADD COLUMN es_kitchen_contacted boolean NOT NULL DEFAULT false;
-- Hiện tạm map admin_note / bỏ qua. Thêm cột để lưu xác nhận "ESキッチンへ連絡済み" (COOL partial / receipt partial / trouble).
```

## 6.5 Index khuyến nghị (✔ khi viết migration thật)
```sql
CREATE INDEX IF NOT EXISTS idx_shipments_driver_send   ON shipments (driver_id, scheduled_send_date);
CREATE INDEX IF NOT EXISTS idx_shipments_status        ON shipments (status);
CREATE INDEX IF NOT EXISTS idx_ship_companies_shipment ON shipment_companies (shipment_id);
CREATE INDEX IF NOT EXISTS idx_ship_companies_company  ON shipment_companies (company_id);
CREATE INDEX IF NOT EXISTS idx_dcr_shipment_company    ON delivery_completion_reports (shipment_company_id);
CREATE INDEX IF NOT EXISTS idx_dcr_submitted_at        ON delivery_completion_reports (submitted_at);
CREATE INDEX IF NOT EXISTS idx_cargo_boxes_company     ON shipment_cargo_boxes (shipment_company_id, inspection_status);
CREATE INDEX IF NOT EXISTS idx_trouble_reports_shipment ON trouble_reports (shipment_id, status);
```

> **Rollback:** mỗi `CREATE`/`ADD COLUMN` có `DROP` tương ứng; `down()` đảo thứ tự (drop index → drop column → drop sequence). Backup trước khi chạy `up()`.

---

# 7. Liên kết
- Endpoint per màn → [`API設計_ドライバーアプリ.md`](./API設計_ドライバーアプリ.md)
- DTO / business rule / field mapping → [`apis/`](./apis/README.md) (mỗi contract file có section riêng "Business Rules" + "TBD / Schema gaps")
- Catalog + lifecycle + NFR → [`README.md`](./README.md)
- Schema nguồn (source of truth): `database/db.dbml` (dòng 1674–1844)
