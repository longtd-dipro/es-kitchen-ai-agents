# Đơn đăng ký・Phê duyệt (8 loại đơn đăng ký thay đổi của Web doanh nghiệp / phê duyệt của vận hành)

> **Nguồn chính thức của chủ đề này. Quyết định đang có hiệu lực xem `docs/決定台帳.md`.** Nếu sổ cái và tài liệu này mâu thuẫn thì sổ cái là đúng (tài liệu này sửa sót).
> Tạo: 2026-10-03 (tạo mới theo sổ cái A "Biểu mẫu đăng ký・phê duyệt đơn: viết mới từ các file quyết định" Q3=A).
> **Các tài liệu cũ sau được đóng băng** (từ nay không cập nhật. Nguồn đúng là tài liệu này): `30_Đơn_yêu_cầu/Màn_hình_chi_tiết_yêu_cầu_Đề_xuất_thiết_kế_lại_v1.md`, `30_Đơn_yêu_cầu/Đặc_tả_kiểm_tra_nhập_liệu_Form_đăng_ký_20261001.md` §4, Phần 1 của `30_Đơn_yêu_cầu/Danh_sách_email_Đăng_ký_và_yêu_cầu_20261001.md` (điều kiện gửi・người nhận. Nội dung thư theo Excel là đúng), `90_デモ確認/変更申請_影響範囲と制御一覧_20261001.md` (ảnh hưởng và kiểm soát đã đưa vào §8).
> Đăng ký mới・thêm cơ sở・tiếp nhận (đăng ký tạm・đăng ký chính thức)・chuyển từ dùng thử → triển khai chính thức xem `20_Doanh_nghiệp_Cơ_sở_Hợp_đồng/Form_đăng_ký.md`.
> Những điều chưa quyết định・chỗ các tài liệu mâu thuẫn nhau được ghi trong nội dung là "⚠️ Cần xác nhận (2026-10-03)" và tổng hợp ở §13.

---

## 0. Cách đọc

### 0-1. Ký hiệu viết tắt của nguồn

Giống `Form_đăng_ký.md` §0-2. Những ký hiệu hay dùng trong tài liệu này:

| Ký hiệu | File |
|---|---|
| 28-xx | `00_Quyết_định/Quyết_định_v2.3_Bổ_sung_Liên_quan_đơn_yêu_cầu_20260928.md` |
| v2.3 #n | `00_Quyết_định/Quyết_định_v2.3_20260923.md` (7 loại màn hình phê duyệt) |
| STEP1・STEP2 Qn・STEP5 | `00_Quyết_định/Quyết_định_STEP1_Trả_lời_Đăng_ký_và_Mẫu_20261001.md`・`Quyết_định_STEP2_Trả_lời_Doanh_nghiệp_Cơ_sở_Hợp_đồng_20261001.md`・`Quyết_định_STEP5_Trả_lời_Web_doanh_nghiệp_20261001.md` |
| S・T・D・E | `00_Quyết_định/Quyết_định_STEP3_Trả_lời_phần_còn_lại_và_đóng_STEP1_20261001.md` (nội dung D・E của T5 xem `90_デモ確認/質問一覧_STEP1を閉じる・STEP3の残り_20261001.md`) |
| #63 | `00_Quyết_định/Quyết_định_v2.3_Bổ_sung_Đổi_ngày_sau_hạn_chót_20260929.md` |
| #37・#6(v2.2) | `00_Quyết_định/Quyết_định_v2.3_Bổ_sung_Vấn_đề_chưa_giải_quyết_và_ủy_thác_đợt_1_20260929.md` #37, `Quyết_định_v2.2_20260922.md` §6 |
| TL・DR・Q | `00_Quyết_định/決定_TechLeadレビュー回答_*.md`・`Quyết_định_Trả_lời_review_thiết_kế_20261001.md` (Q là số câu hỏi của phụ lục TechLead. Nội dung đã tổng hợp ở `Đặc_tả_hợp_đồng/契約_01`) |
| H1〜H5 | `00_Quyết_định/Quyết_định_Tài_khoản_Web_doanh_nghiệp_H1-H5_20261001.md` |
| Dòng n | Bảng yêu cầu (`Quyết_định_Trả_lời_phản_ánh_một_phần_bảng_yêu_cầu_20260930.md`・`Quyết_định_Bảng_yêu_cầu_Phase2_Trả_lời_phần_còn_lại_và_đề_xuất_20261002.md`) |
| Gốc #n | `00_確認してほしい/作業記録_20261003/申込・申請_仕様に入れる内容_20261003.md` |
| Danh sách vấn đề mm/dd | `00_確認してほしい/課題一覧_データ統合と画面_20261002.md` (ngày trả lời của hong) |
| 契約_0n | `20_Doanh_nghiệp_Cơ_sở_Hợp_đồng/Đặc_tả_hợp_đồng/契約_0n_*.md` |
| Web doanh nghiệp § | `20_Doanh_nghiệp_Cơ_sở_Hợp_đồng/Web_doanh_nghiệp_Quản_lý_cơ_sở_Đặc_tả_màn_hình_v1.md` |
| Phạm vi ảnh hưởng B-n | `90_デモ確認/変更申請_影響範囲と制御一覧_20261001.md` |

### 0-2. Phạm vi

| Bao gồm | Không bao gồm (nơi đặt) |
|---|---|
| 8 loại đơn đăng ký (thay đổi gói／giao hàng／thiết bị／thông tin cơ sở／thông tin doanh nghiệp・tạm dừng・mở lại・hủy hợp đồng) | Đăng ký mới・thêm cơ sở・chuyển đổi → `Form_đăng_ký.md` |
| Các thay đổi phản ánh ngay không cần phê duyệt trên Web doanh nghiệp (người phụ trách・tên doanh nghiệp, v.v.) và thông báo cho vận hành | Thay đổi ngày giao hàng (`DD-`) → đặc tả giao hàng (#63・S7-37) |
| Màn hình phê duyệt・nhập hộ của vận hành | Tính thanh toán (nội dung phí vi phạm・chi tiết điều chỉnh) → quy tắc thanh toán |

---

## 1. Các loại đơn đăng ký (8 loại)

| # | Loại | Tab trong danh sách (vận hành) | Đối tượng | Tài khoản có thể gửi | Nguồn |
|---|---|---|---|---|---|
| 1 | Thay đổi gói | Thay đổi hợp đồng | Cơ sở đang sử dụng | Doanh nghiệp・cơ sở | STEP1 "Loại đơn đăng ký: 8 loại" |
| 2 | Thay đổi giao hàng | Thay đổi hợp đồng | Cơ sở đang sử dụng | Doanh nghiệp・cơ sở | Như trên |
| 3 | Thay đổi thiết bị | Thay đổi hợp đồng | Cơ sở đang sử dụng | Doanh nghiệp・cơ sở | Như trên, 28 §5 (giữ ở màn hình phê duyệt・trang doanh nghiệp) |
| 4 | Thay đổi thông tin cơ sở | Thay đổi hợp đồng | Cơ sở đang sử dụng | Doanh nghiệp・cơ sở | Như trên |
| 5 | Thay đổi thông tin doanh nghiệp | Thay đổi hợp đồng | Doanh nghiệp (phê duyệt như 1 doanh nghiệp) | **Chỉ tài khoản doanh nghiệp** | STEP1 (8 thẻ phê duyệt), Web doanh nghiệp §2-3 |
| 6 | Tạm dừng | Tạm dừng・hủy hợp đồng | Cơ sở đang sử dụng | Doanh nghiệp・cơ sở | Như trên, Web doanh nghiệp §4-1 |
| 7 | Mở lại | Tạm dừng・hủy hợp đồng | Cơ sở đang tạm dừng | Doanh nghiệp・cơ sở | Như trên |
| 8 | Hủy hợp đồng | Tạm dừng・hủy hợp đồng | Cơ sở đang sử dụng・**đang tạm dừng** | Doanh nghiệp・cơ sở | 28-21, Web doanh nghiệp §4-1 |

- Số đơn là **`CH-YYYYMMDD-NNNN`** (NNNN là số thứ tự theo ngày) 〔S7-7 (`Quyết_định_STEP7_Trả_lời_20261001.md`)〕. Thay đổi ngày giao hàng tách riêng bằng `DD-` 〔S7-37〕.
- Lối vào: trên Web doanh nghiệp là "Đăng ký thay đổi" trong "Đơn đăng ký"・"Đăng ký thay đổi" ở danh sách cơ sở・"Đăng ký thay đổi" ở chi tiết cơ sở (thủ tục 1〜3・6〜8). **Thông tin cơ sở・thông tin doanh nghiệp: nếu bấm "Chỉnh sửa" và lưu ô cần phê duyệt thì ngay lúc đó trở thành đơn đăng ký (chờ phê duyệt)** (4・5) 〔Web doanh nghiệp §1・§2-2・§2-3〕.
- Không đặt thủ tục "thay đổi cơ sở・người phụ trách" (sửa bằng "Chỉnh sửa" ở chi tiết cơ sở) 〔Web doanh nghiệp §2-2・§4-4〕.
- Lối vào của vận hành: "**Nhập hộ đơn đăng ký thay đổi**" ở các tab "Thay đổi hợp đồng" "Tạm dừng・hủy hợp đồng" của quản lý đơn đăng ký hợp đồng (§3-8) 〔28-144⑨〕.

---

## 2. Phân loại phê duyệt (theo từng mục)

**Phân loại phê duyệt được quyết định theo từng mục** (cả thay đổi thông tin doanh nghiệp và thay đổi thông tin cơ sở) 〔STEP1 "Phân loại phê duyệt", sổ cái "Phê duyệt thay đổi thông tin doanh nghiệp". "Chưa quyết" ở Phạm vi ảnh hưởng B-5 đã được giải quyết〕. Có 4 loại sau.

| Loại | Khi lưu trên Web doanh nghiệp | Vận hành | Nguồn |
|---|---|---|---|
| **Bắt buộc phê duyệt** | Trở thành đơn đăng ký chờ phê duyệt (`CH-`), phản ánh sau khi phê duyệt | Phê duyệt・từ chối | 28 §5, STEP1 |
| **Chỉ thông báo** (phản ánh ngay + thông báo cho vận hành) | Phản ánh ngay | Biết qua thông báo | STEP2 Q3・Q10 |
| Không cần phê duyệt (phản ánh ngay・không thông báo) | Phản ánh ngay | — | Bảng mục của 契約_03〜05 |
| **Chỉ vận hành** | Trên Web doanh nghiệp chỉ để xem (không thay đổi・đăng ký được) | Vận hành sửa (nhận qua liên hệ) | 28-31, dòng 157 |

### 2-1. Doanh nghiệp (thay đổi thông tin doanh nghiệp・chỉ tài khoản doanh nghiệp)

| Mục | Loại | Nguồn |
|---|---|---|
| Tên doanh nghiệp・tên doanh nghiệp (hợp đồng)・furigana tên doanh nghiệp・tên doanh nghiệp nhận hóa đơn | **Chỉ thông báo (phản ánh ngay + thông báo cho vận hành)** | STEP2 Q3, sổ cái, 契約_03 |
| Địa chỉ ghi trên hóa đơn (mã bưu điện〜tòa nhà, v.v.)・số điện thoại・**số FAX** | **Bắt buộc phê duyệt** (loại đơn "Thay đổi thông tin doanh nghiệp") | Web doanh nghiệp §2-3 (09/30), 契約_03 |
| Người phụ trách của doanh nghiệp (phân loại・họ tên・furigana・email・điện thoại・thêm／xóa dòng) | **Chỉ thông báo**. Bắt buộc có 1 người chính・1 người phụ trách thanh toán | STEP2 Q10, 契約_03 |
| Lead time phát hành hóa đơn・đơn vị phát hành hóa đơn・phương thức thanh toán・thủ tục chuyển khoản ngân hàng・chu kỳ thanh toán・tháng bắt đầu tính・hạn thanh toán | **Chỉ vận hành** (doanh nghiệp chỉ xem. Đơn thay đổi từ doanh nghiệp không xử lý phương thức thanh toán) | 28-31, 28 §4 (6C), E-9=B, 契約_03 |

### 2-2. Cơ sở (thay đổi thông tin cơ sở)

| Mục | Loại | Nguồn |
|---|---|---|
| Tên cơ sở・furigana・địa chỉ (mã bưu điện〜tòa nhà, v.v.)・số điện thoại | **Bắt buộc phê duyệt** | Web doanh nghiệp §1, 契約_04 |
| Nơi nhận hóa đơn (doanh nghiệp／cơ sở này) | Bắt buộc phê duyệt (bảng mục). Cơ sở có thể đăng ký (bắt buộc phê duyệt) 〔hong trả lời 2026-10-03 (K9)〕 | 契約_04 Thanh toán #1 |
| Ngày trong tuần không nhận hàng của hợp đồng con・ngày mong muốn cho thiết bị (thu hồi・nhập vào・dự kiến lắp đặt) | **Bắt buộc phê duyệt**. Lối vào là 1 chỗ "Thay đổi thông tin cơ sở" (không trùng với thay đổi giao hàng) | STEP1 (tối 10/01), 契約_05 |
| Số FAX | Không cần phê duyệt (phản ánh ngay). **Không đưa vào đơn thay đổi thông tin cơ sở** | U14 (T6), 契約_04 |
| Số nhân viên・ghi chú・ghi chú giao hàng・tài liệu lộ trình vận chuyển vào (cho khách hàng)・ảnh nơi lắp đặt | Không cần phê duyệt (phản ánh ngay) | Web doanh nghiệp §1, 契約_04・05 |
| Người phụ trách của cơ sở | **Chỉ thông báo** (thay đổi người phụ trách chính・người phụ trách thanh toán luôn phải thông báo). Làm được cả khi đang tạm dừng | STEP2 Q10, DR-3, 契約_04 |
| Giới hạn số lượng 1 ngày・giới hạn số tiền 1 tháng (mỗi người) | Không cần phê duyệt (phản ánh ngay). Có hiệu lực với tất cả hợp đồng con từ chu kỳ hiện tại trở đi | STEP2 Q2, 契約_05 |
| **Chế độ khách (Guest mode)** | **Chỉ thông báo (không cần phê duyệt・phản ánh ngay + thông báo cho vận hành)** (2026-10-02. Thay thế D5 "bắt buộc phê duyệt" 〔10/01〕) | Dòng 157 (`決定_要件シートPhase2` 10/02), 契約_05 #4. Dùng được ngay khi lưu. Phí theo quy tắc hạn chốt. Có hộp thoại xác nhận khi lưu 〔hong trả lời 2026-10-03 (K3)〕 |
| **ES-QR** | **Chỉ vận hành** (Web doanh nghiệp chỉ hiển thị・không đăng ký thay đổi được) | Dòng 157 (09/30), 契約_05 #5 |

### 2-3. Hợp đồng con (những mục gửi bằng loại đơn đăng ký)

| Mục | Loại | Loại đơn đăng ký | Nguồn |
|---|---|---|---|
| Gói・Course | Bắt buộc phê duyệt | Thay đổi gói | 契約_05 |
| Loại giao hàng (chuyến giao ES／chuyến COOL)・số lần giao hàng | Bắt buộc phê duyệt | Thay đổi giao hàng | 契約_05, 28-19 |
| Thiết bị (thêm・thu hồi・đổi dòng máy)・đại diện lắp đặt | Bắt buộc phê duyệt | Thay đổi thiết bị | 28 §5, dòng 156 |
| Mẫu giao hàng・chu kỳ giao hàng・tuyến giao hàng (kho・công ty vận chuyển・công ty giao hàng・lead time) | **Chỉ vận hành** (khách hàng không chọn. Nguyện vọng ghi vào ghi chú giao hàng) | — | 28-77・78. Chỉ số lần giao hàng là khách hàng đăng ký bằng thay đổi giao hàng (bắt buộc phê duyệt) 〔28-77・28-78・sổ cái〕. Bảng của 契約_05 theo như vậy |
| Điều chỉnh giá・áp dụng phúc lợi・tùy chọn・giảm giá | Chỉ vận hành (thay đổi do vận hành làm ở hợp đồng con) | — | 契約_05, 28-173 |
| Không có hạn dùng ngắn | Chỉ vận hành (quyết định khi đăng ký, thay đổi chỉ vận hành) | — | REQ-CT-300 |

---

## 3. Quy tắc chung của đơn đăng ký

### 3-1. Nội dung của 1 đơn đăng ký

| Quy định | Nguồn |
|---|---|
| **1 đơn 1 loại** (không trộn thủ tục). Ngoại lệ là mở lại (§6-7) | 28-22, 28-13 |
| **1 đơn có thể gồm nhiều cơ sở** (nếu cùng thủ tục). Tháng chu kỳ muốn bắt đầu chọn được theo từng cơ sở | v2.3 ⑥, màn hình hiện tại |
| Người đăng ký: vì là tài khoản dùng chung nên khi gửi, chọn "Người đăng ký" trong bảng người phụ trách bằng radio (bắt buộc). Lưu lại: tài khoản・người phụ trách đã chọn・họ tên tại thời điểm đó | Web doanh nghiệp §1-2, 契約_04 Lịch sử đơn đăng ký #4 |
| Hoàn cảnh・nguyện vọng: tùy chọn・nhiều dòng 500 ký tự | Danh sách vấn đề 10/03 |

### 3-2. Đơn vị phê duyệt và trạng thái

| Quy định | Nguồn |
|---|---|
| **Phê duyệt・từ chối theo từng cơ sở** (thay đổi thông tin doanh nghiệp là 1 doanh nghiệp) | v2.3 #1・⑥, màn hình hiện tại |
| Trạng thái đơn: chờ phê duyệt／**đang xử lý (số đã xử lý/tổng. Ví dụ "Đang xử lý 1/3")**／đã phê duyệt／phê duyệt một phần／từ chối／đã rút lại (vẫn còn cơ sở chờ phê duyệt = đang xử lý・tất cả cơ sở đã phê duyệt = đã phê duyệt・đã xử lý hết mà lẫn phê duyệt và từ chối = phê duyệt một phần・từ chối tất cả = từ chối) (trước đây: đang xử lý là "đã xử lý một phần") 〔hong trả lời 2026-10-05 (#2)〕 | v2.3 ⑥, màn hình hiện tại |
| Trạng thái của cơ sở (chi tiết đơn): chờ phê duyệt／đã phê duyệt／từ chối／đã rút lại | 契約_04 Lịch sử đơn đăng ký #7 |
| Thông báo cho khách hàng **theo từng cơ sở** (không đợi phê duyệt 1 cơ sở mà dừng tất cả) | v2.3 ⑥ |
| **Đơn đã phê duyệt chỉ để xem. Muốn sửa thì gửi đơn mới** (không hủy phê duyệt・không làm lại) | Danh sách vấn đề 10/02 "4-8" |

- Đã bỏ "Làm lại" trong chi tiết đơn của vận hành (2026-10-03・sổ tiếp nhận No.11). Cơ sở đã phê duyệt・từ chối thì chốt ngay tại chỗ.
- Khó phân biệt giữa trạng thái "đã xử lý một phần" và "phê duyệt một phần" 〔Chênh lệch mục màn hình tiếp nhận・phê duyệt "Sắp xếp trạng thái"〕. ⚠️ Sắp xếp lại tên (cùng với §13 B4).

### 3-3. Cấm đăng ký trùng

| Quy định | Nguồn |
|---|---|
| **Cơ sở đang có đơn chờ phê duyệt không chọn được trong đơn mới** (hiển thị "Đang đăng ký" và làm xám). **Hủy hợp đồng cũng không ngoại lệ**. Nếu gấp thì rút lại rồi đăng ký lại, hoặc liên hệ | 28-4 |
| Trong lúc chờ phê duyệt, các ô bắt buộc phê duyệt trên Web doanh nghiệp cũng bị khóa | Web doanh nghiệp §1・§4-3 |
| Trong lúc chờ phê duyệt, vận hành cũng không chỉnh sửa trực tiếp các mục đối tượng của đơn trong hợp đồng con của cơ sở đó | TL-1, 契約_01 §1 |
| Nhập hộ cũng vậy (không chọn được cơ sở đang có đơn chờ phê duyệt) | 28 §8 phương án, 28-144⑨ |
| Cơ sở đã được phê duyệt dự kiến tạm dừng thì không chọn được thay đổi gói・tạm dừng | Web doanh nghiệp §2-2 |
| Câu chữ: "Vì có đơn đăng ký đang chờ phê duyệt nên vui lòng đăng ký sau khi được phê duyệt." | Đặc tả kiểm tra nhập liệu §4 |

### 3-4. Rút lại

| Quy định | Nguồn |
|---|---|
| **Chỉ với cơ sở mà vận hành chưa xử lý**, có thể rút lại theo từng cơ sở từ "Nội dung đang đăng ký" trên Web doanh nghiệp. Cơ sở đã xử lý thì không được | 28-26 |
| Người rút lại được là **tài khoản đã gửi đơn và tài khoản doanh nghiệp** thôi. Khi mở đơn do tài khoản doanh nghiệp gửi bằng tài khoản cơ sở thì không hiển thị "Rút lại" mà hiển thị "Vì là đơn do tài khoản doanh nghiệp gửi nên việc rút lại thực hiện từ tài khoản doanh nghiệp" | H2, Web doanh nghiệp §1 |
| Lưu lại ngày giờ rút lại (hiển thị ở lịch sử đơn của Web doanh nghiệp) | 28-28, 契約_04 |

### 3-5. Từ chối

| Quy định | Nguồn |
|---|---|
| **Lý do từ chối là bắt buộc** (lựa chọn mẫu + văn bản tự do). **Thông báo cho doanh nghiệp theo từng cơ sở**, kèm câu mẫu của lý do | 28-25 |
| **Không làm trả lại để sửa** (muốn sửa thì đăng ký lại) | 28-25 (9/11) |
| Lựa chọn mẫu (màn hình hiện tại): Nội dung đơn có sai sót／Không kịp hạn chốt đặt hàng／Không thể chuẩn bị thiết bị・tồn kho／Không đáp ứng được do điều kiện khu vực giao hàng・tuyến giao hàng／Không phù hợp điều kiện hợp đồng (thời gian sử dụng tối thiểu, v.v.)／Khác (ghi chi tiết bên dưới) | `lib/ops/applications/constants.ts` (không có danh sách trong file quyết định) |
| Đơn bị từ chối hiển thị "Chúng tôi không thể tiếp nhận" và lý do trong trang cá nhân (danh sách đơn) của Web doanh nghiệp | 28 §6, danh sách email M6 |

### 3-6. Thiết lập trước phê duyệt và kiểm tra phê duyệt

| Quy định | Nguồn |
|---|---|
| Đặt tab "Ảnh hưởng và thiết lập" trong chi tiết đơn, hiển thị theo từng cơ sở **những thứ sẽ hoạt động khi phê duyệt** và **thiết lập cần làm trước khi phê duyệt**. **Cho đến khi hoàn tất các thiết lập bắt buộc thì cơ sở đó không phê duyệt được** | 28-144① |
| Thiết lập trước phê duyệt **chỉ cho các mục bắt buộc phê duyệt** | STEP1 (tối 10/01) |
| **Khi phê duyệt, nếu "giá trị trước thay đổi" của đơn khác với giá trị hiện tại thì dừng phê duyệt và để vận hành xác nhận** ("Giá trị trước thay đổi khác với giá trị hiện tại (giá trị lúc đăng ký → giá trị hiện tại). Hãy kiểm tra giá trị hiện tại rồi phê duyệt") | TL-1, 契約_01 §1 |
| Màn hình phê duyệt hiển thị "Còn ○ ngày đến hạn chốt" | 28-27 |
| Màn hình phê duyệt hiển thị **tháng giao hàng thực sự được phản ánh** (ví dụ: "Vì đã quá hạn chốt đặt hàng nên sẽ được phản ánh từ chu kỳ tháng ◯") | Gốc #22・REQ-CT-258 |
| Màn hình phê duyệt hiển thị "Số tháng đã thanh toán n tháng・tổng chênh lệch・quyết toán trong hóa đơn lần tới" (§4-4) | TL-7 |
| Người phê duyệt: không giữ người cụ thể (như 林MG, v.v.). **Quản trị viên vận hành có quyền thì ai cũng phê duyệt được** | STEP1, `Quyết_định_STEP3_Bổ_sung_Thiếu_sót_Master_Tùy_chọn_Giảm_giá_20261001.md` |
| **Tự phê duyệt (người lập đơn = người phê duyệt) được phép**. Lưu vào lịch sử (vì vận hành ít người) | T5 D12・E-11=B |

### 3-7. Hạn xử lý và cần xác nhận

| Quy định | Nguồn |
|---|---|
| Hạn xử lý = hạn chốt đặt hàng của lần giao hàng đó. **3 ngày trước hạn chốt** hiển thị trong cần xác nhận `change_request_due` của vận hành (số ngày theo thiết lập `change_request_warn_days`・mặc định 3 ngày) | #37 |
| Nếu quá hạn chốt mà chưa xử lý thì để lại trong cần xác nhận cho đến khi vận hành xử lý. **Hệ thống không tự động từ chối** | #37 |
| Badge của menu là số việc cần xử lý (đăng ký mới đang tiếp nhận・đang thiết lập hợp đồng + thay đổi・tạm dừng・hủy hợp đồng đang chờ phê duyệt・phê duyệt một phần). Rê chuột vào thì hiển thị chi tiết (thay thế v2.2 §6 "chỉ đếm những việc chưa xử lý đã đến hạn") | 28-132, trả lời xác nhận v1.73・v1.74 (10/02) |

### 3-8. Nhập hộ của vận hành

| Quy định | Nguồn |
|---|---|
| Tạm dừng・mở lại・hủy hợp đồng・thay đổi gói, v.v. nhận qua điện thoại, **không đổi trạng thái trực tiếp ở màn hình cơ sở・hợp đồng con**. Lập đơn giống Web doanh nghiệp bằng "Nhập hộ đơn đăng ký thay đổi" và phê duyệt ở cùng màn hình phê duyệt (để những thứ hoạt động khi phê duyệt luôn chạy theo cùng thứ tự) | 28 §8 phương án, 28-144⑨ |
| Lưu lại kênh tiếp nhận (điện thoại・email・kinh doanh (thăm trực tiếp)・phán đoán của vận hành・khác) và người nhập, hiển thị dấu "Nhập hộ" trong danh sách | 28-33, màn hình hiện tại |
| Không thể đặt trực tiếp cơ sở sang "Đang tạm dừng" (phải qua đơn nhập hộ) | Danh sách vấn đề 10/02 "4-7" |
| Thông báo cho doanh nghiệp gửi giống đơn trên Web doanh nghiệp (theo từng cơ sở), thêm một câu "Vận hành đã tiếp nhận thay" | 28 §8 phương án |
| Dù gấp như sát hạn chốt cũng không tạo ngoại lệ thay đổi trực tiếp | 28 §8 phương án |

---

## 4. Tháng chu kỳ bắt đầu・hạn chốt・tháng đã thanh toán

### 4-1. Cách quyết định tháng chu kỳ bắt đầu

| Quy định | Nguồn |
|---|---|
| Đăng ký liên quan đến hợp đồng: **nếu trước hạn chốt đặt hàng (mặc định ngày 15 tháng trước) thì từ chu kỳ tháng kế tiếp, nếu quá hạn thì từ tháng sau nữa** | 契約_01 §4 (D4), REQ-CT-257, dòng 159 |
| Tháng chu kỳ bắt đầu lấy giá trị xác định theo ngày đăng ký làm giá trị ban đầu | 28-27 |
| Lắp đặt・thu hồi thiết bị cũng quyết định theo hạn chốt: nếu đăng ký trước hạn chốt thì tính đủ từ tháng chu kỳ đó／đến tháng chu kỳ đó | S1 |
| Thiết lập có phí (Guest mode・ES-QR, v.v.), cả thiết lập và phí đều bắt đầu có hiệu lực theo quy tắc hạn chốt (thiết lập không có phí thì có hiệu lực ngay từ chu kỳ hiện tại trở đi) | 契約_01 §4 (Q6). **Ngoại lệ: Guest mode dùng được ngay khi lưu (chỉ phí theo quy tắc hạn chốt)** 〔hong trả lời 2026-10-03 (K3)〕 |
| Kết thúc tiếp nhận hủy hợp đồng cũng xác định theo hạn chốt đặt hàng. **Không phân biệt tủ lạnh và máy bán hàng tự động** | STEP1 (K-05), T5 E-3=B (D4=A) |

### 4-2. Khi phê duyệt sau hạn chốt

Khi phê duyệt sau hạn chốt, vận hành chọn "dời sang chu kỳ kế tiếp" hoặc "vận hành đặt hàng hộ" (STEP1・T5 E-7'. Không dùng việc tự động dời của 28-27) 〔hong trả lời 2026-10-03 (A1=A)〕

- Dù chọn cách nào, nội dung đã chọn (đã sửa) cũng được ghi vào thông báo cho doanh nghiệp 〔28-27, màn hình hiện tại〕.

### 4-3. Hóa đơn đã phát hành và giao hàng đã có chỉ thị xuất hàng

| Quy định | Nguồn |
|---|---|
| **Không áp dụng thay đổi cho chu kỳ đã phát hành hóa đơn.** Bắt đầu là "chu kỳ đầu tiên chưa phát hành" | 28-5 |
| Đổi nơi nhận hóa đơn: hóa đơn đã phát hành giữ nguyên, từ hóa đơn chưa phát hành thì gửi tới nơi nhận mới | 28-6 |
| **Không hủy dữ liệu giao hàng đã có chỉ thị xuất hàng vì lý do thay đổi hợp đồng.** Khi cần xử lý riêng trước tháng phản ánh (chuyển nhà, v.v.), vận hành sửa bằng "Chỉ lần giao hàng này" ở chi tiết dữ liệu giao hàng, không dời tháng áp dụng của hợp đồng | Gốc #22・REQ-CT-259 |
| Phần đã thành dữ liệu giao hàng・đã có chỉ thị xuất hàng không tự động thay đổi, hiển thị "cần xác nhận" ở lịch vận hành | 28-20 |

### 4-4. Thay đổi liên quan đến tháng đã thanh toán (thanh toán năm・thanh toán trước)

| Quy định | Nguồn |
|---|---|
| **Tại thời điểm phê duyệt, hệ thống tự động tạo "chi tiết điều chỉnh" từ chênh lệch của từng tháng đã thanh toán, ghi từng dòng vào hóa đơn kế tiếp** (ví dụ "Phần chu kỳ tháng 12/2026 Thay đổi gói (100→50) chênh lệch −¥22,000"). Không tính theo ngày・là chênh lệch đủ tháng theo từng tháng chu kỳ | TL-7 (quyết định A), 契約_01 §1-1 |
| Trong thanh toán năm, điều chỉnh phí giữa kỳ vẫn giữ phí hiện tại đến tháng bắt đầu tính tiếp theo (không tạo chênh lệch cho việc điều chỉnh giá) | S3-2 |
| Đổi gói giữa chừng của thanh toán năm thì các tháng còn lại tính bằng chi tiết điều chỉnh | Danh sách vấn đề 10/03 "Thanh toán năm" |

---

## 5. Màn hình Web doanh nghiệp

### 5-1. Danh sách đơn (menu bên "Đơn đăng ký")

| Mục | Quy định | Nguồn |
|---|---|---|
| Tab | Thay đổi ngày giao (giao hàng)／Đơn đăng ký hợp đồng | Web doanh nghiệp §2-2 |
| Cột | Số tiếp nhận・loại đơn・cơ sở đối tượng・ngày đăng ký・người đăng ký・tháng chu kỳ bắt đầu・nội dung đơn・trạng thái phê duyệt (+ lý do từ chối・ngày giờ rút lại) | Web doanh nghiệp §2-2, 契約_04 Lịch sử đơn |
| Thao tác | Xem chi tiết bằng số tiếp nhận. Nếu vận hành đang xác nhận thì rút lại (§3-4). Góc trên bên phải có "Thêm cơ sở" "Đăng ký thay đổi" | Web doanh nghiệp §2-2 |
| Phạm vi xem | Tài khoản doanh nghiệp = toàn bộ công ty mình／**tài khoản cơ sở = chỉ đơn của cơ sở mình** | H4, quyết định v2.3 #55 (`Quyết_định_v2.3_Bổ_sung_Lịch_trang_chủ_doanh_nghiệp_20260929.md`) |
| Không hiển thị | Người phê duyệt・ngày giờ phê duyệt (vì hiển thị tên người phụ trách của vận hành) | 契約_04 #8 |

### 5-2. Đăng ký thay đổi (5 bước)

| Bước | Nội dung | Nguồn |
|---|---|---|
| 1 Thủ tục | "Quý khách muốn làm thủ tục nào? (1 lần đăng ký chỉ 1 loại)". Thủ tục không có cơ sở đối tượng thì không chọn được | Web doanh nghiệp §2-2, 28-22 |
| 2 Cơ sở đối tượng | Chọn được nhiều. Cơ sở đang chờ phê duyệt hiển thị "Đang đăng ký" và làm xám | 28-4 |
| 3 Nội dung mong muốn | Theo từng cơ sở: tháng chu kỳ muốn bắt đầu (bắt buộc・từ tháng chu kỳ sớm nhất chọn được hiện nay trở đi) + các mục theo từng thủ tục (§6) | Đặc tả kiểm tra nhập liệu §4 |
| 4 Xác nhận | Xác nhận nội dung nhập・chọn người đăng ký・đồng ý (hủy hợp đồng: "Tôi đã xác nhận mức quyết toán dự kiến và việc hủy hợp đồng thì không thể hoàn lại") | Web doanh nghiệp §1-2, màn hình hiện tại |
| 5 Hoàn tất | Số tiếp nhận・hướng dẫn email xác nhận tiếp nhận. Cơ sở trở thành "Đang đăng ký", hiển thị trong danh sách đơn・lịch sử đơn của cơ sở | Web doanh nghiệp §2-2 |

- Khi đến từ "Đăng ký thay đổi" ở chi tiết cơ sở thì bắt đầu từ "Nội dung mong muốn" ở trạng thái đã chọn cơ sở và thủ tục đó 〔Web doanh nghiệp §2-2〕.
- Màn hình xác nhận dạng bảng 〔28-23〕. Nếu rời giữa chừng thì xác nhận hủy bỏ 〔Web doanh nghiệp §2-2〕.

### 5-3. "Chỉnh sửa" ở chi tiết cơ sở・thông tin doanh nghiệp (thay đổi thông tin cơ sở・thông tin doanh nghiệp)

| Quy định | Nguồn |
|---|---|
| Ô bắt buộc phê duyệt có dấu "Cần phê duyệt". Khi lưu, hộp thoại xác nhận phân biệt "phản ánh ngay／phản ánh sau phê duyệt" + chọn "người thay đổi" từ người phụ trách (bắt buộc) | Web doanh nghiệp §1・§1-2 |
| Thay đổi ô bắt buộc phê duyệt và lưu thì thành chờ phê duyệt (`CH-`), phản ánh sau phê duyệt. Trong lúc chờ phê duyệt hiển thị hướng dẫn, cũng hiển thị trong danh sách "Đơn đăng ký" (rút lại được) | Web doanh nghiệp §1・§2-3 |
| Với các mục của hợp đồng con, khi lưu chọn "Chỉ chu kỳ này／Từ đây trở đi tất cả". Chỉ thay đổi được các chu kỳ còn trước hạn chốt | Web doanh nghiệp §1・§2 |

---

## 6. Quy định theo từng loại

"Những thứ hoạt động khi phê duyệt" của mỗi đơn xem bảng §8, email xem §10.

### 6-1. Thay đổi gói

| Mục | Quy định | Nguồn |
|---|---|---|
| Nhập | Gói sau thay đổi (không chọn được gói giống hiện tại)・course | Đặc tả kiểm tra nhập liệu §4 |
| Phí | Từ tháng chu kỳ bắt đầu, tính đủ phí gói mới (không tính theo ngày) | Màn hình hiện tại (P1・S1), 28-5 |
| Hợp đồng con・số lượng giao・đơn hàng mặc định | **Tính lại** hợp đồng con・số lượng giao mỗi lần (giới hạn cung cấp hằng tháng ÷ số lần giao hàng・theo từng nhóm nhiệt độ)・đơn hàng mặc định (số đặt hàng tiêu chuẩn × hệ số của gói) | Danh sách vấn đề 10/02 "3-5", 28-153・154・179 |
| Đơn hàng | Nếu phê duyệt trong thời gian đặt hàng, **tự động đưa đơn hàng đã đăng ký (hoặc mặc định) của chu kỳ đó về đơn hàng mặc định theo điều kiện mới và thông báo cho doanh nghiệp** để họ nhập lại đến hạn chốt (nếu không nhập lại thì chốt nguyên như vậy). Việc đã tự động sửa được ghi vào "Phạm vi ảnh hưởng" của màn hình phê duyệt và thông báo | STEP5 QA, Danh sách vấn đề 10/02 "3-5 (a)" |
| Thiết bị | Khi phê duyệt, so sánh thiết bị hiện tại với **thiết bị cho thuê tiêu chuẩn của gói mới** để tạo phương án "dịch chuyển thiết bị" (tăng kích thước・thêm・thu hồi thiết bị dư), **đồng thời đề xuất chi phí phát sinh** (phí giao hàng thay thế 28-16, phí hằng tháng của dòng máy vượt tiêu chuẩn, tiền thuê tủ đông). Vận hành sửa được trước khi phê duyệt | Danh sách vấn đề 10/02 "3-6" |
| Thời gian sử dụng tối thiểu | Kế thừa | Phạm vi ảnh hưởng B-1 |
| Lite→Standard (khách hàng hiện có) | Tiếp nhận theo luồng thay đổi gói. **Giảm giá chênh lệch nâng cấp Standard (DC000021. DC000003 được gộp và kết thúc) không tự động gắn dù phê duyệt** (vận hành gắn thủ công). Khách hàng hiện có tính tiền thuê tủ đông bằng master dòng máy, Standard mới thì tủ đông miễn phí | 28-170〜175, sổ cái "DC000003" "Cho thuê tủ đông của khách cũ", Danh sách vấn đề 10/02 |
| Lite (tủ lạnh)→Lite (máy bán hàng tự động) | Xử lý như thay đổi gói (thay đổi course), đồng thời đăng ký dịch chuyển thiết bị | T5 E-10=A. Màn hình phê duyệt đặt bắt buộc "Kết quả khảo sát hiện trường" (ngày khảo sát・khả thi hay không・đính kèm), chưa nhập thì không phê duyệt được. Tháng chu kỳ bắt đầu do vận hành chọn khi phê duyệt 〔hong trả lời 2026-10-03 (B7)〕 |
| Thông báo cho đại lý・chênh lệch thay đổi gói của giới thiệu | Sang Phase2 | T5 E-12=B |

### 6-2. Thay đổi giao hàng

| Mục | Quy định | Nguồn |
|---|---|---|
| Nhập | Phương thức giao hàng (**cơ sở có máy bán hàng tự động cố định là chuyến giao ES・không chọn được**)・số lần giao hàng. Nếu toàn là "không thay đổi" thì không gửi được ("Hãy chọn ít nhất 1 mục thay đổi.") | 28-19, Đặc tả kiểm tra nhập liệu §4 |
| Lựa chọn số lần giao hàng | **Giảm thấp hơn tiêu chuẩn được** (phí không giảm. Phán định dung lượng giống khi đăng ký): giảm xuống 1 lần／2 lần (tiêu chuẩn của gói)／tăng lên 3 lần (+¥3,000／tháng)／tăng lên 4 lần (+¥6,000／tháng) 〔Master đăng ký #2・sổ cái〕 | — |
| Phí | Thay đổi số lượng thêm số lần giao hàng (OP000001) từ tháng chu kỳ bắt đầu | 28-85 |
| Tuyến giao hàng | Tiếp nhận cùng lúc với phê duyệt, tổ chức lại bằng batch ban đêm. Phần đã thành dữ liệu giao hàng・đã có chỉ thị xuất hàng không tự động thay đổi mà đưa vào cần xác nhận. Không hạn chế thay đổi lead time giữa chừng nhưng cảnh báo trên màn hình về chồng chéo・thiếu hụt và bắt xác nhận | 28-20, S2 |
| Yêu cầu báo giá cho công ty giao hàng ủy thác | Thay đổi chuyến giao ES **liên kết** với yêu cầu báo giá. **Không bắt buộc** (yêu cầu tùy chọn từ chi tiết đơn. Không có báo giá vẫn phê duyệt được). Nơi yêu cầu do vận hành chọn từ các công ty đã lọc theo khu vực・thứ trong tuần hỗ trợ của master điểm giao hàng ủy thác | T5 E-5=A, `Quyết_định_STEP4_Trả_lời_Giao_hàng_20261001.md` A1 |
| Thứ giao hàng | Khách hàng không chọn chu kỳ giao hàng・mẫu giao hàng (vận hành thiết lập) | 28-78 |
| Đơn hàng | Giống thay đổi gói (STEP5 QA) | STEP5 QA |

### 6-3. Thay đổi thiết bị

| Mục | Quy định | Nguồn |
|---|---|---|
| Nhập | Nội dung mong muốn (thêm／thu hồi／đổi dòng máy (tăng kích thước))・thiết bị đối tượng (đang dùng・mã dòng máy + tên dòng máy)・số lượng (từ 1 đến số lượng hiện có)・ngày mong muốn・đại diện lắp đặt (OP000007・một lần) | Đặc tả kiểm tra nhập liệu §4, H5, dòng 156 |
| Có cho chọn dòng máy không | **Cho chọn** (chỉ dòng máy công khai). Kèm câu "Tùy tồn kho, chúng tôi có thể đề xuất kích thước gần nhất" | 28-18 |
| Chi phí thay thế | **Báo giá từng lần** (Web doanh nghiệp chỉ nhập nguyện vọng. Vận hành nhập số tiền). Mức tham khảo (1 máy ¥4,800／từ 2 máy ¥7,800／không có thang máy từ tầng 3 trở lên +¥3,000) làm giá trị ban đầu của màn hình phê duyệt. Đưa vào dịch chuyển của hợp đồng con bằng phí giao hàng thiết bị trong master tùy chọn (OP000019／020・một lần) | v2.3 #7, 28-16, 28-53 |
| Tăng kích thước | **Quản trị viên vận hành có quyền thì ai cũng phê duyệt・sắp xếp được**. Chênh lệch được thanh toán hằng tháng bằng tùy chọn (OP000023 Chênh lệch kích thước (hằng tháng)). Phần âm của giảm kích thước không thanh toán cũng không hoàn tiền | STEP1, dòng 31 |
| Thời gian sử dụng tối thiểu | Đổi dòng máy (tăng kích thước) **kế thừa phần còn lại của máy cũ**. Thiết bị thêm tính từ ngày lắp đặt | T5 E-4=A. ※ `質問まとめ` K5 ghi "chưa có câu trả lời" nhưng đã trả lời bằng E-4=A |
| Khi phê duyệt | **Cập nhật danh sách cho thuê** (cùng cơ chế với phương án dịch chuyển thiết bị + đề xuất chi phí) | Danh sách vấn đề 10/03 "Đơn thay đổi thiết bị → cập nhật cho thuê" |
| Đổi địa chỉ và thiết bị | Không di dời cũng không thu hồi (khách hàng tự chịu trách nhiệm di chuyển. Nếu vận hành vận chuyển thì là tùy chọn có phí・báo giá từng lần) | v2.3 #3 |
| Ràng buộc thiết bị vượt quá hết hạn hợp đồng | Không động đến hợp đồng cha, hiển thị "Thiết bị này có thời gian sử dụng tối thiểu đến ○/○" ở màn hình đăng ký và màn hình phê duyệt | v2.3 #4・⑨ |

### 6-4. Thay đổi thông tin cơ sở

| Mục | Quy định | Nguồn |
|---|---|---|
| Mục trở thành đơn | Các mục bắt buộc phê duyệt của §2-2 (tên cơ sở・furigana・địa chỉ・điện thoại・nơi nhận hóa đơn・ngày trong tuần không nhận hàng・ngày mong muốn cho thiết bị) | Web doanh nghiệp §1 |
| Thiết lập trước phê duyệt khi đổi địa chỉ | Kho picking・công ty vận chuyển・công ty giao hàng・lead time・**ngày giao hàng đầu tiên đến địa chỉ mới**・xác nhận lộ trình vận chuyển vào. Vận hành chọn ngày chuẩn bằng "Cập nhật từ ngày này trở đi" | 28-144①, Phạm vi ảnh hưởng B-4 (tích hợp §8-8) |
| Đổi địa chỉ và phiếu vận chuyển | Hiển thị trên màn hình việc phát hành lại phiếu vận chuyển (voided)・trạng thái phiếu giao hàng | T5 D9=A |
| Đổi nơi nhận hóa đơn | Hóa đơn đã phát hành giữ nguyên, từ phần chưa phát hành thì gửi tới nơi nhận mới. Thay đổi ID nơi phát hành của Bill One (hiển thị trạng thái trên màn hình) | 28-6, T5 D9=A |
| Ngày trong tuần không nhận hàng | Từ chu kỳ bắt đầu. Phần đã thành dữ liệu giao hàng thì sửa ở lịch vận hành | Màn hình hiện tại (X-1) |
| Ngoài địa chỉ | Không có thiết lập bắt buộc trước phê duyệt | Phạm vi ảnh hưởng B-4 |

### 6-5. Thay đổi thông tin doanh nghiệp

| Mục | Quy định | Nguồn |
|---|---|---|
| Người gửi được | Chỉ tài khoản doanh nghiệp | Web doanh nghiệp §2-3 |
| Mục trở thành đơn | Địa chỉ・số điện thoại・số FAX ghi trên hóa đơn (§2-1) | Web doanh nghiệp §2-3 |
| Đơn vị phê duyệt | Phê duyệt・từ chối như 1 doanh nghiệp (phê duyệt thì phản ánh cho toàn doanh nghiệp) | Màn hình hiện tại |
| Thiết lập trước phê duyệt | Không có. Nơi nhận hóa đơn dùng nội dung mới từ hóa đơn chưa phát hành (sắp xếp việc sửa nơi phát hành của Bill One) | Phạm vi ảnh hưởng B-5, màn hình hiện tại |
| Hiển thị chờ phê duyệt | Hướng dẫn ở thông tin doanh nghiệp, hiển thị trong danh sách "Đơn đăng ký" với đối tượng = "(Tên doanh nghiệp) (doanh nghiệp)" (rút lại được) | Web doanh nghiệp §2-3 |

### 6-6. Tạm dừng

| Mục | Quy định | Nguồn |
|---|---|---|
| Nhập | Lý do tạm dừng (chọn・bắt buộc) + văn bản tự do (tùy chọn)・thiết bị trong thời gian tạm dừng (**thu hồi (mặc định)／để nguyên tại chỗ**)・thời gian muốn tạm dừng (tháng chu kỳ bắt đầu・**tháng dự kiến mở lại là bắt buộc, không chọn được "Chưa định"**) | v2.3 #8, 28-1, STEP1 (tối 10/01) |
| Lý do tạm dừng | **Giữ 6 lựa chọn**・văn bản tự do là tùy chọn. ⚠️ Câu chữ của 6 lựa chọn đang xác nhận với kinh doanh (màn hình hiện tại có 5) (§13 B8) | v2.3 #8 |
| Ghi nhận | Chỉ ghi lý do đã chọn (không lưu đề xuất đã xem). Màn hình phê duyệt chỉ có lý do và văn bản tự do | v2.3 #8-2・⑧ |
| Giới hạn trên | **Tổng cộng 1 năm**. Màn hình đăng ký hiển thị **tổng tích lũy và số tháng còn lại**, không đăng ký được thời gian vượt quá | 28-10, STEP1 (tối 10/01), PAUSE_MAX=12 |
| Khi có thể vượt 1 năm | Hướng dẫn hủy hợp đồng, thu hồi thiết bị tại đó | 28-1c |
| Để nguyên tại chỗ | Vận hành phê duyệt. Không thu phí bảo quản. Không đặt ngày dự kiến trả | 28-1・1a |
| Thu hồi | Đặt ngày dự kiến trả (ngày dừng + 1 tháng). Thu hồi trong khoảng 1 tháng sau ngày bắt đầu tạm dừng | 契約_04 #9, màn hình hiện tại |
| Thời gian sử dụng tối thiểu | Thiết bị để nguyên tại chỗ dừng đếm trong thời gian tạm dừng, phần còn lại trước tạm dừng được kế thừa khi mở lại. **Thiết bị đã thu hồi do vận hành chọn khi phê duyệt mở lại**: ① tính lại từ ngày lắp đặt lại (mặc định)／② kế thừa phần còn lại và thanh toán 1 lần phí lắp đặt lại (OP000015) 〔hong trả lời 2026-10-03 (K4 xác nhận lại)・chờ khách hàng xác nhận〕 | 28-1b, 契約_01 §5 (Q8・phụ lục 5). Khi thu hồi không thu phí vi phạm 〔hong trả lời 2026-10-03 (K4=A)〕 |
| Hợp đồng con | Không tạo hợp đồng con cho chu kỳ đang tạm dừng. Hợp đồng con tạo trước đó **được giữ là "Hủy" và không hiển thị trong danh sách** (chỉ hiển thị dòng dải thời gian tạm dừng) | 28-12, TL-2 |
| Quyết toán thực tế | **Trong thời gian tạm dừng không quyết toán thực tế. Kiểm tra tồn kho lúc bắt đầu tạm dừng và quyết toán phần đến đó.** Việc kiểm tra lúc bắt đầu tạm dừng do khách hàng thực hiện trên Web doanh nghiệp (cả chuyến giao ES・kỳ của lần giao hàng cuối cùng trước tạm dừng: sổ cái E 2026-10-05). Phần chênh lệch do bán hàng ở thiết bị để nguyên tại chỗ được tính khi kiểm tra tồn kho lúc mở lại (nếu không mở lại mà hủy hợp đồng thì lúc hủy) | TL-2, 契約_01 §5 (ghi đè P5). ⚠️ Chưa có trả lời ai thực hiện kiểm tra tồn kho lúc bắt đầu tạm dừng (契約_01 §10) |
| Giao hàng・đơn hàng | Hủy dự kiến giao hàng・dữ liệu giao hàng・đơn hàng của chu kỳ tạm dừng. **Chu kỳ đã quá hạn chốt đặt hàng thì vẫn giao** | Danh sách vấn đề 10/02 "3-4", STEP5 QA |
| Hiển thị cơ sở | **Hiển thị** "Đang tạm dừng" từ chu kỳ bắt đầu tạm dừng (không giữ trong trạng thái cơ sở, hiển thị từ "Tạm ngừng sử dụng" của hợp đồng cha và lịch sử tạm dừng) | 契約_04 #6 (thay thế 28-65) |
| Đăng nhập | Khi tạm dừng cũng **đăng nhập được**. Nếu tất cả cơ sở đều tạm dừng thì chỉ để xem. Làm được chỉ là **đăng ký mở lại・đăng ký hủy hợp đồng・liên hệ・thay đổi người phụ trách**. Nếu có dù chỉ 1 cơ sở đang sử dụng thì như bình thường | 28-3, DR-3 |
| Ứng dụng cá nhân | Nếu để nguyên thiết bị tại chỗ thì khi tạm dừng vẫn **mua được**. Nếu đã thu hồi thì không mua được | 契約_01 §6-4 (A1) |
| Nhắc nhở kiểm tra tồn kho | Không gửi cho cơ sở đang tạm dừng (kiểm tra khi tạm dừng là tùy chọn) | STEP5 (email X12) |

### 6-7. Mở lại

| Mục | Quy định | Nguồn |
|---|---|---|
| Nhập | Tháng chu kỳ mở lại・gói sau khi mở lại. **Không cần nhập thêm đặc biệt** (mức chỉnh sửa thông tin) | Đặc tả kiểm tra nhập liệu §4, Gốc #25 (độ chắc chắn: trung bình) |
| Khi có thay đổi | **Có thể sửa trong đơn mở lại** (nơi giao hàng・người phụ trách・gói). Ngoại lệ của "1 đơn 1 loại" | 28-13 |
| Thời gian sử dụng tối thiểu | **Kế thừa phần còn lại trước tạm dừng** (không tính lại). Chỉ thiết bị đã thu hồi và đặt lại thì tính từ ngày lắp đặt | 28-11 |
| Thiết lập trước phê duyệt | Tuyến giao hàng・ngày giao hàng đầu tiên・ngày lắp đặt lại thiết bị (thiết bị đặt lại thì khoảng 1 tuần trước ngày bắt đầu giao hàng) | 28-144①, màn hình hiện tại |
| Phí | Tính đủ từ tháng chu kỳ mở lại. Phần bán được ở thiết bị để nguyên tại chỗ trong thời gian tạm dừng được quyết toán bằng kiểm tra tồn kho lúc mở lại | Màn hình hiện tại (TL-9) |
| Hợp đồng con・giao hàng | Tạo lại hợp đồng con・dự kiến giao hàng từ chu kỳ mở lại. Hiển thị cơ sở quay lại từ chu kỳ mở lại | 28-65, Phạm vi ảnh hưởng B-7 |

### 6-8. Hủy hợp đồng

| Mục | Quy định | Nguồn |
|---|---|---|
| Ngày hủy | **Chọn từ ngày cuối chu kỳ trở đi sau mức sớm nhất** (không dùng ngày tự do) | T2=A |
| Hạn chốt tiếp nhận | Kết thúc tiếp nhận của đơn đăng ký bao gồm hủy hợp đồng xác định theo hạn chốt đặt hàng (mặc định ngày 15 tháng trước). Không phân biệt tủ lạnh và máy bán hàng tự động | STEP1 (K-05), T5 E-3=B |
| Lý do và giữ chân | **Cho chọn lý do (giá cao／lãng phí nhiều／khó dùng, v.v.), hiển thị phương án thay thế tương ứng với lý do (đổi gói・mong muốn tư vấn, v.v.) rồi mới cho gửi**. Kịch bản giữ chân theo từng lý do sẽ đưa vào sau khi nhận được bản gốc của anh Aoyama | Gốc #23・REQ-CT-142・191・192, dòng 26 |
| Mức quyết toán dự kiến | Màn hình đăng ký hiển thị mức phí vi phạm dự kiến theo từng thiết bị (mã dòng máy + tên dòng máy), và ô kiểm "Tôi đã xác nhận mức quyết toán dự kiến và việc hủy hợp đồng thì không thể hoàn lại" (kể cả 0 yên cũng xác nhận) | H5, màn hình hiện tại |
| Phí vi phạm | Cộng dồn theo từng thiết bị **số tiền thu hồi khi hủy hợp đồng × số tháng còn lại ÷ thời gian sử dụng tối thiểu (tủ lạnh 3・máy bán hàng tự động 12)**. Ghi ở ① của hợp đồng con cuối cùng của hợp đồng hủy bằng dòng phí một lần | Sổ cái "Phí vi phạm", 28-2, 28-66 |
| Hủy khi đang tạm dừng | Gửi được (phí vi phạm tính theo việc dừng đếm khi tạm dừng) | 28-21 |
| Chốt | **Chốt bằng phê duyệt của vận hành** | Gốc #24・REQ-CT-289 |
| Trạng thái hợp đồng・cơ sở | Phê duyệt thì hợp đồng cha "Đang làm thủ tục hủy"・cơ sở "Dự kiến đóng", vào ngày hủy hợp đồng cha "Kết thúc"・cơ sở "Đóng" | 28-62, 28-65, 契約_04 |
| Giao hàng | Chu kỳ đã chốt thì giao đến cuối cùng. Xóa dự kiến giao hàng sau ngày hủy | `Quyết_định_STEP4_Trả_lời_Giao_hàng_20261001.md` (tích hợp 8-7) |
| Thông báo cho công ty giao hàng ủy thác | **Khi phê duyệt, tự động thông báo bằng hiển thị trên Web công ty giao hàng ủy thác và email cho công ty giao hàng đã đăng ký ở tuyến giao hàng (hợp đồng con) của cơ sở đó** (hiển thị ví dụ nội dung trên màn hình). **Cơ sở chỉ có chuyến tự giao thì không thông báo cho bên ủy thác, mà thông báo bằng màn hình cho nhân viên giao hàng nội bộ** | Gốc #24, STEP1 (tối 10/01), T3-1・T3-2 |
| Thu hồi thiết bị | **Không tạo giao hàng thu hồi.** Khi phê duyệt, đặt "Dự kiến thu hồi" trong danh sách cho thuê, khi vận hành đã thu hồi thì bấm "Đã thu hồi". Ngày dự kiến trả là ngày dừng + 1 tháng | Danh sách vấn đề 10/02 "3-4", 契約_04 #9 |
| Thanh toán cuối cùng | **Tháng sau khi hủy hợp đồng, 1 hóa đơn cuối cùng riêng** (quyết toán thực tế lần cuối + phí vi phạm + mua lại tồn kho còn lại) | Sổ cái "Hóa đơn cuối cùng", S4-1 |
| Tồn kho còn lại | Thanh toán như mua lại bằng tồn kho tính toán × đơn giá bán | S4-2 |
| Tài khoản Web doanh nghiệp | Đến hạn thanh toán của hóa đơn cuối cùng thì "Chỉ xem", ngày hôm sau thì dừng (email thông báo dừng No.16). Trong thời gian chỉ xem, **chỉ người phụ trách thanh toán** vẫn thay đổi được | S4-3, `Quyết_định_Bổ_sung_email_và_thông_báo_20261001.md`, 契約_01 §10 (Q15) |
| Ứng dụng cá nhân | Mua được **đến ngày hủy hợp đồng**. Từ ngày hôm sau không chọn được cơ sở đó (xem được lịch sử mua) | 契約_01 §6-4 (A2=A) |
| Đơn hàng | Nếu đơn hàng của chu kỳ sẽ không được giao đang trong thời gian đặt hàng thì tự động hủy khi phê duyệt | STEP5 QA |

---

## 7. Màn hình của vận hành (quản lý đơn đăng ký hợp đồng)

### 7-1. Danh sách

Giống `Form_đăng_ký.md` §10-1 (menu・badge・tab・thành phần・quyền xem). Trạng thái của các tab thay đổi hợp đồng・tạm dừng・hủy hợp đồng theo §3-2.

### 7-2. Chi tiết đơn (thay đổi・tạm dừng・hủy hợp đồng・mở lại)

| Mục | Quy định | Nguồn |
|---|---|---|
| Tiêu đề | "Chi tiết đơn" + số đơn (chữ monospace). Trạng thái là Badge ở tiêu đề (không dùng stepper). Breadcrumb: Quản lý đơn đăng ký hợp đồng／Chi tiết đơn | 28-112, 28-132 |
| Tab | **Nội dung đơn／Các mục thay đổi／Ảnh hưởng và thiết lập (những thứ hoạt động khi phê duyệt・thiết lập cần làm trước khi phê duyệt)／Phê duyệt theo từng cơ sở (số cơ sở chờ phê duyệt)**. "Đến phê duyệt theo từng cơ sở" ở header chuyển tới tab đó. Mở lại thì về tab đầu tiên | 28-115, 28-144① |
| Chiều rộng | Toàn chiều rộng như tiếp nhận (mới) | 28-144① |
| Nút | Bên phải page header. Phê duyệt・từ chối ở cột thao tác của bảng cơ sở ("Phê duyệt cơ sở này"／thông tin doanh nghiệp là "Phê duyệt thay đổi của doanh nghiệp") | 28-111, màn hình hiện tại |
| Bảng cơ sở | Cơ sở (tên・ID)・nội dung thay đổi・ảnh hưởng đến phí hằng tháng (chưa thuế・căn phải)・trạng thái・thao tác | Màn hình hiện tại |
| Hộp thoại phê duyệt | Nếu sau hạn chốt thì cách xử lý tháng bắt đầu (vận hành chọn 1 trong 2・§4-2)・xác nhận người nhận và nội dung thông báo sẽ gửi | Màn hình hiện tại |
| Hộp thoại từ chối (Modal) | Lý do từ chối (chọn・bắt buộc) + một lời gửi khách hàng (tùy chọn) | 28-25, màn hình hiện tại |
| Rời khi đang chỉnh sửa | Xác nhận hủy bỏ (tiếp tục chỉnh sửa／hủy bỏ rồi chuyển) | 28-116, 28-133 |
| Người dùng chỉ xem | Ẩn các nút phê duyệt・từ chối, v.v. | 28-110 |
| Chú thích tăng kích thước tủ lạnh | "Quản trị viên vận hành có quyền thì ai cũng phê duyệt・sắp xếp được. ① Đăng ký dịch chuyển thiết bị (đổi dòng máy) ở Ảnh hưởng và thiết lập → ② Phê duyệt cơ sở này → ③ Thanh toán chênh lệch kích thước hằng tháng bằng OP000023" | STEP1, màn hình hiện tại |

---

## 8. Phạm vi ảnh hưởng và kiểm soát (B-0〜B-11)

Kết quả áp dụng các quyết định sau đó vào B-0〜B-11 của `変更申請_影響範囲と制御一覧_20261001.md`. ◎ = tác động trực tiếp, ○ = gián tiếp, － = không.

### 8-1. Đơn × nơi bị ảnh hưởng

| Đơn | Hợp đồng・hợp đồng con | Thiết bị・cho thuê | Thời gian sử dụng tối thiểu・phí vi phạm | Thanh toán | Giao hàng | Công ty giao hàng ủy thác | Đơn hàng | Tài khoản・đăng nhập | Ứng dụng cá nhân | Trạng thái |
|---|---|---|---|---|---|---|---|---|---|---|
| B-0 Đăng ký mới | ◎ Đăng ký tạm・đăng ký chính thức | ◎ Cho thuê mới | ◎ Bắt đầu tính | ◎ Lần đầu (có gộp 2 tháng) | ◎ Tạo khi đăng ký chính thức | ○ Chuyến giao ES | ◎ Tạo khi đăng ký tạm | ◎ Cấp khi đăng ký tạm | ○ | ◎ |
| B-1 Thay đổi gói | ◎ Tạo lại hợp đồng con | ○ Chênh lệch thiết bị cho thuê tiêu chuẩn | ○ Kế thừa | ◎ Chênh lệch hằng tháng・chi tiết điều chỉnh | ○ Số lượng giao | － | ◎ Đưa về mặc định | － | － | － |
| B-2 Thay đổi giao hàng | ○ | － | － | ○ Thêm số lần giao hàng | ◎ Tổ chức lại | ○ Yêu cầu báo giá (tùy chọn) | ◎ Đưa về mặc định | － | － | － |
| B-3 Thay đổi thiết bị | ◎ Dịch chuyển thiết bị | ◎ Cập nhật danh sách cho thuê | ◎ Đổi dòng máy kế thừa・thêm thì từ ngày lắp đặt | ◎ Phí hằng tháng・phí giao hàng thiết bị・chênh lệch kích thước | ○ Vận chuyển vào | － | － | － | － | － |
| B-4 Thay đổi thông tin cơ sở | ○ | － | － | ○ Nơi nhận hóa đơn・Bill One | ◎ Địa chỉ・ngày trong tuần không nhận hàng | ◎ Nếu là địa chỉ thì xác nhận lại | － | ○ | ○ Guest mode (phản ánh ngay) | － |
| B-5 Thay đổi thông tin doanh nghiệp | ○ | － | － | ◎ Nơi nhận hóa đơn | － | － | － | － | － | － |
| B-6 Tạm dừng | ◎ Hủy hợp đồng con tạo trước | ◎ Thu hồi／để nguyên tại chỗ | ○ Chỉ dừng với thiết bị để nguyên | ◎ Không thanh toán・quyết toán lúc đầu | ◎ Hủy | ○ | ◎ Hủy | ◎ Chỉ xem (tất cả cơ sở tạm dừng) | ◎ Để nguyên tại chỗ thì mua được | ◎ Hiển thị đang tạm dừng |
| B-7 Mở lại | ◎ Từ chu kỳ mở lại | ◎ Lắp đặt lại | ○ Kế thừa | ◎ Đủ tháng・quyết toán bằng kiểm tra tồn kho | ◎ Tạo lại | ○ | ◎ | ◎ | ◎ | ◎ |
| B-8 Hủy hợp đồng | ◎ Đang làm thủ tục hủy→Kết thúc | ◎ Dự kiến thu hồi→Đã thu hồi | ◎ Phí vi phạm | ◎ Hóa đơn cuối cùng (tháng sau・riêng 1 hóa đơn) | ◎ Giao đến chu kỳ đã chốt | ◎ Tự động thông báo | ◎ Hủy | ◎ Chỉ xem→Dừng | ◎ Đến ngày hủy hợp đồng | ◎ Dự kiến đóng→Đóng |
| B-9 Thay đổi ngày giao hàng | ○ | － | － | － | ◎ #63 | ○ | ○ | ○ Thông báo | － | － |
| B-10 Dịch chuyển tùy chọn・giảm giá (vận hành) | ◎ Hợp đồng con | － | － | ◎ Hóa đơn đã phát hành thì chi tiết điều chỉnh | － | － | － | － | － | － |
| B-11 Dùng thử→Triển khai chính thức | ◎ Cùng hợp đồng cha・đổi loại hợp đồng | ◎ Nếu nhiều hơn tiêu chuẩn thì chênh lệch | ◎ Từ ngày bắt đầu triển khai chính thức | ◎ | ◎ Kế thừa | ○ | ◎ Đơn hàng hằng tháng thông thường | ○ | － | ◎ |

### 8-2. Cách xử lý hiện nay với những mục "Chưa quyết" "×" trong danh sách trước

| Danh sách trước | Cách xử lý hiện nay | Nguồn |
|---|---|---|
| B-1 Chênh lệch giữa STEP1 (2 lựa chọn) và 28-27 (tự động) | Vận hành chọn 1 trong 2 (dời sang kỳ sau／đặt hàng hộ) 〔hong trả lời 2026-10-03 (A1)〕 | — |
| B-1 Phản ánh vào số lượng cần thiết của đơn hàng hằng tháng sau thay đổi・đặt hàng tạm | Đơn hàng đưa về mặc định (STEP5 QA). Phản ánh vào tổng số gói của đặt hàng tạm (REQ-PO-115) sang Phase2 | STEP5 QA, T5 E-12=B |
| B-1・E-10 Lite tủ lạnh→Lite máy bán hàng tự động | Thay đổi gói + dịch chuyển thiết bị (§6-1). Luồng tiếp nhận xem §6-1 (bắt buộc kết quả khảo sát hiện trường) 〔hong trả lời 2026-10-03 (B7)〕 | T5 E-10=A |
| B-2・E-5 Có liên kết với yêu cầu báo giá không | Liên kết・không bắt buộc | T5 E-5=A, STEP4 A1 |
| B-2 Lối vào kép của ngày trong tuần không nhận hàng | Lối vào là 1 chỗ "Thay đổi thông tin cơ sở" | STEP1 (tối 10/01) |
| B-3・E-4 Thời gian sử dụng tối thiểu của tăng kích thước | Kế thừa từ máy cũ | T5 E-4=A |
| B-4・E-2・D5 Phê duyệt Guest mode | Không cần phê duyệt・phản ánh ngay + thông báo cho vận hành (thay thế D5 "bắt buộc phê duyệt") | Dòng 157 (10/02) |
| B-4 ES-QR còn lại trong đơn của Web doanh nghiệp | Chỉ vận hành. Loại khỏi đơn của Web doanh nghiệp | Dòng 157 (09/30) |
| B-5・E-1 Phân loại phê duyệt thông tin doanh nghiệp | Theo từng mục (§2-1) | STEP1, STEP2 Q3, sổ cái |
| B-6・E-8 "Chưa định" và tích lũy của tạm dừng | Bắt buộc tháng dự kiến mở lại・hiển thị tích lũy và số tháng còn lại・vượt quá thì không đăng ký được | STEP1 (tối 10/01) |
| B-6 Xử lý dừng giao hàng・dừng thanh toán・đã có chỉ thị xuất hàng | Chu kỳ đã chốt thì vẫn giao・khi tạm dừng không thanh toán | Danh sách vấn đề 10/02 "3-4", TL-2 |
| B-8・E-3 Hạn tiếp nhận hủy hợp đồng | Hạn chốt đặt hàng・không phân biệt tủ lạnh và máy bán hàng tự động | T5 E-3=B |
| B-8 Quyết toán thực tế cuối cùng・mua lại tồn kho còn lại・dừng tài khoản・thông báo cho bên ủy thác | §6-8 | S4-1〜3, T3 |
| B-8 Thông báo cho đại lý | Phase2 | T5 E-12=B |
| B-8 "Làm lại" sau phê duyệt | Không làm (đã phê duyệt chỉ để xem) | Danh sách vấn đề 10/02 "4-8". Không đặt "Làm lại" 〔sổ cái〕 |
| B-9 Nội dung thông báo "Ngày giao hàng đã thay đổi"・chế độ đăng ký ngày mong muốn・yêu cầu báo giá | Làm sau khi RS-09 được quyết định | T5 D11=A |
| B-10 Số hóa đơn・cách gọi ③ điều chỉnh | Cách gọi ③ điều chỉnh thống nhất theo đặc tả tổng hợp | T5 E-13=A |
| B-11 Chuyển đổi là xử lý như mới (số mới) | Cùng hợp đồng cha・không gắn số mới | Sổ cái |
| C Tự phê duyệt | Được (lưu vào lịch sử) | T5 D12・E-11=B |
| C Ngày phát hành hóa đơn | Chốt ngày 25 → phát hành bằng Bill One vào ngày 1 tháng sau | Sổ cái |
| D10・D14 Liên động với đơn hàng hằng tháng・đặt hàng tạm・đại lý・tồn kho・vật tư | Đưa vào khối chung ("Phạm vi bị ảnh hưởng bởi đơn này"). Liên động tồn kho・vật tư sau khi xác nhận đặc tả | T5 D10=A・D14=A |
| D13 Thế hệ giá・phí ban đầu của máy bán hàng tự động vào thẻ phê duyệt | Thêm | T5 D13=A |

---

## 9. Quyền hạn

| Quy định | Nguồn |
|---|---|
| Tài khoản doanh nghiệp = gửi・xem được đơn của tất cả cơ sở công ty mình. Tài khoản cơ sở = chỉ cơ sở đó (gửi được cả tạm dừng・hủy hợp đồng) | Quyết định v2.3 #55 (phụ lục lịch trang chủ doanh nghiệp), Web doanh nghiệp §4-1, H4 |
| Thay đổi thông tin doanh nghiệp chỉ tài khoản doanh nghiệp | Web doanh nghiệp §2-3 |
| Quyền của vận hành theo từng vai trò ở "Quản lý tài khoản ＞ Quyền" (7 vai trò × chức năng). Có phê duyệt・từ chối・nhập hộ ở quản lý đơn đăng ký hợp đồng hay không do vai trò quyết định | Danh sách vấn đề 10/03 "Quyền của vận hành", `01_仕様/Bảng_phân_quyền_Web_vận_hành_20261003.md` |
| Đăng nhập khi tạm dừng・sau khi hủy hợp đồng xem §6-6・§6-8 | 28-3, S4-3, DR-3 |

---

## 10. Email・thông báo

Điều kiện gửi và người nhận. Nội dung thư theo Excel là đúng (`【ES STATION】システム内メッセージ管理-Message List_フェーズ2追加_20261001.xlsx`). Người gửi・phần đầu tiêu đề ([ES Station])・lời mở đầu・chữ ký giống Giai đoạn 1. Không đính kèm.

| No | Email | Khi nào | Người nhận | Nguồn |
|---|---|---|---|---|
| M4 | Hoàn tất tiếp nhận đăng ký thay đổi (`CH-`) | Khi gửi đơn trên Web doanh nghiệp・khi vận hành nhập hộ | Người đã đăng ký (email của người đăng ký đã chọn). Khi nhập hộ là người phụ trách chính của cơ sở đó 〔hong trả lời 2026-10-03 (B10-1)〕 | Danh sách email M4, Web doanh nghiệp §1-2 |
| M5 | Phê duyệt (phản ánh vào hợp đồng) | Khi phê duyệt theo từng cơ sở | Đơn của cơ sở: cơ sở đó (người phụ trách chính・người đã đăng ký). Thay đổi thông tin doanh nghiệp: 1 email cho doanh nghiệp (người phụ trách chính của doanh nghiệp) | v2.3 ⑥, danh sách email M5 |
| M6 | Từ chối | Khi từ chối theo từng cơ sở | Như M5. Kèm câu mẫu của lý do | 28-25 |
| M7 | Rút lại | Khi doanh nghiệp rút lại | Gửi cho người đã rút lại + người phụ trách chính của cơ sở đó 〔hong trả lời 2026-10-03 (B10-2)〕 | Danh sách email M7 |
| M8 | Thay đổi người phụ trách・tên doanh nghiệp, v.v. (gửi vận hành) | Khi thay đổi các mục chỉ thông báo trên Web doanh nghiệp | Vận hành (thông báo trên màn hình). Không gửi email cho vận hành (chỉ màn hình). Với người phụ trách mới là M13 (liên kết hướng dẫn) 〔hong trả lời 2026-10-03 (B10-3)〕 | STEP2 Q3・Q10, danh sách email M8 |
| M9 | Dừng giao hàng (gửi công ty giao hàng ủy thác) | Khi phê duyệt hủy hợp đồng (tự động) | Công ty giao hàng của tuyến giao hàng. Cơ sở chỉ có chuyến tự giao thì không gửi, thông báo bằng màn hình cho nhân viên giao hàng nội bộ (WEB No.71・72) | T3-1・T3-2 |
| No.16 | Thông báo dừng tài khoản | Khi dừng tài khoản của cơ sở đã hủy hợp đồng (ngày hôm sau hạn thanh toán) | Người phụ trách chính・phụ・thanh toán của cơ sở | `Quyết_định_Bổ_sung_email_và_thông_báo_20261001.md` |

**Nội dung ghi trong email phê duyệt (M5)**

| Đơn | Nội dung ghi | Nguồn |
|---|---|---|
| Tất cả | Trước thay đổi → sau thay đổi・chu kỳ phản ánh・ảnh hưởng đến thanh toán. Khi đã dời sang kỳ sau (hoặc đặt hàng hộ) sau hạn chốt thì ghi rõ điều đó | Danh sách email M5, 28-27 |
| Nhập hộ | "Vận hành đã tiếp nhận thay" | 28 §8 phương án |
| Hủy hợp đồng | Ngày hủy hợp đồng (ngày cuối chu kỳ)・thanh toán cuối cùng là 1 hóa đơn của tháng sau khi hủy hợp đồng (quyết toán thực tế lần cuối・phí vi phạm・mua lại hàng còn lại)・đăng nhập chỉ xem đến hạn thanh toán của lần thanh toán cuối cùng, ngày hôm sau thì dừng | S4-1〜3 |
| Tạm dừng | Thời gian tạm dừng・dự kiến mở lại・không tính phí gói của các tháng đang tạm dừng・**kiểm tra tồn kho và quyết toán lúc bắt đầu tạm dừng, trong thời gian tạm dừng không quyết toán** | TL-2. ※ "Quyết toán thực tế khi tạm dừng sẽ gộp thanh toán khi mở lại hoặc hủy hợp đồng" trong M5 của danh sách email vẫn là cách viết của P5 (thay thế bằng TL-2). Sửa cả nội dung trong Excel |
| Khi tự động sửa đơn hàng | Đã đưa về đơn hàng mặc định・có thể nhập lại đến hạn chốt | STEP5 QA |

- Khi ngày gửi thông báo trùng ngày nghỉ của doanh nghiệp (ngày lễ・thứ bảy chủ nhật, v.v.), gửi vào ngày làm việc trước đó 〔Danh sách vấn đề 10/03〕.
- Thông báo trên màn hình Web doanh nghiệp (chỉ xem sau khi hủy hợp đồng・đăng nhập sau khi dừng, v.v.) là Excel "WEB" No.71〜76 〔danh sách email〕.
- Cũng gửi email nhắc nhở vào ngày trước khi dừng 〔hong trả lời 2026-10-03 (K15)〕.

---

## 11. Lịch sử và dữ liệu

| Mục | Quy định | Nguồn |
|---|---|---|
| Bảng đơn đăng ký | Số đơn・loại・ngày đăng ký・người đăng ký (tài khoản・người phụ trách đã chọn・họ tên tại thời điểm đó)・lý do・nguyện vọng・trạng thái・kênh tiếp nhận・người nhập (nhập hộ) | 28-28, Web doanh nghiệp §1-2, 28-33 |
| Chi tiết đơn (cơ sở) | Cơ sở・tháng chu kỳ bắt đầu・nội dung đơn (giá trị trước thay đổi・giá trị sau thay đổi)・trả lời・trạng thái phê duyệt・người phê duyệt・ngày giờ phê duyệt・lý do từ chối・ngày giờ rút lại | 28-28, v2.3 ⑥, TL-1 |
| "Lịch sử đơn" ở màn hình cơ sở | Số tiếp nhận・loại đơn・ngày đăng ký・người đăng ký・tháng chu kỳ bắt đầu・nội dung đơn・trạng thái phê duyệt・lý do từ chối・ngày giờ rút lại (người phê duyệt・ngày giờ phê duyệt không hiển thị trên Web doanh nghiệp) | 28-28, 契約_04 |
| Lịch sử thay đổi (doanh nghiệp・cơ sở・hợp đồng con) | Ngày giờ thay đổi・nội dung thay đổi・người thay đổi・phân loại thay đổi (nhập tay／nhập CSV／batch tự động tạo／phê duyệt đơn thay đổi)・phạm vi áp dụng・người phê duyệt (chỉ với thay đổi cần phê duyệt)・có thông báo hay không. Không hiển thị trên Web doanh nghiệp | 契約_03〜05 |
| Lịch sử tạm dừng | 1 lần tạm dừng = 1 dòng (bắt đầu tạm dừng・kết thúc tạm dừng・dự kiến mở lại・lý do tạm dừng・thiết bị trong thời gian tạm dừng・trạng thái). Phê duyệt tạm dừng thì tạo 1 dòng, phê duyệt mở lại thì thành "Đã mở lại" | 契約_04 |
| Xóa | Không xóa đơn. Chỉ đổi trạng thái | Danh sách vấn đề 10/03 "Xóa" |
| CSV | Quản lý đơn đăng ký hợp đồng có xuất CSV | `Định_nghĩa_nhập_xuất_CSV_20261003.md` |

---

## 12. Chênh lệch với triển khai hiện tại (tham khảo・phạm vi đã đọc code vào 2026-10-03)

| Màn hình | Chênh lệch | Căn cứ |
|---|---|---|
| Chi tiết đơn của vận hành (`app/ops/applications/_components/ChangeDetail.tsx`) | (Đã giải quyết) Đã bỏ "Làm lại" (sổ tiếp nhận No.11) | §3-2 |
| Lý do tạm dừng của Web doanh nghiệp (`lib/corp/sites/logic.ts` SUS_REASONS) | 5 lựa chọn (quyết định là 6 lựa chọn・câu chữ do kinh doanh xác nhận) | §6-6 (⚠️ B8) |
| Hướng dẫn đăng ký thay đổi của Web doanh nghiệp | "Không thể đăng ký chồng cùng thủ tục cho cùng một cơ sở" (28-4 là không thể chồng đơn bất kể loại thủ tục) | §3-3 |

---

## 13. Cần xác nhận (2026-10-03) → Ghi lại câu trả lời

hong đã trả lời từ 2026-10-03〜05. **Quyết định đang có hiệu lực xem `docs/決定台帳.md`**. Nội dung chính đã sửa theo câu trả lời.

| No | Nội dung | Trả lời |
|---|---|---|
| B1 | Tháng bắt đầu khi phê duyệt sau hạn chốt | Vận hành chọn 1 trong 2 (dời sang kỳ sau／đặt hàng hộ) |
| B4 | "Làm lại" | Không đặt (cơ sở đã phê duyệt・từ chối thì chốt ngay tại chỗ) |
| B6 | Giảm số lần giao hàng thấp hơn tiêu chuẩn | Giảm được (phí không giảm) |
| B7 | Tủ lạnh→máy bán hàng tự động | Đơn thay đổi gói + bắt buộc "Kết quả khảo sát hiện trường" |
| B8 | Câu chữ 6 lựa chọn lý do tạm dừng | **Đang xác nhận với khách hàng** (`議事録/_OPEN一覧.md` 1003-11) |
| B9 | Người thay đổi được mẫu giao hàng・chu kỳ giao hàng・số lần giao hàng | Số lần giao hàng = khách hàng đăng ký (bắt buộc phê duyệt), mẫu giao hàng・chu kỳ giao hàng = chỉ vận hành |
| B10 | Email M4・M7・M8 | M4 nhập hộ = người phụ trách chính của cơ sở／M7 gửi (người đó + người phụ trách chính)／M8 vận hành chỉ màn hình・người phụ trách mới nhận M13 |
| B11 | Lý do hủy hợp đồng và kịch bản giữ chân | **Chờ bản gốc của khách hàng** (1003-12) |

**Những điều chưa quyết định**

| No | Nội dung | Lựa chọn |
|---|---|---|
| ~~B4-2~~ | ~~Sắp xếp tên trạng thái~~ → **Đã trả lời 2026-10-05**: "Đã xử lý một phần" → "Đang xử lý n/m", "Phê duyệt một phần" giữ nguyên | — |
| B12 | Ai thực hiện kiểm tra tồn kho lúc bắt đầu tạm dừng (§6-6・契約_01 §10) | **Đã trả lời 2026-10-05: cơ sở (báo cáo kiểm kê trên Web doanh nghiệp)**. Cả cơ sở chuyến giao ES・kỳ của lần giao hàng cuối cùng trước tạm dừng (sổ cái E) |

> **Chuyển đổi tủ lạnh→máy bán hàng tự động (B7)**: tủ lạnh→máy bán hàng tự động được tiếp nhận bằng **đơn thay đổi gói**. Màn hình phê duyệt đặt **bắt buộc "Kết quả khảo sát hiện trường" (ngày khảo sát・khả thi hay không・đính kèm)**, chưa nhập thì không phê duyệt được. Tháng chu kỳ bắt đầu do vận hành chọn khi phê duyệt. Nếu không lắp đặt được thì từ chối (lý do "Không đáp ứng điều kiện lắp đặt"). Hạn xử lý của đơn này không tính theo hạn chốt đặt hàng (không hiển thị cảnh báo 3 ngày trước) 〔hong trả lời 2026-10-03 (B7=A)〕
