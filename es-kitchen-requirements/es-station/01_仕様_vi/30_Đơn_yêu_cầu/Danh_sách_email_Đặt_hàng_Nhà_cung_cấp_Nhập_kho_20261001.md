# Danh sách email (Đặt hàng・Nhà cung cấp・Nhập kho) 01/10/2026 【Bản đề xuất】

> Người yêu cầu: Long (Tran Duc Long) / Soạn: Claude (Cowork). Bản đề xuất email và thông báo trên màn hình theo các quyết định của STEP6 (`Quyết_định_STEP6_Trả_lời_Đặt_hàng_Nhà_cung_cấp_20261001.md`・`Quyết_định_STEP6_Bổ_sung_Trả_lời_OPEN_và_xác_nhận_nhập_kho_20261001.md`).
> Tài liệu này chi tiết hóa X9〜X11 ở Phần 2 của danh sách email Đăng ký・Đơn đăng ký (`Danh_sách_email_Đăng_ký_và_yêu_cầu_20261001.md`). **Nội dung văn bản là bản đề xuất**. Phần trong 【 】 là giá trị được điền vào.
> **Bổ sung vào Excel ngày 01/10/2026**: `【ES STATION】システム内メッセージ管理-Message List_フェーズ2追加_20261001.xlsx` — "Email" No.17〜27 (S1〜S11), "Web quản trị viên vận hành / khách hàng doanh nghiệp" No.77〜84 (N1〜N4・không thể sửa・giới hạn giao chia đợt・lỗi và xác nhận số thùng). Script: `項目一覧_生成スクリプト/update_messages_step6_20261001.py`

| Tài liệu này | Excel "Email" No. |
|---|---|
| S1〜S11 | 17〜27 |
| N1〜N4 và các thông báo màn hình khác | WEB 77〜84 |

## 0. Quy tắc chung (giống §0 của danh sách email Đăng ký・Đơn đăng ký + quyết định STEP6)

| Hạng mục | Quy tắc | Căn cứ |
|---|---|---|
| Người gửi・tiêu đề・câu mở đầu・chữ ký | Giống Phase 1 (no-reply@es-kitchen.co.jp, tiêu đề bắt đầu bằng "【ES Station】", chữ ký chỉ để gửi đi) | Danh sách email §0 |
| Người nhận (nhà cung cấp) | **Toàn bộ người phụ trách chính và người phụ trách phụ** trong Master nhà cung cấp (1 công ty 1 tài khoản, nhiều người phụ trách là địa chỉ nhận email) | Quyết định R8 |
| Đối tượng gửi | **Gửi bất kể phương thức đặt hàng** (cùng nội dung cho cả nhà cung cấp đăng nhập ES Station và nhà cung cấp nhận qua email). Nhà cung cấp có phương thức đặt hàng = bên ngoài thì **không gửi** (bên vận hành chỉ ghi lại・R3. Cảnh báo chưa xử lý cũng không gửi. Quyết định 05/10/2026 hong) | Quyết định C3・R3 |
| Nội dung | **Viết trong nội dung email** (không đính kèm PDF đơn đặt hàng). **Không gắn link để phản hồi**. Chỉ ghi URL của Site nhà cung cấp (màn hình đăng nhập) dành cho nhà cung cấp đăng nhập | Quyết định C3 |
| Địa chỉ trả lời | Vì người gửi là no-reply nên ghi **địa chỉ trả lời (đầu mối đặt hàng)** trong nội dung dành cho nhà cung cấp nhận phản hồi qua email. Địa chỉ 【Cần xác nhận】 | Quyết định C3 |
| Cách nhận phản hồi | Nhà cung cấp đăng nhập phản hồi trên Site nhà cung cấp. Nhà cung cấp nhận qua email thì nhận trả lời・điện thoại rồi **bên vận hành nhập hộ** (có thể nhập hộ cho đơn đặt hàng của bất kỳ nhà cung cấp nào) | Quyết định C3 |
| Tên trong đơn đặt hàng | Tên sản phẩm là **tên sản phẩm lúc nhập mua** (không phải tên công khai) | Quyết định R12 |
| Số tiền | Không ghi đơn giá nhập mua・số tiền đặt hàng | Quyết định DR-4 |
| Nửa đầu・nửa sau | Không ghi phân chia Chu kỳ (nửa đầu・nửa sau・A〜D). Ghi theo ngày mong muốn nhập kho | REQ-PO-207 |

## Phần 1　Email gửi nhà cung cấp

### S1　Thông báo đặt hàng tạm
| Hạng mục | Nội dung |
|---|---|
| Thời điểm gửi | Khi bên vận hành lưu đặt hàng tạm・đặt hàng tạm hàng loạt (không tách theo từng dữ liệu đặt hàng mà gộp **1 email cho 1 thao tác**【Cần xác nhận】) |
| Người nhận | Người phụ trách của nhà cung cấp (chính・phụ) |
| Căn cứ | REQ-PO-111, Bảng yêu cầu "Hạng mục xác nhận khi đặt hàng tạm" (một câu thông báo ngừng bán, v.v.) |

Tiêu đề: 【ES Station】Thông báo đặt hàng tạm (【Mã đặt hàng】 và【n】 mục khác)
```
Kính gửi Quý【Tên nhà cung cấp】

Chúng tôi xin đặt hàng tạm như sau. Vui lòng phản hồi ngày dự kiến xuất hàng (thời hạn giao).

■ Mã đặt hàng　　　　：【PO-YYYYMM-Mã hàng-U01】
■ Sản phẩm　　　　　：【Tên sản phẩm lúc nhập mua】 (Mã hàng【M000】)
■ Số lượng　　　　　：【Số lượng】【Đơn vị】
■ Ngày mong muốn nhập kho：【YYYY/MM/DD】〜【YYYY/MM/DD】
■ Kho nhận hàng　　：【Tên kho】 (【Địa chỉ】)
(Từ 2 mục trở lên sẽ tiếp tục theo cùng dạng)

■ Cách phản hồi
・Quý vị sử dụng Site nhà cung cấp: Vui lòng đăng nhập và phản hồi từ "Danh sách đặt hàng". 【URL Site nhà cung cấp】
・Quý vị phản hồi qua email: Vui lòng trả lời email này (ngày dự kiến xuất hàng・có giao chia đợt hay không). Bên vận hành sẽ nhập hộ.

※ Nếu không thể nhận đơn, vui lòng cho biết lý do và phương án thay thế (ví dụ: nếu dời ngày thì có thể thực hiện).
※ Về giao chia đợt, chúng tôi nhận tối đa【3】đợt, trong phạm vi ngày giao của mỗi đợt không muộn hơn ngày mong muốn nhập kho đầu tiên.
※ Nếu có dự định ngừng bán・thay đổi quy cách, v.v., vui lòng thông báo cùng lúc.
```

### S2　Thay đổi số lượng đặt hàng tạm (đề nghị phản hồi lại)
| Hạng mục | Nội dung |
|---|---|
| Thời điểm gửi | Khi bên vận hành sửa số lượng・ngày mong muốn nhập kho của đặt hàng tạm đã gửi và lưu (quay về "Chờ phản hồi thời hạn giao") |
| Căn cứ | REQ-PO-304 (Sửa đặt hàng tạm và thông báo lại) |

Tiêu đề: 【ES Station】Số lượng đặt hàng tạm đã thay đổi (【Mã đặt hàng】)
```
Nội dung đặt hàng tạm đã thay đổi. Vui lòng phản hồi lại ngày dự kiến xuất hàng.
■ Mã đặt hàng：【Mã đặt hàng】
■ Số lượng　　：【Trước thay đổi】【Đơn vị】 → 【Sau thay đổi】【Đơn vị】
■ Ngày mong muốn nhập kho：【Phạm vi sau thay đổi】
(Cách phản hồi giống S1)
```

### S3　Thông báo đặt hàng chính thức (đề nghị phê duyệt)〔Danh sách X9〕
| Hạng mục | Nội dung |
|---|---|
| Thời điểm gửi | Khi bên vận hành đặt hàng chính thức (sau hạn chốt đơn) |
| Căn cứ | REQ-PO-302, Quyết định Q2 (phê duyệt đặt hàng chính thức là bắt buộc)・R1 (sau khi phê duyệt không đổi số lượng) |

Tiêu đề: 【ES Station】Thông báo đặt hàng chính thức (Đề nghị phê duyệt)
```
Đặt hàng chính thức đã được xác nhận. Vui lòng phản hồi ngày giao hàng (ngày hàng đến kho) và số thùng nhập kho, sau đó phê duyệt đặt hàng chính thức.
Sau khi phê duyệt, không thể thay đổi số lượng.

■ Mã đặt hàng：【Mã đặt hàng】
■ Sản phẩm　　：【Tên sản phẩm lúc nhập mua】
■ Số lượng đặt hàng chính thức：【Số lượng】【Đơn vị】 (Nếu thay đổi so với đặt hàng tạm:【Số lượng đặt hàng tạm】→【Số lượng đặt hàng chính thức】)
■ Ngày dự kiến xuất hàng (đã phản hồi)：【YYYY/MM/DD】
(Cách phản hồi giống S1)
```

### S4　Thay đổi số lượng đặt hàng chính thức (trước khi phê duyệt・đề nghị phê duyệt lại)
| Hạng mục | Nội dung |
|---|---|
| Thời điểm gửi | Khi bên vận hành sửa số lượng đặt hàng chính thức trước khi nhà cung cấp phê duyệt đặt hàng chính thức |
| Căn cứ | Quyết định R1 (chỉ sửa được đến khi phê duyệt)・C1 |

Tiêu đề: 【ES Station】Số lượng đặt hàng chính thức đã thay đổi (【Mã đặt hàng】)
```
Số lượng đặt hàng chính thức đã thay đổi. Vui lòng kiểm tra nội dung và phê duyệt lại đặt hàng chính thức.
■ Mã đặt hàng：【Mã đặt hàng】
■ Số lượng đặt hàng chính thức：【Trước thay đổi】→【Sau thay đổi】【Đơn vị】
```

### S5　Cảnh báo đặt hàng chính thức chưa xử lý (mỗi 24 giờ)〔Danh sách X10〕
| Hạng mục | Nội dung |
|---|---|
| Thời điểm gửi | Kiểm tra mỗi 24 giờ kể từ khi đặt hàng chính thức (chỉ đếm ngày làm việc theo "Có coi thứ Bảy・Chủ nhật・ngày lễ là ngày làm việc hay không" trong Master nhà cung cấp), nếu chưa được phê duyệt thì lặp lại cho đến khi được phê duyệt |
| Hiển thị cho bên vận hành | Hiển thị số lượng và số lần đã gửi ở "Thông báo từ nhà cung cấp" phía trên danh sách "Đặt hàng" của bên vận hành (không gửi email) |
| Căn cứ | REQ-PO-302・604, Bảng yêu cầu dòng 14, Quyết định Q9 |

Tiêu đề: 【ES Station】Đặt hàng chính thức chưa được phê duyệt (【Mã đặt hàng】)
```
Việc phê duyệt đặt hàng chính thức vẫn chưa hoàn tất.
■ Mã đặt hàng：【Mã đặt hàng】 (Đặt hàng chính thức:【YYYY/MM/DD HH:MM】)
Chúng tôi thông báo mỗi 24 giờ làm việc kể từ khi đặt hàng chính thức. Sẽ lặp lại cho đến khi hoàn tất phê duyệt.
(Cách phản hồi giống S1)
```

### S6　Thông báo đặt hàng bổ sung
| Hạng mục | Nội dung |
|---|---|
| Thời điểm gửi | Khi bên vận hành đặt hàng bổ sung phần tăng thêm sau hạn chốt đơn (dùng thử・đăng ký được phê duyệt sau hạn chốt・phần bổ sung sau khi chốt của Mẫu kinh doanh). Đặt hàng bổ sung được gửi như đặt hàng chính thức |
| Căn cứ | Quyết định Q5・C1, STEP5 T1 (ngày chốt đặt hàng B7・D7) |

Tiêu đề: 【ES Station】Thông báo đặt hàng bổ sung (【Mã đặt hàng】)
```
Chúng tôi xin đặt hàng bổ sung như sau. Vui lòng phản hồi ngày dự kiến xuất hàng, ngày giao hàng và số thùng nhập kho, sau đó phê duyệt.
■ Mã đặt hàng：【Mã đặt hàng】 (Đặt hàng bổ sung)
■ Sản phẩm　　：【Tên sản phẩm lúc nhập mua】
■ Số lượng　　：【Số lượng】【Đơn vị】
■ Ngày mong muốn nhập kho：【YYYY/MM/DD】
```

### S7　Thông báo hủy đặt hàng
| Hạng mục | Nội dung |
|---|---|
| Thời điểm gửi | Khi bên vận hành hủy đặt hàng (khi giảm thì hủy rồi đặt lại) |
| Căn cứ | REQ-PO-112, Quyết định C1 |

Tiêu đề: 【ES Station】Thông báo hủy đặt hàng (【Mã đặt hàng】)
```
Đơn đặt hàng sau đã bị hủy. Vui lòng không xuất hàng.
■ Mã đặt hàng：【Mã đặt hàng】
■ Lý do　　　：【Lý do】
Có thể kiểm tra lịch sử ở thẻ "Hủy" trên Site nhà cung cấp.
```

### S8　Kết quả xác nhận nhập kho (NG／Cần ES xác nhận)
| Hạng mục | Nội dung |
|---|---|
| Thời điểm gửi | Khi xác nhận nhập kho tại kho, số thùng・số lượng thực tế khác với báo cáo xuất hàng và trở thành "NG／Cần ES xác nhận" |
| Căn cứ | Quyết định W4 |

Tiêu đề: 【ES Station】Thông báo kết quả xác nhận nhập kho (【Mã đặt hàng】)
```
Khi xác nhận nhập kho tại kho, số lượng khác với báo cáo xuất hàng của quý vị. Bên vận hành sẽ liên hệ lại.
■ Mã đặt hàng：【Mã đặt hàng】　■ Sản phẩm：【Tên sản phẩm lúc nhập mua】
■ Báo cáo：【Số thùng】thùng・【Số lượng】【Đơn vị】 → Xác nhận tại kho：【Số thùng】thùng・【Số lượng】【Đơn vị】
■ Ô ghi chú của kho：【Ô ghi chú】
```

### S9〜S11　Đăng ký của nhà cung cấp
| No | Email | Thời điểm gửi・người nhận | Căn cứ |
|---|---|---|---|
| S9 | Đã tiếp nhận đăng ký giao dịch | Khi gửi biểu mẫu đăng ký trên Site nhà cung cấp. Người phụ trách đăng ký. Mã tiếp nhận【SA-YYYYMMDD-NNNN】 | REQ-PO-301 |
| S10 | Thông báo cấp tài khoản (phê duyệt) | Khi bên vận hành phê duyệt ở "Xác nhận đăng ký". ID đăng nhập = ID nhà cung cấp, đặt mật khẩu ở lần đăng nhập đầu tiên | Quyết định R7 |
| S11 | Thông báo kết quả đăng ký (từ chối) | Khi bên vận hành từ chối. Ghi lý do | Quyết định R7 |

Việc đặt lại mật khẩu dùng nguyên Message List No.3・4 của Phase 1 (Site nhà cung cấp không có màn hình đổi mật khẩu, chỉ có đặt lại).

## Phần 2　Thông báo trên màn hình Vận hành・Kho (không gửi email)

| No | Thông báo | Nơi hiển thị | Thời điểm hiển thị | Căn cứ |
|---|---|---|---|---|
| N1 | Chờ phê duyệt đặt hàng chính thức (nhà cung cấp chưa xử lý) | Dải phía trên danh sách "Đặt hàng" của bên vận hành (số lượng・số lần cảnh báo đã gửi) | Giống S5 | REQ-PO-302・Quyết định Q9 |
| N2 | Không thể nhận đơn | Như trên | Khi nhà cung cấp phản hồi không thể nhận đơn | Quyết định Q3 |
| N3 | Đăng ký giao chia đợt | Như trên (xóa bằng "Đã xác nhận") | Khi nhà cung cấp đăng ký giao chia đợt (không cần bên vận hành phê duyệt) | REQ-PO-133・Quyết định R2 |
| N4 | NG／Cần ES xác nhận khi xác nhận nhập kho | Như trên・màn hình xác nhận nhập kho (kho) | Khi kho xác nhận và số lượng khác nhau | Quyết định W4 |
| N5 | Thay đổi thời hạn giao | Như trên | Khi nhà cung cấp sửa ngày dự kiến xuất hàng | REQ-PO-133 |

## Cần xác nhận

1. S1: Có gộp email đặt hàng tạm thành 1 email cho 1 thao tác không (hay mỗi dữ liệu đặt hàng 1 email)
2. Nhà cung cấp có phương thức đặt hàng = bên ngoài (③) thì không gửi email, như vậy có được không (bên vận hành chỉ ghi lại)
3. N2: Có thông báo cho bên vận hành việc không thể nhận đơn bằng cả email không (hiện chỉ có dải trên màn hình)
4. S8: Thông báo NG nhập kho cho nhà cung cấp bằng email là ngay khi kho lưu, hay sau khi bên vận hành xác nhận
5. Giới hạn số lần giao chia đợt【3】lần là tạm thời (có thể thay đổi theo thiết lập của bên vận hành)
6. Địa chỉ trả lời của nhà cung cấp nhận phản hồi qua email (địa chỉ đầu mối đặt hàng. Không thể trả lời bằng no-reply)
