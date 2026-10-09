# -*- coding: utf-8 -*-
"""
画面設計書のデータ：運営管理者Web「集金管理」（AW_COLL）。運営E（請求・購入）の1機能。
元は本物の Web（app/ops/billing/collection/page.tsx・lib/ops/billing/fromDomain.ts の cashListOf・lib/ops/areas/billing.ts の cash）。
決まり：docs/決定台帳.md F 2026-10-05「集金管理（簡易版）の画面」（専用の一覧画面・現金の突き合わせだけ・未請求／請求済／入金済の状態は持たない・実績精算の現金の表は残す）、
台帳 F 2026-10-08「集金管理の権限（物流）…」（2026-10-08 のうちに『参照のみ・物流を含む全役割 R』に置き換え：台帳 F「集金管理は参照のみ…」）、台帳 B（駐車料金は集金と別・法人Webには出さない）、台帳 K・M-1（一覧の標準・CSV出力）。
作り方：データは台帳に合わせて書いた。コードが台帳と違うところは demo_ok（理由つき）。台帳にもない点は open（ask）にした。
Screen Code：確認メモ_AW_運営E の「範囲外・要確認」で未割当だった `/ops/billing/collection` に AW_COLL_001 を割り当てる（台帳 F 2026-10-05 の Screen Code 規約のとおり。hong 確認待ちの行は DECISIONS でなく open）。
項目の sel は、ブラウザが使えない環境でコードから起こした暫定。撮影（make.py --capture）で見つからない番号が出たら直す。
ベトナム語（vi）とデータ例の説明は空。最後にサブエージェント（Sonnet）で1回に訳す。
"""

TITLE = ["集金管理（AW_COLL）", "Quản lý thu tiền (AW_COLL)"]
SHEET = ["集金管理", "Quản lý thu tiền"]
BASENAME = "画面設計書_AW_COLL_集金管理"
IMG_PREFIX = "AW_COLL"
OUT_DIR = "運営管理者Web"
CODE_NOTE = ["画面コード規約：AW＝Admin Web、COLL＝集金管理。運営E（請求・購入）の1機能。委託配送先Web の集金管理は OW_COLL（別の画面）", "Quy ước mã màn hình: AW = Admin Web, COLL = Quản lý thu tiền. Một chức năng của 運営E (thanh toán・mua hàng). Quản lý thu tiền của Web đối tác giao hàng là OW_COLL (màn hình khác)"]
SITE = "ops"
SYSTEM = {"ja": "運営管理者Web", "vi": "Web quản trị vận hành"}
AUTHOR = "Claude（cloud）／確認：hong"
CREATED = "2026-10-08"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "ops", "loginId": "Ad00010"}
CODE_PATHS = ["app/ops/billing/collection", "app/ops/billing/_components", "lib/ops/billing", "lib/domain/seed"]

_H5 = "hong 回答（チャット 2026-10-05＝A）・台帳 F「集金管理（簡易版）の画面」・受付簿 No.60"
DECISIONS = [
    {"date": "2026-10-05", "target": "AW_COLL 全体", "q": ["集金管理の画面を作るか・どこまでか", "Có làm màn hình quản lý thu tiền không, đến đâu"],
     "a": ["運営Web に専用の一覧画面「集金管理」を作る。現金の突き合わせ（回収予定・回収額・差額）だけ。未請求／請求済／入金済の状態は持たない。実績精算の詳細の現金の表はそのまま残す", "Làm màn hình danh sách riêng 「集金管理」 ở Web vận hành. Chỉ đối chiếu tiền mặt (số dự kiến thu, số đã thu, chênh lệch). Không có trạng thái chưa yêu cầu / đã yêu cầu / đã nhận. Bảng tiền mặt trong chi tiết đối soát thực tế vẫn giữ nguyên"],
     "src": _H5},
    {"date": "2026-10-08", "target": "AW_COLL 全体（権限）【取り消し済み：同日の下の行で置き換え】", "q": ["集金管理の権限（物流）", "Quyền của 集金管理 (logistics)"],
     "a": ["物流は集金管理の現金の突き合わせ画面だけ CRUD（この画面）。実績精算・請求の確定・請求書は R（仮置き。権限の画面で最終確認）。それ以外の役割は R", "Logistics chỉ có CRUD ở màn hình đối chiếu tiền mặt (màn hình này). Đối soát thực tế・chốt hóa đơn・hóa đơn là R (tạm). Các vai trò còn lại là R"],
     "src": "hong 回答（チャット 2026-10-08）#15〜#18・台帳 F「集金管理の権限（物流）…」・運営Web_権限表"},
    {"date": "2026-10-08", "target": "AW_COLL 全体・4.2・3.5・5", "q": ["物流の CRUD・選べる月・差額の向き・並べ替えと0件", "CRUD của logistics・các tháng chọn được・chiều chênh lệch・sắp xếp và 0 dòng"],
     "a": ["参照のみ・編集不可。物流を含む全役割が R（物流 CRUD は取り消し）。選べる月＝現金の集金の報告がある月と当月（新しい順・初期＝当月）。差額＝回収予定 − 実際の回収（不足がプラス＝実績精算の現金回収差額と同じ向き）。全列で並べ替え・0件は I01", "Chỉ tham chiếu, không sửa. Mọi vai trò kể cả logistics là R (hủy CRUD của logistics). Tháng chọn được = tháng có báo cáo thu tiền mặt và tháng hiện tại (mới nhất trước, mặc định = tháng hiện tại). Chênh lệch = dự kiến thu − thực tế đã thu (thiếu là số dương = cùng chiều với 「現金回収差額」 của đối soát thực tế). Sắp xếp mọi cột, 0 dòng là I01"],
     "src": "hong 回答（チャット 2026-10-08「提案通りで」）・台帳 F「集金管理は参照のみ…」・受付簿 No.382"},
    {"date": "2026-10-08", "target": "AW_COLL_001 No.1.1・4.2・3・13", "q": ["読み込み失敗の文言・CSV 0件・現金の集金がない月", "Câu khi tải lỗi・CSV 0 dòng・tháng không có thu tiền mặt"],
     "a": ["読み込み失敗は既存の W141 を使う（{対象}＝集金管理の一覧＋「再読み込み」。読み込み中・失敗のあいだ合計は「—」）。CSV が0件でも押せて見出しだけのファイルを出す（S12 の0行。新しい文言は作らない）。CSV は検索結果のすべての行。現金の集金がない月は月の選択肢に出さず、?m= がその月なら当月にする", "Khi tải lỗi dùng W141 sẵn có ({đối tượng} = danh sách quản lý thu tiền + 「再読み込み」; khi đang tải・lỗi thì tổng là 「—」). CSV 0 dòng vẫn bấm được và xuất tệp chỉ có tiêu đề (S12 0 dòng, không tạo câu mới). CSV là toàn bộ dòng của kết quả tìm kiếm. Tháng không có thu tiền mặt không hiện trong lựa chọn tháng, nếu ?m= là tháng đó thì dùng tháng hiện tại"],
     "src": "hong 回答（チャット 2026-10-08「提案通りで」・「集金予定がないか現金を使わない月は表示しなくてよい」・「検索結果で全ての行を出力」）・台帳 F「集金管理は参照のみ…」"},
    {"date": "2026-10-03", "target": "AW_COLL（駐車料金）", "q": ["運営の集金管理に駐車料金を出すか", "Có hiện phí đỗ xe ở 集金管理 của vận hành không"],
     "a": ["出さない。この画面は現金の集金の突き合わせだけ。駐車料金はドライバーが立て替え、委託配送会社がまとめて運営へ請求する（委託配送先Web の OW_COLL に別の列がある）", "Không hiện. Màn hình này chỉ đối chiếu tiền thu mặt. Phí đỗ xe do tài xế ứng trước, đối tác giao hàng gộp lại yêu cầu 運営 (có cột riêng ở OW_COLL của Web đối tác giao hàng)"],
     "src": "台帳 B「駐車料金の精算」"},
    {"date": "2026-10-07", "target": "AW_COLL_001 No.5・6", "q": ["一覧の初期の並び・ページ送り・検索のしかた", "Thứ tự mặc định, phân trang, cách tìm kiếm"],
     "a": ["1ページ 10件（10／20／50／100）、全列で並べ替え、検索は「検索」か Enter、「未適用」の印は出さない、0件は I01。初期の並びは回収日の新しい順（コードのまま）", "10 dòng/trang (10／20／50／100), sắp xếp mọi cột, tìm kiếm bằng 「検索」 hoặc Enter, không hiện dấu 「未適用」, 0 dòng là I01. Thứ tự mặc định là ngày thu mới nhất trước (như code)"],
     "src": "台帳 K（一覧の標準）・台帳 E「一覧の初期の並び」"},
]
CHANGES = []

HIDE_ALWAYS = [".es-demo-bar", "#es-review"]
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [{"code": "AW_COLL_001", "ja": "集金管理", "vi": "Quản lý thu tiền"}]

PAIR = ("detail", "init", "ex", "cond", "valid", "len", "demo_ok", "chk", "open")


def F(no, ja, sel, kind, trig="view", **kw):
    d = {"no": no, "ja": ja, "vi": "", "sel": sel, "kind": kind, "trig": trig}
    for k, v in kw.items():
        if v is None:
            continue
        if k in PAIR and isinstance(v, str):
            v = [v, ""]
        d[k] = v
    return d


def ST(vid, code, state, note, items, url="/ops/billing/collection", **kw):
    d = {"id": vid, "code": code, "state": state if isinstance(state, list) else [state, ""], "url": url, "setup": kw.pop("setup", ""), "full": kw.pop("full", True), "wait": kw.pop("wait", 700),
         "note": note if isinstance(note, list) else [note, ""], "items": items}
    d.update(kw)
    return d


H = ("const wait=(ms)=>new Promise(r=>setTimeout(r,ms));"
     "const setv=(el,v)=>{const p=Object.getPrototypeOf(el);Object.getOwnPropertyDescriptor(p,'value').set.call(el,v);el.dispatchEvent(new Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}));};")
SUBMIT = "[...document.querySelectorAll('.es-search__main .btn')].find(b=>b.textContent.trim()==='検索').click();await wait(400);"

L1 = [
    F("1", "見出し", ".ph", "area", vi="Tiêu đề trang",
      detail=["パンくず「請求 ／ 集金管理」。画面名は「集金管理」。参照のみ・編集不可の画面（見る・検索する・並べ替える・CSVを出すだけ）。", "Breadcrumb 「請求 ／ 集金管理」. Tên màn hình là 「集金管理」. Màn hình chỉ tham chiếu, không sửa được (chỉ xem・tìm kiếm・sắp xếp・xuất CSV)."]),
    F("1.1", "CSV出力", ".ph .btns button", "button", "click", pattern="P-CSV-OUT", err=["S12"], vi="Xuất CSV",
      detail=["検索結果のすべての行を出す（検索条件＝キーワード・対象月・差額に合う全件。ページ送りに関係なく）。行の順は画面の並べ替えのとおり。1行＝1回の集金（配送データ1件）。列＝画面の列（回収日・配送データ・法人名・拠点名・配送会社・ドライバー・回収予定額（税込）・実際の回収額（税込）・差額（税込）・メモ。法人・拠点・配送会社・ドライバーはIDの列も付く）＋配送の報告の全項目（台帳 M-1「全部のデータを CSV で出せる」。運営の一覧の共通のしくみ）。0件のときも押せて、見出しだけのファイルを出す（トーストは S12「CSVを出力しました（0行・…）。」）。",
              "Xuất toàn bộ dòng của kết quả tìm kiếm (các dòng khớp từ khóa・tháng đối tượng・chênh lệch, không phụ thuộc trang). Thứ tự dòng theo cách sắp xếp trên màn hình. 1 dòng = 1 lần thu tiền (1 dữ liệu giao hàng). Cột = các cột trên màn hình (ngày thu・dữ liệu giao hàng・pháp nhân・chi nhánh・công ty giao hàng・tài xế・số tiền dự kiến thu (gồm thuế)・số tiền thực tế đã thu (gồm thuế)・chênh lệch (gồm thuế)・ghi chú; pháp nhân・chi nhánh・công ty giao hàng・tài xế có thêm cột ID) + toàn bộ mục của báo cáo giao hàng (sổ cái M-1 「xuất được toàn bộ dữ liệu ra CSV」, cơ chế chung của danh sách vận hành). Khi 0 dòng vẫn bấm được và xuất tệp chỉ có dòng tiêu đề (toast S12 「CSVを出力しました（0行・…）。」)."]),
    F("2", "説明", "div.small::アプリの現金支払い", "area", vi="Giải thích",
      detail=["突き合わせの説明の1行（アプリの現金支払いの回収予定額と、ドライバーが実際に回収した額の突き合わせ。差額＝回収予定 − 実際の回収で、不足がプラス）。説明の中の「実績精算」は実績精算の一覧（AW_ACTL_001）へのリンク。差額は実績精算の「現金回収差額」と同じ向きの参考値で、実績精算の確定額は、対象外の拠点や手修正（AW_ACTL_003）で変わることがある。",
              "Một dòng giải thích về đối chiếu (số tiền dự kiến thu của thanh toán tiền mặt trên app và số tiền tài xế thực tế đã thu; chênh lệch = dự kiến thu − thực tế đã thu, thiếu là số dương). 「実績精算」 trong lời giải thích là liên kết tới danh sách đối soát thực tế (AW_ACTL_001). Chênh lệch là giá trị tham khảo cùng chiều với 「現金回収差額」 của đối soát thực tế; số tiền chốt của đối soát thực tế có thể thay đổi do chi nhánh ngoài đối tượng hoặc chỉnh sửa tay (AW_ACTL_003)."]),
    F("2.1", "実績精算へのリンク", "div.small a", "link", "click", vi="Liên kết tới đối soát thực tế",
      detail=["押すと実績精算の一覧（AW_ACTL_001）へ。実績精算の詳細には、拠点ごとの現金の回収予定・回収の表が残る。", "Bấm để chuyển tới danh sách đối soát thực tế (AW_ACTL_001). Chi tiết đối soát thực tế vẫn giữ bảng số tiền dự kiến thu・số tiền đã thu bằng tiền mặt theo từng chi nhánh."]),
    F("3", "合計", ".sumbar", "area", vi="Tổng",
      detail=["検索結果のすべての行の合計（ページに関係なく）。件数・差額あり件数・回収予定額・実際の回収額・差額の5つ。対象月の実績精算の期間（前月21日〜当月20日）に納品日が入る配送だけが対象。", "Tổng của toàn bộ dòng trong kết quả tìm kiếm (không phụ thuộc trang). Gồm 5 mục: số dòng・số dòng có chênh lệch・số tiền dự kiến thu・số tiền thực tế đã thu・chênh lệch. Chỉ tính các lần giao hàng có ngày giao nằm trong kỳ đối soát thực tế (ngày 21 tháng trước đến ngày 20 tháng này) của tháng đối tượng."]),
    F("3.1", "件数", ".sumbar .kv@1", "label", vi="Số dòng", detail=["条件に合う行の数（「n 件」）。", "Số dòng khớp điều kiện (「n 件」)."]),
    F("3.2", "差額あり", ".sumbar .kv@2", "label", vi="Có chênh lệch", detail=["そのうち、回収予定額と実際の回収額が違う行の数。", "Trong đó, số dòng có số tiền dự kiến thu khác số tiền thực tế đã thu."]),
    F("3.3", "回収予定額（税込）", ".sumbar .kv@3", "label", len="金額（円・税込）", vi="Số tiền dự kiến thu (gồm thuế)", detail=["回収予定額の合計。アプリの現金支払いで注文時に決まる額。単位は円・3桁区切り。", "Tổng số tiền dự kiến thu. Số tiền được quyết định khi đặt hàng với thanh toán tiền mặt trên app. Đơn vị yên, phân cách hàng nghìn."]),
    F("3.4", "実際の回収額（税込）", ".sumbar .kv@4", "label", len="金額（円・税込）", vi="Số tiền thực tế đã thu (gồm thuế)", detail=["ドライバーが配送の報告で入れた回収額の合計。", "Tổng số tiền thực tế tài xế nhập trong báo cáo giao hàng."]),
    F("3.5", "差額（税込）", ".sumbar .kv@5", "label", len="金額（円・税込・符号つき）", vi="Chênh lệch (gồm thuế)",
      detail=["回収予定 − 実際の回収の合計。不足はプラス、多く回収したらマイナス（どちらも赤）。0のときは色なし。不足も過多も赤なので、意味は符号で見分ける。実績精算の「現金回収差額」と同じ向き（請求に足す額）。請求への繰り入れは実績精算の画面で行う。",
              "Tổng của (dự kiến thu − thực tế đã thu). Thiếu là số dương, thu dư là số âm (đều màu đỏ). Bằng 0 thì không tô màu. Vì thiếu và dư đều màu đỏ nên phân biệt ý nghĩa bằng dấu. Cùng chiều với 「現金回収差額」 của đối soát thực tế (số tiền cộng vào hóa đơn). Việc chuyển vào hóa đơn được thực hiện ở màn hình đối soát thực tế."]),
    F("4", "検索条件", ".es-search", "area", pattern="P-LIST", vi="Điều kiện tìm kiếm",
      detail=["共通の一覧の検索欄（es-search）。「検索」か Enter で反映する。「未適用」の印は出さない。条件は表・合計・CSV出力のすべてに効く。", "Ô tìm kiếm của danh sách chung (es-search). Áp dụng khi nhấn 「検索」 hoặc Enter. Không hiện dấu 「未適用」. Điều kiện áp dụng cho bảng, tổng và xuất CSV."]),
    F("4.1", "キーワード", "input[placeholder^=\"法人名・ID\"]", "text", "input", req="－", len="文字列 60", vi="Từ khóa",
      ex=["栄成ロジ", "Một phần tên hoặc ID của pháp nhân, chi nhánh, công ty giao hàng hoặc tài xế"],
      detail=["法人・拠点・配送会社・ドライバーの名前かIDを部分一致で探す（1つの欄で4つを探す）。前後の空白は取り、全角の英数字は半角に直す。大文字小文字は区別しない。", "Tìm theo tên hoặc ID của pháp nhân・chi nhánh・công ty giao hàng・tài xế bằng khớp một phần (một ô tìm cả 4). Bỏ khoảng trắng đầu cuối, chuyển chữ và số toàn góc sang bán góc. Không phân biệt hoa thường."]),
    F("4.2", "対象月", "select[aria-label=\"対象月\"]", "select", "select", req="○", len="選択（実績精算の月）", init=["当月", "Tháng hiện tại"], vi="Tháng đối tượng",
      ex=["2026-10", "Tháng của kỳ đối soát thực tế (năm-tháng)"],
      detail=["見る月を選ぶ。選べる月は、現金の集金の報告がある月と当月を新しい順にすべて（初期＝当月。台帳 F 2026-10-08：現金の集金がない月は選択肢に出さない）。「すべて」はなく、必ず1つ選ぶ。選ぶとその月の実績精算の期間（前月21日〜当月20日）の配送が対象。",
              "Chọn tháng cần xem. Các tháng chọn được: mọi tháng có báo cáo thu tiền mặt và tháng hiện tại, mới nhất trước (mặc định = tháng hiện tại; sổ cái F 2026-10-08: tháng không có thu tiền mặt không hiện trong lựa chọn). Không có 「すべて」, bắt buộc chọn đúng 1 tháng. Khi chọn, đối tượng là các lần giao hàng trong kỳ đối soát thực tế của tháng đó (ngày 21 tháng trước đến ngày 20 tháng này)."]),
    F("4.3", "差額", "select[aria-label=\"差額\"]", "select", "select", req="－", len="選択", init=["差額", "Chênh lệch"], vi="Chênh lệch",
      ex=["差額あり", "Giá trị lọc theo chênh lệch (Tất cả / Có chênh lệch / Khớp)"],
      detail=["欄の表示は初期が「差額」（＝すべて）。「差額あり」「一致」から選ぶ。「差額あり」＝回収予定額と実際の回収額が違う行。「一致」＝同じ額の行。", "Ô hiển thị mặc định 「差額」 (= tất cả). Chọn từ 「差額あり」「一致」. 「差額あり」 = dòng có số tiền dự kiến thu khác số tiền thực tế đã thu. 「一致」 = dòng có hai số tiền bằng nhau."]),
    F("4.4", "クリア", ".es-search__main .btn::クリア", "button", "click", vi="Xóa điều kiện",
      detail=["条件を初期値（キーワード＝空・対象月＝当月・差額＝すべて）に戻して再検索する。", "Đưa điều kiện về giá trị ban đầu (từ khóa = trống・tháng đối tượng = tháng hiện tại・chênh lệch = tất cả) rồi tìm lại."]),
    F("4.5", "検索", ".es-search__main .btn::検索", "button", "click", vi="Tìm kiếm",
      detail=["条件を表・合計に反映して1ページ目に戻す。Enter でも同じ（キーワードの欄）。", "Áp dụng điều kiện vào bảng và tổng, quay về trang 1. Nhấn Enter (ở ô từ khóa) cũng giống vậy."]),
    F("4.6", "並べ替え", "button[aria-label=\"並べ替え\"]", "button", "click", vi="Sắp xếp",
      detail=["デザインシステムの「並べ替え」ボタン（1つの欄）。押すとメニューが開き、上に「昇順／降順」、下に項目（初期の順・回収日・配送データ・法人名・拠点名・配送会社・ドライバー・回収予定額・実際の回収額・差額・メモ）が並ぶ。選ぶとすぐ効き（検索ボタンは不要）、1ページ目に戻る。項目を選んだあと、メニューは閉じる（向きを変えたときは開いたまま）。メニューの外を押す・Esc で閉じる。ボタンの文字は、選んでいないときは「並べ替え」、選んでいるときは「並べ替え：項目（昇順）」。「初期の順」は回収日の新しい順（同じ日は配送データの昇順）。検索条件・合計は変わらない。",
              "Nút 「並べ替え」 của design system (một ô). Bấm sẽ mở menu, phía trên là 「昇順／降順」, phía dưới là các mục (初期の順・ngày thu・dữ liệu giao hàng・tên pháp nhân・tên chi nhánh・công ty giao hàng・tài xế・số tiền dự kiến thu・số tiền thực tế đã thu・chênh lệch・ghi chú). Có hiệu lực ngay khi chọn (không cần nút tìm kiếm), quay về trang 1. Sau khi chọn mục thì menu đóng (khi đổi chiều thì giữ mở). Bấm ra ngoài menu hoặc Esc để đóng. Chữ trên nút: khi chưa chọn là 「並べ替え」, khi đã chọn là 「並べ替え：mục（昇順）」. 「初期の順」 là ngày thu mới nhất trước (cùng ngày thì dữ liệu giao hàng tăng dần). Điều kiện tìm kiếm và tổng không đổi."]),
    F("5", "集金の一覧", ".tbl", "table", pattern="P-LIST", err=["I01"], vi="Danh sách thu tiền",
      detail=["1行＝1回の現金の集金（完了した配送の報告のうち、現金の集金があるもの）。初期の並びは回収日の新しい順（同じ日は配送データの昇順）。1ページ 10件（10／20／50／100）。0件は I01「表示するデータがありません。」。状態（未請求／請求済／入金済）の列は持たない。行を押しても詳細へは移らない。",
              "1 dòng = 1 lần thu tiền mặt (trong các báo cáo giao hàng đã hoàn thành, những báo cáo có thu tiền mặt). Thứ tự mặc định là ngày thu mới nhất trước (cùng ngày thì dữ liệu giao hàng tăng dần). 10 dòng/trang (10／20／50／100). 0 dòng là I01 「表示するデータがありません。」. Không có cột trạng thái (chưa yêu cầu／đã yêu cầu／đã nhận). Bấm vào dòng không chuyển sang chi tiết."]),
    F("5.1", "No", ".tbl th::No", "label", vi="STT", detail=["通し番号。", "Số thứ tự."]),
    F("5.2", "回収日", ".tbl th::回収日", "label", len="日付 yyyy-mm-dd", vi="Ngày thu", detail=["ドライバーが配送を完了した日（配送の報告の完了日時の日付）。納品日ではないので、期間の端の行は回収日が期間の外になることがある。", "Ngày tài xế hoàn thành giao hàng (ngày của thời điểm hoàn thành trong báo cáo giao hàng). Không phải ngày giao nên dòng ở biên kỳ có thể có ngày thu nằm ngoài kỳ."]),
    F("5.3", "配送データ", ".tbl th::配送データ", "label", len="文字列", vi="Dữ liệu giao hàng", detail=["配送データのID（等幅）。", "ID của dữ liệu giao hàng (chữ monospace)."]),
    F("5.4", "法人名", ".tbl th::法人名", "label", vi="Tên pháp nhân", detail=["法人名。下の行に小さく法人ID。長い名前は折り返す（10文字ぶんの幅まで）。", "Tên pháp nhân. Dòng dưới có ID pháp nhân nhỏ. Tên dài thì xuống dòng (độ rộng tối đa khoảng 10 ký tự)."]),
    F("5.5", "拠点名", ".tbl th::拠点名", "label", vi="Tên chi nhánh", detail=["拠点名。下の行に小さく拠点ID。長い名前は折り返す。", "Tên chi nhánh. Dòng dưới có ID chi nhánh nhỏ. Tên dài thì xuống dòng."]),
    F("5.6", "配送会社", ".tbl th::配送会社", "label", vi="Công ty giao hàng",
      detail=["回収したドライバーの所属先の配送会社の名前。下に小さく配送会社ID（DE＋5桁）。自社のドライバーは「ES 自社」（DE00000）。どの会社のドライバーが回収したかをこの列で見分ける（hong 2026-10-08）。",
              "Tên công ty giao hàng mà tài xế đã thu tiền trực thuộc. Bên dưới có ID công ty giao hàng nhỏ (DE + 5 chữ số). Tài xế nội bộ là 「ES 自社」 (DE00000). Cột này giúp biết tài xế của công ty nào đã thu tiền (hong 2026-10-08)."]),
    F("5.7", "ドライバー", ".tbl th::ドライバー", "label", vi="Tài xế", detail=["回収したドライバーの名前。下に小さくドライバーID（DR＋5桁。検索で当たるID）。名前が引けないときは名前の位置にもIDを出す。", "Tên tài xế đã thu tiền. Bên dưới có ID tài xế nhỏ (DR + 5 chữ số, ID dùng để tìm kiếm). Khi không tra được tên thì cũng hiển thị ID ở vị trí tên."]),
    F("5.8", "回収予定額（税込）", ".tbl th::回収予定額", "label", len="金額（円・税込）", vi="Số tiền dự kiến thu (gồm thuế)", detail=["アプリの現金支払いの回収予定額。右寄せ。", "Số tiền dự kiến thu của thanh toán tiền mặt trên app. Căn phải."]),
    F("5.9", "実際の回収額（税込）", ".tbl th::実際の回収額", "label", len="金額（円・税込）", vi="Số tiền thực tế đã thu (gồm thuế)", detail=["ドライバーが入れた回収額。右寄せ。", "Số tiền tài xế đã nhập. Căn phải."]),
    F("5.10", "差額（税込）", ".tbl th::差額", "label", len="金額（円・税込・符号つき）", vi="Chênh lệch (gồm thuế)",
      detail=["回収予定 − 実際の回収（不足はプラス）。0でない行は赤字で、プラスのときは「+」を付ける。符号の下に小さく「不足」（プラス）か「過多」（マイナス）を添える（色だけで伝えない）。右寄せ。見出しは「差額（税込）」。",
              "Dự kiến thu − thực tế đã thu (thiếu là số dương). Dòng khác 0 hiển thị chữ đỏ, khi dương thì thêm dấu 「+」. Bên dưới dấu có chữ nhỏ 「不足」 (dương) hoặc 「過多」 (âm) (không chỉ truyền đạt bằng màu). Căn phải. Tiêu đề là 「差額（税込）」."]),
    F("5.11", "メモ", ".tbl th::メモ", "label", len="文字列", vi="Ghi chú",
      detail=["ドライバーが集金の報告に書いたメモ（最大500文字）。なければ空欄。列の幅は12文字ぶんまでで、長いときは「…」で省略し、マウスを載せると全文が出る。", "Ghi chú tài xế viết trong báo cáo thu tiền (tối đa 500 ký tự). Nếu không có thì để trống. Độ rộng cột tối đa khoảng 12 ký tự, dài hơn thì rút gọn bằng 「…」 và hiện toàn văn khi rê chuột."]),
    F("6", "ページ送り", ".pager", "area", pattern="P-LIST", vi="Phân trang",
      detail=["「n件中 a–b件」・ページ番号・表示件数（10／20／50／100）。検索で1ページ目に戻る。", "「n件中 a–b件」・số trang・số dòng hiển thị (10／20／50／100). Tìm kiếm sẽ quay về trang 1."]),
    F("7", "この画面で運営ができること", "-", "label", vi="Những việc vận hành làm được trên màn hình này",
      detail=["参照のみ・編集不可の画面で、物流を含む全役割が R（hong 2026-10-08・台帳 F「集金管理は参照のみ…」）。見る・検索する・並べ替える・CSVを出すだけ。値を直す・集金を取り消す・状態を付ける操作はない。登録・編集・削除の操作がないので、権限は実質 R（閲覧と CSV 出力）だけ。",
              "Màn hình chỉ tham chiếu, không sửa được, tất cả vai trò kể cả logistics là R (hong 2026-10-08・sổ cái F 「集金管理は参照のみ…」). Chỉ xem・tìm kiếm・sắp xếp・xuất CSV. Không có thao tác sửa giá trị・hủy thu tiền・gán trạng thái. Vì không có thao tác đăng ký・sửa・xóa nên quyền thực chất chỉ là R (xem và xuất CSV)."]),
]
L2 = [
    F("9", "絞り込み後の表示", ".tbl", "table", pattern="P-LIST", vi="Hiển thị sau khi lọc",
      detail=["条件に合う行だけを出し、合計も同じ条件で数え直す。差額＝差額ありを選ぶと、回収予定と回収額が違う行だけになる。",
              "Chỉ hiển thị các dòng khớp điều kiện, tổng cũng được tính lại theo cùng điều kiện. Chọn chênh lệch = 差額あり thì chỉ còn các dòng có dự kiến thu khác số đã thu."]),
]
L3 = [
    F("10", "CSV出力のトースト", ".toast", "toast", "show", err=["S12"], vi="Thông báo (toast) xuất CSV",
      detail=["出力できたら S12「CSVを出力しました（{n}行・{ファイル名}）。」。ファイル名＝画面名「集金管理」＋条件＋日時。0件のときは出力しない。",
              "Khi xuất xong hiển thị S12 「CSVを出力しました（{n}行・{ファイル名}）。」. Tên tệp = tên màn hình 「集金管理」 + điều kiện + ngày giờ. Không xuất khi 0 dòng."]),
]
L5 = [
    F("12", "並べ替え後の表示", ".tbl", "table", pattern="P-LIST", vi="Hiển thị sau khi sắp xếp",
      detail=["「並べ替え」のメニューで項目と向きを変えると、表の行がその順に並ぶ。ページは1ページ目に戻る。検索条件・合計は変わらない。", "Khi đổi mục và chiều trong menu 「並べ替え」, các dòng của bảng được xếp theo thứ tự đó. Trang quay về trang 1. Điều kiện tìm kiếm và tổng không đổi."]),
]
L6 = [
    F("13", "読み込み失敗", "-", "label", err=["W141"], vi="Tải lỗi",
      detail=["読み込みの通信に失敗したとき、表の中に W141（{対象}＝集金管理の一覧）と「再読み込み」を出す。押すと読み込み直す。合計の4つは「—」にする（0件・0円と区別する）。読み込み中は表に「読み込み中…」、合計は「—」。",
              "Khi kết nối tải dữ liệu thất bại, hiển thị W141 ({đối tượng} = danh sách quản lý thu tiền) và nút 「再読み込み」 trong bảng. Bấm để tải lại. 4 mục tổng hiển thị 「—」 (phân biệt với 0 dòng・0 yên). Khi đang tải: bảng hiện 「読み込み中…」, tổng hiện 「—」."]),
]
L4 = [
    F("11", "0件", ".tbl tbody", "label", err=["I01"], vi="0 dòng",
      detail=["条件に合う行がないとき、表の中に I01 を出す。合計は 0 件・0円。現金の集金がない月は月の選択肢に出ないので、0件になるのは、ほかの条件（法人・拠点・配送会社・ドライバー・差額）に合う行がないとき。",
              "Khi không có dòng nào khớp điều kiện, hiển thị I01 trong bảng. Tổng là 0 dòng・0 yên. Tháng không có thu tiền mặt không có trong lựa chọn tháng nên 0 dòng chỉ xảy ra khi không có dòng khớp các điều kiện khác (pháp nhân・chi nhánh・công ty giao hàng・tài xế・chênh lệch)."]),
]

VIEWS = [
    ST("001", "AW_COLL_001", ["初期表示（対象月＝2026-10）", "Hiển thị ban đầu (tháng đối tượng = 2026-10)"],
       ["フル権限（Ad00010）で表示。対象月＝2026-10。見本に現金の集金があるかどうかで行の数が変わる（見本は拠点 CU00871 だけが現金利用。回収予定＝回収額のため差額は 0）。",
        "Hiển thị với toàn quyền (Ad00010). Tháng đối tượng = 2026-10. Số dòng thay đổi tùy dữ liệu mẫu có thu tiền mặt hay không (dữ liệu mẫu chỉ chi nhánh CU00871 dùng tiền mặt. Dự kiến thu = đã thu nên chênh lệch bằng 0)."], L1),
    ST("002", "AW_COLL_001", ["絞り込み（ドライバー＝山口・差額あり）", "Lọc (tài xế = 山口・có chênh lệch)"],
       ["キーワードに「山口」を入れて検索した状態。",
        "Trạng thái đã nhập 「山口」 vào tài xế, chọn chênh lệch là 「差額あり」 rồi tìm kiếm."], L2,
       setup=H + "setv(document.querySelector('input[placeholder^=\"法人名・ID\"]'),'山口');await wait(200);" + SUBMIT, wait=500),
    ST("003", "AW_COLL_001", ["CSV出力", "Xuất CSV"],
       ["「CSV出力」を押した直後。", "Ngay sau khi bấm 「CSV出力」."], L3,
       setup=H + "[...document.querySelectorAll('.ph .btns button')].find(b=>b.textContent.includes('CSV')).click();await wait(700);", wait=300),
    ST("004", "AW_COLL_001", ["0件（条件に合う行がない）", "0 dòng (không có dòng khớp điều kiện)"],
       ["キーワードに、どの名前にも合わない語（例「存在しない」）を入れて検索した状態。合計は 0件・0円。", "Trạng thái tìm kiếm bằng từ khóa không khớp tên nào (vd. 「存在しない」). Tổng là 0 dòng・0 yên."], L4,
       setup=H + "setv(document.querySelector('input[placeholder^=\"法人名・ID\"]'),'存在しない');await wait(200);" + SUBMIT, wait=500),
    ST("005", "AW_COLL_001", ["並べ替え中（配送会社の降順）", "Đang sắp xếp (công ty giao hàng giảm dần)"],
       ["「並べ替え」を押して、メニューで「降順」と「配送会社」を選んだ状態（メニューを開き直して、選択中の表示も見える）。", "Trạng thái bấm 「並べ替え」 rồi chọn 「降順」 và 「配送会社」 trong menu (mở lại menu để thấy mục đang chọn)."], L5,
       setup=H + "document.querySelector('button[aria-label=\"並べ替え\"]').click();await wait(200);[...document.querySelectorAll('.sortmenu button')].find(b=>b.textContent.trim()==='降順').click();await wait(150);[...document.querySelectorAll('.sortmenu button')].find(b=>b.textContent.trim()==='配送会社').click();await wait(300);document.querySelector('button[aria-label=\"並べ替え\"]').click();await wait(300);", wait=300),


    ST("006", "AW_COLL_001", ["読み込めませんでした（W141）", "Không tải được (W141)"],
       ["【撮影不可】通信の失敗は見本のデータでは再現できない。画面は表の中に W141 と「再読み込み」、合計は「—」。", "【Không chụp được】Lỗi kết nối không tái hiện được bằng dữ liệu mẫu. Màn hình hiển thị W141 và 「再読み込み」 trong bảng, tổng là 「—」."], L6),
]
