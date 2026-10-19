# Requirements Analysis: Group 1 — スケジュール / Lịch trình

## Summary

- **Tính năng:** Lịch trình giao hàng (スケジュール) của Admin Web 運営Web (E03) — xem chu kỳ giao hàng theo Tháng / Tuần / Ngày, xử lý yêu cầu đổi ngày giao của pháp nhân (duyệt hàng loạt) và dời đồng loạt kế hoạch xuất kho.
- **Actors:** System Admin / vận hành (運営): Ops logistics, Ops CS, Sales đều xem được; duyệt yêu cầu = Ops logistics + Ops CS; đổi ngày trước chốt đơn = chỉ Ops logistics (spec_02 §15.2).
- **Platform:** Web desktop 1440. Ngôn ngữ UI: tiếng Nhật.
- **Luồng chính:** Sidebar 「配送管理」＞「スケジュール」 → 月表示 → 週表示 / 日表示 → 「変更申請（N件）」 → popup chưa xử lý → 一括承認 (xác nhận → hoàn tất); ở chu kỳ còn 予定: chọn kế hoạch → 「出荷データの移動」.
- **Rule trọng tâm:** ngưỡng 300件/ngày theo kho chỉ cảnh báo (không tính 資材便); badge 未割当 / 取消 / 代替便; duyệt hàng loạt chỉ áp cho 「問題なし」 và server phán định lại lúc duyệt; sau オーダー締切 không đổi ngày hàng loạt từ Lịch trình; dời dữ liệu giữ lead time, kiểm kho OK/NG và cơ sở OK/NG, hàng lạnh và đông lạnh cùng cơ sở cùng ngày giao dời cùng nhau.
- **Scope:** 7 screen nhóm 01 (AW_SCHED_001, 002, 003, 004, 004.1, 006, 007). **Ngoài scope:** 配送データ詳細, 配送サイクル設定, 要確認一覧 (chỉ kiểm điều hướng tới), Company Web, batch.
- **Nguồn:** Basic Design v2 (`screens_num.json`, ảnh annotated) là nguồn chính; spec_02 (§9.1, §9.2, §15.2, §15.5, §18) và spec_tong_quan (§9-3, §15-2) để bổ sung rule.
- **Giả định khi chạy một mạch (không dừng checkpoint):** (1) `ops_qc` có quyền Ops logistics; (2) item có `⚠ Need Confirm` / `CONFLICT` hoặc message `INFERENCE` vẫn sinh TC với tag `[UNCONFIRMED]`, Expected theo BD hiện tại (ưu tiên Figma khi CONFLICT với prototype); (3) AMB mức High được xử lý theo phương án B của `/test/gen-tcs` (vẫn sinh, tag `[UNCONFIRMED]`) do user yêu cầu không dừng hỏi; (4) dữ liệu seed trong `## Test Data Reference` do QC chuẩn bị trên môi trường test, lấy theo dữ liệu mẫu của BD / prototype; (5) chưa có tài khoản QC cho role Ops CS và Sales nên không sinh TC phân quyền âm.

## Screen Inventory

| Screen ID | Tên JP | Tên VN | Loại | Số item BD | Số error | Ảnh annotated | Ghi chú |
|---|---|---|---|---|---|---|---|
| AW_SCHED_001 | スケジュール 月表示 | Lịch trình – Chế độ Tháng | Page (Calendar) | 37 | 4 | AW_SCHED_001.png | Chỉ có frame 確定・参照中 |
| AW_SCHED_002 | スケジュール 週表示 | Lịch trình – Chế độ Tuần | Page (Calendar) | 35 | 4 | AW_SCHED_002.png | Thiếu frame 予定・編集中 |
| AW_SCHED_003 | スケジュール 日表示 | Lịch trình – Chế độ Ngày | Page (List) | 46 | 5 | AW_SCHED_003.png | Bảng 10 cột (prototype 15 cột) |
| AW_SCHED_004 | 変更申請（未処理）モーダル | Popup yêu cầu thay đổi chưa xử lý | Modal (List) | 22 | 4 | AW_SCHED_004.png | Không có frame rỗng |
| AW_SCHED_004.1 | 変更申請一括承認モーダル（確認・完了） | Popup duyệt hàng loạt | Modal (Confirm + Result) | 19 | 4 | AW_SCHED_004.1_01.png, _02.png | 2 trạng thái; thiếu frame thất bại một phần |
| AW_SCHED_006 | 出荷データの移動モーダル | Popup dời dữ liệu giao hàng | Modal (Form) | 15 | 5 | AW_SCHED_006.png | Tiêu đề Figma đang sai |
| AW_SCHED_007 | 用語の説明モーダル | Popup giải thích thuật ngữ | Modal (Static) | 17 | 0 | AW_SCHED_007.png | Lối vào chưa chốt |

## Acceptance Criteria

| AC ID | Nội dung | Nguồn | Status |
|---|---|---|---|
| AC-01 | Mở 「配送管理」＞「スケジュール」 hiển thị chế độ 「月」 mặc định; segment 月 / 週 / 日 chuyển đúng 3 chế độ | BD:AW_SCHED_001/4 | Confirmed |
| AC-02 | Lịch tháng 7 cột bắt đầu thứ Hai; ngày ngoài tháng hiển thị nhạt; mỗi ô có ngày, tên chu kỳ + mã slot, 「出荷：N件」, 「配送：N件」 | BD:AW_SCHED_001/29–34 | Confirmed |
| AC-03 | Số 出荷 = số dữ liệu có ngày xuất là ngày đó, không tính 資材便; ngày nghỉ hiển thị 「休：出荷」「休：配送」「休：出荷・配送」 | BD:AW_SCHED_001/33, 34 | Confirmed |
| AC-04 | Ngày có số mục xuất vượt ngưỡng của kho (mặc định 300) hiển thị 「上限300件を超過」, viền đỏ, nền đỏ nhạt; chỉ cảnh báo, không chặn | BD:AW_SCHED_001/37 · spec_tong_quan §9-3 | Assumed (đúng 300 không cảnh báo; so theo kho hay tổng xem AMB-08) |
| AC-05 | Badge 「未割当 N件」「取消 N件」 hiển thị khi N > 0 và ẩn khi N = 0; 「代替便 N件」 ở cùng vị trí | BD:AW_SCHED_001/35, 36 | Assumed (代替便 theo prototype) |
| AC-06 | 2 ô từ khoá + 10 dropdown lọc dữ liệu khi bấm 「検索」; để trống toàn bộ = không lọc; 「クリア」 đưa #15–#26 về trống | BD:AW_SCHED_001/15–28 | Assumed (AND, kiểu so khớp xem AMB-07) |
| AC-07 | Chu kỳ đã chốt hiển thị 「確定・参照中」 và câu 「日付の変更は配送データ詳細から1件ずつ（出荷日の前日まで）」; không có thao tác đổi ngày hàng loạt trên Lịch trình | BD:AW_SCHED_001/10, 12 · spec_02 §9.2 | Confirmed |
| AC-08 | Chế độ Tuần: 7 cột thứ Hai → Chủ nhật; thẻ tiêu đề ngày có ngày, chu kỳ + slot, 「出荷：N件」; dòng = dữ liệu có ngày xuất là ngày đó, kèm tag vùng nhiệt và 「着MM/DD」 | BD:AW_SCHED_002/29–33 | Confirmed |
| AC-09 | Dòng tuần: vạch xanh + nền xanh nhạt = thay đổi sau chốt; nền vàng nhạt = 要対応; gạch ngang = 取消; có chú giải 4 nội dung | BD:AW_SCHED_002/32, 35 | Confirmed |
| AC-10 | Chế độ Ngày: tiêu đề 「yyyy/mm/dd（曜）chu kỳ slot」, 「出荷 N件（しきい値 M件）」, 「要対応 N件（内訳）」, 「変更 N件」 | BD:AW_SCHED_003/29–32 | Confirmed |
| AC-11 | Bảng ngày sắp theo chu kỳ → 要対応 → pháp nhân / cơ sở; dòng 要対応 nền cam + lý do; dòng thay đổi sau chốt nền xanh + nội dung | BD:AW_SCHED_003/33, 36 · spec_tong_quan §15-2 | Confirmed |
| AC-12 | Phân trang bảng ngày mặc định 10 dòng/trang, 「N件中 a–b件」, ‹ vô hiệu ở trang đầu, › vô hiệu ở trang cuối | BD:AW_SCHED_003/44–46 | Confirmed |
| AC-13 | Không có dữ liệu khớp → bảng rỗng + 「該当するデータがありません。」 | E_SCHED003_001, E_SCHED004_001 | TBD (message INFERENCE — AMB-15) |
| AC-14 | 「変更申請（N件）」 mở popup liệt kê yêu cầu PENDING, 10 dòng/trang, lọc theo từ khoá / システム判定 / 便種別 | BD:AW_SCHED_004/4–8, 20 | Confirmed |
| AC-15 | Chỉ dòng 「問題なし」 tick được; 「希望日なし」「要再確認」 bị làm nhạt, checkbox vô hiệu, xử lý từng cái qua 申請番号 | BD:AW_SCHED_004/9, 11, 18 | Confirmed |
| AC-16 | Phán định tính lại mỗi lần hiển thị và tại thời điểm duyệt; yêu cầu quá hạn chốt đơn không tự bị từ chối | BD:AW_SCHED_004/18 · spec_02 §9.1.1, §15.5 | Confirmed |
| AC-17 | Popup xác nhận hiển thị N yêu cầu với 納品日, 承認後の納品日 (= 第一希望日), ピッキング日 trước → sau giữ lead time | BD:AW_SCHED_004.1/3–12 | Confirmed |
| AC-18 | 「一括承認」 duyệt hết → popup 「一括承認が完了しました」 + 「N件の変更申請を承認しました。…」; lưu ngày giờ duyệt và người phụ trách | BD:AW_SCHED_004.1/14–17 · spec_02 §17.3 | Confirmed |
| AC-19 | Có yêu cầu không duyệt được (locked, đã xử lý, không qua kiểm tra ngày) → kết quả một phần, yêu cầu thất bại giữ nguyên chưa xử lý | E_SCHED0041_001 · spec_02 §15.5, §18 | TBD (chưa có frame — AMB-11) |
| AC-20 | Popup dời dữ liệu: ứng viên chỉ từ hôm nay trở đi và trong cùng chu kỳ; badge kho OK / NG（N件）, cơ sở 全拠点 OK / N拠点 NG（N件） | BD:AW_SCHED_006/5–10 · spec_02 §6.1–6.3 | Confirmed |
| AC-21 | 「確認して移動」 dời ngày picking + ngày giao giữ lead time; mục NG giữ ngày cũ; lạnh + đông lạnh cùng cơ sở cùng ngày dời cùng; toast 「出荷データを移動しました」 | BD:AW_SCHED_006/12, 15 · spec_02 §9.2 | Assumed (toast theo prototype) |
| AC-22 | Mục đã qua ngày chốt đơn không dời hàng loạt được (DOMAIN_ORDER_CLOSED) | E_SCHED006_001 · spec_02 §9.2, §18 | Assumed (kiểu hiển thị Toast là INFERENCE) |
| AC-23 | Popup 用語の説明 hiển thị 14 thuật ngữ cố định, chỉ đọc; × và Esc đóng popup | BD:AW_SCHED_007/1–17 | Confirmed |
| AC-24 | Lỗi hệ thống: 401 → modal + về đăng nhập; mạng / 500 → toast và giữ màn; CSV lỗi → toast | E_SCHED00x_S_001–004 | TBD (message INFERENCE — AMB-15) |
| AC-25 | Xem Lịch trình: mọi role vận hành; lọc theo kho không phải đơn vị phân quyền; duyệt: Ops logistics + Ops CS; đổi ngày trước chốt: Ops logistics | spec_02 §15.2 | TBD (hiển thị nút theo role — AMB-01) |

## Q&A — Ambiguities

| ID | Reference | Screen | Câu hỏi + Assumption | Severity | Status |
|---|---|---|---|---|---|
| AMB-01 | BD #9, 004 #22, 006 #15 · spec_02 §15.2 | 001–006 | Nút 配送サイクル設定 / 一括承認 / 出荷データの移動 hiển thị thế nào với Ops CS và Sales (ẩn, disable hay báo lỗi)? Message khi server từ chối quyền? Assumption: chưa sinh TC phân quyền âm, đưa vào Not Covered | High | TBD |
| AMB-02 | BD:AW_SCHED_001/30 | 001 | CONFLICT: click ô ngày → Chế độ Tuần (prototype) hay Chế độ Ngày (Danh_sach_man_hinh)? Assumption: theo BD = Tuần | High | TBD |
| AMB-03 | BD #1 | 001–003 | Click 「要確認（N件）」: Tháng mở panel, Tuần / Ngày link thẳng — có thống nhất không? Screen ID 要確認一覧? Assumption: theo prototype | Medium | TBD |
| AMB-04 | BD #3 | 001–003 | Đặc tả CSV (cột, phạm vi theo bộ lọc, encoding, tên file)? Assumption: chỉ kiểm có file .csv | Medium | TBD |
| AMB-05 | BD #2 | 001–003 | 「変更申請（N件）」 khi N = 0: ẩn, hiện 0件 hay disable? | Low | TBD |
| AMB-06 | BD #4, #5 | 001–003 | Có giữ điều kiện lọc / ngày mốc khi đổi chế độ? Giá trị mặc định của ô ngày? 対象週 là 1 ô (Figma) hay 2 ô 開始日〜終了日 (prototype)? Assumption: giữ điều kiện; mặc định = hôm nay; 1 ô | Medium | TBD |
| AMB-07 | BD #15–#28 | 001–004 | Kiểu so khớp (chứa / chính xác), maxlength, bỏ gạch nối số điện thoại, 送り状番号 gộp ô 1 hay tách ô, dropdown chọn một hay nhiều, kết hợp AND? Assumption: chứa, AND, 送り状番号 ở ô 1 | Medium | TBD |
| AMB-08 | BD:AW_SCHED_001/37, 003/30 | 001, 003 | Khi không lọc kho: so ngưỡng theo từng kho hay tổng? Số 300 trong nhãn có đổi theo ngưỡng của kho? Cách hiển thị vượt ngưỡng ở Chế độ Ngày? Assumption: vượt = lớn hơn 300; TC dùng dữ liệu 1 kho | High | TBD |
| AMB-09 | BD #10, notes | 001–003 | Chưa có frame cho 「予定・編集中」 (checkbox, 全て選択, thanh chọn, 出荷データの移動, ô viền nét đứt). Assumption: theo prototype | Medium | TBD |
| AMB-10 | BD:AW_SCHED_003/33, 43, 46 | 003 | Bảng ngày 10 cột (Figma) hay 15 cột (prototype)? Tên cột 納品日 hay 配送日（着）? Có sắp xếp theo cột? Lựa chọn số dòng/trang? Assumption: theo Figma, có 20件／ページ | Medium | TBD |
| AMB-11 | BD:AW_SCHED_004/9, 22 · 004.1/2, 14, 19 · E_SCHED0041_001 | 004, 004.1 | Bấm 一括承認 khi chưa tick? Giữ tick khi quay lại / chuyển trang? Màn kết quả thất bại một phần và nút 「失敗分を再実行」? Sau 「完了」 về Lịch trình hay về 004, có tải lại số 変更申請? Assumption: theo prototype, về Lịch trình | High | TBD |
| AMB-12 | BD:AW_SCHED_006/6, 11, 15 | 006 | Radio của ngày mọi kho NG có disable? Bấm 確認して移動 khi chưa chọn ngày? Ô nhập lý do (spec yêu cầu) ở đâu? 「詳細を確認」 mở gì? | High | TBD |
| AMB-13 | BD:AW_SCHED_006/1 · BD #4 | 006, 001–003 | Tiêu đề popup 006 trên Figma là 「変更申請（未処理）」 (nghi sót khi clone) — sửa thành 「出荷データの移動」? Nhãn nút thứ 2 của segment đang ghi 「月」 thay vì 「週」 | Low | TBD |
| AMB-14 | AW_SCHED_007 notes | 007 | Lối vào popup (icon quyển sách ở header chung?) và nội dung tĩnh hay từ API glossary? Assumption: icon quyển sách, nội dung tĩnh | Low | TBD |
| AMB-15 | errors[].remarks | Tất cả | Mọi message lỗi System và Empty state là INFERENCE; kiểu hiển thị (Modal / Toast) chưa chốt | Medium | TBD |
| AMB-16 | BD #9, 002/32, 003/35, 004/11 | Tất cả | Screen ID của 配送データ詳細, 配送サイクル設定, 要確認一覧 (ngoài nhóm 01) | Medium | TBD |

> **TBD** = chưa được PM/BA confirm. Các TC phụ thuộc đều mang tag `[UNCONFIRMED]` trong `test-cases.md`.

## History

- v1 (2026-10-12): khởi tạo từ Basic Design v2 + spec_02, chạy một mạch không dừng checkpoint theo yêu cầu.
