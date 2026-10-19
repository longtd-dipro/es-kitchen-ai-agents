# Quy ước chung xuyên suốt (mã màn hình, message, quyền, CSV, trạng thái, ngày giờ) — digest ES-STATION
> Nguồn (tương đối từ `01_仕様_vi/`): `README.md` · `Quy_ước_mã_màn_hình_20261005.md` · `Thiết_kế_cơ_bản_Đề_xuất_định_nghĩa_tổng_thể_20261001.md` · `Bảng_phân_quyền_Web_vận_hành_20261003.md` · `Định_nghĩa_nhập_xuất_CSV_20261003.md` · `Liên_kết_ngoài_Danh_sách_luồng_lỗi_20261005.md` · Trạng thái: Quy_ước_mã_màn_hình, Bảng_phân_quyền = chuẩn; CSV = chuẩn (đã chốt 10/03 + sửa 10/05); Liên_kết_ngoài = danh sách mô phỏng kiểm thử; Thiết_kế_cơ_bản = ĐỀ XUẤT (nhiều ô "Quyết định", "Đề xuất", "Chưa quyết"; có điểm bị Sổ quyết định K ghi đè — README) · Digest tạo: 2026-10-08

> Thứ tự ưu tiên (README): Sổ quyết định `docs/決定台帳.md` > đặc tả. Mỗi thư mục có README ghi file "chuẩn". File "Đã đóng băng (tài liệu gốc)" chỉ để xem quá trình, không sửa/không đề xuất từ đó. `00_Quyết_định/` toàn bộ đóng băng; `90_デモ確認/` chỉ local. Quyết định mới: `docs/決定の受付簿.md` → khi chấp nhận mới chuyển vào Sổ quyết định + file chuẩn của chủ đề. [README]

## 1. Phạm vi & actors
- Áp dụng cho MỌI site: Web vận hành `AW_` (Admin Web) · Web doanh nghiệp `CW_` · Web nhà cung cấp `SW_` · Web đơn vị giao hàng ủy thác `OW_` · App tài xế `DA_` · App người dùng `UA_`. [Quy_ước §1]
- Role Web vận hành (7 vai trò chuẩn): Toàn quyền · Kế toán · Kinh doanh · CS · Quản lý sản phẩm · Phát triển sản phẩm · Logistics; giữ thêm "Chỉ xem", "Nhân viên kho". [Phân_quyền]
- Web doanh nghiệp: 2 loại tài khoản (doanh nghiệp / cơ sở), không theo role. Các site khác (giao hàng ủy thác, tài xế, nhà cung cấp) chỉ bị giới hạn theo "phạm vi dữ liệu của chính mình". [Phân_quyền; TKCB §4-1, §10-7]
- Lập bản đồ thư mục chủ đề (10_Giao_hàng … 80_Màn_hình_vận_hành…) và file chuẩn từng thư mục: xem bảng README (không chép lại).

## 2. Thuật ngữ & định danh
| Thuật ngữ | Gốc/tên vật lý | Nghĩa ngắn |
|---|---|---|
| Mã màn hình | `<Module(2)>_<Feature(4)>_<Seq(3)>`, vd `UA_PAYM_003`, `AW_PLAN_001` | ID duy nhất 1 màn hình; Seq = số màn hình, KHÔNG phải số trạng thái (tab/modal/lỗi) [Quy_ước §1] |
| Hợp đồng cha / con | 契約 cha / con | Cha = hợp đồng của cơ sở; con = chi tiết theo từng tháng chu kỳ [TKCB §12] |
| Tháng chu kỳ | — | 1 tháng của lịch giao hàng (khác tháng dương lịch) [TKCB §12] |
| Hạn chốt đặt hàng | — | Mặc định ngày 15 tháng trước, đổi được theo cơ sở [TKCB §8 D3] |
| Giao hàng ES / COOL / xe công ty | ES配送便 / COOL便 | Phương thức giao; xe công ty là phân loại tuyến giao [TKCB §6-2, §12] |
| Phân loại phê duyệt | — | Bắt buộc phê duyệt / Chỉ thông báo (phản ánh ngay + báo Vận hành) / Chỉ Vận hành [TKCB §6-2] |
| Khóa CSV | `品番`, `拠点ID`, `法人ID`… | Khóa trùng → ghi đè, không có → tạo mới [CSV §2-1] |
- ID format [TKCB §6-3]: `AP-YYYYMMDD-NNNN` (đăng ký mới) · `CH-YYYYMMDD-NNNN` (yêu cầu thay đổi, 8 loại) · `DD-YYYYMMDD-NNNN` (đổi ngày giao) · `CU`+5 số (doanh nghiệp/cơ sở) · `CP`+7 số`-YYYYMM` (hợp đồng con) · `INV-YYYYMMNNNN` (hóa đơn) · `ES`+6 (gói) · `OP`+6 (tùy chọn) · `DC`+6 (giảm giá) · `Ad`+5 (user Vận hành) · `HU`+5 (nơi trung chuyển) · `RT` (nơi trả hàng). Quy tắc số giao hàng: chưa chốt trong đoạn đọc được (câu bị cắt) — mở §6-3 nếu cần.
- 8 loại yêu cầu: Thay đổi gói / giao hàng / thiết bị / thông tin cơ sở / thông tin doanh nghiệp / Tạm ngưng / Mở lại / Hủy hợp đồng. [TKCB §6-2]
- Phân loại khác (Course, phương thức/chu kỳ thanh toán, hạn thanh toán, thời gian chờ phát hành hóa đơn −3〜+1 tháng, người phụ trách…): xem TKCB §6-2.

## 3. Quy tắc nghiệp vụ đã chốt (BA không được mâu thuẫn)
**Mã màn hình**
1. Mã duy nhất toàn dự án; thêm màn hình chỉ TĂNG số, không đổi mã màn hiện có; chỉ đổi mã khi bản chất đổi (tách, gộp, đổi luồng, đổi đối tượng). Gắn mã vào Spec/REQ, Figma, ticket. Chưa có mã khi tách màn: người phụ trách tự quyết theo quy định rồi báo PM. [Quy_ước §2-3]
2. Ví dụ chuẩn: `AW_PLAN_001` Danh sách / `_002` Chi tiết / `_003` Đăng ký・chỉnh sửa; id trạng thái (`VIEWS`) đánh riêng từ 001. [Quy_ước §4]

**Message / email / thông báo**
3. Lỗi nhập liệu: chữ đỏ dưới mục + viền đỏ, cuộn tới lỗi đầu, hiển thị tất cả cùng lúc (Quyết định, Kiểm tra nhập liệu C1); thông báo trạng thái (vd giai đoạn chỉ tham khảo WEB No.75) = dải trên màn hình, giữ trong khi trạng thái còn (Quyết định). Các loại khác (lỗi nghiệp vụ dải đỏ, xác nhận = hộp thoại OK/Hủy, hoàn tất = toast 3 giây, cảnh báo, lỗi hệ thống) = ĐỀ XUẤT. [TKCB §1-1, §1-2]
4. Message nguồn chuẩn là Excel (`システム内メッセージ管理-Message List_フェーズ2追加_20261001.xlsx`), số thứ tự nối tiếp Phase 1. [TKCB §1]
5. Email: người gửi no-reply@es-kitchen.co.jp "[ES Station] Vận hành ES Kitchen"; tiêu đề bắt đầu "[ES Station]"; không đính kèm; chỉ tiếng Nhật; hóa đơn gửi từ Bill One (không từ ES), hướng dẫn dùng thử gửi từ HubSpot. (Quyết định) [TKCB §2-1]
6. Push notification app: Phase 2 không bổ sung gì (chỉ công bố menu của Phase 1) (Quyết định). [TKCB §3-1]
7. Không gửi nhắc nhở đặt hàng/kiểm tra tồn kho (X1・X12) cho cơ sở đang tạm ngưng; cơ sở đã hủy không gửi gì (trừ M12) — ĐỀ XUẤT. [TKCB §2-2]

**Quyền**
8. Bảng 7 vai trò × chức năng (CRUD / R/U / R / ×) là chuẩn, thay thế bảng §4-3 cũ. Toàn quyền và Quản trị hệ thống = CRUD ở MỌI chức năng (kể cả ô ghi R). R/U = xem・sửa・xuất CSV・thao tác theo chức năng (phê duyệt/công khai/chốt), KHÔNG tạo・xóa・nhập CSV; R = xem + xuất CSV. Nhiều vai trò → lấy vai trò cao hơn (Phân_quyền; lưu ý TKCB §4-1/§10-6 R1 ghi "cộng dồn" là đề xuất cũ — theo Phân_quyền). [Phân_quyền]
9. "Cấp quyền" (tài khoản, quyền, bảo trì, phiên bản & cập nhật bắt buộc, IP whitelist, thuế suất chênh lệch thu tiền mặt, master thuế suất) và "Liên kết Hubspot/API": chỉ Toàn quyền (CRUD), 6 vai trò còn lại ×. Vai trò do Quản trị hệ thống tạo ở "Quản lý tài khoản > Quyền"; bảng là giá trị ban đầu. [Phân_quyền]
10. Master gói・Tùy chọn・Giảm giá: Toàn quyền CRUD (đã sửa từ R, Sổ cái F); "Đăng ký mới" master vật tư = quyền C. [Phân_quyền]
11. Không có quyền → nút KHÔNG hiển thị (không làm xám); URL trực tiếp → "Bạn không có quyền xem màn hình này." về Trang chủ; server cũng chặn. Loại thao tác P1–P8 (tham khảo, đăng ký/sửa, xóa, phê duyệt/từ chối, xác định/phát hành, nhập thay, xuất/nhập, gửi/tài khoản). [TKCB §10-6-1, §4-4] (đề xuất, trừ "không hiển thị" theo CrudPattern demo)
12. Web doanh nghiệp: tài khoản dùng chung (ID doanh nghiệp / ID cơ sở = ID đăng nhập); người yêu cầu chọn từ người phụ trách đã đăng ký (C1–C3, Quyết định 09/29). Tài khoản cơ sở: không đổi thông tin doanh nghiệp, không thấy menu "Thông tin doanh nghiệp". [TKCB §10-7-1, §10-7-2]
13. H1–H5 (Long 10/01): Home tài khoản DN = lịch giao của mọi cơ sở + thông báo, lọc theo cơ sở; cơ sở KHÔNG rút được yêu cầu do tài khoản DN gửi; cơ sở mới do tài khoản cơ sở "thêm cơ sở" KHÔNG hiện với tài khoản đã thêm (H3=A); tài khoản cơ sở chỉ thấy yêu cầu của mình; mã dòng máy (vd RF000002) hiển thị trước tên. [TKCB §10-7-5]
14. Quyền theo trạng thái cơ sở (Quyết định): bình thường = tất cả; có yêu cầu chờ duyệt = không gửi yêu cầu mới (chỉ cơ sở đó); đang tạm ngưng = chỉ tham khảo + đăng ký mở lại / hủy / liên hệ (28-3・28-21); sau hủy đến hạn thanh toán hóa đơn cuối = chỉ tham khảo (No.75); sau hạn đó = không đăng nhập (No.76). DN có TẤT CẢ cơ sở tạm ngưng: vẫn đăng nhập, chỉ tham khảo (28-3). [TKCB §4-2, §10-7-3]
15. Không hiển thị trên Web doanh nghiệp (cả 2 loại tài khoản): lịch sử thay đổi, phần phí hợp đồng con (①②, giảm giá, số tiền chịu…), số tiền thu hồi khi hủy, kho/công ty giao hàng/thời gian chờ tuyến giao. [TKCB §10-7-4]

**Danh sách / lưu**
16. Danh sách: 10 mục/trang (Quyết định 10/01; tùy chọn 10/20/50 cần xác nhận); có "Sắp xếp"; xóa logic, mặc định ẩn dữ liệu đã xóa (hiện bằng điều kiện tìm); khác mục = AND, cùng mục = OR; 0 kết quả "Không có dữ liệu phù hợp." [TKCB §10-2]
17. Nhập liệu: trim khoảng trắng, chuyển số/gạch/chữ sang nửa chiều rộng trước khi kiểm tra, vượt độ dài = lỗi, cấm emoji, khóa nút gửi sau khi bấm (C3–C7, Quyết định). [TKCB §10-1]
18. Đề xuất (chưa xác nhận): chỉnh sửa đồng thời báo lỗi người lưu sau; hợp đồng/thanh toán/yêu cầu không xóa mà đổi trạng thái; cảnh báo rời trang chưa lưu; đăng xuất sau 60 phút (Vận hành)/30 phút (DN); lịch sử thay đổi cho DN・cơ sở・hợp đồng con・Master. [TKCB §10-3, §10-4]

**Ngày giờ / tiền** (TKCB §8, §7)
19. Chốt ngày 20 → xác định ngày 25 → phát hành ngày 1 tháng sau; quyết toán thực tế 21 tháng trước〜20 tháng này; hạn thanh toán ngày 27 của tháng thanh toán/tháng sau; ngày hủy hợp đồng = ngày cuối chu kỳ; lịch chu kỳ theo quản lý giao hàng (Quyết định D3–D7). JST, hạn chốt tới 23:59:59, "N ngày trước" = ngày dương lịch (D1, D2, D9: đề xuất). "Hôm nay" của demo cố định 2026/10/05 (T1=C).
20. Không tính theo ngày (P1); tháng áp dụng: yêu cầu ≦ hạn chốt → từ tháng chu kỳ đó, quá hạn → tháng sau (S1); thuế = tổng theo hóa đơn・thuế suất × thuế suất rồi làm tròn (số âm làm tròn theo giá trị tuyệt đối). Công thức đầy đủ + ví dụ K1–K5: `Quy_tắc_thanh_toán_Đặc_tả_v1` (nguồn chuẩn), tóm tắt ở TKCB §7.
21. Hiển thị tiền ¥#,##0 (ghi rõ chưa thuế/đã gồm thuế trong tên mục); ngày `YYYY/MM/DD`. Trên màn hình "1,000円" (chốt 10/03). [TKCB §10-5, §8 D10; CSV đầu]

**CSV** (áp dụng mọi site; quyết định gốc 28-183)
22. Xuất: UTF-8 CÓ BOM, CRLF, dấu phẩy; dòng 1 tên cột tiếng Nhật; xuất TOÀN BỘ dòng khớp bộ lọc (không chỉ trang hiện tại) và đầy đủ field (gồm ID + tên, trạng thái, ngày tạo/sửa/người sửa); tiền = số thuần (`1000`), boolean `1/0`, nhiều giá trị nối `;`, ngày `yyyy-mm-dd`; chỉ xuất dữ liệu được phép xem; ghi log xuất. Tên file `<画面名>_<条件>_<yyyymmdd-HHmm>.csv` (điều kiện >80 ký tự cắt + `ほか`). Bảng con = nhiều dòng lặp khóa cha. [CSV §1, §5]
23. Nhập: UTF-8 có/không BOM; không có cột NEW/UPDATE/DELETE; khóa trùng = ghi đè, khóa trống = tạo mới; KHÔNG xóa qua CSV (trừ loại dòng ghi 【削除】, vd giá Master Gói); ô trống khi cập nhật = giữ nguyên, muốn xóa ghi `-`; luồng 2 bước (chọn file → xem kết quả Tạo mới/Cập nhật/Không đổi/Lỗi + so sánh trước→sau → "Đăng ký"); tối đa 5,000 dòng/file, >100 dòng cập nhật chạy nền có tiến độ; có cảnh báo phải tích "Tôi đã xác nhận cảnh báo"; không tự tạo master mới; validate nghiệp vụ dùng chung hàm lưu của màn hình. [CSV §2, §5]
24. Dòng lỗi (SỬA 10/05, Sổ cái F): dòng lỗi bị bỏ qua, các dòng khác vẫn đăng ký; chỉ dừng khi lỗi cả file/không có dòng hợp lệ; kèm CSV danh sách lỗi (cột `エラー内容`). Dòng cũ "có lỗi → không lưu dòng nào" ĐÃ BỊ THAY THẾ. Nút "Template"/"Dữ liệu hiện tại" trong modal đã BỎ (10/05) — dùng Xuất CSV làm mẫu. [CSV §2-1, TKCB §13#11]
25. Khung ảnh hưởng 7-1: trường loại ② cần cột `適用開始`; loại ④ đã khóa (đã xác nhận/đã thanh toán/đã chỉ thị xuất hàng) → lỗi dòng. [CSV §2-1]
26. Ma trận màn nào có Xuất/Nhập CSV (khóa nhập từng màn) ở CSV "Tình trạng triển khai" — tra khi cần; ngoại lệ: Tài xế không có; DN chưa cần Nhập CSV; NCC có (phản hồi đơn nhận, hạn sử dụng bắt buộc mọi mặt hàng trừ vật tư — Sổ cái E 10/05); đơn vị giao hàng ủy thác có (tạo nhiều nhân viên). [CSV §5.7, bảng triển khai]
27. Nhập CSV khảo sát `AW_SURV_004`: 1 dòng = 1 câu hỏi; 4 cột thông tin cơ bản lấy từ dòng 1; các mã lỗi E200/E201/E204/E214–E219 (xem CSV §6).

## 4. Trạng thái & dữ liệu chính
Tài liệu không có máy trạng thái hợp nhất; TKCB §5-1 liệt kê (ai chuyển ghi trong từng đặc tả chuyên đề):
- Đăng ký mới: Tiếp nhận → Đăng ký tạm → Thiết lập chi tiết → Đăng ký chính thức (có từ chối・rút lại) (Demo).
- Yêu cầu thay đổi: Chờ duyệt → Đã duyệt / Duyệt một phần / Từ chối (bắt buộc lý do) / Đã rút lại; duyệt theo từng cơ sở (Quyết định).
- Thanh toán hợp đồng con (Vận hành): trả trước: đã tạo → ① xác định → xác định cơ sở → xác định DN → đã xuất hóa đơn; trả sau: chưa tổng hợp → ② xác định → … (Quyết định STEP2 Q6). Web DN: Chưa xác định / Đã xác định / Đã xuất hóa đơn.
- Hóa đơn (Bill One): Chưa phát hành → Đã phát hành / Lỗi gửi (gửi lại → đã phát hành) → Hủy (phát hành lại số mới) (Quyết định S6-4・S6-5).
- Cơ sở: Có hiệu lực / Dự kiến tạm ngưng / Đang tạm ngưng / Dự kiến hủy / Đã hủy — ĐỀ XUẤT (§5-1); bảng trạng thái × thao tác §5-3 (nhiều ô "đề xuất").
- Tài khoản DN・cơ sở: Chưa phát hành / Đã phát hành / Đã đăng nhập / Đang tạm dừng + giai đoạn "chỉ tham khảo" sau hủy (S4-3). User Vận hành: Có hiệu lực / Vô hiệu / Ngừng sử dụng / Đã xóa.
- Dữ liệu giao hàng: Tạo → locked (lần gửi chỉ thị xuất hàng đầu thành công) → Hoàn tất; "Cần xác nhận" (3 ngày trước). Đặt hàng NCC: tạm → đã trả lời thời hạn → chính thức → đã xuất → đã nhập kho / Hủy. Master: Công khai/Không công khai (Quyết định); Đang dùng/Đang dừng (U5 chưa quyết).
- Giá trị trạng thái hợp đồng con: chỉ quyết một phần (STEP2 C1, không dùng "Đang hợp đồng") — toàn bộ cần xác nhận.
- 4 loại liên động xuyên màn hình (Nguồn chuẩn・Sao chép・Hiển thị・Kiểm soát); loại "Sao chép" BẮT BUỘC ghi "có hiệu lực từ khi nào" (Quyết định, Định nghĩa ảnh hưởng §4-4). [TKCB §9]
- Batch chính (hằng ngày: tạo hợp đồng con từ lần 2, tạm dừng tài khoản, thông báo chưa đặt tài xế 3 ngày/1 ngày trước, tạo・cần xác nhận dữ liệu giao; X1 hằng tháng; X10 mỗi 24 giờ làm việc). [TKCB §11-1]

## 5. Liên kết với nhóm khác & hệ thống ngoài
- Nhóm khác: toàn bộ thư mục 10〜80 (xem README); công thức thanh toán → `40_Master_Phí_Thanh_toán/Quy_tắc_thanh_toán_Đặc_tả_v1`; email → `30_Đơn_yêu_cầu/メール一覧_*`; giao hàng/API batch → `Giao_hàng_12_API_batch_và_liên_kết_ngoài.md`; form đăng ký → `Form_đăng_ký.md`.
- Hệ thống ngoài: Cognito (đăng nhập), Bill One (hóa đơn), Yamato (vận đơn), THOMAS (chỉ thị・kết quả xuất hàng), HubSpot (liên hệ, hướng dẫn dùng thử). Demo: chỉ chuyển động mẫu, hiện "(Demo)" khi `NEXT_PUBLIC_DEMO=1`; giai đoạn kiểm thử chỉ mô phỏng luồng lỗi E1–E9 (Liên_kết_ngoài).
- Luồng lỗi chốt: E1 gửi chỉ thị xuất hàng THOMAS lỗi → không khóa, thử lại, cuối cùng "Cần xác nhận"; E2 đổi/hủy sau khi gửi → tăng số phiên bản gửi lại (hủy = số lượng 0); E3 lỗi nhập vận đơn Yamato → lỗi từng dòng, dòng khác vẫn nhập; E4 vận đơn đến trước xuất hàng → vào cần xác nhận; E5 kết quả xuất hàng NG; E6 sai mã ký tự/cột → lỗi cả file; E7 tạo xác định thất bại → `plan_recheck`; E8 Bill One lỗi gửi → Vận hành gửi lại, cảnh báo ở TOP vận hành; E9 batch ngày lỗi → chỉ hoàn tác phần ghi của xử lý đó, chạy tiếp, báo quản trị hệ thống. [Liên_kết_ngoài §E1–E9]
- HubSpot gửi liên hệ lỗi: hiện lỗi trên Web DN, khách tự gửi lại; ES không lưu, không có chức năng gửi lại (hong 10/05). [Liên_kết_ngoài]
- Tách cổng API mock/thật để sau; hiện chỉ NCC có cổng. [Liên_kết_ngoài]

## 6. Điểm mở / Cần xác nhận / mâu thuẫn
- Nút riêng lẻ (tạo・xóa・phê duyệt・công khai…) trong từng màn chưa phân biệt hiển thị theo quyền: hiện bấm thì server trả 403 + toast. [Phân_quyền "Cần xác nhận"]
- Chưa có đặc tả riêng: gửi thông báo chi tiết (chỉ có Màn_hình_vận_hành §5), master gói (`docs/議事録_仕様/プランマスタ_仕様まとめ.md` vẫn là chuẩn). [README]
- Cognito (đăng nhập thất bại・đặt lại mật khẩu): chưa có trong đặc tả ("quyết định nếu cần"). [Liên_kết_ngoài]
- R6 tự phê duyệt (người nhập thay có tự duyệt được không): Chưa quyết (D12・E-11). [TKCB §10-6-2, §13#4]
- R8 role không xem được số tiền / R9 giới hạn phạm vi dữ liệu theo phụ trách: đề xuất "không tạo", cần xác nhận. [TKCB §10-6-2, §13#14]
- D12 lịch chu kỳ trước 7/2026 (GW…): Chưa định. [TKCB §8]
- Chưa quyết: xác định thanh toán ngày 25 thủ công hay tự động (đề xuất thủ công) [§11-1, §13#10]; thời gian đăng xuất (đề xuất 60/30 phút "khớp Phase 1") [§13#9]; K4 xử lý tháng lẻ phí phạt hủy (tạm làm tròn lên), K3 giá trị tạm [§7-2]; giá trị trạng thái cơ sở & ô đề xuất §5-3 [§13#5]; số mục chọn được 10/20/50 [§10-2].
- Email chưa quyết: M4 người nhận khi nhập thay, M7 email khi rút lại, M8 email Vận hành khi đổi người phụ trách, M11 email ngày dừng/hôm trước, X7 CSV phát hành tài khoản tài xế, X11 nội dung email đơn đặt hàng. [TKCB §2-4]
- Tồn đọng từ `デモ全体確認_未決事項と選択肢`: E-3 hạn tiếp nhận hủy, E-4 thời hạn sử dụng tối thiểu khi nâng kích thước, E-5 yêu cầu báo giá, E-9 đơn vị phát hành hóa đơn (Web DN hiện "chỉ tham khảo" theo E-9=B), E-10 tủ lạnh Lite→máy bán hàng tự động, E-12 thông báo đại lý, E-13 tên ③ điều chỉnh, U5 tên trạng thái; đoạn cuối §13 bị cắt trong bản dịch nên danh sách có thể chưa đủ. [TKCB §13]
- Mâu thuẫn cần lưu ý: TKCB còn ghi "cộng dồn role" (R1) và bảng §4-3 cũ, trong khi Phân_quyền chuẩn = lấy vai trò cao hơn; TKCB §11-3/CSV cũ "1 dòng lỗi không nhập gì" đã bị thay (xem rule 24). TKCB chỉ liệt kê 6 role demo (§4-1) — lỗi thời so với 7 role chuẩn. Luôn ưu tiên Phân_quyền / Sổ quyết định.

## 7. Khi BA phân tích tính năng thuộc nhóm này
1. Màn hình mới đã có mã `<Module>_<Feature4>_<Seq3>` chưa, đúng module (UA/DA/CW/AW/SW/OW), không trùng, không đổi mã màn cũ? Tab/modal/lỗi có bị đánh Seq nhầm không?
2. Chức năng thuộc nhóm nào trong bảng 7 vai trò × chức năng; vai trò nào CRUD / R/U / R / ×? Nút theo quyền P1–P8 có ghi "không hiển thị" khi thiếu quyền? Có cần hỏi quyền cấp nút (hiện chưa phân biệt)?
3. Với Web DN: phân biệt tài khoản doanh nghiệp vs cơ sở (xem dữ liệu, rút yêu cầu, thêm cơ sở H3); hành vi theo trạng thái cơ sở (tạm ngưng, chờ duyệt, sau hủy).
4. Nếu có list: có Xuất CSV (toàn bộ dòng lọc, UTF-8 BOM, số thuần) và Nhập CSV (khóa, bỏ qua dòng lỗi, không xóa, ô trống giữ nguyên, 5,000 dòng) — tra ma trận "Tình trạng triển khai" cho màn đó thay vì tự giả định.
5. Có thao tác ảnh hưởng xuyên màn (đổi giá gói, đổi địa chỉ, hủy hợp đồng)? Ghi "có hiệu lực từ khi nào" và hợp đồng con đã tạo/đã thanh toán có bị khóa (loại ④) không.
6. Message/email/thông báo mới: loại hiển thị, "Điều kiện không gửi" (cơ sở tạm ngưng/hủy, thiếu địa chỉ), gửi ngay hay batch, ai được gửi lại; cập nhật Excel Message List.
7. Liên kết ngoài (THOMAS/Yamato/Bill One/HubSpot/Cognito): luồng lỗi E1–E9 tương ứng và hành vi mong đợi đã nêu trong spec chưa; Cognito đang thiếu → hỏi.
8. Ngày giờ/tiền: hạn chốt (JST, 23:59:59), ngày làm việc vs ngày dương lịch, thuế làm tròn, chưa thuế/đã gồm thuế; hỏi PM các điểm còn "Chưa quyết" (R6, D12, K4, xác định thanh toán thủ công/tự động) trước khi viết AC.
