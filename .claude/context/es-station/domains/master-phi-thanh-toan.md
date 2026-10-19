# Master & Phí & Thanh toán — digest ES-STATION
> Nguồn (từ `01_仕様_vi/`): `40_Master_Phí_Thanh_toán/Quy_tắc_thanh_toán_Đặc_tả_v1.md` [QT] · `40_Master_Phí_Thanh_toán/Tùy_chọn_và_Giảm_giá_Định_nghĩa_20261003.md` [DN] · `40_Master_Phí_Thanh_toán/Danh_sách_mục_Master_Dòng_máy_Tùy_chọn_Giảm_giá.md` [MS] (đọc theo mục, không đọc hết các tab màn hình chi tiết) · Trạng thái: QT = "v1 2026/10/01, bổ sung 10/03" (file quyết định ở cột Căn cứ là chuẩn nếu mâu thuẫn; không thêm quyết định mới); DN = tài liệu phân tích code (chỉ đọc, 10/03, nhiều đoạn là hiện trạng/đề xuất); MS = bản chuẩn của master (md là chuẩn, Excel chưa cập nhật). Bảng "Những điều đã quyết 2026/10/03" ở MS Phần II là chuẩn từng ID. · Digest tạo: 2026-10-08

## 1. Phạm vi & actors
- Master (Dòng máy · Gói/Plan · Tùy chọn · Giảm giá) và quy tắc thanh toán: **chỉ Web Vận hành (AW_)** thao tác, không hiển thị trên Web doanh nghiệp [MS đầu file]. Nhân viên CS là người duy nhất thấy/thao tác màn quyết toán thực tế, kiểm soát theo quyền vận hành [QT §1-8].
- Web doanh nghiệp (CW_): chỉ XEM thiết lập thanh toán (đơn vị phát hành…); trạng thái thanh toán 3 giai đoạn; chọn tùy chọn "công khai" khi đăng ký/đơn thay đổi (OP000007, OP000014, OP000017) [QT §1-6, §4-6; MS Phần II].
- Doanh nghiệp/cơ sở đăng ký: thiết bị muốn thêm, kích thước tủ lạnh (chọn lại trong gói) trên form đăng ký [MS §0.9-3].
- Hệ thống ngoài tham gia: Bill One (phát hành/gửi hóa đơn). Web NCC/công ty vận chuyển/App tài xế/App người dùng: Không có trong tài liệu nhóm này.
- Nơi đăng ký tùy chọn/giảm giá = **Hợp đồng con** ("Biến động tùy chọn・giảm giá"); tab "Thiết bị・Tùy chọn" của cơ sở CHỈ XEM tháng chu kỳ hiện tại [MS §0.2].

## 2. Thuật ngữ & định danh
| Thuật ngữ Việt | Gốc/tên vật lý | Nghĩa ngắn |
|---|---|---|
| Master Dòng máy | ID `^(RF\|FZ\|VM\|MW\|HW\|BX)[0-9]{6,}$` | RF tủ lạnh, FZ tủ đông (tách 09/23), VM máy bán hàng tự động, MW lò vi sóng, HW máy giữ nóng, BX hộp vật tư [MS Phần III] |
| Master Tùy chọn | `OP`+6 số (`option.*`) | Phí không phải vật thể; loại A / không liên động [MS §0.0, §0.3] |
| Master Giảm giá | `DC`+6 số (`discount.*`) | Đối tượng áp dụng: phí gói / tùy chọn / thiết bị / khởi tạo / toàn hóa đơn [MS §0.5] |
| Master Gói (Plan) | `ES`+6 số | 1 gói có 2 course Standard/Light; hợp đồng giữ ID gói + course [MS §0.12] |
| Course | ES Standard · ES Light (tủ lạnh) · ES Light (máy bán hàng tự động) | Light(VM): thiết bị chuẩn là máy bán hàng tự động, giá chỉ ES配送便 [MS §0.12] |
| Loại A (liên động) | `linkType='A'` | Tùy chọn do hệ thống định nghĩa theo mục hợp đồng; vận hành không tạo/xóa; chỉ sửa tên, số tiền, trạng thái [MS §0.3, DN §10] |
| Hợp đồng con (①②③) | — | ① số tiền cố định (trả trước) · ② quyết toán thực tế · ③ chi tiết điều chỉnh [QT §1-3, §2-14] |
| Phí cơ bản / phúc lợi | — | Phí gói tách 2 dòng: cơ bản 10% + phần doanh nghiệp chịu 8% [QT §2-3] |
| Quyết toán thực tế | ② | Hao hụt quản lý vượt miễn trách (kỳ 21–20) [QT §1-4; DN §1-D] |
| Số tiền miễn trách | `plan.deductible_yen` | Mức chênh lệch tồn kho cho phép; vượt thì thu [MS tab Master Gói] |
| Phí thủ tục (OP000016) | tên quản lý "Chưa kiểm kê" (cũ "Phạt chưa kiểm tra") | ¥3,000, tự động khi chưa nộp kiểm kê [MS Phần II 10/03] |
| Phí khởi tạo (OP000008) | — | ¥10,000 một lần; tên hiển thị hóa đơn có chỗ không nhất quán (xem §6) |
| Gói tham chiếu dùng thử | `ES000003` | Gói 50 ES Lite (tủ lạnh) dùng làm tham chiếu giảm giá dùng thử [DN §2-A] |
| Hóa đơn cuối | — | 1 hóa đơn vào tháng sau tháng hủy [QT §3-5] |
- Format ID: `OP\d{6,}`, `DC\d{6,}`; ID không tái sử dụng (bãi bỏ → "Kết thúc/Đã xóa"; OP000006 để trống) [MS Phần III; DN §4-2]. ID áp dụng riêng (tùy chọn/giảm giá của cơ sở) đã bãi bỏ: xác định bằng ID hợp đồng con + mã [MS Phần III].
- Ví dụ ID tùy chọn đã chốt: OP000001 thêm số lần giao · 002 ES-QR · 003 chế độ khách · 004 phí giao khu vực · 007 lắp đặt hộ · 008 khởi tạo · 010 đổi tủ lạnh (do khách) · 014 chỉ định khung giờ · 015 lắp đặt lại/di dời · 016 chưa kiểm kê · 017 decal VM · 019/020 giao thiết bị (1 / từ 2 máy) · 021 cầu thang · 022 thu hồi thiết bị · 023 chênh lệch kích thước · 024–031,034 (nhập mỗi lần) · 033 khởi tạo tủ đông · 035 tiền mặt · 036 vật tư giao thêm · 037 thuê VM [MS Phần II 10/03].

## 3. Quy tắc nghiệp vụ đã chốt (BA không được mâu thuẫn)
**Lịch & hóa đơn**
1. Chốt ngày 20 → xác nhận ngày 25 → phát hành bằng Bill One ngày 1 tháng sau; tháng thanh toán = tháng phát hành [QT §1-1, §1-2]. (Thay thế "phát hành cuối tháng" của STEP2 Q4.)
2. Tháng thanh toán của ① = tháng chu kỳ + lead time phát hành (−3…+1, mặc định −1); tháng chu kỳ ② = tháng thanh toán − 1 [QT §1-2, §1-9].
3. Kỳ quyết toán thực tế cố định 21 tháng trước → 20 tháng này, không theo ngày kiểm kê riêng từng công ty [QT §1-4].
4. 1 hóa đơn gồm cả ① trả trước + ② quyết toán thực tế; **1 hóa đơn chỉ 1 hạn nhập tiền** = ngày 27 tháng thanh toán hoặc ngày 27 tháng sau, theo thiết lập nơi nhận hóa đơn; ngày trừ tiền chuyển khoản/thẻ cũng vậy [QT §1-3, §1-5].
5. Quyết toán thực tế chưa xác nhận vẫn phát hành hóa đơn; phần chưa xác nhận điều chỉnh ở tháng sau; từ ngày 26 cảnh báo CS thúc giục chốt [QT §1-7, §1-8].
6. Trạng thái thanh toán vận hành 5 giai đoạn, Web doanh nghiệp 3 giai đoạn [QT §1-6]. Đổi lead time giữa chừng không giới hạn nhưng cảnh báo trùng/thiếu tháng trả trước (WEB No.63) [QT §4-5].
7. Trả theo năm: 12 chu kỳ trên 1 hóa đơn từ tháng khởi điểm = tháng chu kỳ bắt đầu hợp đồng; phí giữa kỳ giữ đến tháng khởi điểm kế; **quyết toán thực tế vẫn chốt hàng tháng**, chỉ ① trả theo năm; hợp đồng con không giữ "đơn vị trả trước" [QT §4-1…4-3, §4-7].
**Số tiền**
8. Không tính theo ngày; phí hàng tháng tính đủ tháng chu kỳ. Thay đổi/lắp/thu hồi giữa tháng theo **hạn chót đặt hàng (mặc định ngày 15 tháng trước)** [QT §2-1, §2-2].
9. Thuế tiêu dùng do ES tính, **làm tròn tổng theo từng hóa đơn × từng thuế suất** (âm làm tròn theo giá trị tuyệt đối), gửi cả tiền thuế cho Bill One; thuế suất = bất kỳ mức nào của master thuế suất; thuế theo cơ sở chỉ "tham khảo" [QT §2-4].
10. Phúc lợi = 100 yên × tổng giới hạn cung cấp hàng tháng ÷ 1.08 (làm tròn xuống); cơ sở không áp dụng thì 1 dòng phí cơ bản 10% [QT §2-3].
11. Nghỉ/hủy/hạ gói của tháng đã trả → dòng trừ ở hóa đơn kế; không bù hết thì hoàn tiền ngoài hệ thống. Âm/thanh toán thừa: không hoàn tiền, bù trừ các tháng sau (dòng ③), hóa đơn ghi cả dương âm [QT §2-5, §2-14].
12. Thanh toán lần đầu không kịp xác nhận ngày 25 → gộp 2 tháng vào hóa đơn kế [QT §2-6]. Phí hàng tháng ES-QR trả trước, phần không kịp chuyển hóa đơn kế [QT §2-7].
13. Thiết bị cho mượn tiêu chuẩn của master Gói = miễn phí; vượt = phí hàng tháng master Dòng máy. VM chỉ là thiết bị chuẩn của ES Lite (VM), không có tổ hợp "Standard + phí VM" (1 cơ sở 1 course) [QT §2-10; MS §0.12].
14. Chênh lệch kích thước chỉ thanh toán bằng OP000023 (hàng tháng, chỉ khi dương); OP000010 là "đổi tủ lạnh (do khách)" [QT §2-11]. Chênh lệch = phí tháng dòng đã chọn − phí tháng dòng chuẩn của gói; mẫu thay thế rẻ hơn không hoàn tiền [MS §0.9-3, Phần III-9].
15. Thuê VM (OP000037, hàng tháng) và phí khởi tạo VM nhập số tiền theo từng hợp đồng (giá trị ban đầu = master Dòng máy); thuê = số tiền 1 máy × số máy; tự gắn vào hợp đồng con ES Lite (VM); phí gói không gồm phí thuê [QT §2-12; MS Phần II 10/03].
16. Mua lại món ăn chế biến sẵn tự động từ kết quả giao: ① = 100 yên × SL, ② = Σ(SL × (đơn giá − 100)) [QT §2-13]. Tùy chọn loại "nhập mỗi lần/từ mức tối thiểu" bắt buộc nhập số tiền khi gắn hợp đồng con [QT §2-9].
17. Tùy chọn Loại A: thay đổi có hiệu lực từ hợp đồng con tháng sau (không có mục "tháng bắt đầu hiệu lực") [MS Phần IV #5]. Đổi số tiền master → lưu lịch sử (trước→sau, người, giờ), không giữ phiên bản giá (chỉ master Gói có phiên bản giá); dòng đã xác nhận/đã thanh toán không đổi [MS §0.6, §0.9]. Không giữ "số cơ sở bị ảnh hưởng" [MS tab Xác nhận liên động・lịch sử].
**Nghỉ・hủy**
18. Đang nghỉ: không tính phí gói tháng nghỉ, **không quyết toán thực tế**; kiểm tồn kho lúc bắt đầu nghỉ để quyết toán phần đến đó [QT §3-1]. Nghỉ tối đa 12 tháng cộng dồn, tháng dự kiến tiếp tục bắt buộc [QT §3-2].
19. Tiếp nhận hủy theo hạn chót đặt hàng (trước hạn → áp dụng từ tháng sau; sau hạn → tháng sau nữa); ngày hủy = ngày cuối chu kỳ; không có hạn sớm riêng cho VM [QT §3-3].
20. Tiền phạt = Σ(số tiền thu hồi khi hủy × số tháng còn lại ÷ thời gian sử dụng tối thiểu) theo từng thiết bị; min: tủ lạnh 3 tháng, VM 12 tháng, tính từ ngày cho mượn từng thiết bị; khi nghỉ chỉ không tính thiết bị để tại chỗ; thiết bị đã rút về không phạt. Cảnh báo trước xác nhận nếu có phạt [QT §3-4; MS §0.0].
21. Hóa đơn cuối 1 hóa đơn tháng sau tháng hủy (quyết toán cuối + phạt + mua lại tồn kho). Tồn kho còn lại = tồn tính toán × đơn giá bán, thanh toán bằng OP000031. Tài khoản "chỉ xem" đến hạn nhập tiền hóa đơn cuối, hôm sau dừng; gửi email dừng (No.16) và email nhắc ngày trước khi dừng [QT §3-5…3-7].
**Bill One**
22. Vận hành bấm "Phát hành bằng Bill One" gửi hàng loạt sau xác nhận 25; ES không gửi hóa đơn (PDF/thông báo từ Bill One); mỗi nơi nhận có 1 ID nơi phát hành, tự tạo nếu chưa có; lỗi gửi → màn vận hành "lỗi gửi" + gửi lại (WEB No.64/65); sửa nguyên tắc bù trừ tháng sau, chỉ thay thế (hủy trên màn Bill One, ES phát hành lại ID khác, WEB No.73/74) khi vận hành phán đoán; không nhập tiền/đối chiếu (clearings API chỉ tham khảo) [QT §5-1…5-6].
**Tùy chọn / Giảm giá**
23. OP000001: theo từng nhóm nhiệt độ, (số lần vượt chuẩn) × ¥3,000/lần, **không bù trừ giữa các nhóm nhiệt độ**, số lần giao không thể 0 [DN §1-A; MS Phần II 10/03].
24. OP000002 ¥1,000 (khách cũ miễn phí = ghi đè 0 yên theo hợp đồng); OP000016 ¥3,000 tự động khi chưa nộp kiểm kê đến ngày 20, **ngoại trừ** tạm ngừng/không kiểm tra/dùng thử, vẫn giữ nếu vận hành nhập hộ từ ngày 21 [MS Phần II 10/03; DN §1-A].
25. OP000036 giao vật tư thêm ¥2,000 [Tạm]: từ chuyến thứ 2 **trong cùng tháng chu kỳ**, 1 đơn = 1 chuyến, gộp 1 lần ở trả sau; vật tư đặt vượt số lượng miễn phí của gói tính theo giá/thuế master Vật tư [MS Phần II 10/03].
26. OP000022 thu hồi thiết bị = **0 yên** (vận hành nhập khi cần); OP000007/015 "nhập mỗi lần" (không dùng ¥15,000/¥8,000 của demo); OP000032 đã Kết thúc (tiền thuê tủ đông khách cũ tạo bằng dòng thiết bị theo phí master Dòng máy) [MS Phần II 10/03].
27. Không đưa vào master tới khi khách xác nhận: OP000009, OP000012, OP000018; OP000013/011 Kết thúc, OP000005 Đã xóa [MS Phần II 10/03].
28. Giảm giá trong master: DC000013, DC000021, DC000002 [Tạm], DC000001 [Tạm]; DC000003 Kết thúc (gộp DC000021); DC000005 Kết thúc; **không đưa vào**: DC000004/007/008/009/010/011/012 [MS Phần II 10/03].
29. DC000013 dùng thử: tham chiếu phí gói (¥24,500 gói 50 Lite), không vượt số tiền cố định, **không trừ quyết toán thực tế (P8)**, 1 lần/doanh nghiệp (cơ sở đầu nếu thanh toán theo cơ sở), tự gắn khi loại hợp đồng = dùng thử, tháng gia hạn cũng miễn phí; trừ theo đúng chi tiết gói 50 (cơ bản 10% / doanh nghiệp chịu 8%) [QT §2-8, §2-4; DN §2-A; MS Phần II 10/03].
30. DC000021: chênh lệch Standard−Lite hàng tháng, vô thời hạn đến khi vận hành gỡ, chỉ doanh nghiệp/cơ sở có trước release; **tích sẵn trên màn phê duyệt đổi gói** (vận hành bỏ tích được) + nhập CSV ~800 cơ sở; tiền thuê tủ đông tính riêng; KH không tự gắn/gỡ [MS §0.5, Phần II 10/03].
31. Hiện chỉ làm được giảm giá trừ vào phí gói (cố định/tỷ lệ); trừ vào tùy chọn/thiết bị/toàn hóa đơn chỉ làm khi khách cần; thứ tự áp dụng chồng nhập theo từng giảm giá [MS Phần II 10/03; Phần IV #4].
32. Phí đại lý: chỉ số tiền cố định (trả trước) chưa thuế sau giảm giá; **thanh toán trong thời gian dùng thử không thuộc đối tượng** [QT §6-1].
33. Quy tắc nhập chung: chữ 1 dòng ≤60 ký tự, ghi chú đa dòng ≤500, số tiền 0–999,999,999, thuế suất là dropdown master thuế suất, ID do hệ thống đánh số [MS Phần I đầu].
34. Màn danh sách 3 master (Dòng máy/Tùy chọn/Giảm giá): Nhập CSV (tạo mới + cập nhật theo ID, dòng lỗi không nhập), Xuất CSV toàn bộ dòng khớp, xóa logic (trạng thái "Đã xóa"), loại A không có nút Xóa, giảm giá có "Nhập CSV áp dụng" ở danh sách (số dòng + khác biệt trước khi nhập) [MS Phần I, §0.7].

## 4. Trạng thái & dữ liệu chính
- **Trạng thái thanh toán (vận hành)**: trả trước: đã tạo → ① xác nhận → cơ sở xác nhận → doanh nghiệp xác nhận → đã thanh toán; trả sau: chưa tổng hợp → ② xác nhận → cơ sở xác nhận → doanh nghiệp xác nhận → đã thanh toán. **Web doanh nghiệp**: chưa xác nhận / đã xác nhận / đã thanh toán [QT §1-6]. Ai chuyển từng bước: Không có trong tài liệu.
- Trạng thái sử dụng master Tùy chọn/Giảm giá: Đang dùng / Tạm dừng / Kết thúc / Đã xóa [DN §4-1]. Dòng máy: Có hiệu lực / Vô hiệu [MS tab Thông tin cơ bản]. Hóa đơn Bill One: ID cũ chuyển "hủy" khi thay thế [QT §5-4].
- Entity chính: `plan.*`/`plan_course.*` (std_delivery_chilled/frozen…), `model.*` (+`model_vm_cell`), `option.*` (+`option_history`), `discount.*`, Hợp đồng con + dòng khoản mục ① (loại model/option/discount, giảm giá là số âm) [MS §0.2; DN §1-A]. Trường đề xuất của Charge (invoiceName, adminName, linkType, feeType, amountKind, unit, taxRateId, trigger, auto, calcKind, months, maxPerCorp…) là **đề xuất** [DN §4-1].
- Loại số tiền: Cố định / Từ mức tối thiểu / Nhập mỗi lần / Theo từng cơ sở / Quyết định theo chênh lệch / Tham chiếu [DN §4-1].
- Gói tiêu chuẩn: giới hạn cung cấp hàng tháng theo nhiệt độ (đông lạnh chỉ có ở Standard), số lần giao tiêu chuẩn theo nhiệt độ, thiết bị cho mượn tiêu chuẩn (tủ lạnh theo bảng ES50…ES1100; hộp vật tư BX mặc định theo gói) [MS §0.9-3, Phần III-10]. Không giữ tỷ lệ đông lạnh [MS §0.12].

## 5. Liên kết với nhóm khác & hệ thống ngoài
- `20_Doanh_nghiệp_Cơ_sở_Hợp_đồng/Đặc_tả_hợp_đồng/` (契約_00/01/05/06…): định nghĩa các mục, chu kỳ A1–D7, hợp đồng #8 mua lại món ăn, bảng ①②③ (契約_06 §0.8) [QT đầu file, §1-9, §2-13].
- Thư mục `00_Quyết_định/` (file quyết định STEP2/STEP3/P/S/T… là chuẩn khi mâu thuẫn) [QT đầu file].
- **Bill One**: phát hành hàng loạt, ID nơi phát hành, gửi tiền thuế, hủy/phát hành lại thủ công, clearings API chỉ tham khảo [QT §5].
- Email/thông báo: Message List WEB No.63/64/65/73/74; email phê duyệt No.10, dừng tài khoản No.16, dừng giao hàng No.14 [QT §3-7, §4-5, §5, §8].
- Giao hàng/vật tư/kiểm kê tồn kho: OP000036, OP000016, quyết toán thực tế phụ thuộc kết quả giao & kiểm kê (nhóm khác: Không nêu tên thư mục trong nhóm này).
- Đại lý/phí giới thiệu (`dm.referral`): khác với giảm giá đại lý/giới thiệu [DN §9].
- THOMAS/Yamato/HubSpot/Cognito: Không có trong tài liệu nhóm này (THOMAS chỉ nhắc ở câu hỏi vật tư kèm theo/CSV chỉ thị xuất hàng [DN §8 #11]).
- Master Thuế suất (dropdown dùng chung), master Vật tư (số lượng miễn phí hàng tháng nay nhập ở thẻ "Thiết bị ban đầu・Vật tư nằm trong gói" của chi tiết master Gói, không ở master Vật tư) [MS §0.12].

## 6. Điểm mở / Cần xác nhận / mâu thuẫn
- Chưa quyết (QT §7): (1) giá chính thức gói 50 ES Lite tủ lạnh (tạm ¥24,500; lần sửa 4 master Gói 10/01 ¥25,000 cho HĐ mới từ tháng 10?) — KH xác nhận; (2) giá gói VM 150/200/300 (giữ ¥74,000/¥96,000/¥139,000, S9=C); (3) tên/số tiền OP000024–035 là 【đề xuất tạm】; (4) phí tủ đông (dòng 174, OP000032/033) — DIPRO xác nhận.
- 【Chờ KH xác nhận】tiền phạt khi lắp đặt lại thiết bị đã rút: ① tính lại từ ngày lắp đặt lại (mặc định) / ② kế thừa phần còn lại + phí lắp đặt lại OP000015 (K4) [QT §3-4].
- REQ-CT-223 trả theo năm vẫn là "chọn hàng tháng hay theo năm (tạm)" [QT §4-7].
- Số tiền [Tạm]: OP000036 ¥2,000, DC000002 ¥3,000×3 tháng, DC000001 5% tối đa ¥5,000, OP000035/OP000003; OP000033 chờ KH [MS Phần II 10/03].
- Tên hiển thị OP000008: QT/MS Phần II-ứng viên ghi "Phí ban đầu"; bảng chuẩn 10/03 ghi "Phí khởi tạo"; DN ghi working tree "Phí thủ tục" (trùng OP000016, Q3). Chuẩn: bảng 10/03 MS = **"Phí khởi tạo"**. OP000030 (phí thủ tục VM, nhập mỗi lần) là khoản gì cần KH xác nhận (`_OPEN一覧` 1003-09); không dùng cho phí thuê [MS Phần II 10/03].
- DN §5 câu hỏi 1 (thu phí vật tư: từ lần 2 hay chỉ phần vượt gói) — MS 10/03 đã ghi cả hai quy tắc song song (OP000036 theo chu kỳ + vượt số lượng miễn phí); DN §4-D4 nêu code lệch (tháng dương lịch vs tháng chu kỳ).
- DN là phân tích code: hằng số hard-code, bản sao OP/DC, `snapshot.ts` không nhân số lần OP000001, `Plan` thiếu trường (số tiền doanh nghiệp chịu, miễn trách, tỷ lệ sắp hết…) [DN §3, §6] — đây là **hiện trạng demo**, không phải yêu cầu; hong 10/03 #10 đã chọn cho các trường này có hiệu lực thực [MS §0.12].
- Tồn đọng master Dòng máy (MS §0.9-2, §0.9-4, Phần IV): nhà sản xuất (master hay giá trị cố định), công thức sức chứa tối đa VM (468), đơn vị nhiệt độ giữ ấm, số tiền thu hồi khi hủy VM (demo ¥150,000), sức chứa tủ đông, báo giá riêng VM, có cho đổi lên kích thước lớn hơn chuẩn (ví dụ 84L ở ES50) bằng thu chênh lệch không.
- Tính trùng giữa phí quản lý thiết bị (OP000012) và phí master Dòng máy: chờ KH [MS Phần IV #3]. Phân loại công khai của Tùy chọn/Giảm giá: "Cần xác nhận" [MS tab Thông tin cơ bản; Phần IV #6].
- Nội dung "tham chiếu cũ" (giữ để tránh nhầm, KHÔNG còn hiệu lực): OP000006 phí nâng cỡ (bãi bỏ), DC000003 (→DC000021), tỷ lệ đông lạnh, ngưỡng miễn phí theo course của master Dòng máy, hộp vật tư "1/2/3 cái", OP000032 [MS Phần III-9, III-10, Phần IV].

## 7. Khi BA phân tích tính năng thuộc nhóm này
1. Số tiền/tên phí: tra ID OP/DC trong bảng chuẩn MS "Những điều đã quyết 2026/10/03"; có đang [Tạm] hoặc "nhập mỗi lần" không? SPEC phải ghi rõ là tạm/chờ KH và KHÔNG viết như số đã chốt (OP000036, DC000001/002, OP000022=0 yên).
2. Tính năng chạm hóa đơn: kiểm lịch 20/25/ngày 1 phát hành, 1 hạn nhập tiền/hóa đơn, kỳ 21–20 của ②, lead time −3…+1, và ngày trừ tiền; có xử lý trường hợp lần đầu không kịp 25 (gộp 2 tháng) và quyết toán thực tế chưa xác nhận?
3. Có đổi giữa tháng (đổi gói, thiết bị, thu hồi, hủy, nghỉ)? Xác định theo hạn chót đặt hàng (ngày 15), có dòng trừ ③ tháng đã trả, nghỉ thì không quyết toán thực tế, hủy thì hóa đơn cuối + tiền phạt (công thức theo từng thiết bị, min 3/12 tháng).
4. Tùy chọn mới/sửa: loại A hay không liên động, hàng tháng hay một lần, trả trước hay trả sau, tự động hay vận hành gắn tay, ai gắn (hợp đồng con), hiệu lực từ hợp đồng con tháng sau; có cần ghi đè số tiền theo hợp đồng (REQ-CT-304) hay "nhập mỗi lần" thì bắt buộc nhập?
5. Giảm giá mới: đối tượng áp dụng (hiện chỉ phí gói được tính), cố định/tỷ lệ/chênh lệch/tham chiếu, thời hạn/số lần, điều kiện tự gắn; có xung đột với DC000013 (không trừ quyết toán thực tế, 1 lần/doanh nghiệp) hoặc DC000021? Hỏi PM nếu đề xuất loại giảm giá thuộc nhóm "không đưa vào master".
6. Thuế: thuế suất lấy từ master thuế suất; làm tròn theo hóa đơn × thuế suất; chú ý phần doanh nghiệp chịu 8% và quyết toán thực tế/hàng thay thế (hiện hard-code 8% trong demo, DN §1-D, §7).
7. Bill One: SPEC có luồng lỗi gửi/gửi lại, hủy-phát hành lại, và không nhập tiền; mọi thông báo/email cần đối chiếu Message List (No.10/14/16/63/64/65/73/74).
8. Trả theo năm/phí đại lý/dùng thử: ① theo năm nhưng ② hàng tháng; phí đại lý bỏ khoản trong dùng thử. Màn hình master: có đủ Nhập/Xuất CSV, xóa logic, lịch sử thay đổi, cảnh báo thoát chưa lưu, loại A không xóa được; giới hạn nhập (60 ký tự…) và dropdown thuế suất?
