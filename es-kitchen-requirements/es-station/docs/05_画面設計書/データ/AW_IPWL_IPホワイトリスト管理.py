# -*- coding: utf-8 -*-
"""
画面設計書のデータ：運営管理者Web ＞ 設定管理 ＞ IPホワイトリスト管理（一覧・登録・削除）
元：本物の Web（app/ops/settings/ip・app/ops/_general/gen.ts の ip・lib/domain/areas/account.ts の addIp/removeIp）、台帳 B（IP ホワイトリスト）・F（2026-10-06）、
    運営Web_権限表（権限付与）、CSV入出力_定義（IP は CSV出力のみ）
番号は画面ごとに通し。タブ・モーダルの状態では、その状態で増える・変わる項目だけ書く。
"""

TITLE = ["IPホワイトリスト管理（AW_IPWL）", "Quản lý IP whitelist (AW_IPWL)"]
SHEET = ["IPホワイトリスト管理", "IP whitelist"]
BASENAME = "画面設計書_AW_IPWL_IPホワイトリスト管理"
IMG_PREFIX = "AW_IPWL"
OUT_DIR = "AW_IPWL_IPホワイトリスト管理"
CODE_NOTE = ["画面コードは規約 <Module(2)>_<Feature(4)>_<Seq(3)>（docs/01_仕様/画面コード規約_20261005.md）。AW＝運営管理者Web、IPWL＝IPホワイトリスト",
             "Mã màn hình theo quy ước <Module(2)>_<Feature(4)>_<Seq(3)>. AW = Admin Web, IPWL = IP whitelist"]
SITE = "ops"
SYSTEM = {"ja": "運営管理者Web", "vi": "Web quản trị vận hành"}
AUTHOR = "Claude（cloud）／確認：hong"
CREATED = "2026-10-06"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "ops", "loginId": "Ad00010"}
CODE_PATHS = ["app/ops/settings/ip", "app/ops/_general", "lib/domain/seed"]

DECISIONS = [
    {"date": "2026-10-06", "target": "IPの登録・編集",
     "q": ["「新規登録」の画面は", "Màn đăng ký mới thế nào"],
     "a": ["モーダル。入力は IPアドレス（CIDR 可）と管理用備考（500文字・複数行）。効かせるサイトは運営Webに固定。編集もできる（2026-10-07 に変更：IPアドレスと管理用備考）", "Modal. Nhập IP (cho phép CIDR) và ghi chú quản lý. Site áp dụng cố định là Web vận hành. Sửa cũng được (đổi 2026-10-07: địa chỉ IP và ghi chú quản lý)"],
     "src": "hong 回答 2026-10-06（運営I2 #1＝A）・台帳 F・受付簿 No.174"},
    {"date": "2026-10-06", "target": "IPホワイトリストの対象",
     "q": ["どのサイトに効かせるか", "Áp dụng cho site nào"],
     "a": ["運営Web の全ユーザー。登録 IP 以外はメールの認証コード（OTP）。ほかのサイトは対象外", "Mọi người dùng Web vận hành. Ngoài IP đã đăng ký thì cần mã xác thực qua email (OTP). Site khác không áp dụng"],
     "src": "台帳 B（2026-10-03）・REQ-UI-014"},
    {"date": "2026-10-06", "target": "権限",
     "q": ["だれが見られる・操作できるか", "Ai xem/thao tác được"],
     "a": ["フル権限・システム管理＝CRUD（IP の登録・削除・CSV出力）、ほかの6役割＝R（閲覧・CSV出力）", "フル権限・システム管理 = CRUD, 6 vai trò khác = R (xem, xuất CSV)"],
     "src": "hong 回答 2026-10-06（権限付与は閲覧を許可）・台帳 F・受付簿 No.173"},
    {"date": "2026-10-06", "target": "画面コード",
     "q": ["画面コード", "Mã màn hình"], "a": ["AW_IPWL_001〜002", "AW_IPWL_001〜002"],
     "src": "hong 回答 2026-10-06（運営I2 #9）"},
    {"date": "2026-10-07", "target": "IPの編集", "q": ["IPホワイトリストは編集できるか", "Whitelist IP có sửa được không"], "a": ["編集できる（IPアドレス・管理用備考）。2026-10-06 の「編集なし」を置き換え", "Sửa được (địa chỉ IP, ghi chú quản lý). Thay thế quyết định 「không sửa」 ngày 2026-10-06"], "src": "hong 回答 2026-10-07・受付簿 No.186"}
]
CHANGES = [
    {"ver": "1.1", "date": "2026-10-06", "no": ["1"], "type": "追加", "reason": ["状態を追加：参照のみ・入力エラー・0件", "Thêm trạng thái: chỉ xem, lỗi nhập, 0 dòng"], "impact": ["項目の下にエラー（E01・E263〜E265）。実装済", "Hiển thị lỗi dưới ô (E01・E263〜E265). Đã triển khai"]},
    {"ver": "1.1", "date": "2026-10-06", "no": ["1.2", "1.4", "1.5", "2"], "type": "変更", "before": ["「キャンセル／登録」を1項目／新規登録のパターンなし", "Gộp 「キャンセル／登録」 thành 1 mục / nút đăng ký mới chưa có pattern"], "after": ["「キャンセル」と「登録」を分ける／新規登録に P-FORM", "Tách 「キャンセル」 và 「登録」 / nút đăng ký mới theo P-FORM"], "reason": ["役割レビュー（BA・QC・UI/UX）の指摘への対応", "Xử lý các góp ý từ review vai trò (BA・QC・UI/UX)"], "impact": ["番号の場所を分けただけ（動きは変更なし）", "Chỉ tách vị trí đánh số (hành vi không đổi)"]},
    {"ver": "1.3", "date": "2026-10-07", "no": ["1", "1.1", "1.2", "1.3", "1.4", "1.5", "2.3"], "type": "追加", "reason": ["hong の回答・コメント（2026-10-07）への対応", "Xử lý trả lời・góp ý của hong (2026-10-07)"], "impact": ["IPアドレス・管理用備考の編集（モーダル）を追加。実装済（受付簿 No.186）", "Thêm sửa địa chỉ IP・ghi chú quản lý (modal). Đã triển khai (受付簿 No.186)"]}
]
HIDE_ALWAYS = []
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [
    {"code": "AW_IPWL_001", "ja": "IPホワイトリスト一覧", "vi": "Danh sách IP whitelist"},
    {"code": "AW_IPWL_002", "ja": "IPアドレスの登録", "vi": "Đăng ký địa chỉ IP"},
]

H = (
    "const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));"
    "const clickText=(sel,t,i)=>{const b=[...document.querySelectorAll(sel)].filter(x=>(x.textContent||'').includes(t))[i||0];b&&b.click();};"
    "const clickBtn=(t)=>[...document.querySelectorAll('button')].find(b=>(b.textContent||'').includes(t))?.click();"
)

L_ITEMS = [
    {"no": "1", "ja": "ヘッダー", "vi": "Đầu trang", "sel": ".ph", "kind": "area", "trig": "view",
     "detail": ["パンくず：設定管理 ＞ IPホワイトリスト管理。見られるのは運営の全役割（フル権限・システム管理は操作もできる。ほかは閲覧のみ）。", "Breadcrumb: 設定管理 > IPホワイトリスト管理. Mọi vai trò vận hành xem được (フル権限・システム管理 thao tác được, vai trò khác chỉ xem)."]},
    {"no": "1.1", "ja": "CSV出力", "vi": "Xuất CSV", "sel": ".ph", "kind": "button", "trig": "click", "pattern": "P-CSV-OUT",
     "detail": ["ヘッダーの右。一覧の全件（備考・IPアドレス・効かせるサイト・登録日時・登録者）。", "Bên phải đầu trang. Toàn bộ dòng của danh sách (ghi chú, địa chỉ IP, site áp dụng, ngày đăng ký, người đăng ký)."]},
    {"no": "1.2", "ja": "新規登録", "vi": "Đăng ký mới", "sel": ".ph .btn.pri", "kind": "button", "trig": "click", "pattern": "P-FORM",
     "detail": ["IPアドレスの登録（AW_IPWL_002）をモーダルで開く。登録の権限（フル権限・システム管理）がない役割には出さない。", "Mở modal đăng ký địa chỉ IP (AW_IPWL_002). Không hiện với vai trò không có quyền đăng ký (フル権限・システム管理)."]},
    {"no": "2", "ja": "IPの一覧", "vi": "Danh sách IP", "sel": ".tbl", "kind": "table", "trig": "view", "pattern": "P-LIST", "err": ["I01"],
     "detail": ["初期の並びは登録順（IDの昇順）。1ページ 10件。検索条件は置かない（件数が少ない）。0件は I01。", "Thứ tự ban đầu: theo thứ tự đăng ký (ID tăng dần). 10 dòng/trang. Không có điều kiện tìm kiếm (ít dòng). 0 dòng hiện I01."]},
    {"no": "2.1", "ja": "管理用備考", "vi": "Ghi chú quản lý", "sel": ".tbl th::管理用備考", "kind": "label", "trig": "view",
     "detail": ["何のための IP か（例：本社オフィス）。500文字まで。", "Ghi chú IP dùng để làm gì (ví dụ: văn phòng chính). Tối đa 500 ký tự."]},
    {"no": "2.2", "ja": "IPアドレス", "vi": "Địa chỉ IP", "sel": ".tbl th::IPアドレス", "kind": "label", "trig": "view",
     "detail": ["IPv4。1つだけ登録したもの（/32）は「/32」を省いて表示。範囲（CIDR）はそのまま（203.0.113.0/24）。", "IPv4. IP đăng ký đơn lẻ (/32) hiển thị bỏ 「/32」. Dải (CIDR) giữ nguyên (203.0.113.0/24)."]},
    {"no": "2.3", "ja": "操作（編集・削除）", "vi": "Thao tác (sửa, xóa)", "sel": ".tbl .act", "kind": "button", "trig": "click", "pattern": "P-DEL", "err": ["Q01", "S02", "E30"],
     "detail": ["鉛筆＝編集（AW_IPWL_002 のモーダル。IPアドレス・管理用備考を直せる：hong 2026-10-07）、ごみ箱＝削除の確認（Q01）。登録の権限がない役割には出さない。", "Bút chì = sửa (modal AW_IPWL_002; sửa được địa chỉ IP và ghi chú quản lý: hong 2026-10-07), thùng rác = xác nhận xóa (Q01). Không hiện với vai trò không có quyền đăng ký."]},
    {"no": "3", "ja": "ページ送り", "vi": "Phân trang", "sel": ".pager", "kind": "area", "trig": "view", "pattern": "P-LIST",
     "detail": ["P-LIST のとおり（10／20／50件）。", "Theo P-LIST (10/20/50 dòng)."]},
]

R_ITEMS = [
    {"no": "1", "ja": "登録モーダル", "vi": "Modal đăng ký", "sel": ".ov .mbox", "kind": "modal", "trig": "click", "pattern": "P-FORM",
     "detail": ["タイトル「IPアドレスの登録」「IPアドレスの編集」。保存は「登録」（編集は「保存」）、閉じるは「キャンセル」。入力を変えてキャンセルしたら Q02。成功したら S01 のトーストを出して閉じ、一覧に足す（編集は一覧の行を書き換える）。編集で同じ内容にしても保存できる。", "Tiêu đề 「IPアドレスの登録」「IPアドレスの編集」. Lưu = 「登録」 (sửa là 「保存」), đóng = 「キャンセル」. Đã sửa mà hủy thì hiện Q02. Thành công hiện toast S01, đóng modal và thêm vào danh sách (sửa thì ghi đè dòng trong danh sách). Sửa mà giữ nguyên nội dung vẫn lưu được."]},
    {"no": "1.1", "ja": "IPアドレス", "vi": "Địa chỉ IP", "sel": ".mbox input", "kind": "text", "trig": "input", "req": "○", "len": "文字列 18",
     "ex": ["203.0.113.0/24", "Dải IP dạng CIDR (ví dụ)"],
     "valid": ["IPv4（例 203.0.113.5）か範囲（CIDR・例 203.0.113.0/24）。各数字は 0〜255、マスクは 0〜32。マスクを省いたら /32 として登録する。127.x・0.x・169.254.x は登録できない。同じアドレスは登録できない。", "IPv4 (VD 203.0.113.5) hoặc dải CIDR (VD 203.0.113.0/24). Mỗi số 0〜255, mask 0〜32. Bỏ mask thì đăng ký là /32. Không đăng ký được 127.x, 0.x, 169.254.x. Không đăng ký trùng."],
     "err": ["E01", "E263", "E264", "E265"],
     "detail": ["運営Web のログインを許す IP。範囲で入れるときは CIDR で書く。", "IP được phép đăng nhập Web vận hành. Nhập dải dùng CIDR."]},
    {"no": "1.2", "ja": "管理用備考", "vi": "Ghi chú quản lý", "sel": ".mbox textarea", "kind": "textarea", "trig": "input", "req": "－", "len": "文字列 500",
     "ex": ["本社オフィス（東京）", "Ghi chú ví dụ: văn phòng chính (Tokyo)"], "err": ["E04"],
     "detail": ["何のための IP かを後で分かるようにするメモ。", "Ghi chú để sau này biết IP này dùng để làm gì."]},
    {"no": "1.3", "ja": "効かせるサイト", "vi": "Site áp dụng", "sel": "-", "kind": "label", "trig": "view",
     "detail": ["運営Web に固定（表示だけ）。ほかのサイトは対象外（台帳 B）。", "Cố định là Web vận hành (chỉ hiển thị). Site khác không áp dụng (台帳 B)."]},
    {"no": "1.4", "ja": "キャンセル", "vi": "Hủy bỏ", "sel": ".mbox-f button::キャンセル", "kind": "button", "trig": "click", "err": ["Q02"], "detail": ["モーダルを閉じる。入力を変えていたら Q02（キャンセル／破棄）。", "Đóng modal. Đã sửa nội dung thì hiện Q02 (hủy / bỏ thay đổi)."]},
    {"no": "1.5", "ja": "登録", "vi": "Đăng ký", "sel": ".mbox-f .btn.pri", "kind": "button", "trig": "click", "err": ["S01", "E30"], "detail": ["押すとまとめてチェック（項目の下にエラー・赤枠）。エラーがなければ登録して S01。ボタンは押したら無効にする（P-FORM）。", "Nhấn sẽ kiểm tra gộp (lỗi hiện dưới ô, viền đỏ). Không lỗi thì đăng ký và hiện S01. Khóa nút sau khi nhấn (P-FORM)."]},
]

D_ITEMS = [
    {"no": "1", "ja": "削除の確認", "vi": "Xác nhận xóa", "sel": ".modal", "kind": "modal", "trig": "click", "pattern": "P-DEL", "err": ["Q01", "S02", "E30"],
     "detail": ["押した行の IP を削除する確認。「削除する」で削除（論理削除・P-DEL。登録 IP から外れる）して S02。外した IP からは運営Web に入るときにメールの認証コード（OTP）が要る。", "Xác nhận xóa IP ở dòng đã nhấn. 「削除する」 sẽ xóa (xóa logic, P-DEL; IP bị loại khỏi danh sách đăng ký) và hiện S02. Với IP đã loại, khi vào Web vận hành cần mã xác thực qua email (OTP)."]},
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
    {"no": "1", "ja": "必須の入力エラー", "vi": "Lỗi nhập bắt buộc", "sel": ".mbox .emsg", "kind": "label", "trig": "view", "pattern": "P-FORM", "err": ["E01", "E263", "E264", "E265"], "detail": ["何も入れずに「登録」を押すと、「IPアドレス」の下に E01 を出して赤枠にする（保存しない）。形式が違えば E263、使えないアドレスは E264、同じアドレスは E265。", "Nếu bấm 「登録」 khi chưa nhập gì, hiển thị E01 bên dưới 「IPアドレス」 và tô viền đỏ (không lưu). Nếu sai định dạng thì E263, địa chỉ không được phép dùng thì E264, địa chỉ trùng thì E265."]},
]
I_006 = [
    {"no": "1", "ja": "0件の表示", "vi": "Hiển thị 0 bản ghi", "sel": ".tbl, .empty", "kind": "area", "trig": "view", "pattern": "P-LIST", "err": ["I01"], "detail": ["登録されている IP がないがないとき、一覧の中に I01「表示するデータがありません。」を出す（P-LIST）。", "Khi không có IP nào được đăng ký, hiển thị I01「表示するデータがありません。」trong danh sách (P-LIST)."]},
]
# <<< review additions

VIEWS = [
    V("001", "AW_IPWL_001", "初期表示", "Ban đầu", "/ops/settings/ip", L_ITEMS),
    V("002", "AW_IPWL_002", "登録（モーダル）", "Đăng ký (modal)", "/ops/settings/ip", R_ITEMS,
      setup="clickBtn('新規登録'); await sleep(400);"),
    V("003", "AW_IPWL_001", "削除の確認", "Xác nhận xóa", "/ops/settings/ip", D_ITEMS,
      setup="document.querySelector('.tbl tbody tr .act button:last-child')?.click(); await sleep(300);"),
    V("004", "AW_IPWL_001", "参照のみ（閲覧の権限だけ）", "Chỉ xem (chỉ có quyền xem)", "/ops/settings/ip", I_004, login="Ad00012"),
    V("005", "AW_IPWL_002", "入力エラー", "Lỗi nhập", "/ops/settings/ip", I_005, setup="clickText('.ph button','新規登録'); await sleep(500); clickText('.mbox-f button','登録'); await sleep(400);"),
    V("006", "AW_IPWL_001", "0件（すべて削除したあと）", "0 bản ghi (sau khi đã xóa toàn bộ)", "/ops/settings/ip", I_006, setup="for(let i=0;i<40;i++){const b=document.querySelector('.tbl tbody tr .act button:last-child'); if(!b) break; b.click(); await sleep(300); const c=[...document.querySelectorAll('.modal button')].find(x=>(x.textContent||'').includes('削除する')); if(c){c.click();} await sleep(500);}"),
    V("007", "AW_IPWL_002", "編集（モーダル）", "Sửa (modal)", "/ops/settings/ip", R_ITEMS, setup="document.querySelector('.tbl tbody tr .act button')?.click(); await sleep(400);",
      note=["行の鉛筆から開く。タイトルは「IPアドレスの編集」。入っている値を直せる。", "Mở từ biểu tượng bút chì của dòng. Tiêu đề là 「IPアドレスの編集」. Có thể sửa giá trị đang có."]),
]
