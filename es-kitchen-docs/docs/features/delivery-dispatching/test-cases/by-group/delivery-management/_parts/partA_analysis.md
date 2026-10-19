# Requirements Analysis: Group 2 — 出荷・配送管理 / Quản lý xuất・giao hàng (PHẦN A)

> Phần A gồm 8 screen: danh sách, chi tiết tab 配送概要 (xem / sửa / biến thể đã xuất) và 4 popup (複製, 取消, 日付を個別に指定, 住所変更の反映). Phần B (tab ルート / 実績 / 添付資料 / 変更履歴 và popup トラブル) do agent khác phụ trách.

## Summary

- **Tính năng:** tìm kiếm dữ liệu giao hàng đã chốt sinh (配送データ), xem tổng quan 1 chuyến, và các thao tác chỉ dành cho vận hành logistics: hủy trước khi xuất kho, nhân bản thành bản con có số nhánh, sửa riêng 1 chuyến (công ty giao, nhân viên giao, địa chỉ, ngày), chỉ định ngày riêng khác lead time hợp đồng, phản ánh đổi địa chỉ điểm giao vào dữ liệu đã tạo.
- **Platform / actor:** Admin Web (E03) desktop 1440. Xem: mọi vai trò vận hành (logistics, CS, sales). Cập nhật: chỉ vận hành logistics (spec_02 §15.2).
- **Luồng chính:** 001 → (配送No) → 002 hoặc 010 → 取消 (002.2) / 複製 (002.1) / 編集 (002.3). 002.2 có thể nối tiếp sang 002.1 (代替便). 007 và 009 chưa có lối vào trên Figma.
- **Rule lõi:** 9 trạng thái (spec_02 §12.1) quyết định nút hiển thị; 取消 chỉ khi chưa xuất kho; nhân bản chỉ từ bản cha published/locked, 1 tầng, nhánh 1–9, bản con sinh ở 確認中; lý do bắt buộc cho hủy / nhân bản / sửa; đổi ngày sau オーダー締切 chỉ đến hết ngày trước ngày xuất, cùng chu kỳ và cùng nửa; lead time riêng tối đa 7 ngày; địa chỉ là snapshot, bản ghi đã gửi chỉ thị xuất kho (locked) bị bỏ qua khi phản ánh hàng loạt.
- **Nguồn:** Basic Design v2 (`screens_num.json`), spec_02 (§6, §9, §12, §15, §17, §18, §19.6). Figma và prototype có nhiều CONFLICT; BD chọn theo Figma.
- **Giới hạn nguồn:** toàn bộ câu thông báo lỗi trong BD đều là INFERENCE; API hủy / nhân bản / lưu tab 配送概要 chưa có trong sheet API. Vì vậy 202 / 405 TC mang tag `[UNCONFIRMED]`.

## Giả định (đã tự quyết vì được yêu cầu chạy một mạch, không dừng checkpoint)

| # | Giả định | Ảnh hưởng |
|---|---|---|
| G-01 | `ops_qc@example.com` là vận hành logistics. Tài khoản `cs_qc@example.com / Qc@12345` (vận hành CS, không có quyền logistics) **không có trong brief** — tự đặt theo cùng quy ước để viết TC phân quyền; cần tạo trước khi chạy | 5 TC Security dùng tài khoản này (DML-008, DMS-015, DME-042, DMI-039, DMA-024) |
| G-02 | Bộ bản ghi mẫu (DL-261020-0021 出荷待 đã qua 締切 2026/10/10; DL-261110-0005 出荷待 trước 締切 2026/10/31; DL-261020-0022 出荷待 đã gửi chỉ thị; DL-260928-0014 一部納品済 có bản con -1; DL-260929-0001 出荷済 có 2 sự cố; DL-260930-0002 受取済; DL-260928-0003 納品済; DL-260927-0011 再配達待; DL-260926-0004 中止; DL-260928-0008 取消; DL-260925-0006 có 8 bản con; DL-260925-0007 có 9 bản con…) là dữ liệu cần seed; chỉ một phần lấy từ ví dụ BD/Figma | Người điều phối đưa vào `## Test Data Reference` |
| G-03 | Ngày kiểm thử cố định 2026/10/12 (thứ Hai). Mọi ngày trong tuần ghi trong Expected được tính theo lịch 2026 | TC ngày quá khứ, hạn chốt đơn |
| G-04 | Khi BD ghi "ẩn hay disable — Need Confirm", Expected viết theo prototype là **không hiển thị** | TC trạng thái nút, gắn `[UNCONFIRMED]` |
| G-05 | Popup 007 và 009 chưa có lối vào: TC lấy "mở được popup từ màn chi tiết" / "popup đang mở" làm bước hoặc precondition | DMI, DMA |
| G-06 | Trên 002.3, ô thứ 4 được kiểm theo nhãn prototype 「変更理由」 (Figma ghi nhầm 「納品先の住所」); việc đổi 納品日 kiểm theo control 「変更する」 của prototype | DME, gắn `[UNCONFIRMED]` |
| G-07 | AMB mức High (AMB-01〜06) không dừng hỏi user theo yêu cầu chạy một mạch; xử lý theo phương án B: vẫn sinh TC và gắn `[UNCONFIRMED]` | Cần BA/PM chốt trước khi chạy test chính thức |

## Screen Inventory

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

## Acceptance Criteria

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

## Q&A — Ambiguities

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

## History
- v1 (2026-10-12): khởi tạo cho PHẦN A — chạy một mạch analyze-req → plan-tcs → gen-tcs, không dừng checkpoint theo yêu cầu.
