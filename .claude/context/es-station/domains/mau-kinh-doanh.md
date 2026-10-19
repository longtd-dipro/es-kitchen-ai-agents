# Mẫu kinh doanh・Mẫu thử nghiệm — digest ES-STATION
> Nguồn: `75_Mẫu_kinh_doanh/Mẫu_kinh_doanh.md` · Trạng thái: chuẩn (nguồn chuẩn, tổng hợp 2026-10-05; nếu khác `docs/決定台帳.md` thì sổ quyết định là chuẩn) · Digest tạo: 2026-10-08

## 1. Phạm vi & actors
- Chủ đề: mẫu hàng. Giai đoạn 2 chỉ **quản lý trên hệ thống "Mẫu kinh doanh"**; "Mẫu thử nghiệm" giữ cách làm hiện tại [§1].
- Màn hình: đăng ký đơn giản chuyên dụng cho mẫu trên **Web Vận hành (AW_)** [§2-1]; ô chọn "Mẫu kinh doanh" trên màn master sản phẩm / tạo menu [§2-3]; số lượng mẫu theo menu đặt ở màn tạo menu [§2-2].
- Actor: bộ phận vận hành (nhập tiếp nhận, nhập lead time, chọn kho picking khi có nhiều kho) [§2-1, 2-6, 2-7]. Không có trong tài liệu: vai trò cụ thể khác (Web doanh nghiệp/NCC/tài xế/app người dùng không được nhắc).

## 2. Thuật ngữ & định danh
| Thuật ngữ Việt | Gốc Nhật/tên vật lý | Nghĩa ngắn |
|---|---|---|
| Mẫu kinh doanh | (không ghi tên Nhật) | Hàng dùng thử gửi khách hàng tiềm năng; quản lý trên hệ thống [§1] |
| Mẫu thử nghiệm | (lưu giữ・dự phòng thử nghiệm・ăn thử) | Dùng nội bộ ES Kitchen; đặt hàng bình thường qua hợp đồng dành cho ES Kitchen [§1] |
| Địa chỉ nhận | không có tên vật lý trong tài liệu | Đối tượng duy nhất được nhập cho mẫu; lịch sử lưu theo địa chỉ này [§2-1, 2-8] |
| Sổ quyết định | `docs/決定台帳.md` (台帳) | Nguồn chuẩn cuối khi có khác biệt [đầu file] |
| Chỉ thị xuất hàng hoàn kho | tham chiếu `60_Tồn_kho/Tồn_kho.md` §2-6 | Trả phần dư sau chốt về ES [§2-10] |
Mã quyết định liên quan: RD-MN-045 (số lượng theo menu), STEP1, T4-4, T4-5, T4-1, STEP4 D2, Q-E. Không có ID/format số chứng từ trong tài liệu.

## 3. Quy tắc nghiệp vụ đã chốt (BA không được mâu thuẫn)
1. Mẫu kinh doanh nhập **trong hệ thống**, là đăng ký đơn giản chuyên dụng trên Web Vận hành; **chỉ nhập địa chỉ nhận**, không tạo doanh nghiệp・cơ sở・hợp đồng [§2-1].
2. Số lượng quyết định **theo từng menu** trên màn tạo menu: mặc định 60 mẫu/tháng (= 15 × 4), có thể thêm/sửa đến khi menu công khai (chốt). Bỏ việc cố định 15 mẫu/tuần [§2-2, RD-MN-045].
3. Sản phẩm dùng cho mẫu kinh doanh xác định bằng ô chọn "Mẫu kinh doanh" trên master sản phẩm / tạo menu [§2-3].
4. 1 mẫu = 1 địa chỉ nhận [§2-4, T4-4].
5. Ngày xuất hàng: nhập ngày giao, tính ngược từ lead time. Nếu rơi ngày không picking được thì đẩy sớm về ngày picking gần nhất trước đó, **ngày giao dịch chuyển đúng số ngày đó** (giống giao theo hợp đồng) [§2-5, T4-5].
6. Kho picking: sản phẩm chỉ có ở 1 kho thì dùng kho đó; nhiều kho thì **vận hành chọn** (kho không giữ khu vực phụ trách); sản phẩm chỉ có ở một số kho thì tách theo từng kho [§2-6, Q-E].
7. Lead time do vận hành nhập theo từng kho; là 【tạm】 đến khi có giá trị thực [§2-7, T4-1, STEP4 D2].
8. Có danh sách và xuất CSV; lịch sử theo từng địa chỉ nhận [§2-8].
9. **Không liên kết với doanh nghiệp**, kể cả công ty đăng ký sau cũng không kế thừa; thông tin biết sau ghi vào ô ghi chú [§2-8b, Sổ QĐ N].
10. Sau khi chốt tiếp nhận vẫn thêm được, nhưng phần thêm sau chốt **không tạo chỉ thị xuất hàng** [§2-9].
11. Phần dư sau chốt trả về ES bằng chỉ thị xuất hàng hoàn kho [§2-10].
12. Mẫu kinh doanh được tính vào số lượng cần đặt hàng (= đơn hàng hợp đồng + dùng thử + mẫu kinh doanh); phần tăng sau chốt thì đặt bổ sung [§2-11].
13. Mẫu thử nghiệm: giữ cách hiện tại (đặt hàng thường từ cơ sở・hợp đồng của ES Kitchen); **không** làm cờ "Sản phẩm do ES sản xuất", không làm tự động tạo [§1].
14. Không làm trạng thái khách hàng "Mẫu" và "Dùng thử miễn phí" (dùng thử thể hiện bằng hợp đồng; mẫu lưu lịch sử ở địa chỉ nhận) [§1].
15. Ngoài phạm vi: mẫu đặc biệt nhà máy・liên kết sản xuất (tương lai); chỉnh sửa lịch sử thực hiện chiến dịch・tỷ lệ thành công (không làm, 2026/07/08) [§1].

## 4. Trạng thái & dữ liệu chính
- Máy trạng thái: Không có trong tài liệu. Chỉ có mốc "chốt tiếp nhận" (trước/sau chốt khác quy tắc) [§2-9] và "menu được công khai" làm hạn sửa số lượng [§2-2].
- Dữ liệu chính (khái niệm, không có tên bảng/cột): bản ghi mẫu theo địa chỉ nhận; cấu hình số lượng mẫu theo menu; cờ "Mẫu kinh doanh" trên sản phẩm/menu; lead time theo kho; ô ghi chú. Tên bảng/cột vật lý: Không có trong tài liệu.

## 5. Liên kết với nhóm khác & hệ thống ngoài
- `60_Tồn_kho/Tồn_kho.md` §2-6: chỉ thị xuất hàng hoàn kho phần dư [§2-10].
- `55_Đặt_hàng_Nhập_mua_Nhập_kho/Đặt_hàng_Nhập_mua_Nhập_kho.md` §1・§2: tính vào số lượng cần đặt, đặt bổ sung [§2-11].
- Menu (`45_Menu_Sản_phẩm`, suy luận từ nhắc "màn tạo menu"/"master sản phẩm"), Giao hàng (ngày giao dịch chuyển như hợp đồng; suy luận nhóm `10_Giao_hàng`).
- Nguyên bản đóng băng: `議事録_仕様/サンプル_仕様まとめ.md`, `00_Quyết_định/Quyết_định_STEP1…`, `…STEP3…` (T4).
- Hệ thống ngoài (THOMAS/Yamato/Bill One/HubSpot/Cognito): Không có trong tài liệu.

## 6. Điểm mở / Cần xác nhận / mâu thuẫn
- **U2**: giá trị thực tế lead time mẫu — chờ xác nhận với khách hàng [§3].
- **U3**: cách tính ngày nhận sớm nhất của mẫu (ước lượng tỉnh/thành → lead time, yêu cầu dòng 98) — vẫn là đề xuất [§3].
- 【tạm】 lead time ở §2-7 (gắn với U2).
- Mâu thuẫn: không thấy trong tài liệu.

## 7. Khi BA phân tích tính năng thuộc nhóm này
1. Tính năng có buộc phải gắn doanh nghiệp/cơ sở/hợp đồng cho mẫu không? Nếu có là mâu thuẫn với §2-1, §2-8b.
2. Số lượng mẫu theo menu: mặc định 60/tháng, hạn sửa là lúc công khai menu; có cần giới hạn/cảnh báo khi vượt không (tài liệu không nêu)?
3. Hành vi sau chốt: phần thêm không sinh chỉ thị xuất hàng; phần dư hoàn kho — xác nhận luồng với nhóm Tồn kho và Đặt hàng.
4. Ngày giao dịch chuyển khi ngày picking bị đẩy sớm: màn hình có hiển thị cho vận hành không?
5. Chọn kho khi nhiều kho: ai chọn, tách dòng theo kho thế nào khi sản phẩm chỉ ở một vài kho.
6. Lead time còn 【tạm】 (U2) và cách tính ngày nhận sớm nhất (U3): hỏi PM/khách trước khi chốt AC liên quan ngày.
7. Đừng thêm cờ "Sản phẩm do ES sản xuất", trạng thái khách "Mẫu/Dùng thử miễn phí", hay tự động tạo mẫu thử nghiệm.
8. CSV mẫu: cột cụ thể xem `Định_nghĩa_nhập_xuất_CSV_20261003.md` (suy luận, chưa đọc), nguồn không nêu cột.
