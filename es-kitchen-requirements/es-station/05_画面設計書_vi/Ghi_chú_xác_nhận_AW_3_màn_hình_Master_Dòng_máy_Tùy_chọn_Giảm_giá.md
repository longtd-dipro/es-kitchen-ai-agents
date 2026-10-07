# Ghi chú xác nhận: Master Dòng máy・Master Tùy chọn・Master Giảm giá (Web vận hành) — Ghi chú rà soát trước khi viết Thiết kế màn hình

Ngày: 2026-10-05 ／ Người rà: Claude (cloud) ／ Nguồn: code (`app/ops/masters/_masters/*`, `lib/ops/masters/spec/{devices,options,discounts}.ts`, `lib/domain/seed/master.ts`), `docs/決定台帳.md` (B・E・F), Sổ tiếp nhận #13・16・18・19・21・38, `マスタ項目一覧` "Danh sách／Chỉnh sửa Master Dòng máy (64)" "Danh sách／Chỉnh sửa Master Tùy chọn (25)" "Danh sách／Chỉnh sửa Master Giảm giá (38)", `Tùy_chọn_và_Giảm_giá_Định_nghĩa_20261003.md`, `Quyết_định_STEP3_Bổ_sung_Thiếu_sót_Master_Tùy_chọn_Giảm_giá_20261001.md`, `運営Web_権限表`.

Quy ước: **[Q]** cần hong trả lời ／ **[Bài tập về nhà]** đã chốt, code chưa theo → Thiết kế màn hình theo quyết định + `demo_ok` ／ **[open]** chưa ai quyết ／ **[msg]** câu chữ message.

Ba màn này dùng chung `MasterList` / `MasterDetail` với Master Gói, nên các quyết định đã chốt ở Master Gói áp dụng luôn: Sắp xếp có (L2), lỗi dưới ô + hộp tổng hợp (P-FORMBOX), Xóa là xóa logic với Q01/E37, maxlength 60/500, Thuế suất từ Master Thuế suất, Xác nhận khi rời đi Q02, quyền (Bảng quyền).

---

## 1. Phạm vi và trạng thái

| Chức năng | Code | Màn hình | Trạng thái (dự kiến) |
|---|---|---|---|
| Master Dòng máy | AW_MODL (đề xuất) | 001 Danh sách ／ 002 Chi tiết ／ 003 Đăng ký・Chỉnh sửa | Danh sách 5 (ban đầu・0 kết quả・xác nhận xóa・không thể xóa・Nhập CSV) ／ Chi tiết 5 (thông tin cơ bản tủ lạnh RF000001・thông tin cơ bản máy bán hàng tự động VM000001・giá・điều kiện hợp đồng・cho thuê・lịch sử) ／ Đăng ký・Chỉnh sửa 5 (đăng ký mới thông tin cơ bản・đăng ký mới loại máy bán hàng tự động・đăng ký mới giá・lỗi nhập liệu・chỉnh sửa・hủy) |
| Master Tùy chọn | AW_OPTN | 001 ／ 002 ／ 003 | Danh sách 4 ／ Chi tiết 4 (thông tin cơ bản loại A OP000001・thông tin cơ bản không liên động OP000004・giá・xác nhận liên động・lịch sử) ／ Đăng ký・Chỉnh sửa 4 |
| Master Giảm giá | AW_DISC | 001 ／ 002 ／ 003 | Danh sách 4 ／ Chi tiết 3 (thông tin cơ bản・tính toán・điều kiện・áp dụng・lịch sử, mẫu DC000013) ／ Đăng ký・Chỉnh sửa 4 |

Quyền (Bảng quyền 2026-10-03, đã sửa dòng Quản lý Gói): Master Dòng máy = CRUD cho Quyền đầy đủ・Kinh doanh・Quản lý sản phẩm・Phát triển sản phẩm, R cho Kế toán・CS・Logistics. Tùy chọn・Giảm giá = Quyền đầy đủ CRUD, còn lại R.

## 2. Cần hong quyết [Q]

> 2026-10-05: hong nói "chạy tiếp hết" → Thiết kế màn hình bản 1.1 được viết theo **đề xuất** dưới đây (ghi trong `DECISIONS` của mỗi file dữ liệu với src "Claude đề xuất・chờ hong xác nhận"). Khi hong trả lời khác, sửa dữ liệu + Sổ quyết định F + `CHANGES` (bản 1.2). Q2 đã có quy tắc sẵn (Danh sách mục master, màn Danh sách #9: theo ngày giờ đăng ký mới nhất trước) nên dùng quy tắc đó, không hỏi nữa. Q9: theo nguyên tắc hong nêu ở Master Gói ("không có CSV chuyên dụng") → chỉ giữ 2 nút ở đầu Danh sách, bỏ nút trong tab.

1. **Screen Code**: `AW_MODL_001〜003` (Dòng máy), `AW_OPTN_001〜003` (Tùy chọn), `AW_DISC_001〜003` (Giảm giá). OK?
2. ~~Thứ tự mặc định của Danh sách~~ → đã có quy tắc: theo ngày giờ đăng ký mới nhất trước, sắp xếp được theo ID・Tên・Phân loại・Trạng thái・Ngày giờ đăng ký (Danh sách mục master, màn Danh sách #9). Không cần hỏi.
3. **Master Dòng máy - Nhà sản xuất**: Danh sách mục ghi Cần xác nhận "Master Nhà sản xuất hay giá trị cố định". Code: danh sách cố định theo Phân loại dòng máy (tủ lạnh/tủ đông: Hoshizaki・Panasonic・Fukushima Galilei; máy bán hàng tự động: Fuji Electric・Sanden; lò vi sóng: Panasonic・Sharp; hot warmer: Annaka・Taiji). Đề xuất: **giữ danh sách cố định** (thêm hãng = yêu cầu dev), không làm Master Nhà sản xuất ở phase 2.
4. **Công thức Số lượng chứa tối đa của máy bán hàng tự động** (Danh sách mục Cần xác nhận, kiểm tra tính nhất quán B10): đề xuất **= tổng Số lượng chứa của các ô đang hiệu lực** (Single 8=8, Single 10=10, Double 8=8, Double 10=10, Belt 5=5; ô vô hiệu không tính), tự tính, không nhập tay.
5. **Chạy lại Tạo layout**: đề xuất **xóa thiết lập cũ, đưa về Single 8 toàn bộ, có hỏi xác nhận trước** (Q01 dạng cảnh báo).
6. **Trạng thái hiệu lực của Dòng máy**: chỉ Hiệu lực／Vô hiệu (Đã xóa do thao tác xóa). OK?
7. **Nhiệt độ giữ ấm (hot warmer)**: đơn vị ℃. OK?
8. **Xóa Dòng máy**: đề xuất **không cho xóa khi Đang cho thuê > 0** (giống Gói: đang sử dụng thì không xóa được). Code hiện cho xóa (use luôn = 0).
9. **CSV Áp dụng Giảm giá**: code có 2 chỗ: nút "Nhập CSV áp dụng" "Xuất CSV áp dụng" ở header Danh sách (hong thêm 2026-10-05) và nút "Nhập CSV hàng loạt" trong tab Danh sách áp dụng của Chi tiết (chưa chạy). Đề xuất: **chỉ giữ ở header Danh sách** (1 chỗ cho mọi Giảm giá), tab Danh sách áp dụng chỉ còn Hiển thị cả phần đã kết thúc + bảng. Sổ quyết định 42 đã nói CSV ghi thẳng vào Hợp đồng con.

## 3. Code khác quyết định đã chốt → Thiết kế màn hình theo quyết định, code là bài tập về nhà

| # | Nội dung | Quyết định | Code |
|---|---|---|---|
| M1 | Dòng máy "Phí thuê hàng tháng (máy bán hàng tự động)" | **Không giữ** (Danh sách mục master 2026-10-05: phí thuê = phí hàng tháng của máy bán hàng tự động, OP000037 lấy từ đó; Sổ quyết định "Phí thuê của máy bán hàng tự động") | còn ô (non-active) trong tab Giá |
| M2 | Thuế suất (Dòng máy・Tùy chọn・Giảm giá) | Master Thuế suất, Quản trị hệ thống thêm được (Sổ quyết định E #9, Sổ tiếp nhận #38) | 2 lựa chọn cố định (H6) |
| M3 | Danh sách Giảm giá, cột Giá trị giảm | Số tiền cố định = yên, tỷ lệ = % (giới hạn trên ○ yên), chênh lệch tự động = "Tự động" (Danh sách mục) | hiện số thô "5" "3000" |
| M4 | UI Sắp xếp | có (L2) | không có (Sổ tiếp nhận #55) |
| M5 | maxlength, copy tên, check inline các quy tắc | như Master Gói (H3〜H5) | chưa |
| M6 | Dòng máy: Xóa khi Đang cho thuê | không cho xóa (E38, đề xuất Q8) | cho xóa |
| M9 | Giảm giá, Chi tiết, tab Danh sách áp dụng, nút "Nhập CSV hàng loạt" | bỏ (CSV chỉ ở đầu Danh sách) | còn nút |
| M10 | Dòng máy: Đăng ký mới máy bán hàng tự động, công thức Số lượng chứa tối đa, Tạo layout W04, Nhiệt độ giữ ấm ℃ | theo đề xuất Q4・Q5・Q7 | chưa |
| M11 | Dòng máy: khi Chỉnh sửa không đổi được Phân loại dòng máy | Thiết kế màn hình | code cho đổi |
| M12 | Tùy chọn: Đăng ký mới, Loại liên động chỉ "Không liên động" | 2026/09/28 | code cho chọn A |
| M13 | Giảm giá, Tính toán・Điều kiện: ô thay đổi theo lựa chọn (Tùy chọn đối tượng, Số tiền giới hạn trên của tỷ lệ, Gói tham chiếu, Số tháng áp dụng), chọn nhiều Gói đối tượng | Thiết kế màn hình | 1 ô chữ |
| M7 | Danh sách: cột Phân loại công khai trong Danh sách mục | Trạng thái công khai (thống nhất 2026/10/01) | code đúng; **doc** Danh sách mục, Danh sách còn ghi Phân loại công khai → sửa doc |
| M8 | Tùy chọn: Tên hiển thị trên hóa đơn OP000008 = Phí ban đầu, OP000016 = Phí thủ tục | Sổ quyết định (hong #3 2026-10-03) | seed đúng |

## 4. Chưa chốt với khách [open] (không chặn Thiết kế màn hình; là dữ liệu master)
- Danh sách Tùy chọn chưa có quyết định: OP000009 Phí giao lại, OP000012 Phí quản lý thiết bị (Sổ quyết định 56: chưa đưa vào master), OP000018 Lắp đặt chuẩn; giá trị 【tạm】 của nhiều OP (Định nghĩa §1-B/1-C, §5).
- Giảm giá DC000001/002/004/007〜012 có giữ không (Định nghĩa §9).
→ Thiết kế màn hình chỉ mô tả màn hình; dữ liệu nào tồn tại là việc nhập master.

## 5. Message [msg]
- Dùng lại bộ của Master Gói (E01/E04/E14/E37/Q01/Q02/S01/S02/I01/E31…). Chưa chọn Phân loại dòng máy → dùng E02 ("Hãy chọn {tên mục}.") thay vì message mới. Thêm 2 message mới (đề xuất, hong xác nhận): **E38** "Không thể xóa vì có {n} thiết bị đang cho thuê. Nếu muốn không cho chọn mới nữa, hãy đặt trạng thái hiệu lực là "Vô hiệu"." (Xóa Dòng máy・Q8), **W04** "Nếu tạo lại layout, loại chứa hiện tại và thiết lập hiệu lực・vô hiệu sẽ bị xóa. Bạn có muốn tạo lại không?" (Tạo layout・Q5). Loại A không cần message (code ẩn nút).

## 6. Kết quả (2026-10-05)
- Dữ liệu: `Dữ_liệu/AW_MODL_Master_Dòng_máy.py` (17 trạng thái), `AW_OPTN_Master_Tùy_chọn.py` (14), `AW_DISC_Master_Giảm_giá.py` (16). Sổ `Đầu_ra/Web_quản_trị_vận_hành_Master` bản **1.1** (Master Gói sửa theo 7 comment của hong + 3 chức năng mới).
- Chờ hong: Q1 (mã màn hình MODL/OPTN/DISC), Q3〜Q8 (đề xuất đã ghi), 2 message E38・W04, cách hiện "Giá trị giảm" ở Danh sách (tham chiếu Gói).
