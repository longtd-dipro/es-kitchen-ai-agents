# Tổng hợp Tùy chọn (Option): Đặc tả và màn hình demo v1

> Ngày tạo: 2026/09/25　Phụ trách: Hong (BrSE・Dipro)
> Mục đích: Đặc tả Tùy chọn (Option) đang nằm rải rác ở nhiều tài liệu・demo, nên gom vào một chỗ **bản chuẩn hiện tại** và **các điểm không khớp với demo**.
> **Tài liệu này chỉ tổng hợp và nêu điểm cần chỉnh. Chưa phản ánh vào tài liệu đặc tả・demo・script sinh tự động** (sẽ sửa sau khi anh/chị chọn các điểm ở mục 7).

**Tài liệu làm căn cứ**

| Loại | Tài liệu |
|---|---|
| Đặc tả (chuẩn) | `01_仕様/40_Master_Phí_Thanh_toán/Danh_sách_mục_Master_Dòng_máy_Tùy_chọn_Giảm_giá.md` (§0.0〜0.8・Chỉnh sửa Option Master・Phần II・Phần IV) |
| Đặc tả (chuẩn) | `01_仕様/20_Doanh_nghiệp_Cơ_sở_Hợp_đồng/Doanh_nghiệp_Cơ_sở_Hợp_đồng_Hợp_đồng_con_Danh_sách_mục.md` (§0.7・§0.8・Cơ sở "Thiết bị・Option"・Hợp đồng con "Thiết bị・Option" "Phí・Thanh toán"・quyết định 2026/09/25) |
| Yêu cầu | `議事録/仕様/契約_詳細要件仕様.md` (REQ-CT-107・§8D-2・§8D-3・REQ-CT-234) / `議事録/仕様/プランマスタ_仕様まとめ.md` (REQ-PM-021) |
| Demo | `02_デモ/12_運営_法人拠点契約.html` (demo màn hình Web vận hành: doanh nghiệp・cơ sở・hợp đồng con) / `02_デモ/14_運営_オプション値引きマスタ.html` (Master Option・Giảm giá. Tách riêng ngày 2026/09/25) |
| Demo | `02_デモ/15_運営_請求.html` (demo nghiệp vụ thanh toán) |
| Demo | `02_デモ/21_法人_申込フォーム.html` (form đăng ký trên Web doanh nghiệp) |

---

## 1. Điểm chính (3 dòng)

1. **Option = phí của những thứ "không phải vật chất"** (thêm lượt giao hàng・phí giao hàng theo khu vực・lắp đặt hộ・phí hành chính・phạt). Thiết bị thuộc Master Dòng máy, giảm giá thuộc Master Giảm giá, không đưa vào Option.
2. **Đăng ký ở hợp đồng con, xem ở cơ sở, số tiền nằm ở dòng khoản mục của hợp đồng con ①.** Chỉ có một nơi để sửa.
3. **Loại liên kết A／B／C** quyết định "đăng ký ở đâu". Với A (số lượt giao hàng・ES-QR, v.v.), khi sửa mục của hợp đồng thì phí sẽ tự phát sinh **từ hợp đồng con của tháng sau** (quyết định 2026/09/25).

---

## 2. Phân chia vai trò của 3 Master

| Master | ID | Chứa gì | Ví dụ |
|---|---|---|---|
| Master Gói (Plan) | `ES`＋6 chữ số | Phí cơ bản của gói (course・chuyến giao hàng・thế hệ điều chỉnh giá) | ES Standard 100 |
| Master Dòng máy | `RF`/`FZ`/`VM`/`MW`/`HW`/`BX`＋6 chữ số | **Bản thân thiết bị** (ban đầu・hàng tháng・số tiền thu hồi khi hủy・thời gian sử dụng tối thiểu・xác định miễn phí) | Tủ lạnh・hộp vật tư・máy bán hàng tự động |
| **Master Option** | **`OP`＋6 chữ số** | Bảng phí của **những thứ không phải vật chất** | Thêm lượt giao hàng・phí giao hàng theo khu vực・lắp đặt hộ |
| Master Giảm giá | `DC`＋6 chữ số | Giảm giá (bao gồm cả giảm giá cho Option) | Khuyến mãi・đại lý・chênh lệch điều chỉnh giá |

- **Hộp vật tư・lắp đặt tủ lạnh không đưa vào Option.** Việc thêm hộp vật tư là "biến động thiết bị (cho thuê thêm)" của hợp đồng con, phí theo Master Dòng máy (`BX`). Mục đích là không tạo ra hai nơi có thể đăng ký trùng.
- **"Giảm giá Option" được biểu diễn bằng "đối tượng áp dụng = phí Option" của Master Giảm giá.** Master Option không có cột giảm giá.
- Căn cứ yêu cầu: REQ-CT-107 "Số lượt giao hàng・lượng giao hàng theo khu vực・phí Option được quản lý bằng master, không dùng giá trị cố định" / REQ-PM-021 "Option giao hàng・hợp đồng không quản lý ở Master Gói mà quản lý như Option theo từng hợp đồng và phản ánh vào thanh toán".

---

## 3. Nguyên tắc nắm giữ: đăng ký ở hợp đồng con, xem ở cơ sở

| | Chủ sở hữu của sự thật kéo dài | Nơi đăng ký | Nơi số tiền phát sinh |
|---|---|---|---|
| Thiết bị | Cơ sở "Thiết bị・Option" → Danh sách cho thuê | Hợp đồng con "Biến động thiết bị" | Dòng khoản mục của hợp đồng con ① (nguồn = model) |
| **Option** | **Cơ sở "Thiết bị・Option" → Danh sách áp dụng** | **Hợp đồng con "Biến động Option・giảm giá"** | **Dòng khoản mục của hợp đồng con ① (nguồn = option)** |
| Giảm giá | Như trên | Như trên ＋ nhập CSV hàng loạt của Master Giảm giá | Dòng khoản mục của hợp đồng con ① (nguồn = discount・số âm) |

**Vì sao đăng ký ở hợp đồng con**: Option luôn là chuyện "từ tháng nào", và tháng đó chính là hợp đồng con (1 chu kỳ = 1 hợp đồng con).
**Vì sao cơ sở là chủ sở hữu**: để khi hợp đồng cha thay đổi (từ dùng thử → triển khai chính thức), sự thật về Option (gắn từ khi nào) không bị đứt đoạn. ID áp dụng là `AP-`＋4 chữ số, gắn với cơ sở.

---

## 4. Loại liên kết A／B／C

| Loại | Quan hệ với phía hợp đồng | Ví dụ | Ai là nguồn chuẩn | Nơi đăng ký | Tháng phát sinh phí |
|---|---|---|---|---|---|
| **A Có liên kết** | Hợp đồng đã có sẵn mục đó | Số lượt giao hàng／ES-QR／Chế độ khách／Người dùng dùng tiền mặt／Giới hạn số lượng cung cấp hàng tháng／Tỉnh thành (khu vực) | **Mục của hợp đồng** | Sửa mục của hợp đồng (không đăng ký bằng biến động. Cũng không hiển thị trong lựa chọn) | **Từ hợp đồng con của tháng sau** (quyết định 2026/09/25. Không phát sinh ở tháng thay đổi) |
| **B Không liên kết・liên tục** | Hợp đồng không có mục đó. Đã gắn thì kéo dài mãi | Phí quản lý thiết bị／phần cố định của phí giao hàng theo khu vực／phí hành chính | Danh sách áp dụng của cơ sở | Biến động của hợp đồng con (thêm／thay đổi／kết thúc) | Tháng bắt đầu áp dụng của biến động |
| **C Không liên kết・một lần** | Chỉ một lần | Lắp đặt hộ／nâng cỡ／lắp đặt lại／phạt chưa kiểm tra | Danh sách áp dụng của cơ sở | Biến động của hợp đồng con (tháng bắt đầu = tháng kết thúc) | Chỉ tháng đó |

**Cách lấy số lượng của A**: cố định 1／giá trị của mục hợp đồng giữ nguyên／chỉ phần vượt mức tiêu chuẩn của gói.
Ví dụ: số lượt giao hàng 12 lần・tiêu chuẩn gói 8 lần・"chỉ phần vượt" → số lượng 4 × ¥3,000 ＝ ¥12,000.

**Phát hiện sót của A**: batch hằng ngày liệt kê các cơ sở có giá trị mục hợp đồng không khớp với dòng khoản mục hiện đang phát sinh (ví dụ: đặt số lượt giao hàng là 10 nhưng không có dòng khoản mục cho 2 lượt thêm). Hiển thị dưới dạng "Không khớp liên kết (cảnh báo)" ở cả danh sách áp dụng của cơ sở lẫn danh sách áp dụng của Master Option.

### 4.1 Luồng nghiệp vụ

```
【B・C】
Vận hành: Hợp đồng con (ví dụ CP0000001-202610) → tab "Thiết bị・Option" → thêm dòng vào "Biến động Option・giảm giá"
      (loại biến động = thêm／thay đổi／kết thúc, chọn OP, số lượng, số tiền (mặc định = tiêu chuẩn của master), tháng bắt đầu・tháng kết thúc áp dụng, lý do)
  ↓ "Phản ánh vào danh sách áp dụng của cơ sở"
Dòng được tạo trong danh sách áp dụng của "Thiết bị・Option" ở cơ sở (AP-xxxx) ／ từ tháng sau trở đi là đặt trước
  ↓
Dòng khoản mục (nguồn = option) phát sinh ở hợp đồng con ① của tháng đó → hiển thị trên hóa đơn bằng "tên hiển thị trên hóa đơn"

【A】
Vận hành: Sửa mục hợp đồng (ví dụ số lượt giao hàng trong cài đặt tuyến giao hàng 8→12)
  ↓ Khi tạo・cập nhật hợp đồng con của tháng sau
Dòng khoản mục ① tự động phát sinh・biến mất ／ danh sách áp dụng của cơ sở cũng tự động thay đổi (cách đăng ký = tự động từ mục hợp đồng)
  ↓ Batch hằng ngày
Cơ sở không khớp được hiển thị ở "Không khớp liên kết"
```

---

## 5. Cách nắm giữ phí

| Mục | Quy tắc | Ngày quyết định |
|---|---|---|
| Số tiền | **Chưa thuế + thuế suất** (8% giảm thuế／10%). Thuế tiêu dùng được cộng thêm theo từng thuế suất trên hóa đơn | 2026/09/25 |
| Loại phí | Phí ban đầu／phí hàng tháng／phí một lần (spot). Được đưa nguyên vào loại phí của dòng khoản mục ① | 2026/09/16 |
| Đơn vị tính phí | 1 hợp đồng／1 lần／1 máy／mỗi 1 đơn vị vượt. Số tiền thanh toán = số tiền tiêu chuẩn × số lượng | 2026/09/16 |
| 0 yên | Có thể đăng ký. **Vẫn để lại trong danh sách của cơ sở với trạng thái đang áp dụng, nhưng không hiển thị trên hóa đơn** | 2026/09/16 |
| Số tiền theo từng cơ sở | Ghi đè bằng "số tiền・tỷ lệ" của biến động (dòng ghi đè đổi màu) | 2026/09/16 |
| Điều chỉnh giá | Không ghi đè mà **thêm phiên bản giá (①・②…)**. Tháng bắt đầu áp dụng = tháng chu kỳ. Không thể xóa phiên bản mà hợp đồng con đã thanh toán đang tham chiếu | 2026/09/16 |
| Tháng đối tượng của spot | Bỏ ghi chú trong ngoặc ở tên khoản mục. Giữ bằng cột "Kỳ đối tượng" của dòng khoản mục ① (REQ-CT-236) | 2026/09/15 |
| Trạng thái | Đang dùng／Kết thúc. Dù chuyển sang Kết thúc thì các cơ sở đang áp dụng vẫn tiếp tục bị thanh toán (chỉ là không thể chọn mới) | 2026/09/16 |

> Master Dòng máy đã được quyết định là không có phiên bản giá (2026/09/25). **Option vẫn giữ nguyên phiên bản giá** (xem mục 7 điểm cần chỉnh 4).

---

## 6. Đối chiếu màn hình và demo

### 6.1 Web vận hành (master = `14_運営_オプション値引きマスタ.html` ／ cơ sở・hợp đồng con = `12_運営_法人拠点契約.html`)

| Màn hình | Tab | Section | Có thể làm gì |
|---|---|---|---|
| **Chỉnh sửa Master Option** | Thông tin cơ bản | Thông tin cơ bản (8) | ID・tên quản lý・tên hiển thị trên hóa đơn・phân loại・mô tả・**phân loại công khai (cần xác nhận)**・trạng thái・thứ tự hiển thị |
| | | Liên kết với mục hợp đồng (6) | Loại liên kết・mục hợp đồng liên kết・điều kiện liên kết・cách lấy số lượng・tự động ghi nhận・cho phép trùng hay không |
| | Phí | Phí tiêu chuẩn (6) | Loại phí・đơn vị tính phí・số tiền tiêu chuẩn (chưa thuế)・thuế suất・gói áp dụng・miễn phí có điều kiện (cần xác nhận) |
| | | Phiên bản giá (8) | Bảng ①・②… Thêm・xóa dòng |
| | Áp dụng・Lịch sử | Danh sách áp dụng (11) | Các cơ sở đang dùng Option này, không khớp liên kết, xuất CSV, tổng đang áp dụng |
| | | Lịch sử (5) | Ngày giờ thay đổi・nội dung・người thay đổi・phân loại・số cơ sở bị ảnh hưởng |
| **Chỉnh sửa thông tin cơ sở** | Thiết bị・Option | Danh sách áp dụng (18) ※chỉ xem | Toàn bộ Option・giảm giá đang có hiệu lực ở cơ sở. Cột chủ sở hữu cho biết "sửa ở đâu" |
| **Chỉnh sửa thông tin hợp đồng (hợp đồng con)** | Thiết bị・Option | Biến động Option・giảm giá (14) | **Việc gắn・ngừng chỉ đăng ký ở đây**. Loại A không hiển thị trong lựa chọn |
| | Phí・Thanh toán | ① Số tiền thanh toán cố định (trả trước) | Nơi phát sinh các dòng khoản mục option／discount |

Các bước thao tác demo (để xác nhận): menu trái "Chỉnh sửa Master Option" → 3 tab ／ "Chỉnh sửa thông tin cơ sở" → "Thiết bị・Option" → "Danh sách áp dụng" bên dưới ／ "Chỉnh sửa thông tin hợp đồng (hợp đồng con)" → "Thiết bị・Option" → "Biến động Option・giảm giá". Khi chuyển sang "Web doanh nghiệp" ở góc trên bên phải, danh sách áp dụng của cơ sở chỉ hiển thị để tham chiếu (Master Option không hiển thị trên Web doanh nghiệp).

### 6.2 Option xuất hiện ở các demo khác

| Demo | Vị trí | Nội dung | Quan hệ với đặc tả hiện tại |
|---|---|---|---|
| `15_運営_請求.html` | Master → "Master Option" | Danh sách Option (6 mục・dạng `OP-001`) ＋ "Khoản mục Option đang được sử dụng ở các cơ sở" | **Vẫn là thiết kế cũ** (mục 7 điểm 1) |
| `21_法人_申込フォーム.html` | Bước đăng ký 1 "Option khác" / yêu cầu thay đổi "Thay đổi Option・giao hàng" | Bổ sung định kỳ vật tư ¥1,500／chỉ định khung giờ giao hàng ¥2,000／báo cáo vận hành hàng tháng ¥1,000／dán decal máy bán hàng tự động (báo giá riêng) | Phân loại công khai **vẫn đang cần xác nhận**, demo mặc định là "có hiển thị" (mục 7 điểm 6・7) |

---

## 7. Điểm không khớp giữa đặc tả và demo・điểm nên chỉnh (chỉ nêu・chưa phản ánh)

Mức độ quan trọng: **Cao** = demo đang hiển thị ngược với đặc tả／Trung bình = đặc tả chưa quyết định・có thể hiểu theo 2 cách／Thấp = dữ liệu mẫu hoặc cách ghi

| # | Mức | Ở đâu | Chuyện gì đang xảy ra | Đề xuất cách sửa |
|---|---|---|---|---|
| 1 | **Cao** | `es_billing_ops_demo` Master Option・Master Giảm giá | Vẫn là thiết kế cũ. ① ID là `OP-001` (chuẩn là `OP000001`) ② **Thêm hộp vật tư・phí lắp đặt tủ lạnh・thuê lò vi sóng đang nằm trong Option** (chuẩn là Master Dòng máy) ③ Không có loại liên kết ④ **"Đơn giá (đã gồm thuế)"** (chuẩn là chưa thuế + thuế suất) ⑤ Ghi "Ở tab 'Thông tin phí・thanh toán' của hợp đồng, chọn từ Master Option để thêm vào khoản mục", "Giảm giá được áp dụng bằng checkbox ở cơ sở" (chuẩn là "Biến động Option・giảm giá" của hợp đồng con). Ở màn hình hợp đồng con của cùng demo có phần giải thích đúng, nên **trong 1 file đang lẫn 2 cách giải thích** | Chỉnh màn hình master của demo nghiệp vụ thanh toán cho cùng mục・cùng dữ liệu mẫu (OP000001〜) với demo entity. Hoặc bỏ màn hình master khỏi demo nghiệp vụ thanh toán và thay bằng liên kết tới demo entity |
| 2 | **Cao** | `es_entity_demo` Hợp đồng con CP0000001-202607 "Phí・Thanh toán" ① | **Dòng khoản mục ① không khớp với danh sách áp dụng của cơ sở.** Danh sách áp dụng (những gì có hiệu lực trong tháng này) là Thêm lượt giao hàng ¥12,000／Phí giao hàng theo khu vực ¥4,000／Chênh lệch điều chỉnh giá −¥3,000, nhưng ① lại là "Option・phí quản lý thiết bị ¥12,000", "Giảm giá chuyển từ hãng khác −¥12,000", "Thêm spot ¥11,000". Phí giao hàng theo khu vực và chênh lệch điều chỉnh giá không có ở ①, còn giảm giá chuyển từ hãng khác không có ở danh sách áp dụng. **Quy định "dòng option／discount tự động phát sinh từ danh sách áp dụng" không thể hiện trên demo.** Ngoài ra, loại phí của khoản cố định theo gói đang là "phí ban đầu" (đúng phải là phí hàng tháng) | Làm lại dữ liệu mẫu của ① từ danh sách áp dụng (3 dòng: thêm lượt giao hàng・phí giao hàng theo khu vực・chênh lệch điều chỉnh giá＋khoản cố định theo gói) |
| 3 | Trung bình | Dòng khoản mục ① của cả hai demo | Tên khoản mục "**Option・phí quản lý thiết bị**" trộn option và model vào một dòng. OPEN "tính trùng phí quản lý thiết bị và Option" đã xảy ra ngay trên demo | Tách phí hàng tháng của thiết bị (model) và Option (option) thành các dòng riêng. Đang chờ trả lời OPEN #3 |
| 4 | Trung bình | Master Option "Phiên bản giá" | Văn bản đặc tả có thể hiểu là "tăng phiên bản **để giữ phí của các cơ sở đã ký hợp đồng trước đây**" = cơ sở hiện có giữ giá cũ. Demo khi thêm ② (¥3,000) thì **dòng khoản mục của cả 128 cơ sở đều thay đổi** (số cơ sở ảnh hưởng trong lịch sử là 128, CU00643 bắt đầu 2026-04 cũng thành ¥3,000) = có thể hiểu là tất cả cơ sở chuyển theo tháng. **Khi điều chỉnh giá, cơ sở hiện có chuyển sang giá mới hay giữ nguyên chưa được quyết định.** "Số tiền" ở danh sách áp dụng là snapshot hay tham chiếu phiên bản cũng là cùng vấn đề | Xác nhận với vận hành: "A Chuyển tất cả cơ sở theo tháng (giống Master Gói)", "B Cơ sở hiện có giữ nguyên・chỉ cơ sở mới dùng giá mới". Sau khi quyết định thì sửa văn bản đặc tả hoặc demo |
| 5 | Trung bình | "Thay đổi" trong "Biến động Option・giảm giá" của hợp đồng con | Dữ liệu mẫu "thay đổi" AP-0003 (chênh lệch điều chỉnh giá −¥3,000・2026-04〜) thành −¥3,500 từ 2026-07. Danh sách áp dụng là 1 dòng = 1 số tiền nên **chưa ghi −¥3,000 của 2026-04〜06 được giữ ở đâu** (nếu tính lại hợp đồng con của tháng trước về sau thì số tiền có thể thay đổi) | Ghi rõ vào đặc tả: "Thay đổi" xử lý nội bộ là kết thúc dòng cũ ở tháng trước + bắt đầu dòng mới (cùng ID áp dụng nhưng tách kỳ) |
| 6 | Trung bình | `es_apply_form_demo` Đăng ký bước 1 | 4 mục "Option khác" (bổ sung định kỳ vật tư・chỉ định khung giờ giao hàng・báo cáo vận hành hàng tháng・dán decal máy bán hàng tự động) **không nằm trong danh sách ứng viên đăng ký Option (Danh sách mục master, Phần II)**. Phân loại công khai (có hiển thị trên Web doanh nghiệp hay không) vẫn cần xác nhận nhưng demo mặc định là "có hiển thị". "Báo giá riêng" của dán decal máy bán hàng tự động không thể biểu diễn bằng master bắt buộc có số tiền (cùng vấn đề với OPEN 12-4 của Master Dòng máy) | Bổ sung 4 mục vào Phần II (phân loại・loại liên kết・số tiền). Xác nhận với vận hành phân loại công khai và cách biểu diễn "báo giá riêng" cùng với OPEN #6 |
| 7 | Trung bình | Yêu cầu thay đổi "Thay đổi Option・giao hàng" trên Web doanh nghiệp | Demo form đăng ký có yêu cầu thay đổi từ doanh nghiệp, nhưng "Danh sách áp dụng" của cơ sở trong danh sách mục quy định **yêu cầu thay đổi = không được**. Đặc tả không có việc sau khi nhận yêu cầu thì vận hành làm gì ở đâu (tạo biến động ở hợp đồng con) | Thêm một đoạn vào §0.7 của danh sách mục: luồng "Doanh nghiệp yêu cầu → Vận hành phê duyệt → đăng ký vào biến động của hợp đồng con của tháng chu kỳ đối tượng (với loại A thì sửa mục hợp đồng)" |
| 8 | Thấp | `es_entity_demo` Biến động của hợp đồng con 202607 | Dòng "kết thúc" đang kết thúc ở hợp đồng con 2026-07 một khuyến mãi giảm giá lần đầu **đã kết thúc từ 2026-06** (chỉ định theo số tháng = tự động kết thúc). Có vẻ là thao tác không cần thiết | Thay dữ liệu mẫu bằng ví dụ như "kết thúc phí quản lý thiết bị loại B ở 2026-07" |
| 9 | Thấp | `es_entity_demo` | Không có dữ liệu mẫu thể hiện **"từ tháng sau" của loại A** (quyết định 9/25) | Ở hợp đồng con 202607 minh họa ví dụ đổi số lượt giao hàng → dòng khoản mục phát sinh ở 202608, bằng lịch sử thay đổi hoặc dòng "đặt trước (từ tháng sau)" của danh sách áp dụng |
| 10 | Thấp | `es_billing_ops_demo` OP-005 | "Dịch vụ thu hồi tiền mặt" nằm trong Option. Thanh toán tiền mặt có chủ trương bãi bỏ từ 2026/08/25 và cũng không có trong danh sách ứng viên đăng ký | Loại bỏ, hoặc xác nhận cùng OPEN #1 (tính phí chế độ khách・dùng tiền mặt) |
| 11 | Thấp | `es_option_discount_master_demo` Master Option | Chỉ có màn hình chỉnh sửa, **không có màn hình danh sách (tìm kiếm・nhập／xuất CSV・đăng ký mới)**. Master Kho đã định nghĩa màn hình danh sách | Quyết định có thêm danh sách cùng dạng với danh sách Master Kho (khu vực tìm kiếm＋danh sách＋cột thao tác＋phân trang) hay không |
| 12 | Thấp | `Danh_sách_mục_Master_Dòng_máy_Tùy_chọn_Giảm_giá.md` Phần IV OPEN | **Trong bảng lẫn các dòng mục của Master Dòng máy** (#12 "Có hiệu lực／vô hiệu"・#13 "Bố cục máy bán hàng tự động: hàng"・#12 "Thu hồi chưa hoàn tất"). Số thứ tự cũng bị trùng | Sửa script sinh (định nghĩa OPEN trong `master_items.py`) rồi sinh lại |
| 13 | Thấp | `es_option_discount_master_demo` Tiêu đề Master Option | Cách nói đơn vị bị lệch giữa "số tiền tiêu chuẩn ¥3,000／lần" và đơn vị tính phí "mỗi 1 đơn vị vượt" | Thống nhất theo cách ghi của đơn vị tính phí |

---

## 8. Các điều đã quyết định (liên quan Option・theo thứ tự ngày)

| Ngày | Quyết định |
|---|---|
| 2026/06/09 | Option giao hàng・hợp đồng không đưa vào Master Gói mà phản ánh vào thanh toán như Option theo từng hợp đồng (REQ-PM-021) |
| 2026/09/15 | Tháng đối tượng của chi phí spot bỏ ghi chú trong ngoặc ở tên khoản mục, giữ ở cột kỳ đối tượng của dòng khoản mục |
| 2026/09/16 | Lập mới Master Option・Master Giảm giá. Cơ sở là chủ sở hữu・đăng ký ở hợp đồng con・dòng khoản mục ở ①. Loại liên kết A／B／C. Không đưa thiết bị vào Option. Giảm giá Option biểu diễn bằng đối tượng áp dụng của Master Giảm giá. Điều chỉnh giá bằng phiên bản |
| 2026/09/17 | Thêm "Hết hạn kỳ khuyến mãi" và "Khác (ghi vào ghi chú)" vào lý do của biến động (đang xác nhận với vận hành) |
| 2026/09/25 | Loại liên kết A **từ hợp đồng con của tháng sau**. Không có mục "tháng bắt đầu có hiệu lực" |
| 2026/09/25 | Option・giảm giá cũng nắm giữ theo **chưa thuế + thuế suất** |
| 2026/09/25 | Khi chồng nhiều giảm giá thì **nhập thứ tự áp dụng cho từng giảm giá** |

---

## 9. Các điều chưa quyết định (liên quan Option)

| # | Vấn đề | Phụ trách |
|---|---|---|
| 1 | Chế độ khách・dùng tiền mặt có phí không (nếu tính phí thì đăng ký loại A, nếu không có thì không đăng ký) | Aoyama |
| 2 | Có thể tự động đưa phí hàng tháng ES-QR vào thanh toán không (đặc tả hợp đồng §8D-3) | Hong |
| 3 | Tính trùng phí quản lý thiết bị và Option (model và option ở ① có chồng nhau không) → mục 7 điểm 3 | Hong |
| 6 | Phân loại công khai: có Option nào hiển thị trong đăng ký trên Web doanh nghiệp không → mục 7 điểm 6 | Aoyama |
| 7 | Miễn phí có điều kiện (miễn phí nếu số lượng cung cấp hàng tháng đạt mức nhất định) có dùng cho Option không | Aoyama |
| 8 | Có đưa thanh toán vượt hao hụt quản lý vào Master Option không (vì xử lý ở ② quyết toán thực tế) | Hong |
| Mới | Khi điều chỉnh giá, chuyển cơ sở hiện có sang giá mới hay giữ nguyên → mục 7 điểm 4 | Aoyama |
| Mới | Với biến động "thay đổi", giữ số tiền của tháng trước như thế nào → mục 7 điểm 5 | Hong |
| Mới | Thao tác của vận hành sau khi nhận yêu cầu thay đổi "Thay đổi Option・giao hàng" của doanh nghiệp → mục 7 điểm 7 | Aoyama |

---

## 10. Ứng viên đăng ký Option (tóm tắt Phần II ＋ từ form đăng ký)

| # | Tên (đề xuất) | Phân loại | Liên kết | Loại phí | Đơn vị tính phí | Số tiền | Nguồn |
|---|---|---|---|---|---|---|---|
| 1 | Thêm lượt giao hàng | Giao hàng | A (số lượt giao hàng) | Hàng tháng | Mỗi 1 đơn vị vượt | Demo ¥3,000 | Phần II |
| 2 | Phí giao hàng theo khu vực | Giao hàng | A (tỉnh thành) | Hàng tháng | 1 hợp đồng | Demo ¥4,000 (Kanto) | Phần II |
| 3 | Phí sử dụng ES-QR | Chức năng app | A (ES-QR) | Hàng tháng | 1 hợp đồng | Chưa định | Phần II (cần xác nhận) |
| 4 | Phí sử dụng chế độ khách | Chức năng app | A (chế độ khách) | Hàng tháng | 1 hợp đồng | Chưa định | Phần II (cần xác nhận) |
| 5 | Lắp đặt hộ | Lắp đặt・công việc | C | Một lần | 1 lần | Demo ¥15,000 | Phần II |
| 6 | Phí nâng cỡ (**2026/10/01 đổi tên thành OP000010 Thay tủ lạnh (theo yêu cầu khách hàng)・nhập theo từng lần**. Chênh lệch kích cỡ là OP000023) | Lắp đặt・công việc | C | Một lần | 1 lần | Chưa định | Phần II |
| 7 | Lắp đặt lại・di dời | Lắp đặt・công việc | C | Một lần | 1 lần | Chưa định | Phần II |
| 8 | Phí ban đầu (phí hành chính) | Hành chính | C | Ban đầu | 1 hợp đồng | Chưa định | Phần II |
| 9 | Phí quản lý thiết bị | Hành chính | B | Hàng tháng | 1 hợp đồng | Chưa định | Phần II (cần xác nhận tính trùng) |
| 10 | Phạt chưa kiểm tra | Phạt | C | Một lần | 1 lần | ¥3,000 | Phần II (quyết định 2026/08/25) |
| 11 | Thanh toán vượt hao hụt quản lý | Phạt | C | Quyết toán thực tế | Mỗi 1 đơn vị vượt | — | Phần II (cần xác nhận nơi đặt) |
| 12 | Bổ sung định kỳ vật tư | Giao hàng? | B? | Hàng tháng | 1 hợp đồng | ¥1,500 | **Chỉ có ở demo form đăng ký** |
| 13 | Dịch vụ chỉ định khung giờ giao hàng | Giao hàng | B? | Hàng tháng | 1 hợp đồng | ¥2,000 | **Chỉ có ở demo form đăng ký** |
| 14 | Cung cấp báo cáo vận hành hàng tháng | Chức năng app? | B? | Hàng tháng | 1 hợp đồng | ¥1,000 | **Chỉ có ở demo form đăng ký** |
| 15 | Thay đổi decal máy bán hàng tự động | Lắp đặt・công việc | C? | Một lần | 1 lần | Báo giá riêng | **Chỉ có ở demo form đăng ký** |

Các mục 12〜15 đang tạm điền phân loại・loại liên kết (dấu "?").
