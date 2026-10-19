# Test Cases — G8 Quản lý tài xế (E05 Công ty vận chuyển)
> Nguồn: Basic Design JSON grp_8_staff.json · Platform: Web desktop 1440×1024 · Ngôn ngữ UI: tiếng Nhật · [UNCONFIRMED] = TC dựa trên INFERENCE · Bản rút gọn BRIEF_TC2

## Test Data Reference

| Nhóm | Giá trị cụ thể |
| --- | --- |
| Tài khoản hợp lệ | OW000123 ／ Pass1234 |
| Tài khoản không có quyền | Tài khoản Company (không có Create／Edit／Delete) |
| Tài xế 有効 | DR000001, DR000003 |
| Tài xế 無効 | DR000004 |
| Tài xế 免許未登録 | DR000005 |
| Tài xế 利用停止 | DR000006 |
| Tên hợp lệ | テスト太郎 (カナ tự điền: テストタロウ) |
| Tên 50 ký tự | あ × 50 |
| Tên 51 ký tự | あ × 51 |
| Katakana hợp lệ | テストタロウ |
| Katakana 50 ký tự | ア × 50 |
| Katakana 51 ký tự | ア × 51 |
| Ký tự không phải katakana | やまだたろう |
| SĐT hợp lệ | 090-0000-0000 |
| SĐT sai định dạng | 090-ABCD |
| Email hợp lệ | user_a@example.com |
| Email sai định dạng | user_a_invalid |
| Email 256 ký tự | a × 244 + @example.com (256 tổng) |
| Email 257 ký tự | a × 245 + @example.com (257 tổng) |
| File ảnh bằng lái hợp lệ | license_ok.jpg (1MB, JPG) |
| File ảnh bằng lái 4.9MB | license_49mb.jpg (4.9MB) |
| File ảnh bằng lái 5.1MB | license_51mb.jpg (5.1MB) |
| File sai định dạng | license.pdf |
| Chuỗi XSS | &lt;script&gt;alert(1)&lt;/script&gt; |
| Chuỗi SQLi | ' OR 1=1-- |

## OW_STAF_001 — 配送スタッフ一覧

| ID | Function Name | Category | Risk Level | Traceability ID | Test Scenario | Precondition | Steps | Expected Results | Test Data | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DRL-001 | 配送スタッフ一覧 レイアウト | UI | Medium | BD:OW_STAF_001/H.1, BD:OW_STAF_001/H.2, BD:OW_STAF_001/S.1, BD:OW_STAF_001/S.2, BD:OW_STAF_001/S.3, BD:OW_STAF_001/S.4, BD:OW_STAF_001/S.5, BD:OW_STAF_001/S.6, BD:OW_STAF_001/S.7, BD:OW_STAF_001/T.1, BD:OW_STAF_001/T.3, BD:OW_STAF_001/T.6, BD:OW_STAF_001/T.7, BD:OW_STAF_001/T.8, BD:OW_STAF_001/T.9, BD:OW_STAF_001/P.1, BD:OW_STAF_001/P.2, BD:OW_STAF_001/P.3 | [UI Visual] Check layout tổng thể OW_STAF_001 (header, search area, table, pagination) | Đã đăng nhập OW000123, có quyền Create／Edit／Delete | 1. Mở OW_STAF_001 qua sidebar 配送スタッフ<br>2. Quan sát toàn bộ layout | Header có nút アカウント一括発行 (H.1, disable) và ＋新規登録 (H.2).<br>Khu vực tìm kiếm có: ô S.1 text, dropdown S.2 (全て mặc định), dropdown S.3 (全て mặc định), nút クリア S.4, nút 検索 S.5, toggle S.6.<br>Nút S.7 (並び替え) hiển thị.<br>Bảng gồm cột No (T.1), ID (T.3), 区分 (T.6), 電話番号 (T.7), ステータス badge (T.8), アカウント状態 (T.9).<br>Cuối trang: số lượng P.1 (dạng N件中X-Y件), phân trang P.2, dropdown P.3. | OW000123 ／ Pass1234 | Low |
| DRL-002 | 配送スタッフ一覧 テーブル操作列 | UI | Medium | BD:OW_STAF_001/T.2, BD:OW_STAF_001/T.4, BD:OW_STAF_001/T.10.1, BD:OW_STAF_001/T.10.2, BD:OW_STAF_001/+1 | [UI Visual] Check các cột ảnh, link tên, icon thao tác và checkbox trên bảng | Đã đăng nhập OW000123, có quyền Edit／Delete, OW_STAF_001 đã tải | 1. Quan sát cột 免許 (T.2), cột tên (T.4), cột icon (T.10.1, T.10.2), checkbox (+1) trên mỗi dòng và header | Cột T.2 hiển thị thumbnail ảnh bằng lái (hoặc ảnh mặc định).<br>Cột T.4 tên hiển thị dạng link xanh.<br>Icon 🖊 (T.10.1) và 🗑 (T.10.2) hiện trên mỗi dòng.<br>Checkbox (+1) có ở header (chọn tất cả) và từng dòng. | OW000123 ／ Pass1234, danh sách tài xế có dữ liệu | Low |
| DRL-003 | アカウント一括発行 ボタン活性制御 | Logic | High | BD:OW_STAF_001/H.1, BD:OW_STAF_001/+1 | Check nút アカウント一括発行 chỉ active khi chọn ít nhất 1 dòng | Đã đăng nhập, OW_STAF_001 mở, danh sách có ít nhất 2 tài xế | 1. Quan sát nút H.1 khi không có dòng nào được chọn<br>2. Chọn 1 checkbox dòng bất kỳ<br>3. Quan sát lại nút H.1<br>4. Bỏ chọn tất cả<br>5. Quan sát lại nút H.1 | Bước 1: H.1 disable, không nhấn được.<br>Bước 3: H.1 enable, nhấn được.<br>Bước 5: H.1 trở lại disable. | DR000001, DR000003 | High |
| DRL-004 | ＋新規登録 権限表示 | Logic | High | BD:OW_STAF_001/H.2 | Check nút ＋新規登録 chỉ hiển thị với người dùng có quyền Create | 1) Tài khoản có quyền Create; 2) Tài khoản không có quyền | 1. Đăng nhập OW000123 (có quyền Create), mở OW_STAF_001, quan sát header<br>2. Đăng xuất, đăng nhập tài khoản không có quyền Create, mở OW_STAF_001, quan sát header | Lần 1: nút ＋新規登録 hiển thị trên header.<br>Lần 2: nút ＋新規登録 bị ẩn, không hiện. | OW000123; tài khoản không có quyền Create | High |
| DRL-005 | 検索エリア 折りたたみ・展開 | Behavior | Medium | BD:OW_STAF_001/S.6 | Check nút S.6 toggle ẩn／hiện khu vực tìm kiếm | Đã đăng nhập, OW_STAF_001 mở, khu vực tìm kiếm đang mở rộng (∧ hiển thị) | 1. Click nút ∧ (S.6)<br>2. Quan sát khu vực tìm kiếm<br>3. Click nút ∨<br>4. Quan sát lại | Bước 2: khu vực S.1〜S.5 ẩn, nút thành ∨.<br>Bước 4: khu vực S.1〜S.5 hiện lại, nút thành ∧. | — | Medium |
| DRL-006 | テキスト検索 AND部分一致 | Logic | High | BD:OW_STAF_001/S.1 | Check S.1 tìm kiếm AND khớp một phần theo tên và đơn vị | Đã đăng nhập, khu vực tìm kiếm mở rộng | 1. Nhập "テスト" vào S.1<br>2. Click S.5 検索<br>3. Quan sát kết quả | Bảng chỉ hiển thị tài xế có tên hoặc đơn vị chứa "テスト". | テスト (chuỗi tìm kiếm) | High |
| DRL-007 | テキスト検索 Enterキー | Behavior | Medium | BD:OW_STAF_001/S.1 | Check nhấn Enter trong S.1 cũng thực hiện tìm kiếm | Đã đăng nhập, khu vực tìm kiếm mở, S.1 đang focus | 1. Nhập "テスト" vào S.1<br>2. Nhấn phím Enter | Bảng lọc kết quả tương tự khi click nút 検索. | テスト | Medium |
| DRL-008 | スタッフ区分 ドロップダウン | Logic | Medium | BD:OW_STAF_001/S.2 | Check S.2 lọc danh sách theo loại nhân viên | Đã đăng nhập, khu vực tìm kiếm mở | 1. Chọn "個人" từ S.2<br>2. Click S.5 検索<br>3. Quan sát kết quả<br>4. Chọn "会社所属", click 検索 | Bước 2: bảng chỉ hiện tài xế loại 個人.<br>Bước 4: bảng chỉ hiện tài xế loại 会社所属. | — | Medium |
| DRL-009 | ステータス ドロップダウン | Logic | Medium | BD:OW_STAF_001/S.3 | Check S.3 lọc danh sách theo trạng thái tài xế | Đã đăng nhập, khu vực tìm kiếm mở | 1. Chọn "有効" từ S.3<br>2. Click S.5 検索<br>3. Quan sát kết quả | Bảng chỉ hiển thị tài xế có trạng thái 有効. Dropdown S.3 có đủ 6 giá trị: 全て／有効／免許未登録／利用停止／無効／削除済み. | — | Medium |
| DRL-010 | クリア ボタン | Behavior | Medium | BD:OW_STAF_001/S.4 | Check S.4 クリア đặt lại tất cả điều kiện tìm kiếm | Đã đăng nhập, S.1 có text, S.2 chọn 個人, S.3 chọn 有効 | 1. Click nút クリア (S.4) | S.1 trống, S.2 về 全て, S.3 về 全て. | — | Medium |
| DRL-011 | 検索 結果表示・件数更新 | Logic | High | BD:OW_STAF_001/S.5, BD:OW_STAF_001/P.1 | Check S.5 検索 lọc kết quả và cập nhật P.1 | Đã đăng nhập, OW_STAF_001 mở | 1. Chọn S.3=有効, click 検索<br>2. Quan sát bảng và P.1 | Bảng chỉ hiển thị tài xế 有効. P.1 cập nhật đúng số lượng (dạng N件中X-Y件). | — | High |
| DRL-012 | 検索 セッション切れ | State | Critical | BD:OW_STAF_001/S.5, E_STAF001_S_001 | [UNCONFIRMED] Check S.5 検索 khi phiên hết hạn hiển thị thông báo session | Phiên đăng nhập đã hết hạn (token expired) | 1. Để phiên hết hạn<br>2. Click nút 検索 | Màn hình chuyển sang trang đăng nhập hoặc hiển thị 「セッションの有効期限が切れました。再度ログインしてください。」 (E_STAF001_S_001). | — | High |
| DRL-013 | 検索 ネットワークエラー | State | High | BD:OW_STAF_001/S.5, E_STAF001_E_001 | [UNCONFIRMED] Check S.5 検索 khi mất mạng hiển thị thông báo lỗi mạng | Đã đăng nhập, mạng bị ngắt | 1. Ngắt mạng<br>2. Click nút 検索 | Banner lỗi hiển thị 「データの取得に失敗しました。再度お試しください。」 (E_STAF001_E_001). Ở lại màn. | — | High |
| DRL-014 | 検索 システムエラー | State | High | BD:OW_STAF_001/S.5, E_STAF001_S_002 | [UNCONFIRMED] Check S.5 検索 khi API 500 hiển thị thông báo lỗi hệ thống | Đã đăng nhập, API mock trả 500 | 1. Cấu hình API trả 500<br>2. Click nút 検索 | Banner lỗi hiển thị 「システムエラーが発生しました。管理者にお問い合わせください。」 (E_STAF001_S_002). Ở lại màn. | — | High |
| DRL-015 | スタッフ名リンク 遷移 | Navigation | High | BD:OW_STAF_001/T.4 | Check link tên tài xế (T.4) chuyển sang OW_STAF_003 | Đã đăng nhập, OW_STAF_001 có ít nhất 1 dòng | 1. Click tên tài xế DR000001 | Chuyển sang OW_STAF_003 hiển thị thông tin của DR000001, tab 基本情報 mặc định. | DR000001 | High |
| DRL-016 | ステータス バッジ表示 | Logic | High | BD:OW_STAF_001/T.8 | Check T.8 hiển thị badge màu đúng cho từng trạng thái | Đã đăng nhập, OW_STAF_001 có tài xế đủ các trạng thái | 1. Tìm kiếm 全て trạng thái, quan sát cột T.8 | 有効=badge xanh (青); 利用停止=badge đỏ; 無効=badge xám; 免許未登録=badge vàng. | DR000001 (有効), DR000004 (無効), DR000005 (免許未登録), DR000006 (利用停止) | High |
| DRL-017 | アカウント状態 表示 | Logic | Medium | BD:OW_STAF_001/T.9 | Check T.9 hiển thị đúng tình trạng phát hành tài khoản | Đã đăng nhập, OW_STAF_001 có tài xế 未発行 và 発行済み | 1. Quan sát cột アカウント状態 (T.9) cho từng tài xế | T.9 hiển thị 未発行 hoặc 発行済み tương ứng với từng tài xế. | — | Medium |
| DRL-018 | 編集アイコン 権限表示 | Logic | High | BD:OW_STAF_001/T.10.1 | Check icon 🖊 ẩn khi tài khoản không có quyền Edit | 1) OW000123 (có Edit); 2) Tài khoản không có quyền | 1. Đăng nhập OW000123, quan sát cột icon<br>2. Đăng nhập tài khoản không có Edit, quan sát | Lần 1: icon 🖊 hiển thị.<br>Lần 2: icon 🖊 ẩn. | OW000123; tài khoản không có quyền Edit | High |
| DRL-019 | 編集アイコン クリック遷移 | Navigation | High | BD:OW_STAF_001/T.10.1 | Check icon 🖊 chuyển sang OW_STAF_004 chế độ chỉnh sửa | Đã đăng nhập OW000123 có quyền Edit, OW_STAF_001 mở | 1. Click icon 🖊 trên dòng DR000001 | Chuyển sang OW_STAF_004 ở chế độ chỉnh sửa, hiển thị thông tin DR000001. | DR000001 | High |
| DRL-020 | 削除アイコン 権限表示 | Logic | High | BD:OW_STAF_001/T.10.2 | Check icon 🗑 ẩn khi tài khoản không có quyền Delete | 1) OW000123 (có Delete); 2) Tài khoản không có quyền | 1. Đăng nhập OW000123, quan sát cột icon<br>2. Đăng nhập tài khoản không có Delete, quan sát | Lần 1: icon 🗑 hiển thị.<br>Lần 2: icon 🗑 ẩn. | OW000123; tài khoản không có quyền Delete | High |
| DRL-021 | 削除アイコン 確認モーダル | Behavior | High | BD:OW_STAF_001/T.10.2 | Check icon 🗑 mở modal xác nhận xóa | Đã đăng nhập OW000123 có quyền Delete | 1. Click icon 🗑 trên dòng tài xế bất kỳ | Modal xác nhận xóa hiển thị. | DR000003 | High |
| DRL-022 | ページネーション 境界操作 | Logic | Medium | BD:OW_STAF_001/P.2, BD:OW_STAF_001/P.3 | Check P.2 phân trang và P.3 件数/ページ hoạt động đúng | Đã đăng nhập, tổng ≥11 tài xế | 1. Quan sát trang 1: nút Prev disabled<br>2. Click Next, quan sát trang 2<br>3. Thay đổi P.3 件数/ページ | Bước 1: Prev button disabled.<br>Bước 2: Trang 2 hiển thị; Prev enable; nếu trang cuối thì Next disabled.<br>Bước 3: Số dòng mỗi trang thay đổi theo lựa chọn. | Ít nhất 11 tài xế | Medium |
| DRL-023 | 並び替え デフォルト順 | Logic | Medium | BD:OW_STAF_001/S.7 | Check S.7 mặc định sắp xếp theo 配送スタッフID | Đã đăng nhập, OW_STAF_001 mở lần đầu | 1. Tải OW_STAF_001, quan sát thứ tự cột ID | Bảng sắp xếp theo 配送スタッフID tăng dần theo mặc định. | — | Medium |
| DRL-024 | アカウント一括発行 モーダル起動 | Behavior | High | BD:OW_STAF_001/H.1 | Check H.1 mở modal OW_STAF_005 khi chọn ≥1 dòng | Đã đăng nhập, chọn ít nhất 1 checkbox | 1. Chọn checkbox DR000001<br>2. Click H.1 アカウント一括発行 | OW_STAF_005 modal mở trên OW_STAF_001. | DR000001 | High |
| DRL-025 | チェックボックス 選択状態維持 | Logic | High | BD:OW_STAF_001/+1 | Check checkbox giữ nguyên trạng thái sau khi đóng OW_STAF_005 bằng キャンセル | Đã đăng nhập, OW_STAF_005 đang hiển thị (mở từ OW_STAF_001) | 1. Quan sát các checkbox đã chọn trước khi mở OW_STAF_005<br>2. Click キャンセル trong OW_STAF_005<br>3. Quan sát OW_STAF_001 | Sau bước 3: các checkbox vẫn ở trạng thái đã chọn, không bị xóa. | DR000001, DR000003 | High |
| DRL-026 | 免許サムネイル デフォルト表示 | Logic | Medium | BD:OW_STAF_001/T.2 | Check T.2 hiển thị ảnh mặc định khi tài xế chưa đăng ký bằng lái | Đã đăng nhập, có tài xế chưa tải ảnh bằng lái | 1. Tìm tài xế 免許未登録 trên danh sách<br>2. Quan sát cột T.2 | Cột T.2 hiển thị ảnh mặc định (placeholder) thay vì ảnh bằng lái. | DR000005 | Medium |

## OW_STAF_003 — 配送スタッフ詳細

| ID | Function Name | Category | Risk Level | Traceability ID | Test Scenario | Precondition | Steps | Expected Results | Test Data | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DRD-001 | 配送スタッフ詳細 基本情報タブ レイアウト | UI | Medium | BD:OW_STAF_003/H.1, BD:OW_STAF_003/H.2, BD:OW_STAF_003/H.3, BD:OW_STAF_003/A.1, BD:OW_STAF_003/A.2, BD:OW_STAF_003/A.3, BD:OW_STAF_003/A.4, BD:OW_STAF_003/A.5, BD:OW_STAF_003/A.6, BD:OW_STAF_003/A.7, BD:OW_STAF_003/A.8, BD:OW_STAF_003/A.9, BD:OW_STAF_003/A.10, BD:OW_STAF_003/+1 | [UI Visual] Check layout tab 基本情報 của OW_STAF_003 | Đã đăng nhập OW000123, đang ở OW_STAF_003 tab 基本情報 | 1. Mở OW_STAF_003 của DR000001<br>2. Quan sát header, tab bar, form | Header có nút 削除 (H.1), パスワード送信 (H.2), 編集 (H.3).<br>Tab bar (+1): 基本情報／担当配送情報／変更履歴; tab 基本情報 active mặc định.<br>Form hiển thị: ID (A.1, readonly), 氏名 (A.2), カナ (A.3), 区分 (A.4), ステータス (A.5), 電話番号 (A.6), 免許証 (A.7), ログインID (A.8, readonly), メール (A.9), 最終ログイン (A.10, readonly). | DR000001 | Low |
| DRD-002 | 配送スタッフ詳細 担当配送情報タブ レイアウト | UI | Medium | BD:OW_STAF_003/B.1.1, BD:OW_STAF_003/B.1.2, BD:OW_STAF_003/B.1.3, BD:OW_STAF_003/B.1.4, BD:OW_STAF_003/B.1.5, BD:OW_STAF_003/B.1.6, BD:OW_STAF_003/B.2.1, BD:OW_STAF_003/B.2.2, BD:OW_STAF_003/B.2.3, BD:OW_STAF_003/B.2.4, BD:OW_STAF_003/B.2.5, BD:OW_STAF_003/B.2.6, BD:OW_STAF_003/B.2.7, BD:OW_STAF_003/B.2.8, BD:OW_STAF_003/B.2.9, BD:OW_STAF_003/B.2.10, BD:OW_STAF_003/B.2.11, BD:OW_STAF_003/P.1, BD:OW_STAF_003/P.2, BD:OW_STAF_003/P.3 | [UI Visual] Check layout tab 担当配送情報 | Đã đăng nhập, OW_STAF_003 mở | 1. Click tab 担当配送情報<br>2. Quan sát khu vực tìm kiếm và bảng | Khu vực tìm kiếm: date range (B.1.1, mặc định đầu〜cuối tháng hiện tại), dropdown 配送状況 (B.1.2), nút クリア (B.1.3), nút 検索 (B.1.4).<br>Tổng hợp: 集金合計金額 (B.1.5) và 駐車合計料金 (B.1.6).<br>Bảng gồm cột B.2.1〜B.2.11.<br>Phân trang P.1, P.2, P.3. | DR000001 | Low |
| DRD-003 | 配送スタッフ詳細 変更履歴タブ レイアウト | UI | Medium | BD:OW_STAF_003/C, BD:OW_STAF_003/C.1, BD:OW_STAF_003/C.2, BD:OW_STAF_003/C.3 | [UI Visual] Check layout tab 変更履歴 | Đã đăng nhập, OW_STAF_003 mở, đã có lịch sử | 1. Click tab 変更履歴<br>2. Quan sát bảng | Bảng 3 cột: 変更日時 (C.1, YYYY/MM/DD HH:mm), 変更内容 (C.2), 変更者 (C.3). Hiển thị mới nhất trước. | DR000001 | Low |
| DRD-004 | A.2 配送スタッフ名 必須チェック | Validate | Critical | BD:OW_STAF_003/A.2, E_STAF003_001 | Check A.2 配送スタッフ名 trống khi lưu hiển thị lỗi E_STAF003_001 | Đã đăng nhập, OW_STAF_003 ở chế độ sửa (sau khi click H.3 編集) | 1. Xóa hết nội dung trường A.2<br>2. Click lưu | Lỗi inline tại A.2: 「配送スタッフ名を入力してください。」 (E_STAF003_001). Form không lưu. | — | Critical |
| DRD-005 | A.2 配送スタッフ名 最大文字数 | Validate | High | BD:OW_STAF_003/A.2, E_STAF003_002 | Check A.2 50 ký tự hợp lệ; 51 ký tự hiển thị lỗi E_STAF003_002 | Đã đăng nhập, OW_STAF_003 ở chế độ sửa, tài xế test đã có ảnh bằng lái được upload | 1. Nhập 50 ký tự あ vào A.2, click lưu<br>2. Nhập 51 ký tự あ vào A.2, click lưu | Bước 1: Không lỗi, form có thể lưu.<br>Bước 2: Lỗi inline 「50文字以内で入力してください。」 (E_STAF003_002). | あ × 50; あ × 51 | High |
| DRD-006 | A.3 カナ 自動入力 | Logic | High | BD:OW_STAF_003/A.3 | Check A.3 カナ tự động điền khi A.2 mất focus | Đã đăng nhập, OW_STAF_003 ở chế độ sửa | 1. Nhập "やまだたろう" vào A.2<br>2. Click ra ngoài (mất focus A.2)<br>3. Quan sát A.3 | A.3 tự điền katakana tương ứng (VD: ヤマダタロウ). | やまだたろう | High |
| DRD-007 | A.3 カナ 必須チェック | Validate | Critical | BD:OW_STAF_003/A.3, E_STAF003_003 | Check A.3 カナ trống hiển thị lỗi E_STAF003_003 | Đã đăng nhập, OW_STAF_003 ở chế độ sửa | 1. Xóa hết nội dung A.3<br>2. Click lưu | Lỗi inline 「カナを入力してください。」 (E_STAF003_003). | — | Critical |
| DRD-008 | A.3 カナ 全角カナ形式 | Validate | High | BD:OW_STAF_003/A.3, E_STAF003_004 | Check A.3 nhập ký tự không phải katakana toàn chiều rộng hiển thị lỗi E_STAF003_004 | Đã đăng nhập, OW_STAF_003 ở chế độ sửa | 1. Nhập "やまだたろう" vào A.3<br>2. Click lưu | Lỗi inline 「全角カナで入力してください。」 (E_STAF003_004). | やまだたろう | High |
| DRD-009 | A.3 カナ 最大文字数 | Validate | High | BD:OW_STAF_003/A.3, E_STAF003_005 | Check A.3 50 katakana hợp lệ; 51 ký tự lỗi E_STAF003_005 | Đã đăng nhập, OW_STAF_003 ở chế độ sửa | 1. Nhập ア × 50 vào A.3, click lưu<br>2. Nhập ア × 51 vào A.3, click lưu | Bước 1: Không lỗi.<br>Bước 2: Lỗi inline 「50文字以内で入力してください。」 (E_STAF003_005). | ア × 50; ア × 51 | High |
| DRD-010 | A.4 区分 必須チェック | Validate | Critical | BD:OW_STAF_003/A.4, E_STAF003_006 | Check A.4 区分 chưa chọn hiển thị lỗi E_STAF003_006 | Đã đăng nhập, OW_STAF_003 ở chế độ sửa, A.4 bị xóa lựa chọn | 1. Bỏ chọn A.4 (về trạng thái unselected)<br>2. Click lưu | Lỗi inline 「区分を選択してください。」 (E_STAF003_006). | — | Critical |
| DRD-011 | A.5 ステータス 必須チェック | Validate | Critical | BD:OW_STAF_003/A.5, E_STAF003_007 | Check A.5 ステータス chưa chọn hiển thị lỗi E_STAF003_007 | Đã đăng nhập, OW_STAF_003 ở chế độ sửa, A.5 bị xóa lựa chọn | 1. Bỏ chọn A.5<br>2. Click lưu | Lỗi inline 「ステータスを選択してください。」 (E_STAF003_007). | — | Critical |
| DRD-012 | A.6 電話番号 形式チェック | Validate | High | BD:OW_STAF_003/A.6, E_STAF003_008 | Check A.6 điện thoại sai định dạng hiển thị lỗi E_STAF003_008 | Đã đăng nhập, OW_STAF_003 ở chế độ sửa | 1. Nhập "090-ABCD" vào A.6<br>2. Click lưu | Lỗi inline 「電話番号の形式が正しくありません（半角数字・ハイフン、10〜11桁）」 (E_STAF003_008). | 090-ABCD | High |
| DRD-013 | A.6 電話番号 有効入力 | Validate | Medium | BD:OW_STAF_003/A.6 | Check A.6 SĐT hợp lệ được chấp nhận | Đã đăng nhập, OW_STAF_003 ở chế độ sửa | 1. Nhập "090-0000-0000" vào A.6<br>2. Click lưu | Không có lỗi tại A.6. | 090-0000-0000 | Medium |
| DRD-014 | A.7 免許証 必須チェック | Validate | Critical | BD:OW_STAF_003/A.7, E_STAF003_009 | Check A.7 chưa tải ảnh bằng lái hiển thị lỗi E_STAF003_009 | Đã đăng nhập, OW_STAF_003 ở chế độ sửa, chưa có ảnh bằng lái | 1. Không tải file nào vào A.7<br>2. Click lưu | Lỗi inline 「免許証画像をアップロードしてください。」 (E_STAF003_009). | — | Critical |
| DRD-015 | A.7 免許証 形式チェック | Validate | High | BD:OW_STAF_003/A.7, E_STAF003_010 | Check A.7 tải file không phải JPG／JPEG／PNG hiển thị lỗi E_STAF003_010 | Đã đăng nhập, OW_STAF_003 ở chế độ sửa | 1. Tải license.pdf vào A.7 | Lỗi inline 「JPG、JPEG、PNGのいずれかの形式で画像ファイルをアップロードしてください。」 (E_STAF003_010). | license.pdf | High |
| DRD-016 | A.7 免許証 サイズチェック | Validate | High | BD:OW_STAF_003/A.7, E_STAF003_011 | Check A.7 tải file 5.1MB hiển thị lỗi E_STAF003_011; 4.9MB hợp lệ | Đã đăng nhập, OW_STAF_003 ở chế độ sửa | 1. Tải license_51mb.jpg (5.1MB)<br>2. Tải license_49mb.jpg (4.9MB) | Bước 1: Lỗi inline 「アップロード画像ファイルの上限サイズは5MBです。」 (E_STAF003_011).<br>Bước 2: Không lỗi, ảnh tải thành công. | license_51mb.jpg; license_49mb.jpg | High |
| DRD-017 | A.7 免許証 有効アップロード | Validate | Medium | BD:OW_STAF_003/A.7 | Check A.7 file JPG hợp lệ ≤5MB được chấp nhận | Đã đăng nhập, OW_STAF_003 ở chế độ sửa | 1. Tải license_ok.jpg (1MB, JPG) vào A.7 | Ảnh hiển thị preview, không có lỗi. | license_ok.jpg | Medium |
| DRD-018 | A.9 メール 必須チェック | Validate | Critical | BD:OW_STAF_003/A.9, E_STAF003_012 | Check A.9 email trống hiển thị lỗi E_STAF003_012 | Đã đăng nhập, OW_STAF_003 ở chế độ sửa | 1. Xóa A.9<br>2. Click lưu | Lỗi inline 「メールアドレスを入力してください。」 (E_STAF003_012). | — | Critical |
| DRD-019 | A.9 メール 形式チェック | Validate | High | BD:OW_STAF_003/A.9, E_STAF003_013 | Check A.9 email sai định dạng hiển thị lỗi E_STAF003_013 | Đã đăng nhập, OW_STAF_003 ở chế độ sửa | 1. Nhập "user_a_invalid" vào A.9<br>2. Click lưu | Lỗi inline 「メールアドレスの形式が正しくありません。」 (E_STAF003_013). | user_a_invalid | High |
| DRD-020 | A.9 メール 最大文字数 (biên 256) | Validate | High | BD:OW_STAF_003/A.9, E_STAF003_014 | Check A.9 email 256 ký tự hiển thị lỗi E_STAF003_014 | Đã đăng nhập, OW_STAF_003 ở chế độ sửa | 1. Nhập email 256 ký tự vào A.9<br>2. Click lưu | Lỗi inline 「メールアドレスは255文字以内で入力してください。」(E_STAF003_014). | Email 256 ký tự | High |
| DRD-021 | A.9 メール 255文字有効 | Validate | Medium | BD:OW_STAF_003/A.9 | Check A.9 email đúng 255 ký tự được chấp nhận | Đã đăng nhập, OW_STAF_003 ở chế độ sửa | 1. Nhập email 255 ký tự vào A.9<br>2. Click lưu | Không có lỗi tại A.9. | Email 255 ký tự | Medium |
| DRD-022 | A.2 XSSインジェクション | Security | High | BD:OW_STAF_003/A.2 | Check A.2 nhập chuỗi XSS không thực thi script (đại diện cho mọi ô text) | Đã đăng nhập, OW_STAF_003 ở chế độ sửa | 1. Nhập "&lt;script&gt;alert(1)&lt;/script&gt;" vào A.2<br>2. Click lưu / tải lại trang | Không có alert popup. Chuỗi được lưu/hiển thị như text thường hoặc từ chối. | &lt;script&gt;alert(1)&lt;/script&gt; | High |
| DRD-023 | A.2 SQLインジェクション | Security | High | BD:OW_STAF_003/A.2 | Check A.2 nhập chuỗi SQLi không gây lỗi DB (đại diện cho mọi ô text) | Đã đăng nhập, OW_STAF_003 ở chế độ sửa | 1. Nhập "' OR 1=1--" vào A.2<br>2. Click lưu | Không xảy ra lỗi DB hoặc dữ liệu bất thường. Hiển thị lỗi validation bình thường. | ' OR 1=1-- | High |
| DRD-024 | H.3 保存 セッション切れ | State | Critical | BD:OW_STAF_003/H.3, E_STAF003_S_001 | [UNCONFIRMED] Check H.3 lưu khi phiên hết hạn hiển thị E_STAF003_S_001 | Đã đăng nhập, OW_STAF_003 ở chế độ sửa, phiên hết hạn | 1. Để phiên hết hạn<br>2. Click lưu | Hiển thị 「セッションの有効期限が切れました。再度ログインしてください。」 (E_STAF003_S_001). | — | Critical |
| DRD-025 | H.3 保存 ネットワークエラー | State | High | BD:OW_STAF_003/H.3, E_STAF003_E_001 | [UNCONFIRMED] Check H.3 lưu khi mất mạng hiển thị E_STAF003_E_001 | Đã đăng nhập, OW_STAF_003 ở chế độ sửa, mạng bị ngắt | 1. Ngắt mạng<br>2. Click lưu | Toast lỗi 「ネットワークエラーが発生しました。時間をおいて再度お試しください。」 (E_STAF003_E_001). Ở lại màn. | — | High |
| DRD-026 | H.3 保存 システムエラー | State | High | BD:OW_STAF_003/H.3, E_STAF003_S_002 | [UNCONFIRMED] Check H.3 lưu khi API 500 hiển thị E_STAF003_S_002 | Đã đăng nhập, OW_STAF_003 ở chế độ sửa, API mock 500 | 1. Cấu hình API 500<br>2. Click lưu | Toast lỗi 「システムエラーが発生しました。管理者にお問い合わせください。」 (E_STAF003_S_002). Ở lại màn. | — | High |
| DRD-027 | タブ切り替え | Behavior | High | BD:OW_STAF_003/+1 | Check +1 tab bar chuyển giữa 3 tab và đồng bộ URL | Đã đăng nhập, OW_STAF_003 ở tab 基本情報 | 1. Click tab 担当配送情報<br>2. Quan sát nội dung và URL<br>3. Click tab 変更履歴<br>4. Quan sát | Tab đổi hiển thị nội dung tương ứng. URL cập nhật để phản ánh tab đang chọn. | DR000001 | High |
| DRD-028 | 担当配送情報 検索 | Logic | High | BD:OW_STAF_003/B.1.4 | Check B.1.4 tìm kiếm trong tab 担当配送情報 lọc kết quả | Đã đăng nhập, OW_STAF_003 tab 担当配送情報 | 1. Chọn 配送状況=配送完了, click B.1.4 検索 | Bảng chỉ hiển thị đơn có trạng thái 配送完了. | DR000001 | High |
| DRD-029 | 集計 全件集計確認 | Logic | High | BD:OW_STAF_003/B.1.5, BD:OW_STAF_003/B.1.6 | Check B.1.5, B.1.6 tính tổng trên toàn bộ kết quả, không chỉ trang hiện tại | Đã đăng nhập, DR000001 có ≥11 đơn trong kỳ | 1. Tìm kiếm tất cả đơn của DR000001<br>2. Ghi lại B.1.5 và B.1.6<br>3. Chuyển sang trang 2<br>4. Ghi lại B.1.5 và B.1.6 | B.1.5 và B.1.6 giữ nguyên giá trị tổng khi chuyển trang (không đổi theo trang). | DR000001 với >10 đơn | High |
| DRD-030 | 配送No リンク遷移 | Navigation | High | BD:OW_STAF_003/B.2.4 | Check B.2.4 link mã giao hàng chuyển sang OW_DLVR_002 | Đã đăng nhập, OW_STAF_003 tab 担当配送情報 có dữ liệu | 1. Click mã giao hàng (B.2.4) trên dòng đầu tiên | Chuyển sang OW_DLVR_002 của đơn giao hàng tương ứng. | DR000001 | High |
| DRD-031 | B.1.1 デフォルト期間 | Logic | Medium | BD:OW_STAF_003/B.1.1 | Check B.1.1 date picker mặc định là đầu〜cuối tháng hiện tại | Đã đăng nhập, vào tab 担当配送情報 lần đầu | 1. Chuyển sang tab 担当配送情報<br>2. Quan sát B.1.1 | B.1.1 mặc định ngày 1 tháng hiện tại đến ngày cuối tháng hiện tại. | — | Medium |
| DRD-032 | 担当配送情報 ページネーション | Logic | Medium | BD:OW_STAF_003/P.2 | Check P.2 phân trang trong tab 担当配送情報 hoạt động | Đã đăng nhập, DR000001 có >10 đơn | 1. Quan sát trang 1 và nút điều hướng<br>2. Click nút trang tiếp theo | P.2 navigation hiển thị số trang chính xác. Trang hiện tại highlight xanh. Chuyển trang load đúng dữ liệu trang kế. | DR000001 | Medium |
| DRD-033 | 変更履歴 ログ内容形式 | Logic | Medium | BD:OW_STAF_003/C.2 | Check C.2 nội dung log có format đúng | Đã đăng nhập, OW_STAF_003 tab 変更履歴 | 1. Quan sát cột C.2 của log gần nhất<br>2. Tìm log đăng ký mới<br>3. Tìm log thay đổi một mục | Bước 2: Log mới nhất là 「データ登録」.<br>Bước 3: Log có format 「{項目名}を『{前} → {後}』に変更」. | DR000001 | Medium |
| DRD-034 | H.1 削除 モーダル | Behavior | High | BD:OW_STAF_003/H.1 | Check H.1 削除 hiển thị modal xác nhận xóa | Đã đăng nhập, OW_STAF_003 mở | 1. Click nút 削除 (H.1) | Modal xác nhận xóa hiển thị. | DR000003 | High |
| DRD-035 | H.2 パスワード送信 ダイアログ | Behavior | High | BD:OW_STAF_003/H.2 | Check H.2 パスワード送信 hiển thị dialog xác nhận | Đã đăng nhập, OW_STAF_003 mở | 1. Click nút パスワード送信 (H.2) | Dialog 「アカウント発行のメール送信の確認」 hiển thị. | DR000001 | High |
| DRD-036 | H.3 編集モード切替 | Behavior | High | BD:OW_STAF_003/H.3 | Check H.3 編集 chuyển form sang chế độ chỉnh sửa | Đã đăng nhập, OW_STAF_003 ở chế độ xem | 1. Click nút 編集 (H.3) | Các trường A.2, A.3, A.4, A.5, A.6, A.7, A.9 trở thành có thể nhập／chỉnh sửa. | DR000001 | High |

## OW_STAF_004 — 配送スタッフ登録・編集

| ID | Function Name | Category | Risk Level | Traceability ID | Test Scenario | Precondition | Steps | Expected Results | Test Data | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DRF-001 | 配送スタッフ登録フォーム レイアウト | UI | Medium | BD:OW_STAF_004/A.1, BD:OW_STAF_004/A.2, BD:OW_STAF_004/A.3, BD:OW_STAF_004/A.4, BD:OW_STAF_004/A.5, BD:OW_STAF_004/A.6, BD:OW_STAF_004/A.7, BD:OW_STAF_004/A.9, BD:OW_STAF_004/F.1, BD:OW_STAF_004/F.2, BD:OW_STAF_004/+1, BD:OW_STAF_004/+2 | [UI Visual] Check layout form OW_STAF_004 chế độ đăng ký mới và chế độ sửa | 1) OW_STAF_004 chế độ mới (từ H.2 OW_STAF_001); 2) Chế độ sửa (từ T.10.1) | 1. Mở OW_STAF_004 chế độ mới<br>2. Quan sát các trường<br>3. Mở OW_STAF_004 chế độ sửa DR000001<br>4. Quan sát | Chế độ mới: A.1 ẩn, form 3 cột có A.2 (氏名), A.3 (カナ), A.4 (区分), A.5 (ステータス), A.6 (電話番号), A.7 (免許証), A.9 (メール), nút F.1 (キャンセル) và F.2 (登録).<br>Chế độ sửa: thêm A.1 (ID, readonly), +1 (ログインID, readonly), +2 (最終ログイン, readonly). | — | Low |
| DRF-002 | A.1 配送スタッフID 表示制御 | Logic | Medium | BD:OW_STAF_004/A.1 | Check A.1 ẩn ở chế độ mới, chỉ đọc ở chế độ sửa | 1) Chế độ đăng ký mới; 2) Chế độ sửa DR000001 | 1. Mở OW_STAF_004 chế độ mới, tìm trường A.1<br>2. Mở OW_STAF_004 chế độ sửa DR000001, tìm trường A.1 | Bước 1: A.1 không hiển thị.<br>Bước 2: A.1 hiển thị với ID của DR000001, không sửa được. | DR000001 | Medium |
| DRF-003 | A.2 配送スタッフ名 必須チェック | Validate | Critical | BD:OW_STAF_004/A.2, E_STAF004_001 | Check A.2 trống khi lưu hiển thị lỗi E_STAF004_001 | Đã đăng nhập, OW_STAF_004 chế độ mới | 1. Để trống A.2<br>2. Click F.2 登録 | Lỗi inline 「配送スタッフ名を入力してください。」 (E_STAF004_001). | — | Critical |
| DRF-004 | A.2 配送スタッフ名 最大文字数 | Validate | High | BD:OW_STAF_004/A.2, E_STAF004_002 | Check A.2 51 ký tự hiển thị lỗi E_STAF004_002 | Đã đăng nhập, OW_STAF_004 chế độ mới | 1. Nhập あ × 51 vào A.2<br>2. Click F.2 | Lỗi inline 「50文字以内で入力してください。」 (E_STAF004_002). | あ × 51 | High |
| DRF-005 | A.3 カナ 自動入力 | Logic | High | BD:OW_STAF_004/A.3 | Check A.3 tự điền katakana khi A.2 mất focus | Đã đăng nhập, OW_STAF_004 chế độ mới | 1. Nhập "テスト太郎" vào A.2<br>2. Click ra ngoài A.2 | A.3 tự điền "テストタロウ". | テスト太郎 | High |
| DRF-006 | A.3 カナ 必須チェック | Validate | Critical | BD:OW_STAF_004/A.3, E_STAF004_003 | Check A.3 trống hiển thị lỗi E_STAF004_003 | Đã đăng nhập, OW_STAF_004 chế độ mới | 1. Để trống A.3<br>2. Click F.2 | Lỗi inline 「カナを入力してください。」 (E_STAF004_003). | — | Critical |
| DRF-007 | A.3 カナ 全角カナ形式 | Validate | High | BD:OW_STAF_004/A.3, E_STAF004_004 | Check A.3 nhập không phải katakana hiển thị lỗi E_STAF004_004 | Đã đăng nhập, OW_STAF_004 chế độ mới | 1. Nhập "やまだたろう" vào A.3<br>2. Click F.2 | Lỗi inline 「全角カナで入力してください。」 (E_STAF004_004). | やまだたろう | High |
| DRF-008 | A.3 カナ 最大文字数 | Validate | High | BD:OW_STAF_004/A.3, E_STAF004_005 | Check A.3 ア × 51 hiển thị lỗi E_STAF004_005 | Đã đăng nhập, OW_STAF_004 chế độ mới | 1. Nhập ア × 51 vào A.3<br>2. Click F.2 | Lỗi inline 「50文字以内で入力してください。」 (E_STAF004_005). | ア × 51 | High |
| DRF-009 | A.4 区分 必須チェック | Validate | Critical | BD:OW_STAF_004/A.4, E_STAF004_006 | Check A.4 chưa chọn hiển thị lỗi E_STAF004_006 | Đã đăng nhập, OW_STAF_004 chế độ mới, A.4 chưa chọn | 1. Bỏ trống A.4<br>2. Click F.2 | Lỗi inline 「区分を選択してください。」 (E_STAF004_006). | — | Critical |
| DRF-010 | A.5 ステータス 必須チェック | Validate | Critical | BD:OW_STAF_004/A.5, E_STAF004_007 | Check A.5 chưa chọn hiển thị lỗi E_STAF004_007 | Đã đăng nhập, OW_STAF_004 chế độ mới, A.5 chưa chọn | 1. Bỏ trống A.5<br>2. Click F.2 | Lỗi inline 「ステータスを選択してください。」 (E_STAF004_007). | — | Critical |
| DRF-011 | A.6 電話番号 形式チェック | Validate | High | BD:OW_STAF_004/A.6, E_STAF004_008 | Check A.6 SĐT sai định dạng hiển thị lỗi E_STAF004_008 | Đã đăng nhập, OW_STAF_004 chế độ mới | 1. Nhập "090-ABCD" vào A.6<br>2. Click F.2 | Lỗi inline 「電話番号の形式が正しくありません（半角数字・ハイフン、10〜11桁）」 (E_STAF004_008). | 090-ABCD | High |
| DRF-012 | A.7 免許証 必須チェック | Validate | Critical | BD:OW_STAF_004/A.7, E_STAF004_009 | Check A.7 chưa tải ảnh hiển thị lỗi E_STAF004_009 | Đã đăng nhập, OW_STAF_004 chế độ mới | 1. Không tải file A.7<br>2. Click F.2 | Lỗi inline 「免許証画像をアップロードしてください。」 (E_STAF004_009). | — | Critical |
| DRF-013 | A.7 免許証 形式チェック | Validate | High | BD:OW_STAF_004/A.7, E_STAF004_010 | Check A.7 file PDF hiển thị lỗi E_STAF004_010 | Đã đăng nhập, OW_STAF_004 chế độ mới | 1. Tải license.pdf vào A.7 | Lỗi inline 「JPG、JPEG、PNGのいずれかの形式で画像ファイルをアップロードしてください。」 (E_STAF004_010). | license.pdf | High |
| DRF-014 | A.7 免許証 サイズチェック | Validate | High | BD:OW_STAF_004/A.7, E_STAF004_011 | Check A.7 file 5.1MB hiển thị lỗi E_STAF004_011 | Đã đăng nhập, OW_STAF_004 chế độ mới | 1. Tải license_51mb.jpg (5.1MB) | Lỗi inline 「アップロード画像ファイルの上限サイズは5MBです。」 (E_STAF004_011). | license_51mb.jpg | High |
| DRF-015 | A.9 メール 必須チェック | Validate | Critical | BD:OW_STAF_004/A.9, E_STAF004_012 | Check A.9 trống hiển thị lỗi E_STAF004_012 | Đã đăng nhập, OW_STAF_004 chế độ mới | 1. Để trống A.9<br>2. Click F.2 | Lỗi inline 「メールアドレスを入力してください。」 (E_STAF004_012). | — | Critical |
| DRF-016 | A.9 メール 形式チェック | Validate | High | BD:OW_STAF_004/A.9, E_STAF004_013 | Check A.9 email sai định dạng hiển thị lỗi E_STAF004_013 | Đã đăng nhập, OW_STAF_004 chế độ mới | 1. Nhập "user_a_invalid" vào A.9<br>2. Click F.2 | Lỗi inline 「メールアドレスの形式が正しくありません。」 (E_STAF004_013). | user_a_invalid | High |
| DRF-017 | A.9 メール 最大文字数 (biên 256) | Validate | High | BD:OW_STAF_004/A.9, E_STAF004_014 | Check A.9 email 256 ký tự hiển thị lỗi E_STAF004_014 | Đã đăng nhập, OW_STAF_004 chế độ mới | 1. Nhập email 256 ký tự<br>2. Click F.2 | Lỗi inline 「メールアドレスは255文字以内で入力してください。」(E_STAF004_014). | Email 256 ký tự | High |
| DRF-018 | F.2 登録 セッション切れ | State | Critical | BD:OW_STAF_004/F.2, E_STAF004_S_001 | [UNCONFIRMED] Check F.2 登録 khi phiên hết hạn hiển thị E_STAF004_S_001 | Đã đăng nhập, form hợp lệ, phiên hết hạn | 1. Điền form hợp lệ, để phiên hết hạn<br>2. Click F.2 | Hiển thị 「セッションの有効期限が切れました。再度ログインしてください。」 (E_STAF004_S_001). | — | Critical |
| DRF-019 | F.2 登録 ネットワークエラー | State | High | BD:OW_STAF_004/F.2, E_STAF004_E_001 | [UNCONFIRMED] Check F.2 登録 khi mất mạng hiển thị E_STAF004_E_001 | Đã đăng nhập, form hợp lệ, mạng bị ngắt | 1. Điền form, ngắt mạng<br>2. Click F.2 | Toast lỗi 「ネットワークエラーが発生しました。時間をおいて再度お試しください。」 (E_STAF004_E_001). | — | High |
| DRF-020 | F.2 登録 システムエラー | State | High | BD:OW_STAF_004/F.2, E_STAF004_S_002 | [UNCONFIRMED] Check F.2 登録 khi API 500 hiển thị E_STAF004_S_002 | Đã đăng nhập, form hợp lệ, API mock 500 | 1. Điền form, cấu hình API 500<br>2. Click F.2 | Toast lỗi 「システムエラーが発生しました。管理者にお問い合わせください。」 (E_STAF004_S_002). | — | High |

## OW_STAF_005 — アカウント一括発行

| ID | Function Name | Category | Risk Level | Traceability ID | Test Scenario | Precondition | Steps | Expected Results | Test Data | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DRB-001 | アカウント一括発行 確認モーダル レイアウト | UI | Medium | BD:OW_STAF_005/1, BD:OW_STAF_005/2, BD:OW_STAF_005/3, BD:OW_STAF_005/4, BD:OW_STAF_005/5, BD:OW_STAF_005/10 | [UI Visual] Check layout OW_STAF_005 ở state xác nhận và state có dòng lỗi | Chọn mix DR000001 (有効) và DR000006 (利用停止) ở OW_STAF_001, click H.1 | 1. Quan sát modal OW_STAF_005 | Modal hiển thị: văn bản hướng dẫn (1), cảnh báo lỗi đỏ (2), bảng tài xế (3) với dòng DR000006 nền xám+email trống, nút キャンセル (4), nút 発行する (5), nút × (10). | DR000001, DR000006 | Low |
| DRB-002 | アカウント一括発行 結果ポップアップ・スピナー レイアウト | UI | Medium | BD:OW_STAF_005/6, BD:OW_STAF_005/7, BD:OW_STAF_005/8, BD:OW_STAF_005/9, BD:OW_STAF_005/+1 | [UI Visual] Check popup kết quả thành công, popup một phần lỗi và spinner | OW_STAF_005 ở state xác nhận với DR000001 (有効) | 1. Click 発行する (5), quan sát spinner (+1)<br>2. Sau khi hoàn thành toàn bộ, quan sát popup (6)<br>3. Đóng, test lại với mix có lỗi, quan sát popup (7, 8, 9) | Bước 1: Spinner hiển thị trong lúc xử lý.<br>Bước 2: Popup xanh 「アカウント発行が完了しました」 + nút 完了 (6).<br>Bước 3: Popup đỏ 「アカウント発行が完了しました（一部エラーあり）」 với số thành công／thất bại, nút 完了 (8) và 再度実行 (9). | DR000001; DR000001+DR000006 | Low |
| DRB-003 | 有効外ステータス エラー表示 | Logic | Critical | BD:OW_STAF_005/2, BD:OW_STAF_005/3, E_STAF005_001 | Check item 2 hiển thị số lỗi đỏ khi có tài xế không phải 有効 | Đã đăng nhập, chọn DR000001 (有効), DR000006 (利用停止) | 1. Mở OW_STAF_005<br>2. Quan sát vùng lỗi và bảng (3) | Chữ đỏ hiển thị 「エラー：1件発生しています。」 (E_STAF005_001) với 〇〇=1. Kèm ※ dòng lỗi không nằm trong phạm vi gửi. Dòng DR000006 tô nền xám, email trống. | DR000001, DR000006 | Critical |
| DRB-004 | グレー行ハイライト 表示制御 | Logic | High | BD:OW_STAF_005/3 | Check dòng trạng thái khác 有効 tô nền xám và cột email trống | Chọn DR000001 (有効), DR000004 (無効), DR000005 (免許未登録) | 1. Mở OW_STAF_005<br>2. Quan sát từng dòng trong bảng 3 | DR000001: nền thường, email hiển thị.<br>DR000004, DR000005: nền xám, cột email trống. | DR000001, DR000004, DR000005 | High |
| DRB-005 | 発行するボタン 全エラー時非活性 | Logic | Critical | BD:OW_STAF_005/5 | Check nút 発行する (5) disable khi tất cả dòng là lỗi (0 đối tượng 有効) | Chọn chỉ DR000004 (無効) và DR000006 (利用停止), mở OW_STAF_005 | 1. Quan sát nút 発行する (5) | Nút 5 disable, không nhấn được. | DR000004, DR000006 | Critical |
| DRB-006 | 発行するボタン 有効対象ありで活性 | Logic | High | BD:OW_STAF_005/5 | Check nút 発行する (5) enable khi có ít nhất 1 đối tượng 有効 | Chọn DR000001 (有効) và DR000006 (利用停止), mở OW_STAF_005 | 1. Quan sát nút 発行する (5) | Nút 5 enable, nhấn được được (gửi chỉ cho DR000001). | DR000001, DR000006 | High |
| DRB-007 | キャンセル モーダル閉じ チェック保持 | Behavior | High | BD:OW_STAF_005/4 | Check 4 キャンセル đóng modal không gửi email và giữ checkbox | DR000001, DR000003 được chọn, OW_STAF_005 mở | 1. Click キャンセル (4)<br>2. Quan sát OW_STAF_001 | Modal đóng, quay về OW_STAF_001. Email không được gửi. Checkbox DR000001 và DR000003 vẫn đang chọn. | DR000001, DR000003 | High |
| DRB-008 | 全件成功 完了ポップアップ | Logic | Critical | BD:OW_STAF_005/6 | Check popup thành công toàn bộ hiển thị sau khi gửi toàn bộ thành công | Chỉ chọn DR000001 (有効), OW_STAF_005 mở | 1. Click 発行する (5)<br>2. Đợi xử lý hoàn thành<br>3. Quan sát popup | Popup (6) hiển thị icon tích xanh + 「アカウント発行が完了しました」. Nút 完了 có trên popup. | DR000001 | Critical |
| DRB-009 | 一部エラー ポップアップ E_STAF005_002 | Logic | Critical | BD:OW_STAF_005/7, E_STAF005_002 | Check popup một phần lỗi hiển thị E_STAF005_002 với số thành công và thất bại | OW_STAF_005 với mix tài xế, một số gửi thất bại (mock) | 1. Click 発行する<br>2. Mock API gửi email thất bại cho 1 tài xế<br>3. Quan sát popup kết quả | Popup (7) hiển thị icon ! đỏ + 「アカウント発行が完了しました（一部エラーあり）」 (E_STAF005_002). Hiển thị 「成功：〇件」 và 「失敗：〇件」. | DR000001, DR000003 (1 thất bại mock) | Critical |
| DRB-010 | 一部エラー 完了ボタン | Behavior | High | BD:OW_STAF_005/8 | Check 8 完了 đóng popup một phần lỗi và quay về OW_STAF_001 | Popup 一部エラー (7) đang hiển thị | 1. Click 完了 (8) | Popup đóng, quay về OW_STAF_001. Phần tài xế thất bại không được gửi lại. | — | High |
| DRB-011 | 再度実行ボタン 失敗分再送 | Behavior | High | BD:OW_STAF_005/9 | Check 9 再度実行 gửi lại chỉ các đối tượng bị lỗi trước đó | Popup 一部エラー (7) đang hiển thị, có N tài xế thất bại | 1. Click 再度実行 (9) | Hệ thống gửi lại chỉ cho các tài xế thất bại trước đó (không gửi lại phần đã thành công). Hiển thị kết quả gửi lại. | — | High |
| DRB-012 | 発行する セッション切れ | State | Critical | BD:OW_STAF_005/5, E_STAF005_S_001 | [UNCONFIRMED] Check 発行する khi phiên hết hạn hiển thị E_STAF005_S_001 | DR000001 được chọn, OW_STAF_005 mở, phiên hết hạn | 1. Để phiên hết hạn<br>2. Click 発行する | Hiển thị 「セッションの有効期限が切れました。再度ログインしてください。」 (E_STAF005_S_001). | — | Critical |
| DRB-013 | 発行する ネットワークエラー | State | High | BD:OW_STAF_005/5, E_STAF005_E_001 | [UNCONFIRMED] Check 発行する khi mất mạng hiển thị E_STAF005_E_001 | DR000001 được chọn, OW_STAF_005 mở, mạng ngắt | 1. Ngắt mạng<br>2. Click 発行する | Toast lỗi 「ネットワークエラーが発生しました。時間をおいて再度お試しください。」 (E_STAF005_E_001). Ở lại modal. | — | High |
| DRB-014 | 発行する システムエラー | State | High | BD:OW_STAF_005/5, E_STAF005_S_002 | [UNCONFIRMED] Check 発行する khi API 500 hiển thị E_STAF005_S_002 | DR000001 được chọn, OW_STAF_005 mở, API mock 500 | 1. Cấu hình API 500<br>2. Click 発行する | Toast lỗi 「システムエラーが発生しました。管理者にお問い合わせください。」 (E_STAF005_S_002). Ở lại modal. | — | High |

## Navigation — 配送スタッフ管理

| ID | Function Name | Category | Risk Level | Traceability ID | Test Scenario | Precondition | Steps | Expected Results | Test Data | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DRVNAV-001 | サイドバー 配送スタッフ リンク | Navigation | High | BD:OW_STAF_001/S.5 | Check sidebar 配送スタッフ link mở OW_STAF_001 | Đã đăng nhập, đang ở màn HOME | 1. Click 配送スタッフ trên sidebar | OW_STAF_001 mở, item sidebar 配送スタッフ active (highlight). | OW000123 ／ Pass1234 | High |
| DRVNAV-002 | サイドバー 他メニュー 遷移 | Navigation | Medium | BD:OW_STAF_001/S.6 | Check 7 mục sidebar điều hướng đúng màn đích | Đã đăng nhập, đang ở OW_STAF_001 | 1. Click ホーム<br>2. Click スケジュール<br>3. Click 配送管理<br>4. Click 集金・駐車<br>5. Click プロフィール | Mỗi click chuyển đúng màn: OW_HOME_001, OW_SCHD_001, OW_DLVR_001, OW_CLCT_001, OW_PROF_001. | — | Medium |
| DRVNAV-003 | 一覧→詳細 スタッフ名リンク | Navigation | High | BD:OW_STAF_001/T.4 | Check link tên tài xế T.4 chuyển sang OW_STAF_003 tab 基本情報 | Đã đăng nhập, OW_STAF_001 có dữ liệu | 1. Click tên DR000001 (T.4) | Chuyển sang OW_STAF_003, tab 基本情報 active mặc định, thông tin DR000001 hiển thị. | DR000001 | High |
| DRVNAV-004 | 詳細→一覧 戻る | Navigation | High | BD:OW_STAF_003/H.3 | Check từ OW_STAF_003 quay về OW_STAF_001 | Đã đăng nhập, đang ở OW_STAF_003 | 1. Click nút Back trình duyệt hoặc breadcrumb 一覧 | Quay về OW_STAF_001 với điều kiện tìm kiếm trước đó. | DR000001 | High |
| DRVNAV-005 | 一覧→登録フォーム 新規登録 | Navigation | High | BD:OW_STAF_001/H.2 | Check H.2 ＋新規登録 chuyển sang OW_STAF_004 chế độ mới | Đã đăng nhập OW000123 có quyền Create, ở OW_STAF_001 | 1. Click H.2 ＋新規登録 | OW_STAF_004 mở ở chế độ đăng ký mới: A.1 ẩn, form trống. | OW000123 | High |
| DRVNAV-006 | 一覧→登録フォーム 編集アイコン | Navigation | High | BD:OW_STAF_001/T.10.1 | Check T.10.1 icon 🖊 chuyển sang OW_STAF_004 chế độ sửa | Đã đăng nhập OW000123 có quyền Edit | 1. Click icon 🖊 của DR000001 | OW_STAF_004 mở ở chế độ chỉnh sửa: A.1 hiển thị ID DR000001, form điền sẵn dữ liệu. | DR000001 | High |
| DRVNAV-007 | 登録フォーム キャンセル 戻る | Navigation | Medium | BD:OW_STAF_004/F.1 | Check F.1 キャンセル đóng form và quay về màn trước | Đang ở OW_STAF_004 (vào từ OW_STAF_001 hoặc OW_STAF_003) | 1. Click F.1 キャンセル | Form đóng, quay lại màn nguồn (OW_STAF_001 hoặc OW_STAF_003). Không lưu dữ liệu. | — | Medium |
| DRVNAV-008 | 詳細→編集モード 編集ボタン | Navigation | High | BD:OW_STAF_003/H.3 | Check H.3 編集 chuyển OW_STAF_003 sang chế độ sửa tại chỗ | Đang ở OW_STAF_003 ở chế độ xem | 1. Click H.3 編集 | Form chuyển sang chế độ sửa, các trường có thể nhập. URL không đổi màn hình. | DR000001 | High |
| DRVNAV-009 | 担当配送情報 配送No 詳細遷移 | Navigation | High | BD:OW_STAF_003/B.2.4 | Check B.2.4 mã giao hàng mở OW_DLVR_002 | Đang ở OW_STAF_003 tab 担当配送情報 có dữ liệu | 1. Click mã giao hàng đầu tiên trong tab 担当配送情報 | OW_DLVR_002 mở với chi tiết đơn giao hàng tương ứng. | DR000001 | High |
| DRVNAV-010 | 一覧→一括発行モーダル | Navigation | High | BD:OW_STAF_001/H.1 | Check H.1 mở OW_STAF_005 modal sau khi chọn checkbox | Đã đăng nhập, chọn ≥1 checkbox trên OW_STAF_001 | 1. Chọn DR000001<br>2. Click H.1 | OW_STAF_005 modal phủ lên OW_STAF_001, không rời khỏi trang. | DR000001 | High |
| DRVNAV-011 | 一括発行モーダル キャンセル | Navigation | High | BD:OW_STAF_005/4 | Check 4 キャンセル đóng OW_STAF_005 và giữ checkbox | OW_STAF_005 đang mở | 1. Click キャンセル (4) | OW_STAF_005 đóng, OW_STAF_001 hiển thị lại, checkbox vẫn được chọn. | DR000001 | High |
| DRVNAV-012 | 一括発行モーダル × 閉じる | Navigation | Medium | BD:OW_STAF_005/10 | Check 10 nút × đóng OW_STAF_005 và quay về OW_STAF_001 | OW_STAF_005 đang mở | 1. Click × (10) | OW_STAF_005 đóng, quay về OW_STAF_001. | — | Medium |
| DRVNAV-013 | 一括発行 全件成功→OW_STAF_001 | Navigation | High | BD:OW_STAF_005/6 | Check click 完了 từ popup thành công toàn bộ quay về OW_STAF_001 | Popup (6) thành công đang hiển thị | 1. Click 完了 trên popup (6) | Popup đóng, quay về OW_STAF_001. | DR000001 | High |
| DRVNAV-014 | 一括発行 一部エラー→OW_STAF_001 | Navigation | High | BD:OW_STAF_005/8 | Check 8 完了 từ popup một phần lỗi quay về OW_STAF_001 | Popup một phần lỗi (7) đang hiển thị | 1. Click 完了 (8) | Popup đóng, quay về OW_STAF_001. Tài xế thất bại không tự gửi lại. | — | High |
| DRVNAV-015 | 再度実行 失敗分再送 | Behavior | High | BD:OW_STAF_005/9 | Check 9 再度実行 chỉ gửi lại tài xế thất bại | Popup một phần lỗi (7) đang hiển thị, N tài xế thất bại | 1. Click 再度実行 (9)<br>2. Quan sát kết quả | Hệ thống gửi lại chỉ cho tài xế thất bại trước đó. Sau đó hiển thị kết quả mới. | — | High |
| DRVNAV-016 | 詳細 タブ URL同期 | Logic | Medium | BD:OW_STAF_003/+1 | Check tab OW_STAF_003 đồng bộ URL để chia sẻ link | Đang ở OW_STAF_003 tab 基本情報 | 1. Click tab 担当配送情報<br>2. Copy URL<br>3. Mở URL trên tab mới | URL thay đổi khi click tab. Mở URL mới thẳng đến tab 担当配送情報. | DR000001 | Medium |
| DRVNAV-017 | OW_STAF_001 F5リロード | Behavior | Medium | BD:OW_STAF_001/S.5 | Check reload (F5) OW_STAF_001 giữ lại trang và tải lại dữ liệu | Đang ở OW_STAF_001 trang 2 | 1. Nhấn F5 | OW_STAF_001 tải lại. Danh sách hiển thị lại (có thể về trang 1 mặc định hoặc giữ trang). | — | Medium |
| DRVNAV-018 | 未ログイン 直接URLアクセス | State | Critical | BD:OW_STAF_001/S.5 | [UNCONFIRMED] Check truy cập trực tiếp URL OW_STAF_001 khi chưa đăng nhập chuyển về trang login | Chưa đăng nhập (hoặc token đã hết hạn) | 1. Mở URL OW_STAF_001 trực tiếp khi chưa đăng nhập | Chuyển hướng về OW_AUTH_001 (trang đăng nhập). 「セッションの有効期限が切れました。再度ログインしてください。」 hoặc tương tự. | — | High |
| DRVNAV-019 | Create権限なし ＋新規登録ボタン非表示 | Logic | High | BD:OW_STAF_001/H.2 | Check H.2 ẩn với tài khoản không có quyền Create | Đăng nhập tài khoản không có quyền Create | 1. Đăng nhập tài khoản không có quyền Create<br>2. Mở OW_STAF_001 | H.2 ＋新規登録 không hiển thị trên header. | Tài khoản không có Create | High |
| DRVNAV-020 | Edit権限なし 編集アイコン非表示 | Logic | High | BD:OW_STAF_001/T.10.1 | Check T.10.1 icon 🖊 ẩn với tài khoản không có quyền Edit | Đăng nhập tài khoản không có quyền Edit | 1. Đăng nhập tài khoản không có Edit<br>2. Mở OW_STAF_001 | Icon 🖊 (T.10.1) không hiển thị trên bất kỳ dòng nào. | Tài khoản không có Edit | High |
| DRVNAV-021 | Delete権限なし 削除アイコン非表示 | Logic | High | BD:OW_STAF_001/T.10.2 | Check T.10.2 icon 🗑 ẩn với tài khoản không có quyền Delete | Đăng nhập tài khoản không có quyền Delete | 1. Đăng nhập tài khoản không có Delete<br>2. Mở OW_STAF_001 | Icon 🗑 (T.10.2) không hiển thị trên bất kỳ dòng nào. | Tài khoản không có Delete | High |
| DRVNAV-022 | E2E 新規登録フロー | Integration | Critical | BD:OW_STAF_004/F.2 | Check luồng đăng ký tài xế mới từ đầu đến cuối thành công | Đăng nhập OW000123 có quyền Create | 1. Click H.2 ＋新規登録 từ OW_STAF_001<br>2. Điền form: A.2=テスト太郎, A.3=テストタロウ, A.4=個人, A.5=有効, A.6=090-0000-0000, A.7=license_ok.jpg, A.9=user_a@example.com<br>3. Click F.2 登録<br>4. Quan sát kết quả | Đăng ký thành công. Tài xế テスト太郎 xuất hiện trong OW_STAF_001. | テスト太郎, user_a@example.com, 090-0000-0000, license_ok.jpg | Critical |
| DRVNAV-023 | E2E 編集保存フロー | Integration | High | BD:OW_STAF_003/H.3 | Check luồng xem chi tiết rồi chỉnh sửa và lưu thành công | Đăng nhập OW000123 | 1. Click tên DR000001 từ OW_STAF_001<br>2. Click H.3 編集<br>3. Thay đổi A.6 thành 090-0000-0000<br>4. Click lưu<br>5. Kiểm tra A.6 sau khi lưu | Lưu thành công. A.6 cập nhật thành 090-0000-0000. Log thay đổi xuất hiện trong tab 変更履歴. | DR000001, 090-0000-0000 | High |
| DRVNAV-024 | E2E 一括アカウント発行フロー | Integration | Critical | BD:OW_STAF_005/5 | Check luồng phát hành tài khoản hàng loạt đầu đến cuối | Đăng nhập OW000123, DR000001 chưa phát hành | 1. Chọn checkbox DR000001, DR000003 ở OW_STAF_001<br>2. Click H.1 アカウント発行<br>3. Quan sát OW_STAF_005, click 発行する<br>4. Quan sát popup kết quả<br>5. Click 完了, kiểm tra T.9 | Popup thành công (6) hiển thị. Quay về OW_STAF_001. T.9 của DR000001 và DR000003 đổi thành 発行済み. | DR000001, DR000003 | Critical |
| DRVNAV-025 | 登録フォーム 全必須空欄送信 | Integration | High | BD:OW_STAF_004/F.2 | Check form OW_STAF_004 hiển thị tất cả lỗi validation khi gửi rỗng | OW_STAF_004 chế độ mới | 1. Không điền bất kỳ trường nào<br>2. Click F.2 登録 | Các lỗi inline hiển thị đồng thời cho: A.2 (E_STAF004_001), A.3 (E_STAF004_003), A.4 (E_STAF004_006), A.5 (E_STAF004_007), A.7 (E_STAF004_009), A.9 (E_STAF004_012). Form không lưu. | — | High |
| DRVNAV-026 | 詳細 削除確認 | Behavior | High | BD:OW_STAF_003/H.1 | Check H.1 削除 hiển thị dialog xác nhận trước khi xóa | Đăng nhập OW000123 có quyền Delete, đang ở OW_STAF_003 | 1. Click H.1 削除 | Modal xác nhận xóa hiển thị. Tài xế chưa bị xóa cho đến khi xác nhận trong modal. | DR000003 | High |

## Navigation Matrix

| Từ màn | Phần tử (BD no) | Điều kiện | Đến màn | Ghi chú |
| --- | --- | --- | --- | --- |
| Sidebar | 配送スタッフ link | Đã đăng nhập | OW_STAF_001 | Sidebar item active |
| OW_STAF_001 | H.1 アカウント一括発行 | ≥1 checkbox chọn | OW_STAF_005 (modal) | Modal phủ lên OW_STAF_001 |
| OW_STAF_001 | H.2 ＋新規登録 | Có quyền Create | OW_STAF_004 (chế độ mới) | A.1 ẩn |
| OW_STAF_001 | T.4 Tên tài xế link | — | OW_STAF_003 (tab 基本情報) | URL đồng bộ tab |
| OW_STAF_001 | T.10.1 icon 🖊 | Có quyền Edit | OW_STAF_004 (chế độ sửa) | Form điền sẵn |
| OW_STAF_001 | T.10.2 icon 🗑 | Có quyền Delete | Modal xác nhận xóa | Ở lại OW_STAF_001 |
| OW_STAF_003 | H.1 削除 | — | Modal xác nhận | Ở lại OW_STAF_003 |
| OW_STAF_003 | H.3 編集 | — | OW_STAF_003 (edit mode) | Ở lại OW_STAF_003 |
| OW_STAF_003 | B.2.4 配送No link | Tab 担当配送情報 | OW_DLVR_002 | Chi tiết giao hàng |
| OW_STAF_004 | F.1 キャンセル | — | Màn nguồn (OW_STAF_001 hoặc OW_STAF_003) | Không lưu |
| OW_STAF_004 | F.2 登録 (success) | Form hợp lệ | Chưa xác nhận (OQ-12) |  |
| OW_STAF_005 | 4 キャンセル | — | OW_STAF_001 | Checkbox giữ nguyên |
| OW_STAF_005 | 6 完了 (success popup) | Toàn bộ thành công | OW_STAF_001 |  |
| OW_STAF_005 | 8 完了 (partial error popup) | — | OW_STAF_001 | Phần lỗi không gửi lại |
| OW_STAF_005 | 9 再度実行 | Popup một phần lỗi | Gửi lại tài xế lỗi | Phạm vi cần xác nhận |
| OW_STAF_005 | 10 × | — | OW_STAF_001 |  |

## Coverage Matrix

| Screen | BD no | Tên item | TC IDs |
| --- | --- | --- | --- |
| OW_STAF_001 | H.1 | アカウント一括発行ボタン | DRL-003, DRL-024, DRVNAV-010 |
| OW_STAF_001 | H.2 | ＋新規登録ボタン | DRL-004, DRVNAV-005, DRVNAV-019 |
| OW_STAF_001 | S.1 | テキスト検索 | DRL-006, DRL-007 |
| OW_STAF_001 | S.2 | スタッフ区分 | DRL-008 |
| OW_STAF_001 | S.3 | ステータス | DRL-009 |
| OW_STAF_001 | S.4 | クリアボタン | DRL-010 |
| OW_STAF_001 | S.5 | 検索ボタン | DRL-011, DRL-012, DRL-013, DRL-014 |
| OW_STAF_001 | S.6 | 折りたたみ展開 | DRL-005 |
| OW_STAF_001 | S.7 | 並び替えボタン | DRL-023 |
| OW_STAF_001 | T.1 | No 列 | DRL-001 |
| OW_STAF_001 | T.2 | 免許サムネイル | DRL-026 |
| OW_STAF_001 | T.3 | ID 列 | DRL-001 |
| OW_STAF_001 | T.4 | スタッフ名リンク | DRL-015, DRVNAV-003 |
| OW_STAF_001 | T.6 | 区分列 | DRL-001 |
| OW_STAF_001 | T.7 | 電話番号列 | DRL-001 |
| OW_STAF_001 | T.8 | ステータスバッジ | DRL-016 |
| OW_STAF_001 | T.9 | アカウント状態列 | DRL-017 |
| OW_STAF_001 | T.10.1 | 編集アイコン | DRL-018, DRL-019, DRVNAV-006, DRVNAV-020 |
| OW_STAF_001 | T.10.2 | 削除アイコン | DRL-020, DRL-021, DRVNAV-021 |
| OW_STAF_001 | P.1 | 件数表示 | DRL-011 |
| OW_STAF_001 | P.2 | ページ送り | DRL-022 |
| OW_STAF_001 | P.3 | 件数/ページ切替 | DRL-022 |
| OW_STAF_001 | +1 | 全選択チェックボックス | DRL-003, DRL-025 |
| OW_STAF_003 | H.1 | 削除ボタン | DRD-034, DRVNAV-026 |
| OW_STAF_003 | H.2 | パスワード送信ボタン | DRD-035 |
| OW_STAF_003 | H.3 | 編集ボタン | DRD-036, DRD-024, DRVNAV-008, DRVNAV-023 |
| OW_STAF_003 | A.1 | 配送スタッフID | DRD-001 |
| OW_STAF_003 | A.2 | 配送スタッフ名 | DRD-004, DRD-005, DRD-022, DRD-023 |
| OW_STAF_003 | A.3 | 配送スタッフ名カナ | DRD-006, DRD-007, DRD-008, DRD-009 |
| OW_STAF_003 | A.4 | 区分 | DRD-010 |
| OW_STAF_003 | A.5 | ステータス | DRD-011 |
| OW_STAF_003 | A.6 | 電話番号 | DRD-012, DRD-013 |
| OW_STAF_003 | A.7 | 免許証アップロード | DRD-014, DRD-015, DRD-016, DRD-017 |
| OW_STAF_003 | A.8 | ログインID | DRD-001 |
| OW_STAF_003 | A.9 | メールアドレス | DRD-018, DRD-019, DRD-020, DRD-021 |
| OW_STAF_003 | A.10 | 最終ログイン日時 | DRD-001 |
| OW_STAF_003 | B.1.1 | 期間検索 | DRD-031 |
| OW_STAF_003 | B.1.2 | 配送状況 | DRD-002 |
| OW_STAF_003 | B.1.3 | クリアボタン | DRD-002 |
| OW_STAF_003 | B.1.4 | 検索ボタン | DRD-028 |
| OW_STAF_003 | B.1.5 | 集金合計金額 | DRD-029 |
| OW_STAF_003 | B.1.6 | 駐車合計料金 | DRD-029 |
| OW_STAF_003 | B.2.1 | No連番 | DRD-002 |
| OW_STAF_003 | B.2.2 | 配送日 | DRD-002 |
| OW_STAF_003 | B.2.3 | 荷物温度帯 | DRD-002 |
| OW_STAF_003 | B.2.4 | 配送Noリンク | DRD-030, DRVNAV-009 |
| OW_STAF_003 | B.2.5 | 荷受け住所 | DRD-002 |
| OW_STAF_003 | B.2.6 | 届け先拠点名 | DRD-002 |
| OW_STAF_003 | B.2.7 | 届け先住所 | DRD-002 |
| OW_STAF_003 | B.2.8 | 配送状況バッジ | DRD-002 |
| OW_STAF_003 | B.2.9 | 配送区分 | DRD-002 |
| OW_STAF_003 | B.2.10 | 集金合計金額（行） | DRD-002 |
| OW_STAF_003 | B.2.11 | 駐車合計料金（行） | DRD-002 |
| OW_STAF_003 | P.1 | 件数表示 | DRD-002 |
| OW_STAF_003 | P.2 | ページナビゲーション | DRD-032 |
| OW_STAF_003 | P.3 | 件数/ページ切替 | DRD-002 |
| OW_STAF_003 | C | 変更情報テーブル | DRD-003 |
| OW_STAF_003 | C.1 | 変更日時 | DRD-003 |
| OW_STAF_003 | C.2 | 変更内容 | DRD-033 |
| OW_STAF_003 | C.3 | 変更者 | DRD-003 |
| OW_STAF_003 | +1 | タブバー | DRD-027, DRVNAV-016 |
| OW_STAF_004 | A.1 | 配送スタッフID | DRF-002 |
| OW_STAF_004 | A.2 | 配送スタッフ名 | DRF-003, DRF-004 |
| OW_STAF_004 | A.3 | 配送スタッフ名カナ | DRF-005, DRF-006, DRF-007, DRF-008 |
| OW_STAF_004 | A.4 | 区分 | DRF-009 |
| OW_STAF_004 | A.5 | ステータス | DRF-010 |
| OW_STAF_004 | A.6 | 電話番号 | DRF-011 |
| OW_STAF_004 | A.7 | 免許証アップロード | DRF-012, DRF-013, DRF-014 |
| OW_STAF_004 | A.9 | メールアドレス | DRF-015, DRF-016, DRF-017 |
| OW_STAF_004 | F.1 | キャンセルボタン | DRF-001, DRVNAV-007 |
| OW_STAF_004 | F.2 | 登録ボタン | DRF-018, DRF-019, DRF-020, DRVNAV-022 |
| OW_STAF_004 | +1 | ログインID | DRF-001 |
| OW_STAF_004 | +2 | 最終ログイン日時 | DRF-001 |
| OW_STAF_005 | 1 | 案内文 | DRB-001 |
| OW_STAF_005 | 2 | エラー件数表示 | DRB-003 |
| OW_STAF_005 | 3 | 選択済みスタッフ一覧 | DRB-003, DRB-004 |
| OW_STAF_005 | 4 | キャンセルボタン | DRB-007, DRVNAV-011 |
| OW_STAF_005 | 5 | 発行するボタン | DRB-005, DRB-006, DRB-012, DRB-013, DRB-014 |
| OW_STAF_005 | 6 | 全件成功ポップアップ | DRB-008, DRVNAV-013 |
| OW_STAF_005 | 7 | 一部エラーポップアップ | DRB-009 |
| OW_STAF_005 | 8 | 完了ボタン（一部エラー） | DRB-010, DRVNAV-014 |
| OW_STAF_005 | 9 | 再度実行ボタン | DRB-011, DRVNAV-015 |
| OW_STAF_005 | 10 | 閉じるボタン（×） | DRB-001, DRVNAV-012 |
| OW_STAF_005 | +1 | スピナー | DRB-002 |

## Not Covered — UNKNOWN

| Hạng mục | Lý do | OQ |
| --- | --- | --- |
| Empty state OW_STAF_001 khi tìm kiếm không khớp | Cách hiển thị chưa xác nhận | OQ-12 |
| Hành vi sau khi click nút クリア (S.4) — có tự tìm lại không | Need Confirm | OQ-17 |
| Chi tiết cột sắp xếp và UI của nút 並び替え (S.7) | Need Confirm | OQ-17 |
| Lựa chọn 件数/ページ dropdown (P.3 OW_STAF_001) | Need Confirm | OQ-17 |
| Văn bản hiển thị của 免許未登録 trong T.8 và màu／văn bản 削除済み | Need Confirm | — |
| Hành vi khi click thumbnail 免許 (T.2) | Need Confirm | OQ-17 |
| Rule xóa tài xế đang gán đơn và nội dung dialog xác nhận xóa (T.10.2, H.1) | Need Confirm | OQ-13 |
| Rule パスワード送信 (H.2) khi ステータス ≠ 有効 | Need Confirm | OQ-13 |
| Lỗi gửi email — hành vi và thông báo | Need Confirm | OQ-11 |
| Check trùng email với tài xế khác (A.9) | Need Confirm | OQ-13 |
| Empty state tab 担当配送情報 khi không có dữ liệu | Need Confirm | OQ-12 |
| Empty state tab 変更履歴 khi không có log | Need Confirm | OQ-12 |
| Nút 保存／キャンセル trong chế độ sửa OW_STAF_003 | Không có trong bảng Figma | — |
| Số thứ tự B.2.1 liên tục qua trang hay reset mỗi trang | Need Confirm | OQ-17 |
| Đích chuyển khi F.1 キャンセル (OW_STAF_004) | Need Confirm | OQ-12 |
| Dialog cảnh báo thay đổi chưa lưu (OW_STAF_004) | Need Confirm | OQ-12 |
| Đích và thông báo sau lưu thành công (F.2) | Need Confirm | — |
| Giá trị mặc định ステータス khi đăng ký mới (A.5 OW_STAF_004) | Need Confirm | OQ-17 |
| Spinner OW_STAF_005 — có cho phép thao tác trong lúc xử lý không | Need Confirm | — |
| Phạm vi 再度実行 (9) khi gửi lại vẫn lỗi | Need Confirm | OQ-11 |
| Lựa chọn 件数/ページ tab 担当配送情報 (P.3 OW_STAF_003) | Need Confirm | OQ-17 |
| Màu badge 配送状況 (B.2.3, B.2.8) | Need Confirm | — |
| URL OW_STAF_001, OW_STAF_003, OW_STAF_004, OW_STAF_005 | Need Confirm | — |
