> **Đã đóng băng (bản gốc, 2026-10-05). Từ nay không cập nhật.** Các quyết định đang có hiệu lực xem tại `docs/決定台帳.md`. Nơi chuyển nội dung của file này và các quyết định đã bị thay thế xem mục "G" của sổ cái.

# Quyết định: Quy tắc danh sách (STEP7 · phản hồi của anh Long ngày 2026/10/01)

> Quyết định này ghi đè đề xuất (20 bản ghi · mới nhất trước · dữ liệu đã xóa không hiển thị trong danh sách) ở §10-2 của `Thiết_kế_cơ_bản_Đề_xuất_định_nghĩa_tổng_thể_20261001.md` (Thiết kế cơ bản).
> Căn cứ: phản hồi (tối 2026/10/01) cho §14-5 của STEP7 xác nhận toàn bộ demo. Theo các màn hình vận hành của Giai đoạn 1 (Dashboard · Quản lý doanh thu · Yêu thích. Hình ảnh `90_デモ確認/画像_STEP7_フェーズ1画面/`).

| # | Quy tắc | Quyết định |
|---|---|---|
| L1 | Số bản ghi mỗi trang | **10 bản ghi** (giống Giai đoạn 1: "10 bản ghi/trang") |
| L2 | Sắp xếp | Danh sách có "Sắp xếp", **có thể chọn thứ tự sắp xếp (theo mục) để sort** (cùng dạng với sắp xếp "Tổng số lượng" và "Số lượng bán" của Giai đoạn 1) |
| L3 | Dữ liệu đã xóa | **Cũng hiển thị trong danh sách**. Tuy nhiên điều kiện tìm kiếm mặc định là trạng thái đã chọn "**Không hiển thị dữ liệu đã xóa**". Khi đổi điều kiện thì dữ liệu đã xóa cũng được hiển thị |

## Những nội dung bị ghi đè

- Thiết kế cơ bản §10-2 "Số bản ghi 20", "Giá trị khởi tạo của thứ tự sắp xếp", "Dữ liệu đã xóa: không hiển thị trong danh sách", §10-3 "Xóa: không hiển thị trên màn hình", §13 #7 → đã sửa ngày 2026/10/01 (trước khi phản ánh: `01_仕様/履歴_20261001_STEP7一覧の決まり前/`)
- Tài liệu STEP7 S7-24 · S7-32 → đã có phản hồi

## Quy tắc chi tiết (2026/10/01 anh Long: "Vậy là được")

| # | Nội dung | Quyết định |
|---|---|---|
| L-1 | Số bản ghi có thể chọn | 10 / 20 / 50 (mặc định 10) |
| L-2 | Tăng dần / giảm dần | Chọn mục, có thể chuyển đổi giữa tăng dần / giảm dần |
| L-3 | Giá trị khởi tạo của sắp xếp | Ghi trong thiết kế màn hình của từng màn hình. Nếu không ghi thì là mới nhất trước (giảm dần theo ngày giờ cập nhật) |
| L-4 | Cách hiển thị dữ liệu đã xóa · có khôi phục được không | Hiển thị bằng huy hiệu trạng thái "Đã xóa". Không khôi phục (restore) |

## Phản ánh vào demo

- **v1.65 (2026/10/01)**: đã phản ánh vào danh sách dùng chung của khung ngoài demo vận hành (`patch_s7b_20261001.py`). Sắp xếp (mục + tăng dần/giảm dần), "Không hiển thị dữ liệu đã xóa" (mặc định BẬT), xóa logic
- Chưa: các màn hình trong iframe (Quản lý đơn đăng ký · Doanh nghiệp/Cơ sở/Hợp đồng · Dòng máy/Gói · Tùy chọn/Giảm giá · Thanh toán · Giao hàng · Menu · Đánh giá). Dòng máy/Gói · Tùy chọn/Giảm giá · Doanh nghiệp/Cơ sở/Hợp đồng hiện là: chọn 10/50/100 bản ghi, không có sắp xếp, dữ liệu đã xóa cũng hiển thị theo mặc định. Việc danh sách của Web doanh nghiệp có theo cùng quy tắc hay không là mục S7-36 của tài liệu STEP7
