> **Đã đóng băng (bản gốc · 2026-10-05). Từ nay không cập nhật nữa.** Các quyết định đang có hiệu lực hiện nay nằm ở `docs/決定台帳.md`. Nội dung của file này được chuyển đi đâu và các quyết định đã bị thay thế, xem mục "G" của sổ cái.

# Quyết định bổ sung v2.3 (2026/09/29) ― Mặc định của hộp vật tư (theo gói)

**Đây là nơi sở hữu quyết định.** Phiên bản vẫn là v2.3 "bổ sung 2026/09/29". Số bắt đầu từ **28-160** (28-154~159 được để trống vì công việc khác đang dùng cho phần bổ sung Master gói).

- Căn cứ: tài liệu khách hàng "Bộ khởi đầu (PP)" "Kích thước BOX (tiêu chuẩn)" "Kích thước BOX (lớn)" (hình ảnh hong đính kèm trong chat ngày 2026/09/29. **Khi cuộc hội thoại kết thúc thì hình ảnh không còn**, nên nội dung đọc được đã được chép vào tài liệu này)
- Bổ sung của hong: "Cái đính kèm không phải vật tư mà là hộp vật tư. Là thiết lập mặc định của hộp vật tư"
- Khi tài liệu mâu thuẫn thì "lấy ngày mới hơn, để bản cũ trong ngoặc". Cái chưa quyết ghi là "Cần xác nhận", đặt tạm ghi là "Tạm thời"

---

## 1. Những điều đã quyết định

| # | Hạng mục | Quyết định |
|---|---|---|
| 28-160 | Nơi sở hữu mặc định của hộp vật tư | Đăng ký vào **"Thiết bị cho thuê tiêu chuẩn"** của Master gói theo dòng máy + số lượng cho từng gói (như "số lượng do thiết bị cho thuê tiêu chuẩn của Master gói giữ" ở quyết định v2.3 ⑫B). **Khác với bộ vật tư ban đầu (Master vật tư × gói · 28-129)**, không đưa hộp vật tư vào bộ ban đầu |
| 28-161 | Hộp vật tư của Master dòng máy | Hộp vật tư được giữ ở Master dòng máy (BX) như hàng cho thuê. Đăng ký **mỗi loại là 1 dòng máy** (bảng bên dưới · 5 dòng máy) |
| 28-162 | Số lượng chứa tối đa | **Hộp vật tư không có số lượng chứa tối đa.** Vì không dùng để phán định dung lượng số bữa ăn. Bỏ khỏi bắt buộc của ⑫-2 (cũ: tủ lạnh · tủ đông · máy bán hàng tự động · hộp vật tư là bắt buộc) |
| 28-164 | Thu hồi giỏ (2026/09/29 hong trả lời) | **Giỏ cũng được thu hồi khi hủy hợp đồng.** Giữ như hàng cho thuê (BX000005) giống các hộp vật tư khác |
| 28-165 | ES250 · ES600 trở lên (2026/09/29 hong trả lời) | **Không có mặc định. Vận hành thiết lập thủ công.** Không đưa dòng hộp vật tư vào thiết bị cho thuê tiêu chuẩn của Master gói, vận hành nhập theo từng cơ sở khi tiếp nhận đăng ký (thiết bị của Thiết lập thông tin chi tiết) |
| 28-163 | Phần vượt mặc định · tư vấn về nơi đặt | Doanh nghiệp thêm ở "Thiết bị muốn thêm" của đăng ký, vận hành thêm ở "Biến động thiết bị" của hợp đồng con. Phí hàng tháng theo Master dòng máy (hiện là ¥0 · 28-9). Tư vấn về nơi đặt được tiếp nhận ở "Ghi chú ngoài gói" của đăng ký |

## 2. Hộp vật tư đăng ký vào Master dòng máy (ID là đề xuất)

| ID dòng máy | Tên dòng máy (đề xuất) | Rộng×Sâu×Cao | Trọng lượng | Ghi vào ghi chú dòng máy | Phí hàng tháng |
|---|---|---|---|---|---|
| BX000001 | Hộp "Khay chia ngăn" | 260×370×170mm | Cần xác nhận | Xếp chồng được | ¥0 |
| BX000002 | Hộp "Khay sâu" | 260×370×170mm | Cần xác nhận | Xếp chồng được | ¥0 |
| BX000003 | Hộp "Thực phẩm" | 260×370×170mm | Cần xác nhận | Xếp chồng được / Vì vệ sinh nên không đặt trực tiếp xuống sàn | ¥0 |
| BX000004 | Hộp kiểu tủ ngăn kéo (lớn) | 600×400×860mm (có bánh xe 920mm) | Khoảng 7kg | 4 tầng · có bánh xe. Chỉ khi gói lớn | ¥0 |
| BX000005 | Giỏ | Cần xác nhận | Cần xác nhận | — | ¥0 |

- Kích thước · trọng lượng nhập vào "Quy cách · kích thước" của Master dòng máy, lưu ý nhập vào "Ghi chú dòng máy". **Không thêm cột mới.**
- Thời gian sử dụng tối thiểu · số tiền thu hồi khi hủy hợp đồng để trống (vì là hàng miễn phí).
- Hộp tiêu chuẩn có thể xếp chồng như ảnh "BOX xếp 3 tầng" (3 tầng cao 510mm).

## 3. Mặc định đưa vào "Thiết bị cho thuê tiêu chuẩn" của Master gói

| Gói | Khay chia ngăn | Khay sâu | Thực phẩm | Kiểu tủ ngăn kéo | Giỏ |
|---|---|---|---|---|---|
| ES50 | 1 | 1 | 1 | — | 1 |
| ES100 | 1 | 1 | 1 | — | 1 |
| ES150 | 1 | 1 | 1 | — | 1 |
| ES200 | 1 | 1 | 1 | — | 1 |
| ES300 | — | — | — | 1 | 1 |
| ES400 | — | — | — | 1 | 1 |
| ES500 | — | — | — | 1 | 1 |
| ES250 · ES600 trở lên | Không có mặc định (vận hành thiết lập thủ công · 28-165) | | | | |

- **Không thay đổi theo course (Lite / Standard) [Tạm thời].** Vì tài liệu không phân biệt course.
- Dù chọn mẫu tiêu chuẩn / mẫu thay thế của tủ lạnh (`Quyết_định_Master_tủ_lạnh_và_cấu_hình_theo_gói_20260929.md`, ES400 · 500) nào thì dòng hộp vật tư vẫn giống nhau.
- Chú thích của tài liệu: hộp có thể xếp chồng / Hộp thực phẩm vì vệ sinh nên không đặt trực tiếp xuống sàn / Nếu hộp thực phẩm không đủ do cân đối đặt hàng thì trao đổi / Nếu có vấn đề về không gian thì trao đổi.

## 4. Mô tả hiện có sẽ được thay thế

| Hiện có | Thay đổi |
|---|---|
| Ví dụ "Hộp vật tư gói 50 = 1 cái · 100 = 2 cái · 150 = 3 cái" "Hộp vật tư ×2" ở Danh sách hạng mục master §0.9-3 · Bổ sung Master gói §2 #11 | Hủy. Thay bằng bộ ở §3 |
| "Số lượng chứa tối đa (hộp vật tư)" của Master dòng máy (bắt buộc ở ⑫-2 · "căn cứ của số lượng theo từng gói") | Xóa dòng (28-162) |
| 1 dòng máy BX000001 "Hộp vật tư cỡ L" của demo | Thay bằng 5 dòng máy (demo chưa phản ánh) |

## 5. Những điều chưa quyết định

| # | Hạng mục | Nội dung tiến hành tạm thời |
|---|---|---|
| ~~①~~ | ~~Giỏ có phải hàng cho thuê được thu hồi khi hủy hợp đồng không~~ | **→ Quyết định ở 28-164: thu hồi** |
| ~~②~~ | ~~Mặc định của ES250 · ES600 trở lên~~ | **→ Quyết định ở 28-165: không có mặc định, vận hành thiết lập thủ công** |
| ③ | Có thay đổi theo course không | Gắn **cùng một bộ hộp vật tư** cho Lite và Standard (không tạo khác biệt theo course như tủ lạnh · tủ đông). Đang xác nhận với hong |
| ④ | Trọng lượng của hộp tiêu chuẩn và giỏ, kích thước của giỏ | Để trống (cần xác nhận) |
| ⑤ | Khi khách muốn kiểu tủ ngăn kéo ở ES200 trở xuống | Xử lý bằng "Thiết bị muốn thêm" hoặc biến động thiết bị của vận hành (ranh giới mặc định cố định) |

## 6. Tình trạng phản ánh

| Tài liệu | Tình trạng |
|---|---|
| Tài liệu này | Soạn 2026/09/29 |
| Danh sách hạng mục master (Master dòng máy · md / xlsx) | Đã phản ánh (sửa `master_items.py` · `gen_master.py` rồi sinh lại. Thêm §III-10, xóa số lượng chứa tối đa (hộp vật tư)) |
| `Quyết_định_v2.3_Bổ_sung_Master_Gói_20260929.md` §2 #11 | Thay ví dụ, thêm tham chiếu đến tài liệu này |
| Demo (dòng BX của danh sách Master dòng máy · thiết bị nằm trong gói của form đăng ký) | Chưa phản ánh |
| Đặc tả DEV (mẫu của `plan_std_equipment`) | Chưa phản ánh |
