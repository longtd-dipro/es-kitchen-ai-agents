> Bản dịch tiếng Việt của `ja/01_仕様/20_法人・拠点・契約/申込フォーム.md` (nguồn es-station, bản 2026-10-20). Khi khác nhau, bản tiếng Nhật và `docs/決定台帳.md` là chuẩn.

# Form đăng ký (Đăng ký mới・Thêm cơ sở trên Web doanh nghiệp／Tiếp nhận của vận hành)

> **Tài liệu chuẩn của chủ đề này. Các quyết định đang có hiệu lực nằm ở `docs/決定台帳.md`.** Nếu sổ quyết định và tài liệu này khác nhau thì sổ quyết định là chuẩn (tài liệu này sửa sót).
> Tạo ngày: 2026-10-03 (tạo mới theo sổ quyết định A "Form đăng ký・phê duyệt yêu cầu: viết mới từ các tệp quyết định" Q3=A).
> Tài liệu này được viết lại từ các tệp quyết định. **Các tài liệu cũ sau đây bị đóng băng** (từ nay không cập nhật. Chuẩn là tài liệu này): `20_法人・拠点・契約/法人申込フォーム_整理_v2.md`, `30_申請/申請詳細画面_再設計案_v1.md` (phần đăng ký mới・chuyển đổi), `30_申請/入力チェック仕様_申込フォーム_20261001.md` §3・§5, `30_申請/受付・承認画面_項目ギャップ_20260929.md` (diễn biến).
> Các yêu cầu loại thay đổi (8 loại như đổi gói・tạm ngưng・hủy hợp đồng) và phê duyệt xem `30_申請/申請・承認.md`.
> Những điều chưa quyết định・chỗ các tài liệu khác nhau được ghi trong nội dung là "⚠️ Cần xác nhận (2026-10-03)" và tổng hợp ở §17.

---

## 0. Cách đọc

### 0-1. Phạm vi

| Bao gồm | Không bao gồm (nơi đặt) |
|---|---|
| 「新規のお申し込み」(đăng ký mới) trên Web doanh nghiệp (không đăng nhập・triển khai chính thức／dùng thử) | Đăng ký thay đổi (8 loại)・phê duyệt → `30_申請/申請・承認.md` |
| 「拠点を追加」(thêm cơ sở) trên Web doanh nghiệp (tài khoản doanh nghiệp・tài khoản cơ sở đang đăng nhập) | Định nghĩa mục của doanh nghiệp・cơ sở・hợp đồng cha・hợp đồng con → `契約仕様/契約_03〜05` |
| Tiếp nhận của vận hành (xác nhận nội dung đăng ký → đăng ký tạm → thiết lập thông tin chi tiết → đăng ký chính thức)・nhập thay・CSV hàng loạt | Tính toán hóa đơn (tiền phạt vi phạm hợp đồng・hóa đơn lần đầu v.v.) → `40_マスタ・料金・請求/請求ルール_仕様_v1.md` |
| Tiếp nhận chuyển đổi dùng thử→triển khai chính thức | Cách tạo lộ trình giao hàng・dữ liệu giao hàng → đặc tả giao hàng |

### 0-2. Ký hiệu viết tắt của nguồn

| Ký hiệu | Tệp (`docs/01_仕様/00_決定/` v.v.) |
|---|---|
| Sổ quyết định | `docs/決定台帳.md` |
| 28-xx | `決定_v2.3追補_申請まわり_20260928.md` (28-1〜28-175) |
| Master đăng ký #n | `決定_v2.3追補_申込フォームとマスタ_20260929.md` |
| STEP1 | `決定_STEP1回答_申込とサンプル_20261001.md` |
| STEP2 Qn | `決定_STEP2回答_法人拠点契約_20261001.md` |
| S・T・E・D | `決定_STEP3残りとSTEP1を閉じる回答_20261001.md` (S1〜S11・T1〜T6. Các số D・E trong T5 là của `90_デモ確認/質問一覧_STEP1を閉じる・STEP3の残り_20261001.md`) |
| STEP5 | `決定_STEP5回答_法人Web_20261001.md` |
| H1〜H5 | `決定_法人Webアカウント_H1-H5_20261001.md` |
| TL・DR | `決定_TechLeadレビュー回答_*.md`・`決定_デザインレビュー回答_20261001.md` |
| v2.3 #n | `決定_v2.3_20260923.md` |
| Dòng n | Bảng yêu cầu (`決定_要件シート一部反映_回答_20260930.md`・`決定_要件シートPhase2_残りの回答と提案_20261002.md`) |
| Nguyên điển #n | `00_確認してほしい/作業記録_20261003/申込・申請_仕様に入れる内容_20261003.md` (câu của 契約_詳細要件 REQ-CT) |
| Danh sách vấn đề mm/dd | `00_確認してほしい/課題一覧_データ統合と画面_20261002.md` (ngày trả lời của hong) |
| 契約_01 | `契約仕様/契約_01_時間軸・写し・整合性.md` |
| Form hiện hành | Kết quả đọc ảnh form đăng ký hiện hành (R01〜R04). `法人申込フォーム_整理_v2.md` §1〜§4 (đóng băng) |

### 0-3. Thuật ngữ

| Thuật ngữ | Ý nghĩa |
|---|---|
| Loại hợp đồng | 本導入 (triển khai chính thức)／お試し (dùng thử) (không dùng 「本契約」「トライアル」. Tên loại hợp đồng chỉ là 「本導入」「お試し」 đúng như sổ quyết định. Chỉ dùng 「キャンペーン」 khi nói đến **bản thân chiến dịch** như điều khoản chiến dịch・giảm giá chiến dịch dùng thử)〔form hiện hành ⑩, hong trả lời 2026-10-15・sổ quyết định AK (S-2)〕. Thống nhất tên gọi là 「本導入」〔hong trả lời 2026-10-03 (K14)〕 |
| Loại thiết bị | Chọn 1 trong 2 cho mỗi cơ sở: tủ lạnh・tủ đông／máy bán hàng tự động〔sổ quyết định "Loại thiết bị"〕 |
| Hợp đồng (trong đăng ký) | 1 「希望プラン」(gói mong muốn) của form đăng ký = hợp đồng của 1 cơ sở. Một lần đăng ký có thể có nhiều hợp đồng |
| Số tiếp nhận | Số của đăng ký mới・thêm cơ sở `AP-YYYYMMDD-NNNN`〔danh sách email M1〕. `AP-` chỉ là số tiếp nhận của đăng ký mới (ID áp dụng đã bãi bỏ)〔hong trả lời 2026-10-03 (K7＝A)〕 |
| Đăng ký tạm／đăng ký chính thức | §10. Đăng ký tạm = giai đoạn tạo doanh nghiệp・cơ sở・hợp đồng cha・tài khoản (và bộ khởi tạo đơn hàng・vật tư). Hợp đồng con được tạo ở đăng ký chính thức〔sổ quyết định R・2026-10-09〕. Tuy nhiên nếu còn trong kỳ đặt hàng thì **chỉ hợp đồng con của tháng bắt đầu được tạo ở đăng ký tạm** (sổ quyết định L1181・2026-10-14. Chuyển đổi dùng thử→triển khai chính thức cũng vậy, gắn dấu tạm và không tính vào giao hàng・hóa đơn: sổ quyết định L777・2026-10-18). Đăng ký chính thức = xác định theo từng cơ sở |

---

## 1. Luồng tổng thể

```
[Lối vào]                              [Vận hành: Quản lý yêu cầu hợp đồng ＞ Tab Hợp đồng mới]
Web doanh nghiệp Đăng ký mới (không đăng nhập)─┐
Web doanh nghiệp Thêm cơ sở (đang đăng nhập)───┤→ Đang tiếp nhận ─(hoàn tất xác nhận nội dung đăng ký＝đăng ký tạm)→ Đang thiết lập hợp đồng ─(đăng ký chính thức tất cả cơ sở)→ Hoàn tất
Vận hành nhập thay (điện thoại・kinh doanh・giấy v.v.)─┤        │                                   │
Vận hành CSV hàng loạt (nhập thay)─────────────┤        └→ Từ chối (bắt buộc lý do)          └→ Từ chối／rút lại (hủy đơn hàng・bộ khởi tạo đã tạo)
Chuyển đổi dùng thử→triển khai chính thức (vận hành nhập thay)───┘
```

- Con đường để vận hành tạo cơ sở・hợp đồng là **chỉ một: đăng ký (nhập thay) → tiếp nhận**. Không đặt 「新規登録」(đăng ký mới) ở danh sách cơ sở v.v.〔28-33, danh sách vấn đề 10/02 "2-2 là 28-33"〕.
- Trạng thái: 受付中 (đang tiếp nhận)／契約設定中 (đang thiết lập hợp đồng)／完了 (hoàn tất)／却下 (từ chối)／取り下げ済み (đã rút lại)〔28-63〕.

---

## 2. Lối vào và các loại đăng ký

| Lối vào | Màn hình | Loại hợp đồng | Thông tin doanh nghiệp | Người đăng ký | Nguồn |
|---|---|---|---|---|---|
| Đăng ký mới (trước khi đăng nhập) | Màn hình trước đăng nhập (không có menu bên. Logo・đăng nhập. **Ở dải phía trên không đặt 「面談のお申し込み」(đăng ký phỏng vấn)「お問い合わせ」(liên hệ)** = chỉ liên hệ sau khi đăng nhập〔hong trả lời 2026-10-15・sổ quyết định AK (AUTH-Q5)〕) | Triển khai chính thức／dùng thử (nút chuyển) | Nhập | Nhập (§5-3) | Web doanh nghiệp §2-2, 28-117 |
| Thêm cơ sở | Ở Web doanh nghiệp 申請 ＞ 契約の申請, nút 「契約の申請」(yêu cầu hợp đồng) → chọn 「拠点を追加」 trong thủ tục〔2026-10-16 sổ quyết định AN・sổ tiếp nhận #736. Đã bỏ nút 「拠点を追加」 ở danh sách cơ sở・danh sách yêu cầu〕. **Cả tài khoản doanh nghiệp và tài khoản cơ sở** đều dùng được (2026-10-16 hong xác nhận lại・sổ tiếp nhận #737). **Một lần đăng ký có thể thêm nhiều cơ sở** (＋thêm hợp đồng・nhân bản). Phần nhập hợp đồng dùng cùng thành phần với bước 1 của đăng ký mới (§4) (1 cơ sở＝1 hợp đồng), bên phải hiển thị 「お見積」(báo giá)〔hong trả lời 2026-10-15・sổ tiếp nhận #639〕 | Triển khai chính thức | Đã đăng ký (không nhập). 2 bước | Tài khoản đang đăng nhập＋chọn từ người phụ trách | Web doanh nghiệp §2-2・§4-2, 28-117 |
| Vận hành nhập thay | **Chỉ** 「新規登録（代理入力）」(đăng ký mới (nhập thay)) ở tab 「新規契約」(hợp đồng mới) của Quản lý yêu cầu hợp đồng | Triển khai chính thức／dùng thử／chuyển đổi | Doanh nghiệp mới／doanh nghiệp hiện có | Nhập (lưu kênh tiếp nhận・người nhập) | 28-33, STEP1 |
| Vận hành CSV hàng loạt | 「新規申込の CSV 取込（代理入力の一括登録）」(nhập CSV đăng ký mới (đăng ký hàng loạt nhập thay)) ở Quản lý yêu cầu hợp đồng | Triển khai chính thức／dùng thử | Cột của CSV | Cột của CSV | Danh sách vấn đề 10/03 "Tạo hàng loạt đăng ký mới bằng CSV: có". Các cột ở §10-8-1〔hong trả lời 2026-10-03 (A11)〕 |
| Chuyển đổi dùng thử→triển khai chính thức | Thêm 「切替（お試し→本導入）」(chuyển đổi (dùng thử→triển khai chính thức)) vào nhập thay của vận hành. **Cũng có thể đăng ký ở 「本導入申込」(đăng ký triển khai chính thức) của Web doanh nghiệp** (tài khoản sau khi kết thúc dùng thử〔chỉ xem〕. Liên kết ở dải và dưới mục yêu cầu của menu bên. 2026-10-16 sổ quyết định AN). Phần nhập hợp đồng dùng cùng thành phần với §4, **đưa nội dung của cơ sở dùng thử (địa chỉ・người phụ trách・gói・giao hàng・thiết bị・tùy chọn・hóa đơn) vào làm giá trị ban đầu, tất cả đều sửa được**〔hong trả lời 2026-10-15・sổ tiếp nhận #639〕 | Chuyển đổi | Hiện có | — | STEP1 "Chuyển đổi được thêm vào nhập thay của vận hành. Khi cần sẽ cho phép chọn 'chuyển đổi từ dùng thử' ở đăng ký mới của Web doanh nghiệp" |

- **Cơ sở mới do tài khoản cơ sở 「拠点を追加」 và yêu cầu của nó không hiển thị ở danh sách cơ sở・danh sách yêu cầu của tài khoản đã thêm.** Xem bằng tài khoản cơ sở của cơ sở mới và tài khoản doanh nghiệp. Kết quả (lý do phê duyệt・từ chối) được gửi qua email đến người đăng ký〔H3＝A, H4〕.
- Trường hợp nhiều công ty cùng tầng dùng chung 1 tủ lạnh cũng không làm ngoại lệ, mà **mỗi công ty đăng ký riêng** (vì giá trị lý thuyết của tồn kho・quyết toán theo thực tế sẽ không khớp)〔nguyên điển #26・REQ-CT-238〕.
- **Không giả định đăng ký đồng thời** dùng thử và triển khai chính thức〔契約_00 §0.4〕.

---

## 3. Cấu trúc màn hình Web doanh nghiệp (Đăng ký mới)

| Bước | Tên | Nội dung | Nguồn |
|---|---|---|---|
| 1 | Nhập nội dung mong muốn và nơi giao hàng | Nút chuyển loại hợp đồng・danh sách hợp đồng (cơ sở)・gói／thiết bị／tùy chọn／nơi giao hàng／hóa đơn／đính kèm theo từng cơ sở. Bên phải có **bảng báo giá** | Form hiện hành R01・§7 #1〜#3 |
| 2 | Nhập thông tin doanh nghiệp | Người đăng ký (không đăng nhập)・thông tin doanh nghiệp・người phụ trách của doanh nghiệp | Form hiện hành R02, 28-117 |
| 3 | Xác nhận nội dung và gửi | Xác nhận (dạng bảng)・chi tiết phí báo giá・đồng ý・gửi | Form hiện hành R03, 28-23 |
| Hoàn tất | 「お申し込みを受け付けました」(đã tiếp nhận đăng ký) | Số tiếp nhận・hướng dẫn email・URL đặt lịch phỏng vấn khởi động (kickoff) | §7 |

- Màn hình xác nhận **cố định dạng bảng (hàng＝mục／cột＝cơ sở)** (không tự chuyển theo số lượng)〔28-23〕. Góc trên bên phải mỗi khối có 「修正する」(sửa)〔form hiện hành〕.
- 「拠点を追加」 vì thông tin doanh nghiệp đã đăng ký nên có **2 bước** (nội dung mong muốn và nơi giao hàng → xác nhận)〔Web doanh nghiệp §2-2〕.
- Nếu rời đi giữa chừng (menu bên v.v.) thì hiển thị xác nhận hủy bỏ〔Web doanh nghiệp §2-2〕.
- Thứ tự nhập **giữ như hiện tại** (bước 1＝gói＋nơi giao hàng → bước 2＝thông tin doanh nghiệp)〔hong trả lời 2026-10-05 (#1). Không áp dụng REQ-CT-113 của nguyên điển "gói→thông tin công ty→nơi giao hàng"〕.
- Phía trên màn hình trước đăng nhập đặt 「アカウントをお持ちですか？ → ログイン」(bạn đã có tài khoản? → đăng nhập)〔form hiện hành〕. **Bỏ 「面談のお申し込み」「お問い合わせ」 ở dải phía trên. Cũng không đặt khối 「面談でご相談いただくと…」 trong phần nội dung đăng ký** (liên hệ chỉ sau khi đăng nhập. Đặt lịch phỏng vấn là hướng dẫn phỏng vấn khởi động ở màn hình hoàn tất §7)〔hong trả lời 2026-10-15・sổ quyết định AK (AUTH-Q5). Cũ: liên kết ở dải phía trên theo form hiện hành・28-24 "phỏng vấn là tùy chọn"〕.
- 「パスワードを忘れた方」(quên mật khẩu) ở màn hình đăng nhập〔2026-10-19 hong: tất cả các site dùng tên này. Sổ quyết định AU〕 mở **màn hình đặt lại 4 bước giống P-AUTH** (cùng dạng với OW_AUTH của vận hành. ID đăng nhập và email → mã xác thực (4 chữ số・hiệu lực 5 phút) → mật khẩu mới). Không chỉ dùng toast cho xong〔hong trả lời 2026-10-15・sổ quyết định AK (AUTH-Q1)〕.
- Thông báo đăng nhập thất bại là **1 ID: E520 chung có thêm câu chữ dành cho doanh nghiệp** (hủy E359 chỉ dành cho doanh nghiệp)〔như trên (AUTH-Q4)〕.
- 「拠点を追加」 hiển thị **hộp thoại xác nhận trước khi gửi**. Kiểm tra nhập liệu cùng tiêu chuẩn với sửa cơ sở (E03・E05・E06), toast thiếu mục bắt buộc là E341. **Cũng nhập nội dung hợp đồng・tùy chọn・thiết bị theo từng cơ sở** (1 cơ sở＝1 hợp đồng. §2・sổ tiếp nhận #639)〔hong trả lời 2026-10-15・sổ quyết định AK (S-9)〕.
- Với doanh nghiệp・cơ sở sau khi hủy hợp đồng (chỉ xem), không hiển thị nút 「契約の申請」 (lối vào thêm cơ sở・thay đổi. 2026-10-16 sổ quyết định AN). Máy chủ cũng từ chối (E345)〔như trên (S-8). Sổ quyết định E "Những gì làm được sau khi hủy hợp đồng"〕.

---

## 4. Bước 1: Nội dung mong muốn và nơi giao hàng

### 4-1. Loại hợp đồng và danh sách hợp đồng (cơ sở)

| Mục | Bắt buộc | Quy định | Nguồn |
|---|---|---|---|
| Loại hợp đồng | ○ | Nút chuyển triển khai chính thức／dùng thử (một form. Không tách màn hình. Tên theo sổ quyết định AK S-2) | Form hiện hành §7 #2 |
| Danh sách hợp đồng | ○ | Xếp các gói mong muốn dạng chip, mỗi chip có 「×」「複製」(nhân bản), bên dưới 「＋ 契約を追加」(＋ thêm hợp đồng). **Có thể thêm bao nhiêu cơ sở cũng được** (dùng thử cũng được nhiều cơ sở) | Form hiện hành §5 ①・§7 #5 |
| Nhân bản | — | Có thể nhân bản và giữ lại nơi giao hàng・người phụ trách | Form hiện hành |

### 4-2. Nhập theo từng hợp đồng (cơ sở)

| Mục | Bắt buộc | Loại | Quy định | Nguồn |
|---|---|---|---|---|
| Loại thiết bị | ○ | Chọn 1 trong 2 | **Tủ lạnh・tủ đông／máy bán hàng tự động**. Ở trên cùng của accordion. **Dùng thử không hiển thị mà cố định tủ lạnh・tủ đông** (máy bán hàng tự động thì hướng dẫn trao đổi khi phỏng vấn) | Sổ quyết định, STEP5 T2 "Dùng thử không có máy bán hàng tự động" |
| Số món ES Food (gói) | ○ | Chọn | Gói đang công khai của master gói. **Máy bán hàng tự động từ gói 100 trở lên** (gói 50 không chọn được máy bán hàng tự động) | Đặc tả kiểm tra nhập liệu §3-3 |
| Course | ○ | Chọn | ESライト (ES Lite)／ESスタンダード (ES Standard). **Máy bán hàng tự động cố định ESライト（自販機）(chỉ hiển thị)** | Đặc tả kiểm tra nhập liệu §3-3, 28-170 |
| Phương thức giao hàng | ○ | Chọn | ES配送便 (giao hàng ES)／COOL便 (giao hàng COOL). **Máy bán hàng tự động cố định ES配送便** (không hiển thị lựa chọn). ES配送便 có chú thích là phí khác nhau tùy trao đổi trước・khu vực | 28-19, STEP1, form hiện hành §4 |
| Số lần giao hàng (tháng) | ○ | Chọn | **Triển khai chính thức: chọn từ tiêu chuẩn của gói／＋1 lần／＋2 lần**. Giá trị ban đầu là tiêu chuẩn của gói. Phần vượt tiêu chuẩn được đưa vào báo giá dưới dạng thêm số lần giao hàng (OP000001・hàng tháng ¥10,000 mỗi lần. Đổi ngày 2026/10/09. Cũ: ¥3,000. Phần cộng phí giao hàng khu vực là OP000004 riêng). **Dùng thử không chọn được (cố định tiêu chuẩn của gói)**. Số lần đã chọn là giá trị ban đầu của số lần giao hàng khi tiếp nhận. Số lần giao hàng tiêu chuẩn lấy từ master gói (theo từng vùng nhiệt độ) | Master đăng ký #2・#3, 28-85, 28-154, STEP1 |
| Năm tháng mong muốn bắt đầu hợp đồng | ○ (triển khai chính thức) | Năm tháng | **Chỉ năm tháng** (không chọn ngày. Ngày tự động là ngày đầu chu kỳ A1). **Đăng ký trước hạn chót đặt hàng chỉ chọn được từ tháng sau trở đi, đăng ký sau hạn chót chỉ chọn được từ tháng sau nữa trở đi**. Dùng thử không hiển thị | STEP1, dòng 159, REQ-CT-225・257, 28-70 |
| Tầng lắp đặt | △ | Văn bản (60) | **Hiển thị ở tất cả cơ sở**. Bắt buộc khi là máy bán hàng tự động, tủ lạnh・tủ đông thì tùy chọn. Tiếp nhận của vận hành (「設置フロア（拠点N）」) → khi đăng ký tạm được đưa vào **mục riêng 「設置フロア」(tầng lắp đặt)** của cơ sở (không trộn vào ghi chú giao hàng: hong trả lời 2026-10-03) | Form hiện hành §6-3〔hong trả lời 2026-10-03 (A8＝C)〕 |
| Ghi chú ngoài gói | — | Nhiều dòng (500) | — | Form hiện hành, danh sách vấn đề 10/03 |
| Cách xử lý sản phẩm có hạn sử dụng ngắn | ○ | Chọn | Mẫu 「短消費期限なし」(không có hạn sử dụng ngắn): không đưa sản phẩm có hạn sử dụng ngắn vào đơn hàng mặc định. Phí không đổi. **Quyết định khi hợp đồng (đăng ký), sau khi hợp đồng chỉ vận hành mới thay đổi được** | REQ-CT-300 (`MM20261002_実装突合` No.13) |

- **Ở màn hình chọn gói hiển thị trợ giúp như số người khuyến nghị (master gói 「利用人数目安（表示用）」(số người sử dụng ước tính (để hiển thị))), và hiển thị ước tính phí theo gói đã chọn. Đặt trợ giúp 「？」 cho dùng thử miễn phí**〔nguyên điển #19 (độ chắc chắn: trung bình), master đăng ký #3〕.

### 4-3. Thiết bị (dòng máy・thiết bị)

| Mục | Bắt buộc | Quy định | Nguồn |
|---|---|---|---|
| Thiết bị có trong gói | Tham khảo | Hiển thị **thiết bị cho thuê tiêu chuẩn** của master gói (course・mẫu (tiêu chuẩn／thay thế)・dòng máy・số lượng). ES400・500 tiêu chuẩn là 84L＋142L, thay thế là 84L×2, **khách hàng chọn được**. ES600 trở lên thì trao đổi | 28-14, v2.3 ⑫, `決定_冷蔵庫マスタとプラン別構成_20260929.md` #2 |
| Kích cỡ・số lượng tủ lạnh | △ | Chỉ các dòng máy có 「公開ステータス＝公開」(trạng thái công khai＝công khai) trong master dòng máy. Hiển thị tên dòng máy và **mã dòng máy**. Kích cỡ lớn hơn thì **chỉ tính phần chênh lệch** (chênh lệch so với dòng máy cùng phân loại tiêu chuẩn. **Tính một lần (spot)〔1 lần〕 hay hàng tháng do master quyết định theo từng thiết bị**〔có khi cả hai〕.〔hong trả lời 2026-10-15・sổ quyết định AK "Cách tính chi phí thiết bị"・sổ tiếp nhận #642〕. Cũ: cố định OP000023 chênh lệch kích cỡ (hàng tháng)). **Phần âm khi giảm kích cỡ không tính phí cũng không hoàn tiền, coi là 0 yên, không hiển thị chênh lệch âm cho khách hàng** | STEP1, H5 |
| Thiết bị bổ sung (lò vi sóng・hộp vật tư v.v.) | — | ＋／− số lượng, 「＋ 備品追加」(＋ thêm thiết bị). Số tiền là phí hàng tháng của master dòng máy (hộp vật tư ¥0) | Form hiện hành §7 #6, 28-9 |
| Xác định dung lượng | — | Số lượng giao mỗi lần (giới hạn số lượng cung cấp hàng tháng của vùng nhiệt độ ÷ số lần giao hàng tiêu chuẩn của vùng nhiệt độ・làm tròn lên) có vừa với số lượng chứa tối đa của tủ lạnh・tủ đông không | 28-15, `決定_v2.3追補_プランマスタ_20260929.md` #9・④ |
| Hướng dẫn thời gian sử dụng tối thiểu | Tham khảo | Tủ lạnh 3 tháng・máy bán hàng tự động 12 tháng (theo từng thiết bị・master dòng máy). Tính từ ngày cho thuê của từng thiết bị | Sổ quyết định, STEP2 Q8 |
| Vật tư | — | **Khi đăng ký không cho chọn số lượng mong muốn.** Tự động đặt hàng bộ khởi tạo vật tư (§10-3) | STEP1 |

- Hiểu là máy giữ nóng (hot warmer) không hiển thị khi đăng ký (vận hành gắn sau)〔form hiện hành ⑯〕.
- **Có thể chọn không thuê tủ lạnh (không có tủ lạnh)**. Khi 「なし」(không có) thì không nhập loại・số lượng〔hong trả lời 2026-10-03 (K16)〕. Chỉ tủ lạnh・tủ đông có trong gói mới được chọn không có (hộp vật tư・máy bán hàng tự động không thuộc đối tượng). Dù chọn không có cũng không giảm phí hàng tháng (thiết bị là cho thuê miễn phí). Chiến dịch dùng thử cũng chọn được. Ở 「設備の希望」(thiết bị mong muốn) trong nhập thay của vận hành cũng hiển thị 「なし」〔2026-10-18 sổ quyết định B・sổ tiếp nhận #788〕.

### 4-4. Tùy chọn (các tùy chọn khác)

| Quy định | Nguồn |
|---|---|
| **Chỉ hiển thị mục có 「法人Web の申込に出す」(hiển thị ở đăng ký Web doanh nghiệp) và 「使用中」(đang sử dụng) của master tùy chọn.** Tên・số tiền・loại phí (hàng tháng／một lần) theo master. Không viết trực tiếp danh sách vào form | Master đăng ký #1 |
| Phí một lần (ví dụ: lắp đặt hộ・đổi wrapping máy bán hàng tự động) không tính vào tổng hàng tháng, hiển thị ở màn hình xác nhận・chi tiết phí báo giá dưới dạng dòng một lần | Master đăng ký #1, dòng 156 |
| **Có thể chọn lắp đặt hộ tủ lạnh (OP000007・một lần)** (cũng chọn được ở yêu cầu thay đổi) | Dòng 156 |
| **Đổi wrapping máy bán hàng tự động (OP000017・một lần・báo giá riêng) chỉ ở cơ sở máy bán hàng tự động** | Sổ quyết định "Loại thiết bị" |
| **Bãi bỏ OP000013 bổ sung vật tư định kỳ** (không hiển thị ở đăng ký) | STEP5 (bãi bỏ OP000013) |
| 「月次運用レポート提供サービス」(dịch vụ cung cấp báo cáo vận hành hàng tháng) không hiển thị vì OP000011 là 「終了」(kết thúc) | Master đăng ký #1 |

- Phí sử dụng ES-QR (OP000002) **không cho chọn khi đăng ký** (chỉ vận hành gắn・gỡ. Mong muốn được nhận qua ghi chú, vận hành gắn khi tiếp nhận)〔bảng yêu cầu dòng 157・sổ quyết định〕.
- Nội dung và phần trùng lặp của 「初期設置サポートサービス（無料）」(dịch vụ hỗ trợ lắp đặt ban đầu (miễn phí))「初期配送設置パック（¥7,800）」(gói giao hàng lắp đặt ban đầu)「設置代行（OP000007）」(lắp đặt hộ)「設備配送料（OP000019／020）」(phí giao thiết bị) đã được **giải quyết** (2026-10-06): lắp đặt hộ・hỗ trợ lắp đặt ban đầu・gói giao hàng lắp đặt ban đầu là cùng một thứ → **1 mục lắp đặt hộ (OP000007)・¥22,000 (đã gồm thuế)**. Phí giao thiết bị OP000019／020 giữ nguyên riêng như hiện tại (sổ tiếp nhận No.165).

### 4-5. Nơi giao hàng (nơi nhận hàng)

| Mục | Bắt buộc | Tối đa | Quy định | Nguồn |
|---|---|---|---|---|
| 「法人の住所情報と同じ」(giống thông tin địa chỉ doanh nghiệp) | — | — | Tích để sao chép địa chỉ doanh nghiệp (ở thêm cơ sở là địa chỉ doanh nghiệp đã đăng ký) | Form hiện hành §5 ⑦・§7 #10 |
| Tên nơi nhận hàng | ○ | 60 | — | Danh sách vấn đề 10/03 (1 dòng 60) |
| Furigana tên nơi nhận hàng | ○ | 60 | Katakana toàn góc・dấu kéo dài・dấu cách | Đặc tả kiểm tra nhập liệu §3, danh sách vấn đề 10/03 |
| Mã bưu điện | ○ | 8 | §9-2. Tìm địa chỉ (nếu không có kết quả vẫn có thể tiếp tục nhập tay) | Đặc tả kiểm tra nhập liệu §2 |
| Tỉnh／thành phố | ○ | — | Chọn từ 47 tỉnh／thành phố | Đặc tả kiểm tra nhập liệu §3-1 |
| Quận／thành phố・khu phố・số nhà | ○ | 255 | — | Danh sách vấn đề 10/03 (địa chỉ 255) |
| Tòa nhà・số phòng | — | 255 | — | Như trên |
| Số điện thoại | ○ | 20 | §9-2 | Đặc tả kiểm tra nhập liệu §2 |
| Số FAX | — | 20 | Cùng định dạng với điện thoại | Như trên |
| Số nhân viên ước tính | ○ | — | Lựa chọn (dropdown) | Form hiện hành §7 #13 |
| Ngày trong tuần không nhận hàng | — | — | Tích từ thứ Hai〜Chủ nhật＋**ngày lễ**. **Nếu tích đủ cả 7 ngày từ thứ Hai〜Chủ nhật thì chặn** (không liên quan ngày lễ＝dù chỉ còn ngày lễ chưa tích vẫn chặn.〔hong xác nhận 2026-10-15〕. Cũ: tất cả kể cả ngày lễ). Chặn và hiển thị 「お届けできる曜日を1つ以上残してください。」(hãy để lại ít nhất 1 ngày có thể giao hàng) (thông báo chung E664)〔hong trả lời 2026-10-15・sổ quyết định AK (AUTH-Q6)〕 | Form hiện hành §7 #12, đặc tả kiểm tra nhập liệu §3-3 |
| Khi rơi vào ngày không nhận hàng | ○ | — | Dời sớm lên ngày trước／dời muộn sang ngày sau | Form hiện hành |
| Lối vận chuyển vào・tài liệu đính kèm | — | — | **JPG・PNG・PDF・HEIC, 1 tệp 5MB, tối đa 10 tệp**. Không nhận Excel・Word. Thiết kế upload (nơi lưu・kiểm tra virus) do phát triển làm〔hong trả lời 2026-10-15・sổ quyết định AK (AUTH-Q8)〕 | Danh sách vấn đề 10/03 "đính kèm", STEP1 |
| Mong muốn về giao hàng (ngày trong tuần v.v.) | — | 500 | **Khách hàng không chọn mẫu giao hàng・chu kỳ giao hàng**. Mong muốn được nhận qua ghi chú giao hàng | 28-77・28-78 |

### 4-6. Hóa đơn (theo từng cơ sở)

| Mục | Bắt buộc | Quy định | Nguồn |
|---|---|---|---|
| Hóa đơn | ○ | Gửi hóa đơn cho doanh nghiệp／gửi hóa đơn cho cơ sở này | Form hiện hành §7 #7, 28-29 |
| Phương thức thanh toán (khi gửi hóa đơn cho cơ sở này) | ○ | Trích nợ tài khoản／chuyển khoản ngân hàng／thẻ tín dụng. Thẻ tín dụng giữ lại trong lựa chọn, thanh toán nằm ngoài hệ thống (ES chỉ giữ phân loại) | STEP1 "Phương thức thanh toán khi gửi hóa đơn cho nơi nhận hàng: bắt buộc", 28-32, S7 |
| Chu kỳ thanh toán (khi gửi hóa đơn cho cơ sở này) | ○ | Trả hàng tháng／trả hàng năm (mặc định trả hàng tháng) | Master đăng ký #4 |
| Thời điểm phát hành hóa đơn | — | Giống doanh nghiệp (không hỏi ở cơ sở) | Master đăng ký #4 |

### 4-7. Người phụ trách (theo từng cơ sở)

〔2026-10-18 sổ quyết định AT #17・sổ tiếp nhận #800〕「法人の担当者情報と同じ」(giống thông tin người phụ trách của doanh nghiệp) **sao chép toàn bộ bảng người phụ trách của doanh nghiệp (chính・phụ・hóa đơn). Là bản sao tại thời điểm đăng ký** (sau này đổi doanh nghiệp thì cơ sở cũng không đổi). Ô tích giữ ở bước 1, màn hình xác nhận hiển thị người đã được sao chép. Khi đăng ký tạm được đưa vào người phụ trách của cơ sở. Câu hướng dẫn 「共通情報を設定」(thiết lập thông tin chung) được sửa thành 「法人情報を入力」(nhập thông tin doanh nghiệp).

| Quy định | Nguồn |
|---|---|
| Bảng người phụ trách theo từng cơ sở (phân loại・tên người phụ trách・furigana・email・điện thoại・thêm／xóa dòng)＋ô tích 「**法人の担当者情報と同じ**」 | STEP1 "Cách giữ người phụ trách", form hiện hành §5 ⑦ |
| **Cơ sở: bắt buộc 1 người phụ trách chính** (không cần khi 「法人と同じ」(giống doanh nghiệp)). **Nếu nơi nhận hóa đơn＝cơ sở này thì người phụ trách hóa đơn cũng bắt buộc** | Đặc tả kiểm tra nhập liệu §3-2, form hiện hành §5 ⑦ |
| Khi chưa quyết định người phụ trách, người đăng ký có thể tạm đăng ký chính mình | Nguyên điển #20 (độ chắc chắn: trung bình) |
| Hướng dẫn trên màn hình rằng email hướng dẫn đăng nhập được gửi đến tất cả người phụ trách chính・phụ・hóa đơn của cơ sở này | 28-139 |
| Bãi bỏ cột 「納品先別の担当」(người phụ trách theo nơi nhận hàng) của form hiện hành | Form hiện hành §5 ⑦ |

### 4-8. Những gì thay đổi theo loại thiết bị

| | Tủ lạnh・tủ đông | Máy bán hàng tự động | Nguồn |
|---|---|---|---|
| Course・phương thức giao hàng | Chọn | Cố định ESライト（自販機）・ES配送便 | 28-19, đặc tả kiểm tra nhập liệu §3-3 |
| Tầng lắp đặt | Tùy chọn | Bắt buộc | Form hiện hành §6-3〔hong trả lời 2026-10-03 (A8＝C)〕 |
| Tùy chọn | 「申込に出す」(hiển thị ở đăng ký) của master | Như bên trái＋đổi wrapping máy bán hàng tự động | Sổ quyết định |
| Báo giá | Hiển thị số tiền | **Hiển thị số tiền ước tính**＋chú thích 「※自販機の金額は目安です。現場調査のあと、正式なお見積りをお送りします。」(※ số tiền máy bán hàng tự động là ước tính. Sau khảo sát hiện trường, chúng tôi sẽ gửi báo giá chính thức.)〔hong trả lời 2026-10-03 (A3)〕 | — |
| Chú thích | ES配送便 cần trao đổi trước | Như bên trái＋"Trước khi lắp đặt sẽ khảo sát hiện trường. Tùy kết quả khảo sát・tình trạng tồn kho, nếu không đáp ứng được yêu cầu thì có thể mất vài tháng mới xử lý được" | Form hiện hành §4, `決定_v2.3追補_プランマスタ_20260929.md` (tủ lạnh→máy bán hàng tự động cần khảo sát hiện trường) |
| Dùng thử | Chọn được | Không chọn được | STEP5 T2 |

- Đăng ký máy bán hàng tự động **không để ngoài hệ thống mà tiếp nhận bằng form đăng ký, số tiền báo giá riêng**〔STEP1, dòng 77 (10/02 "giữ nguyên đặc tả hiện tại")〕.
- Máy bán hàng tự động hiển thị số tiền tính được làm ước tính, với chú thích 「※自販機の金額は目安です。現場調査のあと、正式なお見積りをお送りします。」〔hong trả lời 2026-10-03 (A3). Cũ: báo giá riêng〕
  - Phí hàng tháng ước tính＝phí gói ESライト（自販機） (không gồm phí thuê・【tạm】 giống ライト（冷蔵庫）)＋**phí hàng tháng máy bán hàng tự động** (phí hàng tháng trong master dòng máy của máy bán hàng tự động tiêu chuẩn của gói × số máy). Phí ban đầu (master dòng máy) là dòng 1 lần ở lần xuất hóa đơn đầu tiên (triển khai 2026-10-05・sổ quyết định "Phí thuê máy bán hàng tự động")

---

## 5. Bước 2: Thông tin doanh nghiệp・người phụ trách・người đăng ký

### 5-1. Thông tin doanh nghiệp

〔2026-10-18 sổ quyết định AT #16・#824・sổ tiếp nhận #799・#824〕**Khi tất cả cơ sở đều là 「この拠点に請求」(gửi hóa đơn cho cơ sở này), không hiển thị tên doanh nghiệp nhận hóa đơn・phương thức thanh toán・chu kỳ thanh toán của doanh nghiệp (không kiểm tra・không lưu. Các mục bắt buộc ở bảng dưới không cần trong trường hợp này)**. Địa chỉ・điện thoại mặc định là 「拠点と同じ」(giống cơ sở) (chọn được cơ sở để sao chép). **Khi có 1 cơ sở, đưa nội dung của cơ sở vào tên doanh nghiệp・địa chỉ・điện thoại làm giá trị ban đầu (sửa được. Không ghi đè giá trị khách hàng đã nhập)**. Khi 1 cơ sở và 「法人に請求」(gửi hóa đơn cho doanh nghiệp) cũng vậy, đưa giá trị ban đầu vào khi chuyển sang bước 2. Khi sau này đổi sang 「法人に請求」 thì hỏi các mục hóa đơn của doanh nghiệp bằng đăng ký thêm cơ sở. "Không sao chép tên doanh nghiệp" ở bảng dưới là quy định khi có nhiều cơ sở (giá trị ban đầu khi 1 cơ sở có cả tên doanh nghiệp). Nhập thay của vận hành cũng vậy, nếu tất cả cơ sở là 「この拠点に請求」 thì không hiển thị các mục nơi nhận hóa đơn của doanh nghiệp.

| Mục | Bắt buộc | Tối đa | Quy định | Nguồn |
|---|---|---|---|---|
| 「お届け先（拠点）情報からコピー」(sao chép từ thông tin nơi giao hàng (cơ sở)) | — | — | Sao chép mã bưu điện・địa chỉ・số điện thoại. **Không sao chép tên doanh nghiệp** | Form hiện hành §7 #9, nguyên điển #20 |
| Tên doanh nghiệp | ○ | 60 | — | Danh sách vấn đề 10/03 |
| Furigana tên doanh nghiệp | ○ | 60 | Katakana toàn góc | Như trên |
| Tên doanh nghiệp nhận hóa đơn | ○ | 60 | Tên người nhận trên hóa đơn (nếu giống tên doanh nghiệp thì dùng cùng tên) | 28-61, đặc tả kiểm tra nhập liệu §3-1 |
| Mã bưu điện〜tòa nhà・số phòng (địa chỉ in trên hóa đơn) | ○ (tòa nhà tùy chọn) | 255 | Cùng quy tắc với §4-5 | 28-61 |
| Số điện thoại・số FAX | ○／— | 20 | §9-2 | Đặc tả kiểm tra nhập liệu |
| Phương thức thanh toán | ○ | — | Trích nợ tài khoản／chuyển khoản ngân hàng／thẻ tín dụng | 28-32, S7 |
| Chu kỳ thanh toán | ○ | — | Trả hàng tháng／trả hàng năm (mặc định trả hàng tháng). **Sau khi đăng ký, doanh nghiệp chỉ xem** | Master đăng ký #4 |
| Thời điểm phát hành hóa đơn (lead time phát hành hóa đơn) | ○ | — | Trước 3 tháng／trước 2 tháng／trước 1 tháng (tiêu chuẩn)／tháng hiện tại／tháng sau (trả sau). Mặc định trả trước (trước 1 tháng). **Sau khi đăng ký, doanh nghiệp chỉ xem** | Master đăng ký #4, 28-71 |

- Những gì **không hỏi** khi đăng ký: chế độ khách (guest mode)・giới hạn (sửa sau được ở quản lý cơ sở), số tiền doanh nghiệp chịu (vận hành hỏi khi tiếp nhận), đơn vị phát hành hóa đơn (vận hành thiết lập・doanh nghiệp chỉ xem)〔master đăng ký #4, 28-31〕.

### 5-2. Người phụ trách của doanh nghiệp

| Quy định | Nguồn |
|---|---|
| Bảng người phụ trách của doanh nghiệp (phân loại＝người phụ trách chính／người phụ trách hóa đơn／người phụ trách phụ・tên người phụ trách・furigana・email・điện thoại). **Bắt buộc 1 người chính・1 người phụ trách hóa đơn** | STEP1, STEP2 Q10, đặc tả kiểm tra nhập liệu §3-2 |
| Cùng một email được phép trùng trong bảng (1 người kiêm nhiều phân loại) | Đặc tả kiểm tra nhập liệu §3-2 |

### 5-3. Người đăng ký

| Tình huống | Quy định | Nguồn |
|---|---|---|
| Đăng ký mới không đăng nhập | **Bắt buộc họ tên・địa chỉ email・số điện thoại của người đang nhập (người đăng ký)**. Đầu phần 「法人情報を入力」 có thẻ 「お申し込み者」(người đăng ký). Email cũng kiểm tra định dạng. Bằng 「この方をメイン担当者にする」(đặt người này làm người phụ trách chính) sao chép sang người phụ trách chính trong bảng người phụ trách (furigana nhập lại). Liên lạc xác nhận gửi đến email này | 28-117 |
| Thêm cơ sở (đang đăng nhập) | Tài khoản đang đăng nhập là người đăng ký nên không hỏi họ tên v.v. Vì là tài khoản dùng chung, ở cột 「お申し込み者」 (radio・bắt buộc) của bảng 「法人情報・担当者」(thông tin doanh nghiệp・người phụ trách) trên màn hình xác nhận, **chọn từ người phụ trách đã đăng ký** (tài khoản doanh nghiệp＝người phụ trách của doanh nghiệp／tài khoản cơ sở＝người phụ trách của cơ sở đó) | 28-117, Web doanh nghiệp §1-2 |
| Màn hình vận hành | Ở chi tiết yêu cầu (thông tin yêu cầu) hiển thị người đăng ký・email người đăng ký・điện thoại người đăng ký và 「ログインなしで申込／ログイン中のアカウント」(đăng ký không đăng nhập／tài khoản đang đăng nhập) | 28-117 |

- Người đăng ký chọn 1 người từ người phụ trách〔hong trả lời 2026-10-03 (A2). Cũ: nhập riêng theo 28-117〕

---

## 6. Bước 3: Xác nhận và đồng ý

| Mục | Quy định | Nguồn |
|---|---|---|
| Kiểu xác nhận | Dạng bảng (hàng＝mục／cột＝cơ sở). Mỗi khối có 「修正する」 | 28-23, form hiện hành |
| Thứ tự hàng | Loại hợp đồng／loại thiết bị／gói mong muốn／course／bắt đầu hợp đồng／thời gian sử dụng tối thiểu／thiết bị／tùy chọn／số lần giao hàng／tổng phí gói → thông tin nơi nhận hàng → tài liệu đính kèm・ghi chú | Form hiện hành R03 |
| Chi tiết phí báo giá | §8 | — |
| Đồng ý (triển khai chính thức) | Bắt buộc đồng ý với **điều khoản sử dụng・chính sách quyền riêng tư (cung cấp lịch sử mua hàng cho doanh nghiệp triển khai)**. Đặt ở cuối | Nguyên điển #18, form hiện hành §3 |
| Đồng ý (dùng thử) | Dùng thử bắt buộc đồng ý cả 3: điều khoản sử dụng・chính sách quyền riêng tư・điều khoản chiến dịch〔hong trả lời 2026-10-03 (A5＝B)〕| — |
| Đối tượng chuẩn bị điều khoản・chính sách (tạm thời) | Ngoài doanh nghiệp・người dùng ứng dụng, mở rộng chuẩn bị đến **người dùng ESQR・công ty giao hàng ủy thác・nhà cung cấp・nhân viên giao hàng** (doanh nghiệp có thêm điều khoản chiến dịch). hong "có vẻ sẽ cần" → tạm thời (2026/10/09) | MM_20261009 ［02:30:01〜02:31:13］, sổ tiếp nhận #520 |
| Đích liên kết của điều khoản・chính sách | Đích liên kết (URL) của điều khoản sử dụng・chính sách quyền riêng tư・điều khoản chiến dịch để open cho đến khi nhận được nội dung・nơi công bố từ khách hàng (trên màn hình chỉ hiện chữ liên kết) | hong trả lời 2026-10-15・sổ quyết định AK (AUTH-Q7) |
| Gửi | Bấm xong thì vô hiệu hóa nút, không bấm được cho đến khi hiện số tiếp nhận (chống gửi trùng) | Đặc tả kiểm tra nhập liệu C7 |

---

## 7. Màn hình hoàn tất

| Mục | Quy định | Nguồn |
|---|---|---|
| Hiển thị | 「お申し込みを受け付けました」・số tiếp nhận `AP-YYYYMMDD-NNNN` | Danh sách email M1 |
| Hướng dẫn email | Thông báo đã gửi email hoàn tất tiếp nhận (kèm số tiếp nhận) đến **cả người đăng ký và người phụ trách chính** (cùng người thì 1 thư). Thông báo vận hành sẽ xác nhận nội dung và liên lạc trong 2〜3 ngày làm việc | 28-131, danh sách email M1 |
| Phỏng vấn khởi động | **Hướng dẫn URL đặt lịch phỏng vấn khởi động (`booking.receptionist.jp/kickoff-mtg-schedule/60min`) cho tất cả người đăng ký. Không hỏi trước về kinh nghiệm quản lý v.v., không phân nhánh theo câu trả lời** | Nguyên điển #17・REQ-CT-122, dòng 168 |
| Thêm cơ sở (tài khoản cơ sở) | 「追加した拠点は、このアカウントには出ません。結果はメールでお知らせします。承認後は新しい拠点の拠点アカウントと法人アカウントでご覧ください」(cơ sở đã thêm không hiển thị ở tài khoản này. Kết quả sẽ được thông báo qua email. Sau khi phê duyệt, vui lòng xem bằng tài khoản cơ sở của cơ sở mới và tài khoản doanh nghiệp) | H3＝A |
| Nút | Đến màn hình đăng nhập (không đăng nhập)／đến danh sách cơ sở (thêm cơ sở) | Form hiện hành R04 |

---

## 8. Báo giá (bảng bên phải) và chi tiết phí ở màn hình xác nhận

〔2026-10-18 sổ quyết định AT #13・sổ tiếp nhận #797〕Bảng bên phải chia thành **2 khung**: ① 「希望プラン n のお見積」(báo giá của gói mong muốn n) (nhãn cùng màu・số với dòng bên trái) ② 「お申し込み全体（n契約）」(toàn bộ đăng ký (n hợp đồng)) (xếp phí hàng tháng theo từng hợp đồng, **chỉ hiển thị lớn tổng toàn bộ**). Giải thích để ở 「？」. Đăng ký mới・thêm cơ sở・chuyển đổi・yêu cầu hợp đồng dùng cùng thành phần (`QuotePanel`).

| Mục | Cách tính・cách hiển thị | Nguồn |
|---|---|---|
| Tạm tính gói | Giá của master gói (thế hệ giá áp dụng). Phí gói hiển thị chưa gồm thuế | Form hiện hành ④ (bản nháp), 28-89 |
| Thiết bị | **Thiết bị cho thuê tiêu chuẩn miễn phí**. Kích cỡ lớn hơn tiêu chuẩn thì là **phần chênh lệch** so với dòng máy cùng phân loại tiêu chuẩn (dòng máy đã chọn − dòng máy tiêu chuẩn. Âm thì 0). Dòng máy không có trong tiêu chuẩn・số máy vượt tiêu chuẩn thì tính số tiền của các máy vượt. Số tiền là **phí spot (1 lần)** và **phí hàng tháng** của master dòng máy, hiển thị spot・hàng tháng ở **các dòng riêng** (tính phí nào do master quyết định theo từng thiết bị・có khi cả hai). Bảng bên phải hiển thị tách 「1回」(1 lần) và 「月額」(hàng tháng), spot không tính vào tổng hàng tháng. **Ở chuyển đổi, đưa phí hàng tháng của thiết bị dùng thử (những gì không có trong tiêu chuẩn・phần vượt tiêu chuẩn) vào tổng báo giá hàng tháng** (thiết bị cho thuê tiêu chuẩn miễn phí)〔hong 2026-10-15〕. Phí ban đầu của máy bán hàng tự động (giá trị ban đầu của OP000008) tính riêng | 28-89, STEP1,〔hong trả lời 2026-10-15・sổ quyết định AK "Cách tính chi phí thiết bị"・sổ tiếp nhận #642〕 |
| Thêm số lần giao hàng | (số lần đã chọn − tiêu chuẩn của gói) × OP000001 (¥10,000／lần・hàng tháng. Cũ: ¥3,000) | Master đăng ký #2 |
| Tạm tính tùy chọn | Số tiền của master tùy chọn. Phí một lần là 「初回」(lần đầu), không tính vào tổng hàng tháng | Master đăng ký #1 |
| Giảm giá chiến dịch (dùng thử) | **DC000013・số tiền giảm＝phí gói của gói 50・tủ lạnh・Lite (¥24,500). Không vượt quá số tiền hóa đơn. 1 doanh nghiệp 1 lần** (nơi nhận hóa đơn là doanh nghiệp thì 1 lần ở hóa đơn của doanh nghiệp・theo từng cơ sở thì cơ sở đầu tiên, nếu lẫn lộn thì 1 lần ở hóa đơn của doanh nghiệp). 1 cơ sở・50 Lite thì miễn phí, nhiều cơ sở・đổi gói・gia hạn thời gian thì tính phần chênh lệch | Sổ quyết định "Giảm giá dùng thử", STEP1 |
| Phí ban đầu・phí giao hàng khu vực | Vì không đưa ra được số tiền, **ở bảng bên phải của chuyển đổi〔§12〕・「拠点を追加」・đăng ký mới hiển thị 2 dòng 「初期費用（OP000008）」(phí ban đầu)「地域配送料」(phí giao hàng khu vực) là 「別途」(riêng)** (phí ban đầu do vận hành quyết định theo từng hợp đồng・phần cộng phí giao hàng khu vực tính riêng). Bảng bên phải của đăng ký mới không hiển thị dòng, mà truyền đạt bằng chú thích bên dưới 「初期費用・設置代行はESキッチンが設定します」(phí ban đầu・lắp đặt hộ do ES Kitchen thiết lập) (**cần xác nhận: đăng ký mới có hiển thị 2 dòng này không**) | 〔hong trả lời 2026-10-15・提案_639 §4・§6 ⑦・sổ quyết định AK "Nhập hợp đồng khi chuyển đổi・thêm cơ sở" ④〕 |
| Tổng báo giá | Hàng tháng (chưa gồm thuế). Chỉ cộng các cơ sở có số tiền, ghi kèm số cơ sở báo giá riêng (đưa 「（2拠点）」(2 cơ sở) vào tiêu đề) | Form hiện hành §6-5 |
| Máy bán hàng tự động | Hiển thị số tiền ước tính (phí gói＋phí hàng tháng máy bán hàng tự động＋phí ban đầu. Giá trị của master dòng máy), bắt buộc kèm chú thích〔hong trả lời 2026-10-03 (A3)〕 | — |

- Số tiền hiển thị dạng 「1,000円」・căn phải・ghi rõ (chưa gồm thuế)／(đã gồm thuế)〔danh sách vấn đề 10/03 "円"・UI〕.
- Thay đổi nhập liệu thì số tiền thay đổi ngay tại chỗ〔form hiện hành §7 #1〕.
- Phần gia hạn dùng thử không giảm giá (tính phí gói)〔hong trả lời 2026-10-03 (K1)〕.

---

## 9. Kiểm tra nhập liệu

### 9-1. Quy tắc chung (chung cho tất cả site・xác định 2026-10-03)

| Loại | Quy định | Nguồn |
|---|---|---|
| Chữ 1 dòng | **Tối đa 60 ký tự** (cả tên doanh nghiệp・tên cơ sở・tên nơi nhận hàng・tên người phụ trách・kana・tầng lắp đặt) | Sổ quyết định "Nhập chữ 1 dòng", danh sách vấn đề 10/03 |
| Địa chỉ | **Tối đa 255 ký tự** (quận／thành phố・khu phố・số nhà・tòa nhà) | Như trên |
| Ghi chú・yêu cầu (nhiều dòng) | **Tối đa 500 ký tự** | Như trên |
| Địa chỉ email | **Đến 60 ký tự** (cũ: varchar(160))〔hong trả lời 2026-10-03 (K8)〕 | 契約_03・04 |
| Số lượng | Theo loại: số máy 99／số lần・số tháng 99／số suất ăn 9,999 v.v. Số nguyên từ 0 trở lên | Danh sách vấn đề 10/03 |
| Số tiền | 0〜999,999,999. 「1,000円」 | Như trên |
| Ngày | yyyy-mm-dd／năm tháng yyyy-mm | Danh sách vấn đề 10/02 (8-1) |
| Đính kèm | JPG・PNG・PDF・HEIC, 5MB, 10 tệp | Danh sách vấn đề 10/03 |
| Loại ký tự | Không nhận emoji・ký tự điều khiển. Với tên・địa chỉ in trên hóa đơn・phiếu gửi hàng, ký tự ngoài JIS cấp 1・cấp 2 vẫn nhận nhưng cảnh báo 「請求書・送り状で正しく印字されない場合があります」(có thể không in đúng trên hóa đơn・phiếu gửi hàng) | Danh sách vấn đề 10/03 |
| Toàn góc→bán góc | Mã bưu điện・điện thoại・FAX・email・số lượng・số tiền dù nhập toàn góc cũng chuyển thành bán góc khi lưu | STEP3残り §4 "Kiểm tra nhập liệu" |
| Khoảng trắng đầu cuối | Loại bỏ rồi mới lưu・kiểm tra | Đặc tả kiểm tra nhập liệu C3 |
| Thời điểm kiểm tra | Ở 「次へ」(tiếp)「確認へ進む」(đến xác nhận) kiểm tra gộp tất cả mục trên màn hình. Lỗi là viền đỏ＋câu chữ dưới mục. Di chuyển đến lỗi đầu tiên. Ô trống chỉ hiển thị kiểm tra bắt buộc | Đặc tả kiểm tra nhập liệu C1・C2 |
| Vượt số ký tự | Lỗi (không tự cắt bớt) | Đặc tả kiểm tra nhập liệu C5 |

**Giá trị cũ đã thay thế**: 120／80／50 ký tự・ghi chú 1,000 ký tự (đề xuất)・đính kèm PDF・JPEG・PNG (đề xuất) của đặc tả kiểm tra nhập liệu §3 đã được thay bằng quy tắc chung ở trên〔sổ quyết định〕.

### 9-2. Kiểm tra định dạng

| Mục | Quy tắc | Câu chữ | Nguồn |
|---|---|---|---|
| Mã bưu điện | 7 chữ số. Có hay không có gạch nối đều được. Lưu có gạch nối (105-0011) | 郵便番号は数字7桁でご入力ください（ハイフンはあってもなくても構いません）。(vui lòng nhập mã bưu điện 7 chữ số (có hay không có gạch nối đều được)) | Đặc tả kiểm tra nhập liệu §2 |
| Số điện thoại | Chỉ chữ số và gạch nối. Đầu là chữ số. Bỏ gạch nối thì 10 hoặc 11 chữ số. Tối đa 20 ký tự | Chung E06 「10〜11桁の数字でご入力ください（ハイフン可）」(vui lòng nhập 10〜11 chữ số (được dùng gạch nối)) (cũ: 電話番号は数字とハイフンだけでご入力ください。) | Như trên, hong trả lời 2026-10-15・sổ quyết định AK (AUTH-Q3) |
| Địa chỉ email | Có ký tự trước và sau `@`, sau `@` có `.`. Tên miền không chứa ký tự toàn góc | Chung E07 「形式をご確認ください」(vui lòng kiểm tra định dạng) (cũ: メールアドレスの形式が正しくありません。) | Như trên, sổ quyết định AK (AUTH-Q3) |
| Katakana | Katakana toàn góc・dấu kéo dài・dấu cách | 【項目名】は全角カタカナでご入力ください。(vui lòng nhập 【tên mục】 bằng katakana toàn góc) | Như trên |
| Bắt buộc | — | Mục nhập: 【項目名】をご入力ください。(chung E01). Mục chọn: chung E02 「お選びください」(vui lòng chọn) (cũ: 「【項目名】を選択してください。」) | Như trên, sổ quyết định AK (AUTH-Q3) |

---

## 10. Tiếp nhận của vận hành (Quản lý yêu cầu hợp đồng ＞ Hợp đồng mới)

### 10-1. Danh sách

| Mục | Quy định | Nguồn |
|---|---|---|
| Menu | 1 mục 「契約申請管理」(quản lý yêu cầu hợp đồng). **Huy hiệu số việc cần xử lý** (đăng ký mới đang tiếp nhận・đang thiết lập hợp đồng＋thay đổi・tạm ngưng・hủy hợp đồng đang chờ phê duyệt・phê duyệt một phần). Rê chuột vào thì hiện chi tiết | 28-132, trả lời xác nhận v1.73・v1.74 (A: giữ như hiện tại) |
| Tab | 新規契約 (hợp đồng mới)／契約変更 (thay đổi hợp đồng)／休止・解約 (tạm ngưng・hủy hợp đồng) | Màn hình hiện tại (`lib/ops/applications/constants.ts`) |
| Trạng thái | 受付中／契約設定中／完了／却下／取り下げ済み. Dòng từ chối・đã rút lại không mở màn hình tiếp nhận mà hiển thị lý do và ngày giờ | 28-63 |
| Dấu nhập thay | Đăng ký nhập thay có dấu 「代理入力」(nhập thay) trong danh sách. Lưu kênh tiếp nhận (điện thoại・kinh doanh・giấy v.v.) và người nhập | 28-33 |
| Thành phần | PageHeader (xuất CSV・新規登録（代理入力）)＋Tabs＋SearchPanel＋Table＋Pagination. Mở bằng liên kết ID yêu cầu | 28-114 |
| 「編集」 ở danh sách | Mỗi dòng của tab hợp đồng mới có cột thao tác và **nút 「編集」(sửa)** (bút chì). Bấm thì mở màn hình tiếp nhận ở chế độ sửa (?edit=1). Nếu đang xác nhận nội dung đăng ký thì sửa nội dung đăng ký, nếu đang thiết lập thông tin chi tiết thì mở **cơ sở cuối cùng theo thứ tự người đăng ký thêm vào, trong các cơ sở chưa xác định**. **Không hiển thị nút với yêu cầu đã từ chối・đã rút lại・hoàn tất, yêu cầu mà tất cả cơ sở đã xác định, và người không có quyền sửa** (chỉ xem chi tiết) | Sổ quyết định AT・sổ tiếp nhận #817 |
| Người dùng có quyền xem | Các ô chỉ đọc, ẩn các nút thao tác không có quyền | 28-110 |

### 10-2. Các giai đoạn của chi tiết yêu cầu (mới)

```
① Tiếp nhận (xác nhận nội dung đăng ký) ── hoàn tất xác nhận nội dung đăng ký ──▶ ② Đăng ký tạm ──▶ ③ Thiết lập thông tin chi tiết ── 「この拠点を確定」 theo từng cơ sở ──▶ ④ Đăng ký chính thức (xác định)
```

| Giai đoạn | Việc vận hành làm | Những gì được tạo・chạy | Nguồn |
|---|---|---|---|
| ① Tiếp nhận (xác nhận nội dung đăng ký) | Tab: 申請内容 (nội dung yêu cầu)／配送の設定 (thiết lập giao hàng)／開始スケジュール (lịch bắt đầu)／共通情報 (thông tin chung). **Ở thiết lập giao hàng, quyết định kho picking (bắt buộc) và số lần giao hàng theo từng cơ sở・loại giao hàng** (1 bảng・gộp các cột cơ sở). Nếu chưa nhập kho thì tab có 「要入力」(cần nhập), bấm hoàn tất xác nhận thì chuyển sang tab đó. Với dùng thử bắt đầu từ nửa sau, chọn khung chuyến đầu tiên (ví dụ C2) ở đây. **Kiểm tra có giới thiệu hay không (mã đại lý) và có thuộc chiến dịch chuyển từ công ty khác hay không** (chuyển đổi không tự động xác định・upload chứng từ là tùy chọn) | — | 28-93, 28-115, 28-145①, STEP5 T1'''', nguyên điển #21・REQ-CT-117 |
| ② Đăng ký tạm (hoàn tất xác nhận nội dung đăng ký) | Ở modal xác nhận (Dialog) kiểm tra những gì sẽ tạo và 「ログイン案内メールの宛先」(người nhận email hướng dẫn đăng nhập). Ô tích 「アカウントを発行する」(phát hành tài khoản) (**mặc định ON**) | **Doanh nghiệp (khi mới)・cơ sở・hợp đồng cha・tài khoản doanh nghiệp・tài khoản cơ sở** (không tạo hợp đồng con. Tạo ở đăng ký chính thức: sổ quyết định R・2026-10-09). **Tự động tạo đơn hàng (triển khai chính thức＝doanh nghiệp nhập được／dùng thử＝tự động sinh) và đơn hàng vật tư (bộ khởi tạo)**. Màn hình hoàn tất đặt doanh nghiệp và tài khoản doanh nghiệp ở trên, bên dưới 1 dòng＝1 cơ sở xếp cơ sở・hợp đồng cha・đơn hàng・bộ khởi tạo vật tư・tài khoản cơ sở kèm ID | STEP1, 28-94・95・109, 28-145②③ |
| ③ Thiết lập thông tin chi tiết | Tab (gạch chân ngang・tối đa 6): **法人 (doanh nghiệp)／拠点 (cơ sở)／親契約 (hợp đồng cha)／子契約 (hợp đồng con)／設備・オプション (thiết bị・tùy chọn)／料金・請求 (phí・hóa đơn)**. Tab chưa lưu có 「未保存」(chưa lưu). Trước tiên hiển thị dạng xem, bấm 「編集」 ở phía trên màn hình để thành ô nhập (**cho đến khi bấm, tất cả ô đều không nhập được**. Chỉ mở tab thì không thành chế độ sửa. Sửa・hủy・lưu ở 1 chỗ phía trên màn hình, chuyển tab cũng không đổi vị trí・tên. Cơ sở đã đăng ký chính thức・đăng ký đã hoàn tất chỉ xem) | — | 28-113, 28-116 |
| ④ Đăng ký chính thức (xác định cơ sở) | 「この拠点を確定」(xác định cơ sở này) ở cột thao tác của dòng trong danh sách cơ sở. **Chỉ bấm được khi đủ các mục bắt buộc** | **Hợp đồng con・lịch dự kiến・dữ liệu giao hàng**, dữ liệu giao hàng của bộ khởi tạo vật tư. Hợp đồng cha đăng ký tạm → hiệu lực, cơ sở đăng ký tạm → đăng ký chính thức. Nếu đăng ký tạm với tài khoản OFF thì phát hành tại đây | Danh sách vấn đề 10/02 "đăng ký tạm → đăng ký chính thức khi vận hành xác nhận đã đủ dữ liệu nhập", 28-109, 28-130, STEP1 |
| Hoàn tất | Xác định tất cả cơ sở thì đăng ký thành 「完了」 | — | 28-63 |

- **Doanh nghiệp・cơ sở・hợp đồng cha đăng ký tạm và thiết lập của hợp đồng con (gói・lộ trình giao hàng v.v.. Bản thân hợp đồng con được tạo ở đăng ký chính thức) được sửa ở chi tiết yêu cầu (thiết lập thông tin chi tiết).** Màn hình doanh nghiệp・hợp đồng (danh sách・chi tiết) chỉ xem (cột thao tác của danh sách là 「申請で編集」(sửa ở yêu cầu), chi tiết có 「申請詳細で編集」(sửa ở chi tiết yêu cầu) và dải 「仮登録中です（申請 AP-… の詳細情報設定中）」(đang đăng ký tạm (đang thiết lập thông tin chi tiết của yêu cầu AP-…))). **Sau đăng ký chính thức thì sửa ở màn hình doanh nghiệp・hợp đồng**〔28-146〕.
- **Không đặt khung riêng hiện dưới tất cả các tab như 「受付のそのほかの設定（共通データ）」(các thiết lập khác của tiếp nhận (dữ liệu chung))** (sổ quyết định vận hành A Q1・292. Triển khai 2026-10-15). Các ô được đưa vào tab phù hợp nội dung, với đăng ký nhiều cơ sở thì **chỉ hiển thị phần của cơ sở đang chọn**. Nơi đặt: tháng chu kỳ bắt đầu・cách xử lý tháng bắt đầu sau hạn chót・nguồn giới thiệu＝「開始スケジュール」 của ① xác nhận nội dung đăng ký (chỉ trước đăng ký tạm. Nguồn giới thiệu sau đăng ký tạm vẫn sửa được ở tab hợp đồng cha)／lưu ý tiếp nhận・cảnh báo trùng dùng thử＝phía trên 「申請内容」 của ① và 「親契約」 của ③／mẫu số lượng cơ sở＝hợp đồng con／phí ban đầu＝phí・hóa đơn／khảo sát hiện trường (khi chuyển đổi là máy bán hàng tự động)・phương án điều chuyển thiết bị (chuyển đổi)＝thiết bị・tùy chọn／lịch sử thay đổi tiếp nhận＝cơ sở. Lưu bằng 1 nút 「保存」(lưu) phía trên màn hình (phương án điều chuyển thiết bị・cách xử lý tháng bắt đầu sau hạn chót cũng lưu cùng).
- **Phía trên tất cả các tab hiển thị 1 dải cố định (sticky) mảnh 1 dòng** (2026-10-15 hong・sổ tiếp nhận #646): loại đăng ký (mới／thêm cơ sở／chuyển đổi. Dùng thử thêm trong ngoặc)・cơ sở (đang chọn. Xác nhận nội dung đăng ký là 「全n拠点」(tất cả n cơ sở))・chu kỳ bắt đầu (YYYY年M月)・trạng thái. Không kèm câu giải thích. Cách gọi loại đăng ký là tạm (⚠️ Cần xác nhận).
- Hợp đồng đăng ký tạm không là đối tượng của job hằng ngày nào. Hợp đồng con・lịch dự kiến・dữ liệu giao hàng được tạo ở đăng ký chính thức〔28-109 (đặc tả tích hợp quyết định v2.3 #52)〕.

### 10-3. Những gì nhập ở thiết lập thông tin chi tiết

| Tab | Những gì nhập | Nguồn |
|---|---|---|
| Doanh nghiệp | Khi là doanh nghiệp mới thì 「法人｜基本情報・請求」(doanh nghiệp｜thông tin cơ bản・hóa đơn): tên doanh nghiệp・furigana・tên doanh nghiệp (hợp đồng)・tên doanh nghiệp nhận hóa đơn・địa chỉ in trên hóa đơn・điện thoại・người phụ trách của doanh nghiệp・**đơn vị phát hành**・lead time・phương thức thanh toán・trạng thái thủ tục trích nợ tài khoản (chỉ khi trích nợ tài khoản・bắt buộc)・chu kỳ thanh toán・tháng khởi tính (chỉ khi trả hàng năm・bắt buộc)・ID nơi phát hành Bill One・**người phụ trách kinh doanh ES (chọn từ người dùng vận hành)**・hạn thanh toán. **Doanh nghiệp hiện có (chuyển đổi・thêm cơ sở) cũng hiển thị tab doanh nghiệp (chỉ cơ sở đầu tiên). Mở ở trạng thái xem, bấm 「編集」 phía trên màn hình thì sửa được (lưu thì bản ghi doanh nghiệp〔tên doanh nghiệp・địa chỉ・điện thoại・điều kiện hóa đơn・người phụ trách〕 thay đổi, lưu vào lịch sử thay đổi của doanh nghiệp. Không đổi trạng thái doanh nghiệp・người phụ trách kinh doanh ES). Chỉ khi tạo doanh nghiệp mới, tab doanh nghiệp là mục nhập bắt buộc (là đối tượng sửa ngay từ đầu)**〔2026-10-15 hong・sổ tiếp nhận #647〕. 「請求情報」(thông tin hóa đơn) bên phải màn hình tiếp nhận không hiển thị với doanh nghiệp mới | 28-61, 28-64, 28-67, 28-75, 28-92 |
| Cơ sở | **「申込メモ」(ghi chú đăng ký) trong thông tin cơ bản (ghi chú nội bộ của toàn bộ đăng ký. Chỉ vận hành・không hiển thị cho doanh nghiệp. 「申請情報」 của tab nội dung yêu cầu cũng có ô giống vậy. Lưu bằng 1 nút lưu phía trên màn hình・lưu vào lịch sử thay đổi. Giới hạn 500 ký tự là tạm＝⚠️ Cần xác nhận)**・thông tin cơ bản・hóa đơn (nơi nhận hóa đơn・ghi đè lead time・phương thức thanh toán・thủ tục trích nợ tài khoản・chu kỳ thanh toán・ID nơi phát hành Bill One. Bắt buộc khi nơi nhận hóa đơn＝cơ sở này)・bảng người phụ trách (sửa tại chỗ. Tên người phụ trách và email bắt buộc・từ 1 người chính trở lên)・ngày trong tuần không nhận hàng (tích・thứ Hai〜Chủ nhật・ngày lễ)・tòa nhà v.v.・điện thoại người phụ trách・hạn thanh toán・tháng khởi tính・tài liệu (**tự động lưu**) | 28-61, 28-75, 28-82, 28-92 |
| Hợp đồng cha | Loại hợp đồng・**tháng chu kỳ bắt đầu** (ví dụ: 2026年10月 (A1 2026/09/28). **Nhập bằng bộ chọn tháng chung (lịch)**. Phạm vi chọn được chưa quyết định＝⚠️ Cần xác nhận). Ngày bắt đầu hợp đồng là trường xem tự động đưa A1 vào. **Thời gian sử dụng tối thiểu không thiết lập ở hợp đồng** (master dòng máy・theo từng thiết bị) | 28-70, 28-34 |
| Hợp đồng con | Gói・course・**lộ trình giao hàng** (theo từng loại giao hàng: kho picking・công ty vận tải・công ty giao nhận・trung chuyển 1・lead time・mẫu giao hàng・chu kỳ giao hàng)・**ngày giao bộ khởi tạo vật tư (bắt buộc)**・thiết lập sử dụng ứng dụng (tháng chu kỳ này)・số tiền doanh nghiệp chịu (áp dụng phúc lợi)・điều chỉnh giá (tháng chu kỳ này) | 28-77, 28-144②ⅺ, 28-145①④, 28-134 |
| Thiết bị・tùy chọn | **Gộp thiết bị・tùy chọn・chi phí vào "1 bảng sửa được"** (đã bỏ 2 bảng điều chuyển thiết bị・tùy chọn・giảm giá và lớp "phương án chi phí" của phương án điều chuyển thiết bị.〔2026-10-15 hong・sổ tiếp nhận #651〕). Dòng＝thiết bị (thiết bị của đăng ký có sẵn thành dòng từ đầu. Chuyển đổi dùng thử→triển khai chính thức thì so sánh thiết bị dùng thử với thiết bị cho thuê tiêu chuẩn của gói: tiếp tục・thay thế・thêm・thu hồi)・tùy chọn・giảm giá (có dấu: ＋tính phí／−giảm giá). Cạnh dòng hiển thị phí hàng tháng・spot (chưa gồm thuế) của dòng đó, **sửa dòng (điều chuyển・dòng máy・số máy・ghi chú・thêm・xóa) thì chi phí・tổng được tính lại** (số tiền vận hành đã sửa được giữ lại). Tính vào tổng là chi phí của dòng đã thêm (phần ghi vào ① số tiền cố định của tab phí・hóa đơn. Thiết bị cho thuê tiêu chuẩn miễn phí). Lưu bằng 1 nút lưu phía trên màn hình. ⚠️ Cần xác nhận: quan hệ với phương án thay đổi thiết bị (申請・承認 §6)〔phạm vi phản ánh vào cho thuê・chi phí hợp đồng con khi phê duyệt〕・cách tính phí phần vượt tiêu chuẩn trong thiết bị của đăng ký・chi phí khi thêm dòng 「追加」(thêm) ở chuyển đổi. Ngày mong muốn vận chuyển vào・ngày dự kiến lắp đặt (1 ô). Tùy chọn loại A (ES-QR・thêm số lần giao hàng v.v.) không đưa vào bảng điều chuyển, mà tự động lập ở ① của hợp đồng con | 28-74, 28-87, 28-89, 28-91, 28-43 |
| Phí・hóa đơn | Xem: ① bảng số tiền cố định・chi tiết (ban đầu／hàng tháng／một lần／giảm giá). **Không hiển thị ② quyết toán theo thực tế** (hợp đồng con đầu tiên được lập sau kiểm kê) | 28-90 |

**Quy định lộ trình giao hàng (tab hợp đồng con)**　〔2026-10-15 hong・sổ tiếp nhận #652: bảng này là **cùng 1 thành phần chung** (RouteTable) với thiết lập lộ trình giao hàng của sửa hợp đồng (hợp đồng con). Giao diện・nhập liệu・kiểm tra (bắt buộc・khi không trung chuyển thì công ty vận tải＝công ty giao nhận・số chu kỳ giao hàng＝số lần giao hàng・không cho số lần giao hàng 0) giống nhau. Bảng đơn giản 「配送の設定（倉庫・配送回数）」(thiết lập giao hàng (kho・số lần giao hàng)) của xác nhận nội dung đăng ký là riêng (chỉ kho・số lần), chỉ dùng chung kiểm tra 0 lần〕

| Mục | Quy định | Nguồn |
|---|---|---|
| Công ty vận tải (công ty giao hàng ①)・công ty giao nhận (công ty giao hàng ②) | **Cả ①② luôn bắt buộc.** Khi không trung chuyển thì nhập cùng một công ty vào cả hai | Sổ quyết định "Thiết lập giao hàng của hợp đồng con" (10/03. Thay thế "② chỉ khi có trung chuyển" của 28-84・28-144ⅺ) |
| Trung chuyển 1 | Chọn rõ 「なし」 (mặc định 「なし」・bắt buộc) | Sổ quyết định |
| Lựa chọn | Toàn bộ master công ty giao hàng (công ty vận tải・đơn vị giao hàng ủy thác・xe của công ty) theo từng phân loại. Trung chuyển 1 là toàn bộ điểm trung chuyển (HU) của master kho | 28-83 |
| Giá trị mặc định | Bằng 「エリアの既定値を入れる」(nhập giá trị mặc định của khu vực) đưa giá trị mặc định theo kho vào rồi sửa | 28-77 |
| Mẫu giao hàng | Lạnh・đông lạnh bắt đầu bằng chu kỳ ES (vật tư giao theo từng lần) | 28-88 |
| Chu kỳ giao hàng | Đúng bằng số lần giao hàng, bấm vào bảng tuần A〜D×thứ Hai〜Chủ nhật để chọn (không chọn vượt số lần・**không chọn được cột ngày không nhận hàng**). Đặc biệt là ngày 1〜28／ngày cuối tháng | 28-81, 28-86 |
| Số lần giao hàng | Số lần của đăng ký là giá trị ban đầu・vận hành sửa được. **Giá trị ban đầu: nếu có giá trị nhập ở đăng ký Web doanh nghiệp thì dùng giá trị đó, nếu không thì hợp đồng hiện có của doanh nghiệp đã đăng ký (số lần của chuyến mới nhất của dùng thử・cơ sở khác. Ưu tiên cùng course), nếu cũng không có thì tiêu chuẩn của gói. Để nguyên 0 lần thì không đăng ký tạm được (lỗi dưới mục・không bấm được 「申込内容の確認を完了」(hoàn tất xác nhận nội dung đăng ký)・máy chủ cũng từ chối. Lạnh từ 1 lần trở lên, ES Standard thì đông lạnh cũng từ 1 lần trở lên. Câu chữ là tạm)**〔2026-10-15 hong・sổ tiếp nhận #649〕. Phần tổng vượt tiêu chuẩn của gói thì OP000001 tự động lập ở ① của hợp đồng con. Dưới bảng có "tổng／tiêu chuẩn của gói／số lần thêm và phí hàng tháng" | 28-85 |
| Đổi kho・số lần giao hàng sau đăng ký tạm | Sửa được nhưng hiển thị thông báo "ảnh hưởng đến đơn hàng・bộ khởi tạo vật tư đã tạo", vận hành xem lại đơn hàng | 28-100 |
| Sau khi xác định | Lộ trình giao hàng chỉ xem. Khi sửa thì ở màn hình cơ sở | 28-79 |

### 10-4. Đơn hàng・bộ khởi tạo vật tư (những gì tạo ở đăng ký tạm)

| Mục | Triển khai chính thức | Dùng thử | Nguồn |
|---|---|---|---|
| Đơn hàng | Bằng việc phát hành tài khoản, **doanh nghiệp có thể đặt hàng (đăng ký số lượng)**. Dù cơ sở chưa có tài khoản, nếu đã có tài khoản doanh nghiệp thì doanh nghiệp đặt hàng được. Nếu không có cả hai thì đến hạn chót dùng số lượng tiêu chuẩn (giống chưa đặt hàng). **Nhập được nếu đang trong kỳ đặt hàng của tháng chu kỳ bắt đầu** | **Tự động sinh**. **Phân bổ** giới hạn số lượng cung cấp hàng tháng của gói **cho tất cả sản phẩm** (chênh lệch giữa vùng nhiệt độ・chuyến tối đa ±1, phần lẻ tính từ chuyến giao đầu tiên). **Doanh nghiệp không sửa được (chỉ hiển thị dạng xem)**. Vận hành có thể tinh chỉnh cả số lượng lẫn sản phẩm **cho đến ngày chốt đặt hàng** | 28-94・95・97・98・101・102・105, STEP5 QC・T2・T5 |
| Bộ khởi tạo vật tư | 「初期セットの数量」(số lượng bộ khởi tạo) của master vật tư (vật tư × gói). **Miễn phí**. Tại thời điểm đăng ký tạm, sao chép số lượng của master vào đơn hàng (sau này sửa master cũng không đổi). Ngày giao ở tab hợp đồng con của thiết lập thông tin chi tiết (bắt buộc). Dữ liệu giao hàng tạo ở đăng ký chính thức. **Bộ khởi tạo không tính vào số lần đặt hàng vật tư 1 lần mỗi tháng** | Như bên trái | 28-106〜108, 28-129・130, 28-145①, 28-168, STEP5 (OP000036) |
| Khi từ chối・rút lại | **Hủy** đơn hàng・bộ khởi tạo vật tư đã tạo | Như bên trái | 28-99 |

### 10-5. Tháng chu kỳ bắt đầu và hạn chót đặt hàng

| Tình huống | Quy định | Nguồn |
|---|---|---|
| Tháng bắt đầu khách hàng chọn được | Đăng ký trước hạn chót (mặc định ngày 15 tháng trước) thì từ tháng sau trở đi, đăng ký sau hạn chót thì từ tháng sau nữa trở đi | Dòng 159, REQ-CT-225・257 |
| Tháng chu kỳ bắt đầu ở màn hình tiếp nhận (chi tiết yêu cầu) | Bộ chọn tháng (lịch). **Tháng tối thiểu cùng quy tắc với Web doanh nghiệp** (ngày đăng ký trước hạn chót thì tháng sau, sau thì tháng sau nữa. Dùng chung cùng hàm `minStartOf`). Không chọn được tháng trước đó, máy chủ cũng từ chối (cho qua khi không sửa giá trị đã có). **Giới hạn trên không có trong đặc tả＝cần xác nhận** | hong trả lời 2026-10-15・sổ tiếp nhận #654 |
| Màn hình tiếp nhận | Hiển thị 「締切まであと○日」(còn ○ ngày đến hạn chót). Nơi đặt là phía trên tab 「開始スケジュール」 của xác nhận nội dung đăng ký (sổ quyết định vận hành A 2026-10-07 Q19) | 28-27 |
| Khi hoàn tất xác nhận nội dung đăng ký đã quá hạn chót đặt hàng của chu kỳ đó | Khi phê duyệt sau hạn chót, vận hành chọn 「翌サイクルへ繰り下げ」(lùi sang chu kỳ sau) hoặc 「運営が代理オーダー」(vận hành đặt hàng thay) (STEP1・T5 E-7'. Không dùng tự động lùi của 28-27)〔hong trả lời 2026-10-03 (A1＝A)〕. Ở màn hình tiếp nhận, với đăng ký đang tiếp nhận đã quá hạn chót thì chọn ở tab 「開始スケジュール」 (lùi＝đưa tháng chu kỳ bắt đầu sang chu kỳ sau kịp hạn chót／đặt hàng thay＝vận hành đặt hàng thay và bắt đầu từ tháng mong muốn. Chọn thì lưu ngay, lưu vào lịch sử thay đổi, phản ánh ở đăng ký tạm). ⚠️ Cần xác nhận: cách xử lý khi không chọn (code mặc định là lùi＝giống hộp thoại phê duyệt của yêu cầu thay đổi. Ghi chú xác nhận vận hành A Part 5 Q22)| — |
| Khi hóa đơn lần đầu không kịp xác định ngày 25 | Gộp 2 tháng vào hóa đơn tiếp theo (lần đầu) | `決定_STEP3追補_請求ルール_20261001.md` P3 |
| Đơn hàng tăng thêm ở đăng ký phê duyệt sau hạn chót | Đặt hàng bổ sung (kịp B7 thì từ nửa đầu chu kỳ sau, nếu D7 thì từ nửa sau) | `決定_STEP6回答_発注仕入先_20261001.md` Q5, `決定_シナリオ説明書の確認_20261002.md` ① |

### 10-6. Phát hành tài khoản

| Mục | Quy định | Nguồn |
|---|---|---|
| Khi nào | **Khi đăng ký tạm** (ô tích 「アカウントを発行する」・mặc định ON). Nếu OFF thì khi đăng ký chính thức | STEP1, 28-145② |
| Cái gì | **Tài khoản doanh nghiệp (1 cho doanh nghiệp) và tài khoản cơ sở (theo từng cơ sở)**. Đăng nhập là tài khoản dùng chung | 28-145②, Web doanh nghiệp §1 |
| Dùng được từ khi nào | Kích hoạt trước ngày bắt đầu đặt hàng của chu kỳ đầu tiên (đặt hàng・thiết lập được) | 契約_01 §6-3 |
| Người nhận email hướng dẫn đăng nhập | **Tất cả người phụ trách chính・phụ・hóa đơn** của từng doanh nghiệp・cơ sở. Nếu người đăng ký không nằm trong người phụ trách thì gửi cả cho người đăng ký. Cùng tài khoản mà 1 người thuộc nhiều phân loại thì 1 thư. ID đăng nhập khác nhau thì gửi riêng | 28-139, 28-145② |
| Nội dung | Email No.2 của phase 1 (ID đăng nhập・mật khẩu ban đầu).〔2026-10-18 sổ quyết định AT #36・sổ tiếp nhận #814・#821: không đưa câu 「初回ログイン後は必ずパスワードを変更してください」(sau lần đăng nhập đầu tiên bắt buộc đổi mật khẩu). Luôn gửi mật khẩu ban đầu. Khi muốn đổi thì đặt lại〕 | S (đính chính §1), danh sách email M2 |
| Gửi lại | Từ chi tiết yêu cầu 「ログイン案内メールを再送」(gửi lại email hướng dẫn đăng nhập) (cùng người nhận) | 28-139 |
| Cách giữ hiệu lực・dừng | Giữ ở chính tài khoản (không quyết định từ trạng thái hợp đồng) | TL-5, 契約_01 §6-3 |

### 10-7. Từ chối・rút lại

| Mục | Quy định | Nguồn |
|---|---|---|
| Từ chối | 「却下」(từ chối) (outline negative) ở màn hình tiếp nhận (xác nhận nội dung đăng ký). **Lý do bắt buộc** (lựa chọn mẫu＋ghi tự do). Thông báo cho doanh nghiệp. Không làm trả lại (khi muốn sửa thì đăng ký lại) | 28-25, 28-63, 28-111 |
| Rút lại | Rút lại đăng ký mới được biểu thị bằng trạng thái 「取り下げ済」(đã rút lại) | 28-63 |
| Xử lý những gì đã tạo | Khi từ chối・rút lại sau đăng ký tạm, hủy đơn hàng・bộ khởi tạo vật tư đã tạo (28-99). **Đồng thời tự động: cơ sở・hợp đồng cha＝「取消」(hủy) (nếu có hợp đồng con thì cũng vậy)** (không xóa. Mặc định không hiển thị ở danh sách, xem được bằng bộ lọc), **tài khoản doanh nghiệp・cơ sở＝dừng**, **doanh nghiệp mới tạo bằng đăng ký này＝「取消」** (doanh nghiệp hiện có của 「拠点を追加」 giữ nguyên) | 28-99〔hong trả lời 2026-10-03 (A12＝A)〕 |

### 10-8. Nhập thay・CSV hàng loạt

| Mục | Quy định | Nguồn |
|---|---|---|
| Lối vào | Chỉ 「新規登録（代理入力）」 ở tab 「新規契約」 của quản lý yêu cầu hợp đồng | 28-33 |
| Nhập | Cùng mục・cùng kiểm tra với Web doanh nghiệp＋mục chỉ dành cho vận hành (**kênh tiếp nhận (bắt buộc)**・người nhập・người phụ trách kinh doanh ES・loại hợp đồng (triển khai chính thức／dùng thử／chuyển đổi)・số tháng dùng thử・có phát hành tài khoản không v.v.) | 28-33, đặc tả kiểm tra nhập liệu §5 |
| Sau khi đăng ký | Cùng luồng từ tiếp nhận (xác nhận nội dung đăng ký) | 28-33 |
| CSV hàng loạt | **Có** (tạo hàng loạt đăng ký mới). Nhập gồm 2 giai đoạn (kiểm tra→đăng ký), chỉ loại bỏ các khóa (dòng) có lỗi và đăng ký phần còn lại (sổ quyết định AL・2026-10-16. Cũ: có lỗi thì không đăng ký gì) | Danh sách vấn đề 10/03, `CSV入出力_定義_20261003.md` (quy định nhập chung). Cột ở 10-8-1 bên dưới〔hong trả lời 2026-10-03 (A11＝A)〕 |

---

#### 10-8-1. Nhập CSV đăng ký mới (vận hành・nhập thay hàng loạt)〔hong trả lời 2026-10-03 (A11＝A)〕

| Mục | Quy định |
|---|---|
| 1 dòng | **1 dòng＝1 cơ sở (hợp đồng)**. Gộp các dòng có cùng 「法人キー」(khóa doanh nghiệp) thành **1 đăng ký** (mục doanh nghiệp dùng dòng đầu tiên của khóa doanh nghiệp đó. Nếu khác nhau giữa các dòng thì lỗi) |
| Sau khi đăng ký | Mỗi đăng ký thành **受付中** (trước xác nhận nội dung đăng ký). **Sau đó cùng luồng với đăng ký đến từ màn hình** (xác nhận nội dung đăng ký → đăng ký tạm → thiết lập thông tin chi tiết → đăng ký chính thức). Không đưa trực tiếp từ CSV vào đăng ký tạm・đăng ký chính thức |
| Quy định nhập | Nhập chung cho tất cả site (2 giai đoạn: kiểm tra→đăng ký, chỉ loại bỏ khóa (dòng) lỗi và đăng ký phần còn lại (sổ quyết định AL・2026-10-16. Cũ: chỉ cần 1 lỗi thì không đăng ký gì), tối đa 5,000 dòng, lịch sử nhập). Kiểm tra giống nhập trên màn hình (§9) |
| Những gì không nhập | Tệp đính kèm (lối vận chuyển vào v.v.) không nhập bằng CSV. Đính kèm ở chi tiết yêu cầu sau khi đăng ký |

| Cột | Bắt buộc | Quy định |
|---|---|---|
| Khóa doanh nghiệp | ○ | Dấu hiệu để gộp vào cùng đăng ký (chuỗi tùy ý chỉ dùng trong CSV. Ví dụ `A`) |
| Kênh tiếp nhận | ○ | Mục chỉ dành cho vận hành (§10-8) |
| Người phụ trách kinh doanh ES | — | Tài khoản vận hành (ID) |
| Loại hợp đồng | ○ | Triển khai chính thức／dùng thử |
| Số tháng dùng thử | △ | Bắt buộc khi dùng thử |
| Có phát hành tài khoản không | ○ | 1＝có／0＝không |
| Tên doanh nghiệp・furigana tên doanh nghiệp・tên doanh nghiệp nhận hóa đơn | ○ | §5-1 |
| Mã bưu điện・tỉnh／thành phố・quận／thành phố〜số nhà・tòa nhà của doanh nghiệp | ○ (tòa nhà tùy chọn) | §5-1 |
| Số điện thoại・số FAX của doanh nghiệp | ○／— | §9-2 |
| Phương thức thanh toán・chu kỳ thanh toán・thời điểm phát hành hóa đơn của doanh nghiệp | ○ | §5-1 |
| Người phụ trách chính của doanh nghiệp (tên・furigana・email・điện thoại) | ○ | §5-2 |
| Người phụ trách hóa đơn của doanh nghiệp (tên・furigana・email・điện thoại) | — | Trống thì giống người phụ trách chính |
| Người đăng ký | ○ | Một trong các email của người phụ trách doanh nghiệp・người phụ trách cơ sở (A2: chọn từ người phụ trách) |
| Loại thiết bị | ○ | Tủ lạnh・tủ đông／máy bán hàng tự động |
| Gói (số món ES Food)・course | ○ | Giá trị đang công khai của master gói |
| Phương thức giao hàng・số lần giao hàng (tháng) | ○ | §4-2 (máy bán hàng tự động là ES配送便) |
| Năm tháng mong muốn bắt đầu hợp đồng | ○ (triển khai chính thức) | `yyyy-mm` |
| Tầng lắp đặt | △ | Máy bán hàng tự động bắt buộc (A8) |
| Tùy chọn | — | Nối mã tùy chọn bằng `;` (chỉ những gì được hiển thị ở đăng ký) |
| Cách xử lý sản phẩm có hạn sử dụng ngắn・ghi chú ngoài gói | ○／— | §4-2 |
| Tên nơi nhận hàng・furigana・mã bưu điện・tỉnh／thành phố・quận／thành phố〜số nhà・tòa nhà・điện thoại・FAX | ○ (tòa nhà・FAX tùy chọn) | §4-5 |
| Số nhân viên ước tính・ngày trong tuần không nhận hàng (dạng `月;水`)・khi rơi vào ngày không nhận hàng・mong muốn về giao hàng | ○／—／○／— | §4-5 |
| Hóa đơn (gửi hóa đơn cho doanh nghiệp／gửi hóa đơn cho cơ sở này)・phương thức thanh toán・chu kỳ thanh toán của cơ sở | ○ | §4-6 |
| Người phụ trách chính của cơ sở (tên・email bắt buộc. Furigana・điện thoại tùy chọn) | ○ | §4-7. Đăng ký trên màn hình, nếu 「法人と同じ」 thì dùng người phụ trách chính của doanh nghiệp. **Nhập thay của vận hành・nhập CSV không có 「法人と同じ」, bắt buộc nhập họ tên và email** (khi trống không điền bằng người đăng ký. Sổ quyết định R・sổ tiếp nhận #425) |

---

## 11. Chiến dịch dùng thử (sau tiếp nhận)

| Mục | Quy định | Nguồn |
|---|---|---|
| Thời gian | Mặc định 1 tháng. **Gia hạn là thao tác ẩn chỉ vận hành dùng được (tạm thời)** (trước mắt không có giới hạn số lần・số tháng. Nếu kéo dài thì chuyển sang triển khai chính thức). Không hiển thị gia hạn trên màn hình・giải thích cho khách hàng〔thay đổi 2026-10-14・sổ quyết định B〕 | Danh sách vấn đề 10/03, STEP5 T3 |
| Thời gian sử dụng tối thiểu・tiền phạt vi phạm hợp đồng | Không có | 契約_00 §0.4 |
| Hợp đồng con | Không tự động gia hạn, chỉ tạo đúng số tháng của thời gian dùng thử | 契約_00 §0.4 |
| Dòng thời gian | Lấy **ngày chốt đặt hàng (B7・D7)** làm chuẩn chứ không phải hạn chót đặt hàng. **Kịp B7 thì từ chu kỳ sau, kịp D7 thì từ nửa sau (tuần C) của chu kỳ sau**. Khi số lần giao hàng từ 2 trở lên và là D7 thì từ tuần A của chu kỳ sau nữa. Chu kỳ bắt đầu từ nửa sau cũng tính là tháng thứ 1 | 28-96, STEP5 T1 (ghi đè 28-103・104)・T1'・T1'' |
| Khung chuyến đầu tiên | Khi khung hợp đồng ở nửa đầu (ví dụ A2) mà bắt đầu từ nửa sau, vận hành chọn khung nửa sau (ví dụ C2) ở xác nhận nội dung đăng ký. Từ chu kỳ sau trở lại khung hợp đồng | STEP5 T1'''' |
| Thêm số lần giao hàng | Có cho phép hay không do vận hành quyết định | STEP5 T1' bổ sung |
| Hóa đơn | Hóa đơn dùng thử được phát hành nếu phát sinh số tiền. Để ở trạng thái xuất được kể cả 0 yên, có phát hành hay không do vận hành quyết định. Không thuộc đối tượng phí đại lý | STEP1, S8 |
| Khi hết hạn mà không có đăng ký triển khai chính thức | Đặt ngày dự kiến trả lại (ngày hết hạn＋1 tháng) cho thiết bị | 28-36 |
| 「初回利用企業限定」(chỉ dành cho doanh nghiệp sử dụng lần đầu) | Hiển thị trên màn hình. Hệ thống không xác định, vận hành kiểm tra khi tiếp nhận〔hong trả lời 2026-10-03 (A4)〕 | Form hiện hành §3・⑭ |

---

## 12. Chuyển đổi dùng thử → triển khai chính thức

| Mục | Quy định | Nguồn |
|---|---|---|
| Lối vào | 「切替（お試し→本導入）」 của nhập thay vận hành, và **「本導入に申し込む」(đăng ký triển khai chính thức) của Web doanh nghiệp** (sổ quyết định U・sổ tiếp nhận #519・#639) | STEP1 |
| Nhập trên Web doanh nghiệp | Dùng **cùng thành phần màn hình với phần nhập hợp đồng của §4** (theo từng cơ sở・1 cơ sở＝1 hợp đồng). Giá trị ban đầu＝nội dung của cơ sở dùng thử, sửa được địa chỉ・người phụ trách・gói・phương thức giao hàng・số lần giao hàng・thiết bị・tùy chọn・hóa đơn・năm tháng mong muốn bắt đầu. **Gói chọn được từ tất cả gói đang công khai**. **Loại thiết bị có trường hợp chọn được cả máy bán hàng tự động. Khi đó đặt 「現場調査の結果」(kết quả khảo sát hiện trường) (ngày khảo sát・được hay không・đính kèm) là bắt buộc** ở màn hình phê duyệt, chưa nhập thì không phê duyệt được (sổ quyết định "Cách tiếp nhận chuyển đổi tủ lạnh→máy bán hàng tự động"). Bên phải hiển thị 「お見積」 (§8), **cũng hiển thị chi phí dự kiến khi thiết bị nhiều hơn・lớn hơn thiết bị cho thuê tiêu chuẩn (spot〔1 lần〕 và hàng tháng ở các dòng riêng)** (§8). Phí ban đầu・phí giao hàng khu vực hiển thị là 「別途」. Cuối cùng là đồng ý (điều khoản sử dụng・chính sách quyền riêng tư) | hong trả lời 2026-10-15, sổ tiếp nhận #639 |
| Kiểm tra nhập liệu (khi gửi mà không chọn gì) | **Thông báo tách theo từng mục**: chưa chọn cơ sở＝E331／tháng sử dụng muốn bắt đầu＝E02／chưa chọn người phụ trách (người đăng ký)＝E335. Bỏ E333 gộp vào 1 dòng | hong trả lời 2026-10-15・sổ quyết định AK (T-1) |
| Xác nhận trước khi gửi | Hiển thị **hộp thoại xác nhận** 「本導入に申し込みますか？」(đăng ký triển khai chính thức?) (bổ sung 「ESキッチンが内容を確認して承認します」(ES Kitchen sẽ xác nhận nội dung và phê duyệt)). ID là ⚠️ Cần xác nhận: chưa đánh số (đề xuất theo Q212 xác nhận gửi của yêu cầu hợp đồng) | hong trả lời 2026-10-15・sổ quyết định AK (T-2) |
| Cách hiển thị cơ sở không đăng ký được | **Cơ sở đã hủy cũng hiển thị trong danh sách, kèm lý do và không bấm được** (「取消」＝cơ sở sau khi đăng ký hủy hợp đồng・đã kết thúc hợp đồng). Cơ sở đang chờ phê duyệt (đang yêu cầu chuyển đổi) cũng hiển thị không bấm được. Câu chữ lý do là ⚠️ Cần xác nhận: chưa xác định | hong trả lời 2026-10-15・sổ quyết định AK (T-3). Cũ: không hiển thị cơ sở đã hủy trong danh sách |
| Hợp đồng cha | **Giữ nguyên hợp đồng cha cũ. Không đánh số mới.** Đổi loại hợp đồng sang triển khai chính thức, thêm 1 dòng vào 「契約種別の履歴」(lịch sử loại hợp đồng) của hợp đồng cha | Sổ quyết định "Dùng thử→triển khai chính thức", 契約_01 §6-1, danh sách vấn đề 10/02 "3-7" |
| Thời gian sử dụng tối thiểu | Thiết bị đặt trong thời gian dùng thử được tính **từ ngày bắt đầu triển khai chính thức** | 28-17, STEP1 |
| Khi có khoảng trống | Xử lý giống tạm ngưng (không tạo giao hàng lẫn hợp đồng con・đăng nhập chỉ xem・thiết bị để nguyên được và không thu phí). **Khi khoảng trống cộng dồn vượt 1 năm thì không phải chuyển đổi mà là đăng ký mới** | 28-35, 28-37, STEP1. Hợp đồng cha trong khoảng trống là 「利用休止」(tạm ngưng sử dụng)〔hong trả lời 2026-10-03 (K2)〕 |
| Lộ trình giao hàng | Kế thừa cái đã thiết lập khi dùng thử và hiển thị ở 「子契約」, vận hành xem lại | 28-80 |
| Thiết lập cơ sở | Chế độ khách v.v. được kế thừa. Gói・thiết bị **do doanh nghiệp nhập khi đăng ký** (「nhập trên Web doanh nghiệp」 ở trên), vận hành sửa được ở 「申込内容確認」 của tiếp nhận. Có thể chuyển đổi riêng theo từng cơ sở | 契約_00 §0.4, sổ tiếp nhận #639 |
| Những gì đã bỏ khỏi màn hình | 「更新区分」(phân loại gia hạn)「お試しの終了理由」(lý do kết thúc dùng thử) | 28-68 |
| Khi thiết bị nhiều hơn・lớn hơn thiết bị cho thuê tiêu chuẩn của gói triển khai chính thức | Thiết bị cho thuê tiêu chuẩn miễn phí. Kích cỡ lớn hơn tiêu chuẩn thì là phần chênh lệch so với dòng máy cùng phân loại tiêu chuẩn, máy vượt tiêu chuẩn・dòng máy không có trong tiêu chuẩn thì là số tiền của dòng máy đó. **Spot (1 lần) tính 1 lần ở hóa đơn đầu tiên của triển khai chính thức, hàng tháng thì mỗi tháng** (loại nào do master quyết định theo từng thiết bị・có khi cả hai. Hiển thị ở các dòng riêng. Hệ thống so sánh với thiết bị cho thuê tiêu chuẩn để đưa ra phương án, vận hành sửa được dòng máy・số tiền). Khi ít hơn thì không hoàn tiền. **Bãi bỏ cách cũ "chênh lệch phí hàng tháng dòng máy × thời gian sử dụng tối thiểu × số máy【tạm】 tính 1 lần ở hóa đơn đầu tiên"** (hong 2026-10-15 "sai") | Danh sách vấn đề 10/02. ※Dùng thử là gói 50 (thấp nhất) nên không có chuyện hạ gói〔hong trả lời 2026-10-03 (K10)〕 |
| Khi từ chối yêu cầu chuyển đổi | Nếu đang trong thời gian dùng thử thì vẫn sử dụng tiếp được. Nếu yêu cầu sau khi hết hạn bị từ chối thì trở về trạng thái dừng. **Bị từ chối vẫn có thể yêu cầu lại**〔hong trả lời 2026-10-16・sổ quyết định AL. Quan hệ giữa trạng thái dừng và 「切替待ち」(chờ chuyển đổi) sau khi kết thúc dùng thử cần xác nhận〕 | Sổ quyết định AL |
| Những gì khôi phục khi từ chối chuyển đổi | Khi từ chối・rút lại, đưa hợp đồng con đã chuyển thành triển khai chính thức ở đăng ký tạm trở về hợp đồng con dùng thử ban đầu・đơn hàng dùng thử (tự động). Tháng đã xuất hóa đơn thì đưa phần chênh lệch vào chi tiết điều chỉnh, tháng đã xác định thì khôi phục khoản mục | Sổ quyết định AS・sổ tiếp nhận #783・#786 |
| Đơn hàng của chu kỳ triển khai chính thức đầu tiên | Đơn hàng hàng tháng thông thường (doanh nghiệp nhập). **Không chờ đăng ký chính thức, nhập được từ trạng thái đăng ký tạm (phê duyệt chuyển đổi)** (giống triển khai chính thức mới・§10-4)〔bổ sung 2026-10-14・sổ quyết định B〕 | STEP5 QB |
| Tháng dùng thử có tháng bắt đầu đã xác định・đã xuất hóa đơn (gia hạn v.v.) | Nếu còn trước hạn chót tiếp nhận thay đổi hợp đồng của tháng đó (hạn chót đặt hàng) thì chuyển sang triển khai chính thức từ tháng đó được. Ở đăng ký tạm (phê duyệt chuyển đổi), đổi hợp đồng con của tháng đó thành triển khai chính thức, đơn hàng cũng tạo lại từ dùng thử (tự động) thành mặc định của triển khai chính thức (kỳ đặt hàng và kỳ hợp đồng là riêng. Doanh nghiệp nhập được đơn hàng triển khai chính thức trong kỳ đặt hàng. Không vận hành theo kiểu đẩy sớm đăng ký chính thức). Ở đăng ký chính thức, đặt điểm bắt đầu tính lịch sử hợp đồng cha・tồn kho・phí giới thiệu・thiết bị từ tháng bắt đầu (bỏ giảm giá dùng thử), tháng đã xuất hóa đơn thì đưa phần chênh lệch với số tiền đã tính vào chi tiết điều chỉnh (thay đổi hợp đồng) và ghi vào hóa đơn tiếp theo (tháng đã xác định thì hủy xác định để tính theo nội dung mới). Quá hạn chót thì chặn (giống nhau ở đăng ký tạm・đăng ký chính thức・「本導入に切り替える」(chuyển sang triển khai chính thức) của vận hành). Tháng nhỏ nhất chọn được＝từ tháng sau tháng bắt đầu dùng thử, trừ các tháng đã xác định・đã xuất hóa đơn quá hạn chót | Sổ quyết định AS・sổ tiếp nhận #782・#783 |
| Thiết lập đơn hàng ở đăng ký tạm của chuyển đổi | Ở đăng ký tạm của chuyển đổi, đưa mẫu số lượng cơ sở của tiếp nhận (REQ-CT-300) vào thiết lập đơn hàng của cơ sở. Cơ sở không có thiết lập đơn hàng được xử lý là 「通常」(thông thường) | Sổ quyết định AS・sổ tiếp nhận #784 |
| Phê duyệt chuyển đổi sau hạn chót | Xử lý sau hạn chót (giống §10-5. Vận hành chọn 1 trong 2: lùi sang chu kỳ sau／đặt hàng thay〔hong trả lời 2026-10-03 (A1)〕) | STEP5 QB bổ sung |
| Thông báo | Email hướng dẫn chuyển đổi (M3. Mặc định ON・gửi người phụ trách cơ sở. Không gửi hướng dẫn đăng nhập) | Danh sách email M3 |

---

## 13. Những gì được tạo theo từng giai đoạn (tóm tắt)

| Giai đoạn | Doanh nghiệp・cơ sở・hợp đồng | Đơn hàng・vật tư | Giao hàng | Tài khoản・email |
|---|---|---|---|---|
| Gửi (đang tiếp nhận) | Yêu cầu (bảng yêu cầu・chi tiết yêu cầu) | — | — | M1 hoàn tất tiếp nhận (người đăng ký＋người phụ trách chính) |
| Đăng ký tạm | Doanh nghiệp (mới)・cơ sở (đăng ký tạm)・hợp đồng cha (đăng ký tạm) | Đơn hàng (triển khai chính thức＝doanh nghiệp nhập được／dùng thử＝tự động)・bộ khởi tạo vật tư | — | Tài khoản doanh nghiệp・cơ sở (mặc định ON)・M2 hướng dẫn đăng nhập |
| Đăng ký chính thức (theo từng cơ sở) | Cơ sở＝đăng ký chính thức・hợp đồng cha＝hiệu lực・**hợp đồng con** | — | Lịch dự kiến・dữ liệu giao hàng・dữ liệu giao hàng của bộ khởi tạo | (Nếu OFF) tài khoản・M2 |
| Từ chối・rút lại | Đổi trạng thái yêu cầu, chuyển cơ sở・hợp đồng cha đã tạo ở đăng ký tạm (cả doanh nghiệp mới) thành 「取消」 (hợp đồng con tháng bắt đầu tạo ở đăng ký tạm・hợp đồng con của cơ sở đã đăng ký chính thức cũng 「取消」 như vậy. Tuy nhiên hợp đồng con mà chuyển đổi đã đổi tháng dùng thử thành triển khai chính thức thì trở về dùng thử ban đầu〔sổ quyết định AS #783〕. Sổ quyết định L777・L1181) | Hủy đơn hàng・bộ khởi tạo | — | Thông báo từ chối (kèm lý do) |

- Khi từ chối・rút lại sau đăng ký tạm: cơ sở・hợp đồng cha・doanh nghiệp mới tạo thành 「取消」 (nếu có hợp đồng con thì cũng vậy), tài khoản dừng (§10-7)〔hong trả lời 2026-10-03 (A12＝A)〕.

---

## 14. Email (liên quan đăng ký)

Chuẩn của nội dung thư là Excel (`30_申請/【ES STATION】システム内メッセージ管理-Message List_フェーズ2追加_20261001.xlsx`). Người nhận・thời điểm ở dưới. Email của yêu cầu thay đổi xem `申請・承認.md` §10.

| No | Email | Khi nào | Người nhận | Nguồn |
|---|---|---|---|---|
| M1 | Hoàn tất tiếp nhận đăng ký mới (số tiếp nhận) | Khi tiếp nhận ở Web doanh nghiệp (không đăng nhập・thêm cơ sở)・nhập thay | Người đăng ký＋người phụ trách chính (cùng người thì 1 thư. Thêm cơ sở thì là tài khoản đang đăng nhập) | 28-131, danh sách email M1 |
| M2 | Hướng dẫn đăng nhập | Khi phát hành tài khoản (đăng ký tạm・mặc định ON／nếu OFF thì đăng ký chính thức) | Tất cả người phụ trách chính・phụ・hóa đơn của doanh nghiệp・cơ sở＋(nếu chưa có trong đó) người đăng ký | 28-139・145 |
| M3 | Hướng dẫn chuyển sang triển khai chính thức | Khi đăng ký tạm chuyển đổi (mặc định ON) | Người phụ trách cơ sở | Danh sách email M3 |
| — | Từ chối | Khi từ chối đăng ký mới | Người đăng ký (nội dung theo M6) | 28-25 |

- Người gửi・đầu tiêu đề (【ESステーション】)・câu mở đầu・chữ ký giống phase 1. Không đính kèm. Email hướng dẫn dùng thử không gửi từ ES mà là email tự động của HubSpot〔danh sách email §0〕.

---

## 15. Phi chức năng

| No | Yêu cầu | Góc độ kiểm thử | Nguồn |
|---|---|---|---|
| NF-1 | Đổi cỡ chữ trình duyệt vẫn nhập được | Ở cỡ chữ lớn nhất nhập・gửi được từ bước 1〜3 đến hoàn tất. Không chồng lấn・không bị cắt | Dòng 95 |
| NF-2 | Zoom 200% vẫn nhập được | Ở 200% (PC・điện thoại) thao tác được tất cả bước, bảng báo giá・bảng xác nhận đến hoàn tất | Dòng 95 |

---

## 16. Khác biệt với triển khai hiện tại (tham khảo・phạm vi đã đọc code ngày 2026-10-03)

| Màn hình | Khác biệt | Căn cứ |
|---|---|---|
| Màn hình hoàn tất đăng ký mới Web doanh nghiệp (`app/corp/apply`) | (Đã giải quyết 2026-10-03・sổ tiếp nhận No.9) Màn hình hoàn tất hiển thị URL đặt lịch phỏng vấn khởi động cho tất cả. Email tiếp nhận M1 chỉ tạo nội dung (không gửi thật・2026-10-05) | §7 (nguyên điển #17・dòng 168) |
| Như trên, người đăng ký | Dạng "chọn từ người phụ trách" ở màn hình xác nhận → **giữ nguyên được** (đã quyết định "chọn từ người phụ trách" ở A2) | §5-3 |
| Như trên, đồng ý dùng thử | (Đã giải quyết 2026-10-03・sổ tiếp nhận No.23) Đồng ý 3 điều khoản bằng 1 ô tích | §6 |
| Như trên, máy bán hàng tự động | (Đã giải quyết・sổ tiếp nhận No.22) Đưa số tiền ước tính (phí gói＋phí hàng tháng máy bán hàng tự động) vào tổng, kèm chú thích. Phí ban đầu là dòng 1 lần | §8 |
| Tiếp nhận vận hành (`app/ops/applications`) | Phê duyệt sau hạn chót đang hiển thị lựa chọn 1 trong 2 (yêu cầu thay đổi). Tiếp nhận đăng ký mới cũng chọn được 1 trong 2 sau hạn chót ở tab lịch bắt đầu (2026-10-07・đã có code. Nội dung đã chọn lưu vào lịch sử thay đổi, phản ánh ở đăng ký tạm. Cách xử lý khi không chọn là ⚠️ Cần xác nhận〔ghi chú xác nhận vận hành A Part 5 Q22〕) | §10-5 (A1: giữ nguyên được) |

---

## 17. Cần xác nhận (2026-10-03) → Ghi lại câu trả lời

hong đã trả lời trong 2026-10-03〜05. **Quyết định đang có hiệu lực ở `docs/決定台帳.md`**. Nội dung đã được sửa theo câu trả lời.

| No | Nội dung | Trả lời |
|---|---|---|
| A1 | Tháng bắt đầu khi phê duyệt sau hạn chót | Vận hành chọn 1 trong 2 (lùi sang chu kỳ sau／đặt hàng thay). **Nếu vẫn ở đăng ký tạm mà quá ngày 15 thì tự động đăng ký bằng giá trị chuẩn, vận hành sửa／lùi**〔hong trả lời 2026-10-14・sổ tiếp nhận #613〕 |
| A2 | Người đăng ký chưa đăng nhập | Chọn 1 người từ người phụ trách (thay đổi 28-117) |
| A3 | Báo giá máy bán hàng tự động | Số tiền ước tính＋chú thích (thay đổi "báo giá riêng" ở dòng 77. Truyền đạt cho khách hàng 1003-13) |
| A4 | Xác định dùng thử 1 doanh nghiệp 1 lần | ~~Hệ thống không xác định~~ → **Khi trùng thì hệ thống chỉ đưa cảnh báo. Có cho phép hay không do vận hành quyết định** (kể cả từ cơ sở thứ 2 trở đi)〔hong trả lời 2026-10-14・sổ tiếp nhận #615〕. Vận hành chọn từ 「却下／本導入へ切り替え／2回目のお試しを承認」(từ chối／chuyển sang triển khai chính thức／phê duyệt dùng thử lần 2), việc có gắn giảm giá DC000013 cho lần 2 hay không cũng do vận hành chọn〔hong trả lời 2026-10-14・sổ tiếp nhận #634〕. Vận hành kiểm tra khi tiếp nhận |
| A5 | Đồng ý khi dùng thử | 3 thứ: điều khoản sử dụng・chính sách quyền riêng tư・điều khoản chiến dịch |
| A7 | Có cho chọn ES-QR khi đăng ký không | Không cho chọn (vận hành gắn) |
| A8 | Tầng lắp đặt | Hiển thị ở tất cả cơ sở. Máy bán hàng tự động bắt buộc・tủ lạnh tùy chọn |
| A9 | Trùng lặp 4 tùy chọn liên quan lắp đặt | **Đang xác nhận với khách hàng** (`議事録/_OPEN一覧.md` 1003-10) |
| A11 | CSV hàng loạt | Tách CSV đăng ký mới (§10-8-1) và CSV chuyển dữ liệu khách hàng hiện có (契約_01 §9-1) |
| A12 | Từ chối・rút lại sau đăng ký tạm | Cơ sở・hợp đồng・doanh nghiệp mới thành 「取消」, dừng tài khoản |

**Những gì chưa quyết định**

| No | Nội dung | Lựa chọn |
|---|---|---|
| ~~A5-2~~ | ~~Thứ tự nhập~~ → **Đã trả lời 2026-10-05: giữ như hiện hành** (gói＋nơi nhận hàng → thông tin doanh nghiệp) | — |

---

## Lịch sử thay đổi

| Ngày họp | Đối tượng (mục・REQ) | Trước thay đổi | Sau thay đổi | Lý do thay đổi | Căn cứ (MM・thời điểm) | Trạng thái |
|---|---|---|---|---|---|---|
| 2026/10/15 | §10-2・§10-3 (sửa ở màn hình tiếp nhận・khung dữ liệu chung) | Dưới tất cả tab có khung 「受付のそのほかの設定（共通データ）」／mở tab thì tự động sửa／nút lưu có 3〜5 chỗ trên màn hình | Bỏ khung, đưa ô vào từng tab・cho đến khi bấm sửa thì tất cả ô không nhập được・sửa／hủy／lưu ở 1 chỗ phía trên màn hình | Đưa code khớp với sổ quyết định vận hành A Q1・292 | Sổ tiếp nhận #644 | 実装済 (đã triển khai) |
| 2026/10/09 | Số lần giao hàng (tháng)・báo giá thêm số lần giao hàng | Thêm số lần giao hàng＝OP000001 ¥3,000／lần | Thêm số lần giao hàng＝OP000001 ¥10,000／lần | Giao hàng thêm là chuẩn ¥10,000＋phần cộng (hong trả lời 2026-10-12) | 〔MM_20261009_1200 ［02:50:34］〕 sổ tiếp nhận #521 | 実装待ち (chờ triển khai) |
| 2026/10/09 | Đồng ý (đối tượng chuẩn bị điều khoản・chính sách) | Đối tượng là doanh nghiệp・người dùng ứng dụng | Mở rộng đến người dùng ESQR・công ty giao hàng ủy thác・nhà cung cấp・nhân viên giao hàng (tạm thời) | Hướng đến phát hành chức năng mới, đối tượng là tất cả bên liên quan sử dụng hệ thống | 〔MM_20261009_1200 ［02:30:01〜02:31:13］〕 sổ tiếp nhận #520 | 実装待ち |
| 2026/10/15 | §0-3・§2・§3・§4-5・§6・§9-2・§12 | Không ghi kiểm tra nhập liệu・xác nhận・cơ sở đã hủy của chuyển đổi／tên loại hợp đồng khác sổ quyết định／phỏng vấn・liên hệ ở dải phía trên／câu chữ điện thoại・email・lựa chọn là riêng／không ghi đặt lại mật khẩu・xác nhận thêm cơ sở | Kiểm tra nhập liệu theo từng mục của chuyển đổi・hộp thoại xác nhận・hiển thị cơ sở đã hủy／loại hợp đồng là 「お試し」／bỏ 2 liên kết ở dải phía trên／thống nhất theo chung E01・E02・E06・E07／màn hình đặt lại (P-AUTH)・hộp thoại xác nhận thêm cơ sở・không chọn được tất cả ngày trong tuần・liên kết điều khoản để open | Phản ánh câu trả lời của hong (sổ quyết định AK) | hong trả lời 2026-10-15・sổ quyết định AK (T-1〜4・S-2・S-8・S-9・AUTH-Q1〜Q8), sổ tiếp nhận #639・#641 | 実装待ち |
| 2026/10/15 | §4 (ngày trong tuần không nhận hàng)・§3 (khối phỏng vấn trong nội dung)・§8 (phí ban đầu・phí giao hàng khu vực) | Ngày trong tuần là "tất cả kể cả ngày lễ"／không ghi khối phỏng vấn trong nội dung／không ghi 「別途」 ở báo giá thêm cơ sở | Tích đủ 7 ngày thì chặn (không liên quan ngày lễ)／cũng không đặt khối phỏng vấn trong nội dung／2 dòng 「別途」 ở báo giá chuyển đổi・thêm cơ sở (đăng ký mới chỉ chú thích・cần xác nhận) | hong xác nhận (AUTH-Q5・Q6)・提案_639 §4・§6 ⑦ | Sổ quyết định AK | 実装済 (code 2f6e9402・3945ab4e・593903bb) |
