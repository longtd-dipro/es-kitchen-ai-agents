# -*- coding: utf-8 -*-
"""
画面設計書のデータ：運営管理者Web「契約申請管理」（AW_APPL）。
元は本物の Web（このリポジトリのコード）。決定は docs/決定台帳.md（E・F の 2026-10-05〜10-07 の行）が正。
洗い出し・確認の記録は docs/05_画面設計書/確認メモ_AW_運営A_申請・法人・契約.md（Q1〜Q8 は hong 回答済み：台帳 F 2026-10-07・受付簿 No.184）。

画面（6つ。1機能＝1シートのまま）：
  AW_APPL_001 一覧（新規契約／契約変更／休止・解約の3タブ）
  AW_APPL_002 申請詳細（変更・休止・解約・再開 CH-…：承認）
  AW_APPL_003 受付詳細（新規・お試し・切替 AP-…：申込内容確認 → 仮登録 → 詳細情報設定 → 本登録）
  AW_APPL_004 新規登録（代理入力）
  AW_APPL_005 変更申請の代理入力（/proxy/change・/proxy/stop）
  AW_APPL_006 新規申込のCSV取込
見本のデータ（今日＝2026-10-05）：memo の「見本のデータ」のとおり（申請 CH-…・申込 AP-…）。足りない状態は setup の API 呼び出しで作る（見本データのファイルは直さない）。

コードと決定が違うところ（demo_ok＝決定が正・コードを直す宿題。memo §3 の H 番号）：
  H1 一覧：初期の並び（新規契約タブはコードが申請ID の昇順。ページ送り・全列の並べ替えは実装済み）／H2「未適用」の印は外した（実装済み）／H4 保存のときのログインの小窓
  H5 入力の共通基準（文字数・カナ・メール・絵文字・全角→半角）／H7 代理入力・受付に住所検索ボタン／H15 棚卸報告のスキップはシステム管理だけ
  H16 受付①の紹介・他社乗り換えの確認欄／H17 代理入力は法人Web と同じ項目（コードの簡易形）／H18 CSV出力は全項目／H19 ES営業担当は運営ユーザーから選ぶ／H21 納品不可曜日の入口
"""

TITLE = ["契約申請管理（AW_APPL）", "Quản lý đơn hợp đồng (AW_APPL)"]
SHEET = ["契約申請管理", "Quản lý đơn hợp đồng"]
BASENAME = "画面設計書_AW_APPL_契約申請管理"
IMG_PREFIX = "AW_APPL"
OUT_DIR = "運営管理者Web_申請・契約"
CODE_NOTE = ["画面コード規約（docs/01_仕様/画面コード規約_20261005.md）：<Module(2)>_<Feature(4)>_<Seq(3)>。AW＝Admin Web、APPL＝契約申請管理（001 一覧・002 申請詳細・003 受付詳細・004 新規登録（代理入力）・005 変更申請の代理入力・006 新規申込CSV取込）", "Quy ước mã màn hình (画面コード規約_20261005): <Module(2)>_<Feature(4)>_<Seq(3)>. AW = Admin Web, APPL = quản lý đơn hợp đồng (001 danh sách, 002 chi tiết đơn thay đổi, 003 chi tiết tiếp nhận, 004 đăng ký mới (nhập hộ), 005 nhập hộ đơn thay đổi, 006 nhập CSV đơn đăng ký mới)"]
SITE = "ops"
SYSTEM = {"ja": "運営管理者Web", "vi": "Web quản trị vận hành"}
AUTHOR = "Claude（cloud）／確認：hong"
CREATED = "2026-10-07"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "ops", "loginId": "Ad00010"}
CODE_PATHS = ["app/ops/applications", "lib/ops/applications", "lib/ops/areas/applications.ts", "lib/domain/seed"]

# hong に確認して決めたこと（確認メモ Q1〜Q8・台帳 F 2026-10-07。Excel の「確認ログ」シートに出る）
DECISIONS = [
    {"date": "2026-10-07", "target": "AW_APPL_001 No.1.3、AW_APPL_004・005 全体（権限）",
     "q": ["代理入力（新規登録・変更申請の代理入力）は、どの権限の操作か", "Nhập hộ (đăng ký mới / nhập hộ đơn thay đổi) thuộc quyền nào"],
     "a": ["「機能ごとの操作」扱い：R/U の CS も代理入力・承認ができる（営業 R は不可）。ログは「代理入力：運営ユーザー名」で残す。コードは代理入力を「作成」扱い（CS は押せない）→宿題", "Tính là \"thao tác theo chức năng\": CS có R/U cũng nhập hộ và duyệt được (営業 R thì không). Log ghi \"代理入力：tên người dùng\". Code đang tính là \"tạo\" (CS không bấm được) → việc phải sửa"], "src": "hong 回答 2026-10-07（Q1＝B）・台帳 F・受付簿 No.184"},
    {"date": "2026-10-07", "target": "AW_APPL_003 No.8.5（却下・取り下げ）",
     "q": ["仮登録のあとで申込を「取り下げ」るとき、理由を必須にするか", "Khi rút lại đơn sau đăng ký tạm, lý do có bắt buộc không"],
     "a": ["必須（却下と同じ）。一覧の小窓の「取り下げ理由」に出す", "Bắt buộc (giống từ chối). Hiện ở cửa sổ nhỏ trong danh sách"], "src": "hong 回答 2026-10-07（Q8＝A）・台帳 F・受付簿 No.184"},
    {"date": "2026-10-07", "target": "AW_APPL_001 No.1.2、AW_APPL_006",
     "q": ["新規申込のCSV取込を置くか（画面・エラーの行の扱い）", "Có đặt màn nhập CSV đơn đăng ký mới không (và cách xử lý dòng lỗi)"],
     "a": ["置く（契約申請管理の新規契約タブ・権限はフル権限・システム管理だけ）。エラーの行は取り込まず、ほかの行を登録する（台帳 F「CSV取込のエラーの行の扱い」）。申込フォーム §10-8 の「エラーがあれば何も登録しない」は仕様側の直し漏れ", "Có đặt (tab 新規契約; chỉ フル権限・システム管理). Dòng lỗi không nhập, các dòng khác vẫn đăng ký (台帳 F). Câu \"có lỗi thì không đăng ký gì\" ở 申込フォーム §10-8 là chỗ chưa sửa trong 仕様書"], "src": "台帳 E・F・hong 回答 2026-10-03（A11）・2026-10-05"},
    {"date": "2026-10-07", "target": "AW_APPL_002 No.7.5（承認画面の締切後）",
     "q": ["承認がオーダー締切を過ぎているときの開始月の扱い", "Cách xử lý tháng bắt đầu khi duyệt sau hạn chót đặt hàng"],
     "a": ["運営が2択から選ぶ：翌サイクルへ繰り下げ／運営が代理でオーダー（今月分）。選んだ内容はお知らせにも書く", "Vận hành chọn 1 trong 2: dời sang chu kỳ sau / vận hành đặt hộ (phần tháng này). Nội dung đã chọn ghi cả vào thông báo"], "src": "hong 回答 2026-10-03（A1＝A）・申込フォーム §10-5"},
]

CHANGES = []

HIDE_ALWAYS = []
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [
    {"code": "AW_APPL_001", "ja": "契約申請管理 一覧", "vi": "Quản lý đơn hợp đồng: danh sách"},
    {"code": "AW_APPL_002", "ja": "申請詳細（変更・休止・解約・再開の承認）", "vi": "Chi tiết đơn (duyệt đơn thay đổi / tạm ngưng / hủy / mở lại)"},
    {"code": "AW_APPL_003", "ja": "受付詳細（新規・お試し・切替）", "vi": "Chi tiết tiếp nhận (đăng ký mới / dùng thử / chuyển đổi)"},
    {"code": "AW_APPL_004", "ja": "新規登録（代理入力）", "vi": "Đăng ký mới (nhập hộ)"},
    {"code": "AW_APPL_005", "ja": "変更申請の代理入力", "vi": "Nhập hộ đơn thay đổi"},
    {"code": "AW_APPL_006", "ja": "新規申込CSV取込", "vi": "Nhập CSV đơn đăng ký mới"},
]

# ---------------------------------------------------------------- setup で使う小さな関数（本物の Web は React なので input イベントを出す）
H = (
    "const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));"
    "const setv=(el,v)=>{if(!el)return;const p=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;"
    "Object.getOwnPropertyDescriptor(p,'value').set.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}));};"
    "const setsel=(el,v)=>{if(!el)return;Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(el,v);el.dispatchEvent(new Event('change',{bubbles:true}));};"
    "const btn=(t,root)=>[...(root||document).querySelectorAll('button')].find(b=>(b.textContent||'').trim().includes(t));"
    "const tab=(t)=>[...document.querySelectorAll('[role=tab]')].find(b=>(b.textContent||'').includes(t));"
    "const link=(t)=>[...document.querySelectorAll('a')].find(a=>(a.textContent||'').trim()===t);"
    "const post=async(path,args)=>{const r=await fetch(path,{method:'POST',credentials:'include',headers:{'Content-Type':'application/json','x-es-site':'ops'},body:JSON.stringify({args:args??null})});return r.ok?await r.json().catch(()=>null):null;};"
    "const area=(op,args)=>post('/api/ops/area/applications/'+op,args);"
    "const dom=(a,op,args)=>post('/api/domain/'+a+'/'+op,args);"
)

# ---------------------------------------------------------------- 書くときの小さな道具
def I(no, ja, vi, sel, kind="label", trig="view", d=None, **kw):
    """項目 1 つ。d＝詳細 [日本語, ベトナム語]"""
    x = {"no": no, "ja": ja, "vi": vi, "sel": sel, "kind": kind, "trig": trig}
    if d:
        x["detail"] = list(d)
    x.update(kw)
    return x

def pick(items, *nos):
    """items のうち、番号が nos のものを（nos の順に）取り出す"""
    m = {x["no"]: x for x in items}
    return [m[n] for n in nos]

def V(id, code, ja, vi, url, items, setup="", note=None, full=True, wait=500, login=None, today=None, hide=None):
    x = {"id": id, "code": code, "state": [ja, vi], "url": url, "setup": (H + setup) if setup else "", "full": full, "wait": wait, "note": note or ["", ""], "items": items}
    if login:
        x["login"] = login
    if today:
        x["today"] = today
    if hide:
        x["hide"] = hide
    return x

VIEWS = []

# ================================================================ AW_APPL_001 一覧
FS = "#apxf .es-search__fields > div"      # 検索条件の1つ目から（1つ目＝キーワード）

L_HEAD = [
    I("1", "ヘッダーのボタン", "Nút ở đầu trang", ".es-pagehead__actions", "area",
      d=["権限がないボタンは出さない（基本設計 §10-6）。CSV出力は閲覧できる役割すべてに出す。パンくず：契約申請管理。", "Nút không có quyền thì không hiện (基本設計 §10-6). CSV出力 hiện cho mọi vai trò xem được. Breadcrumb: 契約申請管理."]),
    I("1.1", "CSV出力", "Xuất CSV", ".es-pagehead__actions button::CSV出力", "button", "click", pattern="P-CSV-OUT", err=["S12"],
      cond=["契約申請管理の CSV出力 の権限（閲覧できる役割すべて）", "Quyền CSV出力 của 契約申請管理 (mọi vai trò xem được)"],
      d=["表示中のタブの、検索条件のとおりの全件を出す。新規契約タブの列：申請ID・契約区分・法人名・拠点名・プラン・コース・設備区分・配送区分・納品回数・アカウント状態・ES営業担当・ステータス・申請日（システムにある項目すべて）。契約変更・休止・解約タブの列：申請ID・申請の種類・法人名・拠点名・変更の内容・開始サイクル月・オーダー締切・ES営業担当・ステータス・申請日（同）。",
         "Xuất toàn bộ theo điều kiện tìm kiếm của tab đang xem. Cột tab 新規契約: 申請ID, 契約区分, 法人名, 拠点名, プラン, コース, 設備区分, 配送区分, 納品回数, アカウント状態, ES営業担当, ステータス, 申請日 (mọi mục có trong hệ thống). Cột tab 契約変更・休止・解約: 申請ID, 申請の種類, 法人名, 拠点名, 変更の内容, 開始サイクル月, オーダー締切, ES営業担当, ステータス, 申請日 (cùng nguyên tắc)."],
      ),
    I("1.2", "CSV取込", "Nhập CSV", ".es-pagehead__actions button::CSV取込", "button", "click", pattern="P-CSV",
      cond=["新規契約タブのときだけ。契約申請管理の CSV取込 の権限（フル権限・システム管理だけ）", "Chỉ ở tab 新規契約. Quyền CSV取込 của 契約申請管理 (chỉ フル権限・システム管理)"],
      d=["新規申込のCSV取込（AW_APPL_006）へ。契約変更・休止・解約タブには出さない（変更申請は CSV では取り込まない）。", "Mở màn nhập CSV đơn đăng ký mới (AW_APPL_006). Không hiện ở tab 契約変更・休止・解約 (đơn thay đổi không nhập bằng CSV)."]),
    I("1.3", "新規登録（代理入力）／変更申請の代理入力", "Đăng ký mới (nhập hộ) / Nhập hộ đơn thay đổi", ".es-pagehead__actions button::代理入力", "button", "click",
      cond=["代理入力の権限（機能ごとの操作＝フル権限・システム管理・CS の R/U。営業 R・閲覧のみは出さない）", "Quyền nhập hộ (thao tác theo chức năng = フル権限・システム管理・CS có R/U; 営業 R・chỉ xem thì không hiện)"],
      d=["新規契約タブ＝「新規登録（代理入力）」→ AW_APPL_004。契約変更タブ・休止・解約タブ＝「変更申請の代理入力」→ AW_APPL_005（契約変更タブは変更の種類 5 つ、休止・解約タブは 休止・再開・解約 を選べる）。電話・営業・紙で受けた申込・申請を運営が代わりに入力する入口は、ここだけ。",
         "Tab 新規契約 = \"新規登録（代理入力）\" → AW_APPL_004. Tab 契約変更 / 休止・解約 = \"変更申請の代理入力\" → AW_APPL_005 (tab 契約変更 chọn 5 loại thay đổi, tab 休止・解約 chọn 休止・再開・解約). Đây là cửa duy nhất để vận hành nhập hộ đơn nhận qua điện thoại / nhân viên kinh doanh / giấy."],
      demo_ok=["コードは代理入力を「作成」扱い（CS は押せない）。台帳 2026-10-07（Q1＝B）どおり、R/U の CS も押せるように直す（apiPerm）", "Code tính nhập hộ là \"tạo\" (CS không bấm được). Theo 台帳 2026-10-07 (Q1=B), sửa để CS có R/U cũng bấm được (apiPerm)"]),
]
L_TABS = [
    I("2", "タブ", "Tab", ".es-tabs", "tab", "click", pattern="P-TAB",
      d=["新規契約／契約変更／休止・解約の3つ。タブごとに検索条件と並びを持ち、切り替えると検索語だけ残して条件を戻す。名前の後ろに「対応が必要な件数」（新規契約＝受付中＋契約設定中、契約変更・休止・解約＝承認待ち＋対応中）を出す。",
         "3 tab: 新規契約 / 契約変更 / 休止・解約. Mỗi tab có điều kiện tìm và thứ tự riêng; khi chuyển tab chỉ giữ từ khóa, các điều kiện khác trả về ban đầu. Sau tên tab hiện \"số việc cần xử lý\" (新規契約 = 受付中 + 契約設定中; tab còn lại = 承認待ち + 対応中)."],
      demo_ok=["P-TAB は URL（?tab=）にタブを持つ決まり。コードは画面のメモリに持つ（再読み込みで新規契約に戻る）", "P-TAB quy định giữ tab trên URL (?tab=). Code giữ trong bộ nhớ trang (tải lại thì về 新規契約)"]),
    I("2.1", "受付中／契約設定中の内訳", "Chi tiết 受付中 / 契約設定中", ".apx-tabsub", "label",
      cond=["新規契約タブに受付中・契約設定中があるとき", "Khi tab 新規契約 có 受付中 / 契約設定中"],
      d=["新規契約タブの名前の横に「受付中 n／契約設定中 m」。メニュー「契約申請管理」のバッジにマウスを乗せたときの内訳と同じ数え方（台帳 K）。", "Cạnh tên tab 新規契約: \"受付中 n／契約設定中 m\". Cùng cách đếm với chi tiết khi rê chuột vào badge menu \"契約申請管理\" (台帳 K)."]),
]
def L_SEARCH(tab):
    """検索条件。tab＝'new'（新規契約）か 'chg'（契約変更・休止・解約）"""
    base = [
        I("3", "検索条件", "Điều kiện tìm kiếm", "#apxf", "area", pattern="P-LIST",
          d=["検索条件は「検索」か Enter で反映する（入力中に一覧を変えない）。条件の枠は es-search（折り返し・右に クリア／検索／並べ替え）。「未適用」の印は出さない。", "Điều kiện chỉ áp dụng khi nhấn \"検索\" hoặc Enter (không đổi danh sách khi đang nhập). Khung điều kiện là es-search (xuống dòng, bên phải có クリア / 検索 / sắp xếp). Không hiện dấu \"未適用\"."],
          ),
        I("3.1", "キーワード", "Từ khóa", "#apxf input[type=text]", "text", "input", req="－", len="文字列 60",
          ex=["AP-20260910-0031", "Mã đơn, tên pháp nhân, tên cơ sở hoặc tên người phụ trách ES (khớp một phần)"],
          d=["申請ID・法人名・拠点名・ES営業担当の部分一致。Enter でも検索する。", "Khớp một phần với mã đơn, tên pháp nhân, tên cơ sở, ES営業担当. Nhấn Enter cũng tìm."],
          err=["E04"]),
    ]
    if tab == "new":
        base += [
            I("3.2", "契約区分", "Loại hợp đồng", FS + ":nth-child(2) .es-select", "select", "select", req="－", len=["選択（本導入／お試し／切替）", "Chọn (loại hợp đồng)"], init=["（契約区分）＝すべて", "(契約区分) = tất cả"],
              ex=["お試し", "Chọn 1 loại"], d=["契約区分で絞る。", "Lọc theo loại hợp đồng."]),
            I("3.3", "プラン", "Gói", FS + ":nth-child(3) .es-select", "select", "select", req="－", len=["選択（プランマスタのプラン）", "Chọn (gói trong bảng gói)"], init=["（プラン）＝すべて", "(プラン) = tất cả"],
              ex=["ES000003 50プラン", "Chọn 1 gói"], d=["申込のプランで絞る。選択肢はプランマスタのプラン（ID と名前）。複数拠点でプランが違う申込は「複数（n拠点）」の行になる。", "Lọc theo gói của đơn. Lựa chọn là các gói trong プランマスタ (ID và tên). Đơn nhiều cơ sở khác gói hiện là dòng \"複数（n拠点）\"."],
              demo_ok=["コードの選択肢は一覧の行の値から作る（「複数（4拠点）」も選択肢に出る）。プランマスタのプランから作る", "Lựa chọn trong code lấy từ giá trị các dòng (kể cả \"複数（4拠点）\"). Sửa thành lấy từ gói trong プランマスタ"]),
            I("3.4", "コース", "Khóa", FS + ":nth-child(4) .es-select", "select", "select", req="－", len=["選択（ESライト／ESライト（自販機）／ESスタンダード）", "Chọn (khóa)"], init=["（コース）＝すべて", "(コース) = tất cả"],
              ex=["ESスタンダード", "Chọn 1 khóa"], d=["コースで絞る。", "Lọc theo khóa."],
              demo_ok=["コードの選択肢は「ESライト」「ESスタンダード」の2つで、一覧の「ESライト（冷蔵庫）」「ESライト（自販機）」と一致せず絞れない。コース名をプランマスタに合わせる", "Lựa chọn trong code chỉ có \"ESライト\" / \"ESスタンダード\", không khớp \"ESライト（冷蔵庫）\" / \"ESライト（自販機）\" trên danh sách nên không lọc được. Sửa tên khóa theo プランマスタ"]),
            I("3.5", "設備区分", "Loại thiết bị", FS + ":nth-child(5) .es-select", "select", "select", req="－", len=["選択（冷蔵庫／自販機／拠点ごと）", "Chọn (loại thiết bị)"], init=["（設備区分）＝すべて", "(設備区分) = tất cả"],
              ex=["自販機", "Chọn 1 loại"], d=["設備区分で絞る。拠点ごとに違う申込は「拠点ごと」。", "Lọc theo loại thiết bị. Đơn mà mỗi cơ sở khác nhau là \"拠点ごと\"."]),
            I("3.6", "ES営業担当", "Nhân viên ES phụ trách", FS + ":nth-child(6) .es-select", "select", "select", req="－", len=["選択（運営のユーザー）", "Chọn (người dùng vận hành)"], init=["（ES営業担当）＝すべて", "(ES営業担当) = tất cả"],
              ex=["田中 健一", "Chọn 1 người"], d=["ES営業担当で絞る。選択肢は運営のユーザー。", "Lọc theo ES営業担当. Lựa chọn là người dùng vận hành."],
              demo_ok=["コードの選択肢は一覧の行の担当者から作る。運営のユーザー（アカウント一覧）から作る（H19）", "Code lấy từ người phụ trách trên các dòng. Sửa thành lấy từ người dùng vận hành (danh sách tài khoản) (H19)"]),
            I("3.7", "ステータス", "Trạng thái", FS + ":nth-child(7) .es-select", "select", "select", req="－", len=["選択（受付中／契約設定中／完了／却下／取り下げ済み）", "Chọn (trạng thái đơn tiếp nhận)"], init=["（ステータス）＝すべて", "(ステータス) = tất cả"],
              ex=["受付中", "Chọn 1 trạng thái"], d=["ステータスで絞る。", "Lọc theo trạng thái."]),
            I("3.8", "並べ替え", "Sắp xếp", FS + ":nth-child(8) .es-select", "select", "select", req="－", len=["選択（列）＋昇順／降順", "Chọn (cột) + tăng / giảm"], init=["申請日の降順", "申請日 giảm dần"],
              ex=["申請ID・昇順", "Chọn cột rồi đổi tăng / giảm"],
              d=["並べる列を選び、昇順／降順を切り替える（全列）。初期の並びは申請日の降順（両タブ。台帳 E「一覧の初期の並び」）。", "Chọn cột để sắp xếp, đổi tăng / giảm (mọi cột). Thứ tự ban đầu: 申請日 giảm dần (cả 2 tab; 台帳 E)."],
              demo_ok=["コードの初期の並びは新規契約タブ＝申請ID の昇順（並べ替えは全列・昇順／降順は実装済み）。初期を申請日の降順に直す（台帳 E「一覧の初期の並び」）", "Thứ tự mặc định trong code của tab 新規契約 là 申請ID tăng dần (sắp xếp mọi cột / tăng-giảm đã làm). Sửa mặc định thành 申請日 giảm dần (台帳 E)"]),
        ]
        nclear, nsearch = "3.9", "3.10"
    else:
        base += [
            I("3.2", "申請の種類", "Loại đơn", FS + ":nth-child(2) .es-select", "select", "select", req="－", len=["選択（そのタブの申請の種類）", "Chọn (loại đơn của tab)"], init=["（申請の種類）＝すべて", "(申請の種類) = tất cả"],
              ex=["プランの変更", "Chọn 1 loại"], d=["契約変更タブ＝プラン・配送・設備・拠点情報・法人情報の変更、休止・解約タブ＝休止・再開・解約。", "Tab 契約変更 = đổi gói / giao hàng / thiết bị / thông tin cơ sở / thông tin pháp nhân; tab 休止・解約 = 休止 / 再開 / 解約."]),
            I("3.3", "拠点", "Cơ sở", FS + ":nth-child(3) .es-select", "select", "select", req="－", len=["選択（そのタブの申請にある拠点）", "Chọn (cơ sở có trong đơn của tab)"], init=["（拠点）＝すべて", "(拠点) = tất cả"],
              ex=["株式会社サンプル 大阪支店", "Chọn 1 cơ sở"], d=["申請の対象の拠点で絞る（複数拠点の申請は、どれか1つの拠点に当たれば出る）。", "Lọc theo cơ sở đối tượng của đơn (đơn nhiều cơ sở hiện ra nếu trúng 1 cơ sở bất kỳ)."]),
            I("3.4", "ステータス", "Trạng thái", FS + ":nth-child(4) .es-select", "select", "select", req="－", len=["選択（承認待ち／対応中／承認済み／一部承認／却下／取り下げ済み）", "Chọn (trạng thái đơn thay đổi)"], init=["（ステータス）＝すべて", "(ステータス) = tất cả"],
              ex=["承認待ち", "Chọn 1 trạng thái"], d=["ステータスで絞る。「対応中」は「対応中 n/m」の行すべて。", "Lọc theo trạng thái. \"対応中\" gồm mọi dòng \"対応中 n/m\"."]),
            I("3.5", "並べ替え", "Sắp xếp", FS + ":nth-child(5) .es-select", "select", "select", req="－", len=["選択（列）＋昇順／降順", "Chọn (cột) + tăng / giảm"], init=["申請日の降順", "申請日 giảm dần"],
              ex=["申請ID・昇順", "Chọn cột rồi đổi tăng / giảm"],
              d=["並べる列を選び、昇順／降順を切り替える（全列）。初期の並びは申請日の降順。", "Chọn cột để sắp xếp, đổi tăng / giảm (mọi cột). Thứ tự ban đầu: 申請日 giảm dần."],
              ),
        ]
        nclear, nsearch = "3.6", "3.7"
    base += [
        I(nclear, "クリア", "Xóa điều kiện", "#apxf button::クリア", "button", "click", d=["検索語と条件を初期値に戻し、一覧も初期の表示に戻す。", "Đưa từ khóa và điều kiện về ban đầu, danh sách cũng trở lại hiển thị ban đầu."]),
        I(nsearch, "検索", "Tìm kiếm", "#apxf button::検索", "button", "click", d=["条件を一覧に反映し、1ページ目に戻る。", "Áp dụng điều kiện vào danh sách và về trang 1."]),
    ]
    return base

NEW_COLS = [
    ("4.1", "No", "No", "表示順の連番（ページをまたいで続く）。", "Số thứ tự hiển thị (liên tục qua các trang)."),
    ("4.2", "申請ID", "Mã đơn", "AP-YYYYMMDD-NNNN（登録時に自動採番）。リンクを押すと受付詳細（AW_APPL_003）を開く。却下・取り下げ済みの行は受付を開かず、理由と日時の小窓（AW_APPL_001 状態 005・006）を出す。代理入力の申込は ID の下に「代理入力」の印と受付経路を出す。", "AP-YYYYMMDD-NNNN (tự cấp khi đăng ký). Nhấn link mở chi tiết tiếp nhận (AW_APPL_003). Dòng 却下 / 取り下げ済み không mở màn tiếp nhận mà hiện cửa sổ lý do và ngày giờ (AW_APPL_001 trạng thái 005, 006). Đơn nhập hộ có dấu \"代理入力\" và kênh tiếp nhận dưới mã."),
    ("4.3", "契約区分", "Loại hợp đồng", "本導入／お試し／切替。", "本導入 / お試し / 切替."),
    ("4.4", "法人名／拠点名", "Pháp nhân / Cơ sở", "法人名（太字）と、その下に拠点名。複数拠点の申込は拠点名を「・」でつなぐ。", "Tên pháp nhân (in đậm) và tên cơ sở bên dưới. Đơn nhiều cơ sở nối tên cơ sở bằng \"・\"."),
    ("4.5", "プラン", "Gói", "プランID と名前（例 ES000003 50プラン）。複数拠点でプランが違うときは「複数（n拠点）」。", "ID và tên gói (vd. ES000003 50プラン). Nhiều cơ sở khác gói thì \"複数（n拠点）\"."),
    ("4.6", "コース", "Khóa", "ESライト（冷蔵庫）／ESライト（自販機）／ESスタンダード。", "ESライト（冷蔵庫） / ESライト（自販機） / ESスタンダード."),
    ("4.7", "設備区分", "Loại thiết bị", "冷蔵庫／自販機／拠点ごと。", "冷蔵庫 / 自販機 / 拠点ごと."),
    ("4.8", "配送区分", "Phân loại giao hàng", "ES配送便／COOL便。拠点で違うときは「ES配送便・COOL便」。", "ES配送便 / COOL便. Cơ sở khác nhau thì \"ES配送便・COOL便\"."),
    ("4.9", "納品回数", "Số lần giao", "「月n回」（拠点ごとに違うときは「拠点ごと」、お試しなど決まっていないときは「—」）。右寄せにしない。", "\"月n回\" (mỗi cơ sở khác nhau thì \"拠点ごと\", dùng thử / chưa xác định thì \"—\")."),
    ("4.10", "アカウント状態", "Trạng thái tài khoản", "未発行（灰）／発行済（緑）／ログイン済（緑）。仮登録で「アカウントを発行する」を ON にすると発行済になる。", "未発行 (xám) / 発行済 (xanh) / ログイン済 (xanh). Bật \"アカウントを発行する\" ở bước đăng ký tạm thì thành 発行済."),
    ("4.11", "ES営業担当", "Nhân viên ES phụ trách", "運営のユーザー名。空のときは何も出さない。", "Tên người dùng vận hành. Trống thì không hiện gì."),
    ("4.12", "ステータス", "Trạng thái", "受付中（黄）→契約設定中（青）→完了（緑）、却下（赤）、取り下げ済み（灰）。仮登録で契約設定中、全拠点の本登録で完了になる。", "受付中 (vàng) → 契約設定中 (xanh dương) → 完了 (xanh lá), 却下 (đỏ), 取り下げ済み (xám). Đăng ký tạm thành 契約設定中, đăng ký chính thức toàn bộ cơ sở thì thành 完了."),
    ("4.13", "申請日", "Ngày nộp đơn", "yyyy-mm-dd。", "yyyy-mm-dd."),
]
CHG_COLS = [
    ("4.1", "No", "No", "表示順の連番。", "Số thứ tự hiển thị."),
    ("4.2", "申請ID", "Mã đơn", "CH-YYYYMMDD-NNNN。リンクを押すと申請詳細（AW_APPL_002）を開く。代理入力の申請は ID の下に「代理入力」の印。", "CH-YYYYMMDD-NNNN. Nhấn link mở chi tiết đơn (AW_APPL_002). Đơn nhập hộ có dấu \"代理入力\" dưới mã."),
    ("4.3", "申請の種類", "Loại đơn", "プランの変更／配送の変更／設備の変更／拠点情報の変更／法人情報の変更（契約変更タブ）、休止／再開／解約（休止・解約タブ）。", "プランの変更 / 配送の変更 / 設備の変更 / 拠点情報の変更 / 法人情報の変更 (tab 契約変更), 休止 / 再開 / 解約 (tab 休止・解約)."),
    ("4.4", "法人名／拠点名", "Pháp nhân / Cơ sở", "法人名（太字）と拠点名。複数拠点の申請は「・」でつなぐ。法人情報の変更は「（法人）」。", "Tên pháp nhân (in đậm) và tên cơ sở. Đơn nhiều cơ sở nối bằng \"・\". Thay đổi thông tin pháp nhân ghi \"（法人）\"."),
    ("4.5", "変更の内容", "Nội dung thay đổi", "拠点ごとの変更の要約（例「プラン 50プラン → 100プラン」）。複数拠点は「／」でつなぐ。", "Tóm tắt thay đổi theo cơ sở (vd. \"プラン 50プラン → 100プラン\"). Nhiều cơ sở nối bằng \"／\"."),
    ("4.6", "開始サイクル月", "Chu kỳ bắt đầu", "変更が効き始めるサイクル月（例 2026-11サイクル）。法人情報の変更は「承認後すぐ」。", "Chu kỳ tháng mà thay đổi có hiệu lực (vd. 2026-11サイクル). Thay đổi pháp nhân là \"承認後すぐ\"."),
    ("4.7", "オーダー締切", "Hạn chót đặt hàng", "承認待ち・対応中の申請に「あと n日」（3日以内は黄）と締切日、過ぎていれば「n日 超過」（赤）。処理済みは「—」。", "Đơn 承認待ち / 対応中 hiện \"あと n日\" (trong 3 ngày thì vàng) và ngày hạn; quá hạn thì \"n日 超過\" (đỏ). Đã xử lý thì \"—\"."),
    ("4.8", "ES営業担当", "Nhân viên ES phụ trách", "運営のユーザー名。", "Tên người dùng vận hành."),
    ("4.9", "ステータス", "Trạng thái", "承認待ち（黄）／対応中 n/m（青。n＝処理した拠点・m＝申請の拠点）／承認済み（緑）／一部承認（青）／却下（赤）／取り下げ済み（灰）。", "承認待ち (vàng) / 対応中 n/m (xanh dương; n = cơ sở đã xử lý, m = cơ sở trong đơn) / 承認済み (xanh lá) / 一部承認 (xanh dương) / 却下 (đỏ) / 取り下げ済み (xám)."),
    ("4.10", "申請日", "Ngày nộp đơn", "yyyy-mm-dd。", "yyyy-mm-dd."),
]
def L_TABLE(cols, tab):
    t = [I("4", "申請の一覧", "Bảng đơn", ".es-table.apx-list", "table", pattern="P-LIST",
           d=(["初期の並びは申請日の降順。1ページ 10件（10／20／50）。削除の列・ボタンは置かない（申請は削除せずステータスで扱う）。", "Thứ tự ban đầu 申請日 giảm dần. 10 dòng/trang (10/20/50). Không có cột / nút xóa (đơn không xóa, quản lý bằng trạng thái)."]),
           demo_ok=["コードの初期の並びは新規契約タブ＝申請ID の昇順（ページ送り 10／20／50 は実装済み）。申請日の降順に直す（台帳 E）", "Thứ tự mặc định tab 新規契約 trong code là 申請ID tăng dần (phân trang 10/20/50 đã làm). Sửa thành 申請日 giảm dần (台帳 E)"])]
    for no, ja, vi, dj, dv in cols:
        kind = "link" if ja == "申請ID" else "label"
        t.append(I(no, ja, vi, ".apx-list th::" + ja, kind, "click" if kind == "link" else "view", d=[dj, dv]))
    return t
L_EMPTY = I("4.14", "0件の表示", "Hiển thị 0 dòng", ".apx-list td[colspan]", "label", "show", err=["I01"],
            d=["条件に合う申請がないとき、表の中に I01。", "Khi không có đơn phù hợp, hiện I01 trong bảng."],
            demo_ok=["コードの文言は「条件に合う申請はありません」。I01 に揃える", "Câu trong code là \"条件に合う申請はありません\". Đồng nhất về I01"])
L_PAGER = [
    I("5", "ページ送り", "Phân trang", ".es-pagination", "area", pattern="P-LIST",
      d=["「全件数 件中 a–b件」・ページ番号・前へ／次へ・表示件数（10／20／50、初期 10）。詳細から一覧に戻ったとき、タブ・検索条件・ページ・表示件数を戻す。", "\"tổng 件中 a–b件\", số trang, trước/sau, số dòng/trang (10/20/50, mặc định 10). Khi từ chi tiết quay lại danh sách, khôi phục tab, điều kiện tìm, trang và số dòng."],
      ),
]
L_CLOSED = [
    I("6", "却下・取り下げ済みの申込の小窓", "Cửa sổ nhỏ cho đơn 却下 / 取り下げ済み", ".es-dialog__panel", "modal", "show",
      d=["却下・取り下げ済みの行の申請IDを押すと、受付を開かずに出す小窓「申請詳細 AP-…」。法人／拠点・ステータス・却下した人と日時（取り下げは取り下げ日時）・却下理由（取り下げ理由）と詳細な理由を、読むだけで出す。", "Khi nhấn mã đơn của dòng 却下 / 取り下げ済み thì hiện cửa sổ nhỏ \"申請詳細 AP-…\" mà không mở màn tiếp nhận. Chỉ đọc: pháp nhân / cơ sở, trạng thái, người từ chối và ngày giờ (rút lại: ngày giờ rút lại), lý do từ chối (lý do rút lại) và lý do chi tiết."]),
    I("6.1", "理由・日時", "Lý do, ngày giờ", ".es-dialog__body", "area", "view",
      d=["却下＝「却下した人・日時」「却下理由」、取り下げ＝「取り下げ日時」「取り下げ理由」。取り下げ理由は必須（台帳 F 2026-10-07・Q8）なので空欄にならない。", "Từ chối = \"却下した人・日時\", \"却下理由\"; rút lại = \"取り下げ日時\", \"取り下げ理由\". Lý do rút lại bắt buộc (台帳 F 2026-10-07, Q8) nên không bỏ trống."]),
    I("6.2", "閉じる", "Đóng", ".es-dialog__foot button::閉じる", "button", "click", d=["小窓を閉じる。何も変えない。", "Đóng cửa sổ nhỏ, không thay đổi gì."]),
]

# ---- 状態
_cond_new = ["新規契約タブ", "Tab 新規契約"]
VIEWS += [
    V("001", "AW_APPL_001", "新規契約タブ（初期表示）", "Tab 新規契約 (hiển thị ban đầu)", "/ops/applications",
      L_HEAD + L_TABS + L_SEARCH("new") + L_TABLE(NEW_COLS, "new") + L_PAGER,
      note=["受付中 3／契約設定中 3。「代理入力」の印は代理入力の申込の ID の下に出る。申請日の降順（コードは申請ID の昇順）。", "受付中 3／契約設定中 3. Dấu \"代理入力\" hiện dưới mã của đơn nhập hộ. Sắp 申請日 giảm dần (code đang sắp theo 申請ID tăng dần)."]),
    V("002", "AW_APPL_001", "契約変更タブ", "Tab 契約変更", "/ops/applications",
      pick(L_HEAD, "1", "1.1", "1.3") + L_TABS[:1] + L_SEARCH("chg") + L_TABLE(CHG_COLS, "chg"),
      setup="tab('契約変更').click();await sleep(500);",
      note=["オーダー締切＝承認待ちの申請に「あと n日」。今日は 2026-10-05（締切 10/15）。CSV取込は出ない。", "Hạn chót: đơn 承認待ち hiện \"あと n日\". Hôm nay là 2026-10-05 (hạn 10/15). Không có CSV取込."]),
    V("003", "AW_APPL_001", "休止・解約タブ", "Tab 休止・解約", "/ops/applications",
      pick(L_HEAD, "1", "1.3") + L_TABS[:1] + pick(L_SEARCH("chg"), "3", "3.2", "3.4") + [L_TABLE(CHG_COLS, "chg")[0]] + [x for x in L_TABLE(CHG_COLS, "chg") if x["no"] in ("4.3", "4.5", "4.6", "4.9")],
      setup="tab('休止・解約').click();await sleep(500);",
      note=["休止・再開・解約の申請。代理入力は「変更申請の代理入力」（休止・解約用の入力）。", "Đơn 休止 / 再開 / 解約. Nhập hộ là \"変更申請の代理入力\" (dùng cho 休止・解約)."]),
    V("004", "AW_APPL_001", "検索して0件", "Tìm không có kết quả", "/ops/applications",
      pick(L_SEARCH("new"), "3.1", "3.10") + [L_EMPTY],
      setup="setv(document.querySelector('#apxf input[type=text]'),'zzz');btn('検索',document.querySelector('#apxf')).click();await sleep(500);"),
    V("005", "AW_APPL_001", "却下済みの行を開く（小窓）", "Mở dòng đã 却下 (cửa sổ nhỏ)", "/ops/applications", L_CLOSED,
      setup="link('AP-20260915-0048').click();await sleep(500);", full=False,
      note=["AP-20260915-0048（却下）。", "AP-20260915-0048 (却下)."]),
    V("006", "AW_APPL_001", "取り下げ済みの行を開く（小窓）", "Mở dòng đã 取り下げ済み (cửa sổ nhỏ)", "/ops/applications", L_CLOSED,
      setup="link('AP-20260918-0050').click();await sleep(500);", full=False,
      note=["AP-20260918-0050（取り下げ済み）。「取り下げ日時」「取り下げ理由」を出す。", "AP-20260918-0050 (取り下げ済み). Hiện \"取り下げ日時\", \"取り下げ理由\"."]),
    V("007", "AW_APPL_001", "CSV出力（トースト）", "Xuất CSV (toast)", "/ops/applications",
      [pick(L_HEAD, "1.1")[0], I("7", "出力の完了のトースト", "Toast hoàn tất xuất", ".toast", "toast", "show", err=["S12"], pattern="P-CSV-OUT",
                                 d=["出力できたら S12（件数・ファイル名）。ファイル名＝画面名＋条件＋日時。出力は出力の記録に残る。", "Xuất xong hiện S12 (số dòng, tên file). Tên file = tên màn hình + điều kiện + ngày giờ. Việc xuất được lưu trong nhật ký xuất."])],
      setup="btn('CSV出力').click();await sleep(700);",
      note=["新規契約タブの、検索条件のとおりの全件。", "Toàn bộ theo điều kiện tìm của tab 新規契約."]),
    V("008", "AW_APPL_001", "参照のみの権限（閲覧のみ）", "Quyền chỉ xem (閲覧のみ)", "/ops/applications",
      pick(L_HEAD, "1", "1.1") + pick(L_TABS, "2"), login="Ad00013",
      note=["Ad00013（閲覧のみ）：CSV出力だけ出る。「CSV取込」「新規登録（代理入力）」は出ない（営業 R も同じ）。申請ID のリンクで詳細は見られるが、受付・承認のボタンは出ない。", "Ad00013 (閲覧のみ): chỉ hiện CSV出力. Không hiện \"CSV取込\", \"新規登録（代理入力）\" (営業 R cũng vậy). Link mã đơn vẫn xem chi tiết được nhưng không có nút tiếp nhận / duyệt."]),
    V("009", "AW_APPL_001", "ページ送り（10件ごと）", "Phân trang (10 dòng/trang)", "/ops/applications",
      L_PAGER + [pick(L_TABLE(NEW_COLS, "new"), "4")[0]],
      note=["見本は新規契約が11件。仕様どおりなら 1ページ目に10件・2ページ目に1件。コードは11件すべてを1ページに出し「11件中 1–10件」と書く（ダミー・H1）。", "Dữ liệu mẫu có 11 đơn 新規契約. Theo thiết kế: trang 1 có 10 dòng, trang 2 có 1 dòng. Code hiện cả 11 dòng trên 1 trang và ghi \"11件中 1–10件\" (giả, H1)."]),
]


# ================================================================ AW_APPL_002 申請詳細（変更・休止・解約・再開 CH-…）
# どの申請も同じ4つのタブ：申請内容／変更される項目／影響と設定／拠点ごとの承認（法人情報の変更は「法人単位の承認」）
CARD = ".apx-narrow > .card"
H += (
    "const go=async(p)=>{window.next.router.push(p);const last=p.split('/').pop();for(let i=0;i<60;i++){await sleep(150);const t=document.querySelector('.es-pagehead__title');if(i>2&&location.pathname===p&&t&&(/applications$/.test(p)||t.textContent.includes(last)))break;}await sleep(500);};"
    "const free=async(ids)=>{const o=await area('overview',null);for(const c of o.changes){for(let i=0;i<c.branches.length;i++){const b=c.branches[i];if(!b.res.st&&ids.some(x=>(b.ids||'').includes(x)))await area('reject',{no:c.no,i:i,why:'その他（下に詳しく書く）',note:'見本の整理'});}}};"
    "const find=async(mark)=>{const o=await area('overview',null);const c=o.changes.find(x=>(x.request||[]).some(r=>String(r[1]).includes(mark)));return c&&c.no;};"
    "const cxl=async(corp,br,n)=>{const r=await area('createChange',{form:{route:'電話',recv:'2026-10-05',kind:'解約',corp:corp,br:br,start:'',resume:'',cxl:String(n),content:'事業所閉鎖のため解約（見本）',reason:'',stock:'全て買取（最終のご請求書に買取として載せます）'}});return r&&r.no;};"
    "const reopen=async(no)=>{await go('/ops/applications');await go('/ops/applications/'+no);};"
    "const setvals=async(no,i,kv)=>{for(const k of Object.keys(kv)) await area('setValue',{no:no,i:i,k:k,v:kv[k]});};"
    "const cfm=(r)=>{const c=r.find(x=>x.k==='check');return c;};"
    "const mkch=async(a)=>{const r=await dom('apply','submitChange',Object.assign({accountId:a.corpId,name:'中村 里奈',startCycle:'2026-11',request:[['変更したいこと',a.ask||'内容は申請のとおり'],['理由','運営の見本']]},a));return r&&r.id;};"
    "const openboard=async(no)=>{await go('/ops/applications/'+no);tab('拠点ごとの承認')&&tab('拠点ごとの承認').click();tab('法人単位の承認')&&tab('法人単位の承認').click();await sleep(600);};"
)
P_APPROVE_OPEN = "tab('拠点ごとの承認').click();await sleep(600);btn('この拠点を承認').click();await sleep(700);"
P_FILL_PLAN = "await setvals('CH-20260925-0001',0,{slot:'A3'});await reopen('CH-20260925-0001');"

CH_HEAD = [
    I("1", "ヘッダー", "Đầu trang", ".es-pagehead", "area",
      d=["パンくず：契約申請管理＞申請詳細（「契約申請管理」を押すと、この申請のタブ（契約変更／休止・解約）で一覧へ戻る）。タイトル「申請詳細 CH-YYYYMMDD-NNNN」にステータスのバッジ。", "Breadcrumb: 契約申請管理 > 申請詳細 (nhấn \"契約申請管理\" thì về danh sách ở đúng tab của đơn: 契約変更 / 休止・解約). Tiêu đề \"申請詳細 CH-YYYYMMDD-NNNN\" kèm badge trạng thái."]),
    I("1.1", "ステータスのバッジ", "Badge trạng thái", ".es-pagehead__title .es-badge", "label",
      d=["拠点ごとの承認・却下から決まる：承認待ち（黄）／対応中 n/m（青。n＝処理した拠点・m＝申請の拠点）／承認済み（緑）／一部承認（青）／却下（赤）／取り下げ済み（灰）。", "Quyết định từ kết quả duyệt / từ chối từng cơ sở: 承認待ち (vàng) / 対応中 n/m (xanh dương; n = cơ sở đã xử lý, m = cơ sở trong đơn) / 承認済み (xanh lá) / 一部承認 (xanh dương) / 却下 (đỏ) / 取り下げ済み (xám)."]),
    I("1.2", "次のタブへのボタン", "Nút sang tab tiếp theo", ".es-pagehead__actions button", "button", "click",
      cond=["処理待ちの申請のとき（処理済みは出さない）", "Khi đơn đang chờ xử lý (đã xử lý thì không hiện)"],
      d=["必須の設定が残っているとき「影響と設定へ」、そろっているとき「拠点ごとの承認へ」（法人情報の変更は「法人単位の承認へ」）。押すとそのタブを開く。", "Còn thiết lập bắt buộc thì \"影響と設定へ\", đủ rồi thì \"拠点ごとの承認へ\" (thay đổi pháp nhân là \"法人単位の承認へ\"). Nhấn để mở tab tương ứng."]),
    I("2", "タブ", "Tab", ".ptabs .es-tabs", "tab", "click", pattern="P-TAB",
      d=["4つ固定：申請内容／変更される項目／影響と設定／拠点ごとの承認（法人情報の変更は「法人単位の承認」）。「影響と設定」は必須の設定が残る拠点の数を「（要入力）n」で、承認のタブは処理待ちの拠点の数を出す。別の申請を開いたら申請内容のタブから。", "4 tab cố định: 申請内容 / 変更される項目 / 影響と設定 / 拠点ごとの承認 (thay đổi pháp nhân: 法人単位の承認). \"影響と設定\" hiện số cơ sở còn thiết lập bắt buộc dạng \"（要入力）n\", tab duyệt hiện số cơ sở chờ xử lý. Mở đơn khác thì bắt đầu từ tab 申請内容."],
      demo_ok=["P-TAB は URL（?tab=）にタブを持つ決まり。コードは画面のメモリに持つ", "P-TAB quy định giữ tab trên URL (?tab=). Code giữ trong bộ nhớ trang"]),
]
CH_INFO = [
    I("3", "申請情報", "Thông tin đơn", ".card h2::申請情報^", "area",
      d=["申請の基本。すべて読むだけ。", "Thông tin cơ bản của đơn. Chỉ đọc."]),
    I("3.1", "申請の種類", "Loại đơn", ".es-field::申請の種類", "label", d=["プランの変更／配送の変更／設備の変更／拠点情報の変更／法人情報の変更／休止／再開／解約（バッジ）。", "プランの変更 / 配送の変更 / 設備の変更 / 拠点情報の変更 / 法人情報の変更 / 休止 / 再開 / 解約 (badge)."]),
    I("3.2", "法人", "Pháp nhân", ".es-field::法人", "label", d=["法人名と法人ID（CU＋5桁）。", "Tên pháp nhân và ID pháp nhân (CU + 5 chữ số)."]),
    I("3.3", "申請者", "Người nộp đơn", ".es-field::申請者", "label", d=["申請した人の名前。法人Web からの申請は名前のあとに「（法人Web）」、運営の代理入力は付けない（一覧に「代理入力」の印が出る）。", "Tên người nộp đơn. Đơn từ Web pháp nhân có \"（法人Web）\" sau tên; đơn nhập hộ của vận hành thì không có (danh sách hiện dấu \"代理入力\")."]),
    I("3.4", "申請日", "Ngày nộp đơn", ".es-field::申請日", "label", d=["yyyy-mm-dd。", "yyyy-mm-dd."]),
    I("3.5", "開始", "Bắt đầu", ".es-field::開始", "label", d=["変更が効き始める時期。サイクル月（例 2026-11サイクル）。法人情報の変更は「承認後すぐ（未発行の請求書から）」、解約は「最後のサイクル 2026年10月」。", "Thời điểm thay đổi có hiệu lực. Chu kỳ tháng (vd. 2026-11サイクル). Thay đổi pháp nhân là \"承認後すぐ（未発行の請求書から）\", hủy là \"最後のサイクル 2026年10月\"."]),
    I("4", "お客様の申請内容", "Nội dung khách đã nộp", ".card h2::お客様の申請内容^", "area",
      d=["法人Web で入力された内容を、そのまま並べて読むだけで見せる（法人Web での入力欄と同じ項目名。項目は申請の種類で変わる）。", "Hiển thị nguyên nội dung nhập ở Web pháp nhân, chỉ đọc (tên mục giống ô nhập ở Web pháp nhân; mục thay đổi theo loại đơn)."]),
    I("4.1", "対象の拠点", "Cơ sở đối tượng", ".es-field::対象の拠点", "label", d=["申請の対象の拠点。複数拠点の申請は「・」でつなぐ。", "Cơ sở đối tượng của đơn. Đơn nhiều cơ sở nối bằng \"・\"."]),
    I("4.2", "申請の項目", "Các mục của đơn", ".apx-narrow > .card:nth-child(3) .es-formgrid", "area",
      d=["プランの変更＝変更したいこと・変更後のプラン・開始したいサイクル月・理由、配送の変更＝配送方法など、休止＝休止の期間・再開予定月・理由、解約＝解約をご希望の日・残った商品（在庫）の扱い・理由、など。法人Web の申請フォーム（法人B の設計書）と同じ項目名。", "Đổi gói = nội dung muốn đổi, gói mới, chu kỳ muốn bắt đầu, lý do; giao hàng = phương thức giao...; tạm ngưng = thời gian, tháng mở lại, lý do; hủy = ngày muốn hủy, cách xử lý hàng tồn, lý do... Tên mục giống form đơn ở Web pháp nhân (tài liệu 法人B)."]),
]
CH_CHG = [
    I("5", "変更される項目", "Các mục sẽ thay đổi", ".card h2::変更される項目^", "area",
      d=["法人画面の項目名で、変わる行だけを出す。拠点が複数の申請は拠点ごとに見出し（拠点名・ID・月額への影響のバッジ）を付ける。", "Chỉ hiện các dòng sẽ đổi, theo tên mục của màn hình pháp nhân. Đơn nhiều cơ sở có tiêu đề riêng cho mỗi cơ sở (tên, ID, badge ảnh hưởng đến tiền tháng)."]),
    I("5.1", "法人画面を開く", "Mở màn hình pháp nhân", ".card h2 a::法人画面を開く", "link", "click",
      d=["法人・拠点・契約の画面（運営の法人一覧など）を開く。", "Mở màn hình pháp nhân / cơ sở / hợp đồng của vận hành."]),
    I("5.2", "変更の表", "Bảng thay đổi", ".apx-chg", "table",
      d=["列：画面 ＞ 項目（押すと該当の法人・拠点・子契約の画面へ）・変更前・変更後・いつから。プランの変更は行の下に月額（税抜）の合計の行を出す。", "Cột: màn hình > mục (nhấn để mở màn pháp nhân / cơ sở / hợp đồng con tương ứng), trước, sau, từ khi nào. Đổi gói có thêm dòng tổng tiền tháng (chưa thuế) bên dưới."]),
    I("5.3", "変更前", "Trước thay đổi", ".apx-chg th::変更前", "label", d=["申請のときの今の値。", "Giá trị hiện tại lúc nộp đơn."]),
    I("5.4", "変更後", "Sau thay đổi", ".apx-chg th::変更後", "label", d=["申請された新しい値（太字）。", "Giá trị mới được yêu cầu (in đậm)."]),
    I("5.5", "いつから", "Từ khi nào", ".apx-chg th::いつから", "label", d=["効き始める時期（例 2026-11 以降）。", "Thời điểm có hiệu lực (vd. từ 2026-11)."]),
]
CH_IMP_HEAD = [
    I("6", "拠点ごとのカード", "Thẻ theo từng cơ sở", CARD + ":nth-child(2)", "area",
      d=["拠点（法人情報の変更は法人）ごとに1枚。見出し：拠点名・ID（拠点ID ／ 親契約番号）・設定の状態のバッジ。", "Mỗi cơ sở (thay đổi pháp nhân thì mỗi pháp nhân) một thẻ. Tiêu đề: tên cơ sở, ID (ID cơ sở / mã hợp đồng cha), badge tình trạng thiết lập."]),
    I("6.1", "設定の状態のバッジ", "Badge tình trạng thiết lập", CARD + ":nth-child(2) h2 .es-badge", "label",
      d=["「要入力」（黄）＝必須の設定が残っている／「設定済み」（緑）／「設定なし」（灰）＝その申請に承認の前にする設定がない。", "\"要入力\" (vàng) = còn thiết lập bắt buộc / \"設定済み\" (xanh) / \"設定なし\" (xám) = đơn này không có thiết lập cần làm trước khi duyệt."]),
    I("6.2", "承認すると動くもの（影響）", "Những gì sẽ chạy khi duyệt (ảnh hưởng)", ".apx-imp::いつ", "table",
      d=["列：項目・内容・いつ（承認と同時／承認後）。例：子契約の書き換え n件（サイクル月）、納品予定・注文 n件、設備の異動。種類ごとに行が変わる。", "Cột: mục, nội dung, khi nào (cùng lúc duyệt / sau duyệt). Vd. ghi lại hợp đồng con n bản (các tháng), lịch giao・đơn đặt n bản, chuyển dịch thiết bị. Dòng thay đổi theo loại đơn."]),
]
CH_BILLED = I("6.3", "請求済みの月にかかる差額", "Chênh lệch của các tháng đã xuất hóa đơn", ".es-table-wrap::差額（税抜）", "table",
              d=["請求書を発行済みの月に差額が出るとき、承認で調整明細を自動で作り、次の請求書に1行ずつ載せる（日割りなし・サイクル月ごとの満額の差）。列：サイクル月・請求書・請求した額・変更後の額・差額（税抜）。ないときは「請求済みの月はありません（調整明細は作りません）」。", "Khi tháng đã xuất hóa đơn có chênh lệch, duyệt sẽ tự tạo dòng điều chỉnh và đưa vào hóa đơn kế tiếp, mỗi dòng một tháng (không tính theo ngày, chênh lệch đủ tháng). Cột: chu kỳ, hóa đơn, số tiền đã xuất, số tiền sau đổi, chênh lệch (chưa thuế). Không có thì hiện \"請求済みの月はありません（調整明細は作りません）\"."])
CH_LOCKED = [
    I("6.4", "確定済みの月（ロック中）", "Tháng đã chốt (đang khóa)", ".secttl::確定済みの月（ロック中）", "label",
      d=["請求の画面で確定済み（まだ発行していない）の月は、承認しても変えない。承認前は黄色の注記「n サイクルは請求の画面で確定済みのため、承認しても変えません（反映待ちに残ります）」、承認後は表（サイクル月・請求の状態・操作）に「反映」「反映しない」（確定解除してあれば反映できる。なければ「確定解除へ」のリンク）。運営のダッシュボードにも出る。", "Tháng đã chốt ở màn Thanh toán (chưa xuất hóa đơn) thì duyệt cũng không đổi. Trước duyệt: ghi chú vàng \"... đã chốt nên không đổi (để lại chờ phản ánh)\"; sau duyệt: bảng (chu kỳ, trạng thái, thao tác) có \"反映\" / \"反映しない\" (hủy chốt rồi mới phản ánh được, chưa thì link \"確定解除へ\"). Cũng hiện ở dashboard."],
      ),
]
CH_EQUIP = [
    I("6.5", "設備の異動の案", "Phương án chuyển dịch thiết bị", ".secttl::設備の異動の案", "area",
      d=["プランの変更・設備の変更だけに出す。今の貸出とプランの標準貸出設備を比べた案（入替＝大きいサイズへ・追加・回収）。承認すると、この案で貸出と子契約の費用を変える。回収の配送はシステムでは作らない（回収したら貸出を「回収済」にする）。バッジ：自動の案／運営が直した案／未保存。", "Chỉ hiện với đổi gói / đổi thiết bị. Phương án so sánh thiết bị đang cho thuê với thiết bị cho thuê tiêu chuẩn của gói (đổi = sang cỡ lớn hơn, thêm, thu hồi). Khi duyệt sẽ đổi cho thuê và chi phí hợp đồng con theo phương án này. Hệ thống không tạo lịch giao thu hồi (thu hồi xong đổi trạng thái thành 回収済). Badge: 自動の案 / 運営が直した案 / 未保存."]),
    I("6.5.1", "設備の異動の表", "Bảng chuyển dịch thiết bị", ".es-table-wrap::異動後の機種", "table",
      d=["列：区分・異動（継続／入替／追加／回収。選択）・今の機種（貸出ID）・異動後の機種（選択。月額つき）・台数・メモ。冷蔵庫・冷凍庫の行を足すボタンがある。", "Cột: loại, chuyển dịch (継続 / 入替 / 追加 / 回収; chọn), thiết bị hiện tại (ID cho thuê), thiết bị sau chuyển (chọn, kèm tiền tháng), số lượng, ghi chú. Có nút thêm dòng tủ lạnh / tủ đông."]),
    I("6.5.2", "費用の案の表", "Bảng phương án chi phí", ".es-table-wrap::金額（税抜）", "table",
      d=["列：請求（チェック）・費目・金額（税抜）・単発／月額・根拠。例：設備配送料・冷凍庫の賃料。下に「合計（請求する分・税抜）」。承認の前に金額・単発／月額を直せる。", "Cột: xuất hóa đơn (checkbox), khoản mục, số tiền (chưa thuế), một lần / hàng tháng, căn cứ. Vd. phí giao thiết bị, tiền thuê tủ đông. Dòng cuối \"合計（請求する分・税抜）\". Có thể sửa số tiền và loại trước khi duyệt."]),
    I("6.5.3", "メモ（運営だけ）", "Ghi chú (chỉ vận hành)", ".es-field::メモ（運営だけ）", "textarea", "input", req="－", len=["文字列 500（複数行）", "Chuỗi 500 (nhiều dòng)"],
      ex=["エレベーターなし3階のため入れ替えの配送 +3,000円", "Ghi chú nội bộ về phí / điều kiện giao"], err=["E04"],
      d=["運営だけが見るメモ。", "Ghi chú chỉ vận hành xem."]),
    I("6.5.4", "行から費用の案を作り直す", "Tạo lại phương án chi phí từ các dòng", ".es-btn::行から費用の案を作り直す", "button", "click",
      cond=["設備の異動の案の編集の権限", "Quyền sửa phương án chuyển dịch thiết bị"],
      d=["今の行から、設備配送料・賃料などの費用の案を作り直して保存する。", "Tạo lại phương án chi phí (phí giao thiết bị, tiền thuê...) từ các dòng hiện tại rồi lưu."]),
    I("6.5.5", "案を保存", "Lưu phương án", ".es-btn::案を保存", "button", "click",
      cond=["変更があるとき・設備の異動の案の編集の権限", "Khi có thay đổi・quyền sửa phương án"], err=["S01"],
      d=["直した行・費用・メモを保存する（承認のときこの案で貸出と費用を変える）。", "Lưu dòng, chi phí, ghi chú đã sửa (khi duyệt sẽ đổi cho thuê và chi phí theo phương án này)."]),
]
CH_MAIL = I("6.6", "承認すると送るメール", "Email gửi khi duyệt", "details::承認すると送るメール", "area",
            d=["お客様あて（拠点のメイン担当者と申請した方）のメールの文面例（Message List メール No.10。解約は No.16 も）。折りたたみで読むだけ。文面の正は Message List の Excel。", "Ví dụ nội dung email gửi cho khách (người phụ trách chính của cơ sở và người nộp đơn; Message List mail No.10, hủy có thêm No.16). Gập mở, chỉ đọc. Nội dung chuẩn là file Excel Message List."])
def CH_SET(*items):
    """承認の前にする設定（種類ごとの項目）"""
    return [I("6.7", "承認の前にする設定", "Thiết lập cần làm trước khi duyệt", ".secttl::承認の前にする設定", "area", pattern="P-FORM",
              d=["種類ごとの設定を拠点ごとに入れる。入れた値はその場で保存する（画面の保存ボタンはない）。必須の設定がそろうまで、その拠点は承認できない（E101）。処理済みの拠点は参照だけ。", "Nhập thiết lập theo loại đơn cho từng cơ sở. Giá trị nhập được lưu ngay (màn hình không có nút lưu). Chưa đủ thiết lập bắt buộc thì cơ sở đó chưa duyệt được (E101). Cơ sở đã xử lý chỉ xem."],
              err=["E101"],
              demo_ok=["P-FORM は詳細を表示だけにし保存は画面の上の1つにする決まり。この画面は承認の前の設定を入れるとすぐ保存する（承認の流れの一部のため。台帳 F の例外として hong に確認）", "P-FORM quy định chi tiết chỉ để xem và lưu bằng 1 nút ở đầu trang. Màn này lưu ngay khi nhập thiết lập (vì là một phần của luồng duyệt; cần hỏi hong có coi là ngoại lệ của 台帳 F)"])] + list(items)

def SETI(no, ja, vi, key, kind, trig, ex, dj, dv, req="－", **kw):
    return I(no, ja, vi, ".es-field::" + key if kind != "check" else ".es-check::" + key, kind, trig, req=req, ex=ex, d=[dj, dv], **kw)

CH_BOARD = [
    I("7", "承認の欄", "Khu vực duyệt", "#apxboard", "area",
      d=["拠点ごと（法人情報の変更は法人1件）に承認・却下する。承認・却下はその場で確定し、やり直しはない（直すときは新しい申請を代理入力する・台帳 B）。自己承認可（台帳 E）。見出しの右に申請のステータスのバッジ。", "Duyệt / từ chối theo từng cơ sở (thay đổi pháp nhân: một pháp nhân). Duyệt / từ chối có hiệu lực ngay, không có \"làm lại\" (muốn sửa thì nhập hộ đơn mới; 台帳 B). Cho phép tự duyệt (台帳 E). Bên phải tiêu đề có badge trạng thái đơn."]),
    I("7.1", "オーダー締切の表示", "Hiển thị hạn chót đặt hàng", "#apxboard .es-inline", "label", err=["I102", "W100"],
      cond=["処理待ちの申請で、締切のある種類（法人情報の変更は出さない）", "Đơn chờ xử lý có hạn chót (thay đổi pháp nhân thì không hiện)"],
      d=["締切の前は I102「オーダー締切（日付）まであと n日です」（3日以内は黄、それ以外は青）、過ぎていれば W100 の説明（赤）。過ぎてから承認するときは、承認ダイアログで開始月の扱いを2択から選ぶ。", "Trước hạn: I102 \"còn n ngày đến hạn chót\" (trong 3 ngày thì vàng, còn lại xanh); quá hạn thì giải thích theo W100 (đỏ). Duyệt sau hạn thì chọn cách xử lý tháng bắt đầu ở hộp thoại duyệt."]),
    I("7.2", "この申請で影響する範囲", "Phạm vi ảnh hưởng của đơn này", "#apxboard details::この申請で影響する範囲", "area",
      d=["折りたたみ。申請の種類ごとの共通のルール（請求・配送・設備・オーダーなど）を読むだけで見せる。", "Gập mở. Hiển thị các quy tắc chung theo loại đơn (thanh toán, giao hàng, thiết bị, đơn đặt...), chỉ đọc."]),
    I("7.3", "承認の表", "Bảng duyệt", "#apxboard .es-table", "table",
      d=["列：拠点（名前・ID）・変更の内容・月額への影響（税抜。右寄せ）・状態・操作。解約は変更の内容の下に解約日と最短の解約日。", "Cột: cơ sở (tên, ID), nội dung thay đổi, ảnh hưởng tiền tháng (chưa thuế; căn phải), trạng thái, thao tác. Hủy hợp đồng có thêm ngày hủy và ngày hủy sớm nhất dưới nội dung."]),
    I("7.4", "状態", "Trạng thái", "#apxboard .es-table td .es-badge", "label",
      d=["承認待ち（黄）／✓ 承認済み（緑。締切後は開始月の扱いも）／却下（赤。理由も）／取り下げ済み（灰）。", "承認待ち (vàng) / ✓ 承認済み (xanh; sau hạn có cả cách xử lý tháng bắt đầu) / 却下 (đỏ; kèm lý do) / 取り下げ済み (xám)."]),
    I("7.5", "却下", "Từ chối", "#apxboard .apx-ops button::却下", "button", "click", pattern="P-FORM",
      cond=["処理待ちの拠点・却下の権限（機能ごとの操作＝フル権限・システム管理・CS の R/U）", "Cơ sở chờ xử lý・quyền từ chối (thao tác theo chức năng = フル権限・システム管理・CS có R/U)"],
      d=["却下モーダル（No.9）を開く。承認できない拠点にも常に出す。", "Mở hộp thoại từ chối (No.9). Luôn hiện, kể cả với cơ sở không duyệt được."]),
    I("7.6", "この拠点を承認", "Duyệt cơ sở này", "#apxboard .apx-ops button::を承認", "button", "click", err=["Q100", "S100", "E103"],
      cond=["必須の設定がそろい、承認できない理由がないとき・承認の権限（法人情報の変更は「法人の変更を承認」）", "Khi đủ thiết lập bắt buộc và không có lý do chặn・quyền duyệt (thay đổi pháp nhân: \"法人の変更を承認\")"],
      d=["承認ダイアログ（No.8）を開く。承認できない理由があるときは、ボタンを無効にして理由を赤字で下に出す（No.7.8）。", "Mở hộp thoại duyệt (No.8). Có lý do chặn thì vô hiệu hóa nút và hiện lý do bằng chữ đỏ bên dưới (No.7.8)."]),
    I("7.7", "影響と設定を入力", "Nhập 影響と設定", "#apxboard .apx-ops button::影響と設定を入力", "button", "click", err=["E101"],
      cond=["必須の設定が残っているとき（承認ボタンの代わりに出る）", "Khi còn thiết lập bắt buộc (thay cho nút duyệt)"],
      d=["「影響と設定」のタブへ移る。入力するまで承認できない。", "Chuyển sang tab 影響と設定. Chưa nhập thì chưa duyệt được."]),
    I("7.8", "承認できない理由", "Lý do không duyệt được", "#apxboard .apx-ops .mm", "label", err=["E105", "E106", "E107", "E108"],
      d=["休止の通算が12ヶ月を超える（E105）・自販機の拠点を COOL便へ（E106）・現場調査が「設置できない」（E107）・最短の解約日より前（E108）のとき、承認を無効にして理由を出す。この場合は却下して案内する。", "Khi tạm ngưng quá 12 tháng cộng dồn (E105), cơ sở máy bán hàng tự động sang COOL便 (E106), khảo sát hiện trường \"không lắp được\" (E107), hoặc trước ngày hủy sớm nhất (E108) thì vô hiệu hóa nút duyệt và hiện lý do. Trường hợp này hãy từ chối và hướng dẫn."]),
    I("7.9", "すべて処理したときの案内", "Thông báo khi đã xử lý hết", "#apxboard .es-inline", "label", err=["S100"],
      d=["全拠点を処理したら「すべての拠点を処理しました（状態）。承認した拠点へ反映のお知らせ、却下した拠点へ理由つきのお知らせを送りました」。", "Khi xử lý hết các cơ sở: \"Đã xử lý toàn bộ cơ sở (trạng thái). Đã gửi thông báo phản ánh cho cơ sở được duyệt, thông báo kèm lý do cho cơ sở bị từ chối\"."]),
]
CH_BOARD_CORP = [
    I("7.10", "法人単位の承認", "Duyệt theo pháp nhân", "#apxboard .es-inline", "label",
      d=["法人情報の変更は拠点ごとではなく、法人1件として承認・却下する（承認すると法人全体に反映。法人へお知らせメールは1通）。タブ名も「法人単位の承認」。", "Thay đổi thông tin pháp nhân không duyệt theo cơ sở mà duyệt / từ chối theo 1 pháp nhân (duyệt thì phản ánh toàn pháp nhân; gửi 1 email thông báo). Tên tab cũng là \"法人単位の承認\"."]),
]
CH_APPROVE = [
    I("8", "承認ダイアログ", "Hộp thoại duyệt", ".es-dialog__panel", "modal", "show", err=["Q100"],
      d=["Q100：「{拠点名} の {申請の種類} を承認しますか？」。変更の内容・承認すると動くもの・請求済み／確定済みの月・承認の前にした設定を、読むだけで並べて見せる。承認すると、法人へこの拠点のお知らせメールを1通送る（法人情報の変更は法人単位で1通）。", "Q100: \"Duyệt {loại đơn} của {cơ sở}?\". Hiển thị chỉ đọc: nội dung thay đổi, những gì sẽ chạy, tháng đã xuất / đã chốt, thiết lập đã làm. Khi duyệt gửi 1 email thông báo cho pháp nhân (thay đổi pháp nhân: 1 email theo pháp nhân)."]),
    I("8.1", "承認すると動くもの", "Những gì sẽ chạy khi duyệt", ".es-dialog__body .es-table::いつ", "table",
      d=["「影響と設定」の表と同じ内容。解約は解約日の判定と委託配送会社への通知の文面例も出す。", "Cùng nội dung với bảng ở tab 影響と設定. Hủy hợp đồng có thêm phán định ngày hủy và ví dụ thông báo cho công ty vận chuyển."]),
    I("8.2", "移行割（DC000021）を付ける", "Áp dụng giảm giá chuyển đổi (DC000021)", ".es-dialog__body label::移行割", "check", "check", req="－", init=["チェックあり", "Có tích"],
      ex=["チェックを外す", "Bỏ tích để không áp dụng giảm giá chuyển đổi"],
      cond=["旧ライト→スタンダードの移行の申請のときだけ", "Chỉ khi đơn là chuyển từ Lite cũ sang Standard"],
      d=["あらかじめチェック済み。運営が外せる（外すと移行割だけ付けない。ほかの費目は変わらない）。台帳 B「承認画面であらかじめチェック・運営は外せる」。", "Mặc định đã tích. Vận hành bỏ tích được (bỏ thì chỉ không áp dụng giảm giá chuyển đổi, các khoản khác không đổi). 台帳 B."]),
    I("8.3", "承認の前にした設定", "Thiết lập đã làm trước khi duyệt", ".es-dialog__body .secttl::承認の前にした設定", "label",
      d=["「影響と設定」で入れた設定の要約（設定・内容の表）。確認済みのチェックは「確認済み」と出す。", "Tóm tắt thiết lập đã nhập ở 影響と設定 (bảng thiết lập, nội dung). Mục checkbox đã xác nhận hiện \"確認済み\"."]),
    I("8.4", "適用範囲", "Phạm vi áp dụng", ".es-dialog__body .es-field::適用範囲", "select", "select", req="－", len=["選択（この子契約以降すべて／この子契約だけ）", "Chọn (từ hợp đồng con này trở đi / chỉ hợp đồng con này)"], init=["この子契約以降すべて", "Từ hợp đồng con này trở đi"],
      ex=["この子契約だけ", "Chọn phạm vi áp dụng"],
      cond=["プランの変更のとき", "Khi đơn đổi gói"],
      d=["子契約の保存の適用範囲と同じ。未確定の n件・確定・請求済みは直さない。", "Giống phạm vi áp dụng khi lưu hợp đồng con. Không sửa bản đã chốt / đã xuất hóa đơn."]),
    I("8.5", "開始月の扱い", "Cách xử lý tháng bắt đầu", ".es-dialog__body .es-field::開始月の扱い", "select", "select", req="○", len=["選択（翌サイクルへ繰り下げ／運営が代理でオーダー）", "Chọn (dời sang chu kỳ sau / vận hành đặt hộ)"], init=["開始月を翌サイクルへ繰り下げる", "Dời tháng bắt đầu sang chu kỳ sau"],
      ex=["運営が代理でオーダーする（今月分）", "Chọn 1 trong 2"], err=["W100"],
      cond=["オーダー締切を過ぎているとき（冷蔵庫→自販機は開始月を別に選ぶ）", "Khi đã quá hạn chót đặt hàng (tủ lạnh → máy bán hàng tự động thì chọn tháng bắt đầu riêng)"],
      d=["W100。繰り下げる＝開始サイクル月を1つ後ろに直し、法人へのお知らせに書く。代理でオーダーする＝今月分は運営が代わりにオーダーを入れ、開始月は変えない。選んだ内容は承認の状態の欄とお知らせに残る（台帳 E・申込フォーム §10-5）。", "W100. Dời = đổi chu kỳ bắt đầu lùi 1 kỳ và ghi vào thông báo cho pháp nhân. Đặt hộ = vận hành đặt thay phần tháng này, không đổi tháng bắt đầu. Nội dung chọn được lưu ở cột trạng thái duyệt và thông báo (台帳 E, 申込フォーム §10-5)."]),
    I("8.6", "確認のチェック", "Checkbox xác nhận", ".es-dialog__body label::確認しました", "check", "check", req="○", init=["チェックなし", "Không tích"],
      ex=["チェックを入れる", "Phải tích trước khi duyệt"], err=["E100"],
      d=["「変更される項目・影響・設定を確認しました」。チェックしないと承認できない（E100）。解約は「違約金（設備ごとに判定して合算）を確認しました」の確認も要る。", "\"変更される項目・影響・設定を確認しました\". Không tích thì không duyệt được (E100). Hủy hợp đồng cần thêm xác nhận \"違約金（設備ごとに判定して合算）を確認しました\"."]),
    I("8.7", "確認のエラー", "Lỗi xác nhận", "#apxErr", "label", "show", err=["E100"],
      d=["確認にチェックがないとき、ダイアログの下に E100（赤）。必須の入力が空のときは「必須の項目を入力してください」。", "Chưa tích xác nhận thì hiện E100 (đỏ) ở cuối hộp thoại. Ô bắt buộc để trống thì hiện \"必須の項目を入力してください\"."]),
    I("8.8", "キャンセル", "Hủy", ".es-dialog__foot button::キャンセル", "button", "click", d=["ダイアログを閉じる。何も変えない。", "Đóng hộp thoại, không đổi gì."]),
    I("8.9", "承認する", "Duyệt", ".es-dialog__foot button::承認する", "button", "click", err=["S100", "E103", "E102", "E30"],
      d=["確認のチェックがそろっていれば承認し、S100（法人へお知らせを送る）。承認と同時に契約へ反映する（子契約・休止・親契約）。ほかの人が先に処理していたら E103。承認のとき、申請の「変更前の値」と今の子契約の値を比べ、違うときは E102 で承認を止める（TL-1）。", "Nếu đã tích xác nhận thì duyệt, hiện S100 (gửi thông báo cho pháp nhân). Cùng lúc phản ánh vào hợp đồng (hợp đồng con, tạm ngưng, hợp đồng cha). Người khác đã xử lý trước thì E103. Khi duyệt, so sánh \"giá trị trước khi đổi\" của đơn với giá trị hiện tại của hợp đồng con, khác nhau thì chặn duyệt bằng E102 (TL-1)."],
      demo_ok=["E102（変更前の値の照合）はコードに未実装（注記だけ）。台帳どおり承認を止めるように直す", "E102 (đối chiếu giá trị trước khi đổi) chưa được cài đặt trong code (chỉ có ghi chú). Sửa để chặn duyệt theo 台帳"]),
]
CH_BEFORE_NOTE = I("8.10", "変更前の値の照合の注記", "Ghi chú đối chiếu giá trị trước khi đổi", ".es-dialog__body .es-inline::変更前の値", "label", err=["E102"],
                   cond=["法人情報の変更以外", "Trừ thay đổi thông tin pháp nhân"],
                   d=["承認するとき、申請の「変更前の値」と今の子契約の値を比べる。違うときは E102「変更前の値が今の値と違います（申請時：値、今：値）。今の値を確認してから承認してください」と出して承認を止める（申請・承認 §3-6・TL-1）。", "Khi duyệt, so sánh \"giá trị trước khi đổi\" của đơn với giá trị hiện tại của hợp đồng con. Khác nhau thì hiện E102 và chặn duyệt (申請・承認 §3-6, TL-1)."],
                   demo_ok=["注記は出るが、値が違うときに止める処理がコードにない。照合と E102 を実装する", "Có ghi chú nhưng code chưa có xử lý chặn khi giá trị khác nhau. Cần cài đối chiếu và E102"])
CH_REJECT = [
    I("9", "却下モーダル", "Hộp thoại từ chối", ".es-modal__panel", "modal", "show", err=["Q101"],
      d=["Q101：「{拠点名} の申請を却下しますか？」。却下の理由は必須で、法人へ、この拠点の却下のお知らせを理由つきで送る。", "Q101: \"Từ chối đơn của {cơ sở}?\". Lý do từ chối bắt buộc; gửi cho pháp nhân thông báo từ chối của cơ sở này kèm lý do."]),
    I("9.1", "却下の理由", "Lý do từ chối", ".es-modal__panel .es-field::却下の理由", "select", "select", req="○",
      len=["選択（定型の理由 7つ）", "Chọn (7 lý do mẫu)"], init=["選択してください", "Hãy chọn"], ex=["設置条件を満たさない", "Chọn 1 trong 7 lý do mẫu"], err=["E02"],
      d=["申請内容に不備がある／設置条件を満たさない／オーダー締切に間に合わない／設備・在庫の手配ができない／配送エリア・配送ルートの都合で対応できない／契約条件（最低利用期間など）に合わない／その他（下に詳しく書く）。選ばずに「却下する」を押すと E02。", "申請内容に不備がある / 設置条件を満たさない / オーダー締切に間に合わない / 設備・在庫の手配ができない / 配送エリア・配送ルートの都合で対応できない / 契約条件（最低利用期間など）に合わない / その他（下に詳しく書く）. Không chọn mà nhấn \"却下する\" thì E02."]),
    I("9.2", "お客様へのひとこと", "Lời nhắn cho khách", ".es-modal__panel .es-field::お客様へのひとこと", "textarea", "input", req="－", len=["文字列 500（複数行）", "Chuỗi 500 (nhiều dòng)"],
      ex=["設置場所の寸法を確認のうえ、あらためてお申し込みください。", "Lời nhắn đi kèm trong thông báo từ chối"], err=["E04"],
      d=["任意。理由につけて法人へ送る。却下理由が「その他」のときは詳しい理由をここに書く。", "Tùy chọn. Gửi kèm lý do cho pháp nhân. Nếu lý do là \"その他\" thì ghi lý do chi tiết ở đây."]),
    I("9.3", "却下の理由のエラー", "Lỗi lý do từ chối", ".es-modal__panel .es-field__msg--error", "label", "show", err=["E02"],
      d=["理由を選ばずに「却下する」を押したとき、欄を赤枠にし E02（却下の理由）を出す。", "Nhấn \"却下する\" mà chưa chọn lý do thì khung đỏ và hiện E02 (却下の理由)."]),
    I("9.4", "キャンセル", "Hủy", ".es-modal__actions button::キャンセル", "button", "click", d=["閉じる。何も変えない。", "Đóng, không đổi gì."]),
    I("9.5", "却下する", "Từ chối", ".es-modal__actions button::却下する", "button", "click", err=["S100", "E103", "E02"],
      d=["理由を選んでいれば却下し、S100（法人へ理由つきのお知らせを送る）。却下した拠点は処理済み（やり直しはない）。", "Đã chọn lý do thì từ chối, hiện S100 (gửi cho pháp nhân thông báo kèm lý do). Cơ sở bị từ chối là đã xử lý (không làm lại)."]),
]

# ---- 承認の前にする設定（種類ごと。lib/ops/applications/logic.ts setItems）
SETS = {
    "cnt": SETI("6.7.1", "配送回数（新しいプランで）", "Số lần giao (theo gói mới)", "配送回数（新しいプランで）", "select", "select", ["3回", "Chọn 1〜4 lần"],
                "選択（1回〜4回）。プラン標準を超えた分は、配送回数追加（A型オプション OP000001）として子契約の①に自動で立つ。", "Chọn (1〜4 lần). Phần vượt chuẩn của gói tự động được tính thành tùy chọn thêm lượt giao (loại A, OP000001) ở mục ① của hợp đồng con.", len=["選択（1回／2回／3回／4回）", "Chọn (1 / 2 / 3 / 4 lần)"], init=["3回", "3 lần"]),
    "slot": SETI("6.7.2", "納品サイクルの枠", "Khung chu kỳ giao hàng", "納品サイクルの枠", "text", "input", ["A3", "Khung giao theo tuần A〜D × thứ trong tuần (vd. A3)"],
                 "配送回数の分だけ入れる（例 A3 ／ B5 ／ C3）。納品不可曜日の列は選べない。入れるまで承認できない。", "Nhập đủ số lần giao (vd. A3 / B5 / C3). Không chọn cột thứ không giao được. Chưa nhập thì chưa duyệt được.", req="○", len="文字列 60", err=["E01", "E04"]),
    "eq": SETI("6.7.3", "設備の入替（サイズアップ）", "Đổi thiết bị (tăng cỡ)", "設備の入替（サイズアップ）", "select", "select", ["必要（設備の異動：機種変更）", "Chọn 不要 / 必要"],
               "選択（不要／必要（設備の異動：機種変更））。必要なら設備の異動の案（No.6.5）の行を直す。", "Chọn (不要 / 必要（設備の異動：機種変更）). Nếu cần thì sửa các dòng ở phương án chuyển dịch thiết bị (No.6.5).", len=["選択（不要／必要）", "Chọn (không cần / cần)"], init=["不要", "Không cần"]),
    "eqd": SETI("6.7.4", "設備の搬入予定日（入替が必要なとき）", "Ngày dự kiến giao thiết bị (khi cần đổi)", "設備の搬入予定日（入替が必要なとき）", "date", "input", ["2026-10-25", "Ngày giao thiết bị vào"],
                "入替が必要なときに入れる日付（yyyy-mm-dd）。", "Ngày (yyyy-mm-dd) nhập khi cần đổi thiết bị.", len="日付"),
    "qt": SETI("6.7.5", "委託配送先への見積依頼（任意）", "Yêu cầu báo giá cho công ty giao hàng ủy thác (tùy chọn)", "委託配送先への見積依頼（任意）", "select", "select", ["DE00001 栄成ロジ（関東・中部／月〜土）", "Chọn công ty hoặc \"依頼しない\""],
               "選択（依頼しない／委託配送先マスタの対応エリア・曜日で絞った会社）。対応できるか・金額を委託配送先Web で聞く。回答期限は2営業日。見積は必須ではなく、回答を待たずに承認できる（STEP4 A1＝お客様回答 2026-10-01）。", "Chọn (không yêu cầu / công ty đã lọc theo vùng và thứ phụ trách ở bảng công ty ủy thác). Hỏi khả năng và giá trên Web công ty giao hàng ủy thác. Hạn trả lời 2 ngày làm việc. Không bắt buộc, không cần chờ trả lời vẫn duyệt được (khách trả lời STEP4 A1, 2026-10-01).", len=["選択（依頼しない／会社）", "Chọn (không yêu cầu / công ty)"], init=["依頼しない", "Không yêu cầu"],
               open=["見積依頼の宛先の選択肢（QT_OPTS）は固定の見本。委託配送先マスタ（運営H）から作る", "Lựa chọn người nhận yêu cầu báo giá (QT_OPTS) là dữ liệu mẫu cố định. Cần lấy từ bảng công ty giao hàng ủy thác (運営H)"], ask="運営H（委託配送先マスタ）"),
    "svd": SETI("6.7.6", "現場調査日", "Ngày khảo sát hiện trường", "現場調査日", "date", "input", ["2026-10-20", "Ngày đã khảo sát"], "冷蔵庫→自販機の申請のときだけ。現場調査をした日（必須）。", "Chỉ với đơn tủ lạnh → máy bán hàng tự động. Ngày đã khảo sát hiện trường (bắt buộc).", req="○", len="日付", err=["E01"]),
    "svr": SETI("6.7.7", "現場調査の結果", "Kết quả khảo sát hiện trường", "現場調査の結果", "select", "select", ["設置できる", "Chọn 設置できる / 設置できない"], "選択（設置できる／設置できない）。「設置できない」なら承認できない（E107）。却下の理由は「設置条件を満たさない」（台帳 B）。", "Chọn (lắp được / không lắp được). \"Không lắp được\" thì không duyệt (E107). Lý do từ chối là \"設置条件を満たさない\" (台帳 B).", req="○", len=["選択（設置できる／設置できない）", "Chọn (lắp được / không lắp được)"], err=["E02", "E107"]),
    "svm": SETI("6.7.8", "現場調査のメモ", "Ghi chú khảo sát hiện trường", "現場調査のメモ", "text", "input", ["3階給湯室・電源あり・エレベーターで搬入可", "Vị trí đặt, nguồn điện, đường vận chuyển"], "設置場所・電源・搬入経路などのメモ（任意）。添付はあとで足す。", "Ghi chú về vị trí đặt, nguồn điện, đường vận chuyển (tùy chọn). Đính kèm sẽ bổ sung sau.", len="文字列 500", err=["E04"]),
    "rt": SETI("6.7.9", "配送ルートを確認した", "Đã xác nhận tuyến giao hàng", "配送ルート（倉庫・運送会社・納品会社）を確認した", "check", "check", ["チェックを入れる", "Tích sau khi đã kiểm tra"], "配送の変更のとき必須。倉庫・運送会社・納品会社を確認したらチェックする。", "Bắt buộc với đơn đổi giao hàng. Tích sau khi kiểm tra kho, công ty vận chuyển, công ty giao hàng.", req="○", init=["チェックなし", "Không tích"]),
    "from1": SETI("6.7.10", "変更後の最初の納品日", "Ngày giao đầu tiên sau thay đổi", "変更後の最初の納品日", "date", "input", ["2026-11-04", "Ngày giao đầu tiên theo tuyến mới"], "この日以降の配送データを、変更後の配送ルートで作り直す。", "Từ ngày này tạo lại dữ liệu giao hàng theo tuyến mới.", req="○", len="日付", err=["E01"]),
    "from2": SETI("6.7.11", "再開後の最初の納品日", "Ngày giao đầu tiên sau mở lại", "再開後の最初の納品日", "date", "input", ["2027-01-12", "Ngày giao đầu tiên sau khi mở lại"], "再開のサイクルから納品予定を作り直すときの、最初の納品日。", "Ngày giao đầu tiên khi tạo lại lịch giao từ chu kỳ mở lại.", req="○", len="日付", err=["E01"]),
    "from3": SETI("6.7.12", "新しい住所で配送する最初の納品日", "Ngày giao đầu tiên tại địa chỉ mới", "新しい住所で配送する最初の納品日", "date", "input", ["2026-11-10", "Ngày bắt đầu giao tại địa chỉ mới"], "この日以降の配送データを、新しい住所・配送ルートで作り直す。配送データ化済み・出荷指示済みの分は自動で変えず、運営スケジュールで直す。", "Từ ngày này tạo lại dữ liệu giao hàng theo địa chỉ và tuyến mới. Phần đã tạo dữ liệu giao / đã ra lệnh xuất không tự đổi, sửa ở lịch vận hành.", req="○", len="日付", err=["E01"]),
    "sd": SETI("6.7.13", "設備の送付（搬入）予定日", "Ngày dự kiến gửi (giao) thiết bị", "設備の送付（搬入）予定日", "date", "input", ["2026-10-25", "Ngày giao thiết bị"], "設備の変更のとき必須。設備手配のリードタイムは1週間程度。", "Bắt buộc với đơn đổi thiết bị. Thời gian chuẩn bị thiết bị khoảng 1 tuần.", req="○", len="日付", err=["E01"]),
    "sc": SETI("6.7.14", "設備を運ぶ運送会社", "Công ty vận chuyển thiết bị", "設備を運ぶ運送会社", "select", "select", ["ヤマト運輸", "Chọn 1 công ty"], "選択（運送会社・委託配送会社・自社便）。", "Chọn (công ty vận chuyển / ủy thác / xe công ty).", len=["選択（運送会社）", "Chọn (công ty vận chuyển)"], init=["ヤマト運輸", "ヤマト運輸 (Yamato)"],
               open=["運送会社の選択肢（CARS）は固定の見本。配送会社マスタから作る", "Lựa chọn công ty vận chuyển (CARS) là dữ liệu mẫu cố định. Cần lấy từ bảng công ty vận chuyển"], ask="運営H・D（運送会社・委託配送先）"),
    "rd": SETI("6.7.15", "回収（引揚）予定日", "Ngày dự kiến thu hồi", "回収（引揚）予定日（回収があるとき）", "date", "input", ["2026-11-02", "Ngày thu hồi thiết bị cũ"], "回収があるときに入れる日付。", "Ngày nhập khi có thu hồi.", len="日付"),
    "op": SETI("6.7.16", "設置代行", "Dịch vụ lắp đặt hộ", "設置代行", "select", "select", ["あり（OP000007 設置代行）", "Chọn なし / あり"], "選択（なし／あり（OP000007 設置代行））。", "Chọn (không / có (OP000007 lắp đặt hộ)).", len=["選択（なし／あり）", "Chọn (không / có)"], init=["なし", "Không"]),
    "eqmv": SETI("6.7.17", "サイズアップの異動の登録", "Đăng ký chuyển dịch tăng cỡ", "冷蔵庫のサイズアップを「設備の異動（機種変更）」として登録する", "check", "check", ["チェックを入れる", "Tích sau khi đã đăng ký"], "冷蔵庫のサイズアップのときだけ。「設備の異動（機種変更）」として登録した確認（差額はオプション請求）。承認と手配は、権限のある運営管理者なら誰でもできる（特定の人の承認は不要）。", "Chỉ khi tăng cỡ tủ lạnh. Xác nhận đã đăng ký là \"chuyển dịch thiết bị (đổi model)\" (chênh lệch tính vào tùy chọn). Người quản trị vận hành có quyền nào cũng duyệt và sắp xếp được (không cần người cụ thể).", init=["チェックなし", "Không tích"]),
    "wh": SETI("6.7.18", "ピッキング倉庫（新しい住所で見直し）", "Kho lấy hàng (xem lại theo địa chỉ mới)", "ピッキング倉庫（新しい住所で見直し）", "select", "select", ["WH00001 関東倉庫", "Chọn 1 kho"], "拠点の住所の変更のときだけ。新しい住所に合わせて倉庫を見直す。", "Chỉ khi đổi địa chỉ cơ sở. Xem lại kho theo địa chỉ mới.", len=["選択（ピッキング倉庫）", "Chọn (kho lấy hàng)"], init=["WH00001 関東倉庫", "WH00001 kho Kanto"],
               open=["倉庫の選択肢は固定の見本。倉庫マスタ（運営H）から作る", "Lựa chọn kho là dữ liệu mẫu cố định. Cần lấy từ bảng kho (運営H)"], ask="運営H（倉庫マスタ）"),
    "c1": SETI("6.7.19", "運送会社", "Công ty vận chuyển", "運送会社", "select", "select", ["ヤマト運輸", "Chọn 1 công ty"], "拠点の住所の変更のときの配送ルート（運送会社）。", "Tuyến giao khi đổi địa chỉ (công ty vận chuyển).", len=["選択（運送会社）", "Chọn (công ty vận chuyển)"], init=["ヤマト運輸", "ヤマト運輸 (Yamato)"]),
    "c2": SETI("6.7.20", "納品会社", "Công ty giao hàng", "納品会社", "select", "select", ["ヤマト運輸", "Chọn 1 công ty"], "拠点の住所の変更のときの配送ルート（納品会社）。運送会社・納品会社とも常に必須（中継しないときは同じ会社を入れる）。", "Tuyến giao khi đổi địa chỉ (công ty giao hàng). Công ty vận chuyển và công ty giao hàng đều luôn bắt buộc (không trung chuyển thì nhập cùng một công ty).", len=["選択（納品会社）", "Chọn (công ty giao hàng)"], init=["ヤマト運輸", "ヤマト運輸 (Yamato)"]),
    "lead": SETI("6.7.21", "リードタイム", "Thời gian chờ giao", "リードタイム", "select", "select", ["2日", "Chọn 1〜3 ngày"], "出荷から納品までの日数（1日〜3日）。", "Số ngày từ xuất kho đến giao (1〜3 ngày).", len=["選択（1日／2日／3日）", "Chọn (1 / 2 / 3 ngày)"], init=["2日", "2 ngày"]),
    "path": SETI("6.7.22", "搬入経路の確認", "Xác nhận đường vận chuyển", "搬入経路の資料を新しい住所で確認した", "check", "check", ["チェックを入れる", "Tích sau khi đã kiểm tra"], "拠点の住所の変更のとき必須。搬入経路の資料を新しい住所で確認したらチェックする。", "Bắt buộc khi đổi địa chỉ cơ sở. Tích sau khi kiểm tra tài liệu đường vận chuyển ở địa chỉ mới.", req="○", init=["チェックなし", "Không tích"]),
    "bto": SETI("6.7.23", "請求の宛先の確認", "Xác nhận nơi nhận hóa đơn", "請求の宛先（請求書の枚数・Bill One の発行先）を確認した", "check", "check", ["チェックを入れる", "Tích sau khi đã kiểm tra"], "請求先の変更を含む拠点情報の変更のとき必須。発行済みの請求書はそのまま、未発行の分から新しい請求先へ（Bill One の発行先も）。", "Bắt buộc với đơn thông tin cơ sở có đổi nơi nhận hóa đơn. Hóa đơn đã xuất giữ nguyên, từ phần chưa xuất sẽ gửi đến nơi nhận mới (cả nơi phát hành Bill One).", req="○", init=["チェックなし", "Không tích"]),
    "bo": SETI("6.7.24", "請求書の宛先（Bill One）の手配", "Sắp xếp nơi nhận hóa đơn (Bill One)", "請求書の宛先（Bill One の発行先）を新しい内容に直す手配をした", "check", "check", ["チェックを入れる", "Tích sau khi đã sắp xếp"], "法人情報の変更で住所・電話などを直すとき必須。未発行の請求書は承認と同時に新しい内容になる（発行済みはそのまま）。Bill One の発行先は別に手配する。", "Bắt buộc khi đổi địa chỉ / điện thoại ... pháp nhân. Hóa đơn chưa xuất sẽ có nội dung mới ngay khi duyệt (đã xuất giữ nguyên). Nơi phát hành Bill One sắp xếp riêng.", req="○", init=["チェックなし", "Không tích"]),
    "peq": SETI("6.7.25", "休止中の設備", "Thiết bị trong thời gian tạm ngưng", "休止中の設備", "select", "select", ["引き揚げる", "Chọn đặt nguyên / thu hồi"], "選択（置いたまま（保管料なし）／引き揚げる）。置いたままなら休止中も購入できる（差は再開時の棚卸で精算）。引き揚げたら購入できない。", "Chọn (đặt nguyên (không phí giữ) / thu hồi). Đặt nguyên thì vẫn mua được trong thời gian tạm ngưng (chênh lệch tính khi kiểm kê lúc mở lại). Thu hồi thì không mua được.", len=["選択（置いたまま／引き揚げる）", "Chọn (đặt nguyên / thu hồi)"], init=["置いたまま（保管料なし）", "Đặt nguyên (không phí giữ)"]),
    "prd": SETI("6.7.26", "設備の引揚予定日", "Ngày dự kiến thu hồi thiết bị", "設備の引揚予定日（引き揚げるとき）", "date", "input", ["2026-11-30", "Ngày thu hồi (khi thu hồi)"], "引き揚げるときに入れる日付。", "Ngày nhập khi thu hồi.", len="日付"),
    "pdel": SETI("6.7.27", "休止期間の配送データの取り消し", "Hủy dữ liệu giao hàng trong kỳ tạm ngưng", "休止期間の配送データ（作成済み）を取り消すことを確認した", "check", "check", ["チェックを入れる", "Tích sau khi đã xác nhận"], "休止のとき必須。休止期間の納品予定・配送データ（作成済み）を取り消すことの確認（締切を過ぎたサイクルはお届けする）。", "Bắt buộc với đơn tạm ngưng. Xác nhận sẽ hủy lịch giao và dữ liệu giao hàng (đã tạo) trong kỳ tạm ngưng (chu kỳ đã quá hạn vẫn giao).", req="○", init=["チェックなし", "Không tích"]),
    "inv": SETI("6.7.28", "棚卸報告（任意）", "Báo cáo kiểm kê (tùy chọn)", "棚卸報告（任意）", "select", "select", ["スキップする（報告なしで進める）", "Chọn chờ báo cáo / bỏ qua"], "休止の始め・休止中・再開のときの棚卸報告は任意。報告がないときは「スキップ」できる（理由は必須）。スキップした区切りは管理ロス・事務手数料なし、差は次の棚卸報告で精算する（台帳 E・受付簿 No.168）。スキップを選べるのはシステム管理だけ。", "Báo cáo kiểm kê khi bắt đầu tạm ngưng / đang tạm ngưng / mở lại là tùy chọn. Không có báo cáo thì có thể \"bỏ qua\" (bắt buộc ghi lý do). Kỳ bỏ qua không tính hao hụt quản lý và phí thủ tục, chênh lệch tính ở báo cáo kiểm kê sau (台帳 E, 受付簿 No.168). Chỉ システム管理 được chọn bỏ qua.", len=["選択（報告を待つ／スキップする）", "Chọn (chờ báo cáo / bỏ qua)"], init=["報告を待つ（報告があれば精算）", "Chờ báo cáo (có báo cáo thì tính toán)"],
             demo_ok=["コードは承認できる人なら誰でもスキップを選べる。台帳どおり、システム管理だけが選べるように直す（H15）", "Code cho bất kỳ người duyệt nào chọn bỏ qua. Sửa để chỉ システム管理 chọn được theo 台帳 (H15)"]),
    "invwhy": SETI("6.7.29", "スキップの理由", "Lý do bỏ qua", "スキップの理由（スキップするときだけ必須）", "text", "input", ["お客様と相談し、報告なしで進める", "Lý do bỏ qua báo cáo kiểm kê"], "棚卸報告を「スキップする」にしたときだけ必須。", "Chỉ bắt buộc khi chọn \"スキップする\" cho báo cáo kiểm kê.", req="条件付き", len="文字列 60", err=["E01", "E04"]),
    "rrt": SETI("6.7.30", "再開の配送ルート", "Tuyến giao khi mở lại", "配送ルート", "select", "select", ["休止前と同じ", "Chọn giống trước tạm ngưng / xem lại"], "選択（休止前と同じ／見直す（子契約の配送ルートで直す））。", "Chọn (giống trước tạm ngưng / xem lại (sửa ở tuyến giao của hợp đồng con)).", len=["選択（休止前と同じ／見直す）", "Chọn (giống trước / xem lại)"], init=["休止前と同じ", "Giống trước tạm ngưng"]),
    "rsd": SETI("6.7.31", "設備の再設置日", "Ngày lắp lại thiết bị", "設備の再設置日（引き揚げていたとき）", "date", "input", ["2027-01-08", "Ngày lắp lại thiết bị đã thu hồi"], "設備を引き揚げていたときの再設置日。最低利用期間は休止前の残りを引き継ぐ。再設置費は自動では取らない（台帳 B 2026-10-06）。", "Ngày lắp lại khi trước đó đã thu hồi thiết bị. Thời gian sử dụng tối thiểu kế thừa phần còn lại trước tạm ngưng. Phí lắp lại không tự động thu (台帳 B 2026-10-06).", len="日付"),
    "last": SETI("6.7.32", "最後の納品日", "Ngày giao cuối cùng", "最後の納品日", "date", "input", ["2026-11-06", "Ngày giao hàng cuối"], "解約のとき必須。委託配送会社への通知の「最終配送日」に入る。", "Bắt buộc với đơn hủy. Điền vào \"ngày giao cuối\" trong thông báo cho công ty vận chuyển.", req="○", len="日付", err=["E01"]),
    "crd": SETI("6.7.33", "設備の引揚予定日（解約）", "Ngày dự kiến thu hồi thiết bị (hủy)", "設備の引揚予定日", "date", "input", ["2026-11-15", "Ngày thu hồi thiết bị"], "解約のとき必須。貸出を「回収予定」にする日。", "Bắt buộc với đơn hủy. Ngày chuyển cho thuê sang \"回収予定\".", req="○", len="日付", err=["E01"]),
    "pen": SETI("6.7.34", "違約金の確認", "Xác nhận tiền phạt hủy", "違約金（設備ごとに判定して合算）を確認した", "check", "check", ["チェックを入れる", "Tích sau khi đã kiểm tra"], "解約のとき必須。違約金＝回収額 × 残り月数 ÷ 最低利用期間（設備ごとに判定して合算）の目安を確認する。", "Bắt buộc với đơn hủy. Kiểm tra mức tham khảo tiền phạt = số tiền thu hồi × số tháng còn lại ÷ thời gian sử dụng tối thiểu (xét theo từng thiết bị rồi cộng).", req="○", init=["チェックなし", "Không tích"]),
}
def sets(*keys):
    return [SETS[k] for k in keys]

# ---- 種類ごとの注記・ブロック
CH_PAUSE = [
    I("10", "休止の通算", "Cộng dồn tạm ngưng", ".apx-imp::通算（承認後）／上限", "table",
      d=["休止は通算12ヶ月（1年）まで。表：休止の履歴（過去の休止と月数）・通算の休止月数・今回の休止（再開予定月）・通算（承認後）／上限・残り月数（承認前／今回を承認したあと）。再開予定月は必須で、空のまま進めない。", "Tạm ngưng tối đa 12 tháng (1 năm) cộng dồn. Bảng: lịch sử tạm ngưng (các lần trước và số tháng), tổng tháng đã tạm ngưng, lần này (tháng mở lại dự kiến), tổng (sau duyệt) / giới hạn, số tháng còn lại (trước duyệt / sau khi duyệt lần này). Tháng mở lại bắt buộc, không chọn \"chưa xác định\"."]),
    I("10.1", "通算の判定", "Phán định cộng dồn", ".secttl::休止の通算（上限は通算1年）", "label", err=["E105"],
      d=["範囲内なら青い注記「通算 n ヶ月・残り m ヶ月。上限の範囲内です」。上限の12ヶ月を超えるときは赤い注記（E105）で承認できない（お客様には解約を案内する）。", "Trong giới hạn thì ghi chú xanh \"cộng dồn n tháng, còn m tháng, trong giới hạn\". Vượt 12 tháng thì ghi chú đỏ (E105) và không duyệt được (hướng dẫn khách hủy hợp đồng)."],
      demo_ok=["超過の状態は見本データでは作れない（申請の登録のときに共通データが通算12ヶ月を超える申請を止めるため）。注記の文言は コード（PauseBlock）と E105 で確認", "Không tạo được trạng thái vượt giới hạn bằng dữ liệu mẫu (khi đăng ký đơn, dữ liệu chung đã chặn đơn vượt 12 tháng). Xác nhận câu chữ ở code (PauseBlock) và E105"]),
]
CH_CXL = [
    I("11", "解約日の判定", "Phán định ngày hủy", ".apx-imp::適用月（最短）", "table",
      d=["オーダー締切で決める（REQ-CT-257）。表：申込日・判定に使うオーダー締切（既定は前月15日。締切の前＝翌月から適用／後＝翌々月から適用）・適用月（最短）・解約日（最短＝サイクルの末日）・この申請の解約日（ルールに合う／合わない）。解約日はサイクルの終わり（日割りなし）。自販機の拠点も同じ締切。", "Quyết định theo hạn chót đặt hàng (REQ-CT-257). Bảng: ngày nộp đơn, hạn chót dùng để phán định (mặc định ngày 15 tháng trước; trước hạn = áp dụng từ tháng sau / sau hạn = áp dụng từ tháng sau nữa), tháng áp dụng (sớm nhất), ngày hủy (sớm nhất = cuối chu kỳ), ngày hủy của đơn này (đúng quy tắc / không đúng). Ngày hủy là cuối chu kỳ (không tính theo ngày). Cơ sở máy bán hàng tự động cũng cùng hạn chót."]),
    I("11.1", "解約日の判定の注記", "Ghi chú phán định ngày hủy", ".es-inline::解約日", "label", err=["E108"],
      d=["ルールに合うなら青い注記（最短の解約日以降なら承認できる）。合わないなら赤い注記（E108）で承認できない。却下して、最短の解約日以降で申し込み直すよう案内する。", "Đúng quy tắc thì ghi chú xanh (từ ngày hủy sớm nhất trở đi thì duyệt được). Không đúng thì ghi chú đỏ (E108), không duyệt được. Hãy từ chối và hướng dẫn nộp lại từ ngày hủy sớm nhất."]),
    I("11.2", "委託配送会社への通知", "Thông báo cho công ty vận chuyển ủy thác", ".secttl::委託配送会社への通知（承認すると自動で送る・REQ-CT-289）", "area",
      d=["承認すると、配送ルートの納品会社へ配送停止のお知らせを自動で送る（ES配送便＝委託ドライバーの所属会社、COOL便＝運送会社。文面例を出す）。最終配送日は「承認の前にする設定」の最後の納品日。折りたたみで宛先の書き分けと、もう一方の配送区分の文面例も読める。", "Khi duyệt, tự động gửi thông báo dừng giao đến công ty giao hàng của tuyến (ES配送便 = công ty của tài xế ủy thác, COOL便 = công ty vận chuyển; có ví dụ nội dung). Ngày giao cuối lấy từ \"ngày giao cuối\" trong thiết lập trước duyệt. Có phần gập xem cách phân đích đến và ví dụ cho loại giao hàng còn lại."]),
    I("11.3", "自社便だけの拠点の注記", "Ghi chú cơ sở chỉ dùng xe công ty", ".es-inline::自社便だけ", "label", err=["I100", "I101"],
      cond=["配送ルートが自社便だけの拠点", "Cơ sở có tuyến giao chỉ dùng xe công ty"],
      d=["委託配送会社への通知はなし（T3-2）。承認すると社内の配送担当へ画面のお知らせ「配送停止（自社便）」を出す（I101：拠点名・ID・最終配送日）。承認後は I100 を出す。", "Không thông báo cho công ty vận chuyển ủy thác (T3-2). Khi duyệt sẽ hiện thông báo trên màn hình cho bộ phận giao hàng nội bộ \"配送停止（自社便）\" (I101: tên cơ sở, ID, ngày giao cuối). Sau duyệt hiện I100."],
      demo_ok=["承認前の注記はあるが、承認後の I100 の表示と、運営のホーム／お知らせ（I101）の「配送停止（自社便）」はコードに未実装（H14）", "Có ghi chú trước duyệt nhưng việc hiện I100 sau duyệt và thông báo \"配送停止（自社便）\" (I101) ở trang chủ / thông báo của vận hành chưa được cài đặt trong code (H14)"]),
]
CH_NOTES = [
    I("12", "自販機の拠点の配送方法", "Phương thức giao của cơ sở máy bán hàng tự động", ".es-inline::自販機のため", "label", err=["E106"],
      cond=["設備が自販機の拠点の「配送の変更」", "Đơn 配送の変更 của cơ sở có máy bán hàng tự động"],
      d=["設備が自販機の拠点は配送方法が ES配送便に固定（決定 28-19。ESライト（自販機）は ES配送便の価格プランだけ）。COOL便への変更は承認できない（E106）ので却下する。", "Cơ sở có máy bán hàng tự động cố định phương thức giao là ES配送便 (quyết định 28-19; ESライト（自販機）chỉ có gói giá ES配送便). Đổi sang COOL便 không duyệt được (E106) nên hãy từ chối."]),
    I("13", "納品不可曜日・設備の希望日の入口", "Cửa vào cho thứ không giao được / ngày mong muốn thiết bị", ".es-inline::拠点情報の変更」が入口", "label",
      cond=["配送の変更・設備の変更で、納品不可曜日・設備の希望日の行があるとき", "Khi đơn 配送の変更 / 設備の変更 có dòng thứ không giao được / ngày mong muốn thiết bị"],
      d=["納品不可曜日・設備の希望日の変更は「拠点情報の変更」が入口（承認区分の決定表・2026-10-01）。この申請の該当行は参照表示で、ここでは設定できない。以後は「拠点情報の変更」で申請してもらう。", "Đổi thứ không giao được / ngày mong muốn thiết bị chỉ có 1 cửa vào là \"拠点情報の変更\" (bảng quyết định phân loại duyệt, 2026-10-01). Dòng tương ứng của đơn này chỉ hiển thị tham khảo, không thiết lập ở đây. Về sau hãy nhờ khách nộp bằng \"拠点情報の変更\"."],
      demo_ok=["見本データ（CH-20260922-0001・CH-20260705-0001）が「配送の変更」で納品不可曜日を申請している。決定（H21）どおり「拠点情報の変更」の見本に直す", "Dữ liệu mẫu (CH-20260922-0001, CH-20260705-0001) nộp thứ không giao được bằng \"配送の変更\". Sửa thành dữ liệu mẫu \"拠点情報の変更\" theo quyết định (H21)"]),
    I("14", "冷蔵庫のサイズアップの手順", "Quy trình tăng cỡ tủ lạnh", "#apxboard .es-inline::サイズアップ", "label",
      cond=["設備の変更で冷蔵庫のサイズ変更があるとき", "Khi đơn 設備の変更 có đổi cỡ tủ lạnh"],
      d=["権限のある運営管理者なら誰でも承認・手配できる。手順：①「影響と設定」で「設備の異動（機種変更）」として登録 → ②「この拠点を承認」。差額はオプション請求。", "Người quản trị vận hành có quyền nào cũng duyệt và sắp xếp được. Quy trình: ① đăng ký là \"chuyển dịch thiết bị (đổi model)\" ở 影響と設定 → ② \"この拠点を承認\". Chênh lệch tính vào tùy chọn."]),
]
CH_VMSTART = I("8.11", "自販機に切り替える開始月", "Tháng bắt đầu chuyển sang máy bán hàng tự động", ".es-dialog__body .es-field::自販機に切り替える開始月", "select", "select", req="○",
               len=["選択（承認のときに決める）", "Chọn (quyết khi duyệt)"], init=["いちばん早い月（法人の希望月があればその月）", "Tháng sớm nhất (có tháng khách mong muốn thì tháng đó)"],
               ex=["2026-12", "Chọn tháng bắt đầu"], err=["E02"],
               cond=["冷蔵庫→自販機（プランの変更でコースを ESライト（自販機）へ）のとき", "Khi tủ lạnh → máy bán hàng tự động (đổi gói sang ESライト（自販機）)"],
               d=["現場調査・自販機の手配に合わせて運営が決める（法人の希望月は参考。台帳 B 2026-10-03）。選択肢はいちばん早い月から4か月分。この場合は「開始月の扱い」の2択は出さない。", "Vận hành quyết theo khảo sát hiện trường và việc chuẩn bị máy (tháng khách mong muốn chỉ để tham khảo; 台帳 B 2026-10-03). Lựa chọn là 4 tháng kể từ tháng sớm nhất. Trường hợp này không hiện lựa chọn 2 phương án của \"開始月の扱い\"."])
CH_NOTFOUND = [
    I("15", "見つからない", "Không tìm thấy", ".card .pad", "label", "show", err=["I10"],
      d=["URL の申請番号がない・申請でないとき、ヘッダーの下に I10「申請が見つかりません。」と「契約申請管理へ戻る」のリンク。", "Khi mã đơn trong URL không có / không phải đơn thì dưới tiêu đề hiện I10 \"申請が見つかりません。\" và link \"契約申請管理へ戻る\"."],
      demo_ok=["コードの文言は「この申請は見つかりません。」。I10（{対象}が見つかりません。）に揃える", "Câu trong code là \"この申請は見つかりません。\". Đồng nhất về I10 ({対象}が見つかりません。)"]),
]

def kind_views():
    return None

# ---- 状態
HDR2 = pick(CH_HEAD, "1", "2")
HDR3 = pick(CH_HEAD, "1", "1.1", "1.2", "2")
CH_IMP_COMMON = pick(CH_IMP_HEAD, "6", "6.1", "6.2")
BOARD_MAIN = pick(CH_BOARD, "7", "7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7")
TAB_IMP = "tab('影響と設定').click();await sleep(700);"
TAB_BOARD = "tab('拠点ごとの承認').click();await sleep(700);"
TAB_CHG = "tab('変更される項目').click();await sleep(700);"
NO_PLAN = "CH-20260925-0001"
VIEWS += [
    V("010", "AW_APPL_002", "プランの変更：申請内容", "Đổi gói: 申請内容", "/ops/applications/" + NO_PLAN,
      HDR3 + CH_INFO,
      note=["CH-20260925-0001（株式会社サンプル 大阪支店・ESライト → ESスタンダード）。申請者は拠点アカウント（法人Web）。", "CH-20260925-0001 (株式会社サンプル 大阪支店, ESライト → ESスタンダード). Người nộp đơn là tài khoản cơ sở (Web pháp nhân)."]),
    V("011", "AW_APPL_002", "プランの変更：変更される項目", "Đổi gói: 変更される項目", "/ops/applications/" + NO_PLAN,
      HDR2 + CH_CHG, setup=TAB_CHG,
      note=["プランID・メニュー種別（コース）・月額（税抜）の3行と、月額の合計の行。", "3 dòng: ID gói, loại thực đơn (khóa), tiền tháng (chưa thuế) và dòng tổng tiền tháng."]),
    V("012", "AW_APPL_002", "プランの変更：影響と設定", "Đổi gói: 影響と設定", "/ops/applications/" + NO_PLAN,
      HDR2 + CH_IMP_COMMON + [CH_BILLED] + CH_EQUIP + [CH_MAIL] + CH_SET(*sets("cnt", "slot", "eq", "eqd", "qt")), setup=TAB_IMP,
      note=["請求済みの月 2件（2026-11サイクル・差額 +25,500円）。設備の異動の案は冷凍庫の追加（スタンダードの標準貸出設備との差）。必須は「納品サイクルの枠」。", "2 tháng đã xuất hóa đơn (chu kỳ 2026-11, chênh lệch +25,500 yên). Phương án thiết bị: thêm tủ đông (chênh so với thiết bị tiêu chuẩn của Standard). Bắt buộc: \"納品サイクルの枠\"."]),
    V("013", "AW_APPL_002", "プランの変更：拠点ごとの承認（承認待ち）", "Đổi gói: 拠点ごとの承認 (chờ duyệt)", "/ops/applications/" + NO_PLAN,
      HDR3 + BOARD_MAIN[:5] + [BOARD_MAIN[5], BOARD_MAIN[7]], setup=TAB_BOARD,
      note=["必須の設定が残っているので、承認ボタンの代わりに「影響と設定を入力」が出る。締切（2026-10-15）まであと10日（I102）。", "Còn thiết lập bắt buộc nên thay cho nút duyệt là \"影響と設定を入力\". Còn 10 ngày đến hạn chót (2026-10-15) (I102)."]),
    V("014", "AW_APPL_002", "承認ダイアログ（確認チェック・お知らせの確認）", "Hộp thoại duyệt (xác nhận, thông báo)", "/ops/applications/" + NO_PLAN,
      pick(CH_APPROVE, "8", "8.1", "8.3", "8.4", "8.6", "8.8", "8.9") + [CH_BEFORE_NOTE],
      setup="await setvals('" + NO_PLAN + "',0,{slot:'A3'});await reopen('" + NO_PLAN + "');" + P_APPROVE_OPEN, full=False,
      note=["納品サイクルの枠を入れたあと「この拠点を承認」を押した状態。確認のチェックを入れて「承認する」で承認（S100）。", "Trạng thái sau khi nhập khung chu kỳ giao hàng và nhấn \"この拠点を承認\". Tích xác nhận rồi nhấn \"承認する\" để duyệt (S100)."]),
    V("015", "AW_APPL_002", "承認：確認のチェックがないエラー", "Duyệt: lỗi chưa tích xác nhận", "/ops/applications/" + NO_PLAN,
      pick(CH_APPROVE, "8", "8.6", "8.7", "8.9"),
      setup="await setvals('" + NO_PLAN + "',0,{slot:'A3'});await reopen('" + NO_PLAN + "');" + P_APPROVE_OPEN + "btn('承認する',document.querySelector('.es-dialog__foot')).click();await sleep(600);", full=False,
      note=["チェックを入れずに「承認する」を押した状態。E100。", "Trạng thái nhấn \"承認する\" khi chưa tích. E100."]),
    V("016", "AW_APPL_002", "承認：必須の設定が未入力（要入力）", "Duyệt: chưa nhập thiết lập bắt buộc (要入力)", "/ops/applications/CH-20260922-0001",
      HDR3 + pick(CH_BOARD, "7", "7.3", "7.7"), setup=TAB_BOARD,
      note=["CH-20260922-0001（配送の変更）。「影響と設定（要入力）」のタブの印と、承認の欄の「影響と設定を入力」。承認の API を直接呼んでも E101 で止まる。", "CH-20260922-0001 (配送の変更). Dấu \"影響と設定（要入力）\" ở tab và nút \"影響と設定を入力\" ở khu vực duyệt. Gọi API duyệt trực tiếp cũng bị chặn bởi E101."]),
    V("017", "AW_APPL_002", "承認：オーダー締切を過ぎている", "Duyệt: đã quá hạn chót đặt hàng", "/ops/applications/" + NO_PLAN,
      [pick(CH_BOARD, "7.1")[0]] + pick(CH_APPROVE, "8", "8.5", "8.6", "8.9"),
      setup="await setvals('" + NO_PLAN + "',0,{slot:'A3'});await reopen('" + NO_PLAN + "');" + P_APPROVE_OPEN, today="2026/10/16", full=False,
      note=["デモの今日を 2026-10-16（締切 10/15 の翌日）にした状態。承認ダイアログの下に「開始月の扱い」の2択（W100）。", "Đặt ngày hôm nay của demo là 2026-10-16 (sau hạn 10/15). Cuối hộp thoại duyệt có lựa chọn 2 phương án \"開始月の扱い\" (W100)."]),
    V("018", "AW_APPL_002", "解約：最短の解約日より前（承認できない）", "Hủy: trước ngày hủy sớm nhất (không duyệt được)", "/ops/applications",
      HDR2 + CH_CXL[:2],
      setup="await free(['CU00961']);const no=await mkch({kind:'解約',corpId:'CU00001',branchIds:['CU00961'],startCycle:'2026-12',ask:'解約（見本・最短より前）',change:{lastCycle:'2026-10'},request:[['申請の内容','解約（見本）'],['解約をご希望の日','2026年10月サイクルの最終日（2026-11-08）'],['残った商品（在庫）の扱い','全て買取（最終のご請求書に買取として載せます）'],['理由','見本']]});await go('/ops/applications/'+no);tab('影響と設定').click();await sleep(700);window.__no=no;",
      today="2026/10/16",
      note=["デモの今日が 2026-10-16（締切 10/15 の後）なので、最短の解約日は 2026-11-08 より1サイクル後ろ。希望の解約日（2026年10月サイクルの最終日）はそれより前のため「ルールに合わない」。承認は無効で、却下して案内する（E108）。", "Hôm nay của demo là 2026-10-16 (sau hạn 10/15) nên ngày hủy sớm nhất lùi thêm 1 chu kỳ so với 2026-11-08. Ngày hủy mong muốn (cuối chu kỳ 2026年10月) sớm hơn nên \"không đúng quy tắc\". Nút duyệt bị vô hiệu, phải từ chối và hướng dẫn (E108)."]),
    V("019", "AW_APPL_002", "確定済みの月（ロック中）", "Tháng đã chốt (đang khóa)", "/ops/applications/" + NO_PLAN,
      HDR2 + [CH_LOCKED[0]],
      setup="await dom('billing','withdraw',{id:'INV-2026100001',by:'Ad00003'});await reopen('" + NO_PLAN + "');" + TAB_IMP,
      note=["請求書 INV-2026100001 を取消して、2026-11サイクルを「確定（未発行）」にした状態。承認しても変えない月を黄色の注記で出す。請求済みの月の差額は No.012。", "Trạng thái đã hủy hóa đơn INV-2026100001 để chu kỳ 2026-11 thành \"確定 (chưa xuất)\". Tháng duyệt cũng không đổi hiện bằng ghi chú vàng. Chênh lệch tháng đã xuất hóa đơn xem No.012."]),
    V("020", "AW_APPL_002", "却下モーダル", "Hộp thoại từ chối", "/ops/applications/" + NO_PLAN,
      pick(CH_REJECT, "9", "9.1", "9.2", "9.4", "9.5"),
      setup=TAB_BOARD + "btn('却下',document.querySelector('#apxboard .apx-ops')).click();await sleep(500);", full=False),
    V("021", "AW_APPL_002", "却下：理由を選ばないエラー", "Từ chối: lỗi chưa chọn lý do", "/ops/applications/" + NO_PLAN,
      pick(CH_REJECT, "9", "9.1", "9.3", "9.5"),
      setup=TAB_BOARD + "btn('却下',document.querySelector('#apxboard .apx-ops')).click();await sleep(500);btn('却下する',document.querySelector('.es-modal__actions')).click();await sleep(400);", full=False,
      note=["理由を選ばずに「却下する」を押した状態。E02。", "Trạng thái nhấn \"却下する\" khi chưa chọn lý do. E02."]),
    V("022", "AW_APPL_002", "処理済みの申請（参照だけ）", "Đơn đã xử lý (chỉ xem)", "/ops/applications/CH-20260927-0002",
      pick(CH_HEAD, "1", "1.1", "2") + pick(CH_BOARD, "7", "7.3", "7.4"), setup=TAB_BOARD,
      note=["CH-20260927-0002（解約・承認済み）。承認者の名前を出し、承認・却下のボタンは出さない。「やり直す」は置かない（台帳 B・受付簿 No.11）。", "CH-20260927-0002 (hủy hợp đồng, 承認済み). Hiện tên người duyệt, không có nút duyệt / từ chối. Không đặt \"làm lại\" (台帳 B, 受付簿 No.11)."]),
]


SC1 = "CU00001 株式会社サンプル"
CH_TOAST = I("8.12", "承認・却下のトースト／エラー", "Toast duyệt / từ chối / lỗi", ".toast", "toast", "show", err=["S100", "E103"],
             d=["承認・却下できたら S100（法人へお知らせを送る）。ほかの人が先に処理していたら E103 を出し、画面を読み込み直す。", "Duyệt / từ chối xong thì hiện S100 (gửi thông báo cho pháp nhân). Nếu người khác đã xử lý trước thì hiện E103 và tải lại màn hình."],
             demo_ok=["コードの文言は「この拠点は処理済みです」「（拠点名）を承認しました。法人へお知らせを送ります」。S100・E103 に揃える（「お客様」「（デモ）」は付けない）", "Câu trong code là \"この拠点は処理済みです\" và \"(tên cơ sở) を承認しました。法人へお知らせを送ります\". Đồng nhất về S100, E103 (không dùng \"お客様\" và \"(デモ)\")"])
BOARD_ONLY = lambda *n: pick(CH_BOARD, *n)
VIEWS += [
    V("023", "AW_APPL_002", "一部の拠点を処理（対応中 1/2）", "Xử lý một phần cơ sở (対応中 1/2)", "/ops/applications",
      HDR2 + [CH_HEAD[1]] + pick(CH_BOARD, "7", "7.3", "7.4", "7.5", "7.7"),
      setup="await free(['CU00950','CU00961']);const no=await mkch({kind:'設備の変更',corpId:'CU00001',branchIds:['CU00950','CU00961'],ask:'冷蔵庫の追加（見本・2拠点）'});await setvals(no,0,{sd:'2026-10-25'});await area('approve',{no:no,i:0,ok:true,checks:{},texts:{},late:''});await go('/ops/applications/'+no);" + TAB_BOARD,
      note=["2拠点（横浜営業所・千葉営業所）の設備の変更。横浜営業所だけ承認した状態で、申請のステータスは「対応中 1/2」。残りの拠点は引き続き承認・却下できる。", "Đơn đổi thiết bị của 2 cơ sở (Yokohama, Chiba). Chỉ duyệt Yokohama nên trạng thái đơn là \"対応中 1/2\". Cơ sở còn lại vẫn duyệt / từ chối được."]),
    V("024", "AW_APPL_002", "一部承認（承認と却下が混ざる）", "Duyệt một phần (có cả duyệt và từ chối)", "/ops/applications",
      HDR2 + [CH_HEAD[1]] + pick(CH_BOARD, "7", "7.3", "7.4", "7.9"),
      setup="const no=await find('見本・2拠点');await area('reject',{no:no,i:1,why:'設置条件を満たさない',note:''});await go('/ops/applications/'+no);" + TAB_BOARD,
      note=["残りの拠点を却下した状態。ステータスは「一部承認」。すべて処理したので、承認した拠点へ反映のお知らせ、却下した拠点へ理由つきのお知らせを送った旨を出す。", "Trạng thái đã từ chối cơ sở còn lại. Trạng thái là \"一部承認\". Vì đã xử lý hết nên hiện thông báo đã gửi thông báo phản ánh cho cơ sở được duyệt và thông báo kèm lý do cho cơ sở bị từ chối."]),
    V("025", "AW_APPL_002", "冷蔵庫→自販機：現場調査（影響と設定）", "Tủ lạnh → máy bán hàng tự động: khảo sát hiện trường (影響と設定)", "/ops/applications",
      HDR2 + CH_IMP_COMMON + CH_SET(*sets("cnt", "slot", "eq", "eqd", "svd", "svr", "svm", "qt")),
      setup="await free(['CU00671']);const no=await mkch({kind:'プランの変更',corpId:'CU00003',branchIds:['CU00671'],ask:'冷蔵庫から自販機へ（見本）',startCycle:'2026-12',change:{planId:'ES000004',course:'ESライト（自販機）'}});await go('/ops/applications/'+no);" + TAB_IMP,
      note=["大阪キッチン 淀屋橋ES のコースを ESライト（自販機）へ。プランの変更の設定に、現場調査日・結果（必須）・メモが加わる。結果が「設置できない」なら承認できない（E107）。", "Đổi khóa của 大阪キッチン 淀屋橋ES sang ESライト（自販機）. Thiết lập của đơn đổi gói có thêm ngày khảo sát, kết quả (bắt buộc), ghi chú. Kết quả \"không lắp được\" thì không duyệt (E107)."]),
    V("026", "AW_APPL_002", "冷蔵庫→自販機：承認ダイアログで開始月を選ぶ", "Tủ lạnh → máy bán hàng tự động: chọn tháng bắt đầu ở hộp thoại duyệt", "/ops/applications",
      pick(CH_APPROVE, "8", "8.3", "8.6", "8.9") + [CH_VMSTART],
      setup="const no=await find('冷蔵庫から自販機へ');await setvals(no,0,{slot:'A3',svd:'2026-10-20',svr:'設置できる'});await reopen(no);" + P_APPROVE_OPEN, full=False,
      note=["現場調査（設置できる）まで入れた状態。開始月は運営が承認のときに決める（法人の希望月は参考）。", "Đã nhập đến khảo sát (lắp được). Vận hành quyết tháng bắt đầu khi duyệt (tháng khách mong muốn chỉ để tham khảo)."]),
    V("027", "AW_APPL_002", "ライト→スタンダード：移行割（DC000021）", "Lite → Standard: giảm giá chuyển đổi (DC000021)", "/ops/applications/" + NO_PLAN,
      pick(CH_APPROVE, "8", "8.2", "8.9"),
      setup=P_FILL_PLAN + P_APPROVE_OPEN, full=False,
      note=["旧ライト→スタンダードの移行の申請（CH-20260925-0001）。移行割はあらかじめチェック済みで、運営が外せる。", "Đơn chuyển từ Lite cũ sang Standard (CH-20260925-0001). Giảm giá chuyển đổi mặc định đã tích, vận hành bỏ được."]),
    V("028", "AW_APPL_002", "配送の変更：自販機の拠点の注記（影響と設定）", "Đổi giao hàng: ghi chú cơ sở máy bán hàng tự động (影響と設定)", "/ops/applications",
      HDR2 + CH_IMP_COMMON + CH_NOTES[:1] + CH_SET(*sets("rt", "from1")),
      setup="await free(['CU00643']);const no=await mkch({kind:'配送の変更',corpId:'CU00001',branchIds:['CU00643'],ask:'配送方法の変更（ES配送便 → COOL便）（見本・自販機）'});await go('/ops/applications/'+no);" + TAB_IMP,
      note=["設備が自販機の本社（CU00643）の配送方法を COOL便へ変更する申請。設備が自販機の拠点は配送方法が ES配送便に固定（決定 28-19）なので、選択肢は出さない。", "Đơn đổi phương thức giao của trụ sở (CU00643, có máy bán hàng tự động) sang COOL便. Cơ sở có máy bán hàng tự động cố định ES配送便 (quyết định 28-19) nên không có lựa chọn."]),
    V("029", "AW_APPL_002", "配送の変更：自販機の拠点を COOL便へ（承認できない）", "Đổi giao hàng: cơ sở máy bán hàng tự động sang COOL便 (không duyệt được)", "/ops/applications",
      HDR3 + pick(CH_BOARD, "7", "7.3", "7.5", "7.6", "7.8"),
      setup="const no=await find('見本・自販機');await go('/ops/applications/'+no);" + TAB_BOARD,
      note=["承認は無効で、却下を案内する（E106）。代理入力の画面（AW_APPL_005）では、そもそも登録できない。", "Nút duyệt bị vô hiệu, hướng dẫn từ chối (E106). Ở màn nhập hộ (AW_APPL_005) thì không đăng ký được ngay từ đầu."]),
    V("030", "AW_APPL_002", "配送の変更：見積依頼（任意）", "Đổi giao hàng: yêu cầu báo giá (tùy chọn)", "/ops/applications/CH-20260922-0001",
      HDR2 + CH_IMP_COMMON + [CH_NOTES[1], CH_MAIL] + CH_SET(*sets("rt", "from1", "qt")), setup=TAB_IMP,
      note=["CH-20260922-0001（ひかり物産 川崎工場）。見積依頼は任意で、回答を待たずに承認できる。この見本は納品不可曜日の変更を「配送の変更」で申請している（決定 H21 では「拠点情報の変更」が入口）。", "CH-20260922-0001 (ひかり物産 川崎工場). Yêu cầu báo giá là tùy chọn, không chờ trả lời vẫn duyệt được. Dữ liệu mẫu này nộp đổi thứ không giao được bằng \"配送の変更\" (quyết định H21: cửa vào là \"拠点情報の変更\")."]),
    V("031", "AW_APPL_002", "設備の変更：サイズアップ・設備の異動案（影響と設定）", "Đổi thiết bị: tăng cỡ và phương án chuyển dịch (影響と設定)", "/ops/applications",
      HDR2 + CH_IMP_COMMON + CH_EQUIP[:3] + [CH_NOTES[1], CH_MAIL] + CH_SET(*sets("sd", "sc", "rd", "op", "eqmv")),
      setup="await free(['CU00950']);const no=await mkch({kind:'設備の変更',corpId:'CU00001',branchIds:['CU00950'],request:[['貸出一覧：冷蔵庫','48L → 100L（サイズアップ・見本）'],['設備の希望日','2026-11-02'],['理由','見本']]});await go('/ops/applications/'+no);" + TAB_IMP,
      note=["横浜営業所の冷蔵庫のサイズアップ。「設備の異動（機種変更）」として登録する（差額はオプション請求）。設備の希望日の行は参照表示で、変更の入口は「拠点情報の変更」（No.13）。", "Tăng cỡ tủ lạnh của Yokohama. Đăng ký là \"chuyển dịch thiết bị (đổi model)\" (chênh lệch tính vào tùy chọn). Dòng ngày mong muốn thiết bị chỉ hiển thị tham khảo; cửa vào để đổi là \"拠点情報の変更\" (No.13)."]),
    V("032", "AW_APPL_002", "設備の変更：サイズアップの承認の手順", "Đổi thiết bị: quy trình duyệt tăng cỡ", "/ops/applications",
      HDR3 + pick(CH_BOARD, "7") + [CH_NOTES[2]] + pick(CH_BOARD, "7.3", "7.7"),
      setup="const no=await find('サイズアップ・見本');await go('/ops/applications/'+no);" + TAB_BOARD,
      note=["権限のある運営管理者なら誰でも承認・手配できる（特定の人の承認は不要）。", "Người quản trị vận hành có quyền nào cũng duyệt và sắp xếp được (không cần người cụ thể)."]),
    V("033", "AW_APPL_002", "拠点情報の変更（住所）：配送ルート・搬入経路の確認", "Đổi thông tin cơ sở (địa chỉ): tuyến giao hàng, xác nhận đường vận chuyển", "/ops/applications/CH-20260924-0001",
      HDR2 + CH_IMP_COMMON + [CH_MAIL] + CH_SET(*sets("wh", "c1", "c2", "lead", "from3", "path", "bto", "qt")), setup=TAB_IMP,
      note=["CH-20260924-0001（ことぶき商会 横浜倉庫・郵便番号・住所・電話・請求先）。住所が変わるので、ピッキング倉庫・運送会社・納品会社・リードタイムを見直し、新しい住所で配送する最初の納品日と搬入経路の確認が必須。", "CH-20260924-0001 (ことぶき商会 横浜倉庫, mã bưu điện, địa chỉ, điện thoại, nơi nhận hóa đơn). Vì đổi địa chỉ nên xem lại kho lấy hàng, công ty vận chuyển / giao hàng, thời gian chờ; bắt buộc nhập ngày giao đầu tiên tại địa chỉ mới và xác nhận đường vận chuyển."]),
    V("034", "AW_APPL_002", "拠点情報の変更（請求先）：変更される項目", "Đổi thông tin cơ sở (nơi nhận hóa đơn): các mục thay đổi", "/ops/applications/CH-20260924-0001",
      HDR2 + CH_CHG[:3], setup=TAB_CHG,
      note=["請求先の変更を含む。請求の宛先（枚数・Bill One の発行先）の確認は必須（No.6.7.23）。発行済みの請求書はそのまま、未発行の分から新しい請求先へ。", "Có đổi nơi nhận hóa đơn. Bắt buộc xác nhận nơi nhận hóa đơn (số tờ, nơi phát hành Bill One) (No.6.7.23). Hóa đơn đã xuất giữ nguyên, từ phần chưa xuất gửi đến nơi nhận mới."]),
    V("035", "AW_APPL_002", "法人情報の変更：請求書の宛先の手配（影響と設定）", "Đổi thông tin pháp nhân: sắp xếp nơi nhận hóa đơn (影響と設定)", "/ops/applications/CH-20260929-0001",
      HDR2 + CH_IMP_COMMON + [CH_MAIL] + CH_SET(*sets("bo")), setup=TAB_IMP,
      note=["CH-20260929-0001（電話番号・FAX番号の変更）。住所・電話などを直す変更は、請求書の宛先（Bill One の発行先）の手配の確認が必須。法人情報の変更に「拠点ごと」はない（法人1件）。", "CH-20260929-0001 (đổi số điện thoại / FAX). Thay đổi sửa địa chỉ / điện thoại... bắt buộc xác nhận đã sắp xếp nơi nhận hóa đơn (nơi phát hành Bill One). Thay đổi thông tin pháp nhân không có \"theo cơ sở\" (1 pháp nhân)."]),
    V("036", "AW_APPL_002", "法人情報の変更：法人単位の承認", "Đổi thông tin pháp nhân: duyệt theo pháp nhân", "/ops/applications/CH-20260929-0001",
      HDR3 + pick(CH_BOARD, "7", "7.3", "7.5", "7.7") + CH_BOARD_CORP, setup="tab('法人単位の承認').click();await sleep(700);",
      note=["承認の単位は法人1件。必須の設定（請求書の宛先の手配）が残っているので「影響と設定を入力」が出る。", "Đơn vị duyệt là 1 pháp nhân. Còn thiết lập bắt buộc (sắp xếp nơi nhận hóa đơn) nên hiện \"影響と設定を入力\"."]),
    V("037", "AW_APPL_002", "休止：通算・再開予定月・設備・棚卸報告のスキップ", "Tạm ngưng: cộng dồn, tháng mở lại, thiết bị, bỏ qua kiểm kê", "/ops/applications/CH-20260926-0001",
      HDR2 + CH_IMP_COMMON[:2] + CH_PAUSE[:1] + [CH_IMP_COMMON[2]] + CH_SET(*sets("peq", "prd", "pdel", "inv", "invwhy")), setup=TAB_IMP,
      note=["CH-20260926-0001（ひかり物産 本社・2026-12〜2027-02 の3サイクル・再開予定 2027-03）。通算3ヶ月・残り9ヶ月。棚卸報告のスキップを選べるのはシステム管理だけ（理由は必須）。", "CH-20260926-0001 (ひかり物産 本社, 3 chu kỳ 2026-12〜2027-02, dự kiến mở lại 2027-03). Cộng dồn 3 tháng, còn 9 tháng. Chỉ システム管理 được chọn bỏ qua báo cáo kiểm kê (bắt buộc ghi lý do)."]),
    V("038", "AW_APPL_002", "休止：通算が12ヶ月に達する（上限）", "Tạm ngưng: cộng dồn đạt 12 tháng (giới hạn)", "/ops/applications",
      HDR2 + CH_PAUSE,
      setup="await free(['CU00961']);const no=await mkch({kind:'休止',corpId:'CU00001',branchIds:['CU00961'],startCycle:'2026-12',ask:'休止（見本・12ヶ月）',change:{fromCycle:'2026-12',toCycle:'2027-11',resumeCycle:'2027-12',keepEquipment:true},request:[['申請の内容','12ヶ月の休止（見本）'],['開始したいサイクル月','2026-12'],['再開予定月','2027年12月サイクル'],['理由','見本']]});await go('/ops/applications/'+no);" + TAB_IMP,
      note=["通算がちょうど12ヶ月（残り0ヶ月）の見本。13ヶ月以上になる申請は、申請の登録のときに共通データが止める（承認の画面に届かない）ので、超過の表示（E105）は見本で作れない。", "Mẫu có cộng dồn đúng 12 tháng (còn 0 tháng). Đơn từ 13 tháng trở lên bị dữ liệu chung chặn khi đăng ký đơn (không tới màn duyệt), nên không tạo được màn hiển thị vượt giới hạn (E105) bằng dữ liệu mẫu."]),
    V("039", "AW_APPL_002", "再開：配送ルート・最初の納品日・設備の再設置日", "Mở lại: tuyến giao, ngày giao đầu tiên, ngày lắp lại thiết bị", "/ops/applications/CH-20260927-0001",
      HDR2 + CH_IMP_COMMON + CH_SET(*sets("rrt", "from2", "rsd", "inv", "invwhy", "qt")), setup=TAB_IMP,
      note=["CH-20260927-0001（サンプル 名古屋営業所・2027-01サイクルに再開）。再開の最低利用期間は休止前の残りを引き継ぐ（台帳 B 2026-10-06）。", "CH-20260927-0001 (サンプル 名古屋営業所, mở lại chu kỳ 2027-01). Thời gian sử dụng tối thiểu khi mở lại kế thừa phần còn lại trước tạm ngưng (台帳 B 2026-10-06)."]),
    V("040", "AW_APPL_002", "解約：解約日・違約金・回収予定・最後の納品日", "Hủy: ngày hủy, tiền phạt, dự kiến thu hồi, ngày giao cuối", "/ops/applications",
      HDR2 + CH_CXL[:3] + CH_SET(*sets("last", "crd", "pen")),
      setup="await free(['CU00950']);const no=await cxl('" + SC1 + "','CU00950 株式会社サンプル 横浜営業所（CP0000004）',24324);await go('/ops/applications/'+no);" + TAB_IMP,
      note=["横浜営業所（COOL便）の解約を代理入力した申請（2026年12月サイクルの末日で解約）。解約日は受付日とオーダー締切で決まる。委託配送会社への通知は運送会社（ヤマト運輸）へ。", "Đơn hủy của Yokohama (COOL便) do vận hành nhập hộ (hủy vào cuối chu kỳ 2026年12月). Ngày hủy do ngày tiếp nhận và hạn chót đặt hàng quyết định. Thông báo cho công ty vận chuyển ủy thác gửi đến công ty vận chuyển (ヤマト運輸)."]),
    V("041", "AW_APPL_002", "解約：自社便だけの拠点（委託配送会社への通知なし）", "Hủy: cơ sở chỉ dùng xe công ty (không thông báo công ty ủy thác)", "/ops/applications",
      HDR2 + [CH_CXL[0], CH_CXL[3]],
      setup="await free(['CU00643']);const no=await cxl('" + SC1 + "','CU00643 株式会社サンプル（CP0000001）',24324);await go('/ops/applications/'+no);" + TAB_IMP,
      note=["本社（ES配送便・自社便だけ）の解約。委託配送会社へは通知せず、承認すると社内の配送担当に画面のお知らせ（配送停止（自社便））を出す。", "Hủy trụ sở (ES配送便, chỉ xe công ty). Không thông báo cho công ty ủy thác; khi duyệt sẽ hiện thông báo trên màn hình cho bộ phận giao hàng nội bộ (配送停止（自社便））."]),
    V("042", "AW_APPL_002", "取り下げ済みの拠点を含む申請", "Đơn có cơ sở đã rút lại (取り下げ済み)", "/ops/applications",
      HDR2 + pick(CH_BOARD, "7", "7.3", "7.4"),
      setup="await free(['CU00950','CU00961']);const no=await mkch({kind:'設備の変更',corpId:'CU00001',branchIds:['CU00950','CU00961'],ask:'冷蔵庫の追加（見本・取り下げ）'});await dom('apply','withdraw',{id:no,accountId:'CU00001',corpId:'CU00001',branchId:'CU00961'});await go('/ops/applications/'+no);" + TAB_BOARD,
      note=["法人Web で、千葉営業所の分だけ取り下げた申請。取り下げ済みの拠点は処理できず、状態に「取り下げ済み」（灰）を出す。", "Đơn mà ở Web pháp nhân đã rút riêng phần Chiba. Cơ sở đã rút không xử lý được, cột trạng thái hiện \"取り下げ済み\" (xám)."]),
    V("043", "AW_APPL_002", "見つからない（I10）", "Không tìm thấy (I10)", "/ops/applications/CH-99999999-9999",
      pick(CH_HEAD, "1") + CH_NOTFOUND),
    V("044", "AW_APPL_002", "承認を止める：変更前の値が今の値と違う（TL-1）", "Chặn duyệt: giá trị trước khi đổi khác giá trị hiện tại (TL-1)", "/ops/applications/" + NO_PLAN,
      [CH_BEFORE_NOTE, pick(CH_APPROVE, "8.9")[0]],
      setup=P_FILL_PLAN + P_APPROVE_OPEN, full=False,
      note=["承認ダイアログの注記。申請のあと、拠点の値を直接変えてから承認しようとすると E102 で止まる（コードは未実装・見本の値は同じなので出ない）。", "Ghi chú ở hộp thoại duyệt. Sau khi nộp đơn, nếu giá trị của cơ sở bị đổi trực tiếp rồi mới duyệt thì bị chặn bằng E102 (code chưa cài đặt; giá trị mẫu giống nhau nên không hiện)."]),
    V("045", "AW_APPL_002", "同時に処理された（この拠点は処理済み）", "Bị xử lý đồng thời (cơ sở này đã được xử lý)", "/ops/applications/" + NO_PLAN,
      [pick(CH_APPROVE, "8.9")[0], CH_TOAST],
      setup=P_FILL_PLAN + P_APPROVE_OPEN + "await area('approve',{no:'" + NO_PLAN + "',i:0,ok:true,checks:{},texts:{},late:''});[...document.querySelectorAll('.es-dialog__body label.es-check')].find(l=>l.textContent.includes('確認しました')).querySelector('input').click();await sleep(300);btn('承認する',document.querySelector('.es-dialog__foot')).click();await sleep(700);", full=False,
      note=["2つの画面で同じ拠点を承認した状態（片方が先に承認済み）。あとから押した方は E103。E31（同時編集の警告）とは別。", "Trạng thái 2 màn hình cùng duyệt 1 cơ sở (một bên đã duyệt trước). Bên nhấn sau nhận E103. Khác E31 (cảnh báo sửa đồng thời)."]),
    V("046", "AW_APPL_002", "法人情報の変更を承認（トースト）", "Duyệt thay đổi thông tin pháp nhân (toast)", "/ops/applications/CH-20260929-0001",
      [CH_TOAST],
      setup="await setvals('CH-20260929-0001',0,{bo:true});await reopen('CH-20260929-0001');tab('法人単位の承認').click();await sleep(600);btn('法人の変更を承認').click();await sleep(700);[...document.querySelectorAll('.es-dialog__body label.es-check')].find(l=>l.textContent.includes('確認しました')).querySelector('input').click();await sleep(300);btn('承認する',document.querySelector('.es-dialog__foot')).click();await sleep(700);", full=False,
      note=["法人情報の変更を承認した直後。S100（法人へお知らせを送る）。承認した申請は、ここから直せない（直すときは新しい申請を代理入力する）。", "Ngay sau khi duyệt thay đổi thông tin pháp nhân. S100 (gửi thông báo cho pháp nhân). Đơn đã duyệt không sửa được ở đây (muốn sửa thì nhập hộ đơn mới)."]),
]


# ================================================================ AW_APPL_003 受付詳細（新規・お試し・切替 AP-…）
# 流れ（申込フォーム §10-2）：① 申込内容確認 → ② 仮登録 → ③ 詳細情報設定 → ④ 本登録（拠点ごとに「この拠点を確定」）→ 完了
# 画面の上にある「共通データの登録（仮登録 → 本登録）」の欄は実装の足場で、別の画面としては書かない（H16。画像からも外す）。
H += (
    "const fixbad=async()=>{for(const s of document.querySelectorAll('#dscreen select.bad')){const o=[...s.options].find(o=>o.value);setsel(s,o.value);}const i=document.querySelector('#dscreen input.bad');if(i){setv(i,'2026-10-08');i.blur();}await sleep(500);};"
    "const savetab=async()=>{document.querySelector('#btnSave').click();await sleep(650);};"
    "const readybr=async()=>{if(btn('エリアの既定値を入れる')){btn('エリアの既定値を入れる').click();await sleep(500);}await savetab();await fixbad();await savetab();tab('設備・オプション').click();await sleep(800);const d=document.querySelector('[id$=_setup] input');if(d){setv(d,'2026-10-12');d.blur();await sleep(400);}await savetab();};"
    "const fillwh=async()=>{tab('配送の設定').click();await sleep(600);for(const s of document.querySelectorAll('#ascreen select')){if([...s.options].some(o=>/^WH0000/.test(o.text))&&!s.disabled)setsel(s,s.options[1].value);}await sleep(400);};"
    "const toD=async()=>{await fillwh();document.querySelector('#btnMain').click();await sleep(800);btn('仮登録する',document.querySelector('.es-dialog__foot')).click();await sleep(1500);btn('詳細情報の設定へ進む',document.querySelector('.es-dialog__foot')).click();await sleep(900);};"
    "const brow=async(i)=>{document.querySelectorAll('#dscreen .brow')[i].click();await sleep(700);};"
)
HIDE_IN = ["#app > .page > .card.acc", "#phead .es-inline"]       # 実装の足場（共通データの登録の欄・見本の注記）は画像に入れない
INT = "AP-20260910-0031"      # 本導入・受付中（4拠点）
TRI = "AP-20260922-0057"      # お試し・受付中
SET = "AP-20260920-0052"      # 本導入・契約設定中（4拠点）
SWI = "AP-20261005-0071"      # 切替・契約設定中（2拠点）
def FLD(no, ja, vi, key, dj, dv, **kw):
    """参照・入力どちらでも同じ場所（.fld）にある欄"""
    return I(no, ja, vi, ".fld::" + key, "label", "view", d=[dj, dv], **kw)
def KVR(no, ja, vi, key, dj, dv, **kw):
    return I(no, ja, vi, ".es-field::" + key, "label", "view", d=[dj, dv], **kw)

IT_HEAD = [
    I("1", "ヘッダー", "Đầu trang", "#phead .es-pagehead", "area",
      d=["パンくず：契約申請管理＞申請詳細。タイトル「申請詳細 AP-YYYYMMDD-NNNN」にステータスのバッジ。ボタンは段階と権限で変わる（権限がないボタンは出さない）。「契約設定中」の申込は詳細情報設定から開く。", "Breadcrumb: 契約申請管理 > 申請詳細. Tiêu đề \"申請詳細 AP-YYYYMMDD-NNNN\" kèm badge trạng thái. Nút thay đổi theo bước và quyền (không có quyền thì không hiện). Đơn \"契約設定中\" mở từ bước thiết lập thông tin chi tiết."]),
    I("1.1", "ステータスのバッジ", "Badge trạng thái", "#phead .es-pagehead__title .es-badge", "label",
      d=["受付中（黄）→契約設定中（青。仮登録のあと）→完了（緑。全拠点を確定したあと）。却下（赤）・取り下げ済み（灰）は理由と日時だけの画面になる。", "受付中 (vàng) → 契約設定中 (xanh dương; sau đăng ký tạm) → 完了 (xanh lá; sau khi xác nhận toàn bộ cơ sở). 却下 (đỏ) / 取り下げ済み (xám) chỉ là màn hình lý do và ngày giờ."]),
    I("1.2", "却下", "Từ chối", "#phead button::却下", "button", "click", err=["Q101", "E02"],
      cond=["受付中・契約設定中のとき・却下の権限（機能ごとの操作）", "Khi 受付中 / 契約設定中・quyền từ chối (thao tác theo chức năng)"],
      d=["却下のモーダル（No.22）を開く。理由は必須。仮登録のあとで却下したときは、作った拠点・親契約・子契約・新しい法人を「取消」にし、アカウントを停止し、オーダー・資材の初期セットを取り消す（台帳 B）。", "Mở hộp thoại từ chối (No.22). Lý do bắt buộc. Khi từ chối sau đăng ký tạm: cơ sở, hợp đồng cha, hợp đồng con và pháp nhân mới đã tạo chuyển sang \"取消\", khóa tài khoản, hủy đơn đặt hàng và bộ vật tư ban đầu (台帳 B)."]),
    I("1.3", "取り下げ", "Rút lại đơn", "#phead button::取り下げ", "button", "click", err=["Q101", "E01"],
      cond=["仮登録のあと（詳細情報設定）・運営だけ", "Sau đăng ký tạm (bước thiết lập chi tiết)・chỉ vận hành"],
      d=["取り下げのモーダル（No.22）を開く。お客様からの連絡で運営が行い、理由は必須（台帳 F 2026-10-07・Q8）。取り消すものは却下と同じ。", "Mở hộp thoại rút lại (No.22). Vận hành thực hiện theo liên hệ của khách, lý do bắt buộc (台帳 F 2026-10-07, Q8). Những thứ bị hủy giống khi từ chối."]),
    I("1.4", "アカウント発行／アカウント再送", "Cấp tài khoản / Gửi lại tài khoản", "#phead button::アカウント", "button", "click", err=["S102"],
      cond=["仮登録のあと・受付の編集の権限", "Sau đăng ký tạm・quyền sửa tiếp nhận"],
      d=["仮登録で「アカウントを発行する」を OFF にしていたときは「アカウント発行」（法人・拠点アカウントを発行し、全担当者へログイン案内メールを送る）。発行済みなら「アカウント再送」（同じ宛先へ再送）。完了したら S102。", "Nếu ở bước đăng ký tạm đã tắt \"アカウントを発行する\" thì là \"アカウント発行\" (cấp tài khoản pháp nhân / cơ sở và gửi email hướng dẫn đăng nhập cho mọi người phụ trách). Đã cấp rồi thì là \"アカウント再送\" (gửi lại cùng người nhận). Xong hiện S102."]),
    I("1.5", "申込内容の確認を完了", "Hoàn tất xác nhận nội dung đơn", "#btnMain", "button", "click", err=["Q102", "E01"],
      cond=["申込内容確認（①）のとき・受付の編集の権限", "Khi ở bước xác nhận nội dung đơn (①)・quyền sửa tiếp nhận"],
      d=["配送の設定のピッキング倉庫がそろっていれば、仮登録の確認モーダル（No.8）を開く。倉庫が未入力なら「配送の設定」のタブへ移り、「ピッキング倉庫が未設定です（n件）」のトースト。ボタン名は申込区分で変わる（新規＝申込内容の確認を完了、お試し＝お試し内容の確認を完了、切替＝切替内容の確認を完了）。", "Nếu đã chọn đủ kho lấy hàng ở \"配送の設定\" thì mở hộp thoại xác nhận đăng ký tạm (No.8). Chưa chọn kho thì chuyển sang tab \"配送の設定\" và hiện toast \"ピッキング倉庫が未設定です（n件）\". Tên nút thay đổi theo loại đơn (mới = 申込内容の確認を完了, dùng thử = お試し内容の確認を完了, chuyển đổi = 切替内容の確認を完了)."]),
    I("1.6", "編集", "Sửa", "#btnEdit", "button", "click",
      cond=["詳細情報設定（③）で参照のとき・確定前の拠点・受付の編集の権限", "Khi đang xem ở bước thiết lập chi tiết (③)・cơ sở chưa xác nhận・quyền sửa tiếp nhận"],
      d=["タブを編集に切り替える（参照 → 編集 → 保存／キャンセル。P-FORM）。まだ保存していない必須のタブは、開いたときから編集で始まる。自動保存のタブ（資料）には出さない。", "Chuyển tab sang chế độ sửa (xem → sửa → lưu / hủy; P-FORM). Tab bắt buộc chưa lưu sẽ mở thẳng ở chế độ sửa. Tab lưu tự động (tài liệu) không có nút này."]),
    I("1.7", "キャンセル", "Hủy", "#btnCancel", "button", "click", err=["Q02"],
      cond=["編集中のとき", "Khi đang sửa"],
      d=["変更があるときは Q02「編集内容を破棄しますか？」（No.21）。変更がなければそのまま参照に戻る。", "Có thay đổi thì hiện Q02 \"編集内容を破棄しますか？\" (No.21). Không thay đổi thì về chế độ xem."]),
    I("1.8", "保存", "Lưu", "#btnSave", "button", "click", pattern="P-FORM", err=["E01", "E04", "E31", "E30"],
      cond=["編集中のとき", "Khi đang sửa"],
      d=["今のタブの必須をまとめてチェックし、足りない欄は赤枠と文言（「入力内容に不足があります（n件）」のトースト・タブに赤い不足の印）。そろっていれば保存し、タブの見出しに「最終更新 日時 運営ユーザー名」を出す。保存する単位はタブごと（確定の前にタブごとに保存する）。ほかの人が先に保存していたら E31。", "Kiểm tra bắt buộc của tab hiện tại; ô thiếu thì viền đỏ và câu thông báo (toast \"入力内容に不足があります（n件）\", tab hiện \"要確認\"). Đủ thì lưu và hiện \"最終更新 ngày giờ + tên người dùng\" ở tiêu đề tab. Lưu theo từng tab (lưu từng tab trước khi xác nhận). Người khác lưu trước thì E31."],
      demo_ok=["E31（先に更新されていた）・E30（保存失敗）の処理はコードにない。画面の中の入力は、この画面を開いている間だけ持つ（共通データへ保存していない）。保存を共通データへつなぐ（H3）", "Code chưa có xử lý E31 (đã bị cập nhật trước) và E30 (lưu thất bại). Nội dung nhập chỉ được giữ khi đang mở màn này (chưa lưu vào dữ liệu chung). Cần nối việc lưu với dữ liệu chung (H3)"]),
    I("1.9", "申請完了の内容を確認", "Xem nội dung hoàn tất đơn", "#btnDone", "button", "click",
      cond=["全拠点を確定したあと（編集中でないとき）", "Sau khi xác nhận toàn bộ cơ sở (không đang sửa)"],
      d=["「申込の受付が完了しました」のダイアログ（No.20）を開き直す。", "Mở lại hộp thoại \"申込の受付が完了しました\" (No.20)."]),
]
IT_TABS_A = [
    I("2", "タブ（申込内容確認）", "Tab (xác nhận nội dung đơn)", "#ascreen .es-tabs", "tab", "click", pattern="P-TAB",
      d=["申請内容／配送の設定／開始スケジュール／共通情報（開始スケジュールは申込区分によって出さないことがある）。「配送の設定」は倉庫が未入力のあいだ「要入力」の印。", "申請内容 / 配送の設定 / 開始スケジュール / 共通情報 (開始スケジュール có loại đơn không hiển thị). \"配送の設定\" có dấu \"要入力\" khi chưa chọn kho."]),
]
IT_INFO = [
    I("3", "申請情報", "Thông tin đơn", "#ascreen .card h2::申請情報^", "area", d=["申込の基本。読むだけ。", "Thông tin cơ bản của đơn. Chỉ đọc."]),
    KVR("3.1", "申請日", "Ngày nộp đơn", "申請日", "yyyy-mm-dd。", "yyyy-mm-dd."),
    KVR("3.2", "申込区分", "Loại đơn", "申込区分", "本導入の新規申込／お試しキャンペーン／お試し→本導入の切替。", "Đăng ký mới (本導入) / dùng thử (お試し) / chuyển đổi dùng thử → 本導入."),
    KVR("3.3", "法人", "Pháp nhân", "法人", "法人名と法人ID。新しい法人は仮登録で採番される。", "Tên và ID pháp nhân. Pháp nhân mới được cấp ID ở bước đăng ký tạm."),
    KVR("3.4", "申込者", "Người nộp đơn", "申込者", "申込者の名前と入口（「ログインなしで申込」／法人Web／代理入力）。申込者は法人担当者・拠点担当者のメールのどれか（ご担当者から選ぶ。共通情報の申込担当者に「申込者」の印）。", "Tên người nộp và cửa vào (\"ログインなしで申込\" / Web pháp nhân / nhập hộ). Người nộp là một trong các email người phụ trách pháp nhân / cơ sở (chọn từ người phụ trách; có dấu \"申込者\" ở bảng người phụ trách của thông tin chung)."),
    KVR("3.5", "拠点数・親契約・子契約", "Số cơ sở, hợp đồng cha, hợp đồng con", "拠点数", "拠点の数、仮登録で作られる親契約の番号の範囲（例 CP0000061〜4）、子契約の件数（最初のサイクル分）、次の自動生成の月と生成基準日。", "Số cơ sở, dải mã hợp đồng cha sẽ tạo ở đăng ký tạm (vd. CP0000061〜4), số hợp đồng con (phần chu kỳ đầu), tháng sinh tự động kế tiếp và ngày cơ sở sinh."),
    I("4", "拠点別の申込内容", "Nội dung đơn theo cơ sở", "#ascreen .card.acc", "area",
      d=["拠点ごとの列で横に並べた表（見出し「拠点別の申込内容（n拠点）」）。法人Web の申込フォームの入力内容を、そのまま読むだけで見せる。", "Bảng xếp ngang theo cột từng cơ sở (tiêu đề \"拠点別の申込内容（n拠点）\"). Hiển thị nguyên nội dung nhập ở form đăng ký của Web pháp nhân, chỉ đọc."]),
    I("4.1", "契約・プラン（申込内容）", "Hợp đồng・gói (nội dung đơn)", "#ascreen tr.sec::契約・プラン（申込内容）", "label", d=["契約種別・プラン・コース・開始サイクル月（希望）とそのサイクル初日 A1。", "Loại hợp đồng, gói, khóa, chu kỳ bắt đầu (mong muốn) và ngày đầu chu kỳ A1."]),
    I("4.2", "配送（申込内容）", "Giao hàng (nội dung đơn)", "#ascreen tr.sec::配送（申込内容）", "label", d=["配送区分・納品回数（合計）・納品不可曜日・配送備考。設備が自販機の拠点は配送区分が ES配送便に固定（決定 28-19）。", "Phân loại giao hàng, số lần giao (tổng), thứ không giao được, ghi chú giao hàng. Cơ sở có máy bán hàng tự động cố định ES配送便 (quyết định 28-19)."]),
    I("4.3", "設備（申込時の希望）", "Thiết bị (mong muốn khi nộp đơn)", "#ascreen tr.sec::設備（申込時の希望", "label", d=["設備区分・希望機種・資材ボックス・電子レンジ／冷凍庫レンタル・自販機。仮登録のあと、最初の子契約の「設備の異動」に新規貸出として入る。", "Loại thiết bị, model mong muốn, hộp vật tư, thuê lò vi sóng / tủ đông, máy bán hàng tự động. Sau đăng ký tạm sẽ vào \"設備の異動\" của hợp đồng con đầu tiên dưới dạng cho thuê mới."]),
    I("4.4", "オプション（申込時の希望）", "Tùy chọn (mong muốn khi nộp đơn)", "#ascreen tr.sec::オプション（申込時の希望）", "label", d=["申込に出せるオプション。A型（配送回数追加・ES-QR など）は異動の表に入れず、子契約の①に自動で立つ。", "Tùy chọn được phép đưa vào đơn. Loại A (thêm lượt giao, ES-QR...) không đưa vào bảng chuyển dịch mà tự lập ở mục ① của hợp đồng con."]),
    I("4.5", "拠点・納品先／請求／添付・備考", "Cơ sở・nơi giao / Thanh toán / Đính kèm・ghi chú", "#ascreen tr.sec::拠点・納品先", "label", d=["拠点名・郵便番号・住所・電話・従業員数／請求先・リードタイムの上書き・入金期限・支払方法・Bill One 発行先ID／搬入経路資料・設置場所写真・プラン外の備考。", "Tên cơ sở, mã bưu điện, địa chỉ, điện thoại, số nhân viên / nơi nhận hóa đơn, ghi đè thời gian xuất hóa đơn, hạn thanh toán, phương thức thanh toán, ID Bill One / tài liệu đường vận chuyển, ảnh nơi đặt, ghi chú ngoài gói."]),
    I("4.6", "紹介の有無・他社乗り換えの確認", "Xác nhận có giới thiệu / chuyển từ công ty khác", "-", "area",
      d=["①で、紹介の有無（代理店コード）と他社乗り換えキャンペーンの該当を運営が確かめる（乗り換えは自動判定しない・証憑のアップロードは任意）。確かめたあとの割引は、詳細情報設定の「設備・オプション」の「割引の異動」で付ける（O11）。", "Ở bước ①, vận hành xác nhận có giới thiệu (mã đại lý) và có thuộc chương trình chuyển từ công ty khác không (không tự động phán định; tải chứng từ là tùy chọn). Giảm giá sau khi xác nhận được áp ở \"割引の異動\" trong tab \"設備・オプション\" của bước thiết lập chi tiết (O11)."],
      demo_ok=["コードの①の4タブにこの確認欄はない（H16）。申込フォーム §10-2 ① どおり足す", "4 tab của bước ① trong code chưa có ô xác nhận này (H16). Bổ sung theo 申込フォーム §10-2 ①"],
      open=["他社乗り換えの値引きを付ける場所が、詳細情報設定の「割引の異動」でよいか（仕様に明記なし）", "Có đúng là đặt giảm giá chuyển từ công ty khác ở \"割引の異動\" của bước thiết lập chi tiết không (thiết kế chưa ghi rõ)"], ask="お客様（契約仕様の担当）"),
]
IT_ROUTE = [
    I("5", "配送の設定（倉庫・配送回数）", "Cài đặt giao hàng (kho・số lần giao)", "#ascreen .card h2::配送の設定^", "area",
      d=["拠点・配送種別ごとのピッキング倉庫（必須）と配送回数を、1つの表で決める（拠点の列をまとめる）。倉庫が未入力のあいだ、タブに「要入力」の印。お試しで後半から始まるときは、最初の便の枠（例 C2）もここで選ぶ。", "Chọn kho lấy hàng (bắt buộc) và số lần giao theo từng cơ sở・loại giao trong một bảng (gom cột các cơ sở). Chưa chọn kho thì tab có dấu \"要入力\". Dùng thử bắt đầu từ nửa sau chu kỳ thì chọn cả khung chuyến đầu (vd. C2) ở đây."]),
    I("5.1", "既定の倉庫を入れる", "Điền kho mặc định", "#ascreen button::既定の倉庫を入れる", "button", "click",
      cond=["編集中のとき", "Khi đang sửa"], d=["拠点の住所から、倉庫別の既定値を入れる（入れたあとで直せる）。", "Điền giá trị mặc định theo kho dựa vào địa chỉ cơ sở (điền xong vẫn sửa được)."]),
    I("5.2", "ピッキング倉庫", "Kho lấy hàng", "#ascreen .rtt select", "select", "select", req="○", len=["選択（倉庫マスタのピッキング倉庫）", "Chọn (kho lấy hàng trong bảng kho)"], init=["（選択）", "(Chọn)"],
      ex=["WH00001 関東倉庫", "Chọn 1 kho cho mỗi dòng"], err=["E02"],
      d=["拠点×配送種別（冷蔵配送・冷凍配送・資材配送）ごとに1つ選ぶ。未選択で「申込内容の確認を完了」を押すと赤枠。資材配送は都度配送（回数なし）。", "Chọn 1 kho cho mỗi cơ sở × loại giao (giao lạnh, giao đông, giao vật tư). Chưa chọn mà nhấn \"申込内容の確認を完了\" thì viền đỏ. Giao vật tư là giao khi cần (không có số lần)."],
      open=["倉庫の選択肢（WH…）は固定の見本。倉庫マスタ（運営H）から作る", "Lựa chọn kho (WH…) là dữ liệu mẫu cố định. Cần lấy từ bảng kho (運営H)"], ask="運営H（倉庫マスタ）"),
    I("5.3", "配送回数", "Số lần giao", "#ascreen .rtt td:nth-child(3) select", "select", "select", req="○", len=["選択（0回〜8回）", "Chọn (0〜8 lần)"], init=["申込の回数", "Số lần trong đơn"],
      ex=["2回", "Mặc định là số lần trong đơn; vận hành sửa được"],
      d=["申込の回数が初期値で、運営が直せる。温度帯（冷蔵・冷凍）ごとにプラン標準と比べ、相殺しない。合計がプラン標準を超えた分は、配送回数追加（OP000001）が子契約の①に自動で立つ。", "Mặc định là số lần trong đơn, vận hành sửa được. So với chuẩn của gói theo từng nhiệt độ (lạnh / đông), không bù trừ. Phần tổng vượt chuẩn của gói thì OP000001 (thêm lượt giao) tự lập ở mục ① của hợp đồng con."]),
    I("5.4", "納品回数（合計）・配送回数追加", "Số lần giao (tổng)・thêm lượt giao", "#ascreen .rtt td::納品回数（合計）", "label",
      d=["「納品回数（合計） 月n回」。下に「プラン標準 冷蔵 月n回・冷凍 月m回」と「→ 配送回数追加 n回（OP000001 3,000円／回）」を出す。", "\"納品回数（合計） 月n回\". Bên dưới hiện \"chuẩn của gói: lạnh n lần/tháng・đông m lần/tháng\" và \"→ thêm n lượt giao (OP000001 3,000 yên/lượt)\"."]),
]
IT_SCHED = [
    I("6", "拠点別の開始スケジュール", "Lịch bắt đầu theo cơ sở", "#ascreen .card h2::拠点別の開始スケジュール^", "area",
      d=["拠点ごとの、契約開始年月・サイクル初日・子契約ID・生成基準日・請求先・請求月。読むだけ（開始サイクル月は詳細情報設定の親契約で保存する）。", "Theo từng cơ sở: tháng bắt đầu hợp đồng, ngày đầu chu kỳ, ID hợp đồng con, ngày cơ sở sinh, nơi nhận hóa đơn, tháng xuất hóa đơn. Chỉ đọc (chu kỳ bắt đầu được lưu ở hợp đồng cha trong bước thiết lập chi tiết)."]),
    I("6.1", "契約開始年月・サイクル初日", "Tháng bắt đầu・ngày đầu chu kỳ", "#ascreen .t th::サイクル初日", "label", d=["契約開始年月（開始サイクル月）と、サイクル初日 A1（月曜・自動で決まる）。契約はサイクル単位のため日は選ばない。", "Tháng bắt đầu hợp đồng (chu kỳ bắt đầu) và ngày đầu chu kỳ A1 (thứ Hai・tự quyết định). Hợp đồng theo chu kỳ nên không chọn ngày."]),
    I("6.2", "生成基準日・請求月", "Ngày cơ sở sinh・tháng xuất hóa đơn", "#ascreen .t th::生成基準日", "label", d=["子契約の生成基準日（オーダー開始日）と、請求先（法人／この拠点）・請求書発行リードタイムに応じた請求月。", "Ngày cơ sở sinh hợp đồng con (ngày bắt đầu đặt hàng) và tháng xuất hóa đơn theo nơi nhận hóa đơn (pháp nhân / cơ sở này) và thời gian xuất hóa đơn."]),
    I("6.3", "この申込で作られるもの", "Những gì sẽ được tạo từ đơn này", "#ascreen .card h2::この申込で作られるもの^", "area", d=["法人・拠点・親契約・子契約・アカウントの件数（仮登録で作る）。", "Số pháp nhân, cơ sở, hợp đồng cha, hợp đồng con, tài khoản (sẽ tạo ở đăng ký tạm)."]),
]
IT_COMMON = [
    I("7", "共通情報", "Thông tin chung", "#ascreen .card h2::共通情報^", "area", d=["申込担当者の表と、法人情報（新規／既存）。読むだけ。", "Bảng người phụ trách đơn và thông tin pháp nhân (mới / hiện có). Chỉ đọc."]),
    I("7.1", "申込担当者", "Người phụ trách đơn", "#ascreen .secttl::申込担当者", "table", d=["所属（法人／拠点）・区分（メイン／請求）・氏名・フリガナ・メールアドレス・電話番号。申込者の印あり。仮登録で、法人の担当者は法人詳細、拠点の担当者は拠点詳細の担当者の表に入る。メイン1・請求1が必須（Message List 既存）。", "Trực thuộc (pháp nhân / cơ sở), phân loại (chính / thanh toán), họ tên, furigana, email, điện thoại. Có dấu người nộp đơn. Ở bước đăng ký tạm, người phụ trách pháp nhân vào bảng người phụ trách của chi tiết pháp nhân, người phụ trách cơ sở vào bảng của chi tiết cơ sở. Bắt buộc 1 người chính và 1 người thanh toán."]),
    I("7.2", "法人情報", "Thông tin pháp nhân", "#ascreen .secttl::法人情報", "area", d=["バッジ「新規の法人」「既存の法人」。法人名・法人ID・フリガナ・法人名（契約）・請求先法人名・請求書に載る住所・電話番号。既存の法人（切替・拠点を追加）は請求情報も出す。", "Badge \"新規の法人\" / \"既存の法人\". Tên pháp nhân, ID, furigana, tên theo hợp đồng, tên pháp nhân nhận hóa đơn, địa chỉ in trên hóa đơn, điện thoại. Pháp nhân hiện có (chuyển đổi / thêm cơ sở) có cả thông tin thanh toán."]),
    I("7.3", "この申込で作るもの", "Những gì sẽ tạo từ đơn này", "#ascreen .secttl::この申込で作るもの", "area", d=["法人・拠点・親契約・子契約・アカウントの件数と ID。", "Số lượng và ID của pháp nhân, cơ sở, hợp đồng cha, hợp đồng con, tài khoản."]),
]
IT_MODALB = [
    I("8", "仮登録の確認", "Xác nhận đăng ký tạm", ".es-dialog__panel", "modal", "show", err=["Q102"],
      d=["Q102「この申込を仮登録しますか？」。作られるもの（法人・拠点・親契約・子契約（最初のサイクル）・アカウント・オーダー・資材の初期セット）を、申込区分ごとの表で確かめる。この時点では正式な契約にならない（親契約・拠点は「仮登録」のまま）。", "Q102 \"Đăng ký tạm đơn này?\". Kiểm tra những gì sẽ tạo (pháp nhân, cơ sở, hợp đồng cha, hợp đồng con (chu kỳ đầu), tài khoản, đơn đặt hàng, bộ vật tư ban đầu) bằng bảng theo loại đơn. Thời điểm này chưa phải hợp đồng chính thức (hợp đồng cha và cơ sở vẫn là \"仮登録\")."]),
    I("8.1", "仮登録の対象", "Đối tượng đăng ký tạm", ".es-dialog__body .es-table", "table", d=["法人情報・拠点情報・親契約・子契約の件数（4階層）。注意事項：子契約は最初のサイクル分だけ作り、以降は日次バッチ（01:30）が生成基準日を過ぎたサイクルから1件ずつ作る／親契約の番号は契約変更・休止・再開をしても変わらない。", "Số lượng thông tin pháp nhân, cơ sở, hợp đồng cha, hợp đồng con (4 tầng). Lưu ý: hợp đồng con chỉ tạo phần chu kỳ đầu, sau đó batch hằng ngày (01:30) sinh từng bản từ chu kỳ quá ngày cơ sở sinh; mã hợp đồng cha không đổi dù đổi hợp đồng / tạm ngưng / mở lại."]),
    I("8.2", "アカウントを発行する", "Cấp tài khoản", ".es-dialog__body label.es-check", "check", "check", req="－", init=["チェックあり（既定 ON）", "Có tích (mặc định BẬT)"],
      ex=["チェックを外す", "Bỏ tích thì không cấp tài khoản lúc đăng ký tạm (cấp ở bước đăng ký chính thức)"],
      d=["ON（既定）：仮登録のときに、法人アカウント・拠点アカウントを発行し、全担当者へログイン案内メールを送る。OFF：仮登録では発行せず、本登録（拠点の確定）のときに発行する。有効・停止はアカウント自身に持つ。", "BẬT (mặc định): khi đăng ký tạm cấp tài khoản pháp nhân và tài khoản cơ sở, gửi email hướng dẫn đăng nhập cho mọi người phụ trách. TẮT: không cấp lúc đăng ký tạm mà cấp lúc đăng ký chính thức (xác nhận cơ sở). Trạng thái hoạt động / khóa lưu ở chính tài khoản."]),
    I("8.3", "ログイン案内メールの宛先", "Người nhận email hướng dẫn đăng nhập", ".es-dialog__body .es-table::宛先", "table", d=["アカウント（法人／拠点）ごとに、メイン・サブ・請求担当者の全員（お申し込み者が担当者でなければお申し込み者にも）。同じアカウントで1人が複数の区分なら1通。ログインIDが違えば別々に送る。", "Với mỗi tài khoản (pháp nhân / cơ sở): toàn bộ người phụ trách chính, phụ, thanh toán (nếu người nộp đơn không phải người phụ trách thì gửi cả cho người nộp). Cùng tài khoản mà 1 người có nhiều phân loại thì 1 email. Khác ID đăng nhập thì gửi riêng."]),
    I("8.4", "キャンセル", "Hủy", ".es-dialog__foot button::キャンセル", "button", "click", d=["閉じる。何も作らない。", "Đóng, không tạo gì."]),
    I("8.5", "仮登録する", "Đăng ký tạm", ".es-dialog__foot button::仮登録する", "button", "click", err=["S102", "E30"],
      d=["仮登録を実行して、申込のステータスを「契約設定中」にする（完了の画面 No.9 を出す）。作ったものは申込区分ごとの表のとおり。失敗したら E30。", "Thực hiện đăng ký tạm và đổi trạng thái đơn sang \"契約設定中\" (hiện màn hoàn tất No.9). Những thứ đã tạo theo bảng của loại đơn. Thất bại thì E30."]),
]
IT_MODALC = [
    I("9", "仮登録が完了しました", "Đã đăng ký tạm xong", ".es-dialog__panel", "modal", "show", err=["S102"],
      d=["法人と法人アカウントを上に、下は 1行＝1拠点 で 拠点・親契約・子契約（最初のサイクル）・オーダー・資材の初期セット・拠点アカウント を ID つきで並べる。オーダーは、本導入＝法人が入力できる（アカウント発行済み）／お試し＝自動生成（法人は編集不可）。資材の初期セットは無料の自動生成で、納品日は詳細情報設定の子契約タブで決める。", "Trên là pháp nhân và tài khoản pháp nhân; dưới là mỗi dòng một cơ sở: cơ sở, hợp đồng cha, hợp đồng con (chu kỳ đầu), đơn đặt hàng, bộ vật tư ban đầu, tài khoản cơ sở, kèm ID. Đơn đặt hàng: 本導入 = pháp nhân nhập được (đã cấp tài khoản) / dùng thử = tự sinh (pháp nhân không sửa). Bộ vật tư ban đầu miễn phí, tự sinh, ngày giao quyết ở tab hợp đồng con trong bước thiết lập chi tiết."]),
    I("9.1", "法人と法人アカウント", "Pháp nhân và tài khoản pháp nhân", ".es-dialog__body .c2corp", "area", d=["法人名・法人ID・状態（仮登録）と、法人アカウント（法人のご担当者で共有。ログインID・案内を送った宛先）。アカウントを OFF にしたときは「未発行（仮登録でOFF）」。", "Tên pháp nhân, ID, trạng thái (仮登録) và tài khoản pháp nhân (dùng chung cho người phụ trách pháp nhân; ID đăng nhập và người đã gửi hướng dẫn). Nếu tắt cấp tài khoản thì hiện \"未発行（仮登録でOFF）\"."]),
    I("9.2", "拠点ごとに作ったもの", "Những gì đã tạo theo cơ sở", ".es-dialog__body .c2tab", "table", d=["列：拠点・親契約・子契約（最初のサイクル）・オーダー・資材の初期セット・拠点アカウント（各 ID とバッジ）。", "Cột: cơ sở, hợp đồng cha, hợp đồng con (chu kỳ đầu), đơn đặt hàng, bộ vật tư ban đầu, tài khoản cơ sở (kèm ID và badge)."]),
    I("9.3", "詳細情報の設定へ進む", "Sang thiết lập thông tin chi tiết", ".es-dialog__foot button::詳細情報の設定へ進む", "button", "click", d=["閉じて、詳細情報設定（拠点の表とタブ）へ進む。確定は拠点ごとで、契約開始年月が早い拠点から順に確定できる。", "Đóng và sang bước thiết lập thông tin chi tiết (bảng cơ sở và các tab). Xác nhận theo từng cơ sở, có thể xác nhận lần lượt từ cơ sở có tháng bắt đầu sớm."]),
]

def FID(key):
    return "#dscreen [id$=_" + key + "]"
IT_D_BR = [
    I("10", "拠点の表", "Bảng cơ sở", "#dscreen .brtab", "table",
      d=["詳細情報設定の最初に出す、拠点の一覧（見出し「拠点」）。列：No・拠点名・プラン・開始サイクル月（切替は「本導入の開始日」）・状態・操作。行を押すと、その拠点のタブを開く（編集中に変更があれば Q02）。仮登録のあとの却下・取り下げで対象外になった拠点は「対象外」（灰）。", "Danh sách cơ sở ở đầu bước thiết lập chi tiết (tiêu đề \"拠点\"). Cột: No, tên cơ sở, gói, chu kỳ bắt đầu (chuyển đổi là \"ngày bắt đầu 本導入\"), trạng thái, thao tác. Nhấn dòng để mở tab của cơ sở đó (đang sửa mà có thay đổi thì Q02). Cơ sở bị loại do từ chối / rút lại sau đăng ký tạm hiện \"対象外\" (xám)."]),
    I("10.1", "状態", "Trạng thái", "#dscreen .brtab td .es-badge", "label", d=["設定中（青）／確定済み（緑）／対象外（灰）。", "設定中 (xanh dương) / 確定済み (xanh lá) / 対象外 (xám)."]),
    I("10.2", "この拠点を確定", "Xác nhận cơ sở này", "#dscreen .brconf", "button", "click", err=["Q103", "E103"],
      cond=["確定前の拠点・受付の編集の権限。必須の項目がそろったときだけ押せる（それまでは無効）", "Cơ sở chưa xác nhận・quyền sửa tiếp nhận. Chỉ nhấn được khi đủ mục bắt buộc (trước đó bị vô hiệu)"],
      d=["確定の確認（Q103・No.18）を開く。契約開始年月が早い拠点から順に確定できる。確定すると、子契約・予定・配送データ、資材の初期セットの配送データを作り、親契約は「仮登録 → 有効」、拠点は「仮登録 → 本登録」になる（アカウントを OFF で仮登録していたら、ここで発行）。締切を過ぎているときは、運営が2択を選ぶ（W100）。", "Mở hộp thoại xác nhận (Q103, No.18). Xác nhận được lần lượt từ cơ sở có tháng bắt đầu sớm. Khi xác nhận sẽ tạo hợp đồng con, lịch giao, dữ liệu giao hàng và dữ liệu giao bộ vật tư ban đầu; hợp đồng cha \"仮登録 → 有効\", cơ sở \"仮登録 → 本登録\" (nếu đã tắt cấp tài khoản lúc đăng ký tạm thì cấp ở đây). Quá hạn chót thì vận hành chọn 1 trong 2 (W100)."],
      demo_ok=["確定のボタンの文言はコードでは「この拠点を確定」、確認ダイアログは「正式登録」の語。台帳の「本登録」に揃える。確定の動き（共通データへの子契約・配送の作成）は、いまは画面の中の状態だけ（SetupPanel が共通データの登録を別にしている・H16）", "Trong code nút ghi \"この拠点を確定\", còn hộp thoại xác nhận dùng từ \"正式登録\". Đồng nhất theo \"本登録\" của 台帳. Việc xác nhận (tạo hợp đồng con, dữ liệu giao hàng vào dữ liệu chung) hiện chỉ là trạng thái trong màn hình (SetupPanel đăng ký dữ liệu chung riêng, H16)"]),
    I("11", "タブ（詳細情報設定）", "Tab (thiết lập chi tiết)", "#dscreen .dtabs .es-tabs", "tab", "click", pattern="P-TAB",
      d=["法人／拠点／親契約／子契約／設備・オプション／料金・請求（6個・横の下線）。保存していない必須のタブに「未保存」、保存で不足があったタブに赤い不足の印。まず参照で見せ、「編集」で入力欄にする。", "法人 / 拠点 / 親契約 / 子契約 / 設備・オプション / 料金・請求 (6 tab, gạch chân ngang). Tab bắt buộc chưa lưu có \"未保存\", tab lưu bị thiếu có \"要確認\". Mặc định hiển thị chế độ xem, nhấn \"編集\" để thành ô nhập."]),
    I("11.1", "タブの見出し行", "Dòng tiêu đề tab", "#dscreen .tsub", "label",
      d=["「拠点n｜拠点名」と、右に状態：編集中／確定済み／申込内容確認で確認済み／自動保存／最終更新 日時 運営ユーザー名／未保存／任意。", "\"拠点n｜tên cơ sở\" và bên phải là trạng thái: đang sửa / đã xác nhận / đã xác nhận ở bước xác nhận nội dung đơn / tự lưu / cập nhật lần cuối ngày giờ + tên người dùng / chưa lưu / tùy chọn."]),
]
IT_D_CORP = [
    I("12", "法人の基本情報", "Thông tin cơ bản pháp nhân", "#dscreen .secttl::法人の基本情報", "area",
      d=["新しい法人のときは編集できる（法人名・フリガナ・法人名（契約）・請求先法人名・ES営業担当・法人ステータス・法人ID）。既存の法人（切替・拠点を追加）は参照だけ。ES営業担当は運営のユーザーから選ぶ。", "Pháp nhân mới thì sửa được (tên, furigana, tên theo hợp đồng, tên nhận hóa đơn, ES営業担当, trạng thái pháp nhân, ID). Pháp nhân hiện có (chuyển đổi / thêm cơ sở) chỉ xem. ES営業担当 chọn từ người dùng vận hành."],
      demo_ok=["ES営業担当の選択肢は固定の3名（H19）。運営のユーザー（アカウント一覧）から選ぶ", "Lựa chọn ES営業担当 là 3 người cố định (H19). Chọn từ người dùng vận hành (danh sách tài khoản)"]),
    I("12.1", "請求書に載る住所", "Địa chỉ in trên hóa đơn", "#dscreen .secttl::請求書に載る住所", "area", pattern="P-ADDRESS", err=["E05", "W02"],
      d=["郵便番号・都道府県・市区町村・町名・番地・建物等・電話番号。郵便番号の横に「住所検索」ボタン（郵便番号 → 都道府県・市区町村・町域）。請求書に載る名称・住所で印字できない文字があれば W02。", "Mã bưu điện, tỉnh, quận / huyện, phố・số nhà, tòa nhà, điện thoại. Cạnh mã bưu điện có nút \"住所検索\" (mã bưu điện → tỉnh, quận, khu vực). Có ký tự không in được trên hóa đơn thì W02."],
      demo_ok=["住所検索のボタンがない（H7）。台帳 F 2026-10-07（全サイト共通）どおり郵便番号の横に置く", "Chưa có nút 住所検索 (H7). Đặt cạnh mã bưu điện theo 台帳 F 2026-10-07 (chung toàn hệ thống)"]),
    I("12.2", "法人の担当者", "Người phụ trách pháp nhân", "#dscreen .secttl::法人の担当者", "table", d=["区分（メイン／請求）・担当者名・フリガナ・メールアドレス・電話番号。メイン1・請求1が必須。", "Phân loại (chính / thanh toán), tên, furigana, email, điện thoại. Bắt buộc 1 người chính và 1 người thanh toán."]),
    I("12.3", "請求", "Thanh toán", "#dscreen .secttl::請求", "area",
      d=["請求書の発行単位（まとめて発行／拠点ごと）・請求書発行リードタイム・入金期限・支払方法・口座振替の手続きステータス（口座振替のときだけ・必須）・支払サイクル・起算月（年払いのときだけ・必須）・Bill One 発行先ID。", "Đơn vị xuất hóa đơn (gộp / theo cơ sở), thời gian xuất hóa đơn, hạn thanh toán, phương thức thanh toán, trạng thái thủ tục chuyển khoản (chỉ khi chuyển khoản・bắt buộc), chu kỳ thanh toán, tháng khởi tính (chỉ khi trả theo năm・bắt buộc), ID nơi phát hành Bill One."]),
]
IT_D_BRANCH = [
    I("13", "拠点の基本情報・住所", "Thông tin cơ bản・địa chỉ cơ sở", "#dscreen .secttl::基本情報", "area", pattern="P-ADDRESS",
      d=["拠点名・フリガナ・所属法人・従業員数・拠点ステータス・拠点ID・郵便番号〜建物等・電話番号。郵便番号の横に「住所検索」。", "Tên cơ sở, furigana, pháp nhân, số nhân viên, trạng thái cơ sở, ID cơ sở, mã bưu điện ～ tòa nhà, điện thoại. Cạnh mã bưu điện có \"住所検索\"."],
      demo_ok=["住所検索のボタンがない（H7）", "Chưa có nút 住所検索 (H7)"]),
    I("13.1", "担当者", "Người phụ trách", "#dscreen .secttl::担当者", "table", d=["区分・担当者名・フリガナ・メールアドレス・電話番号。その場で編集（担当者名とメールは必須・メイン1人以上）。", "Phân loại, tên, furigana, email, điện thoại. Sửa tại chỗ (tên và email bắt buộc, ít nhất 1 người chính)."]),
    I("13.2", "請求先と請求条件", "Nơi nhận hóa đơn và điều kiện", "#dscreen .secttl::請求先と請求条件", "area",
      d=["請求先（法人／この拠点）・請求書発行リードタイムの上書き・入金期限・支払方法・口座振替の手続き・支払サイクル・起算月・Bill One 発行先ID。請求先＝この拠点のとき、請求条件の欄が活性になり Bill One 発行先ID が必須。法人のときは非活性（必須にしない）。", "Nơi nhận hóa đơn (pháp nhân / cơ sở này), ghi đè thời gian xuất hóa đơn, hạn thanh toán, phương thức thanh toán, thủ tục chuyển khoản, chu kỳ, tháng khởi tính, ID Bill One. Khi nơi nhận là cơ sở này thì các ô điều kiện được bật và ID Bill One bắt buộc. Khi là pháp nhân thì tắt (không bắt buộc)."]),
    FLD("13.3", "納品不可曜日", "Thứ không giao được", "納品不可曜日", "拠点の納品不可曜日（月〜日・祝日のチェック。どれもチェックしないと「なし」）。配送ルートの納品サイクルでは、この曜日の列は選べない。", "Thứ không giao được của cơ sở (checkbox Thứ Hai〜Chủ Nhật・ngày lễ; không tích gì là \"không có\"). Ở lịch giao của tuyến giao hàng, cột thứ này không chọn được.", demo_ok=["コードでは納品不可曜日は子契約のタブ（配送・納品スケジュール）にあり、拠点のタブにはない。仕様（契約_04・申込フォーム §10-3）は拠点のタブ。仕様に合わせて拠点のタブへ移す", "Trong code thứ không giao được nằm ở tab hợp đồng con (giao hàng・lịch giao), không có ở tab cơ sở. Thiết kế (契約_04, 申込フォーム §10-3) đặt ở tab cơ sở. Cần chuyển sang tab cơ sở theo thiết kế"]),
    I("13.4", "資料", "Tài liệu", "#dscreen .secttl::資料", "area", d=["添付資料（法人に公開）と添付資料（社内のみ・非公開）。ファイル名・形式・容量・登録日・操作（表示・DL）。追加・削除は自動保存。JPG・PNG・PDF・HEIC、1件5MB・10件まで（E11）。", "Tài liệu đính kèm (công khai cho pháp nhân) và (chỉ nội bộ・không công khai). Tên file, định dạng, dung lượng, ngày đăng ký, thao tác (xem, tải). Thêm / xóa tự lưu. JPG・PNG・PDF・HEIC, 5MB/file・tối đa 10 file (E11)."], err=["E11"]),
]
IT_D_PARENT = [
    I("14", "親契約", "Hợp đồng cha", "#dscreen .secttl::親契約", "area",
      d=["親契約番号（CP＋7桁。契約変更・休止・再開をしても変わらない）・契約種別・契約ステータス（仮登録）・開始サイクル月・契約開始年月・代理店コード（紹介有無）・お試し期間（月数）。", "Mã hợp đồng cha (CP + 7 chữ số; không đổi dù đổi hợp đồng / tạm ngưng / mở lại), loại hợp đồng, trạng thái hợp đồng (仮登録), chu kỳ bắt đầu, tháng bắt đầu hợp đồng, mã đại lý (có giới thiệu hay không), thời gian dùng thử (số tháng)."]),
    FLD("14.1", "開始サイクル月", "Chu kỳ bắt đầu", "開始サイクル月", "必須。例「2026年10月（A1 2026/10/12）」。契約はサイクル単位のため日は選ばない。契約開始日は A1 を自動で入れる参照。最低利用期間は契約では設定しない（機種マスタ・設備ごと）。", "Bắt buộc. Vd. \"2026年10月（A1 2026/10/12）\". Hợp đồng theo chu kỳ nên không chọn ngày. Ngày bắt đầu hợp đồng tự điền A1 (chỉ tham khảo). Thời gian sử dụng tối thiểu không đặt ở hợp đồng (theo bảng model, từng thiết bị)."),
    I("14.2", "一覧（子契約）", "Danh sách (hợp đồng con)", "#dscreen .secttl::一覧（子契約）", "table", d=["契約・サイクル月・子契約ID・プラン・配送区分・請求対象月（前払い分）・請求ステータス・生成方法。", "Chu kỳ hợp đồng, ID hợp đồng con, gói, loại giao hàng, tháng được xuất hóa đơn (trả trước), trạng thái hóa đơn, cách sinh."]),
]
IT_D_CHILD = [
    I("15", "子契約の契約", "Hợp đồng con: hợp đồng", "#dscreen .secttl::契約", "area",
      d=["プランID（必須）・メニュー種別（コース。必須）・適用開始月・適用終了月。プラン・コースは申込のとおりが初期値。", "ID gói (bắt buộc), loại thực đơn (khóa; bắt buộc), tháng bắt đầu áp dụng, tháng kết thúc áp dụng. Gói và khóa mặc định theo đơn."]),
    I("15.1", "アプリの利用設定", "Cài đặt dùng app", "#dscreen .secttl::アプリの利用設定（このサイクル月）", "area", d=["ゲストモード・ES-QR・1日上限数（1人あたり）・1ヶ月上限金額（1人あたり）。このサイクル月の値。", "Chế độ khách, ES-QR, số lượng tối đa mỗi ngày (mỗi người), số tiền tối đa mỗi tháng (mỗi người). Giá trị của chu kỳ này."]),
    I("15.2", "配送・納品スケジュール", "Giao hàng・lịch giao", "#dscreen .secttl::配送・納品スケジュール", "area",
      d=["配送区分（必須）・納品不可曜日・納品予定日になった場合（必須：前倒す／後ろ倒す）・配送備考。設備が自販機の拠点は配送区分が ES配送便に固定。", "Phân loại giao hàng (bắt buộc), thứ không giao được, khi đến ngày giao dự kiến (bắt buộc: dời sớm / dời muộn), ghi chú giao hàng. Cơ sở có máy bán hàng tự động cố định ES配送便."]),
    I("15.3", "配送ルート設定", "Cài đặt tuyến giao hàng", "#dscreen .rtt", "table",
      d=["配送種別（冷蔵配送・冷凍配送・資材配送）ごとに：ピッキング倉庫・運送会社（配送会社①）・納品会社（配送会社②）・途中経由1・リードタイム・配送回数・配送パターン（冷蔵・冷凍は ESサイクル、資材は都度配送）・納品サイクル。運送会社・納品会社は常に必須（中継しないときは同じ会社を両方に入れる）。途中経由1は「なし」を明示して選ぶ（既定「なし」）。選択肢は配送会社マスタ（運送会社・委託配送会社・自社便）と倉庫マスタの中継（HU）全件。", "Theo loại giao (giao lạnh, giao đông, giao vật tư): kho lấy hàng, công ty vận chuyển (công ty ①), công ty giao hàng (công ty ②), điểm trung chuyển 1, thời gian chờ, số lần giao, mẫu giao (lạnh / đông là ESサイクル, vật tư là giao khi cần), chu kỳ giao. Công ty vận chuyển và công ty giao hàng luôn bắt buộc (không trung chuyển thì nhập cùng một công ty). Điểm trung chuyển 1 chọn \"なし\" một cách rõ ràng (mặc định \"なし\"). Lựa chọn là toàn bộ bảng công ty giao hàng (vận chuyển, ủy thác, xe công ty) và điểm trung chuyển (HU) trong bảng kho."],
      open=["配送ルートの選択肢（倉庫・運送会社・中継）は固定の見本。倉庫・配送会社マスタ（運営H）から作る", "Lựa chọn tuyến giao (kho, công ty vận chuyển, trung chuyển) là dữ liệu mẫu cố định. Cần lấy từ bảng kho và bảng công ty giao hàng (運営H)"], ask="運営H（倉庫・委託配送先マスタ）"),
    I("15.4", "エリアの既定値を入れる", "Điền giá trị mặc định theo khu vực", "#dscreen button::エリアの既定値を入れる", "button", "click",
      cond=["子契約のタブを編集しているとき", "Khi đang sửa tab hợp đồng con"], d=["倉庫別の既定値（運送会社・納品会社・途中経由・リードタイム・配送パターン・納品サイクル）を入れる。入れたあとで直す。", "Điền giá trị mặc định theo kho (công ty vận chuyển / giao hàng, trung chuyển, thời gian chờ, mẫu giao, chu kỳ giao). Điền xong thì sửa."]),
    I("15.5", "納品サイクル", "Chu kỳ giao hàng", "#dscreen .slotpick", "table", err=["E01"],
      d=["配送回数の分だけ、週A〜D×月〜日の表をクリックして選ぶ（回数を超えては選べない。納品不可曜日の列は選べない）。見出しに「n ／ m 回」と選んだ枠（例 A3 ／ B3 ／ C3）。足りないと赤枠。スペシャルは 1〜28日／末日。", "Nhấn chọn các ô trong bảng tuần A〜D × Thứ Hai〜Chủ Nhật theo số lần giao (không chọn quá số lần; cột thứ không giao được không chọn được). Tiêu đề hiện \"n ／ m 回\" và các khung đã chọn (vd. A3 ／ B3 ／ C3). Thiếu thì viền đỏ. Special là ngày 1〜28 / cuối tháng."]),
    I("15.6", "資材の初期セットの納品日", "Ngày giao bộ vật tư ban đầu", "#dscreen .initset", "date", "input", req="○", len="日付", ex=["2026-10-08", "Ngày giao bộ vật tư ban đầu"], err=["E01"],
      d=["子契約タブの必須。資材の初期セット（資材マスタの「初期セットの数量」・無料・初期セットは月1回の資材オーダーの回数に数えない）の納品日。配送データは本登録で作る。", "Bắt buộc ở tab hợp đồng con. Ngày giao bộ vật tư ban đầu (số lượng \"初期セットの数量\" trong bảng vật tư・miễn phí・không tính vào số lần đặt vật tư mỗi tháng). Dữ liệu giao hàng tạo ở bước đăng ký chính thức."]),
]
IT_D_EQUIP = [
    I("16", "設備の異動", "Chuyển dịch thiết bị", "#dscreen .secttl::設備の異動（この子契約で登録）", "area",
      d=["申込の設備は最初から行で入る。「行を追加」「削除」ができる。列：異動区分（新規貸出／追加貸出／回収／機種変更）・対象の貸出ID・設備区分・機種・数量・月額（税抜）・初期（税抜）・予定日・理由・操作。A型オプション（ES-QR・配送回数追加など）は異動の表に入れず、子契約の①に自動で立つ。", "Thiết bị trong đơn có sẵn thành các dòng. Có \"行を追加\" và \"削除\". Cột: loại chuyển dịch (cho thuê mới / thêm / thu hồi / đổi model), ID cho thuê, loại thiết bị, model, số lượng, tiền tháng (chưa thuế), phí ban đầu (chưa thuế), ngày dự kiến, lý do, thao tác. Tùy chọn loại A (ES-QR, thêm lượt giao...) không đưa vào bảng chuyển dịch mà tự lập ở mục ① của hợp đồng con."]),
    I("16.1", "設置・引揚の予定", "Dự kiến lắp đặt・thu hồi", "#dscreen [id$=_setup]", "date", "input", req="○", len="日付", ex=["2026-10-12", "Ngày mong muốn giao thiết bị / ngày dự kiến lắp"], err=["E01"],
      d=["搬入希望日・設置予定日（1欄・必須）。", "Ngày giao mong muốn / ngày lắp dự kiến (1 ô・bắt buộc)."]),
    I("16.2", "オプション・割引の異動", "Chuyển dịch tùy chọn・giảm giá", "#dscreen .secttl::オプション・割引（このサイクル月）", "area",
      d=["列：異動区分・区分・コード・名称・数量・金額・率（＋請求／−値引き）・適用開始月・理由・操作。申込の希望（例 サイズ差額）が最初から入る。「行を追加」でマスタから選ぶ。他社乗り換えの割引はここで付ける（O11）。", "Cột: loại chuyển dịch, phân loại, mã・tên, số lượng, số tiền・tỷ lệ (+ tính phí / − giảm), tháng bắt đầu áp dụng, lý do, thao tác. Mong muốn trong đơn (vd. chênh lệch cỡ) có sẵn. \"行を追加\" để chọn từ bảng danh mục. Giảm giá chuyển từ công ty khác áp ở đây (O11)."]),
]
IT_D_FEE = [
    I("17", "料金・請求（参照）", "Thanh toán (chỉ xem)", "#dscreen .secttl::① 固定額（前払い）の請求額", "area",
      d=["参照だけ：① 固定額（前払い）の表・金額サマリー（初期／月額／単発／値引き）・内訳。② 実績精算は出さない（最初の子契約は棚卸のあとに立つ）。設備・オプションの行を直すと合計が計算し直される。", "Chỉ xem: bảng ① số tiền cố định (trả trước), tóm tắt số tiền (ban đầu / hàng tháng / một lần / giảm giá), chi tiết. Không hiện ② quyết toán thực tế (hợp đồng con đầu tiên lập sau khi kiểm kê). Sửa dòng thiết bị / tùy chọn thì tổng được tính lại."]),
    I("17.1", "支払情報", "Thông tin thanh toán", "#dscreen .secttl::支払情報", "label", d=["支払方法・支払サイクル（その時点の写し）・請求月。", "Phương thức thanh toán, chu kỳ thanh toán (bản sao tại thời điểm đó), tháng xuất hóa đơn."]),
    I("17.2", "金額サマリー", "Tóm tắt số tiền", "#dscreen .secttl::金額サマリー", "label", d=["① 固定額の合計と内訳（初期／月額／単発／値引き）。金額は右寄せ・「1,000円」・（税抜）。", "Tổng ① số tiền cố định và chi tiết (ban đầu / hàng tháng / một lần / giảm giá). Số tiền căn phải, \"1,000円\", (chưa thuế)."]),
    I("17.3", "値引き・負担額", "Giảm giá・số tiền công ty chịu", "#dscreen .secttl::値引き・負担額", "area", d=["福利厚生の適用（企業負担額。システム管理だけに出す）・価格調整（このサイクル月）。", "Áp dụng phúc lợi (số tiền công ty chịu; chỉ hiện với システム管理), điều chỉnh giá (chu kỳ này)."]),
]
IT_CONFIRM = [
    I("18", "確定の確認", "Xác nhận cơ sở", ".es-dialog__panel", "modal", "show", err=["Q103", "W100"],
      d=["Q103「{拠点名}を本登録しますか？」。対象（拠点）・開始サイクル月・この確定で進む（n／m拠点）・拠点ごとの注記を出す。締切（開始サイクルの前月15日）を過ぎているときは、運営が「翌サイクルへ繰り下げ」か「運営が代理でオーダー」を選ぶ（W100）。", "Q103 \"Đăng ký chính thức {tên cơ sở}?\". Hiển thị đối tượng (cơ sở), chu kỳ bắt đầu, tiến độ (n／m cơ sở), ghi chú theo cơ sở. Quá hạn chót (ngày 15 tháng trước chu kỳ bắt đầu) thì vận hành chọn \"dời sang chu kỳ sau\" hoặc \"vận hành đặt hộ\" (W100)."],
      demo_ok=["コードのダイアログは「正式登録」の語。「本登録」に揃える。締切後の2択（W100）は受付の画面のコードにまだない（承認の画面にだけある）", "Hộp thoại trong code dùng từ \"正式登録\". Đồng nhất \"本登録\". Lựa chọn 2 phương án sau hạn (W100) chưa có ở màn tiếp nhận trong code (chỉ có ở màn duyệt)"]),
    I("18.1", "キャンセル", "Hủy", ".es-dialog__foot button::キャンセル", "button", "click", d=["閉じる。確定しない。", "Đóng, không xác nhận."]),
    I("18.2", "この拠点を確定する", "Xác nhận cơ sở này", ".es-dialog__foot button::この拠点を", "button", "click", err=["S102", "E30"],
      d=["確定する（拠点・親契約・子契約を正式データにし、子契約・予定・配送データ、資材の初期セットの配送データを作る）。完了したら No.19 を出す。", "Xác nhận (chuyển cơ sở, hợp đồng cha, hợp đồng con thành dữ liệu chính thức, tạo hợp đồng con, lịch giao, dữ liệu giao hàng và dữ liệu giao bộ vật tư ban đầu). Xong hiện No.19."]),
]
IT_CONFIRMED = [
    I("19", "拠点を確定しました", "Đã xác nhận cơ sở", ".es-dialog__panel", "modal", "show", err=["S102"],
      d=["「拠点n｜拠点名 を確定しました」。表（項目・名称・確定前→確定後：例 拠点 仮登録→本登録・親契約 仮登録→有効）。アカウントを OFF で仮登録していたら、ここで発行してログイン案内を送った旨を出す。残りの拠点数、または全拠点の確定が完了した旨。", "\"Đã xác nhận cơ sở n｜tên cơ sở\". Bảng (mục, tên, trước → sau xác nhận: vd. cơ sở 仮登録 → 本登録, hợp đồng cha 仮登録 → 有効). Nếu đã tắt cấp tài khoản lúc đăng ký tạm thì hiện thông báo đã cấp và gửi hướng dẫn đăng nhập ở đây. Số cơ sở còn lại hoặc thông báo đã hoàn tất xác nhận toàn bộ."]),
    I("19.1", "確定前→確定後の表", "Bảng trước → sau xác nhận", ".es-dialog__body .es-table", "table", d=["項目・名称・確定前（灰）・確定後（緑）のバッジ。", "Mục, tên, badge trước xác nhận (xám) và sau xác nhận (xanh)."]),
]
IT_DONE = [
    I("20", "申込の受付が完了しました", "Đã hoàn tất tiếp nhận đơn", ".es-dialog__panel", "modal", "show",
      d=["全拠点を確定したときのダイアログ。表：項目・名称・変更前→変更後（法人・拠点・親契約・子契約の最終の状態）。申込のステータスは「完了」になる。", "Hộp thoại khi đã xác nhận toàn bộ cơ sở. Bảng: mục, tên, trước → sau (trạng thái cuối của pháp nhân, cơ sở, hợp đồng cha, hợp đồng con). Trạng thái đơn thành \"完了\"."]),
]
IT_DISCARD = [
    I("21", "編集中の内容を破棄しますか", "Bỏ nội dung đang sửa?", ".es-modal__panel", "modal", "show", err=["Q02"], pattern="P-FORM",
      d=["Q02。編集中に変更があるまま、タブ・拠点・一覧への移動、キャンセルをしたときに出す（ブラウザを閉じる・再読み込みも）。「編集を続ける」で戻る、「破棄して移動」「破棄する」で変更を捨てて移る。", "Q02. Hiện khi có thay đổi lúc đang sửa mà chuyển tab / cơ sở / danh sách hoặc nhấn hủy (cả khi đóng trình duyệt / tải lại). \"編集を続ける\" để quay lại, \"破棄して移動\" / \"破棄する\" để bỏ thay đổi và chuyển."]),
]
IT_REJECT = [
    I("22", "却下・取り下げのモーダル", "Hộp thoại từ chối / rút lại", ".es-modal__panel", "modal", "show", err=["Q101"],
      d=["Q101「この申込を却下／取り下げしますか？」。仮登録のあとは、作った拠点・親契約・子契約・新しい法人を「取消」にし、アカウントを停止し、オーダー・資材の初期セットを取り消す。差戻しはない（直したいときは申し込み直し）。", "Q101 \"Từ chối / rút lại đơn này?\". Sau đăng ký tạm: cơ sở, hợp đồng cha, hợp đồng con, pháp nhân mới đã tạo chuyển sang \"取消\", khóa tài khoản, hủy đơn đặt hàng và bộ vật tư ban đầu. Không có trả lại (muốn sửa thì nộp lại đơn)."]),
    I("22.1", "却下理由", "Lý do từ chối", ".es-modal__panel .es-field::却下理由", "select", "select", req="○", len=["選択（定型の理由 7つ）", "Chọn (7 lý do mẫu)"], init=["選んでください", "Hãy chọn"],
      ex=["設置条件を満たさない", "Chọn 1 trong 7 lý do mẫu"], err=["E02"], cond=["却下のとき", "Khi từ chối"], d=["定型の理由（却下の7つ）から選ぶ。必須。", "Chọn từ lý do mẫu (7 lý do từ chối). Bắt buộc."]),
    I("22.2", "詳しい理由／取り下げの理由", "Lý do chi tiết / lý do rút lại", ".es-modal__panel .es-field::理由", "textarea", "input", req="条件付き", len=["文字列 500（複数行）", "Chuỗi 500 (nhiều dòng)"],
      ex=["お客様から電話で取り下げの連絡あり（2026-10-06）", "Lý do chi tiết (từ chối) hoặc nội dung khách liên hệ (rút lại)"], err=["E01", "E04"],
      cond=["取り下げのとき必須（お客様からの連絡）、却下のときは任意", "Rút lại thì bắt buộc (liên hệ của khách), từ chối thì tùy chọn"],
      d=["取り下げの理由は必須（却下と同じ・台帳 F 2026-10-07・Q8）。一覧の小窓（AW_APPL_001 No.6）の「取り下げ理由」に出る。", "Lý do rút lại bắt buộc (giống từ chối・台帳 F 2026-10-07, Q8). Hiện ở \"取り下げ理由\" trong cửa sổ nhỏ của danh sách (AW_APPL_001 No.6)."]),
    I("22.3", "却下する／取り下げる", "Từ chối / Rút lại", ".es-modal__actions button::する", "button", "click", err=["S102", "E02", "E01"],
      d=["理由を入れていれば実行し、S102 を出して一覧（新規契約タブ）へ戻る。申込のステータスは「却下」「取り下げ済み」。", "Có lý do thì thực hiện, hiện S102 và về danh sách (tab 新規契約). Trạng thái đơn thành \"却下\" / \"取り下げ済み\"."]),
]
IT_CLOSED = [
    I("23", "却下済み・取り下げ済みの申込", "Đơn 却下 / 取り下げ済み", ".card h2::申請情報^", "area",
      d=["受付画面は開かず、理由と日時だけを読む画面（一覧の小窓と同じ内容）。法人／拠点・ステータス・却下した人と日時（取り下げは取り下げ日時）・却下理由（取り下げ理由）。操作のボタンはない。", "Không mở màn tiếp nhận mà chỉ là màn đọc lý do và ngày giờ (cùng nội dung với cửa sổ nhỏ ở danh sách). Pháp nhân / cơ sở, trạng thái, người từ chối và ngày giờ (rút lại: ngày giờ rút lại), lý do từ chối (lý do rút lại). Không có nút thao tác."]),
]
IT_NOTFOUND = [
    I("24", "見つからない", "Không tìm thấy", ".card .pad", "label", "show", err=["I10"],
      d=["申込番号がない・申込でないとき、I10「申請が見つかりません。」と「契約申請管理へ戻る」のリンク。", "Khi mã đơn không có / không phải đơn thì hiện I10 \"申請が見つかりません。\" và link \"契約申請管理へ戻る\"."],
      demo_ok=["コードの文言は「この申請は見つかりません。」。I10 に揃える", "Câu trong code là \"この申請は見つかりません。\". Đồng nhất về I10"]),
]

IT_ROUTE.append(I("5.5", "保存／キャンセル（配送の設定）", "Lưu / Hủy (cài đặt giao hàng)", "#ascreen button::保存", "button", "click", err=["E02", "Q02"],
                  cond=["配送の設定を編集しているとき（倉庫が未入力のあいだは編集で始まる）", "Khi đang sửa cài đặt giao hàng (chưa chọn kho thì mở ở chế độ sửa)"],
                  d=["倉庫が未入力なら「ピッキング倉庫が未設定です（n件）」のトーストと赤枠。そろっていれば保存して「配送の設定を保存しました」。キャンセルで変更があれば Q02。", "Chưa chọn kho thì toast \"ピッキング倉庫が未設定です（n件）\" và viền đỏ. Đủ thì lưu và hiện \"配送の設定を保存しました\". Hủy mà có thay đổi thì Q02."]))
IT_TRIAL = [
    KVR("3.6", "お試し期間", "Thời gian dùng thử", "お試し期間", "既定1ヶ月（開始・終了のサイクル月）。顧客は編集できない。延長は運営だけ（拠点詳細の「お試しを延長する」）。最低利用期間・違約金はない。子契約は自動更新せず、お試し期間の月数ぶんだけ作る。", "Mặc định 1 tháng (chu kỳ bắt đầu・kết thúc). Khách không sửa được. Chỉ vận hành mới gia hạn (\"お試しを延長する\" ở chi tiết cơ sở). Không có thời gian sử dụng tối thiểu và tiền phạt. Hợp đồng con không tự gia hạn, chỉ tạo đúng số tháng dùng thử."),
    I("4.7", "お試しのタイムライン・最初の便の枠", "Mốc thời gian dùng thử・khung chuyến đầu", "#ascreen .rttl", "area",
      d=["お試しは発注締め日（B週・D週の7日目）が基準。B7 までに申込内容確認を終えると次のサイクルから（前半）、D7 までなら次のサイクルの後半（C週）から。契約の枠が前半（例 A2）で後半から始まるときは、配送の設定で後半の枠（例 C2）を選ぶ。後半から始まったサイクルも1ヶ月目に数える。", "Dùng thử lấy ngày chốt đặt hàng (ngày thứ 7 của tuần B・D) làm chuẩn. Xác nhận xong trước B7 thì bắt đầu từ chu kỳ sau (nửa đầu), trước D7 thì từ nửa sau (tuần C) của chu kỳ sau. Khung hợp đồng là nửa đầu (vd. A2) mà bắt đầu từ nửa sau thì chọn khung nửa sau (vd. C2) ở cài đặt giao hàng. Chu kỳ bắt đầu từ nửa sau cũng tính là tháng thứ nhất."]),
]
IT_SWITCH = [
    KVR("3.7", "切り替える親契約・切替タイミング", "Hợp đồng cha chuyển đổi・thời điểm chuyển", "切り替える親契約", "同じ親契約のまま（新しい番号は付けない）。契約種別を本導入に変え、親契約の「契約種別の履歴」に1行足す。切替のタイミングは拠点ごとに個別に決められる。間があくときは休止と同じ扱い（通算1年を超えるときは切替ではなく新規申込）。", "Giữ nguyên hợp đồng cha (không cấp mã mới). Đổi loại hợp đồng sang 本導入 và thêm 1 dòng vào \"lịch sử loại hợp đồng\" của hợp đồng cha. Thời điểm chuyển quyết định riêng theo từng cơ sở. Nếu có khoảng trống thì xử lý như tạm ngưng (quá 1 năm cộng dồn thì không phải chuyển đổi mà là đơn đăng ký mới)."),
    I("4.8", "お試し中の利用実績", "Thực tế sử dụng trong thời gian dùng thử", "#ascreen tr.sec::お試し中の利用実績", "label", d=["お試し期間・納品回数・提供数・棚卸差額（お試しのため請求しない）・利用者アンケートの継続希望。運営が切替の判断に使う。", "Thời gian dùng thử, số lần giao, số suất, chênh lệch kiểm kê (không xuất hóa đơn vì là dùng thử), tỷ lệ muốn tiếp tục trong khảo sát người dùng. Vận hành dùng để quyết định chuyển đổi."]),
    I("4.9", "設備の希望（切替）", "Thiết bị mong muốn (chuyển đổi)", "#ascreen tr.sec::設備の希望（申込内容）", "label", d=["お試し中に置いた設備と、本導入のプランの標準貸出設備との比較（機種変更・追加貸出・そのまま継続）。多い・大きい分の差額は、本導入の最初の請求書で1回だけ請求する（少ないときは返金しない）。", "So sánh thiết bị đã đặt khi dùng thử với thiết bị cho thuê tiêu chuẩn của gói 本導入 (đổi model, thêm, giữ nguyên). Chênh lệch phần nhiều / lớn hơn chỉ tính 1 lần ở hóa đơn đầu tiên của 本導入 (phần ít hơn không hoàn tiền)."]),
    I("4.10", "請求（切替後）", "Thanh toán (sau chuyển đổi)", "#ascreen tr.sec::請求（切替後）", "label", d=["請求先・請求書発行リードタイム・①固定額の合計・最初の請求月・②実績精算の請求月・福利厚生の適用。", "Nơi nhận hóa đơn, thời gian xuất hóa đơn, tổng ① số tiền cố định, tháng hóa đơn đầu tiên, tháng hóa đơn ② quyết toán thực tế, áp dụng phúc lợi."]),
]
IT_SWITCH_D = [
    I("25", "契約種別の期間（切替）", "Giai đoạn loại hợp đồng (chuyển đổi)", "#dscreen .secttl::契約種別の期間（親契約", "table",
      d=["同じ親契約の中で、お試しキャンペーン（終了＝期間として残す）→ 本導入（仮登録 → 確定で有効）の期間を並べる。開始・終了・状態。", "Trong cùng một hợp đồng cha, xếp các giai đoạn: お試しキャンペーン (kết thúc = giữ lại như một giai đoạn) → 本導入 (仮登録 → xác nhận thì thành có hiệu lực). Bắt đầu, kết thúc, trạng thái."]),
    I("25.1", "お試しの終了日・切替後の扱い", "Ngày kết thúc dùng thử・xử lý sau chuyển đổi", "#dscreen .fld::お試しの終了日", "date", "input", req="○", len="日付", ex=["2026-10-31", "Ngày kết thúc dùng thử"], err=["E01"],
      d=["お試しの終了日（必須）。親契約はそのまま（契約種別が本導入になる）。お試しの子契約は履歴に残す（削除しない）。", "Ngày kết thúc dùng thử (bắt buộc). Hợp đồng cha giữ nguyên (loại hợp đồng thành 本導入). Hợp đồng con dùng thử giữ lại trong lịch sử (không xóa)."]),
    I("25.2", "引き継ぐもの・引き継がないもの", "Phần kế thừa・không kế thừa", "#dscreen .secttl::引き継ぐもの・引き継がないもの", "table",
      d=["拠点情報・ゲストモード・ES-QR・設備の貸出は引き継ぐ／プラン・コースは設定し直す／設備の最低利用期間は本導入の開始日から新しく起算／請求は本導入から①②が立つ。", "Kế thừa: thông tin cơ sở, chế độ khách, ES-QR, cho thuê thiết bị / thiết lập lại: gói, khóa / thời gian sử dụng tối thiểu tính mới từ ngày bắt đầu 本導入 / thanh toán: ①② được lập từ 本導入."]),
    I("25.3", "設備の差額（標準貸出設備との比較）", "Chênh lệch thiết bị (so với thiết bị tiêu chuẩn)", "#dscreen .secttl::設備の異動（この子契約で登録）", "table",
      d=["お試し中の貸出と本導入のプランの標準貸出設備を比べた異動（機種変更・追加貸出・異動なし）。差額はサイズ差額・設備配送料などのオプション行になる。運営が機種・金額を直せる。", "Chuyển dịch so sánh cho thuê khi dùng thử với thiết bị tiêu chuẩn của gói 本導入 (đổi model, thêm, không chuyển dịch). Chênh lệch thành dòng tùy chọn như chênh lệch cỡ, phí giao thiết bị... Vận hành sửa được model và số tiền."]),
    I("25.4", "設備の最低利用期間・解約時の回収額", "Thời gian sử dụng tối thiểu・số tiền thu hồi khi hủy", "#dscreen .vbody table::満了日", "table",
      d=["機種・設備の最低利用期間・起算日（本導入の開始日）・満了日・解約時の回収額。お試し中に置いた設備は本導入の開始日から数える。", "Model, thời gian sử dụng tối thiểu, ngày khởi tính (ngày bắt đầu 本導入), ngày hết hạn, số tiền thu hồi khi hủy. Thiết bị đặt khi dùng thử tính từ ngày bắt đầu 本導入."]),
]
IT_WARN = I("15.7", "倉庫・配送回数を変えたときの警告", "Cảnh báo khi đổi kho・số lần giao", "-", "label", "show",
            d=["仮登録のあとで倉庫・配送回数を変えると、「作成済みのオーダー・資材の初期セットに影響する」旨を出し、運営がオーダーを見直す（申込フォーム §10-3・28-100）。直せる。", "Nếu đổi kho・số lần giao sau đăng ký tạm thì hiện thông báo \"ảnh hưởng đến đơn đặt hàng và bộ vật tư ban đầu đã tạo\" và vận hành xem lại đơn đặt hàng (申込フォーム §10-3, 28-100). Vẫn sửa được."],
            demo_ok=["コードに警告がない（見本の画面では倉庫を変えても何も出ない）。台帳・仕様どおり警告を足す", "Code chưa có cảnh báo (ở màn mẫu, đổi kho cũng không hiện gì). Bổ sung cảnh báo theo 台帳・thiết kế"])
IT_LATE = I("18.3", "開始月の扱い（締切後）", "Cách xử lý tháng bắt đầu (sau hạn)", "-", "select", "select", req="○", len=["選択（翌サイクルへ繰り下げ／運営が代理でオーダー）", "Chọn (dời sang chu kỳ sau / vận hành đặt hộ)"],
            init=["開始月を翌サイクルへ繰り下げる", "Dời tháng bắt đầu sang chu kỳ sau"], ex=["運営が代理でオーダーする（今月分）", "Chọn 1 trong 2"], err=["W100"],
            cond=["開始サイクルのオーダー締切を過ぎているとき", "Khi đã quá hạn chót đặt hàng của chu kỳ bắt đầu"],
            d=["W100。締切後に確定するときは、運営が「翌サイクルへ繰り下げ」か「運営が代理でオーダー」を選ぶ（申込フォーム §10-5・hong 回答 2026-10-03 A1）。選んだ内容はお知らせにも書く。締切まで残りの日数は I102 で出す。", "W100. Khi xác nhận sau hạn thì vận hành chọn \"dời sang chu kỳ sau\" hoặc \"vận hành đặt hộ\" (申込フォーム §10-5, hong trả lời 2026-10-03 A1). Nội dung chọn ghi cả vào thông báo. Số ngày còn lại đến hạn hiện bằng I102."],
            demo_ok=["受付の画面のコードには、締切後の2択がない（承認の画面にだけある）。受付にも足す", "Màn tiếp nhận trong code chưa có lựa chọn 2 phương án sau hạn (chỉ có ở màn duyệt). Cần bổ sung cho tiếp nhận"])
IT_ACCT_TOAST = I("1.10", "アカウント発行のトースト", "Toast cấp tài khoản", ".toast", "toast", "show", err=["S102"],
                  d=["アカウント発行：「法人アカウント・拠点アカウントを発行し、全担当者へログイン案内を送りました」、再送：「ログイン案内メールを再送しました（メイン・サブ・請求担当者／お申し込み者）」。完了の文言は S102 に揃える。", "Cấp tài khoản: \"đã cấp tài khoản pháp nhân và tài khoản cơ sở, gửi hướng dẫn đăng nhập cho mọi người phụ trách\"; gửi lại: \"đã gửi lại email hướng dẫn đăng nhập (người chính・phụ・thanh toán / người nộp đơn)\". Câu hoàn tất đồng nhất theo S102."],
                  demo_ok=["コードのトーストは「（デモ）」付きの長い文言（40文字超）。S102 に揃える", "Toast trong code là câu dài (hơn 40 ký tự). Đồng nhất theo S102"])
H0 = pick(IT_HEAD, "1", "1.1")
IT_HEAD_X = [
    I("1", "ヘッダー", "Đầu trang", ".es-pagehead", "area", d=["パンくず：契約申請管理＞申請詳細。タイトル「申請詳細 AP-YYYYMMDD-NNNN」にステータスのバッジ。", "Breadcrumb: 契約申請管理 > 申請詳細. Tiêu đề \"申請詳細 AP-YYYYMMDD-NNNN\" kèm badge trạng thái."]),
    I("1.1", "ステータスのバッジ", "Badge trạng thái", ".es-pagehead__title .es-badge", "label", d=["却下（赤）／取り下げ済み（灰）。", "却下 (đỏ) / 取り下げ済み (xám)."]),
]
VIEWS += [
    V("047", "AW_APPL_003", "① 新規：申請内容", "① Đăng ký mới: 申請内容", "/ops/applications/" + INT,
      pick(IT_HEAD, "1", "1.1", "1.2", "1.5") + IT_TABS_A + IT_INFO, hide=HIDE_IN,
      note=["AP-20260910-0031（株式会社サンプルフーズ・本導入・4拠点）。法人Web の申込フォームの入力内容を拠点ごとの列で読む。画面の上の「共通データの登録（仮登録 → 本登録）」の欄は実装の足場なので、設計書の画像には入れない（H16）。", "AP-20260910-0031 (株式会社サンプルフーズ, 本導入, 4 cơ sở). Đọc nội dung nhập ở form đăng ký Web pháp nhân theo cột từng cơ sở. Khung \"共通データの登録（仮登録 → 本登録）\" ở đầu màn hình là phần giàn giáo của cài đặt nên không đưa vào ảnh thiết kế (H16)."]),
    V("048", "AW_APPL_003", "① 配送の設定（倉庫・配送回数）", "① Cài đặt giao hàng (kho・số lần giao)", "/ops/applications/" + INT,
      pick(IT_HEAD, "1", "1.5") + IT_TABS_A + IT_ROUTE, setup="tab('配送の設定').click();await sleep(700);", hide=HIDE_IN,
      note=["ピッキング倉庫が未入力なので、タブに「要入力」の印があり、編集で始まる。", "Chưa chọn kho lấy hàng nên tab có dấu \"要入力\" và mở ở chế độ sửa."]),
    V("049", "AW_APPL_003", "① 開始スケジュール", "① Lịch bắt đầu", "/ops/applications/" + INT,
      pick(IT_HEAD, "1") + IT_TABS_A + IT_SCHED, setup="tab('開始スケジュール').click();await sleep(700);", hide=HIDE_IN),
    V("050", "AW_APPL_003", "① 共通情報", "① Thông tin chung", "/ops/applications/" + INT,
      pick(IT_HEAD, "1") + IT_TABS_A + IT_COMMON, setup="tab('共通情報').click();await sleep(700);", hide=HIDE_IN,
      note=["申込者の印は山田 太郎（法人のメイン担当者と同じ拠点担当者は「法人のメイン担当者と同じ」）。", "Dấu người nộp đơn là 山田 太郎 (người phụ trách cơ sở trùng người chính pháp nhân thì ghi \"法人のメイン担当者と同じ\")."]),
    V("051", "AW_APPL_003", "仮登録の確認（モーダル）", "Xác nhận đăng ký tạm (modal)", "/ops/applications/" + INT,
      IT_MODALB, setup="await fillwh();document.querySelector('#btnMain').click();await sleep(800);", full=False, hide=HIDE_IN,
      note=["倉庫を入れたあと「申込内容の確認を完了」を押した状態。「アカウントを発行する」は既定 ON。", "Trạng thái sau khi chọn kho và nhấn \"申込内容の確認を完了\". \"アカウントを発行する\" mặc định BẬT."]),
    V("052", "AW_APPL_003", "仮登録が完了しました", "Đã đăng ký tạm xong", "/ops/applications/" + INT,
      IT_MODALC, setup="await fillwh();document.querySelector('#btnMain').click();await sleep(800);btn('仮登録する',document.querySelector('.es-dialog__foot')).click();await sleep(1500);", full=False, hide=HIDE_IN,
      note=["「仮登録する」を押した直後。申込のステータスは「契約設定中」になり、一覧にもそう出る。作られた ID の表（拠点ごとに1行）。", "Ngay sau khi nhấn \"仮登録する\". Trạng thái đơn thành \"契約設定中\", danh sách cũng hiện như vậy. Bảng ID đã tạo (mỗi cơ sở một dòng)."]),
    V("053", "AW_APPL_003", "① お試し：申請内容・お試し期間", "① Dùng thử: 申請内容・thời gian dùng thử", "/ops/applications/" + TRI,
      pick(IT_HEAD, "1", "1.1", "1.5") + IT_TABS_A + pick(IT_INFO, "3", "3.2", "3.3", "3.4") + IT_TRIAL[:1] + [IT_INFO[6]], hide=HIDE_IN,
      note=["AP-20260922-0057（お試しキャンペーン・1拠点）。お試し期間は既定1ヶ月・顧客は編集できない。後半から始まるときは配送の設定で最初の便の枠（例 C2）を選ぶ。", "AP-20260922-0057 (お試しキャンペーン, 1 cơ sở). Thời gian dùng thử mặc định 1 tháng, khách không sửa được. Bắt đầu từ nửa sau thì chọn khung chuyến đầu (vd. C2) ở cài đặt giao hàng."]),
    V("054", "AW_APPL_003", "① お試し：配送の設定（タイムライン・最初の便の枠）", "① Dùng thử: cài đặt giao hàng (mốc thời gian・khung chuyến đầu)", "/ops/applications/" + TRI,
      pick(IT_HEAD, "1", "1.5") + IT_TABS_A + IT_TRIAL[1:] + pick(IT_ROUTE, "5", "5.2", "5.3"), setup="tab('配送の設定').click();await sleep(700);", hide=HIDE_IN,
      note=["お試しの配送の設定には、発注締め日（B7・D7）が基準のタイムラインの説明が出る。資材の初期セットの納品日は、仮登録のあと、詳細情報設定の子契約タブで決める。", "Cài đặt giao hàng của dùng thử có phần giải thích mốc thời gian lấy ngày chốt đặt hàng (B7・D7) làm chuẩn. Ngày giao bộ vật tư ban đầu quyết ở tab hợp đồng con trong bước thiết lập chi tiết sau đăng ký tạm."]),
    V("055", "AW_APPL_003", "① 切替：切替内容確認", "① Chuyển đổi: xác nhận nội dung chuyển đổi", "/ops/applications",
      pick(IT_HEAD, "1", "1.1", "1.5") + IT_TABS_A + pick(IT_INFO, "3", "3.2", "3.3", "3.4") + IT_SWITCH[:1] + IT_SWITCH[1:], hide=HIDE_IN,
      setup="const f={route:'電話',recv:'2026-10-05',es:'佐々木 桜',corpKind:'既存の法人',cname:'',ckana:'',cbill:'',caddr:'',ctel:'',corp:'CU00071 株式会社みちのく商事',pname:'小林 優子',pkana:'コバヤシ ユウコ',pmail:'kobayashi@example.com',ptel:'022-200-1100',branches:[{kubun:'切替（お試し→本導入）',name:'仙台本社',zip:'980-0021',addr:'宮城県仙台市青葉区中央1-1-1',plan:'ES000003 50プラン（ESライト）',course:'ESライト',ship:'COOL便',ng:'',eq:'冷蔵庫',start:'2026-12',staff:'',billTo:'この拠点',note:''}],doc:'',photo:''};await area('createIntake',{form:f});const o=await area('overview',null);const x=o.intakes.find(i=>i.kubun==='切替'&&i.company.includes('みちのく'));await go('/ops/applications/'+x.no);",
      note=["代理入力（新規登録）で、お試し中の拠点（仙台本社）の切替を登録した申込（受付中）。受付の中身は切替の見本（切替内容の確認）を表示する。", "Đơn (受付中) đăng ký chuyển đổi cơ sở đang dùng thử (仙台本社) bằng nhập hộ (đăng ký mới). Nội dung tiếp nhận hiển thị mẫu chuyển đổi (xác nhận nội dung chuyển đổi)."]),
]

D_H = pick(IT_HEAD, "1", "1.1", "1.2", "1.3", "1.4")
VIEWS += [
    V("056", "AW_APPL_003", "③ 詳細情報設定：拠点の表・タブ「法人」", "③ Thiết lập chi tiết: bảng cơ sở・tab \"法人\"", "/ops/applications/" + SET,
      pick(IT_HEAD, "1", "1.1", "1.2", "1.3", "1.4") + IT_D_BR + IT_D_CORP, setup="tab('法人').click();await sleep(700);", hide=HIDE_IN,
      note=["AP-20260920-0052（株式会社あおば工業・本導入・契約設定中）。「契約設定中」の申込は詳細情報設定から開く。法人のタブは、新しい法人のときだけ編集でき、申込内容確認で確認済みの内容を参照で見せる。", "AP-20260920-0052 (株式会社あおば工業, 本導入, 契約設定中). Đơn \"契約設定中\" mở từ bước thiết lập thông tin chi tiết. Tab pháp nhân chỉ sửa được khi là pháp nhân mới, nội dung đã xác nhận ở bước xác nhận đơn hiển thị ở chế độ xem."]),
    V("057", "AW_APPL_003", "③ タブ「拠点」", "③ Tab \"拠点\"", "/ops/applications/" + SET,
      [IT_D_BR[3], IT_D_BR[4]] + IT_D_BRANCH, setup="tab('拠点').click();await sleep(700);", hide=HIDE_IN),
    V("058", "AW_APPL_003", "③ タブ「親契約」", "③ Tab \"親契約\"", "/ops/applications/" + SET,
      [IT_D_BR[3], IT_D_BR[4]] + IT_D_PARENT, setup="tab('親契約').click();await sleep(700);", hide=HIDE_IN,
      note=["契約種別・開始サイクル月・契約開始年月。最低利用期間は契約では設定しない（機種マスタ・設備ごと）。", "Loại hợp đồng, chu kỳ bắt đầu, tháng bắt đầu hợp đồng. Thời gian sử dụng tối thiểu không đặt ở hợp đồng (theo bảng model, từng thiết bị)."]),
    V("059", "AW_APPL_003", "③ タブ「子契約」（編集中）", "③ Tab \"子契約\" (đang sửa)", "/ops/applications/" + SET,
      pick(IT_HEAD, "1.7", "1.8") + [IT_D_BR[3], IT_D_BR[4]] + IT_D_CHILD, hide=HIDE_IN,
      note=["保存していない必須のタブは、開いたときから編集で始まる（見出しに「編集中」、ボタンは キャンセル／保存）。プラン・コース・配送区分・納品不可曜日・配送ルート・納品サイクル・資材の初期セットの納品日を入れる。", "Tab bắt buộc chưa lưu mở thẳng ở chế độ sửa (tiêu đề \"編集中\", nút Hủy / Lưu). Nhập gói, khóa, loại giao hàng, thứ không giao được, tuyến giao hàng, chu kỳ giao, ngày giao bộ vật tư ban đầu."]),
    V("060", "AW_APPL_003", "③ タブ「設備・オプション」", "③ Tab \"設備・オプション\"", "/ops/applications/" + SET,
      [IT_D_BR[3], IT_D_BR[4]] + IT_D_EQUIP, setup="tab('設備・オプション').click();await sleep(800);", hide=HIDE_IN,
      note=["申込の設備（冷蔵庫・資材ボックス）が新規貸出の行として最初から入る。オプションには申込の希望（サイズ差額）が入る。", "Thiết bị trong đơn (tủ lạnh, hộp vật tư) có sẵn thành các dòng cho thuê mới. Tùy chọn có sẵn mong muốn trong đơn (chênh lệch cỡ)."]),
    V("061", "AW_APPL_003", "③ タブ「料金・請求」", "③ Tab \"料金・請求\"", "/ops/applications/" + SET,
      [IT_D_BR[3], IT_D_BR[4]] + IT_D_FEE, setup="tab('料金・請求').click();await sleep(700);", hide=HIDE_IN),
    V("062", "AW_APPL_003", "③ 保存：必須が足りない（要確認・赤枠）", "③ Lưu: thiếu mục bắt buộc (要確認・viền đỏ)", "/ops/applications/" + SET,
      pick(IT_HEAD, "1.7", "1.8") + [IT_D_BR[3], IT_D_BR[4], IT_D_CHILD[3], IT_D_CHILD[4]] + [IT_D_CHILD[5]], setup="document.querySelector('#btnSave').click();await sleep(700);", hide=HIDE_IN,
      note=["何も入れずに「保存」を押した状態。足りない欄は赤枠（配送ルートの倉庫・運送会社・納品会社・リードタイム・納品サイクル・資材の初期セットの納品日）。トースト「入力内容に不足があります（n件）」とタブの「要確認」。", "Trạng thái nhấn \"保存\" khi chưa nhập gì. Ô thiếu viền đỏ (kho, công ty vận chuyển, công ty giao hàng, thời gian chờ, chu kỳ giao, ngày giao bộ vật tư ban đầu). Toast \"入力内容に不足があります（n件）\" và \"要確認\" ở tab."]),
    V("063", "AW_APPL_003", "④ 「この拠点を確定」が押せない", "④ Không nhấn được \"この拠点を確定\"", "/ops/applications/" + SET,
      [pick(IT_D_BR, "10")[0], pick(IT_D_BR, "10.1")[0], pick(IT_D_BR, "10.2")[0]], hide=HIDE_IN,
      note=["必須の項目（子契約・設備・オプションのタブ）がそろっていない拠点は、確定のボタンが無効。契約開始年月が早い拠点から順に確定できる。", "Cơ sở chưa đủ mục bắt buộc (tab hợp đồng con, thiết bị・tùy chọn) thì nút xác nhận bị vô hiệu. Có thể xác nhận lần lượt từ cơ sở có tháng bắt đầu sớm."]),
    V("064", "AW_APPL_003", "④ 拠点の確定の確認（モーダル）", "④ Xác nhận cơ sở (modal)", "/ops/applications/" + SET,
      IT_CONFIRM[:2] + [IT_CONFIRM[2]], hide=HIDE_IN, full=False,
      setup="await readybr();document.querySelector('#dscreen .brconf').click();await sleep(700);",
      note=["子契約・設備・オプションを保存して、必須がそろった拠点で「この拠点を確定」を押した状態。", "Trạng thái đã lưu hợp đồng con, thiết bị・tùy chọn và nhấn \"この拠点を確定\" ở cơ sở đủ mục bắt buộc."]),
    V("065", "AW_APPL_003", "④ 拠点を確定しました", "④ Đã xác nhận cơ sở", "/ops/applications/" + SET,
      IT_CONFIRMED, hide=HIDE_IN, full=False,
      setup="await readybr();document.querySelector('#dscreen .brconf').click();await sleep(700);btn('この拠点を',document.querySelector('.es-dialog__foot')).click();await sleep(1200);",
      note=["確定前（仮登録）→ 確定後（本登録・有効）の表。残りの拠点は準備ができ次第、個別に確定する。", "Bảng trước (仮登録) → sau xác nhận (本登録・有効). Các cơ sở còn lại xác nhận riêng khi sẵn sàng."]),
    V("066", "AW_APPL_003", "全拠点を確定（申込の受付が完了）", "Xác nhận toàn bộ cơ sở (hoàn tất tiếp nhận đơn)", "/ops/applications/" + SET,
      [pick(IT_HEAD, "1.1")[0], pick(IT_HEAD, "1.9")[0]] + IT_DONE, hide=HIDE_IN, full=False,
      setup="await readybr();document.querySelector('#dscreen .brconf').click();await sleep(700);btn('この拠点を',document.querySelector('.es-dialog__foot')).click();await sleep(1000);btn('閉じる',document.querySelector('.es-dialog__foot')).click();await sleep(500);for(let k=1;k<4;k++){await brow(k);await readybr();const bs=[...document.querySelectorAll('#dscreen .brconf')].filter(b=>!b.disabled);if(bs[0]){bs[0].click();await sleep(700);btn('この拠点を',document.querySelector('.es-dialog__foot')).click();await sleep(1000);if(k<3){btn('閉じる',document.querySelector('.es-dialog__foot')).click();await sleep(500);}}}await sleep(600);const dn=btn('申請完了の内容を確認');if(dn){dn.click();await sleep(700);}",
      note=["4拠点をすべて確定したあとのダイアログ。申込のステータスは「完了」になる。", "Hộp thoại sau khi xác nhận cả 4 cơ sở. Trạng thái đơn thành \"完了\"."]),
    V("067", "AW_APPL_003", "アカウント発行／再送", "Cấp / gửi lại tài khoản", "/ops/applications/" + SET,
      [pick(IT_HEAD, "1.4")[0], IT_ACCT_TOAST], hide=HIDE_IN, full=False,
      setup="btn('アカウント',document.querySelector('#phead')).click();await sleep(600);",
      note=["仮登録でアカウントを OFF にしていた申込の「アカウント発行」。押すと発行して、ボタンは「アカウント再送」に変わる。", "\"アカウント発行\" của đơn đã tắt cấp tài khoản lúc đăng ký tạm. Nhấn thì cấp và nút đổi thành \"アカウント再送\"."]),
    V("068", "AW_APPL_003", "申込の却下（理由必須）", "Từ chối đơn (bắt buộc lý do)", "/ops/applications/AP-20261003-0069",
      IT_REJECT[:2] + [IT_REJECT[3]], hide=HIDE_IN, full=False,
      setup="btn('却下',document.querySelector('#phead')).click();await sleep(500);",
      note=["AP-20261003-0069（受付中）。理由を選ばずに「却下する」を押すと E02。差戻しはない。", "AP-20261003-0069 (受付中). Nhấn \"却下する\" khi chưa chọn lý do thì E02. Không có trả lại."]),
    V("069", "AW_APPL_003", "仮登録のあとの取り下げ（運営だけ）", "Rút lại sau đăng ký tạm (chỉ vận hành)", "/ops/applications/" + SET,
      [pick(IT_HEAD, "1.3")[0]] + IT_REJECT[:1] + IT_REJECT[2:], hide=HIDE_IN, full=False,
      setup="btn('取り下げ',document.querySelector('#phead')).click();await sleep(500);",
      note=["契約設定中（仮登録のあと）の申込の取り下げ。取り下げの理由（お客様からの連絡）は必須。作った拠点・親契約・子契約・新しい法人は「取消」、アカウントは停止。", "Rút lại đơn 契約設定中 (sau đăng ký tạm). Lý do rút lại (liên hệ của khách) bắt buộc. Cơ sở, hợp đồng cha, hợp đồng con, pháp nhân mới đã tạo thành \"取消\", khóa tài khoản."]),
    V("070", "AW_APPL_003", "却下済みの申込（理由・日時だけ）", "Đơn đã 却下 (chỉ lý do・ngày giờ)", "/ops/applications/AP-20260915-0048",
      IT_HEAD_X + IT_CLOSED,
      note=["AP-20260915-0048（却下）。一覧の小窓と同じ内容。取り下げ済みは AP-20260918-0050 で同じ画面（「取り下げ日時」「取り下げ理由」）。", "AP-20260915-0048 (却下). Cùng nội dung với cửa sổ nhỏ ở danh sách. Đơn 取り下げ済み (AP-20260918-0050) cũng cùng màn hình (\"取り下げ日時\", \"取り下げ理由\")."]),
    V("071", "AW_APPL_003", "締切後に確定（運営が2択から選ぶ）", "Xác nhận sau hạn (vận hành chọn 1 trong 2)", "/ops/applications/" + SET,
      IT_CONFIRM[:2] + [IT_LATE, IT_CONFIRM[2]], hide=HIDE_IN, full=False, today="2026/10/16",
      setup="await readybr();document.querySelector('#dscreen .brconf').click();await sleep(700);",
      note=["デモの今日が 2026-10-16（開始サイクル 2026-10 の締切 9/15 の後）の状態。確定のダイアログに、運営が「翌サイクルへ繰り下げ」か「運営が代理でオーダー」を選ぶ欄が要る（コードは未実装）。", "Hôm nay của demo là 2026-10-16 (sau hạn 9/15 của chu kỳ bắt đầu 2026-10). Hộp thoại xác nhận cần có ô để vận hành chọn \"dời sang chu kỳ sau\" hoặc \"vận hành đặt hộ\" (code chưa cài đặt)."]),
    V("072", "AW_APPL_003", "倉庫・配送回数を仮登録のあとで変える（警告）", "Đổi kho・số lần giao sau đăng ký tạm (cảnh báo)", "/ops/applications/" + SET,
      [IT_D_CHILD[3], IT_WARN], hide=HIDE_IN,
      setup="const s=document.querySelector('#dscreen .rtt select');setsel(s,'WH00002 関西倉庫');await sleep(500);",
      note=["子契約タブで倉庫を変えた状態。仮登録のあとで変えるときは「作成済みのオーダー・資材の初期セットに影響する」旨の警告が要る（コードは未実装）。", "Trạng thái đã đổi kho ở tab hợp đồng con. Khi đổi sau đăng ký tạm cần cảnh báo \"ảnh hưởng đến đơn đặt hàng và bộ vật tư ban đầu đã tạo\" (code chưa cài đặt)."]),
    V("073", "AW_APPL_003", "③ 切替：契約種別の切替・本導入の開始日", "③ Chuyển đổi: chuyển loại hợp đồng・ngày bắt đầu 本導入", "/ops/applications/" + SWI,
      pick(IT_HEAD, "1", "1.1") + [IT_D_BR[0]] + IT_SWITCH_D[:3], hide=HIDE_IN,
      note=["AP-20261005-0071（みらい商事 名古屋本社・京都支店・切替・契約設定中）。切替は同じ親契約のまま契約種別を本導入に変える。確定のボタンは「この拠点の切替を確定」。", "AP-20261005-0071 (みらい商事 名古屋本社・京都支店, chuyển đổi, 契約設定中). Chuyển đổi giữ nguyên hợp đồng cha và đổi loại hợp đồng sang 本導入. Nút xác nhận là \"この拠点の切替を確定\"."]),
    V("074", "AW_APPL_003", "③ 切替：設備の差額（標準貸出設備との比較）", "③ Chuyển đổi: chênh lệch thiết bị (so với thiết bị tiêu chuẩn)", "/ops/applications/" + SWI,
      IT_SWITCH_D[3:] + [IT_D_EQUIP[1], IT_D_EQUIP[2]], setup="tab('設備・オプション').click();await sleep(800);", hide=HIDE_IN,
      note=["お試し中に置いた冷蔵庫（48L）を本導入の希望（142L）へ機種変更する差額を、本導入の最初の請求書で1回だけ請求する。", "Chênh lệch đổi tủ lạnh đã đặt khi dùng thử (48L) sang cỡ mong muốn khi 本導入 (142L) chỉ tính 1 lần ở hóa đơn đầu tiên của 本導入."]),
    V("075", "AW_APPL_003", "編集中の内容を破棄しますか（モーダル）", "Bỏ nội dung đang sửa? (modal)", "/ops/applications/" + SET,
      IT_DISCARD, hide=HIDE_IN, full=False,
      setup="const s=document.querySelector('#dscreen .rtt select');setsel(s,'WH00001 関東倉庫');await sleep(400);tab('法人').click();await sleep(600);",
      note=["子契約タブを編集して変更したまま、別のタブへ移ろうとした状態。", "Trạng thái đã sửa tab hợp đồng con rồi muốn chuyển sang tab khác."]),
    V("076", "AW_APPL_003", "見つからない（I10）", "Không tìm thấy (I10)", "/ops/applications/AP-99999999-9999",
      IT_HEAD_X[:1] + IT_NOTFOUND),
]


# ================================================================ AW_APPL_004 新規登録（代理入力）
# 電話・営業・紙で受けた新規申込を、運営が代わりに入力する（入口は契約申請管理「新規契約」タブの「新規登録（代理入力）」だけ・台帳 28-33）。
# 入力は「法人Web と同じ項目・同じチェック＋運営だけの項目（受付経路・入力者・ES営業担当・契約区分・お試し期間月数・アカウントを発行するか）」（申込フォーム §10-8・H17）。
# 登録すると受付中の申込が1件でき、あとは受付（AW_APPL_003）と同じ流れ。
H += (
    "const nff=(label,n)=>[...document.querySelectorAll('#nf .fld')].filter(f=>{const l=f.querySelector('.fl');return l&&l.textContent.trim().startsWith(label);})[n||0];"
    "const nfs=(label,v,n)=>{const e=nff(label,n).querySelector('select');setsel(e,v);};"
    "const nfi=(label,v,n)=>{const e=nff(label,n).querySelector('input,textarea');setv(e,v);};"
    "const nffill=async()=>{nfs('受付経路','電話');nfi('法人名','みずほ食品株式会社');nfi('法人名フリガナ','ミズホショクヒンカブシキガイシャ');nfi('請求先法人名','みずほ食品株式会社');nfi('担当者名','青木 一郎');nfi('フリガナ','アオキ イチロウ');nfi('メールアドレス','aoki@mizuho-foods.example');"
    "nfs('契約区分','本導入');nfi('拠点名','みずほ食品 本社');nfi('郵便番号','105-0011');nfi('住所','東京都港区芝公園1-2-3 芝公園ビル5F');nfs('プラン','ES000003 50プラン（ESライト）');nfs('コース','ESライト');nfs('配送区分','ES配送便');nfs('設備の希望','冷蔵庫');nfi('開始サイクル月','2026-12');await sleep(300);};"
)
def NF(no, ja, vi, label, kind, dj, dv, **kw):
    trig = {"select": "select", "date": "input", "text": "input", "textarea": "input", "month": "input", "label": "view", "file": "upload", "check": "check"}.get(kind, "input")
    return I(no, ja, vi, "#nf .fld::" + label, kind, trig, d=[dj, dv], **kw)
NFH = [
    I("1", "ヘッダー", "Đầu trang", ".es-pagehead", "area",
      d=["パンくず：契約申請管理＞契約申込新規登録。タイトル「契約申込新規登録（代理入力）」。入力中にパンくず・キャンセル・メニューで離れるときは、入力があれば Q02。", "Breadcrumb: 契約申請管理 > 契約申込新規登録. Tiêu đề \"契約申込新規登録（代理入力）\". Khi đang nhập mà rời đi bằng breadcrumb / hủy / menu thì có nhập là hiện Q02."]),
    I("1.1", "キャンセル", "Hủy", ".es-pagehead__actions button::キャンセル", "button", "click", err=["Q02"],
      d=["入力があれば Q02（No.8）。なければ一覧（新規契約タブ）へ戻る。", "Có nhập thì hiện Q02 (No.8). Không thì về danh sách (tab 新規契約)."]),
    I("1.2", "登録", "Đăng ký", ".es-pagehead__actions button::登録", "button", "click", pattern="P-FORM", err=["S101", "E01", "E02", "E30", "E31"],
      cond=["代理入力の権限（機能ごとの操作＝フル権限・システム管理・CS の R/U）", "Quyền nhập hộ (thao tác theo chức năng = フル権限・システム管理・CS có R/U)"],
      d=["全項目をまとめてチェックし、足りない欄は赤枠と文言（トースト「入力されていない項目があります（n件）」）。そろっていれば登録して、受付中の申込を1件つくり、S101 を出して一覧へ戻る（登録した行は先頭に「代理入力」の印つき）。受付経路・入力者は申込の履歴に残る（ログイン＝「代理入力：運営ユーザー名」）。申込フォーム（法人Web）と同じチェック（入力チェック §9）をかける。", "Kiểm tra mọi mục; ô thiếu viền đỏ và câu thông báo (toast \"入力されていない項目があります（n件）\"). Đủ thì đăng ký, tạo 1 đơn 受付中, hiện S101 và về danh sách (dòng vừa đăng ký ở đầu, có dấu \"代理入力\"). Kênh tiếp nhận và người nhập được lưu vào lịch sử đơn (log: \"代理入力：tên người dùng vận hành\"). Dùng cùng kiểm tra với form đăng ký (Web pháp nhân) (入力チェック §9)."],
      demo_ok=["コードのチェックは必須・郵便番号の有無だけで、文字数上限・カナ・メール形式・絵文字・全角→半角がない（H5）。文言は直書き（ID なし）。E01・E02・E04・E05・E07・E13 に揃える。代理入力を「作成」扱い（CS は押せない）→台帳どおり機能ごとの操作に（Q1）", "Kiểm tra trong code chỉ có bắt buộc và mã bưu điện; chưa có giới hạn ký tự, katakana, định dạng email, emoji, đổi toàn góc→bán góc (H5). Câu chữ ghi trực tiếp (không có ID). Cần đồng nhất về E01・E02・E04・E05・E07・E13. Code tính nhập hộ là \"tạo\" (CS không bấm được) → sửa thành thao tác theo chức năng theo 台帳 (Q1)"]),
]
NFA = [
    I("2", "受付の情報", "Thông tin tiếp nhận", "#nf .card h2::受付の情報^", "area", d=["どこから受けたか（履歴に残る）。運営だけの項目。", "Nhận từ đâu (lưu vào lịch sử). Mục chỉ dành cho vận hành."]),
    NF("2.1", "受付経路", "Kênh tiếp nhận", "受付経路", "select", "必須。選択（電話／営業（訪問）／紙の申込書／メール／その他）。申込の履歴と一覧の「代理入力」の印に残る。", "Bắt buộc. Chọn (điện thoại / nhân viên kinh doanh (đến thăm) / đơn giấy / email / khác). Lưu vào lịch sử đơn và dấu \"代理入力\" của danh sách.", req="○", len=["選択（電話／営業（訪問）／紙の申込書／メール／その他）", "Chọn (điện thoại / kinh doanh / đơn giấy / email / khác)"], init=["選択してください", "Hãy chọn"], ex=["電話", "Chọn 1 kênh"], err=["E02"]),
    NF("2.2", "受付日", "Ngày tiếp nhận", "受付日", "date", "必須。初期値は今日（yyyy-mm-dd）。申込日として一覧の「申請日」に出る。", "Bắt buộc. Mặc định hôm nay (yyyy-mm-dd). Hiện là \"申請日\" trong danh sách.", req="○", len="日付", init=["今日", "Hôm nay"], ex=["2026-10-05", "Ngày nhận điện thoại / đơn"], err=["E01"]),
    NF("2.3", "入力者", "Người nhập", "入力者", "label", "ログイン中の運営ユーザー名（読むだけ）。ログは「代理入力：運営ユーザー名」で残る。", "Tên người dùng vận hành đang đăng nhập (chỉ đọc). Log ghi \"代理入力：tên người dùng vận hành\".",
       demo_ok=["コードは入力者が固定の見本（にっしぐち（運営））。ログイン中のユーザーにする", "Code cố định người nhập (にっしぐち（運営））. Sửa thành người dùng đang đăng nhập"]),
    NF("2.4", "ES営業担当", "Nhân viên ES phụ trách", "ES営業担当", "select", "選択。運営のユーザーから選ぶ（任意）。法人の ES営業担当の初期値になる。", "Chọn. Chọn từ người dùng vận hành (tùy chọn). Thành giá trị mặc định ES営業担当 của pháp nhân.", req="－", len=["選択（運営のユーザー）", "Chọn (người dùng vận hành)"], init=["選択してください", "Hãy chọn"], ex=["佐々木 桜", "Chọn 1 người"],
       demo_ok=["コードの選択肢は固定の3名（H19）。運営のユーザー（アカウント一覧）から選ぶ", "Lựa chọn trong code là 3 người cố định (H19). Chọn từ người dùng vận hành (danh sách tài khoản)"]),
    I("3", "法人", "Pháp nhân", "#nf .card h2::法人^", "area", d=["既存の法人に拠点を足すときは「既存の法人」を選ぶ。法人Web の申込フォーム ステップ2（法人のご情報）と同じ項目。", "Khi thêm cơ sở cho pháp nhân hiện có thì chọn \"既存の法人\". Cùng mục với bước 2 (thông tin pháp nhân) của form đăng ký Web pháp nhân."]),
    NF("3.1", "法人の区分", "Phân loại pháp nhân", "法人の区分", "select", "新しい法人／既存の法人。切り替えると、下の欄（新しい法人の入力／既存の法人の選択）が入れ替わる。", "Pháp nhân mới / hiện có. Đổi thì các ô bên dưới (nhập pháp nhân mới / chọn pháp nhân hiện có) hoán đổi.", req="○", len=["選択（新しい法人／既存の法人）", "Chọn (pháp nhân mới / hiện có)"], init=["新しい法人", "Pháp nhân mới"], ex=["既存の法人", "Chọn khi thêm cơ sở cho pháp nhân hiện có"]),
    NF("3.2", "法人名", "Tên pháp nhân", "法人名", "text", "新しい法人のとき必須。1行の文字は60文字まで（E04）。前後の空白を取る・全角の数字・英字は半角に直す・絵文字は不可（E13）。", "Bắt buộc khi là pháp nhân mới. Ô 1 dòng tối đa 60 ký tự (E04). Cắt khoảng trắng đầu cuối, đổi số / chữ toàn góc sang bán góc, không cho emoji (E13).", req="条件付き", len="文字列 60", ex=["みずほ食品株式会社", "Tên pháp nhân (viết đầy đủ)"], err=["E01", "E04", "E13", "W02"],
       demo_ok=["コードは文字数の上限がない（H5）", "Code chưa có giới hạn ký tự (H5)"]),
    NF("3.3", "法人名フリガナ", "Furigana tên pháp nhân", "法人名フリガナ", "text", "新しい法人のとき必須。全角カタカナ・長音・スペース（E03）。60文字まで。", "Bắt buộc khi là pháp nhân mới. Katakana toàn góc, dấu kéo dài, khoảng trắng (E03). Tối đa 60 ký tự.", req="条件付き", len="文字列 60", ex=["ミズホショクヒンカブシキガイシャ", "Katakana toàn góc"], err=["E01", "E03", "E04"],
       demo_ok=["コードはカタカナかを確かめない（H5）", "Code chưa kiểm tra katakana (H5)"]),
    NF("3.4", "請求先法人名", "Tên pháp nhân nhận hóa đơn", "請求先法人名", "text", "新しい法人のとき必須。請求書の宛名（法人名と同じなら同じ名前）。60文字まで。", "Bắt buộc khi là pháp nhân mới. Tên người nhận trên hóa đơn (giống tên pháp nhân thì nhập cùng tên). Tối đa 60 ký tự.", req="条件付き", len="文字列 60", ex=["みずほ食品株式会社", "Tên in trên hóa đơn"], err=["E01", "E04", "W02"]),
    NF("3.5", "請求書に載る住所", "Địa chỉ in trên hóa đơn", "請求書に載る住所", "text", "郵便番号（数字7桁・E05）・都道府県・市区町村〜番地・建物を入れる。郵便番号の横に「住所検索」（郵便番号 → 都道府県・市区町村・町域）。住所は255文字まで。", "Nhập mã bưu điện (7 chữ số・E05), tỉnh, quận / huyện ~ số nhà, tòa nhà. Cạnh mã bưu điện có \"住所検索\". Địa chỉ tối đa 255 ký tự.", req="○", len="文字列 255", pattern="P-ADDRESS", ex=["〒105-0011 東京都港区芝公園1-2-3 芝公園ビル5F", "Mã bưu điện và địa chỉ"], err=["E01", "E04", "E05", "W02"],
       demo_ok=["コードは「郵便番号・住所」の1欄（任意）で、住所検索がない（H7・H17）。法人Web の申込フォームと同じく、郵便番号・都道府県・市区町村〜番地・建物に分け、必須にする", "Code chỉ có 1 ô \"mã bưu điện・địa chỉ\" (tùy chọn), không có 住所検索 (H7, H17). Cần tách thành mã bưu điện, tỉnh, quận / huyện ~ số nhà, tòa nhà và bắt buộc giống form đăng ký Web pháp nhân"]),
    I("3.6", "電話番号", "Số điện thoại", "#nf .card:nth-of-type(2) .fld::電話番号", "text", "input", req="○", len="文字列 20", ex=["03-1234-5678", "Chữ số và dấu gạch ngang (10〜11 chữ số)"], err=["E01", "E06"],
      d=["数字とハイフン（ハイフンを除いて10〜11桁）。", "Chữ số và dấu gạch ngang (bỏ gạch thì 10〜11 chữ số)."],
      demo_ok=["コードは任意で、形式を確かめない（H5・H17）", "Code là tùy chọn và chưa kiểm tra định dạng (H5, H17)"]),
    NF("3.7", "法人", "Pháp nhân (hiện có)", "法人", "select", "既存の法人のとき必須。法人ID・法人名で選ぶ。切替（お試し→本導入）は既存の法人を選ぶ。", "Bắt buộc khi là pháp nhân hiện có. Chọn theo ID hoặc tên pháp nhân. Chuyển đổi (dùng thử → 本導入) thì chọn pháp nhân hiện có.", req="条件付き", len=["選択（法人マスタの法人）", "Chọn (pháp nhân trong bảng pháp nhân)"], init=["法人ID・法人名で選ぶ", "Chọn theo ID・tên pháp nhân"], ex=["CU00001 株式会社サンプル", "Chọn 1 pháp nhân"], err=["E02"],
       demo_ok=["コードの選択肢は固定の見本（6社）。法人一覧（共通データ）から作る", "Lựa chọn trong code là dữ liệu mẫu cố định (6 công ty). Cần lấy từ danh sách pháp nhân (dữ liệu chung)"]),
    I("3.8", "法人の支払い方法・支払サイクル・請求書の発行時期・FAX", "Phương thức・chu kỳ thanh toán・thời điểm xuất hóa đơn・FAX của pháp nhân", "-", "area",
      d=["法人Web の申込フォーム（§5-1）と同じ項目。支払い方法・支払サイクル・請求書の発行時期は必須、FAX番号は任意（§9-2：数字とハイフン）。", "Cùng mục với form đăng ký Web pháp nhân (§5-1). Phương thức thanh toán, chu kỳ thanh toán, thời điểm xuất hóa đơn là bắt buộc, FAX tùy chọn (§9-2: chữ số và dấu gạch ngang)."],
      demo_ok=["コードの代理入力にこれらの欄がない（H17）。法人Web と同じ項目に足す", "Màn nhập hộ trong code chưa có các ô này (H17). Cần bổ sung cùng mục với Web pháp nhân"]),
    I("4", "法人のご担当者（メイン担当者）", "Người phụ trách pháp nhân (người phụ trách chính)", "#nf .card h2::法人のご担当者^", "area", d=["この方が申込者になる（お申し込み者は担当者から選ぶ）。拠点のご担当者は各拠点で入力する。メイン1・請求1が必須。", "Người này là người nộp đơn (người nộp đơn chọn từ người phụ trách). Người phụ trách cơ sở nhập ở từng cơ sở. Bắt buộc 1 người chính và 1 người thanh toán."]),
    NF("4.1", "担当者名", "Tên người phụ trách", "担当者名", "text", "必須。60文字まで。", "Bắt buộc. Tối đa 60 ký tự.", req="○", len="文字列 60", ex=["青木 一郎", "Họ tên người phụ trách chính"], err=["E01", "E04", "E13"]),
    NF("4.2", "フリガナ", "Furigana", "フリガナ", "text", "必須。全角カタカナ（E03）。60文字まで。", "Bắt buộc. Katakana toàn góc (E03). Tối đa 60 ký tự.", req="○", len="文字列 60", ex=["アオキ イチロウ", "Katakana toàn góc"], err=["E01", "E03", "E04"]),
    NF("4.3", "メールアドレス", "Email", "メールアドレス", "text", "必須。アカウント発行の案内先。形式 x@y.z（E07）。160文字まで。", "Bắt buộc. Nơi nhận hướng dẫn cấp tài khoản. Định dạng x@y.z (E07). Tối đa 160 ký tự.", req="○", len="文字列 160", ex=["aoki@mizuho-foods.example", "Email người phụ trách chính"], err=["E01", "E07"],
       demo_ok=["コードはメールの形式を確かめない（H5）", "Code chưa kiểm tra định dạng email (H5)"]),
    I("4.4", "担当者の電話番号", "Điện thoại người phụ trách", "#nf .card:nth-of-type(3) .fld::電話番号", "text", "input", req="○", len="文字列 20", ex=["03-1234-5678", "Chữ số và dấu gạch ngang"], err=["E01", "E06"],
      d=["数字とハイフン。法人Web では必須。", "Chữ số và dấu gạch ngang. Bắt buộc ở Web pháp nhân."],
      demo_ok=["コードは任意（H17）", "Code là tùy chọn (H17)"]),
    I("4.5", "請求担当者・お申し込み者", "Người phụ trách thanh toán・người nộp đơn", "-", "area",
      d=["請求担当者（名前・フリガナ・メール・電話。空ならメイン担当者と同じ）と、お申し込み者（法人担当者・拠点担当者のメールのどれかから選ぶ。A2）。法人Web の申込フォーム（§5-2・§5-3）と同じ。", "Người phụ trách thanh toán (tên, furigana, email, điện thoại; để trống thì giống người chính) và người nộp đơn (chọn từ email người phụ trách pháp nhân / cơ sở; A2). Giống form đăng ký Web pháp nhân (§5-2, §5-3)."],
      demo_ok=["コードにこれらの欄がない（メイン担当者がそのまま申込者になる）。法人Web と同じ項目に足す（H17）", "Code chưa có các ô này (người chính trở thành người nộp đơn). Cần bổ sung cùng mục với Web pháp nhân (H17)"]),
]
NFB = [
    I("5", "拠点nの申込内容", "Nội dung đơn của cơ sở n", "#nf .nf-br", "area", d=["拠点ごとに1件の親契約になる。見出し「拠点nの申込内容」。2拠点目以降は「この拠点を外す」が出る。", "Mỗi cơ sở thành 1 hợp đồng cha. Tiêu đề \"拠点nの申込内容\". Từ cơ sở thứ 2 có \"この拠点を外す\"."]),
    I("5.1", "この拠点を外す", "Bỏ cơ sở này", "#nf .nf-br button::この拠点を外す", "button", "click", cond=["2拠点目以降", "Từ cơ sở thứ 2"], d=["その拠点の入力を外す（確認なし）。エラー表示はいったん消える。", "Bỏ phần nhập của cơ sở đó (không hỏi xác nhận). Hiển thị lỗi tạm xóa."]),
    I("5.2", "契約区分", "Loại hợp đồng", "#nf .fld::契約区分", "select", "select", req="○", len=["選択（本導入／お試しキャンペーン／切替（お試し→本導入））", "Chọn (loại hợp đồng)"], init=["選択してください", "Hãy chọn"], ex=["切替（お試し→本導入）", "Chọn 1 loại"], err=["E02", "E110"],
      d=["「切替（お試し→本導入）」は、お試し中の拠点を本導入へ切り替える申込。登録すると受付の「切替」と同じ画面（拠点ごとに、同じ親契約の契約種別を本導入に切り替える）になる。切替は既存の法人を選び、その法人のお試し中の拠点から拠点名で決める（お試し中でなければ E110）。お試しのときは、お試し期間（月数）も入れる。", "\"切替（お試し→本導入）\" là đơn chuyển cơ sở đang dùng thử sang 本導入. Sau khi đăng ký sẽ thành màn giống \"切替\" ở phần tiếp nhận (theo từng cơ sở, chuyển loại hợp đồng của cùng hợp đồng cha sang 本導入). Chuyển đổi chọn pháp nhân hiện có và xác định theo tên cơ sở trong số cơ sở đang dùng thử (không đang dùng thử thì E110). Dùng thử thì nhập cả thời gian dùng thử (số tháng)."],
      demo_ok=["お試し期間（月数）の欄がコードにない（H17）", "Code chưa có ô thời gian dùng thử (số tháng) (H17)"]),
    I("5.3", "拠点名", "Tên cơ sở", "#nf .fld::拠点名", "text", "input", req="○", len="文字列 60", ex=["みずほ食品 本社", "Tên cơ sở (hiện trên danh sách)"], err=["E01", "E04", "E13", "W02"], d=["必須。60文字まで。請求書・送り状に印字できない文字があれば W02。", "Bắt buộc. Tối đa 60 ký tự. Có ký tự không in được trên hóa đơn / phiếu giao thì W02."]),
    I("5.4", "郵便番号", "Mã bưu điện", "#nf .fld::郵便番号", "text", "input", req="○", len="文字列 8", pattern="P-ADDRESS", ex=["105-0011", "7 chữ số, gạch ngang tùy chọn; lưu dạng 105-0011"], err=["E01", "E05"],
      d=["必須。数字7桁（ハイフンは任意・保存は 123-4567）。横に「住所検索」（郵便番号 → 都道府県・市区町村・町域）。", "Bắt buộc. 7 chữ số (gạch ngang tùy chọn, lưu dạng 123-4567). Cạnh đó có \"住所検索\" (mã bưu điện → tỉnh, quận, khu vực)."],
      demo_ok=["住所検索のボタンがない（H7）", "Chưa có nút 住所検索 (H7)"]),
    I("5.5", "住所", "Địa chỉ", "#nf .fld::住所", "text", "input", req="○", len="文字列 255", ex=["東京都港区芝公園1-2-3 芝公園ビル5F", "Từ tỉnh đến tên tòa nhà"], err=["E01", "E04", "W02"], d=["必須。都道府県から建物名まで。255文字まで。", "Bắt buộc. Từ tỉnh đến tên tòa nhà. Tối đa 255 ký tự."],
      demo_ok=["コードは1欄。法人Web と同じく 都道府県（47択）・市区町村〜番地・建物に分ける（H17）", "Code là 1 ô. Cần tách thành tỉnh (47 lựa chọn), quận / huyện ~ số nhà, tòa nhà giống Web pháp nhân (H17)"]),
    I("5.6", "プラン", "Gói", "#nf .fld::プラン", "select", "select", req="○", len=["選択（プランマスタの公開中のプラン）", "Chọn (gói đang công khai trong bảng gói)"], init=["選択してください", "Hãy chọn"], ex=["ES000003 50プラン（ESライト）", "Chọn 1 gói"], err=["E02"],
      d=["必須。選択肢はプランマスタの公開中のプラン。", "Bắt buộc. Lựa chọn là các gói đang công khai trong bảng gói."], demo_ok=["コードの選択肢は固定の3つ。プランマスタから作る", "Lựa chọn trong code là 3 giá trị cố định. Cần lấy từ bảng gói"]),
    I("5.7", "コース", "Khóa", "#nf .fld::コース", "select", "select", req="○", len=["選択（ESライト／ESスタンダード）", "Chọn (khóa)"], init=["選択してください", "Hãy chọn"], ex=["ESライト", "Chọn 1 khóa"], err=["E02"], d=["必須。設備が自販機のときは ESライト（自販機）。", "Bắt buộc. Thiết bị là máy bán hàng tự động thì ESライト（自販機）."],
      demo_ok=["コードの選択肢は2つ（ESライト（自販機）がない）。プランマスタのコースに合わせる", "Code chỉ có 2 lựa chọn (thiếu ESライト（自販機）). Cần theo khóa trong bảng gói"]),
    I("5.8", "配送区分", "Phân loại giao hàng", "#nf .fld::配送区分", "select", "select", req="○", len=["選択（ES配送便／COOL便）", "Chọn (loại giao hàng)"], init=["選択してください", "Hãy chọn"], ex=["ES配送便", "Chọn 1 loại"], err=["E02", "E106"],
      d=["必須。設備が自販機の拠点は ES配送便に固定（決定 28-19）で、選択肢を無効にして注記「設備が自販機の拠点は ES配送便に固定です」を出す。", "Bắt buộc. Cơ sở có máy bán hàng tự động cố định ES配送便 (quyết định 28-19), vô hiệu hóa lựa chọn và hiện ghi chú \"設備が自販機の拠点は ES配送便に固定です\"."]),
    I("5.9", "納品不可曜日", "Thứ không giao được", "#nf .fld::納品不可曜日", "text", "input", req="－", len="文字列 60", ex=["土・日・祝日", "Các thứ không nhận hàng được"], d=["任意。納品できない曜日。法人Web の申込フォームでは月〜日・祝日のチェック。", "Tùy chọn. Các thứ không nhận hàng được. Ở form đăng ký Web pháp nhân là checkbox Thứ Hai〜Chủ Nhật・ngày lễ."],
      demo_ok=["コードは自由記述の1行。法人Web と同じチェック（月〜日・祝日）にする（H17）", "Code là 1 dòng nhập tự do. Cần đổi thành checkbox (Thứ Hai〜Chủ Nhật・ngày lễ) giống Web pháp nhân (H17)"]),
    I("5.10", "設置フロア", "Tầng lắp đặt", "#nf .fld::設置フロア", "text", "input", req="条件付き", len="文字列 60", ex=["2F 給湯室", "Tầng / vị trí đặt thiết bị"], err=["E01", "E04"],
      cond=["設備が自販機のとき必須（冷蔵庫は任意）", "Bắt buộc khi thiết bị là máy bán hàng tự động (tủ lạnh thì tùy chọn)"], d=["拠点の「設置フロア」に入る（台帳 2026-10-03）。自販機で空のとき「自販機の拠点は設置フロアを入れてください」。", "Điền vào \"設置フロア\" của cơ sở (台帳 2026-10-03). Máy bán hàng tự động mà để trống thì \"自販機の拠点は設置フロアを入れてください\"."]),
    I("5.11", "基準数のパターン", "Mẫu số lượng chuẩn", "#nf .fld::基準数のパターン", "select", "select", req="－", len=["選択（通常／短消費期限なし）", "Chọn (thường / không hạn dùng ngắn)"], init=["通常", "Thường"], ex=["短消費期限なし", "Chọn 1 mẫu"],
      cond=["設備が自販機でないとき（自販機は自販機の基準数なので出さない）", "Khi thiết bị không phải máy bán hàng tự động (máy bán hàng tự động dùng số lượng chuẩn riêng nên không hiện)"],
      d=["短消費期限なし＝消費期限の短い商品をデフォルト注文に入れない（料金は同じ）。契約（申込）のときに決め、契約後は運営だけが法人・拠点の画面で変えられる（REQ-CT-300）。", "Không hạn dùng ngắn = không đưa sản phẩm hạn dùng ngắn vào đơn đặt mặc định (giá không đổi). Quyết định khi ký hợp đồng (nộp đơn), sau đó chỉ vận hành đổi được ở màn pháp nhân / cơ sở (REQ-CT-300)."]),
    I("5.12", "設備の希望", "Thiết bị mong muốn", "#nf .fld::設備の希望", "select", "select", req="○", len=["選択（冷蔵庫／冷蔵庫＋冷凍庫／冷蔵庫＋自販機／自販機のみ）", "Chọn (tủ lạnh / tủ lạnh + tủ đông / tủ lạnh + máy bán hàng / chỉ máy bán hàng)"], init=["選択してください", "Hãy chọn"], ex=["自販機のみ", "Chọn 1 loại"], err=["E02"],
      d=["必須。「自販機」を含むときは配送区分を ES配送便に固定し、設置フロアを必須にする。機種（希望機種・資材ボックス・電子レンジ／冷凍庫レンタル）やオプション・従業員数は、法人Web の申込フォーム（§4-3〜§4-5）と同じ項目で足す（H17）。", "Bắt buộc. Có \"自販機\" thì cố định loại giao hàng ES配送便 và bắt buộc tầng lắp đặt. Model (model mong muốn, hộp vật tư, thuê lò vi sóng / tủ đông), tùy chọn, số nhân viên bổ sung cùng mục với form đăng ký Web pháp nhân (§4-3〜§4-5) (H17)."],
      demo_ok=["コードは設備の区分だけで、機種・オプション・従業員数の欄がない（H17）", "Code chỉ có loại thiết bị, chưa có các ô model, tùy chọn, số nhân viên (H17)"]),
    I("5.13", "開始サイクル月（希望）", "Chu kỳ bắt đầu (mong muốn)", "#nf .fld::開始サイクル月", "month", "input", req="○", len="年月", ex=["2026-12", "Tháng bắt đầu mong muốn (không chọn ngày)"], err=["E01"],
      d=["必須（本導入）。契約はサイクル単位のため日は選ばない（A1＝その月の最初の月曜）。締切（前月15日）前の申込は翌月以降、締切後は翌々月以降。", "Bắt buộc (本導入). Hợp đồng theo chu kỳ nên không chọn ngày (A1 = thứ Hai đầu tiên của tháng). Nộp trước hạn chót (ngày 15 tháng trước) thì từ tháng sau, sau hạn thì từ tháng sau nữa."]),
    I("5.14", "拠点のご担当者", "Người phụ trách cơ sở", "#nf .fld::拠点のご担当者", "text", "input", req="－", len="文字列 160", ex=["大西 健 オオニシ ケン onishi@example.com", "Họ tên・furigana・email (giống người chính pháp nhân thì để trống)"], err=["E07"],
      d=["任意。氏名・フリガナ・メール（法人のメイン担当者と同じなら空欄）。", "Tùy chọn. Họ tên, furigana, email (giống người chính pháp nhân thì để trống)."],
      demo_ok=["コードは自由記述の1欄。法人Web と同じ表（名前・フリガナ・メール・電話、メイン1・請求1）にする（H17）", "Code là 1 ô nhập tự do. Cần đổi thành bảng giống Web pháp nhân (tên, furigana, email, điện thoại; chính 1・thanh toán 1) (H17)"]),
    I("5.15", "請求先", "Nơi nhận hóa đơn", "#nf .fld::請求先", "select", "select", req="－", len=["選択（法人／この拠点）", "Chọn (pháp nhân / cơ sở này)"], init=["法人", "Pháp nhân"], ex=["この拠点", "Chọn nơi nhận hóa đơn"], d=["法人／この拠点。法人なしの拠点は「この拠点」になる。この拠点のときは、支払方法・支払サイクル・請求書の発行時期も入れる（法人Web §4-6）。", "Pháp nhân / cơ sở này. Cơ sở không có pháp nhân thì là \"この拠点\". Khi là cơ sở này thì nhập cả phương thức thanh toán, chu kỳ, thời điểm xuất hóa đơn (Web pháp nhân §4-6)."],
      demo_ok=["コードは請求先の選択だけ（支払方法・支払サイクルなしの H17）", "Code chỉ có chọn nơi nhận hóa đơn (thiếu phương thức・chu kỳ thanh toán, H17)"]),
    I("5.16", "配送備考", "Ghi chú giao hàng", "#nf .fld::配送備考", "textarea", "input", req="－", len=["文字列 500（複数行）", "Chuỗi 500 (nhiều dòng)"], ex=["8:00〜10:00／通用口から搬入", "Giờ giao, đường vào, ghi chú"], err=["E04", "E13"], d=["任意。備考・ご要望は500文字まで（複数行）。", "Tùy chọn. Ghi chú・yêu cầu tối đa 500 ký tự (nhiều dòng)."]),
    I("5.17", "お試し期間（月数）・アカウントを発行するか", "Thời gian dùng thử (số tháng)・có cấp tài khoản không", "-", "area",
      d=["運営だけの項目：お試し期間（月数。お試しのとき必須・既定1）と、アカウントを発行するか（既定 ON。OFF なら本登録のときに発行）。", "Mục chỉ dành cho vận hành: thời gian dùng thử (số tháng; bắt buộc khi dùng thử・mặc định 1) và có cấp tài khoản không (mặc định BẬT; TẮT thì cấp lúc đăng ký chính thức)."],
      demo_ok=["コードの代理入力にこの2つの欄がない（H17）。アカウント発行は仮登録の確認（AW_APPL_003 No.8.2）で決まる", "Màn nhập hộ trong code chưa có 2 ô này (H17). Việc cấp tài khoản quyết ở bước xác nhận đăng ký tạm (AW_APPL_003 No.8.2)"]),
    I("6", "拠点を追加", "Thêm cơ sở", "#nf button::拠点を追加", "button", "click", d=["拠点の入力欄をもう1つ足す（1申込に複数の拠点を入れられる）。", "Thêm một khối nhập cơ sở nữa (một đơn có thể gồm nhiều cơ sở)."]),
    I("7", "添付資料", "Tài liệu đính kèm", "#nf .card h2::添付資料^", "area", d=["任意。申込書（紙・PDF）、搬入経路資料・設置場所写真。JPG・PNG・PDF・HEIC、1件5MB・10件まで（E11）。", "Tùy chọn. Đơn đăng ký (giấy・PDF), tài liệu đường vận chuyển・ảnh nơi đặt. JPG・PNG・PDF・HEIC, 5MB/file・tối đa 10 file (E11)."], err=["E11"],
      demo_ok=["コードは「ファイルを選択（デモ）」の文字入力でファイルを選べない。ファイル選択の部品にする", "Code là ô nhập chữ \"ファイルを選択（デモ）\" và không chọn được file. Cần đổi thành thành phần chọn file"]),
]
NFE = [
    I("8", "入力エラー", "Lỗi nhập", "#nf .fld.bad", "area", "show", err=["E01", "E02"],
      d=["「登録」で足りない欄を赤枠にし、項目の下に文言（必須は E01、選択は E02）。最初のエラーの欄までスクロールし、トースト「入力されていない項目があります（n件）」を出す。", "Nhấn \"登録\" thì ô thiếu viền đỏ và hiện câu dưới ô (bắt buộc E01, chọn E02). Cuộn đến ô lỗi đầu tiên và hiện toast \"入力されていない項目があります（n件）\"."],
      demo_ok=["コードの文言は直書き（「受付経路を選んでください」など）で、ID がない。E01・E02 に揃える。エラーを項目の下に出す点はコードも同じ", "Câu chữ trong code ghi trực tiếp (vd. \"受付経路を選んでください\"), không có ID. Cần đồng nhất về E01・E02. Việc hiện lỗi dưới ô thì code đã giống"]),
]
NFQ = [
    I("9", "編集内容の破棄", "Bỏ nội dung đang nhập", ".es-modal__panel", "modal", "show", err=["Q02"], pattern="P-FORM",
      d=["Q02「編集内容を破棄しますか？」。入力があるときに、キャンセル・パンくず・メニュー・ブラウザを閉じる／再読み込みで出す。「破棄」で一覧へ戻り、「キャンセル」で入力に戻る。", "Q02 \"編集内容を破棄しますか？\". Hiện khi có nhập mà hủy / breadcrumb / menu / đóng trình duyệt hoặc tải lại. \"破棄\" thì về danh sách, \"キャンセル\" thì quay lại nhập."]),
    I("9.1", "キャンセル", "Hủy", ".es-modal__actions button::キャンセル", "button", "click", d=["閉じて入力に戻る。", "Đóng và quay lại nhập."]),
    I("9.2", "破棄", "Bỏ", ".es-modal__actions button::破棄", "button", "click", d=["入力を捨てて一覧（新規契約タブ）へ戻る。", "Bỏ nội dung nhập và về danh sách (tab 新規契約)."]),
]
NFS = [
    I("10", "登録完了", "Hoàn tất đăng ký", ".toast", "toast", "show", err=["S101"],
      d=["S101「登録しました。受付中の申込として一覧に追加しました（AP-…）」。一覧（新規契約タブ）へ戻り、登録した行が先頭に「代理入力」の印つきで出る。あとは受付（AW_APPL_003）で、仮登録 → 詳細情報設定 → 本登録と進める。", "S101 \"登録しました。受付中の申込として一覧に追加しました（AP-…）\". Về danh sách (tab 新規契約), dòng vừa đăng ký hiện ở đầu có dấu \"代理入力\". Sau đó xử lý ở phần tiếp nhận (AW_APPL_003): đăng ký tạm → thiết lập chi tiết → đăng ký chính thức."],
      demo_ok=["コードのトーストは「登録しました。受付中の申込として一覧に追加しました（番号）」と同じ。S101 に揃える", "Toast trong code cùng nội dung. Đồng nhất về S101"]),
    I("10.1", "登録した行", "Dòng vừa đăng ký", ".apx-list tr.is-selected", "label", "show",
      d=["一覧の先頭に出る（強調表示）。ID の下に「代理入力」の印と受付経路。ステータスは受付中。", "Hiện ở đầu danh sách (nổi bật). Dưới mã có dấu \"代理入力\" và kênh tiếp nhận. Trạng thái 受付中."]),
]
VIEWS += [
    V("077", "AW_APPL_004", "初期（受付の情報・法人・担当者・拠点1）", "Ban đầu (thông tin tiếp nhận・pháp nhân・người phụ trách・cơ sở 1)", "/ops/applications/proxy/new",
      NFH + NFA[:1] + pick(NFA, "2.1", "2.2", "2.3", "2.4") + [NFA[5]] + pick(NFA, "3.1", "3.2", "3.3", "3.4", "3.5", "3.6", "3.8") + [NFA[14]] + pick(NFA, "4.1", "4.2", "4.3", "4.4", "4.5"),
      note=["受付経路・受付日・入力者・ES営業担当は運営だけの項目。法人は「新しい法人」が初期値。", "Kênh tiếp nhận, ngày tiếp nhận, người nhập, ES営業担当 là mục chỉ dành cho vận hành. Pháp nhân mặc định là \"新しい法人\"."]),
    V("078", "AW_APPL_004", "拠点：契約区分・住所・プラン・配送・設備", "Cơ sở: loại hợp đồng・địa chỉ・gói・giao hàng・thiết bị", "/ops/applications/proxy/new",
      pick(NFB, "5", "5.2", "5.3", "5.4", "5.5", "5.6", "5.7", "5.8", "5.9", "5.11", "5.12", "5.13", "5.14", "5.15", "5.16", "5.17", "6", "7"),
      note=["拠点1の入力欄。基準数のパターンは自販機のとき出さない。拠点を追加すると、拠点2の入力欄が足される。", "Khối nhập của cơ sở 1. Mẫu số lượng chuẩn không hiện khi là máy bán hàng tự động. Thêm cơ sở thì thêm khối nhập cơ sở 2."]),
    V("079", "AW_APPL_004", "既存の法人に拠点を足す", "Thêm cơ sở cho pháp nhân hiện có", "/ops/applications/proxy/new",
      pick(NFA, "3", "3.1", "3.7"),
      setup="nfs('法人の区分','既存の法人');await sleep(500);",
      note=["法人の区分を「既存の法人」にすると、法人名などの入力欄の代わりに、法人を選ぶ欄が出る。", "Đổi phân loại pháp nhân sang \"既存の法人\" thì thay cho các ô nhập tên pháp nhân là ô chọn pháp nhân."]),
    V("080", "AW_APPL_004", "自販機の拠点（配送区分を固定・設置フロア必須）", "Cơ sở máy bán hàng tự động (cố định loại giao・bắt buộc tầng lắp đặt)", "/ops/applications/proxy/new",
      pick(NFB, "5.8", "5.10", "5.12"),
      setup="nfs('設備の希望','自販機のみ');await sleep(500);",
      note=["設備の希望に自販機を選ぶと、配送区分が ES配送便に固定（選択肢は無効・注記）になり、設置フロアが必須になる。基準数のパターンは出ない。", "Chọn máy bán hàng tự động ở thiết bị mong muốn thì loại giao hàng cố định ES配送便 (vô hiệu lựa chọn・ghi chú) và bắt buộc tầng lắp đặt. Không hiện mẫu số lượng chuẩn."]),
    V("081", "AW_APPL_004", "契約区分「切替（お試し→本導入）」", "Loại hợp đồng \"切替（お試し→本導入）\"", "/ops/applications/proxy/new",
      pick(NFA, "3.1", "3.7") + pick(NFB, "5.2"),
      setup="nfs('法人の区分','既存の法人');await sleep(400);nfs('契約区分','切替（お試し→本導入）');await sleep(500);",
      note=["切替は既存の法人を選び、お試し中の拠点を拠点名で決める。お試し中でなければ登録できない（E110）。契約区分の下に説明（登録すると受付の「切替」と同じ画面になる）が出る。", "Chuyển đổi chọn pháp nhân hiện có và xác định cơ sở đang dùng thử theo tên. Không đang dùng thử thì không đăng ký được (E110). Dưới loại hợp đồng có giải thích (sau đăng ký thành màn giống \"切替\" ở phần tiếp nhận)."]),
    V("082", "AW_APPL_004", "入力エラー（空のまま登録）", "Lỗi nhập (đăng ký khi để trống)", "/ops/applications/proxy/new",
      NFE + pick(NFH, "1.2") + pick(NFA, "2.1", "3.2", "4.1") + pick(NFB, "5.2", "5.3"),
      setup="btn('登録',document.querySelector('.es-pagehead__actions')).click();await sleep(700);",
      note=["何も入れずに「登録」を押した状態。足りない欄が赤枠になり、各欄の下に文言が出る。", "Trạng thái nhấn \"登録\" khi chưa nhập gì. Ô thiếu viền đỏ và có câu dưới mỗi ô."]),
    V("083", "AW_APPL_004", "拠点を追加／この拠点を外す", "Thêm cơ sở / Bỏ cơ sở này", "/ops/applications/proxy/new",
      pick(NFB, "5", "5.1", "6"),
      setup="btn('拠点を追加').click();await sleep(500);",
      note=["拠点を追加した状態。拠点2には「この拠点を外す」が出る。", "Trạng thái đã thêm cơ sở. Cơ sở 2 có \"この拠点を外す\"."]),
    V("084", "AW_APPL_004", "編集内容の破棄（モーダル）", "Bỏ nội dung đang nhập (modal)", "/ops/applications/proxy/new",
      NFQ,
      setup="nfi('法人名','みずほ食品株式会社');await sleep(300);btn('キャンセル',document.querySelector('.es-pagehead__actions')).click();await sleep(500);", full=False,
      note=["入力したあとにキャンセルを押した状態。", "Trạng thái nhấn hủy sau khi đã nhập."]),
    V("085", "AW_APPL_004", "登録完了（受付中の申込として追加）", "Hoàn tất đăng ký (thêm thành đơn 受付中)", "/ops/applications/proxy/new",
      NFS,
      setup="await nffill();btn('登録',document.querySelector('.es-pagehead__actions')).click();await sleep(1500);",
      note=["必須をすべて入れて「登録」を押した直後。一覧（新規契約タブ）へ戻り、登録した行が先頭に出る。", "Ngay sau khi nhập đủ mục bắt buộc và nhấn \"登録\". Về danh sách (tab 新規契約), dòng vừa đăng ký hiện ở đầu."]),
]


# ================================================================ AW_APPL_005 変更申請の代理入力
# 電話・メールで受けた変更・休止・再開・解約を、運営が代わりに入力する（拠点・子契約の画面で状態を直接変えない・台帳 28-144）。
# 登録すると承認待ちの申請が1件でき、法人Web からの申請と同じ申請詳細（AW_APPL_002）で承認する。
H += (
    "const nfx=(label,idx,n)=>{const e=nff(label,n).querySelector('select');setsel(e,e.options[idx].value);};"
    "const cffill=async(kind,br,extra)=>{nfs('受付経路','電話');nfs('申請の種類',kind);await sleep(200);nfx('法人',1);nfx('拠点',br);await sleep(200);if(extra)await extra();nfi('内容','拠点改装のため（見本）');await sleep(300);};"
)
CFH = [
    I("1", "ヘッダー", "Đầu trang", ".es-pagehead", "area",
      d=["パンくず：契約申請管理＞変更申請の代理入力。タイトル「変更申請の代理入力」。入口は一覧の「変更申請の代理入力」（契約変更タブ＝プラン・配送・設備・拠点情報・法人情報の変更、休止・解約タブ＝休止・再開・解約）。入力中に離れるときは、入力があれば Q02。", "Breadcrumb: 契約申請管理 > 変更申請の代理入力. Tiêu đề \"変更申請の代理入力\". Cửa vào là \"変更申請の代理入力\" ở danh sách (tab 契約変更 = đổi gói・giao hàng・thiết bị・thông tin cơ sở・thông tin pháp nhân, tab 休止・解約 = 休止・再開・解約). Đang nhập mà rời đi thì có nhập là hiện Q02."]),
    I("1.1", "キャンセル", "Hủy", ".es-pagehead__actions button::キャンセル", "button", "click", err=["Q02"], d=["入力があれば Q02（No.5）。なければ、元のタブ（契約変更／休止・解約）の一覧へ戻る。", "Có nhập thì hiện Q02 (No.5). Không thì về danh sách của tab ban đầu (契約変更 / 休止・解約)."]),
    I("1.2", "登録", "Đăng ký", ".es-pagehead__actions button::登録", "button", "click", pattern="P-FORM", err=["S101", "E01", "E02", "E104", "E105", "E106", "E108", "E30"],
      cond=["代理入力の権限（機能ごとの操作＝フル権限・システム管理・CS の R/U）。登録できない理由（No.3.8）があるときは無効", "Quyền nhập hộ (thao tác theo chức năng = フル権限・システム管理・CS có R/U). Bị vô hiệu khi có lý do không đăng ký được (No.3.8)"],
      d=["足りない欄は赤枠と文言（トースト「入力されていない項目があります（n件）」）。そろっていれば登録して承認待ちの申請を1件つくり、S101 を出して、その申請の詳細（AW_APPL_002）を開く（一覧では「代理入力」の印つき）。同じ拠点に承認待ちの申請があるときは登録できない（E104・重複申請の禁止 28-8）。休止の通算が12ヶ月を超える（E105）・自販機の拠点を COOL便へ（E106）・解約日が最短より前（E108）も登録できない。法人への知らせは法人Web の申請と同じ（拠点ごと）に送り、「運営が代わりに受け付けました」と一文を入れる。", "Ô thiếu viền đỏ và câu thông báo (toast \"入力されていない項目があります（n件）\"). Đủ thì đăng ký, tạo 1 đơn chờ duyệt, hiện S101 và mở chi tiết đơn đó (AW_APPL_002) (ở danh sách có dấu \"代理入力\"). Cơ sở đã có đơn chờ duyệt thì không đăng ký được (E104, cấm đơn trùng 28-8). Cũng không đăng ký được khi tạm ngưng cộng dồn quá 12 tháng (E105), cơ sở máy bán hàng tự động sang COOL便 (E106), ngày hủy trước ngày sớm nhất (E108). Thông báo cho pháp nhân giống đơn từ Web pháp nhân (theo cơ sở) và thêm 1 câu \"運営が代わりに受け付けました\"."],
      demo_ok=["コードの文言は直書き（ID なし）。E01・E02・E104〜E108 に揃える。代理入力を「作成」扱い（CS は押せない）→台帳どおり機能ごとの操作に（Q1）。重複申請のエラーはコードでは共通データの文言「…には処理中の申請があります」をトーストに出す", "Câu chữ trong code ghi trực tiếp (không có ID). Cần đồng nhất về E01・E02・E104〜E108. Code tính nhập hộ là \"tạo\" (CS không bấm được) → sửa thành thao tác theo chức năng theo 台帳 (Q1). Lỗi đơn trùng trong code hiện câu của dữ liệu chung \"…には処理中の申請があります\" ở toast"]),
]
CFA = [
    I("2", "受付の情報", "Thông tin tiếp nhận", "#nf .card h2::受付の情報^", "area", d=["どこから受けたか（履歴に残る）。運営だけの項目。", "Nhận từ đâu (lưu vào lịch sử). Mục chỉ dành cho vận hành."]),
    NF("2.1", "受付経路", "Kênh tiếp nhận", "受付経路", "select", "必須。選択（電話／メール／営業（訪問）／運営の判断（例：長期の不在）／その他）。申請の履歴と一覧の「代理入力」の印に残る。", "Bắt buộc. Chọn (điện thoại / email / nhân viên kinh doanh (đến thăm) / quyết định của vận hành (vd. vắng lâu) / khác). Lưu vào lịch sử đơn và dấu \"代理入力\" của danh sách.", req="○", len=["選択（電話／メール／営業（訪問）／運営の判断／その他）", "Chọn (điện thoại / email / kinh doanh / quyết định của vận hành / khác)"], init=["選択してください", "Hãy chọn"], ex=["電話", "Chọn 1 kênh"], err=["E02"]),
    NF("2.2", "受付日", "Ngày tiếp nhận", "受付日", "date", "必須。初期値は今日。解約は、受付日とオーダー締切（既定は前月15日）で最短の解約日が決まる（REQ-CT-257）。", "Bắt buộc. Mặc định hôm nay. Với hủy hợp đồng, ngày tiếp nhận và hạn chót đặt hàng (mặc định ngày 15 tháng trước) quyết định ngày hủy sớm nhất (REQ-CT-257).", req="○", len="日付", init=["今日", "Hôm nay"], ex=["2026-10-05", "Ngày nhận điện thoại / email"], err=["E01"]),
    NF("2.3", "入力者", "Người nhập", "入力者", "label", "ログイン中の運営ユーザー名（読むだけ）。ログは「代理入力：運営ユーザー名」で残る。", "Tên người dùng vận hành đang đăng nhập (chỉ đọc). Log ghi \"代理入力：tên người dùng vận hành\".", demo_ok=["コードは固定の見本（にっしぐち（運営））。ログイン中のユーザーにする", "Code cố định (にっしぐち（運営））. Sửa thành người dùng đang đăng nhập"]),
    I("3", "申請の内容", "Nội dung đơn", "#nf .card h2::申請の内容^", "area", d=["法人Web と同じ申請を起票する。「1申請1種類」（再開の申請の中で納品先・担当者・プランを直すのは例外・28-13）。", "Lập đơn giống đơn từ Web pháp nhân. \"1 đơn 1 loại\" (ngoại lệ: sửa nơi giao・người phụ trách・gói trong đơn mở lại, 28-13)."]),
    NF("3.1", "申請の種類", "Loại đơn", "申請の種類", "select", "必須。契約変更タブから＝プランの変更・配送の変更・設備の変更・拠点情報の変更・法人情報の変更。休止・解約タブから＝休止・再開・解約。選ぶと下の欄が種類ごとに変わる（再開予定月は休止だけ、解約日・残った商品の扱いは解約だけ、開始（適用）するサイクル月は解約以外）。", "Bắt buộc. Từ tab 契約変更 = đổi gói・đổi giao hàng・đổi thiết bị・đổi thông tin cơ sở・đổi thông tin pháp nhân. Từ tab 休止・解約 = 休止・再開・解約. Chọn thì các ô bên dưới thay đổi theo loại (tháng mở lại chỉ với tạm ngưng, ngày hủy・xử lý hàng tồn chỉ với hủy, chu kỳ bắt đầu áp dụng trừ hủy).", req="○", len=["選択（そのタブの申請の種類）", "Chọn (loại đơn của tab)"], init=["選択してください", "Hãy chọn"], ex=["休止", "Chọn 1 loại"], err=["E02"]),
    NF("3.2", "法人", "Pháp nhân", "法人", "select", "必須。法人ID・法人名で選ぶ。法人情報の変更は法人1件が対象。", "Bắt buộc. Chọn theo ID hoặc tên pháp nhân. Đổi thông tin pháp nhân thì đối tượng là 1 pháp nhân.", req="○", len=["選択（法人）", "Chọn (pháp nhân)"], init=["法人ID・法人名で選ぶ", "Chọn theo ID・tên pháp nhân"], ex=["CU00001 株式会社サンプル", "Chọn 1 pháp nhân"], err=["E02"],
       demo_ok=["コードの選択肢は固定の1社（サンプル）。法人一覧（共通データ）から作る", "Lựa chọn trong code cố định 1 công ty (サンプル). Cần lấy từ danh sách pháp nhân (dữ liệu chung)"]),
    NF("3.3", "拠点", "Cơ sở", "拠点", "select", "必須。拠点ID・拠点名（親契約番号つき）で選ぶ。承認待ちの申請がある拠点には登録できない（E104）。", "Bắt buộc. Chọn theo ID, tên cơ sở (kèm mã hợp đồng cha). Cơ sở đã có đơn chờ duyệt thì không đăng ký được (E104).", req="○", len=["選択（拠点）", "Chọn (cơ sở)"], init=["拠点を選ぶ", "Chọn cơ sở"], ex=["CU00871 株式会社サンプル 大阪支店（CP0000002）", "Chọn 1 cơ sở"], err=["E02", "E104"],
       demo_ok=["コードの選択肢は固定の5拠点。選んだ法人の拠点（共通データ）から作る", "Lựa chọn trong code cố định 5 cơ sở. Cần lấy từ các cơ sở của pháp nhân đã chọn (dữ liệu chung)"]),
    NF("3.4", "開始（適用）するサイクル月", "Chu kỳ bắt đầu (áp dụng)", "開始（適用）するサイクル月", "select", "必須（解約以外）。変更が効き始めるサイクル月。締切（前月15日）を過ぎた月は選べない。", "Bắt buộc (trừ hủy). Chu kỳ tháng mà thay đổi có hiệu lực. Không chọn được tháng đã quá hạn chót (ngày 15 tháng trước).", req="条件付き", len=["選択（サイクル月）", "Chọn (chu kỳ tháng)"], init=["選択してください", "Hãy chọn"], ex=["2027年2月サイクル", "Chọn 1 chu kỳ"], err=["E02"],
       demo_ok=["コードの選択肢は固定の3つ（2027年2〜4月サイクル）。今のサイクルと締切から作る", "Lựa chọn trong code cố định 3 giá trị (chu kỳ 2〜4/2027). Cần tạo từ chu kỳ hiện tại và hạn chót"]),
    NF("3.5", "再開予定月", "Tháng mở lại dự kiến", "再開予定月", "select", "休止のとき必須。空のままにはできない（休止は通算1年が上限）。開始より後の月（18ヶ月分）。", "Bắt buộc khi tạm ngưng. Không chọn được \"chưa xác định\" (tạm ngưng tối đa 1 năm cộng dồn). Tháng sau tháng bắt đầu (18 tháng).", req="条件付き", len=["選択（サイクル月）", "Chọn (chu kỳ tháng)"], init=["選択してください", "Hãy chọn"], ex=["2027年8月サイクル", "Chọn tháng mở lại"], err=["E02", "E105"]),
    NF("3.6", "解約日（サイクルの末日）", "Ngày hủy (cuối chu kỳ)", "解約日", "select", "解約のとき必須。最短の解約日以降のサイクル末日から選ぶ（自由な日付にしない）。最短より前の選択肢は「締切後のため選べません」と出して無効にする。", "Bắt buộc khi hủy. Chọn từ ngày cuối chu kỳ kể từ ngày hủy sớm nhất (không nhập ngày tự do). Lựa chọn trước ngày sớm nhất hiện \"締切後のため選べません\" và bị vô hiệu.", req="条件付き", len=["選択（サイクルの末日）", "Chọn (ngày cuối chu kỳ)"], init=["選択してください", "Hãy chọn"], ex=["2026年12月サイクルの末日（2026-12-06）", "Chọn 1 ngày"], err=["E02", "E108"]),
    NF("3.7", "残った商品（在庫）の扱い", "Xử lý hàng tồn còn lại", "残った商品", "select", "解約のとき必須。全て買取（最終のご請求書に買取として載せる）／返却（全部・元払い。買取の行なし・管理ロスなし）。商品ごとには分けない。どちらも最後の棚卸報告は必須。", "Bắt buộc khi hủy. Mua lại toàn bộ (đưa vào hóa đơn cuối dưới dạng mua lại) / trả lại (toàn bộ, người gửi trả tiền cước; không có dòng mua lại, không hao hụt quản lý). Không chia theo từng sản phẩm. Cả hai đều bắt buộc báo cáo kiểm kê cuối.", req="条件付き", len=["選択（全て買取／返却）", "Chọn (mua lại toàn bộ / trả lại)"], init=["選択してください", "Hãy chọn"], ex=["全て買取（最終のご請求書に買取として載せます）", "Chọn 1 cách"], err=["E02"]),
    I("3.8", "登録できない理由・判定", "Lý do không đăng ký được・phán định", "#cfInfo", "area", err=["E105", "E106", "E108"],
      d=["種類ごとの説明と判定を出す。休止＝通算（過去の休止の累計・今回・通算（登録後）・残り月数）。上限12ヶ月を超えると赤い文言（E105）で登録を無効にする（解約を案内）。解約＝受付日・オーダー締切・適用月（最短）・解約日（最短）。最短より前なら E108。配送の変更＝自販機の拠点は E106。納品不可曜日・設備の希望日は「拠点情報の変更」が入口。", "Hiện giải thích và phán định theo loại. Tạm ngưng = cộng dồn (tổng các lần trước, lần này, tổng sau đăng ký, số tháng còn lại). Vượt 12 tháng thì chữ đỏ (E105) và vô hiệu hóa đăng ký (hướng dẫn hủy hợp đồng). Hủy = ngày tiếp nhận, hạn chót đặt hàng, tháng áp dụng (sớm nhất), ngày hủy (sớm nhất). Trước ngày sớm nhất thì E108. Đổi giao hàng = cơ sở máy bán hàng tự động thì E106. Thứ không giao được・ngày mong muốn thiết bị có cửa vào là \"拠点情報の変更\"."]),
    NF("3.9", "内容", "Nội dung", "内容", "textarea", "必須。何をどう変えるか（自由記述）。500文字まで。", "Bắt buộc. Thay đổi cái gì và như thế nào (nhập tự do). Tối đa 500 ký tự.", req="○", len=["文字列 500（複数行）", "Chuỗi 500 (nhiều dòng)"], ex=["拠点改装のため 2027-02から3ヶ月休止。設備は置いたまま", "Nội dung yêu cầu thay đổi"], err=["E01", "E04", "E13"],
       demo_ok=["コードは種類によらず自由記述の「内容」1欄。法人Web の変更のお申し込みと同じ項目にする（No.3.11・H17）", "Code dùng 1 ô \"内容\" nhập tự do cho mọi loại. Cần đổi thành mục giống đơn thay đổi ở Web pháp nhân (No.3.11, H17)"]),
    NF("3.10", "理由", "Lý do", "理由", "textarea", "任意。500文字まで。", "Tùy chọn. Tối đa 500 ký tự.", req="－", len=["文字列 500（複数行）", "Chuỗi 500 (nhiều dòng)"], ex=["店舗の改装工事のため", "Lý do của khách"], err=["E04", "E13"]),
    I("3.11", "種類ごとの入力項目（法人Web と同じ）", "Mục nhập theo loại (giống Web pháp nhân)", "-", "area",
      d=["プランの変更＝変更後のプラン（いまと同じプランは不可）・コース・開始サイクル月・理由／配送の変更＝配送方法（自販機は ES配送便に固定）・配送回数（標準より減らせる）／設備の変更＝追加・回収・機種変更・対象の設備（機種コード＋機種名）・台数・希望日・設置代行／拠点情報の変更＝承認が必要な項目（拠点名・フリガナ・住所・電話・請求先・納品不可曜日・設備の希望日）／法人情報の変更＝請求書に載る住所・電話・FAX／休止＝理由（6択）・自由記述・休止中の設備（引き揚げる／置いたまま）・期間（開始・再開予定月）／再開＝再開するサイクル月・再開後のプラン／解約＝解約日・理由（選択）・残った商品の扱い・違約金の確認。", "Đổi gói = gói mới (không chọn giống gói hiện tại), khóa, chu kỳ bắt đầu, lý do / đổi giao hàng = phương thức giao (máy bán hàng tự động cố định ES配送便), số lần giao (giảm được so với chuẩn) / đổi thiết bị = thêm・thu hồi・đổi model, thiết bị đối tượng (mã + tên model), số lượng, ngày mong muốn, lắp đặt hộ / đổi thông tin cơ sở = các mục cần duyệt (tên cơ sở, furigana, địa chỉ, điện thoại, nơi nhận hóa đơn, thứ không giao được, ngày mong muốn thiết bị) / đổi thông tin pháp nhân = địa chỉ・điện thoại・FAX in trên hóa đơn / tạm ngưng = lý do (6 lựa chọn), ghi chú tự do, thiết bị khi tạm ngưng (thu hồi / đặt nguyên), thời gian (bắt đầu, tháng mở lại) / mở lại = chu kỳ mở lại, gói sau khi mở lại / hủy = ngày hủy, lý do (chọn), xử lý hàng tồn, xác nhận tiền phạt."],
      demo_ok=["コードの代理入力は種類によらず自由記述の「内容」1欄で、構造化された入力ではない（H17）。法人Web の変更のお申し込み（法人B の設計書）の項目に揃える", "Màn nhập hộ trong code dùng 1 ô \"内容\" nhập tự do cho mọi loại, không có nhập có cấu trúc (H17). Cần đồng nhất với mục của đơn thay đổi ở Web pháp nhân (tài liệu 法人B)"],
      open=["休止の理由の6つの選択肢の文言（客先確認中）と、解約の理由・引き止めシナリオ（客先のベース待ち）", "Câu chữ của 6 lựa chọn lý do tạm ngưng (đang xác nhận với khách) và lý do hủy・kịch bản giữ chân (chờ tài liệu nền của khách)"], ask="お客様（営業）"),
]
CFE = [
    I("4", "入力エラー", "Lỗi nhập", "#nf .fld.bad", "area", "show", err=["E01", "E02"],
      d=["「登録」で足りない欄を赤枠にし、項目の下に文言（必須は E01、選択は E02）。最初のエラーの欄までスクロールし、トースト「入力されていない項目があります（n件）」を出す。", "Nhấn \"登録\" thì ô thiếu viền đỏ và hiện câu dưới ô (bắt buộc E01, chọn E02). Cuộn đến ô lỗi đầu tiên và hiện toast \"入力されていない項目があります（n件）\"."],
      demo_ok=["コードの文言は直書き（「申請の種類を選んでください」など）。E01・E02 に揃える", "Câu chữ trong code ghi trực tiếp (vd. \"申請の種類を選んでください\"). Đồng nhất về E01・E02"]),
]
CFQ = [
    I("5", "編集内容の破棄", "Bỏ nội dung đang nhập", ".es-modal__panel", "modal", "show", err=["Q02"], pattern="P-FORM",
      d=["Q02。入力があるときに、キャンセル・パンくず・メニュー・ブラウザを閉じる／再読み込みで出す。「破棄」で一覧へ戻り、「キャンセル」で入力に戻る。", "Q02. Hiện khi có nhập mà hủy / breadcrumb / menu / đóng trình duyệt hoặc tải lại. \"破棄\" thì về danh sách, \"キャンセル\" thì quay lại nhập."]),
    I("5.1", "破棄", "Bỏ", ".es-modal__actions button::破棄", "button", "click", d=["入力を捨てて、元のタブの一覧へ戻る。", "Bỏ nội dung nhập và về danh sách của tab ban đầu."]),
]
CFS = [
    I("6", "登録完了のトースト", "Toast hoàn tất đăng ký", ".toast", "toast", "show", err=["S101", "E104"],
      d=["S101「登録しました。承認待ちの申請として追加しました（CH-…）」。そのまま申請詳細（AW_APPL_002）を開く。承認待ちの申請がある拠点では E104（トースト）。", "S101 \"登録しました。承認待ちの申請として追加しました（CH-…）\". Mở luôn chi tiết đơn (AW_APPL_002). Cơ sở đã có đơn chờ duyệt thì E104 (toast)."],
      demo_ok=["コードのトーストは「登録しました。承認待ちの申請として追加しました（番号）」と同じ。S101 に揃える。重複申請のトーストはコードでは共通データの文言（E104 に揃える）", "Toast trong code cùng nội dung. Đồng nhất về S101. Toast đơn trùng trong code là câu của dữ liệu chung (đồng nhất về E104)"]),
]
CF_H = pick(CFH, "1", "1.1", "1.2")
VIEWS += [
    V("086", "AW_APPL_005", "休止：通算・再開予定月", "Tạm ngưng: cộng dồn・tháng mở lại", "/ops/applications/proxy/stop",
      CF_H[:1] + CFA[:1] + pick(CFA, "2.1", "2.2", "2.3") + [CFA[4]] + pick(CFA, "3.1", "3.2", "3.3", "3.4", "3.5", "3.8", "3.9", "3.10"),
      setup="nfs('申請の種類','休止');await sleep(200);nfx('法人',1);nfx('拠点',1);nfs('開始（適用）するサイクル月','2027年2月サイクル');nfs('再開予定月','2027年8月サイクル');await sleep(500);",
      note=["休止・解約タブの「変更申請の代理入力」。サンプル本社（過去の休止 3ヶ月）に 2027年2月〜7月（6ヶ月）の休止を入れた状態。通算 9ヶ月・残り 3ヶ月。再開予定月は必須で、「未定」は選べない。", "\"変更申請の代理入力\" ở tab 休止・解約. Trạng thái nhập tạm ngưng 6 tháng (2027年2月〜7月) cho サンプル本社 (đã tạm ngưng 3 tháng trước đó). Cộng dồn 9 tháng, còn 3 tháng. Tháng mở lại bắt buộc, không chọn \"chưa xác định\"."]),
    V("087", "AW_APPL_005", "休止：通算が12ヶ月を超える（登録できない）", "Tạm ngưng: cộng dồn quá 12 tháng (không đăng ký được)", "/ops/applications/proxy/stop",
      [CFH[2]] + pick(CFA, "3.4", "3.5", "3.8"),
      setup="nfs('申請の種類','休止');await sleep(200);nfx('法人',1);nfx('拠点',1);nfs('開始（適用）するサイクル月','2027年2月サイクル');nfs('再開予定月','2028年8月サイクル');await sleep(500);",
      note=["通算が 3ヶ月＋18ヶ月＝21ヶ月になる入力。赤い文言（E105）が出て、「登録」は無効になる。お客様へは解約を案内する。", "Nhập dẫn đến cộng dồn 3 + 18 = 21 tháng. Hiện chữ đỏ (E105) và nút \"登録\" bị vô hiệu. Hướng dẫn khách hủy hợp đồng."]),
    V("088", "AW_APPL_005", "解約：受付日で決まる最短の解約日・残った商品の扱い", "Hủy: ngày hủy sớm nhất theo ngày tiếp nhận・xử lý hàng tồn", "/ops/applications/proxy/stop",
      CF_H[:1] + pick(CFA, "2.2", "3.1", "3.2", "3.3", "3.6", "3.7", "3.8", "3.9"),
      setup="nfs('申請の種類','解約');await sleep(200);nfx('法人',1);nfx('拠点',2);nfx('解約日',2);nfx('残った商品',1);await sleep(500);",
      note=["受付日 2026-10-05（締切 10/15 の前）なので、2026年10月サイクルの末日から選べる（翌月から適用）。選んだ解約日・適用月・最短の解約日を判定欄に出す。", "Ngày tiếp nhận 2026-10-05 (trước hạn 10/15) nên chọn được từ ngày cuối chu kỳ 2026年10月 (áp dụng từ tháng sau). Ô phán định hiện ngày hủy đã chọn, tháng áp dụng, ngày hủy sớm nhất."]),
    V("089", "AW_APPL_005", "解約：締切後の受付日（早い解約日は選べない）", "Hủy: ngày tiếp nhận sau hạn (không chọn được ngày hủy sớm)", "/ops/applications/proxy/stop",
      pick(CFA, "2.2", "3.6", "3.8"),
      setup="nfs('申請の種類','解約');await sleep(200);nfi('受付日','2026-10-20');await sleep(600);",
      note=["受付日 2026-10-20（締切 10/15 の後）にした状態。2026年10月サイクルの末日などは「締切後のため選べません」で無効になり、最短の解約日は翌々月から。", "Đặt ngày tiếp nhận 2026-10-20 (sau hạn 10/15). Cuối chu kỳ 2026年10月... bị vô hiệu với \"締切後のため選べません\", ngày hủy sớm nhất là từ tháng sau nữa."]),
    V("090", "AW_APPL_005", "配送の変更：自販機の拠点は COOL便にできない", "Đổi giao hàng: cơ sở máy bán hàng tự động không đổi sang COOL便 được", "/ops/applications/proxy/change",
      pick(CFA, "3.1", "3.3", "3.8") + [CFH[2]],
      setup="nfs('申請の種類','配送の変更');await sleep(200);nfx('法人',1);nfx('拠点',0);await sleep(500);",
      note=["サンプル 本社（設備が自販機）を選んだ状態。「設備が自販機の拠点は配送方法が ES配送便に固定のため、配送方法の変更は登録できません」（E106）で、登録は無効。", "Trạng thái chọn サンプル 本社 (có máy bán hàng tự động). Hiện \"設備が自販機の拠点は配送方法が ES配送便に固定のため、配送方法の変更は登録できません\" (E106), không đăng ký được."]),
    V("091", "AW_APPL_005", "プラン・設備・拠点情報・法人情報の変更（内容欄）", "Đổi gói・thiết bị・thông tin cơ sở・thông tin pháp nhân (ô nội dung)", "/ops/applications/proxy/change",
      CF_H[:1] + pick(CFA, "2.1", "3.1", "3.2", "3.3", "3.4", "3.9", "3.10", "3.11"),
      setup="nfs('申請の種類','プランの変更');await sleep(200);nfx('法人',1);nfx('拠点',4);nfs('開始（適用）するサイクル月','2027年3月サイクル');nfi('内容','ES000004 100プラン（ESスタンダード）へ変更（見本）');await sleep(500);",
      note=["契約変更タブの「変更申請の代理入力」。種類はプラン・配送・設備・拠点情報・法人情報の5つ。納品不可曜日・設備の希望日の変更は「拠点情報の変更」が入口（配送の変更・設備の変更では登録しない）。", "\"変更申請の代理入力\" ở tab 契約変更. 5 loại: gói, giao hàng, thiết bị, thông tin cơ sở, thông tin pháp nhân. Đổi thứ không giao được・ngày mong muốn thiết bị có cửa vào là \"拠点情報の変更\" (không đăng ký bằng đổi giao hàng / đổi thiết bị)."]),
    V("092", "AW_APPL_005", "入力エラー（空のまま登録）", "Lỗi nhập (đăng ký khi để trống)", "/ops/applications/proxy/change",
      CFE + [CFH[2]] + pick(CFA, "2.1", "3.1", "3.2", "3.3", "3.9"),
      setup="btn('登録',document.querySelector('.es-pagehead__actions')).click();await sleep(700);",
      note=["何も入れずに「登録」を押した状態。", "Trạng thái nhấn \"登録\" khi chưa nhập gì."]),
    V("093", "AW_APPL_005", "承認待ちの申請がある拠点（重複申請不可）", "Cơ sở đã có đơn chờ duyệt (không nộp trùng)", "/ops/applications/proxy/change",
      pick(CFA, "3.3") + [CFS[0]],
      setup="await cffill('プランの変更',2,async()=>{nfs('開始（適用）するサイクル月','2027年3月サイクル');});btn('登録',document.querySelector('.es-pagehead__actions')).click();await sleep(900);",
      note=["サンプル 大阪支店（承認待ちの CH-20260925-0001 がある）にプランの変更を登録しようとした状態。エラーのトースト（E104）。承認・却下のあとに登録する。", "Trạng thái định đăng ký đổi gói cho サンプル 大阪支店 (đang có CH-20260925-0001 chờ duyệt). Toast lỗi (E104). Đăng ký sau khi duyệt / từ chối."]),
    V("094", "AW_APPL_005", "編集内容の破棄（モーダル）", "Bỏ nội dung đang nhập (modal)", "/ops/applications/proxy/change",
      CFQ[:1] + CFQ[1:],
      setup="nfi('内容','入力途中の内容');await sleep(300);btn('キャンセル',document.querySelector('.es-pagehead__actions')).click();await sleep(500);", full=False),
    V("095", "AW_APPL_005", "登録完了（承認待ちの申請として追加）", "Hoàn tất đăng ký (thêm thành đơn chờ duyệt)", "/ops/applications/proxy/change",
      [CFS[0]],
      setup="await cffill('プランの変更',4,async()=>{nfs('開始（適用）するサイクル月','2027年3月サイクル');});btn('登録',document.querySelector('.es-pagehead__actions')).click();await sleep(1500);",
      note=["横浜営業所のプランの変更を登録した直後。申請詳細（承認待ち）が開き、S101 のトーストが出る。", "Ngay sau khi đăng ký đổi gói của Yokohama. Mở chi tiết đơn (chờ duyệt) và hiện toast S101."]),
]


# ================================================================ AW_APPL_006 新規申込のCSV取込（/ops/applications/import）
# 共通の CSV取込（components/csv/CsvImportModal）を運営の「画面」に入れたもの。① ファイルを選ぶ → ② 確認・登録。列は lib/csv/apply.ts（申込フォーム §10-8-1）。
import json as _json
CSV_COLS = [
    ["法人キー", "key"], ["受付経路", "route"], ["ES営業担当", "es"], ["契約区分", "kubun"], ["お試し期間月数【お試しのとき必須】", "trialMonths"], ["アカウントを発行するか", "issue"],
    ["法人ID【今ある法人に拠点を足すとき（CU＋5桁）。空欄＝新しい法人】", "corpId"], ["法人名", "cname"], ["法人名フリガナ", "ckana"], ["請求先法人名", "cbill"], ["法人の郵便番号", "czip"],
    ["法人の都道府県", "cpref"], ["法人の市区町村・番地", "ccity"], ["法人の建物", "cbld"], ["法人の電話番号", "ctel"], ["法人のFAX番号", "cfax"], ["法人の支払い方法", "cpay"],
    ["法人の支払サイクル", "ccycle"], ["請求書の発行時期", "clead"], ["法人メイン担当者名", "m_name"], ["法人メイン担当者フリガナ", "m_kana"], ["法人メイン担当者メール", "m_mail"],
    ["法人メイン担当者電話", "m_tel"], ["法人請求担当者名【空欄＝メイン担当者と同じ】", "b_name"], ["法人請求担当者フリガナ", "b_kana"], ["法人請求担当者メール", "b_mail"], ["法人請求担当者電話", "b_tel"],
    ["お申し込み者", "applicant"], ["設備タイプ", "equip"], ["プラン", "plan"], ["コース", "course"], ["配送方法", "ship"], ["配送回数（月）", "count"],
    ["契約開始希望年月【本導入のとき必須（yyyy-mm）】", "start"], ["設置フロア【自動販売機は必須】", "floor"], ["オプション【オプションコードを ; でつなぐ】", "options"], ["消費期限の短い商品の扱い", "short"],
    ["プラン外の備考", "note"], ["納品先名", "name"], ["納品先名フリガナ", "kana"], ["納品先の郵便番号", "zip"], ["納品先の都道府県", "pref"], ["納品先の市区町村・番地", "city"],
    ["納品先の建物", "bld"], ["納品先の電話番号", "tel"], ["納品先のFAX番号", "fax"], ["従業員数概算", "emp"], ["納品不可曜日【月;水 のように】", "ng"], ["納品不可になった場合", "shift"],
    ["配送の希望", "wish"], ["請求書", "billTo"], ["拠点の支払方法【この拠点に請求のとき必須】", "bpay"], ["拠点の支払サイクル【この拠点に請求のとき必須】", "bcycle"],
    ["拠点メイン担当者名【空欄＝法人のメイン担当者と同じ】", "s_name"], ["拠点メイン担当者フリガナ", "s_kana"], ["拠点メイン担当者メール", "s_mail"], ["拠点メイン担当者電話", "s_tel"],
]
CSVJS = (
    "const COLS=" + _json.dumps(CSV_COLS, ensure_ascii=False) + ";"
    "const base={route:'電話',issue:'1',kubun:'本導入',cname:'株式会社テスト商事',ckana:'テストショウジ',cbill:'株式会社テスト商事 経理部',czip:'100-0001',cpref:'東京都',ccity:'千代田区千代田1-1',ctel:'03-1111-2222',cpay:'口座振替',ccycle:'月払い',clead:'1ヶ月前',m_name:'山田 太郎',m_kana:'ヤマダ タロウ',m_mail:'yamada@example.jp',m_tel:'03-1111-3333',applicant:'yamada@example.jp',equip:'冷蔵庫・冷凍庫',plan:'ES000004',course:'ESスタンダード',ship:'ES配送便',count:'2',start:'2027-01',short:'通常',name:'本社',kana:'ホンシャ',zip:'100-0001',pref:'東京都',city:'千代田区千代田1-1',tel:'03-1111-4444',emp:'120',shift:'前倒す',billTo:'法人に請求'};"
    "const mk=(rows)=>{const q=v=>/[\",\\n]/.test(v)?'\"'+v.replace(/\"/g,'\"\"')+'\"':v;return '\\ufeff'+[COLS.map(c=>q(c[0])).join(',')].concat(rows.map(r=>COLS.map(c=>q(r[c[1]]??'')).join(','))).join('\\r\\n')};"
    "const upload=async(csv,name)=>{const inp=document.querySelector('input[type=file]');const dt=new DataTransfer();dt.items.add(new File([csv],name||'新規申込_20261005.csv',{type:'text/csv'}));inp.files=dt.files;inp.dispatchEvent(new Event('change',{bubbles:true}));await sleep(1800);};"
    "const A={key:'A',...base};"
    "const A2={key:'A',kubun:'本導入',start:'2027-01',equip:'自動販売機',plan:'ES000004',course:'ESライト',ship:'ES配送便',count:'2',floor:'2F 休憩室',short:'通常',name:'大阪営業所',kana:'オオサカエイギョウショ',zip:'530-0001',pref:'大阪府',city:'大阪市北区梅田1-1',tel:'06-1111-0000',emp:'40',shift:'後ろ倒す',billTo:'法人に請求'};"
    "const B={key:'B',...base,cname:'株式会社ベータ',plan:'ES999999',m_mail:'bad-mail',applicant:'bad-mail',name:'ベータ本社'};"
    "const C1={key:'C',...base,cname:'有限会社シー',m_mail:'c@example.jp',applicant:'c@example.jp',name:'シー本店'};"
    "const C2={key:'C',cname:'有限会社シー2',name:'シー支店',kana:'シーシテン',kubun:'本導入',start:'2027-01',equip:'冷蔵庫・冷凍庫',plan:'ES000004',course:'ESスタンダード',ship:'ES配送便',count:'2',short:'通常',zip:'100-0001',pref:'東京都',city:'千代田区1-1',tel:'03-0000-0000',emp:'10',shift:'前倒す',billTo:'法人に請求'};"
    "const D={key:'D',route:'営業（訪問）',issue:'0',corpId:'CU00003',applicant:'tanaka@example.jp',kubun:'本導入',start:'2027-02',equip:'冷蔵庫・冷凍庫',plan:'ES000004',course:'ESスタンダード',ship:'ES配送便',count:'2',short:'通常',name:'横浜支店',kana:'ヨコハマシテン',zip:'220-0011',pref:'神奈川県',city:'横浜市西区高島1-1',tel:'045-111-2222',emp:'30',shift:'前倒す',billTo:'法人に請求',s_name:'田中 花子',s_mail:'tanaka@example.jp'};"
)
CSV_BACK = "/ops/applications"

CVH = [
    I("1", "ヘッダー", "Đầu trang", ".es-pagehead", "area",
      d=["パンくず：契約申請管理＞新規申込のCSV取込（代理入力の一括登録）。タイトルの下に説明はなく、右に「キャンセル」。ファイルを選んだあとは「ファイルを選び直す」「登録」に変わる。", "Breadcrumb: 契約申請管理 > 新規申込のCSV取込（代理入力の一括登録）. Bên phải là 「キャンセル」. Sau khi chọn tệp đổi thành 「ファイルを選び直す」「登録」."],
      cond=["CSV取込 の権限（フル権限・システム管理だけ）。権限がない役割は画面を開けず、契約申請管理の一覧へ戻される", "Có quyền CSV取込 (chỉ フル権限・システム管理). Vai trò không có quyền không mở được màn hình, bị đưa về danh sách 契約申請管理"]),
    I("1.1", "キャンセル／ファイルを選び直す", "Hủy / Chọn lại tệp", ".es-pagehead__actions button.out", "button", "click",
      d=["① のとき「キャンセル」＝契約申請管理の一覧（新規契約タブ）へ戻る。② のとき「ファイルを選び直す」＝① に戻る（読み込んだ内容は捨てる）。取り込む前は何も保存していないので確認の小窓は出ない。", "Ở bước ① 「キャンセル」 = về danh sách 契約申請管理 (tab 新規契約). Ở bước ② 「ファイルを選び直す」 = về bước ① (bỏ nội dung đã đọc). Trước khi nhập chưa lưu gì nên không hiện hộp thoại xác nhận."]),
    I("1.2", "登録", "Đăng ký", ".es-pagehead__actions button.pri", "button", "click", err=["S10", "Q10", "E34"], pattern="P-CSV",
      cond=["② で、取り込める行（新規）が1件以上あり、ファイル全体のエラーがない", "Ở bước ②, có ít nhất 1 dòng nhập được (mới) và không có lỗi cả tệp"],
      d=["エラーでない行を登録する。法人キーごとに「受付中」の新規申込（代理入力）ができ、契約申請管理の一覧（新規契約タブ）へ移る。取り込む前に Q10 を出し、終わったら S10 のトーストを出す。エラーの行は取り込まない。",
         "Đăng ký các dòng không lỗi. Mỗi 法人キー tạo một đơn đăng ký mới (nhập hộ) ở trạng thái 「受付中」 rồi chuyển về danh sách 契約申請管理 (tab 新規契約). Hiện Q10 trước khi nhập và toast S10 khi xong. Dòng lỗi không được nhập."],
      demo_ok=["コードは確認の小窓（Q10）を出さずにすぐ登録し、トーストは共通の「CSV取込：新規 n件・更新 m件を登録しました（変更なし k件）」。新規申込には「更新」がないので、Q10・S10 に揃える", "Code đăng ký ngay không hiện hộp xác nhận (Q10); toast dùng câu chung 「CSV取込：新規 n件・更新 m件を登録しました…」. Đơn mới không có 「更新」 nên cần thống nhất theo Q10・S10"]),
    I("2", "手順", "Các bước", "ol.steps", "label",
      d=["「1 ファイルを選ぶ」→「2 確認・登録」。いまの段階を強調する。", "「1 ファイルを選ぶ」→「2 確認・登録」. Nhấn mạnh bước hiện tại."]),
]
CVA = [
    I("3", "① ファイルを選ぶ", "① Chọn tệp", ".es-card", "area", pattern="P-CSV",
      d=["説明文・ファイルのドロップ領域。列の定義の表は画面に出さない（列は下の「CSVファイルの形式」）。", "Lời giải thích và vùng thả tệp. Không hiện bảng định nghĩa cột trên màn hình (cột xem ở 「CSVファイルの形式」 bên dưới)."]),
    I("3.1", "説明文", "Lời giải thích", ".es-card .hint::1行＝1拠点", "label",
      d=["「1行＝1拠点です。法人キーが同じ行は1つの申込（複数拠点）になり、法人・申込の列は最初の行に入れます。法人ID を入れると今ある法人に拠点を足します。切替（お試し→本導入）は画面で受けます。登録すると「受付中」の申込ができ、…」。その下に、UTF-8・5,000行まで・エラーの行は取り込まないことを書く。",
         "\"1行＝1拠点です。法人キーが同じ行は1つの申込（複数拠点）になり…\". Bên dưới ghi: UTF-8, tối đa 5.000 dòng, dòng lỗi không được nhập."],
      demo_ok=["共通の説明の1文「キーが一致する行は上書き、キーが空欄の行は新規です。空欄のセルは今の値のまま、消すときは「-」を書きます」は新規申込には当てはまらない（いつも新規で、「-」は使えない）。この1文は新規申込では出さない", "Câu chung 「キーが一致する行は上書き、…」 không đúng với đơn mới (luôn là mới, không dùng được 「-」). Màn này không hiện câu đó"]),
    I("3.2", "ファイル選択／ドラッグ＆ドロップ", "Chọn tệp / kéo thả", ".es-card button::ファイルを選ぶ^2", "file", "upload", req="○", err=["E51"], pattern="P-CSV",
      len=["CSV（UTF-8）5,000行まで", "CSV (UTF-8), tối đa 5.000 dòng"],
      ex=["新規申込_20261005.csv", "Tệp .csv UTF-8; kéo thả vào vùng cũng được"],
      d=["「ファイルを選ぶ」のボタンか、ファイルをここへドラッグ＆ドロップ。拡張子が .csv で UTF-8（BOM あり・なし）のファイルだけ読む。選ぶとすぐ確かめて（何も保存しない）② へ進む。ファイル全体のエラー（CSV でない・UTF-8 でない）は ① の下に赤い帯で出し、② へ進まない。",
         "Nút 「ファイルを選ぶ」 hoặc kéo thả tệp vào đây. Chỉ đọc tệp đuôi .csv mã UTF-8 (có hoặc không BOM). Chọn xong kiểm tra ngay (chưa lưu gì) rồi sang ②. Lỗi cả tệp (không phải CSV, không phải UTF-8) hiện dải đỏ dưới ① và không sang ②."]),
    I("3.3", "ファイル名の表示", "Tên tệp", ".es-card .hint::CSV（UTF-8）", "label",
      d=["ファイルを選ぶ前は「CSV（UTF-8）」、確かめている間は「確かめています…」。", "Trước khi chọn: 「CSV（UTF-8）」; trong lúc kiểm tra: 「確かめています…」."]),
]
CVE = [
    I("3.4", "ファイル全体のエラー（①）", "Lỗi cả tệp (①)", ".notice.ng", "label", err=["E51"], pattern="P-CSV",
      d=["E51。「CSVファイルとして読み込めません。UTF-8のCSVファイルを選択してください。」を ① の下に出す。拡張子が .csv でないとき・UTF-8 でないとき（Excel では「CSV UTF-8（コンマ区切り）」で保存）。",
         "E51. Hiện dưới ① khi tệp không đọc được như CSV (đuôi không phải .csv hoặc không phải UTF-8; Excel hãy lưu dạng 「CSV UTF-8」)."],
      demo_ok=["コードの文言は2つ（「CSVファイル（拡張子 .csv）を選んでください」「文字コードが UTF-8 ではありません。Excel では「CSV UTF-8（コンマ区切り）」で保存してください」）。E51 に揃える（保存のしかたは E51 の下に補足として残す）", "Code có 2 câu riêng (sai đuôi / sai mã UTF-8). Cần thống nhất theo E51 (giữ hướng dẫn lưu Excel làm phần bổ sung)"]),
]
CVB = [
    I("4", "② 確認・登録", "② Xác nhận và đăng ký", ".es-card", "area", pattern="P-CSV",
      d=["ファイル名・件数・結果のバッジ・エラーの帯と表・登録する内容の表・注意書き。ここで確かめるだけで、何も保存していない（「登録」を押すまで）。", "Tên tệp, số dòng, badge kết quả, dải và bảng lỗi, bảng nội dung sẽ đăng ký, ghi chú. Ở đây chỉ kiểm tra, chưa lưu gì (cho đến khi bấm 「登録」)."]),
    I("4.1", "ファイル名・件数・結果のバッジ", "Tên tệp・số dòng・badge kết quả", ".es-card b", "label",
      d=["ファイル名と、申込の数（法人キーの数）。バッジ：新規（青）・更新（緑・新規申込では常に 0）・変更なし（灰・常に 0）・エラー（赤）。数は申込（法人キー）の単位。",
         "Tên tệp và số đơn (số 法人キー). Badge: 新規 (xanh dương), 更新 (xanh lá, luôn 0 ở đơn mới), 変更なし (xám, luôn 0), エラー (đỏ). Đếm theo đơn (法人キー)."],
      demo_ok=["コードは「更新 0」「変更なし 0」も出す。新規申込には要らないので、新規とエラーだけにする", "Code còn hiện 「更新 0」「変更なし 0」. Đơn mới không cần, chỉ để 新規 và エラー"]),
    I("4.2", "エラーの行の帯", "Dải dòng lỗi", ".notice.ng::エラーの行", "label", err=["E111"], pattern="P-CSV",
      cond=["エラーの行があるとき", "Khi có dòng lỗi"],
      d=["E111「エラーの行 n件は取り込みません。ほかの行は「登録」で登録します。」。エラーの行は取り込まず、エラーでない行だけ登録する（台帳 F。申込フォーム §10-8 の「エラーがあれば何も登録しない」は仕様側の直し漏れ）。",
         "E111. Dòng lỗi không nhập, chỉ đăng ký các dòng không lỗi (台帳 F). Câu 「エラーがあれば何も登録しない」 ở 申込フォーム §10-8 là chỗ chưa sửa trong 仕様書."],
      demo_ok=["コードの帯は「エラーの行 n件は取り込みません（行番号と内容は下の表）。ほかの行（新規 n件・更新 m件）は「登録」で登録します。」。E111 に揃える（「更新」は外す）", "Câu trong code dài hơn và có 「更新」. Cần thống nhất theo E111 (bỏ 「更新」)"]),
    I("4.3", "エラー一覧CSV", "CSV danh sách lỗi", ".es-card button::エラー一覧CSV", "button", "click", pattern="P-CSV-OUT",
      cond=["エラーの行があるとき", "Khi có dòng lỗi"],
      d=["元の行にエラーの内容を付けた CSV「（ファイル名）_エラー一覧.csv」を保存する。直してから、もう一度取り込む。", "Lưu CSV 「（tên tệp）_エラー一覧.csv」 gồm dòng gốc kèm nội dung lỗi. Sửa xong thì nhập lại."]),
    I("4.4", "エラーの表", "Bảng lỗi", ".es-card table:not(:has(th:nth-child(5)))", "table", err=["E01", "E02", "E04", "E05", "E109"], pattern="P-CSV",
      d=["列：行番号・キー（法人キー）・列名・内容。200行まで（それ以上は「ほか n件」と書き、全部はエラー一覧CSV）。内容は、必須が空（E01・E02）・文字数（E04）・形式（E05 など）・同じ法人キーの行で法人の項目が違う（E109）・公開中でないプラン・自動販売機の配送方法 など。",
         "Cột: số dòng, khóa (法人キー), tên cột, nội dung. Tối đa 200 dòng (còn lại ghi 「ほか n件」, đầy đủ trong エラー一覧CSV). Nội dung: thiếu mục bắt buộc (E01・E02), số ký tự (E04), định dạng (E05...), mục pháp nhân khác nhau giữa các dòng cùng 法人キー (E109), gói không công khai, cách giao của máy bán hàng, v.v."],
      demo_ok=["コードの内容は文章の直書き（「法人名を入れてください」「5行目（同じ法人キー）と違う値です。…」など）。E01・E02・E04・E05・E109 に揃える。郵便番号・フリガナ・電話の形式は見ていない（H5 の共通の基準に合わせる）", "Nội dung trong code là câu ghi trực tiếp. Cần thống nhất theo E01・E02・E04・E05・E109. Chưa kiểm tra định dạng mã bưu chính・furigana・điện thoại (theo tiêu chuẩn chung H5)"]),
    I("4.5", "登録する内容", "Nội dung sẽ đăng ký", ".es-card table:has(th:nth-child(5))", "table",
      d=["見出し「登録する内容（前 → 後）」。列：行番号（同じ申込の行は「2・3」）・区分（新規）・キー・名前（法人名（n拠点））・変わる項目（申込の番号・受付経路・拠点ごとの契約区分／プラン／コース）。エラーの行は出さない。",
         "Tiêu đề 「登録する内容（前 → 後）」. Cột: số dòng (các dòng cùng đơn ghi 「2・3」), phân loại (新規), khóa, tên (tên pháp nhân (n cơ sở)), mục thay đổi (số đơn, kênh tiếp nhận, 契約区分／プラン／コース từng cơ sở). Không hiện dòng lỗi."]),
    I("4.6", "注意書き", "Ghi chú", ".notice::添付ファイル", "label",
      d=["「1つの法人キーごとに「受付中」の新規申込（代理入力）ができます。あとは画面と同じ受付（申込内容確認 → 仮登録 → 本登録）で進めます」「添付ファイル（搬入経路など）は CSV で送れません。登録後に申請詳細で添付してください」。",
         "\"Mỗi 法人キー tạo một đơn mới (nhập hộ) ở trạng thái 「受付中」…\" và \"Không gửi được tệp đính kèm (tuyến vận chuyển...) bằng CSV; hãy đính kèm ở chi tiết sau khi đăng ký\"."]),
    I("4.7", "ファイル全体のエラー（②）", "Lỗi cả tệp (②)", ".notice.ng::見出し", "label", err=["E34"], pattern="P-CSV",
      cond=["1行目の見出しがテンプレートと違う・行がない・5,000行を超えるとき", "Khi tiêu đề dòng 1 khác mẫu, không có dòng dữ liệu hoặc quá 5.000 dòng"],
      d=["E34「CSVインポートが失敗しました。」＋理由（足りない列・知らない列の名前）。ファイル全体のエラーがあると「登録」は押せない。ファイルを直して選び直す。",
         "E34 「CSVインポートが失敗しました。」 + lý do (tên cột thiếu / cột lạ). Khi có lỗi cả tệp, nút 「登録」 bị khóa. Sửa tệp rồi chọn lại."],
      demo_ok=["コードは理由の文だけを赤い帯に出す（「1行目の見出しがテンプレートと違います（足りない列：…）（知らない列：…）」）。E34 を頭に付ける", "Code chỉ hiện câu lý do trong dải đỏ. Cần thêm E34 ở đầu"]),
]
CVT = [
    I("5", "登録完了（トースト）", "Hoàn tất đăng ký (toast)", ".toast", "toast", "show", err=["S10"], pattern="P-CSV",
      d=["S10「CSVを取り込みました（新規 n件・更新 m件）。」。契約申請管理の一覧（新規契約タブ）へ移り、できた申込が「受付中」で並ぶ。受付（AW_APPL_003）で仮登録 → 本登録に進める。",
         "S10 「CSVを取り込みました（新規 n件・更新 m件）。」. Chuyển về danh sách 契約申請管理 (tab 新規契約), các đơn mới hiện ở trạng thái 「受付中」. Tiếp tục đăng ký tạm → chính thức ở màn nhận đơn (AW_APPL_003)."],
      demo_ok=["コードのトーストは「CSV取込：新規 n件・更新 m件を登録しました（変更なし k件）」。S10 に揃える", "Toast trong code khác câu. Cần thống nhất theo S10"]),
    I("5.1", "取り込まれた申込", "Đơn đã nhập", "tr::株式会社テスト商事", "label", "show",
      d=["一覧の新規契約タブの先頭に、取り込んだ申込（受付中・代理入力）が出る。申込の番号 AP-YYYYMMDD-NNNN。", "Đầu danh sách tab 新規契約 hiện đơn vừa nhập (受付中・nhập hộ). Số đơn AP-YYYYMMDD-NNNN."]),
]
CVR = [
    I("6", "権限がない役割", "Vai trò không có quyền", ".es-pagehead__title", "label",
      d=["CSV取込 の権限がない役割（CS・営業・閲覧のみ）が URL を直接開いても、契約申請管理の一覧へ戻される（一覧の見出しにも「CSV取込」は出ない）。", "Vai trò không có quyền CSV取込 (CS・営業・chỉ xem) dù mở trực tiếp URL cũng bị đưa về danh sách 契約申請管理 (đầu danh sách cũng không có nút 「CSV取込」)."]),
]
# ---- CSVファイルの形式（列は lib/csv/apply.ts・申込フォーム §10-8-1）。画面に出さないので sel は "-"
CVF = [
    I("7", "CSVファイルの形式", "Định dạng tệp CSV", "-", "area",
      d=["UTF-8（BOM あり・なし）・カンマ区切り・1行目は見出し・2行目から1行＝1拠点（契約）・5,000行まで。見出しは下の列の名前（順番は問わず、足りない列・知らない列があるとファイル全体のエラー E34）。必須の見出しに【】は付けない。切替（お試し→本導入）は CSV では受けず、画面で受ける。添付ファイルは送れない。",
         "UTF-8 (có/không BOM), ngăn bằng dấu phẩy, dòng 1 là tiêu đề, từ dòng 2 mỗi dòng = 1 cơ sở (hợp đồng), tối đa 5.000 dòng. Tiêu đề là tên cột bên dưới (không cần đúng thứ tự; thiếu cột hoặc cột lạ thì lỗi cả tệp E34). Không gắn 【】 vào tiêu đề cột bắt buộc. Chuyển đổi (dùng thử → chính thức) không nhận bằng CSV mà nhận trên màn hình. Không gửi được tệp đính kèm."]),
    I("7.1", "まとめ方（法人キー）", "Cách gộp (法人キー)", "-", "label", err=["E01", "E109"],
      d=["「法人キー」（必須）が同じ行を1つの申込にまとめる（ファイルの順）。法人・申込の列（受付経路・ES営業担当・アカウントを発行するか・法人の列・担当者・お申し込み者）は最初の行に入れる。ほかの行は空欄か同じ値で、違う値はエラー（E109）。法人キーが空の行はエラー（E01）。",
         "Các dòng có 「法人キー」 (bắt buộc) giống nhau gộp thành 1 đơn (theo thứ tự tệp). Cột pháp nhân・đơn (kênh tiếp nhận, ES営業担当, cấp tài khoản hay không, cột pháp nhân, người phụ trách, người đăng ký) ghi ở dòng đầu. Các dòng khác để trống hoặc cùng giá trị, giá trị khác là lỗi (E109). Dòng trống 法人キー là lỗi (E01)."]),
    I("7.2", "受付の列", "Cột tiếp nhận", "-", "label", err=["E02"],
      d=["法人キー・受付経路（必須。電話・営業（訪問）・紙の申込書・メール・その他）・ES営業担当（50文字まで）・契約区分（必須。本導入／お試し）・お試し期間月数（お試しのとき必須。1〜12）・アカウントを発行するか（必須。1＝する・0＝しない）。受付日は取り込んだ日、入力者は取り込んだ人。",
         "法人キー, 受付経路 (bắt buộc: 電話・営業（訪問）・紙の申込書・メール・その他), ES営業担当 (tối đa 50 ký tự), 契約区分 (bắt buộc: 本導入／お試し), お試し期間月数 (bắt buộc khi dùng thử, 1–12), アカウントを発行するか (bắt buộc: 1 = cấp, 0 = không). Ngày tiếp nhận là ngày nhập, người nhập là người thực hiện nhập."]),
    I("7.3", "法人の列", "Cột pháp nhân", "-", "label", err=["E01", "E05"],
      d=["法人ID（今ある法人に拠点を足すとき。CU＋5桁。空欄＝新しい法人）。新しい法人のとき必須：法人名・法人名フリガナ・請求先法人名・法人の郵便番号・都道府県・市区町村・番地・電話番号・支払い方法（口座振替・銀行振込・クレジットカード）・支払サイクル（月払い・年払い）・請求書の発行時期（3ヶ月前〜翌月（後払い））。任意：建物・FAX番号。",
         "法人ID (khi thêm cơ sở cho pháp nhân hiện có; CU + 5 số; trống = pháp nhân mới). Bắt buộc khi pháp nhân mới: tên pháp nhân, furigana, tên pháp nhân nhận hóa đơn, mã bưu chính, tỉnh, quận/huyện・số nhà, điện thoại, phương thức thanh toán, chu kỳ thanh toán, thời điểm phát hành hóa đơn. Tùy chọn: tên tòa nhà, FAX."]),
    I("7.4", "担当者の列", "Cột người phụ trách", "-", "label", err=["E05"],
      d=["法人メイン担当者（名前・フリガナ・メール・電話。新しい法人のとき必須）・法人請求担当者（空欄＝メイン担当者と同じ）・お申し込み者（必須。担当者（法人・拠点）のメールアドレスのどれかを入れる）・拠点メイン担当者（空欄＝法人のメイン担当者と同じ）。メールは形式を確かめる。",
         "Người phụ trách chính của pháp nhân (tên, furigana, mail, điện thoại; bắt buộc khi pháp nhân mới), người phụ trách thanh toán (trống = giống người chính), người đăng ký (bắt buộc; nhập 1 trong các địa chỉ mail của người phụ trách (pháp nhân・cơ sở)), người phụ trách chính của cơ sở (trống = giống người chính của pháp nhân). Kiểm tra định dạng mail."]),
    I("7.5", "契約・設備の列", "Cột hợp đồng・thiết bị", "-", "label", err=["E02"],
      d=["設備タイプ（必須。冷蔵庫・冷凍庫／自動販売機）・プラン（必須。公開中のプランID）・コース（必須。ESライト／ESスタンダード）・配送方法（必須。ES配送便／COOL便。自動販売機は ES配送便だけ）・配送回数（月）（必須。1〜8）・契約開始希望年月（本導入のとき必須。yyyy-mm）・設置フロア（自動販売機は必須）・オプション（オプションコードを ; でつなぐ。申込で選べるものだけ）・消費期限の短い商品の扱い（必須。通常／短消費期限なし）・プラン外の備考。",
         "設備タイプ (bắt buộc), プラン (bắt buộc; ID gói đang công khai), コース (bắt buộc), 配送方法 (bắt buộc; máy bán hàng chỉ ES配送便), 配送回数（月） (bắt buộc, 1–8), 契約開始希望年月 (bắt buộc khi chính thức, yyyy-mm), 設置フロア (bắt buộc với máy bán hàng), オプション (mã tùy chọn nối bằng ;, chỉ loại chọn được khi đăng ký), 消費期限の短い商品の扱い (bắt buộc), ghi chú ngoài gói."]),
    I("7.6", "納品先・配送・請求の列", "Cột nơi giao・giao hàng・thanh toán", "-", "label", err=["E01", "E04"],
      d=["納品先名・フリガナ・郵便番号・都道府県・市区町村・番地・電話番号・従業員数概算（0〜99999）・納品不可になった場合（前倒す／後ろ倒す）・請求書（法人に請求／この拠点に請求）は必須。建物・FAX・納品不可曜日（月;水 のように）・配送の希望は任意。「この拠点に請求」のときは、拠点の支払方法・支払サイクルも必須。",
         "Bắt buộc: tên nơi giao, furigana, mã bưu chính, tỉnh, quận/huyện・số nhà, điện thoại, số nhân viên ước tính (0–99999), xử lý khi không giao được (前倒す／後ろ倒す), hóa đơn (法人に請求／この拠点に請求). Tùy chọn: tòa nhà, FAX, thứ không giao được (vd. 月;水), mong muốn giao hàng. Khi 「この拠点に請求」 thì phương thức・chu kỳ thanh toán của cơ sở cũng bắt buộc."]),
    I("7.7", "行のチェック", "Kiểm tra từng dòng", "-", "label", err=["E01", "E02", "E04", "E05", "E109"], pattern="P-CSV",
      d=["必須の空欄（E01・E02）・文字数（E04）・形式（E05）・選べない値（プランが公開中でない・コースがそのプランにない・オプションが申込で選べない）・組み合わせ（お試しはお試し期間月数が必須、本導入は契約開始希望年月が必須、自動販売機は設置フロアが必須で配送方法は ES配送便だけ、同じ法人キーの契約区分は1つ、お申し込み者は担当者のメールのどれか、法人ID は今ある法人）を確かめる。エラーの行は取り込まず、その申込だけ見送る。",
         "Kiểm tra: ô bắt buộc để trống (E01・E02), số ký tự (E04), định dạng (E05), giá trị không chọn được (gói không công khai, khóa học không có trong gói, tùy chọn không chọn được), tổ hợp (dùng thử cần số tháng, chính thức cần tháng bắt đầu, máy bán hàng cần tầng lắp và chỉ ES配送便, cùng 法人キー chỉ 1 loại hợp đồng, người đăng ký là 1 trong các mail người phụ trách, 法人ID phải là pháp nhân hiện có). Dòng lỗi không được nhập, đơn đó bị bỏ qua."],
      demo_ok=["コードは郵便番号の桁・フリガナの全角カナ・電話の形式・全角→半角・絵文字を見ていない（H5 の入力の共通基準に合わせる）。ES営業担当は文字（50文字まで）で、運営ユーザーから選ぶ形（H19）には合っていない", "Code chưa kiểm tra số chữ số mã bưu chính, katakana furigana, định dạng điện thoại, chuyển toàn→bán giác, emoji (theo tiêu chuẩn chung H5). ES営業担当 là chữ tự do (tối đa 50 ký tự), chưa theo kiểu chọn từ người dùng vận hành (H19)"]),
]
VIEWS += [
    V("096", "AW_APPL_006", "① ファイルを選ぶ", "① Chọn tệp", "/ops/applications/import",
      pick(CVH, "1", "1.1", "2") + CVA + CVF,
      note=["一覧の新規契約タブの「CSV取込」から開いた直後。CSV の列は下の「CSVファイルの形式」にまとめた（画面には出さない）。", "Ngay sau khi mở từ 「CSV取込」 ở tab 新規契約. Các cột CSV tóm tắt ở 「CSVファイルの形式」 bên dưới (không hiện trên màn hình)."]),
    V("097", "AW_APPL_006", "② 確認・登録（エラーの行がある）", "② Xác nhận・đăng ký (có dòng lỗi)", "/ops/applications/import",
      pick(CVH, "1", "1.1", "1.2", "2") + CVB[:7],
      setup=CSVJS + "await upload(mk([A,A2,B,C1,C2]));",
      note=["5行のファイルを読んだ直後。法人キー A（2拠点）は取り込める。B（プランがない・メールの形式）と C（同じ法人キーで法人名が違う）はエラーで取り込まない。「登録」で A だけ登録する。", "Ngay sau khi đọc tệp 5 dòng. 法人キー A (2 cơ sở) nhập được. B (gói không tồn tại・sai định dạng mail) và C (cùng 法人キー nhưng tên pháp nhân khác) bị lỗi, không nhập. Bấm 「登録」 thì chỉ đăng ký A."]),
    V("098", "AW_APPL_006", "② 確認・登録（エラーなし・既存の法人に拠点を足す）", "② Xác nhận・đăng ký (không lỗi・thêm cơ sở cho pháp nhân hiện có)", "/ops/applications/import",
      pick(CVH, "1.2") + pick(CVB, "4", "4.1", "4.5", "4.6"),
      setup=CSVJS + "await upload(mk([A,A2,D]));",
      note=["エラーがないファイル。A は新しい法人（2拠点）、D は法人 CU00003 に拠点を足す申込（法人ID を入れた行）。エラーの帯と表は出ない。", "Tệp không có lỗi. A là pháp nhân mới (2 cơ sở), D là đơn thêm cơ sở cho pháp nhân CU00003 (dòng có 法人ID). Không hiện dải và bảng lỗi."]),
    V("099", "AW_APPL_006", "① ファイル全体のエラー（UTF-8 でない・拡張子が .csv でない）", "① Lỗi cả tệp (không phải UTF-8・đuôi không phải .csv)", "/ops/applications/import",
      pick(CVA, "3.2") + CVE,
      setup="const inp=document.querySelector('input[type=file]');const dt=new DataTransfer();dt.items.add(new File([new Uint8Array([0x83,0x65,0x83,0x58,0x83,0x67,0x2c,0x0d,0x0a])],'申込_sjis.csv',{type:'text/csv'}));inp.files=dt.files;inp.dispatchEvent(new Event('change',{bubbles:true}));await sleep(1500);",
      note=["Excel の「CSV（コンマ区切り）」で保存したファイル（Shift_JIS）を選んだとき。② へ進まず、① の下に赤い帯が出る。拡張子が .csv でないときも同じ場所に出る。", "Khi chọn tệp lưu bằng Excel 「CSV（コンマ区切り）」 (Shift_JIS). Không sang ②, hiện dải đỏ dưới ①. Đuôi không phải .csv cũng hiện ở cùng chỗ."]),
    V("100", "AW_APPL_006", "② ファイル全体のエラー（見出しが違う）", "② Lỗi cả tệp (tiêu đề sai)", "/ops/applications/import",
      pick(CVH, "1.2") + CVB[:2] + CVB[6:],
      setup="const inp=document.querySelector('input[type=file]');const dt=new DataTransfer();dt.items.add(new File(['a,b\\r\\n1,2'],'見出し違い.csv',{type:'text/csv'}));inp.files=dt.files;inp.dispatchEvent(new Event('change',{bubbles:true}));await sleep(1500);",
      note=["1行目の見出しがテンプレートと違うファイル。足りない列と知らない列の名前が赤い帯に出て、「登録」は押せない。", "Tệp có tiêu đề dòng 1 khác mẫu. Tên cột thiếu và cột lạ hiện trong dải đỏ, nút 「登録」 bị khóa."]),
    V("101", "AW_APPL_006", "登録完了（受付中の申込として一覧に追加）", "Hoàn tất đăng ký (thêm vào danh sách thành đơn 受付中)", "/ops/applications/import",
      CVT,
      setup=CSVJS + "await upload(mk([A,A2,D]));btn('登録',document.querySelector('.es-pagehead__actions')).click();for(let i=0;i<40&&!document.querySelector('.toast');i++)await sleep(200);await sleep(300);",
      note=["「登録」を押した直後。契約申請管理の一覧（新規契約タブ）へ移り、S10 のトーストが出る。取り込んだ申込は「受付中」で先頭に並ぶ。", "Ngay sau khi bấm 「登録」. Chuyển về danh sách 契約申請管理 (tab 新規契約), hiện toast S10. Đơn đã nhập xếp đầu với trạng thái 「受付中」."]),
    V("102", "AW_APPL_006", "権限がない役割（CS）が開いたとき", "Khi vai trò không có quyền (CS) mở", "/ops/applications/import",
      CVR, login="Ad00002", setup="await sleep(1500);",
      note=["CS（Ad00002）が URL を直接開いたとき。CSV取込の画面は開かず、契約申請管理の一覧へ戻る。", "Khi CS (Ad00002) mở trực tiếp URL. Không mở màn nhập CSV mà quay về danh sách 契約申請管理."]),
]
