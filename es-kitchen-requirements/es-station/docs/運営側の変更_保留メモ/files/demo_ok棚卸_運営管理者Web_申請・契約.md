# Kiểm kê demo_ok — 運営管理者Web_申請・契約 (AW_APPL・DASH・CORP・BRAN・CONT・MIGR)

Ngày: 2026-10-08. Người làm: Claude (theo yêu cầu của hong). Chỉ sửa data (`docs/05_画面設計書/データ/AW_*.py`), HTML, ảnh và file này. Không sửa code ứng dụng, 台帳, 受付簿.

## Cách kiểm

- Lấy toàn bộ `demo_ok` còn trong 6 file data (161 mục không trùng; 173 lần xuất hiện nếu đếm theo từng view).
- Đối chiếu với CODE HIỆN TẠI (`app/ops/**`, `lib/ops/**`, `lib/domain/**`) và 台帳 (F/K/H, 2026-10-05〜10-08; 受付簿 No.172〜185). Code ứng dụng thay đổi từ lúc viết `demo_ok` (2026-10-07) chỉ gồm các commit 2026-10-08 (7358377 APPL phân trang/sort/未適用/手順; 1705c4c sort cột; a52fd53 更新日時; f2b0a2f・bf77aa4 E31; 1b9beb6 I02; eae0e91 E04 + nhãn 棚卸; 93a427b お試し延長). Đã xác nhận bằng `git log --since=2026-10-06` trên các thư mục liên quan.
- Chạy thử thật khi không chắc: tải thật file CSV出力 của 4 danh sách (số cột); gọi API lưu pháp nhân với chuỗi dài / emoji (giới hạn E04 thực tế); mở modal 一括変更 sau khi tăng hợp đồng con lên 144; seed API cho 配信予約 và 確定済みの月に反映していない変更 rồi chụp thật.
- Phân loại: **a** = code nay đã đáp ứng hoặc seed được → bỏ `demo_ok`, chụp thật; **b** = code vẫn trái quyết định → giữ, ghi rõ code đang làm gì / cần làm gì; **c** = không chụp được với seed → giữ, ghi cần seed gì; **d** = lý do cũ sai/lỗi thời/mơ hồ → viết lại hoặc bỏ.

## Tổng kết

| File | a | b | c | d | Tổng trước | Còn `demo_ok` sau |
|---|---|---|---|---|---|---|
| AW_APPL 契約申請管理 | 1 | 72 | 1 | 0 | 74 | 73 |
| AW_DASH ダッシュボード | 8 | 8 | 2 | 1 | 19 | 10 |
| AW_CORP 法人一覧 | 0 | 19 | 0 | 3 | 22 | 22 |
| AW_BRAN 拠点一覧 | 0 | 17 | 0 | 1 | 18 | 18 |
| AW_CONT 子契約一覧 | 0 | 20 | 2 | 1 | 23 | 23 |
| AW_MIGR 移行の要補完 | 0 | 5 | 0 | 0 | 5 | 5 |
| **合計** | **9** | **141** | **5** | **6** | **161** | **151** |

- Đã bỏ `demo_ok` (10 mục): 9 mục loại a + 1 mục loại d (DASH 3.2.2). View mới/đổi: AW_DASH_011・012 (seed 確定済みの月), AW_DASH_016 (配信予約, mới ở cuối).
- Phát hiện mới ngoài danh sách `demo_ok` cũ: giới hạn độ dài E04 trong code (lấy từ varchar của DB) khác "文字列 n" trong 設計書 — xem bảng cuối. Đã ghi vào `demo_ok` của mục 保存 (CORP/BRAN/CONT).

## Bảng từng demo_ok

### AW_APPL 契約申請管理

| # | view | No. | 項目 | 分類 | 原文 `demo_ok`（日本語・抜粋） | Hiện trạng code / việc cần làm |
|---|---|---|---|---|---|---|
| 0 | 001 | 1.1 | CSV出力 | a | 台帳 M-1 は「システムにある項目すべて」。コードの出力列は一覧に出ている列だけ（H18）。全項目に直す | Đã đáp ứng: export thử = cột danh sách + mọi trường của đơn (31 cột, gồm 申請の中身) qua source dm.apply.applications. Đã bỏ demo_ok. |
| 1 | 001 | 1.3 | 新規登録（代理入力）／変更申請の代理入力 | b | コードは代理入力を「作成」扱い（CS は押せない）。台帳 2026-10-07（Q1＝B）どおり、R/U の CS も押せるように直す（ap… | apiPerm.ts: createChange / proxy new tính là "create" nên R/U (CS) không bấm được. 台帳 F 2026-10-07 (Q1=B): CS cũng được 代理入力. Việc code: đổi quyền thành "update" cho 代理入力 (chỉ 営業 R không được). |
| 2 | 001 | 2 | タブ | b | P-TAB は URL（?tab=）にタブを持つ決まり。コードは画面のメモリに持つ（再読み込みで新規契約に戻る） | P-TAB (tab trên URL ?tab=): tab của 契約申請管理 giữ trong bộ nhớ module (api.ts), tải lại thì về 新規契約. Việc code: giữ tab trong URL. |
| 3 | 001 | 3.3 | プラン | b | コードの選択肢は一覧の行の値から作る（「複数（4拠点）」も選択肢に出る）。プランマスタのプランから作る | Lựa chọn lấy từ giá trị các dòng / hằng số cố định trong code (constants.ts), không từ master. Việc code: lấy từ プランマスタ (plan/course). |
| 4 | 001 | 3.4 | コース | b | コードの選択肢は「ESライト」「ESスタンダード」の2つで、一覧の「ESライト（冷蔵庫）」「ESライト（自販機）」と一致せず絞れない。コース… | Lựa chọn course là 2 giá trị cố định (ESライト／ESスタンダード) không khớp "ESライト（冷蔵庫）/（自販機）" trên danh sách nên không lọc được. Việc code: lấy theo プランマスタ. |
| 5 | 001 | 3.6 | ES営業担当 | b | コードの選択肢は一覧の行の担当者から作る。運営のユーザー（アカウント一覧）から作る（H19） | ES営業担当: code dùng danh sách cố định 3 người (ES_STAFF / forms.ts), hoặc lấy từ các dòng. Việc code: lấy từ アカウント運営 (H19). |
| 6 | 001 | 3.8 | 並べ替え | b | コードの初期の並びは新規契約タブ＝申請ID の昇順（並べ替えは全列・昇順／降順は実装済み）。初期を申請日の降順に直す（台帳 E「一覧の初期の… | Đã xong: sort mọi cột, tăng/giảm. Còn lại: mặc định tab 新規契約 là 申請ID tăng dần (tabFilter sort:"id"), 台帳 E quy định 申請日 giảm dần. Việc code: đổi mặc định. |
| 7 | 001 | 4 | 申請の一覧 | b | コードの初期の並びは新規契約タブ＝申請ID の昇順（ページ送り 10／20／50 は実装済み）。申請日の降順に直す（台帳 E） | Đã xong: phân trang thật 10/20/50. Còn lại: thứ tự mặc định tab 新規契約 (như No.3.8). Việc code: đổi mặc định. |
| 8 | 004 | 4.14 | 0件の表示 | b | コードの文言は「条件に合う申請はありません」。I01 に揃える | Code hiện câu 0 dòng khác I01 (「表示するデータがありません。」). Việc code: đổi câu 0 dòng theo I01. |
| 9 | 010 | 2 | タブ | b | P-TAB は URL（?tab=）にタブを持つ決まり。コードは画面のメモリに持つ | P-TAB: tab của màn 申請詳細 (CH) giữ trong bộ nhớ. Việc code: giữ trên URL. |
| 10 | 012 | 6.7 | 承認の前にする設定 | b | P-FORM は詳細を表示だけにし保存は画面の上の1つにする決まり。この画面は承認の前の設定を入れるとすぐ保存する（承認の流れの一部のため。… | Ngoại lệ có chủ đích: các giá trị "承認の前にする設定" lưu ngay (không qua nút 保存). Cần hong xác nhận đây là ngoại lệ của P-FORM (台帳 F). |
| 11 | 014 | 8.9 | 承認する | b | E102（変更前の値の照合）はコードに未実装（注記だけ）。台帳どおり承認を止めるように直す | E102 (đối chiếu giá trị trước thay đổi) mới chỉ có ghi chú (BeforeCheckNote), code chưa chặn khi giá trị khác (đã grep: không có xử lý nào ném E102). Việc code: cài đối chiếu và chặn duyệt. |
| 12 | 014 | 8.10 | 変更前の値の照合の注記 | b | 注記は出るが、値が違うときに止める処理がコードにない。照合と E102 を実装する | Như No.8.9: chỉ có ghi chú, chưa có xử lý chặn. Việc code: cài đối chiếu + E102. |
| 13 | 030 | 13 | 納品不可曜日・設備の希望日の入口 | b | 見本データ（CH-20260922-0001・CH-20260705-0001）が「配送の変更」で納品不可曜日を申請している。決定（H21）… | Seed lib/domain/seed/apply.ts: CH-20260922-0001 và CH-20260705-0001 là "配送の変更" khai báo 納品不可曜日. Quyết định H21: thuộc "拠点情報の変更". Việc: sửa seed sang kind 拠点情報の変更. |
| 14 | 037 | 6.7.28 | 棚卸報告（任意） | b | コードは承認できる人なら誰でもスキップを選べる。台帳どおり、システム管理だけが選べるように直す（H15） | logic.ts INV_SKIP_ITEMS: ai duyệt được cũng chọn được "スキップ". 台帳: chỉ システム管理 (H15). Việc code: giới hạn quyền chọn スキップ. |
| 15 | 038 | 10.1 | 通算の判定 | c | 超過の状態は見本データでは作れない（申請の登録のときに共通データが通算12ヶ月を超える申請を止めるため）。注記の文言は コード（PauseB… | Trạng thái vượt 通算12ヶ月 không tạo được từ seed (khi đăng ký đơn dữ liệu chung đã chặn). Cần seed: một 休止 đã duyệt khiến tổng vượt 12 tháng (chỉ tạo được bằng cách ghi thẳng dữ liệu). Giữ demo_ok. |
| 16 | 041 | 11.3 | 自社便だけの拠点の注記 | b | 承認前の注記はあるが、承認後の I100 の表示と、運営のホーム／お知らせ（I101）の「配送停止（自社便）」はコードに未実装（H14） | H14: code chỉ có ghi chú ở màn duyệt (changeBlocks.tsx); chưa có I100 sau khi duyệt và dòng "配送停止（自社便）" ở Dashboard (top.ts không có). Việc code: thêm. |
| 17 | 043 | 15 | 見つからない | b | コードの文言は「この申請は見つかりません。」。I10（{対象}が見つかりません。）に揃える | Code hiện câu "không tìm thấy" khác I10 (「{対象}が見つかりません。」). Việc code: đổi theo I10. |
| 18 | 045 | 8.12 | 承認・却下のトースト／エラー | b | コードの文言は「この拠点は処理済みです」「（拠点名）を承認しました。法人へお知らせを送ります」。S100・E103 に揃える（「お客様」「（… | Câu toast/banner/dialog trong code khác message chung trong _共通_メッセージ. Việc code: đồng nhất theo ID message. |
| 19 | 047 | 4.6 | 紹介の有無・他社乗り換えの確認 | b | コードの①の4タブにこの確認欄はない（H16）。申込フォーム §10-2 ① どおり足す | H16: tab ① của 受付詳細 chưa có ô xác nhận 紹介の有無・他社乗り換え. Việc code: thêm theo 申込フォーム §10-2. |
| 20 | 056 | 10.2 | この拠点を確定 | b | 確定のボタンの文言はコードでは「この拠点を確定」、確認ダイアログは「正式登録」の語。台帳の「本登録」に揃える。確定の動き（共通データへの子契… | Nhãn nút "この拠点を確定" / dialog dùng từ "正式登録" thay vì "本登録"; việc 確定 (tạo hợp đồng con・配送 trong dữ liệu chung) hiện chỉ đổi trạng thái màn hình (SetupPanel tách riêng). Việc code: đổi từ + nối vào dữ liệu chung (H16). |
| 21 | 056 | 12 | 法人の基本情報 | b | ES営業担当の選択肢は固定の3名（H19）。運営のユーザー（アカウント一覧）から選ぶ | ES営業担当: code dùng danh sách cố định 3 người (ES_STAFF / forms.ts), hoặc lấy từ các dòng. Việc code: lấy từ アカウント運営 (H19). |
| 22 | 056 | 12.1 | 請求書に載る住所 | b | 住所検索のボタンがない（H7）。台帳 F 2026-10-07（全サイト共通）どおり郵便番号の横に置く | Chưa có nút 住所検索 ở màn này (CORP/BRAN đã có nút nhưng toast "まだつないでいません"). Việc code: thêm nút cạnh mã bưu chính (台帳 F 2026-10-07, H7). |
| 23 | 057 | 13 | 拠点の基本情報・住所 | b | 住所検索のボタンがない（H7） | Chưa có nút 住所検索 ở màn này (CORP/BRAN đã có nút nhưng toast "まだつないでいません"). Việc code: thêm nút cạnh mã bưu chính (台帳 F 2026-10-07, H7). |
| 24 | 057 | 13.3 | 納品不可曜日 | b | コードでは納品不可曜日は子契約のタブ（配送・納品スケジュール）にあり、拠点のタブにはない。仕様（契約_04・申込フォーム §10-3）は拠点… | Code đặt 納品不可曜日 ở tab 子契約, không ở tab 拠点 như spec (契約_04・申込フォーム §10-3). Việc code: chuyển sang tab 拠点. |
| 25 | 059 | 1.8 | 保存 | b | E31（先に更新されていた）・E30（保存失敗）の処理はコードにない。画面の中の入力は、この画面を開いている間だけ持つ（共通データへ保存して… | Màn 受付詳細: nội dung nhập chỉ giữ trong bộ nhớ trang, chưa lưu vào dữ liệu chung, chưa xử lý E31/E30 (H3). Việc code: nối lưu vào dữ liệu chung + E31/E30. |
| 26 | 064 | 18 | 確定の確認 | b | コードのダイアログは「正式登録」の語。「本登録」に揃える。締切後の2択（W100）は受付の画面のコードにまだない（承認の画面にだけある） | Câu toast/banner/dialog trong code khác message chung trong _共通_メッセージ. Việc code: đồng nhất theo ID message. |
| 27 | 067 | 1.10 | アカウント発行のトースト | b | コードのトーストは「（デモ）」付きの長い文言（40文字超）。S102 に揃える | Câu toast/banner/dialog trong code khác message chung trong _共通_メッセージ. Việc code: đồng nhất theo ID message. |
| 28 | 071 | 18.3 | 開始月の扱い（締切後） | b | 受付の画面のコードには、締切後の2択がない（承認の画面にだけある）。受付にも足す | Màn 受付詳細 chưa có lựa chọn 2 phương án sau hạn chót (W100) (chỉ có ở màn duyệt). Việc code: thêm. |
| 29 | 072 | 15.7 | 倉庫・配送回数を変えたときの警告 | b | コードに警告がない（見本の画面では倉庫を変えても何も出ない）。台帳・仕様どおり警告を足す | Code chưa cảnh báo khi đổi kho / số lần giao ở 受付詳細. Việc code: thêm cảnh báo theo 台帳/spec. |
| 30 | 076 | 24 | 見つからない | b | コードの文言は「この申請は見つかりません。」。I10 に揃える | Code hiện câu "không tìm thấy" khác I10 (「{対象}が見つかりません。」). Việc code: đổi theo I10. |
| 31 | 077 | 1.2 | 登録 | b | コードのチェックは必須・郵便番号の有無だけで、文字数上限・カナ・メール形式・絵文字・全角→半角がない（H5）。文言は直書き（ID なし）。E… | H5 + quyền: kiểm tra chỉ bắt buộc/mã bưu chính; chưa có độ dài, kana, email, emoji; câu chữ viết thẳng. Và 代理入力 tính là "create" (CS không bấm được, Q1). Việc code: áp H5 + sửa quyền như No.1.3. |
| 32 | 077 | 2.3 | 入力者 | b | コードは入力者が固定の見本（にっしぐち（運営））。ログイン中のユーザーにする | 入力者 là giá trị cố định (にっしぐち（運営）). Việc code: dùng user đang đăng nhập. |
| 33 | 077 | 2.4 | ES営業担当 | b | コードの選択肢は固定の3名（H19）。運営のユーザー（アカウント一覧）から選ぶ | ES営業担当: code dùng danh sách cố định 3 người (ES_STAFF / forms.ts), hoặc lấy từ các dòng. Việc code: lấy từ アカウント運営 (H19). |
| 34 | 077 | 3.2 | 法人名 | b | コードは文字数の上限がない（H5） | Form 代理入力 chưa có giới hạn độ dài (H5). Việc code: thêm E04 (60). |
| 35 | 077 | 3.3 | 法人名フリガナ | b | コードはカタカナかを確かめない（H5） | Chưa kiểm tra katakana (H5). Việc code: kiểm tra. |
| 36 | 077 | 3.5 | 請求書に載る住所 | b | コードは「郵便番号・住所」の1欄（任意）で、住所検索がない（H7・H17）。法人Web の申込フォームと同じく、郵便番号・都道府県・市区町村… | Địa chỉ là 1 ô tùy chọn "郵便番号・住所", chưa có 住所検索 (H7・H17). Việc code: tách mã bưu chính・tỉnh・quận/huyện〜số nhà・tòa nhà, bắt buộc, thêm nút. |
| 37 | 077 | 3.6 | 電話番号 | b | コードは任意で、形式を確かめない（H5・H17） | Điện thoại tùy chọn, chưa kiểm tra định dạng (H5・H17). Việc code: bắt buộc + kiểm tra. |
| 38 | 077 | 3.8 | 法人の支払い方法・支払サイクル・請求書の発行時期・FAX | b | コードの代理入力にこれらの欄がない（H17）。法人Web と同じ項目に足す | Form 代理入力 trong code là bản đơn giản, thiếu mục so với 法人Web. Việc code: thêm đúng các mục như 法人Web (H17). |
| 39 | 077 | 4.3 | メールアドレス | b | コードはメールの形式を確かめない（H5） | Chưa kiểm tra định dạng email (H5). Việc code: kiểm tra. |
| 40 | 077 | 4.4 | 担当者の電話番号 | b | コードは任意（H17） | Điện thoại người phụ trách đang tùy chọn (H17). Việc code: bắt buộc như 法人Web. |
| 41 | 077 | 4.5 | 請求担当者・お申し込み者 | b | コードにこれらの欄がない（メイン担当者がそのまま申込者になる）。法人Web と同じ項目に足す（H17） | Form 代理入力 trong code là bản đơn giản, thiếu mục so với 法人Web. Việc code: thêm đúng các mục như 法人Web (H17). |
| 42 | 078 | 5.2 | 契約区分 | b | お試し期間（月数）の欄がコードにない（H17） | Form 代理入力 trong code là bản đơn giản, thiếu mục so với 法人Web. Việc code: thêm đúng các mục như 法人Web (H17). |
| 43 | 078 | 5.4 | 郵便番号 | b | 住所検索のボタンがない（H7） | Chưa có nút 住所検索 ở màn này (CORP/BRAN đã có nút nhưng toast "まだつないでいません"). Việc code: thêm nút cạnh mã bưu chính (台帳 F 2026-10-07, H7). |
| 44 | 078 | 5.5 | 住所 | b | コードは1欄。法人Web と同じく 都道府県（47択）・市区町村〜番地・建物に分ける（H17） | Địa chỉ 1 ô; cần tách 都道府県(47)・市区町村〜番地・建物 như 法人Web (H17). |
| 45 | 078 | 5.6 | プラン | b | コードの選択肢は固定の3つ。プランマスタから作る | Lựa chọn lấy từ giá trị các dòng / hằng số cố định trong code (constants.ts), không từ master. Việc code: lấy từ プランマスタ (plan/course). |
| 46 | 078 | 5.7 | コース | b | コードの選択肢は2つ（ESライト（自販機）がない）。プランマスタのコースに合わせる | Course chỉ 2 lựa chọn (thiếu ESライト（自販機）). Việc code: lấy từ プランマスタ. |
| 47 | 078 | 5.9 | 納品不可曜日 | b | コードは自由記述の1行。法人Web と同じチェック（月〜日・祝日）にする（H17） | Ô 納品不可曜日 là 1 dòng tự do; cần checkbox 月〜日・祝日 như 法人Web (H17). |
| 48 | 078 | 5.12 | 設備の希望 | b | コードは設備の区分だけで、機種・オプション・従業員数の欄がない（H17） | Mục 設備の希望 chỉ có loại thiết bị; thiếu 機種・オプション・従業員数 (H17). |
| 49 | 078 | 5.14 | 拠点のご担当者 | b | コードは自由記述の1欄。法人Web と同じ表（名前・フリガナ・メール・電話、メイン1・請求1）にする（H17） | Người phụ trách cơ sở là 1 ô tự do; cần bảng (tên・furigana・mail・tel, メイン1・請求1) (H17). |
| 50 | 078 | 5.15 | 請求先 | b | コードは請求先の選択だけ（支払方法・支払サイクルなしの H17） | Chỉ có chọn nơi nhận hóa đơn, thiếu phương thức/chu kỳ thanh toán (H17). |
| 51 | 078 | 5.17 | お試し期間（月数）・アカウントを発行するか | b | コードの代理入力にこの2つの欄がない（H17）。アカウント発行は仮登録の確認（AW_APPL_003 No.8.2）で決まる | Form 代理入力 trong code là bản đơn giản, thiếu mục so với 法人Web. Việc code: thêm đúng các mục như 法人Web (H17). |
| 52 | 078 | 7 | 添付資料 | b | コードは「ファイルを選択（デモ）」の文字入力でファイルを選べない。ファイル選択の部品にする | Ô file là chữ "ファイルを選択（デモ）", không chọn file thật. Việc code: dùng component chọn file. |
| 53 | 079 | 3.7 | 法人 | b | コードの選択肢は固定の見本（6社）。法人一覧（共通データ）から作る | Danh sách pháp nhân / cơ sở / tháng chu kỳ là hằng cố định (constants.ts CORPS / BRS / CF_STARTS). Việc code: lấy từ dữ liệu chung (法人一覧 / 拠点 / chu kỳ hiện tại). |
| 54 | 082 | 8 | 入力エラー | b | コードの文言は直書き（「受付経路を選んでください」など）で、ID がない。E01・E02 に揃える。エラーを項目の下に出す点はコードも同じ | Câu toast/banner/dialog trong code khác message chung trong _共通_メッセージ. Việc code: đồng nhất theo ID message. |
| 55 | 085 | 10 | 登録完了 | b | コードのトーストは「登録しました。受付中の申込として一覧に追加しました（番号）」と同じ。S101 に揃える | Câu toast/banner/dialog trong code khác message chung trong _共通_メッセージ. Việc code: đồng nhất theo ID message. |
| 56 | 086 | 2.3 | 入力者 | b | コードは固定の見本（にっしぐち（運営））。ログイン中のユーザーにする | 入力者 cố định. Việc code: dùng user đăng nhập. |
| 57 | 086 | 3.2 | 法人 | b | コードの選択肢は固定の1社（サンプル）。法人一覧（共通データ）から作る | Danh sách pháp nhân / cơ sở / tháng chu kỳ là hằng cố định (constants.ts CORPS / BRS / CF_STARTS). Việc code: lấy từ dữ liệu chung (法人一覧 / 拠点 / chu kỳ hiện tại). |
| 58 | 086 | 3.3 | 拠点 | b | コードの選択肢は固定の5拠点。選んだ法人の拠点（共通データ）から作る | Danh sách pháp nhân / cơ sở / tháng chu kỳ là hằng cố định (constants.ts CORPS / BRS / CF_STARTS). Việc code: lấy từ dữ liệu chung (法人一覧 / 拠点 / chu kỳ hiện tại). |
| 59 | 086 | 3.4 | 開始（適用）するサイクル月 | b | コードの選択肢は固定の3つ（2027年2〜4月サイクル）。今のサイクルと締切から作る | Danh sách pháp nhân / cơ sở / tháng chu kỳ là hằng cố định (constants.ts CORPS / BRS / CF_STARTS). Việc code: lấy từ dữ liệu chung (法人一覧 / 拠点 / chu kỳ hiện tại). |
| 60 | 086 | 3.9 | 内容 | b | コードは種類によらず自由記述の「内容」1欄。法人Web の変更のお申し込みと同じ項目にする（No.3.11・H17） | Form 代理入力 trong code là bản đơn giản, thiếu mục so với 法人Web. Việc code: thêm đúng các mục như 法人Web (H17). |
| 61 | 087 | 1.2 | 登録 | b | コードの文言は直書き（ID なし）。E01・E02・E104〜E108 に揃える。代理入力を「作成」扱い（CS は押せない）→台帳どおり機能… | WT + quyền: câu chữ viết thẳng; 代理入力 tính "create" (CS không bấm được, Q1); đơn trùng hiện câu của dữ liệu chung. Việc code: theo E01/E02/E104〜E108 + sửa quyền. |
| 62 | 091 | 3.11 | 種類ごとの入力項目（法人Web と同じ） | b | コードの代理入力は種類によらず自由記述の「内容」1欄で、構造化された入力ではない（H17）。法人Web の変更のお申し込み（法人B の設計書… | Form 変更申請 là 1 ô "内容" tự do, không theo loại đơn (H17). Việc code: nhập có cấu trúc như 法人Web (法人B). |
| 63 | 092 | 4 | 入力エラー | b | コードの文言は直書き（「申請の種類を選んでください」など）。E01・E02 に揃える | Câu toast/banner/dialog trong code khác message chung trong _共通_メッセージ. Việc code: đồng nhất theo ID message. |
| 64 | 093 | 6 | 登録完了のトースト | b | コードのトーストは「登録しました。承認待ちの申請として追加しました（番号）」と同じ。S101 に揃える。重複申請のトーストはコードでは共通デ… | Câu toast/banner/dialog trong code khác message chung trong _共通_メッセージ. Việc code: đồng nhất theo ID message. |
| 65 | 096 | 3.1 | 説明文 | b | 共通の説明の1文「キーが一致する行は上書き、キーが空欄の行は新規です。空欄のセルは今の値のまま、消すときは「-」を書きます」は新規申込には当… | Câu giải thích chung của CSV (CsvImportModal) nói "キーが一致する行は上書き…「-」" không đúng với 新規申込. Việc code: không hiện câu này ở màn CSV đơn mới. |
| 66 | 096 | 7.7 | 行のチェック | b | コードは郵便番号の桁・フリガナの全角カナ・電話の形式・全角→半角・絵文字を見ていない（H5 の入力の共通基準に合わせる）。ES営業担当は文字… | Code chưa kiểm tra theo chuẩn nhập liệu chung (độ dài tối đa / kana / email / emoji / 全角→半角; câu chữ viết thẳng không có ID). Việc code: áp chuẩn (E01/E02/E04/E05/E07/E13). |
| 67 | 097 | 1.2 | 登録 | b | コードは確認の小窓（Q10）を出さずにすぐ登録し、トーストは共通の「CSV取込：新規 n件・更新 m件を登録しました（変更なし k件）」。新… | CsvImportModal đăng ký ngay không hiện xác nhận Q10; toast chung "CSV取込：新規 n件・更新 m件…". Việc code: Q10 + S10 cho CSV đơn mới. |
| 68 | 097 | 4.1 | ファイル名・件数・結果のバッジ | b | コードは「更新 0」「変更なし 0」も出す。新規申込には要らないので、新規とエラーだけにする | Badge hiện cả "更新 0"/"変更なし 0" (không cần cho đơn mới). Việc code: chỉ hiện mới + lỗi. |
| 69 | 097 | 4.2 | エラーの行の帯 | b | コードの帯は「エラーの行 n件は取り込みません（行番号と内容は下の表）。ほかの行（新規 n件・更新 m件）は「登録」で登録します。」。E11… | Câu toast/banner/dialog trong code khác message chung trong _共通_メッセージ. Việc code: đồng nhất theo ID message. |
| 70 | 097 | 4.4 | エラーの表 | b | コードの内容は文章の直書き（「法人名を入れてください」「5行目（同じ法人キー）と違う値です。…」など）。E01・E02・E04・E05・E1… | Lỗi hàng viết thẳng, thiếu kiểm tra định dạng mã bưu chính/furigana/điện thoại (H5). Việc code: theo E01/E02/E04/E05/E109. |
| 71 | 099 | 3.4 | ファイル全体のエラー（①） | b | コードの文言は2つ（「CSVファイル（拡張子 .csv）を選んでください」「文字コードが UTF-8 ではありません。Excel では「CS… | Câu toast/banner/dialog trong code khác message chung trong _共通_メッセージ. Việc code: đồng nhất theo ID message. |
| 72 | 100 | 4.7 | ファイル全体のエラー（②） | b | コードは理由の文だけを赤い帯に出す（「1行目の見出しがテンプレートと違います（足りない列：…）（知らない列：…）」）。E34 を頭に付ける | Banner lỗi cả tệp chỉ có câu lý do, thiếu tiền tố E34. Việc code: thêm E34. |
| 73 | 101 | 5 | 登録完了（トースト） | b | コードのトーストは「CSV取込：新規 n件・更新 m件を登録しました（変更なし k件）」。S10 に揃える | Câu toast/banner/dialog trong code khác message chung trong _共通_メッセージ. Việc code: đồng nhất theo ID message. |

### AW_DASH ダッシュボード

| # | view | No. | 項目 | 分類 | 原文 `demo_ok`（日本語・抜粋） | Hiện trạng code / việc cần làm |
|---|---|---|---|---|---|---|
| 74 | 001 | 3.2 | アラートの行 | b | コードは13行のうち11行を全役割に同じく出す（お問い合わせの行を営業が「開く」と 403）。行ごとに出し分ける（宿題） | top.ts topAlerts: trả mọi dòng cho mọi vai trò (không lọc theo quyền; chỉ cần quyền dashboard). Ví dụ 営業 bấm "開く" ở dòng お問い合わせ bị 403. Việc code: lọc từng dòng theo quyền của màn đích. |
| 75 | 001 | 3.2.13 | お問い合わせ（新着） | b | コードは文末に「（HubSpot 送信）」を付け、全役割に出す。付けない・権限で出し分ける（宿題） | Dòng お問い合わせ có đuôi 「（HubSpot 送信）」 và hiện cho mọi vai trò. Việc code: bỏ đuôi + lọc quyền. |
| 76 | 002 | 3.3 | アラートが0件のとき | c | 見本のデータでは何かしらアラートが出るので撮れない（全部が0件になるデータが必要） | Cần seed: toàn bộ dòng cảnh báo bằng 0 (seed luôn có cảnh báo: 配送・資材・契約申請…). Không tạo được bằng API thông thường. Giữ demo_ok. |
| 77 | 002 | 3.2.4 | 追加発注の入荷遅れ | c | 見本のデータでは該当がなく撮れない | Cần seed: 追加発注 có ngày nhập kho không kịp chuyến (dmStock.alerts.altLate). Chưa seed được đơn giản. Giữ demo_ok. |
| 78 | 002 | 3.2.10 | 廃棄率が3%を超えた | b | コードにこの行がない（受付簿 #122 は「対象なし」と記録したが台帳 H は用途に含める。足す宿題） | topAlerts không có dòng "廃棄率が3%を超えた" (台帳 H dùng; 受付簿 #122 ghi "対象なし"). Việc code: thêm dòng. |
| 79 | 002 | 3.2.11 | 配送停止（自社便） | b | コードは承認画面の注記だけで、この行がない（H14：足す宿題） | Chưa có dòng "配送停止（自社便）" (H14). Việc code: thêm vào topAlerts. |
| 80 | 002 | 3.2.12 | お知らせの配信予約 | a | 見本のデータでは該当がなく撮れない | Đã seed qua API (đăng ký お知らせ có publishFrom 2026-11-01) trong view mới AW_DASH_016 và chụp thật. Đã bỏ demo_ok. |
| 81 | 006 | 5.4 | 0件のとき | b | コードの文言は「条件に一致するデータがありません。条件を変えるか「クリア」を押してください。」。I01 に揃える（宿題） | page.tsx 275/298: "条件に一致するデータがありません。…". Việc code: theo I01. |
| 82 | 009 | 6.5 | 0件のとき | b | コードの文言は No.5.4 と同じ（I01 に揃える宿題） | Như 5.4 (I01). |
| 83 | 010 | 7 | 読み込めなかったとき | b | コードは失敗しても「読み込み中…」のまま止まる（E346 を出す宿題）。撮影は通信を止めて「読み込み中…」を撮る | Alerts() chỉ có !data → "読み込み中…", không xử lý lỗi nên mãi "読み込み中…". Việc code: hiện E346 khi lỗi. |
| 84 | 011 | 2 | 警告カード（ページ上部） | a | 撮影用の見本データ（今日＝10/05）には該当がなく、この状態（011）では何も出ない。出る状態は 013・014 | Đã seed qua API (setBillStatus 確定 + repriceChildren 誤りの訂正 → lockedSkips) trong view AW_DASH_011 và chụp thật (3件). Đã bỏ demo_ok. |
| 85 | 011 | 2.3 | 確定済みの月に反映していない変更（黄） | a | 見本のデータでは該当がなく撮れない（確定済みの月がある状態でプラン変更を承認する必要がある）。表示はコードどおりに書く | Như No.2 (seed lockedSkips trong view 011). Đã chụp thật, bỏ demo_ok. |
| 86 | 011 | 2.3.1 | 変更の行 | a | 見本のデータで撮れない（2.3 と同じ） | Như No.2 (seed lockedSkips trong view 011). Đã chụp thật, bỏ demo_ok. |
| 87 | 011 | 2.3.2 | 反映 | a | 見本のデータで撮れない（2.3 と同じ） | Như No.2 (seed lockedSkips trong view 011). Đã chụp thật, bỏ demo_ok. |
| 88 | 011 | 2.3.3 | 反映しない | a | 見本のデータで撮れない（2.3 と同じ） | Như No.2 (seed lockedSkips trong view 011). Đã chụp thật, bỏ demo_ok. |
| 89 | 011 | 2.3.4 | 確定解除へ | a | 見本のデータで撮れない（2.3 と同じ） | Như No.2 (seed lockedSkips trong view 011). Đã chụp thật, bỏ demo_ok. |
| 90 | 012 | 2.3.5 | 反映の結果（トースト） | a | 見本のデータで撮れない（2.3 と同じ） | Seed + bấm "反映" trong view AW_DASH_012, chụp thật toast. Đã bỏ demo_ok. |
| 91 | 013 | 3.2.2 | 発注 | d | 今日が 2026-10-05 の見本では出ない（今日を 10/22 に進めると出る。状態 013） | Lý do cũ lỗi thời: mục 3.2.2 chỉ nằm trong view 013 (today=2026/10/22) và đã chụp thật; không còn ở view 001. Đã bỏ demo_ok. |
| 92 | 015 | 8 | 参照のみの役割 | b | 閲覧のみ（Ad00013）でもお問い合わせの行が出る（行ごとの出し分けは宿題）。「反映」は見本に該当がなく撮れない | Vai trò 閲覧のみ (Ad00013) vẫn thấy dòng お問い合わせ (topAlerts không lọc quyền). Còn "反映" không có để chụp vì seed lockedSkips cần quyền (Ad00013 không seed được). Việc code: lọc dòng theo quyền. |

### AW_CORP 法人一覧

| # | view | No. | 項目 | 分類 | 原文 `demo_ok`（日本語・抜粋） | Hiện trạng code / việc cần làm |
|---|---|---|---|---|---|---|
| 93 | 001 | 1.4 | CSV出力 | b | コードの出力は画面の項目の列（配下の拠点・登録日時を含む）。担当者の表は出力に含めない（確認メモ H18：全項目か phiên gộp で確… | Export thử: 28 cột (cột danh sách + mọi trường) nhưng không có bảng người phụ trách và 更新日時. Việc code: thêm vào CSV (台帳 M-1 mọi mục, H18). |
| 94 | 001 | 2.3 | 法人ステータス | b | コードの選択肢は 仮登録／正式登録／休眠 の3つ（取消がない・H6）。「休眠」の定義（いつ・だれが・どの条件で）は未決（確認メモ O3） | Lựa chọn trạng thái pháp nhân chỉ có 仮登録／正式登録／休眠 (thiếu 取消, H6). Định nghĩa "休眠" vẫn chưa quyết (O3). Việc code: thêm 取消 (mặc định ẩn); chờ hong về 休眠. |
| 95 | 001 | 3 | 法人の一覧 | b | コードの 0件の文言は「条件に一致するデータがありません。条件を変えるか「クリア」を押してください。」。I01 に揃える（H1） | Code hiện câu 0 dòng khác I01 (「表示するデータがありません。」). Việc code: đổi câu 0 dòng theo I01. |
| 96 | 008 | 7 | ご注文のリマインドを送る | b | コードは詳細（参照）の画面でチェックを押した瞬間に保存する（H10：詳細は表示だけ・保存は「保存」1つの決まりと違う） | DetailScreen.tsx 468: checkbox "ご注文のリマインドを送る" lưu ngay ở màn chi tiết (setOrderReminder). Trái P-FORM (chi tiết chỉ xem, lưu bằng 保存) (H10). Việc code: chuyển sang màn sửa hoặc xác nhận ngoại lệ. |
| 97 | 008 | 8.1 | タブ | d | 仕様（契約_00 §0.1）の4タブとコードは同じ（確認メモの H11 はコードの前の版の話） | Lý do cũ chỉ nói "4 tab giống spec" (không phải khác biệt). Đã viết lại: còn lệch P-TAB (tab không đổi URL khi chuyển). |
| 98 | 011 | 16 | タブ「変更履歴」の表 | b | コードの列は 変更日時・対象・対象名・変更内容・変更者・適用範囲・承認者・通知の有無（変更内容は「項目名「前」→「後」」の1列）。項目・変更… | Cột lịch sử trong code gộp "変更内容" 1 cột, chưa tách 項目・変更前・変更後・理由 (P-HIST, Q6=C). Việc code: tách cột. |
| 99 | 012 | 6 | 仮登録中の帯 | b | コードの帯の文言は I105 と少し違う（「…編集は 契約申請管理 ＞ 申請詳細 で行います…」）。I105 に揃える | Banner (provbar) khác I105 một chút (「…編集は 契約申請管理 ＞ 申請詳細 で行います…」). Việc code: theo I105. |
| 100 | 013 | 18 | パスワード再設定の案内（確認） | b | コードの本文・ボタン名（「送る」）は Q302 と少し違う（「…パスワード再設定の案内（認証コード・有効期限5分）をメールで送ります」）。Q… | WT (Q302: nội dung/nút "送る" khác). |
| 101 | 015 | 20 | アカウントの停止（確認） | b | コードのボタン名「停止する」・本文に「再開するまで法人Web のホーム・法人情報・申請は使えません」が付く。Q104 に揃える | WT (Q104: nút "停止する" + câu thêm về "再開するまで…"). |
| 102 | 016 | 12.6 | アカウントの停止／再開 | b | コードは法人情報の編集権限があれば停止・再開も押せる（CS も押せる）。停止・再開だけフル権限・システム管理に絞る（宿題） | apiPerm.ts: contracts.corpAccount = [corps, update] nên CS cũng bấm 停止/再開 được. 台帳 F 2026-10-07 (Q3): chỉ フル権限・システム管理. Việc code: tách quyền riêng cho 停止・再開. |
| 103 | 019 | 17 | 見つからないとき | b | コードの文言は「法人（CU99999）が見つかりません」（句点なし）。I10 に揃える | Code hiện câu "không tìm thấy" khác I10 (「{対象}が見つかりません。」). Việc code: đổi theo I10. |
| 104 | 020 | 21.2 | 保存 | b | コードの入力チェックの文言は直書き（「…を入力してください」）で ID がなく、赤枠の下に出す。E01 などに揃える（H5）。文字数の上限（… | Câu kiểm tra viết thẳng (không có ID); E04 và E31 đã làm, chưa có kana/email/emoji; giới hạn code khác 設計書 (xem ghi chú E04). |
| 105 | 020 | 23.1 | 法人名 | d | コードは必須のチェックだけで、最大文字数（60）・絵文字のチェックがない（H5） | Lý do cũ sai (nói không có kiểm tra độ dài). Thực tế: giới hạn 120 (varchar(120)) khác 設計書 60; emoji (E13) không bị chặn (đã lưu thử). Việc code: giới hạn 60 + chặn emoji. |
| 106 | 020 | 23.5 | ES営業担当 | b | コードの選択肢は固定の3名（運営のユーザーの一覧から作る宿題・H19） | ES営業担当: code dùng danh sách cố định 3 người (ES_STAFF / forms.ts), hoặc lấy từ các dòng. Việc code: lấy từ アカウント運営 (H19). |
| 107 | 021 | 24.2 | 住所検索 | b | 本番では「まだつないでいません」のトーストが出る（住所のデータの出どころ未決） | Nút có nhưng toast "まだつないでいません"; nguồn dữ liệu địa chỉ chưa quyết (hong: nút vẫn đặt). Chờ quyết định nguồn. |
| 108 | 021 | 24.4 | 市区町村 | d | コードの最大文字数のチェックがない（H5） | Lý do cũ sai. Thực tế: có kiểm tra nhưng giới hạn 60 (varchar(60)), 設計書 255 (đã lưu thử: 61 ký tự báo lỗi). Việc code: nới 255. |
| 109 | 021 | 27.1 | 区分 | b | コードはメイン・請求担当者が0名でも保存できる（H5：E116 のチェックを足す宿題。見本では行を消した状態までを撮る） | validate() (logic.ts) không kiểm tra メイン/請求担当者 ≥1 người (E116). Việc code: thêm E116. |
| 110 | 022 | 26.1 | 請求書発行リードタイム | b | コードは変えて前払いが重なる／抜ける月があっても警告しない（H20：W101 を出す宿題） | Code chưa có cảnh báo W101 khi đổi リードタイム làm tháng trả trước bị trùng/thiếu (H20). Việc code: thêm cảnh báo; chưa chụp được. |
| 111 | 022 | 29 | 拠点の請求先を一括変更 | b | 詳細（表示だけの画面）では押せない作り（コード）。編集画面で押す。保存の仕組みが「保存」1つの決まりと違うので、置き場所を hong に確認… | Nút "拠点の請求先を一括変更" chỉ bấm được ở màn sửa; cách lưu khác nguyên tắc "保存 1 nút". Cần hong quyết vị trí đặt (確認メモ B). |
| 112 | 025 | 31 | 請求書発行リードタイム変更の警告 | b | コードにこの警告がない（H20）。撮影できない | Code chưa có cảnh báo W101 khi đổi リードタイム làm tháng trả trước bị trùng/thiếu (H20). Việc code: thêm cảnh báo; chưa chụp được. |
| 113 | 030 | 29.5 | 結果（トースト） | b | コードのトーストは「n拠点の請求先を変更しました（デモ）」。本番は「（デモ）」を付けない。S104 に揃える | WT (S104; code thêm 「（デモ）」 khi DEMO). |
| 114 | 031 | 32 | 保存完了 | b | コードのトーストの文言は「保存しました」（句点なし）。S01 に揃える | WT (S01: code là 「保存しました」 không có 。). |

### AW_BRAN 拠点一覧

| # | view | No. | 項目 | 分類 | 原文 `demo_ok`（日本語・抜粋） | Hiện trạng code / việc cần làm |
|---|---|---|---|---|---|---|
| 115 | 001 | 1.4 | CSV出力 | b | コードの出力は画面の項目の列と一覧の列（H18：全項目か phiên gộp で確認） | Export thử: 44 cột (cột danh sách + mọi trường). Không có bảng người phụ trách, 更新日時, 継続年月. Việc code: thêm (H18). |
| 116 | 001 | 2.4 | 拠点ステータス | b | コードの選択肢に「取消」がない（H6） | Lựa chọn 拠点ステータス thiếu 取消 (H6). Việc code: thêm 取消 (mặc định ẩn). |
| 117 | 001 | 3 | 拠点の一覧 | b | コードの 0件の文言は「条件に一致するデータがありません。条件を変えるか「クリア」を押してください。」（I01 に揃える・H1） | Code hiện câu 0 dòng khác I01 (「表示するデータがありません。」). Việc code: đổi câu 0 dòng theo I01. |
| 118 | 010 | 9.1 | 拠点ステータス | b | コードの選択肢に「休止中」があり、選ぶと E117 相当のエラー（決定は表示だけ） | forms.ts: lựa chọn 拠点ステータス có "休止中"; chọn thì lỗi. Quyết định: 休止中 chỉ hiển thị. Việc code: bỏ khỏi lựa chọn. |
| 119 | 013 | 15.3 | 貸出ステータスの絞り込み | b | コードは表の上の「回収済も表示」のボタン（トグル）。ドロップダウンに直す宿題（H9） | forms.ts: vẫn có nút "回収済も表示" (toggle) thay vì dropdown lọc 貸出ステータス (H9). Việc code: đổi thành dropdown. |
| 120 | 013 | 15.4 | 回収済も表示（コードのボタン） | b | コードにあるボタン。決定では置かない（H9） | Nút "回収済も表示" vẫn còn trong forms.ts. Việc code: bỏ (H9). |
| 121 | 015 | 21 | カード「履歴（拠点・親契約）」 | b | コードの列は 変更日時・変更内容・変更者・適用範囲・承認者・通知の有無。項目・変更前・変更後・理由に分ける宿題（Q6＝C） | Cột lịch sử trong code gộp "変更内容" 1 cột, chưa tách 項目・変更前・変更後・理由 (P-HIST, Q6=C). Việc code: tách cột. |
| 122 | 016 | 6 | 仮登録中の帯 | b | コードの帯の文言は I105 と少し違う。I105 に揃える | Banner khác I105. Việc code: theo I105. |
| 123 | 021 | 22 | 見つからないとき | b | コードの文言は「拠点（CU99999）が見つかりません」（句点なし）。I10 に揃える | Code hiện câu "không tìm thấy" khác I10 (「{対象}が見つかりません。」). Việc code: đổi theo I10. |
| 124 | 023 | 26.2 | 保存 | b | コードの入力チェックの文言は直書きで ID がない（H5）。文字数の上限（E04）と同時更新の検知（E31）は実装済み。カナ・メール形式・絵… | Như CORP 21.2 (câu viết thẳng; E04・E31 xong; thiếu kana/email/emoji; giới hạn khác 設計書). |
| 125 | 023 | 28.6 | 拠点ステータス | b | コードの選択肢に「休止中」があり、選ぶとエラー（休止は契約申請管理の休止から）。決定は休止中を選択肢に持たない（契約_04 No.6） | Lựa chọn 拠点ステータス có "休止中" khi sửa (forms.ts), chọn thì lỗi. Việc code: bỏ (契約_04 No.6). |
| 126 | 024 | 29.2 | 住所検索 | b | 本番では「まだつないでいません」のトーストが出る（住所のデータの出どころ未決） | Như CORP 24.2 (nút có, nguồn dữ liệu chưa quyết). |
| 127 | 024 | 34.1 | 区分 | b | コードはメイン・請求担当者が0名でも保存できる（H5：E116 のチェックを足す宿題） | Như CORP 27.1 (chưa có E116). |
| 128 | 026 | 32.2 | 請求書発行リードタイムの上書き | b | コードは変えて前払いが重なる／抜ける月があっても警告しない（H20） | Code chưa có cảnh báo W101 khi đổi リードタイム làm tháng trả trước bị trùng/thiếu (H20). Việc code: thêm cảnh báo; chưa chụp được. |
| 129 | 028 | 33.4 | 搬入経路資料（委託配送業者向け・非公開） | b | コードのラベルは「搬入経路資料（委託配送会社向け・非公開）」。契約_04 の「委託配送業者向け」に揃える（用語は phiên gộp で確認… | Nhãn trong code 「搬入経路資料（委託配送会社向け・非公開）」 vs 契約_04 「委託配送業者向け」. Chờ hong thống nhất thuật ngữ (phiên gộp). |
| 130 | 032 | 40 | 請求書発行リードタイムの上書き変更の警告 | b | コードにこの警告がない（H20）。撮影できない | Code chưa có cảnh báo W101 khi đổi リードタイム làm tháng trả trước bị trùng/thiếu (H20). Việc code: thêm cảnh báo; chưa chụp được. |
| 131 | 035 | 41 | 保存完了 | b | コードのトーストの文言は「保存しました」（句点なし）。S01 に揃える | WT (S01: 「保存しました」 không có 。). |
| 132 | 036 | 23.4 | 延長の結果（トースト） | d | コードのトーストは「…法人へお知らせしました」で、本番は同じ。延長の月の請求は割引しない（H12） | Lý do cũ lỗi thời: dialog nay đã ghi "割引しない（プラン料金を請求）" (commit 93a427b). Toast = S106, chỉ thiếu dấu 。 cuối câu. Đã viết lại. |

### AW_CONT 子契約一覧

| # | view | No. | 項目 | 分類 | 原文 `demo_ok`（日本語・抜粋） | Hiện trạng code / việc cần làm |
|---|---|---|---|---|---|---|
| 133 | 001 | 1.3 | 価格世代を一括切替 | b | コードは子契約の編集権限があれば出す（CS の R/U も押せる）。フル権限・システム管理だけに絞る宿題（domain:bulk.start… | apiPerm.ts: domain:bulk.start không có trong bảng → AREA bulk = contracts, tên "start" = update, nên CS bấm được. 台帳 F 2026-10-07 (Q2): chỉ フル権限・システム管理 (= quyền "create" của 子契約). Việc code: gán [contracts, create] cho bulk.start. |
| 134 | 001 | 3 | 子契約の一覧 | b | コードの 0件の文言は「条件に一致するデータがありません。条件を変えるか「クリア」を押してください。」（I01 に揃える・H1） | Code hiện câu 0 dòng khác I01 (「表示するデータがありません。」). Việc code: đổi câu 0 dòng theo I01. |
| 135 | 010 | 8 | タブ・項目の検索 | d | 仕様（契約_00 §0.1）の4タブとコードは同じ（確認メモの H11 はコードの前の版の話） | Lý do cũ chỉ nói "4 tab giống spec". Đã viết lại: còn lệch P-TAB. |
| 136 | 010 | 9.1 | 変更の適用範囲（保存時に確認） | b | コードにはこの名前のボタンが「子契約」カードにある（押すと保存の処理）。仕様では置かない（契約_05 契約 No.4） | Code có nút "変更の適用範囲（保存時に確認）" trong card 子契約 (bấm là lưu); spec không đặt (契約_05 契約 No.4). Việc code: bỏ nút. |
| 137 | 010 | 10.4 | 惣菜買取 | b | コードの画面にこの項目がない（仕様の契約_05 契約 No.8。足す宿題） | Màn chưa có mục 惣菜買取 (契約_05 契約 No.8). Việc code: thêm. |
| 138 | 011 | 16 | カード「支払情報」 | b | コードの支払情報は「支払方法」「支払サイクル」の2項目。請求先・請求書発行リードタイムの2項目を足す宿題（契約_05 の追加） | Card "支払情報" chỉ có 支払方法・支払サイクル; thiếu 請求先・請求書発行リードタイム (契約_05). Việc code: thêm 2 mục. |
| 139 | 013 | 22 | カード「履歴（子契約）」 | b | コードの履歴の列は 変更日時・変更内容・変更者・変更区分・適用範囲・承認者・通知の有無（変更内容は1列）。項目・変更前・変更後・理由に分ける… | Cột lịch sử trong code gộp "変更内容" 1 cột, chưa tách 項目・変更前・変更後・理由 (P-HIST, Q6=C). Việc code: tách cột. |
| 140 | 013 | 23 | カード「前月からの差分」 | b | コードに「変更のアラート」（一覧・詳細に出す印）がない（契約_05 履歴 No.2。足す宿題） | Chưa có "変更のアラート" (dấu ở danh sách・chi tiết, 契約_05 履歴 No.2). Việc code: thêm. |
| 141 | 015 | 6 | 仮登録中の帯 | b | コードの帯の文言は I105 と少し違う。I105 に揃える | Banner khác I105. Việc code: theo I105. |
| 142 | 016 | 12.1 | 自販機の拠点の配送区分 | b | コードは注記に「決定 28-19」と書く。設計書の注記の文言は決定番号を外す案（phiên gộp で確認） | logic.ts VM_NOTE ghi 「（決定 28-19）」. Đề xuất bỏ số quyết định khỏi chú thích (chờ hong ở phiên gộp). |
| 143 | 019 | 24 | 確定・請求済の子契約 | b | コードは請求済の子契約も編集・保存できる（適用範囲「以降すべて」のときに直さないだけ）。金額に効く項目の保存を止める宿題（契約_01 §1） | Code vẫn cho sửa・lưu 子契約 đã xuất hóa đơn (chỉ không sửa khi phạm vi "以降すべて"). Việc code: chặn lưu mục ảnh hưởng số tiền (E113, 契約_01 §1). |
| 144 | 020 | 25 | 見つからないとき | b | コードの文言は「子契約（…）が見つかりません」（句点なし）。I10 に揃える | Code hiện câu "không tìm thấy" khác I10 (「{対象}が見つかりません。」). Việc code: đổi theo I10. |
| 145 | 021 | 26.2 | 保存 | b | コードの入力チェックの文言は直書きで ID がない（H5）。文字数の上限（E04）と同時更新の検知（E31）は実装済み。カナ・絵文字のチェッ… | Như CORP 21.2 (E04・E31 xong; thiếu kana/emoji và E113; giới hạn khác 設計書). |
| 146 | 021 | 29.8 | 惣菜買取 | b | コードの画面にこの項目がない（足す宿題・契約_05 契約 No.8）。ラベルの場所を探す sel は '-' | Màn chưa có mục 惣菜買取 (契約_05 契約 No.8). Việc code: thêm. |
| 147 | 022 | 35 | 配送ルート設定（テーブル） | b | 選択肢（倉庫・運送会社・中継）は見本のマスタ。運営H（倉庫・委託配送先マスタ）の設計書と合わせる | Lựa chọn (kho・hãng vận chuyển・中継) là master mẫu; cần thống nhất với 設計書 運営H (kho・委託配送先). Chờ 運営H. |
| 148 | 023 | 34 | 価格調整の金額 | b | コードの文言は「金額は10円単位の半角数字で入力してください」（ID がない）。E14 などに揃える（H5） | Câu lỗi viết thẳng "金額は10円単位の半角数字で入力してください" (không ID). Việc code: theo E14... |
| 149 | 025 | 39 | 保存完了（トースト） | b | コードのトーストは「保存しました。…」（句点の位置が S01 と違う）。S01 に適用範囲の記録を添える形に揃える | WT (S01: câu code 「保存しました。…」 vị trí 。 khác). |
| 150 | 032 | 40 | 価格世代を一括切替（モーダル） | b | コードのモーダルは ③ 確認を自分の画面で出し、Q11（確認のモーダル）は使わない。実行の結果のトースト（変更・スキップ・失敗）は S107… | Modal tự làm bước ③ xác nhận (không dùng Q11) và toast kết quả là S107 (không S11/W10). Chờ hong xác nhận so với P-BULK. |
| 151 | 032 | 42.1 | 切り替える価格の世代 | b | コードの一覧に「上書きあり」の表示がない（契約_05 の料金の上書き。足す宿題） | Danh sách thế hệ giá chưa có dấu "上書きあり" (契約_05 料金の上書き). Việc code: thêm. |
| 152 | 035 | 44.1 | 後ろの流れへの影響 | b | コードは価格世代のモードでも「子契約（変えない：オーダー締切後で新しい倉庫にない商品の注文あり）」の行を出す（ルートのモードの項目。価格世代… | Code hiện cả dòng "子契約（変えない：オーダー締切後…）" ở chế độ thế hệ giá (đó là mục của chế độ ルート; xác nhận thấy trong màn hình thật). Việc code: bỏ ở chế độ 価格世代. |
| 153 | 035 | 44.2 | 注意の確認 | c | 見本のデータでは注意（上書き・日付の注意）が出る組み合わせがなく撮れない | Đã kiểm tra bulk.ts: alerts chỉ phát sinh ở chế độ "ルート" (mở từ 倉庫マスタ...), không phải từ 子契約一覧 → đã viết lại demo_ok. Cần seed/đường vào: đổi hàng loạt kho (chế độ ルート). |
| 154 | 035 | 44.4 | 件数の打ち直し | c | 見本のデータは子契約が72件で、100件を超える条件を作れず撮れない | Đã thử: tạo thêm hợp đồng con lên 144 vẫn không hiện, vì điều kiện là số "変える契約" (hợp đồng cha) > 100 (CONFIRM_OVER). Cần seed: ≥101 hợp đồng cha. Đã viết lại demo_ok. |
| 155 | 037 | 46 | 履歴タブ（これまでの一括変更） | b | コードの履歴の列は P-HIST（日時・操作した人・操作・項目・変更前・変更後・理由）と違い、一括変更の1行1件。操作した人の列がない（足す… | Cột lịch sử của bulk là 1 dòng 1 lần, thiếu cột "操作した人" (P-HIST: 日時・操作した人・操作・項目・変更前・変更後・理由). Việc code: thêm cột. |

### AW_MIGR 移行の要補完

| # | view | No. | 項目 | 分類 | 原文 `demo_ok`（日本語・抜粋） | Hiện trạng code / việc cần làm |
|---|---|---|---|---|---|---|
| 156 | 001 | 4.16 | 0件の表示 | b | コードの文は「条件に一致するデータがありません。検索条件を変えるか「クリア」…」で I01 と違う（P-LIST に合わせて I01 に直す… | Code hiện câu 0 dòng khác I01 (「表示するデータがありません。」). Việc code: đổi câu 0 dòng theo I01. |
| 157 | 004 | 16.7 | 登録 | b | 決定では確認のモーダル（Q10）を出すが、コードは確認なしで登録する（P-CSV に合わせる宿題） | CsvImportModal.commit đăng ký ngay không có modal xác nhận Q10 (P-CSV). Việc code: thêm xác nhận. |
| 158 | 008 | 21.7 | 登録 | b | 決定では確認のモーダル（Q10）を出すが、コードは確認なしで登録する（P-CSV に合わせる宿題） | CsvImportModal.commit đăng ký ngay không có modal xác nhận Q10 (P-CSV). Việc code: thêm xác nhận. |
| 159 | 010 | 26.7 | 登録 | b | 決定では確認のモーダル（Q10）を出すが、コードは確認なしで登録する（P-CSV に合わせる宿題） | CsvImportModal.commit đăng ký ngay không có modal xác nhận Q10 (P-CSV). Việc code: thêm xác nhận. |
| 160 | 012 | 31.7 | 登録 | b | 決定では確認のモーダル（Q10）を出すが、コードは確認なしで登録する（P-CSV に合わせる宿題） | CsvImportModal.commit đăng ký ngay không có modal xác nhận Q10 (P-CSV). Việc code: thêm xác nhận. |

## Việc code còn phải sửa (backlog), gom theo màn

(Chỉ gồm loại b. Loại c cần seed/dữ liệu, ghi ở mục sau.)

**AW_APPL_001 契約申請管理（一覧）** — 8 mục
- No.1.3 新規登録（代理入力）／変更申請の代理入力: apiPerm.ts: createChange / proxy new tính là "create" nên R/U (CS) không bấm được. 台帳 F 2026-10-07 (Q1=B): CS cũng được 代理入力. Việc code: đổi quyền thành "update" cho 代理入力 (chỉ 営業 R không được).
- No.2 タブ: P-TAB (tab trên URL ?tab=): tab của 契約申請管理 giữ trong bộ nhớ module (api.ts), tải lại thì về 新規契約. Việc code: giữ tab trong URL.
- No.3.3 プラン: Lựa chọn lấy từ giá trị các dòng / hằng số cố định trong code (constants.ts), không từ master. Việc code: lấy từ プランマスタ (plan/course).
- No.3.4 コース: Lựa chọn course là 2 giá trị cố định (ESライト／ESスタンダード) không khớp "ESライト（冷蔵庫）/（自販機）" trên danh sách nên không lọc được. Việc code: lấy theo プランマスタ.
- No.3.6 ES営業担当: ES営業担当: code dùng danh sách cố định 3 người (ES_STAFF / forms.ts), hoặc lấy từ các dòng. Việc code: lấy từ アカウント運営 (H19).
- No.3.8 並べ替え: Đã xong: sort mọi cột, tăng/giảm. Còn lại: mặc định tab 新規契約 là 申請ID tăng dần (tabFilter sort:"id"), 台帳 E quy định 申請日 giảm dần. Việc code: đổi mặc định.
- No.4 申請の一覧: Đã xong: phân trang thật 10/20/50. Còn lại: thứ tự mặc định tab 新規契約 (như No.3.8). Việc code: đổi mặc định.
- No.4.14 0件の表示: Code hiện câu 0 dòng khác I01 (「表示するデータがありません。」). Việc code: đổi câu 0 dòng theo I01.

**AW_APPL_002 契約申請管理（申請詳細）** — 9 mục
- No.2 タブ: P-TAB: tab của màn 申請詳細 (CH) giữ trong bộ nhớ. Việc code: giữ trên URL.
- No.6.7 承認の前にする設定: Ngoại lệ có chủ đích: các giá trị "承認の前にする設定" lưu ngay (không qua nút 保存). Cần hong xác nhận đây là ngoại lệ của P-FORM (台帳 F).
- No.8.9 承認する: E102 (đối chiếu giá trị trước thay đổi) mới chỉ có ghi chú (BeforeCheckNote), code chưa chặn khi giá trị khác (đã grep: không có xử lý nào ném E102). Việc code: cài đối chiếu và chặn duyệt.
- No.8.10 変更前の値の照合の注記: Như No.8.9: chỉ có ghi chú, chưa có xử lý chặn. Việc code: cài đối chiếu + E102.
- No.13 納品不可曜日・設備の希望日の入口: Seed lib/domain/seed/apply.ts: CH-20260922-0001 và CH-20260705-0001 là "配送の変更" khai báo 納品不可曜日. Quyết định H21: thuộc "拠点情報の変更". Việc: sửa seed sang kind 拠点情報の変更.
- No.6.7.28 棚卸報告（任意）: logic.ts INV_SKIP_ITEMS: ai duyệt được cũng chọn được "スキップ". 台帳: chỉ システム管理 (H15). Việc code: giới hạn quyền chọn スキップ.
- No.11.3 自社便だけの拠点の注記: H14: code chỉ có ghi chú ở màn duyệt (changeBlocks.tsx); chưa có I100 sau khi duyệt và dòng "配送停止（自社便）" ở Dashboard (top.ts không có). Việc code: thêm.
- No.15 見つからない: Code hiện câu "không tìm thấy" khác I10 (「{対象}が見つかりません。」). Việc code: đổi theo I10.
- No.8.12 承認・却下のトースト／エラー: Câu toast/banner/dialog trong code khác message chung trong _共通_メッセージ. Việc code: đồng nhất theo ID message.

**AW_APPL_003 契約申請管理（受付詳細）** — 12 mục
- No.4.6 紹介の有無・他社乗り換えの確認: H16: tab ① của 受付詳細 chưa có ô xác nhận 紹介の有無・他社乗り換え. Việc code: thêm theo 申込フォーム §10-2.
- No.10.2 この拠点を確定: Nhãn nút "この拠点を確定" / dialog dùng từ "正式登録" thay vì "本登録"; việc 確定 (tạo hợp đồng con・配送 trong dữ liệu chung) hiện chỉ đổi trạng thái màn hình (SetupPanel tách riêng). Việc code: đổi từ + nối vào dữ liệu chung (H16).
- No.12 法人の基本情報: ES営業担当: code dùng danh sách cố định 3 người (ES_STAFF / forms.ts), hoặc lấy từ các dòng. Việc code: lấy từ アカウント運営 (H19).
- No.12.1 請求書に載る住所: Chưa có nút 住所検索 ở màn này (CORP/BRAN đã có nút nhưng toast "まだつないでいません"). Việc code: thêm nút cạnh mã bưu chính (台帳 F 2026-10-07, H7).
- No.13 拠点の基本情報・住所: Chưa có nút 住所検索 ở màn này (CORP/BRAN đã có nút nhưng toast "まだつないでいません"). Việc code: thêm nút cạnh mã bưu chính (台帳 F 2026-10-07, H7).
- No.13.3 納品不可曜日: Code đặt 納品不可曜日 ở tab 子契約, không ở tab 拠点 như spec (契約_04・申込フォーム §10-3). Việc code: chuyển sang tab 拠点.
- No.1.8 保存: Màn 受付詳細: nội dung nhập chỉ giữ trong bộ nhớ trang, chưa lưu vào dữ liệu chung, chưa xử lý E31/E30 (H3). Việc code: nối lưu vào dữ liệu chung + E31/E30.
- No.18 確定の確認: Câu toast/banner/dialog trong code khác message chung trong _共通_メッセージ. Việc code: đồng nhất theo ID message.
- No.1.10 アカウント発行のトースト: Câu toast/banner/dialog trong code khác message chung trong _共通_メッセージ. Việc code: đồng nhất theo ID message.
- No.18.3 開始月の扱い（締切後）: Màn 受付詳細 chưa có lựa chọn 2 phương án sau hạn chót (W100) (chỉ có ở màn duyệt). Việc code: thêm.
- No.15.7 倉庫・配送回数を変えたときの警告: Code chưa cảnh báo khi đổi kho / số lần giao ở 受付詳細. Việc code: thêm cảnh báo theo 台帳/spec.
- No.24 見つからない: Code hiện câu "không tìm thấy" khác I10 (「{対象}が見つかりません。」). Việc code: đổi theo I10.

**AW_APPL_004 契約申請管理（新規登録（代理入力））** — 25 mục
- No.1.2 登録: H5 + quyền: kiểm tra chỉ bắt buộc/mã bưu chính; chưa có độ dài, kana, email, emoji; câu chữ viết thẳng. Và 代理入力 tính là "create" (CS không bấm được, Q1). Việc code: áp H5 + sửa quyền như No.1.3.
- No.2.3 入力者: 入力者 là giá trị cố định (にっしぐち（運営）). Việc code: dùng user đang đăng nhập.
- No.2.4 ES営業担当: ES営業担当: code dùng danh sách cố định 3 người (ES_STAFF / forms.ts), hoặc lấy từ các dòng. Việc code: lấy từ アカウント運営 (H19).
- No.3.2 法人名: Form 代理入力 chưa có giới hạn độ dài (H5). Việc code: thêm E04 (60).
- No.3.3 法人名フリガナ: Chưa kiểm tra katakana (H5). Việc code: kiểm tra.
- No.3.5 請求書に載る住所: Địa chỉ là 1 ô tùy chọn "郵便番号・住所", chưa có 住所検索 (H7・H17). Việc code: tách mã bưu chính・tỉnh・quận/huyện〜số nhà・tòa nhà, bắt buộc, thêm nút.
- No.3.6 電話番号: Điện thoại tùy chọn, chưa kiểm tra định dạng (H5・H17). Việc code: bắt buộc + kiểm tra.
- No.3.8 法人の支払い方法・支払サイクル・請求書の発行時期・FAX: Form 代理入力 trong code là bản đơn giản, thiếu mục so với 法人Web. Việc code: thêm đúng các mục như 法人Web (H17).
- No.4.3 メールアドレス: Chưa kiểm tra định dạng email (H5). Việc code: kiểm tra.
- No.4.4 担当者の電話番号: Điện thoại người phụ trách đang tùy chọn (H17). Việc code: bắt buộc như 法人Web.
- No.4.5 請求担当者・お申し込み者: Form 代理入力 trong code là bản đơn giản, thiếu mục so với 法人Web. Việc code: thêm đúng các mục như 法人Web (H17).
- No.5.2 契約区分: Form 代理入力 trong code là bản đơn giản, thiếu mục so với 法人Web. Việc code: thêm đúng các mục như 法人Web (H17).
- No.5.4 郵便番号: Chưa có nút 住所検索 ở màn này (CORP/BRAN đã có nút nhưng toast "まだつないでいません"). Việc code: thêm nút cạnh mã bưu chính (台帳 F 2026-10-07, H7).
- No.5.5 住所: Địa chỉ 1 ô; cần tách 都道府県(47)・市区町村〜番地・建物 như 法人Web (H17).
- No.5.6 プラン: Lựa chọn lấy từ giá trị các dòng / hằng số cố định trong code (constants.ts), không từ master. Việc code: lấy từ プランマスタ (plan/course).
- No.5.7 コース: Course chỉ 2 lựa chọn (thiếu ESライト（自販機）). Việc code: lấy từ プランマスタ.
- No.5.9 納品不可曜日: Ô 納品不可曜日 là 1 dòng tự do; cần checkbox 月〜日・祝日 như 法人Web (H17).
- No.5.12 設備の希望: Mục 設備の希望 chỉ có loại thiết bị; thiếu 機種・オプション・従業員数 (H17).
- No.5.14 拠点のご担当者: Người phụ trách cơ sở là 1 ô tự do; cần bảng (tên・furigana・mail・tel, メイン1・請求1) (H17).
- No.5.15 請求先: Chỉ có chọn nơi nhận hóa đơn, thiếu phương thức/chu kỳ thanh toán (H17).
- No.5.17 お試し期間（月数）・アカウントを発行するか: Form 代理入力 trong code là bản đơn giản, thiếu mục so với 法人Web. Việc code: thêm đúng các mục như 法人Web (H17).
- No.7 添付資料: Ô file là chữ "ファイルを選択（デモ）", không chọn file thật. Việc code: dùng component chọn file.
- No.3.7 法人: Danh sách pháp nhân / cơ sở / tháng chu kỳ là hằng cố định (constants.ts CORPS / BRS / CF_STARTS). Việc code: lấy từ dữ liệu chung (法人一覧 / 拠点 / chu kỳ hiện tại).
- No.8 入力エラー: Câu toast/banner/dialog trong code khác message chung trong _共通_メッセージ. Việc code: đồng nhất theo ID message.
- No.10 登録完了: Câu toast/banner/dialog trong code khác message chung trong _共通_メッセージ. Việc code: đồng nhất theo ID message.

**AW_APPL_005 契約申請管理（変更申請の代理入力）** — 9 mục
- No.2.3 入力者: 入力者 cố định. Việc code: dùng user đăng nhập.
- No.3.2 法人: Danh sách pháp nhân / cơ sở / tháng chu kỳ là hằng cố định (constants.ts CORPS / BRS / CF_STARTS). Việc code: lấy từ dữ liệu chung (法人一覧 / 拠点 / chu kỳ hiện tại).
- No.3.3 拠点: Danh sách pháp nhân / cơ sở / tháng chu kỳ là hằng cố định (constants.ts CORPS / BRS / CF_STARTS). Việc code: lấy từ dữ liệu chung (法人一覧 / 拠点 / chu kỳ hiện tại).
- No.3.4 開始（適用）するサイクル月: Danh sách pháp nhân / cơ sở / tháng chu kỳ là hằng cố định (constants.ts CORPS / BRS / CF_STARTS). Việc code: lấy từ dữ liệu chung (法人一覧 / 拠点 / chu kỳ hiện tại).
- No.3.9 内容: Form 代理入力 trong code là bản đơn giản, thiếu mục so với 法人Web. Việc code: thêm đúng các mục như 法人Web (H17).
- No.1.2 登録: WT + quyền: câu chữ viết thẳng; 代理入力 tính "create" (CS không bấm được, Q1); đơn trùng hiện câu của dữ liệu chung. Việc code: theo E01/E02/E104〜E108 + sửa quyền.
- No.3.11 種類ごとの入力項目（法人Web と同じ）: Form 変更申請 là 1 ô "内容" tự do, không theo loại đơn (H17). Việc code: nhập có cấu trúc như 法人Web (法人B).
- No.4 入力エラー: Câu toast/banner/dialog trong code khác message chung trong _共通_メッセージ. Việc code: đồng nhất theo ID message.
- No.6 登録完了のトースト: Câu toast/banner/dialog trong code khác message chung trong _共通_メッセージ. Việc code: đồng nhất theo ID message.

**AW_APPL_006 契約申請管理（新規申込のCSV取込）** — 9 mục
- No.3.1 説明文: Câu giải thích chung của CSV (CsvImportModal) nói "キーが一致する行は上書き…「-」" không đúng với 新規申込. Việc code: không hiện câu này ở màn CSV đơn mới.
- No.7.7 行のチェック: Code chưa kiểm tra theo chuẩn nhập liệu chung (độ dài tối đa / kana / email / emoji / 全角→半角; câu chữ viết thẳng không có ID). Việc code: áp chuẩn (E01/E02/E04/E05/E07/E13).
- No.1.2 登録: CsvImportModal đăng ký ngay không hiện xác nhận Q10; toast chung "CSV取込：新規 n件・更新 m件…". Việc code: Q10 + S10 cho CSV đơn mới.
- No.4.1 ファイル名・件数・結果のバッジ: Badge hiện cả "更新 0"/"変更なし 0" (không cần cho đơn mới). Việc code: chỉ hiện mới + lỗi.
- No.4.2 エラーの行の帯: Câu toast/banner/dialog trong code khác message chung trong _共通_メッセージ. Việc code: đồng nhất theo ID message.
- No.4.4 エラーの表: Lỗi hàng viết thẳng, thiếu kiểm tra định dạng mã bưu chính/furigana/điện thoại (H5). Việc code: theo E01/E02/E04/E05/E109.
- No.3.4 ファイル全体のエラー（①）: Câu toast/banner/dialog trong code khác message chung trong _共通_メッセージ. Việc code: đồng nhất theo ID message.
- No.4.7 ファイル全体のエラー（②）: Banner lỗi cả tệp chỉ có câu lý do, thiếu tiền tố E34. Việc code: thêm E34.
- No.5 登録完了（トースト）: Câu toast/banner/dialog trong code khác message chung trong _共通_メッセージ. Việc code: đồng nhất theo ID message.

**AW_DASH_001 ダッシュボード（ダッシュボード）** — 8 mục
- No.3.2 アラートの行: top.ts topAlerts: trả mọi dòng cho mọi vai trò (không lọc theo quyền; chỉ cần quyền dashboard). Ví dụ 営業 bấm "開く" ở dòng お問い合わせ bị 403. Việc code: lọc từng dòng theo quyền của màn đích.
- No.3.2.13 お問い合わせ（新着）: Dòng お問い合わせ có đuôi 「（HubSpot 送信）」 và hiện cho mọi vai trò. Việc code: bỏ đuôi + lọc quyền.
- No.3.2.10 廃棄率が3%を超えた: topAlerts không có dòng "廃棄率が3%を超えた" (台帳 H dùng; 受付簿 #122 ghi "対象なし"). Việc code: thêm dòng.
- No.3.2.11 配送停止（自社便）: Chưa có dòng "配送停止（自社便）" (H14). Việc code: thêm vào topAlerts.
- No.5.4 0件のとき: page.tsx 275/298: "条件に一致するデータがありません。…". Việc code: theo I01.
- No.6.5 0件のとき: Như 5.4 (I01).
- No.7 読み込めなかったとき: Alerts() chỉ có !data → "読み込み中…", không xử lý lỗi nên mãi "読み込み中…". Việc code: hiện E346 khi lỗi.
- No.8 参照のみの役割: Vai trò 閲覧のみ (Ad00013) vẫn thấy dòng お問い合わせ (topAlerts không lọc quyền). Còn "反映" không có để chụp vì seed lockedSkips cần quyền (Ad00013 không seed được). Việc code: lọc dòng theo quyền.

**AW_CORP_001 法人一覧（一覧）** — 3 mục
- No.1.4 CSV出力: Export thử: 28 cột (cột danh sách + mọi trường) nhưng không có bảng người phụ trách và 更新日時. Việc code: thêm vào CSV (台帳 M-1 mọi mục, H18).
- No.2.3 法人ステータス: Lựa chọn trạng thái pháp nhân chỉ có 仮登録／正式登録／休眠 (thiếu 取消, H6). Định nghĩa "休眠" vẫn chưa quyết (O3). Việc code: thêm 取消 (mặc định ẩn); chờ hong về 休眠.
- No.3 法人の一覧: Code hiện câu 0 dòng khác I01 (「表示するデータがありません。」). Việc code: đổi câu 0 dòng theo I01.

**AW_CORP_002 法人一覧（詳細）** — 8 mục
- No.7 ご注文のリマインドを送る: DetailScreen.tsx 468: checkbox "ご注文のリマインドを送る" lưu ngay ở màn chi tiết (setOrderReminder). Trái P-FORM (chi tiết chỉ xem, lưu bằng 保存) (H10). Việc code: chuyển sang màn sửa hoặc xác nhận ngoại lệ.
- No.8.1 タブ: Lý do cũ chỉ nói "4 tab giống spec" (không phải khác biệt). Đã viết lại: còn lệch P-TAB (tab không đổi URL khi chuyển).
- No.16 タブ「変更履歴」の表: Cột lịch sử trong code gộp "変更内容" 1 cột, chưa tách 項目・変更前・変更後・理由 (P-HIST, Q6=C). Việc code: tách cột.
- No.6 仮登録中の帯: Banner (provbar) khác I105 một chút (「…編集は 契約申請管理 ＞ 申請詳細 で行います…」). Việc code: theo I105.
- No.18 パスワード再設定の案内（確認）: WT (Q302: nội dung/nút "送る" khác).
- No.20 アカウントの停止（確認）: WT (Q104: nút "停止する" + câu thêm về "再開するまで…").
- No.12.6 アカウントの停止／再開: apiPerm.ts: contracts.corpAccount = [corps, update] nên CS cũng bấm 停止/再開 được. 台帳 F 2026-10-07 (Q3): chỉ フル権限・システム管理. Việc code: tách quyền riêng cho 停止・再開.
- No.17 見つからないとき: Code hiện câu "không tìm thấy" khác I10 (「{対象}が見つかりません。」). Việc code: đổi theo I10.

**AW_CORP_003 法人一覧（編集）** — 11 mục
- No.21.2 保存: Câu kiểm tra viết thẳng (không có ID); E04 và E31 đã làm, chưa có kana/email/emoji; giới hạn code khác 設計書 (xem ghi chú E04).
- No.23.1 法人名: Lý do cũ sai (nói không có kiểm tra độ dài). Thực tế: giới hạn 120 (varchar(120)) khác 設計書 60; emoji (E13) không bị chặn (đã lưu thử). Việc code: giới hạn 60 + chặn emoji.
- No.23.5 ES営業担当: ES営業担当: code dùng danh sách cố định 3 người (ES_STAFF / forms.ts), hoặc lấy từ các dòng. Việc code: lấy từ アカウント運営 (H19).
- No.24.2 住所検索: Nút có nhưng toast "まだつないでいません"; nguồn dữ liệu địa chỉ chưa quyết (hong: nút vẫn đặt). Chờ quyết định nguồn.
- No.24.4 市区町村: Lý do cũ sai. Thực tế: có kiểm tra nhưng giới hạn 60 (varchar(60)), 設計書 255 (đã lưu thử: 61 ký tự báo lỗi). Việc code: nới 255.
- No.27.1 区分: validate() (logic.ts) không kiểm tra メイン/請求担当者 ≥1 người (E116). Việc code: thêm E116.
- No.26.1 請求書発行リードタイム: Code chưa có cảnh báo W101 khi đổi リードタイム làm tháng trả trước bị trùng/thiếu (H20). Việc code: thêm cảnh báo; chưa chụp được.
- No.29 拠点の請求先を一括変更: Nút "拠点の請求先を一括変更" chỉ bấm được ở màn sửa; cách lưu khác nguyên tắc "保存 1 nút". Cần hong quyết vị trí đặt (確認メモ B).
- No.31 請求書発行リードタイム変更の警告: Code chưa có cảnh báo W101 khi đổi リードタイム làm tháng trả trước bị trùng/thiếu (H20). Việc code: thêm cảnh báo; chưa chụp được.
- No.29.5 結果（トースト）: WT (S104; code thêm 「（デモ）」 khi DEMO).
- No.32 保存完了: WT (S01: code là 「保存しました」 không có 。).

**AW_BRAN_001 拠点一覧（一覧）** — 3 mục
- No.1.4 CSV出力: Export thử: 44 cột (cột danh sách + mọi trường). Không có bảng người phụ trách, 更新日時, 継続年月. Việc code: thêm (H18).
- No.2.4 拠点ステータス: Lựa chọn 拠点ステータス thiếu 取消 (H6). Việc code: thêm 取消 (mặc định ẩn).
- No.3 拠点の一覧: Code hiện câu 0 dòng khác I01 (「表示するデータがありません。」). Việc code: đổi câu 0 dòng theo I01.

**AW_BRAN_002 拠点一覧（詳細）** — 6 mục
- No.9.1 拠点ステータス: forms.ts: lựa chọn 拠点ステータス có "休止中"; chọn thì lỗi. Quyết định: 休止中 chỉ hiển thị. Việc code: bỏ khỏi lựa chọn.
- No.15.3 貸出ステータスの絞り込み: forms.ts: vẫn có nút "回収済も表示" (toggle) thay vì dropdown lọc 貸出ステータス (H9). Việc code: đổi thành dropdown.
- No.15.4 回収済も表示（コードのボタン）: Nút "回収済も表示" vẫn còn trong forms.ts. Việc code: bỏ (H9).
- No.21 カード「履歴（拠点・親契約）」: Cột lịch sử trong code gộp "変更内容" 1 cột, chưa tách 項目・変更前・変更後・理由 (P-HIST, Q6=C). Việc code: tách cột.
- No.6 仮登録中の帯: Banner khác I105. Việc code: theo I105.
- No.22 見つからないとき: Code hiện câu "không tìm thấy" khác I10 (「{対象}が見つかりません。」). Việc code: đổi theo I10.

**AW_BRAN_003 拠点一覧（編集）** — 8 mục
- No.26.2 保存: Như CORP 21.2 (câu viết thẳng; E04・E31 xong; thiếu kana/email/emoji; giới hạn khác 設計書).
- No.28.6 拠点ステータス: Lựa chọn 拠点ステータス có "休止中" khi sửa (forms.ts), chọn thì lỗi. Việc code: bỏ (契約_04 No.6).
- No.29.2 住所検索: Như CORP 24.2 (nút có, nguồn dữ liệu chưa quyết).
- No.34.1 区分: Như CORP 27.1 (chưa có E116).
- No.32.2 請求書発行リードタイムの上書き: Code chưa có cảnh báo W101 khi đổi リードタイム làm tháng trả trước bị trùng/thiếu (H20). Việc code: thêm cảnh báo; chưa chụp được.
- No.33.4 搬入経路資料（委託配送業者向け・非公開）: Nhãn trong code 「搬入経路資料（委託配送会社向け・非公開）」 vs 契約_04 「委託配送業者向け」. Chờ hong thống nhất thuật ngữ (phiên gộp).
- No.40 請求書発行リードタイムの上書き変更の警告: Code chưa có cảnh báo W101 khi đổi リードタイム làm tháng trả trước bị trùng/thiếu (H20). Việc code: thêm cảnh báo; chưa chụp được.
- No.41 保存完了: WT (S01: 「保存しました」 không có 。).

**AW_CONT_001 子契約一覧（一覧）** — 2 mục
- No.1.3 価格世代を一括切替: apiPerm.ts: domain:bulk.start không có trong bảng → AREA bulk = contracts, tên "start" = update, nên CS bấm được. 台帳 F 2026-10-07 (Q2): chỉ フル権限・システム管理 (= quyền "create" của 子契約). Việc code: gán [contracts, create] cho bulk.start.
- No.3 子契約の一覧: Code hiện câu 0 dòng khác I01 (「表示するデータがありません。」). Việc code: đổi câu 0 dòng theo I01.

**AW_CONT_002 子契約一覧（詳細）** — 10 mục
- No.8 タブ・項目の検索: Lý do cũ chỉ nói "4 tab giống spec". Đã viết lại: còn lệch P-TAB.
- No.9.1 変更の適用範囲（保存時に確認）: Code có nút "変更の適用範囲（保存時に確認）" trong card 子契約 (bấm là lưu); spec không đặt (契約_05 契約 No.4). Việc code: bỏ nút.
- No.10.4 惣菜買取: Màn chưa có mục 惣菜買取 (契約_05 契約 No.8). Việc code: thêm.
- No.16 カード「支払情報」: Card "支払情報" chỉ có 支払方法・支払サイクル; thiếu 請求先・請求書発行リードタイム (契約_05). Việc code: thêm 2 mục.
- No.22 カード「履歴（子契約）」: Cột lịch sử trong code gộp "変更内容" 1 cột, chưa tách 項目・変更前・変更後・理由 (P-HIST, Q6=C). Việc code: tách cột.
- No.23 カード「前月からの差分」: Chưa có "変更のアラート" (dấu ở danh sách・chi tiết, 契約_05 履歴 No.2). Việc code: thêm.
- No.6 仮登録中の帯: Banner khác I105. Việc code: theo I105.
- No.12.1 自販機の拠点の配送区分: logic.ts VM_NOTE ghi 「（決定 28-19）」. Đề xuất bỏ số quyết định khỏi chú thích (chờ hong ở phiên gộp).
- No.24 確定・請求済の子契約: Code vẫn cho sửa・lưu 子契約 đã xuất hóa đơn (chỉ không sửa khi phạm vi "以降すべて"). Việc code: chặn lưu mục ảnh hưởng số tiền (E113, 契約_01 §1).
- No.25 見つからないとき: Code hiện câu "không tìm thấy" khác I10 (「{対象}が見つかりません。」). Việc code: đổi theo I10.

**AW_CONT_003 子契約一覧（編集）** — 5 mục
- No.26.2 保存: Như CORP 21.2 (E04・E31 xong; thiếu kana/emoji và E113; giới hạn khác 設計書).
- No.29.8 惣菜買取: Màn chưa có mục 惣菜買取 (契約_05 契約 No.8). Việc code: thêm.
- No.35 配送ルート設定（テーブル）: Lựa chọn (kho・hãng vận chuyển・中継) là master mẫu; cần thống nhất với 設計書 運営H (kho・委託配送先). Chờ 運営H.
- No.34 価格調整の金額: Câu lỗi viết thẳng "金額は10円単位の半角数字で入力してください" (không ID). Việc code: theo E14...
- No.39 保存完了（トースト）: WT (S01: câu code 「保存しました。…」 vị trí 。 khác).

**AW_CONT_004 子契約一覧（一括切替）** — 4 mục
- No.40 価格世代を一括切替（モーダル）: Modal tự làm bước ③ xác nhận (không dùng Q11) và toast kết quả là S107 (không S11/W10). Chờ hong xác nhận so với P-BULK.
- No.42.1 切り替える価格の世代: Danh sách thế hệ giá chưa có dấu "上書きあり" (契約_05 料金の上書き). Việc code: thêm.
- No.44.1 後ろの流れへの影響: Code hiện cả dòng "子契約（変えない：オーダー締切後…）" ở chế độ thế hệ giá (đó là mục của chế độ ルート; xác nhận thấy trong màn hình thật). Việc code: bỏ ở chế độ 価格世代.
- No.46 履歴タブ（これまでの一括変更）: Cột lịch sử của bulk là 1 dòng 1 lần, thiếu cột "操作した人" (P-HIST: 日時・操作した人・操作・項目・変更前・変更後・理由). Việc code: thêm cột.

**AW_MIGR_001 移行の要補完（）** — 1 mục
- No.4.16 0件の表示: Code hiện câu 0 dòng khác I01 (「表示するデータがありません。」). Việc code: đổi câu 0 dòng theo I01.

**AW_MIGR_003 移行の要補完（）** — 1 mục
- No.16.7 登録: CsvImportModal.commit đăng ký ngay không có modal xác nhận Q10 (P-CSV). Việc code: thêm xác nhận.

**AW_MIGR_004 移行の要補完（）** — 1 mục
- No.21.7 登録: CsvImportModal.commit đăng ký ngay không có modal xác nhận Q10 (P-CSV). Việc code: thêm xác nhận.

**AW_MIGR_005 移行の要補完（）** — 1 mục
- No.26.7 登録: CsvImportModal.commit đăng ký ngay không có modal xác nhận Q10 (P-CSV). Việc code: thêm xác nhận.

**AW_MIGR_006 移行の要補完（）** — 1 mục
- No.31.7 登録: CsvImportModal.commit đăng ký ngay không có modal xác nhận Q10 (P-CSV). Việc code: thêm xác nhận.

### Nhóm việc xuyên màn (gợi ý gom khi sửa code)

1. **Quyền (apiPerm.ts)**: 代理入力 = "update" (Q1), 停止・再開 chỉ フル権限・システム管理 (Q3), `bulk.start` chỉ フル権限・システム管理 (Q2), スキップ棚卸 chỉ システム管理 (H15), alert Dashboard lọc theo quyền.
2. **Message chung**: câu 0 dòng (I01), không tìm thấy (I10), toast S01/S100/S101/S102/S104/S106, banner I105, Q104/Q302, E34/E51/E111.
3. **Nhập liệu (H5)**: kana・email・emoji (E13)・全角→半角, giới hạn E04 cho khớp 設計書 (bảng dưới), E116 (người phụ trách ≥1), E102 (đối chiếu trước khi duyệt), E113 (tháng đã chốt).
4. **Form 代理入力 (H17) / 受付詳細**: thêm các mục như 法人Web; 住所検索 (H7); lấy plan/course/ES担当/法人/拠点/chu kỳ từ master thay vì hằng số.
5. **Lịch sử (P-HIST)** CORP/BRAN/CONT/bulk: tách cột 項目・変更前・変更後・理由 (+ 操作した人).
6. **P-TAB**: giữ tab trên URL (?tab=) ở 契約申請管理 (一覧・申請詳細) và 法人/拠点/子契約 (chi tiết・sửa).
7. **CSV出力 (H18)**: thêm bảng người phụ trách・更新日時・継続年月 vào CSV của 法人/拠点 (APPL đã đủ).
8. **Dashboard**: thêm dòng 廃棄率3% và 配送停止（自社便）; bỏ 「（HubSpot 送信）」; E346 khi lỗi.
9. **Seed**: sửa 2 đơn mẫu CH-20260922-0001・CH-20260705-0001 sang "拠点情報の変更" (H21).
10. **CSV取込**: xác nhận Q10 cho 新規申込 và 移行 (MIGR ×4); 新規申込 không hiện câu giải thích chung và badge 更新 0.

## Loại c — cần seed / dữ liệu mới mới chụp được

- **AW_APPL No.10.1 通算の判定**: Trạng thái vượt 通算12ヶ月 không tạo được từ seed (khi đăng ký đơn dữ liệu chung đã chặn). Cần seed: một 休止 đã duyệt khiến tổng vượt 12 tháng (chỉ tạo được bằng cách ghi thẳng dữ liệu). Giữ demo_ok.
- **AW_DASH No.3.3 アラートが0件のとき**: Cần seed: toàn bộ dòng cảnh báo bằng 0 (seed luôn có cảnh báo: 配送・資材・契約申請…). Không tạo được bằng API thông thường. Giữ demo_ok.
- **AW_DASH No.3.2.4 追加発注の入荷遅れ**: Cần seed: 追加発注 có ngày nhập kho không kịp chuyến (dmStock.alerts.altLate). Chưa seed được đơn giản. Giữ demo_ok.
- **AW_CONT No.44.2 注意の確認**: Đã kiểm tra bulk.ts: alerts chỉ phát sinh ở chế độ "ルート" (mở từ 倉庫マスタ...), không phải từ 子契約一覧 → đã viết lại demo_ok. Cần seed/đường vào: đổi hàng loạt kho (chế độ ルート).
- **AW_CONT No.44.4 件数の打ち直し**: Đã thử: tạo thêm hợp đồng con lên 144 vẫn không hiện, vì điều kiện là số "変える契約" (hợp đồng cha) > 100 (CONFIRM_OVER). Cần seed: ≥101 hợp đồng cha. Đã viết lại demo_ok.

## Giới hạn độ dài E04: code (varchar DB) so với 設計書

Quét tự động `lib/ops/contracts/forms.ts` (meta.type) so với `len` trong data. Các mục khác nhau (mục khác trùng khớp; textarea 500 khớp):

| Mục | 設計書 | code (E04) |
|---|---|---|
| 法人名・法人名（契約）・フリガナ・請求先法人名 | 60 | 120 |
| 拠点名・拠点名フリガナ | 60 | 120 |
| 市区町村（法人・拠点） | 255 | 60 |
| 町名・番地、建物等（法人・拠点） | 255 | 120 |
| 配送番号（子契約） | 60 | 40 |
| 設置フロア（子契約） | 60 | 100 |

Cách kiểm: gọi `contracts.save` với 法人名 61/121 ký tự (61 qua, 121 lỗi), 市区町村 61 ký tự (lỗi), 法人名 có emoji (qua) và furigana có kanji (qua). Việc cần làm: chốt con số đúng (設計書 hay DB) rồi thống nhất; thêm chặn emoji/kana.

## Ghi chú về công cụ

- `kd_capture.py` khi đổi tài khoản giữa các view (`login=`) chỉ xóa sessionStorage; code mới giữ đăng nhập trong localStorage/Cookie (`lib/api/keepLogin.ts`) nên view có `login=` bị timeout. Đã vá (commit 2d93f8a).
- Việc seed dữ liệu trong `setup` dùng API trực tiếp (fetch với header `x-es-site: ops`); dữ liệu được reset khi bắt đầu mỗi lần capture và khi đổi `today`.
