# -*- coding: utf-8 -*-
"""
仕入先Web ホーム・お知らせ詳細（SW_HOME）の画面設計書データ。元：本物の Web（app/supplier/(app)/home/page.tsx・notices/[id]/page.tsx・app/supplier/_components/Shell.tsx・lib/supplier/orders.ts・mocks/supplier/notices.ts）。
決定：docs/決定台帳.md F（2026-10-05 画面コード・一覧の決まり／お知らせの ID・配信対象）・I（本発注の未処理アラート・仕入先に金額を見せない）・M-1（ログインの期限 1日）、
受付簿 No.290〜295。洗い出し：docs/05_画面設計書/確認メモ_SW_仕入先.md（回答 2026-10-07 つき）。
台帳 S（2026-10-08）：ホームのお知らせは枠を分けてスクロール・件数で切らない・「お知らせ一覧」の画面（SW_HOME_003）はホームのリンクから開き10件ずつのページ送り（受付簿 #465。#439 の『最新5件』を置き換え）／「既読」は DA だけ（#456）。キャンセルの帯は直近7日（#457）／メニューの「新着」「NEW」バッジはやめた（#464）。
コードが決定に追いついていないところは demo_ok（宿題）：お知らせの ID（NT-＋5桁）と運営のお知らせの配信対象への接続（H4）・一覧のページ送り（H1）・名前（ESキッチン／ES STATION・H8）・読み込み失敗の表示。
"""

TITLE = ["ホーム・お知らせ詳細・お知らせ一覧（SW_HOME）", "Trang chủ・chi tiết thông báo・danh sách thông báo (SW_HOME)"]
SHEET = ["ホーム", "Trang chủ"]
BASENAME = "画面設計書_SW_HOME_ホーム"
IMG_PREFIX = "SW_HOME"
OUT_DIR = "仕入先Web"
CODE_NOTE = ["Screen Code は台帳 F の決まり：SW_<機能略>_<3桁>（SW＝仕入先Web）", "Screen Code theo 台帳 F: SW_<mã chức năng>_<3 chữ số> (SW = Web nhà cung cấp)"]
SITE = "supplier"
SYSTEM = {"ja": "仕入先Web", "vi": "Web nhà cung cấp (仕入先Web)"}
AUTHOR = "Claude／確認：hong"
CREATED = "2026-10-07"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "supplier", "loginId": "SP00001"}
CODE_PATHS = ["app/supplier", "lib/supplier", "lib/domain/seed", "mocks/supplier"]


def X(no, ja, vi, sel, kind, trig="view", req=None, ln=None, init=None, ex=None, cond=None, valid=None, err=None, detail=None, pattern=None, fid=None, demo_ok=None, op=None, ask=None):
    d = {"no": no, "ja": ja, "vi": vi, "sel": sel, "kind": kind, "trig": trig}
    for k, v in (("req", req), ("len", ln), ("pattern", pattern), ("fid", fid), ("ask", ask)):
        if v is not None:
            d[k] = v
    for k, v in (("init", init), ("ex", ex), ("cond", cond), ("valid", valid), ("detail", detail), ("demo_ok", demo_ok), ("open", op)):
        if v is not None:
            d[k] = list(v)
    if err:
        d["err"] = list(err)
    return d


DECISIONS = [
    {"date": "2026-10-08", "target": "SW_HOME_001 No.6・SW_HOME_003", "q": ["ホームのお知らせの出し方（最新5件か全件か）と、お知らせ一覧の画面", "Cách hiển thị thông báo ở trang chủ (5 mục mới nhất hay tất cả) và màn hình danh sách thông báo"],
     "a": ["ホームのお知らせは枠を分けてスクロールできるようにし、件数で切らない（重要を上、次に新しい順）。「お知らせ一覧」の画面（SW_HOME_003）は残し、ホームのリンクから開く（メニューには足さない・検索なし）。一覧は10件ずつのページ送り。「最新5件」は置き換えた", "Thông báo ở trang chủ có khung riêng, cuộn được, không cắt theo số lượng (quan trọng lên trên, rồi mới nhất trước). Giữ màn hình 「お知らせ一覧」 (SW_HOME_003), mở từ liên kết ở trang chủ (không thêm vào menu・không có tìm kiếm). Danh sách phân trang 10 mục mỗi trang. Đã thay 「5 mục mới nhất」"],
     "src": "hong 回答 2026-10-08（確認表 H-28・台帳 S・受付簿 #465。#439 の『最新5件』を置き換え）"},
    {"date": "2026-10-08", "target": "SW_HOME_001 No.4・No.7", "q": ["キャンセルの帯を「まだ開いていない（未読）」で出す設計と、「既読」を持つ場所", "Thiết kế hiện dải hủy đơn theo 「chưa mở (chưa đọc)」 và nơi giữ trạng thái 「đã đọc」"],
     "a": ["直近7日のキャンセルを件数つきで出す。7日を過ぎたら消える。「未読」の状態は持たない（「既読」を持つのはドライバーアプリだけ）", "Hiện số đơn hủy trong 7 ngày gần đây. Quá 7 ngày thì biến mất. Không có trạng thái 「chưa đọc」 (chỉ app tài xế có 「đã đọc」)"],
     "src": "hong 回答 2026-10-08（台帳 S・受付簿 #456・#457）"},
    {"date": "2026-10-08", "target": "SW_HOME No.1.3", "q": ["メニュー「受注一覧」の新着バッジ", "Badge 「新着」 ở menu 「受注一覧」"],
     "a": ["「新着」「NEW」の表示はやめる。見つけ方は並び（新しい順）とタブ「納期回答待ち」", "Bỏ hiển thị 「新着」「NEW」. Cách tìm là thứ tự (mới nhất trước) và tab 「納期回答待ち」"],
     "src": "hong 回答 2026-10-08（台帳 S・受付簿 #464）"},
    {"date": "2026-10-07", "target": "SW_HOME_001 No.6.1", "q": ["お知らせの出どころ", "Nguồn của thông báo"],
     "a": ["運営Web「お知らせ」の配信対象「仕入先」（全員または個別選択）。ID は NT-＋5桁、カテゴリは4つ固定、添付は JPG・PNG・PDF・HEIC 1件5MB・10件まで", "「お知らせ」 của 運営Web với đối tượng gửi 「仕入先」 (tất cả hoặc chọn riêng). ID NT-+5 số, 4 カテゴリ cố định, đính kèm JPG/PNG/PDF/HEIC mỗi tệp 5MB, tối đa 10 tệp"],
     "src": "台帳 F「お知らせの ID・カテゴリ」「配信対象の列名・添付・並び」（確認メモ_SW H4）"},
    {"date": "2026-10-07", "target": "SW_HOME_001 No.3", "q": ["本発注の承認が未処理のときのホームの帯", "Dải thông báo ở trang chủ khi đơn đặt hàng chính thức chưa duyệt"],
     "a": ["ホームに帯を出し、メールでもアラートを送る。本発注から営業日24時間ごと。土日祝を営業日とするかは仕入先ごとの設定", "Hiện dải thông báo ở trang chủ và gửi email cảnh báo mỗi 24 giờ làm việc kể từ khi đặt hàng chính thức. Có tính thứ bảy/chủ nhật/lễ là ngày làm việc hay không tùy từng nhà cung cấp"],
     "src": "台帳 I「本発注の承認」・仕様 55 §7-1"},
    {"date": "2026-10-07", "target": "SW_HOME 全体", "q": ["ログインの有効期間と、切れたときの動き", "Thời hạn đăng nhập và hành vi khi hết hạn"],
     "a": ["全サイト 1日。切れたときは保存の画面の上でログインの小窓を出し、ログイン後に続ける（下書きは残さない）", "1 ngày cho mọi site. Khi hết hạn hiện cửa sổ đăng nhập ngay trên màn hình lưu, đăng nhập xong thì làm tiếp (không lưu nháp)"],
     "src": "hong 回答 2026-10-07（台帳 K・M-1「ログインの期限」、受付簿 No.291）"},
    {"date": "2026-10-07", "target": "SW_HOME 全体", "q": ["仕入先に金額を見せるか", "Có cho nhà cung cấp xem số tiền không"],
     "a": ["見せない（仕入単価・発注金額・集計・CSV の金額）。ホームの件数カードも件数だけ", "Không (đơn giá nhập, số tiền đặt hàng, tổng hợp, số tiền trong CSV). Thẻ số lượng ở trang chủ cũng chỉ hiện số đơn"],
     "src": "台帳 I「仕入先に見せる金額」"},
]

DECISIONS += [
    {"date": "2026-10-07", "target": "SW_HOME_001 No.3（発注窓口）", "q": ["発注メールの返信先（発注窓口）をどこで持つか", "Giữ địa chỉ trả lời email đặt hàng (đầu mối đặt hàng) ở đâu"],
     "a": ["運営Web の設定に「発注窓口メール」を足す（お問い合わせ通知先メールと同じ型）。値は客先に聞く。仕入先Web 自体には画面を置かない", "Thêm 「発注窓口メール」 vào cài đặt 運営Web (cùng kiểu với email nhận thông báo liên hệ). Giá trị hỏi khách hàng. Không đặt màn hình trong 仕入先Web"],
     "src": "hong 回答 2026-10-07（確認メモ_SW O8）。運営I の宿題"},
]

CHANGES = []

HIDE_ALWAYS = [".es-demo-bar", ".es-chatbot", ".es-chatbot__fab", "#es-review"]
STATIC_CSS = ".app{height:auto!important;min-height:100vh}.main{overflow:visible!important}"
VIEWER_CSS = STATIC_CSS

SCREENS = [
    {"code": "SW_HOME_001", "ja": "ホーム", "vi": "Trang chủ"},
    {"code": "SW_HOME_002", "ja": "お知らせ詳細", "vi": "Chi tiết thông báo"},
    {"code": "SW_HOME_003", "ja": "お知らせ一覧", "vi": "Danh sách thông báo"},
]

_OPEN_NEWS = "const b=[...document.querySelectorAll('ul.news .hd')].find(x=>x.textContent.includes('受注漏れ防止')); b&&b.click(); await new Promise(r=>setTimeout(r,300)); "

VIEWS = [
    # ============================================================ SW_HOME_001 ホーム
    {"id": "001", "code": "SW_HOME_001", "state": ["初期表示（未処理の帯あり）", "Hiển thị ban đầu (có dải chưa xử lý)"],
     "url": "/supplier/home", "full": True, "wait": 600, "setup": "",
     "note": ["SP00001（株式会社サンプル商事）でログインした直後。本発注の承認待ち・直近7日のキャンセルがあるため、帯が2つ出る。", "Ngay sau khi đăng nhập bằng SP00001 (株式会社サンプル商事). Có đơn chờ duyệt đặt hàng chính thức và đơn hủy trong 7 ngày gần đây nên hiện 2 dải."],
     "items": [
         X("1", "サイドメニュー・ヘッダー（ログイン後の全画面で共通）", "Menu bên và header (chung mọi màn hình sau đăng nhập)", ".side", "area", detail=(
             "ログイン後の全画面の枠。メニューは ホーム・受注一覧・プロフィール・操作マニュアルの4つ。入力中（保存していない内容があるとき）にメニュー・ユーザーメニューで離れると Q02 を出す（台帳 F）。PC 前提で、狭い幅ではハンバーガーで開く（スマホ幅は検証対象にしない・台帳 H）。",
             "Khung chung cho mọi màn hình sau đăng nhập. Menu gồm 4 mục: ホーム・受注一覧・プロフィール・操作マニュアル. Khi đang nhập (có nội dung chưa lưu) mà rời đi bằng menu hoặc menu người dùng thì hiện Q02 (台帳 F). Giả định dùng PC; màn hình hẹp mở bằng nút hamburger (không kiểm thử màn hình điện thoại, 台帳 H)."),
           pattern="P-FORM"),
         X("1.1", "ロゴ・サイト名", "Logo và tên site", ".side .brand", "label", detail=(
             "ロゴと「仕入先」。ページの title・ロゴの代替文字は「ES STATION 仕入先サイト」にする（「ESSTATION」は使わない）。", "Logo và chữ 「仕入先」. Tiêu đề trang và alt của logo là 「ES STATION 仕入先サイト」 (không dùng 「ESSTATION」)."),
           demo_ok=("コード：ロゴの alt は「ESSTATION」、title は「ESSTATION 仕入先サイト」、サイド下は「ES Kitchen 仕入先サイト」（Shell.tsx・layout.tsx）。決定：システム名は「ES STATION」、「ESキッチン」はお客様の名前（台帳 F 2026-10-05）", "Code: alt logo 「ESSTATION」, title 「ESSTATION 仕入先サイト」, chân sidebar 「ES Kitchen 仕入先サイト」 (Shell.tsx・layout.tsx). Quyết định: tên hệ thống là 「ES STATION」, 「ESキッチン」 là tên khách hàng (台帳 F 2026-10-05)")),
         X("1.2", "ホーム", "Menu 「ホーム」", ".side a.nav-g::ホーム", "link", "click", detail=("このホーム（SW_HOME_001）へ。お知らせの詳細（SW_HOME_002）・お知らせ一覧（SW_HOME_003）を開いているときもこの項目が選択中になる。お知らせ一覧はメニューの項目にせず、ホームの「お知らせ一覧」から開く。", "Đi tới trang chủ này (SW_HOME_001). Khi đang mở chi tiết thông báo (SW_HOME_002) hoặc danh sách thông báo (SW_HOME_003) mục này vẫn được chọn. Danh sách thông báo không phải mục menu, mở từ liên kết 「お知らせ一覧」 ở trang chủ.")),
         X("1.3", "受注一覧", "Menu 「受注一覧」", ".side a.nav-g::受注一覧", "link", "click", detail=("受注一覧（SW_ORDR_001）へ。「新着」「NEW」のバッジは出さない（台帳 S・受付簿 #464）。", "Đi tới 受注一覧 (SW_ORDR_001). Không hiện badge 「新着」「NEW」 (台帳 S・受付簿 #464)."),
           demo_ok=("コード：メニューの「受注一覧」の右に、開いていない発注の件数のバッジを出す（Shell.tsx の unseen）。決定：出さない（#464）。コードを直す宿題", "Code: bên phải menu 「受注一覧」 hiện badge số đơn chưa mở (unseen ở Shell.tsx). Quyết định: không hiện (#464). Bài tập sửa code")),
         X("1.4", "プロフィール", "Menu 「プロフィール」", ".side a.nav-g::プロフィール", "link", "click", detail=("プロフィール（SW_PROF_001）へ。", "Đi tới プロフィール (SW_PROF_001).")),
         X("1.5", "操作マニュアル", "Menu 「操作マニュアル」", ".side a.nav-g::操作マニュアル", "link", "click", detail=("操作マニュアル（SW_MANU_001）へ。", "Đi tới 操作マニュアル (SW_MANU_001).")),
         X("1.6", "会社名（ヘッダー）", "Tên công ty (header)", ".hello", "label", detail=("「{会社名} 様」。ログインしている仕入先の会社名（プロフィールの会社名と同じ）。", "「{会社名} 様」: tên công ty của nhà cung cấp đang đăng nhập (giống tên công ty ở プロフィール).")),
         X("1.7", "ユーザーメニュー", "Menu người dùng", ".user button", "button", "click", detail=(
             "メイン担当者の名前を出す。押すと「プロフィール」「ログアウト」の2つ。ログアウトするとログイン（SW_AUTH_001）へ戻る。ログインの有効期間は1日（台帳 K）で、切れたら保存の画面の上にログインの小窓（E525）を出す。",
             "Hiện tên người phụ trách chính. Bấm sẽ ra 2 mục 「プロフィール」「ログアウト」. Đăng xuất thì về ログイン (SW_AUTH_001). Hiệu lực đăng nhập 1 ngày (台帳 K); hết hạn thì hiện cửa sổ đăng nhập (E525) ngay trên màn hình lưu."),
           err=["E525"], demo_ok=("コード：ログインの期限は1日（Cookie と localStorage の印。lib/api/keepLogin.ts）で台帳 K に合う。残る差は、期限切れ（401）のとき画面の上に小窓（E525）を出さずにログイン画面へ戻り、入力中の内容が消えること（store.tsx clearSession → (app)/layout.tsx）", "Code: hạn đăng nhập là 1 ngày (Cookie và dấu trong localStorage; lib/api/keepLogin.ts), khớp 台帳 K. Còn lệch: khi hết hạn (401) không hiện cửa sổ nhỏ (E525) trên màn hình mà quay về màn đăng nhập, nội dung đang nhập bị mất (store.tsx clearSession → (app)/layout.tsx)")),
         X("2", "ページ見出し", "Tiêu đề trang", ".ph", "area"),
         X("2.1", "画面名", "Tên màn hình", ".ph h1", "label", init=("ホーム", "「ホーム」")),
         X("3", "本発注の未処理の帯", "Dải: đơn đặt hàng chính thức chưa xử lý", ".notice.ng", "label", err=["W320"], cond=("本発注の承認待ちのうち、本発注から営業日24時間を過ぎたものがあるときだけ出す", "Chỉ hiện khi có đơn chờ duyệt đặt hàng chính thức đã quá 24 giờ làm việc kể từ khi đặt hàng chính thức"),
           detail=("{n}＝アラートが送られた発注の件数。処理が済むと消える。メール S5（アラート）と同じ内容。営業日の数え方は、プロフィールの「土日祝を営業日とするか」で変わる。", "{n} = số đơn đã bị gửi cảnh báo. Xử lý xong thì dải biến mất. Cùng nội dung với email S5 (cảnh báo). Cách đếm ngày làm việc thay đổi theo mục 「土日祝を営業日とするか」 ở プロフィール.")),
         X("3.1", "承認待ちを見る", "Nút 「承認待ちを見る」", ".notice.ng button", "button", "click", detail=("受注一覧（SW_ORDR_001）のタブ「本発注の承認待ち」を開く。", "Mở tab 「本発注の承認待ち」 ở 受注一覧 (SW_ORDR_001).")),
         X("4", "キャンセルの帯", "Dải: đơn bị hủy", ".notice.warn", "label", err=["W321"], cond=("直近7日にキャンセルされた発注があるときだけ出す。7日を過ぎたら数えず、なくなれば帯も消える。「未読」の状態は持たない（台帳 S・受付簿 #457）", "Chỉ hiện khi có đơn bị hủy trong 7 ngày gần đây. Quá 7 ngày thì không tính, hết đơn thì dải biến mất. Không có trạng thái 「chưa đọc」 (台帳 S・受付簿 #457)"),
           detail=("{n}＝直近7日のキャンセルの件数。メール S7（キャンセル）と同じ内容。「ESキッチン」＝お客様（運営会社）の名前（台帳 F）。", "{n} = số đơn hủy trong 7 ngày gần đây. Cùng nội dung với email S7 (hủy đơn). 「ESキッチン」 = tên khách hàng (công ty vận hành) (台帳 F)."),
           demo_ok=("コード：帯の文言は「運営が発注をキャンセルしました（n件）。出荷しないでください。」（home/page.tsx）。決定：W321「ESキッチンが発注をキャンセルしました（{n}件）。…」（台帳 F 2026-10-05 の名前の決まり）。また、コードは「開いていない（seen でない）キャンセル」を数える（home/page.tsx）が、決定は直近7日（#457）。コードを直す宿題", "Code: câu trên dải là 「運営が発注をキャンセルしました（n件）。出荷しないでください。」 (home/page.tsx). Quyết định: W321 「ESキッチンが発注をキャンセルしました（{n}件）。…」 (quy tắc tên 台帳 F 2026-10-05). Ngoài ra code đếm đơn hủy 「chưa mở (seen)」 (home/page.tsx), quyết định là 7 ngày gần đây (#457). Bài tập sửa code")),
         X("4.1", "キャンセルを見る", "Nút 「キャンセルを見る」", ".notice.warn button", "button", "click", detail=("受注一覧のタブ「キャンセル」を開く。", "Mở tab 「キャンセル」 ở 受注一覧.")),
         X("5", "件数カード", "Thẻ số lượng", ".kpis", "area", detail=("受注一覧のタブごとの件数。金額は出さない（台帳 I）。押すとそのタブの受注一覧を開く。", "Số đơn theo từng tab của 受注一覧. Không hiện số tiền (台帳 I). Bấm để mở 受注一覧 ở tab tương ứng.")),
         X("5.1", "納期回答待ち", "Thẻ 「納期回答待ち」", ".kpi::納期回答待ち", "button", "click", detail=("仮発注に回答していない発注の件数（単位：件）。", "Số đơn chưa trả lời đơn đặt hàng tạm (đơn vị: 件).")),
         X("5.2", "本発注の承認待ち", "Thẻ 「本発注の承認待ち」", ".kpi::本発注の承認待ち", "button", "click", detail=("運営が本発注を出して、仕入先がまだ承認していない発注の件数。", "Số đơn 運営 đã đặt hàng chính thức mà nhà cung cấp chưa duyệt.")),
         X("5.3", "出荷待ち（うち出荷可）", "Thẻ 「出荷待ち（うち出荷可）」", ".kpi::出荷待ち", "button", "click", detail=("出荷待ちの発注の件数。「うち出荷可 n件」は本発注を承認済みで、いま出荷報告できる件数。", "Số đơn chờ giao. 「うち出荷可 n件」 là số đơn đã duyệt đặt hàng chính thức và có thể báo cáo giao ngay.")),
         X("5.4", "出荷済", "Thẻ 「出荷済」", ".kpi::出荷済", "button", "click", detail=("出荷報告を済ませた発注の件数。", "Số đơn đã báo cáo giao hàng.")),
         X("6", "お知らせ", "Thông báo", "h2::お知らせ^", "area", err=["I01", "E346"],
           detail=("運営Web「お知らせ」で配信対象に「仕入先」（全員または個別選択）を選んだものだけを出す。ホームでは**お知らせだけの枠を分け、枠の中でスクロールして**読む。件数では切らない（全件。重要を上、次に新しい順・台帳 S・2026-10-08・受付簿 #465）。見出しの右の「お知らせ一覧」からお知らせ一覧（SW_HOME_003）も開ける。ホームにページ送りは置かない。0件のときは I01。読み込めなかったときは E346 と「再読み込み」。", "Chỉ hiện thông báo mà 運営Web chọn đối tượng gửi 「仕入先」 (tất cả hoặc chọn riêng). Ở trang chủ, thông báo nằm trong **khung riêng và cuộn trong khung** để đọc. Không cắt theo số lượng (hiện tất cả; quan trọng lên trên, rồi mới nhất trước; 台帳 S・2026-10-08・受付簿 #465). Cũng mở được danh sách thông báo (SW_HOME_003) từ 「お知らせ一覧」 bên phải tiêu đề. Trang chủ không phân trang. 0 dòng: I01. Khi không tải được: E346 và nút 「再読み込み」."),
           op=("お知らせの枠の高さ（スクロールするまでに何件ぶん見えるか）は台帳・仕様にない", "Chiều cao khung thông báo (cuộn trước khi thấy được bao nhiêu mục) chưa có trong 台帳・仕様"), ask="hong",
           demo_ok=("コード：お知らせは全仕入先に全件を出し、並びは日付の新しい順だけ（重要を上にしない）・「お知らせ一覧」の画面とリンクがない（lib/supplier/service.ts listNotices。notices は mocks/supplier/notices.ts を入れた別テーブル）。運営Web の配信対象（仕入先）とつながっていない。読み込みの失敗は E346 の表示ではなくトースト。決定：ホームは枠を分けてスクロール・件数で切らない＋「お知らせ一覧」の画面（台帳 S・受付簿 #465）。配信対象に仕入先を選んだものだけを出すのは台帳 F の決定。コードを直す宿題", "Code: thông báo hiện toàn bộ cho mọi nhà cung cấp, chỉ sắp theo ngày mới nhất (không đưa quan trọng lên trên), không có màn 「お知らせ一覧」 và liên kết (lib/supplier/service.ts listNotices; bảng notices dùng dữ liệu mẫu mocks/supplier/notices.ts), chưa nối với đối tượng gửi (仕入先) của 運営Web. Khi tải lỗi chỉ hiện toast, không hiện E346. Quyết định: trang chủ có khung cuộn, không cắt theo số lượng + màn 「お知らせ一覧」 (台帳 S・受付簿 #465). Chỉ hiện thông báo có đối tượng 仕入先 là quyết định trong 台帳 F. Bài tập sửa code")),
         X("6.1", "お知らせの一覧", "Danh sách thông báo", "ul.news", "table", "view", detail=("1行＝1件。左から 日時・「重要」のバッジ・カテゴリ・タイトル。カテゴリは お知らせ／メニュー／メンテナンス／システム更新 の4つ（台帳 F）。枠の中をスクロールして読む。行を押すと本文と添付が開く（開閉）。「既読／未読」の印は付けない（既読を持つのはドライバーアプリだけ・台帳 S #456）。", "1 dòng = 1 thông báo. Từ trái: ngày giờ, badge 「重要」, カテゴリ, tiêu đề. カテゴリ gồm 4 loại cố định: お知らせ／メニュー／メンテナンス／システム更新 (台帳 F). Cuộn trong khung để đọc. Bấm dòng để mở nội dung và tệp đính kèm. Không có dấu 「đã đọc／chưa đọc」 (chỉ app tài xế có 「đã đọc」, 台帳 S #456).")),
         X("6.2", "日時", "Ngày giờ", "ul.news .dt", "label", detail=("配信した日時。表示は yyyy-mm-dd HH:MM（JST）。", "Ngày giờ gửi. Hiển thị yyyy-mm-dd HH:MM (JST).")),
         X("6.3", "重要バッジ", "Badge 「重要」", "ul.news .badge.imp", "label", detail=("重要なお知らせだけ。お知らせ一覧の画面（SW_HOME_003）では重要なお知らせが上に並ぶ（ホームも同じ並び：重要を上、次に新しい順・No.6）。", "Chỉ với thông báo quan trọng. Ở màn danh sách thông báo (SW_HOME_003) thông báo quan trọng xếp lên trên (trang chủ cũng cùng thứ tự: quan trọng lên trên, rồi mới nhất, No.6).")),
         X("6.4", "カテゴリ", "Loại (カテゴリ)", "ul.news li:first-child .badge.b-mute", "label", detail=("4つのカテゴリのどれか（灰色のバッジ）。", "Một trong 4 カテゴリ (badge màu xám).")),
         X("6.5", "タイトル", "Tiêu đề", "ul.news .tt", "label", detail=("お知らせのタイトル（60文字まで・運営が入力）。長いときは折り返す。", "Tiêu đề thông báo (tối đa 60 ký tự, 運営 nhập). Dài thì xuống dòng.")),
         X("6.7", "お知らせ一覧", "Liên kết 「お知らせ一覧」", "-", "link", "click", detail=("お知らせの見出しの右に置くリンク。お知らせ一覧（SW_HOME_003）を開く。お知らせが0件のときも出す。入口はこのリンクだけで、サイドメニューには足さない（4項目のまま）。", "Liên kết đặt bên phải tiêu đề thông báo. Mở danh sách thông báo (SW_HOME_003). Hiện cả khi 0 thông báo. Đây là lối vào duy nhất, không thêm vào menu bên (giữ 4 mục)."),
           demo_ok=("コード：「お知らせ一覧」のリンクがない（home/page.tsx）。決定：ホームのリンクから開く（台帳 S・受付簿 #465）", "Code: không có liên kết 「お知らせ一覧」 (home/page.tsx). Quyết định: mở từ liên kết ở trang chủ (台帳 S・受付簿 #465)")),
     ]},
    {"id": "002", "code": "SW_HOME_001", "state": ["帯なし（未処理・キャンセルなし）", "Không có dải (không có đơn chưa xử lý / đơn hủy)"],
     "url": "/supplier/home", "login": "SP00005", "full": True, "wait": 600, "setup": "",
     "note": ["SP00005（株式会社マルシンフーズ・土日祝を営業日とする）でログイン。未処理の本発注・直近7日のキャンセルがないので、帯は出ない。", "Đăng nhập bằng SP00005 (株式会社マルシンフーズ, tính thứ bảy/chủ nhật/lễ là ngày làm việc). Không có đơn đặt hàng chính thức chưa xử lý và đơn hủy trong 7 ngày gần đây nên không hiện dải."],
     "items": [
         X("7", "帯が出ない状態", "Trạng thái không có dải", ".kpis", "area", cond=("本発注の承認待ちの未処理がなく、直近7日のキャンセルもないとき（#457）", "Khi không có đơn chờ duyệt đặt hàng chính thức chưa xử lý và không có đơn hủy trong 7 ngày gần đây (#457)"), detail=("No.3・No.4 の帯を出さず、見出しのすぐ下に件数カードを出す。", "Không hiện dải No.3・No.4, thẻ số lượng nằm ngay dưới tiêu đề."),
),
     ]},
    {"id": "003", "code": "SW_HOME_001", "state": ["お知らせを開く（重要・添付あり）", "Mở thông báo (quan trọng, có đính kèm)"],
     "url": "/supplier/home", "full": True, "wait": 600, "setup": _OPEN_NEWS,
     "note": ["一覧の行を押して、本文と添付を開いた状態（「本発注後の受注漏れ防止について」）。", "Trạng thái bấm một dòng trong danh sách để mở nội dung và tệp đính kèm (「本発注後の受注漏れ防止について」)."],
     "items": [
         X("8", "開いた行の本文", "Nội dung của dòng đã mở", "ul.news li.open .bd", "area", "click", detail=("本文を出し、添付があれば下に並べる。もう一度押すと閉じる。開いてよいのは1件だけ（別の行を開くと前の行は閉じる）。", "Hiện nội dung, nếu có đính kèm thì liệt kê bên dưới. Bấm lần nữa để đóng. Chỉ mở được 1 dòng (mở dòng khác thì dòng trước đóng).")),
         X("8.1", "添付ファイル", "Tệp đính kèm", "ul.news li.open .bd button.lnk", "link", "click", err=["E482"], detail=("📎 ファイル名。押すと新しいタブで開く（JPG・PNG・PDF・HEIC。HEIC は表示のときに変換する・台帳 F）。開けなかったときはトーストで E482。", "📎 Tên tệp. Bấm để mở ở tab mới (JPG/PNG/PDF/HEIC; HEIC được chuyển đổi khi hiển thị, 台帳 F). Không mở được thì hiện toast E482."),
           demo_ok=("コード：添付はファイル名だけで、開くと about:blank になる（見本の API が about:blank を返す：app/api/supplier/files/route.ts・supplier.mock.ts）", "Code: tệp đính kèm chỉ là tên tệp, khi mở ra about:blank (API mẫu trả về about:blank: app/api/supplier/files/route.ts・supplier.mock.ts)")),
         X("8.2", "詳細ページを開く", "Liên kết 「詳細ページを開く」", "ul.news li.open .bd a.lnk", "link", "click", detail=("お知らせ詳細（SW_HOME_002）へ。", "Đi tới chi tiết thông báo (SW_HOME_002).")),
     ]},
    # ============================================================ SW_HOME_002 お知らせ詳細
    {"id": "004", "code": "SW_HOME_002", "state": ["重要・添付あり", "Quan trọng, có đính kèm"],
     "url": "/supplier/notices/12451", "full": True, "wait": 600, "setup": "",
     "note": ["「本発注後の受注漏れ防止について」の詳細。重要バッジと添付つき。", "Chi tiết 「本発注後の受注漏れ防止について」, có badge quan trọng và đính kèm."],
     "items": [
         X("9", "ページ見出し", "Tiêu đề trang", ".ph", "area"),
         X("9.1", "画面名", "Tên màn hình", ".ph h1", "label", init=("お知らせ詳細", "「お知らせ詳細」")),
         X("9.2", "一覧に戻る", "Nút 「一覧に戻る」", ".ph a.btn::一覧に戻る", "link", "click", detail=("お知らせ一覧（SW_HOME_003）へ戻る（台帳 S・2026-10-08 で一覧の画面を足した）。", "Quay về danh sách thông báo (SW_HOME_003) (đã thêm màn danh sách ở 台帳 S・2026-10-08)."),
           demo_ok=("コード：「一覧に戻る」はホームへ戻る（お知らせ一覧の画面がないため：notices/[id]/page.tsx）。決定：お知らせ一覧（SW_HOME_003）へ戻る。コードを直す宿題", "Code: 「一覧に戻る」 quay về trang chủ (vì chưa có màn danh sách thông báo: notices/[id]/page.tsx). Quyết định: quay về danh sách thông báo (SW_HOME_003). Bài tập sửa code")),
         X("10", "お知らせの内容", "Nội dung thông báo", ".card", "area", detail=("見るだけ（入力欄・ボタンは添付のダウンロードだけ）。", "Chỉ xem (chỉ có nút tải tệp đính kèm, không có ô nhập).")),
         X("10.1", "重要バッジ", "Badge 「重要」", ".card .badge.imp", "label", cond=("重要なお知らせのときだけ", "Chỉ với thông báo quan trọng"), detail=("赤いバッジ「重要」。", "Badge đỏ 「重要」.")),
         X("10.2", "カテゴリ", "Loại (カテゴリ)", ".card .badge.b-mute", "label", detail=("お知らせ／メニュー／メンテナンス／システム更新 のどれか。", "Một trong お知らせ／メニュー／メンテナンス／システム更新.")),
         X("10.3", "日時", "Ngày giờ", ".card span.muted", "label", detail=("配信した日時（yyyy-mm-dd HH:MM）。", "Ngày giờ gửi (yyyy-mm-dd HH:MM).")),
         X("10.4", "タイトル", "Tiêu đề", ".card h2", "label", detail=("お知らせのタイトル。", "Tiêu đề thông báo.")),
         X("10.5", "本文", "Nội dung", ".card > div[style*='pre-wrap']", "label", detail=("本文（改行を残して表示。長さの上限は運営のお知らせの入力欄に従う）。", "Nội dung (giữ xuống dòng khi hiển thị; giới hạn độ dài theo ô nhập của thông báo bên 運営).")),
         X("11", "添付ファイル", "Tệp đính kèm", ".card .manual-item", "table", cond=("添付があるときだけ", "Chỉ khi có đính kèm"), detail=("1件＝1行。ファイル名とダウンロードのボタン。添付は10件まで・1件 5MB（台帳 F）。", "1 tệp = 1 dòng. Tên tệp và nút tải xuống. Tối đa 10 tệp, mỗi tệp 5MB (台帳 F).")),
         X("11.1", "ダウンロード", "Nút 「ダウンロード」", ".card .manual-item button", "button", "click", err=["E482"], detail=("新しいタブで開く。開けなかったときは E482（トースト）。", "Mở ở tab mới. Không mở được thì E482 (toast)."),
           demo_ok=("コード：ダウンロードは about:blank を開く（useDownload.ts → files API が about:blank を返す）", "Code: tải xuống mở about:blank (useDownload.ts → files API trả về about:blank)")),
     ]},
    {"id": "005", "code": "SW_HOME_002", "state": ["通常（添付なし・重要でない）", "Thường (không đính kèm, không quan trọng)"],
     "url": "/supplier/notices/12452", "full": True, "wait": 600, "setup": "",
     "note": ["「出荷報告に『箱数の確認』を追加しました」の詳細。重要でなく、添付もない。", "Chi tiết 「出荷報告に『箱数の確認』を追加しました」, không quan trọng và không có đính kèm."],
     "items": [
         X("12", "添付なしの表示", "Hiển thị khi không có đính kèm", ".card h2", "label", detail=("添付がなければ「添付ファイル」の欄を出さない。重要でなければ「重要」のバッジも出さない。", "Không có đính kèm thì không hiện khung 「添付ファイル」. Không quan trọng thì không hiện badge 「重要」.")),
     ]},
    {"id": "006", "code": "SW_HOME_002", "state": ["見つからない", "Không tìm thấy"],
     "url": "/supplier/notices/99999", "full": True, "wait": 600, "setup": "",
     "note": ["存在しない ID を開いたとき。他の仕入先に配信されたお知らせの ID を開いたときも同じ。", "Khi mở ID không tồn tại. Mở ID của thông báo gửi cho nhà cung cấp khác cũng như vậy."],
     "items": [
         X("13", "見つからないの表示", "Hiển thị 「không tìm thấy」", ".empty", "label", err=["I400"], detail=("「お知らせが見つかりません。」（I400・{対象}＝お知らせ）。戻る手段は、お知らせ一覧（SW_HOME_003）への「一覧に戻る」とサイドメニューの「ホーム」。", "「お知らせが見つかりません。」 (I400, {対象} = お知らせ). Cách quay lại là 「一覧に戻る」 về danh sách thông báo (SW_HOME_003) và menu 「ホーム」 ở menu bên."),
           demo_ok=("コード：文言は「お知らせが見つかりません」（句点なし）で、戻るボタンがない（notices/[id]/page.tsx）。決定：I400 の文言と戻る導線", "Code: câu 「お知らせが見つかりません」 (không có dấu 。) và không có nút quay lại (notices/[id]/page.tsx). Quyết định: câu theo I400 và có đường quay lại")),
     ]},
    # ============================================================ SW_HOME_003 お知らせ一覧（台帳 S・受付簿 #439。コードにまだない画面）
    {"id": "007", "code": "SW_HOME_003", "state": ["初期表示（重要を上・新しい順・10件）", "Hiển thị ban đầu (quan trọng lên trên・mới nhất trước・10 dòng)"],
     "url": "/supplier/notices", "full": True, "wait": 600, "setup": "",
     "note": ["【撮影不可】コードにまだ「お知らせ一覧」の画面がない（/supplier/notices は未作成。詳細 /supplier/notices/[id] だけある）。ホームの「お知らせ一覧」から開く。画面ができたら撮影する。", "【Không chụp được】Code chưa có màn 「お知らせ一覧」 (/supplier/notices chưa tạo, chỉ có chi tiết /supplier/notices/[id]). Mở từ 「お知らせ一覧」 ở trang chủ. Chụp sau khi làm xong màn hình."],
     "items": [
         X("14", "ページ見出し", "Tiêu đề trang", ".ph", "area"),
         X("14.1", "画面名", "Tên màn hình", ".ph h1", "label", init=("お知らせ一覧", "「お知らせ一覧」")),
         X("14.2", "ホームに戻る", "Nút 「ホームに戻る」", ".ph a.btn", "link", "click", detail=("ホーム（SW_HOME_001）へ戻る。", "Quay về trang chủ (SW_HOME_001)."),
           demo_ok=("コードにない画面（宿題）。決定：台帳 S・受付簿 #439", "Màn hình chưa có trong code (bài tập). Quyết định: 台帳 S・受付簿 #439")),
         X("15", "お知らせの表", "Bảng thông báo", ".tbl-wrap", "table", pattern="P-LIST", err=["I01", "E346"],
           detail=("運営Web「お知らせ」で配信対象に「仕入先」（全員または個別選択）を選んだものの全件。初期の並びは「重要 → 新しい順」、10件ずつのページ送り（P-LIST）。検索条件は置かない（メニューにも足さない）。0件は I01、読み込めなかったときは E346 と「再読み込み」。行を押すとお知らせ詳細（SW_HOME_002）へ。「既読／未読」の印は付けない（既読を持つのはドライバーアプリだけ・台帳 S #456）。", "Toàn bộ thông báo mà 運営Web chọn đối tượng gửi 「仕入先」 (tất cả hoặc chọn riêng). Thứ tự ban đầu 「quan trọng → mới nhất」, phân trang 10 mục mỗi trang (P-LIST). Không đặt điều kiện tìm kiếm (cũng không thêm vào menu). 0 dòng: I01; khi không tải được: E346 và 「再読み込み」. Bấm dòng để mở chi tiết thông báo (SW_HOME_002). Không có dấu 「đã đọc／chưa đọc」 (chỉ app tài xế có 「đã đọc」, 台帳 S #456)."),
           demo_ok=("コードにない画面（宿題）。決定：台帳 S・受付簿 #439・#465", "Màn hình chưa có trong code (bài tập). Quyết định: 台帳 S・受付簿 #439・#465")),
         X("15.1", "日時・重要・カテゴリ・タイトル", "Ngày giờ・Quan trọng・カテゴリ・Tiêu đề", "-", "label", detail=("1行＝1件。左から 日時（yyyy-mm-dd HH:MM・JST）・「重要」のバッジ（重要なお知らせだけ）・カテゴリ（お知らせ／メニュー／メンテナンス／システム更新の4つ・台帳 F）・タイトル（60文字まで・長いときは折り返す）。ホームの一覧（No.6.1〜6.5）と同じ見せ方。", "1 dòng = 1 thông báo. Từ trái: ngày giờ (yyyy-mm-dd HH:MM, JST), badge 「重要」 (chỉ thông báo quan trọng), カテゴリ (4 loại: お知らせ／メニュー／メンテナンス／システム更新, 台帳 F), tiêu đề (tối đa 60 ký tự, dài thì xuống dòng). Hiển thị giống danh sách ở trang chủ (No.6.1〜6.5).")),
         X("15.2", "ページ送り", "Phân trang", "-", "area", pattern="P-LIST", detail=("10件ずつのページ送り（台帳 S・受付簿 #465）。ページ番号・前へ／次へで移る。", "Phân trang 10 mục mỗi trang (台帳 S・受付簿 #465). Chuyển bằng số trang・trước/sau."),
           op=("10件ずつに固定するか、表示件数の切り替え（P-PAGESIZE）も使うか。台帳 S は「10件ずつ」とだけある。案：10件ずつ固定（DA のお知らせ一覧と同じ・#437）", "Cố định 10 mục mỗi trang hay dùng cả chuyển số dòng (P-PAGESIZE). 台帳 S chỉ ghi 「10件ずつ」. Đề xuất: cố định 10 (giống danh sách thông báo DA・#437)"), ask="hong"),
     ]},
    {"id": "008", "code": "SW_HOME_003", "state": ["0件", "0 thông báo"],
     "url": "/supplier/notices", "full": True, "wait": 600, "setup": "", "login": "SP00005",
     "note": ["【撮影不可】画面がまだない。配信対象に「仕入先」を選んだお知らせが1件もないとき。", "【Không chụp được】Chưa có màn hình. Khi không có thông báo nào chọn đối tượng gửi 「仕入先」."],
     "items": [
         X("16", "0件の表示", "Hiển thị khi 0 thông báo", ".tbl-wrap", "label", err=["I01"], detail=("表の中に I01「表示するデータがありません。」を出す（P-LIST）。", "Hiện I01 「表示するデータがありません。」 trong bảng (P-LIST)."),
           demo_ok=("コードにない画面（宿題）。決定：台帳 S・受付簿 #439", "Màn hình chưa có trong code (bài tập). Quyết định: 台帳 S・受付簿 #439")),
     ]},
]
