# -*- coding: utf-8 -*-
"""
仕入先Web 操作マニュアル（SW_MANU）の画面設計書データ。元：本物の Web（app/supplier/(app)/manual/page.tsx・mocks/supplier/manuals.ts）。
決定：docs/決定台帳.md F「ドライバー・仕入先のマニュアル」（2026-10-07：マニュアルのリンク（URL）を運営Web の設定画面に置き、システム管理が変える）、受付簿 No.295。
台帳 S（2026-10-08・受付簿 #426・確認表 H-11）：SW は、リンクが空でも「操作マニュアル」の画面を残し「準備中」と出す（メニューは消さない。DA・OW・法人は台帳 F のまま）。
洗い出し：docs/05_画面設計書/確認メモ_SW_仕入先.md Q6（回答は台帳 F の上の行）。
コードが決定に追いついていないところは demo_ok（宿題）：コードは PDF 4件の一覧（タイトル・版・更新日・ダウンロード）を固定で持つ。設計は「リンク1つ」。
このため画面の2つの状態（001 リンクあり・002 リンクなし）は、コードの画面の中身を書き換えて設計の状態を再現した（コードが直るまでの代わり）。
"""

TITLE = ["操作マニュアル（SW_MANU）", "Hướng dẫn thao tác (SW_MANU)"]
SHEET = ["操作マニュアル", "Hướng dẫn"]
BASENAME = "画面設計書_SW_MANU_操作マニュアル"
IMG_PREFIX = "SW_MANU"
OUT_DIR = "仕入先Web"
CODE_NOTE = ["Screen Code は台帳 F の決まり：SW_<機能略>_<3桁>", "Screen Code theo 台帳 F: SW_<mã chức năng>_<3 chữ số>"]
SITE = "supplier"
SYSTEM = {"ja": "仕入先Web", "vi": "Web nhà cung cấp (仕入先Web)"}
AUTHOR = "Claude／確認：hong"
CREATED = "2026-10-07"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "supplier", "loginId": "SP00001"}
CODE_PATHS = ["app/supplier", "lib/supplier", "mocks/supplier"]


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
    {"date": "2026-10-07", "target": "SW_MANU_001 全体", "q": ["操作マニュアルの置き場と見せ方", "Nơi đặt và cách hiển thị hướng dẫn thao tác"],
     "a": ["マニュアルのリンク（URL）を運営Web の設定画面に置き、システム管理が変える（ドライバー用・仕入先用は別々）。仕入先の画面は「マニュアルを開く」のリンクだけ。タイトル・版・更新日の一覧は持たない", "Đặt liên kết (URL) hướng dẫn ở màn hình cài đặt của 運営Web, 「システム管理」 thay đổi được (riêng cho tài xế và nhà cung cấp). Màn hình nhà cung cấp chỉ có liên kết 「マニュアルを開く」, không có danh sách tiêu đề・phiên bản・ngày cập nhật"],
     "src": "hong 回答 2026-10-07（確認メモ_DW Q-DW06・台帳 F「ドライバー・仕入先のマニュアル」・受付簿 No.295）"},
    {"date": "2026-10-08", "target": "SW_MANU_001 No.3（状態 002）", "q": ["リンクが空のときの表示（SW だけ）", "Hiển thị khi liên kết còn trống (chỉ riêng SW)"],
     "a": ["SW は、リンクが空でも「操作マニュアル」の画面を残し、リンクの代わりに「準備中」と出す。サイドメニューの「操作マニュアル」も消さない（客先からマニュアルがまだ届いていないため、いまは空）。DA・OW・法人Web は台帳 F のまま（リンクもボタンも出さない）。2026-10-07 の「I01 を出す」は置き換えた", "SW: dù liên kết trống vẫn giữ màn hình 「操作マニュアル」 và thay liên kết bằng chữ 「準備中」. Menu bên 「操作マニュアル」 cũng không bỏ (vì khách hàng chưa gửi hướng dẫn nên hiện đang trống). DA・OW・Web pháp nhân giữ như 台帳 F (không hiện liên kết lẫn nút). Đã thay quyết định ngày 2026-10-07 「hiện I01」"],
     "src": "hong 回答 2026-10-08（確認表 H-11・台帳 S・受付簿 #426）"},
]

DECISIONS += [
    {"date": "2026-10-07", "target": "SW_MANU_001 全体", "q": ["マニュアルのリンク先", "Nơi đặt liên kết hướng dẫn"],
     "a": ["リンクは運営Web の設定画面で置く（決定済み）。空のときは「準備中」を出す（上の 2026-10-08）", "Liên kết đặt ở màn hình cài đặt 運営Web (đã quyết). Khi trống thì hiện 「準備中」 (xem mục 2026-10-08 ở trên)"],
     "src": "hong 回答 2026-10-07（確認メモ_SW O7）・2026-10-08（台帳 S・受付簿 #426）"},
]

CHANGES = []

HIDE_ALWAYS = [".es-demo-bar", ".es-chatbot", ".es-chatbot__fab", "#es-review"]
STATIC_CSS = ".app{height:auto!important;min-height:100vh}.main{overflow:visible!important}"
VIEWER_CSS = STATIC_CSS

SCREENS = [
    {"code": "SW_MANU_001", "ja": "操作マニュアル", "vi": "Hướng dẫn thao tác"},
]

# コードはまだ PDF 一覧なので、設計の状態に中身を書き換えて撮る
_LINK = ("const c=document.querySelector('.card'); c.innerHTML='<div class=\"manual-item\"><div class=\"pdf\">URL</div><div class=\"t\"><b>仕入先サイト 操作マニュアル</b>"
         "<div class=\"muted\">運営Web の設定画面で登録されたリンク先を、新しいタブで開きます。</div></div><button class=\"btn sm out\" id=\"kd-open\">マニュアルを開く</button></div>'; await new Promise(r=>setTimeout(r,200));")
_EMPTY = "const c=document.querySelector('.card'); c.innerHTML='<div class=\"empty\">準備中です。</div>'; await new Promise(r=>setTimeout(r,200));"

VIEWS = [
    {"id": "001", "code": "SW_MANU_001", "state": ["リンクあり", "Có liên kết"],
     "url": "/supplier/manual", "full": True, "wait": 600, "setup": "await new Promise(r=>setTimeout(r,800)); " + _LINK,
     "note": ["運営Web の設定画面でマニュアルのリンクが登録されているとき。コードはまだ PDF の一覧のため、画面は設計の状態に書き換えて撮っている。", "Khi liên kết hướng dẫn đã được đăng ký ở màn hình cài đặt 運営Web. Code hiện vẫn là danh sách PDF nên ảnh được chụp sau khi sửa nội dung thành trạng thái thiết kế."],
     "items": [
         X("1", "ページ見出し", "Tiêu đề trang", ".ph", "area"),
         X("1.1", "画面名", "Tên màn hình", ".ph h1", "label", init=("操作マニュアル", "「操作マニュアル」")),
         X("2", "マニュアルのカード", "Thẻ hướng dẫn", ".card", "area", detail=("見るだけの画面（入力欄なし）。マニュアルのリンク（URL）は運営Web の設定画面に置き、システム管理が変える（台帳 F 2026-10-07）。ドライバー用のリンクとは別に持つ。権限の区別はない（1社1アカウント）。リンクが空のときは「準備中」を出す（状態 002）。", "Màn hình chỉ xem (không có ô nhập). Liên kết (URL) hướng dẫn đặt ở màn hình cài đặt của 運営Web, 「システム管理」 thay đổi (台帳 F 2026-10-07). Giữ riêng với liên kết cho tài xế. Không phân quyền (1 công ty 1 tài khoản). Khi liên kết trống thì hiện 「準備中」 (trạng thái 002)."),
           demo_ok=("コード：PDF 4件（全体・納期回答出荷報告の手順・FAQ・CSV項目一覧）の一覧を固定で持ち、リンクは1つではない（manual/page.tsx・mocks/supplier/manuals.ts）。決定：運営Web の設定画面に置いたリンク1つ（台帳 F 2026-10-07）", "Code: giữ cố định danh sách 4 PDF (tổng thể・hướng dẫn trả lời giao hàng・FAQ・danh sách mục CSV), không phải 1 liên kết (manual/page.tsx・mocks/supplier/manuals.ts). Quyết định: 1 liên kết đặt ở màn hình cài đặt 運営Web (台帳 F 2026-10-07)")),
         X("2.1", "マニュアルの説明", "Mô tả hướng dẫn", ".manual-item .t", "label", detail=("タイトル「仕入先サイト 操作マニュアル」と、リンク先を新しいタブで開くという説明。", "Tiêu đề 「仕入先サイト 操作マニュアル」 và câu giải thích sẽ mở liên kết ở tab mới.")),
         X("2.2", "マニュアルを開く", "Nút 「マニュアルを開く」", ".manual-item button", "button", "click", err=["E482"], detail=("登録されたリンク先を新しいタブで開く。開けなかったときはトーストで E482。リンクの URL は http:// か https:// で始まる（運営Web 設定で確かめる）。", "Mở liên kết đã đăng ký ở tab mới. Không mở được thì toast E482. URL phải bắt đầu bằng http:// hoặc https:// (kiểm tra ở cài đặt 運営Web)."),
           demo_ok=("コード：PDF のダウンロード（about:blank を開く：useDownload.ts）。決定：登録したリンク先を新しいタブで開く", "Code: tải PDF (mở about:blank: useDownload.ts). Quyết định: mở liên kết đã đăng ký ở tab mới")),
     ]},
    {"id": "002", "code": "SW_MANU_001", "state": ["リンクなし（準備中）", "Chưa có liên kết (đang chuẩn bị)"],
     "url": "/supplier/manual", "full": True, "wait": 600, "setup": "await new Promise(r=>setTimeout(r,800)); " + _EMPTY,
     "note": ["運営Web の設定画面でリンクがまだ登録されていないとき（客先からマニュアルが届くまでは、この状態）。リンクの代わりに「準備中」と出す（SW だけの決まり）。画面は設計の状態に書き換えて撮っている。", "Khi liên kết chưa được đăng ký ở màn hình cài đặt 運営Web (đến khi khách hàng gửi hướng dẫn thì ở trạng thái này). Thay liên kết bằng chữ 「準備中」 (quy tắc riêng của SW). Ảnh chụp sau khi sửa nội dung thành trạng thái thiết kế."],
     "items": [
         X("3", "リンクがないときの表示（準備中）", "Hiển thị khi chưa có liên kết (đang chuẩn bị)", ".card .empty", "label", err=["I402"], detail=("リンクが空でも「操作マニュアル」の画面は残し、リンクの代わりに「準備中」と出す。サイドメニューの「操作マニュアル」も消さない。仕入先Web だけの決まり（台帳 S・2026-10-08）で、ドライバー・委託配送先・法人Web はリンクが空ならリンクもボタンも出さない（台帳 F）。表示する文言は共通メッセージ I402「準備中です。」。", "Dù liên kết trống vẫn giữ màn hình 「操作マニュアル」 và thay liên kết bằng chữ 「準備中」. Menu bên 「操作マニュアル」 cũng không bỏ. Quy tắc riêng của 仕入先Web (台帳 S・2026-10-08); tài xế・đối tác giao hàng・Web pháp nhân khi liên kết trống thì không hiện liên kết lẫn nút (台帳 F). Câu hiển thị dùng message chung I402 「準備中です。」."),
                      demo_ok=("コード：0件のときは「マニュアルはありません」（manual/page.tsx）。決定：リンクが空でも画面を残し「準備中」と出す（台帳 S・受付簿 #426）。コードを直す宿題", "Code: khi 0 mục hiện 「マニュアルはありません」 (manual/page.tsx). Quyết định: dù liên kết trống vẫn giữ màn hình và hiện 「準備中」 (台帳 S・受付簿 #426). Bài tập sửa code")),
         X("3.1", "読み込めなかったとき", "Khi không tải được", "-", "label", err=["E346"], detail=("読み込みの通信に失敗したときは E346「読み込めませんでした。再度お試しください。」と「再読み込み」のボタンを出す（I01 とは別）。", "Khi lỗi kết nối lúc tải thì hiện E346 「読み込めませんでした。再度お試しください。」 và nút 「再読み込み」 (khác với I01)."),
           demo_ok=("コード：読み込み失敗はトーストを出し、一覧は空のまま（E346 の表示と「再読み込み」がない：manual/page.tsx）。見本の API では失敗を起こせず撮影できない（要：API を失敗させる手段）", "Code: khi tải lỗi chỉ hiện toast và để danh sách trống (không có hiển thị E346 và nút 「再読み込み」: manual/page.tsx). API mẫu không tạo được lỗi nên không chụp được (cần: cách làm API thất bại)")),
     ]},
]
