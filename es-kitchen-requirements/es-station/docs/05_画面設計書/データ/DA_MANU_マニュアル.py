# -*- coding: utf-8 -*-
"""
ドライバーアプリ マニュアル（DA_MANU）の画面設計書データ。
元：本物の Web（app/driver/page.tsx の「マニュアル」ボタン・app/driver/account/page.tsx・app/driver/manuals/**・lib/driver/seed.ts MANUALS）。
決定の正：docs/決定台帳.md（F 2026-10-07「ドライバー・仕入先のマニュアル」＝リンク（URL）を運営Web の設定画面に置き、システム管理が変える）、受付簿 No.292・295。
確認メモ：docs/05_画面設計書/確認メモ_DW_ドライバー.md（1-7・Q-DW06 の回答）。決定により、マニュアルの一覧・詳細（固定の文章）の画面は作らず、リンクを開くボタンだけにする。
撮影：スマホ幅 390×844。コードにはまだリンクを開く動きがなく、固定の文章の画面（/driver/manuals）を開く。
"""

TITLE = ["マニュアル（DA_MANU）", "Hướng dẫn sử dụng (DA_MANU)"]
SHEET = ["マニュアル", "Hướng dẫn"]
BASENAME = "画面設計書_DA_MANU_マニュアル"
IMG_PREFIX = "DA_MANU"
OUT_DIR = "ドライバーアプリ"
CODE_NOTE = ["Screen Code は台帳 F（2026-10-07）の決まり：DA_MANU_001（マニュアルのリンク）。決定でリンクだけにしたので、詳細の画面（DA_MANU_002）は作らない（確認メモ 1-7 の一覧・詳細は置き換え）",
             "Screen Code theo 台帳 F (2026-10-07): DA_MANU_001 (link hướng dẫn). Theo quyết định chỉ còn link nên không làm màn chi tiết (DA_MANU_002) (danh sách・chi tiết ở mục 1-7 của memo được thay thế)"]
SITE = "driver"
SYSTEM = {"ja": "ドライバーアプリ", "vi": "Ứng dụng tài xế (ドライバーアプリ)"}
AUTHOR = "Claude／確認：hong"
CREATED = "2026-10-07"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "driver", "loginId": "DR00002"}
VIEWPORT = (390, 844)
CODE_PATHS = ["app/driver", "lib/driver"]

DECISIONS = [
    {"date": "2026-10-07", "target": "DA_MANU_001 全体", "q": ["ドライバーアプリの Screen Code", "Screen Code của ứng dụng tài xế"],
     "a": ["DA。マニュアル＝DA_MANU_001", "DA. Hướng dẫn = DA_MANU_001"], "src": "hong 回答 2026-10-07（確認メモ_DW Q-DW01・受付簿 No.290）"},
    {"date": "2026-10-07", "target": "DA_MANU_001 No.2〜3", "q": ["ドライバー向けマニュアルの中身を誰がどこで管理するか", "Ai quản lý nội dung hướng dẫn cho tài xế và ở đâu"],
     "a": ["マニュアルのリンク（URL）を運営Web の設定画面に置き、システム管理が変える（ドライバー用・仕入先用・法人用）。アプリは文章を持たず、リンクを開くだけ。URL が空のときはボタンを出さない", "Đặt link (URL) hướng dẫn ở màn cài đặt Web vận hành, quản trị hệ thống thay đổi (cho tài xế・nhà cung cấp・pháp nhân). App không giữ văn bản, chỉ mở link. URL trống thì không hiện nút"],
     "src": "hong 回答 2026-10-07（確認メモ_DW Q-DW06 の A・台帳 F・受付簿 No.292・295）"},
    {"date": "2026-10-07", "target": "DA_MANU_001 No.4", "q": ["リンクをどう開くか", "Mở link như thế nào"],
     "a": ["別のタブ（端末のブラウザ）で開く。アプリの画面は残る。日本語の資料（言語切替なし：台帳 K）", "Mở ở tab khác (trình duyệt của thiết bị). Màn hình app vẫn còn. Tài liệu tiếng Nhật (không chuyển ngôn ngữ: 台帳 K)"],
     "src": "Claude 案・hong 確認待ち（確認メモ B 段階 B-4）"},
]
CHANGES = []

HIDE_ALWAYS = [".es-demo-bar", ".es-chatbot", ".es-chatbot__fab", "#es-review"]
STATIC_CSS = (".driver{position:static!important;height:auto!important;min-height:100vh}.driver .app{min-height:0!important}"
              ".driver .scroll{overflow:visible!important;flex:none!important}.driver .hbody{min-height:0!important}")
VIEWER_CSS = STATIC_CSS

SCREENS = [{"code": "DA_MANU_001", "ja": "マニュアルのリンク", "vi": "Link hướng dẫn"}]


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


DEMO_LINK = ["コードはリンクを開かず、固定の文章5本の一覧（/driver/manuals）と詳細（/driver/manuals/n）を開く。決定に合わせてリンクを開く形に直し、一覧・詳細の画面は作らない（宿題・Q-DW06）",
             "Code không mở link mà mở danh sách 5 văn bản cố định (/driver/manuals) và chi tiết (/driver/manuals/n). Sửa thành mở link theo quyết định, không làm màn danh sách・chi tiết (việc phải sửa・Q-DW06)"]

VIEWS = [
    V("001", "DA_MANU_001", "ホームの「マニュアル」ボタン（リンクあり）", "Nút 「マニュアル」 ở trang chủ (có link)", "/driver",
      [A("1", "マニュアル（ホームのボタン）", "Hướng dẫn (nút ở trang chủ)", ".qa button::マニュアル", "link", "click", [
          "ホームの「棚卸し」の隣のボタン。押すとマニュアルのリンク（URL）を別のタブで開く。URL は運営Web の設定画面にシステム管理が置く（台帳 F 2026-10-07）。",
          "Nút bên cạnh 「棚卸し」 ở trang chủ. Bấm để mở link (URL) hướng dẫn ở tab khác. URL do quản trị hệ thống đặt ở màn cài đặt Web vận hành (台帳 F 2026-10-07)."],
         req="－", len=["URL（http:// か https:// で始まる・255文字まで）", "URL (bắt đầu bằng http:// hoặc https://, tối đa 255 ký tự)"], init=["運営Web の設定の値", "Giá trị trong cài đặt Web vận hành"],
         ex=["https://example.jp/driver-manual", "URL hướng dẫn do khách cung cấp"], cond=["設定の URL が空でないとき出す", "Hiện khi URL trong cài đặt không trống"],
         valid=["URL は運営Web の設定画面で E10 の規則に合うものだけ保存できる。", "URL chỉ lưu được khi khớp quy tắc E10 ở màn cài đặt Web vận hành."], err=["E10"],
         open=["マニュアルの URL（客先が用意する資料。形式・更新の頻度。更新が多ければ運営Web に管理画面を作る案を再検討：Q-DW06 の B）", "URL hướng dẫn (tài liệu khách chuẩn bị. Định dạng・tần suất cập nhật. Nếu cập nhật nhiều thì xem lại phương án làm màn quản lý ở Web vận hành: B của Q-DW06)"], ask="お客様（営業）",
         demo_ok=DEMO_LINK)],
      login="DR00002", today="",
      note=["ホームの「マニュアル」ボタンの位置。押した先はリンク（別のタブ）で、アプリの中に画面はない。", "Vị trí nút 「マニュアル」 ở trang chủ. Đích là link (tab khác), không có màn trong app."]),
    V("002", "DA_MANU_001", "アカウント画面の「マニュアル」ボタン（リンクあり）", "Nút 「マニュアル」 ở màn アカウント (có link)", "/driver/account",
      [A("2", "マニュアル（アカウントのボタン）", "Hướng dẫn (nút ở アカウント)", "button.btn.sec::マニュアル", "link", "click", [
          "アカウント画面の「マニュアル」ボタン。ホームのボタンと同じリンクを別のタブで開く。URL が空のときは出さない。",
          "Nút 「マニュアル」 ở màn アカウント. Mở cùng link với nút ở trang chủ ở tab khác. URL trống thì không hiện."],
         demo_ok=DEMO_LINK)],
      login="DR00002", today=""),
    V("003", "DA_MANU_001", "リンクが空のとき（ボタンを出さない）", "Khi link trống (không hiện nút)", "/driver/account",
      [A("3", "ボタンを出さない", "Không hiện nút", "-", "area", "view", [
          "運営Web の設定でマニュアルの URL が空のとき、ホームとアカウントの「マニュアル」ボタンを出さない（客先から資料がまだ届いていない間はこの状態：台帳 F）。文言のメッセージは出さない。",
          "Khi URL hướng dẫn ở cài đặt Web vận hành trống thì không hiện nút 「マニュアル」 ở trang chủ và アカウント (khi khách chưa gửi tài liệu thì ở trạng thái này: 台帳 F). Không hiện thông báo bằng chữ."],
         demo_ok=["見本データには設定画面とマニュアルの URL がなく、コードは常にボタンを出す。この状態は撮れない（宿題）", "Dữ liệu mẫu chưa có màn cài đặt và URL hướng dẫn, code luôn hiện nút. Không chụp được trạng thái này (việc phải sửa)"])],
      login="DR00002", today="",
      note=["決定の画面で、コードにはまだない。画像は通常のアカウント画面。", "Màn theo quyết định, code chưa có. Hình là màn アカウント thông thường."]),
]
