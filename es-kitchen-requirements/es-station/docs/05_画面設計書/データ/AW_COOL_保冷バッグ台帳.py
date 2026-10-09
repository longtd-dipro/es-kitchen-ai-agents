# -*- coding: utf-8 -*-
"""
画面設計書のデータ：運営管理者Web ＞ マスタ管理 ＞ 保冷バッグ台帳（一覧・登録・編集）
元：本物の Web（app/ops/masters/coolers・app/ops/_general/gen.ts の cooler）、台帳 E（運営の権限）・運営Web_権限表・CSV入出力_定義（保冷バッグ台帳は CSV出力のみ）
番号は画面ごとに通し。タブ・モーダルの状態では、その状態で増える・変わる項目だけ書く。
（運営H2：hong の確認前の提案を含む。提案は DECISIONS で「提案」と書き、open に確認先を残してある）
"""

TITLE = ["保冷バッグ台帳（AW_COOL）", "Sổ cái túi giữ lạnh (AW_COOL)"]
SHEET = ["保冷バッグ台帳", "Sổ cái túi giữ lạnh"]
BASENAME = "画面設計書_AW_COOL_保冷バッグ台帳"
IMG_PREFIX = "AW_COOL"
OUT_DIR = "AW_COOL_保冷バッグ台帳"
CODE_NOTE = ["画面コードは規約 <Module(2)>_<Feature(4)>_<Seq(3)>（docs/01_仕様/画面コード規約_20261005.md）。AW＝運営管理者Web、COOL＝保冷バッグ台帳",
             "Mã màn hình theo quy ước <Module(2)>_<Feature(4)>_<Seq(3)>. AW = Admin Web, COOL = Sổ cái túi giữ lạnh"]
SITE = "ops"
SYSTEM = {"ja": "運営管理者Web", "vi": "Web quản trị vận hành"}
AUTHOR = "Claude（cloud）／確認：hong"
CREATED = "2026-10-06"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "ops", "loginId": "Ad00010"}
CODE_PATHS = "[\"app/ops/masters/coolers\", \"app/ops/_general\", \"lib/ops/general/fromDomain.ts\"]"

DECISIONS = [
    {"date": "2026-10-06", "target": "保冷バッグ台帳の登録・編集", "q": ["記録の登録・編集のしかた", "Cách đăng ký / sửa bản ghi"], "a": ["一覧の「新規登録」で開くモーダルで1件ずつ登録し、鉛筆で編集する（CSV取込は置かない）。項目：種類・数・委託配送先・渡した配送スタッフ・渡した日・状態・メモ。削除はない（使えなくなったものは状態を「廃棄」に）。登録＝フル権限・システム管理、編集＝フル権限・システム管理・経理", "Đăng ký từng dòng bằng modal mở từ 「新規登録」 ở danh sách, sửa bằng bút chì (không có CSV取込). Mục: loại, số lượng, 委託配送先, nhân viên nhận, ngày cho mượn, trạng thái, ghi chú. Không có xóa (đồ không dùng được thì đổi trạng thái 「廃棄」). Đăng ký = フル権限・システム管理; sửa = フル権限・システム管理・経理"], "src": "hong 回答 2026-10-06（運営H2 #1＝提案どおり）・受付簿 No.165"},
    {"date": "2026-10-06", "target": "権限", "q": ["だれが見られる・操作できるか", "Ai được xem và thao tác"], "a": ["フル権限＝CRUD、経理＝R/U（閲覧・編集・CSV出力）、ほか＝R（閲覧・CSV出力）。システム管理は CRUD", "Toàn quyền = CRUD, kế toán = R/U (xem・chỉnh sửa・xuất CSV), các vai trò khác = R (xem・xuất CSV). Quản trị hệ thống là CRUD"], "src": "運営Web_権限表（冷蔵庫・冷凍庫レンタル契約管理）・台帳 E"},
    {"date": "2026-10-06", "target": "画面コード", "q": ["画面コード", "Mã màn hình"], "a": ["AW_COOL_001〜003", "AW_COOL_001〜003"], "src": "画面コード規約（Feature は Claude 案・hong 確認待ち）"},
]
CHANGES = [{"ver": "1.11", "date": "2026-10-06", "no": "*", "type": "追加", "reason": ["保冷バッグ台帳の画面設計書を新規に作成（hong の確認済み・受付簿 No.164〜168）", "Tạo mới tài liệu thiết kế màn hình Sổ cái túi giữ lạnh (đã được hong xác nhận, 受付簿 No.164〜168)"], "impact": ["一覧・登録／編集のモーダル（削除・CSV取込なし）。実装済（受付簿 No.165）", "Danh sách, modal đăng ký/sửa (không có xóa, không có nhập CSV). Đã triển khai (受付簿 No.165)"]}, {"ver": "1.12", "date": "2026-10-06", "no": ["1", "2"], "type": "追加", "reason": ["役割レビュー（BA・QC・UI/UX）の指摘への対応", "Xử lý các góp ý từ review vai trò (BA・QC・UI/UX)"], "impact": ["表示の確認のための状態。動きは変更なし", "Trạng thái để kiểm tra hiển thị. Hành vi không đổi"]}, {"ver": "1.12", "date": "2026-10-06", "no": ["1.2", "1.3", "1.8", "1.9", "3.10"], "type": "変更", "reason": ["役割レビュー（BA・QC・UI/UX）の指摘への対応", "Xử lý các góp ý từ review vai trò (BA・QC・UI/UX)"], "impact": ["動きは変更なし（番号の場所と説明の追記）", "Hành vi không đổi (chỉ tách vị trí đánh số và bổ sung mô tả)"], "before": ["「キャンセル／登録・保存」を1項目", "Gộp 「キャンセル／登録・保存」 thành 1 mục"], "after": ["「キャンセル」と「登録・保存」を分ける／新規登録に P-FORM", "Tách 「キャンセル」 và 「登録・保存」 / nút đăng ký mới theo P-FORM"]}]
HIDE_ALWAYS = []
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [
    {"code": "AW_COOL_001", "ja": "保冷バッグ台帳一覧", "vi": "Danh sách sổ cái túi giữ lạnh"},
    {"code": "AW_COOL_002", "ja": "貸与の記録の登録・編集", "vi": "Đăng ký / sửa bản ghi cho mượn"},
    {"code": "AW_COOL_003", "ja": "貸与の記録の詳細", "vi": "Chi tiết bản ghi cho mượn"},
]

H = (
    "const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));"
    "const tab=(t)=>[...document.querySelectorAll('.tabs button')].find(b=>(b.textContent||'').trim()===t)?.click();"
    "const clickText=(sel,t,i)=>{const b=[...document.querySelectorAll(sel)].filter(x=>(x.textContent||'').includes(t))[i||0];b&&b.click();};"
)



def V(id, code, ja, vi, url, items, setup="", note=None, full=True, wait=600, login=None):
    v = {"id": id, "code": code, "state": [ja, vi], "url": url, "setup": (H + setup) if setup else "", "full": full, "wait": wait, "note": note or ["", ""], "items": items}
    if login:
        v["login"] = login
    return v


I1 = [
    {"no": "1", "ja": "ヘッダー", "vi": "Header", "sel": ".ph", "kind": "area", "trig": "view", "detail": ["パンくず：マスタ管理 ＞ 保冷バッグ台帳。見られるのは運営の全役割（フル権限・システム管理は登録・編集もできる。経理は編集だけ・ほかは閲覧のみ：権限表「冷蔵庫・冷凍庫レンタル契約管理」）。", "Breadcrumb: マスタ管理 > 保冷バッグ台帳. Mọi vai trò vận hành xem được (フル権限・システム管理 đăng ký/sửa được, 経理 chỉ sửa, vai trò khác chỉ xem: bảng quyền 「冷蔵庫・冷凍庫レンタル契約管理」)."]},
    {"no": "1.1", "ja": "CSV出力", "vi": "Xuất CSV", "sel": ".ph", "kind": "button", "trig": "click", "pattern": "P-CSV-OUT", "detail": ["ヘッダーの右。保冷バッグ・保冷剤の貸与の記録（画面の列＋共通データの全項目）（検索条件のとおりの全件）。見られる役割には全員に出す。", "Bên phải header. Bản ghi cho mượn túi giữ lạnh và gel giữ lạnh (các cột trên màn hình + toàn bộ mục dữ liệu chung) (toàn bộ số bản ghi theo điều kiện tìm kiếm). Hiển thị cho tất cả các vai trò được phép xem."]},
    {"no": "1.2", "ja": "CSV取込（置かない）", "vi": "Nhập CSV (không đặt)", "sel": "-", "kind": "label", "trig": "view", "detail": ["CSV取込は置かない（CSV入出力_定義：保冷バッグ台帳は CSV出力のみ）。記録は画面のモーダルで1件ずつ登録・編集する。", "Không có CSV取込 (CSV入出力_定義: 保冷バッグ台帳 chỉ xuất CSV). Bản ghi được đăng ký/sửa từng dòng bằng modal trên màn hình."]},
    {"no": "1.3", "ja": "新規登録", "vi": "Đăng ký mới", "sel": ".ph .btn.pri", "kind": "button", "trig": "click", "pattern": "P-FORM", "detail": ["貸与の記録の登録（AW_COOL_002）をモーダルで開く。登録の権限（フル権限・システム管理）がない役割には出さない。", "Mở modal đăng ký bản ghi cho mượn (AW_COOL_002). Không hiện với vai trò không có quyền đăng ký (フル権限・システム管理)."]},
    {"no": "2", "ja": "検索条件", "vi": "Điều kiện tìm kiếm", "sel": ".card", "kind": "area", "trig": "view", "pattern": "P-LIST", "detail": ["キーワード（番号・委託配送先名・配送スタッフ）／都道府県／委託配送先／種類（保冷バッグ・保冷剤）／状態（貸与中・紛失・廃棄）／渡した日（期間）。", "Từ khóa (số / tên đơn vị vận chuyển ủy thác / nhân viên giao hàng) / tỉnh thành / đơn vị vận chuyển ủy thác / loại (túi giữ lạnh・gel giữ lạnh) / trạng thái (đang cho mượn・thất lạc・đã hủy) / ngày giao (khoảng thời gian)."]},
    {"no": "3", "ja": "一覧", "vi": "Danh sách", "sel": ".tbl", "kind": "table", "trig": "view", "pattern": "P-LIST", "err": ["I01"], "detail": ["初期の並びは番号の昇順（台帳の貸与記録）。1ページ 10件。0件は I01。", "Thứ tự ban đầu là số tăng dần (bản ghi cho mượn trong sổ). 10 dòng mỗi trang. Khi 0 kết quả hiển thị I01."]},
    {"no": "3.1", "ja": "番号", "vi": "Số", "sel": ".tbl .lnk", "kind": "link", "trig": "click", "detail": ["保冷バッグ・保冷剤の貸与の通し番号（システムが採番）。下線つきのリンク。押すと詳細（AW_COOL_003）へ（hong 2026-10-07）。", "Số thứ tự của việc cho mượn túi giữ lạnh・chất giữ lạnh (hệ thống tự cấp số). Là link có gạch chân. Bấm sẽ chuyển tới chi tiết (AW_COOL_003) (hong 2026-10-07)."]},
    {"no": "3.2", "ja": "種類", "vi": "Loại", "sel": ".tbl th::種類", "kind": "label", "trig": "view", "detail": ["「保冷バッグ」または「保冷剤」。", "「保冷バッグ」 (túi giữ lạnh) hoặc 「保冷剤」 (gel giữ lạnh)."]},
    {"no": "3.3", "ja": "数", "vi": "Số lượng", "sel": ".tbl th::数", "kind": "label", "trig": "view", "detail": ["貸した数。右寄せ。", "Số lượng đã cho mượn. Căn phải."]},
    {"no": "3.4", "ja": "委託配送先", "vi": "Đơn vị vận chuyển ủy thác", "sel": ".tbl th::委託配送先", "kind": "label", "trig": "view", "detail": ["貸している委託配送会社の名前（リンクにしない：委託配送先の詳細は置かない）。", "Tên công ty vận chuyển ủy thác đang mượn (không làm link: không có màn chi tiết 委託配送先)."]},
    {"no": "3.5", "ja": "都道府県", "vi": "Tỉnh thành", "sel": ".tbl th::都道府県", "kind": "label", "trig": "view", "detail": ["委託配送先の都道府県。", "Tỉnh thành của đơn vị vận chuyển ủy thác."]},
    {"no": "3.6", "ja": "渡した配送スタッフ", "vi": "Nhân viên giao hàng đã nhận", "sel": ".tbl th::渡した配送スタッフ", "kind": "label", "trig": "view", "detail": ["貸した相手の配送スタッフ名。", "Tên nhân viên giao hàng là người được cho mượn."]},
    {"no": "3.7", "ja": "渡した日", "vi": "Ngày giao", "sel": ".tbl th::渡した日", "kind": "label", "trig": "view", "detail": ["yyyy-mm-dd。", "yyyy-mm-dd."]},
    {"no": "3.8", "ja": "返却日", "vi": "Ngày trả", "sel": ".tbl th::返却日", "kind": "label", "trig": "view", "detail": ["返したことを記録した日（yyyy-mm-dd）。空は「—」。", "Ngày ghi nhận đã trả (yyyy-mm-dd). Để trống hiển thị 「—」."]},
    {"no": "3.8b", "ja": "返却数", "vi": "Số lượng trả", "sel": ".tbl th::返却数", "kind": "label", "trig": "view", "detail": ["返ってきた個数。右寄せ。空は「—」。", "Số lượng đã được trả lại. Căn phải. Để trống hiển thị 「—」."]},
    {"no": "3.8c", "ja": "状態", "vi": "Trạng thái", "sel": ".tbl th::状態", "kind": "label", "trig": "view", "detail": ["バッジ：貸与中・紛失・廃棄。", "Badge: đang cho mượn・thất lạc・đã hủy."]},
    {"no": "3.9", "ja": "メモ", "vi": "Ghi chú", "sel": ".tbl th::メモ", "kind": "label", "trig": "view", "detail": ["長いと一行で切って表示。500文字まで。", "Nếu dài thì cắt trong một dòng khi hiển thị. Tối đa 500 ký tự."]},
    {"no": "3.10", "ja": "操作（編集）", "vi": "Thao tác (sửa)", "sel": ".tbl .act", "kind": "button", "trig": "click", "cond": ["編集の権限がある役割（フル権限・システム管理・経理）", "Vai trò có quyền sửa (Toàn quyền, Quản trị hệ thống, Kế toán (「経理」))"], "detail": ["鉛筆＝編集（AW_COOL_002 のモーダル）。編集の権限がある役割（フル権限・システム管理・経理）だけに出す。削除はない（返さない・使えなくなったものは状態を「廃棄」にする）。", "Bút chì = sửa (modal AW_COOL_002). Chỉ hiện với vai trò có quyền sửa (フル権限・システム管理・経理). Không có xóa (đồ không dùng được nữa thì đổi trạng thái thành 「廃棄」)."]},
    {"no": "4", "ja": "ページ送り", "vi": "Phân trang", "sel": ".pager", "kind": "area", "trig": "view", "pattern": "P-LIST", "detail": ["P-LIST のとおり（10／20／50件）。", "Theo P-LIST (10／20／50 dòng)."]},
]

I2 = [
    {"no": "1", "ja": "登録・編集モーダル", "vi": "Modal đăng ký / sửa", "sel": ".ov .mbox", "kind": "modal", "trig": "click", "pattern": "P-FORM", "err": ["Q02", "S01", "E30", "E31"], "detail": ["タイトル「貸与の記録の登録」「貸与の記録の編集」。「キャンセル」「登録」（編集は「保存」）。入力を変えてキャンセルしたら Q02。成功したら S01 のトーストを出して閉じ、一覧を更新する。誰が・いつ貸したか記録するために、運営が貸し出し・回収のたびに入力する。", "Tiêu đề 「貸与の記録の登録」「貸与の記録の編集」. Nút 「キャンセル」「登録」 (sửa là 「保存」). Đã sửa mà hủy thì hiện Q02. Thành công hiện toast S01, đóng modal và cập nhật danh sách. Bộ phận vận hành nhập mỗi lần cho mượn/thu hồi để ghi lại ai mượn, khi nào."]},
    {"no": "1.1", "ja": "種類", "vi": "Loại", "sel": ".mbox .fld::種類", "kind": "select", "trig": "select", "req": "○", "len": ["選択（保冷バッグ／保冷剤）", "Chọn (túi giữ lạnh / bình giữ lạnh)"], "ex": ["保冷バッグ", "Loại đồ cho mượn (túi giữ lạnh)"], "err": ["E01"], "detail": ["貸したものの種類。初期値は未選択。", "Loại đồ đã cho mượn. Giá trị ban đầu: chưa chọn."]},
    {"no": "1.2", "ja": "数", "vi": "Số lượng", "sel": ".mbox .fld::数", "kind": "text", "trig": "input", "req": "○", "len": "数値 4桁（1〜9999）", "ex": ["10", "Số lượng cho mượn (số nguyên)"], "err": ["E01"], "valid": ["1〜9999 の整数。全角は半角に直す。", "Số nguyên từ 1 đến 9999. Chữ số toàn góc được đổi sang nửa góc."], "detail": ["貸した個数。", "Số lượng đã cho mượn."]},
    {"no": "1.3", "ja": "委託配送先", "vi": "Đơn vị vận chuyển ủy thác", "sel": ".mbox .fld::委託配送先", "kind": "select", "trig": "select", "req": "○", "len": ["選択（委託配送先マスタ）", "Chọn (master đơn vị vận chuyển ủy thác)"], "ex": ["（委託配送先のうち1社）", "Một công ty trong master 委託配送先"], "err": ["E01"], "detail": ["貸している委託配送会社。無効の委託配送先は選べない。", "Công ty vận chuyển ủy thác đang mượn. Không chọn được đơn vị đã 無効."]},
    {"no": "1.4", "ja": "渡した配送スタッフ", "vi": "Nhân viên giao hàng đã nhận", "sel": ".mbox .fld::渡した配送スタッフ", "kind": "select", "trig": "select", "req": "－", "len": ["選択（選んだ委託配送先の配送スタッフ）", "Chọn (nhân viên của đơn vị vận chuyển đã chọn)"], "ex": ["（配送スタッフのうち1人）", "Một nhân viên của công ty đã chọn"], "detail": ["実際に受け取った配送スタッフ。委託配送先を選ぶと、その会社のスタッフだけが選べる。分からなければ空欄。", "Nhân viên giao hàng thực tế nhận. Khi chọn 委託配送先 thì chỉ chọn được nhân viên của công ty đó. Không biết thì để trống."]},
    {"no": "1.5", "ja": "渡した日", "vi": "Ngày giao", "sel": ".mbox .fld::渡した日", "kind": "date", "trig": "input", "req": "○", "len": "日付", "ex": ["2026-10-06", "Ngày cho mượn (yyyy-mm-dd)"], "err": ["E01"], "init": ["今日", "Hôm nay"], "detail": ["貸した日（yyyy-mm-dd）。未来の日は選べない。", "Ngày cho mượn (yyyy-mm-dd). Không chọn được ngày trong tương lai."]},
    {"no": "1.5b", "ja": "返却日", "vi": "Ngày trả", "sel": ".mbox .fld::返却日", "kind": "date", "trig": "input", "req": "－", "len": "日付", "ex": ["2026-11-30", "2026-11-30"], "err": ["E04"], "valid": ["渡した日より前は入れられない（エラー：返却日は渡した日以降にしてください）。", "Không được nhập ngày trước ngày giao (lỗi: 「返却日は渡した日以降にしてください」)."], "detail": ["返ってきた日（yyyy-mm-dd）。返っていなければ空欄。", "Ngày được trả lại (yyyy-mm-dd). Nếu chưa trả thì để trống."]},
    {"no": "1.5c", "ja": "返却数", "vi": "Số lượng trả", "sel": ".mbox .fld::返却数", "kind": "text", "trig": "input", "req": "－", "len": "数値 4桁", "ex": ["8", "8"], "err": ["E04"], "valid": ["0 から「数」までの整数。数より多いときはエラー（返却数は貸与数以下で入れてください）。", "Số nguyên từ 0 đến 「数」 (số lượng cho mượn). Nếu lớn hơn số lượng thì báo lỗi (「返却数は貸与数以下で入れてください」)."], "detail": ["返ってきた個数。返っていなければ空欄。", "Số lượng được trả lại. Nếu chưa trả thì để trống."]},
    {"no": "1.6", "ja": "状態", "vi": "Trạng thái", "sel": ".mbox .fld::状態", "kind": "select", "trig": "select", "req": "○", "len": ["選択（貸与中／紛失／廃棄）", "Chọn (đang cho mượn / thất lạc / thanh lý)"], "ex": ["貸与中", "Trạng thái (đang cho mượn)"], "init": ["貸与中", "Đang cho mượn"], "detail": ["新規登録のときは「貸与中」。紛失・廃棄にするのは編集で。", "Khi đăng ký mới là 「貸与中」. Chuyển sang thất lạc/thanh lý bằng cách sửa."]},
    {"no": "1.7", "ja": "メモ", "vi": "Ghi chú", "sel": ".mbox .fld::メモ", "kind": "textarea", "trig": "input", "req": "－", "len": "文字列 500", "ex": ["返却予定：11月末", "Ghi chú về việc cho mượn (dự kiến trả cuối tháng 11)"], "err": ["E04"], "detail": ["貸与の補足。複数行。", "Ghi chú bổ sung về việc cho mượn. Nhiều dòng."]},
    {"no": "1.8", "ja": "キャンセル", "vi": "Hủy bỏ", "sel": ".mbox-f button::キャンセル", "kind": "button", "trig": "click", "err": ["Q02"], "detail": ["モーダルを閉じる。入力を変えていたら Q02（キャンセル／破棄）。", "Đóng modal. Nếu đã thay đổi nội dung nhập thì hiển thị Q02 (Hủy / Bỏ thay đổi)."]},
    {"no": "1.9", "ja": "登録・保存", "vi": "Đăng ký・Lưu", "sel": ".mbox-f .btn.pri", "kind": "button", "trig": "click", "err": ["S01", "E30", "E31"], "detail": ["押すとまとめてチェック（項目の下にエラー・赤枠）。エラーがなければ保存して S01。ほかの人が先に保存していたら E31（P-FORM）。", "Khi bấm sẽ kiểm tra toàn bộ cùng lúc (lỗi hiển thị bên dưới từng mục, viền đỏ). Nếu không có lỗi thì lưu và hiển thị S01. Nếu người khác đã lưu trước thì hiển thị E31 (P-FORM)."]},
]

I3 = [
    {"no": "1", "ja": "0件の表示", "vi": "Hiển thị 0 bản ghi", "sel": ".tbl, .empty", "kind": "area", "trig": "view", "pattern": "P-LIST", "err": ["I01"], "detail": ["検索条件に合う保冷バッグの記録がないとき、一覧の中に I01「表示するデータがありません。」を出す（P-LIST）。ページ送りは出さない。条件は「クリア」で戻せる。", "Khi không có bản ghi túi giữ lạnh nào khớp điều kiện tìm kiếm, hiển thị I01「表示するデータがありません。」trong danh sách (P-LIST). Không hiển thị phân trang. Có thể khôi phục điều kiện bằng 「クリア」."]},
]

I4 = [
    {"no": "1", "ja": "参照のみ（権限が閲覧だけの役割）", "vi": "Chỉ xem (vai trò chỉ có quyền xem)", "sel": ".ph", "kind": "area", "trig": "view", "cond": ["物流（保冷バッグ台帳は閲覧のみ）", "Logistics 「物流」 (sổ cái túi giữ lạnh chỉ được xem)"], "detail": ["物流（保冷バッグ台帳は閲覧のみ）。「新規登録」「CSV取込」「アカウント一括発行」は出さない。CSV出力は出す（P-LIST・権限表）。", "Logistics 「物流」 (sổ cái túi giữ lạnh chỉ được xem). Không hiển thị 「新規登録」「CSV取込」「アカウント一括発行」. Vẫn hiển thị xuất CSV (P-LIST・bảng quyền)."]},
    {"no": "2", "ja": "一覧の操作の列", "vi": "Cột thao tác của danh sách", "sel": ".tbl", "kind": "table", "trig": "view", "detail": ["行の鉛筆（編集）・ごみ箱（削除）・「契約の一括変更」は出さない。名前のリンクで詳細は開ける（詳細も「編集」「削除」を出さない）。", "Không hiển thị biểu tượng bút chì (sửa), thùng rác (xóa) ở từng dòng và 「契約の一括変更」. Vẫn mở được chi tiết bằng liên kết tên (trong chi tiết cũng không hiển thị 「編集」「削除」)."]},
]

I5 = [
    {"no": "1", "ja": "必須の入力エラー", "vi": "Lỗi nhập bắt buộc", "sel": ".mbox .emsg", "kind": "label", "trig": "view", "pattern": "P-FORM", "err": ["E01", "E12", "E14"], "detail": ["何も入れずに「登録」を押すと、必須の項目（種類・数・委託配送先・渡した日）の下に E01 を出して赤枠にする（保存しない）。数が範囲外なら E12、数値でなければ E14。", "Nếu bấm 「登録」 khi chưa nhập gì, hiển thị E01 bên dưới các mục bắt buộc (loại, số lượng, nơi giao hàng ủy thác, ngày giao) và tô viền đỏ (không lưu). Nếu số lượng nằm ngoài phạm vi thì E12, nếu không phải số thì E14."]},
]

I6 = [
    {"no": "1", "ja": "ヘッダー", "vi": "Header", "sel": "-", "kind": "area", "trig": "view", "detail": ["パンくず：マスタ管理 ＞ 保冷バッグ台帳 ＞ 貸与の記録の詳細。タイトル「貸与の記録の詳細 番号」。右に「編集」（編集の権限がある役割だけ。押すと貸与の記録の編集のモーダル）。削除はない。", "Breadcrumb: Quản lý master > Sổ cái túi giữ lạnh > Chi tiết bản ghi cho mượn. Tiêu đề 「貸与の記録の詳細 番号」. Bên phải có nút 「編集」 (chỉ vai trò có quyền chỉnh sửa; bấm mở modal chỉnh sửa bản ghi cho mượn). Không có chức năng xóa."]},
    {"no": "2", "ja": "タブ", "vi": "Tab", "sel": "-", "kind": "tab", "trig": "click", "pattern": "P-TAB", "detail": ["タブ：基本情報・変更履歴。初期は「基本情報」。", "Tab: Thông tin cơ bản・Lịch sử thay đổi. Mặc định là 「基本情報」."]},
    {"no": "3", "ja": "基本情報（表示）", "vi": "Thông tin cơ bản (hiển thị)", "sel": "-", "kind": "area", "trig": "view", "detail": ["番号・種類・数・委託配送先・都道府県・渡した配送スタッフ・渡した日・返却日・返却数・状態・メモ。すべて表示だけ。", "Số・loại・số lượng・điểm giao hàng ủy thác・tỉnh/thành・nhân viên giao hàng đã giao・ngày giao・ngày trả・số lượng trả・trạng thái・ghi chú. Tất cả chỉ hiển thị."]},
]

I7 = [
    {"no": "1", "ja": "タブ", "vi": "Tab", "sel": "-", "kind": "tab", "trig": "click", "pattern": "P-TAB", "detail": ["詳細の上のタブ。「基本情報」「変更履歴」。初期は「基本情報」。", "Tab phía trên chi tiết. 「基本情報」「変更履歴」. Mặc định là 「基本情報」."]},
    {"no": "2", "ja": "変更履歴の表", "vi": "Bảng lịch sử thay đổi", "sel": "-", "kind": "table", "trig": "view", "pattern": "P-HIST", "err": ["I01"], "detail": ["列：変更日時・変更内容・変更者。新しい順。1ページ 10件。0件は I01。履歴に「影響した拠点数」「バージョン」は持たない（P-HIST）。変更者＝運営のアカウント名。表示だけ（直せない）。", "Cột: ngày giờ thay đổi・nội dung thay đổi・người thay đổi. Mới nhất lên đầu. 10 dòng/trang. 0 bản ghi hiển thị I01. Lịch sử không có 「影響した拠点数」「バージョン」 (P-HIST). Người thay đổi = tên tài khoản của bên vận hành. Chỉ hiển thị (không sửa được)."]},
]

VIEWS = [
    V("001", "AW_COOL_001", "初期表示", "Hiển thị ban đầu", "/ops/masters/coolers", I1),
    V("002", "AW_COOL_002", "登録・編集（モーダル）", "Đăng ký / sửa (modal)", "/ops/masters/coolers", I2, setup="clickText('.ph button','新規登録'); await sleep(500);"),
    V("003", "AW_COOL_001", "0件（検索結果なし）", "0 bản ghi (không có kết quả tìm kiếm)", "/ops/masters/coolers", I3, setup="const kw=document.querySelector('.es-search input'); if(kw){Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(kw,'zzzzzz'); kw.dispatchEvent(new Event('input',{bubbles:true})); await sleep(200); clickText('button','検索'); await sleep(600);}"),
    V("004", "AW_COOL_001", "参照のみ（閲覧の権限だけ）", "Chỉ xem (chỉ có quyền xem)", "/ops/masters/coolers", I4, login="Ad00011"),
    V("005", "AW_COOL_002", "入力エラー", "Lỗi nhập", "/ops/masters/coolers", I5, setup="clickText('.ph button','新規登録'); await sleep(500); clickText('.mbox-f button','登録'); await sleep(400);"),
    V("006", "AW_COOL_003", "詳細", "Chi tiết", "/ops/masters/coolers/CB-0001", I6),
    V("007", "AW_COOL_003", "詳細（変更履歴のタブ）", "Chi tiết (tab lịch sử thay đổi)", "/ops/masters/coolers/1?tab=hist", I7),
]
