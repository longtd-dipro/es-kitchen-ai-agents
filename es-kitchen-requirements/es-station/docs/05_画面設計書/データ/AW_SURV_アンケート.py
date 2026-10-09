# -*- coding: utf-8 -*-
"""
画面設計書のデータ：運営管理者Web「アンケート管理」（AW_SURV）。
元は本物の Web（このリポジトリのコード）。決定は docs/決定台帳.md（E「アンケート…」の行）が正。
洗い出し・確認の記録は docs/05_画面設計書/確認メモ_AW_SURV_アンケート.md。

画面：AW_SURV_001 アンケート一覧／002 アンケート登録・編集／003 アンケート詳細（回答の集計）／004 アンケートCSV取込（画面コード規約 2026-10-05：Feature 4文字＝SURV）
見本のデータ（今日＝2026-10-05）：SV-1020 削除済／SV-1021 終了／SV-1023 配信停止／SV-1024 公開中（全員）／SV-1025 公開中（個別選択）／SV-1026 予定中

コードと決定が違うところ（demo_ok＝決定が正・コードを直す宿題）：
  ・個別選択は 法人・拠点 を選んで保存する（コードは利用者を1人ずつ選ぶ）
  ・アンケート名・テンプレート名・選択肢の最大 60 文字（コードは 100）
  ・一覧の列名「回答開始日時」「回答終了日時」、設問の「設問タイプ」（コードは 開始期間・終了期間・カテゴリ）
  ・配信停止は編集不可（コードは編集できる）
  ・一覧の初期の並びは 回答終了日時 の降順（コードは アンケートID の降順）
"""

TITLE = ["アンケート管理（AW_SURV）", "Quản lý khảo sát (AW_SURV)"]
SHEET = ["アンケート管理", "Quản lý khảo sát"]
BASENAME = "画面設計書_AW_SURV_アンケート管理"
IMG_PREFIX = "AW_SURV"
OUT_DIR = "AW_SURV_アンケート管理"
CODE_NOTE = ["画面コード規約（docs/01_仕様/画面コード規約_20261005.md）：<Module(2)>_<Feature(4)>_<Seq(3)>。AW＝Admin Web、SURV＝アンケート", "Quy ước mã màn hình (画面コード規約_20261005): <Module(2)>_<Feature(4)>_<Seq(3)>. AW = Admin Web, SURV = khảo sát"]
SITE = "ops"
SYSTEM = {"ja": "運営管理者Web", "vi": "Web quản trị vận hành"}
AUTHOR = "Claude（cloud）／確認：hong"
CREATED = "2026-10-05"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "ops", "loginId": "Ad00010"}

# hong に確認して決めたこと（確認メモ Q1〜Q9。Excel の「確認ログ」シートに出る）
DECISIONS = [
    {"date": "2026-10-05", "target": "AW_SURV 全体",
     "q": ["コードに「2026/10/03 決定」とある6点（回答者はアプリの利用者だけ／始まったあとは文言だけ／テンプレート／回答CSV／設問CSV取込／リマインド）は決定か", "6 điểm code ghi là quyết định 2026/10/03 có đúng không"],
     "a": ["6点とも決定。台帳 E に追加", "Đúng cả 6. Đã ghi vào 台帳 E"], "src": "hong 回答 2026/10/05（Q1）"},
    {"date": "2026-10-05", "target": "AW_SURV_002 No.3.8・4",
     "q": ["個別選択は人を保存するか、法人・拠点を保存するか", "個別選択 lưu từng người hay lưu 法人・拠点"],
     "a": ["法人・拠点を選んで保存する（動的。いまその法人・拠点に属する利用者が回答できる）。コードの「人を1人ずつ選ぶ」は宿題", "Lưu 法人・拠点 (động). Code chọn từng người là việc phải sửa"], "src": "hong 回答 2026/10/05（Q1b＝A）"},
    {"date": "2026-10-05", "target": "AW_SURV_002 No.3.2・3.3・5.2・5.5、AW_SURV_003 No.9.1",
     "q": ["最大文字数（アンケート名・テンプレート名・案内文・設問文・選択肢・自由記述の回答）", "Số ký tự tối đa"],
     "a": ["名・テンプレート名・選択肢 60、案内文 500、設問文 200、自由記述の回答 1000、リマインド 1〜30 日", "Tên / tên mẫu / lựa chọn 60, 案内文 500, 設問文 200, trả lời tự do 1000, nhắc 1〜30 ngày"], "src": "hong 回答 2026/10/05（Q2＝A）"},
    {"date": "2026-10-05", "target": "AW_SURV_001 No.3.4・3.5、AW_SURV_002 No.5.3",
     "q": ["列名「開始期間／終了期間」と「カテゴリ」をどう揃えるか", "Thống nhất tên cột 開始期間／終了期間 và カテゴリ"],
     "a": ["「回答開始日時」「回答終了日時」「設問タイプ」に統一", "Dùng 回答開始日時 / 回答終了日時 / 設問タイプ ở mọi nơi"], "src": "hong 回答 2026/10/05（Q3＝A）"},
    {"date": "2026-10-05", "target": "AW_SURV_003 状態 029",
     "q": ["配信停止のアンケートを編集・削除できるか", "Khảo sát 配信停止 có sửa / xóa được không"],
     "a": ["編集できない。削除はできる", "Không sửa, xóa được"], "src": "hong 回答 2026/10/05（Q4＝B）"},
    {"date": "2026-10-05", "target": "AW_SURV_002 No.3.6",
     "q": ["回答開始のお知らせ・リマインドはプッシュだけかメールも送るか", "Thông báo mở / nhắc: chỉ push hay cả mail"],
     "a": ["アプリ内の通知（プッシュ）だけ。9:00 のバッチで送る", "Chỉ thông báo trong app. Gửi ở batch 9:00"], "src": "hong 回答 2026/10/05（Q5＝A）"},
    {"date": "2026-10-05", "target": "AW_SURV 全体（権限）",
     "q": ["権限表ではアンケート管理が全役割 R。だれが作成・編集・削除できるか", "Bảng quyền ghi R cho mọi vai trò; ai được tạo/sửa/xóa"],
     "a": ["フル権限＝CRUD、ほかの6役割＝閲覧。権限表を直した", "フル権限 CRUD, 6 vai trò còn lại chỉ xem. Đã sửa bảng quyền"], "src": "hong 回答 2026/10/05（Q6＝A）"},
    {"date": "2026-10-05", "target": "AW_SURV_001 No.3",
     "q": ["一覧の初期の並び", "Thứ tự mặc định của danh sách"],
     "a": ["回答終了日時の降順", "回答終了日時 giảm dần"], "src": "hong 回答 2026/10/05（Q7＝B）"},
    {"date": "2026-10-05", "target": "AW_SURV_004 No.5",
     "q": ["設問の CSV にアンケートの基本情報も入れるか", "CSV câu hỏi có chứa 基本情報 không"],
     "a": ["入れる（B）：アンケート名・案内文・回答開始日時・回答終了日時 の4列を先頭に。1行目の値で ② の欄を埋める。リマインド・配信対象は画面で選ぶ", "Có (B): thêm 4 cột アンケート名・案内文・回答開始日時・回答終了日時 ở đầu; dòng đầu điền vào ②. リマインド・配信対象 chọn trên màn hình"], "src": "hong 回答 2026/10/05"},
    {"date": "2026-10-05", "target": "AW_SURV_001 No.3.13、AW_SURV_002 No.1",
     "q": ["テンプレートから作成の入口と、一覧からの配信停止", "Nơi đặt nút tạo từ mẫu và dừng phát từ 一覧"],
     "a": ["テンプレートから作成は一覧の画面だけ（登録画面には置かない）。配信停止は一覧の操作の列にも置く", "Tạo từ mẫu chỉ ở 一覧 (không đặt ở màn 登録). 配信停止 có cả ở cột thao tác của 一覧"], "src": "hong 回答 2026/10/05"},
    {"date": "2026-10-05", "target": "AW_SURV_002 No.1.4",
     "q": ["登録・編集の画面でもテンプレートを作れるようにするか", "Có cho tạo mẫu ngay ở màn đăng ký / sửa không"],
     "a": ["A：「テンプレートとして保存」を置く。入力中の案内文・設問だけ確かめて保存し、アンケートは登録しない", "A: đặt nút テンプレートとして保存; chỉ kiểm tra 案内文・設問 đang nhập rồi lưu, không đăng ký アンケート"], "src": "hong 回答 2026/10/05"},
    {"date": "2026-10-05", "target": "AW_SURV_002 No.7、AW_SURV_004 No.1.2",
     "q": ["入力中に画面を離れるときに確認（Q02）を出すか", "Có hỏi xác nhận khi rời màn hình đang nhập không"],
     "a": ["出す（全サイト共通）", "Có (toàn hệ thống)"], "src": "hong 回答 2026/10/05（Q8＝A）"},
]

CHANGES = []

HIDE_ALWAYS = []
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [
    {"code": "AW_SURV_001", "ja": "アンケート一覧", "vi": "Danh sách khảo sát"},
    {"code": "AW_SURV_002", "ja": "アンケート登録・編集", "vi": "Đăng ký / sửa khảo sát"},
    {"code": "AW_SURV_003", "ja": "アンケート詳細（回答の集計）", "vi": "Chi tiết khảo sát (tổng hợp trả lời)"},
    {"code": "AW_SURV_004", "ja": "アンケートCSV取込", "vi": "Nhập CSV khảo sát"},
]

# ---------------------------------------------------------------- setup で使う小さな関数（本物の Web は React なので input イベントを出す）
H = (
    "const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));"
    "const setv=(el,v)=>{if(!el)return;const p=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;"
    "Object.getOwnPropertyDescriptor(p,'value').set.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}));};"
    "const setsel=(el,v)=>{if(!el)return;Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(el,v);el.dispatchEvent(new Event('change',{bubbles:true}));};"
    "const btn=(t,root)=>[...(root||document).querySelectorAll('button')].find(b=>(b.textContent||'').trim().includes(t));"
    "const tab=(t)=>[...document.querySelectorAll('.tabs button')].find(b=>(b.textContent||'').includes(t));"
    "const row=(id)=>[...document.querySelectorAll('tr')].find(tr=>(tr.textContent||'').includes(id));"
    "const upload=async(csv)=>{const inp=document.querySelector('.mbox input[type=file]');const dt=new DataTransfer();"
    "dt.items.add(new File([csv],'アンケート設問.csv',{type:'text/csv'}));inp.files=dt.files;inp.dispatchEvent(new Event('change',{bubbles:true}));await sleep(1500);};"
)
CSV_OK = "No,設問文,設問タイプ,必須,選択肢\\r\\n1,ESステーションの利用頻度をお選びください。,単一選択,必須,週5回以上／週3〜4回／週1〜2回／月に数回\\r\\n2,よく選ぶメニューのジャンルをお選びください。,複数選択,必須,和食／洋食／中華／エスニック／デザート\\r\\n3,今後追加してほしいメニューをご記入ください。,自由記述,任意,"
CSV_MIX = "No,設問文,設問タイプ,必須,選択肢\\r\\n1,ESステーションの利用頻度をお選びください。,単一選択,必須,週5回以上／週3〜4回／週1〜2回／月に数回\\r\\n2,利用頻度をお選びください。,選択,必須,週5回以上／週1〜2回\\r\\n3,今後追加してほしいメニューをご記入ください。,自由記述,任意,"

# ---------------------------------------------------------------- 一覧（AW_SURV_001）の項目
P_FILTER = [
    {"no": "1", "ja": "検索条件", "vi": "Điều kiện tìm kiếm", "sel": ".filter", "kind": "area", "trig": "view", "pattern": "P-LIST",
     "detail": ["検索条件は「検索」か Enter で反映する。", "Điều kiện chỉ áp dụng khi nhấn \"検索\" hoặc Enter."]},
    {"no": "1.1", "ja": "キーワード", "vi": "Từ khóa", "sel": ".filter .search input", "kind": "text", "trig": "input", "req": "－", "len": "文字列 60",
     "ex": ["SV-1024", "ID khảo sát hoặc một phần tên (ví dụ \"10月\")"],
     "detail": ["アンケートID・アンケート名の部分一致。全角・半角、大文字・小文字は区別しない。", "Khớp một phần với アンケートID và アンケート名. Không phân biệt toàn/nửa góc, hoa/thường."]},
    {"no": "1.2", "ja": "ステータス", "vi": "Trạng thái", "sel": ".filter select[aria-label=ステータス]", "kind": "select", "trig": "select", "req": "－",
     "len": ["選択（公開中／予定中／終了／配信停止／削除済）", "Chọn (đang mở / sắp mở / kết thúc / dừng phát / đã xóa)"], "init": ["（すべて）", "(Tất cả)"], "ex": ["公開中", "Chọn 1 trạng thái"],
     "detail": ["ステータスで絞る。「削除済」を選ぶと「削除済みを表示しない」に関係なく削除済が出る。", "Lọc theo trạng thái. Chọn 削除済 thì hiện cả dữ liệu đã xóa dù đang tích \"削除済みを表示しない\"."]},
    {"no": "1.3", "ja": "開始月", "vi": "Tháng bắt đầu", "sel": ".filter [aria-label=開始月]", "kind": "month", "trig": "input", "req": "－", "len": "年月", "ex": ["2026-10", "Tháng của 回答開始日時"],
     "detail": ["回答開始日時の年月が一致するもの。", "Khớp năm-tháng của 回答開始日時."]},
    {"no": "1.4", "ja": "終了月", "vi": "Tháng kết thúc", "sel": ".filter [aria-label=終了月]", "kind": "month", "trig": "input", "req": "－", "len": "年月", "ex": ["2026-10", "Tháng của 回答終了日時"],
     "detail": ["回答終了日時の年月が一致するもの。", "Khớp năm-tháng của 回答終了日時."]},
    {"no": "1.5", "ja": "クリア", "vi": "Xóa điều kiện", "sel": ".filter .f-act button::クリア", "kind": "button", "trig": "click",
     "detail": ["条件を初期値に戻し、一覧も初期の表示に戻す。", "Đưa điều kiện về ban đầu và hiển thị lại danh sách ban đầu."]},
    {"no": "1.6", "ja": "検索", "vi": "Tìm kiếm", "sel": ".filter .f-act button::検索", "kind": "button", "trig": "click",
     "detail": ["条件を一覧に反映し、1ページ目に戻る。", "Áp dụng điều kiện và về trang 1."]},
    {"no": "1.7", "ja": "削除済みを表示しない", "vi": "Không hiện đã xóa", "sel": ".filter label::削除済みを表示しない", "kind": "check", "trig": "check", "req": "－", "init": ["チェックあり", "Có tích"],
     "ex": ["チェックを外す", "Bỏ tích để xem cả khảo sát đã xóa"],
     "detail": ["外すと「削除済」のアンケートも出る（バッジ灰色）。", "Bỏ tích thì hiện cả khảo sát 削除済 (badge xám)."]},
    {"no": "1.8", "ja": "並べ替え", "vi": "Sắp xếp", "sel": ".filter .sortbox", "kind": "select", "trig": "select", "req": "－", "len": ["選択（列）＋昇順／降順", "Chọn cột + tăng / giảm"], "init": ["初期の順（回答終了日時の降順）", "Thứ tự ban đầu (回答終了日時 giảm dần)"],
     "ex": ["ステータス・昇順", "Chọn cột và nhấn nút đổi 昇順/降順"],
     "detail": ["列を選び、ボタンで昇順／降順を切り替える。初期の並びは回答終了日時の降順（hong 2026-10-05）。", "Chọn cột, nhấn nút để đổi tăng/giảm. Thứ tự ban đầu: 回答終了日時 giảm dần (hong 2026-10-05)."],
     "demo_ok": ["コードは アンケートID の降順。回答終了日時の降順に直す", "Code đang sắp theo アンケートID giảm dần; sửa thành 回答終了日時 giảm dần"]},
]
P_HEAD = [
    {"no": "2", "ja": "ヘッダーのボタン", "vi": "Nút ở đầu trang", "sel": ".ph .btns", "kind": "area", "trig": "view",
     "detail": ["権限がないボタンは出さない（基本設計 §10-6）。", "Nút không có quyền thì không hiện (基本設計 §10-6)."]},
    {"no": "2.1", "ja": "CSV取込", "vi": "Nhập CSV", "sel": ".ph .btns button::CSV取込", "kind": "button", "trig": "click", "pattern": "P-CSV",
     "cond": ["アンケート管理の CSV取込 の権限", "Quyền CSV取込 của アンケート管理"],
     "detail": ["アンケートCSV取込（AW_SURV_004）へ。", "Mở màn アンケートCSV取込 (AW_SURV_004)."]},
    {"no": "2.2", "ja": "テンプレートから作成", "vi": "Tạo từ mẫu", "sel": ".ph .btns button::テンプレートから作成", "kind": "button", "trig": "click",
     "cond": ["アンケート管理の 作成 の権限", "Quyền 作成 của アンケート管理"],
     "detail": ["テンプレートを選ぶモーダル（No.6）を出す。", "Mở modal chọn mẫu (No.6)."]},
    {"no": "2.3", "ja": "CSV出力", "vi": "Xuất CSV", "sel": ".ph .btns button::CSV出力", "kind": "button", "trig": "click", "pattern": "P-CSV-OUT",
     "cond": ["アンケート管理の CSV出力 の権限", "Quyền CSV出力 của アンケート管理"],
     "detail": ["検索条件のとおりの全件。1行＝1つの設問（アンケートの列をくり返す）。列：No・アンケートID・アンケート名・設問数・回答開始日時・回答終了日時・対象者数・ステータス・回答数＋設問（No・設問文・設問タイプ・必須・選択肢）。", "Toàn bộ theo điều kiện. 1 dòng = 1 câu hỏi (lặp cột khảo sát). Cột: No, アンケートID, アンケート名, 設問数, 回答開始日時, 回答終了日時, 対象者数, ステータス, 回答数 + câu hỏi (No, 設問文, 設問タイプ, 必須, 選択肢)."]},
    {"no": "2.4", "ja": "新規登録", "vi": "Đăng ký mới", "sel": ".ph .btns button::新規登録", "kind": "button", "trig": "click",
     "cond": ["アンケート管理の 作成 の権限", "Quyền 作成 của アンケート管理"],
     "detail": ["アンケート登録（AW_SURV_002）へ。", "Mở màn アンケート登録 (AW_SURV_002)."]},
]
P_TABLE = [
    {"no": "3", "ja": "アンケートの一覧", "vi": "Bảng khảo sát", "sel": ".card .tbl", "kind": "table", "trig": "view", "pattern": "P-LIST",
     "detail": ["初期の並びは回答終了日時の降順。1ページ 10件（10／20／50）。", "Thứ tự ban đầu 回答終了日時 giảm dần. 10 dòng/trang (10/20/50)."]},
    {"no": "3.1", "ja": "No", "vi": "No", "sel": ".tbl th::No", "kind": "label", "trig": "view", "detail": ["通し番号。", "Số thứ tự."]},
    {"no": "3.2", "ja": "アンケートID", "vi": "ID khảo sát", "sel": ".tbl th::アンケートID", "kind": "link", "trig": "click",
     "detail": ["SV-＋4桁（登録時に自動採番）。押すと詳細（AW_SURV_003）へ。", "SV- + 4 số (tự cấp khi đăng ký). Nhấn để mở chi tiết (AW_SURV_003)."]},
    {"no": "3.3", "ja": "アンケート名", "vi": "Tên khảo sát", "sel": ".tbl th::アンケート名", "kind": "label", "trig": "view", "detail": ["長いときは省略し、マウスを乗せると全文。", "Dài thì cắt, rê chuột hiện đủ."]},
    {"no": "3.4", "ja": "設問数", "vi": "Số câu hỏi", "sel": ".tbl th::設問数", "kind": "label", "trig": "view", "detail": ["「n問」。右寄せ。", "\"n問\". Căn phải."]},
    {"no": "3.5", "ja": "回答開始日時", "vi": "Ngày giờ bắt đầu", "sel": ".tbl th::開始", "kind": "label", "trig": "view", "detail": ["yyyy-mm-dd HH:MM（2行）。", "yyyy-mm-dd HH:MM (2 dòng)."],
     "demo_ok": ["コードの列名は「開始期間」。「回答開始日時」に直す（hong 2026-10-05）", "Code ghi 開始期間; sửa thành 回答開始日時 (hong 2026-10-05)"]},
    {"no": "3.6", "ja": "回答終了日時", "vi": "Ngày giờ kết thúc", "sel": ".tbl th::終了", "kind": "label", "trig": "view", "detail": ["yyyy-mm-dd HH:MM（2行）。", "yyyy-mm-dd HH:MM (2 dòng)."],
     "demo_ok": ["コードの列名は「終了期間」。「回答終了日時」に直す（hong 2026-10-05）", "Code ghi 終了期間; sửa thành 回答終了日時 (hong 2026-10-05)"]},
    {"no": "3.7", "ja": "対象者数", "vi": "Số người nhận", "sel": ".tbl th::対象者数", "kind": "label", "trig": "view",
     "detail": ["いま配信対象に入る利用者の数（全員＝有効な拠点の利用中の利用者、個別選択＝選んだ法人・拠点の利用中の利用者）。動的に数える。", "Số người dùng hiện thuộc đối tượng (全員 = người dùng đang dùng ở chi nhánh hợp lệ; 個別選択 = người dùng ở 法人・拠点 đã chọn). Tính động."]},
    {"no": "3.8", "ja": "回答進捗", "vi": "Tiến độ trả lời", "sel": ".tbl th::回答進捗", "kind": "label", "trig": "view", "detail": ["「回答数/対象者数 回答（割合%）」。割合は四捨五入。", "\"đã trả lời/đối tượng 回答 (tỷ lệ %)\". Tỷ lệ làm tròn."]},
    {"no": "3.9", "ja": "ステータス", "vi": "Trạng thái", "sel": ".tbl th::ステータス", "kind": "label", "trig": "view",
     "detail": ["日時から決める：予定中（開始前・青）→公開中（緑）→終了（灰）。配信停止（灰）・削除済（灰）は操作の記録から。", "Tính từ ngày giờ: 予定中 (trước bắt đầu, xanh dương) → 公開中 (xanh lá) → 終了 (xám). 配信停止 (xám), 削除済 (xám) theo thao tác."]},
    {"no": "3.10", "ja": "編集", "vi": "Sửa", "sel": ".tbl td.act button.e", "kind": "button", "trig": "click",
     "cond": ["予定中・公開中 で、アンケート管理の 編集 の権限", "Trạng thái 予定中・公開中 và có quyền 編集"],
     "detail": ["アンケート編集（AW_SURV_002）へ。終了・配信停止・削除済には出さない。", "Mở アンケート編集 (AW_SURV_002). Không hiện ở 終了・配信停止・削除済."],
     "demo_ok": ["コードは配信停止でも鉛筆を出す。出さないように直す（hong 2026-10-05）", "Code hiện nút sửa cả khi 配信停止; sửa để ẩn (hong 2026-10-05)"]},
    {"no": "3.11", "ja": "削除", "vi": "Xóa", "sel": ".tbl td.act button.d", "kind": "button", "trig": "click", "err": ["Q151", "S02", "E211"], "pattern": "P-DEL",
     "cond": ["予定中・公開中・配信停止 で、アンケート管理の 削除 の権限", "Trạng thái 予定中・公開中・配信停止 và có quyền 削除"],
     "detail": ["Q151 を出し「削除する」で削除済にする（回答の受付をやめ、アプリに出なくなる。データと回答は残る）。終了は削除できない（E211）。", "Hiện Q151; \"削除する\" chuyển sang 削除済 (ngừng nhận trả lời, không hiện trên app; dữ liệu và trả lời giữ). 終了 không xóa được (E211)."]},
    {"no": "3.13", "ja": "配信停止", "vi": "Dừng phát", "sel": ".tbl tbody tr:nth-child(2) td.act", "kind": "button", "trig": "click", "err": ["Q150", "S150", "E212"],
     "cond": ["予定中・公開中 で、配信停止 の権限", "Trạng thái 予定中・公開中 và có quyền 配信停止"],
     "detail": ["操作の列に 編集・削除 と並べて出す（アイコン）。押すと詳細と同じ確認（AW_SURV_003 No.7・Q150）→「配信停止する」で回答の受付をやめ S150。一覧の行は 配信停止 になり、編集・配信停止のアイコンが消える。", "Đặt cạnh 編集・削除 trong cột thao tác (icon). Nhấn thì hiện xác nhận như ở chi tiết (AW_SURV_003 No.7, Q150) → 「配信停止する」 ngừng nhận trả lời, S150. Dòng chuyển sang 配信停止, icon 編集・配信停止 biến mất."],
     "demo_ok": ["コードの一覧には配信停止がない（詳細だけ）。一覧の操作の列に足す（hong 2026-10-05）", "Code chỉ có 配信停止 ở chi tiết; thêm vào cột thao tác của 一覧 (hong 2026-10-05)"]},
    {"no": "3.12", "ja": "0件の表示", "vi": "Hiển thị 0 dòng", "sel": ".tbl td.empty", "kind": "label", "trig": "show", "err": ["I01"],
     "detail": ["条件に合うものがないとき、表の中に I01。", "Không có dòng phù hợp thì hiện I01 trong bảng."],
     "demo_ok": ["コードの文言「条件に一致するデータがありません。検索条件を変えるか「クリア」を押してください。」を I01 に揃える", "Câu chữ trong code khác I01; đồng nhất về I01"]},
    {"no": "4", "ja": "ページ送り", "vi": "Phân trang", "sel": ".card .pager", "kind": "area", "trig": "view",
     "detail": ["「全件数 件中 a–b件」・ページ番号・表示件数（10／20／50、初期 10）。", "\"tổng 件中 a–b件\", số trang, số dòng/trang (10/20/50, mặc định 10)."]},
]
P_DELMODAL = [
    {"no": "5", "ja": "削除の確認", "vi": "Xác nhận xóa", "sel": ".ov .modal", "kind": "modal", "trig": "show", "err": ["Q151"],
     "detail": ["Q151（アンケート名入り）。", "Q151 (có tên khảo sát)."],
     "demo_ok": ["コードの本文は Q151 と少し違う（一覧と詳細でも違う）。Q151 に揃える", "Câu chữ code hơi khác Q151 (一覧 và 詳細 cũng khác nhau); đồng nhất về Q151"]},
    {"no": "5.1", "ja": "キャンセル", "vi": "Hủy", "sel": ".modal button::キャンセル", "kind": "button", "trig": "click", "detail": ["閉じる。何もしない。", "Đóng, không làm gì."]},
    {"no": "5.2", "ja": "削除する", "vi": "Xóa", "sel": ".modal button::削除", "kind": "button", "trig": "click", "err": ["S02", "E211", "E33"],
     "detail": ["削除済にして S02。変更履歴に「削除（削除済として残す）」。", "Chuyển sang 削除済, hiện S02. Ghi lịch sử \"削除（削除済として残す）\"."]},
]
P_TPLMODAL = [
    {"no": "6", "ja": "テンプレートから作成", "vi": "Tạo từ mẫu", "sel": ".ov .mbox", "kind": "modal", "trig": "show",
     "detail": ["テンプレートの案内文・設問を写して新しいアンケートを作る。回答期間・配信対象は写さない。", "Chép 案内文 và 設問 của mẫu để tạo khảo sát mới. Không chép 回答期間・配信対象."]},
    {"no": "6.1", "ja": "テンプレートの一覧", "vi": "Bảng mẫu", "sel": ".mbox .tbl", "kind": "table", "trig": "view",
     "detail": ["列：選択（ラジオ）・テンプレート名（最初からあるものは「標準」バッジ）・設問数・作成（日時・作成者。標準は「—」）・操作。標準が先、あとは ID 順。", "Cột: chọn (radio), tên mẫu (mẫu có sẵn có badge 標準), số câu hỏi, 作成 (ngày giờ, người tạo; 標準 là —), thao tác. Mẫu 標準 trước, sau đó theo ID."]},
    {"no": "6.2", "ja": "テンプレートを選ぶ", "vi": "Chọn mẫu", "sel": ".mbox input[name=sv-tpl]", "kind": "radio", "trig": "select", "req": "○", "ex": ["満足度調査", "Chọn 1 mẫu (hàng cũng nhấn được)"],
     "detail": ["選ぶと下に設問の一覧（設問文・設問タイプ・必須・選択肢）を出す。", "Chọn thì hiện danh sách câu hỏi bên dưới (設問文, 設問タイプ, 必須, 選択肢)."]},
    {"no": "6.3", "ja": "設問の一覧", "vi": "Danh sách câu hỏi", "sel": ".mbox ol", "kind": "label", "trig": "show", "detail": ["選んだテンプレートの設問。", "Câu hỏi của mẫu đã chọn."]},
    {"no": "6.4", "ja": "テンプレートを消す", "vi": "Xóa mẫu", "sel": ".mbox td.act button.d", "kind": "button", "trig": "click", "err": ["S02", "E213"],
     "cond": ["標準でないテンプレート。アンケート管理の 削除 の権限", "Mẫu không phải 標準. Quyền 削除"],
     "detail": ["確認なしで消す（物理削除）。標準は消せない（E213）。", "Xóa ngay không hỏi (xóa thật). Mẫu 標準 không xóa được (E213)."]},
    {"no": "6.5", "ja": "キャンセル", "vi": "Hủy", "sel": ".mbox-f button::キャンセル", "kind": "button", "trig": "click", "detail": ["閉じる。", "Đóng."]},
    {"no": "6.6", "ja": "このテンプレートで作成", "vi": "Tạo bằng mẫu này", "sel": ".mbox-f button::このテンプレートで作成", "kind": "button", "trig": "click",
     "cond": ["テンプレートを選んだとき", "Khi đã chọn mẫu"],
     "detail": ["アンケート登録（AW_SURV_002）を、案内文・設問を写した状態で開く。", "Mở アンケート登録 (AW_SURV_002) với 案内文・設問 đã chép."]},
]

# ---------------------------------------------------------------- 登録・編集（AW_SURV_002）の項目
def head_items(new):
    return [
        {"no": "1", "ja": "ヘッダー", "vi": "Đầu trang", "sel": ".ph", "kind": "area", "trig": "view",
         "detail": ["パンくず：アンケート管理＞アンケート一覧＞" + ("アンケート登録" if new else "アンケート編集") + "。編集はタイトルにアンケートIDとステータスのバッジ。", "Breadcrumb: アンケート管理 > アンケート一覧 > " + ("アンケート登録" if new else "アンケート編集") + ". Khi sửa, tiêu đề có ID và badge trạng thái."]},
    ] + [
        {"no": "1.4", "ja": "テンプレートとして保存", "vi": "Lưu làm mẫu", "sel": ".ph .btns button::テンプレートとして保存", "kind": "button", "trig": "click", "err": ["E04", "E202", "E203", "E204", "E205"],
         "cond": ["テンプレート保存 の権限", "Có quyền lưu mẫu"],
         "detail": ["入力中の案内文と設問だけを確かめ（アンケート名・回答期間・配信対象は見ない）、エラーがなければテンプレート名のモーダル（No.9）を開く。保存してもアンケートは登録されず、この画面の入力はそのまま残る。エラーがあれば該当の欄の下に文言を出し、設問のエラーなら設問タブへ。", "Chỉ kiểm tra 案内文 và 設問 đang nhập (không xem アンケート名・回答期間・配信対象); không lỗi thì mở modal tên mẫu (No.9). Lưu xong アンケート vẫn chưa đăng ký, nội dung đang nhập giữ nguyên. Có lỗi thì hiện dưới ô; lỗi ở 設問 thì chuyển sang tab 設問."]},
        {"no": "1.2", "ja": "キャンセル", "vi": "Hủy", "sel": ".ph .btns button::キャンセル", "kind": "button", "trig": "click", "err": ["Q02"],
         "detail": ["編集中なら Q02。" + ("一覧へ戻る。" if new else "詳細へ戻る。"), "Đang sửa thì hỏi Q02. " + ("Về danh sách." if new else "Về chi tiết.")]},
        {"no": "1.3", "ja": "登録" if new else "保存", "vi": "Đăng ký" if new else "Lưu", "sel": ".ph .btns button.pri", "kind": "button", "trig": "click", "pattern": "P-FORM",
         "err": ["S151", "E30"] if new else ["S01", "E206", "E207", "E208", "E209", "E210", "E30"],
         "cond": ["アンケート管理の 作成 の権限", "Quyền 作成"] if new else ["アンケート管理の 編集 の権限", "Quyền 編集"],
         "detail": ["全項目をチェック（エラーのあるタブに「●」）。登録できたら S151 を出し詳細へ。IDは SV-＋4桁で自動採番。" if new else
                    "全項目をチェック。保存できたら S01 を出し詳細へ。変えた項目を変更履歴に残す。回答が始まったあとの制限は E207〜E210。",
                    "Kiểm tra mọi mục (tab có lỗi hiện \"●\"). Đăng ký xong hiện S151 và về chi tiết. ID tự cấp SV- + 4 số." if new else
                    "Kiểm tra mọi mục. Lưu xong hiện S01 và về chi tiết. Ghi lịch sử các mục đã đổi. Giới hạn sau khi bắt đầu: E207〜E210."]},
        {"no": "2", "ja": "タブ", "vi": "Tab", "sel": ".tabs", "kind": "tab", "trig": "click",
         "detail": ["基本情報／設問" + ("" if new else "／変更履歴") + "。エラーのあるタブに赤い「●」。", "基本情報 / 設問" + ("" if new else " / 変更履歴") + ". Tab có lỗi hiện \"●\" đỏ."]},
    ]

BASIC = [
    {"no": "3", "ja": "基本情報", "vi": "Thông tin cơ bản", "sel": ".card > .sec", "kind": "area", "trig": "view", "pattern": "P-FORM"},
    {"no": "3.1", "ja": "アンケートID", "vi": "ID khảo sát", "sel": ".fld::アンケートID", "kind": "label", "trig": "view",
     "detail": ["登録すると自動で付く（SV-＋4桁）。新規は「登録すると自動で付きます」。", "Tự cấp khi đăng ký (SV- + 4 số). Màn mới hiện \"登録すると自動で付きます\"."]},
    {"no": "3.2", "ja": "アンケート名", "vi": "Tên khảo sát", "sel": "#sv-name", "kind": "text", "trig": "input", "req": "○", "len": "文字列 60", "fid": "sv-name",
     "ex": ["月間ランチメニューアンケート（10月）", "Tên khảo sát hiện trên app"], "err": ["E01", "E04", "E13"],
     "demo_ok": ["コードは 100 文字。60 に直す（hong 2026-10-05）", "Code 100 ký tự; sửa thành 60 (hong 2026-10-05)"]},
    {"no": "3.3", "ja": "案内文（説明）", "vi": "Lời giới thiệu", "sel": "#sv-intro", "kind": "textarea", "trig": "input", "req": "－", "len": ["文字列 500（複数行）", "Chuỗi 500 (nhiều dòng)"], "fid": "sv-intro",
     "ex": ["10月の月間ランチメニューについてのアンケートです。所要時間は約3分です。", "Mục đích, thời gian trả lời, hạn trả lời; hiện ở đầu màn trả lời trên app"], "err": ["E04", "E13"],
     "detail": ["回答画面の冒頭に出す。右下に「入力数/500」。", "Hiện ở đầu màn trả lời. Góc phải dưới hiện \"đã nhập/500\"."]},
    {"no": "3.4", "ja": "回答開始日時", "vi": "Ngày giờ bắt đầu", "sel": "#sv-start^", "kind": "date", "trig": "input", "req": "○", "len": ["日時（yyyy-mm-dd HH:MM）", "Ngày giờ (yyyy-mm-dd HH:MM)"], "init": ["時刻の初期値 08:00", "Giờ mặc định 08:00"],
     "ex": ["2026-11-01 08:00", "Ngày + giờ (phút). Chọn ngày trước rồi mới nhập giờ"], "err": ["E01", "E200", "E207"],
     "detail": ["日付の部品＋時刻（分まで）。回答が始まったあと（開始日時を過ぎた、またはお知らせ済み）は変えられない（欄を無効にし「回答が始まったので変更できません」）。回答開始のお知らせは、この日時のあと最初の 9:00 に対象者へアプリ内通知。", "Ô ngày + giờ (đến phút). Sau khi bắt đầu (qua giờ bắt đầu hoặc đã gửi thông báo) không đổi được (khóa ô, ghi \"回答が始まったので変更できません\"). Thông báo mở gửi vào 9:00 đầu tiên sau mốc này."]},
    {"no": "3.5", "ja": "回答終了日時", "vi": "Ngày giờ kết thúc", "sel": "#sv-end^", "kind": "date", "trig": "input", "req": "○", "len": ["日時（yyyy-mm-dd HH:MM）", "Ngày giờ (yyyy-mm-dd HH:MM)"], "init": ["時刻の初期値 18:00", "Giờ mặc định 18:00"],
     "ex": ["2026-11-20 18:00", "Phải sau 回答開始日時"], "err": ["E01", "E200", "E201", "E209"],
     "valid": ["回答開始日時より後。公開中に直すときは今より後（E209）", "Sau 回答開始日時. Khi đang 公開中 thì phải sau hiện tại (E209)"],
     "detail": ["この日時を過ぎると「終了」になり回答できない。", "Qua mốc này thành 終了, không trả lời được nữa."]},
    {"no": "3.6", "ja": "リマインド通知", "vi": "Thông báo nhắc", "sel": ".fld::リマインド通知", "kind": "check", "trig": "check", "req": "－", "len": ["チェック＋整数 1〜30", "Checkbox + số nguyên 1〜30"], "init": ["チェックなし・3日前", "Không tích, 3 ngày"],
     "ex": ["チェックあり・3日前", "Tích và nhập số ngày trước 回答終了日時"], "err": ["E12"],
     "detail": ["チェックすると、回答終了日時の N 日前の 9:00（土日祝は前の営業日）に、まだ回答していない対象者へアプリ内通知を1回送る。日数は 1〜30。", "Tích thì gửi thông báo trong app 1 lần cho người chưa trả lời vào 9:00 của N ngày trước 回答終了日時 (ngày nghỉ thì ngày làm việc trước đó). N = 1〜30."]},
    {"no": "3.7", "ja": "対象者数", "vi": "Số người nhận", "sel": ".fld::対象者数", "kind": "label", "trig": "show",
     "detail": ["配信対象に入るいまの利用者の数（「n 名」）。配信対象を変えると数え直す。", "Số người dùng hiện thuộc đối tượng (\"n 名\"). Đổi đối tượng thì tính lại."]},
    {"no": "3.8", "ja": "配信対象", "vi": "Đối tượng nhận", "sel": ".radios", "kind": "radio", "trig": "select", "req": "○", "len": ["選択（全員／個別選択）", "Chọn (tất cả / chọn riêng theo công ty, chi nhánh)"], "init": ["全員", "全員 (tất cả)"],
     "ex": ["個別選択", "全員 = mọi người dùng app ở chi nhánh hợp lệ; 個別選択 = chọn 法人・拠点"], "err": ["E02"],
     "detail": ["全員＝有効な拠点（本登録・閉鎖予定で契約が有効・解約手続き中。利用休止・停止は除く）の利用中のアプリ利用者みんな。個別選択＝選んだ法人・拠点に、回答する時点で属する利用中の利用者（法人・拠点のアカウントには出さない）。どちらも動的に決まり、あとから入った人も回答できる。", "全員 = mọi người dùng app đang dùng ở chi nhánh hợp lệ (本登録・閉鎖予定 với hợp đồng 有効・解約手続き中; loại 利用休止・停止). 個別選択 = người dùng đang thuộc 法人・拠点 đã chọn tại lúc trả lời (không gửi cho tài khoản 法人・拠点). Cả hai đều động: người vào sau vẫn trả lời được."],
     "demo_ok": ["コードの個別選択は利用者を1人ずつ選んで保存する。法人・拠点を選んで保存するように直す（hong 2026-10-05 Q1b）", "Code chọn từng người dùng; sửa thành chọn và lưu 法人・拠点 (hong 2026-10-05 Q1b)"]},
    {"no": "3.9", "ja": "選択する", "vi": "Chọn", "sel": ".radios button::選択する", "kind": "button", "trig": "click",
     "cond": ["個別選択のとき（詳細では出さない）", "Khi 個別選択 (không hiện ở chi tiết)"],
     "detail": ["法人・拠点を選ぶダイアログ（No.4）。個別選択に切り替えたとき、まだ選んでいなければ自動で開く。", "Mở dialog chọn 法人・拠点 (No.4). Chuyển sang 個別選択 mà chưa chọn gì thì tự mở."]},
    {"no": "3.10", "ja": "全員の説明", "vi": "Giải thích 全員", "sel": ".hint::有効な拠点", "kind": "label", "trig": "show",
     "cond": ["全員のとき", "Khi 全員"], "detail": ["配信される範囲の説明文。", "Câu giải thích phạm vi gửi."]},
    {"no": "3.11", "ja": "選んだ法人・拠点の表", "vi": "Bảng 法人・拠点 đã chọn", "sel": ".fg .tbl", "kind": "table", "trig": "view",
     "cond": ["個別選択のとき", "Khi 個別選択"],
     "detail": ["列：拠点ID・拠点名・法人名・対象者数（いまの利用中の利用者の数）。詳細では「回答」列（回答済 n／対象 m）を足す。10行ごとにページ送り。", "Cột: 拠点ID, 拠点名, 法人名, 対象者数 (số người dùng hiện tại). Ở chi tiết thêm cột 回答 (đã trả lời n / đối tượng m). 10 dòng/trang."],
     "demo_ok": ["コードは選んだ利用者（ID・ユーザー・法人名・拠点）の表。法人・拠点の表に直す", "Code hiện bảng người dùng đã chọn; sửa thành bảng 法人・拠点"]},
]
PICK = [
    {"no": "4", "ja": "法人・拠点の個別選択", "vi": "Chọn 法人・拠点", "sel": ".ov .mbox", "kind": "modal", "trig": "show",
     "detail": ["配信対象にする法人・拠点を選ぶ。有効な拠点（No.3.8 の条件）だけ出す。", "Chọn 法人・拠点 làm đối tượng. Chỉ hiện chi nhánh hợp lệ (điều kiện No.3.8)."],
     "demo_ok": ["コードは「アプリユーザーの個別選択」（利用者の表）。法人・拠点を選ぶダイアログに直す", "Code là dialog chọn người dùng; sửa thành dialog chọn 法人・拠点"]},
    {"no": "4.1", "ja": "法人", "vi": "Công ty (法人)", "sel": ".mbox select[aria-label=法人]", "kind": "select", "trig": "select", "req": "－", "len": "選択", "init": ["法人（すべて）", "Tất cả"], "ex": ["株式会社サンプル", "Lọc theo 法人; đổi thì 拠点 về (すべて)"],
     "detail": ["絞り込み。変えると拠点の選択肢もその法人のものだけになる。", "Lọc. Đổi 法人 thì danh sách 拠点 chỉ còn của 法人 đó."]},
    {"no": "4.2", "ja": "拠点", "vi": "Chi nhánh (拠点)", "sel": ".mbox select[aria-label=拠点]", "kind": "select", "trig": "select", "req": "－", "len": "選択", "init": ["拠点（すべて）", "Tất cả"], "ex": ["本社", "Lọc theo 拠点"]},
    {"no": "4.3", "ja": "キーワード", "vi": "Từ khóa", "sel": ".mbox input.inp", "kind": "text", "trig": "input", "req": "－", "len": "文字列 60", "ex": ["大阪", "Khớp một phần 法人名・拠点名・ID"],
     "detail": ["Enter か「検索」で反映。", "Áp dụng bằng Enter hoặc \"検索\"."]},
    {"no": "4.4", "ja": "クリア", "vi": "Xóa điều kiện", "sel": ".mbox button::クリア", "kind": "button", "trig": "click", "detail": ["絞り込みを全部戻す（選択は残す）。", "Bỏ hết điều kiện lọc (giữ các mục đã tích)."]},
    {"no": "4.5", "ja": "検索", "vi": "Tìm kiếm", "sel": ".mbox button::検索", "kind": "button", "trig": "click", "detail": ["絞り込みを表に反映。", "Áp dụng lọc vào bảng."]},
    {"no": "4.6", "ja": "拠点の表", "vi": "Bảng 拠点", "sel": ".mbox .tbl", "kind": "table", "trig": "view", "err": ["I01"],
     "detail": ["列：選択・拠点ID・拠点名・法人名・対象者数。10行ごとにページ送り。0件は I01。", "Cột: chọn, 拠点ID, 拠点名, 法人名, 対象者数. 10 dòng/trang. 0 dòng hiện I01."]},
    {"no": "4.7", "ja": "すべて選択", "vi": "Chọn tất cả", "sel": ".mbox th input[type=checkbox]", "kind": "check", "trig": "check", "req": "－", "ex": ["チェック", "Tích/bỏ tích mọi dòng đang lọc (mọi trang)"],
     "detail": ["絞り込んだ行（全ページ）をまとめて選ぶ・外す。", "Tích/bỏ tích toàn bộ dòng đang lọc (mọi trang)."]},
    {"no": "4.8", "ja": "選択", "vi": "Chọn", "sel": ".mbox td input[type=checkbox]", "kind": "check", "trig": "check", "req": "○", "ex": ["チェック", "Tích chi nhánh muốn gửi"],
     "detail": ["ページを移っても選択は残る。", "Chuyển trang vẫn giữ các mục đã tích."]},
    {"no": "4.9", "ja": "選択済", "vi": "Đã chọn", "sel": ".mbox-f b", "kind": "label", "trig": "show", "detail": ["「選択済み：n（追加選択：m）」＝いまの選択の数と、このダイアログで足した数。", "\"選択済み：n（追加選択：m）\" = số đang chọn và số thêm trong dialog này."]},
    {"no": "4.10", "ja": "キャンセル", "vi": "Hủy", "sel": ".mbox-f button::キャンセル", "kind": "button", "trig": "click", "detail": ["選択を捨てて閉じる。", "Bỏ thay đổi và đóng."]},
    {"no": "4.11", "ja": "選択を確定", "vi": "Xác nhận chọn", "sel": ".mbox-f button::選択を確定", "kind": "button", "trig": "click", "err": ["E210"],
     "detail": ["選んだ法人・拠点を配信対象にして閉じる。回答済みの人がいる拠点は外せない（保存のとき E210）。", "Đặt 法人・拠点 đã chọn làm đối tượng và đóng. Chi nhánh có người đã trả lời không bỏ được (khi lưu: E210)."]},
]
def q_items(lock):
    return [
        {"no": "5", "ja": "設問", "vi": "Câu hỏi", "sel": ".card > .sec", "kind": "area", "trig": "view", "err": ["E205"] + (["I150"] if lock else []),
         "detail": [("回答が始まったあとは I150 を出し、文言（設問文・選択肢の文字）だけ直せる。追加・削除・並び・設問タイプ・必須・選択肢の数は変えられない（E208）。" if lock else
                     "設問は1つ以上（E205）。新規は空の設問が1つ。") + "設問ごとに枠（開閉できる）。",
                    ("Sau khi bắt đầu nhận trả lời: hiện I150, chỉ sửa được câu chữ (設問文, chữ của 選択肢). Không thêm/xóa/đổi thứ tự/設問タイプ/必須/số 選択肢 (E208). " if lock else
                     "Ít nhất 1 câu hỏi (E205). Màn mới có sẵn 1 câu hỏi trống. ") + "Mỗi câu hỏi 1 khung (đóng mở được)."]},
        {"no": "5.1", "ja": "設問の枠", "vi": "Khung câu hỏi", "sel": ".sec-b > .sec", "kind": "area", "trig": "view",
         "detail": ["見出し「設問 n」。右に 上へ／下へ／削除／開閉。入力エラーがあれば見出しに「入力内容を確認してください」。", "Tiêu đề \"設問 n\". Bên phải: 上へ / 下へ / 削除 / đóng mở. Có lỗi thì tiêu đề hiện \"入力内容を確認してください\"."]},
        {"no": "5.2", "ja": "設問文", "vi": "Nội dung câu hỏi", "sel": "#sv-q0", "kind": "text", "trig": "input", "req": "○", "len": "文字列 200", "fid": "sv-q0",
         "ex": ["現在ご利用中のメニューに満足していますか。", "Câu hỏi hiện trên app"], "err": ["E01", "E04", "E13"]},
        {"no": "5.3", "ja": "設問タイプ", "vi": "Loại câu hỏi", "sel": "#sv-qt0", "kind": "select", "trig": "select", "req": "○", "len": ["選択（単一選択／複数選択／自由記述）", "Chọn (chọn 1 / chọn nhiều / tự do)"], "fid": "sv-qt0",
         "ex": ["単一選択", "単一選択 = chọn 1; 複数選択 = chọn nhiều; 自由記述 = nhập văn bản (tối đa 1000 ký tự)"], "err": ["E02"],
         "cond": ["回答が始まったあとは変えられない", "Sau khi bắt đầu không đổi được"] if lock else None,
         "detail": ["自由記述にすると選択肢の欄を消す。単一／複数に戻すと選択肢2つの空欄を出す。", "Chọn 自由記述 thì ẩn 選択肢. Về 単一/複数 thì hiện 2 ô 選択肢 trống."],
         "demo_ok": ["コードの欄の名前は「カテゴリ」。「設問タイプ」に直す（hong 2026-10-05）", "Code ghi nhãn カテゴリ; sửa thành 設問タイプ (hong 2026-10-05)"]},
        {"no": "5.4", "ja": "必須回答にする", "vi": "Bắt buộc trả lời", "sel": ".fld::回答設定", "kind": "check", "trig": "check", "req": "－", "init": ["チェックなし", "Không tích"], "ex": ["チェックあり", "Người dùng phải trả lời câu này mới gửi được"],
         "cond": ["回答が始まったあとは変えられない", "Sau khi bắt đầu không đổi được"] if lock else None,
         "detail": ["アプリでこの設問に答えないと送信できない。集計に「必須」「任意」のバッジ。", "Trên app phải trả lời mới gửi được. Trang tổng hợp hiện badge 必須/任意."]},
        {"no": "5.5", "ja": "選択肢", "vi": "Lựa chọn", "sel": ".fld::選択肢", "kind": "text", "trig": "input", "req": "条件付き", "len": ["文字列 60 × 2つ以上", "Chuỗi 60 × từ 2 ô trở lên"],
         "ex": ["とても満足／満足／どちらともいえない／やや不満／不満", "Mỗi ô 1 lựa chọn, ít nhất 2, không trùng, không trống"], "err": ["E202", "E203", "E204", "E04"],
         "cond": ["設問タイプが単一選択・複数選択のとき必須", "Bắt buộc khi 設問タイプ là 単一選択/複数選択"],
         "detail": ["番号つきの入力欄。2つ以上（E202）、空欄なし（E203）、同じものなし（E204）。", "Ô nhập có số thứ tự. Ít nhất 2 (E202), không trống (E203), không trùng (E204)."],
         "demo_ok": ["コードは 100 文字。60 に直し、サーバー側でも確かめる（hong 2026-10-05）", "Code 100 ký tự; sửa thành 60 và kiểm tra cả phía server (hong 2026-10-05)"]},
        {"no": "5.6", "ja": "選択肢を削除", "vi": "Xóa lựa chọn", "sel": "button[aria-label=\"選択肢 1 を削除\"]", "kind": "button", "trig": "click",
         "cond": ["回答が始まる前", "Trước khi bắt đầu"], "detail": ["その選択肢の行を消す。", "Xóa dòng lựa chọn đó."]},
        {"no": "5.7", "ja": "選択肢を追加", "vi": "Thêm lựa chọn", "sel": "button::選択肢を追加", "kind": "button", "trig": "click",
         "cond": ["回答が始まる前", "Trước khi bắt đầu"], "detail": ["空の選択肢を末尾に足す。", "Thêm 1 ô trống ở cuối."]},
        {"no": "5.8", "ja": "設問を削除", "vi": "Xóa câu hỏi", "sel": ".sec-b > .sec .sec-h button.dan", "kind": "button", "trig": "click",
         "cond": ["設問が2つ以上で、回答が始まる前", "Có từ 2 câu hỏi và trước khi bắt đầu"], "detail": ["確認なしで枠ごと消す。", "Xóa cả khung, không hỏi lại."]},
        {"no": "5.9", "ja": "上へ・下へ", "vi": "Lên / xuống", "sel": "button[aria-label=\"設問 2 を上へ\"]", "kind": "button", "trig": "click",
         "cond": ["回答が始まる前", "Trước khi bắt đầu"], "detail": ["設問の順番を入れ替える（番号は付け直す）。", "Đổi thứ tự câu hỏi (đánh lại số)."]},
        {"no": "5.10", "ja": "設問を追加", "vi": "Thêm câu hỏi", "sel": "button::設問を追加", "kind": "button", "trig": "click",
         "cond": ["回答が始まる前", "Trước khi bắt đầu"], "detail": ["空の設問（選択肢2つ）を末尾に足す。", "Thêm câu hỏi trống (2 lựa chọn) ở cuối."]},
    ]
HIST = [
    {"no": "6", "ja": "変更履歴", "vi": "Lịch sử thay đổi", "sel": ".card > .sec .tbl", "kind": "table", "trig": "view",
     "detail": ["列：変更日時・変更内容・変更者。新しい順。登録・変更（変えた項目名。日時は前→後）・回答開始のお知らせ（n名）・リマインド（未回答者 n名）・配信停止・削除。システムの処理は変更者「システム」。", "Cột: 変更日時, 変更内容, 変更者. Mới nhất trên. Gồm đăng ký, thay đổi (tên mục; ngày giờ ghi trước→sau), gửi thông báo mở (n người), nhắc (n người chưa trả lời), 配信停止, 削除. Xử lý tự động ghi 変更者 = システム."]},
]
DISCARD = [
    {"no": "7", "ja": "編集内容の破棄", "vi": "Bỏ nội dung đang sửa", "sel": ".ov .modal", "kind": "modal", "trig": "show", "err": ["Q02"],
     "detail": ["入力を変えたあとに「キャンセル」や別の画面へ移る・ブラウザを閉じる／再読み込みのとき Q02（Message List No.25）。「破棄」で離れる、「キャンセル」で戻る。", "Đã sửa mà nhấn キャンセル, chuyển màn, đóng/tải lại trình duyệt thì hiện Q02 (Message List No.25). \"破棄\" rời đi, \"キャンセル\" ở lại."],
     "demo_ok": ["コードの本文・ボタン（破棄する／編集を続ける）を Q02（Message List No.25・キャンセル／破棄）に揃える", "Câu chữ và nút trong code khác Q02; đồng nhất về Message List No.25"]},
]
ERRS = [
    {"no": "8", "ja": "入力エラーの表示", "vi": "Hiển thị lỗi nhập", "sel": ".emsg", "kind": "label", "trig": "show", "pattern": "P-FORM", "err": ["E01", "E02", "E04", "E200", "E201", "E12", "E202"],
     "detail": ["エラーの欄は赤枠、文言は欄の下。タブ名に「●」。トーストに「入力内容を確認してください」。", "Ô lỗi viền đỏ, câu báo dưới ô. Tên tab hiện \"●\". Toast \"入力内容を確認してください\"."]},
]

# ---------------------------------------------------------------- 詳細（AW_SURV_003）の項目
V_HEAD = [
    {"no": "1", "ja": "ヘッダー", "vi": "Đầu trang", "sel": ".ph", "kind": "area", "trig": "view",
     "detail": ["タイトル「アンケート編集 SV-xxxx」＋ステータスのバッジ。入力欄はすべて読むだけ。", "Tiêu đề \"アンケート編集 SV-xxxx\" + badge trạng thái. Mọi ô chỉ xem."]},
    {"no": "1.1", "ja": "ステータス", "vi": "Trạng thái", "sel": ".ph h1 .badge", "kind": "label", "trig": "show", "detail": ["公開中（緑）・予定中（青）・終了（灰）・配信停止（灰）・削除済（灰）。", "公開中 (xanh lá), 予定中 (xanh dương), 終了 / 配信停止 / 削除済 (xám)."]},
    {"no": "1.2", "ja": "削除", "vi": "Xóa", "sel": ".ph .btns button.dan", "kind": "button", "trig": "click", "err": ["Q151", "S02", "E211"], "pattern": "P-DEL",
     "cond": ["予定中・公開中・配信停止 で、削除 の権限", "予定中・公開中・配信停止 và có quyền 削除"],
     "detail": ["Q151 → 削除済にして一覧へ。終了・削除済には出さない。", "Q151 → chuyển 削除済 và về danh sách. Không hiện ở 終了・削除済."]},
    {"no": "1.3", "ja": "配信停止", "vi": "Dừng phát", "sel": ".ph .btns button::配信停止", "kind": "button", "trig": "click", "err": ["Q150", "S150", "E212"],
     "cond": ["予定中・公開中 で、配信停止 の権限", "予定中・公開中 và có quyền 配信停止"],
     "detail": ["Q150 → 回答の受付をやめる（回答は残す）。元に戻せない。変更履歴に「配信停止」。", "Q150 → ngừng nhận trả lời (giữ trả lời). Không hoàn lại. Ghi lịch sử \"配信停止\"."]},
    {"no": "1.4", "ja": "テンプレートとして保存", "vi": "Lưu làm mẫu", "sel": ".ph .btns button::テンプレートとして保存", "kind": "button", "trig": "click",
     "cond": ["テンプレート保存 の権限", "Có quyền lưu mẫu"], "detail": ["モーダル（No.9）。どの状態でも押せる。", "Mở modal (No.9). Trạng thái nào cũng dùng được."]},
    {"no": "1.5", "ja": "編集", "vi": "Sửa", "sel": ".ph .btns button.pri", "kind": "button", "trig": "click",
     "cond": ["予定中・公開中 で、編集 の権限", "予定中・公開中 và có quyền 編集"],
     "detail": ["アンケート編集（AW_SURV_002）へ。終了・配信停止・削除済には出さない。", "Mở アンケート編集 (AW_SURV_002). Không hiện ở 終了・配信停止・削除済."],
     "demo_ok": ["コードは配信停止でも「編集」を出す。出さないように直す（hong 2026-10-05）", "Code hiện 編集 cả khi 配信停止; sửa để ẩn (hong 2026-10-05)"]},
    {"no": "2", "ja": "タブ", "vi": "Tab", "sel": ".tabs", "kind": "tab", "trig": "click",
     "detail": ["基本情報／設問／変更履歴。回答が始まったアンケートの「設問」は回答の集計（No.5）。", "基本情報 / 設問 / 変更履歴. Với khảo sát đã bắt đầu, tab 設問 là tổng hợp trả lời (No.5)."]},
]
V_BASIC = [
    {"no": "3", "ja": "基本情報（読むだけ）", "vi": "Thông tin cơ bản (chỉ xem)", "sel": ".card > .sec", "kind": "area", "trig": "view",
     "detail": ["項目は AW_SURV_002 No.3 と同じ。入力欄は無効。", "Mục giống AW_SURV_002 No.3. Ô nhập bị khóa."]},
    {"no": "3.1", "ja": "回答の状況", "vi": "Tình hình trả lời", "sel": ".sec-b .hint::回答", "kind": "label", "trig": "show",
     "detail": ["「回答 n／m 名（割合%）」。リマインド送信済なら送った日時、配信停止なら停止した日時。", "\"回答 n／m 名（%）\". Đã nhắc thì hiện ngày giờ nhắc; 配信停止 thì hiện ngày giờ dừng."]},
    {"no": "3.2", "ja": "選んだ法人・拠点の表", "vi": "Bảng 法人・拠点 đã chọn", "sel": ".fg .tbl", "kind": "table", "trig": "view",
     "cond": ["個別選択のとき", "Khi 個別選択"],
     "detail": ["AW_SURV_002 No.3.11 と同じ（拠点ID・拠点名・法人名・対象者数）。回答したかどうかの列は出さない（回答の状況は No.3.1 と集計で見る）。", "Giống AW_SURV_002 No.3.11 (拠点ID, 拠点名, 法人名, 対象者数). Không có cột đã trả lời hay chưa (xem ở No.3.1 và tổng hợp)."],
     "demo_ok": ["コードは利用者ごとの表に「回答」列（回答済／未回答）を出す。拠点ごとの表にし、回答の列は出さない（hong 2026-10-05）", "Code hiện bảng theo người dùng có cột 回答; sửa thành bảng theo 拠点, bỏ cột 回答 (hong 2026-10-05)"]},
]
V_Q = [
    {"no": "4", "ja": "設問（読むだけ）", "vi": "Câu hỏi (chỉ xem)", "sel": ".card > .sec", "kind": "area", "trig": "view",
     "cond": ["予定中（回答が始まる前）", "予定中 (trước khi bắt đầu)"],
     "detail": ["AW_SURV_002 No.5 と同じ内容を無効の欄で出す。追加・削除・並びのボタンは出さない。", "Nội dung như AW_SURV_002 No.5 nhưng ô khóa. Không hiện nút thêm/xóa/đổi thứ tự."]},
]
V_RESULTS = [
    {"no": "5", "ja": "回答の集計", "vi": "Tổng hợp trả lời", "sel": ".card > .filter", "kind": "area", "trig": "view",
     "cond": ["公開中・終了・配信停止（回答が始まったあと）", "公開中・終了・配信停止 (sau khi bắt đầu)"],
     "detail": ["設問ごとの集計。絞り込みは「検索」か Enter で反映。", "Tổng hợp theo câu hỏi. Lọc áp dụng khi nhấn 検索 hoặc Enter."]},
    {"no": "5.1", "ja": "設問文", "vi": "Nội dung câu hỏi", "sel": ".filter .search input", "kind": "text", "trig": "input", "req": "－", "len": "文字列 60", "ex": ["メニュー", "Khớp một phần 設問文"]},
    {"no": "5.2", "ja": "法人", "vi": "Công ty (法人)", "sel": ".filter select[aria-label=法人]", "kind": "select", "trig": "select", "req": "－", "len": "選択", "init": ["（すべて）", "(Tất cả)"], "ex": ["株式会社サンプル", "Chỉ tính trả lời của người dùng thuộc 法人 này"],
     "detail": ["対象者・回答者のいる法人だけ。変えると拠点の選択肢もその法人のものだけになる。", "Chỉ các 法人 có đối tượng/người trả lời. Đổi thì 拠点 chỉ còn của 法人 đó."]},
    {"no": "5.3", "ja": "拠点", "vi": "Chi nhánh (拠点)", "sel": ".filter select[aria-label=拠点]", "kind": "select", "trig": "select", "req": "－", "len": "選択", "init": ["（すべて）", "(Tất cả)"], "ex": ["大阪支店", "Chỉ tính trả lời của 拠点 này"]},
    {"no": "5.4", "ja": "設問タイプ", "vi": "Loại câu hỏi", "sel": ".filter select[aria-label=設問タイプ]", "kind": "select", "trig": "select", "req": "－", "len": ["選択（単一選択／複数選択／自由記述）", "Chọn (chọn 1 / chọn nhiều / tự do)"], "init": ["（すべて）", "(Tất cả)"], "ex": ["自由記述", "Chỉ hiện câu hỏi loại này"]},
    {"no": "5.5", "ja": "クリア", "vi": "Xóa điều kiện", "sel": ".filter .f-act button::クリア", "kind": "button", "trig": "click"},
    {"no": "5.6", "ja": "検索", "vi": "Tìm kiếm", "sel": ".filter .f-act button::検索", "kind": "button", "trig": "click"},
    {"no": "5.7", "ja": "回答のCSV出力", "vi": "Xuất CSV trả lời", "sel": "button::回答のCSV出力", "kind": "button", "trig": "click", "pattern": "P-CSV-OUT",
     "cond": ["CSV出力 の権限", "Có quyền CSV出力"],
     "detail": ["ボタンに人数「（n名）」。1行＝回答者1人。列：回答ID・ユーザーID・ユーザー・法人ID・法人名・拠点ID・拠点名・回答日時＋設問ごとに1列（見出し「Q番号 設問文」。複数選択は「;」でつなぐ、自由記述はそのまま）。法人・拠点の絞り込みのとおり（設問文・設問タイプは効かない）。", "Nút có số người \"（n名）\". 1 dòng = 1 người. Cột: 回答ID, ユーザーID, ユーザー, 法人ID, 法人名, 拠点ID, 拠点名, 回答日時 + mỗi câu hỏi 1 cột (tiêu đề \"Q số 設問文\"; 複数選択 nối bằng \";\", 自由記述 nguyên văn). Theo lọc 法人・拠点 (lọc 設問文・設問タイプ không ảnh hưởng)."]},
    {"no": "5.8", "ja": "回答者数", "vi": "Số người trả lời", "sel": ".hint::回答者", "kind": "label", "trig": "show",
     "detail": ["「回答者 n 名」（絞り込み中はその旨）と割合の説明。割合＝その設問に答えた人のうち、その選択肢を選んだ人（複数選択は合計が100%を超える）。", "\"回答者 n 名\" (đang lọc thì ghi rõ) và giải thích tỷ lệ. Tỷ lệ = trong số người trả lời câu đó, bao nhiêu % chọn lựa chọn đó (複数選択 tổng có thể >100%)."]},
    {"no": "5.9", "ja": "設問の集計（選択）", "vi": "Tổng hợp câu hỏi (chọn)", "sel": ".card > .sec", "kind": "area", "trig": "view",
     "detail": ["見出し：Q番号・設問文・設問タイプのバッジ・必須／任意のバッジ・「回答 n 名」。選択肢ごとに 名前・バー・割合%・件数。設問は 10問ごとにページ送り。", "Tiêu đề: Q số, 設問文, badge 設問タイプ, badge 必須/任意, \"回答 n 名\". Mỗi lựa chọn: tên, thanh, %, số lượng. 10 câu hỏi/trang."]},
    {"no": "5.10", "ja": "選択肢の行", "vi": "Dòng lựa chọn", "sel": ".meter^", "kind": "label", "trig": "show", "detail": ["選択肢・バー（割合）・割合%・件数。", "Lựa chọn, thanh (tỷ lệ), %, số lượng."]},
    {"no": "5.11", "ja": "設問の集計（自由記述）", "vi": "Tổng hợp câu hỏi (tự do)", "sel": ".card > .sec::自由記述", "kind": "area", "trig": "view", "err": ["I151"],
     "detail": ["回答の文を新しい順に 5件ずつ（回答者・法人・拠点・回答日時つき）。0件は I151。", "Các câu trả lời, mới nhất trước, 5 dòng/trang (kèm người, 法人, 拠点, ngày giờ). 0 dòng hiện I151."]},
    {"no": "5.12", "ja": "設問のページ送り", "vi": "Phân trang câu hỏi", "sel": ".card > .pager", "kind": "area", "trig": "view", "cond": ["設問が 11 問以上", "Từ 11 câu hỏi trở lên"]},
]
V_HIST = [{**HIST[0], "no": "6"}]
V_STOP = [
    {"no": "7", "ja": "配信停止の確認", "vi": "Xác nhận dừng phát", "sel": ".ov .modal", "kind": "modal", "trig": "show", "err": ["Q150"],
     "detail": ["Q150。「配信停止する」で停止して S150。", "Q150. \"配信停止する\" thì dừng và hiện S150."],
     "demo_ok": ["コードの本文「このアンケートの配信を停止しますか？…」を Q150 に揃える。ボタン名「配信停止」→「配信停止する」", "Câu chữ code khác Q150; đồng nhất. Nút 配信停止 → 配信停止する"]},
    {"no": "7.1", "ja": "キャンセル", "vi": "Hủy", "sel": ".modal button::キャンセル", "kind": "button", "trig": "click"},
    {"no": "7.2", "ja": "配信停止する", "vi": "Dừng phát", "sel": ".modal button::配信停止", "kind": "button", "trig": "click", "err": ["S150", "E212"]},
]
V_DEL = [{**P_DELMODAL[0], "no": "8"}, {**P_DELMODAL[1], "no": "8.1"}, {**P_DELMODAL[2], "no": "8.2", "detail": ["削除済にして S02 を出し、一覧へ戻る。", "Chuyển sang 削除済, hiện S02, về danh sách."]}]
V_TPL = [
    {"no": "9", "ja": "テンプレートとして保存", "vi": "Lưu làm mẫu", "sel": ".ov .mbox", "kind": "modal", "trig": "show",
     "detail": ["いまの案内文と設問（n問）をテンプレートにする。回答期間・配信対象は写さない。", "Lưu 案内文 và 設問 (n câu) hiện tại làm mẫu. Không chép 回答期間・配信対象."]},
    {"no": "9.1", "ja": "テンプレート名", "vi": "Tên mẫu", "sel": "#sv-tpl-name", "kind": "text", "trig": "input", "req": "○", "len": "文字列 60", "fid": "sv-tpl-name", "init": ["アンケート名", "Tên khảo sát"],
     "ex": ["月間メニューアンケート（標準版）", "Tên mẫu, không trùng mẫu đã có"], "err": ["E01", "E04", "E09"],
     "demo_ok": ["コードは 100 文字。60 に直す（hong 2026-10-05）", "Code 100 ký tự; sửa thành 60 (hong 2026-10-05)"]},
    {"no": "9.2", "ja": "キャンセル", "vi": "Hủy", "sel": ".mbox-f button::キャンセル", "kind": "button", "trig": "click"},
    {"no": "9.3", "ja": "保存", "vi": "Lưu", "sel": ".mbox-f button::保存", "kind": "button", "trig": "click", "err": ["S152", "E09", "E30"],
     "detail": ["ID は ST-＋3桁で自動採番。作成者・元のアンケートIDを残す。", "ID tự cấp ST- + 3 số. Lưu người tạo và ID khảo sát gốc."]},
]

# ---------------------------------------------------------------- CSV取込（AW_SURV_004）の項目
# 作りはフェーズ1 の「月間メニューCSV取込」と同じ2段階（hong 2026-10-05）：① ファイル選択（ドラッグ＆ドロップ）→「次へ」→ ② 確認・保存（結果・エラー／基本情報＋設問一覧）→「登録」。
# コードは共通の CSV取込モーダル（ファイルを選ぶ→確認・登録）を開いてから ② に進む → ページの中の2段階に直す（demo_ok）
C_HEAD = [
    {"no": "1", "ja": "ヘッダー", "vi": "Đầu trang", "sel": ".ph", "kind": "area", "trig": "view",
     "detail": ["パンくず：アンケート管理＞アンケート一覧＞アンケートCSV取込。", "Breadcrumb: アンケート管理 > アンケート一覧 > アンケートCSV取込."]},
    {"no": "1.1", "ja": "手順", "vi": "Các bước", "sel": "ol.steps", "kind": "label", "trig": "show", "detail": ["① CSV取込 → ② 確認・保存。いまの段階を強調。", "① CSV取込 → ② 確認・保存. Nhấn mạnh bước hiện tại."]},
    {"no": "1.2", "ja": "キャンセル", "vi": "Hủy", "sel": ".ph .btns button::キャンセル", "kind": "button", "trig": "click", "err": ["Q02"], "detail": ["② で編集中なら Q02。一覧へ戻る。", "Ở bước ② đang nhập thì hỏi Q02. Về danh sách."]},
    {"no": "1.3", "ja": "CSVを選び直す", "vi": "Chọn lại CSV", "sel": ".ph .btns button::CSVを選び直す", "kind": "button", "trig": "click", "cond": ["② のとき", "Ở bước ②"], "detail": ["① に戻る。読み直すと ② の設問一覧を置き換える。", "Về bước ①. Đọc lại thì thay danh sách câu hỏi ở ②."]},
    {"no": "1.4", "ja": "登録", "vi": "Đăng ký", "sel": ".ph .btns button.pri", "kind": "button", "trig": "click", "err": ["S151", "E205", "E30"], "pattern": "P-FORM",
     "cond": ["② で取り込める設問（エラーでない行）が1つ以上残っていて、作成 の権限", "Ở bước ②, còn ít nhất 1 câu hỏi hợp lệ (không lỗi), có quyền 作成"],
     "detail": ["基本情報をチェックし、アンケートを登録して詳細へ。変更履歴に「CSV取込で登録（取込ID・設問 n問）」。", "Kiểm tra 基本情報, đăng ký khảo sát và mở chi tiết. Lịch sử ghi \"CSV取込で登録（取込ID・設問 n問）\"."]},
    {"no": "1.5", "ja": "次へ", "vi": "Tiếp", "sel": ".ph .btns button.pri", "kind": "button", "trig": "click", "err": ["E214", "E219"],
     "cond": ["① でファイルを選んだとき", "Ở bước ① sau khi chọn tệp"],
     "detail": ["ファイルを確かめて（何も保存しない）② へ。ファイル全体のエラー（CSV でない・UTF-8 でない・見出し違い E214・行なし E219・5,000行超）は ① の中に帯で出し、② へ進まない。行のエラーは ② で見せる（その行だけ取り込まない）。", "Kiểm tra tệp (chưa lưu gì) rồi sang ②. Lỗi cả tệp (không phải CSV, không phải UTF-8, sai tiêu đề E214, không có dòng E219, quá 5.000 dòng) hiện dải ở ① và không sang ②. Lỗi dòng hiện ở ② (chỉ bỏ dòng đó)."],
     "demo_ok": ["コードは「登録」が無効のまま出て、ファイルはモーダルで選ぶ。① は「次へ」にする（hong 2026-10-05）", "Code hiện nút 登録 bị khóa và chọn tệp trong modal; bước ① phải là nút 次へ (hong 2026-10-05)"]},
]
C_STEP1 = [
    {"no": "2", "ja": "① CSV取込", "vi": "① Nhập CSV", "sel": ".card", "kind": "area", "trig": "view", "pattern": "P-CSV",
     "detail": ["見出し「CSV取込」、説明文、ファイルのドロップ領域。フェーズ1 の「月間メニューCSV取込」と同じ作り。テンプレート・いまのデータ のボタンは置かない（列は CSV出力と同じ。台帳 F）。", "Tiêu đề \"CSV取込\", lời giải thích, vùng thả tệp. Giống màn 月間メニューCSV取込 ở Phase 1. Không có nút テンプレート / いまのデータ (cột giống CSV出力; 台帳 F)."]},
    {"no": "2.1", "ja": "説明文", "vi": "Lời giải thích", "sel": ".card .hint", "kind": "label", "trig": "show",
     "detail": ["「1行に1つの設問（No・設問文・設問タイプ・必須・選択肢「／」区切り）。CSVファイルのみ取込可能です。」", "\"Mỗi dòng 1 câu hỏi (No, 設問文, 設問タイプ, 必須, 選択肢 ngăn ／). Chỉ nhận tệp CSV.\""]},
    {"no": "2.2", "ja": "ファイル選択／ドラッグ＆ドロップ", "vi": "Chọn tệp / kéo thả", "sel": ".card button.csv", "kind": "file", "trig": "upload", "req": "○", "len": ["CSV（UTF-8）5,000行まで", "CSV (UTF-8), tối đa 5.000 dòng"],
     "ex": ["アンケート設問.csv", "Tệp .csv UTF-8; kéo thả vào vùng cũng được"],
     "detail": ["ページの中のドロップ領域（アイコン＋「ファイル選択」リンク＋「またはファイルをドラッグ＆ドロップ」）。選ぶとファイル名を出し「次へ」が押せる。", "Vùng thả tệp ngay trong trang (icon + link \"ファイル選択\" + \"またはファイルをドラッグ＆ドロップ\"). Chọn xong hiện tên tệp và bật nút 次へ."],
     "demo_ok": ["コードは「CSVを選んで取り込む」ボタンで共通モーダルを開く。ページの中のドロップ領域に直す（hong 2026-10-05）", "Code mở modal chung bằng nút CSVを選んで取り込む; sửa thành vùng thả tệp trong trang (hong 2026-10-05)"]},
]
C_RESULT = [
    {"no": "3", "ja": "② 取込の結果", "vi": "② Kết quả nhập", "sel": ".card", "kind": "area", "trig": "view", "pattern": "P-CSV",
     "detail": ["② の上部（基本情報・設問一覧の上）。ファイル名・読めた設問の数・エラーの行の数。エラーの行があれば帯と表を出す。共通パターン P-CSV と違うところ：モーダルではなくページの中の2段階。", "Phần trên của ② (trên 基本情報・設問一覧): tên tệp, số câu hỏi đọc được, số dòng lỗi. Có dòng lỗi thì hiện dải và bảng. Khác P-CSV: 2 bước trong trang, không phải modal."],
     "demo_ok": ["コードは共通モーダルの中に出してから ② へ進む。ページの ② にまとめる（hong 2026-10-05）", "Code hiện trong modal chung rồi mới sang ②; gộp vào bước ② của trang (hong 2026-10-05)"]},
    {"no": "3.1", "ja": "取込の結果", "vi": "Kết quả nhập", "sel": ".card > .hint", "kind": "label", "trig": "show", "err": ["E215", "E216", "E217", "E218", "E204"],
     "detail": ["「取込 ID：設問 n問を読みました（エラーの行 m件は取り込みません）。」エラーの行があれば、その下に帯「エラーの行 m件は取り込みません（行番号と内容は下の表）」＋行ごとの表（行番号・キー・列名・内容）＋「エラー一覧CSV」（元の行にエラーの内容を付けて保存）。行のエラー：設問文なし（E01）・200文字超（E04）・設問タイプ（E215）・必須（E216）・選択肢（E217・E204）・自由記述に選択肢（E218）。注意書き「回答が始まったアンケートの設問は、文言の修正だけできます」。取り込める行が1つもなければ登録できない（台帳 F）。",
                "\"取込 ID：設問 n問を読みました（エラーの行 m件は取り込みません）。\" Có dòng lỗi thì bên dưới hiện dải \"エラーの行 m件は取り込みません…\" + bảng theo dòng (số dòng, khóa, cột, nội dung) + nút \"エラー一覧CSV\" (lưu dòng gốc kèm nội dung lỗi). Lỗi dòng: thiếu 設問文 (E01), quá 200 (E04), 設問タイプ (E215), 必須 (E216), 選択肢 (E217, E204), 自由記述 có 選択肢 (E218). Lưu ý \"回答が始まったアンケートの設問は、文言の修正だけできます\". Không còn dòng hợp lệ nào thì không đăng ký được (台帳 F)."],
     "demo_ok": ["コードはエラーの帯・表・エラー一覧CSV・注意書きを共通モーダルに出してから ② へ進み、② は「設問 n問を読みました。」だけ。すべてページの ② の上部にまとめる（hong 2026-10-05）", "Code hiện dải lỗi, bảng, エラー一覧CSV, lưu ý trong modal rồi mới sang ②; ② chỉ ghi số câu đọc được. Gộp tất cả lên đầu bước ② (hong 2026-10-05)"]},
]
C_STEP2 = [
    {"no": "4", "ja": "② 確認・保存", "vi": "② Xác nhận và lưu", "sel": ".card", "kind": "area", "trig": "view",
     "detail": ["「取込 ID：設問 n問を読みました。」＋基本情報＋設問一覧。", "\"取込 ID：設問 n問を読みました。\" + 基本情報 + 設問一覧."]},
    {"no": "4.1", "ja": "基本情報", "vi": "Thông tin cơ bản", "sel": ".sec-h::基本情報^", "kind": "area", "trig": "view", "pattern": "P-FORM",
     "detail": ["AW_SURV_002 No.3 と同じ項目（アンケート名・案内文・回答開始日時・回答終了日時・リマインド通知・対象者数・配信対象）。", "Mục giống AW_SURV_002 No.3 (アンケート名, 案内文, 回答開始日時, 回答終了日時, リマインド通知, 対象者数, 配信対象)."]},
    {"no": "4.2", "ja": "設問一覧", "vi": "Danh sách câu hỏi", "sel": ".card .tbl", "kind": "table", "trig": "view",
     "detail": ["列：No・設問文・設問タイプ・必須（バッジ）・選択肢（「／」区切り）・操作。10行ごとにページ送り。ここでは直せない（直すなら登録後に編集）。全部外して 0 件になると「取り込む設問がありません。「CSVを選び直す」から選んでください。」を出し、登録は押せない。", "Cột: No, 設問文, 設問タイプ, 必須 (badge), 選択肢 (ngăn ／), thao tác. 10 dòng/trang. Không sửa ở đây (sửa sau khi đăng ký). Bỏ hết còn 0 câu thì hiện \"取り込む設問がありません…\" và không nhấn 登録 được."]},
    {"no": "4.3", "ja": "設問を外す", "vi": "Bỏ câu hỏi", "sel": ".card td.act button.d", "kind": "button", "trig": "click", "detail": ["その設問を登録しない（番号は詰める）。", "Không đăng ký câu đó (đánh lại số)."]},
    {"no": "4.4", "ja": "外した設問を元に戻す", "vi": "Khôi phục câu đã bỏ", "sel": "button::元に戻す", "kind": "button", "trig": "click", "cond": ["外した設問があるとき", "Khi có câu đã bỏ"], "detail": ["「外した設問 n件」の横。全部戻す。", "Bên cạnh \"外した設問 n件\". Khôi phục tất cả."]},
]

# ---------------------------------------------------------------- CSV取込のファイルの形式（テンプレート。列＝設問一覧の列と同じ。hong 2026-10-05）
C_FILE = [
    {"no": "5", "ja": "CSVファイルの形式", "vi": "Định dạng tệp CSV", "sel": ".card .tbl", "kind": "table", "trig": "view", "err": ["E214", "E219"],
     "detail": ["UTF-8（BOM あり・なし）・カンマ区切り・1行目は見出し「アンケート名,案内文,回答開始日時,回答終了日時,No,設問文,設問タイプ,必須,選択肢」（この順。違えば E214）・2行目から1行＝1設問（最大 5,000行）・空の行は飛ばす・設問の行が1つもなければ E219。基本情報の4列は**1行目（最初の設問の行）の値を ② の欄に入れる**（2行目以降の値は読まない。空なら ② で入れる。リマインド通知・配信対象は CSV にない）。「,」「\"」改行を含む値は \"…\" で囲む（\" は \"\"）。前後の空白を取り、全角の数字・英字・ハイフンは半角に直してから確かめる。ひな形は CSV出力（1行＝1設問）と同じ並び。記入例：`月間ランチメニューアンケート（11月）,11月のメニューについてのアンケートです。,2026-11-01 08:00,2026-11-20 18:00,1,ESステーションの利用頻度をお選びください。,単一選択,必須,週5回以上／週3〜4回／週1〜2回／月に数回`",
                "UTF-8 (có/không BOM), ngăn bằng dấu phẩy, dòng 1 là tiêu đề「アンケート名,案内文,回答開始日時,回答終了日時,No,設問文,設問タイプ,必須,選択肢」(đúng thứ tự; sai thì E214), từ dòng 2 mỗi dòng 1 câu hỏi (tối đa 5.000 dòng), dòng trống bỏ qua, không có dòng câu hỏi nào thì E219. 4 cột 基本情報 **lấy giá trị ở dòng đầu (dòng câu hỏi đầu tiên) điền vào ②** (dòng sau không đọc; trống thì nhập ở ②; リマインド通知・配信対象 không có trong CSV). Giá trị chứa , \" xuống dòng thì bọc \"…\". Bỏ khoảng trắng đầu/cuối, đổi toàn góc sang nửa góc rồi mới kiểm tra. Mẫu = cùng thứ tự cột với CSV出力 (1 dòng = 1 câu hỏi). Ví dụ: `月間ランチメニューアンケート（11月）,11月のメニューについてのアンケートです。,2026-11-01 08:00,2026-11-20 18:00,1,ESステーションの利用頻度をお選びください。,単一選択,必須,週5回以上／週3〜4回／週1〜2回／月に数回`"],
     "demo_ok": ["コードの CSV は設問の5列だけ（見出し「No,設問文,設問タイプ,必須,選択肢」）。基本情報の4列を先頭に足し、1行目の値で ② を埋める（hong 2026-10-05＝B）", "CSV trong code chỉ 5 cột câu hỏi; thêm 4 cột 基本情報 ở đầu và điền ② bằng dòng đầu (hong 2026-10-05 = B)"]},
    {"no": "5.1", "ja": "アンケート名（1列目）", "vi": "アンケート名 (cột 1)", "sel": "#sv-name", "kind": "text", "trig": "input", "req": "－", "len": "文字列 60",
     "ex": ["月間ランチメニューアンケート（11月）", "Tên khảo sát; dòng đầu điền vào ô アンケート名 ở ②"], "err": ["E04", "E13"],
     "valid": ["1行目の値を ② に入れる。② の登録のときに形式どおり確かめる（空は E01、60文字超は E04）", "Lấy dòng đầu điền vào ②; khi 登録 kiểm tra như form (trống E01, quá 60 E04)"]},
    {"no": "5.2", "ja": "案内文（2列目）", "vi": "案内文 (cột 2)", "sel": "#sv-intro", "kind": "textarea", "trig": "input", "req": "－", "len": ["文字列 500（改行は \"…\" で囲む）", "Chuỗi 500 (có xuống dòng thì bọc \"…\")"],
     "ex": ["11月のメニューについてのアンケートです。所要時間は約3分です。", "Lời giới thiệu; dòng đầu điền vào ô 案内文 ở ②"], "err": ["E04", "E13"],
     "valid": ["② の登録のときに 500文字超は E04", "Khi 登録: quá 500 thì E04"]},
    {"no": "5.3", "ja": "回答開始日時（3列目）", "vi": "回答開始日時 (cột 3)", "sel": "#sv-start^", "kind": "date", "trig": "input", "req": "－", "len": ["日時（yyyy-mm-dd HH:MM）", "Ngày giờ (yyyy-mm-dd HH:MM)"],
     "ex": ["2026-11-01 08:00", "Ngày giờ bắt đầu; dòng đầu điền vào ô 回答開始日時 ở ②"], "err": ["E200"],
     "valid": ["yyyy-mm-dd HH:MM（yyyy/mm/dd も可）。読めない形なら ② の欄を空にし、登録のときに E200", "yyyy-mm-dd HH:MM (yyyy/mm/dd cũng nhận). Không đọc được thì để trống ở ②, khi 登録 báo E200"]},
    {"no": "5.4", "ja": "回答終了日時（4列目）", "vi": "回答終了日時 (cột 4)", "sel": "#sv-end^", "kind": "date", "trig": "input", "req": "－", "len": ["日時（yyyy-mm-dd HH:MM）", "Ngày giờ (yyyy-mm-dd HH:MM)"],
     "ex": ["2026-11-20 18:00", "Ngày giờ kết thúc; dòng đầu điền vào ô 回答終了日時 ở ②"], "err": ["E200", "E201"],
     "valid": ["形式は 5.3 と同じ。② の登録のときに回答開始日時より後でなければ E201", "Dạng như 5.3. Khi 登録: không sau 回答開始日時 thì E201"]},
    {"no": "5.5", "ja": "No（5列目）", "vi": "No (cột 5)", "sel": ".card .tbl th::No", "kind": "text", "trig": "input", "req": "－", "len": ["整数（参考）", "Số nguyên (tham khảo)"],
     "ex": ["1", "Số thứ tự trong tệp, chỉ để người đọc; hệ thống đánh lại theo thứ tự dòng"],
     "detail": ["見た人のための番号。設問の順番はファイルの行の順で決め、この値は読まない（空でもよい）。", "Chỉ để người xem. Thứ tự câu hỏi lấy theo thứ tự dòng; không đọc giá trị này (để trống cũng được)."]},
    {"no": "5.6", "ja": "設問文（6列目）", "vi": "設問文 (cột 6)", "sel": ".card .tbl th::設問文", "kind": "text", "trig": "input", "req": "○", "len": "文字列 200",
     "ex": ["ESステーションの利用頻度をお選びください。", "Nội dung câu hỏi hiện trên app"], "err": ["E01", "E04", "E13"],
     "valid": ["空なら E01。200文字超は E04。絵文字は E13（行のエラー）", "Trống: E01. Quá 200: E04. Emoji: E13 (lỗi dòng)"]},
    {"no": "5.7", "ja": "設問タイプ（7列目）", "vi": "設問タイプ (cột 7)", "sel": ".card .tbl th::設問タイプ", "kind": "text", "trig": "input", "req": "○", "len": ["選択（単一選択／複数選択／自由記述）", "Chọn (chọn 1 / chọn nhiều / tự do)"],
     "ex": ["単一選択", "Đúng 1 trong 3 chữ: 単一選択, 複数選択, 自由記述 (viết y nguyên)"], "err": ["E215"],
     "valid": ["3つの文字どおりでなければ E215（空も E215。行のエラー）", "Không đúng 1 trong 3 chuỗi (kể cả trống): E215 (lỗi dòng)"]},
    {"no": "5.8", "ja": "必須（8列目）", "vi": "必須 (cột 8)", "sel": ".card .tbl th::必須", "kind": "text", "trig": "input", "req": "－", "len": ["「必須」か「任意」", "Chữ bắt buộc hoặc tùy chọn (viết bằng tiếng Nhật)"], "init": ["空＝任意", "Trống = 任意"],
     "ex": ["必須", "必須 = người dùng phải trả lời; 任意 hoặc trống = không bắt buộc"], "err": ["E216"],
     "valid": ["「必須」「任意」「空」以外は E216（行のエラー）", "Khác 必須 / 任意 / trống: E216 (lỗi dòng)"]},
    {"no": "5.9", "ja": "選択肢（9列目）", "vi": "選択肢 (cột 9)", "sel": ".card .tbl th::選択肢", "kind": "text", "trig": "input", "req": "条件付き", "len": ["文字列 60 × 2つ以上（「／」区切り）", "Chuỗi 60 × từ 2 trở lên (ngăn bằng ／)"],
     "ex": ["週5回以上／週3〜4回／週1〜2回／月に数回", "Các lựa chọn ngăn bằng「／」(全角; 半角 / cũng nhận). 自由記述 thì để trống"], "err": ["E217", "E204", "E218", "E04"],
     "cond": ["設問タイプが 単一選択・複数選択 のとき必須。自由記述は空", "Bắt buộc khi 設問タイプ = 単一選択 / 複数選択. 自由記述 phải trống"],
     "valid": ["単一・複数選択：「／」で分けて空を除き 2つ以上（E217）、同じものなし（E204）、1つ 60文字まで（E04）。自由記述：値があれば E218（行のエラー）", "単一/複数: tách theo ／, bỏ trống, ≥2 (E217), không trùng (E204), mỗi cái ≤60 (E04). 自由記述: có giá trị thì E218 (lỗi dòng)"],
     "demo_ok": ["コードは選択肢1つの文字数を確かめていない。60 文字のチェックを足す（hong 2026-10-05）", "Code chưa kiểm tra độ dài mỗi lựa chọn; thêm kiểm tra 60 ký tự (hong 2026-10-05)"]},
]

# ---------------------------------------------------------------- 状態
def V(id, code, ja, vi, url, items, setup="", note=None, full=True, wait=500):
    return {"id": id, "code": code, "state": [ja, vi], "url": url, "setup": (H + setup) if setup else "", "full": full, "wait": wait, "note": note or ["", ""], "items": items}

Q_NEW = q_items(False)
Q_LOCK = q_items(True)
Q_VIEW = [{**it} for it in Q_NEW]

VIEWS = [
    # ---- 一覧
    V("001", "AW_SURV_001", "初期表示", "Hiển thị ban đầu", "/ops/surveys", P_FILTER + P_HEAD + P_TABLE[:13] + [P_TABLE[14]],
      note=["削除済みを表示しない＝チェック。回答終了日時の降順。", "Mặc định tích 削除済みを表示しない. Sắp theo 回答終了日時 giảm dần."]),
    V("003", "AW_SURV_001", "0件", "0 dòng", "/ops/surveys", [P_FILTER[1], P_FILTER[6], P_TABLE[13]],
      setup="setv(document.querySelector('.filter .search input'),'該当なしのキーワード');btn('検索',document.querySelector('.f-act')).click();await sleep(600);"),
    V("004", "AW_SURV_001", "削除済みを表示", "Hiện cả đã xóa", "/ops/surveys", [P_FILTER[7], P_FILTER[6], P_TABLE[9], P_TABLE[10]],
      setup="[...document.querySelectorAll('.filter input[type=checkbox]')][0].click();btn('検索',document.querySelector('.f-act')).click();await sleep(600);",
      note=["SV-1020（削除済）が出る。削除済・終了の行には編集・削除を出さない。", "SV-1020 (削除済) hiện ra. Dòng 削除済・終了 không có nút sửa/xóa."]),
    V("005", "AW_SURV_001", "削除の確認（モーダル）", "Xác nhận xóa (modal)", "/ops/surveys", P_DELMODAL,
      setup="row('SV-1026').querySelector('td.act button.d').click();await sleep(500);", full=False),
    V("006", "AW_SURV_001", "テンプレートから作成（モーダル）", "Tạo từ mẫu (modal)", "/ops/surveys", P_TPLMODAL,
      setup="await fetch('/api/domain/survey/saveTemplate',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json','x-es-site':'ops'},body:JSON.stringify({args:{name:'配送・お届け（見本）',form:{intro:'お届けについてのアンケートです。',questions:[{text:'お届けの時間に満足していますか。',type:'単一選択',required:true,options:['満足','不満']}]},surveyId:'SV-1025',by:'にっしぐち'}})}).catch(()=>0);await sleep(300);btn('テンプレートから作成').click();await sleep(900);document.querySelector('.mbox input[name=sv-tpl]').click();await sleep(300);", full=False,
      note=["撮影用に標準でないテンプレートを1つ作ってある（操作のごみ箱を見せるため）。", "Để thấy nút xóa, lúc chụp đã tạo thêm 1 mẫu không phải 標準."]),
    # ---- 登録・編集
    V("007", "AW_SURV_002", "新規登録 基本情報", "Đăng ký mới: 基本情報", "/ops/surveys/new", head_items(True) + BASIC[:9] + [BASIC[10]],
      note=["配信対象の初期値は全員。ヘッダーの「テンプレートから作成」は置かない（テンプレートは一覧の画面から選ぶ：hong 2026-10-05。コードのボタンは外す宿題）。", "Mặc định 配信対象 = 全員. Không đặt nút テンプレートから作成 ở đầu trang (chọn mẫu từ màn 一覧: hong 2026-10-05; nút trong code phải bỏ)."]),
    V("008", "AW_SURV_002", "新規登録 設問タブ", "Đăng ký mới: tab 設問", "/ops/surveys/new", [Q_NEW[0], Q_NEW[1], Q_NEW[2], Q_NEW[3], Q_NEW[4], Q_NEW[5], Q_NEW[6], Q_NEW[7], Q_NEW[10]],
      setup="tab('設問').click();await sleep(400);"),
    V("009", "AW_SURV_002", "個別選択ダイアログ", "Dialog 個別選択", "/ops/surveys/new", PICK,
      setup="[...document.querySelectorAll('.radios input')][1].click();await sleep(900);", full=False,
      note=["決定（hong 2026-10-05）は法人・拠点を選ぶダイアログ。コードは利用者を選ぶ（宿題）。", "Quyết định: dialog chọn 法人・拠点. Code đang chọn người dùng (việc phải sửa)."]),
    V("010", "AW_SURV_002", "個別選択のあと（選んだ法人・拠点の表）", "Sau khi chọn (bảng 法人・拠点)", "/ops/surveys/new", [BASIC[7], BASIC[8], BASIC[9], BASIC[11]],
      setup="[...document.querySelectorAll('.radios input')][1].click();await sleep(900);[...document.querySelectorAll('.mbox td input[type=checkbox]')].slice(0,3).forEach(c=>c.click());await sleep(200);btn('選択を確定').click();await sleep(700);"),
    V("011", "AW_SURV_002", "テンプレートから作成中", "Đang tạo từ mẫu", "/ops/surveys/new?tpl=ST-001", [head_items(True)[0], BASIC[2], BASIC[3]],
      setup="await sleep(800);", wait=800,
      note=["タイトルの下に「テンプレート「満足度調査」から作成中」。案内文・設問が写されている。", "Dưới tiêu đề: \"テンプレート「満足度調査」から作成中\". 案内文・設問 đã được chép."]),
    V("012", "AW_SURV_002", "入力エラー（基本情報）", "Lỗi nhập (基本情報)", "/ops/surveys/new", ERRS + [BASIC[2], BASIC[4], BASIC[5]],
      setup="btn('登録',document.querySelector('.ph .btns')).click();await sleep(500);"),
    V("013", "AW_SURV_002", "入力エラー（設問）", "Lỗi nhập (設問)", "/ops/surveys/new", [ERRS[0], Q_NEW[2], Q_NEW[3], Q_NEW[5]],
      setup="btn('登録',document.querySelector('.ph .btns')).click();await sleep(400);tab('設問').click();await sleep(400);"),
    V("014", "AW_SURV_002", "編集 予定中（設問タブ）", "Sửa 予定中 (tab 設問)", "/ops/surveys/SV-1026/edit", head_items(False) + [Q_NEW[0], Q_NEW[1], Q_NEW[8], Q_NEW[9], Q_NEW[10]],
      setup="tab('設問').click();await sleep(400);",
      note=["回答が始まる前なので、設問の追加・削除・並び替えができる。", "Chưa bắt đầu nên thêm/xóa/đổi thứ tự câu hỏi được."]),
    V("015", "AW_SURV_002", "編集 公開中 基本情報（回答開始日時ロック）", "Sửa 公開中: 基本情報 (khóa 回答開始日時)", "/ops/surveys/SV-1024/edit", [head_items(False)[0], BASIC[4], BASIC[5], BASIC[6], BASIC[8]],
      note=["回答開始日時は無効（「回答が始まったので変更できません」）。", "回答開始日時 bị khóa (\"回答が始まったので変更できません\")."]),
    V("016", "AW_SURV_002", "編集 公開中 設問（文言の修正だけ）", "Sửa 公開中: 設問 (chỉ câu chữ)", "/ops/surveys/SV-1024/edit", [Q_LOCK[0], Q_LOCK[1], Q_LOCK[2], Q_LOCK[3], Q_LOCK[4], Q_LOCK[5]],
      setup="tab('設問').click();await sleep(400);",
      note=["I150。設問タイプ・必須は無効、追加・削除・並びのボタンは出さない。", "I150. 設問タイプ・必須 khóa; không hiện nút thêm/xóa/đổi thứ tự."]),
    V("017", "AW_SURV_002", "編集内容の破棄（モーダル）", "Bỏ nội dung đang sửa (modal)", "/ops/surveys/SV-1026/edit", DISCARD,
      setup="setv(document.querySelector('#sv-name'),'年末年始メニューのご希望調査（修正）');await sleep(200);btn('キャンセル',document.querySelector('.ph .btns')).click();await sleep(500);", full=False),
    V("018", "AW_SURV_002", "登録画面からテンプレートとして保存（モーダル）", "Lưu làm mẫu từ màn đăng ký (modal)", "/ops/surveys/new?tpl=ST-001", V_TPL,
      setup="await sleep(800);btn('テンプレートとして保存',document.querySelector('.ph .btns')).click();await sleep(500);", full=False, wait=800,
      note=["入力中の案内文・設問をテンプレートにする（アンケートは登録しない）。モーダルは詳細の No.9 と同じ。テンプレート名の初期値は入力中のアンケート名（空なら空）。", "Lưu 案内文・設問 đang nhập làm mẫu (không đăng ký アンケート). Modal giống No.9 ở chi tiết. Tên mẫu mặc định = アンケート名 đang nhập (trống thì trống)."]),
    # ---- 詳細
    V("019", "AW_SURV_003", "予定中 基本情報", "予定中: 基本情報", "/ops/surveys/SV-1026", V_HEAD + V_BASIC,
      note=["ボタン：削除・配信停止・テンプレートとして保存・編集。", "Nút: 削除, 配信停止, テンプレートとして保存, 編集."]),
    V("020", "AW_SURV_003", "予定中 設問タブ（読むだけ）", "予定中: tab 設問 (chỉ xem)", "/ops/surveys/SV-1026", V_Q, setup="tab('設問').click();await sleep(400);"),
    V("021", "AW_SURV_003", "公開中 基本情報（個別選択）", "公開中: 基本情報 (個別選択)", "/ops/surveys/SV-1025", [V_HEAD[0], V_HEAD[1], V_BASIC[1], V_BASIC[2]],
      note=["個別選択のアンケート。対象の表は登録・編集と同じ（回答の列は出さない：hong 2026-10-05）。", "Khảo sát 個別選択. Bảng đối tượng giống màn đăng ký/sửa (không có cột 回答: hong 2026-10-05)."]),
    V("022", "AW_SURV_003", "公開中 設問タブ＝回答の集計", "公開中: tab 設問 = tổng hợp trả lời", "/ops/surveys/SV-1024", V_RESULTS[:12],
      setup="tab('設問').click();await sleep(700);"),
    V("023", "AW_SURV_003", "集計の絞り込み（法人）", "Lọc tổng hợp (法人)", "/ops/surveys/SV-1024", [V_RESULTS[2], V_RESULTS[6], V_RESULTS[7], V_RESULTS[8]],
      setup="tab('設問').click();await sleep(700);const s=document.querySelector('.filter select[aria-label=法人]');setsel(s,s.options[1].value);await sleep(200);btn('検索',document.querySelector('.f-act')).click();await sleep(700);",
      note=["回答のCSV出力の人数と各設問の件数が絞り込みに合わせて変わる。", "Số người ở nút CSV và số lượng mỗi câu hỏi đổi theo lọc."]),
    V("024", "AW_SURV_003", "変更履歴タブ", "Tab 変更履歴", "/ops/surveys/SV-1024", V_HIST, setup="tab('変更履歴').click();await sleep(400);"),
    V("025", "AW_SURV_003", "配信停止の確認（モーダル）", "Xác nhận dừng phát (modal)", "/ops/surveys/SV-1024", V_STOP,
      setup="btn('配信停止',document.querySelector('.ph .btns')).click();await sleep(500);", full=False),
    V("026", "AW_SURV_003", "削除確認（モーダル）", "Xác nhận xóa (modal)", "/ops/surveys/SV-1024", V_DEL,
      setup="document.querySelector('.ph .btns button.dan').click();await sleep(500);", full=False),
    V("027", "AW_SURV_003", "テンプレートとして保存（モーダル）", "Lưu làm mẫu (modal)", "/ops/surveys/SV-1024", V_TPL,
      setup="btn('テンプレートとして保存',document.querySelector('.ph .btns')).click();await sleep(500);", full=False),
    V("028", "AW_SURV_003", "終了", "Đã kết thúc (終了)", "/ops/surveys/SV-1021", [V_HEAD[0], V_HEAD[1], V_HEAD[4], V_BASIC[1]],
      note=["ボタンは「テンプレートとして保存」だけ。設問タブは集計。", "Chỉ còn nút テンプレートとして保存. Tab 設問 là tổng hợp."]),
    V("029", "AW_SURV_003", "配信停止", "Đã dừng phát (配信停止)", "/ops/surveys/SV-1023", [V_HEAD[0], V_HEAD[1], V_HEAD[2], V_HEAD[4], V_BASIC[1]],
      note=["ボタンは 削除・テンプレートとして保存（編集は出さない：hong 2026-10-05）。回答の状況に停止した日時。", "Nút: 削除, テンプレートとして保存 (không có 編集: hong 2026-10-05). Tình hình trả lời hiện ngày giờ dừng."]),
    V("030", "AW_SURV_003", "削除済", "Đã xóa (削除済)", "/ops/surveys/SV-1020", [V_HEAD[0], V_HEAD[1], V_HEAD[4]],
      note=["ボタンは「テンプレートとして保存」だけ。", "Chỉ còn nút テンプレートとして保存."]),
    # ---- CSV取込（決定はページの中の2段階。撮影はコードのモーダルで代用：demo_ok）
    V("031", "AW_SURV_004", "① CSV取込 初期表示", "① Ban đầu", "/ops/surveys/import", [C_HEAD[0], C_HEAD[1], C_HEAD[2], C_HEAD[5]] + C_STEP1[:3],
      note=["決定（hong 2026-10-05）：フェーズ1 の月間メニューCSV取込と同じく、ページの中にドロップ領域と「次へ」。コードはボタンでモーダルを開く（宿題）。撮影はコードのモーダル（テンプレートのボタンなし）で代用。", "Quyết định (hong 2026-10-05): giống 月間メニューCSV取込 Phase 1, vùng thả tệp và nút 次へ ngay trong trang. Code mở modal (việc phải sửa). Ảnh chụp dùng modal của code (không còn nút テンプレート)."]),
    V("032", "AW_SURV_004", "② 確認・保存（取込の結果＋基本情報＋設問一覧）", "② Xác nhận và lưu (kết quả nhập + 基本情報 + 設問一覧)", "/ops/surveys/import", [C_HEAD[1], C_HEAD[3], C_HEAD[4]] + C_RESULT + C_STEP2[:3],
      setup="document.querySelector('.card button.csv').click();await sleep(600);await upload('" + CSV_MIX + "');btn('登録',document.querySelector('.mbox-f')).click();await sleep(1200);", wait=800,
      note=["見本の CSV は3行（2行目が設問タイプの誤り）→ 2問を読み、エラーの行は取り込まない（台帳 F）。コードはエラーの行をモーダルで見せてから ② へ進む（ページの ② にまとめるのは宿題）。", "CSV mẫu 3 dòng (dòng 2 sai 設問タイプ) → đọc 2 câu, dòng lỗi bị bỏ (台帳 F). Code hiện dòng lỗi trong modal rồi mới sang ② (gộp vào ② là việc phải sửa)."]),
    V("033", "AW_SURV_004", "設問を外したあと", "Sau khi bỏ 1 câu hỏi", "/ops/surveys/import", [C_STEP2[2], C_STEP2[3], C_STEP2[4]],
      setup="document.querySelector('.card button.csv').click();await sleep(600);await upload('" + CSV_OK + "');btn('登録',document.querySelector('.mbox-f')).click();await sleep(1200);document.querySelector('.sec-b td.act button.d').click();await sleep(400);", wait=800),
    V("034", "AW_SURV_004", "CSVファイルの形式（テンプレート）", "Định dạng tệp CSV (mẫu)", "/ops/surveys/import", C_FILE,
      setup="document.querySelector('.card button.csv').click();await sleep(600);await upload('" + CSV_OK + "');btn('登録',document.querySelector('.mbox-f')).click();await sleep(1200);", wait=800,
      note=["CSV の列＝基本情報の4列（② の欄に入る）＋設問一覧の5列。列ごとの型・必須・チェックをここに定義する（hong 2026-10-05＝B）。", "Cột CSV = 4 cột 基本情報 (điền vào ô ở ②) + 5 cột của 設問一覧. Kiểu, bắt buộc, kiểm tra từng cột định nghĩa ở đây (hong 2026-10-05 = B)."]),
    V("035", "AW_SURV_004", "登録エラー（基本情報が空）", "Lỗi đăng ký (基本情報 trống)", "/ops/surveys/import", [C_HEAD[4], C_STEP2[1], ERRS[0]],
      setup="document.querySelector('.card button.csv').click();await sleep(600);await upload('" + CSV_OK + "');btn('登録',document.querySelector('.mbox-f')).click();await sleep(1200);btn('登録',document.querySelector('.ph .btns')).click();await sleep(500);", wait=800),
]

# cond が None の項目は取り除く（q_items の lock なし）
for v in VIEWS:
    for it in v["items"]:
        if it.get("cond") is None and "cond" in it:
            del it["cond"]
