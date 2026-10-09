# Nội dung của 01_仕様 (cập nhật 2026-10-05)

**Quyết định đang có hiệu lực nằm ở `docs/決定台帳.md`.** Nếu mâu thuẫn với đặc tả thì sổ quyết định là chuẩn. README của từng thư mục có ghi file "chuẩn".
File có ghi "Đã đóng băng (tài liệu gốc)" ở đầu chỉ để xem quá trình (không sửa・không đề xuất từ đó).

| Thư mục・file | Chủ đề | Chuẩn |
|---|---|---|
| `00_Quyết_định/` | Ghi chép các quyết định 2026-09-21〜10-02 (46 file) | **Toàn bộ đã đóng băng**. Nơi chuyển đến là G của sổ quyết định |
| `10_Giao_hàng/` | Chu kỳ・xuất hàng・picking・giao hàng・tài xế・sự cố | `Đặc_tả_giao_hàng/` (配送_00〜12) |
| `20_Doanh_nghiệp_Cơ_sở_Hợp_đồng/` | Doanh nghiệp・cơ sở・hợp đồng cha・hợp đồng con, form đăng ký, chuyển đổi | `Đặc_tả_hợp_đồng/` (契約_00〜07), `Form_đăng_ký.md` |
| `30_Đơn_yêu_cầu/` | Yêu cầu và phê duyệt thay đổi・tạm dừng・tiếp tục・hủy, danh sách email | `Đơn_yêu_cầu_và_phê_duyệt.md`, `メール一覧_*.md` |
| `40_Master_Phí_Thanh_toán/` | Master dòng máy・tùy chọn・giảm giá, thanh toán | `Danh_sách_mục_Master_Dòng_máy_Tùy_chọn_Giảm_giá.md`, `Tùy_chọn_và_Giảm_giá_Định_nghĩa_20261003.md`, `Quy_tắc_thanh_toán_Đặc_tả_v1.md` (master gói vẫn là `docs/議事録_仕様/プランマスタ_仕様まとめ.md`) |
| `45_Menu_Sản_phẩm/` | Menu hàng tháng・master sản phẩm | `Master_Menu_Sản_phẩm.md` |
| `50_Đơn_hàng/` | Đơn hàng hàng tháng・đơn hàng vật tư・quản lý đơn hàng của Vận hành | `Đơn_hàng.md` |
| `55_Đặt_hàng_Nhập_mua_Nhập_kho/` | Đặt hàng・trang nhà cung cấp・nhập kho | `Đặt_hàng_Nhập_mua_Nhập_kho.md` |
| `60_Tồn_kho/` | Tồn kho kho・tồn kho cơ sở・báo cáo kiểm kê | `Tồn_kho.md` |
| `65_Hàng_thay_thế/` | Xử lý khi sản phẩm bị lỗi | `Hàng_thay_thế.md` |
| `70_Đại_lý/` | Đại lý・phí giới thiệu | `Đại_lý_và_giới_thiệu.md` |
| `75_Mẫu_kinh_doanh/` | Mẫu kinh doanh・mẫu thử nghiệm | `Mẫu_kinh_doanh.md` |
| `80_Màn_hình_vận_hành_và_doanh_nghiệp/` | TOP của Vận hành・quản lý mua hàng・đánh giá・màn hình doanh nghiệp・gửi thông báo・hạn chế truy cập | `Màn_hình_vận_hành_và_doanh_nghiệp.md` |
| `Bảng_phân_quyền_Web_vận_hành_20261003.md` | Vai trò Vận hành × chức năng | File này |
| `Định_nghĩa_nhập_xuất_CSV_20261003.md` | Quy tắc chung・cột của CSV | File này |
| `Liên_kết_ngoài_Danh_sách_luồng_lỗi_20261005.md` | Luồng lỗi liên kết bên ngoài | File này |
| `Thiết_kế_cơ_bản_Đề_xuất_định_nghĩa_tổng_thể_20261001.md` | Quy tắc chung của tất cả màn hình (đề xuất) | Có điểm bị sổ quyết định K ghi đè |
| `90_デモ確認/` | Ghi chép xác nhận demo cũ | Chỉ ở local (không đưa vào git) |

**Những thứ chưa có đặc tả riêng**: đặc tả chi tiết gửi thông báo (những điều đã quyết định ở `80_Màn_hình_vận_hành_và_doanh_nghiệp/Màn_hình_vận_hành_và_doanh_nghiệp.md` §5), master gói (`docs/議事録_仕様/プランマスタ_仕様まとめ.md` vẫn là chuẩn).

**Khi thêm mới**: quyết định của cuộc họp → `docs/決定の受付簿.md` → khi được chấp nhận thì chuyển vào sổ quyết định và file chuẩn của chủ đề đó. Không thêm file quyết định vào `00_Quyết_định/`.
