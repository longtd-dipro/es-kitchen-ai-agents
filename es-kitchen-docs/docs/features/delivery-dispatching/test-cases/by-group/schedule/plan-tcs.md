# TC Implementation Plan: Group 1 — スケジュール / Lịch trình

> Phân rã dựa trên Basic Design v2 (`screens_num.json`) và ảnh annotated. Số `#` là `no` của item BD. Prefix TC: SCM / SCW / SCD / SCR / SCA / SCV / SCG / SCNAV.

## AW_SCHED_001 — スケジュール 月表示 (SCM)

- **Archetype:** Calendar (kèm vùng Search)
- **Chiến lược Test Case:**
  - Kiểm ĐẦY ĐỦ thanh công cụ và vùng tìm kiếm tại đây (2 ô từ khoá #15, #16 có XSS / SQLi; 10 dropdown #17–#26 mỗi cái 1 TC lựa chọn + lọc), 002 và 003 chỉ xác nhận lại.
  - Số 「出荷：N件」 (#33) đối chiếu chéo với 件数表示 của chế độ 「日」 làm oracle.
  - Ngưỡng 上限超過 (#37) theo Boundary Tier 299 / 300 / 301 và kiểm "chỉ cảnh báo, không chặn"; 資材便 không tính.
  - Badge 未割当 / 取消 / 代替便 (#35, #36): hiển thị khi N > 0, ẩn khi N = 0.
  - Rule sau オーダー締切 (#10, #12): không có thao tác đổi ngày hàng loạt.
- **UI chung:** hàng tiêu đề (要確認 / 変更申請 / CSV出力) → thanh công cụ → dải giai đoạn chu kỳ → vùng tìm kiếm → lịch tháng 7 cột.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| 要確認（N件） #1 | Hyperlink + Panel | Medium | — | Số đếm trùng menu trái; panel chỉ có ở prototype |
| 変更申請（N件） #2 | Hyperlink | High | — | Mở AW_SCHED_004; số giảm sau 一括承認 |
| CSV出力 #3 | Button (Export) | Medium | — | Lỗi E_SCHED001_S_004 |
| 表示切替 #4 | Tab / Segment | High | State Transition (月 ↔ 週 ↔ 日) | Giữ điều kiện tìm kiếm khi chuyển (AMB-06) |
| 対象年月 #5, ‹ #6, › #7, 今日 #8 | Datepicker + Button | Medium | BVA (ranh giới năm 12 ↔ 1) | Tải lại lịch và tên chu kỳ #11 |
| 配送サイクル設定 #9 | Button (Navigation) | Medium | — | Màn ngoài nhóm |
| モード表示 #10, サイクル名 #11, 案内文 #12 | Badge / Text | High | Decision Table (確定 / 予定) | Quyết định có thao tác dời hay không |
| 段階ステップ表示 #13 | Label | Medium | — | Bước hiện tại tô đậm |
| 検索条件の折りたたみ #14 | Icon (Toggle) | Low | — | Giữ giá trị đã nhập |
| キーワード検索1 #15 | Textbox | High | EP (4 loại khoá) | 送り状番号 CONFLICT |
| キーワード検索2 #16 | Textbox | High | EP (địa chỉ / bưu điện / điện thoại) | — |
| 10 Dropdown #17–#26 | Dropdown | Medium (ステータス, ピッキング倉庫: High) | EP | ピッキング倉庫 ảnh hưởng ngưỡng #37 |
| クリア #27, 検索 #28 | Button | High | — | 検索 phát sinh E_SCHED001_S_001–003 |
| 曜日ヘッダー #29, 日付セル #30 | Calendar | High | — | Click ô ngày sang 002 (AMB-02) |
| 日付・不可日名 #31, サイクル名・枠コード #32 | Text | Medium | — | — |
| 出荷件数 #33, 配送件数 #34 | Text | Critical | EP (ngày thường / 休：出荷 / 休：配送 / cả hai) | Không tính 資材便 |
| 未割当 #35, 取消 #36 | Badge | High | BVA (0 / ≥1) | 未割当 đổi theo phân công tài xế |
| 上限超過 #37 | Badge | Critical | Boundary Tier (299 / 300 / 301) | Phụ thuộc ngưỡng kho và bộ lọc #24 |

## AW_SCHED_002 — スケジュール 週表示 (SCW)

- **Archetype:** Calendar (lưới tuần)
- **Chiến lược Test Case:**
  - Thanh công cụ + tìm kiếm: chỉ TC xác nhận chính (layout, 検索 cơ bản, クリア, giữ điều kiện khi chuyển từ 「月」).
  - Tập trung lưới tuần: thẻ tiêu đề ngày #30, dòng dữ liệu #32 (3 kiểu hiển thị), 着日 #33, ほか N件 #34, chú giải #35.
  - Oracle: 「出荷：N件」 trên thẻ = số dòng hiển thị + N của 「ほか N件」.
  - Rule: chu kỳ đã chốt không có checkbox / 出荷データの移動; chu kỳ 予定 thì có (UNCONFIRMED).
- **UI chung:** phần đầu giống 001; bên dưới là 7 cột ngày, mỗi cột có thẻ tiêu đề và danh sách dòng; cuối là chú giải.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Header + Toolbar #1–#9 | Hyperlink / Button / Tab | Medium | — | Dùng chung với 001 |
| 対象週 #5, ‹ #6, › #7, 今日 #8 | Datepicker + Button | Medium | BVA (tuần vắt 2 tháng) | Định dạng ô CONFLICT |
| Dải chu kỳ #10–#13 | Badge / Text | High | Decision Table (確定 / 予定) | Quyết định có checkbox dòng |
| Vùng tìm kiếm #14–#28 | Textbox / Dropdown / Button | Medium | — | Lỗi E_SCHED002_S_001–003 |
| 曜日ヘッダー #29 | Label | Medium | — | Cột hôm nay khung xanh |
| 日付ヘッダーカード #30 | Hyperlink (Card) | High | — | Click sang 003; 「休：出荷」 thì cột rỗng |
| 温度帯タグ #31 | Badge | Medium | — | — |
| 拠点名（配送データ行） #32 | Hyperlink (Row) | Critical | State (thường / thay đổi sau chốt / 要対応 / 取消) | Click sang 配送データ詳細; tooltip |
| 着日 #33 | Text | Medium | — | — |
| ほか N件 #34 | Text | Medium | BVA (0 / ≥1) | Tổng với số dòng = #30 |
| 凡例 #35 | Label | Low | — | Khớp 3 kiểu hiển thị của #32 |

## AW_SCHED_003 — スケジュール 日表示 (SCD)

- **Archetype:** List (bảng + phân trang)
- **Chiến lược Test Case:**
  - Thanh công cụ + tìm kiếm: xác nhận chính; lọc kiểm trực tiếp trên cột 状態 #38 và 便種別 #37.
  - Dòng tiêu đề ngày #29–#32: số 出荷 kèm ngưỡng (300 / 301), 要対応, 変更 khớp với số dòng tô màu trong bảng.
  - Bảng #33–#43: thứ tự sắp xếp, màu dòng 要対応 / thay đổi sau chốt, cột 変更申請 = 「変更不可」 sau オーダー締切.
  - Phân trang #44–#46: BVA 10 / 11 bản ghi, trang cuối 148 bản ghi, ‹ › vô hiệu.
  - Empty state E_SCHED003_001.
- **UI chung:** phần đầu giống 001; dòng tiêu đề ngày; bảng 10 cột; 件数表示 + phân trang + 10件／ページ.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Header + Toolbar #1–#9 | Hyperlink / Button / Tab | Medium | — | Dùng chung với 001 |
| 対象日 #5, ‹ #6, › #7, 今日 #8 | Datepicker + Button | Medium | BVA (cuối tháng) | Tải lại #29 và bảng |
| Dải chu kỳ #10–#13 | Badge / Text | High | Decision Table (確定 / 予定) | Quyết định cột 変更申請 #39 |
| Vùng tìm kiếm #14–#28 | Textbox / Dropdown / Button | Medium | — | Lỗi E_SCHED003_S_001–003; đưa về trang 1 |
| 日の見出し #29 | Text | Medium | — | — |
| 出荷件数（しきい値） #30 | Text | Critical | Boundary Tier (299 / 300 / 301) | Khớp 件数表示 #44 |
| 要対応件数 #31, 変更件数 #32 | Text / Badge | High | — | Khớp số dòng nền cam / nền xanh |
| 配送データ一覧 #33 | Table | Critical | — | Empty E_SCHED003_001; thứ tự theo spec_tong_quan §15-2 |
| No #34, 配送No #35 | Text / Hyperlink | Medium | — | 配送No sang 配送データ詳細 |
| 拠点名 #36 | Text | High | State (thường / 要対応 / thay đổi) | Lý do và nội dung thay đổi |
| 便種別 #37, 温度帯 #40, プラン名 #41 | Text / Badge | Low | — | — |
| 状態 #38 | Badge | High | EP (trạng thái giao hàng) | Trùng giá trị dropdown ステータス |
| 変更申請 #39 | Text | Critical | Decision Table (trước / sau オーダー締切) | Khớp thuật ngữ 007 #14 |
| 出荷日 #42, 納品日 #43 | Text | Medium | — | Định dạng CONFLICT |
| 件数表示 #44, ページ送り #45, 表示件数 #46 | Pagination + Dropdown | Medium | BVA (10 / 11 / trang cuối) | Đổi số dòng về trang 1 |

## AW_SCHED_004 — 変更申請（未処理）モーダル (SCR)

- **Archetype:** Modal (List + chọn nhiều)
- **Chiến lược Test Case:**
  - Decision Table 判定ステータス × checkbox: 問題なし (bật) / 希望日なし (tắt) / 要再確認 (tắt), kèm thử bật qua DevTools.
  - Lọc: ô từ khoá #4 (XSS / SQLi), システム判定 #5 đủ 3 giá trị, 便種別 #6, AND.
  - Phán định tính lại khi mở lại popup (#18); yêu cầu quá hạn chốt đơn vẫn ở danh sách.
  - Phân trang 25 bản ghi (3 trang), không có đổi số dòng.
  - Đóng popup: × và キャンセル không thay đổi dữ liệu.
- **UI chung:** tiêu đề + ×; câu hướng dẫn; hàng lọc; bảng 11 cột có checkbox; 全N件 + phân trang; footer キャンセル / 一括承認.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| タイトル #1, 説明文 #3 | Label / Text | Low | — | — |
| 閉じる（×） #2, キャンセル #21 | Icon / Button (Dialog) | High | — | Bỏ trạng thái tick |
| 絞り込み条件 #4 | Textbox | High | EP | — |
| システム判定 #5, 便種別 #6 | Dropdown | Medium | EP (3 + 2 giá trị) | Khớp cột #18, #14 |
| クリア #7, 検索 #8 | Button | High | — | Lỗi E_SCHED004_S_001–003, E_SCHED004_001; về trang 1 |
| 選択チェックボックス #9 | Checkbox | Critical | Decision Table (判定 × enable) | Phụ thuộc #18; đầu vào của #22 |
| No #10, 申請番号 #11, 受付日 #12 | Text / Hyperlink | Medium | — | 申請番号 sang 配送データ詳細 |
| 拠点名 #13, 便種別 #14, 温度帯 #15 | Text / Badge | Medium | — | — |
| 納品日 #16, 第一希望日 #17 | Text | High | — | 希望日なし khi không chỉ định |
| 判定ステータス #18 | Badge | Critical | State Transition (tính lại runtime) | Quyết định #9 |
| 理由 #19 | Text | Low | — | Cắt sau 2 dòng |
| 件数表示・ページ送り #20 | Pagination | Medium | BVA (25 bản ghi) | — |
| 一括承認 #22 | Button | Critical | — | Mở AW_SCHED_004.1 ①, chưa duyệt |

## AW_SCHED_004.1 — 変更申請一括承認モーダル（確認・完了） (SCA)

- **Archetype:** Modal (Confirm → Result)
- **Chiến lược Test Case:**
  - State Transition: ① 確認 → ② 完了 (duyệt hết) / kết quả một phần (E_SCHED0041_001) / lỗi System (giữ ①).
  - Kiểm dữ liệu trước → sau: 納品日 → 承認後の納品日 (= 第一希望日), ピッキング日 giữ lead time theo vùng nhiệt.
  - Phán định lại phía server: ngày thành ngày lễ, lượt giao locked, yêu cầu đã được người khác duyệt.
  - Hậu kiểm tích hợp: yêu cầu rời danh sách chưa xử lý, ngày ở chế độ 「日」 đổi, lịch sử lưu ngày giờ + người duyệt, lạnh + đông lạnh dời cùng.
- **UI chung:** ① tiêu đề + ×, câu hướng dẫn có N, bảng 9 cột chỉ đọc, キャンセル / 一括承認; ② popup nhỏ icon ✓, tiêu đề, thông báo, 完了.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| タイトル #1, 説明文 #3 | Label / Text | High | — | N = số yêu cầu đã tick ở 004 |
| 閉じる（×） #2, キャンセル #13 | Icon / Button (Dialog) | High | — | Quay về 004, không duyệt |
| Bảng xác nhận #4–#8, #11, #12 | Table (read-only) | Critical | — | Chỉ gồm 「問題なし」 đã tick |
| 承認後の納品日 #9 | Text | Critical | — | = 第一希望日 của 004 #17 |
| ピッキング日 #10 | Text | Critical | Decision Table (vùng nhiệt × lead time) | — |
| 一括承認 #14 | Button | Critical | State Transition + Decision Table (guard duyệt) | Lỗi E_SCHED0041_S_001–003, E_SCHED0041_001 |
| 完了アイコン #15, タイトル #16, 完了メッセージ #17 | Icon / Label / Text | High | — | N = số đã duyệt |
| 閉じる（×） #18, 完了 #19 | Icon / Button | High | — | Về Lịch trình; số 変更申請 giảm |

## AW_SCHED_006 — 出荷データの移動モーダル (SCV)

- **Archetype:** Modal (Form chọn 1 ngày đích)
- **Chiến lược Test Case:**
  - Decision Table kho OK/NG × cơ sở OK/NG trên 4 ứng viên mẫu (11-18, 11-19, 11-20, 11-24).
  - Ứng viên: loại ngày quá khứ và ngày khác chu kỳ.
  - Dời: toàn bộ OK; một phần (mục NG giữ ngày cũ, E_SCHED006_002); quá hạn chốt đơn (E_SCHED006_001).
  - Hậu kiểm: lead time giữ nguyên theo vùng nhiệt, dấu xanh đã dời, lịch sử, lạnh + đông lạnh dời cùng, vượt ngưỡng chỉ cảnh báo.
- **UI chung:** tiêu đề + ×; 倉庫別件数 + 移動元; 変更先の配送日一覧 + ghi chú; bảng ứng viên 5 cột; banner cảnh báo; footer N件 選択中 + キャンセル / 確認して移動.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| タイトル #1 | Label | Medium | — | CONFLICT (AMB-13) |
| 閉じる（×） #2, キャンセル #14 | Icon / Button (Dialog) | High | — | Không dời |
| 倉庫別件数 #3, 移動元 #4, 選択件数 #13 | Text | High | — | Tổng theo kho = số đang chọn |
| 変更先の配送日一覧 #5 | Label | Low | — | Ghi chú đổi theo ứng viên |
| 選択 #6 | Radio | Critical | EP (quá khứ / khác chu kỳ / hợp lệ) | Điều khiển banner #12; lỗi E_SCHED006_S_001–003 |
| 配送日 #7, サイクル #8 | Text | Medium | — | 「現在の配送日」 |
| 倉庫（出荷できるか） #9 | Badge | Critical | Decision Table (OK / NG theo kho) | — |
| 拠点（受け取れるか） #10, 詳細を確認 #11 | Badge / Hyperlink | Critical | Decision Table (全拠点 OK / N拠点 NG) | Link chỉ có ở dòng NG |
| 警告メッセージ #12 | Banner | Critical | — | Hiển thị theo lựa chọn #6; E_SCHED006_002 |
| 確認して移動 #15 | Button | Critical | Decision Table (hết OK / một phần / quá hạn chốt đơn) | E_SCHED006_001, E_SCHED006_002 |

## AW_SCHED_007 — 用語の説明モーダル (SCG)

- **Archetype:** Modal (Static, chỉ đọc)
- **Chiến lược Test Case:**
  - Mỗi thuật ngữ #4–#17 một TC đối chiếu nguyên văn tên và giải thích.
  - Thứ tự và số lượng 14 dòng; không có phần tử thao tác ngoài ×.
  - Đóng bằng × và Esc (trả focus về nút mở).
- **UI chung:** tiêu đề 「用語の説明」 + phụ đề + ×; bảng 2 cột 14 dòng; không footer.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| タイトル #1, サブタイトル #2 | Label | Low | — | — |
| 閉じる（×） #3 | Icon (Dialog) | Medium | — | Esc + trả focus |
| 14 dòng thuật ngữ #4–#17 | Text (Table tĩnh) | Low (変更不可, 要確認: Medium) | — | #14 khớp cột 変更申請 của 003 |

## Navigation (SCNAV)

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Sidebar → 001; 月 ↔ 週 ↔ 日 | Navigation | Critical | State Transition | — |
| Ô ngày (001) → 002; thẻ ngày (002) → 003 | Navigation | High | — | AMB-02 |
| 001/002/003 → 004 → 004.1 ① → ② → スケジュール | Navigation (Modal chain) | Critical | State Transition | AMB-11 |
| 002/003 (予定) → 006 | Navigation | High | — | AMB-09 |
| Header → 007 | Navigation | Medium | — | AMB-14 |
| Sang màn ngoài nhóm (配送データ詳細, 配送サイクル設定, 要確認一覧) | Navigation | High | — | AMB-16 |
| E2E duyệt hàng loạt; E2E dời dữ liệu | Integration | Critical | — | — |

## Ghi chú tổng quát

- **Assumption môi trường test:** (1) môi trường có seed như `## Test Data Reference` của `test-cases.md` (chu kỳ 9月 / 10月 đã chốt, 11月 còn 予定; ngưỡng 関東倉庫 = 300); (2) chỉnh được ngày hệ thống hoặc seed tương ứng ngày chạy test; (3) tester dùng được DevTools / proxy để mô phỏng 401, mất mạng, 500; (4) các màn ngoài nhóm (配送データ詳細, 配送サイクル設定, 要確認) đã deploy để hậu kiểm; (5) chưa có tài khoản role Ops CS / Sales.
- **Ngân sách:** mỗi sheet ≤ 90 TC (SCM 87 là sheet lớn nhất).
