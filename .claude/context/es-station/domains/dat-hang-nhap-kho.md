# Đặt hàng · Trang nhà cung cấp · Nhập kho — digest ES-STATION
> Nguồn: `55_Đặt_hàng_Nhập_mua_Nhập_kho/Đặt_hàng_Nhập_mua_Nhập_kho.md` · Trạng thái: chuẩn (tài liệu chuẩn tổng hợp 2026-10-05; sổ cái quyết định `docs/決定台帳.md` mục I là chuẩn nếu mâu thuẫn; tài liệu gốc REQ-PO đã đóng băng) · Digest tạo: 2026-10-08
## 1. Phạm vi & actors
- Web vận hành (AW_): đặt hàng tạm/chính/bổ sung, sửa/hủy, ghi nhận nhập kho, xử lý chênh lệch, master nhà cung cấp, "Xác nhận đăng ký" [§1, §4, §6, §8, §10].
- Web nhà cung cấp (trang NCC): "Danh sách đơn nhận", phản hồi ngày giao, phê duyệt đặt hàng chính, giao từng phần, báo cáo xuất hàng [§5].
- Vai trò vận hành: quản lý hệ thống (nhận nhắc nhở đặt hàng chính, nhập kho), "nhân viên kho" (nhập kho) [§1, §8-2].
- Không nhắc tới trong tài liệu: Web doanh nghiệp, App tài xế, App người dùng, Web công ty vận chuyển.
- Đặt hàng theo từng kho (Kanto・Kansai); vật tư đặt về văn phòng ES [§2-1, §9].
## 2. Thuật ngữ & định danh
| Thuật ngữ Việt | Gốc/tên | Nghĩa ngắn |
|---|---|---|
| Đặt hàng tạm | (không ghi gốc) | Nhờ NCC chuẩn bị trước lượng nhất định, trước khi công khai menu [§1] |
| Đặt hàng chính nửa đầu/sau | — | Nửa đầu = chuyến tuần A・B; nửa sau = tuần C・D [§1] |
| Đặt hàng bổ sung | — | Phần tăng sau hạn chót; tạo dữ liệu đặt hàng chính mới + lý do [§1] |
| Danh sách đơn nhận | — | Tên danh sách phía NCC [§5-1] |
| Số đặt hàng | `PO-YYYYMM-mã hàng-U01` (thường); `PO-YYYYMM-mã hàng-ký hiệu kho+Slot` (hạn tiêu thụ ngắn) | Không chứa ký hiệu nửa đầu/sau [§2-14] |
| ID nhà cung cấp | tiền tố `SP` (`HU` = điểm trung chuyển) | [§6-5] |
| Phương thức đặt hàng | ES Station / Email / Bên ngoài | [§6-3] |
| Mã tham chiếu | REQ-PO-xxx, Sổ cái I/E/H/J/K/N, U2..U6 | Mã yêu cầu/quyết định [đầu file] |
## 3. Quy tắc nghiệp vụ đã chốt (BA không được mâu thuẫn)
1. Đặt hàng tạm làm TRƯỚC khi công khai menu; điều kiện công khai có "phê duyệt đặt hàng tạm" [§1].
2. Đặt hàng chính nửa đầu: B5〜C1 chu kỳ trước; nửa sau: D5〜A1 chu kỳ kế; nhắc đầu kỳ và ngày cuối kỳ cho quản lý hệ thống [§1].
3. Đặt hàng bổ sung lấy ngày cơ sở B7・D7; lưu lý do [§1].
4. Vật tư: không có đặt hàng tạm, chỉ đặt hàng chính theo từng lần [§1, §9].
5. Chốt đặt hàng tự động theo hạn chót đặt đơn; không có chốt/hủy chốt thủ công [§1, REQ-PO-108・109].
6. Dời ngày chuyến đã qua đặt hàng chính: từng chuyến, bắt buộc lý do, trong cùng nửa (A↔B / C↔D); khác nửa/chu kỳ chỉ khi xử lý sự cố [§1].
7. Số lượng cần = đơn cơ sở thuộc hợp đồng + đơn dùng thử + mẫu kinh doanh; tổng hợp & đặt theo kho; sản phẩm–kho nhiều-nhiều [§2-1].
8. Phần hợp đồng đăng ký tạm hiển thị riêng là "tạm"; không tạo dữ liệu giao hàng có ngày gửi trống [§2-2].
9. Không hiển thị "dự đoán"; chỉ hiện số đặt/đơn 2〜3 lần gần nhất để tham khảo, con người quyết định [§2-4].
10. Sản phẩm có lot: số lượng làm tròn lên theo lot (sửa tay được); không có ô dự phòng, dùng nút +3/+5/+10 [§2-5, §2-6].
11. Ngày nhập kho mong muốn mặc định = ngày hôm đó (tính ngược lịch picking), có nút 1/2 ngày trước; bắt buộc màn hình xác nhận trước khi chốt [§2-8, §2-11].
12. Đặt hàng tạm hàng loạt chỉ cho sản phẩm cùng ngày nhập kho mong muốn・hạn dùng; sản phẩm theo tuần (salad) đặt ở màn chi tiết [§2-10].
13. Sửa số lượng chỉ đến khi NCC phê duyệt đặt hàng chính; sau đó tăng = đặt bổ sung, giảm = hủy rồi đặt lại; mọi thay đổi ghi tab "Lịch sử thay đổi" [§4-1..4-3].
14. Thiếu hàng phát hiện khi nhập kho: KHÔNG tự động giảm đơn; vận hành chọn cách xử lý [§4-4, §8-4].
15. NCC: không hiển thị số tiền (đơn giá, số tiền, CSV); dùng tên dành cho NCC; không hiện ranh giới nửa đầu/sau [§5-2..5-4].
16. Phê duyệt đặt hàng chính bắt buộc: ngày giao, số thùng nhập kho, hạn sử dụng; chưa phê duyệt thì không báo cáo xuất hàng [§3, §5-5].
17. Giao từng phần: tối đa 3 lần (đổi được bằng cài đặt vận hành), ngày mỗi lần ≤ ngày nhập kho mong muốn ban đầu, không cần vận hành duyệt (chỉ thông báo trên màn hình, không email) [§5-6].
18. Báo cáo xuất hàng: phương thức giao bắt buộc, công ty vận chuyển chọn từ danh sách, số vận đơn tùy chọn; mặc định lấy lần trước [§5-7].
19. Số thùng × lot không khớp số lượng → xác nhận (vẫn tiếp tục); số thùng > số lượng → không đăng ký được [§5-8].
20. Hạn tiêu thụ ngắn: nhập/lưu hàng loạt ở danh sách xuất hàng, chuyển hàng loạt sang "đã xuất hàng" [§5-9].
21. 1 công ty 1 tài khoản; người phụ trách chính/phụ là các địa chỉ nhận email; hồ sơ lưu vào master vận hành, không cần duyệt [§5-11, §5-12].
22. Phương thức "Bên ngoài": không gửi email nào (kể cả cảnh báo); vận hành nhập thay phản hồi/phê duyệt/xuất hàng [§6-3].
23. Phân loại NCC (thường/hạn tiêu thụ ngắn) theo từng sản phẩm; 1 công ty xử lý cả hai [§6-4].
24. Phòng ngừa sót đơn: kiểm tra mỗi 24 giờ (chỉ ngày làm việc theo cờ T7/CN/lễ của NCC), gửi email cảnh báo lặp lại đến khi xử lý [§6-2, §7-1].
25. Email NCC cùng nội dung cho NCC đăng nhập và NCC email; không đính kèm PDF, không kèm liên kết phản hồi; vận hành nhập thay được cho mọi NCC [§7-3].
26. Nhập kho: xuất CSV chỉ thị cho THOMAS; KHÔNG nhập CSV kết quả; nhập tay số lượng + số thùng theo từng đơn/lần giao [§8-1, §8-2].
27. Hạn sử dụng/tiêu thụ bắt buộc với mọi sản phẩm khi nhập kho; mặc định lấy hạn NCC đã nhập [§8-2b, §11].
28. Khớp = số lượng bằng đơn (giao từng phần từ lần 2 là phần còn lại); chỉ khác số thùng vẫn khớp [§8-3].
29. NCC lùi ngày nhập kho: giao hàng không tự dời, cảnh báo vận hành [§8-5].
30. Không tạo màn hình chỉ có lịch sử đặt hàng; không tạo màn hình/CSV chỉ danh sách thanh toán NCC [§10-1, §10-2b].
## 4. Trạng thái & dữ liệu chính
- Luồng: Đặt hàng tạm → Chờ phản hồi ngày giao → Đã phản hồi ngày giao → Đặt hàng chính → Chờ phê duyệt đặt hàng chính → Đã phê duyệt đặt hàng chính → Đã xuất hàng → Đã nhập kho; ngoài luồng: Không nhận đơn (NCC), Hủy (vận hành) [§3, REQ-PO-111].
- Ai chuyển: NCC phản hồi ngày giao; vận hành đặt hàng chính; NCC (hoặc vận hành nhập thay) phê duyệt; NCC báo cáo xuất hàng; ghi nhận nhập kho → Đã nhập kho, nếu chênh lệch thì "Có chênh lệch・Chờ xử lý" [§3, §8-4].
- Không nhận đơn: chọn lý do + bình luận bắt buộc; vận hành sắp xếp NCC khác hoặc hủy. Hủy không xóa, vẫn hiện trên màn NCC [§3].
- Chênh lệch có 3 cách xử lý: chờ giao từng phần; xử lý bằng hàng thay thế; chấp nhận thiếu (chuyến ảnh hưởng thành "chỉ loại trừ", không thanh toán, liên hệ doanh nghiệp); không cần chọn ngay [§8-4].
- Dữ liệu: đơn đặt hàng (chi tiết, lịch sử thay đổi, các lần giao từng phần), master NCC (phương thức đặt hàng, cờ ngày làm việc, người phụ trách), trạng thái đối chiếu thanh toán (đã xác nhận hóa đơn NCC) [§6, §10-1, §10-2]. Tên bảng/cột vật lý: Không có trong tài liệu.
## 5. Liên kết với nhóm khác & hệ thống ngoài
- THOMAS: CSV chỉ thị nhập kho xuất sang; không nhập CSV kết quả; vật tư không liên kết THOMAS [§8-1, §9].
- `60_Tồn_kho/Tồn_kho.md` §2: nhập kho làm tăng tồn kho; kiểm kê [§8-6]. Tồn kho vật tư ở văn phòng ES và mọi kho picking [§9].
- `65_Hàng_thay_thế/Hàng_thay_thế.md`: số lượng hàng thay thế hiện trên màn đặt hàng, xử lý chênh lệch [§8-4, §10-4].
- `50_Đơn_hàng/Đơn_hàng.md` §9 (đơn vật tư khách); `30_Đơn_yêu_cầu/Danh_sách_email_Đặt_hàng_Nhà_cung_cấp_Nhập_kho_20261001.md` (email S1〜S11) [§7-4, §9].
- Giao hàng (dời ngày chuyến) xem đặc tả giao hàng; công khai menu; gói dùng thử/mẫu kinh doanh/đăng ký tạm (hợp đồng) [§1, §2].
- Yamato/Bill One/HubSpot/Cognito: Không có trong tài liệu. Reset mật khẩu bằng mã xác thực (sổ cái K) [§5-11].
## 6. Điểm mở / Cần xác nhận / mâu thuẫn
- U2: địa chỉ nhận trả lời email (đầu mối đặt hàng) — chờ xác nhận khách [§12].
- U3: đưa việc tăng số lượng khách vào số tham khảo đặt hàng tạm thế nào (REQ-PO-115) — chờ khách [§12].
- U4: hình thức NCC phản hồi đặt hàng tạm (OK/NG với ngày giao mong muốn, lý do, phương án thay thế); đã quyết một phần (không nhận đơn + bình luận), còn lại chờ khách [§12].
- U6: mã hóa ký tự CSV THOMAS (UTF-8 được không) — chờ vendor [§12].
- (U1, U5 không xuất hiện trong tài liệu này.)
## 7. Khi BA phân tích tính năng thuộc nhóm này
1. Tính năng thuộc đặt hàng tạm, chính hay bổ sung? Đã đối chiếu mốc B5〜C1 / D5〜A1 / B7・D7 và điều kiện công khai menu chưa [§1]?
2. Phương thức đặt hàng của NCC (ES Station / Email / Bên ngoài) ảnh hưởng thế nào đến email, phê duyệt, nhập thay [§6-3, §7-3]?
3. Màn hình NCC có lộ số tiền hoặc tên công khai không (cấm) [§5-2, §5-3]?
4. Sau phê duyệt, yêu cầu sửa số lượng phải đi qua đặt bổ sung/hủy-đặt lại, có ghi lịch sử không [§4]?
5. Luồng nhập kho đã xử lý đủ khớp/chênh lệch (3 cách), hạn sử dụng bắt buộc, giao từng phần tối đa 3 lần chưa [§5-6, §8]?
6. Có đụng đến vật tư (không đặt hàng tạm, nơi nhận văn phòng ES, không THOMAS) không [§9]?
7. Tính năng có cần câu trả lời cho U2/U3/U4/U6 trước khi chốt SPEC không; nếu có, đưa vào Q&A hỏi khách [§12].
8. Có định tạo màn hình lịch sử đặt hàng riêng hoặc danh sách thanh toán NCC riêng (đã bị loại) không [§10-1, §10-2b]?
