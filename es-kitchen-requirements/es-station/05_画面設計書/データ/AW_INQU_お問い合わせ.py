# -*- coding: utf-8 -*-
"""
画面設計書のデータ：運営管理者Web「お問い合わせ（法人Webから）」（AW_INQU）。
元は本物の Web（app/ops/inquiries）。決定は docs/決定台帳.md「お問い合わせ（運営Web）の画面」「お問い合わせ（HubSpot）」「お問い合わせの送信エラー（HubSpot）の扱い」（確認中）。
コードとの違い（demo_ok）：検索条件・ページ送り、法人名・拠点名の列、詳細の画面（コードは行の中に本文を開く）、パンくず・画面名。
"""

TITLE = ["お問い合わせ（法人Webから）（AW_INQU）", "Liên hệ từ Web công ty (AW_INQU)"]
SHEET = ["お問い合わせ", "Liên hệ"]
BASENAME = "画面設計書_AW_INQU_お問い合わせ"
IMG_PREFIX = "AW_INQU"
OUT_DIR = "AW_INQU_お問い合わせ"
CODE_NOTE = ["画面コード規約：AW＝Admin Web、INQU＝お問い合わせ（Inquiry）", "Quy ước mã màn hình: AW = Admin Web, INQU = Inquiry"]
SITE = "ops"
SYSTEM = {"ja": "運営管理者Web", "vi": "Web quản trị vận hành"}
AUTHOR = "Claude（cloud）／確認：hong"
CREATED = "2026-10-05"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "ops", "loginId": "Ad00010"}

DECISIONS = [
    {"date": "2026-10-05", "target": "AW_INQU_001", "q": ["検索条件・ページ送りを置くか、法人・拠点の列、本文の見せ方、権限", "Có 検索・ページ送り không, cột 法人・拠点, cách xem 本文, quyền"],
     "a": ["検索（キーワード・法人・種類・新着のみ・送信日。状態では絞らない）とページ送り（10件・送信日時の降順）を置く。法人名・拠点名の2列。行を押すと詳細の画面へ（開いた時点で新着が外れる）。見られるのはフル権限・システム管理だけ", "Có 検索 và ページ送り (10 dòng, 送信日時 giảm dần). 2 cột 法人名・拠点名. Nhấn dòng mở màn 詳細 (mở là bỏ 新着). Chỉ フル権限・システム管理 thấy"], "src": "hong 回答 2026/10/05（I1・I2・I4＝B・I5＝A）"},
    {"date": "2026-10-05", "target": "AW_INQU_001 No.2・3.8、AW_INQU_002 No.2.2", "q": ["HubSpot に送れなかったときの扱い（I3）", "Xử lý khi gửi HubSpot thất bại (I3)"],
     "a": ["お客様にエラーを出して送り直してもらう（法人Web：「送信できませんでした。時間をおいてもう一度お試しください。」・入力はフォームに残す）。送れなかったものは ES に残さない。状態「送信エラー」・再送ボタン・TOP の警告は作らない。運営の一覧に出るのは送れたものだけなので、検索条件に「状態」は置かない", "Báo lỗi cho khách và khách gửi lại (法人Web hiện「送信できませんでした。時間をおいてもう一度お試しください。」, giữ nội dung trong form). Không lưu vào ES. Không có trạng thái 送信エラー, nút gửi lại, cảnh báo ở TOP. 一覧 chỉ có bản gửi được nên không có điều kiện 状態"], "src": "hong 回答 2026/10/05 夕（I3＝B。運営・法人の画面 §5b-5・受付簿 #133）"},
    {"date": "2026-10-05", "target": "AW_INQU_002", "q": ["詳細の画面", "Màn chi tiết"], "a": ["一覧の行の中ではなく別の画面（コードも作った：/ops/inquiries/{ID}）", "Màn riêng, không mở trong dòng (đã làm trong code: /ops/inquiries/{ID})"], "src": "hong 2026/10/05 夕「お問い合わせ詳細画面を分けてください」（I4＝B）"},
    {"date": "2026-10-05", "target": "パンくず・画面名", "q": ["メニューの組の名前と画面名", "Tên nhóm và tên màn"], "a": ["お知らせ・ご意見 ＞ お問い合わせ（法人Webから）", "お知らせ・ご意見 > お問い合わせ（法人Webから）"], "src": "hong 回答 2026/10/05（C4＝A）"},
]
CHANGES = []
HIDE_ALWAYS = []
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [
    {"code": "AW_INQU_001", "ja": "お問い合わせ一覧", "vi": "Danh sách liên hệ"},
    {"code": "AW_INQU_002", "ja": "お問い合わせ詳細", "vi": "Chi tiết liên hệ"},
]

H = (
    "const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));"
    "const row=(id)=>[...document.querySelectorAll('tr')].find(tr=>(tr.textContent||'').includes(id));"
)

L_ITEMS = [
    {"no": "1", "ja": "ヘッダー", "vi": "Đầu trang", "sel": ".ph", "kind": "area", "trig": "view",
     "detail": ["パンくず：お知らせ・ご意見 ＞ お問い合わせ（法人Webから）。見られるのはフル権限・システム管理だけ（Hubspot/API連携の権限）。", "Breadcrumb: お知らせ・ご意見 > お問い合わせ（法人Webから）. Chỉ フル権限・システム管理 thấy (quyền Hubspot/API連携)."],
     "demo_ok": ["コードのパンくず「お知らせ設定」・画面名「お問い合わせ（HubSpot 送信）」を直す（hong 2026-10-05 C4）", "Sửa breadcrumb お知らせ設定 và tiêu đề（HubSpot 送信）(hong 2026-10-05 C4)"]},
    {"no": "1.1", "ja": "CSV出力", "vi": "Xuất CSV", "sel": ".ph", "kind": "button", "trig": "click", "pattern": "P-CSV-OUT",
     "detail": ["ヘッダーの右。検索条件のとおりの全件。列：受付番号・送信日時・法人ID・法人名・拠点ID・拠点名・お名前・メール・電話・種類・件名・本文・新着。", "Bên phải đầu trang. Toàn bộ theo điều kiện. Cột: 受付番号, 送信日時, 法人ID, 法人名, 拠点ID, 拠点名, お名前, メール, 電話, 種類, 件名, 本文, 新着."],
     "demo_ok": ["コードはボタンを置いているが、権限（Hubspot/API連携）に CSV出力 がなく出ない。CSV入出力_定義（お問い合わせは CSV出力あり）に合わせて権限に CSV出力 を足す", "Code có nút nhưng quyền Hubspot/API連携 không có CSV出力 nên không hiện; thêm CSV出力 vào quyền theo CSV入出力_定義"]},
    {"no": "1.2", "ja": "説明", "vi": "Giải thích", "sel": ".notice", "kind": "label", "trig": "show",
     "detail": ["法人Web のお問い合わせは HubSpot に送る。返事・対応は HubSpot で行う。通知先メールは 設定管理 ＞ お問い合わせ通知先メール（空なら送らない）。", "お問い合わせ từ 法人Web gửi sang HubSpot. Trả lời trong HubSpot. 通知先メール ở 設定管理 (trống = không gửi)."]},
    {"no": "2", "ja": "検索条件", "vi": "Điều kiện tìm kiếm", "sel": ".card", "kind": "area", "trig": "view", "pattern": "P-LIST",
     "detail": ["キーワード（受付番号・件名・お名前）／法人／種類（ご契約・お申し込み・配送・お届け・商品・メニュー・請求・お支払い・アプリ・自販機・その他）／新着のみ／送信日（から・まで）。「検索」か Enter で反映。状態では絞らない（一覧に出るのは HubSpot に送れたものだけ：I3＝B）。", "キーワード (受付番号, 件名, お名前) / 法人 / 種類 (6 loại của 法人Web) / 新着のみ / 送信日 (từ, đến). Áp dụng khi 検索 hoặc Enter. Không lọc theo 状態 (chỉ có bản đã gửi được HubSpot: I3=B)."],
     "demo_ok": ["コードに検索条件がない。足す（hong 2026-10-05 I1）", "Code không có 検索; thêm (hong 2026-10-05 I1)"]},
    {"no": "3", "ja": "お問い合わせの一覧", "vi": "Bảng liên hệ", "sel": ".tbl", "kind": "table", "trig": "view", "pattern": "P-LIST", "err": ["I01"],
     "detail": ["初期の並びは送信日時の降順。1ページ 10件（10／20／50）。行を押すと詳細（AW_INQU_002）へ。0件は I01（コードの「まだお問い合わせはありません」は I01 に揃える）。", "Sắp theo 送信日時 giảm dần. 10 dòng/trang. Nhấn dòng mở chi tiết (AW_INQU_002). 0 dòng hiện I01 (code ghi câu khác; đồng nhất về I01)."],
     "demo_ok": ["コードはページ送りなし（足す）。行を押すと詳細の画面へ（コード済み）", "Code chưa phân trang (thêm). Nhấn dòng mở màn 詳細 (đã làm trong code)"]},
    {"no": "3.1", "ja": "送信日時", "vi": "Ngày giờ gửi", "sel": ".tbl th::送信日時", "kind": "label", "trig": "view", "detail": ["yyyy-mm-dd HH:MM。まだ開いていないものは「新着」バッジ（運営 TOP の件数と同じ）。", "yyyy-mm-dd HH:MM. Chưa mở thì badge 新着 (cùng số đếm ở TOP)."]},
    {"no": "3.2", "ja": "受付番号（HubSpot）", "vi": "Số tiếp nhận (HubSpot)", "sel": ".tbl th::受付番号", "kind": "label", "trig": "view", "detail": ["HubSpot の受付番号（HS-…）。下に ES STATION の ID（IQ-YYMMDD-NNNN）。", "Số của HubSpot (HS-…). Dưới là ID của ES STATION (IQ-YYMMDD-NNNN)."]},
    {"no": "3.3", "ja": "法人名", "vi": "Tên công ty", "sel": ".tbl th::法人", "kind": "label", "trig": "view", "detail": ["法人名（下に法人ID）。", "Tên công ty (dưới là ID)."],
     "demo_ok": ["コードは法人ID・拠点ID を1列に出す。法人名・拠点名の2列に（hong 2026-10-05 I2）", "Code hiện ID trong 1 cột; sửa thành 2 cột 法人名・拠点名 (hong 2026-10-05 I2)"]},
    {"no": "3.4", "ja": "拠点名", "vi": "Tên chi nhánh", "sel": ".tbl th::法人", "kind": "label", "trig": "view", "detail": ["拠点名（下に拠点ID）。法人アカウントからの送信は空。", "Tên chi nhánh (dưới là ID). Gửi từ tài khoản 法人 thì trống."],
     "demo_ok": ["同上（2列に分ける）", "Như trên (tách 2 cột)"]},
    {"no": "3.5", "ja": "お名前・メール", "vi": "Tên, email", "sel": ".tbl th::お名前", "kind": "label", "trig": "view", "detail": ["送った人の名前。下にメール・電話。", "Tên người gửi; dưới là email, điện thoại."]},
    {"no": "3.6", "ja": "種類", "vi": "Loại", "sel": ".tbl th::種類", "kind": "label", "trig": "view", "detail": ["法人Web で選んだ種類（6つ）。", "Loại chọn ở 法人Web (6 loại)."]},
    {"no": "3.7", "ja": "件名", "vi": "Tiêu đề", "sel": ".tbl th::件名", "kind": "link", "trig": "click", "detail": ["押すと詳細（AW_INQU_002）へ（行のどこを押しても同じ）。", "Nhấn mở chi tiết (AW_INQU_002); nhấn chỗ nào trên dòng cũng vậy."]},
    {"no": "3.8", "ja": "状態", "vi": "Trạng thái", "sel": ".tbl th::状態", "kind": "label", "trig": "view", "detail": ["「送信済（HubSpot）」だけ（緑）。HubSpot に送れなかったお問い合わせは ES に残さない（お客様に送り直してもらう：I3＝B）ので「送信エラー」はない。", "Chỉ có「送信済（HubSpot）」(xanh). Bản gửi HubSpot thất bại không lưu vào ES (khách gửi lại: I3=B) nên không có 送信エラー."],
     "demo_ok": ["コードには「送信エラー」の状態がまだある。外す（受付簿 #133）", "Code vẫn còn trạng thái 送信エラー; bỏ (受付簿 #133)"]},
    {"no": "4", "ja": "ページ送り", "vi": "Phân trang", "sel": ".card .hint", "kind": "area", "trig": "view", "detail": ["「n件中 a–b件」・ページ番号・表示件数（10／20／50）。", "\"n件中 a–b件\", số trang, số dòng/trang."],
     "demo_ok": ["コードにページ送りがない。足す", "Code không có phân trang; thêm"]},
]
D_ITEMS = [
    {"no": "1", "ja": "ヘッダー", "vi": "Đầu trang", "sel": ".ph", "kind": "area", "trig": "view",
     "detail": ["パンくず：お知らせ・ご意見 ＞ お問い合わせ（法人Webから） ＞ お問い合わせ詳細。タイトルに受付番号（HubSpot）。開いた時点で新着が外れる（TOP の件数も減る）。", "Breadcrumb: … > お問い合わせ詳細. Tiêu đề có 受付番号 (HubSpot). Mở là bỏ 新着 (số ở TOP giảm)."],
     "demo_ok": ["コードのパンくず「お知らせ設定」「お問い合わせ（HubSpot 送信）」を組の名前・画面名に直す（hong 2026-10-05 C4）", "Sửa breadcrumb theo tên nhóm và tên màn (hong 2026-10-05 C4)"]},
    {"no": "1.1", "ja": "一覧へ戻る", "vi": "Về danh sách", "sel": ".ph .btns button::一覧へ戻る", "kind": "button", "trig": "click", "detail": ["一覧（AW_INQU_001）へ。", "Về danh sách (AW_INQU_001)."]},
    {"no": "2", "ja": "お問い合わせの内容", "vi": "Nội dung liên hệ", "sel": ".card .sec", "kind": "area", "trig": "view",
     "detail": ["読むだけ。返事・対応は HubSpot で行う（この画面では書かない）。", "Chỉ xem. Trả lời trong HubSpot (không viết ở đây)."]},
    {"no": "2.1", "ja": "受付番号（HubSpot）", "vi": "Số tiếp nhận (HubSpot)", "sel": ".fld::受付番号", "kind": "label", "trig": "view", "detail": ["HS-＋10桁（HubSpot の受付番号）。", "HS- + 10 số (số của HubSpot)."]},
    {"no": "2.2", "ja": "ID", "vi": "ID", "sel": ".fld::ID", "kind": "label", "trig": "view", "detail": ["ES STATION の ID（IQ-YYMMDD-NNNN）。", "ID của ES STATION (IQ-YYMMDD-NNNN)."]},
    {"no": "2.3", "ja": "送信日時", "vi": "Ngày giờ gửi", "sel": ".fld::送信日時", "kind": "label", "trig": "view", "detail": ["yyyy-mm-dd HH:MM。", "yyyy-mm-dd HH:MM."]},
    {"no": "2.4", "ja": "状態", "vi": "Trạng thái", "sel": ".fld::状態", "kind": "label", "trig": "view",
     "detail": ["「送信済（HubSpot）」だけ。再送の操作はない（送れなかったものは ES に残さず、お客様が送り直す：I3＝B）。", "Chỉ「送信済（HubSpot）」. Không có thao tác gửi lại (bản thất bại không lưu; khách gửi lại: I3=B)."]},
    {"no": "2.5", "ja": "法人名", "vi": "Tên công ty", "sel": ".fld::法人名", "kind": "label", "trig": "view", "detail": ["法人名＋法人ID。", "Tên công ty + ID."]},
    {"no": "2.6", "ja": "拠点名", "vi": "Tên chi nhánh", "sel": ".fld::拠点名", "kind": "label", "trig": "view", "detail": ["拠点名＋拠点ID。法人アカウントからの送信は「—」。", "Tên chi nhánh + ID. Gửi từ tài khoản 法人 thì「—」."]},
    {"no": "2.7", "ja": "お名前", "vi": "Tên", "sel": ".fld::お名前", "kind": "label", "trig": "view"},
    {"no": "2.8", "ja": "メールアドレス", "vi": "Email", "sel": ".fld::メールアドレス", "kind": "label", "trig": "view"},
    {"no": "2.9", "ja": "電話番号", "vi": "Điện thoại", "sel": ".fld::電話番号", "kind": "label", "trig": "view", "detail": ["なければ「—」。", "Không có thì「—」."]},
    {"no": "2.10", "ja": "種類", "vi": "Loại", "sel": ".fld::種類", "kind": "label", "trig": "view", "detail": ["法人Web で選んだ種類。", "Loại chọn ở 法人Web."]},
    {"no": "2.11", "ja": "件名", "vi": "Tiêu đề", "sel": ".fld::件名", "kind": "label", "trig": "view"},
    {"no": "2.12", "ja": "本文", "vi": "Nội dung", "sel": ".fld::本文", "kind": "label", "trig": "view", "detail": ["法人Web で入力した本文（500文字まで）。改行はそのまま。", "Nội dung nhập ở 法人Web (≤500). Giữ xuống dòng."]},
    {"no": "2.13", "ja": "通知先メール", "vi": "Mail thông báo", "sel": ".fld::通知先メール", "kind": "label", "trig": "view", "detail": ["設定管理の通知先メールに送ったか（空なら「送っていない」）。", "Đã gửi tới 通知先メール ở 設定管理 chưa (trống thì「送っていない」)."]},
]

def V(id, code, ja, vi, url, items, setup="", note=None, full=True, wait=500):
    return {"id": id, "code": code, "state": [ja, vi], "url": url, "setup": (H + setup) if setup else "", "full": full, "wait": wait, "note": note or ["", ""], "items": items}

VIEWS = [
    V("001", "AW_INQU_001", "初期表示（新着あり）", "Ban đầu (có 新着)", "/ops/inquiries", L_ITEMS,
      note=["決定（hong 2026-10-05）：検索条件・ページ送り・法人名／拠点名の列を足す。コードは未対応（宿題）。", "Quyết định: thêm 検索, ページ送り, cột 法人名/拠点名. Code chưa có (việc phải sửa)."]),
    V("002", "AW_INQU_002", "詳細", "Chi tiết", "/ops/inquiries/IQ-261003-0001", D_ITEMS,
      note=["別の画面（I4＝B・hong 2026-10-05「詳細画面を分けて」）。開くと新着が外れる。", "Màn riêng (I4=B; hong 2026-10-05). Mở là bỏ 新着."]),
]
