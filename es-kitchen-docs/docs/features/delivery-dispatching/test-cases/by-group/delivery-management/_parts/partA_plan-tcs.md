# TC Implementation Plan: Group 2 — 出荷・配送管理 / Quản lý xuất・giao hàng (PHẦN A)

> Nguồn: `partA_analysis.md` + Basic Design v2 (`screens_num.json`) + spec_02. Số trong ngoặc `#n` là `no` của item trong BD. Thứ tự Screen khớp thứ tự heading `##` trong `partA_test-cases.md`.

## AW_DLVMNG_001 — 出荷・配送管理（一覧）
- **Archetype:** List / Search
- **Chiến lược Test Case:**
  - Mỗi điều kiện lọc (2 ô từ khoá #5 #6, 11 dropdown #7〜#17, 開始月 #18, 終了月 #19) có TC riêng; thêm 1 TC kết hợp AND qua 「検索」 #21.
  - 2 tab cơ sở ngày #3 #4 quyết định cột dùng để lọc kỳ và sắp xếp — kiểm bằng bản ghi có 出荷日 và 納品日 khác tháng.
  - Cột hiển thị #24〜#31 kiểm theo từng biến thể dữ liệu (bản con có nhánh, 確認中 có 「（仮）」, 5 kiểu hiển thị tài xế, 4 nhóm màu badge).
  - Icon sửa #31 kiểm theo trạng thái (出荷待 vào được; 納品済・中止・取消 bị chặn bằng E_DLVMNG001_004).
  - Lỗi hệ thống S_001〜S_003 kiểm trên cả 「検索」 và 「CSV出力」.
- **UI chung:** tiêu đề + 2 nút header, 2 tab, khối tìm kiếm thu gọn được, bảng 9 cột, phân trang.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| CSV出力 (#1) | Button (Export) | High | — | Xuất theo điều kiện tìm kiếm hiện tại (#5〜#19) |
| 出荷指示・取込 (#2) | Button (Navigation) | High | Decision Table (quyền) | Chỉ logistics; E_DLVMNG001_003 |
| Tab 出荷 / 納品・配送 (#3 #4) | Tab | High | — | Đổi cơ sở của #18 #19 và thứ tự sắp xếp |
| Ô từ khoá 1 (#5) | Textbox | High | EP | Kết hợp AND với các điều kiện khác qua #21 |
| Ô từ khoá 2 (#6) | Textbox | High | EP | Như trên |
| 11 dropdown lọc (#7〜#17) | Dropdown | Medium (High với #8 #14 #17) | EP | Mỗi dropdown 1 TC; #8 dùng 9 trạng thái §12.1 |
| 開始月 / 終了月 (#18 #19) | Datepicker (tháng) | High | BVA | Phụ thuộc tab #3 #4; E_DLVMNG001_002 |
| クリア (#20) | Button | Medium | — | Reset #5〜#19 |
| 検索 (#21) | Button | High | — | Về trang 1 (#33); E_DLVMNG001_001, S_001〜S_003 |
| Icon thu gọn (#22) | Icon | Low | — | Không làm mất điều kiện đã nhập |
| Bảng danh sách (#23〜#30) | Table | High | Decision Table (kiểu hiển thị theo dữ liệu) | #26 theo trạng thái; #28 #29 #30 theo 確認中 / 取消 |
| 配送No (#24) | Hyperlink | High | Decision Table | Rẽ nhánh 002 / 010 theo trạng thái |
| Icon chỉnh sửa (#31) | Icon | High | State Transition | Theo trạng thái bản ghi; E_DLVMNG001_004 |
| 件数表示 / ページネーション / 表示件数 (#32〜#34) | Pagination | Medium | BVA (trang đầu / trang cuối) | Đổi #34 thì về trang 1 |

## AW_DLVMNG_002 — 出荷・配送データ詳細（配送概要）
- **Archetype:** Detail / View
- **Chiến lược Test Case:**
  - Dựng Decision Table trạng thái × nút header (#4 取消, #5 複製, #6 編集) cho 8 trạng thái + 1 dòng theo quyền.
  - Banner #7 kiểm 2 phía của mốc オーダー締切 (đã qua / chưa qua).
  - 12 field chỉ đọc #14〜#25, mỗi field 1 TC hiển thị với giá trị mẫu; biến thể bản con (số nhánh, 「（仮）」, 子の種類).
  - 2 khối bảng #26〜#31 và #32〜#38 kiểm cấu trúc cột, dữ liệu, trạng thái rỗng / ẩn.
  - Lỗi tải E_DLVMNG002_001, S_001〜S_003.
- **UI chung:** header dùng chung (breadcrumb, tiêu đề + 配送No, badge, cụm nút, banner, thanh tab) + 3 khối thu gọn được.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Breadcrumb (#1) | Hyperlink | Medium | — | Về 001 |
| Tiêu đề + 配送No (#2) | Label | Medium | — | Khớp field #14 |
| Badge trạng thái (#3) | Badge | Medium | — | Quyết định #4 #5 #6 |
| 取消 / 複製 / 編集 (#4 #5 #6) | Button | Critical | Decision Table + State Transition | Theo trạng thái (§12.2) và quyền (§15.2); mở 002.2 / 002.1 / 002.3 |
| Banner オーダー締切 (#7) | Banner | High | BVA (mốc ngày chốt) | Dùng ngày chốt và 出荷日 của bản ghi |
| Thanh tab (#8〜#12) | Tab | Medium | — | Tab トラブル chỉ có ở bản ghi đã xuất (010) |
| Khối 配送概要 (#13〜#25) | Text (read-only) / Hyperlink | Medium | — | #17 #24 đổi theo 確認中; #22 đổi nhãn theo bản con |
| Khối 数量 (#26〜#31) | Table | High | — | Tiêu đề đổi theo giai đoạn; #30 「—」 khi chưa chốt |
| Khối 変更申請（処理済み） (#32〜#38) | Table | Medium | — | Ẩn cả khối khi không có dữ liệu |

## AW_DLVMNG_002.1 — 配送データの複製モーダル
- **Archetype:** Modal (Form Create)
- **Chiến lược Test Case:**
  - Decision Table theo 5 loại 対応 #3: câu mô tả #4, field hiển thị (#6 chỉ 返送, #7 khác 返送, #8 chỉ 代替便), mặc định 子の数量 #13.
  - Validation riêng từng field: 社内備考 #5 (bắt buộc, 100 ký tự, XSS, SQLi), 返送先 #6, 仮の納品日 #9 (4 loại ngày không giao được), 子の数量 #13 (âm, thập phân, chữ).
  - BVA số nhánh: 8 bản con → tạo được nhánh 9; 9 bản con → E_DLVMNG0021_007.
  - Kiểm hậu quả nghiệp vụ của 「複製する」 #16: bản con 確認中, không ghi đè bản gốc, copy / không copy, audit.
  - Mỗi mã lỗi server (006〜010, S_001〜S_003) 1 TC.
- **UI chung:** popup 3 phần — chọn cách xử lý, bảng số lượng theo sản phẩm, footer.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Tiêu đề / × (#1 #2) | Dialog | Medium | — | Đóng không tạo bản con |
| 対応を選ぶ (#3) | Radio | High | Decision Table | Điều khiển #4 #5 (placeholder) #6 #7 #8 #13 |
| 対応の説明文 (#4) | Text | Medium | Decision Table | Theo #3 |
| 社内備考 (#5) | Textarea | High | BVA (100 / 101) | Bắt buộc với mọi loại; ghi vào 変更履歴 |
| 返送先 (#6) | Dropdown | High | — | Chỉ khi #3 = 返送; đổi nơi giao của bản con |
| 納品先 (#7) | Text (read-only) | Medium | — | Khi #3 khác 返送 (prototype) |
| ピッキング倉庫 (#8) | Dropdown | High | — | Chỉ khi #3 = 代替便 (prototype); E_009 |
| 仮の納品日 (#9) | Datepicker | High | EP (ngày không giao được) | Ngày picking lùi theo lead time |
| Bảng 商品ごとの数量 (#10〜#12) | Table | Medium | — | Dữ liệu từ bản gốc |
| 子の数量 (#13) | Textbox (Number) | High | BVA + Decision Table | Mặc định theo #3 |
| Ghi chú footer (#14) | Text | High | BVA (nhánh 1〜9) | Số nhánh kế tiếp của bản cha |
| キャンセル (#15) | Button | Medium | — | — |
| 複製する (#16) | Button (Add) | Critical | State Transition | Kiểm #5 #6 #9 #13 rồi tạo bản con 確認中 |

## AW_DLVMNG_002.2 — 配送データの取消モーダル
- **Archetype:** Modal (xác nhận thao tác nguy hiểm)
- **Chiến lược Test Case:**
  - Bảng 4 dòng ảnh hưởng #3〜#6 kiểm theo dữ liệu bản ghi; #6 đổi theo checkbox #9.
  - 理由 #7 và 理由の詳細 #8 bắt buộc — mỗi field 1 TC lỗi riêng (E_001, E_002) + XSS / SQLi cho #8.
  - State Transition 出荷待 → 取消 qua 「取消する」 #13; transition không hợp lệ khi đã xuất (E_003).
  - 2 nhánh của checkbox #9: mở tiếp 002.1 hoặc chỉ hủy.
  - Kiểm tích hợp: revision số lượng 0 khi đã gửi chỉ thị; nhãn trên Web pháp nhân.
- **UI chung:** bảng ảnh hưởng → khối lý do → footer với nút đỏ.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Tiêu đề / × (#1 #2) | Dialog | Medium | — | — |
| Bảng ảnh hưởng (#3〜#6) | Text | Medium | — | #6 phụ thuộc #9 |
| 理由 (#7) | Dropdown | Critical | — | Bắt buộc; E_001 |
| 理由の詳細 (#8) | Textbox | Critical | — | Bắt buộc; E_002; ghi 変更履歴 |
| Checkbox 代替便 (#9) | Checkbox | High | Decision Table | Tick → mở 002.1 sau khi hủy |
| Câu chú thích / footer (#10 #11) | Text | Low | — | — |
| キャンセル (#12) | Button | Medium | — | — |
| 取消する (#13) | Button (Delete) | Critical | State Transition | Chỉ khi chưa xuất kho; E_003, E_004, S_001〜S_003 |

## AW_DLVMNG_002.3 + 010 — 配送概要（編集／出荷後表示）

### AW_DLVMNG_002.3 — 出荷・配送データ編集（配送概要）
- **Archetype:** Form Edit
- **Chiến lược Test Case:**
  - Kiểm khác biệt với chế độ xem: tiêu đề / breadcrumb 「編集」, header chỉ キャンセル / 保存, có khối 「この配送だけ変更する」 #8.
  - Mỗi ô nhập #9〜#12 có TC giá trị ban đầu, validation riêng và TC lưu thành công.
  - 「保存」 #4: kiểm phạm vi chỉ 1 bản ghi, audit before / after, hậu quả với chỉ thị xuất kho đã gửi.
  - Decision Table đổi 納品日 sau オーダー締切: hợp lệ / quá hạn (E_007) / khác nửa chu kỳ (E_008).
  - Guard trạng thái 納品済・中止・取消 (E_003) và quyền.
- **UI chung:** như 002 nhưng thêm khối nhập giữa khối 配送概要 và khối 数量.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Breadcrumb / tiêu đề (#1 #2) | Hyperlink / Label | Medium | — | — |
| キャンセル (#3) | Button | High | — | Bỏ thay đổi #9〜#12 |
| 保存 (#4) | Button (Update) | Critical | State Transition + Decision Table | Kiểm #11 #12; guard trạng thái; E_001〜E_008 |
| Banner (#5) | Banner | Medium | — | Cùng nội dung với 002 #7 |
| Thanh tab (#6) | Tab | Low | — | — |
| Khối 配送概要 chỉ đọc (#7) | Text (read-only) | High | Decision Table (đổi ngày) | Đổi 納品日 chỉ có ở prototype |
| Khối この配送だけ変更する (#8) | Section | Medium | — | Chỉ ở chế độ sửa |
| 配送会社（2次） (#9) | Dropdown | High | — | Đổi → gửi lại chỉ thị; E_004 |
| 配送スタッフ（1次） (#10) | Dropdown | High | — | Lọc theo công ty của chặng; E_005 |
| 納品先の住所 (#11) | Textbox | Critical | — | Đổi → void vận đơn + revision mới; E_002 |
| 変更理由 (#12) | Textbox | Critical | — | Bắt buộc; E_001 |
| Câu chú thích (#13) | Text | Low | — | — |
| Khối 数量 / 変更申請 (#14) | Table (read-only) | Medium | — | — |

### AW_DLVMNG_010 — 配送概要（出荷後レコードの詳細表示）
- **Archetype:** Detail / View
- **Chiến lược Test Case:**
  - Kiểm khác biệt với 002: không banner, không 取消 / 編集, có 「トラブルを代理登録」 #5, 6 tab có トラブル #9.
  - Kiểm biến thể theo 4 trạng thái đã xuất khác (出荷済, 受取済, 納品済, 再配達待).
  - 3 khối #12〜#14 chỉ đọc; lỗi tải E_DLVMNG010_001, S_001〜S_003.
- **UI chung:** header xem + 6 tab + 3 khối chỉ đọc.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Breadcrumb / tiêu đề / badge (#1〜#3) | Hyperlink / Label / Badge | Medium | — | — |
| 複製 (#4) | Button | High | — | Vẫn dùng được khi locked; mở 002.1 |
| トラブルを代理登録 (#5) | Button | High | State Transition | Chỉ bản ghi đã xuất; mở 013 |
| Thanh 6 tab (#6〜#11) | Tab | Medium | — | #9 kèm số sự cố chưa giải quyết |
| Khối 配送概要 (#12) | Text (read-only) | High | — | Không có banner |
| Khối 数量 / 変更申請 (#13 #14) | Table (read-only) | Medium | — | — |

## AW_DLVMNG_007 — 日付を個別に指定モーダル
- **Archetype:** Modal (Form Edit)
- **Chiến lược Test Case:**
  - EP cho 4 loại 出荷日 không hợp lệ #5 và 5 loại 納品日 không hợp lệ #6.
  - BVA lead time: 7 ngày (hợp lệ) / 8 ngày (E_003).
  - State: khoá sau オーダー締切 / locked / 納品済 (E_006), kể cả khi bị khoá trong lúc popup đang mở.
  - Kiểm tích hợp: ngày đã cố định không bị tính lại; giữ lead time riêng khi dời ở Lịch trình; không đổi lead time hợp đồng.
- **UI chung:** popup nhỏ — hướng dẫn, 2 datepicker có dòng 「現在：…」, lý do, ghi chú, footer.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Tiêu đề / badge / × (#1 #2 #3) | Dialog | Medium | State Transition (khoá) | GET individual-dates trả blocked |
| Câu hướng dẫn (#4) | Text | Low | — | Nêu giới hạn 7 ngày |
| 出荷日 (#5) | Datepicker | High | EP + BVA | Phụ thuộc #6 (không sau ngày giao, cách tối đa 7 ngày) |
| 納品日 (#6) | Datepicker | High | EP + BVA | Phụ thuộc #5 |
| 理由 (#7) | Dropdown | High | — | Bắt buộc theo Figma; E_004 |
| 補足 (#8) | Textarea | Medium | BVA (500 / 501) | Tùy chọn |
| Ghi chú footer / キャンセル (#9 #10) | Text / Button | Low | — | — |
| 変更を確定 (#11) | Button (Update) | Critical | State Transition | Kiểm #5〜#7; E_005, E_006, S_001〜S_003 |

## AW_DLVMNG_009 — 拠点の住所変更を配送データに反映モーダル
- **Archetype:** Modal (thao tác hàng loạt)
- **Chiến lược Test Case:**
  - Decision Table phạm vi #6 × trạng thái bản ghi: `future_only` / `from_date` × (chưa gửi chỉ thị / đã gửi chỉ thị).
  - BVA ngày mốc #7: 納品日 = ngày mốc (cập nhật) / ngày mốc − 1 (giữ nguyên).
  - Dòng xem trước #8 đối chiếu với số bản ghi seed (12 cập nhật, 3 loại trừ).
  - Kiểm hậu quả: ghi 変更履歴, không thông báo pháp nhân, rollback khi xung đột (E_003).
- **UI chung:** bảng 3 dòng thông tin → radio phạm vi → ngày mốc + dòng xem trước → footer.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Tiêu đề / × (#1 #2) | Dialog | Medium | — | — |
| 3 dòng thông tin (#3 #4 #5) | Text | Low | — | Nhãn Figma nghi sai |
| Phạm vi áp dụng (#6) | Radio | Critical | Decision Table | Quyết định #7 có bắt buộc không; E_001 |
| 納品日 ngày mốc (#7) | Datepicker | Critical | BVA | Bắt buộc khi #6 = from_date; E_002 |
| Dòng xem trước (#8) | Text | High | — | Phụ thuộc #7 |
| キャンセル (#9) | Button | Medium | — | — |
| Nút thực hiện (#10) | Button (Update) | Critical | Decision Table | Bỏ qua bản ghi locked; E_003, S_001〜S_003 |

## Ghi chú tổng quát
- **Assumption môi trường test:**
  - Có dữ liệu seed theo bộ bản ghi ở `partA_analysis.md` G-02 (đủ 9 trạng thái, bản cha có 8 và 9 bản con, bản ghi đã gửi chỉ thị xuất kho).
  - Ngày hệ thống của môi trường test đặt được ở 2026/10/12 (và 2026/10/13 cho TC E_DLVMNG0023_007).
  - Thiết lập chu kỳ có sẵn: ngày lễ nghỉ giao 2026/11/03, サイクル休止 2026/11/16〜11/22, 出荷不可 của 関東倉庫 ngày 2026/11/07, điểm giao không nhận hàng Chủ nhật.
  - Có thể giả lập lỗi mạng / HTTP 500 / mất phiên bằng DevTools hoặc proxy; có 2 phiên trình duyệt để tạo xung đột cập nhật đồng thời.
  - Kênh gửi chỉ thị xuất kho (THOMAS) và batch chốt sinh chạy được trên môi trường test để kiểm các TC Integration; có tài khoản Web pháp nhân để kiểm nhãn hiển thị cho khách.
  - Tài khoản vận hành CS (không có quyền logistics) được tạo trước cho các TC phân quyền.
