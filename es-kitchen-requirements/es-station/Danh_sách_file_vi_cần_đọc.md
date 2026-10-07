# Danh sách file `_vi` cần lấy & đọc – es-station

> Phạm vi: `01_仕様_vi` và `05_画面設計書_vi` (đã bỏ file `.py`, `.DS_Store`, `.gitignore`). Tổng **161 file**.
> Cơ sở phân loại: README các thư mục + phần đầu mỗi file (trạng thái "Nguồn chuẩn" / "Đã đóng băng" / "Đã di chuyển"). Chưa đọc toàn văn từng file.

## 1. Thang ưu tiên

| Mức | Ý nghĩa | Số file | Dung lượng |
|---|---|---:|---:|
| P1 | **Đọc bắt buộc** – bản chuẩn đang có hiệu lực | 41 | 1.6 MB |
| P2 | **Đọc khi làm chủ đề liên quan** – bổ trợ, catalog, mẫu, ghi chú làm việc | 29 | 454 KB |
| P3 | **Chỉ tra cứu** – đóng băng / lịch sử / tham khảo; mở khi cần truy nguyên một quyết định | 66 | 968 KB |
| P4 | **Không nạp** – con trỏ chuyển nơi, bản gốc đóng băng quá lớn, hoặc HTML/JSON nặng | 25 | 28.4 MB |

**Bộ đọc tối thiểu = P1** (41 file, 1.6 MB). Thêm P2 theo chủ đề đang làm.

## 2. Điểm cần lưu ý trước khi dùng

- **Sổ quyết định chuẩn `docs/決定台帳.md` KHÔNG nằm trong `es-station`.** Các file P1 đều ghi "nếu mâu thuẫn thì sổ quyết định là chuẩn" → cần lấy thêm file này (và `docs/議事録_仕様/プランマスタ_仕様まとめ.md` – nguồn chuẩn của master gói) từ nơi khác.
- Toàn bộ 46 file trong `00_Quyết_định/` đã **đóng băng** (nội dung đã chuyển vào sổ quyết định mục G) → mặc định không cần đọc.
- `Quyết_định_STEP1_Trả_lời_Đăng_ký_và_Mẫu_20261001.md` **chưa được dịch** (vẫn tiếng Nhật). `Order-Spec-for-AI-Team.md` và `spec_Giá_bán_…_vi.md` vốn đã là tiếng Việt kèm tên field tiếng Nhật.
- Ba file bản gốc rất lớn (`Đặc_tả_Cài_đặt_chu_kỳ_giao_hàng` 651 KB, `Đặc_tả_DEV_…v2.3` 114 KB, `Giao_hàng_Trouble_và_hủy_…` 65 KB) đã đóng băng và được thay bởi `10_Giao_hàng/Đặc_tả_giao_hàng/` → bỏ qua.
- `Danh_sách_mục_Master_Dòng_máy_Tùy_chọn_Giảm_giá.md` (198 KB) và `Giao_hàng_04` (103 KB) là file P1 rất lớn → nên đọc theo mục, không nạp một lần.

## 3. Danh sách theo nhóm

### A. Điểm vào & quy ước chung  (16 file, 104 KB)

| Ưu tiên | File | Dung lượng | Mục đích / ghi chú |
|---|---|---:|---|
| P1 | `01_仕様_vi/Bảng_phân_quyền_Web_vận_hành_20261003.md` | 8 KB | Phân quyền Web vận hành: 7 vai trò × chức năng (bản chính thức) |
| P1 | `01_仕様_vi/Liên_kết_ngoài_Danh_sách_luồng_lỗi_20261005.md` | 4 KB | Luồng lỗi liên kết bên ngoài (THOMAS/Yamato/Bill One…) |
| P1 | `01_仕様_vi/Quy_ước_mã_màn_hình_20261005.md` | 2 KB | Quy ước Screen Code <Module>_<Feature>_<Seq> |
| P1 | `01_仕様_vi/README.md` | 4 KB | Điểm vào: bản đồ thư mục, file chuẩn của từng chủ đề |
| P1 | `01_仕様_vi/Thiết_kế_cơ_bản_Đề_xuất_định_nghĩa_tổng_thể_20261001.md` | 53 KB | Quy tắc xuyên suốt mọi màn hình (đề xuất; một số điểm bị sổ quyết định K ghi đè) |
| P1 | `01_仕様_vi/Định_nghĩa_nhập_xuất_CSV_20261003.md` | 21 KB | Quy tắc chung & cột CSV xuất/nhập (bản nháp duyệt) |
| P1 | `01_仕様_vi/10_Giao_hàng/Đặc_tả_giao_hàng/README.md` | 4 KB | Mục lục & bảng tra §→file của bản CHUẨN (mục lục đặc tả giao hàng) – đọc đầu tiên | Vai trò" ngắn) |
| P1 | `01_仕様_vi/20_Doanh_nghiệp_Cơ_sở_Hợp_đồng/Đặc_tả_hợp_đồng/README.md` | 4 KB | Mục lục & bảng tra §→file của bản CHUẨN (mục lục đặc tả hợp đồng) – đọc đầu tiên | Vai trò" ngắn) |
| P2 | `01_仕様_vi/45_Menu_Sản_phẩm/README.md` | 1 KB | Mục lục thư mục (bảng "Tệp | Vai trò" ngắn) |
| P2 | `01_仕様_vi/50_Đơn_hàng/README.md` | 1 KB | Mục lục thư mục (bảng "Tệp | Vai trò" ngắn) |
| P2 | `01_仕様_vi/55_Đặt_hàng_Nhập_mua_Nhập_kho/README.md` | 1 KB | Mục lục thư mục (bảng "Tệp | Vai trò" ngắn) |
| P2 | `01_仕様_vi/60_Tồn_kho/README.md` | 1 KB | Mục lục thư mục (bảng "Tệp | Vai trò" ngắn) |
| P2 | `01_仕様_vi/65_Hàng_thay_thế/README.md` | 1 KB | Mục lục thư mục (bảng "Tệp | Vai trò" ngắn) |
| P2 | `01_仕様_vi/70_Đại_lý/README.md` | 1 KB | Mục lục thư mục (bảng "Tệp | Vai trò" ngắn) |
| P2 | `01_仕様_vi/75_Mẫu_kinh_doanh/README.md` | 1 KB | Mục lục thư mục (bảng "Tệp | Vai trò" ngắn) |
| P2 | `01_仕様_vi/80_Màn_hình_vận_hành_và_doanh_nghiệp/README.md` | 1 KB | Mục lục thư mục (bảng "Tệp | Vai trò" ngắn) |

### B. Đặc tả CHUẨN theo chủ đề nghiệp vụ  (35 file, 1.6 MB)

| Ưu tiên | File | Dung lượng | Mục đích / ghi chú |
|---|---|---:|---|
| P1 | `01_仕様_vi/10_Giao_hàng/Đặc_tả_giao_hàng/Giao_hàng_00_Tổng_quan.md` | 55 KB | Bản CHUẨN đặc tả giao hàng (Giao hàng) |
| P1 | `01_仕様_vi/10_Giao_hàng/Đặc_tả_giao_hàng/Giao_hàng_01_Master.md` | 43 KB | Bản CHUẨN đặc tả giao hàng (Giao hàng) |
| P1 | `01_仕様_vi/10_Giao_hàng/Đặc_tả_giao_hàng/Giao_hàng_02_Cài_đặt_chu_kỳ_và_tính_ngày.md` | 88 KB | Bản CHUẨN đặc tả giao hàng (Giao hàng) |
| P1 | `01_仕様_vi/10_Giao_hàng/Đặc_tả_giao_hàng/Giao_hàng_03_Cài_đặt_giao_hàng_của_hợp_đồng.md` | 46 KB | Bản CHUẨN đặc tả giao hàng (Giao hàng) |
| P1 | `01_仕様_vi/10_Giao_hàng/Đặc_tả_giao_hàng/Giao_hàng_04_Lịch_dự_kiến_dữ_liệu_giao_hàng_và_thay_đổi.md` | 103 KB | Bản CHUẨN đặc tả giao hàng (Giao hàng) |
| P1 | `01_仕様_vi/10_Giao_hàng/Đặc_tả_giao_hàng/Giao_hàng_05_Picking_và_chỉ_thị_xuất_hàng.md` | 69 KB | Bản CHUẨN đặc tả giao hàng (Giao hàng) |
| P1 | `01_仕様_vi/10_Giao_hàng/Đặc_tả_giao_hàng/Giao_hàng_06_Thực_hiện_giao_hàng_và_tài_xế.md` | 58 KB | Bản CHUẨN đặc tả giao hàng (Giao hàng) |
| P1 | `01_仕様_vi/10_Giao_hàng/Đặc_tả_giao_hàng/Giao_hàng_07_Trouble_và_hàng_thay_thế.md` | 31 KB | Bản CHUẨN đặc tả giao hàng (Giao hàng) |
| P1 | `01_仕様_vi/10_Giao_hàng/Đặc_tả_giao_hàng/Giao_hàng_08_Kết_nối_thanh_toán_và_màn_hình.md` | 78 KB | Bản CHUẨN đặc tả giao hàng (Giao hàng) |
| P1 | `01_仕様_vi/10_Giao_hàng/Đặc_tả_giao_hàng/Giao_hàng_09_Mô_hình_dữ_liệu_và_batch.md` | 65 KB | Bản CHUẨN đặc tả giao hàng (Giao hàng) |
| P1 | `01_仕様_vi/10_Giao_hàng/Đặc_tả_giao_hàng/Giao_hàng_11_Mô_hình_dữ_liệu.md` | 56 KB | Bản CHUẨN đặc tả giao hàng (Giao hàng) |
| P1 | `01_仕様_vi/10_Giao_hàng/Đặc_tả_giao_hàng/Giao_hàng_12_API_batch_và_liên_kết_ngoài.md` | 44 KB | Bản CHUẨN đặc tả giao hàng (Giao hàng) |
| P1 | `01_仕様_vi/20_Doanh_nghiệp_Cơ_sở_Hợp_đồng/Form_đăng_ký.md` | 72 KB | Bản CHUẨN – Form đăng ký mới/thêm cơ sở (Web DN + tiếp nhận của vận hành) |
| P1 | `01_仕様_vi/20_Doanh_nghiệp_Cơ_sở_Hợp_đồng/Đặc_tả_hợp_đồng/Hợp_đồng_00_Quy_tắc_cơ_bản.md` | 33 KB | Bản CHUẨN đặc tả doanh nghiệp/cơ sở/hợp đồng (Hợp_đồng_00_) |
| P1 | `01_仕様_vi/20_Doanh_nghiệp_Cơ_sở_Hợp_đồng/Đặc_tả_hợp_đồng/Hợp_đồng_01_Trục_thời_gian_bản_sao_và_tính_nhất_quán.md` | 29 KB | Bản CHUẨN đặc tả doanh nghiệp/cơ sở/hợp đồng (Hợp_đồng_01_) |
| P1 | `01_仕様_vi/20_Doanh_nghiệp_Cơ_sở_Hợp_đồng/Đặc_tả_hợp_đồng/Hợp_đồng_02_Màn_hình_danh_sách.md` | 12 KB | Bản CHUẨN đặc tả doanh nghiệp/cơ sở/hợp đồng (Hợp_đồng_02_) |
| P1 | `01_仕様_vi/20_Doanh_nghiệp_Cơ_sở_Hợp_đồng/Đặc_tả_hợp_đồng/Hợp_đồng_03_Doanh_nghiệp_Mục_màn_hình.md` | 25 KB | Bản CHUẨN đặc tả doanh nghiệp/cơ sở/hợp đồng (Hợp_đồng_03_) |
| P1 | `01_仕様_vi/20_Doanh_nghiệp_Cơ_sở_Hợp_đồng/Đặc_tả_hợp_đồng/Hợp_đồng_04_Cơ_sở_Mục_màn_hình.md` | 54 KB | Bản CHUẨN đặc tả doanh nghiệp/cơ sở/hợp đồng (Hợp_đồng_04_) |
| P1 | `01_仕様_vi/20_Doanh_nghiệp_Cơ_sở_Hợp_đồng/Đặc_tả_hợp_đồng/Hợp_đồng_05_Hợp_đồng_con_Mục_màn_hình.md` | 43 KB | Bản CHUẨN đặc tả doanh nghiệp/cơ sở/hợp đồng (Hợp_đồng_05_) |
| P1 | `01_仕様_vi/20_Doanh_nghiệp_Cơ_sở_Hợp_đồng/Đặc_tả_hợp_đồng/Hợp_đồng_06_Chi_tiết_thanh_toán_Mục_màn_hình.md` | 17 KB | Bản CHUẨN đặc tả doanh nghiệp/cơ sở/hợp đồng (Hợp_đồng_06_) |
| P1 | `01_仕様_vi/30_Đơn_yêu_cầu/Đơn_yêu_cầu_và_phê_duyệt.md` | 70 KB | Bản CHUẨN – Yêu cầu thay đổi & phê duyệt (8 loại đơn) |
| P1 | `01_仕様_vi/40_Master_Phí_Thanh_toán/Danh_sách_mục_Master_Dòng_máy_Tùy_chọn_Giảm_giá.md` | 198 KB | Bản CHUẨN – Danh sách mục master Dòng máy/Tùy chọn/Giảm giá (rất lớn, 198 KB – đọc theo mục) |
| P1 | `01_仕様_vi/40_Master_Phí_Thanh_toán/Quy_tắc_thanh_toán_Đặc_tả_v1.md` | 21 KB | Bản CHUẨN – Quy tắc thanh toán tổng hợp (STEP2/3) |
| P1 | `01_仕様_vi/40_Master_Phí_Thanh_toán/Tùy_chọn_và_Giảm_giá_Định_nghĩa_20261003.md` | 73 KB | Bản CHUẨN – Định nghĩa Tùy chọn/Giảm giá + trigger phát sinh tiền |
| P1 | `01_仕様_vi/45_Menu_Sản_phẩm/Master_Menu_Sản_phẩm.md` | 18 KB | Bản CHUẨN – Master menu tháng/sản phẩm |
| P1 | `01_仕様_vi/50_Đơn_hàng/Đơn_hàng.md` | 20 KB | Bản CHUẨN – Đơn hàng tháng/vật tư/quản lý đơn của Vận hành |
| P1 | `01_仕様_vi/55_Đặt_hàng_Nhập_mua_Nhập_kho/Đặt_hàng_Nhập_mua_Nhập_kho.md` | 19 KB | Bản CHUẨN – Đặt hàng, trang nhà cung cấp, nhập kho |
| P1 | `01_仕様_vi/60_Tồn_kho/Tồn_kho.md` | 15 KB | Bản CHUẨN – Tồn kho kho/cơ sở, kiểm kê, điều chỉnh |
| P1 | `01_仕様_vi/65_Hàng_thay_thế/Hàng_thay_thế.md` | 7 KB | Bản CHUẨN – Xử lý sản phẩm lỗi (hàng thay thế) |
| P1 | `01_仕様_vi/70_Đại_lý/Đại_lý_và_giới_thiệu.md` | 7 KB | Bản CHUẨN – Đại lý, phí giới thiệu, thanh toán |
| P1 | `01_仕様_vi/75_Mẫu_kinh_doanh/Mẫu_kinh_doanh.md` | 5 KB | Bản CHUẨN – Mẫu kinh doanh / mẫu thử |
| P1 | `01_仕様_vi/80_Màn_hình_vận_hành_và_doanh_nghiệp/Màn_hình_vận_hành_và_doanh_nghiệp.md` | 13 KB | Bản CHUẨN – TOP/Dashboard, mua hàng, đánh giá, màn hình DN, thông báo, hạn chế truy cập |
| P2 | `01_仕様_vi/10_Giao_hàng/Đặc_tả_giao_hàng/Giao_hàng_10_Chưa_quyết.md` | 52 KB | Mục chưa quyết/mâu thuẫn còn lại của giao hàng |
| P2 | `01_仕様_vi/20_Doanh_nghiệp_Cơ_sở_Hợp_đồng/Web_doanh_nghiệp_Quản_lý_cơ_sở_Đặc_tả_màn_hình_v1.md` | 36 KB | Đặc tả màn hình Web DN – quản lý cơ sở v1.9 (bổ trợ cho Hợp_đồng_*) |
| P2 | `01_仕様_vi/20_Doanh_nghiệp_Cơ_sở_Hợp_đồng/Đặc_tả_hợp_đồng/Hợp_đồng_99_Bổ_sung_Hệ_thống_ID_Quá_trình_OPEN.md` | 12 KB | Bổ sung: hệ thống ID, quyết định 25/09, OPEN còn lại |

### C. Catalog thông báo / email  (4 file, 145 KB)

| Ưu tiên | File | Dung lượng | Mục đích / ghi chú |
|---|---|---:|---|
| P2 | `01_仕様_vi/30_Đơn_yêu_cầu/Danh_sách_email_Đăng_ký_và_yêu_cầu_20261001.md` | 32 KB | Catalog email (điều kiện gửi, người nhận, tiêu đề, nội dung) |
| P2 | `01_仕様_vi/30_Đơn_yêu_cầu/Danh_sách_email_Đặt_hàng_Nhà_cung_cấp_Nhập_kho_20261001.md` | 15 KB | Catalog email (điều kiện gửi, người nhận, tiêu đề, nội dung) – bản đề xuất |
| P2 | `01_仕様_vi/30_Đơn_yêu_cầu/MessageList_MAIL_20261001.csv` | 64 KB | Catalog message email (CSV) |
| P2 | `01_仕様_vi/30_Đơn_yêu_cầu/MessageList_WEB_20261001.csv` | 34 KB | Catalog message trên Web (CSV) |

### D. Đặc tả bổ trợ, kiểm tra nhập liệu & chuyển đổi dữ liệu  (4 file, 41 KB)

| Ưu tiên | File | Dung lượng | Mục đích / ghi chú |
|---|---|---:|---|
| P2 | `01_仕様_vi/10_Giao_hàng/App_tài_xế_Điểm_sửa_đặc_tả_20260930.md` | 3 KB | Điểm sửa đặc tả app tài xế (quyết định 30/09, chưa đóng băng) |
| P2 | `01_仕様_vi/10_Giao_hàng/Thiết_kế_màn_hình_Báo_cáo_trouble_V1.0.md` | 11 KB | Thiết kế màn hình Báo cáo sự cố V1.0 (06/2026) |
| P2 | `01_仕様_vi/20_Doanh_nghiệp_Cơ_sở_Hợp_đồng/CSV_chuyển_đổi_Đề_xuất_cột_20261003.md` | 13 KB | CSV chuyển đổi khách hàng cũ (~600 công ty): đề xuất cột, phần còn lại ở trạng thái D |
| P3 | `01_仕様_vi/30_Đơn_yêu_cầu/Đặc_tả_kiểm_tra_nhập_liệu_Form_đăng_ký_20261001.md` | 13 KB | Đóng băng 03/10 – chuẩn đã chuyển sang Hợp_đồng_00 |

### E. Sổ quyết định (00_Quyết_định) – đã đóng băng  (46 file, 522 KB)

| Ưu tiên | File | Dung lượng | Mục đích / ghi chú |
|---|---|---:|---|
| P3 | `01_仕様_vi/00_Quyết_định/Cần_xác_nhận_Trả_lời_20260921.md` | 14 KB | Quyết định đã ĐÓNG BĂNG (sổ chuẩn là docs/決定台帳.md, không nằm trong folder) |
| P3 | `01_仕様_vi/00_Quyết_định/Quyết_định_Bảng_yêu_cầu_Phase2_Trả_lời_phần_còn_lại_và_đề_xuất_20261002.md` | 8 KB | Quyết định đã ĐÓNG BĂNG (sổ chuẩn là docs/決定台帳.md, không nằm trong folder) |
| P3 | `01_仕様_vi/00_Quyết_định/Quyết_định_Bổ_sung_email_và_thông_báo_20261001.md` | 2 KB | Quyết định đã ĐÓNG BĂNG (sổ chuẩn là docs/決定台帳.md, không nằm trong folder) |
| P3 | `01_仕様_vi/00_Quyết_định/Quyết_định_Cài_đặt_hàng_thay_thế_3_mẫu_và_hạ_nguồn_20261001.md` | 7 KB | Quyết định đã ĐÓNG BĂNG (sổ chuẩn là docs/決定台帳.md, không nằm trong folder) |
| P3 | `01_仕様_vi/00_Quyết_định/Quyết_định_Cách_làm_thiết_kế_cho_phát_triển_20261001.md` | 2 KB | Quyết định đã ĐÓNG BĂNG (sổ chuẩn là docs/決定台帳.md, không nằm trong folder) |
| P3 | `01_仕様_vi/00_Quyết_định/Quyết_định_Hạng_mục_chuyển_tiếp_sau_v146_20261001.md` | 3 KB | Quyết định đã ĐÓNG BĂNG (sổ chuẩn là docs/決定台帳.md, không nằm trong folder) |
| P3 | `01_仕様_vi/00_Quyết_định/Quyết_định_Master_tủ_lạnh_và_cấu_hình_theo_gói_20260929.md` | 6 KB | Quyết định đã ĐÓNG BĂNG (sổ chuẩn là docs/決定台帳.md, không nằm trong folder) |
| P3 | `01_仕様_vi/00_Quyết_định/Quyết_định_STEP1_Trả_lời_Đăng_ký_và_Mẫu_20261001.md` | 7 KB | Quyết định đã ĐÓNG BĂNG (sổ chuẩn là docs/決定台帳.md, không nằm trong folder) |
| P3 | `01_仕様_vi/00_Quyết_định/Quyết_định_STEP2_Trả_lời_Doanh_nghiệp_Cơ_sở_Hợp_đồng_20261001.md` | 6 KB | Quyết định đã ĐÓNG BĂNG (sổ chuẩn là docs/決定台帳.md, không nằm trong folder) |
| P3 | `01_仕様_vi/00_Quyết_định/Quyết_định_STEP3_Bổ_sung_Quy_tắc_thanh_toán_20261001.md` | 6 KB | Quyết định đã ĐÓNG BĂNG (sổ chuẩn là docs/決定台帳.md, không nằm trong folder) |
| P3 | `01_仕様_vi/00_Quyết_định/Quyết_định_STEP3_Bổ_sung_Thiếu_sót_Master_Tùy_chọn_Giảm_giá_20261001.md` | 9 KB | Quyết định đã ĐÓNG BĂNG (sổ chuẩn là docs/決定台帳.md, không nằm trong folder) |
| P3 | `01_仕様_vi/00_Quyết_định/Quyết_định_STEP3_Trả_lời_Master_và_Thanh_toán_20261001.md` | 8 KB | Quyết định đã ĐÓNG BĂNG (sổ chuẩn là docs/決定台帳.md, không nằm trong folder) |
| P3 | `01_仕様_vi/00_Quyết_định/Quyết_định_STEP3_Trả_lời_phần_còn_lại_và_đóng_STEP1_20261001.md` | 9 KB | Quyết định đã ĐÓNG BĂNG (sổ chuẩn là docs/決定台帳.md, không nằm trong folder) |
| P3 | `01_仕様_vi/00_Quyết_định/Quyết_định_STEP4_Trả_lời_Giao_hàng_20261001.md` | 41 KB | Quyết định đã ĐÓNG BĂNG (sổ chuẩn là docs/決定台帳.md, không nằm trong folder) |
| P3 | `01_仕様_vi/00_Quyết_định/Quyết_định_STEP5_Trả_lời_Web_doanh_nghiệp_20261001.md` | 34 KB | Quyết định đã ĐÓNG BĂNG (sổ chuẩn là docs/決定台帳.md, không nằm trong folder) |
| P3 | `01_仕様_vi/00_Quyết_định/Quyết_định_STEP6_Bổ_sung_Trả_lời_OPEN_và_xác_nhận_nhập_kho_20261001.md` | 9 KB | Quyết định đã ĐÓNG BĂNG (sổ chuẩn là docs/決定台帳.md, không nằm trong folder) |
| P3 | `01_仕様_vi/00_Quyết_định/Quyết_định_STEP6_Trả_lời_Đặt_hàng_Nhà_cung_cấp_20261001.md` | 5 KB | Quyết định đã ĐÓNG BĂNG (sổ chuẩn là docs/決定台帳.md, không nằm trong folder) |
| P3 | `01_仕様_vi/00_Quyết_định/Quyết_định_STEP7_Quy_định_về_danh_sách_20261001.md` | 3 KB | Quyết định đã ĐÓNG BĂNG (sổ chuẩn là docs/決定台帳.md, không nằm trong folder) |
| P3 | `01_仕様_vi/00_Quyết_định/Quyết_định_STEP7_Trả_lời_20261001.md` | 4 KB | Quyết định đã ĐÓNG BĂNG (sổ chuẩn là docs/決定台帳.md, không nằm trong folder) |
| P3 | `01_仕様_vi/00_Quyết_định/Quyết_định_Thứ_tự_bắt_đầu_và_sửa_ES-QR_20261002.md` | 2 KB | Quyết định đã ĐÓNG BĂNG (sổ chuẩn là docs/決定台帳.md, không nằm trong folder) |
| P3 | `01_仕様_vi/00_Quyết_định/Quyết_định_Trả_lời_phản_ánh_một_phần_bảng_yêu_cầu_20260930.md` | 28 KB | Quyết định đã ĐÓNG BĂNG (sổ chuẩn là docs/決定台帳.md, không nằm trong folder) |
| P3 | `01_仕様_vi/00_Quyết_định/Quyết_định_Trả_lời_review_TechLead_20261001.md` | 3 KB | Quyết định đã ĐÓNG BĂNG (sổ chuẩn là docs/決定台帳.md, không nằm trong folder) |
| P3 | `01_仕様_vi/00_Quyết_định/Quyết_định_Trả_lời_review_TechLead_Bổ_sung_20261001.md` | 3 KB | Quyết định đã ĐÓNG BĂNG (sổ chuẩn là docs/決定台帳.md, không nằm trong folder) |
| P3 | `01_仕様_vi/00_Quyết_định/Quyết_định_Trả_lời_review_TechLead_Bổ_sung_2_20261001.md` | 2 KB | Quyết định đã ĐÓNG BĂNG (sổ chuẩn là docs/決定台帳.md, không nằm trong folder) |
| P3 | `01_仕様_vi/00_Quyết_định/Quyết_định_Trả_lời_review_TechLead_Bổ_sung_3_20261001.md` | 2 KB | Quyết định đã ĐÓNG BĂNG (sổ chuẩn là docs/決定台帳.md, không nằm trong folder) |
| P3 | `01_仕様_vi/00_Quyết_định/Quyết_định_Trả_lời_review_TechLead_Bổ_sung_4_20261001.md` | 2 KB | Quyết định đã ĐÓNG BĂNG (sổ chuẩn là docs/決定台帳.md, không nằm trong folder) |
| P3 | `01_仕様_vi/00_Quyết_định/Quyết_định_Trả_lời_review_TechLead_Bổ_sung_5_20261001.md` | 3 KB | Quyết định đã ĐÓNG BĂNG (sổ chuẩn là docs/決定台帳.md, không nằm trong folder) |
| P3 | `01_仕様_vi/00_Quyết_định/Quyết_định_Trả_lời_review_thiết_kế_20261001.md` | 5 KB | Quyết định đã ĐÓNG BĂNG (sổ chuẩn là docs/決定台帳.md, không nằm trong folder) |
| P3 | `01_仕様_vi/00_Quyết_định/Quyết_định_Trả_lời_xác_nhận_v173_20261002.md` | 2 KB | Quyết định đã ĐÓNG BĂNG (sổ chuẩn là docs/決定台帳.md, không nằm trong folder) |
| P3 | `01_仕様_vi/00_Quyết_định/Quyết_định_Trả_lời_xác_nhận_v174_20261002.md` | 2 KB | Quyết định đã ĐÓNG BĂNG (sổ chuẩn là docs/決定台帳.md, không nằm trong folder) |
| P3 | `01_仕様_vi/00_Quyết_định/Quyết_định_Tài_khoản_Web_doanh_nghiệp_H1-H5_20261001.md` | 7 KB | Quyết định đã ĐÓNG BĂNG (sổ chuẩn là docs/決定台帳.md, không nằm trong folder) |
| P3 | `01_仕様_vi/00_Quyết_định/Quyết_định_Xác_nhận_tài_liệu_giải_thích_kịch_bản_20261002.md` | 4 KB | Quyết định đã ĐÓNG BĂNG (sổ chuẩn là docs/決定台帳.md, không nằm trong folder) |
| P3 | `01_仕様_vi/00_Quyết_định/Quyết_định_v2.1_20260921.md` | 10 KB | Quyết định đã ĐÓNG BĂNG (sổ chuẩn là docs/決定台帳.md, không nằm trong folder) |
| P3 | `01_仕様_vi/00_Quyết_định/Quyết_định_v2.2_20260922.md` | 9 KB | Quyết định đã ĐÓNG BĂNG (sổ chuẩn là docs/決定台帳.md, không nằm trong folder) |
| P3 | `01_仕様_vi/00_Quyết_định/Quyết_định_v2.3_20260923.md` | 15 KB | Quyết định đã ĐÓNG BĂNG (sổ chuẩn là docs/決定台帳.md, không nằm trong folder) |
| P3 | `01_仕様_vi/00_Quyết_định/Quyết_định_v2.3_Bổ_sung_Bắt_đầu_tạo_và_CSV_20260929.md` | 6 KB | Quyết định đã ĐÓNG BĂNG (sổ chuẩn là docs/決定台帳.md, không nằm trong folder) |
| P3 | `01_仕様_vi/00_Quyết_định/Quyết_định_v2.3_Bổ_sung_Form_đăng_ký_và_Master_20260929.md` | 9 KB | Quyết định đã ĐÓNG BĂNG (sổ chuẩn là docs/決定台帳.md, không nằm trong folder) |
| P3 | `01_仕様_vi/00_Quyết_định/Quyết_định_v2.3_Bổ_sung_Liên_quan_đơn_yêu_cầu_20260928.md` | 105 KB | Quyết định đã ĐÓNG BĂNG (sổ chuẩn là docs/決定台帳.md, không nằm trong folder) |
| P3 | `01_仕様_vi/00_Quyết_định/Quyết_định_v2.3_Bổ_sung_Lịch_trang_chủ_doanh_nghiệp_20260929.md` | 18 KB | Quyết định đã ĐÓNG BĂNG (sổ chuẩn là docs/決定台帳.md, không nằm trong folder) |
| P3 | `01_仕様_vi/00_Quyết_định/Quyết_định_v2.3_Bổ_sung_Master_Gói_20260929.md` | 42 KB | Quyết định đã ĐÓNG BĂNG (sổ chuẩn là docs/決定台帳.md, không nằm trong folder) |
| P3 | `01_仕様_vi/00_Quyết_định/Quyết_định_v2.3_Bổ_sung_Mặc_định_hộp_vật_tư_20260929.md` | 8 KB | Quyết định đã ĐÓNG BĂNG (sổ chuẩn là docs/決定台帳.md, không nằm trong folder) |
| P3 | `01_仕様_vi/00_Quyết_định/Quyết_định_v2.3_Bổ_sung_Phản_ánh_bình_luận_20260929.md` | 8 KB | Quyết định đã ĐÓNG BĂNG (sổ chuẩn là docs/決定台帳.md, không nằm trong folder) |
| P3 | `01_仕様_vi/00_Quyết_định/Quyết_định_v2.3_Bổ_sung_Rà_soát_trouble_20260929.md` | 12 KB | Quyết định đã ĐÓNG BĂNG (sổ chuẩn là docs/決定台帳.md, không nằm trong folder) |
| P3 | `01_仕様_vi/00_Quyết_định/Quyết_định_v2.3_Bổ_sung_Trouble_con_tự_động_20260924.md` | 10 KB | Quyết định đã ĐÓNG BĂNG (sổ chuẩn là docs/決定台帳.md, không nằm trong folder) |
| P3 | `01_仕様_vi/00_Quyết_định/Quyết_định_v2.3_Bổ_sung_Vấn_đề_chưa_giải_quyết_và_ủy_thác_đợt_1_20260929.md` | 14 KB | Quyết định đã ĐÓNG BĂNG (sổ chuẩn là docs/決定台帳.md, không nằm trong folder) |
| P3 | `01_仕様_vi/00_Quyết_định/Quyết_định_v2.3_Bổ_sung_Đổi_ngày_sau_hạn_chót_20260929.md` | 7 KB | Quyết định đã ĐÓNG BĂNG (sổ chuẩn là docs/決定台帳.md, không nằm trong folder) |

### F. Phân tích · đối chiếu · đề xuất · bản gốc đóng băng (lịch sử)  (20 file, 1.2 MB)

| Ưu tiên | File | Dung lượng | Mục đích / ghi chú |
|---|---|---:|---|
| P3 | `01_仕様_vi/10_Giao_hàng/Demo_giao_hàng_Rà_soát_dữ_liệu_Góp_ý_và_cải_thiện_20260929.md` | 8 KB | Tài liệu phân tích/đối chiếu/đề xuất đã xử lý hoặc đóng băng – chỉ dùng khi cần truy nguyên |
| P3 | `01_仕様_vi/10_Giao_hàng/Demo_vận_hành_App_tài_xế_Danh_sách_bất_nhất_20261001.md` | 6 KB | Tài liệu phân tích/đối chiếu/đề xuất đã xử lý hoặc đóng băng – chỉ dùng khi cần truy nguyên |
| P3 | `01_仕様_vi/10_Giao_hàng/Demo_vận_hành_App_tài_xế_Đề_xuất_cải_thiện_20261001.md` | 6 KB | Tài liệu phân tích/đối chiếu/đề xuất đã xử lý hoặc đóng băng – chỉ dùng khi cần truy nguyên |
| P3 | `01_仕様_vi/10_Giao_hàng/Giao_hàng_Vấn_đề_chưa_giải_quyết_và_phương_án_v1.md` | 20 KB | Tài liệu phân tích/đối chiếu/đề xuất đã xử lý hoặc đóng băng – chỉ dùng khi cần truy nguyên |
| P3 | `01_仕様_vi/10_Giao_hàng/Thiết_kế_giao_hàng_Kiểm_tra_sót_tập_trung_trouble_v1.md` | 21 KB | Tài liệu phân tích/đối chiếu/đề xuất đã xử lý hoặc đóng băng – chỉ dùng khi cần truy nguyên |
| P3 | `01_仕様_vi/10_Giao_hàng/Xuất_hàng_Picking_Kiểm_tra_nhất_quán_giữa_các_đặc_tả_v1.md` | 29 KB | Tài liệu phân tích/đối chiếu/đề xuất đã xử lý hoặc đóng băng – chỉ dùng khi cần truy nguyên |
| P3 | `01_仕様_vi/10_Giao_hàng/Đặc_tả_DEV_Review_Danh_sách_thiếu_sót_v1.md` | 16 KB | Tài liệu phân tích/đối chiếu/đề xuất đã xử lý hoặc đóng băng – chỉ dùng khi cần truy nguyên |
| P3 | `01_仕様_vi/10_Giao_hàng/Đặc_tả_giao_hàng/Giao_hàng_99_Quá_trình_quyết_định.md` | 123 KB | Lịch sử quyết định (123 KB) – chỉ tra cứu truy nguyên |
| P3 | `01_仕様_vi/20_Doanh_nghiệp_Cơ_sở_Hợp_đồng/Form_đăng_ký_doanh_nghiệp_Sắp_xếp_v2.md` | 32 KB | Tài liệu phân tích/đối chiếu/đề xuất đã xử lý hoặc đóng băng – chỉ dùng khi cần truy nguyên |
| P3 | `01_仕様_vi/30_Đơn_yêu_cầu/Màn_hình_chi_tiết_yêu_cầu_Đề_xuất_thiết_kế_lại_v1.md` | 24 KB | Tài liệu phân tích/đối chiếu/đề xuất đã xử lý hoặc đóng băng – chỉ dùng khi cần truy nguyên |
| P3 | `01_仕様_vi/30_Đơn_yêu_cầu/Màn_hình_tiếp_nhận_và_phê_duyệt_Chênh_lệch_mục_20260929.md` | 15 KB | Tài liệu phân tích/đối chiếu/đề xuất đã xử lý hoặc đóng băng – chỉ dùng khi cần truy nguyên |
| P3 | `01_仕様_vi/40_Master_Phí_Thanh_toán/Chênh_lệch_Bảng_tra_nhanh_thời_điểm_thanh_toán_vs_Quyết_định_20260925.md` | 6 KB | Tài liệu phân tích/đối chiếu/đề xuất đã xử lý hoặc đóng băng – chỉ dùng khi cần truy nguyên |
| P3 | `01_仕様_vi/40_Master_Phí_Thanh_toán/Tùy_chọn_Sắp_xếp_đặc_tả_và_demo_màn_hình_v1.md` | 27 KB | Tài liệu phân tích/đối chiếu/đề xuất đã xử lý hoặc đóng băng – chỉ dùng khi cần truy nguyên |
| P3 | `01_仕様_vi/40_Master_Phí_Thanh_toán/Xung_quanh_Master_Gói_Kiểm_tra_nhất_quán_20260930.md` | 19 KB | Tài liệu phân tích/đối chiếu/đề xuất đã xử lý hoặc đóng băng – chỉ dùng khi cần truy nguyên |
| P3 | `01_仕様_vi/50_Đơn_hàng/Demo_đơn_hàng_hàng_tháng_Chênh_lệch_với_hợp_đồng_gói_20260930.md` | 10 KB | Tài liệu phân tích/đối chiếu/đề xuất đã xử lý hoặc đóng băng – chỉ dùng khi cần truy nguyên |
| P3 | `01_仕様_vi/50_Đơn_hàng/Đề_xuất_Số_chuẩn_và_mặc_định_riêng_cho_cơ_sở_20261001.md` | 17 KB | Tài liệu phân tích/đối chiếu/đề xuất đã xử lý hoặc đóng băng – chỉ dùng khi cần truy nguyên |
| P3 | `01_仕様_vi/65_Hàng_thay_thế/Danh_sách_câu_hỏi_Cài_đặt_hàng_thay_thế_và_ảnh_hưởng_hạ_nguồn_20261001.md` | 20 KB | Tài liệu phân tích/đối chiếu/đề xuất đã xử lý hoặc đóng băng – chỉ dùng khi cần truy nguyên |
| P4 | `01_仕様_vi/10_Giao_hàng/Giao_hàng_Trouble_và_hủy_Luồng_xử_lý_vi.md` | 65 KB | Bản gốc đóng băng, rất lớn, đã được tách/thay bởi Đặc_tả_giao_hàng/ |
| P4 | `01_仕様_vi/10_Giao_hàng/Đặc_tả_Cài_đặt_chu_kỳ_giao_hàng.md` | 651 KB | Bản gốc đóng băng, rất lớn, đã được tách/thay bởi Đặc_tả_giao_hàng/ |
| P4 | `01_仕様_vi/10_Giao_hàng/Đặc_tả_DEV_Chu_kỳ_Xuất_hàng_Picking_Giao_hàng_VI_v2.3.md` | 115 KB | Bản gốc đóng băng, rất lớn, đã được tách/thay bởi Đặc_tả_giao_hàng/ |

### G. Tham khảo ngoài phạm vi Web (app mobile / team AI)  (2 file, 32 KB)

| Ưu tiên | File | Dung lượng | Mục đích / ghi chú |
|---|---|---:|---|
| P3 | `01_仕様_vi/50_Đơn_hàng/Order-Spec-for-AI-Team.md` | 25 KB | Tham khảo: tài liệu bàn giao team AI (menu/food master/order) 07/2026 |
| P3 | `01_仕様_vi/50_Đơn_hàng/spec_Giá_bán_theo_cơ_sở_Giỏ_hàng_vi.md` | 7 KB | Tham khảo: spec app mobile cá nhân (giá theo cơ sở) 09/2026 |

### H. Trang con trỏ "đã di chuyển"  (4 file, 8 KB)

| Ưu tiên | File | Dung lượng | Mục đích / ghi chú |
|---|---|---:|---|
| P4 | `01_仕様_vi/10_Giao_hàng/Đặc_tả_tích_hợp_Chu_kỳ_Xuất_hàng_Picking_Giao_hàng_v2.3.md` | 2 KB | Trang con trỏ "đã di chuyển" – chỉ là mục lục chuyển nơi, không có nội dung chính |
| P4 | `01_仕様_vi/20_Doanh_nghiệp_Cơ_sở_Hợp_đồng/Doanh_nghiệp_Cơ_sở_Hợp_đồng_Hợp_đồng_con_Danh_sách_mục.md` | 2 KB | Trang con trỏ "đã di chuyển" – chỉ là mục lục chuyển nơi, không có nội dung chính |
| P4 | `01_仕様_vi/20_Doanh_nghiệp_Cơ_sở_Hợp_đồng/Đặc_tả_hợp_đồng/Hợp_đồng_07_Quan_hệ_với_thanh_toán_và_tùy_chọn.md` | 3 KB | Trang con trỏ "đã di chuyển" – chỉ là mục lục chuyển nơi, không có nội dung chính |
| P4 | `01_仕様_vi/Sắp_xếp_đặc_tả_Trục_thời_gian_bản_sao_và_tính_nhất_quán_20261001.md` | 1 KB | Trang con trỏ "đã di chuyển" – chỉ là mục lục chuyển nơi, không có nội dung chính |

### I. Thiết kế màn hình (05) – tài liệu làm việc  (7 file, 166 KB)

| Ưu tiên | File | Dung lượng | Mục đích / ghi chú |
|---|---|---:|---|
| P1 | `05_画面設計書_vi/README.md` | 4 KB | Cách làm việc/quy định của thư mục thiết kế màn hình |
| P2 | `05_画面設計書_vi/Ghi_chú_xác_nhận_AW_3_màn_hình_Master_Dòng_máy_Tùy_chọn_Giảm_giá.md` | 10 KB | Ghi chú rà soát trước khi viết thiết kế màn hình (có mục [Q] chờ trả lời) |
| P2 | `05_画面設計書_vi/Ghi_chú_xác_nhận_AW_Chăm_sóc_khách_hàng_Đánh_giá_Thông_báo_Liên_hệ.md` | 23 KB | Ghi chú rà soát trước khi viết thiết kế màn hình (có mục [Q] chờ trả lời) |
| P2 | `05_画面設計書_vi/Ghi_chú_xác_nhận_AW_PLAN_Master_Gói.md` | 23 KB | Ghi chú rà soát trước khi viết thiết kế màn hình (có mục [Q] chờ trả lời) |
| P2 | `05_画面設計書_vi/Ghi_chú_xác_nhận_AW_SURV_Khảo_sát.md` | 28 KB | Ghi chú rà soát trước khi viết thiết kế màn hình (có mục [Q] chờ trả lời) |
| P2 | `05_画面設計書_vi/Ghi_chú_xác_nhận_Doanh_nghiệp_A_Đơn_hàng_Tồn_kho_Thanh_toán.md` | 53 KB | Ghi chú rà soát trước khi viết thiết kế màn hình (có mục [Q] chờ trả lời) |
| P2 | `05_画面設計書_vi/Kế_hoạch_chạy_song_song_Thiết_kế_màn_hình.md` | 24 KB | Kế hoạch chia việc thiết kế màn hình cho 5 site |

### J. Thiết kế màn hình (05) – mẫu CSV import  (5 file, 14 KB)

| Ưu tiên | File | Dung lượng | Mục đích / ghi chú |
|---|---|---:|---|
| P2 | `05_画面設計書_vi/Mẫu_CSV/devices.csv` | 2 KB | Mẫu CSV import: xem tiêu đề cột/kiểu dữ liệu (đã dịch cả tiêu đề) |
| P2 | `05_画面設計書_vi/Mẫu_CSV/discountApply.csv` | 1 KB | Mẫu CSV import: xem tiêu đề cột/kiểu dữ liệu (đã dịch cả tiêu đề) |
| P2 | `05_画面設計書_vi/Mẫu_CSV/discounts.csv` | 2 KB | Mẫu CSV import: xem tiêu đề cột/kiểu dữ liệu (đã dịch cả tiêu đề) |
| P2 | `05_画面設計書_vi/Mẫu_CSV/options.csv` | 2 KB | Mẫu CSV import: xem tiêu đề cột/kiểu dữ liệu (đã dịch cả tiêu đề) |
| P2 | `05_画面設計書_vi/Mẫu_CSV/plans.csv` | 9 KB | Mẫu CSV import: xem tiêu đề cột/kiểu dữ liệu (đã dịch cả tiêu đề) |

### K. Thiết kế màn hình (05) – bản giao HTML / snapshot  (18 file, 27.6 MB)

| Ưu tiên | File | Dung lượng | Mục đích / ghi chú |
|---|---|---:|---|
| P4 | `05_画面設計書_vi/Đầu_ra/Web_doanh_nghiệp/Thiết_kế_màn_hình_CW_BILL_Hóa_đơn.html` | 589 KB | Bản giao HTML (nặng 0,2–4 MB) – xem bằng trình duyệt, không nạp vào LLM |
| P4 | `05_画面設計書_vi/Đầu_ra/Web_doanh_nghiệp/Thiết_kế_màn_hình_CW_DLV_Chi_tiết_giao_hàng.html` | 914 KB | Bản giao HTML (nặng 0,2–4 MB) – xem bằng trình duyệt, không nạp vào LLM |
| P4 | `05_画面設計書_vi/Đầu_ra/Web_doanh_nghiệp/Thiết_kế_màn_hình_CW_HIST_Lịch_sử_đơn_hàng.html` | 549 KB | Bản giao HTML (nặng 0,2–4 MB) – xem bằng trình duyệt, không nạp vào LLM |
| P4 | `05_画面設計書_vi/Đầu_ra/Web_doanh_nghiệp/Thiết_kế_màn_hình_CW_HOME_Trang_chủ.html` | 696 KB | Bản giao HTML (nặng 0,2–4 MB) – xem bằng trình duyệt, không nạp vào LLM |
| P4 | `05_画面設計書_vi/Đầu_ra/Web_doanh_nghiệp/Thiết_kế_màn_hình_CW_MAT_Đặt_vật_tư.html` | 482 KB | Bản giao HTML (nặng 0,2–4 MB) – xem bằng trình duyệt, không nạp vào LLM |
| P4 | `05_画面設計書_vi/Đầu_ra/Web_doanh_nghiệp/Thiết_kế_màn_hình_CW_ORDER_Đặt_sản_phẩm.html` | 3.0 MB | Bản giao HTML (nặng 0,2–4 MB) – xem bằng trình duyệt, không nạp vào LLM |
| P4 | `05_画面設計書_vi/Đầu_ra/Web_doanh_nghiệp/Thiết_kế_màn_hình_CW_STOCK_Báo_cáo_kiểm_kê.html` | 1.3 MB | Bản giao HTML (nặng 0,2–4 MB) – xem bằng trình duyệt, không nạp vào LLM |
| P4 | `05_画面設計書_vi/Đầu_ra/Web_doanh_nghiệp/_release/snapshot.json` | 369 KB | Snapshot bàn giao cho dev (JSON lớn) – chỉ dùng khi đối chiếu |
| P4 | `05_画面設計書_vi/Đầu_ra/Web_quản_trị_vận_hành_Master/Thiết_kế_màn_hình_AW_DISC_Master_Giảm_giá.html` | 3.4 MB | Bản giao HTML (nặng 0,2–4 MB) – xem bằng trình duyệt, không nạp vào LLM |
| P4 | `05_画面設計書_vi/Đầu_ra/Web_quản_trị_vận_hành_Master/Thiết_kế_màn_hình_AW_MODL_Master_Dòng_máy.html` | 4.0 MB | Bản giao HTML (nặng 0,2–4 MB) – xem bằng trình duyệt, không nạp vào LLM |
| P4 | `05_画面設計書_vi/Đầu_ra/Web_quản_trị_vận_hành_Master/Thiết_kế_màn_hình_AW_OPTN_Master_Tùy_chọn.html` | 2.8 MB | Bản giao HTML (nặng 0,2–4 MB) – xem bằng trình duyệt, không nạp vào LLM |
| P4 | `05_画面設計書_vi/Đầu_ra/Web_quản_trị_vận_hành_Master/Thiết_kế_màn_hình_AW_PLAN_Master_Gói.html` | 3.8 MB | Bản giao HTML (nặng 0,2–4 MB) – xem bằng trình duyệt, không nạp vào LLM |
| P4 | `05_画面設計書_vi/Đầu_ra/Web_quản_trị_vận_hành_Master/_release/snapshot.json` | 467 KB | Snapshot bàn giao cho dev (JSON lớn) – chỉ dùng khi đối chiếu |
| P4 | `05_画面設計書_vi/Đầu_ra/Web_quản_trị_vận_hành_Thông_báo_và_ý_kiến/Thiết_kế_màn_hình_AW_INQU_Liên_hệ.html` | 170 KB | Bản giao HTML (nặng 0,2–4 MB) – xem bằng trình duyệt, không nạp vào LLM |
| P4 | `05_画面設計書_vi/Đầu_ra/Web_quản_trị_vận_hành_Thông_báo_và_ý_kiến/Thiết_kế_màn_hình_AW_NOTI_Thông_báo.html` | 1.5 MB | Bản giao HTML (nặng 0,2–4 MB) – xem bằng trình duyệt, không nạp vào LLM |
| P4 | `05_画面設計書_vi/Đầu_ra/Web_quản_trị_vận_hành_Thông_báo_và_ý_kiến/Thiết_kế_màn_hình_AW_REVI_Đánh_giá_và_ý_kiến.html` | 886 KB | Bản giao HTML (nặng 0,2–4 MB) – xem bằng trình duyệt, không nạp vào LLM |
| P4 | `05_画面設計書_vi/Đầu_ra/Web_quản_trị_vận_hành_Thông_báo_và_ý_kiến/Thiết_kế_màn_hình_AW_SURV_Quản_lý_khảo_sát.html` | 2.4 MB | Bản giao HTML (nặng 0,2–4 MB) – xem bằng trình duyệt, không nạp vào LLM |
| P4 | `05_画面設計書_vi/Đầu_ra/_Chung/Danh_sách_thông_báo_và_email.html` | 350 KB | Bản giao HTML (nặng 0,2–4 MB) – xem bằng trình duyệt, không nạp vào LLM |

## 4. Gợi ý bộ file theo tác vụ

| Tác vụ | File nên lấy |
|---|---|
| Nắm tổng quan dự án | `01_仕様_vi/README.md`, `Thiết_kế_cơ_bản_Đề_xuất_định_nghĩa_tổng_thể…`, `Quy_ước_mã_màn_hình…`, `Bảng_phân_quyền_Web_vận_hành…` |
| Giao hàng / chu kỳ / picking / tài xế | `10_Giao_hàng/Đặc_tả_giao_hàng/README.md` + `Giao_hàng_00…12` (bỏ `_99`; `_10` khi cần mục chưa quyết) + `App_tài_xế_Điểm_sửa_đặc_tả_20260930` |
| Doanh nghiệp / cơ sở / hợp đồng / đăng ký | `20_…/Đặc_tả_hợp_đồng/` (README, 00–06, 99), `Form_đăng_ký.md`, `Web_doanh_nghiệp_Quản_lý_cơ_sở_…`, `30_Đơn_yêu_cầu/Đơn_yêu_cầu_và_phê_duyệt.md` |
| Master & thanh toán | `40_…/Danh_sách_mục_Master…`, `Tùy_chọn_và_Giảm_giá_Định_nghĩa…`, `Quy_tắc_thanh_toán_Đặc_tả_v1` + `05_…/Mẫu_CSV/*.csv` |
| Đơn hàng / menu / tồn kho / nhập kho / hàng thay thế / đại lý / mẫu | file chuẩn trong `45`, `50`, `55`, `60`, `65`, `70`, `75` |
| Màn hình vận hành & doanh nghiệp, thông báo | `80_…/Màn_hình_vận_hành_và_doanh_nghiệp.md`, `MessageList_*.csv`, `Danh_sách_email_*` |
| CSV nhập/xuất, chuyển đổi dữ liệu | `Định_nghĩa_nhập_xuất_CSV_20261003`, `CSV_chuyển_đổi_Đề_xuất_cột_20261003`, `Mẫu_CSV/*` |
| Viết thiết kế màn hình (05) | `05_…/README.md`, `Kế_hoạch_chạy_song_song…`, `Ghi_chú_xác_nhận_*` + các file P1 của chủ đề tương ứng |
