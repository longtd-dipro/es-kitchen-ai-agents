# Kiểm kê `demo_ok` — ドライバーアプリ (DA_*)

Ngày: 2026-10-08. Đối chiếu từng `demo_ok` với CODE hiện tại (`app/driver`, `lib/driver`, `lib/domain/driverAuth.ts`, `lib/auth`, `lib/server/session.ts`) và 台帳 (F 2026-10-07/08, K, L, M). Code ở HEAD của branch này (đã merge `claude/dreamy-maxwell-io91fk`).

Phân loại:
- **a**: code nay đã đáp ứng quyết định → bỏ `demo_ok`.
- **b**: code vẫn trái quyết định → giữ, lý do ghi rõ code đang làm gì / việc code cần làm.
- **c**: không chụp được với seed hiện tại → giữ, ghi cần seed/nối gì.
- **d**: lý do cũ sai hoặc mơ hồ → đã viết lại.

Mỗi dòng = 1 `demo_ok` (cùng mục xuất hiện ở nhiều view thì gộp, cột View liệt kê các view). Đã xác minh bằng đọc code và chạy thử (Playwright, cổng 3034) với các chỗ nghi ngờ: nút 編集 của 駐車報告 (chỉ hiện sau 配送完了), 受取 sau khi một tài xế khác đã hoàn tất, ES_TEL.

| # | File | No. | Mục | View | Loại | Code đang làm / việc code cần làm |
|---|---|---|---|---|---|---|
| 1 | DA_AUTH | 3 | パスワード | 001,002,003 | b | Đăng nhập chỉ kiểm tra mật khẩu không rỗng khi tài xế chưa đặt mật khẩu (`passwordOk`: `d.passwordHash ? ... : !!pw`). Quy tắc 8〜64 chỉ kiểm khi đặt lại. Việc code: (tuỳ) bắt tài xế seed có mật khẩu hợp lệ; quyết định chưa yêu cầu kiểm quy tắc lúc đăng nhập. |
| 2 | DA_AUTH | 5 | パスワードを忘れた方 | 001 | b | UI: liên kết「パスワードを忘れた方はこちら」khoảng 21px (cần ≥44px). Việc code/UI (役割レビュー #13). |
| 3 | DA_AUTH | 7 | 未送信が残っているときの案内 | 001 | b | Màn đăng nhập không có W312 (`app/driver/login/page.tsx` không đọc hàng đợi). Việc code: hiện W312 khi còn 未送信 trên thiết bị (台帳 F 2026-10-07). |
| 4 | DA_AUTH | 4 | エラーの表示 | 003,004,005 | b | Câu lỗi trong code: `checkLogin`「ログインIDとパスワードを入力してください。」, `area.ts`「ログインIDまたはパスワードが正しくありません。」「このアカウントは利用できません（…）」. Việc code: đổi theo E01・E520・E431. |
| 5 | DA_AUTH | 8 | ログインの期限切れ | 006 | b | Hạn 1 ngày đã có (Cookie `session.ts` + localStorage `keepLogin.ts`) nhưng không tạo được hết hạn khi chụp; khi hết hạn code chỉ toast「ログインし直してください」(DriverShell). Việc code: dùng câu E525. |
| 6 | DA_AUTH | 4 | ログイン画面に戻る | 007 | b | UI: liên kết「ログイン画面に戻る」khoảng 21px (cần ≥44px). Việc code/UI (役割レビュー #13). |
| 7 | DA_AUTH | 12 | 完了 | 014 | b | Màn ④ vẫn là đoạn dài của Figma「現在は正常にログイン・ご利用いただけます…」(`password/page.tsx`). Việc code: dùng câu S401. |
| 8 | DA_AUTH | 4 | マニュアル | 015 | b | Nút マニュアル mở `/driver/manuals` (5 bài cố định trong `seed.ts MANUALS`). Việc code: mở link URL (Q-DW06 A), bỏ màn danh sách/chi tiết. |
| 9 | DA_AUTH | 5 | ログアウト | 015,016 | b | ログアウト: `nav.guard` chỉ hỏi khi có thay đổi chưa lưu, không có xác nhận khi còn 未送信. Việc code: modal Q317 (台帳 F 2026-10-07). |
| 10 | DA_AUTH | 6 | ログアウトの確認（未送信あり） | 016 | b | Modal Q317 chưa có trong code nên không chụp được hình. Việc code: thêm modal xác nhận đăng xuất khi còn 未送信. |
| 11 | DA_COOL | 1 | 上の帯 | 001,005 | b | Sau khi hoàn tất tiêu đề thành「荷物受取」(`cool/[id]/page.tsx`: `done ? '荷物受取' : 'COOL便'`). Việc code: giữ「COOL便」. |
| 12 | DA_COOL | 1.2 | トラブルを報告 | 001,005 | b | Nút báo sự cố vẫn hiện sau hoàn tất (TopBar `trouble`). Quyết định (台帳 F 2026-10-08, Q-DW09 đã chốt): chỉ báo trước hoàn tất; vận hành đóng đơn thành「配送できなかった」(phía vận hành: 運営D). Việc code: ẩn nút sau hoàn tất. |
| 13 | DA_COOL | 5 | タブ（基本情報・駐車報告） | 001,007 | b | COOL便 không có tab và không có 駐車報告. Việc code: thêm tab 基本情報・駐車報告 (台帳 F 2026-10-07: cả ES配送便 và COOL便). |
| 14 | DA_COOL | 8.1 | 箱・冷蔵・冷凍の数 | 001 | b | Hiển thị 冷蔵/冷凍 là「品」(`cool/[id]/page.tsx`). Việc code: đổi「個」(H19). |
| 15 | DA_COOL | 10 | 到着予定のカード（削除） | 001 | b | Vẫn có thẻ 到着予定 (`EtaCard`, `!done`). Việc code: xoá (台帳 F 2026-10-07). |
| 16 | DA_COOL | 7 | 資料（委託業者向け） | 002 | c | Tài liệu luôn rỗng (`docs: []` trong `fromDomain.ts`, chưa nối master) và mục ẩn với tài xế nội bộ. Cần: nối master 地点の資料 + seed COOL do tài xế 委託 chở. |
| 17 | DA_COOL | 13.2 | ESへ電話する | 003 | b | TelButton chỉ toast số (`parts.tsx`), không gọi. Việc code: dùng `tel:` (H11). |
| 18 | DA_COOL | 9 | 修正の案内 | 005 | b | `saveCoolEdit` không kiểm hạn 7 ngày và không kiểm sự cố (H8). Việc code: thêm kiểm tra như ES配送便 (E439/E440). |
| 19 | DA_COOL | 14 | 駐車報告 | 007 | b | COOL便 chưa có 駐車報告 (hình 007 chưa chụp được). Việc code: thêm tab 駐車報告. |
| 20 | DA_COOL | 12.1 | 前に納品する理由 | 008 | b | Lý do 納品日前 giới hạn 200 ký tự (`EarlyModal maxLength=200`). Việc code: nâng lên 500. |
| 21 | DA_ESDL | 1.2 | トラブルを報告 | 001,002,005,008,011,013,016,018,021,023,024 | b | Nút báo sự cố vẫn hiện sau hoàn tất và báo xong thì không sửa được nữa. Quyết định (台帳 F 2026-10-08, Q-DW09 đã chốt): chỉ trước hoàn tất. Việc code: ẩn nút sau hoàn tất. |
| 22 | DA_ESDL | 7 | 資料（委託業者向け） | 001,004 | c | 資料 luôn rỗng (`docs: []`, H10). Cần: nối master 拠点・中継先 để có trạng thái có tài liệu; tài xế 委託 (DR00041) mới thấy mục. |
| 23 | DA_ESDL | 8.1 | 箱・冷蔵・冷凍の数 | 001 | b | 冷蔵・冷凍 hiển thị「品」(`es/[id]/page.tsx`). Việc code: đổi「個」(H19). |
| 24 | DA_ESDL | 13 | 到着予定のカード（削除） | 001 | b | Vẫn có thẻ 到着予定 (`EtaCard`, `shareEta`, câu cố định ở chi tiết vận hành). Việc code: xoá (台帳 F 2026-10-07). |
| 25 | DA_ESDL | 12.1 | 前に納品する理由 | 003 | b | Lý do 納品日前 giới hạn 200 ký tự. Việc code: 500 (tiêu chuẩn ghi chú). |
| 26 | DA_ESDL | 7.1 | 資料を開く | 004 | c | Không có tài liệu nên không chụp được nút 開く; DEMO chỉ toast「開きました（デモ）」, bản thật toast「まだつないでいません」. Cần: nối master tài liệu. |
| 27 | DA_ESDL | 9 | 駐車報告 | 005,007 | b | `savePark`: hạn = 納品日+7 ngày (`area.ts` 495), trần 999,999 yên. Quyết định: 完了から7日・trần theo chuẩn chung 999,999,999. Việc code: sửa 2 điểm. |
| 28 | DA_ESDL | 9.3 | 駐車料金（税込） | 005,006,007 | b | Ô nhập 駐車料金 cắt ở 9 chữ số (`digits`), server trần 999,999, lỗi hiện toast thay vì inline (H17). Việc code: lỗi inline dưới ô. |
| 29 | DA_ESDL | 9.1 | 編集 | 007 | d | Đã viết lại: code chỉ hiện icon sửa sau 配送完了; trước đó vẫn ô nhập + nút 保存. Hình nay chụp ở trạng thái sau hoàn tất (view 007 hoàn tất DL-261013-0002). Việc code: icon sửa sau khi lưu, hạn 7 ngày kể từ ngày giao. |
| 30 | DA_ESDL | 5.2 | ファイル選択 | 011,012,021,022 | b | Ảnh tối đa 6 (`addPhotos`), chỉ `accept=image/*`, không kiểm dung lượng. Quyết định: 20 ảnh・JPG/PNG/HEIC・5MB (H1). Nút「サンプル写真を追加」chỉ có ở DEMO. |
| 31 | DA_ESDL | 5.3 | サンプル写真を追加 | 011,021 | b | Nút sample photo chỉ là bộ phận DEMO, ngoài phạm vi thiết kế (dev không làm). |
| 32 | DA_ESDL | 6 | ご不明な点の案内 | 011,021 | b | Số khẩn cấp 050-5784-2777 chỉ là chữ, không phải tel:, và xuống dòng giữa dãy số. Việc code: liên kết tel:, không ngắt dòng (役割レビュー #15). |
| 33 | DA_ESDL | 5.1 | 写真の削除 | 012,022 | b | UI: nút × của ảnh khoảng 14px, không có xác nhận/hoàn tác. Việc code/UI: ≥44px + hoàn tác (役割レビュー #13). |
| 34 | DA_ESDL | 5 | 商品の検索 | 013,014,018 | b | Tìm kiếm trong code lọc ngay khi gõ; 台帳 M-1 là lọc sau khi bấm 検索/Enter. Data đã viết theo 台帳; ngoại lệ mobile chờ hong (役割レビュー Q10). Việc code: lọc sau Enter, hoặc 台帳 ghi ngoại lệ. |
| 35 | DA_ESDL | 7 | 次回納品日 | 013 | b | Câu「※次回納品日 10/16（金）」là chuỗi cố định trong `es/[id]/page.tsx` (H15). Việc code: lấy từ dữ liệu. |
| 36 | DA_ESDL | 9.1 | 確認（チェック） | 013,014 | b | UI: ô check xác nhận khoảng 28px (nhỏ hơn ＋− 44px). Việc code/UI (役割レビュー #13). |
| 37 | DA_ESDL | 9.3 | 廃棄数（△） | 013 | b | Nút ＋ của số hủy trong code chỉ tới tồn lý thuyết (`Math.min(r.th, …)`); data đã thống nhất 0〜9,999 như DA_STCK (台帳 F 2026-10-07). Việc code: bỏ trần tồn lý thuyết. Open (hong): hủy nhập ở 2 nơi (② và DA_STCK) nên hiển thị/chặn trùng thế nào (#8). |
| 38 | DA_ESDL | 5 | カメラ | 016,017 | b | Camera/barcode chưa nối: bấm ảnh thì chọn ngẫu nhiên 1 dòng +1 (H14); không có thêm sản phẩm ngoài danh sách. |
| 39 | DA_ESDL | 6 | バーコードスキャン | 018 | b | Quét ở bước ③ chỉ xác nhận dòng chưa check đầu tiên (mô phỏng, H14). |
| 40 | DA_ESDL | 8.1 | 確認（チェック） | 018 | b | UI: ô check xác nhận khoảng 28px. Việc code/UI (役割レビュー #13). |
| 41 | DA_ESDL | 11 | 確認のモーダル（差異・未確認あり） | 019 | d | Đã viết lại: toast「050-5784-2777 へお電話ください…」, không gọi (H11). Số đã thống nhất 050-5784-2777 (`ES_TEL`) nên bỏ chữ「暫定」. Việc code: `tel:`. |
| 42 | DA_ESDL | 5 | 実集金額 | 023,025 | b | 「完了」luôn bấm được, thiếu 実集金額 thì server từ chối và toast (H18・H17). Việc code: E01 inline trước khi hoàn tất. |
| 43 | DA_ESDL | 5.1 | 差額の警告 | 023 | b | Cảnh báo chênh lệch tiền hiện chữ đỏ (class `err`). Quyết định: cảnh báo vàng, vẫn đăng ký được. Việc code: đổi màu. |
| 44 | DA_HOME | 2.6 | マニュアル | 001,005 | b | マニュアル mở `/driver/manuals`. Việc code: mở link (Q-DW06 A). |
| 45 | DA_HOME | 4.3 | 配送のカード | 001 | b | Thẻ vẫn hiện「到着予定 …（共有済み）」(`parts.tsx` DelCard) và đơn vị「食」thay vì「個」. Việc code: bỏ 到着予定; đổi đơn vị 箱 n・冷蔵 n個・冷凍 n個. |
| 46 | DA_HOME | 7 | 下のタブ | 001,005 | b | UI: tab dưới「廃棄・棚卸し」xuống 2 dòng và rớt chữ. Việc code/UI: rút ngắn tên/giảm cỡ chữ (役割レビュー #14). |
| 47 | DA_HOME | 4.4 | トラブルの印 | 004 | c | Trạng thái「トラブル解決済み」cần vận hành ghi nhận giải quyết; seed chỉ có 1 sự cố đã giải quyết ở ngày khác (`seed/delivery.ts` osakaSep). Cần: seed có sự cố giải quyết trong ngày chụp (hoặc gọi `resolveTrouble` của ops). |
| 48 | DA_HOME | 3 | 配送予定一覧 | 005 | b | Không có câu I313 khi trống (`app/driver/page.tsx`). Việc code: thêm câu. |
| 49 | DA_HOME | 8 | オフライン・未送信の帯 | 007 | b | Hàng đợi 未送信 là `driver.outbox` phía server (`area.ts flushOut`), không phải IndexedDB trên trình duyệt. Việc code: IndexedDB (台帳 F 2026-10-07, 受付簿 No.292). |
| 50 | DA_HOME | 2.1 | 期間 | 008,009,010 | b | Tiêu đề chỉ hiện `weekRange(today)` (tuần), không bấm được, chỉ đọc dữ liệu hôm nay (`list/page.tsx`). Việc code: chọn kỳ (tối đa 90 ngày trước). |
| 51 | DA_HOME | 5 | 検索 | 008,009,010,013 | b | Tìm kiếm lọc ngay khi gõ trong code, 台帳 M-1 là sau Enter. Như ESDL 5 (役割レビュー #10・Q10). |
| 52 | DA_HOME | 6 | 並べ替え | 008,009,010 | b | Không có thao tác sắp xếp. Thứ tự mặc định theo 台帳 F; sắp xếp theo giờ nhận (Q-DW14) chờ hong xác nhận. |
| 53 | DA_HOME | 7.1 | 受取地点のカード | 008,009,010 | b | Giống HOME 4.3: DelCard còn 到着予定 và「食」. |
| 54 | DA_HOME | 8 | ページ送り | 008,009,010 | b | Danh sách hiện toàn bộ, không phân trang. Việc code: thêm khi có chọn kỳ (1 trang 10 mục theo 台帳 F). |
| 55 | DA_HOME | 9 | 下のタブ | 008 | b | UI: tab dưới「廃棄・棚卸し」xuống 2 dòng (như HOME 7 ở view 001). |
| 56 | DA_HOME | 7 | 0件の表示 | 013 | b | Câu trống「該当する配送はありません。」/「該当する受取地点はありません。」. Việc code: dùng I01「表示するデータがありません。」. |
| 57 | DA_HOME | 2.1 | 期間 | 014 | b | Chưa có màn chọn kỳ (chỉ hiển thị); hình 014 là vị trí tiêu đề hiện tại. Việc code: làm màn chọn kỳ. |
| 58 | DA_MANU | 1 | マニュアル（ホームのボタン） | 001 | b | Code mở danh sách/chi tiết cố định `/driver/manuals`. Việc code: nút mở link (Q-DW06 A), bỏ 2 màn. |
| 59 | DA_MANU | 2 | マニュアル（アカウントのボタン） | 002 | b | Như MANU 1 (view 002 chụp màn chi tiết cũ). |
| 60 | DA_MANU | 3 | ボタンを出さない | 003 | c | Không có màn cài đặt/URL trong seed; code luôn hiện nút. Cần: biến cấu hình URL manual (trống thì ẩn nút). |
| 61 | DA_NOTI | 2 | お知らせの一覧 | 001 | b | Code trộn thông báo tự động (phân công・đổi ngày giao) (`newsOf`: announcements + inbox) và không phân trang. Quyết định Q-DW14 chờ hong. |
| 62 | DA_NOTI | 4 | ページ送り | 001 | b | Không phân trang, hiện toàn bộ. Việc code: 10 mục/trang (Q-DW14 推奨, chờ hong). |
| 63 | DA_NOTI | 2 | お知らせの一覧 | 002 | c | Mọi tài xế seed đều có ≥1 thông báo nên không chụp được 0 mục; khi 0 mục code chỉ hiện tiêu đề, không có câu. Cần: tài xế seed không có thông báo. |
| 64 | DA_RECV | 3 | 受取地点の札 | 001,005,009,011 | b | Tổng ở thẻ「社・箱・食・食」(`PtNums`). Việc code: 冷蔵・冷凍 đơn vị「個」(H19). |
| 65 | DA_RECV | 3.4 | 電話番号・コピー | 001,009 | b | UI: nút「コピー」khoảng 23px. Việc code/UI (役割レビュー #13). |
| 66 | DA_RECV | 8 | 検索 | 001,002,009 | b | Tìm kiếm lọc ngay khi gõ; 台帳 M-1 là sau Enter (役割レビュー #10・Q10). |
| 67 | DA_RECV | 9 | 配送ごとの束 | 001,005,006,009,011 | b | Tiêu đề từng nhóm dùng「食」(`Nums`). Việc code: 「個」(H19). |
| 68 | DA_RECV | 13 | 0件の表示 | 002 | b | Câu trống「未確認の荷物はありません。」khác I01. Cần quyết: dùng I01 hay câu riêng. |
| 69 | DA_RECV | 12.2 | ESへ電話する | 003 | b | Gọi ES chỉ toast số, không gọi (TelButton, H11). |
| 70 | DA_RECV | 4 | 資料（委託業者向け） | 010 | c | Tài liệu luôn rỗng (`docs: []`, H10); chỉ tài xế 委託 ở 中継先 thấy mục. Cần: nối master 中継先. |
| 71 | DA_RPTD | 2 | 検索 | 001,002 | b | Câu 0 mục「該当なし」(`trouble/page.tsx`). Việc code: dùng I01. |
| 72 | DA_RPTD | 5 | 配送（納品先） | 001,002 | b | Danh sách đối tượng gồm cả đơn đã hoàn tất. Quyết định (台帳 F 2026-10-08, Q-DW09 đã chốt): chỉ trước hoàn tất. Việc code: ẩn nút sau hoàn tất. |
| 73 | DA_RPTD | 3.2 | 影響を受けた送り状番号 | 004,006 | b | Thiếu mục thì chỉ khoá nút「送信」, không có câu lỗi (H17). Việc code: E02 inline. |
| 74 | DA_RPTD | 4 | トラブル内容 | 004,005,006,007 | b | Chọn「交通渋滞・事故」thì cần hiện nút gọi ES (tel: 050-5784-2777); code không có hướng dẫn gọi. Việc code (役割レビュー #15). |
| 75 | DA_RPTD | 5 | 画像 | 004,008 | b | Ảnh tối đa 6 và chỉ đếm số lượng (không lưu nội dung, H1・H13). Quyết định 20 ảnh・5MB. Nút sample chỉ DEMO. |
| 76 | DA_RPTD | 10 | 備考 | 004,007 | b | Ghi chú tối đa 1000 ký tự (`maxLength=1000`, `checkTrouble`); trống thì chỉ khoá nút, không có lỗi (H2・H17). Việc code: 500. |
| 77 | DA_STCK | 4 | 商品の検索 | 001,003 | b | Khi 0 mục chỉ hiện bảng rỗng, không có câu; tìm kiếm chỉ theo tên (không theo mã). |
| 78 | DA_STCK | 5 | バーコードスキャン | 001 | b | Quét chọn ngẫu nhiên 1 dòng +1 (H14); không thêm sản phẩm ngoài danh sách. |
| 79 | DA_STCK | 6 | 商品の表（廃棄） | 001,003 | b | UI: cột tên sản phẩm ~50px nên tên xuống 5〜9 dòng. Việc code/UI: tên ở dòng 1, số lượng・lý do ở dòng 2 (役割レビュー #14). |
| 80 | DA_STCK | 7 | 廃棄を登録 | 001,002,004,009,010 | b | Lỗi server (không có nơi giao・số không hợp lệ) hiện toast (`useRun`→`toastError`) thay vì inline (H17). |
| 81 | DA_STCK | 9 | スキャンで数える | 005 | b | Như STCK 5: quét ngẫu nhiên ở tab 棚卸し (`iscan`). |
| 82 | DA_STCK | 10.2 | 実在庫 | 005,006 | b | Server vẫn chặn khi 実在庫 > 理論在庫 (`area.ts sendInventory`: `r.ac > r.th` → 400). Quyết định hong 2026-10-07: không chặn. Việc code: bỏ điều kiện. |
| 83 | DA_STCK | 13 | 棚卸なしの拠点 | 007 | c | Seed không có chi nhánh `noStockCheck` nên không chụp được. Code hiện bảng rỗng + nút gửi, I318 không hiện; gửi thì toast 409. Cần: seed 1 拠点 棚卸なし (+ code hiện I318). |

## Việc code còn phải sửa (backlog, gom theo màn; loại b = sửa code, c = cần seed/nối dữ liệu)

### DA_AUTH
- [b] No.3 パスワード (view 001,002,003): Đăng nhập chỉ kiểm tra mật khẩu không rỗng khi tài xế chưa đặt mật khẩu (`passwordOk`: `d.passwordHash ? ... : !!pw`). Quy tắc 8〜64 chỉ kiểm khi đặt lại. Việc code: (tuỳ) bắt tài xế seed có mật khẩu hợp lệ; quyết định chưa yêu cầu kiểm quy tắc lúc đăng nhập.
- [b] No.5 パスワードを忘れた方 (view 001): UI: liên kết「パスワードを忘れた方はこちら」khoảng 21px (cần ≥44px). Việc code/UI (役割レビュー #13).
- [b] No.7 未送信が残っているときの案内 (view 001): Màn đăng nhập không có W312 (`app/driver/login/page.tsx` không đọc hàng đợi). Việc code: hiện W312 khi còn 未送信 trên thiết bị (台帳 F 2026-10-07).
- [b] No.4 エラーの表示 (view 003,004,005): Câu lỗi trong code: `checkLogin`「ログインIDとパスワードを入力してください。」, `area.ts`「ログインIDまたはパスワードが正しくありません。」「このアカウントは利用できません（…）」. Việc code: đổi theo E01・E520・E431.
- [b] No.8 ログインの期限切れ (view 006): Hạn 1 ngày đã có (Cookie `session.ts` + localStorage `keepLogin.ts`) nhưng không tạo được hết hạn khi chụp; khi hết hạn code chỉ toast「ログインし直してください」(DriverShell). Việc code: dùng câu E525.
- [b] No.4 ログイン画面に戻る (view 007): UI: liên kết「ログイン画面に戻る」khoảng 21px (cần ≥44px). Việc code/UI (役割レビュー #13).
- [b] No.12 完了 (view 014): Màn ④ vẫn là đoạn dài của Figma「現在は正常にログイン・ご利用いただけます…」(`password/page.tsx`). Việc code: dùng câu S401.
- [b] No.4 マニュアル (view 015): Nút マニュアル mở `/driver/manuals` (5 bài cố định trong `seed.ts MANUALS`). Việc code: mở link URL (Q-DW06 A), bỏ màn danh sách/chi tiết.
- [b] No.5 ログアウト (view 015,016): ログアウト: `nav.guard` chỉ hỏi khi có thay đổi chưa lưu, không có xác nhận khi còn 未送信. Việc code: modal Q317 (台帳 F 2026-10-07).
- [b] No.6 ログアウトの確認（未送信あり） (view 016): Modal Q317 chưa có trong code nên không chụp được hình. Việc code: thêm modal xác nhận đăng xuất khi còn 未送信.

### DA_COOL
- [b] No.1 上の帯 (view 001,005): Sau khi hoàn tất tiêu đề thành「荷物受取」(`cool/[id]/page.tsx`: `done ? '荷物受取' : 'COOL便'`). Việc code: giữ「COOL便」.
- [b] No.1.2 トラブルを報告 (view 001,005): Nút báo sự cố vẫn hiện sau hoàn tất (TopBar `trouble`). Quyết định (台帳 F 2026-10-08, Q-DW09 đã chốt): chỉ báo trước hoàn tất; vận hành đóng đơn thành「配送できなかった」(phía vận hành: 運営D). Việc code: ẩn nút sau hoàn tất.
- [b] No.5 タブ（基本情報・駐車報告） (view 001,007): COOL便 không có tab và không có 駐車報告. Việc code: thêm tab 基本情報・駐車報告 (台帳 F 2026-10-07: cả ES配送便 và COOL便).
- [b] No.8.1 箱・冷蔵・冷凍の数 (view 001): Hiển thị 冷蔵/冷凍 là「品」(`cool/[id]/page.tsx`). Việc code: đổi「個」(H19).
- [b] No.10 到着予定のカード（削除） (view 001): Vẫn có thẻ 到着予定 (`EtaCard`, `!done`). Việc code: xoá (台帳 F 2026-10-07).
- [c] No.7 資料（委託業者向け） (view 002): Tài liệu luôn rỗng (`docs: []` trong `fromDomain.ts`, chưa nối master) và mục ẩn với tài xế nội bộ. Cần: nối master 地点の資料 + seed COOL do tài xế 委託 chở.
- [b] No.13.2 ESへ電話する (view 003): TelButton chỉ toast số (`parts.tsx`), không gọi. Việc code: dùng `tel:` (H11).
- [b] No.9 修正の案内 (view 005): `saveCoolEdit` không kiểm hạn 7 ngày và không kiểm sự cố (H8). Việc code: thêm kiểm tra như ES配送便 (E439/E440).
- [b] No.14 駐車報告 (view 007): COOL便 chưa có 駐車報告 (hình 007 chưa chụp được). Việc code: thêm tab 駐車報告.
- [b] No.12.1 前に納品する理由 (view 008): Lý do 納品日前 giới hạn 200 ký tự (`EarlyModal maxLength=200`). Việc code: nâng lên 500.

### DA_ESDL
- [b] No.1.2 トラブルを報告 (view 001,002,005,008,011,013,016,018,021,023,024): Nút báo sự cố vẫn hiện sau hoàn tất và báo xong thì không sửa được nữa. Quyết định (台帳 F 2026-10-08, Q-DW09 đã chốt): chỉ trước hoàn tất. Việc code: ẩn nút sau hoàn tất.
- [c] No.7 資料（委託業者向け） (view 001,004): 資料 luôn rỗng (`docs: []`, H10). Cần: nối master 拠点・中継先 để có trạng thái có tài liệu; tài xế 委託 (DR00041) mới thấy mục.
- [b] No.8.1 箱・冷蔵・冷凍の数 (view 001): 冷蔵・冷凍 hiển thị「品」(`es/[id]/page.tsx`). Việc code: đổi「個」(H19).
- [b] No.13 到着予定のカード（削除） (view 001): Vẫn có thẻ 到着予定 (`EtaCard`, `shareEta`, câu cố định ở chi tiết vận hành). Việc code: xoá (台帳 F 2026-10-07).
- [b] No.12.1 前に納品する理由 (view 003): Lý do 納品日前 giới hạn 200 ký tự. Việc code: 500 (tiêu chuẩn ghi chú).
- [c] No.7.1 資料を開く (view 004): Không có tài liệu nên không chụp được nút 開く; DEMO chỉ toast「開きました（デモ）」, bản thật toast「まだつないでいません」. Cần: nối master tài liệu.
- [b] No.9 駐車報告 (view 005,007): `savePark`: hạn = 納品日+7 ngày (`area.ts` 495), trần 999,999 yên. Quyết định: 完了から7日・trần theo chuẩn chung 999,999,999. Việc code: sửa 2 điểm.
- [b] No.9.3 駐車料金（税込） (view 005,006,007): Ô nhập 駐車料金 cắt ở 9 chữ số (`digits`), server trần 999,999, lỗi hiện toast thay vì inline (H17). Việc code: lỗi inline dưới ô.
- [d] No.9.1 編集 (view 007): Đã viết lại: code chỉ hiện icon sửa sau 配送完了; trước đó vẫn ô nhập + nút 保存. Hình nay chụp ở trạng thái sau hoàn tất (view 007 hoàn tất DL-261013-0002). Việc code: icon sửa sau khi lưu, hạn 7 ngày kể từ ngày giao.
- [b] No.5.2 ファイル選択 (view 011,012,021,022): Ảnh tối đa 6 (`addPhotos`), chỉ `accept=image/*`, không kiểm dung lượng. Quyết định: 20 ảnh・JPG/PNG/HEIC・5MB (H1). Nút「サンプル写真を追加」chỉ có ở DEMO.
- [b] No.5.3 サンプル写真を追加 (view 011,021): Nút sample photo chỉ là bộ phận DEMO, ngoài phạm vi thiết kế (dev không làm).
- [b] No.6 ご不明な点の案内 (view 011,021): Số khẩn cấp 050-5784-2777 chỉ là chữ, không phải tel:, và xuống dòng giữa dãy số. Việc code: liên kết tel:, không ngắt dòng (役割レビュー #15).
- [b] No.5.1 写真の削除 (view 012,022): UI: nút × của ảnh khoảng 14px, không có xác nhận/hoàn tác. Việc code/UI: ≥44px + hoàn tác (役割レビュー #13).
- [b] No.5 商品の検索 (view 013,014,018): Tìm kiếm trong code lọc ngay khi gõ; 台帳 M-1 là lọc sau khi bấm 検索/Enter. Data đã viết theo 台帳; ngoại lệ mobile chờ hong (役割レビュー Q10). Việc code: lọc sau Enter, hoặc 台帳 ghi ngoại lệ.
- [b] No.7 次回納品日 (view 013): Câu「※次回納品日 10/16（金）」là chuỗi cố định trong `es/[id]/page.tsx` (H15). Việc code: lấy từ dữ liệu.
- [b] No.9.1 確認（チェック） (view 013,014): UI: ô check xác nhận khoảng 28px (nhỏ hơn ＋− 44px). Việc code/UI (役割レビュー #13).
- [b] No.9.3 廃棄数（△） (view 013): Nút ＋ của số hủy trong code chỉ tới tồn lý thuyết (`Math.min(r.th, …)`); data đã thống nhất 0〜9,999 như DA_STCK (台帳 F 2026-10-07). Việc code: bỏ trần tồn lý thuyết. Open (hong): hủy nhập ở 2 nơi (② và DA_STCK) nên hiển thị/chặn trùng thế nào (#8).
- [b] No.5 カメラ (view 016,017): Camera/barcode chưa nối: bấm ảnh thì chọn ngẫu nhiên 1 dòng +1 (H14); không có thêm sản phẩm ngoài danh sách.
- [b] No.6 バーコードスキャン (view 018): Quét ở bước ③ chỉ xác nhận dòng chưa check đầu tiên (mô phỏng, H14).
- [b] No.8.1 確認（チェック） (view 018): UI: ô check xác nhận khoảng 28px. Việc code/UI (役割レビュー #13).
- [d] No.11 確認のモーダル（差異・未確認あり） (view 019): Đã viết lại: toast「050-5784-2777 へお電話ください…」, không gọi (H11). Số đã thống nhất 050-5784-2777 (`ES_TEL`) nên bỏ chữ「暫定」. Việc code: `tel:`.
- [b] No.5 実集金額 (view 023,025): 「完了」luôn bấm được, thiếu 実集金額 thì server từ chối và toast (H18・H17). Việc code: E01 inline trước khi hoàn tất.
- [b] No.5.1 差額の警告 (view 023): Cảnh báo chênh lệch tiền hiện chữ đỏ (class `err`). Quyết định: cảnh báo vàng, vẫn đăng ký được. Việc code: đổi màu.

### DA_HOME
- [b] No.2.6 マニュアル (view 001,005): マニュアル mở `/driver/manuals`. Việc code: mở link (Q-DW06 A).
- [b] No.4.3 配送のカード (view 001): Thẻ vẫn hiện「到着予定 …（共有済み）」(`parts.tsx` DelCard) và đơn vị「食」thay vì「個」. Việc code: bỏ 到着予定; đổi đơn vị 箱 n・冷蔵 n個・冷凍 n個.
- [b] No.7 下のタブ (view 001,005): UI: tab dưới「廃棄・棚卸し」xuống 2 dòng và rớt chữ. Việc code/UI: rút ngắn tên/giảm cỡ chữ (役割レビュー #14).
- [c] No.4.4 トラブルの印 (view 004): Trạng thái「トラブル解決済み」cần vận hành ghi nhận giải quyết; seed chỉ có 1 sự cố đã giải quyết ở ngày khác (`seed/delivery.ts` osakaSep). Cần: seed có sự cố giải quyết trong ngày chụp (hoặc gọi `resolveTrouble` của ops).
- [b] No.3 配送予定一覧 (view 005): Không có câu I313 khi trống (`app/driver/page.tsx`). Việc code: thêm câu.
- [b] No.8 オフライン・未送信の帯 (view 007): Hàng đợi 未送信 là `driver.outbox` phía server (`area.ts flushOut`), không phải IndexedDB trên trình duyệt. Việc code: IndexedDB (台帳 F 2026-10-07, 受付簿 No.292).
- [b] No.2.1 期間 (view 008,009,010): Tiêu đề chỉ hiện `weekRange(today)` (tuần), không bấm được, chỉ đọc dữ liệu hôm nay (`list/page.tsx`). Việc code: chọn kỳ (tối đa 90 ngày trước).
- [b] No.5 検索 (view 008,009,010,013): Tìm kiếm lọc ngay khi gõ trong code, 台帳 M-1 là sau Enter. Như ESDL 5 (役割レビュー #10・Q10).
- [b] No.6 並べ替え (view 008,009,010): Không có thao tác sắp xếp. Thứ tự mặc định theo 台帳 F; sắp xếp theo giờ nhận (Q-DW14) chờ hong xác nhận.
- [b] No.7.1 受取地点のカード (view 008,009,010): Giống HOME 4.3: DelCard còn 到着予定 và「食」.
- [b] No.8 ページ送り (view 008,009,010): Danh sách hiện toàn bộ, không phân trang. Việc code: thêm khi có chọn kỳ (1 trang 10 mục theo 台帳 F).
- [b] No.9 下のタブ (view 008): UI: tab dưới「廃棄・棚卸し」xuống 2 dòng (như HOME 7 ở view 001).
- [b] No.7 0件の表示 (view 013): Câu trống「該当する配送はありません。」/「該当する受取地点はありません。」. Việc code: dùng I01「表示するデータがありません。」.
- [b] No.2.1 期間 (view 014): Chưa có màn chọn kỳ (chỉ hiển thị); hình 014 là vị trí tiêu đề hiện tại. Việc code: làm màn chọn kỳ.

### DA_MANU
- [b] No.1 マニュアル（ホームのボタン） (view 001): Code mở danh sách/chi tiết cố định `/driver/manuals`. Việc code: nút mở link (Q-DW06 A), bỏ 2 màn.
- [b] No.2 マニュアル（アカウントのボタン） (view 002): Như MANU 1 (view 002 chụp màn chi tiết cũ).
- [c] No.3 ボタンを出さない (view 003): Không có màn cài đặt/URL trong seed; code luôn hiện nút. Cần: biến cấu hình URL manual (trống thì ẩn nút).

### DA_NOTI
- [b] No.2 お知らせの一覧 (view 001): Code trộn thông báo tự động (phân công・đổi ngày giao) (`newsOf`: announcements + inbox) và không phân trang. Quyết định Q-DW14 chờ hong.
- [b] No.4 ページ送り (view 001): Không phân trang, hiện toàn bộ. Việc code: 10 mục/trang (Q-DW14 推奨, chờ hong).
- [c] No.2 お知らせの一覧 (view 002): Mọi tài xế seed đều có ≥1 thông báo nên không chụp được 0 mục; khi 0 mục code chỉ hiện tiêu đề, không có câu. Cần: tài xế seed không có thông báo.

### DA_RECV
- [b] No.3 受取地点の札 (view 001,005,009,011): Tổng ở thẻ「社・箱・食・食」(`PtNums`). Việc code: 冷蔵・冷凍 đơn vị「個」(H19).
- [b] No.3.4 電話番号・コピー (view 001,009): UI: nút「コピー」khoảng 23px. Việc code/UI (役割レビュー #13).
- [b] No.8 検索 (view 001,002,009): Tìm kiếm lọc ngay khi gõ; 台帳 M-1 là sau Enter (役割レビュー #10・Q10).
- [b] No.9 配送ごとの束 (view 001,005,006,009,011): Tiêu đề từng nhóm dùng「食」(`Nums`). Việc code: 「個」(H19).
- [b] No.13 0件の表示 (view 002): Câu trống「未確認の荷物はありません。」khác I01. Cần quyết: dùng I01 hay câu riêng.
- [b] No.12.2 ESへ電話する (view 003): Gọi ES chỉ toast số, không gọi (TelButton, H11).
- [c] No.4 資料（委託業者向け） (view 010): Tài liệu luôn rỗng (`docs: []`, H10); chỉ tài xế 委託 ở 中継先 thấy mục. Cần: nối master 中継先.

### DA_RPTD
- [b] No.2 検索 (view 001,002): Câu 0 mục「該当なし」(`trouble/page.tsx`). Việc code: dùng I01.
- [b] No.5 配送（納品先） (view 001,002): Danh sách đối tượng gồm cả đơn đã hoàn tất. Quyết định (台帳 F 2026-10-08, Q-DW09 đã chốt): chỉ trước hoàn tất. Việc code: ẩn nút sau hoàn tất.
- [b] No.3.2 影響を受けた送り状番号 (view 004,006): Thiếu mục thì chỉ khoá nút「送信」, không có câu lỗi (H17). Việc code: E02 inline.
- [b] No.4 トラブル内容 (view 004,005,006,007): Chọn「交通渋滞・事故」thì cần hiện nút gọi ES (tel: 050-5784-2777); code không có hướng dẫn gọi. Việc code (役割レビュー #15).
- [b] No.5 画像 (view 004,008): Ảnh tối đa 6 và chỉ đếm số lượng (không lưu nội dung, H1・H13). Quyết định 20 ảnh・5MB. Nút sample chỉ DEMO.
- [b] No.10 備考 (view 004,007): Ghi chú tối đa 1000 ký tự (`maxLength=1000`, `checkTrouble`); trống thì chỉ khoá nút, không có lỗi (H2・H17). Việc code: 500.

### DA_STCK
- [b] No.4 商品の検索 (view 001,003): Khi 0 mục chỉ hiện bảng rỗng, không có câu; tìm kiếm chỉ theo tên (không theo mã).
- [b] No.5 バーコードスキャン (view 001): Quét chọn ngẫu nhiên 1 dòng +1 (H14); không thêm sản phẩm ngoài danh sách.
- [b] No.6 商品の表（廃棄） (view 001,003): UI: cột tên sản phẩm ~50px nên tên xuống 5〜9 dòng. Việc code/UI: tên ở dòng 1, số lượng・lý do ở dòng 2 (役割レビュー #14).
- [b] No.7 廃棄を登録 (view 001,002,004,009,010): Lỗi server (không có nơi giao・số không hợp lệ) hiện toast (`useRun`→`toastError`) thay vì inline (H17).
- [b] No.9 スキャンで数える (view 005): Như STCK 5: quét ngẫu nhiên ở tab 棚卸し (`iscan`).
- [b] No.10.2 実在庫 (view 005,006): Server vẫn chặn khi 実在庫 > 理論在庫 (`area.ts sendInventory`: `r.ac > r.th` → 400). Quyết định hong 2026-10-07: không chặn. Việc code: bỏ điều kiện.
- [c] No.13 棚卸なしの拠点 (view 007): Seed không có chi nhánh `noStockCheck` nên không chụp được. Code hiện bảng rỗng + nút gửi, I318 không hiện; gửi thì toast 409. Cần: seed 1 拠点 棚卸なし (+ code hiện I318).

## Tổng

| Loại | Số dòng |
|---|---|
| a | 0 |
| b | 73 |
| c | 8 |
| d | 2 |
| **Tổng** | **83** |

Lần 1 (kiểm kê): 68 dòng. Lần 2 (sau 役割レビュー 2026-10-08): 83 dòng — thêm 15 dòng demo_ok ghi việc UI/tel:/tìm kiếm cho code (không có dòng nào bỏ).
Ghi chú: 4 thay đổi code trước đó (mật khẩu 8〜64, mã 4 số 5 phút/không giới hạn/không timer, 再配達待, 種別未定/đơn con) đã xử lý ở lượt đầu: bỏ 3 demo_ok của DA_AUTH (mục 6・8・9).

