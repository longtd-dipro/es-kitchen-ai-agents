# -*- coding: utf-8 -*-
"""
画面設計書のデータ：運営管理者Web ＞ 設定管理 ＞ バージョン&強制アップデート（一覧・登録・編集・削除）
元：本物の Web（app/ops/settings/version・app/ops/_general/gen.ts の version・lib/domain/areas/account.ts の setAppVersion/removeAppVersion）、台帳 F（2026-10-06）、
    運営Web_権限表（権限付与）、CSV入出力_定義（バージョンは CSV出力のみ）
番号は画面ごとに通し。タブ・モーダルの状態では、その状態で増える・変わる項目だけ書く。
"""

TITLE = ["バージョン&強制アップデート（AW_VERS）", "Phiên bản & cập nhật bắt buộc (AW_VERS)"]
SHEET = ["バージョン&強制アップデート", "Phiên bản & cập nhật bắt buộc"]
BASENAME = "画面設計書_AW_VERS_バージョン"
IMG_PREFIX = "AW_VERS"
OUT_DIR = "AW_VERS_バージョン"
CODE_NOTE = ["画面コードは規約 <Module(2)>_<Feature(4)>_<Seq(3)>（docs/01_仕様/画面コード規約_20261005.md）。AW＝運営管理者Web、VERS＝バージョン&強制アップデート",
             "Mã màn hình theo quy ước <Module(2)>_<Feature(4)>_<Seq(3)>. AW = Admin Web, VERS = Phiên bản & cập nhật bắt buộc"]
SITE = "ops"
SYSTEM = {"ja": "運営管理者Web", "vi": "Web quản trị vận hành"}
AUTHOR = "Claude（cloud）／確認：hong"
CREATED = "2026-10-06"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "ops", "loginId": "Ad00010"}
CODE_PATHS = ["app/ops/settings/version", "app/ops/_general", "lib/domain/seed"]

DECISIONS = [
    {"date": "2026-10-06", "target": "バージョンの登録・編集",
     "q": ["「新規登録」「編集」の画面は", "Màn đăng ký mới / sửa thế nào"],
     "a": ["モーダル。入力は 端末OS（iOS／Android）・バージョン名（2.1.0 の形）・強制アップデート（ON／OFF）・管理用備考。編集は強制アップデートと管理用備考だけ（端末OS・バージョン名は変えない）。同じ端末OS＋バージョン名は登録できない（エラー）", "Modal. Nhập OS (iOS/Android), tên phiên bản (dạng 2.1.0), cập nhật bắt buộc (ON/OFF), ghi chú. Khi sửa chỉ đổi được cập nhật bắt buộc và ghi chú. Trùng OS + phiên bản thì báo lỗi"],
     "src": "hong 回答 2026-10-06（運営I2 #2＝A）・台帳 F・受付簿 No.174"},
    {"date": "2026-10-06", "target": "権限",
     "q": ["だれが見られる・操作できるか", "Ai xem/thao tác được"],
     "a": ["フル権限・システム管理＝CRUD（登録・編集・削除・CSV出力）、ほかの6役割＝R（閲覧・CSV出力）", "フル権限・システム管理 = CRUD (đăng ký, sửa, xóa, xuất CSV); 6 vai trò khác = R (xem, xuất CSV)"],
     "src": "hong 回答 2026-10-06・台帳 F・受付簿 No.173"},
    {"date": "2026-10-06", "target": "画面コード",
     "q": ["画面コード", "Mã màn hình"], "a": ["AW_VERS_001〜002", "AW_VERS_001〜002"],
     "src": "hong 回答 2026-10-06（運営I2 #9）"},
]
CHANGES = [
    {"ver": "1.1", "date": "2026-10-06", "no": ["1"], "type": "追加", "reason": ["状態を追加：参照のみ・入力エラー・0件", "Thêm trạng thái: chỉ xem, lỗi nhập, 0 dòng"], "impact": ["項目の下にエラー（E01・E266・E267）。実装済", "Hiển thị lỗi dưới ô (E01・E266・E267). Đã triển khai"]},
    {"ver": "1.1", "date": "2026-10-06", "no": ["1.2", "1.5", "1.6", "2"], "type": "変更", "before": ["「キャンセル／登録・保存」を1項目／新規登録のパターンなし", "Gộp 「キャンセル／登録・保存」 thành 1 mục / nút đăng ký mới chưa có pattern"], "after": ["「キャンセル」と「登録・保存」を分ける／新規登録に P-FORM", "Tách 「キャンセル」 và 「登録・保存」 / nút đăng ký mới theo P-FORM"], "reason": ["役割レビュー（BA・QC・UI/UX）の指摘への対応", "Xử lý các góp ý từ review vai trò (BA・QC・UI/UX)"], "impact": ["番号の場所を分けただけ（動きは変更なし）", "Chỉ tách vị trí đánh số (hành vi không đổi)"]},
    {"ver": "1.3", "date": "2026-10-07", "no": ["1.2"], "type": "追加", "reason": ["hong の回答・コメント（2026-10-07）への対応", "Xử lý trả lời・góp ý của hong (2026-10-07)"], "impact": ["ベトナム語の訳の修正のみ。動きは変更なし", "Chỉ sửa bản dịch tiếng Việt. Không đổi hành vi"]}
]
HIDE_ALWAYS = []
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [
    {"code": "AW_VERS_001", "ja": "バージョン一覧", "vi": "Danh sách phiên bản"},
    {"code": "AW_VERS_002", "ja": "バージョンの登録・編集", "vi": "Đăng ký / sửa phiên bản"},
]

H = (
    "const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));"
    "const clickText=(sel,t,i)=>{const b=[...document.querySelectorAll(sel)].filter(x=>(x.textContent||'').includes(t))[i||0];b&&b.click();};"
)

L_ITEMS = [
    {"no": "1", "ja": "ヘッダー", "vi": "Đầu trang", "sel": ".ph", "kind": "area", "trig": "view",
     "detail": ["パンくず：設定管理 ＞ バージョン&強制アップデート。見られるのは運営の全役割（操作ができるのはフル権限・システム管理だけ）。", "Breadcrumb: 設定管理 > バージョン&強制アップデート. Mọi vai trò vận hành xem được (chỉ フル権限・システム管理 thao tác được)."]},
    {"no": "1.1", "ja": "CSV出力", "vi": "Xuất CSV", "sel": ".ph", "kind": "button", "trig": "click", "pattern": "P-CSV-OUT",
     "detail": ["ヘッダーの右。一覧の全件（端末OS・バージョン名・管理用備考・強制アップデート・更新日）。", "Bên phải đầu trang. Toàn bộ danh sách (OS thiết bị, tên phiên bản, ghi chú, cập nhật bắt buộc, ngày cập nhật)."]},
    {"no": "1.2", "ja": "新規登録", "vi": "Đăng ký mới", "sel": ".ph .btn.pri", "kind": "button", "trig": "click", "pattern": "P-FORM",
     "detail": ["バージョンの登録（AW_VERS_002）をモーダルで開く。登録の権限がない役割には出さない。", "Mở modal đăng ký phiên bản (AW_VERS_002). Không hiện với vai trò không có quyền đăng ký."]},
    {"no": "2", "ja": "バージョンの一覧", "vi": "Danh sách phiên bản", "sel": ".tbl", "kind": "table", "trig": "view", "pattern": "P-LIST", "err": ["I01"],
     "detail": ["初期の並びは更新日の新しい順。1ページ 10件。検索条件は置かない（件数が少ない）。0件は I01。", "Thứ tự ban đầu: ngày cập nhật mới nhất trước. 10 dòng/trang. Không có điều kiện tìm kiếm (ít dòng). 0 dòng hiện I01."]},
    {"no": "2.1", "ja": "端末OS", "vi": "OS thiết bị", "sel": ".tbl .os", "kind": "label", "trig": "view",
     "detail": ["IOS または Android（アイコンつき）。", "iOS hoặc Android (có icon)."]},
    {"no": "2.2", "ja": "バージョン名", "vi": "Tên phiên bản", "sel": ".tbl th::バージョン名", "kind": "label", "trig": "view",
     "detail": ["2.1.0 の形。アプリがこのバージョンより古いとき、強制アップデートが ON なら更新するまで使えない。", "Dạng 2.1.0. Khi app cũ hơn phiên bản này mà cập nhật bắt buộc = ON thì phải cập nhật mới dùng được."]},
    {"no": "2.3", "ja": "管理用備考", "vi": "Ghi chú quản lý", "sel": ".tbl th::管理用備考", "kind": "label", "trig": "view",
     "detail": ["運営だけが見るメモ。500文字まで。", "Ghi chú chỉ vận hành xem. Tối đa 500 ký tự."]},
    {"no": "2.4", "ja": "強制アップデート", "vi": "Cập nhật bắt buộc", "sel": ".tbl th::強制アップデート", "kind": "label", "trig": "view",
     "detail": ["ON のとき「✓」、OFF は空欄（表では ✓ か空欄。hong 2026-10-03）。", "ON là \"✓\", OFF là trống (bảng là ✓ hoặc trống; hong 2026-10-03)."]},
    {"no": "2.5", "ja": "更新日", "vi": "Ngày cập nhật", "sel": ".tbl th::更新日", "kind": "label", "trig": "view",
     "detail": ["yyyy-mm-dd HH:MM。登録・編集した日時。", "yyyy-mm-dd HH:MM. Ngày giờ đăng ký/sửa."]},
    {"no": "2.6", "ja": "操作（編集・削除）", "vi": "Thao tác (sửa / xóa)", "sel": ".tbl .act", "kind": "button", "trig": "click", "pattern": "P-DEL", "err": ["Q01", "S02", "E30"],
     "detail": ["鉛筆＝編集（AW_VERS_002 のモーダル）、ごみ箱＝削除（確認 Q01 → S02）。操作の権限がない役割には出さない。", "Bút chì = sửa (modal AW_VERS_002), thùng rác = xóa (xác nhận Q01 → S02). Không hiện với vai trò không có quyền thao tác."]},
    {"no": "3", "ja": "ページ送り", "vi": "Phân trang", "sel": ".pager", "kind": "area", "trig": "view", "pattern": "P-LIST",
     "detail": ["P-LIST のとおり（10／20／50件）。", "Theo P-LIST (10/20/50 dòng)."]},
]

R_ITEMS = [
    {"no": "1", "ja": "登録・編集モーダル", "vi": "Modal đăng ký / sửa", "sel": ".ov .mbox", "kind": "modal", "trig": "click", "pattern": "P-FORM",
     "detail": ["タイトル「バージョンの登録」「バージョンの編集」。保存は「登録」「保存」、閉じるは「キャンセル」。入力を変えてキャンセルしたら Q02。成功したら S01 のトーストを出して閉じ、一覧を更新する。", "Tiêu đề 「バージョンの登録」「バージョンの編集」. Lưu = 「登録」「保存」, đóng = 「キャンセル」. Đã sửa mà hủy thì hiện Q02. Thành công hiện toast S01, đóng modal và cập nhật danh sách."]},
    {"no": "1.1", "ja": "端末OS", "vi": "OS thiết bị", "sel": ".mbox select", "kind": "select", "trig": "select", "req": "○", "len": "選択（iOS／Android）",
     "ex": ["iOS", "Hệ điều hành iOS"], "err": ["E01"], "cond": ["編集のときは変えられない（表示だけ）", "Khi sửa không thể thay đổi (chỉ hiển thị)"],
     "detail": ["初期値は未選択。", "Giá trị ban đầu: chưa chọn."]},
    {"no": "1.2", "ja": "バージョン名", "vi": "Tên phiên bản", "sel": ".mbox input", "kind": "text", "trig": "input", "req": "○", "len": "文字列 14",
     "ex": ["2.1.0", "Tên phiên bản dạng 3 số cách nhau bằng dấu chấm (ví dụ)"], "valid": ["数字3つをドットでつないだ形（例 2.1.0）。同じ端末OS＋バージョン名は登録できない。", "Ba số nối bằng dấu chấm (VD 2.1.0). Không đăng ký trùng cặp OS thiết bị + tên phiên bản."],
     "err": ["E01", "E266", "E267"], "cond": ["編集のときは変えられない（表示だけ）", "Khi sửa thì không đổi được (chỉ hiển thị)."],
     "detail": ["アプリのストアのバージョンと同じ書き方。", "Cách viết giống phiên bản trên cửa hàng ứng dụng."]},
    {"no": "1.3", "ja": "強制アップデート", "vi": "Cập nhật bắt buộc", "sel": ".mbox input[type=checkbox]", "kind": "check", "trig": "check", "req": "－", "init": ["OFF", "Mặc định tắt"],
     "ex": ["ON", "Bật cập nhật bắt buộc"],
     "detail": ["ON にすると、このバージョンより古いアプリは更新するまで使えない。", "Bật ON thì app cũ hơn phiên bản này phải cập nhật mới dùng được."]},
    {"no": "1.4", "ja": "管理用備考", "vi": "Ghi chú quản lý", "sel": ".mbox textarea", "kind": "textarea", "trig": "input", "req": "－", "len": "文字列 500",
     "ex": ["セキュリティ修正のため必須", "Cần thiết vì sửa bảo mật"], "err": ["E04"],
     "detail": ["運営だけが見るメモ。", "Ghi chú chỉ vận hành xem."]},
    {"no": "1.5", "ja": "キャンセル", "vi": "Hủy bỏ", "sel": ".mbox-f button::キャンセル", "kind": "button", "trig": "click", "err": ["Q02"], "detail": ["モーダルを閉じる。入力を変えていたら Q02（キャンセル／破棄）。", "Đóng modal. Đã sửa nội dung thì hiện Q02 (hủy / bỏ thay đổi)."]},
    {"no": "1.6", "ja": "登録・保存", "vi": "Đăng ký・Lưu", "sel": ".mbox-f .btn.pri", "kind": "button", "trig": "click", "err": ["S01", "E30", "E31"], "detail": ["押すとまとめてチェック（項目の下にエラー・赤枠）。エラーがなければ保存して S01。ほかの人が先に保存していたら E31（P-FORM）。", "Nhấn sẽ kiểm tra gộp (lỗi hiện dưới ô, viền đỏ). Không lỗi thì lưu và hiện S01. Người khác lưu trước thì E31 (P-FORM)."]},
]

D_ITEMS = [
    {"no": "1", "ja": "削除の確認", "vi": "Xác nhận xóa", "sel": ".modal", "kind": "modal", "trig": "click", "pattern": "P-DEL", "err": ["Q01", "S02", "E30"],
     "detail": ["押した行のバージョンを削除する確認。「削除する」で削除（論理削除・P-DEL）して S02。削除したバージョンは一覧に出ない。", "Xác nhận xóa phiên bản ở dòng đã nhấn. 「削除する」 thì xóa (xóa logic, P-DEL) và hiện S02. Phiên bản đã xóa không hiện trong danh sách."]},
]


def V(id, code, ja, vi, url, items, setup="", note=None, full=True, wait=500, login=None):
    v = {"id": id, "code": code, "state": [ja, vi], "url": url, "setup": (H + setup) if setup else "", "full": full, "wait": wait, "note": note or ["", ""], "items": items}
    if login:
        v["login"] = login
    return v




# >>> review additions（役割レビューの指摘：0件・参照のみ・入力エラーの状態。2026-10-06）
I_004 = [
    {"no": "1", "ja": "参照のみ（権限が閲覧だけの役割）", "vi": "Chỉ xem (vai trò chỉ có quyền xem)", "sel": ".ph", "kind": "area", "trig": "view", "cond": ["経理（権限付与は閲覧のみ）", "Kế toán (「経理」) (「権限付与」 chỉ được xem)"], "detail": ["経理（権限付与は閲覧のみ）。「新規登録」は出さない（権限表：権限付与は フル権限＝CRUD・ほかの6役割＝R）。", "Kế toán (「経理」) (「権限付与」 chỉ được xem). Không hiển thị 「新規登録」 (bảng quyền: 「権限付与」 do Toàn quyền = CRUD, 6 vai trò còn lại = R)."]},
    {"no": "2", "ja": "一覧の操作の列", "vi": "Cột thao tác của danh sách", "sel": ".tbl", "kind": "table", "trig": "view", "detail": ["行の鉛筆（編集）・ごみ箱（削除）は出さない。", "Không hiển thị biểu tượng bút chì (sửa) và thùng rác (xóa) ở từng dòng."]},
]
I_005 = [
    {"no": "1", "ja": "必須の入力エラー", "vi": "Lỗi nhập bắt buộc", "sel": ".mbox .emsg", "kind": "label", "trig": "view", "pattern": "P-FORM", "err": ["E01", "E266", "E267"], "detail": ["何も入れずに「登録」を押すと、「端末OS」「バージョン名」の下に E01 を出して赤枠にする（保存しない）。形式が違えば E266、同じ版があれば E267。", "Nếu bấm 「登録」 khi chưa nhập gì, hiển thị E01 bên dưới 「端末OS」「バージョン名」 và tô viền đỏ (không lưu). Nếu sai định dạng thì E266, nếu đã có phiên bản trùng thì E267."]},
]
I_006 = [
    {"no": "1", "ja": "0件の表示", "vi": "Hiển thị 0 bản ghi", "sel": ".tbl, .empty", "kind": "area", "trig": "view", "pattern": "P-LIST", "err": ["I01"], "detail": ["登録されているバージョンがないがないとき、一覧の中に I01「表示するデータがありません。」を出す（P-LIST）。", "Khi không có phiên bản nào được đăng ký, hiển thị I01「表示するデータがありません。」trong danh sách (P-LIST)."]},
]
# <<< review additions

VIEWS = [
    V("001", "AW_VERS_001", "初期表示", "Ban đầu", "/ops/settings/version", L_ITEMS),
    V("002", "AW_VERS_002", "登録・編集（モーダル）", "Đăng ký / sửa (modal)", "/ops/settings/version", R_ITEMS,
      setup="clickText('.ph button','新規登録'); await sleep(400);"),
    V("003", "AW_VERS_001", "削除の確認", "Xác nhận xóa", "/ops/settings/version", D_ITEMS,
      setup="document.querySelector('.tbl tbody tr .act button:last-child')?.click(); await sleep(300);"),
    V("004", "AW_VERS_001", "参照のみ（閲覧の権限だけ）", "Chỉ xem (chỉ có quyền xem)", "/ops/settings/version", I_004, login="Ad00012"),
    V("005", "AW_VERS_002", "入力エラー", "Lỗi nhập", "/ops/settings/version", I_005, setup="clickText('.ph button','新規登録'); await sleep(500); clickText('.mbox-f button','登録'); await sleep(400);"),
    V("006", "AW_VERS_001", "0件（すべて削除したあと）", "0 bản ghi (sau khi đã xóa toàn bộ)", "/ops/settings/version", I_006, setup="for(let i=0;i<40;i++){const b=document.querySelector('.tbl tbody tr .act button:last-child'); if(!b) break; b.click(); await sleep(300); const c=[...document.querySelectorAll('.modal button')].find(x=>(x.textContent||'').includes('削除する')); if(c){c.click();} await sleep(500);}"),
]
