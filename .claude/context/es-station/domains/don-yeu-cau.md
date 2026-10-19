# Đơn yêu cầu & phê duyệt (8 loại đơn thay đổi) — digest ES-STATION
> Nguồn: `30_Đơn_yêu_cầu/Đơn_yêu_cầu_và_phê_duyệt.md` · Trạng thái: chuẩn (nguồn chính thức của chủ đề; mâu thuẫn với `docs/決定台帳.md` thì sổ cái đúng; các file cũ về màn hình chi tiết/kiểm tra nhập liệu §4/email Phần 1/影響範囲 đã đóng băng) · Digest tạo: 2026-10-08

## 1. Phạm vi & actors
- Web doanh nghiệp (CW_): gửi đơn, xem danh sách "Đơn đăng ký", rút lại, "Chỉnh sửa" thông tin cơ sở/doanh nghiệp [§1, §5].
- Web vận hành (AW_): quản lý đơn đăng ký hợp đồng, phê duyệt/từ chối, "Nhập hộ đơn đăng ký thay đổi" [§3-8, §7].
- Công ty giao hàng ủy thác (Web công ty vận chuyển): nhận thông báo khi hủy hợp đồng, nhận yêu cầu báo giá khi đổi chuyến giao ES [§6-2, §6-8].
- App người dùng: bị ảnh hưởng (mua khi tạm dừng/hủy) [§6-6, §6-8]. Không có app tài xế trong tài liệu (nhân viên giao hàng nội bộ chỉ nhận thông báo màn hình [§6-8]).
- Actors: tài khoản doanh nghiệp (xem/gửi toàn công ty), tài khoản cơ sở (chỉ cơ sở mình), quản trị viên vận hành có quyền (ai cũng phê duyệt được) [§9, §3-6].
- Ngoài phạm vi: đăng ký mới/thêm cơ sở/chuyển dùng thử→chính thức (`Form_đăng_ký.md`), đổi ngày giao `DD-` (#63), tính thanh toán [§0-2].

## 2. Thuật ngữ & định danh
| Thuật ngữ | Gốc/tên vật lý | Nghĩa ngắn |
|---|---|---|
| Số đơn thay đổi | `CH-YYYYMMDD-NNNN` | NNNN theo thứ tự trong ngày [§1] |
| Đổi ngày giao | `DD-` | Tách riêng khỏi `CH-` [§1] |
| Tháng chu kỳ bắt đầu | (không có tên vật lý) | Tháng chu kỳ đơn bắt đầu có hiệu lực [§4-1] |
| Hạn chốt đặt hàng | mặc định ngày 15 tháng trước | Quyết định tháng bắt đầu [§4-1] |
| Cần xác nhận hạn đơn | `change_request_due` / `change_request_warn_days` (mặc định 3) | Cảnh báo 3 ngày trước hạn chốt [§3-7] |
| Giới hạn tạm dừng | `PAUSE_MAX=12` | Tổng cộng 12 tháng [§6-6] |
| Tùy chọn OP | `OP000001` thêm số lần giao; `OP000007` đại diện lắp đặt; `OP000015` phí lắp đặt lại; `OP000019/020` phí giao hàng thiết bị; `OP000023` chênh lệch kích thước (hằng tháng) | [§6-2, 6-3, 6-6] |
| Giảm giá | `DC000021` (chênh lệch nâng cấp Standard; `DC000003` đã gộp vào) | Không tự gắn khi phê duyệt Lite→Standard [§6-1] |
| Chỉ thông báo | | Phản ánh ngay + thông báo vận hành [§2] |
| Chỉ vận hành | | Web doanh nghiệp chỉ xem [§2] |
| Nhập hộ | | Vận hành lập đơn thay khách [§3-8] |
- Email: M4 tiếp nhận, M5 phê duyệt, M6 từ chối, M7 rút lại, M8 thông báo vận hành, M9 dừng giao (ủy thác), No.16 dừng tài khoản [§10].

## 3. Quy tắc nghiệp vụ đã chốt (BA không được mâu thuẫn)
1. 8 loại đơn: thay đổi gói/giao hàng/thiết bị/thông tin cơ sở/thông tin doanh nghiệp, tạm dừng, mở lại, hủy hợp đồng. Thông tin doanh nghiệp chỉ tài khoản doanh nghiệp gửi [§1].
2. Không có thủ tục "thay đổi người phụ trách cơ sở" (sửa bằng "Chỉnh sửa") [§1].
3. Phân loại phê duyệt theo TỪNG MỤC, 4 loại: bắt buộc phê duyệt / chỉ thông báo / không cần phê duyệt / chỉ vận hành [§2].
4. Doanh nghiệp: tên các loại + người phụ trách = chỉ thông báo (bắt buộc 1 chính + 1 phụ trách thanh toán); địa chỉ hóa đơn/điện thoại/FAX = bắt buộc phê duyệt; lead time/đơn vị phát hành hóa đơn/phương thức & chu kỳ thanh toán... = chỉ vận hành [§2-1].
5. Cơ sở: tên/furigana/địa chỉ/điện thoại/nơi nhận hóa đơn/ngày không nhận hàng/ngày mong muốn thiết bị = bắt buộc phê duyệt; FAX cơ sở, số nhân viên, ghi chú, giới hạn số lượng-tiền = phản ánh ngay; Guest mode = chỉ thông báo (thay D5); ES-QR = chỉ vận hành [§2-2].
6. Gói/course, loại giao hàng & số lần giao, thiết bị = bắt buộc phê duyệt; mẫu/chu kỳ/tuyến giao, điều chỉnh giá, tùy chọn, giảm giá = chỉ vận hành [§2-3].
7. 1 đơn 1 loại (ngoại lệ: mở lại sửa được nơi giao/người phụ trách/gói); 1 đơn nhiều cơ sở; phê duyệt/từ chối THEO TỪNG CƠ SỞ (thông tin doanh nghiệp = 1 doanh nghiệp) [§3-1, §3-2, §6-7].
8. Trạng thái đơn: chờ phê duyệt / đang xử lý n/m / đã phê duyệt / phê duyệt một phần / từ chối / đã rút lại. Đã phê duyệt chỉ để xem, muốn sửa thì gửi đơn mới; KHÔNG có "Làm lại" [§3-2].
9. Cơ sở đang có đơn chờ phê duyệt không chọn được đơn mới (kể cả hủy hợp đồng, kể cả nhập hộ); ô bắt buộc phê duyệt bị khóa [§3-3].
10. Rút lại: chỉ cơ sở chưa xử lý; chỉ tài khoản đã gửi hoặc tài khoản doanh nghiệp rút được [§3-4].
11. Từ chối: lý do bắt buộc (mẫu + tự do), thông báo theo từng cơ sở, không trả lại để sửa [§3-5].
12. Khi phê duyệt, nếu "giá trị trước thay đổi" ≠ giá trị hiện tại thì dừng phê duyệt để vận hành xác nhận; thiết lập bắt buộc trước phê duyệt chưa xong thì cơ sở không phê duyệt được [§3-6].
13. Tự phê duyệt (người lập = người duyệt) được phép, lưu lịch sử [§3-6].
14. Hạn xử lý = hạn chốt đặt hàng; cảnh báo 3 ngày trước; quá hạn KHÔNG tự động từ chối [§3-7].
15. Nhập hộ: không đổi trạng thái trực tiếp ở màn hình cơ sở/hợp đồng con; lưu kênh tiếp nhận + người nhập; không có ngoại lệ dù sát hạn chốt [§3-8].
16. Tháng bắt đầu: trước hạn chốt → chu kỳ tháng kế tiếp, quá hạn → tháng sau nữa; phê duyệt sau hạn chốt vận hành chọn "dời kỳ sau" hoặc "đặt hàng hộ" [§4-1, §4-2].
17. Không áp dụng thay đổi cho chu kỳ đã phát hành hóa đơn; không hủy dữ liệu giao hàng đã có chỉ thị xuất hàng [§4-3].
18. Tháng đã thanh toán (năm/trả trước): tự tạo "chi tiết điều chỉnh" chênh lệch đủ tháng, ghi vào hóa đơn kế tiếp, không tính theo ngày [§4-4].
19. Thay đổi gói: tính lại hợp đồng con/số lượng giao/đơn hàng mặc định; phê duyệt trong thời gian đặt hàng thì đưa đơn hàng chu kỳ đó về mặc định + thông báo; Lite→Standard không tự gắn DC000021; Lite tủ lạnh→máy bán hàng tự động bắt buộc "Kết quả khảo sát hiện trường" [§6-1, §13 B7].
20. Thay đổi giao hàng: máy bán hàng tự động cố định = chuyến giao ES không đổi được; giảm số lần giao dưới tiêu chuẩn được (phí không giảm); yêu cầu báo giá ủy thác không bắt buộc [§6-2].
21. Thay đổi thiết bị: chi phí thay thế báo giá từng lần (vận hành nhập); tăng kích thước chênh lệch thu hằng tháng qua `OP000023`; đổi dòng máy kế thừa thời gian dùng tối thiểu của máy cũ [§6-3].
22. Tạm dừng: lý do bắt buộc (6 lựa chọn), tháng dự kiến mở lại bắt buộc (không "Chưa định"), tổng tối đa 12 tháng; thiết bị thu hồi (mặc định)/để nguyên; không quyết toán thực tế trong thời gian dừng, kiểm tồn lúc bắt đầu; chu kỳ quá hạn chốt vẫn giao; vẫn đăng nhập được [§6-6].
23. Mở lại: kế thừa phần còn lại thời gian dùng tối thiểu (thiết bị thu hồi chọn ① tính lại ② kế thừa + `OP000015`); tạo lại hợp đồng con từ chu kỳ mở lại [§6-6, §6-7].
24. Hủy hợp đồng: ngày hủy = cuối chu kỳ trở đi; hạn tiếp nhận theo hạn chốt đặt hàng (không phân biệt tủ lạnh/máy bán hàng); gửi được cả khi đang tạm dừng; phí vi phạm theo từng thiết bị = số tiền thu hồi × tháng còn lại ÷ thời gian dùng tối thiểu (tủ lạnh 3, máy bán hàng 12); 1 hóa đơn cuối tháng sau; không tạo giao hàng thu hồi [§6-8].
25. Phê duyệt hủy: tự động thông báo công ty giao hàng ủy thác (Web + email); cơ sở chỉ tự giao thì thông báo màn hình nội bộ; Web doanh nghiệp chỉ xem đến hạn thanh toán hóa đơn cuối, hôm sau dừng [§6-8, §10].
26. Phạm vi xem: tài khoản doanh nghiệp = cả công ty, cơ sở = chỉ cơ sở mình; Web doanh nghiệp không hiển thị người/ngày giờ phê duyệt [§5-1, §11]. Không xóa đơn, chỉ đổi trạng thái [§11].

## 4. Trạng thái & dữ liệu chính
- Đơn (cấp đơn): chờ phê duyệt → đang xử lý n/m → đã phê duyệt / phê duyệt một phần / từ chối; "đã rút lại" do doanh nghiệp. Suy ra từ trạng thái từng cơ sở [§3-2].
- Cơ sở trong đơn: chờ phê duyệt / đã phê duyệt / từ chối / đã rút lại; vận hành chuyển (phê duyệt/từ chối), doanh nghiệp chuyển (rút lại) [§3-2, §3-4].
- Hủy hợp đồng: phê duyệt → hợp đồng cha "Đang làm thủ tục hủy" + cơ sở "Dự kiến đóng"; ngày hủy → "Kết thúc"/"Đóng" [§6-8].
- Tạm dừng: không giữ trong trạng thái cơ sở, hiển thị "Đang tạm dừng" từ hợp đồng cha + lịch sử tạm dừng; hợp đồng con đã tạo giữ "Hủy" [§6-6].
- Dữ liệu: bảng đơn (người đăng ký = tài khoản + người phụ trách đã chọn + họ tên lúc đó, lý do, kênh tiếp nhận), chi tiết đơn theo cơ sở (giá trị trước/sau, tháng bắt đầu), lịch sử thay đổi, lịch sử tạm dừng (1 lần = 1 dòng) [§11].
- Chi tiết bảng thực thể: Không có trong tài liệu này (xem 契約_03〜05).

## 5. Liên kết với nhóm khác & hệ thống ngoài
- `20_Doanh_nghiệp_Cơ_sở_Hợp_đồng/`: `Form_đăng_ký.md` (§10-1 danh sách vận hành), Web doanh nghiệp Đặc tả màn hình v1, 契約_01/03/04/05 [§0-1, §7-1].
- Đặc tả giao hàng (#63, DD-, tuyến giao, batch ban đêm, yêu cầu báo giá ủy thác STEP4 A1) [§0-2, §6-2].
- Quy tắc thanh toán/hóa đơn: hóa đơn cuối, chi tiết điều chỉnh, phí vi phạm [§4-4, §6-8].
- Bill One: đổi nơi nhận hóa đơn → đổi ID nơi phát hành, hiển thị trạng thái trên màn hình; hóa đơn ngày 25 chốt, phát hành ngày 1 tháng sau [§6-4, §8-2].
- Đơn hàng hằng tháng/đặt hàng tạm (REQ-PO-115 sang Phase2), phiếu vận chuyển (voided), danh sách cho thuê, tồn kho/kiểm kê [§6-1, §6-4, §6-6].
- Bảng phân quyền Web vận hành (7 vai trò), CSV nhập/xuất [§9, §11]. THOMAS/Yamato/HubSpot/Cognito: Không có trong tài liệu.

## 6. Điểm mở / Cần xác nhận / mâu thuẫn
- B8: câu chữ 6 lựa chọn lý do tạm dừng đang xác nhận với khách (màn hình hiện tại có 5; `1003-11`) [§6-6, §12, §13].
- B11: lý do hủy hợp đồng và kịch bản giữ chân chờ bản gốc của khách (anh Aoyama; `1003-12`) [§6-8, §13].
- Cách xử lý thời gian dùng tối thiểu của thiết bị đã thu hồi khi mở lại (① hay ②) đã trả lời nhưng "chờ khách hàng xác nhận" (K4) [§6-6].
- Email M5 trong Excel còn câu cũ (P5) "quyết toán thực tế khi tạm dừng gộp khi mở lại/hủy" — đã bị TL-2 thay thế, cần sửa Excel [§10].
- Hướng dẫn Web doanh nghiệp hiện "không đăng ký chồng cùng thủ tục" lệch 28-4 (không chồng bất kể loại) [§12].
- Hạn xử lý đơn Lite tủ lạnh→máy bán hàng tự động không theo hạn chốt, không cảnh báo 3 ngày [§13].
- Đã chốt (đừng hỏi lại): B12 người kiểm tồn lúc tạm dừng = cơ sở (trước đó §6-6 ghi "chưa có trả lời"); B4-2 tên trạng thái "Đang xử lý n/m" [§13].
- Phase2: thông báo đại lý, chênh lệch giới thiệu khi đổi gói, đặt hàng tạm; liên động tồn kho/vật tư sau khi chốt đặc tả [§6-1, §8-2].

## 7. Khi BA phân tích tính năng thuộc nhóm này
1. Mục dữ liệu đang đề cập thuộc loại nào trong 4 loại phê duyệt (§2)? Có là "chỉ vận hành" nên không được cho khách sửa không?
2. Màn hình có bảo đảm cấm đăng ký trùng (xám "Đang đăng ký", khóa ô, cả nhập hộ) và rút lại đúng quyền (đơn do tài khoản doanh nghiệp gửi) không?
3. Phê duyệt theo từng cơ sở: trạng thái đơn "đang xử lý n/m"/"phê duyệt một phần" và email theo từng cơ sở đã rõ chưa? Có vô tình thêm "Làm lại"?
4. Tháng bắt đầu & hạn chốt: ngày 15 tháng trước, phê duyệt sau hạn chốt (dời kỳ/đặt hàng hộ), chu kỳ đã phát hành hóa đơn hoặc đã có chỉ thị xuất hàng.
5. Có tháng đã thanh toán (năm/trả trước) thì "chi tiết điều chỉnh" và hiển thị chênh lệch trên màn hình phê duyệt chưa?
6. Tạm dừng/mở lại/hủy: giới hạn 12 tháng tích lũy, thiết bị thu hồi hay để nguyên, kiểm tồn, phí vi phạm, hóa đơn cuối, thông báo ủy thác, ứng dụng cá nhân.
7. Hỏi PM/khách: B8 (6 lựa chọn), B11 (kịch bản giữ chân), K4 (thời gian dùng tối thiểu thiết bị thu hồi).
8. Thay đổi gói/giao hàng/thiết bị: đơn hàng tự về mặc định, dịch chuyển thiết bị + đề xuất chi phí, khảo sát hiện trường (tủ lạnh→máy bán hàng).
