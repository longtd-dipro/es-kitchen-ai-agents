# Biểu mẫu đăng ký (Đăng ký mới・Thêm cơ sở trên Web Doanh nghiệp／Tiếp nhận của vận hành)

> **Tài liệu chuẩn của chủ đề này. Các quyết định đang có hiệu lực nằm ở `docs/決定台帳.md`.** Nếu sổ cái và tài liệu này mâu thuẫn thì sổ cái là đúng (do tài liệu này chưa được sửa kịp).
> Tạo ngày 2026-10-03 (tạo mới theo sổ cái A "Biểu mẫu đăng ký・phê duyệt yêu cầu: viết mới từ các tệp quyết định" Q3=A).
> Tài liệu này được viết lại từ các tệp quyết định. **Các tài liệu cũ sau đây bị đóng băng** (từ nay không cập nhật. Tài liệu chuẩn là tài liệu này): `20_Doanh_nghiệp_Cơ_sở_Hợp_đồng/Form_đăng_ký_doanh_nghiệp_Sắp_xếp_v2.md`, `30_Đơn_yêu_cầu/Màn_hình_chi_tiết_yêu_cầu_Đề_xuất_thiết_kế_lại_v1.md` (phần đăng ký mới・chuyển đổi), `30_Đơn_yêu_cầu/Đặc_tả_kiểm_tra_nhập_liệu_Form_đăng_ký_20261001.md` §3・§5, `30_Đơn_yêu_cầu/Màn_hình_tiếp_nhận_và_phê_duyệt_Chênh_lệch_mục_20260929.md` (diễn biến).
> Các yêu cầu thay đổi (8 loại như đổi gói・tạm ngưng・hủy) và phê duyệt xem `30_Đơn_yêu_cầu/Đơn_yêu_cầu_và_phê_duyệt.md`.
> Những điều chưa quyết định・chỗ mâu thuẫn giữa các tài liệu được ghi trong nội dung là "⚠️ Cần xác nhận (2026-10-03)" và tổng hợp ở §17.

---

## 0. Cách đọc

### 0-1. Phạm vi

| Bao gồm | Không bao gồm (nơi đặt) |
|---|---|
| "Đăng ký mới" trên Web Doanh nghiệp (không đăng nhập・chính thức／chiến dịch dùng thử) | Đăng ký thay đổi (8 loại)・phê duyệt → `30_Đơn_yêu_cầu/Đơn_yêu_cầu_và_phê_duyệt.md` |
| "Thêm cơ sở" trên Web Doanh nghiệp (tài khoản doanh nghiệp・tài khoản cơ sở đang đăng nhập) | Định nghĩa các mục của doanh nghiệp・cơ sở・hợp đồng cha・hợp đồng con → `Đặc_tả_hợp_đồng/契約_03〜05` |
| Tiếp nhận của vận hành (xác nhận nội dung đăng ký → đăng ký tạm → thiết lập thông tin chi tiết → đăng ký chính thức)・nhập thay・CSV hàng loạt | Tính toán thanh toán (tiền phạt vi phạm hợp đồng・thanh toán lần đầu v.v.) → `40_Master_Phí_Thanh_toán/Quy_tắc_thanh_toán_Đặc_tả_v1.md` |
| Tiếp nhận chuyển đổi từ dùng thử → chính thức | Cách tạo lộ trình giao hàng・dữ liệu giao hàng → đặc tả giao hàng |

### 0-2. Ký hiệu viết tắt của nguồn

| Ký hiệu | Tệp (`docs/01_仕様/00_Quyết_định/` v.v.) |
|---|---|
| Sổ cái | `docs/決定台帳.md` |
| 28-xx | `Quyết_định_v2.3_Bổ_sung_Liên_quan_đơn_yêu_cầu_20260928.md` (28-1〜28-175) |
| Master đăng ký #n | `Quyết_định_v2.3_Bổ_sung_Form_đăng_ký_và_Master_20260929.md` |
| STEP1 | `Quyết_định_STEP1_Trả_lời_Đăng_ký_và_Mẫu_20261001.md` |
| STEP2 Qn | `Quyết_định_STEP2_Trả_lời_Doanh_nghiệp_Cơ_sở_Hợp_đồng_20261001.md` |
| S・T・E・D | `Quyết_định_STEP3_Trả_lời_phần_còn_lại_và_đóng_STEP1_20261001.md` (S1〜S11・T1〜T6. Các số D・E trong T5 là của `90_デモ確認/質問一覧_STEP1を閉じる・STEP3の残り_20261001.md`) |
| STEP5 | `Quyết_định_STEP5_Trả_lời_Web_doanh_nghiệp_20261001.md` |
| H1〜H5 | `Quyết_định_Tài_khoản_Web_doanh_nghiệp_H1-H5_20261001.md` |
| TL・DR | `決定_TechLeadレビュー回答_*.md`・`Quyết_định_Trả_lời_review_thiết_kế_20261001.md` |
| v2.3 #n | `Quyết_định_v2.3_20260923.md` |
| Dòng n | Bảng yêu cầu (`Quyết_định_Trả_lời_phản_ánh_một_phần_bảng_yêu_cầu_20260930.md`・`Quyết_định_Bảng_yêu_cầu_Phase2_Trả_lời_phần_còn_lại_và_đề_xuất_20261002.md`) |
| Nguyên điển #n | `00_確認してほしい/作業記録_20261003/申込・申請_仕様に入れる内容_20261003.md` (câu của Yêu cầu chi tiết hợp đồng REQ-CT) |
| Danh sách vấn đề mm/dd | `00_確認してほしい/課題一覧_データ統合と画面_20261002.md` (ngày trả lời của hong) |
| Hợp đồng_01 | `Đặc_tả_hợp_đồng/Hợp_đồng_01_Trục_thời_gian_bản_sao_và_tính_nhất_quán.md` |
| Biểu mẫu hiện hành | Kết quả đọc ảnh biểu mẫu đăng ký hiện hành (R01〜R04). `Form_đăng_ký_doanh_nghiệp_Sắp_xếp_v2.md` §1〜§4 (đóng băng) |

### 0-3. Thuật ngữ

| Thuật ngữ | Ý nghĩa |
|---|---|
| Loại hợp đồng | Chính thức／chiến dịch dùng thử (không dùng "hợp đồng chính" "trial") [biểu mẫu hiện hành ⑩]. Tên gọi thống nhất là "Chính thức (本導入)" [hong trả lời 2026-10-03 (K14)] |
| Loại thiết bị | Lựa chọn 1 trong 2 cho mỗi cơ sở: tủ lạnh・tủ đông／máy bán hàng tự động [sổ cái "Loại thiết bị"] |
| Hợp đồng (trong đăng ký) | "Gói mong muốn" của biểu mẫu đăng ký = hợp đồng của 1 cơ sở. Một lần đăng ký có thể gồm nhiều hợp đồng |
| Số tiếp nhận | Số của đăng ký mới・thêm cơ sở `AP-YYYYMMDD-NNNN` [danh sách email M1]. `AP-` chỉ là số tiếp nhận của đăng ký mới (ID áp dụng đã bị bãi bỏ) [hong trả lời 2026-10-03 (K7＝A)] |
| Đăng ký tạm／đăng ký chính thức | §10. Đăng ký tạm = giai đoạn tạo doanh nghiệp・cơ sở・hợp đồng cha・hợp đồng con đầu tiên・tài khoản. Đăng ký chính thức = xác nhận theo từng cơ sở |

---

## 1. Luồng tổng thể

```
[Lối vào]                              [Vận hành: Quản lý yêu cầu hợp đồng ＞ Tab Hợp đồng mới]
Web Doanh nghiệp: Đăng ký mới (không đăng nhập) ─┐
Web Doanh nghiệp: Thêm cơ sở (đang đăng nhập) ───┤→ Đang tiếp nhận ─(hoàn tất xác nhận nội dung đăng ký＝đăng ký tạm)→ Đang thiết lập hợp đồng ─(đăng ký chính thức tất cả cơ sở)→ Hoàn tất
Vận hành nhập thay (điện thoại・kinh doanh・giấy v.v.) ─┤        │                                   │
Vận hành CSV hàng loạt (nhập thay) ──────────────┤        └→ Từ chối (bắt buộc lý do)          └→ Từ chối／rút lại (hủy các đơn hàng・bộ khởi tạo đã tạo)
Chuyển đổi dùng thử→chính thức (vận hành nhập thay) ─┘
```

- Con đường để vận hành tạo cơ sở・hợp đồng là **chỉ một: đăng ký (nhập thay) → tiếp nhận**. Không đặt "Đăng ký mới" ở danh sách cơ sở v.v. [28-33, danh sách vấn đề 10/02 "2-2 là 28-33"].
- Trạng thái: Đang tiếp nhận／Đang thiết lập hợp đồng／Hoàn tất／Từ chối／Đã rút lại [28-63].

---

## 2. Lối vào và các loại đăng ký

| Lối vào | Màn hình | Loại hợp đồng | Thông tin doanh nghiệp | Người đăng ký | Nguồn |
|---|---|---|---|---|---|
| Đăng ký mới (trước khi đăng nhập) | Màn hình trước đăng nhập (không có menu bên. Logo・đăng ký phỏng vấn・liên hệ・đăng nhập) | Chính thức／chiến dịch dùng thử (nút chuyển) | Nhập | Nhập (§5-3) | Web Doanh nghiệp §2-2, 28-117 |
| Thêm cơ sở | "Thêm cơ sở" ở "Danh sách cơ sở" "Yêu cầu" của Web Doanh nghiệp. **Cả tài khoản doanh nghiệp và tài khoản cơ sở** đều dùng được | Chính thức | Đã đăng ký (không nhập). 2 bước | Tài khoản đang đăng nhập + chọn từ người phụ trách | Web Doanh nghiệp §2-2・§4-2, 28-117 |
| Vận hành nhập thay | **Chỉ** "Đăng ký mới (nhập thay)" ở tab "Hợp đồng mới" của Quản lý yêu cầu hợp đồng | Chính thức／dùng thử／chuyển đổi | Doanh nghiệp mới／doanh nghiệp hiện có | Nhập (lưu kênh tiếp nhận・người nhập) | 28-33, STEP1 |
| Vận hành CSV hàng loạt | "Nhập CSV đăng ký mới (đăng ký hàng loạt nhập thay)" ở Quản lý yêu cầu hợp đồng | Chính thức／dùng thử | Cột của CSV | Cột của CSV | Danh sách vấn đề 10/03 "Tạo đăng ký mới hàng loạt bằng CSV: có". Các cột ở §10-8-1 [hong trả lời 2026-10-03 (A11)] |
| Chuyển đổi dùng thử→chính thức | Thêm "Chuyển đổi (dùng thử→chính thức)" vào nhập thay của vận hành | Chuyển đổi | Hiện có | — | STEP1 "Chuyển đổi được thêm vào nhập thay của vận hành. Khi cần sẽ cho phép chọn 'chuyển đổi từ dùng thử' ở đăng ký mới của Web Doanh nghiệp" |

- **Cơ sở mới do tài khoản cơ sở "Thêm cơ sở" và yêu cầu của nó không hiển thị trong danh sách cơ sở・danh sách yêu cầu của tài khoản đã thêm.** Xem bằng tài khoản cơ sở của cơ sở mới và tài khoản doanh nghiệp. Kết quả (lý do phê duyệt・từ chối) được gửi qua email cho người đăng ký [H3＝A, H4].
- Trường hợp nhiều công ty cùng tầng dùng chung 1 tủ lạnh cũng không tạo ngoại lệ, mà **mỗi công ty đăng ký riêng** (vì giá trị lý thuyết của tồn kho・quyết toán thực tế sẽ không khớp) [nguyên điển #26・REQ-CT-238].
- **Không giả định đăng ký đồng thời** chiến dịch dùng thử và chính thức [Hợp đồng_00 §0.4].

---

## 3. Cấu trúc màn hình Web Doanh nghiệp (Đăng ký mới)

| Bước | Tên | Nội dung | Nguồn |
|---|---|---|---|
| 1 | Nhập nội dung mong muốn và nơi giao hàng | Nút chuyển loại hợp đồng・danh sách hợp đồng (cơ sở)・gói／thiết bị／tùy chọn／nơi giao hàng／thanh toán／đính kèm theo từng cơ sở. Bên phải có **bảng báo giá** | Biểu mẫu hiện hành R01・§7 #1〜#3 |
| 2 | Nhập thông tin doanh nghiệp | Người đăng ký (không đăng nhập)・thông tin doanh nghiệp・người phụ trách của doanh nghiệp | Biểu mẫu hiện hành R02, 28-117 |
| 3 | Xác nhận nội dung và gửi | Xác nhận (dạng bảng)・chi tiết báo giá・đồng ý・gửi | Biểu mẫu hiện hành R03, 28-23 |
| Hoàn tất | Đã tiếp nhận đăng ký | Số tiếp nhận・hướng dẫn email・URL đặt lịch phỏng vấn khởi động | §7 |

- Màn hình xác nhận **cố định dạng bảng (hàng = mục／cột = cơ sở)** (không tự chuyển theo số lượng) [28-23]. Góc trên bên phải mỗi khối có "Sửa" [biểu mẫu hiện hành].
- "Thêm cơ sở" vì thông tin doanh nghiệp đã đăng ký nên có **2 bước** (nội dung mong muốn và nơi giao hàng → xác nhận) [Web Doanh nghiệp §2-2].
- Nếu rời đi giữa chừng (menu bên v.v.) sẽ hiển thị xác nhận hủy bỏ [Web Doanh nghiệp §2-2].
- Thứ tự nhập **giữ nguyên hiện tại** (bước 1 = gói + nơi giao hàng → bước 2 = thông tin doanh nghiệp) [hong trả lời 2026-10-05 (#1). Không áp dụng REQ-CT-113 của nguyên điển "gói→thông tin công ty→nơi giao hàng"].
- Phần trên của màn hình trước đăng nhập đặt "Bạn đã có tài khoản? → Đăng nhập" và "Đăng ký phỏng vấn" [biểu mẫu hiện hành]. Phỏng vấn là **tùy chọn** [28-24].

---

## 4. Bước 1: Nội dung mong muốn và nơi giao hàng

### 4-1. Loại hợp đồng và danh sách hợp đồng (cơ sở)

| Mục | Bắt buộc | Quy định | Nguồn |
|---|---|---|---|
| Loại hợp đồng | ○ | Nút chuyển Chính thức／chiến dịch dùng thử (một biểu mẫu. Không tách màn hình) | Biểu mẫu hiện hành §7 #2 |
| Danh sách hợp đồng | ○ | Các gói mong muốn xếp dạng chip, mỗi chip có "×" "Nhân bản", bên dưới "＋ Thêm hợp đồng". **Có thể thêm bao nhiêu cơ sở tùy ý** (dùng thử cũng có thể nhiều cơ sở) | Biểu mẫu hiện hành §5 ①・§7 #5 |
| Nhân bản | — | Có thể nhân bản và giữ lại nơi giao hàng・người phụ trách | Biểu mẫu hiện hành |

### 4-2. Nhập theo từng hợp đồng (cơ sở)

| Mục | Bắt buộc | Loại | Quy định | Nguồn |
|---|---|---|---|---|
| Loại thiết bị | ○ | Chọn 1 trong 2 | **Tủ lạnh・tủ đông／máy bán hàng tự động**. Ở trên cùng của accordion. **Dùng thử không hiển thị mà cố định tủ lạnh・tủ đông** (máy bán hàng tự động hướng dẫn trao đổi khi phỏng vấn) | Sổ cái, STEP5 T2 "Dùng thử không có máy bán hàng tự động" |
| Số món ES Food (gói) | ○ | Chọn | Gói đang công khai trong master gói. **Máy bán hàng tự động từ gói 100 trở lên** (gói 50 không chọn được máy bán hàng tự động) | Đặc tả kiểm tra nhập liệu §3-3 |
| Course | ○ | Chọn | ES Lite／ES Standard. **Máy bán hàng tự động cố định ES Lite (máy bán hàng tự động) (chỉ hiển thị)** | Đặc tả kiểm tra nhập liệu §3-3, 28-170 |
| Phương thức giao hàng | ○ | Chọn | Giao hàng ES／giao hàng COOL. **Máy bán hàng tự động cố định giao hàng ES** (không hiển thị lựa chọn). Giao hàng ES có ghi chú rằng phí khác nhau tùy trao đổi trước・khu vực | 28-19, STEP1, biểu mẫu hiện hành §4 |
| Số lần giao hàng (tháng) | ○ | Chọn | **Chính thức: chọn được tiêu chuẩn của gói／＋1 lần／＋2 lần**. Giá trị ban đầu là tiêu chuẩn của gói. Phần vượt tiêu chuẩn được đưa vào báo giá là thêm số lần giao hàng (OP000001・hàng tháng ¥3,000 mỗi lần). **Dùng thử không chọn được (cố định tiêu chuẩn của gói)**. Số lần đã chọn là giá trị ban đầu của số lần giao hàng khi tiếp nhận. Số lần giao hàng tiêu chuẩn lấy từ master gói (theo từng nhiệt độ) | Master đăng ký #2・#3, 28-85, 28-154, STEP1 |
| Tháng mong muốn bắt đầu hợp đồng | ○ (chính thức) | Năm tháng | **Chỉ năm tháng** (không chọn ngày. Ngày tự động là ngày đầu chu kỳ A1). **Đăng ký trước hạn chót đặt hàng chỉ chọn được từ tháng sau trở đi, đăng ký sau hạn chót chỉ chọn được từ tháng sau nữa trở đi**. Dùng thử không hiển thị | STEP1, dòng 159, REQ-CT-225・257, 28-70 |
| Tầng lắp đặt | △ | Văn bản (60) | **Hiển thị ở tất cả cơ sở**. Bắt buộc khi là máy bán hàng tự động, tủ lạnh・tủ đông là tùy chọn. Ở tiếp nhận của vận hành ("Tầng lắp đặt (cơ sở N)") → khi đăng ký tạm được đưa vào **mục riêng "Tầng lắp đặt"** của cơ sở (không trộn vào ghi chú giao hàng: hong trả lời 2026-10-03) | Biểu mẫu hiện hành §6-3 [hong trả lời 2026-10-03 (A8＝C)] |
| Ghi chú ngoài gói | — | Nhiều dòng (500) | — | Biểu mẫu hiện hành, danh sách vấn đề 10/03 |
| Cách xử lý sản phẩm có hạn sử dụng ngắn | ○ | Chọn | Mẫu "không có hạn sử dụng ngắn": không đưa sản phẩm có hạn sử dụng ngắn vào đơn hàng mặc định. Phí không đổi. **Quyết định khi hợp đồng (đăng ký), sau hợp đồng chỉ vận hành mới thay đổi được** | REQ-CT-300 (`MM20261002_実装突合` No.13) |

- **Ở màn hình chọn gói hiển thị trợ giúp như số người khuyến nghị (master gói "Số người sử dụng ước tính (để hiển thị)"), và hiển thị ước tính phí theo gói đã chọn. Đặt trợ giúp "?" cho dùng thử miễn phí** [nguyên điển #19 (độ chắc chắn: trung bình), master đăng ký #3].

### 4-3. Thiết bị (dòng máy・thiết bị)

| Mục | Bắt buộc | Quy định | Nguồn |
|---|---|---|---|
| Thiết bị có trong gói | Tham khảo | Hiển thị **thiết bị cho thuê tiêu chuẩn** của master gói (course・mẫu (tiêu chuẩn／thay thế)・dòng máy・số lượng). ES400・500 tiêu chuẩn là 84L＋142L, thay thế là 84L×2, **khách hàng chọn được**. ES600 trở lên thì trao đổi | 28-14, v2.3 ⑫, `Quyết_định_Master_tủ_lạnh_và_cấu_hình_theo_gói_20260929.md` #2 |
| Kích cỡ・số lượng tủ lạnh | △ | Chỉ các dòng máy có "trạng thái công khai = công khai" trong master dòng máy. Hiển thị tên dòng máy và **mã dòng máy**. Kích cỡ lớn hơn thì **chỉ tính chênh lệch** (OP000023 chênh lệch kích cỡ (hàng tháng)・thanh toán tùy chọn). **Giảm kích cỡ (âm) không tính phí cũng không hoàn tiền, coi là 0 yên, không hiển thị chênh lệch âm cho khách** | STEP1, H5 |
| Thiết bị bổ sung (lò vi sóng・hộp vật tư v.v.) | — | ＋／− số lượng, "＋ Thêm thiết bị". Số tiền là tiền hàng tháng của master dòng máy (hộp vật tư ¥0) | Biểu mẫu hiện hành §7 #6, 28-9 |
| Xác định dung lượng | — | Số lượng giao mỗi lần (giới hạn cung cấp hàng tháng theo nhiệt độ ÷ số lần giao hàng tiêu chuẩn theo nhiệt độ・làm tròn lên) có vừa với số lượng chứa tối đa của tủ lạnh・tủ đông không | 28-15, `Quyết_định_v2.3_Bổ_sung_Master_Gói_20260929.md` #9・④ |
| Hướng dẫn thời gian sử dụng tối thiểu | Tham khảo | Tủ lạnh 3 tháng・máy bán hàng tự động 12 tháng (theo từng thiết bị・master dòng máy). Tính từ ngày cho thuê của từng thiết bị | Sổ cái, STEP2 Q8 |
| Vật tư | — | **Khi đăng ký không cho chọn số lượng mong muốn.** Tự động đặt hàng bộ vật tư khởi tạo (§10-3) | STEP1 |

- Hiểu rằng máy làm ấm (hot warmer) không hiển thị khi đăng ký (vận hành sẽ gắn sau) [biểu mẫu hiện hành ⑯].
- **Có thể chọn không thuê tủ lạnh (không có tủ lạnh)**. Khi chọn "không" thì không nhập loại・số lượng [hong trả lời 2026-10-03 (K16)].

### 4-4. Tùy chọn (các tùy chọn khác)

| Quy định | Nguồn |
|---|---|
| **Chỉ hiển thị mục "hiển thị ở đăng ký Web Doanh nghiệp" của master tùy chọn và "đang sử dụng".** Tên・số tiền・loại phí (hàng tháng／một lần) theo master. Không viết trực tiếp danh sách vào biểu mẫu | Master đăng ký #1 |
| Phí một lần (ví dụ: lắp đặt hộ・đổi wrapping máy bán hàng tự động) không tính vào tổng hàng tháng, hiển thị ở màn hình xác nhận・chi tiết báo giá dưới dạng dòng một lần | Master đăng ký #1, dòng 156 |
| **Có thể chọn lắp đặt hộ tủ lạnh (OP000007・một lần)** (cũng chọn được ở yêu cầu thay đổi) | Dòng 156 |
| **Đổi wrapping máy bán hàng tự động (OP000017・một lần・báo giá riêng) chỉ ở cơ sở máy bán hàng tự động** | Sổ cái "Loại thiết bị" |
| **OP000013 bổ sung vật tư định kỳ bị bãi bỏ** (không hiển thị khi đăng ký) | STEP5 (bãi bỏ OP000013) |
| "Dịch vụ cung cấp báo cáo vận hành hàng tháng" không hiển thị vì OP000011 đã "kết thúc" | Master đăng ký #1 |

- Phí sử dụng ES-QR (OP000002) **không cho chọn khi đăng ký** (chỉ vận hành gắn・gỡ. Nguyện vọng nhận qua ghi chú, vận hành gắn khi tiếp nhận) [bảng yêu cầu dòng 157・sổ cái].
- Nội dung và sự trùng lặp của "Dịch vụ hỗ trợ lắp đặt ban đầu (miễn phí)" "Gói giao hàng・lắp đặt ban đầu (¥7,800)" "Lắp đặt hộ (OP000007)" "Phí giao thiết bị (OP000019／020)" **đang xác nhận với khách hàng** (`議事録/_OPEN一覧.md` 1003-10).

### 4-5. Nơi giao hàng (nơi nhập giao)

| Mục | Bắt buộc | Tối đa | Quy định | Nguồn |
|---|---|---|---|---|
| "Giống thông tin địa chỉ của doanh nghiệp" | — | — | Tích chọn thì sao chép địa chỉ doanh nghiệp (khi thêm cơ sở là địa chỉ doanh nghiệp đã đăng ký) | Biểu mẫu hiện hành §5 ⑦・§7 #10 |
| Tên nơi giao hàng | ○ | 60 | — | Danh sách vấn đề 10/03 (1 dòng 60) |
| Furigana tên nơi giao hàng | ○ | 60 | Katakana toàn góc・dấu kéo dài・khoảng trắng | Đặc tả kiểm tra nhập liệu §3, danh sách vấn đề 10/03 |
| Mã bưu điện | ○ | 8 | §9-2. Tìm kiếm địa chỉ (nếu không có kết quả vẫn nhập tay tiếp được) | Đặc tả kiểm tra nhập liệu §2 |
| Tỉnh thành | ○ | — | Chọn từ 47 tỉnh thành | Đặc tả kiểm tra nhập liệu §3-1 |
| Quận huyện・khu vực・số nhà | ○ | 255 | — | Danh sách vấn đề 10/03 (địa chỉ 255) |
| Tòa nhà・số phòng | — | 255 | — | Như trên |
| Số điện thoại | ○ | 20 | §9-2 | Đặc tả kiểm tra nhập liệu §2 |
| Số FAX | — | 20 | Cùng định dạng với điện thoại | Như trên |
| Số nhân viên ước tính | ○ | — | Lựa chọn (dropdown) | Biểu mẫu hiện hành §7 #13 |
| Ngày không giao hàng | — | — | Tích chọn thứ Hai〜Chủ nhật＋**ngày lễ**. Không chọn được tất cả (phải còn ngày giao được) | Biểu mẫu hiện hành §7 #12, đặc tả kiểm tra nhập liệu §3-3 |
| Khi rơi vào ngày không giao hàng | ○ | — | Dời sớm lên ngày trước／dời muộn xuống ngày sau | Biểu mẫu hiện hành |
| Lộ trình vận chuyển vào・tài liệu đính kèm | — | — | **JPG・PNG・PDF・HEIC, 1 tệp 5MB, tối đa 10 tệp**. Không nhận Excel・Word | Danh sách vấn đề 10/03 "Đính kèm", STEP1 |
| Nguyện vọng giao hàng (thứ trong tuần v.v.) | — | 500 | **Khách hàng không chọn mẫu giao hàng・chu kỳ giao hàng**. Nguyện vọng nhận qua ghi chú giao hàng | 28-77・28-78 |

### 4-6. Thanh toán (theo từng cơ sở)

| Mục | Bắt buộc | Quy định | Nguồn |
|---|---|---|---|
| Hóa đơn | ○ | Thanh toán cho doanh nghiệp／thanh toán cho cơ sở này | Biểu mẫu hiện hành §7 #7, 28-29 |
| Phương thức thanh toán (khi thanh toán cho cơ sở này) | ○ | Chuyển khoản tự động／chuyển khoản ngân hàng／thẻ tín dụng. Thẻ tín dụng vẫn giữ trong lựa chọn, thanh toán nằm ngoài hệ thống (ES chỉ giữ phân loại) | STEP1 "Phương thức thanh toán thanh toán tại nơi giao hàng: bắt buộc", 28-32, S7 |
| Chu kỳ thanh toán (khi thanh toán cho cơ sở này) | ○ | Thanh toán hàng tháng／hàng năm (mặc định hàng tháng) | Master đăng ký #4 |
| Thời điểm phát hành hóa đơn | — | Giống doanh nghiệp (không hỏi ở cơ sở) | Master đăng ký #4 |

### 4-7. Người phụ trách (theo từng cơ sở)

| Quy định | Nguồn |
|---|---|
| Bảng người phụ trách theo từng cơ sở (phân loại・tên người phụ trách・furigana・email・điện thoại・thêm／xóa dòng) ＋ ô chọn "**Giống thông tin người phụ trách của doanh nghiệp**" | STEP1 "Cách giữ người phụ trách", biểu mẫu hiện hành §5 ⑦ |
| **Cơ sở: bắt buộc 1 người phụ trách chính** (không cần khi "giống doanh nghiệp"). **Nếu nơi thanh toán = cơ sở này thì người phụ trách thanh toán cũng bắt buộc** | Đặc tả kiểm tra nhập liệu §3-2, biểu mẫu hiện hành §5 ⑦ |
| Khi chưa xác định người phụ trách, người đăng ký có thể đăng ký tạm chính mình | Nguyên điển #20 (độ chắc chắn: trung bình) |
| Trên màn hình hướng dẫn rằng email hướng dẫn đăng nhập được gửi cho tất cả người phụ trách chính・phụ・thanh toán của cơ sở này | 28-139 |
| Cột "Người phụ trách theo nơi giao hàng" của biểu mẫu hiện hành bị bãi bỏ | Biểu mẫu hiện hành §5 ⑦ |

### 4-8. Những điểm thay đổi theo loại thiết bị

| | Tủ lạnh・tủ đông | Máy bán hàng tự động | Nguồn |
|---|---|---|---|
| Course・phương thức giao hàng | Chọn | Cố định ES Lite (máy bán hàng tự động)・giao hàng ES | 28-19, đặc tả kiểm tra nhập liệu §3-3 |
| Tầng lắp đặt | Tùy chọn | Bắt buộc | Biểu mẫu hiện hành §6-3 [hong trả lời 2026-10-03 (A8＝C)] |
| Tùy chọn | "Hiển thị khi đăng ký" của master | Như bên trái＋đổi wrapping máy bán hàng tự động | Sổ cái |
| Báo giá | Hiển thị số tiền | **Hiển thị số tiền ước tính**＋ghi chú "※Số tiền máy bán hàng tự động chỉ là ước tính. Sau khi khảo sát hiện trường, chúng tôi sẽ gửi báo giá chính thức." [hong trả lời 2026-10-03 (A3)] | — |
| Ghi chú | Giao hàng ES cần trao đổi trước | Như bên trái＋"Trước khi lắp đặt sẽ tiến hành khảo sát hiện trường. Tùy kết quả khảo sát・tình trạng tồn kho, có thể không đáp ứng được yêu cầu, hoặc mất vài tháng mới xử lý được" | Biểu mẫu hiện hành §4, `Quyết_định_v2.3_Bổ_sung_Master_Gói_20260929.md` (từ tủ lạnh → máy bán hàng tự động cần khảo sát hiện trường) |
| Dùng thử | Chọn được | Không chọn được | STEP5 T2 |

- Đăng ký máy bán hàng tự động **không đặt ngoài hệ thống mà tiếp nhận bằng biểu mẫu đăng ký, số tiền báo giá riêng** [STEP1, dòng 77 (10/02 "giữ nguyên đặc tả hiện tại")].
- Với máy bán hàng tự động, hiển thị số tiền có thể tính được làm ước tính, kèm ghi chú "※Số tiền máy bán hàng tự động chỉ là ước tính. Sau khi khảo sát hiện trường, chúng tôi sẽ gửi báo giá chính thức." [hong trả lời 2026-10-03 (A3). Trước đây: báo giá riêng]
  - Tiền hàng tháng ước tính = phí gói ES Lite (máy bán hàng tự động) (không gồm tiền thuê・【tạm】giống Lite (tủ lạnh)) ＋ **phí hàng tháng máy bán hàng tự động** (tiền hàng tháng của master dòng máy máy bán hàng tự động tiêu chuẩn của gói × số lượng). Phí khởi tạo (master dòng máy) là một dòng một lần ở lần thanh toán đầu tiên (triển khai 2026-10-05・sổ cái "Tiền thuê máy bán hàng tự động")

---

## 5. Bước 2: Thông tin doanh nghiệp・người phụ trách・người đăng ký

### 5-1. Thông tin doanh nghiệp

| Mục | Bắt buộc | Tối đa | Quy định | Nguồn |
|---|---|---|---|---|
| "Sao chép từ thông tin nơi giao hàng (cơ sở)" | — | — | Sao chép mã bưu điện・địa chỉ・số điện thoại. **Không sao chép tên doanh nghiệp** | Biểu mẫu hiện hành §7 #9, nguyên điển #20 |
| Tên doanh nghiệp | ○ | 60 | — | Danh sách vấn đề 10/03 |
| Furigana tên doanh nghiệp | ○ | 60 | Katakana toàn góc | Như trên |
| Tên doanh nghiệp nơi thanh toán | ○ | 60 | Tên người nhận hóa đơn (nếu giống tên doanh nghiệp thì cùng tên) | 28-61, đặc tả kiểm tra nhập liệu §3-1 |
| Mã bưu điện〜tòa nhà・số phòng (địa chỉ ghi trên hóa đơn) | ○ (tòa nhà là tùy chọn) | 255 | Cùng quy tắc với §4-5 | 28-61 |
| Số điện thoại・số FAX | ○／— | 20 | §9-2 | Đặc tả kiểm tra nhập liệu |
| Phương thức thanh toán | ○ | — | Chuyển khoản tự động／chuyển khoản ngân hàng／thẻ tín dụng | 28-32, S7 |
| Chu kỳ thanh toán | ○ | — | Thanh toán hàng tháng／hàng năm (mặc định hàng tháng). **Sau khi đăng ký doanh nghiệp chỉ tham khảo** | Master đăng ký #4 |
| Thời điểm phát hành hóa đơn (thời gian chờ phát hành hóa đơn) | ○ | — | 3 tháng trước／2 tháng trước／1 tháng trước (tiêu chuẩn)／tháng này／tháng sau (trả sau). Mặc định là trả trước (1 tháng trước). **Sau khi đăng ký doanh nghiệp chỉ tham khảo** | Master đăng ký #4, 28-71 |

- **Không hỏi** khi đăng ký: chế độ khách・giới hạn (sửa sau ở quản lý cơ sở), số tiền doanh nghiệp chịu (vận hành hỏi khi tiếp nhận), đơn vị phát hành hóa đơn (vận hành thiết lập・doanh nghiệp chỉ tham khảo) [master đăng ký #4, 28-31].

### 5-2. Người phụ trách của doanh nghiệp

| Quy định | Nguồn |
|---|---|
| Bảng người phụ trách của doanh nghiệp (phân loại = người phụ trách chính／người phụ trách thanh toán／người phụ trách phụ・tên người phụ trách・furigana・email・điện thoại). **Bắt buộc 1 người chính・1 người phụ trách thanh toán** | STEP1, STEP2 Q10, đặc tả kiểm tra nhập liệu §3-2 |
| Email trùng nhau trong bảng được phép (1 người kiêm nhiều phân loại) | Đặc tả kiểm tra nhập liệu §3-2 |

### 5-3. Người đăng ký

| Tình huống | Quy định | Nguồn |
|---|---|---|
| Đăng ký mới không đăng nhập | **Bắt buộc nhập Họ tên・Địa chỉ email・Số điện thoại của người đang nhập (người đăng ký)**. Đặt thẻ "Người đăng ký" ở đầu "Nhập thông tin doanh nghiệp". Email cũng kiểm tra định dạng. Nút "Đặt người này làm người phụ trách chính" sẽ sao chép sang người phụ trách chính của người phụ trách (furigana nhập lại). Liên lạc xác nhận gửi đến email này | 28-117 |
| Thêm cơ sở (đang đăng nhập) | Vì tài khoản đang đăng nhập là người đăng ký nên không hỏi họ tên v.v. Do là tài khoản dùng chung, ở cột "Người đăng ký" (radio・bắt buộc) của bảng "Thông tin doanh nghiệp・người phụ trách" trên màn hình xác nhận, **chọn từ người phụ trách đã đăng ký** (tài khoản doanh nghiệp = người phụ trách của doanh nghiệp／tài khoản cơ sở = người phụ trách của cơ sở đó) | 28-117, Web Doanh nghiệp §1-2 |
| Màn hình của vận hành | Ở chi tiết yêu cầu (thông tin yêu cầu) hiển thị người đăng ký・email người đăng ký・điện thoại người đăng ký và "Đăng ký không đăng nhập／tài khoản đang đăng nhập" | 28-117 |

- Người đăng ký chọn 1 người từ người phụ trách [hong trả lời 2026-10-03 (A2). Trước đây: nhập riêng theo 28-117]

---

## 6. Bước 3: Xác nhận và đồng ý

| Mục | Quy định | Nguồn |
|---|---|---|
| Kiểu xác nhận | Dạng bảng (hàng = mục／cột = cơ sở). Mỗi khối có "Sửa" | 28-23, biểu mẫu hiện hành |
| Thứ tự hàng | Loại hợp đồng／loại thiết bị／gói mong muốn／course／bắt đầu hợp đồng／thời gian sử dụng tối thiểu／thiết bị／tùy chọn／số lần giao hàng／tổng phí gói → thông tin nơi giao hàng → tài liệu đính kèm・ghi chú | Biểu mẫu hiện hành R03 |
| Chi tiết báo giá | §8 | — |
| Đồng ý (chính thức) | **Bắt buộc đồng ý Điều khoản sử dụng・Chính sách bảo mật (cung cấp thực tích mua hàng cho doanh nghiệp triển khai)**. Đặt ở cuối cùng | Nguyên điển #18, biểu mẫu hiện hành §3 |
| Đồng ý (dùng thử) | Dùng thử bắt buộc đồng ý cả 3: Điều khoản sử dụng・Chính sách bảo mật・Điều khoản chiến dịch [hong trả lời 2026-10-03 (A5＝B)] | — |
| Gửi | Khi bấm thì vô hiệu hóa nút, không bấm được cho đến khi hiển thị số tiếp nhận (ngăn gửi hai lần) | Đặc tả kiểm tra nhập liệu C7 |

---

## 7. Màn hình hoàn tất

| Mục | Quy định | Nguồn |
|---|---|---|
| Hiển thị | "Đã tiếp nhận đăng ký"・số tiếp nhận `AP-YYYYMMDD-NNNN` | Danh sách email M1 |
| Hướng dẫn email | Thông báo đã gửi email hoàn tất tiếp nhận (kèm số tiếp nhận) đến **cả người đăng ký và người phụ trách chính** (nếu là cùng một người thì 1 email). Thông báo vận hành sẽ xác nhận nội dung và liên lạc trong 2〜3 ngày làm việc | 28-131, danh sách email M1 |
| Phỏng vấn khởi động | **Hướng dẫn URL đặt lịch phỏng vấn khởi động (`booking.receptionist.jp/kickoff-mtg-schedule/60min`) cho tất cả người đăng ký. Không hỏi trước về kinh nghiệm quản lý v.v., không phân nhánh theo câu trả lời** | Nguyên điển #17・REQ-CT-122, dòng 168 |
| Thêm cơ sở (tài khoản cơ sở) | "Cơ sở đã thêm sẽ không hiển thị với tài khoản này. Kết quả được thông báo qua email. Sau khi phê duyệt, vui lòng xem bằng tài khoản cơ sở của cơ sở mới và tài khoản doanh nghiệp" | H3＝A |
| Nút | Đến màn hình đăng nhập (không đăng nhập)／đến danh sách cơ sở (thêm cơ sở) | Biểu mẫu hiện hành R04 |

---

## 8. Báo giá (bảng bên phải) và chi tiết phí ở màn hình xác nhận

| Mục | Cách tính・hiển thị | Nguồn |
|---|---|---|
| Tạm tính gói | Giá của master gói (thế hệ giá áp dụng). Phí gói hiển thị chưa thuế | Biểu mẫu hiện hành ④ (bản nháp), 28-89 |
| Thiết bị | Tiền hàng tháng・khởi tạo (chưa thuế) của master dòng máy. Thiết bị cho thuê tiêu chuẩn miễn phí, kích cỡ lớn hơn thì chênh lệch (OP000023) | 28-89, STEP1 |
| Thêm số lần giao hàng | (số lần đã chọn − tiêu chuẩn của gói) × OP000001 (¥3,000／lần・hàng tháng) | Master đăng ký #2 |
| Tạm tính tùy chọn | Số tiền của master tùy chọn. Phí một lần được ghi là "lần đầu", không tính vào tổng hàng tháng | Master đăng ký #1 |
| Giảm giá chiến dịch (dùng thử) | **DC000013・số tiền giảm = phí gói 50・tủ lạnh・Lite (¥24,500). Không vượt quá số tiền thanh toán. 1 lần cho mỗi doanh nghiệp** (nếu nơi thanh toán là doanh nghiệp thì 1 lần vào thanh toán của doanh nghiệp・nếu theo từng cơ sở thì cơ sở đầu tiên, nếu hỗn hợp thì 1 lần vào thanh toán của doanh nghiệp). Nếu 1 cơ sở・50 Lite thì miễn phí, nếu nhiều cơ sở・đổi gói・gia hạn thời gian thì tính phần chênh lệch | Sổ cái "Giảm giá dùng thử", STEP1 |
| Tổng báo giá | Hàng tháng (chưa thuế). Chỉ cộng các cơ sở có hiển thị số tiền, ghi kèm số cơ sở báo giá riêng (ghi "(2 cơ sở)" vào tiêu đề) | Biểu mẫu hiện hành §6-5 |
| Máy bán hàng tự động | Hiển thị số tiền ước tính (phí gói＋phí hàng tháng máy bán hàng tự động＋phí ban đầu. Giá trị của master dòng máy) và nhất định kèm ghi chú [hong trả lời 2026-10-03 (A3)] | — |

- Hiển thị số tiền dạng "1,000円"・căn phải・ghi rõ (chưa thuế)／(đã gồm thuế) [danh sách vấn đề 10/03 "円"・UI].
- Khi thay đổi nhập liệu thì số tiền thay đổi ngay tại chỗ [biểu mẫu hiện hành §7 #1].
- Phần gia hạn của dùng thử không giảm giá (tính phí gói) [hong trả lời 2026-10-03 (K1)].

---

## 9. Kiểm tra nhập liệu

### 9-1. Quy tắc chung (chung cho mọi site・xác định 2026-10-03)

| Loại | Quy định | Nguồn |
|---|---|---|
| Văn bản 1 dòng | **Tối đa 60 ký tự** (tên doanh nghiệp・tên cơ sở・tên nơi giao hàng・tên người phụ trách・kana・tầng lắp đặt cũng vậy) | Sổ cái "Nhập văn bản 1 dòng", danh sách vấn đề 10/03 |
| Địa chỉ | **Tối đa 255 ký tự** (quận huyện・khu vực・số nhà・tòa nhà) | Như trên |
| Ghi chú・yêu cầu (nhiều dòng) | **Tối đa 500 ký tự** | Như trên |
| Địa chỉ email | **Tối đa 60 ký tự** (trước đây: varchar(160)) [hong trả lời 2026-10-03 (K8)] | Hợp đồng_03・04 |
| Số lượng | Theo từng loại: số máy 99／số lần・số tháng 99／số suất ăn 9,999 v.v. Số nguyên từ 0 trở lên | Danh sách vấn đề 10/03 |
| Số tiền | 0〜999,999,999. "1,000円" | Như trên |
| Ngày | yyyy-mm-dd／năm tháng yyyy-mm | Danh sách vấn đề 10/02 (8-1) |
| Đính kèm | JPG・PNG・PDF・HEIC, 5MB, 10 tệp | Danh sách vấn đề 10/03 |
| Loại ký tự | Không nhận emoji・ký tự điều khiển. Với tên・địa chỉ ghi trên hóa đơn・phiếu giao hàng, ký tự ngoài JIS cấp 1・cấp 2 vẫn nhận nhưng cảnh báo "Có thể không in đúng trên hóa đơn・phiếu giao hàng" | Danh sách vấn đề 10/03 |
| Toàn góc→bán góc | Mã bưu điện・điện thoại・FAX・email・số lượng・số tiền dù nhập toàn góc cũng được chuyển thành bán góc khi lưu | STEP3 còn lại §4 "Kiểm tra nhập liệu" |
| Khoảng trắng đầu cuối | Loại bỏ rồi mới lưu・kiểm tra | Đặc tả kiểm tra nhập liệu C3 |
| Thời điểm kiểm tra | Bấm "Tiếp" "Chuyển đến xác nhận" thì kiểm tra tất cả các mục của màn hình cùng lúc. Lỗi hiển thị khung đỏ＋câu chữ dưới mục. Chuyển đến lỗi đầu tiên. Ô trống chỉ hiển thị lỗi bắt buộc | Đặc tả kiểm tra nhập liệu C1・C2 |
| Vượt số ký tự | Lỗi (không tự động cắt bớt) | Đặc tả kiểm tra nhập liệu C5 |

**Các giá trị cũ đã được thay thế**: 120／80／50 ký tự・ghi chú 1,000 ký tự (đề xuất)・đính kèm PDF・JPEG・PNG (đề xuất) trong §3 của đặc tả kiểm tra nhập liệu đã được thay bằng quy tắc chung ở trên [sổ cái].

### 9-2. Kiểm tra định dạng

| Mục | Quy tắc | Câu chữ | Nguồn |
|---|---|---|---|
| Mã bưu điện | 7 chữ số. Có hoặc không có dấu gạch ngang đều được. Lưu có dấu gạch ngang (105-0011) | Vui lòng nhập mã bưu điện gồm 7 chữ số (có hoặc không có dấu gạch ngang đều được). | Đặc tả kiểm tra nhập liệu §2 |
| Số điện thoại | Chỉ chữ số và dấu gạch ngang. Bắt đầu bằng chữ số. Bỏ dấu gạch ngang thì 10 hoặc 11 chữ số. Tối đa 20 ký tự | Vui lòng chỉ nhập số điện thoại bằng chữ số và dấu gạch ngang. | Như trên |
| Địa chỉ email | Có ký tự trước và sau `@`, sau `@` có `.`. Tên miền không chứa ký tự toàn góc | Định dạng địa chỉ email không đúng. | Như trên |
| Katakana | Katakana toàn góc・dấu kéo dài・khoảng trắng | Vui lòng nhập [tên mục] bằng katakana toàn góc. | Như trên |
| Bắt buộc | — | Vui lòng nhập [tên mục]. (Mục chọn: "Vui lòng chọn [tên mục].") | Như trên |

---

## 10. Tiếp nhận của vận hành (Quản lý yêu cầu hợp đồng ＞ Hợp đồng mới)

### 10-1. Danh sách

| Mục | Quy định | Nguồn |
|---|---|---|
| Menu | Một mục của "Quản lý yêu cầu hợp đồng". **Badge số lượng cần xử lý** (hợp đồng mới đang tiếp nhận・đang thiết lập hợp đồng ＋ thay đổi・tạm ngưng・hủy đang chờ phê duyệt・phê duyệt một phần). Rê chuột vào hiển thị chi tiết | 28-132, trả lời xác nhận v1.73・v1.74 (A: giữ nguyên hiện tại) |
| Tab | Hợp đồng mới／thay đổi hợp đồng／tạm ngưng・hủy | Màn hình hiện tại (`lib/ops/applications/constants.ts`) |
| Trạng thái | Đang tiếp nhận／đang thiết lập hợp đồng／hoàn tất／từ chối／đã rút lại. Hàng từ chối・đã rút lại không mở màn hình tiếp nhận mà hiển thị lý do và ngày giờ | 28-63 |
| Dấu nhập thay | Đăng ký nhập thay có dấu "Nhập thay" trong danh sách. Lưu kênh tiếp nhận (điện thoại・kinh doanh・giấy v.v.) và người nhập | 28-33 |
| Thành phần | PageHeader (xuất CSV・đăng ký mới (nhập thay))＋Tabs＋SearchPanel＋Table＋Pagination. Mở bằng liên kết ID yêu cầu | 28-114 |
| Người dùng có quyền tham khảo | Các ô chỉ đọc, ẩn nút thao tác không có quyền | 28-110 |

### 10-2. Các giai đoạn của chi tiết yêu cầu (mới)

```
① Tiếp nhận (xác nhận nội dung đăng ký) ── hoàn tất xác nhận nội dung đăng ký ──▶ ② Đăng ký tạm ──▶ ③ Thiết lập thông tin chi tiết ── từng cơ sở "Xác định cơ sở này" ──▶ ④ Đăng ký chính thức (xác định)
```

| Giai đoạn | Việc vận hành làm | Thứ được tạo・hoạt động | Nguồn |
|---|---|---|---|
| ① Tiếp nhận (xác nhận nội dung đăng ký) | Tab: Nội dung yêu cầu／Thiết lập giao hàng／Lịch bắt đầu／Thông tin chung. **Ở thiết lập giao hàng, quyết định kho picking (bắt buộc) và số lần giao hàng theo từng cơ sở・loại giao hàng** (một bảng・gộp các cột cơ sở). Nếu chưa nhập kho thì tab hiển thị "Cần nhập", bấm hoàn tất xác nhận thì chuyển đến tab đó. Khi dùng thử bắt đầu từ nửa sau, chọn khung của chuyến đầu tiên (ví dụ C2) tại đây. **Xác nhận có người giới thiệu hay không (mã đại lý) và có thuộc chiến dịch chuyển từ công ty khác hay không** (chuyển từ công ty khác không tự động xác định・tải lên chứng từ là tùy chọn) | — | 28-93, 28-115, 28-145①, STEP5 T1'''', nguyên điển #21・REQ-CT-117 |
| ② Đăng ký tạm (hoàn tất xác nhận nội dung đăng ký) | Ở modal xác nhận (Dialog) kiểm tra những thứ sẽ tạo và "địa chỉ nhận email hướng dẫn đăng nhập". Ô chọn "Cấp tài khoản" (**mặc định ON**) | **Doanh nghiệp (khi mới)・cơ sở・hợp đồng cha・hợp đồng con (chu kỳ đầu tiên)・tài khoản doanh nghiệp・tài khoản cơ sở**. **Tự động tạo đơn hàng (chính thức = doanh nghiệp nhập được／dùng thử = tự động tạo) và đơn hàng vật tư (bộ khởi tạo)**. Màn hình hoàn tất xếp doanh nghiệp và tài khoản doanh nghiệp ở trên, bên dưới mỗi dòng = 1 cơ sở, xếp cơ sở・hợp đồng cha・hợp đồng con・đơn hàng・bộ khởi tạo vật tư・tài khoản cơ sở kèm ID | STEP1, 28-94・95・109, 28-145②③ |
| ③ Thiết lập thông tin chi tiết | Tab (gạch chân ngang・tối đa 6): **Doanh nghiệp／cơ sở／hợp đồng cha／hợp đồng con／thiết bị・tùy chọn／phí・thanh toán**. Tab chưa lưu có "Chưa lưu". Trước tiên hiển thị tham khảo, "Chỉnh sửa" thì thành ô nhập | — | 28-113, 28-116 |
| ④ Đăng ký chính thức (xác định cơ sở) | "Xác định cơ sở này" ở cột thao tác của hàng trong danh sách cơ sở. **Chỉ bấm được khi các mục bắt buộc đã đủ** | **Hợp đồng con・lịch dự kiến・dữ liệu giao hàng**, dữ liệu giao hàng của bộ khởi tạo vật tư. Hợp đồng cha từ đăng ký tạm → có hiệu lực, cơ sở từ đăng ký tạm → đăng ký chính thức. Nếu đăng ký tạm với tài khoản OFF thì cấp tại đây | Danh sách vấn đề 10/02 "Đăng ký tạm → đăng ký chính thức là khi vận hành xác nhận đã đủ nhập liệu", 28-109, 28-130, STEP1 |
| Hoàn tất | Khi xác định tất cả cơ sở thì đăng ký thành "Hoàn tất" | — | 28-63 |

- **Doanh nghiệp・cơ sở・hợp đồng cha・hợp đồng con đăng ký tạm được chỉnh sửa ở chi tiết yêu cầu (thiết lập thông tin chi tiết).** Ở màn hình doanh nghiệp・hợp đồng (danh sách・chi tiết) chỉ tham khảo (cột thao tác của danh sách là "Chỉnh sửa ở yêu cầu", chi tiết có "Chỉnh sửa ở chi tiết yêu cầu" và dải "Đang đăng ký tạm (yêu cầu AP-… đang thiết lập thông tin chi tiết)"). **Sau đăng ký chính thức thì chỉnh sửa ở màn hình doanh nghiệp・hợp đồng** [28-146].
- Hợp đồng đăng ký tạm không là đối tượng của bất kỳ job hằng ngày nào. Hợp đồng con・lịch dự kiến・dữ liệu giao hàng được tạo khi đăng ký chính thức [28-109 (Đặc tả tổng hợp quyết định v2.3 #52)].

### 10-3. Những thứ nhập ở thiết lập thông tin chi tiết

| Tab | Nhập gì | Nguồn |
|---|---|---|
| Doanh nghiệp | Khi là doanh nghiệp mới: "Doanh nghiệp｜Thông tin cơ bản・thanh toán": tên doanh nghiệp・furigana・tên doanh nghiệp (hợp đồng)・tên doanh nghiệp nơi thanh toán・địa chỉ ghi trên hóa đơn・điện thoại・người phụ trách của doanh nghiệp・**đơn vị phát hành**・thời gian chờ・phương thức thanh toán・trạng thái thủ tục chuyển khoản tự động (chỉ khi chuyển khoản tự động・bắt buộc)・chu kỳ thanh toán・tháng bắt đầu (chỉ khi thanh toán theo năm・bắt buộc)・ID nơi phát hành Bill One・**nhân viên kinh doanh ES (chọn từ người dùng của vận hành)**・hạn thanh toán. **Doanh nghiệp hiện có (chuyển đổi・thêm cơ sở) chỉ tham khảo**. "Thông tin thanh toán" ở bên phải màn hình tiếp nhận không hiển thị với doanh nghiệp mới | 28-61, 28-64, 28-67, 28-75, 28-92 |
| Cơ sở | Thông tin cơ bản・thanh toán (nơi thanh toán・ghi đè thời gian chờ・phương thức thanh toán・thủ tục chuyển khoản tự động・chu kỳ thanh toán・ID nơi phát hành Bill One. Bắt buộc khi nơi thanh toán = cơ sở này)・bảng người phụ trách (chỉnh sửa tại chỗ. Tên người phụ trách và email bắt buộc・từ 1 người chính trở lên)・ngày không giao hàng (tích chọn・Hai〜Chủ nhật・ngày lễ)・tòa nhà v.v.・điện thoại của người phụ trách・hạn thanh toán・tháng bắt đầu・tài liệu (**tự động lưu**) | 28-61, 28-75, 28-82, 28-92 |
| Hợp đồng cha | Loại hợp đồng・**tháng chu kỳ bắt đầu** (ví dụ: tháng 10 năm 2026 (A1 2026/09/28)). Ngày bắt đầu hợp đồng là tham khảo tự động nhập A1. **Không thiết lập thời gian sử dụng tối thiểu ở hợp đồng** (master dòng máy・theo từng thiết bị) | 28-70, 28-34 |
| Hợp đồng con | Gói・course・**lộ trình giao hàng** (theo từng loại giao hàng: kho picking・công ty vận chuyển・công ty giao hàng・trung chuyển 1・thời gian chờ・mẫu giao hàng・chu kỳ giao hàng)・**ngày giao bộ khởi tạo vật tư (bắt buộc)**・thiết lập sử dụng app (tháng chu kỳ này)・số tiền doanh nghiệp chịu (áp dụng phúc lợi)・điều chỉnh giá (tháng chu kỳ này) | 28-77, 28-144②ⅺ, 28-145①④, 28-134 |
| Thiết bị・Tùy chọn | Biến động thiết bị (thiết bị của đăng ký được đưa vào dòng ngay từ đầu. Có thể "Thêm dòng" "Xóa". Cột tiền hàng tháng・khởi tạo (chưa thuế))・biến động tùy chọn・giảm giá (có dấu: ＋thanh toán／−giảm giá)・ngày mong muốn vận chuyển vào・ngày dự kiến lắp đặt (1 ô). Tùy chọn loại A (ES-QR・thêm số lần giao hàng v.v.) không đưa vào bảng biến động mà tự động xuất hiện ở ① của hợp đồng con | 28-74, 28-87, 28-89, 28-91, 28-43 |
| Phí・thanh toán | Tham khảo: ① bảng số tiền cố định・chi tiết (khởi tạo／hàng tháng／một lần／giảm giá). **② Không hiển thị quyết toán thực tế** (hợp đồng con đầu tiên xuất hiện sau kiểm kê) | 28-90 |

**Quy định về lộ trình giao hàng (tab hợp đồng con)**

| Mục | Quy định | Nguồn |
|---|---|---|
| Công ty vận chuyển (công ty giao hàng ①)・công ty giao (công ty giao hàng ②) | **Cả ① và ② luôn bắt buộc.** Khi không trung chuyển thì nhập cùng một công ty vào cả hai | Sổ cái "Thiết lập giao hàng của hợp đồng con" (10/03. Thay thế "② chỉ khi có trung chuyển" của 28-84・28-144ⅺ) |
| Trung chuyển 1 | Chọn rõ "Không" (mặc định "Không"・bắt buộc) | Sổ cái |
| Lựa chọn | Toàn bộ master công ty giao hàng (công ty vận chuyển・công ty giao hàng ủy thác・chuyến của công ty) theo từng phân loại. Trung chuyển 1 là toàn bộ trung chuyển (HU) của master kho | 28-83 |
| Giá trị mặc định | Điền giá trị mặc định theo kho bằng "Điền giá trị mặc định của khu vực" rồi sửa | 28-77 |
| Mẫu giao hàng | Tủ lạnh・tủ đông bắt đầu bằng chu kỳ ES (vật tư giao theo từng lần) | 28-88 |
| Chu kỳ giao hàng | Bấm vào bảng tuần A〜D×Hai〜Chủ nhật để chọn theo số lần giao hàng (không chọn vượt quá số lần・**không chọn được cột ngày không giao hàng**). Special là ngày 1〜28／cuối tháng | 28-81, 28-86 |
| Số lần giao hàng | Số lần đăng ký là giá trị ban đầu・vận hành sửa được. Phần tổng vượt tiêu chuẩn của gói thì OP000001 tự động xuất hiện ở ① của hợp đồng con. Dưới bảng có "Tổng／tiêu chuẩn của gói／số lần thêm và tiền hàng tháng" | 28-85 |
| Đổi kho・số lần giao hàng sau đăng ký tạm | Sửa được nhưng hiển thị "ảnh hưởng đến đơn hàng・bộ khởi tạo vật tư đã tạo", vận hành xem lại đơn hàng | 28-100 |
| Sau khi xác định | Lộ trình giao hàng chỉ tham khảo. Khi sửa thì ở màn hình cơ sở | 28-79 |

### 10-4. Đơn hàng・bộ khởi tạo vật tư (thứ được tạo khi đăng ký tạm)

| Mục | Chính thức | Dùng thử | Nguồn |
|---|---|---|---|
| Đơn hàng | Khi cấp tài khoản thì **doanh nghiệp đặt hàng (đăng ký số lượng) được**. Dù không có tài khoản cơ sở, nếu đã có tài khoản doanh nghiệp thì doanh nghiệp đặt hàng được. Nếu không có cả hai thì đến hạn chót lấy số lượng tiêu chuẩn (giống chưa đặt hàng). **Nhập được trong thời gian đặt hàng của tháng chu kỳ bắt đầu** | **Tự động tạo**. **Chia tỷ lệ** giới hạn cung cấp hàng tháng của gói **cho toàn bộ sản phẩm** (chênh lệch theo nhiệt độ・chuyến tối đa ±1, phần lẻ từ chuyến giao đầu tiên). **Doanh nghiệp không sửa được (chỉ hiển thị tham khảo)**. Vận hành **đến ngày chốt đặt hàng** có thể tinh chỉnh cả số lượng lẫn sản phẩm | 28-94・95・97・98・101・102・105, STEP5 QC・T2・T5 |
| Bộ khởi tạo vật tư | "Số lượng bộ khởi tạo" của master vật tư (vật tư × gói). **Miễn phí**. Tại thời điểm đăng ký tạm sao chép số lượng của master vào đơn hàng (sau đó sửa master cũng không đổi). Ngày giao ở tab hợp đồng con của thiết lập thông tin chi tiết (bắt buộc). Dữ liệu giao hàng được tạo khi đăng ký chính thức. **Bộ khởi tạo không tính vào số lần đặt vật tư mỗi tháng 1 lần** | Như bên trái | 28-106〜108, 28-129・130, 28-145①, 28-168, STEP5 (OP000036) |
| Khi từ chối・rút lại | **Hủy** đơn hàng・bộ khởi tạo vật tư đã tạo | Như bên trái | 28-99 |

### 10-5. Tháng chu kỳ bắt đầu và hạn chót đặt hàng

| Tình huống | Quy định | Nguồn |
|---|---|---|
| Tháng bắt đầu khách chọn được | Đăng ký trước hạn chót (mặc định ngày 15 tháng trước) từ tháng sau trở đi, đăng ký sau hạn chót từ tháng sau nữa trở đi | Dòng 159, REQ-CT-225・257 |
| Màn hình tiếp nhận | Hiển thị "Còn ○ ngày đến hạn chót" | 28-27 |
| Khi hoàn tất xác nhận nội dung đăng ký đã quá hạn chót đặt hàng của chu kỳ đó | Khi phê duyệt sau hạn chót, vận hành chọn "Dời sang chu kỳ sau" hoặc "Vận hành đặt hàng thay" (STEP1・T5 E-7'. Không dùng tự động dời của 28-27) [hong trả lời 2026-10-03 (A1＝A)] | — |
| Khi thanh toán lần đầu không kịp xác định ngày 25 | Ghi gộp 2 tháng vào hóa đơn kế tiếp (lần đầu) | `Quyết_định_STEP3_Bổ_sung_Quy_tắc_thanh_toán_20261001.md` P3 |
| Đơn hàng tăng do đăng ký phê duyệt sau hạn chót | Đặt hàng bổ sung (nếu kịp B7 thì từ nửa đầu của chu kỳ sau, nếu D7 thì từ nửa sau) | `Quyết_định_STEP6_Trả_lời_Đặt_hàng_Nhà_cung_cấp_20261001.md` Q5, `Quyết_định_Xác_nhận_tài_liệu_giải_thích_kịch_bản_20261002.md` ① |

### 10-6. Cấp tài khoản

| Mục | Quy định | Nguồn |
|---|---|---|
| Khi nào | **Khi đăng ký tạm** (ô "Cấp tài khoản"・mặc định ON). Nếu OFF thì khi đăng ký chính thức | STEP1, 28-145② |
| Cấp gì | **Tài khoản doanh nghiệp (1 cho mỗi doanh nghiệp) và tài khoản cơ sở (mỗi cơ sở)**. Đăng nhập là tài khoản dùng chung | 28-145②, Web Doanh nghiệp §1 |
| Dùng được từ khi nào | Có hiệu lực trước ngày bắt đầu đặt hàng của chu kỳ đầu tiên (đặt hàng・thiết lập được) | Hợp đồng_01 §6-3 |
| Địa chỉ nhận email hướng dẫn đăng nhập | **Tất cả người phụ trách chính・phụ・thanh toán** của từng doanh nghiệp・cơ sở. Nếu người đăng ký không nằm trong người phụ trách thì gửi cả cho người đăng ký. Cùng một tài khoản mà 1 người có nhiều phân loại thì 1 email. Nếu ID đăng nhập khác thì gửi riêng | 28-139, 28-145② |
| Nội dung | Email No.2 của Giai đoạn 1 (ID đăng nhập・mật khẩu ban đầu・"Sau lần đăng nhập đầu tiên nhất định phải đổi mật khẩu") | S (§1 đính chính), danh sách email M2 |
| Gửi lại | "Gửi lại email hướng dẫn đăng nhập" từ chi tiết yêu cầu (cùng địa chỉ nhận) | 28-139 |
| Cách giữ hiệu lực・tạm dừng | Giữ ở chính tài khoản (không quyết định từ trạng thái hợp đồng) | TL-5, Hợp đồng_01 §6-3 |

### 10-7. Từ chối・rút lại

| Mục | Quy định | Nguồn |
|---|---|---|
| Từ chối | "Từ chối" (outline negative) ở màn hình tiếp nhận (xác nhận nội dung đăng ký). **Bắt buộc lý do** (lựa chọn định sẵn＋tự do ghi). Thông báo cho doanh nghiệp. Không tạo trả lại (muốn sửa thì đăng ký lại) | 28-25, 28-63, 28-111 |
| Rút lại | Việc rút lại đăng ký mới được biểu thị bằng trạng thái "Đã rút lại" | 28-63 |
| Xử lý những thứ đã tạo | Khi từ chối・rút lại sau đăng ký tạm thì hủy đơn hàng・bộ khởi tạo vật tư đã tạo (28-99). **Đồng thời tự động: cơ sở・hợp đồng cha・hợp đồng con = "Hủy bỏ"** (không xóa. Mặc định không hiển thị trong danh sách, xem được bằng lọc), **tài khoản doanh nghiệp・cơ sở = tạm dừng**, **doanh nghiệp mới tạo bởi đăng ký này = "Hủy bỏ"** (doanh nghiệp hiện có của "Thêm cơ sở" giữ nguyên) | 28-99 [hong trả lời 2026-10-03 (A12＝A)] |

### 10-8. Nhập thay・CSV hàng loạt

| Mục | Quy định | Nguồn |
|---|---|---|
| Lối vào | Chỉ "Đăng ký mới (nhập thay)" ở tab "Hợp đồng mới" của Quản lý yêu cầu hợp đồng | 28-33 |
| Nhập liệu | Cùng mục・cùng kiểm tra với Web Doanh nghiệp＋các mục chỉ của vận hành (**kênh tiếp nhận (bắt buộc)**・người nhập・nhân viên kinh doanh ES・loại hợp đồng (chính thức／dùng thử／chuyển đổi)・số tháng dùng thử・có cấp tài khoản hay không v.v.) | 28-33, đặc tả kiểm tra nhập liệu §5 |
| Sau khi đăng ký | Cùng luồng từ tiếp nhận (xác nhận nội dung đăng ký) | 28-33 |
| CSV hàng loạt | **Có** (tạo hàng loạt đăng ký mới). Nhập gồm 2 giai đoạn (kiểm tra→đăng ký), nếu có lỗi thì không đăng ký gì cả | Danh sách vấn đề 10/03, `Định_nghĩa_nhập_xuất_CSV_20261003.md` (quy tắc nhập chung). Các cột ở 10-8-1 dưới đây [hong trả lời 2026-10-03 (A11＝A)] |

---

#### 10-8-1. Nhập CSV đăng ký mới (vận hành・đăng ký hàng loạt nhập thay) [hong trả lời 2026-10-03 (A11＝A)]

| Mục | Quy định |
|---|---|
| 1 dòng | **1 dòng = 1 cơ sở (hợp đồng)**. Các dòng có cùng "khóa doanh nghiệp" được gom thành **một đăng ký** (các mục của doanh nghiệp dùng dòng đầu tiên của khóa doanh nghiệp đó. Nếu khác nhau giữa các dòng thì là lỗi) |
| Sau khi đăng ký | Mỗi đăng ký ở trạng thái **đang tiếp nhận** (trước khi xác nhận nội dung đăng ký). **Sau đó cùng luồng với đăng ký đến từ màn hình** (xác nhận nội dung đăng ký → đăng ký tạm → thiết lập thông tin chi tiết → đăng ký chính thức). Không đưa trực tiếp từ CSV thành đăng ký tạm・đăng ký chính thức |
| Quy tắc nhập | Nhập chung cho tất cả site (2 giai đoạn: kiểm tra→đăng ký, nếu có dù chỉ 1 lỗi thì không đăng ký gì cả, tối đa 5,000 dòng, lịch sử nhập). Kiểm tra giống nhập liệu trên màn hình (§9) |
| Không nhập được | Tệp đính kèm (lộ trình vận chuyển vào v.v.) không nhập bằng CSV. Đính kèm ở chi tiết yêu cầu sau khi đăng ký |

| Cột | Bắt buộc | Quy định |
|---|---|---|
| Khóa doanh nghiệp | ○ | Dấu hiệu để gom vào cùng một đăng ký (ký tự tùy ý chỉ dùng trong CSV. Ví dụ `A`) |
| Kênh tiếp nhận | ○ | Mục chỉ của vận hành (§10-8) |
| Nhân viên kinh doanh ES | — | Tài khoản vận hành (ID) |
| Loại hợp đồng | ○ | Chính thức／dùng thử |
| Số tháng dùng thử | △ | Bắt buộc khi dùng thử |
| Có cấp tài khoản hay không | ○ | 1＝cấp／0＝không cấp |
| Tên doanh nghiệp・furigana tên doanh nghiệp・tên doanh nghiệp nơi thanh toán | ○ | §5-1 |
| Mã bưu điện・tỉnh thành・quận huyện〜số nhà・tòa nhà của doanh nghiệp | ○ (tòa nhà tùy chọn) | §5-1 |
| Số điện thoại・số FAX của doanh nghiệp | ○／— | §9-2 |
| Phương thức thanh toán・chu kỳ thanh toán・thời điểm phát hành hóa đơn của doanh nghiệp | ○ | §5-1 |
| Người phụ trách chính của doanh nghiệp (tên・furigana・email・điện thoại) | ○ | §5-2 |
| Người phụ trách thanh toán của doanh nghiệp (tên・furigana・email・điện thoại) | — | Nếu trống thì giống người phụ trách chính |
| Người đăng ký | ○ | Một trong các email của người phụ trách doanh nghiệp・người phụ trách cơ sở (A2: chọn từ người phụ trách) |
| Loại thiết bị | ○ | Tủ lạnh・tủ đông／máy bán hàng tự động |
| Gói (số món ES Food)・course | ○ | Giá trị đang công khai của master gói |
| Phương thức giao hàng・số lần giao hàng (tháng) | ○ | §4-2 (máy bán hàng tự động là giao hàng ES) |
| Tháng mong muốn bắt đầu hợp đồng | ○ (chính thức) | `yyyy-mm` |
| Tầng lắp đặt | △ | Bắt buộc với máy bán hàng tự động (A8) |
| Tùy chọn | — | Nối mã tùy chọn bằng `;` (chỉ những mục có thể hiển thị khi đăng ký) |
| Cách xử lý sản phẩm có hạn sử dụng ngắn・ghi chú ngoài gói | ○／— | §4-2 |
| Tên nơi giao hàng・furigana・mã bưu điện・tỉnh thành・quận huyện〜số nhà・tòa nhà・điện thoại・FAX | ○ (tòa nhà・FAX tùy chọn) | §4-5 |
| Số nhân viên ước tính・ngày không giao hàng (như `月;水`)・khi rơi vào ngày không giao hàng・nguyện vọng giao hàng | ○／—／○／— | §4-5 |
| Hóa đơn (thanh toán cho doanh nghiệp／thanh toán cho cơ sở này)・phương thức thanh toán của cơ sở・chu kỳ thanh toán | ○ | §4-6 |
| Người phụ trách chính của cơ sở (tên・furigana・email・điện thoại) | ○ | §4-7 (nếu "giống doanh nghiệp" thì có thể để trống) |

---

## 11. Chiến dịch dùng thử (sau tiếp nhận)

| Mục | Quy định | Nguồn |
|---|---|---|
| Thời gian | Mặc định 1 tháng. **Gia hạn chỉ vận hành** (tạm thời không giới hạn số lần・số tháng. Nếu kéo dài thì chuyển sang chính thức). Hiển thị thời gian dùng thử (tháng chu kỳ bắt đầu・kết thúc) và gia hạn trên Web Doanh nghiệp | Danh sách vấn đề 10/03, STEP5 T3 |
| Thời gian sử dụng tối thiểu・tiền phạt vi phạm hợp đồng | Không có | Hợp đồng_00 §0.4 |
| Hợp đồng con | Không tự động gia hạn, chỉ tạo đúng số tháng của thời gian dùng thử | Hợp đồng_00 §0.4 |
| Timeline | Lấy **ngày chốt đặt hàng (B7・D7)** làm chuẩn thay vì hạn chót đặt hàng. **Nếu kịp B7 thì từ chu kỳ sau, nếu kịp D7 thì từ nửa sau của chu kỳ sau (tuần C)**. Khi số lần giao hàng từ 2 lần trở lên mà là D7 thì từ tuần A của chu kỳ sau nữa. Chu kỳ bắt đầu từ nửa sau cũng tính là tháng thứ 1 | 28-96, STEP5 T1 (ghi đè 28-103・104)・T1'・T1'' |
| Khung của chuyến đầu tiên | Khi khung của hợp đồng ở nửa đầu (ví dụ A2) mà bắt đầu từ nửa sau, vận hành chọn khung nửa sau (ví dụ C2) ở bước xác nhận nội dung đăng ký. Từ chu kỳ sau quay lại khung của hợp đồng | STEP5 T1'''' |
| Thêm số lần giao hàng | Vận hành quyết định có chấp nhận hay không | STEP5 T1' bổ sung |
| Thanh toán | Hóa đơn dùng thử phát hành nếu phát sinh số tiền. Dù 0 yên vẫn ở trạng thái xuất được, vận hành quyết định có phát hành hay không. Không thuộc đối tượng phí đại lý | STEP1, S8 |
| Khi hết hạn mà không có đăng ký chính thức | Đặt ngày dự kiến trả lại cho thiết bị (ngày hết hạn＋1 tháng) | 28-36 |
| "Giới hạn cho doanh nghiệp sử dụng lần đầu" | Hiển thị trên màn hình. Hệ thống không xác định, vận hành xác nhận khi tiếp nhận [hong trả lời 2026-10-03 (A4)] | Biểu mẫu hiện hành §3・⑭ |

---

## 12. Chuyển đổi dùng thử → chính thức

| Mục | Quy định | Nguồn |
|---|---|---|
| Lối vào | "Chuyển đổi (dùng thử→chính thức)" trong nhập thay của vận hành. Khi cần sẽ cho phép chọn "chuyển đổi từ dùng thử" ở đăng ký mới của Web Doanh nghiệp | STEP1 |
| Hợp đồng cha | **Giữ nguyên hợp đồng cha. Không cấp số mới.** Đổi loại hợp đồng thành chính thức, thêm 1 dòng vào "lịch sử loại hợp đồng" của hợp đồng cha | Sổ cái "Dùng thử→chính thức", Hợp đồng_01 §6-1, danh sách vấn đề 10/02 "3-7" |
| Thời gian sử dụng tối thiểu | Thiết bị đặt trong lúc dùng thử được tính **từ ngày bắt đầu chính thức** | 28-17, STEP1 |
| Khi có khoảng trống | Xử lý giống tạm ngưng (không tạo giao hàng cũng không tạo hợp đồng con・đăng nhập chỉ tham khảo・thiết bị để nguyên và không thu phí). **Nếu khoảng trống vượt tổng cộng 1 năm thì không phải chuyển đổi mà là đăng ký mới** | 28-35, 28-37, STEP1. Hợp đồng cha trong khoảng trống là "Tạm ngưng sử dụng" [hong trả lời 2026-10-03 (K2)] |
| Lộ trình giao hàng | Kế thừa cái đã thiết lập ở dùng thử và hiển thị ở "hợp đồng con", vận hành xem lại | 28-80 |
| Thiết lập cơ sở | Chế độ khách v.v. được kế thừa. Gói・thiết bị vận hành có thể thiết lập lại khi chuyển đổi. Có thể chuyển đổi riêng từng cơ sở | Hợp đồng_00 §0.4 |
| Những thứ bỏ khỏi màn hình | "Phân loại gia hạn" "Lý do kết thúc dùng thử" | 28-68 |
| Khi thiết bị nhiều hơn thiết bị cho thuê tiêu chuẩn của gói chính thức | Tính chênh lệch **chỉ 1 lần** ở hóa đơn chính thức đầu tiên (số lượng・kích cỡ khác nhau cũng được. Hệ thống so sánh với thiết bị cho thuê tiêu chuẩn và đưa ra đề xuất, vận hành sửa dòng máy・số tiền). Nếu ít hơn thì không hoàn tiền | Danh sách vấn đề 10/02. ※Dùng thử là gói 50 (thấp nhất) nên gói không bị hạ [hong trả lời 2026-10-03 (K10)] |
| Đơn hàng của chu kỳ chính thức đầu tiên | Đặt hàng hàng tháng thông thường (doanh nghiệp nhập) | STEP5 QB |
| Phê duyệt chuyển đổi sau hạn chót | Xử lý sau hạn chót (giống §10-5. Vận hành chọn 1 trong 2: dời sang chu kỳ sau／đặt hàng thay [hong trả lời 2026-10-03 (A1)]) | STEP5 QB bổ sung |
| Thông báo | Email hướng dẫn chuyển đổi (M3. Mặc định ON・gửi người phụ trách cơ sở. Không gửi hướng dẫn đăng nhập) | Danh sách email M3 |

---

## 13. Thứ được tạo theo từng giai đoạn (tổng hợp)

| Giai đoạn | Doanh nghiệp・cơ sở・hợp đồng | Đơn hàng・vật tư | Giao hàng | Tài khoản・email |
|---|---|---|---|---|
| Gửi (đang tiếp nhận) | Yêu cầu (bảng yêu cầu・chi tiết yêu cầu) | — | — | M1 Hoàn tất tiếp nhận (người đăng ký＋người phụ trách chính) |
| Đăng ký tạm | Doanh nghiệp (mới)・cơ sở (đăng ký tạm)・hợp đồng cha (đăng ký tạm)・hợp đồng con (chu kỳ đầu tiên) | Đơn hàng (chính thức = doanh nghiệp nhập được／dùng thử = tự động)・bộ khởi tạo vật tư | — | Tài khoản doanh nghiệp・cơ sở (mặc định ON)・M2 Hướng dẫn đăng nhập |
| Đăng ký chính thức (theo từng cơ sở) | Cơ sở = đăng ký chính thức・hợp đồng cha = có hiệu lực | — | Hợp đồng con・lịch dự kiến・dữ liệu giao hàng・dữ liệu giao hàng của bộ khởi tạo | (Nếu OFF) tài khoản・M2 |
| Từ chối・rút lại | Đổi trạng thái yêu cầu, "Hủy bỏ" cơ sở・hợp đồng cha・hợp đồng con (cả doanh nghiệp mới) đã tạo khi đăng ký tạm | Hủy đơn hàng・bộ khởi tạo | — | Thông báo từ chối (kèm lý do) |

- Khi từ chối・rút lại sau đăng ký tạm: cơ sở・hợp đồng cha・hợp đồng con・doanh nghiệp mới tạo là "Hủy bỏ", tài khoản tạm dừng (§10-7) [hong trả lời 2026-10-03 (A12＝A)].

---

## 14. Email (liên quan đến đăng ký)

Câu chữ chuẩn nằm ở Excel (`30_Đơn_yêu_cầu/【ES STATION】システム内メッセージ管理-Message List_フェーズ2追加_20261001.xlsx`). Nơi gửi・thời điểm như dưới đây. Email của yêu cầu thay đổi ở `Đơn_yêu_cầu_và_phê_duyệt.md` §10.

| No | Email | Khi nào | Địa chỉ nhận | Nguồn |
|---|---|---|---|---|
| M1 | Đăng ký mới: Hoàn tất tiếp nhận (số tiếp nhận) | Khi tiếp nhận qua Web Doanh nghiệp (không đăng nhập・thêm cơ sở)・nhập thay | Người đăng ký＋người phụ trách chính (nếu là cùng một người thì 1 email. Với thêm cơ sở là tài khoản đang đăng nhập) | 28-131, danh sách email M1 |
| M2 | Hướng dẫn đăng nhập | Khi cấp tài khoản (đăng ký tạm・mặc định ON／nếu OFF thì đăng ký chính thức) | Tất cả người phụ trách chính・phụ・thanh toán của doanh nghiệp・cơ sở＋(nếu chưa có) người đăng ký | 28-139・145 |
| M3 | Hướng dẫn chuyển sang chính thức | Khi đăng ký tạm việc chuyển đổi (mặc định ON) | Người phụ trách của cơ sở | Danh sách email M3 |
| — | Từ chối | Khi từ chối đăng ký mới | Người đăng ký (câu chữ theo M6) | 28-25 |

- Người gửi・phần đầu tiêu đề (【ES Station】)・lời mở đầu・chữ ký giống Giai đoạn 1. Không đính kèm. Email hướng dẫn dùng thử không gửi từ ES mà là email tự động của HubSpot [danh sách email §0].

---

## 15. Phi chức năng

| No | Yêu cầu | Góc nhìn kiểm thử | Nguồn |
|---|---|---|---|
| NF-1 | Nhập được dù đổi cỡ chữ của trình duyệt | Với cỡ chữ lớn nhất, nhập・gửi được từ bước 1〜3 đến hoàn tất. Không chồng・không bị cắt | Dòng 95 |
| NF-2 | Nhập được dù zoom 200% | Với 200% (PC・điện thoại), thao tác được toàn bộ các bước, bảng báo giá・bảng xác nhận・đến hoàn tất | Dòng 95 |

---

## 16. Khác biệt so với triển khai hiện tại (tham khảo・phạm vi đã đọc code ngày 2026-10-03)

| Màn hình | Khác biệt | Căn cứ |
|---|---|---|
| Web Doanh nghiệp: Đăng ký mới (`app/corp/apply`) màn hình hoàn tất | (Đã giải quyết 2026-10-03・sổ tiếp nhận No.9) Màn hình hoàn tất cung cấp URL đặt lịch phỏng vấn khởi động cho tất cả mọi người. Email tiếp nhận M1 chỉ tạo câu chữ (không gửi thật・2026-10-05) | §7 (nguyên điển #17・dòng 168) |
| Như trên: Người đăng ký | Ở màn hình xác nhận dạng "chọn từ người phụ trách" → **giữ nguyên như vậy** (A2 quyết định "chọn từ người phụ trách") | §5-3 |
| Như trên: Đồng ý dùng thử | (Đã giải quyết 2026-10-03・sổ tiếp nhận No.23) Đồng ý 3 điều khoản bằng 1 ô chọn | §6 |
| Như trên: Máy bán hàng tự động | (Đã giải quyết・sổ tiếp nhận No.22) Đưa số tiền ước tính (phí gói＋phí hàng tháng máy bán hàng tự động) vào tổng và kèm ghi chú. Phí ban đầu là một dòng một lần | §8 |
| Vận hành: Tiếp nhận (`app/ops/applications`) | Hiển thị 2 lựa chọn khi phê duyệt sau hạn chót | §10-5 (A1: giữ nguyên) |

---

## 17. Cần xác nhận (2026-10-03) → Ghi chép trả lời

hong đã trả lời vào 2026-10-03〜05. **Các quyết định đang có hiệu lực nằm ở `docs/決定台帳.md`**. Nội dung đã được sửa theo câu trả lời.

| No | Nội dung | Trả lời |
|---|---|---|
| A1 | Tháng bắt đầu khi phê duyệt sau hạn chót | Vận hành chọn 1 trong 2 (dời sang chu kỳ sau／đặt hàng thay) |
| A2 | Người đăng ký chưa đăng nhập | Chọn 1 người từ người phụ trách (thay đổi 28-117) |
| A3 | Báo giá máy bán hàng tự động | Số tiền ước tính＋ghi chú (thay đổi "báo giá riêng" của dòng 77. Thông báo cho khách hàng 1003-13) |
| A4 | Xác định dùng thử 1 lần cho mỗi doanh nghiệp | Hệ thống không xác định. Vận hành xác nhận khi tiếp nhận |
| A5 | Đồng ý khi dùng thử | 3 điều khoản: Điều khoản sử dụng・Chính sách bảo mật・Điều khoản chiến dịch |
| A7 | Có cho chọn ES-QR khi đăng ký không | Không cho chọn (vận hành gắn) |
| A8 | Tầng lắp đặt | Hiển thị ở mọi cơ sở. Máy bán hàng tự động bắt buộc・tủ lạnh tùy chọn |
| A9 | Sự trùng lặp của 4 tùy chọn liên quan lắp đặt | **Đang xác nhận với khách hàng** (`議事録/_OPEN一覧.md` 1003-10) |
| A11 | CSV hàng loạt | Tách CSV đăng ký mới (§10-8-1) và CSV di chuyển khách hiện có (Hợp đồng_01 §9-1) |
| A12 | Từ chối・rút lại sau đăng ký tạm | "Hủy bỏ" cơ sở・hợp đồng・doanh nghiệp mới, tạm dừng tài khoản |

**Những điều chưa quyết định**

| No | Nội dung | Lựa chọn |
|---|---|---|
| ~~A5-2~~ | ~~Thứ tự nhập~~ → **Đã trả lời 2026-10-05: giữ như hiện tại** (gói＋nơi giao hàng → thông tin doanh nghiệp) | — |
