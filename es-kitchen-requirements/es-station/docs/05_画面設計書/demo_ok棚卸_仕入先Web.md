# Kiểm kê demo_ok — 仕入先Web (SW_AUTH・SW_HOME・SW_MANU・SW_ORDR・SW_PROF)

Ngày: 2026-10-08. Đối chiếu với code hiện tại (`app/supplier`, `lib/supplier`, `app/api/supplier`, `components/csv`, `lib/csv/sites.ts`) và 台帳 (F 2026-10-07/08, I, K). Data đã cập nhật: `docs/05_画面設計書/データ/SW_*.py` (chỉ sửa `demo_ok`; không sửa code, 台帳, 受付簿).

Phân loại: **a** code đã đáp ứng (bỏ demo_ok) / **b** code vẫn trái quyết định (giữ, sửa lý do cho chính xác) / **c** không chụp được với seed (giữ, ghi seed cần) / **d** lý do cũ sai hoặc mơ hồ (viết lại hoặc bỏ).


## SW_AUTH (15 mục)

| No. | Màn・項目 | PL | Hiện trạng code ↔ quyết định | Việc code cần làm |
|---|---|---|---|---|
| 1.1 | SW_AUTH_001 (view 001)・ロゴ・サイト名 | b | Code: alt của logo là 「ESSTATION」 (AuthCard.tsx・Shell.tsx). Quyết định: tên hệ thống là 「ES STATION」, không dùng 「ESSTATION」 (台帳 F 2026-10-05) | Đổi alt logo thành 「ES STATION」 ở AuthCard.tsx và Shell.tsx |
| 1.3 | SW_AUTH_001 (view 001)・説明文 | b | Code: khi 運営 cấp tài khoản thì gửi account_issued nhưng nội dung là 「初回ログインのときにパスワードを決めてください」 và không tạo mật khẩu ban đầu (lib/ops/areas/general.ts・lib/domain/seed/notice.ts). Quyết định: hệ thống tạo mật khẩu ban đầu và gửi cho người phụ trách chính (台帳 F 2026-10-07) | Sinh mật khẩu ban đầu khi cấp tài khoản (cả luồng duyệt 申込) và sửa nội dung account_issued |
| 2 | SW_AUTH_001 (view 001)・ログインID | b | Code: lỗi bắt buộc là chuỗi riêng 「ログインIDを入力してください」 (E01 là 「{項目名}は必須項目です。」). Có bỏ khoảng trắng đầu/cuối nhưng không đổi chữ/số toàn góc sang nửa góc (login/page.tsx) | Dùng câu E01; thêm chuyển toàn góc sang nửa góc cho ID đăng nhập |
| 3 | SW_AUTH_001 (view 001)・パスワード | b | Code: API đăng nhập chỉ kiểm tra nhà cung cấp đã 本登録 và mật khẩu không rỗng, không đối chiếu mật khẩu (lib/supplier/service.ts login). Quyết định: bản thật dùng Cognito, môi trường dev tự làm (台帳 F 2026-10-07) | Dev: lưu và kiểm tra mật khẩu thật (8〜64 ký tự); bản thật chuyển sang Cognito |
| 6 | SW_AUTH_001 (view 001)・取引の申込はこちら | b | Code: tên liên kết là 「取引の申込はこちら」 (login/page.tsx). Thiết kế thống nhất theo tên màn hình là 「取引のお申し込み」 | Đổi chữ liên kết ở login/page.tsx |
| 10.4 | SW_AUTH_002 (view 004)・メールアドレス | b | Code: API yêu cầu đặt lại mật khẩu không kiểm tra gì và không gửi email (app/api/supplier/auth/password-reset/route.ts). Không có kiểm tra khớp ID và email (E526), không giới hạn độ dài email (台帳 B: 60 ký tự); forgot/page.tsx chỉ kiểm tra định dạng MAIL_RE | Kiểm tra ID + email (E526), gửi email mã 4 số, giới hạn email 60 ký tự |
| 12 | SW_AUTH_002 (view 006)・認証コード送信の案内 | b | Code: câu hướng dẫn 「認証コード（4桁）をメールで送りました（有効期限：5分）」 cùng ý với I401 nhưng bản mẫu thực tế không gửi email (password-reset/route.ts) | Gửi email mã xác thực thật (mail No.3) |
| 12.1 | SW_AUTH_002 (view 006)・認証コード | b | Code: maxLength 4, chỉ kiểm tra có phải 4 chữ số (isCode). Số 4 chữ số nào cũng qua, không đối chiếu nội dung mã, hạn 5 phút, E521・E522 (lib/supplier/service.ts verifyResetCode). Quyết định: 4 số・5 phút・không khóa (台帳 F) | Lưu mã theo ID, kiểm tra đúng mã (E521) và hạn 5 phút (E522) |
| 17 | SW_AUTH_003 (view 011)・申込フォームのカード | b | Code: chỉ xác nhận khi đóng/tải lại trình duyệt (beforeunload). Liên kết 「ログインに戻る」 quay lại ngay không xác nhận (AuthCard.tsx・apply/page.tsx). Quyết định: Q02 dùng chung mọi site (台帳 F 2026-10-05) | Hiện Q02 khi bấm 「ログインに戻る」 lúc đã nhập |
| 18.1 | SW_AUTH_003 (view 011)・会社名（法人名） | b | Code: chỉ kiểm tra bắt buộc, không kiểm tra số ký tự tối đa・emoji (apply/page.tsx; ô nhập cũng không có maxLength). Quyết định: chuẩn nhập chung (1 dòng 60 ký tự) | Thêm kiểm tra tối đa 60 ký tự và chặn emoji (áp dụng cả các ô văn bản khác của form) |
| 18.2 | SW_AUTH_003 (view 011)・会社名フリガナ | b | Code: chỉ kiểm tra bắt buộc, không kiểm tra katakana toàn góc (apply/page.tsx) | Thêm kiểm tra katakana toàn góc (E03) |
| 18.4 | SW_AUTH_003 (view 011)・郵便番号 | b | Code: chỉ kiểm tra bắt buộc, không kiểm tra định dạng 7 chữ số và không chuẩn hóa thành 123-4567 (apply/page.tsx) | Thêm kiểm tra 7 chữ số (E05) và chuẩn hóa 123-4567 |
| 18.8 | SW_AUTH_003 (view 011)・住所検索 | b | Code: không có nút 「住所検索」 (apply/page.tsx). Quyết định: nút dùng chung toàn hệ thống ở mọi màn nhập địa chỉ (台帳 F 2026-10-07; nguồn dữ liệu cần xác nhận) | Thêm nút 「住所検索」 (sau khi chốt nguồn dữ liệu) |
| 20.1 | SW_AUTH_003 (view 011)・仕入れ先区分 | b | Code: dropdown chỉ chọn 1 (通常商品／短消費期限商品／資材) (apply/page.tsx). Quyết định: loại xác định theo từng sản phẩm, 1 công ty xử lý được nhiều loại | Đổi thành chọn nhiều (checkbox) và lưu nhiều loại |
| 21.1 | SW_AUTH_003 (view 011)・同意の文書のリンク | b | Code: chỉ có câu 「取引条件・個人情報の取り扱いに同意します」, không có liên kết tới tài liệu (apply/page.tsx). Quyết định: lấy liên kết từ biến môi trường, trống thì không hiện (台帳 F 2026-10-07; sau chuyển sang cài đặt 運営) | Thêm liên kết từ biến môi trường (ví dụ NEXT_PUBLIC_SUPPLIER_TERMS_URL), mở tab mới |

## SW_HOME (8 mục)

| No. | Màn・項目 | PL | Hiện trạng code ↔ quyết định | Việc code cần làm |
|---|---|---|---|---|
| 1.1 | SW_HOME_001 (view 001)・ロゴ・サイト名 | b | Code: alt logo 「ESSTATION」, title 「ESSTATION 仕入先サイト」, chân sidebar 「ES Kitchen 仕入先サイト」 (Shell.tsx・layout.tsx). Quyết định: tên hệ thống là 「ES STATION」, 「ESキッチン」 là tên khách hàng (台帳 F 2026-10-05) | Đổi alt/title/chân sidebar theo quy tắc tên (Shell.tsx, layout.tsx) |
| 1.7 | SW_HOME_001 (view 001)・ユーザーメニュー | d | Code: hạn đăng nhập là 1 ngày (Cookie và dấu trong localStorage; lib/api/keepLogin.ts), khớp 台帳 K. Còn lệch: khi hết hạn (401) không hiện cửa sổ nhỏ (E525) trên màn hình mà quay về màn đăng nhập, nội dung đang nhập bị mất (store.tsx clearSession → (app)/layout.tsx) | Khi 401 hiện cửa sổ đăng nhập E525 ngay trên màn hình đang nhập (không mất dữ liệu) |
| 4 | SW_HOME_001 (view 001)・キャンセルの帯 | b | Code: câu trên dải là 「運営が発注をキャンセルしました（n件）。出荷しないでください。」 (home/page.tsx). Quyết định: W321 「ESキッチンが発注をキャンセルしました（{n}件）。…」 (quy tắc tên 台帳 F 2026-10-05) | Sửa câu theo W321 |
| 6 | SW_HOME_001 (view 001)・お知らせ | b | Code: thông báo hiện toàn bộ cho mọi nhà cung cấp, chỉ sắp theo ngày mới nhất, không phân trang (lib/supplier/service.ts listNotices; bảng notices dùng dữ liệu mẫu mocks/supplier/notices.ts), chưa nối với đối tượng gửi (仕入先) của 運営Web. Khi tải lỗi chỉ hiện toast, không hiện E346. 「重要 → mới nhất・10 dòng」 trong thiết kế là đề xuất của Claude, hong chưa quyết (確認メモ Q9; 台帳 F chỉ có thứ tự ban đầu của thông báo bên 運営 = 最終更新日 giảm dần). Chỉ hiện thông báo có đối tượng 仕入先 là quyết định trong 台帳 F | Nối bảng thông báo của 運営Web (lọc theo đối tượng 仕入先), hiển thị E346 + 「再読み込み」; thứ tự và số dòng/trang theo quyết định Q9 của hong |
| 6.6 | SW_HOME_001 (view 001)・ページ送り | b | Code: không có phân trang (home/page.tsx liệt kê toàn bộ) | Thêm phân trang 10/20/50 (P-LIST) |
| 8.1 | SW_HOME_001 (view 003)・添付ファイル | b | Code: tệp đính kèm chỉ là tên tệp, khi mở ra about:blank (API mẫu trả về about:blank: app/api/supplier/files/route.ts・supplier.mock.ts) | Lưu và trả URL tệp đính kèm thật |
| 11.1 | SW_HOME_002 (view 004)・ダウンロード | b | Code: tải xuống mở about:blank (useDownload.ts → files API trả về about:blank) | Trả URL tệp thật |
| 13 | SW_HOME_002 (view 006)・見つからないの表示 | b | Code: câu 「お知らせが見つかりません」 (không có dấu 。) và không có nút quay lại (notices/[id]/page.tsx). Quyết định: câu theo I400 và có đường quay lại | Sửa câu theo I400 và thêm nút 「一覧に戻る」 |

## SW_MANU (4 mục)

| No. | Màn・項目 | PL | Hiện trạng code ↔ quyết định | Việc code cần làm |
|---|---|---|---|---|
| 2 | SW_MANU_001 (view 001)・マニュアルのカード | b | Code: giữ cố định danh sách 4 PDF (tổng thể・hướng dẫn trả lời giao hàng・FAQ・danh sách mục CSV), không phải 1 liên kết (manual/page.tsx・mocks/supplier/manuals.ts). Quyết định: 1 liên kết đặt ở màn hình cài đặt 運営Web (台帳 F 2026-10-07) | Đổi thành 1 liên kết lấy từ cài đặt 運営Web; thêm mục cài đặt vào 運営I |
| 2.2 | SW_MANU_001 (view 001)・マニュアルを開く | b | Code: tải PDF (mở about:blank: useDownload.ts). Quyết định: mở liên kết đã đăng ký ở tab mới | Đổi sang mở liên kết, URL phải http:// hoặc https://, lỗi hiện E482 |
| 3 | SW_MANU_001 (view 002)・リンクがないときの表示 | b | Code: khi 0 mục hiện 「マニュアルはありません」 (manual/page.tsx). Quyết định: I01 「表示するデータがありません。」, giữ menu | Sửa câu theo I01 |
| 3.1 | SW_MANU_001 (view 002)・読み込めなかったとき | c | Code: khi tải lỗi chỉ hiện toast và để danh sách trống (không có hiển thị E346 và nút 「再読み込み」: manual/page.tsx). API mẫu không tạo được lỗi nên không chụp được (cần: cách làm API thất bại) | Hiển thị E346 + 「再読み込み」 khi tải lỗi |

## SW_ORDR (50 mục)

| No. | Màn・項目 | PL | Hiện trạng code ↔ quyết định | Việc code cần làm |
|---|---|---|---|---|
| 1.3 | SW_ORDR_001 (view 001)・CSV出力 | b | Code: cột CSV có 「便」 (slot) và 「お届け日」 (deliver) (orders/page.tsx). Quyết định: không xuất 2 cột này (台帳 I・仕様 55 §5-4) | Bỏ 2 cột 「便」「お届け日」 khỏi CSV (19 cột) |
| 2 | SW_ORDR_001 (view 001)・タブ | b | Code: tab giữ trong state (tab ở store.tsx), không đưa vào URL. Quyết định: P-TAB (đưa vào URL) | Đưa tab vào query URL |
| 3 | SW_ORDR_001 (view 001)・検索 | b | Code: khung riêng (.filter), có ô 「ステータス」 bị vô hiệu (chỉ hiện tên tab). Khi quay lại từ chi tiết thì 出荷年月 và từ khóa còn, nhưng 納入倉庫・種類・希望納期 bị mất (x／xa là state cục bộ ở orders/page.tsx). Dấu 「未適用」 đã bỏ | Bỏ ô 「ステータス」, dùng es-search, lưu toàn bộ điều kiện vào store |
| 3.6 | SW_ORDR_001 (view 001)・希望納期（まで） | b | Code: không kiểm tra thứ tự khoảng ngày (from>to chỉ cho 0 dòng: orders/page.tsx). Quyết định: E08 | Thêm kiểm tra E08 |
| 4 | SW_ORDR_001 (view 001)・表示の切り替え | d | Đã bỏ demo_ok. | (Đã bỏ demo_ok: hong đã quyết định đưa 「商品・月でまとめる」 vào thiết kế — 台帳 F 2026-10-07 H-10「コードの今の動きのまま」. Code khớp.) |
| 4.1 | SW_ORDR_001 (view 001)・商品・月でまとめる／発注ごと | b | Code: thứ tự 「発注ごと」 là đặt chưa xác nhận (NEW) lên đầu rồi theo ngày giờ đặt giảm dần (orders/page.tsx). Quyết định: giảm dần theo thời điểm cập nhật, không đặt NEW lên đầu (台帳 E) | Sắp xếp theo thời điểm cập nhật giảm dần, bỏ ưu tiên NEW |
| 7 | SW_ORDR_001 (view 001)・受注の表 | b | Code: hiện toàn bộ trong 1 bảng, không sắp xếp theo cột. 0 dòng hiện 「該当する発注はありません」 chứ không phải I01. Tải lỗi chỉ hiện toast, không hiện E346 (orders/page.tsx・store.tsx) | Phân trang 10/20/50, sắp xếp mọi cột, mặc định cập nhật giảm dần, I01, E346 |
| 7.14 | SW_ORDR_001 (view 001)・ページ送り | b | Code: không có phân trang | Thêm phân trang 10/20/50 (P-LIST), cả bảng nhập liệu của 出荷待ち |
| 11.3 | SW_ORDR_001 (view 004)・運送会社 | b | Code: lựa chọn là 5 hằng số (ヤマト運輸・佐川急便・栄成ロジ・福山通運・その他: lib/supplier/constants.ts CARRIERS). Quyết định: ヤマト運輸・佐川急便・福山通運 + 委託配送先 trong master 運営 (台帳 F 2026-10-07) | Lấy lựa chọn từ master 委託配送先 (lib/supplier/constants.ts, ShipList.tsx, ShipCard.tsx, app/ops/purchasing/_components/PoModals.tsx) |
| 11.5 | SW_ORDR_001 (view 004)・賞味期限（消費期限） | b | Code: tiêu đề cột luôn là 「賞味期限（消費期限）」 (ShipList.tsx). Quyết định: hàng thường 「賞味期限」, hàng hạn ngắn 「消費期限」 (H14) | Đổi tên cột theo loại sản phẩm |
| 15 | SW_ORDR_001 (view 008)・キャンセルの案内 | b | Code: câu hướng dẫn 「運営がキャンセルした発注です。出荷しないでください。…」 (orders/page.tsx). Quyết định: dùng 「ESキッチン」 như W321 | Sửa câu theo quy tắc tên |
| 16 | SW_ORDR_001 (view 009)・0件の表示 | b | Code: câu khi 0 dòng 「該当する発注はありません」 (orders/page.tsx・ShipList.tsx). Quyết định: I01 | Sửa câu theo I01 |
| 17 | SW_ORDR_001 (view 010)・納期回答の一括承認 | b | Code: kiểm tra trước khi thực thi chỉ có 「出荷予定日は今日以降」, không qua E470 (giới hạn trên theo ngày mong muốn nhập đầu tiên) và E475 (modals.tsx BulkAnswerModal・lib/supplier/service.ts answerOrders không có kiểm tra). Không có xác nhận Q11, bấm 「n件を承認する」 là duyệt ngay. Toast 「n件を承認しました（納期回答）」 khác S11, lỗi là 1 dòng tổng hợp 「すべての出荷予定日に、今日以降の日付を入力してください」. Quyết định: trước khi thực thi, mọi dòng qua cùng kiểm tra như trả lời riêng (台帳 F 2026-10-08・受付簿 No.302) | Chạy kiểm tra E467/E470/E475 cho mọi dòng trước khi gọi answerOrders (cả phía server); thêm Q11, toast S11, lỗi từng dòng |
| 18 | SW_ORDR_001 (view 011)・本発注の一括承認 | b | Code: kiểm tra trước khi thực thi chỉ gồm các mục cơ bản về ngày giao・số thùng・hạn dùng, không qua E470 (giới hạn trên ngày giao)・E473 (thùng > số lượng)・W322 (thùng×số lượng/thùng)・E475 (modals.tsx BulkHonModal; service.ts approveHon chỉ kiểm tra có hạn dùng hay không). Không có xác nhận Q11, lỗi là 1 dòng tổng hợp, câu khác E467・E468・E469. Quyết định: mọi dòng qua cùng kiểm tra như duyệt đặt hàng chính thức riêng trước khi thực thi (台帳 F 2026-10-08・受付簿 No.302) | Chạy E467/E468/E469/E470/E473/W322/E475 cho mọi dòng trước khi gọi approveHon (cả phía server); thêm Q11; lỗi từng dòng |
| 19 | SW_ORDR_001 (view 012)・消費期限の確認 | b | Code: có modal 「消費期限の確認」 nhưng nội dung đặt trong dải chú ý (Notice warn) và hơi khác câu Q320 (ShipCard.tsx・ShipList.tsx; câu: 「入力した消費期限（日付）は、希望消費期限（日付）より前です。」 + 「このまま出荷を報告しますか？」) | Dùng đúng nội dung Q320 (bỏ dải chú ý thừa) |
| 20 | SW_ORDR_001 (view 013)・CSVダウンロード | b | Code: toast 「CSVを出力しました（n行）」, không có tên tệp như S12 「（{n}行・{ファイル名}）」 (modals.tsx CsvModal) | Sửa toast theo S12 |
| 20.2 | SW_ORDR_001 (view 013)・期間（終了） | b | Code: khi khoảng ngày ngược thì hiện toast 「期間を正しく入力してください」 thay vì dưới ô (modals.tsx CsvModal). Quyết định: E08 dưới ô | Hiện E08 dưới ô 期間（終了） |
| 21 | SW_ORDR_001 (view 014)・資材の賞味期限（消費期限） | b | Code: với vật tư vẫn hiện tiêu đề cột, ô là 「—」 (ShipList.tsx・orders/[no]/page.tsx). Quyết định: vật tư không có ô này | Bỏ cột hạn dùng với vật tư (hoặc chấp nhận 「—」 và sửa thiết kế) |
| 25.15 | SW_ORDR_002 (view 016)・希望賞味期限（希望消費期限） | b | Code: luôn hiện 「希望消費期限」 (OrderInfo ở orders/[no]/page.tsx). Quyết định: hàng thường là 「希望賞味期限」 (H14) | Đổi tên theo loại sản phẩm |
| 26.5 | SW_ORDR_002 (view 016)・出荷予定日 | b | Code: 出荷予定日 phải 「trước ngày mong muốn nhập đầu tiên」 (>= là lỗi), còn ngày giao của đặt hàng chính thức là 「đến」 (> là lỗi), ranh giới khác nhau (lib/supplier/orders.ts validateResp / validateHon). Thiết kế để giới hạn trên chưa chốt (open, chờ hong), câu E470 vẫn viết 「まで」 | Chờ hong chốt giới hạn trên (đang là open), rồi thống nhất validateResp và validateHon |
| 26.8 | SW_ORDR_002 (view 016)・備考・コメント | b | Code: không kiểm tra số ký tự tối đa cho ghi chú・bình luận (textarea ở RespondCard.tsx không có maxLength). Quyết định: chuẩn nhập chung (500 ký tự) | Thêm kiểm tra tối đa 500 ký tự (cả ShipCard) |
| 26.10 | SW_ORDR_002 (view 016)・数量が変わった案内 | c | Câu hướng dẫn đã có trong code (RespondCard.tsx 「数量が変更されました（旧 → 新）」) nhưng dữ liệu mẫu không có đơn đổi số lượng (re) nên không chụp được. Cần seed: 1 đơn chờ trả lời giao hạn của SP00001 có re (số lượng trước khi đổi) | (Không cần sửa code; cần seed để chụp) |
| 28.1 | SW_ORDR_002 (view 017)・分納を追加 | b | Code: giới hạn 分納 là hằng số 3 (lib/supplier/constants.ts SPLIT_MAX). Quyết định: lấy từ màn cài đặt 運営Web (台帳 F 2026-10-07 Q5) | Thêm mục cài đặt vào 運営I và đọc giá trị từ đó |
| 29 | SW_ORDR_002 (view 018)・回答の入力エラー | b | Code: câu lỗi riêng (「出荷予定日を入力してください」「回答数量の合計（n）が発注数量（m）と一致しません」...: orders.ts validateResp), khác câu E01・E467・E470・E472. Chỉ chặn 「từ ngày mong muốn nhập đầu tiên trở đi」, khác 「đến」 của E470 (H19) | Dùng câu E01・E467・E470・E472 |
| 31 | SW_ORDR_002 (view 020)・受注できないの確認 | b | Code: xác nhận dùng câu riêng (tiêu đề 「「受注できない」と回答しますか？」 + dải chú ý: RespondCard.tsx), không theo mẫu Q01 「本当に{ボタン名}してもよろしいですか？」 | Dùng Q01 |
| 32.1 | SW_ORDR_002 (view 021)・本発注の案内 | b | Code: 「運営が本発注（数量確定）を行いました…」 (HonCard.tsx). Quyết định: dùng 「ESキッチン」 như W321 (台帳 F 2026-10-05) | Sửa câu theo quy tắc tên |
| 32.4 | SW_ORDR_002 (view 021)・同じ商品・月の案内 | c | Câu hướng dẫn đã có trong code (siblings ở HonCard.tsx) nhưng dữ liệu mẫu SP00001 chỉ có 1 đơn chờ duyệt 本発注 nên không chụp được. Cần seed: thêm ≥1 đơn cùng mã hàng・cùng tháng đang chờ duyệt 本発注 (honAck=false) | (Không cần sửa code; cần seed để chụp) |
| 32.10 | SW_ORDR_002 (view 021)・賞味期限（消費期限） | b | Code: tên ô đổi 「賞味期限／消費期限」 theo loại sản phẩm (bbL ở HonCard.tsx). Tên ở danh sách/chi tiết không đổi theo loại (H14), nên không thống nhất với chỗ này | Thống nhất tên cột ở danh sách・chi tiết với HonCard (H14) |
| 32.12 | SW_ORDR_002 (view 021)・却下する | b | Code: 「却下する」 nằm ngay bên trái nút duyệt, cách 12px (HonCard.tsx). Cũng không có xác nhận Q01 (HonRejectModal từ chối ngay). Thiết kế giả định có xác nhận Q01 vì từ chối không hoàn tác được (tự quyết B-11) | Thêm xác nhận Q01 cho 却下; cân nhắc tách nút 却下 khỏi nút duyệt |
| 32.13 | SW_ORDR_002 (view 021)・同じ商品・月をまとめて承認 | c | Nút đã có trong code (HonCard.tsx 「同じ商品・月のn件をまとめて承認」) nhưng dữ liệu mẫu không có ≥2 đơn chờ duyệt cùng mã・tháng nên không chụp được. Cần seed giống 32.4 | (Không cần sửa code; cần seed để chụp) |
| 33 | SW_ORDR_002 (view 022)・本発注の入力エラー | b | Code: câu lỗi riêng (validateHon; khác E01・E467・E468・E472・E473). W322 hiện như lỗi inline màu đỏ và lần duyệt thứ hai mới qua (không phải modal cảnh báo) | Dùng câu E01/E467/E468/E472/E473; hiển thị W322 như cảnh báo |
| 34 | SW_ORDR_002 (view 023)・本発注の却下 | b | Code: từ chối 本発注 thực hiện ngay không xác nhận (bấm 「却下する」 trong HonRejectModal). Lỗi là 1 dòng tổng hợp. Quyết định: thêm xác nhận Q01 (tự quyết B-11) | Thêm xác nhận Q01 trước khi từ chối; lỗi từng ô theo E01 |
| 37.6 | SW_ORDR_002 (view 026)・運送会社名 | b | Code: lựa chọn là 5 hằng số (gồm 栄成ロジ・その他: ShipCard.tsx). Quyết định: ヤマト運輸・佐川急便・福山通運 + 委託配送先 trong master | Lấy từ master 委託配送先 (như 11.3) |
| 37.7 | SW_ORDR_002 (view 026)・送り状番号 | b | Code: số 10〜12 chữ số (^\d{10,12}$, bỏ dấu gạch ngang), ví dụ 「12桁の数字」 (orders.ts validateShip・ShipCard.tsx). Quyết định: số nửa góc, tối đa 20 ký tự, không kiểm tra số chữ số (台帳 F 2026-10-07 O6) | Đổi kiểm tra thành số nửa góc ≤20 ký tự (E474), sửa placeholder |
| 38.1 | SW_ORDR_002 (view 027)・送り状番号のエラー | b | Code: câu lỗi 「送り状番号は10〜12桁の数字で入力してください」 (validateShip). Quyết định: E474 「送り状番号は半角数字20文字以内で入力してください。」 | Dùng E474 |
| 39.2 | SW_ORDR_002 (view 028)・差異・不良 | c | Code: không có bảng 「差異・不良」. Tình trạng nhập kho chỉ 「未入荷／入荷済」 (「入荷状況」 trong OrderInfo ở orders/[no]/page.tsx). Dữ liệu mẫu không có chênh lệch・hàng lỗi nên không chụp được (cần seed: đơn có chênh lệch・hàng lỗi trong ghi nhận nhập kho) | Thêm bảng 差異・不良 (chỉ xem, không hiện tiền) vào chi tiết đơn; thêm cài đặt gửi mail S8 ở 運営Web |
| 40 | SW_ORDR_002 (view 029)・却下（受注不可） | b | Code: câu 「この発注は却下済みです。運営が確認します。」 (orders/[no]/page.tsx). Quyết định: dùng 「ESキッチン」 (台帳 F 2026-10-05) | Sửa câu theo quy tắc tên |
| 41 | SW_ORDR_002 (view 030)・キャンセル（運営） | b | Code: câu 「運営がこの発注をキャンセルしました。出荷しないでください。」 (orders/[no]/page.tsx). Quyết định: dùng 「ESキッチン」 như W321 | Sửa câu theo quy tắc tên |
| 42 | SW_ORDR_002 (view 031)・見つからないの表示 | b | Code: 「発注が見つかりません」 (không có dấu 。) và không có nút quay lại (orders/[no]/page.tsx). Quyết định: câu I400 và đường quay lại | Sửa câu theo I400 và thêm nút quay lại |
| 43.1 | SW_ORDR_002 (view 032)・期間（開始） | b | Code: khi khoảng ngày ngược thì hiện toast 「期間を正しく入力してください」 thay vì dưới ô (modals.tsx CsvModal). Quyết định: E08 | Hiện E08 dưới ô (như 20.2) |
| 48 | SW_ORDR_003 (view 035)・説明 | b | Code: câu giải thích chỉ có 「納品日」「入荷箱数」, không nhắc 「賞味期限（消費期限）」 (desc ở _components/csv.tsx). Thực tế CSV có cột này (lib/csv/sites.ts) | Bổ sung 「賞味期限（消費期限）」 vào desc |
| 49 | SW_ORDR_003 (view 035)・ファイルを選ぶ | b | Code: câu khi không phải UTF-8 là câu riêng 「文字コードが UTF-8 ではありません。Excel では「CSV UTF-8（コンマ区切り）」で保存してください」 (components/csv/CsvImportModal.tsx). Quyết định: E51 | Dùng E51 (có thể kèm hướng dẫn Excel) |
| 50.10 | SW_ORDR_003 (view 035)・出荷予定日 | b | Code: 出荷予定日 trong CSV chỉ kiểm tra 「từ hôm nay」, không qua E470 (giới hạn trên theo ngày mong muốn nhập đầu tiên) (lib/csv/sites.ts supplierAnswers). Quyết định: qua cùng kiểm tra như trả lời riêng trước khi thực thi (台帳 F 2026-10-08・受付簿 No.302) | Thêm kiểm tra E470 vào supplierAnswers (sau khi chốt giới hạn trên) |
| 50.11 | SW_ORDR_003 (view 035)・納品日 | b | Code: ngày giao trong CSV chỉ kiểm tra 「từ hôm nay・từ ngày dự kiến xuất」, không qua E470 (đến hết ngày mong muốn nhập đầu tiên) (lib/csv/sites.ts supplierAnswers). Quyết định: qua cùng kiểm tra như duyệt đặt hàng chính thức riêng trước khi thực thi (台帳 F 2026-10-08・受付簿 No.302) | Thêm kiểm tra E470 vào supplierAnswers |
| 50.12 | SW_ORDR_003 (view 035)・入荷箱数 | b | Code: số thùng trong CSV chỉ kiểm tra 「số nguyên từ 1」, không qua E473 (thùng > số lượng)・W322 (thùng×số lượng/thùng) (lib/csv/sites.ts supplierAnswers). Quyết định: qua cùng kiểm tra như duyệt đặt hàng chính thức riêng trước khi thực thi (台帳 F 2026-10-08・受付簿 No.302) | Thêm E473 và W322 vào supplierAnswers (W322 cần cơ chế xác nhận cho CSV) |
| 50.13 | SW_ORDR_003 (view 035)・賞味期限（消費期限） | b | Code: cột CSV có 「賞味期限（消費期限）」 (ANS_COLS ở lib/csv/sites.ts) nhưng câu giải thích trên màn hình không nhắc | Bổ sung vào desc (như 48) |
| 51 | SW_ORDR_003 (view 036)・確認の結果 | b | Code: toast sau khi đăng ký 「CSV取込：新規 n件・更新 m件を登録しました（変更なし …）」, khác S10 「CSVを取り込みました（新規{n}件・更新{m}件）。」 (components/csv/CsvImportModal.tsx) | Sửa toast theo S10 (dùng chung mọi site) |
| 51.1 | SW_ORDR_003 (view 036)・エラーの行 | b | Code: câu lỗi từng dòng gần giống E476〜E481 nhưng không khớp (ví dụ E480 「入力してください」 còn code 「入れてください」; ngày kiểu E467 là 「…にしてください」). lib/csv/sites.ts supplierAnswers | Chỉnh câu ở lib/csv/sites.ts cho khớp E476〜E481 |
| 51.6 | SW_ORDR_003 (view 036)・登録 | b | Code: bấm 「登録」 đăng ký ngay không hiện xác nhận Q10 (commit ở components/csv/CsvImportModal.tsx). Quyết định: P-CSV hiện Q10 | Thêm xác nhận Q10 (dùng chung mọi site) |
| 52 | SW_ORDR_003 (view 037)・ファイル全体のエラー | b | Code: câu 「文字コードが UTF-8 ではありません。Excel では「CSV UTF-8（コンマ区切り）」で保存してください」, khác E51 「CSVファイルとして読み込めません。UTF-8のCSVファイルを選択してください。」 (components/csv/CsvImportModal.tsx) | Dùng E51 (như 49) |

## SW_PROF (9 mục)

| No. | Màn・項目 | PL | Hiện trạng code ↔ quyết định | Việc code cần làm |
|---|---|---|---|---|
| 2 | SW_PROF_001 (view 001)・説明の帯 | b | Code: câu trên dải là 「運営の「仕入先マスタ」に登録されている内容です。「編集する」で、連絡先（電話・メール・担当者・住所）を更新できます（保存すると運営のマスタに反映されます）。」, không có câu 「変更すると ESキッチンに通知されます」「そのほかの項目は見るだけです」 (profile/page.tsx). Quyết định: 台帳 F 2026-10-07 | Sửa câu theo thiết kế (thông báo tới ESキッチン, mục khác chỉ xem) |
| 5.1 | SW_PROF_001 (view 001)・郵便番号 | b | Code: mã bưu điện chỉ kiểm tra bắt buộc, không kiểm tra 7 chữ số (save ở profile/page.tsx, câu 「入力してください」) | Thêm kiểm tra 7 chữ số (E05), dùng câu E01 |
| 6 | SW_PROF_001 (view 001)・担当者情報 | b | Code: ghi chú 「発注・本発注・お知らせのメール通知は、メイン担当者に届きます（サブ担当者にも届けるかは要確認）」 (profile/page.tsx). Quyết định: gửi cho cả chính và phụ (台帳 I・メール一覧 §0) | Sửa ghi chú: gửi cho toàn bộ người phụ trách |
| 6.5 | SW_PROF_001 (view 001)・メールアドレス | b | Code: email không có giới hạn độ dài, chỉ kiểm tra định dạng (MAIL_RE). Đổi email cũng không thông báo cho 運営 (profile/page.tsx). Quyết định: 60 ký tự (台帳 B), đổi thì thông báo 運営 (台帳 F) | Thêm giới hạn 60 ký tự và thông báo 運営 khi đổi |
| 10 | SW_PROF_001 (view 002)・直せる欄・直せない欄の見分け | b | Code: câu gợi ý 「運営で管理している項目です（変更は運営へご連絡ください）」 (lockHint ở profile/page.tsx). Quyết định: 「ESキッチンへお問い合わせください」 (台帳 F 2026-10-05). Việc khóa ô (ngoài thông tin liên hệ chỉ đọc) đúng theo quyết định | Sửa câu theo quy tắc tên |
| 10.2 | SW_PROF_001 (view 002)・保存する | b | Code: khi lưu, server chỉ phản ánh thông tin liên hệ (PUT /suppliers/[id] → updateSupplierContact). Còn lệch: không phát hiện sửa đồng thời (E31・I02), kiểm tra chỉ gồm bắt buộc và định dạng email, không có thông báo cho 運営 (profile/page.tsx・app/api/supplier/suppliers/[id]/route.ts) | Thêm phát hiện sửa đồng thời, kiểm tra theo E01/E05/E06/E07, gửi thông báo 運営H 「変更の通知」 |
| 11.1 | SW_PROF_001 (view 003)・メール形式のエラー | b | Code: lỗi định dạng email 「形式が正しくありません」 (profile/page.tsx). Quyết định: E07 「正しいメールアドレスの形式で入力してください。」 | Dùng E07 |
| 14 | SW_PROF_001 (view 006)・保存完了のトースト | b | Code: toast 「プロフィールを保存しました（運営の仕入先マスタに反映）」 (profile/page.tsx). Quyết định: S01 「保存しました。」 | Dùng S01 |
| 15 | SW_PROF_001 (view 002)・住所検索 | b | Code: không có nút 「住所検索」 (profile/page.tsx). Quyết định: nút dùng chung toàn hệ thống ở mọi màn nhập địa chỉ (台帳 F 2026-10-07; nguồn dữ liệu cần xác nhận) | Thêm nút 「住所検索」 (như SW_AUTH 18.8) |

## Tổng số theo phân loại

| File | a | b | c | d | Tổng |
|---|---|---|---|---|---|
| SW_AUTH | 0 | 15 | 0 | 0 | 15 |
| SW_HOME | 0 | 7 | 0 | 1 | 8 |
| SW_MANU | 0 | 3 | 1 | 0 | 4 |
| SW_ORDR | 0 | 45 | 4 | 1 | 50 |
| SW_PROF | 0 | 9 | 0 | 0 | 9 |
| **Cộng** | 0 | 79 | 5 | 2 | 86 |

Trước kiểm kê: 86 demo_ok. Đã bỏ: 1 (SW_ORDR 4 — hong đã quyết định đưa vào thiết kế, 台帳 F 2026-10-07 H-10). Còn lại: 85.

Cập nhật 2026-10-08 (sau 役割レビュー_仕入先Web.md #1 và 台帳 F 2026-10-08・受付簿 No.302): thêm 4 mục (82 → 86 mục đã kiểm kê) — SW_ORDR 50.10・50.11・50.12 (CSV không qua E470・E473・W322) và 32.12 (却下 nằm sát nút duyệt, chưa có Q01); viết lại SW_ORDR 17・18 (duyệt hàng loạt không qua kiểm tra trước khi thực thi), 26.5 (giới hạn trên của 出荷予定日 chưa chốt, hong) và SW_HOME 6 (thứ tự・10 dòng là đề xuất, hong chưa quyết).

Không có mục nào thuộc **a**: đã đối chiếu từng mục với code hiện tại và không có chỗ nào code đã đáp ứng hoàn toàn. Các thay đổi code gần đây (contact chính từ 申込 khi duyệt, API bỏ 仕入単価, PUT chỉ lưu liên hệ, màn プロフィール bỏ 口座・インボイス・nút gửi lại mail và khóa days/cert/defMethod/defCarrier, mật khẩu 8〜64, mã 4 số, đăng nhập 1 ngày, bỏ 「未適用」) đã được phản ánh ở đợt trước (đã gỡ demo_ok tương ứng) nên không còn trong danh sách này.

Các mục **c** (cần seed để chụp): SW_ORDR 26.10 (đơn có `re`), 32.4・32.13 (≥2 đơn cùng mã hàng・tháng chờ duyệt 本発注), 39.2 (đơn có 差異・不良); SW_MANU 3.1 (cách làm API thất bại).


## Việc code còn phải sửa (backlog, gom theo màn)


### SW_AUTH_001
- No.1.1 ロゴ・サイト名 — Đổi alt logo thành 「ES STATION」 ở AuthCard.tsx và Shell.tsx
- No.1.3 説明文 — Sinh mật khẩu ban đầu khi cấp tài khoản (cả luồng duyệt 申込) và sửa nội dung account_issued
- No.2 ログインID — Dùng câu E01; thêm chuyển toàn góc sang nửa góc cho ID đăng nhập
- No.3 パスワード — Dev: lưu và kiểm tra mật khẩu thật (8〜64 ký tự); bản thật chuyển sang Cognito
- No.6 取引の申込はこちら — Đổi chữ liên kết ở login/page.tsx

### SW_AUTH_002
- No.10.4 メールアドレス — Kiểm tra ID + email (E526), gửi email mã 4 số, giới hạn email 60 ký tự
- No.12 認証コード送信の案内 — Gửi email mã xác thực thật (mail No.3)
- No.12.1 認証コード — Lưu mã theo ID, kiểm tra đúng mã (E521) và hạn 5 phút (E522)

### SW_AUTH_003
- No.17 申込フォームのカード — Hiện Q02 khi bấm 「ログインに戻る」 lúc đã nhập
- No.18.1 会社名（法人名） — Thêm kiểm tra tối đa 60 ký tự và chặn emoji (áp dụng cả các ô văn bản khác của form)
- No.18.2 会社名フリガナ — Thêm kiểm tra katakana toàn góc (E03)
- No.18.4 郵便番号 — Thêm kiểm tra 7 chữ số (E05) và chuẩn hóa 123-4567
- No.18.8 住所検索 — Thêm nút 「住所検索」 (sau khi chốt nguồn dữ liệu)
- No.20.1 仕入れ先区分 — Đổi thành chọn nhiều (checkbox) và lưu nhiều loại
- No.21.1 同意の文書のリンク — Thêm liên kết từ biến môi trường (ví dụ NEXT_PUBLIC_SUPPLIER_TERMS_URL), mở tab mới

### SW_HOME_001
- No.1.1 ロゴ・サイト名 — Đổi alt/title/chân sidebar theo quy tắc tên (Shell.tsx, layout.tsx)
- No.1.7 ユーザーメニュー — Khi 401 hiện cửa sổ đăng nhập E525 ngay trên màn hình đang nhập (không mất dữ liệu)
- No.4 キャンセルの帯 — Sửa câu theo W321
- No.6 お知らせ — Nối bảng thông báo của 運営Web (lọc theo đối tượng 仕入先), hiển thị E346 + 「再読み込み」; thứ tự và số dòng/trang theo quyết định Q9 của hong
- No.6.6 ページ送り — Thêm phân trang 10/20/50 (P-LIST)
- No.8.1 添付ファイル — Lưu và trả URL tệp đính kèm thật

### SW_HOME_002
- No.11.1 ダウンロード — Trả URL tệp thật
- No.13 見つからないの表示 — Sửa câu theo I400 và thêm nút 「一覧に戻る」

### SW_MANU_001
- No.2 マニュアルのカード — Đổi thành 1 liên kết lấy từ cài đặt 運営Web; thêm mục cài đặt vào 運営I
- No.2.2 マニュアルを開く — Đổi sang mở liên kết, URL phải http:// hoặc https://, lỗi hiện E482
- No.3 リンクがないときの表示 — Sửa câu theo I01
- No.3.1 読み込めなかったとき — Hiển thị E346 + 「再読み込み」 khi tải lỗi

### SW_ORDR_001
- No.1.3 CSV出力 — Bỏ 2 cột 「便」「お届け日」 khỏi CSV (19 cột)
- No.2 タブ — Đưa tab vào query URL
- No.3 検索 — Bỏ ô 「ステータス」, dùng es-search, lưu toàn bộ điều kiện vào store
- No.3.6 希望納期（まで） — Thêm kiểm tra E08
- No.4.1 商品・月でまとめる／発注ごと — Sắp xếp theo thời điểm cập nhật giảm dần, bỏ ưu tiên NEW
- No.7 受注の表 — Phân trang 10/20/50, sắp xếp mọi cột, mặc định cập nhật giảm dần, I01, E346
- No.7.14 ページ送り — Thêm phân trang 10/20/50 (P-LIST), cả bảng nhập liệu của 出荷待ち
- No.11.3 運送会社 — Lấy lựa chọn từ master 委託配送先 (lib/supplier/constants.ts, ShipList.tsx, ShipCard.tsx, app/ops/purchasing/_components/PoModals.tsx)
- No.11.5 賞味期限（消費期限） — Đổi tên cột theo loại sản phẩm
- No.15 キャンセルの案内 — Sửa câu theo quy tắc tên
- No.16 0件の表示 — Sửa câu theo I01
- No.17 納期回答の一括承認 — Chạy kiểm tra E467/E470/E475 cho mọi dòng trước khi gọi answerOrders (cả phía server); thêm Q11, toast S11, lỗi từng dòng
- No.18 本発注の一括承認 — Chạy E467/E468/E469/E470/E473/W322/E475 cho mọi dòng trước khi gọi approveHon (cả phía server); thêm Q11; lỗi từng dòng
- No.19 消費期限の確認 — Dùng đúng nội dung Q320 (bỏ dải chú ý thừa)
- No.20 CSVダウンロード — Sửa toast theo S12
- No.20.2 期間（終了） — Hiện E08 dưới ô 期間（終了）
- No.21 資材の賞味期限（消費期限） — Bỏ cột hạn dùng với vật tư (hoặc chấp nhận 「—」 và sửa thiết kế)

### SW_ORDR_002
- No.25.15 希望賞味期限（希望消費期限） — Đổi tên theo loại sản phẩm
- No.26.5 出荷予定日 — Chờ hong chốt giới hạn trên (đang là open), rồi thống nhất validateResp và validateHon
- No.26.8 備考・コメント — Thêm kiểm tra tối đa 500 ký tự (cả ShipCard)
- No.28.1 分納を追加 — Thêm mục cài đặt vào 運営I và đọc giá trị từ đó
- No.29 回答の入力エラー — Dùng câu E01・E467・E470・E472
- No.31 受注できないの確認 — Dùng Q01
- No.32.1 本発注の案内 — Sửa câu theo quy tắc tên
- No.32.10 賞味期限（消費期限） — Thống nhất tên cột ở danh sách・chi tiết với HonCard (H14)
- No.32.12 却下する — Thêm xác nhận Q01 cho 却下; cân nhắc tách nút 却下 khỏi nút duyệt
- No.33 本発注の入力エラー — Dùng câu E01/E467/E468/E472/E473; hiển thị W322 như cảnh báo
- No.34 本発注の却下 — Thêm xác nhận Q01 trước khi từ chối; lỗi từng ô theo E01
- No.37.6 運送会社名 — Lấy từ master 委託配送先 (như 11.3)
- No.37.7 送り状番号 — Đổi kiểm tra thành số nửa góc ≤20 ký tự (E474), sửa placeholder
- No.38.1 送り状番号のエラー — Dùng E474
- No.39.2 差異・不良 — Thêm bảng 差異・不良 (chỉ xem, không hiện tiền) vào chi tiết đơn; thêm cài đặt gửi mail S8 ở 運営Web
- No.40 却下（受注不可） — Sửa câu theo quy tắc tên
- No.41 キャンセル（運営） — Sửa câu theo quy tắc tên
- No.42 見つからないの表示 — Sửa câu theo I400 và thêm nút quay lại
- No.43.1 期間（開始） — Hiện E08 dưới ô (như 20.2)

### SW_ORDR_003
- No.48 説明 — Bổ sung 「賞味期限（消費期限）」 vào desc
- No.49 ファイルを選ぶ — Dùng E51 (có thể kèm hướng dẫn Excel)
- No.50.10 出荷予定日 — Thêm kiểm tra E470 vào supplierAnswers (sau khi chốt giới hạn trên)
- No.50.11 納品日 — Thêm kiểm tra E470 vào supplierAnswers
- No.50.12 入荷箱数 — Thêm E473 và W322 vào supplierAnswers (W322 cần cơ chế xác nhận cho CSV)
- No.50.13 賞味期限（消費期限） — Bổ sung vào desc (như 48)
- No.51 確認の結果 — Sửa toast theo S10 (dùng chung mọi site)
- No.51.1 エラーの行 — Chỉnh câu ở lib/csv/sites.ts cho khớp E476〜E481
- No.51.6 登録 — Thêm xác nhận Q10 (dùng chung mọi site)
- No.52 ファイル全体のエラー — Dùng E51 (như 49)

### SW_PROF_001
- No.2 説明の帯 — Sửa câu theo thiết kế (thông báo tới ESキッチン, mục khác chỉ xem)
- No.5.1 郵便番号 — Thêm kiểm tra 7 chữ số (E05), dùng câu E01
- No.6 担当者情報 — Sửa ghi chú: gửi cho toàn bộ người phụ trách
- No.6.5 メールアドレス — Thêm giới hạn 60 ký tự và thông báo 運営 khi đổi
- No.10 直せる欄・直せない欄の見分け — Sửa câu theo quy tắc tên
- No.10.2 保存する — Thêm phát hiện sửa đồng thời, kiểm tra theo E01/E05/E06/E07, gửi thông báo 運営H 「変更の通知」
- No.11.1 メール形式のエラー — Dùng E07
- No.14 保存完了のトースト — Dùng S01
- No.15 住所検索 — Thêm nút 「住所検索」 (như SW_AUTH 18.8)
