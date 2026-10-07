# Mẫu kinh doanh・Mẫu thử nghiệm

> **Nguồn chuẩn của chủ đề này.** Ngày 2026-10-05, tổng hợp lại từ các nguyên bản và quyết định bên dưới, chỉ viết mới những nội dung "hiện đang có hiệu lực".
> Các quyết định đang có hiệu lực nằm ở `docs/決定台帳.md` (F "Mẫu thử nghiệm" và các mục khác). Nếu có khác biệt thì sổ quyết định (台帳) là chuẩn.
> Nguyên bản (đã đóng băng, chỉ để xem lại quá trình): `docs/議事録_仕様/サンプル_仕様まとめ.md`, `00_Quyết_định/Quyết_định_STEP1_Trả_lời_Đăng_ký_và_Mẫu_20261001.md` (Mẫu kinh doanh), `Quyết_định_STEP3_Trả_lời_phần_còn_lại_và_đóng_STEP1_20261001.md` (T4).

## 1. Chủng loại

| Chủng loại | Là gì | Giai đoạn 2 |
|---|---|---|
| **Mẫu kinh doanh** | Hàng dùng thử gửi cho khách hàng tiềm năng | **Quản lý trên hệ thống** (§2 bên dưới) |
| **Mẫu thử nghiệm** (lưu giữ・dự phòng thử nghiệm・ăn thử) | Dùng nội bộ trong ES Kitchen | **Giữ nguyên cách làm hiện tại**: đặt hàng bình thường từ cơ sở・hợp đồng dành cho ES Kitchen (qua hợp đồng). Không làm cờ "Sản phẩm do ES sản xuất" và không làm tự động tạo |
| Mẫu đặc biệt của nhà máy・liên kết với sản xuất | — | Tương lai |
| Chỉnh sửa lịch sử thực hiện chiến dịch・tỷ lệ thành công | — | Không làm (2026/07/08) |

- Không làm trạng thái khách hàng "Mẫu" và "Dùng thử miễn phí" (dùng thử được thể hiện bằng hợp đồng. Mẫu thì lưu lịch sử ở địa chỉ nhận).

## 2. Mẫu kinh doanh

| # | Quy định | Căn cứ |
|---|---|---|
| 2-1 | Tiếp nhận được nhập **trong hệ thống**. Là **đăng ký đơn giản chuyên dụng cho mẫu** trên Web Vận hành. Chỉ nhập **địa chỉ nhận** (không tạo doanh nghiệp・cơ sở・hợp đồng) | STEP1 (2026/10/01) |
| 2-2 | **Số lượng được quyết định theo từng menu** (trên màn hình tạo menu. Mặc định 60 mẫu/tháng = 15 mẫu × 4・có thể thêm・có thể sửa đến khi menu được công khai 〈chốt〉). Bỏ việc cố định 15 mẫu mỗi tuần | MM 2026/10/02, RD-MN-045 |
| 2-3 | Sản phẩm dùng cho mẫu kinh doanh được quyết định bằng ô chọn "Mẫu kinh doanh" trên màn hình master sản phẩm / tạo menu | 2026/06/26 |
| 2-4 | Số lượng: 1 mẫu = 1 địa chỉ nhận | T4-4 |
| 2-5 | **Ngày xuất hàng**: nhập ngày giao hàng, tính ngược từ lead time. Nếu rơi vào ngày không thể picking thì đẩy sớm lên ngày có thể picking ngay trước đó, và **ngày giao hàng cũng dịch chuyển bằng đúng số ngày đó** (giống giao hàng theo hợp đồng) | Yêu cầu dòng 182, T4-5 |
| 2-6 | **Kho picking**: nếu kho xử lý sản phẩm đó chỉ có một thì dùng kho đó. **Nếu có nhiều kho thì bộ phận vận hành chọn** (kho không giữ khu vực phụ trách). Nếu sản phẩm chỉ có ở một trong các kho thì tách theo từng kho | Q-E (tối 2026/10/01), STEP1 |
| 2-7 | Lead time là giá trị do bộ phận vận hành nhập (theo từng kho). Là 【tạm】 cho đến khi nhận được giá trị thực tế | T4-1, STEP4 D2 |
| 2-8 | **Danh sách và xuất CSV**. Lịch sử theo từng địa chỉ nhận | 2026/08/19, STEP1 |
| 2-8b | **Không liên kết với doanh nghiệp** (dù công ty đó đăng ký sau này cũng không kế thừa). Những điều biết được sau này thì ghi vào ô ghi chú | Sổ quyết định N (hong 2026-10-05) |
| 2-9 | **Sau khi chốt tiếp nhận vẫn có thể thêm.** Tuy nhiên phần thêm sau khi chốt **không tạo chỉ thị xuất hàng** | 2026/08/19 |
| 2-10 | Phần dư sau khi chốt được trả về ES bằng chỉ thị xuất hàng hoàn kho (`60_Tồn_kho/Tồn_kho.md` §2-6) | Yêu cầu dòng 99 |
| 2-11 | Được tính vào số lượng cần đặt hàng (số lượng cần = đơn hàng của hợp đồng + dùng thử + mẫu kinh doanh). Phần tăng thêm sau khi chốt thì đặt hàng bổ sung | `55_Đặt_hàng_Nhập_mua_Nhập_kho/Đặt_hàng_Nhập_mua_Nhập_kho.md` §1・§2 |

## 3. Những điều chưa quyết định

| # | Nội dung | Trạng thái |
|---|---|---|
| U2 | Giá trị thực tế của lead time mẫu | Chờ xác nhận với khách hàng |
| U3 | Cách tính ngày nhận sớm nhất của mẫu (ước lượng bằng tỉnh/thành → lead time. Yêu cầu dòng 98) | Vẫn là đề xuất |
