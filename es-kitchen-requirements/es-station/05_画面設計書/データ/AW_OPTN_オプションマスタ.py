# -*- coding: utf-8 -*-
"""
画面設計書のデータ：運営管理者Web ＞ マスタ管理 ＞ オプションマスタ（一覧・詳細・登録／編集）
元：本物の Web（このリポジトリ app/ops/masters/options）、決定台帳 B・E・F、マスタ項目一覧「オプションマスタ一覧／編集（25）」§0.0〜0.8、
    オプション・値引き_定義_20261003、決定_STEP3追補_オプション値引きマスタの不足_20261001、運営Web_権限表（プラン管理）、STEP7 一覧の決まり、
    確認メモ_AW_マスタ3画面_機種・オプション・値引き.md
番号は画面ごとに通し。タブ・モーダルの状態では、その状態で増える・変わる項目だけ書く（共通の項目は最初の状態に1回）。
"""

TITLE = ["オプションマスタ（AW_OPTN）", "Option master (AW_OPTN)"]
SHEET = ["オプションマスタ", "Option master"]
BASENAME = "画面設計書_AW_OPTN_オプションマスタ"
IMG_PREFIX = "AW_OPTN"
OUT_DIR = "AW_OPTN_オプションマスタ"
CODE_NOTE = ["画面コードは規約 <Module(2)>_<Feature(4)>_<Seq(3)>（docs/01_仕様/画面コード規約_20261005.md）。AW＝運営管理者Web、OPTN＝オプションマスタ",
             "Mã màn hình theo quy ước <Module(2)>_<Feature(4)>_<Seq(3)>. AW = Admin Web, OPTN = Option master"]
SITE = "ops"
SYSTEM = {"ja": "運営管理者Web", "vi": "Web quản trị vận hành"}
AUTHOR = "Claude（cloud）／確認：hong"
CREATED = "2026-10-05"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "ops", "loginId": "Ad00010"}

DECISIONS = [
    {"date": "2026-10-05", "target": "権限",
     "q": ["だれが作成・編集・削除できるか", "Ai được tạo/sửa/xóa?"],
     "a": ["フル権限＝CRUD、ほかの6役割＝R（閲覧・CSV出力）（プラン管理・台帳 F）", "フル権限 = CRUD, 6 vai trò còn lại = R (台帳 F)"],
     "src": "台帳 F（2026-10-05・画面設計書 Q3＝A）・運営Web_権限表"},
    {"date": "2026-10-05", "target": "一覧の初期の並び",
     "q": ["初期の並び順（L-3）", "Thứ tự mặc định (L-3)"],
     "a": ["登録日時の新しい順。列見出しで オプションID・管理名・オプション区分・利用状態・登録日時 を並べ替えられる（マスタ項目一覧 #9）", "Mới đăng ký trước. Sắp xếp được theo ID, tên, loại, trạng thái, ngày đăng ký (マスタ項目一覧 #9)"],
     "src": "マスタ項目一覧 一覧画面 #9・STEP7 L-3"},
    {"date": "2026-10-05", "target": "A型（契約項目に連動）の扱い",
     "q": ["運営が A型を作る・消せるか", "運営 có tạo/xóa được loại A không?"],
     "a": ["できない。A型はシステムで先に定義し、運営が直せるのは表示名・金額・公開ステータス・利用状態など。一覧・詳細に削除を出さず、新規登録の連動タイプは「連動しない」だけ、編集でも連動タイプは変えられない", "Không. Loại A do hệ thống định nghĩa trước; 運営 chỉ sửa tên hiển thị, tiền, trạng thái. Không có nút xóa, màn mới chỉ chọn được 連動しない, màn sửa không đổi 連動タイプ"],
     "src": "2026/09/28 決定・マスタ項目一覧 一覧画面 #11"},
    {"date": "2026-10-05", "target": "A型（システム定義）のオプションの一覧",
     "q": ["どのオプションが A型か、要件のどこで定義するか", "Option nào là loại A, định nghĩa ở đâu?"],
     "a": ["OP000001 配送回数追加（配送回数がプラン標準を超えた分・回）／OP000002 ES-QR 利用料（ES-QR＝利用する・固定1）／OP000003 ゲストモード利用料（ゲストモード＝利用する・固定1）／OP000035 ユーザー現金利用（利用する・固定1）。一覧は オプション・値引き_定義 §10。追加・削除はリリースで", "OP000001 配送回数追加 (số lần giao vượt chuẩn plan) / OP000002 ES-QR (dùng = 1) / OP000003 ゲストモード (dùng = 1) / OP000035 ユーザー現金利用 (dùng = 1). Danh sách ở オプション・値引き_定義 §10. Thêm/xóa bằng release"],
     "src": "hong 回答 2026/10/05（画面設計書 HTML のコメント）・受付簿 #88"},
    {"date": "2026-10-05", "target": "削除できない条件",
     "q": ["適用中の拠点があるオプションを削除できるか", "Xóa được option đang áp dụng không?"],
     "a": ["できない（E37・件数＝適用中の拠点数）。終了にして新規に選べなくする", "Không (E37, n = số điểm đang áp dụng). Đổi 利用状態 = 終了"],
     "src": "RV-OPS-20261002 O-b・コード（useCountOf）"},
    {"date": "2026-10-05", "target": "税率",
     "q": ["8%／10% の固定か税率マスタか", "2 lựa chọn cố định hay 税率マスタ?"],
     "a": ["税率マスタのドロップダウン（既定 10%）", "Dropdown 税率マスタ (mặc định 10%)"],
     "src": "台帳 E・受付簿 #38・マスタ項目一覧 料金 4"},
    {"date": "2026-10-05", "target": "画面コード",
     "q": ["画面コード", "Mã màn hình"],
     "a": ["AW_OPTN_001〜003", "AW_OPTN_001〜003"],
     "src": "画面コード規約_20261005（Feature は Claude 案・hong 回答 2026/10/05 OK・受付簿 #107）"},
]
CHANGES = [{'ver': '1.5', 'date': '2026-10-05', 'no': ['2.5', '2.6', '2.7', '9.5'], 'type': '削除', 'before': ['履歴 9.5「影響した拠点数」', 'Cột 9.5 影響した拠点数'], 'after': ['外す（マスタの変更は契約・拠点に影響しない）', 'Bỏ (đổi master không ảnh hưởng hợp đồng)'], 'reason': ['hong 2026/10/05「bỏ」・受付簿 #148', 'hong 2026/10/05, 受付簿 #148'], 'impact': ['options.ts 履歴の表', 'options.ts']},
 {'ver': '1.4', 'date': '2026-10-05', 'no': ['3.5', '3.6', '3.7', '4.5', '4.6', '4.7'], 'type': '変更', 'before': ['備考・説明の欄は1列・途中', 'Ô 備考/説明 1 cột, ở giữa'], 'after': ['3列分の幅でセクションの最後に（番号も最後に）', 'Rộng 3 cột, đặt cuối section (đổi số)'], 'reason': ['hong 2026/10/05 チャット（共通）・受付簿 #143', 'hong 2026/10/05, 受付簿 #143'], 'impact': ['parts.tsx span3・spec の fields の順', 'parts.tsx span3; thứ tự fields trong spec']},
 {'ver': '1.4', 'date': '2026-10-05', 'no': ['1.3', '2.5', '2.6', '2.7', '3.1'], 'type': '変更', 'before': ['CSV取込の画面：手順がカードの中、見出しは .phead', 'Màn CSV取込: stepper trong card, tiêu đề .phead'], 'after': ['アンケートの CSV取込と同じ形（見出し .ph＋ボタン、手順はカードの外の中央、カードに見出し）', 'Giống CSV取込 của アンケート (.ph + nút, stepper ngoài card, card có tiêu đề)'], 'reason': ['hong 2026/10/05「機種マスタ CSV取込の UI が異変。UI/UX 改善して」', 'hong 2026/10/05'], 'impact': ['MasterCsvImport の Frame・CsvUi.stepsInFrame', 'MasterCsvImport Frame; CsvUi.stepsInFrame']},
 {'ver': '1.3', 'date': '2026-10-05', 'no': ['2'], 'type': '削除', 'before': ['条件を変えて未反映のときに「検索」の横に「未適用」の印', 'Dấu 未適用 cạnh nút 検索 khi đổi điều kiện mà chưa áp dụng'], 'after': ['「未適用」の印は出さない（全部の一覧）', 'Không hiện dấu 未適用 (mọi danh sách)'], 'reason': ['hong 2026/10/05（画面設計書 HTML のコメント）・受付簿 #127', 'hong 2026/10/05, 受付簿 #127'], 'impact': ['ListView の UnappliedMark を出さない・P-LIST', 'Bỏ UnappliedMark ở ListView; P-LIST']},
 {'ver': '1.3', 'date': '2026-10-05', 'no': ['1', '1.1', '1.2', '1.3', '2', '2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2.7', '2.8', '2.9', '2.10', '2.11', '2.12', '2.13', '2.14', '2.15', '2.16', '2.17', '2.18', '2.19', '2.20', '2.21', '2.22', '3', '3.1', '3.2', '3.3', '3.4', '3.5', '3.6', '3.7', '3.8', '3.9', '3.10', '3.11', '3.12', '3.13', '3.14', '3.15', '3.16', '3.17', '3.18', '3.19', '3.20', '3.21', '3.22', '4', '4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '5', '5.1', '5.2', '5.3', '5.4', '5.5', '5.6'], 'type': '変更', 'before': ['CSV取込の画面に「CSVの列（テンプレートの定義）」の表を出す（項目 2・3.x）', 'Màn CSV取込 hiện bảng định nghĩa cột (mục 2, 3.x)'], 'after': ['列の定義は画面に出さない。CSVテンプレートの列（必須・長さ・チェック・データ例）を項目 2.x として設計書にだけ書く（入力画面と同じ定義）。ファイルを選ぶ＝3.x、確認・登録＝4.x に番号を詰めた', 'Không hiện bảng cột trên màn hình. Định nghĩa cột template (bắt buộc, độ dài, kiểm tra, ví dụ) chỉ ghi ở 設計書 (mục 2.x, như màn nhập). Chọn tệp = 3.x, xác nhận = 4.x'], 'reason': ['hong 2026/10/05「CSV テンプレは画面で表示ではなく、一覧に追加して…入力画面と同様に定義必要」・受付簿 #129', 'hong 2026/10/05, 受付簿 #129'], 'impact': ['画面から列の表のカードを外す（MasterCsvImport）。取込のチェックは 2.x のとおり', 'Bỏ card bảng cột khỏi màn hình (MasterCsvImport). Kiểm tra khi nhập theo 2.x']},
 {'ver': '1.2',
  'date': '2026-10-05',
  'no': ['*'],
  'type': '追加',
  'before': ['CSV取込はモーダル（一覧の状態）', 'Nhập CSV là modal (trạng thái của danh sách)'],
  'after': ['画面 AW_OPTN_004「CSV取込」（CSVの列の定義の表＋1 ファイルを選ぶ → 2 確認・登録）', 'Màn hình AW_OPTN_004 「CSV取込」 (bảng định nghĩa cột + bước 1 chọn tệp → bước 2 xác nhận)'],
  'reason': ['hong 2026/10/05（モーダルではなく画面・テンプレートの定義を書く）・受付簿 #89', 'hong 2026/10/05, 受付簿 #89'],
  'impact': ['モーダルを画面に。列の定義 API（csv.columns）・テンプレート CSV（docs/05_画面設計書/CSVテンプレート）', 'Modal → màn hình; API csv.columns; template CSV']},
 {'ver': '1.2',
  'date': '2026-10-05',
  'no': ['3.8', '4.8', '8', '8.1', '8.2', '8.3'],
  'type': '削除',
  'before': ['一覧の CSV取込モーダルの状態', 'Trạng thái modal CSV取込 ở danh sách'],
  'after': ['なし（CSV取込の画面へ）', 'Không (sang màn CSV取込)'],
  'reason': ['同上', 'Như trên'],
  'impact': ['なし', 'Không']},
 {'ver': '1.2',
  'date': '2026-10-05',
  'no': ['1',
         '1.1',
         '1.2',
         '1.3',
         '2',
         '2.1',
         '2.2',
         '3',
         '3.1',
         '3.2',
         '3.3',
         '3.4',
         '3.5',
         '3.6',
         '3.7',
         '3.8',
         '3.9',
         '3.10',
         '3.11',
         '3.12',
         '3.13',
         '3.14',
         '3.15',
         '3.16',
         '3.17',
         '3.18',
         '3.19',
         '3.20',
         '3.21',
         '3.22',
         '4',
         '4.1',
         '4.2',
         '4.3',
         '4.4',
         '5',
         '5.1',
         '5.2',
         '5.3',
         '5.4',
         '5.5',
         '5.6',
         '6',
         '7.4',
         '7.5'],
  'type': '変更',
  'before': ['版 1.1 の記載', 'Nội dung bản 1.1'],
  'after': ['hong の HTML コメント（2026/10/05）への対応：エラーの枠1行＋タブの印、詳細は表示だけ、削除済の行の見本、金額の右寄せ、CSV のエラーの行の扱い、区分の詳細、料金の改定なし、ページ送り・絞り込み、オプション区分マスタ・表示順なし・対象の「すべて」・A型の一覧 など（受付簿 #76〜#88）',
            'Theo các comment HTML của hong (2026/10/05): khung lỗi 1 dòng + đánh dấu tab, chi tiết chỉ xem, mẫu dòng đã xóa, căn phải tiền, xử lý dòng lỗi CSV, chi tiết theo loại, bỏ 料金の改定, phân '
            'trang / lọc, master loại option, bỏ 表示順, check 「すべて」, danh sách loại A (受付簿 #76〜#88)'],
  'reason': ['hong 2026/10/05（画面設計書 HTML のコメント）', 'hong 2026/10/05'],
  'impact': ['各項目の detail／demo_ok を参照（コードの宿題は受付簿）', 'Xem detail / demo_ok từng mục (宿題 code ở 受付簿)']},
 {'ver': '1.1',
  'date': '2026-10-05',
  'no': '*',
  'type': '追加',
  'before': ['—', '—'],
  'after': ['この機能の画面設計書を初めて渡す', 'Lần đầu giao 設計書 của chức năng này'],
  'reason': ['機種・オプション・値引きマスタを追加', 'Thêm 機種・オプション・値引きマスタ'],
  'impact': ['新規', 'Mới']}]

HIDE_ALWAYS = []
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [
    {"code": "AW_OPTN_001", "ja": "オプションマスタ一覧", "vi": "Danh sách option"},
    {"code": "AW_OPTN_002", "ja": "オプション詳細", "vi": "Chi tiết option"},
    {"code": "AW_OPTN_003", "ja": "オプション登録・編集", "vi": "Đăng ký / sửa option"},
    {"code": "AW_OPTN_004", "ja": "オプションマスタ CSV取込", "vi": "Nhập CSV option"},
]

def F(no, ja, vi, sel, kind, trig="view", **kw):
    d = {"no": no, "ja": ja, "vi": vi, "sel": sel, "kind": kind, "trig": trig}
    d.update(kw)
    return d

FULL = ["フル権限（ops.full）の役割だけに表示", "Chỉ hiện với vai trò フル権限 (ops.full)"]
H_SORT = ["並べ替えの UI は未実装（受付簿 #55）。コードはオプションID順。仕様が正", "Chưa có UI sắp xếp (受付簿 #55); code theo ID. Spec đúng"]
H_MAXLEN = ["入力欄に最大文字数の制御がない（宿題 H4）。仕様が正", "Ô nhập chưa giới hạn số ký tự (H4). Spec đúng"]
H_DELMSG = ["コードの文言「削除しますか？／削除済にします（…戻せません）」。Message List No.21 に合わせる（[msg]）", "Code dùng câu khác; dùng theo Message List No.21 ([msg])"]
H_EMPTY = ["コードの文言「条件に一致するデータがありません。…」。Message List No.24 に合わせる（[msg]）", "Code dùng câu khác; dùng theo Message List No.24 ([msg])"]
H_TAX = ["コードは 8%／10% の固定ボタン。税率マスタのドロップダウンにする（受付簿 #38）。仕様が正", "Code là 2 nút cố định 8%/10%; đổi thành dropdown 税率マスタ (受付簿 #38). Spec đúng"]

JS = ("const sleep=ms=>new Promise(r=>setTimeout(r,ms));"
      "const setv=(el,v)=>{const p=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;"
      "Object.getOwnPropertyDescriptor(p,'value').set.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}));};"
      "const sets=(el,v)=>{Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(el,v);el.dispatchEvent(new Event('change',{bubbles:true}));};"
      "const btn=t=>[...document.querySelectorAll('button')].find(b=>b.textContent.replace(/\\s+/g,'').includes(t));"
      "const q=s=>document.querySelector(s);")
CLEAR = JS + "if(btn('クリア')){btn('クリア').click();await sleep(400);}"
TAB = lambda name: JS + "[...document.querySelectorAll('.tabs [role=tab]')].find(b=>b.textContent.trim()==='%s').click();await sleep(500);" % name

# CSV取込のステップ2（確認・登録）：CSV出力と同じ列のデータ（op＝export：いまのデータ／template：ひな形）を API から取り、pick_re の列が入っている1行目の名前と金額を変えて（更新の見本）、キーが誤りの行を1つ足してファイルとして入れる（hong 2026/10/05「ステップ2はどこ？」）
CSVUP = lambda entity, op, pick_re, name_re, money_re: CLEAR + ("btn('CSV取込').click();await sleep(600);"
    "const res=await fetch('/api/domain/csv/%s',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json','x-es-site':'ops'},body:JSON.stringify({args:{entity:'%s',scope:{site:'ops'}}})});"
    "const t=await res.json();const esc=v=>'\"'+String(v??'').replace(/\"/g,'\"\"')+'\"';const rows=[t.head,...t.rows];"
    "const pi=t.head.findIndex(h=>/%s/.test(h)),ni=t.head.findIndex(h=>/%s/.test(h)),mi=t.head.findIndex(h=>/%s/.test(h));const r0=t.rows.find(r=>(pi<0||r[pi])&&(ni<0||r[ni]))||t.rows[0];if(ni>=0)r0[ni]=r0[ni]+' X';if(mi>=0&&r0[mi])r0[mi]=String((parseInt(String(r0[mi]).replace(/[^0-9]/g,''),10)||0)+100);"
    "const bad=t.rows[0].slice();bad[0]='XX999999';rows.push(bad);"
    "const text='\\ufeff'+rows.map(r=>r.map(esc).join(',')).join('\\r\\n');const inp=q('.mbox input[type=file]');const dt=new DataTransfer();dt.items.add(new File([text],'取込テスト.csv',{type:'text/csv'}));inp.files=dt.files;inp.dispatchEvent(new Event('change',{bubbles:true}));await sleep(2500);" % (op, entity, pick_re, name_re, money_re))

# ================================================================ AW_OPTN_001 一覧
LIST_HEADER = [
    F("1", "ヘッダー", "Đầu trang", ".es-pagehead", "area", detail=["パンくず（マスタ管理 / オプションマスタ）・画面名・操作ボタン。", "Breadcrumb (マスタ管理 / オプションマスタ), tên màn hình, nút thao tác."]),
    F("1.1", "パンくず", "Breadcrumb", ".es-breadcrumb", "label", detail=["「マスタ管理 / オプションマスタ」。リンクは動かない（表示だけ）。", "「マスタ管理 / オプションマスタ」. Chỉ hiển thị."]),
    F("1.2", "画面名", "Tên màn hình", ".es-pagehead__title", "label", detail=["「オプションマスタ一覧」", "Tiêu đề 「オプションマスタ一覧」"]),
    F("1.3", "CSV取込", "Nhập CSV", "button::CSV取込", "button", "click", cond=FULL, pattern="P-CSV",
      detail=["オプションマスタの CSV取込（AW_OPTN_004 の画面へ）。キーはオプションID（空欄＝新規・採番。A型は新規にできない）。列は詳細・編集の項目と同じ（CSV入出力_定義_20261003.md）。", "Nhập CSV option (sang màn AW_OPTN_004). Khóa = オプションID (trống = mới, cấp ID; loại A không tạo mới). Cột giống mục ở chi tiết/sửa."]),
    F("1.4", "CSV出力", "Xuất CSV", "button::CSV出力", "button", "click", detail=["検索条件のとおりの全件を、取込と同じ列で出力する。閲覧できる役割すべてに出す。", "Xuất toàn bộ theo điều kiện tìm kiếm, cùng cột với nhập. Hiện với mọi vai trò xem được."]),
    F("1.5", "新規登録", "Đăng ký mới", "button::新規登録", "button", "click", cond=FULL, detail=["AW_OPTN_003（新規登録）へ。", "Sang AW_OPTN_003 (đăng ký mới)."]),
]
LIST_SEARCH = [
    F("2", "検索条件", "Điều kiện tìm kiếm", ".es-search", "area", pattern="P-LIST",
      detail=["条件は「検索」か Enter で反映する。（「未適用」の印は出さない・hong 2026/10/05）", "Điều kiện áp dụng khi nhấn 検索 hoặc Enter; (không hiện dấu 未適用, hong 2026/10/05)."]),
    F("2.1", "キーワード", "Từ khóa", 'input[aria-label="オプションID、オプション名"]', "text", "input", req="－", len="文字列 60",
      init=["空", "Trống"], ex=["配送", "Tìm theo オプションID / 管理名, khớp một phần"], valid=["部分一致。全角・半角、大文字・小文字を区別しない。", "Khớp một phần, không phân biệt toàn/nửa góc, hoa/thường."], err=["E04"],
      detail=["オプションID・管理名（社内用）のどちらかに含まれる行。", "Lọc dòng có từ khóa trong オプションID hoặc 管理名（社内用）."]),
    F("2.2", "オプション区分", "Loại option", 'select[aria-label="オプション区分"]', "select", "select", req="－",
      len=["選択（オプション区分マスタの区分）", "Chọn (các loại trong master loại option)"], init=["未選択（先頭＝条件名）", "Chưa chọn (dòng đầu = tên điều kiện)"], ex=["配送", "Lọc theo loại"]),
    F("2.3", "連動タイプ", "Loại liên kết", 'select[aria-label="連動タイプ"]', "select", "select", req="－",
      len=["選択（A 契約項目に連動（システム定義）／連動しない）", "Chọn (A liên kết mục hợp đồng / không liên kết)"], init=["未選択", "Chưa chọn"], ex=["連動しない", "Lọc theo 連動タイプ"]),
    F("2.4", "公開ステータス", "Trạng thái công khai", 'select[aria-label="公開ステータス"]', "select", "select", req="－",
      len=["選択（公開／非公開）", "Chọn (công khai / không công khai)"], init=["未選択", "Chưa chọn"], ex=["公開", "Lọc theo trạng thái công khai"]),
    F("2.5", "利用状態", "Trạng thái sử dụng", 'select[aria-label="利用状態"]', "select", "select", req="－",
      len=["選択（使用中／終了／削除済）", "Chọn (đang dùng / kết thúc / đã xóa)"], init=["未選択", "Chưa chọn"], ex=["終了", "削除済 chỉ có kết quả khi bỏ check 2.6"],
      detail=["「削除済」を選ぶときは 2.6 のチェックも外す。", "Chọn 削除済 thì cũng bỏ check 2.6."]),
    F("2.6", "削除済みを表示しない", "Không hiện đã xóa", ".delchk", "check", "check", req="－", len=["チェック", "Checkbox"], init=["ON", "Bật"], ex=["ON", "Mặc định bật: ẩn option 削除済"],
      detail=["ON＝削除済を出さない（既定）。OFF にして検索すると削除済も出る（行はグレー・操作なし）。", "Bật = ẩn đã xóa (mặc định). Tắt rồi tìm thì hiện cả đã xóa (dòng xám, không thao tác)."]),
    F("2.7", "クリア", "Xóa điều kiện", "button::クリア", "button", "click", detail=["条件をすべて初期値に戻し、1ページ目から表示し直す。", "Đưa điều kiện về mặc định, hiện lại từ trang 1."]),
    F("2.8", "検索", "Tìm kiếm", ".es-search__actions button[type=submit]", "button", "click", detail=["条件を反映して1ページ目から表示。Enter でも同じ。", "Áp dụng điều kiện, hiện từ trang 1. Enter cũng vậy."]),
]
LIST_TABLE = [
    F("3", "一覧", "Danh sách", ".es-table-wrap", "table", pattern="P-LIST",
      detail=["初期の並び：登録日時の新しい順（マスタ項目一覧 #9・L-3）。削除済の行はグレーで操作を出さない。", "Thứ tự mặc định: mới đăng ký trước (マスタ項目一覧 #9). Dòng đã xóa màu xám, không có thao tác."], demo_ok=H_SORT),
    F("3.1", "オプションID", "Mã option", "th::オプションID", "link", "click", len=["文字列 OP＋6桁", "OP + 6 số"], detail=["クリックで AW_OPTN_002（詳細）へ。", "Nhấn sang AW_OPTN_002."]),
    F("3.2", "管理名（社内用）", "Tên quản lý (nội bộ)", "th::管理名（社内用）", "label", len="文字列 60"),
    F("3.3", "オプション区分", "Loại option", "th::オプション区分", "label"),
    F("3.4", "連動タイプ", "Loại liên kết", "th::連動タイプ", "label", detail=["A 契約項目に連動（システム定義）／連動しない。", "A liên kết mục hợp đồng (hệ thống định nghĩa) / không liên kết."]),
    F("3.5", "料金種別", "Loại phí", "th::料金種別", "label", detail=["月額料金／単発料金。", "月額料金 / 単発料金."]),
    F("3.6", "標準金額（税抜）", "Số tiền chuẩn (chưa thuế)", "th::標準金額（税抜）", "label", len=["金額＋「円」・右寄せ", "Số tiền + yên, căn phải"]),
    F("3.7", "公開ステータス", "Trạng thái công khai", "th::公開ステータス", "label", detail=["バッジ：公開＝緑、非公開＝灰。", "Badge: 公開 xanh, 非公開 xám."]),
    F("3.8", "利用状態", "Trạng thái sử dụng", "th::利用状態", "label", detail=["バッジ：使用中＝緑、終了＝灰、削除済＝灰（行もグレー）。", "Badge: 使用中 xanh, 終了 xám, 削除済 xám (dòng xám)."]),
    F("3.9", "適用中", "Đang áp dụng", "th::適用中", "label", len=["整数＋「拠点」", "Số nguyên + điểm"], detail=["今のサイクル月の子契約から数えた拠点数。", "Số điểm tính từ 子契約 của tháng chu kỳ hiện tại."]),
    F("3.10", "登録日時", "Ngày đăng ký", "th::登録日時", "label", len=["日時 yyyy-mm-dd HH:MM", "yyyy-mm-dd HH:MM"]),
    F("3.11", "操作", "Thao tác", "th::操作", "label", detail=["編集（鉛筆）・削除（ゴミ箱）。A型と削除済の行には削除を出さない。", "Sửa (bút chì), xóa (thùng rác). Loại A và dòng đã xóa không có nút xóa."]),
    F("3.12", "編集", "Sửa", 'button[aria-label$="を編集"]', "button", "click", cond=FULL, detail=["AW_OPTN_003（編集）へ。", "Sang AW_OPTN_003 (sửa)."]),
    F("3.13", "削除", "Xóa", 'button[aria-label$="を削除"]', "button", "click", cond=FULL, pattern="P-DEL", err=["Q01", "E37", "S02", "E33"],
      detail=["適用中 0拠点 なら状態 003（削除の確認）、あれば 004（削除できません）。A型には出さない。", "適用中 = 0 → trạng thái 003 (xác nhận xóa); đang dùng → 004 (không xóa được). Loại A không có."]),
    F("3.14", "並べ替え", "Sắp xếp", ".es-table thead", "select", "select", req="－",
      len=["選択（オプションID／管理名／オプション区分／利用状態／登録日時）＋ 昇順／降順", "Chọn cột (ID / tên / loại / trạng thái / ngày đăng ký) + tăng/giảm"],
      init=["登録日時 降順", "登録日時 giảm dần"], ex=["オプションID 昇順", "Chọn cột và chiều sắp xếp (STEP7 L2)"], detail=["STEP7 L2・マスタ項目一覧 #9。", "STEP7 L2, マスタ項目一覧 #9."], demo_ok=H_SORT),
]
LIST_PAGER = [
    F("4", "ページ送り", "Phân trang", ".es-pagination", "area", pattern="P-LIST"),
    F("4.1", "件数", "Số dòng", ".es-pagination__meta", "label", detail=["「n件中 a–b件」。0件は「0件」。", "「n件中 a–b件」. 0 dòng thì 「0件」."]),
    F("4.2", "前のページ", "Trang trước", 'button[aria-label="前のページ"]', "button", "click", cond=["1ページ目では非活性", "Trang 1 thì vô hiệu"]),
    F("4.3", "ページ番号", "Số trang", ".es-page.is-current", "button", "click", detail=["今のページは塗りつぶし。", "Trang hiện tại tô đậm."]),
    F("4.4", "次のページ", "Trang sau", 'button[aria-label="次のページ"]', "button", "click", cond=["最後のページでは非活性", "Trang cuối thì vô hiệu"]),
    F("4.5", "表示件数", "Số dòng/trang", 'select[aria-label="表示件数"]', "select", "select", req="－",
      len=["選択（10／20／50 件／ページ）", "Chọn (10 / 20 / 50 dòng/trang)"], init=["10件／ページ", "10 dòng/trang"], ex=["20件／ページ", "Đổi số dòng mỗi trang"], detail=["変えると1ページ目に戻る。", "Đổi thì về trang 1."]),
]
V_LIST = [
    {"id": "001", "code": "AW_OPTN_001", "state": ["初期表示", "Hiển thị ban đầu"], "url": "/ops/masters/options",
     "setup": CLEAR, "full": True, "wait": 500,
     "note": ["フル権限（Ad00010）で表示。ほかの役割では 1.3・1.5・3.12・3.13 が出ない。A型（OP000001〜003・035）の行には削除がない。", "Hiển thị với フル権限. Vai trò khác không có 1.3, 1.5, 3.12, 3.13. Dòng loại A (OP000001〜003, 035) không có nút xóa."],
     "items": LIST_HEADER + LIST_SEARCH + LIST_TABLE + LIST_PAGER},
    {"id": "002", "code": "AW_OPTN_001", "state": ["該当なし（0件）", "Không có kết quả (0 dòng)"], "url": "/ops/masters/options",
     "setup": CLEAR + "setv(q('.es-search__fields input'),'zzz');q('.es-search__actions button[type=submit]').click();await sleep(500);", "full": False, "wait": 400,
     "items": [F("5", "0件のメッセージ", "Thông báo 0 dòng", ".es-table tbody td[colspan]", "label", "show", err=["I01"], detail=["一覧の中に I01 を1行で出す。", "Hiện I01 trong bảng."], demo_ok=H_EMPTY)]},
    {"id": "003", "code": "AW_OPTN_001", "state": ["削除の確認", "Xác nhận xóa"], "url": "/ops/masters/options",
     "setup": CLEAR + "q('button[aria-label=\"設置代行（冷蔵庫）を削除\"]').click();await sleep(400);", "full": False, "wait": 400,
     "note": ["適用中 0拠点 のオプション（見本 OP000007 設置代行（冷蔵庫））のゴミ箱を押したとき。", "Khi nhấn thùng rác của option chưa áp dụng (mẫu OP000007)."],
     "items": [
         F("6", "削除の確認モーダル", "Modal xác nhận xóa", '.es-modal[aria-label="削除しますか？"]', "modal", "show", pattern="P-DEL", err=["Q01"], detail=["Q01（ボタン名＝削除）。本文にオプションID・管理名。", "Q01 (ボタン名 = 削除). Nội dung có ID, tên."], demo_ok=H_DELMSG),
         F("6.1", "本文", "Nội dung", ".es-modal__body", "label", detail=["Q01 ＋ 対象（OP000007 設置代行（冷蔵庫））。論理削除。", "Q01 + đối tượng (OP000007). Xóa logic."]),
         F("6.2", "キャンセル", "Hủy", ".es-modal__actions button::キャンセル", "button", "click", detail=["閉じる。何もしない。", "Đóng, không làm gì."]),
         F("6.3", "削除", "Xóa", ".es-modal__actions button::削除", "button", "click", err=["S02", "E33"], detail=["利用状態を「削除済」にし、S02 のトースト。一覧から消える（2.6 が ON）。", "Đổi 利用状態 thành 削除済, toast S02. Biến mất khỏi danh sách (khi 2.6 bật)."]),
     ]},
    {"id": "004", "code": "AW_OPTN_001", "state": ["削除できません", "Không xóa được"], "url": "/ops/masters/options",
     "setup": CLEAR + "q('button[aria-label=\"地域配送料を削除\"]').click();await sleep(400);", "full": False, "wait": 400,
     "note": ["適用中の拠点があるオプション（見本 OP000004 地域配送料・1拠点）のゴミ箱を押したとき。", "Khi nhấn thùng rác của option đang áp dụng (mẫu OP000004, 1 điểm)."],
     "items": [
         F("7", "削除できませんモーダル", "Modal không xóa được", '.es-modal[aria-label="削除できません"]', "modal", "show", err=["E37"], detail=["件数＝適用中の拠点数。終了にする案内。", "n = số điểm đang áp dụng. Hướng dẫn đổi 終了."]),
         F("7.1", "本文", "Nội dung", ".es-modal__body", "label", detail=["E37 ＋ 対象（OP000004 地域配送料）。", "E37 + đối tượng (OP000004)."]),
         F("7.2", "閉じる", "Đóng", ".es-modal__actions button::閉じる", "button", "click"),
     ]},

]

# ================================================================ AW_OPTN_002 詳細
D_HEADER = [
    F("1", "ヘッダー", "Đầu trang", ".phead", "area"),
    F("1.1", "パンくず", "Breadcrumb", ".crumb", "label", detail=["「マスタ管理 / オプションマスタ一覧 / オプション詳細」。", "「マスタ管理 / オプションマスタ一覧 / オプション詳細」."]),
    F("1.2", "画面名", "Tên màn hình", ".phead h2", "label", detail=["「オプション詳細」＋ オプションID。", "「オプション詳細」 + オプションID."]),
    F("1.3", "編集", "Sửa", ".pbtn button.save", "button", "click", cond=FULL, detail=["AW_OPTN_003（編集）へ。削除済では出さない。", "Sang AW_OPTN_003 (sửa). Đã xóa thì không hiện."]),
    F("1.4", "ヘッダーの操作ボタン", "Nút thao tác ở đầu trang", ".pbtn", "label", detail=["A型（システム定義）は「編集」だけ。連動しないオプションは「削除」「編集」（状態 007 の 6）。", "Loại A chỉ có 編集. Option 連動しない có 削除 và 編集 (mục 6 ở trạng thái 007)."]),
]
D_SUM = [
    F("2", "サマリー", "Tóm tắt", ".sumbar", "area", detail=["保存済みの値から作る。", "Tạo từ giá trị đã lưu."]),
    F("2.1", "オプションID", "Mã option", ".sumbar .s::オプションID", "label"),
    F("2.2", "オプション名", "Tên option", ".sumbar .s::オプション名", "label", detail=["管理名（社内用）。", "管理名（社内用）."]),
    F("2.3", "連動タイプ", "Loại liên kết", ".sumbar .s::連動タイプ", "label"),
    F("2.4", "料金種別", "Loại phí", ".sumbar .s::料金種別", "label"),
    F("2.5", "標準金額", "Số tiền chuẩn", ".sumbar .s::標準金額", "label", len=["金額＋「円」", "Số tiền + yên"]),
    F("2.6", "適用中", "Đang áp dụng", ".sumbar .s::適用中", "label", len=["整数＋「拠点」", "Số nguyên + điểm"]),
]
D_TABS = [
    F("3", "タブ", "Tab", ".tabs", "area", detail=["基本情報／料金／連動の確認・履歴。", "基本情報 / 料金 / 連動の確認・履歴."]),
    F("3.1", "基本情報", "Thông tin cơ bản", ".tabs [role=tab]::基本情報", "tab", "click"),
    F("3.2", "料金", "Phí", ".tabs [role=tab]::料金", "tab", "click"),
    F("3.3", "連動の確認・履歴", "Kiểm tra liên kết, lịch sử", ".tabs [role=tab]::連動の確認・履歴", "tab", "click"),
]
D_BASIC = [
    F("4", "基本情報", "Thông tin cơ bản", "#sec-0", "area", detail=["項目の決まりは AW_OPTN_003 の 3 を参照（ここは表示だけ）。", "Quy tắc mục xem AW_OPTN_003 mục 3 (ở đây chỉ xem)."]),
    F("4.1", "オプションID", "Mã option", '.f[data-name="オプションID"]', "label"),
    F("4.2", "管理名（社内用）", "Tên quản lý (nội bộ)", '.f[data-name="管理名（社内用）"]', "label"),
    F("4.3", "請求書表示名", "Tên trên hóa đơn", '.f[data-name="請求書表示名"]', "label"),
    F("4.4", "オプション区分", "Loại option", '.f[data-name="オプション区分"]', "label"),
    F("4.5", "公開ステータス", "Trạng thái công khai", '.f[data-name="公開ステータス"]', "label"),
    F("4.7", "説明", "Mô tả", '.f[data-name="説明"]', "label"),
    F("4.6", "利用状態", "Trạng thái sử dụng", '.f[data-name="利用状態"]', "label"),
    F("5", "契約項目との連動", "Liên kết với mục hợp đồng", "#sec-1", "area", detail=["AW_OPTN_003 の 4 を参照（表示だけ）。A型のときだけ 5.2〜5.4 が出る。", "Xem AW_OPTN_003 mục 4 (chỉ xem). Chỉ loại A mới có 5.2〜5.4."]),
    F("5.1", "連動タイプ", "Loại liên kết", '.f[data-name="連動タイプ"]', "label"),
    F("5.2", "連動する契約項目", "Mục hợp đồng liên kết", '.f[data-name="連動する契約項目"]', "label", detail=["システム定義（配送回数／ES-QR／ゲストモード／ユーザー現金利用）。A型のオプション1つに契約項目1つ。", "Hệ thống định nghĩa (配送回数 / ES-QR / ゲストモード / ユーザー現金利用). 1 option A = 1 mục hợp đồng."]),
    F("5.3", "連動条件", "Điều kiện liên kết", '.f[data-name="連動条件"]', "label", detail=["その項目がどの値のとき効くか（システム定義）。", "Mục đó có giá trị nào thì có hiệu lực (hệ thống định nghĩa)."]),
    F("5.4", "数量の取り方", "Cách lấy số lượng", '.f[data-name="数量の取り方"]', "label", detail=["固定1／契約項目の値そのまま／プラン標準を超えた分だけ（システム定義）。", "固定1 / theo giá trị mục hợp đồng / phần vượt chuẩn plan (hệ thống định nghĩa)."]),
]
V_DETAIL = [
    {"id": "006", "code": "AW_OPTN_002", "state": ["初期表示（A型・タブ 基本情報）", "Hiển thị ban đầu (loại A, tab 基本情報)"], "url": "/ops/masters/options/OP000001",
     "setup": "", "full": True, "wait": 600,
     "note": ["見本 OP000001 配送回数追加（A型）。ヘッダーに削除は出ない。", "Mẫu OP000001 (loại A). Header không có nút xóa."],
     "items": D_HEADER + D_SUM + D_TABS + D_BASIC},
    {"id": "007", "code": "AW_OPTN_002", "state": ["連動しないオプション（タブ 基本情報）", "Option 連動しない (tab 基本情報)"], "url": "/ops/masters/options/OP000004",
     "setup": JS + "window.scrollTo(0,q('#sec-1').offsetTop-200);", "full": False, "wait": 600,
     "note": ["見本 OP000004 地域配送料。ヘッダーに削除が出る。契約項目との連動は連動タイプだけ。", "Mẫu OP000004. Header có nút xóa. Card 連動 chỉ có 連動タイプ."],
     "items": [
         F("6", "削除（連動しないオプション）", "Xóa (option 連動しない)", ".pbtn button.del", "button", "click", cond=FULL, pattern="P-DEL", err=["Q01", "E37", "S02"], detail=["一覧の削除と同じ（Q01 → S02 → 一覧へ。適用中なら E37）。A型には出さない。", "Giống xóa ở danh sách (Q01 → S02 → về danh sách; đang dùng thì E37). Loại A không có."]),
         F("6.1", "契約項目との連動（連動しない）", "Liên kết (連動しない)", "#sec-1", "area", detail=["連動タイプ＝連動しない のときは 5.2〜5.4 を出さない。数量は子契約でつけるときに入れる。", "Khi 連動しない thì không có 5.2〜5.4. Số lượng nhập khi gắn ở 子契約."]),
     ]},
    {"id": "008", "code": "AW_OPTN_002", "state": ["タブ 料金", "Tab 料金"], "url": "/ops/masters/options/OP000001",
     "setup": TAB("料金") + "window.scrollTo(0,q('#sec-0').offsetTop-80);", "full": True, "wait": 400,
     "items": [
         F("7", "標準料金", "Phí chuẩn", "#sec-0", "area", detail=["AW_OPTN_003 の 5 を参照（表示だけ）。", "Xem AW_OPTN_003 mục 5 (chỉ xem)."]),
         F("7.1", "料金種別", "Loại phí", '.f[data-name="料金種別"]', "label"),
         F("7.2", "単位", "Đơn vị", '.f[data-name="単位"]', "label"),
         F("7.3", "金額の種類", "Loại số tiền", '.f[data-name="金額の種類"]', "label"),
         F("7.4", "対象のコース", "Course áp dụng", '.f[data-name="対象のコース"]', "label", detail=["「すべて」か、選んだコース。", "「すべて」 hoặc các course đã chọn."]),
         F("7.5", "対象の機種区分", "Loại thiết bị áp dụng", '.f[data-name="対象の機種区分"]', "label", detail=["「すべて」か、選んだ機種区分。", "「すべて」 hoặc các loại đã chọn."]),
         F("7.6", "承認", "Phê duyệt", '.f[data-name="承認"]', "label", detail=["特定の承認者は持たない（Q-E）。表示だけ。", "Không có người duyệt riêng (Q-E). Chỉ xem."]),
         F("7.7", "標準金額（税抜）", "Số tiền chuẩn (chưa thuế)", '.f[data-name="標準金額（税抜）"]', "label", len=["金額（税抜）", "Số tiền (chưa thuế)"]),
         F("7.8", "税率", "Thuế suất", '.f[data-name="税率"]', "label", demo_ok=H_TAX),
     ]},
    {"id": "009", "code": "AW_OPTN_002", "state": ["タブ 連動の確認・履歴", "Tab 連動の確認・履歴"], "url": "/ops/masters/options/OP000001",
     "setup": TAB("連動の確認・履歴") + "window.scrollTo(0,q('#sec-0').offsetTop-80);", "full": True, "wait": 400,
     "items": [
         F("8", "連動の確認", "Kiểm tra liên kết", "#sec-0", "area", detail=["A型だけに出す。", "Chỉ loại A."]),
         F("8.1", "連動の不一致を検知", "Phát hiện lệch liên kết", '.f[data-name="連動の不一致を検知"]', "label",
           detail=["契約項目の値と、いま立っている費目行が合わない拠点を日次バッチで検出した件数と内容。自動計上の取りこぼしの担保。", "Số điểm (và nội dung) mà giá trị mục hợp đồng không khớp dòng phí, phát hiện bằng batch hằng ngày."]),
         F("9", "履歴（オプションマスタ）", "Lịch sử (オプションマスタ)", "#sec-1", "table", detail=["オプションマスタの変更（手入力・CSV取込。標準金額の改定もここ）を新しい順に出す。", "Thay đổi của option (nhập tay, CSV; đổi 標準金額 cũng ở đây) mới nhất trước."]),
         F("9.1", "変更日時", "Thời điểm", "#sec-1 th::変更日時", "label", len=["日時 yyyy-mm-dd HH:MM", "yyyy-mm-dd HH:MM"]),
         F("9.2", "変更内容", "Nội dung", "#sec-1 th::変更内容", "label", detail=["項目名「変更前」→「変更後」。", "Tên mục 「trước」→「sau」."]),
         F("9.3", "変更者", "Người thay đổi", "#sec-1 th::変更者", "label"),
         F("9.4", "変更区分", "Loại thay đổi", "#sec-1 th::変更区分", "label", len=["手入力／CSV取込", "Nhập tay / nhập CSV"]),
     ]},
]

# ================================================================ AW_OPTN_003 登録・編集
N_HEADER = [
    F("1", "ヘッダー", "Đầu trang", ".phead", "area"),
    F("1.1", "パンくず", "Breadcrumb", ".crumb", "label", detail=["「マスタ管理 / オプションマスタ一覧 / オプション新規登録（または オプション編集）」。", "「マスタ管理 / オプションマスタ一覧 / オプション新規登録 (hoặc オプション編集)」."]),
    F("1.2", "画面名", "Tên màn hình", ".phead h2", "label", detail=["新規登録「オプション新規登録」、編集「オプション編集」＋オプションID。編集ではサマリー（AW_OPTN_002 の 2）も出す。", "Mới: 「オプション新規登録」; sửa: 「オプション編集」 + ID. Màn sửa có thêm summary."]),
    F("1.3", "キャンセル", "Hủy", ".pbtn button.cancel", "button", "click", err=["Q02"], detail=["入力を変えていれば Q02（状態 014）。一覧または詳細へ戻る。", "Đã sửa thì Q02 (trạng thái 014). Về danh sách hoặc chi tiết."]),
    F("1.4", "登録／保存", "Đăng ký / Lưu", ".pbtn button.save", "button", "click", pattern="P-FORMBOX", err=["S01", "E31", "E36"],
      detail=["新規登録「登録」・編集「保存」。全項目をまとめてチェック（必須 E01・数値 E14・文字数 E04）。通ったら S01、新規は採番した ID（OP＋6桁）の詳細へ、編集は詳細へ。削除済は E36。標準金額を変えたときは履歴に「変更前 → 変更後」を残す（料金バージョンは持たない・2026/09/28）。",
              "Mới: 「登録」; sửa: 「保存」. Kiểm tra mọi mục cùng lúc (E01, E14, E04). Qua thì S01; mới → chi tiết của ID vừa cấp (OP + 6 số), sửa → chi tiết. Đã xóa: E36. Đổi 標準金額 thì ghi lịch sử 「trước → sau」 (không có phiên bản giá, 2026/09/28)."]),
]
N_TABS = [F("2", "タブ", "Tab", ".tabs", "area", detail=["AW_OPTN_002 の 3 と同じ。保存時にエラーの項目がほかのタブにあれば、そのタブを開く。連動の確認・履歴は新規登録では空。", "Giống AW_OPTN_002 mục 3. Lỗi ở tab khác thì mở tab đó khi lưu. 連動の確認・履歴 ở màn mới thì trống."])]
N_BASIC = [
    F("3", "基本情報", "Thông tin cơ bản", "#sec-0", "area", pattern="P-FORMBOX"),
    F("3.1", "オプションID", "Mã option", '.f[data-name="オプションID"]', "label", len=["文字列 OP＋6桁", "OP + 6 số"], init=["新規「（登録時に採番）」／編集は採番済みの ID", "Mới: 「（登録時に採番）」; sửa: ID đã cấp"],
      detail=["システムが採番（OP＋6桁・連番）。採番後は変えない。物理名 option.no。", "Hệ thống cấp (OP + 6 số). Không đổi sau khi cấp. option.no."]),
    F("3.2", "管理名（社内用）", "Tên quản lý (nội bộ)", '.f[data-name="管理名（社内用）"] input', "text", "input", req="○", len="文字列 60", init=["空", "Trống"], ex=["設置代行（冷蔵庫）", "Tên dùng nội bộ, ở danh sách và tìm kiếm"], err=["E01", "E04", "E13"],
      detail=["社内で使う名前。一覧・検索はこの名前。物理名 option.name_admin。", "Tên nội bộ; danh sách và tìm kiếm dùng tên này. option.name_admin."], demo_ok=H_MAXLEN),
    F("3.3", "請求書表示名", "Tên trên hóa đơn", '.f[data-name="請求書表示名"] input', "text", "input", req="○", len="文字列 60", init=["空", "Trống"], ex=["設置代行", "Tên dòng phí trên hóa đơn; không trùng với dòng khác (vd OP000008 = 初期費用, OP000016 = 事務手数料)"], err=["E01", "E04", "E13", "W02"],
      detail=["請求書の費目名としてそのまま出る。同じ名前の行を2種類出さない（台帳：OP000008＝初期費用、OP000016＝事務手数料）。物理名 option.name_invoice。", "Hiện nguyên trên hóa đơn. Không để 2 loại dòng cùng tên (台帳). option.name_invoice."], demo_ok=H_MAXLEN),
    F("3.4", "オプション区分", "Loại option", '.f[data-name="オプション区分"] select', "select", "select", req="○",
      len=["選択（オプション区分マスタの使用中の区分。初期値：配送／アプリ機能／設置・作業／事務／ペナルティ）", "Chọn (các loại đang dùng trong master loại option; ban đầu: giao hàng / tính năng app / lắp đặt / hành chính / phạt)"], init=["未選択", "Chưa chọn"], ex=["設置・作業", "Dùng cho thứ tự và tổng hợp trên hóa đơn"], err=["E02"],
      detail=["オプション区分マスタ（名前・並び順。運営が足せる・hong 2026/10/05 B 案）から選ぶ。請求書の並び順と集計に使う。選択肢・請求書の並びは 区分の並び順 → オプションID（「表示順」の欄は持たない・hong 2026/10/05）。物理名 option.category_id。", "Chọn từ オプション区分マスタ (tên, thứ tự; 運営 thêm được, hong 2026/10/05 phương án B). Dùng cho thứ tự và tổng hợp trên hóa đơn. Thứ tự trong lựa chọn / hóa đơn = thứ tự loại → オプションID (không có ô 表示順, hong 2026/10/05). option.category_id."],
      demo_ok=["コードは固定の5つの選択肢（受付簿 #85・区分マスタは別画面として作る）。仕様が正", "Code là 5 lựa chọn cố định (受付簿 #85; master loại là màn hình riêng). Spec đúng"]),
    F("3.5", "公開ステータス", "Trạng thái công khai", '.f[data-name="公開ステータス"] select', "select", "select", req="○", len=["選択（公開／非公開）", "Chọn (công khai / không công khai)"], init=["公開", "公開 (công khai)"], ex=["非公開", "公開 = khách tự chọn trên 法人Web; 非公開 = chỉ 運営 chọn"],
      detail=["公開＝法人Webの申込・変更でお客様が自分で選べる。非公開＝運営だけが選べる（2026/10/01 統一）。物理名 option.public_status。", "公開 = khách tự chọn trên 法人Web; 非公開 = chỉ 運営 (thống nhất 2026/10/01). option.public_status."]),
    F("3.6", "利用状態", "Trạng thái sử dụng", '.f[data-name="利用状態"] select', "select", "select", req="○", len=["選択（使用中／終了）", "Chọn (đang dùng / kết thúc)"], init=["使用中", "使用中 (đang dùng)"], ex=["使用中", "終了 = không chọn mới; điểm đang áp dụng vẫn tính tiền"],
      detail=["終了にしても、すでに適用中の拠点はそのまま請求が続く（新規に選べなくなるだけ）。削除済は削除の操作で付く。物理名 option.status。", "終了 thì điểm đang áp dụng vẫn tính tiền, chỉ không chọn mới. 削除済 do thao tác xóa. option.status."]),
    F("3.7", "説明", "Mô tả", '.f[data-name="説明"] textarea', "textarea", "input", req="－", len=["文字列 500（複数行）", "Chuỗi 500 (nhiều dòng)"], init=["空", "Trống"], ex=["配送エリアによる。金額は拠点ごと", "Giải thích để 運営 chọn không nhầm; không hiện trên 法人Web"], err=["E04", "E13"],
      detail=["運営が選ぶときに迷わないための説明。法人Webには出さない。物理名 option.description。", "Mô tả nội bộ, không hiện trên 法人Web. option.description."], demo_ok=H_MAXLEN),
    F("4", "契約項目との連動", "Liên kết với mục hợp đồng", "#sec-1", "area", pattern="P-FORMBOX"),
    F("4.1", "連動タイプ", "Loại liên kết", '.f[data-name="連動タイプ"] select', "select", "select", req="○", len=["選択（A 契約項目に連動（システム定義）／連動しない）", "Chọn (A liên kết mục hợp đồng / không liên kết)"],
      init=["連動しない", "連動しない (không liên kết)"], ex=["連動しない", "Màn mới chỉ chọn được 連動しない; màn sửa không đổi được"],
      cond=["新規登録では「連動しない」だけ選べる。編集では変えられない", "Màn mới chỉ chọn 連動しない; màn sửa không đổi"],
      detail=["A型はシステムで先に定義する（2026/09/28）。A型の一覧（OP000001・002・003・035）は オプション・値引き_定義 §10（DECISIONS 参照）。A型の編集では 連動する契約項目・連動条件・数量の取り方 を表示だけで出す（AW_OPTN_002 の 5.2〜5.4）。物理名 option.link_type。", "Loại A do hệ thống định nghĩa trước (2026/09/28). Sửa loại A thì hiện 5.2〜5.4 chỉ xem. option.link_type."],
      demo_ok=["コードの新規登録では A も選べる（宿題）。仕様が正", "Màn mới của code vẫn chọn được A (宿題). Spec đúng"]),
]
N_FEE = [
    F("5", "標準料金", "Phí chuẩn", "#sec-0", "area", pattern="P-FORMBOX", detail=["請求額 ＝ 標準金額 × 数量（連動しないオプションの数量は子契約でつけるときに入れる）。", "Tiền = 標準金額 × số lượng (số lượng của option 連動しない nhập khi gắn ở 子契約)."]),
    F("5.1", "料金種別", "Loại phí", '.f[data-name="料金種別"] select', "select", "select", req="○", len=["選択（月額料金（継続）／単発料金（1回））", "Chọn (phí tháng liên tục / phí 1 lần)"], init=["月額料金（継続）", "月額料金（継続） (phí tháng)"], ex=["単発料金（1回）", "月額 = gắn 1 lần tính mãi (1 điểm 1 option); 単発 = 1 lần, gắn nhiều lần được"],
      detail=["子契約①の費目行の料金種別にそのまま入る。初期料金は単発料金にまとめた（2026/09/29）。物理名 option.fee_type。", "Vào 料金種別 của dòng phí ① 子契約. 初期料金 gộp vào 単発料金 (2026/09/29). option.fee_type."]),
    F("5.2", "単位", "Đơn vị", '.f[data-name="単位"] select', "select", "select", req="○", len=["選択（拠点／台／回／超過1単位（A型のみ））", "Chọn (điểm / máy / lần / 1 đơn vị vượt – chỉ A)"], init=["拠点", "拠点 (điểm)"], ex=["台", "Đơn vị số lượng hiện cạnh 数量 trên hóa đơn"],
      detail=["連動しないオプションでは数量の単位を表すだけ（請求書の「数量」の横に出る）。超過1単位は A型の配送回数追加だけ。物理名 option.unit。", "Với option 連動しない chỉ là đơn vị của số lượng (hiện cạnh 数量 trên hóa đơn). 超過1単位 chỉ cho A 配送回数追加. option.unit."]),
    F("5.3", "金額の種類", "Loại số tiền", '.f[data-name="金額の種類"] select', "select", "select", req="○",
      len=["選択（固定／最低額から／都度入力／拠点ごと／差額で決まる／機種参照）", "Chọn (cố định / từ mức tối thiểu / nhập từng lần / theo điểm / theo chênh lệch / tham chiếu master thiết bị)"], init=["固定", "固定 (cố định)"], ex=["機種参照（機種マスタの値・契約ごとに直せる）", "機種参照 cho OP000037 自販機リース, OP000008 初期費用"],
      detail=["都度入力・最低額から のときは、子契約でつけるときに金額を必須にする（標準金額は空でよい）。機種参照＝つけるとき機種マスタのその機種の金額が入り、契約ごとに直せる（台帳 B）。物理名 option.amount_kind。", "都度入力 / 最低額から: bắt buộc nhập tiền khi gắn ở 子契約 (標準金額 để trống được). 機種参照 = lấy tiền của máy từ 機種マスタ, sửa được theo hợp đồng (台帳 B). option.amount_kind."]),
    F("5.4", "対象のコース", "Course áp dụng", '.f[data-name="対象のコース"]', "check", "check", req="○", len=["チェック（すべて／ESスタンダード／ESライト（冷蔵庫）／ESライト（自販機））", "Checkbox (tất cả / ES Standard / ES Light tủ lạnh / ES Light máy bán hàng)"], init=["「すべて」ON", "「すべて」 bật"], ex=["ESライト（自販機）", "Bỏ 「すべて」 rồi chọn riêng; chỉ 自販機ラッピング, 特殊作業費 cho ES Light máy bán hàng"], err=["E02"],
      detail=["先頭の「すべて」が既定で ON。外すと個別のコースを選べる（1つも選ばないと E02）。一覧・詳細では「すべて」と出す。対象外のコースの拠点の子契約では選べない。物理名 option.target_courses（空＝すべて）。hong 2026/10/05 A 案。", "「すべて」 đầu tiên mặc định bật; bỏ thì chọn riêng (không chọn gì → E02). Danh sách / chi tiết hiện 「すべて」. Điểm thuộc course khác không chọn được. option.target_courses (trống = tất cả). hong 2026/10/05 phương án A."],
      demo_ok=["コードは「すべて」のチェックがない（空欄＝すべて・受付簿 #87）。仕様が正", "Code chưa có check 「すべて」 (受付簿 #87). Spec đúng"]),
    F("5.5", "対象の機種区分", "Loại thiết bị áp dụng", '.f[data-name="対象の機種区分"]', "check", "check", req="○", len=["チェック（すべて／冷蔵庫／冷凍庫／自販機／電子レンジ／資材ボックス）", "Checkbox (tất cả / tủ lạnh / tủ đông / máy bán hàng / lò vi sóng / hộp vật tư)"], init=["「すべて」ON", "「すべて」 bật"], ex=["自販機", "Bỏ 「すべて」 rồi chọn riêng; chỉ điểm đang mượn loại máy này mới thấy option"], err=["E02"],
      detail=["5.4 と同じ形（「すべて」が既定・外すと個別）。その機種区分の設備を借りている拠点だけに出す。物理名 option.target_model_kinds（空＝すべて）。", "Giống 5.4 (「すべて」 mặc định; bỏ thì chọn riêng). Chỉ điểm đang mượn loại máy đó mới thấy. option.target_model_kinds (trống = tất cả)."],
      demo_ok=["コードは「すべて」のチェックがない（受付簿 #87）。仕様が正", "Code chưa có check 「すべて」 (受付簿 #87). Spec đúng"]),
    F("5.6", "承認", "Phê duyệt", '.f[data-name="承認"]', "label", detail=["「権限のある運営管理者なら誰でも登録・承認できる」（表示だけ・Q-E）。画面から外してよい。", "「権限のある運営管理者なら誰でも登録・承認できる」 (chỉ xem, Q-E). Có thể bỏ khỏi màn hình."]),
    F("5.7", "標準金額（税抜）", "Số tiền chuẩn (chưa thuế)", '.f[data-name="標準金額（税抜）"] input', "text", "input", req="○", len=["金額（整数・0〜999,999,999・税抜）", "Số tiền (nguyên, chưa thuế)"], init=["空", "Trống"], ex=["15000", "Yên, chưa thuế; 0 cũng được"], err=["E01", "E14"],
      cond=["金額の種類＝都度入力・最低額から のときは空でもよい", "Để trống được khi 金額の種類 = 都度入力 / 最低額から"],
      detail=["円（税抜・2026/09/25）。改定は上書きし、変更履歴で管理する（料金バージョンは持たない）。請求済みの子契約は変わらない。0円も登録できる。物理名 option.amount。", "Yên chưa thuế (2026/09/25). Đổi giá = ghi đè, quản lý bằng lịch sử (không có phiên bản). 子契約 đã tính tiền không đổi. 0 cũng được. option.amount."]),
    F("5.8", "税率", "Thuế suất", '.f[data-name="税率"]', "select", "select", req="○", len=["選択（税率マスタ）", "Chọn (master thuế suất)"], init=["10%", "10%"], ex=["10%", "Thuế suất của 標準金額"],
      detail=["税率マスタから選ぶ（既定 10%・台帳 E）。物理名 option.tax_rate_id。", "Chọn từ 税率マスタ (mặc định 10%, 台帳 E). option.tax_rate_id."], demo_ok=H_TAX),
]
V_FORM = [
    {"id": "010", "code": "AW_OPTN_003", "state": ["新規登録 初期表示（タブ 基本情報）", "Đăng ký mới (tab 基本情報)"], "url": "/ops/masters/options/new",
     "setup": "", "full": True, "wait": 600,
     "note": ["フル権限だけが開ける。入力の共通基準（空白・全角→半角・文字数）は P-FORMBOX。", "Chỉ フル権限 mở được. Quy tắc nhập chung xem P-FORMBOX."],
     "items": N_HEADER + N_TABS + N_BASIC},
    {"id": "011", "code": "AW_OPTN_003", "state": ["新規登録 タブ 料金", "Đăng ký mới, tab 料金"], "url": "/ops/masters/options/new",
     "setup": TAB("料金") + "window.scrollTo(0,q('#sec-0').offsetTop-80);", "full": True, "wait": 400, "items": N_FEE},
    {"id": "012", "code": "AW_OPTN_003", "state": ["新規登録 入力エラー", "Đăng ký mới, lỗi nhập"], "url": "/ops/masters/options/new",
     "setup": JS + "q('.pbtn button.save').click();await sleep(600);window.scrollTo(0,0);", "full": True, "wait": 400,
     "note": ["何も入れずに「登録」を押したとき。エラーの項目は赤枠＋項目の下に文言、見出しの下に「保存できません（n件）」（P-FORMBOX）。", "Nhấn 登録 khi chưa nhập gì. Mục lỗi viền đỏ + câu lỗi dưới mục, dưới tiêu đề 「保存できません（n件）」."],
     "items": [
         F("6", "エラーの枠", "Khung lỗi", ".vbox", "label", "show", pattern="P-FORMBOX", err=["E01", "E14", "E04"],
           detail=["見出しの下の赤い枠は「保存できません（n件）。赤い項目を確認してください」の1行だけ（一覧は出さない・A 案 hong 2026/10/05）。エラーのあるタブの見出しに赤い印。", "Khung đỏ dưới tiêu đề chỉ 1 dòng 「保存できません（n件）。赤い項目を確認してください」 (không liệt kê, phương án A hong 2026/10/05). Tab có lỗi đánh dấu đỏ."],
           demo_ok=["コードのチェックは必須の一部だけ（宿題 H3）。仕様が正", "Code mới kiểm tra một phần (H3). Spec đúng"]),
         F("6.1", "項目の下のエラー", "Lỗi dưới mục", ".f.verr", "label", "show", err=["E01"], detail=["エラーの項目に赤い枠＋項目の下に文言。最初のエラーがほかのタブならそのタブを開く。", "Mục lỗi: viền đỏ + câu lỗi dưới mục. Lỗi đầu ở tab khác thì mở tab đó."]),
     ]},
    {"id": "013", "code": "AW_OPTN_003", "state": ["編集 初期表示（A型）", "Sửa, hiển thị ban đầu (loại A)"], "url": "/ops/masters/options/OP000001/edit",
     "setup": JS + "window.scrollTo(0,q('#sec-1').offsetTop-300);", "full": True, "wait": 600,
     "note": ["見本 OP000001（A型）。新規登録と同じフォームに保存済みの値が入る。違い：画面名「オプション編集」＋ID、サマリー、ボタン「保存」、連動タイプは変えられず、連動の3項目は表示だけ。", "Mẫu OP000001 (loại A). Cùng form với đăng ký mới nhưng có giá trị đã lưu. Khác: tiêu đề 「オプション編集」 + ID, summary, nút 保存, không đổi 連動タイプ, 3 mục liên kết chỉ xem."],
     "items": [
         F("7", "ヘッダー（編集）", "Đầu trang (sửa)", ".phead", "area", detail=["1 と同じ。画面名「オプション編集 OP000001」、右に キャンセル・保存。", "Giống mục 1. Tiêu đề 「オプション編集 OP000001」, nút キャンセル・保存."]),
         F("7.1", "サマリー", "Tóm tắt", ".sumbar", "label", detail=["AW_OPTN_002 の 2 と同じ。", "Giống AW_OPTN_002 mục 2."]),
         F("7.2", "保存", "Lưu", ".pbtn button.save", "button", "click", pattern="P-FORMBOX", err=["S01", "E31", "E36"], detail=["1.4 と同じ。保存後は詳細へ。", "Giống 1.4. Lưu xong về chi tiết."]),
         F("7.3", "連動タイプ（編集）", "Loại liên kết (sửa)", '.f[data-name="連動タイプ"] select', "label", detail=["非活性（変えられない）。", "Vô hiệu (không đổi được)."]),
         F("7.4", "連動する契約項目・連動条件・数量の取り方", "3 mục liên kết (A)", '.f[data-name="連動する契約項目"]', "label", detail=["A型のときだけ表示（システム定義・変更不可）。", "Chỉ loại A, chỉ xem (hệ thống định nghĩa)."]),
     ]},
    {"id": "014", "code": "AW_OPTN_003", "state": ["編集内容を破棄しますか（モーダル）", "Hủy nội dung đã sửa (modal)"], "url": "/ops/masters/options/OP000004/edit",
     "setup": JS + "setv(q('.f[data-name=\"管理名（社内用）\"] input'),'地域配送料X');await sleep(200);q('.pbtn button.cancel').click();await sleep(400);", "full": False, "wait": 400,
     "note": ["入力を変えたあとに キャンセル（または ほかの画面へ移動・ブラウザを閉じる／再読み込み）。全サイト共通（台帳 F）。", "Đã sửa rồi nhấn キャンセル (hoặc chuyển trang, đóng/tải lại). Toàn hệ thống (台帳 F)."],
     "items": [
         F("8", "破棄の確認モーダル", "Modal xác nhận hủy", '.es-modal[aria-label="編集内容を破棄しますか？"]', "modal", "show", pattern="P-FORMBOX", err=["Q02"]),
         F("8.1", "本文", "Nội dung", ".es-modal__body", "label", detail=["Q02（Message List No.25）。", "Q02 (Message List No.25)."]),
         F("8.2", "キャンセル", "Hủy", ".es-modal__actions button::キャンセル", "button", "click", detail=["閉じて編集を続ける。", "Đóng, tiếp tục sửa."]),
         F("8.3", "破棄", "Bỏ", ".es-modal__actions button::破棄", "button", "click", detail=["入力を捨てて移動する。", "Bỏ nội dung đã nhập và chuyển trang."]),
     ]},
]

# ================================================================ CSV取込（画面・hong 2026/10/05）。列の定義（sel "-"＝画面には出さない）は API（csv.columns）＋入力画面の項目＋CSVテンプレートから scratchpad/gen_csv2.py で作った
V_CSV = [
    {'id': '016', 'code': 'AW_OPTN_004', 'state': ['初期表示（ステップ1 ファイルを選ぶ）', 'Hiển thị ban đầu (bước 1 chọn tệp)'], 'url': '/ops/masters/options/import', 'setup': '', 'full': True, 'wait': 1200, 'note': ['フル権限（CSV取込の権限）だけが開ける（ほかの役割は一覧へ）。見出し → ファイルを選ぶ。列の定義（2.x）は画面には出さない（hong 2026/10/05）。モーダルではなく画面。', 'Chỉ vai trò có quyền CSV取込 mở được. Tiêu đề → chọn tệp. Định nghĩa cột (2.x) không hiện trên màn hình (hong 2026/10/05). Là màn hình, không phải modal.'], 'items': [{'no': '1', 'ja': 'ヘッダー', 'vi': 'Đầu trang', 'sel': '.csvph', 'kind': 'area', 'trig': 'view'}, {'no': '1.1', 'ja': 'パンくず', 'vi': 'Breadcrumb', 'sel': '.crumb', 'kind': 'label', 'trig': 'view', 'detail': ['「マスタ管理 / オプションマスタ一覧 / オプションマスタ CSV取込」。一覧はリンク。', '「マスタ管理 / …一覧 / オプションマスタ CSV取込」. Danh sách là link.']}, {'no': '1.2', 'ja': '画面名', 'vi': 'Tên màn hình', 'sel': '.csvph h1', 'kind': 'label', 'trig': 'view', 'detail': ['「オプションマスタ CSV取込」', 'Tiêu đề 「オプションマスタ CSV取込」']}, {'no': '1.3', 'ja': 'キャンセル', 'vi': 'Hủy', 'sel': '.csvph .btns button.out::キャンセル', 'kind': 'button', 'trig': 'click', 'detail': ['一覧へ戻る（何も登録しない）。見出しの右のボタン（アンケートの CSV取込と同じ）。', 'Về danh sách (không đăng ký gì). Nút bên phải tiêu đề.']}, {'no': '2', 'ja': 'CSVテンプレートの列（定義。画面には出さない）', 'vi': 'Các cột của CSV template (định nghĩa; không hiện trên màn hình)', 'sel': '-', 'kind': 'area', 'trig': 'view', 'detail': ['取り込むファイルの列の定義（1行目の見出し・この順。CSV出力と同じ列）。テンプレートの写しは docs/05_画面設計書/CSVテンプレート/options.csv。キー＝オプションID（空欄＝新規・採番）。UTF-8（BOM 可）・5,000行まで。空欄のセルは今の値のまま、「-」で消す。2.1〜 の必須・長さ・チェックは入力画面の項目と同じ（違うところだけ書く）。画面には出さない（hong 2026/10/05）。', 'Định nghĩa cột của tệp nhập (dòng 1 = tiêu đề, theo thứ tự này; cùng cột với CSV出力). Bản mẫu: docs/05_画面設計書/CSVテンプレート/options.csv. Khóa = オプションID (trống = mới, cấp ID). UTF-8 (có BOM được), tối đa 5.000 dòng. Ô trống giữ giá trị cũ, "-" để xóa. Bắt buộc / độ dài / kiểm tra của 2.1〜 giống mục nhập trên màn hình (chỉ ghi chỗ khác). Không hiện trên màn hình (hong 2026/10/05).']}, {'no': '2.1', 'ja': 'オプションID', 'vi': 'Mã option', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '－', 'len': ['文字列 OP＋6桁', 'OP + 6 số'], 'valid': ['画面の項目と同じチェック。', 'Kiểm tra như mục trên màn hình.'], 'detail': ['【空欄＝新規（採番）】画面の項目 3.1「オプションID」と同じ。', '【空欄＝新規（採番）】  Giống mục 3.1 「オプションID」 trên màn hình.'], 'ex': ['OP000001', 'Giá trị như ở tệp CSV出力 (docs/05_画面設計書/CSVテンプレート)'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)']}, {'no': '2.2', 'ja': '管理名（社内用）', 'vi': 'Tên quản lý (nội bộ)', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '○', 'len': ['文字列 60', 'Chuỗi 60'], 'valid': ['新規の行で必須。更新の行は空欄＝今の値のまま。「-」で消せる。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; ghi "-" để xóa giá trị.'], 'detail': ['画面の項目 3.2「管理名（社内用）」と同じ。', 'Giống mục 3.2 「管理名（社内用）」 trên màn hình.'], 'ex': ['設置代行（冷蔵庫）', 'Tên dùng nội bộ, ở danh sách và tìm kiếm'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01', 'E04', 'E13']}, {'no': '2.3', 'ja': '請求書表示名', 'vi': 'Tên trên hóa đơn', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '○', 'len': ['文字列 60', 'Chuỗi 60'], 'valid': ['新規の行で必須。更新の行は空欄＝今の値のまま。「-」で消せる。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; ghi "-" để xóa giá trị.'], 'detail': ['画面の項目 3.3「請求書表示名」と同じ。', 'Giống mục 3.3 「請求書表示名」 trên màn hình.'], 'ex': ['設置代行', 'Tên dòng phí trên hóa đơn; không trùng với dòng khác (vd OP000008 = 初期費用, OP000016 = 事務手数料)'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01', 'E04', 'E13']}, {'no': '2.4', 'ja': 'オプション区分', 'vi': 'Loại option', 'sel': '-', 'kind': 'select', 'trig': 'input', 'req': '○', 'len': ['選択（オプション区分マスタの使用中の区分。初期値：配送／アプリ機能／設置・作業／事務／ペナルティ）', 'Chọn (các loại đang dùng trong master loại option; ban đầu: giao hàng / tính năng app / lắp đặt / hành chính / phạt)'], 'valid': ['新規の行で必須。更新の行は空欄＝今の値のまま。選択：配送／アプリ機能／設置・作業／事務／ペナルティ（それ以外はエラー）。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; chọn 1 trong: 配送 / アプリ機能 / 設置・作業 / 事務 / ペナルティ (khác thì lỗi).'], 'detail': ['画面の項目 3.4「オプション区分」と同じ。', 'Giống mục 3.4 「オプション区分」 trên màn hình.'], 'ex': ['設置・作業', 'Dùng cho thứ tự và tổng hợp trên hóa đơn'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01', 'E02']}, {'no': '2.5', 'ja': '公開ステータス', 'vi': 'Trạng thái công khai', 'sel': '-', 'kind': 'select', 'trig': 'input', 'req': '○', 'len': ['選択（公開／非公開）', 'Chọn (công khai / không công khai)'], 'valid': ['新規の行で必須。更新の行は空欄＝今の値のまま。選択：公開／非公開（それ以外はエラー）。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; chọn 1 trong: 公開 / 非公開 (khác thì lỗi).'], 'detail': ['画面の項目 3.5「公開ステータス」と同じ。', 'Giống mục 3.5 「公開ステータス」 trên màn hình.'], 'ex': ['非公開', '公開 = khách tự chọn trên 法人Web; 非公開 = chỉ 運営 chọn'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01']}, {'no': '2.6', 'ja': '利用状態', 'vi': 'Trạng thái sử dụng', 'sel': '-', 'kind': 'select', 'trig': 'input', 'req': '○', 'len': ['選択（使用中／終了）', 'Chọn (đang dùng / kết thúc)'], 'valid': ['新規の行で必須。更新の行は空欄＝今の値のまま。選択：使用中／終了（それ以外はエラー）。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; chọn 1 trong: 使用中 / 終了 (khác thì lỗi).'], 'detail': ['画面の項目 3.6「利用状態」と同じ。', 'Giống mục 3.6 「利用状態」 trên màn hình.'], 'ex': ['使用中', '終了 = không chọn mới; điểm đang áp dụng vẫn tính tiền'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01']}, {'no': '2.7', 'ja': '説明', 'vi': 'Mô tả', 'sel': '-', 'kind': 'textarea', 'trig': 'input', 'req': '－', 'len': ['文字列 500（複数行）', 'Chuỗi 500 (nhiều dòng)'], 'valid': ['「-」で消せる。', 'ghi "-" để xóa giá trị.'], 'detail': ['画面の項目 3.7「説明」と同じ。', 'Giống mục 3.7 「説明」 trên màn hình.'], 'ex': ['配送エリアによる。金額は拠点ごと', 'Giải thích để 運営 chọn không nhầm; không hiện trên 法人Web'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E04', 'E13']}, {'no': '2.8', 'ja': '連動タイプ', 'vi': 'Loại liên kết', 'sel': '-', 'kind': 'select', 'trig': 'input', 'req': '○', 'len': ['選択（A 契約項目に連動（システム定義）／連動しない）', 'Chọn (A liên kết mục hợp đồng / không liên kết)'], 'valid': ['新規の行で必須。更新の行は空欄＝今の値のまま。選択：A 契約項目に連動（システム定義）／連動しない（それ以外はエラー）。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; chọn 1 trong: A 契約項目に連動（システム定義） / 連動しない (khác thì lỗi).'], 'detail': ['画面の項目 4.1「連動タイプ」と同じ。', 'Giống mục 4.1 「連動タイプ」 trên màn hình.'], 'ex': ['連動しない', 'Màn mới chỉ chọn được 連動しない; màn sửa không đổi được'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01']}, {'no': '2.9', 'ja': '連動する契約項目', 'vi': 'Mục hợp đồng liên kết', 'sel': '-', 'kind': 'label', 'trig': 'view', 'req': '－', 'len': ['文字列', 'Chuỗi'], 'valid': ['出力だけ。取込では読まない（書いてあっても無視）。「-」で消せる。', 'chỉ xuất; nhập không đọc (có ghi cũng bỏ qua); ghi "-" để xóa giá trị.'], 'detail': ['画面の項目 5.2「連動する契約項目」と同じ。', 'Giống mục 5.2 「連動する契約項目」 trên màn hình.']}, {'no': '2.10', 'ja': '連動条件', 'vi': 'Điều kiện liên kết', 'sel': '-', 'kind': 'label', 'trig': 'view', 'req': '－', 'len': ['文字列', 'Chuỗi'], 'valid': ['出力だけ。取込では読まない（書いてあっても無視）。「-」で消せる。', 'chỉ xuất; nhập không đọc (có ghi cũng bỏ qua); ghi "-" để xóa giá trị.'], 'detail': ['画面の項目 5.3「連動条件」と同じ。', 'Giống mục 5.3 「連動条件」 trên màn hình.']}, {'no': '2.11', 'ja': '数量の取り方', 'vi': 'Cách lấy số lượng', 'sel': '-', 'kind': 'label', 'trig': 'view', 'req': '－', 'len': ['文字列', 'Chuỗi'], 'valid': ['出力だけ。取込では読まない（書いてあっても無視）。「-」で消せる。', 'chỉ xuất; nhập không đọc (có ghi cũng bỏ qua); ghi "-" để xóa giá trị.'], 'detail': ['画面の項目 5.4「数量の取り方」と同じ。', 'Giống mục 5.4 「数量の取り方」 trên màn hình.']}, {'no': '2.12', 'ja': '料金種別', 'vi': 'Loại phí', 'sel': '-', 'kind': 'select', 'trig': 'input', 'req': '○', 'len': ['選択（月額料金（継続）／単発料金（1回））', 'Chọn (phí tháng liên tục / phí 1 lần)'], 'valid': ['新規の行で必須。更新の行は空欄＝今の値のまま。選択：月額料金（継続）／単発料金（1回）（それ以外はエラー）。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; chọn 1 trong: 月額料金（継続） / 単発料金（1回） (khác thì lỗi).'], 'detail': ['画面の項目 5.1「料金種別」と同じ。', 'Giống mục 5.1 「料金種別」 trên màn hình.'], 'ex': ['単発料金（1回）', '月額 = gắn 1 lần tính mãi (1 điểm 1 option); 単発 = 1 lần, gắn nhiều lần được'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01']}, {'no': '2.13', 'ja': '単位', 'vi': 'Đơn vị', 'sel': '-', 'kind': 'select', 'trig': 'input', 'req': '○', 'len': ['選択（拠点／台／回／超過1単位（A型のみ））', 'Chọn (điểm / máy / lần / 1 đơn vị vượt – chỉ A)'], 'valid': ['新規の行で必須。更新の行は空欄＝今の値のまま。選択：拠点／台／回／超過1単位（A型のみ）（それ以外はエラー）。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; chọn 1 trong: 拠点 / 台 / 回 / 超過1単位（A型のみ） (khác thì lỗi).'], 'detail': ['画面の項目 5.2「単位」と同じ。', 'Giống mục 5.2 「単位」 trên màn hình.'], 'ex': ['台', 'Đơn vị số lượng hiện cạnh 数量 trên hóa đơn'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01']}, {'no': '2.14', 'ja': '金額の種類', 'vi': 'Loại số tiền', 'sel': '-', 'kind': 'select', 'trig': 'input', 'req': '○', 'len': ['選択（固定／最低額から／都度入力／拠点ごと／差額で決まる／機種参照）', 'Chọn (cố định / từ mức tối thiểu / nhập từng lần / theo điểm / theo chênh lệch / tham chiếu master thiết bị)'], 'valid': ['新規の行で必須。更新の行は空欄＝今の値のまま。選択：固定／最低額から（〇〇円～）／都度入力／拠点ごと／差額で決まる／機種参照（機種マスタの値・契約ごとに直せる）（それ以外はエラー）。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; chọn 1 trong: 固定 / 最低額から（〇〇円～） / 都度入力 / 拠点ごと / 差額で決まる / 機種参照（機種マスタの値・契約ごとに直せる） (khác thì lỗi).'], 'detail': ['画面の項目 5.3「金額の種類」と同じ。', 'Giống mục 5.3 「金額の種類」 trên màn hình.'], 'ex': ['機種参照（機種マスタの値・契約ごとに直せる）', '機種参照 cho OP000037 自販機リース, OP000008 初期費用'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01']}, {'no': '2.15', 'ja': '対象のコース', 'vi': 'Course áp dụng', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '－', 'len': ['1／0', '1 / 0'], 'valid': ['画面の項目と同じチェック。', 'Kiểm tra như mục trên màn hình.'], 'detail': ['画面の項目 5.4「対象のコース」と同じ。', 'Giống mục 5.4 「対象のコース」 trên màn hình.'], 'ex': ['ESライト（自販機）', 'Bỏ 「すべて」 rồi chọn riêng; chỉ 自販機ラッピング, 特殊作業費 cho ES Light máy bán hàng'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E02']}, {'no': '2.16', 'ja': '対象の機種区分', 'vi': 'Loại thiết bị áp dụng', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '－', 'len': ['1／0', '1 / 0'], 'valid': ['画面の項目と同じチェック。', 'Kiểm tra như mục trên màn hình.'], 'detail': ['画面の項目 5.5「対象の機種区分」と同じ。', 'Giống mục 5.5 「対象の機種区分」 trên màn hình.'], 'ex': ['自販機', 'Bỏ 「すべて」 rồi chọn riêng; chỉ điểm đang mượn loại máy này mới thấy option'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E02']}, {'no': '2.17', 'ja': '承認', 'vi': 'Phê duyệt', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '－', 'len': ['文字列', 'Chuỗi'], 'valid': ['「-」で消せる。', 'ghi "-" để xóa giá trị.'], 'detail': ['画面の項目 5.6「承認」と同じ。', 'Giống mục 5.6 「承認」 trên màn hình.'], 'ex': ['権限のある運営管理者なら誰でも登録・承認できる', 'Giá trị như ở tệp CSV出力 (docs/05_画面設計書/CSVテンプレート)'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)']}, {'no': '2.18', 'ja': '標準金額（税抜）', 'vi': 'Số tiền chuẩn (chưa thuế)', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '○', 'len': ['金額（整数・0〜999,999,999・税抜）', 'Số tiền (nguyên, chưa thuế)'], 'valid': ['新規の行で必須。更新の行は空欄＝今の値のまま。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ.'], 'detail': ['画面の項目 5.7「標準金額（税抜）」と同じ。', 'Giống mục 5.7 「標準金額（税抜）」 trên màn hình.'], 'ex': ['15000', 'Yên, chưa thuế; 0 cũng được'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01', 'E14']}, {'no': '2.19', 'ja': '税率', 'vi': 'Thuế suất', 'sel': '-', 'kind': 'select', 'trig': 'input', 'req': '○', 'len': ['選択（税率マスタ）', 'Chọn (master thuế suất)'], 'valid': ['新規の行で必須。更新の行は空欄＝今の値のまま。選択：8%（軽減）／10%（それ以外はエラー）。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; chọn 1 trong: 8%（軽減） / 10% (khác thì lỗi).'], 'detail': ['画面の項目 5.8「税率」と同じ。', 'Giống mục 5.8 「税率」 trên màn hình.'], 'ex': ['10%', 'Thuế suất của 標準金額'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01']}, {'no': '2.20', 'ja': '連動の不一致を検知', 'vi': 'Phát hiện lệch liên kết', 'sel': '-', 'kind': 'label', 'trig': 'view', 'req': '－', 'len': ['文字列', 'Chuỗi'], 'valid': ['出力だけ。取込では読まない（書いてあっても無視）。「-」で消せる。', 'chỉ xuất; nhập không đọc (có ghi cũng bỏ qua); ghi "-" để xóa giá trị.'], 'detail': ['画面の項目 8.1「連動の不一致を検知」と同じ。', 'Giống mục 8.1 「連動の不一致を検知」 trên màn hình.']}, {'no': '2.21', 'ja': '使用中の件数', 'vi': 'Số đang dùng', 'sel': '-', 'kind': 'label', 'trig': 'view', 'req': '－', 'len': ['整数', 'Số nguyên'], 'valid': ['出力だけ。取込では読まない（書いてあっても無視）。', 'chỉ xuất; nhập không đọc (có ghi cũng bỏ qua).'], 'detail': ['出力だけの列（取込では読まない）。', 'Cột chỉ xuất (nhập không đọc).']}, {'no': '2.22', 'ja': '削除済(1=削除済)', 'vi': 'Đã xóa (1 = đã xóa)', 'sel': '-', 'kind': 'label', 'trig': 'view', 'req': '－', 'len': ['1／0', '1 / 0'], 'valid': ['出力だけ。取込では読まない（書いてあっても無視）。', 'chỉ xuất; nhập không đọc (có ghi cũng bỏ qua).'], 'detail': ['出力だけの列（取込では読まない）。', 'Cột chỉ xuất (nhập không đọc).']}, {'no': '3', 'ja': 'ファイルを選ぶ（ステップ1）', 'vi': 'Chọn tệp (bước 1)', 'sel': '#sec-csv', 'kind': 'area', 'trig': 'view', 'pattern': 'P-CSV'}, {'no': '3.1', 'ja': '手順', 'vi': 'Các bước', 'sel': '.steps', 'kind': 'label', 'trig': 'view', 'detail': ['1 ファイルを選ぶ → 2 確認・登録（カードの外・中央。アンケートの CSV取込と同じ）。今の手順を濃く、済んだ手順を緑に。', '1 chọn tệp → 2 xác nhận・đăng ký (ngoài card, giữa trang; giống CSV取込 của アンケート). Bước hiện tại tô đậm, bước xong màu xanh.']}, {'no': '3.2', 'ja': '説明', 'vi': 'Giải thích', 'sel': '#sec-csv .hint', 'kind': 'label', 'trig': 'view', 'detail': ['取込の決まり（上書き／新規・UTF-8・5,000行・エラーの行は取り込まずほかの行を登録）。', 'Quy tắc nhập (ghi đè / mới, UTF-8, 5.000 dòng, dòng lỗi bỏ qua, dòng khác vẫn đăng ký).']}, {'no': '3.3', 'ja': 'ファイルを選ぶ', 'vi': 'Chọn tệp', 'sel': '#sec-csv button.out::ファイルを選ぶ', 'kind': 'file', 'trig': 'input', 'req': '○', 'len': ['CSV（UTF-8・.csv）1ファイル', '1 tệp CSV (UTF-8, .csv)'], 'init': ['なし', 'Không'], 'ex': ['オプションマスタ_20261005.csv', 'Tệp cùng cột với CSV出力 (2.1〜)'], 'err': ['E34'], 'detail': ['ファイルを選ぶか、枠にドラッグ＆ドロップ。選ぶとすぐに確かめて（何も保存しない）ステップ2へ。.csv 以外・UTF-8 以外・読めないファイル・見出しの列が 2.1〜 と違うファイルはその場でエラーの帯。', 'Chọn tệp hoặc kéo thả vào khung. Chọn xong kiểm tra ngay (không lưu) và sang bước 2. Không phải .csv / không phải UTF-8 / không đọc được / tiêu đề cột khác 2.1〜 thì hiện dải lỗi.']}, {'no': '3.4', 'ja': 'ドラッグ＆ドロップの枠', 'vi': 'Khung kéo thả', 'sel': '#sec-csv button.out::ファイルを選ぶ^2', 'kind': 'area', 'trig': 'view', 'detail': ['ファイルを重ねると枠が青くなる。選んだファイル名を下に出す。', 'Kéo tệp lên thì khung chuyển xanh. Tên tệp đã chọn hiện phía dưới.']}]},
    {'id': '017', 'code': 'AW_OPTN_004', 'state': ['確認・登録（ステップ2）', 'Xác nhận, đăng ký (bước 2)'], 'url': '/ops/masters/options/import', 'setup': 'const sleep=ms=>new Promise(r=>setTimeout(r,ms));const q=s=>document.querySelector(s);const res=await fetch(\'/api/domain/csv/export\',{method:\'POST\',credentials:\'include\',headers:{\'Content-Type\':\'application/json\',\'x-es-site\':\'ops\'},body:JSON.stringify({args:{entity:\'options\',scope:{site:\'ops\'}}})});const t=await res.json();const esc=v=>\'\\"\'+String(v??\'\').replace(/\\"/g,\'\\"\\"\')+\'\\"\';const rows=[t.head,...t.rows];rows[1][1]=rows[1][1]+\' 改\';const bad=t.rows[0].slice();bad[0]=\'XX999999\';rows.push(bad);const text=\'\\ufeff\'+rows.map(r=>r.map(esc).join(\',\')).join(\'\\r\\n\');const inp=q(\'#sec-csv input[type=file]\');const dt=new DataTransfer();dt.items.add(new File([text],\'取込テスト.csv\',{type:\'text/csv\'}));inp.files=dt.files;inp.dispatchEvent(new Event(\'change\',{bubbles:true}));await sleep(2500);window.scrollTo(0,q(\'#sec-csv\').offsetTop-80);', 'full': True, 'wait': 600, 'note': ['ファイルを選んだ直後。見本は CSV出力（ひな形）のファイルに、1行目の値を変え（更新の見本）と、キーが誤りの行を1つ足したもの（エラーの行の見本）。', 'Ngay sau khi chọn tệp. Mẫu = tệp CSV出力 (mẫu) + đổi giá trị dòng 1 (mẫu 更新) + 1 dòng khóa sai (mẫu dòng lỗi).'], 'items': [{'no': '4', 'ja': '確認・登録（ステップ2）', 'vi': 'Xác nhận, đăng ký (bước 2)', 'sel': '#sec-csv', 'kind': 'area', 'trig': 'show', 'pattern': 'P-CSV', 'err': ['S03', 'E34'], 'detail': ['ファイル名・件数と、行ごとの結果。「登録」でエラー以外の行を登録する（エラーの行は取り込まない・hong 2026/10/05）。', 'Tên tệp, số dòng và kết quả từng dòng. 登録 thì đăng ký các dòng không lỗi (dòng lỗi bỏ qua, hong 2026/10/05).']}, {'no': '4.1', 'ja': '件数', 'vi': 'Số lượng', 'sel': '#sec-csv .badge', 'kind': 'label', 'trig': 'view', 'detail': ['新規／更新／変更なし／エラー の件数（バッジ）。', 'Số dòng 新規 / 更新 / 変更なし / エラー (badge).']}, {'no': '4.2', 'ja': 'エラーの行', 'vi': 'Dòng lỗi', 'sel': '#sec-csv .notice.ng', 'kind': 'label', 'trig': 'show', 'cond': ['エラーの行があるとき', 'Khi có dòng lỗi'], 'detail': ['「エラーの行 n件は取り込みません…」と、行番号・キー・列名・内容の表（多いときは先頭だけ。全部はエラー一覧CSV）。内容は 2.1〜 のチェックの文言。', '「エラーの行 n件は取り込みません…」 + bảng số dòng / khóa / cột / nội dung (nhiều thì chỉ phần đầu; đủ ở エラー一覧CSV). Nội dung = câu kiểm tra của 2.1〜.']}, {'no': '4.3', 'ja': 'エラー一覧CSV', 'vi': 'Xuất CSV lỗi', 'sel': '#sec-csv button::エラー一覧CSV', 'kind': 'button', 'trig': 'click', 'detail': ['エラーの行だけを、元の列＋エラーの内容で書き出す（直して選び直すため）。', 'Xuất riêng các dòng lỗi với cột gốc + nội dung lỗi (để sửa rồi chọn lại).']}, {'no': '4.4', 'ja': '登録する内容（前 → 後）', 'vi': 'Nội dung sẽ đăng ký (trước → sau)', 'sel': '#sec-csv b::登録する内容', 'kind': 'label', 'trig': 'view', 'cond': ['新規・更新の行があるとき', 'Khi có dòng 新規 / 更新'], 'detail': ['行番号・区分（新規／更新）・キー・名前・変わる項目（前 → 後）。', 'Số dòng, loại (新規 / 更新), khóa, tên, các mục thay đổi (trước → sau).']}, {'no': '4.5', 'ja': 'ファイルを選び直す', 'vi': 'Chọn lại tệp', 'sel': '.csvph .btns button.out::ファイルを選び直す', 'kind': 'button', 'trig': 'click', 'detail': ['ステップ1に戻る。何も登録しない。', 'Về bước 1. Không đăng ký gì.']}, {'no': '4.6', 'ja': '登録', 'vi': 'Đăng ký', 'sel': '.csvph .btns button.pri', 'kind': 'button', 'trig': 'click', 'err': ['S03', 'E34'], 'cond': ['新規か更新の行が1つ以上あり、ファイル全体のエラーがないとき。警告（金額の変更など）があるときは「警告を確認しました」にチェックするまで押せない', 'Có ≥1 dòng 新規 / 更新 và không lỗi cả tệp. Có cảnh báo (vd đổi tiền) thì phải check 「警告を確認しました」 mới nhấn được'], 'detail': ['エラー以外の行を登録し、S03 のトースト（新規 n件・更新 n件）、一覧へ戻る。100件を超えるときは裏で進めて進み具合を出す。取込の記録と、行ごとの変更履歴「CSV取込で更新」を残す。', 'Đăng ký các dòng không lỗi, toast S03 (新規 n, 更新 n), về danh sách. Quá 100 dòng thì chạy nền và hiện tiến độ. Ghi lịch sử nhập và lịch sử từng bản ghi 「CSV取込で更新」.']}]},
]

# ================================================================ 初期データのシート（Excel・HTML に1シート足す。hong 2026/10/05「bổ sung 1 sheet vào spec」。scratchpad/gen_sheet.py で seed から作る）
SHEETS = [{'name': ['初期データ（オプション・値引き）', 'Dữ liệu mặc định (option, giảm giá)'], 'note': ['システムに最初から入っているオプションマスタ・値引きマスタの行（見本データ lib/domain/seed/master.ts から CSV出力の形で作成・2026-10-05・削除済を除く）。A型（システム定義）のオプションと自動で付く値引きは運営が作る・消すものではない（オプション・値引き_定義 §10・§11）。値は運営が画面で直せる（表示名・金額・公開ステータス・利用状態など）。金額は【仮】のものを含む。', 'Các dòng của オプションマスタ / 値引きマスタ có sẵn trong hệ thống (tạo từ dữ liệu mẫu lib/domain/seed/master.ts theo dạng CSV出力, 2026-10-05, trừ đã xóa). Option loại A và giảm giá tự gắn không do 運営 tạo/xóa (オプション・値引き_定義 §10, §11). 運営 sửa được tên, tiền, trạng thái trên màn hình. Có số tiền【仮】.'], 'tables': [{'title': ['オプションマスタ（31件）', 'オプションマスタ (31 dòng)'], 'head': [[['オプションID', 'Mã option'], 14], [['管理名（社内用）', 'Tên quản lý'], 24], [['請求書表示名', 'Tên trên hóa đơn'], 20], [['オプション区分', 'Loại'], 14], [['連動タイプ', 'Loại liên kết'], 14], [['連動する契約項目', 'Mục hợp đồng liên kết'], 14], [['連動条件', 'Điều kiện liên kết'], 30], [['数量の取り方', 'Cách lấy số lượng'], 20], [['料金種別', 'Loại phí'], 14], [['単位', 'Đơn vị'], 14], [['金額の種類', 'Loại số tiền'], 14], [['標準金額（税抜）', 'Số tiền chuẩn (chưa thuế)'], 14], [['税率', 'Thuế suất'], 14], [['対象のコース', 'Course áp dụng'], 14], [['対象の機種区分', 'Loại thiết bị áp dụng'], 14], [['公開ステータス', 'Công khai'], 14], [['利用状態', 'Trạng thái'], 14], [['説明', 'Mô tả'], 50]], 'rows': [['OP000001', '配送回数追加', '配送回数追加', '配送', 'A 契約項目に連動（システム定義）', '配送回数', '配送ルート設定の配送回数が、プラン標準の回数を超えたとき', 'プラン標準を超えた分だけ', '月額料金（継続）', '超過1単位（A型のみ）', '固定', '3000', '10%', '0', '0', '非公開', '使用中', '温度帯ごとに標準の配送回数を超えた回数 × 金額（月額）。足りない温度帯と相殺しない（28-85・28-154・28-156）'], ['OP000002', 'ES-QR 利用料', 'ES-QR', 'アプリ機能', 'A 契約項目に連動（システム定義）', 'ES-QR', 'ES-QR＝利用する', '固定1', '月額料金（継続）', '拠点', '固定', '1000', '10%', '0', '0', '公開', '使用中', '契約項目 ES-QR「利用する」と連動。既存のお客様の無料は子契約の金額の上書き（0円・REQ-CT-304）'], ['OP000003', 'ゲストモード利用料', 'ゲストモード', 'アプリ機能', 'A 契約項目に連動（システム定義）', 'ゲストモード', 'ゲストモード＝利用する', '固定1', '月額料金（継続）', '拠点', '都度入力', '0', '10%', '0', '0', '非公開', '使用中', '金額が決まるまで 0円（STEP3追補 O13）'], ['OP000004', '地域配送料', '地域配送料', '配送', '連動しない', '—（連動しない）', '—（連動しない）', 'プラン標準を超えた分だけ', '月額料金（継続）', '拠点', '拠点ごと', '4000', '10%', '0', '0', '非公開', '使用中', "配送エリアによる。金額は拠点ごと（子契約で上書き）。既定 4,000円（STEP3回答 Q5'）"], ['OP000007', '設置代行（冷蔵庫）', '設置代行', '設置・作業', '連動しない', '—（連動しない）', '—（連動しない）', 'プラン標準を超えた分だけ', '単発料金（1回）', '回', '都度入力', '15000', '10%', '0', '0', '公開', '使用中', '法人が申込・変更申請で冷蔵庫の設置代行を選んだとき。【仮】金額の根拠なし（要件シート 行156）'], ['OP000008', '初期費用', '初期費用', '事務', '連動しない', '—（連動しない）', '—（連動しない）', 'プラン標準を超えた分だけ', '単発料金（1回）', '拠点', '機種参照（機種マスタの値・契約ごとに直せる）', '10000', '10%', '0', '0', '非公開', '使用中', '新規導入の本登録で1回だけ（当月請求・REQ-CT-182）。金額はプランマスタの初期費用（契約ごとに直せる・REQ-PM-055）'], ['OP000010', '冷蔵庫交換（お客様都合）', '冷蔵庫交換（お客様都合）', '設置・作業', '連動しない', '—（連動しない）', '—（連動しない）', 'プラン標準を超えた分だけ', '単発料金（1回）', '回', '都度入力', '0', '10%', '0', '0', '非公開', '使用中', 'STEP3追補 Q-A（名前を変えて残す）'], ['OP000011', '月次運用レポート', '月次運用レポート', '事務', '連動しない', '—（連動しない）', '—（連動しない）', 'プラン標準を超えた分だけ', '月額料金（継続）', '拠点', '固定', '5000', '10%', '0', '0', '公開', '終了', '終了（申込フォームから外した）'], ['OP000013', '資材定期補充', '資材定期補充', '配送', '連動しない', '—（連動しない）', '—（連動しない）', 'プラン標準を超えた分だけ', '月額料金（継続）', '拠点', '固定', '1500', '10%', '0', '0', '非公開', '終了', '使わない（決定_STEP5回答_法人Web Q-STEP3）'], ['OP000014', '配送時間帯指定サービス', '配送時間帯指定サービス', '配送', '連動しない', '—（連動しない）', '—（連動しない）', 'プラン標準を超えた分だけ', '月額料金（継続）', '拠点', '固定', '2000', '10%', '0', '0', '公開', '使用中', '申込フォームで選べる（決定_v2.3追補_申込フォームとマスタ §1）'], ['OP000015', '再設置・移設（荷物移動）', '再設置・移設', '設置・作業', '連動しない', '—（連動しない）', '—（連動しない）', 'プラン標準を超えた分だけ', '単発料金（1回）', '回', '都度入力', '8000', '10%', '0', '0', '非公開', '使用中', '【仮】金額の根拠なし（STEP3追補 §1 O6）'], ['OP000016', '棚卸し未実施', '事務手数料', 'ペナルティ', '連動しない', '—（連動しない）', '—（連動しない）', 'プラン標準を超えた分だけ', '単発料金（1回）', '回', '固定', '3000', '10%', '0', '0', '非公開', '使用中', '棚卸の報告期限は毎月20日、未報告の判定は25日（20日までに報告がなければ、25日に未報告として事務手数料を1回請求する）。休止中・棚卸なし・お試しは除く'], ['OP000017', '自販機ラッピング変更', '自販機ラッピング変更', '設置・作業', '連動しない', '—（連動しない）', '—（連動しない）', 'プラン標準を超えた分だけ', '単発料金（1回）', '回', '都度入力', '0', '10%', '0', '0', '公開', '使用中', '別途見積（自販機のときだけ申込で選べる）'], ['OP000019', '設備配送料（1台）', '設備配送料（1台）', '設置・作業', '連動しない', '—（連動しない）', '—（連動しない）', 'プラン標準を超えた分だけ', '単発料金（1回）', '台', '固定', '4800', '10%', '0', '0', '非公開', '使用中', '設備の入替・追加・回収の配送が1台（28-16・28-53。承認の前に直せる）'], ['OP000020', '設備配送料（2台以上）', '設備配送料（2台以上）', '設置・作業', '連動しない', '—（連動しない）', '—（連動しない）', 'プラン標準を超えた分だけ', '単発料金（1回）', '台', '固定', '7800', '10%', '0', '0', '非公開', '使用中', '設備の入替・追加・回収の配送が2台以上（28-16・28-53）'], ['OP000021', '階段作業の加算', '階段作業の加算', '設置・作業', '連動しない', '—（連動しない）', '—（連動しない）', 'プラン標準を超えた分だけ', '単発料金（1回）', '回', '固定', '3000', '10%', '0', '0', '非公開', '使用中', 'エレベーターなしで3階以上（28-16）。設備の異動の案に運営が足す'], ['OP000022', '設備引揚費（1台）', '設備引揚費', '設置・作業', '連動しない', '—（連動しない）', '—（連動しない）', 'プラン標準を超えた分だけ', '単発料金（1回）', '台', '都度入力', '0', '10%', '0', '0', '非公開', '使用中', '0円（28-54・2026/10/03 回答）。必要なときは運営が請求の ③ 調整で入れる'], ['OP000023', 'サイズ差額（月額）', 'サイズ差額（月額）', '設置・作業', '連動しない', '—（連動しない）', '—（連動しない）', 'プラン標準を超えた分だけ', '月額料金（継続）', '台', '差額で決まる', '0', '10%', '0', '0', '非公開', '使用中', '新しい機種の月額 − 古い機種の月額（＋のときだけ・機種マスタ）。STEP3回答 Q4'], ['OP000024', '緊急出動料金', '緊急出動料金', '設置・作業', '連動しない', '—（連動しない）', '—（連動しない）', 'プラン標準を超えた分だけ', '単発料金（1回）', '回', '都度入力', '0', '10%', '0', '0', '非公開', '使用中', 'STEP3追補 §1（E7・O1）'], ['OP000025', '特殊作業費（手上げ）', '特殊作業費（手上げ）', '設置・作業', '連動しない', '—（連動しない）', '—（連動しない）', 'プラン標準を超えた分だけ', '単発料金（1回）', '回', '都度入力', '0', '10%', '0', '0', '非公開', '使用中', 'STEP3追補 §1（B21・O2）'], ['OP000026', '特殊作業費（クレーン対応）', '特殊作業費（クレーン対応）', '設置・作業', '連動しない', '—（連動しない）', '—（連動しない）', 'プラン標準を超えた分だけ', '単発料金（1回）', '回', '都度入力', '0', '10%', '0', '0', '非公開', '使用中', 'STEP3追補 §1（B22・O2）'], ['OP000027', '特殊作業費（その他）', '特殊作業費（その他）', '設置・作業', '連動しない', '—（連動しない）', '—（連動しない）', 'プラン標準を超えた分だけ', '単発料金（1回）', '回', '都度入力', '0', '10%', '0', '0', '非公開', '使用中', 'STEP3追補 §1（B23・O2）'], ['OP000028', '搬入設置個所の下見費用', '搬入設置個所の下見費用', '設置・作業', '連動しない', '—（連動しない）', '—（連動しない）', 'プラン標準を超えた分だけ', '単発料金（1回）', '回', '都度入力', '0', '10%', '0', '0', '非公開', '使用中', 'STEP3追補 §1（B24・O3）'], ['OP000029', '故障による交換（同型サイズ）', '故障による交換（同型サイズ）', '設置・作業', '連動しない', '—（連動しない）', '—（連動しない）', 'プラン標準を超えた分だけ', '単発料金（1回）', '回', '固定', '0', '10%', '0', '0', '非公開', '使用中', '0円の記録（STEP3追補 §1 E19・O5）'], ['OP000030', '自販機手数料', '自販機手数料', '事務', '連動しない', '—（連動しない）', '—（連動しない）', 'プラン標準を超えた分だけ', '月額料金（継続）', '拠点', '都度入力', '0', '10%', '0', '0', '非公開', '使用中', 'STEP3追補 §1（O10）。自販機リース（OP000037）とは別の手数料【要確認】'], ['OP000031', '買取惣菜料金', '買取惣菜料金', '事務', '連動しない', '—（連動しない）', '—（連動しない）', 'プラン標準を超えた分だけ', '単発料金（1回）', '回', '都度入力', '0', '10%', '0', '0', '非公開', '使用中', 'STEP3追補 §1（O10）。商品の買取（企業独自価格）と重なる【要確認】'], ['OP000032', '冷凍庫レンタル（既存のお客様）', '冷凍庫レンタル（既存のお客様）', '設置・作業', '連動しない', '—（連動しない）', '—（連動しない）', 'プラン標準を超えた分だけ', '月額料金（継続）', '台', '拠点ごと', '0', '10%', '0', '0', '非公開', '終了', '参考（終了）：賃料は機種マスタの月額で移行割の設備の異動の案が自動で出す（2026/10/03 回答）'], ['OP000034', '追加配送（単発・1回）', '追加配送（単発・1回）', '配送', '連動しない', '—（連動しない）', '—（連動しない）', 'プラン標準を超えた分だけ', '単発料金（1回）', '回', '固定', '5000', '10%', '0', '0', '非公開', '使用中', 'お客様に頼まれた単発の追加配送（Q-B）。代替品・補償の追加配送は請求しない'], ['OP000035', 'ユーザー現金利用', 'ユーザー現金利用', 'アプリ機能', 'A 契約項目に連動（システム定義）', 'ユーザー現金利用', 'ユーザー現金利用＝利用する', 'プラン標準を超えた分だけ', '月額料金（継続）', '拠点', '固定', '0', '10%', '0', '0', '非公開', '使用中', '【仮】0円（STEP3追補 §6）'], ['OP000036', '資材の追加配送（単発・1回）', '資材の追加配送', '配送', '連動しない', '—（連動しない）', '—（連動しない）', 'プラン標準を超えた分だけ', '単発料金（1回）', '回', '固定', '2000', '10%', '0', '0', '非公開', '使用中', '同じサイクル月の2回目からの資材便ごと（2026/10/03 回答：サイクル）。【仮】金額はお客様確認'], ['OP000037', '自販機リース', '自販機月額料金', '設置・作業', '連動しない', '配送回数', '配送ルート設定の配送回数が、プラン標準の回数を超えたとき', 'プラン標準を超えた分だけ', '月額料金（継続）', '台', '機種参照（機種マスタの値・契約ごとに直せる）', '15000', '10%', '0', '0', '非公開', '使用中', 'ESライト（自販機）の子契約に自動で付く。1台の金額の初期値＝拠点の自販機の機種マスタの月額（契約ごとに直せる）× 台数。REQ-PM-054・REQ-CT-303/304']]}, {'title': ['値引きマスタ（6件）', '値引きマスタ (6 dòng)'], 'head': [[['値引きID', 'Mã giảm giá'], 14], [['値引き名（管理用）', 'Tên quản lý'], 26], [['請求書表示名', 'Tên trên hóa đơn'], 20], [['値引き区分', 'Loại'], 14], [['適用対象', 'Đối tượng'], 14], [['対象オプション', 'Option áp dụng'], 14], [['計算区分', 'Cách tính'], 14], [['値引きの値', 'Giá trị'], 14], [['税率の扱い', 'Thuế'], 14], [['重ねがけ', 'Cộng dồn'], 14], [['適用順', 'Thứ tự'], 14], [['値引きの種別', 'Loại (tháng / 1 lần)'], 14], [['適用期間の持ち方', 'Kỳ áp dụng'], 14], [['適用月数', 'Số tháng'], 14], [['つけられる拠点の条件', 'Điều kiện điểm'], 24], [['対象のプラン・コース', 'Plan / course'], 22], [['回数の上限', 'Giới hạn số lần'], 14], [['自動で付ける条件', 'Tự gắn'], 22], [['受付期間', 'Kỳ tiếp nhận'], 14], [['公開ステータス', 'Công khai'], 14], [['利用状態', 'Trạng thái'], 14], [['説明', 'Mô tả'], 50]], 'rows': [['DC000001', '代理店割引（料率）【仮】', '代理店割引', '代理店割引', 'プラン料金', '—（適用対象がオプション料金のときだけ）', '料率', '5', '元の費目と同じ', '可', '30', '毎月（継続）', '無期限', '—', 'AG00021 株式会社パートナーズ', '（プランは限定なし）', '上限なし', '付けない（手で付ける）', '', '非公開', '使用中', '【仮】料率5%（上限 ¥5,000）・プラン料金から。代理店（agencyId）のある契約だけ。金額はお客様に未確認。紹介フィー（ESが代理店へ払う）とは別'], ['DC000002', '初回キャンペーン割引【仮】', '初回キャンペーン割引', 'キャンペーン割引', 'プラン料金', '—（適用対象がオプション料金のときだけ）', '固定額', '3000', '元の費目と同じ', '可', '10', '毎月（継続）', '月数指定', '3', 'すべて', '（プランは限定なし）', '上限なし', '付けない（手で付ける）', '', '公開', '使用中', '【仮】固定 ¥3,000 × 3ヶ月・プラン料金から。運営が手で付ける。金額・期間はお客様に未確認'], ['DC000003', 'スタンダードアップ差額（ライト→スタンダード・既存のお客様）', 'スタンダードアップ差額', 'アップグレード差額', 'プラン料金', '—（適用対象がオプション料金のときだけ）', '差額自動', '差額自動（同じプラン・同じ改定の世代・同じ配送便の スタンダード料金 − ライト料金）', '元の費目と同じ', '可', '20', '毎月（継続）', '無期限', '—', 'すべて', '（プランは限定なし）', '上限なし', '付けない（手で付ける）', '', '非公開', '終了', '終了：DC000021（旧ライト→スタンダード移行割）に統合（28-170 → 7-2・2026/10/03 回答）'], ['DC000005', '春の新規キャンペーン', '春の新規キャンペーン', 'キャンペーン割引', 'プラン料金', '—（適用対象がオプション料金のときだけ）', '料率', '20', '元の費目と同じ', '可', '40', '毎月（継続）', '月数指定', '3', 'すべて', '（プランは限定なし）', '上限なし', '付けない（手で付ける）', '', '非公開', '終了', '過去の例（終了）'], ['DC000013', 'お試しキャンペーン割引', 'お試しキャンペーン割引', 'キャンペーン割引', 'プラン料金', '—（適用対象がオプション料金のときだけ）', 'プラン料金を参照', 'プラン50・冷蔵庫・ライトのプラン料金（プランマスタを参照。請求額を超えない）', '元の費目と同じ', '不可', '1', '毎月（継続）', '月数指定', 'お試し期間の月数（既定1）', 'すべて', '（プランは限定なし）', '法人ごとに1回', '契約種別＝お試しキャンペーン', '', '非公開', '使用中', '50プラン ESライト（冷蔵庫）の料金分。請求額を超えない。法人ごとに1回（同じ月に1拠点だけ）。延長の月も無料'], ['DC000021', '旧ライト→スタンダード移行割', '旧ライト→スタンダード移行割', 'アップグレード差額', 'プラン料金', '—（適用対象がオプション料金のときだけ）', '差額自動', '差額自動（同じプラン・同じ改定の世代・同じ配送便の スタンダード料金 − ライト料金）', '元の費目と同じ', '可', '20', '毎月（継続）', '無期限', '—', 'すべて', '（プランは限定なし）', '上限なし', '契約項目に連動', '', '非公開', '使用中', '基本料金＝同じプランの ESライト（冷蔵庫）の価格。冷凍庫の賃料は別（機種マスタの月額）。旧 DC000003 を統合']]}]}]

VIEWS = V_LIST + V_DETAIL + V_FORM + V_CSV
