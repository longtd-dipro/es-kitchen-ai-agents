# -*- coding: utf-8 -*-
"""
画面設計書のデータ：運営管理者Web ＞ マスタ管理 ＞ 倉庫マスタ（一覧・CSV取込）
元：本物の Web（app/ops/masters/warehouses・app/ops/_general/gen.ts の warehouse・lib/csv/master.ts（warehouses））、台帳 H・I・138（中継先）・運営Web_権限表（中継先管理）・CSV入出力_定義
番号は画面ごとに通し。タブ・モーダルの状態では、その状態で増える・変わる項目だけ書く。
（運営H2：hong の確認前の提案を含む。提案は DECISIONS で「提案」と書き、open に確認先を残してある）
"""

TITLE = ["倉庫マスタ（AW_WRHS）", "Master kho (AW_WRHS)"]
SHEET = ["倉庫マスタ", "Master kho"]
BASENAME = "画面設計書_AW_WRHS_倉庫マスタ"
IMG_PREFIX = "AW_WRHS"
OUT_DIR = "AW_WRHS_倉庫マスタ"
CODE_NOTE = ["画面コードは規約 <Module(2)>_<Feature(4)>_<Seq(3)>（docs/01_仕様/画面コード規約_20261005.md）。AW＝運営管理者Web、WRHS＝倉庫マスタ",
             "Mã màn hình theo quy ước <Module(2)>_<Feature(4)>_<Seq(3)>. AW = Admin Web, WRHS = Master kho"]
SITE = "ops"
SYSTEM = {"ja": "運営管理者Web", "vi": "Web quản trị vận hành"}
AUTHOR = "Claude（cloud）／確認：hong"
CREATED = "2026-10-06"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "ops", "loginId": "Ad00010"}
CODE_PATHS = "[\"app/ops/masters/warehouses\", \"app/ops/_general\", \"lib/csv/master.ts\", \"lib/ops/general/fromDomain.ts\"]"

DECISIONS = [
    {"date": "2026-10-06", "target": "登録・編集のしかた", "q": ["運営の画面で新規登録・編集の画面（フォーム）を作るか", "Có tạo màn hình đăng ký mới/chỉnh sửa (biểu mẫu) trong màn hình vận hành hay không"], "a": ["作る（プランマスタと同じ：一覧 → 詳細（表示だけ）→ 登録・編集）。CSV取込も残す（一括）。これまでの案「CSV取込だけ」は置き換え。配送スタッフも作る（台帳「ドライバーのログインID」：運営には新規登録の画面を作らず CSV取込 → 置き換え）", "Làm mới (giống master gói dịch vụ: danh sách → chi tiết (chỉ hiển thị) → đăng ký/sửa). Vẫn giữ nhập CSV (hàng loạt). Phương án trước đây 「chỉ nhập CSV」 được thay thế. Cũng làm cho nhân viên giao hàng (「台帳」 'ID đăng nhập của tài xế': trước đây vận hành không có màn hình đăng ký mới mà chỉ nhập CSV → được thay thế)"], "src": "hong 回答 2026-10-06（運営H2 A＝C）・台帳 F・受付簿 No.167"},
    {"date": "2026-10-06", "target": "削除と無効の扱い", "q": ["削除のしかたと、削除・無効にしたときのログイン", "Cách xóa, và việc đăng nhập khi đã xóa hoặc vô hiệu hóa"], "a": ["論理削除（状態＝削除済）。削除できない条件を置く（使用中は削除できない。条件の中身は仕入先＝進行中の発注／倉庫＝在庫・利用中の契約／委託配送先＝利用中の契約・配送予定・所属スタッフ／配送スタッフ＝割り当て済みの配送。hong 確認 2026-10-06）。状態が「削除済」「無効」のアカウントはログインできない", "Xóa logic (trạng thái 削除済). Có điều kiện chặn xóa (đang sử dụng thì không xóa được; nội dung điều kiện: 仕入先 = đơn đặt hàng đang xử lý / 倉庫 = tồn kho・hợp đồng đang dùng / 委託配送先 = hợp đồng・lịch giao đang dùng・nhân viên trực thuộc / 配送スタッフ = lượt giao đã phân công; hong xác nhận 2026-10-06). Tài khoản ở trạng thái 「削除済」「無効」 không đăng nhập được."], "src": "hong 回答 2026-10-06（運営H2 B）・台帳 F・受付簿 No.167"},
    {"date": "2026-10-06", "target": "倉庫区分「ピッキング倉庫（資材）」", "q": ["区分「ピッキング倉庫（資材）」を登録・CSVで扱うか", "Có xử lý phân loại 「ピッキング倉庫（資材）」 khi đăng ký và CSV không"], "a": ["扱う。倉庫区分は ピッキング倉庫／ピッキング倉庫（資材）／中継倉庫／返送先 の4つ（資材だけを持つ倉庫。例：ES事務所）。CSV の区分にも足す", "Có. Phân loại kho gồm 4 loại: ピッキング倉庫／ピッキング倉庫（資材）／中継倉庫／返送先 (kho chỉ chứa vật tư, ví dụ văn phòng ES). Thêm cả vào phân loại trong CSV."], "src": "hong 回答 2026-10-06（運営H2）・台帳（資材の在庫と便）"},
    {"date": "2026-10-06", "target": "CSVの列「担当エリア」", "q": ["CSVの列「担当エリア」を残すか", "Có giữ cột 「担当エリア」 trong CSV không"], "a": ["残さない。倉庫に担当エリアは持たない（台帳）ので、CSV出力・取込から外す", "Không giữ. Kho không có khu vực phụ trách (台帳) nên bỏ khỏi CSV xuất và nhập"], "src": "hong 回答 2026-10-06（運営H2 #4）・台帳「一括変更」"},
    {"date": "2026-10-06", "target": "権限", "q": ["だれが見られる・操作できるか", "Ai được xem và thao tác"], "a": ["フル権限・システム管理・物流＝CRUD、ほか＝R。権限の機能名は「中継先管理」（画面は倉庫マスタ）", "Toàn quyền・quản trị hệ thống・logistics = CRUD, các vai trò khác = R. Tên chức năng trong bảng quyền là 「中継先管理」 (màn hình là kho master)"], "src": "運営Web_権限表（中継先管理）"},
    {"date": "2026-10-05", "target": "中継先", "q": ["中継先の専用画面", "Màn hình riêng cho nơi trung chuyển"], "a": ["作らない。倉庫マスタに統合（倉庫区分＝中継倉庫）。返送先は倉庫区分＝返送先", "Không tạo. Gộp vào kho master (phân loại kho = kho trung chuyển). Nơi trả hàng là phân loại kho = nơi trả hàng"], "src": "台帳 138・在庫戻し（返送先）"},
    {"date": "2026-10-06", "target": "画面コード", "q": ["画面コード", "Mã màn hình"], "a": ["AW_WRHS_001〜002", "AW_WRHS_001〜002"], "src": "画面コード規約（Feature は Claude 案・hong 確認待ち）"},
]
CHANGES = [{"ver": "1.11", "date": "2026-10-06", "no": "*", "type": "追加", "reason": ["倉庫マスタの画面設計書を新規に作成（hong の確認済み・受付簿 No.164〜168）", "Tạo mới tài liệu thiết kế màn hình Master kho (đã được hong xác nhận, 受付簿 No.164〜168)"], "impact": ["一覧・詳細・登録／編集・CSV取込。倉庫区分に「ピッキング倉庫（資材）」、CSV の担当エリアを削除。削除条件 E242。実装済（受付簿 No.164・167・168）", "Danh sách, chi tiết, đăng ký/sửa, nhập CSV. Thêm 倉庫区分 「ピッキング倉庫（資材）」, bỏ cột 担当エリア trong CSV. Điều kiện xóa E242. Đã triển khai (受付簿 No.164・167・168)"]}, {"ver": "1.12", "date": "2026-10-06", "no": ["1", "2"], "type": "追加", "reason": ["役割レビュー（BA・QC・UI/UX）の指摘への対応", "Xử lý các góp ý từ review vai trò (BA・QC・UI/UX)"], "impact": ["表示の確認のための状態。動きは変更なし", "Trạng thái để kiểm tra hiển thị. Hành vi không đổi"]}, {"ver": "1.12", "date": "2026-10-06", "no": ["1.3", "1.16", "1.17"], "type": "変更", "reason": ["役割レビュー（BA・QC・UI/UX）の指摘への対応", "Xử lý các góp ý từ review vai trò (BA・QC・UI/UX)"], "impact": ["動きは変更なし（番号の場所と説明の追記）", "Hành vi không đổi (chỉ tách vị trí đánh số và bổ sung mô tả)"], "before": ["「キャンセル／登録・保存」を1項目", "Gộp 「キャンセル／登録・保存」 thành 1 mục"], "after": ["「キャンセル」と「登録・保存」を分ける／新規登録に P-FORM", "Tách 「キャンセル」 và 「登録・保存」 / nút đăng ký mới theo P-FORM"]}]
HIDE_ALWAYS = []
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [
    {"code": "AW_WRHS_001", "ja": "倉庫一覧", "vi": "Danh sách kho"},
    {"code": "AW_WRHS_002", "ja": "倉庫 CSV取込", "vi": "Nhập CSV kho"},
    {"code": "AW_WRHS_003", "ja": "倉庫詳細", "vi": "Chi tiết kho"},
    {"code": "AW_WRHS_004", "ja": "倉庫の登録・編集", "vi": "Đăng ký / sửa kho"},
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
    {"no": "1", "ja": "ヘッダー", "vi": "Header", "sel": ".ph", "kind": "area", "trig": "view", "detail": ["パンくず：マスタ管理 ＞ 倉庫マスタ。見られるのは運営の全役割（フル権限・システム管理・物流は操作もできる。ほかは閲覧のみ：権限表「中継先管理」）。", "Breadcrumb: マスタ管理 ＞ 倉庫マスタ. Tất cả các vai trò vận hành đều xem được (toàn quyền・quản trị hệ thống・logistics có thể thao tác. Các vai trò khác chỉ xem: bảng quyền 「中継先管理」)."]},
    {"no": "1.1", "ja": "CSV出力", "vi": "Xuất CSV", "sel": ".ph", "kind": "button", "trig": "click", "pattern": "P-CSV-OUT", "detail": ["ヘッダーの右。倉庫の全項目（CSV取込と同じ列）（検索条件のとおりの全件）。見られる役割には全員に出す。", "Bên phải header. Toàn bộ mục của kho (cùng cột với nhập CSV) (toàn bộ số bản ghi theo điều kiện tìm kiếm). Hiển thị cho tất cả các vai trò được phép xem."]},
    {"no": "1.2", "ja": "CSV取込", "vi": "Nhập CSV", "sel": ".ph", "kind": "button", "trig": "click", "pattern": "P-CSV", "detail": ["CSV取込の画面（/ops/masters/warehouses/import）へ。CSV取込の権限（フル権限・システム管理）がない役割には出さない。", "Chuyển đến màn hình nhập CSV (/ops/masters/warehouses/import). Không hiển thị với vai trò không có quyền nhập CSV (toàn quyền・quản trị hệ thống)."]},
    {"no": "1.3", "ja": "新規登録", "vi": "Đăng ký mới", "sel": ".ph .btn.pri", "kind": "button", "trig": "click", "pattern": "P-FORM", "detail": ["倉庫の登録（AW_WRHS_004）へ。登録の権限（フル権限・システム管理）がない役割には出さない。", "Chuyển đến đăng ký kho (AW_WRHS_004). Không hiển thị với vai trò không có quyền đăng ký (toàn quyền, quản trị hệ thống)."]},
    {"no": "2", "ja": "検索条件", "vi": "Điều kiện tìm kiếm", "sel": ".card", "kind": "area", "trig": "view", "pattern": "P-LIST", "detail": ["キーワード（倉庫ID・倉庫名）／倉庫区分（ピッキング倉庫・ピッキング倉庫（資材）・中継倉庫・返送先）／ステータス（有効・無効・削除済）。", "Từ khóa (ID kho, tên kho) / loại kho (kho picking, kho picking (vật tư), kho trung chuyển, nơi trả hàng) / trạng thái (hiệu lực, vô hiệu, đã xóa)."]},
    {"no": "3", "ja": "一覧", "vi": "Danh sách", "sel": ".tbl", "kind": "table", "trig": "view", "pattern": "P-LIST", "err": ["I01"], "detail": ["初期の並びは倉庫IDの昇順。1ページ 10件。0件は I01。", "Thứ tự ban đầu là ID kho tăng dần. 10 dòng mỗi trang. Khi 0 kết quả hiển thị I01."]},
    {"no": "3.1", "ja": "倉庫ID", "vi": "ID kho", "sel": ".tbl th::倉庫ID", "kind": "label", "trig": "view", "detail": ["区分ごとの接頭辞＋5桁（ピッキング＝WH・中継＝HU・返送先＝RT）。", "Tiền tố theo từng phân loại + 5 chữ số (picking = WH・trung chuyển = HU・nơi trả hàng = RT)."]},
    {"no": "3.2", "ja": "倉庫名", "vi": "Tên kho", "sel": ".tbl .lnk", "kind": "link", "trig": "click", "detail": ["名前は下線つきのリンク。押すと詳細（AW_WRHS_003）へ。", "Tên là liên kết có gạch chân. Nhấn vào sẽ chuyển đến chi tiết (AW_WRHS_003)."]},
    {"no": "3.3", "ja": "倉庫区分", "vi": "Phân loại kho", "sel": ".tbl th::倉庫区分", "kind": "label", "trig": "view", "detail": ["ピッキング倉庫／ピッキング倉庫（資材）／中継倉庫／返送先。", "Kho picking／kho picking (vật tư)／kho trung chuyển／nơi trả hàng."]},
    {"no": "3.6", "ja": "住所", "vi": "Địa chỉ", "sel": ".tbl th::住所", "kind": "label", "trig": "view", "detail": ["郵便番号・都道府県・市区町村・町名・番地・建物をつないで表示。", "Hiển thị nối liền mã bưu chính・tỉnh thành・quận huyện thành phố・tên phường/khu phố・số nhà・tòa nhà."]},
    {"no": "3.7", "ja": "担当者名", "vi": "Tên người phụ trách", "sel": ".tbl th::担当者名", "kind": "label", "trig": "view", "detail": ["運営の担当者（見本データ由来。CSV では編集できない。台帳「倉庫に担当エリアは持たない」）。", "Người phụ trách phía vận hành (lấy từ dữ liệu mẫu. Không thể chỉnh sửa bằng CSV. 「台帳」「Kho không có khu vực phụ trách」)."]},
    {"no": "3.8", "ja": "担当者の電話番号", "vi": "Số điện thoại người phụ trách", "sel": ".tbl th::担当者の電話番号", "kind": "label", "trig": "view", "detail": ["半角の数字とハイフン。", "Chữ số và dấu gạch ngang bán góc."]},
    {"no": "3.9", "ja": "ステータス", "vi": "Trạng thái", "sel": ".tbl th::ステータス", "kind": "label", "trig": "view", "detail": ["バッジ：有効／無効／削除済。", "Badge: có hiệu lực／vô hiệu／đã xóa."]},
    {"no": "3.10", "ja": "操作（契約の一括変更）", "vi": "Thao tác (thay đổi hàng loạt hợp đồng)", "sel": ".tbl .act", "kind": "button", "trig": "click", "detail": ["この倉庫の契約を一括変更（ピッキング倉庫・中継倉庫の行だけ。返送先には出さない）。押すと共通の「一括変更」のモーダル（台帳「一括変更」：専用画面なしでモーダル。入口は倉庫マスタ・委託配送先マスタ・プランマスタ）。中身は共通の設計で書く。押せるのは「一括変更」の権限がある役割だけ。", "Thay đổi hàng loạt hợp đồng của kho này (chỉ dòng kho picking・kho trung chuyển. Không hiển thị với nơi trả hàng). Bấm vào sẽ mở modal 「一括変更」 chung (「台帳」「一括変更」: không có màn hình riêng mà dùng modal. Lối vào là kho master・đơn vị vận chuyển ủy thác master・plan master). Nội dung được viết trong thiết kế chung. Chỉ vai trò có quyền 「一括変更」 mới bấm được."]},
    {"no": "3.11", "ja": "操作（編集・削除）", "vi": "Thao tác (sửa・xóa)", "sel": ".tbl .act", "kind": "button", "trig": "click", "pattern": "P-DEL", "err": ["Q01", "S02", "E30"], "detail": ["鉛筆＝編集（AW_WRHS_004）、ごみ箱＝削除（確認 Q01 → 論理削除して S02）。在庫がある・利用中の契約があるときは削除できない（E242）。削除済の行には出さない。操作の権限がない役割には出さない。", "Bút chì = sửa (AW_WRHS_004), thùng rác = xóa (xác nhận Q01 → xóa logic rồi hiện S02). Nếu còn tồn kho hoặc có hợp đồng đang sử dụng thì không thể xóa (E242). Không hiển thị ở dòng đã xóa. Không hiển thị với vai trò không có quyền thao tác."]},
    {"no": "4", "ja": "ページ送り", "vi": "Phân trang", "sel": ".pager", "kind": "area", "trig": "view", "pattern": "P-LIST", "detail": ["P-LIST のとおり（10／20／50件）。", "Theo P-LIST (10／20／50 dòng)."]},
]

I2 = [
    {"no": "1", "ja": "ヘッダー", "vi": "Header", "sel": ".ph", "kind": "area", "trig": "view", "pattern": "P-CSV", "err": ["S03", "E34"], "detail": ["見出し「倉庫マスタ CSV取込」。キャンセルで一覧へ戻る（何も登録しない）。CSV取込の権限（フル権限・システム管理）がある役割だけが開ける（ほかは一覧へ）。モーダルではなく画面（P-CSV）。", "Tiêu đề 「倉庫マスタ CSV取込」. Hủy thì quay lại danh sách (không đăng ký gì). Chỉ vai trò có quyền nhập CSV (toàn quyền・quản trị hệ thống) mới mở được (vai trò khác bị chuyển về danh sách). Là màn hình chứ không phải modal (P-CSV)."]},
    {"no": "2", "ja": "CSVテンプレートの列（定義。画面には出さない）", "vi": "Các cột của mẫu CSV (định nghĩa. Không hiển thị trên màn hình)", "sel": "-", "kind": "area", "trig": "view", "detail": ["取り込むファイルの列の定義（1行目の見出し・この順。CSV出力と同じ列）。「担当エリア」の列は置かない（台帳：倉庫に担当エリアは持たない）。", "Định nghĩa các cột của tệp nhập (tiêu đề dòng 1, theo thứ tự này, cùng cột với CSV xuất). Không có cột 「担当エリア」 (台帳: kho không có khu vực phụ trách)."]},
    {"no": "2.1", "ja": "倉庫ID", "vi": "ID kho", "sel": "-", "kind": "label", "trig": "view", "detail": ["【空欄＝新規（区分で採番 WH／HU／RT＋5桁）】キー。", "[Để trống = mới (cấp số theo phân loại WH／HU／RT + 5 chữ số)] Khóa."]},
    {"no": "2.2", "ja": "倉庫名", "vi": "Tên kho", "sel": "-", "kind": "label", "trig": "view", "len": "文字列 50", "detail": ["【新規は必須】エラー：倉庫名を入れてください。", "[Bắt buộc khi mới] Lỗi: 倉庫名を入れてください."]},
    {"no": "2.3", "ja": "倉庫区分", "vi": "Phân loại kho", "sel": "-", "kind": "label", "trig": "view", "detail": ["【新規は必須】ピッキング倉庫／ピッキング倉庫（資材）／中継倉庫／返送先（ID は ピッキング・ピッキング（資材）＝WH、中継＝HU、返送先＝RT ＋5桁）。", "[Bắt buộc khi tạo mới] ピッキング倉庫／ピッキング倉庫（資材）／中継倉庫／返送先 (ID: kho lấy hàng và kho lấy hàng (vật tư) = WH, trung chuyển = HU, nơi trả hàng = RT + 5 số)."]},
    {"no": "2.4", "ja": "郵便番号", "vi": "Mã bưu chính", "sel": "-", "kind": "label", "trig": "view", "len": "文字列 8", "detail": ["【任意】数字7桁、ハイフンは任意。", "[Tùy chọn] 7 chữ số, dấu gạch ngang là tùy chọn."]},
    {"no": "2.5", "ja": "都道府県", "vi": "Tỉnh thành", "sel": "-", "kind": "label", "trig": "view", "detail": ["【任意】47都道府県。", "[Tùy chọn] 47 tỉnh thành."]},
    {"no": "2.6", "ja": "市区町村", "vi": "Quận huyện thành phố", "sel": "-", "kind": "label", "trig": "view", "len": "文字列 255", "detail": ["【任意】", "[Tùy chọn]"]},
    {"no": "2.7", "ja": "町名・番地", "vi": "Tên phường/khu phố・số nhà", "sel": "-", "kind": "label", "trig": "view", "len": "文字列 255", "detail": ["【任意】", "[Tùy chọn]"]},
    {"no": "2.8", "ja": "建物等", "vi": "Tòa nhà, v.v.", "sel": "-", "kind": "label", "trig": "view", "len": "文字列 255", "detail": ["【任意】", "[Tùy chọn]"]},
    {"no": "2.9", "ja": "電話番号", "vi": "Số điện thoại", "sel": "-", "kind": "label", "trig": "view", "len": "文字列 20", "detail": ["【任意】半角の数字とハイフン。", "[Tùy chọn] Chữ số và dấu gạch ngang bán góc."]},
    {"no": "2.10", "ja": "THOMAS倉庫コード", "vi": "Mã kho THOMAS", "sel": "-", "kind": "label", "trig": "view", "detail": ["【任意】THOMAS 連携用。", "[Tùy chọn] Dùng cho liên kết THOMAS."]},
    {"no": "2.11", "ja": "運営している委託配送会社ID（中継）", "vi": "ID công ty vận chuyển ủy thác đang vận hành (trung chuyển)", "sel": "-", "kind": "label", "trig": "view", "detail": ["【中継倉庫は必須】エラー：中継倉庫は運営している委託配送会社IDを入れてください。", "[Bắt buộc với kho trung chuyển] Lỗi: 中継倉庫は運営している委託配送会社IDを入れてください."]},
    {"no": "2.12", "ja": "運営している委託配送会社名（中継）", "vi": "Tên công ty vận chuyển ủy thác đang vận hành (trung chuyển)", "sel": "-", "kind": "label", "trig": "view", "detail": ["【読取専用】書いても無視。", "[Chỉ đọc] Có ghi cũng bị bỏ qua."]},
    {"no": "2.13", "ja": "営業所コード（中継）", "vi": "Mã chi nhánh kinh doanh (trung chuyển)", "sel": "-", "kind": "label", "trig": "view", "detail": ["【任意】", "[Tùy chọn]"]},
    {"no": "2.14", "ja": "状態", "vi": "Trạng thái", "sel": "-", "kind": "label", "trig": "view", "detail": ["【任意】有効／無効。削除済の倉庫は変えられない（エラー）。", "[Tùy chọn] Có hiệu lực／vô hiệu. Kho đã xóa thì không thể thay đổi (lỗi)."]},
    {"no": "2.15", "ja": "担当者名", "vi": "Tên người phụ trách", "sel": "-", "kind": "label", "trig": "view", "detail": ["【読取専用】運営の見本行。CSV では編集できない。", "[Chỉ đọc] Dòng mẫu của phía vận hành. Không thể chỉnh sửa bằng CSV."]},
    {"no": "2.16", "ja": "担当エリア", "vi": "Khu vực phụ trách", "sel": "-", "kind": "label", "trig": "view", "detail": ["【読取専用】台帳「倉庫に担当エリアは持たない」とは別に、読取専用の列として CSV に出している（残すかは open）。", "[Chỉ đọc] Khác với 「台帳」「Kho không có khu vực phụ trách」, cột này được xuất ra CSV như một cột chỉ đọc (có giữ lại hay không là open)."]},
]

I3 = [
    {"no": "1", "ja": "ヘッダー", "vi": "Header", "sel": "-", "kind": "area", "trig": "view", "detail": ["パンくず：マスタ管理 ＞ 倉庫 ＞ 倉庫詳細。タイトル「倉庫詳細 ID」。右に「削除」「編集」（権限のある役割だけ。削除済の倉庫には出さない）。", "Breadcrumb: マスタ管理 > Kho > Chi tiết kho. Tiêu đề 「倉庫詳細 ID」. Bên phải có 「削除」「編集」 (chỉ vai trò có quyền. Không hiển thị với kho đã xóa)."]},
    {"no": "1.1", "ja": "削除", "vi": "Xóa", "sel": "-", "kind": "button", "trig": "click", "pattern": "P-DEL", "err": ["Q01", "S02", "E30"], "detail": ["削除の確認（Q01）→ 論理削除（P-DEL）。使用中は削除できない。削除すると、この倉庫のアカウントはログインできなくなる。", "Xác nhận xóa (Q01) → xóa logic (P-DEL). Đang được sử dụng thì không xóa được. Khi xóa, tài khoản của kho này không thể đăng nhập nữa."]},
    {"no": "1.3", "ja": "編集", "vi": "Sửa", "sel": "-", "kind": "button", "trig": "click", "detail": ["登録・編集の画面（編集）へ。編集の権限がない役割には出さない。", "Chuyển sang màn hình đăng ký・sửa (sửa). Không hiển thị với vai trò không có quyền sửa."]},
    {"no": "2", "ja": "タブ", "vi": "Tab", "sel": "-", "kind": "tab", "trig": "click", "pattern": "P-TAB", "detail": ["タブ：基本情報・変更履歴。初期は「基本情報」。", "Tab: Thông tin cơ bản・Lịch sử thay đổi. Mặc định là 「基本情報」."]},
    {"no": "3", "ja": "基本情報（表示）", "vi": "Thông tin cơ bản (hiển thị)", "sel": "-", "kind": "area", "trig": "view", "detail": ["倉庫ID・ステータス・倉庫名・倉庫名（伝票用）・倉庫名カナ・倉庫区分・中継倉庫区分・営業所コード・倉庫コード・備考。すべて表示だけ。", "ID kho, trạng thái, tên kho, tên kho (dùng cho phiếu), tên kho Kana, loại kho, phân loại kho trung chuyển, mã văn phòng, mã kho, ghi chú. Tất cả chỉ hiển thị."]},
    {"no": "4", "ja": "住所（表示）", "vi": "Địa chỉ (hiển thị)", "sel": "-", "kind": "area", "trig": "view", "detail": ["郵便番号・都道府県・市区町村・町域・番地・建物・部屋番号・電話番号・FAX番号。", "Mã bưu điện, tỉnh/thành, quận/huyện, khu vực, số nhà, tòa nhà, số phòng, số điện thoại, số FAX."]},
    {"no": "5", "ja": "担当者（表示）", "vi": "Người phụ trách (hiển thị)", "sel": "-", "kind": "area", "trig": "view", "detail": ["担当者の行（区分・担当者名・フリガナ・メールアドレス・TEL）。", "Dòng người phụ trách (phân loại, tên người phụ trách, furigana, email, TEL)."]},
    {"no": "6", "ja": "この倉庫の契約を一括変更", "vi": "Thay đổi hợp đồng của kho này hàng loạt", "sel": "-", "kind": "area", "trig": "view", "detail": ["詳細に置く既存のボタン（ピッキング倉庫・中継倉庫の行だけ）。", "Nút có sẵn đặt ở chi tiết (chỉ ở dòng kho picking và kho trung chuyển)."]},
]

I4 = [
    {"no": "1", "ja": "登録・編集の画面", "vi": "Màn hình đăng ký・sửa", "sel": "-", "kind": "area", "trig": "view", "pattern": "P-FORM", "err": ["Q02", "S01", "E30", "E31"], "detail": ["タイトル「倉庫情報の登録」「倉庫情報の編集」。一覧の「新規登録」と、詳細の「編集」（一覧の鉛筆）から開く。タブは置かない（詳細だけ）。保存は画面の 登録／保存 の1つだけ。入力を変えてキャンセルしたら Q02。成功したら S01 を出して詳細へ戻る（新規は登録した ID の詳細）。", "Tiêu đề 「倉庫情報の登録」「倉庫情報の編集」. Mở từ 「新規登録」 ở danh sách và từ 「編集」 ở chi tiết (biểu tượng bút chì ở danh sách). Không đặt tab (chỉ ở chi tiết). Chỉ có 1 nút lưu trên màn hình: Đăng ký/Lưu. Nếu đã sửa nhập liệu rồi bấm Hủy thì hiện Q02. Thành công thì hiện S01 và quay về chi tiết (đăng ký mới thì về chi tiết của ID vừa đăng ký)."]},
    {"no": "2", "ja": "基本情報", "vi": "Thông tin cơ bản", "sel": "-", "kind": "area", "trig": "view", "detail": ["基本情報のカード（参考画面：hong 2026-10-06）。", "Thẻ thông tin cơ bản (màn hình tham khảo: hong 2026-10-06)."]},
    {"no": "2.1", "ja": "倉庫ID", "vi": "ID kho", "sel": "-", "kind": "label", "trig": "view", "detail": ["区分ごとの接頭辞＋5桁（ピッキング＝WH・中継＝HU・返送先＝RT）。システムが採番。登録のときは表示しない。", "Tiền tố theo từng phân loại + 5 chữ số (picking = WH・trung chuyển = HU・nơi hoàn trả = RT). Hệ thống tự cấp số. Không hiển thị khi đăng ký."]},
    {"no": "2.2", "ja": "ステータス", "vi": "Trạng thái", "sel": "-", "kind": "select", "trig": "select", "err": ["E01"], "req": "○", "len": ["選択（有効／無効）", "Chọn (hiệu lực / vô hiệu)"], "ex": ["有効", "Hiệu lực"], "detail": ["新規は「有効」。削除済の倉庫は編集できない（E36）。", "Đăng ký mới là 「有効」. Không thể sửa kho đã xóa (E36)."]},
    {"no": "2.3", "ja": "倉庫名", "vi": "Tên kho", "sel": "-", "kind": "text", "trig": "input", "err": ["E01", "E04"], "req": "○", "len": "文字列 60", "ex": ["東京第一倉庫", "Ví dụ của mục 'Tên kho': tên của kho (chuỗi tên)."], "detail": ["画面に出す倉庫の名前。", "Tên kho hiển thị trên màn hình."]},
    {"no": "2.4", "ja": "倉庫名（伝票用）", "vi": "Tên kho (dùng cho phiếu)", "sel": "-", "kind": "text", "trig": "input", "err": ["E01", "E04"], "req": "○", "len": "文字列 60", "ex": ["東京第一倉庫", "Kho Tokyo số 1"], "detail": ["伝票に印字する倉庫名。", "Tên kho in trên phiếu."]},
    {"no": "2.5", "ja": "倉庫名カナ", "vi": "Tên kho (Kana)", "sel": "-", "kind": "text", "trig": "input", "err": ["E03", "E04"], "req": "－", "len": "文字列 60", "ex": ["トウキョウダイイチソウコ", "Tokyo Daiichi Soko"], "detail": ["全角カタカナ。", "Katakana toàn chiều rộng."]},
    {"no": "2.6", "ja": "倉庫区分", "vi": "Phân loại kho", "sel": "-", "kind": "select", "trig": "select", "err": ["E01"], "req": "○", "len": ["ラジオ（ピッキング倉庫／ピッキング倉庫（資材）／中継倉庫／返送先）", "Radio (kho lấy hàng / kho lấy hàng (vật tư) / kho trung chuyển / nơi trả hàng)"], "ex": ["中継倉庫", "Kho trung chuyển"], "detail": ["4つのまま（hong 2026-10-07）。参考画面の2つのラジオに、ピッキング倉庫（資材）・返送先を足して並べる。新規は選ぶ（登録後に変えると ID の接頭辞とずれるため、編集では変えられない）。", "Giữ nguyên 4 loại (hong 2026-10-07). Thêm kho picking (vật tư) và nơi trả hàng vào 2 radio của màn hình tham khảo rồi sắp xếp. Khi tạo mới thì phải chọn (nếu đổi sau khi đăng ký sẽ lệch tiền tố ID nên không đổi được khi sửa)."]},
    {"no": "2.7", "ja": "中継倉庫区分", "vi": "Phân loại kho trung chuyển", "sel": "-", "kind": "select", "trig": "select", "cond": ["倉庫区分が「中継倉庫」のとき", "Khi phân loại kho là 「中継倉庫」 (kho trung chuyển)"], "err": ["E01"], "req": "条件付き", "len": ["ラジオ（運送会社／それ以外（SC含む））", "Radio (công ty vận tải / khác (gồm SC))"], "ex": ["運送会社", "Công ty vận tải"], "detail": ["倉庫区分が「中継倉庫」のときだけ有効（ほかの区分では押せない）。「運送会社」を選ぶと「運営している委託配送会社」（委託配送先マスタから1社）が必須になり、「それ以外（SC含む）」は出さない（hong 2026-10-07）。", "Chỉ có hiệu lực khi loại kho là 「中継倉庫」 (các loại kho khác không bấm được). Khi chọn 「運送会社」 thì bắt buộc nhập 「運営している委託配送会社」 (1 công ty từ master điểm giao hàng ủy thác), và không hiển thị 「それ以外（SC含む）」 (hong 2026-10-07)."]},
    {"no": "2.7b", "ja": "運営している委託配送会社", "vi": "Công ty vận chuyển ủy thác đang vận hành", "sel": "-", "kind": "select", "trig": "select", "cond": ["中継倉庫区分が「運送会社」のとき", "Khi loại kho trung chuyển là 「運送会社」"], "err": ["E01"], "req": "条件付き", "len": ["選択（委託配送先マスタ）", "Chọn (master đơn vị vận chuyển ủy thác)"], "ex": ["ヤマト運輸", "Yamato Transport"], "detail": ["中継倉庫区分が「運送会社」のときだけ表示し、必須。", "Chỉ hiển thị khi loại kho trung chuyển là 「運送会社」, bắt buộc."]},
    {"no": "2.8", "ja": "営業所コード", "vi": "Mã văn phòng", "sel": "-", "kind": "text", "trig": "input", "err": ["E04"], "req": "－", "len": "文字列 20", "ex": ["TKY-01", "TKY-01"], "detail": ["中継倉庫のときに使う。", "Dùng khi là kho trung chuyển."]},
    {"no": "2.9", "ja": "倉庫コード", "vi": "Mã kho", "sel": "-", "kind": "text", "trig": "input", "err": ["E04"], "req": "－", "len": "文字列 20", "ex": ["WH-TKY01", "WH-TKY01"], "detail": ["トーマスへの出荷指示で使う自社コード。連携しない倉庫は空欄。", "Mã nội bộ dùng khi chỉ thị xuất hàng cho Thomas. Kho không liên kết thì để trống."]},
    {"no": "3", "ja": "住所", "vi": "Địa chỉ", "sel": "-", "kind": "area", "trig": "view", "detail": ["倉庫の住所（1件）。", "Địa chỉ của kho (1 bản ghi)."]},
    {"no": "3.1", "ja": "郵便番号", "vi": "Mã bưu chính", "sel": "-", "kind": "text", "trig": "input", "err": ["E01", "E05"], "req": "○", "len": "文字列 8", "ex": ["105-0011", "Ví dụ của mục 'Mã bưu điện': mã bưu điện 7 chữ số của Nhật, có dạng 3-4 chữ số cách nhau bằng gạch nối."], "detail": ["数字7桁。ハイフンは任意（保存は 123-4567）。右の「住所検索」で郵便番号から住所を入れる。", "7 chữ số. Dấu gạch ngang tùy chọn (lưu dạng 123-4567). Nút 「住所検索」 bên phải điền địa chỉ từ mã bưu điện."]},
    {"no": "3.2", "ja": "住所検索", "vi": "Tìm địa chỉ", "sel": "-", "kind": "button", "trig": "click", "detail": ["郵便番号から、都道府県・市区町村・町域・番地を入れる（入れたあとも直せる）。見つからないときは E01 ではなく I01「該当する住所がありません」。", "Điền tỉnh/thành, quận/huyện, khu vực, số nhà từ mã bưu điện (sau khi điền vẫn sửa được). Nếu không tìm thấy thì không dùng E01 mà hiện I01 「該当する住所がありません」."]},
    {"no": "3.3", "ja": "都道府県", "vi": "Tỉnh thành", "sel": "-", "kind": "text", "trig": "input", "err": ["E01"], "req": "○", "len": "文字列 20", "ex": ["東京都", "Ví dụ của mục 'Tỉnh/thành phố (todofuken)': tên tỉnh/thành của Nhật (ở đây là một thành phố trực thuộc trung ương)."], "detail": ["入力欄（hong 2026-10-07）。「住所検索」で入る。", "Ô nhập (hong 2026-10-07). Nhập bằng 「住所検索」."]},
    {"no": "3.4", "ja": "市区町村", "vi": "Quận huyện thành phố", "sel": "-", "kind": "text", "trig": "input", "err": ["E01", "E04"], "req": "○", "len": "文字列 255", "ex": ["港区", "Ví dụ của mục 'Quận/huyện/thành phố': tên quận, thành phố hoặc thị trấn thuộc tỉnh/thành đã chọn."], "detail": ["", ""]},
    {"no": "3.5", "ja": "町域・番地", "vi": "Phường/xã・số nhà", "sel": "-", "kind": "text", "trig": "input", "err": ["E01", "E04"], "req": "○", "len": "文字列 255", "ex": ["芝公園1-2-3", "Shibakoen 1-2-3"], "detail": ["", ""]},
    {"no": "3.6", "ja": "建物・部屋番号", "vi": "Tòa nhà・số phòng", "sel": "-", "kind": "text", "trig": "input", "err": ["E04"], "req": "－", "len": "文字列 255", "ex": ["〇〇ビル5F", "Tòa nhà XX tầng 5"], "detail": ["", ""]},
    {"no": "3.7", "ja": "電話番号", "vi": "Số điện thoại", "sel": "-", "kind": "text", "trig": "input", "err": ["E01", "E06"], "req": "○", "len": "文字列 20", "ex": ["03-1234-5678", "Ví dụ của mục 'Số điện thoại': số điện thoại cố định của Nhật, gồm chữ số và dấu gạch nối (mã vùng-số)."], "detail": ["数字とハイフン。", "Chữ số và dấu gạch nối."]},
    {"no": "3.8", "ja": "FAX番号", "vi": "Số FAX", "sel": "-", "kind": "text", "trig": "input", "err": ["E06"], "req": "－", "len": "文字列 20", "ex": ["03-1234-5679", "03-1234-5679"], "detail": ["数字とハイフン。", "Chữ số và dấu gạch nối."]},
    {"no": "3.9", "ja": "備考", "vi": "Ghi chú", "sel": "-", "kind": "textarea", "trig": "input", "err": ["E04"], "req": "－", "len": "文字列 500", "ex": ["午前着のみ", "Chỉ giao buổi sáng"], "detail": ["運営だけが見るメモ。", "Ghi chú chỉ bên vận hành xem."]},
    {"no": "4", "ja": "担当者（表）", "vi": "Người phụ trách (dạng bảng)", "sel": "-", "kind": "area", "trig": "view", "detail": ["担当者を表で入れる。「メイン担当者」はちょうど1行（必須）、「サブ担当者」は0行以上（「行を追加」「行を削除」）。メイン担当者のメールアドレスがログイン案内・パスワード送信の宛先。", "Nhập người phụ trách dạng bảng. 「メイン担当者」 đúng 1 dòng (bắt buộc), 「サブ担当者」 từ 0 dòng trở lên (「行を追加」「行を削除」). Email của người phụ trách chính là địa chỉ nhận hướng dẫn đăng nhập và gửi mật khẩu."]},
    {"no": "4.1", "ja": "区分", "vi": "Phân loại", "sel": "-", "kind": "select", "trig": "select", "err": ["E01"], "req": "○", "len": ["選択（メイン担当者／サブ担当者）", "Chọn (người phụ trách chính / phụ)"], "ex": ["メイン担当者", "Người phụ trách chính"], "detail": ["メイン担当者は1行だけ。2行目からはサブ担当者。", "Người phụ trách chính chỉ có 1 dòng. Từ dòng thứ 2 là người phụ trách phụ."]},
    {"no": "4.2", "ja": "担当者名", "vi": "Tên người phụ trách", "sel": "-", "kind": "text", "trig": "input", "err": ["E01", "E04"], "req": "○", "len": "文字列 60", "ex": ["担当 太郎", "Tanto Taro"], "detail": ["担当者の名前。", "Tên của người phụ trách."]},
    {"no": "4.3", "ja": "フリガナ", "vi": "Furigana", "sel": "-", "kind": "text", "trig": "input", "err": ["E03", "E04"], "req": "－", "len": "文字列 60", "ex": ["タントウ タロウ", "Tantou Tarou"], "detail": ["全角カタカナ。", "Katakana toàn chiều rộng."]},
    {"no": "4.4", "ja": "メールアドレス", "vi": "Địa chỉ email", "sel": "-", "kind": "text", "trig": "input", "err": ["E01", "E07"], "req": "○", "len": "文字列 160", "ex": ["sample@example.jp", "sample@example.jp"], "detail": ["メール形式。メイン担当者のメールがアカウント案内の宛先。", "Định dạng email. Email của người phụ trách chính là địa chỉ nhận thông báo tài khoản."]},
    {"no": "4.5", "ja": "TEL", "vi": "TEL", "sel": "-", "kind": "text", "trig": "input", "err": ["E06"], "req": "－", "len": "文字列 20", "ex": ["012-345-6789", "012-345-6789"], "detail": ["数字とハイフン。", "Chữ số và dấu gạch nối."]},
    {"no": "4.6", "ja": "行を追加／行を削除", "vi": "Thêm dòng / Xóa dòng", "sel": "-", "kind": "button", "trig": "click", "detail": ["サブ担当者の行を足す・消す（メイン担当者の行は消せない）。", "Thêm/xóa dòng người phụ trách phụ (không xóa được dòng người phụ trách chính)."]},
    {"no": "5", "ja": "キャンセル", "vi": "Hủy bỏ", "sel": "-", "kind": "button", "trig": "click", "err": ["Q02"], "detail": ["一覧へ戻る（編集のときは詳細へ）。入力を変えていたら Q02（キャンセル／破棄）。", "Quay về danh sách (khi đang sửa thì quay về chi tiết). Nếu đã thay đổi nội dung nhập thì hiển thị Q02 (Hủy / Bỏ thay đổi)."]},
    {"no": "6", "ja": "登録・保存", "vi": "Đăng ký・Lưu", "sel": "-", "kind": "button", "trig": "click", "err": ["S01", "E30", "E31"], "detail": ["押すとまとめてチェック（項目の下にエラー・赤枠。保存ボタンの横に「保存できません（n件）」）。エラーがなければ保存して S01。ボタンは押したら無効にする。ほかの人が先に保存していたら E31（P-FORM）。", "Khi bấm sẽ kiểm tra toàn bộ cùng lúc (lỗi và viền đỏ bên dưới từng mục; bên cạnh nút lưu hiển thị 「保存できません（n件）」). Nếu không có lỗi thì lưu và hiển thị S01. Nút bị vô hiệu hóa sau khi bấm. Nếu người khác đã lưu trước thì hiển thị E31 (P-FORM)."]},
]

I5 = [
    {"no": "1", "ja": "削除の確認", "vi": "Xác nhận xóa", "sel": ".modal", "kind": "modal", "trig": "click", "pattern": "P-DEL", "err": ["Q01", "S02", "E30"], "detail": ["タイトル「削除」。「キャンセル」「削除する」。「削除する」で論理削除（状態＝削除済）して S02。一覧から外れ、検索条件で「削除済」を選ぶと表示される。削除すると、この倉庫のアカウントはログインできなくなる。", "Tiêu đề 「削除」. Có 「キャンセル」「削除する」. Khi nhấn 「削除する」 thì xóa logic (trạng thái = đã xóa) và hiện S02. Bị loại khỏi danh sách; chọn 「削除済」 ở điều kiện tìm kiếm thì sẽ hiển thị. Khi xóa, tài khoản của kho này không thể đăng nhập."]},
]

I6 = [
    {"no": "1", "ja": "削除できない", "vi": "Không thể xóa", "sel": ".ov .mbox", "kind": "modal", "trig": "click", "err": ["E242"], "detail": ["在庫が残っている、または利用中の契約・配送設定が n件あるとき（E242）は削除できない。モーダルの「閉じる」で閉じる。条件は hong 確認済み（2026-10-06）。", "Khi còn tồn kho hoặc có n hợp đồng/cấu hình giao hàng đang dùng (E242) thì không xóa được. Đóng modal bằng 「閉じる」. Điều kiện đã được hong xác nhận (2026-10-06)."]},
]

I7 = [
    {"no": "1", "ja": "0件の表示", "vi": "Hiển thị 0 bản ghi", "sel": ".tbl, .empty", "kind": "area", "trig": "view", "pattern": "P-LIST", "err": ["I01"], "detail": ["検索条件に合う倉庫がないとき、一覧の中に I01「表示するデータがありません。」を出す（P-LIST）。ページ送りは出さない。条件は「クリア」で戻せる。", "Khi không có kho nào khớp điều kiện tìm kiếm, hiển thị I01「表示するデータがありません。」trong danh sách (P-LIST). Không hiển thị phân trang. Có thể khôi phục điều kiện bằng 「クリア」."]},
]

I8 = [
    {"no": "1", "ja": "参照のみ（権限が閲覧だけの役割）", "vi": "Chỉ xem (vai trò chỉ có quyền xem)", "sel": ".ph", "kind": "area", "trig": "view", "cond": ["経理（倉庫マスタは閲覧のみ）", "Kế toán (「経理」) (danh mục gốc kho chỉ được xem)"], "detail": ["経理（倉庫マスタは閲覧のみ）。「新規登録」「CSV取込」「アカウント一括発行」は出さない。CSV出力は出す（P-LIST・権限表）。", "Kế toán (「経理」) (danh mục gốc kho chỉ được xem). Không hiển thị 「新規登録」「CSV取込」「アカウント一括発行」. Vẫn hiển thị xuất CSV (P-LIST・bảng quyền)."]},
    {"no": "2", "ja": "一覧の操作の列", "vi": "Cột thao tác của danh sách", "sel": ".tbl", "kind": "table", "trig": "view", "detail": ["行の鉛筆（編集）・ごみ箱（削除）・「契約の一括変更」は出さない。名前のリンクで詳細は開ける（詳細も「編集」「削除」を出さない）。", "Không hiển thị biểu tượng bút chì (sửa), thùng rác (xóa) ở từng dòng và 「契約の一括変更」. Vẫn mở được chi tiết bằng liên kết tên (trong chi tiết cũng không hiển thị 「編集」「削除」)."]},
]

I9 = [
    {"no": "1", "ja": "必須の入力エラー", "vi": "Lỗi nhập bắt buộc", "sel": ".emsg", "kind": "label", "trig": "view", "pattern": "P-FORM", "err": ["E01", "E04"], "detail": ["何も入れずに「登録」を押すと、必須の項目の下に E01 を出して赤枠にする（保存しない）。形式・文字数のエラーも同じ並びで項目の下に出す。最初のエラーの項目へスクロールする。保存ボタンの横に「保存できません（n件）」を出す。", "Nếu bấm 「登録」 khi chưa nhập gì, hiển thị E01 bên dưới các mục bắt buộc và tô viền đỏ (không lưu). Lỗi về định dạng・số ký tự cũng hiển thị bên dưới từng mục theo cùng thứ tự. Cuộn đến mục lỗi đầu tiên. Bên cạnh nút lưu hiển thị 「保存できません（n件）」."]},
]

I10 = [
    {"no": "1", "ja": "タブ", "vi": "Tab", "sel": "-", "kind": "tab", "trig": "click", "pattern": "P-TAB", "detail": ["詳細の上のタブ。「基本情報」「変更履歴」。初期は「基本情報」。", "Tab phía trên chi tiết. 「基本情報」「変更履歴」. Mặc định là 「基本情報」."]},
    {"no": "2", "ja": "変更履歴の表", "vi": "Bảng lịch sử thay đổi", "sel": "-", "kind": "table", "trig": "view", "pattern": "P-HIST", "err": ["I01"], "detail": ["列：変更日時・変更内容・変更者。新しい順。1ページ 10件。0件は I01。履歴に「影響した拠点数」「バージョン」は持たない（P-HIST）。変更者＝運営のアカウント名／「CSV取込」。表示だけ（直せない）。", "Cột: thời điểm thay đổi, nội dung thay đổi, người thay đổi. Mới nhất lên trước. 10 dòng/trang. 0 dòng hiện I01. Lịch sử không có 「影響した拠点数」「バージョン」 (P-HIST). Người thay đổi = tên tài khoản vận hành / 「CSV取込」. Chỉ hiển thị (không sửa được)."]},
]

I11 = [
    {"no": "1", "ja": "取り込みの手順（ステップ）", "vi": "Các bước nhập (bước)", "sel": ".steps", "kind": "area", "trig": "view", "pattern": "P-CSV", "detail": ["上に ①ファイルを選ぶ ②確認・登録 の2ステップ。いまは ② 。「ファイルを選び直す」で ① へ戻る（取り込んだ内容は捨てる）。", "Phía trên có 2 bước: ① Chọn file ② Xác nhận・đăng ký. Hiện đang ở bước ②. Nhấn 「ファイルを選び直す」 để quay lại ① (bỏ nội dung đã nhập)."]},
    {"no": "2", "ja": "ファイル名・件数", "vi": "Tên file・số bản ghi", "sel": ".badge", "kind": "label", "trig": "view", "detail": ["ファイル名と全体の件数。バッジで 新規／更新／変更なし／エラー の件数を出す。", "Tên file và tổng số bản ghi. Badge hiển thị số lượng Mới / Cập nhật / Không đổi / Lỗi."]},
    {"no": "3", "ja": "エラーの行（通知と表）", "vi": "Dòng lỗi (thông báo và bảng)", "sel": ".notice.ng", "kind": "area", "trig": "view", "err": ["E34"], "detail": ["エラーの行がある間は赤の通知「エラーの行 n件は取り込みません（行番号と内容は下の表）。ほかの行は「登録」で登録します。」と、エラー一覧（行番号・キー・列名・内容）を出す。エラー一覧は CSV でも出せる（「エラー一覧CSV」）。エラーの行は取り込まない（hong 2026/10/05）。", "Khi còn dòng lỗi, hiển thị thông báo đỏ 「エラーの行 n件は取り込みません（行番号と内容は下の表）。ほかの行は「登録」で登録します。」 và danh sách lỗi (số dòng・khóa・tên cột・nội dung). Danh sách lỗi cũng xuất được ra CSV (「エラー一覧CSV」). Dòng lỗi không được nhập (hong 2026/10/05)."]},
    {"no": "4", "ja": "登録する内容（前 → 後）", "vi": "Nội dung sẽ đăng ký (trước → sau)", "sel": ".tbl", "kind": "table", "trig": "view", "pattern": "P-LIST", "detail": ["列：行番号・区分（新規／更新）・キー・名前・変わる項目（前 → 後）。変わらない行は出さない。1ページ 10件。", "Cột: số dòng・phân loại (mới/cập nhật)・khóa・tên・mục thay đổi (trước → sau). Dòng không thay đổi thì không hiển thị. 10 dòng mỗi trang."]},
    {"no": "5", "ja": "登録", "vi": "Đăng ký", "sel": ".btn.pri.lg", "kind": "button", "trig": "click", "err": ["S03", "E34"], "cond": ["取り込めるデータが1行以上あるとき", "Khi có từ 1 dòng dữ liệu nhập được trở lên"], "detail": ["エラー以外の行を登録する。成功したら S03「n件を登録しました」を出して一覧へ。登録できる行が0件のときは押せない。取り込むとき変更履歴に「CSV取込」の名前で残る。", "Đăng ký các dòng không lỗi. Thành công thì hiện S03 「n件を登録しました」 và chuyển về danh sách. Không nhấn được khi số dòng có thể đăng ký là 0. Khi nhập, lịch sử thay đổi ghi lại với tên 「CSV取込」."]},
    {"no": "6", "ja": "ファイルを選び直す", "vi": "Chọn lại file", "sel": ".btn.out", "kind": "button", "trig": "click", "detail": ["① へ戻る。", "Quay lại ①."]},
]

VIEWS = [
    V("001", "AW_WRHS_001", "初期表示", "Hiển thị ban đầu", "/ops/masters/warehouses", I1),
    V("002", "AW_WRHS_002", "初期表示（ステップ1 ファイルを選ぶ）", "Hiển thị ban đầu (Bước 1 Chọn tệp)", "/ops/masters/warehouses/import", I2),
    V("003", "AW_WRHS_003", "詳細", "Chi tiết", "/ops/masters/warehouses/WH00001", I3),
    V("004", "AW_WRHS_004", "登録・編集", "Đăng ký・sửa", "/ops/masters/warehouses/new", I4),
    V("005", "AW_WRHS_001", "削除の確認", "Xác nhận xóa", "/ops/masters/warehouses", I5, setup="document.querySelector('.tbl tbody tr .act button:last-child')?.click(); await sleep(300);"),
    V("006", "AW_WRHS_001", "削除できない（在庫・契約あり）", "Không thể xóa (có tồn kho・hợp đồng)", "/ops/masters/warehouses", I6, setup="document.querySelector('.tbl tbody tr .act button:last-child')?.click(); await sleep(300); [...document.querySelectorAll('.modal button')].find(b=>(b.textContent||'').includes('削除する'))?.click(); await sleep(500);"),
    V("007", "AW_WRHS_001", "0件（検索結果なし）", "0 bản ghi (không có kết quả tìm kiếm)", "/ops/masters/warehouses", I7, setup="const kw=document.querySelector('.es-search input'); if(kw){Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(kw,'zzzzzz'); kw.dispatchEvent(new Event('input',{bubbles:true})); await sleep(200); clickText('button','検索'); await sleep(600);}"),
    V("008", "AW_WRHS_001", "参照のみ（閲覧の権限だけ）", "Chỉ xem (chỉ có quyền xem)", "/ops/masters/warehouses", I8, login="Ad00012"),
    V("009", "AW_WRHS_004", "入力エラー", "Lỗi nhập", "/ops/masters/warehouses/new", I9, setup="clickText('.ph button','登録'); await sleep(500);"),
    V("011", "AW_WRHS_003", "詳細（変更履歴のタブ）", "Chi tiết (tab lịch sử thay đổi)", "/ops/masters/warehouses/WH00001?tab=hist", I10),
    V("010", "AW_WRHS_002", "確認・登録（ステップ2）", "Xác nhận・đăng ký (bước 2)", "/ops/masters/warehouses/import", I11, setup="const res=await fetch('/api/domain/csv/export',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json','x-es-site':'ops'},body:JSON.stringify({args:{entity:'warehouses',scope:{site:'ops'}}})});const t=await res.json();const esc=v=>'\"'+String(v??'').replace(/\"/g,'\"\"')+'\"';const rows=[t.head,...t.rows];const r0=t.rows[0];const ni=t.head.findIndex(h=>/倉庫名/.test(h));if(ni>=0)r0[ni]=r0[ni]+' X';const bad=t.rows[0].slice();bad[0]='XX999999';rows.push(bad);const text='\\ufeff'+rows.map(r=>r.map(esc).join(',')).join('\\r\\n');const inp=document.querySelector('input[type=file]');const dt=new DataTransfer();dt.items.add(new File([text],'取込テスト.csv',{type:'text/csv'}));inp.files=dt.files;inp.dispatchEvent(new Event('change',{bubbles:true}));await sleep(2500);", note=["ファイルを選んだ直後。見本は今のデータの CSV出力に、1行目の倉庫名を変えた（更新の見本）と、キーが誤りの行を1つ足したもの（エラーの行の見本）。", "Ngay sau khi chọn file. File mẫu là CSV xuất từ dữ liệu hiện tại, đổi tên kho ở dòng 1 (mẫu cập nhật) và thêm 1 dòng có khóa sai (mẫu dòng lỗi)."]),
]
