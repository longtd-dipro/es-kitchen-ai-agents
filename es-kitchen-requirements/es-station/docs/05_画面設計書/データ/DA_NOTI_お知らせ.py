# -*- coding: utf-8 -*-
"""
ドライバーアプリ お知らせ（DA_NOTI）の画面設計書データ。
元：本物の Web（app/driver/news/page.tsx・app/driver/news/[id]/page.tsx・lib/driver/{fromDomain,area}.ts newsOf・readNews）。
決定の正：docs/決定台帳.md（F・M-3・運営F お知らせの配信対象「配送スタッフ」・R 2026-10-08 の H-13／H-24・H-27／既読）、受付簿 No.290・#428・#437・#456。
確認メモ：docs/05_画面設計書/確認メモ_DW_ドライバー.md（1-8・Q-DW11・Q-DW14。どちらも 2026-10-08 に hong が確定）。既読は個人ごと（運営Web の「既読状況」に出る：REQ-DL-651）。
撮影：スマホ幅 390×844。今日 2026/10/05・高橋 誠（DR00002）。
"""

TITLE = ["お知らせ（DA_NOTI）", "Thông báo (DA_NOTI)"]
SHEET = ["お知らせ", "Thông báo"]
BASENAME = "画面設計書_DA_NOTI_お知らせ"
IMG_PREFIX = "DA_NOTI"
OUT_DIR = "ドライバーアプリ"
CODE_NOTE = ["Screen Code は台帳 F（2026-10-07）の決まり：DA_NOTI_001（一覧）・002（詳細）", "Screen Code theo 台帳 F (2026-10-07): DA_NOTI_001 (danh sách)・002 (chi tiết)"]
SITE = "driver"
SYSTEM = {"ja": "ドライバーアプリ", "vi": "Ứng dụng tài xế (ドライバーアプリ)"}
AUTHOR = "Claude／確認：hong"
CREATED = "2026-10-07"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "driver", "loginId": "DR00002"}
VIEWPORT = (390, 844)
CODE_PATHS = ["app/driver", "lib/driver", "lib/domain/seed"]

DECISIONS = [
    {"date": "2026-10-07", "target": "DA_NOTI 全体", "q": ["ドライバーアプリの Screen Code", "Screen Code của ứng dụng tài xế"],
     "a": ["DA。お知らせ＝DA_NOTI_001（一覧）・002（詳細）", "DA. Thông báo = DA_NOTI_001 (danh sách)・002 (chi tiết)"], "src": "hong 回答 2026-10-07（確認メモ_DW Q-DW01・受付簿 No.290）"},
    {"date": "2026-10-07", "target": "DA_NOTI_001 No.2", "q": ["ドライバーへの自動通知（割当・お届け日の変更）をお知らせ一覧に出すか", "Có hiện thông báo tự động (phân công・đổi ngày giao) trong danh sách thông báo không"],
     "a": ["出す。お知らせ一覧に並べ、既読あり・リンク先なし。運営のお知らせ（配信対象「配送スタッフ」）と同じ一覧に新しい順で混ぜる", "Có. Xếp trong danh sách thông báo, có trạng thái đã đọc, không có đích liên kết. Trộn chung danh sách với thông báo của vận hành (đối tượng 「配送スタッフ」) theo thứ tự mới nhất trước"],
     "src": "hong 回答 2026-10-08（台帳 S・受付簿 #428・確認表 H-13）。DA は設計のまま。別の枠は足さない（別の枠を足すのは OW だけ）"},
    {"date": "2026-10-07", "target": "DA_NOTI_001 No.5", "q": ["お知らせ一覧のページ送り", "Phân trang danh sách thông báo"],
     "a": ["10件ずつ（ページ送りあり）・新しい順（お知らせは増え続けるため）", "10 mục mỗi trang (có phân trang)・mới nhất trước (vì thông báo tăng liên tục)"], "src": "hong 回答 2026-10-08（台帳 S・受付簿 #437・確認表 H-27）"},
    {"date": "2026-10-07", "target": "DA_NOTI_002 No.3", "q": ["既読をどう扱うか", "Xử lý đã đọc thế nào"],
     "a": ["詳細を開くと既読。既読は個人ごとで、運営Web の既読状況に出る（REQ-DL-651）", "Mở chi tiết là đã đọc. Đã đọc theo từng người, hiển thị ở trạng thái đã đọc của Web vận hành (REQ-DL-651)"], "src": "配送_06 §12-3（確認メモ_DW §1-8）"},
    {"date": "2026-10-08", "target": "DA_NOTI 全体", "q": ["「既読」の状態をどのサイトが持つか", "Trạng thái 「既読」 do site nào giữ"],
     "a": ["既読は個人で使うドライバーアプリ（DA）のお知らせだけが持つ。OW・SW・法人など複数の担当者が共用するサイトのお知らせ・通知は既読を持たない", "Trạng thái đã đọc chỉ do thông báo của ứng dụng tài xế (DA), dùng cá nhân, giữ. Thông báo của các site nhiều người cùng dùng như OW・SW・pháp nhân không giữ trạng thái đã đọc"],
     "src": "hong 回答 2026-10-08（台帳 S・受付簿 #456・確認表 H-13）"},
    {"date": "2026-10-08", "target": "DA_NOTI 全体", "q": ["DA の画面幅（PC 幅を書くか）", "Chiều rộng màn hình DA (có viết cho PC không)"],
     "a": ["スマホ幅だけを書く（PC 幅は書かない）", "Chỉ viết cho chiều rộng điện thoại (không viết cho PC)"], "src": "hong 回答 2026-10-08（台帳 S・受付簿 #437・確認表 H-24）"},
]
CHANGES = []

HIDE_ALWAYS = [".es-demo-bar", ".es-chatbot", ".es-chatbot__fab", "#es-review"]
STATIC_CSS = (".driver{position:static!important;height:auto!important;min-height:100vh}.driver .app{min-height:0!important}"
              ".driver .scroll{overflow:visible!important;flex:none!important}.driver .hbody{min-height:0!important}")
VIEWER_CSS = STATIC_CSS

SCREENS = [
    {"code": "DA_NOTI_001", "ja": "お知らせ一覧", "vi": "Danh sách thông báo"},
    {"code": "DA_NOTI_002", "ja": "お知らせ詳細", "vi": "Chi tiết thông báo"},
]


def V(id, code, ja, vi, url, items, setup="", note=None, full=True, **kw):
    d = {"id": id, "code": code, "state": [ja, vi], "url": url, "setup": setup, "full": full, "note": note or ["", ""], "items": items}
    d.update(kw)
    return d


def A(no, ja, vi, sel, kind, trig="view", detail=None, **kw):
    d = {"no": no, "ja": ja, "vi": vi, "sel": sel, "kind": kind, "trig": trig}
    if detail:
        d["detail"] = detail
    d.update(kw)
    return d


TOP = A("1", "上の帯", "Thanh trên", ".topbar", "area", "view", ["左に戻るボタン、真ん中に画面名「お知らせ」。トラブル報告のボタンは出さない。", "Trái là nút quay lại, giữa là tên màn 「お知らせ」. Không hiện nút báo sự cố."])
BACK = A("1.1", "戻る", "Quay lại", ".topbar .rb.l", "button", "click", ["押すと前の画面（ホームのベルから来たのでホーム）へ戻る。", "Bấm để về màn trước (đến từ chuông ở trang chủ nên về trang chủ)."])
DEMO_AUTO = ["コードは自動通知（割当・お届け日の変更）を混ぜて出す（決定どおり：hong 2026-10-08・受付簿 #428）。ページ送りはなく全件を出す。決定は10件ずつ（宿題・受付簿 #437）", "Code đã trộn thông báo tự động (phân công・đổi ngày giao) (đúng quyết định: hong 2026-10-08, 受付簿 #428). Không phân trang mà hiện toàn bộ. Quyết định là 10 mục mỗi trang (việc phải sửa; 受付簿 #437)"]

VIEWS = [
    V("001", "DA_NOTI_001", "初期（未読は強調・日付・タイトル）", "Ban đầu (chưa đọc được nhấn mạnh・ngày・tiêu đề)", "/driver/news",
      [TOP, BACK,
       A("2", "お知らせの一覧", "Danh sách thông báo", ".bar-h::お知らせ一覧^", "area", "view", [
           "運営のお知らせ（配信対象「配送スタッフ」または自分あて）と、自分あての自動通知（配送の割当・お届け日の変更）を、新しい順に並べる。1件ずつのカードは日付とタイトル。見られる範囲は公開開始日が今日以前のものだけ。",
           "Xếp theo thứ tự mới nhất trước: thông báo của vận hành (đối tượng 「配送スタッフ」 hoặc gửi riêng cho mình) và thông báo tự động gửi cho mình (phân công giao hàng・đổi ngày giao). Mỗi thẻ gồm ngày và tiêu đề. Chỉ thấy các mục có ngày bắt đầu công khai từ hôm nay trở về trước."],
         demo_ok=DEMO_AUTO),
       A("3", "お知らせのカード", "Thẻ thông báo", ".noti", "button", "click", [
           "日付（MM-DD（曜）。通知は時刻つき）とタイトル。重要なお知らせは「【重要】」を頭に付ける。未読は強調（太字・色）、既読は通常。押すと詳細（DA_NOTI_002）へ。",
           "Ngày (MM-DD（曜）; thông báo gửi riêng có kèm giờ) và tiêu đề. Thông báo quan trọng có 「【重要】」 ở đầu. Chưa đọc được nhấn mạnh (đậm・màu), đã đọc hiển thị bình thường. Bấm để sang chi tiết (DA_NOTI_002)."]),
       A("4", "ページ送り", "Phân trang", "-", "area", "view", ["10件ずつ。10件を超えるとき一覧の下に出す。お知らせは増え続けるので必要（hong 2026-10-08・受付簿 #437）。", "10 mục mỗi trang. Hiện dưới danh sách khi quá 10 mục. Cần vì thông báo tăng liên tục (hong 2026-10-08, 受付簿 #437)."],
         demo_ok=["コードはページ送りなしで全件を出す。決定は10件ずつ（宿題。受付簿 #437）", "Code không phân trang, hiện toàn bộ. Quyết định là 10 mục mỗi trang (việc phải sửa; 受付簿 #437)"])],
      login="DR00002", today="",
      note=["高橋 誠（DR00002）・今日 2026/10/05。【重要】年末年始の配送についてが未読。", "Takahashi Makoto (DR00002), hôm nay 2026/10/05. 「【重要】年末年始の配送について」 chưa đọc."]),
    V("002", "DA_NOTI_001", "0件（I01）", "0 mục (I01)", "/driver/news",
      [A("2", "お知らせの一覧", "Danh sách thông báo", ".bar-h::お知らせ一覧^", "area", "view", ["お知らせも通知も1件もないアカウントでは、一覧の中に I01「表示するデータがありません。」を出す。", "Tài khoản không có thông báo nào thì hiện I01 「表示するデータがありません。」 trong danh sách."], err=["I01"],
         demo_ok=["見本データではどのドライバーにも運営のお知らせが1件あり、0件は撮れない。コードは0件のとき見出しだけで文を出さない（宿題）", "Trong dữ liệu mẫu mọi tài xế đều có 1 thông báo của vận hành nên không chụp được 0 mục. Code khi 0 mục chỉ hiện tiêu đề, không hiện câu (việc phải sửa)"])],
      login="DR00002", today="", note=["決定の画面。コードにはまだなく、画像は通常の一覧。", "Màn theo quyết định, code chưa có, hình là danh sách thông thường."]),
    V("003", "DA_NOTI_002", "詳細（開くと既読）", "Chi tiết (mở là đã đọc)", "/driver/news/0",
      [TOP, BACK,
       A("2", "タイトル", "Tiêu đề", "div::【重要】年末年始の配送について", "label", "view", ["お知らせのタイトル（重要なお知らせは「【重要】」付き）。", "Tiêu đề thông báo (thông báo quan trọng có 「【重要】」)."]),
       A("3", "日付と本文", "Ngày và nội dung", "div::12/29〜1/3", "label", "view", ["日付と本文。改行はそのまま。開くと既読にする（個人ごと。既読を持つのはドライバーアプリだけ：受付簿 #456。運営Web の既読状況に出る：REQ-DL-651）。本文にリンクの動きはない（自動通知はリンク先なし）。", "Ngày và nội dung. Giữ xuống dòng. Mở là đánh dấu đã đọc (theo từng người; chỉ ứng dụng tài xế giữ trạng thái đã đọc: 受付簿 #456; hiển thị ở trạng thái đã đọc của Web vận hành: REQ-DL-651). Nội dung không có hoạt động liên kết (thông báo tự động không có đích)."])],
      login="DR00002", today=""),
    V("004", "DA_NOTI_002", "重要なお知らせ（「【重要】」が付く）", "Thông báo quan trọng (có 「【重要】」)", "/driver/news/0",
      [A("2", "タイトル", "Tiêu đề", "div::【重要】年末年始の配送について", "label", "view", ["運営Web のお知らせで「重要」にしたものは、タイトルの頭に「【重要】」を付けて出す（すでに付いていれば重ねない）。", "Thông báo được đặt 「重要」 ở Web vận hành sẽ thêm 「【重要】」 đầu tiêu đề (đã có thì không thêm chồng)."])],
      login="DR00002", today=""),
    V("005", "DA_NOTI_002", "見つからない（「お知らせが見つかりません。」）", "Không tìm thấy (「お知らせが見つかりません。」)", "/driver/news/99",
      [A("2", "見つからない表示", "Hiển thị không tìm thấy", ".empty", "label", "view", ["番号が違う・見られない範囲のとき「お知らせが見つかりません。」（I400）と「ホームに戻る」ボタン。", "Khi số sai・ngoài phạm vi được xem thì 「お知らせが見つかりません。」 (I400) và nút 「ホームに戻る」."], err=["I400"]),
       A("3", "ホームに戻る", "Về trang chủ", ".btn.sec", "button", "click", ["ホーム（DA_HOME_001）へ戻る。", "Về trang chủ (DA_HOME_001)."])],
      login="DR00002", today=""),
]
