# -*- coding: utf-8 -*-
"""
画面設計書のデータ：運営管理者Web「法人一覧」（AW_CORP）。
元は本物の Web（このリポジトリのコード app/ops/corps/**・lib/ops/contracts/forms.ts の CORP_FORM）。決定は docs/決定台帳.md（B・E・F・K）、項目は docs/01_仕様/20_法人・拠点・契約/契約仕様/契約_02・契約_03 が正。
洗い出し・確認の記録は docs/05_画面設計書/確認メモ_AW_運営A_申請・法人・契約.md（Q1〜Q8＝hong 回答済み・受付簿 No.184、H＝宿題、O＝open）。

画面：AW_CORP_001 法人一覧／002 法人詳細／003 法人編集／004 法人CSV取込（画面コード規約 2026-10-05）
見本のデータ（今日＝2026-10-05）：CU00001 株式会社サンプル（拠点5）／CU00020 株式会社あおば工業（仮登録・申請で編集）／CU00052 株式会社さくら建設（休眠）ほか

コードと決定が違うところ（demo_ok＝決定が正・コードを直す宿題）：
  ・（解消済み 2026-10-08）一覧の並べ替え（全列・昇順／降順）・ページ送り 10／20／50・初期の並び＝更新日時の降順・更新日時の列・「未適用」の印を外した・同時編集（I02・E31）・文字数の上限（E04）
  ・文字数の上限・カナ・メール形式・絵文字の入力チェック（コードは必須・郵便番号・電話の文字だけ）
  ・「取消」の法人は既定で出さず、絞り込みで出す（コードは取消も出す・選択肢にもない）
  ・請求書発行リードタイム変更の警告、メイン・請求担当者の必須チェックがコードにない
撮れない状態（見本のデータで出せない。demo_ok に理由）：取消の法人／リードタイム変更の警告／担当者0名の保存エラー
"""

TITLE = ["法人一覧（AW_CORP）", "Danh sách pháp nhân (AW_CORP)"]
SHEET = ["法人一覧", "Danh sách pháp nhân"]
BASENAME = "画面設計書_AW_CORP_法人一覧"
IMG_PREFIX = "AW_CORP"
OUT_DIR = "運営管理者Web_申請・契約"
CODE_NOTE = ["画面コード規約（docs/01_仕様/画面コード規約_20261005.md）：<Module(2)>_<Feature(4)>_<Seq(3)>。AW＝Admin Web、CORP＝法人", "Quy ước mã màn hình (画面コード規約_20261005): <Module(2)>_<Feature(4)>_<Seq(3)>. AW = Admin Web, CORP = pháp nhân"]
SITE = "ops"
SYSTEM = {"ja": "運営管理者Web", "vi": "Web quản trị vận hành"}
AUTHOR = "Claude（cloud）／確認：hong"
CREATED = "2026-10-07"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "ops", "loginId": "Ad00010"}
CODE_PATHS = ["app/ops/corps", "app/ops/_ui", "lib/ops/contracts", "lib/ops/areas/contracts.ts", "lib/csv", "lib/domain/seed"]

DECISIONS = [
    {"date": "2026-10-07", "target": "AW_CORP 全体（CSV取込）",
     "q": ["法人一覧・拠点一覧・子契約一覧に CSV取込を置くか（契約_02 は「置かない」、CSV入出力_定義は「更新だけ」）", "Có đặt nhập CSV ở danh sách pháp nhân / cơ sở / hợp đồng con không (契約_02 nói không, CSV入出力_定義 nói chỉ cập nhật)"],
     "a": ["3 画面とも置く（A）。法人は法人ID＝キーで更新だけ（新しい法人は契約申請管理の申込から）。取込はフル権限・システム管理だけ", "Đặt cả 3 màn hình (A). Pháp nhân: khóa = 法人ID, chỉ cập nhật (pháp nhân mới đi từ đơn đăng ký ở 契約申請管理). Nhập CSV chỉ フル権限・システム管理"], "src": "hong 回答 2026-10-07（確認メモ_AW_運営A Q5＝A・台帳 F・受付簿 No.184）"},
    {"date": "2026-10-07", "target": "AW_CORP_002 アカウントの操作",
     "q": ["法人詳細の「アカウントの操作」（パスワード再設定の案内・ログイン案内の再送・アカウントの停止／再開）は誰ができるか", "Ai được thao tác tài khoản ở chi tiết pháp nhân (gửi hướng dẫn đặt lại mật khẩu・gửi lại hướng dẫn đăng nhập・khóa/mở lại)"],
     "a": ["再設定の案内・ログイン案内の再送は法人情報の編集権限（CS の R/U も可）、停止・再開はフル権限・システム管理だけ（B）。拠点アカウントのパスワード再設定の案内も同じ扱い", "Hướng dẫn đặt lại mật khẩu / gửi lại hướng dẫn đăng nhập: quyền sửa thông tin pháp nhân (CS R/U cũng được); khóa/mở lại: chỉ フル権限・システム管理 (B). Gửi hướng dẫn đặt lại mật khẩu của tài khoản cơ sở cũng như vậy"], "src": "hong 回答 2026-10-07（確認メモ_AW_運営A Q3＝B・台帳 F・受付簿 No.184）"},
    {"date": "2026-10-07", "target": "AW_CORP_002 No.11 変更履歴の列",
     "q": ["契約系（法人・拠点・子契約）の変更履歴の列", "Các cột lịch sử thay đổi của nhóm hợp đồng (pháp nhân・cơ sở・hợp đồng con)"],
     "a": ["P-HIST の列（日時・操作した人・操作・項目・変更前・変更後・理由）に、契約だけの 適用範囲・承認者・通知の有無 を足す（C）", "Cột của P-HIST (ngày giờ・người thao tác・thao tác・mục・trước・sau・lý do) cộng thêm 適用範囲・承認者・通知の有無 riêng của hợp đồng (C)"], "src": "hong 回答 2026-10-07（確認メモ_AW_運営A Q6＝C・台帳 F・受付簿 No.184）"},
    {"date": "2026-09-29", "target": "AW_CORP_002・003（仮登録の間）",
     "q": ["仮登録の法人は、法人・契約の画面で編集できるか", "Pháp nhân đang đăng ký tạm có sửa được ở màn pháp nhân / hợp đồng không"],
     "a": ["編集できない（参照だけ）。編集は契約申請管理の申請詳細（詳細情報設定）で行い、拠点を確定（本登録）したあとにこの画面で編集する。一覧には「申請で編集」を出す", "Không sửa được (chỉ xem). Sửa ở 申請詳細 của 契約申請管理 (詳細情報設定), sau khi xác nhận cơ sở (đăng ký chính thức) mới sửa ở màn này. Danh sách hiện nút \"申請で編集\""], "src": "決定 28-146（台帳 B）"},
    {"date": "2026-10-05", "target": "AW_CORP_001 一覧の決まり",
     "q": ["一覧の件数・並べ替え・初期の並び・削除の扱い", "Số dòng, sắp xếp, thứ tự ban đầu, xử lý xóa của danh sách"],
     "a": ["1ページ10件（10／20／50）・並べ替えは全列・検索は es-search・初期の並びは登録日時の降順。新規登録・削除は置かない（新しい法人は契約申請管理から）。仮登録のあとの却下・取り下げで「取消」になった法人は既定では出さず、絞り込みで見られる", "10 dòng/trang (10/20/50), sắp xếp mọi cột, tìm kiếm dạng es-search, mặc định 登録日時 giảm dần. Không có đăng ký mới / xóa (pháp nhân mới đi từ 契約申請管理). Pháp nhân thành \"取消\" sau khi từ chối / rút đơn sau đăng ký tạm mặc định không hiện, lọc mới thấy"], "src": "台帳 B・E・K・M-1（確認メモ_AW_運営A §6）"},
    {"date": "2026-10-03", "target": "AW_CORP_003 No.請求の拠点の請求先を一括変更",
     "q": ["法人から配下の拠点の請求先をまとめて変えられるか", "Có đổi nơi nhận hóa đơn của các cơ sở trực thuộc từ pháp nhân không"],
     "a": ["運営だけ。ダイアログで拠点ごとに請求先（法人／この拠点）を選び直して保存。発行済みの請求書はそのままで、まだ発行していない請求書から新しい請求先になる（追補 28-6）。法人なし拠点は出さない", "Chỉ vận hành. Chọn lại nơi nhận hóa đơn (法人 / この拠点) cho từng cơ sở trong dialog rồi lưu. Hóa đơn đã phát hành giữ nguyên, hóa đơn chưa phát hành dùng nơi nhận mới (追補 28-6). Không hiện cơ sở không thuộc pháp nhân"], "src": "追補 28-6（契約_03・台帳 B）"},
]

CHANGES = []

HIDE_ALWAYS = []
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [
    {"code": "AW_CORP_001", "ja": "法人一覧", "vi": "Danh sách pháp nhân"},
    {"code": "AW_CORP_002", "ja": "法人詳細", "vi": "Chi tiết pháp nhân"},
    {"code": "AW_CORP_003", "ja": "法人編集", "vi": "Sửa pháp nhân"},
    {"code": "AW_CORP_004", "ja": "法人CSV取込", "vi": "Nhập CSV pháp nhân"},
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
    "const search=(root)=>{btn('検索',q('.es-search')).click();};"
    "const upload=async(text,name)=>{const inp=document.querySelector('input[type=file]');const dt=new DataTransfer();dt.items.add(new File([text],name||'取込テスト.csv',{type:'text/csv'}));inp.files=dt.files;inp.dispatchEvent(new Event('change',{bubbles:true}));await sleep(2000);};"
    "const csvText=async(entity,fn)=>{const res=await fetch('/api/domain/csv/export',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json','x-es-site':'ops'},body:JSON.stringify({args:{entity:entity,scope:{site:'ops'}}})});"
    "const t=await res.json();const esc=v=>'\"'+String(v==null?'':v).replace(/\"/g,'\"\"')+'\"';const rows=[t.head].concat(t.rows);fn(t,rows);return '\\ufeff'+rows.map(r=>r.map(esc).join(',')).join('\\r\\n');};"
)
TRIG = {"button": "click", "link": "click", "text": "input", "textarea": "input", "select": "select", "month": "input", "date": "input", "check": "check", "radio": "check", "tab": "click", "file": "upload"}
ITEMS = {}
_N = {"n": 0, "m": 0}

# len・init の訳（日本語を含む型・桁数は [日本語, ベトナム語] の組にする）
LENVI = {
    "選択（仮登録／正式登録／休眠／取消）": "Chọn (đăng ký tạm / chính thức / ngủ đông / hủy)",
    "文字列 8（数字7桁）": "Chuỗi 8 (7 chữ số)", "文字列 20（数字・ハイフン）": "Chuỗi 20 (số và gạch nối)", "文字列 CU＋連番": "Chuỗi CU + số thứ tự",
    "選択（法人／この拠点）": "Chọn (pháp nhân / cơ sở này)",
}
INITVI = {
    "東京都": "Tokyo", "まとめて発行（法人1通）": "Gộp 1 hóa đơn cho cả pháp nhân", "口座振替": "Chuyển khoản tự động", "完了": "Hoàn tất",
    "月払い": "Hằng tháng", "請求月の27日": "Ngày 27 của tháng hóa đơn", "法人（すべて）": "Tất cả pháp nhân", "拠点（すべて）": "Tất cả cơ sở",
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

CRUD = ["法人情報管理の CSV取込 の権限（フル権限・システム管理だけ）", "Quyền CSV取込 của 法人情報管理 (chỉ フル権限・システム管理)"]
EDIT = ["法人情報管理の 編集 の権限（フル権限・システム管理・CS）", "Quyền 編集 của 法人情報管理 (フル権限・システム管理・CS)"]
OPEN_REQ = ["必須（○）だが、備考は「空のときは法人名を使う」。どちらが正か", "Bắt buộc (○) nhưng ghi chú nói \"để trống thì dùng 法人名\". Cái nào đúng"]
INIT_BLANK = ["空欄（更新の行は今の値のまま）", "Trống (dòng cập nhật giữ giá trị cũ)"]

# ================================================================ AW_CORP_001 一覧
big("l_head", "ヘッダー", "Đầu trang", ".es-pagehead", "area", ["パンくず（法人・契約管理 / 法人）・画面名・操作ボタン。権限がないボタンは出さない（基本設計 §10-6）。", "Breadcrumb (法人・契約管理 / 法人), tên màn hình, nút thao tác. Nút không có quyền thì không hiện (基本設計 §10-6)."])
sub("l_crumb", "パンくず", "Breadcrumb", ".es-breadcrumb", "label", ["「法人・契約管理 / 法人」。リンクは動かない（表示だけ）。", "「法人・契約管理 / 法人」. Liên kết không hoạt động (chỉ hiển thị)."])
sub("l_title", "画面名", "Tên màn hình", ".es-pagehead__title", "label", ["「法人一覧」", "Tiêu đề 「法人一覧」"])
sub("l_csvin", "CSV取込", "Nhập CSV", ".es-pagehead__actions button::CSV取込", "button", ["法人CSV取込（AW_CORP_004）へ。キーは法人ID（更新だけ。新しい法人は契約申請管理の申込から）。", "Mở màn 法人CSV取込 (AW_CORP_004). Khóa = 法人ID (chỉ cập nhật; pháp nhân mới đi từ đơn ở 契約申請管理)."], cond=CRUD, pattern="P-CSV")
sub("l_csvout", "CSV出力", "Xuất CSV", ".es-pagehead__actions button::CSV出力", "button", ["検索条件のとおりの全件・システムにある項目すべて（画面の項目・配下の拠点・登録日時）。閲覧できる役割すべてに出す。", "Toàn bộ theo điều kiện tìm kiếm, mọi mục có trong hệ thống (mục trên màn hình・cơ sở trực thuộc・登録日時). Hiện với mọi vai trò xem được."], pattern="P-CSV-OUT", err=["S12"],
    demo_ok=["コードの出力は「画面の列＋その文書の全項目」（実際に出力して確認：28列。更新日時の列は出ない）。担当者の表（メイン担当者・請求担当者）は出力に含めない（H18）。台帳 M-1「システムにある項目すべて」に合わせて担当者・更新日時を足す", "Code xuất \"cột màn hình + mọi mục của tài liệu\" (đã xuất thử: 28 cột; không có cột 更新日時). Bảng người phụ trách (メイン担当者・請求担当者) không có trong file xuất (H18). Cần thêm người phụ trách và 更新日時 cho đúng 台帳 M-1 \"mọi mục có trong hệ thống\""])
big("l_search", "検索条件", "Điều kiện tìm kiếm", ".es-search", "area", ["検索条件は「検索」か Enter で反映する。「未適用」の印は出さない。欄が2行以上に折り返すときだけ開閉のボタンを出す。", "Điều kiện chỉ áp dụng khi nhấn \"検索\" hoặc Enter. Không hiện dấu \"未適用\". Chỉ hiện nút đóng/mở khi các ô xuống từ 2 dòng."], pattern="P-LIST",
    )
sub("l_kw", "キーワード", "Từ khóa", ".es-search input[aria-label='法人ID、法人名、フリガナ']", "text", ["法人ID・法人名・フリガナの部分一致。全角・半角、大文字・小文字は区別しない。", "Khớp một phần với 法人ID・法人名・フリガナ. Không phân biệt toàn/nửa góc, hoa/thường."], req="－", len="文字列 60", ex=["サンプル", "Một phần ID, tên hoặc furigana"])
sub("l_tel", "郵便番号・電話番号", "Mã bưu chính・điện thoại", ".es-search input[aria-label='郵便番号、電話番号']", "text", ["郵便番号か電話番号の部分一致（ハイフンあり・なしの両方で探す）。", "Khớp một phần mã bưu chính hoặc số điện thoại (tìm cả khi có và không có dấu gạch nối)."], req="－", len="文字列 20", ex=["105-0011", "Mã bưu chính hoặc điện thoại"])
sub("l_status", "法人ステータス", "Trạng thái pháp nhân", ".es-search select[aria-label='法人ステータス']", "select", ["選択肢：仮登録／正式登録／休眠／取消。「取消」（仮登録のあとの却下・取り下げ）は既定では一覧に出さず、ここで選んだときだけ出す（台帳 B）。", "Lựa chọn: 仮登録 / 正式登録 / 休眠 / 取消. \"取消\" (từ chối / rút đơn sau đăng ký tạm) mặc định không hiện trong danh sách, chỉ hiện khi chọn ở đây (台帳 B)."], req="－", len=["選択（仮登録／正式登録／休眠／取消）", "Chọn (đăng ký tạm / chính thức / ngủ đông / hủy)"], init=["法人ステータス（すべて）", "Trạng thái pháp nhân (tất cả)"], ex=["正式登録", "Chọn 1 trạng thái"],
    demo_ok=["コードの選択肢は 仮登録／正式登録／休眠 の3つ（取消がない・H6）。「休眠」の定義（いつ・だれが・どの条件で）は未決（確認メモ O3）", "Code chỉ có 3 lựa chọn 仮登録 / 正式登録 / 休眠 (thiếu 取消; H6). Định nghĩa \"休眠\" (khi nào, ai, điều kiện) chưa quyết (確認メモ O3)"],
    open=["法人ステータス「休眠」の意味（いつ・だれが・どの条件で休眠になるか）", "Ý nghĩa trạng thái \"休眠\" (khi nào, ai, điều kiện nào thì thành 休眠)"], ask="お客様（契約・運営）")
sub("l_unit", "請求書の発行単位", "Đơn vị phát hành hóa đơn", ".es-search select[aria-label='請求書の発行単位']", "select", ["選択肢：まとめて発行（法人1通）／拠点ごと発行。", "Lựa chọn: まとめて発行（法人1通） / 拠点ごと発行."], req="－", len=["選択（まとめて発行／拠点ごと発行）", "Chọn (gộp / theo từng cơ sở)"], init=["請求書の発行単位（すべて）", "Đơn vị phát hành hóa đơn (tất cả)"], ex=["拠点ごと発行", "Chọn 1 đơn vị"])
sub("l_rep", "ES営業担当", "Nhân viên kinh doanh ES", ".es-search select[aria-label='ES営業担当']", "select", ["一覧の法人に入っている担当者から選ぶ。", "Chọn từ những người phụ trách đang có trong danh sách pháp nhân."], req="－", len=["選択（運営のユーザー）", "Chọn (người dùng vận hành)"], init=["ES営業担当（すべて）", "Nhân viên kinh doanh ES (tất cả)"], ex=["田中 健一", "Chọn 1 người phụ trách"])
sub("l_from", "登録日（から）", "Ngày đăng ký (từ)", ".es-search input[aria-label='登録日（から）']", "date", ["登録日時の日付がこの日以降。", "Ngày của 登録日時 từ ngày này trở đi."], req="－", len="日付", ex=["2026-07-01", "Ngày bắt đầu"])
sub("l_to", "登録日（まで）", "Ngày đăng ký (đến)", ".es-search input[aria-label='登録日（まで）']", "date", ["登録日時の日付がこの日以前。", "Ngày của 登録日時 đến ngày này."], req="－", len="日付", ex=["2026-09-30", "Ngày kết thúc"], err=["E08"])
sub("l_clear", "クリア", "Xóa điều kiện", ".es-search button::クリア", "button", ["条件を初期値に戻し、一覧も初期の表示に戻す。", "Đưa điều kiện về ban đầu và hiển thị lại danh sách ban đầu."])
sub("l_go", "検索", "Tìm kiếm", ".es-search button[type=submit]", "button", ["条件を一覧に反映し、1ページ目に戻る。", "Áp dụng điều kiện vào danh sách và về trang 1."])
sub("l_sort", "並べ替え", "Sắp xếp", ".es-search select[aria-label='並べ替え']", "select", ["並べ替える列（一覧の全列）と、昇順／降順の2つの選択。列の見出しを押しても切り替わる（昇順 ⇄ 降順。▲▼で向きを出す）。初期の並びは更新日時の降順（台帳 一覧の初期の並び）。並べ替えは「検索」を押さなくても効き、1ページ目に戻る。", "Hai ô chọn: cột sắp xếp (mọi cột của danh sách) và tăng / giảm. Nhấn tiêu đề cột cũng đổi được (tăng ⇄ giảm, hiện ▲▼). Thứ tự ban đầu: 更新日時 giảm dần (台帳 一覧の初期の並び). Sắp xếp có hiệu lực ngay không cần nhấn \"検索\" và quay về trang 1."], req="－", len=["選択（列）＋昇順／降順", "Chọn (cột) + tăng / giảm"], init=["更新日時の降順", "更新日時 giảm dần"], ex=["法人名・昇順", "Chọn cột rồi đổi tăng / giảm"])
big("l_table", "法人の一覧", "Bảng pháp nhân", ".es-table", "table", ["1ページ 10件（10／20／50）。法人は削除しないので「削除」の列・「削除済みを表示」は置かない（台帳 K・M-1）。0件のときは I01 を表の中に出す。", "10 dòng/trang (10/20/50). Pháp nhân không xóa nên không có cột \"削除\" hay \"削除済みを表示\" (台帳 K・M-1). Khi 0 dòng hiện I01 trong bảng."], pattern="P-LIST", err=["I01"],
    demo_ok=["コードの 0件の文言は「条件に一致するデータがありません。条件を変えるか「クリア」を押してください。」。I01 に揃える（H1）", "Câu 0 dòng trong code là \"条件に一致するデータがありません。条件を変えるか「クリア」を押してください。\". Đồng nhất với I01 (H1)"])
sub("l_id", "法人ID", "Mã pháp nhân", ".es-table th::法人ID", "link", ["CU＋5桁の連番（システムが採番）。押すと法人詳細（AW_CORP_002）へ。", "CU + 5 số thứ tự (hệ thống cấp). Bấm để mở 法人詳細 (AW_CORP_002)."])
sub("l_name", "法人名", "Tên pháp nhân", ".es-table th::法人名", "label", ["長いときは省略せず折り返す。", "Dài thì xuống dòng, không cắt."])
sub("l_st", "法人ステータス（列）", "Trạng thái pháp nhân (cột)", ".es-table th::法人ステータス", "label", ["バッジ：正式登録（緑）・仮登録（青）・休眠（灰）・取消（灰）。", "Badge: 正式登録 (xanh lá), 仮登録 (xanh dương), 休眠 (xám), 取消 (xám)."])
sub("l_unit_c", "請求書の発行単位（列）", "Đơn vị phát hành hóa đơn (cột)", ".es-table th::請求書の発行単位", "label", ["まとめて発行（法人1通）／拠点ごと発行。", "まとめて発行（法人1通） / 拠点ごと発行."])
sub("l_br", "配下の拠点", "Cơ sở trực thuộc", ".es-table th::配下の拠点", "label", ["「n拠点」。", "\"n拠点\"."])
sub("l_lead", "請求書発行リードタイム（列）", "Lead time phát hành hóa đơn (cột)", ".es-table th::請求書発行リードタイム", "label", ["「n ヶ月前請求」「0ヶ月前請求」「翌月請求」。", "\"n ヶ月前請求\", \"0ヶ月前請求\", \"翌月請求\"."])
sub("l_rep_c", "ES営業担当（列）", "Nhân viên kinh doanh ES (cột)", ".es-table th::ES営業担当", "label", ["運営のユーザー名。", "Tên người dùng vận hành."])
sub("l_reg", "登録日時", "Ngày giờ đăng ký", ".es-table th::登録日時", "label", ["yyyy-mm-dd HH:MM。列の見出しを押すと並べ替え。", "yyyy-mm-dd HH:MM. Nhấn tiêu đề cột để sắp xếp."])
sub("l_act", "操作（編集）", "Thao tác (sửa)", ".es-table th::操作", "button", ["鉛筆の押すと法人編集（AW_CORP_003）へ。編集の権限がある役割だけに出す。仮登録の行は鉛筆の代わりに「申請で編集」を出す（No.下記）。", "Bấm biểu tượng bút để mở 法人編集 (AW_CORP_003). Chỉ hiện với vai trò có quyền sửa. Dòng 仮登録 hiện \"申請で編集\" thay cho bút (xem mục bên dưới)."], cond=EDIT)
sub("l_apply", "申請で編集", "Sửa ở đơn", ".es-table button::申請で編集", "button", ["仮登録の法人の行だけ。押すと契約申請管理の申請詳細（受付の詳細情報設定）へ。仮登録の間はこの画面から編集できない（決定 28-146）。", "Chỉ ở dòng pháp nhân 仮登録. Bấm để mở 申請詳細 của 契約申請管理 (詳細情報設定). Khi đăng ký tạm không sửa được từ màn này (quyết định 28-146)."])
sub("l_upd", "更新日時", "Ngày giờ cập nhật", ".es-table th::更新日時", "label", ["yyyy-mm-dd HH:MM。保存・承認・CSV取込などで書き換わった日時（同時更新の版と一緒に進む）。初期の並びはこの列の降順（台帳 一覧の初期の並び）。列の見出しを押すと並べ替え。", "yyyy-mm-dd HH:MM. Ngày giờ dữ liệu bị ghi đổi do lưu / duyệt / nhập CSV (tăng cùng phiên bản đồng thời). Thứ tự ban đầu: cột này giảm dần (台帳 一覧の初期の並び). Nhấn tiêu đề cột để sắp xếp."])
big("l_pager", "ページ送り", "Phân trang", ".es-pagination", "area", ["「n件中 a–b件」・前後のページ・ページ番号・表示件数（10／20／50件／ページ）。検索条件・ページ・表示件数は、詳細から戻ったときに戻す。", "\"n件中 a–b件\", trang trước/sau, số trang, số dòng (10/20/50 件／ページ). Điều kiện tìm kiếm, trang, số dòng được khôi phục khi quay lại từ chi tiết."], pattern="P-LIST")

# ================================================================ AW_CORP_002 詳細
big("d_head", "ヘッダー", "Đầu trang", ".phead", "area", ["パンくず・画面名＋法人ID・要約・ボタン。入力欄はすべて読むだけ（詳細は表示だけ・保存は編集画面）。", "Breadcrumb, tên màn hình + 法人ID, tóm tắt, nút. Mọi ô chỉ xem (chi tiết chỉ hiển thị, lưu ở màn sửa)."], pattern="P-FORM")
sub("d_crumb", "パンくず", "Breadcrumb", ".phead .crumb", "label", ["「法人・契約管理 / 法人一覧 / 法人詳細」。法人一覧はリンク。", "「法人・契約管理 / 法人一覧 / 法人詳細」. 法人一覧 là liên kết."])
sub("d_title", "画面名・法人ID", "Tên màn hình・法人ID", ".phead h2", "label", ["「法人詳細 CU00001」。", "「法人詳細 CU00001」."])
sub("d_sum", "要約", "Tóm tắt", ".sumbar", "label", ["法人ID・法人名・ステータス・請求書発行リードタイム・請求書の発行単位・配下の拠点（n拠点）。どのタブでも見える。", "法人ID・法人名・ステータス・請求書発行リードタイム・請求書の発行単位・cơ sở trực thuộc (n拠点). Thấy ở mọi tab."])
sub("d_edit", "編集", "Sửa", ".pbtn button.save", "button", ["法人編集（AW_CORP_003）へ（今のタブを引き継ぐ）。", "Mở 法人編集 (AW_CORP_003) (giữ tab hiện tại)."], cond=EDIT)
sub("d_apply", "申請詳細で編集", "Sửa ở 申請詳細", ".pbtn button::申請詳細で編集", "button", ["仮登録のとき、「編集」の代わりに出す。契約申請管理の申請詳細へ。", "Khi 仮登録, hiện thay cho \"編集\". Mở 申請詳細 của 契約申請管理."])
big("d_prov", "仮登録中の帯", "Dải đang đăng ký tạm", ".provbar", "area", ["仮登録の法人だけ。「仮登録中です（申請 AP-… の詳細情報設定中）。仮登録の間は、この画面では編集できません。」と、編集は契約申請管理の申請詳細で行うことを案内する。拠点を確定（本登録）すると、この画面で編集できる。", "Chỉ với pháp nhân 仮登録. Hiện \"仮登録中です（申請 AP-… の詳細情報設定中）…\" và hướng dẫn sửa ở 申請詳細 của 契約申請管理. Sau khi xác nhận cơ sở (đăng ký chính thức) thì sửa được ở màn này."], err=["I105"],
    demo_ok=["コードの帯の文言は I105 と少し違う（「…編集は 契約申請管理 ＞ 申請詳細 で行います…」）。I105 に揃える", "Câu trong dải của code hơi khác I105. Đồng nhất với I105"])
big("d_remind", "ご注文のリマインドを送る", "Gửi nhắc nhở đặt hàng", ".provbar::ご注文のリマインド", "area", ["締切の7日前・3日前に、ご注文がまだの拠点と法人へ送るお知らせの入り・切り。法人Web の法人情報にある設定（法人が切り替える：台帳 E「ご注文がまだの警告」・受付簿 No.30）。", "Bật/tắt thông báo gửi cho cơ sở và pháp nhân chưa đặt hàng, trước hạn chót 7 ngày và 3 ngày. Là thiết lập ở thông tin pháp nhân của 法人Web (do pháp nhân bật/tắt: 台帳 E, 受付簿 No.30)."],
    open=["運営の法人詳細にこの欄を置くか（仕様にはない。コードは詳細でチェックした瞬間に保存される＝H10）。置くなら編集 → 保存の欄にする", "Có đặt mục này ở chi tiết pháp nhân của vận hành không (spec không có; code lưu ngay khi tích ở màn chi tiết = H10). Nếu đặt thì làm thành mục sửa → lưu"], ask="開発（運営の欄は必要か）",
    demo_ok=["コードは詳細（参照）の画面でチェックを押した瞬間に保存する（H10：詳細は表示だけ・保存は「保存」1つの決まりと違う）", "Code lưu ngay khi tích ở màn chi tiết (H10: trái quy tắc chi tiết chỉ hiển thị, lưu bằng 1 nút \"保存\")"])
sub("d_remind_chk", "チェック（リマインドを送る）", "Ô tích (gửi nhắc)", ".provbar input[type=checkbox]", "check", ["既定はチェックあり（送る）。", "Mặc định tích (gửi)."], req="－", init=["チェックあり", "Có tích"], ex=["チェックを外す", "Bỏ tích để không gửi nhắc"])
big("d_stick", "タブ・項目の検索", "Tab・tìm mục", ".stick", "area", ["タブ（基本情報／請求／拠点・契約一覧／変更履歴）。タブは URL（?tab=）に持つ。項目の検索（「/」で入力欄へ）・すべて閉じる／開く・入力する項目だけ・カードの目次。", "Tab (基本情報 / 請求 / 拠点・契約一覧 / 変更履歴). Tab giữ ở URL (?tab=). Tìm mục (phím \"/\" để vào ô), đóng/mở tất cả, chỉ các mục nhập, mục lục thẻ."], pattern="P-TAB")
sub("d_tabs", "タブ", "Tab", ".tabs[role=tablist]", "tab", ["基本情報／請求／拠点・契約一覧／変更履歴（運営だけ見る）。変更履歴の中身は No.変更履歴。", "基本情報 / 請求 / 拠点・契約一覧 / 変更履歴 (chỉ vận hành xem). Nội dung 変更履歴 xem mục 変更履歴."], pattern="P-TAB",
    demo_ok=["4タブは仕様（契約_00 §0.1）と同じ（確認メモ H11 は解消済み）。タブは URL の ?tab= で最初に開くタブを受けるが、タブを切り替えても URL は変わらない（再読み込みで最初のタブに戻る）。P-TAB（タブを URL に持つ）に合わせる", "4 tab giống spec (契約_00 §0.1) (H11 đã xong). Tab ban đầu nhận từ ?tab= trên URL nhưng khi chuyển tab URL không đổi (tải lại thì về tab đầu). Cần theo P-TAB (giữ tab trên URL)"])
sub("d_search", "項目を検索", "Tìm mục", ".tools input[type=search]", "text", ["項目名・値・説明に含まれる文字で絞り込む。「/」キーで入力欄へ。×で消す。", "Lọc theo chữ trong tên mục / giá trị / giải thích. Phím \"/\" để vào ô. Bấm × để xóa."], req="－", len="文字列 60", ex=["電話", "Chữ trong tên hoặc giá trị mục"])
sub("d_fold", "すべて閉じる／すべて開く", "Đóng tất cả / mở tất cả", ".tools button.linkbtn", "button", ["今のタブのカードをまとめて閉じる／開く。", "Đóng / mở cùng lúc các thẻ của tab hiện tại."])
sub("d_editonly", "入力する項目だけ", "Chỉ các mục nhập", ".tools label::入力する項目だけ", "check", ["チェックすると、読むだけの項目（法人ID・法人ステータスなど）を隠す。", "Tích thì ẩn các mục chỉ xem (法人ID, 法人ステータス...)."], req="－", init=["チェックなし", "Không tích"], ex=["チェックする", "Tích để ẩn mục chỉ xem"])
sub("d_idx", "カードの目次", "Mục lục thẻ", ".idx", "label", ["カード名と項目数。押すとそのカードへ移る。", "Tên thẻ và số mục. Bấm để chuyển tới thẻ đó."])
big("d_basic", "カード「基本情報」", "Thẻ \"基本情報\"", ".ch::基本情報^", "area", ["法人名・法人名（契約）・法人名フリガナ・請求先法人名・ES営業担当・社内備考・法人ID・法人ステータス。項目の定義は法人編集（AW_CORP_003）と同じ。入力欄はすべて読むだけ。", "法人名・法人名（契約）・法人名フリガナ・請求先法人名・ES営業担当・社内備考・法人ID・法人ステータス. Định nghĩa mục giống 法人編集 (AW_CORP_003). Mọi ô chỉ xem."])
sub("d_status", "法人ステータス", "Trạng thái pháp nhân", ".f::法人ステータス*", "label", ["仮登録／正式登録／休眠／取消。法人は参照のみ（法人Web でも変えられない）。仮登録の間は編集できない。「休眠」の定義は未決。", "仮登録 / 正式登録 / 休眠 / 取消. Pháp nhân chỉ xem (không đổi được ở 法人Web). Đang 仮登録 thì không sửa được. Định nghĩa \"休眠\" chưa quyết."])
big("d_addr", "カード「住所（請求書に載る住所）」", "Thẻ \"住所（請求書に載る住所）\"", ".ch::住所（請求書に載る住所）^", "area", ["郵便番号・都道府県・市区町村・町名・番地・建物等・電話番号・FAX番号。法人Web からの変更は運営の承認が必要（承認必須）。", "Mã bưu chính, tỉnh, quận/huyện, số nhà, tòa nhà, điện thoại, FAX. Thay đổi từ 法人Web cần vận hành duyệt (承認必須)."])
big("d_contact", "カード「担当者（テーブル）」", "Thẻ \"担当者\"", ".ch::担当者（テーブル）^", "area", ["区分（メイン／請求／サブ担当者）・担当者名・フリガナ・メールアドレス・電話番号の表。メイン担当者1名・請求担当者1名は必須。拠点の担当者とは別に持つ。", "Bảng 区分 (chính / thanh toán / phụ), tên, furigana, email, điện thoại. Bắt buộc 1 người phụ trách chính và 1 người phụ trách thanh toán. Tách riêng với người phụ trách của cơ sở."])
sub("d_ct_table", "担当者の表", "Bảng người phụ trách", ".pane table", "table", ["詳細では読むだけ（行の追加・削除は編集画面）。法人Web でも追加・削除できる（即反映・運営へ通知）。", "Màn chi tiết chỉ xem (thêm / xóa dòng ở màn sửa). Ở 法人Web cũng thêm / xóa được (phản ánh ngay, thông báo cho vận hành)."])
big("d_acct", "カード「アカウント」", "Thẻ \"アカウント\"", ".ch::アカウント^", "area", ["法人アカウントの欄（法人で1つ。法人の担当者で共有。担当者ごとには発行しない・決定 2026/09/29）。ログインID・ステータス・最終ログイン・操作。", "Mục tài khoản pháp nhân (1 tài khoản mỗi pháp nhân, các người phụ trách dùng chung; không cấp theo từng người, quyết định 2026/09/29). Gồm ログインID, trạng thái, lần đăng nhập cuối, thao tác."])
sub("d_login", "ログインID（法人ID）", "ログインID (法人ID)", ".f::ログインID（法人ID）", "label", ["法人ID と同じ値。法人で1つ。新規の申込では、受付・仮登録で拠点アカウントといっしょに発行し、法人のメイン・サブ・請求担当者へログイン案内を送る（決定 28-145）。", "Cùng giá trị với 法人ID. Mỗi pháp nhân 1 tài khoản. Với đơn mới, cấp cùng tài khoản cơ sở khi tiếp nhận / đăng ký tạm, gửi hướng dẫn đăng nhập cho người phụ trách chính, phụ, thanh toán (quyết định 28-145)."])
sub("d_acst", "アカウントのステータス", "Trạng thái tài khoản", ".f::アカウントのステータス", "label", ["未発行／発行済（ログイン前）／ログイン済／参照のみ／停止中。「参照のみ」は全拠点の解約後〜最後の請求書の入金期限まで、「停止中」はその翌日（自動）か運営の「停止」。法人には出さない。", "未発行 / 発行済（ログイン前）/ ログイン済 / 参照のみ / 停止中. \"参照のみ\" từ sau khi mọi cơ sở hủy đến hạn thanh toán của hóa đơn cuối, \"停止中\" là ngày hôm sau (tự động) hoặc do vận hành bấm \"停止\". Không hiện cho pháp nhân."])
sub("d_last", "最終ログイン日時", "Lần đăng nhập cuối", ".f::最終ログイン日時", "label", ["yyyy-mm-dd HH:MM。まだログインしていなければ空。", "yyyy-mm-dd HH:MM. Trống nếu chưa đăng nhập."])
sub("d_pw", "パスワード再設定", "Đặt lại mật khẩu", ".f button::パスワード再設定", "button", ["確認（Q302）→「送る」で、法人のメイン担当者に認証コード（4桁・有効期限5分）の案内を送る（S306・I11）。ふだんは法人Web のログイン画面から本人が行い、運営は依頼を受けたときに使う。変更履歴に残す。", "Xác nhận (Q302) → bấm \"送る\" gửi hướng dẫn kèm mã xác thực (4 số, hiệu lực 5 phút) cho người phụ trách chính (S306・I11). Thường người dùng tự làm ở màn đăng nhập 法人Web, vận hành dùng khi nhận yêu cầu. Ghi vào lịch sử."], err=["Q302", "S306", "I11", "E30"], cond=EDIT)
sub("d_resend", "ログイン案内の再送", "Gửi lại hướng dẫn đăng nhập", ".f button::ログイン案内の再送", "button", ["確認（Q106）→「再送する」で、法人のメイン・サブ・請求担当者にログイン案内（メール M2。同じ人は1通）を送る。送れたら S102。", "Xác nhận (Q106) → bấm \"再送する\" gửi hướng dẫn đăng nhập (email M2; cùng người chỉ 1 thư) cho người phụ trách chính, phụ, thanh toán. Gửi xong hiện S102."], err=["Q106", "S102", "E30"], cond=EDIT)
sub("d_stop", "アカウントの停止／再開", "Khóa / mở lại tài khoản", ".f button::アカウントの", "button", ["確認（停止＝Q104／再開＝Q105）→ 実行で、法人アカウントのログインを止める／再開する（拠点アカウントは止まらない）。停止中はボタンの名前が「アカウントの再開」に変わる。実行したら S102。変更履歴に残す。", "Xác nhận (khóa = Q104 / mở lại = Q105) → thực hiện để khóa / mở lại đăng nhập của tài khoản pháp nhân (tài khoản cơ sở không bị khóa). Khi đang khóa, nút đổi tên thành \"アカウントの再開\". Xong hiện S102. Ghi vào lịch sử."], err=["Q104", "Q105", "S102", "E30"],
    cond=["法人情報管理の 停止・再開 の権限（フル権限・システム管理だけ。CS の R/U は押せない：確認メモ Q3＝B）", "Quyền khóa / mở lại của 法人情報管理 (chỉ フル権限・システム管理; CS R/U không bấm được: 確認メモ Q3 = B)"],
    demo_ok=["コードは法人情報の編集権限があれば停止・再開も押せる（CS も押せる）。停止・再開だけフル権限・システム管理に絞る（宿題）", "Code cho ai có quyền sửa thông tin pháp nhân bấm được khóa / mở lại (CS cũng bấm được). Chỉ giới hạn khóa / mở lại cho フル権限・システム管理 (việc phải sửa)"])
big("d_bill", "カード「請求条件」", "Thẻ \"請求条件\"", ".ch::請求条件^", "area", ["請求書発行リードタイム・請求書の発行単位・支払方法・口座振替の手続きステータス・支払サイクル・起算月・入金期限・Bill One 発行先ID・拠点の請求先を一括変更。法人Web では参照のみ（Bill One 発行先ID は法人に出さない）。", "請求書発行リードタイム, 請求書の発行単位, 支払方法, 口座振替の手続きステータス, 支払サイクル, 起算月, 入金期限, Bill One 発行先ID, 拠点の請求先を一括変更. Ở 法人Web chỉ xem (Bill One 発行先ID không hiện cho pháp nhân)."])
sub("d_bulkbtn", "拠点の請求先を一括変更（詳細では押せない）", "拠点の請求先を一括変更 (không bấm được ở chi tiết)", ".f button::拠点の請求先を一括変更", "button", ["詳細（表示だけの画面）では押せない。編集画面で押す（AW_CORP_003）。", "Không bấm được ở màn chi tiết (chỉ hiển thị). Bấm ở màn sửa (AW_CORP_003)."], cond=["拠点の請求先の一括変更の権限", "Quyền đổi nơi nhận hóa đơn hàng loạt"])
big("d_inv", "カード「一覧（発行した請求書）」", "Thẻ \"一覧（発行した請求書）\"", ".ch::一覧（発行した請求書）^", "area", ["請求書番号・発行日・請求月・請求先・対象拠点数・固定額（前払い）・前払いの対象・実績精算（後払い）・実績精算の対象・消費税・請求金額（税込）・入金期限・請求書ステータスの表。請求書の発行・PDF は Bill One で行うので、システムには PDF の表示・ダウンロードはない（2026/09/29）。", "Bảng 請求書番号, 発行日, 請求月, 請求先, 対象拠点数, 固定額（前払い）, 前払いの対象, 実績精算（後払い）, 実績精算の対象, 消費税, 請求金額（税込）, 入金期限, 請求書ステータス. Phát hành và PDF hóa đơn làm ở Bill One nên hệ thống không hiển thị / tải PDF (2026/09/29)."])
sub("d_inv_open", "請求書詳細を開く", "Mở chi tiết hóa đơn", ".f button::請求書詳細を開く", "button", ["請求書番号を押すと請求の確定・請求書の詳細（運営E の画面）へ。", "Bấm số hóa đơn để mở chi tiết ở 請求の確定・請求書 (màn của 運営E)."])
big("d_list", "タブ「拠点・契約一覧」の表", "Bảng ở tab \"拠点・契約一覧\"", ".ch::一覧^", "area", ["拠点ID・拠点名・親契約番号・契約種別・契約ステータス・当月の適用プラン・請求月（前払い）・当月請求額・子契約 件数。休止中の拠点は休止の期間の行を出す。", "拠点ID, 拠点名, 親契約番号, 契約種別, 契約ステータス, 当月の適用プラン, 請求月（前払い）, 当月請求額, 子契約 件数. Cơ sở đang 休止 hiện dòng thời gian tạm ngưng."])
big("d_hist", "タブ「変更履歴」の表", "Bảng ở tab \"変更履歴\"", ".ch::履歴（配下の拠点・契約の参照）^", "area", ["法人自身の変更と、配下の拠点・契約・子契約の変更をまとめて見るだけ（登録・編集はそれぞれの画面）。列は変更履歴の共通の決まり（日時・操作した人・操作・項目・変更前・変更後・理由）に、契約だけの 適用範囲・承認者・通知の有無 を足す（確認メモ Q6＝C）。新しい順・直せない・消せない。承認した申請は参照だけで「やり直す」はない。", "Chỉ xem gộp thay đổi của pháp nhân và của cơ sở・hợp đồng・hợp đồng con trực thuộc (đăng ký / sửa ở màn tương ứng). Cột theo quy tắc chung của lịch sử (ngày giờ, người thao tác, thao tác, mục, trước, sau, lý do) cộng thêm 適用範囲・承認者・通知の有無 riêng của hợp đồng (確認メモ Q6 = C). Mới nhất trước, không sửa / xóa được. Đơn đã duyệt chỉ xem, không có \"やり直す\"."], pattern="P-HIST",
    demo_ok=["コードの列は 変更日時・対象・対象名・変更内容・変更者・適用範囲・承認者・通知の有無（変更内容は「項目名「前」→「後」」の1列）。項目・変更前・変更後・理由の列に分ける宿題（Q6＝C）", "Cột của code: 変更日時, 対象, 対象名, 変更内容, 変更者, 適用範囲, 承認者, 通知の有無 (変更内容 là 1 cột dạng \"tên mục「trước」→「sau」\"). Việc phải sửa: tách thành các cột mục / trước / sau / lý do (Q6 = C)"])
big("d_nf", "見つからないとき", "Khi không tìm thấy", ".empty", "label", ["URL の法人IDが存在しないとき、I10（対象＝法人（CU99999））を画面の中に出す。", "Khi 法人ID trên URL không tồn tại, hiện I10 (対象 = 法人（CU99999）) trong màn hình."], err=["I10"],
    demo_ok=["コードの文言は「法人（CU99999）が見つかりません」（句点なし）。I10 に揃える", "Câu trong code là \"法人（CU99999）が見つかりません\" (không có dấu chấm). Đồng nhất với I10"])
big("m_pw", "パスワード再設定の案内（確認）", "Hướng dẫn đặt lại mật khẩu (xác nhận)", "div[role=dialog][aria-modal]", "modal", ["Q302。タイトル「パスワード再設定の案内を送りますか？」。本文：法人アカウント（ID）のメイン担当者（氏名）に、認証コード（有効期限5分）の案内をメールで送る。「送る」で S306。", "Q302. Tiêu đề \"パスワード再設定の案内を送りますか？\". Nội dung: gửi email hướng dẫn kèm mã xác thực (hiệu lực 5 phút) cho người phụ trách chính (họ tên) của tài khoản pháp nhân (ID). Bấm \"送る\" thì hiện S306."], err=["Q302", "S306"],
    demo_ok=["コードの本文・ボタン名（「送る」）は Q302 と少し違う（「…パスワード再設定の案内（認証コード・有効期限5分）をメールで送ります」）。Q302 に揃える", "Nội dung / tên nút (\"送る\") trong code hơi khác Q302. Đồng nhất với Q302"])
sub("m_pw_cancel", "キャンセル", "Hủy", "div[role=dialog] button::キャンセル", "button", ["閉じる（何も送らない）。", "Đóng (không gửi gì)."])
sub("m_pw_ok", "送る", "Gửi", "div[role=dialog] button.act", "button", ["認証コードの案内を送る。送れなければ E30。", "Gửi hướng dẫn kèm mã xác thực. Không gửi được thì E30."], err=["S306", "E30"])
big("m_resend", "ログイン案内の再送（確認）", "Gửi lại hướng dẫn đăng nhập (xác nhận)", "div[role=dialog][aria-modal]", "modal", ["Q106。タイトル「ログイン案内を再送しますか？」。本文：法人アカウント（ID）のログイン案内（M2）を、法人のメイン・サブ・請求担当者に送る（同じ人は1通）。「再送する」で S102。", "Q106. Tiêu đề \"ログイン案内を再送しますか？\". Nội dung: gửi hướng dẫn đăng nhập (M2) của tài khoản pháp nhân (ID) cho người phụ trách chính, phụ, thanh toán (cùng người chỉ 1 thư). Bấm \"再送する\" hiện S102."], err=["Q106", "S102"])
sub("m_resend_ok", "再送する", "Gửi lại", "div[role=dialog] button.act", "button", ["再送する。送れなければ E30。", "Gửi lại. Không gửi được thì E30."], err=["S102", "E30"])
big("m_stop", "アカウントの停止（確認）", "Khóa tài khoản (xác nhận)", "div[role=dialog][aria-modal]", "modal", ["Q104。タイトル「アカウントを停止しますか？」。本文：法人アカウント（ID）でログインできなくなる（拠点アカウントは止まらない）。「停止する」で停止して S102。停止中は「アカウントの再開」（Q105）に変わる。", "Q104. Tiêu đề \"アカウントを停止しますか？\". Nội dung: tài khoản pháp nhân (ID) không đăng nhập được (tài khoản cơ sở không bị khóa). Bấm \"停止する\" thì khóa và hiện S102. Khi đang khóa chuyển thành \"アカウントの再開\" (Q105)."], err=["Q104", "Q105", "S102"],
    demo_ok=["コードのボタン名「停止する」・本文に「再開するまで法人Web のホーム・法人情報・申請は使えません」が付く。Q104 に揃える", "Tên nút \"停止する\" và phần nội dung thêm \"再開するまで法人Web のホーム・法人情報・申請は使えません\" của code. Đồng nhất với Q104"])
sub("m_stop_ok", "停止する／再開する", "Khóa / mở lại", "div[role=dialog] button.act", "button", ["停止する（Q104）／再開する（Q105）。", "Khóa (Q104) / mở lại (Q105)."], err=["S102", "E30"])

# ================================================================ AW_CORP_003 編集
big("e_head", "ヘッダー", "Đầu trang", ".phead", "area", ["パンくず・画面名＋法人ID・要約・キャンセル／保存。仮登録の法人は編集画面を開いても詳細（参照）が出る（決定 28-146）。", "Breadcrumb, tên màn hình + 法人ID, tóm tắt, hủy / lưu. Với pháp nhân 仮登録, dù mở màn sửa vẫn hiện chi tiết (chỉ xem; quyết định 28-146)."], pattern="P-FORM")
sub("e_cancel", "キャンセル", "Hủy", ".pbtn button.cancel", "button", ["詳細へ戻る（詳細から来たとき）か一覧へ戻る。入力を変えていたら Q02（キャンセル／破棄）。", "Quay lại chi tiết (nếu đến từ chi tiết) hoặc danh sách. Nếu đã đổi nhập thì hiện Q02 (キャンセル / 破棄)."], err=["Q02"])
sub("e_save", "保存", "Lưu", ".pbtn button.save", "button", ["全項目をまとめてチェックし（エラーの項目は赤枠＋項目の下の文言）、保存できたら S01 のトーストを出して詳細へ。押したら二重に押せなくする。法人名・請求条件などは変更履歴に残る（変更内容は1回の保存で1操作）。", "Kiểm tra gộp mọi mục (mục lỗi viền đỏ + câu dưới mục), lưu được thì hiện toast S01 và về chi tiết. Bấm xong khóa nút để không bấm đúp. Thay đổi 法人名, điều kiện hóa đơn... được ghi vào lịch sử (1 lần lưu = 1 thao tác)."], err=["S01", "E30", "E31"], pattern="P-FORM",
    demo_ok=["コードの入力チェックの文言は直書き（「…を入力してください」「…は120文字以内で入力してください」）で ID がなく、赤枠の下に出す。E01・E04 などに揃える（H5）。同時更新の検知（E31）は実装済み。カナ・メール形式・絵文字のチェックはまだない。設計書の「文字列 n」と、コードの上限（DB の varchar に合わせた値）が違う項目がある：法人名・拠点名・フリガナ 120（設計書 60）、市区町村 60（255）、町名・番地・建物 120（255）、配送番号 40（60）、設置フロア 100（60）", "Câu kiểm tra trong code viết thẳng (\"…を入力してください\" / \"…は120文字以内…\") không có ID. Đồng nhất với E01・E04... (H5). Phát hiện cập nhật đồng thời (E31) đã làm. Chưa có kiểm tra katakana / email / emoji. Có mục giới hạn trong code (theo varchar của DB) khác \"文字列 n\" của 設計書: 法人名・拠点名・フリガナ 120 (設計書 60), 市区町村 60 (255), 町名・番地・建物 120 (255), 配送番号 40 (60), 設置フロア 100 (60)"])
big("e_lock", "編集中の人がいるとき・先に保存されていたとき", "Khi có người đang sửa / đã lưu trước", ".provbar.pendnote", "area", ["ほかの人が開いていれば画面の上に I02 を出す（ロックはしない）。あとから保存した方は E31（警告のモーダル・「上書きして保存」で自分の内容で保存できる）。", "Nếu người khác đang mở thì hiện I02 ở đầu màn hình (không khóa). Người lưu sau nhận E31 (modal cảnh báo, \"上書きして保存\" để lưu theo nội dung của mình)."], err=["I02", "E31"], pattern="P-FORM",)

# 編集画面の項目（FIELDS から作る。CSV取込の列の定義にも使う）
# (key, ja, vi, UI のラベル, 必須記号, kind, len, init, ex, valid, detail, err, 追加のキー)
def _f(key, ja, vi, lab, mark, kind, ln, init, ex, valid, detail, err=None, **kw):
    return dict(key=key, ja=ja, vi=vi, lab=lab, mark=mark, kind=kind, len=ln, init=init, ex=ex, valid=valid, detail=detail, err=err or [], kw=kw)

FIELDS = [
    ("基本情報", "基本情報", "Thông tin cơ bản", [
        _f("f_name", "法人名", "Tên pháp nhân", "法人名", "*", "text", "文字列 60", None, ["株式会社エービーシー", "Tên pháp nhân hiển thị trên màn hình / danh sách"],
           ["必須。最大60文字（前後の空白は取り、全角の英数字・ハイフンは半角に直す）。絵文字は不可。", "Bắt buộc. Tối đa 60 ký tự (cắt khoảng trắng đầu cuối, đổi chữ số/Latin/gạch nối toàn góc sang nửa góc). Không dùng emoji."],
           ["ESで管理する法人の名称。画面・一覧の表示に使う。法人Webからも変えられる（即反映・運営へ通知。運営の承認は不要）。", "Tên pháp nhân do ES quản lý, dùng để hiển thị trên màn hình / danh sách. Cũng đổi được từ 法人Web (phản ánh ngay, thông báo cho vận hành, không cần vận hành duyệt)."], ["E01", "E04", "E13", "W02"],
           demo_ok=["コードは必須と、上限 120 文字（E04・DB の varchar(120)）を見る。設計書は 60 文字。絵文字（E13）は弾かない（実際に保存して確認：絵文字入りで保存できた）（H5）", "Code kiểm tra bắt buộc và giới hạn 120 ký tự (E04, varchar(120) của DB). 設計書 quy định 60 ký tự. Không chặn emoji (E13) (đã lưu thử: lưu được tên có emoji) (H5)"]),
        _f("f_cname", "法人名（契約）", "Tên pháp nhân (hợp đồng)", "法人名（契約）", "*", "text", "文字列 60", None, ["株式会社エービーシーホールディングス", "Tên ghi trên hợp đồng"],
           ["必須。最大60文字。", "Bắt buộc. Tối đa 60 ký tự."], ["契約書に記載する法人名。法人名と違うことがあるため別に持つ。空のときは法人名を使う。", "Tên ghi trên hợp đồng. Giữ riêng vì có thể khác 法人名. Nếu để trống thì dùng 法人名."], ["E01", "E04", "E13"], open=OPEN_REQ, ask="hong（契約_03 の必須と備考の食い違い）"),
        _f("f_kana", "法人名フリガナ", "Furigana pháp nhân", "法人名フリガナ", "*", "text", "文字列 60", None, ["カブシキガイシャエービーシー", "Katakana toàn góc"],
           ["必須。全角カタカナ・長音・スペース。最大60文字。", "Bắt buộc. Katakana toàn góc, âm kéo dài, khoảng trắng. Tối đa 60 ký tự."], ["カタカナ統一。一覧の検索（フリガナ）に使う。", "Thống nhất Katakana. Dùng để tìm kiếm furigana ở danh sách."], ["E01", "E03", "E04"]),
        _f("f_bname", "請求先法人名", "Tên pháp nhân nhận hóa đơn", "請求先法人名", "*", "text", "文字列 60", None, ["株式会社エービーシー 経理部", "Tên ghi ở người nhận hóa đơn"],
           ["必須。最大60文字。", "Bắt buộc. Tối đa 60 ký tự."], ["請求書の宛名に使う法人名。契約の法人名と請求先の法人名が違うことがあるため別に持つ。空のときは法人名（契約）→法人名の順で使う。", "Tên pháp nhân ghi trên hóa đơn. Giữ riêng vì tên hợp đồng và tên nhận hóa đơn có thể khác. Nếu trống thì dùng 法人名（契約）→ 法人名."], ["E01", "E04", "E13"], open=OPEN_REQ, ask="hong（契約_03 の必須と備考の食い違い）"),
        _f("f_rep", "ES営業担当", "Nhân viên kinh doanh ES", "ES営業担当", "△", "select", ["選択（運営のユーザー）", "Chọn (người dùng vận hành)"], ["未選択", "Chưa chọn"], ["田中 健一", "Chọn 1 người dùng vận hành"],
           ["任意。運営のアカウントから選ぶ。", "Tùy chọn. Chọn từ tài khoản vận hành."], ["一覧で担当者ごとに絞り込むための項目（フリーテキストから変更・2026/09/29）。契約申請管理の代理入力・受付で入れた担当者がここに入る。法人には出さない。", "Mục để lọc theo người phụ trách ở danh sách (đổi từ văn bản tự do, 2026/09/29). Người nhập ở đăng ký hộ / tiếp nhận của 契約申請管理 sẽ vào đây. Không hiện cho pháp nhân."], [],
           demo_ok=["コードの選択肢は固定の3名（運営のユーザーの一覧から作る宿題・H19）", "Lựa chọn của code là 3 người cố định (việc phải làm: lấy từ danh sách người dùng vận hành; H19)"]),
        _f("f_memo", "社内備考", "Ghi chú nội bộ", "社内備考", "△", "textarea", ["文字列 500（複数行）", "Chuỗi 500 (nhiều dòng)"], None, ["パートナーズ経由。決裁は本社経理。", "Ghi chú nội bộ"],
           ["任意。最大500文字。絵文字は不可。", "Tùy chọn. Tối đa 500 ký tự. Không dùng emoji."], ["社内運用のための自由記述。法人には出さない。複数行の欄は3列分の幅で、セクションの最後に置く。", "Văn bản tự do cho vận hành nội bộ. Không hiện cho pháp nhân. Ô nhiều dòng rộng 3 cột và đặt cuối khu vực."], ["E04", "E13"]),
        _f("f_id", "法人ID", "Mã pháp nhân", "法人ID", "*", "label", None, None, None, None, ["CU＋連番（例：CU00001）。システムが採番し、直せない。桁は固定せず伸びてよい。", "CU + số thứ tự (vd CU00001). Hệ thống cấp, không sửa được. Số chữ số không cố định, có thể tăng."], [], ro=True),
        _f("f_st", "法人ステータス", "Trạng thái pháp nhân", "法人ステータス", "*", "label", None, None, None, None, ["仮登録／正式登録／休眠／取消。参照だけ（申請の承認・拠点の本登録で動く）。", "仮登録 / 正式登録 / 休眠 / 取消. Chỉ xem (đổi theo duyệt đơn / đăng ký chính thức cơ sở)."], [], ro=True),
    ]),
    ("住所", "住所（請求書に載る住所）", "Địa chỉ (ghi trên hóa đơn)", [
        _f("f_zip", "郵便番号", "Mã bưu chính", "郵便番号（請求書に載る住所）", "*", "text", "文字列 8（数字7桁）", None, ["105-0011", "Số 7 chữ số, gạch nối tùy chọn"],
           ["必須。数字7桁（ハイフンはあってもなくても可）。保存は 123-4567 の形。", "Bắt buộc. 7 chữ số (có hoặc không gạch nối đều được). Lưu dạng 123-4567."], ["請求書に載る住所の郵便番号。横の「住所検索」で住所を入れる。", "Mã bưu chính của địa chỉ ghi trên hóa đơn. Dùng \"住所検索\" bên cạnh để điền địa chỉ."], ["E01", "E05"]),
        _f("f_zipbtn", "住所検索", "Tìm địa chỉ", "住所検索", "", "button", None, None, None, None, ["郵便番号（7桁）を入れて押すと、都道府県・市区町村・町名を入れる（番地・建物は自分で入れる）。見つからなければ何も変えない。住所のデータの出どころ・つなぐ時期は未決でも、ボタンは出す（台帳 F 2026-10-07）。", "Nhập mã bưu chính (7 số) rồi bấm để điền tỉnh, quận/huyện, phường (số nhà, tòa nhà tự nhập). Không tìm thấy thì không đổi gì. Dù nguồn dữ liệu địa chỉ và thời điểm kết nối chưa quyết, vẫn hiện nút (台帳 F 2026-10-07)."], ["E05"], pattern="P-ADDRESS",
           demo_ok=["本番では「まだつないでいません」のトーストが出る（住所のデータの出どころ未決）", "Ở môi trường thật hiện toast \"まだつないでいません\" (chưa quyết nguồn dữ liệu địa chỉ)"]),
        _f("f_pref", "都道府県", "Tỉnh / thành phố", "都道府県（請求書に載る住所）", "*", "select", ["選択（47都道府県）", "Chọn (47 tỉnh thành)"], ["東京都", "東京都"], ["東京都", "Chọn 1 trong 47 tỉnh thành"],
           ["必須。47都道府県の選択（自由入力にしない）。", "Bắt buộc. Chọn 1 trong 47 tỉnh thành (không nhập tự do)."], ["住所検索で入った値もこの選択肢に合わせる。", "Giá trị điền bởi 住所検索 cũng khớp với lựa chọn này."], ["E02"]),
        _f("f_city", "市区町村", "Quận / huyện", "市区町村（請求書に載る住所）", "*", "text", "文字列 255", None, ["港区", "Thành phố / quận"],
           ["必須。最大255文字。", "Bắt buộc. Tối đa 255 ký tự."], ["住所（市区町村・町名・番地・建物）は最大255文字（入力の共通基準）。請求書・送り状に印字できない文字は警告（W02）。", "Địa chỉ (quận/huyện, phường, số nhà, tòa nhà) tối đa 255 ký tự (chuẩn nhập liệu chung). Ký tự không in được trên hóa đơn / phiếu gửi sẽ cảnh báo (W02)."], ["E01", "E04", "E13", "W02"],
           demo_ok=["コードの上限は 60 文字（E04・DB の varchar(60)）。設計書は 255 文字（入力の共通基準）。実際に保存して確認：61 文字でエラー（H5）", "Giới hạn trong code là 60 ký tự (E04, varchar(60)). 設計書 là 255 ký tự (chuẩn nhập liệu chung). Đã lưu thử: 61 ký tự báo lỗi (H5)"]),
        _f("f_addr1", "町名・番地", "Phường・số nhà", "町名・番地（請求書に載る住所）", "*", "text", "文字列 255", None, ["芝公園2-4-1", "Tên phố và số nhà"],
           ["必須。最大255文字。", "Bắt buộc. Tối đa 255 ký tự."], ["同上。", "Như trên."], ["E01", "E04", "E13", "W02"]),
        _f("f_addr2", "建物等", "Tòa nhà", "建物等（請求書に載る住所）", "△", "text", "文字列 255", None, ["芝パークビル8F", "Tên tòa nhà, tầng"],
           ["任意。最大255文字。", "Tùy chọn. Tối đa 255 ký tự."], ["同上。", "Như trên."], ["E04", "E13", "W02"]),
        _f("f_tel", "電話番号", "Số điện thoại", "電話番号（請求書に載る住所）", "*", "text", "文字列 20（数字・ハイフン）", None, ["03-5401-2200", "Số và gạch nối; bỏ gạch nối còn 10–11 số"],
           ["必須。数字とハイフンだけ。ハイフンを除いて10〜11桁。", "Bắt buộc. Chỉ số và gạch nối. Bỏ gạch nối còn 10–11 chữ số."], ["請求書に載る住所の電話番号。", "Số điện thoại của địa chỉ ghi trên hóa đơn."], ["E01", "E06"]),
        _f("f_fax", "FAX番号", "Số FAX", "FAX番号（請求書に載る住所）", "△", "text", "文字列 20（数字・ハイフン）", None, ["03-5401-2201", "Số và gạch nối"],
           ["任意。数字とハイフンだけ。ハイフンを除いて10〜11桁。", "Tùy chọn. Chỉ số và gạch nối. Bỏ gạch nối còn 10–11 chữ số."], ["請求書に載る住所のFAX。", "Số FAX của địa chỉ ghi trên hóa đơn."], ["E06"]),
    ]),
    ("アカウント", "アカウント", "Tài khoản", [
        _f("f_loginid", "ログインID（法人ID）", "ログインID (法人ID)", "ログインID（法人ID）", "", "label", None, None, None, None, ["法人ID と同じ値（直せない）。", "Cùng giá trị với 法人ID (không sửa được)."], [], ro=True),
        _f("f_acst", "アカウントのステータス", "Trạng thái tài khoản", "アカウントのステータス", "", "label", None, None, None, None, ["読むだけ。停止・再開は詳細画面のボタンで行う。", "Chỉ xem. Khóa / mở lại bằng nút ở màn chi tiết."], [], ro=True),
        _f("f_last", "最終ログイン日時", "Lần đăng nhập cuối", "最終ログイン日時", "", "label", None, None, None, None, ["読むだけ。", "Chỉ xem."], [], ro=True),
    ]),
    ("請求", "請求条件", "Điều kiện hóa đơn", [
        _f("f_lead", "請求書発行リードタイム", "Lead time phát hành hóa đơn", "請求書発行リードタイム", "*", "select", ["選択（3ヶ月前〜翌月）", "Chọn (3 tháng trước 〜 tháng sau)"], ["1ヶ月前（−1）", "Trước 1 tháng (−1)"], ["1ヶ月前（−1）", "Chọn 1 trong: 3ヶ月前（−3）/ 2ヶ月前（−2）/ 1ヶ月前（−1）/ 当月（0）/ 翌月（+1・後払い）"],
           ["必須。選択：3ヶ月前（−3）／2ヶ月前（−2）／1ヶ月前（−1）／当月（0）／翌月（+1・後払い）。", "Bắt buộc. Chọn: 3ヶ月前（−3）/ 2ヶ月前（−2）/ 1ヶ月前（−1）/ 当月（0）/ 翌月（+1・後払い）."],
           ["サイクル月に対して、どの月に請求書を出すか。請求月＝サイクル月＋この値（例：サイクル月 2026-09 → −2 なら 2026年7月、0 なら 9月、+1 なら 10月）。新規の申込で法人が選ぶ（既定 1ヶ月前）。申込後は法人は参照のみ。変えて前払いが重なる／抜ける月ができるときは警告して確認する（W101）。", "Phát hành hóa đơn ở tháng nào so với tháng chu kỳ. Tháng hóa đơn = tháng chu kỳ + giá trị này (vd tháng chu kỳ 2026-09: −2 là tháng 7, 0 là tháng 9, +1 là tháng 10). Pháp nhân chọn khi đăng ký mới (mặc định 1 tháng trước). Sau khi đăng ký pháp nhân chỉ xem. Nếu đổi làm tháng trả trước bị trùng / thiếu thì cảnh báo và xác nhận (W101)."], ["E02", "W101"],
           demo_ok=["コードは変えて前払いが重なる／抜ける月があっても警告しない（H20：W101 を出す宿題）", "Code không cảnh báo khi đổi làm tháng trả trước trùng / thiếu (H20: việc phải thêm W101)"]),
        _f("f_unit", "請求書の発行単位", "Đơn vị phát hành hóa đơn", "請求書の発行単位", "*", "select", ["選択（まとめて発行／拠点ごと発行）", "Chọn (gộp / theo cơ sở)"], ["まとめて発行（法人1通）", "まとめて発行（法人1通）"], ["拠点ごと発行", "Chọn 1 trong 2"],
           ["必須。選択：まとめて発行（法人1通）／拠点ごと発行。", "Bắt buộc. Chọn: まとめて発行（法人1通） / 拠点ごと発行."], ["法人は参照のみ。法人情報の変更申請の入口ができるまでは、お問い合わせで受けて運営が直す。発行単位そのものを廃止するかは未決。", "Pháp nhân chỉ xem. Đến khi có cửa đơn đổi thông tin pháp nhân thì nhận qua お問い合わせ và vận hành sửa. Việc có bỏ hẳn đơn vị phát hành hay không chưa quyết."], ["E02"]),
        _f("f_pay", "支払方法", "Phương thức thanh toán", "支払方法", "*", "select", ["選択（口座振替／銀行振込／クレジットカード）", "Chọn (chuyển khoản tự động / chuyển khoản / thẻ tín dụng)"], ["口座振替", "口座振替"], ["口座振替", "Chọn 1 trong 3"],
           ["必須。選択：口座振替／銀行振込／クレジットカード。", "Bắt buộc. Chọn: 口座振替 / 銀行振込 / クレジットカード."], ["法人は参照のみ。請求先＝法人 の拠点にだけ使う。", "Pháp nhân chỉ xem. Chỉ dùng cho cơ sở có nơi nhận hóa đơn = 法人."], ["E02"]),
        _f("f_debit", "口座振替の手続きステータス", "Trạng thái thủ tục chuyển khoản tự động", "口座振替の手続きステータス", "△", "select", ["選択（未手続き／手続き中／完了）", "Chọn (chưa làm / đang làm / hoàn tất)"], ["完了", "完了"], ["完了", "Chọn 1 trong 3"],
           ["支払方法＝口座振替のときだけ入力できる。", "Chỉ nhập được khi 支払方法 = 口座振替."], ["運営が支払方法を口座振替に変えたときに使う。完了になるまでは請求書にお振込と印字して振込先を載せる（請求は止めない）。完了になった次の請求書から口座振替の記載になる。", "Dùng khi vận hành đổi 支払方法 sang 口座振替. Đến khi hoàn tất, hóa đơn in \"お振込\" kèm tài khoản nhận (không dừng thanh toán). Từ hóa đơn sau khi hoàn tất thì ghi chuyển khoản tự động."], []),
        _f("f_cycle", "支払サイクル", "Chu kỳ thanh toán", "支払サイクル", "*", "select", ["選択（月払い／年払い）", "Chọn (hằng tháng / hằng năm)"], ["月払い", "月払い"], ["年払い", "Chọn 1 trong 2"],
           ["必須。選択：月払い／年払い。", "Bắt buộc. Chọn: 月払い / 年払い."], ["法人は参照のみ。請求先＝法人 の拠点にだけ使う。新規の申込で法人が選ぶ（既定 月払い・前払い）。", "Pháp nhân chỉ xem. Chỉ dùng cho cơ sở có nơi nhận hóa đơn = 法人. Pháp nhân chọn khi đăng ký mới (mặc định 月払い・trả trước)."], ["E02"]),
        _f("f_anchor", "起算月（年払いのとき）", "Tháng bắt đầu (khi trả theo năm)", "起算月（年払いのとき）", "△", "select", ["選択（yyyy-mm）", "Chọn (yyyy-mm)"], ["—", "—"], ["2026-04", "Chọn 1 tháng"],
           ["支払サイクル＝年払い のときだけ入力できる。", "Chỉ nhập được khi 支払サイクル = 年払い."], ["12サイクル分をまとめて1通で請求する最初のサイクル月。", "Tháng chu kỳ đầu tiên của 12 chu kỳ được gộp thành 1 hóa đơn."], [], ro=True),
        _f("f_due", "入金期限", "Hạn thanh toán", "入金期限", "*", "select", ["選択（請求月の27日／翌月27日）", "Chọn (27 tháng hóa đơn / 27 tháng sau)"], ["請求月の27日", "請求月の27日"], ["請求月の翌月27日", "Chọn 1 trong 2"],
           ["必須。選択：請求月の27日／請求月の翌月27日。", "Bắt buộc. Chọn: 請求月の27日 / 請求月の翌月27日."], ["請求月（請求書を送付する月）の27日か、その翌月27日。前払い分も実績精算分も、1枚の請求書に入金期限は1つ。口座振替・クレジットの引き落とし日もこの日付。", "Ngày 27 của tháng hóa đơn (tháng gửi hóa đơn) hoặc 27 tháng sau. Phần trả trước và phần quyết toán thực tế trong 1 hóa đơn chỉ có 1 hạn. Ngày trừ tiền tự động / thẻ cũng là ngày này."], ["E02"]),
        _f("f_bo", "Bill One 発行先ID", "ID nơi phát hành Bill One", "Bill One 発行先ID", "*", "text", "文字列 40", None, ["BO-778201", "ID nơi phát hành hóa đơn ở Bill One"],
           ["必須。最大40文字。", "Bắt buộc. Tối đa 40 ký tự."], ["請求先＝法人 の拠点にだけ使う。法人Webには出さない。", "Chỉ dùng cho cơ sở có nơi nhận hóa đơn = 法人. Không hiện ở 法人Web."], ["E01", "E04"]),
    ]),
]

# カード見出しごとに、編集画面の項目を並べる
for _tab, _card, _cardvi, _fs in FIELDS:
    big("e_" + _tab, "カード「%s」" % _card, "Thẻ \"%s\"" % _cardvi, ".ch::%s^" % _card, "area",
        ["このカードの入力項目。保存はヘッダーの「保存」1つ（カードごとの保存ボタンはない）。", "Các mục nhập của thẻ này. Lưu bằng 1 nút \"保存\" ở đầu màn hình (không có nút lưu riêng từng thẻ)."])
    for _x in _fs:
        _sel = ".f::" + _x["lab"] + _x["mark"] if _x["mark"] else ".f::" + _x["lab"]
        _kw = dict(_x["kw"])
        _kw.pop("ro", None)
        _pat = _kw.pop("pattern", None)
        _it = {}
        if _x["kind"] in ("text", "textarea", "select"):
            _it = dict(req="○" if _x["mark"] == "*" else "－", len=_x["len"], ex=_x["ex"], valid=_x["valid"])
            if _x["init"]: _it["init"] = _x["init"]
        elif _x["kind"] == "button":
            _it = {}
        if _x["err"]: _it["err"] = _x["err"]
        if _pat: _it["pattern"] = _pat
        _it.update(_kw)
        _sel = ".f button::住所検索" if _x["key"] == "f_zipbtn" else _sel
        sub(_x["key"], _x["ja"], _x["vi"], _sel, _x["kind"], _x["detail"], **_it)
    if _tab == "基本情報":
        pass

# 担当者の表・アカウントの操作・請求の操作
big("e_contact", "カード「担当者（テーブル）」", "Thẻ \"担当者\"", ".ch::担当者（テーブル）^", "area", ["担当者の表（行の追加・削除ができる）。メイン担当者1名・請求担当者1名は必須。拠点の担当者とは別にできる。", "Bảng người phụ trách (thêm / xóa dòng được). Bắt buộc 1 người phụ trách chính và 1 người phụ trách thanh toán. Có thể khác người phụ trách của cơ sở."])
sub("e_c_kind", "区分", "Phân loại", ".pane tbody tr:first-child select", "select", ["メイン担当者／請求担当者／サブ担当者。請求担当者の人が、法人一括請求のときの請求書の宛先・通知先になる。", "Người phụ trách chính / thanh toán / phụ. Người phụ trách thanh toán là nơi nhận hóa đơn và thông báo khi hóa đơn gộp theo pháp nhân."], req="○", len=["選択（メイン担当者／請求担当者／サブ担当者）", "Chọn (chính / thanh toán / phụ)"], ex=["請求担当者", "Chọn 1 loại"], valid=["必須。メイン担当者・請求担当者が各1名いること。", "Bắt buộc. Phải có 1 người phụ trách chính và 1 người phụ trách thanh toán."], err=["E02", "E116"],
    demo_ok=["コードはメイン・請求担当者が0名でも保存できる（H5：E116 のチェックを足す宿題。見本では行を消した状態までを撮る）", "Code vẫn lưu được khi 0 người phụ trách chính / thanh toán (H5: việc phải thêm kiểm tra E116. Với dữ liệu mẫu chỉ chụp đến trạng thái đã xóa dòng)"])
sub("e_c_name", "担当者名", "Tên người phụ trách", ".pane tbody tr:first-child td:nth-child(2) input", "text", ["担当者の氏名。", "Họ tên người phụ trách."], req="○", len="文字列 60", ex=["佐藤 誠", "Họ tên"], valid=["必須。最大60文字。", "Bắt buộc. Tối đa 60 ký tự."], err=["E01", "E04", "E13"])
sub("e_c_kana", "フリガナ（担当者）", "Furigana (người phụ trách)", ".pane tbody tr:first-child td:nth-child(3) input", "text", ["カタカナ統一・必須。", "Thống nhất Katakana, bắt buộc."], req="○", len="文字列 60", ex=["サトウ マコト", "Katakana toàn góc"], valid=["必須。全角カタカナ。最大60文字。", "Bắt buộc. Katakana toàn góc. Tối đa 60 ký tự."], err=["E01", "E03", "E04"])
sub("e_c_mail", "メールアドレス", "Email", ".pane tbody tr:first-child td:nth-child(4) input", "text", ["ログイン案内・パスワード再設定の案内の宛先になる。", "Là nơi nhận hướng dẫn đăng nhập và đặt lại mật khẩu."], req="○", len="文字列 160", ex=["sato@abc.co.jp", "Địa chỉ email"], valid=["必須。メールの形式。最大160文字。", "Bắt buộc. Đúng định dạng email. Tối đa 60 ký tự."], err=["E01", "E04", "E07"])
sub("e_c_tel", "電話番号（担当者）", "Số điện thoại (người phụ trách)", ".pane tbody tr:first-child td:nth-child(5) input", "text", ["担当者の電話番号。", "Số điện thoại người phụ trách."], req="－", len="文字列 20（数字・ハイフン）", ex=["03-5401-2200", "Số và gạch nối"], valid=["任意。数字とハイフンだけ。ハイフンを除いて10〜11桁。", "Tùy chọn. Chỉ số và gạch nối. Bỏ gạch nối còn 10–11 chữ số."], err=["E06"])
sub("e_c_add", "行を追加", "Thêm dòng", ".pane button::行を追加", "button", ["担当者の行を1行足す。", "Thêm 1 dòng người phụ trách."])
sub("e_c_del", "行の削除", "Xóa dòng", ".pane span.del", "button", ["その行を削除する（確認なし。保存するまで確定しない）。メイン・請求担当者が0名になる保存は E116。", "Xóa dòng đó (không xác nhận; chưa xác định đến khi lưu). Lưu khi còn 0 người phụ trách chính / thanh toán thì E116."], err=["E116"])
big("e_acct", "カード「アカウント」の操作", "Thao tác ở thẻ \"アカウント\"", ".f button::パスワード再設定", "area", ["編集画面でもパスワード再設定の案内・ログイン案内の再送・アカウントの停止／再開が押せる（動きと権限は法人詳細と同じ）。ほかの項目は読むだけ。", "Ở màn sửa vẫn bấm được gửi hướng dẫn đặt lại mật khẩu・gửi lại hướng dẫn đăng nhập・khóa / mở lại tài khoản (cách hoạt động và quyền giống 法人詳細). Các mục khác chỉ xem."])
big("e_bulk", "拠点の請求先を一括変更", "Đổi nơi nhận hóa đơn của các cơ sở hàng loạt", ".f button::拠点の請求先を一括変更", "button", ["運営だけ。押すとダイアログ（下）で配下の拠点を一覧し、拠点ごとに請求先（法人／この拠点）を選び直して一度に保存する。ダイアログの保存はこの画面の「保存」とは別（すぐ保存される）。法人なし拠点は出さない。法人Webには出さない。", "Chỉ vận hành. Bấm để mở dialog (bên dưới) liệt kê các cơ sở trực thuộc, chọn lại nơi nhận hóa đơn (法人 / この拠点) từng cơ sở và lưu một lần. Lưu ở dialog tách biệt với \"保存\" của màn hình này (lưu ngay). Không hiện cơ sở không thuộc pháp nhân. Không hiện ở 法人Web."],
    cond=["拠点の請求先の一括変更の権限（編集の権限）", "Quyền đổi nơi nhận hóa đơn hàng loạt (quyền sửa)"],
    demo_ok=["詳細（表示だけの画面）では押せない作り（コード）。編集画面で押す。保存の仕組みが「保存」1つの決まりと違うので、置き場所を hong に確認（確認メモ B 表）", "Code làm nút không bấm được ở màn chi tiết (chỉ hiển thị). Bấm ở màn sửa. Cơ chế lưu khác quy tắc \"1 nút 保存\" nên cần hỏi hong vị trí đặt (bảng B của 確認メモ)"])
sub("e_bulk_dlg", "ダイアログ（拠点の一覧）", "Dialog (danh sách cơ sở)", ".dlg.wide", "modal", ["配下の拠点（法人なしは除く）の表：拠点ID・拠点名・いまの請求先・変更後の請求先（選択）。下に「変更する拠点：n件」。発行済みの請求書はそのままで、まだ発行していない請求書から新しい請求先になる（追補 28-6）。", "Bảng cơ sở trực thuộc (trừ cơ sở không thuộc pháp nhân): 拠点ID, 拠点名, nơi nhận hiện tại, nơi nhận sau khi đổi (chọn). Bên dưới \"変更する拠点：n件\". Hóa đơn đã phát hành giữ nguyên, hóa đơn chưa phát hành dùng nơi nhận mới (追補 28-6)."], err=["S104", "E30"])
sub("e_bulk_sel", "変更後の請求先", "Nơi nhận sau khi đổi", ".dlg.wide tbody select", "select", ["拠点ごとに 法人／この拠点 を選ぶ。変えた拠点だけが対象。", "Chọn 法人 / この拠点 cho từng cơ sở. Chỉ các cơ sở đã đổi là đối tượng."], req="○", len=["選択（法人／この拠点）", "Chọn (pháp nhân / cơ sở này)"], init=["いまの請求先", "Nơi nhận hiện tại"], ex=["この拠点", "Chọn 1 trong 2"])
sub("e_bulk_ok", "保存", "Lưu", ".dlg.wide .ft button.ok", "button", ["変えた拠点の請求先をまとめて保存し、S104「n拠点の請求先を変更しました。」を出す。1件も変えていなければ0拠点。失敗は E30。", "Lưu hàng loạt nơi nhận hóa đơn của cơ sở đã đổi và hiện S104 \"n拠点の請求先を変更しました。\". Nếu không đổi cái nào thì 0 cơ sở. Lỗi là E30."], err=["S104", "E30"])
sub("e_bulk_cancel", "キャンセル", "Hủy", ".dlg.wide .ft button.cancel", "button", ["閉じる（何も保存しない）。", "Đóng (không lưu gì)."])
sub("e_bulk_toast", "結果（トースト）", "Kết quả (toast)", ".toast", "toast", ["保存したら S104「n拠点の請求先を変更しました。」のトーストを出し、ダイアログを閉じる（この画面の入力は変わらない）。", "Lưu xong hiện toast S104 \"n拠点の請求先を変更しました。\" và đóng dialog (nội dung nhập của màn này không đổi)."], err=["S104"],
    demo_ok=["コードのトーストは「n拠点の請求先を変更しました（デモ）」。本番は「（デモ）」を付けない。S104 に揃える", "Toast của code là \"n拠点の請求先を変更しました（デモ）\". Bản thật không thêm \"（デモ）\". Đồng nhất với S104"])
big("e_discard", "編集内容の破棄（確認）", "Hủy nội dung đang sửa (xác nhận)", ".es-modal", "modal", ["Q02（Message List No.25）。入力を変えたあとに「キャンセル」・ほかの画面への移動・ブラウザを閉じる／再読み込みをしたとき。「破棄」で捨てて移動、「キャンセル」で編集を続ける。", "Q02 (Message List No.25). Hiện khi đã đổi nhập rồi bấm \"キャンセル\", chuyển màn hình khác, đóng trình duyệt / tải lại. \"破棄\" bỏ và chuyển trang, \"キャンセル\" tiếp tục sửa."], err=["Q02"], pattern="P-FORM")
sub("e_disc_cancel", "キャンセル", "Hủy", ".es-modal__actions button::キャンセル", "button", ["閉じて編集を続ける。", "Đóng, tiếp tục sửa."])
sub("e_disc_ok", "破棄", "Bỏ", ".es-modal__actions button::破棄", "button", ["入力を捨てて移動する。", "Bỏ nội dung đã nhập và chuyển trang."])
big("e_warn", "請求書発行リードタイム変更の警告", "Cảnh báo đổi lead time phát hành hóa đơn", ".es-modal", "modal", ["リードタイムを変えると前払いの請求が重なる／抜ける月ができるとき、保存の前に W101 を出す（ボタン：戻る／このまま保存）。", "Khi đổi lead time làm tháng trả trước bị trùng / thiếu, hiện W101 trước khi lưu (nút: 戻る / このまま保存)."], err=["W101"],
    demo_ok=["コードにこの警告がない（H20）。撮影できない", "Code chưa có cảnh báo này (H20). Không chụp được"])
big("e_saved", "保存完了", "Lưu xong", ".toast", "toast", ["S01「保存しました。」を出して詳細（AW_CORP_002）へ戻る。", "Hiện S01 \"保存しました。\" rồi quay về chi tiết (AW_CORP_002)."], err=["S01"],
    demo_ok=["コードのトーストの文言は「保存しました」（句点なし）。S01 に揃える", "Toast của code là \"保存しました\" (không có dấu chấm). Đồng nhất với S01"])
big("e_rep", "ES営業担当を選ぶ", "Chọn nhân viên kinh doanh ES", ".f::ES営業担当△", "select", ["運営のアカウントから選ぶ（H19）。選択肢は運営のユーザー一覧（アカウント管理）から作る。", "Chọn từ tài khoản vận hành (H19). Lựa chọn lấy từ danh sách người dùng vận hành (アカウント管理)."], req="－", len=["選択（運営のユーザー）", "Chọn (người dùng vận hành)"], ex=["佐々木 桜", "Chọn 1 người"])

# ================================================================ AW_CORP_004 CSV取込
big("c_head", "ヘッダー", "Đầu trang", ".es-pagehead", "area", ["パンくず（法人・契約管理 / 法人一覧 / 法人一覧 CSV取込）・画面名・キャンセル。フル権限・システム管理だけが開ける（ほかの役割は一覧へ戻す）。モーダルではなく画面。", "Breadcrumb (法人・契約管理 / 法人一覧 / 法人一覧 CSV取込), tên màn hình, hủy. Chỉ フル権限・システム管理 mở được (vai trò khác bị đưa về danh sách). Là màn hình, không phải modal."], pattern="P-CSV")
sub("c_cancel", "キャンセル", "Hủy", ".es-pagehead__actions button::キャンセル", "button", ["法人一覧へ戻る（何も登録しない）。", "Về danh sách pháp nhân (không đăng ký gì)."])
big("c_step1", "ステップ1 ファイルを選ぶ", "Bước 1: chọn tệp", ".es-card", "area", ["手順の表示（1 ファイルを選ぶ → 2 確認・登録）・説明・ファイルを選ぶ（ドラッグ＆ドロップも可）。キーが一致する行は上書き、キーが空欄の行は…法人は新規を作れない（新しい法人は申込から）ので、キーが空欄・存在しない法人ID の行はエラー。空欄のセルは今の値のまま、消すときは「-」。", "Hiển thị các bước (1 chọn tệp → 2 xác nhận・đăng ký), giải thích, chọn tệp (kéo thả được). Dòng trùng khóa thì ghi đè; pháp nhân không tạo mới được (pháp nhân mới đi từ đơn) nên dòng có khóa trống / 法人ID không tồn tại là lỗi. Ô trống giữ giá trị cũ, ghi \"-\" để xóa."], pattern="P-CSV")
sub("c_steps", "手順", "Các bước", ".es-card ol.steps", "label", ["「1 ファイルを選ぶ」「2 確認・登録」。今のステップを強調。", "\"1 ファイルを選ぶ\" \"2 確認・登録\". Bước hiện tại được làm nổi bật."])
sub("c_hint", "説明", "Giải thích", ".es-card .hint", "label", ["キーは法人ID（更新だけ）・列は詳細・編集の項目と同じ・UTF-8・行数の上限。", "Khóa là 法人ID (chỉ cập nhật), cột giống mục ở chi tiết / sửa, UTF-8, giới hạn số dòng."])
sub("c_pick", "ファイルを選ぶ", "Chọn tệp", ".es-card button::ファイルを選ぶ", "file", ["CSV（UTF-8、BOM あり・なし）を選ぶ。5,000行まで。選ぶとすぐステップ2へ。読み込めないファイルは E51。", "Chọn CSV (UTF-8, có hoặc không BOM). Tối đa 5.000 dòng. Chọn xong chuyển ngay sang bước 2. Tệp không đọc được thì E51."], req="○", len=["CSV（UTF-8・5,000行まで）", "CSV (UTF-8, tối đa 5.000 dòng)"], ex=["houjin_20261005.csv", "Tệp CSV do hệ thống xuất ra rồi sửa"], err=["E51"])
big("c_cols", "CSVテンプレートの列（定義。画面には出さない）", "Các cột của CSV template (định nghĩa; không hiện trên màn hình)", "-", "area", ["取り込むファイルの列の定義（1行目の見出し・この順。CSV出力と同じ列）。キー＝法人ID（更新だけ。新規は契約申請管理の申込から）。UTF-8（BOM 可）・5,000行まで。空欄のセルは今の値のまま、「-」で消す。必須・長さ・チェックは入力画面（AW_CORP_003）の項目と同じ（違うところだけ書く）。担当者の表は CSV に含めない。画面には出さない（hong 2026/10/05）。", "Định nghĩa cột của tệp nhập (dòng 1 = tiêu đề, theo thứ tự này; cùng cột với CSV出力). Khóa = 法人ID (chỉ cập nhật; mới đi từ đơn ở 契約申請管理). UTF-8 (có BOM được), tối đa 5.000 dòng. Ô trống giữ giá trị cũ, \"-\" để xóa. Bắt buộc / độ dài / kiểm tra giống mục ở màn nhập (AW_CORP_003) (chỉ ghi chỗ khác). Bảng người phụ trách không đưa vào CSV. Không hiện trên màn hình (hong 2026/10/05)."], pattern="P-CSV")

def csvcol(key, ja, vi, ref, kind="text", req="－", ln=None, ex=None, extra=None, ro=False, err=None):
    d = ["画面の項目「%s」（No.%s）と同じ。" % (ja, ITEMS[ref]["no"]) if ref else (extra[0] if extra else ""), "Giống mục 「%s」 (No.%s) trên màn hình." % (ja, ITEMS[ref]["no"]) if ref else (extra[1] if extra else "")]
    kw = dict(req=req, len=ln or "文字列 60", init=INIT_BLANK)
    if kind in ("text", "textarea", "select"): kw["ex"] = ex
    if ro: kw["valid"] = ["読むだけの列。値を入れても取り込まない（無視する）。", "Cột chỉ đọc. Có điền giá trị cũng không nhập (bỏ qua)."]
    else: kw["valid"] = ["新規の行で必須の列は更新の行では空欄＝今の値のまま。「-」で消せる（必須の項目は消せない）。", "Cột bắt buộc ở dòng mới thì ở dòng cập nhật để trống = giữ giá trị cũ. Ghi \"-\" để xóa (mục bắt buộc không xóa được)."]
    if err: kw["err"] = err
    return sub(key, ja, vi, "-", kind, d, **kw)

csvcol("k_id", "法人ID", "Mã pháp nhân", None, "text", "○", "文字列 CU＋連番", ["CU00001", "Mã pháp nhân hiện có"], ["キー。更新だけ（新規は申込から）。存在しない法人ID・空欄の行は「新しい法人は CSV では登録できません」のエラー。", "Khóa. Chỉ cập nhật (mới đi từ đơn). Dòng có 法人ID không tồn tại / trống bị lỗi \"新しい法人は CSV では登録できません\"."], err=["E01"])
for _tab, _card, _cardvi, _fs in FIELDS:
    for _x in _fs:
        if _x["key"] in ("f_id", "f_zipbtn"): continue
        _ro = _x["kw"].get("ro", False)
        _kind = "text" if _x["kind"] == "label" else _x["kind"]
        _csvkind = "select" if _x["kind"] == "select" else ("textarea" if _x["kind"] == "textarea" else "text")
        _ln = _x["len"] if _x["len"] else "文字列 60"
        _req = "○" if (_x["mark"] == "*" and not _ro) else "－"
        _ex = _x["ex"] or ["—", "Chỉ đọc"]
        if _x["key"] == "f_st": _ex = ["正式登録", "Chỉ đọc"]
        csvcol("k" + _x["key"][1:], _x["ja"], _x["vi"], _x["key"], _csvkind, _req, _ln, _ex, ro=_ro, err=_x["err"][:3] if not _ro else None)
csvcol("k_cnt", "配下の拠点", "Cơ sở trực thuộc", None, "text", "－", "文字列", ["5拠点", "Chỉ đọc"], ["配下の拠点の数（n拠点）。読むだけ。", "Số cơ sở trực thuộc (n拠点). Chỉ đọc."], ro=True)
csvcol("k_reg", "登録日時", "Ngày giờ đăng ký", None, "text", "－", ["日時 yyyy-mm-dd HH:MM", "Ngày giờ yyyy-mm-dd HH:MM"], ["2026-02-20 10:00", "Chỉ đọc"], ["法人を登録した日時。読むだけ。", "Ngày giờ đăng ký pháp nhân. Chỉ đọc."], ro=True)
big("c_step2", "ステップ2 確認・登録", "Bước 2: xác nhận・đăng ký", ".es-card", "area", ["ファイル名・件数（更新／変更なし／エラー）と、行ごとの結果。「登録」でエラー以外の行（更新）を登録する（エラーの行は取り込まない・hong 2026/10/05。台帳 F「CSV取込のエラーの行の扱い」）。", "Tên tệp, số dòng (cập nhật / không đổi / lỗi) và kết quả từng dòng. \"登録\" thì đăng ký các dòng không lỗi (cập nhật) (dòng lỗi bỏ qua; hong 2026/10/05; 台帳 F \"CSV取込のエラーの行の扱い\")."], pattern="P-CSV", err=["Q10", "S10", "S03", "E34"])
sub("c_count", "件数", "Số lượng", ".es-card .badge", "label", ["更新／変更なし／エラー の件数（バッジ）。法人は新規がない。", "Số dòng cập nhật / không đổi / lỗi (badge). Pháp nhân không có dòng mới."])
sub("c_errs", "エラーの行", "Dòng lỗi", ".es-card .notice", "label", ["「エラーの行 n件は取り込みません…」と、行番号・キー・列名・内容の表（多いときは先頭だけ。全部はエラー一覧CSV）。内容は E52 と各列のチェックの文言。", "\"エラーの行 n件は取り込みません…\" và bảng số dòng, khóa, tên cột, nội dung (nhiều thì chỉ phần đầu; đủ ở エラー一覧CSV). Nội dung = E52 và câu kiểm tra của từng cột."], err=["E52"], cond=["エラーの行があるとき", "Khi có dòng lỗi"])
sub("c_errcsv", "エラー一覧CSV", "Xuất CSV lỗi", ".es-card button::エラー一覧CSV", "button", ["エラーの行だけを、元の列＋エラーの内容で書き出す（直して選び直すため）。", "Xuất riêng các dòng lỗi với cột gốc + nội dung lỗi (để sửa rồi chọn lại)."])
sub("c_diff", "登録する内容（前 → 後）", "Nội dung sẽ đăng ký (trước → sau)", ".es-card b::登録する内容", "label", ["行番号・キー・名前・変わる項目（前 → 後）。", "Số dòng, khóa, tên, các mục thay đổi (trước → sau)."], cond=["更新の行があるとき", "Khi có dòng cập nhật"])
sub("c_reselect", "ファイルを選び直す", "Chọn lại tệp", ".es-pagehead__actions button::ファイルを選び直す", "button", ["ステップ1に戻る。何も登録しない。", "Về bước 1. Không đăng ký gì."])
sub("c_go", "登録", "Đăng ký", ".es-pagehead__actions button.pri", "button", ["確認（Q10）のあと、エラー以外の行を登録し、S10 のトースト（更新 n件）を出して一覧へ戻る。100件を超えるときは裏で進めて進み具合を出す。取込の記録と、行ごとの変更履歴「CSV取込で更新」を残す。", "Sau xác nhận (Q10), đăng ký các dòng không lỗi, hiện toast S10 (cập nhật n件) rồi về danh sách. Quá 100 dòng thì chạy nền và hiện tiến độ. Ghi lại lịch sử nhập và lịch sử từng bản ghi \"CSV取込で更新\"."], err=["Q10", "S10", "E34"],
    cond=["ファイル全体のエラーがなく、更新の行が1つ以上あるとき", "Khi không có lỗi toàn tệp và có ≥ 1 dòng cập nhật"])
big("c_fileerr", "ファイル全体のエラー", "Lỗi toàn tệp", ".es-card .notice", "label", ["CSV として読めない・文字コードが違う・列の見出しが違う・行数の上限を超えるときは、ステップ2に進まず E51 を出す。", "Khi không đọc được như CSV, sai mã hóa, sai tiêu đề cột, hoặc vượt số dòng thì không sang bước 2 mà hiện E51."], err=["E51"])

# ---------------------------------------------------------------- 状態
CLEARSTAT = "setsel(q('.es-search select[aria-label=\"法人ステータス\"]'),'');"
L_KW = "setv(q('.es-search input[aria-label=\"法人ID、法人名、フリガナ\"]'),%s);"
CSV_BAD = ("const text=await csvText('corps',(t,rows)=>{const pi=t.head.findIndex(h=>/^法人名$/.test(h));if(pi>=0&&rows[1])rows[1][pi]=rows[1][pi]+' 改';const bad=t.rows[0].slice();bad[0]='CU99999';rows.push(bad);});"
           "await upload(text,'法人取込テスト.csv');")
FILE_ERR = ("const inp=q('input[type=file]');const dt=new DataTransfer();dt.items.add(new File([new Uint8Array([255,254,0,1,2,3,200,201])],'壊れたファイル.csv',{type:'text/csv'}));inp.files=dt.files;inp.dispatchEvent(new Event('change',{bubbles:true}));await sleep(1500);")

LIST_HEADK = ["l_head", "l_crumb", "l_title", "l_csvin", "l_csvout"]
SEARCHK = ["l_search", "l_kw", "l_tel", "l_status", "l_unit", "l_rep", "l_from", "l_to", "l_clear", "l_go", "l_sort"]
TABLEK = ["l_table", "l_id", "l_name", "l_st", "l_unit_c", "l_br", "l_lead", "l_rep_c", "l_reg", "l_act"]
DETAIL_HEAD = ["d_head", "d_crumb", "d_title", "d_sum", "d_edit"]
DETAIL_STICK = ["d_stick", "d_tabs", "d_search", "d_fold", "d_editonly", "d_idx"]
DETAIL_ACCT = ["d_acct", "d_login", "d_acst", "d_last", "d_pw", "d_resend", "d_stop"]
EDIT_HEAD = ["e_head", "e_cancel", "e_save"]

VIEWS = [
    # ---- 一覧
    V("001", "AW_CORP_001", "初期表示", "Hiển thị ban đầu", "/ops/corps", LIST_HEADK + SEARCHK + TABLEK + ["l_pager"],
      note=["登録日時の降順。新規登録・削除のボタンはない。鉛筆＝編集。", "登録日時 giảm dần. Không có nút đăng ký mới / xóa. Bút = sửa."]),
    V("002", "AW_CORP_001", "検索（条件・並べ替え）→ 結果", "Tìm kiếm (điều kiện・sắp xếp) → kết quả", "/ops/corps", ["l_search", "l_kw", "l_status", "l_unit", "l_go", "l_table", "l_id", "l_st"],
      setup=L_KW % "'サンプル'" + "setsel(q('.es-search select[aria-label=\"法人ステータス\"]'),'正式登録');await sleep(200);search();await sleep(500);",
      note=["キーワード「サンプル」・法人ステータス＝正式登録で検索した状態。", "Trạng thái tìm với từ khóa \"サンプル\" và trạng thái = 正式登録."]),
    V("003", "AW_CORP_001", "0件", "0 dòng", "/ops/corps", ["l_kw", "l_table"],
      setup=L_KW % "'存在しない法人'" + "search();await sleep(500);", note=["該当する法人がないとき I01 を表の中に出す。", "Khi không có pháp nhân phù hợp thì hiện I01 trong bảng."]),
    V("004", "AW_CORP_001", "仮登録の行（申請で編集）", "Dòng đăng ký tạm (sửa ở đơn)", "/ops/corps", ["l_status", "l_st", "l_apply", "l_act"],
      setup="setsel(q('.es-search select[aria-label=\"法人ステータス\"]'),'仮登録');await sleep(200);search();await sleep(500);",
      note=["仮登録の法人（CU00020 株式会社あおば工業）は鉛筆の代わりに「申請で編集」。", "Pháp nhân đăng ký tạm (CU00020 株式会社あおば工業) hiện \"申請で編集\" thay cho bút."]),
    V("005", "AW_CORP_001", "取消の法人（絞り込みで表示）", "Pháp nhân đã hủy (hiện khi lọc)", "/ops/corps", ["l_status", "l_st"],
      note=["仮登録のあとの却下・取り下げで「取消」になった法人は、既定では出さず、法人ステータスで「取消」を選んだときだけ出す（台帳 B）。見本のデータに取消の法人はなく、コードの選択肢にも「取消」がない（H6）ため撮れない。", "Pháp nhân thành \"取消\" sau khi từ chối / rút đơn sau đăng ký tạm mặc định không hiện, chỉ hiện khi chọn \"取消\" ở trạng thái pháp nhân (台帳 B). Dữ liệu mẫu không có pháp nhân 取消 và lựa chọn của code cũng chưa có \"取消\" (H6) nên không chụp được."]),
    V("006", "AW_CORP_001", "CSV出力（トースト）", "Xuất CSV (toast)", "/ops/corps", ["l_csvout"],
      setup="btn('CSV出力').click();await sleep(1500);", note=["検索条件のとおりの全件を出し、終わったら S12 のトースト（行数・ファイル名）。", "Xuất toàn bộ theo điều kiện, xong hiện toast S12 (số dòng, tên tệp)."]),
    V("007", "AW_CORP_001", "参照のみの権限", "Quyền chỉ xem", "/ops/corps", ["l_head", "l_csvout", "l_table", "l_act"], login="Ad00001",
      note=["営業（Ad00001・R）でログインした状態。CSV取込と鉛筆（編集）が出ない。CSV出力は出る。", "Trạng thái đăng nhập bằng 営業 (Ad00001・R). Không hiện CSV取込 và bút (sửa). CSV出力 vẫn hiện."]),
    # ---- 詳細
    V("008", "AW_CORP_002", "タブ「基本情報」", "Tab \"基本情報\"", "/ops/corps/CU00001", DETAIL_HEAD + ["d_remind", "d_remind_chk"] + DETAIL_STICK + ["d_basic", "d_status", "d_addr", "d_contact", "d_ct_table", "d_acct", "d_login", "d_acst", "d_last"],
      note=["入力欄はすべて読むだけ。DEMO のラベルのタグ（P2新 など）は設計書に書かない。", "Mọi ô chỉ xem. Không ghi các tag của nhãn DEMO (P2新...) vào thiết kế."]),
    V("009", "AW_CORP_002", "タブ「請求」", "Tab \"請求\"", "/ops/corps/CU00001?tab=%E8%AB%8B%E6%B1%82", ["d_tabs", "d_bill", "d_bulkbtn", "d_inv", "d_inv_open"],
      setup="await sleep(300);", note=["請求条件（読むだけ）・拠点の請求先を一括変更（押せない）・発行した請求書の表。", "Điều kiện hóa đơn (chỉ xem), đổi nơi nhận hóa đơn hàng loạt (không bấm được), bảng hóa đơn đã phát hành."]),
    V("010", "AW_CORP_002", "タブ「拠点・契約一覧」", "Tab \"拠点・契約一覧\"", "/ops/corps/CU00001?tab=%E6%8B%A0%E7%82%B9%E3%83%BB%E5%A5%91%E7%B4%84%E4%B8%80%E8%A6%A7", ["d_tabs", "d_list"], note=["配下の拠点と親契約・子契約の件数。", "Cơ sở trực thuộc và số hợp đồng cha / con."]),
    V("011", "AW_CORP_002", "タブ「変更履歴」", "Tab \"変更履歴\"", "/ops/corps/CU00001?tab=%E5%A4%89%E6%9B%B4%E5%B1%A5%E6%AD%B4", ["d_tabs", "d_hist"], note=["配下の拠点・契約の変更も参照できる（変更者・適用範囲・承認者・通知の有無つき）。", "Xem cả thay đổi của cơ sở / hợp đồng trực thuộc (kèm người thay đổi, phạm vi áp dụng, người duyệt, có thông báo)."]),
    V("012", "AW_CORP_002", "仮登録中の帯", "Dải đang đăng ký tạm", "/ops/corps/CU00020", ["d_apply", "d_prov", "d_edit"], note=["仮登録の法人（CU00020）。「編集」の代わりに「申請詳細で編集」。", "Pháp nhân đăng ký tạm (CU00020). \"申請詳細で編集\" thay cho \"編集\"."]),
    V("013", "AW_CORP_002", "パスワード再設定の案内（確認）", "Hướng dẫn đặt lại mật khẩu (xác nhận)", "/ops/corps/CU00001", ["m_pw", "m_pw_cancel", "m_pw_ok"],
      setup="btn('パスワード再設定').click();await sleep(500);", full=False, note=["「パスワード再設定」を押した状態。", "Trạng thái sau khi bấm \"パスワード再設定\"."]),
    V("014", "AW_CORP_002", "ログイン案内の再送（確認）", "Gửi lại hướng dẫn đăng nhập (xác nhận)", "/ops/corps/CU00001", ["m_resend", "m_resend_ok"],
      setup="btn('ログイン案内の再送').click();await sleep(500);", full=False, note=["「ログイン案内の再送」を押した状態。", "Trạng thái sau khi bấm \"ログイン案内の再送\"."]),
    V("015", "AW_CORP_002", "アカウントの停止（確認）", "Khóa tài khoản (xác nhận)", "/ops/corps/CU00001", ["m_stop", "m_stop_ok"],
      setup="btn('アカウントの停止').click();await sleep(500);", full=False, note=["「アカウントの停止」を押した状態（停止中のときは「アカウントの再開」で Q105）。", "Trạng thái sau khi bấm \"アカウントの停止\" (khi đang khóa thì \"アカウントの再開\" với Q105)."]),
    V("016", "AW_CORP_002", "アカウントの再開（停止中）", "Mở lại tài khoản (đang khóa)", "/ops/corps/CU00001", ["d_acst", "d_stop", "m_stop"],
      setup="btn('アカウントの停止').click();await sleep(400);btn('停止する',q('div[role=dialog]')).click();await sleep(800);btn('アカウントの再開').click();await sleep(500);",
      note=["停止したあと、ステータス＝停止中・ボタン＝「アカウントの再開」（Q105）。", "Sau khi khóa: trạng thái = 停止中, nút = \"アカウントの再開\" (Q105)."]),
    V("017", "AW_CORP_002", "ご注文のリマインドを送る", "Gửi nhắc nhở đặt hàng", "/ops/corps/CU00001", ["d_remind", "d_remind_chk"], note=["詳細の上の帯。コードはチェックした瞬間に保存する（H10・open）。", "Dải phía trên chi tiết. Code lưu ngay khi tích (H10・open)."]),
    V("018", "AW_CORP_002", "項目を検索（/）で絞り込み", "Lọc mục bằng tìm kiếm (/)", "/ops/corps/CU00001", ["d_search", "d_editonly", "d_idx"],
      setup="setv(q('input[type=search]'),'電話');await sleep(400);", note=["「電話」で検索：該当する項目だけが残り、件数が出る。", "Tìm \"電話\": chỉ còn các mục phù hợp và hiện số lượng."]),
    V("019", "AW_CORP_002", "見つからない", "Không tìm thấy", "/ops/corps/CU99999", ["d_nf"], note=["存在しない法人ID。", "法人ID không tồn tại."]),
    # ---- 編集
    V("020", "AW_CORP_003", "編集 初期（基本情報）", "Sửa ban đầu (基本情報)", "/ops/corps/CU00001/edit", EDIT_HEAD + ["e_基本情報"] + [x["key"] for x in FIELDS[0][3]] + ["e_rep"],
      note=["法人ID・法人ステータスは読むだけ。DEMO のラベルのタグは設計書に書かない。", "法人ID・法人ステータス chỉ xem. Không ghi tag nhãn DEMO vào thiết kế."]),
    V("021", "AW_CORP_003", "住所・担当者・アカウント", "Địa chỉ・người phụ trách・tài khoản", "/ops/corps/CU00001/edit", ["e_住所"] + [x["key"] for x in FIELDS[1][3]] + ["e_contact", "e_c_kind", "e_c_name", "e_c_kana", "e_c_mail", "e_c_tel", "e_c_add", "e_c_del", "e_アカウント"] + [x["key"] for x in FIELDS[2][3]] + ["e_acct"],
      setup="await sleep(200);", note=["基本情報のタブの下のカード。", "Các thẻ phía dưới tab 基本情報."]),
    V("022", "AW_CORP_003", "タブ「請求」（請求条件）", "Tab \"請求\" (điều kiện hóa đơn)", "/ops/corps/CU00001/edit", ["e_請求"] + [x["key"] for x in FIELDS[3][3]] + ["e_bulk"],
      setup="tab('請求').click();await sleep(400);", note=["請求条件のカード。口座振替の手続きステータスは支払方法＝口座振替のときだけ、起算月は支払サイクル＝年払いのときだけ入力できる。", "Thẻ điều kiện hóa đơn. Trạng thái thủ tục chuyển khoản chỉ nhập được khi 支払方法 = 口座振替, tháng bắt đầu chỉ nhập được khi 支払サイクル = 年払い."]),
    V("023", "AW_CORP_003", "入力エラー（必須・郵便番号・電話）", "Lỗi nhập (bắt buộc・mã bưu chính・điện thoại)", "/ops/corps/CU00001/edit", ["e_save", "f_name", "f_zip", "f_tel"],
      setup="setv(ctl('法人名*'),'');setv(ctl('郵便番号（請求書に載る住所）*'),'abc');setv(ctl('電話番号（請求書に載る住所）*'),'xx');await sleep(200);q('.pbtn button.save').click();await sleep(500);",
      note=["法人名を空・郵便番号 abc・電話番号 xx で「保存」を押した状態。エラーの項目は赤枠と項目の下の文言（E01・E05・E06）。", "Trạng thái bấm \"保存\" khi 法人名 trống, mã bưu chính abc, điện thoại xx. Mục lỗi viền đỏ và câu dưới mục (E01・E05・E06)."]),
    V("024", "AW_CORP_003", "担当者：メイン・請求担当者が0名", "Người phụ trách: 0 người chính / thanh toán", "/ops/corps/CU00001/edit", ["e_contact", "e_c_add"],
      setup="document.querySelectorAll('.ch').forEach(b=>{if(b.textContent.includes('担当者'))b.scrollIntoView()});const d=[...document.querySelectorAll('span.del')];d.forEach(x=>x.click());await sleep(300);",
      note=["担当者の行をすべて削除した状態（保存は押さない）。「保存」すると E116。コードはチェックがなく保存できてしまう。", "Trạng thái đã xóa hết các dòng người phụ trách (chưa bấm lưu). Bấm \"保存\" sẽ báo E116. Code không kiểm tra nên vẫn lưu được."]),
    V("025", "AW_CORP_003", "請求書発行リードタイムを変えたときの警告", "Cảnh báo khi đổi lead time hóa đơn", "/ops/corps/CU00001/edit", ["e_warn"],
      setup="tab('請求').click();await sleep(300);setsel(ctl('請求書発行リードタイム*'),'翌月（+1・後払い）');await sleep(300);", full=False,
      note=["リードタイムを「翌月（+1・後払い）」に変えた状態。W101（前払いが重なる／抜ける月）を保存の前に出す。コードにはこの警告がなく、撮れない（H20）。", "Trạng thái đổi lead time sang \"翌月（+1・後払い）\". W101 (tháng trả trước trùng / thiếu) hiện trước khi lưu. Code chưa có cảnh báo nên không chụp được (H20)."]),
    V("026", "AW_CORP_003", "編集内容の破棄（確認）", "Hủy nội dung đang sửa (xác nhận)", "/ops/corps/CU00001/edit", ["e_discard", "e_disc_cancel", "e_disc_ok"],
      setup="setv(ctl('法人名*'),'株式会社サンプル（修正）');await sleep(200);q('.pbtn button.cancel').click();await sleep(500);", full=False, note=["法人名を変えて「キャンセル」を押した状態（Q02）。", "Trạng thái đổi 法人名 rồi bấm \"キャンセル\" (Q02)."]),
    V("027", "AW_CORP_003", "他のユーザーが編集中・先に更新された", "Người khác đang sửa / đã cập nhật trước", "/ops/corps/CU00001", ["e_lock"], setup=LK("corp", "CU00001", "法人名", "法人名*"), full=False, note=["伊藤 美咲さんが同じ法人を編集中（I02：画面の上）。自分の編集中に別の人が先に保存したので、「保存」を押すと E31（内容が更新されています・キャンセル／上書きして保存）を出した状態。", "伊藤 美咲 đang sửa cùng pháp nhân (I02: đầu màn hình). Trong lúc mình sửa, người khác đã lưu trước nên khi nhấn \"保存\" hiện E31 (nội dung đã được cập nhật・キャンセル / 上書きして保存)."]),
    V("028", "AW_CORP_003", "ES営業担当を選ぶ", "Chọn nhân viên kinh doanh ES", "/ops/corps/CU00001/edit", ["e_rep"], setup="ctl('ES営業担当△').focus();await sleep(200);", note=["運営のアカウントから選ぶ（H19）。", "Chọn từ tài khoản vận hành (H19)."]),
    V("029", "AW_CORP_003", "拠点の請求先を一括変更（ダイアログ）", "Đổi nơi nhận hóa đơn hàng loạt (dialog)", "/ops/corps/CU00001/edit", ["e_bulk_dlg", "e_bulk_sel", "e_bulk_ok", "e_bulk_cancel"],
      setup="tab('請求').click();await sleep(300);btn('拠点の請求先を一括変更').click();await sleep(800);", full=False, note=["法人 CU00001 の配下の拠点。拠点ごとに 法人／この拠点 を選ぶ。", "Các cơ sở trực thuộc pháp nhân CU00001. Chọn 法人 / この拠点 cho từng cơ sở."]),
    V("030", "AW_CORP_003", "一括変更の結果（トースト）", "Kết quả đổi hàng loạt (toast)", "/ops/corps/CU00001/edit", ["e_bulk_toast"],
      setup="tab('請求').click();await sleep(300);btn('拠点の請求先を一括変更').click();await sleep(800);const s=q('.dlg.wide tbody select');setsel(s,s.value==='法人'?'この拠点':'法人');await sleep(200);btn('保存',q('.dlg.wide .ft')).click();await sleep(800);",
      note=["拠点の請求先を1つ変えて保存した状態。「n拠点の請求先を変更しました。」（S104）のトースト。", "Trạng thái đổi nơi nhận của 1 cơ sở rồi lưu. Toast \"n拠点の請求先を変更しました。\" (S104)."]),
    V("031", "AW_CORP_003", "保存完了（S01）→ 詳細へ", "Lưu xong (S01) → về chi tiết", "/ops/corps/CU00001/edit", ["e_saved"],
      setup="setv(ctl('社内備考△'),'パートナーズ経由。決裁は本社経理。');await sleep(200);q('.pbtn button.save').click();await sleep(1200);",
      note=["保存できたら S01 のトーストを出して法人詳細へ戻る。", "Lưu được thì hiện toast S01 và quay về 法人詳細."]),
    # ---- CSV取込
    V("032", "AW_CORP_004", "ステップ1 ファイルを選ぶ", "Bước 1: chọn tệp", "/ops/corps/import", ["c_head", "c_cancel", "c_step1", "c_steps", "c_hint", "c_pick", "c_cols"], wait=800,
      note=["フル権限（CSV取込の権限）だけが開ける。列の定義は画面には出さない（hong 2026/10/05）。", "Chỉ vai trò có quyền CSV取込 mở được. Định nghĩa cột không hiện trên màn hình (hong 2026/10/05)."]),
    V("033", "AW_CORP_004", "ステップ2 確認・登録", "Bước 2: xác nhận・đăng ký", "/ops/corps/import", ["c_step2", "c_count", "c_errs", "c_errcsv", "c_diff", "c_reselect", "c_go"], setup=CSV_BAD, wait=800,
      note=["CSV出力のデータの1行目の法人名を変え（更新の見本）、存在しない法人ID の行を1つ足したファイルを選んだ状態。", "Trạng thái chọn tệp từ dữ liệu CSV出力 với 法人名 ở dòng 1 đã đổi (mẫu cập nhật) và thêm 1 dòng có 法人ID không tồn tại."]),
    V("034", "AW_CORP_004", "ファイル全体のエラー", "Lỗi toàn tệp", "/ops/corps/import", ["c_fileerr"], setup=FILE_ERR, wait=600, note=["UTF-8 でないファイルを選んだ状態（E51）。", "Trạng thái chọn tệp không phải UTF-8 (E51)."]),
]

# CSV の列（sel "-"）を、ステップ1の状態に付ける
for _v in VIEWS:
    if _v["id"] == "032":
        _v["items"] = _v["items"] + [ITEMS[k] for k in ITEMS if k.startswith("k_") or (k.startswith("k") and k[1:2] == "_" )]
