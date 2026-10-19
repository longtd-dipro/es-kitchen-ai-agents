# Requirements Analysis: Group 2 — 出荷・配送管理 / Quản lý xuất・giao hàng — PHẦN B

## Summary

- **Tính năng:** các tab con và popup của màn chi tiết dữ liệu xuất・giao hàng (Admin Web E03 — 運営Web): tab 配送ルート, tab 実績, popup トラブルの代理登録, popup トラブルの対応を決める (bước 1), tab 添付資料, tab 変更履歴.
- **Actor:** người dùng vận hành (運営) đã đăng nhập. Logistics / CS / sales đều xem được; thao tác cập nhật chỉ dành cho ops logistics (spec_02 §15.2).
- **Platform:** Web desktop 1440.
- **Luồng chính:** mở chi tiết 1 配送No từ danh sách → xem tuyến đa chặng và số vận đơn → xem kết quả giao, sửa kết quả kèm lý do → đăng ký hộ sự cố (6 loại) → quyết định xử lý (6 cách) → xem / thêm / xoá / tải tài liệu → đối chiếu lịch sử thay đổi.
- **Nguồn:** Basic Design v2 (`screens_num.json`, 9 screen, 151 item, 49 mã lỗi) + spec_02 (các § được BD dẫn chiếu).
- **Phụ thuộc:** header chung và thanh tab thuộc AW_DLVMNG_002 (Phần A); app tài xế (báo cáo giao hàng); master chi nhánh / điểm trung chuyển (tài liệu mục ①); hoá đơn (điều chỉnh tháng sau).
- **Quy ước gắn `[UNCONFIRMED]`:** TC có Expected phụ thuộc trực tiếp vào điểm BD ghi `⚠ Need Confirm` / `CONFLICT` / `UNKNOWN`, hoặc kiểm message có `remarks: INFERENCE` (toàn bộ 49 mã lỗi đều là INFERENCE). Item có Need Confirm nhưng phần được kiểm đã rõ trên Figma thì không gắn.
- **Giả định (không dừng hỏi user theo brief):**
  1. 011 và 012 là trạng thái XEM theo BD dù tên frame Figma là “Chỉnh sửa”; không sinh TC sửa tuyến, chỉ sinh TC `[UNCONFIRMED]` cho quy tắc sửa kết quả mà BD đã mô tả (lý do bắt buộc, 3 mã lỗi, ghi lịch sử).
  2. Bước 2 của popup 対応を決める chưa có frame: các TC kết quả resolve đi qua bước 2 bằng mô tả chung và đều gắn `[UNCONFIRMED]`.
  3. Tab トラブル chưa có Screen ID: chỉ dùng làm nơi đối chiếu kết quả, không có sheet TC riêng.
  4. Bộ dữ liệu test (bên dưới) lấy mẫu từ BD/Figma và bổ sung giá trị cụ thể còn thiếu; QC cần chuẩn bị trên môi trường test.

### Bộ dữ liệu test dùng trong Phần B (đề nghị người điều phối đưa vào `## Test Data Reference`)

| Loại | Giá trị |
|---|---|
| Tài khoản vận hành logistics | ops_qc@example.com / Qc@12345 (họ tên hiển thị 山田太郎) |
| Tài khoản System Admin (phiên thứ hai) | admin_qc@example.com / Qc@12345 |
| DL-260928-0003 | 納品済, đã qua オーダー締切 2026/09/25, 冷蔵, ES配送便, tuyến 関東倉庫 (WH00001) › 栄成ロジ 品川デポ › 青空フーズ 新宿本社, chặng 1 栄成ロジ（委託） đến kho lấy hàng, vận đơn ES採番 DL-260928-0003-01 |
| DL-260928-0014 | 一部納品済, tuyến 関東倉庫 › ヤマト 品川営業所 › 青空フーズ 新宿本社, 1次 ヤマト運輸, 2次 自社便 小林 翔, 送り状 3512-0928-0014 (1/2) và 3512-0928-0015 (2/2), bản con DL-260928-0014-1（出荷待・分納 2食） |
| Sản phẩm của DL-260928-0014 | チキン南蛮弁当 (確定 10, 実績 8), 鮭の塩焼き弁当 (5, 5), 豆腐ハンバーグ弁当 thay cho デミグラスハンバーグ弁当 (3, 3), 親子丼 (không giao lần này) |
| DL-260929-0001 | 出荷済, không trung chuyển 関東倉庫 › 青空フーズ 新宿本社, 自社便 chưa gán nhân viên, chưa có báo cáo |
| DL-260928-0021 | 受取済, みなと物流 品川倉庫・冷凍, 2 báo cáo sự cố chưa giải quyết (1 báo cáo 種別未定), bản con tự động DL-260928-0021-1 確認中 |
| DL-261020-0005 | 予定, chưa qua オーダー締切 |
| DL-260923-0031 | 納品済（みなし完了）, ひなたフード 本社・冷凍, COOL便, ヤマト運輸, 送り状 3512-0923-0031・0032 |
| DL-260920-0007 | 納品済, đã có 9 nhánh con (kiểm giới hạn số nhánh) |
| 申請番号 | CR0000005 |
| File | route_memo.pdf 1.20MB, photo_after.jpg 2.35MB, kenpin_report.pdf 0.90MB, trouble_01.jpg 1.2MB, setup.exe 2MB, big_video.mp4 500MB |
| XSS / SQLi | `<script>alert(1)</script>` / `' OR 1=1--` |

## Screen Inventory

| Screen ID | Tên JP | Loại | Sheet (heading) | Prefix | Item | Error | Ghi chú |
|---|---|---|---|---|---|---|---|
| AW_DLVMNG_003 | 出荷・配送データ詳細（配送ルート） | Tab | AW_DLVMNG_003 + 011 — 配送ルート | DMR | 21 | 3 | Bản ghi 納品済, có banner sau hạn chốt đơn, vận đơn ES cấp số |
| AW_DLVMNG_011 | 配送ルート（送り状番号あり） | Tab (trạng thái) | như trên | DMR | 26 | 3 | Trạng thái xem có bảng vận đơn 6 cột; tên frame “Chỉnh sửa” |
| AW_DLVMNG_004 | 実績 — データなし | Tab (trạng thái rỗng) | AW_DLVMNG_004 + 012 — 実績 | DMJ | 2 | 3 | |
| AW_DLVMNG_012 | 実績 — データあり | Tab | như trên | DMJ | 39 | 6 | Chỉ có nút 「実績を修正」, không có frame trạng thái đang sửa |
| AW_DLVMNG_013 | トラブルの代理登録 | Popup | AW_DLVMNG_013 + 008 — トラブル | DMT | 13 | 10 | |
| AW_DLVMNG_008 | トラブルの対応を決めるモーダル | Popup 2 bước (chỉ có bước 1) | như trên | DMT | 16 | 8 | Bước 2 chưa có frame |
| AW_DLVMNG_005 | 添付資料 | Tab | AW_DLVMNG_005 + 014 — 添付資料 | DMF | 14 | 7 | Mục ② có icon xoá |
| AW_DLVMNG_014 | 添付資料（ダウンロード表示） | Tab (trạng thái) | như trên | DMF | 15 | 6 | Mục ② có icon tải xuống + chú thích |
| AW_DLVMNG_006 | 変更履歴 | Tab | AW_DLVMNG_006 — 変更履歴 | DMH | 5 | 3 | Chỉ đọc, 1 bảng 3 cột |

## Acceptance Criteria

| AC | Nội dung | Nguồn | Status |
|---|---|---|---|
| AC-01 | Tab 配送ルート hiển thị 6 thuộc tính tuyến chỉ đọc; 中継 chỉ có 「中継あり」／「中継なし」, suy ra từ các chặng | BD 003/4–9, spec_02 §4.6 | Confirmed |
| AC-02 | Bảng điểm liệt kê theo thứ tự tuyến: kho picking → điểm trung chuyển (chỉ khi có) → điểm giao; không sort, không phân trang, cuộn ngang | BD 003/11, spec_02 §14.4 | Confirmed |
| AC-03 | Địa chỉ điểm giao là snapshot tại ngày giao (「納品日時点の住所」) | BD 003/14 | Confirmed |
| AC-04 | Chặng hãng vận chuyển không gán nhân viên; chặng tự giao / uỷ thác phải gán, chưa gán hiển thị 「割当待ち」 | BD 003/17, spec_02 §13.1 | Confirmed |
| AC-05 | Vận đơn 1:N theo thùng; chuyến uỷ thác đến kho lấy hàng thì ES cấp số (配送No + số thùng 2 chữ số) và không có link tra cứu; vận đơn vô hiệu giữ lại với 「無効」 | BD 003/21, 011/20–25, spec_02 §11 | Assumed (màu badge 無効, bảng kèm ghi chú ES chưa rõ) |
| AC-06 | Banner sau hạn chốt đơn chỉ hiện khi bản ghi đã qua ngày chốt | BD 003/2 | Assumed (phạm vi tab TBD — AMB-03) |
| AC-07 | Tab 実績 chưa có báo cáo hiển thị 「データがありません」, không có nút thao tác | BD 004/2 | Confirmed |
| AC-08 | Trạng thái giao quyết định theo số lượng giao được; hàng thay thế / huỷ là thông tin ghi kèm; hàng thay thế tính theo đơn giá sản phẩm gốc | BD 012 logic, spec_02 §13.3 §13.5 | Confirmed |
| AC-09 | Chênh lệch âm hiển thị đỏ; 集金 ẩn khi tiền dự kiến = 0; chặng hãng vận chuyển hiển thị 「（取得しない）」 | BD 012/16, 21, 38, spec_02 §13.6 | Confirmed |
| AC-10 | Sửa kết quả (完了日時・納品数・備考) chỉ khi đã giao, bắt buộc lý do, ghi lịch sử; hoá đơn đã chốt thì điều chỉnh tháng sau | BD 012/3, spec_tong_quan 8-4, 14-3 | TBD (UI sửa UNKNOWN — AMB-02) |
| AC-11 | Đăng ký hộ sự cố: bắt buộc 連絡元・種別・内容; chỉ khi bản ghi ở 出荷済／受取済／納品済; không đổi trạng thái bản cha | BD 013, spec_02 §15.12.1 | Confirmed (message INFERENCE) |
| AC-12 | Loại wrong_delivery / absent / damage tạo 1 bản con tự động 確認中; báo cáo thứ 2 không tạo bản con mới; số nhánh tối đa 9 | BD 013/6, 13, spec_02 §13.2.1 §9.4 | Confirmed |
| AC-13 | Quyết định xử lý theo đơn vị delivery: 1 lần resolve đóng mọi báo cáo chưa giải quyết; 6 cách xử lý cho trạng thái bản cha và xử lý bản con tương ứng | BD 008/7–13, spec_02 §13.2 §15.12 | TBD (bước 2 chưa có frame — AMB-01) |
| AC-14 | 納品済 chỉ chọn được 「全量を納品できた」; 納品済 presumed chọn thêm được 「納品ゼロで送り直す」「中止する」 | BD 008/7, spec_02 §15.12 | Assumed (cách thể hiện ẩn / Disable TBD) |
| AC-15 | Tài liệu ① tham chiếu master, chỉ đọc; tài liệu ② của riêng lần giao, thêm được cả khi 納品済, không kế thừa sang bản con, thêm / xoá ghi lịch sử | BD 005, 014, spec_tong_quan 15-7 | Assumed (xoá và điều kiện 005 ↔ 014 TBD — AMB-06) |
| AC-16 | Tab 変更履歴 chỉ đọc, 3 cột, thứ tự mới nhất trước, gộp mốc hệ thống + thao tác thủ công + 申請・承認, hiển thị trước → sau, người thao tác và lý do | BD 006, spec_02 §17.3 | Assumed (câu chữ sự kiện TBD — AMB-08) |
| AC-17 | Lỗi hệ thống chung mỗi tab / popup: hết phiên (Modal, về Đăng nhập), lỗi mạng (Toast), HTTP 500 (Toast) | BD errors `_S_001`–`_S_003` | Assumed (message INFERENCE) |

## Q&A — Ambiguities

| ID | Câu hỏi + giả định đang dùng | Severity | Status |
|---|---|---|---|
| AMB-01 | Popup 対応を決める bước 2 「数量・子・理由を入れる」 chưa có frame Figma: field, validation, nút 「戻る」/「解決する」? Giả định: theo mô tả spec_02 §15.12, TC kết quả gắn `[UNCONFIRMED]` | High | TBD |
| AMB-02 | UI sửa kết quả sau khi bấm 「実績を修正」 (form, popup lý do, nút lưu/huỷ, validation số lượng) và điều kiện hiển thị nút theo trạng thái? Giả định: sửa được 完了日時・納品数・備考, lý do bắt buộc | High | TBD |
| AMB-03 | Banner sau hạn chốt đơn thuộc header chung (mọi tab) hay chỉ tab 配送ルート? Giả định: chỉ kiểm ở tab 配送ルート | Low | TBD |
| AMB-04 | Frame 011 tên “Chỉnh sửa tab lộ trình” nhưng không có control sửa; có màn sửa tuyến riêng, nút 「契約の設定に戻す」, 「＋ 送り状を追加」, nút gán tài xế không? Giả định: trạng thái xem | High | TBD |
| AMB-05 | Đăng ký hộ sự cố có cho phép ở 一部納品済 không (Figma 011 có nút, guard spec_02 §15.12.1 không nêu)? Chưa giả định — đưa vào Not Covered | High | TBD |
| AMB-06 | Điều kiện hiển thị icon xoá (005) hay icon tải xuống (014) ở mục ②; có popup xác nhận xoá, ai được xoá, API xoá, thao tác 「差し替え」? Giả định: theo từng frame | Medium | TBD |
| AMB-07 | Giới hạn file upload (định dạng, dung lượng, số file) ở 005/014 và 013; maxlength 連絡者・内容? Giả định: .exe và 500MB bị từ chối | Medium | TBD |
| AMB-08 | Tab 変更履歴: câu chữ chuẩn từng loại sự kiện, nhãn actor system/carrier, trạng thái rỗng, phân trang, và có bộ lọc theo loại không (người điều phối nêu, BD không có)? Giả định: không có bộ lọc | Medium | TBD |
| AMB-09 | Danh sách lựa chọn 連絡元, 理由, nhãn JP của qty_diff trong 種別; đoạn mô tả popup 013 nghi copy nhầm từ popup 日付を個別に指定 | Medium | TBD |
| AMB-10 | Nhãn field #7 tab 実績 là 「配送回数（1サイクル）」 nhưng giá trị là tên tài xế; tab không có field 備考 dù spec cho sửa | Low | TBD |
| AMB-11 | Tab トラブル chưa có Screen ID / BD riêng; vị trí nút 「対応を決める」? | Medium | TBD |
| AMB-12 | Phân quyền CS / sales (chỉ xem): control cập nhật bị ẩn hay Disable? Chưa có tài khoản test CS / sales | High | TBD |
| AMB-13 | Mã lỗi E_DLVMNG008_004 và _005 cùng xảy ra khi người khác resolve trước: hệ thống trả mã nào? Giả định: không còn báo cáo chưa giải quyết → _004; bản ghi bị cập nhật khác → _005 | Low | TBD |

> Các AMB mức High (AMB-01, 02, 04, 05, 12) theo quy trình chuẩn phải dừng hỏi user; brief yêu cầu chạy một mạch nên đã xử lý theo phương án B (sinh TC gắn `[UNCONFIRMED]`) hoặc đưa vào Not Covered.

## History
- v1 (2026-10-12): khởi tạo Phần B từ Basic Design v2 + spec_02.
