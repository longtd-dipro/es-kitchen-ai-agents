# 配送関連 — API 設計 (Deliverer / Shipment)

> **Chỉ chứa thiết kế API** (danh sách endpoint theo màn). Phần DB / adequacy / quyết định nghiệp vụ: xem **`DB変更提案_配送関連.md`**. Đặc tả DTO / request / response chi tiết: xem **`API仕様詳細_配送関連.md`**.

## Quy ước
- **Admin**: prefix `/admin/...`, `AdminGuard` + RBAC.
- **Portal Deliverer**: prefix `/deliverer/...`, `DelivererGuard` — **mọi query ép `deliverer_id = me.id`**, mọi `:id` kiểm tra thuộc về mình (404 nếu không).
- List chuẩn: `?page=&limit=&order=&orderBy=` → `{ items, total, page, limit, totalPages }`.
- Lỗi chuẩn: 400 (validation) · 401 · 403 (sai scope) · 404 (không thuộc về mình) · 409 (xung đột trạng thái).

---

# A. PORTAL DELIVERER

## A1. お知らせ — OW_ANNO_001 / 002
| Method | Path | Query/Body | Response → UI |
|---|---|---|---|
| GET | `/deliverer/notifications` | `category=IMPORTANT\|INFO` (trống=すべて), page | `items[]: { id, title, category, content, links[], isRead, createdAt }` |
| GET | `/deliverer/notifications/:id` | — | full `content` + `links[]`; **auto set isRead=true** |
| GET | `/deliverer/notifications/unread-count` | — | `{ count }` |

## A2. 配送状況 — OW_DLVR_001 / 002
| Method | Path | Query/Body | Ghi chú |
|---|---|---|---|
| GET | `/deliverer/shipments` | `shipmentNo, scheduledSendDateFrom/To(出荷予定日), deliveryDateFrom/To(配送日), transitPointId(中継先), companyId(配送先), status`, page | list 事前配送状況 |
| GET | `/deliverer/shipments/:id` | — | detail read-only: 納品先 / 中継先 / 荷物(trackingNos[]) / 報告 |
| GET | `/deliverer/shipments/:id/assignable-drivers` | — | drivers của me (ACTIVE & APPROVED) cho dropdown |
| PATCH | `/deliverer/shipments/:id/assign-driver` | `{ driverId }` | DLVR_002 保存 — thao tác ghi DUY NHẤT |

## A3. 集金額 — OW_CLCT_001 / 002
| Method | Path | Query/Body | Ghi chú |
|---|---|---|---|
| GET | `/deliverer/collection-reports` | `driverId, dateFrom/dateTo(発送日)`, page | OW_CLCT_001 list |
| GET | `/deliverer/collection-reports/summary` | `month=YYYY-MM` | OW_CLCT_002 — cards (集金合計/駐車場料金合計) + list |
| GET | `/deliverer/collection-reports/:id` | — | detail (xem) |
| GET | `/deliverer/collection-reports/export` | filter hiện tại | CSV (UTF-8+BOM) |
| GET | `/deliverer/collection-reports/report` | `month` | レポート Excel `.xlsx` |

## A4. 配送スタッフ — OW_STAF_001 / 003 / 004
| Method | Path | Body | Ghi chú |
|---|---|---|---|
| GET | `/deliverer/drivers` | `q, type, approvalStatus`, sort, page | OW_STAF_001 list (scope me) |
| GET | `/deliverer/drivers/:id` | — | OW_STAF_003 detail (基本情報 + 担当者) |
| POST | `/deliverer/drivers` | password, email(liên hệ), driverName, nameKana, type, phone, deliveryArea, deliveryLocation, approvalStatus, licenseImageUrl | OW_STAF_004 — **ép deliverer_id=me**; driverCode(login) sinh seq |
| PATCH | `/deliverer/drivers/:id` | partial | OW_STAF_003 編集 |
| DELETE | `/deliverer/drivers/:id` | — | soft delete (INACTIVE trước) |
| POST | `/deliverer/drivers/:id/send-password` | — | パスワード送信 |

---

# B. ADMIN

## B1. 配送スタッフ master — MD01 / MD02
| Method | Path | Body/Query | Ghi chú |
|---|---|---|---|
| GET | `/admin/drivers` | `q, delivererId, type, approvalStatus, status`, sort, page | MD01 list |
| GET | `/admin/drivers/:id` | — | MD02 detail (tab 基本情報) |
| GET | `/admin/drivers/:id/history` | page, limit | MD02 tab 変更履歴 |
| POST | `/admin/drivers` | như portal create + **`delivererId` required** | |
| PATCH | `/admin/drivers/:id` | partial | |
| DELETE | `/admin/drivers/:id` | — | soft delete (INACTIVE trước) |
| POST | `/admin/drivers/:id/send-password` | — | パスワード送信 |

## B2. 【惣菜】出荷配送 — MP01 / MP02
| Method | Path | Body/Query | Ghi chú |
|---|---|---|---|
| GET | `/admin/shipments` | `shipmentNo, scheduledSendDateFrom/To, deliveryDateFrom/To, pickingDate, transitPointId, companyId, status`, sort, page | MP01 list |
| POST | `/admin/shipments` | shipment fields (`shipmentNo` server sinh seq) | MP01 新規登録 (source=MANUAL) |
| GET | `/admin/shipments/:id` | — | MP02 detail 7 khối: 法人 / オーダー / 配送 / 配送元 / 納品先 / 荷主 / 配送状況 |
| PATCH | `/admin/shipments/:id` | partial (không đổi shipmentNo) | MP02 編集 |
| DELETE | `/admin/shipments/:id` | — | MP02 削除 |
| PATCH | `/admin/shipments/:id/assign-driver` | `{ driverId?, deliveryMode, carrierId? }` | INTERNAL_DRIVER → driverId; THIRD_PARTY_CARRIER → carrierId |

---

# C. RBAC (permission keys — endpoint admin)
`shipment.view` · `shipment.create` · `shipment.update` · `shipment.delete` · `shipment.assign_driver` · `driver.view` · `driver.create` · `driver.update` · `driver.delete` · `driver.view_history`.
Portal deliverer dùng `DelivererGuard` (không qua RBAC admin).

---

# D. 委託配送先 (Deliverer master) — CHƯA THIẾT KẾ (gap, cần BA + design bổ sung)

> ⚠️ Cụm màn 委託配送先 (Admin) **có mockup nhưng chưa có API/DB spec** trong tài liệu này. KHÔNG được tự đoán — phần dưới chỉ liệt kê screen + field nhìn thấy trên mock để chốt với BA trước khi thiết kế. Mockup: [`DA_委託配送先.html`](./admin/DA_委託配送先.html) (list) · [`DA_委託配送先_edit.html`](./admin/DA_委託配送先_edit.html) (edit) · [`DA_委託配送先_アカウント発行確認.html`](./admin/DA_委託配送先_アカウント発行確認.html) (popup phát hành) · [`AW_CONS_009_配送関連.html`](./admin/AW_CONS_009_配送関連.html) (tab **ES配送費**) · [`AW_CONS_010_配送関連.html`](./admin/AW_CONS_010_配送関連.html) (tab **変更履歴**).

| Màn / tab | Endpoint dự kiến (CHƯA chốt) | Trạng thái |
|---|---|---|
| List 委託配送先 | `GET /admin/deliverers` | ❌ Chưa thiết kế (entity `deliverers` đã merge — xem DB変更提案 D1) |
| Detail / 基本情報 | `GET /admin/deliverers/:id` | ❌ Chưa thiết kế |
| Create / Edit | `POST` / `PATCH /admin/deliverers/:id` | ❌ Chưa thiết kế (field 基本情報 lấy từ cột merge của `deliverers`) |
| Phát hành account | `POST /admin/deliverers/.../accounts/issue` (?) | ❌ Chưa thiết kế (tham chiếu pattern 仕入先 `accounts/issue` + 配送スタッフ create) |
| **ES配送費** (tab) | — | 🔴 **Thiếu cả DB lẫn API** — xem **§D.1** |
| **変更履歴** (tab) | `GET /admin/deliverers/:id/history` | 🔴 Thiếu bảng `deliverer_history_logs` — xem DB変更提案 (G9 mới chỉ có `driver_history_logs`) |

## D.1 ES配送費 — bảng phí giao hàng theo vùng (gap nghiêm trọng)

Tab **ES配送費** trên màn edit (`AW_CONS_009`) là một **bảng master phí theo vùng × plan**, mỗi dòng gồm:

| Cột UI | Ghi chú |
|---|---|
| 都道府県名 / 市郡名 / 区町村名 | địa chỉ vùng (3 cấp) |
| 類似住所有無 | cờ 有/無 |
| 料金 | phí cơ bản |
| 地域加算 50プラン | phụ phí vùng cho plan 50 |
| 地域加算 100〜600プラン | phụ phí vùng cho plan 100–600 |
| お客様向け請求料金 | phí xuất hoá đơn cho khách |
| 備考欄 | ghi chú |

Thao tác trên mock: filter (都道府県/市郡/区町村/類似住所有無) · 検索 · クリア · 行を追加 · 保存.

**Chưa có:** (1) bảng DB nào lưu fee theo vùng/plan (DB変更提案 D1 merge `deliverers` KHÔNG có cột phí); (2) endpoint list/search/save fee; (3) định nghĩa "plan 50 / 100〜600" và cách tính 地域加算 vs 請求料金.

**Cần BA chốt trước khi thiết kế:** cấu trúc plan, công thức 地域加算/請求料金, quy tắc 類似住所, nguồn danh mục vùng (master nào). → đưa vào **Còn mở** của `DB変更提案_配送関連.md`.
