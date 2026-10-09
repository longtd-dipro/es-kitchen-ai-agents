# Design-Technical: Delivery Partner P2 — es-kitchen-web-outsource-web-private

> **Repo:** `es-kitchen-web-outsource-web-private` (E05) · React 19 · Vite 8 · AntD 6.4 · TailwindCSS 4 · TanStack Query v5 · Redux Toolkit v2 · react-hook-form + yup
> **Đầu vào:** [Figma-Analysis.md](../Figma-Analysis.md) · **API contract:** [es-kitchen-api/Design-Technical.md](../es-kitchen-api/Design-Technical.md) §4
> **Nguyên tắc:** FE **không tự đoán endpoint** — mọi endpoint copy từ §4 của BE doc vào task. Hạng mục `[PENDING Qx]` không được code trước khi PM/BA trả lời.
> **Convention bắt buộc** (theo `frontend/es-kitchen-web-outsource-web-private/overview/patterns.md`): service trong `services/client/*.service.ts` (named export function, không class) → hook `hooks/use<Domain>.ts` (`useQuery` / **`useMutationCustom`**, không dùng `useMutation` trực tiếp) → page trong `pages/<domain>/`. Response bọc `IBaseApiResponse` → lấy `res.data`.

---

## 1. Tổng quan thay đổi

| # | Vùng | File / Vị trí | Loại | Ghi chú |
|---|---|---|---|---|
| FE-00 | Navigation | `constants/nav.ts`, `constants/route.ts` | **Sửa** | Đồng bộ IA với `sider` Figma |
| FE-01 | Schedule | `pages/schedule/components/MonthlyCalendarTab.tsx` (mới) | **Thay** | Thay `MonthlySummaryTab` |
| FE-02 | Schedule | `pages/schedule/components/WeeklyListTab.tsx` (mới) | **Thay** | Thay `WeeklyTimelineTab` |
| FE-03 | Schedule | `pages/schedule/components/ScheduleFilterBar.tsx` (mới) | Thêm | 2 nhóm điều kiện |
| FE-04 | Delivery | `pages/delivery-status/DeliveryStatusDetailPage.tsx` + `deliveryDetailTabs.constants.ts` (mới) | **Sửa** | Tab hoá 4 tab + panel gán tài xế |
| FE-05 | Delivery | `components/PerformanceTab.tsx` (mới) | Thêm | 実績 |
| FE-06 | Delivery | `components/AttachmentTab.tsx` (mới) | Thêm | 添付資料 |
| FE-07 | Driver | `pages/driver/components/employeeColumns.tsx`, `EmployeePage.tsx` | **Sửa** | 免許 / アカウント状態 / checkbox / sort |
| FE-08 | Driver | `pages/driver/components/BulkIssueAccountModal.tsx` (mới) | Thêm | 4 state modal |
| FE-09 | Collection | `pages/collection-reports/*` | **Sửa** | 駐車合計料金 + CSV |
| FE-10 | Driver | `pages/driver/EmployeeDetailPage.tsx` + 3 tab | **Sửa** | 基本情報 / 担当配送情報 / 変更履歴 |
| FE-11 | Orders | `pages/orders/*` | **Sửa** | `[PENDING Q7]` KPI + 金額再確認 |
| FE-12 | Register | `pages/register/components/ServiceAreaSection.tsx` | **Sửa** | `[PENDING Q1/Q3]` step 2 |
| FE-13 | Profile | `pages/profile/*` | **Sửa** | `[PENDING Q3]` 2 tab × 2 state |
| FE-14 | Dashboard | `pages/dashboard/DashboardPage.tsx` | **Thay** | mini-calendar + お知らせ + 未回答見積 |
| FE-15 | Announcement | `pages/announcement/AnnouncementDetailPage.tsx` (mới) | Thêm | お知らせ詳細 |
| FE-16 | Delivery | `components/DeliveryAddressTab.tsx` (mới) | Thêm | `[PENDING Q5]` 配送住所 + 非公開資料 |
| FE-17 | Common | `components/Common/FileViewerModal.tsx` (mới) | Thêm | Viewer ảnh/PDF |
| FE-18 | Delivery | `pages/delivery-status/components/DeliveryFilterBar.tsx` | **Sửa** | 11 điều kiện + sort + collapse |
| FE-19 | Auth | `pages/auth/VerifyPage.tsx`, `ResetPasswordPage.tsx` | **Sửa** | Countdown + rule mật khẩu |

---

## 2. Flow System Structure

### 2.1 Component tree + data flow

```
routes/index.tsx  (lazy + withSuspense)
│
├── NonAuthLayout ─── /login ──────────── LoginPage ──────────► auth.service ► POST /auth/login
│                     /forgot-password ── ForgotPasswordPage ─► POST /auth/forgot-password/request
│                     /verify ─────────── VerifyPage [FE-19] ─► POST /auth/forgot-password/verify-otp
│                     /reset-password ─── ResetPasswordPage ──► POST /auth/forgot-password/reset-password
│
├── PublicPageLayout ─ /register ──────── RegisterPage
│                                          ├─ RegisterStepper
│                                          ├─ BasicInfoSection + ContactTableSection
│                                          └─ ServiceAreaSection [FE-12]  ► POST /register
│
└── AuthLayout (sidebar = NAV_ITEMS [FE-00])
    │
    ├── /dashboard ──── DashboardPage [FE-14]
    │                    ├─ MiniCalendarCard ──┐
    │                    ├─ AnnouncementList ──┼─► useDashboardOverview ► GET /dashboard/overview
    │                    └─ UnansweredQuoteList┘
    │
    ├── /announcements/:id ── AnnouncementDetailPage [FE-15] ► GET /notifications/:id
    │
    ├── /schedule ───── SchedulePage  (tab qua ?tab=)
    │                    ├─ ScheduleFilterBar [FE-03] ─────────┐
    │                    ├─ MonthlyCalendarTab [FE-01] ────────┼─► useMonthlySchedule ► GET /schedule/monthly
    │                    │   └─ ScheduleDayCell (cycle/badge/tag)
    │                    └─ WeeklyListTab [FE-02] ─────────────┴─► useWeeklySchedule  ► GET /schedule/weekly
    │                        └─ ScheduleDayColumn (danh sách điểm giao)
    │
    ├── /delivery-status ── DeliveryStatusPage
    │    │                   ├─ DeliveryFilterBar [FE-18] (collapse, 11 field)
    │    │                   └─ deliveryColumns ─► useDeliveries ► GET /delivery-blocks
    │    │
    │    └── /:id ────── DeliveryStatusDetailPage [FE-04]
    │                     ├─ DriverAssignPanel (未設定 / 確定 / 編集 · disabled theo editLock)
    │                     │   └─ DriverSelectDropdown (search + 配送件数)  ► GET .../assignable-drivers
    │                     └─ Tabs
    │                         ├─ OverviewTab        (配送概要 — tái dùng DetailSection/DetailTextField)
    │                         ├─ DeliveryAddressTab [FE-16] ─► GET/POST/DELETE .../private-attachments
    │                         │    └─ FileViewerModal [FE-17]
    │                         ├─ PerformanceTab [FE-05]  (廃棄数確認 + 陳列結果確認)
    │                         └─ AttachmentTab  [FE-06]  (駐車報告 + 集金報告)
    │
    ├── /collection-reports ─ BillPage [FE-09] ─► useCollectionReports ► GET /collection-reports(+/summary)
    │                          └─ nút CSV出力    ► GET /collection-reports/export (blob)
    │
    ├── /driver ─────── EmployeePage [FE-07]
    │    │               ├─ rowSelection (checkbox) ─► BulkIssueAccountModal [FE-08]
    │    │               │                              ► POST /drivers/bulk-issue-account
    │    │               └─ employeeColumns (免許 thumbnail, アカウント状態)
    │    ├── /create ── CreateDriverPage
    │    └── /:id ───── EmployeeDetailPage [FE-10] → 3 tab
    │                     ├─ BasicInfoTab   ► GET /drivers/:id
    │                     ├─ AssignedDeliveryTab ► GET /delivery-blocks?driverId=
    │                     └─ HistoryTab     ► GET /drivers/:id/history
    │
    ├── /orders ─────── OrdersPage / OrderDetailPage [FE-11]
    └── /profile ────── ProfilePage [FE-13] → BasicInfoTab / ServiceCapabilityTab
```

### 2.2 Danh sách chức năng chính + liên kết

| Chức năng | Hook / Service | Shares state với | Trigger |
|---|---|---|---|
| Lịch tháng/tuần | `useSchedule.ts` → `schedule.service.ts` | Bấm ngày → điều hướng `/delivery-status?dateFrom=&dateTo=` | URL query `?tab=&month=` |
| Danh sách 配送 | `useDeliveries.ts` → `delivery.service.ts` | Dùng chung queryKey prefix `["deliveries"]` với tab 担当配送情報 của driver | Filter submit |
| Chi tiết 配送 (4 tab) | `useDeliveryDetail.ts` | 1 query duy nhất nuôi cả 4 tab (BE trả gộp) | Mount + `?tab=` |
| Gán tài xế | `useAssignDriver` (`useMutationCustom`) | `invalidateQueries(["delivery-detail", id])` + `["deliveries"]` | Bấm 確定 |
| Bulk phát hành | `useBulkIssueAccount` | `invalidateQueries(["drivers"])` sau khi đóng modal | Bấm 発行する |
| 非公開資料 | `usePrivateAttachments` | `invalidateQueries(["delivery-detail", id])` | Upload / xoá |
| Dashboard | `useDashboardOverview` | Không chia sẻ — endpoint gộp riêng | Mount |

### 2.3 Đánh giá thiết kế (Design Rationale)

- **1 query nuôi 4 tab của 配送詳細** — BE trả gộp `disposal` / `display` / `attachments` trong `GET /delivery-blocks/:id`; tách 4 query sẽ tạo 4 spinner rời rạc và 4 lần re-fetch khi đổi tab. Tab chỉ đổi `?tab=` chứ không refetch.
- **Trạng thái tab đặt trên URL (`?tab=`)** — giống `SchedulePage` hiện tại, cho phép QC/PM gửi link đúng tab và giữ được state khi F5.
- **KHÔNG tạo Redux slice mới** — toàn bộ state của P2 là server state (TanStack Query) + UI state cục bộ. `auth` vẫn là slice duy nhất (đúng checklist §15 patterns.md).
- **Modal bulk là state machine 4 trạng thái trong 1 component** (`confirm → loading → success → partialError`) thay vì 4 modal rời — Figma vẽ 4 frame nhưng cùng khung, cùng dữ liệu; tách ra sẽ phải truyền qua lại `results[]`.
- **`FileViewerModal` tách thành Common component** — dùng ở tab 配送住所, 添付資料 và (sau này) màn admin; Figma đặt tên frame `Admin_PicckingShipDetail_ImageView` cho thấy component chia sẻ liên hệ thống.
- **Giữ nguyên `MonthlySummaryTab`/`WeeklyTimelineTab` cho tới khi tab mới chạy được** — thay bằng file mới rồi xoá ở cuối task, tránh mất tính năng giữa chừng (xem §8 R1).
- **Không tự đổi nhãn nav trước khi có quyết định** — nhãn hiện tại (`TOP`, `注文リスト`, `配送状況`, `集金額`, `スタッフ`) khác Figma (`ホーム`, `見積もり管理`, `配送管理`, `集金・駐車`, `配送スタッフ`). Đổi nhãn ảnh hưởng tài liệu QC/manual đang có → gom thành 1 task riêng FE-00.

---

## 3. Thay đổi Navigation (FE-00)

| Vị trí Figma | `nav.ts` hiện tại | Hành động |
|---|---|---|
| 1. ホーム | `TOP` (`/dashboard`) | Đổi nhãn |
| 2. スケジュール | `スケジュール` (`/schedule`) | Giữ, đổi vị trí |
| 3. 配送管理 | `配送状況` (`/delivery-status`) | Đổi nhãn |
| 4. 見積もり管理 | `注文リスト` (`/orders`) | Đổi nhãn `[PENDING Q7]` |
| 5. 集金・駐車 | `集金額` (`/collection-reports`) | Đổi nhãn |
| 6. 配送スタッフ | `スタッフ` (`/driver`) | Đổi nhãn |
| 7. プロフィール | `プロフィール` (`/profile`) | Giữ, chuyển xuống cuối |
| — | `パスワード変更` (`/change-password`) | **Không có trong sider Figma** → chuyển vào dropdown user ở header (giữ route) |

Route thêm mới: `ANNOUNCEMENT_DETAIL: "/announcements/:id"` trong `constants/route.ts`.

---

## 4. API Definition (copy từ BE doc §4)

> Bảng rút gọn để tra nhanh. **Bản đầy đủ (request/response DTO) ở [es-kitchen-api/Design-Technical.md §4](../es-kitchen-api/Design-Technical.md#4-api-definition)** — task FE phải copy nguyên bảng chi tiết, không copy bảng rút gọn này.

| FE item | Method | Endpoint |
|---|---|---|
| FE-01 | GET | `/schedule/monthly?month=&keyword=&addressKeyword=` |
| FE-02 | GET | `/schedule/weekly?week=` |
| FE-04/05/06 | GET | `/delivery-blocks/:id` (đã mở rộng) |
| FE-04 | GET | `/delivery-blocks/:id/assignable-drivers?keyword=` |
| FE-04 | PATCH | `/delivery-blocks/:id/assign-driver` |
| FE-07 | GET | `/drivers?q&type&status&accountState&page&limit&sortBy&order` (giữ tên param đang có: `q`, `type`, `status`) |
| FE-08 | POST | `/drivers/bulk-issue-account` |
| FE-09 | GET | `/collection-reports`, `/collection-reports/summary`, `/collection-reports/export` |
| FE-10 | GET | `/drivers/:id/history` |
| FE-14 | GET | `/dashboard/overview` |
| FE-15 | GET | `/notifications/:id` |
| FE-16 | GET/POST/DELETE | `/delivery-blocks/:id/private-attachments[/:attachmentId]` |
| FE-16 | POST | `/uploads/presigned-upload-url` (đã có) |
| FE-18 | GET | `/delivery-blocks?` — param đã có: `shipmentNo`, `scheduledSendDateFrom/To`, `deliveryDateFrom/To`, `transitPointId`, `status`, `sortBy`, `order`; thêm: `branchKeyword`, `addressKeyword`, `cargoType`, `vendingMachine`, `deliveryMethod`, `origin`, `trackingOrStaffKeyword` |

**Base URL:** `import.meta.env.VITE_API_URL`. Service file không tự ghép prefix `/deliverer` nếu axios instance đã cấu hình (xem `services/http/axios.instance.ts` trước khi viết).

---

## 5. Chi tiết từng hạng mục

### FE-01 — Lịch tháng (`MonthlyCalendarTab`)
- Lưới 7 cột × 6 hàng, hiển thị cả ngày tràn tháng trước/sau (mờ).
- Mỗi ô: số ngày · `cycleLabel` · badge `件` theo 温度帯 (`冷凍` xanh đậm / `冷蔵・常温` xanh nhạt / `資材` vàng) · tag `臨時休業` (đỏ) · text `サイクル休止` · badge `⚠ 未N件` khi `unassignedCount > 0` · viền xanh khi `isToday`.
- Khối `凡例` cuối trang — copy nguyên văn nhãn từ Figma node `31498:190314`.
- Bấm ô → `navigate('/delivery-status?dateFrom=<d>&dateTo=<d>')`.
- Toggle `月 / 週` + `< >` + `今日` + month picker; đồng bộ `?tab=&month=` lên URL (pattern `SchedulePage` hiện có).
- ⚠️ Endpoint cũ `/delivery-blocks/timeline` + `/summary` (đang dùng bởi `WeeklyTimelineTab`/`MonthlySummaryTab`) **thành dead code sau FE-01/FE-02** — báo BE dọn sau khi QA pass, đừng xoá song song.

### FE-02 — Lịch tuần (`WeeklyListTab`)
- 7 cột, mỗi cột: ngày · `cycleLabel` · tổng `件` · **danh sách điểm giao** (icon 温度帯 + tên, truncate 1 dòng), scroll trong cột.
- ⚠️ Không implement theo frame `weekly-schedule` (午前/午後/夕方便) — đó là vùng nháp.

### FE-04 — Tab hoá 配送詳細
- `deliveryDetailTabs.constants.ts`: `overview | address | performance | attachment`.
- `DriverAssignPanel`: 3 trạng thái — chưa gán (`未設定` + `確定`/`キャンセル`), đã gán (`編集`), khoá (`編集` disabled khi `editLock.canEditDriver === false`), tooltip lý do.
- Sau `確定` thành công → toast `配送スタッフ設定完了しました。` + `invalidateQueries`.

### FE-05 — Tab 実績
- Khối 配送実績: `配送完了日時` (readonly) + `備考`.
- Khối 廃棄数確認: 4 ô tổng (廃棄数 / 理論在庫 / 実在庫 / 差異) + bảng: `No · 写真 · 品番 · 商品名 · カテゴリ · 廃棄数 · 賞味期限 · 理論在庫 · 実在庫`. `賞味期限` quá hạn → đỏ; `廃棄数 > 0` → đỏ.
- Khối 陳列結果確認: 3 ô tổng (予定合計数 / 実際合計数 / 差異合計数) + bảng: `... 予定数 · 実際数 · 誤差`; `誤差 ≠ 0` → đỏ.
- `disposal === null` / `display === null` → empty state `[PENDING Q8]`.

### FE-06 — Tab 添付資料
- 駐車報告: `駐車料金` + thumbnail レシート (mở `FileViewerModal`).
- 集金報告: `集金予定額` · `集金額` (readonly).

### FE-07/FE-08 — 配送スタッフ + bulk
- Cột 免許: `licenseImageUrls[0]` → thumbnail 40×28, rỗng → placeholder icon.
- Cột アカウント状態: `発行済み` (link style) / `未発行` (xám).
- `rowSelection` AntD; nút `アカウント一括発行` disabled khi chưa chọn dòng nào.
- Modal state machine:
  1. `confirm` — bảng các dòng đã chọn (`配送スタッフID · 名 · ステータス · メールアドレス`), cảnh báo `既存アカウントがある場合、パスワードはリセットされ、再ログインが必要になります。`, nút `キャンセル` / `発行する`.
  2. `loading` — nút `発行する` spinner, khoá thao tác.
  3. `success` — icon ✅ + `アカウント発行が完了しました` + nút `完了`.
  4. `partialError` — icon ⚠️ + `エラー: 〇〇件発生しています。` + bảng highlight dòng lỗi + `完了` / **`再度実行`** (gọi lại với `driverIds` = dòng `FAILED`).

### FE-09 — 集金・駐車
- Summary 2 ô: `集金合計金額` / `駐車合計料金`.
- Bảng: `No · 配送スタッフID · 配送スタッフ名(link) · 集金合計金額 · 駐車合計料金`.
- `CSV出力`: `responseType: 'blob'`, lấy tên file từ header `Content-Disposition` (axios instance đã expose header này — xác nhận trong `axios.instance.ts`), **không tự ghép tên file ở FE**. Encoding do BE lo (đã là UTF-8 BOM) — FE không đụng.

### FE-10 — 配送スタッフ詳細 3 tab
- `基本情報`: 免許証 (ảnh, click mở viewer) + ログイン情報 (`ログインID`, `メールアドレス`, `最終ログイン日時`).
- `担当配送情報`: filter kỳ + `配送状況`, summary `集金合計金額` / `駐車合計料金`, bảng 10 cột (scroll ngang).
- `変更履歴`: bảng `変更日時 · 変更内容 · 変更者`. ⚠️ Dữ liệu mẫu trong Figma là của màn sản phẩm (xem C4) — **không copy nội dung mẫu vào code/test**.

### FE-16/FE-17 — 配送住所 + viewer `[PENDING Q5]`
- 2 khối địa chỉ readonly: `郵便番号 · 都道府県 · 市区町村 · 町域・番地 · 建物・部屋番号 · 部署名 · 電話番号 · メイン担当者名 · メイン担当者電話番号`.
- `搬入経路・添付資料` (công khai): gallery chỉ xem — hover hiện 見る / ダウンロード.
- `非公開の搬入経路・添付資料`: hover hiện 見る / ダウンロード / **削除** + ô `ファイルを追加`. Upload: presigned URL → PUT S3 → POST đăng ký metadata → toast `非公開資料をアップロードしました。`
- `FileViewerModal`: header `fileName` + `ダウンロード / 縮小 / 拡大 / ⋮(削除) / 閉じる`, mũi tên prev-next, pager `n / total`. PDF: **không preview** — hiện icon + dung lượng + `このファイルはプレビューできません。`, disable zoom.

### FE-19 — Auth polish
- `VerifyPage`: 4 ô OTP, link `再送信` kèm countdown `(00:59)` — disable trong lúc đếm; chú thích `※認証コードの有効期限は5分です。`
- `ResetPasswordPage`: yup rule `8–20 ký tự 半角英数字` + trường xác nhận khớp; hiển thị bullet hướng dẫn dưới input.

---

## 6. Interface với repo khác

| Hướng | Nội dung |
|---|---|
| FE → `es-kitchen-api` | REST theo §4. Contract Lock trước khi bắt đầu Phase 3 |
| FE → S3 | PUT trực tiếp qua presigned URL (`/uploads/presigned-upload-url`) cho 非公開資料 và 免許証 |
| FE ← BE | Response envelope `IBaseApiResponse<T>` → luôn lấy `res.data` trong service layer, không để component tự bóc |
| WebSocket / Push | Không dùng |

---

## 7. Luồng xử lý chi tiết

### 7.1 Bulk phát hành tài khoản
1. `EmployeePage` giữ `selectedRowKeys` (state cục bộ).
2. Bấm `アカウント一括発行` → mở modal ở state `confirm`, truyền danh sách row đã chọn.
3. `発行する` → `useBulkIssueAccount.mutate({ driverIds })` (`useMutationCustom`) → state `loading`.
4. `onSuccess(res)`: `res.failed === 0` → `success`; ngược lại → `partialError` kèm `res.results`.
5. `再度実行` → mutate lại với `driverIds = results.filter(r => r.status === 'FAILED').map(r => r.driverId)`.
6. `完了` → đóng modal, clear `selectedRowKeys`, `invalidateQueries(["drivers"])`.

### 7.2 Upload 非公開資料
1. `POST /uploads/presigned-upload-url` với `fileName` + `mimeType`.
2. `PUT` file thẳng lên S3 bằng URL trả về (không qua BE).
3. `POST /delivery-blocks/:id/private-attachments` đăng ký metadata.
4. `invalidateQueries(["delivery-detail", id])` → gallery tự refresh + toast.
5. Lỗi ở bước 2 → không gọi bước 3 (tránh bản ghi mồ côi trỏ tới file không tồn tại).

### 7.3 Khoá chỉnh sửa sau 7 ngày
1. `useDeliveryDetail` trả `editLock`.
2. `canEditDriver === false` → nút `編集` disabled + tooltip.
3. FE **không tự tính ngày** — luôn dùng cờ từ BE để 1 nguồn sự thật duy nhất (BE cũng chặn ở service).

---

## 8. Non-Regression Risks

| # | Tính năng hiện có | File | Rủi ro | Cách verify |
|---|---|---|---|---|
| R1 | Schedule 2 tab cũ | `MonthlySummaryTab.tsx`, `WeeklyTimelineTab.tsx` | Xoá sớm → mất tính năng giữa chừng | Thêm tab mới trước, chỉ xoá file cũ ở bước cuối task, sau khi tab mới chạy với API thật |
| R2 | 配送詳細 hiện tại | `DeliveryStatusDetailForm.tsx` | Tab hoá làm mất section 中継先情報 / 納品先情報 | Map từng field cũ vào tab mới; checklist field-by-field trong task |
| R3 | Fee-area | `pages/profile/components/FeeAreaTab.tsx`, `FeeEditModal.tsx`, `feeAreaColumns.tsx` | Figma P2 chỉ vẽ 2 tab → dev xoá nhầm | **Không xoá** cho tới khi Q3 được trả lời |
| R4 | Nav + tài liệu QC | `constants/nav.ts` | Đổi nhãn làm sai lệch TC/manual đang dùng nhãn cũ | Gom vào 1 task FE-00, thông báo QC trước khi merge |
| R5 | Driver list columns | `employeeColumns.tsx` | Thêm cột làm vỡ layout ở màn hẹp | Đặt `scroll.x` cho Table, kiểm tra ở 1440px và 1280px |
| R6 | Export CSV | `BillPage.tsx` | Đổi cách lấy tên file → tải về sai tên | Test tải thật, so tên file với quy tắc trong Figma note |
| R7 | `useMutationCustom` | `hooks/useMutationCustom.ts` | Dùng `useMutation` trực tiếp → mất xử lý lỗi chung | Code review chặn; grep `useMutation(` khi review |

---

## 9. Ước lượng

| ID | Hạng mục | Est | Phụ thuộc |
|---|---|---|---|
| FE-00 | Navigation | 4h | Q7 (nhãn 見積もり管理) |
| FE-01 | Lịch tháng | 20h | BE-01 |
| FE-02 | Lịch tuần | 12h | BE-02 |
| FE-03 | Search lịch | 6h | BE-03 |
| FE-04 | Tab hoá 配送詳細 + panel gán tài xế | 14h | BE-04, BE-13 |
| FE-05 | Tab 実績 | 14h | BE-04 |
| FE-06 | Tab 添付資料 | 8h | BE-04 |
| FE-07 | 配送スタッフ一覧 | 12h | BE-05 |
| FE-08 | Modal bulk 4 state | 14h | BE-06 |
| FE-09 | 集金・駐車 | 8h | BE-07 |
| FE-10 | 配送スタッフ詳細 3 tab | 14h | BE-05, BE-14 |
| FE-11 | 見積 KPI + 金額再確認 | 14h | **Q7**, BE-08 |
| FE-12 | Form đăng ký step 2 | 14h | **Q1/Q3**, BE-09 |
| FE-13 | プロフィール 2 tab × 2 state | 12h | **Q3**, BE-09 |
| FE-14 | Dashboard | 14h | BE-10 |
| FE-15 | お知らせ詳細 | 4h | — |
| FE-16 | 配送住所 + 非公開資料 | 14h | **Q5**, BE-12 |
| FE-17 | FileViewerModal | 10h | — |
| FE-18 | Bộ lọc nâng cao | 10h | BE-11 |
| FE-14b | Map badge お知らせ theo `NotificationType` | — | **Q9** |
| FE-19 | Auth polish | 4h | — |

**Tổng FE: ~222h** — trong đó **~54h đang bị chặn** bởi Q1/Q3/Q5/Q7.

---

## 10. Thứ tự triển khai đề xuất

| Đợt | Hạng mục | Lý do |
|---|---|---|
| 1 | FE-17, FE-19, FE-15 | Không phụ thuộc BE mới — làm được ngay |
| 2 | FE-01, FE-02, FE-03 | Sau khi BE-01/02/03 xong; đây là màn user dùng nhiều nhất |
| 3 | FE-04, FE-05, FE-06, FE-18 | Cụm 配送管理 — dùng chung 1 endpoint detail |
| 4 | FE-07, FE-08, FE-10, FE-09 | Cụm 配送スタッフ + 集金 |
| 5 | FE-14, FE-00 | Dashboard cần schedule API xong trước; đổi nhãn nav làm cuối để QC cập nhật 1 lần |
| 6 | FE-11, FE-12, FE-13, FE-16 | Chỉ khởi động sau khi Q1/Q3/Q5/Q7 được trả lời |
