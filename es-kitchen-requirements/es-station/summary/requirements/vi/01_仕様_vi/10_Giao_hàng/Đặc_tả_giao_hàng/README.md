# Đặc tả giao hàng (chu kỳ・xuất hàng・picking・giao hàng) — Chuẩn

**Thư mục này là chuẩn của đặc tả giao hàng.** Ngày 2026-10-03 đã chia `Đặc_tả_tích_hợp_Chu_kỳ_Xuất_hàng_Picking_Giao_hàng_v2.3.md` theo từng chương (hong trả lời: đặc tả giao hàng gộp thành một bản đặc tả tích hợp, chia theo từng chương).
Số mục (§1〜§20) giữ nguyên như ban đầu. Các tham chiếu như "Tích hợp §12-2" hãy tìm trong bảng dưới.
Quyết định đang có hiệu lực nằm ở `docs/決定台帳.md`. Nếu mâu thuẫn với đặc tả thì sổ quyết định là chuẩn.

| File | Mục | Nội dung |
|---|---|---|
| [配送_00 (Tổng quan)](Giao_hàng_00_Tổng_quan.md) | §0-1, §0-3〜0-6, §1, §2 | Mục đích・vị trí・bức tranh toàn thể・thuật ngữ và ID |
| [配送_01 (Master)](Giao_hàng_01_Master.md) | §3 | Master |
| [配送_02 (Cài đặt chu kỳ và tính ngày)](Giao_hàng_02_Cài_đặt_chu_kỳ_và_tính_ngày.md) | §4, §6 | Cài đặt chu kỳ giao hàng (màn hình 01)・tính ngày |
| [配送_03 (Cài đặt giao hàng của hợp đồng)](Giao_hàng_03_Cài_đặt_giao_hàng_của_hợp_đồng.md) | §5 | Cài đặt giao hàng của hợp đồng (màn hình 02) |
| [配送_04 (Kế hoạch・dữ liệu giao hàng・thay đổi)](Giao_hàng_04_Lịch_dự_kiến_dữ_liệu_giao_hàng_và_thay_đổi.md) | §7, §8 | Cấu trúc hai tầng của việc tạo・thay đổi・khóa・tạm dừng・hủy |
| [配送_05 (Picking・chỉ thị xuất hàng)](Giao_hàng_05_Picking_và_chỉ_thị_xuất_hàng.md) | §9, §10 | Picking・chỉ thị xuất hàng・vận đơn・liên kết bên ngoài |
| [配送_06 (Thực hiện giao hàng・tài xế)](Giao_hàng_06_Thực_hiện_giao_hàng_và_tài_xế.md) | §11, §12 | Thực hiện giao hàng・tài xế và phân công |
| [配送_07 (Sự cố・hàng thay thế)](Giao_hàng_07_Trouble_và_hàng_thay_thế.md) | §13 | Sự cố・giao lại・giao một phần・hàng thay thế |
| [配送_08 (Kết nối thanh toán・màn hình)](Giao_hàng_08_Kết_nối_thanh_toán_và_màn_hình.md) | §14, §15 | Kết nối với thanh toán・màn hình và cách hiển thị |
| [配送_09 (Mô hình dữ liệu・batch)](Giao_hàng_09_Mô_hình_dữ_liệu_và_batch.md) | §16, §17 | Mô hình dữ liệu・batch・phân quyền・phi chức năng・chuyển đổi |
| [配送_10 (Chưa quyết)](Giao_hàng_10_Chưa_quyết.md) | §18, §20 | Các việc chưa quyết・những mâu thuẫn còn lại |
| [配送_11 (Mô hình dữ liệu)](Giao_hàng_11_Mô_hình_dữ_liệu.md) | DEV §14 cũ | **Chuẩn về bảng・cột・ràng buộc** (đã Nhật hóa DEV §14 và sửa cho khớp với sổ quyết định) |
| [配送_12 (API・batch・liên kết bên ngoài)](Giao_hàng_12_API_batch_và_liên_kết_ngoài.md) | DEV §15〜§19 cũ | API・batch・lỗi・liên kết bên ngoài (đã Nhật hóa DEV) |
| [配送_99 (Quá trình quyết định)](Giao_hàng_99_Quá_trình_quyết_định.md) | §0-2〜0-2Q, §19 cũ | Quá trình quyết định (để tham chiếu. Không phải chuẩn) |

## File gốc đã đóng băng (tài liệu gốc・không cập nhật)
- `../Đặc_tả_tích_hợp_Chu_kỳ_Xuất_hàng_Picking_Giao_hàng_v2.3.md` — chỉ để lại hướng dẫn đến thư mục này (nội dung chính nằm ở c709ef1 của git)
- `../Đặc_tả_DEV_Chu_kỳ_Xuất_hàng_Picking_Giao_hàng_VI_v2.3.md` — §14〜§19 đã được Nhật hóa và chuyển sang 配送_11・配送_12
- `../Đặc_tả_Cài_đặt_chu_kỳ_giao_hàng.md` — đã đưa vào nội dung chính (〔Nguồn gốc: Cài đặt chu kỳ giao hàng §…〕). Ngày 2026-10-03 đã đưa các chênh lệch còn lại vào từng chương
- `../../../議事録_仕様/ピッキング出荷配送ドライバー_詳細要件仕様.md` (REQ-DL) — chỉ tham chiếu làm nguồn của số REQ-DL. Việc đánh số trùng REQ-DL-701〜718 xem `配送_00` §0-4
- `../Giao_hàng_Trouble_và_hủy_Luồng_xử_lý_vi.md` — bản dịch tiếng Việt của sự cố. Nội dung ở `配送_04` §7-7・`配送_07`
