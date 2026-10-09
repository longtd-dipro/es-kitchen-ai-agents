# -*- coding: utf-8 -*-
"""
画面設計書のデータ：運営管理者Web ＞ マスタ管理 ＞ 資材マスタ（一覧・詳細・登録／編集・CSV取込）
元：決定台帳 F「資材マスタの作り」（hong 回答 2026-10-08・受付簿 #392）・B「資材の無料の数量」・E（新規登録ボタン・権限）・F「資材の納期（日）」・I「資材の発注」・M-1「削除」、
    運営Web_権限表_20261003（資材マスタ管理）、確認メモ_AW_運営H_マスタ2.md（資材マスタ Q1〜Q6）、機種マスタ（AW_MODL）と同じ3画面の作り
状態：日本語・ベトナム語の両方を入れた。
      4画面とも実装済み（一覧・詳細・登録/編集・CSV取込。受付簿 #392〜#396）。コードと違うのは変更履歴の列だけ（demo_ok）。
      sel "-"＝画面にない定義だけ。詳細に「削除」ボタンは置かない（削除は一覧の操作・#396）。撮影はこれから。
      資材×プランの CSV は作らない（Q5＝D・受付簿 #393）。
番号は画面ごとに通し。
"""

TITLE = ["資材マスタ（AW_MATE）", "Danh mục vật tư (AW_MATE)"]
SHEET = ["資材マスタ", "Danh mục vật tư"]
BASENAME = "画面設計書_AW_MATE_資材マスタ"
IMG_PREFIX = "AW_MATE"
OUT_DIR = "AW_MATE_資材マスタ"
CODE_NOTE = ["画面コードは規約 <Module(2)>_<Feature(4)>_<Seq(3)>（docs/01_仕様/画面コード規約_20261005.md）。AW＝運営管理者Web、MATE＝資材マスタ", "Mã màn hình theo quy ước <Module(2)>_<Feature(4)>_<Seq(3)> (docs/01_仕様/画面コード規約_20261005.md). AW = Web quản trị vận hành, MATE = Danh mục vật tư"]
SITE = "ops"
SYSTEM = {"ja": "運営管理者Web", "vi": "Web quản trị vận hành"}
AUTHOR = "Claude（cloud）／確認：hong"
CREATED = "2026-10-08"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "ops", "loginId": "Ad00010"}
CODE_PATHS = ["app/ops/masters/materials", "app/ops/masters/_masters/MaterialScreen.tsx", "app/ops/masters/_masters/MasterList.tsx", "app/ops/masters/_masters/MasterCsvImport.tsx", "app/ops/masters/_masters/masters.css", "lib/domain/material.ts", "lib/ops/masters/spec/materials.ts", "lib/csv/master.ts", "lib/domain/seed/master.ts"]


def _p(x):
    return x if isinstance(x, (list, tuple)) else [x, ""]


_PAIRS = ("detail", "init", "cond", "valid", "ex", "demo_ok", "chk", "open", "len")


def F(no, ja, sel, kind, trig="view", vi="", **kw):
    d = {"no": no, "ja": ja, "vi": vi, "sel": sel, "kind": kind, "trig": trig}
    for k, v in kw.items():
        d[k] = _p(v) if k in _PAIRS else v
    return d


def D(date, target, q, a, src, qv="", av=""):
    return {"date": date, "target": target, "q": [q, qv], "a": [a, av], "src": src}


DECISIONS = [
    D("2026-10-05", "権限", "だれが作成・編集・削除・CSV取込できるか",
      "資材マスタ管理が CRUD の役割（フル権限・システム管理）。ほかの6役割は R（閲覧・CSV出力）。新規登録・編集・削除・CSV取込のボタンは CRUD の役割だけに出す",
      "運営Web_権限表_20261003「資材マスタ管理」・台帳 E「運営の権限の読み方」・受付簿 #33",
      "Ai được tạo, sửa, xóa, nhập CSV?",
      "Vai trò quản lý danh mục vật tư có quyền CRUD (toàn quyền, quản trị hệ thống). 6 vai trò còn lại chỉ có R (xem, xuất CSV). Các nút đăng ký mới, sửa, xóa, nhập CSV chỉ hiện với vai trò CRUD"),
    D("2026-10-08", "画面の作り（Q1）", "編集・登録をモーダルにするか画面にするか", "画面にする。機種マスタと同じ：一覧 → 詳細（表示だけ）→ 登録・編集。CSV取込は別の画面", "hong 回答 2026-10-08（確認メモ_AW_運営H Q1＝B）・受付簿 #392",
      "Sửa và đăng ký dùng modal hay màn hình riêng?",
      "Dùng màn hình riêng, giống danh mục thiết bị: danh sách → chi tiết (chỉ xem) → đăng ký/sửa. Nhập CSV là màn hình riêng"),
    D("2026-10-08", "項目（Q2）", "資材マスタが持つ項目", "資材ID・資材名・コース・単位・規格・写真・単価（税抜）・税率・公開ステータス・取扱倉庫（納期は持たない）。法人Web 資材注文が読んでいたコース・単位・規格・画像（menu.materials）を資材マスタに集約して1か所にする。仕入価格・個別コード（JAN）は置かない", "hong 回答 2026-10-08（Q2＝B＋写真・単位）・台帳 F「資材の納期（日）」「資材の発注」",
      "Danh mục vật tư có những mục nào?",
      "資材ID, tên vật tư, khóa học, đơn vị, quy cách, ảnh, đơn giá (chưa thuế), thuế suất, trạng thái công khai, kho xử lý (không có thời gian giao). Gom khóa học, đơn vị, quy cách, hình ảnh (menu.materials) mà màn đặt vật tư của Web doanh nghiệp đang đọc về danh mục vật tư, để chỉ còn một nơi. Không có giá nhập và mã riêng (JAN)"),
    D("2026-10-08", "非公開（Q3）", "公開ステータスが非公開だと何が起こるか", "運営には見える。仮登録の初期セット・運営の資材発注・資材注文管理・在庫の選択肢には出せる（運営が入れたければ入れられる）。お客様（法人Web）には表示しない（カートに入れてあっても注文できない）。既存の注文・初期備品・在庫は変えない", "hong 回答 2026-10-08（Q3）・受付簿 #392・#395",
      "Nếu trạng thái công khai là không công khai thì chuyện gì xảy ra?",
      "Vận hành vẫn thấy. Vẫn chọn được trong bộ ban đầu của đăng ký tạm, đặt vật tư của vận hành, quản lý đơn vật tư và lựa chọn tồn kho (vận hành muốn đưa vào thì được). Không hiện trên Web doanh nghiệp (dù đã có trong giỏ cũng không đặt được). Đơn đặt, vật dụng ban đầu và tồn kho hiện có không thay đổi"),
    D("2026-10-08", "削除（Q4）", "使用中の資材を削除できるか", "できない。使用中＝どれかのプランの初期備品／月の無料数量に載っている、未納品（取消・納品済でない）の資材注文に含まれる、倉庫の資材在庫が 0 より多い。論理削除（状態「削除済」）・確認は Q01 → S02。削除できないときは E259 のモーダルで「非公開」を促す", "hong 回答 2026-10-08（Q4＝共通の決まりに従う）・台帳 M-1「削除」・同「マスタの登録・編集・削除」（使用中は削除できない）",
      "Có xóa được vật tư đang được sử dụng không?",
      "Không. Đang sử dụng = nằm trong vật dụng ban đầu / số lượng miễn phí hàng tháng của một gói nào đó, nằm trong đơn đặt vật tư chưa giao (chưa hủy, chưa giao), hoặc tồn kho vật tư của kho lớn hơn 0. Xóa logic (trạng thái 「削除済」), xác nhận bằng Q01 → S02. Khi không xóa được thì modal E259 nhắc chuyển sang 「非公開」"),
    D("2026-10-08", "価格の変更（Q6）", "単価・税率を変えると受付済みの注文の請求はどうなるか", "変わらない。注文を受けた時点の単価・税率を注文が持つ。画面に注記を出す", "hong 回答 2026-10-08（Q6）・P-HIST",
      "Đổi đơn giá, thuế suất thì việc thanh toán của đơn đã tiếp nhận thế nào?",
      "Không đổi. Đơn giữ đơn giá và thuế suất tại thời điểm nhận đơn. Hiện ghi chú trên màn hình"),
    D("2026-10-08", 'CSV（Q5）', '資材 × プランの CSV を作るか', '作らない。無料数量の入力はプランマスタ詳細（AW_PLAN）のカードから画面で行う', 'hong 回答 2026-10-08（Q5＝D）・受付簿 #393',
      'Có làm CSV vật tư × gói không?',
      'Không làm. Số lượng miễn phí nhập trên màn hình ở thẻ trong chi tiết danh mục gói (AW_PLAN)'),
    D("2026-10-08", 'コース・取扱倉庫', '使用中でも変更できるか', '変更できる（必須入力）', 'hong 回答 2026-10-08・受付簿 #395',
      'Có đổi được khóa học và kho xử lý khi đang sử dụng không?',
      'Đổi được (bắt buộc nhập)'),
    D("2026-10-08", '写真', '写真の形式・大きさ', 'PNG・JPEG・WebP、5MB、1枚（商品写真と同じ）。エラーは E268（E255 は JPG・PNG・HEIC で合わないため使わない）', 'hong 回答 2026-10-08・受付簿 #395',
      'Định dạng và dung lượng ảnh',
      'PNG・JPEG・WebP, 5MB, 1 ảnh (giống ảnh sản phẩm). Lỗi dùng E268 (không dùng E255 vì là JPG・PNG・HEIC)'),
    D("2026-10-08", '取扱倉庫', '選択肢と初期値', '選択肢＝倉庫区分「ピッキング倉庫（資材）」だけ。初期値＝ES事務所。一覧の検索「取扱倉庫」も同じ', 'hong 回答 2026-10-08・受付簿 #395',
      'Lựa chọn và giá trị mặc định của kho xử lý',
      'Lựa chọn chỉ gồm kho loại 「ピッキング倉庫（資材）」; mặc định là văn phòng ES. Ô tìm 「取扱倉庫」 ở danh sách cũng giống vậy'),
    D("2026-10-08", '単位', '単位の入力', '自由入力・最大20文字。表記は「個」にそろえる（個／コのゆれを避ける）', 'hong 回答 2026-10-08・受付簿 #395',
      'Nhập đơn vị',
      'Nhập tự do, tối đa 20 ký tự. Thống nhất ghi là 「個」 (tránh lẫn 個 / コ)'),
    D("2026-10-08", '単価', '単価の必須・初期値', '必須。初期値は空（0円ではない）。入れ忘れで無料の資材にならないようにする。0円は入力すれば登録できる', 'hong 回答 2026-10-08・受付簿 #395',
      'Đơn giá có bắt buộc, giá trị mặc định là gì?',
      'Bắt buộc. Mặc định là trống (không phải 0 yên) để không vô tình thành vật tư miễn phí do quên nhập. Nhập 0 yên thì vẫn đăng ký được'),
    D("2026-10-03", "請求", "資材の価格はどこで使うか", "プランの月の無料数量を超えた分を、資材マスタの単価・税率で請求する。単価 0円の資材は請求されない", "台帳 B「資材の無料の数量」",
      "Giá vật tư được dùng ở đâu?",
      "Phần vượt quá số lượng miễn phí hàng tháng của gói được tính theo đơn giá và thuế suất trong danh mục vật tư. Vật tư có đơn giá 0 yên thì không bị tính tiền"),
    D("2026-10-05", "資材×プラン", "資材 × プランの表（初期備品・月の無料数量）はどこで入力するか", "プランマスタ詳細（AW_PLAN）のカード。資材マスタには持たない", "台帳 F「資材 × プランの表の置き場」・受付簿 #85",
      "Bảng vật tư × gói (vật dụng ban đầu, số lượng miễn phí hàng tháng) nhập ở đâu?",
      "Ở thẻ trong chi tiết danh mục gói (AW_PLAN). Không giữ trong danh mục vật tư"),
    D("2026-10-08", "納期", "納期（日）", "資材マスタには持たない。資材発注の画面で倉庫と一緒に毎回入れる（初期値 7）。発注の目安の計算に使う", "台帳 F「資材の納期（日）」・受付簿 #394（#323 を置き換え）",
      "Thời gian giao (ngày)",
      "Không giữ trong danh mục vật tư. Nhập mỗi lần ở màn đặt vật tư cùng với kho (mặc định 7). Dùng để tính lượng đặt tham khảo"),
    D("2026-10-07", "取扱倉庫", "資材の納入先", "資材ごとに取扱倉庫を持つ（ES事務所も倉庫の1つ）。資材発注の納入先の候補になる（2026-10-08：資材便の倉庫とは別。下の行）", "台帳 I「資材の発注」・受付簿 #319",
      "Nơi giao vật tư",
      "Mỗi vật tư có kho xử lý (văn phòng ES cũng là một kho). Là ứng viên nơi giao khi đặt vật tư (2026-10-08: khác kho của chuyến vật tư, xem dòng dưới)"),
    D("2026-10-08", "取扱倉庫・資材便", "資材便の倉庫と、1回の発注の倉庫", "資材便（お客様の資材注文の出荷）の倉庫＝その拠点の配送区分「資材」のルートのピッキング倉庫で、取扱倉庫ではない。1回の発注は1資材につき1倉庫で、取扱倉庫の中から1つ選ぶ（資材発注 AW_MPO）", "hong 回答 2026-10-08（確認表 C2-7）・台帳 S「資材の注文・資材便の倉庫」・受付簿 #450",
      "Kho của chuyến vật tư và kho của mỗi lần đặt hàng",
      "Kho của chuyến vật tư (xuất đơn vật tư của khách) = kho picking của tuyến loại giao hàng 「資材」 của điểm đó, không phải kho xử lý. Mỗi lần đặt hàng chỉ 1 kho cho 1 vật tư, chọn 1 trong các kho xử lý (đặt vật tư AW_MPO)"),
    D("2026-10-08", "画面コード", "画面コード", "AW_MATE_001〜004（一覧・詳細・登録/編集・CSV取込）", "画面コード規約_20261005",
      "Mã màn hình",
      "AW_MATE_001〜004 (danh sách, chi tiết, đăng ký/sửa, nhập CSV)"),
]
CHANGES = []

HIDE_ALWAYS = []
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [
    {"code": "AW_MATE_001", "ja": "資材マスタ一覧", "vi": "Danh sách danh mục vật tư"},
    {"code": "AW_MATE_002", "ja": "資材詳細", "vi": "Chi tiết vật tư"},
    {"code": "AW_MATE_003", "ja": "資材登録・編集", "vi": "Đăng ký/sửa vật tư"},
    {"code": "AW_MATE_004", "ja": "資材マスタ CSV取込", "vi": "Nhập CSV danh mục vật tư"},
]

CAN = ["資材マスタ管理が CRUD の役割（フル権限・システム管理）だけに表示", "Chỉ hiện với vai trò quản lý danh mục vật tư có quyền CRUD (toàn quyền, quản trị hệ thống)"]

JS = ("const sleep=ms=>new Promise(r=>setTimeout(r,ms));"
      "const setv=(el,v)=>{const p=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;"
      "Object.getOwnPropertyDescriptor(p,'value').set.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}));};"
      "const btn=t=>[...document.querySelectorAll('button')].find(b=>b.textContent.replace(/\\s+/g,'').includes(t));"
      "const q=s=>document.querySelector(s);")
CLEAR = JS + "if(btn('クリア')){btn('クリア').click();await sleep(400);}"

SEARCH_JS = "setv(q('input[aria-label=\"資材ID、資材名\"]'),%s);q('.es-search__actions button[type=submit]').click();await sleep(500);"
# 003：削除できる資材は見本にない（S001〜S009 は初期備品・注文・在庫で使用中）。API で1件登録 → CSV取込を経由して一覧を開き直す → 検索してごみ箱
DEL_JS = (JS + CLEAR.replace(JS, "") +
          "const nm='削除の見本'+String(Date.now()).slice(-5);"
          "await fetch('/api/ops/area/masters/createMaterial',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json','x-es-site':'ops'},"
          "body:JSON.stringify({args:{kind:'materials',data:{name:nm,courses:['ESスタンダード'],unit:'個',spec:'',photo:'',priceYen:'100',taxRateId:'TX02',publish:'非公開',warehouseIds:['WH00004']}}})});"
          "btn('CSV取込').click();await sleep(900);q('.csvph .crumb a.lnk').click();await sleep(900);"
          + SEARCH_JS % "nm" + "q('button[aria-label=\"'+nm+'を削除\"]').click();await sleep(400);")
# 004：S001（割り箸）は使用中
USE_JS = CLEAR + SEARCH_JS % "'S001'" + "q('button[aria-label=\"割り箸を削除\"]').click();await sleep(700);"

# ================================================================ AW_MATE_001 一覧
L_HEAD = [
    F("1", "ヘッダー", ".es-pagehead", "area", vi="Đầu trang", detail=["パンくず・画面名・操作ボタン。", "Breadcrumb, tên màn hình, nút thao tác."]),
    F("1.1", "パンくず", ".es-breadcrumb", "label", vi="Breadcrumb", detail=["「マスタ管理 / 資材マスタ」。", "「マスタ管理 / 資材マスタ」."]),
    F("1.2", "画面名", ".es-pagehead__title", "label", vi="Tên màn hình", detail=["「資材マスタ一覧」。", "「資材マスタ一覧」."]),
    F("1.3", "CSV取込", "button::CSV取込", "button", "click", vi="Nhập CSV", cond=CAN, pattern="P-CSV",
      detail=["AW_MATE_004（CSV取込）へ。キーは資材ID（空欄＝新規・採番）。", "Sang AW_MATE_004 (nhập CSV). Khóa là 資材ID (để trống = tạo mới, tự cấp số)."]),
    F("1.4", "CSV出力", "button::CSV出力", "button", "click", vi="Xuất CSV", pattern="P-CSV-OUT",
      detail=["検索条件のとおりの全件を、取込と同じ列で出力する。閲覧できる役割すべてに出す。", "Xuất toàn bộ theo điều kiện tìm kiếm, cùng cột với nhập. Hiện với mọi vai trò xem được."]),
    F("1.5", "新規登録", "button::新規登録", "button", "click", vi="Đăng ký mới", cond=CAN,
      detail=["AW_MATE_003（新規登録）へ。", "Sang AW_MATE_003 (đăng ký mới)."]),
]
L_SEARCH = [
    F("2", "検索条件", ".es-search", "area", vi="Điều kiện tìm kiếm", pattern="P-LIST",
      detail=["条件は「検索」か Enter で反映する（「未適用」の印は出さない）。", "Điều kiện được áp dụng khi bấm 「検索」 hoặc Enter (không hiện dấu 「未適用」)."]),
    F("2.1", "キーワード", 'input[aria-label="資材ID、資材名"]', "text", "input", vi="Từ khóa", req="－",
      len=["文字列 60", "Chuỗi ký tự 60"], init=["空", "Trống"], ex=["段ボール箱", "Chuỗi để tìm trong 資材ID hoặc tên vật tư (ví dụ tên vật tư)"],
      valid=["部分一致。全角・半角、大文字・小文字を区別しない。", "Khớp một phần. Không phân biệt chữ toàn-bán góc, chữ hoa-thường."], err=["E04"],
      detail=["資材ID・資材名のどちらかに含まれる行。個別コード（JAN）では探さない（項目を置かないため）。", "Các dòng có chứa từ khóa trong 資材ID hoặc tên vật tư. Không tìm theo mã riêng (JAN) vì không có mục này."]),
    F("2.2", "コース", 'select[aria-label="コース"]', "select", "select", vi="Khóa học", req="－",
      len=["選択（ESスタンダード／ESライト（冷蔵庫）／ESライト（自販機））", "Chọn (ES Standard / ES Lite (tủ lạnh) / ES Lite (máy bán hàng))"], init=["未選択", "Chưa chọn"], ex=["ESスタンダード", "Một khóa học trong danh sách lựa chọn"],
      detail=["そのコースを含む資材（資材が複数のコースを持てるため、コースごとに判定する）。", "Vật tư có chứa khóa học đó (vật tư có thể có nhiều khóa học nên xét theo từng khóa học)."]),
    F("2.3", "公開ステータス", 'select[aria-label="公開ステータス"]', "select", "select", vi="Trạng thái công khai", req="－",
      len=["選択（公開／非公開）", "Chọn (công khai / không công khai)"], init=["未選択", "Chưa chọn"], ex=["非公開", "Một trạng thái trong danh sách lựa chọn"]),
    F("2.4", "取扱倉庫", 'select[aria-label="取扱倉庫"]', "select", "select", vi="Kho xử lý", req="－",
      len=["選択（倉庫区分「ピッキング倉庫（資材）」の倉庫だけ）", "Chọn (chỉ kho thuộc loại kho lấy hàng (vật tư))"], init=["未選択", "Chưa chọn"], ex=["ES事務所", "Tên một kho"]),
    F("2.5", "削除済みを表示しない", ".delchk", "check", "check", vi="Không hiện mục đã xóa", req="－",
      len=["チェック", "Ô đánh dấu"], init=["ON", "BẬT"], ex=["ON", "BẬT hoặc TẮT"],
      detail=["ON＝削除済を出さない（既定）。OFF で検索すると削除済も出る（グレーの行・バッジ「削除済」・操作なし）。", "BẬT = không hiện mục đã xóa (mặc định). TẮT rồi tìm thì mục đã xóa cũng hiện (dòng xám, nhãn 「削除済」, không có thao tác)."]),
    F("2.6", "クリア", "button::クリア", "button", "click", vi="Xóa điều kiện",
      detail=["条件を初期値に戻し、1ページ目から表示し直す。", "Đưa điều kiện về mặc định, hiện lại từ trang 1."]),
    F("2.7", "検索", ".es-search__actions button[type=submit]", "button", "click", vi="Tìm kiếm",
      detail=["条件を反映して1ページ目から表示。Enter でも同じ。", "Áp dụng điều kiện và hiện từ trang 1. Enter cũng giống vậy."]),
]
L_TABLE = [
    F("3", "一覧", ".es-table-wrap", "table", vi="Danh sách", pattern="P-LIST",
      detail=["初期の並び：資材IDの昇順。並べ替えは全列（台帳 K）。削除済の行はグレーで操作を出さない。", "Thứ tự mặc định: 資材ID tăng dần. Sắp xếp được mọi cột (台帳 K). Dòng đã xóa màu xám, không hiện thao tác."]),
    F("3.1", "資材ID", "th::資材ID", "link", "click", vi="Mã vật tư (資材ID)", len=["文字列 S＋3桁", "Chuỗi ký tự S + 3 chữ số"],
      detail=["クリックで AW_MATE_002（詳細）へ。", "Bấm để sang AW_MATE_002 (chi tiết)."]),
    F("3.2", "写真", "th::写真", "label", vi="Ảnh",
      detail=["サムネイル。写真がないときは「—」。", "Ảnh thu nhỏ. Không có ảnh thì hiện 「—」."]),
    F("3.3", "資材名", "th::資材名", "label", vi="Tên vật tư", len=["文字列 60", "Chuỗi ký tự 60"]),
    F("3.4", "コース", "th::コース", "label", vi="Khóa học",
      detail=["持っているコースを「・」でつなぐ。", "Nối các khóa học có bằng dấu 「・」."]),
    F("3.5", "単位", "th::単位", "label", vi="Đơn vị", len=["文字列 20", "Chuỗi ký tự 20"]),
    F("3.6", "単価（税抜）", "th::単価（税抜）", "label", vi="Đơn giá (chưa thuế)", len=["金額＋「円」・右寄せ", "Số tiền + yên, căn phải"],
      detail=["0円は「0円」と出す（請求されない資材）。", "0 yên hiện là 「0円」 (vật tư không bị tính tiền)."]),
    F("3.7", "税率", "th::税率", "label", vi="Thuế suất", len=["％", "％"]),
    F("3.8", "取扱倉庫", "th::取扱倉庫", "label", vi="Kho xử lý",
      detail=["複数のときは「・」でつなぐ。", "Nếu có nhiều kho thì nối bằng dấu 「・」."]),
    F("3.9", "公開ステータス", "th::公開ステータス", "label", vi="Trạng thái công khai",
      detail=["バッジ：公開＝緑、非公開＝灰。", "Nhãn: 公開 = xanh lá, 非公開 = xám."]),
    F("3.10", "操作", "th::操作", "label", vi="Thao tác",
      detail=["編集（鉛筆）・削除（ごみ箱）。権限がなければ出さない。削除済の行には出さない。", "Sửa (bút chì), xóa (thùng rác). Không có quyền thì không hiện. Dòng đã xóa không hiện."]),
    F("3.11", "編集", 'button[aria-label$="を編集"]', "button", "click", vi="Sửa", cond=CAN,
      detail=["AW_MATE_003（編集）へ。キャンセルで一覧に戻る。", "Sang AW_MATE_003 (sửa). Bấm キャンセル thì về danh sách."]),
    F("3.12", "削除", 'button[aria-label$="を削除"]', "button", "click", vi="Xóa", cond=CAN, pattern="P-DEL", err=["Q01", "S02", "E259", "E30"],
      detail=["使用中でなければ確認（状態 003）→ 論理削除（削除済）。失敗は E30（P-DEL）。使用中（プランの初期備品・月の無料数量／未納品の資材注文／倉庫の資材在庫 > 0）なら E259 のモーダル（状態 004）。サーバーでも同じ決まりで止める。",
              "Nếu không đang sử dụng thì xác nhận (trạng thái 003) → xóa logic (削除済). Thất bại: E30 (P-DEL). Nếu đang sử dụng (vật dụng ban đầu / số lượng miễn phí hàng tháng của gói, đơn đặt vật tư chưa giao, tồn kho vật tư của kho > 0) thì hiện modal E259 (trạng thái 004). Phía server cũng chặn theo cùng quy tắc."]),
]
L_PAGER = [
    F("4", "ページ送り", ".es-pagination", "area", vi="Phân trang", pattern="P-LIST"),
    F("4.1", "件数", ".es-pagination__meta", "label", vi="Số lượng",
      detail=["「n件中 a–b件」。0件は「0件」。", "「n件中 a–b件」. Khi không có dòng nào thì 「0件」."]),
    F("4.2", "前のページ", 'button[aria-label="前のページ"]', "button", "click", vi="Trang trước",
      cond=["1ページ目では非活性", "Vô hiệu ở trang 1"]),
    F("4.3", "ページ番号", ".es-page.is-current", "button", "click", vi="Số trang",
      detail=["今のページは塗りつぶし。", "Trang hiện tại được tô đậm."]),
    F("4.4", "次のページ", 'button[aria-label="次のページ"]', "button", "click", vi="Trang sau",
      cond=["最後のページでは非活性", "Vô hiệu ở trang cuối"]),
    F("4.5", "表示件数", 'select[aria-label="表示件数"]', "select", "select", vi="Số dòng/trang", req="－",
      len=["選択（10／20／50／100 件／ページ）", "Chọn (10 / 20 / 50 / 100 dòng/trang)"], init=["10件／ページ", "10 dòng/trang"], ex=["20件／ページ", "Một số dòng/trang trong danh sách lựa chọn"],
      detail=["変えると1ページ目に戻る。", "Đổi thì quay về trang 1."]),
]
V_LIST = [
    {"id": "001", "code": "AW_MATE_001", "state": ["初期表示", "Hiển thị ban đầu"], "url": "/ops/masters/materials", "setup": CLEAR, "full": True, "wait": 600,
     "note": ["フル権限（Ad00010）で表示。R の役割では 1.3・1.5・3.11・3.12 が出ない（状態 011）。", "Hiển thị với toàn quyền (Ad00010). Với vai trò R thì 1.3, 1.5, 3.11, 3.12 không hiện (trạng thái 011)."],
     "items": L_HEAD + L_SEARCH + L_TABLE + L_PAGER},
    {"id": "011", "code": "AW_MATE_001", "state": ["参照のみの役割", "Vai trò chỉ xem"], "url": "/ops/masters/materials", "setup": "", "full": False, "wait": 400,
     "note": ["R（閲覧）だけの役割で表示したとき。", "Khi hiển thị với vai trò chỉ có R (xem)."],
     "items": [F("8", "参照のみの役割の表示", ".es-pagehead", "area", "show", vi="Hiển thị cho vai trò chỉ xem",
                 detail=["新規登録・CSV取込・編集・削除は出ない。CSV出力は出る。/new・/edit を直接開いたときは、台帳 K「権限のない画面」の共通の決まりに従う（「この画面を見る権限がありません」を出す。メニューには閲覧できる画面だけ出す）。", "Không hiện đăng ký mới, nhập CSV, sửa, xóa. Vẫn hiện xuất CSV. Khi mở trực tiếp /new, /edit thì theo quy tắc chung 台帳 K 「権限のない画面」 (hiện 「この画面を見る権限がありません」; menu chỉ hiện màn hình xem được)."])]},
    {"id": "002", "code": "AW_MATE_001", "state": ["該当なし（0件）", "Không có dữ liệu (0 dòng)"], "url": "/ops/masters/materials",
     "setup": CLEAR + "setv(q('.es-search__fields input'),'zzz');q('.es-search__actions button[type=submit]').click();await sleep(500);", "full": False, "wait": 400,
     "items": [F("5", "0件のメッセージ", ".es-table tbody td[colspan]", "label", "show", vi="Thông báo 0 dòng", err=["I01"],
                 detail=["一覧の中に I01 を1行で出す。ページ送りは「0件」。", "Hiện I01 một dòng trong bảng. Phân trang hiện 「0件」."])]},
    {"id": "003", "code": "AW_MATE_001", "state": ["削除の確認", "Xác nhận xóa"], "url": "/ops/masters/materials", "setup": DEL_JS, "full": False, "wait": 400,
     "note": ["使用中でない資材のごみ箱を押したとき。見本の資材はどれも使用中なので、先に「削除の見本」を1件登録してから、一覧でそのごみ箱を押す。", "Khi bấm thùng rác của vật tư không đang được sử dụng. Vật tư mẫu đều đang sử dụng nên đăng ký trước 1 vật tư 「削除の見本」, rồi bấm thùng rác của nó ở danh sách."],
     "items": [
         F("6", "削除の確認モーダル", ".es-modal", "modal", "show", vi="Modal xác nhận xóa", pattern="P-DEL", err=["Q01"],
           detail=["Q01（ボタン「キャンセル」「削除する」。P-DEL）。", "Q01 (nút 「キャンセル」「削除する」, P-DEL)."]),
         F("6.1", "キャンセル", ".es-modal__actions button::キャンセル", "button", "click", vi="Hủy",
           detail=["閉じる。何もしない。", "Đóng, không làm gì."]),
         F("6.2", "削除する", ".es-modal__actions button::削除する", "button", "click", vi="Xóa (削除する)", err=["S02", "E30"],
           detail=["論理削除（削除済）にして S02 のトースト。失敗は E30。", "Xóa logic (削除済) và hiện toast S02. Thất bại: E30."]),
     ]},
    {"id": "004", "code": "AW_MATE_001", "state": ["削除できません（使用中）", "Không xóa được (đang sử dụng)"], "url": "/ops/masters/materials", "setup": USE_JS, "full": False, "wait": 600,
     "note": ["使用中の資材（S001 割り箸）のごみ箱を押したとき。確認は出さず、理由のモーダルだけ。", "Khi bấm thùng rác của vật tư đang được sử dụng. Không hiện xác nhận, chỉ hiện modal nêu lý do."],
     "items": [
         F("7", "削除できないモーダル", ".es-modal", "modal", "show", vi="Modal không xóa được", err=["E259"],
           detail=["E259。使用中のプラン・未納品の資材注文・資材在庫のある倉庫の件数を出す。「閉じる」だけ。", "E259. Hiện số gói đang sử dụng, số đơn đặt vật tư chưa giao, số kho có tồn kho vật tư. Chỉ có nút 「閉じる」."]),
         F("7.1", "閉じる", ".es-modal__actions button::閉じる", "button", "click", vi="Đóng",
           detail=["閉じる。何も変えない。", "Đóng, không thay đổi gì."]),
     ]},
]

# ================================================================ AW_MATE_002 詳細（表示だけ）
D_ITEMS = [
    F("1", "ヘッダー", ".phead", "area", vi="Đầu trang",
      detail=["画面名「資材詳細 {資材ID}」。右に 編集・一覧へ戻る。詳細に「削除」ボタンは置かない（削除は一覧の操作＝AW_MATE_001 のごみ箱。受付簿 #396）。削除済の資材は「状態：削除済」を出し、編集は出さない。", "Tên màn hình 「資材詳細 {資材ID}」. Bên phải có 編集 và 一覧へ戻る. Màn chi tiết không đặt nút 「削除」 (xóa là thao tác ở danh sách = thùng rác của AW_MATE_001. 受付簿 #396). Vật tư đã xóa hiện 「状態：削除済」 và không hiện 編集."]),
    F("1.1", "編集", ".pbtn button::編集", "button", "click", vi="Sửa", cond=CAN,
      detail=["AW_MATE_003（編集）へ。CRUD の役割だけに出す。", "Sang AW_MATE_003 (sửa). Chỉ hiện với vai trò CRUD."]),
    F("1.2", "一覧へ戻る", ".pbtn button::一覧へ戻る", "button", "click", vi="Về danh sách",
      detail=["AW_MATE_001 へ。閲覧できる役割すべてに出す。", "Về AW_MATE_001. Hiện với mọi vai trò xem được."]),
    F("2", "基本情報", ".ch::基本情報^", "area", vi="Thông tin cơ bản", pattern="P-FORM",
      detail=["P-FORM：詳細は表示だけ（入力欄を置かない）。", "P-FORM: chi tiết chỉ để xem (không đặt ô nhập)."]),
    F("2.1", "資材ID", ".f > label::資材ID^", "label", vi="Mã vật tư (資材ID)", len=["文字列 S＋3桁", "Chuỗi ký tự S + 3 chữ số"],
      detail=["システムが採番（S＋3桁の続き番号）。", "Hệ thống tự cấp số (S + 3 chữ số, số tiếp theo)."]),
    F("2.2", "資材名", ".f > label::資材名^", "label", vi="Tên vật tư", len=["文字列 60", "Chuỗi ký tự 60"]),
    F("2.3", "コース", ".f > label::コース^", "label", vi="Khóa học",
      detail=["持っているコースを「・」でつなぐ。", "Nối các khóa học có bằng dấu 「・」."]),
    F("2.4", "単位", ".f > label::単位^", "label", vi="Đơn vị", len=["文字列 20", "Chuỗi ký tự 20"],
      detail=["法人Web 資材注文の数量の単位（個・枚・箱など）。", "Đơn vị của số lượng trong đặt vật tư trên Web doanh nghiệp (cái, tờ, hộp, v.v.)."]),
    F("2.5", "規格", ".f > label::規格^", "label", vi="Quy cách", len=["文字列 60", "Chuỗi ký tự 60"],
      detail=["法人Web 資材注文に出す規格（サイズなど）。未入力は「—」。", "Quy cách hiện ở đặt vật tư trên Web doanh nghiệp (kích thước, v.v.). Chưa nhập thì hiện 「—」."]),
    F("2.6", "写真", ".f > label::写真^", "label", vi="Ảnh",
      detail=["法人Web 資材注文に出す画像。未登録は「—」。", "Hình ảnh hiện ở đặt vật tư trên Web doanh nghiệp. Chưa đăng ký thì hiện 「—」."]),
    F("2.7", "公開ステータス", ".f > label::公開ステータス^", "label", vi="Trạng thái công khai",
      detail=["バッジ。非公開でも運営には見える（仮登録の初期セット・運営の資材発注・資材注文管理・在庫の選択肢には出せる）。法人Webには表示しない（カートに入っていても注文できない）。","Nhãn. 非公開 thì vận hành vẫn thấy (chọn được trong bộ ban đầu của đăng ký tạm, đặt vật tư của vận hành, quản lý đơn vật tư, tồn kho). Không hiện trên Web doanh nghiệp (dù đã có trong giỏ cũng không đặt được)."]),
    F("3", "価格と取扱倉庫", ".ch::価格と取扱倉庫^", "area", vi="Giá và kho xử lý"),
    F("3.1", "単価（税抜）", ".f > label::単価（税抜）^", "label", vi="Đơn giá (chưa thuế)", len=["金額＋「円」", "Số tiền + yên"],
      detail=["無料数量を超えた分の請求に使う。0円は請求されない。", "Dùng để tính tiền phần vượt số lượng miễn phí. 0 yên thì không bị tính tiền."]),
    F("3.2", "税率", ".f > label::税率^", "label", vi="Thuế suất",
      detail=["税率マスタの値。", "Giá trị trong danh mục thuế suất."]),
    F("3.3", "取扱倉庫", ".f > label::取扱倉庫^", "label", vi="Kho xử lý",
      detail=["資材発注の納入先の候補（1回の発注は1資材につき1倉庫で、この中から1つ選ぶ）。お客様の資材注文を出す倉庫（資材便の倉庫）は、この取扱倉庫ではなく、拠点の配送区分「資材」のルートのピッキング倉庫（2026-10-08）。", "Ứng viên nơi giao khi đặt vật tư (mỗi lần đặt hàng chỉ 1 kho cho 1 vật tư, chọn 1 trong các kho này). Kho xuất đơn vật tư của khách (kho của chuyến vật tư) không phải kho xử lý này mà là kho picking của tuyến loại giao hàng 「資材」 của điểm (2026-10-08)."]),
    F("4", "使用状況", ".ch::使用状況^", "area", vi="Tình trạng sử dụng",
      detail=["削除できるかの判断に使う件数だけを出す（E259 の {n}{m}{k} と同じ数え方）。全部 0 のときは「削除できます」と出す。", "Chỉ hiện số lượng dùng để xét có xóa được hay không (cách đếm giống {n}{m}{k} của E259). Nếu tất cả bằng 0 thì hiện 「削除できます」."]),
    F("4.1", "プラン数", ".mt-use .u::プラン数", "label", vi="Số gói", len=["件数", "Số lượng"],
      detail=["初期備品／月の無料数量に載っているプランの件数（E259 の {n}）。", "Số gói có trong vật dụng ban đầu / số lượng miễn phí hàng tháng ({n} của E259)."]),
    F("4.2", "未納品の資材注文数", ".mt-use .u::未納品の資材注文数", "label", vi="Số đơn đặt vật tư chưa giao", len=["件数", "Số lượng"],
      detail=["未納品（取消・納品済でない）の資材注文の件数（E259 の {m}）。", "Số đơn đặt vật tư chưa giao (chưa hủy, chưa giao xong) ({m} của E259)."]),
    F("4.3", "在庫のある倉庫数", ".mt-use .u::在庫のある倉庫数", "label", vi="Số kho có tồn kho", len=["件数", "Số lượng"],
      detail=["資材在庫が 0 より多い倉庫の件数（E259 の {k}）。", "Số kho có tồn kho vật tư lớn hơn 0 ({k} của E259)."]),
    F("5", "変更履歴", ".ch::変更履歴^", "table", vi="Lịch sử thay đổi", pattern="P-HIST",
      detail=["日時・操作した人・操作・項目・変更前・変更後・理由（P-HIST）。", "Ngày giờ, người thao tác, thao tác, mục, trước khi đổi, sau khi đổi, lý do (P-HIST)."]),
]
V_DETAIL = [
    {"id": "005", "code": "AW_MATE_002", "state": ["初期表示", "Hiển thị ban đầu"], "url": "/ops/masters/materials/S001", "setup": "", "full": True, "wait": 400,
     "note": ["使用中の見本（S001 割り箸）をフル権限で表示。使用状況が 0 より大きいので「使用中のため削除できません」の文が出る。詳細に削除ボタンはない（削除は一覧の操作）。", "Hiển thị vật tư mẫu đang sử dụng (S001) với toàn quyền. Tình trạng sử dụng lớn hơn 0 nên hiện câu 「使用中のため削除できません」. Màn chi tiết không có nút xóa (xóa là thao tác ở danh sách)."], "items": D_ITEMS},
]

# ================================================================ AW_MATE_003 登録・編集
N_ITEMS = [
    F("1", "ヘッダー", ".phead", "area", vi="Đầu trang", pattern="P-FORM",
      detail=["画面名は新規「資材新規登録」・編集「資材編集 {資材ID}」。右に キャンセル・登録（編集は「保存」）。変更があるとき離れる前に Q02。", "Tên màn hình: mới 「資材新規登録」, sửa 「資材編集 {資材ID}」. Bên phải có キャンセル và 登録 (sửa là 「保存」). Nếu có thay đổi thì hiện Q02 trước khi rời đi."], err=["Q02", "S01"]),
    F("1.1", "キャンセル", ".pbtn .cancel", "button", "click", vi="Hủy", pattern="P-FORM", err=["Q02"],
      detail=["副ボタン（白地・枠線）。登録は一覧へ、編集は詳細（一覧の鉛筆から開いたときは一覧）へ戻る。入力を変えていれば先に Q02 の確認を出す。", "Nút phụ (nền trắng, viền). Đăng ký thì về danh sách, sửa thì về chi tiết (mở từ bút chì ở danh sách thì về danh sách). Nếu đã thay đổi thì hiện xác nhận Q02 trước."]),
    F("1.2", "登録（保存）", ".pbtn .save", "button", "click", vi="Đăng ký (Lưu)", pattern="P-FORM", err=["S01", "I02", "E31", "E36"],
      detail=["主ボタン（青地）。新規は「登録」、編集は「保存」。保存後は詳細（AW_MATE_002）へ。削除済の資材は編集できない（E36）。押したら無効にして二重クリックを防ぐ。同時編集は、画面を開いたとき I02、保存のとき E31。", "Nút chính (nền xanh). Mới là 「登録」, sửa là 「保存」. Sau khi lưu thì sang chi tiết (AW_MATE_002). Vật tư đã xóa không sửa được (E36). Khóa nút sau khi nhấn để chống nhấp đúp. Sửa đồng thời: I02 khi mở màn hình, E31 khi lưu."]),
    F("2", "資材ID", ".f > label::資材ID^", "label", vi="Mã vật tư (資材ID)", len=["文字列 S＋3桁", "Chuỗi ký tự S + 3 chữ số"],
      init=["新規：登録時に自動で採番／編集：採番済み", "Mới: tự cấp số khi đăng ký / Sửa: đã được cấp số"],
      detail=["入力させない・採番後は変えない。", "Không cho nhập, sau khi cấp số thì không đổi."]),
    F("3", "資材名", 'input[aria-label="資材名"]', "text", "input", vi="Tên vật tư", req="○", len=["文字列 60", "Chuỗi ký tự 60"], init=["空", "Trống"],
      ex=["保冷バッグ（大）", "Tên vật tư (không trùng với tên khác)"],
      valid=["前後の空白を取る。同じ名前があればエラー（編集中の自分を除く）。", "Cắt khoảng trắng đầu và cuối. Trùng tên thì báo lỗi (trừ chính bản ghi đang sửa)."],
      detail=["同じ名前の重複チェックは削除済みを含めない。", "Kiểm tra trùng tên không tính các mục đã xóa."], err=["E01", "E04", "E09"]),
    F("4", "単位", 'input[aria-label="単位"]', "text", "input", vi="Đơn vị", req="○", len=["文字列 20", "Chuỗi ký tự 20"], init=["空", "Trống"],
      ex=["個", "Đơn vị đếm của vật tư (cái, tờ, hộp, v.v.)"], err=["E01", "E04"],
      detail=["自由入力・最大20文字。表記は「個」にそろえる（個／コのゆれを避ける）。", "Nhập tự do, tối đa 20 ký tự. Thống nhất cách ghi là 「個」 (tránh lẫn 個 / コ)."]),
    F("5", "コース", 'div[aria-label="コース"]', "check", "check", vi="Khóa học", req="○",
      len=["複数選択（ESスタンダード／ESライト（冷蔵庫）／ESライト（自販機））", "Chọn nhiều (ES Standard / ES Lite (tủ lạnh) / ES Lite (máy bán hàng))"], init=["未選択", "Chưa chọn"],
      ex=["ESスタンダード", "Một hoặc nhiều khóa học trong danh sách lựa chọn"], err=["E01"],
      detail=["法人Web 資材注文は、お客様のコースを含む資材だけ出す。使用中でも変更できる（必須）。","Đặt vật tư trên Web doanh nghiệp chỉ hiện vật tư có chứa khóa học của khách hàng. Đổi được kể cả khi đang sử dụng (bắt buộc nhập)."]),
    F("6", "公開ステータス", 'select[aria-label="公開ステータス"]', "select", "select", vi="Trạng thái công khai", req="○",
      len=["選択（公開／非公開）", "Chọn (công khai / không công khai)"], init=["公開", "Công khai"], ex=["非公開", "Một trạng thái trong danh sách lựa chọn"],
      detail=["非公開にしても運営には見える。仮登録の初期セット・運営の資材発注・資材注文管理・在庫の選択肢には出せる（運営が入れたければ入れられる）。法人Webには表示しない（カートに入っていても注文できない）。既存の注文・初期備品・在庫は変えない。","Nếu đặt 非公開 thì vận hành vẫn thấy; vẫn chọn được trong bộ ban đầu của đăng ký tạm, đặt vật tư của vận hành, quản lý đơn vật tư, tồn kho (vận hành muốn đưa vào thì được). Không hiện trên Web doanh nghiệp (dù đã có trong giỏ cũng không đặt được). Đơn đặt, vật dụng ban đầu và tồn kho hiện có không thay đổi."]),
    F("7", "単価（税抜）", 'input[aria-label="単価（税抜）"]', "text", "input", vi="Đơn giá (chưa thuế)", req="○",
      len=["金額（整数・0〜999,999,999・税抜）", "Số tiền (số nguyên, 0〜999,999,999, chưa thuế)"], init=["空（0円ではない）", "Trống (không phải 0 yên)"],
      ex=["120", "Đơn giá một đơn vị chưa thuế (yên)"], err=["E01", "E14", "E12"],
      detail=["初期値は空。入れ忘れで無料の資材にならないようにするため（0円は入力すれば登録できる）。変えても、受付済みの資材注文の請求額は変わらない（注文時点の値を持つ。Q6）。この注記を項目の下に出す。", "Giá trị ban đầu là trống, để không vô tình thành vật tư miễn phí do quên nhập (nhập 0 yên thì vẫn đăng ký được). Dù đổi, số tiền thanh toán của đơn đặt vật tư đã tiếp nhận cũng không đổi (đơn giữ giá trị tại thời điểm đặt. Q6). Hiện ghi chú này dưới mục."]),
    F("8", "税率", 'button[aria-label="税率"]', "select", "select", vi="Thuế suất", req="○",
      len=["選択（税率マスタ）", "Chọn (danh mục thuế suất)"], init=["10%", "10%"], ex=["10%", "Một thuế suất trong danh mục thuế suất"],
      detail=["税率のドロップダウンからフル権限が足す・直す（台帳 E）。", "Vai trò toàn quyền thêm hoặc sửa thuế suất từ danh sách thả xuống (台帳 E)."]),
    F("9", "取扱倉庫", 'div[aria-label="取扱倉庫"]', "check", "check", vi="Kho xử lý", req="○",
      len=["複数選択（倉庫区分「ピッキング倉庫（資材）」の倉庫だけ）", "Chọn nhiều (chỉ kho thuộc loại kho lấy hàng (vật tư))"],
      init=["ES事務所", "Văn phòng ES"], ex=["ES事務所", "Tên một hoặc nhiều kho"], err=["E01"],
      detail=["資材発注の納入先の候補（1回の発注は1資材につき1倉庫で、この中から1つ選ぶ）。使用中でも変更できる（必須）。選択肢は倉庫区分「ピッキング倉庫（資材）」だけ、初期値はES事務所。お客様の資材注文を出す倉庫（資材便の倉庫）は取扱倉庫ではなく、拠点の配送区分「資材」のルートのピッキング倉庫（2026-10-08）。", "Ứng viên nơi giao khi đặt vật tư (mỗi lần đặt hàng chỉ 1 kho cho 1 vật tư, chọn 1 trong các kho này). Đổi được kể cả khi đang sử dụng (bắt buộc nhập). Lựa chọn chỉ gồm kho loại 「ピッキング倉庫（資材）」, mặc định là văn phòng ES. Kho xuất đơn vật tư của khách (kho của chuyến vật tư) không phải kho xử lý mà là kho picking của tuyến loại giao hàng 「資材」 của điểm (2026-10-08)."],
      open=["取扱倉庫が複数ある資材を発注するとき、納入先の初期値はどの倉庫か（先頭の倉庫か、ES事務所か）。1回の発注は1資材につき1倉庫なので、初期値の決め方が要る", "Khi đặt hàng vật tư có nhiều kho xử lý, kho nhận hàng mặc định là kho nào (kho đầu tiên hay văn phòng ES)? Mỗi lần đặt hàng chỉ 1 kho cho 1 vật tư nên cần quy tắc cho giá trị mặc định"], ask="hong"),
    F("10", "規格", 'input[aria-label="規格"]', "text", "input", vi="Quy cách", req="－", len=["文字列 60", "Chuỗi ký tự 60"], init=["空", "Trống"],
      ex=["幅30×奥行20cm", "Quy cách như kích thước (rộng 30 × sâu 20cm)"], err=["E04"]),
    F("11", "写真", ".mt-photo", "file", "input", vi="Ảnh", req="－",
      len=["画像 PNG・JPEG・WebP・5MB・1枚（商品写真と同じ）", "Ảnh PNG / JPEG / WebP, 5MB, 1 ảnh (giống ảnh sản phẩm)"], init=["未登録", "Chưa đăng ký"],
      ex=["hoeibag.png", "Tên tệp ảnh PNG, JPEG hoặc WebP"], err=["E268"],
      detail=["法人Web 資材注文に出す。差し替え・削除ができる。形式・大きさのエラーは E268（PNG・JPEG・WebP・5MB。E255 は JPG・PNG・HEIC で形式が違うため使わない。E268 の「長い辺1200px以内」も商品写真と同じ）。", "Hiện ở đặt vật tư trên Web doanh nghiệp. Có thể thay thế hoặc xóa. Lỗi định dạng/dung lượng dùng E268 (PNG・JPEG・WebP, 5MB). Không dùng E255 vì định dạng là JPG・PNG・HEIC. 「cạnh dài tối đa 1200px」 của E268 cũng giống ảnh sản phẩm."]),
]
V_FORM = [
    {"id": "006", "code": "AW_MATE_003", "state": ["新規登録 初期表示", "Đăng ký mới: hiển thị ban đầu"], "url": "/ops/masters/materials/new", "setup": "", "full": True, "wait": 400,
     "note": ["フル権限で表示。取扱倉庫は ES事務所、公開ステータスは公開、税率は 10% が最初から入り、単価は空。", "Hiển thị với toàn quyền. Kho xử lý là văn phòng ES, trạng thái công khai là 公開, thuế suất 10% được điền sẵn, đơn giá để trống."], "items": N_ITEMS},
    {"id": "007", "code": "AW_MATE_003", "state": ["新規登録 入力エラー", "Đăng ký mới: lỗi nhập"], "url": "/ops/masters/materials/new", "setup": JS + "q('.pbtn .save').click();await sleep(400);", "full": True, "wait": 400,
     "note": ["何も入れずに「登録」を押したとき。", "Khi bấm 「登録」 mà chưa nhập gì."],
     "items": [F("12", "エラーの枠", ".vbox", "label", "show", vi="Khung lỗi", pattern="P-FORMBOX", err=["E01"],
                 detail=["項目の下の文言＋見出しの下に「保存できません（n件）」の1行の枠（P-FORMBOX）。", "Câu thông báo dưới mục + khung một dòng 「保存できません（n件）」 dưới tiêu đề (P-FORMBOX)."])]},
    {"id": "008", "code": "AW_MATE_003", "state": ["編集 初期表示", "Sửa: hiển thị ban đầu"], "url": "/ops/masters/materials/S001/edit", "setup": "", "full": True, "wait": 400,
     "items": [F("13", "編集の違い", ".ch::変更履歴^", "area", vi="Điểm khác khi sửa",
                 detail=["新規と同じ項目に保存済みの値が入る。違い：画面名に資材ID、ボタンは「保存」、下に変更履歴（P-HIST）。", "Cùng các mục như đăng ký mới, có điền giá trị đã lưu. Khác biệt: tên màn hình có 資材ID, nút là 「保存」, bên dưới có lịch sử thay đổi (P-HIST)."])]},
]

# ================================================================ AW_MATE_004 CSV取込
# 今の資材を CSV出力した形のファイルを作って選ぶ（1行目の資材名を変える＝更新の見本）
CSV_UP = (JS + "const res=await fetch('/api/domain/csv/export',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json','x-es-site':'ops'},body:JSON.stringify({args:{entity:'materials',scope:{site:'ops'}}})});"
          "const t=await res.json();const esc=v=>'\"'+String(v??'').replace(/\"/g,'\"\"')+'\"';"
          "const pick=rows=>{const text='\\ufeff'+rows.map(r=>r.map(esc).join(',')).join('\\r\\n');const inp=q('#sec-csv input[type=file]');const dt=new DataTransfer();dt.items.add(new File([text],'取込テスト.csv',{type:'text/csv'}));inp.files=dt.files;inp.dispatchEvent(new Event('change',{bubbles:true}));};"
          "const rows=[t.head,...t.rows.map(r=>r.slice())];rows[1][1]=rows[1][1]+' 改';")
CSV_STEP2 = CSV_UP + "const bad=t.rows[0].slice();bad[0]='XX999999';rows.push(bad);pick(rows);await sleep(2500);window.scrollTo(0,q('#sec-csv').offsetTop-80);"
CSV_BAD = JS + "const inp=q('#sec-csv input[type=file]');const dt=new DataTransfer();dt.items.add(new File(['\\ufeff\"列A\",\"列B\"\\r\\n\"1\",\"2\"'],'形の違うファイル.csv',{type:'text/csv'}));inp.files=dt.files;inp.dispatchEvent(new Event('change',{bubbles:true}));await sleep(2000);"
CSV_DONE = (CSV_UP + "const nw=t.rows[0].slice();nw[0]='';nw[1]='追加の見本'+String(Date.now()).slice(-5);rows.push(nw);pick(rows);await sleep(2500);"
            "[...document.querySelectorAll('.csvph .btns button')].pop().click();await sleep(1500);")

V_CSV = [
    {"id": "009", "code": "AW_MATE_004", "state": ["ステップ1 ファイルを選ぶ", "Bước 1: chọn tệp"], "url": "/ops/masters/materials/import", "setup": "", "full": True, "wait": 800,
     "note": ["資材マスタの CSV。列は資材ID・資材名・コース・単位・規格・単価（税抜）・税率・公開ステータス・取扱倉庫（写真は取り込まない）。資材×プランの CSV は作らない（Q5・受付簿 #393）。", "CSV của danh mục vật tư. Các cột: 資材ID, tên vật tư, khóa học, đơn vị, quy cách, đơn giá (chưa thuế), thuế suất, trạng thái công khai, kho xử lý (không nhập ảnh). Không làm CSV vật tư × gói (Q5・受付簿 #393)."],
     "items": [F("20", "CSV取込（ステップ1）", "#sec-csv", "area", vi="Nhập CSV (bước 1)", pattern="P-CSV", cond=CAN,
                 detail=["「ファイルを選ぶ」かドラッグ＆ドロップでファイルを選ぶ。ひな形のボタンはない（一覧の「CSV出力」の形をそのまま使う）。キーは資材ID（空欄＝新規）。エラーの行だけ取り込まない（台帳 F）。", "Chọn tệp bằng 「ファイルを選ぶ」 hoặc kéo thả. Không có nút tệp mẫu (dùng đúng dạng của 「CSV出力」 ở danh sách). Khóa là 資材ID (để trống = tạo mới). Chỉ các dòng lỗi không được nhập (台帳 F)."],
                 open=["【要確認】コース・取扱倉庫は複数の値を1つのセルに入れる。いまは区切りを「・」の仮置きで作り、倉庫は ID でも名前でも受け付ける（受付簿 #395）。この区切りと書き方でよいか", "【Cần xác nhận】Khóa học và kho xử lý có nhiều giá trị trong một ô. Hiện tạm dùng dấu 「・」 làm phân cách, kho nhập bằng ID hoặc tên đều được (受付簿 #395). Cách phân cách và cách viết này đã đúng chưa"], ask="hong")]},
    {"id": "010", "code": "AW_MATE_004", "state": ["ステップ2 確認・登録", "Bước 2: xác nhận và đăng ký"], "url": "/ops/masters/materials/import", "setup": CSV_STEP2, "full": True, "wait": 800,
     "note": ["ファイルを選んだ直後。見本は今の資材の CSV出力に、1行目の資材名を変えた行（更新の見本）と、キーが誤りの行（エラーの見本）を足したもの。","Ngay sau khi chọn tệp. Tệp mẫu là CSV xuất từ vật tư hiện tại, đổi tên vật tư ở dòng 1 (mẫu cập nhật) và thêm 1 dòng có khóa sai (mẫu lỗi)."],
     "items": [F("21", "CSV取込（ステップ2）", "#sec-csv", "area", vi="Nhập CSV (bước 2)", pattern="P-CSV", err=["S10", "E52"],
                 detail=["新規／更新／変更なし／エラーの件数と、エラー行の理由。エラーの行は取り込まない。", "Số lượng mới / cập nhật / không đổi / lỗi và lý do của các dòng lỗi. Dòng lỗi không được nhập."])]},
    {"id": "012", "code": "AW_MATE_004", "state": ["ファイル全体のエラー", "Lỗi toàn tệp"], "url": "/ops/masters/materials/import", "setup": CSV_BAD, "full": False, "wait": 800,
     "note": ["列が違う・文字コードが違う・文字化けしているとき。", "Khi cột sai, mã ký tự sai hoặc bị lỗi font."],
     "items": [F("22", "ファイル全体のエラー", ".notice.ng", "label", "show", vi="Lỗi toàn tệp", pattern="P-CSV", err=["E51"],
                 detail=["列の違い・文字コード（UTF-8 以外）・文字化けのときは行ごとではなくファイル全体のエラー E51 を出し、ステップ2へ進めない。", "Khi cột sai, mã ký tự (không phải UTF-8) hoặc lỗi font thì hiện lỗi toàn tệp E51 thay vì theo từng dòng, không sang được bước 2."])]},
    {"id": "013", "code": "AW_MATE_004", "state": ["取込完了", "Nhập xong"], "url": "/ops/masters/materials/import", "setup": CSV_DONE, "full": False, "wait": 800,
     "note": ["「登録」を押した直後。取込のあと一覧へ戻り、トースト S10 が出る。見本は更新1件・新規1件。","Ngay sau khi bấm 「登録」. Sau khi nhập thì về danh sách và hiện toast S10. Mẫu gồm 1 dòng cập nhật, 1 dòng mới."],
     "items": [F("23", "取込完了", ".toast", "label", "show", vi="Nhập xong", pattern="P-CSV", err=["S10"],
                 detail=["「登録」で取り込み、S10（新規 n件・更新 m件）のトーストを出して一覧へ戻る。", "Nhấn 「登録」 để nhập, hiện toast S10 (n mới, m cập nhật) rồi về danh sách."])]},
]

VIEWS = V_LIST + V_DETAIL + V_FORM + V_CSV

OPEN = []
