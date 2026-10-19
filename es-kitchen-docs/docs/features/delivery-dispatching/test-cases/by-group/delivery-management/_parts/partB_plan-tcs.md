# TC Implementation Plan: Group 2 — 出荷・配送管理 — PHẦN B

## AW_DLVMNG_003 + 011 — 配送ルート (prefix DMR)
- **Archetype:** Detail/View (tab chỉ đọc, 2 trạng thái: 003 có banner + ghi chú ES採番; 011 có bảng vận đơn)
- **Chiến lược Test Case:**
  - Kiểm bảng 「地点と配送会社（ルート順）」 bằng 2 lớp tương đương: tuyến đa chặng (3 dòng) và tuyến không trung chuyển (2 dòng).
  - Cột 「次の地点へ運ぶ配送会社」 dựng Decision Table theo loại chặng (hãng vận chuyển / tự giao / uỷ thác) × đã gán / chưa gán.
  - Mục 「送り状番号」: nguồn phát hành (配送会社CSV / ES採番) × có link 追跡 hay không × 有効 / 無効.
  - Banner sau hạn chốt đơn kiểm theo trạng thái trước / sau オーダー締切.
  - Không sinh TC sửa tuyến (BD: UI UNKNOWN) — chỉ 1 TC xác nhận không có control chỉnh sửa.
- **UI chung:** header chung + (banner) + thanh tab + 3 mục thu gọn được.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Header chung・thanh tab | Label / Tab | Low | — | Thuộc AW_DLVMNG_002 (Phần A) |
| Banner オーダー締切後 | Banner | High | State Transition (trước / sau hạn chốt) | Phạm vi tab TBD |
| 6 thuộc tính tuyến (配送区分 … 中継) | Text (Disable) | Medium | EP (中継あり / 中継なし) | 中継 suy ra từ bảng điểm |
| ルート引き継ぎの注記 | Text | Low | — | ID hợp đồng con ở tab 配送概要 |
| Bảng 地点と配送会社（ルート順） | Table | Critical | EP (đa chặng / 1 chặng) | — |
| Cột 住所 | Text | High | — | Snapshot so với master chi nhánh |
| Cột 次の地点へ運ぶ配送会社 | Text | High | Decision Table | Trạng thái gán tài xế |
| Cột この地点での受取 | Text | Medium | State Transition (chưa nhận / đã nhận) | Bảng 区間ごとの受取 ở tab 実績 |
| Cột 搬入経路 | Hyperlink | Medium | — | Tab 添付資料 mục ① |
| ES採番の注記 | Text | High | Decision Table (loại chặng 1) | Bảng vận đơn (011) |
| Bảng 送り状番号 (6 cột) | Table | Critical | Decision Table (発行元 × 状態 × 追跡) | Trang tra cứu của hãng (ngoài hệ thống) |
| Lỗi hệ thống | — | High | — | — |

## AW_DLVMNG_004 + 012 — 実績 (prefix DMJ)
- **Archetype:** Detail/View (004 = trạng thái rỗng; 012 = có dữ liệu + nút vào chế độ sửa)
- **Chiến lược Test Case:**
  - 004: kiểm thông báo rỗng và chuyển trạng thái rỗng → có dữ liệu khi tài xế báo cáo.
  - 012: field 「状態」 kiểm theo quy tắc số lượng giao được (đủ / thiếu / có hàng thay thế).
  - Danh sách 「ES配送便の手順」: từng bước 1 TC, riêng 「5. 集金」 kiểm biên tiền dự kiến = 0.
  - 3 bảng (検品の差異・代替品, 在庫確認・陳列の結果, 区間ごとの受取): mỗi cột có quy tắc hiển thị riêng (đỏ, đậm, trống) 1 TC.
  - 「実績を修正」: chỉ sinh TC `[UNCONFIRMED]` cho lý do bắt buộc, lưu, 3 mã lỗi, ghi lịch sử, hoá đơn đã chốt.
- **UI chung:** header chung + thanh tab + 3 mục thu gọn được (hoặc 1 dòng thông báo rỗng).

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Thông báo データがありません | Text (Empty state) | High | State Transition | Chuyển sang 012 khi có báo cáo |
| Nút 実績を修正 | Button (Update) | Critical | Decision Table (trạng thái × lý do) | Tab 変更履歴, hoá đơn |
| 状態 | Text (Disable) | Critical | Decision Table (SL giao × thay thế) | Badge header, bảng 検品の差異 |
| 納品完了日時 / 完了の確定方法 / nhân viên giao / 受取者 | Text (Disable) | Medium | EP (reported / presumed) | — |
| 後続の配送 | Hyperlink | High | — | Màn chi tiết bản con (AW_DLVMNG_002) |
| ES配送便の手順 (6 dòng bước) | List | High | Boundary (集金 = 0) | Tab 添付資料 mục ② (số ảnh) |
| Bảng 検品の差異・代替品 | Table | High | Boundary (差 < 0, = 0) | Field 状態 |
| Bảng 在庫確認・陳列の結果 | Table | Medium | EP (giao / không giao lần này) | Bước 2. 在庫・廃棄確認 |
| Bảng 区間ごとの受取 | Table | High | Decision Table (loại chặng) | Tab 配送ルート |
| Lỗi hệ thống | — | High | — | — |

## AW_DLVMNG_013 + 008 — トラブル（代理登録／対応を決める） (prefix DMT)
- **Archetype:** Modal (013 = Form Create; 008 = wizard 2 bước, chỉ có bước 1)
- **Chiến lược Test Case:**
  - 013: mỗi field 1 nhóm TC riêng (連絡元, 連絡者, 種別, 連絡を受けた日時, 内容, ảnh, checkbox); XSS + SQLi cho 連絡者 và 内容.
  - 「種別（6区分）」 dựng Decision Table 6 loại × auto_child, cộng trường hợp báo cáo thứ 2.
  - 「登録する」: guard trạng thái (予定 ẩn nút; trạng thái đổi giữa chừng), giới hạn nhánh 9, đồng thời, 3 lỗi hệ thống.
  - 008: Decision Table 6 cách xử lý → trạng thái bản cha + xử lý bản con; giới hạn lựa chọn theo trạng thái (納品済 / presumed).
  - Bước 2 chưa có frame → TC đi qua bước 2 gắn `[UNCONFIRMED]`, chi tiết field bước 2 vào Not Covered.
- **UI chung:** modal trên nền mờ, footer có tóm tắt bản ghi + 2 nút.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Tiêu đề / × / キャンセル (013, 008) | Dialog | Medium | — | Tab trước khi mở |
| 連絡元 | Dropdown (required) | High | — | — |
| 連絡者 | Textbox | High | EP + Security | Hiển thị ở tab トラブル |
| 種別（6区分） | Dropdown (required) | Critical | Decision Table (6 loại × auto_child) | Bản con tự động, review trouble_auto_child_pending |
| 連絡を受けた日時 | Datepicker | Medium | — | — |
| 内容 | Textarea (required) | High | EP + Security | — |
| 写真・資料（写真を追加） | File Upload | High | — | Tab 添付資料 mục ② |
| Checkbox 調査を依頼した | Checkbox | Medium | — | Hãng vận chuyển + số vận đơn của bản ghi |
| 登録する | Button (Register) | Critical | State Transition (guard trạng thái) | Tab トラブル, trạng thái bản cha |
| ステップ表示 | Label | Low | — | — |
| 未解決報告の一覧 | Text | High | — | Tab トラブル |
| 理由 | Dropdown (required) | High | — | — |
| 対応を選ぶ (6 radio) | Radio | Critical | Decision Table (6 cách × trạng thái) + State Transition | Trạng thái bản cha, bản con tự động |
| 次へ / 解決する | Button | Critical | — | Bước 2 (chưa có frame) |

## AW_DLVMNG_005 + 014 — 添付資料 (prefix DMF)
- **Archetype:** Detail/View + File Upload (005 = mục ② có xoá; 014 = mục ② có tải xuống + chú thích)
- **Chiến lược Test Case:**
  - Mục 「① 地点の資料」: khẳng định chỉ đọc và phản ánh thay đổi ở master (không sao chép).
  - Mục 「② この配送の資料」: thêm (PDF, JPG, tên đặc biệt), xoá, tải xuống; không kế thừa sang bản con.
  - Upload lỗi: định dạng, dung lượng (`[UNCONFIRMED]` vì giới hạn UNKNOWN), lỗi mạng / server.
  - Mọi thao tác thêm / xoá đối chiếu sang tab 変更履歴.
- **UI chung:** header chung + thanh tab + 2 mục thu gọn được, mỗi mục 1 bảng 4 cột.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Mục ① 地点の資料 (bảng) | Table (read-only) | High | — | Master chi nhánh / điểm trung chuyển |
| ファイル名 (link) | Hyperlink | Medium | — | — |
| 操作（ダウンロード） | Icon Button (Download) | High | — | — |
| Link 拠点・契約情報を開く › | Hyperlink | Medium | — | Màn 拠点・契約情報詳細 (nhóm khác) |
| Mục ② この配送の資料 (bảng) | Table | High | — | Bản con không kế thừa |
| Ô upload 添付ファイル | File Upload | Critical | EP (loại file) | Tab 変更履歴 |
| 操作（削除） | Icon Button (Delete) | Critical | — | Tab 変更履歴; xác nhận xoá TBD |
| この配送の資料の注記 | Text | Low | — | — |
| Lỗi hệ thống | — | High | — | — |

## AW_DLVMNG_006 — 変更履歴 (prefix DMH)
- **Archetype:** List (chỉ đọc, không tìm kiếm / sắp xếp / phân trang)
- **Chiến lược Test Case:**
  - Bảng 「変更履歴」: thứ tự giảm dần theo 「変更日時」 và đủ chuỗi mốc hệ thống.
  - Cột 「変更内容」: mẫu câu trước → sau, mẫu câu đăng ký, hiển thị lý do, XSS khi hiển thị.
  - Cột 「変更者」: người vận hành / hệ thống / tài xế.
  - Tích hợp: thao tác ở các tab khác (thêm tài liệu, đăng ký sự cố, 申請・承認) sinh dòng lịch sử.
- **UI chung:** header chung + thanh tab + 1 bảng 3 cột.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Bảng 変更履歴 | Table (read-only) | High | — | Mọi thao tác ở tab / popup khác |
| 変更日時 | Text | Low | — | — |
| 変更内容 | Text | High | — | Lý do nhập ở các popup |
| 変更者 | Text | Medium | EP (ops / system / tài xế) | — |
| Lỗi hệ thống | — | High | — | — |

## Ghi chú tổng quát
- **Assumption môi trường test:** có app tài xế (hoặc công cụ tạo báo cáo giao) để sinh dữ liệu tab 実績; có quyền sửa master chi nhánh để kiểm mục ①; có 2 trình duyệt / 2 tài khoản cho TC đồng thời; có công cụ giả lập response (DevTools Local Overrides hoặc proxy) cho HTTP 500 / 404; dữ liệu DL-260928-0021 và DL-260929-0001 cần khôi phục giữa các TC resolve / đăng ký sự cố.
- **Navigation B (prefix DMNAVB):** chuyển tab, link giữa các tab, mở / đóng 2 popup, 2 luồng E2E.
