# -*- coding: utf-8 -*-
"""
画面設計書のデータ：運営管理者Web ＞ メニュー管理 ＞ 資材注文管理（一覧・詳細・新規登録・編集）  Screen Code AW_MORD_001〜003
元：本物の Web（app/ops/menu/materials/**、app/ops/menu/_components/MatDetail.tsx・es.tsx、lib/ops/menu/*（matError・nextDue・histOf）、lib/ops/areas/menu.ts、lib/domain/areas/delivery.ts）。
決定：docs/決定台帳.md H「資材の注文」・B「資材の無料の数量」・E「法人Web 商品注文・資材注文の細かい点」（⑥お試しは資材注文できない）・K「一覧の決まり」・
      E「運営の権限の読み方」「保存エラーの出し方」「入力中に画面を離れるときの確認」・M-1、受付簿 No.154（発送日・送り状番号）、仕様 docs/01_仕様/50_注文/注文.md §9・§10。
確認メモ：docs/05_画面設計書/確認メモ_注文_商品注文・資材注文・AI注文.md（Q-M1〜。2026-10-06 hong 回答済み＝受付簿 No.241。残る `open` はお客様への確認だけ）。
コードは決定に合わせて直し済み（2026-10-06・受付簿 #260〜#262・#276・#277・#279）。demo_ok は変更履歴の3列（Q-O5）だけ。
番号は画面ごとに通し（AW_MORD_001＝001〜002、AW_MORD_002＝003〜006、AW_MORD_003＝007〜011）。
"""

TITLE = ["資材注文管理（AW_MORD）", "Quản lý đơn hàng vật tư (AW_MORD)"]
SHEET = ["資材注文管理", "Quản lý đơn hàng vật tư"]
BASENAME = "画面設計書_AW_MORD_資材注文管理"
IMG_PREFIX = "AW_MORD"
OUT_DIR = "AW_MORD_資材注文管理"
CODE_NOTE = ["画面コードは規約 <Module(2)>_<Feature(4)>_<Seq(3)>（docs/01_仕様/画面コード規約_20261005.md）。AW＝運営管理者Web、MORD＝資材注文管理（Material ORDer）。001 一覧・002 詳細・003 新規登録・編集", "Mã màn hình theo quy ước <Module(2)>_<Feature(4)>_<Seq(3)> (docs/01_仕様/画面コード規約_20261005.md). AW = Web quản trị vận hành, MORD = quản lý đơn hàng vật tư (Material ORDer). 001 Danh sách, 002 Chi tiết, 003 Đăng ký mới/Chỉnh sửa"]
SITE = "ops"
SYSTEM = {"ja": "運営管理者Web", "vi": "Web quản trị vận hành"}
AUTHOR = "Claude（cloud）／確認：hong"
CREATED = "2026-10-06"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "ops", "loginId": "Ad00010"}   # フル権限（ops.full）。見本：中村幸子
CODE_PATHS = ["app/ops/menu/menu.css", "app/ops/menu/materials", "app/ops/menu/_components", "lib/ops/menu", "lib/ops/areas/menu.ts", "lib/domain/areas/delivery.ts", "lib/domain/matOrder.ts", "lib/domain/seed"]
HIDE_ALWAYS = [".es-demo-bar", ".es-chatbot", ".es-chatbot__fab", "#es-review"]
STATIC_CSS = ".gnav{position:static!important}#foot{position:relative!important}"
VIEWER_CSS = ".gnav{position:static!important}"


def J(s):
    return [s, ""]


def I(no, ja, sel, kind="label", trig="view", **kw):
    d = {"no": no, "ja": ja, "vi": "", "sel": sel, "kind": kind, "trig": trig}
    for k in ("detail", "init", "cond", "valid", "chk", "open", "demo_ok"):
        if isinstance(kw.get(k), str):
            kw[k] = J(kw[k])
    if isinstance(kw.get("ex"), str):
        kw["ex"] = J(kw["ex"])
    d.update(kw)
    return d


DECISIONS = [
    {"date": "2026-10-01", "target": "AW_MORD_003 No.3／AW_MORD_002 No.3.14",
     "q": ["資材の注文の回数と料金", "Số lần đặt vật tư và phí"],
     "a": ["いつでも注文できる（注文ごとに資材便の配送データ）。サイクル月に1回までは料金に含み、2回目からは OP000036「資材の追加配送（単発・1回）」【仮 ¥2,000／回】。初期セット（無料）は回数に数えない", "Đặt được bất cứ lúc nào (mỗi đơn có một dữ liệu giao hàng chuyến vật tư). Trong 1 tháng chu kỳ, lần đầu đã nằm trong phí, từ lần thứ 2 tính OP000036 \"Giao thêm vật tư (một lần)\" [Tạm 2,000 yên/lần]. Bộ khởi đầu (miễn phí) không tính vào số lần"],
     "src": "台帳 H「資材の注文」・注文.md §9-1・9-2"},
    {"date": "2026-10-05", "target": "AW_MORD_002 No.6（発送日・送り状番号）",
     "q": ["運営が資材便の発送日・送り状番号を入れるか", "Vận hành có nhập ngày gửi/số vận đơn của chuyến vật tư không"],
     "a": ["運営が資材注文管理で送り状番号・発送日を入れ、リードタイム（契約の配送区分（資材）の値・いまは未設定で2日が仮）から法人Web の資材注文にお届け予定日を出す", "Vận hành nhập số vận đơn và ngày gửi ở quản lý đơn hàng vật tư, rồi hiện ngày giao dự kiến cho đơn vật tư trên Web pháp nhân dựa trên thời gian chuẩn bị (giá trị của loại giao hàng (vật tư) của hợp đồng; hiện chưa đặt nên tạm 2 ngày)"],
     "src": "受付簿 No.154・台帳 E「法人Web 版 1.0 のレビュー（商品注文・資材注文・注文履歴）」⑩"},
    {"date": "2026-10-05", "target": "AW_MORD_003（拠点の選択肢）",
     "q": ["お試しの拠点は資材注文できるか", "Điểm giao dùng thử có đặt được vật tư không"],
     "a": ["法人Web では、お試しの拠点は資材注文できない（参照のみ）", "Trên Web pháp nhân, điểm giao dùng thử không đặt được vật tư (chỉ xem)"],
     "src": "台帳 E「法人Web 商品注文・資材注文の細かい点」⑥（運営の代理登録の扱いは確認メモ Q-M2 で確認中）"},
    {"date": "2026-10-05", "target": "AW_MORD_001・002・003",
     "q": ["運営の権限（オーダー管理）", "Quyền của vận hành (quản lý đơn hàng)"],
     "a": ["フル権限＝CRUD、営業・CS＝CRUD、商品開発＝R/U、経理・商品管理・物流＝R。新規登録は作成（C）、取消は削除（D）、編集・発送日の保存は更新（U）の権限", "Toàn quyền = CRUD, Kinh doanh/CS = CRUD, Phát triển sản phẩm = R/U, Kế toán/Quản lý sản phẩm/Logistics = R. Đăng ký mới là quyền tạo (C), hủy là quyền xóa (D), chỉnh sửa và lưu ngày gửi là quyền cập nhật (U)"],
     "src": "運営Web_権限表_20261003「オーダー管理」・台帳 E「運営の権限の読み方」・lib/ops/apiPerm.ts"},
    {"date": "2026-10-05", "target": "AW_MORD_001 No.2・AW_MORD_002 No.5",
     "q": ["資材便の配送と出荷指示", "Giao hàng chuyến vật tư và chỉ thị xuất hàng"],
     "a": ["資材は食品の便と一緒に送らない（資材便：ES事務所からヤマトで直送）。資材の注文を確定するたびに配送データ（資材便）を作る。出荷指示CSV・送り状用CSVは配送管理で出す", "Vật tư không gửi chung với chuyến thực phẩm (chuyến vật tư: gửi thẳng bằng Yamato từ văn phòng ES). Mỗi lần xác định đơn vật tư thì tạo dữ liệu giao hàng (chuyến vật tư). CSV chỉ thị xuất hàng và CSV phiếu vận chuyển xuất ở quản lý giao hàng"],
     "src": "台帳 L「資材の在庫と便」・H「資材の注文」"},
    {"date": "2026-10-05", "target": "全画面",
     "q": ["入力中に画面を離れるときの確認・保存エラーの出し方・一覧の決まり", "Xác nhận khi rời màn hình đang nhập, cách hiển thị lỗi khi lưu, quy tắc danh sách"],
     "a": ["離れるときは Q02（全サイト）。保存エラーは項目の下の文言（インライン）。一覧は10件ずつ・並べ替えは全列", "Khi rời đi dùng Q02 (toàn site). Lỗi khi lưu là câu chữ dưới mục (inline). Danh sách 10 mục mỗi trang, sắp xếp theo mọi cột"],
     "src": "台帳 E「入力中に画面を離れるときの確認」「保存エラーの出し方」・K「一覧の決まり」"},
    {"date": "2026-10-06", "target": "AW_MORD_003 No.3.2・6.5",
     "q": ["資材の注文数の上限（Q-M1）", "Giới hạn số lượng đặt vật tư (Q-M1)"],
     "a": ["999（法人Web の資材注文と同じ）。入力の共通基準に「資材の注文数＝999」を足す（共通ファイルの宿題）", "999 (giống đơn vật tư của Web pháp nhân). Thêm \"số lượng đặt vật tư = 999\" vào chuẩn nhập chung (việc cần sửa của file chung)"],
     "src": "受付簿 No.241（確認メモ Q-M1 推奨 A）"},
    {"date": "2026-10-06", "target": "AW_MORD_003 No.2.1",
     "q": ["お試しの拠点を運営が代理登録できるか（Q-M2）", "Vận hành có đăng ký thay cho điểm giao dùng thử không (Q-M2)"],
     "a": ["できる（拠点の選択肢にお試しも出す）。法人Web は「ご希望はESキッチンへ」と案内している（I210）ので、運営が受ける", "Có (hiện cả điểm giao dùng thử trong lựa chọn). Web pháp nhân hướng dẫn \"Vui lòng liên hệ ESキッチン\" (I210) nên vận hành tiếp nhận"],
     "src": "受付簿 No.241（確認メモ Q-M2 推奨 A）"},
    {"date": "2026-10-06", "target": "AW_MORD_001 No.4.12／AW_MORD_003 No.1.2／AW_MORD_002 No.3.14",
     "q": ["同じサイクル月の2回目以降の資材注文（Q-M3）", "Đơn vật tư từ lần thứ 2 trong cùng tháng chu kỳ (Q-M3)"],
     "a": ["運営の新規登録でも、登録の前に法人Web と同じ確認（Q205・W210）を出す（回数の数え方も同じ）。一覧と詳細に「2回目以降」の目印を出す", "Khi vận hành đăng ký mới cũng hiện xác nhận giống Web pháp nhân (Q205, W210) trước khi đăng ký (cách đếm số lần cũng giống). Hiện dấu \"từ lần thứ 2\" ở danh sách và chi tiết"],
     "src": "受付簿 No.241（確認メモ Q-M3 推奨 A）・台帳 H「資材の注文」"},
    {"date": "2026-10-06", "target": "AW_MORD_002 No.6／AW_MORD_003 No.6.6・6.7",
     "q": ["発送日・送り状番号の入れ場所（Q-M4）", "Nơi nhập ngày gửi/số vận đơn (Q-M4)"],
     "a": ["編集の画面で入れる（詳細は表示だけ・保存ボタンは置かない：P-FORM）。出荷待でなくても、発送日・送り状番号だけ編集できる形で開く（取消は開かない）。資材明細・納品予定日の編集は出荷待だけ", "Nhập ở màn hình chỉnh sửa (chi tiết chỉ hiển thị, không có nút lưu: P-FORM). Dù không ở trạng thái chờ xuất hàng vẫn mở được để chỉ sửa ngày gửi và số vận đơn (đơn đã hủy thì không mở). Sửa chi tiết vật tư và ngày giao dự kiến chỉ khi đang chờ xuất hàng"],
     "src": "受付簿 No.241（確認メモ Q-M4 推奨 B）・受付簿 No.154"},
    {"date": "2026-10-06", "target": "AW_MORD_003 No.6.3",
     "q": ["納品予定日のチェック（Q-M5）", "Kiểm tra ngày giao dự kiến (Q-M5)"],
     "a": ["選べない日（休日マスタ・拠点の納品不可曜日・リードタイム未満）は止めず、警告の確認を出し、運営が確かめれば保存できる（台帳 L「配送の日付の移動」と同じ）", "Ngày không chọn được (master ngày nghỉ, thứ không giao của điểm giao, chưa đủ thời gian chuẩn bị) không bị chặn mà hiện xác nhận cảnh báo, vận hành đã kiểm tra thì lưu được (giống Sổ cái L \"Dời ngày giao\")"],
     "src": "受付簿 No.241（確認メモ Q-M5 推奨 C）"},
    {"date": "2026-10-06", "target": "AW_MORD_002 No.7",
     "q": ["資材注文の変更履歴の列（Q-O5）", "Các cột lịch sử thay đổi của đơn vật tư (Q-O5)"],
     "a": ["今の3列（変更日時・変更内容・変更者）のまま。資材の履歴は配送データのメモから作っており、項目・変更前後を持たない", "Giữ nguyên 3 cột hiện tại (ngày giờ thay đổi, nội dung thay đổi, người thay đổi). Lịch sử vật tư được tạo từ ghi chú của dữ liệu giao hàng nên không có mục và trước/sau thay đổi"],
     "src": "受付簿 No.241（確認メモ Q-O5 推奨 B）"},
    {"date": "2026-10-06", "target": "AW_MORD_001 No.4.12・002 No.3.14・003 No.2.1・6.6〜6.8・取消（受付簿 #277）",
     "q": ["資材の「何回目」の数え方・発送日と送り状番号を入れる役割・お試しの追加配送料・取消済みの扱い", "Cách đếm \"lần thứ mấy\" của vật tư, vai trò nhập ngày gửi và số vận đơn, phí giao thêm của điểm giao dùng thử, cách xử lý đơn đã hủy"],
     "a": ["①納品予定日のサイクル月で数える（取り消したら次が繰り上がる。請求済みの月は請求調整）②発送日・送り状番号を入れるのはシステム管理（物流に更新権限は足さない）③お試し拠点の資材は追加配送料（OP000036）を付けない ④取消済みの注文は参照のみ（編集・取消を出さない）。編集の保存には、お客様へ知らせるかを選ぶチェックを足す（代替品設定と同じ）", "(1) Đếm theo tháng chu kỳ của ngày giao dự kiến (khi hủy thì đơn kế tiếp đẩy lên; tháng đã xuất hóa đơn thì điều chỉnh hóa đơn). (2) Quản trị hệ thống nhập ngày gửi và số vận đơn (không thêm quyền cập nhật cho Logistics). (3) Vật tư của điểm giao dùng thử không tính phí giao thêm (OP000036). (4) Đơn đã hủy chỉ để xem (không hiện sửa・hủy). Khi lưu chỉnh sửa thêm ô chọn có báo cho khách hay không (giống thiết lập sản phẩm thay thế)"],
     "src": "hong 回答 2026-10-06（レビュー A21・A23・A24・A25）・台帳 E・H・受付簿 #277（A25 は「提案どおり」の読み）"},
    {"date": "2026-10-07", "target": "AW_MORD_003 No.3.3・6.8（お客様へ知らせる・受付簿 #282 ②）",
     "q": ["「お客様へ知らせる」チェックの初期値（資材注文の編集は ON だった・新規登録にはチェックがなかった）", "Giá trị ban đầu của ô \"Báo cho khách\" (khi sửa đơn vật tư là ON, đăng ký mới chưa có ô này)"],
     "a": ["すべての運営の画面で初期値は「チェックなし（知らせない）」にそろえる。資材注文は新規登録の保存にもチェックを足す（チェックしたときだけお知らせを作る）", "Thống nhất giá trị ban đầu ở mọi màn hình vận hành là \"không tích (không báo)\". Đơn vật tư thêm ô tích cả khi lưu đăng ký mới (chỉ khi tích mới tạo thông báo)"],
     "src": "hong 回答 2026-10-07・受付簿 #282 ②・台帳 H「運営が代理で注文を登録・変更するときの法人へのお知らせ」"},
    {"date": "2026-10-06", "target": "リードタイムの言い方（受付簿 #262）",
     "q": ["編集の画面の「出荷予定日（2日前）」をどう書くか", "Câu \"ngày xuất hàng dự kiến (2 ngày trước)\" ở màn hình chỉnh sửa nên viết thế nào"],
     "a": ["「リードタイム分前（契約の配送区分（資材）の値。いまは2日で仮）」。固定の日数を書かない", "\"Trước đúng số ngày thời gian chuẩn bị (giá trị của loại giao hàng (vật tư) trong hợp đồng; hiện tạm 2 ngày)\". Không ghi số ngày cố định"],
     "src": "受付簿 #262・レビュー A22・B 全件承認（2026-10-06）"},
]

CHANGES = []

SCREENS = [
    {"code": "AW_MORD_001", "ja": "資材注文管理（一覧）", "vi": "Quản lý đơn hàng vật tư (danh sách)"},
    {"code": "AW_MORD_002", "ja": "資材注文詳細", "vi": "Chi tiết đơn hàng vật tư"},
    {"code": "AW_MORD_003", "ja": "資材注文の新規登録・編集", "vi": "Đăng ký mới/chỉnh sửa đơn hàng vật tư"},
]

W = lambda ms: "await new Promise(r=>setTimeout(r,%d));" % ms
CLICKB = lambda txt, ms=500: "{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.trim()==='%s');b&&b.click();}%s" % (txt, W(ms))
MO_WAIT = "MO-2610-0013"    # 大阪支店（CU00871）の今サイクル2回目の資材注文・出荷待
MO_WAIT1 = "MO-2610-0012"   # 本社（CU00643）・出荷待
MO_DONE = "MO-2609-0029"    # 大阪支店・納品済（送り状あり）
RESET = "await fetch('/api/dev/reset',{method:'POST',credentials:'include'});"
MO_INIT = "MO-2605-0004"    # 初期セット（自動作成）・納品済
JS = ("const sleep=ms=>new Promise(r=>setTimeout(r,ms));"
      "const setv=(el,v)=>{const p=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:el.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype;"
      "Object.getOwnPropertyDescriptor(p,'value').set.call(el,v);el.dispatchEvent(new Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}));};"
      "const q=s=>document.querySelector(s);")
SELSITE = lambda cid: "setv(q('.od-g4 select'),'%s');" % cid   # 新規登録：拠点を選ぶ
SETQ5 = "setv(q('.od-step input'),'5');"                           # 最初の資材の注文数を5にする
POST = "const post=(u,a)=>fetch(u,{method:'POST',credentials:'include',headers:{'Content-Type':'application/json','x-es-site':'ops'},body:JSON.stringify({args:a})}).then(r=>r.json());"

VIEWS = [
    # ================================================================ AW_MORD_001 一覧
    {"id": "001", "code": "AW_MORD_001", "state": ["初期表示", "Hiển thị ban đầu"],
     "url": "/ops/menu/materials", "full": True, "wait": 900, "setup": "",
     "note": ["資材注文の一覧（1件＝1つの資材便の配送データ）。初期の並びは注文日時の降順（台帳 F の既定：更新日時の降順に近い）", "Danh sách đơn vật tư (1 mục = dữ liệu giao hàng của 1 chuyến vật tư). Thứ tự ban đầu là ngày giờ đặt giảm dần (mặc định Sổ cái F: gần với cập nhật mới nhất)"],
     "items": [
         I("1", "ヘッダー", ".es-pagehead", "area", "view", vi="Tiêu đề trang"),
         I("1.1", "CSV出力", ".es-pagehead__actions button::CSV出力", "button", "click", pattern="P-CSV-OUT",
           detail=["検索条件の全件を出す（検索・配送状態・注文区分・コース・納品予定日）。列：資材注文No・注文区分・法人名・拠点ID・拠点名・注文日時・納品予定日・配送データ・配送状態・法人ID・納品先住所・注文者・送り状番号・発送日・出荷指示の日時（台帳 M-1「全部のデータを CSV で出せる」）。1行＝資材の1行（資材ごと。注文の項目をくり返す）。閲覧できる役割すべてに出す", "Xuất toàn bộ theo điều kiện tìm kiếm (tìm kiếm, trạng thái giao hàng, phân loại đơn, khóa học, ngày giao dự kiến). Cột: số đơn vật tư, phân loại đơn, tên pháp nhân, ID điểm giao, tên điểm giao, ngày giờ đặt, ngày giao dự kiến, dữ liệu giao hàng, trạng thái giao hàng, ID pháp nhân, địa chỉ nơi giao, người đặt, số vận đơn, ngày gửi, ngày giờ chỉ thị xuất hàng (Sổ cái M-1 \"Xuất được toàn bộ dữ liệu bằng CSV\"). 1 dòng = 1 dòng vật tư (theo từng vật tư, lặp lại các mục của đơn). Hiện cho mọi vai trò xem được"], vi="Xuất CSV"),
         I("1.2", "新規登録", ".es-pagehead__actions button::新規登録", "button", "click",
           detail=["資材注文の新規登録（AW_MORD_003）へ。運営が代理で登録する（お客様から電話で依頼があったときなど）", "Sang đăng ký mới đơn vật tư (AW_MORD_003). Vận hành đăng ký thay (ví dụ khi khách gọi điện nhờ)"],
           cond=["作成（C）の権限がある役割だけに出す（オーダー管理 営業・CS・フル権限）", "Chỉ hiện cho vai trò có quyền tạo (C) (Quản lý đơn hàng: Kinh doanh, CS, Toàn quyền)"], vi="Đăng ký mới"),
         I("2", "状態の案内", ".es-card .es-inline--info", "area", "view",
           detail=["青の案内「状態は資材便の配送データから表示します」：資材の注文を確定するたびに配送データ（資材便）を作る。出荷指示CSV（THOMAS）・送り状用CSV（ヤマト）は「配送管理 ＞ 出荷・配送管理 ＞ 出荷指示・取込」で出す。ピッキングは倉庫で行うため、この画面では記録しない。資材はいつでも注文でき、納品予定日のサイクル月の1回目は料金に含み、2回目以降は「資材の追加配送」（OP000036）を子契約に付ける（初期セットは数えない・お試しの拠点には付けない）。決定の番号・金額は画面に書かない", "Khung xanh \"Trạng thái hiển thị từ dữ liệu giao hàng của chuyến vật tư\": mỗi lần xác định đơn vật tư thì tạo dữ liệu giao hàng (chuyến vật tư). CSV chỉ thị xuất hàng (THOMAS) và CSV phiếu vận chuyển (Yamato) xuất ở \"Quản lý giao hàng > Quản lý xuất/giao hàng > Chỉ thị xuất hàng/Nhập\". Việc lấy hàng làm ở kho nên màn hình này không ghi lại. Đặt vật tư được bất cứ lúc nào, lần 1 của tháng chu kỳ (theo ngày giao dự kiến) nằm trong phí, từ lần 2 gắn \"Giao thêm vật tư\" (OP000036) vào hợp đồng con (bộ khởi đầu không tính, điểm giao dùng thử không gắn). Không ghi số quyết định và số tiền trên màn hình"], vi="Thông báo về trạng thái"),
         I("3", "検索条件", ".es-search", "area", "view", pattern="P-LIST",
           detail=["es-search の枠（クリア・検索と並べ替えを右に置く）。初期の並びは注文日時の降順。ページ送りは 10／20／50件（初期10件）", "Khung es-search (Xóa, Tìm kiếm và sắp xếp đặt bên phải). Thứ tự ban đầu là ngày giờ đặt giảm dần. Phân trang 10/20/50 mục (ban đầu 10)"], vi="Điều kiện tìm kiếm"),
         I("3.1", "キーワード", ".es-search__fields input[placeholder^=資材注文No]", "text", "input", req="－", len="文字列 60",
           ex=["大阪支店", "Từ khóa tên điểm giao (ví dụ: chi nhánh Osaka)"], detail=["資材注文No・法人名・拠点名・拠点IDを部分一致で探す。前後の空白は取り、全角の英数字は半角に直す", "Tìm khớp một phần theo số đơn vật tư, tên pháp nhân, tên điểm giao, ID điểm giao. Bỏ khoảng trắng đầu cuối, đổi chữ/số toàn góc sang bán góc"], err=["E04"], vi="Từ khóa"),
         I("3.2", "配送状態", ".es-search__fields select[aria-label=配送状態]", "select", "select", req="－", len="選択",
           init=["（指定なし）", "(Không chỉ định)"], ex=["出荷待", "Trạng thái giao hàng (ví dụ: chờ xuất hàng)"], detail=["選択肢：出荷待／出荷指示済／出荷済／納品済／取消", "Lựa chọn: Chờ xuất hàng / Đã có chỉ thị xuất hàng / Đã xuất hàng / Đã giao / Hủy"], vi="Trạng thái giao hàng"),
         I("3.3", "注文区分", ".es-search__fields select[aria-label=注文区分]", "select", "select", req="－", len="選択",
           init=["（指定なし）", "(Không chỉ định)"], ex=["通常注文", "Phân loại đơn (ví dụ: đơn thường)"], detail=["選択肢：通常注文／初期セット。初期セット＝仮登録で自動作成した資材注文（無料・回数に数えない）", "Lựa chọn: Đơn thường / Bộ khởi đầu. Bộ khởi đầu = đơn vật tư tự tạo khi đăng ký tạm (miễn phí, không tính vào số lần)"], vi="Phân loại đơn"),
         I("3.4", "コース", ".es-search__fields select[aria-label=コース]", "select", "select", req="－", len="選択",
           init=["（指定なし）", "(Không chỉ định)"], ex=["ESライト（自販機）", "Tên khóa học (ví dụ: ES Light (máy bán hàng))"], detail=["選択肢：ESスタンダード／ESライト（冷蔵庫）／ESライト（自販機）。拠点のコースで絞る", "Lựa chọn: ES Standard / ES Light (tủ lạnh) / ES Light (máy bán hàng). Lọc theo khóa học của điểm giao"], vi="Khóa học"),
         I("3.5", "納品予定日（から）", "input[aria-label=納品予定日から]", "date", "input", req="－", len="日付", ex=["2026-10-01", "Ngày bắt đầu khoảng ngày giao dự kiến, dạng yyyy-mm-dd"],
           detail=["日付の部品（yyyy-mm-dd）。この日以降の納品予定日の注文だけ", "Bộ chọn ngày (yyyy-mm-dd). Chỉ các đơn có ngày giao dự kiến từ ngày này trở đi"], valid=["日付。終了より後にしない", "Ngày. Không được sau ngày kết thúc"], err=["E08"], vi="Ngày giao dự kiến (từ)"),
         I("3.6", "納品予定日（まで）", "input[aria-label=納品予定日まで]", "date", "input", req="－", len="日付", ex=["2026-10-31", "Ngày kết thúc khoảng ngày giao dự kiến, dạng yyyy-mm-dd"],
           detail=["この日以前の納品予定日の注文だけ。開始日以降の日付", "Chỉ các đơn có ngày giao dự kiến từ ngày này trở về trước. Ngày từ ngày bắt đầu trở đi"], valid=["日付。開始日以降", "Ngày. Từ ngày bắt đầu trở đi"], err=["E08"], vi="Ngày giao dự kiến (đến)"),
         I("3.7", "クリア", ".es-search__main button::クリア", "button", "click", detail=["条件をすべて外す。1ページ目へ", "Bỏ mọi điều kiện. Về trang 1"], vi="Xóa"),
         I("3.8", "検索", ".es-search__main button[type=submit]", "button", "click", detail=["条件を反映し、1ページ目へ。0件のときは I01（No.5）", "Áp dụng điều kiện, về trang 1. Khi 0 mục thì hiện I01 (No.5)"], vi="Tìm kiếm"),
         I("3.9", "並べ替え（項目）", "select[aria-label=並べ替えの項目]", "select", "select", req="－", len="選択",
           init=["注文日時", "Ngày giờ đặt"], ex=["納品予定日", "Tên cột dùng để sắp xếp (ví dụ: ngày giao dự kiến)"], detail=["一覧の全列から選ぶ。初期は注文日時の降順", "Chọn từ toàn bộ cột của danh sách. Ban đầu là ngày giờ đặt giảm dần"], vi="Sắp xếp (mục)"),
         I("3.10", "昇順／降順", ".es-sortbtn", "button", "click", init=["降順", "Giảm dần"], detail=["押すたびに昇順と降順を切り替える", "Mỗi lần bấm chuyển qua lại giữa tăng dần và giảm dần"], vi="Tăng dần / Giảm dần"),
         I("4", "一覧の表", ".od-tbl .es-table", "table", "view", pattern="P-LIST", detail=["1行＝資材注文1件（1つの資材便）。削除は置かない（誤りは「取消」で扱う：論理削除）", "1 dòng = 1 đơn vật tư (1 chuyến vật tư). Không có nút xóa (lỗi xử lý bằng \"Hủy\": xóa logic)"], vi="Bảng danh sách"),
         I("4.1", "No", ".od-tbl th::No", "label", "view", detail=["表示の通し番号（ページをまたいで続く）", "Số thứ tự hiển thị (liên tục qua các trang)"], vi="Số thứ tự"),
         I("4.2", "資材注文No", ".od-tbl th::資材注文No", "link", "click", detail=["例 MO-2610-0013（MO-＋年月4桁＋連番。システムが採番）。押すと資材注文詳細（AW_MORD_002）", "Ví dụ MO-2610-0013 (MO- + 4 chữ số năm-tháng + số thứ tự. Hệ thống cấp số). Bấm để sang chi tiết đơn vật tư (AW_MORD_002)"], vi="Số đơn vật tư"),
         I("4.3", "注文区分", ".od-tbl th::注文区分", "label", "view", detail=["バッジ：通常注文（灰）／初期セット（青系）", "Huy hiệu: Đơn thường (xám) / Bộ khởi đầu (tông xanh dương)"], vi="Phân loại đơn"),
         I("4.4", "法人名", ".od-tbl th::法人名", "label", "view", detail=["法人名", "Tên pháp nhân"], vi="Tên pháp nhân"),
         I("4.5", "拠点名", ".od-tbl th::拠点名", "label", "view", detail=["拠点名", "Tên điểm giao"], vi="Tên điểm giao"),
         I("4.6", "注文日", ".od-tbl th::注文日", "label", "view", detail=["注文日時の日付部分（yyyy-mm-dd）", "Phần ngày của ngày giờ đặt (yyyy-mm-dd)"], vi="Ngày đặt"),
         I("4.7", "納品予定日", ".od-tbl th::納品予定日", "label", "view", detail=["「yyyy-mm-dd(曜)」の形で出す（台帳 M-1）", "Hiển thị dạng \"yyyy-mm-dd(thứ)\" (Sổ cái M-1)"], vi="Ngày giao dự kiến"),
         I("4.8", "資材", ".od-tbl th::資材", "label", "view", detail=["「3種類・合計 150」。右寄せ", "\"3 loại, tổng 150\". Căn phải"], vi="Vật tư"),
         I("4.9", "配送データ", ".od-tbl th::配送データ", "label", "view", detail=["資材便の配送データID（例 DL-261006-0103）。取消は「—」。等幅", "ID dữ liệu giao hàng của chuyến vật tư (ví dụ DL-261006-0103). Đơn đã hủy là \"—\". Font đơn cách"], vi="Dữ liệu giao hàng"),
         I("4.10", "配送状態", ".od-tbl th::配送状態", "label", "view", detail=["バッジ：出荷待（灰）／出荷指示済（青）／出荷済（黄）／納品済（緑）／取消（赤）。資材便の配送データの状態から出す", "Huy hiệu: Chờ xuất hàng (xám) / Đã có chỉ thị xuất hàng (xanh dương) / Đã xuất hàng (vàng) / Đã giao (xanh lá) / Hủy (đỏ). Lấy từ trạng thái dữ liệu giao hàng của chuyến vật tư"], vi="Trạng thái giao hàng"),
         I("4.11", "操作（編集）", ".od-tbl .es-rowactions", "button", "click", detail=["鉛筆のアイコン。押すと編集（AW_MORD_003）。取消でなければ出す（出荷指示を送ったあとは、発送日・送り状番号だけ直せる）", "Biểu tượng bút chì. Bấm để sang chỉnh sửa (AW_MORD_003). Hiện nếu chưa hủy (sau khi gửi chỉ thị xuất hàng chỉ sửa được ngày gửi/số vận đơn)"],
           cond=["配送状態が取消でなく、更新（U）の権限がある役割だけに出す", "Chỉ hiện cho vai trò có quyền cập nhật (U) khi trạng thái giao hàng không phải hủy"], vi="Thao tác (chỉnh sửa)"),
         I("4.12", "2回目以降（料金）の目印", ".od-tbl td .es-badge::2回目", "label", "view",
           detail=["同じサイクル月の2回目以降（OP000036「資材の追加配送」がかかる）の資材注文に、「資材」の列の下へ「2回目」（3回目なら「3回目」）のバッジを出す（法人Web の「今月 n回目」と同じ数え方）。「何回目」は納品予定日のサイクル月で数える（注文日では数えない）。取消した注文は数えず、取り消したら次の注文が繰り上がる。請求済みの月は請求調整にする。お試しの拠点には出さない（OP000036 を付けないため）（受付簿 #277）", "Với đơn vật tư từ lần thứ 2 của cùng tháng chu kỳ (bị tính OP000036 \"Giao thêm vật tư\"), hiện huy hiệu \"Lần 2\" (lần 3 thì \"Lần 3\") dưới cột \"Vật tư\" (cách đếm giống \"lần thứ n trong tháng\" của Web pháp nhân). \"Lần thứ mấy\" đếm theo tháng chu kỳ của ngày giao dự kiến (không theo ngày đặt). Đơn đã hủy không đếm; khi hủy thì đơn kế tiếp được đẩy lên. Tháng đã xuất hóa đơn thì xử lý bằng điều chỉnh hóa đơn. Không hiện cho điểm giao dùng thử (vì không tính OP000036) (Sổ tiếp nhận #269)"], vi="Dấu hiệu từ lần thứ 2 (có phí)"),
         I("5", "ページ送り", ".es-pagination", "area", "view", detail=["「n件中 a–b件」・前へ・番号・次へ・表示件数（10／20／50）", "\"a–b / n mục\", Trước, số trang, Sau, số mục hiển thị (10/20/50)"], vi="Phân trang"),
     ]},

    {"id": "002", "code": "AW_MORD_001", "state": ["該当なし（0件）", "Không có dữ liệu (0 mục)"],
     "url": "/ops/menu/materials", "full": False, "wait": 900,
     "setup": "{const i=document.querySelector('.es-search__fields input[type=text]');if(i){const s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;s.call(i,'該当なしの検索語');i.dispatchEvent(new Event('input',{bubbles:true}));}}" + CLICKB("検索", 500),
     "note": ["キーワードに当てはまる資材注文がない状態", "Trạng thái không có đơn vật tư nào khớp từ khóa"],
     "items": [
         I("6", "0件の表示", ".mo-empty", "label", "show", err=["I01"],
           detail=["表の中に I01「表示するデータがありません。」を出す。ページ送りは 0件中 0–0件", "Hiện I01 \"Không có dữ liệu để hiển thị.\" trong bảng. Phân trang là 0–0 / 0 mục"], vi="Hiển thị 0 mục"),
     ]},

    # ================================================================ AW_MORD_002 詳細
    {"id": "003", "code": "AW_MORD_002", "state": ["詳細（出荷待）", "Chi tiết (chờ xuất hàng)"],
     "url": "/ops/menu/materials/" + MO_WAIT, "full": True, "wait": 900,
     "note": ["大阪支店のこのサイクル2回目の資材注文（出荷待）。取消・編集（発送日・送り状番号の入力も編集で行う）ができる。出荷指示を送る前の状態", "Đơn vật tư lần thứ 2 của chu kỳ này của chi nhánh Osaka (chờ xuất hàng). Có thể hủy, chỉnh sửa (nhập ngày gửi/số vận đơn cũng ở chỉnh sửa). Trạng thái trước khi gửi chỉ thị xuất hàng"],
     "items": [
         I("1", "ヘッダー", ".es-pagehead", "area", "view", vi="Tiêu đề trang"),
         I("1.1", "パンくず・タイトル", "h1.es-pagehead__title", "label", "view",
           detail=["「メニュー管理 / 資材注文管理 / 資材注文詳細」。タイトルは「資材注文詳細 MO-2610-0013」と配送状態のバッジ。「資材注文管理」を押すと一覧（AW_MORD_001）へ", "\"Quản lý menu / Quản lý đơn hàng vật tư / Chi tiết đơn hàng vật tư\". Tiêu đề là \"Chi tiết đơn hàng vật tư MO-2610-0013\" kèm huy hiệu trạng thái giao hàng. Bấm \"Quản lý đơn hàng vật tư\" để về danh sách (AW_MORD_001)"], vi="Breadcrumb và tiêu đề"),
         I("1.2", "取消", ".es-pagehead__actions button::取消", "button", "click", err=["Q118", "S14", "E31"],
           detail=["取消の確認（状態 006）を開く。出荷指示を送る前（出荷待）だけ取り消せる。配送データ（資材便）も取消になる。押したときにすでに出荷指示に拾い上げられていたら取り消せない（E31 を出して詳細を開き直す。「出荷指示を送る前だけ取り消せます」の案内は Q118 の文）", "Mở xác nhận hủy (trạng thái 006). Chỉ hủy được trước khi gửi chỉ thị xuất hàng (chờ xuất hàng). Dữ liệu giao hàng (chuyến vật tư) cũng bị hủy. Nếu lúc bấm đã được lấy vào chỉ thị xuất hàng thì không hủy được (hiện lỗi E31 và mở lại chi tiết; câu hướng dẫn \"chỉ hủy được trước khi gửi chỉ thị xuất hàng\" của Q118)"],
           cond=["配送状態が出荷待で、削除（D）の権限がある役割だけに出す（オーダー管理 営業・CS・フル権限。商品開発 R/U は出さない）", "Chỉ hiện cho vai trò có quyền xóa (D) khi trạng thái giao hàng là chờ xuất hàng (Quản lý đơn hàng: Kinh doanh, CS, Toàn quyền. Phát triển sản phẩm R/U không hiện)"], vi="Hủy"),
         I("1.3", "編集", ".es-pagehead__actions button::編集", "button", "click",
           detail=["資材注文の編集（AW_MORD_003）へ。出荷待のときは全部直せる。出荷待でないときは、発送日・送り状番号だけ直せる。取消済みの注文には編集を出さない（受付簿 #277）", "Sang chỉnh sửa đơn vật tư (AW_MORD_003). Khi chờ xuất hàng thì sửa được tất cả. Khi không chờ xuất hàng thì chỉ sửa được ngày gửi và số vận đơn. Không hiện nút sửa với đơn đã hủy (Sổ tiếp nhận #277)"],
           cond=["配送状態が取消でなく、更新（U）の権限がある役割だけに出す", "Chỉ hiện cho vai trò có quyền cập nhật (U) khi trạng thái giao hàng không phải hủy"], vi="Chỉnh sửa"),
         I("2", "進み具合の表示", ".mo-steps", "area", "view",
           detail=["「1 注文／2 出荷待／3 出荷指示済／4 出荷済／5 納品済」。いまの状態を強調、済んだ状態は ✓。取消のときは最後に赤の「× 取消」だけ強調して、ほかは灰色", "\"1 Đặt hàng / 2 Chờ xuất hàng / 3 Đã có chỉ thị xuất hàng / 4 Đã xuất hàng / 5 Đã giao\". Trạng thái hiện tại được nhấn mạnh, trạng thái đã xong có ✓. Khi hủy thì chỉ nhấn mạnh \"× Hủy\" màu đỏ ở cuối, các bước khác màu xám"], vi="Hiển thị tiến độ"),
         I("3", "オーダー基本情報", ".es-card::オーダー基本情報", "card", "view", ex=["大阪支店", "Tên điểm giao (ví dụ: chi nhánh Osaka)"], detail=["参照だけ。4列に並べる", "Chỉ xem. Xếp thành 4 cột"], vi="Thông tin cơ bản của đơn hàng"),
         I("3.1", "資材注文No", ".od-ro label::資材注文No", "label", "view", detail=["MO-＋年月4桁＋連番（等幅）", "MO- + 4 chữ số năm-tháng + số thứ tự (font đơn cách)"], vi="Số đơn vật tư"),
         I("3.2", "注文区分", ".od-ro label::注文区分", "label", "view", detail=["通常注文／初期セット", "Đơn thường / Bộ khởi đầu"], vi="Phân loại đơn"),
         I("3.3", "法人名", ".od-ro label::法人名", "label", "view", detail=["法人名", "Tên pháp nhân"], vi="Tên pháp nhân"),
         I("3.4", "法人ID", ".od-ro label::法人ID", "label", "view", detail=["CU＋5桁（等幅）", "CU + 5 chữ số (font đơn cách)"], vi="ID pháp nhân"),
         I("3.5", "拠点名", ".od-ro label::拠点名", "label", "view", detail=["拠点名", "Tên điểm giao"], vi="Tên điểm giao"),
         I("3.6", "拠点ID", ".od-ro label::拠点ID", "label", "view", detail=["CU＋5桁（等幅）", "CU + 5 chữ số (font đơn cách)"], vi="ID điểm giao"),
         I("3.7", "納品先住所", ".od-ro label::納品先住所", "label", "view", detail=["拠点の住所（2列分の幅）", "Địa chỉ của điểm giao (rộng 2 cột)"], vi="Địa chỉ nơi giao"),
         I("3.8", "注文日時", ".od-ro label::注文日時", "label", "view", detail=["yyyy-mm-dd HH:MM", "yyyy-mm-dd HH:MM"], vi="Ngày giờ đặt"),
         I("3.9", "注文者", ".od-ro label::注文者", "label", "view", detail=["注文したアカウントの名前（法人・拠点のアカウントか運営）。初期セットは「システム（仮登録で自動作成）」", "Tên tài khoản đã đặt (tài khoản pháp nhân/điểm giao hoặc vận hành). Bộ khởi đầu là \"Hệ thống (tự tạo khi đăng ký tạm)\""], vi="Người đặt"),
         I("3.10", "納品予定日", ".od-ro label::納品予定日", "label", "view", detail=["「yyyy-mm-dd(曜)」の形（AW_MORD_001 No.4.7 と同じ）", "Dạng \"yyyy-mm-dd(thứ)\" (giống AW_MORD_001 No.4.7)"], vi="Ngày giao dự kiến"),
         I("3.11", "出荷予定日", ".od-ro label::出荷予定日", "label", "view",
           detail=["納品予定日の、リードタイム日数だけ前（「2026-10-06(火)（リードタイム 2日）」）。資材便のリードタイム（出荷から納品までの日数）は、新しい項目を足さず、配送ルートの設定にある契約の配送区分（資材）のリードタイムを使う（親契約＝既定値・子契約＝その月の実際値・受付簿 #262）。いまは値が未設定のため2日で仮（初期値）。注文日のサイクルの子契約の値を使う。", "Trước ngày giao dự kiến đúng số ngày thời gian chuẩn bị (\"2026-10-06(Thứ Ba) (thời gian chuẩn bị 2 ngày)\"). Thời gian chuẩn bị của chuyến vật tư (số ngày từ xuất hàng đến giao) không thêm mục mới mà dùng thời gian chuẩn bị của loại giao hàng (vật tư) của hợp đồng trong thiết lập tuyến giao hàng (hợp đồng cha = giá trị mặc định, hợp đồng con = giá trị thực tế của tháng đó; 受付簿 #262). Hiện chưa đặt giá trị nên tạm 2 ngày (giá trị ban đầu)."],
           vi="Ngày xuất hàng dự kiến"),
         I("3.12", "ピッキング倉庫", ".od-ro label::ピッキング倉庫", "label", "view", detail=["資材は ES事務所とすべてのピッキング倉庫で在庫を持つ（台帳 L）。拠点のピッキング倉庫を出す", "Vật tư có tồn kho ở văn phòng ES và mọi kho lấy hàng (Sổ cái L). Hiện kho lấy hàng của điểm giao"], vi="Kho lấy hàng"),
         I("3.13", "配送会社", ".od-ro label::配送会社", "label", "view", detail=["「ヤマト運輸（資材便・直送）」。資材は食品の便と一緒に送らない（台帳 L）。固定の表示", "\"Yamato Transport (chuyến vật tư, gửi thẳng)\". Vật tư không gửi chung với chuyến thực phẩm (Sổ cái L). Hiển thị cố định"], vi="Công ty vận chuyển"),
         I("3.14", "料金（税抜）", ".od-ro label::料金", "label", "view",
           detail=["初期セットは「無料（初期セット）」。通常注文は、同じサイクル月の1回目＝「料金に含む」、2回目以降＝「資材の追加配送（OP000036）」の金額（税抜）。画面は「資材の追加配送（OP000036）2,000円（税抜）・今月 2回目」と出す（金額はオプションマスタの値）。無料の数量を超えた分は資材マスタの価格・税率で請求（台帳 B）。2回目以降の注文には「今月 n回目」も出す（法人Web の I222／W210 と同じ）。「何回目」は納品予定日のサイクル月で数える（取り消したら繰り上がる・請求済みの月は請求調整）。お試しの拠点の資材注文には OP000036 を付けない（受付簿 #277）。OP000036 の金額は【仮】2,000円／回のまま。正式な金額は hong があとで設定する（受付簿 #261）", "Bộ khởi đầu là \"Miễn phí (bộ khởi đầu)\". Đơn thường: lần 1 của cùng tháng chu kỳ = \"đã nằm trong phí\", từ lần 2 = số tiền (chưa thuế) của \"Giao thêm vật tư (OP000036)\". Màn hình hiện \"Giao thêm vật tư (OP000036) 2,000 yên (chưa thuế)・lần 2 trong tháng\" (số tiền lấy từ master tùy chọn). Phần vượt số lượng miễn phí tính theo giá và thuế suất của master vật tư (Sổ cái B). Với đơn từ lần 2 còn hiện \"lần thứ n trong tháng\" (giống I222/W210 của Web pháp nhân). \"Lần thứ mấy\" đếm theo tháng chu kỳ của ngày giao dự kiến (khi hủy thì đơn kế tiếp đẩy lên; tháng đã xuất hóa đơn thì điều chỉnh hóa đơn). Đơn vật tư của điểm giao dùng thử không tính OP000036 (Sổ tiếp nhận #269). Số tiền OP000036 giữ nguyên 【Tạm】2,000 yên/lần; hong sẽ đặt số tiền chính thức sau (受付簿 #261)"], vi="Phí (chưa thuế)"),
         I("4", "注文資材明細", ".es-card::注文資材明細", "card", "view", ex=["資材ボックス", "Tên vật tư (ví dụ: hộp vật tư)"], detail=["見出しの右に「Σ 3種類・合計 150」。参照のとき数字だけ", "Bên phải tiêu đề hiện \"Σ 3 loại, tổng 150\". Khi xem chỉ có số"], vi="Chi tiết vật tư đã đặt"),
         I("4.1", "明細の表", ".od-tbl:not(.od-log) .es-table", "table", "view",
           detail=["列：No・写真・資材ID・資材名・規格・使うコース・単位・注文数。注文数は右寄せ「150個」。1行＝資材1種類（拠点のコースで使う資材）", "Cột: No, ảnh, ID vật tư, tên vật tư, quy cách, khóa học sử dụng, đơn vị, số đặt. Số đặt căn phải \"150 cái\". 1 dòng = 1 loại vật tư (vật tư dùng cho khóa học của điểm giao)"], vi="Bảng chi tiết"),
         I("5", "配送データ（資材便）", ".es-card::配送データ（資材便）", "card", "view", ex=["DL-261006-0103", "ID dữ liệu giao hàng của chuyến vật tư (ví dụ: DL-261006-0103)"], detail=["資材便の配送データ。出荷指示・送り状の出力と取込は「配送管理 ＞ 出荷・配送管理 ＞ 出荷指示・取込」で行う。同じ拠点・同じ納品日で出荷指示前の資材便があれば1件にまとめる", "Dữ liệu giao hàng của chuyến vật tư. Xuất/nhập chỉ thị xuất hàng và phiếu vận chuyển làm ở \"Quản lý giao hàng > Quản lý xuất/giao hàng > Chỉ thị xuất hàng/Nhập\". Nếu cùng điểm giao, cùng ngày giao mà có chuyến vật tư chưa chỉ thị xuất hàng thì gộp thành 1"], vi="Dữ liệu giao hàng (chuyến vật tư)"),
         I("5.1", "配送データID", ".od-ro label::配送データID", "label", "view", detail=["例 DL-261006-0103（等幅）。取消は「DL-…（取消）」", "Ví dụ DL-261006-0103 (font đơn cách). Đơn đã hủy là \"DL-… (Hủy)\""], vi="ID dữ liệu giao hàng"),
         I("5.2", "配送状態", ".od-ro label::配送状態", "label", "view", detail=["出荷待／出荷指示済／出荷済／納品済／取消", "Chờ xuất hàng / Đã có chỉ thị xuất hàng / Đã xuất hàng / Đã giao / Hủy"], vi="Trạng thái giao hàng"),
         I("5.3", "出荷指示（THOMAS）", ".od-ro label::出荷指示", "label", "view", detail=["送信済みなら「送信済み yyyy-mm-dd 06:00」。出荷待は「未送信（出荷日の前日に日次の拾い上げで送る）」。取消は「—」", "Nếu đã gửi thì \"Đã gửi yyyy-mm-dd 06:00\". Chờ xuất hàng là \"Chưa gửi (gửi theo lấy dữ liệu hằng ngày vào ngày trước ngày xuất hàng)\". Đã hủy là \"—\""], vi="Chỉ thị xuất hàng (THOMAS)"),
         I("5.4", "送り状番号", ".od-ro label::送り状番号", "label", "view", detail=["ヤマトの送り状番号（等幅）と「配送状況を調べる」のリンク（ヤマトの追跡ページを開く。ヤマトの API は使わない：台帳 M-3）。なければ「—」", "Số vận đơn Yamato (font đơn cách) và liên kết \"Tra cứu tình trạng giao hàng\" (mở trang theo dõi của Yamato. Không dùng API của Yamato: Sổ cái M-3). Chưa có thì \"—\""], vi="Số vận đơn"),
         I("6", "発送日・送り状番号", ".mo-ship", "area", "view", ex=["4471-8820-0790", "Số vận đơn Yamato, chữ số bán góc và dấu gạch ngang (ví dụ: 4471-8820-0790)"],
           detail=["法人Web の注文履歴（資材注文）に出す。お届け予定日は、発送日＋リードタイムで出せるときだけ法人Web に出す（それまでは出さない：台帳 E）", "Hiện trong lịch sử đặt hàng (đơn vật tư) của Web pháp nhân. Ngày giao dự kiến chỉ hiện trên Web pháp nhân khi tính được từ ngày gửi + thời gian chuẩn bị (trước đó không hiện: Sổ cái E)"],
           cond=["取消でない注文に出す（参照だけ。入力は編集の画面：AW_MORD_003 No.6.6・6.7）", "Hiện với đơn chưa hủy (chỉ xem. Nhập ở màn hình chỉnh sửa: AW_MORD_003 No.6.6, 6.7)"], vi="Ngày gửi/số vận đơn"),
         I("6.1", "発送日", ".mo-ship label::発送日", "label", "view",
           detail=["資材便を発送した日（yyyy-mm-dd）。入っていなければ「—」。入力は編集の画面（AW_MORD_003 No.6.6）。空なら法人Web にお届け予定日を出さない", "Ngày gửi chuyến vật tư (yyyy-mm-dd). Chưa có thì \"—\". Nhập ở màn hình chỉnh sửa (AW_MORD_003 No.6.6). Nếu trống thì Web pháp nhân không hiện ngày giao dự kiến"], vi="Ngày gửi"),
         I("6.2", "送り状番号", ".mo-ship label::送り状番号", "label", "view",
           detail=["ヤマトの送り状番号（等幅）。入っていなければ「—」。入力は編集の画面（AW_MORD_003 No.6.7）", "Số vận đơn Yamato (font đơn cách). Chưa có thì \"—\". Nhập ở màn hình chỉnh sửa (AW_MORD_003 No.6.7)"], vi="Số vận đơn"),
         I("6.3", "お届け予定日（法人Web）", ".mo-ship .od-ro label::お届け予定日", "label", "view",
           detail=["発送日を入れると「yyyy-mm-dd(曜)（発送日 ＋ リードタイム 2日）」と出す（発送日にリードタイムの日数を足した日）。入っていなければ「発送日を入れると、発送日＋リードタイムで出します」。リードタイムの日数は、配送ルートの設定にある契約の配送区分（資材）のリードタイム（親契約＝既定値・子契約＝その月の実際値・受付簿 #262）。いまは値が未設定のため2日で仮（初期値）。法人Web の資材注文のお届け予定日の計算にも使う", "Khi đã nhập ngày gửi thì hiện \"yyyy-mm-dd(thứ) (ngày gửi + thời gian chuẩn bị 2 ngày)\" (ngày gửi cộng số ngày thời gian chuẩn bị). Chưa nhập thì hiện \"Nhập ngày gửi thì sẽ hiện theo ngày gửi + thời gian chuẩn bị\". Số ngày thời gian chuẩn bị lấy từ thời gian chuẩn bị của loại giao hàng (vật tư) của hợp đồng trong thiết lập tuyến giao hàng (hợp đồng cha = giá trị mặc định, hợp đồng con = giá trị thực tế của tháng đó; 受付簿 #262); hiện chưa đặt giá trị nên tạm 2 ngày (giá trị ban đầu). Cũng dùng để tính ngày giao dự kiến của đơn vật tư trên Web pháp nhân"],
           vi="Ngày giao dự kiến (Web pháp nhân)"),
         I("6.4", "発送日・送り状番号を保存", "-", "label", "view",
           detail=["詳細に保存ボタンは置かない（P-FORM：詳細は表示だけ）。保存は編集の画面の「保存」1つ（AW_MORD_003 No.6.2）。保存すると S01 を出し、法人Web の注文履歴に出す", "Không đặt nút lưu ở chi tiết (P-FORM: chi tiết chỉ hiển thị). Lưu bằng nút \"Lưu\" duy nhất của màn hình chỉnh sửa (AW_MORD_003 No.6.2). Khi lưu hiện S01 và hiện trong lịch sử đặt hàng của Web pháp nhân"], vi="Lưu ngày gửi/số vận đơn"),
         I("7", "変更履歴", ".od-log", "table", "view", pattern="P-HIST",
           detail=["新しいものが上。列：変更日時・変更内容・変更者（配送データのメモから作る：登録・出荷指示の送信・送り状の取込・納品済・取消）。取消は理由も内容に入る", "Mới nhất ở trên. Cột: ngày giờ thay đổi, nội dung thay đổi, người thay đổi (tạo từ ghi chú của dữ liệu giao hàng: đăng ký, gửi chỉ thị xuất hàng, nhập phiếu vận chuyển, đã giao, hủy). Khi hủy thì lý do cũng nằm trong nội dung"],
           demo_ok=["資材注文の履歴は今の3列のまま（P-HIST の例外。配送データのメモから作っていて、項目・変更前後を持たない）", "Lịch sử đơn vật tư giữ nguyên 3 cột hiện tại (ngoại lệ của P-HIST. Được tạo từ ghi chú của dữ liệu giao hàng nên không có mục và trước/sau thay đổi)"], vi="Lịch sử thay đổi"),
     ]},

    {"id": "004", "code": "AW_MORD_002", "state": ["詳細（納品済・送り状あり）", "Chi tiết (đã giao, có phiếu vận chuyển)"],
     "url": "/ops/menu/materials/" + MO_DONE, "full": True, "wait": 900,
     "note": ["大阪支店の納品済の資材注文。取消のボタンは出さず、編集のボタンは出す（発送日・送り状番号だけ直せる。取消のときだけ出ない）", "Đơn vật tư đã giao của chi nhánh Osaka. Không hiện nút hủy, hiện nút chỉnh sửa (chỉ sửa được ngày gửi/số vận đơn. Chỉ khi đã hủy mới không hiện)"],
     "items": [
         I("8", "出荷指示の送信済", ".od-ro::出荷指示", "label", "view", detail=["「送信済み 2026-09-26 06:00」。進み具合の表示は5つとも ✓ で、最後の「納品済」が強調", "\"Đã gửi 2026-09-26 06:00\". Hiển thị tiến độ có cả 5 bước ✓ và \"Đã giao\" ở cuối được nhấn mạnh"], vi="Đã gửi chỉ thị xuất hàng"),
         I("8.1", "出荷済・納品済のとき", "-", "area", "view",
           detail=["出荷待でないので「取消」を出さない。「編集」は出す（発送日・送り状番号だけ直せる）。変更履歴に「納品済（みなし完了）」「送り状番号を取込・出荷済」「出荷指示を送信（THOMAS）」の行が増える", "Không phải chờ xuất hàng nên không hiện \"Hủy\". \"Chỉnh sửa\" vẫn hiện (chỉ sửa được ngày gửi/số vận đơn). Lịch sử thay đổi có thêm các dòng \"Đã giao (coi như hoàn tất)\", \"Nhập số vận đơn / đã xuất hàng\", \"Gửi chỉ thị xuất hàng (THOMAS)\""], vi="Khi đã xuất hàng/đã giao"),
     ]},

    {"id": "005", "code": "AW_MORD_002", "state": ["詳細（取消済）", "Chi tiết (đã hủy)"],
     "url": "/ops/menu/materials/" + MO_WAIT, "full": True, "wait": 900,
     "setup": RESET + "await fetch('/api/ops/area/menu/cancelMat',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json','x-es-site':'ops'},body:JSON.stringify({args:{no:'%s',reason:'撮影用（法人からの依頼）'}})});setTimeout(()=>location.reload(),50);" % MO_WAIT,
     "note": ["取り消した資材注文。見本データに取消の注文はないので、撮影は先に「取消」を実行してから開く", "Đơn vật tư đã hủy. Dữ liệu mẫu không có đơn đã hủy nên muốn chụp thì thực hiện \"Hủy\" trước rồi mới mở"],
     "items": [
         I("9", "取消のときの表示", ".mo-steps .neg", "area", "show",
           detail=["進み具合は「× 取消」だけ赤で強調。配送データIDは「DL-…（取消）」、出荷指示・送り状は「—」。取消済みの注文は参照のみ（編集・取消のボタンを出さず、編集の URL を開いたら「取り消した資材注文は編集できません（参照のみ）。」を出して詳細へ戻す：受付簿 #277）。発送日・送り状番号の欄は出さない（取消には入れられない）。変更履歴に「取消（理由：…）」の行", "Tiến độ chỉ nhấn mạnh \"× Hủy\" màu đỏ. ID dữ liệu giao hàng là \"DL-… (Hủy)\", chỉ thị xuất hàng và phiếu vận chuyển là \"—\". Đơn đã hủy chỉ để xem (không hiện nút sửa・hủy; mở URL sửa thì hiện \"Không sửa được đơn vật tư đã hủy (chỉ xem).\" rồi quay về chi tiết: Sổ tiếp nhận #269). Không hiện ô ngày gửi/số vận đơn (đơn đã hủy không nhập được). Lịch sử thay đổi có dòng \"Hủy (lý do: …)\""],
           cond=["配送状態が取消のとき", "Khi trạng thái giao hàng là hủy"], vi="Hiển thị khi đã hủy"),
     ]},

    {"id": "006", "code": "AW_MORD_002", "state": ["資材注文を取り消しますか（モーダル）", "Hủy đơn vật tư? (modal)"],
     "url": "/ops/menu/materials/" + MO_WAIT1, "full": False, "wait": 900,
     "setup": RESET + CLICKB("取消", 600),
     "note": ["出荷待の資材注文で「取消」を押した確認", "Xác nhận khi bấm \"Hủy\" ở đơn vật tư đang chờ xuất hàng"],
     "items": [
         I("10", "取消の確認", ".es-modal__panel", "modal", "show",
           detail=["タイトルは Q118「資材注文を取り消しますか？」。本文：配送データ（資材便）も取消になる。出荷指示を送る前だけ取り消せる。取消の理由を必須で入れる", "Tiêu đề là Q118 \"Hủy đơn vật tư?\". Nội dung: dữ liệu giao hàng (chuyến vật tư) cũng bị hủy. Chỉ hủy được trước khi gửi chỉ thị xuất hàng. Bắt buộc nhập lý do hủy"], vi="Xác nhận hủy"),
         I("10.1", "取消の理由", ".es-modal__body textarea", "textarea", "input", req="○", len="文字列 500",
           init=["空", "Trống"], ex=["法人からの依頼（電話）", "Lý do hủy, nhập tự do tối đa 500 ký tự (ví dụ: theo yêu cầu của pháp nhân qua điện thoại)"], detail=["複数行で入力できる（入力の共通基準：理由・メモは500文字・複数行）。変更履歴に残す。取消すると、同じサイクル月の「何回目」の数え方が変わる（2回目だった注文を取り消せば、次の注文が2回目になる）", "Nhập được nhiều dòng (chuẩn nhập chung: lý do/ghi chú tối đa 500 ký tự, nhiều dòng). Lưu vào lịch sử thay đổi. Khi hủy thì cách đếm \"lần thứ mấy\" trong cùng tháng chu kỳ thay đổi (nếu hủy đơn lần 2 thì đơn kế tiếp thành lần 2)"],
           valid=["必須。500文字まで。絵文字は不可（E13）", "Bắt buộc. Tối đa 500 ký tự. Không dùng emoji (E13)"], err=["E01", "E04", "E13"], vi="Lý do hủy"),
         I("10.2", "キャンセル", ".es-modal__actions button::キャンセル", "button", "click", detail=["モーダルを閉じる（取消はしない）", "Đóng modal (không hủy đơn)"], vi="Hủy bỏ"),
         I("10.3", "取り消す", ".es-modal__actions button::取り消す", "button", "click", err=["S14", "E30", "E31", "E32"],
           detail=["資材注文と配送データを取消にし、S14「資材注文と配送データを取り消しました。」を出す。失敗は E30。理由が空なら理由の下に E01。押したときにすでに出荷指示に拾い上げられていたら取り消さず、E31 を出して最新の内容を開く（No.1.2）", "Chuyển đơn vật tư và dữ liệu giao hàng sang hủy và hiện S14 \"Đã hủy đơn vật tư và dữ liệu giao hàng.\" Lỗi thì E30. Nếu lúc bấm đã được lấy vào chỉ thị xuất hàng thì không hủy mà hiện E31 và mở nội dung mới nhất (No.1.2). Nếu lý do trống thì hiện E01 dưới ô lý do"], vi="Hủy đơn"),
     ]},

    # ================================================================ AW_MORD_003 新規登録・編集
    {"id": "007", "code": "AW_MORD_003", "state": ["新規登録（初期表示）", "Đăng ký mới (hiển thị ban đầu)"],
     "url": "/ops/menu/materials/new", "full": True, "wait": 900,
     "note": ["運営が代理で登録する。拠点を選ぶと、その拠点のコースで使う資材が並ぶ", "Vận hành đăng ký thay. Khi chọn điểm giao, vật tư dùng cho khóa học của điểm giao đó sẽ hiện ra"],
     "items": [
         I("1", "ヘッダー", ".es-pagehead", "area", "view", pattern="P-FORM",
           detail=["タイトル「資材注文 新規登録」。保存の決まりは P-FORM（保存ボタンは押したら無効、ログイン切れは窓でログインして続ける）", "Tiêu đề \"Đăng ký mới đơn vật tư\". Quy tắc lưu theo P-FORM (nút lưu bị vô hiệu sau khi bấm, hết phiên đăng nhập thì đăng nhập lại trong cửa sổ rồi tiếp tục)"], vi="Tiêu đề trang"),
         I("1.1", "キャンセル", ".es-pagehead__actions button::キャンセル", "button", "click", err=["Q02"],
           detail=["入力を変えていれば Q02（キャンセル／破棄）。資材注文管理（一覧）へ戻る", "Nếu đã thay đổi thì Q02 (hủy/bỏ). Quay về quản lý đơn hàng vật tư (danh sách)"], vi="Hủy bỏ"),
         I("1.2", "登録", ".es-pagehead__actions button::登録", "button", "click", err=["S15", "E30", "E31", "E32", "E02", "E316", "Q205"],
           detail=["登録できたら、資材注文と配送データ（資材便）を作り、S15「資材注文を登録しました。配送データ（資材便）を作りました。」を出して詳細（AW_MORD_002）へ。注文区分は通常注文、注文者は登録した運営アカウント。押したときの順：入力のチェック（E02・E316。項目の下に出し、見出しの下に「保存できません（n件）」）→ 納品予定日のサイクル月の2回目以降（お試しの拠点を除く）は確認 Q205（AW_MORD_003 No.9）→ 登録", "Khi đăng ký được thì tạo đơn vật tư và dữ liệu giao hàng (chuyến vật tư), hiện S15 \"Đã đăng ký đơn vật tư. Đã tạo dữ liệu giao hàng (chuyến vật tư).\" rồi sang chi tiết (AW_MORD_002). Phân loại đơn là đơn thường, người đặt là tài khoản vận hành đã đăng ký. Thứ tự khi bấm: kiểm tra nhập (E02, E316; hiện dưới mục, dưới tiêu đề có \"Không lưu được (n mục)\") → nếu từ lần 2 của tháng chu kỳ (theo ngày giao dự kiến; trừ điểm giao dùng thử) thì xác nhận Q205 (AW_MORD_003 No.9) → đăng ký"],
           cond=["作成（C）の権限がある役割だけに出す", "Chỉ hiện cho vai trò có quyền tạo (C)"], vi="Đăng ký"),
         I("2", "オーダー基本情報", ".es-card::オーダー基本情報", "card", "view", ex=["大阪支店", "Tên điểm giao (ví dụ: chi nhánh Osaka)"], vi="Thông tin cơ bản của đơn hàng"),
         I("2.1", "拠点", ".od-g4 .es-field select", "select", "select", req="○", len="選択",
           init=["選択してください", "Vui lòng chọn"], ex=["株式会社エービーシー 大阪支店（CU00871）", "Tên pháp nhân, tên điểm giao (ID điểm giao) (ví dụ: Công ty ABC, chi nhánh Osaka (CU00871))"],
           detail=["選択肢は「法人名 拠点名（拠点ID）」。休止中・契約終了の拠点は出さない（お試しの拠点は出す：運営が代理登録できる。追加配送料（OP000036）は付けない：受付簿 #277）。拠点を変えると、入力した注文数を空にする（入力済みの数があるときは、消える旨の確認を出す：No.8・Q119）", "Lựa chọn là \"Tên pháp nhân Tên điểm giao (ID điểm giao)\". Không hiện điểm giao tạm ngừng/đã chấm dứt hợp đồng (điểm giao dùng thử thì hiện: vận hành đăng ký thay được; không tính phí giao thêm OP000036: Sổ tiếp nhận #269). Khi đổi điểm giao thì làm trống số lượng đã nhập (nếu đã có số lượng đã nhập thì hiện xác nhận sẽ bị xóa: Q119)"],
           valid=["必須", "Bắt buộc"], err=["E02"], vi="Điểm giao"),
         I("2.2", "注文区分", ".od-ro label::注文区分", "label", "view", detail=["「通常注文（ES が代理で登録）」の固定表示。初期セットは仮登録のときにシステムが自動で作る", "Hiển thị cố định \"Đơn thường (ES đăng ký thay)\". Bộ khởi đầu do hệ thống tự tạo khi đăng ký tạm"], vi="Phân loại đơn"),
         I("2.3", "注文日", ".od-ro label::注文日", "label", "view", detail=["今日の日付（yyyy-mm-dd）。変えられない", "Ngày hôm nay (yyyy-mm-dd). Không đổi được"], vi="Ngày đặt"),
         I("2.4", "納品予定日", ".od-ro label::納品予定日", "label", "view",
           detail=["拠点を選ぶと、注文日の翌日以降でリードタイムを守れる最初の納品可能日（日曜は除く）を「yyyy-mm-dd(曜)（自動）」と出す。選ぶ前は「拠点を選ぶと決まります」。リードタイムは配送ルートの設定にある契約の配送区分（資材）のリードタイム（親契約＝既定値・子契約＝その月の実際値・受付簿 #262）。いまは値が未設定のため2日で仮（初期値）", "Khi chọn điểm giao, hiện ngày giao được đầu tiên từ ngày sau ngày đặt trở đi mà đảm bảo thời gian chuẩn bị (trừ Chủ nhật) dạng \"yyyy-mm-dd(thứ) (tự động)\". Trước khi chọn thì \"Sẽ được quyết định khi chọn điểm giao\". Thời gian chuẩn bị lấy từ thời gian chuẩn bị của loại giao hàng (vật tư) của hợp đồng trong thiết lập tuyến giao hàng (hợp đồng cha = giá trị mặc định, hợp đồng con = giá trị thực tế của tháng đó; 受付簿 #262); hiện chưa đặt giá trị nên tạm 2 ngày (giá trị ban đầu)"],
           vi="Ngày giao dự kiến"),
         I("3", "注文資材明細", ".es-card::注文資材明細", "card", "view", ex=["資材ボックス", "Tên vật tư (ví dụ: hộp vật tư)"], detail=["見出しの右に「Σ n種類・合計 m」。拠点を選ぶまでは「拠点を選んでください：拠点のコースで使う資材が出ます」", "Bên phải tiêu đề hiện \"Σ n loại, tổng m\". Trước khi chọn điểm giao thì hiện \"Vui lòng chọn điểm giao: vật tư dùng cho khóa học của điểm giao sẽ hiện ra\""], vi="Chi tiết vật tư đã đặt"),
     ]},

    {"id": "008", "code": "AW_MORD_003", "state": ["新規登録（拠点を選んだあと）", "Đăng ký mới (sau khi chọn điểm giao)"],
     "url": "/ops/menu/materials/new", "full": True, "wait": 900,
     "setup": "{const s=document.querySelector('.es-field select');if(s){s.value=[...s.options].find(o=>o.value==='CU00871').value;s.dispatchEvent(new Event('change',{bubbles:true}));}}" + W(500),
     "note": ["拠点（大阪支店）を選んだ状態。納品予定日が自動で決まり、資材の表が出る", "Trạng thái đã chọn điểm giao (chi nhánh Osaka). Ngày giao dự kiến được quyết định tự động và hiện bảng vật tư"],
     "items": [
         I("1.3", "今月 n回目の資材注文（登録の左）", ".mo-count", "label", "view", err=["W210", "I222", "I11"],
           detail=["拠点を選ぶと、「登録」の左に出す（拠点を選ぶまでは出さない）。納品予定日（自動）のサイクル月の何回目かを数える（納品予定日で数える・取消は数えない）。1回目は青「今月 1回目の資材注文です。料金に含みます。」、2回目以降は黄 W210「今月 n回目の資材注文です。資材の追加配送の料金（{金額}）がかかります。」。お試しの拠点は「お試しの拠点のため、資材の追加配送の料金はかかりません。」（追加配送料を付けない：受付簿 #277）", "Khi chọn điểm giao thì hiện bên trái nút \"Đăng ký\" (chưa chọn thì không hiện). Đếm là lần thứ mấy của tháng chu kỳ chứa ngày giao dự kiến (tự động) (đếm theo ngày giao dự kiến, đơn đã hủy không đếm). Lần 1 màu xanh \"Đây là đơn vật tư lần 1 trong tháng. Đã nằm trong phí.\", từ lần 2 màu vàng W210 \"Đây là đơn vật tư lần thứ n trong tháng. Phát sinh phí giao vật tư bổ sung ({số tiền}).\". Điểm giao dùng thử: \"Vì là điểm giao dùng thử nên không tính phí giao vật tư bổ sung.\" (không gắn phí giao thêm: Sổ tiếp nhận #269)"], vi="Lần thứ n trong tháng"),
         I("3.1", "明細の表（拠点を選んだあと）", ".od-tbl .es-table", "table", "view",
           detail=["列：No・写真・資材ID・資材名・規格・使うコース・単位・注文数。1行＝拠点のコースで使う資材（ESライト（自販機）は冷蔵庫の資材も使える）。注文数は中央寄せの －／＋", "Cột: No, ảnh, ID vật tư, tên vật tư, quy cách, khóa học sử dụng, đơn vị, số đặt. 1 dòng = vật tư dùng cho khóa học của điểm giao (ES Light (máy bán hàng) cũng dùng được vật tư của tủ lạnh). Số đặt có −/+ căn giữa"], vi="Bảng chi tiết (sau khi chọn điểm giao)"),
         I("3.2", "注文数", ".od-step input", "text", "input", req="条件付き", len="整数 0〜999",
           init=["0", "0"], cond=["拠点を選んだあと（拠点を選ぶまでは表を出さない）。1つ以上の資材に1以上を入れる（すべて0・空は登録できない）", "Sau khi chọn điểm giao (chưa chọn thì không hiện bảng). Nhập từ 1 trở lên cho ít nhất một vật tư (tất cả 0 hoặc trống thì không đăng ký được)"], ex=["150", "Số lượng nguyên (ví dụ: 150 cái)"], detail=["資材ごとに－／＋か直接入力。数字以外は取り除く・全角は半角に直す・押すと全選択されて上書きできる。初期値はすべて 0（法人Web の資材注文と同じ：台帳 E「法人Web 商品注文・資材注文の細かい点」④）", "Theo từng vật tư dùng −/+ hoặc nhập trực tiếp. Bỏ ký tự không phải số, đổi toàn góc sang bán góc, khi bấm sẽ chọn toàn bộ để ghi đè. Giá trị ban đầu đều là 0 (giống đơn vật tư của Web pháp nhân: Sổ cái E \"Các điểm chi tiết của đơn sản phẩm/vật tư của Web pháp nhân\" ④)"],
           valid=["0〜999の整数（上限を超える数は999にする。サーバーも E12「注文数は0〜999の範囲で入力してください。」）。1つ以上の資材に1以上を入れる（E316「注文数を1つ以上入力してください。」）", "Số nguyên 0〜999 (vượt quá thì thành 999; server cũng báo E12 \"Vui lòng nhập số lượng đặt trong khoảng 0〜999.\"). Nhập từ 1 trở lên cho ít nhất một vật tư (E316 \"Vui lòng nhập ít nhất một số lượng đặt hàng.\")"],
           err=["E12", "E316"], vi="Số đặt"),
         I("4", "拠点を選んだあとの表示", ".od-tbl .es-table", "table", "show",
           detail=["納品予定日（自動）と、その拠点のコースで使う資材の一覧が出る。注文数はすべて 0。登録ボタンの条件はそのまま（1つ以上入れる）", "Hiện ngày giao dự kiến (tự động) và danh sách vật tư dùng cho khóa học của điểm giao đó. Số đặt đều là 0. Điều kiện nút Đăng ký giữ nguyên (nhập từ 1 trở lên cho ít nhất một vật tư)"], vi="Hiển thị sau khi chọn điểm giao"),
         I("3.3", "お客様へ知らせる（新規登録）", ".mo-notify .es-check", "check", "check", req="－", len="選択",
           init=["OFF（チェックなし）", "OFF (không tích)"], ex=["ON", "Giá trị bật/tắt (ví dụ: ON)"],
           detail=["登録と同時にお客様（法人・拠点）へ「資材注文を ES が登録しました」と知らせるかを選ぶ（編集の保存の No.6.8 と同じ形）。初期値はチェックなし（知らせない）。チェックしたときだけ法人Web のお知らせを作る（サーバーも、チェックが送られなければ作らない）。運営の代理登録でも、すべての運営の画面で初期値をそろえる（受付簿 #282 ②）", "Chọn có báo cho khách (pháp nhân, điểm giao) cùng lúc đăng ký \"ES đã đăng ký đơn vật tư\" hay không (cùng dạng với No.6.8 khi lưu chỉnh sửa). Giá trị ban đầu là không tích (không báo). Chỉ khi tích mới tạo thông báo trên Web pháp nhân (server cũng không tạo nếu không nhận được dấu tích). Dù vận hành đăng ký thay, giá trị ban đầu cũng thống nhất ở mọi màn hình vận hành (Sổ tiếp nhận #274 ②)"],
           cond=["作成（C）の権限がある役割に出す。拠点を選ぶ前から出る", "Hiện cho vai trò có quyền tạo (C). Hiện từ trước khi chọn điểm giao"], vi="Báo cho khách (đăng ký mới)"),
     ]},

    {"id": "009", "code": "AW_MORD_003", "state": ["新規登録（入力エラー）", "Đăng ký mới (lỗi nhập)"],
     "url": "/ops/menu/materials/new", "full": True, "wait": 900,
     "setup": CLICKB("登録", 600),
     "note": ["何も選ばずに「登録」を押した状態", "Trạng thái bấm \"Đăng ký\" khi chưa chọn gì"],
     "items": [
         I("5", "拠点が未選択", ".es-field__msg--error::拠点を選択してください。", "label", "show", err=["E02"],
           detail=["拠点の下に赤い文言 E02「拠点を選択してください。」と赤枠。見出しの下に「保存できません（1件）。赤い項目を確認してください。」の1行（台帳 E「保存エラーの出し方」）", "Câu chữ đỏ E02 \"Vui lòng chọn điểm giao.\" và viền đỏ dưới ô điểm giao. Dưới tiêu đề có một dòng \"Không lưu được (1 mục). Vui lòng kiểm tra các mục màu đỏ.\" (Sổ cái E \"Cách hiển thị lỗi khi lưu\")"], vi="Chưa chọn điểm giao"),
     ]},

    {"id": "010", "code": "AW_MORD_003", "state": ["編集（出荷待）", "Chỉnh sửa (chờ xuất hàng)"],
     "url": "/ops/menu/materials/" + MO_WAIT1 + "/edit", "full": True, "wait": 900,
     "note": ["取消でない資材注文を編集できる（出荷待でないときは、発送日・送り状番号だけ入力できる）。拠点は変えられない", "Sửa được đơn vật tư chưa hủy (khi không ở trạng thái chờ xuất hàng thì chỉ nhập được ngày gửi/số vận đơn). Không đổi được điểm giao"],
     "items": [
         I("6", "編集のヘッダー", ".es-pagehead", "area", "view", pattern="P-FORM", err=["E63"],
           detail=["タイトル「資材注文編集 MO-2610-0012」と配送状態のバッジ。取消でない注文は編集の URL を開ける。取消の注文の編集の URL を開くと、「取り消した資材注文は編集できません（参照のみ）。」を出して詳細へ戻す（受付簿 #277）。出荷待でない注文は、発送日・送り状番号だけ入力でき、納品予定日・注文数は読み取りにする（理由の案内を出す：No.12）", "Tiêu đề \"Chỉnh sửa đơn vật tư MO-2610-0012\" kèm huy hiệu trạng thái giao hàng. Đơn chưa hủy mở được URL chỉnh sửa. Mở URL chỉnh sửa của đơn đã hủy thì hiện \"Không sửa được đơn vật tư đã hủy (chỉ xem).\" rồi quay về chi tiết (Sổ tiếp nhận #269). Đơn không ở trạng thái chờ xuất hàng chỉ nhập được ngày gửi/số vận đơn, ngày giao dự kiến và số đặt chỉ đọc (hiện thông báo lý do: No.12)"], vi="Tiêu đề chỉnh sửa"),
         I("6.1", "キャンセル", ".es-pagehead__actions button::キャンセル", "button", "click", err=["Q02"], detail=["入力を変えていれば Q02。詳細へ戻る", "Nếu đã thay đổi thì Q02. Quay về chi tiết"], vi="Hủy bỏ"),
         I("6.2", "保存", ".es-pagehead__actions button::保存", "button", "click", err=["S01", "E30", "E31", "E32", "W119"],
           detail=["保存すると S01「保存しました。」を出して詳細へ戻る。押したときの順：入力のチェック（項目の下に出し、見出しの下に「保存できません（n件）」）→ 納品予定日を変えて選べない日（休日・納品不可曜日・リードタイム未満）なら W119（No.10）→ 保存。変更履歴に「資材注文を変更」の行", "Khi lưu hiện S01 \"Đã lưu.\" rồi về chi tiết. Thứ tự khi bấm: kiểm tra nhập (hiện dưới mục, dưới tiêu đề có \"Không lưu được (n mục)\") → nếu đổi ngày giao dự kiến sang ngày không chọn được (ngày nghỉ, thứ không giao, chưa đủ thời gian chuẩn bị) thì W119 (No.10) → lưu. Lịch sử thay đổi có dòng \"Đã thay đổi đơn vật tư\""],
           cond=["更新（U）の権限がある役割だけに出す", "Chỉ hiện cho vai trò có quyền cập nhật (U)"], vi="Lưu"),
         I("6.3", "納品予定日（編集）", "input[aria-label=納品予定日]", "date", "input", req="○", len="日付",
           init=["いまの納品予定日", "Ngày giao dự kiến hiện tại"], ex=["2026-10-09", "Ngày giao dự kiến dạng yyyy-mm-dd"], detail=["日付の部品（yyyy-mm-dd）。初期値は「注文日の翌日以降で、リードタイムを守れる最初の納品可能日」。変えると出荷予定日（リードタイム分前。契約の配送区分（資材）の値。いまは2日で仮）も変わる。保存で「何回目」を数え直す（サイクル月が変わると2回目の有料も付け直す）。出荷待のときだけ直せる", "Bộ chọn ngày (yyyy-mm-dd). Giá trị ban đầu là \"ngày giao được đầu tiên từ ngày sau ngày đặt trở đi mà đảm bảo thời gian chuẩn bị\". Khi đổi thì ngày xuất hàng dự kiến (trước đúng số ngày thời gian chuẩn bị; là giá trị của loại giao hàng (vật tư) trong hợp đồng; hiện tạm 2 ngày) cũng đổi. Khi lưu đếm lại \"lần thứ mấy\" (đổi tháng chu kỳ thì gắn lại phí lần 2). Chỉ sửa được khi đang chờ xuất hàng"],
           valid=["必須・日付。選べない日（休日マスタ・拠点の納品不可曜日・リードタイム未満）は止めず、警告の確認（新しい案 W119）を出し、運営が確かめれば保存できる", "Bắt buộc, ngày. Ngày không chọn được (master ngày nghỉ, thứ không giao của điểm giao, chưa đủ thời gian chuẩn bị) không bị chặn mà hiện xác nhận cảnh báo (đề xuất mới W119), vận hành đã kiểm tra thì lưu được"],
           err=["E01"], vi="Ngày giao dự kiến (chỉnh sửa)"),
         I("6.4", "拠点（読み取り）", ".od-ro label::拠点名", "label", "view", detail=["編集では拠点を変えられない（資材注文は拠点ごとの配送データのため）。法人名・拠点名などは詳細と同じ参照の項目", "Khi chỉnh sửa không đổi được điểm giao (vì đơn vật tư là dữ liệu giao hàng theo từng điểm giao). Tên pháp nhân, tên điểm giao… là các mục chỉ xem giống chi tiết"], vi="Điểm giao (chỉ đọc)"),
         I("6.5", "注文数（編集）", ".od-step input", "text", "input", req="条件付き", len="整数 0〜999",
           init=["いまの注文数", "Số đặt hiện tại"], cond=["出荷待のとき。1つ以上の資材に1以上を入れる（すべて0・空は保存できない）", "Khi chờ xuất hàng. Nhập từ 1 trở lên cho ít nhất một vật tư (tất cả 0 hoặc trống thì không lưu được)"], ex=["20", "Số lượng nguyên (ví dụ: 20 cái)"], detail=["新規登録と同じ（AW_MORD_003 No.3.2）。拠点のコースで使う資材がすべて並び、入っていない資材は 0", "Giống đăng ký mới (AW_MORD_003 No.3.2). Liệt kê toàn bộ vật tư dùng cho khóa học của điểm giao, vật tư chưa đặt là 0"],
           valid=["0以上の整数。1つ以上に1以上を入れる", "Số nguyên từ 0. Nhập từ 1 trở lên cho ít nhất một vật tư"], err=["E12"], vi="Số đặt (chỉnh sửa)"),
         I("6.6", "発送日（編集）", "input[aria-label=発送日]", "date", "input", req="－", len="日付",
           init=["いまの発送日（なければ空）", "Ngày gửi hiện tại (trống nếu chưa có)"], ex=["2026-10-06", "Ngày gửi dạng yyyy-mm-dd"], detail=["資材便を発送した日。日付の部品（yyyy-mm-dd）。出荷待でなくても入力できる（取消は編集を開けない）", "Ngày gửi chuyến vật tư. Bộ chọn ngày (yyyy-mm-dd). Nhập được cả khi không ở trạng thái chờ xuất hàng (đơn đã hủy thì không mở chỉnh sửa được)"],
           err=["E64"], valid=["日付。注文日以降（それより前の日付はE64「発送日は注文日以降の日付で入力してください。」）。空なら法人Web にお届け予定日を出さない", "Ngày. Từ ngày đặt trở đi (ngày trước đó là lỗi; E64). Nếu trống thì Web pháp nhân không hiện ngày giao dự kiến"],
           cond=["システム管理だけが入れられる（それ以外の役割は入力欄が無効。サーバーも 403。物流に更新権限は足さない：受付簿 #277）", "Chỉ quản trị hệ thống nhập được (vai trò khác bị vô hiệu ô nhập; server cũng trả 403. Không thêm quyền cập nhật cho Logistics: Sổ tiếp nhận #269)"], vi="Ngày gửi (chỉnh sửa)"),
         I("6.7", "送り状番号（編集）", "input[aria-label=送り状番号]", "text", "input", req="－", len="文字列 30",
           init=["いまの送り状番号（なければ空）", "Số vận đơn hiện tại (trống nếu chưa có)"], ex=["4471-8820-0790", "Số vận đơn Yamato, chữ số bán góc và dấu gạch ngang (ví dụ: 4471-8820-0790)"], detail=["ヤマトの送り状番号（半角の数字・ハイフン）。出荷指示を取り込んだ番号があればそれが初期値。出荷待でなくても入力できる", "Số vận đơn Yamato (chữ số bán góc, dấu gạch ngang). Nếu có số đã nhập từ chỉ thị xuất hàng thì dùng làm giá trị ban đầu. Nhập được cả khi không ở trạng thái chờ xuất hàng"],
           valid=["30文字まで。半角の数字とハイフンだけ。前後の空白を取り、全角は半角に直す", "Tối đa 30 ký tự. Chỉ chữ số bán góc và dấu gạch ngang. Bỏ khoảng trắng đầu cuối, đổi toàn góc sang bán góc"], err=["E04", "E06"],
           cond=["システム管理だけが入れられる（それ以外の役割は入力欄が無効。サーバーも 403。物流に更新権限は足さない：受付簿 #277）", "Chỉ quản trị hệ thống nhập được (vai trò khác bị vô hiệu ô nhập; server cũng trả 403. Không thêm quyền cập nhật cho Logistics: Sổ tiếp nhận #269)"], vi="Số vận đơn (chỉnh sửa)"),
         I("6.8", "お客様へ知らせる", ".mo-notify .es-check", "check", "check", req="－", len="選択",
           init=["OFF（チェックなし）", "OFF (không tích)"], ex=["ON", "Giá trị bật/tắt (ví dụ: ON)"],
           detail=["編集の保存と同時にお客様（法人・拠点）へ「資材注文が変わりました」と知らせるかを選ぶ（代替品設定の「お客様へ知らせる」と同じ形：AW_ORDR_004 No.7.1・台帳 J）。初期値はチェックなし（知らせない）。チェックしたときだけ法人Web のお知らせを作る（サーバーも、チェックが送られなければ作らない）。すべての運営の画面で初期値をそろえる（受付簿 #282 ②）。取消済みの注文は編集できないので出ない（受付簿 #277）", "Chọn có báo cho khách (pháp nhân, điểm giao) cùng lúc lưu chỉnh sửa hay không \"đơn vật tư đã thay đổi\" (cùng dạng với \"Báo cho khách\" của thiết lập sản phẩm thay thế: AW_ORDR_004 No.7.1・Sổ cái J). Giá trị ban đầu là không tích (không báo). Chỉ khi tích mới tạo thông báo trên Web pháp nhân (server cũng không tạo nếu không nhận được dấu tích). Thống nhất giá trị ban đầu ở mọi màn hình vận hành (Sổ tiếp nhận #274 ②). Đơn đã hủy không sửa được nên không hiện (Sổ tiếp nhận #277)"],
           cond=["更新（U）の権限がある役割に出す（取消済みの注文には編集を出さない）", "Hiện cho vai trò có quyền cập nhật (U) (không hiện sửa với đơn đã hủy)"], vi="Báo cho khách"),
     ]},

    {"id": "011", "code": "AW_MORD_003", "state": ["編集内容を破棄しますか（モーダル）", "Hủy nội dung đang sửa? (modal)"],
     "url": "/ops/menu/materials/" + MO_WAIT1 + "/edit", "full": False, "wait": 900,
     "setup": "{const b=document.querySelector('.od-step button[aria-label=増やす]');b&&b.click();}" + W(300) + CLICKB("キャンセル", 600),
     "note": ["1箇所を変えてから「キャンセル」を押した状態（新規登録でも同じ）", "Trạng thái đã đổi 1 chỗ rồi bấm \"Hủy bỏ\" (đăng ký mới cũng giống vậy)"],
     "items": [
         I("7", "破棄の確認", ".es-modal__panel", "modal", "show", err=["Q02"],
           detail=["Q02「編集中の内容は保存されません。編集内容を破棄してもよろしいですか？」。ボタンは「キャンセル」（編集に残る）／「破棄」（詳細または一覧へ戻る）。ブラウザを閉じる・再読み込み・ほかの画面への移動でも同じ（台帳 F）", "Q02 \"Nội dung đang sửa sẽ không được lưu. Bạn có muốn hủy nội dung đã sửa không?\" Nút \"Hủy bỏ\" (ở lại chỉnh sửa) / \"Bỏ\" (về chi tiết hoặc danh sách). Đóng trình duyệt, tải lại, chuyển sang màn hình khác cũng vậy (Sổ cái F)"], vi="Xác nhận hủy"),
     ]},

    {"id": "012", "code": "AW_MORD_003", "state": ["登録できない（注文数が1つもない）", "Không đăng ký được (không có số đặt nào)"],
     "url": "/ops/menu/materials/new", "full": True, "wait": 900,
     "setup": JS + SELSITE("CU00871") + W(900) + CLICKB("登録", 600),
     "note": ["拠点だけ選んで、注文数をすべて 0 のまま「登録」を押した状態", "Trạng thái chỉ chọn điểm giao, để mọi số đặt là 0 rồi bấm \"Đăng ký\""],
     "items": [
         I("5.1", "注文数が1つもない", ".es-field__msg--error::注文数を1つ以上入力してください。", "label", "show", err=["E316"],
           detail=["注文資材明細の下に赤い文言 E316「注文数を1つ以上入力してください。」（E316 の ja_o の追加案）と、見出しの下に「保存できません（1件）」。拠点が未選択のときは拠点の E02 だけを出す（No.5）。1000以上を入れると E12「注文数は0〜999の範囲で入力してください。」", "Câu chữ đỏ E316 \"Vui lòng nhập ít nhất một số lượng đặt hàng.\" dưới chi tiết vật tư đã đặt (đề xuất thêm ja_o cho E316) và \"Không lưu được (1 mục)\" dưới tiêu đề. Khi chưa chọn điểm giao chỉ hiện E02 của điểm giao (No.5). Nhập từ 1000 trở lên thì E12 \"Vui lòng nhập số lượng đặt trong khoảng 0〜999.\""], vi="Không có số đặt nào"),
     ]},

    {"id": "013", "code": "AW_MORD_003", "state": ["拠点を変えると注文数が消える確認（モーダル）", "Xác nhận đổi điểm giao sẽ xóa số đặt (modal)"],
     "url": "/ops/menu/materials/new", "full": False, "wait": 900,
     "setup": JS + SELSITE("CU00871") + W(900) + SETQ5 + W(300) + SELSITE("CU00643") + W(500),
     "note": ["拠点を選んで注文数を入れたあと、別の拠点を選び直した状態", "Trạng thái sau khi chọn điểm giao và nhập số đặt, chọn lại một điểm giao khác"],
     "items": [
         I("8", "拠点の変更の確認", ".es-modal__panel", "modal", "show",
           err=["Q119"], detail=["入力済みの注文数（1以上）があるときだけ出す。「拠点を変更しますか？」「拠点を変えると、入力した注文数が消えます。／変えてもよろしいですか？」（Q119）。入力済みの数がなければ確認なしで拠点を変える", "Chỉ hiện khi đã có số đặt (từ 1 trở lên). \"Đổi điểm giao?\" \"Nếu đổi điểm giao thì số đặt đã nhập sẽ bị xóa. / Bạn có muốn đổi không?\" (Q119). Nếu chưa nhập số nào thì đổi điểm giao không cần xác nhận"], vi="Xác nhận đổi điểm giao"),
         I("8.1", "キャンセル", ".es-modal__actions button::キャンセル", "button", "click", detail=["モーダルを閉じる。拠点も入力した数も変えない", "Đóng modal. Không đổi điểm giao và số đã nhập"], vi="Hủy bỏ"),
         I("8.2", "変更する", ".es-modal__actions button::変更する", "button", "click", detail=["拠点を変え、入力した注文数を空にする。納品予定日（自動）・「今月 n回目」も新しい拠点で決め直す", "Đổi điểm giao và làm trống số đặt đã nhập. Ngày giao dự kiến (tự động) và \"lần thứ n trong tháng\" cũng được tính lại theo điểm giao mới"], vi="Đổi"),
     ]},

    {"id": "014", "code": "AW_MORD_003", "state": ["資材を注文しますか（2回目以降・モーダル）", "Đặt vật tư? (từ lần 2, modal)"],
     "url": "/ops/menu/materials/new", "full": False, "wait": 900,
     "setup": JS + SELSITE("CU00871") + W(900) + SETQ5 + W(300) + CLICKB("登録", 600),
     "note": ["大阪支店（このサイクル2回目以降）を選び、注文数を入れて「登録」を押した状態", "Trạng thái chọn chi nhánh Osaka (từ lần 2 của chu kỳ này), nhập số đặt rồi bấm \"Đăng ký\""],
     "items": [
         I("9", "資材を注文しますか", ".es-modal__panel", "modal", "show", err=["Q205"],
           detail=["納品予定日のサイクル月の2回目以降（お試しの拠点を除く）の登録の前に出す。Q205「資材を注文しますか？／同じサイクル月の2回目以降の注文のため、資材の追加配送の料金（{金額}・税抜）がかかります。」（法人Web と同じ確認・金額は OP000036 の金額）。1回目・お試しの拠点には出さず、そのまま登録する", "Hiện trước khi đăng ký đơn từ lần 2 của tháng chu kỳ (theo ngày giao dự kiến; trừ điểm giao dùng thử). Q205 \"Đặt vật tư? / Đây là đơn từ lần thứ 2 trong cùng tháng chu kỳ nên phát sinh phí giao vật tư bổ sung ({số tiền}, chưa thuế).\" (xác nhận giống Web pháp nhân, số tiền là số tiền của OP000036). Lần 1 hoặc điểm giao dùng thử thì không hiện, đăng ký luôn"], vi="Xác nhận đặt vật tư"),
         I("9.1", "キャンセル", ".es-modal__actions button::キャンセル", "button", "click", detail=["モーダルを閉じる（登録しない）", "Đóng modal (không đăng ký)"], vi="Hủy bỏ"),
         I("9.2", "注文する", ".es-modal__actions button::注文する", "button", "click", err=["S15", "E30"], detail=["登録する（AW_MORD_003 No.1.2 と同じ）", "Đăng ký (giống AW_MORD_003 No.1.2)"], vi="Đặt"),
     ]},

    {"id": "015", "code": "AW_MORD_003", "state": ["納品予定日を確認してください（警告・モーダル）", "Hãy xác nhận ngày giao dự kiến (cảnh báo, modal)"],
     "url": "/ops/menu/materials/" + MO_WAIT1 + "/edit", "full": False, "wait": 900,
     "setup": JS + W(600) + "setv(q('input[aria-label=納品予定日]'),'2026-10-06');" + W(1200) + CLICKB("保存", 700),
     "note": ["納品予定日を、リードタイムに足りない日（今日の翌日）に変えて「保存」を押した状態", "Trạng thái đổi ngày giao dự kiến sang ngày chưa đủ thời gian chuẩn bị (ngày mai) rồi bấm \"Lưu\""],
     "items": [
         I("10", "納品予定日の警告", ".es-modal__panel", "modal", "show", err=["W119"],
           detail=["納品予定日を変えて、選べない日（休日マスタの休日・拠点の納品不可曜日・日曜・リードタイム未満）にしたときだけ出す。W119「納品予定日が休日・お届けできない曜日・リードタイム未満です。このまま保存しますか？」。止めず、運営が確かめれば保存できる（台帳 L「配送の日付の移動」と同じ）", "Chỉ hiện khi đổi ngày giao dự kiến sang ngày không chọn được (ngày nghỉ trong master ngày nghỉ, thứ không giao của điểm giao, Chủ nhật, chưa đủ thời gian chuẩn bị). W119 \"Ngày giao dự kiến là ngày nghỉ / thứ không giao được / chưa đủ thời gian chuẩn bị. Bạn vẫn muốn lưu?\". Không chặn, vận hành đã kiểm tra thì lưu được (giống Sổ cái L \"Dời ngày giao\")"], vi="Cảnh báo ngày giao dự kiến"),
         I("10.1", "キャンセル", ".es-modal__actions button::キャンセル", "button", "click", detail=["モーダルを閉じて編集に戻る（保存しない）", "Đóng modal và quay lại chỉnh sửa (không lưu)"], vi="Hủy bỏ"),
         I("10.2", "このまま保存", ".es-modal__actions button::このまま保存", "button", "click", err=["S01", "E30", "E31"], detail=["警告のまま保存する（成功は S01 で詳細へ戻る）", "Lưu dù có cảnh báo (thành công thì S01 và về chi tiết)"], vi="Vẫn lưu"),
     ]},

    {"id": "016", "code": "AW_MORD_003", "state": ["編集（出荷指示のあと・発送日と送り状番号だけ）", "Chỉnh sửa (sau chỉ thị xuất hàng, chỉ ngày gửi và số vận đơn)"],
     "url": "/ops/menu/materials/" + MO_DONE + "/edit", "full": True, "wait": 900,
     "note": ["納品済の注文（出荷指示を送ったあと）の編集。納品予定日・注文数は読み取りで、発送日・送り状番号だけ入力できる（取消の注文は開かない）", "Chỉnh sửa đơn đã giao (sau khi gửi chỉ thị xuất hàng). Ngày giao dự kiến và số đặt chỉ đọc, chỉ nhập được ngày gửi và số vận đơn (đơn đã hủy thì không mở)"],
     "items": [
         I("12", "出荷指示のあとの案内", ".es-inline--info::出荷指示を送ったあとです", "area", "show",
           err=["I10"], detail=["出荷待でない注文（出荷指示済・出荷済・納品済）の編集の画面の上に出す青の案内「出荷指示を送ったあとは、数・納品予定日は直せません。直せるのは発送日・送り状番号だけです。」。納品予定日・注文数は読み取り（Stepper は無効）。発送日・送り状番号はシステム管理だけが入れられる。システム管理以外の役割には「発送日・送り状番号はシステム管理だけが入れられます」の案内も出し、保存ボタンは出さない", "Khung xanh hiện ở đầu màn hình chỉnh sửa của đơn không ở trạng thái chờ xuất hàng (đã có chỉ thị xuất hàng, đã xuất hàng, đã giao): \"Sau khi gửi chỉ thị xuất hàng thì không sửa được số lượng và ngày giao dự kiến. Chỉ sửa được ngày gửi và số vận đơn.\". Ngày giao dự kiến và số đặt chỉ đọc (Stepper bị vô hiệu). Chỉ quản trị hệ thống nhập được ngày gửi/số vận đơn. Vai trò khác hiện thêm thông báo \"Chỉ quản trị hệ thống nhập được ngày gửi/số vận đơn\" và không hiện nút lưu"],
           cond=["配送状態が出荷待でなく、取消でないとき", "Khi trạng thái giao hàng không phải chờ xuất hàng và không phải hủy"], vi="Thông báo sau chỉ thị xuất hàng"),
     ]},

    {"id": "017", "code": "AW_MORD_003", "state": ["ほかの人が先に保存した・出荷指示に拾い上げられた（保存の競合 E31）", "Người khác đã lưu trước / chỉ thị xuất hàng đã được lấy (xung đột khi lưu E31)"],
     "url": "/ops/menu/materials/" + MO_WAIT1 + "/edit", "full": False, "wait": 900,
     "setup": RESET + "await new Promise(r=>setTimeout(r,1500));" + POST + "{const m=await post('/api/ops/area/menu/mat',{no:'%s'});await post('/api/ops/area/menu/saveMat',{mat:m,ship:{shippedOn:'2026-10-05',trackingNo:'4471-8820-1234'}});}" % MO_WAIT1 + CLICKB("保存", 1200),
     "note": ["編集を開いたあと、ほかの人が同じ資材注文を先に保存した（または出荷指示が資材便の配送を拾い上げて、状態・版が変わった）あとに「保存」を押した状態。見本データを変えるので最後に撮る", "Trạng thái bấm \"Lưu\" sau khi người khác đã lưu cùng đơn vật tư trước (hoặc chỉ thị xuất hàng đã lấy giao hàng chuyến vật tư làm đổi trạng thái/phiên bản) kể từ lúc mở chỉnh sửa. Làm đổi dữ liệu mẫu nên chụp cuối cùng"],
     "items": [
         I("11", "内容が更新されています", ".me-ask .es-modal__title::内容が更新されています", "modal", "show", err=["E31", "W11"],
           cond=["保存・取消を押したとき、編集を始めてから、ほかの人が先に保存していた・出荷指示に拾い上げられた（資材注文と配送の状態・日付・数・発送日・送り状番号の版が違う）とき", "Khi bấm Lưu/Hủy mà từ lúc bắt đầu sửa, người khác đã lưu trước hoặc chỉ thị xuất hàng đã lấy (phiên bản trạng thái/ngày/số/ngày gửi/số vận đơn của đơn vật tư và giao hàng khác)"],
           detail=["E31「他のユーザーにより内容が更新されています。上書きすると保存されます。」の確認（P-FORM）。キャンセル／上書きして保存（No.11.1）。出荷指示に拾い上げられていた場合（数・納品予定日を直す保存、取消）は、上書きも取り消しもできないので「最新の内容を開く」だけを出し、出荷指示を送る前だけ取り消せる旨（Q118）を添える", "Xác nhận E31 \"Người khác đã cập nhật nội dung này. Nếu ghi đè thì sẽ lưu theo nội dung của bạn.\" (P-FORM). Hủy / Ghi đè và lưu (No.11.1). Nếu đã được lấy vào chỉ thị xuất hàng (lưu sửa số/ngày giao, hủy đơn) thì không ghi đè hay hủy được nên chỉ hiện \"Mở nội dung mới nhất\" kèm lưu ý chỉ hủy được trước khi gửi chỉ thị xuất hàng (Q118)"], vi="Nội dung đã được cập nhật"),
         I("11.1", "上書きして保存", ".me-ask__btns button::上書きして保存", "button", "click", err=["S01", "E30"], cond=["No.11 を出したとき（出荷指示に拾い上げられていないとき）", "Khi hiện No.11 (và chưa bị lấy vào chỉ thị xuất hàng)"],
           detail=["ほかの人の保存を上書きして、この画面の内容で保存する（版を無視して送る）。成功は S01 で詳細へ戻る", "Ghi đè lên lần lưu của người khác và lưu theo nội dung màn hình này (gửi bỏ qua phiên bản). Thành công thì S01 và về chi tiết"], vi="Ghi đè và lưu"),
         I("11.2", "キャンセル", ".me-ask__btns button::キャンセル", "button", "click",
           detail=["モーダルを閉じて編集に戻る（保存しない）。読み直したいときは、編集を破棄して詳細から開き直す", "Đóng modal và quay lại chỉnh sửa (không lưu). Muốn tải lại thì hủy chỉnh sửa rồi mở lại từ chi tiết"], vi="Hủy bỏ"),
     ]},

]
