# -*- coding: utf-8 -*-
"""
画面設計書のデータ：運営管理者Web ＞ 配送管理 ＞ スケジュール ＞ 配送サイクル設定（AW_CYCL_001）
元：本物の Web（app/ops/delivery/schedule/cycle、lib/ops/delivery/{logic,fromDomain,types}.ts、lib/ops/areas/delivery.ts、lib/domain/move.ts）
決定：docs/決定台帳.md F「運営D 配送スケジュール・配送サイクル設定（Q1〜Q5）」「…（月・週・日）の見方（Q6〜Q10）」「運営D 配送の数値」
仕様：配送_02 §4（サイクル設定）・§6、配送_04 §8-3・§8-6、運営Web_権限表（行「配送サイクル設定」）、確認メモ_AW_運営D_配送.md（hong 回答 2026-10-07）
スケジュール（AW_SCHD）は別ファイル。ここは配送サイクル設定の1画面だけ。
2026-10-08 HTML レビュー（hong C-1〜C-8）を反映：出荷不可の列をなくす・拡大縮小・対象月の明示と A1 の別ブロック・過去月は参照のみ・確認の小窓を短く・変更履歴をコードで作る・メニュー公開の行のずれ・トースト右上。
番号は画面で通し。タブ・モーダルの状態では、その状態で増える・変わる項目だけ書く（共通の項目は最初の状態に1回）。
コードとの違い（demo_ok＝コードを直す宿題）：休止の保存・調整の扱い（区分「調整」を追加フォームで足す）・保存の影響の確認（3つの分け方）・権限（開けるのはフル権限・物流だけ）・変更履歴・最終保存日時・倉庫3つ・3倉庫へ反映の確認（Q133）・出荷不可日の期間指定・
設定対象期間（6ヶ月）・祝日の件数と再取得・タブの URL・保存のエラーの出し方・Q02/E31/I02・最大文字数。
"""

TITLE = ["配送サイクル設定（AW_CYCL）", "Cài đặt chu kỳ giao hàng (AW_CYCL)"]
SHEET = ["配送サイクル設定", "Chu kỳ giao hàng"]
BASENAME = "画面設計書_AW_CYCL_配送サイクル設定"
IMG_PREFIX = "AW_CYCL"
OUT_DIR = "AW_CYCL_配送サイクル設定"
CODE_NOTE = ["画面コードは規約 <Module(2)>_<Feature(4)>_<Seq(3)>（docs/01_仕様/画面コード規約_20261005.md）。AW＝運営管理者Web、CYCL＝配送サイクル設定（Cycle）。メニューに独立した項目はなく、スケジュール（AW_SCHD）の「配送サイクル設定」ボタンから開く（開けるのはフル権限・物流だけ）",
             "Mã màn hình theo quy ước <Module(2)>_<Feature(4)>_<Seq(3)>. AW = Admin Web, CYCL = Cài đặt chu kỳ giao hàng (Cycle). Không có mục menu riêng; mở từ nút \"配送サイクル設定\" của màn スケジュール (AW_SCHD)"]
SITE = "ops"
SYSTEM = {"ja": "運営管理者Web", "vi": "Web quản trị vận hành"}
AUTHOR = "Claude（cloud）／確認：hong"
CREATED = "2026-10-07"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "ops", "loginId": "Ad00010"}   # フル権限（ops.full）。見本：中村幸子（seed の account.ts）
CODE_PATHS = ["app/ops/delivery/schedule/cycle", "app/ops/delivery/_components", "app/ops/delivery/delivery.css",
              "lib/ops/delivery", "lib/ops/areas/delivery.ts", "lib/domain/move.ts", "lib/domain/seed/delivery.ts"]

SRC = "hong 回答 2026-10-07（確認メモ_AW_運営D_配送）"
SRC2 = "hong 回答 2026-10-07（確認メモ_AW_運営D_配送 Stage B）"
SRC3 = "hong 回答 2026-10-08（確認メモ_AW_運営D_配送 Stage B）"
SRC4 = "hong 回答 2026-10-08（HTML レビュー）"
DECISIONS = [
    {"date": "2026-10-08", "target": "AW_CYCL_001 No.6・6.4・6.7（祝日・臨休の一覧）",
     "q": ["「祝日・臨休」の一覧に「出荷不可」の列を残すか（C-1）", "Có giữ cột 「出荷不可」 trong danh sách 祝日・臨休 không? (C-1)"],
     "a": ["なくす。出荷不可は「出荷不可」タブだけで登録する。この一覧は「配送祝日」だけ残る（追加フォームの「出荷不可」のチェックも外し、「配送祝日」だけにする）", "Bỏ. 出荷不可 chỉ đăng ký ở thẻ 「出荷不可」. Danh sách này chỉ còn 「配送祝日」 (bỏ luôn ô tích 「出荷不可」 trong form thêm, chỉ còn 「配送祝日」)"],
     "src": SRC4},
    {"date": "2026-10-08", "target": "AW_CYCL_001 No.4.4・5.2（拡大・縮小）",
     "q": ["カレンダーと休日などのパネルの表示範囲（C-2）", "Phạm vi hiển thị của lịch và khung ngày nghỉ (C-2)"],
     "a": ["カレンダー（4）と休日などのパネル（5〜8）は拡大・縮小できる。開閉のボタンを項目に足した（4.4・5.2）", "Lịch (4) và khung ngày nghỉ (5〜8) thu/phóng được. Đã thêm nút đóng/mở thành mục (4.4・5.2)"],
     "src": SRC4},
    {"date": "2026-10-08", "target": "AW_CYCL_001 No.2.5・3・14（対象月・A1）",
     "q": ["どの月を設定しているか分からない／対象期間が9月なのに12月サイクルの A1 を指定するのはなぜか（C-3）", "Không biết đang cài đặt tháng nào / vì sao kỳ cài đặt là tháng 9 mà lại chỉ định A1 của chu kỳ tháng 12 (C-3)"],
     "a": ["いま設定している月（対象月）を画面に出す（帯の下に「いま設定している月：2026-12」・No.2.5）。A1 は「選んだ月（例 2026-12）のサイクルの A1」と書き、設定対象期間（No.3）とは別のブロック（No.14）にする（旧 No.3.3・3.4 は 14.1・14.2 に移した）", "Hiện tháng đang cài đặt (tháng đối tượng) trên màn hình (dưới thanh: 「いま設定している月：2026-12」, No.2.5). A1 ghi là 「A1 của chu kỳ tháng đã chọn (ví dụ 2026-12)」 và tách thành khối riêng (No.14), khác với thời gian cài đặt (No.3) (No.3.3・3.4 cũ chuyển thành 14.1・14.2)"],
     "src": SRC4},
    {"date": "2026-10-08", "target": "AW_CYCL_001 No.2・2.1（設定状況の帯）",
     "q": ["帯はいつからいつまで表示か。過去の月の設定は見られるか（C-4）", "Thanh hiển thị từ khi nào đến khi nào? Có xem được cài đặt các tháng quá khứ không? (C-4)"],
     "a": ["運用の開始月から（設定済みの最終月＋6か月まで）。過去の月も見られるが操作はできない（灰・参照のみ）", "Từ tháng bắt đầu vận hành (đến tháng cuối đã thiết lập + 6 tháng). Xem được cả tháng quá khứ nhưng không thao tác được (xám, chỉ xem)"],
     "src": SRC4},
    {"date": "2026-10-08", "target": "AW_CYCL_001 No.9・12・E168（確認の小窓）",
     "q": ["確認の小窓の内容が長い・わかりづらい（C-6）", "Nội dung cửa sổ xác nhận dài, khó hiểu (C-6)"],
     "a": ["短く、非エンジニアにもわかる言葉にする：要点2〜3行＋短い表（内容・件数の2列、3行）。長い説明（例の配送・注意書き）は「くわしく」を押したときだけ開く（No.9.7）。メッセージ Q132・E168 の言い回しも直した", "Viết ngắn, dễ hiểu với người không phải kỹ sư: 2〜3 dòng ý chính + bảng ngắn (2 cột 内容・件数, 3 dòng). Giải thích dài (ví dụ giao hàng, ghi chú) chỉ mở khi nhấn 「くわしく」 (No.9.7). Đã sửa cả cách nói của thông báo Q132・E168"],
     "src": SRC4},
    {"date": "2026-10-08", "target": "AW_CYCL_001 No.10・状態 014（変更履歴）",
     "q": ["変更履歴はどこにあるか。コードで作るか（C-8）", "Lịch sử thay đổi ở đâu? Có làm trong code không? (C-8)"],
     "a": ["コードで作る（hong 承認）。画面の一番下。コードを作る担当は別にいる。コードができたら、状態 014 の項目の sel を実在の selector に直す（それまでは sel \"-\" と demo_ok）", "Làm trong code (hong duyệt). Ở cuối màn hình. Có người phụ trách code riêng. Khi code xong sẽ sửa sel của các mục trạng thái 014 thành selector thật (đến lúc đó để sel \"-\" và demo_ok)"],
     "src": SRC4},
    {"date": "2026-10-08", "target": "AW_CYCL_001 No.2.2（メニュー公開の行）",
     "q": ["メニュー公開の行（2.2）が配送サイクル設定の行（2.1）とずれて見える（C-5）", "Hàng công bố menu (2.2) trông lệch so với hàng cài đặt chu kỳ (2.1) (C-5)"],
     "a": ["画面の不具合。コードで直す（demo_ok）。2行の月のセルを同じ幅・同じ位置にそろえる", "Lỗi giao diện. Sửa trong code (demo_ok). Căn các ô tháng của 2 hàng cùng độ rộng, cùng vị trí"],
     "src": SRC4},
    {"date": "2026-10-08", "target": "AW_CYCL_001 No.11（トースト）",
     "q": ["トーストの位置（C-7）", "Vị trí toast (C-7)"],
     "a": ["画面の右上（全サイト・全画面で統一。台帳 F「全サイト共通：トーストの位置」）", "Góc phải trên màn hình (thống nhất toàn bộ site và màn hình; 台帳 F)"],
     "src": SRC4},
    {"date": "2026-10-08", "target": "AW_CYCL_001 No.10（変更履歴の列）",
     "q": ["変更履歴の列：P-HIST の標準の「操作」「理由」を入れるか、確認メモ Q10 の列だけか（C1）", "Cột của 変更履歴: có thêm 「操作」「理由」 chuẩn của P-HIST hay chỉ các cột của memo Q10? (C1)"],
     "a": ["P-HIST の7列のまま（日時・操作した人・操作〈登録／変更／削除など〉・項目・変更前・変更後・理由〈あれば〉）＋影響件数（C2 の内訳）を列として足す。理由欄がないこのサイクル設定の保存では、理由は空欄", "Giữ 7 cột P-HIST (日時, người thao tác, thao tác, mục, trước, sau, lý do nếu có) + thêm cột số lượng ảnh hưởng (chi tiết theo C2). Lưu cài đặt chu kỳ này không có ô lý do nên để trống."],
     "src": SRC3},
    {"date": "2026-10-07", "target": "AW_CYCL_001 No.3.3・No.7（サイクルの持ち方）",
     "q": ["サイクルは「月ごとの A1」（コード）か「最初の A1＋サイクル休止」（仕様）か（Q1）", "Chu kỳ: \"A1 theo từng tháng\" (code) hay \"A1 đầu tiên + tạm dừng chu kỳ\" (spec)? (Q1)"],
     "a": ["C（両方持つ）：A1 は月ごと（配送データを作る前の月だけ直せる）＋長い休みは「休止」。休止を足すと後ろの月は自動で動く。休止は共通データで保存できるようにする", "C (kết hợp): A1 theo từng tháng (chỉ sửa được tháng chưa tạo dữ liệu giao hàng) + kỳ nghỉ dài dùng \"tạm dừng\". Thêm tạm dừng thì các tháng sau tự dịch. Tạm dừng phải lưu được vào dữ liệu chung"],
     "src": SRC + " Q1＝C・受付簿 No.290"},
    {"date": "2026-10-07", "target": "AW_CYCL_001 No.7.3・7.6・1.4",
     "q": ["休止の「調整」の日数は自動で足すか、運営が置くか（Q2）", "Số ngày \"調整\" của tạm dừng: hệ thống tự thêm hay 運営 tự đặt? (Q2)"],
     "a": ["A（仕様どおり）：システムは「あと n日」を算出して表示するだけで、自動では足さない。置き場所は運営が決め、7の倍数に満たない間は保存できない", "A (theo spec): hệ thống chỉ tính và hiện \"あと n日\", không tự thêm. 運営 tự chọn chỗ đặt; chưa đủ bội số của 7 thì không lưu được"],
     "src": SRC + " Q2＝A・受付簿 No.290"},
    {"date": "2026-10-07", "target": "AW_CYCL_001 No.9（保存の確認）・11（保存後）",
     "q": ["保存したとき、すでにある配送をどうするか（Q3）", "Khi lưu, xử lý các lượt giao hàng đã có thế nào? (Q3)"],
     "a": ["A（配送_04 §8-6）：予定は作り直す／出荷待ち以降は動かさず「要確認」に出す。保存前に影響件数を確認させる（3つの分け方：作り直す・要確認・出荷指示済み）。成功はトースト", "A (配送_04 §8-6): 予定 tạo lại / từ 出荷待ち trở đi không dịch mà đưa vào \"要確認\". Xác nhận số lượng ảnh hưởng trước khi lưu (chia 3 nhóm: tạo lại / 要確認 / đã gửi chỉ thị xuất). Thành công = toast"],
     "src": SRC + " Q3＝A・受付簿 No.290"},
    {"date": "2026-10-07", "target": "AW_CYCL_001 No.1.4・全体",
     "q": ["だれが配送サイクル設定を保存できるか（Q4）", "Ai được lưu cài đặt chu kỳ giao hàng? (Q4)"],
     "a": ["C：権限表に専用の行「配送サイクル設定」を足した。フル権限＝CRUD、物流＝R/U、ほかの役割＝R", "C: thêm hàng riêng 「配送サイクル設定」 vào bảng quyền. フル権限 = CRUD, 物流 = R/U, vai trò khác = R"],
     "src": SRC + " Q4＝C・受付簿 No.290・運営Web_権限表"},
    {"date": "2026-10-07", "target": "AW_CYCL_001 No.1.2・10（変更履歴）",
     "q": ["配送サイクル設定の変更履歴をどこに出すか（Q10）", "Hiển thị lịch sử thay đổi của cài đặt chu kỳ giao hàng ở đâu? (Q10)"],
     "a": ["A：画面の下に「変更履歴」（P-HIST。列：日時・操作した人・項目・変更前・変更後・影響件数）を出し、画面の上に最終保存日時を出す", "A: thêm khối \"変更履歴\" (P-HIST; cột: 日時, người thao tác, mục, trước, sau, số lượng ảnh hưởng) ở cuối màn hình và hiện 最終保存日時 ở đầu màn hình"],
     "src": SRC + " Q10＝A・受付簿 No.291"},
    {"date": "2026-10-07", "target": "AW_CYCL_001 No.3.2・11",
     "q": ["終了月のエラー・6か月の丸めの通知・A1 を動かしたあとの警告のメッセージ ID", "ID thông báo: lỗi tháng kết thúc, thông báo làm tròn 6 tháng, cảnh báo sau khi dời A1"],
     "a": ["「終了月は開始月以降を選択してください。」＝E174（インライン）。設定対象期間が6か月を超えるときの丸め通知「設定対象期間は最大6か月です。終了月を{月}に直しました。」＝I193（ページ内の注意）。A1 を動かすとオーダー締切が本発注の時期に入る警告は W135 を使う（ページ内・帯の下に出す。保存完了のトースト S131 の続きには出さない。W133 は AW_SCHD の移動の小窓の「変更申請あり」で別のメッセージ）", "「終了月は開始月以降を選択してください。」 = E174 (inline). Thông báo làm tròn khi thời gian cài đặt vượt 6 tháng 「設定対象期間は最大6か月です。終了月を{月}に直しました。」 = I193 (lưu ý trong trang). Cảnh báo khi dời A1 làm hạn đặt hàng rơi vào thời kỳ đặt hàng chính dùng W135 (hiện trong trang, dưới thanh; không nối tiếp sau toast S131 khi lưu xong. W133 là thông báo 「変更申請あり」 của cửa sổ 移動 ở AW_SCHD, là thông báo khác)"],
     "src": "hong 指示 2026-10-07（定義の補足・Claude 案）"},
    {"date": "2026-10-07", "target": "AW_CYCL_001 No.10.8（影響件数）",
     "q": ["変更履歴の「影響件数」を1つの数で出すか、内訳で出すか（C2）", "Cột 「影響件数」 của 変更履歴 hiện bằng 1 con số hay theo chi tiết? (C2)"],
     "a": ["内訳で出す：作り直した n件／要確認に出した m件。保存確認の表（No.9.2）と同じ分け方", "Hiện theo chi tiết: đã tạo lại n件 / đưa vào 要確認 m件. Cùng cách chia với bảng xác nhận khi lưu (No.9.2)"],
     "src": SRC2 + " C2"},
    {"date": "2026-10-07", "target": "AW_CYCL_001 状態 003・No.2.4",
     "q": ["状態 003（穴の警告）を撮る見本データをどうするか（C3）", "Dữ liệu mẫu để chụp trạng thái 003 (cảnh báo lỗ hổng) xử lý thế nào? (C3)"],
     "a": ["見本データ（seed）に「設定のない月（穴）」を1つ足し、警告 I132 が撮れるようにする。デモの見本だけで、本物のデータには影響しない（見本：2027-05 を空け、2027-06 を足した）", "Thêm vào dữ liệu mẫu (seed) 1 tháng chưa thiết lập (lỗ hổng) để chụp được cảnh báo I132. Chỉ là mẫu demo, không ảnh hưởng dữ liệu thật (mẫu: bỏ trống 2027-05, thêm 2027-06)"],
     "src": SRC2 + " C3"},
    {"date": "2026-10-07", "target": "AW_CYCL_001 No.7.1・7.6・7.12",
     "q": ["「調整を追加」ボタンを作るか（C4）", "Có làm nút 「調整を追加」 không? (C4)"],
     "a": ["作らない。画面は「あと n日」の表示と E168 だけ。調整の休止は、既存の追加フォームで区分＝調整を選んで足す（フル権限と物流 R/U の人）", "Không làm. Màn hình chỉ hiện \"あと n日\" và E168. Kỳ nghỉ 調整 thêm bằng form thêm sẵn có, chọn 区分 = 調整 (người có フル権限 và 物流 R/U)"],
     "src": SRC2 + " C4"},
    {"date": "2026-10-07", "target": "AW_CYCL_001 No.8.2・12（3倉庫へ反映の確認）",
     "q": ["「この設定を3倉庫へ反映」を押したとき確認の小窓を出すか（C5）", "Khi nhấn 「この設定を3倉庫へ反映」 có hiện cửa sổ xác nhận không? (C5)"],
     "a": ["出す。新しい確認メッセージ Q133：「3倉庫へ反映しますか？／{倉庫名}の出荷不可枠を、この設定で上書きします。」", "Có. Thông báo xác nhận mới Q133: 「3倉庫へ反映しますか？／{倉庫名}の出荷不可枠を、この設定で上書きします。」"],
     "src": SRC2 + " C5"},
    {"date": "2026-10-07", "target": "AW_CYCL_001 No.9.2（影響の表）",
     "q": ["保存確認の表にある追加2行（お届け日の変更申請がある配送／知らせる委託配送先）を残すか（C6）", "Có giữ 2 dòng thêm trong bảng xác nhận khi lưu (yêu cầu đổi ngày giao / đơn vị ủy thác cần báo) không? (C6)"],
     "a": ["なくす。決定の3つの分け方（作り直す／要確認／出荷指示済み）だけ", "Bỏ. Chỉ giữ 3 nhóm đã quyết (tạo lại / 要確認 / đã gửi chỉ thị xuất)"],
     "src": SRC2 + " C6"},
    {"date": "2026-10-07", "target": "AW_CYCL_001 全体・状態 016（権限）",
     "q": ["配送サイクル設定を開ける役割（C7）。置き換える決定：Q4（ほかの役割＝R）", "Vai trò mở được màn cài đặt chu kỳ giao hàng (C7). Thay quyết định: Q4 (vai trò khác = R)"],
     "a": ["編集できる人だけの画面：フル権限と物流（R/U）だけが開ける。ほかの役割（経理・営業・CS・商品管理・商品開発）はメニュー（スケジュールのボタン）に出ず、URL を直接開くと権限なし（E32）", "Màn hình chỉ dành cho người sửa được: chỉ フル権限 và 物流 (R/U) mở được. Vai trò khác (経理, 営業, CS, 商品管理, 商品開発) không thấy mục menu (nút ở スケジュール); mở URL trực tiếp thì báo không có quyền (E32)"],
     "src": SRC2 + " C7"},
    {"date": "2026-10-07", "target": "AW_CYCL_001 No.10.10（変更履歴の表示件数）",
     "q": ["画面の一覧のページ送りの表示件数", "Số dòng hiển thị khi phân trang danh sách trên màn hình"],
     "a": ["10／20／50／100（初期 10）", "10 / 20 / 50 / 100 (mặc định 10)"],
     "src": SRC2 + "（ページ送り）"},
]
CHANGES = []
HIDE_ALWAYS = []
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [
    {"code": "AW_CYCL_001", "ja": "配送サイクル設定", "vi": "Cài đặt chu kỳ giao hàng"},
]

# ---------------------------------------------------------------- JavaScript の部品（setup の先頭に付ける）
H = (
    "const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));"
    "const q=(s,r)=>(r||document).querySelector(s);const qa=(s,r)=>[...(r||document).querySelectorAll(s)];"
    "const setv=(el,v)=>{if(!el)return;Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}));};"
    "const btn=(r,t)=>qa('button',r).find(b=>(b.textContent||'').trim()===t);"
    "const tab=(t)=>qa('.pnl .es-tab').find(b=>(b.textContent||'').trim()===t);"
    "const ins=(f)=>qa('input[type=text]',f);"   # 日付の欄は「文字の欄＋カレンダー用の date の欄」の2つ。文字の欄だけ数える（名前・開始日・終了日の順）
    "const save=()=>qa('.es-pagehead__actions button').find(b=>(b.textContent||'').includes('設定を保存'));"
    "const addPause=async()=>{tab('サイクル休止').click();await sleep(300);const f=q('.pnl .form');const x=ins(f);setv(x[0],'年末年始休業');setv(x[1],'2026-12-29');setv(x[2],'2026-12-31');await sleep(200);btn(f,'追加').click();await sleep(400);};"
    "const addHol=async()=>{const f=q('.pnl .form');const x=ins(f);setv(x[0],'臨時休業');setv(x[1],'2026-11-17');await sleep(200);btn(f,'追加').click();await sleep(400);};"
)

PAGE = ".ops-delivery > section.es-card"   # 帯（1つ目）・期間と A1（2つ目）

# ---------------------------------------------------------------- 項目
HEAD = [
    {"no": "1", "ja": "ヘッダー", "vi": "Đầu trang", "sel": ".es-pagehead", "kind": "area", "trig": "view",
     "detail": ["画面名「配送サイクル設定」。スケジュール（AW_SCHD）の「配送サイクル設定」ボタンから開く（メニューに独立した項目はない）。開けるのは編集できる人だけ：フル権限と物流（R/U）。ほかの役割（経理・営業・CS・商品管理・商品開発）には、スケジュールのボタンもメニューにも出ず、URL を直接開くと権限なし（E32。状態 016）。",
                "Tên màn hình \"配送サイクル設定\". Mở từ nút \"配送サイクル設定\" của màn スケジュール (AW_SCHD); không có mục menu riêng. Chỉ người sửa được mới mở được: フル権限 và 物流 (R/U). Vai trò khác (経理, 営業, CS, 商品管理, 商品開発) không thấy nút/menu; mở URL trực tiếp thì báo không có quyền (E32, trạng thái 016)."]},
    {"no": "1.1", "ja": "パンくず", "vi": "Breadcrumb", "sel": ".es-breadcrumb", "kind": "link", "trig": "click",
     "detail": ["配送管理 ＞ スケジュール ＞ 配送サイクル設定。「スケジュール」を押すとスケジュール（AW_SCHD）へ戻る。", "配送管理 > スケジュール > 配送サイクル設定. Nhấn \"スケジュール\" để về màn スケジュール (AW_SCHD)."]},
    {"no": "1.2", "ja": "最終保存日時", "vi": "Thời điểm lưu gần nhất", "sel": "-", "kind": "label", "trig": "view",
     "detail": ["見出しの近くに、最後に設定を保存した日時を yyyy-mm-dd HH:MM で出す（変更履歴の最新の行の日時と同じ）。", "Hiện gần tiêu đề thời điểm lưu cài đặt gần nhất, dạng yyyy-mm-dd HH:MM (trùng với dòng mới nhất của 変更履歴)."],
     "demo_ok": ["コードにはない。足す（hong 2026-10-07 Q10＝A）", "Code chưa có. Cần thêm (hong 2026-10-07 Q10 = A)."]},
    {"no": "1.3", "ja": "キャンセル", "vi": "Hủy", "sel": ".es-pagehead__actions button::キャンセル", "kind": "button", "trig": "click", "pattern": "P-FORM",
     "err": ["Q02"],
     "detail": ["スケジュール（AW_SCHD）へ戻る。画面で直した内容があるときは Q02（キャンセル／破棄）を出し、「破棄」で保存せずに戻る。",
                "Về màn スケジュール (AW_SCHD). Nếu đã sửa trên màn hình thì hiện Q02 (キャンセル／破棄); chọn \"破棄\" để về mà không lưu."],
     "demo_ok": ["コードは確認なしでそのまま戻る。Q02 を出す（全サイト共通の決定 2026-10-05）", "Code thoát ngay không hỏi. Cần hiện Q02 (quyết định chung toàn hệ thống 2026-10-05)."]},
    {"no": "1.4", "ja": "設定を保存", "vi": "Lưu cài đặt", "sel": ".es-pagehead__actions button::設定を保存", "kind": "button", "trig": "click", "pattern": "P-FORM",
     "cond": ["この画面を開ける役割（フル権限・物流）には、いつも出す。ほかの役割は画面自体を開けない（権限なし E32）。", "Luôn hiện với vai trò mở được màn này (フル権限, 物流). Vai trò khác không mở được màn (không có quyền E32)."],
     "valid": ["押すと、画面の入力をまとめて確認する（A1 は月曜・期間・休止は7日の倍数など）。エラーがなければ「設定を保存しますか？」（No.9）を開く。保存はその小窓の「確認して保存」で行う。",
               "Khi nhấn sẽ kiểm tra gộp các mục nhập (A1 là thứ Hai, thời gian, tạm dừng là bội số của 7 ngày…). Không lỗi thì mở \"設定を保存しますか？\" (No.9). Việc lưu thực hiện bằng \"確認して保存\" trong cửa sổ đó."],
     "err": ["E30", "E31"],
     "detail": ["保存で変わるのは、共通データの配送サイクル（月ごとの A1・休止）・祝日・出荷不可（枠・日）。保存したら変更履歴（No.10）に1行足し、最終保存日時を更新する。P-FORM との違い：保存の前に確認の小窓を挟む。エラーは項目の下だけに出し、トーストでは重ねない。",
                "Phần thay đổi khi lưu: chu kỳ giao hàng (A1 theo tháng, tạm dừng), ngày lễ, không xuất hàng (khung, ngày) trong dữ liệu chung. Lưu xong thêm 1 dòng vào 変更履歴 (No.10) và cập nhật 最終保存日時. Khác P-FORM: có cửa sổ xác nhận trước khi lưu. Lỗi chỉ hiện dưới mục, không hiện thêm toast."],
     "demo_ok": ["コードは営業・CS などにも画面が開き、保存ボタンも出る（出荷・配送管理の権限）。開けるのはフル権限と物流だけにする（C7）。入力エラーは項目の下だけにする（コードは最初のエラーをトーストにも出す）",
                 "Code mở màn và hiện nút lưu cả với 営業, CS… (quyền 出荷・配送管理). Cần chỉ cho フル権限 và 物流 mở (C7). Lỗi nhập chỉ hiện dưới mục (code còn hiện thêm toast lỗi đầu tiên)."]},
    {"no": "1.5", "ja": "ほかの人が編集中の帯", "vi": "Dải người khác đang sửa", "sel": "-", "kind": "label", "trig": "show", "err": ["I02"], "pattern": "P-FORM",
     "cond": ["この画面をほかの人も開いているときだけ、ページ上部に出す。", "Chỉ hiện ở đầu trang khi có người khác cũng đang mở màn hình này."],
     "detail": ["ほかの人が開いていれば、ページ上部に I02（{名前}さんが編集中です）を出す。ロックはしないので、保存は止めない（input_standard「同時編集」）。保存のときに先に保存されていれば、あとから保存した方が E31（No.1.6）。",
                "Nếu người khác đang mở thì hiện I02 ({tên} đang sửa) ở đầu trang. Không khóa nên không chặn lưu (input_standard 「同時編集」). Nếu khi lưu đã có người lưu trước thì người lưu sau gặp E31 (No.1.6)."],
     "demo_ok": ["コードにない（上書きされる）。足す（全サイト共通・台帳 E 2026-10-05）", "Code chưa có (bị ghi đè). Cần thêm (chung toàn site; 台帳 E 2026-10-05)."]},
    {"no": "1.6", "ja": "先に保存されていたときの警告", "vi": "Cảnh báo khi đã có người lưu trước", "sel": "-", "kind": "modal", "trig": "show", "err": ["E31"], "pattern": "P-FORM",
     "cond": ["「確認して保存」（No.9.6）を押したとき、開いてからあとにほかの人が先に保存していたときだけ出す。", "Chỉ hiện khi nhấn 「確認して保存」 (No.9.6) mà sau lúc mở màn hình đã có người khác lưu trước."],
     "detail": ["E31 の警告の小窓を出す。「キャンセル」で画面に戻る（入力した内容はそのまま）。「上書きして保存」で、いまの内容で保存する。上書きして保存したときも、変更履歴（No.10）に残す。",
                "Hiện cửa sổ cảnh báo E31. 「キャンセル」 để về màn hình (giữ nguyên nội dung đã nhập). 「上書きして保存」 để lưu bằng nội dung hiện tại. Khi ghi đè lưu cũng ghi vào 変更履歴 (No.10)."],
     "demo_ok": ["コードにない（あとから保存した方で上書きされる）。足す（全サイト共通・台帳 E 2026-10-05）", "Code chưa có (người lưu sau ghi đè). Cần thêm (chung toàn site; 台帳 E 2026-10-05)."]},
    {"no": "1.7", "ja": "離れる前の確認", "vi": "Xác nhận trước khi rời đi", "sel": "-", "kind": "modal", "trig": "show", "err": ["Q02"], "pattern": "P-FORM",
     "cond": ["追加・変更・削除など、画面で直した内容があるときだけ出す（直していなければ確認なしで離れる）。", "Chỉ hiện khi có nội dung đã sửa trên màn hình (thêm, đổi, xóa…). Nếu chưa sửa thì rời đi không hỏi."],
     "detail": ["画面で直した内容は「設定を保存」まで画面の中だけにあるため、保存せずに離れる前に Q02（キャンセル／破棄）を出す。対象：キャンセル（No.1.3）、パンくず・メニューなどほかの画面への移動、ブラウザの戻る、再読み込み、タブ・ブラウザを閉じる。「破棄」で保存せずに離れる。月タブ・パネルのタブの切り替えは離れたことにならない（入力は消えない）。再読み込み・閉じるは、ブラウザの仕組みで文言がブラウザ標準の確認になる。",
                "Nội dung đã sửa chỉ nằm trong màn hình cho đến khi nhấn 「設定を保存」, nên trước khi rời đi mà chưa lưu sẽ hiện Q02 (キャンセル／破棄). Áp dụng: キャンセル (No.1.3), chuyển sang màn khác (breadcrumb, menu…), nút Back của trình duyệt, tải lại trang, đóng tab/trình duyệt. Chọn 「破棄」 để rời đi mà không lưu. Chuyển thẻ tháng / thẻ của khung không tính là rời đi (không mất nội dung). Với tải lại và đóng, do cơ chế trình duyệt nên câu hỏi là hộp xác nhận chuẩn của trình duyệt."],
     "demo_ok": ["コードは確認なしで離れる。全サイト共通の決定（2026-10-05）どおり Q02 を出す", "Code rời đi không hỏi. Cần hiện Q02 theo quyết định chung toàn site (2026-10-05)."]},
    {"no": "1.8", "ja": "ログイン切れ（保存のとき）", "vi": "Hết phiên đăng nhập (khi lưu)", "sel": "-", "kind": "modal", "trig": "show", "pattern": "P-FORM",
     "cond": ["「確認して保存」（No.9.6）を押したとき、ログインの有効期間（1日）が切れているときだけ出す。", "Chỉ hiện khi nhấn 「確認して保存」 (No.9.6) mà thời hạn đăng nhập (1 ngày) đã hết."],
     "detail": ["その場でログインの小窓を出し、ログインできたら保存を続ける（入力した内容は消さない）。運営で許可IPの外から使っているときは OTP も求める。下書きは保存しない。ログインの小窓を閉じたら保存しないまま画面に戻る。",
                "Hiện ngay cửa sổ đăng nhập; đăng nhập xong thì tiếp tục lưu (không xóa nội dung đã nhập). Nếu 運営 dùng ngoài IP cho phép thì yêu cầu thêm OTP. Không lưu nháp. Đóng cửa sổ đăng nhập thì về màn hình mà chưa lưu."],
     "demo_ok": ["コードにない。足す（全サイト共通・input_standard「ログイン・同時編集・削除」）", "Code chưa có. Cần thêm (chung toàn site; input_standard 「ログイン・同時編集・削除」)."]},
]

BAND = [
    {"no": "2", "demo_ok": ["コードの帯は過去の月の見せ方（灰・参照のみ・押すと見られる）を確認して、決定（C-4）に合わせる", "Cần kiểm tra cách hiện tháng quá khứ trên thanh của code (xám, chỉ xem, nhấn để xem) và đổi theo quyết định (C-4)."], "ja": "設定状況の帯", "vi": "Thanh trạng thái thiết lập", "sel": PAGE + "::メニュー公開", "kind": "area", "trig": "view",
     "detail": ["画面の最上部。上段＝配送サイクルの設定、下段＝同じ月のメニューの公開。月のセルは、運用の開始月から「設定済みの最終月＋6ヶ月」まで。過去の月も見られるが操作はできない（灰・参照のみ）。",
                "Phần trên cùng màn hình. Hàng trên = thiết lập chu kỳ giao hàng, hàng dưới = tình trạng công bố menu của cùng tháng. Các ô tháng từ tháng bắt đầu vận hành đến \"tháng cuối đã thiết lập + 6 tháng\". Tháng quá khứ cũng xem được nhưng không thao tác được (xám, chỉ xem)."]},
    {"no": "2.1", "ja": "配送サイクル設定（上段）", "vi": "Chu kỳ giao hàng (hàng trên)", "sel": "div[style*=\"max-content\"]::配送サイクル設定", "kind": "button", "trig": "click",
     "detail": ["月ごとのセル。色と文字：確定済（灰・編集不可）／設定済み（緑・編集できる）／未設定（穴）（赤）／未設定（今後）（薄い灰）。未設定の月には「!」を付ける。セルを押すと下のカレンダーがその月になる（設定対象期間の外の、まだ設定していない月は切り替わらない）。過去の月（確定済）は灰で「参照のみ」。押すとその月を見られるが、A1・休日などは操作できない。マウスを重ねると、確定済みの理由を出す。",
                "Ô theo từng tháng. Màu và chữ: 確定済み (xám, không sửa được) / 設定済み (xanh lá, sửa được) / 未設定（穴）(đỏ) / 未設定（今後）(xám nhạt). Tháng chưa thiết lập có dấu \"!\". Nhấn ô thì lịch bên dưới chuyển sang tháng đó (tháng chưa thiết lập nằm ngoài thời gian cài đặt thì không chuyển). Tháng quá khứ (đã chốt) màu xám, chỉ xem: nhấn được để xem nhưng không thao tác được A1, ngày nghỉ... Rê chuột hiện lý do của tháng đã chốt."]},
    {"no": "2.2", "demo_ok": ["メニュー公開の行（2.2）が、配送サイクル設定の行（2.1）と月の位置がずれて見える不具合がある（コード）。2行の月のセルを同じ幅・同じ位置にそろえる（hong 2026-10-08 C-5）", "Hàng công bố menu (2.2) trông lệch vị trí tháng so với hàng cài đặt chu kỳ (2.1) (lỗi trong code). Căn ô tháng của 2 hàng cùng độ rộng và vị trí (hong 2026-10-08 C-5)."], "ja": "メニュー公開（下段）", "vi": "Công bố menu (hàng dưới)", "sel": "div[style*=\"max-content\"]::メニュー公開", "kind": "button", "trig": "click",
     "detail": ["月ごとのメニューの状態：運用中（灰）／公開済（青）／公開準備中（黄）／未公開（薄い灰）。公開済み以降の月は A1 を変えられない。押したときの動きは上段と同じ。",
                "Trạng thái menu của từng tháng: 運用中 (xám) / 公開済み (xanh dương) / 公開準備中 (vàng) / 未公開 (xám nhạt). Từ 公開済み trở đi không đổi được A1. Nhấn có tác dụng như hàng trên."]},
    {"no": "2.3", "ja": "設定状況の文", "vi": "Câu mô tả tình trạng thiết lập", "sel": PAGE + " div::設定済みの最終月は", "kind": "label", "trig": "view",
     "detail": ["「設定済みの最終月は {年月}（残り {n}ヶ月）。確定済（編集不可）は {年月} まで、変更できるのは {年月} 以降です。」。残りが2ヶ月を切ったら赤の太字（画面の中の表示だけ。ダッシュボードの通知・メールは作らない）。変更できる月がなければ「変更できる月はありません（設定対象期間を後ろへ延ばしてください）。」",
                "\"設定済みの最終月は {tháng} (còn {n} tháng). 確定済み (không sửa được) đến {tháng}, có thể sửa từ {tháng} trở đi.\" Còn dưới 2 tháng thì chữ đỏ đậm (chỉ hiển thị trong màn hình; không có thông báo dashboard / email). Không có tháng sửa được thì hiện \"変更できる月はありません (設定対象期間を後ろへ延ばしてください).\""]},
    {"no": "2.5", "ja": "いま設定している月（対象月）", "vi": "Tháng đang cài đặt (tháng đối tượng)", "sel": "-", "kind": "label", "trig": "view",
     "detail": ["帯の下に「いま設定している月：2026-12」の形で出す（yyyy-mm）。月タブ（No.4.1）で選んでいる月と同じで、タブを切り替えると変わる。カレンダー（No.4）と A1（No.14.1）は、この月について見る・設定する。設定対象期間の開始月（No.3.1）とは別のもの（開始月＝この保存でどの月から設定するか／対象月＝いま画面で見ている月）。確定済みの月のときは「（参照のみ）」を添える。",
                "Hiện dưới thanh dạng 「いま設定している月：2026-12」 (yyyy-mm). Giống tháng đang chọn ở thẻ tháng (No.4.1), đổi thẻ thì đổi theo. Lịch (No.4) và A1 (No.14.1) được xem / cài đặt cho tháng này. Khác với tháng bắt đầu của thời gian cài đặt (No.3.1) (tháng bắt đầu = lần lưu này cài đặt từ tháng nào / tháng đối tượng = tháng đang xem trên màn hình). Tháng đã chốt thì kèm 「（参照のみ）」."],
     "demo_ok": ["コードにない。足す（hong 2026-10-08 C-3）", "Code chưa có. Cần thêm (hong 2026-10-08 C-3)."]},
]
HOLE = [
    {"no": "2.4", "ja": "穴の警告", "vi": "Cảnh báo tháng bị trống", "sel": PAGE + " div::設定のない月があります", "kind": "label", "trig": "show", "err": ["I132"],
     "cond": ["確定済みと設定済みのあいだに、設定のない月（穴）があるときだけ、帯の下に赤字で出す。", "Chỉ hiện chữ đỏ dưới thanh khi giữa tháng đã chốt và tháng đã thiết lập có tháng chưa thiết lập (lỗ hổng)."],
     "detail": ["穴の月は、納品予定も配送データも作られない。法人にも表示されず、変更申請もできない。設定対象期間の開始月の初期値はこの穴の最初の月（そのまま保存すれば埋まる）。",
                "Tháng bị trống sẽ không tạo lịch giao hàng và dữ liệu giao hàng; công ty cũng không thấy và không gửi được yêu cầu đổi. Giá trị ban đầu của tháng bắt đầu là tháng trống đầu tiên (lưu luôn thì lấp được)."]},
]
WARN135 = [
    {"no": "2.6", "ja": "オーダー締切の警告（帯の下）", "vi": "Cảnh báo hạn chốt order (dưới thanh)", "sel": "-", "kind": "label", "trig": "show", "err": ["W135"],
     "cond": ["A1 を動かして保存し、オーダー締切が前半の本発注の時期に入る月があるときだけ出す。", "Chỉ hiện khi đã dời A1 và lưu, và có tháng mà hạn chốt order rơi vào thời kỳ đặt hàng chính nửa đầu."],
     "detail": ["ページ内の帯の下に黄色の警告（W135）を出す。保存は止めない。保存完了のトースト（No.11・S131）とは別で、トーストの続きには出さない。AW_SCHD の移動の小窓の W133（変更申請あり）とは別のメッセージ。",
                "Hiện cảnh báo vàng (W135) trong trang, dưới thanh. Không chặn lưu. Tách khỏi toast hoàn tất lưu (No.11, S131), không nối tiếp sau toast. Khác W133 (có yêu cầu đổi ngày) của cửa sổ 移動 ở AW_SCHD."],
     "demo_ok": ["コードはトースト（または W133）で出す。ページ内（帯の下）の W135 に直す", "Code hiện bằng toast (hoặc W133). Phải sửa thành W135 trong trang (dưới thanh)."]},
]
PERIOD = [
    {"no": "3", "ja": "設定対象期間", "vi": "Thời gian cài đặt", "sel": PAGE + ":nth-of-type(2)", "kind": "area", "trig": "view",
     "detail": ["設定対象期間（開始月〜終了月）だけのブロック。「この保存で、どの月からどの月までを設定するか」を決める。A1 は別のブロック（No.14）で、月タブで選んだ月について設定する。", "Khối chỉ có thời gian cài đặt (tháng bắt đầu ~ tháng kết thúc), quyết định 「lần lưu này cài đặt từ tháng nào đến tháng nào」. A1 là khối riêng (No.14), cài đặt cho tháng đã chọn ở thẻ tháng."]},
    {"no": "3.1", "ja": "設定対象期間：開始月", "vi": "Thời gian cài đặt: tháng bắt đầu", "sel": PAGE + ":nth-of-type(2) > div > div:nth-child(1) .es-field:nth-child(1)", "kind": "month", "trig": "input", "req": "○",
     "len": "年月 yyyy-mm", "init": ["まだ設定していない最初の月（穴があれば穴の最初の月、なければ設定済みの最終月の翌月）", "Tháng đầu tiên chưa thiết lập (nếu có lỗ hổng thì tháng trống đầu tiên, không thì tháng sau tháng cuối đã thiết lập)"],
     "ex": ["2027-05", "Tháng bắt đầu (yyyy-mm): tháng đầu tiên chưa thiết lập, ví dụ tháng 5/2027"],
     "valid": ["年月 yyyy-mm。確定済（編集不可）の月は選べない。開始月から数えて6ヶ月まで。選んでいる月が期間の外になったら開始月に戻す。",
               "Năm-tháng yyyy-mm. Không chọn được tháng đã chốt (không sửa được). Tính từ tháng bắt đầu tối đa 6 tháng. Nếu tháng đang chọn nằm ngoài thời gian thì quay về tháng bắt đầu."],
     "detail": ["配送サイクル設定の期間の始まり。帯（No.2.1）の月を押すと、その月が開始月になる（設定済みの月の中身を直す入口）。戻したことで確定済みとのあいだに穴ができるときは、穴の警告（No.2.4）を出す。",
                "Điểm bắt đầu thời gian cài đặt. Nhấn tháng ở thanh (No.2.1) thì tháng đó thành tháng bắt đầu (cửa vào để sửa nội dung tháng đã thiết lập). Nếu quay lại khiến giữa tháng đã chốt và tháng đã thiết lập xuất hiện lỗ hổng thì hiện cảnh báo (No.2.4)."],
     "demo_ok": ["コードは自由に打てる2つの欄で、最初のサイクルの月（2026-09）から出る。決定済みの仕様（配送_02 §4-2）に合わせる：6ヶ月・開始月の初期値＝まだ設定していない最初の月・共通の年月入力欄",
                 "Code là 2 ô gõ tự do, hiện từ tháng chu kỳ đầu tiên (2026-09). Cần theo spec đã chốt (配送_02 §4-2): 6 tháng, tháng bắt đầu mặc định = tháng đầu tiên chưa thiết lập, ô nhập năm-tháng chung."]},
    {"no": "3.2", "ja": "設定対象期間：終了月", "vi": "Thời gian cài đặt: tháng kết thúc", "sel": PAGE + ":nth-of-type(2) > div > div:nth-child(1) .es-field:nth-child(3)", "kind": "month", "trig": "input", "req": "○",
     "len": "年月 yyyy-mm", "init": ["開始月から5ヶ月後（開始月を含めて6ヶ月）", "5 tháng sau tháng bắt đầu (tính cả tháng bắt đầu là 6 tháng)"],
     "ex": ["2027-10", "Tháng kết thúc (yyyy-mm): 5 tháng sau tháng bắt đầu, ví dụ tháng 10/2027"],
     "err": ["E174", "I193"],
     "valid": ["開始月以降。開始月より前なら E174（項目の下）。開始月から6ヶ月を超えたら、開始月＋5ヶ月に丸めて I193 の通知（ページ内の注意）を出す。期間を延ばすときは終了月を進めるだけ（設定は常に1つ）。",
               "Từ tháng bắt đầu trở đi. Trước tháng bắt đầu thì hiện E174 (dưới ô). Vượt quá 6 tháng kể từ tháng bắt đầu thì làm tròn về tháng bắt đầu + 5 tháng và hiện thông báo I193 (lưu ý trong trang). Muốn kéo dài chỉ cần dời tháng kết thúc (chỉ có 1 cài đặt)."],
     "demo_ok": ["コードは形式（YYYY-MM）と「終わり≧始まり」だけ確認し、6ヶ月の丸めはない（配送_02 §4-2）", "Code chỉ kiểm tra định dạng (YYYY-MM) và \"cuối ≥ đầu\", không có làm tròn 6 tháng (配送_02 §4-2)."]},
    {"no": "14.1", "ja": "選んだ月（例 2026-12）のサイクルの A1", "vi": "A1 của chu kỳ tháng đã chọn (ví dụ 2026-12)", "sel": PAGE + ":nth-of-type(2) > div > div:nth-child(2) .es-field", "kind": "date", "trig": "input", "req": "○",
     "len": "日付 yyyy-mm-dd", "init": ["選んでいる月のサイクルの A1（共通データの値）", "A1 của chu kỳ tháng đang chọn (giá trị trong dữ liệu chung)"],
     "ex": ["2026-12-07", "A1 của chu kỳ tháng 12/2026 (ngày 7/12/2026, thứ Hai)"],
     "cond": ["確定済みの月（当月・過ぎた月／メニューを公開した月／オーダー期間が始まった月／配送データを作った月）は入力できず、欄の下に理由を出す。", "Tháng đã chốt (tháng hiện tại, tháng đã qua / tháng đã công bố menu / tháng đã bắt đầu thời gian đặt hàng / tháng đã tạo dữ liệu giao hàng) thì không nhập được và hiện lý do dưới ô."],
     "valid": ["月曜日だけ。B7（サイクルの14日目）がそのサイクル月に入ること。前のサイクルと重ならないこと。後ろへ動かして次のサイクルと重なるときは、後ろの月も同じ日数だけ動く（動かした月の間は「サイクルなし」）。オーダー締切は動かない（合わなくなったら保存のときに知らせる）。",
               "Chỉ ngày thứ Hai. B7 (ngày thứ 14 của chu kỳ) phải nằm trong tháng của chu kỳ. Không chồng lên chu kỳ trước. Dời ra sau mà chồng chu kỳ kế tiếp thì các tháng sau cũng dịch cùng số ngày (khoảng giữa là \"サイクルなし\"). Hạn đặt hàng không dịch (nếu không còn khớp thì báo khi lưu)."],
     "err": ["E166", "E165", "I03"],
     "detail": ["月タブ（No.4.1）で選んでいる月（No.2.5「いま設定している月」）のサイクル初日。設定対象期間の開始月（No.3.1）とは関係なく、選んだ月で決まる（例：設定対象期間が 2027-05 からでも、2026-12 を選んでいればここは 2026-12 サイクルの A1）。直せるのは配送データを作る前の月だけ（台帳 E・B）。タブを替えると、その月の値になる。",
                "Ngày đầu chu kỳ của tháng đang chọn ở thẻ tháng (No.4.1) (No.2.5 「いま設定している月」). Không liên quan đến tháng bắt đầu của thời gian cài đặt (No.3.1), được quyết định bởi tháng đã chọn (ví dụ: dù thời gian cài đặt bắt đầu từ 2027-05, nếu đang chọn 2026-12 thì ở đây là A1 của chu kỳ 2026-12). Chỉ sửa được tháng chưa tạo dữ liệu giao hàng (台帳 E・B). Đổi thẻ thì hiện giá trị của tháng đó."],
     "demo_ok": ["コードでは設定対象期間と同じ枠の中にある。別のブロックにし、見出しに『選んだ月のサイクルの A1』と月を出す（hong 2026-10-08 C-3）。理由の出し方は「参照のみ：{理由}」→ I03 の言い回し「{理由}（見るだけ）」に揃える。サイクルの持ち方は「月ごとの A1＋休止」（Q1＝C）で、休止はコードにまだない（No.7）", "Trong code khối này nằm chung khung với thời gian cài đặt. Cần tách thành khối riêng, tiêu đề ghi 『A1 của chu kỳ tháng đã chọn』 kèm tháng (hong 2026-10-08 C-3). Cách hiện lý do trong code là \"参照のみ：{lý do}\" → đổi theo I03 \"{lý do}（見るだけ）\". Cách giữ chu kỳ là \"A1 theo tháng + tạm dừng\" (Q1 = C); tạm dừng chưa có trong code (No.7)."]},
    {"no": "14.2", "ja": "A1 の説明", "vi": "Giải thích về A1", "sel": PAGE + ":nth-of-type(2) > div > div:nth-child(3)", "kind": "label", "trig": "view",
     "detail": ["A1 は月曜日のみ選べる／確定済みの月は参照のみ／A1 を後ろへ動かすと重なる後ろの月も同じ日数だけ動く（間はサイクルなし）／オーダー締切は動かない、の4点を説明する固定の文。",
                "Câu cố định giải thích 4 điểm: A1 chỉ chọn thứ Hai / tháng đã chốt chỉ xem / dời A1 ra sau thì các tháng sau chồng cũng dịch cùng số ngày (khoảng giữa không có chu kỳ) / hạn đặt hàng không dịch."]},

]
# A1 は設定対象期間とは別のブロック（No.14。旧 No.3.3・3.4）
_A1 = [it for it in PERIOD if it["no"] in ("14.1", "14.2")]
PERIOD = [it for it in PERIOD if it["no"] not in ("14.1", "14.2")]
A1 = [{"no": "14", "ja": "選んだ月のサイクルの A1", "vi": "A1 của chu kỳ tháng đã chọn", "sel": "-", "kind": "area", "trig": "view",
       "detail": ["月タブで選んだ月について A1 を設定するブロック。設定対象期間（No.3）とは別。見出しに選んだ月（例 2026-12）を出す。", "Khối cài đặt A1 cho tháng đã chọn ở thẻ tháng. Tách riêng khỏi thời gian cài đặt (No.3). Tiêu đề hiện tháng đã chọn (ví dụ 2026-12)."],
       "demo_ok": ["コードは設定対象期間と同じ枠の中。別のブロックにする（hong 2026-10-08 C-3）", "Trong code nằm chung khung với thời gian cài đặt. Cần tách thành khối riêng (hong 2026-10-08 C-3)."]}] + _A1
CAL = [
    {"no": "4", "ja": "月のカレンダー", "vi": "Lịch theo tháng", "sel": ".ops-delivery > div > section.es-card:nth-of-type(1)", "kind": "area", "trig": "view",
     "detail": ["設定から計算した月のカレンダー。保存するまでは、画面の中だけで変わる。日付を押しても設定は変わらない（見るだけ）。", "Lịch tháng tính từ cài đặt. Chưa lưu thì chỉ thay đổi trong màn hình. Nhấn vào ngày không đổi cài đặt (chỉ xem)."]},
    {"no": "4.1", "ja": "月タブ", "vi": "Thẻ tháng", "sel": ".es-monthtabs", "kind": "tab", "trig": "click", "pattern": "P-TAB",
     "detail": ["設定対象期間の月だけを並べる。各タブに「出荷不可：n日」「配送祝日：n日」と、確定済みの月は「参照のみ」を添える。選んだ月は下のカレンダーと、No.14.1 の A1 に効く。初期は期間の中の1か月（コードは 2026-12）。",
                "Chỉ xếp các tháng trong thời gian cài đặt. Mỗi thẻ có \"出荷不可：n日\", \"配送祝日：n日\" và tháng đã chốt có thêm \"参照のみ\". Tháng đã chọn tác động tới lịch bên dưới và A1 ở No.14.1. Ban đầu là 1 tháng trong thời gian (code là 2026-12)."],
     "demo_ok": ["月タブは画面の中の状態で、URL（?tab=）に持たない（P-TAB は再読み込み・戻るでも同じタブ。配送サイクル設定の宿題 H9）", "Thẻ tháng chỉ là trạng thái trong màn hình, chưa giữ trong URL (?tab=); P-TAB yêu cầu tải lại / Back vẫn đúng thẻ (việc cần làm H9)."]},
    {"no": "4.2", "ja": "カレンダー", "vi": "Lịch", "sel": ".es-cal", "kind": "area", "trig": "view",
     "detail": ["月曜始まり・6週。1マスに、日付／祝日名・休業名・休止名／「{月}月 {枠}」（A1〜D7。A1 は左に青い線）／「休：出荷」「休：配送」を出す。選んだ月以外の日は薄い灰。サイクル休止の日は「サイクル休止」（赤）で枠は進めない。",
                "Bắt đầu từ thứ Hai, 6 tuần. Mỗi ô có: ngày / tên ngày lễ・ngày nghỉ・kỳ tạm dừng / \"{tháng}月 {khung}\" (A1〜D7; A1 có vạch xanh bên trái) / \"休：出荷\", \"休：配送\". Ngày ngoài tháng đang chọn màu xám nhạt. Ngày tạm dừng chu kỳ ghi \"サイクル休止\" (đỏ) và không tiêu thụ khung."]},
    {"no": "4.3", "ja": "注釈", "vi": "Chú thích", "sel": ".notes", "kind": "label", "trig": "view",
     "detail": ["背景の灰・サイクル枠（A1〜D7）・祝日名／休業名・サイクル休止・「休：出荷」・「休：配送」の意味を並べる固定の説明。", "Giải thích cố định ý nghĩa: nền xám, khung chu kỳ (A1〜D7), tên ngày lễ / ngày nghỉ, tạm dừng chu kỳ, \"休：出荷\", \"休：配送\"."]},
    {"no": "4.4", "ja": "カレンダーの拡大・縮小（ボタン）", "vi": "Thu/phóng lịch (nút)", "sel": "-", "kind": "button", "trig": "click",
     "detail": ["カレンダー（No.4）の見出しの右に置くボタン。押すたびに「縮小」（見出しと月タブだけにたたむ）と「拡大」（元の大きさに戻して、マスを大きく出す）を切り替える。初期は拡大（開いた状態）。たたんでいても入力した内容は消えず、保存にも関係しない。画面を開き直すと初期に戻る。",
                "Nút đặt bên phải tiêu đề lịch (No.4). Mỗi lần nhấn chuyển giữa 「縮小」 (thu lại chỉ còn tiêu đề và thẻ tháng) và 「拡大」 (trở về kích thước ban đầu, ô lớn). Ban đầu là 拡大 (mở). Dù thu lại, nội dung đã nhập vẫn còn và không ảnh hưởng việc lưu. Mở lại màn hình thì trở về mặc định."],
     "demo_ok": ["コードにない（表示範囲は固定）。足す（hong 2026-10-08 C-2）", "Code chưa có (phạm vi hiển thị cố định). Cần thêm (hong 2026-10-08 C-2)."]},
]
PANEL = [
    {"no": "5", "ja": "休止設定のパネル", "vi": "Khung cài đặt nghỉ", "sel": ".pnl", "kind": "area", "trig": "view",
     "detail": ["カレンダーの右。タブ3つ（祝日・臨休／サイクル休止／出荷不可）で、休日・休止・出荷不可を足す・直す。直した内容は「設定を保存」まで画面の中だけにある。",
                "Bên phải lịch. 3 thẻ (祝日・臨休 / サイクル休止 / 出荷不可) để thêm / sửa ngày nghỉ, tạm dừng, không xuất hàng. Nội dung sửa chỉ nằm trong màn hình cho đến khi nhấn \"設定を保存\"."]},
    {"no": "5.1", "ja": "パネルのタブ", "vi": "Thẻ của khung", "sel": ".pnl .es-tabs", "kind": "tab", "trig": "click", "pattern": "P-TAB",
     "detail": ["祝日・臨休（初期）／サイクル休止／出荷不可。入力途中でタブを替えても入力は消えない（保存は画面全体で1回）。", "祝日・臨休 (mặc định) / サイクル休止 / 出荷不可. Đổi thẻ khi đang nhập không mất nội dung (lưu 1 lần cho cả màn hình)."],
     "demo_ok": ["タブは URL（?tab=）に持たない（宿題 H9）", "Thẻ chưa giữ trong URL (?tab=) (việc cần làm H9)."]},
    {"no": "5.2", "ja": "休日などのパネルの拡大・縮小（ボタン）", "vi": "Thu/phóng khung ngày nghỉ (nút)", "sel": "-", "kind": "button", "trig": "click",
     "detail": ["パネル（No.5）の見出しの右に置くボタン。押すたびに「縮小」（タブの見出しだけにたたむ）と「拡大」（元の大きさに戻す）を切り替える。初期は拡大（開いた状態）。たたんでいても入力した内容は消えず、保存にも関係しない。画面を開き直すと初期に戻る。",
                "Nút đặt bên phải tiêu đề khung (No.5). Mỗi lần nhấn chuyển giữa 「縮小」 (thu lại chỉ còn tiêu đề thẻ) và 「拡大」 (trở về kích thước ban đầu). Ban đầu là 拡大 (mở). Dù thu lại, nội dung đã nhập vẫn còn và không ảnh hưởng việc lưu. Mở lại màn hình thì trở về mặc định."],
     "demo_ok": ["コードにない（表示範囲は固定）。足す（hong 2026-10-08 C-2）", "Code chưa có (phạm vi hiển thị cố định). Cần thêm (hong 2026-10-08 C-2)."]},
]

def _lay(items, no, ja, vi, d_ja, d_vi):
    """幅・折り返しの設計（hong 指示なしの設計の直し：1440px の画面で横スクロールを出さない）を、その項目の詳細に足す"""
    for it in items:
        if it["no"] == no:
            it["detail"] = [it["detail"][0] + ja, it["detail"][1] + " " + vi]
            old = it.get("demo_ok")
            it["demo_ok"] = [(old[0] + "／" if old else "") + d_ja, (old[1] + " / " if old else "") + d_vi]


_lay(BAND, "2",
     "幅：月のセルは1つ80pxの固定幅にし、月の数が多いときは帯の中だけを横にスクロールする（ページ全体は横に動かさない）。",
     "Độ rộng: mỗi ô tháng rộng cố định 80px; khi nhiều tháng thì chỉ cuộn ngang bên trong thanh (không cuộn ngang cả trang).",
     "コードは帯とカレンダー・右パネルの合計で幅1551pxとなり、1440pxの画面でページ全体が横に動く。帯だけを横スクロールにする",
     "Code: tổng thanh + lịch + khung bên phải rộng 1551px, trên màn 1440px cả trang cuộn ngang. Chỉ cho thanh cuộn ngang.")
_lay(CAL, "4",
     "幅：カレンダーと右のパネル（No.5）は横に並べ、合わせて画面幅1440pxに収める（右パネルは360px固定、カレンダーは残りの幅。1マスは最小100px）。ページ全体の横スクロールは出さない。",
     "Độ rộng: lịch và khung bên phải (No.5) xếp ngang, tổng vừa màn hình 1440px (khung phải cố định 360px, lịch chiếm phần còn lại; mỗi ô tối thiểu 100px). Không cuộn ngang cả trang.",
     "コードは幅1551pxで横スクロールが出る。パネルを360px固定にして1440pxに収める",
     "Code rộng 1551px nên cuộn ngang. Cố định khung 360px để vừa 1440px.")
_lay(CAL, "4.1",
     "月タブは幅が足りないとき折り返し、日付や「出荷不可：n日」が切れないようにする。",
     "Thẻ tháng xuống dòng khi không đủ chỗ, để ngày và 「出荷不可：n日」 không bị cắt.",
     "コードは月タブ・パネルの日付が切れている。折り返す",
     "Code: thẻ tháng và ngày trong khung bị cắt. Cho xuống dòng.")
_lay(PANEL, "5",
     "幅・高さ：パネルは360px固定。日付の欄は yyyy-mm-dd が全部見える幅にする。必須の欄と「追加」ボタンは、スクロールしなくても最初の画面に入るようにする（長いときは縦スクロールをパネルの中に閉じ込める）。",
     "Độ rộng・chiều cao: khung cố định 360px. Ô ngày rộng đủ để thấy toàn bộ yyyy-mm-dd. Các ô bắt buộc và nút 「追加」 nằm trong màn hình đầu tiên, không cần cuộn (nếu dài thì cuộn dọc nằm bên trong khung).",
     "コードは「追加」ボタンと必須の欄が最初の画面の外にある。パネルの中に収める",
     "Code: nút 「追加」 và ô bắt buộc nằm ngoài màn hình đầu tiên. Đưa vào trong khung.")

HOL = [
    {"no": "6", "ja": "祝日・臨休", "vi": "Ngày lễ・nghỉ đột xuất", "sel": ".pnl", "kind": "area", "trig": "view",
     "detail": ["祝日・臨時休業を登録するタブ。「配送祝日」にした日は、祝日にお届けできない会社の配送日を自動で再計算する。出荷不可の日は、このタブでは登録しない（「出荷不可」タブで倉庫ごとに登録する）。配送サイクルは止まらない（止めるのはサイクル休止）。",
                "Thẻ đăng ký ngày lễ và nghỉ đột xuất. Ngày đặt \"配送祝日\" thì tự tính lại ngày giao của công ty không nhận hàng ngày lễ. Ngày không xuất hàng không đăng ký ở thẻ này (đăng ký theo từng kho ở thẻ \"出荷不可\"). Chu kỳ giao hàng không dừng (muốn dừng dùng サイクル休止)."]},
    {"no": "6.1", "ja": "祝日の件数と最終取得日時", "vi": "Số ngày lễ và thời điểm lấy gần nhất", "sel": "-", "kind": "label", "trig": "view",
     "detail": ["設定対象期間にある祝日の件数と、祝日を最後に取得した日時（yyyy-mm-dd HH:MM）を出す。", "Hiện số ngày lễ trong thời gian cài đặt và thời điểm lấy ngày lễ gần nhất (yyyy-mm-dd HH:MM)."],
     "demo_ok": ["コードにない（配送_02 §4-4）。足す", "Code chưa có (配送_02 §4-4). Cần thêm."]},
    {"no": "6.2", "ja": "休日を手動で追加（ボタン）", "vi": "Thêm ngày nghỉ thủ công (nút)", "sel": ".pnl .acts button::休日を手動で追加", "kind": "button", "trig": "click",
     "detail": ["下の入力欄（No.6.5）に移る（休日名の欄にカーソルを置く）。", "Chuyển tới ô nhập bên dưới (No.6.5), đặt con trỏ vào ô 休日名."]},
    {"no": "6.3", "ja": "祝日を再取得", "vi": "Lấy lại ngày lễ", "sel": ".pnl .acts button::祝日を再取得", "kind": "button", "trig": "click",
     "cond": ["配送サイクル設定を保存できる役割（フル権限・物流）だけに出す。", "Chỉ hiện với vai trò lưu được cài đặt chu kỳ giao hàng (フル権限, 物流)."],
     "detail": ["公開されている祝日 API から祝日を取り直す（年1回は自動で取る）。取り直した結果は件数と最終取得日時（No.6.1）に出す。どの API を使うかは未決で、開発が選ぶ（台帳 F）。",
                "Lấy lại ngày lễ từ API ngày lễ công khai (mỗi năm tự lấy 1 lần). Kết quả hiện ở số lượng và thời điểm lấy gần nhất (No.6.1). Chọn API nào do bên phát triển quyết (台帳 F)."],
     "open": ["祝日 API の名前（URL）と、毎年自動で取る時期", "Tên (URL) của API ngày lễ và thời điểm tự lấy hằng năm"], "ask": "開発（ベンダー）",
     "demo_ok": ["コードはボタンを押すとトーストを出すだけで、実際には取得しない", "Code chỉ hiện toast khi nhấn nút, thực tế không lấy dữ liệu."]},
    {"no": "6.4", "ja": "祝日・休日の一覧", "vi": "Danh sách ngày lễ・ngày nghỉ", "sel": ".pnl table.mini", "kind": "table", "trig": "view",
     "detail": ["日付の昇順。列：休日名／日付／配送祝日（チェック）／削除（×）。「出荷不可」の列はない（出荷不可は「出荷不可」タブだけ・hong 2026-10-08 C-1）。チェックを変えるとその日の扱いが変わる（保存まで画面の中だけ）。削除は確認を出さずに一覧から外す（保存するまで反映しない）。運営が追加・修正・削除できる。",
                "Sắp theo ngày tăng dần. Cột: 休日名 / 日付 / 配送祝日 (checkbox) / xóa (×). Không có cột 出荷不可 (出荷不可 chỉ ở thẻ 「出荷不可」; hong 2026-10-08 C-1). Đổi checkbox thì đổi cách xử lý ngày đó (chỉ trong màn hình cho đến khi lưu). Xóa bỏ khỏi danh sách ngay không hỏi (chưa lưu thì chưa có hiệu lực). 運営 thêm / sửa / xóa được."],
     "demo_ok": ["コードの一覧には「出荷不可」の列がある。なくす（hong 2026-10-08 C-1）。コードは休日名・日付を直せない（チェックと削除だけ）。「運営が追加・修正・削除できる」（配送_02 §4-4）に合わせて、名前と日付も直せるようにする", "Danh sách trong code có cột 出荷不可; bỏ (hong 2026-10-08 C-1). Code không sửa được tên và ngày (chỉ checkbox và xóa). Cần cho sửa cả tên và ngày theo \"運営 thêm / sửa / xóa được\" (配送_02 §4-4)."]},
    {"no": "6.5", "ja": "休日名", "vi": "Tên ngày nghỉ", "sel": ".es-field:has(#h-n)", "kind": "text", "trig": "input", "req": "○", "fid": "h-n",
     "len": "文字列 60", "ex": ["臨時休業日", "Tên ngày nghỉ (tối đa 60 ký tự), ví dụ \"臨時休業日\" (ngày nghỉ đột xuất)"],
     "valid": ["必須。60文字まで。前後の空白を取る。", "Bắt buộc. Tối đa 60 ký tự. Bỏ khoảng trắng đầu/cuối."], "err": ["E01", "E04"],
     "detail": ["入力欄の説明文（プレースホルダ）は「例）臨時休業日」。", "Gợi ý trong ô (placeholder): \"例）臨時休業日\"."],
     "demo_ok": ["コードに最大文字数の確認がない（共通の基準：1行60文字）", "Code chưa kiểm tra độ dài tối đa (chuẩn chung: 1 dòng 60 ký tự)."]},
    {"no": "6.6", "ja": "日付", "vi": "Ngày", "sel": ".pnl .form .es-field::日付", "kind": "date", "trig": "input", "req": "○",
     "len": "日付 yyyy-mm-dd", "ex": ["2026-12-31", "Ngày nghỉ (yyyy-mm-dd), ví dụ 31/12/2026"],
     "valid": ["必須。共通の日付入力欄（yyyy-mm-dd・カレンダー付き）。すでに登録のある日付は登録できない。", "Bắt buộc. Ô ngày chung (yyyy-mm-dd, có lịch). Ngày đã đăng ký thì không đăng ký lại."], "err": ["E01", "E09"]},
    {"no": "6.7", "ja": "配送祝日", "vi": "Ngày lễ giao hàng", "sel": ".pnl .form .es-field::追加設定", "kind": "check", "trig": "check", "req": "－",
     "len": ["チェック", "Checkbox"], "init": ["オン", "Bật"],
     "ex": ["オン", "Bật: ngày này là ngày lễ giao hàng"],
     "detail": ["オンなら、この日を配送祝日として扱い、祝日にお届けできない会社の配送日を自動で再計算する。出荷不可はこの欄では設定しない（「出荷不可」タブで倉庫ごとに登録する）。",
                "Bật thì coi ngày này là ngày lễ giao hàng, tự tính lại ngày giao của công ty không nhận hàng ngày lễ. Không đặt 出荷不可 ở ô này (đăng ký theo từng kho ở thẻ 「出荷不可」)."],
     "demo_ok": ["コードの追加フォームには「出荷不可」と「配送祝日」の2つのチェックがある。「出荷不可」を外し、配送祝日だけにする（hong 2026-10-08 C-1）", "Form thêm trong code có 2 ô tích 「出荷不可」 và 「配送祝日」. Bỏ 「出荷不可」, chỉ còn 「配送祝日」 (hong 2026-10-08 C-1)."]},
    {"no": "6.8", "ja": "追加（ボタン）", "vi": "Thêm (nút)", "sel": ".pnl .form button::追加", "kind": "button", "trig": "click",
     "valid": ["押すと No.6.5〜6.7 をまとめて確認する。エラーがなければ一覧（No.6.4）に足し、入力欄を空に戻して S132 を出す。まだ保存はされない。", "Nhấn sẽ kiểm tra gộp No.6.5〜6.7. Không lỗi thì thêm vào danh sách (No.6.4), xóa trống ô nhập và hiện S132. Chưa lưu."],
     "err": ["S132"]},
]
PAUSE = [
    {"no": "7", "ja": "サイクル休止", "vi": "Tạm dừng chu kỳ", "sel": ".pnl", "kind": "area", "trig": "view",
     "detail": ["長い休み（目安：3日以上ずらさないと納品できないGW・年末年始・夏季休業など）を登録するタブ。休止の日は枠を消費せず、休止明けの翌日から止まった枠を再開する。納品もピッキングもしない（ほかの設定より優先）。休止を足すと、後ろの月は自動で動く。",
                "Thẻ đăng ký kỳ nghỉ dài (tham khảo: nghỉ cần dịch từ 3 ngày trở lên như GW, cuối năm, nghỉ hè). Ngày tạm dừng không tiêu thụ khung, ngày sau kỳ nghỉ mới tiếp tục khung đã dừng. Không giao hàng, không lấy hàng (ưu tiên hơn mọi cài đặt khác). Thêm tạm dừng thì các tháng sau tự dịch."],
     "demo_ok": ["休止は共通データにまだなく、保存しようとすると 400 エラーになる（宿題 H1）。保存できるようにする（Q1＝C）", "Tạm dừng chưa có trong dữ liệu chung; lưu sẽ lỗi 400 (việc cần làm H1). Cần làm lưu được (Q1 = C)."]},
    {"no": "7.1", "ja": "休止の説明", "vi": "Giải thích tạm dừng", "sel": ".pnl .note", "kind": "label", "trig": "view",
     "detail": ["「休止期間中は配送サイクルを止めます。「出荷不可」を選ぶと同じ期間の出荷も止めます。休止は7日の倍数にします。足りない日数は「あと n日」と表示するので、下の追加フォームで区分＝「調整」を選んで休止を足してください。」",
                "\"Trong kỳ tạm dừng chu kỳ giao hàng dừng. Chọn \"出荷不可\" thì việc xuất hàng cũng dừng cùng kỳ. Tạm dừng phải là bội số của 7 ngày. Số ngày thiếu hiện là \"あと n日\"; hãy thêm kỳ tạm dừng ở form bên dưới với 区分 = \"調整\".\""],
     "demo_ok": ["コードの説明は「足りない日数は『調整』として休止の直後に自動で足し」。決定済みの仕様（自動では足さない・Q2＝A）に直す", "Mô tả trong code ghi \"số ngày thiếu tự thêm thành 調整 ngay sau kỳ nghỉ\". Cần sửa theo quyết định (không tự thêm, Q2 = A)."]},
    {"no": "7.2", "ja": "サイクル休止を追加（ボタン）", "vi": "Thêm tạm dừng (nút)", "sel": ".pnl .acts button::サイクル休止を追加", "kind": "button", "trig": "click",
     "detail": ["下の入力欄（No.7.7）に移り、入力を空にする。", "Chuyển tới ô nhập bên dưới (No.7.7) và xóa trống nội dung nhập."]},
    {"no": "7.3", "ja": "休止の一覧", "vi": "Danh sách tạm dừng", "sel": ".pnl .pz", "kind": "area", "trig": "view",
     "detail": ["1件ごとに枠で出す：期間名／「休：出荷・配送」（出荷不可がオフなら「休：配送」）／期間「yyyy-mm-dd（曜）〜 yyyy-mm-dd（曜）」と日数「n日間」／編集（鉛筆）・削除（ごみ箱）。日付の順。期間が重なってもよい（重なった日は1日として数える）。調整の休止は「調整」と分かる表示にする。",
                "Mỗi mục hiện thành 1 khung: tên kỳ / \"休：出荷・配送\" (nếu tắt 出荷不可 thì \"休：配送\") / thời gian \"yyyy-mm-dd (thứ) ~ yyyy-mm-dd (thứ)\" và số ngày \"n日間\" / sửa (bút chì), xóa (thùng rác). Xếp theo ngày. Thời gian chồng nhau vẫn được (ngày chồng tính là 1 ngày). Kỳ nghỉ \"調整\" hiển thị để phân biệt được."],
     "demo_ok": ["コードの日数表示は「n日間（x日＋調整y日）」で、調整を自動で足す前提。「n日間」と「あと n日」（No.7.6）に直す", "Code hiện \"n日間（x日＋調整y日）\" với giả định tự thêm 調整. Cần đổi thành \"n日間\" và \"あと n日\" (No.7.6)."]},
    {"no": "7.4", "ja": "休止の編集", "vi": "Sửa tạm dừng", "sel": ".pnl .pz button[aria-label=\"編集\"]", "kind": "button", "trig": "click",
     "detail": ["入力欄に休止の内容を入れて編集に切り替える（見出し「サイクル休止を編集」・ボタン「更新」）。", "Đưa nội dung tạm dừng vào ô nhập và chuyển sang sửa (tiêu đề \"サイクル休止を編集\", nút \"更新\")."]},
    {"no": "7.5", "ja": "休止の削除", "vi": "Xóa tạm dừng", "sel": ".pnl .pz button[aria-label=\"削除\"]", "kind": "button", "trig": "click",
     "detail": ["確認を出さずに一覧から外す（保存するまで反映しない）。", "Bỏ khỏi danh sách ngay không hỏi (chưa lưu thì chưa có hiệu lực)."]},
    {"no": "7.6", "ja": "不足日数（あと n日）", "vi": "Số ngày còn thiếu (あと n日)", "sel": ".pnl .pz .days", "kind": "label", "trig": "view", "err": ["E168"],
     "cond": ["休止の日数が7の倍数でないときだけ出す。", "Chỉ hiện khi số ngày tạm dừng không phải bội số của 7."],
     "detail": ["不足日数＝7 −（休止の日数を7で割った余り）。例：3日の休止なら「あと4日」。システムは算出して表示するだけで、自動では足さない。置き場所（休止の直後・週の中・月末など）は運営が決め、追加フォーム（No.7.12）で区分＝「調整」を選んで足す（「調整を追加」のボタンは作らない）。足りない間は「設定を保存」できない。",
                "Số ngày thiếu = 7 − (số ngày tạm dừng chia 7 lấy dư). Ví dụ tạm dừng 3 ngày thì \"あと4日\". Hệ thống chỉ tính và hiện, không tự thêm. Chỗ đặt (ngay sau kỳ nghỉ / rải trong tuần / cuối tháng…) do 運営 quyết và thêm bằng form (No.7.12) với 区分 = \"調整\" (không có nút \"調整を追加\"). Chưa đủ thì không \"設定を保存\" được."],
     "demo_ok": ["コードは足りない日数を休止の直後に自動で足す（決定済みの仕様では自動で足さない・Q2＝A）", "Code tự thêm số ngày thiếu ngay sau kỳ nghỉ (theo quyết định thì không tự thêm, Q2 = A)."]},
    {"no": "7.7", "ja": "期間名", "vi": "Tên kỳ", "sel": ".es-field:has(#z-n)", "kind": "text", "trig": "input", "req": "○", "fid": "z-n",
     "len": "文字列 60", "ex": ["年末年始休業", "Tên kỳ tạm dừng (tối đa 60 ký tự), ví dụ \"年末年始休業\" (nghỉ cuối năm đầu năm)"],
     "valid": ["必須。60文字まで。前後の空白を取る。", "Bắt buộc. Tối đa 60 ký tự. Bỏ khoảng trắng đầu/cuối."], "err": ["E01", "E04"],
     "detail": ["入力欄の説明文（プレースホルダ）は「例）夏季休業」。仕様の例：夏季休業／年末年始休業／ゴールデンウィーク休業／臨時休業。", "Placeholder: \"例）夏季休業\". Ví dụ trong spec: 夏季休業 / 年末年始休業 / ゴールデンウィーク休業 / 臨時休業."],
     "demo_ok": ["コードに最大文字数の確認がない（共通の基準：1行60文字）", "Code chưa kiểm tra độ dài tối đa (chuẩn chung: 1 dòng 60 ký tự)."]},
    {"no": "7.8", "ja": "開始日", "vi": "Ngày bắt đầu", "sel": ".pnl .form .es-field::開始日", "kind": "date", "trig": "input", "req": "○",
     "len": "日付 yyyy-mm-dd", "ex": ["2026-12-29", "Ngày bắt đầu tạm dừng (yyyy-mm-dd), ví dụ 29/12/2026"],
     "valid": ["必須。共通の日付入力欄（yyyy-mm-dd・カレンダー付き）。", "Bắt buộc. Ô ngày chung (yyyy-mm-dd, có lịch)."], "err": ["E01"]},
    {"no": "7.9", "ja": "終了日", "vi": "Ngày kết thúc", "sel": ".pnl .form .es-field::終了日", "kind": "date", "trig": "input", "req": "○",
     "len": "日付 yyyy-mm-dd", "ex": ["2027-01-04", "Ngày kết thúc tạm dừng (yyyy-mm-dd), ví dụ 4/1/2027"],
     "valid": ["必須。開始日と同じ日かそれ以降。", "Bắt buộc. Cùng ngày hoặc sau ngày bắt đầu."], "err": ["E01", "E08"],
     "demo_ok": ["コードのエラー文は「終了日は開始日より後にしてください」。E08（開始日以降）に揃える", "Câu lỗi trong code là \"終了日は開始日より後にしてください\". Cần thống nhất theo E08 (từ ngày bắt đầu trở đi)."]},
    {"no": "7.10", "ja": "追加設定（出荷不可・配送）", "vi": "Cài đặt thêm (không xuất hàng・giao hàng)", "sel": ".pnl .form .es-field::追加設定", "kind": "check", "trig": "check", "req": "○",
     "len": ["複数選択（2つ）", "Chọn nhiều (2 mục)"], "init": ["出荷不可＝オン・配送（常に停止）＝オン（変えられない）", "出荷不可 = bật, 配送 (luôn dừng) = bật (không đổi được)"],
     "ex": ["出荷不可＝オン", "\"出荷不可\" bật: cùng kỳ này cũng dừng xuất hàng"],
     "detail": ["「出荷不可」は選べる（オンなら同じ期間の出荷も止める）。「配送（常に停止）」は常にオンで外せない（補足：配送は休止期間中つねに止まります）。", "\"出荷不可\" chọn được (bật thì dừng cả xuất hàng cùng kỳ). \"配送（常に停止）\" luôn bật, không tắt được (ghi chú: giao hàng luôn dừng trong kỳ tạm dừng)."]},
    {"no": "7.11", "ja": "追加／更新（ボタン）", "vi": "Thêm / Cập nhật (nút)", "sel": ".pnl .form button::追加", "kind": "button", "trig": "click",
     "valid": ["押すと No.7.7〜7.9 をまとめて確認する。エラーがなければ一覧（No.7.3）に足し（編集中は更新）、入力欄を空に戻して S132 を出す。まだ保存はされない。", "Nhấn sẽ kiểm tra gộp No.7.7〜7.9. Không lỗi thì thêm vào danh sách (No.7.3) (đang sửa thì cập nhật), xóa trống ô nhập và hiện S132. Chưa lưu."],
     "err": ["S132"]},
    {"no": "7.12", "ja": "区分", "vi": "Loại", "sel": "-", "kind": "select", "trig": "select", "req": "○",
     "len": ["選択（休止／調整）", "Chọn 1 trong 2 (tạm dừng / điều chỉnh)"], "init": ["休止", "Tạm dừng"], "ex": ["調整", "Chọn \"調整\" khi thêm kỳ nghỉ bù cho số ngày còn thiếu (あと n日)"],
     "valid": ["必須。「休止」は長い休み、「調整」は休止を7日の倍数にするための埋め合わせ。「調整を追加」のボタンは作らず、この欄で「調整」を選んで追加する。", "Bắt buộc. \"休止\" là kỳ nghỉ dài, \"調整\" là kỳ bù để kỳ tạm dừng thành bội số của 7. Không có nút \"調整を追加\"; chọn \"調整\" ở ô này rồi thêm."],
     "err": ["E01"],
     "detail": ["足した調整は一覧（No.7.3）に「調整」と分かる表示で並ぶ。足りない日数（No.7.6）がなくなるまで足して、7の倍数にする。この画面を開けるフル権限・物流の人だけが足せる。", "Kỳ 調整 đã thêm hiện trong danh sách (No.7.3) với nhãn \"調整\". Thêm cho đến khi không còn thiếu ngày (No.7.6), thành bội số của 7. Chỉ người mở được màn (フル権限, 物流) mới thêm được."],
     "demo_ok": ["コードに区分の欄がない（調整は自動で足す）。区分を足す（C4）", "Code chưa có ô 区分 (調整 tự thêm). Cần thêm ô 区分 (C4)."]},
]
NG = [
    {"no": "8", "ja": "出荷不可", "vi": "Không xuất hàng", "sel": ".pnl", "kind": "area", "trig": "view",
     "detail": ["倉庫ごとに、出荷しないサイクル枠（A1〜D7）と、日別の出荷不可日を設定する。日別の出荷不可日は、その倉庫だけに効く。倉庫は倉庫マスタの3つ（関東・関西・中部）。",
                "Cài đặt theo từng kho: các khung chu kỳ (A1〜D7) không xuất hàng và các ngày không xuất hàng. Ngày không xuất hàng chỉ có hiệu lực với kho đó. Kho lấy từ 倉庫マスタ (3 kho: Kanto, Kansai, Chubu)."],
     "demo_ok": ["コードの倉庫は関東・関西の2つだけ（宿題 H2）。倉庫マスタの3つにする", "Code chỉ có 2 kho (Kanto, Kansai) (việc cần làm H2). Cần đổi thành 3 kho theo 倉庫マスタ."]},
    {"no": "8.1", "ja": "倉庫のタブ", "vi": "Thẻ kho", "sel": ".pnl .es-tabs::関東倉庫", "kind": "tab", "trig": "click",
     "detail": ["関東倉庫・関西倉庫・中部倉庫。編集する倉庫を選ぶだけで、権限の単位ではない。", "Kho Kanto / Kansai / Chubu. Chỉ chọn kho cần sửa, không phải đơn vị phân quyền."],
     "demo_ok": ["コードは関東・関西の2つ（宿題 H2）", "Code chỉ có 2 kho: Kanto, Kansai (việc cần làm H2)."]},
    {"no": "8.2", "ja": "この設定を3倉庫へ反映", "vi": "Áp dụng cài đặt này cho 3 kho", "sel": "-", "kind": "button", "trig": "click",
     "err": ["Q133"],
     "detail": ["押すと確認の小窓 Q133（No.12）を出す。「反映する」を押すと、いま見ている倉庫の出荷不可枠を、全倉庫にそのまま上書きする（保存するまでは画面の中だけ）。「キャンセル」なら何も変えない。", "Nhấn sẽ hiện cửa sổ xác nhận Q133 (No.12). Chọn \"反映する\" thì ghi đè khung không xuất hàng của kho đang xem sang tất cả các kho (chưa lưu thì chỉ trong màn hình). \"キャンセル\" thì không đổi gì."],
     "demo_ok": ["コードにない（配送_02 §4-6）。確認の小窓（Q133）つきで足す（C5）", "Code chưa có (配送_02 §4-6). Cần thêm kèm cửa sổ xác nhận (Q133) (C5)."]},
    {"no": "8.3", "ja": "出荷不可枠", "vi": "Khung không xuất hàng", "sel": ".pnl .grid7", "kind": "area", "trig": "click",
     "detail": ["月〜日の7列に A1〜D7（28枠）を並べたボタン。押すとその枠の出荷不可をオン・オフする。初期（全社共通の既定）：A6・A7／B4〜B7／C6・C7／D4〜D7（毎週の土日と、B週・D週の木金）。設定対象期間の全体に効く。休止の日はこの判定をしない。",
                "Các nút A1〜D7 (28 khung) xếp 7 cột từ thứ Hai đến Chủ nhật. Nhấn để bật/tắt không xuất hàng của khung đó. Mặc định (chung toàn công ty): A6・A7 / B4〜B7 / C6・C7 / D4〜D7 (thứ Bảy, Chủ nhật hằng tuần và thứ Năm, thứ Sáu tuần B, D). Áp dụng cho cả thời gian cài đặt. Ngày tạm dừng không xét điều kiện này."],
     "demo_ok": ["コードは枠を変えて保存しようとすると 400 エラー（「出荷不可の枠は全社共通の決まり」）。倉庫ごとに保存できるようにする（宿題 H1）", "Code đổi khung rồi lưu sẽ lỗi 400 (\"出荷不可の枠は全社共通の決まり\"). Cần lưu được theo từng kho (việc cần làm H1)."]},
    {"no": "8.4", "ja": "納品不可枠（自動計算）", "vi": "Khung không giao hàng (tự tính)", "sel": ".pnl .rowchips", "kind": "area", "trig": "view",
     "detail": ["出荷不可枠とリードタイム（1〜3日）から逆算した、納品できない枠をリードタイムごとに並べる（押せない）。契約の枠の選択ではグレーになる。折りたたみは見出し「納品不可枠（自動計算）」を押す。",
                "Các khung không giao hàng tính ngược từ khung không xuất hàng và lead time (1〜3 ngày), xếp theo từng lead time (không nhấn được). Bị xám ở phần chọn khung của hợp đồng. Thu gọn/mở bằng tiêu đề \"納品不可枠（自動計算）\"."]},
    {"no": "8.5", "ja": "日別の出荷不可日（一覧）", "vi": "Ngày không xuất hàng (danh sách)", "sel": ".pnl table.mini", "kind": "table", "trig": "view", "err": ["I01"],
     "detail": ["選んだ倉庫の日別の出荷不可日。列：理由／日付／出荷不可（チェックを外すと削除）／削除（×）。日付の順。0件のときは表の中に I01 を出す。",
                "Các ngày không xuất hàng của kho đã chọn. Cột: 理由 / 日付 / 出荷不可 (bỏ tích là xóa) / xóa (×). Xếp theo ngày. 0 dòng thì hiện I01 trong bảng."],
     "demo_ok": ["コードは0件のとき「出荷不可日はありません」を出す（I01 に揃える）。開始日〜終了日の期間で1件として持つ（仕様 配送_02 §4-6・宿題 H3。コードは1日1行）",
                 "Code hiện \"出荷不可日はありません\" khi 0 dòng (đồng nhất theo I01). Mỗi mục là 1 khoảng ngày bắt đầu~kết thúc (spec 配送_02 §4-6, việc cần làm H3; code là 1 ngày 1 dòng)."]},
    {"no": "8.6", "ja": "理由", "vi": "Lý do", "sel": ".es-field:has(#n-w)", "kind": "text", "trig": "input", "req": "○", "fid": "n-w",
     "len": "文字列 60", "ex": ["棚卸し", "Lý do không xuất hàng (tối đa 60 ký tự), ví dụ \"棚卸し\" (kiểm kê)"],
     "valid": ["必須。60文字まで。前後の空白を取る。", "Bắt buộc. Tối đa 60 ký tự. Bỏ khoảng trắng đầu/cuối."], "err": ["E01", "E04"],
     "detail": ["入力欄の説明文（プレースホルダ）は「例）棚卸し」。登録するのは運営（物流）。", "Placeholder: \"例）棚卸し\". Người đăng ký là 運営 (物流)."],
     "demo_ok": ["コードに最大文字数の確認がない（共通の基準：1行60文字）", "Code chưa kiểm tra độ dài tối đa (chuẩn chung: 1 dòng 60 ký tự)."]},
    {"no": "8.7", "ja": "開始日", "vi": "Ngày bắt đầu", "sel": ".pnl .form .es-field::日付", "kind": "date", "trig": "input", "req": "○",
     "len": "日付 yyyy-mm-dd", "ex": ["2026-12-28", "Ngày bắt đầu không xuất hàng (yyyy-mm-dd), ví dụ 28/12/2026"],
     "valid": ["必須。共通の日付入力欄。同じ倉庫ですでに登録のある日は登録できない。", "Bắt buộc. Ô ngày chung. Ngày đã đăng ký trong cùng kho thì không đăng ký lại."], "err": ["E01", "E09"],
     "demo_ok": ["コードの欄は「日付」1つだけ（1日ずつ登録）。開始日〜終了日の期間で登録する（宿題 H3）", "Code chỉ có 1 ô \"日付\" (đăng ký từng ngày). Cần đăng ký theo khoảng ngày bắt đầu~kết thúc (việc cần làm H3)."]},
    {"no": "8.8", "ja": "終了日", "vi": "Ngày kết thúc", "sel": "-", "kind": "date", "trig": "input", "req": "○",
     "len": "日付 yyyy-mm-dd", "ex": ["2026-12-30", "Ngày kết thúc không xuất hàng (yyyy-mm-dd), ví dụ 30/12/2026 (kiểm kê 3 ngày)"],
     "valid": ["必須。開始日と同じ日かそれ以降。", "Bắt buộc. Cùng ngày hoặc sau ngày bắt đầu."], "err": ["E01", "E08"],
     "demo_ok": ["コードにない（棚卸し3日間を1件で登録するため。配送_02 §4-6・宿題 H3）", "Code chưa có (để đăng ký kiểm kê 3 ngày thành 1 mục; 配送_02 §4-6, việc cần làm H3)."]},
    {"no": "8.9", "ja": "出荷不可日を追加（ボタン）", "vi": "Thêm ngày không xuất hàng (nút)", "sel": ".pnl .form button::追加", "kind": "button", "trig": "click",
     "valid": ["押すと No.8.6〜8.8 をまとめて確認する。エラーがなければ選んだ倉庫の一覧（No.8.5）に足し、入力欄を空に戻して S132 を出す。まだ保存はされない。", "Nhấn sẽ kiểm tra gộp No.8.6〜8.8. Không lỗi thì thêm vào danh sách của kho đã chọn (No.8.5), xóa trống ô nhập và hiện S132. Chưa lưu."],
     "err": ["S132"]},
]
MODAL = [
    {"no": "9", "ja": "設定を保存しますか？（確認の小窓）", "vi": "Cửa sổ xác nhận \"設定を保存しますか？\"", "sel": "[data-m=\"CycleSaveConfirm\"]", "kind": "modal", "trig": "show", "err": ["Q132"],
     "detail": ["「設定を保存」（No.1.4）で入力にエラーがなければ開く。短く、非エンジニアにもわかる言葉にする：先に要点を2〜3行（何を変えるか・すでにある配送がどうなるか・次に押すボタン）と、短い表（3行）だけを見せる。長い説明（例の配送・注意書き）は「くわしく」（No.9.7）を押したときだけ開く。保存は止めない。閉じる（キャンセル・Esc・外側を押す）と保存せずに画面へ戻る。",
                "Mở khi nhấn \"設定を保存\" (No.1.4) mà không có lỗi nhập. Viết ngắn, dễ hiểu với người không phải kỹ sư: trước hết chỉ hiện 2〜3 dòng ý chính (đổi gì, các lượt giao hàng đã có sẽ thế nào, nút nhấn tiếp theo) và bảng ngắn (3 dòng). Giải thích dài (ví dụ giao hàng, ghi chú) chỉ mở khi nhấn \"くわしく\" (No.9.7). Không chặn lưu. Đóng (キャンセル, Esc, nhấn ra ngoài) thì về màn hình mà không lưu."]},
    {"no": "9.1", "ja": "変更の内容", "vi": "Nội dung thay đổi", "sel": ".es-modal__body > div > div:first-child", "kind": "label", "trig": "view", "err": ["I103"],
     "detail": ["追加した祝日・休止・出荷不可日、削除したもの、変えた A1 を「{内容}します。」でつなぐ。影響を数えている間は「読み込み中です。」（I103）。変更がなければ「変更はありません。」。",
                "Nối ngày lễ / tạm dừng / ngày không xuất hàng đã thêm, mục đã xóa, A1 đã đổi bằng \"{nội dung}します。\". Trong lúc đang đếm ảnh hưởng hiện \"読み込み中です。\" (I103). Không thay đổi gì thì hiện \"変更はありません。\"."]},
    {"no": "9.2", "ja": "影響の表", "vi": "Bảng ảnh hưởng", "sel": ".imp", "kind": "table", "trig": "view",
     "detail": ["すでにある配送が、この保存でどうなるかを、短い表で出す。列は「内容」「件数」の2つ、行は3つだけ：「予定は自動で作り直します」n件／「動かさずに「要確認」へ出します（出荷待ち以降）」m件／「うち出荷指示を送ったもの」k件（あとで日付を変えると、出荷指示を再送します）。例の配送（配送No・拠点・お届け日）は表に出さず、「くわしく」（No.9.4）の中に出す。表はこの3つだけ（「お届け日の変更申請がある配送」「知らせる委託配送先」の2行は出さない・C6）。",
                "Bảng ngắn cho biết các lượt giao hàng đã có sẽ thế nào sau khi lưu. Chỉ 2 cột 「内容」「件数」 và 3 dòng: 「予定は自動で作り直します」 n / 「動かさずに「要確認」へ出します（出荷待ち以降）」 m / 「うち出荷指示を送ったもの」 k (sau này đổi ngày thì gửi lại chỉ thị xuất). Ví dụ giao hàng (配送No, chi nhánh, ngày giao) không đưa vào bảng mà nằm trong 「くわしく」 (No.9.4). Chỉ có 3 dòng này (bỏ 2 dòng 「yêu cầu đổi ngày giao」 và 「đơn vị ủy thác cần báo」; C6)."],
     "demo_ok": ["コードの表は6行（お届け・出荷できなくなる件数の内訳／出荷指示を送った／変更申請／委託配送先。変更申請と委託配送先の2行はなくす・C6）で、「保存しても日付は自動では動かない」前提。Q3＝A の3つの分け方に直し、列を「内容」「件数」の2つにして言葉を短くする（宿題・hong 2026-10-08 C-6）",
                 "Bảng trong code có 6 dòng (chia số lượng không giao / không xuất được, đã gửi chỉ thị xuất, yêu cầu đổi, đơn vị ủy thác) và giả định \"lưu cũng không tự đổi ngày\". Cần đổi theo cách chia 3 nhóm Q3 = A, chỉ 2 cột 「内容」「件数」, từ ngữ ngắn gọn (việc cần làm; hong 2026-10-08 C-6)."]},
    {"no": "9.3", "ja": "確認のチェック", "vi": "Ô tích xác nhận", "sel": ".es-modal__body .es-check", "kind": "check", "trig": "check", "req": "条件付き",
     "len": ["選択（オン／オフ）", "Chọn (bật / tắt)"], "init": ["オフ", "Tắt"],
     "ex": ["オン", "Đã tích: xác nhận sẽ không dịch các lượt từ 出荷待ち trở đi"],
     "cond": ["影響する配送が1件以上あるときだけ出す。", "Chỉ hiện khi có từ 1 lượt giao hàng bị ảnh hưởng trở lên."],
     "valid": ["表示されているときは、チェックを入れないと「確認して保存」を押せない。", "Khi đang hiện, phải tích thì mới nhấn được \"確認して保存\"."],
     "detail": ["文言：「出荷待ち以降の {n}件は、自動では動かないことを確認した」。", "Nội dung: \"Đã xác nhận {n} lượt từ 出荷待ち trở đi sẽ không tự dịch\"."],
     "demo_ok": ["コードの文言は「保存しても配送の日付は自動では変わりません。…スケジュールの『日付を変える』で動かすことを確認した」。Q3＝A に合わせて直す", "Nội dung trong code là \"Lưu cũng không tự đổi ngày giao… đã xác nhận sẽ dời bằng \"日付を変える\" ở スケジュール\". Cần sửa theo Q3 = A."]},
    {"no": "9.4", "ja": "くわしく（折りたたみの中身）", "vi": "Chi tiết (nội dung thu gọn)", "sel": ".es-modal__body > div > div:last-child", "kind": "label", "trig": "view",
     "detail": ["「くわしく」（No.9.7）を押したときだけ開く部分。例の配送（最大5件：配送No・拠点・お届け日。5件を超えたら「ほか」）と、注意書き「保存は止めません（設備点検・棚卸しは動かせないため）。」。チェックが要るときは「チェックを入れると「確認して保存」を押せます。」を続ける。初期は閉じている。",
                "Phần chỉ mở khi nhấn 「くわしく」 (No.9.7). Ví dụ giao hàng (tối đa 5: 配送No, chi nhánh, ngày giao; quá 5 thì thêm 「ほか」) và ghi chú \"Không chặn lưu (vì bảo trì thiết bị, kiểm kê không dời được).\" Khi cần tích thì nối thêm \"Tích ô để nhấn được \"確認して保存\".\" Ban đầu thu gọn."],
     "demo_ok": ["コードは例と注意書きを最初から全部出す。「くわしく」の中に畳む（hong 2026-10-08 C-6）", "Code hiện ngay toàn bộ ví dụ và ghi chú. Cần gập vào trong 「くわしく」 (hong 2026-10-08 C-6)."]},
    {"no": "9.5", "ja": "キャンセル（確認の小窓）", "vi": "Hủy (cửa sổ xác nhận)", "sel": ".es-modal__actions button::キャンセル", "kind": "button", "trig": "click",
     "detail": ["小窓を閉じて画面に戻る。保存しない。入力した内容はそのまま残る。", "Đóng cửa sổ và về màn hình. Không lưu. Nội dung đã nhập vẫn còn."]},
    {"no": "9.6", "ja": "確認して保存", "vi": "Xác nhận và lưu", "sel": ".es-modal__actions button::確認して保存", "kind": "button", "trig": "click", "pattern": "P-FORM",
     "cond": ["影響の件数を数え終わるまで押せない。確認のチェック（No.9.3）が出ているときは、入れるまで押せない。", "Chưa đếm xong số lượng ảnh hưởng thì chưa nhấn được. Khi có ô tích xác nhận (No.9.3) thì phải tích mới nhấn được."],
     "err": ["E30", "E31"],
     "detail": ["押すと保存して小窓を閉じ、トースト（No.11）を出す。予定の配送は作り直し、出荷待ち以降は動かさず確認が必要な配送の画面（AW_RVEW）に出す。保存に失敗したら E30（小窓は閉じる）、ほかの人が先に保存していたら E31。",
                "Nhấn sẽ lưu, đóng cửa sổ và hiện toast (No.11). 予定 được tạo lại, từ 出荷待ち trở đi không dịch mà đưa vào 要確認 (AW_RVEW). Lưu thất bại thì E30 (đóng cửa sổ), người khác đã lưu trước thì E31."],
     "demo_ok": ["コードは保存しても配送の日付を動かさない。予定は作り直し・出荷待ち以降は要確認に出す（配送_04 §8-6・Q3＝A）。E31（同時に保存）もコードにない", "Code lưu xong không dịch ngày giao. Cần: 予定 tạo lại, từ 出荷待ち trở đi đưa vào 要確認 (配送_04 §8-6, Q3 = A). Code cũng chưa có E31 (lưu đồng thời)."]},
    {"no": "9.7", "ja": "くわしく（開閉ボタン）", "vi": "Chi tiết (nút đóng/mở)", "sel": "-", "kind": "button", "trig": "click",
     "detail": ["押すと、例の配送と注意書き（No.9.4）を開く／閉じる。初期は閉じている。閉じたままでも保存できる（確認のチェックが出ているときは、チェックが先）。", "Nhấn để mở / đóng ví dụ giao hàng và ghi chú (No.9.4). Ban đầu đóng. Đóng vẫn lưu được (nếu có ô tích xác nhận thì phải tích trước)."],
     "demo_ok": ["コードにない。足す（hong 2026-10-08 C-6）", "Code chưa có. Cần thêm (hong 2026-10-08 C-6)."]},
]
WH_MODAL = [
    {"no": "12", "ja": "3倉庫へ反映しますか？（確認の小窓）", "vi": "Cửa sổ xác nhận \"3倉庫へ反映しますか？\"", "sel": "-", "kind": "modal", "trig": "show", "err": ["Q133"],
     "detail": ["「この設定を3倉庫へ反映」（No.8.2）を押すと開く。{倉庫名}にはいま見ている倉庫を入れる。閉じる（キャンセル・Esc・外側を押す）と何も変えずに画面へ戻る。",
                "Mở khi nhấn \"この設定を3倉庫へ反映\" (No.8.2). {倉庫名} là kho đang xem. Đóng (キャンセル, Esc, nhấn ra ngoài) thì về màn hình, không đổi gì."],
     "demo_ok": ["コードにない（C5）。足す", "Code chưa có (C5). Cần thêm."]},
    {"no": "12.1", "ja": "キャンセル（反映の小窓）", "vi": "Hủy (cửa sổ áp dụng)", "sel": "-", "kind": "button", "trig": "click",
     "detail": ["小窓を閉じて画面に戻る。出荷不可枠は変わらない。", "Đóng cửa sổ và về màn hình. Khung không xuất hàng không đổi."]},
    {"no": "12.2", "ja": "反映する", "vi": "Áp dụng", "sel": "-", "kind": "button", "trig": "click",
     "detail": ["いま見ている倉庫の出荷不可枠を、3倉庫すべてに上書きして小窓を閉じる。保存するまでは画面の中だけ（「設定を保存」で確定）。", "Ghi đè khung không xuất hàng của kho đang xem sang cả 3 kho rồi đóng cửa sổ. Chưa lưu thì chỉ trong màn hình (chốt bằng \"設定を保存\")."]},
]
TOAST = [
    {"no": "11", "ja": "保存後のトースト", "vi": "Toast sau khi lưu", "sel": ".toast", "kind": "toast", "trig": "show", "err": ["S131"],
     "detail": ["画面の右上に出す（全サイト共通・hong 2026-10-08 C-7）。保存できたとき：S131（作り直した予定の件数と、出荷待ち以降で「要確認」に出した件数）を出す。A1 を動かしてオーダー締切が本発注の時期に入る月があるときの警告 W135 は、トーストには重ねず、ページ内（帯の下・No.2.6）に出す。",
                "Hiện ở góc phải trên màn hình (chung toàn site; hong 2026-10-08 C-7). Khi lưu được: \"配送サイクル設定を保存しました。予定の配送を {n}件作り直しました。／出荷待ち以降の {m}件は要確認に出しました。\". Nếu dời A1 làm hạn đặt hàng của tháng nào đó rơi vào thời kỳ đặt hàng chính thì cảnh báo W135 không gộp vào toast mà hiện trong trang (dưới thanh, No.2.6)."]},
]
HIST = [
    {"no": "10", "ja": "変更履歴", "vi": "Lịch sử thay đổi", "sel": "-", "kind": "area", "trig": "view", "pattern": "P-HIST",
     "detail": ["画面の一番下。設定を保存するたびに、いつ・誰が・どの操作で・どこを・何を・影響件数を残す。列は P-HIST の標準7列（日時・操作した人・操作・項目・変更前・変更後・理由）＋影響件数。表示だけ（新しいものが上・直せない・消せない）。確定した月の設定は変えられないが、過去の予定の根拠はこの履歴で追える。行が多いときはページ送り（表示件数 10／20／50／100・初期 10。No.10.10）。",
                "Cuối màn hình. Mỗi lần lưu cài đặt ghi lại: khi nào, ai, thao tác gì, ở đâu, cái gì, số lượng ảnh hưởng. Cột: 7 cột chuẩn của P-HIST (日時, người thao tác, thao tác, mục, trước, sau, lý do) + số lượng ảnh hưởng. Chỉ xem (mới nhất ở trên, không sửa, không xóa). Cài đặt của tháng đã chốt không đổi được nhưng căn cứ của các lịch trước đó truy lại được qua lịch sử này. Nhiều dòng thì phân trang (số dòng hiển thị 10/20/50/100, mặc định 10; No.10.10)."],
     "demo_ok": ["コードに変更履歴の画面がない。コードで作る（hong 承認 2026-10-08 C-8。コードを作る担当は別）。できたら、状態 014 の項目の sel を実在の selector に直す", "Code chưa có khối lịch sử thay đổi. Làm trong code (hong duyệt 2026-10-08 C-8; có người phụ trách code riêng). Khi xong sẽ sửa sel của các mục trạng thái 014 thành selector thật."]},
    {"no": "10.1", "ja": "日時", "vi": "Ngày giờ", "sel": "-", "kind": "label", "trig": "view",
     "detail": ["保存した日時（yyyy-mm-dd HH:MM）。", "Thời điểm lưu (yyyy-mm-dd HH:MM)."]},
    {"no": "10.2", "ja": "操作した人", "vi": "Người thao tác", "sel": "-", "kind": "label", "trig": "view",
     "detail": ["保存したアカウントの名前（IDを併記）。", "Tên tài khoản đã lưu (kèm ID)."]},
    {"no": "10.3", "ja": "操作", "vi": "Thao tác", "sel": "-", "kind": "label", "trig": "view",
     "detail": ["した操作の種類（登録／変更／削除など）。P-HIST の標準の列。", "Loại thao tác đã làm (登録／変更／削除…). Cột chuẩn của P-HIST."]},
    {"no": "10.4", "ja": "項目", "vi": "Mục", "sel": "-", "kind": "label", "trig": "view",
     "detail": ["変えた設定の名前（月ごとの A1・祝日・臨休・サイクル休止・出荷不可枠・出荷不可日・設定対象期間のどれか）と、対象の月・倉庫・名前。1回の保存で変えた項目は1つの操作としてまとめる。",
                "Tên cài đặt đã đổi (một trong: A1 theo tháng, ngày lễ・nghỉ đột xuất, tạm dừng chu kỳ, khung không xuất hàng, ngày không xuất hàng, thời gian cài đặt) kèm tháng, kho, tên liên quan. Các mục đổi trong 1 lần lưu gộp thành 1 thao tác."]},
    {"no": "10.5", "ja": "変更前", "vi": "Trước khi đổi", "sel": "-", "kind": "label", "trig": "view",
     "detail": ["変える前の値。新しく足したものは「—」。", "Giá trị trước khi đổi. Mục mới thêm thì \"—\"."]},
    {"no": "10.6", "ja": "変更後", "vi": "Sau khi đổi", "sel": "-", "kind": "label", "trig": "view",
     "detail": ["変えたあとの値。削除したものは「—」。", "Giá trị sau khi đổi. Mục đã xóa thì \"—\"."]},
    {"no": "10.7", "ja": "理由", "vi": "Lý do", "sel": "-", "kind": "label", "trig": "view",
     "detail": ["理由がある操作のときだけ出す。このサイクル設定の保存には理由欄がないので、この画面からの記録では空欄（P-HIST の標準の列）。", "Chỉ hiện với thao tác có lý do. Lưu cài đặt chu kỳ này không có ô lý do nên ghi từ màn hình này để trống (cột chuẩn của P-HIST)."]},
    {"no": "10.8", "ja": "影響件数", "vi": "Số lượng ảnh hưởng", "sel": "-", "kind": "label", "trig": "view",
     "detail": ["その保存が、すでにある配送に与えた影響の件数を内訳で出す：「作り直した n件／要確認に出した m件」。保存前の確認の表（No.9.2）と同じ分け方（C2）。", "Số lượng giao hàng đã có bị ảnh hưởng bởi lần lưu đó, hiện theo chi tiết: \"作り直した n件／要確認に出した m件\" (đã tạo lại n / đưa vào 要確認 m). Cùng cách chia với bảng xác nhận trước khi lưu (No.9.2) (C2)."]},
]
HIST_PAGE = [
    {"no": "10.10", "ja": "表示件数", "vi": "Số dòng hiển thị", "sel": "-", "kind": "select", "trig": "select", "req": "－",
     "len": ["選択（10／20／50／100 件／ページ）", "Chọn (10 / 20 / 50 / 100 dòng/trang)"], "init": ["10件／ページ", "10 dòng/trang"], "ex": ["20件／ページ", "20 dòng/trang"],
     "detail": ["変更履歴のページ送りの件数。10／20／50／100（初期 10）。変えると1ページ目に戻る。", "Số dòng mỗi trang của 変更履歴: 10/20/50/100 (mặc định 10). Đổi thì về trang 1."],
     "demo_ok": ["コードに変更履歴がない（No.10）。足すとき表示件数も付ける", "Code chưa có 変更履歴 (No.10). Khi thêm cần kèm số dòng hiển thị."]},
]
NOPERM = [
    {"no": "13", "ja": "権限がないときの表示", "vi": "Hiển thị khi không có quyền", "sel": "-", "kind": "area", "trig": "show", "err": ["E32"],
     "detail": ["フル権限・物流以外の役割（経理・営業・CS・商品管理・商品開発）が URL（/ops/delivery/schedule/cycle）を直接開いたとき、画面は出さず、権限なし（E32）を出す。メニューにも、スケジュール（AW_SCHD）の「配送サイクル設定」ボタンにも、この画面への入口は出さない。",
                "Khi vai trò ngoài フル権限・物流 (経理, 営業, CS, 商品管理, 商品開発) mở trực tiếp URL (/ops/delivery/schedule/cycle) thì không hiện màn hình mà báo không có quyền (E32). Không có lối vào ở menu lẫn nút \"配送サイクル設定\" của スケジュール (AW_SCHD)."],
     "demo_ok": ["コードは経理・営業・CS などにも画面を開き、閲覧だけにする。権限なし（E32）に変える（C7）", "Code cho 経理, 営業, CS… mở màn và chỉ xem. Cần đổi thành không có quyền (E32) (C7)."]},
]
HIST_EMPTY = [
    {"no": "10.9", "ja": "履歴が0件のとき", "vi": "Khi lịch sử 0 dòng", "sel": "-", "kind": "label", "trig": "view", "err": ["I01"], "pattern": "P-LIST",
     "detail": ["まだ保存したことがない（履歴が0件の）ときは、表の中に I01 を出す。", "Khi chưa từng lưu (lịch sử 0 dòng) thì hiện I01 trong bảng."]},
]


def rep(items, no, **kw):
    """同じ番号の項目を、その状態用に書き換えて返す"""
    out = []
    for it in items:
        if it["no"] == no:
            it = dict(it); it.update(kw)
        out.append(it)
    return out


def pick(items, *nos):
    return [it for it in items if it["no"] in nos]


def V(id, ja, vi, items, setup="", note=None, full=True, wait=500, login=None, chk=None):
    v = {"id": id, "code": "AW_CYCL_001", "state": [ja, vi], "url": "/ops/delivery/schedule/cycle", "setup": (H + setup) if setup else "",
         "full": full, "wait": wait, "note": note or ["", ""], "items": items}
    if login: v["login"] = login
    if chk: v["chk"] = chk
    return v


VIEWS = [
    V("001", "初期表示（祝日・臨休タブ）", "Hiển thị ban đầu (thẻ 祝日・臨休)",
      HEAD + BAND + PERIOD + A1 + CAL + PANEL + HOL + HIST + HIST_PAGE, "",
      note=["フル権限（Ad00010）で開いた画面。画面の下の「変更履歴」（No.10）と最終保存日時（No.1.2）は決定（Q10＝A）で、コードにはまだない。",
            "Màn hình mở bằng フル権限 (Ad00010). 変更履歴 (No.10) ở cuối và 最終保存日時 (No.1.2) là quyết định (Q10 = A), code chưa có."]),
    V("002", "確定済みの月を選んだ（A1 は入力できない）", "Chọn tháng đã chốt (không nhập được A1)",
      rep(pick(A1, "14.1") + pick(BAND, "2.1", "2.5"), "14.1", cond=A1[1]["cond"]),
      "qa('div[role=button]').find(e=>(e.textContent||'').includes('確定済')).click();await sleep(400);",
      note=["帯の「確定済」のセルを押した状態。A1 の欄は無効になり、下に理由を出す（I03 の言い回し）。", "Trạng thái nhấn ô \"確定済み\" ở thanh. Ô A1 bị vô hiệu và hiện lý do bên dưới (theo cách nói của I03)."]),
    V("003", "設定のない月がある（穴の警告）", "Có tháng chưa thiết lập (cảnh báo lỗ hổng)",
      HOLE + pick(BAND, "2.1"), "", full=False,
      note=["確定済みと設定済みのあいだに空きの月があるとき、帯の下に赤い警告（I132）が出る。見本データに穴の月（2027-05）を1つ足してあるので、この警告が撮れる（デモの見本だけ・C3）。", "Khi giữa tháng đã chốt và tháng đã thiết lập có tháng trống thì hiện cảnh báo đỏ (I132) dưới thanh. Dữ liệu mẫu đã thêm 1 tháng trống (2027-05) nên chụp được cảnh báo này (chỉ mẫu demo, C3)."]),
    V("004", "サイクル休止タブ（休止を1件足した）", "Thẻ サイクル休止 (đã thêm 1 kỳ tạm dừng)",
      PAUSE[:1] + PAUSE[1:7] + PAUSE[7:], "await addPause();",
      note=["タブを替え、3日の休止（2026-12-29〜12-31）を足した状態。決定どおりなら「あと4日」を出し、調整は自動で足さない。コードの画面は調整を自動で足す表示になる（宿題）。",
            "Đổi thẻ và thêm kỳ tạm dừng 3 ngày (2026-12-29〜12-31). Theo quyết định thì hiện \"あと4日\" và không tự thêm 調整. Màn hình code hiện kiểu tự thêm 調整 (việc cần làm)."]),
    V("005", "休止の追加で入力エラー", "Lỗi nhập khi thêm tạm dừng",
      rep(pick(PAUSE, "7.7", "7.8", "7.9", "7.11"), "7.9", err=["E01", "E08"]),
      "tab('サイクル休止').click();await sleep(300);const f=q('.pnl .form');const x=ins(f);setv(x[1],'2026-12-31');setv(x[2],'2026-12-29');await sleep(200);btn(f,'追加').click();await sleep(400);", full=False,
      note=["期間名を空・終了日を開始日より前にして「追加」を押した状態。エラーは項目の下に出す。", "Trạng thái nhấn \"追加\" khi để trống tên kỳ và ngày kết thúc trước ngày bắt đầu. Lỗi hiện dưới từng mục."]),
    V("006", "休止が7の倍数でなく保存できない", "Tạm dừng không là bội số của 7 nên không lưu được",
      pick(PAUSE, "7.6") + pick(HEAD, "1.4"),
      "await addPause();save().click();await sleep(500);", full=False,
      note=["3日の休止を足したまま「設定を保存」を押した状態。決定では確認の小窓を開かず、不足日数（あと4日）を、短くわかりやすい言葉（E168）で示して保存を止める。コードは調整を自動で足して小窓へ進む（宿題）。",
            "Trạng thái nhấn \"設定を保存\" khi còn kỳ tạm dừng 3 ngày. Theo quyết định không mở cửa sổ xác nhận mà báo số ngày thiếu (あと4日) và chặn lưu. Code tự thêm 調整 và đi tiếp tới cửa sổ (việc cần làm)."]),
    V("007", "出荷不可タブ（倉庫ごと）", "Thẻ 出荷不可 (theo kho)",
      NG[:8] + NG[8:], "tab('出荷不可').click();await sleep(400);",
      note=["タブを替えた状態。倉庫のタブ・出荷不可枠・納品不可枠・日別の出荷不可日が並ぶ。コードは関東・関西の2倉庫だけ（決定は倉庫マスタの3つ）。",
            "Trạng thái đã đổi thẻ. Có thẻ kho, khung không xuất hàng, khung không giao hàng, ngày không xuất hàng. Code chỉ có 2 kho Kanto・Kansai (quyết định là 3 kho theo 倉庫マスタ)."]),
    V("008", "出荷不可日の追加で入力エラー", "Lỗi nhập khi thêm ngày không xuất hàng",
      pick(NG, "8.6", "8.7", "8.9"),
      "tab('出荷不可').click();await sleep(400);btn(q('.pnl .form'),'追加').click();await sleep(400);", full=False,
      note=["理由・日付を空にして「追加」を押した状態。", "Trạng thái nhấn \"追加\" khi để trống lý do và ngày."]),
    V("009", "休日の追加で入力エラー", "Lỗi nhập khi thêm ngày nghỉ",
      pick(HOL, "6.5", "6.6", "6.7", "6.8"),
      "const f=q('.pnl .form');btn(f,'追加').click();await sleep(400);", full=False,
      note=["休日名・日付を空にして「追加」を押した状態（追加フォームのチェックは「配送祝日」だけ）。", "Trạng thái nhấn \"追加\" khi để trống tên và ngày (form chỉ còn ô tích \"配送祝日\")."]),
    V("010", "保存の入力エラー（A1 が月曜でない）", "Lỗi nhập khi lưu (A1 không phải thứ Hai)",
      rep(pick(A1, "14.1") + pick(HEAD, "1.4"), "14.1", ex=A1[1]["ex"]),
      "const a=qa('.es-field').find(f=>(f.textContent||'').includes('サイクルの A1'));setv(q('input',a),'2026-12-08');await sleep(200);save().click();await sleep(500);", full=False,
      note=["A1 を火曜（2026-12-08）にして「設定を保存」を押した状態。エラーは A1 の欄の下に出す（コードはトーストも出す）。", "Trạng thái đặt A1 là thứ Ba (2026-12-08) rồi nhấn \"設定を保存\". Lỗi hiện dưới ô A1 (code còn hiện thêm toast)."]),
    V("011", "設定を保存しますか？（変更なし・影響なし）", "Cửa sổ \"設定を保存しますか？\" (không thay đổi, không ảnh hưởng)",
      MODAL[:3] + [m for m in MODAL[4:] if m["no"] != "9.7"], "save().click();await sleep(800);", full=False,
      note=["何も変えずに「設定を保存」を押した状態。「変更はありません。」と影響0件の表。確認のチェックは出ない。", "Trạng thái nhấn \"設定を保存\" mà không đổi gì. Hiện \"変更はありません。\" và bảng ảnh hưởng 0. Không có ô tích xác nhận."]),
    V("012", "設定を保存しますか？（影響あり・確認のチェックが必要）", "Cửa sổ \"設定を保存しますか？\" (có ảnh hưởng, cần ô tích xác nhận)",
      MODAL, "await addHol();save().click();await sleep(900);", full=False,
      note=["お届け予定のある日（2026-11-17）を臨時休業として足してから保存を押した状態。影響の表・例・確認のチェックが出る。表は決定の3つの分け方（コードは6行）。",
            "Trạng thái thêm ngày 2026-11-17 (có lịch giao) thành nghỉ đột xuất rồi nhấn lưu. Hiện bảng ảnh hưởng, ví dụ, ô tích xác nhận. Bảng chia 3 nhóm theo quyết định (code là 6 dòng)."]),
    V("013", "保存後（トースト）", "Sau khi lưu (toast)",
      WARN135 + TOAST,
      "await addHol();save().click();await sleep(900);const c=q('.es-modal__body .es-check input');if(c){c.click();await sleep(200);}btn(q('.es-modal__actions'),'確認して保存').click();await sleep(700);", full=False,
      note=["確認のチェックを入れて「確認して保存」を押した直後。成功はトースト（モーダルは出さない）。位置は画面の右上。", "Ngay sau khi tích ô xác nhận và nhấn \"確認して保存\". Thành công = toast (không hiện modal). Vị trí: góc phải trên màn hình."]),
    V("014", "変更履歴", "Lịch sử thay đổi",
      HIST + HIST_PAGE,
      "window.scrollTo(0,document.body.scrollHeight);await sleep(300);",
      note=["画面の一番下の「変更履歴」（P-HIST）。コードで作る予定（hong 承認 2026-10-08・作る担当は別）。まだないので、いまの画面には写らない。作ったら sel を実在のものに直す（宿題）。", "Khối \"変更履歴\" (P-HIST) ở cuối màn hình. Sẽ làm trong code (hong duyệt 2026-10-08; có người phụ trách riêng) nên màn hình hiện tại chưa hiện. Khi xong sẽ sửa sel (việc cần làm)."]),
    V("015", "変更履歴が0件", "Lịch sử thay đổi 0 dòng",
      HIST_EMPTY,
      "window.scrollTo(0,document.body.scrollHeight);await sleep(300);",
      note=["まだ一度も保存していないとき。コードで作る予定（hong 承認 2026-10-08・作る担当は別）。まだないので、いまの画面には写らない。作ったら sel を実在のものに直す（宿題）。", "Khi chưa từng lưu. Sẽ làm trong code (hong duyệt 2026-10-08; có người phụ trách riêng) nên màn hình hiện tại chưa hiện. Khi xong sẽ sửa sel (việc cần làm)."]),
    V("016", "権限がないとき", "Khi không có quyền",
      NOPERM,
      "", login="Ad00012", full=False,
      note=["経理（Ad00012）など、フル権限・物流以外の役割が URL を直接開いた状態。画面は出さず、権限なし（E32）を出す。メニューにもスケジュールのボタンにも入口は出さない（C7）。コードは経理にも画面を開くので、この状態は決定どおりの姿（宿題）。",
            "Trạng thái vai trò ngoài フル権限・物流 như 経理 (Ad00012) mở trực tiếp URL. Không hiện màn hình mà báo không có quyền (E32). Không có lối vào ở menu lẫn nút của スケジュール (C7). Code vẫn mở màn cho 経理 nên đây là hình theo quyết định (việc cần làm)."]),
    V("017", "3倉庫へ反映しますか？（確認の小窓）", "Cửa sổ \"3倉庫へ反映しますか？\"",
      WH_MODAL, "", full=False,
      note=["出荷不可タブで「この設定を3倉庫へ反映」を押した状態（Q133）。コードにこのボタンも小窓もないので、いまの画面には写らない（宿題・C5）。",
            "Trạng thái nhấn \"この設定を3倉庫へ反映\" ở thẻ 出荷不可 (Q133). Code chưa có nút lẫn cửa sổ này nên màn hình hiện tại không hiện (việc cần làm, C5)."]),
    V("018", "ほかの人が編集中（I02）", "Người khác đang sửa (I02)",
      pick(HEAD, "1", "1.5"), "", full=False,
      note=["ほかの人が同じ画面を開いているとき。ページ上部に I02 を出す。ロックはしないので保存は止めない。見本のデータでは作れない（図だけ）。", "Khi người khác cũng đang mở màn hình này. Hiện I02 ở đầu trang. Không khóa nên không chặn lưu. Không tạo được bằng dữ liệu mẫu (chỉ hình)."]),
    V("019", "ほかの人が先に保存した（E31）", "Người khác đã lưu trước (E31)",
      pick(HEAD, "1.6"), "", full=False,
      note=["「確認して保存」を押したとき、ほかの人が先に保存していた状態。E31 の警告の小窓（「キャンセル」「上書きして保存」）。見本のデータでは作れない（図だけ）。", "Trạng thái nhấn 「確認して保存」 mà người khác đã lưu trước. Cửa sổ cảnh báo E31 (「キャンセル」「上書きして保存」). Không tạo được bằng dữ liệu mẫu (chỉ hình)."]),
    V("020", "離れる前の確認（Q02）", "Xác nhận trước khi rời đi (Q02)",
      pick(HEAD, "1.7"), "await addHol();", full=False,
      note=["休日を足したあと、戻る・キャンセル・ほかの画面への移動などで離れようとした状態。Q02（キャンセル／破棄）。再読み込み・閉じるはブラウザ標準の確認。", "Trạng thái sau khi thêm ngày nghỉ rồi định rời đi bằng Back, キャンセル, chuyển màn… Q02 (キャンセル／破棄). Tải lại / đóng là hộp xác nhận chuẩn của trình duyệt."]),
    V("021", "ログイン切れ（保存のとき）", "Hết phiên đăng nhập (khi lưu)",
      pick(HEAD, "1.8"), "", full=False,
      note=["「確認して保存」を押したとき、ログインの有効期間が切れていた状態。ログインの小窓を出し、ログイン後に保存を続ける。見本のデータでは作れない（図だけ）。", "Trạng thái nhấn 「確認して保存」 mà thời hạn đăng nhập đã hết. Hiện cửa sổ đăng nhập, đăng nhập xong lưu tiếp. Không tạo được bằng dữ liệu mẫu (chỉ hình)."]),
]


# ---------------------------------------------------------------- この状態の画面には出ない番号（sel を "-" にする。撮影で「見つからない」にしない。定義は変えない）
# 016：保存できない役割には「設定を保存」が出ない（cond のとおり）
_ABSENT = {
    "016": {"1.4": None},
}
for _v in VIEWS:
    _a = _ABSENT.get(_v["id"], {})
    for _it in _v["items"]:
        if _it["no"] in _a:
            _it["sel"] = "-"
            if _a[_it["no"]] and "demo_ok" not in _it:
                _it["demo_ok"] = _a[_it["no"]]
