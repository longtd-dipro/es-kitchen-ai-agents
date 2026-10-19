# Requirements Analysis: Group 2 — 出荷・配送管理 / Quản lý xuất・giao hàng

> File ghép từ 2 phần. Phần A: Danh sách, tab 配送概要, popup 複製 / 取消 / 日付個別指定 / 住所変更. Phần B: tab ルート / 実績 / 添付資料 / 変更履歴, popup トラブル. Mã AC / AMB giữ nguyên trong phạm vi từng phần.

---

## Requirements Analysis: Group 2 — 出荷・配送管理 / Quản lý xuất・giao hàng (PHẦN A)

> Phần A gồm 8 screen: danh sách, chi tiết tab 配送概要 (xem / sửa / biến thể đã xuất) và 4 popup (複製, 取消, 日付を個別に指定, 住所変更の反映). Phần B (tab ルート / 実績 / 添付資料 / 変更履歴 và popup トラブル) do agent khác phụ trách.

### Summary

- **Tính năng:** tìm kiếm dữ liệu giao hàng đã chốt sinh (配送データ), xem tổng quan 1 chuyến, và các thao tác chỉ dành cho vận hành logistics: hủy trước khi xuất kho, nhân bản thành bản con có số nhánh, sửa riêng 1 chuyến (công ty giao, nhân viên giao, địa chỉ, ngày), chỉ định ngày riêng khác lead time hợp đồng, phản ánh đổi địa chỉ điểm giao vào dữ liệu đã tạo.
- **Platform / actor:** Admin Web (E03) desktop 1440. Xem: mọi vai trò vận hành (logistics, CS, sales). Cập nhật: chỉ vận hành logistics (spec_02 §15.2).
- **Luồng chính:** 001 → (配送No) → 002 hoặc 010 → 取消 (002.2) / 複製 (002.1) / 編集 (002.3). 002.2 có thể nối tiếp sang 002.1 (代替便). 007 và 009 chưa có lối vào trên Figma.
- **Rule lõi:** 9 trạng thái (spec_02 §12.1) quyết định nút hiển thị; 取消 chỉ khi chưa xuất kho; nhân bản chỉ từ bản cha published/locked, 1 tầng, nhánh 1–9, bản con sinh ở 確認中; lý do bắt buộc cho hủy / nhân bản / sửa; đổi ngày sau オーダー締切 chỉ đến hết ngày trước ngày xuất, cùng chu kỳ và cùng nửa; lead time riêng tối đa 7 ngày; địa chỉ là snapshot, bản ghi đã gửi chỉ thị xuất kho (locked) bị bỏ qua khi phản ánh hàng loạt.
- **Nguồn:** Basic Design v2 (`screens_num.json`), spec_02 (§6, §9, §12, §15, §17, §18, §19.6). Figma và prototype có nhiều CONFLICT; BD chọn theo Figma.
- **Giới hạn nguồn:** toàn bộ câu thông báo lỗi trong BD đều là INFERENCE; API hủy / nhân bản / lưu tab 配送概要 chưa có trong sheet API. Vì vậy 202 / 405 TC mang tag `[UNCONFIRMED]`.

### Giả định (đã tự quyết vì được yêu cầu chạy một mạch, không dừng checkpoint)

| # | Giả định | Ảnh hưởng |
|---|---|---|
| G-01 | `ops_qc@example.com` là vận hành logistics. Tài khoản `cs_qc@example.com / Qc@12345` (vận hành CS, không có quyền logistics) **không có trong brief** — tự đặt theo cùng quy ước để viết TC phân quyền; cần tạo trước khi chạy | 5 TC Security dùng tài khoản này (DML-008, DMS-015, DME-042, DMI-039, DMA-024) |
| G-02 | Bộ bản ghi mẫu (DL-261020-0021 出荷待 đã qua 締切 2026/10/10; DL-261110-0005 出荷待 trước 締切 2026/10/31; DL-261020-0022 出荷待 đã gửi chỉ thị; DL-260928-0014 一部納品済 có bản con -1; DL-260929-0001 出荷済 có 2 sự cố; DL-260930-0002 受取済; DL-260928-0003 納品済; DL-260927-0011 再配達待; DL-260926-0004 中止; DL-260928-0008 取消; DL-260925-0006 có 8 bản con; DL-260925-0007 có 9 bản con…) là dữ liệu cần seed; chỉ một phần lấy từ ví dụ BD/Figma | Người điều phối đưa vào `## Test Data Reference` |
| G-03 | Ngày kiểm thử cố định 2026/10/12 (thứ Hai). Mọi ngày trong tuần ghi trong Expected được tính theo lịch 2026 | TC ngày quá khứ, hạn chốt đơn |
| G-04 | Khi BD ghi "ẩn hay disable — Need Confirm", Expected viết theo prototype là **không hiển thị** | TC trạng thái nút, gắn `[UNCONFIRMED]` |
| G-05 | Popup 007 và 009 chưa có lối vào: TC lấy "mở được popup từ màn chi tiết" / "popup đang mở" làm bước hoặc precondition | DMI, DMA |
| G-06 | Trên 002.3, ô thứ 4 được kiểm theo nhãn prototype 「変更理由」 (Figma ghi nhầm 「納品先の住所」); việc đổi 納品日 kiểm theo control 「変更する」 của prototype | DME, gắn `[UNCONFIRMED]` |
| G-07 | AMB mức High (AMB-01〜06) không dừng hỏi user theo yêu cầu chạy một mạch; xử lý theo phương án B: vẫn sinh TC và gắn `[UNCONFIRMED]` | Cần BA/PM chốt trước khi chạy test chính thức |

### Screen Inventory

| Screen ID | Tên JP | Loại | Items | Errors | Prefix | Số TC | Ghi chú |
|---|---|---|---|---|---|---|---|
| AW_DLVMNG_001 | 出荷・配送管理（一覧） | List | 34 | 7 | DML | 85 | Lọc theo THÁNG theo Figma |
| AW_DLVMNG_002 | 出荷・配送データ詳細（配送概要） | Detail | 38 | 4 | DMS | 64 | Bản ghi trước khi xuất; 5 tab |
| AW_DLVMNG_002.1 | 配送データの複製モーダル | Modal | 16 | 13 | DMD | 60 | 5 loại duplicate_type |
| AW_DLVMNG_002.2 | 配送データの取消モーダル | Modal | 13 | 7 | DMC | 32 | Chỉ trước khi xuất kho |
| AW_DLVMNG_002.3 | 出荷・配送データ編集（配送概要） | Form | 14 | 11 | DME (001〜045) | 45 | Màn sửa thật |
| AW_DLVMNG_010 | 配送概要（出荷後レコードの詳細表示） | Detail | 14 | 4 | DME (046〜071) | 26 | Màn xem của bản ghi đã xuất; gộp sheet với 002.3 |
| AW_DLVMNG_007 | 日付を個別に指定モーダル | Modal | 11 | 9 | DMI | 43 | Lối vào UNKNOWN |
| AW_DLVMNG_009 | 拠点の住所変更を配送データに反映モーダル | Modal | 10 | 6 | DMA | 27 | Lối vào UNKNOWN; nhiều nhãn nghi sai |
| — | Navigation (phần A + từ nhóm Lịch trình) | — | — | — | DMNAVA | 23 | Gồm 3 luồng E2E |

Tổng: **405 TC** (382 TC theo screen + 23 TC navigation).

### Acceptance Criteria

| AC ID | Nội dung | Nguồn | Status |
|---|---|---|---|
| AC-01 | Danh sách chỉ hiển thị 配送データ đã chốt sinh, không hiển thị 予定; mặc định sắp xếp tăng dần theo ngày của tab đang chọn (出荷日 hoặc 納品日) | BD 001 logic, #3 #4 #21 | Confirmed |
| AC-02 | Tìm kiếm áp dụng AND giữa các điều kiện, khớp một phần cho 2 ô từ khoá, kết quả hiển thị từ trang 1 | BD 001 #5 #6 #21 | Confirmed |
| AC-03 | Khoảng lọc 開始月〜終了月 tính theo ngày cơ sở của tab; 開始月 sau 終了月 thì báo lỗi và không gọi API | BD 001 #18 #19, E_DLVMNG001_002 | TBD (AMB-07) |
| AC-04 | 配送No dạng DL-YYMMDD-NNNN; bản con có số nhánh -1 đến -9; bấm vào mở 002 (trước khi xuất) hoặc 010 (đã xuất) | BD 001 #24, spec_02 §9.4 | Assumed |
| AC-05 | Badge trạng thái dùng 9 giá trị 出荷待／出荷済／受取済／納品済／一部納品済／再配達待／確認中／中止／取消 | spec_02 §12.1, BD 001 #26 | Confirmed |
| AC-06 | Nút 「取消」 chỉ hiện với bản ghi chưa rời kho và người dùng logistics | BD 002 #4, spec_02 §12.2 | Assumed (AMB-02) |
| AC-07 | Nút 「複製」 chỉ hiện với bản cha published/locked và người dùng logistics; không nhân bản từ bản con | BD 002 #5, spec_02 §9.4 §15.11 | Assumed |
| AC-08 | Nút 「編集」 chỉ hiện khi trạng thái khác 納品済・中止・取消 và người dùng logistics | BD 002 #6, spec_02 §15.13 §15.14 | TBD (AMB-02) |
| AC-09 | Banner オーダー締切 hiện khi đã qua ngày chốt đơn, kèm ngày chốt và ngày trước ngày xuất | BD 002 #7, spec_02 §9.2 | Confirmed |
| AC-10 | Bản ghi trước khi xuất có 5 tab; bản ghi đã xuất có 6 tab (thêm トラブル) và nút 「トラブルを代理登録」 | BD 002 #12, BD 010 #5 #9 | Assumed |
| AC-11 | Nhân bản tạo bản con ở 確認中, số nhánh kế tiếp (tối đa 9), không ghi đè bản gốc; copy nơi giao / điều kiện / tuyến, không copy vận đơn / phân công / tệp đính kèm | BD 002.1 #16, spec_02 §9.4 | Confirmed |
| AC-12 | 5 loại 分納／再配達／代替便／返送／その他 đổi câu mô tả, field hiển thị (返送先 chỉ khi 返送; ピッキング倉庫 chỉ khi 代替便) và mặc định 子の数量 | BD 002.1 #3 #4 #6 #8 #13 | TBD (AMB-03) |
| AC-13 | 社内備考 bắt buộc (tối đa 100 ký tự) và được ghi vào 変更履歴 | BD 002.1 #5, spec_02 §18 | Assumed |
| AC-14 | Vượt nhánh 9 → DOMAIN_BRANCH_LIMIT; nguồn không hợp lệ → DOMAIN_DUPLICATE_NOT_ALLOWED; còn bản con tự động do sự cố → DOMAIN_TROUBLE_CHILD_EXISTS | spec_02 §15.11 §18 | Confirmed (message INFERENCE) |
| AC-15 | Hủy bắt buộc 理由 và 理由の詳細; chỉ hợp lệ khi chưa xuất kho; bản ghi chuyển 取消, không bị xoá, ghi lý do và người thao tác | BD 002.2 #7 #8 #13, spec_02 §12.2 §15.10 | Confirmed |
| AC-16 | Hủy bản ghi đã gửi chỉ thị xuất kho thì gửi lại revision số lượng 0, không đổi locked_at | spec_02 §10.3, BD 002.2 #3 | Confirmed |
| AC-17 | Checkbox 代替便 được tick thì sau khi hủy mở tiếp popup nhân bản | BD 002.2 #9 | TBD (AMB-04) |
| AC-18 | Sửa 1 chuyến: đổi công ty giao / nhân viên giao / địa chỉ kèm lý do bắt buộc; chỉ áp dụng cho bản ghi đó; ghi before/after | BD 002.3 #4 #9〜#12, spec_02 §15.13 §15.14 | Assumed (AMB-05) |
| AC-19 | Sau khi chỉ thị đã gửi: đổi carrier/driver → gửi lại, giữ vận đơn; đổi địa chỉ → void vận đơn + revision mới; không đổi locked_at | spec_02 §15.13 §15.14 | Confirmed |
| AC-20 | Đổi ngày sau オーダー締切: đến hết ngày trước ngày xuất, cùng chu kỳ và cùng nửa, từng bản ghi, có lý do | spec_02 §9.2 §15.4 | TBD (AMB-05) |
| AC-21 | Chỉ định ngày riêng: lead time tối đa 7 ngày; ngày được cố định (override fix) không bị batch tính lại; khoá sau オーダー締切 / locked / 納品済 | BD 007, spec_02 §6.0 | Assumed (AMB-06) |
| AC-22 | Ngày xuất / ngày giao không hợp lệ (quá khứ, ngày không xuất kho, thứ không nhận, ngày lễ, tạm ngưng chu kỳ, chu kỳ khác) hiển thị lý do dưới ô | BD 007 #5 #6, spec_02 §6.1 §6.2 | Confirmed (message INFERENCE) |
| AC-23 | Phản ánh đổi địa chỉ: `future_only` giữ nguyên bản ghi đã tạo; `from_date` cập nhật bản ghi có 納品日 từ ngày mốc; bỏ qua bản ghi locked; ghi log; không thông báo pháp nhân | BD 009 #6 #7 #10 | Assumed (AMB-08) |
| AC-24 | Lỗi hệ thống dùng chung: phiên hết hạn → modal + về đăng nhập; lỗi mạng / HTTP 500 → toast, giữ nguyên màn và dữ liệu đang nhập | BD errors `_S_001〜003` | Assumed (INFERENCE) |

### Q&A — Ambiguities

| ID | Screen | Câu hỏi + Đề xuất | Severity | Status |
|---|---|---|---|---|
| AMB-01 | 002 / 010 | AW_DLVMNG_010 là "màn sửa tab Tổng quan" (thiếu form) hay "màn xem của bản ghi đã xuất" (tên frame sai)? Đề xuất: coi là màn xem (theo nội dung Figma) | High | TBD |
| AMB-02 | 001 / 002 / 010 | Ma trận hiển thị 取消・複製・編集 theo từng trạng thái (đặc biệt 出荷済・受取済・一部納品済・再配達待・確認中) và theo quyền; ẩn hay disable? Icon sửa ở danh sách hiện với mọi dòng (Figma) hay ẩn ở 確認中・取消 (prototype)? | High | TBD |
| AMB-03 | 002.1 | Giá trị mặc định của 「対応を選ぶ」 (Figma 分納, prototype 返送); field 納品先 và ピッキング倉庫 chỉ có ở prototype; giới hạn trên của 子の数量; trạng thái bản GỐC có đổi ngay khi nhân bản không; endpoint API nhân bản | High | TBD |
| AMB-04 | 002.2 | Luồng chuyển tiếp sang 002.1 khi tick 代替便 (tự chọn sẵn 代替便, điền sẵn lý do?); endpoint API hủy; câu thông báo thành công | High | TBD |
| AMB-05 | 002.3 | Nhãn ô thứ 4 (納品先の住所 hay 変更理由); cách đổi 納品日 trên màn sửa (control 「変更する」 của prototype hay popup 007); endpoint API lưu | High | TBD |
| AMB-06 | 007 | Lối vào popup; 理由 có bắt buộc trước オーダー締切 không (Figma bắt buộc, spec tùy chọn); danh sách lý do; sau オーダー締切 khoá hoàn toàn hay vẫn cho đổi trong phạm vi | High | TBD |
| AMB-07 | 001 | Khoảng lọc theo THÁNG (Figma) hay theo NGÀY mặc định 2 tuần (prototype / spec); giá trị mặc định; banner 予定; filter 割当状況 | Medium | TBD |
| AMB-08 | 009 | Popup có trong phạm vi phát triển không (sheet API đề xuất chỉ là API nội bộ); nhãn đúng của 3 dòng thông tin, nhóm radio và nút chính; giá trị mặc định của radio; có cần lý do không | Medium | TBD |
| AMB-09 | Tất cả | Toàn bộ câu thông báo lỗi trong BD là INFERENCE — cần bảng message chính thức | Medium | TBD |
| AMB-10 | 001 | Định dạng CSV xuất (cột, encoding, giới hạn dòng); Screen ID màn 「出荷指示・取込」 | Medium | TBD |
| AMB-11 | 001 / 002 / 002.2 / 002.3 | maxlength của các ô text (từ khoá 1, từ khoá 2, 理由の詳細, 納品先の住所, 変更理由) | Low | TBD |
| AMB-12 | 002 | Màn đích của link 契約ID, 子契約ID, オーダーID, 申請番号 | Low | TBD |
| AMB-13 | 001 | Quy tắc câu phụ dòng 2 cột 拠点名 và màu nền dòng; màu badge 再配達待・中止; tập giá trị cột 変更申請 | Low | TBD |

### History
- v1 (2026-10-12): khởi tạo cho PHẦN A — chạy một mạch analyze-req → plan-tcs → gen-tcs, không dừng checkpoint theo yêu cầu.


---

## Requirements Analysis: Group 2 — 出荷・配送管理 / Quản lý xuất・giao hàng — PHẦN B

### Summary

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

#### Bộ dữ liệu test dùng trong Phần B (đề nghị người điều phối đưa vào `## Test Data Reference`)

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

### Screen Inventory

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

### Acceptance Criteria

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

### Q&A — Ambiguities

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

### History
- v1 (2026-10-12): khởi tạo Phần B từ Basic Design v2 + spec_02.

