# Requirements Analysis: Group 3 — 配送サイクル設定 / Thiết lập chu kỳ giao hàng

**Ngày:** 2026-10-12 · **Nguồn:** Basic Design v2 (`screens_num.json`, ảnh annotated) + spec_02 (§5, §6.2, §15.2, §15.3, §17, §18) + spec_tong_quan §4 · **Platform:** Web desktop 1440 (Admin Web 運営Web, E03)

## Summary

- 配送サイクル設定 là màn duy nhất để tạo chu kỳ giao hàng dùng chung toàn công ty: 28 slot (A1〜D7 = 4 tuần × 7 ngày), A1 luôn là thứ Hai, tháng chu kỳ là tháng chứa slot B7.
- Màn chia trái/phải. Trái: 設定対象期間, 配送サイクル初日, thanh tháng (出荷不可：N日 / 配送祝日：N日 / 参照のみ), lịch tháng, chú giải. Phải: panel 「休止設定」 với 3 tab — 祝日・臨休 (AW_CYCSET_001), サイクル休止 (AW_CYCSET_002), 出荷不可 (AW_CYCSET_003).
- Lưu luôn đi qua popup xem trước số mục ảnh hưởng AW_CYCSET_004; khi có mục đã thoả thuận với pháp nhân bị mất hiệu lực hoặc phải đề xuất lại thì bắt buộc tick xác nhận.
- Thứ tự ưu tiên phán định ngày: サイクル休止 (không gán slot) → 配送祝日 (dời ngày giao của hợp đồng không giao ngày lễ) → 出荷不可 theo kho (dời picking trước, không đủ thì dời ngày giao).
- Tháng đã khoá (tháng này, tháng sau) chỉ 「参照のみ」, không sửa được bất kể quyền.
- Actor: System Admin = 運営（物流）là role duy nhất được lưu (spec_02 §15.2).
- Phụ thuộc: AW_SCHED_001 (điểm vào và điểm quay về), master ngày lễ, master kho, API delivery-cycle-settings / delivery-holidays / delivery-cycle-pauses / warehouses non-picking-config.
- Phạm vi QC: 4 screen, 207 TC; 104 TC mang `[UNCONFIRMED]` do BD còn nhiều `Need Confirm` / `CONFLICT` / message `INFERENCE`.

### Giả định đã dùng (pipeline chạy một mạch, không dừng checkpoint)

1. Khi nguồn mâu thuẫn, Expected viết theo BD hiện tại (BD đã chọn theo Figma) và gắn `[UNCONFIRMED]`.
2. `admin_qc@example.com` có quyền lưu chu kỳ; `ops_qc@example.com` được coi là không có quyền lưu (AMB-02).
3. Ngày hệ thống môi trường test là 2026-09-15 để khớp dữ liệu Figma (tháng khoá = 9月・10月).
4. Thao tác trong panel phải chỉ ghi DB khi 「設定を保存」 (AMB-04); TC kiểm "chưa lưu" bằng cách mở màn ở tab trình duyệt khác.
5. Xoá dòng (ngày nghỉ, đợt ngưng, ngày không xuất) thực hiện ngay, không có popup xác nhận (AMB-07).
6. Số ngày 出荷不可 trên thanh tháng và nhãn 「休：出荷」 tính theo kho 関東倉庫 (AMB-05).
7. Lỗi hệ thống (500, timeout, lỗi nghiệp vụ phía server) được dựng bằng mock API hoặc DevTools; bộ số ảnh hưởng của popup dùng mock IMP-A〜IMP-E.
8. Dữ liệu mẫu Figma có A1 = 2026-09-07 nhưng lịch tháng 12 vẽ A1 = 2026-12-07 (lệch 7 ngày so với phép cộng 28 ngày). TC chỉ khẳng định các ô từ tháng 11/2026 trở đi theo đúng hình Figma, đã đối chiếu khớp với số liệu thanh tháng 11月〜2月.

## Screen Inventory

| Screen ID | Tên JP | Tên VN | Prefix TC | Số item BD | Số error | Số TC |
|---|---|---|---|---|---|---|
| AW_CYCSET_001 | 配送サイクル設定（祝日・臨休タブ） | Màn chính + tab Ngày lễ giao hàng・Nghỉ tạm | CYH | 40 | 13 | 81 |
| AW_CYCSET_002 | 配送サイクル設定（サイクル休止タブ） | Tab Tạm ngưng chu kỳ | CYP | 19 | 8 | 41 |
| AW_CYCSET_003 | 配送サイクル設定（出荷不可タブ） | Tab Không xuất hàng | CYN | 21 | 7 | 47 |
| AW_CYCSET_004 | 保存前の確認モーダル（影響件数） | Popup xác nhận trước khi lưu | CYS | 16 | 9 | 25 |
| — | Navigation | Chuyển màn trong nhóm và sang AW_SCHED_001 | CYNAV | — | — | 13 |

## Acceptance Criteria

| AC | Nội dung | Nguồn | Status |
|---|---|---|---|
| AC-01 | A1 chỉ chọn được thứ Hai; ngày khác thứ Hai bị từ chối với E_CYCSET001_001 | BD 001/7, 001/8; spec_02 §5.1 | Assumed (CONFLICT: spec nói normalize về thứ Hai liền trước) |
| AC-02 | A1 mặc định là ngày sau D7 của chu kỳ trước; đổi A1 thì lịch tính lại ngay 28 slot | BD 001/7; spec_02 §5.1, §5.3 | Confirmed |
| AC-03 | 設定対象期間 bắt buộc, tháng kết thúc ≥ tháng bắt đầu; mặc định tháng bắt đầu = tháng đầu tiên chưa thiết lập, kết thúc = bắt đầu + 5 | BD 001/5, 001/6; spec_02 §15.3 | Confirmed |
| AC-04 | Giới hạn số tháng tối đa của kỳ (6 hay 12) | BD 001/6 | TBD (AMB-01) |
| AC-05 | Tháng đã khoá hiển thị 「参照のみ」 và mọi thay đổi thuộc tháng đó bị từ chối (E_CYCSET001_003 / 002_005 / 003_003 / 004_003) | BD 001/12; spec_02 §15.3 | Confirmed (cách hiển thị lỗi: Assumed) |
| AC-06 | Lịch tháng bắt đầu từ thứ Hai, hiển thị tháng chu kỳ + mã slot A1〜D7 tô màu theo tuần, A1 có vạch xanh | BD 001/13〜16 | Confirmed |
| AC-07 | Ngày tạm ngưng hiển thị 「サイクル休止」, không gán slot, không tiêu hao slot; slot chạy tiếp từ ngày sau khi hết ngưng | BD 001/18, 002 logic; spec_02 §5.2 | Confirmed |
| AC-08 | Ngày không xuất hiển thị 「休：出荷」, ngày lễ giao hàng hiển thị 「休：配送」, cả hai hiển thị 「休：出荷・配送」; vẫn được gán slot | BD 001/16, 001/19 | Confirmed |
| AC-09 | Thêm ngày nghỉ thủ công: 休日名 và 日付 bắt buộc, ít nhất một trong 出荷不可 / 配送祝日; thêm xong phản ánh ngay lên lịch và số ngày thanh tháng | BD 001/35〜40 | Confirmed (message: Assumed) |
| AC-10 | Bật/tắt cờ 出荷不可, 配送祝日 và xoá dòng trong 休日一覧 phản ánh ngay lên lịch và thanh tháng | BD 001/31〜33 | Confirmed |
| AC-11 | Mỗi đợt tạm ngưng (ngưng + điều chỉnh) phải là bội số của 7 ngày; chưa đủ thì không lưu được, hệ thống hiển thị số ngày thiếu = 7 − (n mod 7) và không tự chèn | BD 002/10, 002/19; spec_02 §5.2, §15.3 | Confirmed |
| AC-12 | Thêm đợt ngưng: 期間名, 開始日, 終了日 bắt buộc; 終了日 ≥ 開始日; cho phép trùng khoảng; 配送（常に停止） luôn ON | BD 002/12〜19 | Confirmed (message: Assumed) |
| AC-13 | Lưu khi có lỗi bội số 7 thì tự chuyển sang tab 「サイクル休止」 | BD 001/4, 001/23 | Confirmed |
| AC-14 | Slot không xuất thiết lập theo kho trên lưới 28 nút; mặc định A6・A7 / B4〜B7 / C6・C7 / D4〜D7; đổi slot tính lại ngay lịch, thanh tháng và 納品不可枠 | BD 003/6 | Confirmed |
| AC-15 | 納品不可枠 tự tính từ slot không xuất và lead time (xoay vòng D7 → A1), chỉ đọc | BD 003/7〜10; spec_tong_quan §4-8 | Confirmed cho lead time 1 ngày; TBD cho phạm vi lead time (AMB-09) |
| AC-16 | Ngày không xuất riêng lẻ đăng ký theo kho: 理由 và 日付 bắt buộc; không nhận ngày quá khứ và ngày thuộc tháng khoá; tab kho chỉ là bộ lọc | BD 003/3, 003/11〜21 | Confirmed (message E_CYCSET003_003: TBD) |
| AC-17 | 「設定を保存」 hợp lệ luôn mở AW_CYCSET_004 và chưa ghi dữ liệu; popup hiển thị số mục ảnh hưởng theo nhóm, dòng mất hiệu lực / đề xuất lại / không dời được có chữ đỏ | BD 001/4, 004/4〜12; spec_02 §7.2 | Confirmed |
| AC-18 | Khi (mất hiệu lực + cần đề xuất lại) ≥ 1: hiển thị checkbox xác nhận với N = tổng đó, nút 「確認して保存」 Disable cho tới khi tick | BD 004/13, 004/14, 004/16 | Confirmed |
| AC-19 | 「キャンセル」 trên popup đóng popup, không lưu, giữ dữ liệu đang sửa; lưu xong đóng popup và hiển thị toast | BD 004/15, 004/16 | Confirmed cho キャンセル; Assumed cho màn sau khi lưu (AMB-08) |
| AC-20 | Chỉ System Admin / 運営（物流）lưu được; role khác nhận E_CYCSET001_008 / E_CYCSET004_005 | spec_02 §15.2, §15.3 | TBD (AMB-02) |
| AC-21 | Lưu khi người khác đã cập nhật trước bị từ chối (E_CYCSET004_004) | BD 004/16; spec_02 §17.2, §18 | Confirmed (message: Assumed) |

## Q&A — Ambiguities

| ID | Câu hỏi + giả định đang dùng | Severity | Status |
|---|---|---|---|
| AMB-01 | Giới hạn tối đa của 設定対象期間 là 6 tháng (spec_tong_quan §4-2, vượt thì làm tròn về bắt đầu + 5 kèm thông báo) hay 12 tháng (sheet API)? Message E_CYCSET001_002 là gì? Giả định: 6 tháng theo spec_tong_quan, TC biên 7 / 12 / 13 tháng gắn `[UNCONFIRMED]` | High | TBD |
| AMB-02 | Role được lưu: BD ghi 「運営（物流）」, brief QC ghi "chỉ System Admin". Tài khoản `ops_qc` thuộc role nào và có bị chặn lưu không? Role không được lưu có xem được màn không? Giả định: `admin_qc` lưu được, `ops_qc` nhận E_CYCSET001_008 | High | TBD |
| AMB-03 | A1 khác thứ Hai: chặn ở datepicker và báo E_CYCSET001_001 (Figma) hay tự normalize về thứ Hai liền trước (spec_02 §5.1)? Giả định: theo Figma | High | TBD |
| AMB-04 | Thao tác trong panel phải ghi DB ngay (POST/DELETE từng thao tác) hay gom lại khi 「設定を保存」? Giả định: gom lại | High | TBD |
| AMB-05 | Số ngày 出荷不可 trên thanh tháng và nhãn 「休：出荷」 tính theo kho nào; cờ 出荷不可 ở tab ngày lễ áp cho mọi kho hay kho đang chọn; có đồng bộ với 出荷不可日 theo kho không? Giả định: 関東倉庫 | High | TBD |
| AMB-06 | Định dạng ngày của ô A1 là 「2026/09/07」 (frame 001) hay 「2026-09-07」 (frame 003/004, spec_tong_quan §4-9)? | Low | TBD |
| AMB-07 | Có popup xác nhận trước khi xoá (ngày nghỉ, đợt ngưng, ngày không xuất) không? Có được xoá ngày lễ quốc gia không? Giả định: xoá ngay | Medium | TBD |
| AMB-08 | Sau khi lưu hiển thị toast 「配送サイクル設定を保存しました」 (prototype) hay modal thành công (spec_tong_quan §4-9)? Nhãn nút lưu khi không có mục mất hiệu lực? Scrim / Esc có đóng popup không? | Medium | TBD |
| AMB-09 | 納品不可枠 hiển thị những lead time nào (Figma 1日・2日; spec 1・2・3 + nhóm cơ bản; hợp đồng 0〜7)? Nhóm 2日 trên Figma trùng nhóm 1日 có phải chỉ là dữ liệu mẫu? | Medium | TBD |
| AMB-10 | UI đăng ký / di chuyển ngày điều chỉnh 「調整」 và UI sửa đợt ngưng không có trên Figma — thao tác thế nào? Có chặn bội số 7 ngay tại nút 「追加」 không? | High | TBD |
| AMB-11 | Checkbox 「出荷不可」 của đợt ngưng: cho chọn tuỳ ý (Figma) hay luôn dừng cả picking (spec_tong_quan §4-5, §4-7)? | Medium | TBD |
| AMB-12 | Ngày không xuất riêng lẻ đăng ký theo từng ngày (Figma) hay theo khoảng (bảng DB date_from/date_to, popup mẫu 「2026-11-26〜11-27」)? Xử lý ngày trùng? Message E_CYCSET003_003 và E_CYCSET003_004? | Medium | TBD |
| AMB-13 | Maxlength của 休日名, 期間名, 理由? | Low | TBD |
| AMB-14 | Các message gắn `INFERENCE` trong bảng errors (E_*_005〜008, S_*, E_001) và vị trí hiển thị inline / toast / modal đã được chốt chưa? | Medium | TBD |
| AMB-15 | Các GAP so với spec_tong_quan §4 (設定状況の帯, panel 「選択日の設定」, override, KPI, lịch sử thay đổi, nút phản ánh 3 kho) có thuộc phase này không? | Medium | TBD |

> AMB-01, 02, 03, 04, 05, 10 ở mức High. Theo yêu cầu chạy một mạch, các AC liên quan vẫn được sinh TC với `[UNCONFIRMED]` (phương án B của `/test/gen-tcs`); cần BA/BrSE trả lời trước khi thực thi.

## History

| Ngày | Nội dung |
|---|---|
| 2026-10-12 | Tạo mới từ Basic Design v2 + spec_02 |
