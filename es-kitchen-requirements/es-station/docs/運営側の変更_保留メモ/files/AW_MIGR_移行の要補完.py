# -*- coding: utf-8 -*-
"""
画面設計書のデータ：運営管理者Web「移行の要補完」（AW_MIGR）。
元は本物の Web（このリポジトリのコード app/ops/migration/**・lib/csv/migrate.ts・lib/domain/migrate.ts）。決定は docs/決定台帳.md（既存のお客様の移行CSV）、列は docs/01_仕様/20_法人・拠点・契約/移行CSV_列の案_20261003.md と 契約_01 §9・§9-1 が正。
洗い出し・確認の記録は docs/05_画面設計書/確認メモ_AW_運営A_申請・法人・契約.md（Q7＝A：設計書に含める）。

画面：AW_MIGR_001 移行の要補完（一覧・休止の期間のモーダル）／002 移行CSV取込（ファイルの種類を選ぶ）／003 取込A 法人・拠点・契約／004 取込B 設備（貸出）／005 取込C 担当者／006 取込D 企業独自価格
見本のデータ（今日＝2026-10-05）：見本には移行した拠点がない。取込Aで4拠点（CU00011 本社・CU00015 大阪営業所・CU00013 仙台工場＝仮登録・CU02002 盛岡工場＝休止中）を作ってから一覧を撮る。

コードと決定が違うところ（demo_ok）：
  ・0件のときの文は「条件に一致するデータがありません。…」（P-LIST は I01）
  ・フェーズ1 の ID が フェーズ2 の番号とぶつかる行のエラー（移行CSV_列の案 E-1）は決定どおりだが、見本の ID が使えなくなる（CU00012 などは使えない）
撮れない状態：取込の登録が失敗した（E34）／取込が5,000行を超えた
"""

TITLE = ["移行の要補完（AW_MIGR）", "Cần bổ sung sau di chuyển (AW_MIGR)"]
SHEET = ["移行の要補完", "Cần bổ sung sau di chuyển"]
BASENAME = "画面設計書_AW_MIGR_移行の要補完"
IMG_PREFIX = "AW_MIGR"
OUT_DIR = "運営管理者Web_申請・契約"
CODE_NOTE = ["画面コード規約（docs/01_仕様/画面コード規約_20261005.md）：<Module(2)>_<Feature(4)>_<Seq(3)>。AW＝Admin Web、MIGR＝移行", "Quy ước mã màn hình (画面コード規約_20261005): <Module(2)>_<Feature(4)>_<Seq(3)>. AW = Admin Web, MIGR = di chuyển"]
SITE = "ops"
SYSTEM = {"ja": "運営管理者Web", "vi": "Web quản trị vận hành"}
AUTHOR = "Claude（cloud）／確認：hong"
CREATED = "2026-10-07"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "ops", "loginId": "Ad00010"}
CODE_PATHS = ["app/ops/migration", "lib/csv/migrate.ts", "lib/domain/migrate.ts", "lib/domain/seed"]

DECISIONS = [
    {"date": "2026-10-07", "target": "AW_MIGR 全体",
     "q": ["移行の要補完・移行CSV取込を設計書の対象にするか", "Có đưa 移行の要補完 và nhập CSV di chuyển vào tài liệu thiết kế không"],
     "a": ["含める（A）。要補完の一覧と、移行CSV取込（A 法人・拠点・契約／B 設備／C 担当者／D 企業独自価格）を画面に分けて書く", "Có (A). Viết riêng danh sách cần bổ sung và nhập CSV di chuyển (A pháp nhân・cơ sở・hợp đồng / B thiết bị / C người phụ trách / D giá riêng doanh nghiệp)"], "src": "hong 回答 2026-10-07（確認メモ_AW_運営A Q7＝A・受付簿 No.184）"},
    {"date": "2026-10-05", "target": "AW_MIGR_003 取込A フェーズ1の状態",
     "q": ["フェーズ1の状態（法人ステータス）をどう取り込むか", "Trạng thái phase 1 (法人ステータス) được nhập như thế nào"],
     "a": ["本登録＝有効／仮登録＝仮登録のまま取り込み申込の受付（受付中）に載せる／休止中＝利用休止（休止の期間・再開月は要補完）／解約済・削除済＝取り込まない", "本登録 = hiệu lực / 仮登録 = nhập ở trạng thái đăng ký tạm và đưa vào đơn (受付中) / 休止中 = 利用休止 (kỳ tạm ngưng・tháng tiếp tục cần bổ sung) / 解約済・削除済 = không nhập"], "src": "移行CSV_列の案 E-2（hong 2026-10-05）"},
    {"date": "2026-10-05", "target": "AW_MIGR_003 取込A ID",
     "q": ["フェーズ1の ID をそのまま使うか", "Có dùng nguyên ID của phase 1 không"],
     "a": ["そのまま使う（法人・拠点とも CU＋5桁）。フェーズ2の番号（法人と拠点で1つの連番）とぶつかる行はエラー", "Dùng nguyên (pháp nhân・cơ sở đều CU + 5 chữ số). Dòng trùng số của phase 2 (một dãy số chung cho pháp nhân và cơ sở) là lỗi"], "src": "移行CSV_列の案 §0・E-1（hong 2026-10-05）"},
    {"date": "2026-10-05", "target": "AW_MIGR_005 取込C 担当者",
     "q": ["担当者の人数の上限", "Giới hạn số người phụ trách"],
     "a": ["上限なし。取り込み直すときはその法人・拠点の担当者をファイルの中身で置き換える", "Không giới hạn. Khi nhập lại thì thay người phụ trách của pháp nhân / cơ sở đó bằng nội dung tệp"], "src": "移行CSV_列の案 C（hong 2026-10-05）"},
    {"date": "2026-10-05", "target": "AW_MIGR_006 取込D 企業独自価格",
     "q": ["企業独自価格の単価を CSV で入れるか", "Có nhập đơn giá riêng doanh nghiệp bằng CSV không"],
     "a": ["入れる（D のファイル。キー＝拠点ID＋品番）。A で企業独自価格なのに D に行がない拠点は要補完に出す", "Có (tệp D; khóa = 拠点ID + 品番). Cơ sở có giá riêng ở A mà D không có dòng thì hiện trong cần bổ sung"], "src": "移行CSV_列の案 D（hong 2026-10-05）"},
    {"date": "2026-10-05", "target": "AW_MIGR 配送",
     "q": ["配送（枠・倉庫・配送会社）を移行CSVに入れるか", "Có đưa giao hàng (khung・kho・công ty vận chuyển) vào CSV di chuyển không"],
     "a": ["入れない（フェーズ1から出せない）。移行のあとで運営が入れる。入れるまで要補完に「配送の設定」と出す", "Không (phase 1 không xuất ra được). Vận hành nhập sau khi di chuyển. Cho đến khi nhập thì hiện \"配送の設定\" trong cần bổ sung"], "src": "移行CSV_列の案 §0・E-3（hong 2026-10-05）"},
    {"date": "2026-10-07", "target": "AW_MIGR 共通（一覧・CSV）",
     "q": ["一覧・CSV 入出力・履歴の型", "Mẫu danh sách・nhập xuất CSV・lịch sử"],
     "a": ["P-LIST／P-CSV／P-CSV-OUT に従う。ただしコードは一覧の0件の文・取込の確認のモーダルが違う（demo_ok）", "Theo P-LIST / P-CSV / P-CSV-OUT. Tuy nhiên code khác ở câu khi 0 dòng và modal xác nhận khi nhập (demo_ok)"], "src": "決定台帳 F（共通パターン）"},
]

CHANGES = []

HIDE_ALWAYS = []
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [
    {"code": "AW_MIGR_001", "ja": "移行の要補完", "vi": "Cần bổ sung sau di chuyển"},
    {"code": "AW_MIGR_002", "ja": "移行CSV取込（種類の選択）", "vi": "Nhập CSV di chuyển (chọn loại)"},
    {"code": "AW_MIGR_003", "ja": "移行CSV取込 A 法人・拠点・契約", "vi": "Nhập CSV di chuyển A pháp nhân・cơ sở・hợp đồng"},
    {"code": "AW_MIGR_004", "ja": "移行CSV取込 B 設備（貸出）", "vi": "Nhập CSV di chuyển B thiết bị (cho mượn)"},
    {"code": "AW_MIGR_005", "ja": "移行CSV取込 C 担当者", "vi": "Nhập CSV di chuyển C người phụ trách"},
    {"code": "AW_MIGR_006", "ja": "移行CSV取込 D 企業独自価格", "vi": "Nhập CSV di chuyển D giá riêng doanh nghiệp"},
]

# ---------------------------------------------------------------- 小さな関数
H = (
    "const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));const q=(s)=>document.querySelector(s);"
    "const setv=(el,v)=>{if(!el)return;const p=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;"
    "Object.getOwnPropertyDescriptor(p,'value').set.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}));};"
    "const setsel=(el,v)=>{if(!el)return;Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(el,v);el.dispatchEvent(new Event('change',{bubbles:true}));};"
    "const btn=(t,root)=>[...(root||document).querySelectorAll('button')].find(b=>(b.textContent||'').trim().includes(t));"
    "const search=()=>{btn('検索',q('form.filter')).click();};"
    "const put=async(text,name)=>{const inp=document.querySelector('input[type=file]');const dt=new DataTransfer();dt.items.add(new File([text],name||'移行.csv',{type:'text/csv'}));inp.files=dt.files;inp.dispatchEvent(new Event('change',{bubbles:true}));await sleep(2000);};"
    "const tpl=async(entity)=>{const res=await fetch('/api/domain/csv/template',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json','x-es-site':'ops'},body:JSON.stringify({args:{entity:entity,scope:{site:'ops'}}})});return await res.json();};"
    "const esc=v=>'\"'+String(v==null?'':v).replace(/\"/g,'\"\"')+'\"';"
    "const toCsv=(rows)=>'\\ufeff'+rows.map(r=>r.map(esc).join(',')).join('\\r\\n');"
)
# A のファイル（4拠点）。CU00012 などフェーズ2の番号とぶつかる ID は使えない（移行CSV_列の案 E-1）。
A_ROWS = (
    "const t=await tpl('migrationSites');const sIdx=t.head.findIndex(h=>/^法人ステータス/.test(h));"
    "const r2=t.rows[1].slice();r2[1]='CU00015';const rows=[t.head,t.rows[0].slice(),r2];"
    "const r3=t.rows[0].slice();r3[0]='CU00014';r3[1]='CU00013';r3[2]='株式会社サンプル工業';r3[22]='仙台工場';r3[23]='センダイコウジョウ';r3[sIdx]='仮登録';rows.push(r3);"
    "const r4=t.rows[0].slice();r4[0]='CU02001';r4[1]='CU02002';r4[2]='みちのく食品株式会社';r4[22]='盛岡工場';r4[23]='モリオカコウジョウ';r4[sIdx]='休止中';rows.push(r4);"
)
A_PUT = A_ROWS + "await put(toCsv(rows),'移行A.csv');"
A_GO = A_PUT + "btn('登録',q('.btns')).click();await sleep(1500);"
# 法人ステータスがそろわない行（エラーの見本）：同じ法人の2行目を休止中にする
A_BAD = (
    "const t=await tpl('migrationSites');const sIdx=t.head.findIndex(h=>/^法人ステータス/.test(h));"
    "const r2=t.rows[1].slice();r2[1]='CU00015';r2[sIdx]='休止中';const rows=[t.head,t.rows[0].slice(),r2];"
    "const r3=t.rows[0].slice();r3[0]='CU00014';r3[1]='CU00013';r3[2]='株式会社サンプル工業';r3[22]='仙台工場';r3[23]='センダイコウジョウ';r3[sIdx]='仮登録';rows.push(r3);"
    "await put(toCsv(rows),'移行A.csv');"
)
def BCD(entity, extra=""):
    return ("const t=await tpl('%s');const rows=[t.head].concat(t.rows.map(r=>r.map(v=>v==='CU00012'?'CU00015':v)));%s" % (entity, extra)) + "await put(toCsv(rows),'移行.csv');"
BAD_FILE = ("const inp=q('input[type=file]');const dt=new DataTransfer();dt.items.add(new File([new Uint8Array([255,254,0,1,2,3,200,201])],'壊れたファイル.csv',{type:'text/csv'}));inp.files=dt.files;inp.dispatchEvent(new Event('change',{bubbles:true}));await sleep(1500);")

TRIG = {"button": "click", "link": "click", "text": "input", "textarea": "input", "select": "select", "month": "input", "date": "input", "check": "check", "radio": "check", "tab": "click", "file": "upload"}
ITEMS = {}
_N = {"n": 0, "m": 0}

LENVI = {
    "文字列": "Chuỗi", "選択": "Chọn", "選択（年月）": "Chọn (năm-tháng)", "整数": "Số nguyên", "年月 yyyy-mm": "Năm-tháng yyyy-mm", "日付 yyyy-mm-dd": "Ngày yyyy-mm-dd",
    "1／0（空欄＝既定）": "1 / 0 (trống = mặc định)", "文字列（; でつなぐ）": "Chuỗi (nối bằng ;)", "CSV（UTF-8・5,000行まで）": "CSV (UTF-8, tối đa 5.000 dòng)",
    "選択（法人／この拠点）": "Chọn (pháp nhân / cơ sở này)", "文字列 CU＋5桁": "Chuỗi CU + 5 chữ số", "文字列 AG＋5桁": "Chuỗi AG + 5 chữ số",
    "文字列 Ad＋5桁": "Chuỗi Ad + 5 chữ số", "文字列 ES＋6桁": "Chuỗi ES + 6 chữ số", "選択（メイン／請求／サブ担当者）": "Chọn (chính / thanh toán / phụ)",
    "選択（拠点名など検索）": "Chọn (tìm theo tên cơ sở...)",
}

def _add(key, no, ja, vi, sel, kind, d, kw):
    r = {"no": no, "ja": ja, "vi": vi, "sel": sel, "kind": kind, "trig": kw.pop("trig", TRIG.get(kind, "view"))}
    if d: r["detail"] = d
    r.update(kw)
    if isinstance(r.get("len"), str) and r["len"] in LENVI: r["len"] = [r["len"], LENVI[r["len"]]]
    assert key not in ITEMS, key
    ITEMS[key] = r
    return r

def big(key, ja, vi, sel, kind="area", d=None, **kw):
    _N["n"] += 1; _N["m"] = 0
    return _add(key, str(_N["n"]), ja, vi, sel, kind, d, kw)

def sub(key, ja, vi, sel, kind="label", d=None, **kw):
    _N["m"] += 1
    return _add(key, "%d.%d" % (_N["n"], _N["m"]), ja, vi, sel, kind, d, kw)

def P(*keys):
    return [ITEMS[k] for k in keys]

def V(id, code, ja, vi, url, keys, setup="", note=None, full=True, wait=None, **kw):
    v = {"id": id, "code": code, "state": [ja, vi], "url": url, "setup": (H + setup) if setup else "", "full": full, "note": note or ["", ""], "items": P(*keys)}
    if wait is not None: v["wait"] = wait
    v.update(kw)
    return v

U = lambda ja, vi: [ja, vi]
IMPORT = ["移行の要補完の 移行CSV取込 の権限（フル権限・システム管理だけ）", "Quyền 移行CSV取込 của 移行の要補完 (chỉ フル権限・システム管理)"]
INIT_BLANK = ["空欄（新規の行で必須の列を除く）", "Trống (trừ cột bắt buộc ở dòng mới)"]

# ================================================================ AW_MIGR_001 一覧
big("l_head", "ヘッダー", "Đầu trang", ".ph", "area", ["パンくず（法人・契約管理 / 移行の要補完）・画面名・操作ボタン。権限がないボタンは出さない。", "Breadcrumb (法人・契約管理 / 移行の要補完), tên màn hình, nút thao tác. Nút không có quyền thì không hiện."])
sub("l_crumb", "パンくず", "Breadcrumb", ".ph .crumb", "label", ["「法人・契約管理 / 移行の要補完」。", "「法人・契約管理 / 移行の要補完」."])
sub("l_title", "画面名", "Tên màn hình", ".ph h1", "label", ["「移行の要補完」。サイドメニュー「法人・契約管理」の中にある。移行CSVを取り込んでいない間は0件。", "「移行の要補完」. Nằm trong menu 「法人・契約管理」. Khi chưa nhập CSV di chuyển thì 0 dòng."])
sub("l_import", "移行CSV取込", "Nhập CSV di chuyển", ".ph button::移行CSV取込", "button", ["移行CSV取込（AW_MIGR_002）へ。フル権限・システム管理だけに出す（移行の作業は1回目・2回目のデータメンテナンス用）。", "Mở 移行CSV取込 (AW_MIGR_002). Chỉ hiện với フル権限・システム管理 (công việc di chuyển dùng cho đợt bảo trì dữ liệu lần 1・2)."], cond=IMPORT)
sub("l_csvout", "CSV出力", "Xuất CSV", ".ph button::CSV出力", "button", ["検索条件のとおりの全件を CSV で出す。終わったら S12 のトースト。閲覧できる役割すべてに出す。", "Xuất toàn bộ theo điều kiện tìm kiếm ra CSV. Xong thì toast S12. Hiện với mọi vai trò xem được."], err=["S12"])
sub("l_toast", "結果のトースト", "Toast kết quả", ".toast", "toast", ["取込の登録（S10）・CSV出力（S12）・休止の期間の入力（S108）のあとに出る。", "Hiện sau khi đăng ký nhập (S10)・xuất CSV (S12)・nhập kỳ tạm ngưng (S108)."], err=["S10", "S12", "S108"])
big("l_hint", "説明", "Giải thích", ".card > p.hint", "label", ["この一覧の意味と、足りない項目の埋め方（橙＝画面の編集で埋める／青＝移行CSVを取り込み直して入れる／配送の設定＝移行のあとに子契約の編集で入れる／仮登録＝申込の受付から進める／休止の期間＝休止の期間を入れる）。", "Ý nghĩa danh sách và cách bổ sung (cam = sửa trên màn hình / xanh = nhập lại CSV di chuyển / 配送の設定 = nhập sau di chuyển ở sửa hợp đồng con / 仮登録 = tiếp tục từ đơn / kỳ tạm ngưng = nhập kỳ tạm ngưng)."])
big("l_search", "検索条件", "Điều kiện tìm kiếm", "form.filter", "area", ["P-LIST の検索欄（開閉できる）。条件を変えて「検索」を押すと一覧が絞られる。", "Khung tìm kiếm P-LIST (đóng mở được). Đổi điều kiện rồi bấm 「検索」 thì danh sách được lọc."], pattern="P-LIST")
sub("l_kw", "キーワード", "Từ khóa", "form.filter input[placeholder='拠点ID、拠点名、法人ID、法人名']", "text", ["拠点ID・拠点名・法人ID・法人名のどれかに部分一致。", "Khớp một phần với 拠点ID・拠点名・法人ID・法人名."], req="－", len=U("文字列", "Chuỗi"), ex=["CU00011", "CU00011"], init=["空欄", "Trống"])
sub("l_todo", "足りない項目", "Mục còn thiếu", "form.filter select[aria-label='足りない項目']", "select", ["選んだ項目が足りない拠点だけ出す。選択肢は20種類（法人名フリガナ・請求先法人名・法人の電話番号・法人の請求条件・口座振替の手続き状況・法人のメイン担当者・拠点名フリガナ・拠点の電話番号・設置フロア・従業員数概算・受取できる時間帯・当初契約開始年月・納品の条件・拠点のメイン担当者・拠点の請求条件・企業独自価格の単価・配送の設定・貸出日・仮登録（申込の承認が必要）・休止の期間・再開月）。", "Chỉ hiện cơ sở đang thiếu mục đã chọn. Có 20 lựa chọn (tên furigana pháp nhân・tên pháp nhân nhận hóa đơn・điện thoại pháp nhân・điều kiện thanh toán pháp nhân・trạng thái thủ tục chuyển khoản・người phụ trách chính pháp nhân・furigana cơ sở・điện thoại cơ sở・tầng đặt máy・số nhân viên ước tính・khung giờ nhận・tháng bắt đầu hợp đồng ban đầu・điều kiện giao hàng・người phụ trách chính cơ sở・điều kiện thanh toán cơ sở・đơn giá riêng doanh nghiệp・thiết lập giao hàng・ngày cho mượn・仮登録 (cần duyệt đơn)・kỳ tạm ngưng・tháng tiếp tục)."], req="－", len=U("選択", "Chọn"), ex=["配送の設定", "Thiết lập giao hàng"], init=["足りない項目（指定なし）", "Mục còn thiếu (không chỉ định)"])
sub("l_kind", "契約区分", "Loại hợp đồng", "form.filter select[aria-label='契約区分']", "select", ["本導入／お試しキャンペーン。", "本導入 / お試しキャンペーン."], req="－", len=U("選択", "Chọn"), ex=["本導入", "Chính thức"], init=["契約区分（指定なし）", "Loại hợp đồng (không chỉ định)"])
sub("l_cst", "契約の状態", "Trạng thái hợp đồng", "form.filter select[aria-label='契約の状態']", "select", ["仮登録／有効／利用休止／解約手続き中。", "仮登録 / 有効 / 利用休止 / 解約手続き中."], req="－", len=U("選択", "Chọn"), ex=["仮登録", "Đăng ký tạm"], init=["契約の状態（指定なし）", "Trạng thái hợp đồng (không chỉ định)"])
sub("l_from", "取込日（から）", "Ngày nhập (từ)", "form.filter input[aria-label='取込日（から）']", "date", ["取込日が、この日以降。", "Ngày nhập từ ngày này trở đi."], req="－", len=U("日付 yyyy-mm-dd", "Ngày yyyy-mm-dd"), ex=["2026-10-01", "2026-10-01"], init=["空欄", "Trống"])
sub("l_to", "取込日（まで）", "Ngày nhập (đến)", "form.filter input[aria-label='取込日（まで）']", "date", ["取込日が、この日まで。「から」より前の日付はエラー。", "Ngày nhập đến ngày này. Ngày trước 「から」 là lỗi."], req="－", len=U("日付 yyyy-mm-dd", "Ngày yyyy-mm-dd"), ex=["2026-10-31", "2026-10-31"], init=["空欄", "Trống"])
sub("l_clear", "クリア", "Xóa điều kiện", "form.filter button::クリア", "button", ["条件をすべて空にして検索し直す。", "Xóa hết điều kiện và tìm lại."])
sub("l_go", "検索", "Tìm kiếm", "form.filter button.pri", "button", ["条件で絞り込む。1ページ目に戻る。", "Lọc theo điều kiện. Quay về trang 1."])
sub("l_sort", "並べ替え", "Sắp xếp", ".sortbox", "select", ["並べ替える項目（拠点ID・拠点名・法人・契約区分・契約の状態・足りない項目の数・足りない項目・取込日）と昇順・降順。初期は取込日の新しい順。", "Mục sắp xếp (拠点ID・拠点名・法人・契約区分・契約の状態・số mục thiếu・mục thiếu・ngày nhập) và tăng / giảm. Ban đầu là ngày nhập mới nhất trước."], req="－", len=U("選択", "Chọn"), ex=["足りない項目の数", "Số mục còn thiếu"], init=["並べ替え（初期の順）", "Sắp xếp (thứ tự ban đầu)"])
big("l_table", "一覧の表", "Bảng danh sách", "table.tbl", "area", ["足りない項目がある拠点を1行ずつ出す（P-LIST）。全部埋まった拠点は一覧から消える。", "Mỗi dòng là một cơ sở còn mục thiếu (P-LIST). Cơ sở đã đủ thì biến mất khỏi danh sách."], pattern="P-LIST", err=["I01"])
sub("l_no", "No", "No", "table.tbl th::No", "label", ["表示順の番号。", "Số thứ tự hiển thị."])
sub("l_id", "拠点ID", "Mã cơ sở", "table.tbl tbody tr:first-child td:nth-child(2) a", "link", ["フェーズ1の ID のまま。押すと拠点詳細（AW_BRAN_002）へ。", "Giữ nguyên ID của phase 1. Bấm để mở 拠点詳細 (AW_BRAN_002)."])
sub("l_name", "拠点名", "Tên cơ sở", "table.tbl tbody tr:first-child td:nth-child(3)", "label", ["拠点の名前。長いときは省略して表示する。", "Tên cơ sở. Dài thì rút gọn khi hiển thị."])
sub("l_corp", "法人", "Pháp nhân", "table.tbl tbody tr:first-child td:nth-child(4) a", "link", ["所属法人の名前。押すと法人詳細（AW_CORP_002）へ。", "Tên pháp nhân trực thuộc. Bấm để mở 法人詳細 (AW_CORP_002)."])
sub("l_ckind", "契約区分", "Loại hợp đồng", "table.tbl tbody tr:first-child td:nth-child(5)", "label", ["本導入／お試しキャンペーン。", "本導入 / お試しキャンペーン."])
sub("l_cstat", "契約の状態", "Trạng thái hợp đồng", "table.tbl tbody tr:first-child td:nth-child(6) .badge", "label", ["有効（緑）・仮登録・利用休止などのバッジ。フェーズ1の状態の写し先（本登録＝有効／仮登録＝仮登録／休止中＝利用休止）。", "Badge 有効 (xanh)・仮登録・利用休止... Nơi ánh xạ trạng thái phase 1 (本登録 = 有効 / 仮登録 = 仮登録 / 休止中 = 利用休止)."])
sub("l_cnt", "足りない項目の数", "Số mục thiếu", "table.tbl tbody tr:first-child td:nth-child(7)", "label", ["足りない項目の数（右寄せ）。", "Số mục còn thiếu (căn phải)."])
sub("l_todos", "足りない項目", "Mục còn thiếu", "table.tbl tbody tr:first-child td:nth-child(8)", "label", ["足りない項目をラベルで並べる。橙＝画面の編集で埋める、青＝移行CSVを取り込み直して入れる。", "Các mục còn thiếu dạng nhãn. Cam = sửa trên màn hình, xanh = nhập lại CSV di chuyển."])
sub("l_date", "取込日", "Ngày nhập", "table.tbl tbody tr:first-child td:nth-child(9)", "label", ["移行CSV A を取り込んだ日（yyyy-mm-dd）。", "Ngày nhập CSV di chuyển A (yyyy-mm-dd)."])
sub("l_act", "操作", "Thao tác", "table.tbl tbody tr:first-child td.act", "area", ["行ごとのボタン。法人を編集／拠点を編集／子契約を編集（権限があるものだけ）。", "Nút theo từng dòng. 法人を編集 / 拠点を編集 / 子契約を編集 (chỉ nút có quyền)."], cond=["編集の権限があるとき", "Khi có quyền sửa"])
sub("l_a_corp", "法人を編集", "Sửa pháp nhân", "table.tbl button::法人を編集", "button", ["法人編集（AW_CORP_003）へ。橙のラベル（法人の項目）を埋める。", "Mở 法人編集 (AW_CORP_003). Bổ sung các nhãn cam (mục của pháp nhân)."])
sub("l_a_branch", "拠点を編集", "Sửa cơ sở", "table.tbl button::拠点を編集", "button", ["拠点編集（AW_BRAN_003）へ。橙のラベル（拠点の項目）を埋める。", "Mở 拠点編集 (AW_BRAN_003). Bổ sung các nhãn cam (mục của cơ sở)."])
sub("l_a_child", "子契約を編集", "Sửa hợp đồng con", "table.tbl button::子契約を編集", "button", ["子契約編集（AW_CONT_003）へ。配送の設定（配送ルート）などを入れる。", "Mở 子契約編集 (AW_CONT_003). Nhập thiết lập giao hàng (tuyến giao)..."])
sub("l_a_app", "申込を開く", "Mở đơn", "table.tbl button::申込を開く", "button", ["仮登録の行だけ。契約申請管理の申請詳細（AW_APPL）へ。受付 → 契約設定 → 本登録の順に進める。", "Chỉ dòng 仮登録. Mở 申請詳細 (AW_APPL) của 契約申請管理. Tiến hành theo thứ tự 受付 → 契約設定 → 本登録."], cond=["契約の状態が仮登録の行", "Dòng có trạng thái hợp đồng 仮登録"])
sub("l_a_pause", "休止の期間を入れる", "Nhập kỳ tạm ngưng", "table.tbl button::休止の期間を入れる", "button", ["利用休止の行だけ。休止の期間・再開月のモーダル（001 のモーダル）を開く。フル権限・システム管理・物流のうち、休止を入れる権限があるときだけ出す。", "Chỉ dòng 利用休止. Mở modal kỳ tạm ngưng・tháng tiếp tục. Chỉ hiện khi có quyền nhập tạm ngưng."], cond=["契約の状態が利用休止の行・権限があるとき", "Dòng 利用休止 và có quyền"])
sub("l_empty", "0件の表示", "Hiển thị khi 0 dòng", "table.tbl tbody td", "label", ["条件に合う拠点がないとき、表の中に文を出す（P-LIST は I01）。", "Khi không có cơ sở khớp điều kiện thì hiện câu trong bảng (P-LIST là I01)."], err=["I01"], demo_ok=["コードの文は「条件に一致するデータがありません。検索条件を変えるか「クリア」…」で I01 と違う（P-LIST に合わせて I01 に直す宿題）", "Câu trong code là 「条件に一致するデータがありません…」 khác I01 (việc cần làm: sửa theo P-LIST thành I01)"])
big("l_pager", "ページ送り", "Phân trang", ".pager", "area", ["P-LIST のページ送りと表示件数（10／20／50 件）。", "Phân trang P-LIST và số dòng hiển thị (10 / 20 / 50)."], pattern="P-LIST")

# ---- 休止の期間のモーダル
big("p_modal", "休止の期間・再開月を入れる（モーダル）", "Nhập kỳ tạm ngưng・tháng tiếp tục (modal)", ".mbox", "area", ["フェーズ1で休止中だったお客様の、休止の開始月と再開月を入れる。フェーズ1には期間がないので、期間が決まっていない状態で取り込んである。入れると要補完から消える。", "Nhập tháng bắt đầu tạm ngưng và tháng tiếp tục của khách đang 休止中 ở phase 1. Phase 1 không có kỳ nên nhập vào là chưa có giá trị. Nhập xong thì biến mất khỏi cần bổ sung."], err=["E119", "S108"])
sub("p_from", "休止の開始月", "Tháng bắt đầu tạm ngưng", ".mbox .fld:nth-of-type(1) input", "month", ["取込のときの切替のサイクル月が最初から入っている。直せる。", "Tháng chu kỳ chuyển đổi lúc nhập được điền sẵn. Sửa được."], req="○", len=U("年月 yyyy-mm", "Năm-tháng yyyy-mm"), ex=["2026-09", "2026-09"], init=["切替のサイクル月", "Tháng chu kỳ chuyển đổi"], err=[])
sub("p_resume", "再開月", "Tháng tiếp tục", ".mbox .fld:nth-of-type(2) input", "month", ["再開する月。休止の開始月より後。空欄は保存できない。", "Tháng tiếp tục. Sau tháng bắt đầu tạm ngưng. Để trống thì không lưu được."], req="○", len=U("年月 yyyy-mm", "Năm-tháng yyyy-mm"), ex=["2027-01", "2027-01"], init=["空欄", "Trống"], err=["E119"])
sub("p_cancel", "キャンセル", "Hủy", ".mbox button::キャンセル", "button", ["何も入れずに閉じる。", "Đóng mà không nhập gì."])
sub("p_ok", "入れる", "Nhập", ".mbox button.pri", "button", ["再開月が空・開始月以前のときは押せない。押すと休止の期間を入れ、S108 のトーストを出して閉じ、その拠点は一覧から消える。", "Không bấm được khi tháng tiếp tục trống hoặc không sau tháng bắt đầu. Bấm thì nhập kỳ tạm ngưng, hiện toast S108 rồi đóng; cơ sở đó biến mất khỏi danh sách."], err=["E119", "S108"])
sub("p_err", "エラーの文", "Câu lỗi", ".mbox .emsg", "label", ["再開月が休止の開始月以前のとき、再開月の項目の下に出す（E119）。同時に「入れる」は押せなくなる。再開月が空のときは文は出さず、「入れる」が押せない（コードの動き）。", "Hiện dưới mục tháng tiếp tục khi nó không sau tháng bắt đầu tạm ngưng (E119). Đồng thời không bấm được 「入れる」. Khi tháng tiếp tục trống thì không hiện câu, chỉ không bấm được 「入れる」 (hành vi của code)."], err=["E119"])

# ================================================================ AW_MIGR_002 種類の選択
big("c_head", "ヘッダー", "Đầu trang", ".ph", "area", ["パンくず（法人・契約管理 / 移行の要補完 / 移行CSV取込）・画面名・戻るボタン。フル権限・システム管理だけが開ける。", "Breadcrumb (法人・契約管理 / 移行の要補完 / 移行CSV取込), tên màn hình, nút quay lại. Chỉ フル権限・システム管理 mở được."])
sub("c_back", "移行の要補完へ戻る", "Về cần bổ sung sau di chuyển", ".ph button::移行の要補完へ戻る", "button", ["要補完の一覧（AW_MIGR_001）へ戻る。", "Về danh sách cần bổ sung (AW_MIGR_001)."])
big("c_lead", "説明", "Giải thích", ".card > p.hint:first-of-type", "label", ["フェーズ1の既存のお客様（約600社）をまとめて入れる画面。IDはフェーズ1のまま、同じキーのファイルは何度でも取り込み直せる（更新）。受付・承認は通らず、メールは送らない。仮登録は仮登録のまま取り込み、休止中は利用休止、解約済・削除済は取り込まない。", "Màn hình nhập hàng loạt khách hiện có của phase 1 (khoảng 600 công ty). ID giữ nguyên phase 1, tệp cùng khóa nhập lại nhiều lần được (cập nhật). Không qua tiếp nhận・duyệt, không gửi mail. 仮登録 nhập ở trạng thái đăng ký tạm, 休止中 thành 利用休止, 解約済・削除済 không nhập."])
big("c_order", "取り込む順番", "Thứ tự nhập", ".card > p.hint:nth-of-type(2)", "label", ["A → B・C・D の順。B〜D は A で作った拠点IDに結びつける（A を先に取り込まないと B〜D は「拠点がありません」のエラー）。", "Thứ tự A → B・C・D. B〜D gắn với 拠点ID đã tạo ở A (chưa nhập A thì B〜D báo lỗi 「拠点がありません」)."])
CARDS = [("A", "A. 法人・拠点・契約", "A. pháp nhân・cơ sở・hợp đồng", "1行＝1拠点・キー＝拠点ID", "1 dòng = 1 cơ sở・khóa = 拠点ID", "法人・拠点・親契約・子契約・アカウントを利用中で直接作る。", "Tạo trực tiếp pháp nhân・cơ sở・hợp đồng cha・hợp đồng con・tài khoản ở trạng thái đang dùng."),
         ("B", "B. 設備（貸出）", "B. thiết bị (cho mượn)", "1行＝1拠点 × 1機種・キー＝拠点ID＋機種ID", "1 dòng = 1 cơ sở × 1 loại máy・khóa = 拠点ID + 機種ID", "拠点に貸している設備を入れる。A のあとに取り込む。", "Nhập thiết bị đang cho cơ sở mượn. Nhập sau A."),
         ("C", "C. 担当者", "C. người phụ trách", "1行＝1人（人数の上限なし）・キー＝法人ID または 拠点ID", "1 dòng = 1 người (không giới hạn số người)・khóa = 法人ID hoặc 拠点ID", "法人・拠点の担当者を入れる（メイン担当者は1人）。A のあとに取り込む。", "Nhập người phụ trách của pháp nhân・cơ sở (người chính là 1). Nhập sau A."),
         ("D", "D. 企業独自価格", "D. giá riêng doanh nghiệp", "1行＝1拠点 × 1商品・キー＝拠点ID＋品番", "1 dòng = 1 cơ sở × 1 sản phẩm・khóa = 拠点ID + 品番", "A で価格＝企業独自価格 にした拠点の商品ごとの単価（税抜）を入れる。A のあとに取り込む。", "Nhập đơn giá (chưa thuế) từng sản phẩm của cơ sở đã đặt giá = giá riêng ở A. Nhập sau A.")]
for k, ja, vi, unit_ja, unit_vi, d_ja, d_vi in CARDS:
    big("c_" + k, ja, vi, "section.card[aria-label^='%s.']" % k, "area", ["取込のファイルの種類。%s 「%s」" % (d_ja, unit_ja), "Loại tệp nhập. %s 「%s」" % (d_vi, unit_vi)])
    sub("c_%s_btn" % k, "%s を取り込む" % k, "Nhập %s" % k, "section.card[aria-label^='%s.'] button.csv" % k, "button", ["%s の取込画面（AW_MIGR_%s）へ。" % (k, {"A": "003", "B": "004", "C": "005", "D": "006"}[k]), "Mở màn hình nhập %s (AW_MIGR_%s)." % (k, {"A": "003", "B": "004", "C": "005", "D": "006"}[k])])
    sub("c_%s_sample" % k, "記入例", "Ví dụ ghi", "section.card[aria-label^='%s.'] .tbl-wrap" % k, "label", ["値のある列だけの記入例の表（空欄の列は省略）。1行目の見出しは、CSV出力・テンプレートと同じ名前。", "Bảng ví dụ chỉ gồm cột có giá trị (cột trống bỏ qua). Tiêu đề dòng 1 cùng tên với CSV出力・template."])

# ================================================================ AW_MIGR_003〜006 取込
def importscreen(k, ja, vi, key_ja, key_vi, note_ja, note_vi, cycle=False):
    p = "m%s_" % k
    big(p + "head", "ヘッダー", "Đầu trang", ".ph", "area", ["パンくず（法人・契約管理 / 移行の要補完 / 移行CSV取込 / %s）・画面名・操作ボタン（ステップ1はキャンセル、ステップ2はファイルを選び直す・登録）。" % ja, "Breadcrumb (法人・契約管理 / 移行の要補完 / 移行CSV取込 / %s), tên màn hình, nút thao tác (bước 1: hủy; bước 2: chọn lại tệp・đăng ký)." % vi], pattern="P-CSV")
    big(p + "step1", "ステップ1 ファイルを選ぶ", "Bước 1: chọn tệp", "#sec-csv", "area", [note_ja, note_vi], pattern="P-CSV")
    sub(p + "steps", "手順", "Các bước", "#sec-csv ol.steps", "label", ["「1 ファイルを選ぶ」「2 確認・登録」。", "「1 ファイルを選ぶ」「2 確認・登録」."])
    sub(p + "hint", "説明", "Giải thích", "#sec-csv div.hint", "label", ["1行の意味・キー（%s）・取り込む順番・空欄と「-」の扱い・UTF-8・5,000行まで・エラーの行は取り込まず他の行を登録する、と書く。" % key_ja, "Ghi ý nghĩa 1 dòng・khóa (%s)・thứ tự nhập・cách xử lý ô trống và 「-」・UTF-8・tối đa 5.000 dòng・dòng lỗi bỏ qua và đăng ký các dòng khác." % key_vi])
    sub(p + "sample", "記入例", "Ví dụ ghi", "#sec-csv .tbl-wrap", "label", ["値のある列だけの記入例の表。", "Bảng ví dụ chỉ gồm cột có giá trị."])
    sub(p + "pick", "ファイルを選ぶ", "Chọn tệp", "#sec-csv button::ファイルを選ぶ", "file", ["CSV（UTF-8）を選ぶ（ドラッグ＆ドロップも可）。選ぶとすぐステップ2へ。読み込めないファイルは E51。", "Chọn CSV (UTF-8) (kéo thả được). Chọn xong chuyển ngay sang bước 2. Tệp không đọc được thì E51."], req="○", len=U("CSV（UTF-8・5,000行まで）", "CSV (UTF-8, tối đa 5.000 dòng)"), ex=["移行_%s.csv" % k, "migration_%s.csv" % k], err=["E51"])
    if cycle:
        sub(p + "cycle", "切替のサイクル月", "Tháng chu kỳ chuyển đổi", "#mig-cycle", "select", ["この月から子契約を作る（より前の請求は参照のみ）。画面で1回だけ選ぶ（列にしない）。", "Tạo hợp đồng con từ tháng này (hóa đơn trước đó chỉ để tham khảo). Chọn 1 lần trên màn hình (không phải cột)."], req="○", len=U("選択（年月）", "Chọn (năm-tháng)"), ex=["2026-09", "2026-09"], init=["今月の前月", "Tháng trước của tháng này"])
    sub(p + "cancel", "キャンセル", "Hủy", ".ph button::キャンセル", "button", ["移行CSV取込（種類の選択・AW_MIGR_002）へ戻る。何も登録しない。", "Về 移行CSV取込 (chọn loại・AW_MIGR_002). Không đăng ký gì."])
    big(p + "step2", "ステップ2 確認・登録", "Bước 2: xác nhận・đăng ký", "#sec-csv", "area", ["ファイル名・件数（新規／更新／変更なし／エラー）と、行ごとの結果。「登録」でエラー以外の行を登録する（エラーの行は取り込まない）。", "Tên tệp, số dòng (mới / cập nhật / không đổi / lỗi) và kết quả từng dòng. 「登録」 thì đăng ký các dòng không lỗi (dòng lỗi bỏ qua)."], pattern="P-CSV", err=["Q10", "S10", "E34"])
    sub(p + "count", "件数", "Số lượng", "#sec-csv .badge", "label", ["新規／更新／変更なし／エラー の件数（バッジ）。", "Số dòng mới / cập nhật / không đổi / lỗi (badge)."])
    sub(p + "errs", "エラーの行", "Dòng lỗi", "#sec-csv .notice.ng", "label", ["「エラーの行 n件は取り込みません…」と、行番号・キー・列名・内容の表。内容は E52 と各列のチェックの文言。", "「エラーの行 n件は取り込みません…」 và bảng số dòng, khóa, tên cột, nội dung. Nội dung = E52 và câu kiểm tra của từng cột."], err=["E52"], cond=["エラーの行があるとき", "Khi có dòng lỗi"])
    sub(p + "errcsv", "エラー一覧CSV", "Xuất CSV lỗi", "#sec-csv button::エラー一覧CSV", "button", ["エラーの行だけを、元の列＋エラーの内容で書き出す。", "Xuất riêng các dòng lỗi với cột gốc + nội dung lỗi."], cond=["エラーの行があるとき", "Khi có dòng lỗi"])
    sub(p + "diff", "登録する内容", "Nội dung sẽ đăng ký", "#sec-csv b::登録する内容", "label", ["行番号・区分・キー・名前・作る（変わる）内容。", "Số dòng・phân loại・khóa・tên・nội dung sẽ tạo (thay đổi)."], cond=["新規・更新の行があるとき", "Khi có dòng mới / cập nhật"])
    sub(p + "notice", "注意書き", "Ghi chú", "#sec-csv .notice:not(.ng)", "label", [note_ja, note_vi], cond=["新規・更新の行があるとき", "Khi có dòng mới / cập nhật"])
    sub(p + "reselect", "ファイルを選び直す", "Chọn lại tệp", ".ph button::ファイルを選び直す", "button", ["ステップ1に戻る。何も登録しない。", "Về bước 1. Không đăng ký gì."])
    sub(p + "go", "登録", "Đăng ký", ".ph button.pri", "button", ["エラー以外の行を登録し、S10 のトーストを出して要補完の一覧（AW_MIGR_001）へ。取込の記録を残す。エラーの行だけで登録できる行がないときは押せない。", "Đăng ký các dòng không lỗi, hiện toast S10 rồi về danh sách cần bổ sung (AW_MIGR_001). Ghi lại lịch sử nhập. Không bấm được nếu không có dòng nào đăng ký được."], err=["Q10", "S10", "E34"], cond=["登録できる行が1つ以上あるとき", "Khi có ≥ 1 dòng đăng ký được"], demo_ok=["決定では確認のモーダル（Q10）を出すが、コードは確認なしで登録する（P-CSV に合わせる宿題）", "Theo quyết định có modal xác nhận (Q10), code đăng ký ngay không xác nhận (việc cần làm: theo P-CSV)"])
    big(p + "fileerr", "ファイル全体のエラー", "Lỗi toàn tệp", "#sec-csv .notice", "label", ["CSV として読めない・文字コードが違う・見出しが違う・行数の上限を超えるときは、ステップ2に進まず E51 を出す。", "Khi không đọc được như CSV, sai mã hóa, sai tiêu đề, hoặc vượt số dòng thì không sang bước 2 mà hiện E51."], err=["E51"])
    big(p + "cols", "CSVの列（定義。画面には出さない）", "Các cột của CSV (định nghĩa; không hiện trên màn hình)", "-", "area", ["取り込むファイルの列の定義（1行目の見出し・この順。テンプレートと同じ）。キー＝%s。区分：○＝必須（欠けたら行のエラー）／△＝補完（空で取り込み、要補完に出す）／－＝任意。見出しには【…】のヒントが付くことがある。画面には出さない。" % key_ja, "Định nghĩa cột của tệp nhập (tiêu đề dòng 1 theo thứ tự này; giống template). Khóa = %s. Phân loại: ○ = bắt buộc (thiếu thì dòng lỗi) / △ = bổ sung (nhập trống, hiện trong cần bổ sung) / － = tùy chọn. Tiêu đề có thể kèm gợi ý 【…】. Không hiện trên màn hình." % key_vi], pattern="P-CSV")

def col(p, key, ja, vi, cls, ln, ex_ja, ex_vi, n_ja, n_vi, err=None):
    req = {"必須": "○", "補完": "△", "任意": "－"}[cls]
    ln_p = ln if isinstance(ln, (list, tuple)) else (LENVI.get(ln) and [ln, LENVI[ln]]) or [ln, ln]
    d = [n_ja + "区分は" + cls + "。", n_vi + " Phân loại: " + {"必須": "bắt buộc", "補完": "bổ sung", "任意": "tùy chọn"}[cls] + "."]
    kw = dict(req=req, len=ln_p, init=INIT_BLANK, ex=[ex_ja, ex_vi], valid=["補完の列は空のまま取り込み、要補完の一覧に出す。同じキーのファイルを取り込み直すと、空欄のセルは今の値のまま。「-」で消す。", "Cột bổ sung để trống vẫn nhập và hiện trong danh sách cần bổ sung. Nhập lại tệp cùng khóa thì ô trống giữ giá trị hiện tại. Ghi 「-」 để xóa."])
    if err: kw["err"] = err
    return sub(p + key, ja, vi, "-", "text", d, **kw)

# ---- A の列
importscreen("A", "A 法人・拠点・契約", "A pháp nhân・cơ sở・hợp đồng", "拠点ID（フェーズ1の ID）", "拠点ID (ID của phase 1)",
             "法人・拠点・親契約・子契約を、受付・承認を通さずに利用中で直接作る（メールは送らない）。切替のサイクル月から、いま子契約がある最後のサイクル月まで子契約を作る。配送は入れない（要補完の「配送の設定」）。",
             "Tạo trực tiếp pháp nhân・cơ sở・hợp đồng cha・hợp đồng con ở trạng thái đang dùng, không qua tiếp nhận・duyệt (không gửi mail). Tạo hợp đồng con từ tháng chu kỳ chuyển đổi đến tháng chu kỳ cuối đang có hợp đồng con. Không nhập giao hàng (hiện 「配送の設定」 trong cần bổ sung).", cycle=True)
_A = [
    ("c_corpid", "法人ID", "Mã pháp nhân", "必須", "文字列 CU＋5桁", "CU00010", "CU00010", "フェーズ1の ID（CU＋5桁）。法人なしの拠点は空。フェーズ2の番号（法人と拠点で1つの連番）とぶつかる ID はエラー。", "ID của phase 1 (CU + 5 chữ số). Cơ sở không có pháp nhân thì để trống. ID trùng số của phase 2 (một dãy số chung cho pháp nhân và cơ sở) là lỗi.", ["E52"]),
    ("c_branchid", "拠点ID", "Mã cơ sở", "必須", "文字列 CU＋5桁", "CU00011", "CU00011", "キー。フェーズ1の ID のまま。あれば更新、なければ作る。", "Khóa. Giữ nguyên ID của phase 1. Có rồi thì cập nhật, chưa có thì tạo.", ["E52"]),
    ("c_corpname", "法人名", "Tên pháp nhân", "必須", "文字列", "株式会社テスト商事", "Công ty cổ phần Test Shoji", "法人ありのとき必須。", "Bắt buộc khi có pháp nhân.", None),
    ("c_corpkana", "法人名フリガナ", "Furigana tên pháp nhân", "補完", "文字列", "テストショウジ", "テストショウジ (furigana)", "", "", None),
    ("c_contractname", "契約名義", "Tên chủ hợp đồng", "任意", "文字列", "株式会社テスト商事", "Công ty cổ phần Test Shoji", "空欄＝法人名。", "Trống = tên pháp nhân.", None),
    ("c_billname", "請求先法人名", "Tên pháp nhân nhận hóa đơn", "補完", "文字列", "株式会社テスト商事 経理部", "Công ty cổ phần Test Shoji, phòng kế toán", "", "", None),
    ("c_czip", "法人の郵便番号", "Mã bưu chính pháp nhân", "必須", "文字列", "100-0001", "100-0001", "法人ありのとき必須。", "Bắt buộc khi có pháp nhân.", None),
    ("c_cpref", "法人の都道府県", "Tỉnh của pháp nhân", "必須", "文字列", "東京都", "Tokyo", "法人ありのとき必須。", "Bắt buộc khi có pháp nhân.", None),
    ("c_caddr", "法人の市区町村・番地", "Quận/huyện・số nhà của pháp nhân", "必須", "文字列", "千代田区千代田1-1", "1-1 Chiyoda, Chiyoda-ku", "法人ありのとき必須。", "Bắt buộc khi có pháp nhân.", None),
    ("c_cbuild", "法人の建物", "Tòa nhà của pháp nhân", "任意", "文字列", "千代田ビル 3F", "Tòa Chiyoda tầng 3", "", "", None),
    ("c_ctel", "法人の電話番号", "Điện thoại pháp nhân", "補完", "文字列", "03-0000-0000", "03-0000-0000", "", "", None),
    ("c_cfax", "法人のFAX番号", "FAX pháp nhân", "任意", "文字列", "03-0000-0009", "03-0000-0009", "", "", None),
    ("c_sales", "ES営業担当", "Nhân viên kinh doanh ES", "任意", "文字列 Ad＋5桁", "Ad00003", "Ad00003", "運営アカウント（Ad＋5桁）。", "Tài khoản vận hành (Ad + 5 chữ số).", None),
    ("c_agency", "代理店ID", "Mã đại lý", "任意", "文字列 AG＋5桁", "AG00001", "AG00001", "", "", None),
    ("c_pay", "法人の支払い方法", "Phương thức thanh toán của pháp nhân", "補完", "選択", "口座振替", "Chuyển khoản tự động", "口座振替／銀行振込／クレジットカード。", "口座振替 / 銀行振込 / クレジットカード.", None),
    ("c_debit", "口座振替の手続き状況", "Tình trạng thủ tục chuyển khoản tự động", "補完", "選択", "完了", "Hoàn tất", "未手続き／手続き中／完了。", "未手続き / 手続き中 / 完了.", None),
    ("c_cycle", "法人の支払サイクル", "Chu kỳ thanh toán của pháp nhân", "補完", "選択", "月払い", "Hằng tháng", "月払い／年払い。", "月払い / 年払い.", None),
    ("c_issue", "請求書の発行時期", "Thời điểm phát hành hóa đơn", "補完", "選択", "1ヶ月前", "1 tháng trước", "3ヶ月前〜翌月（新規申込の CSV と同じ値）。", "Từ 3 tháng trước đến tháng sau (giống giá trị của CSV đơn mới).", None),
    ("c_unit", "請求書の発行単位", "Đơn vị phát hành hóa đơn", "補完", "選択", "まとめて発行（法人1通）", "Gộp 1 hóa đơn cho cả pháp nhân", "まとめて発行（法人1通）／拠点ごと発行。", "Gộp 1 hóa đơn cho cả pháp nhân / phát hành theo từng cơ sở.", None),
    ("c_bill1", "BillOne 支払者ID", "Mã người thanh toán BillOne", "任意", "文字列", "B000123", "B000123", "", "", None),
    ("c_remind", "ご注文のリマインド", "Nhắc đặt hàng", "任意", "1／0（空欄＝既定）", "1", "1", "1／0。空欄＝送る。", "1 / 0. Trống = có gửi.", None),
    ("c_p1", "法人ステータス（フェーズ1）", "Trạng thái pháp nhân (phase 1)", "任意", "選択", "本登録", "Đăng ký chính thức", "空欄＝本登録。本登録＝有効／仮登録＝仮登録のまま取り込み申込の受付に載せる／休止中＝利用休止（休止の期間・再開月は要補完）／解約済・削除済の行は取り込まない。同じ法人の行は同じ値にする（違うと「同じ法人ID と違う値です」のエラー）。", "Trống = 本登録. 本登録 = hiệu lực / 仮登録 = nhập ở trạng thái đăng ký tạm và đưa vào đơn / 休止中 = 利用休止 (kỳ tạm ngưng・tháng tiếp tục cần bổ sung) / dòng 解約済・削除済 không nhập. Các dòng cùng pháp nhân phải cùng giá trị (khác thì lỗi 「同じ法人IDと違う値です」).", ["E52"]),
    ("b_name", "拠点名", "Tên cơ sở", "必須", "文字列", "本社", "Trụ sở chính", "", "", None),
    ("b_kana", "拠点名フリガナ", "Furigana tên cơ sở", "補完", "文字列", "ホンシャ", "ホンシャ (furigana)", "", "", None),
    ("b_zip", "拠点の郵便番号", "Mã bưu chính cơ sở", "必須", "文字列", "100-0001", "100-0001", "", "", None),
    ("b_pref", "拠点の都道府県", "Tỉnh của cơ sở", "必須", "文字列", "東京都", "Tokyo", "", "", None),
    ("b_addr", "拠点の市区町村・番地", "Quận/huyện・số nhà của cơ sở", "必須", "文字列", "千代田区千代田1-1", "1-1 Chiyoda, Chiyoda-ku", "", "", None),
    ("b_build", "拠点の建物", "Tòa nhà của cơ sở", "任意", "文字列", "千代田ビル 3F", "Tòa Chiyoda tầng 3", "", "", None),
    ("b_tel", "拠点の電話番号", "Điện thoại cơ sở", "補完", "文字列", "03-0000-0001", "03-0000-0001", "", "", None),
    ("b_fax", "拠点のFAX番号", "FAX cơ sở", "任意", "文字列", "03-0000-0008", "03-0000-0008", "", "", None),
    ("b_floor", "設置フロア", "Tầng đặt máy", "補完", "文字列", "2F 休憩室", "Tầng 2, phòng nghỉ", "自販機は補完、冷蔵庫は任意（台帳 2026/10/03）。", "Máy bán hàng: bổ sung, tủ lạnh: tùy chọn (台帳 2026/10/03).", None),
    ("b_emp", "従業員数概算", "Số nhân viên ước tính", "補完", "整数", "120", "120", "", "", None),
    ("b_time", "受取できる時間帯", "Khung giờ nhận hàng", "補完", "文字列", "9:00-12:00;13:00-17:00", "9:00-12:00;13:00-17:00", "9:00-12:00;13:00-17:00 のように ; でつなぐ。要補完では青のラベル（CSV の取り込み直しで入れる）。", "Nối bằng ; như 9:00-12:00;13:00-17:00. Trong cần bổ sung là nhãn xanh (nhập lại CSV).", None),
    ("b_cond", "設置場所・納品の条件", "Nơi đặt・điều kiện giao hàng", "任意", "文字列", "1F 受付", "Lễ tân tầng 1", "", "", None),
    ("b_stock", "棚卸なし", "Không kiểm kê", "任意", "1／0（空欄＝既定）", "0", "0", "1／0。空欄＝棚卸あり（旧名「在庫点検なし」も受け付ける）。", "1 / 0. Trống = có kiểm kê (cũng nhận tên cũ 「在庫点検なし」).", None),
    ("b_memo", "拠点メモ", "Ghi chú cơ sở", "任意", "文字列", "8F 社員食堂横", "Cạnh căn tin tầng 8", "", "", None),
    ("k_kind", "契約区分", "Loại hợp đồng", "任意", "選択", "本導入", "Chính thức", "本導入／お試し（空欄＝本導入）。お試しのときは お試しの終了月 も入れる。", "本導入 / お試し (trống = 本導入). Khi お試し thì nhập cả お試しの終了月.", None),
    ("k_trialend", "お試しの終了月", "Tháng kết thúc dùng thử", "任意", "年月 yyyy-mm", "2026-12", "2026-12", "お試しのとき必須。", "Bắt buộc khi お試し.", None),
    ("k_start", "当初契約開始年月", "Tháng bắt đầu hợp đồng ban đầu", "補完", "年月 yyyy-mm", "2025-04", "2025-04", "最低利用期間・違約金の起算。空欄＝推定（要補完）。", "Mốc tính thời gian sử dụng tối thiểu・phí vi phạm. Trống = ước tính (cần bổ sung).", None),
    ("k_billto", "請求先", "Nơi nhận hóa đơn", "必須", "選択（法人／この拠点）", "法人", "Pháp nhân", "法人／この拠点。", "Pháp nhân / cơ sở này.", None),
    ("k_bpay", "拠点の支払い方法", "Phương thức thanh toán của cơ sở", "補完", "選択", "口座振替", "Chuyển khoản tự động", "請求先＝この拠点のとき。", "Khi nơi nhận hóa đơn = cơ sở này.", None),
    ("k_bcycle", "拠点の支払サイクル", "Chu kỳ thanh toán của cơ sở", "補完", "選択", "月払い", "Hằng tháng", "請求先＝この拠点のとき。", "Khi nơi nhận hóa đơn = cơ sở này.", None),
    ("k_bissue", "拠点の請求書の発行時期", "Thời điểm phát hành hóa đơn của cơ sở", "補完", "選択", "1ヶ月前", "1 tháng trước", "請求先＝この拠点のとき。", "Khi nơi nhận hóa đơn = cơ sở này.", None),
    ("k_plan", "プランID", "Mã gói", "必須", "文字列 ES＋6桁", "ES000004", "ES000004", "", "", None),
    ("k_course", "コース", "Khóa", "任意", "選択", "ESライト", "ES Lite", "空欄＝ESライト（Bに自販機の機種があれば ESライト（自販機））。スタンダード希望は移行のあとに一括変更。", "Trống = ES Lite (nếu B có máy bán hàng thì ES Lite (máy bán hàng)). Muốn Standard thì đổi hàng loạt sau di chuyển.", None),
    ("k_gen", "適用中の価格世代", "Thế hệ giá đang áp dụng", "補完", "選択", "改訂第三回目", "Lần sửa đổi thứ ba", "プランマスタの価格世代の名前。空欄＝いまの世代。", "Tên thế hệ giá trong plan master. Trống = thế hệ hiện tại.", None),
    ("k_price", "価格", "Giá", "任意", "選択", "通常価格", "Giá thường", "通常価格／企業独自価格（空欄＝通常価格）。企業独自価格の単価は D のファイル。", "Giá thường / giá riêng doanh nghiệp (trống = giá thường). Đơn giá riêng doanh nghiệp ở tệp D.", None),
    ("k_settle", "精算", "Quyết toán", "任意", "選択", "買取", "Mua đứt", "従量／買取（空欄＝従量。企業独自価格は買取）。", "従量 / 買取 (trống = 従量; giá riêng doanh nghiệp là 買取).", None),
    ("k_opt", "オプション", "Tùy chọn", "任意", "文字列（; でつなぐ）", "OP000002", "OP000002", "オプションIDを ; でつなぐ。", "Nối các mã tùy chọn bằng ;.", None),
    ("k_optprice", "オプション金額の上書き", "Ghi đè số tiền tùy chọn", "任意", "文字列（; でつなぐ）", "OP000002=0", "OP000002=0", "OP000004=0;OP000037=8000 のように。ES-QR の既存のお客様 0円など。", "Như OP000004=0;OP000037=8000. Ví dụ khách ES-QR hiện có 0 yên.", None),
    ("k_disc", "値引き", "Giảm giá", "任意", "文字列（; でつなぐ）", "DC000021", "DC000021", "値引きIDを ; でつなぐ（移行割 DC000021 もここ）。", "Nối các mã giảm giá bằng ; (kể cả 移行割 DC000021).", None),
    ("k_cash", "現金を使う", "Dùng tiền mặt", "任意", "1／0（空欄＝既定）", "1", "1", "空欄＝オプションから決める。", "Trống = quyết theo tùy chọn.", None),
    ("k_guest", "ゲストを使う", "Dùng khách", "任意", "1／0（空欄＝既定）", "1", "1", "空欄＝オプションから決める。", "Trống = quyết theo tùy chọn.", None),
    ("k_qr", "ES-QRを使う", "Dùng ES-QR", "任意", "1／0（空欄＝既定）", "1", "1", "空欄＝オプションから決める。", "Trống = quyết theo tùy chọn.", None),
    ("k_limit", "1日の上限食数", "Số suất tối đa mỗi ngày", "任意", "整数", "3", "3", "", "", None),
    ("d_ng", "納品不可曜日", "Thứ không giao được", "任意", "文字列（; でつなぐ）", "土;日", "T7;CN", "月;水 のように ; でつなぐ。", "Nối bằng ; như 月;水.", None),
    ("d_ngrule", "納品不可になった場合", "Khi không giao được", "補完", "選択", "前倒す", "Giao sớm hơn", "新規申込の CSV と同じ値。", "Giống giá trị của CSV đơn mới.", None),
    ("d_short", "消費期限の短い商品の扱い", "Cách xử lý sản phẩm hạn dùng ngắn", "補完", "選択", "通常", "Thường", "新規申込の CSV と同じ値。", "Giống giá trị của CSV đơn mới.", None),
    ("a_acc", "アカウントを発行するか", "Có cấp tài khoản không", "任意", "1／0（空欄＝既定）", "1", "1", "1／0（空欄＝1）。作るがメールは送らない（ログインの案内は移行の切替に合わせて別に送る）。", "1 / 0 (trống = 1). Tạo tài khoản nhưng không gửi mail (hướng dẫn đăng nhập gửi riêng theo lịch chuyển đổi).", None),
]
for key, ja, vi, cls, ln, exj, exv, nj, nv, er in _A:
    col("mA_", key, ja, vi, cls, ln, exj, exv, nj or ("「%s」の列。" % ja), nv or ("Cột 「%s」." % ja), er)

importscreen("B", "B 設備（貸出）", "B thiết bị (cho mượn)", "拠点ID＋機種ID", "拠点ID + 機種ID",
             "拠点ID＋機種ID が同じ貸出は上書きする。貸出日が空欄なら「貸出日 未入力」で入れ、最低利用期間・違約金は当初契約開始年月を起算にした推定の値で計算する。自販機の機種を入れると自販機リース（OP000037）の台数をそろえる。",
             "Khoản cho mượn cùng 拠点ID + 機種ID thì ghi đè. Nếu ngày cho mượn trống thì nhập là 「貸出日 未入力」, thời gian sử dụng tối thiểu・phí vi phạm tính theo giá trị ước tính lấy tháng bắt đầu hợp đồng ban đầu làm mốc. Nhập máy bán hàng thì điều chỉnh số lượng 自販機リース (OP000037).")
for key, ja, vi, cls, ln, exj, exv, nj, nv in [
    ("c_branch", "拠点ID", "Mã cơ sở", "必須", "文字列 CU＋5桁", "CU00011", "CU00011", "A の拠点と結ぶ。A に無い拠点ID はエラー（先に A を取り込む）。", "Gắn với cơ sở của A. 拠点ID không có ở A là lỗi (nhập A trước)."),
    ("c_model", "機種ID", "Mã loại máy", "必須", "文字列", "RF000002", "RF000002", "機種マスタの ID。", "ID trong master loại máy."),
    ("c_qty", "台数", "Số lượng máy", "必須", "整数", "1", "1", "", ""),
    ("c_lend", "貸出日", "Ngày cho mượn", "補完", "日付 yyyy-mm-dd", "2025-04-10", "2025-04-10", "空欄＝「貸出日 未入力」。要補完では青のラベル（CSV の取り込み直しで入れる）。", "Trống = 「貸出日 未入力」. Trong cần bổ sung là nhãn xanh (nhập lại CSV)."),
    ("c_memo", "メモ", "Ghi chú", "任意", "文字列", "自販機（貸出日不明）", "Máy bán hàng (không rõ ngày cho mượn)", "", "")]:
    col("mB_", key, ja, vi, cls, ln, exj, exv, nj or ("「%s」の列。" % ja), nv or ("Cột 「%s」." % ja))

importscreen("C", "C 担当者", "C người phụ trách", "法人ID または 拠点ID", "法人ID hoặc 拠点ID",
             "取り込み直すときは、その法人・拠点の担当者をファイルの中身で置き換える（キーにできる項目がないため）。担当者の数に上限はない。メイン担当者は法人・拠点ごとに1人。請求担当者がいなければメイン担当者と同じ人にする。マニュアルのご案内（M13）・担当者変更の通知は送らない。",
             "Khi nhập lại thì thay người phụ trách của pháp nhân / cơ sở đó bằng nội dung tệp (vì không có mục làm khóa). Số người phụ trách không giới hạn. Người phụ trách chính là 1 người cho mỗi pháp nhân / cơ sở. Nếu không có người phụ trách thanh toán thì dùng cùng người với người chính. Không gửi hướng dẫn (M13) và thông báo đổi người phụ trách.")
for key, ja, vi, cls, ln, exj, exv, nj, nv in [
    ("c_corp", "法人ID", "Mã pháp nhân", "必須", "文字列 CU＋5桁", "CU00010", "CU00010", "法人の担当者は法人ID だけ入れる（法人ID・拠点ID のどちらか1つが必須）。", "Người phụ trách của pháp nhân chỉ nhập 法人ID (bắt buộc 1 trong 法人ID・拠点ID)."),
    ("c_branch", "拠点ID", "Mã cơ sở", "必須", "文字列 CU＋5桁", "CU00011", "CU00011", "拠点の担当者は拠点ID だけ入れる。", "Người phụ trách của cơ sở chỉ nhập 拠点ID."),
    ("c_type", "種類", "Loại", "必須", "選択（メイン／請求／サブ担当者）", "メイン担当者", "Người phụ trách chính", "メイン担当者／請求担当者／サブ担当者。メイン担当者が2人以上はエラー。", "メイン担当者 / 請求担当者 / サブ担当者. Có từ 2 người phụ trách chính trở lên là lỗi."),
    ("c_name", "名前", "Tên", "必須", "文字列", "山田 太郎", "Yamada Taro", "", ""),
    ("c_kana", "フリガナ", "Furigana", "補完", "文字列", "ヤマダ タロウ", "ヤマダ タロウ (furigana)", "", ""),
    ("c_mail", "メール", "Email", "補完", "文字列", "yamada@example.jp", "yamada@example.jp", "法人のメイン担当者のメールがないとアカウントを作れない（要補完に出る）。", "Không có email của người phụ trách chính của pháp nhân thì không tạo được tài khoản (hiện trong cần bổ sung)."),
    ("c_tel", "電話", "Điện thoại", "補完", "文字列", "03-0000-0001", "03-0000-0001", "", "")]:
    col("mC_", key, ja, vi, cls, ln, exj, exv, nj or ("「%s」の列。" % ja), nv or ("Cột 「%s」." % ja))

importscreen("D", "D 企業独自価格", "D giá riêng doanh nghiệp", "拠点ID＋品番", "拠点ID + 品番",
             "拠点ID＋品番が同じなら上書きする。A で 価格＝企業独自価格 にした拠点だけ。確定・請求済の子契約は変えない。単価（税抜）は商品マスタの税率で税込にして（1円未満切り捨て）子契約の企業独自価格に入れる。",
             "Cùng 拠点ID + 品番 thì ghi đè. Chỉ cơ sở đã đặt giá = giá riêng doanh nghiệp ở A. Không đổi hợp đồng con đã chốt・đã xuất hóa đơn. Đơn giá (chưa thuế) được quy ra giá đã gồm thuế theo thuế suất của master sản phẩm (bỏ phần dưới 1 yên) rồi đưa vào giá riêng doanh nghiệp của hợp đồng con.")
for key, ja, vi, cls, ln, exj, exv, nj, nv in [
    ("c_branch", "拠点ID", "Mã cơ sở", "必須", "文字列 CU＋5桁", "CU00015", "CU00015", "A の 価格＝企業独自価格 の拠点。A に無い拠点ID はエラー。", "Cơ sở có giá = giá riêng doanh nghiệp ở A. 拠点ID không có ở A là lỗi."),
    ("c_item", "品番", "Mã sản phẩm", "必須", "文字列", "M001", "M001", "商品マスタの品番。", "Mã sản phẩm trong master sản phẩm."),
    ("c_price", "単価（税抜）", "Đơn giá (chưa thuế)", "必須", "整数", "480", "480", "円・整数。", "Đơn vị yên, số nguyên.")]:
    col("mD_", key, ja, vi, cls, ln, exj, exv, nj or ("「%s」の列。" % ja), nv or ("Cột 「%s」." % ja))

# ---------------------------------------------------------------- 状態
LIST_HEAD = ["l_head", "l_crumb", "l_title", "l_import", "l_csvout", "l_hint"]
SEARCH = ["l_search", "l_kw", "l_todo", "l_kind", "l_cst", "l_from", "l_to", "l_clear", "l_go", "l_sort"]
ROW = ["l_table", "l_no", "l_id", "l_name", "l_corp", "l_ckind", "l_cstat", "l_cnt", "l_todos", "l_date", "l_act", "l_a_corp", "l_a_branch", "l_a_child", "l_a_app", "l_a_pause", "l_pager"]
SAMPLE_UI = lambda k: ["m%s_head" % k, "m%s_step1" % k, "m%s_steps" % k, "m%s_hint" % k] + (["mA_cycle"] if k == "A" else []) + ["m%s_sample" % k, "m%s_pick" % k, "m%s_cancel" % k]
STEP2_UI = lambda k: ["m%s_step2" % k, "m%s_count" % k, "m%s_reselect" % k, "m%s_go" % k]
COLS = lambda k: ["m%s_cols" % k] + [x for x in ITEMS if x.startswith("m%s_" % k) and x not in ("m%s_%s" % (k, s) for s in ("head", "step1", "steps", "hint", "sample", "pick", "cancel", "step2", "count", "errs", "errcsv", "diff", "notice", "reselect", "go", "fileerr", "cols", "cycle"))]
PAUSE_OPEN = "btn('休止の期間を入れる').click();await sleep(500);"

VIEWS = [
    V("001", "AW_MIGR_001", "0件（移行CSVを取り込む前）", "0 dòng (trước khi nhập CSV di chuyển)", "/ops/migration", LIST_HEAD + SEARCH + ["l_table", "l_empty", "l_pager"], wait=600, note=["移行CSV A を取り込む前の状態。表に行がなく、文だけが出る。", "Trạng thái trước khi nhập CSV di chuyển A. Bảng không có dòng, chỉ hiện câu."]),
    V("002", "AW_MIGR_002", "種類の選択", "Chọn loại", "/ops/migration/import", ["c_head", "c_back", "c_lead", "c_order"] + [x for k in "ABCD" for x in ("c_" + k, "c_%s_btn" % k, "c_%s_sample" % k)], wait=600, note=["取り込むファイルの種類（A〜D）を選ぶ画面。A のあとに B〜D を取り込む。", "Màn hình chọn loại tệp nhập (A〜D). Nhập B〜D sau A."]),
    V("003", "AW_MIGR_003", "ステップ1 ファイルを選ぶ（A）", "Bước 1: chọn tệp (A)", "/ops/migration/import/sites", SAMPLE_UI("A") + COLS("A"), wait=600, note=["A の取込の最初の画面。列の定義は画面には出さない。", "Màn hình đầu của nhập A. Định nghĩa cột không hiện trên màn hình."]),
    V("004", "AW_MIGR_003", "ステップ2 確認・登録（A・エラーあり）", "Bước 2: xác nhận・đăng ký (A, có lỗi)", "/ops/migration/import/sites", STEP2_UI("A") + ["mA_errs", "mA_errcsv", "mA_diff", "mA_notice"], setup=A_BAD, wait=600, note=["同じ法人の2行目の法人ステータスを変えたファイルを選んだ状態。エラーの行は取り込まず、ほかの行を登録する。", "Trạng thái chọn tệp có dòng thứ 2 của cùng pháp nhân đổi 法人ステータス. Dòng lỗi bỏ qua, các dòng khác được đăng ký."]),
    V("005", "AW_MIGR_003", "ファイル全体のエラー（A）", "Lỗi toàn tệp (A)", "/ops/migration/import/sites", ["mA_fileerr"], setup=BAD_FILE, wait=600, note=["UTF-8 でないファイルを選んだ状態（E51）。", "Trạng thái chọn tệp không phải UTF-8 (E51)."]),
    V("006", "AW_MIGR_003", "登録した結果（A → 要補完の一覧）", "Kết quả đăng ký (A → danh sách cần bổ sung)", "/ops/migration/import/sites", ["l_toast", "l_title"], setup=A_GO, wait=300, note=["4拠点の見本（本社・大阪営業所・仙台工場＝仮登録・盛岡工場＝休止中）を取り込んだ状態。S10 のトーストを出して要補完の一覧へ移る。", "Trạng thái đã nhập 4 cơ sở mẫu (trụ sở・văn phòng Osaka・nhà máy Sendai = 仮登録・nhà máy Morioka = 休止中). Hiện toast S10 rồi chuyển sang danh sách cần bổ sung."]),
    V("007", "AW_MIGR_004", "ステップ1 ファイルを選ぶ（B）", "Bước 1: chọn tệp (B)", "/ops/migration/import/loans", SAMPLE_UI("B") + COLS("B"), wait=600, note=["B（設備）の最初の画面。", "Màn hình đầu của nhập B (thiết bị)."]),
    V("008", "AW_MIGR_004", "ステップ2 確認・登録（B）", "Bước 2: xác nhận・đăng ký (B)", "/ops/migration/import/loans", STEP2_UI("B") + ["mB_diff", "mB_notice"], setup=BCD("migrationLoans"), wait=600, note=["見本のファイルを選んだ状態。", "Trạng thái chọn tệp mẫu."]),
    V("009", "AW_MIGR_005", "ステップ1 ファイルを選ぶ（C）", "Bước 1: chọn tệp (C)", "/ops/migration/import/contacts", SAMPLE_UI("C") + COLS("C"), wait=600, note=["C（担当者）の最初の画面。", "Màn hình đầu của nhập C (người phụ trách)."]),
    V("010", "AW_MIGR_005", "ステップ2 確認・登録（C）", "Bước 2: xác nhận・đăng ký (C)", "/ops/migration/import/contacts", STEP2_UI("C") + ["mC_diff", "mC_notice"], setup=BCD("migrationContacts"), wait=600, note=["見本のファイルを選んだ状態。担当者は置き換え。", "Trạng thái chọn tệp mẫu. Người phụ trách được thay thế."]),
    V("011", "AW_MIGR_006", "ステップ1 ファイルを選ぶ（D）", "Bước 1: chọn tệp (D)", "/ops/migration/import/prices", SAMPLE_UI("D") + COLS("D"), wait=600, note=["D（企業独自価格）の最初の画面。", "Màn hình đầu của nhập D (giá riêng doanh nghiệp)."]),
    V("012", "AW_MIGR_006", "ステップ2 確認・登録（D）", "Bước 2: xác nhận・đăng ký (D)", "/ops/migration/import/prices", STEP2_UI("D") + ["mD_diff", "mD_notice"], setup=BCD("migrationPrices"), wait=600, note=["見本のファイルを選んだ状態（大阪営業所の2商品）。", "Trạng thái chọn tệp mẫu (2 sản phẩm của văn phòng Osaka)."]),
    V("013", "AW_MIGR_001", "一覧（取込のあと）", "Danh sách (sau khi nhập)", "/ops/migration", LIST_HEAD + SEARCH + ROW, wait=600, note=["4拠点を取り込んだあと。仮登録の行には「申込を開く」、利用休止の行には「休止の期間を入れる」が出る。", "Sau khi nhập 4 cơ sở. Dòng 仮登録 có 「申込を開く」, dòng 利用休止 có 「休止の期間を入れる」."]),
    V("014", "AW_MIGR_001", "キーワードで検索", "Tìm theo từ khóa", "/ops/migration", ["l_kw", "l_go", "l_table", "l_id", "l_name"], setup="setv(q(\"form.filter input[placeholder='拠点ID、拠点名、法人ID、法人名']\"),'大阪');await sleep(200);search();await sleep(600);", note=["「大阪」で検索した状態。", "Trạng thái tìm 「大阪」."]),
    V("015", "AW_MIGR_001", "足りない項目で絞り込み", "Lọc theo mục còn thiếu", "/ops/migration", ["l_todo", "l_table", "l_todos"], setup="setsel(q(\"form.filter select[aria-label='足りない項目']\"),'配送の設定');await sleep(200);search();await sleep(600);", note=["「配送の設定」が足りない拠点だけにした状態。", "Trạng thái chỉ còn các cơ sở thiếu 「配送の設定」."]),
    V("016", "AW_MIGR_001", "検索結果が0件", "Kết quả tìm 0 dòng", "/ops/migration", ["l_empty"], setup="setv(q(\"form.filter input[placeholder='拠点ID、拠点名、法人ID、法人名']\"),'該当なし');await sleep(200);search();await sleep(600);", note=["一致する拠点がない状態。", "Trạng thái không có cơ sở khớp."]),
    V("017", "AW_MIGR_001", "CSV出力（トースト）", "Xuất CSV (toast)", "/ops/migration", ["l_csvout", "l_toast"], setup="btn('CSV出力').click();await sleep(1500);", wait=200, note=["検索条件のとおりの全件を出し、終わったら S12 のトースト。", "Xuất toàn bộ theo điều kiện, xong thì toast S12."]),
    V("018", "AW_MIGR_001", "参照のみの権限", "Quyền chỉ xem", "/ops/migration", ["l_head", "l_csvout", "l_table", "l_act"], login="Ad00001", note=["営業（Ad00001・R）でログインした状態。移行CSV取込・編集のボタン・休止の期間のボタンが出ない。", "Trạng thái đăng nhập bằng 営業 (Ad00001・R). Không hiện nút 移行CSV取込・nút sửa・nút kỳ tạm ngưng."]),
    V("019", "AW_MIGR_001", "休止の期間・再開月（モーダル）", "Kỳ tạm ngưng・tháng tiếp tục (modal)", "/ops/migration", ["p_modal", "p_from", "p_resume", "p_cancel", "p_ok"], setup=PAUSE_OPEN, wait=300, full=False, note=["利用休止の行の「休止の期間を入れる」を押した状態。休止の開始月は取込の切替のサイクル月が入っている。", "Trạng thái bấm 「休止の期間を入れる」 ở dòng 利用休止. Tháng bắt đầu tạm ngưng được điền sẵn tháng chu kỳ chuyển đổi lúc nhập."]),
    V("020", "AW_MIGR_001", "入力エラー（再開月が開始月より前）", "Lỗi nhập (tháng tiếp tục trước tháng bắt đầu)", "/ops/migration", ["p_err", "p_resume", "p_ok"], setup=PAUSE_OPEN + "setv(q('.mbox .fld:nth-of-type(2) input'),'2026-08');await sleep(400);", wait=300, full=False, note=["再開月に 2026-08（開始月より前）を入れた状態（E119）。「入れる」は押せない。", "Trạng thái nhập 2026-08 (trước tháng bắt đầu) vào tháng tiếp tục (E119). Không bấm được 「入れる」."]),
    V("021", "AW_MIGR_001", "休止の期間を入れた結果（トースト）", "Kết quả nhập kỳ tạm ngưng (toast)", "/ops/migration", ["l_toast"], setup=PAUSE_OPEN + "setv(q('.mbox .fld:nth-of-type(2) input'),'2027-01');await sleep(300);btn('入れる',q('.mbox')).click();await sleep(300);", wait=200, note=["再開月 2027-01 を入れて「入れる」を押した状態。S108 のトーストを出し、その拠点は一覧から消える。", "Trạng thái nhập tháng tiếp tục 2027-01 rồi bấm 「入れる」. Hiện toast S108 và cơ sở đó biến mất khỏi danh sách."]),
]
