# -*- coding: utf-8 -*-
"""
画面設計書のデータ：運営管理者Web ＞ マスタ管理 ＞ 機種マスタ（一覧・詳細・登録／編集）
元：本物の Web（このリポジトリ app/ops/masters/devices）、決定台帳 B・E・F、マスタ項目一覧「機種マスタ一覧／編集（64）」§0.9・§III-9・§III-10、
    運営Web_権限表（冷蔵庫・冷凍庫マスタ管理）、STEP7 一覧の決まり、確認メモ_AW_マスタ3画面_機種・オプション・値引き.md
番号は画面ごとに通し。タブ・区分・モーダルの状態では、その状態で増える・変わる項目だけ書く（共通の項目は最初の状態に1回）。
"""

TITLE = ["機種マスタ（AW_MODL）", "Device model master (AW_MODL)"]
SHEET = ["機種マスタ", "Device model master"]
BASENAME = "画面設計書_AW_MODL_機種マスタ"
IMG_PREFIX = "AW_MODL"
OUT_DIR = "AW_MODL_機種マスタ"
CODE_NOTE = ["画面コードは規約 <Module(2)>_<Feature(4)>_<Seq(3)>（docs/01_仕様/画面コード規約_20261005.md）。AW＝運営管理者Web、MODL＝機種マスタ",
             "Mã màn hình theo quy ước <Module(2)>_<Feature(4)>_<Seq(3)>. AW = Admin Web, MODL = Device model master"]
SITE = "ops"
SYSTEM = {"ja": "運営管理者Web", "vi": "Web quản trị vận hành"}
AUTHOR = "Claude（cloud）／確認：hong"
CREATED = "2026-10-05"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "ops", "loginId": "Ad00010"}   # フル権限（ops.full）。見本：中村幸子

DECISIONS = [
    {"date": "2026-10-05", "target": "権限",
     "q": ["だれが作成・編集・削除できるか", "Ai được tạo/sửa/xóa?"],
     "a": ["権限表のとおり：フル権限・営業・商品管理・商品開発＝CRUD、経理・CS・物流＝R（閲覧・CSV出力）", "Theo bảng quyền: フル権限・営業・商品管理・商品開発 = CRUD; 経理・CS・物流 = R (xem, xuất CSV)"],
     "src": "運営Web_権限表_20261003（冷蔵庫・冷凍庫マスタ管理）"},
    {"date": "2026-10-05", "target": "一覧の初期の並び",
     "q": ["初期の並び順（L-3）", "Thứ tự mặc định (L-3)"],
     "a": ["登録日時の新しい順。列見出しで 機種ID・機種名・機種区分・有効状態・登録日時 を並べ替えられる（マスタ項目一覧 一覧画面 #9）", "Mới đăng ký trước. Sắp xếp được theo 機種ID・機種名・機種区分・有効状態・登録日時 (マスタ項目一覧 #9)"],
     "src": "マスタ項目一覧 一覧画面（3つの一覧に共通）#9・STEP7 L-3"},
    {"date": "2026-10-05", "target": "メーカーの選択肢",
     "q": ["メーカーマスタを持つか、固定の選択肢か", "Có メーカーマスタ hay danh sách cố định?"],
     "a": ["固定の選択肢（機種区分ごと：冷蔵庫／冷凍庫＝ホシザキ・パナソニック・フクシマガリレイ、自販機＝富士電機・サンデン・リテールシステム、電子レンジ＝パナソニック・シャープ、ホットウォーマー＝アンナカ・タイジ）。増やすときは開発に依頼", "Danh sách cố định theo 機種区分 (tủ lạnh/đông: ホシザキ・パナソニック・フクシマガリレイ; máy bán hàng: 富士電機・サンデン; lò vi sóng: パナソニック・シャープ; hot warmer: アンナカ・タイジ). Thêm hãng = nhờ dev"],
     "src": "Claude 提案 2026/10/05（確認メモ Q3・hong 回答 2026/10/05 OK・受付簿 #107）・コード devices.ts"},
    {"date": "2026-10-05", "target": "最大収納数（自販機）の算出",
     "q": ["レイアウトからどう出すか（項目一覧：算出式を決める）", "Tính từ layout như thế nào?"],
     "a": ["有効なマスの格納数の合計（シングル8＝8・シングル10＝10・ダブル8＝8・ダブル10＝10・ベルト5＝5。無効のマスは数えない）。読み取り専用", "Tổng số chứa của các ô 有効 (シングル8=8, シングル10=10, ダブル8=8, ダブル10=10, ベルト5=5; ô 無効 không tính). Chỉ xem"],
     "src": "Claude 提案 2026/10/05（確認メモ Q4・hong 回答 2026/10/05 OK・受付簿 #107）・コード vmLayout"},
    {"date": "2026-10-05", "target": "レイアウト生成のやり直し",
     "q": ["作り直すと前の設定が消えるか", "Tạo lại thì mất thiết lập cũ?"],
     "a": ["消える（全部シングル8・有効に戻す）。消える前に W04 で確認する", "Mất (về シングル8, 有効 toàn bộ). Hỏi xác nhận W04 trước"],
     "src": "Claude 提案 2026/10/05（確認メモ Q5・hong 回答 2026/10/05 OK・受付簿 #107）"},
    {"date": "2026-10-05", "target": "有効状態の選択肢",
     "q": ["有効のほかに何があるか", "Ngoài 有効 còn gì?"],
     "a": ["有効／無効。削除済は削除の操作で付く（選べない）", "有効／無効. 削除済 là do thao tác xóa (không chọn)"],
     "src": "Claude 提案 2026/10/05（確認メモ Q6・hong 回答 2026/10/05 OK・受付簿 #107）・コード"},
    {"date": "2026-10-05", "target": "保温温度の単位",
     "q": ["℃で持つか", "Đơn vị ℃?"],
     "a": ["℃（整数）", "℃ (số nguyên)"],
     "src": "Claude 提案 2026/10/05（確認メモ Q7・hong 回答 2026/10/05 OK・受付簿 #107）"},
    {"date": "2026-10-05", "target": "貸出中の機種の削除",
     "q": ["貸出中 > 0 の機種を削除できるか", "Xóa được máy đang cho mượn không?"],
     "a": ["できない（E38）。無効にして新規に選べなくする", "Không (E38). Đổi 有効状態 = 無効 để không chọn mới"],
     "src": "Claude 提案 2026/10/05（確認メモ Q8・hong 回答 2026/10/05 OK・受付簿 #107。プランの E37 と同じ考え方）"},
    {"date": "2026-10-05", "target": "月額リース料金（自販機）",
     "q": ["機種マスタに持つか", "Có giữ ở 機種マスタ không?"],
     "a": ["持たない（自販機のリース料＝月額料金。OP000037 の初期値）", "Không (tiền thuê máy = 月額料金; giá mặc định của OP000037)"],
     "src": "台帳 B「自販機のリース料」・マスタ項目一覧 料金 5（2026-10-05）"},
    {"date": "2026-10-05", "target": "画面コード",
     "q": ["画面コード", "Mã màn hình"],
     "a": ["AW_MODL_001〜003", "AW_MODL_001〜003"],
     "src": "画面コード規約_20261005（Feature は Claude 案・hong 回答 2026/10/05 OK・受付簿 #107）"},
]
CHANGES = [{'ver': '1.5', 'date': '2026-10-05', 'no': ['2.5', '2.6', '2.7', '2.36', '2.37', '2.38', '2.39', '2.40', '10.6', '11.6'], 'type': '削除', 'before': ['詳細 10.6・登録 11.6「標準で含むプラン（参照）」と、CSV の列', 'Mục 10.6 / 11.6 標準で含むプラン（参照） và cột CSV'], 'after': ['外す（プランマスタの標準貸出設備で見る）', 'Bỏ (xem ở 標準貸出設備 của プランマスタ)'], 'reason': ['hong 2026/10/05「bỏ」・受付簿 #147', 'hong 2026/10/05, 受付簿 #147'], 'impact': ['devices.ts の欄・CSV出力の列', 'devices.ts; cột CSV出力']},
 {'ver': '1.4', 'date': '2026-10-05', 'no': ['3.5', '3.6', '3.7', '4.5', '4.6', '4.7', '7', '7.1', '7.2', '7.3', '7.4', '7.5', '7.6', '7.7', '7.8', '7.9', '7.10', '8', '8.1', '8.2', '8.3', '8.4', '8.5', '8.6', '8.7', '8.8', '8.9', '9', '9.1', '9.2', '9.3', '9.4', '9.5', '9.6', '10', '10.1', '10.2', '10.3', '11', '11.1', '11.2', '11.3', '11.4', '11.5', '11.6', '12', '12.1', '12.2', '12.3', '12.4', '12.5', '12.6', '13.4', '13.5', '15', '16'], 'type': '変更', 'before': ['基本情報の上に「列の構成（自販機）」のカード（表）', 'Card 列の構成 phía trên 基本情報'], 'after': ['カードは置かず、機種区分＞自販機のレイアウトの上に集計だけ（詳細 8.6・登録 7.7）。詳細の 9.x → 8.x、登録の 8〜12 → 7〜11', 'Bỏ card; chỉ tổng hợp trên layout trong tab 自販機 (chi tiết 8.6, đăng ký 7.7). Chi tiết 9.x → 8.x; đăng ký 8〜12 → 7〜11'], 'reason': ['hong 2026/10/05（HTML コメント）・受付簿 #141', 'hong 2026/10/05, 受付簿 #141'], 'impact': ['devices.ts・MasterDetail（lanesFromGrid）', 'devices.ts, MasterDetail']},
 {'ver': '1.4', 'date': '2026-10-05', 'no': ['3.5', '3.6', '3.7', '4.5', '4.6', '4.7', '7', '7.1', '7.2', '7.3', '7.4', '7.5', '7.6', '7.7', '7.8', '7.9', '7.10', '8', '8.1', '8.2', '8.3', '8.4', '8.5', '8.6', '8.7', '8.8', '8.9', '9', '9.1', '9.2', '9.3', '9.4', '9.5', '9.6', '10', '10.1', '10.2', '10.3', '11', '11.1', '11.2', '11.3', '11.4', '11.5', '11.6', '12', '12.1', '12.2', '12.3', '12.4', '12.5', '12.6', '13.4', '13.5', '15', '16'], 'type': '変更', 'before': ['トグル「回収済も表示」（設計書はドロップダウン・コードは宿題）', 'Nút toggle 回収済も表示 (code chưa sửa)'], 'after': ['表の上のドロップダウン「貸出ステータス」をコードにも反映（12.2）', 'Dropdown 貸出ステータス đã vào code (12.2)'], 'reason': ['hong 2026/10/05「コメント内容が反映されない？」・受付簿 #114', 'hong 2026/10/05, 受付簿 #114'], 'impact': ['devices.ts・MasterDetail', 'devices.ts, MasterDetail']},
 {'ver': '1.4', 'date': '2026-10-05', 'no': ['3.5', '3.6', '3.7', '4.5', '4.6', '4.7', '7', '7.1', '7.2', '7.3', '7.4', '7.5', '7.6', '7.7', '7.8', '7.9', '7.10', '8', '8.1', '8.2', '8.3', '8.4', '8.5', '8.6', '8.7', '8.8', '8.9', '9', '9.1', '9.2', '9.3', '9.4', '9.5', '9.6', '10', '10.1', '10.2', '10.3', '11', '11.1', '11.2', '11.3', '11.4', '11.5', '11.6', '12', '12.1', '12.2', '12.3', '12.4', '12.5', '12.6', '13.4', '13.5', '15', '16'], 'type': '削除', 'before': ['履歴に「影響した拠点数」（13.5）・変更区分に バージョン追加', 'Cột 影響した拠点数 (13.5), 変更区分 có バージョン追加'], 'after': ['外す（機種の変更は契約・拠点に影響しない）', 'Bỏ (đổi 機種 không ảnh hưởng hợp đồng / điểm)'], 'reason': ['hong 2026/10/05（HTML コメント）・受付簿 #142', 'hong 2026/10/05, 受付簿 #142'], 'impact': ['devices.ts 履歴の表・マスタ項目一覧 履歴 4・5', 'devices.ts; マスタ項目一覧']},
 {'ver': '1.4', 'date': '2026-10-05', 'no': ['3.6', '3.7', '4.6', '4.7'], 'type': '変更', 'before': ['備考・説明の欄は1列・途中', 'Ô 備考/説明 1 cột, ở giữa'], 'after': ['3列分の幅でセクションの最後に（番号も最後に）', 'Rộng 3 cột, đặt cuối section (đổi số)'], 'reason': ['hong 2026/10/05 チャット（共通）・受付簿 #143', 'hong 2026/10/05, 受付簿 #143'], 'impact': ['parts.tsx span3・spec の fields の順', 'parts.tsx span3; thứ tự fields trong spec']},
 {'ver': '1.4', 'date': '2026-10-05', 'no': ['1.3', '2.5', '2.6', '2.7', '2.19', '2.20', '2.21', '2.22', '2.23', '2.24', '2.25', '2.26', '2.27', '2.28', '2.29', '2.30', '2.31', '2.32', '2.33', '2.34', '2.35', '2.36', '3.1'], 'type': '変更', 'before': ['CSV取込の画面：手順がカードの中、見出しは .phead', 'Màn CSV取込: stepper trong card, tiêu đề .phead'], 'after': ['アンケートの CSV取込と同じ形（見出し .ph＋ボタン、手順はカードの外の中央、カードに見出し）', 'Giống CSV取込 của アンケート (.ph + nút, stepper ngoài card, card có tiêu đề)'], 'reason': ['hong 2026/10/05「機種マスタ CSV取込の UI が異変。UI/UX 改善して」', 'hong 2026/10/05'], 'impact': ['MasterCsvImport の Frame・CsvUi.stepsInFrame', 'MasterCsvImport Frame; CsvUi.stepsInFrame']},
 {'ver': '1.3', 'date': '2026-10-05', 'no': ['1.4', '4.7', '6', '6.1', '6.2', '6.3', '6.4', '6.5', '7', '7.1', '7.2', '8', '8.1', '8.2', '8.3', '8.4', '8.5', '8.6', '8.7', '8.8', '8.9', '9', '9.1', '9.2', '9.3', '10', '10.1', '10.2', '10.3', '11', '12', '12.1', '12.2', '12.3', '12.4', '12.5', '12.6', '14', '14.1', '15', '15.1', '15.2', '15.3', '16', '16.1', '16.2', '16.3'], 'type': '変更', 'before': ['詳細の 冷凍庫・電子レンジ・資材ボックス の状態が 019〜021（008 のあと）', 'Các trạng thái chi tiết 冷凍庫 / 電子レンジ / 資材ボックス đánh số 019〜021 (sau 008)'], 'after': ['状態の番号を並び順に付け直した：019〜021 → 009〜011、登録・編集の 009〜018 → 012〜021（項目の番号・内容は同じ）', 'Đánh lại số trạng thái theo thứ tự: 019〜021 → 009〜011; đăng ký / sửa 009〜018 → 012〜021 (số mục và nội dung không đổi)'], 'reason': ['hong 2026/10/05「xem lại vị trí stt của nó」（画面設計書 HTML のコメント）', 'hong 2026/10/05 (comment HTML)'], 'impact': ['番号だけ（画像のファイル名も変わる）', 'Chỉ số thứ tự (tên tệp ảnh cũng đổi)']},
 {'ver': '1.3', 'date': '2026-10-05', 'no': ['2'], 'type': '削除', 'before': ['条件を変えて未反映のときに「検索」の横に「未適用」の印', 'Dấu 未適用 cạnh nút 検索 khi đổi điều kiện mà chưa áp dụng'], 'after': ['「未適用」の印は出さない（全部の一覧）', 'Không hiện dấu 未適用 (mọi danh sách)'], 'reason': ['hong 2026/10/05（画面設計書 HTML のコメント）・受付簿 #127', 'hong 2026/10/05, 受付簿 #127'], 'impact': ['ListView の UnappliedMark を出さない・P-LIST', 'Bỏ UnappliedMark ở ListView; P-LIST']},
 {'ver': '1.3', 'date': '2026-10-05', 'no': ['1', '1.1', '1.2', '1.3', '2', '2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2.7', '2.8', '2.9', '2.10', '2.11', '2.12', '2.13', '2.14', '2.15', '2.16', '2.17', '2.18', '2.19', '2.20', '2.21', '2.22', '2.23', '2.24', '2.25', '2.26', '2.27', '2.28', '2.29', '2.30', '2.31', '2.32', '2.33', '2.34', '2.35', '2.36', '2.37', '2.38', '2.39', '2.40', '3', '3.1', '3.2', '3.3', '3.4', '3.5', '3.6', '3.7', '3.8', '3.9', '3.10', '3.11', '3.12', '3.13', '3.14', '3.15', '3.16', '3.17', '3.18', '3.19', '3.20', '3.21', '3.22', '3.23', '3.24', '3.25', '3.26', '3.27', '3.28', '3.29', '3.30', '3.31', '3.32', '3.33', '3.34', '3.35', '3.36', '3.37', '3.38', '3.39', '3.40', '4', '4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '5', '5.1', '5.2', '5.3', '5.4', '5.5', '5.6'], 'type': '変更', 'before': ['CSV取込の画面に「CSVの列（テンプレートの定義）」の表を出す（項目 2・3.x）', 'Màn CSV取込 hiện bảng định nghĩa cột (mục 2, 3.x)'], 'after': ['列の定義は画面に出さない。CSVテンプレートの列（必須・長さ・チェック・データ例）を項目 2.x として設計書にだけ書く（入力画面と同じ定義）。ファイルを選ぶ＝3.x、確認・登録＝4.x に番号を詰めた', 'Không hiện bảng cột trên màn hình. Định nghĩa cột template (bắt buộc, độ dài, kiểm tra, ví dụ) chỉ ghi ở 設計書 (mục 2.x, như màn nhập). Chọn tệp = 3.x, xác nhận = 4.x'], 'reason': ['hong 2026/10/05「CSV テンプレは画面で表示ではなく、一覧に追加して…入力画面と同様に定義必要」・受付簿 #129', 'hong 2026/10/05, 受付簿 #129'], 'impact': ['画面から列の表のカードを外す（MasterCsvImport）。取込のチェックは 2.x のとおり', 'Bỏ card bảng cột khỏi màn hình (MasterCsvImport). Kiểm tra khi nhập theo 2.x']},
 {'ver': '1.2',
  'date': '2026-10-05',
  'no': ['*'],
  'type': '追加',
  'before': ['CSV取込はモーダル（一覧の状態）', 'Nhập CSV là modal (trạng thái của danh sách)'],
  'after': ['画面 AW_MODL_004「CSV取込」（CSVの列の定義の表＋1 ファイルを選ぶ → 2 確認・登録）', 'Màn hình AW_MODL_004 「CSV取込」 (bảng định nghĩa cột + bước 1 chọn tệp → bước 2 xác nhận)'],
  'reason': ['hong 2026/10/05（モーダルではなく画面・テンプレートの定義を書く）・受付簿 #89', 'hong 2026/10/05, 受付簿 #89'],
  'impact': ['モーダルを画面に。列の定義 API（csv.columns）・テンプレート CSV（docs/05_画面設計書/CSVテンプレート）', 'Modal → màn hình; API csv.columns; template CSV']},
 {'ver': '1.2',
  'date': '2026-10-05',
  'no': ['5.2', '6.2', '7', '7.1', '7.2', '7.3', '10.7', '11', '11.1', '12.7', '13'],
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
         '3.36',
         '3.37',
         '3.38',
         '3.39',
         '3.40',
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
         '6.1',
         '7',
         '10',
         '12.2',
         '12.5',
         '14',
         '15',
         '15.1',
         '15.2',
         '15.3',
         '16'],
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
    {"code": "AW_MODL_001", "ja": "機種マスタ一覧", "vi": "Danh sách thiết bị (model)"},
    {"code": "AW_MODL_002", "ja": "機種詳細", "vi": "Chi tiết thiết bị"},
    {"code": "AW_MODL_003", "ja": "機種登録・編集", "vi": "Đăng ký / sửa thiết bị"},
    {"code": "AW_MODL_004", "ja": "機種マスタ CSV取込", "vi": "Nhập CSV thiết bị"},
]

# ---------------------------------------------------------------- 書きやすくする道具
def F(no, ja, vi, sel, kind, trig="view", **kw):
    d = {"no": no, "ja": ja, "vi": vi, "sel": sel, "kind": kind, "trig": trig}
    d.update(kw)
    return d

CRUD = ["フル権限・営業・商品管理・商品開発の役割だけに表示（権限表）", "Chỉ hiện với vai trò フル権限・営業・商品管理・商品開発 (bảng quyền)"]
H_SORT = ["並べ替えの UI は未実装（受付簿 #55）。コードは機種ID順。仕様が正", "Chưa có UI sắp xếp (受付簿 #55); code đang theo 機種ID. Spec đúng"]
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
KUBUN = lambda name: JS + "sets(q('.f[data-name=\"機種区分\"] select'),'%s');await sleep(500);window.scrollTo(0,q('#sec-3').offsetTop-80);" % name

# ================================================================ AW_MODL_001 一覧
LIST_HEADER = [
    F("1", "ヘッダー", "Đầu trang", ".es-pagehead", "area", detail=["パンくず（マスタ管理 / 機種マスタ）・画面名・操作ボタン。", "Breadcrumb (マスタ管理 / 機種マスタ), tên màn hình, nút thao tác."]),
    F("1.1", "パンくず", "Breadcrumb", ".es-breadcrumb", "label", detail=["「マスタ管理 / 機種マスタ」。リンクは動かない（表示だけ）。", "「マスタ管理 / 機種マスタ」. Chỉ hiển thị."]),
    F("1.2", "画面名", "Tên màn hình", ".es-pagehead__title", "label", detail=["「機種マスタ一覧」", "Tiêu đề 「機種マスタ一覧」"]),
    F("1.3", "CSV取込", "Nhập CSV", "button::CSV取込", "button", "click", cond=CRUD, pattern="P-CSV",
      detail=["機種マスタの CSV取込（AW_MODL_004 の画面へ）。キーは機種ID（空欄＝新規・採番）。列は詳細・編集の項目と同じ（CSV入出力_定義_20261003.md）。自販機のレイアウトは CSV に含めない（画面で設定）。",
              "Nhập CSV máy (sang màn AW_MODL_004). Khóa = 機種ID (trống = mới, cấp ID). Cột giống mục ở chi tiết/sửa (CSV入出力_定義_20261003.md). Layout máy bán hàng không nằm trong CSV (thiết lập trên màn hình)."]),
    F("1.4", "CSV出力", "Xuất CSV", "button::CSV出力", "button", "click",
      detail=["検索条件のとおりの全件を、取込と同じ列で出力する。閲覧できる役割すべてに出す。", "Xuất toàn bộ theo điều kiện tìm kiếm, cùng cột với nhập. Hiện với mọi vai trò xem được."]),
    F("1.5", "新規登録", "Đăng ký mới", "button::新規登録", "button", "click", cond=CRUD, detail=["AW_MODL_003（新規登録）へ。", "Sang AW_MODL_003 (đăng ký mới)."]),
]
LIST_SEARCH = [
    F("2", "検索条件", "Điều kiện tìm kiếm", ".es-search", "area", pattern="P-LIST",
      detail=["条件は「検索」か Enter で反映する。（「未適用」の印は出さない・hong 2026/10/05）項目が2行以上に折り返すときだけ開閉ボタンを出す。",
              "Điều kiện áp dụng khi nhấn 検索 hoặc Enter; (không hiện dấu 未適用, hong 2026/10/05). Nút đóng/mở chỉ hiện khi điều kiện xuống ≥2 dòng."]),
    F("2.1", "キーワード", "Từ khóa", 'input[aria-label="機種ID、機種名"]', "text", "input", req="－", len="文字列 60",
      init=["空", "Trống"], ex=["冷蔵ショーケース", "Tìm theo 機種ID / 機種名, khớp một phần"],
      valid=["部分一致。全角・半角、大文字・小文字を区別しない。", "Khớp một phần, không phân biệt toàn/nửa góc, hoa/thường."], err=["E04"],
      detail=["機種ID・機種名のどちらかに含まれる行。", "Lọc dòng có từ khóa trong 機種ID hoặc 機種名."]),
    F("2.2", "機種区分", "Loại thiết bị", 'select[aria-label="機種区分"]', "select", "select", req="－",
      len=["選択（冷蔵庫／冷凍庫／自販機／電子レンジ／ホットウォーマー／資材ボックス）", "Chọn (tủ lạnh / tủ đông / máy bán hàng / lò vi sóng / hot warmer / hộp vật tư)"],
      init=["未選択（先頭＝条件名）", "Chưa chọn (dòng đầu = tên điều kiện)"], ex=["自販機", "Lọc theo loại"]),
    F("2.3", "メーカー", "Hãng", 'select[aria-label="メーカー"]', "select", "select", req="－",
      len=["選択（登録のあるメーカー）", "Chọn (các hãng đã đăng ký)"], init=["未選択", "Chưa chọn"], ex=["ホシザキ", "Lọc theo hãng"],
      detail=["選択肢は機種区分ごとの固定の一覧をまとめたもの（DECISIONS メーカー）。", "Danh sách gộp các hãng cố định theo 機種区分."]),
    F("2.4", "公開ステータス", "Trạng thái công khai", 'select[aria-label="公開ステータス"]', "select", "select", req="－",
      len=["選択（公開／非公開）", "Chọn (công khai / không công khai)"], init=["未選択", "Chưa chọn"], ex=["公開", "Lọc theo trạng thái công khai"]),
    F("2.5", "有効状態", "Trạng thái hiệu lực", 'select[aria-label="有効状態"]', "select", "select", req="－",
      len=["選択（有効／無効／削除済）", "Chọn (hiệu lực / vô hiệu / đã xóa)"], init=["未選択", "Chưa chọn"], ex=["無効", "削除済 chỉ có kết quả khi bỏ check 2.6"],
      detail=["「削除済」を選ぶときは 2.6 のチェックも外す（外さないと 0件）。", "Chọn 削除済 thì cũng bỏ check 2.6 (không thì 0 dòng)."]),
    F("2.6", "削除済みを表示しない", "Không hiện đã xóa", ".delchk", "check", "check", req="－",
      len=["チェック", "Checkbox"], init=["ON", "Bật"], ex=["ON", "Mặc định bật: ẩn máy 削除済"],
      detail=["ON＝削除済の機種を出さない（既定）。OFF にして検索すると削除済も出る（行はグレー・バッジ「削除済」・操作なし）。STEP7 L3。", "Bật = ẩn máy đã xóa (mặc định). Tắt rồi tìm thì hiện cả đã xóa (dòng xám, badge 削除済, không có thao tác). STEP7 L3."]),
    F("2.7", "クリア", "Xóa điều kiện", "button::クリア", "button", "click", detail=["条件をすべて初期値に戻し、1ページ目から表示し直す。", "Đưa điều kiện về mặc định, hiện lại từ trang 1."]),
    F("2.8", "検索", "Tìm kiếm", ".es-search__actions button[type=submit]", "button", "click", detail=["条件を反映して1ページ目から表示。Enter でも同じ。", "Áp dụng điều kiện, hiện từ trang 1. Enter cũng vậy."]),
]
LIST_TABLE = [
    F("3", "一覧", "Danh sách", ".es-table-wrap", "table", pattern="P-LIST",
      detail=["初期の並び：登録日時の新しい順（マスタ項目一覧 #9・L-3）。削除済の行はグレー（.is-deleted）で操作を出さない。", "Thứ tự mặc định: mới đăng ký trước (マスタ項目一覧 #9, L-3). Dòng đã xóa màu xám, không có thao tác."], demo_ok=H_SORT),
    F("3.1", "機種ID", "Mã thiết bị", "th::機種ID", "link", "click", len=["文字列 2文字＋6桁", "2 chữ + 6 số"],
      detail=["機種区分の2文字＋6桁（RF／FZ／VM／MW／HW／BX）。クリックで AW_MODL_002（詳細）へ。", "2 chữ theo loại + 6 số (RF/FZ/VM/MW/HW/BX). Nhấn sang AW_MODL_002."]),
    F("3.2", "機種名", "Tên thiết bị", "th::機種名", "label", len="文字列 60"),
    F("3.3", "機種区分", "Loại thiết bị", "th::機種区分", "label"),
    F("3.4", "メーカー", "Hãng", "th::メーカー", "label", detail=["資材ボックスは「—」。", "Hộp vật tư thì 「—」."]),
    F("3.5", "月額料金（税抜）", "Phí tháng (chưa thuế)", "th::月額料金（税抜）", "label", len=["金額＋「円」・右寄せ", "Số tiền + yên, căn phải"]),
    F("3.6", "最低利用期間", "Thời gian dùng tối thiểu", "th::最低利用期間", "label", len=["整数＋「ヶ月」", "Số nguyên + tháng"], detail=["空欄（0）＝「—」。", "Trống (0) = 「—」."]),
    F("3.7", "公開ステータス", "Trạng thái công khai", "th::公開ステータス", "label", detail=["バッジ：公開＝緑、非公開＝灰。", "Badge: 公開 xanh, 非公開 xám."]),
    F("3.8", "有効状態", "Trạng thái hiệu lực", "th::有効状態", "label", detail=["バッジ：有効＝緑、無効＝灰、削除済＝灰（行もグレー）。", "Badge: 有効 xanh, 無効 xám, 削除済 xám (dòng xám)."]),
    F("3.9", "貸出中", "Đang cho mượn", "th::貸出中", "label", len=["整数＋「台」", "Số nguyên + máy"], detail=["いま貸し出している台数（貸出から算出）。", "Số máy đang cho mượn (tính từ 貸出)."]),
    F("3.10", "登録日時", "Ngày đăng ký", "th::登録日時", "label", len=["日時 yyyy-mm-dd HH:MM", "yyyy-mm-dd HH:MM"]),
    F("3.11", "操作", "Thao tác", "th::操作", "label", detail=["編集（鉛筆）・削除（ゴミ箱）。削除済の行には出さない。", "Sửa (bút chì), xóa (thùng rác). Không hiện ở dòng đã xóa."]),
    F("3.12", "編集", "Sửa", 'button[aria-label$="を編集"]', "button", "click", cond=CRUD, detail=["AW_MODL_003（編集）へ。キャンセルで一覧に戻る。", "Sang AW_MODL_003 (sửa). キャンセル thì về danh sách."]),
    F("3.13", "削除", "Xóa", 'button[aria-label$="を削除"]', "button", "click", cond=CRUD, pattern="P-DEL", err=["Q01", "E38", "S02", "E33"],
      detail=["貸出中が 0台 なら状態 003（削除の確認）。貸出中 > 0 なら E38 のモーダル（削除できません）。", "貸出中 = 0 → trạng thái 003 (xác nhận xóa). 貸出中 > 0 → modal E38 (không xóa được)."],
      demo_ok=["コードは貸出中でも削除できる（受付簿・宿題 M6）。仕様が正", "Code vẫn cho xóa khi đang cho mượn (宿題 M6). Spec đúng"]),
    F("3.14", "並べ替え", "Sắp xếp", ".es-table thead", "select", "select", req="－",
      len=["選択（機種ID／機種名／機種区分／有効状態／登録日時）＋ 昇順／降順", "Chọn cột (mã / tên / loại / trạng thái / ngày đăng ký) + tăng/giảm"],
      init=["登録日時 降順", "登録日時 giảm dần"], ex=["機種ID 昇順", "Chọn cột và chiều sắp xếp (STEP7 L2)"],
      detail=["STEP7 L2・マスタ項目一覧 #9。", "STEP7 L2, マスタ項目一覧 #9."], demo_ok=H_SORT),
]
LIST_PAGER = [
    F("4", "ページ送り", "Phân trang", ".es-pagination", "area", pattern="P-LIST"),
    F("4.1", "件数", "Số dòng", ".es-pagination__meta", "label", detail=["「n件中 a–b件」。0件は「0件」。", "「n件中 a–b件」. 0 dòng thì 「0件」."]),
    F("4.2", "前のページ", "Trang trước", 'button[aria-label="前のページ"]', "button", "click", cond=["1ページ目では非活性", "Trang 1 thì vô hiệu"]),
    F("4.3", "ページ番号", "Số trang", ".es-page.is-current", "button", "click", detail=["今のページは塗りつぶし。", "Trang hiện tại tô đậm."]),
    F("4.4", "次のページ", "Trang sau", 'button[aria-label="次のページ"]', "button", "click", cond=["最後のページでは非活性", "Trang cuối thì vô hiệu"]),
    F("4.5", "表示件数", "Số dòng/trang", 'select[aria-label="表示件数"]', "select", "select", req="－",
      len=["選択（10／20／50 件／ページ）", "Chọn (10 / 20 / 50 dòng/trang)"], init=["10件／ページ", "10 dòng/trang"], ex=["20件／ページ", "Đổi số dòng mỗi trang (STEP7 L-1)"],
      detail=["変えると1ページ目に戻る。", "Đổi thì về trang 1."]),
]
V_LIST = [
    {"id": "001", "code": "AW_MODL_001", "state": ["初期表示", "Hiển thị ban đầu"], "url": "/ops/masters/devices",
     "setup": CLEAR, "full": True, "wait": 500,
     "note": ["フル権限（Ad00010）で表示。R の役割（経理・CS・物流）では 1.3・1.5・3.12・3.13 が出ない。", "Hiển thị với フル権限 (Ad00010). Vai trò R (経理・CS・物流) không có 1.3, 1.5, 3.12, 3.13."],
     "items": LIST_HEADER + LIST_SEARCH + LIST_TABLE + LIST_PAGER},
    {"id": "002", "code": "AW_MODL_001", "state": ["該当なし（0件）", "Không có kết quả (0 dòng)"], "url": "/ops/masters/devices",
     "setup": CLEAR + "setv(q('.es-search__fields input'),'zzz');q('.es-search__actions button[type=submit]').click();await sleep(500);", "full": False, "wait": 400,
     "items": [
         F("5", "0件のメッセージ", "Thông báo 0 dòng", ".es-table tbody td[colspan]", "label", "show", err=["I01"],
           detail=["一覧の中に I01 を1行で出す。ページ送りは「0件」。", "Hiện I01 trong bảng. Phân trang 「0件」."], demo_ok=H_EMPTY),
     ]},
    {"id": "003", "code": "AW_MODL_001", "state": ["削除の確認", "Xác nhận xóa"], "url": "/ops/masters/devices",
     "setup": CLEAR + "q('button[aria-label=\"冷蔵ショーケース 142Lを削除\"]').click();await sleep(400);", "full": False, "wait": 400,
     "note": ["貸出中 0台 の機種（見本 RF000004 冷蔵ショーケース 142L）のゴミ箱を押したとき。貸出中 > 0 なら E38 のモーダル（閉じるだけ）。", "Khi nhấn thùng rác của máy chưa cho mượn (mẫu RF000004). Đang cho mượn thì modal E38 (chỉ đóng)."],
     "items": [
         F("6", "削除の確認モーダル", "Modal xác nhận xóa", '.es-modal[aria-label="削除しますか？"]', "modal", "show", pattern="P-DEL", err=["Q01"],
           detail=["Q01（ボタン名＝削除）。本文に機種ID・機種名。", "Q01 (ボタン名 = 削除). Nội dung có 機種ID, 機種名."], demo_ok=H_DELMSG),
         F("6.1", "本文", "Nội dung", ".es-modal__body", "label", detail=["Q01 ＋ 対象（RF000004 冷蔵ショーケース 142L）。論理削除で、一覧は既定で隠れる。", "Q01 + đối tượng (RF000004). Xóa logic, danh sách mặc định ẩn."]),
         F("6.2", "キャンセル", "Hủy", ".es-modal__actions button::キャンセル", "button", "click", detail=["閉じる。何もしない。", "Đóng, không làm gì."]),
         F("6.3", "削除", "Xóa", ".es-modal__actions button::削除", "button", "click", err=["S02", "E33"],
           detail=["有効状態を「削除済」にし（論理削除）、S02 のトースト。プランマスタの標準貸出設備に載っている機種は、その行もグレーで出す。", "Đổi 有効状態 thành 削除済 (xóa logic), toast S02. Máy đang nằm trong 標準貸出設備 của plan thì dòng đó hiện xám."]),
     ]},

]

# ================================================================ AW_MODL_002 詳細
D_HEADER = [
    F("1", "ヘッダー", "Đầu trang", ".phead", "area"),
    F("1.1", "パンくず", "Breadcrumb", ".crumb", "label", detail=["「マスタ管理 / 機種マスタ一覧 / 機種詳細」。機種マスタ一覧はリンク。", "「マスタ管理 / 機種マスタ一覧 / 機種詳細」. 機種マスタ一覧 là link."]),
    F("1.2", "画面名", "Tên màn hình", ".phead h2", "label", detail=["「機種詳細」＋ 機種ID。削除済の機種はサマリーに「状態：削除済」。", "「機種詳細」 + 機種ID. Máy đã xóa có 「状態：削除済」 ở summary."]),
    F("1.3", "削除", "Xóa", ".pbtn button.del", "button", "click", cond=CRUD, pattern="P-DEL", err=["Q01", "E38", "S02"],
      detail=["一覧の削除と同じ（Q01 → S02 → 一覧へ。貸出中 > 0 なら E38）。削除済の機種では出さない。", "Giống xóa ở danh sách (Q01 → S02 → về danh sách; đang cho mượn thì E38). Máy đã xóa không hiện."]),
    F("1.4", "編集", "Sửa", ".pbtn button.save", "button", "click", cond=CRUD, detail=["AW_MODL_003（編集）へ。削除済の機種では出さない。", "Sang AW_MODL_003 (sửa). Máy đã xóa không hiện."]),
]
D_SUM = [
    F("2", "サマリー", "Tóm tắt", ".sumbar", "area", detail=["保存済みの値から作る（編集中の値では変わらない）。", "Tạo từ giá trị đã lưu."]),
    F("2.1", "機種ID", "Mã thiết bị", ".sumbar .s::機種ID", "label"),
    F("2.2", "機種名", "Tên thiết bị", ".sumbar .s::機種名", "label"),
    F("2.3", "機種区分", "Loại thiết bị", ".sumbar .s::機種区分", "label"),
    F("2.4", "メーカー", "Hãng", ".sumbar .s::メーカー", "label"),
    F("2.5", "月額料金（税抜き）", "Phí tháng (chưa thuế)", ".sumbar .s::月額料金", "label", len=["金額＋「円」", "Số tiền + yên"]),
    F("2.6", "最低利用期間", "Thời gian dùng tối thiểu", ".sumbar .s::最低利用期間", "label", len=["整数＋「ヶ月」", "Số nguyên + tháng"]),
    F("2.7", "最大収納数", "Sức chứa tối đa", ".sumbar .s::最大収納数", "label", len=["整数＋「個」", "Số nguyên + cái"],
      detail=["冷蔵庫／冷凍庫／自販機だけ。ほかの区分は「—」。", "Chỉ tủ lạnh / tủ đông / máy bán hàng; loại khác 「—」."],
      demo_ok=["コードは電子レンジでも 50個 と出る（見本データ）。仕様が正", "Code hiện 50個 cả với lò vi sóng (dữ liệu mẫu). Spec đúng"]),
    F("2.8", "公開ステータス", "Trạng thái công khai", ".sumbar .s::公開ステータス", "label"),
    F("2.9", "貸出中", "Đang cho mượn", ".sumbar .s::貸出中", "label", len=["整数＋「台」", "Số nguyên + máy"]),
]
D_TABS = [
    F("3", "タブ", "Tab", ".tabs", "area", detail=["基本情報／料金・契約条件／貸出・履歴。", "基本情報 / 料金・契約条件 / 貸出・履歴."]),
    F("3.1", "基本情報", "Thông tin cơ bản", ".tabs [role=tab]::基本情報", "tab", "click"),
    F("3.2", "料金・契約条件", "Phí, điều kiện hợp đồng", ".tabs [role=tab]::料金・契約条件", "tab", "click"),
    F("3.3", "貸出・履歴", "Cho mượn, lịch sử", ".tabs [role=tab]::貸出・履歴", "tab", "click"),
]
D_BASIC = [
    F("4", "基本情報", "Thông tin cơ bản", "#sec-0", "area", detail=["項目の決まりは AW_MODL_003 の 3 を参照（ここは表示だけ）。見出しで開閉できる。", "Quy tắc mục xem AW_MODL_003 mục 3 (ở đây chỉ xem). Nhấn tiêu đề để đóng/mở."]),
    F("4.1", "機種ID", "Mã thiết bị", '.f[data-name="機種ID"]', "label"),
    F("4.2", "機種名", "Tên thiết bị", '.f[data-name="機種名"]', "label"),
    F("4.3", "機種名フリガナ", "Tên (Furigana)", '.f[data-name="機種名フリガナ"]', "label"),
    F("4.4", "有効状態", "Trạng thái hiệu lực", '.f[data-name="有効状態"]', "label"),
    F("4.5", "公開ステータス", "Trạng thái công khai", '.f[data-name="公開ステータス"]', "label"),
    F("4.7", "機種備考", "Ghi chú", '.f[data-name="機種備考"]', "label"),
    F("4.6", "申込での最大台数", "Số máy tối đa khi đăng ký", '.f[data-name="申込での最大台数"]', "label"),
    F("5", "規格・サイズ", "Quy cách, kích thước", "#sec-1", "area", detail=["AW_MODL_003 の 4 を参照（表示だけ）。", "Xem AW_MODL_003 mục 4 (chỉ xem)."]),
    F("5.1", "幅", "Rộng", '.f[data-name="幅"]', "label", len=["整数＋「mm」", "Số nguyên + mm"]),
    F("5.2", "奥行", "Sâu", '.f[data-name="奥行"]', "label", len=["整数＋「mm」", "Số nguyên + mm"]),
    F("5.3", "高さ", "Cao", '.f[data-name="高さ"]', "label", len=["整数＋「mm」", "Số nguyên + mm"]),
    F("5.4", "重量", "Nặng", '.f[data-name="重量"]', "label", len=["小数1桁＋「kg」", "1 số thập phân + kg"]),
    F("5.5", "容量", "Dung tích", '.f[data-name="容量"]', "label", len=["整数＋「L」", "Số nguyên + L"]),
    F("5.6", "電源", "Điện áp", '.f[data-name="電源"]', "label", len=["文字列＋「V」", "Chuỗi + V"]),
    F("5.7", "消費電力", "Công suất tiêu thụ", '.f[data-name="消費電力"]', "label", len=["整数＋「W」", "Số nguyên + W"]),
    F("6", "機種写真", "Ảnh thiết bị", "#sec-2", "area", detail=["AW_MODL_003 の 5 を参照（表示だけ）。", "Xem AW_MODL_003 mục 5 (chỉ xem)."]),
    F("6.1", "機種写真", "Ảnh", '.f[data-name="機種写真"]', "label", detail=["登録した写真を並べる（ラジオが付いている1枚がメイン）。", "Các ảnh đã đăng ký (ảnh có radio là ảnh chính)."]),
    F("7", "機種区分", "Loại thiết bị", "#sec-3", "area", detail=["AW_MODL_003 の 6 を参照（表示だけ）。区分ごとの欄は、選んだ区分のものだけ出す：冷蔵庫・冷凍庫＝7.3〜7.5（状態 005・009）、自販機＝8（006）、電子レンジ＝15（010）、資材ボックス＝16（011）、ホットウォーマー＝AW_MODL_003 の 8（見本データにないため詳細の撮影なし）。", "Xem AW_MODL_003 mục 6 (chỉ xem). Chỉ hiện ô của loại đã chọn: tủ lạnh / tủ đông = 7.3〜7.5 (005, 009), máy bán hàng = 8, 9 (006), lò vi sóng = 15 (010), hộp vật tư = 16 (011), hot warmer = AW_MODL_003 mục 9 (chưa có dữ liệu mẫu để chụp chi tiết)."]),
    F("7.1", "機種区分", "Loại thiết bị", '.f[data-name="機種区分"]', "label"),
    F("7.2", "区分の見出し", "Tiêu đề theo loại", ".ktabs", "label", detail=["6つの区分の見出し。選んだ区分だけ濃く出す（押して切り替えるものではない）。", "6 tiêu đề loại; loại đã chọn tô đậm (không nhấn để đổi)."]),
    F("7.3", "冷蔵庫／冷凍庫メーカー", "Hãng (tủ lạnh / tủ đông)", '.f[data-name="冷蔵庫／冷凍庫メーカー"]:not(.hide)', "label"),
    F("7.4", "棚数", "Số kệ", '.f[data-name="棚数"]:not(.hide)', "label"),
    F("7.5", "最大収納数（冷蔵庫／冷凍庫）", "Sức chứa tối đa (tủ lạnh / tủ đông)", '.f[data-name="最大収納数（冷蔵庫／冷凍庫）"]:not(.hide)', "label", len=["整数＋「個」", "Số nguyên + cái"]),
]
V_DETAIL = [
    {"id": "005", "code": "AW_MODL_002", "state": ["初期表示（冷蔵庫・タブ 基本情報）", "Hiển thị ban đầu (tủ lạnh, tab 基本情報)"], "url": "/ops/masters/devices/RF000001",
     "setup": "", "full": True, "wait": 600,
     "note": ["見本 RF000001 冷蔵ショーケース 48L。上から ヘッダー・サマリー・タブ。基本情報のタブは 基本情報 → 規格・サイズ → 機種写真 → 機種区分（区分ごとの欄）。", "Mẫu RF000001. Từ trên xuống: header, summary, tab. Tab 基本情報: 基本情報 → 規格・サイズ → 機種写真 → 機種区分 (ô theo loại)."],
     "items": D_HEADER + D_SUM + D_TABS + D_BASIC},
    {"id": "006", "code": "AW_MODL_002", "state": ["自販機（タブ 基本情報）", "Máy bán hàng (tab 基本情報)"], "url": "/ops/masters/devices/VM000001",
     "setup": JS + "window.scrollTo(0,q('#sec-3').offsetTop-80);", "full": True, "wait": 600,
     "note": ["見本 VM000001 カップ式自販機 VM-6010。自販機のときだけ、機種区分の中に自販機の欄・列の構成の集計・レイアウトが出る（列の構成のカードは置かない・hong 2026/10/05）。", "Mẫu VM000001. Chỉ máy bán hàng mới có ô + tổng hợp cấu hình cột + layout trong 機種区分 (không có card 列の構成, hong 2026/10/05)."],
     "items": [
         F("8", "自販機の欄", "Các ô máy bán hàng", '.f[data-name="自販機メーカー"]', "area", detail=["機種区分＝自販機 のときだけ出る。項目の決まりは AW_MODL_003 の 7。", "Chỉ khi 機種区分 = 自販機. Quy tắc xem AW_MODL_003 mục 7."]),
         F("8.1", "自販機メーカー", "Hãng máy bán hàng", '.f[data-name="自販機メーカー"]', "label"),
         F("8.2", "キャッシュレス対応", "Thanh toán không tiền mặt", '.f[data-name="キャッシュレス対応"]', "label", len=["対応する／非対応", "Có / không"]),
         F("8.3", "段数（行）", "Số tầng (hàng)", '.f[data-name="段数（行）"]', "label"),
         F("8.4", "列数", "Số cột", '.f[data-name="列数"]', "label"),
         F("8.5", "最大収納数（自販機）", "Sức chứa tối đa (máy bán hàng)", '.f[data-name="最大収納数（自販機）"]', "label", len=["整数（個）", "Số nguyên (cái)"],
           detail=["レイアウトの有効なマスの格納数の合計（自動・DECISIONS）。", "Tổng số chứa của các ô 有効 trong layout (tự tính)."],
           demo_ok=["コードの見本（428）はマスの合計と合わない（算出式の実装は宿題）。仕様が正", "Số mẫu của code (428) chưa khớp tổng các ô (宿題 tính toán). Spec đúng"]),
         F("8.6", "列の構成の集計", "Tổng hợp cấu hình cột", "#sec-3 .vml-sum", "label",
           detail=["レイアウトの上に、収納タイプ×1列の格納数ごとの列数と格納数、合計を1行で出す（例：ダブル10 5列（50個）／シングル8 24列（192個）／合計 428個）。別の表は持たず、レイアウトの有効なマスから集計する（hong 2026/10/05：基本情報の上には出さない）。月間メニューの自販機の標準数・法人Webの自販機の注文画面の枠・商品の自販機対応の判定はこの集計を使う。", "Trên layout hiện 1 dòng: số cột và số chứa theo loại × số chứa 1 cột, và tổng (vd ダブル10 5 cột (50) / シングル8 24 cột (192) / tổng 428). Không có bảng riêng; tính từ các ô 有効 của layout (hong 2026/10/05: không hiện phía trên 基本情報). 月間メニュー / màn đặt hàng máy bán hàng / phán định 自販機対応 dùng tổng hợp này."]),
         F("8.7", "自販機レイアウト", "Layout máy bán hàng", "#sec-3 table", "table",
           detail=["行 A, B, C…× 列 1, 2, 3…のマス。各マスに収納タイプ（シングル8／シングル10／ダブル8／ダブル10／ベルト5）。ダブルは横2マスを1つにまとめる。無効のマスはグレー。詳細では見るだけ。", "Ô theo hàng A, B, C… × cột 1, 2, 3…. Mỗi ô có loại chứa (シングル8 / シングル10 / ダブル8 / ダブル10 / ベルト5). ダブル gộp 2 ô ngang. Ô 無効 màu xám. Chi tiết chỉ xem."]),
     ]},
    {"id": "007", "code": "AW_MODL_002", "state": ["タブ 料金・契約条件", "Tab 料金・契約条件"], "url": "/ops/masters/devices/RF000001",
     "setup": TAB("料金・契約条件") + "window.scrollTo(0,q('#sec-0').offsetTop-80);", "full": True, "wait": 400,
     "items": [
         F("10", "標準設備対象プラン", "Phí và plan tiêu chuẩn", "#sec-0", "area", detail=["AW_MODL_003 の 11 を参照（表示だけ）。機種マスタは料金バージョンを持たない（2026/09/25）：料金を変えるときは 10.1・10.2・10.4 を直す（立っている子契約の費目行は変わらない。変更は履歴に残る）。月額リース料金の欄は持たない（自販機のリース料＝月額料金・台帳 B）。", "Xem AW_MODL_003 mục 11 (chỉ xem). 機種マスタ không có phiên bản giá (2026/09/25): đổi giá thì sửa 10.1, 10.2, 10.4 (dòng phí 子契約 đã lập không đổi; ghi 履歴). Không có ô tiền thuê tháng (tiền thuê máy bán hàng = 月額料金, 台帳 B)."]),
         F("10.1", "初期料金（税抜き）", "Phí ban đầu (chưa thuế)", '.f[data-name="初期料金（税抜き）"]', "label", len=["金額＋「円」", "Số tiền + yên"]),
         F("10.2", "月額料金（税抜き）", "Phí tháng (chưa thuế)", '.f[data-name="月額料金（税抜き）"]', "label", len=["金額＋「円」", "Số tiền + yên"]),
         F("10.3", "税率", "Thuế suất", '.f[data-name="税率"]', "label", demo_ok=H_TAX),
         F("10.4", "解約時の回収額（備品サポート費用）", "Phí thu hồi khi hủy", '.f[data-name="解約時の回収額（備品サポート費用）"]', "label", len=["金額＋「円」", "Số tiền + yên"]),
         F("10.5", "最低利用期間", "Thời gian dùng tối thiểu", '.f[data-name="最低利用期間"]', "label", len=["整数＋「ヶ月」", "Số nguyên + tháng"]),
     ]},
    {"id": "008", "code": "AW_MODL_002", "state": ["タブ 貸出・履歴", "Tab 貸出・履歴"], "url": "/ops/masters/devices/RF000001",
     "setup": TAB("貸出・履歴") + "window.scrollTo(0,q('#sec-0').offsetTop-80);", "full": True, "wait": 400,
     "items": [
         F("12", "貸出中の拠点", "Điểm đang mượn", "#sec-0", "area", detail=["この機種を貸している拠点（貸出から作る・表示だけ）。", "Các điểm đang mượn máy này (tạo từ 貸出, chỉ xem)."]),
         F("12.1", "回収未完了（アラート）", "Chưa thu hồi (cảnh báo)", '.f[data-name="回収未完了（アラート）"]', "label",
           detail=["返却予定日 < 今日 かつ 未返却数 > 0 の件数と拠点ID。", "Số dòng (và 拠点ID) có 返却予定日 < hôm nay và 未返却数 > 0."]),
         F("12.2", "貸出ステータス（絞り込み）", "Lọc theo 貸出ステータス", 'select[aria-label="貸出ステータス"]', "select", "select", req="－",
           len=["選択（回収済を除く／すべて／配送中／貸出中／回収依頼中／未返却／回収済）", "Chọn (trừ đã thu hồi / tất cả / đang giao / đang mượn / yêu cầu thu hồi / chưa trả / đã thu hồi)"], init=["回収済を除く", "Trừ đã thu hồi"], ex=["回収済", "Xem cả các máy đã thu hồi"],
           detail=["表の上のドロップダウンで絞り込む（一覧の検索と同じ形）。既定は「回収済を除く」。「回収済も表示」のトグルボタンは置かない（hong 2026/10/05）。", "Dropdown phía trên bảng (giống tìm kiếm ở danh sách). Mặc định 「回収済を除く」. Không dùng nút toggle 「回収済も表示」 (hong 2026/10/05)."]),
         F("12.3", "CSVエクスポート", "Xuất CSV", '.f[data-name="CSVエクスポート"] button', "button", "click", detail=["下の表を CSV で書き出す（リコール・入替の連絡に使う）。", "Xuất bảng dưới ra CSV (dùng liên lạc thu hồi / đổi máy)."]),
         F("12.4", "貸出中 合計", "Tổng đang cho mượn", '.f[data-name="貸出中 合計"] input', "label", detail=["「n 台（m拠点）」。", "「n 台（m拠点）」."]),
         F("12.5", "貸出中の拠点の表", "Bảng điểm đang mượn", "#sec-0 table", "table", pattern="P-LIST",
           detail=["貸出ID（拠点の設備・オプションへリンク）／拠点ID／拠点名／個体番号／未返却数／貸出日／返却予定日（空欄＝期限なし）／貸出ステータス（配送中／貸出中／回収依頼中／回収済／未返却）。1ページ 10件でページ送り（4 と同じ形・表示件数 10／20／50）。並びは 貸出日 の新しい順（返却予定日を過ぎた行は上に赤い印）。12.4 の合計は表の全件から数える（hong 2026/10/05）。", "貸出ID (link sang 設備・オプション của điểm) / 拠点ID / 拠点名 / 個体番号 / 未返却数 / 貸出日 / 返却予定日 (trống = không hạn) / 貸出ステータス. Phân trang 10 dòng/trang (giống mục 4; 10/20/50). Sắp theo 貸出日 mới trước (quá 返却予定日 thì lên đầu, đánh dấu đỏ). Tổng ở 12.4 tính trên toàn bộ (hong 2026/10/05)."],
           demo_ok=["コードはページ送りがなく、合計（96台）も見本の文字で表の行数（4）と合っていない（受付簿 #81）。仕様が正", "Code chưa có phân trang; tổng (96台) là chữ mẫu, không khớp số dòng (4) (受付簿 #81). Spec đúng"]),
         F("13", "履歴（機種マスタ）", "Lịch sử (機種マスタ)", "#sec-1", "table",
           detail=["機種マスタの変更（手入力・CSV取込）を新しい順に出す。", "Thay đổi của máy (nhập tay, CSV) mới nhất trước."]),
         F("13.1", "変更日時", "Thời điểm", "#sec-1 th::変更日時", "label", len=["日時 yyyy-mm-dd HH:MM", "yyyy-mm-dd HH:MM"]),
         F("13.2", "変更内容", "Nội dung", "#sec-1 th::変更内容", "label", detail=["項目名「変更前」→「変更後」。", "Tên mục 「trước」→「sau」."]),
         F("13.3", "変更者", "Người thay đổi", "#sec-1 th::変更者", "label"),
         F("13.4", "変更区分", "Loại thay đổi", "#sec-1 th::変更区分", "label", len=["手入力／CSV取込", "Nhập tay / nhập CSV"], detail=["機種マスタの変更は契約・拠点に影響しない（契約は設定した時点の機種の値を持つ・hong 2026/10/05）。料金バージョンは持たない（2026/09/25）。", "Thay đổi 機種マスタ không ảnh hưởng hợp đồng / điểm (hợp đồng giữ giá trị lúc thiết lập, hong 2026/10/05). Không có phiên bản giá."]),
     ]},
    {"id": "009", "code": "AW_MODL_002", "state": ["冷凍庫（タブ 基本情報）", "Tủ đông (tab 基本情報)"], "url": "/ops/masters/devices/FZ000001",
     "setup": JS + "window.scrollTo(0,q('#sec-3').offsetTop-80);", "full": False, "wait": 600,
     "note": ["見本 FZ000001 業務用冷凍庫 FZ-600。冷凍庫の欄は冷蔵庫と同じ（メーカー・棚数・最大収納数）。機種IDの接頭辞は FZ。", "Mẫu FZ000001. Ô của tủ đông giống tủ lạnh (hãng, số kệ, sức chứa). Tiền tố ID là FZ."],
     "items": [
         F("14", "冷凍庫の欄", "Các ô tủ đông", '.f[data-name="冷蔵庫／冷凍庫メーカー"]:not(.hide)', "area", detail=["7.3〜7.5 と同じ。最大収納数は冷凍の1回の納品数との判定に使う（⑫-2）。", "Giống 7.3〜7.5. 最大収納数 dùng để so với 1回の納品数 của 冷凍 (⑫-2)."]),
     ]},
    {"id": "010", "code": "AW_MODL_002", "state": ["電子レンジ（タブ 基本情報）", "Lò vi sóng (tab 基本情報)"], "url": "/ops/masters/devices/MW000001",
     "setup": JS + "window.scrollTo(0,q('#sec-3').offsetTop-80);", "full": False, "wait": 600,
     "note": ["見本 MW000001 電子レンジ。最大収納数は持たない。", "Mẫu MW000001. Không có 最大収納数."],
     "items": [
         F("15", "電子レンジの欄", "Các ô lò vi sóng", '.f[data-name="電子レンジメーカー"]', "area", detail=["項目の決まりは AW_MODL_003 の 9。", "Quy tắc xem AW_MODL_003 mục 10."]),
         F("15.1", "電子レンジメーカー", "Hãng lò vi sóng", '.f[data-name="電子レンジメーカー"]', "label"),
         F("15.2", "出力", "Công suất", '.f[data-name="出力"]', "label", len=["整数＋「W」", "Số nguyên + W"]),
         F("15.3", "庫内容量", "Dung tích khoang", '.f[data-name="庫内容量"]', "label", len=["整数＋「L」", "Số nguyên + L"]),
     ]},
    {"id": "011", "code": "AW_MODL_002", "state": ["資材ボックス（タブ 基本情報）", "Hộp vật tư (tab 基本情報)"], "url": "/ops/masters/devices/BX000001",
     "setup": JS + "window.scrollTo(0,q('#sec-3').offsetTop-80);", "full": False, "wait": 600,
     "note": ["見本 BX000001 ボックス《仕切り皿》。区分ごとの欄・最大収納数は持たない（28-162）。メーカーは「—」。", "Mẫu BX000001. Không có ô riêng và 最大収納数 (28-162). Hãng 「—」."],
     "items": [
         F("16", "資材ボックスの欄", "Ô hộp vật tư", '.f[data-name="資材ボックスの欄"]', "label", detail=["AW_MODL_003 の 10 と同じ（説明文だけ）。", "Giống AW_MODL_003 mục 11 (chỉ chú thích)."]),
     ]},
]

# ================================================================ AW_MODL_003 登録・編集
N_HEADER = [
    F("1", "ヘッダー", "Đầu trang", ".phead", "area"),
    F("1.1", "パンくず", "Breadcrumb", ".crumb", "label", detail=["「マスタ管理 / 機種マスタ一覧 / 機種新規登録（または 機種編集）」。", "「マスタ管理 / 機種マスタ一覧 / 機種新規登録 (hoặc 機種編集)」."]),
    F("1.2", "画面名", "Tên màn hình", ".phead h2", "label", detail=["新規登録「機種新規登録」、編集「機種編集」＋機種ID。編集ではサマリー（AW_MODL_002 の 2）も出す。", "Mới: 「機種新規登録」; sửa: 「機種編集」 + 機種ID. Màn sửa có thêm summary (AW_MODL_002 mục 2)."]),
    F("1.3", "キャンセル", "Hủy", ".pbtn button.cancel", "button", "click", err=["Q02"],
      detail=["入力を変えていれば Q02（状態 021）。新規登録・一覧から来た編集は一覧へ、詳細から来た編集は詳細へ戻る。", "Đã sửa thì Q02 (trạng thái 021). Mới / sửa từ danh sách → về danh sách; sửa từ chi tiết → về chi tiết."]),
    F("1.4", "登録／保存", "Đăng ký / Lưu", ".pbtn button.save", "button", "click", pattern="P-FORMBOX", err=["S01", "E31", "E36", "E02"],
      detail=["新規登録「登録」・編集「保存」。全項目をまとめてチェック（必須 E01・数値 E14・文字数 E04、機種区分が未選択なら E02）。通ったら S01、新規は採番した ID（区分2文字＋6桁）の詳細へ、編集は詳細へ。削除済の機種は E36。",
              "Mới: 「登録」; sửa: 「保存」. Kiểm tra mọi mục cùng lúc (bắt buộc E01, số E14, độ dài E04, chưa chọn 機種区分 thì E02). Qua thì S01; mới → chi tiết của ID vừa cấp (2 chữ + 6 số), sửa → chi tiết. Máy đã xóa: E36."]),
]
N_TABS = [
    F("2", "タブ", "Tab", ".tabs", "area", detail=["AW_MODL_002 の 3 と同じ。保存時にエラーの項目がほかのタブにあれば、そのタブを開く。貸出・履歴のタブは新規登録では空（表示だけ）。", "Giống AW_MODL_002 mục 3. Lỗi ở tab khác thì mở tab đó khi lưu. Tab 貸出・履歴 ở màn mới thì trống (chỉ xem)."]),
]
N_BASIC = [
    F("3", "基本情報", "Thông tin cơ bản", "#sec-0", "area", pattern="P-FORMBOX"),
    F("3.1", "機種ID", "Mã thiết bị", '.f[data-name="機種ID"]', "label", len=["文字列 2文字＋6桁", "2 chữ + 6 số"],
      init=["新規「（登録時に採番）」／編集は採番済みの ID", "Mới: 「（登録時に採番）」; sửa: ID đã cấp"],
      detail=["システムが採番。接頭辞は機種区分で決まる（RF＝冷蔵庫・FZ＝冷凍庫・VM＝自販機・MW＝電子レンジ・HW＝ホットウォーマー・BX＝資材ボックス）＋6桁の連番。採番後は変えない。物理名 model.no。", "Hệ thống cấp. Tiền tố theo 機種区分 (RF / FZ / VM / MW / HW / BX) + 6 số. Không đổi sau khi cấp. model.no."]),
    F("3.2", "機種名", "Tên thiết bị", '.f[data-name="機種名"] input', "text", "input", req="○", len="文字列 60",
      init=["空", "Trống"], ex=["冷蔵ショーケース 48L", "Tên hiện ở màn đăng ký, hợp đồng, hóa đơn"], err=["E01", "E04", "E13"],
      detail=["申込画面・契約画面・請求書の設備名に使う。物理名 model.name。", "Dùng làm tên thiết bị ở 申込, 契約, hóa đơn. model.name."], demo_ok=H_MAXLEN),
    F("3.3", "機種名フリガナ", "Tên (Furigana)", '.f[data-name="機種名フリガナ"] input', "text", "input", req="○", len="文字列 60",
      init=["空", "Trống"], ex=["レイゾウショーケース 48L", "Katakana toàn góc; chữ/số của model giữ nguyên"], err=["E01", "E03", "E04"],
      valid=["全角カタカナ（型番の英数字はそのまま）。", "Katakana toàn góc (chữ số của model giữ nguyên)."], detail=["物理名 model.name_kana。", "model.name_kana."], demo_ok=H_MAXLEN),
    F("3.4", "有効状態", "Trạng thái hiệu lực", '.f[data-name="有効状態"] select', "select", "select", req="○",
      len=["選択（有効／無効）", "Chọn (hiệu lực / vô hiệu)"], init=["有効", "有効 (hiệu lực)"], ex=["有効", "無効 = không chọn mới được; máy đang cho mượn giữ nguyên"],
      detail=["無効にしても、すでに貸し出している設備はそのまま。新規に選べなくなるだけ。削除済は削除の操作で付く。物理名 model.status。", "無効 thì máy đang cho mượn giữ nguyên, chỉ không chọn mới. 削除済 là do thao tác xóa. model.status."]),
    F("3.5", "公開ステータス", "Trạng thái công khai", '.f[data-name="公開ステータス"] select', "select", "select", req="○",
      len=["選択（公開／非公開）", "Chọn (công khai / không công khai)"], init=["公開", "公開 (công khai)"], ex=["公開", "公開 = hiện ở 追加でご希望の設備 trên 法人Web"],
      detail=["公開＝法人Webの申込・変更の設備一覧に出す。非公開＝運営だけが選べる（2026/10/01 統一・旧 公開区分）。同じ区分でサイズごとに1機種だけ公開する。物理名 model.public_status。", "公開 = hiện ở danh sách thiết bị khi đăng ký/đổi trên 法人Web. 非公開 = chỉ 運営 chọn được (thống nhất 2026/10/01). Mỗi cỡ 1 máy công khai. model.public_status."]),
    F("3.6", "申込での最大台数", "Số máy tối đa khi đăng ký", '.f[data-name="申込での最大台数"] input', "text", "input", req="－", len=["整数 1〜99（台）", "Số nguyên 1–99"],
      init=["空", "Trống"], ex=["3", "1 điểm đăng ký tối đa bao nhiêu máy trên 法人Web (tủ lạnh 3, lò vi sóng 2, hộp 9)"], err=["E14", "E12"],
      detail=["1拠点あたり何台まで法人Webから申し込めるか。超えた分は「担当者へご相談ください」。物理名 model.form_max_qty。", "1 điểm đăng ký tối đa bao nhiêu máy trên 法人Web; quá thì 「担当者へご相談ください」. model.form_max_qty."]),
    F("3.7", "機種備考", "Ghi chú", '.f[data-name="機種備考"] textarea', "textarea", "input", req="－", len=["文字列 500（複数行）", "Chuỗi 500 (nhiều dòng)"],
      init=["空", "Trống"], ex=["高出力・連続使用対応", "Ghi chú nội bộ"], err=["E04", "E13"], detail=["物理名 model.note。", "model.note."], demo_ok=H_MAXLEN),
]
N_SIZE = [
    F("4", "規格・サイズ", "Quy cách, kích thước", "#sec-1", "area", pattern="P-FORMBOX", detail=["搬入経路・床の耐荷重・コンセントの確認に使う。", "Dùng kiểm tra lối vận chuyển, tải sàn, ổ điện."]),
    F("4.1", "幅", "Rộng", '.f[data-name="幅"] input', "text", "input", req="○", len=["整数 1〜99,999（mm）", "Số nguyên 1–99.999 (mm)"], init=["空", "Trống"], ex=["1200", "mm"], err=["E01", "E14"], detail=["物理名 model.width_mm。", "model.width_mm."]),
    F("4.2", "奥行", "Sâu", '.f[data-name="奥行"] input', "text", "input", req="○", len=["整数 1〜99,999（mm）", "Số nguyên 1–99.999 (mm)"], init=["空", "Trống"], ex=["800", "mm"], err=["E01", "E14"], detail=["物理名 model.depth_mm。", "model.depth_mm."]),
    F("4.3", "高さ", "Cao", '.f[data-name="高さ"] input', "text", "input", req="○", len=["整数 1〜99,999（mm）", "Số nguyên 1–99.999 (mm)"], init=["空", "Trống"], ex=["1950", "mm"], err=["E01", "E14"], detail=["物理名 model.height_mm。", "model.height_mm."]),
    F("4.4", "重量", "Nặng", '.f[data-name="重量"] input', "text", "input", req="○", len=["数値 0.1〜99,999.9（kg・小数1桁）", "Số 0,1–99.999,9 (kg, 1 số thập phân)"], init=["空", "Trống"], ex=["130.0", "kg"], err=["E01", "E14"], detail=["物理名 model.weight_kg。", "model.weight_kg."]),
    F("4.5", "容量", "Dung tích", '.f[data-name="容量"] input', "text", "input", req="－", len=["整数 1〜99,999（L）", "Số nguyên 1–99.999 (L)"], init=["空", "Trống"], ex=["48", "L"], err=["E14"], detail=["物理名 model.capacity_l。", "model.capacity_l."]),
    F("4.6", "電源", "Điện áp", '.f[data-name="電源"] input', "text", "input", req="－", len="文字列 20", init=["空", "Trống"], ex=["100-200", "V, vd 100 hoặc 100-200"], err=["E04"], detail=["物理名 model.power_v。", "model.power_v."], demo_ok=H_MAXLEN),
    F("4.7", "消費電力", "Công suất tiêu thụ", '.f[data-name="消費電力"] input', "text", "input", req="－", len=["整数 1〜99,999（W）", "Số nguyên 1–99.999 (W)"], init=["空", "Trống"], ex=["400", "W"], err=["E14"], detail=["物理名 model.watt。", "model.watt."]),
]
N_PHOTO = [
    F("5", "機種写真", "Ảnh thiết bị", "#sec-2", "area", detail=["申込画面と搬入経路の確認に使う。", "Dùng ở màn đăng ký và kiểm tra lối vận chuyển."]),
    F("5.1", "機種写真", "Ảnh", '.f[data-name="機種写真"]', "file", "input", req="－", len=["画像 jpg／png・1枚 5MB まで・10枚まで", "Ảnh jpg/png, mỗi ảnh ≤5MB, tối đa 10"],
      init=["なし", "Không"], ex=["refrigerator_48l.jpg", "Nhiều ảnh; thêm bằng 写真を追加; rê chuột lên ảnh để xem/xóa"], err=["E11"],
      detail=["複数枚登録できる。「写真を追加」で足し、写真にカーソルを当てると表示・削除のボタンが出る。写真の下のラジオで1枚をメインにする（一覧・申込画面に出す。写真があるときは必須）。物理名 model_photo.file／is_main。", "Đăng ký nhiều ảnh. 写真を追加 để thêm; rê chuột lên ảnh có nút xem/xóa. Radio dưới ảnh chọn 1 ảnh chính (hiện ở danh sách, màn đăng ký; bắt buộc khi có ảnh). model_photo.file / is_main."],
      demo_ok=["コードは見本の3枚とラジオだけ（追加・削除は未実装）。仕様が正", "Code chỉ có 3 ảnh mẫu + radio (chưa thêm/xóa). Spec đúng"]),
]
N_KUBUN = [
    F("6", "機種区分", "Loại thiết bị", "#sec-3", "area", pattern="P-FORMBOX",
      detail=["区分を選ぶと、その区分の欄だけ出す（ほかの区分の見出しは薄く）。編集では区分を変えられない（機種IDの接頭辞が変わるため）。", "Chọn loại thì chỉ hiện ô của loại đó (tiêu đề loại khác mờ). Màn sửa không đổi được loại (vì tiền tố 機種ID)."],
      demo_ok=["コードは編集でも区分を変えられる（宿題）。仕様が正", "Code vẫn cho đổi loại khi sửa (宿題). Spec đúng"]),
    F("6.1", "機種区分", "Loại thiết bị", '.f[data-name="機種区分"] select', "select", "select", req="○",
      len=["選択（冷蔵庫／冷凍庫／自販機／電子レンジ／ホットウォーマー／資材ボックス）", "Chọn (tủ lạnh / tủ đông / máy bán hàng / lò vi sóng / hot warmer / hộp vật tư)"],
      init=["冷蔵庫", "冷蔵庫 (tủ lạnh)"], ex=["自販機", "Quyết định tiền tố ID và các ô bên dưới"], err=["E02"],
      detail=["物理名 model.category。", "model.category."]),
    F("6.2", "区分の見出し", "Tiêu đề theo loại", ".ktabs", "label", detail=["選んだ区分だけ濃く出す（表示だけ）。", "Loại đã chọn tô đậm (chỉ xem)."]),
    F("6.3", "冷蔵庫／冷凍庫メーカー", "Hãng (tủ lạnh / tủ đông)", '.f[data-name="冷蔵庫／冷凍庫メーカー"]:not(.hide) select', "select", "select", req="条件付き",
      len=["選択（ホシザキ／パナソニック／フクシマガリレイ）", "Chọn (Hoshizaki / Panasonic / Fukushima Galilei)"], init=["ホシザキ", "Hoshizaki"], ex=["ホシザキ", "Bắt buộc khi loại = tủ lạnh / tủ đông"],
      cond=["機種区分＝冷蔵庫／冷凍庫 のとき", "Khi 機種区分 = 冷蔵庫 / 冷凍庫"], err=["E02"], detail=["固定の選択肢（DECISIONS）。物理名 model.maker。", "Danh sách cố định. model.maker."]),
    F("6.4", "棚数", "Số kệ", '.f[data-name="棚数"]:not(.hide) input', "text", "input", req="－", len=["整数 1〜99", "Số nguyên 1–99"], init=["空", "Trống"], ex=["6", "Số kệ"],
      cond=["機種区分＝冷蔵庫／冷凍庫 のとき", "Khi 機種区分 = 冷蔵庫 / 冷凍庫"], err=["E14"], detail=["物理名 model.shelf_count。", "model.shelf_count."]),
    F("6.5", "最大収納数（冷蔵庫／冷凍庫）", "Sức chứa tối đa (tủ lạnh / tủ đông)", '.f[data-name="最大収納数（冷蔵庫／冷凍庫）"]:not(.hide) input', "text", "input", req="条件付き", len=["整数 1〜9,999（個）", "Số nguyên 1–9.999 (cái)"],
      init=["空", "Trống"], ex=["50", "Số suất chứa được; dùng chọn cỡ tủ theo 1回の納品数"], cond=["機種区分＝冷蔵庫／冷凍庫 のとき必須", "Bắt buộc khi 機種区分 = 冷蔵庫 / 冷凍庫"], err=["E01", "E14"],
      detail=["法人申込フォームのサイズ選択で「1回の納品数が入るか」の判定に使う（冷蔵庫＝冷蔵・常温の1回の納品数、冷凍庫＝冷凍の1回の納品数。2026/09/23 ⑫-2）。物理名 model.max_items。", "Dùng ở form đăng ký để kiểm tra 1回の納品数 có vừa không (tủ lạnh = 冷蔵・常温, tủ đông = 冷凍; ⑫-2 2026/09/23). model.max_items."]),
]
N_VM = [
    F("7", "自販機の欄", "Các ô máy bán hàng", '.f[data-name="自販機メーカー"]', "area", pattern="P-FORMBOX", detail=["機種区分＝自販機 のときだけ出す。", "Chỉ khi 機種区分 = 自販機."]),
    F("7.1", "自販機メーカー", "Hãng máy bán hàng", '.f[data-name="自販機メーカー"] select', "select", "select", req="条件付き",
      len=["選択（富士電機／サンデン・リテールシステム）", "Chọn (Fuji Electric / Sanden Retail Systems)"], init=["富士電機", "Fuji Electric"], ex=["富士電機", "Bắt buộc khi loại = máy bán hàng"],
      cond=["機種区分＝自販機 のとき", "Khi 機種区分 = 自販機"], err=["E02"], detail=["固定の選択肢。物理名 model.maker。", "Danh sách cố định. model.maker."]),
    F("7.2", "キャッシュレス対応", "Thanh toán không tiền mặt", '.f[data-name="キャッシュレス対応"]', "radio", "check", req="条件付き", len=["ラジオ（対応する／非対応）", "Radio (có / không)"],
      init=["対応する", "対応する (có)"], ex=["対応する", "Có / không hỗ trợ cashless"], cond=["機種区分＝自販機 のとき", "Khi 機種区分 = 自販機"], detail=["物理名 model.cashless。", "model.cashless."]),
    F("7.3", "段数（行）", "Số tầng (hàng)", '.f[data-name="段数（行）"] input', "text", "input", req="条件付き", len=["整数 1〜26", "Số nguyên 1–26"], init=["空", "Trống"], ex=["6", "Số hàng A, B, C… của layout"],
      cond=["機種区分＝自販機 のとき必須", "Bắt buộc khi 機種区分 = 自販機"], err=["E01", "E14", "E12"], detail=["レイアウトの行数（A, B, C…）。物理名 model.vm_rows。", "Số hàng của layout (A, B, C…). model.vm_rows."]),
    F("7.4", "列数", "Số cột", '.f[data-name="列数"] input', "text", "input", req="条件付き", len=["整数 1〜99", "Số nguyên 1–99"], init=["空", "Trống"], ex=["10", "Số cột 1, 2, 3… của layout"],
      cond=["機種区分＝自販機 のとき必須", "Bắt buộc khi 機種区分 = 自販機"], err=["E01", "E14", "E12"], detail=["レイアウトの列数。物理名 model.vm_cols。", "Số cột của layout. model.vm_cols."]),
    F("7.5", "最大収納数（自販機）", "Sức chứa tối đa (máy bán hàng)", '.f[data-name="最大収納数（自販機）"]', "label", len=["整数（個）", "Số nguyên (cái)"],
      detail=["自動（読み取り専用）：レイアウトの有効なマスの格納数の合計（シングル8＝8・シングル10＝10・ダブル8＝8・ダブル10＝10・ベルト5＝5）。法人申込のサイズ判定と W03（プランマスタ）に使う。物理名 model.max_items。", "Tự tính (chỉ xem): tổng số chứa của các ô 有効 (シングル8=8, シングル10=10, ダブル8=8, ダブル10=10, ベルト5=5). Dùng chọn cỡ ở 法人申込 và W03 (プランマスタ). model.max_items."],
      demo_ok=["コードの見本の値はマスの合計と合わない（算出式の実装は宿題）。仕様が正", "Giá trị mẫu của code chưa khớp tổng ô (宿題). Spec đúng"]),
    F("7.6", "レイアウト生成", "Tạo layout", '.f[data-name="レイアウト生成"] button', "button", "click", err=["W04"],
      detail=["段数（行）× 列数 のマスを作る。作った直後はすべて「シングル8」・有効。すでにマスがあるときは W04 で確認してから作り直す（前の設定は消える）。", "Tạo ô 段数 × 列数. Mới tạo thì toàn bộ シングル8, 有効. Đã có ô thì hỏi W04 rồi tạo lại (thiết lập cũ mất)."],
      demo_ok=["コードは確認なしで作り直す（W04 は宿題）。仕様が正", "Code tạo lại không hỏi (W04 là 宿題). Spec đúng"]),
    F("7.7", "列の構成の集計", "Tổng hợp cấu hình cột", "#sec-3 .vml-sum", "label",
      detail=["AW_MODL_002 の 8.6 と同じ（レイアウトの有効なマスから自動で集計。編集でも手で直せない）。", "Giống AW_MODL_002 mục 8.6 (tự tính từ layout; không sửa tay)."]),
    F("7.8", "自販機レイアウト", "Layout máy bán hàng", "#sec-3 table", "table",
      detail=["マスを選ぶ（行見出し A, B… を押すと行ごと選べる）。選んだマスに 7.9・7.10 を当てる。ダブルは横2マスを1つにまとめる。無効のマスはグレー。物理名 model_vm_cell（row／col／slot_type／span／enabled）。", "Chọn ô (nhấn tiêu đề hàng A, B… để chọn cả hàng) rồi dùng 8.8, 8.9. ダブル gộp 2 ô ngang. Ô 無効 màu xám. model_vm_cell (row / col / slot_type / span / enabled)."]),
    F("7.9", "収納タイプ", "Loại chứa", "#sec-3 button.vt", "button", "click",
      cond=["マスを選んでいるときだけ活性", "Chỉ bật khi đang chọn ô"], detail=["シングル8／シングル10／ダブル8／ダブル10／ベルト5 を選んだマスに当てる。数字＝1マスの収納数。", "Gán シングル8 / シングル10 / ダブル8 / ダブル10 / ベルト5 cho ô đã chọn. Số = sức chứa 1 ô."]),
    F("7.10", "有効／無効", "Hiệu lực / vô hiệu", "#sec-3 button.ve", "button", "click",
      cond=["マスを選んでいるときだけ活性", "Chỉ bật khi đang chọn ô"], detail=["選んだマスを無効（使わないマス・グレー）にする／有効に戻す。無効のマスは最大収納数に数えない。", "Đặt ô đã chọn thành 無効 (không dùng, xám) / 有効. Ô 無効 không tính vào 最大収納数."]),
]
N_HW = [
    F("8", "ホットウォーマーの欄", "Các ô hot warmer", '.f[data-name="ホットウォーマーメーカー"]', "area", pattern="P-FORMBOX", detail=["機種区分＝ホットウォーマー のときだけ出す。最大収納数は持たない。", "Chỉ khi 機種区分 = ホットウォーマー. Không có 最大収納数."]),
    F("8.1", "ホットウォーマーメーカー", "Hãng hot warmer", '.f[data-name="ホットウォーマーメーカー"] select', "select", "select", req="条件付き",
      len=["選択（アンナカ／タイジ）", "Chọn (Annaka / Taiji)"], init=["アンナカ", "Annaka"], ex=["アンナカ", "Bắt buộc khi loại = hot warmer"], cond=["機種区分＝ホットウォーマー のとき", "Khi 機種区分 = ホットウォーマー"], err=["E02"], detail=["物理名 model.maker。", "model.maker."]),
    F("8.2", "保温温度", "Nhiệt độ giữ ấm", '.f[data-name="保温温度"] input', "text", "input", req="－", len=["整数 1〜999（℃）", "Số nguyên 1–999 (℃)"], init=["空", "Trống"], ex=["60", "℃"],
      cond=["機種区分＝ホットウォーマー のとき", "Khi 機種区分 = ホットウォーマー"], err=["E14"], detail=["単位 ℃（DECISIONS）。欄の横に「℃」を出す。物理名 model.keep_temp。", "Đơn vị ℃; hiện 「℃」 cạnh ô. model.keep_temp."],
      demo_ok=["コードは単位の表示がない。仕様が正", "Code chưa hiện đơn vị. Spec đúng"]),
    F("8.3", "段数", "Số tầng", '.f[data-name="段数"]:not(.hide) input', "text", "input", req="－", len=["整数 1〜99", "Số nguyên 1–99"], init=["空", "Trống"], ex=["3", "Số tầng"],
      cond=["機種区分＝ホットウォーマー のとき", "Khi 機種区分 = ホットウォーマー"], err=["E14"], detail=["物理名 model.tiers。", "model.tiers."]),
]
N_MW = [
    F("9", "電子レンジの欄", "Các ô lò vi sóng", '.f[data-name="電子レンジメーカー"]', "area", pattern="P-FORMBOX", detail=["機種区分＝電子レンジ のときだけ出す。最大収納数は持たない。", "Chỉ khi 機種区分 = 電子レンジ. Không có 最大収納数."]),
    F("9.1", "電子レンジメーカー", "Hãng lò vi sóng", '.f[data-name="電子レンジメーカー"] select', "select", "select", req="条件付き",
      len=["選択（パナソニック／シャープ）", "Chọn (Panasonic / Sharp)"], init=["パナソニック", "Panasonic"], ex=["パナソニック", "Bắt buộc khi loại = lò vi sóng"], cond=["機種区分＝電子レンジ のとき", "Khi 機種区分 = 電子レンジ"], err=["E02"], detail=["物理名 model.maker。", "model.maker."]),
    F("9.2", "出力", "Công suất", '.f[data-name="出力"] input', "text", "input", req="条件付き", len=["整数 1〜9,999（W）", "Số nguyên 1–9.999 (W)"], init=["空", "Trống"], ex=["1200", "W"],
      cond=["機種区分＝電子レンジ のとき必須", "Bắt buộc khi 機種区分 = 電子レンジ"], err=["E01", "E14"], detail=["物理名 model.output_w。", "model.output_w."]),
    F("9.3", "庫内容量", "Dung tích khoang", '.f[data-name="庫内容量"] input', "text", "input", req="－", len=["整数 1〜999（L）", "Số nguyên 1–999 (L)"], init=["空", "Trống"], ex=["26", "L"],
      cond=["機種区分＝電子レンジ のとき", "Khi 機種区分 = 電子レンジ"], err=["E14"], detail=["物理名 model.inner_capacity_l。", "model.inner_capacity_l."]),
]
N_BX = [
    F("10", "資材ボックスの欄", "Ô hộp vật tư", '.f[data-name="資材ボックスの欄"]', "label",
      detail=["機種区分＝資材ボックス のときは区分ごとの欄・最大収納数を持たない（28-162）。説明文だけ出す。種類ごとに1機種で登録する（《仕切り皿》《深皿》《フード類》・タンス型ボックス（大）・カゴ。28-161）。初期料金・月額料金は 0 円。", "Loại 資材ボックス không có ô riêng và 最大収納数 (28-162); chỉ hiện chú thích. Mỗi loại hộp đăng ký 1 máy (28-161). Phí ban đầu / tháng = 0."]),
]
N_FEE = [
    F("11", "標準設備対象プラン（料金）", "Phí và plan tiêu chuẩn", "#sec-0", "area", pattern="P-FORMBOX",
      detail=["すべて税抜。子契約の①費目行に税抜のまま入り、消費税は請求書で上乗せ（2026/09/25）。", "Tất cả chưa thuế; vào dòng phí ① của 子契約 chưa thuế, thuế cộng ở hóa đơn (2026/09/25)."]),
    F("11.1", "初期料金（税抜き）", "Phí ban đầu (chưa thuế)", '.f[data-name="初期料金（税抜き）"] input', "text", "input", req="○", len=["金額（整数・0〜999,999,999・税抜）", "Số tiền (nguyên, chưa thuế)"],
      init=["空", "Trống"], ex=["40000", "Phí 1 lần khi lắp đặt; 0 cũng được (hộp vật tư = 0)"], err=["E01", "E14"],
      detail=["設置時に1回だけかかる額。自販機の初期費用は OP000008 の初期値になる（台帳 B）。物理名 model.initial_fee。", "Phí 1 lần khi lắp. Với máy bán hàng là giá mặc định của OP000008 (台帳 B). model.initial_fee."]),
    F("11.2", "月額料金（税抜き）", "Phí tháng (chưa thuế)", '.f[data-name="月額料金（税抜き）"] input', "text", "input", req="○", len=["金額（整数・0〜999,999,999・税抜）", "Số tiền (nguyên, chưa thuế)"],
      init=["空", "Trống"], ex=["5000", "Phí mỗi tháng; máy bán hàng = tiền thuê (giá mặc định OP000037)"], err=["E01", "E14"],
      detail=["毎月かかる額。自販機のリース料はこの値（OP000037 自販機リースの1台の初期値・台帳 B）。物理名 model.monthly_fee。", "Phí mỗi tháng. Tiền thuê máy bán hàng = giá trị này (mặc định của OP000037, 台帳 B). model.monthly_fee."]),
    F("11.3", "税率", "Thuế suất", '.f[data-name="税率"]', "select", "select", req="○", len=["選択（税率マスタ）", "Chọn (master thuế suất)"], init=["10%", "10%"], ex=["10%", "Thuế suất cho 12.1, 12.2, 12.4"],
      detail=["初期料金・月額料金・解約時の回収額の税率。税率マスタから選ぶ（台帳 E・受付簿 #38）。物理名 model.tax_rate_id。", "Thuế suất của 12.1, 12.2, 12.4. Chọn từ 税率マスタ (台帳 E, 受付簿 #38). model.tax_rate_id."], demo_ok=H_TAX),
    F("11.4", "解約時の回収額（備品サポート費用）", "Phí thu hồi khi hủy", '.f[data-name="解約時の回収額（備品サポート費用）"] input', "text", "input", req="－", len=["金額（整数・0〜999,999,999・税抜）", "Số tiền (nguyên, chưa thuế)"],
      init=["空", "Trống"], ex=["15000", "Cơ sở tính 違約金 = số này × tháng còn lại ÷ 最低利用期間"], err=["E14"],
      detail=["最低利用期間内に解約したときの1台あたりの違約金の元になる額。違約金 ＝ この額 × 残りの月数 ÷ 最低利用期間（台帳「違約金」）。画面の注記「※無料対象プランであっても、最低利用期間内の解約には違約金が発生します」。物理名 model.cancel_fee。", "Cơ sở tính 違約金 khi hủy trong 最低利用期間: 違約金 = số này × tháng còn lại ÷ 最低利用期間 (台帳). Chú thích trên màn hình như spec. model.cancel_fee."]),
    F("11.5", "最低利用期間", "Thời gian dùng tối thiểu", '.f[data-name="最低利用期間"] input', "text", "input", req="－", len=["整数 0〜99（ヶ月）", "Số nguyên 0–99 (tháng)"],
      init=["空", "Trống"], ex=["3", "Tủ lạnh 3, máy bán hàng 12; 0 / trống = không có"], err=["E14", "E12"],
      detail=["貸出日 ＋ この期間 − 1日 が設備ごとの満了日。休止中は数えない（台帳）。物理名 model.min_term_months。", "Ngày mượn + kỳ này − 1 ngày = ngày hết hạn của máy. Không tính thời gian tạm dừng (台帳). model.min_term_months."]),
]
V_FORM = [
    {"id": "012", "code": "AW_MODL_003", "state": ["新規登録 初期表示（冷蔵庫）", "Đăng ký mới (tủ lạnh)"], "url": "/ops/masters/devices/new",
     "setup": "", "full": True, "wait": 600,
     "note": ["CRUD の役割だけが開ける。入力の共通基準（空白・全角→半角・文字数）は P-FORMBOX。機種区分の初期値は冷蔵庫。", "Chỉ vai trò CRUD mở được. Quy tắc nhập chung xem P-FORMBOX. 機種区分 mặc định 冷蔵庫."],
     "items": N_HEADER + N_TABS + N_BASIC + N_SIZE + N_PHOTO + N_KUBUN},
    {"id": "013", "code": "AW_MODL_003", "state": ["新規登録 機種区分＝自販機", "Đăng ký mới, 機種区分 = 自販機"], "url": "/ops/masters/devices/new",
     "setup": KUBUN("自販機") + "window.scrollTo(0,0);", "full": True, "wait": 400,
     "note": ["機種区分で自販機を選んだとき。機種区分の中に自販機の欄・列の構成の集計・レイアウト（列の構成のカードは置かない・hong 2026/10/05）。", "Khi chọn 自販機: ô + tổng hợp cấu hình cột + layout trong 機種区分 (không có card 列の構成)."],
     "items": N_VM},
    {"id": "014", "code": "AW_MODL_003", "state": ["新規登録 機種区分＝ホットウォーマー", "Đăng ký mới, 機種区分 = ホットウォーマー"], "url": "/ops/masters/devices/new",
     "setup": KUBUN("ホットウォーマー"), "full": False, "wait": 400, "items": N_HW},
    {"id": "015", "code": "AW_MODL_003", "state": ["新規登録 機種区分＝電子レンジ", "Đăng ký mới, 機種区分 = 電子レンジ"], "url": "/ops/masters/devices/new",
     "setup": KUBUN("電子レンジ"), "full": False, "wait": 400, "items": N_MW},
    {"id": "016", "code": "AW_MODL_003", "state": ["新規登録 機種区分＝資材ボックス", "Đăng ký mới, 機種区分 = 資材ボックス"], "url": "/ops/masters/devices/new",
     "setup": KUBUN("資材ボックス"), "full": False, "wait": 400, "items": N_BX},
    {"id": "017", "code": "AW_MODL_003", "state": ["新規登録 タブ 料金・契約条件", "Đăng ký mới, tab 料金・契約条件"], "url": "/ops/masters/devices/new",
     "setup": TAB("料金・契約条件") + "window.scrollTo(0,q('#sec-0').offsetTop-80);", "full": True, "wait": 400, "items": N_FEE},
    {"id": "018", "code": "AW_MODL_003", "state": ["新規登録 入力エラー", "Đăng ký mới, lỗi nhập"], "url": "/ops/masters/devices/new",
     "setup": JS + "q('.pbtn button.save').click();await sleep(600);window.scrollTo(0,0);", "full": True, "wait": 400,
     "note": ["何も入れずに「登録」を押したとき。エラーの項目は赤枠＋項目の下に文言、見出しの下に「保存できません（n件）」（P-FORMBOX）。", "Nhấn 登録 khi chưa nhập gì. Mục lỗi viền đỏ + câu lỗi dưới mục, dưới tiêu đề 「保存できません（n件）」 (P-FORMBOX)."],
     "items": [
         F("14", "エラーの枠", "Khung lỗi", ".vbox", "label", "show", pattern="P-FORMBOX", err=["E01", "E02", "E14", "E04"],
           detail=["見出しの下の赤い枠は「保存できません（n件）。赤い項目を確認してください」の1行だけ（一覧は出さない・A 案 hong 2026/10/05）。エラーのあるタブの見出しに赤い印。", "Khung đỏ dưới tiêu đề chỉ 1 dòng 「保存できません（n件）。赤い項目を確認してください」 (không liệt kê, phương án A hong 2026/10/05). Tab có lỗi đánh dấu đỏ."],
           demo_ok=["コードのチェックは必須の一部だけ（宿題 H3）。仕様が正", "Code mới kiểm tra một phần (H3). Spec đúng"]),
         F("14.1", "項目の下のエラー", "Lỗi dưới mục", ".f.verr", "label", "show", err=["E01"], detail=["エラーの項目に赤い枠＋項目の下に文言（必須は E01）。最初のエラーがほかのタブならそのタブを開く。", "Mục lỗi: viền đỏ + câu lỗi dưới mục (bắt buộc = E01). Lỗi đầu ở tab khác thì mở tab đó."]),
     ]},
    {"id": "019", "code": "AW_MODL_003", "state": ["編集 初期表示", "Sửa, hiển thị ban đầu"], "url": "/ops/masters/devices/RF000001/edit",
     "setup": "", "full": True, "wait": 600,
     "note": ["新規登録と同じフォームに保存済みの値が入る。違い：画面名「機種編集」＋ID、サマリー、ボタン「保存」、機種区分は変えられない。", "Cùng form với đăng ký mới nhưng có giá trị đã lưu. Khác: tiêu đề 「機種編集」 + ID, summary, nút 保存, không đổi được 機種区分."],
     "items": [
         F("15", "ヘッダー（編集）", "Đầu trang (sửa)", ".phead", "area", detail=["1 と同じ。画面名「機種編集 RF000001」、右に キャンセル・保存。", "Giống mục 1. Tiêu đề 「機種編集 RF000001」, nút キャンセル・保存."]),
         F("15.1", "サマリー", "Tóm tắt", ".sumbar", "label", detail=["AW_MODL_002 の 2 と同じ（保存済みの値。編集中は変わらない）。", "Giống AW_MODL_002 mục 2 (giá trị đã lưu, không đổi khi đang sửa)."]),
         F("15.2", "機種ID（編集）", "Mã thiết bị (sửa)", '.f[data-name="機種ID"]', "label", detail=["採番済みの ID。変更不可。", "ID đã cấp, không đổi."]),
         F("15.3", "保存", "Lưu", ".pbtn button.save", "button", "click", pattern="P-FORMBOX", err=["S01", "E31", "E36"], detail=["1.4 と同じ。保存後は詳細へ。", "Giống 1.4. Lưu xong về chi tiết."]),
     ]},
    {"id": "020", "code": "AW_MODL_003", "state": ["編集内容を破棄しますか（モーダル）", "Hủy nội dung đã sửa (modal)"], "url": "/ops/masters/devices/RF000001/edit",
     "setup": JS + "setv(q('.f[data-name=\"機種名\"] input'),'冷蔵ショーケース 48L X');await sleep(200);q('.pbtn button.cancel').click();await sleep(400);", "full": False, "wait": 400,
     "note": ["入力を変えたあとに キャンセル（または ほかの画面へ移動・ブラウザを閉じる／再読み込み）。全サイト共通（台帳 F）。", "Đã sửa rồi nhấn キャンセル (hoặc chuyển trang, đóng/tải lại). Toàn hệ thống (台帳 F)."],
     "items": [
         F("16", "破棄の確認モーダル", "Modal xác nhận hủy", '.es-modal[aria-label="編集内容を破棄しますか？"]', "modal", "show", pattern="P-FORMBOX", err=["Q02"]),
         F("16.1", "本文", "Nội dung", ".es-modal__body", "label", detail=["Q02（Message List No.25）。", "Q02 (Message List No.25)."]),
         F("16.2", "キャンセル", "Hủy", ".es-modal__actions button::キャンセル", "button", "click", detail=["閉じて編集を続ける。", "Đóng, tiếp tục sửa."]),
         F("16.3", "破棄", "Bỏ", ".es-modal__actions button::破棄", "button", "click", detail=["入力を捨てて移動する。", "Bỏ nội dung đã nhập và chuyển trang."]),
     ]},
]

# ================================================================ CSV取込（画面・hong 2026/10/05）。列の定義（sel "-"＝画面には出さない）は API（csv.columns）＋入力画面の項目＋CSVテンプレートから scratchpad/gen_csv2.py で作った
V_CSV = [
    {'id': '022', 'code': 'AW_MODL_004', 'state': ['初期表示（ステップ1 ファイルを選ぶ）', 'Hiển thị ban đầu (bước 1 chọn tệp)'], 'url': '/ops/masters/devices/import', 'setup': '', 'full': True, 'wait': 1200, 'note': ['フル権限（CSV取込の権限）だけが開ける（ほかの役割は一覧へ）。見出し → ファイルを選ぶ。列の定義（2.x）は画面には出さない（hong 2026/10/05）。モーダルではなく画面。', 'Chỉ vai trò có quyền CSV取込 mở được. Tiêu đề → chọn tệp. Định nghĩa cột (2.x) không hiện trên màn hình (hong 2026/10/05). Là màn hình, không phải modal.'], 'items': [{'no': '1', 'ja': 'ヘッダー', 'vi': 'Đầu trang', 'sel': '.csvph', 'kind': 'area', 'trig': 'view'}, {'no': '1.1', 'ja': 'パンくず', 'vi': 'Breadcrumb', 'sel': '.crumb', 'kind': 'label', 'trig': 'view', 'detail': ['「マスタ管理 / 機種マスタ一覧 / 機種マスタ CSV取込」。一覧はリンク。', '「マスタ管理 / …一覧 / 機種マスタ CSV取込」. Danh sách là link.']}, {'no': '1.2', 'ja': '画面名', 'vi': 'Tên màn hình', 'sel': '.csvph h1', 'kind': 'label', 'trig': 'view', 'detail': ['「機種マスタ CSV取込」', 'Tiêu đề 「機種マスタ CSV取込」']}, {'no': '1.3', 'ja': 'キャンセル', 'vi': 'Hủy', 'sel': '.csvph .btns button.out::キャンセル', 'kind': 'button', 'trig': 'click', 'detail': ['一覧へ戻る（何も登録しない）。見出しの右のボタン（アンケートの CSV取込と同じ）。', 'Về danh sách (không đăng ký gì). Nút bên phải tiêu đề.']}, {'no': '2', 'ja': 'CSVテンプレートの列（定義。画面には出さない）', 'vi': 'Các cột của CSV template (định nghĩa; không hiện trên màn hình)', 'sel': '-', 'kind': 'area', 'trig': 'view', 'detail': ['取り込むファイルの列の定義（1行目の見出し・この順。CSV出力と同じ列）。テンプレートの写しは docs/05_画面設計書/CSVテンプレート/devices.csv。キー＝機種ID（空欄＝新規・採番）。UTF-8（BOM 可）・5,000行まで。空欄のセルは今の値のまま、「-」で消す。2.1〜 の必須・長さ・チェックは入力画面の項目と同じ（違うところだけ書く）。画面には出さない（hong 2026/10/05）。', 'Định nghĩa cột của tệp nhập (dòng 1 = tiêu đề, theo thứ tự này; cùng cột với CSV出力). Bản mẫu: docs/05_画面設計書/CSVテンプレート/devices.csv. Khóa = 機種ID (trống = mới, cấp ID). UTF-8 (có BOM được), tối đa 5.000 dòng. Ô trống giữ giá trị cũ, "-" để xóa. Bắt buộc / độ dài / kiểm tra của 2.1〜 giống mục nhập trên màn hình (chỉ ghi chỗ khác). Không hiện trên màn hình (hong 2026/10/05).']}, {'no': '2.1', 'ja': '機種ID', 'vi': 'Mã thiết bị', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '○', 'len': ['文字列 2文字＋6桁（RF／FZ／VM／BX）', '2 chữ + 6 số (RF / FZ / VM / BX)'], 'valid': ['設備の行で必須。機種マスタ（冷蔵庫・冷凍庫・自販機・資材ボックス）にない ID はエラー。ライト（自販機）に RF／FZ、ほかのコースに VM はエラー。ライト（自販機）には VM の行が必要。', 'Bắt buộc ở dòng 設備. ID không có trong 機種マスタ thì lỗi. ライト（自販機） không nhận RF/FZ; course khác không nhận VM; ライト（自販機） cần ≥1 dòng VM.'], 'detail': ['画面の標準貸出設備の表の「機種」と同じ（CSV は ID で書く）。', 'Giống cột 機種 (CSV ghi ID).'], 'ex': ['RF000001', 'Giống cột 機種 của bảng 標準貸出設備 (ghi ID)'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01']}, {'no': '2.2', 'ja': '機種名', 'vi': 'Tên thiết bị', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '○', 'len': ['文字列 60', 'Chuỗi 60'], 'valid': ['新規の行で必須。更新の行は空欄＝今の値のまま。「-」で消せる。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; ghi "-" để xóa giá trị.'], 'detail': ['画面の項目 3.2「機種名」と同じ。', 'Giống mục 3.2 「機種名」 trên màn hình.'], 'ex': ['冷蔵ショーケース 48L', 'Tên hiện ở màn đăng ký, hợp đồng, hóa đơn'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01', 'E04', 'E13']}, {'no': '2.3', 'ja': '機種名フリガナ', 'vi': 'Tên (Furigana)', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '○', 'len': ['文字列 60', 'Chuỗi 60'], 'valid': ['新規の行で必須。更新の行は空欄＝今の値のまま。「-」で消せる。画面と同じチェック：全角カタカナ（型番の英数字はそのまま）。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; ghi "-" để xóa giá trị; kiểm tra như màn hình: Katakana toàn góc (chữ số của model giữ nguyên).'], 'detail': ['画面の項目 3.3「機種名フリガナ」と同じ。', 'Giống mục 3.3 「機種名フリガナ」 trên màn hình.'], 'ex': ['レイゾウショーケース 48L', 'Katakana toàn góc; chữ/số của model giữ nguyên'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01', 'E03', 'E04']}, {'no': '2.4', 'ja': '有効状態', 'vi': 'Trạng thái hiệu lực', 'sel': '-', 'kind': 'select', 'trig': 'input', 'req': '○', 'len': ['選択（有効／無効）', 'Chọn (hiệu lực / vô hiệu)'], 'valid': ['新規の行で必須。更新の行は空欄＝今の値のまま。選択：有効／無効（それ以外はエラー）。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; chọn 1 trong: 有効 / 無効 (khác thì lỗi).'], 'detail': ['画面の項目 3.4「有効状態」と同じ。', 'Giống mục 3.4 「有効状態」 trên màn hình.'], 'ex': ['有効', '無効 = không chọn mới được; máy đang cho mượn giữ nguyên'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01']}, {'no': '2.5', 'ja': '公開ステータス', 'vi': 'Trạng thái công khai', 'sel': '-', 'kind': 'select', 'trig': 'input', 'req': '○', 'len': ['選択（公開／非公開）', 'Chọn (công khai / không công khai)'], 'valid': ['新規の行で必須。更新の行は空欄＝今の値のまま。選択：公開／非公開（それ以外はエラー）。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; chọn 1 trong: 公開 / 非公開 (khác thì lỗi).'], 'detail': ['画面の項目 3.5「公開ステータス」と同じ。', 'Giống mục 3.5 「公開ステータス」 trên màn hình.'], 'ex': ['公開', '公開 = hiện ở 追加でご希望の設備 trên 法人Web'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01']}, {'no': '2.6', 'ja': '申込での最大台数', 'vi': 'Số máy tối đa khi đăng ký', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '－', 'len': ['整数 1〜99（台）', 'Số nguyên 1–99'], 'valid': ['「-」で消せる。', 'ghi "-" để xóa giá trị.'], 'detail': ['画面の項目 3.6「申込での最大台数」と同じ。', 'Giống mục 3.6 「申込での最大台数」 trên màn hình.'], 'ex': ['3', '1 điểm đăng ký tối đa bao nhiêu máy trên 法人Web (tủ lạnh 3, lò vi sóng 2, hộp 9)'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E14']}, {'no': '2.7', 'ja': '機種備考', 'vi': 'Ghi chú', 'sel': '-', 'kind': 'textarea', 'trig': 'input', 'req': '－', 'len': ['文字列 500（複数行）', 'Chuỗi 500 (nhiều dòng)'], 'valid': ['「-」で消せる。', 'ghi "-" để xóa giá trị.'], 'detail': ['画面の項目 3.7「機種備考」と同じ。', 'Giống mục 3.7 「機種備考」 trên màn hình.'], 'ex': ['高出力・連続使用対応', 'Ghi chú nội bộ'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E04', 'E13']}, {'no': '2.8', 'ja': '幅', 'vi': 'Rộng', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '○', 'len': ['整数 1〜99,999（mm）', 'Số nguyên 1–99.999 (mm)'], 'valid': ['新規の行で必須。更新の行は空欄＝今の値のまま。「-」で消せる。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; ghi "-" để xóa giá trị.'], 'detail': ['画面の項目 4.1「幅」と同じ。', 'Giống mục 4.1 「幅」 trên màn hình.'], 'ex': ['1200', 'mm'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01', 'E14']}, {'no': '2.9', 'ja': '奥行', 'vi': 'Sâu', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '○', 'len': ['整数 1〜99,999（mm）', 'Số nguyên 1–99.999 (mm)'], 'valid': ['新規の行で必須。更新の行は空欄＝今の値のまま。「-」で消せる。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; ghi "-" để xóa giá trị.'], 'detail': ['画面の項目 4.2「奥行」と同じ。', 'Giống mục 4.2 「奥行」 trên màn hình.'], 'ex': ['800', 'mm'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01', 'E14']}, {'no': '2.10', 'ja': '高さ', 'vi': 'Cao', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '○', 'len': ['整数 1〜99,999（mm）', 'Số nguyên 1–99.999 (mm)'], 'valid': ['新規の行で必須。更新の行は空欄＝今の値のまま。「-」で消せる。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; ghi "-" để xóa giá trị.'], 'detail': ['画面の項目 4.3「高さ」と同じ。', 'Giống mục 4.3 「高さ」 trên màn hình.'], 'ex': ['1950', 'mm'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01', 'E14']}, {'no': '2.11', 'ja': '重量', 'vi': 'Nặng', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '○', 'len': ['数値 0.1〜99,999.9（kg・小数1桁）', 'Số 0,1–99.999,9 (kg, 1 số thập phân)'], 'valid': ['新規の行で必須。更新の行は空欄＝今の値のまま。「-」で消せる。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; ghi "-" để xóa giá trị.'], 'detail': ['画面の項目 4.4「重量」と同じ。', 'Giống mục 4.4 「重量」 trên màn hình.'], 'ex': ['130.0', 'kg'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01', 'E14']}, {'no': '2.12', 'ja': '容量', 'vi': 'Dung tích', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '－', 'len': ['整数 1〜99,999（L）', 'Số nguyên 1–99.999 (L)'], 'valid': ['「-」で消せる。', 'ghi "-" để xóa giá trị.'], 'detail': ['画面の項目 4.5「容量」と同じ。', 'Giống mục 4.5 「容量」 trên màn hình.'], 'ex': ['48', 'L'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E14']}, {'no': '2.13', 'ja': '電源', 'vi': 'Điện áp', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '－', 'len': ['文字列 20', 'Chuỗi 20'], 'valid': ['「-」で消せる。', 'ghi "-" để xóa giá trị.'], 'detail': ['画面の項目 4.6「電源」と同じ。', 'Giống mục 4.6 「電源」 trên màn hình.'], 'ex': ['100-200', 'V, vd 100 hoặc 100-200'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E04']}, {'no': '2.14', 'ja': '消費電力', 'vi': 'Công suất tiêu thụ', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '－', 'len': ['整数 1〜99,999（W）', 'Số nguyên 1–99.999 (W)'], 'valid': ['「-」で消せる。', 'ghi "-" để xóa giá trị.'], 'detail': ['画面の項目 4.7「消費電力」と同じ。', 'Giống mục 4.7 「消費電力」 trên màn hình.'], 'ex': ['400', 'W'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E14']}, {'no': '2.15', 'ja': '機種区分', 'vi': 'Loại thiết bị', 'sel': '-', 'kind': 'select', 'trig': 'input', 'req': '○', 'len': ['選択（冷蔵庫／冷凍庫／自販機／電子レンジ／ホットウォーマー／資材ボックス）', 'Chọn (tủ lạnh / tủ đông / máy bán hàng / lò vi sóng / hot warmer / hộp vật tư)'], 'valid': ['新規の行で必須。更新の行は空欄＝今の値のまま。選択：冷蔵庫／冷凍庫／自販機／電子レンジ／ホットウォーマー／資材ボックス（それ以外はエラー）。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; chọn 1 trong: 冷蔵庫 / 冷凍庫 / 自販機 / 電子レンジ / ホットウォーマー / 資材ボックス (khác thì lỗi).'], 'detail': ['画面の項目 6.1「機種区分」と同じ。', 'Giống mục 6.1 「機種区分」 trên màn hình.'], 'ex': ['自販機', 'Quyết định tiền tố ID và các ô bên dưới'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01', 'E02']}, {'no': '2.16', 'ja': '冷蔵庫／冷凍庫メーカー', 'vi': 'Hãng (tủ lạnh / tủ đông)', 'sel': '-', 'kind': 'select', 'trig': 'input', 'req': '－', 'len': ['選択（ホシザキ／パナソニック／フクシマガリレイ）', 'Chọn (Hoshizaki / Panasonic / Fukushima Galilei)'], 'valid': ['選択：ホシザキ／パナソニック／フクシマガリレイ（それ以外はエラー）。', 'chọn 1 trong: ホシザキ / パナソニック / フクシマガリレイ (khác thì lỗi).'], 'detail': ['画面の項目 6.3「冷蔵庫／冷凍庫メーカー」と同じ。', 'Giống mục 6.3 「冷蔵庫／冷凍庫メーカー」 trên màn hình.'], 'ex': ['ホシザキ', 'Bắt buộc khi loại = tủ lạnh / tủ đông'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E02']}, {'no': '2.17', 'ja': '棚数', 'vi': 'Số kệ', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '－', 'len': ['整数 1〜99', 'Số nguyên 1–99'], 'valid': ['「-」で消せる。', 'ghi "-" để xóa giá trị.'], 'detail': ['画面の項目 6.4「棚数」と同じ。', 'Giống mục 6.4 「棚数」 trên màn hình.'], 'ex': ['6', 'Số kệ'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E14']}, {'no': '2.18', 'ja': '最大収納数（冷蔵庫／冷凍庫）', 'vi': 'Sức chứa tối đa (tủ lạnh / tủ đông)', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '○', 'len': ['整数 1〜9,999（個）', 'Số nguyên 1–9.999 (cái)'], 'valid': ['新規の行で必須。更新の行は空欄＝今の値のまま。「-」で消せる。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; ghi "-" để xóa giá trị.'], 'detail': ['画面の項目 6.5「最大収納数（冷蔵庫／冷凍庫）」と同じ。', 'Giống mục 6.5 「最大収納数（冷蔵庫／冷凍庫）」 trên màn hình.'], 'ex': ['50', 'Số suất chứa được; dùng chọn cỡ tủ theo 1回の納品数'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01', 'E14']}, {'no': '2.19', 'ja': '自販機メーカー', 'vi': 'Hãng máy bán hàng', 'sel': '-', 'kind': 'select', 'trig': 'input', 'req': '－', 'len': ['選択（富士電機／サンデン・リテールシステム）', 'Chọn (Fuji Electric / Sanden Retail Systems)'], 'valid': ['選択：富士電機／サンデン・リテールシステム（それ以外はエラー）。', 'chọn 1 trong: 富士電機 / サンデン・リテールシステム (khác thì lỗi).'], 'detail': ['画面の項目 7.1「自販機メーカー」と同じ。', 'Giống mục 7.1 「自販機メーカー」 trên màn hình.'], 'ex': ['富士電機', 'Bắt buộc khi loại = máy bán hàng'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E02']}, {'no': '2.20', 'ja': 'キャッシュレス対応', 'vi': 'Thanh toán không tiền mặt', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '－', 'len': ['1／0', '1 / 0'], 'valid': ['画面の項目と同じチェック。', 'Kiểm tra như mục trên màn hình.'], 'detail': ['画面の項目 7.2「キャッシュレス対応」と同じ。', 'Giống mục 7.2 「キャッシュレス対応」 trên màn hình.'], 'ex': ['対応する', 'Có / không hỗ trợ cashless'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)']}, {'no': '2.21', 'ja': '段数（行）', 'vi': 'Số tầng (hàng)', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '－', 'len': ['整数 1〜26', 'Số nguyên 1–26'], 'valid': ['「-」で消せる。', 'ghi "-" để xóa giá trị.'], 'detail': ['画面の項目 7.3「段数（行）」と同じ。', 'Giống mục 7.3 「段数（行）」 trên màn hình.'], 'ex': ['6', 'Số hàng A, B, C… của layout'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01', 'E14']}, {'no': '2.22', 'ja': '列数', 'vi': 'Số cột', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '－', 'len': ['整数 1〜99', 'Số nguyên 1–99'], 'valid': ['「-」で消せる。', 'ghi "-" để xóa giá trị.'], 'detail': ['画面の項目 7.4「列数」と同じ。', 'Giống mục 7.4 「列数」 trên màn hình.'], 'ex': ['10', 'Số cột 1, 2, 3… của layout'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01', 'E14']}, {'no': '2.23', 'ja': '最大収納数（自販機）', 'vi': 'Sức chứa tối đa (máy bán hàng)', 'sel': '-', 'kind': 'label', 'trig': 'view', 'req': '－', 'len': ['整数（個）', 'Số nguyên (cái)'], 'valid': ['出力だけ。取込では読まない（書いてあっても無視）。「-」で消せる。', 'chỉ xuất; nhập không đọc (có ghi cũng bỏ qua); ghi "-" để xóa giá trị.'], 'detail': ['画面の項目 7.5「最大収納数（自販機）」と同じ。', 'Giống mục 7.5 「最大収納数（自販機）」 trên màn hình.']}, {'no': '2.24', 'ja': '電子レンジメーカー', 'vi': 'Hãng lò vi sóng', 'sel': '-', 'kind': 'select', 'trig': 'input', 'req': '－', 'len': ['選択（パナソニック／シャープ）', 'Chọn (Panasonic / Sharp)'], 'valid': ['選択：パナソニック／シャープ（それ以外はエラー）。', 'chọn 1 trong: パナソニック / シャープ (khác thì lỗi).'], 'detail': ['画面の項目 9.1「電子レンジメーカー」と同じ。', 'Giống mục 9.1 「電子レンジメーカー」 trên màn hình.'], 'ex': ['パナソニック', 'Bắt buộc khi loại = lò vi sóng'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E02']}, {'no': '2.25', 'ja': '出力', 'vi': 'Công suất', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '－', 'len': ['整数 1〜9,999（W）', 'Số nguyên 1–9.999 (W)'], 'valid': ['「-」で消せる。', 'ghi "-" để xóa giá trị.'], 'detail': ['画面の項目 9.2「出力」と同じ。', 'Giống mục 9.2 「出力」 trên màn hình.'], 'ex': ['1200', 'W'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01', 'E14']}, {'no': '2.26', 'ja': '庫内容量', 'vi': 'Dung tích khoang', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '－', 'len': ['整数 1〜999（L）', 'Số nguyên 1–999 (L)'], 'valid': ['「-」で消せる。', 'ghi "-" để xóa giá trị.'], 'detail': ['画面の項目 9.3「庫内容量」と同じ。', 'Giống mục 9.3 「庫内容量」 trên màn hình.'], 'ex': ['26', 'L'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E14']}, {'no': '2.27', 'ja': 'ホットウォーマーメーカー', 'vi': 'Hãng hot warmer', 'sel': '-', 'kind': 'select', 'trig': 'input', 'req': '－', 'len': ['選択（アンナカ／タイジ）', 'Chọn (Annaka / Taiji)'], 'valid': ['選択：アンナカ／タイジ（それ以外はエラー）。', 'chọn 1 trong: アンナカ / タイジ (khác thì lỗi).'], 'detail': ['画面の項目 8.1「ホットウォーマーメーカー」と同じ。', 'Giống mục 8.1 「ホットウォーマーメーカー」 trên màn hình.'], 'ex': ['アンナカ', 'Bắt buộc khi loại = hot warmer'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E02']}, {'no': '2.28', 'ja': '保温温度', 'vi': 'Nhiệt độ giữ ấm', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '－', 'len': ['整数 1〜999（℃）', 'Số nguyên 1–999 (℃)'], 'valid': ['「-」で消せる。', 'ghi "-" để xóa giá trị.'], 'detail': ['画面の項目 8.2「保温温度」と同じ。', 'Giống mục 8.2 「保温温度」 trên màn hình.'], 'ex': ['60', '℃'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E14']}, {'no': '2.29', 'ja': '段数', 'vi': 'Số tầng', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '－', 'len': ['整数 1〜99', 'Số nguyên 1–99'], 'valid': ['「-」で消せる。', 'ghi "-" để xóa giá trị.'], 'detail': ['画面の項目 8.3「段数」と同じ。', 'Giống mục 8.3 「段数」 trên màn hình.'], 'ex': ['3', 'Số tầng'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E14']}, {'no': '2.30', 'ja': '資材ボックスの欄', 'vi': 'Ô hộp vật tư', 'sel': '-', 'kind': 'label', 'trig': 'view', 'req': '－', 'len': ['文字列', 'Chuỗi'], 'valid': ['出力だけ。取込では読まない（書いてあっても無視）。「-」で消せる。', 'chỉ xuất; nhập không đọc (có ghi cũng bỏ qua); ghi "-" để xóa giá trị.'], 'detail': ['画面の項目 10「資材ボックスの欄」と同じ。', 'Giống mục 10 「資材ボックスの欄」 trên màn hình.']}, {'no': '2.31', 'ja': '初期料金（税抜き）', 'vi': 'Phí ban đầu (chưa thuế)', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '○', 'len': ['金額（整数・0〜999,999,999・税抜）', 'Số tiền (nguyên, chưa thuế)'], 'valid': ['新規の行で必須。更新の行は空欄＝今の値のまま。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ.'], 'detail': ['画面の項目 11.1「初期料金（税抜き）」と同じ。', 'Giống mục 11.1 「初期料金（税抜き）」 trên màn hình.'], 'ex': ['40000', 'Phí 1 lần khi lắp đặt; 0 cũng được (hộp vật tư = 0)'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01', 'E14']}, {'no': '2.32', 'ja': '月額料金（税抜き）', 'vi': 'Phí tháng (chưa thuế)', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '○', 'len': ['金額（整数・0〜999,999,999・税抜）', 'Số tiền (nguyên, chưa thuế)'], 'valid': ['新規の行で必須。更新の行は空欄＝今の値のまま。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ.'], 'detail': ['画面の項目 11.2「月額料金（税抜き）」と同じ。', 'Giống mục 11.2 「月額料金（税抜き）」 trên màn hình.'], 'ex': ['5000', 'Phí mỗi tháng; máy bán hàng = tiền thuê (giá mặc định OP000037)'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01', 'E14']}, {'no': '2.33', 'ja': '税率', 'vi': 'Thuế suất', 'sel': '-', 'kind': 'select', 'trig': 'input', 'req': '○', 'len': ['選択（税率マスタ）', 'Chọn (master thuế suất)'], 'valid': ['新規の行で必須。更新の行は空欄＝今の値のまま。選択：8%（軽減）／10%（それ以外はエラー）。', 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; chọn 1 trong: 8%（軽減） / 10% (khác thì lỗi).'], 'detail': ['画面の項目 11.3「税率」と同じ。', 'Giống mục 11.3 「税率」 trên màn hình.'], 'ex': ['10%', 'Thuế suất cho 12.1, 12.2, 12.4'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E01']}, {'no': '2.34', 'ja': '解約時の回収額（備品サポート費用）', 'vi': 'Phí thu hồi khi hủy', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '－', 'len': ['金額（整数・0〜999,999,999・税抜）', 'Số tiền (nguyên, chưa thuế)'], 'valid': ['画面の項目と同じチェック。', 'Kiểm tra như mục trên màn hình.'], 'detail': ['画面の項目 11.4「解約時の回収額（備品サポート費用）」と同じ。', 'Giống mục 11.4 「解約時の回収額（備品サポート費用）」 trên màn hình.'], 'ex': ['15000', 'Cơ sở tính 違約金 = số này × tháng còn lại ÷ 最低利用期間'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E14']}, {'no': '2.35', 'ja': '最低利用期間', 'vi': 'Thời gian dùng tối thiểu', 'sel': '-', 'kind': 'text', 'trig': 'input', 'req': '－', 'len': ['整数 0〜99（ヶ月）', 'Số nguyên 0–99 (tháng)'], 'valid': ['「-」で消せる。', 'ghi "-" để xóa giá trị.'], 'detail': ['画面の項目 11.5「最低利用期間」と同じ。', 'Giống mục 11.5 「最低利用期間」 trên màn hình.'], 'ex': ['3', 'Tủ lạnh 3, máy bán hàng 12; 0 / trống = không có'], 'init': ['空欄（更新の行は今の値のまま）', 'Trống (dòng cập nhật giữ giá trị cũ)'], 'err': ['E14']}, {'no': '2.36', 'ja': '回収未完了（アラート）', 'vi': 'Chưa thu hồi (cảnh báo)', 'sel': '-', 'kind': 'label', 'trig': 'view', 'req': '－', 'len': ['文字列', 'Chuỗi'], 'valid': ['出力だけ。取込では読まない（書いてあっても無視）。「-」で消せる。', 'chỉ xuất; nhập không đọc (có ghi cũng bỏ qua); ghi "-" để xóa giá trị.'], 'detail': ['画面の項目 12.1「回収未完了（アラート）」と同じ。', 'Giống mục 12.1 「回収未完了（アラート）」 trên màn hình.']}, {'no': '2.37', 'ja': '貸出中 合計', 'vi': 'Tổng đang cho mượn', 'sel': '-', 'kind': 'label', 'trig': 'view', 'req': '－', 'len': ['文字列', 'Chuỗi'], 'valid': ['出力だけ。取込では読まない（書いてあっても無視）。「-」で消せる。', 'chỉ xuất; nhập không đọc (có ghi cũng bỏ qua); ghi "-" để xóa giá trị.'], 'detail': ['画面の項目 12.4「貸出中 合計」と同じ。', 'Giống mục 12.4 「貸出中 合計」 trên màn hình.']}, {'no': '2.38', 'ja': '使用中の件数', 'vi': 'Số đang dùng', 'sel': '-', 'kind': 'label', 'trig': 'view', 'req': '－', 'len': ['整数', 'Số nguyên'], 'valid': ['出力だけ。取込では読まない（書いてあっても無視）。', 'chỉ xuất; nhập không đọc (có ghi cũng bỏ qua).'], 'detail': ['出力だけの列（取込では読まない）。', 'Cột chỉ xuất (nhập không đọc).']}, {'no': '2.39', 'ja': '削除済(1=削除済)', 'vi': 'Đã xóa (1 = đã xóa)', 'sel': '-', 'kind': 'label', 'trig': 'view', 'req': '－', 'len': ['1／0', '1 / 0'], 'valid': ['出力だけ。取込では読まない（書いてあっても無視）。', 'chỉ xuất; nhập không đọc (có ghi cũng bỏ qua).'], 'detail': ['出力だけの列（取込では読まない）。', 'Cột chỉ xuất (nhập không đọc).']}, {'no': '3', 'ja': 'ファイルを選ぶ（ステップ1）', 'vi': 'Chọn tệp (bước 1)', 'sel': '#sec-csv', 'kind': 'area', 'trig': 'view', 'pattern': 'P-CSV'}, {'no': '3.1', 'ja': '手順', 'vi': 'Các bước', 'sel': '.steps', 'kind': 'label', 'trig': 'view', 'detail': ['1 ファイルを選ぶ → 2 確認・登録（カードの外・中央。アンケートの CSV取込と同じ）。今の手順を濃く、済んだ手順を緑に。', '1 chọn tệp → 2 xác nhận・đăng ký (ngoài card, giữa trang; giống CSV取込 của アンケート). Bước hiện tại tô đậm, bước xong màu xanh.']}, {'no': '3.2', 'ja': '説明', 'vi': 'Giải thích', 'sel': '#sec-csv .hint', 'kind': 'label', 'trig': 'view', 'detail': ['取込の決まり（上書き／新規・UTF-8・5,000行・エラーの行は取り込まずほかの行を登録）。', 'Quy tắc nhập (ghi đè / mới, UTF-8, 5.000 dòng, dòng lỗi bỏ qua, dòng khác vẫn đăng ký).']}, {'no': '3.3', 'ja': 'ファイルを選ぶ', 'vi': 'Chọn tệp', 'sel': '#sec-csv button.out::ファイルを選ぶ', 'kind': 'file', 'trig': 'input', 'req': '○', 'len': ['CSV（UTF-8・.csv）1ファイル', '1 tệp CSV (UTF-8, .csv)'], 'init': ['なし', 'Không'], 'ex': ['機種マスタ_20261005.csv', 'Tệp cùng cột với CSV出力 (2.1〜)'], 'err': ['E34'], 'detail': ['ファイルを選ぶか、枠にドラッグ＆ドロップ。選ぶとすぐに確かめて（何も保存しない）ステップ2へ。.csv 以外・UTF-8 以外・読めないファイル・見出しの列が 2.1〜 と違うファイルはその場でエラーの帯。', 'Chọn tệp hoặc kéo thả vào khung. Chọn xong kiểm tra ngay (không lưu) và sang bước 2. Không phải .csv / không phải UTF-8 / không đọc được / tiêu đề cột khác 2.1〜 thì hiện dải lỗi.']}, {'no': '3.4', 'ja': 'ドラッグ＆ドロップの枠', 'vi': 'Khung kéo thả', 'sel': '#sec-csv button.out::ファイルを選ぶ^2', 'kind': 'area', 'trig': 'view', 'detail': ['ファイルを重ねると枠が青くなる。選んだファイル名を下に出す。', 'Kéo tệp lên thì khung chuyển xanh. Tên tệp đã chọn hiện phía dưới.']}]},
    {'id': '023', 'code': 'AW_MODL_004', 'state': ['確認・登録（ステップ2）', 'Xác nhận, đăng ký (bước 2)'], 'url': '/ops/masters/devices/import', 'setup': 'const sleep=ms=>new Promise(r=>setTimeout(r,ms));const q=s=>document.querySelector(s);const res=await fetch(\'/api/domain/csv/export\',{method:\'POST\',credentials:\'include\',headers:{\'Content-Type\':\'application/json\',\'x-es-site\':\'ops\'},body:JSON.stringify({args:{entity:\'devices\',scope:{site:\'ops\'}}})});const t=await res.json();const esc=v=>\'\\"\'+String(v??\'\').replace(/\\"/g,\'\\"\\"\')+\'\\"\';const rows=[t.head,...t.rows];const vi=rows.findIndex((r,k)=>k>0&&String(r[0]).startsWith(\'VM\'));rows[vi][1]=rows[vi][1]+\' 改\';const bad=t.rows[0].slice();bad[0]=\'XX999999\';rows.push(bad);const text=\'\\ufeff\'+rows.map(r=>r.map(esc).join(\',\')).join(\'\\r\\n\');const inp=q(\'#sec-csv input[type=file]\');const dt=new DataTransfer();dt.items.add(new File([text],\'取込テスト.csv\',{type:\'text/csv\'}));inp.files=dt.files;inp.dispatchEvent(new Event(\'change\',{bubbles:true}));await sleep(2500);window.scrollTo(0,q(\'#sec-csv\').offsetTop-80);', 'full': True, 'wait': 600, 'note': ['ファイルを選んだ直後。見本は CSV出力（ひな形）のファイルに、自販機の行の名前を変え（更新の見本）と、キーが誤りの行を1つ足したもの（エラーの行の見本）。', 'Ngay sau khi chọn tệp. Mẫu = tệp CSV出力 (mẫu) + đổi tên dòng máy bán hàng (mẫu 更新) + 1 dòng khóa sai (mẫu dòng lỗi).'], 'items': [{'no': '4', 'ja': '確認・登録（ステップ2）', 'vi': 'Xác nhận, đăng ký (bước 2)', 'sel': '#sec-csv', 'kind': 'area', 'trig': 'show', 'pattern': 'P-CSV', 'err': ['S03', 'E34'], 'detail': ['ファイル名・件数と、行ごとの結果。「登録」でエラー以外の行を登録する（エラーの行は取り込まない・hong 2026/10/05）。', 'Tên tệp, số dòng và kết quả từng dòng. 登録 thì đăng ký các dòng không lỗi (dòng lỗi bỏ qua, hong 2026/10/05).']}, {'no': '4.1', 'ja': '件数', 'vi': 'Số lượng', 'sel': '#sec-csv .badge', 'kind': 'label', 'trig': 'view', 'detail': ['新規／更新／変更なし／エラー の件数（バッジ）。', 'Số dòng 新規 / 更新 / 変更なし / エラー (badge).']}, {'no': '4.2', 'ja': 'エラーの行', 'vi': 'Dòng lỗi', 'sel': '#sec-csv .notice.ng', 'kind': 'label', 'trig': 'show', 'cond': ['エラーの行があるとき', 'Khi có dòng lỗi'], 'detail': ['「エラーの行 n件は取り込みません…」と、行番号・キー・列名・内容の表（多いときは先頭だけ。全部はエラー一覧CSV）。内容は 2.1〜 のチェックの文言。', '「エラーの行 n件は取り込みません…」 + bảng số dòng / khóa / cột / nội dung (nhiều thì chỉ phần đầu; đủ ở エラー一覧CSV). Nội dung = câu kiểm tra của 2.1〜.']}, {'no': '4.3', 'ja': 'エラー一覧CSV', 'vi': 'Xuất CSV lỗi', 'sel': '#sec-csv button::エラー一覧CSV', 'kind': 'button', 'trig': 'click', 'detail': ['エラーの行だけを、元の列＋エラーの内容で書き出す（直して選び直すため）。', 'Xuất riêng các dòng lỗi với cột gốc + nội dung lỗi (để sửa rồi chọn lại).']}, {'no': '4.4', 'ja': '登録する内容（前 → 後）', 'vi': 'Nội dung sẽ đăng ký (trước → sau)', 'sel': '#sec-csv b::登録する内容', 'kind': 'label', 'trig': 'view', 'cond': ['新規・更新の行があるとき', 'Khi có dòng 新規 / 更新'], 'detail': ['行番号・区分（新規／更新）・キー・名前・変わる項目（前 → 後）。', 'Số dòng, loại (新規 / 更新), khóa, tên, các mục thay đổi (trước → sau).']}, {'no': '4.5', 'ja': 'ファイルを選び直す', 'vi': 'Chọn lại tệp', 'sel': '.csvph .btns button.out::ファイルを選び直す', 'kind': 'button', 'trig': 'click', 'detail': ['ステップ1に戻る。何も登録しない。', 'Về bước 1. Không đăng ký gì.']}, {'no': '4.6', 'ja': '登録', 'vi': 'Đăng ký', 'sel': '.csvph .btns button.pri', 'kind': 'button', 'trig': 'click', 'err': ['S03', 'E34'], 'cond': ['新規か更新の行が1つ以上あり、ファイル全体のエラーがないとき。警告（金額の変更など）があるときは「警告を確認しました」にチェックするまで押せない', 'Có ≥1 dòng 新規 / 更新 và không lỗi cả tệp. Có cảnh báo (vd đổi tiền) thì phải check 「警告を確認しました」 mới nhấn được'], 'detail': ['エラー以外の行を登録し、S03 のトースト（新規 n件・更新 n件）、一覧へ戻る。100件を超えるときは裏で進めて進み具合を出す。取込の記録と、行ごとの変更履歴「CSV取込で更新」を残す。', 'Đăng ký các dòng không lỗi, toast S03 (新規 n, 更新 n), về danh sách. Quá 100 dòng thì chạy nền và hiện tiến độ. Ghi lịch sử nhập và lịch sử từng bản ghi 「CSV取込で更新」.']}]},
]

VIEWS = V_LIST + V_DETAIL + V_FORM + V_CSV
