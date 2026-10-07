# Đặc tả hợp đồng (doanh nghiệp・cơ sở・hợp đồng cha・hợp đồng con) — Chuẩn

**Thư mục này là chuẩn của đặc tả doanh nghiệp・cơ sở・hợp đồng.** Ngày 2026-10-03 đã gộp `Doanh_nghiệp_Cơ_sở_Hợp_đồng_Hợp_đồng_con_Danh_sách_mục.md` và `01_仕様/Sắp_xếp_đặc_tả_Trục_thời_gian_bản_sao_và_tính_nhất_quán_20261001.md` thành một và chia theo chủ đề (hong trả lời: gộp hợp đồng thành một spec, chia theo chủ đề).
Số mục (§0.1〜§0.12, §1〜§11 của "Chỉnh lý đặc tả") giữ nguyên như ban đầu. Quyết định đang có hiệu lực nằm ở `docs/決定台帳.md`. Nếu mâu thuẫn với đặc tả thì sổ quyết định là chuẩn.
2026-10-03: Đã sửa các chỗ mâu thuẫn với sổ quyết định・契約_01 (cách viết ban đầu ở "(Cũ: …)" của từng chỗ). Nội dung của 契約_07 đã chuyển sang 契約_00・契約_06・Quy tắc thanh toán・Master, và 契約_07 chỉ còn danh sách nơi chuyển đến. Những chỗ đang xác nhận với hong ghi là "⚠️ Cần xác nhận (2026-10-03・đang hỏi hong)".

| File | Gốc | Nội dung |
|---|---|---|
| [契約_00 (Quy tắc cơ bản)](Hợp_đồng_00_Quy_tắc_cơ_bản.md) | Danh sách mục §0.1〜0.6, 0.10, 0.12 | Cấu trúc màn hình・phân công cha con・tạo hợp đồng con・dùng thử・chủ sở hữu điều kiện thanh toán (§0.5: chuyển từ 契約_07)・cho thuê thiết bị・những thứ không hiển thị trên Web doanh nghiệp・chú giải |
| [契約_01 (Trục thời gian・bản sao・nhất quán)](Hợp_đồng_01_Trục_thời_gian_bản_sao_và_tính_nhất_quán.md) | Chỉnh lý đặc tả §0〜§11 | Tạo trước hợp đồng con・bản sao・xác định và đính chính thanh toán・tháng áp dụng・tạm dừng・dùng thử → triển khai chính thức・tài khoản |
| [契約_02 (Màn hình danh sách)](Hợp_đồng_02_Màn_hình_danh_sách.md) | Danh sách mục Phần I | Danh sách doanh nghiệp・danh sách cơ sở・danh sách hợp đồng con |
| [契約_03 (Mục màn hình Doanh nghiệp)](Hợp_đồng_03_Doanh_nghiệp_Mục_màn_hình.md) | Danh sách mục Phần I | Chỉnh sửa thông tin doanh nghiệp |
| [契約_04 (Mục màn hình Cơ sở)](Hợp_đồng_04_Cơ_sở_Mục_màn_hình.md) | Danh sách mục Phần I | Chỉnh sửa thông tin cơ sở |
| [契約_05 (Mục màn hình Hợp đồng con)](Hợp_đồng_05_Hợp_đồng_con_Mục_màn_hình.md) | Danh sách mục Phần I | Chỉnh sửa thông tin hợp đồng (hợp đồng con) |
| [契約_06 (Mục màn hình Chi tiết thanh toán)](Hợp_đồng_06_Chi_tiết_thanh_toán_Mục_màn_hình.md) | Danh sách mục Phần I・§0.8 | Cấu trúc 2 bảng ①② (§0.8: chuyển từ 契約_07)・chi tiết thanh toán (xác định thanh toán・hóa đơn・③ chi tiết điều chỉnh) |
| [契約_07 (Quan hệ với thanh toán・tùy chọn)](Hợp_đồng_07_Quan_hệ_với_thanh_toán_và_tùy_chọn.md) | Danh sách mục §0.5, 0.7, 0.8, 0.9, 0.11 | Chỉ là danh sách nơi chuyển đến (đã chỉnh lý 2026-10-03). §0.5 → 契約_00, §0.7 → Master §0.2〜0.5, §0.8 → 契約_06・Quy tắc thanh toán §1・2-4, §0.9 → Quy tắc thanh toán 1-9, §0.11 → Quy tắc thanh toán 3-4 |
| [契約_99 (Bổ sung: hệ thống ID・quá trình・OPEN)](Hợp_đồng_99_Bổ_sung_Hệ_thống_ID_Quá_trình_OPEN.md) | Danh sách mục Phần II | Hệ thống ID・quyết định 2026/09/25・các OPEN còn lại |

Liên quan (các chuẩn khác): thanh toán → `40_Master_Phí_Thanh_toán/Quy_tắc_thanh_toán_Đặc_tả_v1.md`, master → `40_Master_Phí_Thanh_toán/Danh_sách_mục_Master_Dòng_máy_Tùy_chọn_Giảm_giá.md`, màn hình Web doanh nghiệp → `Web_doanh_nghiệp_Quản_lý_cơ_sở_Đặc_tả_màn_hình_v1.md`.
