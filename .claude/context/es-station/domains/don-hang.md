# Đơn hàng — digest ES-STATION
> Nguồn: `50_Đơn_hàng/Đơn_hàng.md` · Trạng thái: chuẩn (nguồn chuẩn của chủ đề, viết lại 2026-10-05; nếu mâu thuẫn thì `docs/決定台帳.md` — sổ cái quyết định, chủ yếu mục H・F・B — là chuẩn) · Digest tạo: 2026-10-08

## 1. Phạm vi & actors
- **Web doanh nghiệp (CW_)**: tài khoản doanh nghiệp chuyển tab cơ sở để nhập đơn mọi cơ sở; tài khoản cơ sở chỉ nhập cơ sở của mình [§1 #1-1]. Doanh nghiệp bật/tắt lời nhắc hạn chốt, chỉnh cài đặt mặc định cơ sở, xuất phiếu giao hàng, xem đánh giá [§1 #1-8, §5, §11].
- **Web vận hành (AW_)**: ES Kitchen sửa đơn bất cứ lúc nào/trạng thái nào; nhập trọng số số lượng tiêu chuẩn; quản lý đơn theo khách hàng/sản phẩm/vật tư; sửa đơn dùng thử đến ngày chốt [§1 #1-6, §6, §7 #7-4, §10].
- **Hệ thống**: tự xác định đơn mặc định, tự tạo đơn dùng thử, tự đưa đề xuất AI vào bản nháp [§1 #1-4, §7 #7-2, §4 #4-7].
- **App người dùng cá nhân**: chỉ tham khảo (giá giỏ hàng) [§12]. Web NCC / công ty vận chuyển / app tài xế: Không có trong tài liệu.

## 2. Thuật ngữ & định danh
| Thuật ngữ Việt | Gốc/tên | Nghĩa ngắn |
|---|---|---|
| Đơn hàng hằng tháng | — | 1 cơ sở = 1 đơn / tháng chu kỳ [§1 #1-1] |
| Gói | プラン | Tổng số lượng cung cấp hằng tháng; có giới hạn trên/dưới [§2 #2-1, #2-4] |
| Chuyến (lần giao hàng) | — | Tối đa 8 lần; đếm theo nhóm nhiệt độ [§3 #3-1, §2 #2-3] |
| Nhóm nhiệt độ | lạnh・thường / đông lạnh | Course Light = lạnh・thường; Standard = gồm cả đông lạnh [§1 #1-10] |
| Đơn hàng mặc định | — | Đơn được xác định khi đến hạn chốt mà chưa đăng ký [§1 #1-4] |
| Số lượng tiêu chuẩn | — | Số lượng chuẩn Vận hành, phân theo trọng số; chuẩn trên 50 gói [§6] |
| Áp dụng cho các lần sau | — | Cờ tích ở xem trước AI; từ tháng sau tự đưa đề xuất AI vào bản nháp [§4 #4-7] |
| Đơn hàng vật tư | — | Giao thẳng từ văn phòng ES bằng Yamato [§9 #9-1] |
| OP000036 | "Giao thêm vật tư (đơn lẻ・1 lần)" | Option gắn vào hợp đồng con từ lần vật tư thứ 2/tháng, 【tạm ¥2,000/lần】 [§9 #9-2] |
| Tỷ lệ hủy bỏ | — | hủy bỏ ÷ (tồn kho lần trước + giao hàng) [§4 #4-6] |
| Mã tham chiếu | RD-AP-112〜151, 28-xx, sổ cái A–N | Mã yêu cầu/quyết định nguồn của từng rule |

ID/format mã đơn: Không có trong tài liệu.

## 3. Quy tắc nghiệp vụ đã chốt (BA không được mâu thuẫn)
1. 1 cơ sở = 1 đơn / tháng chu kỳ [§1 #1-1].
2. Thời gian tiếp nhận: từ công bố menu (mặc định ngày 1 tháng trước) đến hạn chốt (mặc định ngày 15 tháng trước); ngày do menu giữ, Vận hành sửa được; hạn chốt 1 lần/tháng [§1 #1-2].
3. Đăng ký lại không giới hạn đến hạn chốt; KHÔNG có đơn tạm/bản nháp/phê duyệt — nhấn "Đăng ký" là thành đơn [§1 #1-3].
4. Chưa đăng ký đến hạn chốt → xác định bằng đơn mặc định [§1 #1-4, §4 #4-7, #4-8].
5. Chỉ MỘT trạng thái, không tách hai phía; ai/khi nào nhập/sửa ghi vào lịch sử thay đổi (kể cả ES sửa sau hạn chốt) [§1 #1-5].
6. ES sửa được mọi lúc; khách KHÔNG hủy/dừng đơn; tạm dừng thực hiện bằng đơn đăng ký (Vận hành phê duyệt) [§1 #1-6].
7. Ngoài thời gian tiếp nhận vẫn xem được, không nhập được [§1 #1-7].
8. Cảnh báo chưa đăng ký hiển thị từ 7 ngày trước hạn chốt đến ngày hạn chốt (trang chủ + màn đơn hàng); xác định bằng đơn mặc định → thông báo Web doanh nghiệp + email người phụ trách chính (1 lần/chu kỳ) [§1 #1-8, #1-9].
9. Chỉ hiển thị sản phẩm thuộc course của cơ sở và kho picking của hợp đồng; áp dụng cả cho số lượng tiêu chuẩn và ứng viên AI [§1 #1-10].
10. Không làm màn hình chỉ xem menu; chọn ngay tại màn đơn hàng, mặc định kèm ảnh [§1 #1-11].
11. LỖI (không đăng ký được): tổng = số lượng gói (không thừa/thiếu, không đặt thêm vượt trần) [§2 #2-1]; các chuyến đều nhau, lệch ±1 (ví dụ 250/4 lần = 62/62/63/63) [§2 #2-2]; chuyến đếm theo nhóm nhiệt độ [§2 #2-3]; theo từng nhóm nhiệt độ: dưới ≤ SL ≤ trên, đông lạnh tính bằng số cái, không giữ tỷ lệ [§2 #2-4]; không có giới hạn trên theo sản phẩm [§2 #2-5].
12. Máy bán hàng tự động: không 2 loại sản phẩm/1 cột; tối đa 50 cái/lần giao [§2 #2-6]; đặt theo khung (đôi・đơn・băng tải); 1 hợp đồng = 1 máy, không tách đơn theo máy [§2-3].
13. CẢNH BÁO (vẫn đăng ký): vượt sức chứa cột (số lượng gói ưu tiên); tổng SP tương thích băng tải > tổng sức chứa cột; đơn đông lạnh 1 lần > sức chứa tối đa tủ đông [§2 #2-7〜#2-9]. SP không vừa máy vẫn hiển thị, doanh nghiệp tự quyết đặt [§2 #2-10].
14. Cách nhập: ① theo từng lần giao (tối đa 8, "Sao chép lần 1") ② nhập tổng + tự phân bổ (dư dồn vào các lần trước), sửa tay được; ô số lượng chọn toàn bộ khi nhấn; có CSV template xuất/nhập [§3 #3-1〜#3-3].
15. Thống kê không hiển thị số tiền; nhóm nhiệt độ = biểu tượng + chữ ngắn + màu; SP hạn tiêu thụ ngắn chỉ hiển thị "Hạn sử dụng ngắn" [§3 #3-4〜#3-6].
16. AI: 3 cách (phân bổ đều / tham chiếu quá khứ / chat); xem trước → "Xác nhận" → màn đơn hàng → phải nhấn "Đăng ký" mới thành đơn; luôn tuân thủ §2; không đề xuất theo trung bình công ty khác [§4 #4-1〜#4-4, #4-9].
17. Đầu vào AI "tham chiếu quá khứ": đơn quá khứ・tỷ lệ hủy・tồn kho, chỉ dữ liệu đã xác định tại thời điểm đặt (đơn T11 dùng đến kiểm kê T9) [§4 #4-5].
18. Cài đặt mặc định cơ sở (giữ từ tháng sau): danh mục (tất cả có), SP hạn ngắn (lấy), SP đặt về 0 (không có), tích giá 100/200 yên (cả hai BẬT; SP bị bỏ tích không vào đơn mặc định/AI nhưng đặt tay được), "Áp dụng cho các lần sau" (TẮT) [§5].
19. Số lượng cơ sở = số lượng tiêu chuẩn × tỷ lệ cơ bản (100 gói = gấp 2); số lượng Vận hành sửa tay được ưu tiên [§6].
20. Dùng thử: chỉ ES Light (tủ lạnh), gói 50, 1 lần giao; hệ thống tự tạo (kể cả tháng 2), phân bổ giới hạn trên gói cho toàn bộ SP menu, lệch ±1; doanh nghiệp chỉ tham chiếu; Vận hành sửa đến ngày chốt (B7・D7); chu kỳ đầu sau chuyển chính thức là đơn thường [§7 #7-1〜#7-4, #7-6].
21. Đăng ký tạm hoàn tất → tạo đơn + bộ vật tư ban đầu, kể cả chưa có tài khoản [§7 #7-5].
22. Phê duyệt thay đổi hợp đồng: tạm dừng/hủy → hủy đơn chu kỳ đó; đổi gói/số lần giao → về đơn mặc định theo điều kiện mới (nhập lại được đến hạn chốt); đăng ký mới → trong thời gian tiếp nhận doanh nghiệp nhập, đã quá hạn thì Vận hành chọn "dời chu kỳ sau / đặt hộ". Thông báo cho doanh nghiệp: Vận hành gửi tùy ý [§8].
23. Đơn vật tư: đặt bất cứ lúc nào, tạo chuyến vật tư (Yamato từ văn phòng ES) và hiển thị lịch trang chủ; 1 lần/tháng chu kỳ đã trong phí, từ lần 2 gắn OP000036; phần vượt SL miễn phí theo giá/thuế master vật tư; bộ ban đầu không tính vào số lần; master vật tư tách master sản phẩm, hộp vật tư không vào bộ ban đầu [§9].
24. Phiếu giao hàng: chỉ xuất từ chi tiết giao hàng theo chuyến (không từ lịch sử đơn), trừ vật tư, chỉ khi chuyến đã bắt đầu giao, PDF tải trực tiếp [§11 #11-1]. Đánh giá cho doanh nghiệp: chỉ sao・SP・tag・nickname [§11 #11-2].

## 4. Trạng thái & dữ liệu chính
- Giá trị trạng thái đơn (chỉ 1 trục): **chưa đăng ký / khách hàng đã đăng ký / ES Kitchen đã thay đổi / đơn hàng mặc định** [§1 #1-5]. Chuyển trạng thái: khách đăng ký, ES sửa, hệ thống xác định mặc định tại hạn chốt (suy luận từ §1 #1-4〜#1-6). Không có máy trạng thái chi tiết hơn trong tài liệu.
- Màn Vận hành có 2 cột: "Đăng ký của doanh nghiệp (ngày giờ・người phụ trách)" và "Thay đổi của ES (ngày giờ・người phụ trách)"; dòng "Dùng thử (tự động)"; ô "Điều chỉnh" (thêm tay hàng thay thế/lỗi, không hiện ở danh sách) [§10 #10-2, #10-4, #10-5].
- Entity/bảng vật lý: Không có trong tài liệu. Dữ liệu nhắc tới: đơn theo cơ sở × chu kỳ × chuyến × nhóm nhiệt độ, lịch sử thay đổi, cài đặt mặc định cơ sở (§5), trọng số tiêu chuẩn theo menu, bảng "vật tư × gói" (§9 #9-4).

## 5. Liên kết với nhóm khác & hệ thống ngoài
- `10_Giao_hàng/Đặc_tả_giao_hàng/Giao_hàng_03` (cài đặt giao hàng hợp đồng con: số lần, chu kỳ) và `Giao_hàng_04` §7-9 (bắt đầu dùng thử, ngày chốt đặt hàng) [§0].
- `55_Đặt_hàng_Nhập_mua_Nhập_kho/` (đơn → số lượng đặt hàng); `60_Tồn_kho/` (kiểm kê, tồn lý thuyết, cùng công thức tỷ lệ hủy); `65_Hàng_thay_thế/` [§0, §4 #4-6, §10 #10-4].
- `議事録_仕様/プランマスタ_仕様まとめ.md` (gói, giới hạn trên/dưới); sổ cái F (menu/master SP/số lượng tiêu chuẩn) [§0, §6].
- `Đơn_yêu_cầu_và_phê_duyệt.md` (28-94/95/98 đăng ký tạm, 28-97) và nhóm `30_Đơn_yêu_cầu` (suy luận) [§7 #7-5, §8].
- Yamato (giao vật tư) [§9 #9-1]. THOMAS / Bill One / HubSpot / Cognito: Không có trong tài liệu. Đơn đổi ngày giao → `配送仕様` [§8].

## 6. Điểm mở / Cần xác nhận / mâu thuẫn
- **U2**: số lần giao tiêu chuẩn của đông lạnh (【tạm】giống lạnh); bảng sức chứa tối đa tủ đông — chờ bảng của khách [§13].
- **U3**: cách tính sức chứa tối đa cột băng tải (OPEN #10 danh sách mục master §0.9); cấu hình cột thực tế theo dòng máy [§13].
- **U4**: số tiền chính thức OP000036 (hiện tạm ¥2,000/lần) [§13, §9 #9-2].
- **U5**: các điểm cần truyền đội AI (bỏ trần theo SP; hạn ngắn mặc định "lấy"; chuyến theo nhóm nhiệt độ; đầu vào gồm tồn kho・tỷ lệ hủy; 1 hợp đồng = 1 máy; sửa Order-Spec §4.2・§4.4・§7.3・§8) — từ hong đến đội AI [§13].
- Lưu ý: `Order-Spec-for-AI-Team.md` có chỗ đã lỗi thời so với U5 (nguồn chuẩn là file này).
- Cách đề xuất menu và mục tiêu đơn giá trung bình nằm ở sổ cái F, không nằm trong file này [§6].

## 7. Khi BA phân tích tính năng thuộc nhóm này
1. Tính năng có tạo "bản nháp/phê duyệt đơn" hay cho khách hủy/dừng đơn không? Nếu có là mâu thuẫn §1 #1-3, #1-6.
2. Validation tổng/chuyến/nhóm nhiệt độ đã đủ chưa (tổng = gói, lệch ±1, dưới ≤ SL ≤ trên theo nhóm, không trần theo SP)? Phân biệt đúng LỖI và CẢNH BÁO [§2].
3. Hạn chốt/ngày mở đơn lấy từ menu, không hard-code 1 và 15; ngoài thời gian chỉ xem [§1 #1-2, #1-7].
4. Luồng "đến hạn chốt chưa đăng ký" và "Áp dụng cho các lần sau" có đủ: nguồn đơn mặc định, thông báo+email, cảnh báo 7 ngày trước [§1 #1-8, #1-9, §4 #4-7, #4-8]?
5. Tính năng có chạm thay đổi hợp đồng (đổi gói, tạm dừng, đăng ký mới) → đơn chu kỳ đó xử lý thế nào và hiển thị ở "phạm vi ảnh hưởng" [§8]?
6. Cơ sở dùng thử: doanh nghiệp chỉ xem, không nút sửa/AI; Vận hành sửa đến ngày chốt [§7].
7. Có máy bán hàng tự động hoặc đông lạnh không? Hỏi khách về U2/U3 trước khi chốt AC sức chứa [§13].
8. Đơn vật tư: phân biệt lần 1 (trong phí) và từ lần 2 (OP000036); hỏi U4 trước khi ghi số tiền vào SPEC [§9, §13].
9. Thao tác sửa của ES phải ghi lịch sử (ai/khi nào) và hiện đúng 2 cột đăng ký/thay đổi [§1 #1-5, §10 #10-2].
