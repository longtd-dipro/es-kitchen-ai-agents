# Đổi tên frame Figma theo Screen Code — ĐÃ ÁP DỤNG 08/10/2026 (93/93 frame)

> Đã ghi vào Figma file `VKAAOyoSPvgoB3H2qdeeV3` và đọc lại: 93/93 frame đều có tên bắt đầu bằng Screen Code. Tên cũ lưu tại `basic-design-per-group/figma-rename-plan.json` (cột `old`, dùng để rollback). Tên ở bảng mục 2 đã được rút gọn khi ghi (bỏ dấu `(?)`, bản trùng #…, phần tiếng Việt sau `/`). Mã E-xx mới vẫn là ĐỀ XUẤT chờ PM/BrSE chốt; SPEC / Basic Design / test case / danh sách màn hình CHƯA đồng bộ mã mới.

Format: `<ScreenCode> — <tên màn> [state]`. Rule: `<Module(2)>_<Feature(4)>_<Seq(3)>` (screen-code-rule.md). Mã E-xx chưa theo rule → đề xuất mã mới, **chờ PM/BrSE chốt** (RACI: định nghĩa Screen Code).

## 1. Mã đề xuất cho 20 màn phụ

| Mã hiện tại | Mã đề xuất | Tên màn | Cha |
|---|---|---|---|
| E-04 | DA_HOME_006 | 倉庫受取未完了トースト | DA_HOME_001 |
| E-05 | DA_HOME_007 | 配送予定なし（SOLちゃん）/ Empty state toàn bộ 3 ngày (SOL ちゃん) | DA_HOME_001 |
| E-06 | DA_HOME_008 | 配送予定データなし（1日）/ Empty state 1 ngày trống | DA_HOME_001 |
| E-07 | DA_NOTI_003 | お知らせなし | DA_NOTI_001 |
| E-01 | DA_RECV_004 | 受取完了トースト | DA_RECV_001 |
| E-02 | DA_RECV_005 | 受取完了確認・ES連絡モーダル | DA_RECV_001 |
| E-03 | DA_RECV_006 | 編集内容破棄確認ポップアップ | DA_RECV_001 |
| E-20 | DA_RECV_007 | 受取済みバナー | DA_RECV_003 |
| E-13 | DA_COOL_002 | 配送完了確認・ES連絡ポップアップ | DA_COOL_001 |
| E-14 | DA_COOL_003 | Toast COOL便 hoàn tất | DA_HOME_001 |
| E-15 | DA_COOL_004 | Banner COOL便 mở lại | DA_COOL_001 |
| E-16 | DA_RPTD_003 | ES電話確認ポップアップ | DA_HOME_001 |
| E-17 | DA_RPTD_004 | 報告送信確認モーダル | DA_RPTD_002 |
| E-18 | DA_RPTD_005 | Toast gửi báo cáo sự cố | DA_HOME_001 |
| E-08 | DA_ESDL_007 | スキャン廃棄登録モーダル | DA_ESDL_002 |
| E-09 | DA_ESDL_008 | Banner Step 2 thành công | DA_ESDL_002-05 |
| E-10 | DA_ESDL_009 | スキャン検品登録モーダル | DA_ESDL_003 |
| E-11 | DA_ESDL_010 | 陳列完了確認・ES連絡モーダル | DA_ESDL_003 |
| E-12 | DA_ESDL_011 | Banner ES配送便 hoàn tất | DA_ESDL_006 |
| E-19 | DA_ESDL_012 | Banner Step 3 hoàn tất trưng bày | DA_ESDL_003-06 |

Nguyên tắc: Feature = feature của nhóm Figma chứa màn (E-14 → COOL, E-16..E-18 → RPTD); Seq = nối tiếp số lớn nhất hiện có của feature (HOME 005→006…, RECV 003→004…, COOL 001→002…, RPTD 002→003…, NOTI 002→003, ESDL 006→007…). Không đổi mã màn cũ.

## 2. Đổi tên frame (93 frame)

Frame toast/banner nằm trong frame của màn khác giữ mã màn chứa nó và ghi `chứa <mã>`.

| Nhóm | Figma # | Node | Tên hiện tại | Tên đề xuất | Loại |
|---|---|---|---|---|---|
| 01 | 01-01 | 16422:120841 | DA_AUTHEN_001 | DA_AUTHEN_001 — ログイン [bản có chú thích (?)] | Screen |
| 01 | 01-02 | 20238:149519 | DA_AUTHEN_001 | DA_AUTHEN_001 — ログイン [bản sạch (?); bản trùng #01-01] | Duplicate |
| 02 | 02-01 | 16422:120856 | DA_AUTHEN_002_01 | DA_AUTHEN_002_01 — パスワードリセット ステップ1：ID・メールアドレス [default] | Screen |
| 02 | 02-02 | 16422:120906 | DA_AUTHEN_002_02 | DA_AUTHEN_002_02 — パスワードリセット ステップ2：認証コード [default] | Screen |
| 02 | 02-03 | 16422:120940 | DA_AUTHEN_002_03 | DA_AUTHEN_002_02 — パスワードリセット ステップ2：認証コード [state của 002_02 (theo brief)] | State |
| 02 | 02-04 | 16422:120873 | DA_AUTHEN_002_04 | DA_AUTHEN_002_04 — パスワードリセット ステップ3：新しいパスワード [default] | Screen |
| 02 | 02-05 | 16422:120894 | DA_AUTHEN_002_06 | DA_AUTHEN_002_06 — パスワードリセット完了 [default] | Screen |
| 02 | 02-06 | 20239:150525 | DA_AUTHEN_002_01 | DA_AUTHEN_002_01 — パスワードリセット ステップ1：ID・メールアドレス [bản hàng dưới (y=4165); bản trùng #02-01] | Duplicate |
| 02 | 02-07 | 20239:151452 | DA_AUTHEN_002_02、DA_AUTHEN_002_03 | DA_AUTHEN_002_02 — パスワードリセット ステップ2：認証コード [gộp 002_02 + 002_03 cạnh nhau; bản trùng #02-02,02-03] | Duplicate |
| 02 | 02-08 | 20240:152422 | DA_AUTHEN_002_04 | DA_AUTHEN_002_04 — パスワードリセット ステップ3：新しいパスワード [bản hàng dưới; bản trùng #02-04] | Duplicate |
| 02 | 02-09 | 20240:152572 | DA_AUTHEN_002_06 | DA_AUTHEN_002_06 — パスワードリセット完了 [bản hàng dưới; bản trùng #02-05] | Duplicate |
| 03 | 03-01 | 16892:78274 | DA_HOME_005 | DA_HOME_005 — アカウント [default] | Screen |
| 04 | 04-01 | 15719:120976 | DA_HOME_001 | DA_HOME_001 — ホーム：進捗・3日間スケジュール [master component; component] | Component |
| 04 | 04-02 | 20240:152573 | DA_HOME_001 | DA_HOME_001 — ホーム：進捗・3日間スケジュール [instance; component] | Component |
| 04 | 04-03 | 16892:77185 | DA_HOME_001 - 01 | DA_HOME_008 — 配送予定データなし（1日）/ Empty state 1 ngày trống [1 ngày trống] | State |
| 04 | 04-04 | 16892:77680 | DA_HOME_001 - 02 | DA_HOME_007 — 配送予定なし（SOLちゃん）/ Empty state toàn bộ 3 ngày (SOL ちゃん) [3 ngày trống + SOL ちゃん] | State |
| 04 | 04-05 | 20235:148985 | DA_HOME_001 - 3 | DA_HOME_007 — 配送予定なし（SOLちゃん）/ Empty state toàn bộ 3 ngày (SOL ちゃん) [biến thể -3] | State |
| 04 | 04-06 | 20235:148979 | Frame 2147226373 | DA_HOME_001 — ホーム：進捗・3日間スケジュール [bản trùng #04-01] | Duplicate |
| 04 | 04-07 | 15719:122093 | Trạng thái | DA_HOME_001 — ホーム：進捗・3日間スケジュール [badge trạng thái; component] | Component |
| 05 | 05-02 | 18439:175106 | DA_LIST_001_Kho | DA_LIST_001_Kho — 配送一覧 Tab A: 倉庫受取 [default] | Screen |
| 05 | 05-03 | 18439:174962 | DA_LIST_002_ES | DA_LIST_002_ES — 配送一覧 Tab B: 未配送 [default] | Screen |
| 05 | 05-04 | 18439:175034 | DA_LIST_003_COOL | DA_LIST_003_COOL — 配送一覧 Tab C: 配送完了 [default] | Screen |
| 05 | 05-05 | 20285:178603 | DA_LIST_001_Kho | DA_LIST_001_Kho — 配送一覧 Tab A: 倉庫受取 [annotated; bản trùng #05-02] | Duplicate |
| 05 | 05-06 | 20297:179762 | DA_LIST_002_ES | DA_LIST_002_ES — 配送一覧 Tab B: 未配送 [annotated; bản trùng #05-03] | Duplicate |
| 05 | 05-07 | 20297:179763 | DA_LIST_003_COOL | DA_LIST_003_COOL — 配送一覧 Tab C: 配送完了 [annotated; bản trùng #05-04] | Duplicate |
| 06 | 06-01 | 20276:175611 | DA_HOME_001 | DA_HOME_001 — ホーム：進捗・3日間スケジュール [Home (minh hoạ luồng chuông → thông báo); context] | Context |
| 06 | 06-03 | 20276:175614 | DA_NOTI_001 | DA_NOTI_001 — お知らせ一覧 [default] | Screen |
| 06 | 06-04 | 20276:175647 | DA_NOTI_002 | DA_NOTI_002 — お知らせ詳細 [default] | Screen |
| 07 | 07-01 | 16481:48515 | DA_RECV_001 | DA_RECV_001 — 荷物受取（編集可） [default (0 tick); component] | Component |
| 07 | 07-02 | 16887:76722 | DA_RECV_001 | DA_RECV_001 — 荷物受取（編集可） [tick hết tất cả] | State |
| 07 | 07-03 | 16481:48735 | DA_RECV_001 - 02 | DA_RECV_005 — 受取完了確認・ES連絡モーダル [modal nhận thiếu (chưa kiểm ảnh)] | Popup |
| 07 | 07-04 | 20344:209745 | Pop up | DA_RECV_006 — 編集内容破棄確認ポップアップ [popup huỷ chỉnh sửa] | Popup |
| 07 | 07-05 | 16895:119338 | DA_RECV_001 - 3 | DA_RECV_005 — 受取完了確認・ES連絡モーダル [checkbox đã tick, 一部未受取のまま完了 active] | State |
| 07 | 07-06 | 20262:41179 | DA_RECV_003 | DA_RECV_003 — 荷物受取（閲覧のみ） [chỉ đọc, đã nhận; component] | Component |
| 07 | 07-07 | 18578:34695 | DA_HOME_001 | DA_HOME_001 — ホーム：進捗・3日間スケジュール [có thẻ kho 未受取; context] | Context |
| 07 | 07-08 | 18578:35896 | DA_HOME_001 | DA_HOME_001 — ホーム：進捗・3日間スケジュール [sau khi hoàn tất (nền toast); context] | Context |
| 07 | 07-09 | 16887:112468 | Toast | DA_RECV_004 — 受取完了トースト [toast hoàn tất nhận] | Toast |
| 07 | 07-11 | 16943:78441 | Toast | DA_RECV_004 — 受取完了トースト [toast hoàn tất nhận; bản trùng #07-09] | Duplicate |
| 07 | 07-12 | 19664:153217 | DA_LIST_001_Kho | DA_LIST_001_Kho — 配送一覧 Tab A: 倉庫受取 [tab 倉庫受取; context] | Context |
| 07 | 07-13 | 18578:40940 | DA_HOME_001 | DA_HOME_001 — ホーム：進捗・3日間スケジュール [Home (sau nhận một phần); context] | Context |
| 07 | 07-14 | 18578:41715 | DA_LIST_001_Kho | DA_LIST_001_Kho — 配送一覧 Tab A: 倉庫受取 [tab すべて表示/倉庫受取; context] | Context |
| 08 | 08-01 | 18870:189708 | DA_HOME_001 | DA_HOME_001 — ホーム：進捗・3日間スケジュール [Home, thẻ kho mở rộng; context] | Context |
| 08 | 08-02 | 19057:91246 | DA_RPTD_002-03 | DA_RPTD_003 — ES電話確認ポップアップ [phủ trên Home] | Popup |
| 08 | 08-03 | 18260:101521 | DA_RPTD_001-01 | DA_RPTD_001 — トラブル報告：配達先・倉庫選択 [chưa chọn, hint kho] | Screen |
| 08 | 08-04 | 18870:191330 | DA_RPTD_001-02 | DA_RPTD_001 — トラブル報告：配達先・倉庫選択 [đã chọn 1 → hiện 戻る/次へ] | State |
| 08 | 08-05 | 16422:115223 | DA_RPTD_002-01 | DA_RPTD_002 — トラブル報告：詳細 [mặc định] | Screen |
| 08 | 08-06 | 16659:83144 | DA_RPTD_002-02 | DA_RPTD_002 — トラブル報告：詳細 [chọn 2/3 vận đơn (−), その他 + ô lý do viền đỏ, có ảnh, 送信 active] | State |
| 08 | 08-07 | 16422:115205 | DA_RPTD_002-03 | DA_RPTD_004 — 報告送信確認モーダル [modal xác nhận gửi] | Popup |
| 08 | 08-08 | 18870:190847 | DA_HOME_001 | DA_HOME_001 — ホーム：進捗・3日間スケジュール [Home + toast 「報告を送信しました。」; chứa DA_RPTD_005] | Toast |
| 08 | 08-09 | 18870:193054 | Frame 2147226371 | DA_RECV_001 — 荷物受取（編集可） [荷物受取 (DA_RECV_001) có chuông; context] | Context |
| 08 | 08-10 | 18870:192377 | DA_ESDL_000_0 Normal (Today, not yet shipped) | DA_ESDL_000_0 — ES配送便 基本情報（当日・未配送） [ES配送便 có chuông; context] | Context |
| 08 | 08-11 | 18870:192740 | DA_COOL_001 - 01 Default | DA_COOL_001 — COOL便：配送詳細 [COOL便 default; context] | Context |
| 08 | 08-12 | 19057:91443 | DA_RPTD_002-03 | DA_RPTD_003 — ES電話確認ポップアップ [phủ trên DA_RPTD_002 (header レポート報告)] | Popup |
| 08 | 08-13 | 18870:192895 | DA_RPTD_002-01 | DA_RPTD_002 — トラブル報告：詳細 [bản sao với radio khác] | State |
| 08 | 08-14 | 19057:91230 | Dropdown-Menu | DA_RPTD_002 — トラブル報告：詳細 [menu 写真を撮る / 写真ライブラリ; component] | Component |
| 09 | 09-01 | 18260:100270 | DA_HOME_001 | DA_HOME_001 — ホーム：進捗・3日間スケジュール [context] | Context |
| 09 | 09-02 | 20266:172696 | DA_COOL_001 - 01 Default | DA_COOL_001 — COOL便：配送詳細 [default (chưa tích)] | Screen |
| 09 | 09-03 | 18870:186914 | DA_COOL_001 - 02 check all | DA_COOL_001 — COOL便：配送詳細 [tích hết] | State |
| 09 | 09-04 | 18870:185297 | DA_DLVR_001 - 12 | DA_COOL_001 — COOL便：配送詳細 [tên cũ DA_DLVR_001; bản trùng #09-02] | Duplicate |
| 09 | 09-05 | 18870:187956 | DA_RECV_001 - 4 | DA_COOL_002 — 配送完了確認・ES連絡ポップアップ [checkbox chưa tích / nút disabled] | Popup |
| 09 | 09-06 | 18870:187974 | DA_RECV_001 - 5 | DA_COOL_002 — 配送完了確認・ES連絡ポップアップ [checkbox đã tích / nút active] | Popup |
| 09 | 09-07 | 18870:187485 | DA_HOME_001 | DA_HOME_001 — ホーム：進捗・3日間スケジュール [toast không nút ×; chứa DA_COOL_003] | Toast |
| 09 | 09-08 | 18870:189044 | DA_HOME_001 | DA_HOME_001 — ホーム：進捗・3日間スケジュール [toast có nút ×; chứa DA_COOL_003] | Toast |
| 09 | 09-09 | 18870:188561 | DA_COOL_001 - 03 successly | DA_COOL_001 — COOL便：配送詳細 [đã hoàn tất (chỉ đọc); chứa DA_COOL_004] | Banner |
| 10 | 10-01 | 16422:114580 | DA_HOME_001 | DA_HOME_001 — ホーム：進捗・3日間スケジュール [context] | Context |
| 10 | 10-02 | 16383:114020 | DA_ESDL_000_0 Normal (Today, not yet shipped) | DA_ESDL_000_0 — ES配送便 基本情報（当日・未配送） [default (hôm nay, chưa giao)] | Screen |
| 10 | 10-03 | 19036:18274 | DA_ESDL_000_1 future data(Cannot edit future data) | DA_ESDL_000_1 — ES配送便（未来日・閲覧のみ） [dữ liệu tương lai] | Screen |
| 10 | 10-04 | 19663:152788 | DA_ESDL_000_2 Completed(Editable until 7 days before) | DA_ESDL_000_2 — ES配送便（配送完了） [đã hoàn tất] | Screen |
| 10 | 10-05 | 20266:174078 | DA_ESDL_000_2 Completed(Editable until 7 days before) | DA_ESDL_000_2 — ES配送便（配送完了） [master component bản dài (cuộn); component] | Component |
| 10 | 10-06 | 18645:24837 | DA_ESDL_001-01(default) | DA_ESDL_001 — Step 1 陳列前写真 [default (chưa có ảnh, 続ける disabled)] | Screen |
| 10 | 10-07 | 18645:24838 | Dropdown-Menu | DA_ESDL_001 — Step 1 陳列前写真 [menu nguồn ảnh; component] | Component |
| 10 | 10-08 | 16422:114716 | DA_ESDL_001-02(upload image done) | DA_ESDL_001 — Step 1 陳列前写真 [đã upload (3 thumbnail có ×, loading)] | State |
| 10 | 10-09 | 18058:158268 | DA_ESDL_002-01Check tồn kho (Default) | DA_ESDL_002 — 在庫/廃棄 (Step 2) [default (chưa check, 確認 disabled)] | Screen |
| 10 | 10-10 | 16422:114840 | DA_ESDL_002-02 Scan Bar code tồn kho | DA_ESDL_002 — 在庫/廃棄 (Step 2) [mở camera quét barcode] | State |
| 10 | 10-11 | 18123:165893 | DA_ESDL_002-03  Scan Bar code & input | DA_ESDL_007 — スキャン廃棄登録モーダル [popup sau khi quét (nhập 廃棄数/在庫数)] | Popup |
| 10 | 10-12 | 18260:89828 | DA_ESDL_002-04 Checked | DA_ESDL_002 — 在庫/廃棄 (Step 2) [đã check các dòng (廃棄数 xám, 確認 active)] | State |
| 10 | 10-13 | 18260:90236 | DA_ESDL_002-05 confirm  | DA_ESDL_002-05 — Step 2: 成功結果 [kết quả Step 2 (chứa banner E-09)] | Screen |
| 10 | 10-14 | 16422:114955 | DA_ESDL_003-01 Step 3 default | DA_ESDL_003 — 陳列 (検品) (Step 3) [default (確認 disabled)] | Screen |
| 10 | 10-15 | 18252:82725 | DA_ESDL_003-02 Step 3 Scan | DA_ESDL_003 — 陳列 (検品) (Step 3) [mở camera quét] | State |
| 10 | 10-16 | 18252:82730 | DA_ESDL_003-03 Step 3 popup after Scan | DA_ESDL_009 — スキャン検品登録モーダル [popup sau quét (実際数)] | Popup |
| 10 | 10-17 | 17000:119128 | DA_ESDL_003-04 have diff confirm popup | DA_ESDL_010 — 陳列完了確認・ES連絡モーダル [popup khác biệt/未確認] | Popup |
| 10 | 10-18 | 18578:45802 | DA_ESDL_003-05 have diff confirm popup | DA_ESDL_010 — 陳列完了確認・ES連絡モーダル [biến thể popup khác biệt; bản trùng #10-17] | Duplicate |
| 10 | 10-19 | 16422:115045 | DA_ESDL_003-06 step 3 confirm | DA_ESDL_003-06 — Step 3: 成功結果（差異表） [kết quả Step 3 (chứa banner E-19)] | Screen |
| 10 | 10-20 | 16422:115333 | DA_ESDL_004-01 default | DA_ESDL_004 — Step 4 陳列後写真 [default] | Screen |
| 10 | 10-21 | 16422:114757 | DA_ESDL_004-02 sau khi up ảnh | DA_ESDL_004 — Step 4 陳列後写真 [đã upload ảnh] | State |
| 10 | 10-22 | 16422:115605 | DA_ESDL_005-01 nhập tiền mặt thu | DA_ESDL_005 — Step 5 集金登録 [nhập tiền thu] | Screen |
| 10 | 10-23 | 18578:42560 | DA_ESDL_006-01 Sau khi hoàn thành-tab thông tin cơ bản | DA_ESDL_006 — 完了後：陳列情報タブ・駐車報告 [tab 基本情報 sau hoàn tất (chứa banner E-12)] | Screen |
| 10 | 10-24 | 18578:44771 | DA_ESDL_006-02 Sau khi hoàn thành-tab nộp tiền gửi xe(mode view) | DA_ESDL_006 — 完了後：陳列情報タブ・駐車報告 [tab 駐車報告 (view)] | State |
| 10 | 10-25 | 18578:44248 | DA_ESDL_006-03 Sau khi hoàn thành-tab nộp tiền gửi xe(mode edit) | DA_ESDL_006 — 完了後：陳列情報タブ・駐車報告 [tab 駐車報告 (edit)] | State |
| 10 | 10-26 | 18578:43759 | DA_ESDL_006-04 Sau khi hoàn thành-tab view thông tin step 1 | DA_ESDL_006 — 完了後：陳列情報タブ・駐車報告 [tab 陳列情報 step 1] | State |
| 10 | 10-27 | 18578:46215 | DA_ESDL_006-05 Sau khi hoàn thành-tab view thông tin step 2 | DA_ESDL_006 — 完了後：陳列情報タブ・駐車報告 [tab 陳列情報 step 2] | State |
| 10 | 10-28 | 18578:46758 | DA_ESDL_006-06 Sau khi hoàn thành-tab view thông tin step 3 | DA_ESDL_006 — 完了後：陳列情報タブ・駐車報告 [tab 陳列情報 step 3] | State |
| 10 | 10-29 | 18578:47594 | DA_ESDL_006-08 Sau khi hoàn thành-tab view thông tin step 5 | DA_ESDL_006 — 完了後：陳列情報タブ・駐車報告 [tab 陳列情報 step 5] | State |

## 3. Frame chưa gán được mã

Không còn (93/93 đã gán). 2 frame DA_HOME_001 context (09-01, 10-01) gán DA_HOME_001.

## 4. Ghi chú
- Chưa ghi vào Figma: `use_figma` đang hết hạn mức; cần PM/BrSE chốt mã mục 1 trước.
- Đổi mã E-xx kéo theo STALE: SPEC, Basic Design (10 file), test case (10 file), Danh sách màn hình, Output 1/2. Chỉ đồng bộ sau khi mã được chốt.
- Frame đặt tên nhầm đã sửa theo nội dung: `DA_RPTD_002-03` (08-02 → popup gọi ES, 08-07 → popup xác nhận gửi); `DA_DLVR_001 - 12` (tên cũ, OQ-32) → mã COOL.
