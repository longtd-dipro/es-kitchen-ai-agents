# -*- coding: utf-8 -*-
"""
委託配送先Web「ホーム・お知らせ詳細」（OW_HOME）の画面設計書データ。
元：本物の Web（app/carrier/page.tsx・news/[id]/page.tsx・_ui/CarrierShell.tsx・_ui/Calendar.tsx・lib/carrier/*）。
決定：docs/決定台帳.md F（2026-10-07：Screen Code＝OW、委託配送先のお知らせは受信先の会社で絞る、ログイン期限は全サイト1日）と 確認メモ_TW_委託配送先 の回答。
コードがまだ決定に追いついていないところは demo_ok（確認メモ §3 の H-20〜H-23・H-33、台帳 S の通知の枠）。
決定（台帳 S・2026-10-08）：自動通知はホームの別の枠「通知」に出す（受付簿 #428）・「既読」の状態は DA のお知らせだけで OW には持たない（#456）。
"""

TITLE = ["ホーム・お知らせ詳細（OW_HOME）", "Trang chủ・Chi tiết thông báo (OW_HOME)"]
SHEET = ["ホーム", "Trang chủ"]
BASENAME = "画面設計書_OW_HOME_ホーム"
IMG_PREFIX = "OW_HOME"
OUT_DIR = "委託配送先Web"
CODE_NOTE = ["Screen Code は台帳 F（2026-10-07）の決まり：OW_<機能略>_<3桁>。委託配送先＝OW", "Screen Code theo 台帳 F (2026-10-07): OW_<機能略>_<3 chữ số>. 委託配送先 = OW"]
SITE = "carrier"
SYSTEM = {"ja": "委託配送先Web", "vi": "Web đối tác giao hàng (委託配送先Web)"}
AUTHOR = "Claude／確認：hong"
CREATED = "2026-10-07"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "carrier", "loginId": "DE00001"}
CODE_PATHS = ["app/carrier", "lib/carrier", "lib/domain/seed"]

DECISIONS = [
    {"date": "2026-10-07", "target": "OW_HOME 全体",
     "q": ["委託配送先Web の Screen Code の頭文字", "Tiền tố Screen Code của Web đối tác giao hàng"],
     "a": ["OW（委託配送先Web）。ドライバーは DA", "OW (委託配送先Web). Tài xế là DA"], "src": "hong 回答 2026-10-07（台帳 F・受付簿 No.290）"},
    {"date": "2026-10-07", "target": "OW_HOME_001 No.4",
     "q": ["ホームのお知らせに出すお知らせの範囲", "Phạm vi thông báo hiện ở Trang chủ"],
     "a": ["お知らせは受信先の会社で絞って出す（全社には出さない）", "Thông báo lọc theo công ty nhận (không hiện cho mọi công ty)"], "src": "hong 回答 2026-10-07（台帳 F「委託配送先の集金管理・お知らせ」・受付簿 No.293）"},
    {"date": "2026-10-07", "target": "OW_HOME 全体 No.1",
     "q": ["ログインの有効期間", "Thời hạn đăng nhập"],
     "a": ["全サイト 1日（台帳 K のまま）。切れたら次の操作でログイン画面へ戻る", "Mọi site đều 1 ngày (giữ nguyên 台帳 K). Hết hạn thì thao tác tiếp theo quay về màn đăng nhập"], "src": "hong 回答 2026-10-07（確認メモ_TW 発見事項・台帳 K）"},
    {"date": "2026-10-08", "target": "OW_HOME_001 No.8",
     "q": ["システム自動通知（ドライバー未設定の警告・配送の内容が変わった知らせ など）の置き場（確認表 H-13）", "Chỗ hiển thị thông báo tự động của hệ thống (cảnh báo chưa gán tài xế, thông báo khi nội dung chuyến thay đổi v.v.) (bảng xác nhận H-13)"],
     "a": ["ホームに、お知らせ（No.4）とは別の枠「通知」を足し、自動通知（担当ドライバー未設定の警告＝納品日の3日前・前日、配送の内容が変わったときの知らせ など）はそこに出す。お知らせの欄には混ぜない（DA はお知らせ一覧に混ぜる設計のまま）", "Thêm vào Trang chủ một khung riêng 「通知」 tách khỏi 「お知らせ」 (No.4); thông báo tự động (cảnh báo chưa gán tài xế = 3 ngày và 1 ngày trước ngày giao, thông báo khi nội dung chuyến thay đổi v.v.) hiện ở đó. Không trộn vào mục お知らせ (DA vẫn giữ thiết kế trộn vào danh sách お知らせ)"],
     "src": "hong 回答 2026-10-08（台帳 S「システム自動通知の置き場（OW）」・受付簿 #428）。置き換えた旧案：「お知らせに『自動通知』タグつきで混ぜる」（Claude 推奨 Q-10）"},
    {"date": "2026-10-08", "target": "OW_HOME_001 No.4・8",
     "q": ["「既読」の状態を持つ場所（OW のお知らせ・通知）", "Nơi giữ trạng thái 「既読」 (thông báo của OW)"],
     "a": ["既読は個人で使うドライバーアプリ（DA）のお知らせだけ。OW のお知らせ・通知（枠「通知」も）には「既読」の状態を持たない（複数の担当者が共用するため）", "Trạng thái 「既読」 chỉ có ở thông báo của ứng dụng tài xế (DA) dùng cá nhân. Thông báo của OW (kể cả khung 「通知」) không giữ trạng thái 「既読」 (vì nhiều người phụ trách dùng chung)"],
     "src": "hong 回答 2026-10-08（台帳 S「『既読』の状態を持つ場所」・受付簿 #456）。置き換えた旧案：OW_HOME の既読の仕組み（1人が開けば会社として既読）"},
    {"date": "2026-10-07", "target": "OW_HOME_002 No.12",
     "q": ["存在しない ID のお知らせ詳細を開いたときの表示", "Hiển thị khi mở chi tiết thông báo có ID không tồn tại"],
     "a": ["先頭のお知らせを出さず、「お知らせが見つかりません」の表示にする（一覧へ戻るボタンつき）", "Không hiện thông báo đầu tiên mà hiện 「お知らせが見つかりません」 (kèm nút về danh sách)"],
     "src": "確認メモ_TW H-23（決定済みの宿題）"},
    {"date": "2026-10-07", "target": "OW_HOME_001 No.1.3", "q": ["委託配送先Web のマニュアルのリンク先（O-2）", "Liên kết hướng dẫn của Web đối tác giao hàng (O-2)"], "a": ["運営Web の設定画面に、法人・ドライバー・仕入先と同じ画面で置く。空のときは出さない", "Đặt ở màn cài đặt của 運営 cùng màn với pháp nhân・tài xế・nhà cung cấp. Rỗng thì không hiện"], "src": "Claude 推奨・hong 確認待ち（確認メモ_TW §4 の推奨。hong 2026-10-07 の open 回答のうち個別の答えがないもの）"},
]
CHANGES = []

HIDE_ALWAYS = [".es-demo-bar", "#es-review"]
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [
    {"code": "OW_HOME_001", "ja": "ホーム", "vi": "Trang chủ"},
    {"code": "OW_HOME_002", "ja": "お知らせ詳細", "vi": "Chi tiết thông báo"},
]

def I(no, ja, vi, sel, kind="label", trig="view", **kw):
    d = {"no": no, "ja": ja, "vi": vi, "sel": sel, "kind": kind, "trig": trig}
    d.update(kw)
    return d

OPEN_O2 = {"open": ["マニュアルのリンク先（委託配送先Web の操作マニュアルを置くか）が決まっていない。客先に確認する", "Chưa quyết liên kết của nút \"マニュアル\" (có đặt tài liệu hướng dẫn cho Web đối tác không). Cần hỏi khách"], "ask": "お客様（ESキッチン）"}
CODE_NOT_YET = lambda ja, vi: {"demo_ok": [ja, vi]}

FRAME = [
    I("1", "共通の枠（サイドメニュー・ヘッダー）", "Khung chung (menu bên, header)", ".sider", "area",
      detail=["委託配送先Web のログイン後の全画面で共通。ログイン前の画面（ログイン・パスワード再設定・お申し込み）には出さない。ログインしていなければログイン画面へ移る。ログインの有効期間は1日で、切れたら次の操作でログイン画面へ戻る（台帳 K）。他の画面の設計書には書かない。",
              "Dùng chung cho mọi màn hình sau đăng nhập của Web đối tác giao hàng; không hiện ở các màn trước đăng nhập (Đăng nhập, Đặt lại mật khẩu, Đăng ký). Chưa đăng nhập thì chuyển về màn đăng nhập. Thời hạn đăng nhập 1 ngày; hết hạn thì thao tác tiếp theo quay về màn đăng nhập (台帳 K). Không ghi lại ở thiết kế các màn khác."]),
    I("1.1", "サイドメニュー", "Menu bên", ".menu", "area",
      detail=["上から ホーム／［日々の配送］スケジュール・配送管理・トラブル／［お金・案件］集金管理・見積依頼／［管理］配送スタッフ・プロフィール。今開いている画面の項目を強調する。権限による出し分けはない（アカウントは1社に1つで、役割は委託配送先管理者だけ）。",
              "Từ trên xuống: ホーム／[日々の配送] スケジュール・配送管理・トラブル／[お金・案件] 集金管理・見積依頼／[管理] 配送スタッフ・プロフィール. Mục của màn đang mở được tô đậm. Không phân quyền hiển thị (mỗi công ty 1 tài khoản, vai trò duy nhất là quản trị đối tác giao hàng)."]),
    I("1.2", "メニューを折りたたむ", "Thu gọn menu", "button.fold", "button", "click",
      detail=["サイドメニューを細くする／広げる。画面を変えても今の状態は変わらない。", "Thu hẹp / mở rộng menu bên. Đổi màn hình không làm đổi trạng thái hiện tại."]),
    I("1.3", "マニュアル", "Hướng dẫn", "button[aria-label=\"マニュアル\"]", "button", "click",
      detail=["操作マニュアルを開くボタン。リンク先は運営Web の設定画面に置き、システム管理が変える（法人・ドライバー・仕入先のマニュアルのリンクと同じ画面。Claude 推奨・hong 確認待ち）。URL が空のときはボタンを出さない。", "Nút mở hướng dẫn thao tác. Liên kết đặt ở màn cài đặt của 運営 và quản trị hệ thống đổi được (cùng màn với liên kết hướng dẫn của pháp nhân・tài xế・nhà cung cấp; Claude đề xuất, chờ hong xác nhận). URL rỗng thì không hiện nút."]),
    I("1.4", "アカウントのメニュー", "Menu tài khoản", "button.prof", "button", "click",
      detail=["委託配送先名（ログインした会社の名前）を出す。押すと「プロフィール」「ログアウト」を出す。ログイン中のパスワード変更の画面は置かない。変えたいときはログイン画面の「パスワードを忘れた方」から再設定する（台帳 F「パスワードの扱い」）。入力中の変更があれば Q02 を出してから移る。",
              "Hiện tên đối tác giao hàng (công ty đang đăng nhập). Bấm để hiện 「プロフィール」「ログアウト」. Không có màn đổi mật khẩu khi đang đăng nhập; muốn đổi thì đặt lại từ 「パスワードを忘れた方」 ở màn đăng nhập (台帳 F). Nếu đang nhập dở thì hiện Q02 rồi mới chuyển."],
      err=["Q02"], pattern="P-FORM"),
]

H_ITEMS = [
    I("2", "見出し", "Tiêu đề trang", ".crumb", "area",
      detail=["パンくず「ホーム」と画面名「ホーム」。", "Breadcrumb 「ホーム」 và tên màn 「ホーム」."]),
    I("2.1", "画面名", "Tên màn hình", "h1.ptitle", "label", detail=["画面名は「ホーム」。", "Tên màn hình là 「ホーム」."]),
    I("3", "今月の配送スケジュール", "Lịch giao hàng tháng này", "h2::今月の配送スケジュール^2", "area",
      detail=["今月（デモの今日が属する月）の月カレンダー。月曜始まり。自社が運ぶ区間の配送を納品日で数える。他社の配送は出さない。月送りはなく、先の月・過去の月は「スケジュールへ」から見る。",
              "Lịch tháng hiện tại (tháng của ngày hôm nay). Bắt đầu từ thứ Hai. Đếm các chuyến thuộc chặng do công ty mình chạy theo ngày giao; không hiện chuyến của công ty khác. Không chuyển tháng; muốn xem tháng khác thì vào 「スケジュールへ」."]),
    I("3.1", "スケジュールへ", "Tới Lịch", "a.linkbtn::スケジュールへ", "link", "click",
      detail=["スケジュール（OW_SCHD_001）を開く。", "Mở Lịch (OW_SCHD_001)."]),
    I("3.2", "曜日の見出し", "Tiêu đề thứ", ".dow", "label", detail=["月・火・水・木・金・土・日（月曜始まり）", "月・火・水・木・金・土・日 (bắt đầu từ thứ Hai)"]),
    I("3.3", "日付のマス", "Ô ngày", ".cal .day:not(.other)", "link", "click",
      detail=["1日＝1マス。今日のマスは枠を強調し、先月・来月の日は灰色。押すとスケジュール（OW_SCHD_001）へ移る。", "1 ngày = 1 ô. Ô hôm nay viền nổi bật, ngày của tháng trước/sau màu xám. Bấm để chuyển tới Lịch (OW_SCHD_001)."]),
    I("3.3.1", "日付", "Ngày", ".cal .day:not(.other) .num", "label", detail=["日（1〜31）。", "Ngày (1〜31)."]),
    I("3.3.2", "サイクル", "Chu kỳ", ".cal .day:not(.other) .cy", "label",
      detail=["「◯月サイクル」と週の記号（A1〜D7）。週の色は A／B／C／D で分ける。サイクルのない日は「休」と出す。", "「◯月サイクル」 và ký hiệu tuần (A1〜D7). Màu tuần phân biệt theo A／B／C／D. Ngày không có chu kỳ hiện 「休」."]),
    I("3.3.3", "配送の件数", "Số chuyến giao", ".cal .cnt", "label",
      detail=["自社が運ぶ区間の配送がある日だけ「配送：n件」。確定前の「予定」の配送も数える。", "Chỉ ngày có chuyến thuộc chặng công ty mình chạy mới hiện 「配送：n件」. Chuyến còn ở trạng thái 「予定」 (chưa chốt) cũng được đếm."]),
    I("3.4", "凡例", "Chú giải", ".legend", "label",
      detail=["サイクルの色・祝休日・配送スタッフ未設定・当日・温度帯のアイコンの意味。", "Ý nghĩa màu chu kỳ, ngày lễ/nghỉ, chưa gán nhân viên giao hàng, ngày hôm nay và biểu tượng vùng nhiệt."]),
    I("4", "お知らせ", "Thông báo", "h2::お知らせ^2", "area", err=["I203"],
      detail=["委託配送先向けに配信中のお知らせ。自社が配信対象のものだけを出す（全員向け・個別選択のどちらでも自社が含まれるもの）。重要なお知らせが上、次に新しい順。0件は I203。ここには運営のお知らせだけを出し、システムの自動通知は別の枠「通知」（No.8）に出す。「既読」の状態は持たない（複数の担当者が共用するため。既読は DA のお知らせだけ：台帳 S）。",
              "Thông báo đang phát cho đối tác giao hàng. Chỉ hiện thông báo mà công ty mình là đối tượng (gửi cho tất cả hoặc chọn riêng đều có công ty mình). Thông báo quan trọng ở trên, sau đó mới nhất trước. 0 mục: I203. Ở đây chỉ hiện thông báo của 運営; thông báo tự động của hệ thống hiện ở khung riêng 「通知」 (No.8). Không giữ trạng thái 「既読」 (vì nhiều người phụ trách dùng chung; 既読 chỉ có ở thông báo của DA: 台帳 S)."],
      demo_ok=["コードは自社に関係なく委託配送先向けのお知らせを全部出す（確認メモ H-20・H-21）。コードを直す宿題（既読の仕組みは設計にもコードにもない）", "Code hiện toàn bộ thông báo dành cho đối tác bất kể công ty (確認メモ H-20・H-21). Việc sửa code còn tồn (cơ chế đã đọc không có trong thiết kế lẫn code)"]),
    I("4.1", "お知らせの行", "Dòng thông báo", ".news button", "link", "click",
      detail=["日付・カテゴリのバッジ（重要なお知らせは「重要」）・タイトル。押すとお知らせ詳細（OW_HOME_002）を開く。「未読」「既読」の印は出さない。",
              "Ngày, badge thể loại (thông báo quan trọng ghi 「重要」), tiêu đề. Bấm mở chi tiết thông báo (OW_HOME_002). Không hiện dấu 「未読」「既読」."]),
    I("4.1.1", "日付・カテゴリ", "Ngày, thể loại", ".news button .meta", "label", detail=["公開日（yyyy-mm-dd）とバッジ。今日公開のものは「今日」。", "Ngày công khai (yyyy-mm-dd) và badge. Thông báo công khai hôm nay ghi 「今日」."]),
    I("4.1.2", "タイトル", "Tiêu đề", ".news button .t", "label", detail=["お知らせのタイトル。", "Tiêu đề thông báo."]),
    I("4.2", "お知らせが0件のとき", "Khi không có thông báo", "-", "label", err=["I203"],
      detail=["I203「お知らせはありません。」を枠の中に出す。", "Hiện I203 「お知らせはありません。」 trong khung."],
      demo_ok=["見本データでは委託配送先向けのお知らせが常に1件以上あるため撮れない", "Dữ liệu mẫu luôn có ≥1 thông báo cho đối tác nên không chụp được"]),
    I("5", "未回答の見積依頼", "Yêu cầu báo giá chưa trả lời", "h2::未回答の見積もり依頼^2", "area", err=["I301"],
      detail=["回答がまだの見積依頼（期限切れ・回答済み・対応不可は出さない）。受信日の新しい順。0件は I301。", "Yêu cầu báo giá chưa trả lời (không hiện đã hết hạn, đã trả lời, không đáp ứng được). Mới nhận trước. 0 mục: I301."]),
    I("5.1", "見積もり一覧へ", "Tới danh sách báo giá", "a.linkbtn::見積もり一覧へ", "link", "click",
      detail=["見積依頼の一覧（OW_QUOT_001）を開く。", "Mở danh sách yêu cầu báo giá (OW_QUOT_001)."]),
    I("5.2", "未回答が0件のとき", "Khi không có yêu cầu chưa trả lời", "p.hint::未回答の見積もり依頼はありません", "label", err=["I301"],
      detail=["I301「未回答の見積依頼はありません。」を枠の中に出す。", "Hiện I301 「未回答の見積依頼はありません。」 trong khung."]),
]

H2_ITEMS = [
    I("6", "未回答の見積依頼の行", "Dòng yêu cầu báo giá chưa trả lời", ".home > div > section:nth-of-type(2) .news button", "link", "click",
      detail=["受信日・「未回答」バッジ・回答期限・見積依頼のタイトル（【ESキッチン】温度帯_住所_見積依頼）。押すと回答画面（OW_QUOT_003）を開く。回答期限が過ぎたものは出さない。",
              "Ngày nhận, badge 「未回答」, hạn trả lời, tiêu đề yêu cầu (【ESキッチン】nhiệt độ_địa chỉ_見積依頼). Bấm mở màn trả lời (OW_QUOT_003). Quá hạn trả lời thì không hiện."]),
    I("6.1", "回答期限", "Hạn trả lời", ".home > div > section:nth-of-type(2) .news button .meta", "label",
      detail=["受信日「受信」と回答期限（yyyy-mm-dd）。", "Ngày nhận 「受信」 và hạn trả lời (yyyy-mm-dd)."]),
]

H3_ITEMS = [
    I("7", "配送スタッフ未設定のマス", "Ô có chuyến chưa gán nhân viên", ".cal .day.unset:not(.other)", "link", "click",
      detail=["配送スタッフが決まっていない配送がある日のマス。日付の横に黄色の「未 n件」。押すとスケジュールへ移る。", "Ô ngày có chuyến chưa gán nhân viên giao hàng. Cạnh ngày có badge vàng 「未 n件」. Bấm để chuyển tới Lịch."]),
    I("7.1", "未設定のバッジ", "Badge chưa gán", ".cal .day.unset .badge", "label", detail=["「未 n件」（黄）。n＝その日の未設定の件数。", "「未 n件」 (vàng). n = số chuyến chưa gán trong ngày."]),
    I("8", "通知", "Thông báo tự động (khung 「通知」)", "-", "area",
      detail=["お知らせ（No.4）・未回答の見積依頼（No.5）とは別の枠「通知」。システムの自動通知を1行ずつ並べる：①担当の配送スタッフが未設定の警告（No.8.1）②配送の内容が変わったときの知らせ（No.8.2）③ほかの自動通知（No.8.3）。押すと関係する画面へ移る。「既読」の状態は持たない（複数の担当者が共用するため。既読は DA のお知らせだけ：台帳 S・受付簿 #456）。メールも送る自動通知は、メールを送ったうえでこの枠にも出す。",
              "Khung 「通知」 tách khỏi 「お知らせ」 (No.4) và báo giá chưa trả lời (No.5). Xếp từng dòng thông báo tự động của hệ thống: ① cảnh báo chưa gán nhân viên giao hàng (No.8.1) ② thông báo khi nội dung chuyến thay đổi (No.8.2) ③ các thông báo tự động khác (No.8.3). Bấm để sang màn hình liên quan. Không giữ trạng thái 「既読」 (vì nhiều người phụ trách dùng chung; 既読 chỉ có ở thông báo của DA: 台帳 S・受付簿 #456). Thông báo tự động có gửi mail thì gửi mail và cũng hiện ở khung này."],
      open=["枠「通知」を置く位置（ホームのどこか）・並び順・いつまで出すか（「既読」を持たないので、解消するまで出すのか、期間で消すのか）が決まっていない。hong に確認する", "Chưa quyết vị trí đặt khung 「通知」 (ở đâu trên Trang chủ), thứ tự sắp xếp, và hiện đến khi nào (vì không có 「既読」: hiện đến khi được giải quyết hay tự ẩn theo thời gian). Cần hỏi hong"], ask="hong",
      demo_ok=["コードのホームは枠「通知」を出さない（通知 inbox は取得するが画面に出さない：確認メモ H-22）。ホームの上の警告枠もない（確認メモ H-33）。枠の表示は宿題", "Trang chủ trong code không hiện khung 「通知」 (lấy thông báo inbox nhưng không hiển thị: 確認メモ H-22) và cũng chưa có khung cảnh báo ở đầu trang (確認メモ H-33). Hiển thị khung là việc còn tồn"]),
    I("8.1", "ドライバー未設定の警告", "Cảnh báo chưa gán nhân viên giao hàng", "-", "label", err=["W300"],
      detail=["納品日の3日前と前日になっても配送スタッフが決まっていない配送があるとき、枠「通知」に警告を出す（W300：件数と最も近い納品日）。押すと「配送管理」の未設定の配送の一覧へ移る。決まったら（未設定の配送がなくなったら）警告は消える。配送スタッフは「予定」の配送にも割り当てられる（台帳 S・受付簿 #430。割当の画面は配送管理 OW_DELV）。スケジュール・配送管理にも同じ警告帯を出す（OW_SCHD No.8・OW_DELV No.12）。",
              "Khi có chuyến chưa gán nhân viên giao hàng vào 3 ngày trước và 1 ngày trước ngày giao thì hiện cảnh báo trong khung 「通知」 (W300: số chuyến và ngày giao gần nhất). Bấm để sang danh sách chuyến chưa gán ở 「配送管理」. Gán xong (không còn chuyến chưa gán) thì cảnh báo biến mất. Có thể gán nhân viên cả cho chuyến 「予定」 (台帳 S・受付簿 #430; màn gán là 配送管理 OW_DELV). Lịch và Quản lý giao hàng cũng hiện dải cảnh báo giống vậy (OW_SCHD No.8・OW_DELV No.12)."],
      open=["スケジュール・配送管理の警告帯を、これまでどおり残すのか、枠「通知」だけにするのかが決まっていない。hong に確認する", "Chưa quyết dải cảnh báo ở Lịch và Quản lý giao hàng giữ nguyên như trước hay chỉ để ở khung 「通知」. Cần hỏi hong"], ask="hong",
      demo_ok=["コードのホームは警告を出さない（配送管理だけが前日の分を出す）。3日前の警告と枠「通知」への表示は宿題（確認メモ H-33）", "Trang chủ trong code không hiện cảnh báo (chỉ Quản lý giao hàng hiện phần 1 ngày trước). Cảnh báo 3 ngày trước và hiển thị trong khung 「通知」 là việc còn tồn (確認メモ H-33)"]),
]

H4_ITEMS = [
    I("8.2", "配送の内容が変わった知らせ", "Thông báo khi nội dung chuyến thay đổi", "-", "label", err=["I308"],
      detail=["自社が運ぶ区間の配送の内容（日付・数量など）が変わったとき、枠「通知」に知らせを出す（配送Noと変わった項目）。この知らせが出たときは、その配送の配送スタッフの割当は自動で外れている。押すと配送詳細（OW_DELV_002）へ移る。知らせを見たら、ドライバーを設定し直す（台帳 S・受付簿 #463）。文言は I308（「{配送No}の{変わった項目}が変わったため、配送スタッフの割当を外しました。設定し直してください。」）。",
              "Khi nội dung (ngày, số lượng v.v.) của chuyến thuộc chặng công ty mình chạy thay đổi thì hiện thông báo trong khung 「通知」 (số giao hàng và mục đã đổi). Khi có thông báo này, phân công nhân viên của chuyến đó đã tự động bị gỡ. Bấm để sang chi tiết giao hàng (OW_DELV_002). Xem thông báo xong thì gán lại tài xế (台帳 S・受付簿 #463). Câu chữ: I308 (「{配送No}の{変わった項目}が変わったため、配送スタッフの割当を外しました。設定し直してください。」)."],
      open=["担当未設定の配送が変わったときも通知を出す（台帳 S #470）。I308 の文言は「割当を外しました」なので、未設定の配送向けの文言は別に要る（ID 採番待ち）。hong に文言を確認する", "Cũng gửi thông báo khi chuyến chưa gán (未設定) thay đổi (台帳 S #470). Câu I308 là 「割当を外しました」 nên cần câu riêng cho chuyến chưa gán (chờ cấp mã). Cần hỏi hong về câu chữ"], ask="hong",
      demo_ok=["コードに、配送の内容が変わったときの知らせを出す仕組みがない。宿題", "Code chưa có cơ chế hiện thông báo khi nội dung chuyến thay đổi. Việc còn tồn"]),
    I("8.3", "ほかの自動通知", "Các thông báo tự động khác", "-", "label",
      detail=["担当の追加・終了、解約、見積依頼の受信は、システムが枠「通知」に出す（メールも送る）。お知らせの欄（No.4）には出さない。押すと内容の詳細（OW_HOME_002）を見る。運営のお知らせとの違いは、置き場が別の枠であること。台帳 S の「など」に含めて書いた。",
              "Việc thêm/kết thúc phụ trách, giải ước, nhận yêu cầu báo giá được hệ thống đưa vào khung 「通知」 (đồng thời gửi mail). Không hiện ở mục お知らせ (No.4). Bấm để xem nội dung (OW_HOME_002). Khác thông báo của 運営 ở chỗ đặt ở khung riêng. Đã ghi gộp vào 「など」 của 台帳 S."],
      open=["担当の追加・終了、解約、見積依頼の受信も枠「通知」に出すか（台帳 S の「など」に含まれるか）を確かめる", "Cần xác nhận việc thêm/kết thúc phụ trách, giải ước, nhận yêu cầu báo giá có hiện ở khung 「通知」 không (có nằm trong 「など」 của 台帳 S không)"], ask="hong",
      demo_ok=["コードは通知（inbox）を取得するが画面に出さない（確認メモ H-22）。表示は宿題。見本データでは自動通知を出して撮れない", "Code lấy thông báo (inbox) nhưng không hiển thị (確認メモ H-22). Hiển thị là việc còn tồn. Dữ liệu mẫu chưa chụp được thông báo tự động"]),
    I("8.4", "通知が0件のとき", "Khi không có thông báo", "-", "label", err=["I221"],
      detail=["枠「通知」は残し、中に「通知はありません。」を出す（0件の表示。メッセージ I221）。", "Giữ khung 「通知」 và hiện 「通知はありません。」 bên trong (hiển thị 0 mục; thông điệp I221)."],
      demo_ok=["コードは枠「通知」を出さないので撮れない", "Code chưa có khung 「通知」 nên không chụp được"]),
]

D1_ITEMS = [
    I("10", "お知らせのカテゴリ", "Thể loại thông báo", "span.badge", "label",
      detail=["「お知らせ」など。重要なお知らせは赤の「重要」バッジ（コードは灰色）。", "「お知らせ」 v.v. Thông báo quan trọng có badge đỏ 「重要」."]),
    I("10.1", "投稿日時", "Ngày giờ đăng", "article.card > div > span:last-child", "label",
      detail=["「投稿日時：yyyy-mm-dd」。", "「投稿日時：yyyy-mm-dd」."]),
    I("10.2", "タイトル", "Tiêu đề", "article.card h2", "label", detail=["お知らせのタイトル。", "Tiêu đề thông báo."]),
    I("10.3", "本文", "Nội dung", ".news-body", "label", detail=["運営が書いた本文。段落ごとに改行して出す。", "Nội dung do 運営 viết. Xuống dòng theo đoạn."]),
    I("10.4", "一覧に戻る", "Về danh sách", "button.linkbtn::一覧に戻る", "button", "click", detail=["ホーム（OW_HOME_001）へ戻る。", "Quay về Trang chủ (OW_HOME_001)."]),
]
D2_ITEMS = [
    I("11", "添付ファイル", "Tệp đính kèm", ".news-body ul", "table",
      detail=["運営が付けたファイルを「■ 添付」の下に一覧で出す。ファイル名を出し、押して開く（JPG・PNG・PDF・HEIC・1つ5MBまで・10件まで）。", "Các tệp 運営 đính kèm hiện thành danh sách dưới 「■ 添付」. Hiện tên tệp, bấm để mở (JPG・PNG・PDF・HEIC, mỗi tệp ≤5MB, tối đa 10 tệp)."],
      demo_ok=["コードはファイル名を出すだけでリンクがない（開けない）。リンクは宿題", "Code chỉ hiện tên tệp, chưa có liên kết (không mở được). Liên kết là việc còn tồn"]),
]
D3_ITEMS = [
    I("12", "見つからないときの表示", "Hiển thị khi không tìm thấy", ".page", "area", err=["I400"],
      detail=["存在しない ID・自社の配信対象でないお知らせの ID を開いたときは、I400「お知らせが見つかりません。」と「ホームへ戻る」ボタンを出す。先頭のお知らせは出さない。",
              "Khi mở ID không tồn tại hoặc thông báo mà công ty mình không phải đối tượng, hiện I400 「お知らせが見つかりません。」 và nút 「ホームへ戻る」. Không hiện thông báo đầu tiên."],
      demo_ok=["コードは先頭のお知らせを出す（確認メモ H-23）。「見つかりません」の表示は宿題", "Code hiện thông báo đầu tiên (確認メモ H-23). Hiển thị 「見つかりません」 là việc còn tồn"]),
]

D4_ITEMS = [
    I("13", "重要バッジ", "Badge quan trọng", "span.badge", "label",
      detail=["重要なお知らせはカテゴリの代わりに「重要」を出す（重要なお知らせは公開開始日の朝にメールでも届く）。", "Thông báo quan trọng hiện 「重要」 thay cho thể loại (cũng được gửi mail vào sáng ngày bắt đầu công khai)."]),
]

def V(id, code, ja, vi, url, items, note=None, **kw):
    d = {"id": id, "code": code, "state": [ja, vi], "url": url, "setup": "", "full": True, "wait": 600, "note": note or ["", ""], "items": items}
    d.update(kw)
    return d

VIEWS = [
    V("001", "OW_HOME_001", "初期表示（今月カレンダー・お知らせ・未回答の見積依頼 0件）", "Hiển thị ban đầu (lịch tháng này, thông báo, không có báo giá chưa trả lời)", "/carrier", FRAME + H_ITEMS,
      note=["栄成ロジ（DE00001）でログイン後の最初の画面。左＝今月の配送スケジュール、右＝お知らせ・未回答の見積依頼。栄成ロジには未回答の見積依頼がないので I301 が出る。", "Màn đầu tiên sau khi đăng nhập bằng 栄成ロジ (DE00001). Trái = lịch giao hàng tháng này, phải = thông báo và báo giá chưa trả lời. 栄成ロジ không có báo giá chưa trả lời nên hiện I301."]),
    V("002", "OW_HOME_001", "未回答の見積依頼あり", "Có yêu cầu báo giá chưa trả lời", "/carrier", H2_ITEMS, login="DE00006",
      note=["みどり便（DE00006）でログイン。未回答の見積依頼が1件ある。確認メモ_TW は「お知らせ・未回答 0件」の状態を想定していたが、お知らせ 0件は見本データで撮れないため（No.4.2）、未回答がある状態に替えた。", "Đăng nhập bằng みどり便 (DE00006), có 1 báo giá chưa trả lời. Memo dự kiến trạng thái 「không có thông báo và báo giá」 nhưng thông báo 0 không chụp được bằng dữ liệu mẫu (No.4.2) nên đổi sang trạng thái có báo giá chưa trả lời."]),
    V("003", "OW_HOME_001", "ドライバー未設定の警告（納品日の前日・枠「通知」）", "Cảnh báo chưa gán tài xế (1 ngày trước ngày giao, khung 「通知」)", "/carrier", H3_ITEMS, today="2026/12/01",
      note=["デモの今日を 2026/12/01 にした状態。翌日（12/02）納品の川崎の2次の区間に配送スタッフが決まっていない。マスに「未 1件」が出る。枠「通知」とその中の警告（No.8・8.1）はコードにまだない。", "Đặt 'hôm nay' của demo = 2026/12/01. Chặng thứ 2 đi Kawasaki giao ngày 12/02 chưa gán nhân viên giao hàng nên ô ngày hiện 「未 1件」. Khung 「通知」 và cảnh báo trong đó (No.8・8.1) chưa có trong code."]),
    V("004", "OW_HOME_001", "通知の枠（配送の内容が変わった知らせ など）", "Khung 「通知」 (thông báo khi nội dung chuyến thay đổi v.v.)", "/carrier", H4_ITEMS,
      note=["自動通知はお知らせの欄ではなく、別の枠「通知」に出す（台帳 S・受付簿 #428）。「既読」の状態は持たない（#456）。コードはまだ枠を出さないので、いまの画面は初期表示と同じ。", "Thông báo tự động không hiện ở mục お知らせ mà ở khung riêng 「通知」 (台帳 S・受付簿 #428). Không giữ trạng thái 「既読」 (#456). Code chưa có khung nên màn hình hiện tại giống hiển thị ban đầu."]),
    V("005", "OW_HOME_002", "運営のお知らせ（添付つき）", "Thông báo của 運営 (có tệp đính kèm)", "/carrier/news/12444", D1_ITEMS + D2_ITEMS, today="2026/10/03",
      note=["デモの今日を 2026/10/03 にした状態（公開期間が 10/04 までのお知らせを出すため）。添付ファイルあり。", "Đặt 'hôm nay' = 2026/10/03 (để hiện thông báo công khai đến 10/04). Có tệp đính kèm."]),
    V("006", "OW_HOME_002", "重要なお知らせ", "Thông báo quan trọng", "/carrier/news/12453", D4_ITEMS,
      note=["重要なお知らせ（バッジ「重要」）。項目は No.10 と同じ。", "Thông báo quan trọng (badge 「重要」). Các mục giống No.10."]),
    V("007", "OW_HOME_002", "見つからない（存在しない ID）", "Không tìm thấy (ID không tồn tại)", "/carrier/news/99999", D3_ITEMS,
      note=["存在しない ID。コードは先頭のお知らせを出すが、決定は「見つかりません」の表示（確認メモ H-23）。", "ID không tồn tại. Code hiện thông báo đầu nhưng quyết định là hiển thị 「見つかりません」 (確認メモ H-23)."]),
]
