# SPEC: Website Công ty vận chuyển — Delivery Partner Portal (Phase 2)

> **Epic:** E05 — 委託配送先WEB（Contract Delivery Destination Web）
> **Repo:** `es-kitchen-web-outsource-web-private` (FE) + `es-kitchen-api` (BE)
> **Business Flow:** BF05 — [GIAO HÀNG] Web Đối tác Vận chuyển (`ESKITCHEN-1237`)
> **Nguồn chính:** Figma `ES-Kitchen-phase-2` — canvas `Delivery (P2)` node `26173:304942`
> **Ngày tạo:** 2026-09-21 · **Version:** v1

---

## Mô tả nghiệp vụ

Portal web dành riêng cho **công ty vận chuyển được ES Kitchen ủy thác** (委託配送先 / Outsource Delivery Partner). Portal cho phép đối tác tự vận hành toàn bộ phần việc được giao mà không cần thông qua nhân viên vận hành ES Kitchen:

1. **Tự đăng ký hợp tác** — công ty vận chuyển tự điền form 2 bước (thông tin pháp nhân + năng lực giao hàng), gửi lên hệ thống ở trạng thái `仮登録` chờ System Admin (E03) phê duyệt.
2. **Nắm lịch giao hàng** — xem lịch tháng/tuần các chu kỳ giao được phân bổ, kèm cảnh báo đơn chưa gán tài xế.
3. **Điều phối tài xế** — xem danh sách đơn giao hàng, mở chi tiết từng đơn, gán tài xế của chính công ty mình vào từng đơn.
4. **Theo dõi kết quả thực tế** — xem số liệu tài xế báo về từ Driver App (thời điểm hoàn tất, số hàng hủy, kết quả trưng bày, ảnh/PDF báo cáo đỗ xe và thu tiền).
5. **Đối soát tiền** — tổng hợp tiền thu hộ và phí đỗ xe theo tài xế, theo kỳ, xuất CSV.
6. **Quản lý nhân sự giao hàng** — CRUD tài xế, phát hành tài khoản đăng nhập Driver App hàng loạt, xem lịch sử thay đổi.
7. **Quản lý hồ sơ công ty** — xem/sửa thông tin pháp nhân và năng lực đáp ứng giao hàng.

**Ranh giới nghiệp vụ:** đối tác **không** nhìn thấy dữ liệu kinh doanh của ES Kitchen (menu, giá bán, doanh thu, khách hàng cuối). Đối tác chỉ thấy phần việc được ủy thác cho mình.

**Quan hệ với tài liệu Phase 1:** SPEC này **mở rộng và thay thế** phạm vi của [`features/delivery-partner/SPEC.md`](../delivery-partner/SPEC.md) (Phase 1, 6 flow F01–F06). Phần khác biệt lớn nhất là bổ sung self-registration, lịch trình, tab hóa màn chi tiết giao hàng, phí đỗ xe, phát hành tài khoản hàng loạt và hồ sơ công ty. Xem `## Out of Scope` để biết những gì Phase 1 có mà Phase 2 **không** đụng tới.

---

## BA Deliverables

> **Downstream agent (Tech Lead / Designer / QC) BẮT BUỘC đọc section này ĐẦU TIÊN.** Đây là entry point duy nhất — không cần truyền thêm Figma URL hay HTML path.

| # | Output | Status | Path / URL |
|---|---|---|---|
| 0 | **SPEC.md** (bản này) | ✅ Done | `es-kitchen-docs/docs/features/delivery-partner/SPEC.md` |
| 1 | Figma Frame — **Flow Tổng Quan** | ⏳ Pending | Page `Feature - Flow` — `https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=31403-200061` |
| 2 | Figma Frame — **Screen Flow** | ⏳ Pending | Page `Feature - Flow` (cùng URL trên) |
| 3 | Figma Frame — **Screens + Items + Error Scenarios** | ⏳ Pending | Page `Feature - Flow` (cùng URL trên) |
| 4 | **HTML Prototype** | ⏳ Pending | `es-kitchen-docs/docs/features/delivery-partner/prototype/index.html` |
| — | **Figma nguồn (client)** — 57 frame giao diện + 24 bảng 画面設計書 | ✅ Có sẵn | `https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=26173-304942` |
| — | **Phụ lục phân tích Figma** (Tech Lead, 2026-09-18) | ✅ Có sẵn | [`Figma-Analysis.md`](Figma-Analysis.md) |

**Downstream instructions:**

| Agent | Đọc phần nào |
|---|---|
| **Tech Lead Design** | `## Source Register` (biết chỗ nào chưa chốt) → `## Screens` → `## Screen Details` → `## Acceptance Criteria`. Đối chiếu với `Figma-Analysis.md` §3 (9 xung đột) trước khi sửa `Design-Technical.md` đã có. |
| **Designer** | `## Screens` (điền cột Figma Link) → `## Screen Details` (layout + components) → `## Responsive Requirements`. Figma nguồn của khách đã có giao diện — Designer **chỉ đặt lại tên frame theo Screen Code**, không vẽ lại. |
| **QC** | `## Acceptance Criteria` → `## Screen Details` (bảng Non-Happy 4 cột = nguồn sinh TC âm) → `## Open Questions` (không viết TC cho hạng mục `UNKNOWN`). |
| **Dev (FE/BE)** | `## Screen Details` là nguồn duy nhất cho validation rule + error message. Không tự đặt message khác. |

---

## Source Register

> Mọi statement trong SPEC này trace về 1 row dưới. `FACT` = đã confirm; `PROPOSAL` = BA đề xuất chờ approve; `INFERENCE` = BA suy luận, cần verify; `UNKNOWN` = chưa rõ → `## Open Questions`; `CONFLICT` = ≥2 nguồn mâu thuẫn.

| ID | Statement | Classification | Evidence | Confidence | Used in flow? |
|---|---|---|---|---|---|
| RQ-001 | Phạm vi SPEC = 8 flow chính thức trong canvas, loại 5 frame vùng nháp | FACT | User turn 2 — chọn "8 flow chính thức, loại vùng nháp" | High | Yes — toàn bộ SPEC |
| RQ-002 | Có self-registration; sau submit hồ sơ ở trạng thái `仮登録` chờ E03 duyệt | FACT | User turn 2 — chọn "Có self-registration, trạng thái 仮登録 chờ E03 duyệt"; Figma bảng `31498:195504` B.3/I.3 ghi "gửi đăng ký chờ ES admin duyệt" | High | Yes — Flow 2 |
| RQ-003 | Mọi item / validation / error message của 19 màn lấy từ 24 bảng 画面設計書 song ngữ trong canvas Figma | FACT | Figma table nodes `31498:194117/194739–194757/195503–195513` (đọc trực tiếp qua Figma MCP 2026-09-21) | High | Yes — `## Screen Details` |
| RQ-004 | Viewport chuẩn 1440×1024 (Website desktop) | FACT | Toàn bộ frame màn chính trong Figma có `width=1440` | High | Yes — `## Responsive Requirements` |
| RQ-005 | Hệ Screen Code dùng `OW_<FEAT4>_<Seq3>` | PROPOSAL | BA chọn để đồng bộ với `Design-Technical.md` + 43 task file đã sinh; `Figma-Analysis.md` Q2 vẫn mở | Medium | Yes — nhưng PM/BrSE cần chốt (xem OQ-01) |
| RQ-006 | Đơn giao hàng bị khóa chỉnh sửa khi `ngày hiện tại − ngày ship ≥ 7` | FACT (rule) / UNKNOWN (mốc ngày) | Figma text node `31498:194738`: "ngày hiện tại - ngày ship >=7 : ko thể edit nữa"; **không nói rõ** mốc là `配送日（着）` hay `発送予定日`, và BE có chặn không | Medium | Một phần — xem OQ-02 |
| RQ-007 | Tài liệu 非公開 gắn theo đơn giao hàng, tối đa 20 file, JPG/JPEG/PNG, ≤5MB | FACT | Figma bảng `31498:195508` B.2.2 + B.2.3 | High | Yes — OW_DLVR_002 tab 配送住所 |
| RQ-008 | Phạm vi xem tài liệu 非公開: chỉ nội bộ công ty vận chuyển + tài xế | FACT | Figma bảng `31498:195508` B.2.2 — "Chỉ nội bộ công ty vận chuyển và tài xế xem được" | High | Yes |
| RQ-009 | CSV 集金 xuất 7 cột: 配送日/配送ID/配送スタッフID/配送スタッフ名/配送先名/集金金額/駐車料金 — 1 dòng / 1 配送 | CONFLICT | Figma bảng `31498:194117` + note `31498:194116` **vs** code hiện tại xuất 7 cột khác (`発送日/配送スタッフ名/納品先/集金合計/駐車場料金/差額/提出日時`) — `Figma-Analysis.md` C8 | — | No — xem OQ-03 |
| RQ-010 | Quy tắc tên file CSV: `集金管理_{開始日}-{終了日}_{配送スタッフ検索条件}_{出力日時}.csv` | FACT | Figma text node `31498:194115` (có 3 ví dụ cụ thể) | High | Yes — OW_CLCT_001 |
| RQ-011 | Màn プロフィール có 2 tab: 基本情報 + 配送対応情報 | FACT | Figma frame `31498:192935/193018/193104/193191` | High | Yes — Flow 8 |
| RQ-012 | Tab `配送対応情報` dùng chung data model với Step 2 form đăng ký | INFERENCE | Trùng khớp field 1-1 giữa frame `31498:193104` và bảng `31498:195504`; canvas **không có bảng 画面設計書 riêng** cho プロフィール | Medium | Yes — có badge `[INFERENCE]` tại OW_PROF_002 |
| RQ-013 | Fee-area (phí theo khu vực) bị bỏ khỏi プロフィール ở P2 | CONFLICT | `FeeAreaTab` + `FeeEditModal` + import/export CSV phí **đã implement** và có trong `scope-changes-phase2.md` §E05, nhưng プロフィール P2 chỉ còn 2 tab — `Figma-Analysis.md` C3 | — | No — xem OQ-04 |
| RQ-014 | Sidebar chính thức có 7 mục, gồm `見積もり管理` | FACT (sidebar) / CONFLICT (màn) | Component `sider` `31498:194809` có mục 見積もり管理; nhưng 3 frame 見積 (`quote-request-*`) dùng branding `LOGI CORE` + sidebar khác, nằm ngoài mọi Flow note | — | Một phần — mục nav giữ, màn hình xem OQ-05 |
| RQ-015 | Badge `メンテナンス` trên ホーム là 1 loại thông báo | CONFLICT | Figma bảng `31498:194757` B.2 liệt kê "Cập nhật hệ thống／Thông báo／Bảo trì..."; enum `NotificationType` hiện có 7 giá trị, **không có** giá trị Bảo trì — `Figma-Analysis.md` C9 | — | No — xem OQ-06 |
| RQ-016 | Sau khi submit form đăng ký có 1 màn xác nhận đã gửi (`OW_AUTH_005`) | INFERENCE | Suy từ RQ-002 (phải báo cho user biết đang chờ duyệt). Canvas Figma **không có frame** cho màn này | Low | Có badge `[INFERENCE]` — xem OQ-07 |
| RQ-017 | Tab `添付資料` của 配送詳細 gồm 駐車報告 (phí đỗ xe + ảnh receipt) và 集金報告 (集金予定額 / 集金額) | INFERENCE | Frame `31498:193742` (đọc được bố cục), nhưng **không có bảng 画面設計書** cho tab này | Medium | Có badge `[INFERENCE]` |
| RQ-018 | Dữ liệu mẫu tab 変更履歴 trong Figma bị sai domain (hiển thị `栄養成分を更新`, `商品価格を「150 → 180」に変更` — nội dung của màn sản phẩm) | FACT (là lỗi mẫu) | Figma frame `31498:192891`; bảng `31498:194742` C.2 mô tả **đúng** quy tắc log | High | Yes — SPEC dùng quy tắc ở bảng, bỏ qua dữ liệu mẫu |
| RQ-019 | Trạng thái giao hàng có 5 giá trị: 出荷準備/出荷済/荷受済/トラブル/配送完了 | FACT | Figma bảng `31498:194755` L.11 + `31498:194754` S.7 | High | Yes |
| RQ-020 | Trạng thái tài xế có 5 giá trị: 有効/免許未登録/停止/無効/削除済 | FACT | Figma bảng `31498:195512` S.3 + T.8 | High | Yes |
| RQ-021 | Dropdown gán tài xế hiển thị số đơn của tài xế đó **trong đúng ngày giao** | FACT | Figma bảng `31498:194753` H.2 | High | Yes — OW_DLVR_002 |
| RQ-022 | Phát hành tài khoản hàng loạt chỉ áp dụng cho tài xế trạng thái `有効`; dòng khác bị loại khỏi phạm vi gửi | FACT | Figma bảng `31498:194744` No.2 + No.5 | High | Yes — OW_STAF_005 |
| RQ-023 | Hạn định nghĩa "gần hết hạn" của 賞味期限 (để tô đỏ) | UNKNOWN | Figma bảng `31498:195511` No.9 ghi "※Số ngày cụ thể xác định 'gần hết hạn' chưa xác nhận" | — | No — xem OQ-08 |
| RQ-024 | Cách hiển thị "契約書" khi tick đồng ý ở form đăng ký (link / popup) | UNKNOWN | Figma bảng `31498:195504` B.3 ghi "※Cách xem 'hợp đồng' chưa được xác nhận" | — | No — xem OQ-09 |
| RQ-025 | Lựa chọn của dropdown `件数/ページ` | UNKNOWN | Figma bảng `31498:194755` P.3 ghi "Danh sách lựa chọn cần xác nhận"; chỉ biết default = 10 | — | Một phần — default 10 là FACT |
| RQ-026 | Login **không có** cơ chế khóa tài khoản sau N lần sai | FACT | Figma bảng `31498:194739` No.3 — "Không có tính năng khóa" | High | Yes — OW_AUTH_001 |
| RQ-027 | Mã OTP reset mật khẩu gồm 4 chữ số, có countdown gửi lại (mm:ss) | FACT | Figma bảng `31498:195506` No.1 + No.2; frame `31498:191181` hiển thị `00:59`, frame `31498:191218` ghi TTL 5 phút | High | Yes — OW_AUTH_002 |
| RQ-028 | Sau khi đặt lại mật khẩu thành công, user **được tự đăng nhập** luôn | FACT | Figma bảng `31498:195507` No.4 — "bạn đã đăng nhập thành công" | High | Yes — OW_AUTH_002 |

---

## Actors & Preconditions

| Actor | Vai trò | Hệ thống | Precondition |
|---|---|---|---|
| **Khách vãng lai (chưa có tài khoản)** | Đại diện công ty vận chuyển muốn hợp tác | E05 (public) | Truy cập được URL portal. Không cần đăng nhập. |
| **Outsource Admin** (委託配送先管理者) | Người quản trị của công ty vận chuyển — actor chính | E05 | Có tài khoản `ログインID` + mật khẩu do E03 cấp (hoặc tự đăng ký + được duyệt). Hồ sơ công ty ở trạng thái `有効`. |
| **配送スタッフ / Driver** | Tài xế thuộc công ty vận chuyển | E06 (Driver Web App) | Được Outsource Admin tạo hồ sơ + phát hành tài khoản. **Không** đăng nhập vào E05 — chỉ là đối tượng dữ liệu trong SPEC này. |
| **System Admin (ES Kitchen)** | Vận hành ES Kitchen | E03 | Duyệt hồ sơ `仮登録`, ủy thác đơn giao hàng, đăng お知らせ, gửi 見積もり依頼. **Không** thao tác trên E05. |
| **System (actor hệ thống)** | Tiến trình tự động | — | Tự động: sinh mã tài xế, tự điền địa chỉ từ mã bưu điện, tính chênh lệch tồn kho, ghi log 変更履歴 **của tài xế**, gửi email OTP / thông tin đăng nhập. |

**Precondition chung cho mọi màn sau đăng nhập:**
- Phiên đăng nhập còn hiệu lực (JWT hợp lệ).
- Hồ sơ công ty vận chuyển ở trạng thái `有効`.
- Dữ liệu đơn giao hàng chỉ giới hạn trong phạm vi được ES Kitchen ủy thác cho công ty đó.

**Số repo bị ảnh hưởng: 2** (`es-kitchen-api` + `es-kitchen-web-outsource-web-private`) → **cross-repo** → PM cần `Contract Lock` (REST API) trước Phase 3.

---

## Flow Tổng Quan

> Granularity: **[B] Standard** — 8 business flow.

### Flow 1 — Đăng nhập

```
Khách → OW_AUTH_001 Đăng nhập → Nhập ログインID + mật khẩu → [OK]    → OW_HOME_001 Trang chủ
                                                            → [Sai]   → Inline error "ログインIDまたはパスワードが正しくありません。"
                                                            → [Quên]  → OW_AUTH_002 Đặt lại mật khẩu
                                                            → [新規]  → OW_AUTH_003 Form đăng ký bước 1
```

### Flow 2 — Tự đăng ký hợp tác (新規登録)

```
Khách → OW_AUTH_003 Bước 1/2 Thông tin cơ bản (pháp nhân + bảng người phụ trách)
      → [Tiếp theo — chỉ bật khi validate xong toàn bộ mục bắt buộc]
      → OW_AUTH_004 Bước 2/2 Năng lực giao hàng (khu vực 3 tầng + xe + thiết bị + đồng ý hợp đồng)
      → [Đăng ký] → Hồ sơ trạng thái 仮登録 → OW_AUTH_005 Đã gửi đăng ký [INFERENCE]
                  → System Admin (E03) duyệt → tài khoản kích hoạt → email thông tin đăng nhập
      → [Hủy ở bất kỳ bước nào] → Dialog xác nhận → OW_AUTH_001
```

### Flow 3 — Đặt lại mật khẩu (Reset PW)

```
OW_AUTH_002 (Wizard 4 bước)
  Bước 1 Nhập ログインID + email → [Gửi mã xác minh]
  Bước 2 Nhập OTP 4 số (TTL 5 phút, countdown gửi lại mm:ss) → [Xác nhận]
  Bước 3 Nhập mật khẩu mới + xác nhận (8–20 ký tự, 半角英数字) → [Xác nhận]
  Bước 4 Hoàn tất — hệ thống tự đăng nhập → [Về màn hình chính] → OW_HOME_001
        ↓ [Email chưa đăng ký] → Inline error "このメールアドレスは登録されていません。"
        ↓ [OTP sai / hết hạn]  → Inline error tương ứng
```

### Flow 4 — Trang chủ & Thông báo

```
OW_HOME_001 Trang chủ (3 khối: lịch tháng / お知らせ / 見積もり依頼 chưa phản hồi)
  → [Click ô lịch]        → OW_SCHD_002 Lịch tuần chứa ngày đó
  → [スケジュールへ]        → OW_SCHD_001 Lịch tháng
  → [Click tiêu đề お知らせ] → OW_ANNO_002 Chi tiết thông báo → [一覧に戻る] → OW_HOME_001
  → [Click 見積もり依頼]    → Màn trả lời báo giá [OUT OF SCOPE — xem OQ-05]
```

### Flow 5 — Lịch trình giao hàng

```
OW_SCHD_001 Lịch tháng (badge số đơn theo 温度帯 + ⚠ chưa gán tài xế + 凡例)
  ⇄ [Toggle 月/週] ⇄ OW_SCHD_002 Lịch tuần (7 cột, mỗi ngày là danh sách điểm giao)
  → [Click ô ngày / dòng đơn] → OW_DLVR_002 Chi tiết giao hàng
  → [Tìm kiếm mở rộng 6 điều kiện] → Lọc lại lịch
```

### Flow 6 — Quản lý giao hàng & điều phối tài xế

```
OW_DLVR_001 Danh sách giao hàng (12 cột + bộ lọc 11 điều kiện + phân trang)
  → [Click 配送No] → OW_DLVR_002 Chi tiết giao hàng (4 tab)
        ├─ Tab 配送概要 → [Chọn tài xế từ dropdown có search] → [確定] → Toast "配送スタッフ設定完了しました。"
        │                 ↓ [ngày hiện tại − ngày ship ≥ 7] → Nút 編集 disabled
        ├─ Tab 配送住所 → Xem tài liệu 公開 (chỉ tải) / quản lý tài liệu 非公開 (thêm ≤20 file, xóa)
        │                 → [Click thumbnail] → OW_DLVR_003 Viewer ảnh/PDF
        ├─ Tab 実績     → Xem số hàng hủy + kết quả trưng bày do tài xế báo (chỉ đọc)
        └─ Tab 添付資料  → Xem 駐車報告 + 集金報告 [INFERENCE]
```

### Flow 7 — Đối soát tiền thu & phí đỗ xe

```
OW_CLCT_001 Quản lý thu tiền (mặc định kỳ = ngày 1 → ngày cuối tháng hiện tại)
  → [Tìm theo kỳ + mã/tên tài xế] → Bảng theo tài xế + 2 summary (集金合計 / 駐車合計)
  → [Click tên tài xế] → OW_STAF_003 tab 担当配送情報
  → [CSV出力] → Tải file `集金管理_{開始日}-{終了日}_{条件}_{出力日時}.csv` (7 cột, 1 dòng / 1 配送)
```

### Flow 8 — Quản lý tài xế & hồ sơ công ty

```
OW_STAF_001 Danh sách tài xế (checkbox + 免許 thumbnail + ステータス + アカウント状態)
  → [＋新規登録]            → OW_STAF_004 Form đăng ký tài xế
  → [Click tên tài xế]      → OW_STAF_003 Chi tiết tài xế (3 tab: 基本情報 / 担当配送情報 / 変更履歴)
  → [Chọn ≥1 dòng → アカウント一括発行] → OW_STAF_005 Modal xác nhận
        → [発行する] → [Toàn bộ OK]  → Popup thành công
                     → [Một phần lỗi] → Popup có nút 再度実行 (chỉ gửi lại dòng lỗi)
                     → [0 dòng hợp lệ] → Nút 発行する disabled

Sidebar → プロフィール → OW_PROF_001 Thông tin cơ bản  ⇄ [Tab] ⇄ OW_PROF_002 Năng lực giao hàng
        → [編集] → chế độ sửa → [保存 / キャンセル]
```

---

## Happy Path

### HP-1 — Đăng nhập thành công

1. Outsource Admin mở URL portal → hệ thống hiển thị `OW_AUTH_001`.
2. Nhập `ログインID` (1–255 ký tự, 半角英数字) và mật khẩu (≥8 ký tự, có chữ + số).
3. Nhấn **ログイン** → hệ thống validate toàn bộ field cùng lúc rồi gọi API xác thực.
4. Xác thực thành công → điều hướng sang `OW_HOME_001`.

### HP-2 — Tự đăng ký hợp tác

1. Tại `OW_AUTH_001` nhấn **新規登録** → `OW_AUTH_003`.
2. Điền khối **基本情報**: 委託配送先名, カナ (tự sinh khi mất focus), 郵便番号 (nhập đủ 7 số → tự điền 都道府県/市区町村/町域), 電話番号; FAX và 建物・部屋番号 là tùy chọn.
3. Điền khối **担当者**: mỗi dòng gồm 区分 (メイン/サブ), 担当者名, フリガナ, メールアドレス, TEL. Nhấn **行を追加** để thêm người phụ trách phụ; dòng メイン担当者 không xóa được.
4. Nút **次へ** bật khi toàn bộ mục bắt buộc hợp lệ → `OW_AUTH_004`.
5. Điền **対応エリア** (cây 3 tầng: vùng → tỉnh, đồng bộ 2 chiều với vùng tag), **保有車両** (multi-select), 3 lựa chọn thiết bị (radio), ghi chú tùy chọn.
6. Tick **契約書に同意します。** → nút **登録** bật.
7. Nhấn **登録** → hồ sơ được tạo ở trạng thái `仮登録`, chờ System Admin (E03) phê duyệt.

### HP-3 — Đặt lại mật khẩu

1. Tại `OW_AUTH_001` nhấn **パスワードを忘れた方はこちら** → `OW_AUTH_002` bước 1.
2. Nhập `ログインID` + email đã đăng ký → nhấn **認証コードを送信**.
3. Nhận email chứa mã 4 chữ số → nhập ở bước 2 (TTL 5 phút) → **確認**.
4. Nhập mật khẩu mới + nhập lại để xác nhận → **確認**.
5. Bước 4 hiển thị thông báo hoàn tất, hệ thống **tự đăng nhập** → nhấn **ホーム画面へ** → `OW_HOME_001`.

### HP-4 — Nắm lịch và mở đơn giao hàng

1. Tại `OW_HOME_001`, khối lịch tháng hiển thị mỗi ngày: nhãn phân tuần A/B/C/D, số đơn, badge ⚠N đơn chưa gán tài xế, viền xanh cho ngày hôm nay.
2. Nhấn **スケジュールへ** → `OW_SCHD_001` (lịch tháng đầy đủ + bộ lọc 6 điều kiện mở rộng + 凡例).
3. Toggle **週** → `OW_SCHD_002`: 7 cột Thứ 2→CN, mỗi ngày là danh sách điểm giao có icon 温度帯.
4. Nhấn 1 dòng → `OW_DLVR_002`.

### HP-5 — Gán tài xế cho đơn giao hàng

1. Tại `OW_DLVR_001`, lọc theo kỳ (mặc định hôm nay → cuối tháng) → nhấn **検索**.
2. Nhấn **配送No** của đơn có cột `配送スタッフID` trống → `OW_DLVR_002` tab **配送概要**, hiển thị badge đỏ **⚠ 未設定**.
3. Mở dropdown **配送スタッフ**, gõ tên hoặc ID để lọc; mỗi ứng viên hiển thị Họ tên · ID · số đơn của tài xế đó trong đúng ngày giao.
4. Chọn tài xế → nhấn **確定** → toast `配送スタッフ設定完了しました。`, badge **⚠ 未設定** biến mất.

### HP-6 — Bổ sung tài liệu đường vào giao hàng (非公開)

1. Tại `OW_DLVR_002` chuyển tab **配送住所**.
2. Khối **搬入経路・添付資料（公開）**: chỉ xem / tải (nguồn do phía công ty nhận hàng cung cấp).
3. Khối **非公開の搬入経路・添付資料**: nhấn **ファイルを追加** → chọn file JPG/JPEG/PNG ≤5MB → upload thành công → toast `非公開資料をアップロードしました。`
4. Nhấn thumbnail → `OW_DLVR_003` viewer: tải xuống, zoom ±, điều hướng ＜/＞ trong cùng nhóm, pager `1/6`, menu ︙ → 削除 (chỉ có ở nhóm 非公開, không có dialog xác nhận).

### HP-7 — Đối soát tiền và xuất CSV

1. Vào **集金・駐車** → `OW_CLCT_001`, kỳ mặc định = ngày 1 → ngày cuối tháng hiện tại.
2. Nhập mã/tên tài xế (khớp gần đúng) → **検索**.
3. Đọc 2 summary: **集金合計金額** và **駐車合計料金** (tổng toàn bộ kết quả tìm kiếm, không chỉ trang hiện tại).
4. Nhấn **CSV出力** → tải file tên `集金管理_20260818-20260831_全配送スタッフ_20260907163511.csv`, nội dung **chi tiết từng đơn** (7 cột), khác với bảng hiển thị theo tài xế trên màn hình.

### HP-8 — Phát hành tài khoản tài xế hàng loạt

1. Tại `OW_STAF_001` tick checkbox các tài xế cần phát hành → nút **アカウント一括発行** bật.
2. Nhấn nút → `OW_STAF_005` hiển thị bảng toàn bộ dòng đã chọn; dòng có trạng thái ≠ `有効` bị tô nền xám, cột email để trống, kèm dòng đỏ "Lỗi: N trường hợp phát sinh."
3. Nhấn **発行する** → hệ thống chỉ gửi email thông tin đăng nhập cho các dòng `有効`.
4. Toàn bộ thành công → popup dấu tích xanh "Đã hoàn tất phát hành tài khoản" → **完了** → quay lại `OW_STAF_001`, cột `アカウント状態` chuyển `発行済み`.

### HP-9 — Cập nhật hồ sơ công ty

1. Sidebar → **プロフィール** → `OW_PROF_001` (chế độ xem).
2. Nhấn **編集** → toàn bộ field chuyển sang nhập được; có nút **住所検索**.
3. Sửa xong nhấn **保存** → quay về chế độ xem. ⚠️ Figma **không** có tab `変更履歴` ở màn プロフィール (chỉ 配送スタッフ詳細 mới có) — chưa rõ thay đổi hồ sơ công ty có được ghi log không → OQ-18.
4. Chuyển tab **配送対応情報** → `OW_PROF_002`, sửa chip khu vực / xe / thiết bị tương tự.

---

## Alternative Flows & Edge Cases

### AF-1 — Đăng nhập

| # | Tình huống | Xử lý |
|---|---|---|
| AF-1.1 | Sai ID hoặc mật khẩu | Hiển thị `ログインIDまたはパスワードが正しくありません。` — **không** khóa tài khoản dù sai nhiều lần (RQ-026) |
| AF-1.2 | Bỏ trống field | Validate toàn bộ cùng lúc khi nhấn nút, không validate từng field khi rời focus |
| AF-1.3 | Tài khoản còn ở trạng thái `仮登録` | `UNKNOWN` — chưa có evidence về message hiển thị → OQ-07 |

### AF-2 — Đăng ký

| # | Tình huống | Xử lý |
|---|---|---|
| AF-2.1 | Mã bưu điện không tồn tại | **Không** làm gì: không báo lỗi, giữ nguyên giá trị đã nhập (FACT — bảng `195503` A.1.4) |
| AF-2.2 | Email người phụ trách trùng với bản ghi hợp lệ khác | Server-side check → `このメールアドレスは既に使用されています。` |
| AF-2.3 | Tick vùng cha trong cây 対応エリア | Tự động tick toàn bộ tỉnh con; tick một phần → vùng cha hiển thị `－` (indeterminate) |
| AF-2.4 | Bấm × trên tag khu vực | Bỏ tick tỉnh tương ứng trong cây (đồng bộ 2 chiều) |
| AF-2.5 | Nhấn **キャンセル** | Hiển thị dialog xác nhận trước khi rời form |
| AF-2.6 | Quay lại bước 1 từ bước 2 | `UNKNOWN` — Figma không có nút 戻る ở bước 2 → OQ-10 |

### AF-3 — Đặt lại mật khẩu

| # | Tình huống | Xử lý |
|---|---|---|
| AF-3.1 | Email chưa đăng ký | `このメールアドレスは登録されていません。` |
| AF-3.2 | OTP sai | `認証コードが正しくありません。` |
| AF-3.3 | OTP quá 5 phút | `認証コードの有効期限が切れています。` |
| AF-3.4 | Nhấn 再送信 khi countdown chưa về 0 | Link bị vô hiệu; countdown hiển thị mm:ss (ví dụ `00:59`) |
| AF-3.5 | Mật khẩu xác nhận không khớp | `パスワードが一致しません。` |

### AF-4 — Giao hàng

| # | Tình huống | Xử lý |
|---|---|---|
| AF-4.1 | `ngày hiện tại − ngày ship ≥ 7` | Nút **編集** disabled. `[UNKNOWN]` mốc ngày + BE có chặn không → OQ-02 |
| AF-4.2 | Đơn chưa gán tài xế | Badge đỏ **⚠ 未設定** ở chi tiết; cột ID/tên tài xế để trống ở danh sách; badge **⚠N件** trên lịch |
| AF-4.3 | Upload file thứ 21 vào nhóm 非公開 | `「Chỉ có thể đăng ký tối đa 20 file.」` (câu đề xuất trong Figma — cần chốt bản JP chính thức) |
| AF-4.4 | Upload sai định dạng / quá 5MB | `Vui lòng tải lên tệp hình ảnh có định dạng JPG, JPEG hoặc PNG.` / `Dung lượng tối đa của tệp hình ảnh tải lên là 5MB.` |
| AF-4.5 | Xóa file 非公開 từ viewer | **Không** có dialog xác nhận (FACT — bảng `195509` No.3) |
| AF-4.6 | Xem file thuộc nhóm 公開 | Menu ︙ (xóa) **không** hiển thị |
| AF-4.7 | 送り状No có nhiều giá trị vượt khung | Rút gọn dạng `N…`, hover hiện tooltip đầy đủ |
| AF-4.8 | Tài xế chưa báo 実績 | `UNKNOWN` — Figma không định nghĩa trạng thái rỗng của tab 実績 → OQ-08 |

### AF-5 — Tài xế / tài khoản

| # | Tình huống | Xử lý |
|---|---|---|
| AF-5.1 | Chọn 0 dòng rồi bấm アカウント一括発行 | Nút disabled |
| AF-5.2 | Toàn bộ dòng đã chọn đều ≠ `有効` | Nút **発行する** trong modal disabled |
| AF-5.3 | Gửi hàng loạt thành công một phần | Popup dấu `!` đỏ, hiển thị `Thành công: N / Thất bại: M`, có nút **再度実行** chỉ gửi lại dòng lỗi |
| AF-5.4 | Tài xế đã có tài khoản | Mật khẩu bị reset, tài xế phải đăng nhập lại (cảnh báo hiển thị sẵn trong văn bản hướng dẫn của modal) |
| AF-5.5 | Cập nhật tài xế bằng CSV | Cột `変更者` của 変更履歴 ghi `CSV取込` thay vì tên người dùng |

### Giả định cần verify

- `[INFERENCE — cần verify]` **RQ-012**: tab `配送対応情報` của プロフィール dùng chung data model với Step 2 form đăng ký. Nếu sai, cần bảng 画面設計書 riêng cho プロフィール.
- `[INFERENCE — cần verify]` **RQ-016**: tồn tại màn `OW_AUTH_005` xác nhận đã gửi đăng ký.
- `[INFERENCE — cần verify]` **RQ-017**: cấu trúc tab `添付資料` của 配送詳細.

---

## Acceptance Criteria

### AC nhóm Auth

| ID | Acceptance Criteria | Nguồn |
|---|---|---|
| AC-01 | Nhấn **ログイン** khi ID trống → hiển thị `ログインIDを入力してください。`; khi mật khẩu trống → `パスワードを入力してください。`; mật khẩu <8 ký tự hoặc thiếu chữ/số → `8文字以上で、英字・数字を含めてください。` | RQ-003 |
| AC-02 | Sai ID/mật khẩu 10 lần liên tiếp → tài khoản **vẫn đăng nhập được** khi nhập đúng (không có cơ chế khóa) | RQ-026 |
| AC-03 | Nhấn icon con mắt → trường mật khẩu chuyển `password` ↔ `text` | RQ-003 |
| AC-04 | Nhập mã bưu điện đủ 7 số rồi rời focus → 都道府県 / 市区町村 / 町域・番地 được điền tự động và vẫn sửa tay được | RQ-003 |
| AC-05 | Mã bưu điện không tồn tại → **không** hiện lỗi, **không** xóa giá trị đã nhập | RQ-003 |
| AC-06 | Nhập 委託配送先名 rồi rời focus → trường カナ tự sinh 全角カナ; nhập 半角カナ tay → `カナは全角カナで入力してください。` | RQ-003 |
| AC-07 | Nút **次へ** ở bước 1 disabled cho tới khi toàn bộ mục bắt buộc của bước 1 hợp lệ | RQ-003 |
| AC-08 | Dòng `メイン担当者` không có nút xóa; dòng `サブ担当者` có nút xóa | RQ-003 |
| AC-09 | Tick 1 vùng cha trong cây 対応エリア → toàn bộ tỉnh con được tick; bỏ tick 1 tỉnh con → vùng cha chuyển `－` | RQ-003 |
| AC-10 | Nút **登録** ở bước 2 disabled cho tới khi 対応エリア ≥1, 保有車両 ≥1, 3 lựa chọn thiết bị đã chọn **và** đã tick đồng ý hợp đồng | RQ-003 |
| AC-11 | Submit form đăng ký thành công → hồ sơ ở trạng thái `仮登録`, **chưa** đăng nhập được cho tới khi E03 duyệt | RQ-002 |
| AC-12 | OTP nhập sai → `認証コードが正しくありません。`; quá 5 phút → `認証コードの有効期限が切れています。` | RQ-027 |
| AC-13 | Countdown gửi lại hiển thị định dạng `mm:ss` và link **再送信** chỉ bật khi countdown = `00:00` | RQ-027 |
| AC-14 | Đặt lại mật khẩu thành công → user **đã ở trạng thái đăng nhập**, nhấn **ホーム画面へ** vào thẳng `OW_HOME_001` không phải nhập lại credential | RQ-028 |

### AC nhóm Trang chủ / Lịch

| ID | Acceptance Criteria | Nguồn |
|---|---|---|
| AC-15 | Ô lịch của ngày hệ thống có viền xanh đậm và **chỉ duy nhất 1 ô** có viền này | RQ-003 |
| AC-16 | Ngày có đơn chưa gán tài xế hiển thị badge đỏ `⚠N件`; N = đúng số đơn chưa gán trong ngày đó | RQ-003 |
| AC-17 | Nhãn phân tuần hiển thị đúng màu: tuần A = xanh dương, B = xanh lá, C = cam, D = hồng, tháng trước/sau = xám | RQ-003 |
| AC-18 | Click 1 ô lịch ở trang chủ → sang màn lịch **tuần** chứa ngày đó (không phải lịch tháng) | RQ-003 |
| AC-19 | Danh sách お知らせ sắp xếp mới nhất → cũ nhất, hiển thị thời gian tương đối `Hôm nay・HH:mm` / `Hôm qua・HH:mm` | RQ-003 |
| AC-20 | Lịch tháng: mỗi ngày hiển thị badge số lượng riêng cho từng 温度帯 (❄ đông lạnh / 🗄 mát・thường / 📦 vật tư) | RQ-003 |
| AC-21 | Nút **今日** đưa lịch về tháng chứa ngày hệ thống | RQ-003 |
| AC-22 | Lịch tuần: ngày không có lịch giao hiển thị ô trống; tên điểm giao vượt khung → rút gọn `...` + tooltip khi hover | RQ-003 |

### AC nhóm Giao hàng

| ID | Acceptance Criteria | Nguồn |
|---|---|---|
| AC-23 | Vào `OW_DLVR_001` lần đầu → kỳ tìm kiếm mặc định = **hôm nay → ngày cuối tháng đó** | RQ-003 |
| AC-24 | Nút **クリア** reset toàn bộ điều kiện tìm kiếm về mặc định | RQ-003 |
| AC-25 | Đơn chưa gán tài xế → cột `配送スタッフID` và `配送スタッフ名` **để trống** (không hiển thị chữ "未割当") | RQ-003 |
| AC-26 | Phân trang hiển thị `{Tổng}件中 {Từ}−{Đến}件`, mặc định 10 dòng/trang | RQ-003 |
| AC-27 | Dropdown chọn tài xế chỉ liệt kê tài xế trạng thái `有効`, có ô tìm theo tên/ID, mỗi ứng viên hiển thị số đơn **của đúng ngày giao đơn đang mở** | RQ-021 |
| AC-28 | Nhấn **確定** sau khi chọn tài xế → toast `配送スタッフ設定完了しました。` và badge `⚠ 未設定` biến mất | RQ-003 |
| AC-29 | Nhấn **キャンセル** → quay lại trạng thái tài xế trước đó (chưa gán hoặc tài xế cũ), không lưu | RQ-003 |
| AC-30 | Khi `ngày hiện tại − ngày ship ≥ 7` → nút **編集** ở tab 配送概要 disabled | RQ-006 |
| AC-31 | Khối tài liệu **公開** không có nút thêm/xóa; khối **非公開** có nút **ファイルを追加** và nút xóa từng file | RQ-007 |
| AC-32 | Upload file thứ 21 vào nhóm 非公開 → bị từ chối kèm message giới hạn 20 file | RQ-007 |
| AC-33 | Upload file ≠ JPG/JPEG/PNG hoặc >5MB → bị từ chối kèm message tương ứng | RQ-007 |
| AC-34 | Trong viewer, file nhóm **公開** không hiển thị menu ︙; file nhóm **非公開** hiển thị menu ︙ có mục 削除 và **không** có dialog xác nhận | RQ-003 |
| AC-35 | Viewer PDF **không** preview nội dung — chỉ hiển thị dung lượng + nút tải; nút zoom bị disabled | `Figma-Analysis.md` §2.4 |
| AC-36 | Tab 実績: `差異 = 理論在庫 − 実在庫` và `誤差 = 予定数 − 実際数`, tự tính, tô đỏ khi ≠ 0 | RQ-003 |
| AC-37 | Tab 実績: ô 廃棄数 tô đỏ khi giá trị > 0 | RQ-003 |
| AC-38 | Toàn bộ trường của tab 配送住所 và tab 実績 là **chỉ đọc** trên portal E05 | RQ-003 |

### AC nhóm Thu tiền

| ID | Acceptance Criteria | Nguồn |
|---|---|---|
| AC-39 | Vào `OW_CLCT_001` lần đầu → kỳ mặc định = **ngày 1 → ngày cuối tháng hiện tại** | RQ-003 |
| AC-40 | 2 summary `集金合計金額` / `駐車合計料金` tính trên **toàn bộ kết quả tìm kiếm**, không chỉ trang hiện tại | RQ-003 |
| AC-41 | Tên file CSV theo đúng mẫu `集金管理_{開始日}-{終了日}_{配送スタッフ検索条件}_{出力日時}.csv`; khi không lọc tài xế thì phần điều kiện là `全配送スタッフ` | RQ-010 |
| AC-42 | Nội dung CSV là **chi tiết từng đơn giao hàng** (1 dòng = 1 配送), khác với bảng trên màn hình (1 dòng = 1 tài xế) | RQ-003 |
| AC-43 | Click tên tài xế trong bảng → sang `OW_STAF_003` tab 担当配送情報 của tài xế đó | RQ-003 |

### AC nhóm Tài xế / Hồ sơ

| ID | Acceptance Criteria | Nguồn |
|---|---|---|
| AC-44 | Nút **アカウント一括発行** disabled khi chọn 0 dòng, bật khi chọn ≥1 dòng | RQ-022 |
| AC-45 | Trong modal, dòng có trạng thái ≠ `有効` bị tô nền xám, cột email để trống, và **không** nằm trong phạm vi gửi | RQ-022 |
| AC-46 | Nếu toàn bộ dòng đã chọn đều không hợp lệ → nút **発行する** disabled | RQ-022 |
| AC-47 | Gửi thành công một phần → popup hiển thị `Thành công: N` / `Thất bại: M` và có nút **再度実行** chỉ gửi lại các dòng lỗi | RQ-022 |
| AC-48 | Nhấn **キャンセル** trong modal → đóng modal, **giữ nguyên** các checkbox đã chọn ở màn danh sách | RQ-003 |
| AC-49 | Badge trạng thái tài xế đúng màu: 有効 = xanh, 免許未登録 = vàng, 停止 = đỏ, 無効 = xám | RQ-020 |
| AC-50 | Cột `アカウント状態` chỉ có 2 giá trị: `未発行` / `発行済み` | RQ-003 |
| AC-51 | Ảnh 免許証 bắt buộc khi tạo tài xế; sai định dạng → `Vui lòng tải lên file định dạng JPG, JPEG, PNG.`; >5MB → `Dung lượng file tối đa 5MB.` | RQ-003 |
| AC-52 | `ログインID` của tài xế hiển thị **cùng giá trị** với `配送スタッフID` và không sửa được | RQ-003 |
| AC-53 | Tab 変更履歴 ghi log dạng `{Tên mục}を『{Trước} → {Sau}』に変更`; khi tạo mới ghi `データ登録`; cập nhật qua CSV ghi 変更者 = `CSV取込` | RQ-018 |
| AC-54 | Tab 担当配送情報 hiển thị 2 summary 集金/駐車 tính trên toàn bộ kết quả tìm kiếm của tài xế đó | RQ-003 |
| AC-55 | Màn プロフィール ở chế độ xem: mọi field read-only; nhấn **編集** → toàn bộ field chuyển sang nhập được và xuất hiện nút **住所検索** | RQ-011 |

---

## Out of Scope

**Không làm trong phạm vi SPEC này:**

1. **Cụm 見積もり (LOGI CORE)** — 3 frame `quote-request-list` / `quote-request-response` / `quote-request-details`. Lý do: nằm ngoài mọi Flow note, dùng branding `LOGI CORE` và sidebar khác với component `sider` chính thức. Mục nav `見積もり管理` **vẫn giữ** trong sidebar nhưng màn hình chưa chốt → OQ-05.
2. **Frame `weekly-schedule`** (`31498:194865`) — bản lịch tuần thay thế theo ca 午前/午後/夕方便, khác bản chính `31498:191010`. Không implement.
3. **Frame `empty-form`** (`31498:195410`) — bản cũ của form đăng ký (branding `ES KITCHEN`, label lỗi `ラベル`). Trùng lặp với `R01_Register Form`.
4. **Luồng phê duyệt hồ sơ `仮登録` phía E03** — thuộc `es-kitchen-web-admin` (E03), sẽ có SPEC riêng. SPEC này chỉ đặc tả tới thời điểm đối tác submit.
5. **Driver App (E06)** — màn nhập 廃棄数 / 陳列結果 / 駐車報告 / 集金報告 là của `es-kitchen-webapp-driver`. SPEC này chỉ đặc tả phần **hiển thị lại** số liệu đó trên E05.
6. **Fee-area (phí theo khu vực)** — `FeeAreaTab` / `FeeEditModal` / import-export CSV phí đang chạy ở production nhưng biến mất khỏi Figma P2. **Không xóa** cho tới khi có quyết định → OQ-04.
7. **Đổi cột CSV 集金** — giữ nguyên 7 cột hiện tại cho tới khi vận hành đồng ý → OQ-03.
8. **Đa ngôn ngữ / i18n** — portal chỉ có tiếng Nhật.
9. **Responsive mobile / tablet** — portal chỉ hỗ trợ desktop 1440×1024.

---

## Screens

> **TỔNG: 85 màn hình** = **19 màn chính** + **66 màn lỗi/popup**.
>
> | Loại | Số lượng | Đếm vào tổng? |
> |---|---|---|
> | Màn hình chính | 19 | ✅ |
> | Toast / Modal / Popup / Banner / Full screen / Empty state | 66 | ✅ |
> | Inline error / Button disabled / Tooltip / Chặn UI | 59 | ❌ — chỉ là state |
> | **Tổng error display định nghĩa** | **125** | |
> | `UNKNOWN` — chưa thiết kế, chờ chốt | 22 | ❌ — xem `## Open Questions` OQ-12 |
> | `N/A` — nhóm không áp dụng | 45 | ❌ |
>
> *(Số liệu đếm bằng script quét 19 bảng Non-Happy 4 cột trong `## Screen Details`, không đếm bằng mắt.)*

**Base URL Figma nguồn:** `https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=`

| Screen Code | Screen | Actor | App | Screen Type | Figma Link (frame nguồn) | Transition To |
|---|---|---|---|---|---|---|
| `OW_AUTH_001` | ログイン — Đăng nhập | Khách / Outsource Admin | E05 | Form | [`31498-191137`](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=31498-191137) | `[OK] → OW_HOME_001` / `[Quên] → OW_AUTH_002` / `[新規登録] → OW_AUTH_003` |
| `OW_AUTH_002` | パスワード再設定 — Đặt lại mật khẩu (4 bước) | Outsource Admin | E05 | Wizard | [`31498-191164`](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=31498-191164) | `→ OW_HOME_001` (tự đăng nhập sau bước 4) |
| `OW_AUTH_003` | 申し込むフォーム 1/2 — Đăng ký bước 1: Thông tin cơ bản | Khách | E05 | Form | [`31498-191305`](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=31498-191305) | `[次へ] → OW_AUTH_004` / `[キャンセル] → OW_AUTH_001` |
| `OW_AUTH_004` | 申し込むフォーム 2/2 — Đăng ký bước 2: Năng lực giao hàng | Khách | E05 | Form | [`31498-191407`](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=31498-191407) | `[登録] → OW_AUTH_005` |
| `OW_AUTH_005` * | 申し込み完了 — Đã gửi đăng ký (仮登録) | Khách | E05 | Detail | ❌ **Chưa có frame** | `→ OW_AUTH_001` |
| `OW_HOME_001` | ホーム — Trang chủ | Outsource Admin | E05 | Dashboard | [`31498-189875`](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=31498-189875) | `→ OW_SCHD_002` / `→ OW_SCHD_001` / `→ OW_ANNO_002` |
| `OW_ANNO_002` | お知らせ詳細 — Chi tiết thông báo | Outsource Admin | E05 | Detail | [`31498-190280`](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=31498-190280) | `[一覧に戻る] → OW_HOME_001` |
| `OW_SCHD_001` | スケジュール（月） — Lịch tháng | Outsource Admin | E05 | Calendar | [`31498-190314`](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=31498-190314) | `[Click ô ngày] → OW_SCHD_002` / `[Toggle 週] → OW_SCHD_002` |
| `OW_SCHD_002` | スケジュール（週） — Lịch tuần | Outsource Admin | E05 | Calendar | [`31498-191010`](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=31498-191010) | `[Click dòng] → OW_DLVR_002` / `[Toggle 月] → OW_SCHD_001` |
| `OW_DLVR_001` | 配送管理一覧 — Danh sách giao hàng | Outsource Admin | E05 | List | [`31498-191879`](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=31498-191879) | `[Click 配送No] → OW_DLVR_002` |
| `OW_DLVR_002` | 配送詳細 — Chi tiết giao hàng (4 tab) | Outsource Admin | E05 | Detail | [`31498-190718`](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=31498-190718) | `[Click thumbnail] → OW_DLVR_003` |
| `OW_DLVR_003` | ファイルビューア — Viewer ảnh / PDF | Outsource Admin | E05 | Modal | [`31498-193797`](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=31498-193797) | `[×] → OW_DLVR_002` |
| `OW_CLCT_001` | 集金管理（集金・駐車） — Quản lý thu tiền | Outsource Admin | E05 | Report | [`31498-192123`](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=31498-192123) | `[Click tên tài xế] → OW_STAF_003` |
| `OW_STAF_001` | 配送スタッフ一覧 — Danh sách tài xế | Outsource Admin | E05 | List | [`31498-192233`](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=31498-192233) | `[Click tên] → OW_STAF_003` / `[＋新規登録] → OW_STAF_004` / `[一括発行] → OW_STAF_005` |
| `OW_STAF_003` | 配送スタッフ詳細 — Chi tiết tài xế (3 tab) | Outsource Admin | E05 | Detail | [`31498-192537`](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=31498-192537) | `[Click 配送No] → OW_DLVR_002` |
| `OW_STAF_004` | 配送スタッフ登録・編集 — Form tài xế | Outsource Admin | E05 | Form | [`31498-192588`](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=31498-192588) | `[保存] → OW_STAF_001` |
| `OW_STAF_005` | アカウント一括発行 — Modal phát hành tài khoản | Outsource Admin | E05 | Modal | [`31498-194129`](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=31498-194129) | `[完了] → OW_STAF_001` |
| `OW_PROF_001` | プロフィール（基本情報） — Hồ sơ công ty | Outsource Admin | E05 | Detail | [`31498-192935`](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=31498-192935) | `[Tab] → OW_PROF_002` |
| `OW_PROF_002` | プロフィール（配送対応情報） — Năng lực giao hàng | Outsource Admin | E05 | Detail | [`31498-193104`](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=31498-193104) | `[Tab] → OW_PROF_001` |

> `*` `OW_AUTH_005` được suy ra từ RQ-002 (`[INFERENCE — cần verify]`) — canvas Figma **không có frame** cho màn này. Xem OQ-07.

**Quyết định gộp / tách (Test C + Test D theo `spec-template.md`):**

| Cặp UI state | Quyết định | Lý do |
|---|---|---|
| 5 frame Reset PW (`191164` / `191181` / `191218` / `191258` / `191278`) | **GỘP** → 1 `OW_AUTH_002` Screen Type `Wizard` | Test D: mỗi state chỉ tồn tại như 1 bước tuần tự, không deep-link độc lập được. `191181` vs `191218` chỉ khác OTP rỗng/đã nhập → cùng 1 state. |
| `OW_AUTH_003` vs `OW_AUTH_004` | **TÁCH** | Test C PASS: bước 1 là form text + bảng người phụ trách động; bước 2 là cây checkbox 3 tầng + tag + radio group — **cấu trúc UI khác hẳn**. Ngoài ra 2 mã này đã tồn tại trong `Design-Technical.md` + 43 task file → giữ để không phá traceability. |
| `OW_SCHD_001` vs `OW_SCHD_002` | **TÁCH** | Test C PASS: lưới lịch tháng vs 7 cột danh sách cuộn theo ngày. Test D PASS: cả 2 deep-link được qua `?tab=`. |
| 6 frame 配送詳細 (`190718` / `190790` / `190870` / `193358` / `193469` / `193742`) | **GỘP** → 1 `OW_DLVR_002` | Cùng layout khung + cùng điểm vào, khác nhau ở tab đang chọn và trạng thái nút 編集. |
| Viewer ảnh (`193797`) vs viewer PDF (`193947`) | **GỘP** → 1 `OW_DLVR_003` | Cùng modal, khác vùng preview (PDF không preview, zoom disabled) → là **state**, không phải screen khác. |
| 3 tab 配送スタッフ詳細 (`192537` / `192634` / `192891`) | **GỘP** → 1 `OW_STAF_003` | Cùng layout khung + cùng điểm vào. |
| `OW_STAF_004` đăng ký vs chỉnh sửa | **GỘP** | Cùng form, khác chế độ (`配送スタッフID` chỉ đọc khi sửa). |
| `OW_PROF_001` xem (`192935`) vs sửa (`193018`) | **GỘP** | Chế độ xem/sửa của cùng 1 màn. Tương tự `OW_PROF_002` (`193104` / `193191`). |
| `OW_PROF_001` vs `OW_PROF_002` | **TÁCH** | Test C PASS: tab 基本情報 là form địa chỉ/liên hệ; tab 配送対応情報 là cây khu vực + chip + radio thiết bị. Test D PASS: deep-link được qua tab. |

---

## Screen Details

### OW_AUTH_001 — ログイン (Đăng nhập)

**Happy Case:**
- Layout: 1 cột, card căn giữa trên nền trắng. Logo ESSTATION phía trên card.
- Components:

| Vị trí | Component | Nội dung | Action |
|---|---|---|---|
| Top | Logo | Logo ESSTATION | — |
| Body | Input text `ログインID` | Bắt buộc · 1–255 ký tự · 半角英数字 · ID do ES cấp (tương lai có thể đổi sang dạng email) | — |
| Body | Input password `パスワード` | Bắt buộc · ≥8 ký tự · phải có ≥1 chữ + ≥1 số · hiển thị dạng ● | — |
| Body | Icon button 👁 | Chuyển `password` ↔ `text` | Click → toggle hiển thị |
| Body | Button primary `ログイン` | Validate toàn bộ field cùng lúc → gọi API xác thực | Click → `OW_HOME_001` |
| Body | Link `パスワードを忘れた方はこちら` | — | Click → `OW_AUTH_002` |
| Body | Button secondary `新規登録` | — | Click → `OW_AUTH_003` |

- Interactions: validate chỉ chạy khi nhấn nút (không validate khi rời focus). **Không** có cơ chế khóa tài khoản sau N lần sai.
- Animation đề xuất: spinner trên nút trong lúc gọi API.

**Non-Happy Case:**

| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation input | `ログインID` để trống | Inline error | `「ログインIDを入力してください。」` |
| 1 Validation input | `パスワード` để trống | Inline error | `「パスワードを入力してください。」` |
| 1 Validation input | Mật khẩu <8 ký tự hoặc thiếu chữ/số | Inline error | `「8文字以上で、英字・数字を含めてください。」` |
| 2 Auth / session | Sai ID hoặc mật khẩu | Inline error | `「ログインIDまたはパスワードが正しくありません。」` |
| 2 Auth / session | Tài khoản còn ở trạng thái `仮登録` (chưa được E03 duyệt) | `UNKNOWN` | `UNKNOWN` — chưa có evidence → OQ-07 |
| 3 Network | Mất mạng khi submit | Toast | `「ネットワークエラーが発生しました。時間をおいて再度お試しください。」` `[INFERENCE — cần verify]` |
| 4 Server error | API trả 500 | Toast | `「システムエラーが発生しました。管理者にお問い合わせください。」` `[INFERENCE — cần verify]` |
| 5 Empty state | N/A — màn hình không hiển thị danh sách | — | — |
| 6 Conflict | Double-submit khi đang gọi API | Button disabled | — |
| 7 Business rule | N/A — không có rule nghiệp vụ nào chặn đăng nhập ngoài trạng thái tài khoản | — | — |
| 8 External integration | N/A — đăng nhập không gọi dịch vụ ngoài | — | — |

---

### OW_AUTH_002 — パスワード再設定 (Đặt lại mật khẩu — Wizard 4 bước)

> Screen Type `Wizard` — 4 bước dùng chung 1 Screen Code theo Test D.

#### Bước 1 — Nhập ログインID + メールアドレス

| Vị trí | Component | Nội dung | Action |
|---|---|---|---|
| Body | Input `ログインID` | Bắt buộc | — |
| Body | Input `メールアドレス` | Bắt buộc · email nhận mã đặt lại | — |
| Bottom | Button `認証コードを送信` | Gửi mã 4 chữ số đến email đã nhập | Click → Bước 2 |

#### Bước 2 — Nhập mã xác thực

| Vị trí | Component | Nội dung | Action |
|---|---|---|---|
| Body | Input `認証コード` | 4 chữ số nhận qua email · TTL **5 phút** | — |
| Body | Link `再送信` + countdown | Gửi lại mã; sau khi gửi hiển thị đếm ngược `mm:ss` (ví dụ `00:59`) đến khi được gửi lại | Click → gửi lại mã |
| Bottom | Button `確認` | Xác minh mã | Click → Bước 3 |

#### Bước 3 — Đặt mật khẩu mới

| Vị trí | Component | Nội dung | Action |
|---|---|---|---|
| Body | Input password `新しいパスワード` | Bắt buộc · **8–20 ký tự 半角英数字**, phải có chữ + số | — |
| Body | Icon 👁 | Hiện/ẩn mật khẩu | Click → toggle |
| Body | Input password `パスワード（確認用）` | Bắt buộc · phải khớp trường trên | — |
| Body | Icon 👁 | Hiện/ẩn mật khẩu | Click → toggle |
| Bottom | Button `確認` | Lưu mật khẩu mới vào DB | Click → Bước 4 |

#### Bước 4 — Hoàn tất

| Vị trí | Component | Nội dung | Action |
|---|---|---|---|
| Body | Message hoàn tất | "Quá trình đặt lại mật khẩu hoàn tất, bạn đã đăng nhập thành công. Giờ bạn có thể tiếp tục sử dụng dịch vụ." | — |
| Bottom | Button `ホーム画面へ` | Hệ thống **đã tự đăng nhập** ở bước này | Click → `OW_HOME_001` |

**Non-Happy Case:**

| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation input | `ログインID` để trống (bước 1) | Inline error | `「ログインIDは必須項目です。」` |
| 1 Validation input | `メールアドレス` để trống (bước 1) | Inline error | `「メールアドレスは必須項目です。」` |
| 1 Validation input | `認証コード` để trống (bước 2) | Inline error | `「認証コード入力は必須項目です。」` |
| 1 Validation input | Mật khẩu mới để trống (bước 3) | Inline error | `「新しいパスワードは必須項目です。」` |
| 1 Validation input | Mật khẩu mới không đủ 8 ký tự / thiếu chữ hoặc số | Inline error | `「8桁以上で英文字・数字を含めてください。」` |
| 1 Validation input | Mật khẩu xác nhận không khớp | Inline error | `「パスワードが一致しません。」` |
| 2 Auth / session | ID đăng nhập sai (bước 1) | Inline error | `「ログインIDまたはメールアドレスが正しくありません。」` |
| 2 Auth / session | Mã OTP không khớp | Inline error | `「認証コードが正しくありません。」` |
| 2 Auth / session | Mã OTP quá TTL 5 phút | Inline error | `「認証コードの有効期限が切れています。」` |
| 3 Network | Mất mạng khi gửi mã | Toast | `「ネットワークエラーが発生しました。時間をおいて再度お試しください。」` `[INFERENCE — cần verify]` |
| 4 Server error | API trả 500 | Toast | `「システムエラーが発生しました。管理者にお問い合わせください。」` `[INFERENCE — cần verify]` |
| 5 Empty state | N/A — wizard không hiển thị danh sách | — | — |
| 6 Conflict | Nhấn `再送信` khi countdown chưa về `00:00` | Button disabled | — |
| 7 Business rule | Email chưa đăng ký trong hệ thống | Inline error | `「このメールアドレスは登録されていません。」` |
| 8 External integration | Không gửi được email chứa mã | `UNKNOWN` | `UNKNOWN` — Figma không định nghĩa → OQ-11 |

---

### OW_AUTH_003 — 申し込むフォーム 1/2 (Đăng ký bước 1: Thông tin cơ bản)

**Happy Case:**
- Layout: 1 cột, 2 khối xếp dọc — **基本情報** (thông tin pháp nhân) và **担当者** (bảng người phụ trách, thêm/xóa dòng động). Thanh nút ở cuối: `キャンセル` · `次へ`.
- Components — khối **基本情報**:

| Vị trí | Component | Nội dung | Action |
|---|---|---|---|
| A.1.1 | Input `委託配送先名` | ✅ Bắt buộc · ≤50 ký tự · chấp nhận kanji/hiragana | — |
| A.1.2 | Input `カナ` | Tùy chọn · chỉ 全角カナ · ≤50 ký tự · **tự sinh** khi rời focus ở `委託配送先名`, sửa tay được | Focus out ở A.1.1 → tự điền |
| A.1.4 | Input `郵便番号` | ✅ Bắt buộc · 7 chữ số 半角, cho phép gạch ngang · nhập đủ 7 số + rời focus → tự điền A.1.8/A.1.9/A.1.10 | Focus out → gọi tra cứu địa chỉ |
| A.1.6 | Button `住所検索` | Bật sau khi có mã bưu điện; làm cùng việc như focus out ở A.1.4 | Click → tự điền địa chỉ |
| A.1.8 | Dropdown `都道府県` | ✅ Bắt buộc · master 47 tỉnh/thành · tự điền nhưng sửa được | Chọn |
| A.1.9 | Input `市区町村` | ✅ Bắt buộc · ≤255 ký tự · tự điền nhưng sửa được | — |
| A.1.10 | Input `町域・番地` | ✅ Bắt buộc · ≤255 ký tự · tự điền nhưng sửa được | — |
| A.1.11 | Input `建物・部屋番号` | Tùy chọn · ≤255 ký tự | — |
| A.1.12 | Input `電話番号` | ✅ Bắt buộc · 半角数字 + gạch ngang · 10–11 ký tự (VD `090-1234-5678`) | — |
| A.1.13 | Input `FAX番号` | Tùy chọn · 半角数字 + gạch ngang · 10–11 chữ số (chỉ validate khi có nhập) | — |

- Components — khối **担当者** (bảng, mỗi dòng 1 người phụ trách):

| Vị trí | Component | Nội dung | Action |
|---|---|---|---|
| A.2.1 | Dropdown `区分` | ✅ Bắt buộc · `メイン担当者` / `サブ担当者` | Chọn |
| A.2.2 | Input `担当者名` | ✅ Bắt buộc · ≤50 ký tự | — |
| A.2.3 | Input `フリガナ` | Tùy chọn · chỉ 全角カナ · ≤50 ký tự · tự sinh khi rời focus ở `担当者名` | Focus out ở A.2.2 → tự điền |
| A.2.4 | Input `メールアドレス` | ✅ Bắt buộc · định dạng email · ≤256 ký tự · **check trùng ở server** giữa các bản ghi hợp lệ | — |
| A.2.5 | Input `TEL` | ✅ Bắt buộc · 半角数字 + gạch ngang · 10–11 ký tự | — |
| A.2.6 | Icon button `削除` | Dòng `メイン担当者` **không** xóa được; dòng `サブ担当者` xóa được | Click → xóa dòng |
| A.2.7 | Button `行を追加` | Thêm 1 dòng người phụ trách mới, `区分` để trống | Click → thêm dòng |

- Components — footer:

| Vị trí | Component | Nội dung | Action |
|---|---|---|---|
| I.1 | Button `キャンセル` | — | Click → dialog xác nhận → `OW_AUTH_001` |
| I.2 | Button primary `次へ` | **Disabled** cho tới khi toàn bộ mục bắt buộc của bước 1 validate PASS | Click → `OW_AUTH_004` |

- Interactions: validate phía **client** cho toàn bộ field trừ check trùng email (server).
- Animation đề xuất: slide-down khi thêm dòng người phụ trách.

**Non-Happy Case:**

| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation input | `委託配送先名` để trống / >50 ký tự | Inline error | `「委託配送先名を入力してください。」` / `「委託配送先名は50文字以内で入力してください。」` |
| 1 Validation input | `カナ` nhập 半角カナ | Inline error | `「カナは全角カナで入力してください。」` |
| 1 Validation input | `郵便番号` để trống / sai định dạng | Inline error | `「郵便番号を入力してください」` / `「郵便番号は7桁の半角数字で入力してください」` |
| 1 Validation input | `都道府県` chưa chọn | Inline error | `「都道府県を選択してください。」` |
| 1 Validation input | `市区町村` để trống | Inline error | `「市区町村を入力してください。」` |
| 1 Validation input | `町域・番地` để trống | Inline error | `「町域・番地を入力してください。」` |
| 1 Validation input | `電話番号` để trống / sai định dạng | Inline error | `「電話番号を入力してください。」` / `「電話番号の形式が正しくありません（半角数字・ハイフン、10〜11桁）」` |
| 1 Validation input | `FAX番号` sai định dạng | Inline error | `「FAX番号の形式が正しくありません（半角数字・ハイフン・10〜11桁）」` |
| 1 Validation input | `担当者名` để trống / >50 ký tự | Inline error | `「担当者名を入力してください」` / `「担当者名は50文字以内で入力してください。」` |
| 1 Validation input | `メールアドレス` sai định dạng / >256 ký tự | Inline error | `「メールアドレスの形式が正しくありません。」` / `「メールアドレスは256文字以内で入力してください。」` |
| 2 Auth / session | N/A — màn public, không yêu cầu đăng nhập | — | — |
| 3 Network | Mất mạng khi tra cứu mã bưu điện | Toast | `「ネットワークエラーが発生しました。時間をおいて再度お試しください。」` `[INFERENCE — cần verify]` |
| 4 Server error | API tra cứu địa chỉ trả 500 | Toast | `「システムエラーが発生しました。管理者にお問い合わせください。」` `[INFERENCE — cần verify]` |
| 5 Empty state | Mã bưu điện hợp lệ nhưng **không tồn tại** trong master | Chặn UI | — **không** báo lỗi, **không** xóa giá trị đã nhập (FACT) |
| 6 Conflict | Email người phụ trách trùng bản ghi hợp lệ khác | Inline error | `「このメールアドレスは既に使用されています。」` |
| 7 Business rule | Cố xóa dòng `メイン担当者` | Button disabled | — |
| 8 External integration | Dịch vụ tra cứu 郵便番号 không phản hồi | `UNKNOWN` | `UNKNOWN` — Figma chỉ định nghĩa trường hợp "không tìm thấy" → OQ-11 |

---

### OW_AUTH_004 — 申し込むフォーム 2/2 (Đăng ký bước 2: Năng lực giao hàng)

**Happy Case:**
- Layout: 1 cột, 3 khối — **対応エリア** (vùng tag + cây checkbox 3 tầng), **車両・設備情報**, **同意**. Footer: `キャンセル` · `登録`.
- Components:

| Vị trí | Component | Nội dung | Action |
|---|---|---|---|
| B.1.1 | Multi-select `対応エリア` | ✅ Bắt buộc ≥1 tỉnh · cây 3 tầng (8 vùng miền × 47 tỉnh) · tag ở trên đồng bộ 2 chiều với cây · có `Chọn tất cả` / `Xóa lựa chọn` | Tick / Click × trên tag |
| B.1.2 | Checkbox group `配送不可曜日` | Tùy chọn · Thứ 2〜CN + `祝日` · chọn nhiều | Chọn |
| B.1.3 | Textarea `対応エリアに関する備考` | Tùy chọn · ≤500 ký tự (đề xuất) | — |
| B.2.1 | Multi-select `保有車両` | ✅ Bắt buộc ≥1 · `軽自動車` / `冷蔵車あり` / `冷凍車あり` · hiển thị dạng tag | Chọn |
| B.2.2 | Radio `冷凍ボックスのレンタル希望` | ✅ Bắt buộc · `不要` / `希望する` | Chọn |
| B.2.3 | Radio `冷蔵ボックスのレンタル希望` | ✅ Bắt buộc · `不要` / `希望する` | Chọn |
| B.2.4 | Radio `冷蔵保管スペース` | ✅ Bắt buộc · `あり` / `なし` | Chọn |
| B.2.5 | Textarea `車両・設備情報に関する備考` | Tùy chọn · ≤500 ký tự (đề xuất) | — |
| B.3 | Checkbox `契約書に同意します。` | ✅ Bắt buộc phải tick · cách xem hợp đồng **chưa chốt** → OQ-09 | Click |
| I.1 | Button `キャンセル` | — | Click → dialog xác nhận |
| I.3 | Button primary `登録` | **Disabled** cho tới khi toàn bộ mục bắt buộc bước 2 hợp lệ **và** đã tick B.3 | Click → tạo hồ sơ `仮登録` → `OW_AUTH_005` |

- Interactions: tick vùng cha → tick toàn bộ tỉnh con; tick một phần → vùng cha hiển thị `－` (indeterminate); bấm × trên tag → bỏ tick tỉnh tương ứng.
- Animation đề xuất: expand/collapse cây vùng miền.

**Non-Happy Case:**

| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation input | `対応エリア` chưa chọn tỉnh nào | Inline error | `「対応エリアを選択してください。」` |
| 1 Validation input | `保有車両` chưa chọn | Inline error | `「保有車両を選択してください。」` |
| 1 Validation input | `冷凍ボックスのレンタル希望` chưa chọn | Inline error | `「冷凍ボックスのレンタル希望を選択してください。」` |
| 1 Validation input | `冷蔵ボックスのレンタル希望` chưa chọn | Inline error | `「冷蔵ボックスのレンタル希望を選択してください。」` |
| 1 Validation input | `冷蔵保管スペース` chưa chọn | Inline error | `「冷蔵保管スペースを選択してください。」` |
| 1 Validation input | Ghi chú >500 ký tự | Inline error | `「備考は500文字以内で入力してください。」` (câu đề xuất — cần chốt bản chính thức) |
| 2 Auth / session | N/A — màn public | — | — |
| 3 Network | Mất mạng khi submit đăng ký | Toast | `「ネットワークエラーが発生しました。時間をおいて再度お試しください。」` `[INFERENCE — cần verify]` |
| 4 Server error | API đăng ký trả 500 | Toast | `「システムエラーが発生しました。管理者にお問い合わせください。」` `[INFERENCE — cần verify]` |
| 5 Empty state | N/A — không hiển thị danh sách động | — | — |
| 6 Conflict | Double-click nút `登録` | Button disabled | — |
| 7 Business rule | Chưa tick `契約書に同意します。` | Button disabled | — |
| 8 External integration | Không gửi được email thông báo đã nhận đăng ký | `UNKNOWN` | `UNKNOWN` — Figma không định nghĩa → OQ-11 |

---

### OW_AUTH_005 — 申し込み完了 (Đã gửi đăng ký) `[INFERENCE — cần verify]`

> ⚠️ **Màn hình này chưa có frame trong Figma.** Toàn bộ nội dung dưới là suy luận từ RQ-002 (self-registration → `仮登録` chờ E03 duyệt). **Không** implement trước khi chốt OQ-07.

**Happy Case:**
- Layout: 1 cột, card căn giữa, icon trạng thái + thông điệp + 1 nút về đăng nhập.
- Components:

| Vị trí | Component | Nội dung | Action |
|---|---|---|---|
| Body | Icon trạng thái | Dấu tích / đồng hồ chờ | — |
| Body | Text | Thông báo đã tiếp nhận đăng ký, hồ sơ đang ở trạng thái `仮登録`, chờ ES Kitchen phê duyệt · `UNKNOWN` nội dung chính xác | — |
| Body | Text phụ | Hướng dẫn: thông tin đăng nhập sẽ được gửi qua email sau khi duyệt · `UNKNOWN` | — |
| Bottom | Button `ログイン画面へ` | — | Click → `OW_AUTH_001` |

**Non-Happy Case:**

| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation input | N/A — màn tĩnh, không có input | — | — |
| 2 Auth / session | N/A — màn public | — | — |
| 3 Network | N/A — không gọi API | — | — |
| 4 Server error | N/A — không gọi API | — | — |
| 5 Empty state | N/A — không hiển thị danh sách | — | — |
| 6 Conflict | Người dùng F5 / quay lại màn này bằng URL trực tiếp | `UNKNOWN` | `UNKNOWN` → OQ-07 |
| 7 Business rule | N/A | — | — |
| 8 External integration | N/A | — | — |

---

### OW_HOME_001 — ホーム (Trang chủ)

**Happy Case:**
- Layout: sidebar trái (210px) + vùng nội dung. Vùng nội dung chia 2 cột: cột trái là **calendar-card** (lịch tháng hiện tại), cột phải xếp dọc 2 card — **お知らせ** và **未回答の見積もり依頼**.
- Components — khối A **今月の配送スケジュール**:

| Vị trí | Component | Nội dung | Action |
|---|---|---|---|
| A | Lịch tháng (7 cột Thứ 2〜CN) | Trải dài cả ngày của tháng trước/sau liền kề | Chỉ xem |
| A.1 | Nhãn + màu nền phân tuần | `A`=xanh dương · `B`=xanh lá · `C`=cam · `D`=hồng · tháng trước/sau=xám. **Tuần không bắt buộc bắt đầu từ ngày 1** | Tự động |
| A.2 | Text số đơn | `配送: xxx件` — chỉ hiện ở ngày có lịch giao | Tự động |
| A.3 | Nhãn trạng thái đặc biệt | `臨時休業` (đỏ) · `休` (đỏ) · `未設定` (cam) | Tự động |
| A.4 | Badge cảnh báo `⚠N件` | Số đơn **chưa gán tài xế** trong ngày; cùng component với icon "Chưa gán tài xế" ở 凡例 | Tự động |
| A.5 | Viền xanh đậm | Đánh dấu **duy nhất 1 ô** = ngày hệ thống | Tự động |
| A.6 | Thanh ngang đỏ | Khoảng ngày lễ/nghỉ (VD ngày 25〜31) | Tự động |
| A.7 | Vùng click ô lịch | — | Click → `OW_SCHD_002` (tuần chứa ngày đó) |
| A.8 | Link `スケジュールへ` | — | Click → `OW_SCHD_001` |

- Components — khối B **お知らせ**:

| Vị trí | Component | Nội dung | Action |
|---|---|---|---|
| B | Danh sách cuộn | Sắp xếp mới nhất → cũ nhất | Cuộn |
| B.1 | Text thời gian tương đối | `今日・HH:mm` / `昨日・HH:mm` | Tự động |
| B.2 | Badge phân loại | Master loại thông báo: `システム更新` / `お知らせ` / `メンテナンス`… (⚠ xem OQ-06) | Tự động |
| B.3 | Link tiêu đề + icon mũi tên | — | Click → `OW_ANNO_002` |

- Components — khối C **未回答の見積もり依頼**:

| Vị trí | Component | Nội dung | Action |
|---|---|---|---|
| C | Danh sách cuộn | Chỉ hiển thị yêu cầu **chưa phản hồi** | Cuộn |
| C.1 | Badge `未回答` | Nhãn cố định. ⚠ Chưa xác nhận có badge trạng thái khác (quá hạn…) | Tự động |
| C.2 | Link tiêu đề yêu cầu | — | Click → màn trả lời báo giá — **OUT OF SCOPE**, xem OQ-05 |
| C.3 | Text `依頼日 / 回答期限` | Định dạng `yyyy/mm/dd` | Tự động |
| C.4 | Link `見積もり一覧へ` | — | Click → danh sách báo giá — **OUT OF SCOPE**, xem OQ-05 |

- Interactions: 3 khối tải độc lập; 2 danh sách cuộn trong khung cố định.
- Animation đề xuất: skeleton loader cho từng card khi đang tải.

**Non-Happy Case:**

| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation input | N/A — màn chỉ đọc, không có input | — | — |
| 2 Auth / session | Phiên hết hạn khi đang ở trang | Full screen | `「セッションの有効期限が切れました。再度ログインしてください。」` `[INFERENCE — cần verify]` |
| 3 Network | Mất mạng khi tải 1 trong 3 khối | Banner | `「データの取得に失敗しました。再度お試しください。」` `[INFERENCE — cần verify]` |
| 4 Server error | API trả 500 | Banner | `「システムエラーが発生しました。管理者にお問い合わせください。」` `[INFERENCE — cần verify]` |
| 5 Empty state | Tháng không có lịch giao nào | Empty state | `UNKNOWN` — Figma không vẽ trạng thái rỗng của lịch → OQ-12 |
| 5 Empty state | Không có thông báo nào | Empty state | `UNKNOWN` — Figma không vẽ trạng thái rỗng → OQ-12 |
| 5 Empty state | Không có yêu cầu báo giá chưa phản hồi | Empty state | `UNKNOWN` — Figma không vẽ trạng thái rỗng → OQ-12 |
| 6 Conflict | N/A — màn chỉ đọc, không ghi dữ liệu | — | — |
| 7 Business rule | N/A — không có rule chặn hiển thị | — | — |
| 8 External integration | N/A — không gọi dịch vụ ngoài | — | — |

---

### OW_ANNO_002 — お知らせ詳細 (Chi tiết thông báo)

**Happy Case:**
- Layout: sidebar + 1 cột nội dung, card trắng chứa badge → ngày giờ → tiêu đề → nội dung rich text → link quay lại.
- Components:

| Vị trí | Component | Nội dung | Action |
|---|---|---|---|
| 1 | Badge phân loại | Dùng **chung master** với badge ở `OW_HOME_001` khối B.2 | Tự động |
| 2 | Text ngày giờ đăng | Định dạng `yyyy年M月d日 HH:mm` | Tự động |
| 3 | Text tiêu đề | Tiêu đề do ES admin nhập | Tự động |
| 4 | Rich text nội dung | Hỗ trợ tiêu đề phụ `■`, danh sách `・`, in đậm | Tự động |
| 5 | Link `一覧に戻る` | — | Click → `OW_HOME_001` |

- Interactions: chỉ đọc, không có action ghi.
- Animation đề xuất: fade-in nội dung.

**Non-Happy Case:**

| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation input | N/A — màn chỉ đọc | — | — |
| 2 Auth / session | Phiên hết hạn | Full screen | `「セッションの有効期限が切れました。再度ログインしてください。」` `[INFERENCE — cần verify]` |
| 3 Network | Mất mạng khi tải nội dung | Banner | `「データの取得に失敗しました。再度お試しください。」` `[INFERENCE — cần verify]` |
| 4 Server error | API trả 500 | Banner | `「システムエラーが発生しました。管理者にお問い合わせください。」` `[INFERENCE — cần verify]` |
| 5 Empty state | N/A — luôn vào từ 1 thông báo cụ thể | — | — |
| 6 Conflict | Thông báo đã bị ES admin xóa trong lúc đang xem | `UNKNOWN` | `UNKNOWN` — Figma không định nghĩa → OQ-12 |
| 7 Business rule | Thông báo không thuộc phạm vi công ty đang đăng nhập | `UNKNOWN` | `UNKNOWN` → OQ-12 |
| 8 External integration | N/A | — | — |

---

### OW_SCHD_001 — スケジュール（月表示） (Lịch tháng)

**Happy Case:**
- Layout: sidebar + header điều khiển (toggle 月/週 · date picker · ＜ ＞ · 今日) → thanh tìm kiếm 2 tầng (cơ bản + mở rộng) → lưới lịch tháng → 凡例 dưới cùng.
- Components — điều khiển + tìm kiếm:

| Vị trí | Component | Nội dung | Action |
|---|---|---|---|
| S.1 | Toggle `月 / 週` | Chuyển chế độ hiển thị | Click → `OW_SCHD_002` |
| S.2 | Date picker `対象年月` | Định dạng `yyyy-mm` | Chọn → nhảy tới tháng đó |
| S.3 | Button `＜` / `＞` | Lùi / tiến 1 tháng | Click |
| S.4 | Button `今日` | Về tháng chứa ngày hệ thống | Click |
| S.5 | Input tìm kiếm | Khớp gần đúng: 法人ID / 法人名 / 拠点ID / 拠点名 | Nhập |
| S.6 | Input tìm kiếm | Khớp gần đúng: 住所 / 郵便番号 / 電話番号 / 担当者電話番号 | Nhập |
| S.7 / S.14 | Button accordion `⌄ / ⌃` | Hiện/ẩn điều kiện chi tiết S.8〜S.13 | Click |
| S.8 | Dropdown `荷物温度帯` | `冷凍配送` / `冷蔵・常温配送` / `資材` | Chọn |
| S.9 | Dropdown `配送状況` | `出荷準備` / `出荷済` / `荷受済` / `トラブル` / `配送完了` | Chọn |
| S.10 | Dropdown `自販機` | `あり` / `なし` | Chọn |
| S.11 | Dropdown `配送方法` | `ES配送` / `COOL便` | Chọn |
| S.12 | Input `配送元` | Khớp gần đúng | Nhập |
| S.13 | Input | Khớp gần đúng: 送り状番号 / 配送スタッフID / 配送スタッフ名 | Nhập |
| S.15 | Button `検索` | Lọc lịch theo điều kiện | Click |

- Components — lưới lịch:

| Vị trí | Component | Nội dung | Action |
|---|---|---|---|
| C.1 | Badge số lượng theo 温度帯 | `❄ N` / `🗄 N` / `📦 N` — chỉ hiện ở ngày có loại tương ứng | Tự động |
| C.2 | Badge cảnh báo `⚠未N件` | Số đơn chưa gán tài xế — cùng quy tắc với `OW_HOME_001` A.4 | Tự động |
| C.3 | Viền xanh đậm | Duy nhất 1 ô = ngày hệ thống | Tự động |
| C.4 | Vùng click ô lịch | — | Click → `OW_SCHD_002` (tuần chứa ngày đó) |
| D | 凡例 (legend) | Giải thích: chu kỳ tháng hiện tại/khác · `サイクル休止` · phân tuần A〜D + tháng trước/sau · ngày lễ/nghỉ · chưa gán tài xế · hôm nay · 3 icon 温度帯 | Chỉ xem |

- Interactions: accordion giữ trạng thái mở/đóng; trạng thái tab + tháng đồng bộ lên URL (`?tab=&month=`).
- Animation đề xuất: skeleton grid khi đang tải.

**Non-Happy Case:**

| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation input | Ngày bắt đầu > ngày kết thúc (nếu dùng date range) | `UNKNOWN` | `UNKNOWN` — màn này dùng date picker tháng, không có range → N/A trên thực tế |
| 2 Auth / session | Phiên hết hạn | Full screen | `「セッションの有効期限が切れました。再度ログインしてください。」` `[INFERENCE — cần verify]` |
| 3 Network | Mất mạng khi tải lịch | Banner | `「データの取得に失敗しました。再度お試しください。」` `[INFERENCE — cần verify]` |
| 4 Server error | API trả 500 | Banner | `「システムエラーが発生しました。管理者にお問い合わせください。」` `[INFERENCE — cần verify]` |
| 5 Empty state | Điều kiện tìm kiếm không khớp đơn nào | Empty state | `UNKNOWN` — Figma không vẽ trạng thái rỗng → OQ-12 |
| 6 Conflict | N/A — màn chỉ đọc | — | — |
| 7 Business rule | N/A — không có rule chặn hiển thị lịch | — | — |
| 8 External integration | N/A | — | — |

---

### OW_SCHD_002 — スケジュール（週表示） (Lịch tuần)

**Happy Case:**
- Layout: giữ nguyên header điều khiển + thanh tìm kiếm của `OW_SCHD_001`; thân là **7 cột** Thứ 2〜CN, mỗi cột là danh sách cuộn các điểm giao trong ngày.
- Components:

| Vị trí | Component | Nội dung | Action |
|---|---|---|---|
| W | Lưới 7 cột Thứ 2〜CN | Mỗi cột = 1 ngày | Chỉ xem |
| W.1 | Danh sách giao hàng theo ngày | Mỗi đơn 1 dòng, cuộn trong phạm vi ô. Ngày không có lịch giao → **ô trống** | Cuộn |
| W.2 | Icon 温度帯 trong dòng | `❄` đông lạnh · `🗄` mát・thường · `📦` vật tư (cùng định nghĩa với 凡例 màn tháng) | Tự động |
| W.3 | Text tên điểm giao | Vượt khung → rút gọn `...`, hover hiện tooltip tên đầy đủ | Hover |
| W.4 | Vùng click dòng | — | Click → `OW_DLVR_002` |

- Interactions: cuộn độc lập trong từng ô ngày; tooltip khi hover tên bị rút gọn.
- Animation đề xuất: skeleton list trong từng cột.

**Non-Happy Case:**

| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation input | N/A — màn chỉ đọc | — | — |
| 2 Auth / session | Phiên hết hạn | Full screen | `「セッションの有効期限が切れました。再度ログインしてください。」` `[INFERENCE — cần verify]` |
| 3 Network | Mất mạng khi tải tuần | Banner | `「データの取得に失敗しました。再度お試しください。」` `[INFERENCE — cần verify]` |
| 4 Server error | API trả 500 | Banner | `「システムエラーが発生しました。管理者にお問い合わせください。」` `[INFERENCE — cần verify]` |
| 5 Empty state | Cả tuần không có đơn nào | Empty state | `UNKNOWN` — Figma chỉ định nghĩa "ngày không có lịch giao → ô trống", chưa định nghĩa cả tuần rỗng → OQ-12 |
| 6 Conflict | N/A — màn chỉ đọc | — | — |
| 7 Business rule | N/A | — | — |
| 8 External integration | N/A | — | — |

---

### OW_DLVR_001 — 配送管理一覧 (Danh sách giao hàng)

**Happy Case:**
- Layout: sidebar + breadcrumb/title → thanh tìm kiếm 2 tầng (accordion) → bảng 12 cột → phân trang.
- Components — tìm kiếm:

| Vị trí | Component | Nội dung | Action |
|---|---|---|---|
| S.1 | Date range `期間検索` | Mặc định: **ngày bắt đầu = hôm nay**, **ngày kết thúc = ngày cuối tháng đó** | Chọn |
| S.2 | Radio `配送日（着）` | Chỉ có **1 lựa chọn duy nhất** (cố định) | Click |
| S.3 | Button sắp xếp `配送日（着）` | Đổi tăng dần / giảm dần | Click |
| S.4 | Input `拠点ID・名` | Khớp gần đúng · chỉ hiện khi mở rộng | Nhập |
| S.5 | Input | 配送先住所 / 郵便番号 / 電話番号 / 担当者電話番号 · khớp gần đúng · chỉ hiện khi mở rộng | Nhập |
| S.6 | Dropdown `荷物温度帯` | `冷凍配送` / `冷蔵・常温配送` / `資材` | Chọn |
| S.7 | Dropdown `ステータス` | `出荷準備` / `出荷済` / `荷受済` / `トラブル` / `配送完了` | Chọn |
| S.8 | Dropdown `自販機` | `あり` / `なし` | Chọn |
| S.9 | Dropdown `配送方法` | `ES配送` / `COOL便` | Chọn |
| S.10 | Input `配送元` | Khớp gần đúng | Nhập |
| S.11 | Input | 送り状番号 / 配送スタッフID / 配送スタッフ名 · khớp gần đúng | Nhập |
| S.12 | Button `クリア` | Reset **toàn bộ** điều kiện tìm kiếm | Click |
| S.13 | Button `検索` | Lọc danh sách | Click |

- Components — bảng danh sách:

| Vị trí | Component | Nội dung | Action |
|---|---|---|---|
| L.1 | Cột `No` | Số thứ tự hiển thị (⚠ liên tục qua trang hay không — cần xác nhận) | Tự động |
| L.2 | Cột `配送日（着）` | Định dạng `yyyy-mm-dd` | Tự động |
| L.3 | Cột `荷物温度帯` | Badge từ master (`❄` / `🗄` / `📦`) | Tự động |
| L.4 | Cột `配送No` (link) | — | Click → `OW_DLVR_002` |
| L.5 | Cột `荷受け住所` | Tên/địa chỉ điểm lấy hàng (kho picking hoặc kho trung chuyển) | Tự động |
| L.6 | Cột `届け先拠点名` | Tên điểm đến | Tự động |
| L.7 | Cột `届け先住所` | Địa chỉ điểm đến (từ cấp tỉnh/thành) | Tự động |
| L.8 | Cột `配送スタッフID` | **Để trống** khi chưa gán tài xế | Tự động |
| L.9 | Cột `配送スタッフ名` | **Để trống** khi chưa gán tài xế | Tự động |
| L.10 | Cột `送り状No` | Nhiều mã → phân cách dấu phẩy; vượt khung → rút gọn `N…` + tooltip khi hover | Hover |
| L.11 | Cột `配送状況` | Badge từ master 5 trạng thái | Tự động |
| L.12 | Cột `配送区分` | `ES配送` / `COOL便` | Tự động |
| P.1 | Text số lượng | `{Tổng}件中 {Từ}−{Đến}件` (VD `100件中 1−10件`) | Tự động |
| P.2 | Điều hướng trang | `＜` · `＞` · số trang · `...` — trang hiện tại highlight xanh | Click |
| P.3 | Dropdown `件数/ページ` | Mặc định `10件/ページ` · danh sách lựa chọn ⚠ cần xác nhận (RQ-025) | Chọn |

- Interactions: accordion tìm kiếm; sắp xếp theo 配送日（着）.
- Animation đề xuất: skeleton rows khi đang tải.

**Non-Happy Case:**

| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation input | Ngày bắt đầu > ngày kết thúc | `UNKNOWN` | `UNKNOWN` — Figma không định nghĩa → OQ-12 |
| 2 Auth / session | Phiên hết hạn | Full screen | `「セッションの有効期限が切れました。再度ログインしてください。」` `[INFERENCE — cần verify]` |
| 3 Network | Mất mạng khi tìm kiếm | Banner | `「データの取得に失敗しました。再度お試しください。」` `[INFERENCE — cần verify]` |
| 4 Server error | API trả 500 | Banner | `「システムエラーが発生しました。管理者にお問い合わせください。」` `[INFERENCE — cần verify]` |
| 5 Empty state | Điều kiện tìm kiếm không khớp đơn nào | Empty state | `UNKNOWN` — Figma không vẽ trạng thái rỗng → OQ-12 |
| 6 Conflict | N/A — màn chỉ đọc, không ghi dữ liệu | — | — |
| 7 Business rule | N/A — không có rule chặn hiển thị danh sách | — | — |
| 8 External integration | N/A | — | — |

---

### OW_DLVR_002 — 配送詳細 (Chi tiết giao hàng — 4 tab)

**Happy Case:**
- Layout: sidebar + header (tiêu đề `配送No` + badge `⚠ 未設定` khi chưa gán tài xế + khối chọn tài xế) → thanh tab 4 mục: `配送概要` · `配送住所` · `実績` · `添付資料`.

#### Tab 1 — 配送概要 (Tổng quan giao hàng)

| Vị trí | Component | Nội dung | Action |
|---|---|---|---|
| H.1 | Badge `⚠ 未設定` | Chỉ hiện khi **chưa gán tài xế**; ẩn ngay khi đã gán | Tự động |
| H.2 | Dropdown `配送スタッフ` (có search) | Ô tìm theo **tên / ID tài xế**. Chỉ liệt kê tài xế trạng thái `有効`. Mỗi ứng viên hiển thị: Họ tên · ID · `配送件数 ngày {配送日}: N件` (tài xế không có đơn ngày đó thì không hiển thị số) | Chọn / Nhập |
| H.3 | Button `キャンセル` | Hủy thao tác chọn, quay về trạng thái trước (chưa gán hoặc tài xế cũ) | Click |
| H.4 | Button `確定` | Gán tài xế cho đơn này | Click → Toast `配送スタッフ設定完了しました。` |
| A.1 | `配送日（着）` | Chỉ đọc | Chỉ xem |
| A.2 | `配送ステータス` | Badge từ master 5 trạng thái · chỉ đọc | Chỉ xem |
| A.3 | `配送No` | Trùng với mã ở danh sách và tiêu đề trang · chỉ đọc | Chỉ xem |
| A.4 | `荷物名` | Chỉ đọc | Chỉ xem |
| A.5 | `荷物温度帯` | Badge từ master · chỉ đọc | Chỉ xem |
| A.6 | `クール便` | `冷蔵タイプ` / `冷凍タイプ` · chỉ đọc | Chỉ xem |
| A.7 | `配送区分` | `ES配送` / `COOL便` · chỉ đọc | Chỉ xem |
| A.8 | `備考` | Chỉ đọc | Chỉ xem |
| A.9 | `送り状No一覧` | Nhiều mã hiển thị dạng lưới, tối đa 3 cột/hàng · chỉ đọc | Chỉ xem |

> **Rule khóa chỉnh sửa:** khi `ngày hiện tại − ngày ship ≥ 7` → nút **編集** disabled (RQ-006). ⚠ Mốc ngày (`配送日（着）` hay `発送予定日`), phạm vi field bị khóa và việc BE có chặn hay không → **OQ-02**.

#### Tab 2 — 配送住所 (Địa chỉ giao hàng)

| Vị trí | Component | Nội dung | Action |
|---|---|---|---|
| B.1 | Khối `荷受け住所` | 郵便番号 / 都道府県 / 市区町村 / 町域・番地 / 建物・部屋番号 / 部署名 / 電話番号 / メイン担当者名 / メイン担当者電話番号 — **toàn bộ chỉ đọc** | Chỉ xem |
| B.2 | Khối `届け先住所` | Cùng bộ field như B.1 — **toàn bộ chỉ đọc** | Chỉ xem |
| B.2.1 | Danh sách thumbnail `搬入経路・添付資料（公開）` | Ảnh/PDF do **phía công ty nhận hàng** cung cấp. Chỉ xem / tải xuống — **không** thêm, **không** xóa. Đối tượng xem: công ty lấy hàng · công ty giao hàng · tài xế | Click → `OW_DLVR_003` |
| B.2.2 | Danh sách thumbnail `非公開の搬入経路・添付資料` | Tài liệu do **công ty vận chuyển** tự tải lên. **Tối đa 20 file**. Mỗi file xóa được. Chỉ nội bộ công ty vận chuyển + tài xế xem được | Click → `OW_DLVR_003` |
| B.2.3 | Button `ファイルを追加` | Mở hộp thoại chọn file · JPG/JPEG/PNG · ≤5MB | Click → upload → Toast `非公開資料をアップロードしました。` |

#### Tab 3 — 実績 (Kết quả thực tế) — toàn bộ chỉ đọc

| Vị trí | Component | Nội dung | Action |
|---|---|---|---|
| 1 | `配送完了日時` | Do tài xế nhập từ Driver App | Chỉ xem |
| 2 | `備考` | Có bộ đếm ký tự dạng `0/100`; nội dung nhập từ Driver App | Chỉ xem |
| 3–5 | Summary `廃棄数` / `理論在庫` / `実在庫` | Tự tổng hợp từ bảng bên dưới | Tự động |
| 6 | Summary `差異` | **Công thức:** `差異 = 理論在庫 − 実在庫` | Tự động |
| 7 | Bảng `廃棄数確認` | Cột: No · 写真 · 品番 · 商品名 · カテゴリ · 廃棄数 · 賞味期限 · 理論在庫 · 実在庫 | Chỉ xem |
| 8 | Ô `廃棄数` trong dòng | **Tô đỏ khi > 0** | Tự động |
| 9 | Ô `賞味期限` trong dòng | Tô đỏ khi gần/đã hết hạn. ⚠ Số ngày định nghĩa "gần hết hạn" **chưa chốt** → OQ-08 | Tự động |
| 10–11 | Summary `予定合計数` / `実際合計数` | Tự tổng hợp từ bảng trưng bày | Tự động |
| 12 | Summary `差異合計数` | **Công thức:** `差異合計数 = 予定合計数 − 実際合計数` | Tự động |
| 13 | Bảng `陳列結果確認` | Cột: No · 写真 · 品番 · 商品名 · カテゴリ · 予定数 · 実際数 · 誤差 | Chỉ xem |
| 14 | Ô `誤差` trong dòng | **Công thức:** `誤差 = 予定数 − 実際数`. Tô đỏ khi ≠ 0 | Tự động |

#### Tab 4 — 添付資料 (Tài liệu đính kèm) `[INFERENCE — cần verify]`

> ⚠ Canvas Figma **không có bảng 画面設計書** cho tab này. Nội dung dưới suy từ frame `31498:193742`.

| Vị trí | Component | Nội dung | Action |
|---|---|---|---|
| — | Khối `駐車報告` | `駐車料金` + ảnh receipt do tài xế chụp · `UNKNOWN` chi tiết field | Chỉ xem |
| — | Khối `集金報告` | `集金予定額` + `集金額` · `UNKNOWN` chi tiết field | Chỉ xem |

- Interactions: trạng thái tab đồng bộ lên URL; toast hiển thị góc trên sau khi gán tài xế / upload file.
- Animation đề xuất: skeleton theo tab; toast tự tắt sau 3s.

**Non-Happy Case:**

| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation input | Upload file sai định dạng (≠ JPG/JPEG/PNG) | Inline error | `「Vui lòng tải lên tệp hình ảnh có định dạng JPG, JPEG hoặc PNG.」` |
| 1 Validation input | Upload file >5MB | Inline error | `「Dung lượng tối đa của tệp hình ảnh tải lên là 5MB.」` |
| 2 Auth / session | Phiên hết hạn | Full screen | `「セッションの有効期限が切れました。再度ログインしてください。」` `[INFERENCE — cần verify]` |
| 3 Network | Mất mạng khi upload hoặc khi nhấn `確定` | Toast | `「ネットワークエラーが発生しました。時間をおいて再度お試しください。」` `[INFERENCE — cần verify]` |
| 4 Server error | API trả 500 | Toast | `「システムエラーが発生しました。管理者にお問い合わせください。」` `[INFERENCE — cần verify]` |
| 5 Empty state | Chưa có tài liệu 公開 / 非公開 nào | Empty state | `UNKNOWN` — Figma không vẽ trạng thái rỗng → OQ-12 |
| 5 Empty state | Tài xế chưa báo 実績 | Empty state | `UNKNOWN` — Figma không vẽ trạng thái rỗng của tab 実績 → OQ-08 |
| 6 Conflict | Upload file thứ 21 vào nhóm 非公開 | Toast | `「Chỉ có thể đăng ký tối đa 20 file.」` (câu đề xuất — cần chốt bản JP chính thức) |
| 6 Conflict | Đơn đã được người khác gán tài xế trong lúc đang mở | `UNKNOWN` | `UNKNOWN` — Figma không định nghĩa → OQ-12 |
| 7 Business rule | `ngày hiện tại − ngày ship ≥ 7` | Button disabled | — nút `編集` bị vô hiệu hóa (⚠ mốc ngày chưa chốt → OQ-02) |
| 8 External integration | N/A — không gọi dịch vụ ngoài | — | — |

---

### OW_DLVR_003 — ファイルビューア (Viewer ảnh / PDF)

**Happy Case:**
- Layout: modal full-width phủ lên `OW_DLVR_002`. Thanh công cụ trên cùng, vùng preview giữa, pager dưới, nút ＜ ＞ hai bên.
- Components:

| Vị trí | Component | Nội dung | Action |
|---|---|---|---|
| 1 | Button `ダウンロード` | Tải file đang hiển thị · tooltip `ダウンロード` | Click |
| 2 | Button `拡大` / `縮小` | Phóng to / thu nhỏ ảnh preview · tooltip `拡大` / `縮小`. **Với PDF: disabled** | Click |
| 3 | Menu `︙` → `削除` | **Chỉ hiển thị** khi xem file thuộc nhóm `非公開`. Nhóm `公開` **không** có menu này. **Không** có dialog xác nhận khi xóa | Click → xóa file |
| 4 | Button `＜` / `＞` | Chuyển file trước/sau **trong cùng nhóm** (公開 hoặc 非公開) · chỉ hiện khi có nhiều file | Click |
| 5 | Pager | Định dạng `{hiện tại}/{tổng}` (VD `1/6`) | Tự động |
| 6 | Button `×` | Đóng modal · tooltip `閉じる` | Click → `OW_DLVR_002` tab 配送住所 |
| — | Vùng preview (PDF) | **Không preview nội dung** — chỉ hiển thị dung lượng file + nút tải | Chỉ xem |

- Interactions: tooltip trên từng nút công cụ; điều hướng ＜ ＞ không vượt ra ngoài nhóm hiện tại.
- Animation đề xuất: fade-in overlay, zoom mượt theo bước.

**Non-Happy Case:**

| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation input | N/A — viewer không có input | — | — |
| 2 Auth / session | Phiên hết hạn khi đang mở viewer | Full screen | `「セッションの有効期限が切れました。再度ログインしてください。」` `[INFERENCE — cần verify]` |
| 3 Network | Mất mạng khi tải file preview | Banner | `「ファイルの取得に失敗しました。再度お試しください。」` `[INFERENCE — cần verify]` |
| 4 Server error | API trả 500 khi tải / xóa file | Toast | `「システムエラーが発生しました。管理者にお問い合わせください。」` `[INFERENCE — cần verify]` |
| 5 Empty state | N/A — chỉ mở được từ 1 file cụ thể | — | — |
| 6 Conflict | File đã bị xóa ở tab khác trong lúc đang xem | `UNKNOWN` | `UNKNOWN` — Figma không định nghĩa → OQ-12 |
| 7 Business rule | Xem file nhóm `公開` | Chặn UI | — menu `︙` (xóa) **không** hiển thị |
| 8 External integration | N/A | — | — |

---

### OW_CLCT_001 — 集金管理（集金・駐車） (Quản lý thu tiền & phí đỗ xe)

**Happy Case:**
- Layout: sidebar + header (tiêu đề + nút `CSV出力` góc phải) → thanh tìm kiếm → 2 thẻ summary → bảng theo tài xế → phân trang.
- Components:

| Vị trí | Component | Nội dung | Action |
|---|---|---|---|
| H.1 | Button `CSV出力` | Tải dữ liệu khớp điều kiện tìm kiếm hiện tại. **Cột xuất khác bảng trên màn hình** — xuất chi tiết từng đơn: `配送日` · `配送ID` · `配送スタッフID` · `配送スタッフ名` · `配送先名` · `集金金額` · `駐車料金` (1 dòng = 1 配送). Tên file: `集金管理_{開始日}-{終了日}_{配送スタッフ検索条件}_{出力日時}.csv` — VD `集金管理_20260818-20260831_全配送スタッフ_20260907163511.csv`. ⚠ Xung đột với cột CSV đang chạy → OQ-03 | Click → tải file |
| S.1 | Date range `期間検索` | Mặc định: **ngày 1 tháng hiện tại 〜 ngày cuối tháng hiện tại** | Chọn |
| S.2 | Input `配送スタッフID・名` | Khớp gần đúng | Nhập |
| S.3 | Button `クリア` | Reset toàn bộ điều kiện tìm kiếm | Click |
| S.4 | Button `検索` | Lọc danh sách | Click |
| T.1 | Summary `集金合計金額` | Tổng tiền thu của **toàn bộ tài xế khớp điều kiện tìm kiếm** (không chỉ trang hiện tại) | Tự động |
| T.2 | Summary `駐車合計料金` | Tổng phí đỗ xe của toàn bộ tài xế khớp điều kiện tìm kiếm | Tự động |
| L.1 | Cột `No` | Số thứ tự trong trang hiện tại | Tự động |
| L.2 | Cột `配送スタッフID` | — | Tự động |
| L.3 | Cột `配送スタッフ名` (link) | — | Click → `OW_STAF_003` tab `担当配送情報` |
| L.4 | Cột `集金合計金額` | Tổng tiền thu của tài xế đó trong kỳ tìm kiếm | Tự động |
| L.5 | Cột `駐車合計料金` | Tổng phí đỗ xe của tài xế đó trong kỳ tìm kiếm | Tự động |
| P.1 | Text số lượng | `{Tổng}件中 {Từ}−{Đến}件` | Tự động |
| P.2 | Điều hướng trang | `＜` · `＞` · số trang · `...` — trang hiện tại highlight xanh | Click |
| P.3 | Dropdown `件数/ページ` | Mặc định `10件/ページ` | Chọn |

- Interactions: 2 summary cập nhật lại mỗi lần `検索`.
- Animation đề xuất: skeleton cho summary + bảng; spinner trên nút `CSV出力` khi đang sinh file.

**Non-Happy Case:**

| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation input | Ngày bắt đầu > ngày kết thúc | `UNKNOWN` | `UNKNOWN` — Figma không định nghĩa → OQ-12 |
| 2 Auth / session | Phiên hết hạn | Full screen | `「セッションの有効期限が切れました。再度ログインしてください。」` `[INFERENCE — cần verify]` |
| 3 Network | Mất mạng khi tìm kiếm hoặc khi xuất CSV | Banner | `「データの取得に失敗しました。再度お試しください。」` `[INFERENCE — cần verify]` |
| 4 Server error | API trả 500 | Banner | `「システムエラーが発生しました。管理者にお問い合わせください。」` `[INFERENCE — cần verify]` |
| 5 Empty state | Kỳ tìm kiếm không có dữ liệu thu tiền | Empty state | `UNKNOWN` — Figma không vẽ trạng thái rỗng → OQ-12 |
| 6 Conflict | Nhấn `CSV出力` nhiều lần liên tiếp | Button disabled | — |
| 7 Business rule | Xuất CSV khi kết quả tìm kiếm rỗng | `UNKNOWN` | `UNKNOWN` — chưa rõ tải file rỗng hay chặn → OQ-12 |
| 8 External integration | N/A — không gọi dịch vụ ngoài | — | — |

---

### OW_STAF_001 — 配送スタッフ一覧 (Danh sách tài xế)

**Happy Case:**
- Layout: sidebar + header (tiêu đề + `アカウント一括発行` + `＋新規登録`) → thanh tìm kiếm accordion → bảng có checkbox → phân trang.
- Components:

| Vị trí | Component | Nội dung | Action |
|---|---|---|---|
| H.1 | Button `アカウント一括発行` | **Disabled khi chọn 0 dòng**, bật khi chọn ≥1 dòng | Click → `OW_STAF_005` |
| H.2 | Button `＋新規登録` | Chỉ hiển thị với người dùng có quyền `Create` | Click → `OW_STAF_004` |
| S.1 | Input tìm kiếm | Tìm **AND**, khớp một phần: 所属 · 配送スタッフ名. Nhấn `Enter` cũng thực hiện tìm | Nhập |
| S.2 | Dropdown `スタッフ区分` | `すべて` (mặc định) / `個人` / `会社所属` | Chọn |
| S.3 | Dropdown `ステータス` | `すべて` (mặc định) / `有効` / `免許未登録` / `停止` / `無効` / `削除済` | Chọn |
| S.4 | Button `クリア` | Xóa toàn bộ điều kiện (văn bản · 区分 · ステータス). ⚠ Hành vi sau khi xóa cần xác nhận | Click |
| S.5 | Button `検索` | Lọc danh sách | Click |
| S.6 | Button accordion `∧ / ∨` | Thu gọn / mở rộng khu vực tìm kiếm | Click |
| S.7 | Button `並べ替え` | Mặc định sắp theo `配送スタッフID`. ⚠ Chi tiết cột sắp xếp + UI cần xác nhận | Click |
| T.1 | Cột `No` | Số thứ tự trong trang hiện tại | Tự động |
| T.2 | Cột `免許` | Thumbnail ảnh bằng lái; chưa đăng ký → ảnh mặc định. ⚠ Hành vi khi click cần xác nhận | Tự động |
| T.3 | Cột `ID` | Mã tài xế | Tự động |
| T.4 | Cột `配送スタッフ名` (link xanh) | — | Click → `OW_STAF_003` |
| T.6 | Cột `区分` | `個人` / `会社所属` | Tự động |
| T.7 | Cột `電話番号` | — | Tự động |
| T.8 | Cột `ステータス` | Badge có màu: `有効`=xanh · `免許未登録`=vàng · `停止`=đỏ · `無効`=xám · `削除済`=⚠ cần xác nhận | Tự động |
| T.9 | Cột `アカウント状態` | `未発行` / `発行済み` | Tự động |
| T.10.1 | Icon `🖊` chỉnh sửa | Chỉ hiển thị với người dùng có quyền sửa | Click → `OW_STAF_004` (chế độ sửa) |
| T.10.2 | Icon `🗑` xóa | Chỉ hiển thị với người dùng có quyền xóa | Click → Modal xác nhận xóa |
| — | Checkbox từng dòng + chọn tất cả | Dùng để chọn đối tượng phát hành tài khoản hàng loạt | Tick |
| P.1 | Text số lượng | `{Tổng}件中 {Từ}-{Đến}件` — cập nhật khi tìm kiếm / chuyển trang | Tự động |

- Interactions: checkbox được giữ nguyên khi đóng modal `OW_STAF_005` bằng `キャンセル`.
- Animation đề xuất: skeleton rows; nút `アカウント一括発行` đổi trạng thái mượt khi số dòng chọn thay đổi.

**Non-Happy Case:**

| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation input | N/A — thanh tìm kiếm không có ràng buộc định dạng | — | — |
| 2 Auth / session | Phiên hết hạn | Full screen | `「セッションの有効期限が切れました。再度ログインしてください。」` `[INFERENCE — cần verify]` |
| 2 Auth / session | Người dùng không có quyền `Create` / sửa / xóa | Chặn UI | — nút `＋新規登録` và icon 🖊 🗑 **không hiển thị** |
| 3 Network | Mất mạng khi tải danh sách | Banner | `「データの取得に失敗しました。再度お試しください。」` `[INFERENCE — cần verify]` |
| 4 Server error | API trả 500 | Banner | `「システムエラーが発生しました。管理者にお問い合わせください。」` `[INFERENCE — cần verify]` |
| 5 Empty state | Điều kiện tìm kiếm không khớp tài xế nào | Empty state | `UNKNOWN` — Figma không vẽ trạng thái rỗng → OQ-12 |
| 6 Conflict | Xóa tài xế đang được gán cho đơn giao hàng | `UNKNOWN` | `UNKNOWN` — Figma không định nghĩa → OQ-13 |
| 7 Business rule | Chọn 0 dòng rồi bấm `アカウント一括発行` | Button disabled | — |
| 8 External integration | N/A — màn danh sách không gọi dịch vụ ngoài | — | — |

---

### OW_STAF_003 — 配送スタッフ詳細 (Chi tiết tài xế — 3 tab)

**Happy Case:**
- Layout: sidebar + header (tên tài xế + 3 nút `削除` · `パスワード送信` · `編集`) → thanh tab: `基本情報` · `担当配送情報` · `変更履歴`.

#### Tab 1 — 基本情報

| Vị trí | Component | Nội dung | Action |
|---|---|---|---|
| H.1 | Button `削除` | Hiện dialog xác nhận trước khi xóa | Click |
| H.2 | Button `パスワード送信` | Hiện dialog `アカウント発行のメール送信の確認`. Đối tượng gửi **cố định là người phụ trách chính** | Click |
| H.3 | Button `編集` | Chuyển **toàn bộ màn** sang chế độ chỉnh sửa | Click |
| A.1 | `配送スタッフID` | Hệ thống tự sinh khi tạo mới · **không sửa được** | Tự động |
| A.2 | `配送スタッフ名` | ✅ Bắt buộc · ≤50 ký tự · chấp nhận kanji/hiragana · chỉ sửa ở chế độ chỉnh sửa | Nhập |
| A.3 | `配送スタッフ名カナ` | ✅ Bắt buộc · chỉ 全角カナ · ≤50 ký tự · **tự sinh** khi rời focus ở A.2 | Tự động / Nhập |
| A.4 | Dropdown `区分` | ✅ Bắt buộc · `個人` / `会社所属` | Chọn |
| A.5 | Dropdown `ステータス` | ✅ Bắt buộc · `有効` / `免許未登録` / `停止` / `無効` | Chọn |
| A.6 | `電話番号` | Tùy chọn · 半角数字 + gạch ngang · 10–11 ký tự (VD `050-1245-1245`) | Nhập |
| A.7 | Upload `免許証（画像）` | ✅ Bắt buộc · JPG/JPEG/PNG · ≤5MB · **do phía admin tải lên** · **không** có chức năng phóng to trên màn hình | Upload |
| A.8 | `ログインID` | **Cùng giá trị với `配送スタッフID`** · không sửa được | Tự động |
| A.9 | `メールアドレス` | ✅ Bắt buộc · định dạng email · ≤256 ký tự · dùng làm địa chỉ nhận email đặt lại mật khẩu | Nhập |
| A.10 | `最終ログイン日時` | Định dạng `yyyy年M月d日 HH:mm:ss` · không sửa được | Tự động |

#### Tab 2 — 担当配送情報

| Vị trí | Component | Nội dung | Action |
|---|---|---|---|
| B.1.1 | Date range `期間検索` | Mặc định: **ngày 1 tháng hiện tại 〜 ngày cuối tháng hiện tại** | Chọn |
| B.1.2 | Dropdown `配送状況` | `出荷準備` / `出荷済` / `荷受済` / `トラブル` / `配送完了` | Chọn |
| B.1.3 | Button `クリア` | Reset điều kiện tìm kiếm | Click |
| B.1.4 | Button `検索` | Lọc danh sách | Click |
| B.1.5 | Summary `集金合計金額` | Tổng tiền thu của **toàn bộ đơn khớp điều kiện** của tài xế này (không chỉ trang hiện tại) | Tự động |
| B.1.6 | Summary `駐車合計料金` | Tổng phí đỗ xe, cùng phạm vi tính như B.1.5 | Tự động |
| B.2.1〜B.2.9 | Bảng 10 cột | `No` · `配送日（着）` · `荷物温度帯` (badge) · `配送No` (link) · `荷受け住所` · `届け先拠点名` · `届け先住所` · `配送状況` (badge) · `配送区分` | Click `配送No` → `OW_DLVR_002` |
| B.2.10 | Cột `集金合計金額` (trong dòng) | Tiền thu của **1 đơn** — liên kết với `集金額` ở tab `添付資料` của `OW_DLVR_002` | Tự động |
| B.2.11 | Cột `駐車合計料金` (trong dòng) | Phí đỗ xe của **1 đơn** — liên kết với `駐車料金` ở tab `添付資料` của `OW_DLVR_002` | Tự động |
| P.1–P.3 | Phân trang | `{Tổng}件中 {Từ}−{Đến}件` · điều hướng · `件数/ページ` mặc định 10 | Click / Chọn |

#### Tab 3 — 変更履歴

| Vị trí | Component | Nội dung | Action |
|---|---|---|---|
| C | Bảng lịch sử thay đổi | **3 cột**, sắp xếp mới nhất trước | Khi tải trang |
| C.1 | `変更日時` | Định dạng `YYYY/MM/DD HH:mm` theo giờ hệ thống | Chỉ xem |
| C.2 | `変更内容` | Log do hệ thống sinh: tạo mới → `データ登録`; sửa 1 mục → `{Tên mục}を『{Trước} → {Sau}』に変更` | Chỉ xem |
| C.3 | `変更者` | Thao tác từ màn quản trị → tên người dùng (VD `山田`); cập nhật bằng CSV → `CSV取込` | Chỉ xem |

> ⚠ Dữ liệu mẫu trong Figma của tab này bị sai domain (hiển thị `栄養成分を更新`, `商品価格を「150 → 180」に変更` — nội dung màn sản phẩm). **Dùng quy tắc ở C.2, bỏ qua dữ liệu mẫu** (RQ-018).

- Interactions: trạng thái tab đồng bộ lên URL để QC/PM gửi link đúng tab.
- Animation đề xuất: skeleton theo tab.

**Non-Happy Case:**

| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation input | `配送スタッフ名` để trống / >50 ký tự | Inline error | `「Vui lòng nhập tên nhân viên giao hàng.」` / `「Không được vượt quá 50 ký tự.」` |
| 1 Validation input | `配送スタッフ名カナ` nhập 半角カナ | Inline error | `「Vui lòng nhập bằng katakana toàn chiều rộng.」` |
| 1 Validation input | `区分` / `ステータス` chưa chọn | Inline error | `「Vui lòng chọn phân loại.」` / `「Vui lòng chọn trạng thái.」` |
| 1 Validation input | `電話番号` sai định dạng | Inline error | `「Định dạng số điện thoại không đúng (half-width, gạch ngang, 10〜11 chữ số)」` |
| 1 Validation input | `メールアドレス` để trống / sai định dạng / >256 ký tự | Inline error | `「Vui lòng nhập email.」` / `「Định dạng email không đúng.」` / `「Không được vượt quá 256 ký tự.」` |
| 1 Validation input | Ảnh `免許証` chưa tải lên / sai định dạng / >5MB | Inline error | `「Vui lòng tải lên ảnh giấy phép lái xe.」` / `「Vui lòng tải lên file định dạng JPG, JPEG, PNG.」` / `「Dung lượng file tối đa 5MB.」` |
| 2 Auth / session | Phiên hết hạn | Full screen | `「セッションの有効期限が切れました。再度ログインしてください。」` `[INFERENCE — cần verify]` |
| 3 Network | Mất mạng khi lưu | Toast | `「ネットワークエラーが発生しました。時間をおいて再度お試しください。」` `[INFERENCE — cần verify]` |
| 4 Server error | API trả 500 | Toast | `「システムエラーが発生しました。管理者にお問い合わせください。」` `[INFERENCE — cần verify]` |
| 5 Empty state | Tab `担当配送情報` không có đơn nào trong kỳ | Empty state | `UNKNOWN` — Figma không vẽ trạng thái rỗng → OQ-12 |
| 5 Empty state | Tab `変更履歴` chưa có log nào | Empty state | `UNKNOWN` — Figma không vẽ trạng thái rỗng → OQ-12 |
| 6 Conflict | Bấm `削除` tài xế đang được gán cho đơn giao hàng | Modal | `UNKNOWN` — có dialog xác nhận nhưng nội dung + rule chặn chưa rõ → OQ-13 |
| 7 Business rule | Bấm `パスワード送信` cho tài xế trạng thái ≠ `有効` | `UNKNOWN` | `UNKNOWN` — Figma chỉ định nghĩa rule này cho luồng hàng loạt (`OW_STAF_005`), chưa rõ với nút đơn lẻ → OQ-13 |
| 8 External integration | Không gửi được email thông tin đăng nhập | `UNKNOWN` | `UNKNOWN` → OQ-11 |

---

### OW_STAF_004 — 配送スタッフ登録・編集 (Form tài xế)

**Happy Case:**
- Layout: sidebar + 1 cột form, các field theo đúng thứ tự tab `基本情報` của `OW_STAF_003`. Footer: `キャンセル` · `保存`.
- Components: dùng lại **toàn bộ định nghĩa A.2〜A.9** ở `OW_STAF_003` tab 1, với khác biệt:

| Field | Chế độ đăng ký mới | Chế độ chỉnh sửa |
|---|---|---|
| `配送スタッフID` | Ẩn — hệ thống sinh sau khi lưu | Hiển thị, chỉ đọc |
| `ログインID` | Ẩn | Hiển thị, chỉ đọc (= `配送スタッフID`) |
| `最終ログイン日時` | Ẩn | Hiển thị, chỉ đọc |
| `免許証（画像）` | ✅ Bắt buộc — `写真を追加` | ✅ Bắt buộc — thay ảnh |
| `ステータス` | Mặc định ⚠ cần xác nhận | Giữ giá trị hiện tại |

- Interactions: `配送スタッフ名カナ` tự sinh khi rời focus ở `配送スタッフ名`.
- Animation đề xuất: preview ảnh bằng lái ngay sau khi chọn file.

**Non-Happy Case:**

| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation input | Toàn bộ rule giống bảng Non-Happy của `OW_STAF_003` (nhóm 1) | Inline error | Xem `OW_STAF_003` — dùng **chung bộ message**, không tự đặt message khác |
| 2 Auth / session | Phiên hết hạn khi đang nhập form | Full screen | `「セッションの有効期限が切れました。再度ログインしてください。」` `[INFERENCE — cần verify]` |
| 2 Auth / session | Người dùng không có quyền `Create` | Chặn UI | — không vào được màn này (nút `＋新規登録` đã ẩn ở `OW_STAF_001`) |
| 3 Network | Mất mạng khi lưu | Toast | `「ネットワークエラーが発生しました。時間をおいて再度お試しください。」` `[INFERENCE — cần verify]` |
| 4 Server error | API trả 500 | Toast | `「システムエラーが発生しました。管理者にお問い合わせください。」` `[INFERENCE — cần verify]` |
| 5 Empty state | N/A — form không hiển thị danh sách | — | — |
| 6 Conflict | Email trùng với tài xế khác | `UNKNOWN` | `UNKNOWN` — bảng Figma `195513` A.9 **không** khai báo check trùng (khác với form đăng ký công ty) → OQ-13 |
| 6 Conflict | Double-click nút `保存` | Button disabled | — |
| 7 Business rule | Rời form khi có thay đổi chưa lưu | `UNKNOWN` | `UNKNOWN` — Figma không định nghĩa dialog cảnh báo → OQ-12 |
| 8 External integration | N/A — lưu hồ sơ không gọi dịch vụ ngoài | — | — |

---

### OW_STAF_005 — アカウント一括発行 (Modal phát hành tài khoản hàng loạt)

**Happy Case:**
- Layout: modal phủ lên `OW_STAF_001` — văn bản hướng dẫn → (dòng lỗi nếu có) → bảng cuộn danh sách đã chọn → footer `キャンセル` · `発行する`. Sau khi gửi hiện **popup kết quả**.
- Components — modal xác nhận:

| Vị trí | Component | Nội dung | Action |
|---|---|---|---|
| 1 | Văn bản hướng dẫn | "Sẽ gửi email chứa thông tin đăng nhập (ID・mật khẩu) đến các nhân viên giao hàng đã chọn. Bạn có muốn thực hiện?" + "※Nếu đã có tài khoản, mật khẩu sẽ được reset và cần đăng nhập lại." | Tự động |
| 2 | Dòng lỗi (đỏ) | **Chỉ hiện** khi trong danh sách chọn có dòng trạng thái ≠ `有効`: "Lỗi: 〇〇 trường hợp phát sinh." + "※Các dòng bị lỗi sẽ không nằm trong phạm vi gửi email." | Tự động |
| 3 | Bảng cuộn | Cột: `No` · `配送スタッフID` · `配送スタッフ名` · `ステータス` · `メールアドレス`. Dòng ≠ `有効` bị **tô nền xám** và **cột email để trống** | Cuộn |
| 4 | Button `キャンセル` | Đóng modal, **không** gửi email, quay về `OW_STAF_001`. **Checkbox đã chọn được giữ nguyên** | Click |
| 5 | Button `発行する` | Gửi hàng loạt **chỉ cho dòng trạng thái `有効`**. **Disabled khi 0 dòng hợp lệ** | Click → popup kết quả |
| 10 | Button `×` | Đóng modal / popup, quay về danh sách | Click |

- Components — popup kết quả:

| Vị trí | Component | Nội dung | Action |
|---|---|---|---|
| 6 | Popup **toàn bộ thành công** | Icon dấu tích xanh + "Đã hoàn tất phát hành tài khoản" + "Đã hoàn tất phát hành tài khoản và gửi email thông tin đăng nhập cho các nhân viên giao hàng đã chọn." | `完了` → `OW_STAF_001` |
| 7 | Popup **một phần lỗi** | Icon `!` đỏ + "Đã hoàn tất phát hành tài khoản (có một phần lỗi)" + `Thành công: 〇〇 trường hợp` / `Thất bại: 〇〇 trường hợp` + "※Các nhân viên giao hàng bị lỗi chưa được gửi email. Vui lòng kiểm tra lại nội dung và thực hiện lại." | Tự động |
| 8 | Button `完了` (khi một phần lỗi) | Đóng popup, về `OW_STAF_001`. **Phần thất bại KHÔNG được gửi lại** | Click |
| 9 | Button `再度実行` (khi một phần lỗi) | Gửi lại **chỉ cho các đối tượng bị lỗi trước đó** | Click |

- Interactions: bảng cuộn trong modal; trạng thái nút `発行する` phụ thuộc số dòng hợp lệ.
- Animation đề xuất: overlay fade-in; spinner trong lúc gửi hàng loạt.

**Non-Happy Case:**

| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation input | N/A — modal không có field nhập | — | — |
| 2 Auth / session | Phiên hết hạn khi đang mở modal | Full screen | `「セッションの有効期限が切れました。再度ログインしてください。」` `[INFERENCE — cần verify]` |
| 3 Network | Mất mạng trong lúc gửi hàng loạt | Toast | `「ネットワークエラーが発生しました。時間をおいて再度お試しください。」` `[INFERENCE — cần verify]` |
| 4 Server error | API trả 500 | Toast | `「システムエラーが発生しました。管理者にお問い合わせください。」` `[INFERENCE — cần verify]` |
| 5 Empty state | N/A — modal chỉ mở khi đã chọn ≥1 dòng | — | — |
| 6 Conflict | Gửi thành công **một phần** | Popup | "Đã hoàn tất phát hành tài khoản (có một phần lỗi)" + `Thành công: N` / `Thất bại: M` |
| 6 Conflict | Tài xế đã có tài khoản | Popup | — vẫn gửi, mật khẩu bị reset (cảnh báo đã nêu sẵn ở văn bản hướng dẫn No.1) |
| 7 Business rule | Toàn bộ dòng đã chọn đều ≠ `有効` (0 đối tượng hợp lệ) | Button disabled | — nút `発行する` bị vô hiệu hóa |
| 8 External integration | Dịch vụ gửi email không phản hồi | `UNKNOWN` | `UNKNOWN` — Figma chỉ định nghĩa "thất bại N trường hợp", chưa phân biệt lỗi hệ thống email → OQ-11 |

---

### OW_PROF_001 — プロフィール（基本情報） (Hồ sơ công ty — Thông tin cơ bản)

**Happy Case:**
- Layout: sidebar + thanh 2 tab (`基本情報` · `配送対応情報`) → card thông tin → nút `編集` góc phải; ở chế độ sửa thì footer có `キャンセル` · `保存`.
- Components: bộ field **trùng với `OW_AUTH_003` khối 基本情報 + 担当者** (A.1.1〜A.2.7).

| Chế độ | Hành vi |
|---|---|
| **Xem** | Toàn bộ field read-only; không hiện nút `住所検索`; hiện nút `編集` |
| **Sửa** | Toàn bộ field nhập được; hiện nút `住所検索`; footer `保存` / `キャンセル`; áp dụng **nguyên bộ validation + message** của `OW_AUTH_003` |

- Interactions: `カナ` / `フリガナ` tự sinh khi rời focus; mã bưu điện 7 số tự điền địa chỉ.
- Animation đề xuất: chuyển chế độ xem ↔ sửa không reload trang.

**Non-Happy Case:**

| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation input | Toàn bộ rule giống `OW_AUTH_003` (nhóm 1) | Inline error | Xem `OW_AUTH_003` — dùng **chung bộ message** |
| 2 Auth / session | Phiên hết hạn | Full screen | `「セッションの有効期限が切れました。再度ログインしてください。」` `[INFERENCE — cần verify]` |
| 3 Network | Mất mạng khi lưu | Toast | `「ネットワークエラーが発生しました。時間をおいて再度お試しください。」` `[INFERENCE — cần verify]` |
| 4 Server error | API trả 500 | Toast | `「システムエラーが発生しました。管理者にお問い合わせください。」` `[INFERENCE — cần verify]` |
| 5 Empty state | N/A — hồ sơ luôn tồn tại khi đã đăng nhập | — | — |
| 6 Conflict | Email người phụ trách trùng bản ghi hợp lệ khác | Inline error | `「このメールアドレスは既に使用されています。」` |
| 6 Conflict | Rời tab khi có thay đổi chưa lưu | `UNKNOWN` | `UNKNOWN` — Figma không định nghĩa dialog cảnh báo → OQ-12 |
| 7 Business rule | Cố xóa dòng `メイン担当者` | Button disabled | — |
| 8 External integration | Dịch vụ tra cứu 郵便番号 không phản hồi | `UNKNOWN` | `UNKNOWN` → OQ-11 |

---

### OW_PROF_002 — プロフィール（配送対応情報） (Hồ sơ công ty — Năng lực giao hàng) `[INFERENCE — cần verify]`

> ⚠ Canvas Figma **không có bảng 画面設計書 riêng** cho màn này. Nội dung dưới suy từ RQ-012: tab này trùng khớp 1-1 với Step 2 của form đăng ký (`OW_AUTH_004`). **Cần verify trước khi implement** → OQ-14.

**Happy Case:**
- Layout: giống `OW_PROF_001` nhưng nội dung là 2 khối `対応エリア` + `車両・設備情報`.
- Components: bộ field **trùng với `OW_AUTH_004`** (B.1.1〜B.2.5), **trừ** checkbox `契約書に同意します。` (B.3) — chỉ có ở luồng đăng ký, không có ở hồ sơ.

| Chế độ | Hành vi |
|---|---|
| **Xem** | Khu vực đáp ứng hiển thị dạng chip **không có nút ×**; radio/checkbox read-only; hiện nút `編集` |
| **Sửa** | Chip khu vực **có nút ×**; cây checkbox 3 tầng mở được; radio/multi-select nhập được; footer `保存` / `キャンセル` |

- Interactions: đồng bộ 2 chiều tag ↔ cây khu vực, giống `OW_AUTH_004`.
- Animation đề xuất: expand/collapse cây vùng miền.

**Non-Happy Case:**

| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation input | Toàn bộ rule giống `OW_AUTH_004` (nhóm 1), trừ B.3 | Inline error | Xem `OW_AUTH_004` — dùng **chung bộ message** |
| 2 Auth / session | Phiên hết hạn | Full screen | `「セッションの有効期限が切れました。再度ログインしてください。」` `[INFERENCE — cần verify]` |
| 3 Network | Mất mạng khi lưu | Toast | `「ネットワークエラーが発生しました。時間をおいて再度お試しください。」` `[INFERENCE — cần verify]` |
| 4 Server error | API trả 500 | Toast | `「システムエラーが発生しました。管理者にお問い合わせください。」` `[INFERENCE — cần verify]` |
| 5 Empty state | N/A — hồ sơ luôn tồn tại | — | — |
| 6 Conflict | Rời tab khi có thay đổi chưa lưu | `UNKNOWN` | `UNKNOWN` → OQ-12 |
| 7 Business rule | Bỏ tick toàn bộ khu vực đáp ứng rồi lưu | Inline error | `「対応エリアを選択してください。」` (áp theo `OW_AUTH_004` — cần verify có áp ở màn hồ sơ không → OQ-14) |
| 8 External integration | N/A | — | — |

---

## Responsive Requirements

| Breakpoint | Screen size (W×H) | Layout changes |
|---|---|---|
| Website (desktop) | **1440×1024** | Layout chuẩn duy nhất — sidebar cố định 210px + vùng nội dung 1232px. Toàn bộ 57 frame trong Figma đều có `width=1440`. |

**Quy tắc chung:**
- **Navigation:** sidebar trái cố định, 7 mục theo component `sider` (`31498:194809`): `ホーム` · `スケジュール` · `配送管理` · `見積もり管理` · `集金・駐車` · `配送スタッフ` · `プロフィール`. Sidebar có trạng thái **thu gọn icon-only**.
- **Font scale:** không scale theo viewport — kích thước cố định theo design token (`Noto Sans JP`).
- **Grid:** vùng nội dung 1 cột cho màn List/Form; `OW_HOME_001` dùng 2 cột (calendar-card bên trái ~740px + 2 card bên phải).
- **Bảng dữ liệu:** không responsive — cuộn ngang khi số cột vượt khung (`OW_DLVR_001` có 12 cột).
- **Không hỗ trợ** mobile / tablet (xem `## Out of Scope` mục 9).

---

## UX Review Notes

**UX:**
- ⚠️ **Form đăng ký 2 bước không có nút quay lại.** Figma chỉ có `キャンセル` ở bước 2 — người dùng phát hiện sai sót ở bước 1 sẽ phải hủy toàn bộ và nhập lại từ đầu (~18 field). **Đề xuất:** thêm nút `戻る` ở bước 2, giữ nguyên dữ liệu đã nhập → OQ-10.
- ⚠️ **Xóa file 非公開 không có dialog xác nhận** (FACT từ bảng `195509` No.3). Thao tác phá hủy không hoàn tác được mà chỉ cần 2 click. **Đề xuất:** bổ sung dialog xác nhận hoặc cơ chế undo trong toast.
- ✅ Luồng gán tài xế tốt: dropdown hiển thị **số đơn của tài xế trong đúng ngày giao** — người điều phối thấy ngay ai đang quá tải, không phải mở màn khác để đối chiếu.
- ✅ Happy path chính (gán tài xế) chỉ 4 bước: Danh sách → Chi tiết → Chọn tài xế → 確定. Dưới ngưỡng 5 bước.
- ⚠️ Người dùng phải nhập lại điều kiện tìm kiếm khi chuyển giữa `OW_SCHD_001` ⇄ `OW_SCHD_002` nếu state không được giữ. **Đề xuất:** giữ điều kiện tìm kiếm khi toggle 月/週 (Design-Technical đã có `?tab=&month=` trên URL — nên mở rộng cho cả filter).

**Information Design:**
- ✅ Nhất quán tốt: badge `⚠N件` chưa gán tài xế dùng **cùng 1 component** ở `OW_HOME_001`, `OW_SCHD_001` và `OW_DLVR_002` — người dùng học 1 lần dùng mọi nơi.
- ⚠️ **Trạng thái "chưa gán tài xế" hiển thị bằng ô trống** ở `OW_DLVR_001` (cột L.8/L.9). Ô trống dễ bị hiểu nhầm là lỗi tải dữ liệu. **Đề xuất:** hiển thị nhãn xám `未割当` thay vì để trống — nhưng đây là **thay đổi so với Figma**, cần khách duyệt.
- ⚠️ **Nội dung CSV khác hoàn toàn bảng trên màn hình** (màn hình: 1 dòng = 1 tài xế; CSV: 1 dòng = 1 đơn). Người dùng xuất file rồi mở ra sẽ bất ngờ. **Đề xuất:** ghi chú ngay cạnh nút `CSV出力`.
- ⚠️ Một số message lỗi trong Figma đang là **tiếng Việt** (`「Vui lòng tải lên tệp hình ảnh...」`, `「Chỉ có thể đăng ký tối đa 20 file.」`) trong khi portal là **tiếng Nhật 100%**. Cần bản JP chính thức trước khi code → OQ-15.
- ✅ Error message phần lớn actionable (nêu rõ định dạng/giới hạn, không chỉ "sai định dạng").

**Performance:**
- ⚠️ **`OW_SCHD_002` (lịch tuần) tải 7 danh sách cuộn cùng lúc**, mỗi ngày có thể hàng chục điểm giao → tối đa vài trăm dòng render một lần, **không có pagination**. **Đề xuất:** giới hạn N dòng/ngày + link "xem thêm", hoặc virtual scroll.
- ⚠️ **Tab `実績` của `OW_DLVR_002` có 2 bảng kèm ảnh sản phẩm từng dòng** (frame cao 2250px). Nếu 1 đơn có nhiều mặt hàng → tải nhiều ảnh cùng lúc. **Đề xuất:** lazy-load thumbnail + skeleton.
- ⚠️ **`OW_STAF_001` hiển thị thumbnail ảnh bằng lái mỗi dòng** (10 ảnh/trang mặc định). **Đề xuất:** dùng ảnh đã resize phía server, không tải ảnh gốc ≤5MB.
- ⚠️ **2 summary của `OW_CLCT_001` và tab `担当配送情報` tính trên toàn bộ kết quả tìm kiếm**, không chỉ trang hiện tại → cần aggregate query riêng, không tính từ dòng đang hiển thị. Nếu kỳ tìm kiếm rộng (cả năm) có thể chậm. **Đề xuất:** index theo `(deliverer_id, delivery_date)` + cân nhắc giới hạn độ dài kỳ tìm kiếm.
- ✅ Không có real-time / WebSocket trong phạm vi feature này → không cần polling fallback.

---

## Open Questions

> ⚠️ **Rule:** hạng mục `UNKNOWN` / `CONFLICT` **KHÔNG** được nối vào flow bằng giả định. Dev không implement, QC không viết TC cho tới khi chốt.

| ID | Câu hỏi | Nguồn | Chặn hạng mục | Người quyết |
|---|---|---|---|---|
| **OQ-01** | Chốt **1 hệ Screen Code duy nhất** cho E05. Hiện có 3 hệ: SPEC Phase 1 (`OW_DLVP_*`), api-doc/Design-Technical (`OW_AUTH/ANNO/DLVR/CLCT/STAF/PROF`), Figma (`OW_SCHED_*`, và **đặt sai tên frame** — 配送管理/配送スタッフ/プロフィール đều mang tên `OW_SCHED_001`/`OW_ANNO_001`). SPEC này dùng hệ thứ 2 + thêm `OW_SCHD_001/002`. | RQ-005 · `Figma-Analysis.md` Q2 | **Toàn bộ QC** — không trace được TC ↔ màn | PM / BrSE |
| **OQ-02** | Rule khóa 7 ngày: mốc là `配送日（着）` hay `発送予定日`? BE có chặn hay chỉ FE disable? Khóa những field nào — chỉ `配送スタッフ` hay cả form? | RQ-006 · Figma note `31498:194738` | `OW_DLVR_002` tab 配送概要 · BE-04 · FE-04 | BrSE + khách |
| **OQ-03** | Đổi 7 cột CSV 集金 theo Figma (`配送日/配送ID/配送スタッフID/配送スタッフ名/配送先名/集金金額/駐車料金`, 1 dòng = 1 配送) hay giữ 7 cột đang chạy (`発送日/配送スタッフ名/納品先/集金合計/駐車場料金/差額/提出日時`)? Đổi = breaking change với vận hành đang dùng file cũ. | RQ-009 · `Figma-Analysis.md` C8 | `OW_CLCT_001` nút `CSV出力` | PM + vận hành khách |
| **OQ-04** | **Fee-area (phí theo khu vực) giữ hay bỏ?** `FeeAreaTab` + `FeeEditModal` + import/export CSV phí **đã implement và đang chạy**, có trong `scope-changes-phase2.md` §E05, nhưng プロフィール P2 chỉ còn 2 tab. Bỏ = xóa tính năng đang dùng. | RQ-013 · `Figma-Analysis.md` C3 | `OW_PROF_001/002` · FE-13 | PM + khách |
| **OQ-05** | Cụm `見積もり` (3 frame `LOGI CORE`) bỏ hay merge vào mục `見積もり管理` của sidebar ESSTATION? Sidebar chính thức **đã có** mục này nhưng màn hình lại dùng branding + sidebar khác. Hiện mục nav trỏ tới đâu? | RQ-014 · `Figma-Analysis.md` Q7 | `OW_HOME_001` khối C (link C.2/C.4) · BE-08 · FE-11 | PM + khách |
| **OQ-06** | Badge `メンテナンス` trên `OW_HOME_001` map sang `NotificationType` nào? Thêm enum mới hay dùng lại `SYSTEM_ANNOUNCEMENT`? (enum hiện có 7 giá trị, không có giá trị Bảo trì) | RQ-015 · `Figma-Analysis.md` C9 | `OW_HOME_001` B.2 · `OW_ANNO_002` No.1 · BE-10 · FE-14 | BrSE |
| **OQ-07** | Sau khi submit form đăng ký: (a) có màn xác nhận `OW_AUTH_005` không, nội dung gì? (b) nếu user đăng nhập khi hồ sơ còn `仮登録` thì hiện message gì? (c) E03 duyệt ở màn nào — cần SPEC riêng cho E03? | RQ-016 · RQ-002 | `OW_AUTH_005` · `OW_AUTH_001` (AF-1.3) · BE-09 | BA + BrSE |
| **OQ-08** | Tab `実績`: (a) số ngày định nghĩa "gần hết hạn" để tô đỏ `賞味期限`? (b) Driver App có **bắt buộc** nhập `実在庫`/`実際数` không? (c) hiển thị gì khi tài xế chưa báo 実績? | RQ-023 · `Figma-Analysis.md` Q8 | `OW_DLVR_002` tab 実績 · BE-04 · FE-05 | BrSE + khách |
| **OQ-09** | Cách người đăng ký xem `契約書` trước khi tick đồng ý: link URL, popup, hay file PDF tải về? | RQ-024 · Figma bảng `195504` B.3 | `OW_AUTH_004` B.3 | BrSE + khách |
| **OQ-10** | Form đăng ký 2 bước: có nút `戻る` từ bước 2 về bước 1 không? Nếu có thì giữ dữ liệu đã nhập chứ? | AF-2.6 · UX Review | `OW_AUTH_003/004` | BA + khách |
| **OQ-11** | Hành vi khi **dịch vụ ngoài thất bại**: gửi email OTP lỗi · gửi email thông tin đăng nhập lỗi · tra cứu 郵便番号 không phản hồi. Hiển thị gì cho user? | RQ-003 (nhóm 8 của 6 screen) | `OW_AUTH_002/003/004` · `OW_STAF_003/005` · `OW_PROF_001` | BrSE |
| **OQ-12** | **Empty state + lỗi hệ thống chưa được thiết kế.** Figma không vẽ trạng thái rỗng cho 10 màn có danh sách, cũng không vẽ banner/toast lỗi mạng/500 và màn hết phiên. Hiện SPEC đang dùng message `[INFERENCE]`. Cần khách duyệt bộ message chuẩn (JP) dùng chung. | RQ-003 (nhóm 3/4/5 toàn bộ screen) | **10 màn có danh sách** + toàn bộ màn gọi API | Designer + BrSE |
| **OQ-13** | Màn tài xế: (a) xóa tài xế đang được gán cho đơn giao hàng — chặn hay cho xóa? (b) `パスワード送信` đơn lẻ có áp rule "chỉ trạng thái `有効`" như luồng hàng loạt không? (c) email tài xế có check trùng không (bảng Figma không khai báo)? | `OW_STAF_001/003/004` nhóm 6/7 | `OW_STAF_001/003/004` | BrSE |
| **OQ-14** | Xác nhận tab `配送対応情報` của プロフィール dùng **chung data model** với Step 2 form đăng ký (`OW_AUTH_004`). Nếu đúng → cần bảng 画面設計書 riêng cho プロフィール hay dùng lại bảng `195504`? | RQ-012 | `OW_PROF_002` | BA + Designer |
| **OQ-15** | Một số error message trong Figma đang viết **bằng tiếng Việt** (`「Vui lòng tải lên tệp hình ảnh...」` · `「Dung lượng tối đa... 5MB.」` · `「Chỉ có thể đăng ký tối đa 20 file.」` · toàn bộ message của `OW_STAF_003/004`) trong khi portal là tiếng Nhật 100%. Cần bản JP chính thức. | RQ-003 · UX Review | `OW_DLVR_002` · `OW_STAF_003/004` | BrSE + khách |
| **OQ-16** | Chi tiết field của tab `添付資料` (`OW_DLVR_002` tab 4) — canvas **không có bảng 画面設計書**. Cần bổ sung: field nào của `駐車報告` / `集金報告`, có sửa được không, ảnh receipt mở viewer nào? | RQ-017 | `OW_DLVR_002` tab 添付資料 · FE-06 | BA + Designer |
| **OQ-18** | Thay đổi **hồ sơ công ty** (`OW_PROF_001/002`) có được ghi log lịch sử không? Figma chỉ có tab `変更履歴` ở `配送スタッフ詳細`, màn プロフィール chỉ có 2 tab. Nếu có ghi log thì xem ở đâu — thêm tab thứ 3 hay chỉ lưu phía BE để E03 tra cứu? | Self-feedback (Bước 5.6) — HP-9 bước 3 | `OW_PROF_001/002` | BrSE + khách |
| **OQ-17** | Danh sách lựa chọn của dropdown `件数/ページ` (chỉ biết mặc định = 10) · hành vi nút `クリア` ở `OW_STAF_001` sau khi xóa điều kiện · cột + UI của nút `並べ替え` · hành vi khi click thumbnail `免許` ở danh sách tài xế · giá trị mặc định của `ステータス` khi tạo tài xế mới. | RQ-025 · Figma bảng `195512` S.4/S.7/T.2 | `OW_DLVR_001` · `OW_CLCT_001` · `OW_STAF_001/004` | Designer + BrSE |

---

## Bước tiếp theo

```
→ "Hãy là Tech Lead Design, cập nhật Design-Technical.md từ SPEC này: es-kitchen-docs/docs/features/delivery-partner/SPEC.md"
   ⚠️ Design-Technical.md + 43 task file ĐÃ TỒN TẠI — dùng scoped update theo POLICIES §4.6, không regenerate toàn bộ.

→ "Hãy là Designer, đặt lại tên frame Figma theo Screen Code trong SPEC này: es-kitchen-docs/docs/features/delivery-partner/SPEC.md"
   ⚠️ Figma nguồn đã có đủ giao diện — Designer KHÔNG vẽ lại, chỉ rename frame + bổ sung empty state / error state còn thiếu (OQ-12).

→ "Hãy là QC, sinh test cases từ SPEC này: es-kitchen-docs/docs/features/delivery-partner/SPEC.md"
   ⚠️ KHÔNG viết TC cho hạng mục UNKNOWN trong ## Open Questions.
```
