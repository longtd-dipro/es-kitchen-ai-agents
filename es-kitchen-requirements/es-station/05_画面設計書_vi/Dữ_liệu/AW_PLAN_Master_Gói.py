# -*- coding: utf-8 -*-
"""
画面設計書のデータ：運営管理者Web ＞ マスタ管理 ＞ プランマスタ（一覧・詳細・登録／編集）
元：本物の Web（このリポジトリ app/ops/masters/plans）、決定台帳 B・E・F、決定_v2.3追補_プランマスタ_20260929（28-147〜186）、
    マスタ項目一覧 §0.12・「プランマスタ編集」、運営Web_権限表、STEP7 一覧の決まり、確認メモ_AW_PLAN_プランマスタ.md（hong 回答 Q1〜Q7）
番号は画面ごとに通し。タブ・モーダルの状態では、その状態で増える・変わる項目だけ書く（共通の項目は最初の状態に1回）。
"""

TITLE = ["プランマスタ（AW_PLAN）", "Plan master (AW_PLAN)"]
SHEET = ["プランマスタ", "Plan master"]
BASENAME = "画面設計書_AW_PLAN_プランマスタ"
IMG_PREFIX = "AW_PLAN"
OUT_DIR = "AW_PLAN_プランマスタ"
CODE_NOTE = ["画面コードは規約 <Module(2)>_<Feature(4)>_<Seq(3)>（docs/01_仕様/画面コード規約_20261005.md）。AW＝運営管理者Web、PLAN＝プランマスタ",
             "Mã màn hình theo quy ước <Module(2)>_<Feature(4)>_<Seq(3)>. AW = Admin Web, PLAN = Plan master"]
SITE = "ops"
SYSTEM = {"ja": "運営管理者Web", "vi": "Web quản trị vận hành"}
AUTHOR = "Claude（cloud）／確認：hong"
CREATED = "2026-10-05"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "ops", "loginId": "Ad00010"}   # フル権限（ops.full）。見本：中村幸子

DECISIONS = [
    {"date": "2026-10-05", "target": "価格の持ち方",
     "q": ["価格世代（コード）か価格プランの表（仕様）か", "Giữ giá theo 価格世代 (code) hay bảng 価格プラン (spec)?"],
     "a": ["現行画面どおり：コースごとのタブの中に価格プランの表（公開用1行・価格プラン名・開始期間／終了期間〈日付〉・価格 COOL便／ES配送便）。1行＝1世代。これに 使っている子契約・直す／削除／誤りの訂正・一括切替 を足す。独立した価格世代のカードは置かない（2026/10/05 HTML の確認で C 案を置き換え）", "Như màn hiện hành: bảng 価格プラン trong tab của mỗi course (公開用 1 dòng, tên, ngày bắt đầu/kết thúc, giá COOL便/ES配送便). 1 dòng = 1 thế hệ, thêm cột 使っている子契約 và thao tác. Không có card 価格世代 riêng (thay cho phương án C)"],
     "src": "hong 回答 2026/10/05（画面設計書 Q1 → HTML の確認で修正）・台帳 F・受付簿 #52・#63"},
    {"date": "2026-10-05", "target": "初期備品・プランに含む資材",
     "q": ["プランマスタ詳細（コード）か資材マスタ（仕様）か", "Đặt ở プランマスタ詳細 (code) hay 資材マスタ (spec)?"],
     "a": ["A：プランマスタ詳細のカードで入力する", "A: nhập ở card trong プランマスタ詳細"],
     "src": "hong 回答 2026/10/05（画面設計書 Q2）・台帳 F・受付簿 #53"},
    {"date": "2026-10-05", "target": "権限",
     "q": ["だれが作成・編集・削除できるか（権限表は全役割 R）", "Ai được tạo/sửa/xóa? (bảng quyền ghi R cho mọi vai trò)"],
     "a": ["A：フル権限＝CRUD、ほかの6役割＝R（閲覧・CSV出力）", "A: フル権限 = CRUD, 6 vai trò còn lại = R"],
     "src": "hong 回答 2026/10/05（画面設計書 Q3）・台帳 F・受付簿 #54・権限表を修正"},
    {"date": "2026-10-05", "target": "一覧の並べ替え",
     "q": ["並べ替えの有無と初期の並び", "Có 並べ替え không, thứ tự mặc định?"],
     "a": ["並べ替えあり（STEP7 L2）。初期は 月次提供上限数 昇順 → プランID 昇順", "Có 並べ替え (STEP7 L2). Mặc định 月次提供上限数 tăng dần → プランID tăng dần"],
     "src": "hong 回答 2026/10/05（画面設計書 Q4）・台帳 F・受付簿 #55"},
    {"date": "2026-10-05", "target": "冷凍_月次提供数_下限",
     "q": ["マスタに出すか（REQ-PM-039 社内確認中）", "Có giữ trường này không? (REQ-PM-039)"],
     "a": ["持つ", "Giữ"],
     "src": "hong 回答 2026/10/05（画面設計書 Q5）・台帳 F・受付簿 #56"},
    {"date": "2026-10-05", "target": "離脱の確認（Q02）",
     "q": ["入力中に画面を離れるときの確認を出すか", "Có hiện xác nhận khi rời màn hình đang nhập không?"],
     "a": ["全サイト共通で出す（Message List No.25）", "Có, toàn hệ thống (Message List No.25)"],
     "src": "hong 回答 2026/10/05（画面設計書 Q6）・台帳 F・受付簿 #57"},
    {"date": "2026-10-05", "target": "企業負担分（税抜）の端数",
     "q": ["切り捨て【暫定】のままか、台帳 E の四捨五入にそろえるか", "Giữ làm tròn xuống (tạm) hay theo 台帳 E (四捨五入)?"],
     "a": ["四捨五入（システム全体で同じ）", "四捨五入 (đồng bộ toàn hệ thống)"],
     "src": "hong 回答 2026/10/05（画面設計書 OPEN）・台帳 F・受付簿 #59"},
    {"date": "2026-10-05", "target": "冷凍_標準の配送回数・残りわずか率の初期値",
     "q": ["冷凍の標準の配送回数の値（冷凍庫の表 未受領）と残りわずか率の値", "Giá trị số lần giao 冷凍 (chưa có bảng) và tỷ lệ 残りわずか"],
     "a": ["冷凍＝全プラン 1回／月で登録し運営が後から直す。残りわずか率＝25%（プラン・コースごとに変更可）", "冷凍 = 1 lần/tháng cho mọi plan, 運営 sửa sau. 残りわずか率 = 25% (đổi được theo plan/course)"],
     "src": "hong 回答 2026/10/05（画面設計書 OPEN）・台帳 F・受付簿 #60"},
    {"date": "2026-10-05", "target": "画面コード",
     "q": ["画面コードの規約", "Quy ước mã màn hình"],
     "a": ["<Module(2)>_<Feature(4)>_<Seq(3)>。AW_PLAN_001〜003", "<Module(2)>_<Feature(4)>_<Seq(3)>. AW_PLAN_001〜003"],
     "src": "hong 回答 2026/10/05（画面設計書 Q7）・台帳 F・画面コード規約_20261005"},
    {"date": "2026-10-05", "target": "標準貸出設備のCSV取込（タブの中）",
     "q": ["タブの中にも設備だけの CSV取込ボタンを置くか", "Có đặt nút nhập CSV riêng cho 標準貸出設備 trong tab không?"],
     "a": ["置かない。CSV取込は一覧の1つだけ", "Không. CSV取込 chỉ có 1 chỗ ở 一覧"],
     "src": "hong 回答 2026/10/05（画面設計書 HTML のコメント）・台帳 F・受付簿 #68"},
    {"date": "2026-10-05", "target": "初期備品・プランに含む資材の保存と変更履歴",
     "q": ["カードごとの保存ボタンと変更履歴の表を置くか", "Card có nút lưu riêng và bảng lịch sử riêng không?"],
     "a": ["置かない。画面の 登録／保存 で一緒に保存し、変更はタブ 変更履歴に残す", "Không. Lưu chung bằng 登録／保存, lịch sử ghi ở tab 変更履歴"],
     "src": "hong 回答 2026/10/05（画面設計書 HTML のコメント）・台帳 F・受付簿 #69"},
    {"date": "2026-10-05", "target": "価格プランの開始期間・終了期間",
     "q": ["期間で選べる世代を制限するか", "Có dùng kỳ này để giới hạn thế hệ chọn được không?"],
     "a": ["参考の項目。契約がどの世代を使うかは子契約の「適用された価格プラン」で決まる（28-181）", "Mục tham khảo. Hợp đồng dùng thế hệ nào là do 「適用された価格プラン」 của 子契約 (28-181)"],
     "src": "hong 回答 2026/10/05（画面設計書 HTML のコメント）・台帳 F・受付簿 #70"},
    {"date": "2026-10-05", "target": "新規登録の価格プランの初期値",
     "q": ["新規登録でほかのプランの世代の名前を入れておくか", "Màn mới có điền sẵn tên thế hệ của plan khác không?"],
     "a": ["B：ほかのプランにある世代の名前の行をすべて入れておく（価格は空・公開用は最新の行）", "B: điền sẵn mọi dòng tên thế hệ của plan khác (giá trống, 公開用 = dòng mới nhất)"],
     "src": "hong 回答 2026/10/05（画面設計書 HTML のコメント・B）・台帳 F・受付簿 #73"},
    {"date": "2026-10-05", "target": "価格世代（共通データ）のカード",
     "q": ["詳細の下の価格世代カードは要るか", "Có cần card 価格世代 cuối trang chi tiết không?"],
     "a": ["出さない（価格プランの表に統合・受付簿 #63）", "Không hiện (gộp vào bảng 価格プラン, 受付簿 #63)"],
     "src": "hong 回答 2026/10/05（画面設計書 HTML のコメント）・台帳 F・受付簿 #71"},
]
CHANGES = [{'ver': '1.4', 'date': '2026-10-05', 'no': ['1.3', '3.1'], 'type': '変更', 'before': ['CSV取込の画面：手順がカードの中、見出しは .phead', 'Màn CSV取込: stepper trong card, tiêu đề .phead'], 'after': ['アンケートの CSV取込と同じ形（見出し .ph＋ボタン、手順はカードの外の中央、カードに見出し）', 'Giống CSV取込 của アンケート (.ph + nút, stepper ngoài card, card có tiêu đề)'], 'reason': ['hong 2026/10/05「機種マスタ CSV取込の UI が異変。UI/UX 改善して」', 'hong 2026/10/05'], 'impact': ['MasterCsvImport の Frame・CsvUi.stepsInFrame', 'MasterCsvImport Frame; CsvUi.stepsInFrame']},
 {'ver': '1.3', 'date': '2026-10-05', 'no': ['2', '2.5', '2.6', '2.7', '2.8', '2.9', '2.10'], 'type': '追加', 'before': ['検索条件は キーワード・公開ステータス・月次提供上限数・コース の4つ', '4 điều kiện tìm kiếm'], 'after': ['価格（COOL便）・価格（ES配送便）の範囲、価格プランの世代名、利用状況、標準貸出設備の機種、更新日 を追加（A〜E）', 'Thêm khoảng giá COOL便 / ES配送便, tên thế hệ giá, tình trạng sử dụng, thiết bị tiêu chuẩn, ngày cập nhật (A〜E)'], 'reason': ['hong 2026/10/05「全部追加で」（画面設計書 HTML のコメント）・受付簿 #128', 'hong 2026/10/05, 受付簿 #128'], 'impact': ['一覧の絞り込み（plans.ts の search・logic.ts filterRows・MasterList）。マスタ項目一覧の検索条件 5〜10', 'Bộ lọc danh sách (plans.ts search, filterRows, MasterList). マスタ項目一覧 điều kiện 5〜10']},
 {'ver': '1.3', 'date': '2026-10-05', 'no': ['2.11', '2.12', '2.13'], 'type': '変更', 'before': ['2.5 削除済みを表示しない・2.6 クリア・2.7 検索', '2.5 / 2.6 / 2.7'], 'after': ['番号を 2.11・2.12・2.13 に（条件の追加で繰り下げ）', 'Đổi số thành 2.11 / 2.12 / 2.13'], 'reason': ['同上', 'Như trên'], 'impact': ['番号だけ', 'Chỉ đổi số']},
 {'ver': '1.3', 'date': '2026-10-05', 'no': ['5'], 'type': '削除', 'before': ['条件を変えて未反映のときに「検索」の横に「未適用」の印', 'Dấu 未適用 cạnh nút 検索 khi đổi điều kiện mà chưa áp dụng'], 'after': ['「未適用」の印は出さない（全部の一覧）', 'Không hiện dấu 未適用 (mọi danh sách)'], 'reason': ['hong 2026/10/05（画面設計書 HTML のコメント）・受付簿 #127', 'hong 2026/10/05, 受付簿 #127'], 'impact': ['ListView の UnappliedMark を出さない・P-LIST', 'Bỏ UnappliedMark ở ListView; P-LIST']},
 {'ver': '1.3', 'date': '2026-10-05', 'no': ['1', '1.1', '1.2', '1.3', '2', '2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2.7', '2.8', '2.9', '2.10', '2.11', '2.12', '2.13', '2.14', '2.15', '2.16', '2.17', '2.18', '2.19', '2.20', '2.21', '2.22', '2.23', '2.24', '2.25', '2.26', '2.27', '2.28', '2.29', '2.30', '2.31', '2.32', '2.33', '2.34', '2.35', '3', '3.1', '3.2', '3.3', '3.4', '3.5', '3.6', '3.7', '3.8', '3.9', '3.10', '3.11', '3.12', '3.13', '3.14', '3.15', '3.16', '3.17', '3.18', '3.19', '3.20', '3.21', '3.22', '3.23', '3.24', '3.25', '3.26', '3.27', '3.28', '3.29', '3.30', '3.31', '3.32', '3.33', '3.34', '3.35', '4', '4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '5', '5.1', '5.2', '5.3', '5.4', '5.5', '5.6'], 'type': '変更', 'before': ['CSV取込の画面に「CSVの列（テンプレートの定義）」の表を出す（項目 2・3.x）', 'Màn CSV取込 hiện bảng định nghĩa cột (mục 2, 3.x)'], 'after': ['列の定義は画面に出さない。CSVテンプレートの列（必須・長さ・チェック・データ例）を項目 2.x として設計書にだけ書く（入力画面と同じ定義）。ファイルを選ぶ＝3.x、確認・登録＝4.x に番号を詰めた', 'Không hiện bảng cột trên màn hình. Định nghĩa cột template (bắt buộc, độ dài, kiểm tra, ví dụ) chỉ ghi ở 設計書 (mục 2.x, như màn nhập). Chọn tệp = 3.x, xác nhận = 4.x'], 'reason': ['hong 2026/10/05「CSV テンプレは画面で表示ではなく、一覧に追加して…入力画面と同様に定義必要」・受付簿 #129', 'hong 2026/10/05, 受付簿 #129'], 'impact': ['画面から列の表のカードを外す（MasterCsvImport）。取込のチェックは 2.x のとおり', 'Bỏ card bảng cột khỏi màn hình (MasterCsvImport). Kiểm tra khi nhập theo 2.x']},
 {'ver': '1.2',
  'date': '2026-10-05',
  'no': ['*'],
  'type': '追加',
  'before': ['CSV取込はモーダル（一覧の状態）', 'Nhập CSV là modal (trạng thái của danh sách)'],
  'after': ['画面 AW_PLAN_004「CSV取込」（CSVの列の定義の表＋1 ファイルを選ぶ → 2 確認・登録）', 'Màn hình AW_PLAN_004 「CSV取込」 (bảng định nghĩa cột + bước 1 chọn tệp → bước 2 xác nhận)'],
  'reason': ['hong 2026/10/05（モーダルではなく画面・テンプレートの定義を書く）・受付簿 #89', 'hong 2026/10/05, 受付簿 #89'],
  'impact': ['モーダルを画面に。列の定義 API（csv.columns）・テンプレート CSV（docs/05_画面設計書/CSVテンプレート）', 'Modal → màn hình; API csv.columns; template CSV']},
 {'ver': '1.2',
  'date': '2026-10-05',
  'no': ['10', '10.1', '10.2', '10.3'],
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
         '3.28',
         '3.29',
         '3.30',
         '3.31',
         '3.32',
         '3.33',
         '3.34',
         '3.35',
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
         '6.5',
         '6.6',
         '6.7',
         '10.5',
         '10.6',
         '10.7',
         '14.5',
         '14.6',
         '17',
         '20'],
  'type': '変更',
  'before': ['版 1.1 の記載', 'Nội dung bản 1.1'],
  'after': ['hong の HTML コメント（2026/10/05）への対応：エラーの枠1行＋タブの印、詳細は表示だけ、削除済の行の見本、金額の右寄せ、CSV のエラーの行の扱い、区分の詳細、料金の改定なし、ページ送り・絞り込み、オプション区分マスタ・表示順なし・対象の「すべて」・A型の一覧 など（受付簿 #76〜#88）',
            'Theo các comment HTML của hong (2026/10/05): khung lỗi 1 dòng + đánh dấu tab, chi tiết chỉ xem, mẫu dòng đã xóa, căn phải tiền, xử lý dòng lỗi CSV, chi tiết theo loại, bỏ 料金の改定, phân '
            'trang / lọc, master loại option, bỏ 表示順, check 「すべて」, danh sách loại A (受付簿 #76〜#88)'],
  'reason': ['hong 2026/10/05（画面設計書 HTML のコメント）', 'hong 2026/10/05'],
  'impact': ['各項目の detail／demo_ok を参照（コードの宿題は受付簿）', 'Xem detail / demo_ok từng mục (宿題 code ở 受付簿)']},
 {'ver': '1.1',
  'date': '2026-10-05',
  'no': ['8',
         '9',
         '9.1',
         '9.2',
         '9.3',
         '9.4',
         '9.5',
         '9.6',
         '9.7',
         '12',
         '13',
         '13.1',
         '13.2',
         '13.3',
         '13.4',
         '13.5',
         '13.6',
         '13.7',
         '16',
         '17',
         '17.1',
         '17.2',
         '17.3',
         '17.4',
         '17.5',
         '17.6',
         '17.7',
         '19',
         '19.1',
         '19.2',
         '19.3',
         '19.4'],
  'type': '変更',
  'before': ['初期備品・プランに含む資材のカードに 保存・元に戻す と変更履歴（資材）の表', 'Card có nút 保存／元に戻す và bảng lịch sử riêng'],
  'after': ['カードに保存ボタン・履歴の表は置かない。画面の 登録／保存 で一緒に保存し、変更はタブ 変更履歴に残す。登録・編集にも入力の項目を追加', 'Không có nút lưu / bảng lịch sử riêng; lưu chung bằng 登録／保存, lịch sử ở tab 変更履歴. Thêm mục nhập ở màn đăng ký/sửa'],
  'reason': ['hong 2026/10/05（画面設計書のコメント）・受付簿 #69', 'hong 2026/10/05, 受付簿 #69'],
  'impact': ['PlanMaterials の保存・履歴を外し、フォームの保存に統合する', 'Bỏ lưu/lịch sử riêng của PlanMaterials, gộp vào lưu của form']},
 {'ver': '1.1',
  'date': '2026-10-05',
  'no': ['7.2',
         '7.2.1',
         '7.2.2',
         '7.2.3',
         '7.2.4',
         '7.2.5',
         '7.2.6',
         '7.3',
         '7.3.1',
         '7.3.2',
         '7.3.3',
         '7.3.4',
         '7.3.5',
         '7.3.6',
         '7.4',
         '8.2',
         '8.3',
         '11.2',
         '11.3',
         '11.3.1',
         '11.3.2',
         '11.3.3',
         '11.3.4',
         '11.3.5',
         '11.3.6',
         '11.4',
         '12.3',
         '12.4',
         '15.2',
         '15.2.1',
         '15.2.2',
         '15.2.3',
         '15.2.4',
         '15.2.5',
         '15.2.6',
         '15.3',
         '15.4'],
  'type': '削除',
  'before': ['タブの中の「標準貸出設備のCSV取込」ボタン', 'Nút 標準貸出設備のCSV取込 trong tab'],
  'after': ['置かない（CSV取込は一覧の1つだけ）。以降の番号を詰めた', 'Bỏ (CSV取込 chỉ ở danh sách). Dồn số thứ tự sau đó'],
  'reason': ['hong 2026/10/05・受付簿 #68', 'hong 2026/10/05, 受付簿 #68'],
  'impact': ['spec plans.ts・MasterDetail から外した（実装済み）', 'Đã bỏ khỏi spec plans.ts, MasterDetail']},
 {'ver': '1.1',
  'date': '2026-10-05',
  'no': ['6.3', '6.4', '7.3', '7.4', '10.3', '10.4', '11.3', '11.4', '14.3', '14.4'],
  'type': '変更',
  'before': ['開始期間・終了期間＝世代の適用期間', '開始期間／終了期間 = kỳ áp dụng của thế hệ'],
  'after': ['参考（記録）の項目。契約がどの世代を使うかは子契約の「適用された価格プラン」で決まる（28-181）', 'Mục tham khảo. Thế hệ do 適用された価格プラン của 子契約 quyết định (28-181)'],
  'reason': ['hong 2026/10/05・受付簿 #70', 'hong 2026/10/05, 受付簿 #70'],
  'impact': ['期間で世代の選択を制限しない（コードの変更なし）', 'Không giới hạn chọn thế hệ theo kỳ (không đổi code)']},
 {'ver': '1.1',
  'date': '2026-10-05',
  'no': ['6.2', '10.2', '14.2'],
  'type': '変更',
  'before': ['新規登録の価格プランの表は空', 'Bảng 価格プラン ở màn mới trống'],
  'after': ['ほかのプランにある世代の名前の行をすべて入れておく（価格は空・公開用は最新の行）', 'Điền sẵn mọi tên thế hệ của plan khác (giá trống, 公開用 = dòng mới nhất)'],
  'reason': ['hong 2026/10/05（B）・受付簿 #73', 'hong 2026/10/05 (B), 受付簿 #73'],
  'impact': ['新規登録の初期値：既存の価格世代の名前から行を作る', 'Giá trị ban đầu màn mới: tạo dòng từ tên thế hệ hiện có']},
 {'ver': '1.1',
  'date': '2026-10-05',
  'no': ['8',
         '8.1',
         '8.2',
         '8.3',
         '8.4',
         '8.5',
         '8.6',
         '9',
         '9.1',
         '9.2',
         '9.3',
         '9.4',
         '9.5',
         '9.6',
         '9.7',
         '9.8',
         '9.9',
         '9.10',
         '10',
         '10.1',
         '10.4.1',
         '10.4.2',
         '10.4.3',
         '10.4.4',
         '10.4.5',
         '10.4.6',
         '10.5',
         '10.6',
         '10.7',
         '10.8',
         '10.9',
         '10.10',
         '11',
         '11.1',
         '11.2',
         '11.3',
         '11.4',
         '11.5',
         '11.6',
         '12',
         '12.1',
         '12.2',
         '12.3',
         '12.4',
         '12.5',
         '12.6',
         '12.7',
         '12.8',
         '13',
         '13.1',
         '13.2',
         '13.2.1',
         '13.2.2',
         '13.2.3',
         '13.2.4',
         '13.2.5',
         '13.2.6',
         '13.3',
         '13.4',
         '13.5',
         '13.6',
         '14',
         '14.1',
         '14.5',
         '14.6',
         '14.7',
         '14.8',
         '15',
         '15.1',
         '15.2',
         '15.3',
         '16',
         '17',
         '17.1',
         '17.2',
         '17.3',
         '18',
         '18.1',
         '18.2',
         '18.3',
         '20',
         '21',
         '21.1',
         '21.2',
         '21.3'],
  'type': '変更',
  'before': ['（番号のみ）', '(chỉ số thứ tự)'],
  'after': ['登録・編集の 8 以降の番号を振り直し（初期備品の項目を足したため）。参照先の番号も更新。内容は同じ', 'Đánh lại số từ mục 8 của màn đăng ký/sửa (thêm mục 初期備品); cập nhật số tham chiếu. Nội dung không đổi'],
  'reason': ['受付簿 #69 の項目追加に伴う', 'Do thêm mục theo 受付簿 #69'],
  'impact': ['影響なし', 'Không ảnh hưởng']}]

HIDE_ALWAYS = []
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [
    {"code": "AW_PLAN_001", "ja": "プランマスタ一覧", "vi": "Danh sách plan master"},
    {"code": "AW_PLAN_002", "ja": "プランマスタ詳細", "vi": "Chi tiết plan master"},
    {"code": "AW_PLAN_003", "ja": "プランマスタ登録・編集", "vi": "Đăng ký / sửa plan master"},
    {"code": "AW_PLAN_004", "ja": "プランマスタ CSV取込", "vi": "Nhập CSV plan master"},
]

# ---------------------------------------------------------------- 書きやすくする道具
def F(no, ja, vi, sel, kind, trig="view", **kw):
    d = {"no": no, "ja": ja, "vi": vi, "sel": sel, "kind": kind, "trig": trig}
    d.update(kw)
    return d

# 権限の条件（Q3）
FULL = ["フル権限（ops.full）の役割だけに表示", "Chỉ hiện với vai trò フル権限 (ops.full)"]
# 宿題（コードは決定に未対応）の書き方：demo_ok（仕様が正・コードを直す）
H_SORT = ["並べ替えの UI は未実装（受付簿 #55）。仕様が正", "Chưa có UI sắp xếp (受付簿 #55). Spec đúng"]
H_MAXLEN = ["入力欄に最大文字数の制御がない（宿題 H4）。仕様が正", "Ô nhập chưa giới hạn số ký tự (H4). Spec đúng"]
H_PRICE = ["コードは価格世代カード（画面の下）に 使っている子契約・直す・削除・誤りの訂正 を置いたまま。表への統合は受付簿 #63。仕様が正", "Code vẫn để 使っている子契約 và các thao tác ở card 価格世代 cuối trang; gộp vào bảng là 受付簿 #63. Spec đúng"]
H_DELMSG = ["コードの文言「削除しますか？／削除済にします（…戻せません）」。Message List No.21 に合わせる（[msg]）", "Code dùng câu khác; dùng theo Message List No.21 ([msg])"]
H_EMPTY = ["コードの文言「条件に一致するデータがありません。条件を変えるか「クリア」を押してください。」。Message List No.24 に合わせる（[msg]）", "Code dùng câu khác; dùng theo Message List No.24 ([msg])"]

# JavaScript の部品（setup の先頭に付ける）
JS = ("const sleep=ms=>new Promise(r=>setTimeout(r,ms));"
      "const setv=(el,v)=>{const p=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;"
      "Object.getOwnPropertyDescriptor(p,'value').set.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}));};"
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

# ================================================================ AW_PLAN_001 一覧
LIST_HEADER = [
    F("1", "ヘッダー", "Đầu trang", ".es-pagehead", "area",
      detail=["パンくず（マスタ管理 / プランマスタ）・画面名・操作ボタン。", "Breadcrumb (マスタ管理 / プランマスタ), tên màn hình, nút thao tác."]),
    F("1.1", "パンくず", "Breadcrumb", ".es-breadcrumb", "label", detail=["「マスタ管理 / プランマスタ」。リンクは動かない（表示だけ）。", "「マスタ管理 / プランマスタ」. Chỉ hiển thị."]),
    F("1.2", "画面名", "Tên màn hình", ".es-pagehead__title", "label", detail=["「プランマスタ一覧」", "Tiêu đề 「プランマスタ一覧」"]),
    F("1.3", "CSV取込", "Nhập CSV", "button::CSV取込", "button", "click", cond=FULL, pattern="P-CSV",
      detail=["プランマスタの CSV取込（AW_PLAN_004 の画面へ。決定 28-183）。1つのファイルに 行区分＝プラン／コース／価格／設備 の行を入れる。プランID なら上書き、仮キー（例：新規1）なら新規。価格の行は「削除」＝1 で削除（どの子契約にも使われていない世代だけ）。設備の行はプラン×コースごとに入れ替える。列は CSV入出力_定義_20261003.md。",
              "Nhập CSV plan master (sang màn AW_PLAN_004; quyết định 28-183). 1 tệp gồm các dòng 行区分 = プラン/コース/価格/設備. Có プランID thì ghi đè, khóa tạm (vd 新規1) thì tạo mới. Dòng 価格 có 削除=1 thì xóa (chỉ thế hệ chưa dùng). Dòng 設備 thay toàn bộ theo plan × course. Cột theo CSV入出力_定義_20261003.md."]),
    F("1.4", "CSV出力", "Xuất CSV", "button::CSV出力", "button", "click",
      detail=["検索条件のとおりの全件を、取込と同じ列で出力する（CSV入出力_定義_20261003.md）。閲覧できる役割すべてに出す。", "Xuất toàn bộ theo điều kiện tìm kiếm, cùng cột với nhập. Hiện với mọi vai trò xem được."]),
    F("1.5", "新規登録", "Đăng ký mới", "button::新規登録", "button", "click", cond=FULL,
      detail=["AW_PLAN_003（新規登録）へ。", "Sang AW_PLAN_003 (đăng ký mới)."]),
]
LIST_SEARCH = [
    F("2", "検索条件", "Điều kiện tìm kiếm", ".es-search", "area", pattern="P-LIST",
      detail=["条件は「検索」か Enter で反映する。（「未適用」の印は出さない・hong 2026/10/05）項目が2行以上に折り返すときだけ開閉ボタンを出す。",
              "Điều kiện áp dụng khi nhấn 検索 hoặc Enter; (không hiện dấu 未適用, hong 2026/10/05). Nút đóng/mở chỉ hiện khi điều kiện xuống ≥2 dòng."]),
    F("2.1", "キーワード", "Từ khóa", 'input[aria-label="プランID、管理用プラン名、公開用プラン名"]', "text", "input", req="－",
      len="文字列 60", init=["空", "Trống"], ex=["100プラン", "Tìm theo プランID / 管理用プラン名 / 公開用プラン名, khớp một phần"],
      valid=["部分一致。全角・半角、大文字・小文字を区別しない。", "Khớp một phần, không phân biệt toàn/nửa góc, hoa/thường."],
      detail=["プランID・管理用プラン名・公開用プラン名のどれかに含まれる行。プレースホルダー「プランID、管理用プラン名、公開用プラン名」。", "Lọc dòng có từ khóa trong プランID, 管理用プラン名 hoặc 公開用プラン名."], err=["E04"]),
    F("2.2", "公開ステータス", "Trạng thái công khai", 'select[aria-label="公開ステータス"]', "select", "select", req="－",
      len=["選択（公開／非公開／削除済）", "Chọn (công khai / không công khai / đã xóa)"], init=["未選択（先頭＝条件名）", "Chưa chọn (dòng đầu = tên điều kiện)"],
      ex=["公開", "Trạng thái công khai. 削除済 chỉ có kết quả khi bỏ check 2.11"],
      detail=["「削除済」を選ぶときは 2.11 のチェックも外す（外さないと 0件）。", "Chọn 削除済 thì cũng bỏ check 2.11 (không thì 0 dòng)."]),
    F("2.3", "月次提供上限数", "Giới hạn suất/tháng", 'select[aria-label="月次提供上限数"]', "select", "select", req="－",
      len=["選択（30／50／100／150／200／250／300／400／500／600／1000）", "Chọn (30 / 50 / 100 / 150 / 200 / 250 / 300 / 400 / 500 / 600 / 1000)"], init=["未選択", "Chưa chọn"],
      ex=["100", "Số suất/tháng của plan (= 月次提供上限の合計)"]),
    F("2.4", "コース", "Course", 'select[aria-label="コース"]', "select", "select", req="－",
      len=["選択（スタンダード／ライト（冷蔵庫）／ライト（自販機））", "Chọn (Standard / Light tủ lạnh / Light máy bán hàng)"], init=["未選択", "Chưa chọn"],
      ex=["ライト（自販機）", "Lọc plan có course này trong 選べるコース"],
      detail=["そのコースを「選べるコース」に含むプラン。", "Plan có course này trong 選べるコース."]),
    F("2.5", "価格（COOL便）", "Giá (COOL便)", '.es-range[aria-label="価格（COOL便）"]', "text", "input", req="－",
      len=["金額（整数・税抜）の下限〜上限", "Số tiền (nguyên, chưa thuế) từ〜đến"], init=["空（無制限）", "Trống (không giới hạn)"],
      ex=["45000〜50000", "Lọc plan có giá COOL便 của thế hệ đang công khai (スタンダード hoặc ライト) trong khoảng này"],
      valid=["半角数字。下限・上限のどちらか一方だけでもよい。", "Số nửa góc. Chỉ nhập 1 đầu cũng được."],
      detail=["公開用の価格プランの「価格（COOL便）」（スタンダード／ライト）がこの範囲にあるプラン。hong 2026/10/05 A。", "Plan có 価格（COOL便） của thế hệ công khai (スタンダード / ライト) trong khoảng. hong 2026/10/05 A."], err=["E04"]),
    F("2.6", "価格（ES配送便）", "Giá (ES配送便)", '.es-range[aria-label="価格（ES配送便）"]', "text", "input", req="－",
      len=["金額（整数・税抜）の下限〜上限", "Số tiền (nguyên, chưa thuế) từ〜đến"], init=["空（無制限）", "Trống (không giới hạn)"],
      ex=["40000〜", "Lọc theo giá ES配送便 (スタンダード / ライト / ライト（自販機）)"],
      valid=["半角数字。下限・上限のどちらか一方だけでもよい。", "Số nửa góc. Chỉ nhập 1 đầu cũng được."],
      detail=["公開用の価格プランの「価格（ES配送便）」（スタンダード／ライト／ライト（自販機））がこの範囲にあるプラン。hong 2026/10/05 A。", "Plan có 価格（ES配送便） của thế hệ công khai trong khoảng. hong 2026/10/05 A."], err=["E04"]),
    F("2.7", "価格プランの世代名", "Tên thế hệ giá", 'select[aria-label="価格プランの世代名"]', "select", "select", req="－",
      len=["選択（登録されている世代名。例：元の料金／改訂第一回目／改訂第二回目／改訂第三回目）", "Chọn (tên thế hệ giá đã đăng ký; ví dụ giá gốc / lần sửa 1 / …)"], init=["未選択", "Chưa chọn"],
      ex=["改訂第三回目", "Plan có dòng thế hệ này trong bảng 価格プラン (course nào cũng được)"],
      detail=["選択肢はプランの価格プランにある世代名から作る（削除済みのプランは除く）。その世代名の行を持つプラン（コースは問わない）。hong 2026/10/05 B。", "Lựa chọn lấy từ tên thế hệ trong 価格プラン của các plan (trừ đã xóa). Lọc plan có dòng thế hệ đó. hong 2026/10/05 B."]),
    F("2.8", "利用状況", "Tình trạng sử dụng", 'select[aria-label="利用状況"]', "select", "select", req="－",
      len=["選択（利用中／未使用）", "Chọn (đang dùng / chưa dùng)"], init=["未選択", "Chưa chọn"],
      ex=["利用中", "利用中 = có ≥1 hợp đồng cha dùng plan; 未使用 = 0"],
      detail=["利用中＝このプランを使う親契約が1つ以上あるプラン。未使用＝0件（削除できるプラン）。hong 2026/10/05 C。", "利用中 = có hợp đồng cha dùng plan; 未使用 = 0 (plan xóa được). hong 2026/10/05 C."]),
    F("2.9", "標準貸出設備の機種", "Thiết bị cho mượn tiêu chuẩn", 'select[aria-label="標準貸出設備の機種"]', "select", "select", req="－",
      len=["選択（プランの標準貸出設備に載っている機種。機種ID＋機種名）", "Chọn (thiết bị có trong bảng thiết bị tiêu chuẩn của plan; ID + tên)"], init=["未選択", "Chưa chọn"],
      ex=["RF000001 冷蔵ショーケース 48L", "Plan có thiết bị này trong 標準貸出設備 (course nào cũng được)"],
      detail=["選択肢はプランの標準貸出設備（全コース）に載っている機種から作る。その機種を載せているプラン。hong 2026/10/05 D。", "Lựa chọn lấy từ thiết bị trong 標準貸出設備 (mọi course) của các plan. Lọc plan có thiết bị đó. hong 2026/10/05 D."]),
    F("2.10", "更新日", "Ngày cập nhật", '.es-range[aria-label="更新日"]', "date", "input", req="－",
      len=["日付（yyyy-mm-dd）から〜まで", "Ngày (yyyy-mm-dd) từ〜đến"], init=["空（無制限）", "Trống (không giới hạn)"],
      ex=["2026-10-01〜2026-10-05", "Lọc plan được lưu lần cuối trong khoảng ngày"],
      valid=["日付の選択。から・までのどちらか一方だけでもよい。", "Chọn ngày. Chỉ nhập 1 đầu cũng được."],
      detail=["このプランを最後に画面で保存した日（登録・編集・CSV取込）。見本データは保存していないので更新日がなく、条件を入れると出ない。hong 2026/10/05 E。", "Ngày lưu lần cuối (đăng ký / sửa / nhập CSV). Dữ liệu mẫu chưa lưu nên không có ngày; đặt điều kiện thì không ra. hong 2026/10/05 E."]),
    F("2.11", "削除済みを表示しない", "Không hiện đã xóa", ".delchk", "check", "check", req="－",
      len=["チェック", "Checkbox"], init=["ON", "Bật"], ex=["ON", "Mặc định bật: ẩn plan 削除済"],
      detail=["ON＝削除済のプランを出さない（既定）。OFF にして検索すると削除済も出る（行はグレー・バッジ「削除済」・操作なし）。STEP7 L3。", "Bật = ẩn plan đã xóa (mặc định). Tắt rồi tìm thì hiện cả đã xóa (dòng xám, badge 削除済, không có thao tác). STEP7 L3."]),
    F("2.12", "クリア", "Xóa điều kiện", "button::クリア", "button", "click", detail=["条件をすべて初期値に戻し、1ページ目から表示し直す。", "Đưa điều kiện về mặc định, hiện lại từ trang 1."]),
    F("2.13", "検索", "Tìm kiếm", ".es-search__actions button[type=submit]", "button", "click",
      detail=["条件を反映して1ページ目から表示。Enter でも同じ。", "Áp dụng điều kiện, hiện từ trang 1. Enter cũng vậy."]),
]
LIST_TABLE = [
    F("3", "一覧", "Danh sách", ".es-table-wrap", "table", pattern="P-LIST",
      detail=["初期の並び：月次提供上限数 昇順 → プランID 昇順（hong 2026/10/05）。削除済の行はグレー（.is-deleted）で操作を出さない。",
              "Thứ tự mặc định: 月次提供上限数 tăng dần → プランID tăng dần (hong 2026/10/05). Dòng đã xóa màu xám, không có thao tác."]),
    F("3.1", "プランID", "Mã plan", "th::プランID", "link", "click", len="文字列 ES＋6桁",
      detail=["ES＋6桁（例 ES000004・28-177）。クリックで AW_PLAN_002（詳細）へ。", "ES + 6 chữ số (vd ES000004, 28-177). Nhấn sang AW_PLAN_002."]),
    F("3.2", "管理用プラン名", "Tên plan (nội bộ)", "th::管理用プラン名", "label", len="文字列 60"),
    F("3.3", "公開用プラン名", "Tên plan (công khai)", "th::公開用プラン名", "label", len="文字列 60"),
    F("3.4", "月次提供上限数", "Giới hạn suất/tháng", "th::月次提供上限数", "label", len=["整数（食）", "Số nguyên (suất)"]),
    F("3.5", "コース", "Course", "th::コース", "label",
      detail=["選べるコースを「・」でつなぐ（例 スタンダード・ライト（冷蔵庫）・ライト（自販機））。", "Các course chọn được, nối bằng 「・」."]),
    F("3.6", "スタンダード COOL便", "Standard COOL便", "th::スタンダード COOL便", "label", len=["金額（税抜）・右寄せ", "Số tiền (chưa thuế), căn phải"],
      detail=["ESスタンダードの公開用の価格プランの COOL便 の月額（税抜）。コースにないときは「—」。", "Giá tháng COOL便 của 価格プラン 公開用 (ESスタンダード). Không có course thì 「—」."]),
    F("3.7", "スタンダード ES配送便", "Standard ES配送便", "th::スタンダード ES配送便", "label", len=["金額（税抜）・右寄せ", "Số tiền (chưa thuế), căn phải"]),
    F("3.8", "ライト COOL便", "Light COOL便", "th::ライト COOL便", "label", len=["金額（税抜）・右寄せ", "Số tiền (chưa thuế), căn phải"],
      detail=["ESライト（冷蔵庫）。コースにないときは「—」。", "ESライト（冷蔵庫）. Không có course thì 「—」."]),
    F("3.9", "ライト ES配送便", "Light ES配送便", "th::ライト ES配送便", "label", len=["金額（税抜）・右寄せ", "Số tiền (chưa thuế), căn phải"]),
    F("3.10", "ライト（自販機） ES配送便", "Light (VM) ES配送便", "th::ライト（自販機） ES配送便", "label", len=["金額（税抜）・右寄せ", "Số tiền (chưa thuế), căn phải"],
      detail=["自販機は ES配送便だけ（28-184・28-19）。", "自販機 chỉ có ES配送便 (28-184, 28-19)."]),
    F("3.11", "公開ステータス", "Trạng thái công khai", "th::公開ステータス", "label",
      detail=["バッジ：公開＝緑、非公開＝灰、削除済＝灰（行もグレー）。", "Badge: 公開 xanh, 非公開 xám, 削除済 xám (dòng xám)."]),
    F("3.12", "操作", "Thao tác", "th::操作", "label", detail=["編集（鉛筆）・削除（ゴミ箱）。削除済の行には出さない。", "Sửa (bút chì), xóa (thùng rác). Không hiện ở dòng đã xóa."]),
    F("3.13", "編集", "Sửa", 'button[aria-label$="を編集"]', "button", "click", cond=FULL,
      detail=["AW_PLAN_003（編集）へ。キャンセルで一覧に戻る（?from=list）。", "Sang AW_PLAN_003 (sửa). キャンセル thì về danh sách."]),
    F("3.14", "削除", "Xóa", 'button[aria-label$="を削除"]', "button", "click", cond=FULL, pattern="P-DEL",
      detail=["使用中の契約がなければ状態 004（削除の確認）、あれば 005（削除できません）。", "Chưa có hợp đồng dùng → trạng thái 004 (xác nhận xóa); đang dùng → 005 (không xóa được)."], err=["Q01", "E37", "S02", "E33"]),
    F("3.15", "並べ替え", "Sắp xếp", ".es-table thead", "select", "select", req="－",
      len=["選択（プランID／管理用プラン名／月次提供上限数／公開ステータス）＋ 昇順／降順", "Chọn cột (mã plan / tên nội bộ / giới hạn suất / trạng thái) + tăng/giảm"],
      init=["月次提供上限数 昇順 → プランID 昇順", "月次提供上限数 tăng dần → プランID tăng dần"], ex=["プランID 昇順", "Chọn cột và chiều sắp xếp (STEP7 L2)"],
      detail=["STEP7 L2・L-2。並べる項目と昇順／降順を選べる。", "STEP7 L2, L-2. Chọn cột và chiều."], demo_ok=H_SORT),
]
LIST_PAGER = [
    F("4", "ページ送り", "Phân trang", ".es-pagination", "area", pattern="P-LIST"),
    F("4.1", "件数", "Số dòng", ".es-pagination__meta", "label", detail=["「n件中 a–b件」。0件は「0件」。", "「n件中 a–b件」. 0 dòng thì 「0件」."]),
    F("4.2", "前のページ", "Trang trước", 'button[aria-label="前のページ"]', "button", "click", cond=["1ページ目では非活性", "Trang 1 thì vô hiệu"]),
    F("4.3", "ページ番号", "Số trang", ".es-page.is-current", "button", "click", detail=["今のページは塗りつぶし。", "Trang hiện tại tô đậm."]),
    F("4.4", "次のページ", "Trang sau", 'button[aria-label="次のページ"]', "button", "click", cond=["最後のページでは非活性", "Trang cuối thì vô hiệu"]),
    F("4.5", "表示件数", "Số dòng/trang", 'select[aria-label="表示件数"]', "select", "select", req="－",
      len=["選択（10／20／50 件／ページ）", "Chọn (10 / 20 / 50 dòng/trang)"], init=["10件／ページ", "10 dòng/trang"], ex=["20件／ページ", "Đổi số dòng mỗi trang (STEP7 L-1)"],
      detail=["変えると1ページ目に戻る。STEP7 L-1。", "Đổi thì về trang 1. STEP7 L-1."]),
]

V_LIST = [
    {"id": "001", "code": "AW_PLAN_001", "state": ["初期表示", "Hiển thị ban đầu"], "url": "/ops/masters/plans",
     "setup": CLEAR, "full": True, "wait": 500,
     "note": ["フル権限（Ad00010）で表示。ほかの役割では 1.3・1.5・3.13・3.14 が出ない。", "Hiển thị với フル権限 (Ad00010). Vai trò khác không có 1.3, 1.5, 3.13, 3.14."],
     "items": LIST_HEADER + LIST_SEARCH + LIST_TABLE + LIST_PAGER},
    {"id": "003", "code": "AW_PLAN_001", "state": ["該当なし（0件）", "Không có kết quả (0 dòng)"], "url": "/ops/masters/plans",
     "setup": CLEAR + "setv(q('.es-search__fields input'),'zzz');q('.es-search__actions button[type=submit]').click();await sleep(500);", "full": False, "wait": 400,
     "items": [
         F("6", "0件のメッセージ", "Thông báo 0 dòng", ".es-table tbody td[colspan]", "label", "show", err=["I01"],
           detail=["一覧の中に I01 を1行で出す。ページ送りは「0件」。", "Hiện I01 trong bảng. Phân trang 「0件」."], demo_ok=H_EMPTY),
     ]},
    {"id": "004", "code": "AW_PLAN_001", "state": ["削除の確認", "Xác nhận xóa"], "url": "/ops/masters/plans",
     "setup": CLEAR + "q('button[aria-label=\"30プランを削除\"]').click();await sleep(400);", "full": False, "wait": 400,
     "note": ["使用中の契約が 0 件のプラン（見本 ES000002 30プラン）のゴミ箱を押したとき。", "Khi nhấn thùng rác của plan chưa có hợp đồng (mẫu ES000002 30プラン)."],
     "items": [
         F("7", "削除の確認モーダル", "Modal xác nhận xóa", '.es-modal[aria-label="削除しますか？"]', "modal", "show", pattern="P-DEL", err=["Q01"],
           detail=["Q01（ボタン名＝削除）。本文にプランID・管理用プラン名。", "Q01 (ボタン名 = 削除). Nội dung có プランID, 管理用プラン名."], demo_ok=H_DELMSG),
         F("7.1", "タイトル", "Tiêu đề", ".es-modal__title", "label", detail=["「削除しますか？」", "Tiêu đề 「削除しますか？」"]),
         F("7.2", "本文", "Nội dung", ".es-modal__body", "label",
           detail=["「本当に削除してもよろしいですか？ 削除すると元に戻せません。」＋ 対象（ES000002 30プラン）。論理削除で、一覧は既定で隠れる。", "Q01 + đối tượng (ES000002 30プラン). Xóa logic, danh sách mặc định ẩn."]),
         F("7.3", "キャンセル", "Hủy", ".es-modal__actions button::キャンセル", "button", "click", detail=["閉じる。何もしない。", "Đóng, không làm gì."]),
         F("7.4", "削除", "Xóa", ".es-modal__actions button::削除", "button", "click", err=["S02", "E33"],
           detail=["公開ステータスを「削除済」にし（論理削除）、S02 のトースト。一覧から消える（削除済みを表示しない＝ON）。", "Đổi trạng thái thành 削除済 (xóa logic), toast S02. Biến mất khỏi danh sách (khi 2.5 bật)."]),
     ]},
    {"id": "005", "code": "AW_PLAN_001", "state": ["削除できません", "Không xóa được"], "url": "/ops/masters/plans",
     "setup": CLEAR + "q('button[aria-label=\"50プランを削除\"]').click();await sleep(400);", "full": False, "wait": 400,
     "note": ["使用中の契約があるプラン（見本 ES000003 50プラン・9件）のゴミ箱を押したとき。RV-OPS-20261002 O-b。", "Khi nhấn thùng rác của plan đang có hợp đồng (mẫu ES000003 50プラン, 9 hợp đồng). RV-OPS-20261002 O-b."],
     "items": [
         F("8", "削除できませんモーダル", "Modal không xóa được", '.es-modal[aria-label="削除できません"]', "modal", "show", err=["E37"],
           detail=["使用中の件数＝そのプランの親契約の数（終了を除く）。", "Số đang dùng = số hợp đồng cha của plan (trừ 終了)."]),
         F("8.1", "本文", "Nội dung", ".es-modal__body", "label", detail=["E37 ＋ 対象（ES000003 50プラン）。", "E37 + đối tượng (ES000003 50プラン)."]),
         F("8.2", "閉じる", "Đóng", ".es-modal__actions button::閉じる", "button", "click"),
     ]},
    {"id": "006", "code": "AW_PLAN_001", "state": ["削除済みも表示", "Hiện cả đã xóa"], "url": "/ops/masters/plans",
     "setup": CLEAR + "q('.delchk input').click();await sleep(200);q('.es-search__actions button[type=submit]').click();await sleep(500);", "full": True, "wait": 400,
     "note": ["「削除済みを表示しない」を外して検索した状態。見本 ES000020 20プラン（旧）が削除済の行（グレー・操作なし）。", "Bỏ check 「削除済みを表示しない」 rồi tìm. Mẫu ES000020 20プラン（旧） là dòng đã xóa (xám, không thao tác)."],
     "items": [
         F("9", "削除済の行", "Dòng đã xóa", ".es-table tbody tr.is-deleted", "label", "show",
           detail=["行をグレー、公開ステータスのバッジ「削除済」（灰）、操作（編集・削除）は出さない。復元はしない（STEP7 L-4）。", "Dòng xám, badge 削除済 (xám), không có thao tác. Không khôi phục (STEP7 L-4)."]),
     ]},

]

# ================================================================ AW_PLAN_002 詳細
D_HEADER = [
    F("1", "ヘッダー", "Đầu trang", ".phead", "area"),
    F("1.1", "パンくず", "Breadcrumb", ".crumb", "label", detail=["「マスタ管理 / プランマスタ一覧 / プランマスタ詳細」。プランマスタ一覧はリンク。", "「マスタ管理 / プランマスタ一覧 / プランマスタ詳細」. プランマスタ一覧 là link."]),
    F("1.2", "画面名", "Tên màn hình", ".phead h2", "label", detail=["「プランマスタ詳細」＋ プランID。削除済のプランはサマリーに「状態：削除済」。", "「プランマスタ詳細」 + プランID. Plan đã xóa có 「状態：削除済」 ở summary."]),
    F("1.3", "削除", "Xóa", ".pbtn button.del", "button", "click", cond=FULL, pattern="P-DEL", err=["Q01", "E37", "S02"],
      detail=["一覧の削除と同じ（Q01 → S02 → 一覧へ。使用中なら E37）。削除済のプランでは出さない。", "Giống xóa ở danh sách (Q01 → S02 → về danh sách; đang dùng thì E37). Plan đã xóa không hiện."]),
    F("1.4", "編集", "Sửa", ".pbtn button.save", "button", "click", cond=FULL, detail=["AW_PLAN_003（編集）へ。削除済のプランでは出さない。", "Sang AW_PLAN_003 (sửa). Plan đã xóa không hiện."]),
]
D_SUM = [
    F("2", "サマリー", "Tóm tắt", ".sumbar", "area", detail=["保存済みの値から作る（編集中の値では変わらない）。", "Tạo từ giá trị đã lưu."]),
    F("2.1", "プランID", "Mã plan", ".sumbar .s::プランID", "label"),
    F("2.2", "プラン名", "Tên plan", ".sumbar .s::プラン名", "label", detail=["公開用プラン名。", "公開用プラン名."]),
    F("2.3", "コース", "Course", ".sumbar .s::コース", "label", detail=["選べるコース（短い名前）を「・」でつなぐ。", "Các course chọn được, nối 「・」."]),
    F("2.4", "月次提供上限", "Giới hạn suất/tháng", ".sumbar .s::月次提供上限", "label", len=["整数＋「食」", "Số nguyên + đơn vị suất"]),
    F("2.5", "公開中の価格プラン", "Thế hệ giá đang áp dụng", ".sumbar .s::公開中の価格プラン", "label",
      detail=["ESスタンダードの公開用の価格プランの名前と開始期間（例 改訂第三回目（2026/04/01〜））。", "Tên và ngày bắt đầu của 価格プラン 公開用 của ESスタンダード."]),
    F("2.6", "スタンダード COOL便", "Standard COOL便", ".sumbar .s::スタンダード COOL便", "label", len=["金額（税抜）", "Số tiền (chưa thuế)"]),
    F("2.7", "ライト COOL便", "Light COOL便", ".sumbar .s::ライト COOL便", "label", len=["金額（税抜）", "Số tiền (chưa thuế)"]),
    F("2.8", "ライト（自販機） ES配送便", "Light (VM) ES配送便", ".sumbar .s::ライト（自販機） ES配送便", "label", len=["金額（税抜）", "Số tiền (chưa thuế)"]),
    F("2.9", "公開ステータス", "Trạng thái công khai", ".sumbar .s::公開ステータス", "label"),
]
def D_PRICE(no, title, vi, cool=True, diff=False, vm=False):
    """詳細：コースごとの価格プランの表（表示だけ。hong 2026/10/05：現行画面どおりタブの中に置く）"""
    its = [F(no, title, vi, "#sec-1", "area",
             detail=["コースごとの価格の世代（1行＝1世代）。料金はこの表だけで持つ。公開用（1行）＝法人Webに出す価格・新しく作る子契約に使う世代（28-180）。足しただけでは作った子契約は変わらない。未確定の子契約に当てるのは契約の側（子契約一覧の一括変更。hong 2026/10/05 B 案）。確定・請求済は請求調整。項目の決まりは AW_PLAN_003 の価格プランを参照。",
                     "Thế hệ giá của course (1 dòng = 1 thế hệ). Giá chỉ giữ ở đây. 公開用 (1 dòng) = giá hiện trên 法人Web và dùng cho hợp đồng con mới (28-180). Thêm dòng không đổi hợp đồng đã tạo; áp dụng cho hợp đồng con là việc của bên 契約 (一括変更 ở 子契約一覧, hong 2026/10/05 B). Quy tắc mục xem 価格プラン ở AW_PLAN_003."])]
    its.append(F(f"{no}.1", "公開用", "Công khai", "#sec-1 th::公開用", "label", detail=["選択中の世代（1行）。", "Thế hệ đang chọn (1 dòng)."]))
    its.append(F(f"{no}.2", "価格プラン", "Tên thế hệ giá", "#sec-1 th::価格プラン", "label", detail=["元の料金／改訂第一回目…。", "元の料金 / 改訂第一回目…"]))
    its.append(F(f"{no}.3", "開始期間", "Ngày bắt đầu", "#sec-1 th::開始期間", "label", len=["日付 yyyy-mm-dd", "yyyy-mm-dd"],
                 detail=["参考の項目（この世代をいつから使い始めたかの記録）。契約がどの世代を使うかは子契約の「適用された価格プラン」で決まる（28-181・hong 2026/10/05）。", "Mục tham khảo (ghi thế hệ này dùng từ khi nào). Hợp đồng dùng thế hệ nào là do 「適用された価格プラン」 của 子契約 (28-181, hong 2026/10/05)."]))
    its.append(F(f"{no}.4", "終了期間", "Ngày kết thúc", "#sec-1 th::終了期間", "label", detail=["参考の項目。空欄＝終わっていない。", "Mục tham khảo. Trống = chưa kết thúc."]))
    k = 5
    if cool:
        its.append(F(f"{no}.{k}", "価格（COOL便）", "Giá (COOL便)", "#sec-1 th::価格（COOL便）", "label", len=["金額（税抜）", "Số tiền (chưa thuế)"])); k += 1
    its.append(F(f"{no}.{k}", "価格（ES配送便）", "Giá (ES配送便)", "#sec-1 th::価格（ES配送便）", "label", len=["金額（税抜）", "Số tiền (chưa thuế)"])); k += 1
    its.append(F(f"{no}.{k}", "内訳（基本料金／企業負担分）", "Cơ cấu (基本料金 / 企業負担分)", "#sec-1 th::内訳 ES配送便（基本 10%／企業負担 8%）", "label",
                 detail=["自動計算（28-148）。配送方法ごとに出す。", "Tự tính (28-148), theo từng phương thức giao."])); k += 1
    if diff:
        its.append(F(f"{no}.{k}", "スタンダードアップ差額", "Chênh lệch nâng cấp", "#sec-1 th::スタンダードアップ差額", "label", detail=["同じ世代の スタンダード − ライト（DC000021・28-170）。", "スタンダード − ライト cùng thế hệ (DC000021, 28-170)."])); k += 1
    its.append(F(f"{no}.{k}", "使っている子契約", "Hợp đồng con đang dùng", "#sec-1 th::操作", "label", len=["整数（件）", "Số nguyên"],
                 detail=["その世代を使っている子契約の数。0件の世代だけ直す・消せる。", "Số hợp đồng con dùng thế hệ này. Chỉ thế hệ 0 件 mới sửa/xóa được."],
                 demo_ok=["コードはこの列を価格世代カード（画面の下）に出している（受付簿 #63）。仕様が正", "Code hiện cột này ở card 価格世代 cuối trang (受付簿 #63). Spec đúng"])); k += 1
    its.append(F(f"{no}.{k}", "操作", "Thao tác", "#sec-1 th::操作", "label", err=["Q01", "S02", "S05", "I03"],
                 detail=["詳細では表示だけ。編集（AW_PLAN_003）で、使っていない世代は直す・削除（Q01）、使っている世代は「誤りの訂正」（理由が必須・未確定の子契約の ① 費目を作り直す・S05）、期間が終わった世代は I03。",
                         "Màn chi tiết chỉ xem. Ở màn sửa (AW_PLAN_003): thế hệ chưa dùng thì sửa/xóa (Q01); đang dùng thì 誤りの訂正 (bắt buộc lý do, tạo lại ① của hợp đồng con chưa chốt, S05); đã hết hạn thì I03."],
                 demo_ok=["直す・削除・誤りの訂正はコードでは価格世代カードにある（受付簿 #63）。仕様が正", "Các thao tác này code đang để ở card 価格世代 (受付簿 #63). Spec đúng"]))
    return its
def D_MAT(n, course, course_vi):
    """詳細：初期備品・プランに含む資材（コースごとのタブの中・標準貸出設備の下。hong 2026/10/05 Q2＝A → 置き場所はタブの中）
    保存ボタン・変更履歴の表はカードに置かない（hong 2026/10/05 コメント・受付簿 #69）"""
    c = ".pane > .card:last-of-type"
    return [
        F(f"{n}", f"初期備品・プランに含む資材（{course}）", f"Vật tư ban đầu / vật tư trong plan ({course_vi})", c, "area",
          detail=["このコースの初期備品（仮登録のときに作る資材の初期セット・無料）と、プラン共通の月の無料数量。月の無料数量＝同じサイクル月の資材の注文でこの数を超えた分だけ、資材マスタの単価 × 超えた数を請求（単価 0円は請求しない）。空欄＝プランの食数。0 も入れられる（無料なし）。各コースに初期備品が1つ以上必要。資材の単価・税率は資材マスタ。詳細では表示だけ（入力は AW_PLAN_003・画面の 登録／保存 で一緒に保存）。変更はタブ「変更履歴」に残す。",
                  "初期備品 của course này (bộ vật tư ban đầu khi đăng ký tạm, miễn phí) và 月の無料数量 chung cho plan. Vượt số này trong cùng tháng chu kỳ thì tính đơn giá × số vượt (đơn giá 0 thì không tính). Trống = số suất của plan. Có thể nhập 0. Mỗi course cần ≥1 vật tư ban đầu. Ở chi tiết chỉ xem (nhập ở AW_PLAN_003, lưu chung bằng 登録／保存). Thay đổi ghi vào tab 変更履歴."],
          demo_ok=["コードは変更履歴（資材）の表をカードに置いたまま（受付簿 #69）。詳細を表示だけにする分は済み（hong 2026/10/05）。仕様が正", "Code vẫn còn bảng lịch sử riêng trong card (受付簿 #69); phần chi tiết chỉ xem đã sửa (hong 2026/10/05). Spec đúng"]),
        F(f"{n}.1", "説明", "Giải thích", c + " .es-field__msg", "label"),
        F(f"{n}.2", "資材", "Vật tư", "th::資材", "label", detail=["資材ID＋資材名（資材マスタの削除済を除く全部）。", "Mã + tên vật tư (toàn bộ 資材マスタ trừ đã xóa)."]),
        F(f"{n}.3", "単価（税抜）", "Đơn giá (chưa thuế)", "th::単価（税抜）", "label", len=["金額（税抜）", "Số tiền"], detail=["資材マスタの値（表示だけ）。", "Giá trị từ 資材マスタ (chỉ xem)."]),
        F(f"{n}.4", f"初期備品：{course}", f"Vật tư ban đầu: {course_vi}", "th::初期備品", "label", len=["整数 0〜999,999（個）", "Số nguyên 0–999.999 (cái)"],
          detail=["このタブのコースの列だけ。項目の決まりは AW_PLAN_003 を参照。", "Chỉ cột của course của tab này. Quy tắc xem AW_PLAN_003."]),
        F(f"{n}.5", "月の無料数量", "Số lượng miễn phí/tháng", "th::月の無料数量", "label", len=["整数 0〜999,999（個）", "Số nguyên 0–999.999 (cái)"],
          detail=["プラン共通（どのタブでも同じ）。見出しに「空欄＝プランの食数 n」。", "Chung cho plan (giống nhau ở mọi tab). Tiêu đề ghi 「空欄＝プランの食数 n」."]),
    ]
# プラン設定・料金の内訳（詳細では表示だけ。項目の決まりは AW_PLAN_003 を参照）
D_PLAN = [
    F("3", "プラン設定", "Thiết lập plan", "#sec-1000", "area", detail=["項目の決まりは AW_PLAN_003 の 2 を参照（ここは表示だけ）。見出しで開閉できる。", "Quy tắc mục xem AW_PLAN_003 mục 2 (ở đây chỉ xem). Nhấn tiêu đề để đóng/mở."]),
    F("3.1", "プランID", "Mã plan", '.f[data-name="プランID"]', "label"),
    F("3.2", "公開用プラン名", "Tên plan (công khai)", '.f[data-name="公開用プラン名"]', "label"),
    F("3.3", "管理用プラン名", "Tên plan (nội bộ)", '.f[data-name="管理用プラン名"]', "label"),
    F("3.4", "公開ステータス", "Trạng thái công khai", '.f[data-name="公開ステータス"]', "label"),
    F("3.5", "月次提供上限の合計", "Tổng giới hạn suất/tháng", '.f[data-name="月次提供上限の合計"]', "label"),
    F("3.6", "基本比×倍", "Hệ số so với cơ bản", '.f[data-name="基本比×倍"]', "label"),
    F("3.7", "コース", "Course", '.f[data-name="コース"]', "label"),
    F("3.8", "利用人数目安（表示用）", "Số người dùng ước tính", '.f[data-name="利用人数目安（表示用）"]', "label"),
    F("4", "料金の内訳・免責（プラン共通）", "Cơ cấu phí・miễn trừ (chung)", "#sec-1001", "area", detail=["AW_PLAN_003 の 3 を参照。", "Xem AW_PLAN_003 mục 3."]),
    F("4.1", "企業負担額（税込・1食）", "Công ty chịu (có thuế, 1 suất)", '.f[data-name="企業負担額（税込・1食）"]', "label"),
    F("4.2", "企業負担分の税率", "Thuế suất phần công ty chịu", '.f[data-name="企業負担分の税率"]', "label"),
    F("4.3", "基本料金の税率", "Thuế suất phí cơ bản", '.f[data-name="基本料金の税率"]', "label"),
    F("4.4", "企業負担分（税抜・自動計算）", "Phần công ty chịu (chưa thuế, tự tính)", '.f[data-name="企業負担分（税抜・自動計算）"]', "label"),
    F("4.5", "免責金額", "Số tiền miễn trừ", '.f[data-name="免責金額"]', "label"),
]
D_TABS = [
    F("5", "タブ", "Tab", ".tabs", "area", detail=["コースごとの設定と変更履歴。選べるコースにないコースのタブは非活性（28-184）。", "Thiết lập theo course và lịch sử. Tab của course không chọn được thì vô hiệu (28-184)."],
      demo_ok=["コースにないタブも活性のまま（デモの制約 A15 と同じ）。仕様が正", "Tab của course không có vẫn bật (giống hạn chế demo A15). Spec đúng"]),
    F("5.1", "ESスタンダード", "Tab ES Standard", ".tabs [role=tab]::ESスタンダード", "tab", "click"),
    F("5.2", "ESライト（冷蔵庫）", "Tab ES Light (tủ lạnh)", ".tabs [role=tab]::ESライト（冷蔵庫）", "tab", "click"),
    F("5.3", "ESライト（自販機）", "Tab ES Light (máy bán hàng)", ".tabs [role=tab]::ESライト（自販機）", "tab", "click"),
    F("5.4", "変更履歴", "Lịch sử thay đổi", ".tabs [role=tab]::変更履歴", "tab", "click"),
    F("5.5", "目次", "Mục lục", ".idx", "label", detail=["タブの中のカードへ飛ぶ（カードが2つ以上のとき）。数字は項目数。", "Nhảy đến card trong tab (khi ≥2 card). Số = số mục."]),
]
def D_COURSE_STD(n):
    return [
        F(f"{n}", "ESスタンダードプラン（冷凍・冷蔵・常温）設定", "Thiết lập ESスタンダード", "#sec-0", "area", detail=["AW_PLAN_003 の 5 を参照（表示だけ）。", "Xem AW_PLAN_003 mục 5 (chỉ xem)."]),
        F(f"{n}.1", "冷凍_月次提供数_上限", "冷凍 giới hạn trên/tháng", '.f[data-name="冷凍_月次提供数_上限"]', "label"),
        F(f"{n}.2", "冷凍_月次提供数_下限", "冷凍 giới hạn dưới/tháng", '.f[data-name="冷凍_月次提供数_下限"]', "label"),
        F(f"{n}.3", "冷蔵・常温_月次提供数_上限", "冷蔵・常温 giới hạn trên", '.f[data-name="冷蔵・常温_月次提供数_上限"]', "label"),
        F(f"{n}.4", "冷蔵・常温_月次提供数_下限", "冷蔵・常温 giới hạn dưới", '.f[data-name="冷蔵・常温_月次提供数_下限"]', "label"),
        F(f"{n}.5", "冷蔵・常温_標準の配送回数", "冷蔵・常温 số lần giao chuẩn", '.f[data-name="冷蔵・常温_標準の配送回数"]', "label"),
        F(f"{n}.6", "冷凍_標準の配送回数", "冷凍 số lần giao chuẩn", '.f[data-name="冷凍_標準の配送回数"]', "label"),
        F(f"{n}.7", "1回の納品数（冷蔵・常温）", "Số suất/lần giao (冷蔵・常温)", '.f[data-name="1回の納品数（冷蔵・常温）"]', "label"),
        F(f"{n}.8", "1回の納品数（冷凍）", "Số suất/lần giao (冷凍)", '.f[data-name="1回の納品数（冷凍）"]', "label"),
        F(f"{n}.9", "残りわずか率（%）", "Tỷ lệ sắp hết (%)", '.f[data-name="残りわずか率（%）"]', "label"),
        F(f"{n}.10", "備考", "Ghi chú", '.f[data-name="備考"]', "label"),
    ]
def D_EQUIP(n, title, vi, same=False, csv=False):   # csv は使わない（CSV取込は一覧の1つだけ・hong 2026/10/05・受付簿 #68）
    its = [F(f"{n}", title, vi, "#sec-2", "area", detail=["AW_PLAN_003 の標準貸出設備を参照（表示だけ）。", "Xem 標準貸出設備 ở AW_PLAN_003 (chỉ xem)."])]
    k = 1
    if same:
        its.append(F(f"{n}.{k}", "スタンダードと同じ構成にする", "Giống cấu hình Standard", '.f[data-name="スタンダードと同じ構成にする"]', "label")); k += 1
    its.append(F(f"{n}.{k}", "相談して決める", "Quyết định qua tư vấn", '.f[data-name="相談して決める"]', "label")); k += 1
    its.append(F(f"{n}.{k}", "標準貸出設備の表", "Bảng thiết bị cho mượn chuẩn", "#sec-2 table", "table",
                 detail=["パターン／機種区分／機種／台数／備考。載っている機種・台数が「プランに含まれる設備」（無料・28-182）。", "パターン / 機種区分 / 機種 / 台数 / 備考. Thiết bị ghi ở đây = thiết bị trong plan (miễn phí, 28-182)."]))
    return its

V_DETAIL = [
    {"id": "008", "code": "AW_PLAN_002", "state": ["初期表示（タブ ESスタンダード）", "Hiển thị ban đầu (tab ESスタンダード)"], "url": "/ops/masters/plans/ES000004",
     "setup": "", "full": True, "wait": 600,
     "note": ["見本 ES000004 100プラン。上から ヘッダー・サマリー・プラン設定・料金の内訳・タブ。タブの中は コースの設定 → 価格プラン → 標準貸出設備 → 初期備品・プランに含む資材（hong 2026/10/05：現行画面どおり・初期備品もタブの中）。画面の下に「価格世代（共通データ）」カードは置かない（hong 2026/10/05・受付簿 #71。価格プランの表に統合＝#63）。",
              "Mẫu ES000004 100プラン. Từ trên xuống: header, summary, プラン設定, 料金の内訳, tab. Trong tab: thiết lập course → 価格プラン → 標準貸出設備 → 初期備品 (hong 2026/10/05: như màn hiện hành, 初期備品 cũng trong tab). Không có card 「価格世代（共通データ）」 cuối trang (hong 2026/10/05, 受付簿 #71; gộp vào bảng 価格プラン = #63)."],
     "items": D_HEADER + D_SUM + D_PLAN + D_TABS + D_COURSE_STD(6) + D_PRICE("7", "ESスタンダード 価格プラン", "ESスタンダード bảng giá") + D_EQUIP(8, "ESスタンダード 標準貸出設備", "ESスタンダード thiết bị chuẩn") + D_MAT(9, "ESスタンダード", "ES Standard")},
    {"id": "009", "code": "AW_PLAN_002", "state": ["タブ ESライト（冷蔵庫）", "Tab ESライト（冷蔵庫）"], "url": "/ops/masters/plans/ES000004",
     "setup": TAB("ESライト（冷蔵庫）") + "window.scrollTo(0,q('#sec-0').offsetTop-80);", "full": True, "wait": 400,
     "items": [
         F("10", "ESライトプラン（冷蔵・常温）設定", "Thiết lập ESライト", "#sec-0", "area", detail=["AW_PLAN_003 の 9 を参照（表示だけ）。冷凍の欄はない。", "Xem AW_PLAN_003 mục 9. Không có 冷凍."]),
         F("10.1", "冷蔵・常温_月次提供数_上限", "冷蔵・常温 giới hạn trên", '.f[data-name="冷蔵・常温_月次提供数_上限"]', "label"),
         F("10.2", "冷蔵・常温_月次提供数_下限", "冷蔵・常温 giới hạn dưới", '.f[data-name="冷蔵・常温_月次提供数_下限"]', "label"),
         F("10.3", "冷蔵・常温_標準の配送回数", "Số lần giao chuẩn", '.f[data-name="冷蔵・常温_標準の配送回数"]', "label"),
         F("10.4", "1回の納品数（冷蔵・常温）", "Số suất/lần giao", '.f[data-name="1回の納品数（冷蔵・常温）"]', "label"),
         F("10.5", "残りわずか率（%）", "Tỷ lệ sắp hết (%)", '.f[data-name="残りわずか率（%）"]', "label"),
         F("10.6", "備考", "Ghi chú", '.f[data-name="備考"]', "label"),
     ] + D_PRICE("11", "ESライト 価格プラン", "ESライト bảng giá", diff=True) + D_EQUIP(12, "ESライト 標準貸出設備", "ESライト thiết bị chuẩn", same=True) + D_MAT(13, "ESライト（冷蔵庫）", "ES Light tủ lạnh")},
    {"id": "010", "code": "AW_PLAN_002", "state": ["タブ ESライト（自販機）", "Tab ESライト（自販機）"], "url": "/ops/masters/plans/ES000004",
     "setup": TAB("ESライト（自販機）") + "window.scrollTo(0,q('#sec-0').offsetTop-80);", "full": True, "wait": 400,
     "items": [
         F("14", "ESライト（自販機）プラン設定", "Thiết lập ESライト（自販機）", "#sec-0", "area", detail=["AW_PLAN_003 の 13 を参照（表示だけ）。", "Xem AW_PLAN_003 mục 13."]),
         F("14.1", "冷蔵・常温_月次提供数_上限", "冷蔵・常温 giới hạn trên", '.f[data-name="冷蔵・常温_月次提供数_上限"]', "label"),
         F("14.2", "冷蔵・常温_月次提供数_下限", "冷蔵・常温 giới hạn dưới", '.f[data-name="冷蔵・常温_月次提供数_下限"]', "label"),
         F("14.3", "冷蔵・常温_標準の配送回数", "Số lần giao chuẩn", '.f[data-name="冷蔵・常温_標準の配送回数"]', "label"),
         F("14.4", "1回の納品数（冷蔵・常温）", "Số suất/lần giao", '.f[data-name="1回の納品数（冷蔵・常温）"]', "label"),
         F("14.5", "残りわずか率（%）", "Tỷ lệ sắp hết (%)", '.f[data-name="残りわずか率（%）"]', "label"),
         F("14.6", "備考", "Ghi chú", '.f[data-name="備考"]', "label"),
     ] + D_PRICE("15", "ESライト（自販機） 価格プラン", "ESライト（自販機） bảng giá", cool=False, vm=True) + D_EQUIP(16, "ESライト（自販機） 標準貸出設備", "ESライト（自販機） thiết bị chuẩn", csv=False) + D_MAT(17, "ESライト（自販機）", "ES Light máy bán hàng")},
    {"id": "011", "code": "AW_PLAN_002", "state": ["タブ 変更履歴", "Tab 変更履歴"], "url": "/ops/masters/plans/ES000004",
     "setup": TAB("変更履歴") + "window.scrollTo(0,q('#sec-0').offsetTop-80);", "full": True, "wait": 400,
     "items": [
         F("18", "変更履歴", "Lịch sử thay đổi", "#sec-0", "table",
           detail=["プランマスタの変更（手入力・CSV取込・価格プラン・初期備品）を新しい順に出す。", "Thay đổi của plan (nhập tay, CSV, 価格プラン, vật tư) mới nhất trước."]),
         F("18.1", "変更日時", "Thời điểm", "th::変更日時", "label", len=["日時 yyyy-mm-dd HH:MM", "yyyy-mm-dd HH:MM"]),
         F("18.2", "変更内容", "Nội dung", "th::変更内容", "label", detail=["項目名「変更前」→「変更後」。", "Tên mục 「trước」→「sau」."]),
         F("18.3", "変更者", "Người thay đổi", "th::変更者", "label"),
         F("18.4", "変更区分", "Loại thay đổi", "th::変更区分", "label", len=["手入力／CSV取込", "Nhập tay / nhập CSV"]),
     ]},
]

# ================================================================ AW_PLAN_003 登録・編集
N_HEADER = [
    F("1", "ヘッダー", "Đầu trang", ".phead", "area"),
    F("1.1", "パンくず", "Breadcrumb", ".crumb", "label", detail=["「マスタ管理 / プランマスタ一覧 / プランマスタ新規登録（または 編集）」。", "「マスタ管理 / プランマスタ一覧 / プランマスタ新規登録 (hoặc 編集)」."]),
    F("1.2", "画面名", "Tên màn hình", ".phead h2", "label", detail=["新規登録「プランマスタ新規登録」、編集「プランマスタ編集」＋プランID。編集ではサマリー（AW_PLAN_002 の 2）も出す。", "Mới: 「プランマスタ新規登録」; sửa: 「プランマスタ編集」 + プランID. Màn sửa có thêm summary (AW_PLAN_002 mục 2)."]),
    F("1.3", "キャンセル", "Hủy", ".pbtn button.cancel", "button", "click", err=["Q02"],
      detail=["入力を変えていれば Q02（状態 019）。新規登録・一覧から来た編集は一覧へ、詳細から来た編集は詳細へ戻る。", "Đã sửa thì Q02 (trạng thái 019). Mới / sửa từ danh sách → về danh sách; sửa từ chi tiết → về chi tiết."]),
    F("1.4", "登録／保存", "Đăng ký / Lưu", ".pbtn button.save", "button", "click", pattern="P-FORMBOX", err=["S01", "E31", "E36"],
      detail=["新規登録「登録」・編集「保存」。保存時のチェック（28-178・28-182・28-184。各項目の valid と E40〜E50・W03）。通ったら S01、新規は採番した ID（ES＋6桁）の詳細へ、編集は詳細へ。削除済のプランは E36。",
              "Mới: 「登録」; sửa: 「保存」. Kiểm tra khi lưu (28-178, 28-182, 28-184; xem valid từng mục và E40〜E50, W03). Qua thì S01; mới → chi tiết của ID vừa cấp, sửa → chi tiết. Plan đã xóa: E36."]),
]
N_PLAN = [
    F("2", "プラン設定", "Thiết lập plan", "#sec-1000", "area", detail=["タブの上に常に出す（全コース共通）。", "Luôn hiện trên tab (chung cho mọi course)."]),
    F("2.1", "プランID", "Mã plan", '.f[data-name="プランID"]', "label", len="文字列 ES＋6桁",
      init=["新規「（登録時に採番）」／編集は採番済みの ID", "Mới: 「（登録時に採番）」; sửa: ID đã cấp"],
      detail=["システムが採番（ES＋6桁・連番）。採番後は変えない（28-177）。物理名 plan.no。", "Hệ thống cấp (ES + 6 số, liên tiếp). Không đổi sau khi cấp (28-177). plan.no."]),
    F("2.2", "公開用プラン名", "Tên plan (công khai)", '.f[data-name="公開用プラン名"] input', "text", "input", req="○", len="文字列 60",
      init=["空", "Trống"], ex=["100プラン", "Tên hiện trên 法人Web (đăng ký, đổi plan) và hóa đơn"],
      valid=["必須。60文字以内。入力したとき管理用プラン名が空なら同じ値を入れる（REQ-PM-003）。", "Bắt buộc. ≤60 ký tự. Nếu 管理用プラン名 trống thì tự điền cùng giá trị (REQ-PM-003)."],
      detail=["法人Web（申込・プラン変更）と請求書に出る名前。物理名 plan.name_public。", "Tên trên 法人Web và hóa đơn. plan.name_public."], err=["E01", "E04", "E13"],
      demo_ok=["最大文字数の制御と、管理用プラン名への自動コピー（REQ-PM-003）が未実装（宿題 H4・H5）。仕様が正", "Chưa có giới hạn ký tự và tự copy sang 管理用プラン名 (H4, H5). Spec đúng"]),
    F("2.3", "管理用プラン名", "Tên plan (nội bộ)", '.f[data-name="管理用プラン名"] input', "text", "input", req="○", len="文字列 60",
      init=["空（公開用プラン名を入れると同じ値）", "Trống (tự điền theo 公開用プラン名)"], ex=["○○社専用150プラン", "Tên dùng nội bộ, hiện ở danh sách và tìm kiếm"],
      detail=["社内で使う名前。一覧・検索はこの名前。物理名 plan.name_admin。", "Tên nội bộ; danh sách và tìm kiếm dùng tên này. plan.name_admin."], err=["E01", "E04", "E13"], demo_ok=H_MAXLEN),
    F("2.4", "公開ステータス", "Trạng thái công khai", '.f[data-name="公開ステータス"] select', "select", "select", req="○",
      len=["選択（公開／非公開）", "Chọn (công khai / không công khai)"], init=["公開", "公開 (công khai)"], ex=["非公開", "非公開: không hiện ở 法人Web nhưng hợp đồng đang dùng vẫn giữ (vd ES30, plan riêng công ty)"],
      detail=["非公開＝法人Web（申込・プラン変更）に出さない。契約中の拠点はそのまま（REQ-PM-008）。削除済は削除の操作で付く（ここでは選べない）。物理名 plan.status。", "非公開 = không hiện ở 法人Web; hợp đồng đang dùng giữ nguyên (REQ-PM-008). 削除済 do thao tác xóa. plan.status."]),
    F("2.5", "月次提供上限の合計", "Tổng giới hạn suất/tháng", '.f[data-name="月次提供上限の合計"] input', "text", "input", req="○",
      len=["整数 1〜9,999（食）", "Số nguyên 1–9.999 (suất)"], init=["空", "Trống"], ex=["100", "Số suất/tháng; bằng con số trong tên plan (100プラン = 100)"],
      valid=["必須・1以上（E01・E14）。ESスタンダード：冷凍の上限＋冷蔵・常温の上限 ≧ この値（E40。2026/10/01 STEP5 Q5 で ＝ から訂正）、各温度帯の上限 ≦ この値（E41）。ESライト（冷蔵庫）・（自販機）：冷蔵・常温の上限 ＝ この値（E46）。",
             "Bắt buộc, ≥1 (E01, E14). ESスタンダード: 冷凍上限 + 冷蔵・常温上限 ≥ giá trị này (E40), mỗi vùng ≤ giá trị này (E41). ESライト: 冷蔵・常温上限 = giá trị này (E46)."],
      detail=["1ヶ月に提供できる食数の合計。企業負担分の計算（企業負担額 × この値）にも使う（28-148）。物理名 plan.monthly_cap_total。", "Tổng suất/tháng. Dùng tính phần công ty chịu (28-148). plan.monthly_cap_total."], err=["E01", "E14", "E40", "E41", "E46"]),
    F("2.6", "基本比×倍", "Hệ số so với cơ bản", '.f[data-name="基本比×倍"] input', "text", "input", req="○",
      len=["数値 小数1桁（0.1〜999.9）", "Số thập phân 1 chữ số (0,1–999,9)"], init=["空", "Trống"], ex=["2", "Bội số so với 50 suất cơ bản (100プラン = 2)"],
      detail=["基本50個に対する倍数。オーダー画面で運営が設定する標準数（基本50個あたり）にこの倍数を掛けて、法人のオーダー（標準数量）へ自動で反映する（28-179）。一覧には出さない。物理名 plan.base_ratio numeric(4,1)。",
              "Bội số so với 50 suất. Nhân với số chuẩn ở màn order để tự điền order của công ty (28-179). Không hiện ở danh sách. plan.base_ratio."], err=["E01", "E14"]),
    F("2.7", "コース", "Course", '.f[data-name="コース"]', "check", "check", req="○",
      len=["複数選択（ESスタンダード／ESライト（冷蔵庫）／ESライト（自販機））", "Chọn nhiều (ES Standard / ES Light tủ lạnh / ES Light máy bán hàng)"], init=["すべて ON", "Tất cả bật"],
      ex=["ESスタンダード・ESライト（冷蔵庫）", "Các course plan này cho phép; 50プラン không có 自販機"],
      valid=["1つ以上。選んだコースのタブだけ保存時にチェックする。", "≥1. Chỉ kiểm tra tab của course đã chọn khi lưu."],
      detail=["このプランで選べるコース（28-184）。選ばないコースのタブは非活性。物理名 plan.course_scope。", "Course chọn được của plan (28-184). Tab của course không chọn thì vô hiệu. plan.course_scope."], err=["E02"]),
    F("2.8", "利用人数目安（表示用）", "Số người dùng ước tính (hiển thị)", '.f[data-name="利用人数目安（表示用）"] input', "text", "input", req="－", len="文字列 20",
      init=["空", "Trống"], ex=["14名", "Số người ước tính để tư vấn; không dùng tính tiền"],
      detail=["申込のお見積・面談でプランの目安として見せる。請求・判定には使わない。物理名 plan.headcount_hint。", "Hiện khi báo giá / tư vấn. Không dùng tính tiền. plan.headcount_hint."], err=["E04"]),
]
N_FEE = [
    F("3", "料金の内訳・免責（プラン共通）", "Cơ cấu phí・miễn trừ (chung)", "#sec-1001", "area"),
    F("3.1", "企業負担額（税込・1食）", "Công ty chịu (có thuế, 1 suất)", '.f[data-name="企業負担額（税込・1食）"] input', "text", "input", req="○",
      len=["金額（整数・0〜999,999・円・税込）", "Số tiền (nguyên, 0–999.999, có thuế)"], init=["100", "100"], ex=["100", "Mặc định 100 yên/suất có thuế (28-147)"],
      detail=["プラン料金の中に含まれる金額として扱い、追加では請求しない（28-147）。子契約の「福利厚生の適用」ON のとき請求書で 基本料金／福利厚生（企業負担分）の2行に分ける（28-150）。物理名 plan.subsidy_per_meal。",
              "Nằm trong phí plan, không thu thêm (28-147). Khi 福利厚生の適用 bật thì hóa đơn tách 2 dòng (28-150). plan.subsidy_per_meal."], err=["E01", "E14"]),
    F("3.2", "企業負担分の税率", "Thuế suất phần công ty chịu", '.f[data-name="企業負担分の税率"]', "select", "select", req="○",
      len=["選択（税率マスタ）", "Chọn (từ master thuế suất)"], init=["軽減税率 8%", "Thuế suất giảm 8%"], ex=["軽減税率 8%", "Chọn từ 税率マスタ (28-149); システム管理 thêm được thuế suất (台帳 E)"],
      detail=["税率マスタから選ぶ（28-149）。物理名 plan.subsidy_tax_rate_id。", "Chọn từ 税率マスタ (28-149). plan.subsidy_tax_rate_id."], err=["E02"],
      demo_ok=["コードは 8%／10% の固定2択（税率マスタ未実装・宿題 H6）。仕様が正", "Code cố định 2 lựa chọn (chưa có 税率マスタ, H6). Spec đúng"]),
    F("3.3", "基本料金の税率", "Thuế suất phí cơ bản", '.f[data-name="基本料金の税率"]', "select", "select", req="○",
      len=["選択（税率マスタ）", "Chọn (từ master thuế suất)"], init=["標準税率 10%", "Thuế suất chuẩn 10%"], ex=["標準税率 10%", "Chọn từ 税率マスタ (28-149)"],
      detail=["物理名 plan.base_tax_rate_id。", "plan.base_tax_rate_id."], err=["E02"]),
    F("3.4", "企業負担分（税抜・自動計算）", "Phần công ty chịu (chưa thuế, tự tính)", '.f[data-name="企業負担分（税抜・自動計算）"]', "label",
      len=["金額（税抜）", "Số tiền (chưa thuế)"],
      detail=["企業負担額 × 月次提供上限の合計 ÷（1＋企業負担分の税率）。1円未満は四捨五入（hong 2026/10/05・台帳 F。旧：切り捨て【暫定】）。価格世代の各価格 − この値 ＝ 基本料金（28-148）。例：100円 × 100食 ÷ 1.08 ＝ 9,259円。",
              "企業負担額 × 月次提供上限の合計 ÷ (1 + thuế suất). Phần lẻ làm tròn (hong 2026/10/05, 台帳 F; cũ: làm tròn xuống tạm). Giá − giá trị này = 基本料金 (28-148). Vd 100 × 100 ÷ 1,08 = 9.259."],
      demo_ok=["コードは切り捨て（Math.floor）のまま（受付簿 #59）。仕様（四捨五入）が正", "Code vẫn làm tròn xuống (受付簿 #59). Spec (四捨五入) đúng"]),
    F("3.5", "免責金額", "Số tiền miễn trừ", '.f[data-name="免責金額"] input', "text", "input", req="○",
      len=["金額（整数・0〜999,999,999・円）", "Số tiền (nguyên, 0–999.999.999)"], init=["空", "Trống"], ex=["300", "Mức chênh lệch tồn kho được bỏ qua (100プラン: 300 yên)"],
      detail=["在庫差額（管理ロス）の許容範囲。超えた分を実績精算で請求する（28-151・REQ-PM-007）。プラン単位で1つ（追補 §6 ⑤）。物理名 plan.deductible_yen。", "Mức chênh lệch tồn kho được chấp nhận; vượt thì tính vào 実績精算 (28-151). 1 giá trị/plan. plan.deductible_yen."], err=["E01", "E14"]),
]
N_TABS = [
    F("4", "タブ", "Tab", ".tabs", "area", detail=["AW_PLAN_002 の 5 と同じ。保存時にエラーの項目がほかのタブにあれば、そのタブを開く。", "Giống AW_PLAN_002 mục 5. Lỗi ở tab khác thì mở tab đó khi lưu."]),
    F("4.1", "ESスタンダード", "Tab ES Standard", ".tabs [role=tab]::ESスタンダード", "tab", "click"),
    F("4.2", "ESライト（冷蔵庫）", "Tab ES Light (tủ lạnh)", ".tabs [role=tab]::ESライト（冷蔵庫）", "tab", "click"),
    F("4.3", "ESライト（自販機）", "Tab ES Light (máy bán hàng)", ".tabs [role=tab]::ESライト（自販機）", "tab", "click"),
    F("4.4", "変更履歴", "Lịch sử thay đổi", ".tabs [role=tab]::変更履歴", "tab", "click", detail=["新規登録では空。", "Mới thì trống."]),
    F("4.5", "目次", "Mục lục", ".idx", "label"),
]
def N_LIMIT(no, ja, vi, name, ex, valid, err, detail=None):
    return F(no, ja, vi, f'.f[data-name="{name}"] input', "text", "input", req="○",
             len=["整数 0〜9,999（食）", "Số nguyên 0–9.999 (suất)"], init=["空", "Trống"], ex=ex, valid=valid, err=err,
             detail=detail or ["物理名 plan_course.*。", "plan_course.*"])
N_STD = [
    F("5", "ESスタンダードプラン（冷凍・冷蔵・常温）設定", "Thiết lập ESスタンダード", "#sec-0", "area",
      detail=["コース ESスタンダード の温度帯ごとの上限・下限・標準の配送回数（28-153〜156）。", "Giới hạn và số lần giao theo vùng nhiệt của course ESスタンダード (28-153〜156)."]),
    N_LIMIT("5.1", "冷凍_月次提供数_上限", "冷凍 giới hạn trên/tháng", "冷凍_月次提供数_上限", ["20", "Số suất 冷凍 tối đa/tháng; không dùng tỷ lệ % (28-155)"],
            ["必須。≦ 月次提供上限の合計（E41）。冷凍＋冷蔵・常温の上限 ≧ 合計（E40）。", "Bắt buộc. ≤ 月次提供上限の合計 (E41). 冷凍 + 冷蔵・常温 ≥ tổng (E40)."], ["E01", "E14", "E40", "E41"],
            ["冷凍の数はこの値で決め、割合（%）は持たない（28-155）。物理名 plan_course.frozen_max。", "Số 冷凍 quyết định bằng giá trị này, không có tỷ lệ % (28-155). plan_course.frozen_max."]),
    N_LIMIT("5.2", "冷凍_月次提供数_下限", "冷凍 giới hạn dưới/tháng", "冷凍_月次提供数_下限", ["1", "Số suất 冷凍 tối thiểu/tháng"],
            ["必須。≦ 冷凍の上限（E42）。", "Bắt buộc. ≤ 冷凍上限 (E42)."], ["E01", "E14", "E42"],
            ["持つ（hong 2026/10/05 Q5）。物理名 plan_course.frozen_min。", "Giữ (hong 2026/10/05 Q5). plan_course.frozen_min."]),
    N_LIMIT("5.3", "冷蔵・常温_月次提供数_上限", "冷蔵・常温 giới hạn trên", "冷蔵・常温_月次提供数_上限", ["80", "Số suất 冷蔵・常温 tối đa/tháng"],
            ["必須。≦ 合計（E41）。冷凍の上限と足して ≧ 合計（E40）。", "Bắt buộc. ≤ tổng (E41). Cộng 冷凍上限 ≥ tổng (E40)."], ["E01", "E14", "E40", "E41"],
            ["物理名 plan_course.chilled_max。", "plan_course.chilled_max."]),
    N_LIMIT("5.4", "冷蔵・常温_月次提供数_下限", "冷蔵・常温 giới hạn dưới", "冷蔵・常温_月次提供数_下限", ["0", "Số suất 冷蔵・常温 tối thiểu/tháng"],
            ["必須。≦ 冷蔵・常温の上限（E42）。", "Bắt buộc. ≤ 冷蔵・常温上限 (E42)."], ["E01", "E14", "E42"], ["物理名 plan_course.chilled_min。", "plan_course.chilled_min."]),
    F("5.5", "冷蔵・常温_標準の配送回数", "冷蔵・常温 số lần giao chuẩn", '.f[data-name="冷蔵・常温_標準の配送回数"] input', "text", "input", req="○",
      len=["整数 1〜99（回／月）", "Số nguyên 1–99 (lần/tháng)"], init=["空", "Trống"], ex=["2", "Số lần giao 冷蔵/tháng trong plan (ES50=1, ES100〜600=2, ES650〜=4)"],
      valid=["必須・1以上（E43・28-156）。", "Bắt buộc, ≥1 (E43, 28-156)."], err=["E01", "E14", "E43"],
      detail=["このプランに含まれる冷蔵の配送回数。契約の配送回数がこれを超えた分に配送回数追加（OP000001）が温度帯ごとに付く（28-154）。物理名 plan_course.std_delivery_chilled。",
              "Số lần giao 冷蔵 trong plan. Vượt thì OP000001 theo từng vùng nhiệt (28-154). plan_course.std_delivery_chilled."]),
    F("5.6", "冷凍_標準の配送回数", "冷凍 số lần giao chuẩn", '.f[data-name="冷凍_標準の配送回数"] input', "text", "input", req="○",
      len=["整数 1〜99（回／月）", "Số nguyên 1–99 (lần/tháng)"], init=["1", "1"], ex=["1", "Số lần giao 冷凍/tháng. Ban đầu mọi plan = 1 (hong 2026/10/05), 運営 sửa sau khi có bảng 冷凍庫"],
      valid=["必須・1以上（E43）。", "Bắt buộc, ≥1 (E43)."], err=["E01", "E14", "E43"],
      detail=["全プラン 1回／月で登録しておき、冷凍庫の表を受け取ったら運営がここで直す（hong 2026/10/05・台帳 F）。物理名 plan_course.std_delivery_frozen。", "Ban đầu mọi plan = 1 lần/tháng; có bảng 冷凍庫 thì 運営 sửa ở đây (hong 2026/10/05, 台帳 F). plan_course.std_delivery_frozen."],
      demo_ok=["見本データは冷蔵と同じ 2 回のまま（受付簿 #60）。仕様（1）が正", "Dữ liệu mẫu vẫn = 2 như 冷蔵 (受付簿 #60). Spec (1) đúng"]),
    F("5.7", "1回の納品数（冷蔵・常温）", "Số suất/lần giao (冷蔵・常温)", '.f[data-name="1回の納品数（冷蔵・常温）"]', "label", len=["整数（食）・自動", "Số nguyên (suất), tự tính"],
      detail=["冷蔵・常温の上限 ÷ 冷蔵・常温の標準の配送回数（切り上げ）。冷蔵庫のサイズ判定（最大収納数 ≧ この値）に使う（28-153）。", "冷蔵・常温上限 ÷ số lần giao (làm tròn lên). Dùng chọn cỡ tủ lạnh (28-153)."]),
    F("5.8", "1回の納品数（冷凍）", "Số suất/lần giao (冷凍)", '.f[data-name="1回の納品数（冷凍）"]', "label", len=["整数（食）・自動", "Số nguyên (suất), tự tính"],
      detail=["冷凍の上限 ÷ 冷凍の標準の配送回数（切り上げ）。冷凍庫のサイズ判定に使う。", "冷凍上限 ÷ số lần giao 冷凍 (làm tròn lên). Dùng chọn cỡ tủ đông."]),
    F("5.9", "残りわずか率（%）", "Tỷ lệ sắp hết (%)", '.f[data-name="残りわずか率（%）"] input', "text", "input", req="○",
      len=["数値 0.00〜100.00（%）", "Số 0,00–100,00 (%)"], init=["25", "25"], ex=["25", "Ngưỡng badge 残りわずか trên app cá nhân = floor(số đặt thực tế × tỷ lệ). Mặc định 25, 運営 đổi theo plan"],
      valid=["必須・0〜100（E12）。", "Bắt buộc, 0–100 (E12)."], err=["E01", "E14", "E12"],
      detail=["個人アプリの「残りわずか」バッジの判定（28-152）。初期値 25%（hong 2026/10/05・台帳 F）、プラン・コースごとに変えられる。物理名 plan_course.low_stock_rate numeric(5,2)。", "Ngưỡng badge 残りわずか (28-152). Mặc định 25% (hong 2026/10/05, 台帳 F), đổi được theo plan/course. plan_course.low_stock_rate."],
      demo_ok=["新規登録の初期値が空（受付簿 #60）。仕様（25）が正", "Màn mới để trống (受付簿 #60). Spec (25) đúng"]),
    F("5.10", "備考", "Ghi chú", '.f[data-name="備考"] textarea', "textarea", "input", req="－", len=["文字列 500（複数行）", "Chuỗi 500 (nhiều dòng)"],
      init=["空", "Trống"], ex=["冷凍は季節商品のみ", "Ghi chú nội bộ cho course này"], err=["E04", "E13"], detail=["物理名 plan_course.note。", "plan_course.note."], demo_ok=H_MAXLEN),
]
def N_PRICE(no, title, vi, cool=True, diff=False, vm=False):
    """登録・編集：コースごとの価格プランの表（現行画面どおり・hong 2026/10/05。1行＝1世代）"""
    its = [F(no, title, vi, "#sec-1", "area", pattern="P-FORMBOX",
             detail=["1行＝1つの価格の世代。料金改定のたびに行を足す（REQ-PM-001・037）。行を足すと前の行の終了期間に前日が自動で入る。期間は重ねられない（28-178⑥）。公開用は1行だけ（28-180）。使っている子契約がある世代は 価格・開始期間 を直せない（終了期間だけ可。金額の誤りは「誤りの訂正」）。どの子契約も使っていない世代は直す・削除できる。",
                     "1 dòng = 1 thế hệ giá. Mỗi lần đổi giá thì thêm dòng (REQ-PM-001, 037). Thêm dòng thì 終了期間 của dòng trước tự điền ngày hôm trước. Không chồng kỳ (28-178⑥). 公開用 chỉ 1 dòng (28-180). Thế hệ đang có hợp đồng dùng thì không sửa giá / ngày bắt đầu (chỉ sửa 終了期間; sai số tiền thì 誤りの訂正). Thế hệ chưa dùng thì sửa / xóa được."])]
    its.append(F(f"{no}.1", "公開用", "Công khai", "#sec-1 th::公開用", "radio", "check", req="○",
                 len=["ラジオ（1行だけ）", "Radio (1 dòng)"], init=["新規：最初の行", "Mới: dòng đầu"], ex=["ON（改訂第三回目）", "Chọn thế hệ hiện trên 法人Web và dùng cho hợp đồng mới"],
                 valid=["コースごとに1行だけ（E45）。", "Mỗi course đúng 1 dòng (E45)."], err=["E45"], detail=["物理名 plan_price.is_public。", "plan_price.is_public."]))
    its.append(F(f"{no}.2", "価格プラン", "Tên thế hệ giá", "#sec-1 th::価格プラン", "text", "input", req="○", len="文字列 20",
                 init=["新規：ほかのプランにある世代の名前の行をすべて入れておく（元の料金〜最新の改訂。価格は空・公開用は最新の行）。編集：保存済み", "Mới: điền sẵn mọi dòng tên thế hệ đang có ở các plan khác (元の料金〜cải định mới nhất; giá trống, 公開用 = dòng mới nhất). Sửa: đã lưu"],
                 ex=["改訂第三回目", "Tên thế hệ: 元の料金 / 改訂第一回目 / 改訂第二回目…; các course và plan dùng cùng tên"], err=["E01", "E04"],
                 detail=["元の料金／改訂第一回目／…。世代の名前はシステム全体で共通（料金改定1回＝1世代）。新規登録では、ほかのプランにある世代の名前を行として入れておく（B 案・hong 2026/10/05）。使わない行は消してよい。物理名 plan_price.revision。", "元の料金 / 改訂第一回目 /… Tên thế hệ chung toàn hệ thống (1 lần cải định = 1 thế hệ). Màn mới điền sẵn các tên thế hệ của plan khác (phương án B, hong 2026/10/05); dòng không dùng thì xóa. plan_price.revision."],
                 demo_ok=["コードの新規登録は空の表（受付簿 #73）。仕様が正", "Màn mới của code là bảng trống (受付簿 #73). Spec đúng"]))
    its.append(F(f"{no}.3", "開始期間", "Ngày bắt đầu", "#sec-1 th::開始期間", "date", "input", req="○", len=["日付 yyyy-mm-dd", "yyyy-mm-dd"],
                 init=["空", "Trống"], ex=["2026-04-01", "Ngày bắt đầu dùng thế hệ này (tham khảo)"], err=["E01", "E48"],
                 valid=["前の行の終了期間より後（期間を重ねない・E48）。", "Sau 終了期間 của dòng trước (không chồng kỳ, E48)."],
                 detail=["参考の項目（この世代をいつから使い始めたかの記録）。期間で選べる世代を制限しない：契約がどの世代を使うかは子契約の「適用された価格プラン」で決まる（28-181・hong 2026/10/05）。物理名 plan_price.valid_from。", "Mục tham khảo (ghi thế hệ này dùng từ khi nào). Không dùng để giới hạn thế hệ chọn được: hợp đồng dùng thế hệ nào là do 「適用された価格プラン」 của 子契約 (28-181, hong 2026/10/05). plan_price.valid_from."]))
    its.append(F(f"{no}.4", "終了期間", "Ngày kết thúc", "#sec-1 th::終了期間", "date", "input", req="－", len=["日付 yyyy-mm-dd", "yyyy-mm-dd"],
                 init=["空＝現在も有効（次の行を足すと前日が自動で入る）", "Trống = còn hiệu lực (thêm dòng sau thì tự điền ngày hôm trước)"], ex=["2026-03-31", "Ngày cuối áp dụng; trống = đang hiệu lực"], err=["E08"],
                 detail=["参考の項目（28-181・hong 2026/10/05）。物理名 plan_price.valid_to。", "Mục tham khảo (28-181, hong 2026/10/05). plan_price.valid_to."]))
    k = 5
    if cool:
        its.append(F(f"{no}.{k}", "価格（COOL便・税抜）", "Giá (COOL便, chưa thuế)", "#sec-1 th::価格（COOL便）", "text", "input", req="○",
                     len=["金額（整数・0〜999,999,999・税抜）・右寄せ", "Số tiền (nguyên, chưa thuế), căn phải"], init=["空", "Trống"], ex=["49500", "Phí plan 1 tháng khi giao bằng COOL便"],
                     valid=["必須。≧ 企業負担分（税抜）（E44）。", "Bắt buộc. ≥ 企業負担分 (E44)."], err=["E01", "E14", "E44"], detail=["物理名 plan_price.amount_cool。", "plan_price.amount_cool."])); k += 1
    its.append(F(f"{no}.{k}", "価格（ES配送便・税抜）", "Giá (ES配送便, chưa thuế)", "#sec-1 th::価格（ES配送便）", "text", "input", req="○",
                 len=["金額（整数・0〜999,999,999・税抜）・右寄せ", "Số tiền (nguyên, chưa thuế), căn phải"], init=["空", "Trống"], ex=["49500" if not vm else "48000", "Phí plan 1 tháng khi giao bằng ES配送便" + ("; 自販機 chỉ có ES配送便, không gồm tiền thuê máy OP000037" if vm else "")],
                 valid=["必須。≧ 企業負担分（税抜）（E44）。", "Bắt buộc. ≥ 企業負担分 (E44)."], err=["E01", "E14", "E44"], detail=["物理名 plan_price.amount_es。", "plan_price.amount_es."])); k += 1
    its.append(F(f"{no}.{k}", "内訳（基本料金／企業負担分）", "Cơ cấu (基本料金 / 企業負担分)", "#sec-1 th::内訳 ES配送便（基本 10%／企業負担 8%）", "label", len=["金額（税抜）・右寄せ", "Số tiền (chưa thuế), căn phải"],
                 detail=["自動計算：基本料金（税抜）＝ 価格 − 企業負担分（税抜）。税率はプラン共通の欄（28-148・28-150）。配送方法ごとに出す。", "Tự tính: 基本料金 = giá − 企業負担分. Thuế suất theo mục chung (28-148, 28-150). Theo từng phương thức giao."])); k += 1
    if diff:
        its.append(F(f"{no}.{k}", "スタンダードアップ差額（COOL便／ES配送便）", "Chênh lệch nâng cấp Standard", "#sec-1 th::スタンダードアップ差額", "label",
                     detail=["自動計算：同じ世代の スタンダード − ライト。値引き DC000021 の金額（28-170・28-174）。", "Tự tính: スタンダード − ライト cùng thế hệ. Số tiền giảm DC000021 (28-170, 28-174)."])); k += 1
    its.append(F(f"{no}.{k}", "操作", "Thao tác", "#sec-1 th::操作", "button", "click", err=["Q01", "S05", "I03"],
                 detail=["使っていない世代：削除（Q01）。使っている世代：「誤りの訂正」（理由が必須・S05）、期間が終わった世代：I03（見るだけ）。", "Thế hệ chưa dùng: xóa (Q01). Đang dùng: 誤りの訂正 (bắt buộc lý do, S05). Hết hạn: I03."],
                 demo_ok=H_PRICE)); k += 1
    its.append(F(f"{no}.{k}", "行を追加", "Thêm dòng", "#sec-1 .pad button", "button", "click",
                 detail=["新しい世代の行を末尾に足し、前の行の終了期間に前日を入れる。", "Thêm dòng thế hệ mới ở cuối, tự điền 終了期間 của dòng trước."]))
    return its
def N_EQUIP(no, title, vi, same=False, csv=False, vm=False):   # csv は使わない（受付簿 #68）
    its = [F(no, title, vi, "#sec-2", "area",
             detail=["載っている機種・台数が「プランに含まれる設備」で初期料金・月額料金とも無料（28-182）。載っていない機種・台数を超えた分は機種マスタの料金。" + ("自販機の行が1つ以上必須・冷蔵庫と冷凍庫は入れない（28-184）。自販機のリース料は OP000037 で別に請求。" if vm else "ES250・ES600以上は資材ボックスの行を入れない（28-165）。"),
                     "Thiết bị ghi ở đây = thiết bị trong plan, miễn phí (28-182). Ngoài danh sách thì tính theo 機種マスタ. " + ("Bắt buộc ≥1 dòng 自販機, không có 冷蔵庫・冷凍庫 (28-184). Tiền thuê máy thu riêng (OP000037)." if vm else "ES250, ES600+ không có dòng 資材ボックス (28-165).")])]
    k = 1
    if same:
        its.append(F(f"{no}.{k}", "スタンダードと同じ構成にする", "Giống cấu hình Standard", '.f[data-name="スタンダードと同じ構成にする"] select', "select", "select", req="○",
                     len=["選択（する／しない）", "Chọn (có / không)"], init=["する", "する (có)"], ex=["する", "する = lấy cấu hình ESスタンダード bỏ dòng 冷凍庫; bảng dưới chỉ xem"],
                     detail=["する＝ESスタンダードの標準貸出設備から冷凍庫の行を除いたものをそのまま使う（下の表は参照だけ）。しない＝表を入れる（28-182）。物理名 plan_course.equip_same_as_std。", "する = dùng cấu hình ESスタンダード bỏ 冷凍庫 (bảng chỉ xem). しない = tự nhập (28-182). plan_course.equip_same_as_std."])); k += 1
    its.append(F(f"{no}.{k}", "相談して決める", "Quyết định qua tư vấn", '.f[data-name="相談して決める"] select', "select", "select", req="○",
                 len=["選択（しない／する）", "Chọn (không / có)"], init=["しない", "しない (không)"], ex=["する", "する cho ES600 trở lên: 法人Web chỉ hiện cấu hình chuẩn, không cho chọn cỡ"],
                 detail=["する＝法人Webでは標準の構成を表示するだけでサイズを選ばせず、変更は相談（運営が変更する）。ES600以上（決定_冷蔵庫マスタとプラン別構成 #3）。物理名 plan_course.equip_consult。", "する = 法人Web chỉ hiện cấu hình chuẩn, thay đổi qua tư vấn. ES600+ . plan_course.equip_consult."])); k += 1
    its += [
        F(f"{no}.{k}", "標準貸出設備の表", "Bảng thiết bị chuẩn", "#sec-2 table", "table",
          valid=["「標準」パターンの行が1つ以上（E49）。" + ("自販機の行が1つ以上・冷蔵庫と冷凍庫の行は不可（E50）。" if vm else "") + "標準の冷蔵庫・冷凍庫・自販機は 最大収納数 ≧ 1回の納品数、足りなければ W03（28-182⑧）。",
                 "≥1 dòng pattern 標準 (E49). " + ("≥1 dòng 自販機, không có 冷蔵庫・冷凍庫 (E50). " if vm else "") + "Sức chứa tối đa ≥ số suất/lần giao, thiếu thì W03 (28-182⑧)."], err=["E49", "W03"] + (["E50"] if vm else []),
          detail=["同じパターンの行をまとめて1つの構成として扱う。", "Các dòng cùng pattern = 1 cấu hình."]),
        F(f"{no}.{k}.1", "パターン", "Pattern", "#sec-2 th::パターン", "select", "select", req="○", len=["選択（標準／代替）", "Chọn (chuẩn / thay thế)"], init=["標準", "標準 (chuẩn)"],
          ex=["代替", "代替 = cấu hình khách có thể chọn thay chuẩn khi đăng ký (vd ES400: 84L×2)"], detail=["物理名 plan_std_equipment.pattern。", "plan_std_equipment.pattern."]),
        F(f"{no}.{k}.2", "機種区分", "Loại thiết bị", "#sec-2 th::機種区分", "label", detail=["機種を選ぶと機種マスタから自動で入る（冷蔵庫／冷凍庫／自販機／資材ボックス）。", "Tự điền từ 機種マスタ khi chọn 機種."]),
        F(f"{no}.{k}.3", "機種", "Thiết bị", "#sec-2 th::機種", "select", "select", req="○", len=["選択（機種マスタ：" + ("自販機・資材ボックス" if vm else "冷蔵庫・冷凍庫・資材ボックス") + "）", "Chọn (từ master thiết bị)"], init=["未選択", "Chưa chọn"],
          ex=["VM000001 カップ式自販機 VM-6010" if vm else "RF000001 冷蔵ショーケース 48L", "Chọn từ 機種マスタ (ID + tên)"], err=["E02"], detail=["物理名 plan_std_equipment.model_id。", "plan_std_equipment.model_id."]),
        F(f"{no}.{k}.4", "台数", "Số lượng", "#sec-2 th::台数", "text", "input", req="○", len=["整数 1〜99（台・資材ボックスは個）", "Số nguyên 1–99"], init=["空", "Trống"], ex=["1", "Số máy (資材ボックス tính theo cái)"], err=["E01", "E14"],
          detail=["物理名 plan_std_equipment.qty。", "plan_std_equipment.qty."]),
        F(f"{no}.{k}.5", "備考", "Ghi chú", "#sec-2 th::備考", "text", "input", req="－", len="文字列 500", init=["空", "Trống"], ex=["ES400 の代替", "Ghi chú cho dòng thiết bị"], err=["E04"], demo_ok=H_MAXLEN),
        F(f"{no}.{k}.6", "行の削除", "Xóa dòng", "#sec-2 th::操作", "button", "click", detail=["その行を消す（保存するまで確定しない）。", "Bỏ dòng (chưa chốt đến khi lưu)."]),
        F(f"{no}.{k+1}", "行を追加", "Thêm dòng", "#sec-2 .pad button", "button", "click", detail=["空の行を末尾に足す。", "Thêm dòng trống ở cuối."]),
    ]
    return its

def N_MAT(no, course, course_vi, new=False):
    """登録・編集：初期備品・プランに含む資材（コースごとのタブの中・標準貸出設備の下）。画面の 登録／保存 で一緒に保存（hong 2026/10/05・受付簿 #69）"""
    c = ".pane" if new else ".pane > .card:last-of-type"
    its = [F(no, f"初期備品・プランに含む資材（{course}）", f"Vật tư ban đầu / vật tư trong plan ({course_vi})", c, "area", pattern="P-FORMBOX",
             detail=["このコースの初期備品の数と、プラン共通の月の無料数量を入れる。画面の「登録／保存」で一緒に保存する（カードに保存ボタンは置かない）。変更はタブ「変更履歴」に残す。各コースに初期備品が1つ以上必要。" + ("新規登録でも入力する（資材マスタの全資材が行に出る）。" if new else ""),
                     "Nhập số vật tư ban đầu của course này và 月の無料数量 chung cho plan. Lưu chung bằng 「登録／保存」 (không có nút lưu riêng). Thay đổi ghi vào tab 変更履歴. Mỗi course cần ≥1 vật tư." + (" Đăng ký mới cũng nhập (mọi vật tư của 資材マスタ hiện thành dòng)." if new else "")],
             demo_ok=(["新規登録ではコードがまだこのカードを出さない（受付簿 #69）。仕様が正", "Màn đăng ký mới code chưa hiện card này (受付簿 #69). Spec đúng"] if new else
                      ["コードはカードに 保存・元に戻す と変更履歴（資材）の表を置いたまま（受付簿 #69）。仕様が正", "Code vẫn có nút 保存／元に戻す và bảng lịch sử riêng (受付簿 #69). Spec đúng"]))]
    if new:
        return its
    its += [
        F(f"{no}.1", "資材", "Vật tư", "th::資材", "label", detail=["資材ID＋資材名（資材マスタの削除済を除く全部）。", "Mã + tên vật tư (toàn bộ 資材マスタ trừ đã xóa)."]),
        F(f"{no}.2", "単価（税抜）", "Đơn giá (chưa thuế)", "th::単価（税抜）", "label", len=["金額（税抜）", "Số tiền"], detail=["資材マスタの値（表示だけ）。", "Giá trị từ 資材マスタ (chỉ xem)."]),
        F(f"{no}.3", f"初期備品：{course}", f"Vật tư ban đầu: {course_vi}", "th::初期備品", "text", "input", req="条件付き",
          len=["整数 0〜999,999（個）", "Số nguyên 0–999.999 (cái)"], init=["保存済みの値（なければ空）", "Giá trị đã lưu (trống nếu chưa có)"], ex=["10", "Số lượng vật tư trong bộ ban đầu của course này"],
          cond=["このタブのコースの列だけ", "Chỉ cột của course của tab này"], valid=["各コースに1つ以上の資材が必要。", "Mỗi course cần ≥1 vật tư."], err=["E14"],
          detail=["物理名 plan_material.initial_qty（資材 × プラン × コース）。", "plan_material.initial_qty (vật tư × plan × course)."]),
        F(f"{no}.4", "月の無料数量", "Số lượng miễn phí/tháng", "th::月の無料数量", "text", "input", req="－",
          len=["整数 0〜999,999（個）", "Số nguyên 0–999.999 (cái)"], init=["空＝プランの食数", "Trống = số suất của plan"], ex=["100", "Trống = số suất plan (100プラン → 100); 0 = không miễn phí"],
          detail=["プラン共通（どのタブでも同じ）。見出しに「空欄＝プランの食数 n」。物理名 plan_material.free_qty。", "Chung cho plan (giống nhau ở mọi tab). Tiêu đề ghi 「空欄＝プランの食数 n」. plan_material.free_qty."], err=["E14"]),
    ]
    return its

V_FORM = [
    {"id": "013", "code": "AW_PLAN_003", "state": ["新規登録 初期表示（タブ ESスタンダード）", "Đăng ký mới (tab ESスタンダード)"], "url": "/ops/masters/plans/new",
     "setup": "", "full": True, "wait": 600,
     "note": ["フル権限だけが開ける（ほかの役割は URL を直接開いても一覧へ）。入力の共通基準（空白・全角→半角・文字数）は P-FORMBOX。", "Chỉ フル権限 mở được. Quy tắc nhập chung xem P-FORMBOX."],
     "items": N_HEADER + N_PLAN + N_FEE + N_TABS + N_STD + N_PRICE("6", "ESスタンダード 価格プラン", "ESスタンダード bảng giá") + N_EQUIP("7", "ESスタンダード 標準貸出設備", "ESスタンダード thiết bị chuẩn") + N_MAT("8", "ESスタンダード", "ES Standard", new=True)},
    {"id": "014", "code": "AW_PLAN_003", "state": ["新規登録 タブ ESライト（冷蔵庫）", "Đăng ký mới, tab ESライト（冷蔵庫）"], "url": "/ops/masters/plans/new",
     "setup": TAB("ESライト（冷蔵庫）") + "window.scrollTo(0,q('#sec-0').offsetTop-80);", "full": True, "wait": 400,
     "items": [
         F("9", "ESライトプラン（冷蔵・常温）設定", "Thiết lập ESライト", "#sec-0", "area", detail=["冷凍の欄はない。項目の決まりは 5 と同じ（物理名 plan_course.*）。", "Không có 冷凍. Quy tắc giống mục 5."]),
         N_LIMIT("9.1", "冷蔵・常温_月次提供数_上限", "冷蔵・常温 giới hạn trên", "冷蔵・常温_月次提供数_上限", ["100", "Phải bằng 月次提供上限の合計 (ESライト không có 冷凍)"],
                 ["必須。＝ 月次提供上限の合計（E46・28-178②）。", "Bắt buộc. = 月次提供上限の合計 (E46, 28-178②)."], ["E01", "E14", "E46"]),
         N_LIMIT("9.2", "冷蔵・常温_月次提供数_下限", "冷蔵・常温 giới hạn dưới", "冷蔵・常温_月次提供数_下限", ["0", "Số suất tối thiểu/tháng"], ["≦ 上限（E42）。", "≤ giới hạn trên (E42)."], ["E01", "E14", "E42"]),
         F("9.3", "冷蔵・常温_標準の配送回数", "Số lần giao chuẩn", '.f[data-name="冷蔵・常温_標準の配送回数"] input', "text", "input", req="○", len=["整数 1〜99（回／月）", "Số nguyên 1–99"], init=["空", "Trống"], ex=["2", "Số lần giao/tháng (ES50=1, ES100〜600=2)"], valid=["1以上（E43）。", "≥1 (E43)."], err=["E01", "E14", "E43"]),
         F("9.4", "1回の納品数（冷蔵・常温）", "Số suất/lần giao", '.f[data-name="1回の納品数（冷蔵・常温）"]', "label", detail=["自動：上限 ÷ 標準の配送回数（切り上げ）。", "Tự tính: giới hạn ÷ số lần giao (làm tròn lên)."]),
         F("9.5", "残りわずか率（%）", "Tỷ lệ sắp hết (%)", '.f[data-name="残りわずか率（%）"] input', "text", "input", req="○", len=["数値 0.00〜100.00（%）", "Số 0,00–100,00"], init=["25", "25"], ex=["25", "Ngưỡng badge 残りわずか; mặc định 25"], err=["E01", "E14", "E12"], demo_ok=H_MAXLEN),
         F("9.6", "備考", "Ghi chú", '.f[data-name="備考"] textarea', "textarea", "input", req="－", len=["文字列 500（複数行）", "Chuỗi 500 (nhiều dòng)"], init=["空", "Trống"], ex=["冷蔵庫 48L を標準", "Ghi chú nội bộ"], err=["E04", "E13"], demo_ok=H_MAXLEN),
     ] + N_PRICE("10", "ESライト 価格プラン", "ESライト bảng giá", diff=True) + N_EQUIP("11", "ESライト 標準貸出設備", "ESライト thiết bị chuẩn", same=True) + N_MAT("12", "ESライト（冷蔵庫）", "ES Light tủ lạnh", new=True)},
    {"id": "015", "code": "AW_PLAN_003", "state": ["新規登録 タブ ESライト（自販機）", "Đăng ký mới, tab ESライト（自販機）"], "url": "/ops/masters/plans/new",
     "setup": TAB("ESライト（自販機）") + "window.scrollTo(0,q('#sec-0').offsetTop-80);", "full": True, "wait": 400,
     "items": [
         F("13", "ESライト（自販機）プラン設定", "Thiết lập ESライト（自販機）", "#sec-0", "area", detail=["冷蔵の自販機だけ（28-185）。配送方法は ES配送便に固定（28-19）。項目の決まりは 9 と同じ。", "Chỉ máy bán hàng lạnh (28-185). Giao cố định ES配送便 (28-19). Quy tắc giống mục 9."]),
         N_LIMIT("13.1", "冷蔵・常温_月次提供数_上限", "冷蔵・常温 giới hạn trên", "冷蔵・常温_月次提供数_上限", ["100", "= 月次提供上限の合計"], ["＝ 月次提供上限の合計（E46）。", "= 月次提供上限の合計 (E46)."], ["E01", "E14", "E46"]),
         N_LIMIT("13.2", "冷蔵・常温_月次提供数_下限", "冷蔵・常温 giới hạn dưới", "冷蔵・常温_月次提供数_下限", ["0", "Số suất tối thiểu"], ["≦ 上限（E42）。", "≤ giới hạn trên (E42)."], ["E01", "E14", "E42"]),
         F("13.3", "冷蔵・常温_標準の配送回数", "Số lần giao chuẩn", '.f[data-name="冷蔵・常温_標準の配送回数"] input', "text", "input", req="○", len=["整数 1〜99（回／月）", "Số nguyên 1–99"], init=["空", "Trống"], ex=["2", "Số lần giao/tháng (ES配送便)"], valid=["1以上（E43）。", "≥1 (E43)."], err=["E01", "E14", "E43"]),
         F("13.4", "1回の納品数（冷蔵・常温）", "Số suất/lần giao", '.f[data-name="1回の納品数（冷蔵・常温）"]', "label", detail=["自動。自販機の最大収納数がこの値以上の機種だけ標準にできる（足りないときは W03）。", "Tự tính. Chỉ máy có sức chứa ≥ giá trị này mới làm chuẩn (thiếu thì W03)."]),
         F("13.5", "残りわずか率（%）", "Tỷ lệ sắp hết (%)", '.f[data-name="残りわずか率（%）"] input', "text", "input", req="○", len=["数値 0.00〜100.00（%）", "Số 0,00–100,00"], init=["25", "25"], ex=["25", "Giống ESライト（冷蔵庫） (28-152); mặc định 25"], err=["E01", "E14", "E12"], demo_ok=H_MAXLEN),
         F("13.6", "備考", "Ghi chú", '.f[data-name="備考"] textarea', "textarea", "input", req="－", len=["文字列 500（複数行）", "Chuỗi 500 (nhiều dòng)"], init=["空", "Trống"], ex=["現場調査のうえ設置", "Ghi chú nội bộ"], err=["E04", "E13"], demo_ok=H_MAXLEN),
     ] + N_PRICE("14", "ESライト（自販機） 価格プラン", "ESライト（自販機） bảng giá", cool=False, vm=True) + N_EQUIP("15", "ESライト（自販機） 標準貸出設備", "ESライト（自販機） thiết bị chuẩn", vm=True) + N_MAT("16", "ESライト（自販機）", "ES Light máy bán hàng", new=True)},
    {"id": "016", "code": "AW_PLAN_003", "state": ["新規登録 入力エラー", "Đăng ký mới, lỗi nhập"], "url": "/ops/masters/plans/new",
     "setup": JS + "q('.pbtn button.save').click();await sleep(600);window.scrollTo(0,0);", "full": True, "wait": 400,
     "note": ["何も入れずに「登録」を押したとき。見出しの下に「保存できません（n件）。赤い項目を確認してください」の1行、該当の項目は赤枠＋項目の下に文言（P-FORMBOX・A 案）。", "Nhấn 登録 khi chưa nhập gì. Dưới tiêu đề 1 dòng 「保存できません（n件）…」, mục lỗi viền đỏ + câu lỗi dưới mục (P-FORMBOX, phương án A)."],
     "items": [
         F("17", "エラーの枠", "Khung lỗi", ".vbox", "label", "show", pattern="P-FORMBOX", err=["E01", "E40", "E41", "E42", "E43", "E44", "E45", "E46", "E48", "E49", "E50"],
           detail=["エラーの項目には赤枠と、項目の下に文言（例「公開用プラン名は必須項目です。」hong 2026/10/05）。見出しの下の赤い枠は「保存できません（n件）。赤い項目を確認してください」の1行だけ（一覧は出さない・A 案）。エラーのあるタブの見出しに赤い印。選んだコースのタブだけチェックする（28-178）。", "Mục lỗi: viền đỏ + câu lỗi ngay dưới mục (vd 「公開用プラン名は必須項目です。」, hong 2026/10/05). Khung đỏ dưới tiêu đề chỉ 1 dòng 「保存できません（n件）。赤い項目を確認してください」 (không liệt kê, phương án A). Tab có lỗi đánh dấu đỏ. Chỉ kiểm tra tab của course đã chọn (28-178)."],
           demo_ok=["コードのチェックは 必須の一部・上限/下限・配送回数≧1・価格≧企業負担分・公開用1行 だけ（28-178⑥・28-182⑦⑧・28-184⑨・必須の全項目は未実装＝宿題 H3）。項目の下の文言は実装済み。仕様が正", "Code mới kiểm tra một phần (H3); câu lỗi dưới mục đã làm. Spec đúng"]),
         F("17.1", "項目の下のエラー", "Lỗi dưới mục", ".f.verr", "label", "show", err=["E01"], detail=["エラーの項目に赤い枠＋項目の下に文言（必須は E01）。最初のエラーがほかのタブならそのタブを開く。", "Mục lỗi: viền đỏ + câu lỗi dưới mục (bắt buộc = E01). Lỗi đầu ở tab khác thì mở tab đó."]),
     ]},
    {"id": "017", "code": "AW_PLAN_003", "state": ["編集 初期表示", "Sửa, hiển thị ban đầu"], "url": "/ops/masters/plans/ES000004/edit",
     "setup": "", "full": True, "wait": 600,
     "note": ["新規登録と同じフォームに保存済みの値が入る。違い：画面名「プランマスタ編集」＋ID、サマリー、ボタン「保存」。価格プランの表（6・9・12）は、使っている子契約がある行の 価格・開始期間 を直せない。", "Cùng form với đăng ký mới nhưng có giá trị đã lưu. Khác: tiêu đề 「プランマスタ編集」 + ID, summary, nút 保存. Bảng 価格プラン (6, 9, 12): dòng đang có hợp đồng dùng thì không sửa giá / ngày bắt đầu."],
     "items": [
         F("18", "ヘッダー（編集）", "Đầu trang (sửa)", ".phead", "area", detail=["1 と同じ。画面名「プランマスタ編集 ES000004」、右に キャンセル・保存。", "Giống mục 1. Tiêu đề 「プランマスタ編集 ES000004」, nút キャンセル・保存."]),
         F("18.1", "サマリー", "Tóm tắt", ".sumbar", "label", detail=["AW_PLAN_002 の 2 と同じ（保存済みの値。編集中は変わらない）。", "Giống AW_PLAN_002 mục 2 (giá trị đã lưu, không đổi khi đang sửa)."]),
         F("18.2", "プランID（編集）", "Mã plan (sửa)", '.f[data-name="プランID"]', "label", detail=["採番済みの ID。変更不可。", "ID đã cấp, không đổi."]),
         F("18.3", "保存", "Lưu", ".pbtn button.save", "button", "click", pattern="P-FORMBOX", err=["S01", "E31", "E36"], detail=["1.4 と同じ。保存後は詳細へ。", "Giống 1.4. Lưu xong về chi tiết."]),
     ] + N_MAT("19", "ESスタンダード", "ES Standard")},
    {"id": "018", "code": "AW_PLAN_003", "state": ["編集 入力エラー（上限の不整合）", "Sửa, lỗi nhập (giới hạn không khớp)"], "url": "/ops/masters/plans/ES000004/edit",
     "setup": JS + "setv(q('.f[data-name=\"冷蔵・常温_月次提供数_上限\"] input'),'10');await sleep(200);q('.pbtn button.save').click();await sleep(600);window.scrollTo(0,0);", "full": True, "wait": 400,
     "note": ["ESスタンダードの冷蔵・常温の上限を 10 にして保存（冷凍 20 ＋ 10 ＜ 合計 100 → E40）。", "Đổi 冷蔵・常温上限 của ESスタンダード thành 10 rồi lưu (20 + 10 < 100 → E40)."],
     "items": [
         F("20", "エラーの枠（編集）", "Khung lỗi (sửa)", ".vbox", "label", "show", pattern="P-FORMBOX", err=["E40"], detail=["17 と同じ。", "Giống mục 17."]),
     ]},
    {"id": "019", "code": "AW_PLAN_003", "state": ["編集内容を破棄しますか（モーダル）", "Hủy nội dung đã sửa (modal)"], "url": "/ops/masters/plans/ES000004/edit",
     "setup": JS + "setv(q('.f[data-name=\"管理用プラン名\"] input'),'100プランX');await sleep(200);q('.pbtn button.cancel').click();await sleep(400);", "full": False, "wait": 400,
     "note": ["入力を変えたあとに キャンセル（または ほかの画面へ移動・ブラウザを閉じる／再読み込み）。hong 2026/10/05 Q6＝全サイト共通。", "Đã sửa rồi nhấn キャンセル (hoặc chuyển trang, đóng/tải lại). hong 2026/10/05 Q6 = toàn hệ thống."],
     "items": [
         F("21", "破棄の確認モーダル", "Modal xác nhận hủy", '.es-modal[aria-label="編集内容を破棄しますか？"]', "modal", "show", pattern="P-FORMBOX", err=["Q02"]),
         F("21.1", "本文", "Nội dung", ".es-modal__body", "label", detail=["Q02（Message List No.25）。", "Q02 (Message List No.25)."]),
         F("21.2", "キャンセル", "Hủy", ".es-modal__actions button::キャンセル", "button", "click", detail=["閉じて編集を続ける。", "Đóng, tiếp tục sửa."]),
         F("21.3", "破棄", "Bỏ", ".es-modal__actions button::破棄", "button", "click", detail=["入力を捨てて移動する。", "Bỏ nội dung đã nhập và chuyển trang."]),
     ]},
]

# ================================================================ CSV取込（画面・hong 2026/10/05）。列の定義（sel "-"＝画面には出さない）は API（csv.columns）＋入力画面の項目＋CSVテンプレートから scratchpad/gen_csv2.py で作った
V_CSV = [
    {'id': '021', 'code': 'AW_PLAN_004', 'state': ['初期表示（ステップ1 ファイルを選ぶ）', 'Hiển thị ban đầu (bước 1 chọn tệp)'], 'url': '/ops/masters/plans/import', 'setup': '', 'full': True, 'wait': 1200, 'note': ['フル権限（CSV取込の権限）だけが開ける（ほかの役割は一覧へ）。見出し → ファイルを選ぶ。列の定義（2.x）は画面には出さない（hong 2026/10/05）。モーダルではなく画面。', 'Chỉ vai trò có quyền CSV取込 mở được. Tiêu đề → chọn tệp. Định nghĩa cột (2.x) không hiện trên màn hình (hong 2026/10/05). Là màn hình, không phải modal.'], 'items': [{'no': '1', 'ja': 'ヘッダー', 'vi': 'Đầu trang', 'sel': '.csvph', 'kind': 'area', 'trig': 'view'}, {'no': '1.1', 'ja': 'パンくず', 'vi': 'Breadcrumb', 'sel': '.crumb', 'kind': 'label', 'trig': 'view', 'detail': ['「マスタ管理 / プランマスタ一覧 / プランマスタ CSV取込」。一覧はリンク。', '「マスタ管理 / …一覧 / プランマスタ CSV取込」. Danh sách là link.']}, {'no': '1.2', 'ja': '画面名', 'vi': 'Tên màn hình', 'sel': '.csvph h1', 'kind': 'label', 'trig': 'view', 'detail': ['「プランマスタ CSV取込」', 'Tiêu đề 「プランマスタ CSV取込」']}, {'no': '1.3', 'ja': 'キャンセル', 'vi': 'Hủy', 'sel': '.csvph .btns button.out::キャンセル', 'kind': 'button', 'trig': 'click', 'detail': ['一覧へ戻る（何も登録しない）。見出しの右のボタン（アンケートの CSV取込と同じ）。', 'Về danh sách (không đăng ký gì). Nút bên phải tiêu đề.']}, {'no': '2', 'ja': 'CSVテンプレートの列（定義。画面には出さない）', 'vi': 'Các cột của CSV template (định nghĩa; không hiện trên màn hình)', 'sel': '-', 'kind': 'area', 'trig': 'view', 'detail': ['取り込むファイルの列の定義（1行目の見出し・この順。CSV出力と同じ列）。テンプレートの写しは docs/05_画面設計書/CSVテンプレート/plans.csv。キー＝プランID／仮キー（空欄＝新規・採番）。UTF-8（BOM 可）・5,000行まで。空欄のセルは今の値のまま、「-」で消す。2.1〜 の必須・長さ・チェックは入力画面の項目と同じ（違うところだけ書く）。画面には出さない（hong 2026/10/05）。', 'Định nghĩa cột của tệp nhập (dòng 1 = tiêu đề, theo thứ tự này; cùng cột với CSV出力). Bản mẫu: docs/05_画面設計書/CSVテンプレート/plans.csv. Khóa = プランID／仮キー (trống = mới, cấp ID). UTF-8 (có BOM được), tối đa 5.000 dòng. Ô trống giữ giá trị cũ, "-" để xóa. Bắt buộc / độ dài / kiểm tra của 2.1〜 giống mục nhập trên màn hình (chỉ ghi chỗ khác). Không hiện trên màn hình (hong 2026/10/05).']}, {'no': '2.1', 'ja': '行区分', 'vi': 'Loại dòng', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '○', 'len': ['選択（プラン／コース／価格／設備）', 'Chọn (plan / course / giá / thiết bị)'], 'valid': ['この4つ以外はエラー。1プラン＝プランの行1つ＋コースの行（選べるコースごと）＋価格の行（コース×世代）＋設備の行（コース×機種）。', 'Khác 4 giá trị này thì lỗi. 1 plan = 1 dòng プラン + dòng コース (mỗi course) + dòng 価格 (course × thế hệ) + dòng 設備 (course × thiết bị).'], 'detail': ['決定 28-183 の形。列はこの行区分で使う列だけ読む（ほかは空欄）。', 'Theo 28-183. Mỗi loại dòng chỉ đọc các cột của nó (cột khác để trống).'], 'ex': ['プラン', 'Loại dòng (quyết định 28-183)'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01']}, {'no': '2.2', 'ja': 'プランID／仮キー', 'vi': 'Mã plan / khóa tạm', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '○', 'len': ['文字列 ES＋6桁、または仮キー（任意の文字・例：新規1）', 'ES + 6 chữ số, hoặc khóa tạm (chuỗi bất kỳ)'], 'valid': ['空欄はエラー。ES＋6桁は登録済みのプランだけ（なければエラー）。それ以外は仮キー＝新しいプラン（登録時に採番。同じ仮キーの行を1プランにまとめる）。', 'Trống thì lỗi. ES+6 số phải là plan đã có. Giá trị khác = khóa tạm = plan mới (cấp ID khi đăng ký; các dòng cùng khóa gộp thành 1 plan).'], 'detail': ['同じプランの行（プラン／コース／価格／設備）はすべて同じ値にする。', 'Mọi dòng của cùng plan ghi cùng giá trị.'], 'ex': ['ES000004', 'Plan đã có → ghi đè; 新規1 → plan mới'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01']}, {'no': '2.3', 'ja': 'コース', 'vi': 'Course', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '○', 'len': ['選択（スタンダード／ライト／ライト（自販機））', 'Chọn (standard / light / light máy bán hàng)'], 'valid': ['コース・価格・設備の行で必須。プランの行は空欄。「選べるコース」にないコースの行はエラー。（画面と同じチェック：1つ以上。選んだコースのタブだけ保存時にチェックする）', 'Bắt buộc ở dòng コース / 価格 / 設備; dòng プラン để trống. Course không có trong 選べるコース thì lỗi.'], 'detail': ['行区分がコース／価格／設備のときのコース。', 'Course của dòng コース / 価格 / 設備.'], 'ex': ['スタンダード', 'ライト = ESライト（冷蔵庫）'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01', 'E02']}, {'no': '2.4', 'ja': '公開用プラン名', 'vi': 'Tên plan (công khai)', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '－', 'len': ['文字列 60', 'Chuỗi 60'], 'valid': ['画面と同じチェック：必須。60文字以内。入力したとき管理用プラン名が空なら同じ値を入れる（REQ-PM-003）。', 'kiểm tra như màn hình: Bắt buộc. ≤60 ký tự. Nếu 管理用プラン名 trống thì tự điền cùng giá trị (REQ-PM-003).'], 'detail': ['画面の項目 2.2「公開用プラン名」と同じ。', 'Giống mục 2.2 「公開用プラン名」 trên màn hình.'], 'ex': ['100プラン', 'Tên hiện trên 法人Web (đăng ký, đổi plan) và hóa đơn'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01', 'E04', 'E13']}, {'no': '2.5', 'ja': '管理用プラン名', 'vi': 'Tên plan (nội bộ)', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '－', 'len': ['文字列 60', 'Chuỗi 60'], 'valid': ['画面の項目と同じチェック。', 'Kiểm tra như mục trên màn hình.'], 'detail': ['画面の項目 2.3「管理用プラン名」と同じ。', 'Giống mục 2.3 「管理用プラン名」 trên màn hình.'], 'ex': ['○○社専用150プラン', 'Tên dùng nội bộ, hiện ở danh sách và tìm kiếm'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01', 'E04', 'E13']}, {'no': '2.6', 'ja': '公開ステータス', 'vi': 'Trạng thái công khai', 'sel': '-', 'kind': 'select', 'trig': 'input', 'req': '－', 'len': ['選択（公開／非公開）', 'Chọn (công khai / không công khai)'], 'valid': ['画面の項目と同じチェック。', 'Kiểm tra như mục trên màn hình.'], 'detail': ['画面の項目 2.4「公開ステータス」と同じ。', 'Giống mục 2.4 「公開ステータス」 trên màn hình.'], 'ex': ['非公開', '非公開: không hiện ở 法人Web nhưng hợp đồng đang dùng vẫn giữ (vd ES30, plan riêng công ty)'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)']}, {'no': '2.7', 'ja': '月次提供上限の合計', 'vi': 'Tổng giới hạn suất/tháng', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '－', 'len': ['整数 1〜9,999（食）', 'Số nguyên 1–9.999 (suất)'], 'valid': ['画面と同じチェック：必須・1以上（E01・E14）。ESスタンダード：冷凍の上限＋冷蔵・常温の上限 ≧ この値（E40。2026/10/01 STEP5 Q5 で ＝ から訂正）、各温度帯の上限 ≦ この値（E41）。ESライト（冷蔵庫）・（自販機）：冷蔵・常温の上限 ＝ この値（E46）。', 'kiểm tra như màn hình: Bắt buộc, ≥1 (E01, E14). ESスタンダード: 冷凍上限 + 冷蔵・常温上限 ≥ giá trị này (E40), mỗi vùng ≤ giá trị này (E41). ESライト: 冷蔵・常温上限 = giá trị này (E46).'], 'detail': ['画面の項目 2.5「月次提供上限の合計」と同じ。', 'Giống mục 2.5 「月次提供上限の合計」 trên màn hình.'], 'ex': ['100', 'Số suất/tháng; bằng con số trong tên plan (100プラン = 100)'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01', 'E14']}, {'no': '2.8', 'ja': '基本比×倍', 'vi': 'Hệ số so với cơ bản', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '－', 'len': ['数値 小数1桁（0.1〜999.9）', 'Số thập phân 1 chữ số (0,1–999,9)'], 'valid': ['画面の項目と同じチェック。', 'Kiểm tra như mục trên màn hình.'], 'detail': ['画面の項目 2.6「基本比×倍」と同じ。', 'Giống mục 2.6 「基本比×倍」 trên màn hình.'], 'ex': ['2', 'Bội số so với 50 suất cơ bản (100プラン = 2)'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01', 'E14']}, {'no': '2.9', 'ja': '選べるコース', 'vi': 'Course chọn được', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '○', 'len': ['文字列（スタンダード／ライト／ライト（自販機）を「・」でつなぐ）', 'Chuỗi: các course nối bằng dấu chấm giữa'], 'valid': ['プランの行で必須。3つ以外の語はエラー。ここにないコースのコース・価格・設備の行はエラー。', 'Bắt buộc ở dòng プラン. Từ khác 3 course thì lỗi. Dòng của course không có ở đây thì lỗi.'], 'detail': ['画面の項目 2.7「コース」（チェック）と同じ。', 'Giống mục 2.7 コース (checkbox).'], 'ex': ['スタンダード・ライト・ライト（自販機）', 'Giống mục 2.7 コース trên màn hình (check)'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01']}, {'no': '2.10', 'ja': '利用人数目安', 'vi': 'Số người dùng ước tính (hiển thị)', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '－', 'len': ['文字列 20', 'Chuỗi 20'], 'valid': ['画面の項目と同じチェック。', 'Kiểm tra như mục trên màn hình.'], 'detail': ['画面の項目 2.8「利用人数目安（表示用）」と同じ。', 'Giống mục 2.8.'], 'ex': ['14名', 'Giống mục 2.8 利用人数目安（表示用）'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E04']}, {'no': '2.11', 'ja': '企業負担額（税込・1食）', 'vi': 'Công ty chịu (có thuế, 1 suất)', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '－', 'len': ['金額（整数・0〜999,999・円・税込）', 'Số tiền (nguyên, 0–999.999, có thuế)'], 'valid': ['画面の項目と同じチェック。', 'Kiểm tra như mục trên màn hình.'], 'detail': ['画面の項目 3.1「企業負担額（税込・1食）」と同じ。', 'Giống mục 3.1 「企業負担額（税込・1食）」 trên màn hình.'], 'ex': ['100', 'Mặc định 100 yên/suất có thuế (28-147)'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01', 'E14']}, {'no': '2.12', 'ja': '企業負担分の税率', 'vi': 'Thuế suất phần công ty chịu', 'sel': '-', 'kind': 'select', 'trig': 'input', 'req': '－', 'len': ['選択（税率マスタ）', 'Chọn (từ master thuế suất)'], 'valid': ['画面の項目と同じチェック。', 'Kiểm tra như mục trên màn hình.'], 'detail': ['画面の項目 3.2「企業負担分の税率」と同じ。', 'Giống mục 3.2 「企業負担分の税率」 trên màn hình.'], 'ex': ['軽減税率 8%', 'Chọn từ 税率マスタ (28-149); システム管理 thêm được thuế suất (台帳 E)'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E02']}, {'no': '2.13', 'ja': '基本料金の税率', 'vi': 'Thuế suất phí cơ bản', 'sel': '-', 'kind': 'select', 'trig': 'input', 'req': '－', 'len': ['選択（税率マスタ）', 'Chọn (từ master thuế suất)'], 'valid': ['画面の項目と同じチェック。', 'Kiểm tra như mục trên màn hình.'], 'detail': ['画面の項目 3.3「基本料金の税率」と同じ。', 'Giống mục 3.3 「基本料金の税率」 trên màn hình.'], 'ex': ['標準税率 10%', 'Chọn từ 税率マスタ (28-149)'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E02']}, {'no': '2.14', 'ja': '免責金額', 'vi': 'Số tiền miễn trừ', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '－', 'len': ['金額（整数・0〜999,999,999・円）', 'Số tiền (nguyên, 0–999.999.999)'], 'valid': ['画面の項目と同じチェック。', 'Kiểm tra như mục trên màn hình.'], 'detail': ['画面の項目 3.5「免責金額」と同じ。', 'Giống mục 3.5 「免責金額」 trên màn hình.'], 'ex': ['300', 'Mức chênh lệch tồn kho được bỏ qua (100プラン: 300 yên)'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01', 'E14']}, {'no': '2.15', 'ja': '冷凍_月次提供数_上限', 'vi': '冷凍 giới hạn trên/tháng', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '○', 'len': ['整数 0〜9,999（食）', 'Số nguyên 0–9.999 (suất)'], 'valid': ['スタンダードのコースの行で必須（ライトは空欄）。冷凍＋冷蔵常温の上限＝月次提供上限の合計。（画面と同じチェック：必須。≦ 月次提供上限の合計（E41）。冷凍＋冷蔵・常温の上限 ≧ 合計（E40））', 'Bắt buộc ở dòng コース của スタンダード (ライト để trống). 冷凍 + 冷蔵常温 = tổng.'], 'detail': ['画面の項目 5.1「冷凍_月次提供数_上限」と同じ。', 'Giống mục 5.1 「冷凍_月次提供数_上限」 trên màn hình.'], 'ex': ['20', 'Số suất 冷凍 tối đa/tháng; không dùng tỷ lệ % (28-155)'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01', 'E14']}, {'no': '2.16', 'ja': '冷凍_月次提供数_下限', 'vi': '冷凍 giới hạn dưới/tháng', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '○', 'len': ['整数 0〜9,999（食）', 'Số nguyên 0–9.999 (suất)'], 'valid': ['スタンダードのコースの行で必須。（画面と同じチェック：必須。≦ 冷凍の上限（E42））', 'Bắt buộc ở dòng コース của スタンダード.'], 'detail': ['画面の項目 5.2「冷凍_月次提供数_下限」と同じ。', 'Giống mục 5.2 「冷凍_月次提供数_下限」 trên màn hình.'], 'ex': ['1', 'Số suất 冷凍 tối thiểu/tháng'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01', 'E14']}, {'no': '2.17', 'ja': '冷蔵常温_月次提供数_上限', 'vi': '冷蔵・常温 giới hạn trên', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '○', 'len': ['整数 0〜9,999（食）', 'Số nguyên 0–9.999 (suất)'], 'valid': ['コースの行で必須。スタンダード：冷凍の上限＋冷蔵常温の上限＝月次提供上限の合計。ライト：冷蔵常温の上限＝合計。（画面と同じチェック：必須。≦ 合計（E41）。冷凍の上限と足して ≧ 合計（E40））', 'Bắt buộc ở dòng コース. スタンダード: 冷凍上限 + 冷蔵常温上限 = tổng; ライト: 冷蔵常温上限 = tổng.'], 'detail': ['画面の項目 5.3「冷蔵・常温_月次提供数_上限」と同じ。', 'Giống mục 5.3 「冷蔵・常温_月次提供数_上限」 trên màn hình.'], 'ex': ['80', 'Số suất 冷蔵・常温 tối đa/tháng'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01', 'E14']}, {'no': '2.18', 'ja': '冷蔵常温_月次提供数_下限', 'vi': '冷蔵・常温 giới hạn dưới', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '○', 'len': ['整数 0〜9,999（食）', 'Số nguyên 0–9.999 (suất)'], 'valid': ['コースの行で必須。上限を超えるとエラー。（画面と同じチェック：必須。≦ 冷蔵・常温の上限（E42））', 'Bắt buộc ở dòng コース. Lớn hơn 上限 thì lỗi.'], 'detail': ['画面の項目 5.4「冷蔵・常温_月次提供数_下限」と同じ。', 'Giống mục 5.4 「冷蔵・常温_月次提供数_下限」 trên màn hình.'], 'ex': ['0', 'Số suất 冷蔵・常温 tối thiểu/tháng'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01', 'E14']}, {'no': '2.19', 'ja': '冷蔵常温_標準の配送回数', 'vi': '冷蔵・常温 số lần giao chuẩn', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '○', 'len': ['整数 1〜99（回／月）', 'Số nguyên 1–99 (lần/tháng)'], 'valid': ['コースの行で必須。1 以上。（画面と同じチェック：必須・1以上（E43・28-156））', 'Bắt buộc ở dòng コース. ≥1.'], 'detail': ['画面の項目 5.5「冷蔵・常温_標準の配送回数」と同じ。', 'Giống mục 5.5 「冷蔵・常温_標準の配送回数」 trên màn hình.'], 'ex': ['2', 'Số lần giao 冷蔵/tháng trong plan (ES50=1, ES100〜600=2, ES650〜=4)'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01', 'E14']}, {'no': '2.20', 'ja': '冷凍_標準の配送回数', 'vi': '冷凍 số lần giao chuẩn', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '○', 'len': ['整数 1〜99（回／月）', 'Số nguyên 1–99 (lần/tháng)'], 'valid': ['スタンダードのコースの行で必須。1 以上。（画面と同じチェック：必須・1以上（E43））', 'Bắt buộc ở dòng コース của スタンダード. ≥1.'], 'detail': ['画面の項目 5.6「冷凍_標準の配送回数」と同じ。', 'Giống mục 5.6 「冷凍_標準の配送回数」 trên màn hình.'], 'ex': ['1', 'Số lần giao 冷凍/tháng. Ban đầu mọi plan = 1 (hong 2026/10/05), 運営 sửa sau khi có bảng 冷凍庫'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01', 'E14']}, {'no': '2.21', 'ja': '残りわずか率', 'vi': 'Tỷ lệ sắp hết', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '○', 'len': ['整数 0〜100（％）', 'Số nguyên 0〜100 (%)'], 'valid': ['コースの行で必須。', 'Bắt buộc ở dòng コース.'], 'detail': ['画面のコースのタブの「残りわずか率」と同じ。', 'Giống mục 残りわずか率 trong tab course.'], 'ex': ['20', 'Giống mục 残りわずか率 trong tab course'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01']}, {'no': '2.22', 'ja': '相談して決める', 'vi': 'Quyết định qua tư vấn', 'sel': '-', 'kind': 'select', 'trig': 'input', 'req': '○', 'len': ['選択（する／しない）', 'Chọn (có / không)'], 'valid': ['コースの行で必須。', 'Bắt buộc ở dòng コース.'], 'detail': ['画面の項目 7.1「相談して決める」と同じ。', 'Giống mục 7.1 「相談して決める」 trên màn hình.'], 'ex': ['しない', 'Giống mục 相談して決める trong tab course'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01']}, {'no': '2.23', 'ja': 'スタンダードと同じ構成にする', 'vi': 'Giống cấu hình Standard', 'sel': '-', 'kind': 'select', 'trig': 'input', 'req': '○', 'len': ['選択（する／しない）', 'Chọn (có / không)'], 'valid': ['ライトのコースの行で必須。「する」はスタンダードのコースがあるプランだけ。', 'Bắt buộc ở dòng コース của ライト. 「する」 chỉ khi plan có スタンダード.'], 'detail': ['画面の項目 11.1「スタンダードと同じ構成にする」と同じ。', 'Giống mục 11.1 「スタンダードと同じ構成にする」 trên màn hình.'], 'ex': ['しない', 'Giống mục trong tab ESライト'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01']}, {'no': '2.24', 'ja': 'コースの備考', 'vi': 'Ghi chú', 'sel': '-', 'kind': 'textarea', 'trig': 'input', 'req': '－', 'len': ['文字列 200', 'Chuỗi 200'], 'valid': ['画面の項目と同じチェック。', 'Kiểm tra như mục trên màn hình.'], 'detail': ['画面のコースのタブの「備考」と同じ。', 'Giống mục 備考 trong tab course.'], 'ex': ['（空欄）', 'Ghi chú của course'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E04', 'E13']}, {'no': '2.25', 'ja': '価格プラン', 'vi': 'Tên thế hệ giá', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '○', 'len': ['文字列 30（世代名）', 'Chuỗi 30 (tên thế hệ)'], 'valid': ['価格の行で必須。同じコースに同じ世代名の行が2つあるとエラー。登録済みの世代名なら上書き（子契約が使っている世代は価格・開始期間を変えられない）、なければ新しい世代。', 'Bắt buộc ở dòng 価格. Trùng tên thế hệ trong cùng course thì lỗi. Tên đã có → ghi đè (thế hệ đang dùng không đổi được giá / ngày bắt đầu); chưa có → thế hệ mới.'], 'detail': ['画面の価格プランの表の「価格プラン」と同じ。', 'Giống cột 価格プラン của bảng giá.'], 'ex': ['改訂第三回目', 'Tên thế hệ giá (mục 9.x 価格プラン)'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01', 'E04']}, {'no': '2.26', 'ja': '開始期間', 'vi': 'Ngày bắt đầu', 'sel': '-', 'kind': 'date', 'trig': 'input', 'req': '○', 'len': ['日付 yyyy-mm-dd', 'yyyy-mm-dd'], 'valid': ['価格の行で必須（削除＝1 の行は不要）。参考の項目（28-181）。（画面と同じチェック：前の行の終了期間より後（期間を重ねない・E48））', 'Bắt buộc ở dòng 価格 (trừ dòng 削除=1). Mục tham khảo (28-181).'], 'detail': ['画面の価格プランの表の「開始期間」と同じ（参考）。', 'Giống cột 開始期間 (tham khảo).'], 'ex': ['2026-04-01', 'Ngày bắt đầu (tham khảo)'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01']}, {'no': '2.27', 'ja': '終了期間', 'vi': 'Ngày kết thúc', 'sel': '-', 'kind': 'date', 'trig': 'input', 'req': '－', 'len': ['日付 yyyy-mm-dd', 'yyyy-mm-dd'], 'valid': ['任意。開始期間より前はエラー。参考の項目。', 'Tùy chọn. Trước 開始期間 thì lỗi. Tham khảo.'], 'detail': ['画面の価格プランの表の「終了期間」と同じ（参考）。', 'Giống cột 終了期間 (tham khảo).'], 'ex': ['（空欄）', 'Trống = không có ngày kết thúc'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E08']}, {'no': '2.28', 'ja': '価格（COOL便）', 'vi': 'Giá (COOL便)', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '○', 'len': ['金額（整数・税抜・0〜999,999,999）', 'Số tiền (nguyên, chưa thuế)'], 'valid': ['価格の行で必須（ライト（自販機）は空欄）。企業負担分（税抜）より小さいとエラー。子契約が使っている世代は変えられない。（画面と同じチェック：半角数字。下限・上限のどちらか一方だけでもよい）', 'Bắt buộc ở dòng 価格 (ライト（自販機） để trống). Nhỏ hơn phần công ty chịu (chưa thuế) thì lỗi. Thế hệ đang dùng không đổi được.'], 'detail': ['画面の価格プランの表の「価格（COOL便）」と同じ。', 'Giống cột 価格（COOL便）.'], 'ex': ['49500', 'Giá COOL便 chưa thuế'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01', 'E04']}, {'no': '2.29', 'ja': '価格（ES配送便）', 'vi': 'Giá (ES配送便)', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '○', 'len': ['金額（整数・税抜・0〜999,999,999）', 'Số tiền (nguyên, chưa thuế)'], 'valid': ['価格の行で必須。企業負担分（税抜）より小さいとエラー。子契約が使っている世代は変えられない。（画面と同じチェック：半角数字。下限・上限のどちらか一方だけでもよい）', 'Bắt buộc ở dòng 価格. Nhỏ hơn phần công ty chịu thì lỗi. Thế hệ đang dùng không đổi được.'], 'detail': ['画面の価格プランの表の「価格（ES配送便）」と同じ。', 'Giống cột 価格（ES配送便）.'], 'ex': ['46000', 'Giá ES配送便 chưa thuế'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01', 'E04']}, {'no': '2.30', 'ja': '公開用', 'vi': 'Công khai', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '－', 'len': ['1／0', '1 / 0'], 'valid': ['価格の行。コースごとに 1 の行を1つだけ（0つ・2つ以上はエラー）。（画面と同じチェック：コースごとに1行だけ（E45））', 'Dòng 価格. Mỗi course đúng 1 dòng = 1 (0 hoặc ≥2 thì lỗi).'], 'detail': ['画面の価格プランの表の「公開用」と同じ。', 'Giống cột 公開用.'], 'ex': ['1', '1 = thế hệ công khai (dùng cho hợp đồng mới)'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': []}, {'no': '2.31', 'ja': '削除', 'vi': 'Xóa', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '－', 'len': ['1（空欄＝削除しない）', '1 (trống = không xóa)'], 'valid': ['価格の行。1 のとき、その世代を削除する（登録済みで、子契約に使われていない世代だけ。新しいプランでは不可）。', 'Dòng 価格. =1 thì xóa thế hệ đó (chỉ thế hệ đã có và chưa hợp đồng nào dùng; plan mới không dùng được).'], 'detail': ['世代の削除は CSV のこの列だけ（画面の表では削除ボタン）。', 'Xóa thế hệ bằng cột này (trên màn hình là nút xóa).'], 'ex': ['（空欄）', 'Trống = không xóa'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': []}, {'no': '2.32', 'ja': 'パターン', 'vi': 'Pattern', 'sel': '-', 'kind': 'select', 'trig': 'input', 'req': '○', 'len': ['文字列（標準／そのほかのパターン名）', 'Chuỗi (tiêu chuẩn / tên pattern khác)'], 'valid': ['設備の行で必須。コースごとに「標準」の行が1つ以上必要。', 'Bắt buộc ở dòng 設備. Mỗi course cần ≥1 dòng 標準.'], 'detail': ['画面の標準貸出設備の表の「パターン」と同じ。設備の行はプラン×コースごとに全部入れ替える。', 'Giống cột パターン. Dòng 設備 thay toàn bộ theo plan × course.'], 'ex': ['標準', 'Giống cột パターン của bảng 標準貸出設備'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01']}, {'no': '2.33', 'ja': '機種ID', 'vi': 'Thiết bị', 'sel': '-', 'kind': 'select', 'trig': 'input', 'req': '○', 'len': ['文字列 2文字＋6桁（RF／FZ／VM／BX）', '2 chữ + 6 số (RF / FZ / VM / BX)'], 'valid': ['設備の行で必須。機種マスタ（冷蔵庫・冷凍庫・自販機・資材ボックス）にない ID はエラー。ライト（自販機）に RF／FZ、ほかのコースに VM はエラー。ライト（自販機）には VM の行が必要。', 'Bắt buộc ở dòng 設備. ID không có trong 機種マスタ thì lỗi. ライト（自販機） không nhận RF/FZ; course khác không nhận VM; ライト（自販機） cần ≥1 dòng VM.'], 'detail': ['画面の標準貸出設備の表の「機種」と同じ（CSV は ID で書く）。', 'Giống cột 機種 (CSV ghi ID).'], 'ex': ['RF000001', 'Giống cột 機種 của bảng 標準貸出設備 (ghi ID)'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01', 'E02']}, {'no': '2.34', 'ja': '台数', 'vi': 'Số lượng', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '○', 'len': ['整数 1〜99', 'Số nguyên 1〜99'], 'valid': ['設備の行で必須。1 未満はエラー。', 'Bắt buộc ở dòng 設備. <1 thì lỗi.'], 'detail': ['画面の標準貸出設備の表の「台数」と同じ。', 'Giống cột 台数.'], 'ex': ['1', 'Số máy'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01', 'E14']}, {'no': '2.35', 'ja': '設備の備考', 'vi': 'Ghi chú', 'sel': '-', 'kind': 'textarea', 'trig': 'input', 'req': '－', 'len': ['文字列 100', 'Chuỗi 100'], 'valid': ['画面の項目と同じチェック。', 'Kiểm tra như mục trên màn hình.'], 'detail': ['画面の標準貸出設備の表の「備考」と同じ。', 'Giống cột 備考 của bảng 標準貸出設備.'], 'ex': ['（空欄）', 'Ghi chú của dòng thiết bị'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E04', 'E13']}, {'no': '3', 'ja': 'ファイルを選ぶ（ステップ1）', 'vi': 'Chọn tệp (bước 1)', 'sel': '#sec-csv', 'kind': 'area', 'trig': 'view', 'pattern': 'P-CSV'}, {'no': '3.1', 'ja': '手順', 'vi': 'Các bước', 'sel': '.steps', 'kind': 'label', 'trig': 'view', 'detail': ['1 ファイルを選ぶ → 2 確認・登録（カードの外・中央。アンケートの CSV取込と同じ）。今の手順を濃く、済んだ手順を緑に。', '1 chọn tệp → 2 xác nhận・đăng ký (ngoài card, giữa trang; giống CSV取込 của アンケート). Bước hiện tại tô đậm, bước xong màu xanh.']}, {'no': '3.2', 'ja': '説明', 'vi': 'Giải thích', 'sel': '#sec-csv .hint', 'kind': 'label', 'trig': 'view', 'detail': ['取込の決まり（上書き／新規・UTF-8・5,000行・エラーの行は取り込まずほかの行を登録）。', 'Quy tắc nhập (ghi đè / mới, UTF-8, 5.000 dòng, dòng lỗi bỏ qua, dòng khác vẫn đăng ký).']}, {'no': '3.3', 'ja': 'ファイルを選ぶ', 'vi': 'Chọn tệp', 'sel': '#sec-csv button.out::ファイルを選ぶ', 'kind': 'file', 'trig': 'input', 'req': '○', 'len': ['CSV（UTF-8・.csv）1ファイル', '1 tệp CSV (UTF-8, .csv)'], 'init': ['なし', 'Không'], 'ex': ['プランマスタ_20261005.csv', 'Tệp cùng cột với CSV出力 (2.1〜)'], 'err': ['E34'], 'detail': ['ファイルを選ぶか、枠にドラッグ＆ドロップ。選ぶとすぐに確かめて（何も保存しない）ステップ2へ。.csv 以外・UTF-8 以外・読めないファイル・見出しの列が 2.1〜 と違うファイルはその場でエラーの帯。', 'Chọn tệp hoặc kéo thả vào khung. Chọn xong kiểm tra ngay (không lưu) và sang bước 2. Không phải .csv / không phải UTF-8 / không đọc được / tiêu đề cột khác 2.1〜 thì hiện dải lỗi.']}, {'no': '3.4', 'ja': 'ドラッグ＆ドロップの枠', 'vi': 'Khung kéo thả', 'sel': '#sec-csv button.out::ファイルを選ぶ^2', 'kind': 'area', 'trig': 'view', 'detail': ['ファイルを重ねると枠が青くなる。選んだファイル名を下に出す。', 'Kéo tệp lên thì khung chuyển xanh. Tên tệp đã chọn hiện phía dưới.']}]},
    {'id': '022', 'code': 'AW_PLAN_004', 'state': ['確認・登録（ステップ2）', 'Xác nhận, đăng ký (bước 2)'], 'url': '/ops/masters/plans/import', 'setup': 'const sleep=ms=>new Promise(r=>setTimeout(r,ms));const q=s=>document.querySelector(s);const res=await fetch(\'/api/domain/csv/template\',{method:\'POST\',credentials:\'include\',headers:{\'Content-Type\':\'application/json\',\'x-es-site\':\'ops\'},body:JSON.stringify({args:{entity:\'plans\',scope:{site:\'ops\'}}})});const t=await res.json();const esc=v=>\'\\"\'+String(v??\'\').replace(/\\"/g,\'\\"\\"\')+\'\\"\';const rows=[t.head,...t.rows];const bad=t.rows[0].slice();bad[0]=\'XX999999\';rows.push(bad);const text=\'\\ufeff\'+rows.map(r=>r.map(esc).join(\',\')).join(\'\\r\\n\');const inp=q(\'#sec-csv input[type=file]\');const dt=new DataTransfer();dt.items.add(new File([text],\'取込テスト.csv\',{type:\'text/csv\'}));inp.files=dt.files;inp.dispatchEvent(new Event(\'change\',{bubbles:true}));await sleep(2500);window.scrollTo(0,q(\'#sec-csv\').offsetTop-80);', 'full': True, 'wait': 600, 'note': ['ファイルを選んだ直後。見本は CSV出力（ひな形）のファイルに、ひな形の新規の行と、キーが誤りの行を1つ足したもの（エラーの行の見本）。', 'Ngay sau khi chọn tệp. Mẫu = tệp CSV出力 (mẫu) + dòng mới của mẫu + 1 dòng khóa sai (mẫu dòng lỗi).'], 'items': [{'no': '4', 'ja': '確認・登録（ステップ2）', 'vi': 'Xác nhận, đăng ký (bước 2)', 'sel': '#sec-csv', 'kind': 'area', 'trig': 'show', 'pattern': 'P-CSV', 'err': ['S03', 'E34'], 'detail': ['ファイル名・件数と、行ごとの結果。「登録」でエラー以外の行を登録する（エラーの行は取り込まない・hong 2026/10/05）。', 'Tên tệp, số dòng và kết quả từng dòng. 登録 thì đăng ký các dòng không lỗi (dòng lỗi bỏ qua, hong 2026/10/05).']}, {'no': '4.1', 'ja': '件数', 'vi': 'Số lượng', 'sel': '#sec-csv .badge', 'kind': 'label', 'trig': 'view', 'detail': ['新規／更新／変更なし／エラー の件数（バッジ）。', 'Số dòng 新規 / 更新 / 変更なし / エラー (badge).']}, {'no': '4.2', 'ja': 'エラーの行', 'vi': 'Dòng lỗi', 'sel': '#sec-csv .notice.ng', 'kind': 'label', 'trig': 'show', 'cond': ['エラーの行があるとき', 'Khi có dòng lỗi'], 'detail': ['「エラーの行 n件は取り込みません…」と、行番号・キー・列名・内容の表（多いときは先頭だけ。全部はエラー一覧CSV）。内容は 2.1〜 のチェックの文言。', '「エラーの行 n件は取り込みません…」 + bảng số dòng / khóa / cột / nội dung (nhiều thì chỉ phần đầu; đủ ở エラー一覧CSV). Nội dung = câu kiểm tra của 2.1〜.']}, {'no': '4.3', 'ja': 'エラー一覧CSV', 'vi': 'Xuất CSV lỗi', 'sel': '#sec-csv button::エラー一覧CSV', 'kind': 'button', 'trig': 'click', 'detail': ['エラーの行だけを、元の列＋エラーの内容で書き出す（直して選び直すため）。', 'Xuất riêng các dòng lỗi với cột gốc + nội dung lỗi (để sửa rồi chọn lại).']}, {'no': '4.4', 'ja': '登録する内容（前 → 後）', 'vi': 'Nội dung sẽ đăng ký (trước → sau)', 'sel': '#sec-csv b::登録する内容', 'kind': 'label', 'trig': 'view', 'cond': ['新規・更新の行があるとき', 'Khi có dòng 新規 / 更新'], 'detail': ['行番号・区分（新規／更新）・キー・名前・変わる項目（前 → 後）。', 'Số dòng, loại (新規 / 更新), khóa, tên, các mục thay đổi (trước → sau).']}, {'no': '4.5', 'ja': 'ファイルを選び直す', 'vi': 'Chọn lại tệp', 'sel': '.csvph .btns button.out::ファイルを選び直す', 'kind': 'button', 'trig': 'click', 'detail': ['ステップ1に戻る。何も登録しない。', 'Về bước 1. Không đăng ký gì.']}, {'no': '4.6', 'ja': '登録', 'vi': 'Đăng ký', 'sel': '.csvph .btns button.pri', 'kind': 'button', 'trig': 'click', 'err': ['S03', 'E34'], 'cond': ['新規か更新の行が1つ以上あり、ファイル全体のエラーがないとき。警告（金額の変更など）があるときは「警告を確認しました」にチェックするまで押せない', 'Có ≥1 dòng 新規 / 更新 và không lỗi cả tệp. Có cảnh báo (vd đổi tiền) thì phải check 「警告を確認しました」 mới nhấn được'], 'detail': ['エラー以外の行を登録し、S03 のトースト（新規 n件・更新 n件）、一覧へ戻る。100件を超えるときは裏で進めて進み具合を出す。取込の記録と、行ごとの変更履歴「CSV取込で更新」を残す。', 'Đăng ký các dòng không lỗi, toast S03 (新規 n, 更新 n), về danh sách. Quá 100 dòng thì chạy nền và hiện tiến độ. Ghi lịch sử nhập và lịch sử từng bản ghi 「CSV取込で更新」.']}]},
]

# ================================================================ CSVテンプレートのシート（Excel・HTML に1シート。各 CSV取込の画面の 2.x から scratchpad/gen_csv_sheet.py で作る。hong 2026/10/05）
SHEETS = [{'name': ['CSVテンプレート（マスタ）', 'CSV template (master)'], 'note': ['マスタの CSV取込で使うファイルの列の定義（1行目＝見出し。列の順はこの表のとおり＝CSV出力と同じ）。各表の「必須」「形式・長さ」「値の決まり」は入力画面の項目と同じチェック。テンプレートの写しは docs/05_画面設計書/CSVテンプレート/。画面の CSV取込（AW_*_004／005）の 2.x と同じ内容を1シートにまとめたもの（hong 2026/10/05）。', 'Định nghĩa cột của tệp dùng cho CSV取込 của master (dòng 1 = tiêu đề; thứ tự cột theo bảng = giống CSV出力). 必須 / 形式 / 値の決まり giống mục nhập trên màn hình. Bản mẫu: docs/05_画面設計書/CSVテンプレート/. Gom nội dung 2.x của các màn CSV取込 (AW_*_004/005) vào 1 sheet (hong 2026/10/05).'], 'tables': [{'title': ['AW_PLAN_004 プランマスタ CSV取込：plans.csv（35列）', 'AW_PLAN_004 Nhập CSV plan master: plans.csv (35 cột)'], 'note': ['取り込むファイルの列の定義（1行目の見出し・この順。CSV出力と同じ列）。テンプレートの写しは docs/05_画面設計書/CSVテンプレート/plans.csv。キー＝プランID／仮キー（空欄＝新規・採番）。UTF-8（BOM 可）・5,000行まで。空欄のセルは今の値のまま、「-」で消す。2.1〜 の必須・長さ・チェックは入力画面の項目と同じ（違うところだけ書く）。画面には出さない（hong 2026/10/05）。', 'Định nghĩa cột của tệp nhập (dòng 1 = tiêu đề, theo thứ tự này; cùng cột với CSV出力). Bản mẫu: docs/05_画面設計書/CSVテンプレート/plans.csv. Khóa = プランID／仮キー (trống = mới, cấp ID). UTF-8 (có BOM được), tối đa 5.000 dòng. Ô trống giữ giá trị cũ, "-" để xóa. Bắt buộc / độ dài / kiểm tra của 2.1〜 giống mục nhập trên màn hình (chỉ ghi chỗ khác). Không hiện trên màn hình (hong 2026/10/05).'], 'head': [[['列', 'Cột'], 5], [['列名（1行目の見出し）', 'Tên cột (dòng tiêu đề)'], 26], [['必須', 'Bắt buộc'], 8], [['形式・長さ', 'Định dạng, độ dài'], 24], [['値の決まり（チェック）', 'Quy tắc (kiểm tra)'], 48], [['データ例', 'Ví dụ'], 18], [['説明', 'Giải thích'], 40]], 'rows': [['1', ['行区分', 'Loại dòng'], ['○', 'Bắt buộc'], ['選択（プラン／コース／価格／設備）', 'Chọn (plan / course / giá / thiết bị)'], ['この4つ以外はエラー。1プラン＝プランの行1つ＋コースの行（選べるコースごと）＋価格の行（コース×世代）＋設備の行（コース×機種）。', 'Khác 4 giá trị này thì lỗi. 1 plan = 1 dòng プラン + dòng コース (mỗi course) + dòng 価格 (course × thế hệ) + dòng 設備 (course × thiết bị).'], ['プラン', 'プラン'], ['決定 28-183 の形。列はこの行区分で使う列だけ読む（ほかは空欄）。', 'Theo 28-183. Mỗi loại dòng chỉ đọc các cột của nó (cột khác để trống).']], ['2', ['プランID／仮キー', 'Mã plan / khóa tạm'], ['○', 'Bắt buộc'], ['文字列 ES＋6桁、または仮キー（任意の文字・例：新規1）', 'ES + 6 chữ số, hoặc khóa tạm (chuỗi bất kỳ)'], ['空欄はエラー。ES＋6桁は登録済みのプランだけ（なければエラー）。それ以外は仮キー＝新しいプラン（登録時に採番。同じ仮キーの行を1プランにまとめる）。', 'Trống thì lỗi. ES+6 số phải là plan đã có. Giá trị khác = khóa tạm = plan mới (cấp ID khi đăng ký; các dòng cùng khóa gộp thành 1 plan).'], ['ES000004', 'ES000004'], ['同じプランの行（プラン／コース／価格／設備）はすべて同じ値にする。', 'Mọi dòng của cùng plan ghi cùng giá trị.']], ['3', ['コース', 'Course'], ['○', 'Bắt buộc'], ['選択（スタンダード／ライト／ライト（自販機））', 'Chọn (standard / light / light máy bán hàng)'], ['コース・価格・設備の行で必須。プランの行は空欄。「選べるコース」にないコースの行はエラー。（画面と同じチェック：1つ以上。選んだコースのタブだけ保存時にチェックする）', 'Bắt buộc ở dòng コース / 価格 / 設備; dòng プラン để trống. Course không có trong 選べるコース thì lỗi.'], ['スタンダード', 'スタンダード'], ['行区分がコース／価格／設備のときのコース。', 'Course của dòng コース / 価格 / 設備.']], ['4', ['公開用プラン名', 'Tên plan (công khai)'], ['－', 'Không'], ['文字列 60', 'Chuỗi 60'], ['画面と同じチェック：必須。60文字以内。入力したとき管理用プラン名が空なら同じ値を入れる（REQ-PM-003）。', 'kiểm tra như màn hình: Bắt buộc. ≤60 ký tự. Nếu 管理用プラン名 trống thì tự điền cùng giá trị (REQ-PM-003).'], ['100プラン', '100プラン'], ['画面の項目 2.2「公開用プラン名」と同じ。', 'Giống mục 2.2 「公開用プラン名」 trên màn hình.']], ['5', ['管理用プラン名', 'Tên plan (nội bộ)'], ['－', 'Không'], ['文字列 60', 'Chuỗi 60'], ['画面の項目と同じチェック。', 'Kiểm tra như mục trên màn hình.'], ['○○社専用150プラン', '○○社専用150プラン'], ['画面の項目 2.3「管理用プラン名」と同じ。', 'Giống mục 2.3 「管理用プラン名」 trên màn hình.']], ['6', ['公開ステータス', 'Trạng thái công khai'], ['－', 'Không'], ['選択（公開／非公開）', 'Chọn (công khai / không công khai)'], ['画面の項目と同じチェック。', 'Kiểm tra như mục trên màn hình.'], ['非公開', '非公開'], ['画面の項目 2.4「公開ステータス」と同じ。', 'Giống mục 2.4 「公開ステータス」 trên màn hình.']], ['7', ['月次提供上限の合計', 'Tổng giới hạn suất/tháng'], ['－', 'Không'], ['整数 1〜9,999（食）', 'Số nguyên 1–9.999 (suất)'], ['画面と同じチェック：必須・1以上（E01・E14）。ESスタンダード：冷凍の上限＋冷蔵・常温の上限 ≧ この値（E40。2026/10/01 STEP5 Q5 で ＝ から訂正）、各温度帯の上限 ≦ この値（E41）。ESライト（冷蔵庫）・（自販機）：冷蔵・常温の上限 ＝ この値（E46）。', 'kiểm tra như màn hình: Bắt buộc, ≥1 (E01, E14). ESスタンダード: 冷凍上限 + 冷蔵・常温上限 ≥ giá trị này (E40), mỗi vùng ≤ giá trị này (E41). ESライト: 冷蔵・常温上限 = giá trị này (E46).'], ['100', '100'], ['画面の項目 2.5「月次提供上限の合計」と同じ。', 'Giống mục 2.5 「月次提供上限の合計」 trên màn hình.']], ['8', ['基本比×倍', 'Hệ số so với cơ bản'], ['－', 'Không'], ['数値 小数1桁（0.1〜999.9）', 'Số thập phân 1 chữ số (0,1–999,9)'], ['画面の項目と同じチェック。', 'Kiểm tra như mục trên màn hình.'], ['2', '2'], ['画面の項目 2.6「基本比×倍」と同じ。', 'Giống mục 2.6 「基本比×倍」 trên màn hình.']], ['9', ['選べるコース', 'Course chọn được'], ['○', 'Bắt buộc'], ['文字列（スタンダード／ライト／ライト（自販機）を「・」でつなぐ）', 'Chuỗi: các course nối bằng dấu chấm giữa'], ['プランの行で必須。3つ以外の語はエラー。ここにないコースのコース・価格・設備の行はエラー。', 'Bắt buộc ở dòng プラン. Từ khác 3 course thì lỗi. Dòng của course không có ở đây thì lỗi.'], ['スタンダード・ライト・ライト（自販機）', 'スタンダード・ライト・ライト（自販機）'], ['画面の項目 2.7「コース」（チェック）と同じ。', 'Giống mục 2.7 コース (checkbox).']], ['10', ['利用人数目安', 'Số người dùng ước tính (hiển thị)'], ['－', 'Không'], ['文字列 20', 'Chuỗi 20'], ['画面の項目と同じチェック。', 'Kiểm tra như mục trên màn hình.'], ['14名', '14名'], ['画面の項目 2.8「利用人数目安（表示用）」と同じ。', 'Giống mục 2.8.']], ['11', ['企業負担額（税込・1食）', 'Công ty chịu (có thuế, 1 suất)'], ['－', 'Không'], ['金額（整数・0〜999,999・円・税込）', 'Số tiền (nguyên, 0–999.999, có thuế)'], ['画面の項目と同じチェック。', 'Kiểm tra như mục trên màn hình.'], ['100', '100'], ['画面の項目 3.1「企業負担額（税込・1食）」と同じ。', 'Giống mục 3.1 「企業負担額（税込・1食）」 trên màn hình.']], ['12', ['企業負担分の税率', 'Thuế suất phần công ty chịu'], ['－', 'Không'], ['選択（税率マスタ）', 'Chọn (từ master thuế suất)'], ['画面の項目と同じチェック。', 'Kiểm tra như mục trên màn hình.'], ['軽減税率 8%', '軽減税率 8%'], ['画面の項目 3.2「企業負担分の税率」と同じ。', 'Giống mục 3.2 「企業負担分の税率」 trên màn hình.']], ['13', ['基本料金の税率', 'Thuế suất phí cơ bản'], ['－', 'Không'], ['選択（税率マスタ）', 'Chọn (từ master thuế suất)'], ['画面の項目と同じチェック。', 'Kiểm tra như mục trên màn hình.'], ['標準税率 10%', '標準税率 10%'], ['画面の項目 3.3「基本料金の税率」と同じ。', 'Giống mục 3.3 「基本料金の税率」 trên màn hình.']], ['14', ['免責金額', 'Số tiền miễn trừ'], ['－', 'Không'], ['金額（整数・0〜999,999,999・円）', 'Số tiền (nguyên, 0–999.999.999)'], ['画面の項目と同じチェック。', 'Kiểm tra như mục trên màn hình.'], ['300', '300'], ['画面の項目 3.5「免責金額」と同じ。', 'Giống mục 3.5 「免責金額」 trên màn hình.']], ['15', ['冷凍_月次提供数_上限', '冷凍 giới hạn trên/tháng'], ['○', 'Bắt buộc'], ['整数 0〜9,999（食）', 'Số nguyên 0–9.999 (suất)'], ['スタンダードのコースの行で必須（ライトは空欄）。冷凍＋冷蔵常温の上限＝月次提供上限の合計。（画面と同じチェック：必須。≦ 月次提供上限の合計（E41）。冷凍＋冷蔵・常温の上限 ≧ 合計（E40））', 'Bắt buộc ở dòng コース của スタンダード (ライト để trống). 冷凍 + 冷蔵常温 = tổng.'], ['20', '20'], ['画面の項目 5.1「冷凍_月次提供数_上限」と同じ。', 'Giống mục 5.1 「冷凍_月次提供数_上限」 trên màn hình.']], ['16', ['冷凍_月次提供数_下限', '冷凍 giới hạn dưới/tháng'], ['○', 'Bắt buộc'], ['整数 0〜9,999（食）', 'Số nguyên 0–9.999 (suất)'], ['スタンダードのコースの行で必須。（画面と同じチェック：必須。≦ 冷凍の上限（E42））', 'Bắt buộc ở dòng コース của スタンダード.'], ['1', '1'], ['画面の項目 5.2「冷凍_月次提供数_下限」と同じ。', 'Giống mục 5.2 「冷凍_月次提供数_下限」 trên màn hình.']], ['17', ['冷蔵常温_月次提供数_上限', '冷蔵・常温 giới hạn trên'], ['○', 'Bắt buộc'], ['整数 0〜9,999（食）', 'Số nguyên 0–9.999 (suất)'], ['コースの行で必須。スタンダード：冷凍の上限＋冷蔵常温の上限＝月次提供上限の合計。ライト：冷蔵常温の上限＝合計。（画面と同じチェック：必須。≦ 合計（E41）。冷凍の上限と足して ≧ 合計（E40））', 'Bắt buộc ở dòng コース. スタンダード: 冷凍上限 + 冷蔵常温上限 = tổng; ライト: 冷蔵常温上限 = tổng.'], ['80', '80'], ['画面の項目 5.3「冷蔵・常温_月次提供数_上限」と同じ。', 'Giống mục 5.3 「冷蔵・常温_月次提供数_上限」 trên màn hình.']], ['18', ['冷蔵常温_月次提供数_下限', '冷蔵・常温 giới hạn dưới'], ['○', 'Bắt buộc'], ['整数 0〜9,999（食）', 'Số nguyên 0–9.999 (suất)'], ['コースの行で必須。上限を超えるとエラー。（画面と同じチェック：必須。≦ 冷蔵・常温の上限（E42））', 'Bắt buộc ở dòng コース. Lớn hơn 上限 thì lỗi.'], ['0', '0'], ['画面の項目 5.4「冷蔵・常温_月次提供数_下限」と同じ。', 'Giống mục 5.4 「冷蔵・常温_月次提供数_下限」 trên màn hình.']], ['19', ['冷蔵常温_標準の配送回数', '冷蔵・常温 số lần giao chuẩn'], ['○', 'Bắt buộc'], ['整数 1〜99（回／月）', 'Số nguyên 1–99 (lần/tháng)'], ['コースの行で必須。1 以上。（画面と同じチェック：必須・1以上（E43・28-156））', 'Bắt buộc ở dòng コース. ≥1.'], ['2', '2'], ['画面の項目 5.5「冷蔵・常温_標準の配送回数」と同じ。', 'Giống mục 5.5 「冷蔵・常温_標準の配送回数」 trên màn hình.']], ['20', ['冷凍_標準の配送回数', '冷凍 số lần giao chuẩn'], ['○', 'Bắt buộc'], ['整数 1〜99（回／月）', 'Số nguyên 1–99 (lần/tháng)'], ['スタンダードのコースの行で必須。1 以上。（画面と同じチェック：必須・1以上（E43））', 'Bắt buộc ở dòng コース của スタンダード. ≥1.'], ['1', '1'], ['画面の項目 5.6「冷凍_標準の配送回数」と同じ。', 'Giống mục 5.6 「冷凍_標準の配送回数」 trên màn hình.']], ['21', ['残りわずか率', 'Tỷ lệ sắp hết'], ['○', 'Bắt buộc'], ['整数 0〜100（％）', 'Số nguyên 0〜100 (%)'], ['コースの行で必須。', 'Bắt buộc ở dòng コース.'], ['20', '20'], ['画面のコースのタブの「残りわずか率」と同じ。', 'Giống mục 残りわずか率 trong tab course.']], ['22', ['相談して決める', 'Quyết định qua tư vấn'], ['○', 'Bắt buộc'], ['選択（する／しない）', 'Chọn (có / không)'], ['コースの行で必須。', 'Bắt buộc ở dòng コース.'], ['しない', 'しない'], ['画面の項目 7.1「相談して決める」と同じ。', 'Giống mục 7.1 「相談して決める」 trên màn hình.']], ['23', ['スタンダードと同じ構成にする', 'Giống cấu hình Standard'], ['○', 'Bắt buộc'], ['選択（する／しない）', 'Chọn (có / không)'], ['ライトのコースの行で必須。「する」はスタンダードのコースがあるプランだけ。', 'Bắt buộc ở dòng コース của ライト. 「する」 chỉ khi plan có スタンダード.'], ['しない', 'しない'], ['画面の項目 11.1「スタンダードと同じ構成にする」と同じ。', 'Giống mục 11.1 「スタンダードと同じ構成にする」 trên màn hình.']], ['24', ['コースの備考', 'Ghi chú'], ['－', 'Không'], ['文字列 200', 'Chuỗi 200'], ['画面の項目と同じチェック。', 'Kiểm tra như mục trên màn hình.'], ['（空欄）', '（空欄）'], ['画面のコースのタブの「備考」と同じ。', 'Giống mục 備考 trong tab course.']], ['25', ['価格プラン', 'Tên thế hệ giá'], ['○', 'Bắt buộc'], ['文字列 30（世代名）', 'Chuỗi 30 (tên thế hệ)'], ['価格の行で必須。同じコースに同じ世代名の行が2つあるとエラー。登録済みの世代名なら上書き（子契約が使っている世代は価格・開始期間を変えられない）、なければ新しい世代。', 'Bắt buộc ở dòng 価格. Trùng tên thế hệ trong cùng course thì lỗi. Tên đã có → ghi đè (thế hệ đang dùng không đổi được giá / ngày bắt đầu); chưa có → thế hệ mới.'], ['改訂第三回目', '改訂第三回目'], ['画面の価格プランの表の「価格プラン」と同じ。', 'Giống cột 価格プラン của bảng giá.']], ['26', ['開始期間', 'Ngày bắt đầu'], ['○', 'Bắt buộc'], ['日付 yyyy-mm-dd', 'yyyy-mm-dd'], ['価格の行で必須（削除＝1 の行は不要）。参考の項目（28-181）。（画面と同じチェック：前の行の終了期間より後（期間を重ねない・E48））', 'Bắt buộc ở dòng 価格 (trừ dòng 削除=1). Mục tham khảo (28-181).'], ['2026-04-01', '2026-04-01'], ['画面の価格プランの表の「開始期間」と同じ（参考）。', 'Giống cột 開始期間 (tham khảo).']], ['27', ['終了期間', 'Ngày kết thúc'], ['－', 'Không'], ['日付 yyyy-mm-dd', 'yyyy-mm-dd'], ['任意。開始期間より前はエラー。参考の項目。', 'Tùy chọn. Trước 開始期間 thì lỗi. Tham khảo.'], ['（空欄）', '（空欄）'], ['画面の価格プランの表の「終了期間」と同じ（参考）。', 'Giống cột 終了期間 (tham khảo).']], ['28', ['価格（COOL便）', 'Giá (COOL便)'], ['○', 'Bắt buộc'], ['金額（整数・税抜・0〜999,999,999）', 'Số tiền (nguyên, chưa thuế)'], ['価格の行で必須（ライト（自販機）は空欄）。企業負担分（税抜）より小さいとエラー。子契約が使っている世代は変えられない。（画面と同じチェック：半角数字。下限・上限のどちらか一方だけでもよい）', 'Bắt buộc ở dòng 価格 (ライト（自販機） để trống). Nhỏ hơn phần công ty chịu (chưa thuế) thì lỗi. Thế hệ đang dùng không đổi được.'], ['49500', '49500'], ['画面の価格プランの表の「価格（COOL便）」と同じ。', 'Giống cột 価格（COOL便）.']], ['29', ['価格（ES配送便）', 'Giá (ES配送便)'], ['○', 'Bắt buộc'], ['金額（整数・税抜・0〜999,999,999）', 'Số tiền (nguyên, chưa thuế)'], ['価格の行で必須。企業負担分（税抜）より小さいとエラー。子契約が使っている世代は変えられない。（画面と同じチェック：半角数字。下限・上限のどちらか一方だけでもよい）', 'Bắt buộc ở dòng 価格. Nhỏ hơn phần công ty chịu thì lỗi. Thế hệ đang dùng không đổi được.'], ['46000', '46000'], ['画面の価格プランの表の「価格（ES配送便）」と同じ。', 'Giống cột 価格（ES配送便）.']], ['30', ['公開用', 'Công khai'], ['－', 'Không'], ['1／0', '1 / 0'], ['価格の行。コースごとに 1 の行を1つだけ（0つ・2つ以上はエラー）。（画面と同じチェック：コースごとに1行だけ（E45））', 'Dòng 価格. Mỗi course đúng 1 dòng = 1 (0 hoặc ≥2 thì lỗi).'], ['1', '1'], ['画面の価格プランの表の「公開用」と同じ。', 'Giống cột 公開用.']], ['31', ['削除', 'Xóa'], ['－', 'Không'], ['1（空欄＝削除しない）', '1 (trống = không xóa)'], ['価格の行。1 のとき、その世代を削除する（登録済みで、子契約に使われていない世代だけ。新しいプランでは不可）。', 'Dòng 価格. =1 thì xóa thế hệ đó (chỉ thế hệ đã có và chưa hợp đồng nào dùng; plan mới không dùng được).'], ['（空欄）', '（空欄）'], ['世代の削除は CSV のこの列だけ（画面の表では削除ボタン）。', 'Xóa thế hệ bằng cột này (trên màn hình là nút xóa).']], ['32', ['パターン', 'Pattern'], ['○', 'Bắt buộc'], ['文字列（標準／そのほかのパターン名）', 'Chuỗi (tiêu chuẩn / tên pattern khác)'], ['設備の行で必須。コースごとに「標準」の行が1つ以上必要。', 'Bắt buộc ở dòng 設備. Mỗi course cần ≥1 dòng 標準.'], ['標準', '標準'], ['画面の標準貸出設備の表の「パターン」と同じ。設備の行はプラン×コースごとに全部入れ替える。', 'Giống cột パターン. Dòng 設備 thay toàn bộ theo plan × course.']], ['33', ['機種ID', 'Thiết bị'], ['○', 'Bắt buộc'], ['文字列 2文字＋6桁（RF／FZ／VM／BX）', '2 chữ + 6 số (RF / FZ / VM / BX)'], ['設備の行で必須。機種マスタ（冷蔵庫・冷凍庫・自販機・資材ボックス）にない ID はエラー。ライト（自販機）に RF／FZ、ほかのコースに VM はエラー。ライト（自販機）には VM の行が必要。', 'Bắt buộc ở dòng 設備. ID không có trong 機種マスタ thì lỗi. ライト（自販機） không nhận RF/FZ; course khác không nhận VM; ライト（自販機） cần ≥1 dòng VM.'], ['RF000001', 'RF000001'], ['画面の標準貸出設備の表の「機種」と同じ（CSV は ID で書く）。', 'Giống cột 機種 (CSV ghi ID).']], ['34', ['台数', 'Số lượng'], ['○', 'Bắt buộc'], ['整数 1〜99', 'Số nguyên 1〜99'], ['設備の行で必須。1 未満はエラー。', 'Bắt buộc ở dòng 設備. <1 thì lỗi.'], ['1', '1'], ['画面の標準貸出設備の表の「台数」と同じ。', 'Giống cột 台数.']], ['35', ['設備の備考', 'Ghi chú'], ['－', 'Không'], ['文字列 100', 'Chuỗi 100'], ['画面の項目と同じチェック。', 'Kiểm tra như mục trên màn hình.'], ['（空欄）', '（空欄）'], ['画面の標準貸出設備の表の「備考」と同じ。', 'Giống cột 備考 của bảng 標準貸出設備.']]]}, {'title': ['AW_MODL_004 機種マスタ CSV取込：devices.csv（39列）', 'AW_MODL_004 Nhập CSV thiết bị: devices.csv (39 cột)'], 'note': ['取り込むファイルの列の定義（1行目の見出し・この順。CSV出力と同じ列）。テンプレートの写しは docs/05_画面設計書/CSVテンプレート/devices.csv。キー＝機種ID（空欄＝新規・採番）。UTF-8（BOM 可）・5,000行まで。空欄のセルは今の値のまま、「-」で消す。2.1〜 の必須・長さ・チェックは入力画面の項目と同じ（違うところだけ書く）。画面には出さない（hong 2026/10/05）。', 'Định nghĩa cột của tệp nhập (dòng 1 = tiêu đề, theo thứ tự này; cùng cột với CSV出力). Bản mẫu: docs/05_画面設計書/CSVテンプレート/devices.csv. Khóa = 機種ID (trống = mới, cấp ID). UTF-8 (có BOM được), tối đa 5.000 dòng. Ô trống giữ giá trị cũ, "-" để xóa. Bắt buộc / độ dài / kiểm tra của 2.1〜 giống mục nhập trên màn hình (chỉ ghi chỗ khác). Không hiện trên màn hình (hong 2026/10/05).'], 'head': [[['列', 'Cột'], 5], [['列名（1行目の見出し）', 'Tên cột (dòng tiêu đề)'], 26], [['必須', 'Bắt buộc'], 8], [['形式・長さ', 'Định dạng, độ dài'], 24], [['値の決まり（チェック）', 'Quy tắc (kiểm tra)'], 48], [['データ例', 'Ví dụ'], 18], [['説明', 'Giải thích'], 40]], 'rows': [['1', ['機種ID', 'Mã thiết bị'], ['○', 'Bắt buộc'], ['文字列 2文字＋6桁（RF／FZ／VM／BX）', '2 chữ + 6 số (RF / FZ / VM / BX)'], ['設備の行で必須。機種マスタ（冷蔵庫・冷凍庫・自販機・資材ボックス）にない ID はエラー。ライト（自販機）に RF／FZ、ほかのコースに VM はエラー。ライト（自販機）には VM の行が必要。', 'Bắt buộc ở dòng 設備. ID không có trong 機種マスタ thì lỗi. ライト（自販機） không nhận RF/FZ; course khác không nhận VM; ライト（自販機） cần ≥1 dòng VM.'], ['RF000001', 'RF000001'], ['画面の標準貸出設備の表の「機種」と同じ（CSV は ID で書く）。', 'Giống cột 機種 (CSV ghi ID).']], ['2', ['機種名', 'Tên thiết bị'], ['○', 'Bắt buộc'], ['文字列 60', 'Chuỗi 60'], ['新規の行で必須。更新の行は空欄＝今の値のまま。「-」で消せる。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; ghi "-" để xóa giá trị.'], ['冷蔵ショーケース 48L', '冷蔵ショーケース 48L'], ['画面の項目 3.2「機種名」と同じ。', 'Giống mục 3.2 「機種名」 trên màn hình.']], ['3', ['機種名フリガナ', 'Tên (Furigana)'], ['○', 'Bắt buộc'], ['文字列 60', 'Chuỗi 60'], ['新規の行で必須。更新の行は空欄＝今の値のまま。「-」で消せる。画面と同じチェック：全角カタカナ（型番の英数字はそのまま）。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; ghi "-" để xóa giá trị; kiểm tra như màn hình: Katakana toàn góc (chữ số của model giữ nguyên).'], ['レイゾウショーケース 48L', 'レイゾウショーケース 48L'], ['画面の項目 3.3「機種名フリガナ」と同じ。', 'Giống mục 3.3 「機種名フリガナ」 trên màn hình.']], ['4', ['有効状態', 'Trạng thái hiệu lực'], ['○', 'Bắt buộc'], ['選択（有効／無効）', 'Chọn (hiệu lực / vô hiệu)'], ['新規の行で必須。更新の行は空欄＝今の値のまま。選択：有効／無効（それ以外はエラー）。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; chọn 1 trong: 有効 / 無効 (khác thì lỗi).'], ['有効', '有効'], ['画面の項目 3.4「有効状態」と同じ。', 'Giống mục 3.4 「有効状態」 trên màn hình.']], ['5', ['公開ステータス', 'Trạng thái công khai'], ['○', 'Bắt buộc'], ['選択（公開／非公開）', 'Chọn (công khai / không công khai)'], ['新規の行で必須。更新の行は空欄＝今の値のまま。選択：公開／非公開（それ以外はエラー）。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; chọn 1 trong: 公開 / 非公開 (khác thì lỗi).'], ['公開', '公開'], ['画面の項目 3.5「公開ステータス」と同じ。', 'Giống mục 3.5 「公開ステータス」 trên màn hình.']], ['6', ['申込での最大台数', 'Số máy tối đa khi đăng ký'], ['－', 'Không'], ['整数 1〜99（台）', 'Số nguyên 1–99'], ['「-」で消せる。', 'ghi "-" để xóa giá trị.'], ['3', '3'], ['画面の項目 3.6「申込での最大台数」と同じ。', 'Giống mục 3.6 「申込での最大台数」 trên màn hình.']], ['7', ['機種備考', 'Ghi chú'], ['－', 'Không'], ['文字列 500（複数行）', 'Chuỗi 500 (nhiều dòng)'], ['「-」で消せる。', 'ghi "-" để xóa giá trị.'], ['高出力・連続使用対応', '高出力・連続使用対応'], ['画面の項目 3.7「機種備考」と同じ。', 'Giống mục 3.7 「機種備考」 trên màn hình.']], ['8', ['幅', 'Rộng'], ['○', 'Bắt buộc'], ['整数 1〜99,999（mm）', 'Số nguyên 1–99.999 (mm)'], ['新規の行で必須。更新の行は空欄＝今の値のまま。「-」で消せる。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; ghi "-" để xóa giá trị.'], ['1200', '1200'], ['画面の項目 4.1「幅」と同じ。', 'Giống mục 4.1 「幅」 trên màn hình.']], ['9', ['奥行', 'Sâu'], ['○', 'Bắt buộc'], ['整数 1〜99,999（mm）', 'Số nguyên 1–99.999 (mm)'], ['新規の行で必須。更新の行は空欄＝今の値のまま。「-」で消せる。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; ghi "-" để xóa giá trị.'], ['800', '800'], ['画面の項目 4.2「奥行」と同じ。', 'Giống mục 4.2 「奥行」 trên màn hình.']], ['10', ['高さ', 'Cao'], ['○', 'Bắt buộc'], ['整数 1〜99,999（mm）', 'Số nguyên 1–99.999 (mm)'], ['新規の行で必須。更新の行は空欄＝今の値のまま。「-」で消せる。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; ghi "-" để xóa giá trị.'], ['1950', '1950'], ['画面の項目 4.3「高さ」と同じ。', 'Giống mục 4.3 「高さ」 trên màn hình.']], ['11', ['重量', 'Nặng'], ['○', 'Bắt buộc'], ['数値 0.1〜99,999.9（kg・小数1桁）', 'Số 0,1–99.999,9 (kg, 1 số thập phân)'], ['新規の行で必須。更新の行は空欄＝今の値のまま。「-」で消せる。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; ghi "-" để xóa giá trị.'], ['130.0', '130.0'], ['画面の項目 4.4「重量」と同じ。', 'Giống mục 4.4 「重量」 trên màn hình.']], ['12', ['容量', 'Dung tích'], ['－', 'Không'], ['整数 1〜99,999（L）', 'Số nguyên 1–99.999 (L)'], ['「-」で消せる。', 'ghi "-" để xóa giá trị.'], ['48', '48'], ['画面の項目 4.5「容量」と同じ。', 'Giống mục 4.5 「容量」 trên màn hình.']], ['13', ['電源', 'Điện áp'], ['－', 'Không'], ['文字列 20', 'Chuỗi 20'], ['「-」で消せる。', 'ghi "-" để xóa giá trị.'], ['100-200', '100-200'], ['画面の項目 4.6「電源」と同じ。', 'Giống mục 4.6 「電源」 trên màn hình.']], ['14', ['消費電力', 'Công suất tiêu thụ'], ['－', 'Không'], ['整数 1〜99,999（W）', 'Số nguyên 1–99.999 (W)'], ['「-」で消せる。', 'ghi "-" để xóa giá trị.'], ['400', '400'], ['画面の項目 4.7「消費電力」と同じ。', 'Giống mục 4.7 「消費電力」 trên màn hình.']], ['15', ['機種区分', 'Loại thiết bị'], ['○', 'Bắt buộc'], ['選択（冷蔵庫／冷凍庫／自販機／電子レンジ／ホットウォーマー／資材ボックス）', 'Chọn (tủ lạnh / tủ đông / máy bán hàng / lò vi sóng / hot warmer / hộp vật tư)'], ['新規の行で必須。更新の行は空欄＝今の値のまま。選択：冷蔵庫／冷凍庫／自販機／電子レンジ／ホットウォーマー／資材ボックス（それ以外はエラー）。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; chọn 1 trong: 冷蔵庫 / 冷凍庫 / 自販機 / 電子レンジ / ホットウォーマー / 資材ボックス (khác thì lỗi).'], ['自販機', '自販機'], ['画面の項目 6.1「機種区分」と同じ。', 'Giống mục 6.1 「機種区分」 trên màn hình.']], ['16', ['冷蔵庫／冷凍庫メーカー', 'Hãng (tủ lạnh / tủ đông)'], ['－', 'Không'], ['選択（ホシザキ／パナソニック／フクシマガリレイ）', 'Chọn (Hoshizaki / Panasonic / Fukushima Galilei)'], ['選択：ホシザキ／パナソニック／フクシマガリレイ（それ以外はエラー）。', 'chọn 1 trong: ホシザキ / パナソニック / フクシマガリレイ (khác thì lỗi).'], ['ホシザキ', 'ホシザキ'], ['画面の項目 6.3「冷蔵庫／冷凍庫メーカー」と同じ。', 'Giống mục 6.3 「冷蔵庫／冷凍庫メーカー」 trên màn hình.']], ['17', ['棚数', 'Số kệ'], ['－', 'Không'], ['整数 1〜99', 'Số nguyên 1–99'], ['「-」で消せる。', 'ghi "-" để xóa giá trị.'], ['6', '6'], ['画面の項目 6.4「棚数」と同じ。', 'Giống mục 6.4 「棚数」 trên màn hình.']], ['18', ['最大収納数（冷蔵庫／冷凍庫）', 'Sức chứa tối đa (tủ lạnh / tủ đông)'], ['○', 'Bắt buộc'], ['整数 1〜9,999（個）', 'Số nguyên 1–9.999 (cái)'], ['新規の行で必須。更新の行は空欄＝今の値のまま。「-」で消せる。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; ghi "-" để xóa giá trị.'], ['50', '50'], ['画面の項目 6.5「最大収納数（冷蔵庫／冷凍庫）」と同じ。', 'Giống mục 6.5 「最大収納数（冷蔵庫／冷凍庫）」 trên màn hình.']], ['19', ['自販機メーカー', 'Hãng máy bán hàng'], ['－', 'Không'], ['選択（富士電機／サンデン・リテールシステム）', 'Chọn (Fuji Electric / Sanden Retail Systems)'], ['選択：富士電機／サンデン・リテールシステム（それ以外はエラー）。', 'chọn 1 trong: 富士電機 / サンデン・リテールシステム (khác thì lỗi).'], ['富士電機', '富士電機'], ['画面の項目 7.1「自販機メーカー」と同じ。', 'Giống mục 7.1 「自販機メーカー」 trên màn hình.']], ['20', ['キャッシュレス対応', 'Thanh toán không tiền mặt'], ['－', 'Không'], ['1／0', '1 / 0'], ['画面の項目と同じチェック。', 'Kiểm tra như mục trên màn hình.'], ['対応する', '対応する'], ['画面の項目 7.2「キャッシュレス対応」と同じ。', 'Giống mục 7.2 「キャッシュレス対応」 trên màn hình.']], ['21', ['段数（行）', 'Số tầng (hàng)'], ['－', 'Không'], ['整数 1〜26', 'Số nguyên 1–26'], ['「-」で消せる。', 'ghi "-" để xóa giá trị.'], ['6', '6'], ['画面の項目 7.3「段数（行）」と同じ。', 'Giống mục 7.3 「段数（行）」 trên màn hình.']], ['22', ['列数', 'Số cột'], ['－', 'Không'], ['整数 1〜99', 'Số nguyên 1–99'], ['「-」で消せる。', 'ghi "-" để xóa giá trị.'], ['10', '10'], ['画面の項目 7.4「列数」と同じ。', 'Giống mục 7.4 「列数」 trên màn hình.']], ['23', ['最大収納数（自販機）', 'Sức chứa tối đa (máy bán hàng)'], ['－', 'Không'], ['整数（個）', 'Số nguyên (cái)'], ['出力だけ。取込では読まない（書いてあっても無視）。「-」で消せる。', 'chỉ xuất; nhập không đọc (có ghi cũng bỏ qua); ghi "-" để xóa giá trị.'], ['', ''], ['画面の項目 7.5「最大収納数（自販機）」と同じ。', 'Giống mục 7.5 「最大収納数（自販機）」 trên màn hình.']], ['24', ['電子レンジメーカー', 'Hãng lò vi sóng'], ['－', 'Không'], ['選択（パナソニック／シャープ）', 'Chọn (Panasonic / Sharp)'], ['選択：パナソニック／シャープ（それ以外はエラー）。', 'chọn 1 trong: パナソニック / シャープ (khác thì lỗi).'], ['パナソニック', 'パナソニック'], ['画面の項目 9.1「電子レンジメーカー」と同じ。', 'Giống mục 9.1 「電子レンジメーカー」 trên màn hình.']], ['25', ['出力', 'Công suất'], ['－', 'Không'], ['整数 1〜9,999（W）', 'Số nguyên 1–9.999 (W)'], ['「-」で消せる。', 'ghi "-" để xóa giá trị.'], ['1200', '1200'], ['画面の項目 9.2「出力」と同じ。', 'Giống mục 9.2 「出力」 trên màn hình.']], ['26', ['庫内容量', 'Dung tích khoang'], ['－', 'Không'], ['整数 1〜999（L）', 'Số nguyên 1–999 (L)'], ['「-」で消せる。', 'ghi "-" để xóa giá trị.'], ['26', '26'], ['画面の項目 9.3「庫内容量」と同じ。', 'Giống mục 9.3 「庫内容量」 trên màn hình.']], ['27', ['ホットウォーマーメーカー', 'Hãng hot warmer'], ['－', 'Không'], ['選択（アンナカ／タイジ）', 'Chọn (Annaka / Taiji)'], ['選択：アンナカ／タイジ（それ以外はエラー）。', 'chọn 1 trong: アンナカ / タイジ (khác thì lỗi).'], ['アンナカ', 'アンナカ'], ['画面の項目 8.1「ホットウォーマーメーカー」と同じ。', 'Giống mục 8.1 「ホットウォーマーメーカー」 trên màn hình.']], ['28', ['保温温度', 'Nhiệt độ giữ ấm'], ['－', 'Không'], ['整数 1〜999（℃）', 'Số nguyên 1–999 (℃)'], ['「-」で消せる。', 'ghi "-" để xóa giá trị.'], ['60', '60'], ['画面の項目 8.2「保温温度」と同じ。', 'Giống mục 8.2 「保温温度」 trên màn hình.']], ['29', ['段数', 'Số tầng'], ['－', 'Không'], ['整数 1〜99', 'Số nguyên 1–99'], ['「-」で消せる。', 'ghi "-" để xóa giá trị.'], ['3', '3'], ['画面の項目 8.3「段数」と同じ。', 'Giống mục 8.3 「段数」 trên màn hình.']], ['30', ['資材ボックスの欄', 'Ô hộp vật tư'], ['－', 'Không'], ['文字列', 'Chuỗi'], ['出力だけ。取込では読まない（書いてあっても無視）。「-」で消せる。', 'chỉ xuất; nhập không đọc (có ghi cũng bỏ qua); ghi "-" để xóa giá trị.'], ['', ''], ['画面の項目 10「資材ボックスの欄」と同じ。', 'Giống mục 10 「資材ボックスの欄」 trên màn hình.']], ['31', ['初期料金（税抜き）', 'Phí ban đầu (chưa thuế)'], ['○', 'Bắt buộc'], ['金額（整数・0〜999,999,999・税抜）', 'Số tiền (nguyên, chưa thuế)'], ['新規の行で必須。更新の行は空欄＝今の値のまま。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ.'], ['40000', '40000'], ['画面の項目 11.1「初期料金（税抜き）」と同じ。', 'Giống mục 11.1 「初期料金（税抜き）」 trên màn hình.']], ['32', ['月額料金（税抜き）', 'Phí tháng (chưa thuế)'], ['○', 'Bắt buộc'], ['金額（整数・0〜999,999,999・税抜）', 'Số tiền (nguyên, chưa thuế)'], ['新規の行で必須。更新の行は空欄＝今の値のまま。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ.'], ['5000', '5000'], ['画面の項目 11.2「月額料金（税抜き）」と同じ。', 'Giống mục 11.2 「月額料金（税抜き）」 trên màn hình.']], ['33', ['税率', 'Thuế suất'], ['○', 'Bắt buộc'], ['選択（税率マスタ）', 'Chọn (master thuế suất)'], ['新規の行で必須。更新の行は空欄＝今の値のまま。選択：8%（軽減）／10%（それ以外はエラー）。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; chọn 1 trong: 8%（軽減） / 10% (khác thì lỗi).'], ['10%', '10%'], ['画面の項目 11.3「税率」と同じ。', 'Giống mục 11.3 「税率」 trên màn hình.']], ['34', ['解約時の回収額（備品サポート費用）', 'Phí thu hồi khi hủy'], ['－', 'Không'], ['金額（整数・0〜999,999,999・税抜）', 'Số tiền (nguyên, chưa thuế)'], ['画面の項目と同じチェック。', 'Kiểm tra như mục trên màn hình.'], ['15000', '15000'], ['画面の項目 11.4「解約時の回収額（備品サポート費用）」と同じ。', 'Giống mục 11.4 「解約時の回収額（備品サポート費用）」 trên màn hình.']], ['35', ['最低利用期間', 'Thời gian dùng tối thiểu'], ['－', 'Không'], ['整数 0〜99（ヶ月）', 'Số nguyên 0–99 (tháng)'], ['「-」で消せる。', 'ghi "-" để xóa giá trị.'], ['3', '3'], ['画面の項目 11.5「最低利用期間」と同じ。', 'Giống mục 11.5 「最低利用期間」 trên màn hình.']], ['36', ['回収未完了（アラート）', 'Chưa thu hồi (cảnh báo)'], ['－', 'Không'], ['文字列', 'Chuỗi'], ['出力だけ。取込では読まない（書いてあっても無視）。「-」で消せる。', 'chỉ xuất; nhập không đọc (có ghi cũng bỏ qua); ghi "-" để xóa giá trị.'], ['', ''], ['画面の項目 12.1「回収未完了（アラート）」と同じ。', 'Giống mục 12.1 「回収未完了（アラート）」 trên màn hình.']], ['37', ['貸出中 合計', 'Tổng đang cho mượn'], ['－', 'Không'], ['文字列', 'Chuỗi'], ['出力だけ。取込では読まない（書いてあっても無視）。「-」で消せる。', 'chỉ xuất; nhập không đọc (có ghi cũng bỏ qua); ghi "-" để xóa giá trị.'], ['', ''], ['画面の項目 12.4「貸出中 合計」と同じ。', 'Giống mục 12.4 「貸出中 合計」 trên màn hình.']], ['38', ['使用中の件数', 'Số đang dùng'], ['－', 'Không'], ['整数', 'Số nguyên'], ['出力だけ。取込では読まない（書いてあっても無視）。', 'chỉ xuất; nhập không đọc (có ghi cũng bỏ qua).'], ['', ''], ['出力だけの列（取込では読まない）。', 'Cột chỉ xuất (nhập không đọc).']], ['39', ['削除済(1=削除済)', 'Đã xóa (1 = đã xóa)'], ['－', 'Không'], ['1／0', '1 / 0'], ['出力だけ。取込では読まない（書いてあっても無視）。', 'chỉ xuất; nhập không đọc (có ghi cũng bỏ qua).'], ['', ''], ['出力だけの列（取込では読まない）。', 'Cột chỉ xuất (nhập không đọc).']]]}, {'title': ['AW_OPTN_004 オプションマスタ CSV取込：options.csv（22列）', 'AW_OPTN_004 Nhập CSV option: options.csv (22 cột)'], 'note': ['取り込むファイルの列の定義（1行目の見出し・この順。CSV出力と同じ列）。テンプレートの写しは docs/05_画面設計書/CSVテンプレート/options.csv。キー＝オプションID（空欄＝新規・採番）。UTF-8（BOM 可）・5,000行まで。空欄のセルは今の値のまま、「-」で消す。2.1〜 の必須・長さ・チェックは入力画面の項目と同じ（違うところだけ書く）。画面には出さない（hong 2026/10/05）。', 'Định nghĩa cột của tệp nhập (dòng 1 = tiêu đề, theo thứ tự này; cùng cột với CSV出力). Bản mẫu: docs/05_画面設計書/CSVテンプレート/options.csv. Khóa = オプションID (trống = mới, cấp ID). UTF-8 (có BOM được), tối đa 5.000 dòng. Ô trống giữ giá trị cũ, "-" để xóa. Bắt buộc / độ dài / kiểm tra của 2.1〜 giống mục nhập trên màn hình (chỉ ghi chỗ khác). Không hiện trên màn hình (hong 2026/10/05).'], 'head': [[['列', 'Cột'], 5], [['列名（1行目の見出し）', 'Tên cột (dòng tiêu đề)'], 26], [['必須', 'Bắt buộc'], 8], [['形式・長さ', 'Định dạng, độ dài'], 24], [['値の決まり（チェック）', 'Quy tắc (kiểm tra)'], 48], [['データ例', 'Ví dụ'], 18], [['説明', 'Giải thích'], 40]], 'rows': [['1', ['オプションID', 'Mã option'], ['－', 'Không'], ['文字列 OP＋6桁', 'OP + 6 số'], ['画面の項目と同じチェック。', 'Kiểm tra như mục trên màn hình.'], ['OP000001', 'OP000001'], ['【空欄＝新規（採番）】画面の項目 3.1「オプションID」と同じ。', '【空欄＝新規（採番）】  Giống mục 3.1 「オプションID」 trên màn hình.']], ['2', ['管理名（社内用）', 'Tên quản lý (nội bộ)'], ['○', 'Bắt buộc'], ['文字列 60', 'Chuỗi 60'], ['新規の行で必須。更新の行は空欄＝今の値のまま。「-」で消せる。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; ghi "-" để xóa giá trị.'], ['設置代行（冷蔵庫）', '設置代行（冷蔵庫）'], ['画面の項目 3.2「管理名（社内用）」と同じ。', 'Giống mục 3.2 「管理名（社内用）」 trên màn hình.']], ['3', ['請求書表示名', 'Tên trên hóa đơn'], ['○', 'Bắt buộc'], ['文字列 60', 'Chuỗi 60'], ['新規の行で必須。更新の行は空欄＝今の値のまま。「-」で消せる。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; ghi "-" để xóa giá trị.'], ['設置代行', '設置代行'], ['画面の項目 3.3「請求書表示名」と同じ。', 'Giống mục 3.3 「請求書表示名」 trên màn hình.']], ['4', ['オプション区分', 'Loại option'], ['○', 'Bắt buộc'], ['選択（オプション区分マスタの使用中の区分。初期値：配送／アプリ機能／設置・作業／事務／ペナルティ）', 'Chọn (các loại đang dùng trong master loại option; ban đầu: giao hàng / tính năng app / lắp đặt / hành chính / phạt)'], ['新規の行で必須。更新の行は空欄＝今の値のまま。選択：配送／アプリ機能／設置・作業／事務／ペナルティ（それ以外はエラー）。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; chọn 1 trong: 配送 / アプリ機能 / 設置・作業 / 事務 / ペナルティ (khác thì lỗi).'], ['設置・作業', '設置・作業'], ['画面の項目 3.4「オプション区分」と同じ。', 'Giống mục 3.4 「オプション区分」 trên màn hình.']], ['5', ['公開ステータス', 'Trạng thái công khai'], ['○', 'Bắt buộc'], ['選択（公開／非公開）', 'Chọn (công khai / không công khai)'], ['新規の行で必須。更新の行は空欄＝今の値のまま。選択：公開／非公開（それ以外はエラー）。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; chọn 1 trong: 公開 / 非公開 (khác thì lỗi).'], ['非公開', '非公開'], ['画面の項目 3.5「公開ステータス」と同じ。', 'Giống mục 3.5 「公開ステータス」 trên màn hình.']], ['6', ['利用状態', 'Trạng thái sử dụng'], ['○', 'Bắt buộc'], ['選択（使用中／終了）', 'Chọn (đang dùng / kết thúc)'], ['新規の行で必須。更新の行は空欄＝今の値のまま。選択：使用中／終了（それ以外はエラー）。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; chọn 1 trong: 使用中 / 終了 (khác thì lỗi).'], ['使用中', '使用中'], ['画面の項目 3.6「利用状態」と同じ。', 'Giống mục 3.6 「利用状態」 trên màn hình.']], ['7', ['説明', 'Mô tả'], ['－', 'Không'], ['文字列 500（複数行）', 'Chuỗi 500 (nhiều dòng)'], ['「-」で消せる。', 'ghi "-" để xóa giá trị.'], ['配送エリアによる。金額は拠点ごと', '配送エリアによる。金額は拠点ごと'], ['画面の項目 3.7「説明」と同じ。', 'Giống mục 3.7 「説明」 trên màn hình.']], ['8', ['連動タイプ', 'Loại liên kết'], ['○', 'Bắt buộc'], ['選択（A 契約項目に連動（システム定義）／連動しない）', 'Chọn (A liên kết mục hợp đồng / không liên kết)'], ['新規の行で必須。更新の行は空欄＝今の値のまま。選択：A 契約項目に連動（システム定義）／連動しない（それ以外はエラー）。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; chọn 1 trong: A 契約項目に連動（システム定義） / 連動しない (khác thì lỗi).'], ['連動しない', '連動しない'], ['画面の項目 4.1「連動タイプ」と同じ。', 'Giống mục 4.1 「連動タイプ」 trên màn hình.']], ['9', ['連動する契約項目', 'Mục hợp đồng liên kết'], ['－', 'Không'], ['文字列', 'Chuỗi'], ['出力だけ。取込では読まない（書いてあっても無視）。「-」で消せる。', 'chỉ xuất; nhập không đọc (có ghi cũng bỏ qua); ghi "-" để xóa giá trị.'], ['', ''], ['画面の項目 5.2「連動する契約項目」と同じ。', 'Giống mục 5.2 「連動する契約項目」 trên màn hình.']], ['10', ['連動条件', 'Điều kiện liên kết'], ['－', 'Không'], ['文字列', 'Chuỗi'], ['出力だけ。取込では読まない（書いてあっても無視）。「-」で消せる。', 'chỉ xuất; nhập không đọc (có ghi cũng bỏ qua); ghi "-" để xóa giá trị.'], ['', ''], ['画面の項目 5.3「連動条件」と同じ。', 'Giống mục 5.3 「連動条件」 trên màn hình.']], ['11', ['数量の取り方', 'Cách lấy số lượng'], ['－', 'Không'], ['文字列', 'Chuỗi'], ['出力だけ。取込では読まない（書いてあっても無視）。「-」で消せる。', 'chỉ xuất; nhập không đọc (có ghi cũng bỏ qua); ghi "-" để xóa giá trị.'], ['', ''], ['画面の項目 5.4「数量の取り方」と同じ。', 'Giống mục 5.4 「数量の取り方」 trên màn hình.']], ['12', ['料金種別', 'Loại phí'], ['○', 'Bắt buộc'], ['選択（月額料金（継続）／単発料金（1回））', 'Chọn (phí tháng liên tục / phí 1 lần)'], ['新規の行で必須。更新の行は空欄＝今の値のまま。選択：月額料金（継続）／単発料金（1回）（それ以外はエラー）。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; chọn 1 trong: 月額料金（継続） / 単発料金（1回） (khác thì lỗi).'], ['単発料金（1回）', '単発料金（1回）'], ['画面の項目 5.1「料金種別」と同じ。', 'Giống mục 5.1 「料金種別」 trên màn hình.']], ['13', ['単位', 'Đơn vị'], ['○', 'Bắt buộc'], ['選択（拠点／台／回／超過1単位（A型のみ））', 'Chọn (điểm / máy / lần / 1 đơn vị vượt – chỉ A)'], ['新規の行で必須。更新の行は空欄＝今の値のまま。選択：拠点／台／回／超過1単位（A型のみ）（それ以外はエラー）。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; chọn 1 trong: 拠点 / 台 / 回 / 超過1単位（A型のみ） (khác thì lỗi).'], ['台', '台'], ['画面の項目 5.2「単位」と同じ。', 'Giống mục 5.2 「単位」 trên màn hình.']], ['14', ['金額の種類', 'Loại số tiền'], ['○', 'Bắt buộc'], ['選択（固定／最低額から／都度入力／拠点ごと／差額で決まる／機種参照）', 'Chọn (cố định / từ mức tối thiểu / nhập từng lần / theo điểm / theo chênh lệch / tham chiếu master thiết bị)'], ['新規の行で必須。更新の行は空欄＝今の値のまま。選択：固定／最低額から（〇〇円～）／都度入力／拠点ごと／差額で決まる／機種参照（機種マスタの値・契約ごとに直せる）（それ以外はエラー）。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; chọn 1 trong: 固定 / 最低額から（〇〇円～） / 都度入力 / 拠点ごと / 差額で決まる / 機種参照（機種マスタの値・契約ごとに直せる） (khác thì lỗi).'], ['機種参照（機種マスタの値・契約ごとに直せる）', '機種参照（機種マスタの値・契約ごとに直せる）'], ['画面の項目 5.3「金額の種類」と同じ。', 'Giống mục 5.3 「金額の種類」 trên màn hình.']], ['15', ['対象のコース', 'Course áp dụng'], ['－', 'Không'], ['1／0', '1 / 0'], ['画面の項目と同じチェック。', 'Kiểm tra như mục trên màn hình.'], ['ESライト（自販機）', 'ESライト（自販機）'], ['画面の項目 5.4「対象のコース」と同じ。', 'Giống mục 5.4 「対象のコース」 trên màn hình.']], ['16', ['対象の機種区分', 'Loại thiết bị áp dụng'], ['－', 'Không'], ['1／0', '1 / 0'], ['画面の項目と同じチェック。', 'Kiểm tra như mục trên màn hình.'], ['自販機', '自販機'], ['画面の項目 5.5「対象の機種区分」と同じ。', 'Giống mục 5.5 「対象の機種区分」 trên màn hình.']], ['17', ['承認', 'Phê duyệt'], ['－', 'Không'], ['文字列', 'Chuỗi'], ['「-」で消せる。', 'ghi "-" để xóa giá trị.'], ['権限のある運営管理者なら誰でも登録・承認できる', '権限のある運営管理者なら誰でも登録・承認できる'], ['画面の項目 5.6「承認」と同じ。', 'Giống mục 5.6 「承認」 trên màn hình.']], ['18', ['標準金額（税抜）', 'Số tiền chuẩn (chưa thuế)'], ['○', 'Bắt buộc'], ['金額（整数・0〜999,999,999・税抜）', 'Số tiền (nguyên, chưa thuế)'], ['新規の行で必須。更新の行は空欄＝今の値のまま。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ.'], ['15000', '15000'], ['画面の項目 5.7「標準金額（税抜）」と同じ。', 'Giống mục 5.7 「標準金額（税抜）」 trên màn hình.']], ['19', ['税率', 'Thuế suất'], ['○', 'Bắt buộc'], ['選択（税率マスタ）', 'Chọn (master thuế suất)'], ['新規の行で必須。更新の行は空欄＝今の値のまま。選択：8%（軽減）／10%（それ以外はエラー）。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; chọn 1 trong: 8%（軽減） / 10% (khác thì lỗi).'], ['10%', '10%'], ['画面の項目 5.8「税率」と同じ。', 'Giống mục 5.8 「税率」 trên màn hình.']], ['20', ['連動の不一致を検知', 'Phát hiện lệch liên kết'], ['－', 'Không'], ['文字列', 'Chuỗi'], ['出力だけ。取込では読まない（書いてあっても無視）。「-」で消せる。', 'chỉ xuất; nhập không đọc (có ghi cũng bỏ qua); ghi "-" để xóa giá trị.'], ['', ''], ['画面の項目 8.1「連動の不一致を検知」と同じ。', 'Giống mục 8.1 「連動の不一致を検知」 trên màn hình.']], ['21', ['使用中の件数', 'Số đang dùng'], ['－', 'Không'], ['整数', 'Số nguyên'], ['出力だけ。取込では読まない（書いてあっても無視）。', 'chỉ xuất; nhập không đọc (có ghi cũng bỏ qua).'], ['', ''], ['出力だけの列（取込では読まない）。', 'Cột chỉ xuất (nhập không đọc).']], ['22', ['削除済(1=削除済)', 'Đã xóa (1 = đã xóa)'], ['－', 'Không'], ['1／0', '1 / 0'], ['出力だけ。取込では読まない（書いてあっても無視）。', 'chỉ xuất; nhập không đọc (có ghi cũng bỏ qua).'], ['', ''], ['出力だけの列（取込では読まない）。', 'Cột chỉ xuất (nhập không đọc).']]]}, {'title': ['AW_DISC_004 値引きマスタ CSV取込：discounts.csv（27列）', 'AW_DISC_004 Nhập CSV giảm giá: discounts.csv (27 cột)'], 'note': ['取り込むファイルの列の定義（1行目の見出し・この順。CSV出力と同じ列）。テンプレートの写しは docs/05_画面設計書/CSVテンプレート/discounts.csv。キー＝値引きID（空欄＝新規・採番）。UTF-8（BOM 可）・5,000行まで。空欄のセルは今の値のまま、「-」で消す。2.1〜 の必須・長さ・チェックは入力画面の項目と同じ（違うところだけ書く）。画面には出さない（hong 2026/10/05）。', 'Định nghĩa cột của tệp nhập (dòng 1 = tiêu đề, theo thứ tự này; cùng cột với CSV出力). Bản mẫu: docs/05_画面設計書/CSVテンプレート/discounts.csv. Khóa = 値引きID (trống = mới, cấp ID). UTF-8 (có BOM được), tối đa 5.000 dòng. Ô trống giữ giá trị cũ, "-" để xóa. Bắt buộc / độ dài / kiểm tra của 2.1〜 giống mục nhập trên màn hình (chỉ ghi chỗ khác). Không hiện trên màn hình (hong 2026/10/05).'], 'head': [[['列', 'Cột'], 5], [['列名（1行目の見出し）', 'Tên cột (dòng tiêu đề)'], 26], [['必須', 'Bắt buộc'], 8], [['形式・長さ', 'Định dạng, độ dài'], 24], [['値の決まり（チェック）', 'Quy tắc (kiểm tra)'], 48], [['データ例', 'Ví dụ'], 18], [['説明', 'Giải thích'], 40]], 'rows': [['1', ['値引きID', 'Mã giảm giá'], ['－', 'Không'], ['文字列 DC＋6桁', 'DC + 6 số'], ['画面の項目と同じチェック。', 'Kiểm tra như mục trên màn hình.'], ['DC000001', 'DC000001'], ['【空欄＝新規（採番）】画面の項目 3.1「値引きID」と同じ。', '【空欄＝新規（採番）】  Giống mục 3.1 「値引きID」 trên màn hình.']], ['2', ['値引き名（管理用）', 'Tên (quản lý)'], ['○', 'Bắt buộc'], ['文字列 60', 'Chuỗi 60'], ['新規の行で必須。更新の行は空欄＝今の値のまま。「-」で消せる。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; ghi "-" để xóa giá trị.'], ['お試しキャンペーン割引', 'お試しキャンペーン割引'], ['画面の項目 3.2「値引き名（管理用）」と同じ。', 'Giống mục 3.2 「値引き名（管理用）」 trên màn hình.']], ['3', ['管理用コード', 'Mã quản lý'], ['○', 'Bắt buộc'], ['文字列 40（半角英数字・ハイフン）', 'Chuỗi 40 (chữ số nửa góc, gạch nối)'], ['新規の行で必須。更新の行は空欄＝今の値のまま。「-」で消せる。画面と同じチェック：ほかの値引きと重複しない（E09）。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; ghi "-" để xóa giá trị; kiểm tra như màn hình: Không trùng với 値引き khác (E09).'], ['TRIAL-FREE', 'TRIAL-FREE'], ['画面の項目 3.3「管理用コード」と同じ。', 'Giống mục 3.3 「管理用コード」 trên màn hình.']], ['4', ['請求書表示名', 'Tên trên hóa đơn'], ['○', 'Bắt buộc'], ['文字列 60', 'Chuỗi 60'], ['新規の行で必須。更新の行は空欄＝今の値のまま。「-」で消せる。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; ghi "-" để xóa giá trị.'], ['お試しキャンペーン割引', 'お試しキャンペーン割引'], ['画面の項目 3.4「請求書表示名」と同じ。', 'Giống mục 3.4 「請求書表示名」 trên màn hình.']], ['5', ['値引き区分', 'Loại giảm giá'], ['○', 'Bắt buộc'], ['選択（値引き区分マスタの使用中の区分。初期値：キャンペーン割引／代理店割引／他社乗り換え割引／紹介割引／ボリュームディスカウント／アップグレード差額）', 'Chọn (các loại đang dùng trong master loại giảm giá; ban đầu: khuyến mãi / đại lý / chuyển từ công ty khác / giới thiệu / số lượng / chênh lệch nâng cấp)'], ['新規の行で必須。更新の行は空欄＝今の値のまま。選択：キャンペーン割引／代理店割引／他社乗り換え割引／紹介割引／ボリュームディスカウント／アップグレード差額（それ以外はエラー）。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; chọn 1 trong: キャンペーン割引 / 代理店割引 / 他社乗り換え割引 / 紹介割引 / ボリュームディスカウント / アップグレード差額 (khác thì lỗi).'], ['代理店割引', '代理店割引'], ['画面の項目 3.5「値引き区分」と同じ。', 'Giống mục 3.5 「値引き区分」 trên màn hình.']], ['6', ['紹介フィープラン（請求名称）', 'Plan phí giới thiệu'], ['－', 'Không'], ['選択（—（連動なし）／紹介フィーマスタのプラン）', 'Chọn (— không liên kết / plan trong master phí giới thiệu)'], ['選択：—（連動なし）／RFP000001 A：企業紹介／RFP000002 B：代理店紹介／RFP000003 C：パートナー紹介／RFP000004 D：特別代理店（それ以外はエラー）。', 'chọn 1 trong: —（連動なし） / RFP000001 A：企業紹介 / RFP000002 B：代理店紹介 / RFP000003 C：パートナー紹介 / RFP000004 D：特別代理店 (khác thì lỗi).'], ['RFP000002 B：代理店紹介', 'RFP000002 B：代理店紹介'], ['画面の項目 3.6「紹介フィープラン（請求名称）」と同じ。', 'Giống mục 3.6 「紹介フィープラン（請求名称）」 trên màn hình.']], ['7', ['公開ステータス', 'Trạng thái công khai'], ['○', 'Bắt buộc'], ['選択（公開／非公開）', 'Chọn (công khai / không công khai)'], ['新規の行で必須。更新の行は空欄＝今の値のまま。選択：公開／非公開（それ以外はエラー）。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; chọn 1 trong: 公開 / 非公開 (khác thì lỗi).'], ['非公開', '非公開'], ['画面の項目 3.7「公開ステータス」と同じ。', 'Giống mục 3.7 「公開ステータス」 trên màn hình.']], ['8', ['利用状態', 'Trạng thái sử dụng'], ['○', 'Bắt buộc'], ['選択（使用中／終了）', 'Chọn (đang dùng / kết thúc)'], ['新規の行で必須。更新の行は空欄＝今の値のまま。選択：使用中／終了（それ以外はエラー）。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; chọn 1 trong: 使用中 / 終了 (khác thì lỗi).'], ['使用中', '使用中'], ['画面の項目 3.8「利用状態」と同じ。', 'Giống mục 3.8 「利用状態」 trên màn hình.']], ['9', ['説明', 'Mô tả'], ['－', 'Không'], ['文字列 500（複数行）', 'Chuỗi 500 (nhiều dòng)'], ['「-」で消せる。', 'ghi "-" để xóa giá trị.'], ['50プラン ESライト（冷蔵庫）の料金分。請求額を超えない', '50プラン ESライト（冷蔵庫）の料金分。請求額を超えない'], ['画面の項目 3.9「説明」と同じ。', 'Giống mục 3.9 「説明」 trên màn hình.']], ['10', ['適用対象', 'Đối tượng áp dụng'], ['○', 'Bắt buộc'], ['選択（プラン料金／オプション料金／設備料金／初期料金／請求全体）', 'Chọn (phí plan / phí option / phí thiết bị / phí ban đầu / toàn hóa đơn)'], ['新規の行で必須。更新の行は空欄＝今の値のまま。選択：プラン料金／オプション料金／設備料金／初期料金／請求全体（それ以外はエラー）。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; chọn 1 trong: プラン料金 / オプション料金 / 設備料金 / 初期料金 / 請求全体 (khác thì lỗi).'], ['オプション料金', 'オプション料金'], ['画面の項目 4.1「適用対象」と同じ。', 'Giống mục 4.1 「適用対象」 trên màn hình.']], ['11', ['対象オプション', 'Option áp dụng'], ['－', 'Không'], ['選択（（すべてのオプション）／オプションマスタの使用中のオプション）', 'Chọn (mọi option / các option đang dùng trong master option)'], ['出力だけ。取込では読まない（書いてあっても無視）。選択：—（適用対象がオプション料金のときだけ）／（すべてのオプション）／OP000001 配送回数追加／OP000004 地域配送料／OP000007 設置代行（それ以外はエラー）。', 'chỉ xuất; nhập không đọc (có ghi cũng bỏ qua); chọn 1 trong: —（適用対象がオプション料金のときだけ） / （すべてのオプション） / OP000001 配送回数追加 / OP000004 地域配送料 / OP000007 設置代行 (khác thì lỗi).'], ['', ''], ['画面の項目 4.2「対象オプション」と同じ。', 'Giống mục 4.2 「対象オプション」 trên màn hình.']], ['12', ['計算区分', 'Cách tính'], ['○', 'Bắt buộc'], ['選択（固定額／料率／差額自動／プラン料金を参照）', 'Chọn (số tiền cố định / tỷ lệ / chênh lệch tự động / tham chiếu phí plan)'], ['新規の行で必須。更新の行は空欄＝今の値のまま。選択：固定額／料率／差額自動／プラン料金を参照（それ以外はエラー）。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; chọn 1 trong: 固定額 / 料率 / 差額自動 / プラン料金を参照 (khác thì lỗi).'], ['料率', '料率'], ['画面の項目 4.3「計算区分」と同じ。', 'Giống mục 4.3 「計算区分」 trên màn hình.']], ['13', ['値引きの値', 'Giá trị giảm'], ['○', 'Bắt buộc'], ['固定額：金額（整数・税抜）／料率：数値 0.01〜100.00（%）＋上限額（整数・空欄＝上限なし）', 'Cố định: số tiền (nguyên, chưa thuế) / tỷ lệ: số 0,01–100,00 (%) + giới hạn (nguyên, trống = không)'], ['新規の行で必須。更新の行は空欄＝今の値のまま。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ.'], ['5', '5'], ['画面の項目 4.4「値引きの値」と同じ。', 'Giống mục 4.4 「値引きの値」 trên màn hình.']], ['14', ['税率の扱い', 'Cách xử lý thuế'], ['○', 'Bắt buộc'], ['選択（元の費目と同じ／個別に指定）', 'Chọn (giống mục gốc / chỉ định riêng)'], ['新規の行で必須。更新の行は空欄＝今の値のまま。選択：元の費目と同じ／個別に指定（それ以外はエラー）。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; chọn 1 trong: 元の費目と同じ / 個別に指定 (khác thì lỗi).'], ['元の費目と同じ', '元の費目と同じ'], ['画面の項目 4.5「税率の扱い」と同じ。', 'Giống mục 4.5 「税率の扱い」 trên màn hình.']], ['15', ['税率（個別に指定）', 'Thuế suất (chỉ định riêng)'], ['○', 'Bắt buộc'], ['選択（税率マスタ）', 'Chọn (master thuế suất)'], ['新規の行で必須。更新の行は空欄＝今の値のまま。選択：8%（軽減）／10%（それ以外はエラー）。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; chọn 1 trong: 8%（軽減） / 10% (khác thì lỗi).'], ['10%', '10%'], ['画面の項目 4.6「税率（個別に指定）」と同じ。', 'Giống mục 4.6 「税率（個別に指定）」 trên màn hình.']], ['16', ['重ねがけ', 'Cộng dồn'], ['○', 'Bắt buộc'], ['選択（可／不可）', 'Chọn (được / không)'], ['新規の行で必須。更新の行は空欄＝今の値のまま。選択：可／不可（それ以外はエラー）。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; chọn 1 trong: 可 / 不可 (khác thì lỗi).'], ['可', '可'], ['画面の項目 4.7「重ねがけ」と同じ。', 'Giống mục 4.7 「重ねがけ」 trên màn hình.']], ['17', ['適用順', 'Thứ tự áp dụng'], ['○', 'Bắt buộc'], ['整数 1〜999', 'Số nguyên 1–999'], ['新規の行で必須。更新の行は空欄＝今の値のまま。「-」で消せる。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; ghi "-" để xóa giá trị.'], ['20', '20'], ['画面の項目 4.8「適用順」と同じ。', 'Giống mục 4.8 「適用順」 trên màn hình.']], ['18', ['値引きの種別', 'Loại giảm giá (kỳ)'], ['○', 'Bắt buộc'], ['選択（毎月（継続）／単発（1回））', 'Chọn (hằng tháng liên tục / 1 lần)'], ['新規の行で必須。更新の行は空欄＝今の値のまま。選択：毎月（継続）／単発（1回）（それ以外はエラー）。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; chọn 1 trong: 毎月（継続） / 単発（1回） (khác thì lỗi).'], ['毎月（継続）', '毎月（継続）'], ['画面の項目 5.1「値引きの種別」と同じ。', 'Giống mục 5.1 「値引きの種別」 trên màn hình.']], ['19', ['適用期間の持ち方', 'Cách giữ kỳ áp dụng'], ['○', 'Bắt buộc'], ['選択（無期限／月数指定）', 'Chọn (vô thời hạn / số tháng)'], ['新規の行で必須。更新の行は空欄＝今の値のまま。選択：無期限／月数指定／—（単発のため使わない）（それ以外はエラー）。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; chọn 1 trong: 無期限 / 月数指定 / —（単発のため使わない） (khác thì lỗi).'], ['月数指定', '月数指定'], ['画面の項目 5.2「適用期間の持ち方」と同じ。', 'Giống mục 5.2 「適用期間の持ち方」 trên màn hình.']], ['20', ['適用月数', 'Số tháng áp dụng'], ['－', 'Không'], ['整数 1〜120（ヶ月）', 'Số nguyên 1–120 (tháng)'], ['「-」で消せる。', 'ghi "-" để xóa giá trị.'], ['3', '3'], ['画面の項目 5.3「適用月数」と同じ。', 'Giống mục 5.3 「適用月数」 trên màn hình.']], ['21', ['つけられる拠点の条件', 'Điều kiện điểm được gắn'], ['－', 'Không'], ['対象代理店コード：選択（すべて／代理店マスタの代理店）／契約種別の制限：選択（制限なし／お試しキャンペーンは対象外／本導入のみ／お試しキャンペーンのみ）', 'Mã đại lý: chọn (tất cả / đại lý trong master đại lý) / giới hạn loại hợp đồng: chọn (không / trừ dùng thử / chỉ chính thức / chỉ dùng thử)'], ['選択：すべて／AG00001 株式会社フューチャーブリッジ／AG00002 株式会社スマートコネクト／AG00003 株式会社ビジネスリンク／AG00004 株式会社アーバンネットワーク／AG00005 グローバルサポート株式会社／AG00006 ライフデザインパートナーズ株式会社／AG00008 ネクストパートナーズ株式会社／AG00010 東和ソリューションズ株式会社／AG00011 株式会社サンライズエージェント／AG00012 株式会社ブリッジワークス／AG00021 株式会社パートナーズ／AG00034 株式会社リンクアップ／AG00102 ESパートナー西日本（特別代理店）（それ以外はエラー）。', 'chọn 1 trong: すべて / AG00001 株式会社フューチャーブリッジ / AG00002 株式会社スマートコネクト / AG00003 株式会社ビジネスリンク / AG00004 株式会社アーバンネットワーク / AG00005 グローバルサポート株式会社 / AG00006 ライフデザインパートナーズ株式会社 / AG00008 ネクストパートナーズ株式会社 / AG00010 東和ソリューションズ株式会社 / AG00011 株式会社サンライズエージェント / AG00012 株式会社ブリッジワークス / AG00021 株式会社パートナーズ / AG00034 株式会社リンクアップ / AG00102 ESパートナー西日本（特別代理店） (khác thì lỗi).'], ['AG00021 株式会社パートナーズ／制限なし', 'AG00021 株式会社パートナーズ／制限なし'], ['画面の項目 5.4「つけられる拠点の条件」と同じ。', 'Giống mục 5.4 「つけられる拠点の条件」 trên màn hình.']], ['22', ['対象のプラン・コース', 'Plan, course áp dụng'], ['－', 'Không'], ['チェック（すべて／ESスタンダード／ESライト（冷蔵庫）／ESライト（自販機））＋ プラン（複数選択）', 'Checkbox (tất cả / 3 course) + plan (chọn nhiều)'], ['「-」で消せる。', 'ghi "-" để xóa giá trị.'], ['ESスタンダード', 'ESスタンダード'], ['画面の項目 5.5「対象のプラン・コース」と同じ。', 'Giống mục 5.5 「対象のプラン・コース」 trên màn hình.']], ['23', ['回数の上限', 'Giới hạn số lần'], ['－', 'Không'], ['選択（上限なし／法人ごとに1回／拠点ごとに1回／法人ごとにN回／拠点ごとにN回）＋ N（整数 2〜99）', 'Chọn (không / 1 lần mỗi công ty / 1 lần mỗi điểm / N lần mỗi công ty / N lần mỗi điểm) + N (2–99)'], ['選択：上限なし／法人ごとに1回／拠点ごとに1回／法人ごとにN回／拠点ごとにN回（それ以外はエラー）。', 'chọn 1 trong: 上限なし / 法人ごとに1回 / 拠点ごとに1回 / 法人ごとにN回 / 拠点ごとにN回 (khác thì lỗi).'], ['法人ごとに1回', '法人ごとに1回'], ['画面の項目 5.6「回数の上限」と同じ。', 'Giống mục 5.6 「回数の上限」 trên màn hình.']], ['24', ['自動で付ける条件', 'Điều kiện tự gắn'], ['－', 'Không'], ['選択（付けない（手で付ける）／契約種別＝お試しキャンペーン／契約項目に連動）', 'Chọn (không tự gắn / loại hợp đồng = dùng thử / liên kết mục hợp đồng)'], ['選択：付けない（手で付ける）／契約種別＝お試しキャンペーン／契約項目に連動（それ以外はエラー）。', 'chọn 1 trong: 付けない（手で付ける） / 契約種別＝お試しキャンペーン / 契約項目に連動 (khác thì lỗi).'], ['契約種別＝お試しキャンペーン', '契約種別＝お試しキャンペーン'], ['画面の項目 5.7「自動で付ける条件」と同じ。', 'Giống mục 5.7 「自動で付ける条件」 trên màn hình.']], ['25', ['受付期間', 'Kỳ tiếp nhận'], ['－', 'Không'], ['日付 yyyy-mm-dd（開始日）〜 日付（終了日）', 'yyyy-mm-dd (bắt đầu) 〜 (kết thúc)'], ['「-」で消せる。', 'ghi "-" để xóa giá trị.'], ['2026-10-01 〜 2026-12-31', '2026-10-01 〜 2026-12-31'], ['画面の項目 5.8「受付期間」と同じ。', 'Giống mục 5.8 「受付期間」 trên màn hình.']], ['26', ['使用中の件数', 'Số đang dùng'], ['－', 'Không'], ['整数', 'Số nguyên'], ['出力だけ。取込では読まない（書いてあっても無視）。', 'chỉ xuất; nhập không đọc (có ghi cũng bỏ qua).'], ['', ''], ['出力だけの列（取込では読まない）。', 'Cột chỉ xuất (nhập không đọc).']], ['27', ['削除済(1=削除済)', 'Đã xóa (1 = đã xóa)'], ['－', 'Không'], ['1／0', '1 / 0'], ['出力だけ。取込では読まない（書いてあっても無視）。', 'chỉ xuất; nhập không đọc (có ghi cũng bỏ qua).'], ['', ''], ['出力だけの列（取込では読まない）。', 'Cột chỉ xuất (nhập không đọc).']]]}, {'title': ['AW_DISC_005 値引きの適用 CSV取込：discountApply.csv（5列）', 'AW_DISC_005 Nhập CSV áp dụng giảm giá: discountApply.csv (5 cột)'], 'note': ['取り込むファイルの列の定義（1行目の見出し・この順。CSV出力と同じ列）。テンプレートの写しは docs/05_画面設計書/CSVテンプレート/discountApply.csv。キー＝値引きID（空欄＝新規・採番）。UTF-8（BOM 可）・5,000行まで。空欄のセルは今の値のまま、「-」で消す。2.1〜 の必須・長さ・チェックは入力画面の項目と同じ（違うところだけ書く）。画面には出さない（hong 2026/10/05）。', 'Định nghĩa cột của tệp nhập (dòng 1 = tiêu đề, theo thứ tự này; cùng cột với CSV出力). Bản mẫu: docs/05_画面設計書/CSVテンプレート/discountApply.csv. Khóa = 値引きID (trống = mới, cấp ID). UTF-8 (có BOM được), tối đa 5.000 dòng. Ô trống giữ giá trị cũ, "-" để xóa. Bắt buộc / độ dài / kiểm tra của 2.1〜 giống mục nhập trên màn hình (chỉ ghi chỗ khác). Không hiện trên màn hình (hong 2026/10/05).'], 'head': [[['列', 'Cột'], 5], [['列名（1行目の見出し）', 'Tên cột (dòng tiêu đề)'], 26], [['必須', 'Bắt buộc'], 8], [['形式・長さ', 'Định dạng, độ dài'], 24], [['値の決まり（チェック）', 'Quy tắc (kiểm tra)'], 48], [['データ例', 'Ví dụ'], 18], [['説明', 'Giải thích'], 40]], 'rows': [['1', ['値引きID', 'Mã giảm giá'], ['○', 'Bắt buộc'], ['文字列 DC＋6桁', 'DC + 6 số'], ['新規の行で必須。更新の行は空欄＝今の値のまま。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ.'], ['DC000013', 'DC000013'], ['画面の項目 3.1「値引きID」と同じ。', 'Giống mục 3.1 「値引きID」 trên màn hình.']], ['2', ['拠点ID', 'Mã điểm'], ['○', 'Bắt buộc'], ['文字列 CU＋5桁', 'CU + 5 chữ số'], ['必須。拠点マスタにない ID はエラー。', 'Bắt buộc. Không có trong 拠点 thì lỗi.'], ['CU00975', 'CU00975'], ['値引きを付ける拠点。キーの一部（値引きID＋拠点ID＋適用開始月）。', 'Điểm áp dụng. Một phần của khóa (値引きID + 拠点ID + 適用開始月).']], ['3', ['拠点名', 'Tên điểm'], ['－', 'Không'], ['文字列', 'Chuỗi'], ['出力だけ。取込では読まない（書いてあっても無視）。', 'chỉ xuất; nhập không đọc (có ghi cũng bỏ qua).'], ['', ''], ['出力だけ（取込では読まない）。拠点ID から出す。', 'Chỉ xuất; lấy từ 拠点ID.']], ['4', ['適用開始月', 'Tháng bắt đầu'], ['○', 'Bắt buộc'], ['年月 YYYY-MM（サイクル月）', 'YYYY-MM (tháng chu kỳ)'], ['必須。形式が違うとエラー。', 'Bắt buộc. Sai định dạng thì lỗi.'], ['2026-10', '2026-10'], ['この月から先の子契約に値引きを付ける（確定・請求済の月は変えない）。キーの一部。', 'Gắn giảm giá cho hợp đồng con từ tháng này (tháng đã chốt / đã xuất hóa đơn không đổi). Một phần của khóa.']], ['5', ['適用終了月', 'Tháng kết thúc'], ['－', 'Không'], ['年月 YYYY-MM', 'YYYY-MM'], ['任意。開始月より前はエラー。空欄＝ずっと。（「-」で消せる）', 'Tùy chọn. Trước tháng bắt đầu thì lỗi. Trống = mãi.'], ['（空欄）', '（空欄）'], ['この月より後の子契約から値引きを外す。', 'Sau tháng này thì bỏ giảm giá khỏi hợp đồng con.']]]}]}]

VIEWS = V_LIST + V_DETAIL + V_FORM + V_CSV
