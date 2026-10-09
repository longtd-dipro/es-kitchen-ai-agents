# -*- coding: utf-8 -*-
"""
画面設計書のデータ：運営管理者Web「拠点一覧」（AW_BRAN）。
元は本物の Web（このリポジトリのコード app/ops/branches/**・lib/ops/contracts/forms.ts の BRANCH_FORM）。決定は docs/決定台帳.md（B・E・F・K）、項目は docs/01_仕様/20_法人・拠点・契約/契約仕様/契約_02・契約_04 が正。
洗い出し・確認の記録は docs/05_画面設計書/確認メモ_AW_運営A_申請・法人・契約.md（Q＝hong 回答済み・受付簿 No.184、H＝宿題、O＝open）。

画面：AW_BRAN_001 拠点一覧／002 拠点詳細／003 拠点編集／004 拠点CSV取込（画面コード規約 2026-10-05）
親契約の一覧 /ops/contracts/parents/[no] は画面ではなく、拠点詳細のタブ「契約」へ移る（BRAN_002）。
見本のデータ（今日＝2026-10-05）：CU00643 本社（自販機・CP0000001）／CU00871 大阪支店／CU00902 名古屋営業所（10/12 から休止）／CU00975 みちのく仙台本社（お試し）／CU01012 あおば仙台工場（仮登録）ほか15拠点

コードと決定が違うところ（demo_ok＝決定が正・コードを直す宿題）：
  ・（解消済み 2026-10-08）並べ替え（全列）・初期の並び＝更新日時の降順・更新日時の列・「未適用」の印を外した・同時編集（I02・E31）・文字数の上限（E04）・「在庫点検」→「棚卸」のラベル・お試し延長の「割引しない」表示
  ・「取消」の拠点は既定で出さず絞り込みで出す（コードは取消も出す・選択肢にない）
  ・拠点ステータスは 仮登録／本登録／閉鎖予定／閉鎖 を持ち、休止中は親契約から表示だけ（コードの選択肢に休止中がある）
  ・「在庫点検」の語は画面で「棚卸」にそろえる／貸出一覧の「回収済も表示」ボタンはドロップダウンの絞り込みに／お試しの延長は割引しない（コードは無料）
  ・カナ・メール形式・絵文字の入力チェック、リードタイム変更の警告、メイン・請求担当者の必須チェックがコードにない
撮れない状態（見本のデータで出せない。demo_ok に理由）：取消の拠点／リードタイム変更の警告
"""

TITLE = ["拠点一覧（AW_BRAN）", "Danh sách cơ sở (AW_BRAN)"]
SHEET = ["拠点一覧", "Danh sách cơ sở"]
BASENAME = "画面設計書_AW_BRAN_拠点一覧"
IMG_PREFIX = "AW_BRAN"
OUT_DIR = "運営管理者Web_申請・契約"
CODE_NOTE = ["画面コード規約（docs/01_仕様/画面コード規約_20261005.md）：<Module(2)>_<Feature(4)>_<Seq(3)>。AW＝Admin Web、BRAN＝拠点", "Quy ước mã màn hình (画面コード規約_20261005): <Module(2)>_<Feature(4)>_<Seq(3)>. AW = Admin Web, BRAN = cơ sở"]
SITE = "ops"
SYSTEM = {"ja": "運営管理者Web", "vi": "Web quản trị vận hành"}
AUTHOR = "Claude（cloud）／確認：hong"
CREATED = "2026-10-07"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "ops", "loginId": "Ad00010"}
CODE_PATHS = ["app/ops/branches", "app/ops/corps/_components", "app/ops/contracts/parents", "app/ops/_ui", "lib/ops/contracts", "lib/ops/areas/contracts.ts", "lib/csv", "lib/domain/seed"]

DECISIONS = [
    {"date": "2026-10-07", "target": "AW_BRAN 全体（CSV取込）",
     "q": ["法人一覧・拠点一覧・子契約一覧に CSV取込を置くか", "Có đặt nhập CSV ở danh sách pháp nhân / cơ sở / hợp đồng con không"],
     "a": ["3 画面とも置く（A）。拠点は拠点ID＝キーで更新だけ（新しい拠点は契約申請管理の申込から）。取込はフル権限・システム管理だけ", "Đặt cả 3 màn hình (A). Cơ sở: khóa = 拠点ID, chỉ cập nhật (cơ sở mới đi từ đơn ở 契約申請管理). Nhập CSV chỉ フル権限・システム管理"], "src": "hong 回答 2026-10-07（確認メモ_AW_運営A Q5＝A・台帳 F・受付簿 No.184）"},
    {"date": "2026-10-07", "target": "AW_BRAN_002 パスワード再設定",
     "q": ["拠点アカウントの「パスワード再設定」は誰ができるか", "Ai được \"パスワード再設定\" cho tài khoản cơ sở"],
     "a": ["法人のアカウント操作と同じ扱い：再設定の案内は編集権限（CS の R/U も可）。停止・再開はフル権限・システム管理だけ（拠点には停止の操作は置かない）", "Cùng cách xử lý với thao tác tài khoản pháp nhân: gửi hướng dẫn đặt lại mật khẩu dùng quyền sửa (CS R/U cũng được). Khóa / mở lại chỉ フル権限・システム管理 (cơ sở không đặt thao tác khóa)"], "src": "hong 回答 2026-10-07（確認メモ_AW_運営A Q3＝B・台帳 F・受付簿 No.184）"},
    {"date": "2026-10-07", "target": "AW_BRAN_002 変更履歴の列",
     "q": ["契約系（法人・拠点・子契約）の変更履歴の列", "Các cột lịch sử thay đổi của nhóm hợp đồng"],
     "a": ["P-HIST の列に、契約だけの 適用範囲・承認者・通知の有無 を足す（C）", "Cột của P-HIST cộng thêm 適用範囲・承認者・通知の有無 riêng của hợp đồng (C)"], "src": "hong 回答 2026-10-07（確認メモ_AW_運営A Q6＝C・台帳 F・受付簿 No.184）"},
    {"date": "2026-10-03", "target": "AW_BRAN_001・002 拠点ステータス「休止中」",
     "q": ["拠点ステータスに「休止中」を持つか", "Có giữ giá trị \"休止中\" ở trạng thái cơ sở không"],
     "a": ["持たない。休止は親契約の契約ステータス（利用休止）と休止履歴から表示だけする（一覧の絞り込みにも出す）。拠点ステータスが持つ値は 仮登録／本登録／閉鎖予定／閉鎖", "Không giữ. Hiển thị 休止 chỉ từ trạng thái hợp đồng cha (利用休止) và lịch sử tạm ngưng (cũng có trong bộ lọc). Giá trị của trạng thái cơ sở: 仮登録 / 本登録 / 閉鎖予定 / 閉鎖"], "src": "契約_01 §6-2（契約_04 No.6）"},
    {"date": "2026-10-03", "target": "AW_BRAN_002 お試しの延長",
     "q": ["お試しの延長は誰ができ、延長の月は割引するか", "Ai được gia hạn dùng thử và tháng gia hạn có giảm giá không"],
     "a": ["運営だけ（法人Web からはできない）。延長分は割引しない（プラン料金を請求する）。法人へ通知・メールで知らせ、法人Web の拠点詳細「お試し期間」に延長が出る", "Chỉ vận hành (không làm được từ 法人Web). Phần gia hạn không giảm giá (tính phí gói). Thông báo / email cho pháp nhân, gia hạn hiện ở \"お試し期間\" của chi tiết cơ sở trên 法人Web"], "src": "台帳 B「お試し割引」（K1）・受付簿 No.53（2026-10-03 決定）"},
    {"date": "2026-10-05", "target": "AW_BRAN_002 No.貸出一覧の絞り込み",
     "q": ["貸出一覧の「回収済も表示」のボタンをどうするか", "Nút \"回収済も表示\" ở danh sách cho mượn xử lý thế nào"],
     "a": ["使わない。詳細の中の表の絞り込みは表の上のドロップダウン（既定値あり）にし、行が多い表は一覧と同じページ送り", "Không dùng. Lọc bảng trong chi tiết bằng dropdown phía trên bảng (có giá trị mặc định), bảng nhiều dòng thì phân trang như danh sách"], "src": "台帳 F「詳細の中の表の絞り込み」（H9）"},
    {"date": "2026-10-05", "target": "AW_BRAN_003 No.棚卸",
     "q": ["「在庫点検」の語", "Từ \"在庫点検\""],
     "a": ["画面では「棚卸」に統一（保存する値・項目名のキー・CSV 見出し・ID は変えない）", "Thống nhất \"棚卸\" trên màn hình (không đổi giá trị lưu, khóa tên mục, tiêu đề CSV, ID)"], "src": "台帳 F「用語の統一」・受付簿 No.159（H8）"},
]

CHANGES = []

HIDE_ALWAYS = []
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [
    {"code": "AW_BRAN_001", "ja": "拠点一覧", "vi": "Danh sách cơ sở"},
    {"code": "AW_BRAN_002", "ja": "拠点詳細", "vi": "Chi tiết cơ sở"},
    {"code": "AW_BRAN_003", "ja": "拠点編集", "vi": "Sửa cơ sở"},
    {"code": "AW_BRAN_004", "ja": "拠点CSV取込", "vi": "Nhập CSV cơ sở"},
]

# ---------------------------------------------------------------- 小さな関数
H = (
    "const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));const q=(s)=>document.querySelector(s);"
    "const setv=(el,v)=>{if(!el)return;const p=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;"
    "Object.getOwnPropertyDescriptor(p,'value').set.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}));};"
    "const setsel=(el,v)=>{if(!el)return;Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(el,v);el.dispatchEvent(new Event('change',{bubbles:true}));};"
    "const btn=(t,root)=>[...(root||document).querySelectorAll('button')].find(b=>(b.textContent||'').trim().includes(t));"
    "const tab=(t)=>[...document.querySelectorAll('[role=tab]')].find(b=>(b.textContent||'').trim()===t);"
    "const fld=(t)=>[...document.querySelectorAll('.f')].find(f=>((f.querySelector('label')||{}).textContent||'').startsWith(t));"
    "const ctl=(t)=>fld(t).querySelector('input,select,textarea');"
    "const search=()=>{btn('検索',q('.es-search')).click();};"
    "const upload=async(text,name)=>{const inp=document.querySelector('input[type=file]');const dt=new DataTransfer();dt.items.add(new File([text],name||'取込テスト.csv',{type:'text/csv'}));inp.files=dt.files;inp.dispatchEvent(new Event('change',{bubbles:true}));await sleep(2000);};"
    "const csvText=async(entity,fn)=>{const res=await fetch('/api/domain/csv/export',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json','x-es-site':'ops'},body:JSON.stringify({args:{entity:entity,scope:{site:'ops'}}})});"
    "const t=await res.json();const esc=v=>'\"'+String(v==null?'':v).replace(/\"/g,'\"\"')+'\"';const rows=[t.head].concat(t.rows);fn(t,rows);return '\\ufeff'+rows.map(r=>r.map(esc).join(',')).join('\\r\\n');};"
)
TRIG = {"button": "click", "link": "click", "text": "input", "textarea": "input", "select": "select", "month": "input", "date": "input", "check": "check", "radio": "check", "tab": "click", "file": "upload"}
ITEMS = {}
_N = {"n": 0, "m": 0}

LENVI = {
    "選択（仮登録／本登録／閉鎖予定／閉鎖）": "Chọn (đăng ký tạm / chính thức / dự kiến đóng / đóng)",
    "文字列 8（数字7桁）": "Chuỗi 8 (7 chữ số)", "文字列 20（数字・ハイフン）": "Chuỗi 20 (số và gạch nối)", "文字列 CU＋連番": "Chuỗi CU + số thứ tự",
    "選択（法人／この拠点）": "Chọn (pháp nhân / cơ sở này)", "選択（法人なし＋法人マスタ）": "Chọn (không pháp nhân + danh sách pháp nhân)",
    "整数 0〜999,999（人）": "Số nguyên 0–999.999 (người)", "日付（yyyy-mm-dd）": "Ngày (yyyy-mm-dd)", "選択（あり／なし）": "Chọn (có / không)",
    "選択（通常／短消費期限なし）": "Chọn (thường / không hạn dùng ngắn)", "選択（お試しキャンペーン／本導入）": "Chọn (chiến dịch dùng thử / chính thức)",
    "選択（仮登録／有効／解約手続き中／停止／利用休止／終了）": "Chọn (đăng ký tạm / hiệu lực / đang làm thủ tục hủy / dừng / tạm ngưng / kết thúc)",
    "選択（年月）": "Chọn (năm-tháng)", "日付または空欄": "Ngày hoặc để trống", "選択（代理店マスタ）": "Chọn (danh sách đại lý)",
    "選択（月数）": "Chọn (số tháng)", "ファイル（JPG・PNG・PDF）": "Tệp (JPG, PNG, PDF)",
}
INITVI = {
    "東京都": "Tokyo", "まとめて発行（法人1通）": "Gộp 1 hóa đơn cho cả pháp nhân", "口座振替": "Chuyển khoản tự động", "完了": "Hoàn tất",
    "月払い": "Hằng tháng", "請求月の27日": "Ngày 27 của tháng hóa đơn", "本導入": "Chính thức", "あり": "Có", "通常": "Thường", "有効": "Hiệu lực",
    "本登録": "Đăng ký chính thức", "法人": "Pháp nhân", "—（法人に従う）": "— (theo pháp nhân)",
}

def _add(key, no, ja, vi, sel, kind, d, kw):
    r = {"no": no, "ja": ja, "vi": vi, "sel": sel, "kind": kind, "trig": kw.pop("trig", TRIG.get(kind, "view"))}
    if d: r["detail"] = d
    r.update(kw)
    if isinstance(r.get("len"), str) and r["len"] in LENVI: r["len"] = [r["len"], LENVI[r["len"]]]
    if isinstance(r.get("init"), (list, tuple)) and len(r["init"]) == 2 and r["init"][0] == r["init"][1] and r["init"][0] in INITVI:
        r["init"] = [r["init"][0], INITVI[r["init"][0]]]
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

def LK(ent, id, key, label, other="伊藤 美咲"):
    """他のユーザーが編集中（I02）＋先に保存された（E31）の状態を作る（API で他人の編集中の記録を入れ、画面で直したあとに版を2回進める）"""
    ap = ("const ap=async(op,args)=>{const r=await fetch('/api/ops/area/contracts/'+op,{method:'POST',credentials:'include',headers:{'Content-Type':'application/json','x-es-site':'ops'},body:JSON.stringify({args})});return r.json();};")
    return (ap +
        "await ap('presence',{entity:'%s',id:'%s',accountId:'Ad00011',name:'%s'});" % (ent, id, other) +
        "btn('編集').click();await sleep(1800);" +
        "setv(ctl('%s'),'（別の人が保存する前に画面で直した内容）');await sleep(200);" % label +
        "const d=await ap('%s',{id:'%s'});const o=d.values['%s']||'';" % (ent, id, key) +
        "const v=Object.assign({},d.values);v['%s']=o+'*';await ap('save',{entity:'%s',id:'%s',values:v,tables:d.tables,baseVersion:d.version});" % (key, ent, id) +
        "const d2=await ap('%s',{id:'%s'});const w=Object.assign({},d2.values);w['%s']=o;await ap('save',{entity:'%s',id:'%s',values:w,tables:d2.tables,baseVersion:d2.version});" % (ent, id, key, ent, id) +
        "q('.pbtn button.save').click();await sleep(900);")

def V(id, code, ja, vi, url, keys, setup="", note=None, full=True, wait=None, **kw):
    v = {"id": id, "code": code, "state": [ja, vi], "url": url, "setup": (H + setup) if setup else "", "full": full, "note": note or ["", ""], "items": P(*keys)}
    if wait is not None: v["wait"] = wait
    v.update(kw)
    return v

CSVIN = ["拠点管理の CSV取込 の権限（フル権限・システム管理だけ）", "Quyền CSV取込 của 拠点管理 (chỉ フル権限・システム管理)"]
EDIT = ["拠点管理の 編集 の権限（フル権限・システム管理・物流）", "Quyền 編集 của 拠点管理 (フル権限・システム管理・物流)"]
INIT_BLANK = ["空欄（更新の行は今の値のまま）", "Trống (dòng cập nhật giữ giá trị cũ)"]
U = lambda ja, vi: [ja, vi]

# ================================================================ AW_BRAN_001 一覧
big("l_head", "ヘッダー", "Đầu trang", ".es-pagehead", "area", ["パンくず（法人・契約管理 / 拠点）・画面名・操作ボタン。権限がないボタンは出さない。", "Breadcrumb (法人・契約管理 / 拠点), tên màn hình, nút thao tác. Nút không có quyền thì không hiện."])
sub("l_crumb", "パンくず", "Breadcrumb", ".es-breadcrumb", "label", ["「法人・契約管理 / 拠点」。リンクは動かない（表示だけ）。", "「法人・契約管理 / 拠点」. Liên kết không hoạt động (chỉ hiển thị)."])
sub("l_title", "画面名", "Tên màn hình", ".es-pagehead__title", "label", ["「拠点一覧」", "Tiêu đề 「拠点一覧」"])
sub("l_csvin", "CSV取込", "Nhập CSV", ".es-pagehead__actions button::CSV取込", "button", ["拠点CSV取込（AW_BRAN_004）へ。キーは拠点ID（更新だけ。新しい拠点は契約申請管理の申込から）。", "Mở màn 拠点CSV取込 (AW_BRAN_004). Khóa = 拠点ID (chỉ cập nhật; cơ sở mới đi từ đơn ở 契約申請管理)."], cond=CSVIN, pattern="P-CSV")
sub("l_csvout", "CSV出力", "Xuất CSV", ".es-pagehead__actions button::CSV出力", "button", ["検索条件のとおりの全件・システムにある項目すべて（旧ES ユーザーIDを含む）。閲覧できる役割すべてに出す。", "Toàn bộ theo điều kiện tìm kiếm, mọi mục có trong hệ thống (gồm 旧ES ユーザーID). Hiện với mọi vai trò xem được."], pattern="P-CSV-OUT", err=["S12"],
    demo_ok=["コードの出力は「画面の列＋その文書の全項目」（実際に出力して確認：44列）。担当者の表・更新日時・継続年月の列は出ない（H18）。台帳 M-1「システムにある項目すべて」に合わせて足す", "Code xuất \"cột màn hình + mọi mục của tài liệu\" (đã xuất thử: 44 cột). Không có bảng người phụ trách, 更新日時, 継続年月 (H18). Cần thêm cho đúng 台帳 M-1 \"mọi mục có trong hệ thống\""])
big("l_search", "検索条件", "Điều kiện tìm kiếm", ".es-search", "area", ["検索条件は「検索」か Enter で反映する。「未適用」の印は出さない。欄が2行以上に折り返すときだけ開閉のボタンを出す。", "Điều kiện chỉ áp dụng khi nhấn \"検索\" hoặc Enter. Không hiện dấu \"未適用\". Chỉ hiện nút đóng/mở khi các ô xuống từ 2 dòng."], pattern="P-LIST",
    )
sub("l_kw", "キーワード", "Từ khóa", ".es-search input[aria-label='拠点ID、拠点名、親契約番号']", "text", ["拠点ID・拠点名・親契約番号の部分一致。", "Khớp một phần với 拠点ID・拠点名・親契約番号."], req="－", len="文字列 60", ex=["CU00643", "Một phần ID, tên cơ sở hoặc số hợp đồng cha"])
sub("l_tel", "郵便番号・電話番号・市区町村・旧ES ユーザーID", "Mã bưu chính・điện thoại・quận/huyện・旧ES ユーザーID", ".es-search input[aria-label='郵便番号、電話番号、市区町村、旧ES ユーザーID']", "text", ["郵便番号・電話番号・市区町村・旧ES ユーザーID（フェーズ1のユーザーID）の部分一致。", "Khớp một phần mã bưu chính, điện thoại, quận/huyện, 旧ES ユーザーID (ID người dùng phiên bản 1)."], req="－", len="文字列 60", ex=["港区", "Mã bưu chính, điện thoại, quận/huyện hoặc ID cũ"])
sub("l_corp", "所属法人", "Pháp nhân trực thuộc", ".es-search select[aria-label='所属法人']", "select", ["一覧にある法人から選ぶ（「（法人なし）」の拠点も含む）。", "Chọn từ các pháp nhân có trong danh sách (gồm cả cơ sở \"（法人なし）\")."], req="－", len=U("選択（法人マスタ）", "Chọn (danh sách pháp nhân)"), init=U("所属法人（すべて）", "Pháp nhân trực thuộc (tất cả)"), ex=["株式会社サンプル", "Chọn 1 pháp nhân"])
sub("l_status", "拠点ステータス", "Trạng thái cơ sở", ".es-search select[aria-label='拠点ステータス']", "select", ["選択肢：仮登録／本登録／休止中／閉鎖予定／閉鎖／取消。休止中は親契約の「利用休止」から表示だけ（拠点は持たない）。「取消」（仮登録のあとの却下・取り下げ）は既定では出さず、選んだときだけ出す（台帳 B）。", "Lựa chọn: 仮登録 / 本登録 / 休止中 / 閉鎖予定 / 閉鎖 / 取消. 休止中 chỉ hiển thị từ \"利用休止\" của hợp đồng cha (cơ sở không giữ giá trị). \"取消\" (từ chối / rút đơn sau đăng ký tạm) mặc định không hiện, chỉ hiện khi chọn (台帳 B)."], req="－", len=U("選択（仮登録／本登録／休止中／閉鎖予定／閉鎖／取消）", "Chọn (tạm / chính thức / tạm ngưng / dự kiến đóng / đóng / hủy)"), init=U("拠点ステータス（すべて）", "Trạng thái cơ sở (tất cả)"), ex=["本登録", "Chọn 1 trạng thái"],
    demo_ok=["コードの選択肢に「取消」がない（H6）", "Lựa chọn của code chưa có \"取消\" (H6)"])
sub("l_kind", "契約種別", "Loại hợp đồng", ".es-search select[aria-label='契約種別']", "select", ["選択肢：本導入／お試しキャンペーン。", "Lựa chọn: 本導入 / お試しキャンペーン."], req="－", len=U("選択（本導入／お試しキャンペーン）", "Chọn (chính thức / chiến dịch dùng thử)"), init=U("契約種別（すべて）", "Loại hợp đồng (tất cả)"), ex=["お試しキャンペーン", "Chọn 1 loại"])
sub("l_cst", "契約ステータス", "Trạng thái hợp đồng", ".es-search select[aria-label='契約ステータス']", "select", ["選択肢：有効／仮登録／解約手続き中／利用休止／停止／終了。", "Lựa chọn: 有効 / 仮登録 / 解約手続き中 / 利用休止 / 停止 / 終了."], req="－", len=U("選択（有効／仮登録／解約手続き中／利用休止／停止／終了）", "Chọn (hiệu lực / tạm / đang hủy / tạm ngưng / dừng / kết thúc)"), init=U("契約ステータス（すべて）", "Trạng thái hợp đồng (tất cả)"), ex=["解約手続き中", "Chọn 1 trạng thái"])
sub("l_bill", "請求先", "Nơi nhận hóa đơn", ".es-search select[aria-label='請求先']", "select", ["選択肢：法人／この拠点。", "Lựa chọn: 法人 / この拠点."], req="－", len=U("選択（法人／この拠点）", "Chọn (pháp nhân / cơ sở này)"), init=U("請求先（すべて）", "Nơi nhận hóa đơn (tất cả)"), ex=["この拠点", "Chọn 1"])
sub("l_pref", "都道府県", "Tỉnh / thành phố", ".es-search select[aria-label='都道府県']", "select", ["一覧の拠点の住所の都道府県から作る。", "Lấy từ tỉnh / thành phố trong địa chỉ các cơ sở của danh sách."], req="－", len=U("選択（都道府県）", "Chọn (tỉnh thành)"), init=U("都道府県（すべて）", "Tỉnh thành (tất cả)"), ex=["東京都", "Chọn 1 tỉnh thành"])
sub("l_plan", "現在のプラン", "Gói hiện tại", ".es-search select[aria-label='現在のプラン']", "select", ["一覧にあるプランから選ぶ。", "Chọn từ các gói có trong danh sách."], req="－", len=U("選択（プラン）", "Chọn (gói)"), init=U("現在のプラン（すべて）", "Gói hiện tại (tất cả)"), ex=["ES000003 50プラン", "Chọn 1 gói"])
sub("l_sfrom", "当初契約開始年月（から）", "Tháng bắt đầu hợp đồng ban đầu (từ)", ".es-search input[aria-label='当初契約開始年月（から）']", "month", ["当初契約開始年月がこの月以降。", "Tháng bắt đầu hợp đồng ban đầu từ tháng này."], req="－", len="年月", ex=["2026-03", "Năm-tháng bắt đầu"])
sub("l_sto", "当初契約開始年月（まで）", "Tháng bắt đầu hợp đồng ban đầu (đến)", ".es-search input[aria-label='当初契約開始年月（まで）']", "month", ["当初契約開始年月がこの月以前。", "Tháng bắt đầu hợp đồng ban đầu đến tháng này."], req="－", len="年月", ex=["2026-08", "Năm-tháng kết thúc"], err=["E08"])
sub("l_from", "登録日（から）", "Ngày đăng ký (từ)", ".es-search input[aria-label='登録日（から）']", "date", ["登録日時の日付がこの日以降。", "Ngày của 登録日時 từ ngày này."], req="－", len="日付", ex=["2026-07-01", "Ngày bắt đầu"])
sub("l_to", "登録日（まで）", "Ngày đăng ký (đến)", ".es-search input[aria-label='登録日（まで）']", "date", ["登録日時の日付がこの日以前。", "Ngày của 登録日時 đến ngày này."], req="－", len="日付", ex=["2026-09-30", "Ngày kết thúc"], err=["E08"])
sub("l_clear", "クリア", "Xóa điều kiện", ".es-search button::クリア", "button", ["条件を初期値に戻し、一覧も初期の表示に戻す。", "Đưa điều kiện về ban đầu và hiển thị lại danh sách ban đầu."])
sub("l_go", "検索", "Tìm kiếm", ".es-search button[type=submit]", "button", ["条件を一覧に反映し、1ページ目に戻る。", "Áp dụng điều kiện vào danh sách và về trang 1."])
sub("l_sort", "並べ替え", "Sắp xếp", ".es-search select[aria-label='並べ替え']", "select", ["並べ替える列（一覧の全列）と、昇順／降順の2つの選択。列の見出しを押しても切り替わる（昇順 ⇄ 降順。▲▼で向きを出す）。初期の並びは更新日時の降順（台帳 一覧の初期の並び）。並べ替えは「検索」を押さなくても効き、1ページ目に戻る。", "Hai ô chọn: cột sắp xếp (mọi cột của danh sách) và tăng / giảm. Nhấn tiêu đề cột cũng đổi được (tăng ⇄ giảm, hiện ▲▼). Thứ tự ban đầu: 更新日時 giảm dần (台帳 一覧の初期の並び). Sắp xếp có hiệu lực ngay không cần nhấn \"検索\" và quay về trang 1."], req="－", len=["選択（列）＋昇順／降順", "Chọn (cột) + tăng / giảm"], init=["更新日時の降順", "更新日時 giảm dần"], ex=["拠点名・昇順", "Chọn cột rồi đổi tăng / giảm"])
big("l_table", "拠点の一覧", "Bảng cơ sở", ".es-table", "table", ["1ページ 10件（10／20／50）。拠点は削除しないので「削除」の列は置かない。0件のときは I01 を表の中に出す。", "10 dòng/trang (10/20/50). Cơ sở không xóa nên không có cột \"削除\". Khi 0 dòng hiện I01 trong bảng."], pattern="P-LIST", err=["I01"],
    demo_ok=["コードの 0件の文言は「条件に一致するデータがありません。条件を変えるか「クリア」を押してください。」（I01 に揃える・H1）", "Câu 0 dòng trong code là \"条件に一致するデータがありません。条件を変えるか「クリア」を押してください。\" (đồng nhất với I01; H1)"])
sub("l_id", "拠点ID", "Mã cơ sở", ".es-table th::拠点ID", "link", ["CU＋5桁の連番（システムが採番）。押すと拠点詳細（AW_BRAN_002）へ。", "CU + 5 số thứ tự (hệ thống cấp). Bấm để mở 拠点詳細 (AW_BRAN_002)."])
sub("l_name", "拠点名", "Tên cơ sở", ".es-table th::拠点名", "label", ["拠点の名称。", "Tên cơ sở."])
sub("l_corp_c", "所属法人（列）", "Pháp nhân trực thuộc (cột)", ".es-table th::所属法人", "label", ["法人名。法人なしの拠点は「（法人なし）」。", "Tên pháp nhân. Cơ sở không thuộc pháp nhân hiện \"（法人なし）\"."])
sub("l_st_c", "拠点ステータス（列）", "Trạng thái cơ sở (cột)", ".es-table th::拠点ステータス", "label", ["バッジ：本登録（緑）・仮登録（青）・休止中／閉鎖予定（黄）・閉鎖（灰）。休止中は親契約の「利用休止」の期間のあいだ表示だけ。", "Badge: 本登録 (xanh lá), 仮登録 (xanh dương), 休止中 / 閉鎖予定 (vàng), 閉鎖 (xám). 休止中 chỉ hiển thị trong thời gian \"利用休止\" của hợp đồng cha."])
sub("l_cp", "親契約番号", "Số hợp đồng cha", ".es-table th::親契約番号", "label", ["CP＋7桁（例：CP0000001）。", "CP + 7 số (vd CP0000001)."], open=["親契約・子契約の ID の桁（台帳 B の記載は CP＋6桁、基本設計・コード・契約_00 は CP＋7桁）", "Số chữ số ID hợp đồng cha / con (台帳 B ghi CP + 6 số, 基本設計・code・契約_00 ghi CP + 7 số)"], ask="hong（台帳の書き間違いか）")
sub("l_cst_c", "契約ステータス（列）", "Trạng thái hợp đồng (cột)", ".es-table th::契約ステータス", "label", ["有効（緑）・仮登録（青）・解約手続き中／利用休止／停止（黄）・終了（灰）。", "有効 (xanh lá), 仮登録 (xanh dương), 解約手続き中 / 利用休止 / 停止 (vàng), 終了 (xám)."])
sub("l_kind_c", "契約種別（列）", "Loại hợp đồng (cột)", ".es-table th::契約種別", "label", ["本導入／お試しキャンペーン。", "本導入 / お試しキャンペーン."])
sub("l_plan_c", "現在のプラン（列）", "Gói hiện tại (cột)", ".es-table th::現在のプラン", "label", ["「プランID プラン名」。終了した契約は「—」。", "\"プランID プラン名\". Hợp đồng đã kết thúc hiện \"—\"."])
sub("l_start_c", "当初契約開始年月", "Tháng bắt đầu hợp đồng ban đầu", ".es-table th::当初契約開始年月", "label", ["最初に契約した年月（yyyy-mm）。データ移行では旧ESの契約開始日を取り込む。", "Năm-tháng ký hợp đồng đầu tiên (yyyy-mm). Khi chuyển đổi dữ liệu lấy ngày bắt đầu hợp đồng của ES cũ."])
sub("l_dur", "継続年月", "Thời gian tiếp tục", ".es-table th::継続年月", "label", ["「n年mヶ月」。当初契約開始日から今日まで。", "\"n năm m tháng\". Từ ngày bắt đầu hợp đồng ban đầu đến hôm nay."])
sub("l_bill_c", "請求先（列）", "Nơi nhận hóa đơn (cột)", ".es-table th::請求先", "label", ["法人／この拠点。", "法人 / この拠点."])
sub("l_addr", "住所", "Địa chỉ", ".es-table th::住所", "label", ["都道府県＋市区町村。", "Tỉnh thành + quận/huyện."])
sub("l_reg", "登録日時", "Ngày giờ đăng ký", ".es-table th::登録日時", "label", ["yyyy-mm-dd HH:MM。列の見出しを押すと並べ替え。", "yyyy-mm-dd HH:MM. Nhấn tiêu đề cột để sắp xếp."])
sub("l_act", "操作（編集）", "Thao tác (sửa)", ".es-table th::操作", "button", ["鉛筆を押すと拠点編集（AW_BRAN_003）へ。編集の権限がある役割だけに出す（物流は R/U＝鉛筆あり、営業・経理などは鉛筆なし）。", "Bấm bút để mở 拠点編集 (AW_BRAN_003). Chỉ hiện với vai trò có quyền sửa (物流 là R/U = có bút; 営業・経理... không có bút)."], cond=EDIT)
sub("l_apply", "申請で編集", "Sửa ở đơn", ".es-table button::申請で編集", "button", ["仮登録の拠点の行だけ。押すと契約申請管理の申請詳細へ。仮登録の間はこの画面で編集できない（決定 28-146）。", "Chỉ ở dòng cơ sở 仮登録. Bấm để mở 申請詳細 của 契約申請管理. Khi đăng ký tạm không sửa được ở màn này (quyết định 28-146)."])
sub("l_upd", "更新日時", "Ngày giờ cập nhật", ".es-table th::更新日時", "label", ["yyyy-mm-dd HH:MM。保存・承認・CSV取込などで書き換わった日時（同時更新の版と一緒に進む）。初期の並びはこの列の降順（台帳 一覧の初期の並び）。列の見出しを押すと並べ替え。", "yyyy-mm-dd HH:MM. Ngày giờ dữ liệu bị ghi đổi do lưu / duyệt / nhập CSV (tăng cùng phiên bản đồng thời). Thứ tự ban đầu: cột này giảm dần (台帳 一覧の初期の並び). Nhấn tiêu đề cột để sắp xếp."])
big("l_pager", "ページ送り", "Phân trang", ".es-pagination", "area", ["「n件中 a–b件」・前後のページ・ページ番号・表示件数（10／20／50件／ページ）。見本は15拠点なので2ページ。", "\"n件中 a–b件\", trang trước/sau, số trang, số dòng (10/20/50 件／ページ). Dữ liệu mẫu có 15 cơ sở nên 2 trang."], pattern="P-LIST")

# ================================================================ AW_BRAN_002 詳細
big("d_head", "ヘッダー", "Đầu trang", ".phead", "area", ["パンくず・画面名＋拠点ID・要約（拠点ID・拠点名・所属法人・請求先・拠点ステータス・当月請求額）・ボタン。入力欄はすべて読むだけ。", "Breadcrumb, tên màn hình + 拠点ID, tóm tắt (拠点ID・拠点名・所属法人・請求先・拠点ステータス・当月請求額), nút. Mọi ô chỉ xem."], pattern="P-FORM")
sub("d_crumb", "パンくず", "Breadcrumb", ".phead .crumb", "label", ["「法人・契約管理 / 拠点一覧 / 拠点詳細」。", "「法人・契約管理 / 拠点一覧 / 拠点詳細」."])
sub("d_title", "画面名・拠点ID", "Tên màn hình・拠点ID", ".phead h2", "label", ["「拠点詳細 CU00643」。", "「拠点詳細 CU00643」."])
sub("d_sum", "要約", "Tóm tắt", ".sumbar", "label", ["どのタブでも見える。当月請求額は運営だけに出す（法人Webには出さない）。", "Thấy ở mọi tab. 当月請求額 chỉ hiện cho vận hành (không hiện ở 法人Web)."])
sub("d_edit", "編集", "Sửa", ".pbtn button.save", "button", ["拠点編集（AW_BRAN_003）へ（今のタブを引き継ぐ）。", "Mở 拠点編集 (AW_BRAN_003) (giữ tab hiện tại)."], cond=EDIT)
sub("d_apply", "申請詳細で編集", "Sửa ở 申請詳細", ".pbtn button::申請詳細で編集", "button", ["仮登録のとき「編集」の代わりに出す。", "Khi 仮登録, hiện thay cho \"編集\"."])
big("d_prov", "仮登録中の帯", "Dải đang đăng ký tạm", ".provbar", "area", ["仮登録の拠点だけ。I105（仮登録中です…）と、編集は契約申請管理の申請詳細で行うことを案内する。拠点を確定（本登録）するとこの画面で編集できる。", "Chỉ với cơ sở 仮登録. Hiện I105 (仮登録中です…) và hướng dẫn sửa ở 申請詳細 của 契約申請管理. Sau khi xác nhận cơ sở (đăng ký chính thức) thì sửa được ở màn này."], err=["I105"],
    demo_ok=["コードの帯の文言は I105 と少し違う。I105 に揃える", "Câu trong dải của code hơi khác I105. Đồng nhất với I105"])
big("d_band", "休止期間の行（帯）", "Dòng thời gian tạm ngưng (dải)", ".pane table tr.band", "label", ["休止中のサイクル月には子契約が無いので、一覧のサイクル月の並びの位置に帯の行を1行はさむ。状態（休止予定／休止中／再開済）・休止期間（開始〜終了のサイクル月とサイクル数）・再開予定のサイクル月・休止理由・休止中の設備（引き揚げる／置いたまま）を出す。休止の承認で1行でき、再開の承認で「再開済」になる。休止中は実績精算をしない（休止の始めに棚卸をして精算し、置いたままの設備の差は再開時か解約時の棚卸で拾う）。", "Tháng chu kỳ đang tạm ngưng không có hợp đồng con nên chèn 1 dòng dải vào vị trí trong dãy tháng chu kỳ. Hiện trạng thái (dự kiến tạm ngưng / đang tạm ngưng / đã mở lại), thời gian tạm ngưng (tháng chu kỳ bắt đầu〜kết thúc và số chu kỳ), tháng chu kỳ mở lại dự kiến, lý do, thiết bị khi tạm ngưng (thu hồi / để lại). Duyệt tạm ngưng thì có 1 dòng, duyệt mở lại thì thành \"đã mở lại\". Khi tạm ngưng không quyết toán thực tế (kiểm kê lúc bắt đầu tạm ngưng để quyết toán, chênh lệch thiết bị để lại được tính ở kiểm kê lúc mở lại hoặc hủy)."])
big("d_stick", "タブ・項目の検索", "Tab・tìm mục", ".stick", "area", ["タブ（基本情報／契約／設備・オプション／請求／資料・履歴）。タブは URL（?tab=）に持つ。項目の検索（「/」）・すべて閉じる／開く・入力する項目だけ・カードの目次。", "Tab (基本情報 / 契約 / 設備・オプション / 請求 / 資料・履歴). Tab giữ ở URL (?tab=). Tìm mục (\"/\"), đóng/mở tất cả, chỉ các mục nhập, mục lục thẻ."], pattern="P-TAB")
sub("d_tabs", "タブ", "Tab", ".tabs[role=tablist]", "tab", ["基本情報／契約／設備・オプション／請求／資料・履歴。親契約の一覧 /ops/contracts/parents/CP… を開くと、この画面のタブ「契約」へ移る。", "基本情報 / 契約 / 設備・オプション / 請求 / 資料・履歴. Mở danh sách hợp đồng cha /ops/contracts/parents/CP… sẽ chuyển tới tab \"契約\" của màn này."], pattern="P-TAB")
sub("d_search", "項目を検索", "Tìm mục", ".tools input[type=search]", "text", ["項目名・値・説明に含まれる文字で絞り込む。「/」キーで入力欄へ。", "Lọc theo chữ trong tên mục / giá trị / giải thích. Phím \"/\" để vào ô."], req="－", len="文字列 60", ex=["請求先", "Chữ trong tên hoặc giá trị mục"])
sub("d_fold", "すべて閉じる／すべて開く", "Đóng tất cả / mở tất cả", ".tools button.linkbtn", "button", ["今のタブのカードをまとめて閉じる／開く。", "Đóng / mở cùng lúc các thẻ của tab hiện tại."])
sub("d_editonly", "入力する項目だけ", "Chỉ các mục nhập", ".tools label::入力する項目だけ", "check", ["チェックすると読むだけの項目を隠す。", "Tích thì ẩn các mục chỉ xem."], req="－", init=U("チェックなし", "Không tích"), ex=["チェックする", "Tích để ẩn mục chỉ xem"])
sub("d_idx", "カードの目次", "Mục lục thẻ", ".idx", "label", ["カード名と項目数。押すとそのカードへ移る。", "Tên thẻ và số mục. Bấm để chuyển tới thẻ đó."])
big("d_basic", "カード「基本情報（拠点）」", "Thẻ \"基本情報 (cơ sở)\"", ".ch::基本情報^", "area", ["拠点名・拠点名フリガナ・所属法人・従業員数・当初契約開始年月・拠点ステータス・備考・棚卸・基準数のパターン・拠点ID・旧ES ユーザーID。項目の定義は拠点編集（AW_BRAN_003）と同じ。", "拠点名・拠点名フリガナ・所属法人・従業員数・当初契約開始年月・拠点ステータス・備考・棚卸・基準数のパターン・拠点ID・旧ES ユーザーID. Định nghĩa mục giống 拠点編集 (AW_BRAN_003)."])
sub("d_status", "拠点ステータス", "Trạng thái cơ sở", ".f::拠点ステータス*", "label", ["仮登録／本登録／閉鎖予定／閉鎖（拠点が持つ値）。休止中は親契約の「利用休止」から表示だけ。申請の承認で動く：解約＝承認と同時に「閉鎖予定」、解約日に「閉鎖」。", "仮登録 / 本登録 / 閉鎖予定 / 閉鎖 (giá trị cơ sở giữ). 休止中 chỉ hiển thị từ \"利用休止\" của hợp đồng cha. Đổi theo duyệt đơn: hủy = \"閉鎖予定\" ngay khi duyệt, \"閉鎖\" vào ngày hủy."],
    demo_ok=["コードの選択肢に「休止中」があり、選ぶと E117 相当のエラー（決定は表示だけ）", "Lựa chọn của code có \"休止中\" và chọn thì báo lỗi tương đương E117 (quyết định: chỉ hiển thị)"])
sub("d_legacy", "旧ES ユーザーID", "ID người dùng ES cũ", ".f::旧ES ユーザーID", "label", ["フェーズ1（旧ESステーション）のユーザーID（例：ES000001）。移行時に取り込み、画面では参照のみ。表示のラベルは必ず「旧ES ユーザーID」とし、新しいプランID（ES＋6桁）と区別する。経理の金額照合に使う。", "ID người dùng phiên bản 1 (ES station cũ) (vd ES000001). Nhập khi chuyển đổi, chỉ xem trên màn hình. Nhãn luôn là \"旧ES ユーザーID\" để phân biệt với ID gói mới (ES + 6 số). Dùng đối chiếu số tiền của kế toán."])
big("d_addr", "カード「住所（拠点）」", "Thẻ \"住所 (cơ sở)\"", ".ch::住所^", "area", ["郵便番号・都道府県・市区町村・町名・番地・建物等・電話番号・FAX番号。住所を変えると、以後に生成される配送データへ反映する（生成済み・納品済みの配送データは納品日時点の住所を保つ）。", "Mã bưu chính, tỉnh, quận/huyện, số nhà, tòa nhà, điện thoại, FAX. Đổi địa chỉ sẽ phản ánh vào dữ liệu giao hàng được tạo sau đó (dữ liệu đã tạo / đã giao giữ địa chỉ tại ngày giao)."])
big("d_contact", "カード「担当者（テーブル）」", "Thẻ \"担当者\"", ".ch::担当者（テーブル）^", "area", ["区分・担当者名・フリガナ・メールアドレス・電話番号の表。メイン担当者・請求担当者は各1名必須。メイン担当者・請求担当者の変更は必ず通知する。将来日付での変更予約は実装しない。", "Bảng 区分, tên, furigana, email, điện thoại. Bắt buộc mỗi loại 1 người: chính và thanh toán. Thay đổi người phụ trách chính / thanh toán luôn được thông báo. Không triển khai đặt lịch thay đổi ngày tương lai."])
big("d_acct", "カード「アカウント」", "Thẻ \"アカウント\"", ".ch::アカウント^", "area", ["拠点アカウント（拠点ごとに1つ。その拠点の担当者の皆さまで共有）。ログインID・最終ログイン日時・パスワード再設定。有効・停止は契約の状態から決めず、アカウント自身が持つ（契約_01 §6-3）。", "Tài khoản cơ sở (mỗi cơ sở 1 tài khoản, các người phụ trách của cơ sở dùng chung). ログインID, lần đăng nhập cuối, đặt lại mật khẩu. Hiệu lực / khóa không quyết theo trạng thái hợp đồng mà do chính tài khoản giữ (契約_01 §6-3)."])
sub("d_login", "ログインID", "ID đăng nhập", ".f::ログインID", "label", ["受付・仮登録でアカウントの発行を選ぶと（既定 ON）発行する。最初のサイクルのオーダー開始日より前に有効にする。ログイン案内メールは法人・拠点のメイン・サブ・請求担当者へ送る（同じ人は1通）。", "Cấp khi chọn cấp tài khoản ở tiếp nhận / đăng ký tạm (mặc định ON). Có hiệu lực trước ngày bắt đầu đặt hàng của chu kỳ đầu. Email hướng dẫn đăng nhập gửi cho người phụ trách chính, phụ, thanh toán của pháp nhân / cơ sở (cùng người chỉ 1 thư)."])
sub("d_last", "最終ログイン日時", "Lần đăng nhập cuối", ".f::最終ログイン日時", "label", ["yyyy-mm-dd HH:MM。", "yyyy-mm-dd HH:MM."])
sub("d_pw", "パスワード再設定", "Đặt lại mật khẩu", ".f button::パスワード再設定", "button", ["確認（Q302）→「送る」で、拠点のメイン担当者に認証コード（4桁・有効期限5分）の案内を送る（S306・I11）。変更履歴に残す。拠点アカウントには停止・再開の操作は置かない。", "Xác nhận (Q302) → bấm \"送る\" gửi hướng dẫn kèm mã xác thực (4 số, hiệu lực 5 phút) cho người phụ trách chính của cơ sở (S306・I11). Ghi vào lịch sử. Tài khoản cơ sở không có thao tác khóa / mở lại."], err=["Q302", "S306", "I11", "E30"], cond=EDIT)
big("d_contract", "カード「親契約」", "Thẻ \"親契約\"", ".ch::親契約^", "area", ["契約種別・契約ステータス・開始サイクル月・契約終了日・お試し期間（月数）・お試しの延長・代理店コード（紹介有無）・請求時備考（社内）・親契約番号・契約開始年月。契約の状態はここだけが正（子契約は参照表示）。休止中かどうかもこのステータスと休止履歴だけで表す。法人Web には 代理店コード・請求時備考を出さない。", "契約種別・契約ステータス・開始サイクル月・契約終了日・お試し期間（月数）・お試しの延長・代理店コード（紹介有無）・請求時備考（社内）・親契約番号・契約開始年月. Trạng thái hợp đồng chỉ đúng ở đây (hợp đồng con chỉ hiển thị). Có đang 休止 hay không cũng chỉ thể hiện bằng trạng thái này và lịch sử tạm ngưng. 法人Web không hiện 代理店コード và 請求時備考."])
sub("d_trial", "お試しを延長する", "Gia hạn dùng thử", ".f button::お試しを延長する", "button", ["お試しキャンペーンの拠点だけ延長できる（運営だけ・法人Webからはできない）。押すとダイアログ（延長する月数・メモ・作られる子契約）。本導入の拠点や延長できないときは E115（トースト）。", "Chỉ cơ sở chiến dịch dùng thử mới gia hạn được (chỉ vận hành, không làm được từ 法人Web). Bấm để mở dialog (số tháng gia hạn・ghi chú・hợp đồng con sẽ tạo). Với cơ sở chính thức hoặc không gia hạn được thì E115 (toast)."], err=["E115"],
    cond=["お試しの延長の権限（運営だけ）", "Quyền gia hạn dùng thử (chỉ vận hành)"])
sub("d_cp", "親契約番号", "Số hợp đồng cha", ".f::親契約番号（契約ID）*", "label", ["CP＋連番（例：CP0000001）。契約変更・休止・再開をしても変わらない。", "CP + số thứ tự (vd CP0000001). Không đổi dù đổi hợp đồng / tạm ngưng / mở lại."])
big("d_children", "カード「一覧（子契約）」", "Thẻ \"一覧（子契約）\"", ".ch::一覧（子契約）^", "area", ["契約・サイクル月（新しい月が上）・契約終了予定月・子契約ID・プラン名・契約ステータス（親契約より）・配送区分・納品回数・請求月（前払い）・当月請求額・請求ステータス（前払い／後払い）・生成方法の表。休止中のサイクル月は帯の行を1行はさむ（状態・休止期間・再開予定月・理由）。", "Bảng 契約・サイクル月 (tháng mới ở trên), 契約終了予定月, 子契約ID, プラン名, 契約ステータス（親契約より）, 配送区分, 納品回数, 請求月（前払い）, 当月請求額, 請求ステータス（前払い／後払い）, 生成方法. Tháng chu kỳ đang tạm ngưng chèn 1 dòng dải (trạng thái・thời gian tạm ngưng・tháng mở lại dự kiến・lý do)."])
sub("d_cid", "子契約ID", "ID hợp đồng con", ".pane table td a.lnk", "link", ["CP0000001-202607 の形。押すと子契約詳細（AW_CONT_002）へ。", "Dạng CP0000001-202607. Bấm để mở 子契約詳細 (AW_CONT_002)."])
sub("d_gen", "子契約を先まで作る", "Tạo hợp đồng con trước", ".f button::子契約を先まで作る", "button", ["押すとダイアログ：どの月まで作るか（作成済みの翌月〜今月から12ヶ月先）→ 作られる子契約の一覧 →「N件作成」。最新の子契約と同じ内容で作り、「手動生成」の印をつける。使うのは、数ヶ月先のプラン変更に備えるときとお試しを複数月にするときだけ。詳細（表示だけの画面）では押せず、編集画面で押す。", "Mở dialog: tạo đến tháng nào (từ tháng sau tháng đã tạo đến 12 tháng kể từ tháng này) → danh sách hợp đồng con sẽ tạo → \"N件作成\". Tạo cùng nội dung với hợp đồng con mới nhất và gắn dấu \"手動生成\". Chỉ dùng khi chuẩn bị đổi gói vài tháng sau hoặc gia hạn dùng thử nhiều tháng. Không bấm được ở màn chi tiết (chỉ hiển thị), bấm ở màn sửa."], err=["E114", "S105"],
    open=["子契約を手で先まで作る上限（台帳 E：自動は今のサイクル＋4か月まで〈年払いは12サイクル〉・運営は手でも足せる。コードの手動の上限は今月から12ヶ月先で仕様に数字がない）", "Giới hạn khi tạo hợp đồng con trước bằng tay (台帳 E: tự động đến chu kỳ hiện tại + 4 tháng (trả năm 12 chu kỳ), vận hành thêm bằng tay được; giới hạn thủ công của code là 12 tháng kể từ tháng này, spec không có số)"], ask="お客様・開発")
big("d_loan", "カード「貸出一覧」", "Thẻ \"貸出一覧\"", ".ch::貸出一覧^", "area", ["回収未完了（アラート）・貸出一覧の表・貸出中 合計・未返却 合計。この一覧は見るだけで、貸出・追加・回収の登録は子契約の「設備の異動」で行い、その結果がここに反映される。拠点に紐づくので、お試し→本導入の切替や休止・再開をはさんでも貸出は続く。", "Cảnh báo chưa thu hồi, bảng danh sách cho mượn, tổng đang cho mượn, tổng chưa trả. Danh sách này chỉ xem, đăng ký cho mượn / thêm / thu hồi làm ở \"設備の異動\" của hợp đồng con và kết quả phản ánh ở đây. Gắn với cơ sở nên cho mượn vẫn tiếp tục dù chuyển dùng thử → chính thức hoặc tạm ngưng / mở lại."])
sub("d_loan_alert", "回収未完了（アラート）", "Chưa thu hồi (cảnh báo)", ".f::回収未完了（アラート）*", "label", ["返却予定日 < 今日 かつ 未返却数 > 0 を日次バッチで検出して件数を出す。回収しても料金が動かず誰も困らないため、回収忘れを防ぐ担保はこの検知だけ。「返却予定日を何日過ぎたら未返却とするか」は未決。", "Đếm số mục có ngày trả dự kiến < hôm nay và số chưa trả > 0 do batch hàng ngày phát hiện. Thu hồi hay không thì tiền không đổi nên không ai bị ảnh hưởng, việc ngăn quên thu hồi chỉ dựa vào phát hiện này. \"Quá ngày trả dự kiến bao nhiêu ngày thì coi là chưa trả\" chưa quyết."],
    open=["返却予定日を何日過ぎたら未返却とするか（契約_99 の OPEN）", "Quá ngày trả dự kiến bao nhiêu ngày thì coi là chưa trả (OPEN của 契約_99)"], ask="お客様（青山）")
sub("d_loan_table", "貸出一覧の表", "Bảng danh sách cho mượn", ".pane table::貸出ID", "table", ["貸出ID・設備区分・機種・個体番号・貸出数・返却済数・未返却数・貸出日・返却予定日・返却日・貸出ステータス・回収理由・最低利用期間の満了日・違約金の判定・備考・最終更新。行が多いときは一覧と同じページ送り（10／20／50件）。", "貸出ID・設備区分・機種・個体番号・貸出数・返却済数・未返却数・貸出日・返却予定日・返却日・貸出ステータス・回収理由・最低利用期間の満了日・違約金の判定・備考・最終更新. Nhiều dòng thì phân trang như danh sách (10/20/50)."], pattern="P-LIST")
sub("d_loan_filter", "貸出ステータスの絞り込み", "Lọc theo trạng thái cho mượn", "-", "select", ["表の上のドロップダウン（既定＝回収済を除く）。「○○も表示」のトグルは使わない（台帳 F・H9）。選択肢：回収済を除く／配送中／貸出中／回収依頼中／回収済／すべて。", "Dropdown phía trên bảng (mặc định = trừ đã thu hồi). Không dùng nút bật \"○○も表示\" (台帳 F・H9). Lựa chọn: trừ đã thu hồi / đang giao / đang cho mượn / đang yêu cầu thu hồi / đã thu hồi / tất cả."], req="－", len=U("選択（貸出ステータス）", "Chọn (trạng thái cho mượn)"), init=U("回収済を除く", "Trừ đã thu hồi"), ex=["回収済", "Chọn 1 trạng thái"],
    demo_ok=["コードは表の上の「回収済も表示」のボタン（トグル）。ドロップダウンに直す宿題（H9）", "Code dùng nút \"回収済も表示\" phía trên bảng (bật/tắt). Việc phải sửa: đổi thành dropdown (H9)"])
sub("d_loan_toggle", "回収済も表示（コードのボタン）", "回収済も表示 (nút của code)", ".f button::回収済も表示", "button", ["決定では使わない（上の絞り込みに置き換える）。", "Theo quyết định không dùng (thay bằng bộ lọc ở trên)."], demo_ok=["コードにあるボタン。決定では置かない（H9）", "Nút có trong code. Theo quyết định không đặt (H9)"])
sub("d_loan_sum", "貸出中 合計・未返却 合計", "Tổng đang cho mượn・tổng chưa trả", ".f::貸出中 合計*", "label", ["貸出中 合計＝配送中・貸出中・回収依頼中の未返却数の合計（いま何台預けているか）。未返却 合計＝返却予定日を過ぎても返ってきていない数。合計は表の全件から出す。", "貸出中 合計 = tổng số chưa trả của đang giao / đang cho mượn / đang yêu cầu thu hồi (hiện đang cho mượn bao nhiêu máy). 未返却 合計 = số quá ngày trả dự kiến mà chưa trả. Tổng tính từ toàn bộ bảng."])
big("d_opt", "カード「オプション・割引（今のサイクル月）」", "Thẻ \"オプション・割引 (tháng chu kỳ hiện tại)\"", ".ch::オプション・割引（今のサイクル月）^", "area", ["子契約ID・区分（オプション／値引き）・コード・名称・数量・金額・率・適用開始月・適用終了月の表。オプション・割引は子契約（サイクル月）が持つので、ここは見るだけ。追加・変更・終了は子契約の「設備・オプション」タブで登録する。", "Bảng 子契約ID, 区分 (オプション / 値引き), mã・tên, số lượng, số tiền・tỷ lệ, tháng bắt đầu, tháng kết thúc. Tùy chọn / giảm giá do hợp đồng con (tháng chu kỳ) giữ nên ở đây chỉ xem. Thêm / sửa / kết thúc đăng ký ở tab \"設備・オプション\" của hợp đồng con."])
sub("d_opt_go", "子契約で変更する", "Sửa ở hợp đồng con", ".f button::子契約で変更する", "button", ["今のサイクル月の子契約詳細（AW_CONT_002）のタブ「設備・オプション」を開く。子契約がまだなければ「この拠点の子契約がまだありません」。", "Mở tab \"設備・オプション\" của 子契約詳細 (AW_CONT_002) của tháng chu kỳ hiện tại. Nếu chưa có hợp đồng con thì hiện \"この拠点の子契約がまだありません\"."])
big("d_bill", "カード「請求先と請求条件（拠点）」", "Thẻ \"請求先と請求条件 (cơ sở)\"", ".ch::請求先と請求条件^", "area", ["請求先（法人／この拠点）・請求書発行リードタイムの上書き・支払方法・口座振替の手続きステータス・支払サイクル・起算月・入金期限・Bill One 発行先ID。請求先が「この拠点」のときだけ、下の6項目（支払方法〜Bill One 発行先ID）と上書きが入力できる。請求先＝法人のときは法人の設定に従い、保存もしない。", "請求先 (法人 / この拠点), 請求書発行リードタイムの上書き, 支払方法, 口座振替の手続きステータス, 支払サイクル, 起算月, 入金期限, Bill One 発行先ID. Chỉ khi 請求先 là \"この拠点\" thì 6 mục dưới (支払方法 〜 Bill One 発行先ID) và ghi đè mới nhập được. Khi 請求先 = 法人 thì theo thiết lập của pháp nhân và không lưu."])
big("d_inv", "カード「一覧（この拠点の請求書）」", "Thẻ \"一覧（この拠点の請求書）\"", ".ch::一覧（この拠点の請求書）^", "area", ["請求書番号・発行日・請求月・固定額（前払い）・前払いの対象・実績精算（後払い）・実績精算の対象・消費税・この拠点の請求金額（税込）・入金期限・請求書ステータスの表。法人でまとめて発行している請求書も、この拠点の分だけを出す。PDF の表示・ダウンロードはない（Bill One で発行）。", "Bảng 請求書番号, 発行日, 請求月, 固定額（前払い）, 前払いの対象, 実績精算（後払い）, 実績精算の対象, 消費税, この拠点の請求金額（税込）, 入金期限, 請求書ステータス. Hóa đơn gộp theo pháp nhân cũng chỉ hiện phần của cơ sở này. Không có hiển thị / tải PDF (phát hành ở Bill One)."])
sub("d_inv_open", "請求書詳細を開く", "Mở chi tiết hóa đơn", ".f button::請求書詳細を開く", "button", ["請求書番号を押すと請求の確定・請求書の詳細（運営E の画面）へ。", "Bấm số hóa đơn để mở chi tiết ở 請求の確定・請求書 (màn của 運営E)."])
big("d_docs", "カード「添付資料」", "Thẻ \"添付資料\"", ".ch::添付資料（法人に公開）^", "area", ["法人に公開する資料（搬入経路資料〈顧客向け〉・設置場所写真・申込時の添付資料）と、社内のみ・非公開の資料（搬入経路資料〈委託配送業者向け〉・運営側の追加資料）。表示・ダウンロードだけ（詳細では登録しない）。", "Tài liệu công khai cho pháp nhân (tài liệu lộ trình vận chuyển cho khách・ảnh nơi lắp đặt・tài liệu đính kèm khi đăng ký) và tài liệu nội bộ, không công khai (tài liệu lộ trình cho đơn vị giao hàng ủy thác・tài liệu bổ sung của vận hành). Chỉ xem / tải xuống (không đăng ký ở màn chi tiết)."])
big("d_apphist", "カード「申請履歴（法人Webからの変更申請）」", "Thẻ \"申請履歴\"", ".ch::申請履歴（法人Webからの変更申請）^", "area", ["受付番号（CH-／AP-）・申請の種類（8種類）・申請日・申請者・開始サイクル月・申請内容・承認状態・承認者・承認日時・却下理由・取り下げ日時の表。承認者・承認日時は運営の担当者名が出るので法人Webには出さない。", "Bảng 受付番号 (CH- / AP-), 申請の種類 (8 loại), 申請日, 申請者, 開始サイクル月, 申請内容, 承認状態, 承認者・承認日時, 却下理由, 取り下げ日時. 承認者・承認日時 có tên người vận hành nên không hiện ở 法人Web."])
big("d_hist", "カード「履歴（拠点・親契約）」", "Thẻ \"履歴 (cơ sở・hợp đồng cha)\"", ".ch::履歴（拠点・親契約）^", "area", ["拠点と親契約の変更を見るだけ。列は変更履歴の共通の決まり（日時・操作した人・操作・項目・変更前・変更後・理由）に、契約だけの 適用範囲・承認者・通知の有無 を足す（Q6＝C）。新しい順・直せない・消せない。承認した申請は参照だけで「やり直す」はない。", "Chỉ xem thay đổi của cơ sở và hợp đồng cha. Cột theo quy tắc chung của lịch sử (ngày giờ, người thao tác, thao tác, mục, trước, sau, lý do) cộng thêm 適用範囲・承認者・通知の有無 riêng của hợp đồng (Q6 = C). Mới nhất trước, không sửa / xóa được. Đơn đã duyệt chỉ xem, không có \"やり直す\"."], pattern="P-HIST",
    demo_ok=["コードの列は 変更日時・変更内容・変更者・適用範囲・承認者・通知の有無。項目・変更前・変更後・理由に分ける宿題（Q6＝C）", "Cột của code: 変更日時, 変更内容, 変更者, 適用範囲, 承認者, 通知の有無. Việc phải sửa: tách mục / trước / sau / lý do (Q6 = C)"])
big("d_nf", "見つからないとき", "Khi không tìm thấy", ".empty", "label", ["URL の拠点IDが存在しないとき、I10（対象＝拠点（CU99999））を出す。", "Khi 拠点ID trên URL không tồn tại, hiện I10 (対象 = 拠点（CU99999）)."], err=["I10"],
    demo_ok=["コードの文言は「拠点（CU99999）が見つかりません」（句点なし）。I10 に揃える", "Câu trong code là \"拠点（CU99999）が見つかりません\" (không có dấu chấm). Đồng nhất với I10"])
big("m_trial", "お試しを延長する（ダイアログ）", "Gia hạn dùng thử (dialog)", ".dlg.wide", "modal", ["お試しの最後の子契約と同じ中身で、次のサイクルから子契約を作る。いまのお試し期間・延長する月数（上限なし）・メモ（社内）・作られる子契約の表（子契約ID・サイクル月・種別・ご請求）。ご請求の欄は延長分を「割引しない（プラン料金を請求）」と出す（台帳 B）。法人へ通知・メールで知らせ、法人Web の拠点詳細「お試し期間」に延長が出る。", "Tạo hợp đồng con từ chu kỳ sau với cùng nội dung hợp đồng con cuối của dùng thử. Thời gian dùng thử hiện tại, số tháng gia hạn (không giới hạn), ghi chú (nội bộ), bảng hợp đồng con sẽ tạo (ID, tháng chu kỳ, loại, thanh toán). Phần gia hạn không giảm giá (tính phí gói; 台帳 B). Thông báo / email cho pháp nhân và hiện gia hạn ở \"お試し期間\" của chi tiết cơ sở trên 法人Web."], err=["S106", "E115"],
    )
sub("m_trial_n", "延長する月数", "Số tháng gia hạn", ".dlg.wide input.r", "text", ["延長する月数（整数）。1以上。", "Số tháng gia hạn (số nguyên). Từ 1 trở lên."], req="○", len=U("整数 1〜99（ヶ月）", "Số nguyên 1–99 (tháng)"), init=U("1", "1"), ex=["2", "Số tháng muốn gia hạn"], valid=["必須。半角の整数。", "Bắt buộc. Số nguyên nửa góc."], err=["E01", "E14"])
sub("m_trial_memo", "メモ（社内）", "Ghi chú (nội bộ)", ".dlg.wide input[placeholder]", "text", ["延長の理由など。変更履歴に残す。", "Lý do gia hạn... Ghi vào lịch sử."], req="－", len="文字列 500", ex=["法人のご希望（検討期間の延長）", "Ghi chú nội bộ"], err=["E04", "E13"])
sub("m_trial_ok", "N ヶ月延長する", "Gia hạn N tháng", ".dlg.wide .ft button.ok", "button", ["延長して S106「お試しをnヶ月延長しました…」を出す。月数が空・0のときは押せない。", "Gia hạn và hiện S106 \"お試しをnヶ月延長しました…\". Không bấm được khi số tháng trống hoặc 0."], err=["S106", "E30"])
sub("m_trial_toast", "延長の結果（トースト）", "Kết quả gia hạn (toast)", ".toast", "toast", ["延長したら S106 のトースト（延長した月数・お試し期間・法人へお知らせした旨）を出し、画面を読み直す（子契約の一覧に延長の月が増える）。法人へ通知・メールで知らせる。", "Gia hạn xong hiện toast S106 (số tháng gia hạn, thời gian dùng thử, đã thông báo cho pháp nhân) và tải lại màn hình (danh sách hợp đồng con có thêm tháng gia hạn). Thông báo / email cho pháp nhân."], err=["S106"],
    demo_ok=["コードのトーストは「お試しを{n}ヶ月延長しました（お試し期間 {開始}〜{終了}）。法人へお知らせしました」で、S106 と同じ（文末の「。」だけない）。延長の月の請求は割引しない（H12）はダイアログ・請求とも実装済み", "Toast trong code là \"お試しを{n}ヶ月延長しました（お試し期間 {bắt đầu}〜{kết thúc}）。法人へお知らせしました\", giống S106 (chỉ thiếu dấu 。 cuối câu). Việc không giảm giá tháng gia hạn (H12) đã làm ở dialog và hóa đơn"])
big("m_gen", "子契約を先まで作る（ダイアログ）", "Tạo hợp đồng con trước (dialog)", ".dlg.wide", "modal", ["作成済み（最新の月・件数）・どの月まで作りますか（ドロップダウン）・作られる子契約の表（子契約ID・サイクル月・プラン・配送区分と納品回数・前払いの請求月・生成基準日）。休止期間のサイクル月は作らない。「N件作成」で作る。作れる月がないときは押せない（E114）。", "Đã tạo (tháng mới nhất・số lượng), tạo đến tháng nào (dropdown), bảng hợp đồng con sẽ tạo (ID, tháng chu kỳ, gói, loại giao và số lần, tháng hóa đơn trả trước, ngày chuẩn tạo). Không tạo tháng chu kỳ trong thời gian tạm ngưng. \"N件作成\" để tạo. Không bấm được khi không có tháng nào tạo được (E114)."], err=["S105", "E114"])
sub("m_gen_until", "どの月まで作りますか", "Tạo đến tháng nào", ".dlg.wide select.until", "select", ["作成済みの翌月〜今月から12ヶ月先。既定は次の1サイクル。", "Từ tháng sau tháng đã tạo đến 12 tháng kể từ tháng này. Mặc định là 1 chu kỳ tiếp theo."], req="○", len=U("選択（年月）", "Chọn (năm-tháng)"), init=U("次の1サイクル", "1 chu kỳ tiếp theo"), ex=["2027-01", "Chọn tháng cuối cùng muốn tạo"])
sub("m_gen_ok", "N件作成", "Tạo N", ".dlg.wide .ft button.ok", "button", ["作って S105「n件の子契約を作成しました…」を出す。作った行は一覧に「手動生成」の印で入る。", "Tạo xong hiện S105 \"n件の子契約を作成しました…\". Dòng đã tạo vào danh sách kèm dấu \"手動生成\"."], err=["S105", "E114", "E30"])
big("m_pw", "パスワード再設定の案内（確認）", "Hướng dẫn đặt lại mật khẩu (xác nhận)", "div[role=dialog][aria-modal]", "modal", ["Q302。拠点アカウントのメイン担当者に認証コード（有効期限5分）の案内を送る。「送る」で S306。", "Q302. Gửi hướng dẫn kèm mã xác thực (hiệu lực 5 phút) cho người phụ trách chính của tài khoản cơ sở. Bấm \"送る\" thì hiện S306."], err=["Q302", "S306"])

# ================================================================ AW_BRAN_003 編集
big("e_head", "ヘッダー", "Đầu trang", ".phead", "area", ["パンくず・画面名＋拠点ID・要約・キャンセル／保存。仮登録の拠点は編集画面を開いても詳細（参照）が出る（決定 28-146）。", "Breadcrumb, tên màn hình + 拠点ID, tóm tắt, hủy / lưu. Với cơ sở 仮登録, dù mở màn sửa vẫn hiện chi tiết (chỉ xem; quyết định 28-146)."], pattern="P-FORM")
sub("e_cancel", "キャンセル", "Hủy", ".pbtn button.cancel", "button", ["詳細（または一覧）へ戻る。入力を変えていたら Q02。", "Quay lại chi tiết (hoặc danh sách). Nếu đã đổi nhập thì hiện Q02."], err=["Q02"])
sub("e_save", "保存", "Lưu", ".pbtn button.save", "button", ["全項目をまとめてチェックし、保存できたら S01 のトーストを出して詳細へ。押したら二重に押せなくする。拠点名・住所・請求先などの変更は変更履歴に残る。", "Kiểm tra gộp mọi mục, lưu được thì hiện toast S01 và về chi tiết. Bấm xong khóa nút. Thay đổi 拠点名, địa chỉ, nơi nhận hóa đơn... được ghi vào lịch sử."], err=["S01", "E30", "E31"], pattern="P-FORM",
    demo_ok=["コードの入力チェックの文言は直書きで ID がない（H5）。同時更新の検知（E31）は実装済み。カナ・メール形式・絵文字のチェックはまだない。設計書の「文字列 n」と、コードの上限（DB の varchar に合わせた値）が違う項目がある：法人名・拠点名・フリガナ 120（設計書 60）、市区町村 60（255）、町名・番地・建物 120（255）、配送番号 40（60）、設置フロア 100（60）", "Câu kiểm tra trong code viết thẳng, không có ID (H5). Phát hiện cập nhật đồng thời (E31) đã làm. Chưa có kiểm tra katakana / email / emoji. Có mục giới hạn trong code (theo varchar của DB) khác \"文字列 n\" của 設計書: 法人名・拠点名・フリガナ 120 (設計書 60), 市区町村 60 (255), 町名・番地・建物 120 (255), 配送番号 40 (60), 設置フロア 100 (60)"])
big("e_lock", "編集中の人がいるとき・先に保存されていたとき", "Khi có người đang sửa / đã lưu trước", ".provbar.pendnote", "area", ["ほかの人が開いていれば I02、あとから保存した方は E31（上書きして保存）。", "Nếu người khác đang mở thì I02, người lưu sau nhận E31 (上書きして保存)."], err=["I02", "E31"], pattern="P-FORM",)

def _f(key, ja, vi, lab, mark, kind, ln, init, ex, valid, detail, err=None, **kw):
    return dict(key=key, ja=ja, vi=vi, lab=lab, mark=mark, kind=kind, len=ln, init=init, ex=ex, valid=valid, detail=detail, err=err or [], kw=kw)

OPENING = ["代理店コードの項目の扱い（選択肢の出どころ：代理店マスタ）は運営I の画面で決まる", "Cách xử lý mục 代理店コード (nguồn lựa chọn: master đại lý) được quyết ở màn của 運営I"]
FIELDS = [
    ("基本情報", "基本情報（拠点）", "基本情報 (cơ sở)", [
        _f("f_name", "拠点名", "Tên cơ sở", "拠点名", "*", "text", "文字列 60", None, ["株式会社エービーシー 本社", "Tên cơ sở"], ["必須。最大60文字。絵文字は不可。", "Bắt buộc. Tối đa 60 ký tự. Không dùng emoji."], ["拠点の名称。法人Webからの変更は運営の承認が必要（承認必須）。", "Tên cơ sở. Thay đổi từ 法人Web cần vận hành duyệt (承認必須)."], ["E01", "E04", "E13", "W02"]),
        _f("f_kana", "拠点名フリガナ", "Furigana cơ sở", "拠点名フリガナ", "*", "text", "文字列 60", None, ["カブシキガイシャエービーシー ホンシャ", "Katakana toàn góc"], ["必須。全角カタカナ・長音・スペース。最大60文字。", "Bắt buộc. Katakana toàn góc, âm kéo dài, khoảng trắng. Tối đa 60 ký tự."], ["カタカナ統一。", "Thống nhất Katakana."], ["E01", "E03", "E04"]),
        _f("f_corp", "所属法人", "Pháp nhân trực thuộc", "所属法人", "△", "select", "選択（法人なし＋法人マスタ）", None, ["CU00001 株式会社サンプル", "Chọn 1 pháp nhân hoặc \"（法人なし）\""], ["任意。先頭は「（法人なし）」。", "Tùy chọn. Đầu danh sách là \"（法人なし）\"."], ["法人マスタからドロップダウンで選ぶ（法人ID・法人名で絞り込み検索できる）。先頭に「（法人なし）」があり、法人なしの拠点も登録できる。法人Webからは変えられない。法人なしの拠点は請求先が自動的に「この拠点」で、変えられない。", "Chọn từ master pháp nhân bằng dropdown (tìm lọc theo 法人ID・tên). Đầu danh sách có \"（法人なし）\", đăng ký được cả cơ sở không thuộc pháp nhân. Không đổi được từ 法人Web. Cơ sở không thuộc pháp nhân có nơi nhận hóa đơn tự động là \"この拠点\" và không đổi được."], []),
        _f("f_emp", "従業員数", "Số nhân viên", "従業員数", "△", "text", "整数 0〜999,999（人）", None, ["100", "Số nguyên nửa góc"], ["任意。半角の整数（0〜999,999）。", "Tùy chọn. Số nguyên nửa góc (0–999.999)."], ["拠点の従業員数。", "Số nhân viên của cơ sở."], ["E12", "E14"]),
        _f("f_orig", "当初契約開始年月", "Tháng bắt đầu hợp đồng ban đầu", "当初契約開始年月", "△", "date", "日付（yyyy-mm-dd）", None, ["2026-03-01", "Ngày ký hợp đồng đầu tiên"], ["任意。日付（yyyy-mm-dd）。運営だけが直せる。", "Tùy chọn. Ngày (yyyy-mm-dd). Chỉ vận hành sửa được."], ["最初に契約した日。データ移行では旧ESの契約開始日を取り込む（移行した日ではない）。プラン変更・移行でリセットしない。一覧の「当初契約開始年月」「継続年月」はこの日から計算する（法人Webの拠点一覧・詳細にも出す）。", "Ngày ký hợp đồng đầu tiên. Khi chuyển đổi dữ liệu lấy ngày bắt đầu của ES cũ (không phải ngày chuyển đổi). Không đặt lại khi đổi gói / chuyển đổi. \"当初契約開始年月\" và \"継続年月\" ở danh sách tính từ ngày này (cũng hiện ở danh sách / chi tiết cơ sở của 法人Web)."], ["E02"]),
        _f("f_status", "拠点ステータス", "Trạng thái cơ sở", "拠点ステータス", "*", "select", "選択（仮登録／本登録／閉鎖予定／閉鎖）", ["本登録", "本登録"], ["本登録", "Chọn 1 trong 4 giá trị"], ["必須。選択：仮登録／本登録／閉鎖予定／閉鎖。「休止中」は選べない（親契約の休止から表示だけ）。", "Bắt buộc. Chọn: 仮登録 / 本登録 / 閉鎖予定 / 閉鎖. Không chọn được \"休止中\" (chỉ hiển thị từ tạm ngưng của hợp đồng cha)."],
           ["申請の承認で動く：休止＝休止の開始サイクルから表示が「休止中」・再開＝再開のサイクルから「本登録」・解約＝承認と同時に「閉鎖予定」、解約日に「閉鎖」。休止中を直接選べない（休止は契約申請管理の休止から登録）。", "Đổi theo duyệt đơn: tạm ngưng = hiển thị \"休止中\" từ chu kỳ bắt đầu tạm ngưng・mở lại = \"本登録\" từ chu kỳ mở lại・hủy = \"閉鎖予定\" ngay khi duyệt, \"閉鎖\" vào ngày hủy. Không chọn trực tiếp 休止中 (đăng ký tạm ngưng ở 契約申請管理)."], ["E02", "E117"],
           demo_ok=["コードの選択肢に「休止中」があり、選ぶとエラー（休止は契約申請管理の休止から）。決定は休止中を選択肢に持たない（契約_04 No.6）", "Lựa chọn của code có \"休止中\" và chọn thì báo lỗi. Quyết định: không đặt 休止中 trong lựa chọn (契約_04 No.6)"]),
        _f("f_note", "備考", "Ghi chú", "備考", "△", "textarea", ["文字列 500（複数行）", "Chuỗi 500 (nhiều dòng)"], None, ["8F 社員食堂横に設置", "Ghi chú, yêu cầu của khách"], ["任意。最大500文字。絵文字は不可。", "Tùy chọn. Tối đa 500 ký tự. Không dùng emoji."], ["お客様要望など。複数行の欄は3列分の幅で、セクションの最後に置く。", "Yêu cầu của khách... Ô nhiều dòng rộng 3 cột, đặt cuối khu vực."], ["E04", "E13"]),
        _f("f_stock", "棚卸", "Kiểm kê", "棚卸", "△", "select", "選択（あり／なし）", ["あり", "あり"], ["なし（棚卸なし）", "Chọn あり hoặc なし（棚卸なし）"], ["任意。選択：あり／なし（棚卸なし）。", "Tùy chọn. Chọn: あり / なし（棚卸なし）."], ["棚卸をしない拠点は「なし（棚卸なし）」。管理ロスを出さない・点検の督促（未申告・事務手数料）を出さない。請求の在庫管理・実績精算では差分率の代わりに「棚卸なし」と出る（拠点ごと・2026/10/02 決定）。画面の語は「棚卸」にそろえる（旧「在庫点検」）。", "Cơ sở không kiểm kê chọn \"なし（棚卸なし）\". Không tạo hao hụt quản lý, không nhắc kiểm kê (chưa khai báo・phí thủ tục). Ở quản lý tồn kho / quyết toán thực tế hiện \"棚卸なし\" thay cho tỷ lệ chênh lệch (theo từng cơ sở, quyết định 2026/10/02). Từ trên màn hình thống nhất \"棚卸\" (cũ \"在庫点検\")."], [],
           ),
        _f("f_pref_order", "基準数のパターン", "Mẫu số lượng chuẩn", "基準数のパターン", "△", "select", "選択（通常／短消費期限なし）", ["通常", "通常"], ["短消費期限なし", "Chọn 通常 hoặc 短消費期限なし"], ["任意。選択：通常／短消費期限なし。契約（申込）で決め、変更は運営だけ。", "Tùy chọn. Chọn: 通常 / 短消費期限なし. Quyết ở hợp đồng (đăng ký), chỉ vận hành đổi."], ["短消費期限なしの拠点は、消費期限の短い商品をデフォルト注文に入れず「短消費期限なし基準注文数」を使う。料金は変わらない。法人Web の注文の設定では変えられない。自販機（ESライト（自販機））は自販機の基準数を使うので、この値は使わない（REQ-CT-300）。", "Cơ sở \"短消費期限なし\" không đưa sản phẩm hạn dùng ngắn vào đơn mặc định và dùng \"短消費期限なし基準注文数\". Giá không đổi. Không đổi được ở thiết lập đặt hàng của 法人Web. Máy bán hàng tự động (ESライト（自販機）) dùng số lượng chuẩn của máy nên không dùng giá trị này (REQ-CT-300)."], []),
        _f("f_id", "拠点ID", "Mã cơ sở", "拠点ID", "*", "label", None, None, None, None, ["CU＋連番（例：CU00643）。システムが採番し、直せない。QR運用はこの拠点IDから生成する。", "CU + số thứ tự (vd CU00643). Hệ thống cấp, không sửa được. Vận hành QR sinh từ 拠点ID này."], [], ro=True),
        _f("f_legacy", "旧ES ユーザーID", "ID người dùng ES cũ", "旧ES ユーザーID", "", "label", None, None, None, None, ["フェーズ1のユーザーID（例：ES000001）。移行時に取り込み、画面では参照のみ。", "ID người dùng phiên bản 1 (vd ES000001). Nhập khi chuyển đổi, chỉ xem trên màn hình."], [], ro=True),
    ]),
    ("住所", "住所（拠点）", "Địa chỉ (cơ sở)", [
        _f("f_zip", "郵便番号", "Mã bưu chính", "郵便番号", "*", "text", "文字列 8（数字7桁）", None, ["105-0011", "Số 7 chữ số, gạch nối tùy chọn"], ["必須。数字7桁（ハイフンはあってもなくても可）。保存は 123-4567 の形。", "Bắt buộc. 7 chữ số (có hoặc không gạch nối đều được). Lưu dạng 123-4567."], ["拠点の郵便番号。横の「住所検索」で住所を入れる。", "Mã bưu chính của cơ sở. Dùng \"住所検索\" bên cạnh để điền địa chỉ."], ["E01", "E05"]),
        _f("f_zipbtn", "住所検索", "Tìm địa chỉ", "住所検索", "", "button", None, None, None, None, ["郵便番号（7桁）を入れて押すと、都道府県・市区町村・町名を入れる（番地・建物は自分で入れる）。見つからなければ何も変えない。住所のデータの出どころ・つなぐ時期が未決でもボタンは出す（台帳 F 2026-10-07）。", "Nhập mã bưu chính (7 số) rồi bấm để điền tỉnh, quận/huyện, phường (số nhà, tòa nhà tự nhập). Không tìm thấy thì không đổi gì. Dù nguồn dữ liệu và thời điểm kết nối chưa quyết vẫn hiện nút (台帳 F 2026-10-07)."], ["E05"], pattern="P-ADDRESS", demo_ok=["本番では「まだつないでいません」のトーストが出る（住所のデータの出どころ未決）", "Ở môi trường thật hiện toast \"まだつないでいません\" (chưa quyết nguồn dữ liệu địa chỉ)"]),
        _f("f_pref", "都道府県", "Tỉnh / thành phố", "都道府県", "*", "select", ["選択（47都道府県）", "Chọn (47 tỉnh thành)"], ["東京都", "Tokyo"], ["東京都", "Chọn 1 trong 47 tỉnh thành"], ["必須。47都道府県の選択（自由入力にしない）。", "Bắt buộc. Chọn 1 trong 47 tỉnh thành (không nhập tự do)."], ["住所検索で入った値もこの選択肢に合わせる。", "Giá trị điền bởi 住所検索 cũng khớp với lựa chọn này."], ["E02"]),
        _f("f_city", "市区町村", "Quận / huyện", "市区町村", "*", "text", "文字列 255", None, ["港区", "Thành phố / quận"], ["必須。最大255文字。", "Bắt buộc. Tối đa 255 ký tự."], ["住所（市区町村・町名・番地・建物）は最大255文字。請求書・送り状に印字できない文字は警告（W02）。", "Địa chỉ (quận/huyện, phường, số nhà, tòa nhà) tối đa 255 ký tự. Ký tự không in được trên hóa đơn / phiếu gửi sẽ cảnh báo (W02)."], ["E01", "E04", "E13", "W02"]),
        _f("f_addr1", "町名・番地", "Phường・số nhà", "町名・番地", "*", "text", "文字列 255", None, ["芝公園2-4-1", "Tên phố và số nhà"], ["必須。最大255文字。", "Bắt buộc. Tối đa 255 ký tự."], ["住所を変更すると、以後に生成される配送データへ反映される。生成済み・納品済みの配送データは納品日時点の住所を保持する（契約・子契約は住所を持たない）。", "Đổi địa chỉ sẽ phản ánh vào dữ liệu giao hàng được tạo sau đó. Dữ liệu giao hàng đã tạo / đã giao giữ địa chỉ tại ngày giao (hợp đồng / hợp đồng con không giữ địa chỉ)."], ["E01", "E04", "E13", "W02"]),
        _f("f_addr2", "建物等", "Tòa nhà", "建物等", "△", "text", "文字列 255", None, ["芝パークビル8F", "Tên tòa nhà, tầng"], ["任意。最大255文字。", "Tùy chọn. Tối đa 255 ký tự."], ["同上。", "Như trên."], ["E04", "E13", "W02"]),
        _f("f_tel", "電話番号", "Số điện thoại", "電話番号", "*", "text", "文字列 20（数字・ハイフン）", None, ["03-5401-2200", "Số và gạch nối; bỏ gạch nối còn 10–11 số"], ["必須。数字とハイフンだけ。ハイフンを除いて10〜11桁。", "Bắt buộc. Chỉ số và gạch nối. Bỏ gạch nối còn 10–11 chữ số."], ["拠点の電話番号。", "Số điện thoại của cơ sở."], ["E01", "E06"]),
        _f("f_fax", "FAX番号", "Số FAX", "FAX番号", "△", "text", "文字列 20（数字・ハイフン）", None, ["03-5401-2201", "Số và gạch nối"], ["任意。数字とハイフンだけ。", "Tùy chọn. Chỉ số và gạch nối."], ["拠点のFAX。", "Số FAX của cơ sở."], ["E06"]),
    ]),
    ("アカウント", "アカウント", "Tài khoản", [
        _f("f_loginid", "ログインID", "ID đăng nhập", "ログインID", "*", "label", None, None, None, None, ["拠点アカウントのログインID。読むだけ。", "ログインID của tài khoản cơ sở. Chỉ xem."], [], ro=True),
        _f("f_last", "最終ログイン日時", "Lần đăng nhập cuối", "最終ログイン日時", "", "label", None, None, None, None, ["読むだけ。", "Chỉ xem."], [], ro=True),
    ]),
    ("契約", "親契約", "Hợp đồng cha", [
        _f("f_kind", "契約種別", "Loại hợp đồng", "契約種別", "*", "select", "選択（お試しキャンペーン／本導入）", ["本導入", "本導入"], ["お試しキャンペーン", "Chọn 1 trong 2"], ["必須。選択：お試しキャンペーン／本導入。法人は参照のみ。", "Bắt buộc. Chọn: お試しキャンペーン / 本導入. Pháp nhân chỉ xem."],
           ["お試しキャンペーン：既定1ヶ月。プラン料金はお試しキャンペーン割引（DC000013・50プラン ESライト（冷蔵庫）¥24,500まで・1法人1回）で相殺し、実績精算（管理ロス）は請求する。最低利用期間はなく違約金も発生しない。自動更新せず指定した月数だけ子契約を作る。本導入：自動更新で毎月1サイクル分ずつ子契約を生成する（必要なら手動で数ヶ月先まで作れる）。お試しから本導入へは同じ親契約のまま切り替える。", "お試しキャンペーン: mặc định 1 tháng. Phí gói được bù bằng giảm giá chiến dịch dùng thử (DC000013, đến 24.500 yên cho gói 50 ESライト（冷蔵庫）, 1 lần mỗi pháp nhân), vẫn tính quyết toán thực tế (hao hụt quản lý). Không có thời gian sử dụng tối thiểu và không phạt. Không tự gia hạn, chỉ tạo hợp đồng con đúng số tháng chỉ định. 本導入: tự gia hạn, mỗi tháng tạo 1 chu kỳ hợp đồng con (cần thì tạo trước vài tháng bằng tay). Từ dùng thử sang chính thức giữ nguyên hợp đồng cha."], ["E02"]),
        _f("f_cst", "契約ステータス", "Trạng thái hợp đồng", "契約ステータス", "*", "select", "選択（仮登録／有効／解約手続き中／停止／利用休止／終了）", ["有効", "Hiệu lực"], ["有効", "Chọn 1 trong 6"], ["必須。選択：仮登録／有効／解約手続き中／停止／利用休止／終了。", "Bắt buộc. Chọn: 仮登録 / 有効 / 解約手続き中 / 停止 / 利用休止 / 終了."],
           ["契約の状態はここだけが正（子契約は参照表示）。解約の承認で「解約手続き中」、解約日に「終了」。お試しの満了後に本導入へ切り替えなかった親契約は「終了」。お試しと本導入の間が空くときは「利用休止」。仮登録の間は編集できない。", "Trạng thái hợp đồng chỉ đúng ở đây (hợp đồng con chỉ hiển thị). Duyệt hủy = \"解約手続き中\", ngày hủy = \"終了\". Hợp đồng cha không chuyển sang chính thức sau khi hết dùng thử = \"終了\". Nếu có khoảng trống giữa dùng thử và chính thức = \"利用休止\". Không sửa được khi 仮登録."], ["E02"]),
        _f("f_cyc", "開始サイクル月", "Tháng chu kỳ bắt đầu", "開始サイクル月", "*", "select", "選択（年月）", None, ["2026-03", "Chọn tháng chu kỳ đầu tiên"], ["必須。選べる月はオーダー締切に連動する。", "Bắt buộc. Tháng chọn được liên động với hạn chót đặt hàng."], ["最初のサイクル月（例：2026-10（A1 2026-10-12））。選べる月はオーダー締切に連動（締切前の申込は翌月以降・締切後は翌々月以降）。子契約・請求・配送はこのサイクル月から始まる。機種変更・追加があっても変えない。", "Tháng chu kỳ đầu tiên (vd 2026-10 (A1 2026-10-12)). Tháng chọn được liên động với hạn chót đặt hàng (đơn trước hạn: từ tháng sau; sau hạn: từ tháng sau nữa). Hợp đồng con・hóa đơn・giao hàng bắt đầu từ tháng chu kỳ này. Không đổi dù đổi / thêm thiết bị."], ["E02"]),
        _f("f_end", "契約終了日", "Ngày kết thúc hợp đồng", "契約終了日", "△", "text", "日付または空欄", None, ["2026-12-27", "Ngày cuối giao hàng (đến khi hủy được xác nhận thì để trống)"], ["任意。解約が確定したときに入る。", "Tùy chọn. Được điền khi việc hủy được xác nhận."], ["納品の最後の月を指す。解約・休止を承認すると、適用月以降の未請求（未確定）の先行子契約を取り消す（取消件数を承認画面に出す）。", "Chỉ tháng giao hàng cuối cùng. Khi duyệt hủy / tạm ngưng, hủy các hợp đồng con trước chưa lập hóa đơn (chưa xác định) từ tháng áp dụng (số lượng hủy hiện ở màn duyệt)."], ["E02"]),
        _f("f_trialm", "お試し期間（月数）", "Thời gian dùng thử (số tháng)", "お試し期間（月数）", "△", "select", "選択（月数）", ["1ヶ月", "1 tháng"], ["2ヶ月", "Chọn số tháng"], ["契約種別＝お試しキャンペーンのときだけ入力できる。", "Chỉ nhập được khi 契約種別 = お試しキャンペーン."], ["既定は1ヶ月。顧客は編集できない（運営のみ）。この月数ぶんだけ子契約を作る。延長は「お試しを延長する」から。", "Mặc định 1 tháng. Khách không sửa được (chỉ vận hành). Tạo hợp đồng con đúng số tháng này. Gia hạn dùng \"お試しを延長する\"."], [], ro=True),
        _f("f_agent", "代理店コード（紹介有無）", "Mã đại lý (có giới thiệu)", "代理店コード（紹介有無）", "△", "select", "選択（代理店マスタ）", ["（紹介なし）", "(Không giới thiệu)"], ["AG00001 株式会社フューチャーブリッジ", "Chọn 1 đại lý hoặc \"（紹介なし）\""], ["任意。先頭は「（紹介なし）」。", "Tùy chọn. Đầu danh sách là \"（紹介なし）\"."], ["代理店マスタからドロップダウンで選ぶ。紹介は契約単位で発生するので契約が持つ（法人には持たせない）。法人Webには出さない。", "Chọn từ master đại lý bằng dropdown. Giới thiệu phát sinh theo hợp đồng nên hợp đồng giữ (pháp nhân không giữ). Không hiện ở 法人Web."], []),
        _f("f_billnote", "請求時備考（社内）", "Ghi chú khi thanh toán (nội bộ)", "請求時備考（社内）", "", "textarea", ["文字列 500（複数行）", "Chuỗi 500 (nhiều dòng)"], None, ["口座振替の手続き完了待ち", "Ghi chú nội bộ khi thanh toán"], ["任意。最大500文字。絵文字は不可。", "Tùy chọn. Tối đa 500 ký tự. Không dùng emoji."], ["請求のときに社内で共有する備考。請求画面でも表示・編集できる。法人Webには出さない。請求書にも印字しない。", "Ghi chú chia sẻ nội bộ khi thanh toán. Cũng hiển thị / sửa được ở màn hóa đơn. Không hiện ở 法人Web. Không in lên hóa đơn."], ["E04", "E13"]),
        _f("f_cpno", "親契約番号（契約ID）", "Số hợp đồng cha", "親契約番号（契約ID）", "*", "label", None, None, None, None, ["CP＋連番（例：CP0000001）。直せない。", "CP + số thứ tự (vd CP0000001). Không sửa được."], [], ro=True),
        _f("f_start", "契約開始年月", "Tháng bắt đầu hợp đồng", "契約開始年月", "*", "label", None, None, None, None, ["開始サイクル月だけを見せる（内部はサイクル初日の日付）。移行した契約は移行した時点の日付で入るため、この日付で「リリース前から契約しているか」は判定しない。", "Chỉ hiện tháng chu kỳ bắt đầu (bên trong là ngày đầu chu kỳ). Hợp đồng chuyển đổi nhập ngày tại thời điểm chuyển đổi nên không dùng ngày này để xác định \"đã ký trước khi phát hành\"."], [], ro=True),
    ]),
    ("請求", "請求先と請求条件（拠点）", "Nơi nhận và điều kiện hóa đơn (cơ sở)", [
        _f("f_billto", "請求先", "Nơi nhận hóa đơn", "請求先", "*", "select", "選択（法人／この拠点）", ["法人", "Pháp nhân"], ["この拠点", "Chọn 法人 hoặc この拠点"], ["必須。選択：法人／この拠点。法人なし拠点は自動的に「この拠点」で変更不可。", "Bắt buộc. Chọn: 法人 / この拠点. Cơ sở không thuộc pháp nhân tự động là \"この拠点\" và không đổi được."],
           ["この項目だけが正（法人側には請求先を持たせない）。この値で、下の支払方法・支払サイクル・Bill One 発行先ID・リードタイムの上書きの入力可否が切り替わる。法人の「拠点の請求先を一括変更」からもまとめて変えられる。拠点からの変更申請は運営の承認が必須（hong 2026-10-03）。", "Chỉ mục này là đúng (phía pháp nhân không giữ nơi nhận hóa đơn). Giá trị này quyết định được nhập hay không các mục 支払方法・支払サイクル・Bill One 発行先ID・ghi đè lead time bên dưới. Cũng đổi hàng loạt được từ \"拠点の請求先を一括変更\" của pháp nhân. Đơn đổi từ cơ sở bắt buộc vận hành duyệt (hong 2026-10-03)."], ["E02"]),
        _f("f_lead", "請求書発行リードタイムの上書き", "Ghi đè lead time phát hành hóa đơn", "請求書発行リードタイムの上書き", "△", "select", ["選択（3ヶ月前〜翌月・法人に従う）", "Chọn (3 tháng trước 〜 tháng sau, hoặc theo pháp nhân)"], ["—（法人に従う）", "— (theo pháp nhân)"], ["1ヶ月前（−1）", "Chọn 1 giá trị hoặc \"— (theo pháp nhân)\""], ["請求先＝この拠点 のときだけ入力できる（法人なし拠点は必須）。", "Chỉ nhập được khi 請求先 = この拠点 (bắt buộc với cơ sở không thuộc pháp nhân)."], ["法人と同じ選択肢（3ヶ月前（−3）〜翌月（+1・後払い））。空欄＝法人の設定に従う。拠点ごとに別のリードタイムを許す（2026/09/25 決定）。変えて前払いが重なる／抜ける月ができるときは警告して確認する（W101）。", "Cùng lựa chọn với pháp nhân (3ヶ月前（−3）〜 翌月（+1・後払い）). Trống = theo thiết lập của pháp nhân. Cho phép mỗi cơ sở lead time khác (quyết định 2026/09/25). Nếu đổi làm tháng trả trước bị trùng / thiếu thì cảnh báo và xác nhận (W101)."], ["W101"], demo_ok=["コードは変えて前払いが重なる／抜ける月があっても警告しない（H20）", "Code không cảnh báo khi đổi làm tháng trả trước trùng / thiếu (H20)"]),
        _f("f_pay", "支払方法", "Phương thức thanh toán", "支払方法", "*", "select", ["選択（口座振替／銀行振込／クレジットカード）", "Chọn (chuyển khoản tự động / chuyển khoản / thẻ tín dụng)"], ["—（請求先が法人のため非活性）", "— (khóa vì nơi nhận là pháp nhân)"], ["口座振替", "Chọn 1 trong 3"], ["請求先＝この拠点 のときだけ入力できる（法人のときは保存もしない）。", "Chỉ nhập được khi 請求先 = この拠点 (khi là pháp nhân thì cũng không lưu)."], ["口座振替／銀行振込／クレジットカード。法人は参照のみ。", "口座振替 / 銀行振込 / クレジットカード. Pháp nhân chỉ xem."], ["E02"]),
        _f("f_debit", "口座振替の手続きステータス", "Trạng thái thủ tục chuyển khoản tự động", "口座振替の手続きステータス", "△", "select", ["選択（未手続き／手続き中／完了）", "Chọn (chưa làm / đang làm / hoàn tất)"], ["—（請求先が法人のため非活性）", "— (khóa vì nơi nhận là pháp nhân)"], ["完了", "Chọn 1 trong 3"], ["請求先＝この拠点 かつ 支払方法＝口座振替 のときだけ入力できる。", "Chỉ nhập được khi 請求先 = この拠点 và 支払方法 = 口座振替."], ["運営が支払方法を口座振替に変えたときに使う。完了になるまでは請求書にお振込と印字して振込先を載せる（請求は止めない）。", "Dùng khi vận hành đổi 支払方法 sang 口座振替. Đến khi hoàn tất, hóa đơn in \"お振込\" kèm tài khoản nhận (không dừng thanh toán)."], []),
        _f("f_cycle", "支払サイクル", "Chu kỳ thanh toán", "支払サイクル", "*", "select", ["選択（月払い／年払い）", "Chọn (hằng tháng / hằng năm)"], ["—（請求先が法人のため非活性）", "— (khóa vì nơi nhận là pháp nhân)"], ["月払い", "Chọn 1 trong 2"], ["請求先＝この拠点 のときだけ入力できる。", "Chỉ nhập được khi 請求先 = この拠点."], ["月払い／年払い。請求先＝この拠点の拠点は新規の申込で選ぶ（既定 月払い）。", "月払い / 年払い. Cơ sở có nơi nhận = この拠点 chọn khi đăng ký mới (mặc định 月払い)."], ["E02"]),
        _f("f_anchor", "起算月（年払いのとき）", "Tháng bắt đầu (khi trả theo năm)", "起算月（年払いのとき）", "△", "select", ["選択（年月）", "Chọn (năm-tháng)"], ["—", "—"], ["2026-04", "Chọn 1 tháng"], ["請求先＝この拠点 かつ 支払サイクル＝年払い のときだけ入力できる。", "Chỉ nhập được khi 請求先 = この拠点 và 支払サイクル = 年払い."], ["法人と同じ（12サイクル分をまとめて1通で請求する最初のサイクル月）。", "Giống pháp nhân (tháng chu kỳ đầu tiên của 12 chu kỳ được gộp thành 1 hóa đơn)."], []),
        _f("f_due", "入金期限", "Hạn thanh toán", "入金期限", "*", "select", ["選択（請求月の27日／翌月27日）", "Chọn (27 tháng hóa đơn / 27 tháng sau)"], ["請求月の27日", "Ngày 27 của tháng hóa đơn"], ["請求月の翌月27日", "Chọn 1 trong 2"], ["請求先＝この拠点 のときだけ入力できる。", "Chỉ nhập được khi 請求先 = この拠点."], ["請求月（請求書を送付する月）の27日か、その翌月27日。口座振替・クレジットの引き落とし日もこの日付。", "Ngày 27 của tháng hóa đơn (tháng gửi hóa đơn) hoặc 27 tháng sau. Ngày trừ tiền tự động / thẻ cũng là ngày này."], ["E02"]),
        _f("f_bo", "Bill One 発行先ID", "ID nơi phát hành Bill One", "Bill One 発行先ID", "*", "text", "文字列 40", None, ["BO-778201", "ID nơi phát hành hóa đơn ở Bill One"], ["請求先＝この拠点 のときだけ必須。最大40文字。", "Chỉ bắt buộc khi 請求先 = この拠点. Tối đa 40 ký tự."], ["請求先＝この拠点 のときだけ使う。法人Webには出さない。", "Chỉ dùng khi 請求先 = この拠点. Không hiện ở 法人Web."], ["E01", "E04"]),
    ]),
    ("資料", "添付資料", "Tài liệu đính kèm", [
        _f("f_doc_cust", "搬入経路資料（顧客向け）", "Tài liệu lộ trình vận chuyển (cho khách)", "搬入経路資料（顧客向け）", "△", "file", "ファイル（JPG・PNG・PDF）", None, ["搬入経路図.pdf", "Tệp sơ đồ lộ trình"], ["任意。JPG・PNG・PDF・HEIC。1件5MB、10件まで。", "Tùy chọn. JPG, PNG, PDF, HEIC. 5MB mỗi tệp, tối đa 10 tệp."], ["顧客・法人に公開する搬入経路図・マニュアル。法人Webからも追加できる。", "Sơ đồ lộ trình / hướng dẫn công khai cho khách / pháp nhân. Cũng thêm được từ 法人Web."], ["E11"]),
        _f("f_doc_photo", "設置場所写真", "Ảnh nơi lắp đặt", "設置場所写真", "△", "file", "ファイル（JPG・PNG・PDF）", None, ["設置場所.jpg", "Tệp ảnh"], ["任意。JPG・PNG・PDF・HEIC。1件5MB、10件まで。", "Tùy chọn. JPG, PNG, PDF, HEIC. 5MB mỗi tệp, tối đa 10 tệp."], ["申込時に添付する設置場所の写真。", "Ảnh nơi lắp đặt đính kèm khi đăng ký."], ["E11"]),
        _f("f_doc_app", "申込時の添付資料", "Tài liệu đính kèm khi đăng ký", "申込時の添付資料", "", "label", None, None, None, None, ["ファイル名／形式／容量／登録日。表示・ダウンロードのみ。", "Tên tệp / định dạng / dung lượng / ngày đăng ký. Chỉ xem / tải xuống."], [], ro=True),
        _f("f_doc_carrier", "搬入経路資料（委託配送業者向け・非公開）", "Tài liệu lộ trình (cho đơn vị giao ủy thác, không công khai)", "搬入経路資料（委託配送会社向け・非公開）", "△", "file", "ファイル（JPG・PNG・PDF）", None, ["拠点マニュアル.pdf", "Tệp hướng dẫn cơ sở"], ["任意。JPG・PNG・PDF・HEIC。1件5MB、10件まで。", "Tùy chọn. JPG, PNG, PDF, HEIC. 5MB mỗi tệp, tối đa 10 tệp."], ["委託業者の拠点マニュアル。顧客には公開しない。アップロードの経路・管理を分離する。", "Hướng dẫn cơ sở dành cho đơn vị ủy thác. Không công khai cho khách. Tách riêng đường tải lên và quản lý."], ["E11"],
           demo_ok=["コードのラベルは「搬入経路資料（委託配送会社向け・非公開）」。契約_04 の「委託配送業者向け」に揃える（用語は phiên gộp で確認）", "Nhãn của code là \"搬入経路資料（委託配送会社向け・非公開）\". Đồng nhất với \"委託配送業者向け\" của 契約_04 (thuật ngữ xác nhận ở phiên gộp)"]),
        _f("f_doc_ops", "運営側の追加資料", "Tài liệu bổ sung của vận hành", "運営側の追加資料", "", "file", "ファイル（JPG・PNG・PDF）", None, ["追加資料.pdf", "Tệp bổ sung"], ["任意。JPG・PNG・PDF・HEIC。1件5MB、10件まで。", "Tùy chọn. JPG, PNG, PDF, HEIC. 5MB mỗi tệp, tối đa 10 tệp."], ["運営がファイルを追加・削除する。", "Vận hành thêm / xóa tệp."], ["E11"]),
    ]),
]

for _tab, _card, _cardvi, _fs in FIELDS:
    big("e_" + _tab, "カード「%s」" % _card, "Thẻ \"%s\"" % _cardvi, ".ch::%s^" % {"基本情報": "基本情報", "住所": "住所", "アカウント": "アカウント", "契約": "親契約", "請求": "請求先と請求条件", "資料": "添付資料"}[_tab], "area",
        ["このカードの入力項目。保存はヘッダーの「保存」1つ（カードごとの保存ボタンはない）。", "Các mục nhập của thẻ này. Lưu bằng 1 nút \"保存\" ở đầu màn hình (không có nút lưu riêng từng thẻ)."])
    for _x in _fs:
        _sel = ".f::" + _x["lab"] + _x["mark"] if _x["mark"] else ".f::" + _x["lab"]
        _kw = dict(_x["kw"]); _kw.pop("ro", None)
        _pat = _kw.pop("pattern", None)
        _it = {}
        if _x["kind"] in ("text", "textarea", "select", "date", "file"):
            _it = dict(req="○" if _x["mark"] == "*" else "－", len=_x["len"], ex=_x["ex"], valid=_x["valid"])
            if _x["init"]: _it["init"] = _x["init"]
        if _x["err"]: _it["err"] = _x["err"]
        if _pat: _it["pattern"] = _pat
        _it.update(_kw)
        if _x["key"] == "f_zipbtn": _sel = ".f button::住所検索"
        sub(_x["key"], _x["ja"], _x["vi"], _sel, _x["kind"], _x["detail"], **_it)

big("e_contact", "カード「担当者（テーブル）」", "Thẻ \"担当者\"", ".ch::担当者（テーブル）^", "area", ["担当者の表（行の追加・削除ができる）。メイン担当者1名・請求担当者1名は必須。拠点の担当者は法人の担当者と別にできる。", "Bảng người phụ trách (thêm / xóa dòng được). Bắt buộc 1 người phụ trách chính và 1 người phụ trách thanh toán. Người phụ trách của cơ sở có thể khác của pháp nhân."])
sub("e_c_kind", "区分", "Phân loại", ".pane tbody tr:first-child select", "select", ["メイン担当者／請求担当者／サブ担当者。請求担当者の人が請求書の宛先・通知先になる。", "Người phụ trách chính / thanh toán / phụ. Người phụ trách thanh toán là nơi nhận hóa đơn và thông báo."], req="○", len=U("選択（メイン担当者／請求担当者／サブ担当者）", "Chọn (chính / thanh toán / phụ)"), ex=["メイン担当者", "Chọn 1 loại"], valid=["必須。メイン担当者・請求担当者が各1名いること。", "Bắt buộc. Phải có 1 người phụ trách chính và 1 người phụ trách thanh toán."], err=["E02", "E116"],
    demo_ok=["コードはメイン・請求担当者が0名でも保存できる（H5：E116 のチェックを足す宿題）", "Code vẫn lưu được khi 0 người phụ trách chính / thanh toán (H5: việc phải thêm kiểm tra E116)"])
sub("e_c_name", "担当者名", "Tên người phụ trách", ".pane tbody tr:first-child td:nth-child(2) input", "text", ["担当者の氏名。", "Họ tên người phụ trách."], req="○", len="文字列 60", ex=["佐藤 誠", "Họ tên"], valid=["必須。最大60文字。", "Bắt buộc. Tối đa 60 ký tự."], err=["E01", "E04", "E13"])
sub("e_c_kana", "フリガナ（担当者）", "Furigana (người phụ trách)", ".pane tbody tr:first-child td:nth-child(3) input", "text", ["カタカナ統一・必須。", "Thống nhất Katakana, bắt buộc."], req="○", len="文字列 60", ex=["サトウ マコト", "Katakana toàn góc"], valid=["必須。全角カタカナ。最大60文字。", "Bắt buộc. Katakana toàn góc. Tối đa 60 ký tự."], err=["E01", "E03", "E04"])
sub("e_c_mail", "メールアドレス", "Email", ".pane tbody tr:first-child td:nth-child(4) input", "text", ["ログイン案内・パスワード再設定の案内の宛先になる。", "Là nơi nhận hướng dẫn đăng nhập và đặt lại mật khẩu."], req="○", len="文字列 160", ex=["sato@abc.co.jp", "Địa chỉ email"], valid=["必須。メールの形式。最大160文字。", "Bắt buộc. Đúng định dạng email. Tối đa 60 ký tự."], err=["E01", "E04", "E07"])
sub("e_c_tel", "電話番号（担当者）", "Số điện thoại (người phụ trách)", ".pane tbody tr:first-child td:nth-child(5) input", "text", ["担当者の電話番号。", "Số điện thoại người phụ trách."], req="－", len="文字列 20（数字・ハイフン）", ex=["03-5401-2200", "Số và gạch nối"], valid=["任意。数字とハイフンだけ。ハイフンを除いて10〜11桁。", "Tùy chọn. Chỉ số và gạch nối. Bỏ gạch nối còn 10–11 chữ số."], err=["E06"])
sub("e_c_add", "行を追加", "Thêm dòng", ".pane button::行を追加", "button", ["担当者の行を1行足す。", "Thêm 1 dòng người phụ trách."])
sub("e_c_del", "行の削除", "Xóa dòng", ".pane span.del", "button", ["その行を削除する（保存するまで確定しない）。メイン・請求担当者が0名になる保存は E116。", "Xóa dòng đó (chưa xác định đến khi lưu). Lưu khi còn 0 người phụ trách chính / thanh toán thì E116."], err=["E116"])
big("e_pw", "パスワード再設定", "Đặt lại mật khẩu", ".f button::パスワード再設定", "button", ["編集画面でも押せる（動きと権限は拠点詳細と同じ）。", "Bấm được cả ở màn sửa (cách hoạt động và quyền giống 拠点詳細)."], err=["Q302", "S306"])
big("e_gen", "子契約を先まで作る", "Tạo hợp đồng con trước", ".f button::子契約を先まで作る", "button", ["編集画面で押せる（詳細では押せない）。動きは拠点詳細の説明のとおり。", "Bấm được ở màn sửa (không bấm được ở chi tiết). Cách hoạt động như mô tả ở 拠点詳細."], err=["E114", "S105"])
big("e_trial", "お試しを延長する", "Gia hạn dùng thử", ".f button::お試しを延長する", "button", ["編集画面でも押せる（運営だけ）。動きは拠点詳細の説明のとおり。", "Bấm được cả ở màn sửa (chỉ vận hành). Cách hoạt động như mô tả ở 拠点詳細."], err=["S106", "E115"])
big("e_discard", "編集内容の破棄（確認）", "Hủy nội dung đang sửa (xác nhận)", ".es-modal", "modal", ["Q02。入力を変えたあとに「キャンセル」・ほかの画面への移動・ブラウザを閉じる／再読み込みをしたとき。「破棄」で捨てて移動、「キャンセル」で編集を続ける。", "Q02. Hiện khi đã đổi nhập rồi bấm \"キャンセル\", chuyển màn hình khác, đóng trình duyệt / tải lại. \"破棄\" bỏ và chuyển trang, \"キャンセル\" tiếp tục sửa."], err=["Q02"], pattern="P-FORM")
sub("e_disc_cancel", "キャンセル", "Hủy", ".es-modal__actions button::キャンセル", "button", ["閉じて編集を続ける。", "Đóng, tiếp tục sửa."])
sub("e_disc_ok", "破棄", "Bỏ", ".es-modal__actions button::破棄", "button", ["入力を捨てて移動する。", "Bỏ nội dung đã nhập và chuyển trang."])
big("e_billto_this", "請求先＝この拠点にしたとき", "Khi đặt nơi nhận hóa đơn = この拠点", ".f::請求先*", "area", ["請求先を「この拠点」にすると、リードタイムの上書き・支払方法・口座振替の手続きステータス（支払方法＝口座振替のとき）・支払サイクル・起算月（年払いのとき）・入金期限・Bill One 発行先ID が入力できるようになる（Bill One 発行先IDは必須）。「法人」のときは法人の設定に従い、これらは保存もしない。", "Khi đặt 請求先 = \"この拠点\" thì nhập được ghi đè lead time, 支払方法, trạng thái thủ tục chuyển khoản (khi 支払方法 = 口座振替), 支払サイクル, tháng bắt đầu (khi trả năm), 入金期限, Bill One 発行先ID (Bill One 発行先ID bắt buộc). Khi là \"法人\" thì theo thiết lập của pháp nhân và không lưu các mục này."])
big("e_warn", "請求書発行リードタイムの上書き変更の警告", "Cảnh báo đổi ghi đè lead time", ".es-modal", "modal", ["上書きを変えると前払いの請求が重なる／抜ける月ができるとき、保存の前に W101 を出す（ボタン：戻る／このまま保存）。", "Khi đổi ghi đè làm tháng trả trước bị trùng / thiếu, hiện W101 trước khi lưu (nút: 戻る / このまま保存)."], err=["W101"],
    demo_ok=["コードにこの警告がない（H20）。撮影できない", "Code chưa có cảnh báo này (H20). Không chụp được"])
big("e_saved", "保存完了", "Lưu xong", ".toast", "toast", ["S01「保存しました。」を出して詳細（AW_BRAN_002）へ戻る。", "Hiện S01 \"保存しました。\" rồi quay về chi tiết (AW_BRAN_002)."], err=["S01"],
    demo_ok=["コードのトーストの文言は「保存しました」（句点なし）。S01 に揃える", "Toast của code là \"保存しました\" (không có dấu chấm). Đồng nhất với S01"])

# ================================================================ AW_BRAN_004 CSV取込
big("c_head", "ヘッダー", "Đầu trang", ".es-pagehead", "area", ["パンくず（法人・契約管理 / 拠点一覧 / 拠点一覧 CSV取込）・画面名・キャンセル。フル権限・システム管理だけが開ける。モーダルではなく画面。", "Breadcrumb (法人・契約管理 / 拠点一覧 / 拠点一覧 CSV取込), tên màn hình, hủy. Chỉ フル権限・システム管理 mở được. Là màn hình, không phải modal."], pattern="P-CSV")
sub("c_cancel", "キャンセル", "Hủy", ".es-pagehead__actions button::キャンセル", "button", ["拠点一覧へ戻る（何も登録しない）。", "Về danh sách cơ sở (không đăng ký gì)."])
big("c_step1", "ステップ1 ファイルを選ぶ", "Bước 1: chọn tệp", ".es-card", "area", ["手順の表示・説明・ファイルを選ぶ（ドラッグ＆ドロップも可）。拠点は新規を作れない（新しい拠点は申込から）ので、キーが空欄・存在しない拠点ID の行と、仮登録の拠点の行はエラー。空欄のセルは今の値のまま、消すときは「-」。", "Hiển thị các bước, giải thích, chọn tệp (kéo thả được). Cơ sở không tạo mới được (cơ sở mới đi từ đơn) nên dòng có khóa trống / 拠点ID không tồn tại và dòng của cơ sở 仮登録 là lỗi. Ô trống giữ giá trị cũ, ghi \"-\" để xóa."], pattern="P-CSV")
sub("c_steps", "手順", "Các bước", ".es-card ol.steps", "label", ["「1 ファイルを選ぶ」「2 確認・登録」。", "\"1 ファイルを選ぶ\" \"2 確認・登録\"."])
sub("c_hint", "説明", "Giải thích", ".es-card .hint", "label", ["キーは拠点ID（更新だけ）・列は詳細・編集の項目と同じ・UTF-8・行数の上限。", "Khóa là 拠点ID (chỉ cập nhật), cột giống mục ở chi tiết / sửa, UTF-8, giới hạn số dòng."])
sub("c_pick", "ファイルを選ぶ", "Chọn tệp", ".es-card button::ファイルを選ぶ", "file", ["CSV（UTF-8、BOM あり・なし）を選ぶ。5,000行まで。選ぶとすぐステップ2へ。読み込めないファイルは E51。", "Chọn CSV (UTF-8, có hoặc không BOM). Tối đa 5.000 dòng. Chọn xong chuyển ngay sang bước 2. Tệp không đọc được thì E51."], req="○", len=U("CSV（UTF-8・5,000行まで）", "CSV (UTF-8, tối đa 5.000 dòng)"), ex=["kyoten_20261005.csv", "Tệp CSV do hệ thống xuất ra rồi sửa"], err=["E51"])
big("c_cols", "CSVテンプレートの列（定義。画面には出さない）", "Các cột của CSV template (định nghĩa; không hiện trên màn hình)", "-", "area", ["取り込むファイルの列の定義（1行目の見出し・この順。CSV出力と同じ列）。キー＝拠点ID（更新だけ。新規は契約申請管理の申込から）。UTF-8（BOM 可）・5,000行まで。空欄のセルは今の値のまま、「-」で消す。必須・長さ・チェックは入力画面（AW_BRAN_003）の項目と同じ（違うところだけ書く）。担当者の表と添付資料は CSV に含めない。読むだけの列（所属法人ID・所属法人名・旧ES ユーザーID・貸出の合計など）は値を入れても取り込まない。画面には出さない（hong 2026/10/05）。", "Định nghĩa cột của tệp nhập (dòng 1 = tiêu đề, theo thứ tự này; cùng cột với CSV出力). Khóa = 拠点ID (chỉ cập nhật; mới đi từ đơn ở 契約申請管理). UTF-8 (có BOM được), tối đa 5.000 dòng. Ô trống giữ giá trị cũ, \"-\" để xóa. Bắt buộc / độ dài / kiểm tra giống mục ở màn nhập (AW_BRAN_003) (chỉ ghi chỗ khác). Bảng người phụ trách và tài liệu đính kèm không đưa vào CSV. Cột chỉ đọc (所属法人ID・所属法人名・旧ES ユーザーID・tổng cho mượn...) có điền cũng không nhập. Không hiện trên màn hình (hong 2026/10/05)."], pattern="P-CSV")

def csvcol(key, ja, vi, ref, kind="text", req="－", ln=None, ex=None, extra=None, ro=False, err=None):
    d = ["画面の項目「%s」（No.%s）と同じ。" % (ja, ITEMS[ref]["no"]) if ref else (extra[0] if extra else ""), "Giống mục 「%s」 (No.%s) trên màn hình." % (ja, ITEMS[ref]["no"]) if ref else (extra[1] if extra else "")]
    kw = dict(req=req, len=ln or "文字列 60", init=INIT_BLANK)
    if kind in ("text", "textarea", "select"): kw["ex"] = ex
    if ro: kw["valid"] = ["読むだけの列。値を入れても取り込まない（無視する）。", "Cột chỉ đọc. Có điền giá trị cũng không nhập (bỏ qua)."]
    else: kw["valid"] = ["新規の行で必須の列は更新の行では空欄＝今の値のまま。「-」で消せる（必須の項目は消せない）。", "Cột bắt buộc ở dòng mới thì ở dòng cập nhật để trống = giữ giá trị cũ. Ghi \"-\" để xóa (mục bắt buộc không xóa được)."]
    if err: kw["err"] = err
    return sub(key, ja, vi, "-", kind, d, **kw)

csvcol("k_id", "拠点ID", "Mã cơ sở", None, "text", "○", U("文字列 CU＋連番", "Chuỗi CU + số thứ tự"), ["CU00643", "Mã cơ sở hiện có"], ["キー。更新だけ（新規は申込から）。存在しない拠点ID・空欄の行は「新しい拠点は CSV では登録できません」のエラー。仮登録の拠点の行は「仮登録の間は、契約申請管理の申請詳細（AP-…）で編集してください」のエラー。", "Khóa. Chỉ cập nhật (mới đi từ đơn). Dòng có 拠点ID không tồn tại / trống bị lỗi \"新しい拠点は CSV では登録できません\". Dòng của cơ sở 仮登録 bị lỗi \"仮登録の間は、契約申請管理の申請詳細（AP-…）で編集してください\"."], err=["E01", "E112"])
csvcol("k_corpid", "所属法人ID", "Mã pháp nhân trực thuộc", None, "text", "－", U("文字列 CU＋連番", "Chuỗi CU + số thứ tự"), ["CU00001", "Chỉ đọc"], ["所属法人の法人ID。読むだけ（所属法人を変えるときは「所属法人」の列）。", "法人ID của pháp nhân trực thuộc. Chỉ đọc (muốn đổi pháp nhân dùng cột \"所属法人\")."], ro=True)
csvcol("k_corpname", "所属法人名", "Tên pháp nhân trực thuộc", None, "text", "－", "文字列 60", ["株式会社サンプル", "Chỉ đọc"], ["所属法人の名称。読むだけ。", "Tên pháp nhân trực thuộc. Chỉ đọc."], ro=True)
_CSV_ORDER = [("f_name", "拠点名"), ("f_kana", None), ("f_corp", None), ("f_emp", None), ("f_orig", None), ("f_status", None), ("f_note", None), ("f_stock", None), ("f_pref_order", None), ("f_legacy", None),
              ("f_zip", None), ("f_pref", None), ("f_city", None), ("f_addr1", None), ("f_addr2", None), ("f_tel", None), ("f_fax", None), ("f_loginid", None), ("f_last", None),
              ("f_kind", None), ("f_cst", None), ("f_cyc", None), ("f_end", None), ("f_trialm", None), ("f_agent", None), ("f_billnote", None), ("f_cpno", None), ("f_start", None),
              ("f_billto", None), ("f_lead", None), ("f_pay", None), ("f_debit", None), ("f_cycle", None), ("f_anchor", None), ("f_due", None), ("f_bo", None)]
_FBY = {x["key"]: x for _t, _c, _cv, _fs in FIELDS for x in _fs}
for _k, _ in _CSV_ORDER:
    _x = _FBY[_k]
    _ro = _x["kw"].get("ro", False) or _k in ("f_trialm", "f_lead", "f_pay", "f_debit", "f_cycle", "f_anchor", "f_due", "f_bo")
    _csvkind = "select" if _x["kind"] == "select" else ("textarea" if _x["kind"] == "textarea" else "text")
    _ln = _x["len"] if _x["len"] else "文字列 60"
    _req = "○" if (_x["mark"] == "*" and not _ro) else "－"
    _ex = _x["ex"] or ["—", "Chỉ đọc"]
    _extra = None
    if _k in ("f_lead", "f_pay", "f_debit", "f_cycle", "f_anchor", "f_due", "f_bo"):
        _extra = ["読むだけの列（CSV では請求先＝この拠点の設定は変えない。画面で変える）。請求先の列は取り込む。", "Cột chỉ đọc (CSV không đổi thiết lập khi nơi nhận = この拠点; đổi trên màn hình). Cột 請求先 thì nhập."]
    csvcol("k" + _k[1:], _x["ja"] if _k != "f_stock" else "在庫点検", _x["vi"], _k, _csvkind, _req, _ln, _ex, ro=_ro, err=_x["err"][:3] if not _ro else None)
csvcol("k_alert", "回収未完了（アラート）", "Chưa thu hồi (cảnh báo)", None, "text", "－", "文字列 20", ["0 件", "Chỉ đọc"], ["未返却で返却予定日を過ぎた貸出の数。読むだけ。", "Số mục cho mượn quá ngày trả dự kiến mà chưa trả. Chỉ đọc."], ro=True)
csvcol("k_loan", "貸出中 合計・未返却 合計", "Tổng đang cho mượn・tổng chưa trả", None, "text", "－", "文字列 20", ["4 点", "Chỉ đọc"], ["貸出の合計（2列）。読むだけ。", "Tổng cho mượn (2 cột). Chỉ đọc."], ro=True)
csvcol("k_appdoc", "申込時の添付資料", "Tài liệu đính kèm khi đăng ký", None, "text", "－", "文字列 255", ["申込書.pdf", "Chỉ đọc"], ["申込時に添付されたファイル名。読むだけ。", "Tên tệp đính kèm khi đăng ký. Chỉ đọc."], ro=True)
csvcol("k_reg", "登録日時", "Ngày giờ đăng ký", None, "text", "－", U("日時 yyyy-mm-dd HH:MM", "Ngày giờ yyyy-mm-dd HH:MM"), ["2026-02-20 10:10", "Chỉ đọc"], ["拠点を登録した日時。読むだけ。", "Ngày giờ đăng ký cơ sở. Chỉ đọc."], ro=True)
big("c_step2", "ステップ2 確認・登録", "Bước 2: xác nhận・đăng ký", ".es-card", "area", ["ファイル名・件数（更新／変更なし／エラー）と、行ごとの結果。「登録」でエラー以外の行（更新）を登録する（エラーの行は取り込まない・hong 2026/10/05）。", "Tên tệp, số dòng (cập nhật / không đổi / lỗi) và kết quả từng dòng. \"登録\" thì đăng ký các dòng không lỗi (cập nhật) (dòng lỗi bỏ qua; hong 2026/10/05)."], pattern="P-CSV", err=["Q10", "S10", "S03", "E34"])
sub("c_count", "件数", "Số lượng", ".es-card .badge", "label", ["更新／変更なし／エラー の件数（バッジ）。拠点は新規がない。", "Số dòng cập nhật / không đổi / lỗi (badge). Cơ sở không có dòng mới."])
sub("c_errs", "エラーの行", "Dòng lỗi", ".es-card .notice", "label", ["「エラーの行 n件は取り込みません…」と、行番号・キー・列名・内容の表（多いときは先頭だけ）。内容は E52 と各列のチェックの文言。", "\"エラーの行 n件は取り込みません…\" và bảng số dòng, khóa, tên cột, nội dung (nhiều thì chỉ phần đầu). Nội dung = E52 và câu kiểm tra của từng cột."], err=["E52"], cond=["エラーの行があるとき", "Khi có dòng lỗi"])
sub("c_errcsv", "エラー一覧CSV", "Xuất CSV lỗi", ".es-card button::エラー一覧CSV", "button", ["エラーの行だけを、元の列＋エラーの内容で書き出す。", "Xuất riêng các dòng lỗi với cột gốc + nội dung lỗi."])
sub("c_diff", "登録する内容（前 → 後）", "Nội dung sẽ đăng ký (trước → sau)", ".es-card b::登録する内容", "label", ["行番号・キー・名前・変わる項目（前 → 後）。住所・受取の時間帯などは、これから作る配送に写る（作った配送の届け先はそのまま）。", "Số dòng, khóa, tên, các mục thay đổi (trước → sau). Địa chỉ, khung giờ nhận... sẽ phản ánh vào các lần giao sắp tạo (nơi giao đã tạo giữ nguyên)."], cond=["更新の行があるとき", "Khi có dòng cập nhật"])
sub("c_reselect", "ファイルを選び直す", "Chọn lại tệp", ".es-pagehead__actions button::ファイルを選び直す", "button", ["ステップ1に戻る。何も登録しない。", "Về bước 1. Không đăng ký gì."])
sub("c_go", "登録", "Đăng ký", ".es-pagehead__actions button.pri", "button", ["確認（Q10）のあと、エラー以外の行を登録し、S10 のトースト（更新 n件）を出して一覧へ戻る。取込の記録と、行ごとの変更履歴「CSV取込で更新」を残す。", "Sau xác nhận (Q10), đăng ký các dòng không lỗi, hiện toast S10 (cập nhật n件) rồi về danh sách. Ghi lại lịch sử nhập và lịch sử từng bản ghi \"CSV取込で更新\"."], err=["Q10", "S10", "E34"], cond=["ファイル全体のエラーがなく、更新の行が1つ以上あるとき", "Khi không có lỗi toàn tệp và có ≥ 1 dòng cập nhật"])
big("c_fileerr", "ファイル全体のエラー", "Lỗi toàn tệp", ".es-card .notice", "label", ["CSV として読めない・文字コードが違う・列の見出しが違う・行数の上限を超えるときは、ステップ2に進まず E51 を出す。", "Khi không đọc được như CSV, sai mã hóa, sai tiêu đề cột, hoặc vượt số dòng thì không sang bước 2 mà hiện E51."], err=["E51"])

# ---------------------------------------------------------------- 状態
L_KW = "setv(q('.es-search input[aria-label=\"拠点ID、拠点名、親契約番号\"]'),%s);"
CSV_BAD = ("const text=await csvText('branches',(t,rows)=>{const pi=t.head.findIndex(h=>/^拠点名$/.test(h));const ri=rows.findIndex((r,i)=>i>0&&r[0]==='CU00643');if(pi>=0&&ri>0)rows[ri][pi]=rows[ri][pi]+' 改';const bad=t.rows[0].slice();bad[0]='CU99999';rows.push(bad);});"
           "await upload(text,'拠点取込テスト.csv');")
FILE_ERR = ("const inp=q('input[type=file]');const dt=new DataTransfer();dt.items.add(new File([new Uint8Array([255,254,0,1,2,3,200,201])],'壊れたファイル.csv',{type:'text/csv'}));inp.files=dt.files;inp.dispatchEvent(new Event('change',{bubbles:true}));await sleep(1500);")
LIST_HEADK = ["l_head", "l_crumb", "l_title", "l_csvin", "l_csvout"]
SEARCHK = ["l_search", "l_kw", "l_tel", "l_corp", "l_status", "l_kind", "l_cst", "l_bill", "l_pref", "l_plan", "l_sfrom", "l_sto", "l_from", "l_to", "l_clear", "l_go", "l_sort"]
TABLEK = ["l_table", "l_id", "l_name", "l_corp_c", "l_st_c", "l_cp", "l_cst_c", "l_kind_c", "l_plan_c", "l_start_c", "l_dur", "l_bill_c", "l_addr", "l_reg", "l_act"]
DETAIL_HEAD = ["d_head", "d_crumb", "d_title", "d_sum", "d_edit"]
DETAIL_STICK = ["d_stick", "d_tabs", "d_search", "d_fold", "d_editonly", "d_idx"]
EDIT_HEAD = ["e_head", "e_cancel", "e_save"]
def FK(i): return [x["key"] for x in FIELDS[i][3]]
TAB = lambda name: "tab('%s').click();await sleep(400);" % name
URL = lambda path, name=None: path if not name else path + "?tab=" + __import__("urllib.parse", fromlist=["quote"]).quote(name)

VIEWS = [
    # ---- 一覧
    V("001", "AW_BRAN_001", "初期表示", "Hiển thị ban đầu", "/ops/branches", LIST_HEADK + SEARCHK + TABLEK + ["l_pager"], note=["登録日時の降順。新規登録・削除のボタンはない。鉛筆＝編集。", "登録日時 giảm dần. Không có nút đăng ký mới / xóa. Bút = sửa."]),
    V("002", "AW_BRAN_001", "検索（条件・並べ替え）→ 結果", "Tìm kiếm (điều kiện・sắp xếp) → kết quả", "/ops/branches", ["l_search", "l_kw", "l_status", "l_bill", "l_go", "l_table", "l_id", "l_st_c"],
      setup=L_KW % "'サンプル'" + "setsel(q('.es-search select[aria-label=\"請求先\"]'),'この拠点');await sleep(200);search();await sleep(500);", note=["キーワード「サンプル」・請求先＝この拠点で検索した状態。", "Trạng thái tìm với từ khóa \"サンプル\" và nơi nhận hóa đơn = この拠点."]),
    V("003", "AW_BRAN_001", "0件", "0 dòng", "/ops/branches", ["l_kw", "l_table"], setup=L_KW % "'存在しない拠点'" + "search();await sleep(500);", note=["該当する拠点がないとき I01 を表の中に出す。", "Khi không có cơ sở phù hợp thì hiện I01 trong bảng."]),
    V("004", "AW_BRAN_001", "仮登録の行（申請で編集）", "Dòng đăng ký tạm (sửa ở đơn)", "/ops/branches", ["l_status", "l_st_c", "l_apply", "l_act"], setup="setsel(q('.es-search select[aria-label=\"拠点ステータス\"]'),'仮登録');await sleep(200);search();await sleep(500);", note=["仮登録の拠点（CU01012 あおば仙台工場）は鉛筆の代わりに「申請で編集」。", "Cơ sở đăng ký tạm (CU01012 あおば仙台工場) hiện \"申請で編集\" thay cho bút."]),
    V("005", "AW_BRAN_001", "取消の拠点（絞り込みで表示）", "Cơ sở đã hủy (hiện khi lọc)", "/ops/branches", ["l_status", "l_st_c"], note=["仮登録のあとの却下・取り下げで「取消」になった拠点は、既定では出さず、拠点ステータスで「取消」を選んだときだけ出す（台帳 B）。見本のデータに取消の拠点はなく、コードの選択肢にも「取消」がない（H6）ため撮れない。", "Cơ sở thành \"取消\" sau khi từ chối / rút đơn sau đăng ký tạm mặc định không hiện, chỉ hiện khi chọn \"取消\" ở trạng thái cơ sở (台帳 B). Dữ liệu mẫu không có cơ sở 取消 và lựa chọn của code cũng chưa có \"取消\" (H6) nên không chụp được."]),
    V("006", "AW_BRAN_001", "ページ送り（2ページ目）", "Phân trang (trang 2)", "/ops/branches", ["l_pager", "l_table"], setup="[...document.querySelectorAll('.es-pagination .es-page')].find(b=>b.textContent.trim()==='2').click();await sleep(400);", note=["見本は15拠点。1ページ10件で2ページ目に5件。", "Dữ liệu mẫu có 15 cơ sở. 10 dòng/trang, trang 2 có 5 dòng."]),
    V("007", "AW_BRAN_001", "CSV出力（トースト）", "Xuất CSV (toast)", "/ops/branches", ["l_csvout"], setup="btn('CSV出力').click();await sleep(1500);", note=["検索条件のとおりの全件を出し、終わったら S12 のトースト。", "Xuất toàn bộ theo điều kiện, xong hiện toast S12."]),
    V("008", "AW_BRAN_001", "休止中の拠点", "Cơ sở đang tạm ngưng", "/ops/branches", ["l_st_c", "l_cst_c"], today="2026/10/13", note=["今日を 2026-10-13 にした状態（CU00902 名古屋営業所は 10/12 から休止）。拠点ステータス＝休止中は親契約の「利用休止」から表示だけ。", "Trạng thái đổi hôm nay thành 2026-10-13 (CU00902 名古屋営業所 tạm ngưng từ 10/12). 拠点ステータス = 休止中 chỉ hiển thị từ \"利用休止\" của hợp đồng cha."]),
    V("009", "AW_BRAN_001", "参照のみの権限", "Quyền chỉ xem", "/ops/branches", ["l_head", "l_csvout", "l_table", "l_act"], login="Ad00001", today="", note=["営業（Ad00001・R）でログインした状態。CSV取込と鉛筆（編集）が出ない。物流（R/U）は鉛筆あり。", "Trạng thái đăng nhập bằng 営業 (Ad00001・R). Không hiện CSV取込 và bút. 物流 (R/U) có bút."]),
    # ---- 詳細
    V("010", "AW_BRAN_002", "タブ「基本情報」", "Tab \"基本情報\"", "/ops/branches/CU00643", DETAIL_HEAD + DETAIL_STICK + ["d_basic", "d_status", "d_legacy", "d_addr", "d_contact", "d_acct", "d_login", "d_last", "d_pw"], note=["自販機の拠点（CU00643）。入力欄はすべて読むだけ。DEMO のラベルのタグは設計書に書かない。", "Cơ sở máy bán hàng (CU00643). Mọi ô chỉ xem. Không ghi tag nhãn DEMO vào thiết kế."]),
    V("011", "AW_BRAN_002", "タブ「契約」", "Tab \"契約\"", "/ops/branches/CU00643?tab=%E5%A5%91%E7%B4%84", ["d_tabs", "d_contract", "d_trial", "d_cp", "d_children", "d_cid", "d_gen"], note=["親契約の欄と子契約の一覧。/ops/contracts/parents/CP0000001 を開くとここへ移る。", "Thẻ hợp đồng cha và danh sách hợp đồng con. Mở /ops/contracts/parents/CP0000001 sẽ chuyển tới đây."]),
    V("012", "AW_BRAN_002", "タブ「設備・オプション」", "Tab \"設備・オプション\"", "/ops/branches/CU00643?tab=%E8%A8%AD%E5%82%99%E3%83%BB%E3%82%AA%E3%83%97%E3%82%B7%E3%83%A7%E3%83%B3", ["d_tabs", "d_loan", "d_loan_alert", "d_loan_table", "d_loan_sum", "d_opt", "d_opt_go"], note=["貸出一覧（見るだけ）・オプション・割引（今のサイクル月）。", "Danh sách cho mượn (chỉ xem) và tùy chọn・giảm giá (tháng chu kỳ hiện tại)."]),
    V("013", "AW_BRAN_002", "貸出一覧の絞り込み", "Lọc danh sách cho mượn", "/ops/branches/CU00643?tab=%E8%A8%AD%E5%82%99%E3%83%BB%E3%82%AA%E3%83%97%E3%82%B7%E3%83%A7%E3%83%B3", ["d_loan_filter", "d_loan_toggle", "d_loan_table"], note=["決定は表の上のドロップダウン（既定＝回収済を除く）。コードは「回収済も表示」のボタン（H9）。", "Quyết định: dropdown phía trên bảng (mặc định = trừ đã thu hồi). Code dùng nút \"回収済も表示\" (H9)."]),
    V("014", "AW_BRAN_002", "タブ「請求」", "Tab \"請求\"", "/ops/branches/CU00643?tab=%E8%AB%8B%E6%B1%82", ["d_tabs", "d_bill", "d_inv", "d_inv_open"], note=["請求先と請求条件（読むだけ）・この拠点の請求書の表。", "Nơi nhận và điều kiện hóa đơn (chỉ xem), bảng hóa đơn của cơ sở này."]),
    V("015", "AW_BRAN_002", "タブ「資料・履歴」", "Tab \"資料・履歴\"", "/ops/branches/CU00643?tab=%E8%B3%87%E6%96%99%E3%83%BB%E5%B1%A5%E6%AD%B4", ["d_tabs", "d_docs", "d_apphist", "d_hist"], note=["添付資料（法人に公開／社内のみ）・申請履歴・履歴（拠点・親契約）。", "Tài liệu đính kèm (công khai cho pháp nhân / chỉ nội bộ), lịch sử đơn, lịch sử (cơ sở・hợp đồng cha)."]),
    V("016", "AW_BRAN_002", "仮登録中の帯", "Dải đang đăng ký tạm", "/ops/branches/CU01012", ["d_apply", "d_prov", "d_edit"], note=["仮登録の拠点（CU01012）。「編集」の代わりに「申請詳細で編集」。", "Cơ sở đăng ký tạm (CU01012). \"申請詳細で編集\" thay cho \"編集\"."]),
    V("017", "AW_BRAN_002", "お試しを延長する（ダイアログ）", "Gia hạn dùng thử (dialog)", "/ops/branches/CU00975", ["m_trial", "m_trial_n", "m_trial_memo", "m_trial_ok"], setup=TAB("契約") + "btn('お試しを延長する').click();await sleep(800);", full=False, note=["お試しの拠点（CU00975 みちのく仙台本社）。作られる子契約の表が出る。", "Cơ sở dùng thử (CU00975 みちのく仙台本社). Hiện bảng hợp đồng con sẽ tạo."]),
    V("018", "AW_BRAN_002", "お試しを延長できない（理由の表示）", "Không gia hạn dùng thử được (hiện lý do)", "/ops/branches/CU00643", ["d_trial"], setup=TAB("契約") + "btn('お試しを延長する').click();await sleep(800);", note=["本導入の拠点（CU00643）で押した状態。「お試しキャンペーンの契約だけ延長できます」のトースト（E115）。", "Trạng thái bấm ở cơ sở chính thức (CU00643). Toast \"お試しキャンペーンの契約だけ延長できます\" (E115)."]),
    V("019", "AW_BRAN_002", "子契約を先まで作る（ダイアログ）", "Tạo hợp đồng con trước (dialog)", "/ops/branches/CU00871/edit", ["m_gen", "m_gen_until", "m_gen_ok"], setup=TAB("契約") + "btn('子契約を先まで作る').click();await sleep(800);", full=False, note=["編集画面（CU00871 大阪支店）で押した状態。詳細では押せない。", "Trạng thái bấm ở màn sửa (CU00871 大阪支店). Không bấm được ở chi tiết."]),
    V("020", "AW_BRAN_002", "パスワード再設定の案内（確認）", "Hướng dẫn đặt lại mật khẩu (xác nhận)", "/ops/branches/CU00643", ["m_pw"], setup="btn('パスワード再設定').click();await sleep(500);", full=False, note=["拠点アカウントのメイン担当者へ送る確認。", "Xác nhận gửi cho người phụ trách chính của tài khoản cơ sở."]),
    V("021", "AW_BRAN_002", "見つからない", "Không tìm thấy", "/ops/branches/CU99999", ["d_nf"], note=["存在しない拠点ID。", "拠点ID không tồn tại."]),
    V("022", "AW_BRAN_002", "休止中の拠点（子契約の一覧の帯）", "Cơ sở đang tạm ngưng (dải trong danh sách hợp đồng con)", "/ops/branches/CU00902?tab=%E5%A5%91%E7%B4%84", ["d_contract", "d_band", "d_children"], today="2026/10/13", note=["今日を 2026-10-13 にした状態（CU00902 名古屋営業所は 10/12 から休止）。休止期間の帯の行が出る。", "Trạng thái đổi hôm nay thành 2026-10-13 (CU00902 名古屋営業所 tạm ngưng từ 10/12). Hiện dòng dải thời gian tạm ngưng."]),
    # ---- 編集
    V("023", "AW_BRAN_003", "編集 初期（基本情報）", "Sửa ban đầu (基本情報)", "/ops/branches/CU00643/edit", EDIT_HEAD + ["e_基本情報"] + FK(0), note=["拠点ID・旧ES ユーザーIDは読むだけ。", "拠点ID・旧ES ユーザーID chỉ xem."]),
    V("024", "AW_BRAN_003", "住所・担当者・アカウント", "Địa chỉ・người phụ trách・tài khoản", "/ops/branches/CU00643/edit", ["e_住所"] + FK(1) + ["e_contact", "e_c_kind", "e_c_name", "e_c_kana", "e_c_mail", "e_c_tel", "e_c_add", "e_c_del", "e_アカウント"] + FK(2) + ["e_pw"], note=["基本情報のタブの下のカード。", "Các thẻ phía dưới tab 基本情報."]),
    V("025", "AW_BRAN_003", "タブ「契約」（親契約）", "Tab \"契約\" (hợp đồng cha)", "/ops/branches/CU00643/edit", ["e_契約"] + FK(3) + ["e_gen", "e_trial"], setup=TAB("契約"), note=["親契約のカード。お試し期間は契約種別＝お試しキャンペーンのときだけ入力できる。", "Thẻ hợp đồng cha. Thời gian dùng thử chỉ nhập được khi 契約種別 = お試しキャンペーン."]),
    V("026", "AW_BRAN_003", "タブ「請求」（請求先＝法人）", "Tab \"請求\" (nơi nhận = pháp nhân)", "/ops/branches/CU00871/edit", ["e_請求"] + FK(4), setup=TAB("請求"), note=["請求先＝法人の拠点（CU00871）。支払方法〜Bill One 発行先ID は入力できない。", "Cơ sở có nơi nhận = pháp nhân (CU00871). Không nhập được 支払方法 〜 Bill One 発行先ID."]),
    V("027", "AW_BRAN_003", "請求先＝この拠点にしたとき", "Khi đặt nơi nhận = この拠点", "/ops/branches/CU00871/edit", ["e_billto_this", "f_billto", "f_pay", "f_cycle", "f_due", "f_bo"], setup=TAB("請求") + "setsel(ctl('請求先*'),'この拠点');await sleep(400);", note=["請求先を「この拠点」に変えた状態。支払方法・支払サイクル・入金期限・Bill One 発行先ID が入力できる。", "Trạng thái đổi 請求先 sang \"この拠点\". Nhập được 支払方法・支払サイクル・入金期限・Bill One 発行先ID."]),
    V("028", "AW_BRAN_003", "タブ「資料・履歴」（添付資料）", "Tab \"資料・履歴\" (tài liệu đính kèm)", "/ops/branches/CU00643/edit", ["e_資料"] + FK(5), setup=TAB("資料・履歴"), note=["添付資料のカード。", "Thẻ tài liệu đính kèm."]),
    V("029", "AW_BRAN_003", "入力エラー（拠点名が空）", "Lỗi nhập (拠点名 trống)", "/ops/branches/CU00643/edit", ["e_save", "f_name", "f_zip"], setup="setv(ctl('拠点名*'),'');setv(ctl('郵便番号*'),'abc');await sleep(200);q('.pbtn button.save').click();await sleep(500);", note=["拠点名を空・郵便番号 abc で「保存」を押した状態。エラーの項目は赤枠と項目の下の文言（E01・E05）。", "Trạng thái bấm \"保存\" khi 拠点名 trống, mã bưu chính abc. Mục lỗi viền đỏ và câu dưới mục (E01・E05)."]),
    V("030", "AW_BRAN_003", "棚卸なし・基準数のパターン", "Không kiểm kê・mẫu số lượng chuẩn", "/ops/branches/CU00643/edit", ["f_stock", "f_pref_order"], setup="setsel(ctl('棚卸'),'なし（棚卸なし）');setsel(ctl('基準数のパターン'),'短消費期限なし');await sleep(300);", note=["棚卸なしの拠点は管理ロスを出さない。基準数のパターンは運営だけが変える（自販機の拠点では使わない）。", "Cơ sở không kiểm kê thì không tạo hao hụt quản lý. Mẫu số lượng chuẩn chỉ vận hành đổi (không dùng cho cơ sở máy bán hàng)."]),
    V("031", "AW_BRAN_003", "休止中へ直接変更", "Đổi thẳng sang 休止中", "/ops/branches/CU00643/edit", ["f_status"], setup="setsel(ctl('拠点ステータス*'),'休止中');await sleep(200);q('.pbtn button.save').click();await sleep(600);", note=["拠点ステータスを「休止中」にして保存した状態。休止は契約申請管理の休止から登録する（E117）。決定では選択肢に休止中を持たない。", "Trạng thái đặt 拠点ステータス \"休止中\" rồi lưu. Tạm ngưng đăng ký từ 契約申請管理 (E117). Theo quyết định thì không có 休止中 trong lựa chọn."]),
    V("032", "AW_BRAN_003", "請求書発行リードタイムの上書きを変えたときの警告", "Cảnh báo khi đổi ghi đè lead time", "/ops/branches/CU00871/edit", ["e_warn"], note=["上書きを変えて前払いが重なる／抜けるとき（W101）。コードにこの警告がなく撮れない（H20）。", "Khi đổi ghi đè làm tháng trả trước trùng / thiếu (W101). Code chưa có cảnh báo nên không chụp được (H20)."]),
    V("033", "AW_BRAN_003", "編集内容の破棄（確認）", "Hủy nội dung đang sửa (xác nhận)", "/ops/branches/CU00643/edit", ["e_discard", "e_disc_cancel", "e_disc_ok"], setup="setv(ctl('拠点名*'),'株式会社サンプル 本社（修正）');await sleep(200);q('.pbtn button.cancel').click();await sleep(500);", full=False, note=["拠点名を変えて「キャンセル」を押した状態（Q02）。", "Trạng thái đổi 拠点名 rồi bấm \"キャンセル\" (Q02)."]),
    V("034", "AW_BRAN_003", "他のユーザーが編集中・先に更新された", "Người khác đang sửa / đã cập nhật trước", "/ops/branches/CU00643", ["e_lock"], setup=LK("branch", "CU00643", "拠点名", "拠点名*"), full=False, note=["伊藤 美咲さんが同じ拠点を編集中（I02：画面の上）。自分の編集中に別の人が先に保存したので、「保存」を押すと E31（内容が更新されています・キャンセル／上書きして保存）を出した状態。", "伊藤 美咲 đang sửa cùng cơ sở (I02: đầu màn hình). Trong lúc mình sửa, người khác đã lưu trước nên khi nhấn \"保存\" hiện E31 (nội dung đã được cập nhật・キャンセル / 上書きして保存)."]),
    V("035", "AW_BRAN_003", "保存完了（S01）→ 詳細へ", "Lưu xong (S01) → về chi tiết", "/ops/branches/CU00643/edit", ["e_saved"], setup="setv(ctl('備考△'),'8F 社員食堂横に設置');await sleep(200);q('.pbtn button.save').click();await sleep(600);", wait=200, note=["保存できたら S01 のトーストを出して拠点詳細へ戻る。", "Lưu được thì hiện toast S01 và quay về 拠点詳細."]),
    V("036", "AW_BRAN_002", "お試しを延長した結果（トースト）", "Kết quả gia hạn dùng thử (toast)", "/ops/branches/CU00975", ["m_trial_toast"], setup=TAB("契約") + "btn('お試しを延長する').click();await sleep(800);btn('ヶ月延長する',q('.dlg.wide .ft')).click();await sleep(1000);", note=["「1ヶ月延長する」を押した状態。S106 のトースト（お試し期間・法人へお知らせ）。", "Trạng thái bấm \"1ヶ月延長する\". Toast S106 (thời gian dùng thử, đã thông báo cho pháp nhân)."]),
    # ---- CSV取込
    V("037", "AW_BRAN_004", "ステップ1 ファイルを選ぶ", "Bước 1: chọn tệp", "/ops/branches/import", ["c_head", "c_cancel", "c_step1", "c_steps", "c_hint", "c_pick", "c_cols"] + [k for k in ITEMS if k.startswith("k_")], wait=800, note=["フル権限（CSV取込の権限）だけが開ける。列の定義は画面には出さない（hong 2026/10/05）。", "Chỉ vai trò có quyền CSV取込 mở được. Định nghĩa cột không hiện trên màn hình (hong 2026/10/05)."]),
    V("038", "AW_BRAN_004", "ステップ2 確認・登録", "Bước 2: xác nhận・đăng ký", "/ops/branches/import", ["c_step2", "c_count", "c_errs", "c_errcsv", "c_diff", "c_reselect", "c_go"], setup=CSV_BAD, wait=800, note=["CSV出力のデータの1行目の拠点名を変え（更新の見本）、存在しない拠点ID の行を1つ足したファイルを選んだ状態。", "Trạng thái chọn tệp từ dữ liệu CSV出力 với 拠点名 ở dòng 1 đã đổi (mẫu cập nhật) và thêm 1 dòng có 拠点ID không tồn tại."]),
    V("039", "AW_BRAN_004", "ファイル全体のエラー", "Lỗi toàn tệp", "/ops/branches/import", ["c_fileerr"], setup=FILE_ERR, wait=600, note=["UTF-8 でないファイルを選んだ状態（E51）。", "Trạng thái chọn tệp không phải UTF-8 (E51)."]),
]
