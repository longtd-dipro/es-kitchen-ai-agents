# Tồn kho — digest ES-STATION
> Nguồn: `60_Tồn_kho/Tồn_kho.md` · Trạng thái: chuẩn (nguồn chính thức của chủ đề, viết lại 2026-10-05; nếu mâu thuẫn thì `docs/決定台帳.md` là chuẩn) · Digest tạo: 2026-10-08

## 1. Phạm vi & actors
- Tồn kho kho hàng: Web vận hành (AW_) — màn hình tồn kho kho hàng, nút "Ghi nhận tồn kho"/"Hoàn tồn kho" ở góc trên phải [§2-4].
- Tồn kho cơ sở + điều chỉnh/di chuyển/chốt quyết toán thực tích: Web vận hành, menu "Quản lý tồn kho" [§7-1, §7-3].
- Báo cáo kiểm kê: khách hàng ở Web doanh nghiệp (CW_, hỗ trợ chiều rộng smartphone) cho cơ sở chuyến COOL; tài xế (app tài xế) cho cơ sở chuyến giao ES; doanh nghiệp cũng báo cáo được cho cơ sở chuyến giao ES [§5-2, §5-6].
- App người dùng / ESQR: mua hàng làm giảm tồn kho, hiển thị còn/hết/sắp hết [§4].
- Vận hành nhập thay/sửa từ ngày 21 [§5-3].

## 2. Thuật ngữ & định danh
| Thuật ngữ | Gốc Nhật/tên vật lý | Nghĩa ngắn |
|---|---|---|
| Tồn kho kho hàng | Không có trong tài liệu | Số có ở kho picking (Kanto, Kansai〈THOMAS〉, văn phòng ES) [§1] |
| Tồn kho cơ sở | Không có trong tài liệu | Số trong tủ lạnh/máy bán hàng tự động của cơ sở, giữ theo từng cơ sở [§1] |
| Tồn kho lý thuyết | Không có trong tài liệu | Giao hàng − mua − hủy ± điều chỉnh; được phép âm [§1] |
| Tồn kho thực | Không có trong tài liệu | Số đếm khi kiểm kê [§1] |
| Giữ tạm | Không có trong tài liệu | Số giữ bằng đơn hàng trước thanh toán [§1] |
| Tồn kho khả dụng | Không có trong tài liệu | Lý thuyết − giữ tạm [§1] |
| Báo cáo kiểm kê | cũ: "Khai báo kiểm tra tồn kho" | Khai báo kiểm tra tồn kho của cơ sở [§1] |
| Hao hụt quản lý | Không có trong tài liệu | Lý thuyết − thực, quy ra tiền [§1] |
| Cơ sở "không kiểm kê" | cũ: không kiểm tra tồn kho | Thiết lập theo cơ sở [§5-9] |
| Phân loại kho = nơi trả về | Không có trong tài liệu | Đăng ký ES trụ sở chính ở master kho [§2-7] |
- Mã tham chiếu: REQ-PO-xxx, REQ-CT-305, STEP4 W1–W7, Sổ cái E/F/H/I/K/N, mã 28-119…28-127, 28-144/145. Không có ID dạng `DL-yymmdd-nnnn` trong tài liệu này.

## 3. Quy tắc nghiệp vụ đã chốt (BA không được mâu thuẫn)
**Kho hàng**
1. Tồn kho kho = điểm khởi đầu (số kiểm kê) + nhập kho − xuất hàng ± ghi nhận tồn kho; xuất tính theo ngày xuất, ngày xuất theo lead time từng kho [§2-1, §2-5].
2. Nhập kho nhập thủ công theo từng đơn đặt hàng (xem `55_Đặt_hàng_Nhập_mua_Nhập_kho` §8) [§2-2].
3. Ghi nhận tồn kho: màn hình danh sách + "Thêm ghi nhận", nhập riêng số tăng/giảm, ghi phân loại và lý do [§2-3].
4. Hoàn tồn kho: không tạo thủ công đơn hàng sản phẩm; tạo chỉ thị xuất hàng không kèm đặt hàng ở màn hình chuyên dụng, xuất CSV cho THOMAS. Mặc định số hoàn: sản phẩm "không dùng ở menu tiếp theo" = toàn bộ số dư, tick ON; sản phẩm sẽ dùng = 0, OFF; chọn thủ công được [§2-6].
5. Không giữ tồn kho tại trụ sở chính (chỉ là nơi trả về) [§2-7]. Tồn kho vật tư giữ ở văn phòng ES và mọi kho picking; vật tư đóng kèm không trừ tồn kho [§2-8].

**Tồn kho cơ sở**
6. Tăng: giao hàng (cộng dồn theo chuyến, không reset), di chuyển vào, điều chỉnh (+). Giảm: mua ở app/ESQR đã thanh toán, đăng ký hủy, di chuyển ra, điều chỉnh (−) [§3].
7. Chốt kiểm kê → ghi đè tồn kho lý thuyết bằng tồn kho thực, làm điểm bắt đầu kỳ sau; chuyến đến sau ngày kiểm kê tính vào kiểm kê kế tiếp; hạn sử dụng/lô giữ theo chuyến [§3].
8. Chuyển sang hệ thống mới: không khóa mua; lý thuyết bắt đầu từ 0; Web doanh nghiệp hiển thị "Vui lòng thực hiện báo cáo kiểm kê đầu tiên" đến khi báo cáo; không tính hao hụt quản lý đến báo cáo đầu tiên [§3].

**Mua ở app/ESQR**
9. Bỏ giỏ không đổi tồn kho; đơn (trước thanh toán) giữ tạm; thanh toán xong mới trừ tồn kho lý thuyết [§4-1]. Chờ thanh toán 30 phút (nhắc ~15 phút); quá hạn/thất bại/hủy → gỡ giữ tạm [§4-2].
10. Hoàn tiền sau thanh toán không hoàn tồn kho lý thuyết (sửa bằng kiểm kê) [§4-3].
11. Số lượng mua từ menu/lịch sử/yêu thích tối đa = tồn kho khả dụng [§4-4]. Mua bằng quét là ngoại lệ: 1 cái/lần, không đổi số lượng, không kiểm tồn kho, lý thuyết được âm [§4-5].
12. Khả dụng ≤ 0: ẩn ở menu; ở lịch sử/yêu thích hiện "Hãy chờ đón lần xuất hiện tiếp theo.", không xem chi tiết/bỏ giỏ/quét mua; hàng hết trong giỏ bị xóa khi mở lại app [§4-6].
13. "Sắp hết": ngưỡng = làm tròn xuống (số đơn hàng của cơ sở × tỷ lệ sắp hết theo gói); hiển thị khi khả dụng > 0, ngưỡng ≥ 1, khả dụng ≤ ngưỡng; không hiện số còn; doanh nghiệp không bật/tắt; đã bỏ quy định "gói 100 trở xuống không hiển thị" [§4-7].
14. Sửa thủ công "Hủy" → "Đã thanh toán" bắt buộc có lý do và log [§4-8].

**Báo cáo kiểm kê**
15. 1 lần/tháng, kỳ ngày 21 → ngày 20 tháng sau [§5-1]. Khách khai báo lại nhiều lần đến ngày 20 (cái cuối có hiệu lực); từ ngày 21 vận hành thêm/sửa thay [§5-3].
16. Chuyến COOL: khách báo cáo. Chuyến giao ES: tài xế + doanh nghiệp/cơ sở đều báo cáo được; nếu cả hai trong cùng tháng, báo cáo cuối cùng có hiệu lực [§5-2].
17. Màn hình liệt kê sản phẩm, nhập số cho toàn bộ (không có = 0), thêm sản phẩm ngoài danh sách bằng quét, đăng ký sản phẩm hủy tại đây, kiểm cả sản phẩm đang trên đường [§5-4].
18. Kiểm kê/bảng kiểm tra hằng tháng không hiện tồn kho lý thuyết; bảng kiểm xuất PDF (tài xế xem lý thuyết khi xác nhận/hủy lúc giao chuyến giao ES là tình huống khác) [§5-5].
19. Cơ sở không khai báo: không giữ lại thanh toán, cộng phí ¥3,000; phán định ngày 25; không cộng cho cơ sở vận hành đã nhập thay 21–25 [§5-7].
20. Nhắc hằng tuần; không gửi và không coi là chưa khai báo với cơ sở đang tạm dừng [§5-8]. Cơ sở "không kiểm kê": không hao hụt, nhắc, phí; vận hành hiển thị "Không kiểm tra" [§5-9]. Hợp đồng "mua đứt món ăn kèm" ngoài đối tượng quản lý tồn kho [§5-10].
21. Tạm dừng: kiểm kê ở tháng giao cuối trước khi dừng, quyết toán đến lúc đó; không quyết toán khi dừng; chênh lệch bán trong thời gian dừng quyết toán khi tiếp tục (hoặc khi hủy hợp đồng) [§5-11]. Hủy hợp đồng: tồn còn lại ghi vào hóa đơn cuối dạng mua lại = tồn tính toán × đơn giá bán [§5-12].

**Hao hụt & quyết toán thực tích**
22. Hao hụt quản lý quy tiền theo giá chuẩn trước điều chỉnh giá; thanh toán phần vượt số tiền miễn trừ theo gói (ví dụ 300 yên với gói 100); phần trong phạm vi do ES chịu [§6-1]. Hủy do hết hạn về nguyên tắc không thanh toán [§6-2].
23. Quyết toán thực tích có 3 hạng mục: hao hụt quản lý, chênh lệch thu tiền mặt, chênh lệch điều chỉnh giá; chốt từng hạng mục, cả 3 bắt buộc (kể cả không có đối tượng); điều chỉnh tồn kho tùy chọn [§6-3]. Tháng đã chốt không sửa điều chỉnh; lỗi phát hiện sau bù trừ ở tháng sau [§6-4]. Khi chốt lưu bản sao theo tháng, quá khứ chỉ tham chiếu bản sao [§6-5].

**Vận hành**
24. Điều chỉnh tồn kho thủ công (di chuyển giữa cơ sở, đổi hàng hỏng/lỗi): bắt buộc lý do, lưu lịch sử người đăng ký, lưu xong phản ánh ngay (không có đơn/phê duyệt), không điều chỉnh do doanh nghiệp trả hàng; di chuyển vượt doanh nghiệp khác do khách tự làm, hệ thống không tính chi phí [§7-3]. Chọn nhiều cơ sở để điều chỉnh hàng loạt [§7-4].
25. Tỷ lệ chênh lệch = (lý thuyết − khai báo) ÷ lý thuyết; |giá trị| ≥ 10% tô màu (cả âm). Tỷ lệ hủy = hủy ÷ (tồn kỳ trước + giao hàng), tô màu ≥ 10%; áp dụng cho 2 màn hình điều chỉnh tồn kho và chốt quyết toán thực tích; 10% là tạm [§7-5]. Hủy > 3% cảnh báo trên dashboard, không popup [§7-9].
26. Trước kiểm kê chỉ hiện tồn tính toán; sau kiểm kê hiện thêm số khai báo và chênh lệch [§7-2]. Số bán = bán ở app − đã hoàn tiền [§7-8]. Dòng không cảnh báo chốt hàng loạt được [§7-6]. Lọc theo tháng (mặc định tháng hiện tại, quá khứ chỉ xem), doanh nghiệp, cơ sở, kiểm kê trước/sau, quyết toán đã/chưa chốt [§7-7].

## 4. Trạng thái & dữ liệu chính
- Máy trạng thái: Không có trong tài liệu (chỉ có trạng thái "kiểm kê trước/sau" và "quyết toán thực tích đã chốt/chưa chốt" ở bộ lọc [§7-7]).
- Dữ liệu chính (khái niệm): tồn kho kho hàng, tồn kho cơ sở (lý thuyết/thực/giữ tạm/khả dụng, theo chuyến có hạn sử dụng/lô), tồn kho vật tư, ghi nhận tồn kho, chỉ thị xuất hàng không kèm đặt hàng, báo cáo kiểm kê (trạng thái, ngày, người, phương pháp [§7-1]), bản sao theo tháng [§6-5]. Tên bảng/cột vật lý: Không có trong tài liệu.
- Số chính: chờ thanh toán 30 phút; kỳ 21→20; khai báo đến 20; chốt chính thức và chốt thanh toán ngày 25; phí ¥3,000; ngưỡng tô màu 10% (tạm); cảnh báo hủy >3% [§8].

## 5. Liên kết với nhóm khác & hệ thống ngoài
- `55_Đặt_hàng_Nhập_mua_Nhập_kho` §8: nhập kho thủ công [§2-2].
- `40_Master_Phí_Thanh_toán/Quy_tắc_thanh_toán_Đặc_tả_v1.md`: thời điểm/chứng từ thanh toán [§6-6]; master gói: tỷ lệ sắp hết, số tiền miễn trừ.
- Giao hàng (chuyến, xác nhận tồn kho/hủy của tài xế), Hợp đồng (tạm dừng, hủy, mua đứt món ăn kèm), Đơn hàng/giỏ hàng (giữ tạm).
- THOMAS: kho Kansai và nhận CSV chỉ thị xuất hoàn tồn kho [§1, §2-6]. Yamato/Bill One/HubSpot/Cognito: Không có trong tài liệu.
- Nguồn quyết định: Sổ cái E, F, H, I, K, N, B; STEP4 W1–W7; STEP5 (kiểm tra tồn kho); v2.3 §18 (28-118…126). Tham khảo diễn biến app/ESQR: `docs/議事録_仕様/Flow tồn kho_for dev.md`.

## 6. Điểm mở / Cần xác nhận / mâu thuẫn
- U3: giá trị tỷ lệ sắp hết (theo từng gói) — "Quyết định khi vận hành" [§9].
- Ngưỡng tô màu 10% là "tạm thời cố định" [§7-5].
- Phí thủ tục ¥3,000 ghi "(chưa kiểm tra)" trong bảng số liệu [§8].
- (suy luận) Mốc "ngày 25" vừa là chốt chính thức/phán định phí vừa là chốt thanh toán [§5-7, §8]; "vận hành nhập thay 21–25" khác với "từ ngày 21 vận hành thêm/sửa" ở §5-3 — nên xác nhận giới hạn thời gian sửa sau ngày 25.

## 7. Khi BA phân tích tính năng thuộc nhóm này
1. Tính năng thuộc tồn kho kho hàng hay tồn kho cơ sở? Ảnh hưởng tồn lý thuyết hay khả dụng (giữ tạm)?
2. Luồng mua có phân biệt mua thường (giới hạn theo khả dụng) và mua bằng quét (ngoại lệ, cho phép âm)? Hiển thị hết hàng/"sắp hết" đã đúng §4-6, §4-7 chưa?
3. Cơ sở thuộc chuyến COOL hay giao ES (ai báo cáo; xử lý khi cả tài xế và doanh nghiệp cùng báo cáo)? Có ngoại lệ không kiểm kê, tạm dừng, mua đứt món ăn kèm?
4. Mốc ngày 20/21/25 áp dụng thế nào cho nhập thay, phí ¥3,000 và chốt thanh toán? Hỏi PM giới hạn sửa sau ngày 25.
5. Hoàn tiền, hủy hết hạn, điều chỉnh sau khi tháng đã chốt quyết toán thực tích: có đúng §4-3, §6-2, §6-4?
6. Hao hụt: số tiền miễn trừ và tỷ lệ sắp hết theo gói lấy từ master gói nào (U3 chưa có giá trị)? Ngưỡng 10% và 3% có đổi được không?
7. Điều chỉnh/di chuyển tồn kho: có lý do, lịch sử, phản ánh ngay; bản sao theo tháng có được tính đến chưa?
8. Giai đoạn chuyển hệ thống: banner báo cáo kiểm kê đầu tiên và việc không tính hao hụt trước báo cáo đó.
