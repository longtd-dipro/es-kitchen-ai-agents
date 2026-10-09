# -*- coding: utf-8 -*-
"""
画面設計書のデータ：運営管理者Web ＞ 設定管理 ＞ メンテナンス管理（状態・開始・終了・編集・履歴）
元：本物の Web（app/ops/settings/maintenance・lib/ops/areas/general.ts の maint／maintToggle）、台帳 F（2026-10-06）・運営Web_権限表（権限付与）・CSV入出力_定義（メンテナンス管理は CSV出力のみ）
番号は画面ごとに通し。タブ・モーダルの状態では、その状態で増える・変わる項目だけ書く。
"""

TITLE = ["メンテナンス管理（AW_MNTN）", "Quản lý bảo trì (AW_MNTN)"]
SHEET = ["メンテナンス管理", "Quản lý bảo trì"]
BASENAME = "画面設計書_AW_MNTN_メンテナンス管理"
IMG_PREFIX = "AW_MNTN"
OUT_DIR = "AW_MNTN_メンテナンス管理"
CODE_NOTE = ["画面コードは規約 <Module(2)>_<Feature(4)>_<Seq(3)>（docs/01_仕様/画面コード規約_20261005.md）。AW＝運営管理者Web、MNTN＝メンテナンス管理",
             "Mã màn hình theo quy ước <Module(2)>_<Feature(4)>_<Seq(3)>. AW = Admin Web, MNTN = Quản lý bảo trì"]
SITE = "ops"
SYSTEM = {"ja": "運営管理者Web", "vi": "Web quản trị vận hành"}
AUTHOR = "Claude（cloud）／確認：hong"
CREATED = "2026-10-06"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "ops", "loginId": "Ad00010"}
CODE_PATHS = ["app/ops/settings/maintenance", "lib/ops/areas/general.ts", "lib/ops/general/seed.ts"]

DECISIONS = [
    {"date": "2026-10-06", "target": "メンテナンスの対象",
     "q": ["メンテナンスにできる対象は", "Đối tượng được bảo trì"],
     "a": ["アプリ（iOS・Android）だけ。Web サイトのメンテナンスは対象外（画面にも出さない）", "Chỉ app (iOS, Android). Web site không bảo trì (cũng không hiện trên màn hình)"],
     "src": "hong 回答 2026-10-06（運営I2 #7）・台帳 F・受付簿 No.174"},
    {"date": "2026-10-06", "target": "メンテナンスの編集",
     "q": ["「編集」の画面は", "Màn 「編集」 thế nào"],
     "a": ["モーダル。端末OS（iOS・Android）ごとにタイトル（60文字）・説明内容（500文字）を直す。メンテナンス中でも直せる", "Modal. Sửa tiêu đề (60 ký tự) và nội dung (500 ký tự) theo từng OS. Sửa được cả khi đang bảo trì"],
     "src": "hong 回答 2026-10-06（運営I2 #7）・入力の共通基準（文字数）・受付簿 No.174"},
    {"date": "2026-10-06", "target": "権限",
     "q": ["だれが見られる・操作できるか", "Ai xem/thao tác được"],
     "a": ["フル権限・システム管理＝CRUD、ほかの6役割（経理・営業・CS・商品管理・商品開発・物流）＝R（閲覧・CSV出力）", "フル権限・システム管理 = CRUD, 6 vai trò khác = R (xem, xuất CSV)"],
     "src": "hong 回答 2026-10-06（権限付与は閲覧を許可）・台帳 F・受付簿 No.173"},
    {"date": "2026-10-06", "target": "画面コード",
     "q": ["画面コード", "Mã màn hình"], "a": ["AW_MNTN_001", "AW_MNTN_001"], "src": "hong 回答 2026-10-06（運営I2 #9）"},
    {"date": "2026-10-07", "target": "開始・実施中の編集", "q": ["開始を押したあと内容を直したいときは", "Muốn sửa nội dung sau khi nhấn bắt đầu thì"], "a": ["開始のモーダルでタイトル・説明内容を直してから開始できる。実施中も「編集」で直せる", "Có thể sửa tiêu đề/nội dung ngay trong modal bắt đầu rồi bắt đầu. Đang bảo trì vẫn sửa được bằng 「編集」"], "src": "hong 回答 2026-10-07・受付簿 No.185"}
]
CHANGES = [
    {"ver": "1.1", "date": "2026-10-06", "no": ["1"], "type": "追加", "reason": ["状態を追加：参照のみ・入力エラー", "Thêm trạng thái: chỉ xem, lỗi nhập"], "impact": ["タイトル・説明の空は項目の下に E01。実装済", "Tiêu đề/nội dung để trống hiện E01 dưới ô. Đã triển khai"]},
    {"ver": "1.1", "date": "2026-10-06", "no": ["1.3", "1.4"], "type": "変更", "before": ["「キャンセル／保存」を1項目", "Gộp 「キャンセル／保存」 thành 1 mục"], "after": ["「キャンセル」(1.3)と「保存」(1.4)に分ける", "Tách thành 「キャンセル」(1.3) và 「保存」(1.4)"], "reason": ["役割レビュー（BA・QC・UI/UX）の指摘への対応", "Xử lý các góp ý từ review vai trò (BA・QC・UI/UX)"], "impact": ["番号の場所を分けただけ（動きは変更なし）", "Chỉ tách vị trí đánh số (hành vi không đổi)"]},
    {"ver": "1.1", "date": "2026-10-06", "no": ["2.4"], "type": "変更", "before": ["編集：表示条件の記載なし", "Sửa: chưa ghi điều kiện hiển thị"], "after": ["編集：権限付与の編集ができる役割だけ", "Sửa: chỉ vai trò sửa được 権限付与"], "reason": ["役割レビュー（BA・QC・UI/UX）の指摘への対応", "Xử lý các góp ý từ review vai trò (BA・QC・UI/UX)"], "impact": ["ボタンの出し分けは実装済", "Việc ẩn/hiện nút đã triển khai"]},
    {"ver": "1.3", "date": "2026-10-07", "no": ["1", "1.1", "1.2", "2.3"], "type": "追加", "reason": ["hong の回答・コメント（2026-10-07）への対応", "Xử lý trả lời・góp ý của hong (2026-10-07)"], "impact": ["開始のモーダルでタイトル・説明内容を直してから開始できる。実装済（受付簿 No.185）", "Có thể sửa tiêu đề/nội dung ngay trong modal bắt đầu rồi bắt đầu. Đã triển khai (受付簿 No.185)"]}
]
HIDE_ALWAYS = []
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [
    {"code": "AW_MNTN_001", "ja": "メンテナンス管理", "vi": "Quản lý bảo trì"},
]

H = (
    "const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));"
    "const clickText=(sel,t,i)=>{const b=[...document.querySelectorAll(sel)].filter(x=>(x.textContent||'').includes(t))[i||0];b&&b.click();};"
    "const clickBtn=(t,i)=>{const b=[...document.querySelectorAll('.mcard .ft button')].filter(x=>(x.textContent||'').includes(t))[i||0];b&&b.click();};"
)

L_ITEMS = [
    {"no": "1", "ja": "ヘッダー", "vi": "Đầu trang", "sel": ".ph", "kind": "area", "trig": "view",
     "detail": ["パンくず：設定管理 ＞ メンテナンス管理。見られるのは運営の全役割（開始・終了・編集ができるのはフル権限・システム管理だけ）。", "Breadcrumb: 設定管理 > メンテナンス管理. Mọi vai trò vận hành xem được (chỉ フル権限・システム管理 bắt đầu/kết thúc/sửa được)."]},
    {"no": "1.1", "ja": "CSV出力", "vi": "Xuất CSV", "sel": ".ph", "kind": "button", "trig": "click", "pattern": "P-CSV-OUT",
     "detail": ["ヘッダーの右。下の履歴の全件（端末OS・タイトル・説明内容・開始日時・終了日時）。", "Bên phải đầu trang. Toàn bộ lịch sử bên dưới (OS thiết bị, tiêu đề, nội dung, thời gian bắt đầu, thời gian kết thúc)."]},
    {"no": "2", "ja": "端末OSごとのカード", "vi": "Thẻ theo OS thiết bị", "sel": ".mcards", "kind": "area", "trig": "view",
     "detail": ["iOS と Android の2枚。メンテナンスにできる対象はアプリだけ（Web サイトは対象外）。", "2 thẻ iOS và Android. Đối tượng bảo trì chỉ là app (Web site không áp dụng)."]},
    {"no": "2.1", "ja": "状態", "vi": "Trạng thái", "sel": ".mcard .hd .badge", "kind": "label", "trig": "view",
     "detail": ["「稼働中」または「メンテナンス中」（バッジ）。", "「稼働中」 hoặc 「メンテナンス中」 (badge)."]},
    {"no": "2.2", "ja": "タイトル・説明内容", "vi": "Tiêu đề / nội dung giải thích", "sel": ".mcard .bd", "kind": "label", "trig": "view",
     "detail": ["メンテナンス中にアプリへ出す案内の文。メンテナンスにしていないときも表示する（次に使う文）。", "Nội dung thông báo hiện trên app khi bảo trì. Cũng hiện khi chưa bảo trì (nội dung sẽ dùng lần tới)."]},
    {"no": "2.3", "ja": "メンテナンス開始／終了", "vi": "Bắt đầu / kết thúc bảo trì", "sel": ".mcard .ft button", "kind": "button", "trig": "click", "err": ["Q180", "Q181", "S180", "S181", "E30"],
     "detail": ["稼働中のカードは「メンテナンス開始」、メンテナンス中のカードは「メンテナンス終了」。押すと確認（Q180／Q181。開始は案内のタイトル・説明内容をその場で直してから開始できる）。「開始する」「終了する」で切り替えて S180／S181。すぐ反映される。権限がない役割には出さない。", "Thẻ đang hoạt động có nút 「メンテナンス開始」, thẻ đang bảo trì có 「メンテナンス終了」. Nhấn sẽ hiện xác nhận (Q180/Q181; khi bắt đầu có thể sửa tiêu đề/nội dung thông báo ngay tại đó). 「開始する」「終了する」 để chuyển và hiện S180/S181. Có hiệu lực ngay. Không hiện với vai trò không có quyền."]},
    {"no": "2.4", "ja": "編集", "vi": "Sửa", "sel": ".mcard .ft button::編集", "kind": "button", "trig": "click", "cond": ["権限付与の編集ができる役割（フル権限・システム管理）だけ。メンテナンス中でも直せる", "Chỉ vai trò sửa được 「権限付与」 (フル権限・システム管理). Sửa được cả khi đang bảo trì"],
     "detail": ["タイトル・説明内容を直すモーダル（状態 003）。権限がない役割には出さない。", "Modal sửa tiêu đề và nội dung (trạng thái 003). Không hiện với vai trò không có quyền."]},
    {"no": "3", "ja": "メンテナンスの履歴", "vi": "Lịch sử bảo trì", "sel": ".tbl", "kind": "table", "trig": "view", "pattern": "P-LIST", "err": ["I01"],
     "detail": ["開始・終了のたびに1行足す。初期の並びは開始日時の新しい順。1ページ 10件。0件は I01。", "Mỗi lần bắt đầu/kết thúc thêm 1 dòng. Thứ tự ban đầu: thời gian bắt đầu mới nhất trước. 10 dòng/trang. 0 dòng hiện I01."]},
    {"no": "3.1", "ja": "端末OS・タイトル・説明内容・開始日時・終了日時", "vi": "OS thiết bị, tiêu đề, nội dung, giờ bắt đầu, giờ kết thúc", "sel": ".tbl thead", "kind": "label", "trig": "view",
     "detail": ["説明内容は長いと一行で切って表示（全文はマウスを載せると出る）。日時は yyyy-mm-dd HH:MM。終了前の行の終了日時は空欄。", "Nội dung dài thì cắt thành một dòng (rê chuột để xem đủ). Ngày giờ dạng yyyy-mm-dd HH:MM. Dòng chưa kết thúc thì thời gian kết thúc để trống."]},
]

C_ITEMS = [
    {"no": "1", "ja": "開始のモーダル（内容を直してから開始）", "vi": "Modal bắt đầu (sửa nội dung rồi bắt đầu)", "sel": ".ov .mbox", "kind": "modal", "trig": "click", "pattern": "P-FORM", "err": ["Q180", "S180", "E01", "E04", "E30"],
     "detail": ["タイトル「メンテナンスの開始」。上に確認の文（Q180）、その下に「タイトル」「説明内容」の入力欄（保存済みの案内が入っている。ここで直してから開始できる：hong 2026-10-07）。「キャンセル」「開始する」。開始するとその OS のアプリは使えなくなる（利用中の方も）。入力を直した場合は、開始と同時に保存する（次のメンテナンスにも使う）。終了の確認（Q181）は文言と「終了する」だけ違う同じ作り（入力欄なし）。",
                "Tiêu đề 「メンテナンスの開始」. Phía trên là câu xác nhận (Q180), bên dưới là ô nhập 「タイトル」「説明内容」 (đã điền sẵn thông báo đã lưu; có thể sửa tại đây rồi bắt đầu: hong 2026-10-07). 「キャンセル」「開始する」. Khi bắt đầu thì app của OS đó không dùng được (kể cả người đang dùng). Nếu đã sửa thì lưu cùng lúc bắt đầu (dùng cho lần bảo trì sau). Xác nhận kết thúc (Q181) có cấu trúc giống, chỉ khác câu chữ và nút 「終了する」 (không có ô nhập)."]},
    {"no": "1.1", "ja": "タイトル", "vi": "Tiêu đề", "sel": ".mbox input", "kind": "text", "trig": "input", "req": "○", "len": "文字列 60", "ex": ["システムメンテナンスのお知らせ", "Thông báo bảo trì hệ thống (ví dụ)"], "err": ["E01", "E04"],
     "detail": ["アプリに出す案内の見出し。保存済みの内容が入っている。空にはできない（E01）。", "Tiêu đề thông báo hiển thị trên app. Đã điền sẵn nội dung đã lưu. Không được để trống (E01)."]},
    {"no": "1.2", "ja": "説明内容", "vi": "Nội dung giải thích", "sel": ".mbox textarea", "kind": "textarea", "trig": "input", "req": "○", "len": "文字列 500", "ex": ["メンテナンスのため、しばらくご利用いただけません。", "Do đang bảo trì nên tạm thời không sử dụng được."], "err": ["E01", "E04"],
     "detail": ["アプリに出す案内の本文。複数行。保存済みの内容が入っている。空にはできない（E01）。", "Nội dung thông báo hiển thị trên app. Nhiều dòng. Đã điền sẵn nội dung đã lưu. Không được để trống (E01)."]},
]

E_ITEMS = [
    {"no": "1", "ja": "編集モーダル", "vi": "Modal sửa", "sel": ".ov .mbox", "kind": "modal", "trig": "click", "pattern": "P-FORM",
     "detail": ["タイトル「{端末OS} の案内を編集」。保存は「保存」、閉じるは「キャンセル」。入力を変えてキャンセルしたら Q02。成功したら S01 のトーストを出して閉じる。", "Tiêu đề 「Sửa thông báo {OS thiết bị}」. Lưu = 「保存」, đóng = 「キャンセル」. Đã sửa mà hủy thì hiện Q02. Thành công hiện toast S01 rồi đóng."]},
    {"no": "1.1", "ja": "タイトル", "vi": "Tiêu đề", "sel": ".mbox input", "kind": "text", "trig": "input", "req": "○", "len": "文字列 60",
     "ex": ["システムメンテナンスのお知らせ", "Tiêu đề thông báo bảo trì (ví dụ)"], "err": ["E01", "E04"],
     "detail": ["アプリに出る案内の見出し。", "Tiêu đề thông báo hiển thị trên app."]},
    {"no": "1.2", "ja": "説明内容", "vi": "Nội dung giải thích", "sel": ".mbox textarea", "kind": "textarea", "trig": "input", "req": "○", "len": "文字列 500",
     "ex": ["システムの更新作業のため、10月10日 2:00〜5:00 はご利用いただけません。", "Nội dung thông báo (ví dụ): do cập nhật hệ thống nên không dùng được từ 2:00 đến 5:00 ngày 10/10."], "err": ["E01", "E04"],
     "detail": ["アプリに出る案内の本文。改行できる。", "Nội dung thông báo hiển thị trên app. Có thể xuống dòng."]},
    {"no": "1.3", "ja": "キャンセル", "vi": "Hủy bỏ", "sel": ".mbox-f button::キャンセル", "kind": "button", "trig": "click", "err": ["Q02"], "detail": ["モーダルを閉じる。入力を変えていたら Q02（キャンセル／破棄）。", "Đóng modal. Đã sửa nội dung thì hiện Q02 (hủy / bỏ thay đổi)."]},
    {"no": "1.4", "ja": "保存", "vi": "Lưu", "sel": ".mbox-f .btn.pri", "kind": "button", "trig": "click", "err": ["S01", "E30", "E31"], "detail": ["押すとまとめてチェック（項目の下にエラー・赤枠）。エラーがなければ保存して S01。ほかの人が先に保存していたら E31（P-FORM）。", "Nhấn sẽ kiểm tra gộp (lỗi hiện dưới ô, viền đỏ). Không lỗi thì lưu và hiện S01. Người khác lưu trước thì E31 (P-FORM)."]},
]


def V(id, code, ja, vi, url, items, setup="", note=None, full=True, wait=500, login=None):
    v = {"id": id, "code": code, "state": [ja, vi], "url": url, "setup": (H + setup) if setup else "", "full": full, "wait": wait, "note": note or ["", ""], "items": items}
    if login:
        v["login"] = login
    return v




# >>> review additions（役割レビューの指摘：0件・参照のみ・入力エラーの状態。2026-10-06）
I_004 = [
    {"no": "1", "ja": "参照のみ（権限が閲覧だけの役割）", "vi": "Chỉ xem (vai trò chỉ có quyền xem)", "sel": ".ph", "kind": "area", "trig": "view", "cond": ["経理（権限付与は閲覧のみ）", "Kế toán (「経理」) (「権限付与」 chỉ được xem)"], "detail": ["経理（権限付与は閲覧のみ）。「メンテナンス開始／終了」「編集」は出さない。履歴の CSV出力は出す。", "Kế toán (「経理」) (「権限付与」 chỉ được xem). Không hiển thị 「メンテナンス開始／終了」「編集」. Vẫn hiển thị xuất CSV của lịch sử."]},
]
I_005 = [
    {"no": "1", "ja": "必須の入力エラー", "vi": "Lỗi nhập bắt buộc", "sel": ".mbox .emsg", "kind": "label", "trig": "view", "pattern": "P-FORM", "err": ["E01", "E04"], "detail": ["タイトルを空にして「保存」を押すと、タイトルの下に E01 を出して赤枠にする（保存しない）。説明内容も同様。", "Nếu để trống tiêu đề rồi bấm 「保存」, hiển thị E01 bên dưới tiêu đề và tô viền đỏ (không lưu). Nội dung mô tả cũng tương tự."]},
]
# <<< review additions

VIEWS = [
    V("001", "AW_MNTN_001", "初期表示（稼働中）", "Ban đầu (đang hoạt động)", "/ops/settings/maintenance", L_ITEMS),
    V("002", "AW_MNTN_001", "開始の確認", "Xác nhận bắt đầu", "/ops/settings/maintenance", C_ITEMS,
      setup="clickBtn('メンテナンス開始', 0); await sleep(300);"),
    V("003", "AW_MNTN_001", "編集（モーダル）", "Sửa (modal)", "/ops/settings/maintenance", E_ITEMS,
      setup="clickBtn('編集', 0); await sleep(400);"),
    V("004", "AW_MNTN_001", "参照のみ（閲覧の権限だけ）", "Chỉ xem (chỉ có quyền xem)", "/ops/settings/maintenance", I_004, login="Ad00012"),
    V("005", "AW_MNTN_001", "入力エラー", "Lỗi nhập", "/ops/settings/maintenance", I_005, setup="clickText('.mcard .ft button','編集',0); await sleep(500); const t=document.querySelector('.mbox input'); if(t){Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(t,''); t.dispatchEvent(new Event('input',{bubbles:true})); await sleep(200);} clickText('.mbox-f button','保存'); await sleep(400);"),
]
