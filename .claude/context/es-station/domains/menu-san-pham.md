# Menu tháng / Master sản phẩm — digest ES-STATION
> Nguồn: `45_Menu_Sản_phẩm/Master_Menu_Sản_phẩm.md` · Trạng thái: chuẩn (viết lại 2026-10-05, chỉ giữ điều đang có hiệu lực; mâu thuẫn thì `docs/決定台帳.md` mục F・M-2 là chuẩn) · Digest tạo: 2026-10-08
> Cách dẫn: `[#x-y]` = số thứ tự dòng trong bảng nguồn (1-1…8-23); `[§1-n]` = mục nguồn; `[U#]` = điểm mở §3.

## 1. Phạm vi & actors
- Nhóm gồm 2 chủ đề: **Menu tháng** (§1: tạo/sửa, công khai, số đơn hàng chuẩn, thống kê, CSV) và **Master sản phẩm** (§2).
- Thao tác ở **Web vận hành (AW_)**: người phụ trách vận hành tạo menu, gắn "có thể công khai", nhập CSV, xuất PDF/CSV. Nguồn không nêu tên role cụ thể.
- Người xem kết quả: **doanh nghiệp (Web doanh nghiệp CW_)** thấy menu đã công khai, Light/Standard lọc theo hợp đồng; **người dùng app** chỉ được thông báo khi sản phẩm được giao đến [#3-6].
- Nhà cung cấp: có "tên dành cho nhà cung cấp" và mỗi sản phẩm gắn 1 nhà cung cấp [#8-4, #8-7].
- Không có công khai dành cho nhân viên [#3-1].

## 2. Thuật ngữ & định danh
| Thuật ngữ Việt | Gốc/tên trong nguồn | Nghĩa ngắn |
|---|---|---|
| Menu tháng | menu theo "tháng chu kỳ" | 1 menu/tháng, không chia course/nhóm nhiệt độ [#1-1] |
| Course | Light / Standard | Light = Lạnh・Nhiệt độ thường; Standard = gồm cả Đông lạnh [#1-2] |
| Kho picking | — | Kho lấy hàng, gắn vào hợp đồng và sản phẩm [#1-2, #8-11] |
| Cột máy bán hàng tự động | cột (Sanden / Fuji Electric) | Dòng máy tương thích + cột; Single/Double [#8-17] |
| Số đơn hàng chuẩn (số chuẩn) | — | Số lượng chuẩn theo gói 50 suất, 3 loại [#4-2] |
| Thời hạn tiêu dùng ngắn | Short / Semi-short | Phân loại tự động từ hạn ES, KHÔNG phải tag [#8-12, #8-13] |
| Tag sản phẩm | master tag | NEW, Xuất hiện lại, Lạnh cũng ngon… (~20 tag) [#8-14] |
| Có thể công khai | ô đánh dấu vận hành | Cờ theo từng sản phẩm, điều kiện công khai menu [#3-3] |
| Dấu "Tiếp tục" / "Menu lần trước" | — | Có trong 2 tháng liên tiếp / tháng xuất hiện gần nhất [#2-7] |
| Giá bán = Giá niêm yết | — | Đã gồm thuế; vận hành gọi "Giá bán", màn đặt hàng DN gọi "Giá niêm yết" [#8-5] |
| Hạn sử dụng ES | số ngày | Hạn riêng của ES, khác hạn nhà sản xuất (viết tự do) [#8-12] |
| Sản phẩm "Vô hiệu" | trạng thái | Cách ẩn sản phẩm bán 1 lần, không có chức năng lưu trữ [#8-21] |
| Ngày chốt đặt hàng (Order) | — | Mặc định ngày 15 tháng trước; ngày bắt đầu Order = ngày 1 tháng trước [#2-9] |
- Mã sản phẩm: không sửa được sau khi tạo [#8-2]. Mã JAN 8〜13 chữ số [#8-10]. Ngoài ra không có format ID nào khác trong tài liệu.

## 3. Quy tắc nghiệp vụ đã chốt (BA không được mâu thuẫn)
**Menu tháng**
1. Mỗi tháng 1 menu; sản phẩm hiển thị cho khách lọc theo course sản phẩm + kho picking hợp đồng + dòng máy bán hàng tự động [#1-1, #1-2].
2. 2 file PDF menu: Light (chỉ Lạnh) và Standard (trang 1 Lạnh, trang 2 Đông lạnh); không cho khách Light xem bản Standard; PDF ≤ 5MB [#1-3].
3. Số món tham khảo (Light 30〜40…) và cảnh báo trùng 3 tháng gần nhất KHÔNG đưa vào hệ thống [#1-4].
4. Menu mới tạo trống (không kế thừa/sao chép/mẫu); lấy sản phẩm tháng trước bằng bộ lọc "Menu lần trước" trong "Thêm sản phẩm"; số sản phẩm không giới hạn [#2-1, #2-2].
5. Giá bán lấy từ master, không sửa ở menu [#2-3]. Thứ tự kéo thả = thứ tự khi doanh nghiệp đặt hàng [#2-6]. Không sửa tag NEW trên màn menu [#2-8].
6. Màn chi tiết và màn chỉnh sửa tách riêng; menu trước tháng trước không sửa được; chỉ màn chỉnh sửa đổi được trạng thái công khai [#2-10].
7. Đang công khai vẫn sửa được: thêm sản phẩm・thứ tự・tag・có thể công khai・số chuẩn・PDF. Sản phẩm đã có đơn hàng không gỡ được (chuyển sang hàng thay thế). Sau hạn chót thì khóa [#2-11]. Xóa được, xóa xong tạo lại được cùng năm tháng [#2-12].
8. Trạng thái công khai: Không công khai / Công khai / Tự động công khai (+ Đã xóa); mặc định khi lưu = không công khai [#3-1].
9. Điều kiện công khai: tất cả sản phẩm "có thể công khai" + có PDF + đặt hàng tạm của tháng đó đã được phê duyệt; không có đường tắt khi chưa đủ [#3-2]. Có nút gắn hàng loạt "có thể công khai" [#3-3].
10. Tự động công khai: đến ngày đặt nếu đủ điều kiện thì công khai; từ 3 ngày trước cảnh báo hằng ngày trên TOP vận hành cho menu chưa đủ điều kiện (không tăng số thông báo). Công khai sớm/đặt tự động phải hiện xác nhận [#3-4, #3-5].
11. Khi công khai: thông báo doanh nghiệp. Sửa sau công khai chỉ thông báo khi có đánh dấu chọn [#3-6]. Ngày hôm sau D7 đặt trạng thái danh sách vận hành = "Kết thúc" (không dùng cho khách・app) [#3-7].
12. Số đơn hàng chuẩn: không có số tối đa; 3 loại (Thông thường Light・Standard / Không có thời hạn tiêu dùng ngắn / Máy bán hàng tự động "Light (tự động)"); đều là giá trị đại diện gói 50, gói khác điều chỉnh theo tỷ lệ suất ăn [#4-1, #4-2].
13. Sản phẩm thời hạn ngắn → tự nhập 0 vào "Không có thời hạn ngắn"; sản phẩm không đặt được máy bán hàng → tự nhập 0 vào "Máy bán hàng" (sửa tay được) [#4-3].
14. **Mỗi loại phải có tổng = 50 mới lưu được**; sửa 1 ô thì các ô chưa sửa tay tự đổi (CSV cũng vậy) [#4-4].
15. Đề xuất số chuẩn: tỷ lệ đặt 2〜3 tháng gần nhất (SP mới = trung bình cùng danh mục) rồi điều chỉnh để đơn giá nhập TB (gói 50) vào khoảng mục tiêu; không đụng ô đã sửa tay, không để SP nào < 1, cảnh báo nếu không đạt, có "↑n/↓n" và "Hoàn tác điều chỉnh" [#4-5].
16. Mục tiêu đơn giá TB nhập ở màn tạo menu theo "cận dưới〜cận trên" (tủ lạnh và máy bán hàng riêng), mặc định = tháng trước, đã công khai thì cố định theo lúc công khai; bỏ màn riêng ở quản lý thiết lập [#4-6]. Có thể chỉ định SP/danh mục loại trừ [#4-7].
17. Mẫu kinh doanh: ô đánh dấu theo SP + số lượng mẫu tháng (mặc định 60 = 15×4, thêm được, sửa đến khi công khai 〈chốt〉) [§1-5].
18. Thống kê chỉ có tab theo từng kho (không có "Toàn bộ"); kiểm tổng 50 và đơn giá TB cũng theo kho [#6-3]. Không có màn riêng cho xếp hạng/phân tích; phiếu yêu cầu tạo menu chỉ xuất một chiều từ màn menu [#6-4, #6-5].
19. Nhập CSV: chỉ template mới theo mã sản phẩm, không đọc CSV ES cũ (menu quá khứ chuyển 1 lần bằng bảo trì dữ liệu); lỗi (lẫn năm tháng・trùng mã・mã/tag không có trong master) → hiện dòng lỗi và không nhập; tháng đã có/đang công khai → xác nhận ghi đè (+ "thông báo lại DN" nếu đang công khai); thiếu kho・course・ảnh → cảnh báo [#7-1, #7-2, #7-3].

**Master sản phẩm**
20. Đăng ký cả SP không nằm trong menu; tab Quản lý / Hiển thị / Lịch sử thay đổi; mỗi lần lưu tự thêm lịch sử (phân biệt CSV hay người phụ trách) [#8-1, #8-2].
21. Bắt buộc ngay khi lưu (cả CSV): thông tin cơ bản + giới thiệu・kho picking・course・hạn sử dụng ES・dinh dưỡng・nguyên liệu đặc định (dị ứng) [#8-3].
22. 4 tên sản phẩm: quản lý (nội bộ)・công khai JA・công khai EN・cho nhà cung cấp [#8-4].
23. Giá bán đã gồm thuế, thuế suất từ master thuế suất [#8-5]. Sửa giá SP trong menu đang công khai: chọn "Điều chỉnh giá (từ menu sau)" hoặc "Sửa lỗi sai (áp dụng ngay toàn bộ)" [#8-6].
24. Tăng đơn giá nhập → chọn thời điểm áp dụng; nhà cung cấp khác = mã sản phẩm khác [#8-7].
25. Ảnh ≤ 5 ảnh, mỗi ảnh ≤ 5MB, có ảnh chính [#8-9]. Course (chọn nhiều) cố định Light/Standard, không thêm từ màn hình [#8-11].
26. Hạn ES (số ngày) → tự chọn phân loại: ≤ 7 ngày = Short, ≤ 30 ngày = Semi-short, dài hơn = không thuộc đối tượng; DN thấy hạn ES・thời hạn ngắn, khách chỉ thấy "Hạn dùng tốt nhất ngắn" [#8-12, #8-13].
27. Tag: master, thêm/xóa từ dropdown màn đăng ký, giới hạn ~20, gắn nhiều tag, KHÔNG dùng "Đề xuất", không có ô "Món cố định" [#8-14]. Danh mục: 7 loại + "Tất cả", không giữ course, nhập danh mục ngoài master → lỗi [#8-15].
28. Dinh dưỡng: "trên 100g" × lượng 1 suất → tự tính theo 1 suất [#8-16]. Máy bán hàng: Sanden / Fuji Electric (mặc định cả hai), không đăng ký cả Single và Double cho 1 SP [#8-17].
29. Vật tư đi kèm・chỉ thị xuất hàng giữ lại, xuất CSV chỉ thị, không trừ tồn vật tư [#8-18]. URL trang chủ nhà sản xuất: bật/tắt hiển thị theo SP [#8-19].
30. Ẩn SP bán 1 lần dùng trạng thái "Vô hiệu" (mặc định ẩn khỏi danh sách・Thêm sản phẩm) [#8-21].
31. CSV master: xuất template và toàn bộ mục; cùng mã khác tên → lỗi; cùng tên khác mã → gộp vào mã mới; cột ảnh trống = không đổi ảnh [#8-23]. Danh sách SP: không hiện JAN・nhóm nhiệt độ; lọc Danh mục・Cách bảo quản・NCC・Course [#8-22].

## 4. Trạng thái & dữ liệu chính
- **Trạng thái công khai menu**: Không công khai → Công khai / Tự động công khai (đặt ngày) → (D7+1 hiển thị vận hành "Kết thúc") ; + Đã xóa. Người chuyển: người vận hành ở màn chỉnh sửa; tự động công khai do hệ thống đến ngày [#3-1, #3-4, #3-7, #2-10].
- Sản phẩm: trạng thái **Vô hiệu** (có/không) [#8-21]; cờ "có thể công khai" [#3-3].
- Entity chính (tên theo nghĩa, nguồn không nêu tên bảng vật lý): Menu tháng (ngày chốt, ngày công khai tự động, PDF Light/Standard, mục tiêu đơn giá TB, số chuẩn 3 loại, thứ tự), Master sản phẩm (4 tên, giá bán, thuế suất, course, kho picking, hạn ES, dinh dưỡng, dị ứng, ảnh, JAN, tag, danh mục, dòng máy VM, mẫu kinh doanh), Master tag, Master danh mục (tên・ID・thứ tự・ảnh・số SP), Master thuế suất, Lịch sử thay đổi SP.
- Danh sách menu cột: trạng thái・ngày bắt đầu công khai・cập nhật cuối・PDF・đơn giá nhập TB・số SP・thao tác [#6-1].

## 5. Liên kết với nhóm khác & hệ thống ngoài
- `50_Đơn_hàng/Đơn_hàng.md` (đơn hàng; §6 máy bán hàng theo ô・dòng máy; đặt hàng tạm phải được phê duyệt trước khi công khai [#3-2, #4-7]).
- `55_Đặt_hàng_Nhập_mua_Nhập_kho/` (đặt hàng/nhập mua), `75_Mẫu_kinh_doanh/Mẫu_kinh_doanh.md`, `65_Hàng_thay_thế/` (SP đã có đơn không gỡ được → hàng thay thế [#2-11]).
- `Định_nghĩa_nhập_xuất_CSV_20261003.md` (quy định CSV chung [#7-4]); `docs/決定台帳.md` (sổ cái quyết định F・M-2, liên quan H・E・L・N).
- Hợp đồng (kho picking của hợp đồng quyết định hiển thị [#1-2]); master thuế suất [#8-5].
- Hệ thống ngoài: Không có trong tài liệu (Sanden / Fuji Electric chỉ là dòng máy bán hàng tự động).

## 6. Điểm mở / Cần xác nhận / mâu thuẫn
- **U1** Tên cuối cùng của danh mục ("Salad" hay "Salad・Trái cây", "Đồ uống" hay "Đồ uống・Đồ ngọt") — xác nhận khách (`_OPEN一覧` 1005-01) [§3].
- **U2** Cách giữ sản phẩm có 2 loại nhóm nhiệt độ — xác nhận khách (1005-02) [§3].
- **U3** Có hợp đồng chỉ Đông lạnh (chỉ menu đông lạnh) hay không — xác nhận khách (1005-03) [§3].
- **U4** Tài liệu sản phẩm (đính kèm master・cảnh báo ngày cập nhật) — không làm ở giai đoạn 2 [§3].
- **U5** Cấu trúc cột thực tế theo từng dòng máy bán hàng tự động và mục tiêu đơn giá nhập TB của máy bán hàng — xác nhận khách [§3].
- Mẫu kinh doanh "〈chốt〉" về hạn sửa (đến khi công khai) — đánh dấu chốt trong nguồn [§1-5].
- Ghi chú (suy luận): nguồn nói "Light (tự động)" là 1 trong 3 loại số chuẩn, trong khi course chỉ có Light/Standard — cần làm rõ quan hệ với U5.

## 7. Khi BA phân tích tính năng thuộc nhóm này
1. Tính năng đụng đến hiển thị menu cho khách: đã tính đủ 3 bộ lọc (course SP, kho picking hợp đồng, dòng máy VM) và PDF đúng bản Light/Standard chưa? [#1-2, #1-3]
2. Có case hợp đồng chỉ Đông lạnh hoặc SP thuộc 2 nhóm nhiệt độ không? Nếu có → hỏi khách (U2, U3), không tự giả định.
3. Luồng công khai: đủ 3 điều kiện (có thể công khai・PDF・đặt hàng tạm đã duyệt), cảnh báo T-3 ngày, xác nhận khi công khai sớm, thông báo DN và thông báo lại khi sửa/ghi đè CSV? [#3-2, #3-4, #3-6, #7-3]
4. Sửa sau công khai/sau hạn chót: SP đã có đơn không gỡ được → quy trình hàng thay thế (65) đã nối chưa? Phạm vi sửa được/bị khóa đúng #2-11?
5. Số đơn hàng chuẩn: mỗi loại tổng = 50, tự nhập 0 theo thời hạn ngắn/VM, đề xuất theo đơn giá TB, thống kê theo từng kho — phần VM còn mở (U5) cần hỏi.
6. Sửa giá bán/giá nhập: đã phân biệt "điều chỉnh giá" vs "sửa lỗi sai" và thời điểm áp dụng? Giá menu không sửa trực tiếp [#2-3, #8-6, #8-7].
7. Import/Export CSV: tuân template mới theo mã SP, thứ tự master → menu, quy tắc ghi đè/lỗi/cảnh báo, gộp theo tên [#7-1..7-4, #8-23].
8. Có đang vô tình thêm thứ nguồn đã loại: sao chép menu, "Đề xuất" tag, ô "Món cố định", màn xếp hạng/phiếu yêu cầu hai chiều, số đơn tối đa, chức năng lưu trữ SP? [#2-1, #8-14, #6-4, #6-5, #4-1, #8-21]
