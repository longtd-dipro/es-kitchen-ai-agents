# -*- coding: utf-8 -*-
"""
画面設計書のデータ：運営管理者Web ＞ マスタ管理 ＞ 値引きマスタ（一覧・詳細・登録／編集）
元：本物の Web（このリポジトリ app/ops/masters/discounts）、決定台帳 B・E・F（42 適用一覧・CSV）、マスタ項目一覧「値引きマスタ一覧／編集（38）」、
    オプション・値引き_定義_20261003、決定_STEP3追補_オプション値引きマスタの不足_20261001（Q3・Q-E）、運営Web_権限表（プラン管理）、STEP7 一覧の決まり、
    確認メモ_AW_マスタ3画面_機種・オプション・値引き.md
番号は画面ごとに通し。タブ・モーダルの状態では、その状態で増える・変わる項目だけ書く（共通の項目は最初の状態に1回）。
"""

TITLE = ["値引きマスタ（AW_DISC）", "Discount master (AW_DISC)"]
SHEET = ["値引きマスタ", "Discount master"]
BASENAME = "画面設計書_AW_DISC_値引きマスタ"
IMG_PREFIX = "AW_DISC"
OUT_DIR = "AW_DISC_値引きマスタ"
CODE_NOTE = ["画面コードは規約 <Module(2)>_<Feature(4)>_<Seq(3)>（docs/01_仕様/画面コード規約_20261005.md）。AW＝運営管理者Web、DISC＝値引きマスタ",
             "Mã màn hình theo quy ước <Module(2)>_<Feature(4)>_<Seq(3)>. AW = Admin Web, DISC = Discount master"]
SITE = "ops"
SYSTEM = {"ja": "運営管理者Web", "vi": "Web quản trị vận hành"}
AUTHOR = "Claude（cloud）／確認：hong"
CREATED = "2026-10-05"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "ops", "loginId": "Ad00010"}

DECISIONS = [
    {"date": "2026-10-05", "target": "値引き区分の持ち方",
     "q": ["値引き区分は固定の選択肢か", "Loại giảm giá là lựa chọn cố định?"],
     "a": ["固定ではなく「値引き区分マスタ」（名前・並び順・使用中／終了）から選ぶ。運営が足せる。オプション区分マスタと同じ形", "Không cố định; chọn từ 値引き区分マスタ (tên, thứ tự, trạng thái). 運営 thêm được. Cùng dạng với オプション区分マスタ"],
     "src": "hong 2026/10/05「値引き画面についても、オプション画面で指摘した内容を反映」・台帳 F・受付簿 #144"},
    {"date": "2026-10-05", "target": "対象のプラン・コースの「すべて」",
     "q": ["対象を限定しないときの入れ方", "Nhập thế nào khi không giới hạn?"],
     "a": ["チェックの先頭に「すべて」を置き既定で ON。外すと個別を選べる（1つも選ばないと E02）。オプションの対象のコースと同じ", "Đặt 「すべて」 đầu tiên, mặc định bật; bỏ thì chọn riêng (không chọn gì → E02). Giống option"],
     "src": "hong 2026/10/05（同上）・台帳 F・受付簿 #145"},
    {"date": "2026-10-05", "target": "システムで先に定義する値引きの一覧",
     "q": ["自動で付く値引き（契約種別・契約項目に連動）はどこで定義するか", "Giảm giá tự gắn định nghĩa ở đâu?"],
     "a": ["オプションの A型と同じく要件で定義する：DC000013 お試しキャンペーン割引（契約種別＝お試しキャンペーン・法人ごとに1回）／DC000021 旧ライト→スタンダード移行割（プラン変更 ライト→スタンダード の承認・基本料金＝ESライト（冷蔵庫）の価格）。運営が作る・消すものではなく、直せるのは名前・金額・利用状態など。一覧は オプション・値引き_定義 §11", "Định nghĩa trong yêu cầu như loại A của option: DC000013 (loại hợp đồng = dùng thử, 1 lần mỗi công ty) / DC000021 (phê duyệt đổi plan light→standard). 運営 không tạo/xóa; chỉ sửa tên, tiền, trạng thái. Danh sách ở オプション・値引き_定義 §11"],
     "src": "hong 2026/10/05（同上）・受付簿 #146"},
    {"date": "2026-10-05", "target": "権限",
     "q": ["だれが作成・編集・削除できるか", "Ai được tạo/sửa/xóa?"],
     "a": ["フル権限＝CRUD、ほかの6役割＝R（閲覧・CSV出力）（プラン管理・台帳 F）", "フル権限 = CRUD, 6 vai trò còn lại = R (台帳 F)"],
     "src": "台帳 F（2026-10-05・画面設計書 Q3＝A）・運営Web_権限表"},
    {"date": "2026-10-05", "target": "一覧の初期の並び",
     "q": ["初期の並び順（L-3）", "Thứ tự mặc định (L-3)"],
     "a": ["登録日時の新しい順。列見出しで 値引きID・値引き名・適用対象・利用状態・登録日時 を並べ替えられる（マスタ項目一覧 #9）", "Mới đăng ký trước. Sắp xếp được theo ID, tên, 適用対象, trạng thái, ngày đăng ký (マスタ項目一覧 #9)"],
     "src": "マスタ項目一覧 一覧画面 #9・STEP7 L-3"},
    {"date": "2026-10-05", "target": "適用一覧と適用の CSV",
     "q": ["値引きマスタで適用（拠点ごと）を持つか・CSV はどこか", "値引きマスタ có giữ áp dụng theo điểm không; CSV ở đâu?"],
     "a": ["適用一覧は表示だけ（今のサイクル月の子契約から作る）。適用の CSV取込・CSV出力は一覧の上のボタン1か所だけ（取込は子契約に直接書く。discount_apply の表は持たない）。詳細の適用一覧タブには CSV のボタンを置かない", "適用一覧 chỉ xem (tạo từ 子契約 tháng hiện tại). CSV nhập/xuất áp dụng chỉ 1 chỗ ở đầu danh sách (ghi thẳng vào 子契約; không có bảng discount_apply). Tab 適用一覧 ở chi tiết không có nút CSV"],
     "src": "台帳 42（hong 2026-10-03 M9＝A）・hong 2026-10-05（一覧のボタンを追加／CSV は専用のものを作らない）"},
    {"date": "2026-10-05", "target": "削除できない条件",
     "q": ["適用中の拠点がある値引きを削除できるか", "Xóa được 値引き đang áp dụng không?"],
     "a": ["できない（E37・件数＝適用中の拠点数）。終了にして新規に付けられなくする", "Không (E37). Đổi 利用状態 = 終了"],
     "src": "RV-OPS-20261002 O-b・コード（useCountOf）"},
    {"date": "2026-10-05", "target": "一覧の「値引きの値」の表記",
     "q": ["一覧でどう出すか", "Hiện thế nào ở danh sách?"],
     "a": ["固定額＝「n円」、料率＝「n%（上限 m円）」、差額自動＝「自動」、プラン料金を参照＝「プラン参照」", "固定額 = 「n円」, 料率 = 「n%（上限 m円）」, 差額自動 = 「自動」, プラン料金を参照 = 「プラン参照」"],
     "src": "マスタ項目一覧 値引きマスタ一覧 5（差額自動＝自動）。参照の表記は Claude 案（hong 回答 2026/10/05 OK・受付簿 #107）"},
    {"date": "2026-10-05", "target": "税率",
     "q": ["「個別に指定」の税率の選び方", "Chọn thuế suất 個別に指定 thế nào?"],
     "a": ["税率マスタのドロップダウン", "Dropdown 税率マスタ"],
     "src": "台帳 E・受付簿 #38・マスタ項目一覧 計算 5"},
    {"date": "2026-10-05", "target": "画面コード",
     "q": ["画面コード", "Mã màn hình"],
     "a": ["AW_DISC_001〜003", "AW_DISC_001〜003"],
     "src": "画面コード規約_20261005（Feature は Claude 案・hong 回答 2026/10/05 OK・受付簿 #107）"},
]
CHANGES = [{'ver': '1.5', 'date': '2026-10-05', 'no': ['2.7', '2.8', '2.9', '8.5'], 'type': '削除', 'before': ['履歴 8.5「影響した拠点数」', 'Cột 8.5 影響した拠点数'], 'after': ['外す（マスタの変更は契約・拠点に影響しない）', 'Bỏ (đổi master không ảnh hưởng hợp đồng)'], 'reason': ['hong 2026/10/05「bỏ」・受付簿 #148', 'hong 2026/10/05, 受付簿 #148'], 'impact': ['discounts.ts 履歴の表', 'discounts.ts']},
 {'ver': '1.4', 'date': '2026-10-05', 'no': ['3.5', '3.7', '3.8', '3.9', '4.7', '4.8', '4.9', '5.5', '6.5'], 'type': '変更', 'before': ['トグル「終了分も表示」（設計書はドロップダウン・コードは宿題）', 'Nút toggle 終了分も表示 (code chưa sửa)'], 'after': ['表の上のドロップダウン「適用の状態」をコードにも反映（7.1）', 'Dropdown 適用の状態 đã vào code (7.1)'], 'reason': ['hong 2026/10/05・受付簿 #114', 'hong 2026/10/05, 受付簿 #114'], 'impact': ['discounts.ts・MasterDetail', 'discounts.ts, MasterDetail']},
 {'ver': '1.4', 'date': '2026-10-05', 'no': ['3.5', '3.7', '3.8', '3.9', '4.7', '4.8', '4.9', '5.5', '6.5'], 'type': '変更', 'before': ['値引き区分は固定の6つ、対象のプラン・コースは空欄＝すべて、自動で付く値引きの定義なし', 'Loại giảm giá cố định; 対象 trống = tất cả; chưa định nghĩa giảm giá tự gắn'], 'after': ['値引き区分マスタ（3.5）、「すべて」のチェック（5.5・6.5）、システムで先に定義する値引きの一覧（DECISIONS・オプション・値引き_定義 §11）', '値引き区分マスタ (3.5); check 「すべて」 (5.5, 6.5); danh sách giảm giá hệ thống (§11)'], 'reason': ['hong 2026/10/05「値引き画面についても、オプション画面で指摘した内容を反映」・受付簿 #144〜#146', 'hong 2026/10/05, 受付簿 #144〜#146'], 'impact': ['コードは宿題（#144・#145・#146）', 'Code là 宿題']},
 {'ver': '1.4', 'date': '2026-10-05', 'no': ['3.7', '3.8', '3.9', '4.7', '4.8', '4.9'], 'type': '変更', 'before': ['備考・説明の欄は1列・途中', 'Ô 備考/説明 1 cột, ở giữa'], 'after': ['3列分の幅でセクションの最後に（番号も最後に）', 'Rộng 3 cột, đặt cuối section (đổi số)'], 'reason': ['hong 2026/10/05 チャット（共通）・受付簿 #143', 'hong 2026/10/05, 受付簿 #143'], 'impact': ['parts.tsx span3・spec の fields の順', 'parts.tsx span3; thứ tự fields trong spec']},
 {'ver': '1.4', 'date': '2026-10-05', 'no': ['1.3', '2.5', '2.7', '2.8', '2.9', '2.22', '3.1'], 'type': '変更', 'before': ['CSV取込の画面：手順がカードの中、見出しは .phead', 'Màn CSV取込: stepper trong card, tiêu đề .phead'], 'after': ['アンケートの CSV取込と同じ形（見出し .ph＋ボタン、手順はカードの外の中央、カードに見出し）', 'Giống CSV取込 của アンケート (.ph + nút, stepper ngoài card, card có tiêu đề)'], 'reason': ['hong 2026/10/05「機種マスタ CSV取込の UI が異変。UI/UX 改善して」', 'hong 2026/10/05'], 'impact': ['MasterCsvImport の Frame・CsvUi.stepsInFrame', 'MasterCsvImport Frame; CsvUi.stepsInFrame']},
 {'ver': '1.3', 'date': '2026-10-05', 'no': ['2'], 'type': '削除', 'before': ['条件を変えて未反映のときに「検索」の横に「未適用」の印', 'Dấu 未適用 cạnh nút 検索 khi đổi điều kiện mà chưa áp dụng'], 'after': ['「未適用」の印は出さない（全部の一覧）', 'Không hiện dấu 未適用 (mọi danh sách)'], 'reason': ['hong 2026/10/05（画面設計書 HTML のコメント）・受付簿 #127', 'hong 2026/10/05, 受付簿 #127'], 'impact': ['ListView の UnappliedMark を出さない・P-LIST', 'Bỏ UnappliedMark ở ListView; P-LIST']},
 {'ver': '1.3', 'date': '2026-10-05', 'no': ['1', '1.1', '1.2', '1.3', '2', '2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2.7', '2.8', '2.9', '2.10', '2.11', '2.12', '2.13', '2.14', '2.15', '2.16', '2.17', '2.18', '2.19', '2.20', '2.21', '2.22', '2.23', '2.24', '2.25', '2.26', '2.27', '3', '3.1', '3.2', '3.3', '3.4', '3.5', '3.6', '3.7', '3.8', '3.9', '3.10', '3.11', '3.12', '3.13', '3.14', '3.15', '3.16', '3.17', '3.18', '3.19', '3.20', '3.21', '3.22', '3.23', '3.24', '3.25', '3.26', '3.27', '4', '4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '5', '5.1', '5.2', '5.3', '5.4', '5.5', '5.6'], 'type': '変更', 'before': ['CSV取込の画面に「CSVの列（テンプレートの定義）」の表を出す（項目 2・3.x）', 'Màn CSV取込 hiện bảng định nghĩa cột (mục 2, 3.x)'], 'after': ['列の定義は画面に出さない。CSVテンプレートの列（必須・長さ・チェック・データ例）を項目 2.x として設計書にだけ書く（入力画面と同じ定義）。ファイルを選ぶ＝3.x、確認・登録＝4.x に番号を詰めた', 'Không hiện bảng cột trên màn hình. Định nghĩa cột template (bắt buộc, độ dài, kiểm tra, ví dụ) chỉ ghi ở 設計書 (mục 2.x, như màn nhập). Chọn tệp = 3.x, xác nhận = 4.x'], 'reason': ['hong 2026/10/05「CSV テンプレは画面で表示ではなく、一覧に追加して…入力画面と同様に定義必要」・受付簿 #129', 'hong 2026/10/05, 受付簿 #129'], 'impact': ['画面から列の表のカードを外す（MasterCsvImport）。取込のチェックは 2.x のとおり', 'Bỏ card bảng cột khỏi màn hình (MasterCsvImport). Kiểm tra khi nhập theo 2.x']},
 {'ver': '1.2',
  'date': '2026-10-05',
  'no': ['*'],
  'type': '追加',
  'before': ['CSV取込はモーダル（一覧の状態）', 'Nhập CSV là modal (trạng thái của danh sách)'],
  'after': ['画面 AW_DISC_004／005「CSV取込」（CSVの列の定義の表＋1 ファイルを選ぶ → 2 確認・登録）', 'Màn hình AW_DISC_004／005 「CSV取込」 (bảng định nghĩa cột + bước 1 chọn tệp → bước 2 xác nhận)'],
  'reason': ['hong 2026/10/05（モーダルではなく画面・テンプレートの定義を書く）・受付簿 #89', 'hong 2026/10/05, 受付簿 #89'],
  'impact': ['モーダルを画面に。列の定義 API（csv.columns）・テンプレート CSV（docs/05_画面設計書/CSVテンプレート）', 'Modal → màn hình; API csv.columns; template CSV']},
 {'ver': '1.2',
  'date': '2026-10-05',
  'no': ['8', '8.1', '8.2', '8.3', '9', '9.1', '9.2', '9.3'],
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
         '1.5',
         '2',
         '2.1',
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
         '3.23',
         '3.24',
         '3.25',
         '3.26',
         '3.27',
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
         '7.1',
         '8'],
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
    {"code": "AW_DISC_001", "ja": "値引きマスタ一覧", "vi": "Danh sách giảm giá"},
    {"code": "AW_DISC_002", "ja": "値引き詳細", "vi": "Chi tiết giảm giá"},
    {"code": "AW_DISC_003", "ja": "値引き登録・編集", "vi": "Đăng ký / sửa giảm giá"},
    {"code": "AW_DISC_004", "ja": "値引きマスタ CSV取込", "vi": "Nhập CSV giảm giá"},
    {"code": "AW_DISC_005", "ja": "値引きの適用 CSV取込", "vi": "Nhập CSV áp dụng giảm giá"},
]

def F(no, ja, vi, sel, kind, trig="view", **kw):
    d = {"no": no, "ja": ja, "vi": vi, "sel": sel, "kind": kind, "trig": trig}
    d.update(kw)
    return d

FULL = ["フル権限（ops.full）の役割だけに表示", "Chỉ hiện với vai trò フル権限 (ops.full)"]
H_SORT = ["並べ替えの UI は未実装（受付簿 #55）。コードは値引きID順。仕様が正", "Chưa có UI sắp xếp (受付簿 #55); code theo ID. Spec đúng"]
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

# ================================================================ AW_DISC_001 一覧
LIST_HEADER = [
    F("1", "ヘッダー", "Đầu trang", ".es-pagehead", "area", detail=["パンくず（マスタ管理 / 値引きマスタ）・画面名・操作ボタン（CSV取込・CSV出力・適用 CSV取込・適用 CSV出力・新規登録）。", "Breadcrumb (マスタ管理 / 値引きマスタ), tên màn hình, nút thao tác (CSV取込, CSV出力, 適用 CSV取込, 適用 CSV出力, 新規登録)."]),
    F("1.1", "パンくず", "Breadcrumb", ".es-breadcrumb", "label", detail=["「マスタ管理 / 値引きマスタ」。リンクは動かない（表示だけ）。", "「マスタ管理 / 値引きマスタ」. Chỉ hiển thị."]),
    F("1.2", "画面名", "Tên màn hình", ".es-pagehead__title", "label", detail=["「値引きマスタ一覧」", "Tiêu đề 「値引きマスタ一覧」"]),
    F("1.3", "CSV取込", "Nhập CSV", "button::CSV取込", "button", "click", cond=FULL, pattern="P-CSV",
      detail=["値引きマスタ（値引きの定義）の CSV取込（AW_DISC_004 の画面へ）。キーは値引きID（空欄＝新規・採番）。管理用コードでも突き合わせる。列は詳細・編集の項目と同じ（CSV入出力_定義_20261003.md）。", "Nhập CSV định nghĩa 値引き (sang màn AW_DISC_004). Khóa = 値引きID (trống = mới); 管理用コード cũng dùng để khớp. Cột giống mục ở chi tiết/sửa."]),
    F("1.4", "CSV出力", "Xuất CSV", "button::CSV出力", "button", "click", detail=["検索条件のとおりの全件を、取込と同じ列で出力する。閲覧できる役割すべてに出す。", "Xuất toàn bộ theo điều kiện tìm kiếm, cùng cột với nhập. Hiện với mọi vai trò xem được."]),
    F("1.5", "適用 CSV取込", "Nhập CSV áp dụng", "button::適用 CSV取込", "button", "click", cond=FULL, pattern="P-CSV",
      detail=["値引きを拠点に一括で付ける（AW_DISC_005 の画面へ）。1行＝値引き × 拠点 × 適用開始月（列：値引きID〈または管理用コード〉・拠点ID・値引き額・適用開始月・適用終了月）。適用開始月から先（終了月まで。空欄＝ずっと）の子契約に値引きを付け、終了月より後は外す。確定・請求済の月は変えない（差額は請求の調整）。約800拠点への DC000021 移行割の適用はこれで行う（28-170・台帳 42）。",
              "Gắn hàng loạt 値引き cho các điểm (sang màn AW_DISC_005). 1 dòng = 値引き × điểm × tháng bắt đầu (cột: 値引きID 〈hoặc 管理用コード〉, 拠点ID, 値引き額, 適用開始月, 適用終了月). Gắn vào 子契約 từ tháng bắt đầu (đến tháng kết thúc; trống = mãi), sau tháng kết thúc thì gỡ. Tháng đã chốt/đã tính tiền không đổi. Áp dụng DC000021 cho ~800 điểm bằng cách này (28-170, 台帳 42)."]),
    F("1.6", "適用 CSV出力", "Xuất CSV áp dụng", "button::適用 CSV出力", "button", "click",
      detail=["いま付いている値引き（今のサイクル月の子契約）を 1.5 と同じ列で書き出す。", "Xuất các 値引き đang gắn (子契約 tháng hiện tại) với cột như 1.5."]),
    F("1.7", "新規登録", "Đăng ký mới", "button::新規登録", "button", "click", cond=FULL, detail=["AW_DISC_003（新規登録）へ。", "Sang AW_DISC_003 (đăng ký mới)."]),
]
LIST_SEARCH = [
    F("2", "検索条件", "Điều kiện tìm kiếm", ".es-search", "area", pattern="P-LIST",
      detail=["条件は「検索」か Enter で反映する。（「未適用」の印は出さない・hong 2026/10/05）", "Điều kiện áp dụng khi nhấn 検索 hoặc Enter; (không hiện dấu 未適用, hong 2026/10/05)."]),
    F("2.1", "キーワード", "Từ khóa", 'input[aria-label="値引きID、値引き名"]', "text", "input", req="－", len="文字列 60",
      init=["空", "Trống"], ex=["キャンペーン", "Tìm theo 値引きID / 値引き名（管理用）, khớp một phần"], valid=["部分一致。全角・半角、大文字・小文字を区別しない。", "Khớp một phần, không phân biệt toàn/nửa góc, hoa/thường."], err=["E04"],
      detail=["値引きID・値引き名（管理用）のどちらかに含まれる行。", "Lọc dòng có từ khóa trong 値引きID hoặc 値引き名（管理用）."]),
    F("2.2", "適用対象", "Đối tượng áp dụng", 'select[aria-label="適用対象"]', "select", "select", req="－",
      len=["選択（プラン料金／オプション料金／設備料金／初期料金／請求全体）", "Chọn (phí plan / phí option / phí thiết bị / phí ban đầu / toàn hóa đơn)"], init=["未選択（先頭＝条件名）", "Chưa chọn (dòng đầu = tên điều kiện)"], ex=["プラン料金", "Lọc theo 適用対象"]),
    F("2.3", "計算区分", "Cách tính", 'select[aria-label="計算区分"]', "select", "select", req="－",
      len=["選択（固定額／料率／差額自動／プラン料金を参照）", "Chọn (số tiền cố định / tỷ lệ / chênh lệch tự động / tham chiếu phí plan)"], init=["未選択", "Chưa chọn"], ex=["料率", "Lọc theo 計算区分"]),
    F("2.4", "利用状態", "Trạng thái sử dụng", 'select[aria-label="利用状態"]', "select", "select", req="－",
      len=["選択（使用中／終了／削除済）", "Chọn (đang dùng / kết thúc / đã xóa)"], init=["未選択", "Chưa chọn"], ex=["終了", "削除済 chỉ có kết quả khi bỏ check 2.5"], detail=["「削除済」を選ぶときは 2.5 のチェックも外す。", "Chọn 削除済 thì cũng bỏ check 2.5."]),
    F("2.5", "削除済みを表示しない", "Không hiện đã xóa", ".delchk", "check", "check", req="－", len=["チェック", "Checkbox"], init=["ON", "Bật"], ex=["ON", "Mặc định bật: ẩn 値引き 削除済"],
      detail=["ON＝削除済を出さない（既定）。OFF にして検索すると削除済も出る（行はグレー・操作なし）。", "Bật = ẩn đã xóa (mặc định). Tắt rồi tìm thì hiện cả đã xóa (dòng xám, không thao tác)."]),
    F("2.6", "クリア", "Xóa điều kiện", "button::クリア", "button", "click", detail=["条件をすべて初期値に戻し、1ページ目から表示し直す。", "Đưa điều kiện về mặc định, hiện lại từ trang 1."]),
    F("2.7", "検索", "Tìm kiếm", ".es-search__actions button[type=submit]", "button", "click", detail=["条件を反映して1ページ目から表示。Enter でも同じ。", "Áp dụng điều kiện, hiện từ trang 1. Enter cũng vậy."]),
]
LIST_TABLE = [
    F("3", "一覧", "Danh sách", ".es-table-wrap", "table", pattern="P-LIST",
      detail=["初期の並び：登録日時の新しい順（マスタ項目一覧 #9・L-3）。削除済の行はグレーで操作を出さない。", "Thứ tự mặc định: mới đăng ký trước (マスタ項目一覧 #9). Dòng đã xóa màu xám, không có thao tác."], demo_ok=H_SORT),
    F("3.1", "値引きID", "Mã giảm giá", "th::値引きID", "link", "click", len=["文字列 DC＋6桁", "DC + 6 số"], detail=["クリックで AW_DISC_002（詳細）へ。", "Nhấn sang AW_DISC_002."]),
    F("3.2", "値引き名（管理用）", "Tên (quản lý)", "th::値引き名（管理用）", "label", len="文字列 60"),
    F("3.3", "適用対象", "Đối tượng áp dụng", "th::適用対象", "label"),
    F("3.4", "計算区分", "Cách tính", "th::計算区分", "label"),
    F("3.5", "値引きの値", "Giá trị giảm", "th::値引きの値", "label",
      detail=["固定額＝「n円」、料率＝「n%（上限 m円）」（上限なしは「n%」）、差額自動＝「自動」、プラン料金を参照＝「プラン参照」。", "固定額 = 「n円」, 料率 = 「n%（上限 m円）」 (không giới hạn thì 「n%」), 差額自動 = 「自動」, プラン料金を参照 = 「プラン参照」."],
      demo_ok=["コードは数字そのまま「5」「3000」や長い説明文を出す（宿題 M3）。仕様が正", "Code hiện số thô 「5」「3000」 hoặc câu dài (宿題 M3). Spec đúng"]),
    F("3.6", "適用期間", "Kỳ áp dụng", "th::適用期間", "label", detail=["毎月・ずっと／毎月・Nヶ月／単発（値引きの種別と適用期間の持ち方・28-172）。", "毎月・ずっと / 毎月・Nヶ月 / 単発 (28-172)."]),
    F("3.7", "利用状態", "Trạng thái sử dụng", "th::利用状態", "label", detail=["バッジ：使用中＝緑、終了＝灰、削除済＝灰（行もグレー）。", "Badge: 使用中 xanh, 終了 xám, 削除済 xám (dòng xám)."]),
    F("3.8", "適用中", "Đang áp dụng", "th::適用中", "label", len=["整数＋「拠点」", "Số nguyên + điểm"], detail=["今のサイクル月の子契約から数えた拠点数。", "Số điểm tính từ 子契約 của tháng chu kỳ hiện tại."]),
    F("3.9", "登録日時", "Ngày đăng ký", "th::登録日時", "label", len=["日時 yyyy-mm-dd HH:MM", "yyyy-mm-dd HH:MM"]),
    F("3.10", "操作", "Thao tác", "th::操作", "label", detail=["編集（鉛筆）・削除（ゴミ箱）。削除済の行には出さない。", "Sửa (bút chì), xóa (thùng rác). Không hiện ở dòng đã xóa."]),
    F("3.11", "編集", "Sửa", 'button[aria-label$="を編集"]', "button", "click", cond=FULL, detail=["AW_DISC_003（編集）へ。", "Sang AW_DISC_003 (sửa)."]),
    F("3.12", "削除", "Xóa", 'button[aria-label$="を削除"]', "button", "click", cond=FULL, pattern="P-DEL", err=["Q01", "E37", "S02", "E33"],
      detail=["適用中 0拠点 なら状態 003（削除の確認）、あれば 004（削除できません）。", "適用中 = 0 → trạng thái 003 (xác nhận xóa); đang dùng → 004 (không xóa được)."]),
    F("3.13", "並べ替え", "Sắp xếp", ".es-table thead", "select", "select", req="－",
      len=["選択（値引きID／値引き名／適用対象／利用状態／登録日時）＋ 昇順／降順", "Chọn cột (ID / tên / đối tượng / trạng thái / ngày đăng ký) + tăng/giảm"],
      init=["登録日時 降順", "登録日時 giảm dần"], ex=["値引きID 昇順", "Chọn cột và chiều sắp xếp (STEP7 L2)"], detail=["STEP7 L2・マスタ項目一覧 #9。", "STEP7 L2, マスタ項目一覧 #9."], demo_ok=H_SORT),
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
    {"id": "001", "code": "AW_DISC_001", "state": ["初期表示", "Hiển thị ban đầu"], "url": "/ops/masters/discounts",
     "setup": CLEAR, "full": True, "wait": 500,
     "note": ["フル権限（Ad00010）で表示。ほかの役割では 1.3・1.5・1.7・3.11・3.12 が出ない。", "Hiển thị với フル権限. Vai trò khác không có 1.3, 1.5, 1.7, 3.11, 3.12."],
     "items": LIST_HEADER + LIST_SEARCH + LIST_TABLE + LIST_PAGER},
    {"id": "002", "code": "AW_DISC_001", "state": ["該当なし（0件）", "Không có kết quả (0 dòng)"], "url": "/ops/masters/discounts",
     "setup": CLEAR + "setv(q('.es-search__fields input'),'zzz');q('.es-search__actions button[type=submit]').click();await sleep(500);", "full": False, "wait": 400,
     "items": [F("5", "0件のメッセージ", "Thông báo 0 dòng", ".es-table tbody td[colspan]", "label", "show", err=["I01"], detail=["一覧の中に I01 を1行で出す。", "Hiện I01 trong bảng."], demo_ok=H_EMPTY)]},
    {"id": "003", "code": "AW_DISC_001", "state": ["削除の確認", "Xác nhận xóa"], "url": "/ops/masters/discounts",
     "setup": CLEAR + "q('button[aria-label=\"春の新規キャンペーンを削除\"]').click();await sleep(400);", "full": False, "wait": 400,
     "note": ["適用中 0拠点 の値引き（見本 DC000005 春の新規キャンペーン）のゴミ箱を押したとき。", "Khi nhấn thùng rác của 値引き chưa áp dụng (mẫu DC000005)."],
     "items": [
         F("6", "削除の確認モーダル", "Modal xác nhận xóa", '.es-modal[aria-label="削除しますか？"]', "modal", "show", pattern="P-DEL", err=["Q01"], detail=["Q01（ボタン名＝削除）。本文に値引きID・値引き名。", "Q01 (ボタン名 = 削除). Nội dung có ID, tên."], demo_ok=H_DELMSG),
         F("6.1", "本文", "Nội dung", ".es-modal__body", "label", detail=["Q01 ＋ 対象（DC000005 春の新規キャンペーン）。論理削除。", "Q01 + đối tượng (DC000005). Xóa logic."]),
         F("6.2", "キャンセル", "Hủy", ".es-modal__actions button::キャンセル", "button", "click", detail=["閉じる。何もしない。", "Đóng, không làm gì."]),
         F("6.3", "削除", "Xóa", ".es-modal__actions button::削除", "button", "click", err=["S02", "E33"], detail=["利用状態を「削除済」にし、S02 のトースト。一覧から消える（2.5 が ON）。", "Đổi 利用状態 thành 削除済, toast S02. Biến mất khỏi danh sách (khi 2.5 bật)."]),
     ]},
    {"id": "004", "code": "AW_DISC_001", "state": ["削除できません", "Không xóa được"], "url": "/ops/masters/discounts",
     "setup": CLEAR + "q('button[aria-label=\"お試しキャンペーン割引を削除\"]').click();await sleep(400);", "full": False, "wait": 400,
     "note": ["適用中の拠点がある値引き（見本 DC000013 お試しキャンペーン割引・2拠点）のゴミ箱を押したとき。", "Khi nhấn thùng rác của 値引き đang áp dụng (mẫu DC000013, 2 điểm)."],
     "items": [
         F("7", "削除できませんモーダル", "Modal không xóa được", '.es-modal[aria-label="削除できません"]', "modal", "show", err=["E37"], detail=["件数＝適用中の拠点数。終了にする案内。", "n = số điểm đang áp dụng. Hướng dẫn đổi 終了."]),
         F("7.1", "本文", "Nội dung", ".es-modal__body", "label", detail=["E37 ＋ 対象（DC000013 お試しキャンペーン割引）。", "E37 + đối tượng (DC000013)."]),
         F("7.2", "閉じる", "Đóng", ".es-modal__actions button::閉じる", "button", "click"),
     ]},


]

# ================================================================ AW_DISC_002 詳細
D_HEADER = [
    F("1", "ヘッダー", "Đầu trang", ".phead", "area"),
    F("1.1", "パンくず", "Breadcrumb", ".crumb", "label", detail=["「マスタ管理 / 値引きマスタ一覧 / 値引き詳細」。", "「マスタ管理 / 値引きマスタ一覧 / 値引き詳細」."]),
    F("1.2", "画面名", "Tên màn hình", ".phead h2", "label", detail=["「値引き詳細」＋ 値引きID。", "「値引き詳細」 + 値引きID."]),
    F("1.3", "削除", "Xóa", ".pbtn button.del", "button", "click", cond=FULL, pattern="P-DEL", err=["Q01", "E37", "S02"], detail=["一覧の削除と同じ（Q01 → S02 → 一覧へ。適用中なら E37）。", "Giống xóa ở danh sách (Q01 → S02 → về danh sách; đang dùng thì E37)."]),
    F("1.4", "編集", "Sửa", ".pbtn button.save", "button", "click", cond=FULL, detail=["AW_DISC_003（編集）へ。削除済では出さない。", "Sang AW_DISC_003 (sửa). Đã xóa thì không hiện."]),
]
D_SUM = [
    F("2", "サマリー", "Tóm tắt", ".sumbar", "area", detail=["保存済みの値から作る。", "Tạo từ giá trị đã lưu."]),
    F("2.1", "値引きID", "Mã giảm giá", ".sumbar .s::値引きID", "label"),
    F("2.2", "値引き名", "Tên giảm giá", ".sumbar .s::値引き名", "label", detail=["値引き名（管理用）。", "値引き名（管理用）."]),
    F("2.3", "値引き区分", "Loại giảm giá", ".sumbar .s::値引き区分", "label"),
    F("2.4", "適用対象", "Đối tượng áp dụng", ".sumbar .s::適用対象", "label"),
    F("2.5", "計算区分", "Cách tính", ".sumbar .s::計算区分", "label"),
    F("2.6", "適用中", "Đang áp dụng", ".sumbar .s::適用中", "label", len=["整数＋「拠点」", "Số nguyên + điểm"]),
]
D_TABS = [
    F("3", "タブ", "Tab", ".tabs", "area", detail=["基本情報／計算・条件／適用・履歴。", "基本情報 / 計算・条件 / 適用・履歴."]),
    F("3.1", "基本情報", "Thông tin cơ bản", ".tabs [role=tab]::基本情報", "tab", "click"),
    F("3.2", "計算・条件", "Cách tính, điều kiện", ".tabs [role=tab]::計算・条件", "tab", "click"),
    F("3.3", "適用・履歴", "Áp dụng, lịch sử", ".tabs [role=tab]::適用・履歴", "tab", "click"),
]
D_BASIC = [
    F("4", "基本情報", "Thông tin cơ bản", "#sec-0", "area", detail=["項目の決まりは AW_DISC_003 の 3 を参照（ここは表示だけ）。", "Quy tắc mục xem AW_DISC_003 mục 3 (ở đây chỉ xem)."]),
    F("4.1", "値引きID", "Mã giảm giá", '.f[data-name="値引きID"]', "label"),
    F("4.2", "値引き名（管理用）", "Tên (quản lý)", '.f[data-name="値引き名（管理用）"]', "label"),
    F("4.3", "管理用コード", "Mã quản lý", '.f[data-name="管理用コード"]', "label"),
    F("4.4", "請求書表示名", "Tên trên hóa đơn", '.f[data-name="請求書表示名"]', "label"),
    F("4.5", "値引き区分", "Loại giảm giá", '.f[data-name="値引き区分"]', "label"),
    F("4.6", "紹介フィープラン（請求名称）", "Plan phí giới thiệu", '.f[data-name="紹介フィープラン（請求名称）"]', "label"),
    F("4.7", "公開ステータス", "Trạng thái công khai", '.f[data-name="公開ステータス"]', "label"),
    F("4.8", "利用状態", "Trạng thái sử dụng", '.f[data-name="利用状態"]', "label"),
    F("4.9", "説明", "Mô tả", '.f[data-name="説明"]', "label"),
]
V_DETAIL = [
    {"id": "007", "code": "AW_DISC_002", "state": ["初期表示（タブ 基本情報）", "Hiển thị ban đầu (tab 基本情報)"], "url": "/ops/masters/discounts/DC000013",
     "setup": "", "full": True, "wait": 600,
     "note": ["見本 DC000013 お試しキャンペーン割引（プラン料金を参照・自動で付く）。", "Mẫu DC000013 (tham chiếu phí plan, tự gắn)."],
     "items": D_HEADER + D_SUM + D_TABS + D_BASIC},
    {"id": "008", "code": "AW_DISC_002", "state": ["タブ 計算・条件", "Tab 計算・条件"], "url": "/ops/masters/discounts/DC000013",
     "setup": TAB("計算・条件") + "window.scrollTo(0,q('#sec-0').offsetTop-80);", "full": True, "wait": 400,
     "items": [
         F("5", "値引きの計算", "Cách tính giảm giá", "#sec-0", "area", detail=["AW_DISC_003 の 4 を参照（表示だけ）。", "Xem AW_DISC_003 mục 4 (chỉ xem)."]),
         F("5.1", "適用対象", "Đối tượng áp dụng", '.f[data-name="適用対象"]', "label"),
         F("5.2", "対象オプション", "Option áp dụng", '.f[data-name="対象オプション"]', "label", detail=["適用対象＝オプション料金 のときだけ。", "Chỉ khi 適用対象 = オプション料金."]),
         F("5.3", "計算区分", "Cách tính", '.f[data-name="計算区分"]', "label"),
         F("5.4", "値引きの値", "Giá trị giảm", '.f[data-name="値引きの値"]', "label", detail=["計算区分ごとの表記（固定額＝円／料率＝%と上限／差額自動・プラン参照＝説明）。", "Hiển thị theo 計算区分 (固定額 = yên / 料率 = % và giới hạn / 差額自動・プラン参照 = chú thích)."]),
         F("5.5", "税率の扱い", "Cách xử lý thuế", '.f[data-name="税率の扱い"]', "label"),
         F("5.6", "税率（個別に指定）", "Thuế suất (chỉ định riêng)", '.f[data-name="税率（個別に指定）"]', "label", demo_ok=H_TAX),
         F("5.7", "重ねがけ", "Cộng dồn", '.f[data-name="重ねがけ"]', "label"),
         F("5.8", "適用順", "Thứ tự áp dụng", '.f[data-name="適用順"]', "label"),
         F("6", "適用期間とつけられる拠点", "Kỳ áp dụng và điểm được gắn", "#sec-1", "area", detail=["AW_DISC_003 の 5 を参照（表示だけ）。", "Xem AW_DISC_003 mục 5 (chỉ xem)."]),
         F("6.1", "値引きの種別", "Loại giảm giá (kỳ)", '.f[data-name="値引きの種別"]', "label"),
         F("6.2", "適用期間の持ち方", "Cách giữ kỳ áp dụng", '.f[data-name="適用期間の持ち方"]', "label"),
         F("6.3", "適用月数", "Số tháng áp dụng", '.f[data-name="適用月数"]', "label"),
         F("6.4", "つけられる拠点の条件", "Điều kiện điểm được gắn", '.f[data-name="つけられる拠点の条件"]', "label"),
         F("6.5", "対象のプラン・コース", "Plan, course áp dụng", '.f[data-name="対象のプラン・コース"]', "label", detail=["すべてのときは「すべて」と出す（AW_DISC_003 の 5.5）。", "Nếu là tất cả thì hiện 「すべて」 (AW_DISC_003 mục 5.5)."]),
         F("6.6", "回数の上限", "Giới hạn số lần", '.f[data-name="回数の上限"]', "label"),
         F("6.7", "自動で付ける条件", "Điều kiện tự gắn", '.f[data-name="自動で付ける条件"]', "label"),
         F("6.8", "受付期間", "Kỳ tiếp nhận", '.f[data-name="受付期間"]', "label"),
     ]},
    {"id": "009", "code": "AW_DISC_002", "state": ["タブ 適用・履歴", "Tab 適用・履歴"], "url": "/ops/masters/discounts/DC000013",
     "setup": TAB("適用・履歴") + "window.scrollTo(0,q('#sec-0').offsetTop-80);", "full": True, "wait": 400,
     "items": [
         F("7", "適用一覧", "Danh sách áp dụng", "#sec-0", "area",
           detail=["この値引きが付いている拠点を、今のサイクル月の子契約から出す（表示だけ・台帳 42）。付ける・外すは子契約（オプション・割引の異動）か、一覧の「適用 CSV取込」で行う。このタブに CSV のボタンは置かない。", "Các điểm đang gắn 値引き này, lấy từ 子契約 tháng hiện tại (chỉ xem, 台帳 42). Gắn/gỡ làm ở 子契約 hoặc 「適用 CSV取込」 ở danh sách. Tab này không có nút CSV."]),
         F("7.1", "適用の状態（絞り込み）", "Lọc theo trạng thái áp dụng", 'select[aria-label="適用の状態"]', "select", "select", req="－",
           len=["選択（適用中／終了／すべて）", "Chọn (đang áp dụng / đã kết thúc / tất cả)"], init=["適用中", "Đang áp dụng"], ex=["すべて", "Xem cả các điểm đã kết thúc"],
           detail=["表の上のドロップダウンで絞り込む（機種マスタの貸出中の拠点と同じ形）。「終了分も表示」のトグルボタンは置かない（hong 2026/10/05）。", "Dropdown phía trên bảng (giống 貸出中の拠点 ở 機種マスタ). Không dùng nút toggle 「終了分も表示」 (hong 2026/10/05)."]),
         F("7.2", "適用一覧の表", "Bảng áp dụng", "#sec-0 table", "table",
           detail=["拠点ID（拠点の設備・オプションへリンク）／拠点名／適用開始月（yyyy-mm）／適用終了月（空欄＝適用中。月数指定のときは自動）／値引き額（税抜・差額自動は算出した額）／登録方法（手動登録／CSV取込／自動）。", "拠点ID (link sang 設備・オプション của điểm) / 拠点名 / 適用開始月 (yyyy-mm) / 適用終了月 (trống = đang áp dụng; 月数指定 thì tự tính) / 値引き額 (chưa thuế; 差額自動 = số đã tính) / 登録方法 (thủ công / CSV / tự động)."]),
         F("8", "履歴（値引きマスタ）", "Lịch sử (値引きマスタ)", "#sec-1", "table", detail=["値引きマスタの変更（手入力・CSV取込・適用の CSV取込）を新しい順に出す。", "Thay đổi của 値引き (nhập tay, CSV, CSV áp dụng) mới nhất trước."]),
         F("8.1", "変更日時", "Thời điểm", "#sec-1 th::変更日時", "label", len=["日時 yyyy-mm-dd HH:MM", "yyyy-mm-dd HH:MM"]),
         F("8.2", "変更内容", "Nội dung", "#sec-1 th::変更内容", "label", detail=["項目名「変更前」→「変更後」。適用の CSV取込は「n拠点に適用」。", "Tên mục 「trước」→「sau」. CSV áp dụng: 「n拠点に適用」."]),
         F("8.3", "変更者", "Người thay đổi", "#sec-1 th::変更者", "label"),
         F("8.4", "変更区分", "Loại thay đổi", "#sec-1 th::変更区分", "label", len=["手入力／CSV取込", "Nhập tay / nhập CSV"]),
     ]},
]

# ================================================================ AW_DISC_003 登録・編集
N_HEADER = [
    F("1", "ヘッダー", "Đầu trang", ".phead", "area"),
    F("1.1", "パンくず", "Breadcrumb", ".crumb", "label", detail=["「マスタ管理 / 値引きマスタ一覧 / 値引き新規登録（または 値引き編集）」。", "「マスタ管理 / 値引きマスタ一覧 / 値引き新規登録 (hoặc 値引き編集)」."]),
    F("1.2", "画面名", "Tên màn hình", ".phead h2", "label", detail=["新規登録「値引き新規登録」、編集「値引き編集」＋値引きID。編集ではサマリー（AW_DISC_002 の 2）も出す。", "Mới: 「値引き新規登録」; sửa: 「値引き編集」 + ID. Màn sửa có thêm summary."]),
    F("1.3", "キャンセル", "Hủy", ".pbtn button.cancel", "button", "click", err=["Q02"], detail=["入力を変えていれば Q02（状態 016）。一覧または詳細へ戻る。", "Đã sửa thì Q02 (trạng thái 016). Về danh sách hoặc chi tiết."]),
    F("1.4", "登録／保存", "Đăng ký / Lưu", ".pbtn button.save", "button", "click", pattern="P-FORMBOX", err=["S01", "E31", "E36"],
      detail=["新規登録「登録」・編集「保存」。全項目をまとめてチェック（必須 E01・数値 E14・文字数 E04・管理用コードの重複 E09・受付期間 E08）。通ったら S01、新規は採番した ID（DC＋6桁）の詳細へ、編集は詳細へ。削除済は E36。",
              "Mới: 「登録」; sửa: 「保存」. Kiểm tra mọi mục cùng lúc (E01, E14, E04, trùng 管理用コード E09, 受付期間 E08). Qua thì S01; mới → chi tiết của ID vừa cấp (DC + 6 số), sửa → chi tiết. Đã xóa: E36."]),
]
N_TABS = [F("2", "タブ", "Tab", ".tabs", "area", detail=["AW_DISC_002 の 3 と同じ。保存時にエラーの項目がほかのタブにあれば、そのタブを開く。適用・履歴は新規登録では空（表示だけ）。", "Giống AW_DISC_002 mục 3. Lỗi ở tab khác thì mở tab đó khi lưu. 適用・履歴 ở màn mới thì trống (chỉ xem)."])]
N_BASIC = [
    F("3", "基本情報", "Thông tin cơ bản", "#sec-0", "area", pattern="P-FORMBOX"),
    F("3.1", "値引きID", "Mã giảm giá", '.f[data-name="値引きID"]', "label", len=["文字列 DC＋6桁", "DC + 6 số"], init=["新規「（登録時に採番）」／編集は採番済みの ID", "Mới: 「（登録時に採番）」; sửa: ID đã cấp"],
      detail=["システムが採番（DC＋6桁・連番）。採番後は変えない。物理名 discount.no。", "Hệ thống cấp (DC + 6 số). Không đổi sau khi cấp. discount.no."]),
    F("3.2", "値引き名（管理用）", "Tên (quản lý)", '.f[data-name="値引き名（管理用）"] input', "text", "input", req="○", len="文字列 60", init=["空", "Trống"], ex=["お試しキャンペーン割引", "Tên nội bộ, dùng ở danh sách và tìm kiếm; không ra hóa đơn"], err=["E01", "E04", "E13"],
      detail=["一覧・検索で使う運営向けの名前。請求書には出ない。物理名 discount.name。", "Tên nội bộ cho danh sách / tìm kiếm; không ra hóa đơn. discount.name."], demo_ok=H_MAXLEN),
    F("3.3", "管理用コード", "Mã quản lý", '.f[data-name="管理用コード"] input', "text", "input", req="○", len=["文字列 40（半角英数字・ハイフン）", "Chuỗi 40 (chữ số nửa góc, gạch nối)"], init=["空", "Trống"], ex=["TRIAL-FREE", "Mã đang dùng ở bảng quản lý ngoài hệ thống; khóa CSV"], err=["E01", "E04", "E09"],
      valid=["ほかの値引きと重複しない（E09）。", "Không trùng với 値引き khác (E09)."], detail=["システム外の管理表のコードをそのまま入れる。CSV取込のキーになる。物理名 discount.code_admin。", "Nhập nguyên mã ở bảng quản lý ngoài hệ thống; là khóa CSV. discount.code_admin."], demo_ok=H_MAXLEN),
    F("3.4", "請求書表示名", "Tên trên hóa đơn", '.f[data-name="請求書表示名"] input', "text", "input", req="○", len="文字列 60", init=["空", "Trống"], ex=["お試しキャンペーン割引", "Tên dòng giảm giá (âm) trên hóa đơn"], err=["E01", "E04", "E13", "W02"],
      detail=["請求書に出る値引き行の名前（マイナスの費目行）。物理名 discount.name_invoice。", "Tên dòng giảm giá trên hóa đơn (dòng phí âm). discount.name_invoice."], demo_ok=H_MAXLEN),
    F("3.5", "値引き区分", "Loại giảm giá", '.f[data-name="値引き区分"] select', "select", "select", req="○",
      len=["選択（値引き区分マスタの使用中の区分。初期値：キャンペーン割引／代理店割引／他社乗り換え割引／紹介割引／ボリュームディスカウント／アップグレード差額）", "Chọn (các loại đang dùng trong master loại giảm giá; ban đầu: khuyến mãi / đại lý / chuyển từ công ty khác / giới thiệu / số lượng / chênh lệch nâng cấp)"], init=["未選択", "Chưa chọn"], ex=["代理店割引", "Loại dùng cho tổng hợp và thứ tự"],
      err=["E02"],
      detail=["値引き区分マスタ（名前・並び順。運営が足せる。オプション区分マスタと同じ形・hong 2026/10/05「値引きもオプションと同じに」）から選ぶ。アップグレード差額＝旧 料金改定差額（28-170）。企業負担額と価格調整は子契約の入力項目で、ここには持たない。物理名 discount.category_id。", "Chọn từ 値引き区分マスタ (tên, thứ tự; 運営 thêm được; cùng dạng với オプション区分マスタ, hong 2026/10/05). アップグレード差額 = tên cũ 料金改定差額 (28-170). 企業負担額 và 価格調整 là mục của 子契約. discount.category_id."],
      demo_ok=["コードは固定の6つの選択肢（受付簿 #144・区分マスタは別画面として作る）。仕様が正", "Code là 6 lựa chọn cố định (受付簿 #144; master loại là màn hình riêng). Spec đúng"]),
    F("3.6", "紹介フィープラン（請求名称）", "Plan phí giới thiệu", '.f[data-name="紹介フィープラン（請求名称）"] select', "select", "select", req="条件付き",
      len=["選択（—（連動なし）／紹介フィーマスタのプラン）", "Chọn (— không liên kết / plan trong master phí giới thiệu)"], init=["—（連動なし）", "— (không liên kết)"], ex=["RFP000002 B：代理店紹介", "Bắt buộc khi 値引き区分 = 代理店割引 / 紹介割引"],
      cond=["値引き区分＝代理店割引・紹介割引 のとき", "Khi 値引き区分 = 代理店割引 / 紹介割引"], err=["E02"],
      detail=["代理店への支払い（支払履歴）にはこのプラン名で出る。お客様の請求書には 3.4 の名前で出る。物理名 discount.referral_fee_plan_id。", "Chi trả cho đại lý (支払履歴) hiện theo tên plan này; hóa đơn khách hiện theo 3.4. discount.referral_fee_plan_id."]),
    F("3.7", "公開ステータス", "Trạng thái công khai", '.f[data-name="公開ステータス"] select', "select", "select", req="○", len=["選択（公開／非公開）", "Chọn (công khai / không công khai)"], init=["公開", "公開 (công khai)"], ex=["非公開", "公開 = hiện tên 値引き trên 法人Web; hóa đơn luôn có"],
      detail=["公開＝法人Webに値引きの名前を出す（申込フォームのキャンペーンなど）。非公開＝運営だけが見る。請求書には必ず出る。物理名 discount.public_status。", "公開 = hiện tên trên 法人Web (vd khuyến mãi ở form đăng ký). 非公開 = chỉ 運営. Hóa đơn luôn hiện. discount.public_status."]),
    F("3.8", "利用状態", "Trạng thái sử dụng", '.f[data-name="利用状態"] select', "select", "select", req="○", len=["選択（使用中／終了）", "Chọn (đang dùng / kết thúc)"], init=["使用中", "使用中 (đang dùng)"], ex=["使用中", "終了 = không gắn mới; điểm đang áp dụng tiếp tục"],
      detail=["終了にしても、すでに適用中の拠点はそのまま続く。削除済は削除の操作で付く。物理名 discount.status。", "終了 thì điểm đang áp dụng vẫn tiếp tục; chỉ không gắn mới. 削除済 do thao tác xóa. discount.status."]),
    F("3.9", "説明", "Mô tả", '.f[data-name="説明"] textarea', "textarea", "input", req="－", len=["文字列 500（複数行）", "Chuỗi 500 (nhiều dòng)"], init=["空", "Trống"], ex=["50プラン ESライト（冷蔵庫）の料金分。請求額を超えない", "Giải thích để 運営 không nhầm khi gắn"], err=["E04", "E13"],
      detail=["適用の判断に迷わないための説明。物理名 discount.description。", "Mô tả nội bộ. discount.description."], demo_ok=H_MAXLEN),
]
N_CALC = [
    F("4", "値引きの計算", "Cách tính giảm giá", "#sec-0", "area", pattern="P-FORMBOX"),
    F("4.1", "適用対象", "Đối tượng áp dụng", '.f[data-name="適用対象"] select', "select", "select", req="○",
      len=["選択（プラン料金／オプション料金／設備料金／初期料金／請求全体）", "Chọn (phí plan / phí option / phí thiết bị / phí ban đầu / toàn hóa đơn)"], init=["プラン料金", "プラン料金 (phí plan)"], ex=["オプション料金", "オプション料金 + 4.2 = giảm cho 1 option (vd miễn 配送回数追加)"],
      detail=["初期料金＝プラン・設備の初期料金。オプションの単発料金を引くときは「オプション料金」＋対象オプション（2026/09/29）。物理名 discount.target。", "初期料金 = phí ban đầu của plan / thiết bị. Giảm phí 1 lần của option thì chọn オプション料金 + 対象オプション (2026/09/29). discount.target."]),
    F("4.2", "対象オプション", "Option áp dụng", '.f[data-name="対象オプション"] select', "select", "select", req="条件付き",
      len=["選択（（すべてのオプション）／オプションマスタの使用中のオプション）", "Chọn (mọi option / các option đang dùng trong master option)"], init=["（すべてのオプション）", "(mọi option)"], ex=["OP000001 配送回数追加", "Chỉ bật khi 適用対象 = オプション料金"],
      cond=["適用対象＝オプション料金 のときだけ活性", "Chỉ bật khi 適用対象 = オプション料金"], detail=["先頭の「（すべてのオプション）」＝空欄＝すべて。物理名 discount.target_option_id。", "「（すべてのオプション）」 = trống = tất cả. discount.target_option_id."]),
    F("4.3", "計算区分", "Cách tính", '.f[data-name="計算区分"] select', "select", "select", req="○",
      len=["選択（固定額／料率／差額自動／プラン料金を参照）", "Chọn (số tiền cố định / tỷ lệ / chênh lệch tự động / tham chiếu phí plan)"], init=["固定額", "固定額 (cố định)"], ex=["料率", "差額自動 = スタンダード − ライト cùng thế hệ (DC000021); プラン料金を参照 = lấy 月額 của plan/course tham chiếu (DC000013)"],
      detail=["差額自動＝同じプラン・同じ世代・同じ配送便の スタンダード料金 − ライト料金（28-170・28-174）。プラン料金を参照＝参照するプラン・コースのプランマスタの該当月額を値引き額にし、請求額を超えない（STEP3 Q3）。物理名 discount.calc_type。", "差額自動 = スタンダード − ライト cùng plan / thế hệ / phương thức giao (28-170, 28-174). プラン料金を参照 = lấy 月額 của plan/course tham chiếu, không vượt số tiền hóa đơn (STEP3 Q3). discount.calc_type."]),
    F("4.4", "値引きの値", "Giá trị giảm", '.f[data-name="値引きの値"] input', "text", "input", req="条件付き", len=["固定額：金額（整数・税抜）／料率：数値 0.01〜100.00（%）＋上限額（整数・空欄＝上限なし）", "Cố định: số tiền (nguyên, chưa thuế) / tỷ lệ: số 0,01–100,00 (%) + giới hạn (nguyên, trống = không)"],
      init=["空", "Trống"], ex=["5", "料率 5% (giới hạn 5000 yên) / 固定額 3000 yên"], err=["E01", "E14", "E12"],
      cond=["固定額・料率 のとき必須。差額自動・プラン料金を参照 のときは入力欄を非活性にし、基準（差額自動）か参照するプラン・コース（プラン料金を参照）を出す", "Bắt buộc khi 固定額 / 料率. Với 差額自動 / プラン料金を参照 thì vô hiệu, hiện cơ sở tính hoặc plan/course tham chiếu"],
      detail=["計算区分で入力欄が切り替わる：固定額＝金額（円・税抜）／料率＝率（%）＋上限額／差額自動＝基準の説明／プラン料金を参照＝参照するプランとコース（ドロップダウン）。使わない欄は非活性。物理名 discount.amount／rate／cap_amount／auto_basis／ref_plan_id。", "Ô đổi theo 計算区分: 固定額 = tiền / 料率 = % + giới hạn / 差額自動 = chú thích cơ sở / プラン料金を参照 = plan và course tham chiếu (dropdown). Ô không dùng thì vô hiệu. discount.amount / rate / cap_amount / auto_basis / ref_plan_id."],
      demo_ok=["コードは1つの文字欄だけ（料率の上限額・参照プランの選択は宿題）。仕様が正", "Code chỉ có 1 ô chữ (giới hạn của 料率, chọn plan tham chiếu là 宿題). Spec đúng"]),
    F("4.5", "税率の扱い", "Cách xử lý thuế", '.f[data-name="税率の扱い"] select', "select", "select", req="○", len=["選択（元の費目と同じ／個別に指定）", "Chọn (giống mục gốc / chỉ định riêng)"], init=["元の費目と同じ", "元の費目と同じ (giống mục gốc)"], ex=["元の費目と同じ", "Hóa đơn có 8% và 10% thì quyết định trừ từ dòng nào"],
      detail=["8% と 10% が混ざる請求書で、どちらから引くかが決まる。DC000013 はプラン50・ライトの内訳どおりに分けて引く。物理名 discount.tax_rule。", "Quyết định trừ từ dòng 8% hay 10%. DC000013 tách theo cơ cấu của plan 50 Light. discount.tax_rule."]),
    F("4.6", "税率（個別に指定）", "Thuế suất (chỉ định riêng)", '.f[data-name="税率（個別に指定）"]', "select", "select", req="条件付き", len=["選択（税率マスタ）", "Chọn (master thuế suất)"], init=["10%", "10%"], ex=["10%", "Chỉ khi 税率の扱い = 個別に指定"],
      cond=["税率の扱い＝個別に指定 のときだけ活性", "Chỉ bật khi 税率の扱い = 個別に指定"], detail=["税率マスタから選ぶ（台帳 E）。物理名 discount.tax_rate_id。", "Chọn từ 税率マスタ (台帳 E). discount.tax_rate_id."], demo_ok=H_TAX),
    F("4.7", "重ねがけ", "Cộng dồn", '.f[data-name="重ねがけ"] select', "select", "select", req="○", len=["選択（可／不可）", "Chọn (được / không)"], init=["可", "可 (được)"], ex=["可", "Có cho phép gắn cùng 値引き khác không"],
      detail=["キャンペーン＋代理店＋ボリュームが同時にかかる前提のため既定は「可」。物理名 discount.stackable。", "Mặc định 可 vì khuyến mãi + đại lý + số lượng có thể cùng lúc. discount.stackable."]),
    F("4.8", "適用順", "Thứ tự áp dụng", '.f[data-name="適用順"] input', "text", "input", req="○", len=["整数 1〜999", "Số nguyên 1–999"], init=["空", "Trống"], ex=["20", "Nhỏ áp dụng trước; nên 額 trước, 率 sau"], err=["E01", "E14"],
      detail=["小さい順にかける。複数の値引きが重なると順番で金額が変わるため必ず持つ。目安は「額を先、率をあと」。物理名 discount.apply_order。", "Nhỏ trước. Bắt buộc vì nhiều 値引き chồng nhau thì thứ tự đổi số tiền. Gợi ý: 額 trước, 率 sau. discount.apply_order."]),
    F("5", "適用期間とつけられる拠点", "Kỳ áp dụng và điểm được gắn", "#sec-1", "area", pattern="P-FORMBOX",
      detail=["自動で効かせる条件ではなく、子契約でつけるときのチェック（合わない拠点では選べない）。", "Không phải điều kiện tự có hiệu lực mà là kiểm tra khi gắn ở 子契約 (điểm không khớp thì không chọn được)."]),
    F("5.1", "値引きの種別", "Loại giảm giá (kỳ)", '.f[data-name="値引きの種別"] select', "select", "select", req="○", len=["選択（毎月（継続）／単発（1回））", "Chọn (hằng tháng liên tục / 1 lần)"], init=["毎月（継続）", "毎月（継続） (hằng tháng)"], ex=["毎月（継続）", "毎月 = lập dòng giảm ở ① mỗi tháng trong kỳ; 単発 = 1 lần"],
      detail=["毎月＝付けた子契約から、適用期間のあいだ毎月の子契約の①に値引きの行を立てる。単発＝付けた子契約の①に1回だけ（適用期間は使わない）（28-172）。物理名 discount.charge_type。", "毎月 = từ 子契約 được gắn, mỗi tháng trong kỳ lập dòng giảm ở ①. 単発 = chỉ 1 lần (không dùng 適用期間) (28-172). discount.charge_type."]),
    F("5.2", "適用期間の持ち方", "Cách giữ kỳ áp dụng", '.f[data-name="適用期間の持ち方"] select', "select", "select", req="条件付き", len=["選択（無期限／月数指定）", "Chọn (vô thời hạn / số tháng)"], init=["無期限", "無期限 (vô thời hạn)"], ex=["月数指定", "Khuyến mãi 3 tháng đầu = 月数指定 + 5.3"],
      cond=["値引きの種別＝毎月 のとき。単発では「—（単発のため使わない）」", "Khi 値引きの種別 = 毎月; 単発 thì 「—」"], detail=["物理名 discount.term_type。", "discount.term_type."]),
    F("5.3", "適用月数", "Số tháng áp dụng", '.f[data-name="適用月数"] input', "text", "input", req="条件付き", len=["整数 1〜120（ヶ月）", "Số nguyên 1–120 (tháng)"], init=["空", "Trống"], ex=["3", "Tính từ tháng bắt đầu; tháng kết thúc tự tính"], err=["E01", "E14", "E12"],
      cond=["毎月 かつ 月数指定 のとき必須。それ以外は非活性", "Bắt buộc khi 毎月 và 月数指定; còn lại vô hiệu"], detail=["適用開始月から数える。終了月は自動計算。物理名 discount.term_months。", "Đếm từ tháng bắt đầu; tháng kết thúc tự tính. discount.term_months."]),
    F("5.4", "つけられる拠点の条件", "Điều kiện điểm được gắn", '.f[data-name="つけられる拠点の条件"]', "select", "select", req="－",
      len=["対象代理店コード：選択（すべて／代理店マスタの代理店）／契約種別の制限：選択（制限なし／お試しキャンペーンは対象外／本導入のみ／お試しキャンペーンのみ）", "Mã đại lý: chọn (tất cả / đại lý trong master đại lý) / giới hạn loại hợp đồng: chọn (không / trừ dùng thử / chỉ chính thức / chỉ dùng thử)"],
      init=["すべて／お試しキャンペーンは対象外", "Tất cả / trừ お試しキャンペーン"], ex=["AG00021 株式会社パートナーズ／制限なし", "代理店割引 chỉ gắn cho điểm có cùng đại lý ở hợp đồng cha"],
      detail=["対象代理店コード＝代理店割引のとき、親契約の代理店コードと一致する拠点だけ。契約種別の制限＝お試しキャンペーンは既定で対象外。物理名 discount.scope_agency／scope_contract_type。", "対象代理店コード: với 代理店割引, chỉ điểm có cùng đại lý ở hợp đồng cha. 契約種別の制限: mặc định trừ お試し. discount.scope_agency / scope_contract_type."]),
    F("5.5", "対象のプラン・コース", "Plan, course áp dụng", '.f[data-name="対象のプラン・コース"]', "check", "check", req="○", len=["チェック（すべて／ESスタンダード／ESライト（冷蔵庫）／ESライト（自販機））＋ プラン（複数選択）", "Checkbox (tất cả / 3 course) + plan (chọn nhiều)"], init=["「すべて」ON", "「すべて」 bật"], ex=["ESスタンダード", "Bỏ 「すべて」 rồi chọn riêng; DC000021 = chỉ ESスタンダード"],
      detail=["先頭の「すべて」が既定で ON。外すと個別のコース・プランを選べる（1つも選ばないと E02）。一覧・詳細では「すべて」と出す。オプションの対象のコースと同じ形（hong 2026/10/05）。物理名 discount.target_courses／target_plans（空＝すべて）。", "「すべて」 đầu tiên mặc định bật; bỏ thì chọn riêng course / plan (không chọn gì → E02). Danh sách / chi tiết hiện 「すべて」. Giống 対象のコース của option (hong 2026/10/05). discount.target_courses / target_plans (trống = tất cả)."],
      demo_ok=["コードは「すべて」のチェックがなく、プランの欄は文字だけ（受付簿 #145）。仕様が正", "Code chưa có check 「すべて」, ô plan chỉ là chữ (受付簿 #145). Spec đúng"]),
    F("5.6", "回数の上限", "Giới hạn số lần", '.f[data-name="回数の上限"]', "select", "select", req="－", len=["選択（上限なし／法人ごとに1回／拠点ごとに1回／法人ごとにN回／拠点ごとにN回）＋ N（整数 2〜99）", "Chọn (không / 1 lần mỗi công ty / 1 lần mỗi điểm / N lần mỗi công ty / N lần mỗi điểm) + N (2–99)"], init=["上限なし", "上限なし (không)"], ex=["法人ごとに1回", "DC000013 = 1 lần mỗi công ty"],
      detail=["法人ごと＝請求先が法人ならどの請求でも可、拠点ごとに請求するときは最初の拠点。物理名 discount.limit_scope／limit_count。", "Theo công ty: nếu người thanh toán là công ty thì bất kỳ hóa đơn nào; thanh toán theo điểm thì điểm đầu tiên. discount.limit_scope / limit_count."]),
    F("5.7", "自動で付ける条件", "Điều kiện tự gắn", '.f[data-name="自動で付ける条件"] select', "select", "select", req="－", len=["選択（付けない（手で付ける）／契約種別＝お試しキャンペーン／契約項目に連動）", "Chọn (không tự gắn / loại hợp đồng = dùng thử / liên kết mục hợp đồng)"], init=["付けない（手で付ける）", "付けない (gắn tay)"], ex=["契約種別＝お試しキャンペーン", "DC000013 tự gắn cho 子契約 お試し"],
      detail=["物理名 discount.auto_rule。", "discount.auto_rule."]),
    F("5.8", "受付期間", "Kỳ tiếp nhận", '.f[data-name="受付期間"]', "date", "input", req="－", len=["日付 yyyy-mm-dd（開始日）〜 日付（終了日）", "yyyy-mm-dd (bắt đầu) 〜 (kết thúc)"], init=["空＝期限なし", "Trống = không hạn"], ex=["2026-10-01 〜 2026-12-31", "Kỳ được phép gắn 値引き (khuyến mãi); khác với 適用月数"], err=["E08"],
      detail=["値引きを付けられる期間。適用月数とは別。DC000021 の申請期限は終了日で表す（決まるまでは空欄）。物理名 discount.accept_from／accept_to。", "Kỳ được gắn 値引き; khác 適用月数. Hạn đăng ký của DC000021 = ngày kết thúc (chưa định thì trống). discount.accept_from / accept_to."]),
]
V_FORM = [
    {"id": "010", "code": "AW_DISC_003", "state": ["新規登録 初期表示（タブ 基本情報）", "Đăng ký mới (tab 基本情報)"], "url": "/ops/masters/discounts/new",
     "setup": "", "full": True, "wait": 600,
     "note": ["フル権限だけが開ける。入力の共通基準（空白・全角→半角・文字数）は P-FORMBOX。", "Chỉ フル権限 mở được. Quy tắc nhập chung xem P-FORMBOX."],
     "items": N_HEADER + N_TABS + N_BASIC},
    {"id": "011", "code": "AW_DISC_003", "state": ["新規登録 タブ 計算・条件", "Đăng ký mới, tab 計算・条件"], "url": "/ops/masters/discounts/new",
     "setup": TAB("計算・条件") + "window.scrollTo(0,q('#sec-0').offsetTop-80);", "full": True, "wait": 400, "items": N_CALC},
    {"id": "012", "code": "AW_DISC_003", "state": ["新規登録 計算・条件（オプション料金・料率・個別の税率・月数指定）", "Đăng ký mới, 計算・条件 (オプション料金, 料率, thuế riêng, 月数指定)"], "url": "/ops/masters/discounts/new",
     "setup": TAB("計算・条件") + "sets(q('.f[data-name=\"適用対象\"] select'),'オプション料金');sets(q('.f[data-name=\"計算区分\"] select'),'料率');sets(q('.f[data-name=\"税率の扱い\"] select'),'個別に指定');sets(q('.f[data-name=\"適用期間の持ち方\"] select'),'月数指定');await sleep(400);window.scrollTo(0,q('#sec-0').offsetTop-80);", "full": True, "wait": 400,
     "note": ["選択で切り替わる欄：対象オプション（オプション料金のとき）、値引きの値（料率＝%＋上限額）、税率（個別に指定）、適用月数（月数指定）。", "Các ô đổi theo lựa chọn: 対象オプション (khi オプション料金), 値引きの値 (料率 = % + giới hạn), 税率 (個別に指定), 適用月数 (月数指定)."],
     "items": [
         F("6", "選択で切り替わる欄", "Các ô đổi theo lựa chọn", "#sec-0", "area", detail=["4.2・4.4・4.6・5.3 が活性になる。ほかの組み合わせでは非活性（空のまま保存できる）。", "4.2, 4.4, 4.6, 5.3 được bật. Tổ hợp khác thì vô hiệu (lưu được khi trống)."],
           demo_ok=["コードは対象オプションが非活性のまま（切り替えは宿題）。仕様が正", "Code vẫn để 対象オプション vô hiệu (đổi theo lựa chọn là 宿題). Spec đúng"]),
     ]},
    {"id": "013", "code": "AW_DISC_003", "state": ["新規登録 タブ 適用・履歴", "Đăng ký mới, tab 適用・履歴"], "url": "/ops/masters/discounts/new",
     "setup": TAB("適用・履歴") + "window.scrollTo(0,q('#sec-0').offsetTop-80);", "full": False, "wait": 400,
     "items": [
         F("7", "適用一覧（新規登録）", "Danh sách áp dụng (màn mới)", "#sec-0", "area", detail=["新規登録・編集でも表示だけ（AW_DISC_002 の 7）。新規は空。CSV のボタンは置かない（適用の CSV は一覧の 1.5）。", "Màn mới / sửa cũng chỉ xem (AW_DISC_002 mục 7). Mới thì trống. Không có nút CSV (CSV áp dụng ở danh sách 1.5)."]),
     ]},
    {"id": "014", "code": "AW_DISC_003", "state": ["新規登録 入力エラー", "Đăng ký mới, lỗi nhập"], "url": "/ops/masters/discounts/new",
     "setup": JS + "q('.pbtn button.save').click();await sleep(600);window.scrollTo(0,0);", "full": True, "wait": 400,
     "note": ["何も入れずに「登録」を押したとき。エラーの項目は赤枠＋項目の下に文言、見出しの下に「保存できません（n件）」（P-FORMBOX）。", "Nhấn 登録 khi chưa nhập gì. Mục lỗi viền đỏ + câu lỗi dưới mục, dưới tiêu đề 「保存できません（n件）」."],
     "items": [
         F("8", "エラーの枠", "Khung lỗi", ".vbox", "label", "show", pattern="P-FORMBOX", err=["E01", "E14", "E04", "E09", "E08"],
           detail=["見出しの下の赤い枠は「保存できません（n件）。赤い項目を確認してください」の1行だけ（一覧は出さない・A 案 hong 2026/10/05）。エラーのあるタブの見出しに赤い印。", "Khung đỏ dưới tiêu đề chỉ 1 dòng 「保存できません（n件）。赤い項目を確認してください」 (không liệt kê, phương án A hong 2026/10/05). Tab có lỗi đánh dấu đỏ."],
           demo_ok=["コードのチェックは必須の一部だけ（宿題 H3）。仕様が正", "Code mới kiểm tra một phần (H3). Spec đúng"]),
         F("8.1", "項目の下のエラー", "Lỗi dưới mục", ".f.verr", "label", "show", err=["E01"], detail=["エラーの項目に赤い枠＋項目の下に文言。最初のエラーがほかのタブならそのタブを開く。", "Mục lỗi: viền đỏ + câu lỗi dưới mục. Lỗi đầu ở tab khác thì mở tab đó."]),
     ]},
    {"id": "015", "code": "AW_DISC_003", "state": ["編集 初期表示", "Sửa, hiển thị ban đầu"], "url": "/ops/masters/discounts/DC000013/edit",
     "setup": "", "full": True, "wait": 600,
     "note": ["新規登録と同じフォームに保存済みの値が入る。違い：画面名「値引き編集」＋ID、サマリー、ボタン「保存」。", "Cùng form với đăng ký mới nhưng có giá trị đã lưu. Khác: tiêu đề 「値引き編集」 + ID, summary, nút 保存."],
     "items": [
         F("9", "ヘッダー（編集）", "Đầu trang (sửa)", ".phead", "area", detail=["1 と同じ。画面名「値引き編集 DC000013」、右に キャンセル・保存。", "Giống mục 1. Tiêu đề 「値引き編集 DC000013」, nút キャンセル・保存."]),
         F("9.1", "サマリー", "Tóm tắt", ".sumbar", "label", detail=["AW_DISC_002 の 2 と同じ。", "Giống AW_DISC_002 mục 2."]),
         F("9.2", "値引きID（編集）", "Mã giảm giá (sửa)", '.f[data-name="値引きID"]', "label", detail=["採番済みの ID。変更不可。", "ID đã cấp, không đổi."]),
         F("9.3", "保存", "Lưu", ".pbtn button.save", "button", "click", pattern="P-FORMBOX", err=["S01", "E31", "E36"], detail=["1.4 と同じ。保存後は詳細へ。適用中の拠点がある値引きの 計算区分・値引きの値 を変えても、確定済みの月は変わらない（未確定の子契約だけ作り直す）。", "Giống 1.4. Lưu xong về chi tiết. Đổi 計算区分 / 値引きの値 của 値引き đang áp dụng thì tháng đã chốt không đổi (chỉ 子契約 chưa chốt tạo lại)."]),
     ]},
    {"id": "016", "code": "AW_DISC_003", "state": ["編集内容を破棄しますか（モーダル）", "Hủy nội dung đã sửa (modal)"], "url": "/ops/masters/discounts/DC000013/edit",
     "setup": JS + "setv(q('.f[data-name=\"値引き名（管理用）\"] input'),'お試しキャンペーン割引X');await sleep(200);q('.pbtn button.cancel').click();await sleep(400);", "full": False, "wait": 400,
     "note": ["入力を変えたあとに キャンセル（または ほかの画面へ移動・ブラウザを閉じる／再読み込み）。全サイト共通（台帳 F）。", "Đã sửa rồi nhấn キャンセル (hoặc chuyển trang, đóng/tải lại). Toàn hệ thống (台帳 F)."],
     "items": [
         F("10", "破棄の確認モーダル", "Modal xác nhận hủy", '.es-modal[aria-label="編集内容を破棄しますか？"]', "modal", "show", pattern="P-FORMBOX", err=["Q02"]),
         F("10.1", "本文", "Nội dung", ".es-modal__body", "label", detail=["Q02（Message List No.25）。", "Q02 (Message List No.25)."]),
         F("10.2", "キャンセル", "Hủy", ".es-modal__actions button::キャンセル", "button", "click", detail=["閉じて編集を続ける。", "Đóng, tiếp tục sửa."]),
         F("10.3", "破棄", "Bỏ", ".es-modal__actions button::破棄", "button", "click", detail=["入力を捨てて移動する。", "Bỏ nội dung đã nhập và chuyển trang."]),
     ]},
]

# ================================================================ CSV取込（画面・hong 2026/10/05）。列の定義（sel "-"＝画面には出さない）は API（csv.columns）＋入力画面の項目＋CSVテンプレートから scratchpad/gen_csv2.py で作った
V_CSV = [
    {'id': '018', 'code': 'AW_DISC_004', 'state': ['初期表示（ステップ1 ファイルを選ぶ）', 'Hiển thị ban đầu (bước 1 chọn tệp)'], 'url': '/ops/masters/discounts/import', 'setup': '', 'full': True, 'wait': 1200, 'note': ['フル権限（CSV取込の権限）だけが開ける（ほかの役割は一覧へ）。見出し → ファイルを選ぶ。列の定義（2.x）は画面には出さない（hong 2026/10/05）。モーダルではなく画面。', 'Chỉ vai trò có quyền CSV取込 mở được. Tiêu đề → chọn tệp. Định nghĩa cột (2.x) không hiện trên màn hình (hong 2026/10/05). Là màn hình, không phải modal.'], 'items': [{'no': '1', 'ja': 'ヘッダー', 'vi': 'Đầu trang', 'sel': '.csvph', 'kind': 'area', 'trig': 'view'}, {'no': '1.1', 'ja': 'パンくず', 'vi': 'Breadcrumb', 'sel': '.crumb', 'kind': 'label', 'trig': 'view', 'detail': ['「マスタ管理 / 値引きマスタ一覧 / 値引きマスタ CSV取込」。一覧はリンク。', '「マスタ管理 / …一覧 / 値引きマスタ CSV取込」. Danh sách là link.']}, {'no': '1.2', 'ja': '画面名', 'vi': 'Tên màn hình', 'sel': '.csvph h1', 'kind': 'label', 'trig': 'view', 'detail': ['「値引きマスタ CSV取込」', 'Tiêu đề 「値引きマスタ CSV取込」']}, {'no': '1.3', 'ja': 'キャンセル', 'vi': 'Hủy', 'sel': '.csvph .btns button.out::キャンセル', 'kind': 'button', 'trig': 'click', 'detail': ['一覧へ戻る（何も登録しない）。見出しの右のボタン（アンケートの CSV取込と同じ）。', 'Về danh sách (không đăng ký gì). Nút bên phải tiêu đề.']}, {'no': '2', 'ja': 'CSVテンプレートの列（定義。画面には出さない）', 'vi': 'Các cột của CSV template (định nghĩa; không hiện trên màn hình)', 'sel': '-', 'kind': 'area', 'trig': 'view', 'detail': ['取り込むファイルの列の定義（1行目の見出し・この順。CSV出力と同じ列）。テンプレートの写しは docs/05_画面設計書/CSVテンプレート/discounts.csv。キー＝値引きID（空欄＝新規・採番）。UTF-8（BOM 可）・5,000行まで。空欄のセルは今の値のまま、「-」で消す。2.1〜 の必須・長さ・チェックは入力画面の項目と同じ（違うところだけ書く）。画面には出さない（hong 2026/10/05）。', 'Định nghĩa cột của tệp nhập (dòng 1 = tiêu đề, theo thứ tự này; cùng cột với CSV出力). Bản mẫu: docs/05_画面設計書/CSVテンプレート/discounts.csv. Khóa = 値引きID (trống = mới, cấp ID). UTF-8 (có BOM được), tối đa 5.000 dòng. Ô trống giữ giá trị cũ, "-" để xóa. Bắt buộc / độ dài / kiểm tra của 2.1〜 giống mục nhập trên màn hình (chỉ ghi chỗ khác). Không hiện trên màn hình (hong 2026/10/05).']}, {'no': '2.1', 'ja': '値引きID', 'vi': 'Mã giảm giá', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '－', 'len': ['文字列 DC＋6桁', 'DC + 6 số'], 'valid': ['画面の項目と同じチェック。', 'Kiểm tra như mục trên màn hình.'], 'detail': ['【空欄＝新規（採番）】画面の項目 3.1「値引きID」と同じ。', '【空欄＝新規（採番）】  Giống mục 3.1 「値引きID」 trên màn hình.'], 'ex': ['DC000001', 'Giá trị như ở tệp CSV出力 (docs/05_画面設計書/CSVテンプレート)'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)']}, {'no': '2.2', 'ja': '値引き名（管理用）', 'vi': 'Tên (quản lý)', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '○', 'len': ['文字列 60', 'Chuỗi 60'], 'valid': ['新規の行で必須。更新の行は空欄＝今の値のまま。「-」で消せる。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; ghi "-" để xóa giá trị.'], 'detail': ['画面の項目 3.2「値引き名（管理用）」と同じ。', 'Giống mục 3.2 「値引き名（管理用）」 trên màn hình.'], 'ex': ['お試しキャンペーン割引', 'Tên nội bộ, dùng ở danh sách và tìm kiếm; không ra hóa đơn'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01', 'E04', 'E13']}, {'no': '2.3', 'ja': '管理用コード', 'vi': 'Mã quản lý', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '○', 'len': ['文字列 40（半角英数字・ハイフン）', 'Chuỗi 40 (chữ số nửa góc, gạch nối)'], 'valid': ['新規の行で必須。更新の行は空欄＝今の値のまま。「-」で消せる。画面と同じチェック：ほかの値引きと重複しない（E09）。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; ghi "-" để xóa giá trị; kiểm tra như màn hình: Không trùng với 値引き khác (E09).'], 'detail': ['画面の項目 3.3「管理用コード」と同じ。', 'Giống mục 3.3 「管理用コード」 trên màn hình.'], 'ex': ['TRIAL-FREE', 'Mã đang dùng ở bảng quản lý ngoài hệ thống; khóa CSV'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01', 'E04', 'E09']}, {'no': '2.4', 'ja': '請求書表示名', 'vi': 'Tên trên hóa đơn', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '○', 'len': ['文字列 60', 'Chuỗi 60'], 'valid': ['新規の行で必須。更新の行は空欄＝今の値のまま。「-」で消せる。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; ghi "-" để xóa giá trị.'], 'detail': ['画面の項目 3.4「請求書表示名」と同じ。', 'Giống mục 3.4 「請求書表示名」 trên màn hình.'], 'ex': ['お試しキャンペーン割引', 'Tên dòng giảm giá (âm) trên hóa đơn'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01', 'E04', 'E13']}, {'no': '2.5', 'ja': '値引き区分', 'vi': 'Loại giảm giá', 'sel': '-', 'kind': 'select', 'trig': 'input', 'req': '○', 'len': ['選択（値引き区分マスタの使用中の区分。初期値：キャンペーン割引／代理店割引／他社乗り換え割引／紹介割引／ボリュームディスカウント／アップグレード差額）', 'Chọn (các loại đang dùng trong master loại giảm giá; ban đầu: khuyến mãi / đại lý / chuyển từ công ty khác / giới thiệu / số lượng / chênh lệch nâng cấp)'], 'valid': ['新規の行で必須。更新の行は空欄＝今の値のまま。選択：キャンペーン割引／代理店割引／他社乗り換え割引／紹介割引／ボリュームディスカウント／アップグレード差額（それ以外はエラー）。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; chọn 1 trong: キャンペーン割引 / 代理店割引 / 他社乗り換え割引 / 紹介割引 / ボリュームディスカウント / アップグレード差額 (khác thì lỗi).'], 'detail': ['画面の項目 3.5「値引き区分」と同じ。', 'Giống mục 3.5 「値引き区分」 trên màn hình.'], 'ex': ['代理店割引', 'Loại dùng cho tổng hợp và thứ tự'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01', 'E02']}, {'no': '2.6', 'ja': '紹介フィープラン（請求名称）', 'vi': 'Plan phí giới thiệu', 'sel': '-', 'kind': 'select', 'trig': 'input', 'req': '－', 'len': ['選択（—（連動なし）／紹介フィーマスタのプラン）', 'Chọn (— không liên kết / plan trong master phí giới thiệu)'], 'valid': ['選択：—（連動なし）／RFP000001 A：企業紹介／RFP000002 B：代理店紹介／RFP000003 C：パートナー紹介／RFP000004 D：特別代理店（それ以外はエラー）。', 'chọn 1 trong: —（連動なし） / RFP000001 A：企業紹介 / RFP000002 B：代理店紹介 / RFP000003 C：パートナー紹介 / RFP000004 D：特別代理店 (khác thì lỗi).'], 'detail': ['画面の項目 3.6「紹介フィープラン（請求名称）」と同じ。', 'Giống mục 3.6 「紹介フィープラン（請求名称）」 trên màn hình.'], 'ex': ['RFP000002 B：代理店紹介', 'Bắt buộc khi 値引き区分 = 代理店割引 / 紹介割引'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E02']}, {'no': '2.7', 'ja': '公開ステータス', 'vi': 'Trạng thái công khai', 'sel': '-', 'kind': 'select', 'trig': 'input', 'req': '○', 'len': ['選択（公開／非公開）', 'Chọn (công khai / không công khai)'], 'valid': ['新規の行で必須。更新の行は空欄＝今の値のまま。選択：公開／非公開（それ以外はエラー）。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; chọn 1 trong: 公開 / 非公開 (khác thì lỗi).'], 'detail': ['画面の項目 3.7「公開ステータス」と同じ。', 'Giống mục 3.7 「公開ステータス」 trên màn hình.'], 'ex': ['非公開', '公開 = hiện tên 値引き trên 法人Web; hóa đơn luôn có'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01']}, {'no': '2.8', 'ja': '利用状態', 'vi': 'Trạng thái sử dụng', 'sel': '-', 'kind': 'select', 'trig': 'input', 'req': '○', 'len': ['選択（使用中／終了）', 'Chọn (đang dùng / kết thúc)'], 'valid': ['新規の行で必須。更新の行は空欄＝今の値のまま。選択：使用中／終了（それ以外はエラー）。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; chọn 1 trong: 使用中 / 終了 (khác thì lỗi).'], 'detail': ['画面の項目 3.8「利用状態」と同じ。', 'Giống mục 3.8 「利用状態」 trên màn hình.'], 'ex': ['使用中', '終了 = không gắn mới; điểm đang áp dụng tiếp tục'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01']}, {'no': '2.9', 'ja': '説明', 'vi': 'Mô tả', 'sel': '-', 'kind': 'textarea', 'trig': 'input', 'req': '－', 'len': ['文字列 500（複数行）', 'Chuỗi 500 (nhiều dòng)'], 'valid': ['「-」で消せる。', 'ghi "-" để xóa giá trị.'], 'detail': ['画面の項目 3.9「説明」と同じ。', 'Giống mục 3.9 「説明」 trên màn hình.'], 'ex': ['50プラン ESライト（冷蔵庫）の料金分。請求額を超えない', 'Giải thích để 運営 không nhầm khi gắn'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E04', 'E13']}, {'no': '2.10', 'ja': '適用対象', 'vi': 'Đối tượng áp dụng', 'sel': '-', 'kind': 'select', 'trig': 'input', 'req': '○', 'len': ['選択（プラン料金／オプション料金／設備料金／初期料金／請求全体）', 'Chọn (phí plan / phí option / phí thiết bị / phí ban đầu / toàn hóa đơn)'], 'valid': ['新規の行で必須。更新の行は空欄＝今の値のまま。選択：プラン料金／オプション料金／設備料金／初期料金／請求全体（それ以外はエラー）。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; chọn 1 trong: プラン料金 / オプション料金 / 設備料金 / 初期料金 / 請求全体 (khác thì lỗi).'], 'detail': ['画面の項目 4.1「適用対象」と同じ。', 'Giống mục 4.1 「適用対象」 trên màn hình.'], 'ex': ['オプション料金', 'オプション料金 + 4.2 = giảm cho 1 option (vd miễn 配送回数追加)'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01']}, {'no': '2.11', 'ja': '対象オプション', 'vi': 'Option áp dụng', 'sel': '-', 'kind': 'label', 'trig': 'view', 'req': '－', 'len': ['選択（（すべてのオプション）／オプションマスタの使用中のオプション）', 'Chọn (mọi option / các option đang dùng trong master option)'], 'valid': ['出力だけ。取込では読まない（書いてあっても無視）。選択：—（適用対象がオプション料金のときだけ）／（すべてのオプション）／OP000001 配送回数追加／OP000004 地域配送料／OP000007 設置代行（それ以外はエラー）。', 'chỉ xuất; nhập không đọc (có ghi cũng bỏ qua); chọn 1 trong: —（適用対象がオプション料金のときだけ） / （すべてのオプション） / OP000001 配送回数追加 / OP000004 地域配送料 / OP000007 設置代行 (khác thì lỗi).'], 'detail': ['画面の項目 4.2「対象オプション」と同じ。', 'Giống mục 4.2 「対象オプション」 trên màn hình.']}, {'no': '2.12', 'ja': '計算区分', 'vi': 'Cách tính', 'sel': '-', 'kind': 'select', 'trig': 'input', 'req': '○', 'len': ['選択（固定額／料率／差額自動／プラン料金を参照）', 'Chọn (số tiền cố định / tỷ lệ / chênh lệch tự động / tham chiếu phí plan)'], 'valid': ['新規の行で必須。更新の行は空欄＝今の値のまま。選択：固定額／料率／差額自動／プラン料金を参照（それ以外はエラー）。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; chọn 1 trong: 固定額 / 料率 / 差額自動 / プラン料金を参照 (khác thì lỗi).'], 'detail': ['画面の項目 4.3「計算区分」と同じ。', 'Giống mục 4.3 「計算区分」 trên màn hình.'], 'ex': ['料率', '差額自動 = スタンダード − ライト cùng thế hệ (DC000021); プラン料金を参照 = lấy 月額 của plan/course tham chiếu (DC000013)'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01']}, {'no': '2.13', 'ja': '値引きの値', 'vi': 'Giá trị giảm', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '○', 'len': ['固定額：金額（整数・税抜）／料率：数値 0.01〜100.00（%）＋上限額（整数・空欄＝上限なし）', 'Cố định: số tiền (nguyên, chưa thuế) / tỷ lệ: số 0,01–100,00 (%) + giới hạn (nguyên, trống = không)'], 'valid': ['新規の行で必須。更新の行は空欄＝今の値のまま。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ.'], 'detail': ['画面の項目 4.4「値引きの値」と同じ。', 'Giống mục 4.4 「値引きの値」 trên màn hình.'], 'ex': ['5', '料率 5% (giới hạn 5000 yên) / 固定額 3000 yên'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01', 'E14']}, {'no': '2.14', 'ja': '税率の扱い', 'vi': 'Cách xử lý thuế', 'sel': '-', 'kind': 'select', 'trig': 'input', 'req': '○', 'len': ['選択（元の費目と同じ／個別に指定）', 'Chọn (giống mục gốc / chỉ định riêng)'], 'valid': ['新規の行で必須。更新の行は空欄＝今の値のまま。選択：元の費目と同じ／個別に指定（それ以外はエラー）。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; chọn 1 trong: 元の費目と同じ / 個別に指定 (khác thì lỗi).'], 'detail': ['画面の項目 4.5「税率の扱い」と同じ。', 'Giống mục 4.5 「税率の扱い」 trên màn hình.'], 'ex': ['元の費目と同じ', 'Hóa đơn có 8% và 10% thì quyết định trừ từ dòng nào'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01']}, {'no': '2.15', 'ja': '税率（個別に指定）', 'vi': 'Thuế suất (chỉ định riêng)', 'sel': '-', 'kind': 'select', 'trig': 'input', 'req': '○', 'len': ['選択（税率マスタ）', 'Chọn (master thuế suất)'], 'valid': ['新規の行で必須。更新の行は空欄＝今の値のまま。選択：8%（軽減）／10%（それ以外はエラー）。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; chọn 1 trong: 8%（軽減） / 10% (khác thì lỗi).'], 'detail': ['画面の項目 4.6「税率（個別に指定）」と同じ。', 'Giống mục 4.6 「税率（個別に指定）」 trên màn hình.'], 'ex': ['10%', 'Chỉ khi 税率の扱い = 個別に指定'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01']}, {'no': '2.16', 'ja': '重ねがけ', 'vi': 'Cộng dồn', 'sel': '-', 'kind': 'select', 'trig': 'input', 'req': '○', 'len': ['選択（可／不可）', 'Chọn (được / không)'], 'valid': ['新規の行で必須。更新の行は空欄＝今の値のまま。選択：可／不可（それ以外はエラー）。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; chọn 1 trong: 可 / 不可 (khác thì lỗi).'], 'detail': ['画面の項目 4.7「重ねがけ」と同じ。', 'Giống mục 4.7 「重ねがけ」 trên màn hình.'], 'ex': ['可', 'Có cho phép gắn cùng 値引き khác không'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01']}, {'no': '2.17', 'ja': '適用順', 'vi': 'Thứ tự áp dụng', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '○', 'len': ['整数 1〜999', 'Số nguyên 1–999'], 'valid': ['新規の行で必須。更新の行は空欄＝今の値のまま。「-」で消せる。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; ghi "-" để xóa giá trị.'], 'detail': ['画面の項目 4.8「適用順」と同じ。', 'Giống mục 4.8 「適用順」 trên màn hình.'], 'ex': ['20', 'Nhỏ áp dụng trước; nên 額 trước, 率 sau'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01', 'E14']}, {'no': '2.18', 'ja': '値引きの種別', 'vi': 'Loại giảm giá (kỳ)', 'sel': '-', 'kind': 'select', 'trig': 'input', 'req': '○', 'len': ['選択（毎月（継続）／単発（1回））', 'Chọn (hằng tháng liên tục / 1 lần)'], 'valid': ['新規の行で必須。更新の行は空欄＝今の値のまま。選択：毎月（継続）／単発（1回）（それ以外はエラー）。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; chọn 1 trong: 毎月（継続） / 単発（1回） (khác thì lỗi).'], 'detail': ['画面の項目 5.1「値引きの種別」と同じ。', 'Giống mục 5.1 「値引きの種別」 trên màn hình.'], 'ex': ['毎月（継続）', '毎月 = lập dòng giảm ở ① mỗi tháng trong kỳ; 単発 = 1 lần'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01']}, {'no': '2.19', 'ja': '適用期間の持ち方', 'vi': 'Cách giữ kỳ áp dụng', 'sel': '-', 'kind': 'select', 'trig': 'input', 'req': '○', 'len': ['選択（無期限／月数指定）', 'Chọn (vô thời hạn / số tháng)'], 'valid': ['新規の行で必須。更新の行は空欄＝今の値のまま。選択：無期限／月数指定／—（単発のため使わない）（それ以外はエラー）。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; chọn 1 trong: 無期限 / 月数指定 / —（単発のため使わない） (khác thì lỗi).'], 'detail': ['画面の項目 5.2「適用期間の持ち方」と同じ。', 'Giống mục 5.2 「適用期間の持ち方」 trên màn hình.'], 'ex': ['月数指定', 'Khuyến mãi 3 tháng đầu = 月数指定 + 5.3'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01']}, {'no': '2.20', 'ja': '適用月数', 'vi': 'Số tháng áp dụng', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '－', 'len': ['整数 1〜120（ヶ月）', 'Số nguyên 1–120 (tháng)'], 'valid': ['「-」で消せる。', 'ghi "-" để xóa giá trị.'], 'detail': ['画面の項目 5.3「適用月数」と同じ。', 'Giống mục 5.3 「適用月数」 trên màn hình.'], 'ex': ['3', 'Tính từ tháng bắt đầu; tháng kết thúc tự tính'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01', 'E14']}, {'no': '2.21', 'ja': 'つけられる拠点の条件', 'vi': 'Điều kiện điểm được gắn', 'sel': '-', 'kind': 'select', 'trig': 'input', 'req': '－', 'len': ['対象代理店コード：選択（すべて／代理店マスタの代理店）／契約種別の制限：選択（制限なし／お試しキャンペーンは対象外／本導入のみ／お試しキャンペーンのみ）', 'Mã đại lý: chọn (tất cả / đại lý trong master đại lý) / giới hạn loại hợp đồng: chọn (không / trừ dùng thử / chỉ chính thức / chỉ dùng thử)'], 'valid': ['選択：すべて／AG00001 株式会社フューチャーブリッジ／AG00002 株式会社スマートコネクト／AG00003 株式会社ビジネスリンク／AG00004 株式会社アーバンネットワーク／AG00005 グローバルサポート株式会社／AG00006 ライフデザインパートナーズ株式会社／AG00008 ネクストパートナーズ株式会社／AG00010 東和ソリューションズ株式会社／AG00011 株式会社サンライズエージェント／AG00012 株式会社ブリッジワークス／AG00021 株式会社パートナーズ／AG00034 株式会社リンクアップ／AG00102 ESパートナー西日本（特別代理店）（それ以外はエラー）。', 'chọn 1 trong: すべて / AG00001 株式会社フューチャーブリッジ / AG00002 株式会社スマートコネクト / AG00003 株式会社ビジネスリンク / AG00004 株式会社アーバンネットワーク / AG00005 グローバルサポート株式会社 / AG00006 ライフデザインパートナーズ株式会社 / AG00008 ネクストパートナーズ株式会社 / AG00010 東和ソリューションズ株式会社 / AG00011 株式会社サンライズエージェント / AG00012 株式会社ブリッジワークス / AG00021 株式会社パートナーズ / AG00034 株式会社リンクアップ / AG00102 ESパートナー西日本（特別代理店） (khác thì lỗi).'], 'detail': ['画面の項目 5.4「つけられる拠点の条件」と同じ。', 'Giống mục 5.4 「つけられる拠点の条件」 trên màn hình.'], 'ex': ['AG00021 株式会社パートナーズ／制限なし', '代理店割引 chỉ gắn cho điểm có cùng đại lý ở hợp đồng cha'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)']}, {'no': '2.22', 'ja': '対象のプラン・コース', 'vi': 'Plan, course áp dụng', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '－', 'len': ['チェック（すべて／ESスタンダード／ESライト（冷蔵庫）／ESライト（自販機））＋ プラン（複数選択）', 'Checkbox (tất cả / 3 course) + plan (chọn nhiều)'], 'valid': ['「-」で消せる。', 'ghi "-" để xóa giá trị.'], 'detail': ['画面の項目 5.5「対象のプラン・コース」と同じ。', 'Giống mục 5.5 「対象のプラン・コース」 trên màn hình.'], 'ex': ['ESスタンダード', 'Bỏ 「すべて」 rồi chọn riêng; DC000021 = chỉ ESスタンダード'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)']}, {'no': '2.23', 'ja': '回数の上限', 'vi': 'Giới hạn số lần', 'sel': '-', 'kind': 'select', 'trig': 'input', 'req': '－', 'len': ['選択（上限なし／法人ごとに1回／拠点ごとに1回／法人ごとにN回／拠点ごとにN回）＋ N（整数 2〜99）', 'Chọn (không / 1 lần mỗi công ty / 1 lần mỗi điểm / N lần mỗi công ty / N lần mỗi điểm) + N (2–99)'], 'valid': ['選択：上限なし／法人ごとに1回／拠点ごとに1回／法人ごとにN回／拠点ごとにN回（それ以外はエラー）。', 'chọn 1 trong: 上限なし / 法人ごとに1回 / 拠点ごとに1回 / 法人ごとにN回 / 拠点ごとにN回 (khác thì lỗi).'], 'detail': ['画面の項目 5.6「回数の上限」と同じ。', 'Giống mục 5.6 「回数の上限」 trên màn hình.'], 'ex': ['法人ごとに1回', 'DC000013 = 1 lần mỗi công ty'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)']}, {'no': '2.24', 'ja': '自動で付ける条件', 'vi': 'Điều kiện tự gắn', 'sel': '-', 'kind': 'select', 'trig': 'input', 'req': '－', 'len': ['選択（付けない（手で付ける）／契約種別＝お試しキャンペーン／契約項目に連動）', 'Chọn (không tự gắn / loại hợp đồng = dùng thử / liên kết mục hợp đồng)'], 'valid': ['選択：付けない（手で付ける）／契約種別＝お試しキャンペーン／契約項目に連動（それ以外はエラー）。', 'chọn 1 trong: 付けない（手で付ける） / 契約種別＝お試しキャンペーン / 契約項目に連動 (khác thì lỗi).'], 'detail': ['画面の項目 5.7「自動で付ける条件」と同じ。', 'Giống mục 5.7 「自動で付ける条件」 trên màn hình.'], 'ex': ['契約種別＝お試しキャンペーン', 'DC000013 tự gắn cho 子契約 お試し'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)']}, {'no': '2.25', 'ja': '受付期間', 'vi': 'Kỳ tiếp nhận', 'sel': '-', 'kind': 'date', 'trig': 'input', 'req': '－', 'len': ['日付 yyyy-mm-dd（開始日）〜 日付（終了日）', 'yyyy-mm-dd (bắt đầu) 〜 (kết thúc)'], 'valid': ['「-」で消せる。', 'ghi "-" để xóa giá trị.'], 'detail': ['画面の項目 5.8「受付期間」と同じ。', 'Giống mục 5.8 「受付期間」 trên màn hình.'], 'ex': ['2026-10-01 〜 2026-12-31', 'Kỳ được phép gắn 値引き (khuyến mãi); khác với 適用月数'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E08']}, {'no': '2.26', 'ja': '使用中の件数', 'vi': 'Số đang dùng', 'sel': '-', 'kind': 'label', 'trig': 'view', 'req': '－', 'len': ['整数', 'Số nguyên'], 'valid': ['出力だけ。取込では読まない（書いてあっても無視）。', 'chỉ xuất; nhập không đọc (có ghi cũng bỏ qua).'], 'detail': ['出力だけの列（取込では読まない）。', 'Cột chỉ xuất (nhập không đọc).']}, {'no': '2.27', 'ja': '削除済(1=削除済)', 'vi': 'Đã xóa (1 = đã xóa)', 'sel': '-', 'kind': 'label', 'trig': 'view', 'req': '－', 'len': ['1／0', '1 / 0'], 'valid': ['出力だけ。取込では読まない（書いてあっても無視）。', 'chỉ xuất; nhập không đọc (có ghi cũng bỏ qua).'], 'detail': ['出力だけの列（取込では読まない）。', 'Cột chỉ xuất (nhập không đọc).']}, {'no': '3', 'ja': 'ファイルを選ぶ（ステップ1）', 'vi': 'Chọn tệp (bước 1)', 'sel': '#sec-csv', 'kind': 'area', 'trig': 'view', 'pattern': 'P-CSV'}, {'no': '3.1', 'ja': '手順', 'vi': 'Các bước', 'sel': '.steps', 'kind': 'label', 'trig': 'view', 'detail': ['1 ファイルを選ぶ → 2 確認・登録（カードの外・中央。アンケートの CSV取込と同じ）。今の手順を濃く、済んだ手順を緑に。', '1 chọn tệp → 2 xác nhận・đăng ký (ngoài card, giữa trang; giống CSV取込 của アンケート). Bước hiện tại tô đậm, bước xong màu xanh.']}, {'no': '3.2', 'ja': '説明', 'vi': 'Giải thích', 'sel': '#sec-csv .hint', 'kind': 'label', 'trig': 'view', 'detail': ['取込の決まり（上書き／新規・UTF-8・5,000行・エラーの行は取り込まずほかの行を登録）。', 'Quy tắc nhập (ghi đè / mới, UTF-8, 5.000 dòng, dòng lỗi bỏ qua, dòng khác vẫn đăng ký).']}, {'no': '3.3', 'ja': 'ファイルを選ぶ', 'vi': 'Chọn tệp', 'sel': '#sec-csv button.out::ファイルを選ぶ', 'kind': 'file', 'trig': 'input', 'req': '○', 'len': ['CSV（UTF-8・.csv）1ファイル', '1 tệp CSV (UTF-8, .csv)'], 'init': ['なし', 'Không'], 'ex': ['値引きマスタ_20261005.csv', 'Tệp cùng cột với CSV出力 (2.1〜)'], 'err': ['E34'], 'detail': ['ファイルを選ぶか、枠にドラッグ＆ドロップ。選ぶとすぐに確かめて（何も保存しない）ステップ2へ。.csv 以外・UTF-8 以外・読めないファイル・見出しの列が 2.1〜 と違うファイルはその場でエラーの帯。', 'Chọn tệp hoặc kéo thả vào khung. Chọn xong kiểm tra ngay (không lưu) và sang bước 2. Không phải .csv / không phải UTF-8 / không đọc được / tiêu đề cột khác 2.1〜 thì hiện dải lỗi.']}, {'no': '3.4', 'ja': 'ドラッグ＆ドロップの枠', 'vi': 'Khung kéo thả', 'sel': '#sec-csv button.out::ファイルを選ぶ^2', 'kind': 'area', 'trig': 'view', 'detail': ['ファイルを重ねると枠が青くなる。選んだファイル名を下に出す。', 'Kéo tệp lên thì khung chuyển xanh. Tên tệp đã chọn hiện phía dưới.']}]},
    {'id': '019', 'code': 'AW_DISC_004', 'state': ['確認・登録（ステップ2）', 'Xác nhận, đăng ký (bước 2)'], 'url': '/ops/masters/discounts/import', 'setup': 'const sleep=ms=>new Promise(r=>setTimeout(r,ms));const q=s=>document.querySelector(s);const res=await fetch(\'/api/domain/csv/export\',{method:\'POST\',credentials:\'include\',headers:{\'Content-Type\':\'application/json\',\'x-es-site\':\'ops\'},body:JSON.stringify({args:{entity:\'discounts\',scope:{site:\'ops\'}}})});const t=await res.json();const esc=v=>\'\\"\'+String(v??\'\').replace(/\\"/g,\'\\"\\"\')+\'\\"\';const rows=[t.head,...t.rows];rows[1][1]=rows[1][1]+\' 改\';const bad=t.rows[0].slice();bad[0]=\'XX999999\';rows.push(bad);const text=\'\\ufeff\'+rows.map(r=>r.map(esc).join(\',\')).join(\'\\r\\n\');const inp=q(\'#sec-csv input[type=file]\');const dt=new DataTransfer();dt.items.add(new File([text],\'取込テスト.csv\',{type:\'text/csv\'}));inp.files=dt.files;inp.dispatchEvent(new Event(\'change\',{bubbles:true}));await sleep(2500);window.scrollTo(0,q(\'#sec-csv\').offsetTop-80);', 'full': True, 'wait': 600, 'note': ['ファイルを選んだ直後。見本は CSV出力（ひな形）のファイルに、1行目の値を変え（更新の見本）と、キーが誤りの行を1つ足したもの（エラーの行の見本）。', 'Ngay sau khi chọn tệp. Mẫu = tệp CSV出力 (mẫu) + đổi giá trị dòng 1 (mẫu 更新) + 1 dòng khóa sai (mẫu dòng lỗi).'], 'items': [{'no': '4', 'ja': '確認・登録（ステップ2）', 'vi': 'Xác nhận, đăng ký (bước 2)', 'sel': '#sec-csv', 'kind': 'area', 'trig': 'show', 'pattern': 'P-CSV', 'err': ['S03', 'E34'], 'detail': ['ファイル名・件数と、行ごとの結果。「登録」でエラー以外の行を登録する（エラーの行は取り込まない・hong 2026/10/05）。', 'Tên tệp, số dòng và kết quả từng dòng. 登録 thì đăng ký các dòng không lỗi (dòng lỗi bỏ qua, hong 2026/10/05).']}, {'no': '4.1', 'ja': '件数', 'vi': 'Số lượng', 'sel': '#sec-csv .badge', 'kind': 'label', 'trig': 'view', 'detail': ['新規／更新／変更なし／エラー の件数（バッジ）。', 'Số dòng 新規 / 更新 / 変更なし / エラー (badge).']}, {'no': '4.2', 'ja': 'エラーの行', 'vi': 'Dòng lỗi', 'sel': '#sec-csv .notice.ng', 'kind': 'label', 'trig': 'show', 'cond': ['エラーの行があるとき', 'Khi có dòng lỗi'], 'detail': ['「エラーの行 n件は取り込みません…」と、行番号・キー・列名・内容の表（多いときは先頭だけ。全部はエラー一覧CSV）。内容は 2.1〜 のチェックの文言。', '「エラーの行 n件は取り込みません…」 + bảng số dòng / khóa / cột / nội dung (nhiều thì chỉ phần đầu; đủ ở エラー一覧CSV). Nội dung = câu kiểm tra của 2.1〜.']}, {'no': '4.3', 'ja': 'エラー一覧CSV', 'vi': 'Xuất CSV lỗi', 'sel': '#sec-csv button::エラー一覧CSV', 'kind': 'button', 'trig': 'click', 'detail': ['エラーの行だけを、元の列＋エラーの内容で書き出す（直して選び直すため）。', 'Xuất riêng các dòng lỗi với cột gốc + nội dung lỗi (để sửa rồi chọn lại).']}, {'no': '4.4', 'ja': '登録する内容（前 → 後）', 'vi': 'Nội dung sẽ đăng ký (trước → sau)', 'sel': '#sec-csv b::登録する内容', 'kind': 'label', 'trig': 'view', 'cond': ['新規・更新の行があるとき', 'Khi có dòng 新規 / 更新'], 'detail': ['行番号・区分（新規／更新）・キー・名前・変わる項目（前 → 後）。', 'Số dòng, loại (新規 / 更新), khóa, tên, các mục thay đổi (trước → sau).']}, {'no': '4.5', 'ja': 'ファイルを選び直す', 'vi': 'Chọn lại tệp', 'sel': '.csvph .btns button.out::ファイルを選び直す', 'kind': 'button', 'trig': 'click', 'detail': ['ステップ1に戻る。何も登録しない。', 'Về bước 1. Không đăng ký gì.']}, {'no': '4.6', 'ja': '登録', 'vi': 'Đăng ký', 'sel': '.csvph .btns button.pri', 'kind': 'button', 'trig': 'click', 'err': ['S03', 'E34'], 'cond': ['新規か更新の行が1つ以上あり、ファイル全体のエラーがないとき。警告（金額の変更など）があるときは「警告を確認しました」にチェックするまで押せない', 'Có ≥1 dòng 新規 / 更新 và không lỗi cả tệp. Có cảnh báo (vd đổi tiền) thì phải check 「警告を確認しました」 mới nhấn được'], 'detail': ['エラー以外の行を登録し、S03 のトースト（新規 n件・更新 n件）、一覧へ戻る。100件を超えるときは裏で進めて進み具合を出す。取込の記録と、行ごとの変更履歴「CSV取込で更新」を残す。', 'Đăng ký các dòng không lỗi, toast S03 (新規 n, 更新 n), về danh sách. Quá 100 dòng thì chạy nền và hiện tiến độ. Ghi lịch sử nhập và lịch sử từng bản ghi 「CSV取込で更新」.']}]},
    {'id': '020', 'code': 'AW_DISC_005', 'state': ['初期表示（ステップ1 ファイルを選ぶ）', 'Hiển thị ban đầu (bước 1 chọn tệp)'], 'url': '/ops/masters/discounts/import-apply', 'setup': '', 'full': True, 'wait': 1200, 'note': ['フル権限（CSV取込の権限）だけが開ける（ほかの役割は一覧へ）。見出し → ファイルを選ぶ。列の定義（2.x）は画面には出さない（hong 2026/10/05）。モーダルではなく画面。', 'Chỉ vai trò có quyền CSV取込 mở được. Tiêu đề → chọn tệp. Định nghĩa cột (2.x) không hiện trên màn hình (hong 2026/10/05). Là màn hình, không phải modal.'], 'items': [{'no': '1', 'ja': 'ヘッダー', 'vi': 'Đầu trang', 'sel': '.csvph', 'kind': 'area', 'trig': 'view'}, {'no': '1.1', 'ja': 'パンくず', 'vi': 'Breadcrumb', 'sel': '.crumb', 'kind': 'label', 'trig': 'view', 'detail': ['「マスタ管理 / 値引きの適用一覧 / 値引きの適用 CSV取込」。一覧はリンク。', '「マスタ管理 / …一覧 / 値引きの適用 CSV取込」. Danh sách là link.']}, {'no': '1.2', 'ja': '画面名', 'vi': 'Tên màn hình', 'sel': '.csvph h1', 'kind': 'label', 'trig': 'view', 'detail': ['「値引きの適用 CSV取込」', 'Tiêu đề 「値引きの適用 CSV取込」']}, {'no': '1.3', 'ja': 'キャンセル', 'vi': 'Hủy', 'sel': '.csvph .btns button.out::キャンセル', 'kind': 'button', 'trig': 'click', 'detail': ['一覧へ戻る（何も登録しない）。見出しの右のボタン（アンケートの CSV取込と同じ）。', 'Về danh sách (không đăng ký gì). Nút bên phải tiêu đề.']}, {'no': '2', 'ja': 'CSVテンプレートの列（定義。画面には出さない）', 'vi': 'Các cột của CSV template (định nghĩa; không hiện trên màn hình)', 'sel': '-', 'kind': 'area', 'trig': 'view', 'detail': ['取り込むファイルの列の定義（1行目の見出し・この順。CSV出力と同じ列）。テンプレートの写しは docs/05_画面設計書/CSVテンプレート/discountApply.csv。キー＝値引きID（空欄＝新規・採番）。UTF-8（BOM 可）・5,000行まで。空欄のセルは今の値のまま、「-」で消す。2.1〜 の必須・長さ・チェックは入力画面の項目と同じ（違うところだけ書く）。画面には出さない（hong 2026/10/05）。', 'Định nghĩa cột của tệp nhập (dòng 1 = tiêu đề, theo thứ tự này; cùng cột với CSV出力). Bản mẫu: docs/05_画面設計書/CSVテンプレート/discountApply.csv. Khóa = 値引きID (trống = mới, cấp ID). UTF-8 (có BOM được), tối đa 5.000 dòng. Ô trống giữ giá trị cũ, "-" để xóa. Bắt buộc / độ dài / kiểm tra của 2.1〜 giống mục nhập trên màn hình (chỉ ghi chỗ khác). Không hiện trên màn hình (hong 2026/10/05).']}, {'no': '2.1', 'ja': '値引きID', 'vi': 'Mã giảm giá', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '○', 'len': ['文字列 DC＋6桁', 'DC + 6 số'], 'valid': ['新規の行で必須。更新の行は空欄＝今の値のまま。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ.'], 'detail': ['画面の項目 3.1「値引きID」と同じ。', 'Giống mục 3.1 「値引きID」 trên màn hình.'], 'ex': ['DC000013', 'Giá trị như ở tệp CSV出力 (docs/05_画面設計書/CSVテンプレート)'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01']}, {'no': '2.2', 'ja': '拠点ID', 'vi': 'Mã điểm', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '○', 'len': ['文字列 CU＋5桁', 'CU + 5 chữ số'], 'valid': ['必須。拠点マスタにない ID はエラー。', 'Bắt buộc. Không có trong 拠点 thì lỗi.'], 'detail': ['値引きを付ける拠点。キーの一部（値引きID＋拠点ID＋適用開始月）。', 'Điểm áp dụng. Một phần của khóa (値引きID + 拠点ID + 適用開始月).'], 'ex': ['CU00975', 'Mã điểm giao'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01']}, {'no': '2.3', 'ja': '拠点名', 'vi': 'Tên điểm', 'sel': '-', 'kind': 'label', 'trig': 'view', 'req': '－', 'len': ['文字列', 'Chuỗi'], 'valid': ['出力だけ。取込では読まない（書いてあっても無視）。', 'chỉ xuất; nhập không đọc (có ghi cũng bỏ qua).'], 'detail': ['出力だけ（取込では読まない）。拠点ID から出す。', 'Chỉ xuất; lấy từ 拠点ID.']}, {'no': '2.4', 'ja': '適用開始月', 'vi': 'Tháng bắt đầu', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '○', 'len': ['年月 YYYY-MM（サイクル月）', 'YYYY-MM (tháng chu kỳ)'], 'valid': ['必須。形式が違うとエラー。', 'Bắt buộc. Sai định dạng thì lỗi.'], 'detail': ['この月から先の子契約に値引きを付ける（確定・請求済の月は変えない）。キーの一部。', 'Gắn giảm giá cho hợp đồng con từ tháng này (tháng đã chốt / đã xuất hóa đơn không đổi). Một phần của khóa.'], 'ex': ['2026-10', 'Tháng chu kỳ bắt đầu áp dụng'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01']}, {'no': '2.5', 'ja': '適用終了月', 'vi': 'Tháng kết thúc', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '－', 'len': ['年月 YYYY-MM', 'YYYY-MM'], 'valid': ['任意。開始月より前はエラー。空欄＝ずっと。（「-」で消せる）', 'Tùy chọn. Trước tháng bắt đầu thì lỗi. Trống = mãi.'], 'detail': ['この月より後の子契約から値引きを外す。', 'Sau tháng này thì bỏ giảm giá khỏi hợp đồng con.'], 'ex': ['（空欄）', 'Trống = áp dụng mãi'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)']}, {'no': '3', 'ja': 'ファイルを選ぶ（ステップ1）', 'vi': 'Chọn tệp (bước 1)', 'sel': '#sec-csv', 'kind': 'area', 'trig': 'view', 'pattern': 'P-CSV'}, {'no': '3.1', 'ja': '手順', 'vi': 'Các bước', 'sel': '.steps', 'kind': 'label', 'trig': 'view', 'detail': ['1 ファイルを選ぶ → 2 確認・登録（カードの外・中央。アンケートの CSV取込と同じ）。今の手順を濃く、済んだ手順を緑に。', '1 chọn tệp → 2 xác nhận・đăng ký (ngoài card, giữa trang; giống CSV取込 của アンケート). Bước hiện tại tô đậm, bước xong màu xanh.']}, {'no': '3.2', 'ja': '説明', 'vi': 'Giải thích', 'sel': '#sec-csv .hint', 'kind': 'label', 'trig': 'view', 'detail': ['取込の決まり（上書き／新規・UTF-8・5,000行・エラーの行は取り込まずほかの行を登録）。', 'Quy tắc nhập (ghi đè / mới, UTF-8, 5.000 dòng, dòng lỗi bỏ qua, dòng khác vẫn đăng ký).']}, {'no': '3.3', 'ja': 'ファイルを選ぶ', 'vi': 'Chọn tệp', 'sel': '#sec-csv button.out::ファイルを選ぶ', 'kind': 'file', 'trig': 'input', 'req': '○', 'len': ['CSV（UTF-8・.csv）1ファイル', '1 tệp CSV (UTF-8, .csv)'], 'init': ['なし', 'Không'], 'ex': ['値引きの適用_20261005.csv', 'Tệp cùng cột với CSV出力 (2.1〜)'], 'err': ['E34'], 'detail': ['ファイルを選ぶか、枠にドラッグ＆ドロップ。選ぶとすぐに確かめて（何も保存しない）ステップ2へ。.csv 以外・UTF-8 以外・読めないファイル・見出しの列が 2.1〜 と違うファイルはその場でエラーの帯。', 'Chọn tệp hoặc kéo thả vào khung. Chọn xong kiểm tra ngay (không lưu) và sang bước 2. Không phải .csv / không phải UTF-8 / không đọc được / tiêu đề cột khác 2.1〜 thì hiện dải lỗi.']}, {'no': '3.4', 'ja': 'ドラッグ＆ドロップの枠', 'vi': 'Khung kéo thả', 'sel': '#sec-csv button.out::ファイルを選ぶ^2', 'kind': 'area', 'trig': 'view', 'detail': ['ファイルを重ねると枠が青くなる。選んだファイル名を下に出す。', 'Kéo tệp lên thì khung chuyển xanh. Tên tệp đã chọn hiện phía dưới.']}]},
    {'id': '021', 'code': 'AW_DISC_005', 'state': ['確認・登録（ステップ2）', 'Xác nhận, đăng ký (bước 2)'], 'url': '/ops/masters/discounts/import-apply', 'setup': 'const sleep=ms=>new Promise(r=>setTimeout(r,ms));const q=s=>document.querySelector(s);const res=await fetch(\'/api/domain/csv/export\',{method:\'POST\',credentials:\'include\',headers:{\'Content-Type\':\'application/json\',\'x-es-site\':\'ops\'},body:JSON.stringify({args:{entity:\'discountApply\',scope:{site:\'ops\'}}})});const t=await res.json();const esc=v=>\'\\"\'+String(v??\'\').replace(/\\"/g,\'\\"\\"\')+\'\\"\';const rows=[t.head,...t.rows];rows.push([\'DC000001\',\'CU00871\',\'\',\'2026-12\',\'\']);const bad=t.rows[0].slice();bad[0]=\'XX999999\';rows.push(bad);const text=\'\\ufeff\'+rows.map(r=>r.map(esc).join(\',\')).join(\'\\r\\n\');const inp=q(\'#sec-csv input[type=file]\');const dt=new DataTransfer();dt.items.add(new File([text],\'取込テスト.csv\',{type:\'text/csv\'}));inp.files=dt.files;inp.dispatchEvent(new Event(\'change\',{bubbles:true}));await sleep(2500);window.scrollTo(0,q(\'#sec-csv\').offsetTop-80);', 'full': True, 'wait': 600, 'note': ['ファイルを選んだ直後。見本は CSV出力（ひな形）のファイルに、新しい適用の行（DC000001 × CU00871 × 2026-12・新規の見本）と、キーが誤りの行を1つ足したもの（エラーの行の見本）。', 'Ngay sau khi chọn tệp. Mẫu = tệp CSV出力 (mẫu) + 1 dòng áp dụng mới (DC000001 × CU00871 × 2026-12, mẫu 新規) + 1 dòng khóa sai (mẫu dòng lỗi).'], 'items': [{'no': '4', 'ja': '確認・登録（ステップ2）', 'vi': 'Xác nhận, đăng ký (bước 2)', 'sel': '#sec-csv', 'kind': 'area', 'trig': 'show', 'pattern': 'P-CSV', 'err': ['S03', 'E34'], 'detail': ['ファイル名・件数と、行ごとの結果。「登録」でエラー以外の行を登録する（エラーの行は取り込まない・hong 2026/10/05）。', 'Tên tệp, số dòng và kết quả từng dòng. 登録 thì đăng ký các dòng không lỗi (dòng lỗi bỏ qua, hong 2026/10/05).']}, {'no': '4.1', 'ja': '件数', 'vi': 'Số lượng', 'sel': '#sec-csv .badge', 'kind': 'label', 'trig': 'view', 'detail': ['新規／更新／変更なし／エラー の件数（バッジ）。', 'Số dòng 新規 / 更新 / 変更なし / エラー (badge).']}, {'no': '4.2', 'ja': 'エラーの行', 'vi': 'Dòng lỗi', 'sel': '#sec-csv .notice.ng', 'kind': 'label', 'trig': 'show', 'cond': ['エラーの行があるとき', 'Khi có dòng lỗi'], 'detail': ['「エラーの行 n件は取り込みません…」と、行番号・キー・列名・内容の表（多いときは先頭だけ。全部はエラー一覧CSV）。内容は 2.1〜 のチェックの文言。', '「エラーの行 n件は取り込みません…」 + bảng số dòng / khóa / cột / nội dung (nhiều thì chỉ phần đầu; đủ ở エラー一覧CSV). Nội dung = câu kiểm tra của 2.1〜.']}, {'no': '4.3', 'ja': 'エラー一覧CSV', 'vi': 'Xuất CSV lỗi', 'sel': '#sec-csv button::エラー一覧CSV', 'kind': 'button', 'trig': 'click', 'detail': ['エラーの行だけを、元の列＋エラーの内容で書き出す（直して選び直すため）。', 'Xuất riêng các dòng lỗi với cột gốc + nội dung lỗi (để sửa rồi chọn lại).']}, {'no': '4.4', 'ja': '登録する内容（前 → 後）', 'vi': 'Nội dung sẽ đăng ký (trước → sau)', 'sel': '#sec-csv b::登録する内容', 'kind': 'label', 'trig': 'view', 'cond': ['新規・更新の行があるとき', 'Khi có dòng 新規 / 更新'], 'detail': ['行番号・区分（新規／更新）・キー・名前・変わる項目（前 → 後）。', 'Số dòng, loại (新規 / 更新), khóa, tên, các mục thay đổi (trước → sau).']}, {'no': '4.5', 'ja': 'ファイルを選び直す', 'vi': 'Chọn lại tệp', 'sel': '.csvph .btns button.out::ファイルを選び直す', 'kind': 'button', 'trig': 'click', 'detail': ['ステップ1に戻る。何も登録しない。', 'Về bước 1. Không đăng ký gì.']}, {'no': '4.6', 'ja': '登録', 'vi': 'Đăng ký', 'sel': '.csvph .btns button.pri', 'kind': 'button', 'trig': 'click', 'err': ['S03', 'E34'], 'cond': ['新規か更新の行が1つ以上あり、ファイル全体のエラーがないとき。警告（金額の変更など）があるときは「警告を確認しました」にチェックするまで押せない', 'Có ≥1 dòng 新規 / 更新 và không lỗi cả tệp. Có cảnh báo (vd đổi tiền) thì phải check 「警告を確認しました」 mới nhấn được'], 'detail': ['エラー以外の行を登録し、S03 のトースト（新規 n件・更新 n件）、一覧へ戻る。100件を超えるときは裏で進めて進み具合を出す。取込の記録と、行ごとの変更履歴「CSV取込で更新」を残す。', 'Đăng ký các dòng không lỗi, toast S03 (新規 n, 更新 n), về danh sách. Quá 100 dòng thì chạy nền và hiện tiến độ. Ghi lịch sử nhập và lịch sử từng bản ghi 「CSV取込で更新」.']}]},
]

VIEWS = V_LIST + V_DETAIL + V_FORM + V_CSV
