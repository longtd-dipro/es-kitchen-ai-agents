> **Đã đóng băng (bản gốc) 2026-10-03: từ nay không cập nhật.** Chuẩn của form đăng ký là `20_Doanh_nghiệp_Cơ_sở_Hợp_đồng/Form_đăng_ký.md`. Các quyết định đang có hiệu lực xem `docs/決定台帳.md`.

# Tổng hợp form đăng ký của doanh nghiệp v2 (4 điểm đã chốt + đề xuất luồng cho máy bán hàng tự động)

Cập nhật: 2026/09/18　／　**Thay thế v1 (2026/09/18)** (v1 chuyển vào `99_過去/`)
Bổ sung: 2026/09/30　Phản ánh phản hồi của bảng yêu cầu ESS mới (Phase2) (dòng 95 cỡ chữ・zoom／dòng 156 lắp đặt hộ／dòng 168 đặt lịch họp kickoff) 〔Quyết_định_Trả_lời_phản_ánh_một_phần_bảng_yêu_cầu_20260930〕
Đối tượng: `00_確認してほしい/お客様資料/法人申し込むフォーム/` (4 tờ hiện hành) và `旧/` (8 tờ)

---

## 0. Cách đọc tài liệu này

- **§1〜§4** … Phần đọc được từ form hiện hành và form cũ (nội dung giống v1)
- **§5** … **4 phản hồi nhận được lần này (đã chốt)**
- **§6** … **Đề xuất luồng cho máy bán hàng tự động** (nội dung được yêu cầu xem xét)
- **§7** … Các điểm cần sửa ở demo (15 mục)
- **§8** … Các điểm còn cần xác nhận
- **§10** … Yêu cầu phi chức năng (bổ sung 2026/09/30)

---

## 1. Bản đồ các tệp

| Tệp | Màn hình gì |
|---|---|
| `Login.png` | Đăng nhập |
| `R01.png` | **Bước 1** Chọn gói・tùy chọn mong muốn |
| `R02.png` | **Bước 2** Thiết lập thông tin chung (thông tin doanh nghiệp・thông tin người phụ trách) |
| `R03：お申し込み内容の確認（コンパクト版）.png` | **Bước 3** Xác nhận (**hàng = hạng mục／cột = cơ sở** + chi tiết phí báo giá) |
| `R04_Done.png` | Hoàn tất (modal) + link đặt lịch họp (2026/09/30: thông báo URL đặt lịch họp kickoff cho tất cả mọi người 〔bảng yêu cầu dòng 168〕) |
| `旧/R01_お客様区分の選択…` | Cũ　Khách hàng mới／Khách hàng đã có tài khoản |
| `旧/R02_お試しキャンペーン…` | Cũ　**Khi chọn chiến dịch dùng thử** |
| `旧/R03_New contract_ES.png` | Cũ　**Triển khai mới + thiết bị tiêu chuẩn (tủ lạnh・tủ đông)** |
| `旧/R03_New contract_Cool.png` | Cũ　Triển khai mới (chuyến COOL) |
| `旧/R03_New contract_Vending machine.png` | Cũ　**Triển khai mới + máy bán hàng tự động** |
| `旧/R04_Company info.png` | Cũ　Thông tin doanh nghiệp |
| `旧/R05_Location Information.png` | Cũ　Thông tin nơi giao hàng (**có checkbox "Thông tin địa chỉ giống doanh nghiệp" "Thông tin người phụ trách giống doanh nghiệp"**) |
| `旧/R06_Confirm_trial.png` | Cũ　Xác nhận (ví dụ dùng thử) |
| `旧/R07_Done.png` | Cũ　Hoàn tất |

---

## 2. Cấu trúc form hiện hành (R01〜R04)

```
新規契約申込 (Đăng ký hợp đồng mới)
  ┌ Bạn đã có tài khoản chưa? → [Đến màn hình đăng nhập]
  1 Chọn gói・tùy chọn mong muốn  ← Nhập theo từng hợp đồng (cơ sở). Đây là phần chính
  2 Thiết lập thông tin chung     ← Thông tin doanh nghiệp・thông tin người phụ trách
  3 Xác nhận nội dung đăng ký     ← Ma trận hàng = hạng mục／cột = cơ sở + chi tiết báo giá
  → Hoàn tất (modal) + URL đặt lịch họp kickoff (thông báo cho tất cả mọi người) (2026/09/30 thay đổi. Cũ: link đặt lịch họp〔bảng yêu cầu dòng 168〕)
```

### Bước 1 (R01)

- **Nút chuyển loại hợp đồng**　`Triển khai mới thông thường` ／ `Chiến dịch dùng thử`
- **Danh sách hợp đồng**　Xếp gói mong muốn 1・2・3 dưới dạng chip, mỗi chip có `×` và **`Nhân bản`**, bên dưới là `＋ Thêm hợp đồng`
- Theo từng gói mong muốn (accordion)

| Phân loại | Hạng mục |
|---|---|
| Hợp đồng | Số món ES (gói)＊／Course／Phương thức giao hàng／Số lần giao hàng／Ghi chú ngoài gói |
| Tùy chọn (thiết bị) | Tủ lạnh 84L (khoảng 150 món・W474×D500×H857mm)／Lò vi sóng (khoảng 1 cái)… **＋／− số lượng**, `＋ Thêm thiết bị` |
| Tùy chọn khác | Dịch vụ hỗ trợ lắp đặt ban đầu (giao hàng lắp đặt miễn phí + cài đặt ban đầu)／Tùy chọn bổ sung vật tư định kỳ (+1,500 yên)／Dịch vụ chỉ định khung giờ giao hàng (+2,000 yên)／Dịch vụ cung cấp báo cáo vận hành hàng tháng (+1,000 yên)／**Lắp đặt hộ (lắp đặt hộ tủ lạnh・`OP000007`・phí một lần)** (2026/09/30 bổ sung 〔bảng yêu cầu dòng 156〕) |
| Thông tin nơi giao hàng | Tên nơi giao hàng＊・Kana＊／Mã bưu điện＊／Tỉnh/thành phố＊／Quận/huyện/thành phố＊／Khu vực・số nhà＊／Tòa nhà・số phòng／Số điện thoại＊／Số FAX／Số nhân viên ước tính＊／**Hóa đơn (gửi nơi giao hàng／gửi doanh nghiệp)**／**Phương thức thanh toán (thanh toán thẻ tín dụng／chuyển khoản tự động／chuyển khoản)**／Ngày trong tuần không giao được (T2〜CN + **ngày lễ**)／Khi không giao được (đẩy sớm lên／lùi lại)／**Lộ trình vận chuyển vào・tài liệu đính kèm** (JPG・PNG・PDF tối đa 5MB／tối đa 10 tệp) |

- **Thanh bên phải**　Tổng quan gói (gói mong muốn／Course／số người sử dụng ước tính／phương thức giao hàng／hộp vật tư／thiết bị) + Chi tiết thanh toán (tạm tính gói／tạm tính tùy chọn／giảm giá chiến dịch／**tổng báo giá yên/tháng**)

### Bước 2 (R02)

- **Sao chép từ thông tin nơi giao hàng (cơ sở)** (mã bưu điện・địa chỉ・số điện thoại. * Không sao chép tên doanh nghiệp)
- Tên doanh nghiệp＊・Kana＊／Mã bưu điện＊／Tỉnh/thành phố＊／Quận/huyện/thành phố＊／Khu vực・số nhà＊／Tòa nhà・số phòng／Số điện thoại＊／Số FAX／Phương thức thanh toán＊
- Thông tin người phụ trách (bảng): Người phụ trách theo nơi giao hàng／Loại người phụ trách＊／Tên người phụ trách＊／Furigana＊／Địa chỉ email＊／TEL／Xóa／`Thêm hàng`

### Bước 3 (R03)

- **Chi tiết phí báo giá (chưa gồm thuế)**: Tổng gói cơ bản (3 cơ sở) ¥39,000／Thuê thêm lò vi sóng ¥5,000／Gói giao hàng lắp đặt ban đầu ¥7,800 → **Tổng phí cơ bản hàng tháng ¥51,800/tháng**
- **Danh sách gói hợp đồng・nơi giao hàng・tài liệu đính kèm** = **hàng = hạng mục／cột = cơ sở** (loại hợp đồng／loại thiết bị／gói mong muốn／Course／bắt đầu hợp đồng／thời hạn hợp đồng／tủ lạnh kèm theo／hộp vật tư／lò vi sóng／thêm tủ đông／tùy chọn giao hàng bổ sung／tổng phí gói → thông tin nơi giao hàng → tài liệu đính kèm・ghi chú)
- Thông tin doanh nghiệp・người phụ trách, đồng ý điều khoản sử dụng, `Đăng ký`, ở góc trên bên phải mỗi khối có `Chỉnh sửa`

### Hoàn tất (R04)

Modal. Hướng dẫn email đã tiếp nhận + **URL đặt lịch họp kickoff** (`booking.receptionist.jp/kickoff-mtg-schedule/60min`) được **thông báo cho tất cả những người đã đăng ký**. Không đặt câu hỏi về kinh nghiệm quản lý, v.v., không phân nhánh hiển thị theo câu trả lời + `Đến màn hình đăng nhập` (2026/09/30 thay đổi. Cũ: **link đặt lịch họp** (1 giờ・dành riêng cho doanh nghiệp đang cân nhắc triển khai) 〔bảng yêu cầu dòng 168・Quyết_định_Trả_lời_phản_ánh_một_phần_bảng_yêu_cầu_20260930〕).

---

## 3. Khác biệt giữa Chiến dịch dùng thử và Triển khai chính thức (đọc từ bản cũ)

| | **Chiến dịch dùng thử** | **Triển khai mới (triển khai chính thức)** |
|---|---|---|
| Mô tả | Chỉ dành cho doanh nghiệp dùng lần đầu・**1 tháng** | Sử dụng liên tục |
| **Chọn loại thiết bị** | **Không hiển thị** (cố định thiết bị tiêu chuẩn) | Chọn 1 trong 2: **thiết bị tiêu chuẩn (tủ lạnh・tủ đông)／máy bán hàng tự động** |
| **Năm tháng mong muốn bắt đầu hợp đồng** | **Không có** | **Có (bắt buộc)** |
| Phương thức giao hàng | Chuyến COOL | Bắt buộc. Chuyến giao ES có ghi chú cần tư vấn trước |
| **Tùy chọn** | 2 checkbox (không cần tủ lạnh +¥0 ／ mong muốn nhiều cơ sở +¥0) | **Bảng tùy chọn dịch vụ** (mong muốn／tên tùy chọn／nội dung mong muốn／ghi chú／phí bổ sung) |
| **Phí** | 49,500 − **giảm giá 30,000** ＝ **19,500 yên/tháng** | 49,500 yên/tháng (không giảm giá) |
| Câu đồng ý | Đồng ý với **điều khoản chiến dịch** | Đồng ý với điều khoản sử dụng・chính sách bảo mật |

---

## 4. Khác biệt giữa Thiết bị tiêu chuẩn (tủ lạnh・tủ đông) và Máy bán hàng tự động (đọc từ bản cũ)

| | **Tủ lạnh・tủ đông** | **Máy bán hàng tự động** |
|---|---|---|
| **Báo giá** | **Hiển thị số tiền** (49,500 yên/tháng) | **Báo giá riêng**　※ Người phụ trách sẽ liên hệ riêng sau |
| **Tầng lắp đặt** | Không có | **Có** |
| **Tùy chọn dịch vụ** | Đổi kích thước tủ lạnh／thêm tủ lạnh／thuê lò vi sóng／thêm hộp vật tư／thêm số lần giao hàng (**5 mục**) | Thuê lò vi sóng／thêm hộp vật tư／**đổi decal dán máy bán hàng** (**3 mục**) |
| Ghi chú | Chuyến giao ES cần tư vấn trước・phí khác nhau tùy khu vực giao hàng | Như bên trái + **có thể không đáp ứng được yêu cầu tùy theo mong muốn decal hoặc tình trạng tồn kho／có thể mất vài tháng mới xử lý được** |
| "Thiết bị" trong tổng quan gói | Tủ lạnh 45L | **Máy bán hàng tự động** |

---

## 5. Các phản hồi nhận được lần này (đã chốt)

| No | Vấn đề | **Phản hồi** | Ảnh hưởng |
|---|---|---|---|
| ① | Số cơ sở dùng thử | **Có thể đăng ký nhiều** | Checkbox "mong muốn nhiều cơ sở" của bản cũ không cần nữa. Tăng cơ sở trong danh sách hợp đồng. **Sửa demo** (hiện đang cố định 1 cơ sở) |
| ② | Luồng máy bán hàng tự động | **Chưa quyết định → muốn được đề xuất** | **Đề xuất ở §6** |
| ⑤ | Dịch vụ hỗ trợ lắp đặt ban đầu và Gói giao hàng lắp đặt ban đầu | **Là hai thứ khác nhau** | Đăng ký cả hai vào master tùy chọn. Tên dễ gây nhầm lẫn nên muốn xác nhận cách sắp xếp ở §8 |
| ⑦ | Cách quản lý người phụ trách | **Bảng người phụ trách riêng cho doanh nghiệp và cho từng cơ sở** (như danh sách hạng mục) | **Bỏ** cột "Người phụ trách theo nơi giao hàng" của form hiện hành. Thay vào đó dùng **checkbox "Thông tin người phụ trách giống doanh nghiệp"** có ở form cũ để giảm công nhập liệu |

### Hệ quả của ① (dùng thử được nhiều cơ sở)

- **Hợp đồng cha của dùng thử là 1 hợp đồng cho mỗi cơ sở** (giống triển khai chính thức). Nếu có 3 cơ sở thì có 3 hợp đồng cha.
- Cách tăng cơ sở trong danh sách hợp đồng là thao tác hoàn toàn giống với triển khai chính thức.
- Tuy nhiên vì **dùng thử là "chỉ dành cho doanh nghiệp dùng lần đầu"** nên chắc vẫn còn giới hạn **chỉ 1 lần cho mỗi doanh nghiệp** (§8 ⑭).
- Cũng cần quyết định **giảm giá chiến dịch áp dụng cho từng cơ sở hay chỉ 1 lần cho doanh nghiệp** (§8 ⑮).

### Hệ quả của ⑦ (người phụ trách theo doanh nghiệp và theo cơ sở)

```
Thông tin doanh nghiệp
  └ Bảng người phụ trách … Bắt buộc 1 người chính・1 người thanh toán

Theo từng cơ sở (gói mong muốn)
  └ □ Giống thông tin người phụ trách của doanh nghiệp   ← Khôi phục checkbox có ở form cũ
  └ Bảng người phụ trách … Bắt buộc 1 người chính
                           Khi nơi nhận hóa đơn = cơ sở này thì bắt buộc thêm 1 người thanh toán
```

- **Bỏ** "Người phụ trách theo nơi giao hàng" của form hiện hành (liên kết cơ sở trong 1 bảng).
- Thay vào đó tận dụng các checkbox **"Thông tin địa chỉ giống doanh nghiệp" "Thông tin người phụ trách giống doanh nghiệp"** của form cũ. Với khách hàng chỉ có 1 cơ sở thì thực chất chỉ cần nhập 1 lần.
- Giữ lại "**Sao chép từ thông tin nơi giao hàng (cơ sở)**" của form hiện hành (cơ sở → doanh nghiệp). Hướng ngược nhau nên có cả hai cũng được.

---

## 6. Luồng máy bán hàng tự động — Đề xuất

### 6-1. Xác nhận tiền đề trước (khớp với master dòng máy)

Master dòng máy có **5** loại dòng máy.

| Loại dòng máy | Tiền tố | Vị trí trong form đăng ký (đề xuất) |
|---|---|---|
| Tủ lạnh・tủ đông | `RF` | **Thiết bị chính** (chọn một trong hai) |
| Máy bán hàng tự động | `VM` | **Thiết bị chính** (chọn một trong hai) |
| Lò vi sóng | `MW` | Thiết bị bổ sung kèm theo (tùy chọn) |
| Máy giữ nóng (Hot warmer) | `HW` | Thiết bị bổ sung kèm theo (tùy chọn) ※ Không xuất hiện trong form cũ (§8 ⑯) |
| Hộp vật tư | `BX` | Tự động kèm theo theo gói／có thể thêm |

> **Xin phép xin lỗi và đính chính 1 điểm trước.**
> Trong demo đang làm, lò vi sóng đã dùng `VM000001`.
> Đúng ra là **`VM` = máy bán hàng tự động・`MW` = lò vi sóng**. Cả demo vận hành và demo site doanh nghiệp đều sẽ sửa (§7 #15).

### 6-2. Đề xuất: **Quay lại lựa chọn 1 trong 2 "loại thiết bị" theo từng cơ sở** (cùng dạng với form cũ)

Ở **trên cùng** của accordion gói mong muốn (= cơ sở + hợp đồng), đặt nút chuyển 2 lựa chọn.

```
Gói mong muốn 1　Trụ sở Tokyo
 ┌──────────────────────┬──────────────────────┐
 │  Tủ lạnh・tủ đông (tiêu chuẩn) │   Máy bán hàng tự động   │   ← Chuyển ở đây
 └──────────────────────┴──────────────────────┘
   Số món ES (gói)＊ / Course＊ / Phương thức giao hàng＊ / Số lần giao hàng / Năm tháng mong muốn bắt đầu hợp đồng＊
   (Chỉ khi là máy bán hàng) Tầng lắp đặt
   Ghi chú ngoài gói
   Tùy chọn (nội dung thay đổi theo loại thiết bị)
   Thông tin nơi giao hàng
```

**Lý do đề xuất phương án này**

1. **Màn hình xác nhận của form hiện hành đã có hàng "loại thiết bị".** Thiết kế đã giả định mỗi cơ sở có một giá trị, nên phía nhập liệu khớp theo đó là tự nhiên nhất.
2. **Có thể chọn thiết bị khác nhau theo từng cơ sở.** "Trụ sở dùng máy bán hàng・chi nhánh dùng tủ lạnh" làm được trong 1 lần đăng ký.
3. **Trực giao với loại hợp đồng (dùng thử／triển khai chính thức).** Nếu tăng nút chuyển loại hợp đồng lên 3 thì những thứ khác loại sẽ xếp chung một hàng, khó hiểu.
4. **Cùng dạng với form cũ** nên dễ giải thích trong nội bộ.

**Đề xuất cách gọi tên**

| | Đề xuất | Lý do |
|---|---|---|
| Tên hạng mục | **Loại thiết bị** | Vì màn hình xác nhận hiện hành dùng tên này |
| Lựa chọn | **Tủ lạnh・tủ đông** ／ **Máy bán hàng tự động** | Để **khớp với cách gọi loại dòng máy trong master dòng máy** |
| Bỏ | ~~Loại lắp đặt~~ ／ ~~Thiết bị tiêu chuẩn (tủ lạnh・tủ đông)~~ | "Loại lắp đặt" trên màn hình xác nhận không rõ chỉ cái gì, còn "thiết bị tiêu chuẩn" thì dài |

### 6-3. Danh sách những điểm thay đổi theo loại thiết bị

| | **Tủ lạnh・tủ đông** | **Máy bán hàng tự động** |
|---|---|---|
| Tầng lắp đặt | Không hiển thị | **Hiển thị (bắt buộc)** |
| Tùy chọn (thiết bị) | Tủ lạnh (kích thước・số lượng)／lò vi sóng／hộp vật tư | Máy bán hàng (số lượng)／lò vi sóng／hộp vật tư |
| Tùy chọn bổ sung | Đổi kích thước tủ lạnh／thêm tủ lạnh／thuê lò vi sóng／thêm hộp vật tư／thêm số lần giao hàng／lắp đặt hộ (`OP000007`. 2026/09/30 bổ sung 〔bảng yêu cầu dòng 156〕) | Thuê lò vi sóng／thêm hộp vật tư／**đổi decal dán máy bán hàng** |
| Báo giá ở thanh bên phải | Hiển thị số tiền | Hiển thị **"Báo giá riêng"** |
| Ghi chú | Chuyến giao ES cần tư vấn trước | ＋ **Có thể không đáp ứng được yêu cầu tùy theo mong muốn decal hoặc tình trạng tồn kho. Có thể mất vài tháng mới xử lý được.** |
| "Tổng phí gói" trên màn hình xác nhận | Số tiền | **Báo giá riêng** |
| "Loại thiết bị" trên màn hình xác nhận | Tủ lạnh・tủ đông | Máy bán hàng tự động |

### 6-4. Đề xuất: **Chiến dịch dùng thử chỉ áp dụng cho tủ lạnh・tủ đông**

Ở form cũ, khi chọn dùng thử thì lựa chọn 2 loại thiết bị cũng không hiển thị. Lý do cũng rõ ràng.

- Dùng thử là **miễn phí・1 tháng**
- Máy bán hàng tự động **tùy tình trạng tồn kho mà mất vài tháng mới xử lý được**

Thiết bị mất vài tháng không phù hợp với dùng thử 1 tháng.
Tôi nghĩ nên **khi chọn dùng thử thì ẩn nút chuyển loại thiết bị và cố định là tủ lạnh・tủ đông**.
Với khách hàng đang cân nhắc máy bán hàng, hiển thị ngay hướng dẫn "**Về máy bán hàng, vui lòng trao đổi trong buổi họp**".

### 6-5. Đề xuất: **Cách hiển thị tổng khi có báo giá riêng**

Nếu loại thiết bị khác nhau theo từng cơ sở thì sẽ lẫn lộn cơ sở tính được tổng và cơ sở không tính được.
Tôi nghĩ nên **chỉ cộng tổng các cơ sở có hiển thị số tiền, đồng thời ghi kèm số cơ sở máy bán hàng**.

**Thanh bên phải (báo giá theo từng cơ sở)**

```
Cơ sở tủ lạnh・tủ đông            Cơ sở máy bán hàng tự động
┌────────────────┐        ┌────────────────┐
│ Tạm tính gói   49,500 yên │        │ Tạm tính gói      ― yên │
│ Tạm tính tùy chọn 5,000 yên │        │ Tạm tính tùy chọn   ― yên │
│ ─────────────── │        │ ─────────────── │
│ Tổng báo giá          │        │ Tổng báo giá         │
│   54,500 yên/tháng    │        │   Báo giá riêng       │
└────────────────┘        │ ※ Người phụ trách sẽ liên hệ sau │
                                └────────────────┘
```

**Chi tiết phí báo giá trên màn hình xác nhận**

```
Chi tiết phí báo giá (chưa gồm thuế)                          Tổng phí cơ bản hàng tháng (chưa gồm thuế)
Tổng gói cơ bản (2 cơ sở)  ¥39,000                      ¥51,800 / tháng
Thuê thêm lò vi sóng       ¥5,000                  ＋ 1 cơ sở máy bán hàng tự động báo giá riêng
Gói giao hàng lắp đặt ban đầu       ¥7,800
※ Cơ sở máy bán hàng tự động (Chi nhánh Nagoya) sẽ được báo giá riêng, người phụ trách sẽ liên hệ.
```

- Ghi "**(2 cơ sở)**" vào tiêu đề tổng để **thể hiện rõ đây không phải tổng của tất cả cơ sở**.
- Trong ma trận ở màn hình xác nhận, "Tổng phí gói" của cột máy bán hàng hiển thị là **`Báo giá riêng`**.

### 6-6. Các phương án đã xem xét nhưng không chọn

| Phương án | Nội dung | Lý do không chọn |
|---|---|---|
| B | Tăng nút chuyển loại hợp đồng thành 3 (triển khai mới thông thường／dùng thử／máy bán hàng tự động) | **Loại hợp đồng** và **loại thiết bị**, hai thứ khác nhau, bị xếp chung một hàng. Cũng không biểu thị được tổ hợp dùng thử × máy bán hàng |
| C | Không đưa máy bán hàng vào form đăng ký, dẫn sang liên hệ | Dù báo giá riêng nhưng việc nhập gói・giao hàng・nơi giao hàng gần như giống tủ lạnh. Nếu tách luồng thì nhập liệu bị lặp đôi, cách tiếp nhận phía vận hành cũng bị tách |
| D | Đặt loại thiết bị là 1 giá trị cho toàn bộ đơn đăng ký (theo doanh nghiệp) | Không thể "trụ sở dùng máy bán hàng・chi nhánh dùng tủ lạnh". Cũng không khớp với dạng hiện tại khi màn hình xác nhận có loại thiết bị theo từng cơ sở |

---

## 7. Các điểm cần sửa ở demo (17 mục) (2026/09/30 thay đổi. Cũ: 15 mục)

Chỉnh `21_法人_申込フォーム.html` (site doanh nghiệp) cho gần với form hiện hành. Theo thứ tự nặng trước.

| # | Form hiện hành | Demo hiện tại | Cách sửa |
|---|---|---|---|
| **1** | Thanh bên phải có **tổng quan gói + chi tiết thanh toán (tổng báo giá yên/tháng)** | **Không có báo giá** | Hiển thị bảng báo giá ở bên phải phần nhập của từng cơ sở. Thay đổi nhập liệu thì số tiền đổi ngay tại chỗ. **Máy bán hàng là "Báo giá riêng"** (§6-5) |
| **2** | **Loại hợp đồng là nút chuyển trong 1 form** | Tách triển khai chính thức và dùng thử thành **màn hình riêng** | Gộp vào 1 màn hình dạng nút chuyển |
| **3** | **Lựa chọn 2 loại thiết bị** (form cũ) | **Không có** | **Triển khai theo đề xuất ở §6**. Nút chuyển theo từng cơ sở, tầng lắp đặt, thay đổi tùy chọn, báo giá riêng |
| **4** | Bước là **3** (＋ hoàn tất là modal) | 4 bước | Chỉnh về 3 bước + modal hoàn tất |
| **5** | Danh sách hợp đồng có **chip + nhân bản** | Chỉ thêm・xóa | Thêm **nhân bản**. Thêm cả danh sách chip |
| **6** | Thiết bị là **hàng thiết bị (± số lượng) + thêm thiết bị**, tùy chọn khác là **4 checkbox** (kèm số tiền) | Chỉ dropdown | Sửa thành dạng hàng thiết bị và tùy chọn khác |
| **7** | **Hóa đơn・phương thức thanh toán theo từng cơ sở** | Gộp ở bước doanh nghiệp | Giữ theo từng cơ sở (cũng khớp với danh sách hạng mục §0.5) |
| **8** | **Tải lên lộ trình vận chuyển vào・tài liệu đính kèm** | Không có | Thêm UI đính kèm. Hiển thị cả tên tệp ở màn hình xác nhận |
| **9** | Bước doanh nghiệp có **"Sao chép từ nơi giao hàng"** | Không có | Thêm. * Không sao chép tên doanh nghiệp |
| **10** | — | — | **Người phụ trách là bảng riêng cho doanh nghiệp và cho cơ sở** (§5 ⑦). Thêm checkbox **"Giống thông tin người phụ trách của doanh nghiệp"** cho cơ sở. Với địa chỉ cũng thêm **"Giống thông tin địa chỉ của doanh nghiệp"** |
| **11** | Hoàn tất là **modal** + link đặt lịch họp | 1 trang | Chuyển thành modal, đặt URL đặt lịch họp kickoff ở đó (thông báo cho tất cả mọi người. 2026/09/30 thay đổi. Cũ: cũng đặt link họp ở đó 〔bảng yêu cầu dòng 168〕) |
| **12** | Ngày trong tuần không giao được là **checkbox T2〜CN + ngày lễ** | Dropdown | Sửa thành checkbox. Thêm **ngày lễ** |
| **13** | Số nhân viên là **dropdown ước tính** | Nhập văn bản | Sửa thành dropdown |
| **14** | **Năm tháng** mong muốn bắt đầu hợp đồng (chỉ triển khai chính thức) | **Ngày** | Sửa thành năm tháng. Không hiển thị ở dùng thử. **Năm tháng có thể chọn được kiểm soát bằng hạn chốt đơn hàng (đăng ký trước hạn chốt chỉ chọn được từ tháng sau, đăng ký sau hạn chốt chỉ chọn được từ 2 tháng sau) (2026/09/30 bổ sung 〔bảng yêu cầu dòng 159・2026/09/30 hong〕)** |
| **15** | — | — | **`VM` = máy bán hàng tự động・`MW` = lò vi sóng**. Sửa việc demo dùng `VM000001` cho lò vi sóng thành **`MW000001`** (**7 màn hình demo vận hành cũng sai tương tự**) |
| **16** | — | Không chọn được lắp đặt hộ | Thêm **lắp đặt hộ (`OP000007`)** vào "Tùy chọn khác" của đăng ký mới. Khi chọn sẽ hiển thị ở màn hình xác nhận・chi tiết phí báo giá dưới dạng dòng **phí một lần**. Cũng chọn được ở yêu cầu thay đổi ("Yêu cầu thay đổi" ở quản lý cơ sở của Web doanh nghiệp) (2026/09/30 bổ sung 〔bảng yêu cầu dòng 156〕) |
| **17** | — | Màn hình hoàn tất hướng dẫn "Giải thích nội dung dịch vụ" | Ở modal hoàn tất, thông báo URL đặt lịch họp kickoff (`booking.receptionist.jp/kickoff-mtg-schedule/60min`) cho **tất cả mọi người**. Không đặt câu hỏi về kinh nghiệm (2026/09/30 bổ sung 〔bảng yêu cầu dòng 168〕) |

**Những chỗ đã đúng** (không cần sửa)

Màn hình xác nhận **hàng = hạng mục／cột = cơ sở**／**"Chỉnh sửa"** ở từng khối／"Bạn đã có tài khoản chưa?" ở phía trên／**có thể thêm bao nhiêu cơ sở tùy ý**／cách chia địa chỉ／quản lý người phụ trách bằng **bảng**／**ngày trong tuần không giao được・khi không giao được** theo từng cơ sở

---

## 8. Các điểm còn cần xác nhận

| No | Vấn đề | Phương án tạm dùng ở demo (bản nháp) | Điều muốn xác nhận |
|---|---|---|---|
| ③ | Tổng khi lẫn báo giá riêng | §6-5 (chỉ cộng các cơ sở tính được + ghi kèm số cơ sở máy bán hàng) | Cách hiển thị này có ổn không |
| ④ | Nguồn tính báo giá | Tạm tính gói = bảng giá plan của master gói／tạm tính tùy chọn = master tùy chọn／giảm giá chiến dịch = master giảm giá | Có đúng không. Có được trộn phí khởi tạo (1 lần) vào tổng hàng tháng không |
| ⑤ | **Dịch vụ hỗ trợ lắp đặt ban đầu và Gói giao hàng lắp đặt ban đầu** | **Khác nhau** (đã được trả lời). Bản nháp:<br>・Dịch vụ hỗ trợ lắp đặt ban đầu … **Miễn phí**. Giao hàng lắp đặt tiêu chuẩn + cài đặt ban đầu<br>・Gói giao hàng lắp đặt ban đầu … **¥7,800・1 lần cho mỗi hợp đồng**. Chi phí thực tế của vật tư và lắp đặt cho lần giao hàng đầu | **Mỗi cái gồm những gì**. Có kèm cả hai không hay chỉ một trong hai. Tên dễ nhầm nên muốn đặt tên dễ hiểu |
| ⑥ | Số tiền giảm giá của dùng thử | **Cố định** −30,000 yên | Có thay đổi theo gói không. Có quản lý bằng master giảm giá không |
| ⑧ | Thời hạn hợp đồng 12 tháng | Là **thời gian sử dụng tối thiểu** | Hiểu như vậy, tức không phải thời hạn của bản thân hợp đồng, có đúng không |
| ⑨ | Bắt đầu hợp đồng (năm tháng) và chu kỳ | Nhận theo năm tháng, **vận hành sẽ chốt ngày và A1** | Hiểu như vậy có đúng không |
| ⑩ | Cách gọi loại hợp đồng | Thống nhất là **triển khai chính thức** (sửa "hợp đồng chính thức" ở màn hình xác nhận) | Có ổn không |
| ⑪ | Cách gọi loại thiết bị | **Tủ lạnh・tủ đông／máy bán hàng tự động** (khớp với loại dòng máy. Bỏ "loại lắp đặt") | Có ổn không |
| ⑫ | Link đặt lịch họp | Đặt ở modal hoàn tất | **Đã trả lời 2026/09/30**: Ở màn hình hoàn tất thông báo URL đặt lịch họp kickoff (`booking.receptionist.jp/kickoff-mtg-schedule/60min`) cho tất cả mọi người. Không hỏi về kinh nghiệm 〔bảng yêu cầu dòng 168〕. Còn cần xác nhận có hiển thị cả **trước** khi đăng ký không (cũ: có hiển thị cả **trước** khi đăng ký không. **Xin cho biết URL**) |
| ⑬ | Nơi đặt trong công ty | Coi là **cùng một thứ** với "tầng lắp đặt" của máy bán hàng, yêu cầu nhập bất kể loại thiết bị | Có phải là hai thứ khác nhau không. Không thấy ô nhập ở R01 |
| **⑭** | **Dùng thử chỉ 1 lần cho mỗi doanh nghiệp không** | **Chỉ 1 lần** (vì chỉ dành cho doanh nghiệp dùng lần đầu). Đăng ký lần 2 sẽ báo lỗi | Có được chia cơ sở để dùng nhiều lần không. Việc xác định dựa vào ID doanh nghiệp hay tên・địa chỉ doanh nghiệp |
| **⑮** | **Giảm giá dùng thử theo từng cơ sở hay 1 lần cho doanh nghiệp** | **Áp dụng cho từng cơ sở** (3 cơ sở thì −30,000×3) | Có đúng không. Nếu chỉ 1 lần cho doanh nghiệp thì gắn vào cơ sở nào |
| **⑯** | **Form đăng ký không có Hot warmer** | Có trong master dòng máy nhưng không xuất hiện trong tùy chọn của form cũ | Hiểu rằng không chọn được khi đăng ký (vận hành gắn thêm sau) có đúng không |
| **⑰** | **Số lượng máy bán hàng** | 1 cơ sở có thể đặt **nhiều** máy bán hàng không | Nếu đặt được, có nhận cả yêu cầu về layout (số tầng・số cột) khi đăng ký không |
| **⑱** | **Lắp đặt hộ với Dịch vụ hỗ trợ lắp đặt ban đầu・Gói giao hàng lắp đặt ban đầu** (2026/09/30 bổ sung) | Thêm lắp đặt hộ (`OP000007`・phí một lần) như một tùy chọn riêng 〔bảng yêu cầu dòng 156〕 | Cần xác nhận nội dung có trùng với Dịch vụ hỗ trợ lắp đặt ban đầu (miễn phí)・Gói giao hàng lắp đặt ban đầu (¥7,800) không |

---

## 9. Cách tiến hành tiếp theo (đề xuất)

1. Nhận OK／chỉnh sửa cho **đề xuất máy bán hàng tự động ở §6**
2. Nhận trả lời cho **§8 ⑤⑭⑮** (nếu chưa quyết định cách xử lý báo giá và dùng thử thì chưa làm được)
3. Phía chúng tôi làm trước **#1〜#3 của §7** (bảng báo giá・nút chuyển loại hợp đồng・lựa chọn 2 loại thiết bị)
4. Sau khi anh/chị xem xong, sẽ sửa gộp các hạng mục chi tiết từ #4 trở đi

Vì #1〜#3 làm thay đổi khá nhiều hình dạng của form nên tôi nghĩ an toàn là **cho xem đến đó một lần** rồi mới tiến tiếp.

---

## 10. Yêu cầu phi chức năng (bổ sung 2026/09/30)

〔bảng yêu cầu dòng 95・Quyết_định_Trả_lời_phản_ánh_một_phần_bảng_yêu_cầu_20260930〕

| No | Yêu cầu | Góc nhìn kiểm thử |
|---|---|---|
| NF-1 | Form đăng ký phải nhập được kể cả khi **thay đổi cỡ chữ của trình duyệt** | Đặt cỡ chữ lớn nhất, nhập・gửi được toàn bộ hạng mục từ bước 1〜3・hoàn tất. Nhãn・ô nhập・nút không chồng lên nhau, không bị cắt |
| NF-2 | Form đăng ký phải nhập được kể cả ở **zoom 200% của trình duyệt** | Ở zoom 200% (PC・smartphone), nhập・gửi được toàn bộ hạng mục từ bước 1〜3・hoàn tất. Bảng báo giá ở thanh bên phải・ma trận ở màn hình xác nhận (hàng = hạng mục／cột = cơ sở)・modal hoàn tất cũng thao tác được |
