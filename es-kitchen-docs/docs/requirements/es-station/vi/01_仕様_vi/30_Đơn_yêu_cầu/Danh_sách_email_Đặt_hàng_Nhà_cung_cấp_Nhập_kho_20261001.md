> Bản dịch tiếng Việt của `ja/01_仕様/30_申請/メール一覧_発注・仕入先・入荷_20261001.md` (nguồn es-station, bản 2026-10-20). Khi khác nhau, bản tiếng Nhật và `docs/決定台帳.md` là chuẩn.

# Danh sách email (đặt hàng・nhà cung cấp・nhập kho) 2026/10/01【Bản đề xuất】

> Người yêu cầu: Long (Tran Duc Long)／Người soạn: Claude (Cowork). Bản đề xuất email và thông báo trên màn hình, theo các quyết định của STEP6 (`決定_STEP6回答_発注仕入先_20261001.md`・`決定_STEP6追補_OPEN回答と倉庫の入荷確認_20261001.md`).
> Tài liệu này chi tiết hóa phần 2 X9〜X11 của danh sách email đăng ký・đơn yêu cầu (`メール一覧_申込・申請_20261001.md`). **Nội dung văn bản là bản đề xuất**. 【 】 là giá trị được chèn vào.
> **2026/10/01 đã thêm vào Excel**: 「メール」 (Email) No.17〜27 (S1〜S11), 「運営管理者／法人顧客向けWEB」 (Web cho quản trị viên vận hành／khách hàng doanh nghiệp) No.77〜84 (N1〜N4・không thể sửa・giới hạn giao từng phần・lỗi và xác nhận số thùng) trong `【ES STATION】システム内メッセージ管理-Message List_フェーズ2追加_20261001.xlsx`. Script: `項目一覧_生成スクリプト/update_messages_step6_20261001.py`

| Tài liệu này | No. trong Excel 「メール」 |
|---|---|
| S1〜S11 | 17〜27 |
| N1〜N4 và các thông báo màn hình khác | WEB 77〜84 |

## 0. Quy tắc chung (giống §0 của danh sách email đăng ký・đơn yêu cầu + quyết định STEP6)

| Mục | Quy tắc | Căn cứ |
|---|---|---|
| Người gửi・tiêu đề・câu mở đầu・chữ ký | Giống giai đoạn 1 (no-reply@es-kitchen.co.jp, tiêu đề bắt đầu bằng 「【ESステーション】」, chữ ký dành cho thư chỉ gửi) | Danh sách email §0 |
| Người nhận (nhà cung cấp) | **Toàn bộ người phụ trách chính và người phụ trách phụ** trong master nhà cung cấp (1 công ty 1 tài khoản・người phụ trách là nhiều người nhận email) | Quyết định R8 |
| Đối tượng gửi | **Gửi bất kể phương thức đặt hàng** (cùng một nội dung cho cả nhà cung cấp đăng nhập ES STATION lẫn nhà cung cấp nhận qua email). Nhà cung cấp có phương thức đặt hàng = bên ngoài thì **không gửi** (vận hành chỉ ghi nhận・R3. Cũng không gửi cảnh báo chưa xử lý. hong quyết định 2026-10-05) | Quyết định C3・R3 |
| Nội dung | **Viết trong thân thư** (không đính kèm PDF đơn đặt hàng). **Không kèm liên kết để trả lời**. Chỉ ghi URL của site nhà cung cấp (màn hình đăng nhập) cho nhà cung cấp đăng nhập | Quyết định C3 |
| Địa chỉ trả lời | Vì người gửi là no-reply, ghi **địa chỉ trả lời (đầu mối đặt hàng)** trong thân thư cho nhà cung cấp trả lời qua email. Địa chỉ thì 【cần xác nhận】 | Quyết định C3 |
| Cách nhận trả lời | Nhà cung cấp đăng nhập thì trả lời trên site nhà cung cấp. Nhà cung cấp nhận qua email thì trả lời thư・gọi điện, rồi **vận hành nhập thay** (có thể nhập thay cho đơn đặt hàng của bất kỳ nhà cung cấp nào) | Quyết định C3 |
| Tên trong đơn đặt hàng | Tên sản phẩm là **tên sản phẩm khi nhập hàng** (không phải tên công khai) | Quyết định R12 |
| Số tiền | Không ghi đơn giá nhập・số tiền đặt hàng | Quyết định DR-4 |
| Nửa đầu・nửa sau | Không ghi phân đoạn chu kỳ (nửa đầu・nửa sau・A〜D). Ghi bằng ngày mong muốn nhập kho | REQ-PO-207 |

## Phần 1　Email gửi nhà cung cấp

### S1　Thông báo đặt hàng tạm
| Mục | Nội dung |
|---|---|
| Khi gửi | Khi vận hành lưu đặt hàng tạm・đặt hàng tạm hàng loạt (không gom theo từng dữ liệu đặt hàng mà gom thành **1 thư cho 1 lần thao tác**【cần xác nhận】) |
| Người nhận | Người phụ trách của nhà cung cấp (chính・phụ) |
| Căn cứ | REQ-PO-111, sheet yêu cầu 「仮発注時の確認項目」 (mục xác nhận khi đặt hàng tạm) (một câu thông báo ngừng bán, v.v.) |

Tiêu đề: 【ESステーション】Thông báo đặt hàng tạm (【số đơn đặt hàng】 và 【n】 đơn khác)
```
Kính gửi người phụ trách 【tên nhà cung cấp】

Chúng tôi xin đặt hàng tạm như dưới đây. Xin vui lòng trả lời ngày dự kiến xuất hàng (thời hạn giao).

■ Số đơn đặt hàng　：【PO-YYYYMM-品番-U01】
■ Sản phẩm　　　：【tên sản phẩm khi nhập hàng】 (mã hàng 【M000】)
■ Số lượng　　　：【số lượng】【đơn vị】
■ Ngày mong muốn nhập kho：【YYYY/MM/DD】〜【YYYY/MM/DD】
■ Kho nhận hàng　：【tên kho】 (【địa chỉ】)
(từ 2 đơn trở lên thì tiếp tục theo cùng định dạng)

■ Cách trả lời
・Quý vị sử dụng site nhà cung cấp: xin đăng nhập và trả lời từ 「発注一覧」 (danh sách đặt hàng). 【URL site nhà cung cấp】
・Quý vị trả lời qua email: xin trả lời thư này (ngày dự kiến xuất hàng・có giao từng phần hay không). Vận hành sẽ nhập thay.

※Nếu không thể nhận đơn, xin cho biết lý do và phương án thay thế (ví dụ có thể nếu dời ngày, v.v.).
※Giao từng phần: chúng tôi nhận tối đa 【3】 lần, với ngày giao của mỗi lần nằm trong phạm vi đến ngày mong muốn nhập kho đầu tiên.
※Nếu có dự định ngừng bán・thay đổi quy cách, v.v., xin thông báo kèm theo.
```

### S2　Thay đổi số lượng đặt hàng tạm (đề nghị trả lời lại)
| Mục | Nội dung |
|---|---|
| Khi gửi | Khi vận hành sửa số lượng・ngày mong muốn nhập kho của đơn đã đặt hàng tạm và lưu (quay về 「納期回答待ち」 (chờ trả lời thời hạn giao)) |
| Căn cứ | REQ-PO-304 (sửa đặt hàng tạm và thông báo lại) |

Tiêu đề: 【ESステーション】Số lượng đặt hàng tạm đã thay đổi (【số đơn đặt hàng】)
```
Nội dung đặt hàng tạm đã thay đổi. Xin vui lòng trả lời lại ngày dự kiến xuất hàng.
■ Số đơn đặt hàng：【số đơn đặt hàng】
■ Số lượng　　：【trước thay đổi】【đơn vị】 → 【sau thay đổi】【đơn vị】
■ Ngày mong muốn nhập kho：【phạm vi sau thay đổi】
(Cách trả lời giống S1)
```

### S3　Thông báo đặt hàng chính thức (đề nghị phê duyệt)〔danh sách X9〕
| Mục | Nội dung |
|---|---|
| Khi gửi | Khi vận hành đặt hàng chính thức (sau hạn chót đặt hàng) |
| Căn cứ | REQ-PO-302, quyết định Q2 (bắt buộc phê duyệt đặt hàng chính thức)・R1 (sau khi phê duyệt không đổi số lượng) |

Tiêu đề: 【ESステーション】Thông báo đặt hàng chính thức (xin vui lòng phê duyệt)
```
Đơn đặt hàng chính thức đã được xác định. Xin vui lòng trả lời ngày giao hàng (ngày hàng đến kho) và số thùng nhập kho, sau đó phê duyệt đơn đặt hàng chính thức.
Sau khi phê duyệt sẽ không thể thay đổi số lượng.

■ Số đơn đặt hàng：【số đơn đặt hàng】
■ Sản phẩm　　：【tên sản phẩm khi nhập hàng】
■ Số lượng đặt chính thức：【số lượng】【đơn vị】 (nếu thay đổi so với đặt hàng tạm: 【số lượng đặt tạm】→【số lượng đặt chính thức】)
■ Ngày dự kiến xuất hàng (đã trả lời)：【YYYY/MM/DD】
(Cách trả lời giống S1)
```

### S4　Thay đổi số lượng đặt hàng chính thức (trước phê duyệt・đề nghị phê duyệt lại)
| Mục | Nội dung |
|---|---|
| Khi gửi | Khi vận hành sửa số lượng đặt chính thức trước khi nhà cung cấp phê duyệt đơn đặt hàng chính thức |
| Căn cứ | Quyết định R1 (chỉ sửa được đến khi phê duyệt)・C1 |

Tiêu đề: 【ESステーション】Số lượng đặt hàng chính thức đã thay đổi (【số đơn đặt hàng】)
```
Số lượng đặt hàng chính thức đã thay đổi. Xin vui lòng xác nhận nội dung và phê duyệt lại đơn đặt hàng chính thức.
■ Số đơn đặt hàng：【số đơn đặt hàng】
■ Số lượng đặt chính thức：【trước thay đổi】→【sau thay đổi】【đơn vị】
```

### S5　Cảnh báo chưa xử lý đặt hàng chính thức (mỗi 24 giờ)〔danh sách X10〕
| Mục | Nội dung |
|---|---|
| Khi gửi | Kiểm tra mỗi 24 giờ kể từ khi đặt hàng chính thức (chỉ đếm ngày làm việc, theo cài đặt 「土日祝を営業日とするか」 (có coi thứ Bảy, Chủ nhật, ngày lễ là ngày làm việc không) trong master nhà cung cấp), nếu chưa được phê duyệt thì lặp lại cho đến khi được phê duyệt |
| Hiển thị cho vận hành | Hiển thị số đơn và số lần gửi ở 「仕入先からの通知」 (thông báo từ nhà cung cấp) phía trên danh sách 「発注」 (đặt hàng) của vận hành (không gửi email) |
| Căn cứ | REQ-PO-302・604, sheet yêu cầu dòng 14, quyết định Q9 |

Tiêu đề: 【ESステーション】Đơn đặt hàng chính thức chưa được phê duyệt (【số đơn đặt hàng】)
```
Việc phê duyệt đơn đặt hàng chính thức vẫn chưa hoàn tất.
■ Số đơn đặt hàng：【số đơn đặt hàng】 (đặt hàng chính thức：【YYYY/MM/DD HH:MM】)
Chúng tôi thông báo mỗi 24 giờ ngày làm việc kể từ khi đặt hàng chính thức. Sẽ lặp lại cho đến khi phê duyệt hoàn tất.
(Cách trả lời giống S1)
```

### S6　Thông báo đặt hàng bổ sung
| Mục | Nội dung |
|---|---|
| Khi gửi | Khi vận hành đặt hàng bổ sung cho phần tăng thêm sau hạn chót đặt hàng (dùng thử・đăng ký được phê duyệt sau hạn chót・phần bổ sung sau khi chốt mẫu bán hàng). Đặt hàng bổ sung được gửi như đặt hàng chính thức |
| Căn cứ | Quyết định Q5・C1, STEP5 T1 (ngày chốt đặt hàng B7・D7) |

Tiêu đề: 【ESステーション】Thông báo đặt hàng bổ sung (【số đơn đặt hàng】)
```
Chúng tôi xin đặt hàng bổ sung như dưới đây. Xin vui lòng trả lời ngày dự kiến xuất hàng, ngày giao hàng・số thùng nhập kho, sau đó phê duyệt.
■ Số đơn đặt hàng：【số đơn đặt hàng】 (đặt hàng bổ sung)
■ Sản phẩm　　：【tên sản phẩm khi nhập hàng】
■ Số lượng　　：【số lượng】【đơn vị】
■ Ngày mong muốn nhập kho：【YYYY/MM/DD】
```

### S7　Thông báo hủy đặt hàng
| Mục | Nội dung |
|---|---|
| Khi gửi | Khi vận hành hủy đơn đặt hàng (khi giảm thì hủy rồi đặt lại) |
| Căn cứ | REQ-PO-112, quyết định C1 |

Tiêu đề: 【ESステーション】Thông báo hủy đặt hàng (【số đơn đặt hàng】)
```
Chúng tôi đã hủy đơn đặt hàng dưới đây. Xin vui lòng không xuất hàng.
■ Số đơn đặt hàng：【số đơn đặt hàng】
■ Lý do　　：【lý do】
Có thể xem lịch sử từ tab 「キャンセル」 (hủy) trên site nhà cung cấp.
```

### S8　Kết quả xác nhận nhập kho (NG／ES cần xác nhận)　**Bãi bỏ: không gửi email**
| Mục | Nội dung |
|---|---|
| Cách xử lý | **Không gửi** (loại khỏi danh sách email. Cũng không đặt lựa chọn "gửi・không gửi" ở quản trị hệ thống) |
| Cách hiển thị thay thế | Nhà cung cấp xem ở bảng 「差異・不良」 (chênh lệch・lỗi) trong chi tiết đặt hàng (chỉ xem・không có số tiền). Khi cần thì ES liên lạc trực tiếp |
| Căn cứ | Sổ quyết định S (2026-10-12)・sổ tiếp nhận #534. Cũ: quyết định W4 |

### S9〜S11　Đăng ký của nhà cung cấp
| No | Email | Khi gửi・người nhận | Căn cứ |
|---|---|---|---|
| S9 | Hoàn tất tiếp nhận đăng ký giao dịch | Khi gửi form đăng ký trên site nhà cung cấp. Người phụ trách đăng ký. Số tiếp nhận 【SA-YYYYMMDD-NNNN】 | REQ-PO-301 |
| S10 | Thông báo cấp tài khoản (phê duyệt) | Khi vận hành phê duyệt ở 「申込の確認」 (xác nhận đăng ký). ID đăng nhập = ID nhà cung cấp, đặt mật khẩu ở lần đăng nhập đầu | Quyết định R7 |
| S11 | Thông báo kết quả đăng ký (từ chối) | Khi vận hành từ chối. Ghi lý do | Quyết định R7 |

Việc đặt lại mật khẩu dùng nguyên Message List No.3・4 của giai đoạn 1 (site nhà cung cấp không có màn hình đổi mật khẩu, chỉ có đặt lại).

## Phần 2　Thông báo trên màn hình vận hành・kho (không gửi email)

| No | Thông báo | Nơi hiển thị | Khi hiển thị | Căn cứ |
|---|---|---|---|---|
| N1 | Chờ phê duyệt đặt hàng chính thức (nhà cung cấp chưa xử lý) | Dải phía trên danh sách 「発注」 của vận hành (số đơn・số lần đã gửi cảnh báo) | Giống S5 | REQ-PO-302・quyết định Q9 |
| N2 | Không thể nhận đơn | Như trên | Khi nhà cung cấp trả lời không thể nhận đơn | Quyết định Q3 |
| N3 | Đăng ký giao từng phần | Như trên (xóa bằng 「確認した」 (đã xác nhận)) | Khi nhà cung cấp đăng ký giao từng phần (không cần vận hành phê duyệt) | REQ-PO-133・quyết định R2 |
| N4 | Xác nhận nhập kho NG／ES cần xác nhận | Như trên・màn hình xác nhận nhập kho (kho) | Khi kho xác nhận và số lượng khác | Quyết định W4 |
| N5 | Thay đổi thời hạn giao | Như trên | Khi nhà cung cấp sửa ngày dự kiến xuất hàng | REQ-PO-133 |

## Cần xác nhận

1. S1: email đặt hàng tạm có gom thành 1 thư cho 1 lần thao tác không (hay 1 thư cho mỗi dữ liệu đặt hàng)
2. Với nhà cung cấp có phương thức đặt hàng = bên ngoài (③), không gửi email có được không (vận hành chỉ ghi nhận)
3. N2: có thông báo việc không thể nhận đơn cho vận hành qua cả email không (hiện chỉ có dải trên màn hình)
4. ~~S8: có thông báo NG nhập kho cho nhà cung cấp qua email không~~ → **Không gửi** (sổ tiếp nhận #534・sổ quyết định S)
5. Giới hạn số lần giao từng phần cố định là 3 lần (không đặt ở màn hình cài đặt của vận hành: sổ quyết định S 2026-10-12・sổ tiếp nhận #535. Cũ: tạm thời・có thể thay đổi trong cài đặt của vận hành)
6. Địa chỉ trả lời cho nhà cung cấp trả lời qua email (địa chỉ đầu mối đặt hàng. Với no-reply thì không trả lời được) → **Ghi cố định trong văn bản email**. Không đặt ở màn hình cài đặt Web vận hành. Địa chỉ sẽ xác nhận với khách hàng (cho đến khi quyết định thì giữ nguyên 【発注窓口のアドレス】 (địa chỉ đầu mối đặt hàng)) (sổ tiếp nhận #536・sổ quyết định S)
