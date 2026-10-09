# 委託配送先Web（OW_*）demo_ok 棚卸し

作成日：2026-10-08。対象：`docs/05_画面設計書/データ/OW_*.py` の項目レベルの `demo_ok`（画面設計書が「コードが決定とまだ違う」「見本データで撮れない」と認めている箇所）。
照合したコード：`app/carrier/**`、`lib/carrier/**`、`components/csv/CsvImportModal.tsx`、`lib/csv/sites.ts`、`lib/domain/areas/account.ts`。決定：`docs/決定台帳.md` F（2026-10-07／08）・K・M。
コードの変更はしていない（この棚卸しは設計書のデータだけを直した）。

## 分類の意味

- **a**：コードが決定を満たした → `demo_ok` を外して撮り直す。
- **b**：コードが決定とまだ違う → `demo_ok` を残し、コードの動きと決定を正確に書いた。右端が「コードで直すこと」。
- **c**：見本データ（seed）で撮れない → `demo_ok` を残し、必要な seed を書いた。
- **d**：古い・あいまい・間違っていた理由 → 書き直した（b か c でもある。この棚卸しでデータを直したもの）。

## 結果の要約

| 分類 | 件数 |
|---|---|
| a：コードが満たした（demo_ok を外す） | 0 |
| b：コードが決定とまだ違う（残す） | 121 |
| c：seed で撮れない（残す） | 7 |
| d：理由を書き直した（残す） | 20 |
| **合計（項目レベルの demo_ok）** | **148**（棚卸し時 145＋役割レビュー反映で3件追加） |

- 棚卸し前：項目レベルの `demo_ok` は 145 件（AUTH 24・COLL 5・DELV 28・HOME 6・PROF 12・QUOT 22・SCHD 10・STAF 32・TRBL 6。ほかに画面レベルの note もあり）。棚卸し後も 145 件（a が 0 件のため外した件数は 0）。
- a が 0 件の理由：4つの変更（パスワード 8〜64・認証コード 4桁5分・「未適用」の印・再配達待）で完全に解消した `demo_ok` はなかった。部分的に解消したもの（パスワードの条件・「未適用」の印・認証コードの桁数と時間・配送一覧のページ送り・再送のカウントダウン）は d として理由を書き直した。
- 配送詳細の配送No「:」のバグ（decodeURIComponent）：解消済み。OW_DELV 016・023（`DL-260918-0003:2`）が「配送詳細」の画面として撮れている（撮影時に確認）。

## 確かめたこと（要点）

- **認証コード（OW_AUTH_002）**：パスワード再設定の画面（`app/carrier/password/page.tsx`）はサーバーにつながっていない。認証コードを確かめない・メールは固定表示（eskitchen@sample.com）・「再送信」はトーストだけ・コードが違うときのエラーなし・新しいパスワードは保存しない。サーバーの認証コード（`issueResetCode`）は、配送スタッフ詳細の「パスワード再設定」（代行）からだけ使われる（4桁・5分）。
- **ログイン（OW_AUTH_001）**：パスワードを確かめない。ログインID が見本の3アカウント（DE00001・DE00006・DE00007）にあるかだけ見て、サーバーの `account.signIn` で状態を確かめる。結果が「停止」でも画面は区別せず、同じ文言をトーストで出す（E401 は出ない）。
- **並べ替え・ページ送り・es-search**：es-search の部品はどの一覧にも使っていない（独自の `search-row`）。ページ送りが実際に動くのは配送管理（`usePager`・10／20／50）だけ。集金管理・配送スタッフ・見積依頼・トラブルは「n件中 1-n件」の表示だけ（ボタンは動かない）。列の並べ替えはどの一覧にもない。
- **CSV（OW_STAF_004）**：配送スタッフの最大文字数は 50（`lib/csv/sites.ts` carrierStaff。設計は 60）、「雇用形態」の列が残っている。取込の手順は ① ファイルを選ぶ → ② 確認・登録（画面）で、Q10 のダイアログはない。
- **共通メッセージ**：E520〜E527・I400・I401・I307・W300・W302 などを使っている箇所はない（どの画面も直書きの文言）。E523 は共通メッセージの文言が「パスワードは8〜64文字の半角で…」になったが、コードの文言は「・8〜64文字の半角で、英字と数字を含めてください」で言い回しが違う。
- **一括発行**：処理は「未発行」のアカウントだけ発行済にして、既存のアカウントは触らない（決定どおり）。ただしモーダルの文言は「パスワードはリセットされ」のまま、初期パスワードの生成とメール送信はない。

## 一覧（demo_ok 1件＝1行）

### OW_AUTH（24件：b 17・c 1・d 6）

| # | 状態・No. | 項目 | 分類 | コードの動きと決定（tiếng Việt） | コードで直すこと |
|---|---|---|---|---|---|
| 1 | OW_AUTH 状態001 No.1.3 | パスワード | d | Code chỉ nhận ID của 3 tài khoản mẫu (DE00001/6/7) và không kiểm tra mật khẩu; có gọi account.signIn ở server để kiểm tra trạng thái tài khoản. Quyết định (台帳 F 2026-10-07): bản thật dùng Cognito, mật khẩu 8〜64 ký tự. Lý do cũ ghi mơ hồ 「dev giả lập」; đã viết lại. | Kiểm tra mật khẩu khi đăng nhập (bản thật: Cognito) |
| 2 | OW_AUTH 状態002 No.2 | 入力エラー（未入力） | b | Câu viết trực tiếp trong code, hiện bằng toast. Thiết kế: E01 hiện inline dưới ô trống (viền đỏ). | Hiện E01 inline dưới ô; E520 trên form (không dùng toast) |
| 3 | OW_AUTH 状態003 No.3 | 認証失敗 | d | Câu viết trực tiếp trong code, hiện bằng toast. Thiết kế: E01 hiện inline dưới ô trống (viền đỏ). Câu giống E520 nhưng hiện bằng toast (E520 hiện trên form). | Hiện E01 inline dưới ô; E520 trên form (không dùng toast) |
| 4 | OW_AUTH 状態004 No.4 | 停止したアカウント | c | Seed không có tài khoản đối tác bị 利用停止 nên không chụp được. Code bỏ qua kết quả stopped của signIn, mọi lỗi đều hiện cùng một câu (không có E401). Quyết định (台帳 F 2026-10-07): giữ E401 khi bị dừng. Lý do cũ chưa nói code bỏ qua kết quả stopped; đã viết lại. | Hiện E401 khi signIn trả về stopped. Seed: thêm tài khoản carrier 利用停止 |
| 5 | OW_AUTH 状態005 No.5 | パスワード再設定 | b | Màn đặt lại chỉ là giao diện, chưa nối server: không kiểm tra mã xác thực, email hiện cố định eskitchen@sample.com, 「再送信」 chỉ hiện toast (không đếm ngược, bấm bất cứ lúc nào). Quyết định (台帳 F 2026-10-07/08): mã 4 chữ số・5 phút, không giới hạn số lần nhập・không khoảng cách gửi lại. | Nối server (issueResetCode + kiểm tra mã), hiện email đã nhập, E521/E522/E526, mật khẩu mới lưu thật |
| 6 | OW_AUTH 状態006 No.6 | ① 入力エラー | b | Câu viết trực tiếp, hiện bằng toast. Thiết kế: E01/E526 inline dưới ô; E07 sai định dạng email. | Hiện E01/E07/E526 inline dưới ô (kiểm tra ID + email với dữ liệu) |
| 7 | OW_AUTH 状態007 No.7 | ② 認証コード入力 | b | Màn đặt lại chỉ là giao diện, chưa nối server: không kiểm tra mã xác thực, email hiện cố định eskitchen@sample.com, 「再送信」 chỉ hiện toast (không đếm ngược, bấm bất cứ lúc nào). Quyết định (台帳 F 2026-10-07/08): mã 4 chữ số・5 phút, không giới hạn số lần nhập・không khoảng cách gửi lại. | Nối server (issueResetCode + kiểm tra mã), hiện email đã nhập, E521/E522/E526, mật khẩu mới lưu thật |
| 8 | OW_AUTH 状態007 No.7.1 | 送信先のメールアドレス | b | Màn đặt lại chỉ là giao diện, chưa nối server: không kiểm tra mã xác thực, email hiện cố định eskitchen@sample.com, 「再送信」 chỉ hiện toast (không đếm ngược, bấm bất cứ lúc nào). Quyết định (台帳 F 2026-10-07/08): mã 4 chữ số・5 phút, không giới hạn số lần nhập・không khoảng cách gửi lại. | Nối server (issueResetCode + kiểm tra mã), hiện email đã nhập, E521/E522/E526, mật khẩu mới lưu thật |
| 9 | OW_AUTH 状態007 No.7.3 | 再送信 | d | Màn đặt lại chỉ là giao diện, chưa nối server: không kiểm tra mã xác thực, email hiện cố định eskitchen@sample.com, 「再送信」 chỉ hiện toast (không đếm ngược, bấm bất cứ lúc nào). Quyết định (台帳 F 2026-10-07/08): mã 4 chữ số・5 phút, không giới hạn số lần nhập・không khoảng cách gửi lại. Đã bỏ "bấm được khi đang đếm" (không còn đếm ngược). | Nối server (issueResetCode + kiểm tra mã), hiện email đã nhập, E521/E522/E526, mật khẩu mới lưu thật |
| 10 | OW_AUTH 状態008 No.8 | ② コードエラー | b | Màn đặt lại chỉ là giao diện, chưa nối server: không kiểm tra mã xác thực, email hiện cố định eskitchen@sample.com, 「再送信」 chỉ hiện toast (không đếm ngược, bấm bất cứ lúc nào). Quyết định (台帳 F 2026-10-07/08): mã 4 chữ số・5 phút, không giới hạn số lần nhập・không khoảng cách gửi lại. | Nối server (issueResetCode + kiểm tra mã), hiện email đã nhập, E521/E522/E526, mật khẩu mới lưu thật |
| 11 | OW_AUTH 状態009 No.9.1 | 新しいパスワード | d | Điều kiện kiểm tra đã đúng quyết định (8〜64 ký tự・nửa góc・có chữ cái và chữ số). Chỉ khác câu lỗi: code hiện 「・8〜64文字の半角で、英字と数字を含めてください」, thiết kế là E523 「パスワードは8〜64文字の半角で、英字と数字を含めてください。」/E524. Điều kiện 8〜64 đã đúng; chỉ còn khác câu lỗi (lý do cũ ghi 8〜20). | Dùng thông điệp chung E523・E524 |
| 12 | OW_AUTH 状態010 No.10 | ③ パスワードエラー | d | Điều kiện kiểm tra đã đúng quyết định (8〜64 ký tự・nửa góc・có chữ cái và chữ số). Chỉ khác câu lỗi: code hiện 「・8〜64文字の半角で、英字と数字を含めてください」, thiết kế là E523 「パスワードは8〜64文字の半角で、英字と数字を含めてください。」/E524. Điều kiện 8〜64 đã đúng; chỉ còn khác câu lỗi (lý do cũ ghi 8〜20). | Dùng thông điệp chung E523・E524 |
| 13 | OW_AUTH 状態012 No.12.4 | 郵便番号 | b | Code chưa kiểm tra định dạng (zip: không check; 都道府県 là ô nhập chữ chứ không phải ô chọn). | Kiểm tra định dạng 郵便番号; đổi 都道府県 thành select; hiện E01/E07 inline |
| 14 | OW_AUTH 状態012 No.12.5 | 都道府県 | b | Code chưa kiểm tra định dạng (zip: không check; 都道府県 là ô nhập chữ chứ không phải ô chọn). | Kiểm tra định dạng 郵便番号; đổi 都道府県 thành select; hiện E01/E07 inline |
| 15 | OW_AUTH 状態012 No.12.9 | 電話番号 | b | Code bắt buộc nhập 電話番号. Đề xuất của Claude là để tùy chọn (台帳 chưa có quyết định, chờ hong). | Chờ hong quyết định (nếu tùy chọn: bỏ 必須) |
| 16 | OW_AUTH 状態012 No.14.1 | 次へ | b | Code vô hiệu nút 「次へ」/「登録」 cho đến khi đủ mục bắt buộc (và đồng ý), không hiện câu lỗi. Thiết kế: bấm được và hiện E01/E527 inline. | Cho bấm nút và hiện E01・E527 inline thay vì vô hiệu nút |
| 17 | OW_AUTH 状態013 No.15 | 入力エラー（必須・形式） | b | Code vô hiệu nút 「次へ」/「登録」 cho đến khi đủ mục bắt buộc (và đồng ý), không hiện câu lỗi. Thiết kế: bấm được và hiện E01/E527 inline. | Cho bấm nút và hiện E01・E527 inline thay vì vô hiệu nút |
| 18 | OW_AUTH 状態016 No.19.1 | 対応エリア（都道府県） | b | Code: 対応エリア là select 5 lựa chọn (東京・千葉・神奈川・大阪・北海道), 保有車両 chọn 1, không có 対応温度帯 và chọn nhóm vùng. Thiết kế (確認メモ H-42・H-43): chọn nhiều/nhóm vùng, có vùng nhiệt. | Đổi sang chọn nhiều + nhóm vùng, thêm 対応温度帯, 保有車両 chọn nhiều |
| 19 | OW_AUTH 状態016 No.19.2 | 対応温度帯 | b | Code: 対応エリア là select 5 lựa chọn (東京・千葉・神奈川・大阪・北海道), 保有車両 chọn 1, không có 対応温度帯 và chọn nhóm vùng. Thiết kế (確認メモ H-42・H-43): chọn nhiều/nhóm vùng, có vùng nhiệt. | Đổi sang chọn nhiều + nhóm vùng, thêm 対応温度帯, 保有車両 chọn nhiều |
| 20 | OW_AUTH 状態016 No.20.1 | 保有車両 | b | Code: 対応エリア là select 5 lựa chọn (東京・千葉・神奈川・大阪・北海道), 保有車両 chọn 1, không có 対応温度帯 và chọn nhóm vùng. Thiết kế (確認メモ H-42・H-43): chọn nhiều/nhóm vùng, có vùng nhiệt. | Đổi sang chọn nhiều + nhóm vùng, thêm 対応温度帯, 保有車両 chọn nhiều |
| 21 | OW_AUTH 状態016 No.22.1 | 登録 | b | Code vô hiệu nút 「次へ」/「登録」 cho đến khi đủ mục bắt buộc (và đồng ý), không hiện câu lỗi. Thiết kế: bấm được và hiện E01/E527 inline. | Cho bấm nút và hiện E01・E527 inline thay vì vô hiệu nút |
| 22 | OW_AUTH 状態017 No.23 | 入力エラー（必須・同意） | b | Code vô hiệu nút 「次へ」/「登録」 cho đến khi đủ mục bắt buộc (và đồng ý), không hiện câu lỗi. Thiết kế: bấm được và hiện E01/E527 inline. | Cho bấm nút và hiện E01・E527 inline thay vì vô hiệu nút |
| 23 | OW_AUTH 状態018 No.24 | 受付完了 | b | Code chỉ hiện toast 「お申し込みを受け付けました」 rồi quay về đăng nhập. Quyết định (台帳 F 2026-10-07): 公開フォーム → màn hình số tiếp nhận (CA-YYYYMMDD-NNNN) → mail tiếp nhận → 運営H duyệt. | Làm màn hình 受付番号 + mail tiếp nhận (Message List chưa có) |
| 24 | OW_AUTH 状態018 No.24.1 | 受付のトースト（コード） | d | Code chỉ hiện toast 「お申し込みを受け付けました」 rồi quay về đăng nhập. Quyết định (台帳 F 2026-10-07): 公開フォーム → màn hình số tiếp nhận (CA-YYYYMMDD-NNNN) → mail tiếp nhận → 運営H duyệt. Lý do cũ quá mơ hồ 「コードの表示」; đã viết lại. | Làm màn hình 受付番号 + mail tiếp nhận (Message List chưa có) |

### OW_COLL（5件：b 5）

| # | 状態・No. | 項目 | 分類 | コードの動きと決定（tiếng Việt） | コードで直すこと |
|---|---|---|---|---|---|
| 25 | OW_COLL 状態001 No.3 | 検索条件 | b | Code: bảng và tổng không xét khoảng thời gian tìm kiếm (chỉ áp dụng cho CSV). Quyết định (台帳 F 2026-10-07): bảng 集金管理 lọc được theo khoảng thời gian. | Lọc bảng và tổng theo khoảng thời gian |
| 26 | OW_COLL 状態001 No.4 | 合計 | b | Code: bảng và tổng không xét khoảng thời gian tìm kiếm (chỉ áp dụng cho CSV). Quyết định (台帳 F 2026-10-07): bảng 集金管理 lọc được theo khoảng thời gian. | Lọc bảng và tổng theo khoảng thời gian |
| 27 | OW_COLL 状態001 No.5 | 配送スタッフごとの一覧 | b | Code chỉ có chữ 「n件中 1-n件」 và nút giả, không có phân trang/sort cột/chọn số dòng. Quyết định (台帳 F, 一覧の標準): sort mọi cột, 10 dòng/trang (10/20/50). | Dùng usePager/Pagination + sort cột |
| 28 | OW_COLL 状態001 No.6 | ページ送り | b | Code chỉ có chữ 「n件中 1-n件」 và nút giả, không có phân trang/sort cột/chọn số dòng. Quyết định (台帳 F, 一覧の標準): sort mọi cột, 10 dòng/trang (10/20/50). | Dùng usePager/Pagination + sort cột |
| 29 | OW_COLL 状態002 No.7 | 絞り込み後の表示 | b | Code: bảng và tổng không xét khoảng thời gian tìm kiếm (chỉ áp dụng cho CSV). Quyết định (台帳 F 2026-10-07): bảng 集金管理 lọc được theo khoảng thời gian. | Lọc bảng và tổng theo khoảng thời gian |

### OW_DELV（28件：b 24・c 2・d 2）

| # | 状態・No. | 項目 | 分類 | コードの動きと決定（tiếng Việt） | コードで直すこと |
|---|---|---|---|---|---|
| 30 | OW_DELV 状態001 No.3 | 検索条件 | d | Code dùng hàng tìm kiếm riêng (search-row), không phải es-search. 「未適用」 đã bỏ. Đã bỏ phần 「未適用」 (code không còn hiện). | Đổi sang es-search |
| 31 | OW_DELV 状態001 No.4.1 | 配送スタッフ未設定のみ | b | Code cho phép gán và đếm cả chuyến trạng thái 「予定」, và hiện câu 「割当期間は納品日の7日前〜前日」. Đề xuất của Claude (Q-9): không gán cho 予定; chờ hong xác nhận. | Chờ hong quyết định Q-9; nếu chốt: loại 予定 khỏi gán, bỏ câu 7日前 |
| 32 | OW_DELV 状態001 No.5 | 配送の一覧 | d | Code đã phân trang 10/20/50 nhưng không sort cột, thứ tự theo dữ liệu (không xếp ngày giao tăng dần). Quyết định: sort mọi cột, mặc định ngày giao tăng dần (確認メモ H-4・Q-12). Code đã có phân trang 10/20/50; lý do cũ đã sửa. | Thêm sort cột + mặc định ngày giao tăng dần |
| 33 | OW_DELV 状態001 No.5.7 | 状態 | b | Code ghi cứng chữ 「rev2」 ở badge hàng thay thế. Thiết kế: số phiên bản thật. | Lấy số phiên bản thật của chỉ thị xuất hàng |
| 34 | OW_DELV 状態001 No.7 | 注記 | b | Code cho phép gán và đếm cả chuyến trạng thái 「予定」, và hiện câu 「割当期間は納品日の7日前〜前日」. Đề xuất của Claude (Q-9): không gán cho 予定; chờ hong xác nhận. | Chờ hong quyết định Q-9; nếu chốt: loại 予定 khỏi gán, bỏ câu 7日前 |
| 35 | OW_DELV 状態003 No.9 | 0件のとき | b | Câu viết trực tiếp trong code, chưa dùng thông điệp chung (I01 / S / W...). | Dùng thông điệp chung (I01, E-/S-ID tương ứng) |
| 36 | OW_DELV 状態005 No.11 | 選べない行 | c | Code cho phép gán và đếm cả chuyến trạng thái 「予定」, và hiện câu 「割当期間は納品日の7日前〜前日」. Đề xuất của Claude (Q-9): không gán cho 予定; chờ hong xác nhận. Seed: 栄成ロジ cần chuyến ở trạng thái 確認中/出荷済/受取済 mới chụp được dòng bị khóa khác. | Chờ hong quyết định Q-9; nếu chốt: loại 予定 khỏi gán, bỏ câu 7日前 |
| 37 | OW_DELV 状態006 No.12 | ドライバー未設定の警告帯 | b | Code chỉ cảnh báo chuyến giao ngày mai (trước 1 ngày) với câu riêng; không có cảnh báo 3 ngày trước (W300). Quyết định liên quan (台帳 F 2026-10-08): 「期限が来た」 từ 3 ngày trước. | Cảnh báo 3 ngày trước theo W300 |
| 38 | OW_DELV 状態007 No.13.1 | 割当の注意 | b | Code cho phép gán và đếm cả chuyến trạng thái 「予定」, và hiện câu 「割当期間は納品日の7日前〜前日」. Đề xuất của Claude (Q-9): không gán cho 予定; chờ hong xác nhận. | Chờ hong quyết định Q-9; nếu chốt: loại 予定 khỏi gán, bỏ câu 7日前 |
| 39 | OW_DELV 状態009 No.15 | 確定の入力チェック | b | Câu viết trực tiếp trong code, chưa dùng thông điệp chung (I01 / S / W...). | Dùng thông điệp chung (I01, E-/S-ID tương ứng) |
| 40 | OW_DELV 状態010 No.16 | 設定完了のトースト | b | Câu viết trực tiếp trong code, chưa dùng thông điệp chung (I01 / S / W...). | Dùng thông điệp chung (I01, E-/S-ID tương ứng) |
| 41 | OW_DELV 状態012 No.19.2 | 担当区間の説明 | b | Code cho phép gán và đếm cả chuyến trạng thái 「予定」, và hiện câu 「割当期間は納品日の7日前〜前日」. Đề xuất của Claude (Q-9): không gán cho 予定; chờ hong xác nhận. | Chờ hong quyết định Q-9; nếu chốt: loại 予定 khỏi gán, bỏ câu 7日前 |
| 42 | OW_DELV 状態012 No.19.5 | 確定 | b | Câu viết trực tiếp trong code, chưa dùng thông điệp chung (I01 / S / W...). | Dùng thông điệp chung (I01, E-/S-ID tương ứng) |
| 43 | OW_DELV 状態012 No.21.11 | 備考 | b | Code: ghi chú tối đa 100 ký tự và không lưu (chỉ state trong màn hình). Quyết định (台帳 F 2026-10-07): ghi chú ở chi tiết giao hàng lưu được; (500 ký tự là đề xuất). | Lưu ghi chú (API) + nới 500 ký tự |
| 44 | OW_DELV 状態018 No.28 | 路線便の送り状（追跡） | c | Code dùng giá trị mẫu cố định (mã bưu điện, địa chỉ, giờ nhận, SĐT, tên người phụ trách, 6 tệp). Quyết định (台帳 F 2026-10-07): hiện SĐT・người phụ trách・tồn lý thuyết của cơ sở. Seed: cần chuyến đi tuyến (区間 ヤマト) của DE00001 mới chụp được liên kết theo dõi (code đã hỗ trợ d.track). | Lấy dữ liệu thật của kho/trung chuyển/cơ sở; thêm 受取時間帯・納品条件 |
| 45 | OW_DELV 状態019 No.29 | 代替品のバッジ | b | Code ghi cứng chữ 「rev2」 ở badge hàng thay thế. Thiết kế: số phiên bản thật. | Lấy số phiên bản thật của chỉ thị xuất hàng |
| 46 | OW_DELV 状態019 No.29.1 | 荷物の中身の変更 | b | Code của chi tiết giao hàng không lấy thông tin hàng thay thế (alt luôn rỗng) nên khung 「荷物の中身の変更」 không hiện (badge 代替品 thì hiện). | Lấy AltInfo trong query delivery |
| 47 | OW_DELV 状態020 No.30 | 引取先 | b | Code dùng giá trị mẫu cố định (mã bưu điện, địa chỉ, giờ nhận, SĐT, tên người phụ trách, 6 tệp). Quyết định (台帳 F 2026-10-07): hiện SĐT・người phụ trách・tồn lý thuyết của cơ sở. | Lấy dữ liệu thật của kho/trung chuyển/cơ sở; thêm 受取時間帯・納品条件 |
| 48 | OW_DELV 状態020 No.31 | 届け先住所 | b | Code dùng giá trị mẫu cố định (mã bưu điện, địa chỉ, giờ nhận, SĐT, tên người phụ trách, 6 tệp). Quyết định (台帳 F 2026-10-07): hiện SĐT・người phụ trách・tồn lý thuyết của cơ sở. | Lấy dữ liệu thật của kho/trung chuyển/cơ sở; thêm 受取時間帯・納品条件 |
| 49 | OW_DELV 状態020 No.32 | 搬入経路・添付資料 | b | Code thêm tệp chỉ hiện toast tên tệp, không lưu, không kiểm tra định dạng/dung lượng; tải xuống chỉ toast; xóa chỉ toast. | Lưu/tải/xóa tệp thật + kiểm tra định dạng・dung lượng (chuẩn chung) |
| 50 | OW_DELV 状態020 No.32.1 | 非公開の搬入経路・添付資料 | b | Code thêm tệp chỉ hiện toast tên tệp, không lưu, không kiểm tra định dạng/dung lượng; tải xuống chỉ toast; xóa chỉ toast. | Lưu/tải/xóa tệp thật + kiểm tra định dạng・dung lượng (chuẩn chung) |
| 51 | OW_DELV 状態021 No.33 | 実績（納品前） | b | Câu viết trực tiếp trong code, chưa dùng thông điệp chung (I01 / S / W...). | Dùng thông điệp chung (I01, E-/S-ID tương ứng) |
| 52 | OW_DELV 状態022 No.34.2 | 廃棄数確認 | b | Code dùng giá trị mẫu cố định (mã bưu điện, địa chỉ, giờ nhận, SĐT, tên người phụ trách, 6 tệp). Quyết định (台帳 F 2026-10-07): hiện SĐT・người phụ trách・tồn lý thuyết của cơ sở. | Lấy dữ liệu thật của kho/trung chuyển/cơ sở; thêm 受取時間帯・納品条件 |
| 53 | OW_DELV 状態023 No.35 | トラブル報告 | b | Code luôn hiện 「場面」 là 「配達時」 và số ảnh luôn 0. Thiết kế: phân biệt nhận hàng/giao hàng, ảnh (tối thiểu 1, tối đa 20). | Lấy 場面 và ảnh thật từ báo cáo sự cố |
| 54 | OW_DELV 状態025 No.38 | 集金報告 | b | Code hiện 集金予定額 và 集金額 cùng một giá trị (thực tế nếu xong; dự kiến nếu chưa). | Tách 集金予定額 và 集金額 (thực tế) |
| 55 | OW_DELV 状態026 No.39.1 | ダウンロード | b | Code thêm tệp chỉ hiện toast tên tệp, không lưu, không kiểm tra định dạng/dung lượng; tải xuống chỉ toast; xóa chỉ toast. | Lưu/tải/xóa tệp thật + kiểm tra định dạng・dung lượng (chuẩn chung) |
| 56 | OW_DELV 状態027 No.40 | ファイルの削除確認 | b | Code thêm tệp chỉ hiện toast tên tệp, không lưu, không kiểm tra định dạng/dung lượng; tải xuống chỉ toast; xóa chỉ toast. | Lưu/tải/xóa tệp thật + kiểm tra định dạng・dung lượng (chuẩn chung) |
| 57 | OW_DELV 状態029 No.42 | 見つからないときの表示 | b | Câu viết trực tiếp trong code, chưa dùng thông điệp chung (I01 / S / W...). | Dùng thông điệp chung (I01, E-/S-ID tương ứng) |

### OW_HOME（6件：b 5・c 1）

| # | 状態・No. | 項目 | 分類 | コードの動きと決定（tiếng Việt） | コードで直すこと |
|---|---|---|---|---|---|
| 58 | OW_HOME 状態001 No.4 | お知らせ | b | Code hiện toàn bộ thông báo dành cho đối tác bất kể công ty (lọc theo site), không có cơ chế đã đọc và tag 「自動通知」. Quyết định (台帳 F 2026-10-07): lọc theo công ty nhận. | Lọc theo công ty nhận; đã đọc; tag 自動通知 |
| 59 | OW_HOME 状態001 No.4.2 | お知らせが0件のとき | c | Code hiện toàn bộ thông báo dành cho đối tác bất kể công ty (lọc theo site), không có cơ chế đã đọc và tag 「自動通知」. Quyết định (台帳 F 2026-10-07): lọc theo công ty nhận. Seed luôn có ≥ 1 thông báo cho đối tác; cần seed không có thông báo. | Lọc theo công ty nhận; đã đọc; tag 自動通知 |
| 60 | OW_HOME 状態003 No.8 | ドライバー未設定の警告 | b | Code Trang chủ không hiện cảnh báo chưa gán nhân viên (chỉ 配送管理 hiện phần ngày mai). | Thêm khung cảnh báo W300 (3 ngày trước) ở Trang chủ/スケジュール |
| 61 | OW_HOME 状態004 No.9 | 自動通知 | b | Code có lấy inbox thông báo nhưng không hiển thị; seed chưa có thông báo tự động để chụp. Cũng cần seed thông báo tự động (c). | Hiển thị inbox (tag 自動通知); seed: thông báo tự động |
| 62 | OW_HOME 状態005 No.11 | 添付ファイル | b | Code chỉ hiện tên tệp đính kèm, không có liên kết mở. | Thêm liên kết mở/tải tệp |
| 63 | OW_HOME 状態007 No.12 | 見つからないときの表示 | b | Code với ID không tồn tại hiện thông báo đầu tiên thay vì 「見つかりません」 (I400). | Hiện I400 khi không tìm thấy |

### OW_PROF（12件：b 12）

| # | 状態・No. | 項目 | 分類 | コードの動きと決定（tiếng Việt） | コードで直すこと |
|---|---|---|---|---|---|
| 64 | OW_PROF 状態001 No.2 | タブ | b | Tab không nằm trong URL (tải lại về 基本情報). | Đưa tab vào URL (?tab=) |
| 65 | OW_PROF 状態001 No.3.5 | 郵便番号 | b | Code không kiểm tra định dạng (郵便番号・電話) và không có kiểm tra bắt buộc khi lưu (để trống vẫn gửi được). | Kiểm tra bắt buộc + định dạng, hiện E inline |
| 66 | OW_PROF 状態001 No.3.10 | 電話番号 | b | Code không kiểm tra định dạng (郵便番号・電話) và không có kiểm tra bắt buộc khi lưu (để trống vẫn gửi được). | Kiểm tra bắt buộc + định dạng, hiện E inline |
| 67 | OW_PROF 状態001 No.4 | 担当者 | b | Bảng người phụ trách chỉ đọc kể cả khi đang sửa (確認メモ H-41). | Cho sửa người phụ trách |
| 68 | OW_PROF 状態002 No.5.1 | 対応エリア（都道府県） | b | Code: 対応エリア・保有車両 chỉ đọc (giá trị master của 運営); không có chọn nhóm vùng và 対応温度帯. Thiết kế: sửa được (H-40・H-42・H-43). | Cho sửa 対応エリア/車両, thêm nhóm vùng và 対応温度帯 |
| 69 | OW_PROF 状態002 No.5.2 | 地域グループの一括選択 | b | Code: 対応エリア・保有車両 chỉ đọc (giá trị master của 運営); không có chọn nhóm vùng và 対応温度帯. Thiết kế: sửa được (H-40・H-42・H-43). | Cho sửa 対応エリア/車両, thêm nhóm vùng và 対応温度帯 |
| 70 | OW_PROF 状態002 No.5.3 | 対応温度帯 | b | Code: 対応エリア・保有車両 chỉ đọc (giá trị master của 運営); không có chọn nhóm vùng và 対応温度帯. Thiết kế: sửa được (H-40・H-42・H-43). | Cho sửa 対応エリア/車両, thêm nhóm vùng và 対応温度帯 |
| 71 | OW_PROF 状態002 No.6.1 | 保有車両 | b | Code: 対応エリア・保有車両 chỉ đọc (giá trị master của 運営); không có chọn nhóm vùng và 対応温度帯. Thiết kế: sửa được (H-40・H-42・H-43). | Cho sửa 対応エリア/車両, thêm nhóm vùng và 対応温度帯 |
| 72 | OW_PROF 状態003 No.1.5 | 保存 | b | Code theo kiểu 「変更を申請」 và áp dụng sau khi 運営 duyệt (toast 「変更を申請しました…」, câu 「…承認してから反映されます。」). Quyết định (台帳 F 2026-10-07): không cần duyệt, lưu là áp dụng ngay và thông báo cho 運営 (I307). | Đổi sang 「保存」 áp dụng ngay + thông báo 運営H (I307, S tương ứng) |
| 73 | OW_PROF 状態003 No.8 | 運営への通知の案内 | b | Code theo kiểu 「変更を申請」 và áp dụng sau khi 運営 duyệt (toast 「変更を申請しました…」, câu 「…承認してから反映されます。」). Quyết định (台帳 F 2026-10-07): không cần duyệt, lưu là áp dụng ngay và thông báo cho 運営 (I307). | Đổi sang 「保存」 áp dụng ngay + thông báo 運営H (I307, S tương ứng) |
| 74 | OW_PROF 状態005 No.10 | 入力エラー | b | Code không kiểm tra định dạng (郵便番号・電話) và không có kiểm tra bắt buộc khi lưu (để trống vẫn gửi được). | Kiểm tra bắt buộc + định dạng, hiện E inline |
| 75 | OW_PROF 状態007 No.12 | 保存完了のトースト | b | Code theo kiểu 「変更を申請」 và áp dụng sau khi 運営 duyệt (toast 「変更を申請しました…」, câu 「…承認してから反映されます。」). Quyết định (台帳 F 2026-10-07): không cần duyệt, lưu là áp dụng ngay và thông báo cho 運営 (I307). | Đổi sang 「保存」 áp dụng ngay + thông báo 運営H (I307, S tương ứng) |

### OW_QUOT（22件：b 16・c 2・d 4）

| # | 状態・No. | 項目 | 分類 | コードの動きと決定（tiếng Việt） | コードで直すこと |
|---|---|---|---|---|---|
| 76 | OW_QUOT 状態001 No.2 | 検索条件 | b | Code dùng khung tìm kiếm riêng (không phải es-search), không sort cột và phân trang (chỉ chữ 「n件を表示」 và nút giả). Quyết định: sort mọi cột, 10 dòng/trang. | Dùng es-search + Pagination + sort cột |
| 77 | OW_QUOT 状態001 No.4 | 見積依頼の一覧 | b | Code dùng khung tìm kiếm riêng (không phải es-search), không sort cột và phân trang (chỉ chữ 「n件を表示」 và nút giả). Quyết định: sort mọi cột, 10 dòng/trang. | Dùng es-search + Pagination + sort cột |
| 78 | OW_QUOT 状態001 No.5 | ページ送り | b | Code dùng khung tìm kiếm riêng (không phải es-search), không sort cột và phân trang (chỉ chữ 「n件を表示」 và nút giả). Quyết định: sort mọi cột, 10 dòng/trang. | Dùng es-search + Pagination + sort cột |
| 79 | OW_QUOT 状態004 No.8 | 0件のとき | b | Câu viết trực tiếp, chưa dùng thông điệp chung (I01/I400/E410/E01...). | Dùng thông điệp chung tương ứng |
| 80 | OW_QUOT 状態005 No.9 | 回答期限の札 | c | Câu viết trực tiếp, chưa dùng thông điệp chung (I01/I400/E410/E01...). Nhãn 「本日期限」 chỉ hiện khi hôm nay là ngày hạn; seed cần yêu cầu hạn hôm nay (期限超過 không hiện vì trạng thái đã 期限切れ). | Dùng thông điệp chung tương ứng |
| 81 | OW_QUOT 状態006 No.12.2 | 見積金額（月額・税抜） | b | Code lưu tổng bảng chi phí như 「phí giao 1 chuyến」 (feeYen), không lưu bảng chi tiết. Quyết định (台帳 F 2026-10-07): phí là hàng tháng, lưu bảng chi tiết. | Lưu bảng chi tiết + phí tháng (domain carrier.answerQuote) |
| 82 | OW_QUOT 状態006 No.12.3 | 料金内訳 | b | Code lưu tổng bảng chi phí như 「phí giao 1 chuyến」 (feeYen), không lưu bảng chi tiết. Quyết định (台帳 F 2026-10-07): phí là hàng tháng, lưu bảng chi tiết. | Lưu bảng chi tiết + phí tháng (domain carrier.answerQuote) |
| 83 | OW_QUOT 状態006 No.12.5 | 見積の有効期限 | d | Form trả lời chưa có mục thời hạn hiệu lực báo giá. Quyết định (台帳 F 2026-10-07): bắt buộc. Lý do cũ ghi 「Claude 推奨・chờ hong」; nay đã có quyết định 台帳 F 2026-10-07. | Thêm 見積の有効期限 (bắt buộc) |
| 84 | OW_QUOT 状態009 No.16 | 見つからないときの表示 | b | Câu viết trực tiếp, chưa dùng thông điệp chung (I01/I400/E410/E01...). | Dùng thông điệp chung tương ứng |
| 85 | OW_QUOT 状態010 No.20.2 | 料金内訳（月額・税抜） | b | Code lưu tổng bảng chi phí như 「phí giao 1 chuyến」 (feeYen), không lưu bảng chi tiết. Quyết định (台帳 F 2026-10-07): phí là hàng tháng, lưu bảng chi tiết. | Lưu bảng chi tiết + phí tháng (domain carrier.answerQuote) |
| 86 | OW_QUOT 状態010 No.20.3 | 見積金額（月額・税抜） | b | Code lưu tổng bảng chi phí như 「phí giao 1 chuyến」 (feeYen), không lưu bảng chi tiết. Quyết định (台帳 F 2026-10-07): phí là hàng tháng, lưu bảng chi tiết. | Lưu bảng chi tiết + phí tháng (domain carrier.answerQuote) |
| 87 | OW_QUOT 状態010 No.20.4 | 見積書の添付 | b | Code: PDF/Excel・10MB・1 tệp, câu riêng 「PDFまたはExcel形式のファイルを選択してください。」 (không theo chuẩn chung). | Dùng chuẩn tệp chung + thông điệp chung |
| 88 | OW_QUOT 状態010 No.20.6 | 見積の有効期限 | d | Form trả lời chưa có mục thời hạn hiệu lực báo giá. Quyết định (台帳 F 2026-10-07): bắt buộc. Lý do cũ ghi 「Claude 推奨・chờ hong」; nay đã có quyết định 台帳 F 2026-10-07. | Thêm 見積の有効期限 (bắt buộc) |
| 89 | OW_QUOT 状態010 No.20.7 | 中継先 | d | Form trả lời chưa có ô điểm trung chuyển. Quyết định (台帳 F 2026-10-07): tùy chọn. Lý do cũ ghi chờ hong; nay 台帳 F 2026-10-07: tùy chọn. | Thêm 中継先 (tùy chọn) |
| 90 | OW_QUOT 状態010 No.20.8 | 補足コメント | b | Code cho phép 1000 ký tự cho ghi chú bổ sung; thiết kế là 500 (確認メモ H-7). | Đổi maxLength sang 500 |
| 91 | OW_QUOT 状態010 No.20.9 | 回答を送信 | b | Code gửi ngay không hiện xác nhận; toast 「回答を送信しました」 viết trực tiếp. Quyết định (台帳 F 2026-10-07): hiện modal xác nhận Q300 trước khi gửi. | Thêm modal Q300 + S-ID chung |
| 92 | OW_QUOT 状態011 No.21 | 入力エラーの表示 | b | Câu viết trực tiếp, chưa dùng thông điệp chung (I01/I400/E410/E01...). | Dùng thông điệp chung tương ứng |
| 93 | OW_QUOT 状態013 No.23 | NG回答の入力エラー | b | Câu viết trực tiếp, chưa dùng thông điệp chung (I01/I400/E410/E01...). | Dùng thông điệp chung tương ứng |
| 94 | OW_QUOT 状態014 No.24 | 回答の修正（回答済みの内容を再送） | b | Màn hình trả lời luôn mở trống, không điền nội dung đã trả lời (khi 回答を修正). | Điền sẵn nội dung đã trả lời khi sửa |
| 95 | OW_QUOT 状態015 No.25 | 回答できない（期限切れ・対応不可） | b | Câu viết trực tiếp, chưa dùng thông điệp chung (I01/I400/E410/E01...). | Dùng thông điệp chung tương ứng |
| 96 | OW_QUOT 状態017 No.27 | 送信の確認 | d | Code gửi ngay không hiện xác nhận; toast 「回答を送信しました」 viết trực tiếp. Quyết định (台帳 F 2026-10-07): hiện modal xác nhận Q300 trước khi gửi. Lý do cũ ghi chờ hong; nay có quyết định (Q300). Không chụp được vì code không có modal (c). | Thêm modal Q300 + S-ID chung |
| 97 | OW_QUOT 状態019 No.29 | 金額再確認への回答 | c | Câu viết trực tiếp, chưa dùng thông điệp chung (I01/I400/E410/E01...). Seed: yêu cầu báo giá loại 「金額再確認」 (運営D cần thao tác tạo). | Dùng thông điệp chung tương ứng |

### OW_SCHD（10件：b 9・d 1）

| # | 状態・No. | 項目 | 分類 | コードの動きと決定（tiếng Việt） | コードで直すこと |
|---|---|---|---|---|---|
| 98 | OW_SCHD 状態001 No.3 | 表示する月 | b | Ô tháng chỉ để hiển thị và các nút ‹ › 今日 không có tác dụng (code cố định tháng hiện tại). | Làm chuyển tháng (ô tháng, trước/sau, hôm nay) + toast ngoài phạm vi |
| 99 | OW_SCHD 状態001 No.3.1 | 前の月 | b | Ô tháng chỉ để hiển thị và các nút ‹ › 今日 không có tác dụng (code cố định tháng hiện tại). | Làm chuyển tháng (ô tháng, trước/sau, hôm nay) + toast ngoài phạm vi |
| 100 | OW_SCHD 状態001 No.3.2 | 次の月 | b | Ô tháng chỉ để hiển thị và các nút ‹ › 今日 không có tác dụng (code cố định tháng hiện tại). | Làm chuyển tháng (ô tháng, trước/sau, hôm nay) + toast ngoài phạm vi |
| 101 | OW_SCHD 状態001 No.3.3 | 今日 | b | Ô tháng chỉ để hiển thị và các nút ‹ › 今日 không có tác dụng (code cố định tháng hiện tại). | Làm chuyển tháng (ô tháng, trước/sau, hôm nay) + toast ngoài phạm vi |
| 102 | OW_SCHD 状態001 No.4 | 検索条件 | d | Code dùng hàng tìm kiếm riêng (không phải es-search), tìm xong hiện toast 「検索しました（n件）」 (thiết kế: không toast tìm kiếm). Đã bỏ phần 「未適用」. | Đổi sang es-search, bỏ toast |
| 103 | OW_SCHD 状態001 No.5.2 | 日付のマス | b | Bấm ô ngày chuyển sang 配送管理; không có thao tác chuyển sang xem tuần từ ô. | Thêm thao tác chuyển sang xem tuần (H-25) |
| 104 | OW_SCHD 状態001 No.8 | ドライバー未設定の警告枠 | b | Code Lịch không hiện khung cảnh báo chưa gán nhân viên (chỉ badge 「未 N件」 trên ô). | Thêm khung cảnh báo W300 |
| 105 | OW_SCHD 状態005 No.9 | 月の移動（範囲内） | b | Ô tháng chỉ để hiển thị và các nút ‹ › 今日 không có tác dụng (code cố định tháng hiện tại). | Làm chuyển tháng (ô tháng, trước/sau, hôm nay) + toast ngoài phạm vi |
| 106 | OW_SCHD 状態006 No.10 | 範囲の外（トースト） | b | Ô tháng chỉ để hiển thị và các nút ‹ › 今日 không có tác dụng (code cố định tháng hiện tại). | Làm chuyển tháng (ô tháng, trước/sau, hôm nay) + toast ngoài phạm vi |
| 107 | OW_SCHD 状態007 No.11 | 予定のマス | b | Code hiển thị chuyến 「予定」 giống chuyến đã chốt và không giới hạn phạm vi (H-26). Đề xuất: khung nét đứt và 「予定 N件」 (chờ hong Q-9). | Chờ hong Q-9; nếu chốt: khung nét đứt + 「予定 N件」 |

### OW_STAF（32件：b 26・d 6）

| # | 状態・No. | 項目 | 分類 | コードの動きと決定（tiếng Việt） | コードで直すこと |
|---|---|---|---|---|---|
| 108 | OW_STAF 状態001 No.2.1 | CSV出力 | b | Code còn ô/cột 「雇用形態」 và cột CSV (đề xuất Claude Q-18: bỏ;台帳 chưa có quyết định, chờ hong). | Chờ hong Q-18; nếu bỏ: xóa ô/cột/CSV 雇用形態 |
| 109 | OW_STAF 状態001 No.3 | 検索条件 | d | Code dùng hàng tìm kiếm riêng (không phải es-search). 「未適用」 đã bỏ. Đã bỏ phần 「未適用」. | Đổi sang es-search |
| 110 | OW_STAF 状態001 No.3.4 | 削除済み | b | Code luôn hiện cả nhân viên đã xóa và chưa có điều kiện 「削除済み」 (H-6). | Thêm điều kiện lọc 削除済み |
| 111 | OW_STAF 状態001 No.4 | 配送スタッフの一覧 | b | Code chỉ hiện 「n件中 1-n件」 và nút giả: không phân trang/sort cột. Quyết định: sort mọi cột, 10 dòng/trang. | Dùng Pagination + sort cột |
| 112 | OW_STAF 状態001 No.4.6 | 雇用形態 | b | Code còn ô/cột 「雇用形態」 và cột CSV (đề xuất Claude Q-18: bỏ;台帳 chưa có quyết định, chờ hong). | Chờ hong Q-18; nếu bỏ: xóa ô/cột/CSV 雇用形態 |
| 113 | OW_STAF 状態001 No.5 | ページ送り | b | Code chỉ hiện 「n件中 1-n件」 và nút giả: không phân trang/sort cột. Quyết định: sort mọi cột, 10 dòng/trang. | Dùng Pagination + sort cột |
| 114 | OW_STAF 状態003 No.7 | 0件のとき | b | Code khi 0 dòng không hiện dòng nào và không có câu (I01). | Hiện I01 khi 0 dòng |
| 115 | OW_STAF 状態005 No.9 | アカウント一括発行の確認 | d | Xem chi tiết trong cột lý do: câu trong modal còn nói sẽ reset mật khẩu (khác Q301); xử lý thực tế đã đúng (không đụng tài khoản đã có) nhưng chưa tạo mật khẩu ban đầu và chưa gửi email. Quyết định (台帳 F 2026-10-07): không gửi gì cho tài khoản đã có, không reset. Lý do cũ ghi code reset mật khẩu; thực tế code không đụng tài khoản đã có. Đã viết lại. | Sửa câu theo Q301; tạo mật khẩu ban đầu + gửi mail (メールは仮) |
| 116 | OW_STAF 状態007 No.11 | 発行の結果（一部エラー） | b | Câu/toast viết trực tiếp, chưa dùng thông điệp chung (S/E/W tương ứng). | Dùng thông điệp chung (E-, S-, W10, E412...) |
| 117 | OW_STAF 状態009 No.13 | 削除できません | b | Code chặn xóa cả khi còn 「túi giữ lạnh đang cho mượn」. Đề xuất Claude (Q-11): chỉ chặn theo chuyến đang phụ trách (chờ hong). | Chờ hong Q-11; nếu chốt: bỏ điều kiện túi giữ lạnh |
| 118 | OW_STAF 状態012 No.16.2 | パスワード再設定 | d | Code gửi mã 4 chữ số・5 phút (đúng quyết định) ngay khi bấm, không hỏi xác nhận; toast hiện mã dev 「開発中：メールは仮」. 台帳 chưa quyết định có xác nhận hay không. Đã sửa 10 phút/6 chữ số → 4 chữ số/5 phút (đúng quyết định). | Chờ hong về xác nhận; nối email thật (bản thật) |
| 119 | OW_STAF 状態012 No.17 | タブ | b | Tab là state màn hình, không nằm trong URL (chỉ đọc ?tab= lúc đầu). | Đưa tab vào URL |
| 120 | OW_STAF 状態012 No.18.2 | 配送スタッフ名 | b | Code không giới hạn số ký tự tên; câu khi trống viết trực tiếp. | Thêm giới hạn 60 ký tự + E01 chung |
| 121 | OW_STAF 状態012 No.18.4 | 所属先・区分 | b | Code còn ô/cột 「雇用形態」 và cột CSV (đề xuất Claude Q-18: bỏ;台帳 chưa có quyết định, chờ hong). | Chờ hong Q-18; nếu bỏ: xóa ô/cột/CSV 雇用形態 |
| 122 | OW_STAF 状態012 No.18.5 | 雇用形態 | b | Code còn ô/cột 「雇用形態」 và cột CSV (đề xuất Claude Q-18: bỏ;台帳 chưa có quyết định, chờ hong). | Chờ hong Q-18; nếu bỏ: xóa ô/cột/CSV 雇用形態 |
| 123 | OW_STAF 状態012 No.18.6 | ステータス | b | Code bắt buộc có ảnh bằng lái, không kiểm tra định dạng/dung lượng, cho chọn tay 「免許未登録」. Quyết định (台帳 F 2026-10-07): không có ảnh vẫn đăng ký được (tự động 「免許未登録」, không phát hành tài khoản). | Cho đăng ký không ảnh → tự 免許未登録; kiểm tra tệp |
| 124 | OW_STAF 状態012 No.18.8 | 免許証 | b | Code bắt buộc có ảnh bằng lái, không kiểm tra định dạng/dung lượng, cho chọn tay 「免許未登録」. Quyết định (台帳 F 2026-10-07): không có ảnh vẫn đăng ký được (tự động 「免許未登録」, không phát hành tài khoản). | Cho đăng ký không ảnh → tự 免許未登録; kiểm tra tệp |
| 125 | OW_STAF 状態013 No.20 | 編集の状態 | b | Câu/toast viết trực tiếp, chưa dùng thông điệp chung (S/E/W tương ứng). | Dùng thông điệp chung (E-, S-, W10, E412...) |
| 126 | OW_STAF 状態014 No.21 | 入力エラー | b | Câu/toast viết trực tiếp, chưa dùng thông điệp chung (S/E/W tương ứng). | Dùng thông điệp chung (E-, S-, W10, E412...) |
| 127 | OW_STAF 状態015 No.22.1 | 期間・状態の条件 | b | Tab 担当配送情報: ô thời gian/trạng thái chưa nối, bảng hiện toàn bộ, không phân trang/sort. | Nối bộ lọc + phân trang/sort |
| 128 | OW_STAF 状態015 No.22.3 | 担当配送の表 | b | Tab 担当配送情報: ô thời gian/trạng thái chưa nối, bảng hiện toàn bộ, không phân trang/sort. | Nối bộ lọc + phân trang/sort |
| 129 | OW_STAF 状態018 No.25 | パスワード再設定の確認 | d | Code gửi mã 4 chữ số・5 phút (đúng quyết định) ngay khi bấm, không hỏi xác nhận; toast hiện mã dev 「開発中：メールは仮」. 台帳 chưa quyết định có xác nhận hay không. Lý do cũ ghi 「Claude 推奨」; 台帳 chưa có quyết định → nêu rõ chưa quyết định. | Chờ hong về xác nhận; nối email thật (bản thật) |
| 130 | OW_STAF 状態019 No.26 | 再設定の送信結果 | d | Code gửi mã 4 chữ số・5 phút (đúng quyết định) ngay khi bấm, không hỏi xác nhận; toast hiện mã dev 「開発中：メールは仮」. 台帳 chưa quyết định có xác nhận hay không. Đã sửa 10 phút/6 chữ số → 4 chữ số/5 phút (đúng quyết định). | Chờ hong về xác nhận; nối email thật (bản thật) |
| 131 | OW_STAF 状態021 No.28 | 見つからないときの表示 | b | Câu/toast viết trực tiếp, chưa dùng thông điệp chung (S/E/W tương ứng). | Dùng thông điệp chung (E-, S-, W10, E412...) |
| 132 | OW_STAF 状態022 No.29.2 | 登録 | b | Code bắt buộc có ảnh bằng lái, không kiểm tra định dạng/dung lượng, cho chọn tay 「免許未登録」. Quyết định (台帳 F 2026-10-07): không có ảnh vẫn đăng ký được (tự động 「免許未登録」, không phát hành tài khoản). | Cho đăng ký không ảnh → tự 免許未登録; kiểm tra tệp |
| 133 | OW_STAF 状態023 No.30 | 登録の入力エラー | b | Code bắt buộc có ảnh bằng lái, không kiểm tra định dạng/dung lượng, cho chọn tay 「免許未登録」. Quyết định (台帳 F 2026-10-07): không có ảnh vẫn đăng ký được (tự động 「免許未登録」, không phát hành tài khoản). | Cho đăng ký không ảnh → tự 免許未登録; kiểm tra tệp |
| 134 | OW_STAF 状態025 No.34 | CSVの列の定義 | b | Code còn ô/cột 「雇用形態」 và cột CSV (đề xuất Claude Q-18: bỏ;台帳 chưa có quyết định, chờ hong). | Chờ hong Q-18; nếu bỏ: xóa ô/cột/CSV 雇用形態 |
| 135 | OW_STAF 状態025 No.34.2 | 配送スタッフ名 | b | CSV nhập nhân viên: còn cột 「雇用形態」 (Q-18 chờ hong), tối đa 50 ký tự (thiết kế 60: H-7); câu kết quả/lỗi là câu của thư viện CSV (chưa dùng S10・E51・E52); không có hộp thoại Q10. | Sửa max 60, câu chung S10/E51/E52, hộp thoại Q10; bỏ cột 雇用形態 nếu chốt |
| 136 | OW_STAF 状態025 No.34.3 | カナ | b | CSV nhập nhân viên: còn cột 「雇用形態」 (Q-18 chờ hong), tối đa 50 ký tự (thiết kế 60: H-7); câu kết quả/lỗi là câu của thư viện CSV (chưa dùng S10・E51・E52); không có hộp thoại Q10. | Sửa max 60, câu chung S10/E51/E52, hộp thoại Q10; bỏ cột 雇用形態 nếu chốt |
| 137 | OW_STAF 状態026 No.35 | 確認（件数） | d | CSV nhập nhân viên: còn cột 「雇用形態」 (Q-18 chờ hong), tối đa 50 ký tự (thiết kế 60: H-7); câu kết quả/lỗi là câu của thư viện CSV (chưa dùng S10・E51・E52); không có hộp thoại Q10. Code có bước ② xác nhận・đăng ký (màn hình), chỉ không có hộp thoại Q10; lý do cũ sai. Đã viết lại. | Sửa max 60, câu chung S10/E51/E52, hộp thoại Q10; bỏ cột 雇用形態 nếu chốt |
| 138 | OW_STAF 状態027 No.36 | 取込完了のトースト | b | CSV nhập nhân viên: còn cột 「雇用形態」 (Q-18 chờ hong), tối đa 50 ký tự (thiết kế 60: H-7); câu kết quả/lỗi là câu của thư viện CSV (chưa dùng S10・E51・E52); không có hộp thoại Q10. | Sửa max 60, câu chung S10/E51/E52, hộp thoại Q10; bỏ cột 雇用形態 nếu chốt |
| 139 | OW_STAF 状態028 No.37 | ファイル全体のエラー | b | CSV nhập nhân viên: còn cột 「雇用形態」 (Q-18 chờ hong), tối đa 50 ký tự (thiết kế 60: H-7); câu kết quả/lỗi là câu của thư viện CSV (chưa dùng S10・E51・E52); không có hộp thoại Q10. | Sửa max 60, câu chung S10/E51/E52, hộp thoại Q10; bỏ cột 雇用形態 nếu chốt |

### OW_TRBL（6件：b 4・c 1・d 1）

| # | 状態・No. | 項目 | 分類 | コードの動きと決定（tiếng Việt） | コードで直すこと |
|---|---|---|---|---|---|
| 140 | OW_TRBL 状態001 No.2 | 対応中の警告 | b | Câu cảnh báo trong code hơi khác W302. | Dùng thông điệp chung W302 |
| 141 | OW_TRBL 状態001 No.3 | 検索条件 | d | Code dùng hàng tìm kiếm riêng (không phải es-search). 「未適用」 đã bỏ. Đã bỏ phần 「未適用」. | Đổi sang es-search |
| 142 | OW_TRBL 状態001 No.4 | トラブルの一覧 | b | Code chỉ hiện 「n件中 1-n件」 và nút giả (xếp mặc định 受付日時 giảm dần), không sort cột/phân trang; 0 dòng dùng câu 「条件に一致するトラブルはありません。」 thay vì I01. | Dùng Pagination + sort cột + I01 |
| 143 | OW_TRBL 状態001 No.4.9 | 運営の対応・完了日時 | b | Danh sách không có cột 「運営の対応・完了日時」 (chỉ ở tab sự cố của chi tiết giao hàng). | Thêm cột vào danh sách (nếu giữ thiết kế) |
| 144 | OW_TRBL 状態001 No.5 | ページ送り | b | Code chỉ hiện 「n件中 1-n件」 và nút giả (xếp mặc định 受付日時 giảm dần), không sort cột/phân trang; 0 dòng dùng câu 「条件に一致するトラブルはありません。」 thay vì I01. | Dùng Pagination + sort cột + I01 |
| 145 | OW_TRBL 状態004 No.9 | 自動報告の行 | c | Code chỉ hiện 「n件中 1-n件」 và nút giả (xếp mặc định 受付日時 giảm dần), không sort cột/phân trang; 0 dòng dùng câu 「条件に一致するトラブルはありません。」 thay vì I01. Seed không có sự cố tự động (code cũng không ghi người báo cáo là 「自動」). Cần seed sự cố tự động. | Dùng Pagination + sort cột + I01 |

## コードで直すこと（画面ごと・バックログ）

### OW_AUTH ログイン

- Kiểm tra mật khẩu khi đăng nhập (bản thật: Cognito)
- Hiện E01 inline dưới ô; E520 trên form (không dùng toast)
- Hiện E401 khi signIn trả về stopped. Seed: thêm tài khoản carrier 利用停止

### OW_AUTH パスワード再設定

- Nối server (issueResetCode + kiểm tra mã), hiện email đã nhập, E521/E522/E526, mật khẩu mới lưu thật
- Hiện E01/E07/E526 inline dưới ô (kiểm tra ID + email với dữ liệu)
- Dùng thông điệp chung E523・E524

### OW_AUTH お申し込み

- Kiểm tra định dạng 郵便番号; đổi 都道府県 thành select; hiện E01/E07 inline
- Chờ hong quyết định (nếu tùy chọn: bỏ 必須)
- Cho bấm nút và hiện E01・E527 inline thay vì vô hiệu nút
- Đổi sang chọn nhiều + nhóm vùng, thêm 対応温度帯, 保有車両 chọn nhiều
- Làm màn hình 受付番号 + mail tiếp nhận (Message List chưa có)

### OW_COLL 集金管理

- Lọc bảng và tổng theo khoảng thời gian
- Dùng usePager/Pagination + sort cột

### OW_DELV 配送管理

- Đổi sang es-search
- Chờ hong quyết định Q-9; nếu chốt: loại 予定 khỏi gán, bỏ câu 7日前
- Thêm sort cột + mặc định ngày giao tăng dần
- Lấy số phiên bản thật của chỉ thị xuất hàng
- Dùng thông điệp chung (I01, E-/S-ID tương ứng)
- Cảnh báo 3 ngày trước theo W300
- Lưu ghi chú (API) + nới 500 ký tự
- Lấy dữ liệu thật của kho/trung chuyển/cơ sở; thêm 受取時間帯・納品条件
- Lấy AltInfo trong query delivery
- Lưu/tải/xóa tệp thật + kiểm tra định dạng・dung lượng (chuẩn chung)
- Lấy 場面 và ảnh thật từ báo cáo sự cố
- Tách 集金予定額 và 集金額 (thực tế)

### OW_HOME ホーム

- Lọc theo công ty nhận; đã đọc; tag 自動通知
- Thêm khung cảnh báo W300 (3 ngày trước) ở Trang chủ/スケジュール
- Hiển thị inbox (tag 自動通知); seed: thông báo tự động
- Thêm liên kết mở/tải tệp
- Hiện I400 khi không tìm thấy

### OW_PROF プロフィール

- Đưa tab vào URL (?tab=)
- Kiểm tra bắt buộc + định dạng, hiện E inline
- Cho sửa người phụ trách
- Cho sửa 対応エリア/車両, thêm nhóm vùng và 対応温度帯
- Đổi sang 「保存」 áp dụng ngay + thông báo 運営H (I307, S tương ứng)

### OW_QUOT 見積依頼

- Dùng es-search + Pagination + sort cột
- Dùng thông điệp chung tương ứng
- Lưu bảng chi tiết + phí tháng (domain carrier.answerQuote)
- Thêm 見積の有効期限 (bắt buộc)
- Dùng chuẩn tệp chung + thông điệp chung
- Thêm 中継先 (tùy chọn)
- Đổi maxLength sang 500
- Thêm modal Q300 + S-ID chung
- Điền sẵn nội dung đã trả lời khi sửa

### OW_SCHD スケジュール

- Làm chuyển tháng (ô tháng, trước/sau, hôm nay) + toast ngoài phạm vi
- Đổi sang es-search, bỏ toast
- Thêm thao tác chuyển sang xem tuần (H-25)
- Thêm khung cảnh báo W300
- Chờ hong Q-9; nếu chốt: khung nét đứt + 「予定 N件」

### OW_STAF 配送スタッフ

- Chờ hong Q-18; nếu bỏ: xóa ô/cột/CSV 雇用形態
- Đổi sang es-search
- Thêm điều kiện lọc 削除済み
- Dùng Pagination + sort cột
- Hiện I01 khi 0 dòng
- Sửa câu theo Q301; tạo mật khẩu ban đầu + gửi mail (メールは仮)
- Dùng thông điệp chung (E-, S-, W10, E412...)
- Chờ hong Q-11; nếu chốt: bỏ điều kiện túi giữ lạnh
- Chờ hong về xác nhận; nối email thật (bản thật)
- Đưa tab vào URL
- Thêm giới hạn 60 ký tự + E01 chung
- Cho đăng ký không ảnh → tự 免許未登録; kiểm tra tệp
- Nối bộ lọc + phân trang/sort
- Sửa max 60, câu chung S10/E51/E52, hộp thoại Q10; bỏ cột 雇用形態 nếu chốt

### OW_TRBL トラブル

- Dùng thông điệp chung W302
- Đổi sang es-search
- Dùng Pagination + sort cột + I01
- Thêm cột vào danh sách (nếu giữ thiết kế)

## 追記（2026-10-08 役割レビュー反映）

役割レビュー（`役割レビュー_委託配送先Web.md`）と台帳 F 2026-10-08 の決定を data に反映したときに増えた `demo_ok`（3件。すべて b）。上の表の件数はこの3件を足した値（b 121・合計 148）。

| 状態・No. | 内容 | コードで直すこと |
|---|---|---|
| OW_STAF 状態025 No.34.5 | CSV 取込がメールアドレスの重複を禁止している（`lib/csv/sites.ts` carrierStaff の `unique: true`）。台帳 F 2026-10-08：重複してよい | `unique` を外す |
| OW_DELV 状態026 No.39.3 | 6ファイルすべてに「削除」が出て、お客様の資料も消せる見た目。台帳 F 2026-10-08：自分が上げたファイルだけ消せる | 委託が上げたファイルだけ「削除」を出す |
| OW_DELV 状態001 No.5.1 | 「すべて選択」がページに関係なく全件の選べる行を選ぶ。設計はいまのページだけ（役割レビュー #14） | `selectable` を `pg.rows` に限る |

既存 `demo_ok` の書き直し：OW_STAF 状態012 No.18.6（無効・利用停止にするとき担当中の配送を確かめない。削除の E412 と同じ条件で止める設計・ステータス変更用の文言の追加が要る）、OW_DELV 状態001 No.5（画面幅 1440px で表が約2115px になり、届け先・住所などが見える範囲の外に出る：役割レビュー #10）。

役割レビューのうち台帳に決定がないもの（#5 の無効と利用停止の違い・#6・#7・#9・#11・#13）は data に反映せず要確認のまま。#1（認証コード）は hong が現状維持を確認済みなので変更なし。

## 設計書側で残っている作業（コードではない）

- 各データの `DECISIONS`／OPEN の「Claude 推奨・hong 確認待ち」のうち、台帳 F 2026-10-07 の「見積回答の項目と期限」（見積の有効期限・中継先は任意・Q300）で決まったものは、台帳と照らして消せる（`demo_ok` の理由だけ今回直した）。
- Claude 推奨のまま台帳に決定がないもの：Q-9（予定には割り当てない）・Q-11（削除できない条件は担当中の配送だけ）・Q-18（雇用形態を削除）・Q-14（申込の電話番号を任意）・配送スタッフのパスワード再設定の代行に確認を出すか。hong の回答待ち。
