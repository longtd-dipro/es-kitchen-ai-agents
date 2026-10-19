# Doanh nghiệp · Cơ sở · Hợp đồng — digest ES-STATION
> Nguồn: `20_Doanh_nghiệp_Cơ_sở_Hợp_đồng/Form_đăng_ký.md` · `20_.../Đặc_tả_hợp_đồng/README.md` · `Hợp_đồng_00_Quy_tắc_cơ_bản.md` · `Hợp_đồng_01_Trục_thời_gian_bản_sao_và_tính_nhất_quán.md` · `Hợp_đồng_02_Màn_hình_danh_sách.md` · `Hợp_đồng_03_Doanh_nghiệp_Mục_màn_hình.md` · `Hợp_đồng_04_Cơ_sở_Mục_màn_hình.md` · `Hợp_đồng_05_Hợp_đồng_con_Mục_màn_hình.md` · `Hợp_đồng_06_Chi_tiết_thanh_toán_Mục_màn_hình.md` (không có file 07 và 99 trong thư mục) · Trạng thái: **chuẩn** (Form_đăng_ký và thư mục Đặc_tả_hợp_đồng đều ghi là chuẩn; sổ quyết định `docs/決定台帳.md` thắng nếu mâu thuẫn; các tài liệu cũ về form đăng ký bị đóng băng) · Digest tạo: 2026-10-08

Ký hiệu nguồn: **HĐ00/01/02/03/04/05/06** = các file `Hợp_đồng_NN` (契約_NN); **FĐK** = `Form_đăng_ký.md`; số `28-xx`, `K1..K16`, `A1..A12`, `Q1..Q15` là mã quyết định trong tài liệu.

## 1. Phạm vi & actors
- **Web vận hành (AW_)**: sửa doanh nghiệp, cơ sở, hợp đồng cha, hợp đồng con, thiết bị, thanh toán; tiếp nhận đăng ký (Quản lý yêu cầu hợp đồng > tab "Hợp đồng mới") [FĐK §10, HĐ02].
- **Web doanh nghiệp (CW_)**: "Đăng ký mới" (chưa đăng nhập), "Thêm cơ sở" (đã đăng nhập; cả tài khoản doanh nghiệp và tài khoản cơ sở) [FĐK §2]; xem/sửa một phần thông tin DN, cơ sở theo cột "Hiển thị cho DN" [HĐ03, HĐ04]. Chỉ thấy danh sách cơ sở/hợp đồng của chính DN mình [HĐ02 Chung #10].
- **App người dùng (nhân viên mua hàng)**: chỉ chịu ảnh hưởng của trạng thái hợp đồng (mua được/không) [HĐ01 §6-4]. Không có app tài xế, Web NCC, Web công ty vận chuyển trong nhóm này.
- Người thao tác: Vận hành (CS, nhân viên kinh doanh ES), người phụ trách chính/thanh toán/phụ của DN và cơ sở. Đăng nhập là **tài khoản dùng chung** (1 tài khoản DN/DN, 1 tài khoản cơ sở/cơ sở), không theo từng người [HĐ03 #7, HĐ04 Tài khoản].
- Không có chức năng "Đăng ký mới" hay "Xóa" ở danh sách DN/cơ sở/hợp đồng con; chỉ xuất CSV; tạo mới chỉ qua đăng ký → tiếp nhận [HĐ02 Chung #1,#3; FĐK §1].

## 2. Thuật ngữ & định danh
| Thuật ngữ Việt | Gốc Nhật / tên vật lý | Nghĩa ngắn |
|---|---|---|
| Hợp đồng cha | 親契約 / `contract_no` | Số không đổi `CP`+số (tối thiểu 6 chữ số); 1-1 với cơ sở [HĐ04 Hợp đồng cha #8; HĐ01 §6-1] |
| Hợp đồng con | 子契約 / `monthly_no` | 1 bản ghi cho mỗi Chu kỳ giao hàng; ID `CP000001-202607` (hợp đồng cha + tháng chu kỳ) [HĐ05 #1] |
| Chu kỳ / tháng chu kỳ | cycle_month | Chu kỳ 4 tuần A1..D7, A1 luôn là thứ Hai; **tháng chu kỳ = tháng chứa ô thứ 14 (B7)** [HĐ00 §0.3] |
| ID doanh nghiệp / cơ sở | `company_code`, `branch_code` | `CU`+số thứ tự (CU00001, CU00643); không cố định số chữ số [HĐ03 #7, HĐ04 #8] |
| ID người dùng ES cũ | `legacy_user_id` | Dạng ES000001 của Phase 1; chỉ tham chiếu, tìm được, có trong CSV [HĐ04 #9] |
| ID gói mới | ES+6 chữ số | Phân biệt với ID người dùng ES cũ [HĐ04 #9] |
| Số tiếp nhận | `AP-YYYYMMDD-NNNN` (đăng ký mới), `CH-yyyymmdd-nnnn` (đơn thay đổi) | `AP-` chỉ là số tiếp nhận, ID áp dụng đã bỏ (K7) [FĐK §0-3; HĐ04 Lịch sử đơn #1] |
| ID cho mượn | `LN-0001` | 1 dòng cho mượn thiết bị ở cơ sở [HĐ04 Danh sách cho mượn #1] |
| Mã dòng máy / tùy chọn / giảm giá | RF/FZ/VM/MW/HW/BX+6 số; OP+6 số; DC+6 số | Master (nhóm khác) [HĐ04 #3; HĐ05] |
| Loại hợp đồng | 本導入 / chiến dịch dùng thử | Tên thống nhất "Chính thức (本導入)" (K14) [FĐK §0-3] |
| Người nhận hóa đơn | `bill_to` | Doanh nghiệp / Cơ sở này; **chỉ cơ sở nắm giữ** [HĐ00 §0.5] |
| Lead time phát hành hóa đơn | `billing_lead_months` | −3,−2,−1,0,+1 (+1 = trả sau); tháng thanh toán = tháng chu kỳ + giá trị này; mặc định −1 [HĐ03 Thanh toán #1] |
| Hạn thanh toán | `due_rule` | Ngày 27 của tháng thanh toán hoặc ngày 27 của tháng sau [HĐ03 Thanh toán #7] |
| ① / ② / ③ | Số tiền cố định (trả trước) / Quyết toán theo thực tế (trả sau) / Chi tiết điều chỉnh | 3 bảng thanh toán của hợp đồng con [HĐ06 §0.8] |
| Biến động thiết bị | `loan_move` | Đăng ký ở hợp đồng con (cho mượn mới/thêm/thu hồi/đổi dòng máy) [HĐ05 Tab Thiết bị #2] |
| Chế độ khách | `allow_guest` | Khách chưa đăng ký nhân viên vẫn mua được; phí tùy chọn OP000003 [HĐ05; HĐ01 §4] |
| ES-QR | `allow_esqr`, OP000002 | Có phí hàng tháng, chỉ Vận hành bật/tắt [HĐ05 Thiết lập app #5] |

## 3. Quy tắc nghiệp vụ đã chốt (BA không được mâu thuẫn)
**Cấu trúc & sở hữu dữ liệu**
1. Màn hình: DN 4 tab; Cơ sở 5 tab (kèm hợp đồng cha); Hợp đồng con 4 tab; không có màn hình hợp đồng riêng [HĐ00 §0.1].
2. Hợp đồng cha giữ thứ không đổi (loại, trạng thái, bắt đầu/kết thúc, mã đại lý...); mọi thứ đổi hàng tháng (gói, course, giao hàng, giá, thiết bị, thanh toán) thuộc hợp đồng con [HĐ00 §0.2].
3. Thay đổi cho tháng sau = sửa hợp đồng con tháng sau, không sửa hợp đồng cha. Không có ô "tháng áp dụng"; khi lưu hiện hộp thoại "Chỉ hợp đồng con này / Tất cả từ đây trở đi" (chỉ hiện nếu đã có hợp đồng con phía sau); kết quả lưu vào cột "Phạm vi áp dụng" của lịch sử [HĐ00 §0.2; HĐ05 #4].
4. "Tất cả từ đây trở đi" cập nhật cả nguồn tạo (cơ sở/hợp đồng cha/gói) và hợp đồng con chưa xác định; **hợp đồng con đã xác định/đã thanh toán không bị sửa** [HĐ00 §0.2].
5. Khi có đơn đang chờ phê duyệt: không sửa trực tiếp các mục thuộc đơn ở hợp đồng con của cơ sở đó; khi phê duyệt, nếu "giá trị trước thay đổi" ≠ giá trị hiện tại thì dừng phê duyệt cho Vận hành xác nhận [HĐ00 §0.2; HĐ01 §1].
6. Thiết lập sử dụng app (tiền mặt, giới hạn/ngày, giới hạn/tháng, chế độ khách, ES-QR) do hợp đồng con nắm theo từng tháng chu kỳ. Tiền mặt người dùng và ES-QR chỉ Vận hành đổi; Web DN sửa giới hạn/chế độ khách có hiệu lực cho mọi hợp đồng con từ chu kỳ hiện tại trở đi [HĐ00 §0.1; HĐ05].
7. Thiết bị cho mượn do **cơ sở** sở hữu (xem), đăng ký ở **hợp đồng con**; giữ 3 giá trị số lượng cho mượn/đã trả/chưa trả; số cá thể chưa bắt buộc; việc cho mượn tiếp tục qua chuyển dùng thử→chính thức và tạm dừng [HĐ00 §0.6; HĐ04].
8. Không để cùng một thứ sửa được ở 2 nơi (dòng máy, số máy, giá) [HĐ00 §0.6].

**Tạo hợp đồng con**
9. 1 Chu kỳ = 1 hợp đồng con, không tách khi vắt qua tháng dương lịch. Số tiền gói cố định và giới hạn cung cấp hàng tháng tính theo **tháng chu kỳ**; giao từng phần/giao lại/đột xuất tính theo tháng dương lịch của ngày giao [HĐ00 §0.3].
10. Batch hằng ngày tạo các Chu kỳ chưa tạo đã qua ngày chuẩn: thanh toán trong tháng = ngày bắt đầu đặt hàng của Chu kỳ; trả trước 2 tháng = tạo trước 2 tháng; trả theo năm = tạo gộp 12 Chu kỳ lúc bắt đầu/gia hạn [HĐ00 §0.3].
11. Chính thức: tự gia hạn, tạo từng Chu kỳ. Dùng thử: không tự gia hạn, chỉ tạo đúng số tháng chỉ định. Cả hai có nút "Tạo hợp đồng con trước" (chọn tháng, xem trước danh sách, tạo "N mục", không tạo lại tháng đã có; chọn tối đa 12 tháng sau tháng này; tự động tạo đến chu kỳ hiện tại + 4 tháng) [HĐ00 §0.3; HĐ04 Danh sách hợp đồng con #19].
12. Ngày 25 hằng tháng (xác nhận thanh toán) phát hiện hợp đồng đang hiệu lực mà thiếu hợp đồng con của tháng thanh toán → đưa vào "Cần xác nhận" [HĐ00 §0.3].
13. Phê duyệt hủy/tạm dừng → hủy các hợp đồng con tạo trước chưa xác định từ tháng áp dụng trở đi, hiển thị số lượng bị hủy; tháng kết thúc hợp đồng = tháng giao hàng cuối [HĐ00 §0.3; HĐ04 #4].
14. Bản sao: hợp đồng con sao chép khi tạo (gói/course/giao hàng, thế hệ giá, thuế suất, người nhận hóa đơn, lead time, phương thức/chu kỳ thanh toán) và chốt ở xác nhận ngày 25; tên người nhận/nơi gửi hóa đơn chốt **khi phát hành** (mùng 1) [HĐ01 §2; HĐ05 Tab Phí-Thanh toán].

**Dùng thử / chính thức**
15. Chuyển dùng thử→chính thức trên **cùng hợp đồng cha, không cấp số mới**; hợp đồng cha có "lịch sử loại hợp đồng"; thời gian sử dụng tối thiểu, phạt, tự gia hạn tính từ ngày bắt đầu chính thức [HĐ00 §0.4; HĐ01 §6-1].
16. Dùng thử: mặc định 1 tháng; chỉ Vận hành kéo dài (chưa giới hạn số lần/tháng); DN không đặt hàng được (hệ thống tự tạo đơn chia tỷ lệ toàn sản phẩm); gói mặc định Lite; **không có thời gian sử dụng tối thiểu, không phạt** [HĐ00 §0.4; FĐK §10-4, §11].
17. Dùng thử giảm giá DC000013 = phí gói 50·tủ lạnh·Lite (¥24,500), không vượt số tiền thanh toán, **1 lần/doanh nghiệp** (người nhận hóa đơn theo cơ sở thì gắn vào cơ sở đầu tiên); nhiều cơ sở/đổi gói/kéo dài thì trả phần chênh lệch; **phần kéo dài không giảm giá** (K1) [HĐ00 §0.4; FĐK §8].
18. Có khoảng trống giữa dùng thử và chính thức → hợp đồng cha "Tạm dừng sử dụng" (K2); tổng khoảng trống quá 1 năm thì là đăng ký mới (28-37); thiết bị dùng thử nhiều hơn chuẩn gói → tính chênh lệch 1 lần ở hóa đơn chính thức đầu tiên, ít hơn không hoàn tiền; không tính chênh lệch gói (K10) [HĐ00 §0.4; FĐK §12].
19. Thời gian sử dụng tối thiểu theo từng thiết bị (master dòng máy): tủ lạnh 3 tháng, máy bán hàng tự động 12 tháng; tính từ ngày cho mượn; phạt tính theo từng thiết bị rồi cộng; ngày cho mượn trống (dữ liệu chuyển đổi) → giá trị ước tính theo tháng bắt đầu hợp đồng ban đầu [HĐ00 §0.6; HĐ04 Cho mượn #8,#13,#14; HĐ01 §9].

**Thanh toán (thuộc nhóm này)**
20. Người nhận hóa đơn chỉ cơ sở nắm; đơn vị phát hành hóa đơn (gộp/từng cơ sở) chỉ DN nắm và DN chỉ xem, Vận hành sửa; phương thức/chu kỳ/hạn thanh toán/Bill One theo bên mà người nhận hóa đơn chỉ đến; lead time DN là mặc định, cơ sở ghi đè chỉ khi người nhận hóa đơn = cơ sở [HĐ00 §0.5; HĐ03; HĐ04 Thanh toán].
21. Cơ sở có thể gửi yêu cầu đổi người nhận hóa đơn, bắt buộc Vận hành phê duyệt (K9) [HĐ04 Thanh toán #1].
22. Tên DN có 3 loại; lùi theo thứ tự: tên DN người nhận hóa đơn → tên DN (hợp đồng) → tên DN [HĐ00 §0.5].
23. Hóa đơn: chốt ngày 25 tháng trước, phát hành bằng Bill One ngày 1 tháng thanh toán; hệ thống không hiển thị/tải PDF; trạng thái Đã tạo → Đã chốt → Đã phát hành → (Đã chuyển kỳ / Đã hủy); mỗi hóa đơn chỉ sửa sai bằng 1 cách [HĐ03 Danh sách hóa đơn #2,#13,#14; HĐ01 §3].
24. ① kỳ đối tượng = 1 chu kỳ; ② kỳ 21 tháng trước đến 20 tháng này, chốt ngày 20, xác nhận ngày 25, tháng thanh toán = tháng sau tháng chu kỳ. Số tiền giữ chưa thuế; thuế tính theo từng hóa đơn·thuế suất, làm tròn 四捨五入 (số âm theo giá trị tuyệt đối); số thuế của DN là chuẩn [HĐ06 §0.8].
25. Thay đổi liên quan tháng đã xuất hóa đơn (trả trước 2 tháng, theo năm) → hệ thống tự tạo **dòng điều chỉnh** theo chênh lệch từng tháng chu kỳ (phương án A), tất toán ở hóa đơn kế tiếp; không tính theo ngày; sửa giá thanh toán theo năm = giữ giá hiện tại đến tháng khởi tính kế tiếp [HĐ01 §1-1; HĐ06 ③].
26. Tháng áp dụng: đăng ký trước hạn chót order (mặc định ngày 15 tháng trước) → từ chu kỳ tháng sau; quá hạn → từ tháng sau nữa. Thiết lập có phí (ES-QR...) cũng theo quy tắc này; **chế độ khách là ngoại lệ**: dùng ngay khi lưu (hộp thoại xác nhận tháng bắt đầu tính phí), phí OP000003 tính từ tháng đầu theo quy tắc hạn chót (K3=A) [HĐ01 §4].

**Tạm dừng, hủy, tài khoản**
27. Tạm dừng: không tạo hợp đồng con, **không tất toán thực tế**; kiểm kê đầu kỳ tạm dừng do **khách hàng** làm trên Web DN, tháng của lần giao cuối trước tạm dừng; chênh lệch bù ở kiểm kê khi mở lại/hủy. Giới hạn tổng 1 năm; ngày kết thúc tạm dừng bắt buộc [HĐ01 §5; HĐ04 Tạm dừng #15].
28. Tạm dừng chỉ dừng đếm thời gian sử dụng tối thiểu với thiết bị **để nguyên tại chỗ**; thiết bị đã thu hồi tính lại từ ngày lắp đặt lại. Để nguyên: không phí lưu kho, không lập ngày trả [HĐ01 §5; HĐ04 Tạm dừng #18].
29. Trạng thái cơ sở chỉ lưu: Đăng ký tạm / Đăng ký chính thức / Dự kiến đóng / Đã đóng; "Đang tạm dừng" chỉ **hiển thị** từ hợp đồng cha + lịch sử tạm dừng [HĐ01 §6-2; HĐ04 #6].
30. Trạng thái hợp đồng chỉ chuẩn ở hợp đồng cha; hợp đồng con chỉ tham chiếu [HĐ04 Hợp đồng cha #2].
31. Tài khoản: hiệu lực/đình chỉ do chính tài khoản giữ; có hiệu lực trước ngày bắt đầu order của chu kỳ đầu; đình chỉ ngày sau hạn thanh toán của hóa đơn cuối [HĐ01 §6-3].
32. Quyền truy cập theo trạng thái (A1, A2 đã chốt): đang tạm dừng (thiết bị để nguyên) → app cá nhân **vẫn mua được**, Web DN chỉ xem + đổi người phụ trách; tạm dừng (đã thu hồi thiết bị) → không mua; đến hết ngày hủy hợp đồng bình thường; sau ngày hủy đến hạn thanh toán hóa đơn cuối → Web chỉ xem, app không mua; sau hạn → không đăng nhập [HĐ01 §6-4].
33. Hủy hợp đồng: ngày dự kiến trả thiết bị mặc định = ngày dừng + 1 tháng; batch hằng ngày phát hiện "ngày dự kiến trả < hôm nay và chưa trả > 0" vào danh sách Vận hành; **không tạo** thanh toán/tiền bồi thường cho thiết bị chưa trả [HĐ00 §0.6].
34. Không hiển thị trên Web DN: lịch sử thay đổi, toàn bộ tab Giá·Thanh toán của hợp đồng con, thiết lập tuyến giao hàng, tài liệu nội bộ, mã đại lý, ghi chú nội bộ, nhân viên kinh doanh ES, ID Bill One, tiền mặt người dùng [HĐ00 §0.10].

**Form đăng ký / tiếp nhận**
35. Luồng: Gửi (Đang tiếp nhận) → hoàn tất xác nhận nội dung = **Đăng ký tạm** (tạo DN mới, cơ sở, hợp đồng cha, hợp đồng con chu kỳ đầu, tài khoản, đơn hàng, bộ khởi tạo vật tư) → thiết lập thông tin chi tiết → "Xác định cơ sở này" = **Đăng ký chính thức** (tạo hợp đồng con, lịch, dữ liệu giao hàng); tất cả cơ sở xong = Hoàn tất [FĐK §1, §10-2, §13].
36. Đăng ký tạm không chỉnh ở màn hình DN/hợp đồng (chỉ xem; nút "Chỉnh sửa bằng đơn đăng ký"); sau đăng ký chính thức mới sửa ở màn hình DN/cơ sở (28-146) [HĐ02 Chung #7; FĐK §10-2].
37. Loại thiết bị chọn 1 trong 2 mỗi cơ sở: tủ lạnh·tủ đông / máy bán hàng tự động. Máy bán hàng tự động: từ gói 100 trở lên, cố định ES Lite (máy bán hàng tự động) và giao hàng ES, tầng lắp đặt bắt buộc, hiển thị báo giá ước tính kèm ghi chú khảo sát hiện trường (A3); **dùng thử không chọn được máy bán hàng tự động** [FĐK §4-2, §4-8].
38. Tháng bắt đầu chỉ chọn năm-tháng; trước hạn chót → từ tháng sau, sau hạn chót → từ tháng sau nữa; phê duyệt sau hạn chót Vận hành chọn "Dời sang chu kỳ sau" hoặc "Vận hành đặt hàng thay" (A1) [FĐK §4-2, §10-5].
39. Số lần giao hàng chính thức: chuẩn gói / +1 / +2, phần vượt tính OP000001 (¥3,000/lần/tháng); dùng thử cố định chuẩn gói; không được lưu 0 lần (lạnh ≥1; ES Standard đông lạnh ≥1) [FĐK §4-2; HĐ05 Tuyến giao hàng #7].
40. Khách không chọn mẫu/chu kỳ giao hàng, kho picking; Vận hành thiết lập ở bước tiếp nhận (kho picking bắt buộc); nguyện vọng ghi qua ghi chú (≤500) [FĐK §4-5, §10-2; HĐ05].
41. ES-QR không cho chọn khi đăng ký (A7); OP000013 bị bãi bỏ; "Cách xử lý sản phẩm hạn ngắn" chốt lúc đăng ký, sau đó chỉ Vận hành đổi [FĐK §4-2, §4-4].
42. Người đăng ký chưa đăng nhập: chọn 1 người từ danh sách người phụ trách (A2); DN bắt buộc ≥1 chính + 1 thanh toán; cơ sở bắt buộc 1 chính (+ thanh toán nếu nơi thanh toán = cơ sở) [FĐK §5-2,§5-3,§4-7; HĐ03].
43. Đồng ý: chính thức = Điều khoản + Chính sách bảo mật; dùng thử = thêm Điều khoản chiến dịch (A5=B). Khi gửi, vô hiệu nút đến khi có số tiếp nhận [FĐK §6].
44. Từ chối bắt buộc lý do; từ chối/rút lại sau đăng ký tạm → hủy đơn hàng + bộ khởi tạo, cơ sở/hợp đồng cha/hợp đồng con/DN mới = "Hủy bỏ", tài khoản tạm dừng (A12) [FĐK §10-7].
45. Quy tắc nhập chung: 1 dòng ≤60, địa chỉ ≤255, ghi chú ≤500, email ≤60 (K8), đính kèm JPG/PNG/PDF/HEIC 5MB ≤10 tệp, vượt ký tự là lỗi [FĐK §9-1].
46. Mua đứt món ăn kèm (`souzai_buyout`) BẬT → ngoài quản lý tồn kho/kiểm kê/hao hụt; chỉ Vận hành [HĐ05 Hợp đồng #8].

## 4. Trạng thái & dữ liệu chính
- **Đơn đăng ký (FĐK §1)**: Đang tiếp nhận → Đang thiết lập hợp đồng → Hoàn tất; ngoài ra Từ chối, Đã rút lại. Vận hành chuyển.
- **Doanh nghiệp**: Đăng ký tạm / Đăng ký chính thức / Ngủ đông (HĐ03 #8); danh sách ghi "Ngừng hoạt động" (HĐ02) — hai tài liệu dùng tên khác nhau.
- **Cơ sở** (lưu): Đăng ký tạm / Đăng ký chính thức / Dự kiến đóng / Đã đóng. Phê duyệt hủy → Dự kiến đóng, đến ngày hủy → Đã đóng [HĐ04 #6].
- **Hợp đồng cha**: Đăng ký tạm / Có hiệu lực / Đang làm thủ tục hủy / Dừng / Tạm dừng sử dụng / Kết thúc [HĐ04 Hợp đồng cha #2].
- **Lịch sử tạm dừng**: Dự kiến tạm dừng → Đang tạm dừng → Đã tái khởi động (tự đổi theo tháng chu kỳ) [HĐ04 #13].
- **Cho mượn thiết bị**: Đang giao / Đang cho mượn / Đang yêu cầu thu hồi / Đã thu hồi (mặc định ẩn) / Chưa trả [HĐ04 #11].
- **Trạng thái thanh toán hợp đồng con**: Vận hành 5 bước (Đã tạo·chưa tổng hợp / ①② đã xác định / Cơ sở đã xác định / DN đã xác định / Đã xuất hóa đơn–Đã thanh toán); Web DN 3 bước (Chưa xác định / Đã xác định / Đã xuất hóa đơn) [HĐ02 hợp đồng con #10; HĐ04 #10]. Tài liệu dùng lẫn "Đã thanh toán" và "Đã xuất hóa đơn" ở bước cuối.
- **Hóa đơn**: Đã tạo / Đã chốt / Đã phát hành / Đã chuyển kỳ / Đã hủy [HĐ03 #13].
- **Trạng thái duyệt từng cơ sở trong đơn thay đổi**: Chờ phê duyệt / Đã phê duyệt / Từ chối / Đã rút lại (DN chỉ rút được cơ sở Vận hành chưa xử lý) [HĐ04 Lịch sử đơn #7,#10].
- **Thực thể**: `company`, `branch`, `contract` (cha), `contract_monthly` (con), `contract_suspension`, `loan` / `loan_move`, `month_option` / `apply_move`, `fee_line` (①②), dòng điều chỉnh (③), `invoice`/`invoice_line`, `branch_staff`/`contact`, `application`/`application_item`, `branch_attachment`, `branch_history`/`contract_history`/`contract_monthly_history`.
- Số mục màn hình: DN 62, cơ sở 123, hợp đồng con 73, chi tiết thanh toán 22 [HĐ03..06 tiêu đề].

## 5. Liên kết với nhóm khác & hệ thống ngoài
- **30_Đơn_yêu_cầu**: 8 loại đơn thay đổi (đổi gói/giao hàng/thiết bị/thông tin cơ sở/DN, tạm dừng, tái khởi động, hủy) và phê duyệt: `Đơn_yêu_cầu_và_phê_duyệt.md` [FĐK §0-1; HĐ04 Lịch sử đơn #2].
- **40_Master_Phí_Thanh_toán**: Quy tắc thanh toán v1 (chốt kỳ, tạm dừng, thuế), master gói/dòng máy/tùy chọn/giảm giá; gói và thế hệ giá lấy từ master gói [HĐ README; HĐ05 #6].
- **Giao hàng, đơn hàng, tồn kho/kiểm kê (10, 50, 60)**: tạo dữ liệu giao hàng khi đăng ký chính thức; tuyến giao hàng (kho picking, công ty vận chuyển, trung chuyển) nằm ở hợp đồng con [FĐK §10-2; HĐ05].
- **Hệ thống ngoài**: **Bill One** (phát hành hóa đơn/PDF, ID nơi phát hành) [HĐ03 #8,#14]; **THOMAS** (kho, Q9 chưa chốt) [HĐ01 §7]; **HubSpot** (đăng ký tư vấn, email dùng thử; tìm kiếm HubSpot từ màn hình ký hợp đồng hoãn) [HĐ00 đầu file; FĐK §14]; URL đặt lịch khởi động `booking.receptionist.jp/kickoff-mtg-schedule/60min` [FĐK §7]; **Yamato/Sagawa** chỉ là ví dụ nhà vận chuyển. Không có Cognito trong nhóm này.
- CSV chuyển đổi khách Giai đoạn 1 (~600 công ty) tạo trực tiếp ở trạng thái đang sử dụng, giữ ID Giai đoạn 1: phương án cột ở `CSV_chuyển_đổi_Đề_xuất_cột_20261003.md` (ngoài nhóm) [HĐ01 §9-1]. Quy tắc nhập CSV chung: `Định_nghĩa_nhập_xuất_CSV_20261003.md` [FĐK §10-8].

## 6. Điểm mở / Cần xác nhận / mâu thuẫn
- **REQ-CT-144**: hiểu "1 tháng" sau hủy là thời gian gia hạn thu hồi thiết bị (ngày trả = ngày dừng + 1 tháng) — **chờ khách hàng xác nhận** [HĐ00 §0.6; HĐ01 §6-4, §10].
- **Q9**: kho (THOMAS) có nhận phiên bản chỉ thị xuất hàng mới vào ngày trước ngày xuất không; nếu không, rút ngắn hạn đổi ngày sau hạn chót [HĐ01 §7, §10].
- **Q13**: phí giao hàng bổ sung vật tư ¥1,000 (STEP4 O-3) hay ¥2,000 (STEP5 §2-5) — tạm lấy ¥2,000, số tiền xác nhận khách hàng [HĐ01 §10].
- **A9 / `_OPEN一覧` 1003-10**: trùng lặp 4 tùy chọn lắp đặt (hỗ trợ lắp đặt ban đầu miễn phí, gói giao hàng·lắp đặt ¥7,800, OP000007, OP000019/020) — đang xác nhận khách hàng [FĐK §4-4, §17].
- Đơn vị phát hành hóa đơn: việc có bãi bỏ chính đơn vị phát hành hay không **chưa quyết** [HĐ03 Thanh toán #2].
- Chưa quyết nơi lưu và hiển thị chi tiết quy tắc tính chênh lệch dòng điều chỉnh (đã chọn phương án A nhưng cần ghi quy tắc tính theo tháng chu kỳ) [HĐ01 §1-1]; dòng điều chỉnh, hủy thanh toán lại, tên người nhận lúc phát hành (Q5) "chưa phản ánh" vào Quy tắc thanh toán [HĐ01 §11].
- Quy tắc thanh toán v1 3-4 (thời gian tối thiểu chỉ dừng với thiết bị để nguyên) "đang xác nhận với hong" [HĐ01 §11].
- HĐ01 đầu file ghi "chưa phản ánh vào demo (STEP5)" nhưng §11 ghi đã phản ánh vào 契約_00~07 ngày 2026-10-03 — trạng thái phản ánh không đồng nhất.
- Tên trạng thái DN không thống nhất: "Ngủ đông" (HĐ03 #8) vs "Ngừng hoạt động" (HĐ02) (suy luận: cùng một giá trị).
- Mâu thuẫn nhẹ: HĐ01 §3 nói phải rút lại thanh toán lại trước khi phát hành (Q4); phần "đã phát hành mới biết" trả lời 2026-10-05 = hủy rồi phát hành lại [HĐ01 §10].
- "Giới hạn cho DN sử dụng lần đầu" của dùng thử: hệ thống không xác định, Vận hành xác nhận khi tiếp nhận (A4) [FĐK §11].
- Dùng thử gia hạn: "tạm thời không giới hạn số lần/số tháng" [HĐ00 §0.4].
- Thanh toán bằng thẻ tín dụng nằm ngoài hệ thống, ES chỉ giữ phân loại [FĐK §4-6].

## 7. Khi BA phân tích tính năng thuộc nhóm này
1. Trường dữ liệu đó thuộc **cấp nào** (DN, cơ sở, hợp đồng cha, hợp đồng con)? Có vi phạm nguyên tắc "một chủ sở hữu" (ví dụ người nhận hóa đơn chỉ ở cơ sở, đơn vị phát hành chỉ ở DN) không? [HĐ00 §0.5]
2. Thay đổi áp dụng cho "chỉ tháng này" hay "từ đây trở đi"? Hợp đồng con đã xác định/đã thanh toán, tháng đã xuất hóa đơn xử lý thế nào (dòng điều chỉnh)? Có đơn đang chờ phê duyệt khóa mục đó không?
3. Tháng áp dụng có theo hạn chót order (ngày 15 tháng trước) không? Có thuộc ngoại lệ chế độ khách (hiệu lực ngay, phí theo hạn chót) không?
4. Màn hình nào được thấy trên Web DN? Đối chiếu danh sách không hiển thị (lịch sử thay đổi, tab Giá·Thanh toán, tuyến giao hàng, mã đại lý, ghi chú nội bộ...) và cột "Đơn đăng ký thay đổi / Vận hành phê duyệt / Thông báo" của từng mục.
5. Tính năng có chạm vào dùng thử, chuyển chính thức, tạm dừng, hủy? Hỏi: thiết bị thu hồi hay để nguyên, có tạo hợp đồng con/tất toán không, quyền đăng nhập và app cá nhân theo trạng thái, ngày dự kiến trả thiết bị, phạt theo từng thiết bị.
6. Với đăng ký (form, nhập thay, CSV): đang ở giai đoạn đăng ký tạm hay chính thức (cái gì được tạo ở bước nào, chỉnh sửa ở đâu)? Máy bán hàng tự động có ràng buộc riêng (gói ≥100, ES Lite, giao hàng ES, tầng bắt buộc, không dùng thử)?
7. Kiểm tra quy tắc nhập chung (60/255/500 ký tự, email ≤60, đính kèm 5MB/10 tệp, toàn góc→bán góc) và độ dài đã bị thay thế (cũ 120/160 → mới).
8. Có dính điểm mở nào ở mục 6 (REQ-CT-144, Q9, Q13, A9, đơn vị phát hành)? Nếu có, ghi vào Q&A/Ambiguities và hỏi PM/khách, không tự giả định.
