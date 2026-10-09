# Delivery Partner P2 — Bảng task (46 task · 278h)

> Phân rã từ [Design-Technical BE](es-kitchen-api/Design-Technical.md) và [Design-Technical FE](es-kitchen-web-outsource-web-private/Design-Technical.md).
> **Chỉ phân rã phần KHÔNG bị chặn.** Các hạng mục chờ Q1/Q3/Q5/Q7 (36h BE + 54h FE = 90h) chưa tạo task — xem §4.
> Mỗi task 3–8h, có Unit Test bắt buộc, Non-Regression table và Definition of Done.

---

## 1. Tổng hợp

| Phase | Nội dung | Số task | Giờ |
|---|---|---|---|
| 1 | DB migration | 1 | 4h |
| 2 | BE — Service + API | 15 | 94h |
| 3 | FE — Màn hình | 28 | 168h |
| 4 | Integration test | 2 | 12h |
| **Tổng** | | **46** | **278h** |

---

## 2. Phase 1 + 2 — `es-kitchen-api`

| Task | Nội dung | Est | Depends on |
|---|---|---|---|
| [task-1-1](es-kitchen-api/tasks/task-1-1.md) | Migration `drivers.account_issued_at` | 4h | — |
| [task-2-1](es-kitchen-api/tasks/task-2-1.md) | Lịch tháng — endpoint + 件数 theo 温度帯 | 7h | — |
| [task-2-2](es-kitchen-api/tasks/task-2-2.md) | Lịch tháng — サイクル / 休止 / 臨時休業 | 5h | 2-1 |
| [task-2-3](es-kitchen-api/tasks/task-2-3.md) | Lịch tuần — danh sách điểm giao | 8h | 2-1 |
| [task-2-4](es-kitchen-api/tasks/task-2-4.md) | Tìm kiếm trên lịch (2 nhóm điều kiện) | 6h | 2-1, 2-3 |
| [task-2-5](es-kitchen-api/tasks/task-2-5.md) | 配送詳細 — khối 廃棄数確認 | 7h | — |
| [task-2-6](es-kitchen-api/tasks/task-2-6.md) | 配送詳細 — 陳列結果 + 添付資料 + khoá 7 ngày | 7h | 2-5 |
| [task-2-7](es-kitchen-api/tasks/task-2-7.md) | Danh sách driver — 免許 / アカウント状態 / sort | 8h | 1-1 |
| [task-2-8](es-kitchen-api/tasks/task-2-8.md) | Bulk phát hành tài khoản — service | 7h | 1-1 |
| [task-2-9](es-kitchen-api/tasks/task-2-9.md) | Bulk phát hành tài khoản — endpoint | 5h | 2-8 |
| [task-2-10](es-kitchen-api/tasks/task-2-10.md) | 集金・駐車 — parking total + CSV | 6h | — |
| [task-2-11](es-kitchen-api/tasks/task-2-11.md) | Dashboard overview | 8h | 2-1 |
| [task-2-12](es-kitchen-api/tasks/task-2-12.md) | 配送管理 — filter từ khoá | 5h | — |
| [task-2-13](es-kitchen-api/tasks/task-2-13.md) | 配送管理 — filter enum + sort | 5h | — |
| [task-2-14](es-kitchen-api/tasks/task-2-14.md) | assignable-drivers — search + 配送件数 | 4h | — |
| [task-2-15](es-kitchen-api/tasks/task-2-15.md) | Lịch sử thay đổi driver | 6h | — |

**Có thể chạy song song ngay từ đầu:** 2-1 · 2-5 · 2-10 · 2-12 · 2-13 · 2-14 · 2-15 (7 task, không phụ thuộc nhau).

---

## 3. Phase 3 — `es-kitchen-web-outsource-web-private`

| Task | Nội dung | Est | Depends on |
|---|---|---|---|
| [task-3-1](es-kitchen-web-outsource-web-private/tasks/task-3-1.md) | FileViewerModal — ảnh | 6h | — |
| [task-3-2](es-kitchen-web-outsource-web-private/tasks/task-3-2.md) | FileViewerModal — PDF + xoá | 4h | 3-1 |
| [task-3-3](es-kitchen-web-outsource-web-private/tasks/task-3-3.md) | Reset mật khẩu — countdown + rule | 4h | — |
| [task-3-4](es-kitchen-web-outsource-web-private/tasks/task-3-4.md) | Màn お知らせ詳細 | 4h | — |
| [task-3-5](es-kitchen-web-outsource-web-private/tasks/task-3-5.md) | Lịch tháng — service/hook/lưới | 7h | BE 2-1 |
| [task-3-6](es-kitchen-web-outsource-web-private/tasks/task-3-6.md) | Lịch tháng — ô ngày + 凡例 | 7h | 3-5, BE 2-2 |
| [task-3-7](es-kitchen-web-outsource-web-private/tasks/task-3-7.md) | Lịch — toolbar 月/週 + URL sync | 6h | 3-5 |
| [task-3-8](es-kitchen-web-outsource-web-private/tasks/task-3-8.md) | Lịch tuần — khung 7 cột | 6h | BE 2-3, 3-5 |
| [task-3-9](es-kitchen-web-outsource-web-private/tasks/task-3-9.md) | Lịch tuần — danh sách điểm giao | 6h | 3-8 |
| [task-3-10](es-kitchen-web-outsource-web-private/tasks/task-3-10.md) | Lịch — thanh tìm kiếm | 6h | BE 2-4, 3-5 |
| [task-3-11](es-kitchen-web-outsource-web-private/tasks/task-3-11.md) | 配送詳細 — tab hoá + 配送概要 | 7h | BE 2-5 |
| [task-3-12](es-kitchen-web-outsource-web-private/tasks/task-3-12.md) | 配送詳細 — panel gán tài xế + khoá | 7h | 3-11, BE 2-6, 2-14 |
| [task-3-13](es-kitchen-web-outsource-web-private/tasks/task-3-13.md) | Tab 実績 — 廃棄数確認 | 7h | 3-11, BE 2-5 |
| [task-3-14](es-kitchen-web-outsource-web-private/tasks/task-3-14.md) | Tab 実績 — 陳列結果確認 | 7h | 3-13, BE 2-6 |
| [task-3-15](es-kitchen-web-outsource-web-private/tasks/task-3-15.md) | Tab 添付資料 | 8h | 3-11, BE 2-6, 3-1 |
| [task-3-16](es-kitchen-web-outsource-web-private/tasks/task-3-16.md) | 配送管理 — filter từ khoá + thu gọn | 5h | BE 2-12 |
| [task-3-17](es-kitchen-web-outsource-web-private/tasks/task-3-17.md) | 配送管理 — filter enum + sort + URL | 5h | BE 2-13, 3-16 |
| [task-3-18](es-kitchen-web-outsource-web-private/tasks/task-3-18.md) | 配送スタッフ一覧 — 免許 + アカウント状態 | 6h | BE 2-7 |
| [task-3-19](es-kitchen-web-outsource-web-private/tasks/task-3-19.md) | 配送スタッフ一覧 — chọn nhiều + lọc + sort | 6h | 3-18 |
| [task-3-20](es-kitchen-web-outsource-web-private/tasks/task-3-20.md) | Modal bulk — xác nhận + loading | 7h | 3-19, BE 2-9 |
| [task-3-21](es-kitchen-web-outsource-web-private/tasks/task-3-21.md) | Modal bulk — kết quả + 再度実行 | 7h | 3-20 |
| [task-3-22](es-kitchen-web-outsource-web-private/tasks/task-3-22.md) | 配送スタッフ詳細 — 3 tab + 基本情報 | 5h | BE 2-7 |
| [task-3-23](es-kitchen-web-outsource-web-private/tasks/task-3-23.md) | 配送スタッフ詳細 — 担当配送情報 | 6h | 3-22, BE 2-12, 2-10 |
| [task-3-24](es-kitchen-web-outsource-web-private/tasks/task-3-24.md) | 配送スタッフ詳細 — 変更履歴 | 3h | 3-22, BE 2-15 |
| [task-3-25](es-kitchen-web-outsource-web-private/tasks/task-3-25.md) | 集金・駐車 — 駐車合計 + CSV | 8h | BE 2-10 |
| [task-3-26](es-kitchen-web-outsource-web-private/tasks/task-3-26.md) | ホーム — mini calendar | 7h | BE 2-11, 3-6 |
| [task-3-27](es-kitchen-web-outsource-web-private/tasks/task-3-27.md) | ホーム — お知らせ + 未回答見積 | 7h | 3-26, 3-4 |
| [task-3-28](es-kitchen-web-outsource-web-private/tasks/task-3-28.md) | Đồng bộ menu điều hướng | 4h | 3-26 (làm sau cùng) |

**Bắt đầu được ngay, không chờ BE:** 3-1 · 3-2 · 3-3 · 3-4 (18h).

## Phase 4

| Task | Nội dung | Est |
|---|---|---|
| [task-4-1](es-kitchen-api/tasks/task-4-1.md) | Integration cụm スケジュール + 配送管理 (11 kịch bản) | 6h |
| [task-4-2](es-kitchen-api/tasks/task-4-2.md) | Integration cụm 配送スタッフ + 集金 + ホーム (12 kịch bản) | 6h |

---

## 4. CHƯA phân rã — đang bị chặn (90h)

| Hạng mục | Repo | Est | Chặn bởi |
|---|---|---|---|
| BE-08 見積 金額再確認 + KPI | api | 10h | **Q7** |
| BE-09 配送対応情報 + đăng ký công khai | api | 8h | **Q1 / Q3** |
| BE-12 非公開資料 (CRUD + ACL) | api | 12h | **Q5** |
| M2 / M3 migration | api | 6h | **Q1 / Q3 / Q5** |
| FE-11 見積 KPI + 金額再確認 | web | 14h | **Q7** |
| FE-12 Form đăng ký step 2 | web | 14h | **Q1 / Q3** |
| FE-13 プロフィール 2 tab | web | 12h | **Q3** |
| FE-16 配送住所 + 非公開資料 | web | 14h | **Q5** |

Câu hỏi Q1–Q9 xem [Figma-Analysis.md §4](Figma-Analysis.md#4-câu-hỏi-chặn-cần-pmba-chốt).
Khi PM trả lời → tạo tiếp task `task-2-16…` và `task-3-29…` theo đúng đánh số hiện tại.

---

## 5. Lưu ý xuyên suốt cho Dev

- **API Contract Lock:** FE copy bảng `## API Definition` từ task BE tương ứng vào task của mình **trước khi code** — không tự đoán endpoint.
- **Không xoá code cũ giữa chừng:** `MonthlySummaryTab`, `WeeklyTimelineTab`, `/delivery-blocks/timeline`, `/summary`, `FeeAreaTab` — chỉ dọn sau khi bản mới pass QA (hoặc sau khi PM trả lời Q3).
- **`useMutationCustom`** là bắt buộc ở FE — không gọi `useMutation` trực tiếp.
- **ORDER_BY_MAP whitelist** là bắt buộc ở BE cho mọi `sortBy` — dự án đã có bug production vì bỏ qua.
- Sau mỗi task: chạy **Memory Update Gate** (api-catalog / erd / patterns) rồi handover `qa-agent`.
