# -*- coding: utf-8 -*-
"""
画面設計書のデータ：運営管理者Web ＞ 法人・契約管理 ＞ 拠点一覧（一覧・詳細・編集）（AW_BRCH）。
元：本物の Web（app/ops/branches・app/ops/corps/_components・lib/ops/contracts）、決定台帳 B・E・F・K・M-1・M-3（運営A Q1〜Q9）、
    契約仕様 契約_02（一覧）・契約_04（拠点の画面項目）、運営Web_権限表、CSV入出力_定義、
    確認メモ_AW_運営A_申請・法人・契約.md（Part 2）
データは日本語で書き、ベトナム語は下の TR（日本語の文 → ベトナム語）から引く（F・view_item・末尾の埋め込みが使う）。ex の説明は TR["項目名|例の値"]。
番号は画面ごとに通し。状態では、その状態で増える・変わる項目だけ書く（共通の項目は最初の状態に1回）。
法人詳細・編集（AW_CORP）と同じ画面部品（DetailScreen）だが、このファイルは拠点だけで完結させる。
"""

TITLE = ["拠点一覧（AW_BRCH）", ""]
SHEET = ["拠点一覧", ""]
BASENAME = "画面設計書_AW_BRCH_拠点一覧"
IMG_PREFIX = "AW_BRCH"
OUT_DIR = "AW_BRCH_拠点一覧"
CODE_NOTE = ["画面コードは規約 <Module(2)>_<Feature(4)>_<Seq(3)>（docs/01_仕様/画面コード規約_20261005.md）。AW＝運営管理者Web、BRCH＝拠点一覧（Branch）。001 一覧／002 詳細／003 編集／004 CSV取込",
             ""]
SITE = "ops"
SYSTEM = {"ja": "運営管理者Web", "vi": "Web quản trị vận hành"}
AUTHOR = "Claude（cloud）／確認：hong"
CREATED = "2026-10-05"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "ops", "loginId": "Ad00010"}
CODE_PATHS = ["app/ops/branches", "app/ops/corps/_components", "lib/ops", "lib/domain/seed"]

SRC = "hong 回答 2026-10-05（確認メモ_AW_運営A_申請・法人・契約.md Part 2 "
DECISIONS = [
    {"date": "2026-10-05", "target": "新規登録・削除（運営A Q1）",
     "q": ["拠点に「新規登録」「削除」を置くか", ""], "a": ["どの役割にも置かない。作成＝契約申請管理の代理入力、削除＝なし。状態（仮登録・本登録・閉鎖予定・閉鎖）で扱う", ""], "src": SRC + "Q1）・台帳 F"},
    {"date": "2026-10-05", "target": "CSV取込（運営A Q2）",
     "q": ["拠点一覧に CSV取込を置くか", ""], "a": ["更新だけの取込を置く（CRUD の役割だけ・P-CSV の画面・列＝詳細の入力項目＋拠点ID）。新規行・仮登録の行・参照項目の変更は行エラー", ""], "src": SRC + "Q2）・台帳 F"},
    {"date": "2026-10-05", "target": "拠点ステータス・契約ステータス・契約終了日（運営A Q3）",
     "q": ["編集で直接直せるか", ""], "a": ["直せる（コードのまま）。休止は拠点ステータスに持たない（契約ステータスの「利用休止」で表し、休止は変更申請から）。直接直したときは子契約の取消・アカウント停止・設備回収が自動では動かない。親契約の項目の保存は契約管理（contracts）の編集権限", ""], "src": SRC + "Q3）・台帳 F"},
    {"date": "2026-10-05", "target": "変更履歴の列（運営A Q4）",
     "q": ["履歴の列", ""], "a": ["P-HIST の7列（日時・操作した人・操作・項目・変更前・変更後・理由）。適用範囲・承認者・通知は外す。変更者はアカウント名（ID 併記）", ""], "src": SRC + "Q4）・台帳 F"},
    {"date": "2026-10-05", "target": "設置フロア（運営A Q6）",
     "q": ["どの画面に置くか", ""], "a": ["拠点の「住所」カードの入力項目。子契約には出さない（配送備考は子契約のまま）", ""], "src": SRC + "Q6）・台帳 F"},
    {"date": "2026-10-05", "target": "請求書一覧の状態名（運営A Q7）",
     "q": ["請求書の状態名と列名", ""], "a": ["運営E の請求書一覧と同じ名前にする。未確定／確定／請求済（「入金済・未入金」は出さない・台帳 F）。列名は「固定額」「実績精算」（前払い・後払いを出さない・台帳 B）", ""], "src": SRC + "Q7）・台帳 F"},
    {"date": "2026-10-05", "target": "一覧の検索条件とバッジの色（運営A Q8）",
     "q": ["検索条件とバッジ", ""], "a": ["コードの追加条件を採る（現在のプラン・当初契約開始年月・登録日の範囲）。バッジの色は共通部品（status.ts）どおり", ""], "src": SRC + "Q8）・台帳 F"},
    {"date": "2026-10-05", "target": "拠点アカウントの操作（運営A Q9）",
     "q": ["拠点のアカウントの操作と権限", ""], "a": ["アカウントのステータス（参照）・パスワード再設定・ログイン案内の再送・停止／再開を置く。権限＝拠点の編集権限", ""], "src": SRC + "Q9）・台帳 F・K"},
    {"date": "2026-10-05", "target": "画面コード",
     "q": ["画面コード", ""], "a": ["AW_BRCH_001 一覧／002 詳細／003 編集／004 CSV取込", ""], "src": "画面コード規約_20261005・台帳 E"},
    {"date": "2026-10-05", "target": "CSV取込の画面（台帳 E・F）",
     "q": ["拠点の CSV取込はモーダルか画面か。列の定義（必須・長さ・チェック・データ例）はどこに書くか", ""],
     "a": ["モーダルではなく1つの画面 AW_BRCH_004「拠点CSV取込」（一覧の「CSV取込」→ この画面。① ファイルを1つ選ぶ → ② 確認・登録）。エラーの行は取り込まず、ほかの行を登録する。画面には列の表を出さず、テンプレートの列の定義は項目定義に入力項目と同じ形で書く（sel＝「-」）。更新だけ（新規・仮登録の行は E101・E102）、キー＝拠点ID", ""],
     "src": "hong 回答 2026-10-05（台帳 E「CSV取込の画面」「CSVテンプレートの定義の置き場」・F「CSV取込のエラーの行の扱い」）・運営A Q2"},
    {"date": "2026-10-05", "target": "担当者の CSV（運営A 法人・拠点）",
     "q": ["担当者（表）の CSV をどう持つか", ""],
     "a": ["専用の CSV は作らない。拠点の共通の CSV に担当者の列を入れる（1行＝1拠点×1人。同じ拠点IDの行を並べる：CSV入出力_定義 §1-1 の（a）・§5-2）。取り込み方（置き換えか、突き合わせか）は open", ""],
     "src": "hong 回答 2026-10-05（台帳 F）・CSV入出力_定義_20261003.md"},
    {"date": "2026-10-05", "target": "拠点の細かい点（台帳 F・運営A open の回答）",
     "q": ["継続年月・所属法人・棚卸報告の語・ログイン案内の再送・CSV の存在しない拠点ID・請求書の状態名", ""],
     "a": ["継続年月は休止の期間を含めない／所属法人は変えられない（参照のみ。システム管理だけ変えられるかは客先に確認）／「在庫点検」は「棚卸報告」／再送は運営が『届いていない・なくした』と連絡を受けたときに押し、宛先は法人と同じ／存在しない拠点IDの行はその行だけ E100／請求書の状態名は 未確定・確定・請求済", ""],
     "src": "hong 回答 2026-10-05（台帳 F「法人・拠点の細かい点」）"},
    {"date": "2026-10-05", "target": "レビュー対応（QA/BA 2026-10-05）",
     "q": ["拠点ステータスの変え方・同時更新・承認待ち・CSV の共通コードなど", ""],
     "a": ["拠点ステータスは直接編集で先の状態にだけ進める（仮登録→本登録→閉鎖予定→閉鎖。閉鎖予定→本登録は可。「停止」はない）。閉鎖は Q01 で確認。E31＝上書き警告モーダル（台帳 E）。承認待ちの項目は直接編集を止める（台帳 K）。請求先・リードタイムは「まだ作っていないサイクル月から」、支払方法・支払サイクルは未確定の子契約まで書き換え（契約_01 §2）。貸出一覧は貸出ステータスのドロップダウン（台帳 F）。詳細内の表は P-LIST。金額は（税込）／（税抜）を書く（当月請求額は税抜）。CSV 取込は法人・拠点で同じコード（E106・E107・E109・E113〜E115・S104・I104）。拠点ステータスを戻す・飛ばす行は E118。", ""],
     "src": "台帳 E・F・K・M-1・M-3、契約_01 §2、レビュー_運営A_法人・拠点_QA／BA_20261005.md"},
    {"date": "2026-10-06", "target": "付け替え・切替・延長の使えない条件（台帳 F 2026-10-06・実装）",
     "q": ["付け替え・切替・お試しの延長が使えない拠点", ""],
     "a": ["取消の拠点は付け替え・切替・延長がすべて非活性（I107）。閉鎖の拠点は付け替えが非活性（I13）。お試しの延長は契約種別がお試しキャンペーンのときだけ（それ以外は I109）。非活性のボタンには理由を横に出す。見本データに取消の拠点 CU01320 を追加（CU00001 の配下は6拠点）。", ""],
     "src": "台帳 F「運営A 付け替え・切替・延長の使えない条件」"},
    {"date": "2026-10-06", "target": "運営A 法人・拠点の最後の open（台帳 F 2026-10-06）",
     "q": ["契約ステータス「停止」・所属法人の変更・契約種別の履歴・取消／閉鎖の編集・アカウントのボタン表", ""],
     "a": ["契約ステータスから「停止」を外す（止めるのはアカウント自身の有効・停止）。所属法人は編集では参照のみ、システム管理だけの別操作「所属法人の付け替え」（請求書・承認待ちの申請がない拠点だけ・確認の小窓・変更履歴に残す・Claude 提案）。契約種別は編集では参照のみ、お試し→本導入の「切替」操作でだけ変え、契約種別の履歴に1行足す。取消の拠点は全項目参照のみ、閉鎖の拠点は担当者と請求書の送り先メールだけ編集できる。アカウントのボタンは未発行＝再送／発行済＝再設定・再送・停止／ログイン済・参照のみ＝再設定・停止／停止中＝再開。使ったメッセージ：S107・S108・I105〜I108（Q01・I102・E30・E32 は再利用）。", ""],
     "src": "台帳 F「運営A 法人・拠点の最後の open」（hong 2026-10-06）"},
    {"date": "2026-10-06", "target": "運営A 法人・拠点の残りの点（台帳 F 2026-10-06）",
     "q": ["担当者CSV・ファイルサイズ・停止中の色・契約ステータス「停止」・契約終了日・延長のメモ", ""],
     "a": ["担当者CSVは「区分＋メール」で突き合わせ（あれば更新・なければ追加・CSV では削除しない）、2行目以降の拠点の列は空欄可（入れるなら1行目と同じ、違えば E116）。ファイルサイズの上限は決めない（5,000行まで）。停止中のバッジは灰。契約ステータス「停止」は暫定で「入金期限を過ぎてアカウントが止まった状態」（客先に確認）。契約終了日は確定済み・発行済みの子契約の月より前をエラー（E53）、未確定が残れば警告（W105）で自動では取り消さない。延長のメモは「理由（社内・任意）」として変更履歴の「理由」に残す。共有メッセージのずれ（I02・E06/E04・E105 と E116）は phiên gộp で直し、/ops/branches/import（CSV取込の画面）はコードの宿題。", ""],
     "src": "台帳 F「運営A 法人・拠点の残りの点」（hong 2026-10-06）"},
    {"date": "2026-10-05", "target": "運営A 法人・拠点の再レビュー（台帳 F）",
     "q": ["CSV取込・アカウント・お試しの延長・UX", ""],
     "a": ["CSV で条件により無効な列に値があれば行エラー（E109）／アカウントの状態は5つ（持つのは有効・停止、参照のみは表示）／お試しの延長は編集の画面でだけ／UX：一覧は4つの条件＋詳細条件、編集は見出し固定・保存できません（n件）、「編集できる項目だけ」、バッジの色の表、表示件数を覚える。", ""],
     "src": "台帳 F「運営A 法人・拠点の再レビューで確認した点」・再レビュー_運営A_法人・拠点_QA／BA・UX_20261005.md"},
    {"date": "2026-10-05", "target": "お試しの延長・子契約を先まで作る：保存の決まり（hong への提案）",
     "q": ["「保存は画面の保存1つ・例外なし」と、ダイアログがすぐ保存することの食い違い", ""],
     "a": ["提案：ダイアログは確認して押すと別の操作としてすぐに保存し、編集の画面でだけ使える。編集中の入力が未保存のときはボタンを非活性にして E104「編集中の内容を先に保存してください」を出す。台帳 F の「例外なし」の読み方は hong が決める。", ""],
     "src": "最終レビュー QA 2-2・BA 2"},
    {"date": "2026-10-05", "target": "当初契約開始（運営A 法人・拠点）",
     "q": ["拠点の「当初契約開始」は日か年月か", ""],
     "a": ["年月（サイクル月・yyyy-mm）。日付ではない。項目名は「当初契約開始年月」", ""],
     "src": "hong 回答 2026-10-05（台帳 F）"},
]
CHANGES = []

HIDE_ALWAYS = []
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [
    {"code": "AW_BRCH_001", "ja": "拠点一覧", "vi": ""},
    {"code": "AW_BRCH_002", "ja": "拠点詳細", "vi": ""},
    {"code": "AW_BRCH_003", "ja": "拠点編集", "vi": ""},
    {"code": "AW_BRCH_004", "ja": "拠点CSV取込", "vi": ""},
]

# ---------------------------------------------------------------- 部品
PAIR = ("detail", "init", "cond", "valid", "ex", "open", "demo_ok", "chk")


TR = {}   # 日本語 → ベトナム語（下の TR.update で入れる）


def T(s):
    if s in TR:
        return TR[s]
    if s == "表示だけ。":
        return "Chỉ hiển thị."
    if s.startswith("表示だけ。入力の決まりは AW_BRCH_003 の ") and s.endswith("。"):
        return "Chỉ hiển thị. Quy tắc nhập xem mục %s của AW_BRCH_003." % s[len("表示だけ。入力の決まりは AW_BRCH_003 の "):-1]
    if s.startswith("表示だけ。") and s[5:] in TR:
        return "Chỉ hiển thị. " + TR[s[5:]]
    return ""


def uni(v):
    """ベトナム語の用語をそろえる（請求先＝Bên nhận hóa đơn／停止＝dừng・休止＝tạm ngừng／台帳＝sổ quyết định／起算月 など）"""
    v = v.replace("sổ cái", "sổ quyết định").replace("Sổ cái", "Sổ quyết định")
    v = v.replace("Người nhận hóa đơn", "Bên nhận hóa đơn").replace("người nhận hóa đơn", "bên nhận hóa đơn")
    v = v.replace("Tháng tính (khi", "Tháng bắt đầu tính (khi").replace("tháng tính ", "tháng bắt đầu tính ")
    v = v.replace("đã thanh toán yêu cầu", "đã lập yêu cầu thanh toán").replace("đã yêu cầu thanh toán", "đã lập yêu cầu thanh toán")
    v = v.replace("Số tiền thanh toán tháng này", "Số tiền yêu cầu tháng này")
    v = v.replace("Tháng tính", "Tháng bắt đầu tính").replace("Tháng bắt đầu bắt đầu tính", "Tháng bắt đầu tính")
    v = v.replace("phường, số nhà", "tên phố・số nhà").replace("Phường, số nhà", "Tên phố・số nhà")
    v = v.replace("chưa xác định", "chưa chốt").replace("đã xác định", "đã chốt").replace("Chưa xác định", "Chưa chốt")
    v = v.replace("Sửa qua", "Chỉnh sửa qua").replace("Chỉnh chỉnh sửa", "Chỉnh sửa")
    v = v.replace("Lỗi cả tệp", "Lỗi toàn tệp").replace("lỗi cả tệp", "lỗi toàn tệp")
    v = v.replace("mã bưu điện", "mã bưu chính").replace("Mã bưu điện", "Mã bưu chính")
    v = v.replace("Phường/số nhà", "Tên phố・số nhà").replace("Tên phố/số nhà", "Tên phố・số nhà")
    v = v.replace("đã dừng", "đang dừng").replace("Đã dừng", "Đang dừng")
    v = v.replace("Tạm dừng tài khoản", "Dừng tài khoản").replace("tạm dừng tài khoản", "dừng tài khoản")
    return v


def D(ja, vi):
    """日本語の文を返しつつ、ベトナム語を TR に登録する"""
    TR[ja] = uni(vi)
    return ja


def F(no, ja, sel, kind, trig="view", **kw):
    d = {"no": no, "ja": ja, "vi": T(ja), "sel": sel, "kind": kind, "trig": trig}
    for k, v in kw.items():
        if v is None:
            continue
        if k == "ex" and isinstance(v, str):
            v = [v, TR.get(ja + "|" + v, "")]
        elif k in PAIR and isinstance(v, str):
            v = [v, T(v)]
        if k == "len" and isinstance(v, str):
            v = [v, T(v)]
        d[k] = v
    return d


# ---------------------------------------------------------------- ベトナム語（日本語 → ベトナム語）
# 1) 画面名・状態名・項目名
TR.update({
    "拠点一覧（AW_BRCH）": "Danh sách chi nhánh (AW_BRCH)",
    "拠点一覧": "Danh sách chi nhánh",
    "拠点詳細": "Chi tiết chi nhánh",
    "拠点編集": "Chỉnh sửa chi nhánh",
    # 項目名
    "ヘッダー": "Đầu trang", "パンくず": "Breadcrumb", "画面名": "Tên màn hình", "CSV取込": "Nhập CSV", "CSV出力": "Xuất CSV",
    "検索条件": "Điều kiện tìm kiếm",
    "拠点ID・拠点名・親契約番号": "ID chi nhánh / Tên chi nhánh / Số hợp đồng cha",
    "郵便番号・電話番号・市区町村・旧ES ユーザーID": "Mã bưu điện / Số điện thoại / Quận-huyện / ID người dùng ES cũ",
    "所属法人": "Pháp nhân trực thuộc", "拠点ステータス": "Trạng thái chi nhánh", "契約種別": "Loại hợp đồng",
    "契約ステータス": "Trạng thái hợp đồng", "請求先": "Bên nhận hóa đơn", "都道府県": "Tỉnh/thành (都道府県)",
    "現在のプラン": "Plan hiện tại", "当初契約開始年月（から・まで）": "Tháng bắt đầu hợp đồng ban đầu (từ - đến)",
    "登録日（から・まで）": "Ngày đăng ký (từ - đến)", "クリア": "Xóa điều kiện", "検索": "Tìm kiếm", "一覧": "Danh sách",
    "拠点ID": "ID chi nhánh", "拠点名": "Tên chi nhánh", "親契約番号": "Số hợp đồng cha",
    "当初契約開始年月": "Tháng bắt đầu hợp đồng ban đầu", "継続年月": "Thời gian duy trì (năm-tháng)", "住所": "Địa chỉ",
    "登録日時": "Ngày giờ đăng ký", "操作": "Thao tác", "編集": "Chỉnh sửa", "並べ替え": "Sắp xếp", "ページ送り": "Phân trang",
    "件数": "Số lượng", "前のページ": "Trang trước", "ページ番号": "Số trang", "次のページ": "Trang sau", "表示件数": "Số dòng hiển thị",
    "絞り込んだ一覧": "Danh sách sau khi lọc", "0件のメッセージ": "Thông báo 0 kết quả", "仮登録の行": "Dòng đăng ký tạm",
    "申請で編集": "Sửa qua đơn đăng ký", "仮登録のバッジ": "Badge đăng ký tạm", "法人なしの拠点": "Chi nhánh không có pháp nhân",
    "閉鎖予定のバッジ": "Badge dự kiến đóng", "参照だけの役割の画面": "Màn hình của vai trò chỉ xem", "操作の列": "Cột thao tác",
    "手順": "Các bước", "説明": "Mô tả", "ファイルを選ぶ": "Chọn tệp", "キャンセル": "Hủy",
    "サマリー": "Tóm tắt", "当月請求額": "Số tiền yêu cầu tháng này", "タブ": "Tab", "基本情報": "Thông tin cơ bản", "契約": "Hợp đồng",
    "設備・オプション": "Thiết bị / Option", "請求": "Thanh toán", "資料・履歴": "Tài liệu / Lịch sử",
    "項目の検索": "Tìm kiếm mục", "項目を検索": "Tìm mục", "すべて閉じる・開く": "Đóng / mở tất cả", "入力する項目だけ": "Chỉ các mục nhập được",
    "拠点名フリガナ": "Tên chi nhánh (Furigana)", "従業員数": "Số nhân viên",
    "基準数のパターン": "Mẫu số lượng chuẩn", "旧ES ユーザーID": "ID người dùng ES cũ", "備考": "Ghi chú",
    "郵便番号": "Mã bưu điện", "住所検索": "Tìm địa chỉ", "市区町村": "Quận/huyện (市区町村)", "町名・番地": "Phường/số nhà (町名・番地)",
    "建物等": "Tòa nhà, v.v.", "設置フロア": "Tầng lắp đặt", "電話番号": "Số điện thoại", "FAX番号": "Số FAX",
    "担当者": "Người phụ trách", "区分": "Phân loại", "担当者名": "Tên người phụ trách", "フリガナ": "Furigana", "メールアドレス": "Địa chỉ email",
    "電話番号（担当者）": "Số điện thoại (người phụ trách)", "アカウント": "Tài khoản", "ログインID": "ID đăng nhập",
    "最終ログイン日時": "Lần đăng nhập gần nhất", "アカウントのステータス": "Trạng thái tài khoản", "パスワード再設定": "Đặt lại mật khẩu",
    "ログイン案内の再送": "Gửi lại hướng dẫn đăng nhập", "アカウントの停止・再開": "Tạm dừng / mở lại tài khoản",
    "親契約": "Hợp đồng cha", "開始サイクル月": "Tháng chu kỳ bắt đầu", "契約終了日": "Ngày kết thúc hợp đồng", "お試し期間（月数）": "Thời gian dùng thử (số tháng)",
    "お試しの延長": "Gia hạn dùng thử", "代理店コード（紹介有無）": "Mã đại lý (có giới thiệu hay không)", "親契約番号（契約ID）": "Số hợp đồng cha (ID hợp đồng)",
    "契約開始年月": "Tháng bắt đầu hợp đồng", "請求時備考（社内）": "Ghi chú khi thanh toán (nội bộ)", "一覧（子契約）": "Danh sách (hợp đồng con)",
    "子契約を先まで作る": "Tạo trước hợp đồng con", "契約・サイクル月": "Hợp đồng / Tháng chu kỳ", "契約終了予定月": "Tháng dự kiến kết thúc hợp đồng",
    "子契約ID": "ID hợp đồng con", "プラン名": "Tên plan", "契約ステータス（親契約より）": "Trạng thái hợp đồng (theo hợp đồng cha)",
    "配送区分": "Loại giao hàng", "納品回数": "Số lần giao hàng", "請求月": "Tháng thanh toán", "請求ステータス": "Trạng thái thanh toán",
    "生成方法": "Cách tạo", "休止期間の帯": "Dải thời gian tạm dừng", "貸出一覧": "Danh sách cho mượn",
    "回収未完了（アラート）": "Chưa thu hồi xong (cảnh báo)", "回収済の表示": "Hiển thị đã thu hồi", "貸出中 合計": "Tổng đang cho mượn",
    "未返却 合計": "Tổng chưa trả", "貸出ID": "ID cho mượn", "設備区分": "Loại thiết bị", "機種": "Model", "個体番号": "Số hiệu từng máy",
    "貸出数": "Số lượng cho mượn", "返却済数": "Số lượng đã trả", "未返却数": "Số lượng chưa trả", "貸出日": "Ngày cho mượn",
    "返却予定日": "Ngày dự kiến trả", "返却日": "Ngày trả", "貸出ステータス": "Trạng thái cho mượn", "回収理由": "Lý do thu hồi",
    "最低利用期間の満了日": "Ngày hết thời gian sử dụng tối thiểu", "違約金の判定": "Xác định phí vi phạm", "最終更新": "Cập nhật gần nhất",
    "オプション・割引（今のサイクル月）": "Option / Giảm giá (tháng chu kỳ hiện tại)", "子契約で変更する": "Thay đổi ở hợp đồng con",
    "コード・名称": "Mã / Tên", "数量": "Số lượng", "金額・率": "Số tiền / Tỷ lệ", "適用開始月": "Tháng bắt đầu áp dụng", "適用終了月": "Tháng kết thúc áp dụng",
    "請求先と請求条件": "Bên nhận hóa đơn và điều kiện thanh toán", "請求書発行リードタイムの上書き": "Ghi đè thời gian chuẩn bị phát hành hóa đơn",
    "支払方法": "Phương thức thanh toán", "口座振替の手続きステータス": "Trạng thái thủ tục chuyển khoản tự động",
    "支払サイクル": "Chu kỳ thanh toán", "起算月（年払いのとき）": "Tháng tính (khi trả theo năm)", "入金期限": "Hạn thanh toán",
    "Bill One 発行先ID": "ID nơi phát hành Bill One", "一覧（この拠点の請求書）": "Danh sách (hóa đơn của chi nhánh này)",
    "請求書詳細を開く": "Mở chi tiết hóa đơn", "請求書番号": "Số hóa đơn", "発行日": "Ngày phát hành", "固定額": "Số tiền cố định",
    "固定額の対象": "Đối tượng của số tiền cố định", "実績精算": "Quyết toán thực tế", "実績精算の対象": "Đối tượng của quyết toán thực tế",
    "消費税": "Thuế tiêu dùng", "この拠点の請求金額（税込）": "Số tiền hóa đơn của chi nhánh này (đã gồm thuế)", "請求書ステータス": "Trạng thái hóa đơn",
    "請求先＝この拠点のときの支払項目": "Các mục thanh toán khi bên nhận hóa đơn = chi nhánh này",
    "添付資料（法人に公開）": "Tài liệu đính kèm (công khai cho pháp nhân)", "搬入経路資料（顧客向け）": "Tài liệu lộ trình vận chuyển vào (cho khách hàng)",
    "設置場所写真": "Ảnh vị trí lắp đặt", "申込時の添付資料": "Tài liệu đính kèm lúc đăng ký", "添付資料（社内のみ・非公開）": "Tài liệu đính kèm (chỉ nội bộ, không công khai)",
    "搬入経路資料（委託配送先向け・非公開）": "Tài liệu lộ trình vận chuyển vào (cho đơn vị giao hàng ủy thác, không công khai)",
    "運営側の追加資料": "Tài liệu bổ sung phía vận hành", "申請履歴（法人Webからの変更申請）": "Lịch sử yêu cầu (yêu cầu thay đổi từ Web pháp nhân)",
    "受付番号": "Số tiếp nhận", "申請の種類": "Loại yêu cầu", "申請日": "Ngày yêu cầu", "申請者": "Người yêu cầu", "申請内容": "Nội dung yêu cầu",
    "承認状態": "Trạng thái phê duyệt", "承認者・承認日時": "Người duyệt / Ngày giờ duyệt", "却下理由": "Lý do từ chối", "取り下げ日時": "Ngày giờ rút lại",
    "履歴（拠点・親契約）": "Lịch sử (chi nhánh / hợp đồng cha)", "日時": "Ngày giờ", "操作した人": "Người thao tác", "項目": "Mục",
    "変更前": "Trước khi đổi", "変更後": "Sau khi đổi", "理由": "Lý do", "仮登録の帯": "Dải thông báo đăng ký tạm",
    "申請詳細で編集": "Sửa ở chi tiết đơn", "お試しの拠点の親契約": "Hợp đồng cha của chi nhánh dùng thử", "お試しを延長する": "Gia hạn dùng thử",
    "お試しを延長するダイアログ": "Hộp thoại gia hạn dùng thử", "いまのお試し期間": "Thời gian dùng thử hiện tại", "延長する月数": "Số tháng gia hạn",
    "メモ（社内）": "Ghi chú (nội bộ)", "足す子契約の表": "Bảng hợp đồng con sẽ thêm", "延長する": "Gia hạn",
    "子契約を先まで作るダイアログ": "Hộp thoại tạo trước hợp đồng con", "作成済": "Đã tạo", "どの月まで作りますか": "Tạo đến tháng nào",
    "作られる子契約の表": "Bảng hợp đồng con sẽ được tạo", "n件作成": "Tạo n hợp đồng", "送る": "Gửi", "閉鎖予定": "Dự kiến đóng",
    "閉鎖の拠点": "Chi nhánh đã đóng", "見つからないメッセージ": "Thông báo không tìm thấy", "保存": "Lưu",
    "行を追加": "Thêm dòng", "行の削除": "Xóa dòng", "項目の下の文言": "Thông báo dưới mục", "エラーのトースト": "Toast lỗi",
    "破棄の確認": "Xác nhận hủy bỏ", "本文": "Nội dung", "破棄": "Hủy bỏ", "保存完了": "Lưu xong", "添付資料": "Tài liệu đính kèm",
})
# 状態名
TR.update({
    "初期表示（17拠点）": "Hiển thị ban đầu (17 chi nhánh)",
    "検索して絞り込み（契約種別＝お試しキャンペーン）": "Tìm kiếm và lọc (loại hợp đồng = chiến dịch dùng thử)",
    "該当なし（0件）": "Không có kết quả (0 mục)",
    "仮登録の行（「申請で編集」）": "Dòng đăng ký tạm (「申請で編集」)",
    "法人なしの拠点・閉鎖予定": "Chi nhánh không có pháp nhân, dự kiến đóng",
    "参照だけの役割": "Vai trò chỉ xem",
    "CSV取込・CSV出力": "Nhập CSV / Xuất CSV",
    "基本情報タブ（本登録・請求先＝法人）": "Tab Thông tin cơ bản (đăng ký chính thức, bên nhận hóa đơn = pháp nhân)",
    "契約タブ（親契約・子契約一覧・「子契約を先まで作る」）": "Tab Hợp đồng (hợp đồng cha, danh sách hợp đồng con, 「子契約を先まで作る」)",
    "契約タブ：休止の帯（休止予定→10/12 以降は休止中）": "Tab Hợp đồng: dải tạm dừng (dự kiến tạm dừng, từ 12/10 là đang tạm dừng)",
    "設備・オプションタブ（貸出・オプション表）": "Tab Thiết bị / Option (bảng cho mượn, bảng option)",
    "請求タブ（請求先＝法人：支払項目が非活性）": "Tab Thanh toán (bên nhận hóa đơn = pháp nhân: các mục thanh toán bị vô hiệu)",
    "請求タブ（請求先＝この拠点・年払い）": "Tab Thanh toán (bên nhận hóa đơn = chi nhánh này, trả theo năm)",
    "資料・履歴タブ": "Tab Tài liệu / Lịch sử",
    "仮登録の拠点（「申請詳細で編集」・帯）": "Chi nhánh đăng ký tạm (「申請詳細で編集」, dải thông báo)",
    "お試しの拠点（「お試しの延長」ボタン）": "Chi nhánh dùng thử (nút 「お試しの延長」)",
    "お試しを延長する（ダイアログ）": "Gia hạn dùng thử (hộp thoại)",
    "子契約を先まで作る（ダイアログ）": "Tạo trước hợp đồng con (hộp thoại)",
    "パスワード再設定の確認": "Xác nhận đặt lại mật khẩu",
    "閉鎖予定・法人なし": "Dự kiến đóng, không có pháp nhân",
    "閉鎖": "Đã đóng",
    "見つからない": "Không tìm thấy",
    "編集 初期表示": "Chỉnh sửa: hiển thị ban đầu",
    "編集 契約タブ": "Chỉnh sửa: tab Hợp đồng",
    "編集 請求タブ（請求先を「この拠点」に変えると活性）": "Chỉnh sửa: tab Thanh toán (đổi bên nhận hóa đơn sang 「この拠点」 thì các mục được kích hoạt)",
    "入力エラー": "Lỗi nhập liệu",
    "編集内容を破棄しますか（Q02）": "Hủy nội dung đã chỉnh sửa? (Q02)",
    "保存した（S01→詳細）": "Đã lưu (S01 → chi tiết)",
    "編集 資料・履歴タブ": "Chỉnh sửa: tab Tài liệu / Lịch sử",
})
# 型・桁数（len）と初期値（init）
TR.update({
    "文字列 60": "Chuỗi 60", "文字列 255": "Chuỗi 255", "文字列 500": "Chuỗi 500",
    "選択（一覧にある所属法人。「（法人なし）」を含む）": "Chọn (pháp nhân trực thuộc có trong danh sách, gồm mục \"không có pháp nhân\")",
    "選択（仮登録／本登録／休止中／閉鎖予定／閉鎖）": "Chọn (đăng ký tạm / đăng ký chính thức / đang tạm dừng / dự kiến đóng / đã đóng)",
    "選択（本導入／お試しキャンペーン）": "Chọn (triển khai chính thức / chiến dịch dùng thử)",
    "選択（有効／仮登録／解約手続き中／利用休止／終了／取消）": "Chọn (hiệu lực / đăng ký tạm / đang làm thủ tục hủy / tạm ngừng sử dụng / dừng / kết thúc)",
    "選択（法人／この拠点）": "Chọn (pháp nhân / chi nhánh này)",
    "選択（一覧の住所にある都道府県）": "Chọn (tỉnh/thành có trong địa chỉ của danh sách)",
    "選択（一覧にあるプラン）": "Chọn (plan có trong danh sách)",
    "年月 yyyy-mm（から・まで）": "Năm-tháng yyyy-mm (từ - đến)",
    "日付 yyyy-mm-dd（から・まで）": "Ngày yyyy-mm-dd (từ - đến)",
    "文字列 CU＋連番": "Chuỗi: CU + số thứ tự", "文字列 CP＋連番": "Chuỗi: CP + số thứ tự",
    "年月 yyyy-mm": "Năm-tháng yyyy-mm", "日時 yyyy-mm-dd HH:MM": "Ngày giờ yyyy-mm-dd HH:MM",
    "選択（列見出し・昇順／降順）。一覧の全列": "Chọn (tiêu đề cột, tăng dần / giảm dần). Tất cả cột của danh sách",
    "選択（10／20／50 件／ページ）": "Chọn (10 / 20 / 50 dòng mỗi trang)",
    "金額（税込・円）": "Số tiền (đã gồm thuế, yên)", "チェック": "Checkbox",
    "選択（回収済を隠す／回収済も表示）": "Chọn (ẩn đã thu hồi / hiện cả đã thu hồi)",
    "件数＋内訳": "Số lượng + chi tiết",
    "整数 1以上（上限なし）": "Số nguyên từ 1 trở lên (không có giới hạn trên)",
    "選択（年月 yyyy-mm。作成済みの翌月〜今月から12ヶ月先）": "Chọn (năm-tháng yyyy-mm. Từ tháng sau tháng đã tạo đến 12 tháng kể từ tháng này)",
    "選択（先頭「（法人なし）」＋法人マスタの法人。法人ID・法人名で絞り込み検索）": "Chọn (dòng đầu \"không có pháp nhân\" + pháp nhân trong master pháp nhân. Tìm lọc theo ID / tên pháp nhân)",
    "整数 0〜999,999": "Số nguyên 0 ~ 999,999", "日付 yyyy-mm-dd": "Ngày yyyy-mm-dd",
    "選択（仮登録／本登録／閉鎖予定／閉鎖）": "Chọn (đăng ký tạm / đăng ký chính thức / dự kiến đóng / đã đóng)",
    "選択（通常／短消費期限なし）": "Chọn (thông thường / không có hạn dùng ngắn)",
    "文字列 500（複数行）": "Chuỗi 500 (nhiều dòng)",
    "文字列 8（数字7桁。ハイフンは任意）": "Chuỗi 8 (7 chữ số; dấu gạch ngang tùy chọn)",
    "選択（47都道府県）": "Chọn (47 tỉnh/thành)",
    "文字列 20（数字とハイフン）": "Chuỗi 20 (chữ số và dấu gạch ngang)",
    "選択（メイン担当者／請求担当者／サブ担当者）": "Chọn (người phụ trách chính / phụ trách thanh toán / phụ trách phụ)",
    "選択（お試しキャンペーン／本導入）": "Chọn (chiến dịch dùng thử / triển khai chính thức)",
    "選択（仮登録／有効／解約手続き中／利用休止／終了）": "Chọn (đăng ký tạm / hiệu lực / đang làm thủ tục hủy / dừng / tạm ngừng sử dụng / kết thúc)",
    "選択（年月 yyyy-mm。オーダー締切に連動）": "Chọn (năm-tháng yyyy-mm; liên động với hạn chốt đặt hàng)",
    "選択（1ヶ月〜）": "Chọn (từ 1 tháng)",
    "選択（先頭「（紹介なし）」＋代理店マスタ）": "Chọn (dòng đầu \"không có giới thiệu\" + master đại lý)",
    "選択（3ヶ月前（−3）／2ヶ月前（−2）／1ヶ月前（−1）／当月（0）／翌月（+1））": "Chọn (3 tháng trước (−3) / 2 tháng trước (−2) / 1 tháng trước (−1) / tháng này (0) / tháng sau (+1))",
    "選択（口座振替／銀行振込／クレジットカード）": "Chọn (chuyển khoản tự động / chuyển khoản ngân hàng / thẻ tín dụng)",
    "選択（未手続き／手続き中／完了）": "Chọn (chưa làm thủ tục / đang làm thủ tục / hoàn tất)",
    "選択（月払い／年払い）": "Chọn (trả theo tháng / trả theo năm)",
    "選択（年月 yyyy-mm）": "Chọn (năm-tháng yyyy-mm)",
    "選択（請求月の27日／請求月の翌月27日）": "Chọn (ngày 27 của tháng thanh toán / ngày 27 của tháng sau tháng thanh toán)",
    "ファイル（JPG・PNG・PDF・HEIC。1件5MB・10件まで）": "Tệp (JPG, PNG, PDF, HEIC; tối đa 5MB mỗi tệp, tối đa 10 tệp)",
    "空": "Trống", "未選択（先頭＝条件名）": "Chưa chọn (dòng đầu = tên điều kiện)", "未選択": "Chưa chọn",
    "登録日時 降順": "Ngày giờ đăng ký, giảm dần", "10件／ページ": "10 dòng/trang", "OFF": "Tắt", "回収済を隠す": "Ẩn đã thu hồi",
    "1": "1", "次の1サイクル": "1 chu kỳ tiếp theo", "保存済みの値": "Giá trị đã lưu",
})

# 2) 説明・条件・入力の決まり・確認事項・メモ・決定・コードとの差（日本語 → ベトナム語）
TR.update({
    "拠点ID・拠点名・親契約番号|CU00643":
        "Mã/tên chi nhánh hoặc số hợp đồng cha; khớp một phần (ví dụ: ID chi nhánh CU00643)",
    "郵便番号・電話番号・市区町村・旧ES ユーザーID|港区":
        "Quận/huyện (市区町村), khớp một phần với mã bưu điện / số điện thoại / địa chỉ / ID ES cũ (ví dụ: Minato-ku)",
    "所属法人|株式会社サンプル":
        "Tên pháp nhân trực thuộc có trong danh sách (ví dụ: công ty Sample)",
    "拠点ステータス|閉鎖予定":
        "Trạng thái chi nhánh cần lọc (ví dụ: dự kiến đóng)",
    "契約種別|お試しキャンペーン":
        "Loại hợp đồng cần lọc (ví dụ: chiến dịch dùng thử)",
    "契約ステータス|解約手続き中":
        "Trạng thái hợp đồng cần lọc (ví dụ: đang làm thủ tục hủy)",
    "請求先|この拠点":
        "Bên nhận hóa đơn cần lọc (ví dụ: chi nhánh này)",
    "都道府県|東京都":
        "Tỉnh/thành trong địa chỉ cần lọc (ví dụ: Tokyo)",
    "現在のプラン|ES000004 100プラン":
        "Plan hiện tại cần lọc, dạng ID plan + tên plan (ví dụ: ES000004 plan 100)",
    "当初契約開始年月（から・まで）|2026-03":
        "Tháng bắt đầu hợp đồng ban đầu, dạng yyyy-mm (ví dụ: tháng 3/2026)",
    "登録日（から・まで）|2026-04-01":
        "Ngày đăng ký, dạng yyyy-mm-dd (ví dụ: 01/04/2026)",
    "並べ替え|拠点ID 昇順":
        "Cột sắp xếp và chiều sắp xếp (ví dụ: ID chi nhánh tăng dần)",
    "表示件数|20件／ページ":
        "Số dòng mỗi trang: 10 / 20 / 50 (ví dụ: 20 dòng/trang)",
    "項目を検索|電話":
        "Từ khóa tìm tên mục, giá trị, mô tả (ví dụ: \"điện thoại\")",
    "入力する項目だけ|ON":
        "Bật = ẩn các mục không nhập được",
    "回収済の表示|回収済も表示":
        "Chọn hiện cả các thiết bị đã thu hồi (mặc định ẩn)",
    "延長する月数|2":
        "Số tháng gia hạn dùng thử, số nguyên từ 1 (ví dụ: 2 tháng)",
    "メモ（社内）|法人のご希望（検討期間の延長）":
        "Ghi chú nội bộ lưu vào lịch sử gia hạn, tối đa 500 ký tự (ví dụ: theo nguyện vọng của pháp nhân, kéo dài thời gian xem xét)",
    "どの月まで作りますか|2027-06":
        "Tháng cuối cùng muốn tạo hợp đồng con, dạng yyyy-mm (ví dụ: tháng 6/2027)",
    "拠点名|株式会社エービーシー 本社":
        "Tên chi nhánh in trên hóa đơn / phiếu giao hàng, tối đa 60 ký tự (ví dụ: Công ty ABC - Trụ sở chính)",
    "拠点名フリガナ|カブシキガイシャエービーシー ホンシャ":
        "Tên chi nhánh viết bằng Katakana toàn góc, tối đa 60 ký tự (ví dụ: Công ty ABC - Trụ sở chính)",
    "所属法人|CU00001 株式会社サンプル":
        "Pháp nhân mà chi nhánh trực thuộc, dạng ID pháp nhân + tên pháp nhân (ví dụ: CU00001 công ty Sample)",
    "従業員数|120":
        "Số nhân viên của chi nhánh, số nguyên 0 ~ 999,999 (ví dụ: 120 người)",
    "当初契約開始年月|2026-03":
        "Tháng (chu kỳ) ký hợp đồng đầu tiên, dạng yyyy-mm (ví dụ: tháng 3/2026)",
    "拠点ステータス|本登録":
        "Trạng thái chi nhánh (ví dụ: đăng ký chính thức)",
    "基準数のパターン|通常":
        "Mẫu số lượng chuẩn: thông thường / không có hạn dùng ngắn (ví dụ: thông thường)",
    "備考|搬入は裏口からお願いします":
        "Yêu cầu của khách, tối đa 500 ký tự, nhiều dòng (ví dụ: \"Vui lòng giao hàng ở cửa sau\")",
    "郵便番号|105-0011":
        "Mã bưu điện 7 chữ số, có hoặc không có dấu gạch ngang (ví dụ: 105-0011)",
    "市区町村|港区":
        "Quận/huyện, tối đa 255 ký tự (ví dụ: Minato-ku)",
    "町名・番地|芝公園2-4-1":
        "Phường/số nhà, tối đa 255 ký tự (ví dụ: Shibakoen 2-4-1)",
    "建物等|芝パークビル8F":
        "Tên tòa nhà, tầng, tối đa 255 ký tự (ví dụ: Shiba Park Building tầng 8)",
    "設置フロア|8階（エレベーター右）":
        "Tầng và vị trí lắp đặt, tối đa 60 ký tự (ví dụ: tầng 8, bên phải thang máy)",
    "電話番号|03-5401-2200":
        "Số điện thoại của chi nhánh, 10 ~ 11 chữ số có thể kèm dấu gạch ngang (ví dụ: 03-5401-2200)",
    "FAX番号|03-5401-2201":
        "Số FAX của chi nhánh, 10 ~ 11 chữ số có thể kèm dấu gạch ngang (ví dụ: 03-5401-2201)",
    "区分|メイン担当者":
        "Loại người phụ trách: chính / thanh toán / phụ (ví dụ: người phụ trách chính)",
    "担当者名|佐藤 誠":
        "Họ tên người phụ trách, tối đa 60 ký tự (ví dụ: Satou Makoto)",
    "フリガナ|サトウ マコト":
        "Furigana của người phụ trách bằng Katakana toàn góc, tối đa 60 ký tự (ví dụ: サトウ マコト)",
    "メールアドレス|sato@example.co.jp":
        "Địa chỉ email của người phụ trách, tối đa 60 ký tự (ví dụ: sato@example.co.jp)",
    "電話番号（担当者）|03-5401-2200":
        "Số điện thoại của người phụ trách, dạng số và dấu gạch ngang (ví dụ: 03-5401-2200)",
    "契約種別|本導入":
        "Loại hợp đồng (ví dụ: triển khai chính thức)",
    "契約ステータス|有効":
        "Trạng thái hợp đồng (ví dụ: hiệu lực)",
    "開始サイクル月|2026-03":
        "Tháng chu kỳ đầu tiên, dạng yyyy-mm (ví dụ: tháng 3/2026)",
    "契約終了日|2027-03-31":
        "Ngày kết thúc hợp đồng, dạng yyyy-mm-dd (ví dụ: 31/03/2027)",
    "お試し期間（月数）|1ヶ月":
        "Số tháng dùng thử, từ 1 tháng (ví dụ: 1 tháng)",
    "代理店コード（紹介有無）|AG00021 株式会社パートナーズ":
        "Mã và tên đại lý giới thiệu (ví dụ: AG00021 công ty Partners)",
    "請求時備考（社内）|請求書は担当者あてに郵送":
        "Ghi chú nội bộ khi thanh toán, tối đa 500 ký tự, nhiều dòng (ví dụ: gửi hóa đơn qua bưu điện cho người phụ trách)",
    "請求書発行リードタイムの上書き|当月（0）":
        "Thời gian chuẩn bị phát hành hóa đơn của riêng chi nhánh (ví dụ: tháng này (0))",
    "支払方法|銀行振込":
        "Phương thức thanh toán (ví dụ: chuyển khoản ngân hàng)",
    "口座振替の手続きステータス|手続き中":
        "Trạng thái thủ tục chuyển khoản tự động (ví dụ: đang làm thủ tục)",
    "支払サイクル|月払い":
        "Chu kỳ thanh toán (ví dụ: trả theo tháng)",
    "起算月（年払いのとき）|2026-04":
        "Tháng bắt đầu tính khi trả theo năm, dạng yyyy-mm (ví dụ: tháng 4/2026)",
    "入金期限|請求月の27日":
        "Hạn thanh toán (ví dụ: ngày 27 của tháng thanh toán)",
    "Bill One 発行先ID|BO-00671":
        "ID nơi phát hành trên Bill One, tối đa 60 ký tự (ví dụ: BO-00671)",
    "搬入経路資料（顧客向け）|搬入経路図_本社.pdf":
        "Tệp tài liệu lộ trình vận chuyển vào, JPG/PNG/PDF/HEIC, tối đa 5MB (ví dụ: bản đồ lộ trình trụ sở chính)",
    "設置場所写真|設置場所_8F.jpg":
        "Ảnh vị trí lắp đặt, JPG/PNG/PDF/HEIC, tối đa 5MB (ví dụ: ảnh tầng 8)",
    "搬入経路資料（委託配送先向け・非公開）|拠点マニュアル_本社_配送用.pdf":
        "Tệp hướng dẫn chi nhánh cho đơn vị giao hàng ủy thác, JPG/PNG/PDF/HEIC, tối đa 5MB",
    "運営側の追加資料|設置報告書_20260401.pdf":
        "Tệp tài liệu bổ sung do vận hành thêm, JPG/PNG/PDF/HEIC, tối đa 5MB (ví dụ: báo cáo lắp đặt ngày 01/04/2026)",
    "CSV取込の権限（フル権限・システム管理）がある役割だけに表示":
        "Chỉ hiển thị với vai trò có quyền nhập CSV (toàn quyền, quản trị hệ thống)",
    "編集の権限（フル権限・システム管理・物流）がある役割だけに表示":
        "Chỉ hiển thị với vai trò có quyền chỉnh sửa (toàn quyền, quản trị hệ thống, logistics)",
    "1ページ目では非活性":
        "Vô hiệu ở trang đầu tiên",
    "最後のページでは非活性":
        "Vô hiệu ở trang cuối cùng",
    "拠点の編集の権限がある役割だけに表示":
        "Chỉ hiển thị với vai trò có quyền chỉnh sửa chi nhánh",
    "編集の権限（フル権限・システム管理・物流）がある役割だけに表示。仮登録の拠点は出さない":
        "Chỉ hiển thị với vai trò có quyền chỉnh sửa (toàn quyền, quản trị hệ thống, logistics). Không hiển thị với chi nhánh đăng ký tạm",
    "拠点の編集の権限がある役割だけに表示（運営A Q9）":
        "Chỉ hiển thị với vai trò có quyền chỉnh sửa chi nhánh (vận hành A Q9)",
    "プラン契約管理の編集の権限（フル権限・システム管理）がある役割だけに表示。契約種別＝お試しキャンペーンのときだけ延長できる":
        "Chỉ hiển thị với vai trò có quyền chỉnh sửa quản lý hợp đồng plan (toàn quyền, quản trị hệ thống). Chỉ gia hạn được khi loại hợp đồng = chiến dịch dùng thử",
    "プラン契約管理の作成の権限（フル権限・システム管理）がある役割だけに表示。編集の画面で押せる（詳細では非活性）":
        "Chỉ hiển thị với vai trò có quyền tạo quản lý hợp đồng plan (toàn quyền, quản trị hệ thống). Bấm được ở màn hình chỉnh sửa (vô hiệu ở chi tiết)",
    "プラン契約管理の編集の権限がある役割だけに表示":
        "Chỉ hiển thị với vai trò có quyền chỉnh sửa quản lý hợp đồng plan",
    "貸出設備に自動販売機があるときは必須":
        "Bắt buộc khi có máy bán hàng tự động trong thiết bị cho mượn",
    "契約管理の編集の権限がない役割は参照だけ":
        "Vai trò không có quyền chỉnh sửa quản lý hợp đồng chỉ được xem",
    "契約種別＝お試しキャンペーンのときだけ活性":
        "Chỉ kích hoạt khi loại hợp đồng = chiến dịch dùng thử",
    "プラン契約管理の作成の権限（フル権限・システム管理）がある役割だけに表示":
        "Chỉ hiển thị với vai trò có quyền tạo quản lý hợp đồng plan (toàn quyền, quản trị hệ thống)",
    "請求先＝この拠点のときだけ活性":
        "Chỉ kích hoạt khi bên nhận hóa đơn = chi nhánh này",
    "請求先＝この拠点のときだけ活性（法人のときは保存もしない）":
        "Chỉ kích hoạt khi bên nhận hóa đơn = chi nhánh này (nếu là pháp nhân thì cũng không lưu)",
    "請求先＝この拠点 かつ 支払方法＝口座振替のときだけ活性":
        "Chỉ kích hoạt khi bên nhận hóa đơn = chi nhánh này và phương thức thanh toán = chuyển khoản tự động",
    "請求先＝この拠点 かつ 支払サイクル＝年払いのときだけ活性":
        "Chỉ kích hoạt khi bên nhận hóa đơn = chi nhánh này và chu kỳ thanh toán = trả theo năm",
    "部分一致。全角・半角、大文字・小文字を区別しない。":
        "Khớp một phần. Không phân biệt chữ toàn góc/bán góc, chữ hoa/thường.",
    "部分一致。":
        "Khớp một phần.",
    "期間で絞る。片方だけでもよい。年月の入力は共通の部品。":
        "Lọc theo khoảng thời gian; chỉ nhập một đầu cũng được. Ô nhập năm-tháng dùng component chung.",
    "期間で絞る。片方だけでもよい。日付の入力は共通の部品。":
        "Lọc theo khoảng thời gian; chỉ nhập một đầu cũng được. Ô nhập ngày dùng component chung.",
    "半角の整数。0 は不可（0 のときは延長ボタンが「月数を入れてください」で非活性）。":
        "Số nguyên bán góc. Không được nhập 0 (nếu 0 thì nút gia hạn bị vô hiệu với thông báo 「月数を入れてください」).",
    "前後の空白を取る。絵文字は不可。請求書・送り状で正しく印字されない文字は警告（W02）。":
        "Cắt khoảng trắng đầu/cuối. Không dùng emoji. Ký tự không in đúng trên hóa đơn / phiếu giao hàng sẽ cảnh báo (W02).",
    "全角カタカナ・長音・スペース。":
        "Katakana toàn góc, dấu trường âm, khoảng trắng.",
    "半角の数字。全角は半角に直す。":
        "Chữ số bán góc. Chữ số toàn góc được đổi sang bán góc.",
    "日付の入力は共通の部品。":
        "Ô nhập ngày dùng component chung.",
    "500文字まで。":
        "Tối đa 500 ký tự.",
    "数字7桁。":
        "7 chữ số.",
    "ハイフンを除いて10〜11桁。":
        "10 ~ 11 chữ số (không tính dấu gạch ngang).",
    "請求書の状態名は運営E の請求書一覧に合わせる（運営E の設計が決まったら置き換える）":
        "Tên trạng thái hóa đơn khớp với danh sách hóa đơn của Vận hành E (thay lại khi thiết kế Vận hành E được chốt)",
    "拠点に「新規登録」「削除」を置くか":
        "Có đặt 「新規登録」 và 「削除」 cho chi nhánh không",
    "拠点一覧に CSV取込を置くか":
        "Có đặt Nhập CSV ở danh sách chi nhánh không",
    "編集で直接直せるか":
        "Có sửa trực tiếp được ở màn hình chỉnh sửa không",
    "履歴の列":
        "Các cột của lịch sử",
    "どの画面に置くか":
        "Đặt ở màn hình nào",
    "請求書の状態名と列名":
        "Tên trạng thái và tên cột của hóa đơn",
    "検索条件とバッジ":
        "Điều kiện tìm kiếm và badge",
    "拠点のアカウントの操作と権限":
        "Thao tác và quyền đối với tài khoản chi nhánh",
    "画面コード":
        "Mã màn hình",
    "どの役割にも置かない。作成＝契約申請管理の代理入力、削除＝なし。状態（仮登録・本登録・閉鎖予定・閉鎖）で扱う":
        "Không đặt cho vai trò nào. Tạo mới = nhập hộ ở 契約申請管理, xóa = không có. Xử lý bằng trạng thái (đăng ký tạm / đăng ký chính thức / dự kiến đóng / đã đóng)",
    "更新だけの取込を置く（CRUD の役割だけ・P-CSV の画面・列＝詳細の入力項目＋拠点ID）。新規行・仮登録の行・参照項目の変更は行エラー":
        "Đặt nhập CSV chỉ để cập nhật (chỉ vai trò CRUD; màn hình P-CSV; cột = các mục nhập ở chi tiết + ID chi nhánh). Dòng mới, dòng đăng ký tạm, thay đổi mục tham chiếu đều là lỗi dòng",
    "直せる（コードのまま）。休止は拠点ステータスに持たない（契約ステータスの「利用休止」で表し、休止は変更申請から）。直接直したときは子契約の取消・アカウント停止・設備回収が自動では動かない。親契約の項目の保存は契約管理（contracts）の編集権限":
        "Sửa được (giữ nguyên giá trị mã). Chi nhánh không có trạng thái tạm ngừng (biểu thị bằng 「利用休止」 của trạng thái hợp đồng); bỏ lựa chọn 「休止中」 (tạm dừng làm từ yêu cầu thay đổi). Khi sửa trực tiếp, việc hủy hợp đồng con, dừng tài khoản, thu hồi thiết bị không tự chạy. Lưu mục của hợp đồng cha cần quyền chỉnh sửa quản lý hợp đồng (contracts)",
    "P-HIST の7列（日時・操作した人・操作・項目・変更前・変更後・理由）。適用範囲・承認者・通知は外す。変更者はアカウント名（ID 併記）":
        "7 cột P-HIST (ngày giờ, người thao tác, thao tác, mục, trước khi đổi, sau khi đổi, lý do). Bỏ phạm vi áp dụng, người duyệt, thông báo. Người thay đổi hiển thị theo tên tài khoản (kèm ID)",
    "拠点の「住所」カードの入力項目。子契約には出さない（配送備考は子契約のまま）":
        "Mục nhập trong thẻ 「住所」 của chi nhánh. Không hiện ở hợp đồng con (ghi chú giao hàng vẫn ở hợp đồng con)",
    "運営E の請求書一覧と同じ名前にする。未確定／確定／請求済（「入金済・未入金」は出さない・台帳 F）。列名は「固定額」「実績精算」（前払い・後払いを出さない・台帳 B）":
        "Dùng cùng tên với danh sách hóa đơn của Vận hành E. Gồm 未確定 / 確定 / 請求済, không hiện 「入金済・未入金」 (sổ cái F). Tên cột là 「固定額」「実績精算」 (không dùng trả trước / trả sau, sổ cái B)",
    "コードの追加条件を採る（現在のプラン・当初契約開始年月・登録日の範囲）。バッジの色は共通部品（status.ts）どおり":
        "Lấy các điều kiện bổ sung trong code (plan hiện tại, tháng bắt đầu hợp đồng ban đầu, khoảng ngày đăng ký). Màu badge theo component chung (status.ts)",
    "アカウントのステータス（参照）・パスワード再設定・ログイン案内の再送・停止／再開を置く。権限＝拠点の編集権限":
        "Đặt: trạng thái tài khoản (chỉ xem), đặt lại mật khẩu, gửi lại hướng dẫn đăng nhập, tạm dừng / mở lại. Quyền = quyền chỉnh sửa chi nhánh",
    "フル権限（Ad00010）で表示。ほかの役割では 1.3・3.15 が出ない（006 は閲覧のみの役割）。見本データは17拠点（確認メモの17は古い）。":
        "Hiển thị bằng toàn quyền (Ad00010). Với vai trò khác, 1.3 và 3.15 không hiện (006 là vai trò chỉ xem). Dữ liệu mẫu có 17 chi nhánh (số 17 trong ghi chú xác nhận là cũ).",
    "契約種別でお試しキャンペーンを選んで「検索」を押したとき。":
        "Khi chọn chiến dịch dùng thử ở loại hợp đồng rồi bấm 「検索」.",
    "拠点IDの欄に zzz を入れて検索したとき。":
        "Khi nhập zzz vào ô ID chi nhánh rồi tìm kiếm.",
    "拠点ステータスを仮登録で絞り込んだとき（見本 CU01012）。":
        "Khi lọc trạng thái chi nhánh = đăng ký tạm (mẫu CU01012).",
    "拠点ステータスを閉鎖予定で絞り込んだとき（見本 CU01310 カフェ花 横浜店・所属法人なし）。":
        "Khi lọc trạng thái chi nhánh = dự kiến đóng (mẫu CU01310 Cafe Hana chi nhánh Yokohama, không có pháp nhân).",
    "閲覧のみの役割（Ad00013）で開いたとき。CSV取込と編集（鉛筆）が出ない。":
        "Khi mở bằng vai trò chỉ xem (Ad00013). Không hiện Nhập CSV và chỉnh sửa (biểu tượng bút chì).",
    "見本 CU00643 株式会社サンプル 本社（本登録・請求先＝法人）。「アカウント」のステータス・再送・停止、「住所」の設置フロアは決定済みだがコードにない（demo_ok）。":
        "Mẫu CU00643 công ty Sample - Trụ sở chính (đăng ký chính thức, bên nhận hóa đơn = pháp nhân). Trạng thái / gửi lại / dừng ở 「アカウント」 và tầng lắp đặt ở 「住所」 đã được quyết định nhưng chưa có trong code (demo_ok).",
    "「子契約を先まで作る」は詳細では非活性（編集の画面で押せる）。":
        "Ở chi tiết, 「子契約を先まで作る」 bị vô hiệu (bấm được ở màn hình chỉnh sửa).",
    "見本 CU00902 は日付が 2026-10-12 以降のとき休止中になり、休止の帯が出る（デモの日付を 10/12 にして撮る）。":
        "Mẫu CU00902 sẽ thành đang tạm dừng khi ngày từ 2026-10-12 trở đi và hiện dải tạm dừng (chụp với ngày demo là 12/10).",
    "見本 CU00671（請求先＝この拠点・銀行振込・年払い・起算月 2026-04）。支払項目が値で埋まる。":
        "Mẫu CU00671 (bên nhận hóa đơn = chi nhánh này, chuyển khoản ngân hàng, trả theo năm, tháng tính 2026-04). Các mục thanh toán có giá trị.",
    "見本 CU01012（仮登録）。編集の画面（/edit）を直接開いても詳細の表示になる。":
        "Mẫu CU01012 (đăng ký tạm). Mở trực tiếp màn hình chỉnh sửa (/edit) vẫn hiển thị chi tiết.",
    "見本 CU00975（お試しキャンペーン・お試し期間 1ヶ月）。":
        "Mẫu CU00975 (chiến dịch dùng thử, thời gian dùng thử 1 tháng).",
    "016 の「お試しを延長する」を押したとき。月数を入れると、足す子契約の表と延長後のお試し期間が出る。":
        "Khi bấm 「お試しを延長する」 ở trạng thái 016. Nhập số tháng thì hiện bảng hợp đồng con sẽ thêm và thời gian dùng thử sau gia hạn.",
    "編集の契約タブで「子契約を先まで作る」を押したとき（詳細ではボタンが非活性で押せない）。":
        "Khi bấm 「子契約を先まで作る」 ở tab Hợp đồng của màn hình chỉnh sửa (ở chi tiết nút bị vô hiệu nên không bấm được).",
    "アカウントの「パスワード再設定」を押したとき。":
        "Khi bấm 「パスワード再設定」 ở mục tài khoản.",
    "見本 CU01310（所属法人なし・閉鎖予定・請求先＝この拠点）。":
        "Mẫu CU01310 (không có pháp nhân, dự kiến đóng, bên nhận hóa đơn = chi nhánh này).",
    "見本 CU00588（閉鎖・親契約は終了）。":
        "Mẫu CU00588 (đã đóng, hợp đồng cha đã kết thúc).",
    "存在しない拠点ID の URL を開いたとき。":
        "Khi mở URL có ID chi nhánh không tồn tại.",
    "見本 CU00643。保存済みの値が入り、入力できる項目に入力欄が出る。拠点ID・旧ES ユーザーID・ログインID は入力できない。":
        "Mẫu CU00643. Có giá trị đã lưu, các mục nhập được hiện ô nhập. ID chi nhánh, ID người dùng ES cũ, ID đăng nhập không nhập được.",
    "契約管理（contracts）の編集権限がない役割は、親契約の項目が参照だけになる（運営A Q3）。":
        "Với vai trò không có quyền chỉnh sửa quản lý hợp đồng (contracts), các mục của hợp đồng cha chỉ được xem (vận hành A Q3).",
    "請求先を「法人」から「この拠点」に変えたとき（支払方法などが入力できるようになる）。":
        "Khi đổi bên nhận hóa đơn từ 「法人」 sang 「この拠点」 (phương thức thanh toán, v.v. nhập được).",
    "拠点名を空にして「保存」を押したとき。":
        "Khi để trống tên chi nhánh rồi bấm 「保存」.",
    "従業員数を直して「キャンセル」を押したとき。直さずにキャンセルなら確認は出ない。":
        "Khi sửa số nhân viên rồi bấm 「キャンセル」. Nếu không sửa gì thì hủy sẽ không hiện xác nhận.",
    "入力に誤りがない状態で「保存」を押したとき。保存すると詳細（AW_BRCH_002）へ移る。":
        "Khi bấm 「保存」 lúc nhập không có lỗi. Sau khi lưu sẽ chuyển sang chi tiết (AW_BRCH_002).",
    "添付資料のアップロード・削除ができる（申込時の添付資料は参照だけ）。申請履歴・履歴の表は詳細と同じ。":
        "Tải lên / xóa được tài liệu đính kèm (tài liệu đính kèm lúc đăng ký chỉ xem). Bảng lịch sử yêu cầu và lịch sử giống ở chi tiết.",
    "コードは条件を変えたとき「検索」の横に「未適用」の印を出す（宿題 S2）。仕様は出さない":
        "Code hiện dấu 「未適用」 cạnh nút 「検索」 khi đổi điều kiện (宿題 S2). Spec không hiện",
    "コードの選択肢に「取消」がない（宿題 S19）。仕様が正":
        "Code không có lựa chọn 「取消」 (宿題 S19). Spec đúng",
    "コードは並びが登録順の固定で、並べ替えの UI がない（宿題 S1）。仕様が正":
        "Code cố định thứ tự theo thứ tự đăng ký, không có UI sắp xếp (宿題 S1). Spec đúng",
    "並べ替えの UI がない（宿題 S1）。仕様が正":
        "Không có UI sắp xếp (宿題 S1). Spec đúng",
    "コードの文言は「条件に一致するデータがありません。…」（宿題 S6）。I01 が正":
        "Câu của code là 「条件に一致するデータがありません。…」 (宿題 S6). I01 đúng",
    "コードは権限のない役割にも「申請で編集」を出す（宿題 S16）。仕様は権限のある役割だけ":
        "Code hiện 「申請で編集」 cả với vai trò không có quyền (宿題 S16). Spec chỉ hiện với vai trò có quyền",
    "コードは最初の表示だけ ?tab を読む（宿題 S4）。件数のあるタブの件数表示もない。仕様が正":
        "Code chỉ đọc ?tab ở lần hiển thị đầu (宿題 S4). Cũng không hiển thị số lượng ở các tab có số lượng. Spec đúng",
    "入力欄に最大文字数の制御がない（宿題 S8）。仕様が正":
        "Ô nhập không có giới hạn số ký tự tối đa (宿題 S8). Spec đúng",
    "コードは全角カタカナ・最大文字数のチェックがない（宿題 S8）。仕様が正":
        "Code không kiểm tra Katakana toàn góc và số ký tự tối đa (宿題 S8). Spec đúng",
    "コードは半角の数字のチェックだけ（宿題 S8）。仕様が正":
        "Code chỉ kiểm tra chữ số bán góc (宿題 S8). Spec đúng",
    "コードは5択（休止中・仮登録も入る）で、休止中を選んで保存すると「休止は契約申請管理の休止（変更申請）から登録してください」と出る（宿題 S12）。仕様は選択肢から休止中を外す":
        "Code có 5 lựa chọn (gồm cả 休止中 và 仮登録); chọn 休止中 rồi lưu thì hiện 「休止は契約申請管理の休止（変更申請）から登録してください」 (宿題 S12). Spec bỏ 休止中 khỏi lựa chọn",
    "コードはカードの途中・2列（宿題 S18）。3列幅でセクションの最後が正。最大文字数の制御もない（宿題 S8）":
        "Code đặt ở giữa thẻ, 2 cột (宿題 S18). Spec đúng: đặt ở cuối phần, rộng 3 cột. Cũng không có giới hạn số ký tự tối đa (宿題 S8)",
    "コードは押すとトーストだけ（未接続・宿題 S21）。仕様が正":
        "Code chỉ hiện toast khi bấm (chưa kết nối, 宿題 S21). Spec đúng",
    "コードにない（宿題）。コードは子契約の編集に「設置フロア」「配送備考」を置く。配送備考を拠点に揃えるかは未確認で、契約_05 のまま子契約":
        "Chưa có trong code (宿題). Code đặt 「設置フロア」 và 「配送備考」 ở màn hình sửa hợp đồng con. Chưa xác nhận có đưa ghi chú giao hàng về chi nhánh hay không; giữ nguyên ở hợp đồng con như 契約_05",
    "コードは半角の数字とハイフンのチェックだけ（宿題 S8）":
        "Code chỉ kiểm tra chữ số bán góc và dấu gạch ngang (宿題 S8)",
    "コードにない（宿題。運営A Q9）。仕様が正":
        "Chưa có trong code (宿題; vận hành A Q9). Spec đúng",
    "コードは法人の編集の権限（corps）で出し分け、物流が拠点の画面で再設定できない（運営A Q9）。仕様は拠点の編集の権限。コードの確認の文言は Q100 と違う":
        "Code phân quyền theo quyền chỉnh sửa pháp nhân (corps) nên logistics không đặt lại mật khẩu được ở màn hình chi nhánh (vận hành A Q9). Spec dùng quyền chỉnh sửa chi nhánh. Câu xác nhận trong code khác Q100",
    "コードは拠点の保存の権限（branches）で親契約も書くため、物流が親契約を直せる。仕様は契約管理の編集権限（運営A Q3）":
        "Code ghi cả hợp đồng cha bằng quyền lưu chi nhánh (branches) nên logistics sửa được hợp đồng cha. Spec dùng quyền chỉnh sửa quản lý hợp đồng (vận hành A Q3)",
    "コードは固定のリスト（宿題 S9）。マスタから作るのが正":
        "Code là danh sách cố định (宿題 S9). Spec đúng: tạo từ master",
    "コードは文字入力（宿題 S10）。共通の日付部品が正":
        "Code là ô nhập chữ (宿題 S10). Spec đúng: component ngày chung",
    "コードは本導入の契約でもボタンが出る。延長のダイアログの文言と表が「無料（DC000013）」のまま（宿題 S14）。仕様は延長の月もプラン料金を請求する":
        "Code hiện nút cả với hợp đồng triển khai chính thức. Câu và bảng trong hộp thoại gia hạn vẫn là 「無料（DC000013）」 (宿題 S14). Spec tính phí plan cả các tháng gia hạn",
    "コードは「回収済も表示」のトグルボタン（P-LIST：トグルは使わない）":
        "Code là nút bật/tắt 「回収済も表示」 (P-LIST: không dùng toggle)",
    "コードは法人なしの拠点でも請求先を変えられる（宿題 S11）。仕様が正":
        "Code cho đổi bên nhận hóa đơn cả với chi nhánh không có pháp nhân (宿題 S11). Spec đúng",
    "コードの選択肢は「翌月（+1・後払い）」（宿題 S13：前払い・後払いの語を出さない）。W101 のモーダルがない（宿題 S15）。この状態は見本データでは作れない（図だけ）":
        "Lựa chọn trong code là 「翌月（+1・後払い）」 (宿題 S13: không dùng từ trả trước / trả sau). Không có modal W101 (宿題 S15). Trạng thái này không tạo được bằng dữ liệu mẫu (chỉ có hình minh họa)",
    "コードは「請求の確定」の一覧へ移るだけ（宿題 S22）。仕様が正":
        "Code chỉ chuyển sang danh sách 「請求の確定」 (宿題 S22). Spec đúng",
    "コードの列名は「固定額（前払い）」「前払いの対象」「実績精算（後払い）」（宿題 S13：前払い・後払いの語を出さない）。仕様が正":
        "Tên cột trong code là 「固定額（前払い）」「前払いの対象」「実績精算（後払い）」 (宿題 S13: không dùng từ trả trước / trả sau). Spec đúng",
    "コードの項目名は「委託配送会社向け」（台帳は「委託配送先」）":
        "Tên mục trong code là 「委託配送会社向け」 (sổ cái ghi 「委託配送先」)",
    "コードは6列（変更日時・変更内容・変更者・適用範囲・承認者・通知の有無）で、適用範囲・承認者・通知は常に「—」（運営A Q4）。仕様は P-HIST の7列":
        "Code có 6 cột (ngày giờ đổi, nội dung đổi, người đổi, phạm vi áp dụng, người duyệt, có thông báo hay không), trong đó phạm vi áp dụng / người duyệt / thông báo luôn là 「—」 (vận hành A Q4). Spec là 7 cột của P-HIST",
    "コードの説明と表は延長の月を「無料（DC000013）」と出す（宿題 S14）。仕様は延長の月もプラン料金を請求する":
        "Câu và bảng trong code hiển thị các tháng gia hạn là 「無料（DC000013）」 (宿題 S14). Spec tính phí plan cả các tháng gia hạn",
    "コードは「無料（DC000013）」（宿題 S14）。仕様が正":
        "Code hiện 「無料（DC000013）」 (宿題 S14). Spec đúng",
    "コードの確認の文言は「拠点アカウント（…）のメイン担当者（…）に、…」で Q100 と同じ。ダイアログの見た目はコード独自（宿題）。権限は仕様と違う（8.4）":
        "Câu xác nhận trong code là 「拠点アカウント（…）のメイン担当者（…）に、…」, giống Q100. Giao diện hộp thoại là của riêng code (宿題). Quyền khác spec (8.4)",
    "コードの文言は「拠点（CU99999）が見つかりません」で E100 と同じ形（句点がない）":
        "Câu của code là 「拠点（CU99999）が見つかりません」, cùng dạng với E100 (không có dấu chấm cuối câu)",
    "同時編集の I02・E31 はコードにない（上書きされる・宿題 S7）。仕様が正。この状態は見本データでは作れない（図だけ）":
        "I02 và E31 khi sửa đồng thời không có trong code (bị ghi đè, 宿題 S7). Spec đúng. Trạng thái này không tạo được bằng dữ liệu mẫu (chỉ có hình minh họa)",
    "コードは担当者の必須・メール形式・カナ・文字数のチェックがない（宿題 S8）。仕様が正":
        "Code không kiểm tra bắt buộc, định dạng email, Katakana, số ký tự của người phụ trách (宿題 S8). Spec đúng",
    "コードは入力欄の下の文言と、トースト「入力内容を確認してください（赤枠の項目）」を出す（宿題 S17）。項目の下の文言だけが正":
        "Code hiện câu dưới ô nhập và toast 「入力内容を確認してください（赤枠の項目）」 (宿題 S17). Spec đúng: chỉ câu dưới mục",
    "コードのタイトルは「編集内容を破棄しますか？」で Q02 の文言と少し違う。ブラウザを閉じる／再読み込みはブラウザの標準の確認":
        "Tiêu đề trong code là 「編集内容を破棄しますか？」, hơi khác câu của Q02. Đóng trình duyệt / tải lại dùng xác nhận chuẩn của trình duyệt",
    "パンくず・画面名・操作ボタン（CSV取込・CSV出力）。新規登録・削除のボタンは置かない（運営A Q1）。":
        "Breadcrumb, tên màn hình, nút thao tác (Nhập CSV, Xuất CSV). Không đặt nút đăng ký mới và xóa (vận hành A Q1).",
    "「法人・契約管理 / 拠点」。":
        "「法人・契約管理 / 拠点」.",
    "「拠点一覧」":
        "Tiêu đề: 「拠点一覧」",
    "検索条件のとおりの全件を出す。列＝詳細の全項目＋所属法人ID・所属法人名・登録日時。閲覧できる役割すべてに出す。":
        "Xuất toàn bộ kết quả theo điều kiện tìm kiếm. Cột = tất cả mục ở chi tiết + ID pháp nhân trực thuộc + tên pháp nhân trực thuộc + ngày giờ đăng ký. Hiển thị cho mọi vai trò xem được.",
    "条件は「検索」か Enter で反映する。「未適用」の印は出さない。":
        "Điều kiện được áp dụng khi bấm 「検索」 hoặc Enter. Không hiện dấu 「未適用」.",
    "拠点ID・拠点名・親契約番号のどれかに含まれる行を出す。":
        "Hiện các dòng có ID chi nhánh, tên chi nhánh hoặc số hợp đồng cha chứa từ khóa.",
    "郵便番号・電話番号・住所（市区町村以降）・旧ES ユーザーID のどれかに含まれる行を出す。":
        "Hiện các dòng có mã bưu điện, số điện thoại, địa chỉ (từ quận/huyện trở đi) hoặc ID người dùng ES cũ chứa từ khóa.",
    "一覧の拠点が属する法人から選択肢を作る。":
        "Lựa chọn lấy từ các pháp nhân mà chi nhánh trong danh sách trực thuộc.",
    "取消（仮登録のあとの却下・取り下げ）も選択肢に足す（台帳 B）。":
        "Thêm cả 「取消」 (bị từ chối / rút lại sau khi đăng ký tạm) vào lựa chọn (sổ cái B).",
    "運営A Q8：コードの追加条件を採る（契約_02 の条件に足す）。":
        "Vận hành A Q8: lấy điều kiện bổ sung trong code (thêm vào điều kiện của 契約_02).",
    "運営A Q8：コードの追加条件を採る。":
        "Vận hành A Q8: lấy điều kiện bổ sung trong code.",
    "条件をすべて初期値に戻し、1ページ目から表示し直す。":
        "Đưa tất cả điều kiện về giá trị ban đầu và hiển thị lại từ trang đầu.",
    "条件を反映して1ページ目から表示する。Enter でも同じ。":
        "Áp dụng điều kiện và hiển thị từ trang đầu. Enter cũng như vậy.",
    "初期の並び：登録日時の新しい順。1ページ10件（10／20／50）。":
        "Thứ tự ban đầu: ngày giờ đăng ký mới nhất trước. 10 dòng/trang (10 / 20 / 50).",
    "クリックで詳細（AW_BRCH_002）へ。":
        "Bấm để sang chi tiết (AW_BRCH_002).",
    "法人なしの拠点は「（法人なし）」。":
        "Chi nhánh không có pháp nhân hiển thị 「（法人なし）」.",
    "バッジ（共通部品）。":
        "Badge (component chung).",
    "本導入／お試しキャンペーン。":
        "Triển khai chính thức / chiến dịch dùng thử.",
    "プランID＋プラン名。":
        "ID plan + tên plan.",
    "詳細の「当初契約開始年月」（AW_BRCH_003 の 5.5）の値。":
        "Giá trị của 「当初契約開始年月」 ở chi tiết (mục 5.5 của AW_BRCH_003).",
    "当初契約開始年月から今月までを「n年mヶ月」で出す。休止の期間は含めない（休止中は数えるのを止める・台帳 F）。プラン変更・移行でリセットしない。":
        "Hiển thị từ tháng bắt đầu hợp đồng ban đầu đến tháng này theo dạng 「n năm m tháng」. Không tính thời gian tạm dừng (dừng đếm khi đang tạm dừng, sổ cái F). Không reset khi đổi / chuyển plan.",
    "法人／この拠点。":
        "Pháp nhân / chi nhánh này.",
    "都道府県・市区町村・町名。":
        "Tỉnh/thành, quận/huyện, phường.",
    "編集（鉛筆）。仮登録の行は「申請で編集」。権限のない役割には出さない。":
        "Chỉnh sửa (biểu tượng bút chì). Dòng đăng ký tạm hiển thị 「申請で編集」. Không hiện với vai trò không có quyền.",
    "編集（AW_BRCH_003）へ。拠点ステータスが仮登録の行は出さない（「申請で編集」を出す）。":
        "Sang chỉnh sửa (AW_BRCH_003). Không hiện ở dòng có trạng thái chi nhánh = đăng ký tạm (hiện 「申請で編集」).",
    "一覧の全列を昇順・降順で並べ替えられる（P-LIST・台帳 K）。":
        "Có thể sắp xếp tăng dần / giảm dần theo tất cả các cột của danh sách (P-LIST, sổ cái K).",
    "「n件中 a–b件」。0件は「0件」。":
        "「n mục trong tổng số, a–b」. Nếu 0 thì hiện 「0 mục」.",
    "今のページは塗りつぶし。":
        "Trang hiện tại được tô đậm.",
    "変えると1ページ目に戻る。":
        "Khi đổi sẽ quay về trang đầu.",
    "条件に合う拠点だけを1ページ目から出す。件数の表示も絞り込み後の件数になる。":
        "Chỉ hiện các chi nhánh khớp điều kiện từ trang đầu. Số lượng hiển thị cũng là số lượng sau khi lọc.",
    "一覧の中に I01 を1行で出す。":
        "Hiện I01 trong 1 dòng của danh sách.",
    "申込（代理入力）から作られた仮登録の拠点。本登録（確定）するまで、この一覧・詳細・編集では直せない。":
        "Chi nhánh đăng ký tạm được tạo từ đơn đăng ký (nhập hộ). Cho đến khi đăng ký chính thức (xác nhận) thì không sửa được ở danh sách / chi tiết / chỉnh sửa này.",
    "押すと契約申請管理の申請詳細（詳細情報設定）を開く。鉛筆（編集）は出さない。":
        "Bấm sẽ mở chi tiết đơn ở 契約申請管理 (thiết lập thông tin chi tiết). Không hiện biểu tượng bút chì (chỉnh sửa).",
    "色は共通部品（status.ts）：黄。契約_02 の青は古い（運営A Q8）。":
        "Màu theo component chung (status.ts): vàng. Màu xanh dương ở 契約_02 là cũ (vận hành A Q8).",
    "所属法人が「（法人なし）」の拠点。請求先は「この拠点」で変更できない。":
        "Chi nhánh có pháp nhân trực thuộc là 「（法人なし）」. Không đổi được bên nhận hóa đơn khỏi 「この拠点」.",
    "CSV取込・編集（鉛筆）・アカウントの操作を出さない。CSV出力は出す。":
        "Không hiện nhập CSV, chỉnh sửa (bút chì) và thao tác tài khoản. Xuất CSV vẫn hiện.",
    "閲覧できる役割すべてに出す。":
        "Hiển thị cho mọi vai trò xem được.",
    "鉛筆を出さない（権限がない）。":
        "Không hiện biểu tượng bút chì (không có quyền).",
    "「法人・契約管理 / 拠点一覧 / 拠点詳細」。拠点一覧のリンクは一覧へ戻る（編集中なら Q02）。":
        "「法人・契約管理 / 拠点一覧 / 拠点詳細」. Liên kết 拠点一覧 quay về danh sách (nếu đang chỉnh sửa thì hiện Q02).",
    "「拠点詳細」＋拠点ID。":
        "「拠点詳細」 + ID chi nhánh.",
    "編集（AW_BRCH_003）へ。削除のボタンは置かない（運営A Q1）。":
        "Sang chỉnh sửa (AW_BRCH_003). Không đặt nút xóa (vận hành A Q1).",
    "保存済みの値から作る。編集画面では、直した値をそのまま出す。":
        "Tạo từ giá trị đã lưu. Ở màn hình chỉnh sửa, hiển thị nguyên giá trị đang sửa.",
    "法人ID＋法人名。法人なしは「（法人なし）」。":
        "ID pháp nhân + tên pháp nhân. Không có pháp nhân thì 「（法人なし）」.",
    "今のサイクル月の子契約の合計。右寄せ。":
        "Tổng các hợp đồng con của tháng chu kỳ hiện tại. Căn phải.",
    "基本情報／契約／設備・オプション／請求／資料・履歴。タブは URL（?tab=）に持つ。入力中にタブを変えても入力は消えない。":
        "Thông tin cơ bản / Hợp đồng / Thiết bị / Option / Thanh toán / Tài liệu / Lịch sử. Tab được giữ trong URL (?tab=). Đổi tab khi đang nhập thì giá trị đã nhập không mất.",
    "項目名・値・説明を絞り込む。「/」で入力欄へ。タブの下に、カードごとの項目数つきの目次を出す。":
        "Lọc theo tên mục, giá trị, mô tả. Phím 「/」 đưa con trỏ vào ô nhập. Dưới tab hiện mục lục có số mục của từng thẻ.",
    "そのタブのカードをすべて閉じる／開く。ボタンの名前が入れ替わる。":
        "Đóng / mở tất cả các thẻ của tab đó. Tên nút đổi qua lại.",
    "ON にすると、入力できない項目を隠す。":
        "Khi bật ON sẽ ẩn các mục không nhập được.",
    "拠点の基本情報。項目の決まりは AW_BRCH_003 の 5 を参照（ここは表示だけ）。":
        "Thông tin cơ bản của chi nhánh. Quy tắc từng mục xem mục 5 của AW_BRCH_003 (ở đây chỉ hiển thị).",
    "システムが採番する。CU＋連番（例：CU00643）で、桁は固定しない。QR運用はこの拠点IDから作る。入力できない。":
        "Hệ thống tự cấp số. CU + số thứ tự (ví dụ: CU00643), số chữ số không cố định. Vận hành QR được tạo từ ID chi nhánh này. Không nhập được.",
    "フェーズ1（旧ESステーション）のユーザーID（例：ES000001）。移行で取り込み、画面では参照だけ。経理の金額照合に使う。":
        "ID người dùng của giai đoạn 1 (ES Station cũ) (ví dụ: ES000001). Nhập qua chuyển đổi dữ liệu, trên màn hình chỉ xem. Dùng để đối chiếu số tiền kế toán.",
    "請求書・配送に使う拠点の住所。項目の決まりは AW_BRCH_003 の 6 を参照（ここは表示だけ）。":
        "Địa chỉ của chi nhánh dùng cho hóa đơn / giao hàng. Quy tắc từng mục xem mục 6 của AW_BRCH_003 (ở đây chỉ hiển thị).",
    "郵便番号の横に置く。押すと都道府県・市区町村・町名・番地を自動で入れる（建物等は入れない）。取得できないときは W100 を出して手入力のまま。入れたあとも各項目は直せる。":
        "Đặt cạnh mã bưu điện. Bấm sẽ tự điền tỉnh/thành, quận/huyện, phường, số nhà (không điền tòa nhà, v.v.). Nếu không lấy được thì hiện W100 và giữ nguyên để nhập tay. Sau khi điền vẫn sửa được từng mục.",
    "拠点の担当者（メイン担当者・請求担当者・サブ担当者）。メイン1名・請求1名は必須。":
        "Người phụ trách của chi nhánh (người phụ trách chính, thanh toán, phụ). Bắt buộc 1 người chính và 1 người thanh toán.",
    "メイン1名・請求1名は必須。保存のときに足りなければ E103、2名以上なら E108（ページ内）。メイン・請求担当者の変更は通知する（将来日付の予約はしない）。":
        "Bắt buộc 1 người chính và 1 người thanh toán. Khi lưu nếu thiếu thì hiện E103 (trong trang). Thay đổi người phụ trách chính / thanh toán sẽ được thông báo (không đặt lịch cho ngày tương lai).",
    "全角カタカナ。":
        "Katakana toàn góc.",
    "請求担当者のメールアドレスが請求書の宛先・通知先になる。":
        "Địa chỉ email của người phụ trách thanh toán là nơi nhận hóa đơn / thông báo.",
    "拠点アカウントの状態と操作。操作は拠点の編集の権限がある役割だけに出す（運営A Q9）。":
        "Trạng thái và thao tác của tài khoản chi nhánh. Chỉ hiện thao tác với vai trò có quyền chỉnh sửa chi nhánh (vận hành A Q9).",
    "受付・仮登録で発行する。拠点ごとに1つ（拠点アカウント）で、その拠点の担当者で共有する。有効・停止は契約の状態から決めず、アカウント自身が持つ。":
        "Cấp khi tiếp nhận / đăng ký tạm. Mỗi chi nhánh có 1 tài khoản (tài khoản chi nhánh), các người phụ trách của chi nhánh dùng chung. Hiệu lực / dừng không quyết định theo trạng thái hợp đồng mà do chính tài khoản giữ.",
    "日時 yyyy-mm-dd HH:MM。ログインしたことがなければ「—」。":
        "Ngày giờ yyyy-mm-dd HH:MM. Nếu chưa từng đăng nhập thì hiện 「—」.",
    "有効／停止中。参照だけ（運営A Q9）。":
        "Hiệu lực / đang tạm dừng. Chỉ xem (vận hành A Q9).",
    "押すと Q100。「送る」で、メイン担当者にパスワード再設定の案内（認証コード・有効期限5分）をメールで送り、S100 を出す。":
        "Bấm sẽ hiện Q100. Bấm 「送る」 sẽ gửi email hướng dẫn đặt lại mật khẩu (mã xác thực, hiệu lực 5 phút) cho người phụ trách chính và hiện S100.",
    "停止中でなければ「アカウントの停止」（Q106 → S102）、停止中なら「アカウントの再開」（Q107 → S103）。停止の理由と日時は変更履歴に残る。":
        "Nếu chưa tạm dừng thì hiện 「アカウントの停止」 (Q106 → S102), nếu đang tạm dừng thì hiện 「アカウントの再開」 (Q107 → S103). Lý do và ngày giờ tạm dừng được lưu trong lịch sử thay đổi.",
    "拠点の親契約。項目の決まりは AW_BRCH_003 の 9 を参照（ここは表示だけ）。保存の権限は契約管理（運営A Q3）。":
        "Hợp đồng cha của chi nhánh. Quy tắc từng mục xem mục 9 của AW_BRCH_003 (ở đây chỉ hiển thị). Quyền lưu thuộc quản lý hợp đồng (vận hành A Q3).",
    "運営だけ。お試しキャンペーンの契約のとき、延長する月数（上限なし）を選んで延長する。押すとダイアログ（状態 017）。契約種別がお試しキャンペーンでないときは非活性にして理由 I109（取消の拠点は I107）をボタンの横に出す。延長できないとき（親契約がない・状態など）は E111・E112。":
        "Chỉ vận hành. Với hợp đồng chiến dịch dùng thử, chọn số tháng gia hạn (không giới hạn trên) rồi gia hạn. Bấm sẽ hiện hộp thoại (trạng thái 017). Khi không gia hạn được (chưa có hợp đồng cha, không phải dùng thử, trạng thái không phù hợp, v.v.) thì hiện E111 / E112.",
    "CP＋連番（最小6桁）。契約変更・休止・再開をしても変わらない。入力できない。":
        "CP + số thứ tự (tối thiểu 6 chữ số). Không đổi khi thay đổi / tạm dừng / mở lại hợp đồng. Không nhập được.",
    "開始サイクル月を「yyyy年m月」で出す。内部の契約開始日は開始サイクル月の初日を自動で入れる。入力できない。":
        "Hiển thị tháng chu kỳ bắt đầu theo dạng 「yyyy年m月」. Ngày bắt đầu hợp đồng nội bộ tự động là ngày đầu của tháng chu kỳ bắt đầu. Không nhập được.",
    "この拠点の子契約（サイクル月ごと）。新しい月が上。休止期間は帯の行を1行はさむ。":
        "Các hợp đồng con của chi nhánh này (theo tháng chu kỳ). Tháng mới ở trên. Thời gian tạm dừng chèn 1 dòng dải.",
    "一覧の上のボタン1つ。押すとダイアログ（状態 018）を開く。使うのは、本導入で数ヶ月先のプラン変更に備えるときと、お試しキャンペーンを複数月にするときだけ。年一括の前払いは12サイクル分を自動で作るので使わない。":
        "1 nút phía trên danh sách. Bấm sẽ mở hộp thoại (trạng thái 018). Chỉ dùng khi chuẩn bị đổi plan sau vài tháng ở hợp đồng triển khai chính thức, hoặc khi làm chiến dịch dùng thử nhiều tháng. Thanh toán trả trước theo năm sẽ tự tạo 12 chu kỳ nên không dùng.",
    "yyyy-mm。新しい月が上。":
        "yyyy-mm. Tháng mới ở trên.",
    "CP0000001-202703 の形。クリックで子契約の詳細（AW_CONT）を開く（編集中なら Q02）。取消の子契約は灰色で出し、詳細は取消の帯（I15）つきの参照のみで開く。":
        "Dạng CP0000001-202703. Bấm để mở chi tiết hợp đồng con (AW_CONT) (nếu đang chỉnh sửa thì hiện Q02).",
    "親契約の状態を表示する。":
        "Hiển thị trạng thái của hợp đồng cha.",
    "COOL便／ES配送便。":
        "Chuyến COOL / chuyến giao hàng ES.",
    "サイクル月＋請求書発行リードタイム。「前払い」の語は出さない（台帳 B）。":
        "Tháng chu kỳ + thời gian chuẩn bị phát hành hóa đơn. Không dùng từ 「前払い」 (trả trước) (sổ cái B).",
    "子契約の合計。右寄せ。":
        "Tổng của hợp đồng con. Căn phải.",
    "運営は5段階（生成済・未集計／①②確定／拠点確定／法人確定／請求済）。前払い・後払いの別は出さない（台帳 B）。値の並びは子契約一覧の設計（運営A Q-C3）に合わせる。":
        "Vận hành có 5 mức (đã tạo, chưa tổng hợp / xác định ①② / xác định chi nhánh / xác định pháp nhân / đã thanh toán). Không phân biệt trả trước / trả sau (sổ cái B). Thứ tự giá trị theo thiết kế danh sách hợp đồng con (vận hành A Q-C3).",
    "日次バッチ／手動生成／年一括。手で作った行は「手動生成」の印で見分ける。法人Web には出さない。":
        "Batch hằng ngày / tạo thủ công / tạo cả năm. Dòng tạo thủ công nhận biết bằng dấu 「手動生成」. Không hiện trên Web pháp nhân.",
    "休止中のサイクル月は子契約がないため、一覧のサイクル月の並びの位置に帯の行を1行はさむ。状態（休止予定／休止中／再開済）・休止期間（開始〜終了のサイクル月とサイクル数）・再開予定のサイクル月・休止理由・休止中の設備（引き揚げる／置いたまま）を出す。拠点が休止中・休止予定のときだけ出す。":
        "Tháng chu kỳ đang tạm dừng không có hợp đồng con nên chèn 1 dòng dải vào vị trí tháng chu kỳ trong danh sách. Hiển thị trạng thái (dự kiến tạm dừng / đang tạm dừng / đã mở lại), thời gian tạm dừng (tháng chu kỳ từ đầu đến cuối và số chu kỳ), tháng chu kỳ dự kiến mở lại, lý do tạm dừng, thiết bị trong thời gian tạm dừng (thu hồi / để nguyên). Chỉ hiện khi chi nhánh đang tạm dừng hoặc dự kiến tạm dừng.",
    "拠点に貸している設備。見るだけ（貸出・追加・回収は子契約の「設備の異動」で登録する）。":
        "Các thiết bị đang cho chi nhánh mượn. Chỉ xem (cho mượn / thêm / thu hồi được đăng ký ở 「設備の異動」 của hợp đồng con).",
    "返却予定日が今日より前で未返却数が0より多い貸出を日次バッチで見つけた件数。運営の一覧に出る。":
        "Số lượng các lần cho mượn có ngày dự kiến trả trước hôm nay và số lượng chưa trả lớn hơn 0, do batch hằng ngày phát hiện. Hiện ở danh sách của vận hành.",
    "表の上のドロップダウンで絞り込む。既定は回収済の行を隠し、いま貸しているものだけを見せる。":
        "Lọc bằng dropdown phía trên bảng. Mặc định ẩn các dòng đã thu hồi, chỉ hiện những gì đang cho mượn.",
    "配送中・貸出中・回収依頼中の未返却数の合計。いま何台預けているか。":
        "Tổng số lượng chưa trả của trạng thái đang giao / đang cho mượn / đang yêu cầu thu hồi. Hiện đang gửi bao nhiêu máy.",
    "返却予定日を過ぎても返ってきていない数の合計。":
        "Tổng số lượng chưa được trả dù đã quá ngày dự kiến trả.",
    "LN-0001 の形。この一覧は見るだけ。貸出・追加・回収の登録は子契約の「設備の異動」で行い、結果がここに出る。":
        "Dạng LN-0001. Danh sách này chỉ xem. Đăng ký cho mượn / thêm / thu hồi thực hiện ở 「設備の異動」 của hợp đồng con, kết quả hiện ở đây.",
    "冷蔵庫／冷凍庫／自販機／電子レンジ／ホットウォーマー／資材ボックス。":
        "Tủ lạnh / tủ đông / máy bán hàng tự động / lò vi sóng / máy giữ nóng / hộp vật tư.",
    "機種IDと機種名（RF／FZ／VM／MW／HW／BX＋6桁）。":
        "ID model và tên model (RF / FZ / VM / MW / HW / BX + 6 chữ số).",
    "資産番号・シリアル。空欄でもよい。":
        "Số tài sản, số serial. Có thể để trống.",
    "貸した数。資材ボックスのように員数で管理するものは2以上になる。":
        "Số lượng đã cho mượn. Với thứ quản lý theo số lượng như hộp vật tư thì có thể từ 2 trở lên.",
    "貸出数 − 返却済数。0になるまで貸出は終わらない。":
        "Số lượng cho mượn − số lượng đã trả. Cho đến khi về 0 thì việc cho mượn chưa kết thúc.",
    "設置した日。ここから機種ごとの最低利用期間を数える。移行データでは空欄のことがあり、「貸出日 未入力」と出す。":
        "Ngày lắp đặt. Từ đây tính thời gian sử dụng tối thiểu của từng model. Dữ liệu chuyển đổi có thể để trống, khi đó hiện 「貸出日 未入力」.",
    "解約・休止（引き揚げる）の承認などで自動で立てる。":
        "Tự động đặt khi phê duyệt hủy / tạm dừng (thu hồi), v.v.",
    "実際に返ってきた日。":
        "Ngày thực tế thiết bị được trả về.",
    "配送中／貸出中／回収依頼中／回収済／未返却。回収済は既定で隠す。":
        "Đang giao / đang cho mượn / đang yêu cầu thu hồi / đã thu hồi / chưa trả. Mặc định ẩn đã thu hồi.",
    "解約／休止／機種変更／故障交換。":
        "Hủy / tạm dừng / đổi model / thay do hỏng.",
    "貸出日＋機種マスタの最低利用期間−1日。休止中はカウントを止める。":
        "Ngày cho mượn + thời gian sử dụng tối thiểu trong master model − 1 ngày. Tạm dừng thì dừng đếm.",
    "発生する／発生しない。この設備の満了日で判定する。":
        "Phát sinh / không phát sinh. Xác định theo ngày hết hạn của thiết bị này.",
    "設置位置・搬入の注意など。":
        "Vị trí lắp đặt, lưu ý khi vận chuyển vào, v.v.",
    "どの子契約の異動で最後に動いたか。":
        "Lần cuối cùng thay đổi do biến động của hợp đồng con nào.",
    "今のサイクル月の子契約が持つオプション・値引きの表。ここでは変更しない。":
        "Bảng option và giảm giá mà hợp đồng con của tháng chu kỳ hiện tại đang có. Không thay đổi ở đây.",
    "今のサイクル月の子契約の詳細の「設備・オプション」タブを開く（編集中なら Q02）。オプション・割引の追加・変更・終了はそこで登録する。子契約がまだないときは E112。":
        "Mở tab 「設備・オプション」 trong chi tiết hợp đồng con của tháng chu kỳ hiện tại (nếu đang chỉnh sửa thì hiện Q02). Thêm / đổi / kết thúc option, giảm giá được đăng ký ở đó. Nếu chưa có hợp đồng con thì hiện E112.",
    "今のサイクル月の子契約。":
        "Hợp đồng con của tháng chu kỳ hiện tại.",
    "オプション／値引き。":
        "Option / giảm giá.",
    "オプションマスタ・値引きマスタのコードと名称。":
        "Mã và tên trong master option và master giảm giá.",
    "請求は＋、値引きは−。率のときは％。右寄せ。":
        "Tính phí là +, giảm giá là −. Nếu là tỷ lệ thì dùng %. Căn phải.",
    "このサイクル月から。":
        "Từ tháng chu kỳ này.",
    "空欄＝続く。":
        "Để trống = tiếp tục.",
    "拠点の請求先と請求条件。項目の決まりは AW_BRCH_003 の 13 を参照（ここは表示だけ）。請求先＝法人のとき、支払方法・支払サイクル・入金期限・Bill One 発行先ID・リードタイムの上書きは「—」で非活性。":
        "Bên nhận hóa đơn và điều kiện thanh toán của chi nhánh. Quy tắc từng mục xem mục 13 của AW_BRCH_003 (ở đây chỉ hiển thị). Khi bên nhận hóa đơn = pháp nhân thì phương thức thanh toán, chu kỳ thanh toán, hạn thanh toán, ID nơi phát hành Bill One, ghi đè thời gian chuẩn bị đều là 「—」 và bị vô hiệu.",
    "この拠点あての請求書。まとめて発行のときは、この拠点の分だけを出す。":
        "Hóa đơn gửi đến chi nhánh này. Khi phát hành gộp thì chỉ hiện phần của chi nhánh này.",
    "請求書番号を押すと、押した請求書の詳細（運営E）を開く。拠点の画面から開いたときは、その拠点の分だけを出す。":
        "Bấm số hóa đơn sẽ mở chi tiết hóa đơn (Vận hành E) vừa bấm. Khi mở từ màn hình chi nhánh thì chỉ hiện phần của chi nhánh đó.",
    "法人でまとめて発行しているときは、同じ請求書番号が他の拠点にも出る。":
        "Khi pháp nhân phát hành gộp, cùng một số hóa đơn cũng hiện ở các chi nhánh khác.",
    "前月25日に確定 → 請求月の1日に Bill One で発行する。":
        "Chốt vào ngày 25 tháng trước → phát hành bằng Bill One vào ngày 1 của tháng thanh toán.",
    "この請求書の請求月（その月の1日に発行）。":
        "Tháng thanh toán của hóa đơn này (phát hành vào ngày 1 của tháng đó).",
    "この拠点の固定額の分（税抜）。右寄せ。":
        "Phần số tiền cố định của chi nhánh này (chưa gồm thuế). Căn phải.",
    "固定額の分の契約・サイクル月。":
        "Hợp đồng / tháng chu kỳ của phần số tiền cố định.",
    "この拠点の実績精算の分（税抜）。右寄せ。":
        "Phần quyết toán thực tế của chi nhánh này (chưa gồm thuế). Căn phải.",
    "実績精算の分の対象期間。":
        "Khoảng thời gian áp dụng của phần quyết toán thực tế.",
    "この拠点の分の消費税（税率ごと）。":
        "Thuế tiêu dùng của phần chi nhánh này (theo từng thuế suất).",
    "固定額＋実績精算＋消費税。まとめて発行のときは、請求書全体ではなくこの拠点の分だけを出す。":
        "Số tiền cố định + quyết toán thực tế + thuế tiêu dùng. Khi phát hành gộp, chỉ hiện phần của chi nhánh này chứ không phải toàn hóa đơn.",
    "この請求書の支払期限。1枚に1つ。":
        "Hạn thanh toán của hóa đơn này. Mỗi hóa đơn có một hạn.",
    "状態名は運営E の請求書一覧と同じ名前にする（運営A Q7）。未確定／確定／請求済（「入金済・未入金」は出さない。台帳 E 法人Web と揃える・台帳 F）。":
        "Tên trạng thái dùng giống danh sách hóa đơn của Vận hành E (vận hành A Q7). Chưa xác định / đã xác định / đã yêu cầu thanh toán; không hiện 「入金済・未入金」 (khớp Web pháp nhân, sổ cái E và F).",
    "請求先＝この拠点のとき、リードタイムの上書き・支払方法・支払サイクル・入金期限・Bill One 発行先ID が活性になり値が入る。年払いのときだけ起算月、口座振替のときだけ手続きステータスが活性。":
        "Khi bên nhận hóa đơn = chi nhánh này, các mục ghi đè thời gian chuẩn bị, phương thức thanh toán, chu kỳ thanh toán, hạn thanh toán, ID nơi phát hành Bill One được kích hoạt và có giá trị. Tháng tính chỉ kích hoạt khi trả theo năm, trạng thái thủ tục chỉ kích hoạt khi chuyển khoản tự động.",
    "法人・拠点に公開する資料。表示・ダウンロードだけ。":
        "Tài liệu công khai cho pháp nhân / chi nhánh. Chỉ xem / tải xuống.",
    "表示・ダウンロード（DL）だけ。アップロード・削除は編集（AW_BRCH_003 の 15.1）。":
        "Chỉ xem / tải xuống (DL). Tải lên / xóa ở màn hình chỉnh sửa (AW_BRCH_003 mục 15.1).",
    "表示・ダウンロード（DL）だけ。アップロード・削除は編集（AW_BRCH_003 の 15.2）。":
        "Chỉ xem / tải xuống (DL). Tải lên / xóa ở màn hình chỉnh sửa (AW_BRCH_003 mục 15.2).",
    "ファイル名／形式／容量／登録日。表示・ダウンロードだけ。":
        "Tên tệp / định dạng / dung lượng / ngày đăng ký. Chỉ xem / tải xuống.",
    "社内だけの資料。法人には出さない。":
        "Tài liệu chỉ nội bộ. Không hiện cho pháp nhân.",
    "表示・ダウンロード（DL）だけ。アップロード・削除は編集（AW_BRCH_003 の 16.1）。":
        "Chỉ xem / tải xuống (DL). Tải lên / xóa ở màn hình chỉnh sửa (AW_BRCH_003 mục 16.1).",
    "表示・ダウンロード（DL）だけ。アップロード・削除は編集（AW_BRCH_003 の 16.2）。":
        "Chỉ xem / tải xuống (DL). Tải lên / xóa ở màn hình chỉnh sửa (AW_BRCH_003 mục 16.2).",
    "法人Web から出された変更申請の履歴。拠点ごとに承認状態を持つ。":
        "Lịch sử các yêu cầu thay đổi gửi từ Web pháp nhân. Trạng thái phê duyệt được giữ theo từng chi nhánh.",
    "CH-yyyymmdd-nnnn（変更申請）／AP-…（新規申込）。":
        "CH-yyyymmdd-nnnn (yêu cầu thay đổi) / AP-… (đăng ký mới).",
    "プランの変更／配送の変更／設備の変更／拠点情報の変更／法人情報の変更／休止／再開／解約。":
        "Đổi plan / đổi giao hàng / đổi thiết bị / đổi thông tin chi nhánh / đổi thông tin pháp nhân / tạm dừng / mở lại / hủy hợp đồng.",
    "法人Webで送信した日時。":
        "Ngày giờ gửi trên Web pháp nhân.",
    "「氏名（法人アカウント／拠点アカウント）」の形。":
        "Dạng 「họ tên (tài khoản pháp nhân / tài khoản chi nhánh)」.",
    "オーダー締切のルールで決まる。":
        "Được quyết định theo quy tắc hạn chốt đặt hàng.",
    "変更前・変更後の要約。":
        "Tóm tắt trước và sau khi đổi.",
    "承認待ち／承認済／却下／取り下げ済み。拠点ごとに持つ。":
        "Chờ phê duyệt / đã phê duyệt / từ chối / đã rút lại. Được giữ theo từng chi nhánh.",
    "運営の担当者名が出るため法人Web には出さない。":
        "Hiện tên người phụ trách của vận hành nên không hiện trên Web pháp nhân.",
    "拠点・親契約の変更履歴（表示だけ）。1回の保存で変わった項目は1つの操作としてまとめる。新しいものが上。直せない・消せない。":
        "Lịch sử thay đổi chi nhánh / hợp đồng cha (chỉ hiển thị). Các mục thay đổi trong 1 lần lưu được gộp thành 1 thao tác. Mới nhất ở trên. Không sửa, không xóa được.",
    "日時 yyyy-mm-dd HH:MM。新しいものが上。":
        "Ngày giờ yyyy-mm-dd HH:MM. Mới nhất ở trên.",
    "アカウント名（ID 併記。例：運営 井上（Ad00010））。":
        "Tên tài khoản (kèm ID. Ví dụ: Vận hành Inoue (Ad00010)).",
    "登録／変更／削除／CSV取込／一括変更。":
        "Đăng ký / thay đổi / xóa / nhập CSV / thay đổi hàng loạt.",
    "変わった項目名。":
        "Tên mục đã thay đổi.",
    "あれば。承認が要る変更のときは、承認者・通知もここに入る。":
        "Nếu có. Với thay đổi cần phê duyệt thì người duyệt và thông báo cũng được ghi ở đây.",
    "仮登録中です（申請 AP-… の詳細情報設定中）。仮登録の間は、この画面では編集できない。編集は契約申請管理の申請詳細で行う。拠点を確定（本登録）すると、この画面で編集できる。":
        "Đang đăng ký tạm (đang thiết lập thông tin chi tiết của đơn AP-…). Trong thời gian đăng ký tạm, không sửa được ở màn hình này. Sửa ở chi tiết đơn trong 契約申請管理. Khi chi nhánh được xác nhận (đăng ký chính thức) thì sửa được ở màn hình này.",
    "契約申請管理の申請詳細（詳細情報設定）を開く。「編集」のボタンの代わりに出す。":
        "Mở chi tiết đơn ở 契約申請管理 (thiết lập thông tin chi tiết). Hiện thay cho nút 「編集」.",
    "契約種別＝お試しキャンペーン。お試し期間（月数）が入り、「お試しを延長する」で延長できる（運営だけ）。延長の月はプラン料金を請求する（お試しキャンペーン割引は付けない）。":
        "Loại hợp đồng = chiến dịch dùng thử. Có thời gian dùng thử (số tháng) và gia hạn được bằng 「お試しを延長する」 (chỉ vận hành). Các tháng gia hạn tính phí plan (không áp dụng giảm giá chiến dịch dùng thử).",
    "押すとダイアログ（状態 017）を開く。":
        "Bấm sẽ mở hộp thoại (trạng thái 017).",
    "延長する月数を入れ → 足す子契約を見る → 「n ヶ月延長する」。":
        "Nhập số tháng gia hạn → xem hợp đồng con sẽ thêm → 「n tháng gia hạn」.",
    "お試しの最後の子契約と同じ中身で、次のサイクルから子契約を作る。延長の月はプラン料金を請求する。法人へ通知・メールでお知らせし、法人Web の拠点詳細「お試し期間」に延長が出る。":
        "Tạo hợp đồng con từ chu kỳ tiếp theo với nội dung giống hợp đồng con cuối cùng của thời gian dùng thử. Các tháng gia hạn tính phí plan. Thông báo cho pháp nhân (thông báo và email), việc gia hạn hiện ở 「お試し期間」 trong chi tiết chi nhánh trên Web pháp nhân.",
    "お試し期間の開始〜終了（月数）。延長したことがあれば回数も出す。":
        "Ngày bắt đầu ~ kết thúc của thời gian dùng thử (số tháng). Nếu đã từng gia hạn thì hiện cả số lần.",
    "上限は当面なし（台帳 M-3）。長くなるときは本導入への切替を案内する。":
        "Hiện chưa có giới hạn trên (sổ cái M-3). Nếu kéo dài thì hướng dẫn chuyển sang triển khai chính thức.",
    "延長の履歴に残る社内メモ。法人には出さない。":
        "Ghi chú nội bộ lưu trong lịch sử gia hạn. Không hiện cho pháp nhân.",
    "延長で作る子契約（子契約ID・サイクル月・種別・ご請求）。ご請求は「プラン料金」（割引なし）。":
        "Các hợp đồng con được tạo do gia hạn (ID hợp đồng con, tháng chu kỳ, loại, số tiền yêu cầu). Số tiền yêu cầu là 「プラン料金」 (không giảm giá).",
    "閉じる。何も変えない。":
        "Đóng. Không thay đổi gì.",
    "子契約を足してお試し期間を延ばし、S106 を出す。履歴に残り、法人へお知らせする。":
        "Thêm hợp đồng con và kéo dài thời gian dùng thử, hiện S106. Lưu vào lịch sử và thông báo cho pháp nhân.",
    "月を選ぶ → 作られる子契約を見る → 「n件作成」。":
        "Chọn tháng → xem các hợp đồng con sẽ được tạo → 「Tạo n hợp đồng」.",
    "ふだんは日次バッチが次のサイクルを自動で作る。手で作るのは、先のプラン変更に備えるときと、お試しキャンペーンを複数月にするときだけ。":
        "Thông thường batch hằng ngày tự tạo chu kỳ tiếp theo. Chỉ tạo thủ công khi chuẩn bị đổi plan sau này, hoặc khi làm chiến dịch dùng thử nhiều tháng.",
    "作成済みの最後のサイクル月と件数。":
        "Tháng chu kỳ cuối cùng đã tạo và số lượng.",
    "選べるのは作成済みの翌月から今月の12ヶ月先まで。休止期間のサイクル月は作らない。":
        "Chọn được từ tháng sau tháng đã tạo đến 12 tháng kể từ tháng này. Không tạo tháng chu kỳ trong thời gian tạm dừng.",
    "子契約ID・サイクル月・プラン・配送区分と納品回数・請求月・生成基準日。最新の子契約と同じプラン・配送で作る。すでにある月は作り直さない。":
        "ID hợp đồng con, tháng chu kỳ, plan, loại giao hàng và số lần giao hàng, tháng thanh toán, ngày chuẩn tạo. Tạo với plan và giao hàng giống hợp đồng con mới nhất. Tháng đã có thì không tạo lại.",
    "作る月がないときは「作れる月がありません（上限 … まで作成済み）」（E110）で非活性。作ったら S105 を出し（この時点で保存される・提案）、一覧に「手動生成」の印つきで入る。変更履歴に誰がいつ作ったかを残す。":
        "Khi không có tháng để tạo thì hiện 「作れる月がありません（上限 … まで作成済み）」 (E110) và nút bị vô hiệu. Khi tạo xong thì hiện S105 (được lưu ngay ở thời điểm này; đề xuất) và hợp đồng con vào danh sách kèm dấu 「手動生成」. Lịch sử thay đổi ghi lại ai tạo và khi nào.",
    "Q100（拠点アカウント）。本文に拠点ID・メイン担当者の氏名を入れる。":
        "Q100 (tài khoản chi nhánh). Nội dung có ID chi nhánh và họ tên người phụ trách chính.",
    "閉じる。何もしない。":
        "Đóng. Không làm gì.",
    "メイン担当者にメールで案内を送り、S100 のトースト。変更履歴には残さない。":
        "Gửi email hướng dẫn cho người phụ trách chính và hiện toast S100. Không lưu vào lịch sử thay đổi.",
    "所属法人は「（法人なし）」。請求先は「この拠点」で変更できない（編集の画面でも）。":
        "Pháp nhân trực thuộc là 「（法人なし）」. Không đổi được bên nhận hóa đơn khỏi 「この拠点」 (cả ở màn hình chỉnh sửa).",
    "閉鎖予定のとき、解約の承認で設定した解約日に「閉鎖」になる。編集は権限のある役割ができる（閉鎖でも編集できる）。":
        "Khi dự kiến đóng, đến ngày hủy đã đặt lúc phê duyệt hủy hợp đồng thì thành 「đã đóng」. Vai trò có quyền chỉnh sửa được (cả khi đã đóng).",
    "閉鎖の拠点。一覧では灰色のバッジ。当月請求額は「—」。履歴・請求書の表は残る（削除しない）。":
        "Chi nhánh đã đóng. Ở danh sách là badge màu xám. Số tiền yêu cầu tháng này là 「—」. Các bảng lịch sử, hóa đơn vẫn còn (không xóa).",
    "ページ内に E100（拠点（CU99999）が見つかりません）。一覧へは画面上のメニューから戻る。":
        "Hiện E100 trong trang (không tìm thấy chi nhánh (CU99999)). Quay về danh sách bằng menu trên màn hình.",
    "「法人・契約管理 / 拠点一覧 / 拠点編集」。":
        "「法人・契約管理 / 拠点一覧 / 拠点編集」.",
    "「拠点編集」＋拠点ID。":
        "「拠点編集」 + ID chi nhánh.",
    "入力を変えていれば Q02（キャンセル／破棄）。詳細から来たときは詳細へ、一覧から来たときは一覧へ戻る。":
        "Nếu đã đổi nội dung nhập thì hiện Q02 (hủy / bỏ). Nếu đến từ chi tiết thì quay về chi tiết, nếu đến từ danh sách thì quay về danh sách.",
    "全タブの全項目をまとめてチェックして保存する。保存できたら S01 を出して詳細へ。ほかの人が先に保存していれば E31。ボタンは押したら無効にする。":
        "Kiểm tra cùng lúc tất cả mục của tất cả tab rồi lưu. Lưu được thì hiện S01 và sang chi tiết. Nếu người khác đã lưu trước thì E31. Nút bị vô hiệu sau khi bấm.",
    "拠点の基本情報。入力チェックは「保存」でまとめて行う。":
        "Thông tin cơ bản của chi nhánh. Kiểm tra nhập liệu được thực hiện cùng lúc khi bấm 「保存」.",
    "拠点の名称。請求書・送り状に印字される。":
        "Tên gọi của chi nhánh. In trên hóa đơn / phiếu giao hàng.",
    "カタカナで統一する。":
        "Thống nhất bằng Katakana.",
    "拠点の従業員数。":
        "Số nhân viên của chi nhánh.",
    "編集で直接直せる（運営A Q3）。「休止中」は選べない（休止は契約申請管理の変更申請から。親契約の利用休止と休止履歴から表示する）。申請の承認でも動く（解約＝承認と同時に閉鎖予定、解約日に閉鎖）。直接直したときは、子契約の取消・アカウント停止・設備回収予定は自動では動かない。":
        "Sửa trực tiếp được ở chỉnh sửa (vận hành A Q3). Không chọn được 「休止中」 (tạm dừng làm từ yêu cầu thay đổi ở 契約申請管理; hiển thị dựa trên tạm ngừng sử dụng của hợp đồng cha và lịch sử tạm dừng). Cũng thay đổi khi phê duyệt yêu cầu (hủy hợp đồng = dự kiến đóng cùng lúc phê duyệt, đóng vào ngày hủy). Khi sửa trực tiếp, việc hủy hợp đồng con, dừng tài khoản, lịch thu hồi thiết bị không tự chạy.",
    "短消費期限なしの拠点は、消費期限の短い商品をデフォルト注文に入れず「短消費期限なし基準注文数」を使う。料金は変わらない。契約（申込）のときに決め、変更は運営だけ。自販機のプランでは使わない。":
        "Chi nhánh không có hạn dùng ngắn sẽ không đưa sản phẩm có hạn dùng ngắn vào đơn đặt hàng mặc định mà dùng 「短消費期限なし基準注文数」. Giá không đổi. Quyết định lúc ký hợp đồng (đăng ký), chỉ vận hành mới đổi được. Không dùng cho plan máy bán hàng tự động.",
    "お客様の要望など。複数行。高さを変えられる。":
        "Yêu cầu của khách, v.v. Nhiều dòng. Kéo giãn được chiều cao.",
    "請求書・配送に使う拠点の住所。":
        "Địa chỉ của chi nhánh dùng cho hóa đơn / giao hàng.",
    "ハイフンあり・なしどちらでも受ける。保存は 123-4567 の形。":
        "Nhận cả khi có hoặc không có dấu gạch ngang. Lưu dạng 123-4567.",
    "47都道府県から選ぶ（自由入力にしない）。住所検索で入った値もこの選択肢に合わせる。":
        "Chọn từ 47 tỉnh/thành (không nhập tự do). Giá trị do tìm địa chỉ điền vào cũng khớp với lựa chọn này.",
    "住所を変えると、以後に作る配送データへ反映する。作成済み・納品済みの配送データは、納品日の住所を持ち続ける（契約・子契約は住所を持たない）。":
        "Khi đổi địa chỉ, sẽ phản ánh vào dữ liệu giao hàng tạo từ sau đó. Dữ liệu giao hàng đã tạo / đã giao giữ địa chỉ của ngày giao (hợp đồng, hợp đồng con không giữ địa chỉ).",
    "拠点の専用の項目（配送備考に混ぜない）。自動販売機を貸し出す拠点は必須、冷蔵庫・冷凍庫だけの拠点は任意。子契約には出さない（運営A Q6）。":
        "Mục riêng của chi nhánh (không trộn vào ghi chú giao hàng). Bắt buộc với chi nhánh cho mượn máy bán hàng tự động, tùy chọn với chi nhánh chỉ có tủ lạnh / tủ đông. Không hiện ở hợp đồng con (vận hành A Q6).",
    "担当者の表。1行1人。行を追加・削除できる。保存のとき、メイン担当者・請求担当者が1名ずつ入っていなければ E103（ページ内メッセージエリア）。":
        "Bảng người phụ trách. Mỗi dòng 1 người. Thêm / xóa dòng được. Khi lưu nếu chưa có đủ 1 người phụ trách chính và 1 người phụ trách thanh toán thì hiện E103 (vùng thông báo trong trang).",
    "空の行を1行足す。":
        "Thêm 1 dòng trống.",
    "その行を消す（ゴミ箱）。メイン担当者・請求担当者の行を消して0名になると、保存のとき E103。":
        "Xóa dòng đó (thùng rác). Nếu xóa dòng người phụ trách chính / thanh toán khiến còn 0 người thì khi lưu hiện E103.",
    "詳細（AW_BRCH_002）の 8 と同じ。操作は拠点の編集の権限がある役割だけに表示する。":
        "Giống mục 8 của chi tiết (AW_BRCH_002). Chỉ hiện thao tác với vai trò có quyền chỉnh sửa chi nhánh.",
    "拠点の親契約。保存は契約管理（contracts）の編集権限。":
        "Hợp đồng cha của chi nhánh. Quyền lưu là quyền chỉnh sửa quản lý hợp đồng (contracts).",
    "お試しキャンペーンは既定1ヶ月で、指定した月数だけ子契約を作る（自動更新しない）。プラン料金はお試しキャンペーン割引（DC000013）で相殺し、実績精算は請求する。お試しから本導入へは同じ親契約のまま切り替える。":
        "Chiến dịch dùng thử mặc định 1 tháng, chỉ tạo hợp đồng con cho số tháng chỉ định (không tự động gia hạn). Phí plan được bù trừ bằng giảm giá chiến dịch dùng thử (DC000013), quyết toán thực tế vẫn tính phí. Từ dùng thử sang triển khai chính thức vẫn giữ cùng hợp đồng cha.",
    "編集で直接直せる（運営A Q3）。契約の状態はここだけが正で、子契約は参照表示。直接直したときの副作用（子契約の取消・設備回収予定）は自動では動かない。親契約の項目の保存は、契約管理（contracts）の編集権限（拠点の編集の権限ではない）。":
        "Sửa trực tiếp được ở chỉnh sửa (vận hành A Q3). Trạng thái hợp đồng chỉ có ở đây là đúng, hợp đồng con chỉ hiển thị tham chiếu. Tác dụng phụ khi sửa trực tiếp (hủy hợp đồng con, lịch thu hồi thiết bị) không tự chạy. Lưu mục của hợp đồng cha cần quyền chỉnh sửa quản lý hợp đồng (contracts), không phải quyền chỉnh sửa chi nhánh.",
    "最初のサイクル月を選ぶ。選べる月はオーダー締切に連動する。子契約・請求・配送はこのサイクル月から始まる。機種変更・追加があっても変えない。":
        "Chọn tháng chu kỳ đầu tiên. Các tháng chọn được liên động với hạn chốt đặt hàng. Hợp đồng con, thanh toán, giao hàng bắt đầu từ tháng chu kỳ này. Không đổi dù có đổi model hay thêm.",
    "解約が確定したときに入る。納品の最後の月を指す。解約・休止を承認すると、適用月以降の未確定の先行子契約を取り消す。編集で直接直せる（運営A Q3）。":
        "Nhập khi việc hủy được xác định. Chỉ tháng giao hàng cuối cùng. Khi phê duyệt hủy / tạm dừng, các hợp đồng con tạo sẵn chưa xác định từ tháng áp dụng trở đi sẽ bị hủy. Sửa trực tiếp được ở chỉnh sửa (vận hành A Q3).",
    "契約種別＝お試しキャンペーンのときだけ入力できる。既定は1ヶ月。顧客は編集できない（運営だけ）。この月数ぶんだけ子契約を作る。":
        "Chỉ nhập được khi loại hợp đồng = chiến dịch dùng thử. Mặc định 1 tháng. Khách hàng không sửa được (chỉ vận hành). Tạo hợp đồng con đúng bằng số tháng này.",
    "紹介は契約単位で発生するため、契約が持つ。法人Web には出さない。":
        "Việc giới thiệu phát sinh theo từng hợp đồng nên hợp đồng giữ thông tin này. Không hiện trên Web pháp nhân.",
    "請求のときに社内で共有する備考。請求画面でも表示・編集できる。法人Web には出さず、請求書にも印字しない。":
        "Ghi chú chia sẻ nội bộ khi thanh toán. Cũng xem / sửa được ở màn hình thanh toán. Không hiện trên Web pháp nhân và không in lên hóa đơn.",
    "詳細と同じ（AW_BRCH_002 の 10）。":
        "Giống chi tiết (mục 10 của AW_BRCH_002).",
    "押すとダイアログ（状態 018）。詳細では非活性で、編集の画面で押せる。":
        "Bấm sẽ hiện hộp thoại (trạng thái 018). Ở chi tiết bị vô hiệu, bấm được ở màn hình chỉnh sửa.",
    "請求先＝この拠点のとき、リードタイムの上書き・支払方法・支払サイクル・入金期限・Bill One 発行先ID が活性になる。年払いのときだけ起算月、口座振替のときだけ手続きステータスが活性。保存しても、法人のときは支払項目を保存しない。":
        "Khi bên nhận hóa đơn = chi nhánh này, các mục ghi đè thời gian chuẩn bị, phương thức thanh toán, chu kỳ thanh toán, hạn thanh toán, ID nơi phát hành Bill One được kích hoạt. Tháng tính chỉ kích hoạt khi trả theo năm, trạng thái thủ tục chỉ kích hoạt khi chuyển khoản tự động. Khi lưu, nếu là pháp nhân thì không lưu các mục thanh toán.",
    "この項目だけが正（法人側には請求先を持たせない）。この値で、下の支払方法・支払サイクル・Bill One 発行先ID・リードタイムの上書きの活性が切り替わる。法人なしの拠点は「この拠点」で変更できない。拠点から変更を申請でき、運営の承認が必須。":
        "Chỉ mục này là đúng (phía pháp nhân không giữ bên nhận hóa đơn). Giá trị này quyết định việc kích hoạt các mục bên dưới: phương thức thanh toán, chu kỳ thanh toán, ID nơi phát hành Bill One, ghi đè thời gian chuẩn bị. Chi nhánh không có pháp nhân là 「この拠点」 và không đổi được. Chi nhánh có thể gửi yêu cầu thay đổi, bắt buộc vận hành phê duyệt.",
    "空欄＝法人の設定に従う。法人なしの拠点は必須。リードタイムを変えて前払いが重なる・抜ける月があるときは W101（モーダル）を出す。":
        "Để trống = theo thiết lập của pháp nhân. Bắt buộc với chi nhánh không có pháp nhân. Nếu đổi thời gian chuẩn bị khiến có tháng trả trước bị trùng / thiếu thì hiện W101 (modal).",
    "運営が支払方法を口座振替に変えたときに使う。完了になるまでは請求書にお振込と印字して振込先を載せる（請求は止めない）。":
        "Dùng khi vận hành đổi phương thức thanh toán sang chuyển khoản tự động. Cho đến khi hoàn tất, hóa đơn in 「お振込」 và ghi tài khoản nhận (không dừng thanh toán).",
    "前払い分も実績精算分も、1枚の請求書に入金期限は1つ。口座振替・クレジットの引き落とし日もこの日付。":
        "Cả phần trả trước và phần quyết toán thực tế đều có 1 hạn thanh toán trên 1 hóa đơn. Ngày trích nợ của chuyển khoản tự động / thẻ tín dụng cũng là ngày này.",
    "詳細と同じ（AW_BRCH_002 の 14）。":
        "Giống chi tiết (mục 14 của AW_BRCH_002).",
    "「保存」で全項目をまとめてチェックし、エラーの項目は赤枠にして項目の下に文言（必須は E01）を出す。最初のエラーの項目がほかのタブにあれば、そのタブを開き、エラーのあるタブの見出しに赤い印を付ける。保存はしない。":
        "Khi bấm 「保存」 sẽ kiểm tra cùng lúc tất cả mục, mục lỗi được viền đỏ và hiện câu dưới mục (bắt buộc là E01). Nếu mục lỗi đầu tiên nằm ở tab khác thì mở tab đó, và đánh dấu đỏ ở tiêu đề các tab có lỗi. Không lưu.",
    "例：拠点名が空のとき「拠点名は必須項目です。」":
        "Ví dụ: khi tên chi nhánh trống thì hiện 「拠点名は必須項目です。」",
    "仕様では出さない（項目の下の文言だけ）。":
        "Spec không hiện (chỉ có câu dưới mục).",
    "Q02。入力を変えたあとの キャンセル・ほかの画面への移動・ブラウザを閉じる／再読み込み で出す。":
        "Q02. Hiện khi sau khi đổi nội dung nhập mà hủy, chuyển sang màn hình khác, đóng trình duyệt / tải lại.",
    "Q02。":
        "Q02.",
    "閉じて編集を続ける。":
        "Đóng và tiếp tục chỉnh sửa.",
    "入力を捨てて、詳細（または一覧）へ戻る。":
        "Bỏ nội dung nhập và quay về chi tiết (hoặc danh sách).",
    "S01 のトーストを出して、詳細へ移る。変更した項目は変更履歴に1つの操作としてまとめて残る（P-HIST）。保存の通信エラー（E30）・ほかの人が先に保存（E31）の状態は、見本データでは作れない（図だけ）。":
        "Hiện toast S01 và chuyển sang chi tiết. Các mục đã đổi được lưu vào lịch sử thay đổi như 1 thao tác (P-HIST). Các trạng thái lỗi truyền thông khi lưu (E30) và người khác đã lưu trước (E31) không tạo được bằng dữ liệu mẫu (chỉ có hình minh họa).",
    "法人に公開する資料（搬入経路資料・設置場所写真）と、社内だけの資料。JPG・PNG・PDF・HEIC、1件5MB・10件まで（E11）。HEIC は表示のときに変換する。":
        "Tài liệu công khai cho pháp nhân (tài liệu lộ trình vận chuyển vào, ảnh vị trí lắp đặt) và tài liệu chỉ nội bộ. JPG / PNG / PDF / HEIC, mỗi tệp 5MB, tối đa 10 tệp (E11). HEIC được chuyển đổi khi hiển thị.",
    "法人・拠点に公開する搬入経路図・マニュアル。表示・ダウンロード（DL）できる。":
        "Bản đồ lộ trình vận chuyển vào, hướng dẫn công khai cho pháp nhân / chi nhánh. Xem / tải xuống (DL) được.",
    "申込のときに添付されたもの。":
        "Tệp được đính kèm lúc đăng ký.",
    "委託配送先の拠点マニュアル。法人には公開しない。アップロードの経路・管理を分ける。":
        "Hướng dẫn chi nhánh cho đơn vị giao hàng ủy thác. Không công khai cho pháp nhân. Tách đường tải lên và quản lý.",
    "運営がファイルを追加・削除する。法人には出さない。":
        "Vận hành thêm / xóa tệp. Không hiện cho pháp nhân.",
})


# 3) AW_BRCH_004（拠点CSV取込）・007 の書き換え・当初契約開始年月（2026-10-05）
TR.update({
    "閉じる。": "Đóng.",
    '法人ID＋法人名。法人なしは「（法人なし）」。変えられない（参照のみ・台帳 F）。システム管理の役割だけ変えられるかは open。法人なしの拠点は請求先が「この拠点」で変更できない。':
        'ID pháp nhân + tên pháp nhân. Không có pháp nhân thì 「（法人なし）」. Không đổi được (chỉ xem, sổ cái F). Chỉ vai trò quản trị hệ thống có đổi được hay không xem open. Chi nhánh không có pháp nhân thì bên nhận hóa đơn là 「この拠点」 và không đổi được.',
    'コードは所属法人を選べる入力欄（固定の4件・宿題 S9・S11）。仕様は参照のみ':
        'Code có ô chọn pháp nhân trực thuộc (4 mục cố định, 宿題 S9・S11). Spec chỉ xem',
    'システム管理の役割だけ、拠点の所属法人を変えられるようにするか（変えられるなら、請求書・法人アカウントの見え方・過去の請求書はどうなるか）':
        'Có cho riêng vai trò quản trị hệ thống đổi pháp nhân trực thuộc của chi nhánh không (nếu đổi được thì hóa đơn, cách hiển thị tài khoản pháp nhân, hóa đơn cũ sẽ ra sao)',
    '棚卸報告':
        'Báo cáo kiểm kê',
    '選択（あり／なし（棚卸なし））':
        'Chọn (có / không (không báo cáo kiểm kê))',
    '棚卸報告|あり':
        'Có/không báo cáo kiểm kê (ví dụ: có)',
    '棚卸報告をしない拠点は「なし」。管理ロスを出さない・棚卸報告の督促（未申告・事務手数料）を出さない。請求の在庫管理・実績精算では差分率の代わりに「点検なし」と出る。拠点ごとに持つ。':
        'Chi nhánh không báo cáo kiểm kê chọn 「なし」. Không hiện thất thoát quản lý, không hiện nhắc nhở báo cáo kiểm kê (chưa khai báo / phí xử lý). Ở quản lý tồn kho và quyết toán thực tế trong thanh toán sẽ hiện 「点検なし」 thay cho tỷ lệ chênh lệch. Được giữ theo từng chi nhánh.',
    '運営が、拠点から『届いていない・なくした』と連絡を受けたときに押す。押すと Q105。「再送する」で、拠点のログイン案内をその拠点のメイン・サブ・請求担当者に送り（法人と同じ。同じ人は1通）、S101 を出す。':
        'Vận hành bấm khi nhận được liên lạc từ chi nhánh 『chưa nhận được / làm mất』. Bấm sẽ hiện Q105. Bấm 「再送する」 sẽ gửi hướng dẫn đăng nhập của chi nhánh cho người phụ trách chính, phụ, thanh toán của chi nhánh đó (giống pháp nhân; cùng người chỉ 1 email) và hiện S101.',
    '継続年月・所属法人・棚卸報告の語・ログイン案内の再送・CSV の存在しない拠点ID・請求書の状態名':
        'Tháng duy trì, pháp nhân trực thuộc, từ 棚卸報告, gửi lại hướng dẫn đăng nhập, ID chi nhánh không tồn tại trong CSV, tên trạng thái hóa đơn',
    '継続年月は休止の期間を含めない／所属法人は変えられない（参照のみ。システム管理だけ変えられるかは客先に確認）／「在庫点検」は「棚卸報告」／再送は運営が『届いていない・なくした』と連絡を受けたときに押し、宛先は法人と同じ／存在しない拠点IDの行はその行だけ E100／請求書の状態名は 未確定・確定・請求済':
        'Tháng duy trì không tính thời gian tạm dừng / pháp nhân trực thuộc không đổi được (chỉ xem; hỏi khách hàng xem riêng quản trị hệ thống có đổi được không) / 「在庫点検」 đổi thành 「棚卸報告」 / gửi lại: vận hành bấm khi nhận liên lạc 『chưa nhận được / làm mất』, người nhận giống pháp nhân / dòng có ID chi nhánh không tồn tại chỉ lỗi riêng dòng đó (E100) / tên trạng thái hóa đơn: 未確定, 確定, 請求済',
    'コードの拠点一覧にはまだ画面がない（モーダル）。台帳 E「CSV取込の画面」どおり画面として設計。画像は共通の CSV取込画面（値引きマスタ）で代用（宿題 S5）':
        'Trong code chưa có màn hình cho danh sách chi nhánh (vẫn là modal). Thiết kế thành màn hình theo sổ cái E 「CSV取込の画面」. Hình ảnh dùng màn hình nhập CSV chung (master giảm giá) thay thế (宿題 S5)',
    "ファイルを選んだ直後。画像は代用の画面（値引きマスタの CSV取込）で、見本は CSV出力のファイルに1行目の値を変え（更新の見本）、キーが誤りの行を1つ足したもの。拠点の見本ではない。": "Ngay sau khi chọn tệp. Hình là màn hình thay thế (nhập CSV master giảm giá); mẫu = tệp CSV出力 đổi giá trị dòng 1 (mẫu cập nhật) + 1 dòng khóa sai. Không phải dữ liệu chi nhánh.",
    "フル権限（CSV取込の権限）だけが開ける（ほかの役割は一覧へ戻る）。見出し → 列の定義（2.x・画面には出さない）→ ファイルを選ぶ。モーダルではなく画面（一覧の「CSV取込」から移る）。画像は代用の画面（値引きマスタの CSV取込）。": "Chỉ vai trò có quyền CSV取込 (toàn quyền) mở được (vai trò khác quay về danh sách). Tiêu đề → định nghĩa cột (2.x, không hiện trên màn hình) → chọn tệp. Là màn hình, không phải modal (sang từ nút 「CSV取込」 ở danh sách). Hình là màn hình thay thế (nhập CSV master giảm giá).",
    "最初に契約した年月（サイクル月）。日付ではない。一覧の「当初契約開始年月」「継続年月」はこの年月から計算する。プラン変更・移行でリセットしない。運営だけが直せる。":
        "Tháng (chu kỳ) ký hợp đồng đầu tiên, không phải ngày. 「当初契約開始年月」 và 「継続年月」 trong danh sách được tính từ tháng này. Không reset khi đổi / chuyển plan. Chỉ vận hành sửa được.",
    "年月の入力は共通の部品。": "Ô nhập năm-tháng dùng component chung.",
    "年月 yyyy-mm（サイクル月）": "Năm-tháng yyyy-mm (tháng chu kỳ)",
    "キーは拠点ID（更新だけ）。新しい拠点は契約申請管理の代理入力から。空欄のセルは今の値のまま、消すときは「-」。UTF-8・5,000行まで。":
        "Khóa là ID chi nhánh (chỉ cập nhật). Chi nhánh mới đăng ký từ nhập hộ ở 契約申請管理. Ô trống giữ nguyên giá trị hiện tại; muốn xóa thì nhập 「-」. UTF-8, tối đa 5,000 dòng.",
    "拠点の CSV取込はモーダルか画面か。列の定義（必須・長さ・チェック・データ例）はどこに書くか":
        "Nhập CSV chi nhánh là modal hay màn hình. Định nghĩa cột (bắt buộc, độ dài, kiểm tra, ví dụ dữ liệu) ghi ở đâu",
    "モーダルではなく1つの画面 AW_BRCH_004「拠点CSV取込」（一覧の「CSV取込」→ この画面。① ファイルを1つ選ぶ → ② 確認・登録）。エラーの行は取り込まず、ほかの行を登録する。画面には列の表を出さず、テンプレートの列の定義は項目定義に入力項目と同じ形で書く（sel＝「-」）。更新だけ（新規・仮登録の行は E101・E102）、キー＝拠点ID":
        "Không phải modal mà là 1 màn hình AW_BRCH_004 「拠点CSV取込」 (nút 「CSV取込」 ở danh sách → màn hình này. ① chọn 1 tệp → ② xác nhận / đăng ký). Dòng lỗi không nhập, các dòng khác vẫn đăng ký. Màn hình không hiện bảng cột; định nghĩa cột của template ghi trong định nghĩa mục như mục nhập (sel = 「-」). Chỉ cập nhật (dòng mới / đăng ký tạm là E101, E102), khóa = ID chi nhánh",
    "担当者（表）の CSV をどう持つか": "CSV của bảng người phụ trách được tổ chức thế nào",
    "専用の CSV は作らない。拠点の共通の CSV に担当者の列を入れる（1行＝1拠点×1人。同じ拠点IDの行を並べる：CSV入出力_定義 §1-1 の（a）・§5-2）。取り込み方（置き換えか、突き合わせか）は open":
        "Không tạo CSV riêng. Đưa các cột người phụ trách vào CSV chung của chi nhánh (1 dòng = 1 chi nhánh × 1 người; xếp liền các dòng cùng ID chi nhánh: phương án (a) mục 1-1 và mục 5-2 của CSV入出力_定義). Cách nhập (thay thế hay đối chiếu) xem open",
    "拠点の「当初契約開始」は日か年月か": "「当初契約開始」 của chi nhánh là ngày hay năm-tháng",
    "年月（サイクル月・yyyy-mm）。日付ではない。項目名は「当初契約開始年月」": "Năm-tháng (tháng chu kỳ, yyyy-mm). Không phải ngày. Tên mục là 「当初契約開始年月」",
    "画面コードは規約 <Module(2)>_<Feature(4)>_<Seq(3)>（docs/01_仕様/画面コード規約_20261005.md）。AW＝運営管理者Web、BRCH＝拠点一覧（Branch）。001 一覧／002 詳細／003 編集／004 CSV取込":
        "Mã màn hình theo quy ước <Module(2)>_<Feature(4)>_<Seq(3)> (docs/01_仕様/画面コード規約_20261005.md). AW = Web quản trị vận hành, BRCH = Danh sách chi nhánh (Branch). 001 Danh sách / 002 Chi tiết / 003 Chỉnh sửa / 004 Nhập CSV",
    "AW_BRCH_001 一覧／002 詳細／003 編集／004 CSV取込": "AW_BRCH_001 Danh sách / 002 Chi tiết / 003 Chỉnh sửa / 004 Nhập CSV",
    "拠点CSV取込": "Nhập CSV chi nhánh",
    # 状態名・メモ
    "CSV取込（ステップ1 ファイルを選ぶ）": "Nhập CSV (bước 1 chọn tệp)",
    "確認・登録（ステップ2）": "Xác nhận, đăng ký (bước 2)",
    "初期表示（ステップ1 ファイルを選ぶ）": "Hiển thị ban đầu (bước 1 chọn tệp)",
    "フル権限で一覧の操作ボタンを見たとき。「CSV取込」を押すと AW_BRCH_004（拠点CSV取込）の画面へ移る（030）。CSV出力は押すとファイルが保存され、画面は変わらない（トースト S12）。":
        "Khi xem các nút thao tác của danh sách bằng toàn quyền. Bấm 「CSV取込」 sẽ sang màn hình AW_BRCH_004 (Nhập CSV chi nhánh) (030). Xuất CSV sẽ lưu tệp, màn hình không đổi (toast S12).",
    "フル権限（CSV取込の権限）だけが開ける（ほかの役割は一覧へ戻る）。見出し → 列の定義（2.x・画面には出さない）→ ファイルを選ぶ。モーダルではなく画面（一覧の「CSV取込」から移る）。画像は代用の画面（値引きマスタの CSV取込）。":
        "Chỉ vai trò có quyền CSV取込 (toàn quyền) mở được (vai trò khác quay về danh sách). Tiêu đề → định nghĩa cột (2.x, không hiện trên màn hình) → chọn tệp. Là màn hình, không phải modal (sang từ nút 「CSV取込」 ở danh sách).",
    "ファイルを選んだ直後。画像は代用の画面（値引きマスタの CSV取込）で、見本は CSV出力のファイルに1行目の値を変え（更新の見本）、キーが誤りの行を1つ足したもの。拠点の見本ではない。":
        "Ngay sau khi chọn tệp. Mẫu = tệp CSV出力, đổi giá trị dòng 1 (mẫu cập nhật), thêm 1 dòng trống ID chi nhánh (E101) và 1 dòng có ID chi nhánh không tồn tại (E100).",
    # 項目名
    "CSV取込の画面へ": "Sang màn hình Nhập CSV",
    "CSVテンプレートの列（定義。画面には出さない）": "Các cột của CSV template (định nghĩa; không hiện trên màn hình)",
    "参照の列（変更できない）": "Các cột tham chiếu (không đổi được)",
    "所属法人ID": "ID pháp nhân trực thuộc",
    "担当者の列（1行＝1人）": "Các cột người phụ trách (1 dòng = 1 người)",
    "ファイルを選ぶ（ステップ1）": "Chọn tệp (bước 1)",
    "ドラッグ＆ドロップの枠": "Khung kéo thả",
    "エラーの行": "Dòng lỗi", "エラー一覧CSV": "Xuất CSV lỗi", "登録する内容（前 → 後）": "Nội dung sẽ đăng ký (trước → sau)",
    "ファイルを選び直す": "Chọn lại tệp", "登録": "Đăng ký",
    # 例の説明
    "所属法人ID|CU00001": "ID pháp nhân mà chi nhánh trực thuộc (ví dụ: CU00001)",
    "当初契約開始年月|2026-03": "Tháng (chu kỳ) ký hợp đồng đầu tiên, dạng yyyy-mm (ví dụ: tháng 3/2026)",
    "請求先|法人": "Bên nhận hóa đơn: pháp nhân hoặc chi nhánh này (ví dụ: pháp nhân)",
    "都道府県|神奈川県": "Tỉnh/thành trong địa chỉ của chi nhánh (ví dụ: Kanagawa)",
    "拠点ID|CU00643": "ID chi nhánh cần cập nhật, như ở tệp CSV出力 (ví dụ: CU00643)",
    # 定義の説明
    "取り込むファイルの列の定義（1行目の見出し・この順。CSV出力と同じ列）。テンプレートの写し（docs/05_画面設計書/CSVテンプレート/branches.csv）はまだない（宿題）。キー＝拠点ID。更新だけ（新しい拠点・仮登録の拠点の行はエラー）。UTF-8（BOM 可）・5,000行まで。空欄のセルは今の値のまま、「-」で消す（消せる項目だけ）。2.x の必須・長さ・チェックは入力画面（AW_BRCH_003）の項目と同じ（違うところだけ書く）。画面には出さない。":
        "Định nghĩa cột của tệp nhập (dòng 1 = tiêu đề, theo thứ tự này; cùng cột với CSV出力). Chưa có bản sao template (docs/05_画面設計書/CSVテンプレート/branches.csv) (việc cần làm). Khóa = ID chi nhánh. Chỉ cập nhật (dòng chi nhánh mới / đăng ký tạm là lỗi). UTF-8 (có BOM được), tối đa 5.000 dòng. Ô trống giữ giá trị cũ, 「-」 để xóa (chỉ mục xóa được). Bắt buộc / độ dài / kiểm tra của 2.x giống mục nhập ở màn hình (AW_BRCH_003) (chỉ ghi chỗ khác). Không hiện trên màn hình.",
    "【キー】画面の項目 5.9「拠点ID」の値。空欄の行は新しい拠点になるので E101、ファイルにない拠点IDは E100、仮登録の拠点の行は E102（受付番号は {申請番号}）。1つの拠点を担当者の数だけの行に分けて同じ拠点IDで並べる（2.33）。存在しない拠点IDの行は、その行だけ行エラー（E100）にして、ほかの行は登録する（台帳 F）。":
        "【Khóa】Giá trị của mục 5.9 「拠点ID」 trên màn hình. Dòng trống sẽ là chi nhánh mới nên E101; ID chi nhánh không có trong hệ thống là E100; dòng của chi nhánh đăng ký tạm là E102 (số đơn là {mã đơn}). Một chi nhánh được tách thành nhiều dòng theo số người phụ trách, xếp liền với cùng ID chi nhánh (2.33). Dòng có ID chi nhánh không tồn tại chỉ lỗi riêng dòng đó (E100), các dòng khác vẫn đăng ký (sổ cái F).",
    "CSV出力と同じ並びで入っている参照だけの列：所属法人ID・所属法人名（所属法人は変えられない）・旧ES ユーザーID・親契約番号・ログインID・登録日時。今の値と違う行は E115（空欄は今の値のまま）。":
        "Các cột chỉ tham chiếu có sẵn theo thứ tự như CSV出力: ID pháp nhân trực thuộc (không đổi được), tên pháp nhân trực thuộc, ID người dùng ES cũ, số hợp đồng cha, ID đăng nhập, ngày giờ đăng ký. Dòng khác giá trị hiện tại là E115 (ô trống giữ giá trị cũ).",
    "拠点IDの値は、今の拠点のとおり（CSV出力のファイルのまま）":
        "Giá trị ID chi nhánh đúng như chi nhánh hiện tại (giữ nguyên như tệp CSV出力)",
    "空欄（今の値のまま）": "Trống (giữ giá trị hiện tại)",
    "必須の項目。空欄は今の値のまま。「-」で消すことはできない（E01）。": "Mục bắt buộc. Ô trống giữ giá trị hiện tại. Không xóa được bằng 「-」 (E01).",
    "空欄は今の値のまま。「-」で消せる。": "Ô trống giữ giá trị hiện tại. Xóa được bằng 「-」.",
    "空欄は今の値のまま。条件に当てはまるときは必須で、「-」で消すことはできない。": "Ô trống giữ giá trị hiện tại. Bắt buộc khi thỏa điều kiện và không xóa được bằng 「-」.",
    "拠点の列は、同じ拠点IDの行で同じ値（最初の行に書けば、2行目以降は空欄でよい）。違えば E116。":
        "Các cột của chi nhánh có cùng giá trị ở các dòng cùng ID chi nhánh (ghi ở dòng đầu thì dòng 2 trở đi để trống được). Khác nhau là E116.",
    "【担当者の行】この拠点の担当者の表を、1行＝1人で書く（拠点IDを同じにして行を並べる。CSV入出力_定義 §1-1 の（a））。専用の CSV は作らない。メイン担当者・請求担当者が1名ずつ入っていなければ E103。":
        "【Dòng người phụ trách】Ghi bảng người phụ trách của chi nhánh, 1 dòng = 1 người (cùng ID chi nhánh, xếp liền nhau; phương án (a) mục 1-1 của CSV入出力_定義). Không tạo CSV riêng. Nếu không có đủ 1 người phụ trách chính và 1 người phụ trách thanh toán thì E103.",
    "担当者の行の取り込み方：その拠点の担当者をファイルの行で置き換えるか、区分とメールで突き合わせて更新するか。拠点の列が2行目以降は空欄でよいか":
        "Cách nhập dòng người phụ trách: thay thế toàn bộ người phụ trách của chi nhánh bằng các dòng trong tệp, hay đối chiếu theo phân loại + email để cập nhật. Các cột của chi nhánh từ dòng 2 trở đi để trống được không",
    # ステップ1
    "押すと AW_BRCH_004（拠点CSV取込）へ移る。モーダルは開かない。取込の手順・列の定義・確認は AW_BRCH_004 に書く。":
        "Bấm sẽ sang AW_BRCH_004 (Nhập CSV chi nhánh). Không mở modal. Các bước nhập, định nghĩa cột, xác nhận được ghi ở AW_BRCH_004.",
    "コードはまだモーダル（宿題 S5）。押すと取込のモーダルが開く。仕様は AW_BRCH_004 の1つの画面":
        "Code vẫn là modal (宿題 S5). Bấm sẽ mở modal nhập. Spec là 1 màn hình AW_BRCH_004",
    "検索条件のとおりの全件のファイルを保存する。画面は変わらず、トースト S12 を出す。":
        "Lưu tệp toàn bộ kết quả theo điều kiện tìm kiếm. Màn hình không đổi, hiện toast S12.",
    "押すと拠点CSV取込（AW_BRCH_004）の画面へ移る（モーダルではない）。更新だけの取込。キーは拠点ID。新しい拠点は CSV では登録できない（キーが空欄の行は E101）。仮登録の行は E102。列の定義は AW_BRCH_004 の 2。":
        "Bấm sẽ sang màn hình Nhập CSV chi nhánh (AW_BRCH_004) (không phải modal). Chỉ nhập để cập nhật. Khóa là ID chi nhánh. Không đăng ký chi nhánh mới bằng CSV (dòng trống khóa là E101). Dòng đăng ký tạm là E102. Định nghĩa cột xem mục 2 của AW_BRCH_004.",
    "コードはまだモーダル（宿題 S5）。仕様は AW_BRCH_004 の1つの画面（P-CSV）で、エラーの行だけ取り込まない・テンプレートのボタンなし":
        "Code vẫn là modal (宿題 S5). Spec là 1 màn hình AW_BRCH_004 (P-CSV): chỉ không nhập các dòng lỗi, không có nút mẫu (template)",
    "コードにない（宿題 S5）。コードは一覧の上のモーダル。この画面は仕様だけ":
        "Chưa có trong code (宿題 S5). Code là modal trên danh sách. Màn hình này chỉ có trong spec",
    "「法人・契約管理 / 拠点一覧 / 拠点CSV取込」。拠点一覧のリンクは一覧へ戻る。":
        "「法人・契約管理 / 拠点一覧 / 拠点CSV取込」. Liên kết 拠点一覧 quay về danh sách.",
    "「拠点CSV取込」": "Tiêu đề 「拠点CSV取込」",
    "一覧へ戻る（何も登録しない）。見出しの右のボタン。": "Quay về danh sách (không đăng ký gì). Nút bên phải tiêu đề.",
    "1 ファイルを選ぶ／2 確認・登録。いまのステップを強調する。": "1 Chọn tệp / 2 Xác nhận / đăng ký. Làm nổi bật bước hiện tại.",
    "更新だけの取込（運営A Q2）。新しい拠点は契約申請管理の代理入力から。テンプレートのボタンは置かない（ひな形が要るときは CSV出力のファイルを使う）。":
        "Nhập chỉ để cập nhật (vận hành A Q2). Chi nhánh mới đăng ký từ nhập hộ ở 契約申請管理. Không đặt nút template (cần mẫu thì dùng tệp CSV出力).",
    "CSV（UTF-8・.csv）1ファイル": "1 tệp CSV (UTF-8, .csv)",
    "なし": "Không",
    "CSVを1つ選ぶ（ドラッグ＆ドロップでもよい）。選んだら読み込んで、確認（ステップ2）へ進む。UTF-8 でない・読めないときは E51、見出しが違うときは E113。":
        "Chọn 1 tệp CSV (cũng có thể kéo thả). Chọn xong sẽ đọc và sang bước xác nhận (bước 2). Không phải UTF-8 / không đọc được là E51, tiêu đề khác là E113.",
    "ファイルをここへドラッグ＆ドロップできる。": "Có thể kéo thả tệp vào đây.",
    # ステップ2
    "ファイル名・件数と、行ごとの結果。「登録」でエラー以外の行（新規・更新）を登録する。エラーの行は取り込まない。":
        "Tên tệp, số dòng và kết quả từng dòng. Nhấn 「登録」 sẽ đăng ký các dòng không lỗi (mới / cập nhật). Dòng lỗi không nhập.",
    "新規／更新／変更なし／エラー の件数（バッジ）。この取込は更新だけなので、新規の行は出ない（E101 のエラーになる）。":
        "Số dòng mới / cập nhật / không đổi / lỗi (badge). Vì chỉ nhập để cập nhật nên không có dòng mới (thành lỗi E101).",
    "エラーの行があるとき": "Khi có dòng lỗi",
    "「エラーの行 n件は取り込みません」と、行番号・拠点ID・列名・内容の表（多いときは先頭だけ。全部はエラー一覧CSV）。内容は E100〜E102・E115・E116 と、2.x の入力チェックの文言。":
        "「エラーの行 n件は取り込みません」 + bảng số dòng / ID chi nhánh / tên cột / nội dung (nhiều thì chỉ phần đầu; đủ ở エラー一覧CSV). Nội dung là E100–E102, E115, E116 và câu kiểm tra nhập ở 2.x.",
    "エラーの行だけを、元の列＋エラーの内容で書き出す（直して選び直すため）。":
        "Xuất riêng các dòng lỗi với cột gốc + nội dung lỗi (để sửa rồi chọn lại).",
    "新規・更新の行があるとき": "Khi có dòng mới / cập nhật",
    "行番号・拠点ID・拠点名・変わる項目（前 → 後）。担当者の行は、変わる担当者を並べる。":
        "Số dòng, ID chi nhánh, tên chi nhánh, các mục thay đổi (trước → sau). Với dòng người phụ trách thì liệt kê người phụ trách thay đổi.",
    "ステップ1に戻る。何も登録しない。": "Về bước 1. Không đăng ký gì.",
    "更新の行が1つ以上あり、ファイル全体のエラーがないとき。警告があるときは「警告を確認しました」にチェックするまで押せない":
        "Có ≥1 dòng cập nhật và không có lỗi cả tệp. Có cảnh báo thì phải check 「警告を確認しました」 mới nhấn được",
    "エラー以外の行を登録し、S104 のトースト、一覧へ戻る。エラーの行は取り込まない。登録できる行が1つもなければ E114 で止まる。100件を超えるときは裏で進めて進み具合を出す。取込の記録と、行ごとの変更履歴「CSV取込で更新」を残す。":
        "Đăng ký các dòng không lỗi, toast S104, về danh sách. Dòng lỗi không nhập. Nếu không có dòng nào đăng ký được thì dừng với E114. Quá 100 dòng thì chạy nền và hiện tiến độ. Ghi lịch sử nhập và lịch sử từng bản ghi 「CSV取込で更新」.",
})

# 4) ベトナム語の用語の統一・例の説明の直し（レビュー QA/BA 2026-10-05）
TR.update({
    "都道府県|東京都": "Tỉnh/thành của chi nhánh, chọn trong 47 tỉnh/thành (ví dụ: Tokyo)",
    "都道府県|神奈川県": "Tỉnh/thành trong địa chỉ cần lọc (ví dụ: Kanagawa)",
    "請求先|この拠点": "Bên nhận hóa đơn của chi nhánh: pháp nhân hoặc chi nhánh này (ví dụ: chi nhánh này)",
    "請求先|法人": "Bên nhận hóa đơn cần lọc (ví dụ: pháp nhân)",
    "拠点名|株式会社サンプル 本社": "Tên chi nhánh in trên hóa đơn / phiếu giao hàng, tối đa 60 ký tự (ví dụ: công ty Sample - Trụ sở chính)",
    "拠点名フリガナ|カブシキガイシャサンプル ホンシャ": "Tên chi nhánh viết bằng Katakana toàn góc, tối đa 60 ký tự (ví dụ: カブシキガイシャサンプル ホンシャ)",
    "「n件中 a–b件」。0件は「0件」。": "「Tổng n, hiển thị a–b」. Nếu 0 thì hiện 「0件」.",
    "基本情報／契約／設備・オプション／請求／資料・履歴。タブは URL（?tab=）に持つ。入力中にタブを変えても入力は消えない。":
        "5 tab: Thông tin cơ bản / Hợp đồng / Thiết bị・Option / Thanh toán / Tài liệu・Lịch sử. Tab được giữ trong URL (?tab=). Đổi tab khi đang nhập thì giá trị đã nhập không mất.",
    "請求書発行リードタイムの上書き": "Ghi đè thời gian chuẩn bị phát hành hóa đơn (lead time)",
    "起算月（年払いのとき）": "Tháng bắt đầu tính (khi trả theo năm)",
    "当月請求額": "Số tiền yêu cầu tháng này",
    "請求先": "Bên nhận hóa đơn",
    "ボタンの出し分け（アカウントのステータス別）": "Cách hiện nút (theo trạng thái tài khoản)",
    "一覧へ戻る": "Quay về danh sách",
    "警告を確認しました|ON": "Bật ON để xác nhận đã đọc cảnh báo",
    "拠点ステータスの変え方・同時更新・承認待ち・CSV の共通コードなど": "Cách đổi trạng thái chi nhánh, cập nhật đồng thời, chờ phê duyệt, mã chung của CSV, v.v.",
    "拠点ステータスは直接編集で先の状態にだけ進める（仮登録→本登録→閉鎖予定→閉鎖。閉鎖予定→本登録は可。「停止」はない）。閉鎖は Q01 で確認。E31＝上書き警告モーダル（台帳 E）。承認待ちの項目は直接編集を止める（台帳 K）。請求先・リードタイムは「まだ作っていないサイクル月から」、支払方法・支払サイクルは未確定の子契約まで書き換え（契約_01 §2）。貸出一覧は貸出ステータスのドロップダウン（台帳 F）。詳細内の表は P-LIST。金額は（税込）／（税抜）を書く（当月請求額は税抜）。CSV 取込は法人・拠点で同じコード（E106・E107・E109・E113〜E115・S104・I104）。拠点ステータスを戻す・飛ばす行は E118。":
        "Trạng thái chi nhánh chỉ sửa trực tiếp để tiến tới trạng thái tiếp theo (đăng ký tạm → chính thức → dự kiến đóng → đã đóng; dự kiến đóng → chính thức được; không có 「停止」). Đóng xác nhận bằng Q01. E31 = modal cảnh báo ghi đè (sổ quyết định E). Mục chờ phê duyệt thì dừng sửa trực tiếp (sổ quyết định K). Bên nhận hóa đơn / thời gian chuẩn bị 「từ tháng chu kỳ chưa tạo」, phương thức / chu kỳ thanh toán ghi đè đến hợp đồng con chưa xác định (契約_01 §2). Danh sách cho mượn dùng dropdown trạng thái cho mượn (sổ quyết định F). Bảng trong chi tiết theo P-LIST. Số tiền ghi (税込) / (税抜) (số tiền yêu cầu tháng này là chưa thuế). Nhập CSV dùng chung mã cho pháp nhân và chi nhánh (E106・E107・E109・E113 ~ E115・S104・I104). Dòng quay lại / nhảy cóc trạng thái chi nhánh là E118.",
})
for _k in list(TR):
    _v = uni(TR[_k])
    if "休止" in _k:
        _v = _v.replace("tạm dừng", "tạm ngừng").replace("Tạm dừng", "Tạm ngừng")
    elif "停止" in _k:
        _v = _v.replace("tạm dừng", "dừng").replace("Tạm dừng", "Dừng")
    TR[_k] = _v















# TR7 begin
TR.update({
    'ファイルを選ぶ|拠点一覧_全件_20261005-0915.csv': 'Tên tệp CSV出力 của danh sách chi nhánh (ví dụ: 拠点一覧_全件_20261005-0915.csv)',
    'エラー行をCSVでダウンロード': 'Tải các dòng lỗi bằng CSV',
    '取り込まない件数の表示': 'Hiển thị số dòng không nhập',
    '登録する（更新 n件）': 'Đăng ký (cập nhật n dòng)',
    '編集の契約タブで「お試しを延長する」を押したとき（詳細では非活性）。月数を入れると、足す子契約の表と延長後のお試し期間が出る。': 'Khi bấm 「お試しを延長する」 ở tab Hợp đồng của màn hình chỉnh sửa (vô hiệu ở chi tiết). Nhập số tháng thì hiện bảng hợp đồng con sẽ thêm và thời gian dùng thử sau gia hạn.',
    'バッジの色の表': 'Bảng màu badge',
    '編集できる項目だけ': 'Chỉ các mục sửa được',
    '編集できる項目だけ|ON': 'Bật ON = ẩn các mục không sửa được',
    '貸出ステータス（絞り込み）': 'Lọc theo trạng thái cho mượn',
    '貸出ステータス（絞り込み）|回収済': 'Chọn hiện cả các thiết bị đã thu hồi (mặc định ẩn)',
    'コードは「回収済も表示」のトグルボタン（台帳 F 詳細の表の絞り込み：トグルは使わない・ドロップダウンに直す）': 'Code là nút toggle 「回収済も表示」 (sổ quyết định F lọc bảng ở chi tiết: không dùng toggle, đổi thành dropdown)',
    'メールアドレス|sato@sample.co.jp': 'Địa chỉ email của người phụ trách, tối đa 160 ký tự (ví dụ: sato@sample.co.jp)',
    '支払方法|口座振替': 'Phương thức thanh toán (ví dụ: chuyển khoản tự động)',
    '支払サイクル|年払い': 'Chu kỳ thanh toán (ví dụ: trả theo năm)',
    '保存できません（n件）': 'Không thể lưu (n mục)',
    'タブのエラー件数': 'Số lỗi theo tab',
    '契約種別|本導入': 'Loại hợp đồng cần lọc (ví dụ: triển khai chính thức)',
    '契約種別|お試しキャンペーン': 'Loại hợp đồng (ví dụ: chiến dịch dùng thử)',
    '請求ステータス': 'Trạng thái yêu cầu thanh toán',
    '請求書ステータス': 'Trạng thái hóa đơn',
    '詳細条件': 'Điều kiện chi tiết',
    '閉じる（既定）': 'Đóng (mặc định)',
    '運営A 法人・拠点の再レビュー（台帳 F）': 'Xem lại vận hành A pháp nhân・chi nhánh (sổ quyết định F)',
    'CSV で条件により無効な列に値があれば行エラー（E109）／アカウントの状態は5つ（持つのは有効・停止、参照のみは表示）／お試しの延長は編集の画面でだけ／UX：一覧は4つの条件＋詳細条件、編集は見出し固定・保存できません（n件）、「編集できる項目だけ」、バッジの色の表、表示件数を覚える。': 'Cột không hợp lệ theo điều kiện trong CSV có giá trị thì lỗi dòng (E109) / trạng thái tài khoản là 5 giá trị (giữ có hiệu lực・dừng, chỉ tham chiếu là hiển thị) / gia hạn dùng thử chỉ ở màn hình chỉnh sửa / UX: danh sách 4 điều kiện + điều kiện chi tiết, chỉnh sửa cố định tiêu đề・không thể lưu (n mục), 「編集できる項目だけ」, bảng màu badge, ghi nhớ số dòng hiển thị.',
    'CSV取込・アカウント・お試しの延長・UX': 'Nhập CSV・tài khoản・gia hạn dùng thử・UX',
    '「保存は画面の保存1つ・例外なし」と、ダイアログがすぐ保存することの食い違い': 'Mâu thuẫn giữa 「lưu bằng 1 nút lưu, không ngoại lệ」 và việc hộp thoại lưu ngay',
    '提案：ダイアログは確認して押すと別の操作としてすぐに保存し、編集の画面でだけ使える。編集中の入力が未保存のときはボタンを非活性にして E104「編集中の内容を先に保存してください」を出す。台帳 F の「例外なし」の読み方は hong が決める。': 'Đề xuất: hộp thoại sau khi bấm xác nhận được lưu ngay như một thao tác riêng và chỉ dùng ở màn hình chỉnh sửa. Khi nội dung đang nhập chưa lưu thì vô hiệu nút và hiện E104 「編集中の内容を先に保存してください」. Cách hiểu 「không ngoại lệ」 của sổ quyết định F do hong quyết định.',
    'コードの文言は「拠点（CU99999）が見つかりません」で E100 と同じ形（句点がない）（根拠：共通メッセージ E100。台帳に行なし）': 'Câu của code là 「拠点（CU99999）が見つかりません」, cùng dạng với E100 (không có dấu chấm cuối câu) (căn cứ: thông báo chung E100; sổ quyết định không có dòng)',
    'コードのタイトルは「編集内容を破棄しますか？」で Q02 の文言と少し違う（根拠：共通メッセージ Q02）。ブラウザを閉じる／再読み込みはブラウザの標準の確認': 'Tiêu đề trong code là 「編集内容を破棄しますか？」, hơi khác câu của Q02 (căn cứ: thông báo chung Q02). Đóng trình duyệt / tải lại dùng xác nhận chuẩn của trình duyệt',
    '選択（仮登録／本登録／休止中／閉鎖予定／閉鎖／取消）': 'Chọn (đăng ký tạm / đăng ký chính thức / đang tạm ngừng / dự kiến đóng / đã đóng / hủy)',
    '整数 1以上': 'Số nguyên từ 1 trở lên',
    '文字列 160': 'Chuỗi 160',
    '担当者CSV・ファイルサイズ・停止中の色・契約ステータス「停止」・契約終了日・延長のメモ': 'CSV người phụ trách, dung lượng tệp, màu 停止中, trạng thái hợp đồng 「停止」, ngày kết thúc hợp đồng, ghi chú gia hạn',
    '担当者CSVは「区分＋メール」で突き合わせ（あれば更新・なければ追加・CSV では削除しない）、2行目以降の拠点の列は空欄可（入れるなら1行目と同じ、違えば E116）。ファイルサイズの上限は決めない（5,000行まで）。停止中のバッジは灰。契約ステータス「停止」は暫定で「入金期限を過ぎてアカウントが止まった状態」（客先に確認）。契約終了日は確定済み・発行済みの子契約の月より前をエラー（E120）、未確定が残れば警告（W105）で自動では取り消さない。延長のメモは「理由（社内・任意）」として変更履歴の「理由」に残す。共有メッセージのずれ（I02・E06/E04・E105 と E116）は phiên gộp で直し、/ops/branches/import（CSV取込の画面）はコードの宿題。': 'CSV người phụ trách đối chiếu bằng 「phân loại + email」 (có thì cập nhật, chưa có thì thêm, CSV không xóa), cột chi nhánh từ dòng 2 trở đi để trống được (nếu điền phải giống dòng 1, khác thì E116). Không quy định giới hạn dung lượng tệp (tối đa 5.000 dòng). Badge 停止中 màu xám. Trạng thái hợp đồng 「停止」 tạm hiểu là trạng thái tài khoản dừng do quá hạn thanh toán (xác nhận với khách hàng). Ngày kết thúc hợp đồng: sớm hơn tháng của hợp đồng con đã chốt / đã phát hành là lỗi (E120), còn hợp đồng con chưa chốt thì cảnh báo (W105) và không tự hủy. Ghi chú gia hạn là 「理由（社内・任意）」, lưu vào cột 「理由」 của lịch sử thay đổi. Lệch thông báo chung (I02, E06/E04, E105 và E116) sẽ sửa ở phiên gộp; màn hình nhập CSV /ops/branches/import là việc cần làm của code.',
    '理由（社内・任意）': 'Lý do (nội bộ, không bắt buộc)',
    '理由（社内・任意）|法人のご希望（検討期間の延長）': 'Lý do gia hạn dùng thử, ghi vào cột 「理由」 của lịch sử, tối đa 500 ký tự, nhiều dòng (ví dụ: theo nguyện vọng của pháp nhân, kéo dài thời gian xem xét)',
    '契約ステータス「停止」・所属法人の変更・契約種別の履歴・取消／閉鎖の編集・アカウントのボタン表': 'Trạng thái hợp đồng 「停止」, đổi pháp nhân trực thuộc, lịch sử loại hợp đồng, chỉnh sửa chi nhánh đã hủy / đã đóng, bảng nút tài khoản',
    '契約ステータスから「停止」を外す（止めるのはアカウント自身の有効・停止）。所属法人は編集では参照のみ、システム管理だけの別操作「所属法人の付け替え」（請求書・承認待ちの申請がない拠点だけ・確認の小窓・変更履歴に残す・Claude 提案）。契約種別は編集では参照のみ、お試し→本導入の「切替」操作でだけ変え、契約種別の履歴に1行足す。取消の拠点は全項目参照のみ、閉鎖の拠点は担当者と請求書の送り先メールだけ編集できる。アカウントのボタンは未発行＝再送／発行済＝再設定・再送・停止／ログイン済・参照のみ＝再設定・停止／停止中＝再開。使ったメッセージ：S107・S108・I105〜I108（Q01・I102・E30・E32 は再利用）。': 'Bỏ 「停止」 khỏi trạng thái hợp đồng (việc dừng là 有効 / 停止 của chính tài khoản). Pháp nhân trực thuộc chỉ xem khi chỉnh sửa; chỉ quản trị hệ thống có thao tác riêng 「所属法人の付け替え」 (chỉ chi nhánh không có hóa đơn / yêu cầu chờ phê duyệt, hộp thoại xác nhận, lưu lịch sử; Claude đề xuất). Loại hợp đồng chỉ xem khi chỉnh sửa, chỉ đổi bằng thao tác 「切替」 từ dùng thử sang triển khai chính thức và thêm 1 dòng vào lịch sử loại hợp đồng. Chi nhánh đã hủy: mọi mục chỉ xem; chi nhánh đã đóng: chỉ sửa người phụ trách và email nhận hóa đơn. Nút tài khoản: chưa cấp = gửi lại / đã cấp = đặt lại・gửi lại・dừng / đã đăng nhập・chỉ tham chiếu = đặt lại・dừng / đang dừng = mở lại. Thông báo dùng: S107・S108・I105 ~ I108 (tái sử dụng Q01・I102・E30・E32).',
    '所属法人の付け替え': 'Chuyển pháp nhân trực thuộc',
    '本導入に切り替える': 'Chuyển sang triển khai chính thức',
    '契約種別の履歴': 'Lịch sử loại hợp đồng',
    '契約種別（履歴）': 'Loại hợp đồng (lịch sử)',
    '開始（履歴）': 'Bắt đầu (lịch sử)',
    '終了（履歴）': 'Kết thúc (lịch sử)',
    '年月日 yyyy-mm-dd': 'Năm-tháng-ngày yyyy-mm-dd',
    '新しい所属法人': 'Pháp nhân trực thuộc mới',
    '新しい所属法人|CU00001 株式会社サンプル': 'Pháp nhân trực thuộc mới, dạng ID pháp nhân + tên pháp nhân (ví dụ: CU00001 công ty Sample)',
    '選択（法人マスタの法人。法人ID・法人名で絞り込み検索）': 'Chọn (pháp nhân trong master pháp nhân; lọc theo ID / tên pháp nhân)',
    '影響の表示': 'Hiển thị ảnh hưởng',
    '付け替え・切替・お試しの延長が使えない拠点': 'Chi nhánh không dùng được chuyển pháp nhân・chuyển đổi・gia hạn dùng thử',
    '取消の拠点は付け替え・切替・延長がすべて非活性（I107）。閉鎖の拠点は付け替えが非活性（I13）。お試しの延長は契約種別がお試しキャンペーンのときだけ（それ以外は I109）。非活性のボタンには理由を横に出す。見本データに取消の拠点 CU01320 を追加（CU00001 の配下は7拠点）。': 'Chi nhánh đã hủy: chuyển pháp nhân, chuyển đổi, gia hạn đều bị vô hiệu (I107). Chi nhánh đã đóng: chuyển pháp nhân bị vô hiệu (I13). Gia hạn dùng thử chỉ khi loại hợp đồng là chiến dịch dùng thử (nếu không thì I109). Nút bị vô hiệu hiện lý do bên cạnh. Dữ liệu mẫu thêm chi nhánh đã hủy CU01320 (CU00001 có 7 chi nhánh).',
    '担当者CSVは「区分＋メール」で突き合わせ（あれば更新・なければ追加・CSV では削除しない）、2行目以降の拠点の列は空欄可（入れるなら1行目と同じ、違えば E116）。ファイルサイズの上限は決めない（5,000行まで）。停止中のバッジは灰。契約ステータス「停止」は暫定で「入金期限を過ぎてアカウントが止まった状態」（客先に確認）。契約終了日は確定済み・発行済みの子契約の月より前をエラー（E53）、未確定が残れば警告（W105）で自動では取り消さない。延長のメモは「理由（社内・任意）」として変更履歴の「理由」に残す。共有メッセージのずれ（I02・E06/E04・E105 と E116）は phiên gộp で直し、/ops/branches/import（CSV取込の画面）はコードの宿題。': 'CSV người phụ trách đối chiếu bằng 「phân loại + email」 (có thì cập nhật, chưa có thì thêm, CSV không xóa), cột chi nhánh từ dòng 2 trở đi để trống được (nếu điền phải giống dòng 1, khác thì E116). Không quy định giới hạn dung lượng tệp (tối đa 5.000 dòng). Badge 停止中 màu xám. Trạng thái hợp đồng 「停止」 tạm hiểu là trạng thái tài khoản dừng do quá hạn thanh toán (sau đó đã bỏ 「停止」 khỏi trạng thái hợp đồng). Ngày kết thúc hợp đồng: sớm hơn tháng của hợp đồng con đã chốt / đã phát hành là lỗi (E53), còn hợp đồng con chưa chốt thì cảnh báo (W105) và không tự hủy. Ghi chú gia hạn là 「理由（社内・任意）」, lưu vào cột 「理由」 của lịch sử thay đổi. Lệch thông báo chung (I02, E06/E04, E105 và E116) sẽ sửa ở phiên gộp; màn hình nhập CSV /ops/branches/import là việc cần làm của code.',
    '今より先の最初の月': 'Tháng đầu tiên sau thời điểm hiện tại',
    '本導入の開始年月|2026-12': 'Tháng bắt đầu triển khai chính thức, dạng yyyy-mm (ví dụ: tháng 12/2026)',
    '取消の拠点は付け替え・切替・延長がすべて非活性（I107）。閉鎖の拠点は付け替えが非活性（I13）。お試しの延長は契約種別がお試しキャンペーンのときだけ（それ以外は I109）。非活性のボタンには理由を横に出す。見本データに取消の拠点 CU01320 を追加（CU00001 の配下は6拠点）。': 'Chi nhánh đã hủy: chuyển pháp nhân, chuyển đổi, gia hạn đều bị vô hiệu (I107). Chi nhánh đã đóng: chuyển pháp nhân bị vô hiệu (I13). Gia hạn dùng thử chỉ khi loại hợp đồng là chiến dịch dùng thử (nếu không thì I109). Nút bị vô hiệu hiện lý do bên cạnh. Dữ liệu mẫu thêm chi nhánh đã hủy CU01320 (CU00001 có 6 chi nhánh).',
    '所属法人のリンク': 'Liên kết pháp nhân trực thuộc',
})
# TR7 end

CAN_U = D("拠点管理の編集権限（R/U 以上：フル権限・システム管理・物流）がある役割だけに表示", "Chỉ hiển thị với vai trò có quyền chỉnh sửa quản lý chi nhánh (R/U trở lên: toàn quyền, quản trị hệ thống, logistics)")
CAN_CSV = D("拠点管理の CSV取込の権限（CRUD：フル権限・システム管理）がある役割だけに表示", "Chỉ hiển thị với vai trò có quyền nhập CSV quản lý chi nhánh (CRUD: toàn quyền, quản trị hệ thống)")
CAN_CU = D("プラン契約管理の編集権限（R/U 以上：フル権限・システム管理・CS）がある役割だけに表示", "Chỉ hiển thị với vai trò có quyền chỉnh sửa quản lý hợp đồng plan (R/U trở lên: toàn quyền, quản trị hệ thống, CS)")
CAN_CC = D("プラン契約管理の作成権限（CRUD：フル権限・システム管理）がある役割だけに表示", "Chỉ hiển thị với vai trò có quyền tạo quản lý hợp đồng plan (CRUD: toàn quyền, quản trị hệ thống)")
CAN_ACC = "拠点の編集の権限がある役割だけに表示（運営A Q9）"
H_MAX = "入力欄に最大文字数の制御がない（宿題 S8）。仕様が正"
H_SORT = "並べ替えの UI がない（宿題 S1）。仕様が正"
H_EMPTY = D("コードの文言は「条件に一致するデータがありません。…」（宿題 S6）。I01 が正（根拠：共通メッセージ I01。台帳に行なし）", "Câu của code là 「条件に一致するデータがありません。…」 (宿題 S6). I01 đúng (căn cứ: thông báo chung I01; sổ quyết định không có dòng)")
H_DATE = "コードは文字入力（宿題 S10）。共通の日付部品が正"
H_OPT = D("コードは固定のリスト（宿題 S9）。マスタから作るのが正（根拠：契約_03 #5・契約_04。台帳に行なし）", "Code là danh sách cố định (宿題 S9). Spec đúng: tạo từ master (căn cứ: 契約_03 #5, 契約_04; sổ quyết định không có dòng)")
H_MARK = "コードは入力欄の下の文言と、トースト「入力内容を確認してください（赤枠の項目）」を出す（宿題 S17）。項目の下の文言だけが正"
H_ACC = "コードにない（宿題。運営A Q9）。仕様が正"
H_LAST = "コードはカードの途中・2列（宿題 S18）。3列幅でセクションの最後が正"
H_RO = D("コードは参照だけの役割が編集の画面を開くと入力欄が出る（宿題 S16）。仕様は詳細と同じ表示（根拠：基本設計 §10-6 P2。台帳に行なし）", "Với vai trò chỉ xem, code vẫn hiện ô nhập khi mở màn hình chỉnh sửa (宿題 S16). Spec hiển thị giống chi tiết (căn cứ: 基本設計 §10-6 P2; sổ quyết định không có dòng)")

JS = ("const sleep=ms=>new Promise(r=>setTimeout(r,ms));"
      "const setv=(el,v)=>{const p=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;"
      "Object.getOwnPropertyDescriptor(p,'value').set.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}));};"
      "const sets=(el,v)=>{Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(el,v);el.dispatchEvent(new Event('change',{bubbles:true}));};"
      "const btn=t=>[...document.querySelectorAll('button')].find(b=>b.textContent.replace(/\\s+/g,'').includes(t));"
      "const fld=t=>[...document.querySelectorAll('.pane .f')].find(x=>(x.querySelector('label')||{textContent:''}).textContent.startsWith(t));"
      "const q=s=>document.querySelector(s);")
SEARCH = lambda label, val: JS + "sets(q('select[aria-label=\"%s\"]'),'%s');await sleep(200);q('.es-search__actions button[type=submit]').click();await sleep(500);" % (label, val)


def fsel(label):
    return "label::%s^" % label


def PL(no, tbl_ja, tbl_vi, filt_ja, filt_vi):
    """詳細の中の表（P-LIST：台帳 F 画面の共通の決まり①）の動き"""
    name = tbl_ja + "の表の動き"
    TR.setdefault(name, "Hoạt động của bảng " + tbl_vi)
    return F(no, name, "-", "label", detail=D(
        "%sの表は P-LIST に従う（台帳 F 画面の共通の決まり①）。表の上に絞り込みのドロップダウン（%s）、下にページ送り（10／20／50 件・初期10）。合計は全件から出す。0件は I01（表の中に1行）、読込中は I103（読み込み中です。）と薄い枠（スケルトン）、読込に失敗したら W103（一覧を読み込めませんでした。時間をおいて、もう一度お試しください。・表の中に「再読み込み」）を出す。" % (tbl_ja, filt_ja),
        "Bảng %s theo P-LIST (sổ quyết định F, quy tắc chung của màn hình ①). Phía trên bảng có dropdown lọc (%s), phía dưới có phân trang (10 / 20 / 50 dòng, ban đầu 10). Tổng tính trên toàn bộ. 0 dòng hiện I01 (1 dòng trong bảng), đang tải hiện I103 và khung mờ (skeleton), tải lỗi hiện W103 (trong bảng, 「再読み込み」)." % (tbl_vi, filt_vi)))


def card(no, title, ja=None, **kw):
    return F(no, ja or title, ".ch::%s^" % title, "area", **kw)


# ================================================================ AW_BRCH_001 一覧
LIST_HEADER = [
    F("1", "ヘッダー", ".es-pagehead", "area", detail=D("パンくず・画面名・操作ボタン（CSV出力・CSV取込）。新規登録・削除のボタンは置かない（運営A Q1）。並びは左から CSV出力（副ボタン）、右端に CSV取込。", "Breadcrumb, tên màn hình, nút thao tác (Xuất CSV, Nhập CSV). Không đặt nút đăng ký mới và xóa (vận hành A Q1). Thứ tự từ trái: Xuất CSV (nút phụ), ngoài cùng bên phải là Nhập CSV.")),
    F("1.1", "パンくず", ".es-breadcrumb", "label", detail="「法人・契約管理 / 拠点」。"),
    F("1.2", "画面名", ".es-pagehead__title", "label", detail="「拠点一覧」"),
    F("1.3", "CSV出力", ".es-pagehead__actions button::CSV出力", "button", "click", pattern="P-CSV-OUT", err=["S12"],
      detail=D("検索条件のとおりの全件を出す（ページに関係なく）。列＝詳細の全項目＋所属法人ID・所属法人名・登録日時。UTF-8（BOM あり）・CRLF。ファイル名＝拠点一覧_{条件}_{yyyymmdd-HHmm}.csv（条件なしは「全件」）。0行のときも見出しだけのファイルを出して S12（0行）。閲覧できる役割すべてに出す。", "Xuất toàn bộ kết quả theo điều kiện tìm kiếm (không phụ thuộc trang). Cột = tất cả mục ở chi tiết + ID pháp nhân trực thuộc + tên pháp nhân trực thuộc + ngày giờ đăng ký. UTF-8 (có BOM), CRLF. Tên tệp = 拠点一覧_{điều kiện}_{yyyymmdd-HHmm}.csv (không có điều kiện thì 「全件」). Nếu 0 dòng vẫn xuất tệp chỉ có tiêu đề và hiện S12 (0 dòng). Hiển thị cho mọi vai trò xem được.")),
    F("1.4", "CSV取込", ".es-pagehead__actions button::CSV取込", "button", "click", cond=CAN_CSV, pattern="P-CSV", err=["E32", "E101", "E102"],
      detail="押すと拠点CSV取込（AW_BRCH_004）の画面へ移る（モーダルではない）。更新だけの取込。キーは拠点ID。新しい拠点は CSV では登録できない（キーが空欄の行は E101）。仮登録の行は E102。列の定義は AW_BRCH_004 の 2。",
      demo_ok="コードはまだモーダル（宿題 S5）。仕様は AW_BRCH_004 の1つの画面（P-CSV）で、エラーの行だけ取り込まない・テンプレートのボタンなし"),
]
LIST_SEARCH = [
    F("2", "検索条件", ".es-search", "area", pattern="P-LIST",
      detail=D("条件は「検索」か Enter で反映する。「未適用」の印は出さない。1行目には毎日使う条件4つ（2.1 拠点ID・拠点名・親契約番号、2.3 所属法人、2.4 拠点ステータス、2.6 契約ステータス）を置き、ほかの条件（2.2・2.5・2.7〜2.11）は「詳細条件」にまとめる。「詳細条件」は既定で閉じ、閉じているときは「n件適用中」を出す（台帳 F 再レビュー(4)）。", "Điều kiện được áp dụng khi bấm 「検索」 hoặc Enter. Không hiện dấu 「未適用」. Hàng 1 đặt 4 điều kiện dùng hằng ngày (2.1 ID chi nhánh・tên chi nhánh・số hợp đồng cha, 2.3 pháp nhân trực thuộc, 2.4 trạng thái chi nhánh, 2.6 trạng thái hợp đồng); các điều kiện khác (2.2・2.5・2.7 ~ 2.11) gom vào 「詳細条件」. 「詳細条件」 mặc định đóng và khi đóng thì hiện 「n件適用中」 (sổ quyết định F xem lại (4))."),
      demo_ok="コードは条件を変えたとき「検索」の横に「未適用」の印を出す（宿題 S2）。仕様は出さない"),
    F("2.1", "拠点ID・拠点名・親契約番号", 'input[aria-label="拠点ID、拠点名、親契約番号"]', "text", "input", req="－", len="文字列 60", init="空", ex="CU00643", err=["E04"],
      valid=D("部分一致。全角・半角、大文字・小文字、前後と途中の空白を区別しない。60文字を超えて入力したときは E04 を欄の下に出し、検索しない（切り詰めない）。", "Khớp một phần. Không phân biệt chữ toàn góc/bán góc, chữ hoa/thường, khoảng trắng đầu/giữa/cuối. Nhập quá 60 ký tự thì hiện E04 dưới ô và không tìm kiếm (không tự cắt)."), detail=D("拠点ID・拠点名・親契約番号のどれかに含まれる行を出す。入力欄の薄い文字は「拠点ID・拠点名」と短くし、探せる項目の全部は欄の「?」のヘルプに出す（提案。台帳に行なし）。", "Hiện các dòng có ID chi nhánh, tên chi nhánh hoặc số hợp đồng cha chứa từ khóa. Chữ mờ trong ô ngắn gọn 「拠点ID・拠点名」, đầy đủ các mục tìm được hiện ở trợ giúp 「?」 của ô.")),
    F("2.2", "郵便番号・電話番号・市区町村・旧ES ユーザーID", 'input[aria-label="郵便番号、電話番号、市区町村、旧ES ユーザーID"]', "text", "input", req="－", len="文字列 60", init="空", ex="港区", err=["E04"],
      valid=D("部分一致。ハイフン・空白を取って比べる（0312345678 と入れても 03-1234-5678 が見つかる）。60文字を超えたときは E04。", "Khớp một phần. So sánh sau khi bỏ dấu gạch ngang và khoảng trắng (nhập 0312345678 vẫn tìm thấy 03-1234-5678). Quá 60 ký tự thì E04."), detail=D("郵便番号・電話番号・住所（市区町村以降）・旧ES ユーザーID のどれかに含まれる行を出す。入力欄の薄い文字は短くし、探せる項目の全部は欄の「?」のヘルプに出す（提案。台帳に行なし）。", "Hiện các dòng có mã bưu chính, số điện thoại, địa chỉ (từ quận/huyện trở đi) hoặc ID người dùng ES cũ chứa từ khóa. Chữ mờ trong ô ngắn gọn, đầy đủ các mục tìm được hiện ở trợ giúp 「?」 của ô.")),
    F("2.3", "所属法人", 'select[aria-label="所属法人"]', "select", "select", req="－", len="選択（一覧にある所属法人。「（法人なし）」を含む）", init="未選択（先頭＝条件名）", ex="株式会社サンプル",
      detail="一覧の拠点が属する法人から選択肢を作る。"),
    F("2.4", "拠点ステータス", 'select[aria-label="拠点ステータス"]', "select", "select", req="－", len="選択（仮登録／本登録／閉鎖予定／閉鎖／取消）", init="未選択", ex="閉鎖予定",
      detail="取消（仮登録のあとの却下・取り下げ）も選択肢に足す（台帳 B）。",
      demo_ok="コードの選択肢に「取消」がない（宿題 S19）。仕様が正"),
    F("2.5", "契約種別", 'select[aria-label="契約種別"]', "select", "select", req="－", len="選択（本導入／お試しキャンペーン）", init="未選択", ex="本導入"),
    F("2.6", "契約ステータス", 'select[aria-label="契約ステータス"]', "select", "select", req="－", len="選択（有効／仮登録／解約手続き中／利用休止／終了／取消）", init="未選択", ex="解約手続き中"),
    F("2.7", "請求先", 'select[aria-label="請求先"]', "select", "select", req="－", len="選択（法人／この拠点）", init="未選択", ex="法人"),
    F("2.8", "都道府県", 'select[aria-label="都道府県"]', "select", "select", req="－", len="選択（一覧の住所にある都道府県）", init="未選択", ex="神奈川県"),
    F("2.9", "現在のプラン", 'select[aria-label="現在のプラン"]', "select", "select", req="－", len="選択（一覧にあるプラン）", init="未選択", ex="ES000004 100プラン",
      detail="運営A Q8：コードの追加条件を採る（契約_02 の条件に足す）。"),
    F("2.10", "当初契約開始年月（から・まで）", 'input[aria-label="当初契約開始年月（から）"]', "month", "input", req="－", len="年月 yyyy-mm（から・まで）", init="空", ex="2026-03",
      valid=D("期間で絞る。片方だけでもよい。年月の入力は共通の部品。「から」が「まで」より後のときは E08 を出し、検索しない。", "Lọc theo khoảng thời gian; chỉ nhập một đầu cũng được. Ô nhập năm-tháng dùng component chung. Nếu 「から」 sau 「まで」 thì hiện E08 và không tìm kiếm."), detail="運営A Q8：コードの追加条件を採る。", err=["E08"]),
    F("2.11", "登録日（から・まで）", 'input[aria-label="登録日（から）"]', "date", "input", req="－", len="日付 yyyy-mm-dd（から・まで）", init="空", ex="2026-04-01",
      valid="期間で絞る。片方だけでもよい。日付の入力は共通の部品。", detail="運営A Q8：コードの追加条件を採る。", err=["E08"]),
    F("2.12", "クリア", ".es-search__main button::クリア", "button", "click", detail="条件をすべて初期値に戻し、1ページ目から表示し直す。"),
    F("2.13", "検索", ".es-search__actions button[type=submit]", "button", "click", detail="条件を反映して1ページ目から表示する。Enter でも同じ。"),
    F("2.14", "詳細条件", ".es-search", "button", "click", init="閉じる（既定）", detail=D("ボタンの名前は「詳細条件」（開いているかどうかを aria-expanded で伝える）。2.2・2.5・2.7〜2.11 をまとめる。閉じているときは「詳細条件（n件適用中）」と出す。n＝詳細条件の欄のうち値が入っている欄の数（「から・まで」の組は1と数える。1行目の検索の欄は数えない）。Tab の順は 1行目の欄 → 詳細条件のボタン →（開いているとき）詳細条件の欄 → クリア → 検索。開閉は覚えず、開くたびに既定（閉）に戻るが、閉じているときの「n件適用中」はいつも見える。隠れた欄にエラー（2.10・2.11 の E08）が出たときは、自動で開いてその欄にフォーカスする。0件のときは I01 の横に「クリア」を出し、「n件適用中」も見えたままにする。状態 058。", "Tên nút là 「詳細条件」 (cho biết đang mở hay không bằng aria-expanded). Gom 2.2・2.5・2.7 ~ 2.11. Khi đóng hiện 「詳細条件（n件適用中）」. n = số ô trong điều kiện chi tiết đang có giá trị (cặp 「から・まで」 tính là 1; ô tìm kiếm ở hàng 1 không tính). Thứ tự Tab: ô ở hàng 1 → nút điều kiện chi tiết → (khi mở) các ô điều kiện chi tiết → クリア → 検索. Không nhớ trạng thái mở / đóng, mỗi lần mở lại về mặc định (đóng), nhưng 「n件適用中」 luôn nhìn thấy khi đóng. Khi ô bị ẩn có lỗi (E08 ở 2.10・2.11) thì tự mở và focus vào ô đó. Khi 0 dòng thì hiện 「クリア」 cạnh I01 và vẫn hiện 「n件適用中」. Trạng thái 058."), demo_ok=D("コードは全部の条件を開いたまま出す。仕様は台帳 F 再レビュー(4)：1行目に4つ・ほかは詳細条件（既定で閉じる）", "Code hiện toàn bộ điều kiện ở trạng thái mở. Spec theo sổ quyết định F xem lại (4): 4 điều kiện ở hàng 1, còn lại ở 詳細条件 (mặc định đóng)")),
]
LIST_COLS = [
    ("3.1", "拠点ID", "th::拠点ID", "link", "文字列 CU＋連番", "クリックで詳細（AW_BRCH_002）へ。"),
    ("3.2", "拠点名", "th::拠点名", "label", "文字列 60", ""),
    ("3.3", "所属法人", "th::所属法人", "label", "文字列 60", "法人なしの拠点は「（法人なし）」。"),
    ("3.4", "拠点ステータス", "th::拠点ステータス", "label", "", D("バッジ。色は 3.17（AW_CORP_001 の 3.12 の表）のとおり。休止は拠点ステータスに持たず、契約ステータスの「利用休止」で表す（詳細の契約ステータスには「休止予定」も出る）。休眠は法人の状態で、拠点にはない。", "Badge. Màu theo 3.17 (bảng 3.12 của AW_CORP_001). Tạm ngừng không có trong trạng thái chi nhánh mà biểu thị bằng 「利用休止」 của trạng thái hợp đồng (ở chi tiết trạng thái hợp đồng còn hiện 「休止予定」). 「休眠」 là trạng thái của pháp nhân, chi nhánh không có.")),
    ("3.5", "親契約番号", "th::親契約番号", "label", "文字列 CP＋連番", ""),
    ("3.6", "契約ステータス", "th::契約ステータス", "label", "", "バッジ（共通部品）。"),
    ("3.7", "契約種別", "th::契約種別", "label", "", "本導入／お試しキャンペーン。"),
    ("3.8", "現在のプラン", "th::現在のプラン", "label", "", "プランID＋プラン名。"),
    ("3.9", "当初契約開始年月", "th::当初契約開始年月", "label", "年月 yyyy-mm", "詳細の「当初契約開始年月」（AW_BRCH_003 の 5.5）の値。"),
    ("3.10", "継続年月", "th::継続年月", "label", "", "当初契約開始年月から今月までを「n年mヶ月」で出す。休止の期間は含めない（休止中は数えるのを止める・台帳 F）。プラン変更・移行でリセットしない。"),
    ("3.11", "請求先", "th::請求先", "label", "", "法人／この拠点。"),
    ("3.12", "住所", "th::住所", "label", "", "都道府県・市区町村・町名。"),
    ("3.13", "登録日時", "th::登録日時", "label", "日時 yyyy-mm-dd HH:MM", ""),
    ("3.14", "操作", "th::操作", "label", "", "編集（鉛筆）。仮登録の行は「申請で編集」。権限のない役割には出さない。"),
]
LIST_TABLE = [
    F("3", "一覧", ".es-table-wrap", "table", pattern="P-LIST",
      detail="初期の並び：登録日時の新しい順。1ページ10件（10／20／50）。"),
] + [F(n, ja, sel, kind, "click" if kind == "link" else "view", len=ln or None, detail=dt or None)
       for (n, ja, sel, kind, ln, dt) in LIST_COLS] + [
    F("3.15", "編集", 'button[aria-label$="を編集"]', "button", "click", cond=CAN_U, detail=D("編集（AW_BRCH_003）へ。拠点ステータスが仮登録の行は出さない（「申請で編集」を出す）。取消の行も出さない（I107）。", "Sang chỉnh sửa (AW_BRCH_003). Không hiện ở dòng đăng ký tạm (hiện 「申請で編集」). Cũng không hiện ở dòng hủy (I107).")),
    F("3.16", "並べ替え", ".es-table thead", "select", "select", req="－", len="選択（列見出し・昇順／降順）。一覧の全列", init="登録日時 降順", ex="拠点ID 昇順",
      detail=D("並べ替えは、検索の枠の「並べ替え」ドロップダウン（クリア・検索の右・台帳 K／P-LIST）と、列見出しのクリックの両方でできる（同じ状態を共有する）。列見出しは本物のボタン（Tab・Enter・Space で押せる）で aria-sort を持ち、矢印だけで示さない。見出しを押すと 昇順→降順→初期（登録日時の新しい順）の順に変わる。同じ値の行は拠点IDの昇順。空の値は昇順でも降順でも最後。拠点IDは数字部分を数値として比べる（CU900 の次が CU1000）。並べ替え・検索・ページ送りは組み合わせて使え、並べ替えや検索を変えると1ページ目に戻る。", "Sắp xếp được bằng cả dropdown 「並べ替え」 trong khung tìm kiếm (bên phải クリア・検索; sổ quyết định K / P-LIST) lẫn bấm tiêu đề cột (dùng chung trạng thái). Tiêu đề cột là button thật (bấm bằng Tab・Enter・Space) có aria-sort, không chỉ dùng mũi tên để biểu thị. Bấm tiêu đề thì chuyển lần lượt tăng dần → giảm dần → ban đầu (ngày giờ đăng ký mới nhất trước). Các dòng cùng giá trị xếp theo ID chi nhánh tăng dần. Giá trị trống luôn ở cuối. ID chi nhánh so sánh phần số theo số (CU900 rồi tới CU1000). Sắp xếp, tìm kiếm, phân trang dùng kết hợp được; đổi sắp xếp hoặc tìm kiếm thì về trang 1."), demo_ok=H_SORT),
    F("3.17", "バッジの色の表", "-", "area",
      detail=D("バッジの色は AW_CORP_001 の 3.12「状態バッジの色の表」に従う（拠点ステータス・契約ステータス・アカウントの色を1つの表にまとめてある。ここには写さない）。状態はいつも文字つきのバッジで出す。拠点では 閉鎖予定＝青・仮登録＝黄・休止中＝黄・閉鎖＝灰・取消＝灰（lib/format/status.ts）。アカウントの停止中は灰（台帳 M-1 に赤がない・台帳 F 2026-10-06(4)）。", "Màu badge theo 3.12 「状態バッジの色の表」 của AW_CORP_001 (gom màu trạng thái chi nhánh, trạng thái hợp đồng, tài khoản vào 1 bảng; không chép lại ở đây). Trạng thái luôn hiện bằng badge có chữ. Tài khoản đang dừng là màu xám (sổ quyết định M-1 không có màu đỏ; sổ quyết định F 2026-10-06 (4)). Ở chi nhánh: dự kiến đóng = xanh dương, đăng ký tạm = vàng, đang tạm ngừng = vàng, đã đóng = xám, hủy = xám (lib/format/status.ts).")),
]
LIST_PAGER = [
    F("4", "ページ送り", ".es-pagination", "area", pattern="P-LIST"),
    F("4.1", "件数", ".es-pagination__meta", "label", detail="「n件中 a–b件」。0件は「0件」。"),
    F("4.2", "前のページ", 'button[aria-label="前のページ"]', "button", "click", cond="1ページ目では非活性"),
    F("4.3", "ページ番号", ".es-page.is-current", "button", "click", detail="今のページは塗りつぶし。"),
    F("4.4", "次のページ", 'button[aria-label="次のページ"]', "button", "click", cond="最後のページでは非活性"),
    F("4.5", "表示件数", 'select[aria-label="表示件数"]', "select", "select", req="－", len="選択（10／20／50 件／ページ）", init="10件／ページ", ex="20件／ページ", detail=D("変えると1ページ目に戻る。選んだ件数は、人ごと・一覧の画面ごとに、サーバーに覚える（別のパソコンでも続く・ログインをまたいで残る・「初期化」で初期の10件に戻る）。覚えた値が10／20／50以外のときは10にする。詳細の中の表は覚えた値を使わず、いつも10件から。", "Khi đổi thì về trang 1. Số dòng đã chọn được ghi nhớ trên máy chủ theo từng người và từng màn hình danh sách (dùng tiếp ở máy khác, giữ qua các lần đăng nhập; 「初期化」 đưa về 10 dòng ban đầu). Nếu giá trị đã nhớ khác 10 / 20 / 50 thì dùng 10. Các bảng trong chi tiết không dùng giá trị đã nhớ, luôn bắt đầu từ 10 dòng."), demo_ok=D("コードは覚えない（初期10件に戻る）。仕様は台帳 F 再レビュー(4)", "Code không ghi nhớ (về lại mặc định 10 dòng). Spec theo sổ quyết định F xem lại (4)")),
]
V_LIST = [
    {"id": "001", "code": "AW_BRCH_001", "state": ["初期表示（17拠点）", ""], "url": "/ops/branches", "setup": "", "full": True, "wait": 600,
     "note": ["フル権限（Ad00010）で表示。ほかの役割では 1.3・3.15 が出ない（006 は閲覧のみの役割）。見本データは17拠点（確認メモの17は古い）。", ""],
     "items": LIST_HEADER + LIST_SEARCH + LIST_TABLE + LIST_PAGER},
    {"id": "002", "code": "AW_BRCH_001", "state": ["検索して絞り込み（契約種別＝お試しキャンペーン）", ""], "url": "/ops/branches",
     "setup": SEARCH("契約種別", "お試しキャンペーン"), "full": False, "wait": 500,
     "note": ["契約種別でお試しキャンペーンを選んで「検索」を押したとき。", ""],
     "items": [F("5", "絞り込んだ一覧", ".es-table-wrap", "table", "view", detail="条件に合う拠点だけを1ページ目から出す。件数の表示も絞り込み後の件数になる。")]},
    {"id": "003", "code": "AW_BRCH_001", "state": ["該当なし（0件）", ""], "url": "/ops/branches",
     "setup": JS + "setv(q('input[aria-label=\"拠点ID、拠点名、親契約番号\"]'),'zzz');q('.es-search__actions button[type=submit]').click();await sleep(500);",
     "full": False, "wait": 400, "note": ["拠点IDの欄に zzz を入れて検索したとき。", ""],
     "items": [F("6", "0件のメッセージ", ".es-table tbody td[colspan]", "label", "show", err=["I01"], detail=D("一覧の中に I01 を1行で出す。条件が適用されているときは I01 の横に「クリア」を出し、詳細条件が閉じていても「n件適用中」を見えたままにする。", "Hiện I01 trong 1 dòng của danh sách. Khi đang áp dụng điều kiện thì hiện 「クリア」 cạnh I01 và vẫn hiện 「n件適用中」 dù điều kiện chi tiết đang đóng."), demo_ok=H_EMPTY)]},
    {"id": "004", "code": "AW_BRCH_001", "state": ["仮登録の行（「申請で編集」）", ""], "url": "/ops/branches",
     "setup": SEARCH("拠点ステータス", "仮登録"), "full": False, "wait": 500,
     "note": ["拠点ステータスを仮登録で絞り込んだとき（見本 CU01012）。", ""],
     "items": [
         F("7", "仮登録の行", "tr::CU01012", "area", detail="申込（代理入力）から作られた仮登録の拠点。本登録（確定）するまで、この一覧・詳細・編集では直せない。"),
         F("7.1", "申請で編集", "button::申請で編集", "button", "click", cond="拠点の編集の権限がある役割だけに表示",
           detail="押すと契約申請管理の申請詳細（詳細情報設定）を開く。鉛筆（編集）は出さない。",
           demo_ok="コードは権限のない役割にも「申請で編集」を出す（宿題 S16）。仕様は権限のある役割だけ"),
         F("7.2", "仮登録のバッジ", ".es-badge::仮登録", "label", detail="色は共通部品（status.ts）：黄。契約_02 の青は古い（運営A Q8）。"),
     ]},
    {"id": "005", "code": "AW_BRCH_001", "state": ["法人なしの拠点・閉鎖予定", ""], "url": "/ops/branches",
     "setup": SEARCH("拠点ステータス", "閉鎖予定"), "full": False, "wait": 500,
     "note": ["拠点ステータスを閉鎖予定で絞り込んだとき（見本 CU01310 カフェ花 横浜店・所属法人なし）。", ""],
     "items": [
         F("8", "法人なしの拠点", "tr::CU01310", "area", detail="所属法人が「（法人なし）」の拠点。請求先は「この拠点」で変更できない。"),
         F("8.1", "閉鎖予定のバッジ", ".es-badge::閉鎖予定", "label", detail=D("閉鎖予定＝青（3.17・共通部品 status.ts）。解約の承認と同時に閉鎖予定になり、解約日に閉鎖になる。", "Dự kiến đóng = xanh dương (3.17, component chung status.ts). Cùng lúc phê duyệt hủy hợp đồng thì thành dự kiến đóng, đến ngày hủy thì thành đã đóng.")),
     ]},
    {"id": "006", "code": "AW_BRCH_001", "state": ["参照だけの役割", ""], "url": "/ops/branches", "login": "Ad00013", "setup": "", "full": False, "wait": 600,
     "note": ["閲覧のみの役割（Ad00013）で開いたとき。CSV取込と編集（鉛筆）が出ない。", ""],
     "items": [
         F("9", "参照だけの役割の画面", ".es-pagehead__actions", "area", detail="CSV取込・編集（鉛筆）・アカウントの操作を出さない。CSV出力は出す。"),
         F("9.1", "CSV出力", ".es-pagehead__actions button::CSV出力", "button", "click", detail="閲覧できる役割すべてに出す。"),
         F("9.2", "操作の列", "th::操作", "label", detail="鉛筆を出さない（権限がない）。"),
     ]},
    {"id": "007", "code": "AW_BRCH_001", "state": ["CSV取込・CSV出力", ""], "url": "/ops/branches",
     "setup": "", "full": False, "wait": 500,
     "note": ["フル権限で一覧の操作ボタンを見たとき。「CSV取込」を押すと AW_BRCH_004（拠点CSV取込）の画面へ移る（030）。CSV出力は押すとファイルが保存され、画面は変わらない（トースト S12）。", ""],
     "items": [
         F("10", "CSV取込の画面へ", ".es-pagehead__actions button::CSV取込", "button", "click", pattern="P-CSV", cond=CAN_CSV,
           detail="押すと AW_BRCH_004（拠点CSV取込）へ移る。モーダルは開かない。取込の手順・列の定義・確認は AW_BRCH_004 に書く。",
           demo_ok="コードはまだモーダル（宿題 S5）。押すと取込のモーダルが開く。仕様は AW_BRCH_004 の1つの画面"),
         F("10.1", "CSV出力", ".es-pagehead__actions button::CSV出力", "button", "click", pattern="P-CSV-OUT", err=["S12"],
           detail="検索条件のとおりの全件のファイルを保存する。画面は変わらず、トースト S12 を出す。"),
     ]},
]

# ================================================================ AW_BRCH_002 詳細・AW_BRCH_003 編集の共通部分
D_HEADER = [
    F("1", "ヘッダー", ".phead", "area"),
    F("1.1", "パンくず", ".crumb", "label", detail="「法人・契約管理 / 拠点一覧 / 拠点詳細」。拠点一覧のリンクは一覧へ戻る（編集中なら Q02）。"),
    F("1.2", "画面名", ".phead h2", "label", detail="「拠点詳細」＋拠点ID。"),
    F("1.5", "所属法人のリンク", ".idlinks a.lnk", "link", "click", detail=D("見出しの下に「法人 CU00001」のリンクを出す。押すと所属法人の画面（AW_CORP_002・/ops/corps/<法人ID>）へ移る（編集中なら Q02）。法人なしの拠点には出さない。", "Dưới tiêu đề hiện liên kết 「法人 CU00001」. Bấm sẽ sang màn hình pháp nhân trực thuộc (AW_CORP_002; /ops/corps/<ID pháp nhân>) (nếu đang chỉnh sửa thì Q02). Không hiện với chi nhánh không có pháp nhân.")),
    F("1.3", "編集", ".pbtn button.save", "button", "click", cond=D(CAN_U + "。仮登録の拠点は出さない", TR[CAN_U] + ". Không hiển thị với chi nhánh đăng ký tạm"), detail="編集（AW_BRCH_003）へ。削除のボタンは置かない（運営A Q1）。"),
]
E_HEADER = [
    F("1", "ヘッダー", ".phead", "area", pattern="P-FORM",
      detail=D("固定するのは1行（画面名・ID・キャンセル・保存）だけ。要約・タブ・「保存できません（n件）」の枠は画面を送ると流れる（枠はエラーがあるあいだ1行だけ固定に含める）。アンカー・フォーカスの移動は固定の高さ分の余白をとる。保存のボタンが長いフォームで隠れない。", "Chỉ cố định 1 hàng (tên màn hình・ID・hủy・lưu). Tóm tắt, tab, khung 「保存できません（n件）」 sẽ cuộn đi (khung được tính vào phần cố định 1 dòng khi có lỗi). Di chuyển anchor / focus chừa khoảng trống bằng chiều cao phần cố định. Nút lưu không bị ẩn trong biểu mẫu dài."),
      demo_ok=D("コードは見出しを固定しない。仕様は台帳 F 再レビュー(4)", "Code không cố định phần tiêu đề. Spec theo sổ quyết định F xem lại (4)")),
    F("1.1", "パンくず", ".crumb", "label", detail="「法人・契約管理 / 拠点一覧 / 拠点編集」。"),
    F("1.2", "画面名", ".phead h2", "label", detail="「拠点編集」＋拠点ID。"),
    F("1.3", "キャンセル", ".pbtn button.cancel", "button", "click", err=["Q02"], detail="入力を変えていれば Q02（キャンセル／破棄）。詳細から来たときは詳細へ、一覧から来たときは一覧へ戻る。"),
    F("1.4", "保存", ".pbtn button.save", "button", "click", err=["S01", "E30", "E31", "E32", "I02", "Q01"],
      detail=D("全タブの全項目をまとめてチェックして保存する。保存できたら S01 を出して詳細へ。ボタンは押したら無効にする。保存のときの通信エラーは E30（トースト・状態 049）、権限がないときは E32（状態 050）。ほかの人が先に保存していれば E31＝警告のモーダル「他のユーザーにより内容が更新されています。上書きすると保存されます。」で、「上書きして保存」で保存できる（台帳 E 2026-10-05・状態 051）。共通の I02 の文言「あとから保存した方がエラーになります」はこれと食い違う（共通メッセージはここでは直さない。phiên gộp で調整）。承認待ちの変更申請がある項目は直接編集を止める（台帳 K・状態 052）。「閉鎖」への変更は Q01 で確認する（状態 054）。", "Kiểm tra cùng lúc tất cả mục ở mọi tab rồi lưu. Lưu xong hiện S01 và sang chi tiết. Khóa nút sau khi bấm. Lỗi kết nối khi lưu là E30 (toast; trạng thái 049), không có quyền là E32 (trạng thái 050). Nếu người khác đã lưu trước thì E31 = modal cảnh báo 「他のユーザーにより内容が更新されています。上書きすると保存されます。」, bấm 「上書きして保存」 để lưu (sổ quyết định E 2026-10-05; trạng thái 051). Câu I02 chung 「あとから保存した方がエラーになります」 mâu thuẫn với điều này (không sửa thông báo chung ở đây; phiên gộp sẽ điều chỉnh). Mục có yêu cầu thay đổi đang chờ phê duyệt thì dừng chỉnh sửa trực tiếp (sổ quyết định K; trạng thái 052). Đổi sang 「閉鎖」 thì xác nhận bằng Q01 (trạng thái 054).")),
]
SUM = [
    F("2", "サマリー", ".sumbar", "area", detail="保存済みの値から作る。編集画面では、直した値をそのまま出す。"),
    F("2.1", "拠点ID", ".sumbar .s::拠点ID", "label"),
    F("2.2", "拠点名", ".sumbar .s::拠点名", "label"),
    F("2.3", "所属法人", ".sumbar .s::所属法人", "label", detail="法人ID＋法人名。法人なしは「（法人なし）」。"),
    F("2.4", "請求先", ".sumbar .s::請求先", "label", detail="法人／この拠点。"),
    F("2.5", "拠点ステータス", ".sumbar .s::拠点ステータス", "label"),
    F("2.6", "当月請求額", ".sumbar .s::当月請求額", "label", len=D("金額（税抜・円）", "Số tiền (chưa gồm thuế, yên)"), detail=D("今のサイクル月の子契約の合計（税抜）。右寄せ。契約_02 の子契約一覧の「当月請求額」と同じ基準（固定額の合計・税抜）。画面には（税抜）と書く。", "Tổng các hợp đồng con của tháng chu kỳ hiện tại (chưa gồm thuế). Căn phải. Cùng cơ sở với 「当月請求額」 trong danh sách hợp đồng con của 契約_02 (tổng số tiền cố định, chưa thuế). Trên màn hình ghi (税抜).")),
]
TABS = [
    F("3", "タブ", ".tabs", "area", pattern="P-TAB", detail="基本情報／契約／設備・オプション／請求／資料・履歴。タブは URL（?tab=）に持つ。入力中にタブを変えても入力は消えない。",
      demo_ok=D("コードは最初の表示だけ ?tab を読む（宿題 S4）。件数のあるタブの件数表示もない。仕様が正（根拠：P-TAB。台帳に行なし）", "Code chỉ đọc ?tab ở lần hiển thị đầu (宿題 S4). Cũng không hiển thị số lượng ở các tab có số lượng. Spec đúng (căn cứ: P-TAB; sổ quyết định không có dòng)")),
    F("3.1", "基本情報", ".tabs [role=tab]::基本情報", "tab", "click"),
    F("3.2", "契約", ".tabs [role=tab]::契約", "tab", "click"),
    F("3.3", "設備・オプション", ".tabs [role=tab]::設備・オプション", "tab", "click"),
    F("3.4", "請求", ".tabs [role=tab]::請求", "tab", "click"),
    F("3.5", "資料・履歴", ".tabs [role=tab]::資料・履歴", "tab", "click"),
]
TOOLS = [
    F("4", "項目の検索", ".tools", "area", detail=D("項目名・値・説明を絞り込む。タブの下に、カードごとの項目数つきの目次を出す。詳細画面の補助機能（項目を検索・すべて閉じる・カード目次・編集できる項目だけ）。台帳 F『拠点ステータスの切替・詳細画面の補助機能 (2)』にある（名前は台帳 F 再レビュー(4)で「編集できる項目だけ」に改めた）。共通パターンへの追加は phiên gộp で行う。", "Lọc theo tên mục, giá trị, mô tả. Dưới tab hiện mục lục có số mục của từng thẻ. Các chức năng phụ của màn hình chi tiết (tìm mục, đóng tất cả, mục lục thẻ, chỉ các mục sửa được). Có trong sổ quyết định F 『chuyển trạng thái chi nhánh・chức năng phụ của màn hình chi tiết (2)』 (tên đổi thành 「編集できる項目だけ」 theo sổ quyết định F xem lại (4)). Việc thêm vào mẫu chung sẽ làm ở phiên gộp.")),
    F("4.1", "項目を検索", ".tools .srch input", "text", "input", req="－", len="文字列 60", init="空", ex="電話", detail=D("「/」は、どの入力欄にもフォーカスがないときだけ検索欄へ移る（備考などに「/」を入力できる）。Esc で検索を消す。", "Phím 「/」 chỉ chuyển sang ô tìm kiếm khi không có ô nhập nào đang được focus (vẫn nhập được 「/」 vào ghi chú, v.v.). Esc để xóa tìm kiếm.")),
    F("4.2", "すべて閉じる・開く", ".tools button::すべて", "button", "click", detail="そのタブのカードをすべて閉じる／開く。ボタンの名前が入れ替わる。"),
    F("4.3", "編集できる項目だけ", ".tools label::編集できる項目だけ", "check", "check", req="－", len="チェック", init="OFF", ex="ON",
      detail=D("編集のボタンがある詳細（仮登録の拠点・編集の権限がない役割の詳細には編集のボタンがないので出さない）にだけ出す。ON にすると、編集できない項目（条件で非活性の項目を含む）を隠す。空になったカードは隠し、目次の件数は見えている項目だけを数える。同じ画面を開いているあいだ（タブを変えても）は覚え、開き直すと OFF に戻る。", "Chỉ hiện ở chi tiết có nút chỉnh sửa (chi nhánh đăng ký tạm hoặc vai trò không có quyền chỉnh sửa thì không có nút nên không hiện). Bật ON thì ẩn các mục không sửa được (kể cả mục bị vô hiệu theo điều kiện). Thẻ rỗng thì ẩn, số trong mục lục chỉ đếm các mục đang hiện. Được nhớ khi đang mở cùng màn hình (kể cả đổi tab), mở lại thì về OFF.")),
]
TOOLS_E = [t for t in TOOLS if t["no"] != "4.3"]

# ---- 項目の定義（詳細と編集で番号・場所を共有する）。ro＝編集でも入力できない／btn＝ボタン
BASIC = [
    dict(no="5.1", ja="拠点名", lab="拠点名", kind="text", req="○", len="文字列 60", ex="株式会社サンプル 本社",
         d="拠点の名称。請求書・送り状に印字される。", v="前後の空白を取る。絵文字は不可。請求書・送り状で正しく印字されない文字は警告（W02）。", err=["E01", "E04", "E13", "W02"], ok=H_MAX),
    dict(no="5.2", ja="拠点名フリガナ", lab="拠点名フリガナ", kind="text", req="○", len="文字列 60", ex="カブシキガイシャサンプル ホンシャ",
         d="カタカナで統一する。", v="全角カタカナ・長音・スペース。", err=["E01", "E03", "E04"], ok="コードは全角カタカナ・最大文字数のチェックがない（宿題 S8）。仕様が正"),
    dict(no="5.3", ja="所属法人", lab="所属法人", kind="label", ro=True,
         d=D("法人ID＋法人名。法人なしは「（法人なし）」。編集の項目では変えられない（参照のみ・台帳 F）。変えられるのはシステム管理だけの別操作「所属法人の付け替え」（5.12・詳細のボタン）。法人なしの拠点は請求先が「この拠点」で変更できない。", "ID pháp nhân + tên pháp nhân. Không có pháp nhân thì 「（法人なし）」. Không đổi được ở mục chỉnh sửa (chỉ xem; sổ quyết định F). Chỉ đổi được bằng thao tác riêng 「所属法人の付け替え」 (5.12, nút ở chi tiết) của riêng quản trị hệ thống. Chi nhánh không có pháp nhân thì bên nhận hóa đơn là 「この拠点」 và không đổi được."),
         ok="コードは所属法人を選べる入力欄（固定の4件・宿題 S9・S11）。仕様は参照のみ",),
    dict(no="5.4", ja="従業員数", lab="従業員数", kind="text", req="－", len="整数 0〜999,999", ex="120",
         d="拠点の従業員数。", v="半角の数字。全角は半角に直す。", err=["E14", "E12"], ok="コードは半角の数字のチェックだけ（宿題 S8）。仕様が正"),
    dict(no="5.5", ja="当初契約開始年月", lab="当初契約開始年月", kind="month", req="－", len="年月 yyyy-mm（サイクル月）", ex="2026-03",
         d="最初に契約した年月（サイクル月）。日付ではない。一覧の「当初契約開始年月」「継続年月」はこの年月から計算する。プラン変更・移行でリセットしない。運営だけが直せる。",
         v="年月の入力は共通の部品。"),
    dict(no="5.6", ja="拠点ステータス", lab="拠点ステータス", kind="select", req="○", len=["選択（本登録／閉鎖予定／閉鎖）", "Chọn (đăng ký chính thức / dự kiến đóng / đã đóng)"], ex="本登録",
         d=D("編集で直接直せる（運営A Q3）。選べるのは今の状態から先の状態だけ：仮登録→本登録→閉鎖予定→閉鎖（戻せない）。例外として、閉鎖予定→本登録（取消）は選べる。本登録→仮登録・閉鎖→前の状態は選択肢に出さない。仮登録の拠点はこの画面で編集できない（契約申請管理で本登録にする）。「停止」は拠点ステータスにない（アカウントの停止とは別）。「休止中」は選べない（休止は契約申請管理の変更申請から。親契約の利用休止と休止履歴から表示する）。申請の承認でも動く（解約＝承認と同時に閉鎖予定、解約日に閉鎖）。直接直したときは、子契約の取消・アカウント停止・設備回収予定は自動では動かない。「閉鎖」を選んで保存するときは Q01（「閉鎖に変更する」）で確認する。選択肢にない状態（今の状態より前・飛ばした先）を古い画面や CSV で送ったときは E118（「{現在}」から「{選択}」へは変更できません。）を項目の下に出す。仮登録は選択肢に出さない。最後の拠点を「閉鎖」にすると、所属法人は自動で休眠になる（法人ステータスの遷移は AW_CORP_002 の 4.8 の表。台帳 F 2026-10-06(1)）。今の状態が取消の拠点は全項目が参照のみ（編集のボタンを出さず、理由 I107 を出す）。閉鎖の拠点は参照のみで、担当者と請求書の送り先メール（請求担当者のメール）だけ編集できる（I108・状態 066）。閉鎖予定・そのほかは通常どおり編集できる（台帳 F 2026-10-06 最後の open(4)）。", "Sửa trực tiếp được ở chỉnh sửa (vận hành A Q3). Chỉ chọn được trạng thái tiếp theo của trạng thái hiện tại: đăng ký tạm → đăng ký chính thức → dự kiến đóng → đã đóng (không quay lại được). Ngoại lệ: dự kiến đóng → đăng ký chính thức (hủy) được chọn. Đăng ký chính thức → đăng ký tạm và đã đóng → trạng thái trước không hiện trong lựa chọn. Chi nhánh đăng ký tạm không sửa được ở màn hình này (chuyển thành đăng ký chính thức ở 契約申請管理). Chi nhánh không có trạng thái 「停止」 (khác với tạm dừng tài khoản). Không chọn được 「休止中」 (tạm ngừng làm từ yêu cầu thay đổi ở 契約申請管理; hiển thị dựa trên tạm ngừng sử dụng của hợp đồng cha và lịch sử tạm ngừng). Cũng thay đổi khi phê duyệt yêu cầu (hủy hợp đồng = dự kiến đóng cùng lúc phê duyệt, đóng vào ngày hủy). Khi sửa trực tiếp, việc hủy hợp đồng con, dừng tài khoản, lịch thu hồi thiết bị không tự chạy. Khi chọn 「閉鎖」 rồi lưu sẽ xác nhận bằng Q01 (「閉鎖に変更する」). Nếu gửi trạng thái không có trong lựa chọn (quay lại / nhảy cóc) từ màn hình cũ hoặc CSV thì hiện E118 (không đổi được từ 「{hiện tại}」 sang 「{lựa chọn}」) dưới mục. Không hiện 「仮登録」 trong lựa chọn. Khi chuyển chi nhánh cuối cùng sang 「閉鎖」 thì pháp nhân trực thuộc tự động chuyển sang 休眠 (bảng chuyển trạng thái pháp nhân ở 4.8 của AW_CORP_002; sổ quyết định F 2026-10-06 (1)). Chi nhánh đang ở trạng thái hủy thì mọi mục chỉ xem (không hiện nút chỉnh sửa, hiện lý do I107). Chi nhánh đã đóng thì chỉ xem, chỉ sửa được người phụ trách và email nhận hóa đơn (email người phụ trách thanh toán) (I108; trạng thái 066). Dự kiến đóng và các trạng thái khác sửa bình thường (sổ quyết định F 2026-10-06 open cuối (4))."),
         err=["E02", "E118", "Q01"]),
    dict(no="5.7", ja="棚卸報告", lab="棚卸報告", kind="select", req="－", len="選択（あり／なし（棚卸なし））", ex="あり",
         d=D("棚卸報告をしない拠点は「なし」。管理ロスを出さない・棚卸報告の督促（未申告・事務手数料）を出さない。請求の在庫管理・実績精算では差分率の代わりに「棚卸報告なし」と出る（台帳 L の「点検なし」は台帳 F 細かい点(4) に合わせて直す）。拠点ごとに持つ。", "Chi nhánh không báo cáo kiểm kê chọn 「なし」. Không hiện thất thoát quản lý, không hiện nhắc nhở báo cáo kiểm kê (chưa khai báo / phí xử lý). Ở quản lý tồn kho và quyết toán thực tế trong thanh toán sẽ hiện 「棚卸報告なし」 thay cho tỷ lệ chênh lệch (「点検なし」 của sổ quyết định L sẽ sửa theo sổ quyết định F chi tiết nhỏ (4)). Được giữ theo từng chi nhánh.")),
    dict(no="5.8", ja="基準数のパターン", lab="基準数のパターン", kind="select", req="－", len="選択（通常／短消費期限なし）", ex="通常",
         d="短消費期限なしの拠点は、消費期限の短い商品をデフォルト注文に入れず「短消費期限なし基準注文数」を使う。料金は変わらない。契約（申込）のときに決め、変更は運営だけ。自販機のプランでは使わない。"),
    dict(no="5.9", ja="拠点ID", lab="拠点ID", kind="label", ro=True, d="システムが採番する。CU＋連番（例：CU00643）で、桁は固定しない。QR運用はこの拠点IDから作る。入力できない。"),
    dict(no="5.10", ja="旧ES ユーザーID", lab="旧ES ユーザーID", kind="label", ro=True, d="フェーズ1（旧ESステーション）のユーザーID（例：ES000001）。移行で取り込み、画面では参照だけ。経理の金額照合に使う。"),
    dict(no="5.11", ja="備考", lab="備考", kind="textarea", req="－", len="文字列 500（複数行）", ex="搬入は裏口からお願いします",
         d="お客様の要望など。複数行。高さを変えられる。", v="500文字まで。", err=["E04", "E13"], ok=H_LAST + "。最大文字数の制御もない（宿題 S8）"),
]
ADDR = [
    dict(no="6.1", ja="郵便番号", lab="郵便番号", kind="text", req="○", len="文字列 8（数字7桁。ハイフンは任意）", ex="105-0011",
         d="ハイフンあり・なしどちらでも受ける。保存は 123-4567 の形。", v="数字7桁。", err=["E01", "E05"]),
    dict(no="6.2", ja="住所検索", lab="住所検索", kind="btn", sel=".f button::住所検索", err=["W100"],
         d="郵便番号の横に置く。押すと都道府県・市区町村・町名・番地を自動で入れる（建物等は入れない）。取得できないときは W100 を出して手入力のまま。入れたあとも各項目は直せる。",
         ok=D("コードは押すとトーストだけ（未接続・宿題 S21）。仕様が正（根拠：契約_03。台帳に行なし）", "Code chỉ hiện toast khi bấm (chưa kết nối, 宿題 S21). Spec đúng (căn cứ: 契約_03; sổ quyết định không có dòng)")),
    dict(no="6.3", ja="都道府県", lab="都道府県", kind="select", req="○", len="選択（47都道府県）", ex="東京都", d="47都道府県から選ぶ（自由入力にしない）。住所検索で入った値もこの選択肢に合わせる。", err=["E02"]),
    dict(no="6.4", ja="市区町村", lab="市区町村", kind="text", req="○", len="文字列 255", ex="港区", err=["E01", "E04", "E13", "W02"], ok=H_MAX),
    dict(no="6.5", ja="町名・番地", lab="町名・番地", kind="text", req="○", len="文字列 255", ex="芝公園2-4-1",
         d="住所を変えると、以後に作る配送データへ反映する。作成済み・納品済みの配送データは、納品日の住所を持ち続ける（契約・子契約は住所を持たない）。", err=["E01", "E04", "E13", "W02"], ok=H_MAX),
    dict(no="6.6", ja="建物等", lab="建物等", kind="text", req="－", len="文字列 255", ex="芝パークビル8F", err=["E04", "E13", "W02"], ok=H_MAX),
    dict(no="6.7", ja="設置フロア", lab="", kind="text", req="条件付き", len="文字列 60", ex="8階（エレベーター右）", sel="-",
         d="拠点の専用の項目（配送備考に混ぜない）。自動販売機を貸し出す拠点は必須、冷蔵庫・冷凍庫だけの拠点は任意。子契約には出さない（運営A Q6）。",
         cond="貸出設備に自動販売機があるときは必須", err=["E01", "E04", "E13"],
         ok="コードにない（宿題）。コードは子契約の編集に「設置フロア」「配送備考」を置く。配送備考を拠点に揃えるかは未確認で、契約_05 のまま子契約"),
    dict(no="6.8", ja="電話番号", lab="電話番号", kind="text", req="○", len="文字列 20（数字とハイフン）", ex="03-5401-2200", v="ハイフンを除いて10〜11桁。", err=["E01", "E06"],
         ok="コードは半角の数字とハイフンのチェックだけ（宿題 S8）"),
    dict(no="6.9", ja="FAX番号", lab="FAX番号", kind="text", req="－", len="文字列 20（数字とハイフン）", ex="03-5401-2201", v="ハイフンを除いて10〜11桁。", err=["E06"]),
]
ACCT = [
    dict(no="8.1", ja="ログインID", lab="ログインID", kind="label", ro=True, d="受付・仮登録で発行する。拠点ごとに1つ（拠点アカウント）で、その拠点の担当者で共有する。有効・停止は契約の状態から決めず、アカウント自身が持つ。"),
    dict(no="8.2", ja="最終ログイン日時", lab="最終ログイン日時", kind="label", ro=True, d="日時 yyyy-mm-dd HH:MM。ログインしたことがなければ「—」。"),
    dict(no="8.3", ja="アカウントのステータス", lab="", kind="label", ro=True, sel="-", d=D("未発行／発行済（ログイン前）／ログイン済／参照のみ／停止中（法人と同じ・台帳 F 再レビュー(2)）。アカウント自身が持つのは有効／停止だけ（台帳 K）で、「参照のみ」は契約の状態から決まる表示。この拠点の参照のみ＝その拠点が休止中のとき、または、その拠点の解約日の翌日〜その拠点の最後の請求書の入金期限（契約_01 §6-3・§6-4。法人の「全拠点の解約後」とは別）。停止中＝運営が「停止」したとき、または、その拠点の最後の請求書の入金期限の翌日の自動停止（契約_01 §6-4）。表示の優先は 停止中 ＞ 参照のみ ＞ ログイン済 ＞ 発行済 ＞ 未発行（台帳 F 2026-10-06 最後の open(5)）。表示だけ（運営A Q9）。", "Chưa cấp / đã cấp (chưa đăng nhập) / đã đăng nhập / chỉ tham chiếu / đang dừng (giống pháp nhân; sổ quyết định F xem lại (2)). Tài khoản chỉ tự giữ có hiệu lực / dừng (sổ quyết định K); 「参照のみ」 là hiển thị được quyết định từ trạng thái hợp đồng. Chỉ tham chiếu của chi nhánh = khi chi nhánh đang tạm ngừng, hoặc từ ngày sau ngày hủy của chi nhánh đó đến hạn thanh toán của hóa đơn cuối của chi nhánh đó (契約_01 §6-3, §6-4; khác với 「sau khi hủy tất cả chi nhánh」 của pháp nhân). Đang dừng = khi vận hành 「停止」, hoặc tự động dừng vào ngày sau hạn thanh toán của hóa đơn cuối của chi nhánh đó (契約_01 §6-4). Thứ tự ưu tiên hiển thị: đang dừng > chỉ tham chiếu > đã đăng nhập > đã cấp > chưa cấp (sổ quyết định F 2026-10-06 open cuối (5)). Chỉ hiển thị (vận hành A Q9)."), ok=H_ACC),
    dict(no="8.4", ja="パスワード再設定", lab="パスワード再設定", kind="btn", sel=".f button::パスワード再設定", err=["Q100", "S100", "E32", "E30", "W104"], cond=CAN_ACC,
         d=D("押すと Q100。「送る」で、メイン担当者にパスワード再設定の案内（認証コード・有効期限5分）をメールで送り、S100 を出す。変更履歴に残る（操作＝パスワード再設定。基本設計 §10-6 R7・法人と同じ）。", "Bấm sẽ hiện Q100. Bấm 「送る」 sẽ gửi email hướng dẫn đặt lại mật khẩu (mã xác thực, hiệu lực 5 phút) cho người phụ trách chính và hiện S100. Được lưu vào lịch sử thay đổi (thao tác = đặt lại mật khẩu; 基本設計 §10-6 R7, giống pháp nhân)."),
         ok="コードは法人の編集の権限（corps）で出し分け、物流が拠点の画面で再設定できない（運営A Q9）。仕様は拠点の編集の権限。コードの確認の文言は Q100 と違う"),
    dict(no="8.5", ja="ログイン案内の再送", lab="", kind="btn", sel="-", err=["Q105", "S101", "E32", "E30", "W104"], cond=CAN_ACC,
         d=D("運営が、拠点から『届いていない・なくした』と連絡を受けたときに押す。押すと Q105。「再送する」で、拠点のログイン案内をその拠点のメイン・サブ・請求担当者に送り（法人と同じ。同じ人は1通）、S101 を出す。変更履歴に残る（操作＝ログイン案内の再送）。", "Vận hành bấm khi nhận được liên lạc từ chi nhánh 『chưa nhận được / làm mất』. Bấm sẽ hiện Q105. Bấm 「再送する」 sẽ gửi hướng dẫn đăng nhập của chi nhánh cho người phụ trách chính, phụ, thanh toán của chi nhánh đó (giống pháp nhân; cùng người chỉ 1 email) và hiện S101. Được lưu vào lịch sử thay đổi (thao tác = gửi lại hướng dẫn đăng nhập)."), ok=H_ACC),
    dict(no="8.6", ja="アカウントの停止・再開", lab="", kind="btn", sel="-", err=["Q106", "S102", "Q107", "S103", "E32", "E30"], cond=CAN_ACC,
         d=D("ボタンは 8.7 の表に従う：停止中でないときは「アカウントの停止」（Q106 → S102）、停止中のときは「アカウントの再開」（Q107 → S103）。未発行には「停止」を出さない。停止・再開した日時と操作した人は変更履歴に残る（理由の入力欄は置かない）。", "Nút theo bảng ở 8.7: khi chưa dừng thì hiện 「アカウントの停止」 (Q106 → S102), khi đang dừng thì hiện 「アカウントの再開」 (Q107 → S103). Không hiện 「停止」 với tài khoản chưa cấp. Ngày giờ và người thực hiện dừng / mở lại được lưu vào lịch sử thay đổi (không đặt ô nhập lý do)."), ok=H_ACC),
    dict(no="8.7", ja="ボタンの出し分け（アカウントのステータス別）", lab="", kind="label", ro=True, sel="-",
         d=D("法人と同じ表（AW_CORP_002 の 7.2 と同じ・台帳 F 2026-10-06 最後の open(5)）：未発行＝「ログイン案内の再送」だけ／発行済（ログイン前）＝「パスワード再設定」「ログイン案内の再送」「アカウントの停止」／ログイン済＝「パスワード再設定」「アカウントの停止」／参照のみ＝「パスワード再設定」「アカウントの停止」／停止中＝「アカウントの再開」だけ。表示の優先は 停止中＞参照のみ＞ログイン済＞発行済＞未発行。「アカウントの停止」は危険な操作として赤い字で、ほかのボタンから離して置く。", "Cùng bảng với pháp nhân (giống 7.2 của AW_CORP_002; sổ quyết định F 2026-10-06 open cuối (5)): chưa cấp = chỉ 「ログイン案内の再送」 / đã cấp (chưa đăng nhập) = 「パスワード再設定」「ログイン案内の再送」「アカウントの停止」 / đã đăng nhập = 「パスワード再設定」「アカウントの停止」 / chỉ tham chiếu = 「パスワード再設定」「アカウントの停止」 / đang dừng = chỉ 「アカウントの再開」. Ưu tiên hiển thị: đang dừng > chỉ tham chiếu > đã đăng nhập > đã cấp > chưa cấp. 「アカウントの停止」 là thao tác nguy hiểm nên dùng chữ đỏ và đặt cách xa các nút khác."),
         ok=H_ACC),
]
STAFF_COLS = [
    ("7.1", "区分", "th::区分", "select", "○", "選択（メイン担当者／請求担当者／サブ担当者）", "メイン担当者", "メイン1名・請求1名は必須。保存のときに足りなければ E103、2名以上なら E108（ページ内）。メイン・請求担当者の変更は通知する（将来日付の予約はしない）。", ["E02", "E103", "E108"]),
    ("7.2", "担当者名", "th::担当者名", "text", "○", "文字列 60", "佐藤 誠", "", ["E01", "E04", "E13"]),
    ("7.3", "フリガナ", "th::フリガナ", "text", "○", "文字列 60", "サトウ マコト", "全角カタカナ。", ["E01", "E03", "E04"]),
    ("7.4", "メールアドレス", "th::メールアドレス", "text", "○", "文字列 160", "sato@sample.co.jp", D("請求先＝この拠点のとき、請求担当者のメールアドレスが請求書の宛先・通知先になる（請求先＝法人のときは法人の請求担当者）。", "Khi bên nhận hóa đơn = chi nhánh này, email của người phụ trách thanh toán là nơi nhận hóa đơn / thông báo (khi bên nhận hóa đơn = pháp nhân thì dùng người phụ trách thanh toán của pháp nhân)."), ["E01", "E07", "E04"]),
    ("7.5", "電話番号（担当者）", "th::電話番号（担当者）", "text", "－", "文字列 20（数字とハイフン）", "03-5401-2200", D("ハイフンを除いて10〜11桁。桁が合わないときも E06（E06 の文言には桁の説明がない。共通メッセージの調整待ち）。", "10 ~ 11 chữ số (không tính dấu gạch ngang). Sai số chữ số cũng là E06 (câu E06 không nêu số chữ số; chờ điều chỉnh thông báo chung)."), ["E06"]),
]
CONTRACT = [
    dict(no="9.1", ja="契約種別", lab="契約種別", kind="label", ro=True,
         d=D("お試しキャンペーンは既定1ヶ月で、指定した月数だけ子契約を作る（自動更新しない）。プラン料金はお試しキャンペーン割引（DC000013）で相殺し、実績精算は請求する。編集の項目では変えられない（参照のみ）。お試し→本導入は、詳細の「本導入に切り替える」（9.11）でだけ変え、親契約の「契約種別の履歴」に1行足す（契約_01 §6-1・台帳 F 2026-10-06 最後の open(3)）。", "Chiến dịch dùng thử mặc định 1 tháng, tạo hợp đồng con theo số tháng chỉ định (không tự gia hạn). Phí plan được bù bằng giảm giá chiến dịch dùng thử (DC000013), quyết toán thực tế vẫn thu phí. Không đổi được ở mục chỉnh sửa (chỉ xem). Chuyển từ dùng thử sang triển khai chính thức chỉ bằng 「本導入に切り替える」 (9.11) ở chi tiết, và thêm 1 dòng vào 「契約種別の履歴」 của hợp đồng cha (契約_01 §6-1; sổ quyết định F 2026-10-06 open cuối (3))."), err=["E02"]),
    dict(no="9.2", ja="契約ステータス", lab="契約ステータス", kind="select", req="○", len="選択（仮登録／有効／解約手続き中／利用休止／終了）", ex="有効",
         d=D("編集で直接直せる（運営A Q3）。契約の状態はここだけが正で、子契約は参照表示。直接直したときの副作用（子契約の取消・設備回収予定）は自動では動かない。親契約の項目の保存は、プラン契約管理の編集権限（R/U 以上：フル権限・システム管理・CS）。拠点の編集画面を開けるのはフル権限・システム管理・物流なので、物流は親契約を参照だけ、CS は拠点の編集画面を開けない。契約ステータスに「停止」はない（止めるのはアカウント自身の有効・停止。台帳 F 2026-10-06 最後の open(1)・台帳 K・契約_01 §6-3）。", "Sửa trực tiếp được ở chỉnh sửa (vận hành A Q3). Trạng thái hợp đồng chỉ đúng ở đây, hợp đồng con chỉ hiển thị tham chiếu. Khi sửa trực tiếp, các tác dụng phụ (hủy hợp đồng con, lịch thu hồi thiết bị) không tự chạy. Lưu mục của hợp đồng cha cần quyền chỉnh sửa quản lý hợp đồng plan (R/U trở lên: toàn quyền, quản trị hệ thống, CS). Màn hình chỉnh sửa chi nhánh chỉ mở được bằng toàn quyền, quản trị hệ thống, logistics nên logistics chỉ xem hợp đồng cha, CS không mở được màn hình chỉnh sửa chi nhánh. Trạng thái hợp đồng không có 「停止」 (việc dừng là 有効 / 停止 của chính tài khoản; sổ quyết định F 2026-10-06 open cuối (1), sổ quyết định K, 契約_01 §6-3)."),
         cond=D("プラン契約管理の編集権限がない役割は参照だけ", "Vai trò không có quyền chỉnh sửa quản lý hợp đồng plan chỉ được xem"), err=["E02"],
         ok="コードは拠点の保存の権限（branches）で親契約も書くため、物流が親契約を直せる。仕様は契約管理の編集権限（運営A Q3）"),
    dict(no="9.3", ja="開始サイクル月", lab="開始サイクル月", kind="select", req="○", len="選択（年月 yyyy-mm。オーダー締切に連動）", ex="2026-03",
         d="最初のサイクル月を選ぶ。選べる月はオーダー締切に連動する。子契約・請求・配送はこのサイクル月から始まる。機種変更・追加があっても変えない。", err=["E02"], ok=H_OPT),
    dict(no="9.4", ja="契約終了日", lab="契約終了日", kind="date", req="－", len="日付 yyyy-mm-dd", ex="2027-03-31",
         d=D("解約が確定したときに入る。納品の最後の月を指す。解約・休止を承認すると、適用月以降の未確定の先行子契約を取り消す。編集で直接直せる（運営A Q3）。確定済み・発行済みの子契約の月より前にはできない（E53・台帳 F 2026-10-06(6)）。未確定の子契約が残るときは警告 W105 を出すだけで、自動では取り消さない（取り消すのは申請の承認）。CSV の行も同じ規則。", "Được điền khi việc hủy được chốt. Chỉ tháng cuối cùng giao hàng. Khi phê duyệt hủy / tạm ngừng thì hủy các hợp đồng con tạo trước chưa chốt từ tháng áp dụng. Sửa trực tiếp được ở chỉnh sửa (vận hành A Q3). Không đặt sớm hơn tháng của hợp đồng con đã chốt / đã phát hành hóa đơn (E53; sổ quyết định F 2026-10-06 (6)). Khi còn hợp đồng con chưa chốt thì chỉ hiện cảnh báo W105 và không tự hủy (hủy là việc của phê duyệt yêu cầu). Dòng CSV cũng cùng quy tắc."),
err=["E08", "E53", "W105"], ok=H_DATE),
    dict(no="9.5", ja="お試し期間（月数）", lab="お試し期間（月数）", kind="select", req="条件付き", len="選択（1ヶ月〜）", ex="1ヶ月", err=["E02"],
         d="契約種別＝お試しキャンペーンのときだけ入力できる。既定は1ヶ月。顧客は編集できない（運営だけ）。この月数ぶんだけ子契約を作る。", cond="契約種別＝お試しキャンペーンのときだけ活性"),
    dict(no="9.6", ja="お試しの延長", lab="お試しの延長", kind="btn", sel=".f button::お試しを延長する", err=["Q109", "S106", "E111", "E112", "I107", "I109"],
         d=D("運営だけ。お試しキャンペーンの契約のとき、延長する月数（上限なし）を入れて延長する。編集の画面でだけ押せる。詳細では非活性（理由「編集画面で押せます」をボタンの横に出す）。押すとダイアログ（状態 017）。このダイアログは、押して確認すると別の操作としてすぐに保存される（画面の「保存」とは別。台帳 F の「保存は画面の保存1つ」に対する提案で、hong 確認待ち）。編集の画面でだけ押せる。編集中の入力が未保存のときはボタンを非活性にし、理由「編集中の内容を先に保存してください」（E104）を出す。契約種別がお試しキャンペーンでないときは非活性にして理由 I109（取消の拠点は I107）をボタンの横に出す。延長できないとき（親契約がない・状態など）は E111・E112。", "Chỉ vận hành. Với hợp đồng chiến dịch dùng thử, nhập số tháng gia hạn (không giới hạn trên) để gia hạn. Chỉ bấm được ở màn hình chỉnh sửa. Ở chi tiết bị vô hiệu (hiện lý do 「編集画面で押せます」 cạnh nút). Bấm sẽ mở hộp thoại (trạng thái 017). Hộp thoại này sau khi bấm xác nhận sẽ được lưu ngay như một thao tác riêng (khác với nút 「保存」 của màn hình; là đề xuất đối với quy tắc 「lưu bằng 1 nút lưu」 của sổ quyết định F, chờ hong xác nhận). Chỉ bấm được ở màn hình chỉnh sửa. Khi nội dung đang nhập chưa lưu thì nút bị vô hiệu kèm lý do 「編集中の内容を先に保存してください」 (E104). Khi loại hợp đồng không phải chiến dịch dùng thử thì vô hiệu và hiện lý do I109 (chi nhánh đã hủy là I107) cạnh nút. Khi không gia hạn được (không có hợp đồng cha, trạng thái, v.v.) thì E111・E112."),
         cond=D("プラン契約管理の編集権限（R/U 以上：フル権限・システム管理・CS）がある役割だけに表示。契約種別＝お試しキャンペーンのときだけ延長できる（編集の画面でだけ押せる）", "Chỉ hiển thị với vai trò có quyền chỉnh sửa quản lý hợp đồng plan (R/U trở lên: toàn quyền, quản trị hệ thống, CS). Chỉ gia hạn được khi loại hợp đồng = chiến dịch dùng thử (chỉ bấm được ở màn hình chỉnh sửa)"),
         ok="コードは本導入の契約でもボタンが出る。延長のダイアログの文言と表が「無料（DC000013）」のまま（宿題 S14）。仕様は延長の月もプラン料金を請求する"),
    dict(no="9.7", ja="代理店コード（紹介有無）", lab="代理店コード（紹介有無）", kind="select", req="－", len="選択（先頭「（紹介なし）」＋代理店マスタ）", ex="AG00021 株式会社パートナーズ",
         d="紹介は契約単位で発生するため、契約が持つ。法人Web には出さない。", ok=H_OPT),
    dict(no="9.8", ja="親契約番号（契約ID）", lab="親契約番号", kind="label", ro=True, d="CP＋連番（最小6桁）。契約変更・休止・再開をしても変わらない。入力できない。"),
    dict(no="9.9", ja="契約開始年月", lab="契約開始年月", kind="label", ro=True, d="開始サイクル月を「yyyy年m月」で出す。内部の契約開始日は開始サイクル月の初日を自動で入れる。入力できない。"),
    dict(no="9.10", ja="請求時備考（社内）", lab="請求時備考（社内）", kind="textarea", req="－", len="文字列 500（複数行）", ex="請求書は担当者あてに郵送",
         d="請求のときに社内で共有する備考。請求画面でも表示・編集できる。法人Web には出さず、請求書にも印字しない。", err=["E04", "E13"], ok=H_LAST + "。最大文字数の制御もない（宿題 S8）"),
]
CHILD_COLS = [
    ("10.2", "契約・サイクル月", "th::契約・サイクル月", "yyyy-mm。新しい月が上。"),
    ("10.3", "契約終了予定月", "th::契約終了予定月", ""),
    ("10.4", "子契約ID", "th::子契約ID", "CP0000001-202703 の形。クリックで子契約の詳細（AW_CONT）を開く（編集中なら Q02）。取消の子契約は灰色で出し、詳細は取消の帯（I15）つきの参照のみで開く。"),
    ("10.5", "プラン名", "th::プラン名", ""),
    ("10.6", "契約ステータス（親契約より）", "th::契約ステータス（親契約より）", "親契約の状態を表示する。"),
    ("10.7", "配送区分", "th::配送区分", "COOL便／ES配送便。"),
    ("10.8", "納品回数", "th::納品回数", ""),
    ("10.9", "請求月", "th::請求月", "サイクル月＋請求書発行リードタイム。「前払い」の語は出さない（台帳 B）。"),
    ("10.10", "当月請求額", "th::当月請求額", D("子契約の合計（税抜）。右寄せ。契約_02 の子契約一覧の「当月請求額」と同じ基準（固定額の合計・税抜）。", "Tổng các hợp đồng con (chưa gồm thuế). Căn phải. Cùng cơ sở với 「当月請求額」 trong danh sách hợp đồng con của 契約_02 (tổng số tiền cố định, chưa thuế).")),
    ("10.11", "請求ステータス", "th::請求ステータス", D("運営は 未確定／確定／請求済 の3つ（台帳 F 運営A Q-C3）。前払い・後払いの別は出さない（台帳 B）。", "Vận hành có 3 giá trị: 未確定 (chưa xác định) / 確定 (đã xác định) / 請求済 (đã lập yêu cầu thanh toán) (sổ quyết định F vận hành A Q-C3). Không hiện phân biệt trả trước / trả sau (sổ quyết định B).")),
    ("10.12", "生成方法", "th::生成方法", "日次バッチ／手動生成／年一括。手で作った行は「手動生成」の印で見分ける。法人Web には出さない。"),
]
EQUIP_COLS = [
    ("11.5", "貸出ID", "th::貸出ID", "LN-0001 の形。この一覧は見るだけ。貸出・追加・回収の登録は子契約の「設備の異動」で行い、結果がここに出る。"),
    ("11.6", "設備区分", "th::設備区分", "冷蔵庫／冷凍庫／自販機／電子レンジ／ホットウォーマー／資材ボックス。"),
    ("11.7", "機種", "th::機種", "機種IDと機種名（RF／FZ／VM／MW／HW／BX＋6桁）。"),
    ("11.8", "個体番号", "th::個体番号", "資産番号・シリアル。空欄でもよい。"),
    ("11.9", "貸出数", "th::貸出数", "貸した数。資材ボックスのように員数で管理するものは2以上になる。"),
    ("11.10", "返却済数", "th::返却済数", ""),
    ("11.11", "未返却数", "th::未返却数", "貸出数 − 返却済数。0になるまで貸出は終わらない。"),
    ("11.12", "貸出日", "th::貸出日", "設置した日。ここから機種ごとの最低利用期間を数える。移行データでは空欄のことがあり、「貸出日 未入力」と出す。"),
    ("11.13", "返却予定日", "th::返却予定日", "解約・休止（引き揚げる）の承認などで自動で立てる。"),
    ("11.14", "返却日", "th::返却日", "実際に返ってきた日。"),
    ("11.15", "貸出ステータス", "th::貸出ステータス", D(D("配送中／貸出中／回収依頼中／回収済／未返却。回収済は既定で隠す。解約を承認すると「回収依頼中」になる（「回収予定」は回収依頼中と同じ値で、回収依頼中だけを使う・台帳 M-3、2026-10-06 台帳 F）。", "Giao hàng / đang cho mượn / đang yêu cầu thu hồi / đã thu hồi / chưa trả. Đã thu hồi mặc định ẩn. Khi phê duyệt hủy hợp đồng thì chuyển thành 「回収依頼中」 (「回収予定」 là cùng giá trị với 「回収依頼中」, chỉ dùng 「回収依頼中」; sổ quyết định M-3, F 2026-10-06)."), "Giao hàng / đang cho mượn / đang yêu cầu thu hồi / đã thu hồi / chưa trả. Đã thu hồi mặc định ẩn. Khi phê duyệt hủy hợp đồng thì chuyển thành 「回収依頼中」 (「回収予定」 là cùng giá trị với 「回収依頼中」, chỉ dùng 「回収依頼中」; sổ quyết định M-3, F 2026-10-06).")),
    ("11.16", "回収理由", "th::回収理由", "解約／休止／機種変更／故障交換。"),
    ("11.17", "最低利用期間の満了日", "th::最低利用期間の満了日", "貸出日＋機種マスタの最低利用期間−1日。休止中はカウントを止める。"),
    ("11.18", "違約金の判定", "th::違約金の判定", "発生する／発生しない。この設備の満了日で判定する。"),
    ("11.19", "備考", "th::備考", "設置位置・搬入の注意など。"),
    ("11.20", "最終更新", "th::最終更新", "どの子契約の異動で最後に動いたか。"),
]
OPT_COLS = [
    ("12.2", "子契約ID", "th::子契約ID", "今のサイクル月の子契約。"),
    ("12.3", "区分", "th::区分", "オプション／値引き。"),
    ("12.4", "コード・名称", "th::コード・名称", "オプションマスタ・値引きマスタのコードと名称。"),
    ("12.5", "数量", "th::数量", ""),
    ("12.6", "金額・率", "th::金額・率", D("請求は＋、値引きは−。金額は（税抜）の円、率のときは％。右寄せ。", "Tính phí là +, giảm giá là −. Số tiền là yên (chưa thuế), nếu là tỷ lệ thì %. Căn phải.")),
    ("12.7", "適用開始月", "th::適用開始月", "このサイクル月から。"),
    ("12.8", "適用終了月", "th::適用終了月", "空欄＝続く。"),
]
BILL = [
    dict(no="13.1", ja="請求先", lab="請求先", kind="select", req="○", len="選択（法人／この拠点）", ex="この拠点",
         d=D("この項目だけが正（法人側には請求先を持たせない）。この値で、下の支払方法・支払サイクル・Bill One 発行先ID・リードタイムの上書きの活性が切り替わる。法人なしの拠点は「この拠点」で変更できない。拠点から変更を申請でき、運営の承認が必須。変更は「まだ作っていないサイクル月から」効く（生成済みの子契約は変わらない・契約_01 §2）。承認待ちの変更申請があるときは、この項目の直接編集を止める（台帳 K・状態 052）。", "Chỉ mục này là đúng (phía pháp nhân không giữ bên nhận hóa đơn). Giá trị này quyết định các mục bên dưới (phương thức thanh toán, chu kỳ thanh toán, ID nơi phát hành Bill One, ghi đè thời gian chuẩn bị) được kích hoạt hay không. Chi nhánh không có pháp nhân thì không đổi khỏi 「この拠点」. Chi nhánh có thể gửi yêu cầu thay đổi và bắt buộc vận hành phê duyệt. Thay đổi có hiệu lực 「từ tháng chu kỳ chưa tạo」 (hợp đồng con đã tạo không đổi; 契約_01 §2). Khi có yêu cầu thay đổi đang chờ phê duyệt thì dừng chỉnh sửa trực tiếp mục này (sổ quyết định K; trạng thái 052)."), err=["E02"],
         ok="コードは法人なしの拠点でも請求先を変えられる（宿題 S11）。仕様が正"),
    dict(no="13.2", ja="請求書発行リードタイムの上書き", lab="請求書発行リードタイムの上書き", kind="select", req="条件付き", len="選択（3ヶ月前（−3）／2ヶ月前（−2）／1ヶ月前（−1）／当月（0）／翌月（+1））", ex="当月（0）",
         d=D("空欄＝法人の設定に従う。法人なしの拠点は必須。リードタイムを変えて固定額の請求月が重なる・抜ける月があるときは W101（モーダル）を出す。変更は「まだ作っていないサイクル月から」効く（生成済みの子契約は変わらない・契約_01 §2）。", "Để trống = theo thiết lập của pháp nhân. Chi nhánh không có pháp nhân thì bắt buộc. Nếu đổi thời gian chuẩn bị làm tháng yêu cầu số tiền cố định bị trùng / thiếu thì hiện W101 (modal). Thay đổi có hiệu lực 「từ tháng chu kỳ chưa tạo」 (hợp đồng con đã tạo không đổi; 契約_01 §2)."), cond="請求先＝この拠点のときだけ活性", err=["E02", "W101"],
         ok=D("コードの選択肢は「翌月（+1・後払い）」（宿題 S13：前払い・後払いの語を出さない）。W101 のモーダルがない（宿題 S15・根拠：Message List No.63。台帳に行なし）。この状態は見本データでは作れない（図だけ）", "Lựa chọn trong code là 「翌月（+1・後払い）」 (宿題 S13: không dùng từ trả trước / trả sau). Không có modal W101 (宿題 S15; căn cứ: Message List No.63; sổ quyết định không có dòng). Trạng thái này không tạo được bằng dữ liệu mẫu (chỉ có hình minh họa)")),
    dict(no="13.3", ja="支払方法", lab="支払方法", kind="select", req="条件付き", len="選択（口座振替／銀行振込／クレジットカード）", ex="口座振替", cond="請求先＝この拠点のときだけ活性（法人のときは保存もしない）", err=["E02"],
         d=D("変更は、まだ確定していない（未確定の）子契約まで書き換える。確定済みの子契約は変えない（契約_01 §2）。承認待ちの変更申請があるときは直接編集を止める（台帳 K・状態 052）。", "Thay đổi được ghi đè đến các hợp đồng con chưa xác định. Hợp đồng con đã xác định không đổi (契約_01 §2). Khi có yêu cầu thay đổi đang chờ phê duyệt thì dừng chỉnh sửa trực tiếp (sổ quyết định K; trạng thái 052).")),
    dict(no="13.4", ja="口座振替の手続きステータス", lab="口座振替の手続きステータス", kind="select", req="条件付き", len="選択（未手続き／手続き中／完了）", ex="手続き中", err=["E02"],
         d="運営が支払方法を口座振替に変えたときに使う。完了になるまでは請求書にお振込と印字して振込先を載せる（請求は止めない）。", cond="請求先＝この拠点 かつ 支払方法＝口座振替のときだけ活性"),
    dict(no="13.5", ja="支払サイクル", lab="支払サイクル", kind="select", req="条件付き", len="選択（月払い／年払い）", ex="年払い", cond="請求先＝この拠点のときだけ活性", err=["E02"],
         d=D("変更は、まだ確定していない（未確定の）子契約まで書き換える。確定済みの子契約は変えない（契約_01 §2）。承認待ちの変更申請があるときは直接編集を止める（台帳 K・状態 052）。", "Thay đổi được ghi đè đến các hợp đồng con chưa xác định. Hợp đồng con đã xác định không đổi (契約_01 §2). Khi có yêu cầu thay đổi đang chờ phê duyệt thì dừng chỉnh sửa trực tiếp (sổ quyết định K; trạng thái 052).")),
    dict(no="13.6", ja="起算月（年払いのとき）", lab="起算月（年払いのとき）", kind="select", req="条件付き", len="選択（年月 yyyy-mm）", ex="2026-04", cond="請求先＝この拠点 かつ 支払サイクル＝年払いのときだけ活性", err=["E02"]),
    dict(no="13.7", ja="入金期限", lab="入金期限", kind="select", req="条件付き", len="選択（請求月の27日／請求月の翌月27日）", ex="請求月の27日",
         d=D("固定額の分も実績精算の分も、1枚の請求書に入金期限は1つ。口座振替・クレジットの引き落とし日もこの日付。", "Dù là phần số tiền cố định hay phần quyết toán thực tế, mỗi hóa đơn chỉ có 1 hạn thanh toán. Ngày trích nợ chuyển khoản tự động / thẻ tín dụng cũng là ngày này."), cond="請求先＝この拠点のときだけ活性", err=["E02"]),
    dict(no="13.8", ja="Bill One 発行先ID", lab="Bill One 発行先ID", kind="text", req="条件付き", len="文字列 60", ex="BO-00671", cond="請求先＝この拠点のときだけ活性", err=["E01", "E04"]),
]
INV_COLS = [
    ("14.2", "請求書番号", "th::請求書番号", D("請求書番号を押すと、押した請求書の詳細（運営E の請求書。画面コードは運営E の設計書ができたら入れる）を開く。拠点の画面から開いたときは、その拠点の分だけを出す。法人でまとめて発行しているときは、同じ請求書番号が他の拠点にも出る。", "Bấm số hóa đơn sẽ mở chi tiết hóa đơn đã bấm (hóa đơn của vận hành E; mã màn hình sẽ ghi khi có tài liệu thiết kế vận hành E). Khi mở từ màn hình chi nhánh thì chỉ hiện phần của chi nhánh đó. Khi phát hành gộp theo pháp nhân thì cùng số hóa đơn cũng hiện ở các chi nhánh khác.")),
    ("14.3", "発行日", "th::発行日", "前月25日に確定 → 請求月の1日に Bill One で発行する。"),
    ("14.4", "請求月", "th::請求月", "この請求書の請求月（その月の1日に発行）。"),
    ("14.5", "固定額", "th::固定額", "この拠点の固定額の分（税抜）。右寄せ。"),
    ("14.6", "固定額の対象", "th::前払いの対象", "固定額の分の契約・サイクル月。"),
    ("14.7", "実績精算", "th::実績精算（", "この拠点の実績精算の分（税抜）。右寄せ。"),
    ("14.8", "実績精算の対象", "th::実績精算の対象", "実績精算の分の対象期間。"),
    ("14.9", "消費税", "th::消費税", "この拠点の分の消費税（税率ごと）。"),
    ("14.10", "この拠点の請求金額（税込）", "th::この拠点の請求金額", "固定額＋実績精算＋消費税。まとめて発行のときは、請求書全体ではなくこの拠点の分だけを出す。"),
    ("14.11", "入金期限", "th::入金期限", "この請求書の支払期限。1枚に1つ。"),
    ("14.12", "請求書ステータス", "th::請求書ステータス", D("状態名は運営E の請求書一覧と同じ名前にする（運営A Q7）。未確定／確定／請求済（「入金済・未入金」は出さない。台帳 E 法人Web と揃える・台帳 F）。取消済・繰越済・再請求の行の見せ方（バッジ）は運営E の設計に合わせる。", "Tên trạng thái dùng giống danh sách hóa đơn của Vận hành E (vận hành A Q7): 未確定 / 確定 / 請求済 (đã lập yêu cầu thanh toán) (không hiện 「入金済・未入金」, khớp Web pháp nhân sổ quyết định E và F). Cách hiển thị các dòng đã hủy / chuyển kỳ sau / yêu cầu lại (badge) theo thiết kế vận hành E.")),
]
FILES_PUB = [
    dict(no="15.1", ja="搬入経路資料（顧客向け）", lab="搬入経路資料（顧客向け）", kind="file", req="－", len="ファイル（JPG・PNG・PDF・HEIC。1件5MB・10件まで）", ex="搬入経路図_本社.pdf",
         d="法人・拠点に公開する搬入経路図・マニュアル。表示・ダウンロード（DL）できる。", err=["E11", "E119"]),
    dict(no="15.2", ja="設置場所写真", lab="設置場所写真", kind="file", req="－", len="ファイル（JPG・PNG・PDF・HEIC。1件5MB・10件まで）", ex="設置場所_8F.jpg", d=D("設置場所がわかる写真。法人・拠点に公開する。", "Ảnh cho biết vị trí lắp đặt. Công khai cho pháp nhân / chi nhánh."), err=["E11", "E119"]),
    dict(no="15.3", ja="申込時の添付資料", lab="申込時の添付資料", kind="label", ro=True, d="ファイル名／形式／容量／登録日。表示・ダウンロードだけ。"),
]
FILES_INT = [
    dict(no="16.1", ja="搬入経路資料（委託配送先向け・非公開）", lab="搬入経路資料（委託配送", kind="file", req="－", len="ファイル（JPG・PNG・PDF・HEIC。1件5MB・10件まで）", ex="拠点マニュアル_本社_配送用.pdf",
         d="委託配送先の拠点マニュアル。法人には公開しない。アップロードの経路・管理を分ける。", err=["E11", "E119"], ok="コードの項目名は「委託配送会社向け」（台帳は「委託配送先」）"),
    dict(no="16.2", ja="運営側の追加資料", lab="運営側の追加資料", kind="file", req="－", len="ファイル（JPG・PNG・PDF・HEIC。1件5MB・10件まで）", ex="設置報告書_20260401.pdf", d="運営がファイルを追加・削除する。法人には出さない。", err=["E11", "E119"]),
]
APPLY_COLS = [
    ("17.1", "受付番号", "th::受付番号", "CH-yyyymmdd-nnnn（変更申請）／AP-…（新規申込）。"),
    ("17.2", "申請の種類", "th::申請の種類", "プランの変更／配送の変更／設備の変更／拠点情報の変更／法人情報の変更／休止／再開／解約。"),
    ("17.3", "申請日", "th::申請日", "法人Webで送信した日時。"),
    ("17.4", "申請者", "th::申請者", "「氏名（法人アカウント／拠点アカウント）」の形。"),
    ("17.5", "開始サイクル月", "th::開始サイクル月", "オーダー締切のルールで決まる。"),
    ("17.6", "申請内容", "th::申請内容", "変更前・変更後の要約。"),
    ("17.7", "承認状態", "th::承認状態", "承認待ち／承認済／却下／取り下げ済み。拠点ごとに持つ。"),
    ("17.8", "承認者・承認日時", "th::承認者・承認日時", "運営の担当者名が出るため法人Web には出さない。"),
    ("17.9", "却下理由", "th::却下理由", ""),
    ("17.10", "取り下げ日時", "th::取り下げ日時", ""),
]
HIST_COLS = [
    ("18.1", "日時", "th::変更日時", "日時 yyyy-mm-dd HH:MM。新しいものが上。"),
    ("18.2", "操作した人", "th::変更者", "アカウント名（ID 併記。例：運営 井上（Ad00010））。"),
    ("18.3", "操作", "-", D("登録／変更／CSV取込で更新／一括変更／アカウント操作（パスワード再設定・ログイン案内の再送・停止・再開）／子契約を先まで作る／お試しの延長。削除はない（運営A Q1）。", "Đăng ký / thay đổi / cập nhật bằng nhập CSV / thay đổi hàng loạt / thao tác tài khoản (đặt lại mật khẩu, gửi lại hướng dẫn đăng nhập, dừng, mở lại) / tạo trước hợp đồng con / gia hạn dùng thử. Không có xóa (vận hành A Q1).")),
    ("18.4", "項目", "-", D("変わった項目名。拠点の項目と親契約の項目を区別するため、先頭に「拠点／」「親契約／」を付ける。1回の操作で複数の項目が変わったときは、項目・変更前・変更後を同じ順で1つのセルに改行して並べる（1操作＝1行）。", "Tên mục thay đổi. Để phân biệt mục của chi nhánh và mục của hợp đồng cha, thêm 「拠点／」 hoặc 「親契約／」 ở đầu. Khi một thao tác đổi nhiều mục thì mục / trước khi đổi / sau khi đổi được xuống dòng trong cùng 1 ô theo cùng thứ tự (1 thao tác = 1 dòng).")),
    ("18.5", "変更前", "-", ""),
    ("18.6", "変更後", "-", ""),
    ("18.7", "理由", "-", "あれば。承認が要る変更のときは、承認者・通知もここに入る。"),
]


def spec_sel(f):
    if f.get("sel"):
        return f["sel"]
    return fsel(f["lab"])


def view_item(f):
    """詳細（表示だけ）の項目"""
    kind = "button" if f["kind"] == "btn" else ("button" if f["kind"] == "file" else "label")
    kw = {}
    if f.get("d"):
        kw["detail"] = f["d"] if f["kind"] in ("label", "btn") or f.get("ro") else "表示だけ。" + f["d"]
    else:
        kw["detail"] = "表示だけ。入力の決まりは AW_BRCH_003 の %s。" % f["no"]
    if f["kind"] == "file":
        kw["detail"] = "表示・ダウンロード（DL）だけ。アップロード・削除は編集（AW_BRCH_003 の %s）。" % f["no"]
    for k in ("err", "cond", "open", "ask"):
        if f.get(k) and f["kind"] == "btn":
            kw[k] = f[k]
    if f.get("open"):
        kw["open"], kw["ask"] = f["open"], f.get("ask", "hong")
    if f.get("ok"):
        kw["demo_ok"] = f["ok"]
    return F(f["no"], f["ja"], spec_sel(f), kind, "click" if kind == "button" else "view", **kw)


def edit_item(f):
    """編集（入力できる）の項目"""
    k = f["kind"]
    if f.get("ro") or k == "label":
        return F(f["no"], f["ja"], spec_sel(f), "label", detail=f.get("d", "") or "入力できない（表示だけ）。", **({"demo_ok": f["ok"]} if f.get("ok") else {}))
    if k == "btn":
        return view_item(f)
    kw = {}
    if f.get("req"):
        kw["req"] = f["req"]
    if f.get("len"):
        kw["len"] = f["len"]
    kw["ex"] = f.get("ex", "")
    kw["init"] = f.get("init", "保存済みの値")
    for a, b in (("d", "detail"), ("v", "valid"), ("cond", "cond"), ("ok", "demo_ok"), ("open", "open"), ("ask", "ask")):
        if f.get(a):
            kw[b] = f[a]
    if f.get("err"):
        kw["err"] = f["err"]
    trig = {"text": "input", "textarea": "input", "select": "select", "date": "input", "file": "upload"}.get(k, "input")
    return F(f["no"], f["ja"], spec_sel(f), k, trig, **kw)


CONTRACT_TYPE_ITEMS = [
    F("9.11", "本導入に切り替える", "-", "button", "click", cond=CAN_CU, err=["Q01", "S108", "I106", "I107", "I102", "E30", "E32"],
      detail=D("契約種別の「切替」操作（編集の項目とは別・詳細に置き、押して確認するとただちに保存される・Claude 提案・hong 承認済み方向）。お試しキャンペーン→本導入だけ。お試しキャンペーン以外のときは I106、取消の拠点は I107 で非活性にし、理由をボタンの横に出す。「契約種別」の真下に、欄の名前「契約種別の切替」として置く。確認の小窓（Q01・状態 063）で、お試しキャンペーン割引が付かなくなり、本導入の開始日から最低利用期間・違約金を数えることを見せる。実行すると S108、親契約の「契約種別の履歴」に1行足す（契約_01 §6-1）。", "Thao tác 「chuyển đổi」 loại hợp đồng (tách khỏi mục chỉnh sửa; đặt ở chi tiết, bấm xác nhận thì được lưu ngay; Claude đề xuất, hướng đã được hong chấp thuận). Chỉ từ chiến dịch dùng thử sang triển khai chính thức. Nếu không phải chiến dịch dùng thử thì vô hiệu và hiện lý do I106, chi nhánh đã hủy thì I107, hiện lý do cạnh nút. Đặt ngay dưới 「契約種別」 với tên mục 「契約種別の切替」. Hộp thoại xác nhận (Q01; trạng thái 063) cho thấy giảm giá chiến dịch dùng thử không còn áp dụng và thời gian sử dụng tối thiểu / phí vi phạm được tính từ ngày bắt đầu triển khai chính thức. Thực hiện xong hiện S108 và thêm 1 dòng vào 「契約種別の履歴」 của hợp đồng cha (契約_01 §6-1)."),
      demo_ok=D("コードにない（宿題）。台帳 F 2026-10-06 最後の open(3)", "Chưa có trong code (宿題). Sổ quyết định F 2026-10-06 open cuối (3)")),
    F("9.12", "契約種別の履歴", "-", "area", detail=D("親契約の契約種別の履歴（表示だけ）。切替のたびに1行足す。新しいものが上。今の行には「現在」のバッジを付け、見出しの件数のチップは行数と同じ。", "Lịch sử loại hợp đồng của hợp đồng cha (chỉ xem). Mỗi lần chuyển đổi thêm 1 dòng. Mới nhất ở trên. Dòng hiện tại có badge 「現在」, số trên chip tiêu đề bằng số dòng."), demo_ok=D("コードにない（宿題）。台帳 F 2026-10-06 最後の open(3)", "Chưa có trong code (宿題). Sổ quyết định F 2026-10-06 open cuối (3)")),
    F("9.13", "契約種別（履歴）", "-", "label", detail=D("お試しキャンペーン／本導入。", "Chiến dịch dùng thử / triển khai chính thức.")),
    F("9.14", "開始（履歴）", "-", "label", len="年月日 yyyy-mm-dd", detail=D("その契約種別になった日。本導入の開始日から最低利用期間・違約金を数える。", "Ngày chuyển sang loại hợp đồng đó. Thời gian sử dụng tối thiểu / phí vi phạm được tính từ ngày bắt đầu triển khai chính thức.")),
    F("9.15", "終了（履歴）", "-", "label", len="年月日 yyyy-mm-dd", detail=D("次の契約種別に切り替えた日の前日。今の契約種別は空欄。", "Ngày trước ngày chuyển sang loại hợp đồng tiếp theo. Loại hợp đồng hiện tại để trống.")),
]


# ---------------------------------------------------------------- 詳細（AW_BRCH_002）のタブごと
def staff_view():
    return [F("7", "担当者", ".ch::担当者^", "area", detail="拠点の担当者（メイン担当者・請求担当者・サブ担当者）。メイン1名・請求1名は必須。")] + [
        F(n, ja, sel, "label", detail=(dt or "表示だけ。")) for (n, ja, sel, kd, rq, ln, ex, dt, er) in STAFF_COLS]


def staff_edit():
    out = [F("7", "担当者", ".ch::担当者^", "area", pattern="P-FORM", err=["E103", "E108"],
             detail="担当者の表。1行1人。行を追加・削除できる。保存のとき、メイン担当者・請求担当者が1名ずつ入っていなければ E103（ページ内メッセージエリア）。",
             demo_ok="コードは担当者の必須・メール形式・カナ・文字数のチェックがない（宿題 S8）。仕様が正")]
    for (n, ja, sel, kd, rq, ln, ex, dt, er) in STAFF_COLS:
        out.append(F(n, ja, sel, kd, "select" if kd == "select" else "input", req=rq, len=ln, ex=ex, init="保存済みの値", detail=dt or None, err=er))
    out += [F("7.6", "行を追加", ".card button::行を追加", "button", "click", detail="空の行を1行足す。"),
            F("7.7", "行の削除", ".card .del", "button", "click", detail="その行を消す（ゴミ箱）。メイン担当者・請求担当者の行を消して0名になると、保存のとき E103。")]
    return out


V_DETAIL_BASIC = ([] + D_HEADER + SUM + TABS + TOOLS
                  + [card("5", "基本情報", detail="拠点の基本情報。項目の決まりは AW_BRCH_003 の 5 を参照（ここは表示だけ）。")] + [view_item(f) for f in BASIC]
                  + [card("6", "住所", detail="請求書・配送に使う拠点の住所。項目の決まりは AW_BRCH_003 の 6 を参照（ここは表示だけ）。")] + [view_item(f) for f in ADDR if f["no"] != "6.2"]
                  + [F("5.12", "所属法人の付け替え", "-", "button", "click", cond=D("システム管理の役割だけに表示", "Chỉ hiển thị với vai trò quản trị hệ thống"), err=["Q01", "S107", "I102", "I105", "I107", "I13", "I14", "E30", "E32"],
                       detail=D("編集の項目とは別の操作（編集の画面・画面の「保存」には含めない）。詳細に置き、押して確認すると、その場でただちに保存される（Claude 提案・hong 承認済み方向）。使える拠点＝発行済み・確定済みの請求書がなく、承認待ちの申請もない拠点だけ。そうでないときはボタンを非活性にして、理由（請求書がある＝I105／承認待ちの申請がある＝I102／取消の拠点＝I107／閉鎖の拠点＝I13）をボタンの横に出す。押すと確認の小窓（Q01・状態 060）で、新しい所属法人・影響（請求先・請求条件は新しい法人のものに直す・変更履歴に残る）を見せる。実行すると S107、変更履歴（P-HIST）に「操作＝付け替え」の行を残す。", "Thao tác riêng, tách khỏi các mục chỉnh sửa (không nằm trong màn hình chỉnh sửa và nút 「保存」). Đặt ở chi tiết, bấm rồi xác nhận thì được lưu ngay (Claude đề xuất, hướng đã được hong chấp thuận). Chỉ dùng cho chi nhánh không có hóa đơn đã phát hành / đã chốt và không có yêu cầu chờ phê duyệt. Nếu không thì vô hiệu nút và hiện lý do cạnh nút (có hóa đơn = I105 / có yêu cầu chờ phê duyệt = I102 / chi nhánh đã hủy = I107 / chi nhánh đã đóng = I13). Bấm sẽ mở hộp thoại xác nhận (Q01; trạng thái 060) cho thấy pháp nhân mới và ảnh hưởng (bên nhận hóa đơn và điều kiện thanh toán đổi theo pháp nhân mới; lưu lịch sử). Thực hiện xong hiện S107 và ghi dòng 「thao tác = 付け替え」 vào lịch sử thay đổi (P-HIST)."),
                       demo_ok=D("コードにない（宿題）。台帳 F 2026-10-06 最後の open(2)", "Chưa có trong code (宿題). Sổ quyết định F 2026-10-06 open cuối (2)"))]
                  + staff_view()
                  + [card("8", "アカウント", detail="拠点アカウントの状態と操作。操作は拠点の編集の権限がある役割だけに出す（運営A Q9）。")] + [view_item(f) for f in ACCT])

# ================================================================ 状態
V_DETAIL = [
    {"id": "008", "code": "AW_BRCH_002", "state": ["基本情報タブ（本登録・請求先＝法人）", ""], "url": "/ops/branches/CU00643", "setup": "", "full": True, "wait": 700,
     "note": ["見本 CU00643 株式会社サンプル 本社（本登録・請求先＝法人）。「アカウント」のステータス・再送・停止、「住所」の設置フロアは決定済みだがコードにない（demo_ok）。", ""],
     "items": V_DETAIL_BASIC},
    {"id": "009", "code": "AW_BRCH_002", "state": ["契約タブ（親契約・子契約一覧・「子契約を先まで作る」）", ""], "url": "/ops/branches/CU00643?tab=" + "契約", "setup": "", "full": True, "wait": 600,
     "note": ["「子契約を先まで作る」は詳細では非活性（編集の画面で押せる）。", ""],
     "items": [card("9", "親契約", detail="拠点の親契約。項目の決まりは AW_BRCH_003 の 9 を参照（ここは表示だけ）。保存の権限は契約管理（運営A Q3）。")]
     + [view_item(f) for f in CONTRACT]
     + CONTRACT_TYPE_ITEMS
     + [card("10", "一覧（子契約）", detail="この拠点の子契約（サイクル月ごと）。新しい月が上。休止期間は帯の行を1行はさむ。"),
        F("10.1", "子契約を先まで作る", ".f button::子契約を先まで作る", "button", "click", err=["Q108", "E110", "S105", "E112", "E104"],
          cond=D("プラン契約管理の作成権限（CRUD：フル権限・システム管理）がある役割だけに表示。編集の画面で押せる（詳細では非活性・理由「編集画面で押せます」をボタンの横に出す）", "Chỉ hiển thị với vai trò có quyền tạo quản lý hợp đồng plan (CRUD: toàn quyền, quản trị hệ thống). Bấm được ở màn hình chỉnh sửa (vô hiệu ở chi tiết; hiện lý do 「編集画面で押せます」 cạnh nút)"),
          detail=D("一覧の上のボタン1つ。押すとダイアログ（状態 018）を開く（編集の画面でだけ。未保存の入力があるときは非活性・E104）。使うのは、本導入で数ヶ月先のプラン変更に備えるときと、お試しキャンペーンを複数月にするときだけ。年一括は12サイクル分を自動で作るので使わない。", "Bấm sẽ mở hộp thoại (trạng thái 018) (chỉ ở màn hình chỉnh sửa; vô hiệu khi có nội dung chưa lưu, E104). Chỉ dùng khi chuẩn bị đổi plan vài tháng sau với triển khai chính thức, hoặc khi làm chiến dịch dùng thử nhiều tháng. Thanh toán theo năm tự tạo 12 chu kỳ nên không dùng."))]
     + [F(n, ja, sel, "label", detail=dt or None) for (n, ja, sel, dt) in CHILD_COLS]
     + [PL("10.13", "子契約", "hợp đồng con", "請求ステータス", "trạng thái thanh toán")]},
    {"id": "010", "code": "AW_BRCH_002", "state": ["契約タブ：休止の帯（休止予定→10/12 以降は休止中）", ""], "url": "/ops/branches/CU00902?tab=契約", "today": "2026/10/12", "setup": "", "full": True, "wait": 600,
     "note": ["見本 CU00902 は日付が 2026-10-12 以降のとき休止中になり、休止の帯が出る（デモの日付を 10/12 にして撮る）。", ""],
     "items": [
         F("26", "休止期間の帯", "tr.band", "area", detail="休止中のサイクル月は子契約がないため、一覧のサイクル月の並びの位置に帯の行を1行はさむ。状態（休止予定／休止中／再開済）・休止期間（開始〜終了のサイクル月とサイクル数）・再開予定のサイクル月・休止理由・休止中の設備（引き揚げる／置いたまま）を出す。拠点が休止中・休止予定のときだけ出す。",
           ),
     ]},
    {"id": "011", "code": "AW_BRCH_002", "state": ["設備・オプションタブ（貸出・オプション表）", ""], "url": "/ops/branches/CU00643?tab=設備・オプション", "setup": "", "full": True, "wait": 600,
     "items": [card("11", "貸出一覧", detail="拠点に貸している設備。見るだけ（貸出・追加・回収は子契約の「設備の異動」で登録する）。"),
               F("11.1", "回収未完了（アラート）", fsel("回収未完了（アラート）"), "label", detail="返却予定日が今日より前で未返却数が0より多い貸出を日次バッチで見つけた件数。運営の一覧に出る。"),
               F("11.2", "貸出ステータス（絞り込み）", ".f button::回収済も表示", "select", "select", req="－",
                 len=["選択（回収済を除く／すべて／配送中／貸出中／回収依頼中／未返却／回収済）", "Chọn (trừ đã thu hồi / tất cả / đang giao / đang mượn / yêu cầu thu hồi / chưa trả / đã thu hồi)"], init=["回収済を除く（既定）", "Trừ đã thu hồi (mặc định)"], ex="回収済",
                 detail=D("表の上のドロップダウンで絞り込む（台帳 F 詳細の表の絞り込み・受付簿 #152。機種マスタの貸出中の拠点 AW_MODL 12.2 と同じ形）。既定は「回収済を除く」で、いま貸しているものだけを見せる。「回収済も表示」のトグルボタンは置かない。", "Lọc bằng dropdown phía trên bảng (sổ quyết định F lọc bảng ở chi tiết, 受付簿 #152; cùng dạng với AW_MODL 12.2 chi nhánh đang mượn của master model). Mặc định 「回収済を除く」, chỉ hiện những thiết bị đang cho mượn. Không đặt nút toggle 「回収済も表示」."),
                 demo_ok="コードは「回収済も表示」のトグルボタン（台帳 F 詳細の表の絞り込み：トグルは使わない・ドロップダウンに直す）"),
               F("11.3", "貸出中 合計", fsel("貸出中 合計"), "label", len="件数＋内訳", detail="配送中・貸出中・回収依頼中の未返却数の合計。いま何台預けているか。"),
               F("11.4", "未返却 合計", fsel("未返却 合計"), "label", detail="返却予定日を過ぎても返ってきていない数の合計。")]
     + [F(n, ja, sel, "label", detail=dt or None)
          for (n, ja, sel, dt) in EQUIP_COLS]
     + [PL("11.21", "貸出一覧", "danh sách cho mượn", "貸出ステータス（11.2）", "trạng thái cho mượn (11.2)")]
     + [card("12", "オプション・割引（今のサイクル月）", detail="今のサイクル月の子契約が持つオプション・値引きの表。ここでは変更しない。"),
        F("12.1", "子契約で変更する", ".f button::子契約で変更する", "button", "click", err=["E112"],
          detail="今のサイクル月の子契約の詳細の「設備・オプション」タブを開く（編集中なら Q02）。オプション・割引の追加・変更・終了はそこで登録する。子契約がまだないときは E112。")]
     + [F(n, ja, sel, "label", detail=dt or None) for (n, ja, sel, dt) in OPT_COLS]
     + [PL("12.9", "オプション・割引", "option / giảm giá", "区分（オプション／値引き）", "phân loại (option / giảm giá)")]},
    {"id": "012", "code": "AW_BRCH_002", "state": ["請求タブ（請求先＝法人：支払項目が非活性）", ""], "url": "/ops/branches/CU00643?tab=請求", "setup": "", "full": True, "wait": 600,
     "items": [card("13", "請求先と請求条件", detail="拠点の請求先と請求条件。項目の決まりは AW_BRCH_003 の 13 を参照（ここは表示だけ）。請求先＝法人のとき、支払方法・支払サイクル・入金期限・Bill One 発行先ID・リードタイムの上書きは「—」で非活性。")]
     + [view_item(f) for f in BILL]
     + [card("14", "一覧（この拠点の請求書）", detail="この拠点あての請求書。まとめて発行のときは、この拠点の分だけを出す。")]
     + [F(n, ja, sel, "label", detail=dt or None,
          **({"demo_ok": D("コードは「請求の確定」の一覧へ移るだけ（宿題 S22・根拠：契約_03 #14。台帳に行なし）。仕様が正", "Code chỉ chuyển sang danh sách 「請求の確定」 (宿題 S22; căn cứ: 契約_03 #14; sổ quyết định không có dòng). Spec đúng")} if n == "14.2" else {}),
          **({"demo_ok": "コードの列名は「固定額（前払い）」「前払いの対象」「実績精算（後払い）」（宿題 S13：前払い・後払いの語を出さない）。仕様が正"} if n in ("14.5", "14.6", "14.7") else {}))
        for (n, ja, sel, dt) in INV_COLS]
     + [PL("14.13", "この拠点の請求書", "hóa đơn của chi nhánh này", "請求書ステータス", "trạng thái hóa đơn")]},
    {"id": "013", "code": "AW_BRCH_002", "state": ["請求タブ（請求先＝この拠点・年払い）", ""], "url": "/ops/branches/CU00671?tab=請求", "setup": "", "full": True, "wait": 600,
     "note": ["見本 CU00671（請求先＝この拠点・銀行振込・年払い・起算月 2026-04）。支払項目が値で埋まる。", ""],
     "items": [F("27", "請求先＝この拠点のときの支払項目", ".ch::請求先と請求条件^", "area",
                 detail="請求先＝この拠点のとき、リードタイムの上書き・支払方法・支払サイクル・入金期限・Bill One 発行先ID が活性になり値が入る。年払いのときだけ起算月、口座振替のときだけ手続きステータスが活性。")]},
    {"id": "014", "code": "AW_BRCH_002", "state": ["資料・履歴タブ", ""], "url": "/ops/branches/CU00643?tab=資料・履歴", "setup": "", "full": True, "wait": 600,
     "items": [card("15", "添付資料（法人に公開）", detail="法人・拠点に公開する資料。表示・ダウンロードだけ。")] + [view_item(f) for f in FILES_PUB]
     + [card("16", "添付資料（社内のみ・非公開）", detail="社内だけの資料。法人には出さない。")] + [view_item(f) for f in FILES_INT]
     + [card("17", "申請履歴（法人Webからの変更申請）", detail="法人Web から出された変更申請の履歴。拠点ごとに承認状態を持つ。")]
     + [F(n, ja, sel, "label", detail=dt or None) for (n, ja, sel, dt) in APPLY_COLS]
     + [PL("17.11", "申請履歴", "lịch sử yêu cầu", "承認状態", "trạng thái phê duyệt")]
     + [card("18", "履歴（拠点・親契約）", pattern="P-HIST", detail="拠点・親契約の変更履歴（表示だけ）。1回の保存で変わった項目は1つの操作としてまとめる。新しいものが上。直せない・消せない。",
             demo_ok="コードは6列（変更日時・変更内容・変更者・適用範囲・承認者・通知の有無）で、適用範囲・承認者・通知は常に「—」（運営A Q4）。仕様は P-HIST の7列")]
     + [F(n, ja, sel, "label", detail=dt or None) for (n, ja, sel, dt) in HIST_COLS]
     + [PL("18.8", "履歴", "lịch sử", "操作", "thao tác")]},
    {"id": "015", "code": "AW_BRCH_002", "state": ["仮登録の拠点（「申請詳細で編集」・帯）", ""], "url": "/ops/branches/CU01012", "setup": "", "full": False, "wait": 600,
     "note": ["見本 CU01012（仮登録）。編集の画面（/edit）を直接開いても詳細の表示になる。", ""],
     "items": [
         F("19", "仮登録の帯", ".provbar", "label", err=["I100"], detail="仮登録中です（申請 AP-… の詳細情報設定中）。仮登録の間は、この画面では編集できない。編集は契約申請管理の申請詳細で行う。拠点を確定（本登録）すると、この画面で編集できる。"),
         F("19.1", "申請詳細で編集", ".pbtn button.save", "button", "click", cond="拠点の編集の権限がある役割だけに表示", detail=D("契約申請管理の申請詳細（詳細情報設定）を開く。「編集」のボタンの代わりに出す。画面コードは契約申請管理の設計書ができたら入れる。", "Mở chi tiết đơn ở 契約申請管理 (thiết lập thông tin chi tiết). Hiện thay cho nút 「編集」. Mã màn hình sẽ ghi khi có tài liệu thiết kế của 契約申請管理.")),
     ]},
    {"id": "016", "code": "AW_BRCH_002", "state": ["お試しの拠点（「お試しの延長」ボタン）", ""], "url": "/ops/branches/CU00975?tab=契約", "setup": "", "full": False, "wait": 700,
     "note": ["見本 CU00975（お試しキャンペーン・お試し期間 1ヶ月）。", ""],
     "items": [
         F("20", "お試しの拠点の親契約", ".ch::親契約^", "area", detail="契約種別＝お試しキャンペーン。お試し期間（月数）が入り、「お試しを延長する」で延長できる（運営だけ）。延長の月はプラン料金を請求する（お試しキャンペーン割引は付けない）。"),
         F("20.1", "お試しを延長する", ".f button::お試しを延長する", "button", "click", err=["Q109", "E111", "E112", "E104", "I107", "I109"], cond=CAN_CU,
           detail=D("詳細では非活性（理由「編集画面で押せます」をボタンの横に出す）。編集の画面で押すとダイアログ（状態 017）を開く。未保存の入力があるときは非活性（E104）。契約種別がお試しキャンペーンでないときは I109、取消の拠点は I107 で非活性にして理由を横に出す。", "Ở chi tiết bị vô hiệu (hiện lý do 「編集画面で押せます」 cạnh nút). Bấm ở màn hình chỉnh sửa sẽ mở hộp thoại (trạng thái 017). Khi có nội dung chưa lưu thì vô hiệu (E104). Khi loại hợp đồng không phải chiến dịch dùng thử là I109, chi nhánh đã hủy là I107, vô hiệu và hiện lý do cạnh nút.")),
     ]},
    {"id": "017", "code": "AW_BRCH_003", "state": ["お試しを延長する（ダイアログ）", ""], "url": "/ops/branches/CU00975/edit?tab=契約",
     "setup": JS + "btn('お試しを延長する').click();await sleep(900);", "full": False, "wait": 500,
     "note": ["編集の契約タブで「お試しを延長する」を押したとき（詳細では非活性）。月数を入れると、足す子契約の表と延長後のお試し期間が出る。", ""],
     "items": [
         F("29", "お試しを延長するダイアログ", ".dlg", "modal", "show", err=["Q109"], detail="延長する月数を入れ → 足す子契約を見る → 「n ヶ月延長する」。",
           demo_ok="コードの説明と表は延長の月を「無料（DC000013）」と出す（宿題 S14）。仕様は延長の月もプラン料金を請求する"),
         F("29.1", "説明", ".dlg .lead", "label", detail="お試しの最後の子契約と同じ中身で、次のサイクルから子契約を作る。延長の月はプラン料金を請求する。法人へ通知・メールでお知らせし、法人Web の拠点詳細「お試し期間」に延長が出る。"),
         F("29.2", "いまのお試し期間", ".dlg .row::いまのお試し期間", "label", detail="お試し期間の開始〜終了（月数）。延長したことがあれば回数も出す。"),
         F("29.3", "延長する月数", ".dlg input.r", "text", "input", req="○", len="整数 1以上", init="1", ex="2", err=["E01", "E117", "E14"],
           valid=D("半角の整数で、1以上。0・空欄のときは E117（空欄は E01）を欄の下に出し、延長しない。", "Số nguyên bán góc, từ 1 trở lên. Nhập 0 hoặc để trống thì hiện E117 dưới ô (để trống là E01) và không gia hạn."),
           detail=D("上限は当面なし（台帳 M-3。台帳 M-1 の「回数・月数 99」より M-3 を優先）。長くなるときは本導入への切替を案内する。", "Tạm thời không có giới hạn trên (sổ quyết định M-3; ưu tiên M-3 hơn 「số lần / số tháng 99」 của M-1). Nếu kéo dài thì hướng dẫn chuyển sang triển khai chính thức.")),
         F("29.4", "理由（社内・任意）", ".dlg .row input:not(.r)", "textarea", "input", req="－", len="文字列 500（複数行）", init="空", ex="法人のご希望（検討期間の延長）", err=["E04", "E13"], detail=D("延長の理由（社内のメモ・任意）。専用の項目にはせず、変更履歴（P-HIST）の「理由」の列に残る。法人には出さない。", "Lý do gia hạn (ghi chú nội bộ, không bắt buộc). Không làm mục riêng mà được lưu vào cột 「理由」 của lịch sử thay đổi (P-HIST). Không hiển thị cho pháp nhân.")),
         F("29.5", "足す子契約の表", ".dlg .gpv", "table", detail="延長で作る子契約（子契約ID・サイクル月・種別・ご請求）。ご請求は「プラン料金」（割引なし）。", demo_ok="コードは「無料（DC000013）」（宿題 S14）。仕様が正"),
         F("29.6", "キャンセル", ".dlg .ft button.cx", "button", "click", detail="閉じる。何も変えない。"),
         F("29.7", "延長する", ".dlg .ft button.ok", "button", "click", err=["S106", "E111", "E30"], detail=D("子契約を足してお試し期間を延ばし、S106 を出す。この時点で保存される（画面の保存とは別の操作・提案）。履歴に残り、法人へお知らせする。", "Thêm hợp đồng con và kéo dài thời gian dùng thử, hiện S106. Được lưu ngay ở thời điểm này (thao tác riêng, khác nút lưu của màn hình; đề xuất). Lưu vào lịch sử và thông báo cho pháp nhân.")),
     ]},
    {"id": "019", "code": "AW_BRCH_002", "state": ["パスワード再設定の確認", ""], "url": "/ops/branches/CU00643",
     "setup": JS + "btn('パスワード再設定').click();await sleep(500);", "full": False, "wait": 400,
     "note": ["アカウントの「パスワード再設定」を押したとき。", ""],
     "items": [
         F("22", "パスワード再設定の確認", "[role=dialog]", "modal", "show", err=["Q100"], detail="Q100（拠点アカウント）。本文に拠点ID・メイン担当者の氏名を入れる。",
           demo_ok="コードの確認の文言は「拠点アカウント（…）のメイン担当者（…）に、…」で Q100 と同じ。ダイアログの見た目はコード独自（宿題）。権限は仕様と違う（8.4）"),
         F("22.1", "キャンセル", "[role=dialog] button::キャンセル", "button", "click", detail="閉じる。何もしない。"),
         F("22.2", "送る", "[role=dialog] button::送る", "button", "click", err=["S100", "E30"], detail=D("メイン担当者にメールで案内を送り、S100 のトースト。変更履歴に残る（操作＝パスワード再設定。法人と同じ）。", "Gửi email hướng dẫn cho người phụ trách chính và hiện toast S100. Được lưu vào lịch sử thay đổi (thao tác = đặt lại mật khẩu; giống pháp nhân).")),
     ]},
    {"id": "020", "code": "AW_BRCH_002", "state": ["閉鎖予定・法人なし", ""], "url": "/ops/branches/CU01310", "setup": "", "full": False, "wait": 600,
     "note": ["見本 CU01310（所属法人なし・閉鎖予定・請求先＝この拠点）。", ""],
     "items": [
         F("23", "法人なしの拠点", ".sumbar .s::所属法人", "label", detail="所属法人は「（法人なし）」。請求先は「この拠点」で変更できない（編集の画面でも）。"),
         F("23.1", "閉鎖予定", ".sumbar .s::拠点ステータス", "label", detail="閉鎖予定のとき、解約の承認で設定した解約日に「閉鎖」になる。編集は権限のある役割ができる（閉鎖でも編集できる）。"),
     ]},
    {"id": "021", "code": "AW_BRCH_002", "state": ["閉鎖", ""], "url": "/ops/branches/CU00588", "setup": "", "full": False, "wait": 600,
     "note": ["見本 CU00588（閉鎖・親契約は終了）。", ""],
     "items": [
         F("24", "閉鎖の拠点", ".sumbar .s::拠点ステータス", "label", detail="閉鎖の拠点。一覧では灰色のバッジ。当月請求額は「—」。履歴・請求書の表は残る（削除しない）。"),
     ]},
    {"id": "022", "code": "AW_BRCH_002", "state": ["見つからない", ""], "url": "/ops/branches/CU99999", "setup": "", "full": False, "wait": 600,
     "note": ["存在しない拠点ID の URL を開いたとき。", ""],
     "items": [
         F("25", "見つからないメッセージ", ".empty", "label", "show", err=["E100"], detail=D("ページ内に E100（拠点（CU99999）が見つかりません）。下の「一覧へ戻る」から一覧へ戻れる。", "Hiện E100 trong trang (không tìm thấy chi nhánh (CU99999)). Quay về danh sách bằng 「一覧へ戻る」 bên dưới."),
           demo_ok="コードの文言は「拠点（CU99999）が見つかりません」で E100 と同じ形（句点がない）（根拠：共通メッセージ E100。台帳に行なし）"),
         F("25.1", "一覧へ戻る", "-", "button", "click", detail=D("拠点一覧（AW_BRCH_001）へ戻るリンク。", "Liên kết quay về danh sách chi nhánh (AW_BRCH_001)."), demo_ok=D("コードにない（宿題）。行き止まりを作らないための項目（根拠：QA レビュー #37。台帳に行なし）", "Chưa có trong code (宿題). Mục để không tạo ngõ cụt (căn cứ: QA review #37; sổ quyết định không có dòng)")),
     ]},
]

# ================================================================ AW_BRCH_003 編集
V_EDIT = [
    {"id": "023", "code": "AW_BRCH_003", "state": ["編集 初期表示", ""], "url": "/ops/branches/CU00643/edit", "setup": "", "full": True, "wait": 700,
     "note": ["見本 CU00643。保存済みの値が入り、入力できる項目に入力欄が出る。拠点ID・旧ES ユーザーID・ログインID は入力できない。", ""],
     "items": E_HEADER + SUM + TABS + TOOLS_E
     + [card("5", "基本情報", pattern="P-FORM", detail="拠点の基本情報。入力チェックは「保存」でまとめて行う。")] + [edit_item(f) for f in BASIC]
     + [card("6", "住所", detail="請求書・配送に使う拠点の住所。")] + [edit_item(f) for f in ADDR]
     + staff_edit()
     + [card("8", "アカウント", detail="詳細（AW_BRCH_002）の 8 と同じ。操作は拠点の編集の権限がある役割だけに表示する。")] + [view_item(f) for f in ACCT],
     },
    {"id": "024", "code": "AW_BRCH_003", "state": ["編集 契約タブ", ""], "url": "/ops/branches/CU00643/edit?tab=契約", "setup": "", "full": True, "wait": 600,
     "note": ["契約管理（contracts）の編集権限がない役割は、親契約の項目が参照だけになる（運営A Q3）。", ""],
     "items": [card("9", "親契約", detail="拠点の親契約。保存は契約管理（contracts）の編集権限。")] + [edit_item(f) for f in CONTRACT]
     + [card("10", "一覧（子契約）", detail="詳細と同じ（AW_BRCH_002 の 10）。"),
        F("10.1", "子契約を先まで作る", ".f button::子契約を先まで作る", "button", "click", err=["Q108", "E110", "S105", "E112", "E104"],
          cond=D("プラン契約管理の作成権限（CRUD：フル権限・システム管理）がある役割だけに表示", "Chỉ hiển thị với vai trò có quyền tạo quản lý hợp đồng plan (CRUD: toàn quyền, quản trị hệ thống)"), detail=D("押すとダイアログ（状態 018）。詳細では非活性（台帳 F「詳細は表示だけ」。理由「編集画面で押せます」をボタンの横に出す）で、編集の画面で押せる。このダイアログは、押して確認すると別の操作としてすぐに保存される（画面の「保存」とは別。台帳 F の「保存は画面の保存1つ」に対する提案で、hong 確認待ち）。編集の画面でだけ押せる。編集中の入力が未保存のときはボタンを非活性にし、理由「編集中の内容を先に保存してください」（E104）を出す。", "Bấm sẽ mở hộp thoại (trạng thái 018). Ở chi tiết bị vô hiệu (sổ quyết định F: chi tiết chỉ hiển thị; hiện lý do 「編集画面で押せます」 cạnh nút), bấm được ở màn hình chỉnh sửa. Hộp thoại này sau khi bấm xác nhận sẽ được lưu ngay như một thao tác riêng (khác với nút 「保存」 của màn hình; là đề xuất đối với quy tắc 「lưu bằng 1 nút lưu」 của sổ quyết định F, chờ hong xác nhận). Chỉ bấm được ở màn hình chỉnh sửa. Khi nội dung đang nhập chưa lưu thì nút bị vô hiệu kèm lý do 「編集中の内容を先に保存してください」 (E104)."))]},
    {"id": "025", "code": "AW_BRCH_003", "state": ["編集 請求タブ（請求先を「この拠点」に変えると活性）", ""], "url": "/ops/branches/CU00643/edit?tab=請求",
     "setup": JS + "sets(fld('請求先').querySelector('select'),'この拠点');await sleep(500);", "full": True, "wait": 500,
     "note": ["請求先を「法人」から「この拠点」に変えたとき（支払方法などが入力できるようになる）。", ""],
     "items": [card("13", "請求先と請求条件", pattern="P-FORM", detail="請求先＝この拠点のとき、リードタイムの上書き・支払方法・支払サイクル・入金期限・Bill One 発行先ID が活性になる。年払いのときだけ起算月、口座振替のときだけ手続きステータスが活性。保存しても、法人のときは支払項目を保存しない。")]
     + [edit_item(f) for f in BILL]
     + [card("14", "一覧（この拠点の請求書）", detail="詳細と同じ（AW_BRCH_002 の 14）。")]},
    {"id": "026", "code": "AW_BRCH_003", "state": ["入力エラー", ""], "url": "/ops/branches/CU00643/edit",
     "setup": JS + "setv(fld('拠点名*').querySelector('input'),'');await sleep(200);q('.pbtn button.save').click();await sleep(700);", "full": False, "wait": 500,
     "note": ["拠点名を空にして「保存」を押したとき。", ""],
     "items": [
         F("18", "入力エラー", ".pane .f.err", "area", pattern="P-FORM", err=["E01"],
           detail="「保存」で全項目をまとめてチェックし、エラーの項目は赤枠にして項目の下に文言（必須は E01）を出す。最初のエラーの項目がほかのタブにあれば、そのタブを開き、エラーのあるタブの見出しに赤い印を付ける。保存はしない。",
           demo_ok=H_MARK),
         F("18.1", "項目の下の文言", ".f.err .emsg", "label", err=["E01"], detail="例：拠点名が空のとき「拠点名は必須項目です。」"),
         F("18.2", "エラーのトースト", ".toast", "toast", "show", detail="仕様では出さない（項目の下の文言だけ）。", demo_ok=H_MARK),
         F("18.3", "保存できません（n件）", "-", "label", err=["E01"], detail=D("見出しの下に1行の枠「保存できません（n件）。赤い項目を直してください。」を出す（見出しと一緒に固定する。n＝全タブの赤い項目の数。担当者の表の行のエラーは、その項目1つにつき1と数える）。項目を直すと数が減り、0件で消える。最初に出すときだけ role=alert で読み上げる。", "Hiện 1 dòng khung 「保存できません（n件）。赤い項目を直してください。」 dưới tiêu đề (cố định cùng tiêu đề; n = số mục viền đỏ của tất cả các tab; lỗi của dòng trong bảng người phụ trách tính 1 cho mỗi mục). Sửa mục thì số giảm, về 0 thì ẩn. Chỉ lần hiện đầu tiên được đọc bằng role=alert."), demo_ok=D("コードは件数を出さない。仕様は台帳 F 再レビュー(4)", "Code không hiện số lượng. Spec theo sổ quyết định F xem lại (4)")),
         F("18.4", "タブのエラー件数", "-", "label", detail=D("エラーのあるタブの見出しに件数つきの赤い印（例：請求 ●2）を付ける。最初のエラーのタブを開く。", "Gắn dấu đỏ kèm số lượng (ví dụ: 請求 ●2) vào tiêu đề tab có lỗi. Mở tab lỗi đầu tiên."), demo_ok=D("コードは件数を出さない。仕様は台帳 F 再レビュー(4)", "Code không hiện số lượng. Spec theo sổ quyết định F xem lại (4)")),
     ]},
    {"id": "027", "code": "AW_BRCH_003", "state": ["編集内容を破棄しますか（Q02）", ""], "url": "/ops/branches/CU00643/edit",
     "setup": JS + "setv(fld('従業員数').querySelector('input'),'200');await sleep(200);q('.pbtn button.cancel').click();await sleep(500);", "full": False, "wait": 400,
     "note": ["従業員数を直して「キャンセル」を押したとき。直さずにキャンセルなら確認は出ない。", ""],
     "items": [
         F("19", "破棄の確認", ".es-modal__panel", "modal", "show", pattern="P-FORM", err=["Q02"], detail="Q02。入力を変えたあとの キャンセル・ほかの画面への移動・ブラウザを閉じる／再読み込み で出す。",
           demo_ok="コードのタイトルは「編集内容を破棄しますか？」で Q02 の文言と少し違う（根拠：共通メッセージ Q02）。ブラウザを閉じる／再読み込みはブラウザの標準の確認"),
         F("19.1", "本文", ".es-modal__body", "label", detail="Q02。"),
         F("19.2", "キャンセル", ".es-modal__actions button::キャンセル", "button", "click", detail="閉じて編集を続ける。"),
         F("19.3", "破棄", ".es-modal__actions button::破棄", "button", "click", detail="入力を捨てて、詳細（または一覧）へ戻る。"),
     ]},
    {"id": "028", "code": "AW_BRCH_003", "state": ["保存した（S01→詳細）", ""], "url": "/ops/branches/CU00643/edit",
     "setup": JS + "q('.pbtn button.save').click();await sleep(900);", "full": False, "wait": 400,
     "note": ["入力に誤りがない状態で「保存」を押したとき。保存すると詳細（AW_BRCH_002）へ移る。", ""],
     "items": [
         F("20", "保存完了", ".toast", "toast", "show", pattern="P-FORM", err=["S01"], detail=D("S01 のトーストを出して、詳細へ移る。変更した項目は変更履歴に1つの操作としてまとめて残る（P-HIST）。保存の通信エラー（E30）・権限がない（E32）・ほかの人が先に保存（E31）の状態は 049〜051（見本データでは作れない・図だけ）。", "Hiện toast S01 rồi sang chi tiết. Các mục đã thay đổi được lưu vào lịch sử thay đổi như 1 thao tác (P-HIST). Các trạng thái lỗi kết nối khi lưu (E30), không có quyền (E32), người khác lưu trước (E31) xem 049 ~ 051 (không tạo được bằng dữ liệu mẫu, chỉ có hình minh họa).")),
     ]},
    {"id": "018", "code": "AW_BRCH_003", "state": ["子契約を先まで作る（ダイアログ）", ""], "url": "/ops/branches/CU00643/edit?tab=契約",
     "setup": JS + "btn('子契約を先まで作る').click();await sleep(600);", "full": False, "wait": 400,
     "note": ["編集の契約タブで「子契約を先まで作る」を押したとき（詳細ではボタンが非活性で押せない）。", ""],
     "items": [
         F("17", "子契約を先まで作るダイアログ", ".dlg", "modal", "show", err=["Q108"], detail="月を選ぶ → 作られる子契約を見る → 「n件作成」。"),
         F("17.1", "説明", ".dlg .lead", "label", detail="ふだんは日次バッチが次のサイクルを自動で作る。手で作るのは、先のプラン変更に備えるときと、お試しキャンペーンを複数月にするときだけ。"),
         F("17.2", "作成済", ".dlg .row::作成済", "label", detail="作成済みの最後のサイクル月と件数。"),
         F("17.3", "どの月まで作りますか", ".dlg select.until", "select", "select", req="○", len="選択（年月 yyyy-mm。作成済みの翌月〜今月から12ヶ月先）", init="次の1サイクル", ex="2027-06",
           detail="選べるのは作成済みの翌月から今月の12ヶ月先まで。休止期間のサイクル月は作らない。", err=["E02"]),
         F("17.4", "作られる子契約の表", ".dlg .gpv", "table", detail="子契約ID・サイクル月・プラン・配送区分と納品回数・請求月・生成基準日。最新の子契約と同じプラン・配送で作る。すでにある月は作り直さない。"),
         F("17.5", "キャンセル", ".dlg .ft button.cx", "button", "click", detail="閉じる。"),
         F("17.6", "n件作成", ".dlg .ft button.ok", "button", "click", err=["S105", "E110", "E30"], detail="作る月がないときは「作れる月がありません（上限 … まで作成済み）」（E110）で非活性。作ったら S105 を出し（この時点で保存される・提案）、一覧に「手動生成」の印つきで入る。変更履歴に誰がいつ作ったかを残す。"),
     ]},
    {"id": "029", "code": "AW_BRCH_003", "state": ["編集 資料・履歴タブ", ""], "url": "/ops/branches/CU00643/edit?tab=資料・履歴", "setup": "", "full": True, "wait": 600,
     "note": ["添付資料のアップロード・削除ができる（申込時の添付資料は参照だけ）。申請履歴・履歴の表は詳細と同じ。", ""],
     "items": [card("15", "添付資料（法人に公開）", detail=D("法人に公開する資料（搬入経路資料・設置場所写真）。JPG・PNG・PDF・HEIC、1件5MB・10件まで（E11）。10件は項目ごとに数える（項目をまたいで数えない）。ほかの形式（Excel・Word など）は E119。HEIC は表示のときに変換する。", "Tài liệu công khai cho pháp nhân (lộ trình vận chuyển vào, ảnh vị trí lắp đặt). JPG, PNG, PDF, HEIC, tối đa 5MB mỗi tệp, 10 tệp (E11). 10 tệp tính theo từng mục (không tính gộp giữa các mục). Định dạng khác (Excel, Word, v.v.) là E119. HEIC được chuyển đổi khi hiển thị."))]
     + [edit_item(f) for f in FILES_PUB]
     + [card("16", "添付資料（社内のみ・非公開）", detail=D("社内だけの資料。法人には出さない。形式・容量・件数の決まりは上と同じ（E11・E119）。", "Tài liệu chỉ nội bộ. Không công khai cho pháp nhân. Quy tắc định dạng / dung lượng / số tệp giống phần trên (E11, E119)."))]
     + [edit_item(f) for f in FILES_INT]},
]

# ================================================================ AW_BRCH_004 拠点CSV取込（P-CSV・2ステップ）
# 列の定義は画面に出さず、項目定義に入力項目と同じ形で書く（sel＝"-"・台帳 F）。列＝詳細・編集の入力項目＋拠点ID（＋参照の列）。担当者は共通の CSV に入れる（1行＝1拠点×1人）。
CSV_INIT = "空欄（今の値のまま）"
CSV_EX = {}
CSV_BLANK = {"○": ("必須の項目。空欄は今の値のまま。「-」で消すことはできない（E01）。", "必須の項目。空欄は今の値のまま。「-」で消すことはできない（E01）。"),
             "－": ("空欄は今の値のまま。「-」で消せる。", ""), "条件付き": ("空欄は今の値のまま。条件に当てはまるときは必須で、「-」で消すことはできない。", "")}


CSV_COND = {
    "9.5": ("契約種別が本導入の行", "Dòng có loại hợp đồng là triển khai chính thức"),
    "13.2": ("請求先が法人の行", "Dòng có bên nhận hóa đơn là pháp nhân"),
    "13.3": ("請求先が法人の行", "Dòng có bên nhận hóa đơn là pháp nhân"),
    "13.4": ("請求先が法人の行、または支払方法が口座振替でない行", "Dòng có bên nhận hóa đơn là pháp nhân, hoặc phương thức thanh toán không phải chuyển khoản tự động"),
    "13.5": ("請求先が法人の行", "Dòng có bên nhận hóa đơn là pháp nhân"),
    "13.6": ("請求先が法人の行、または支払サイクルが年払いでない行", "Dòng có bên nhận hóa đơn là pháp nhân, hoặc chu kỳ thanh toán không phải trả theo năm"),
    "13.7": ("請求先が法人の行", "Dòng có bên nhận hóa đơn là pháp nhân"),
    "13.8": ("請求先が法人の行", "Dòng có bên nhận hóa đơn là pháp nhân"),
}
CSV_DEP = ("6.7", "9.5", "13.2", "13.3", "13.4", "13.5", "13.6", "13.7", "13.8")


CSV_DASH = ("5.4",)


def csv_item(no, f, ja=None, ex=None):
    """画面の入力項目 f の CSV 列（定義だけ・sel＝"-"）"""
    ja = ja or f["ja"]
    req = f.get("req", "－")
    valid = CSV_BLANK[req][0]
    if f.get("v"):
        valid += f["v"]
        TR[valid] = T(CSV_BLANK[req][0]) + " " + T(f["v"])
    if f["no"] in CSV_DEP:
        if f["no"] == "6.7":
            extra = D("自動販売機を貸し出している拠点で、この列が空のまま（「-」で消す場合も）の行は E01（画面の保存と同じ検証・CSV入出力_定義 §2-2）。", "Dòng thuộc chi nhánh đang cho mượn máy bán hàng tự động mà cột này để trống (kể cả xóa bằng 「-」) là E01 (cùng kiểm tra với lưu trên màn hình; CSV入出力_定義 §2-2).")
        else:
            extra = D(CSV_COND[f["no"]][0] + "でこの列に値があるときは行エラー E109（「{列名}は、{条件}のときだけ入力できます。」）。黙って無視しない（台帳 F 再レビュー(1)）。条件に当てはまらないときは空欄にする。", CSV_COND[f["no"]][1] + " mà cột này có giá trị thì là lỗi dòng E109 (「{tên cột} chỉ nhập được khi {điều kiện}」). Không bỏ qua im lặng (sổ quyết định F, xem lại (1)). Khi không thỏa điều kiện thì để trống.")
        TR[valid + " " + extra] = TR.get(valid, T(valid)) + " " + TR[extra]
        valid = valid + " " + extra
    if f["no"] in CSV_DASH:
        extra2 = D("「-」だけを入れた行は行エラー（この項目は消せない・数値の列）。", "Dòng chỉ nhập 「-」 là lỗi dòng (mục này không xóa được; cột số).")
        TR[valid + " " + extra2] = TR.get(valid, T(valid)) + " " + TR[extra2]
        valid = valid + " " + extra2
    detail = "画面の項目 %s「%s」と同じ。" % (f["no"], f["ja"])
    TR[detail] = "Giống mục %s 「%s」 trên màn hình (AW_BRCH_003)." % (f["no"], f["ja"])
    ex = ex or CSV_EX.get(ja) or f.get("ex", "")
    kw = dict(req=("条件付き" if req == "条件付き" else "－"), len=f.get("len"), valid=valid, detail=detail, ex=ex, init=CSV_INIT)
    if f.get("cond"):
        kw["cond"] = f["cond"]
    _err = list(f.get("err") or [])
    if req == "○" and "E01" not in _err:
        _err.insert(0, "E01")
    if f["no"] in CSV_DEP and f["no"] != "6.7":
        _err.append("E109")
    if f["no"] == "13.2":
        _err.append("W102")
    if _err:
        kw["err"] = _err
    kind = f["kind"] if f["kind"] in ("text", "textarea", "select", "month", "date") else "text"
    return F(no, ja, "-", kind, "input", **kw)


def _pick(lst, *nos):
    return [f for f in lst if f["no"] in nos]


CSV_BASIC = _pick(BASIC, "5.1", "5.2", "5.4", "5.5", "5.6", "5.7", "5.8", "5.11")
CSV_ADDR = _pick(ADDR, "6.1", "6.3", "6.4", "6.5", "6.6", "6.7", "6.8", "6.9")
CSV_CONTRACT = _pick(CONTRACT, "9.2", "9.3", "9.4", "9.5", "9.7", "9.10")
CSV_BILL = BILL


def csv_defs():
    out = [F("2", "CSVテンプレートの列（定義。画面には出さない）", "-", "area",
             detail="取り込むファイルの列の定義（1行目の見出し・この順。CSV出力と同じ列）。テンプレートの写し（docs/05_画面設計書/CSVテンプレート/branches.csv）はまだない（宿題）。キー＝拠点ID。更新だけ（新しい拠点・仮登録の拠点の行はエラー）。UTF-8（BOM 可）・5,000行まで。空欄のセルは今の値のまま、「-」で消す（消せる項目だけ）。2.x の必須・長さ・チェックは入力画面（AW_BRCH_003）の項目と同じ（違うところだけ書く）。画面には出さない。"),
           F("2.1", "拠点ID", "-", "text", "input", req="○", len="文字列 CU＋連番", init="拠点IDの値は、今の拠点のとおり（CSV出力のファイルのまま）", ex="CU00643",
             valid=D("拠点の列は、同じ拠点IDの2行目以降では空欄でよい（入れるなら1行目と同じ値。違えば E116）。", "Các cột của chi nhánh từ dòng 2 trở đi với cùng ID chi nhánh được để trống (nếu điền thì phải giống dòng 1; khác thì E116)."),
             detail="【キー】画面の項目 5.9「拠点ID」の値。空欄の行は新しい拠点になるので E101、ファイルにない拠点IDは E100、仮登録の拠点の行は E102（受付番号は {申請番号}）。1つの拠点を担当者の数だけの行に分けて同じ拠点IDで並べる（2.33）。存在しない拠点IDの行は、その行だけ行エラー（E100）にして、ほかの行は登録する（台帳 F）。",
             err=["E100", "E101", "E102"]),
           F("2.2", "参照の列（変更できない）", "-", "label", "view",
             detail="CSV出力と同じ並びで入っている参照だけの列：所属法人ID・所属法人名（所属法人は変えられない）・旧ES ユーザーID・親契約番号・ログインID・登録日時。今の値と違う行は E115（空欄は今の値のまま）。",
             err=["E115"])]
    n = 3
    for grp in (CSV_BASIC, CSV_ADDR, CSV_CONTRACT, CSV_BILL):
        for f in grp:
            out.append(csv_item("2.%d" % n, f))
            n += 1
    assert n == 33, n
    out.append(F("2.33", "担当者の列（1行＝1人）", "-", "area", err=["E103", "E108", "E116"],
                 detail=D("【担当者の行】この拠点の担当者の表を、1行＝1人で書く（拠点IDを同じにして行を並べる。CSV入出力_定義 §1-1 の（a））。専用の CSV は作らない。「区分＋メールアドレス」で今の担当者と突き合わせる：あれば更新、なければ追加。CSV では削除しない（消すのは画面から）。2行目以降の拠点の列は空欄でよい（入れるなら1行目と同じ値、違えば E116）。メイン担当者・請求担当者が1名ずつ入っていなければ E103、2名以上なら E108（台帳 F 2026-10-06(2)）。", "【Dòng người phụ trách】Ghi bảng người phụ trách của chi nhánh, 1 dòng = 1 người (cùng ID chi nhánh, xếp liền nhau; phương án (a) mục 1-1 của CSV入出力_定義). Không tạo CSV riêng. Đối chiếu với người phụ trách hiện tại bằng 「phân loại + email」: có thì cập nhật, chưa có thì thêm. CSV không xóa (xóa làm trên màn hình). Các cột của chi nhánh từ dòng 2 trở đi để trống được (nếu điền thì phải giống dòng 1, khác thì E116). Thiếu người phụ trách chính / thanh toán thì E103, từ 2 người trở lên thì E108 (sổ quyết định F 2026-10-06 (2))."),
                 ))
    for i, (n_, ja, sel, kd, rq, ln, ex, dt, er) in enumerate(STAFF_COLS):
        f = dict(no=n_, ja=ja, kind=kd, req=rq, len=ln, ex=ex, v=dt, err=[e for e in er if e != "E103"])
        out.append(csv_item("2.%d" % (34 + i), f))
    return out


CSV_STEP1 = [
    F("3", "ファイルを選ぶ（ステップ1）", "#sec-csv", "area", pattern="P-CSV",
      detail="更新だけの取込（運営A Q2）。新しい拠点は契約申請管理の代理入力から。テンプレートのボタンは置かない（ひな形が要るときは CSV出力のファイルを使う）。"),
    F("3.1", "手順", ".steps", "label", detail="1 ファイルを選ぶ／2 確認・登録。いまのステップを強調する。"),
    F("3.2", "説明", "#sec-csv .hint", "label", detail="キーは拠点ID（更新だけ）。新しい拠点は契約申請管理の代理入力から。空欄のセルは今の値のまま、消すときは「-」。UTF-8・5,000行まで。"),
    F("3.3", "ファイルを選ぶ", "#sec-csv button.out::ファイルを選ぶ", "file", "upload", req="○", ex="拠点一覧_全件_20261005-0915.csv", len="CSV（UTF-8・.csv）1ファイル", init="なし", err=["E51", "E113", "E107", "E106"],
      detail=D("CSVを1つ選ぶ（ドラッグ＆ドロップでもよい。枠はキーボードの Enter／Space でも開く）。選んだら読み込んで、確認（ステップ2）へ進む。.csv 以外・UTF-8 でない・読めないときは E51（状態 033）、見出しが違うときは E113（状態 033）、データの行が1つもない（空のファイル・見出しだけ）ときは E107、5,001行以上は E106（状態 035）。ファイルサイズの上限は決めない（5,000行まで）。ファイル名の例：拠点一覧_全件_20261005-0915.csv（CSV出力のファイル）。列は拠点一覧の CSV出力と同じ（ひな形が要るときは CSV出力を使う）。", "Chọn 1 tệp CSV (cũng có thể kéo thả; khung cũng mở được bằng Enter / Space trên bàn phím). Chọn xong sẽ đọc và sang bước xác nhận (bước 2). Không phải .csv / không phải UTF-8 / không đọc được là E51 (trạng thái 033), tiêu đề khác là E113 (trạng thái 033), không có dòng dữ liệu nào (tệp rỗng, chỉ có tiêu đề) là E107, từ 5.001 dòng trở lên là E106 (trạng thái 035). Không quy định giới hạn dung lượng tệp (chỉ tối đa 5.000 dòng). Ví dụ tên tệp: 拠点一覧_全件_20261005-0915.csv (tệp CSV出力). Cột giống CSV出力 của danh sách chi nhánh (cần mẫu thì dùng CSV出力).")),
    F("3.4", "ドラッグ＆ドロップの枠", "#sec-csv button.out::ファイルを選ぶ^2", "area", detail="ファイルをここへドラッグ＆ドロップできる。"),
]
CSV_STEP2 = [
    F("4", "確認・登録（ステップ2）", "#sec-csv", "area", "show", pattern="P-CSV", err=["S104", "E34", "E114"], demo_ok='コードの拠点一覧にはまだ画面がない（モーダル）。台帳 E「CSV取込の画面」どおり画面として設計。画像は共通の CSV取込画面（値引きマスタ）で代用（宿題 S5）',
      detail=D("ファイル名・件数と、行ごとの結果。「登録」でエラー以外の行（更新）を登録する。エラーの行は取り込まない。", "Tên tệp, số dòng và kết quả từng dòng. Nhấn 「登録」 sẽ đăng ký các dòng không lỗi (cập nhật). Dòng lỗi không nhập.")),
    F("4.1", "件数", "#sec-csv .badge", "label", detail=D("更新／変更なし／エラー の件数（バッジ）。更新だけの取込なので「新規」は出ない（新規の行は E101 のエラーに数える）。", "Số dòng cập nhật / không đổi / lỗi (badge). Vì chỉ nhập để cập nhật nên không có 「新規」 (dòng mới được tính là lỗi E101).")),
    F("4.2", "エラーの行", "#sec-csv .notice.ng", "label", "show", cond="エラーの行があるとき", err=["E100", "E101", "E102", "E115", "E116"],
      detail="「エラーの行 n件は取り込みません」と、行番号・拠点ID・列名・内容の表（多いときは先頭だけ。全部はエラー一覧CSV）。内容は E100〜E102・E115・E116 と、2.x の入力チェックの文言。"),
    F("4.3", "エラー行をCSVでダウンロード", "#sec-csv button::エラー一覧CSV", "button", "click", detail="エラーの行だけを、元の列＋エラーの内容で書き出す（直して選び直すため）。"),
    F("4.4", "登録する内容（前 → 後）", "#sec-csv b::登録する内容", "label", cond=D("更新の行があるとき", "Khi có dòng cập nhật"),
      detail=D("行番号・拠点ID・拠点名・変わる項目（前 → 後）。担当者の行は「区分＋メール」で突き合わせた結果（更新／追加）を並べる。削除はない。", "Số dòng, ID chi nhánh, tên chi nhánh, các mục thay đổi (trước → sau). Với dòng người phụ trách thì liệt kê kết quả đối chiếu 「phân loại + email」 (cập nhật / thêm). Không có xóa.")),
    F("4.5", "ファイルを選び直す", ".csvph .btns button.out::ファイルを選び直す", "button", "click", detail="ステップ1に戻る。何も登録しない。"),
    F("4.6", "取り込まない件数の表示", "-", "label", detail=D("「登録する（更新 n件）」の上の確認の行に「エラーの行 m件は取り込まれません」を出す。エラーの表は先頭50件だけを出し、合計件数を添える（全部はエラー行のCSV）。ボタンの名前はどの状態でも同じ「登録する（更新 n件）」。確認の画面から別の画面へ移るときは「確認の結果は破棄されます（登録はされません）」と確認する（Q02 の形。選んだファイルは残らない）。", "Ở dòng xác nhận phía trên 「登録する（更新 n件）」 hiện 「エラーの行 m件は取り込まれません」. Bảng lỗi chỉ hiện 50 dòng đầu và kèm tổng số (đủ ở CSV các dòng lỗi). Tên nút luôn là 「登録する（更新 n件）」 ở mọi trạng thái. Khi rời màn hình xác nhận sang màn hình khác thì xác nhận 「確認の結果は破棄されます（登録はされません）」 (dạng Q02; tệp đã chọn không được giữ).")),
    F("4.7", "登録する（更新 n件）", ".csvph .btns button.pri", "button", "click", err=["S104", "E34", "E114"],
      cond=D("更新の行が1つ以上あり、ファイル全体のエラーがないとき。警告があるときは「警告を確認しました」にチェックするまで押せない（状態 036）", "Có ≥1 dòng cập nhật và không có lỗi cả tệp. Có cảnh báo thì phải check 「警告を確認しました」 mới nhấn được (trạng thái 036)"),
      detail=D("エラー以外の行（更新）を登録し、S104 のトースト（更新 n件・取り込まなかった行 m件）、一覧へ戻る。エラーの行は取り込まない。取り込まなかった行は登録の前に「エラー行をCSVでダウンロード」で保存して直す（登録後は出せない）。登録できる行が1つもなければ E114 で止まる（登録は非活性・状態 034）。100件以下は画面の中で進め（登録中はスピナーを出し、ボタンを非活性にする）、100件を超えるときは裏で進めて進み具合を出す（状態 037〜039）。取込の記録と、行ごとの変更履歴「CSV取込で更新」を残す。", "Đăng ký các dòng không lỗi (cập nhật), hiện toast S104 (cập nhật n dòng, m dòng không nhập), về danh sách. Dòng lỗi không nhập. Các dòng không nhập cần lưu bằng 「エラー行をCSVでダウンロード」 trước khi đăng ký để sửa (sau khi đăng ký không xuất được). Nếu không có dòng nào đăng ký được thì dừng với E114 (nút đăng ký bị vô hiệu; trạng thái 034). Từ 100 dòng trở xuống chạy ngay trên màn hình (hiện spinner, vô hiệu nút), quá 100 dòng thì chạy nền và hiện tiến độ (trạng thái 037 ~ 039). Ghi lịch sử nhập và lịch sử từng bản ghi 「CSV取込で更新」.")),
]
CSV_HEAD = [
    F("1", "ヘッダー", ".csvph", "area", demo_ok='コードの拠点一覧にはまだ画面がない（モーダル）。台帳 E「CSV取込の画面」どおり画面として設計。画像は共通の CSV取込画面（値引きマスタ）で代用（宿題 S5）'),
    F("1.1", "パンくず", ".crumb", "label", detail="「法人・契約管理 / 拠点一覧 / 拠点CSV取込」。拠点一覧のリンクは一覧へ戻る。"),
    F("1.2", "画面名", ".csvph h1", "label", detail="「拠点CSV取込」"),
    F("1.3", "キャンセル", ".csvph .btns button.out::キャンセル", "button", "click", detail="一覧へ戻る（何も登録しない）。見出しの右のボタン。"),
]
V_CSV = [
    {"id": "030", "code": "AW_BRCH_004", "state": ["初期表示（ステップ1 ファイルを選ぶ）", ""], "url": "/ops/branches/import", "setup": "", "full": True, "wait": 1200,
     "note": ["フル権限（CSV取込の権限）だけが開ける（ほかの役割は一覧へ戻る）。見出し → 列の定義（2.x・画面には出さない）→ ファイルを選ぶ。モーダルではなく画面（一覧の「CSV取込」から移る）。画像は代用の画面（値引きマスタの CSV取込）。", ""],
     "items": CSV_HEAD + csv_defs() + CSV_STEP1},
    {"id": "031", "code": "AW_BRCH_004", "state": ["確認・登録（ステップ2）", ""], "url": "/ops/branches/import", "setup": 'const sleep=ms=>new Promise(r=>setTimeout(r,ms));const q=s=>document.querySelector(s);const res=await fetch(\'/api/domain/csv/export\',{method:\'POST\',credentials:\'include\',headers:{\'Content-Type\':\'application/json\',\'x-es-site\':\'ops\'},body:JSON.stringify({args:{entity:\'discounts\',scope:{site:\'ops\'}}})});const t=await res.json();const esc=v=>\'\\"\'+String(v??\'\').replace(/\\"/g,\'\\"\\"\')+\'\\"\';const rows=[t.head,...t.rows];rows[1][1]=rows[1][1]+\' 改\';const bad=t.rows[0].slice();bad[0]=\'XX999999\';rows.push(bad);const text=\'\\ufeff\'+rows.map(r=>r.map(esc).join(\',\')).join(\'\\r\\n\');const inp=q(\'#sec-csv input[type=file]\');const dt=new DataTransfer();dt.items.add(new File([text],\'取込テスト.csv\',{type:\'text/csv\'}));inp.files=dt.files;inp.dispatchEvent(new Event(\'change\',{bubbles:true}));await sleep(2500);window.scrollTo(0,q(\'#sec-csv\').offsetTop-80);', "full": True, "wait": 600,
     "note": ["ファイルを選んだ直後。画像は代用の画面（値引きマスタの CSV取込）で、見本は CSV出力のファイルに1行目の値を変え（更新の見本）、キーが誤りの行を1つ足したもの。拠点の見本ではない。", ""],
     "items": CSV_STEP2},
]

_SETUP031 = V_CSV[1]["setup"]

# ================================================================ 追加の状態（レビュー QA/BA 2026-10-05）。コードにない画面・状態は sel＝"-"（図だけ）
def X(no, ja, vi, d=None, dv=None, sel="-", kind="label", trig="view", cond=None, demo=None, **kw):
    TR.setdefault(ja, uni(vi))
    if d:
        kw["detail"] = D(d, dv)
    if cond:
        kw["cond"] = D(*cond)
    if demo:
        kw["demo_ok"] = D(*demo)
    return F(no, ja, sel, kind, trig, **kw)


def ST(vid, code, state, note, items, url, **kw):
    TR.setdefault(state[0], uni(state[1]))
    TR.setdefault(note[0], uni(note[1]))
    d = {"id": vid, "code": code, "state": [state[0], ""], "url": url, "setup": kw.pop("setup", ""), "full": kw.pop("full", False), "wait": kw.pop("wait", 600),
         "note": [note[0], ""], "items": items}
    d.update(kw)
    return d


DOK_NEW = ("コードにない（宿題）。台帳・仕様どおりに設計。画像は代用の画面（詳細／編集）", "Chưa có trong code (宿題). Thiết kế theo sổ quyết định / spec. Hình dùng màn hình chi tiết / chỉnh sửa thay thế")
DOK_CSV = ("コードの拠点一覧にはまだ画面がない（モーダル）。台帳 E「CSV取込の画面」どおり画面として設計。画像は共通の CSV取込画面（値引きマスタ）で代用（宿題 S5）",
           "Trong code chưa có màn hình cho danh sách chi nhánh (vẫn là modal). Thiết kế thành màn hình theo sổ quyết định E 「CSV取込の画面」. Hình ảnh dùng màn hình nhập CSV chung (master giảm giá) thay thế (宿題 S5)")
CSV_URL = "/ops/branches/import"

V_NEW = [
    # ---------------- AW_BRCH_001
    ST("041", "AW_BRCH_001", ("並べ替えた一覧", "Danh sách đã sắp xếp"), ("列見出しを押して並べ替えたとき。矢印で昇順・降順を示す。", "Khi bấm tiêu đề cột để sắp xếp. Mũi tên chỉ thị tăng dần / giảm dần."),
       [X("11", "並べ替えた一覧", "Danh sách đã sắp xếp", "押した列に矢印（▲昇順・▼降順）を出し、もう一度押すと降順、もう一度で初期（登録日時の新しい順）。同じ値の行は拠点IDの昇順、空の値は最後（3.16）。", "Mũi tên (▲ tăng dần, ▼ giảm dần) hiện ở cột đã bấm; bấm lần nữa thì giảm dần, lần nữa thì về ban đầu (ngày giờ đăng ký mới nhất trước). Các dòng cùng giá trị xếp theo ID chi nhánh tăng dần, giá trị trống ở cuối (3.16).", kind="table", demo=("コードは並びが登録順の固定で、並べ替えの UI がない（宿題 S1）。仕様が正", "Code cố định thứ tự theo thứ tự đăng ký, không có UI sắp xếp (宿題 S1). Spec đúng"))],
       "/ops/branches"),
    ST("042", "AW_BRCH_001", ("一覧の読み込みに失敗（W103）", "Tải danh sách thất bại (W103)"), ("一覧の読み込みに失敗したとき。表の中に W103 と「再読み込み」を出す。", "Khi tải danh sách thất bại. Hiện W103 và 「再読み込み」 trong bảng."),
       [X("12.1", "一覧の読込中", "Đang tải danh sách", "I103（読み込み中です。）と薄い枠（スケルトン）を表の中に出す。検索・並べ替え・ページ送りは押せない。", "Hiện I103 và khung mờ (skeleton) trong bảng. Không bấm được tìm kiếm / sắp xếp / phân trang.", kind="label", err=["I103"], demo=DOK_NEW),
        X("12", "一覧の読み込み失敗", "Tải danh sách thất bại", "表の中に W103（一覧を読み込めませんでした。時間をおいて、もう一度お試しください。）を1行で出し、「再読み込み」で読み直す。ログインが切れていたときは、その場でログインの小窓を出して続ける（入力の共通基準）。", "Hiện W103 trong 1 dòng của bảng và 「再読み込み」 để tải lại. Nếu hết phiên đăng nhập thì hiện cửa sổ đăng nhập tại chỗ để tiếp tục (chuẩn nhập chung).", err=["W103"], demo=DOK_NEW)],
       "/ops/branches"),
    # ---------------- AW_BRCH_002
    ST("043", "AW_BRCH_002", ("物流（拠点管理 R/U）で開く", "Mở bằng logistics (quản lý chi nhánh R/U)"), ("物流（Ad00011）で詳細を開いたとき。拠点の編集とアカウントの操作は出るが、親契約・子契約の操作（延長・先まで作る）と CSV取込は出ない。", "Khi mở chi tiết bằng logistics (Ad00011). Có chỉnh sửa chi nhánh và thao tác tài khoản, nhưng không có thao tác hợp đồng cha / con (gia hạn, tạo trước) và nhập CSV."),
       [X("28", "物流（R/U）の画面", "Màn hình của logistics (R/U)", "権限表：拠点管理＝R/U、プラン契約管理＝R。", "Bảng quyền: quản lý chi nhánh = R/U, quản lý hợp đồng plan = R.", sel=".phead", kind="area"),
        X("28.1", "編集", "Chỉnh sửa", "出す（拠点管理の編集権限）。編集の画面では親契約の項目は参照だけ（状態 056）。", "Có hiện (quyền chỉnh sửa quản lý chi nhánh). Ở màn hình chỉnh sửa, mục của hợp đồng cha chỉ xem (trạng thái 056).", sel=".pbtn button.save", kind="button", trig="click", cond=(CAN_U, TR[CAN_U])),
        X("28.2", "アカウントの操作", "Thao tác tài khoản", "出す（拠点の編集権限・運営A Q9）。", "Có hiện (quyền chỉnh sửa chi nhánh; vận hành A Q9).", kind="button", trig="click", demo=(H_ACC, TR[H_ACC])),
        X("28.3", "お試しの延長・子契約を先まで作る", "Gia hạn dùng thử・tạo trước hợp đồng con", "出さない（お試しの延長＝プラン契約管理の編集権限、子契約を先まで作る＝作成権限。物流は R）。", "Không hiện (gia hạn dùng thử = quyền chỉnh sửa quản lý hợp đồng plan, tạo trước hợp đồng con = quyền tạo; logistics chỉ R).", kind="button", trig="click")],
       "/ops/branches/CU00643", login="Ad00011"),
    ST("044", "AW_BRCH_002", ("アカウント：ログイン案内の再送の確認（Q105）", "Tài khoản: xác nhận gửi lại hướng dẫn đăng nhập (Q105)"), ("アカウントの「ログイン案内の再送」を押したとき。", "Khi bấm 「ログイン案内の再送」 ở mục tài khoản."),
       [X("29", "確認ダイアログ（ログイン案内の再送）", "Hộp thoại xác nhận (gửi lại hướng dẫn đăng nhập)", "Q105。対象の拠点アカウントID・宛先（その拠点のメイン・サブ・請求担当者）を差し込む。", "Q105. Điền ID tài khoản chi nhánh và người nhận (người phụ trách chính, phụ, thanh toán của chi nhánh đó).", kind="modal", trig="show", err=["Q105"], demo=DOK_NEW),
        X("29.1", "キャンセル", "Hủy", "閉じる。何もしない。", "Đóng. Không làm gì.", kind="button", trig="click"),
        X("29.2", "再送する", "Gửi lại", "実行して閉じ、S101 のトーストを出す。変更履歴に残る（操作＝ログイン案内の再送）。通信に失敗したら E30。", "Thực hiện rồi đóng, hiện toast S101. Được lưu vào lịch sử thay đổi (thao tác = gửi lại hướng dẫn đăng nhập). Lỗi kết nối thì E30.", kind="button", trig="click", err=["S101", "E30"])],
       "/ops/branches/CU00643"),
    ST("045", "AW_BRCH_002", ("アカウント：停止の確認（Q106）", "Tài khoản: xác nhận dừng (Q106)"), ("アカウントの「アカウントの停止」を押したとき。", "Khi bấm 「アカウントの停止」 ở mục tài khoản."),
       [X("30", "確認ダイアログ（停止）", "Hộp thoại xác nhận (dừng)", "Q106。対象の拠点アカウントID を差し込む。理由の入力欄は置かない。", "Q106. Điền ID tài khoản chi nhánh. Không đặt ô nhập lý do.", kind="modal", trig="show", err=["Q106"], demo=DOK_NEW),
        X("30.1", "キャンセル", "Hủy", "閉じる。何もしない。", "Đóng. Không làm gì.", kind="button", trig="click"),
        X("30.2", "停止する", "Dừng", "実行して閉じ、S102 のトーストを出す。停止した日時と操作した人を変更履歴に残す。", "Thực hiện rồi đóng, hiện toast S102. Ghi ngày giờ dừng và người thực hiện vào lịch sử thay đổi.", kind="button", trig="click", err=["S102", "E30"])],
       "/ops/branches/CU00643"),
    ST("046", "AW_BRCH_002", ("アカウント：停止中（ボタンが「アカウントの再開」）", "Tài khoản: đã dừng (nút 「アカウントの再開」)"), ("045 で「停止する」を押したあと。ステータスは「停止中」、ボタンは「アカウントの再開」。", "Sau khi bấm 「停止する」 ở 045. Trạng thái là 「停止中」, nút là 「アカウントの再開」."),
       [X("31", "アカウントのステータス（停止中）", "Trạng thái tài khoản (đã dừng)", "停止中（灰）。再開すると元の状態（ログイン済など）に戻る。", "Đã dừng (xám). Mở lại thì về trạng thái trước (ví dụ: đã đăng nhập).", kind="label", err=["S102"], demo=DOK_NEW),
        X("31.1", "アカウントの再開", "Mở lại tài khoản", "停止中のときだけ、「アカウントの停止」の代わりに出す（8.7）。", "Chỉ khi đang dừng thì hiện thay cho 「アカウントの停止」 (8.7).", kind="button", trig="click", err=["Q107"], cond=(CAN_ACC, TR[CAN_ACC]))],
       "/ops/branches/CU00643"),
    ST("047", "AW_BRCH_002", ("アカウント：再開の確認（Q107）", "Tài khoản: xác nhận mở lại (Q107)"), ("「アカウントの再開」を押したとき。", "Khi bấm 「アカウントの再開」."),
       [X("32", "確認ダイアログ（再開）", "Hộp thoại xác nhận (mở lại)", "Q107。対象の拠点アカウントID を差し込む。", "Q107. Điền ID tài khoản chi nhánh.", kind="modal", trig="show", err=["Q107"], demo=DOK_NEW),
        X("32.1", "キャンセル", "Hủy", "閉じる。何もしない。", "Đóng. Không làm gì.", kind="button", trig="click"),
        X("32.2", "再開する", "Mở lại", "実行して閉じ、S103 のトーストを出す。変更履歴に残る。", "Thực hiện rồi đóng, hiện toast S103. Được lưu vào lịch sử thay đổi.", kind="button", trig="click", err=["S103", "E30"])],
       "/ops/branches/CU00643"),
    ST("048", "AW_BRCH_002", ("詳細の中の表：0件・読込中・読込失敗", "Bảng trong chi tiết: 0 dòng, đang tải, tải lỗi"), ("子契約・貸出・オプション・請求書・申請履歴・履歴の表に共通の動き（P-LIST）。", "Hoạt động chung của các bảng hợp đồng con, cho mượn, option, hóa đơn, lịch sử yêu cầu, lịch sử (P-LIST)."),
       [X("33", "詳細の中の表の共通の動き", "Hoạt động chung của bảng trong chi tiết", "各表の動きは 10.13・11.21・12.9・14.13・17.11・18.8。", "Hoạt động từng bảng xem 10.13, 11.21, 12.9, 14.13, 17.11, 18.8.", kind="area", demo=DOK_NEW),
        X("33.1", "0件", "0 dòng", "表の中に I01（表示するデータがありません。）を1行で出す。子契約がまだない拠点では、「子契約で変更する」などのボタンを押したときだけ E112。", "Hiện I01 trong 1 dòng của bảng. Với chi nhánh chưa có hợp đồng con thì chỉ khi bấm các nút như 「子契約で変更する」 mới hiện E112.", err=["I01", "E112"]),
        X("33.2", "読込中", "Đang tải", "I103（読み込み中です。）と、表の行の代わりに薄い枠（スケルトン）を出す。ボタン・絞り込みは押せない。", "Hiện I103 và khung mờ (skeleton) thay cho các dòng. Không bấm được nút / lọc.", err=["I103"]),
        X("33.3", "読込失敗", "Tải lỗi", "表の中に W103 を出し、「再読み込み」で読み直す。ほかの表・項目は使える。", "Hiện W103 trong bảng và 「再読み込み」 để tải lại. Các bảng / mục khác vẫn dùng được.", err=["W103"])],
       "/ops/branches/CU00643?tab=契約"),
    # ---------------- AW_BRCH_003
    ST("049", "AW_BRCH_003", ("保存に失敗（E30）", "Lưu thất bại (E30)"), ("保存の通信が失敗したとき（またはログインが切れていたとき）。", "Khi kết nối lưu thất bại (hoặc hết phiên đăng nhập)."),
       [X("21", "保存の失敗", "Lưu thất bại", "E30 のトーストを出す。入力は残し、保存ボタンをまた押せるようにする。ログインが切れていたときは、その場でログインの小窓を出し、ログイン後に保存を続ける（下書きは保存しない・入力の共通基準）。", "Hiện toast E30. Giữ nguyên nội dung nhập và cho bấm lại nút lưu. Nếu hết phiên đăng nhập thì hiện cửa sổ đăng nhập tại chỗ và tiếp tục lưu sau khi đăng nhập (không lưu nháp; chuẩn nhập chung).", kind="toast", trig="show", err=["E30"], demo=DOK_NEW)],
       "/ops/branches/CU00643/edit"),
    ST("050", "AW_BRCH_003", ("権限がなく保存できない（E32）", "Không có quyền nên không lưu được (E32)"), ("画面のボタンは隠れていても、URL や通信で直接保存を送ったとき（サーバーが拒否）。", "Khi gửi lưu trực tiếp qua URL / kết nối dù nút đã bị ẩn (máy chủ từ chối)."),
       [X("22", "権限がない保存", "Lưu không có quyền", "E32 のトーストを出し、保存しない。権限がない役割（参照だけの役割）が編集の画面を直接開いても、詳細と同じ表示になる（状態 015 の注記）。そのとき画面の上に「この画面を編集する権限がありません（参照のみ）」の1行を出し、黙って切り替えない（提案。台帳に行なし）。", "Hiện toast E32 và không lưu. Nếu vai trò không có quyền (chỉ xem) mở trực tiếp màn hình chỉnh sửa thì vẫn hiển thị giống chi tiết (ghi chú ở trạng thái 015). Khi đó hiện 1 dòng 「この画面を編集する権限がありません（参照のみ）」 ở đầu màn hình, không chuyển im lặng.", kind="toast", trig="show", err=["E32"], demo=DOK_NEW)],
       "/ops/branches/CU00643/edit"),
    ST("051", "AW_BRCH_003", ("ほかの人が先に保存（E31 の警告モーダル）", "Người khác lưu trước (modal cảnh báo E31)"), ("ほかの人が先に保存していたとき。「上書きして保存」で保存できる（台帳 E 2026-10-05）。", "Khi người khác đã lưu trước. Bấm 「上書きして保存」 để lưu (sổ quyết định E 2026-10-05)."),
       [X("23", "同時更新の警告（E31）", "Cảnh báo cập nhật đồng thời (E31)", "警告のモーダル「他のユーザーにより内容が更新されています。上書きすると保存されます。」。共通の I02（編集中の帯）の文言「あとから保存した方がエラーになります」とは食い違う（共通メッセージはここでは直さない・phiên gộp で調整）。", "Modal cảnh báo 「他のユーザーにより内容が更新されています。上書きすると保存されます。」. Mâu thuẫn với câu I02 chung (dải đang sửa) 「あとから保存した方がエラーになります」 (không sửa thông báo chung ở đây; phiên gộp sẽ điều chỉnh).", kind="modal", trig="show", err=["E31", "I02"], demo=DOK_NEW),
        X("23.1", "キャンセル", "Hủy", "閉じて編集を続ける。保存しない。", "Đóng và tiếp tục chỉnh sửa. Không lưu.", kind="button", trig="click"),
        X("23.2", "上書きして保存", "Ghi đè và lưu", "上書きして保存し、S01 を出して詳細へ移る。変更履歴に残る。", "Ghi đè rồi lưu, hiện S01 và sang chi tiết. Được lưu vào lịch sử thay đổi.", kind="button", trig="click", err=["S01"])],
       "/ops/branches/CU00643/edit"),
    ST("052", "AW_BRCH_003", ("承認待ちの変更申請がある項目（直接編集を止める）", "Mục có yêu cầu thay đổi đang chờ phê duyệt (dừng chỉnh sửa trực tiếp)"), ("法人Web から出された変更申請（請求先・支払方法など）が承認待ちの項目。", "Mục có yêu cầu thay đổi từ Web pháp nhân (bên nhận hóa đơn, phương thức thanh toán, v.v.) đang chờ phê duyệt."),
       [X("24", "承認待ちの申請がある項目", "Mục có yêu cầu đang chờ phê duyệt", "対象の項目は非活性にし、項目の下に I102（承認待ちの変更申請（{申請番号}）があるため、ここでは変更できません。承認または却下されると変更できます。）を出す（台帳 K）。承認のとき変更前と今の値が違えば、承認は止まる（運営Aの契約申請管理）。", "Mục liên quan bị vô hiệu và hiện I102 dưới mục (vì có yêu cầu thay đổi {số đơn} đang chờ phê duyệt nên không đổi được ở đây; đổi được sau khi được duyệt hoặc từ chối) (sổ quyết định K). Khi phê duyệt, nếu giá trị trước khi đổi khác giá trị hiện tại thì việc phê duyệt dừng lại (契約申請管理 của vận hành A).", kind="area", err=["I102"], demo=DOK_NEW)],
       "/ops/branches/CU00643/edit?tab=請求"),
    ST("053", "AW_BRCH_003", ("設置フロアが未入力（自販機を後から追加した拠点）", "Chưa nhập tầng lắp đặt (chi nhánh thêm máy bán hàng tự động sau)"), ("貸出中の設備に自動販売機があるのに、設置フロアが空の拠点を保存したとき。", "Khi lưu chi nhánh có máy bán hàng tự động đang cho mượn nhưng tầng lắp đặt để trống."),
       [X("25", "設置フロアが必須のエラー", "Lỗi bắt buộc tầng lắp đặt", "貸出中の設備に自動販売機が1つでもあれば設置フロアは必須。空のまま保存すると E01 を設置フロアの下に出し、基本情報タブを開いて赤い印を付ける（保存しない）。設備は子契約の「設備の異動」で増えるため、あとから追加された拠点でも同じ。CSV の行でも E01（2.x の設置フロア）。", "Nếu có ít nhất 1 máy bán hàng tự động đang cho mượn thì tầng lắp đặt bắt buộc. Lưu khi để trống thì hiện E01 dưới ô tầng lắp đặt, mở tab Thông tin cơ bản và đánh dấu đỏ (không lưu). Thiết bị tăng qua 「設備の異動」 của hợp đồng con nên chi nhánh được thêm sau cũng như vậy. Dòng CSV cũng là E01 (tầng lắp đặt ở 2.x).", kind="area", err=["E01"], demo=DOK_NEW)],
       "/ops/branches/CU00643/edit"),
    ST("054", "AW_BRCH_003", ("閉鎖への変更の確認（Q01）", "Xác nhận đổi sang đã đóng (Q01)"), ("拠点ステータスを「閉鎖」に変えて「保存」を押したとき。", "Khi đổi trạng thái chi nhánh sang 「閉鎖」 rồi bấm 「保存」."),
       [X("26", "閉鎖への変更の確認", "Xác nhận đổi sang đã đóng", "Q01（ボタン名＝「閉鎖に変更する」）。閉鎖は戻せない（5.6）。本文の上に「閉鎖は元に戻せません。契約・アカウント・設備は自動では変わりません。最後の拠点を閉鎖すると法人は休眠になります。」を足して出す（Q01 は共通の文言。子契約の取消・アカウント停止・設備回収予定は自動では動かない旨は 5.6 にも書く）。", "Q01 (tên nút = 「閉鎖に変更する」). Đã đóng không quay lại được (5.6). Thêm dòng 「閉鎖は元に戻せません。契約・アカウント・設備は自動では変わりません。最後の拠点を閉鎖すると法人は休眠になります。」 phía trên nội dung (Q01 là câu chung; việc hủy hợp đồng con, dừng tài khoản, lịch thu hồi thiết bị không tự chạy cũng ghi ở 5.6).", kind="modal", trig="show", err=["Q01"], demo=DOK_NEW),
        X("26.1", "キャンセル", "Hủy", "閉じて編集を続ける。", "Đóng và tiếp tục chỉnh sửa.", kind="button", trig="click"),
        X("26.2", "閉鎖に変更する", "Đổi sang đã đóng", "保存して S01 を出し、詳細へ移る。", "Lưu, hiện S01 và sang chi tiết.", kind="button", trig="click", err=["S01"])],
       "/ops/branches/CU00643/edit"),
    ST("055", "AW_BRCH_003", ("添付資料のエラー（形式・件数・容量）", "Lỗi tài liệu đính kèm (định dạng, số tệp, dung lượng)"), ("JPG・PNG・PDF・HEIC 以外のファイルや、5MB・10件を超えるファイルを選んだとき。", "Khi chọn tệp ngoài JPG, PNG, PDF, HEIC hoặc vượt quá 5MB / 10 tệp."),
       [X("27", "添付のエラー", "Lỗi tệp đính kèm", "形式が違うとき（Excel・Word など）は E119、5MB を超える・10件を超えるときは E11 を、その欄の下に出す。選んだファイルは添付しない。", "Sai định dạng (Excel, Word, v.v.) hiện E119; quá 5MB hoặc quá 10 tệp hiện E11 dưới ô đó. Tệp đã chọn không được đính kèm.", kind="area", err=["E11", "E119"], demo=DOK_NEW)],
       "/ops/branches/CU00643/edit?tab=資料・履歴"),
    ST("058", "AW_BRCH_001", ("詳細条件を開いた・絞り込み中", "Mở điều kiện chi tiết, đang lọc"), ("「詳細条件」を開いたとき、または詳細条件に値が入ったまま閉じたとき（「詳細条件（n件適用中）」）。", "Khi mở 「詳細条件」, hoặc đóng khi vẫn còn giá trị trong điều kiện chi tiết (「詳細条件（n件適用中）」)."),
       [X("13", "詳細条件を開いた", "Mở điều kiện chi tiết", "2.2・2.5・2.7〜2.11 の欄が出る。aria-expanded＝true。2.10・2.11 に E08 が出たときは自動で開き、その欄にフォーカスする。", "Các ô 2.2・2.5・2.7 ~ 2.11 hiện ra. aria-expanded = true. Khi E08 xuất hiện ở 2.10・2.11 thì tự mở và focus vào ô đó.", kind="area", demo=DOK_NEW),
        X("13.1", "n件適用中", "n điều kiện đang áp dụng", "閉じているときのボタンの名前「詳細条件（n件適用中）」。n＝値が入っている詳細条件の欄の数（「から・まで」の組は1）。0件のときは「詳細条件」だけ。", "Tên nút khi đóng: 「詳細条件（n件適用中）」. n = số ô điều kiện chi tiết đang có giá trị (cặp 「から・まで」 tính là 1). Nếu 0 thì chỉ hiện 「詳細条件」.", kind="label")],
       "/ops/branches"),
    ST("059", "AW_BRCH_003", ("ほかの人が編集中（I02 の帯）", "Người khác đang chỉnh sửa (dải I02)"), ("ほかの人が同じ拠点の編集の画面を開いているとき。保存は止めない。", "Khi người khác đang mở màn hình chỉnh sửa của cùng chi nhánh. Không chặn lưu."),
       [X("30", "編集中の帯（I02）", "Dải đang chỉnh sửa (I02)", "画面の上に I02（{名前}さんが編集中です（{時刻}〜）。同時に保存すると、あとから保存した方がエラーになります。）を出す。ロックはしない。保存したときにほかの人が先に保存していれば E31 のモーダル（状態 051）。I02 の文言は E31（上書き）と食い違う（共通メッセージはここでは直さない・phiên gộp で調整）。", "Hiện I02 ở đầu màn hình ({tên} đang sửa (từ {giờ}); nếu cùng lưu, người lưu sau sẽ bị lỗi). Không khóa. Khi lưu mà người khác đã lưu trước thì modal E31 (trạng thái 051). Câu I02 mâu thuẫn với E31 (ghi đè) (không sửa thông báo chung ở đây; phiên gộp sẽ điều chỉnh).", kind="label", err=["I02", "E31"], demo=DOK_NEW)],
       "/ops/branches/CU00643/edit"),
    ST("060", "AW_BRCH_002", ("所属法人の付け替えの確認（Q01）", "Xác nhận chuyển pháp nhân trực thuộc (Q01)"), ("システム管理で「所属法人の付け替え」を押したとき（Claude 提案・hong 承認済み方向）。", "Khi quản trị hệ thống bấm 「所属法人の付け替え」 (Claude đề xuất, hướng đã được hong chấp thuận)."),
       [X("35", "確認ダイアログ（所属法人の付け替え）", "Hộp thoại xác nhận (chuyển pháp nhân trực thuộc)", "確認の小窓は警告マークつき（OpConfirm）で、最初のフォーカスはキャンセル。新しい所属法人の候補（正式登録・休眠の法人だけ・今の法人は除く・I14）の件数を出し、該当する法人がなければ「該当なし」と出す。Q01（ボタン名＝「付け替える」）に、影響を並べて見せる。実行すると、画面の「保存」とは別に、その場でただちに保存される。", "Hộp thoại xác nhận có dấu cảnh báo (OpConfirm), focus ban đầu ở nút hủy. Hiện số pháp nhân ứng viên (chỉ pháp nhân đăng ký chính thức・休眠, loại trừ pháp nhân hiện tại; I14) và 「該当なし」 nếu không có. Q01 (tên nút = 「付け替える」) kèm danh sách ảnh hưởng. Khi thực hiện được lưu ngay tại chỗ, tách khỏi nút 「保存」 của màn hình.", kind="modal", trig="show", err=["Q01"], demo=DOK_NEW),
        X("35.1", "新しい所属法人", "Pháp nhân trực thuộc mới", "法人ID・法人名で絞り込んで選ぶ（今の法人と同じは選べない）。", "Chọn bằng cách lọc theo ID / tên pháp nhân (không chọn được pháp nhân hiện tại).", kind="select", trig="select", req="○", len="選択（法人マスタの法人。法人ID・法人名で絞り込み検索）", init="未選択", ex="CU00001 株式会社サンプル", err=["E02"]),
        X("35.2", "影響の表示", "Hiển thị ảnh hưởng", "請求先・請求条件は新しい法人のものに直す。変更履歴（P-HIST）に「操作＝付け替え」の行を残す（変更前・変更後＝法人）。発行済み・確定済みの請求書と承認待ちの申請があれば、そもそも押せない（5.12）。", "Bên nhận hóa đơn và điều kiện thanh toán được đổi theo pháp nhân mới. Ghi dòng 「thao tác = 付け替え」 vào lịch sử thay đổi (P-HIST) (trước / sau = pháp nhân). Nếu có hóa đơn đã phát hành / đã chốt hoặc yêu cầu chờ phê duyệt thì không bấm được (5.12)."),
        X("35.3", "キャンセル", "Hủy", "閉じる。何もしない。", "Đóng. Không làm gì.", kind="button", trig="click"),
        X("35.4", "付け替える", "Chuyển", "実行して閉じ、S107 のトーストを出す。通信に失敗したら E30、権限がなければ E32。", "Thực hiện rồi đóng, hiện toast S107. Lỗi kết nối thì E30, không có quyền thì E32.", kind="button", trig="click", err=["S107", "E30", "E32"])],
       "/ops/branches/CU00643"),
    ST("061", "AW_BRCH_002", ("所属法人の付け替えができない（非活性）", "Không thể chuyển pháp nhân trực thuộc (vô hiệu)"), ("発行済み・確定済みの請求書がある、または承認待ちの申請がある拠点。", "Chi nhánh có hóa đơn đã phát hành / đã chốt, hoặc có yêu cầu chờ phê duyệt."),
       [X("36", "付け替えの非活性", "Vô hiệu chuyển pháp nhân", "「所属法人の付け替え」を非活性にして、マウスを置くと理由を出す：請求書があるとき I105、承認待ちの申請があるとき I102。", "Vô hiệu nút 「所属法人の付け替え」 và hiện lý do khi đặt chuột: có hóa đơn là I105, có yêu cầu chờ phê duyệt là I102.", kind="button", trig="click", err=["I105", "I102"], demo=DOK_NEW)],
       "/ops/branches/CU00643"),
    ST("062", "AW_BRCH_002", ("所属法人を付け替えた（S107）", "Đã chuyển pháp nhân trực thuộc (S107)"), ("付け替えを実行したあと。", "Sau khi thực hiện chuyển."),
       [X("37", "付け替えの完了", "Hoàn tất chuyển", "S107 のトーストを出し、詳細の所属法人（5.3）と請求先・請求条件を新しい値に直して見せる。変更履歴に「付け替え」の行が1つ足される。", "Hiện toast S107 và hiển thị lại pháp nhân trực thuộc (5.3), bên nhận hóa đơn và điều kiện thanh toán theo giá trị mới. Lịch sử thay đổi có thêm 1 dòng 「付け替え」.", kind="toast", trig="show", err=["S107"], demo=DOK_NEW)],
       "/ops/branches/CU00643"),
    ST("063", "AW_BRCH_002", ("本導入への切替の確認（Q01）", "Xác nhận chuyển sang triển khai chính thức (Q01)"), ("お試しキャンペーンの拠点で「本導入に切り替える」を押したとき。", "Khi bấm 「本導入に切り替える」 ở chi nhánh chiến dịch dùng thử."),
       [X("38", "確認ダイアログ（本導入への切替）", "Hộp thoại xác nhận (chuyển sang triển khai chính thức)", "確認の小窓は警告マークつき（OpConfirm）で、最初のフォーカスはキャンセル。Q01（ボタン名＝「本導入に切り替える」）。お試しキャンペーン割引が付かなくなる、本導入の開始日から最低利用期間・違約金を数える、を見せる。実行するとその場でただちに保存し、親契約の「契約種別の履歴」に1行足す。", "Hộp thoại xác nhận có dấu cảnh báo (OpConfirm), focus ban đầu ở nút hủy. Q01 (tên nút = 「本導入に切り替える」). Cho thấy giảm giá chiến dịch dùng thử không còn áp dụng, thời gian sử dụng tối thiểu / phí vi phạm tính từ ngày bắt đầu triển khai chính thức. Thực hiện thì lưu ngay và thêm 1 dòng vào 「契約種別の履歴」 của hợp đồng cha.", kind="modal", trig="show", err=["Q01"], demo=DOK_NEW),
        X("38.1", "キャンセル", "Hủy", "閉じる。何もしない。", "Đóng. Không làm gì.", kind="button", trig="click"),
        X("38.2", "本導入に切り替える", "Chuyển sang triển khai chính thức", "実行して閉じ、S108 のトーストを出す。履歴の表に「本導入」の行が足される。", "Thực hiện rồi đóng, hiện toast S108. Bảng lịch sử có thêm dòng 「本導入」.", kind="button", trig="click", err=["S108", "E30", "E32"])],
       "/ops/branches/CU00975?tab=契約"),
    ST("064", "AW_BRCH_002", ("本導入に切り替えられない（非活性）", "Không thể chuyển sang triển khai chính thức (vô hiệu)"), ("契約種別が本導入の拠点（お試しキャンペーンでない）。", "Chi nhánh có loại hợp đồng là triển khai chính thức (không phải chiến dịch dùng thử)."),
       [X("39", "切替の非活性", "Vô hiệu chuyển đổi", "「本導入に切り替える」を非活性にして、マウスを置くと理由 I106 を出す。承認待ちの申請があるときは I102。", "Vô hiệu nút 「本導入に切り替える」 và hiện lý do I106 khi đặt chuột. Có yêu cầu chờ phê duyệt thì I102.", kind="button", trig="click", err=["I106", "I102"], demo=DOK_NEW)],
       "/ops/branches/CU00643?tab=契約"),
    ST("065", "AW_BRCH_002", ("取消の拠点（全項目が参照のみ）", "Chi nhánh đã hủy (mọi mục chỉ xem)"), ("拠点ステータスが取消の拠点（見本 CU01320 サンプル 取消支店）を開いたとき。", "Khi mở chi nhánh có trạng thái hủy (mẫu CU01320 chi nhánh hủy Sample)."),
       [X("40", "取消の拠点", "Chi nhánh đã hủy", "編集のボタンを出さず、ページ上部に I107（取消の拠点は編集できません（参照のみ））を出す。編集の画面を直接開いても詳細と同じ表示になる。", "Không hiện nút chỉnh sửa, hiện I107 (chi nhánh đã hủy không chỉnh sửa được (chỉ xem)) ở đầu trang. Mở trực tiếp màn hình chỉnh sửa vẫn hiển thị giống chi tiết.", sel=".provbar", kind="area", err=["I107"]),
        X("40.1", "付け替え（取消で非活性）", "Chuyển pháp nhân (vô hiệu vì đã hủy)", "「所属法人の付け替え」は非活性で、理由 I107 をボタンの横に出す。", "「所属法人の付け替え」 bị vô hiệu, hiện lý do I107 cạnh nút.", sel=".f button::所属法人の付け替え", kind="button", trig="click", err=["I107"]),
        X("40.2", "アカウントのステータス（取消の拠点）", "Trạng thái tài khoản (chi nhánh đã hủy)", "取消の拠点のアカウントは「停止中」と出し、ボタンは「アカウントの再開」だけ（非活性）。", "Tài khoản của chi nhánh đã hủy hiện 「停止中」, nút chỉ có 「アカウントの再開」 (vô hiệu).", sel="label::アカウントのステータス^", kind="label")],
       "/ops/branches/CU01320"),
    ST("067", "AW_BRCH_002", ("取消の拠点：契約タブ（切替・延長が非活性）", "Chi nhánh đã hủy: tab Hợp đồng (chuyển đổi・gia hạn bị vô hiệu)"), ("取消の拠点の契約タブ。", "Tab Hợp đồng của chi nhánh đã hủy."),
       [X("41", "切替（取消で非活性）", "Chuyển đổi (vô hiệu vì đã hủy)", "「本導入に切り替える」は非活性で、理由 I107 をボタンの横に出す。", "「本導入に切り替える」 bị vô hiệu, hiện lý do I107 cạnh nút.", sel=".f button::本導入に切り替える", kind="button", trig="click", err=["I107"]),
        X("41.1", "延長（取消で非活性）", "Gia hạn (vô hiệu vì đã hủy)", "「お試しを延長する」は非活性で、理由 I107 をボタンの横に出す。", "「お試しを延長する」 bị vô hiệu, hiện lý do I107 cạnh nút.", sel=".f button::お試しを延長する", kind="button", trig="click", err=["I107"])],
       "/ops/branches/CU01320?tab=契約"),
    ST("068", "AW_BRCH_003", ("取消の拠点の編集の画面（詳細と同じ表示）", "Màn hình chỉnh sửa của chi nhánh đã hủy (hiển thị giống chi tiết)"), ("取消の拠点の編集の画面を URL で直接開いたとき。", "Khi mở trực tiếp màn hình chỉnh sửa của chi nhánh đã hủy bằng URL."),
       [X("32", "取消の拠点の編集", "Chỉnh sửa chi nhánh đã hủy", "入力欄は出さず、詳細と同じ表示にして I107 を出す（保存のボタンもない）。", "Không hiện ô nhập, hiển thị giống chi tiết và hiện I107 (cũng không có nút lưu).", sel=".provbar", kind="area", err=["I107"])],
       "/ops/branches/CU01320/edit"),
    ST("066", "AW_BRCH_003", ("閉鎖の拠点の編集（担当者と請求書の送り先メールだけ）", "Chỉnh sửa chi nhánh đã đóng (chỉ người phụ trách và email nhận hóa đơn)"), ("拠点ステータスが閉鎖の拠点の編集の画面。ほかの項目は参照のみ。", "Màn hình chỉnh sửa của chi nhánh có trạng thái đã đóng. Các mục khác chỉ xem."),
       [X("31", "閉鎖の拠点の編集", "Chỉnh sửa chi nhánh đã đóng", "ページ上部に I108（閉鎖の拠点は、担当者と請求書の送り先メールだけ編集できます。）を出す。編集できるのは担当者の表（7）の全項目（区分・氏名・フリガナ・メール・電話・行の追加／削除。請求書の送り先メール＝請求担当者の行を含む）だけ。ほかの項目は参照のみ（担当者の表全体を直せる：hong 2026-10-08 QC4）。閉鎖予定・そのほかの拠点は通常どおり編集できる。", "Hiện I108 (chi nhánh đã đóng chỉ sửa được người phụ trách và email nhận hóa đơn) ở đầu trang. Chỉ sửa được toàn bộ các mục của bảng người phụ trách (7) (loại・họ tên・furigana・email・điện thoại・thêm/xóa dòng; gồm cả dòng người phụ trách thanh toán = email nhận hóa đơn). Các mục khác chỉ xem (sửa được cả bảng người phụ trách: hong 2026-10-08 QC4). Chi nhánh dự kiến đóng và các trạng thái khác sửa bình thường.", kind="area", err=["I108"], demo=DOK_NEW)],
       "/ops/branches/CU00588/edit"),
    ST("057", "AW_BRCH_002", ("アカウント：メールの送信に失敗（W104）", "Tài khoản: gửi email thất bại (W104)"), ("パスワード再設定の案内・ログイン案内の再送で、メールを送れなかったとき。", "Khi không gửi được email hướng dẫn đặt lại mật khẩu / gửi lại hướng dẫn đăng nhập."),
       [X("34", "メールの送信失敗", "Gửi email thất bại", "W104（メールを送れませんでした。時間をおいて、もう一度お試しください。）をトーストに出す。送れなかった操作は変更履歴に残さない。通信そのものの失敗は E30、権限がないときは E32。", "Hiện W104 (không gửi được email; hãy thử lại sau) ở toast. Thao tác không gửi được thì không lưu vào lịch sử thay đổi. Lỗi kết nối là E30, không có quyền là E32.", kind="toast", trig="show", err=["W104", "E30", "E32"], demo=DOK_NEW)],
       "/ops/branches/CU00643"),
    ST("056", "AW_BRCH_003", ("物流で編集（親契約は参照だけ）", "Chỉnh sửa bằng logistics (hợp đồng cha chỉ xem)"), ("物流（Ad00011）で編集の契約タブを開いたとき。拠点管理は R/U だがプラン契約管理は R なので、親契約の項目は参照だけ。", "Khi mở tab Hợp đồng của chỉnh sửa bằng logistics (Ad00011). Quản lý chi nhánh là R/U nhưng quản lý hợp đồng plan là R nên mục hợp đồng cha chỉ xem."),
       [X("28", "親契約（物流は参照だけ）", "Hợp đồng cha (logistics chỉ xem)", "親契約の項目の保存はプラン契約管理の編集権限（R/U 以上：フル権限・システム管理・CS）。物流は拠点の編集の画面を開けるが親契約は参照だけ。CS は拠点の編集の画面を開けない（親契約を CS が直す入口は別に決める）。", "Lưu mục của hợp đồng cha cần quyền chỉnh sửa quản lý hợp đồng plan (R/U trở lên: toàn quyền, quản trị hệ thống, CS). Logistics mở được màn hình chỉnh sửa chi nhánh nhưng chỉ xem hợp đồng cha. CS không mở được màn hình chỉnh sửa chi nhánh (lối vào để CS sửa hợp đồng cha sẽ quyết định riêng).", sel=".ch::親契約^", kind="area", demo=("コードは拠点の保存の権限（branches）で親契約も書くため、物流が親契約を直せる。仕様はプラン契約管理の編集権限（運営A Q3）", "Code ghi cả hợp đồng cha bằng quyền lưu chi nhánh (branches) nên logistics sửa được hợp đồng cha. Spec dùng quyền chỉnh sửa quản lý hợp đồng plan (vận hành A Q3)"))],
       "/ops/branches/CU00643/edit?tab=契約", login="Ad00011"),
    # ---------------- AW_BRCH_004（共通のコード：E113 見出し違い／E114 登録できる行なし／E115 参照の列の変更／E116 同じIDで列が違う）
    ST("032", "AW_BRCH_004", ("確認・登録（エラーの行の内訳）", "Xác nhận, đăng ký (chi tiết các dòng lỗi)"), ("エラーの行と更新の行が混ざったファイル。「登録」でエラー以外の行だけ登録する。", "Tệp có cả dòng lỗi và dòng cập nhật. Nhấn 「登録」 chỉ đăng ký các dòng không lỗi."),
       [X("5", "エラーの行の内訳", "Chi tiết các dòng lỗi", "「エラーの行 n件は取り込みません。ほかの行は登録できます。」と、行番号・拠点ID・列名・内容の表（多いときは先頭だけ。全部はエラー一覧CSV）。", "「エラーの行 n件は取り込みません。ほかの行は登録できます。」 + bảng số dòng / ID chi nhánh / tên cột / nội dung (nhiều thì chỉ phần đầu; đủ ở エラー一覧CSV).", sel="#sec-csv .notice.ng", kind="area", demo=DOK_CSV),
        X("5.1", "拠点IDが空欄の行", "Dòng trống ID chi nhánh", "E101（新しい拠点は契約申請管理の代理入力から）。取り込まない。", "E101 (chi nhánh mới đăng ký từ nhập hộ ở 契約申請管理). Không nhập.", err=["E101"]),
        X("5.2", "存在しない拠点IDの行", "Dòng có ID chi nhánh không tồn tại", "E100。その行だけエラーにして、ほかの行は登録する（台帳 F）。存在しない拠点IDの行には E100 だけを出す（ほかの列のエラーは重ねない）。", "E100. Chỉ lỗi riêng dòng đó, các dòng khác vẫn đăng ký (sổ quyết định F). Dòng có ID chi nhánh không tồn tại chỉ hiện E100 (không chồng thêm lỗi của các cột khác).", err=["E100"]),
        X("5.3", "仮登録の拠点の行", "Dòng của chi nhánh đăng ký tạm", "E102（申請詳細で編集する）。取り込まない。", "E102 (sửa ở chi tiết đơn). Không nhập.", err=["E102"]),
        X("5.4", "参照の列を変えた行", "Dòng đã đổi cột tham chiếu", "所属法人ID・所属法人名・旧ES ユーザーID・親契約番号・ログインID・登録日時 が今の値と違う行は E115。同じなら無視する。", "Dòng có ID pháp nhân / tên pháp nhân / ID người dùng ES cũ / số hợp đồng cha / ID đăng nhập / ngày giờ đăng ký khác giá trị hiện tại là E115. Giống thì bỏ qua.", err=["E115"]),
        X("5.5", "同じ拠点IDで列が違う行", "Dòng cùng ID chi nhánh nhưng cột khác nhau", "担当者の数だけ分けた行で、拠点の列の値が行ごとに違うときは E116。", "Khi tách thành nhiều dòng theo số người phụ trách mà giá trị cột của chi nhánh khác nhau giữa các dòng thì E116.", err=["E116"]),
        X("5.6", "入力チェックの行", "Dòng không qua kiểm tra nhập", "列ごとの入力チェック（2.x と AW_BRCH_003 と同じ）に通らない行。", "Dòng không qua kiểm tra nhập theo từng cột (giống 2.x và AW_BRCH_003).", err=["E01", "E02", "E03", "E04", "E05", "E06", "E07", "E08", "E12", "E13", "E14", "W02"]),
        X("5.7", "条件で入力できない列に値がある行", "Dòng có giá trị ở cột không thể nhập theo điều kiện", "例：請求先＝法人の行の支払方法、支払方法が口座振替でない行の手続きステータス、年払いでない行の起算月、本導入の行のお試し期間。E109（「{列名}は、{条件}のときだけ入力できます。」）。黙って無視しない（台帳 F 再レビュー(1)）。", "Ví dụ: phương thức thanh toán ở dòng bên nhận hóa đơn = pháp nhân, trạng thái thủ tục ở dòng phương thức không phải chuyển khoản tự động, tháng bắt đầu tính ở dòng không phải trả theo năm, thời gian dùng thử ở dòng triển khai chính thức. E109 (「{tên cột} chỉ nhập được khi {điều kiện}」). Không bỏ qua im lặng (sổ quyết định F, xem lại (1)).", err=["E109"]),
        X("5.8", "拠点ステータスを戻す・飛ばす行", "Dòng quay lại / nhảy cóc trạng thái chi nhánh", "5.6 と同じ規則（先の状態にだけ変えられる。閉鎖予定→本登録は可）。今の状態より前に戻す・先へ飛ばす行は E118。", "Cùng quy tắc với 5.6 (chỉ đổi sang trạng thái tiếp theo; dự kiến đóng → chính thức được). Dòng quay lại / nhảy cóc trạng thái so với hiện tại là E118.", err=["E118"]),
        X("5.9", "担当者の主・請求が2名以上の行", "Dòng có từ 2 người phụ trách chính / thanh toán", "同じ拠点IDの行で メイン担当者／請求担当者 が2名以上のときは E108（0名のときは E103）。", "Ở các dòng cùng ID chi nhánh, nếu có từ 2 người phụ trách chính / thanh toán thì E108 (0 người là E103).", err=["E108", "E103"]),
        X("5.10", "登録する（更新 n件）", "Đăng ký (cập nhật n dòng)", "更新の行が1つ以上あるときは、エラーの行があっても押せる。エラーの行は取り込まない（台帳 F）。", "Khi có ≥1 dòng cập nhật thì bấm được dù có dòng lỗi. Dòng lỗi không nhập (sổ quyết định F).", kind="button", trig="click", err=["S104", "E34"])],
       CSV_URL, setup=_SETUP031),
    ST("033", "AW_BRCH_004", ("ファイル全体のエラー（形式・見出し）", "Lỗi cả tệp (định dạng, tiêu đề)"), ("UTF-8 でない・.csv でない・読めないファイル、または見出しが違うファイルを選んだとき。", "Khi chọn tệp không phải UTF-8 / không phải .csv / không đọc được, hoặc tệp có tiêu đề khác."),
       [X("6", "ファイル全体のエラー", "Lỗi cả tệp", "ステップ2へ進まず、ステップ1のままエラーの帯を出す（「登録」は出ない）。", "Không sang bước 2, giữ ở bước 1 và hiện dải lỗi (không hiện 「登録」).", kind="area", demo=DOK_CSV),
        X("6.1", ".csv 以外・UTF-8 以外・読めない", "Không phải .csv / UTF-8 / không đọc được", "E51（.xlsx を .csv に名前だけ変えたものも読めないので E51）。", "E51 (tệp .xlsx chỉ đổi tên thành .csv cũng không đọc được nên E51).", err=["E51"]),
        X("6.2", "見出しの列が違う", "Tiêu đề khác cột nhập", "1行目の見出しが 2.x の列と違う（列の不足・知らない列・並び違い）ときは E113。", "Tiêu đề dòng 1 khác các cột ở 2.x (thiếu cột, cột lạ, sai thứ tự) thì E113.", err=["E113"])],
       CSV_URL),
    ST("034", "AW_BRCH_004", ("登録できる行がない（全行エラー）", "Không có dòng đăng ký được (toàn bộ dòng lỗi)"), ("全行がエラーのとき。「登録」は非活性。", "Khi toàn bộ dòng đều lỗi. Nút 「登録」 bị vô hiệu."),
       [X("7", "登録できる行がない", "Không có dòng đăng ký được", "E114 を出し、「登録」を押せなくする（非活性。灰色にして、横に理由の行「更新する行がありません。」を出す）。エラー行をCSVでダウンロードして直し、選び直す。データの行がないファイルは E107（状態 035）。", "Hiện E114 và vô hiệu nút 「登録」 (màu xám, kèm dòng lý do 「更新する行がありません。」 bên cạnh). Tải các dòng lỗi bằng CSV, sửa rồi chọn lại. Tệp không có dòng dữ liệu là E107 (trạng thái 035).", kind="area", err=["E114"], demo=DOK_CSV),
        X("7.1", "登録（非活性）", "Đăng ký (vô hiệu)", "登録できる行がないときは非活性。", "Vô hiệu khi không có dòng nào đăng ký được.", kind="button", trig="click", cond=("登録できる行がないときは非活性", "Vô hiệu khi không có dòng nào đăng ký được"))],
       CSV_URL),
    ST("035", "AW_BRCH_004", ("ファイル全体のエラー（5,001行以上・データの行がない）", "Lỗi cả tệp (từ 5.001 dòng, không có dòng dữ liệu)"), ("データの行が5,000行を超える、またはデータの行が1つもない（空・見出しだけ）ファイルを選んだとき。", "Khi chọn tệp có hơn 5.000 dòng dữ liệu, hoặc không có dòng dữ liệu nào (rỗng, chỉ có tiêu đề)."),
       [X("8", "行数の超過", "Vượt số dòng", "E106（ファイルが5,000行を超えています（n行）。ファイルを分けて取り込んでください。）をステップ1に出す。5,000行ちょうどは取り込める。", "Hiện E106 (tệp vượt 5.000 dòng (n dòng); hãy chia tệp rồi nhập) ở bước 1. Đúng 5.000 dòng thì nhập được.", kind="area", err=["E106"], demo=DOK_CSV),
        X("8.1", "データの行がない", "Không có dòng dữ liệu", "空のファイル・見出しだけのファイルは E107（ファイルにデータの行がありません。見出しの下に1行以上入れてください。）。ステップ1のまま帯を出す。", "Tệp rỗng / chỉ có tiêu đề là E107 (tệp không có dòng dữ liệu; hãy thêm ít nhất 1 dòng dưới tiêu đề). Giữ ở bước 1 và hiện dải lỗi.", err=["E107"])],
       CSV_URL),
    ST("036", "AW_BRCH_004", ("警告あり（「警告を確認しました」）", "Có cảnh báo (「警告を確認しました」)"), ("請求書・送り状に正しく印字できない文字（W02）など、警告があるファイルのとき。", "Khi tệp có cảnh báo, ví dụ ký tự không in đúng trên hóa đơn / phiếu giao hàng (W02)."),
       [X("9", "警告あり", "Có cảnh báo", "警告は登録を止めないが、確認の表に出す。拠点名・住所に印字できない文字がある行は W02。", "Cảnh báo không chặn đăng ký nhưng hiện trong bảng xác nhận. Dòng có ký tự không in được trong tên chi nhánh / địa chỉ là W02.", kind="area", err=["W02", "W102"], demo=DOK_CSV),
        X("9.1", "警告を確認しました", "Tôi đã xác nhận cảnh báo", "チェックボックス（初期 OFF）。ON にするまで「登録」を押せない。", "Checkbox (ban đầu OFF). Chưa bật ON thì chưa bấm được 「登録」.", kind="check", trig="check", req="○", len="チェック", init="OFF", ex="ON"),
        X("9.2", "登録（警告を確認するまで非活性）", "Đăng ký (vô hiệu cho đến khi xác nhận cảnh báo)", "警告があるときは、9.1 が ON になるまで非活性。", "Khi có cảnh báo thì vô hiệu cho đến khi 9.1 là ON.", kind="button", trig="click", cond=("警告があるときは、チェックするまで非活性", "Khi có cảnh báo thì vô hiệu cho đến khi check")),
        X("9.3", "リードタイムの変更の警告", "Cảnh báo đổi thời gian chuẩn bị (lead time)", "請求書発行リードタイムの上書きを変えて、固定額の請求月が重なる・抜ける拠点があるときは、W102（件数つき・法人一覧と共通の文言）を確認の表に出す（画面の保存では W101 のモーダル、CSV では W102）。", "Khi đổi ghi đè thời gian chuẩn bị (lead time) phát hành hóa đơn làm có chi nhánh bị trùng / thiếu tháng yêu cầu số tiền cố định thì hiện W102 (kèm số lượng; câu chung với danh sách pháp nhân) trong bảng xác nhận (lưu trên màn hình là modal W101, CSV là W102).", err=["W102"])],
       CSV_URL),
    ST("037", "AW_BRCH_004", ("100件を超える登録（実行中）", "Đăng ký quá 100 dòng (đang chạy)"), ("更新の行が100件を超えるとき。「登録」を押すと裏で進め、進み具合を出す。", "Khi có hơn 100 dòng cập nhật. Bấm 「登録」 sẽ chạy nền và hiện tiến độ."),
       [X("10", "実行中（進み具合）", "Đang chạy (tiến độ)", "I104（{n}件中{m}件を取り込みました。画面を閉じても取込は続きます。）で進み具合を出す。実行中は「登録」「ファイルを選び直す」を非活性にする。画面を離れても実行は続き（裏で進める）、戻ると進み具合か結果を出す。100件ちょうどまでは待たずに終わる。", "Hiện tiến độ bằng I104 (đã nhập {m} trong {n} dòng; đóng màn hình thì việc nhập vẫn tiếp tục). Khi đang chạy thì vô hiệu 「登録」 và 「ファイルを選び直す」. Rời màn hình thì vẫn tiếp tục chạy (chạy nền), quay lại sẽ hiện tiến độ hoặc kết quả. Đến đúng 100 dòng thì hoàn thành mà không phải chờ.", kind="area", err=["I104"], demo=DOK_CSV)],
       CSV_URL),
    ST("038", "AW_BRCH_004", ("100件を超える登録（途中で失敗）", "Đăng ký quá 100 dòng (lỗi giữa chừng)"), ("実行の途中で一部の行が処理できなかったとき。", "Khi một số dòng không xử lý được giữa chừng."),
       [X("11", "途中で失敗", "Lỗi giữa chừng", "W10（{n}件のうち{m}件は処理できませんでした。下の一覧で理由を確認してください。）をページ内に出す。処理できた行は登録済みのまま（元に戻さない）。処理できなかった行はエラー一覧CSV で出す。全部失敗したときは E34。", "Hiện W10 (trong {n} dòng có {m} dòng không xử lý được; hãy xem lý do ở danh sách bên dưới) trong trang. Các dòng đã xử lý vẫn giữ trạng thái đã đăng ký (không hoàn tác). Dòng không xử lý được xuất ở エラー一覧CSV. Nếu thất bại hoàn toàn thì E34.", kind="area", err=["W10", "E34"], demo=DOK_CSV)],
       CSV_URL),
    ST("039", "AW_BRCH_004", ("登録した（S104→一覧）", "Đã đăng ký (S104 → danh sách)"), ("「登録」（または100件超の実行）が終わったとき。", "Khi 「登録」 (hoặc chạy quá 100 dòng) kết thúc."),
       [X("12", "登録完了", "Đăng ký xong", "S104 のトーストを出して拠点一覧（AW_BRCH_001）へ戻る。更新した行ごとに変更履歴「CSV取込で更新」を残す。エラーの行は取り込まれていない。", "Hiện toast S104 và về danh sách chi nhánh (AW_BRCH_001). Lưu lịch sử 「CSV取込で更新」 cho từng dòng đã cập nhật. Dòng lỗi không được nhập.", kind="toast", trig="show", err=["S104"], demo=DOK_CSV)],
       CSV_URL),
    ST("040", "AW_BRCH_004", ("CSV取込の権限がない役割で直接開く", "Mở trực tiếp bằng vai trò không có quyền nhập CSV"), ("経理（Ad00012・拠点管理＝R）などで、URL を直接開いたとき。拠点一覧へ戻す。", "Khi mở trực tiếp qua URL bằng kế toán (Ad00012, quản lý chi nhánh = R), v.v. Quay về danh sách chi nhánh."),
       [X("13", "CSV取込の権限がない役割", "Vai trò không có quyền nhập CSV", "一覧に「CSV取込」を出さない役割（フル権限・システム管理以外）が URL を直接開いたときは、この画面を出さず拠点一覧へ戻す。", "Khi vai trò không hiện nút 「CSV取込」 ở danh sách (ngoài toàn quyền, quản trị hệ thống) mở trực tiếp URL thì không hiện màn hình này mà quay về danh sách chi nhánh.", sel=".es-pagehead", kind="area", demo=DOK_CSV)],
       CSV_URL, login="Ad00012"),
]

# ================================================================ 本物の画面に合わせる（コード実装済み：/ops/branches/import・詳細の別操作・取消／閉鎖）
CSV_PRE = ("const sleep=ms=>new Promise(r=>setTimeout(r,ms));const q=s=>document.querySelector(s);"
           "const res=await fetch('/api/domain/csv/export',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json','x-es-site':'ops'},body:JSON.stringify({args:{entity:'branches',scope:{site:'ops'}}})});"
           "const t=await res.json();const esc=v=>'\"'+String(v??'').replace(/\"/g,'\"\"')+'\"';const H=t.head;const ci=n=>H.findIndex(h=>h.replace(/【.*】/,'')===n);const R=t.rows;"
           "const by=id=>R.find(r=>r[0]===id);const cp=(r,m)=>{const x=r.slice();for(const k in m)x[ci(k)]=m[k];return x;};"
           "const up=async(name,rows)=>{const text='\\ufeff'+rows.map(r=>r.map(esc).join(',')).join('\\r\\n');const inp=q('#sec-csv input[type=file]');const dt=new DataTransfer();dt.items.add(new File([text],name,{type:'text/csv'}));inp.files=dt.files;inp.dispatchEvent(new Event('change',{bubbles:true}));await sleep(2500);};"
           "const r0=by('CU00643');const nm=r=>r[ci('拠点名')];")
CSV_SETUP = {
    "031": CSV_PRE + "await up('取込テスト.csv',[H,cp(r0,{'拠点名':nm(r0)+' 改'}),cp(r0,{'拠点ID':'CU99999'})]);window.scrollTo(0,q('#sec-csv').offsetTop-80);",
    "032": CSV_PRE + "await up('取込テスト.csv',[H,cp(r0,{'拠点名':nm(r0)+' 改'}),cp(r0,{'拠点ID':''}),cp(r0,{'拠点ID':'CU99999'}),cp(by('CU01012'),{'拠点名':'改'}),cp(by('CU00671'),{'所属法人名':'別の法人'}),cp(r0,{'拠点名':'別の名前'}),cp(by('CU00871'),{'支払方法':'銀行振込'}),cp(by('CU00701'),{'拠点ステータス':'仮登録'})]);window.scrollTo(0,q('#sec-csv').offsetTop-80);",
    "033": CSV_PRE + "await up('取込テスト.csv',[['拠点ID','名前'],['CU00643','x']]);",
    "034": CSV_PRE + "await up('取込テスト.csv',[H,cp(r0,{'拠点ID':''}),cp(r0,{'拠点ID':'CU99999'})]);",
    "035": CSV_PRE + "await up('取込テスト.csv',[H]);",
    "039": CSV_PRE + "await up('取込テスト.csv',[H,cp(r0,{'拠点名':nm(r0)+' 改'})]);q('.csvph .btns button.pri').click();await sleep(900);",
}
CSV_SEL = {
    ("032", "5.1"): "#sec-csv td::新しい", ("032", "5.2"): "#sec-csv td::見つかりません", ("032", "5.3"): "#sec-csv td::仮登録", ("032", "5.4"): "#sec-csv td::変更できません", ("032", "5.5"): "#sec-csv td::値が違います", ("032", "5.7"): "#sec-csv td::のときだけ入力できます", ("032", "5.8"): "#sec-csv td::へは変更できません",
    ("033", "6"): "#sec-csv .notice.ng", ("034", "7"): "#sec-csv .notice.ng", ("034", "7.1"): ".csvph .btns button.pri", ("035", "8.1"): "#sec-csv .notice.ng",
    ("039", "12"): ".toast",
}
DOK_NOTCODE = {
    "036": ("コードに W102（リードタイム変更の警告）がない（W101 の判定が未実装）。警告の画面（「警告を確認しました」）はコードにある（宿題）", "Trong code chưa có W102 (cảnh báo đổi lead time; chưa có logic W101). Màn hình cảnh báo (「警告を確認しました」) đã có trong code (宿題)"),
    "037": ("コードの進み具合は I104 の文言と違い、100件超の見本データがなく撮れない（図だけ・宿題）", "Phần tiến độ trong code khác câu I104 và không có dữ liệu mẫu trên 100 dòng nên không chụp được (chỉ có hình minh họa; 宿題)"),
    "038": ("途中で失敗する状態は見本データで作れない（図だけ）", "Trạng thái lỗi giữa chừng không tạo được bằng dữ liệu mẫu (chỉ có hình minh họa)"),
}
DOK_4_3 = ("コードのボタン名は「エラー一覧CSV」（設計は「エラー行をCSVでダウンロード」・宿題）。確認の画面を離れるときの破棄の確認（4.6）もコードにない（宿題）。担当者の行の更新／追加の分けて見せる表示もコードにない（宿題）。ひな形の記入例の行もまだない（宿題）", "Tên nút trong code là 「エラー一覧CSV」 (thiết kế là 「エラー行をCSVでダウンロード」; 宿題). Xác nhận hủy khi rời màn hình xác nhận (4.6) cũng chưa có trong code (宿題). Hiển thị tách cập nhật / thêm của dòng người phụ trách cũng chưa có (宿題). Dòng ví dụ của mẫu cũng chưa có (宿題)")
for _v in V_CSV + V_NEW:
    if _v["code"] == "AW_BRCH_004":
        if _v["id"] in CSV_SETUP:
            _v["setup"] = CSV_SETUP[_v["id"]]
        for _it in _v["items"]:
            k = (_v["id"], _it["no"])
            if k in CSV_SEL:
                _it["sel"] = CSV_SEL[k]
            d = _it.get("demo_ok")
            if d and "代用" in d[0]:
                _it.pop("demo_ok")
        if _v["id"] in DOK_NOTCODE:
            _v["items"][0]["demo_ok"] = [DOK_NOTCODE[_v["id"]][0], DOK_NOTCODE[_v["id"]][1]]
        if _v["id"] == "031":
            for _it in _v["items"]:
                if _it["no"] in ("4.3",):
                    _it["demo_ok"] = [DOK_4_3[0], DOK_4_3[1]]
# ---- 詳細・編集の別操作
def _fix(vid, no, sel=None, drop_demo=False, demo=None):
    for _v in VIEWS_ALL:
        if _v["id"] == vid:
            for _it in _v["items"]:
                if _it["no"] == no:
                    if sel:
                        _it["sel"] = sel
                    if drop_demo:
                        _it.pop("demo_ok", None)
                    if demo:
                        _it["demo_ok"] = [demo[0], demo[1]]
VIEWS_ALL = V_LIST + V_DETAIL + V_EDIT + V_CSV + V_NEW
_fix("008", "5.12", ".f button::所属法人の付け替え", True)
_fix("009", "9.11", ".f button::本導入に切り替える", True)
_fix("009", "9.12", ".ch::契約種別の履歴^", True)
_fix("009", "9.13", "th::契約種別"); _fix("009", "9.14", "th::開始"); _fix("009", "9.15", "th::終了")
_BTN = lambda t: JS + "await sleep(1800);btn('%s').click();await sleep(800);" % t
for _v in VIEWS_ALL:
    if _v["id"] == "060":
        _v["url"] = "/ops/branches/CU00588"; _v["setup"] = _BTN("所属法人の付け替え"); _v["full"] = False
    if _v["id"] == "061":
        _v["url"] = "/ops/branches/CU00643"; _v["setup"] = JS + "await sleep(1800);"
    if _v["id"] == "062":
        _v["url"] = "/ops/branches/CU00588"
        _v["setup"] = _BTN("所属法人の付け替え") + "const o=[...document.querySelectorAll('.dlg select option')].find(x=>x.value&&!x.textContent.includes('CU00052'));sets(q('.dlg select'),o.value);await sleep(400);q('.dlg .ft button.ok').click();await sleep(700);"
    if _v["id"] == "063":
        _v["url"] = "/ops/branches/CU00975?tab=契約"; _v["setup"] = _BTN("本導入に切り替える")
    if _v["id"] == "064":
        _v["url"] = "/ops/branches/CU00643?tab=契約"; _v["setup"] = JS + "await sleep(1800);"
_fix("061", "36", ".f button::所属法人の付け替え", True)
_fix("062", "37", ".toast", True)
_fix("063", "38", ".es-modal__panel", True); _fix("063", "38.1", ".es-modal__actions button::キャンセル"); _fix("063", "38.2", ".es-modal__actions button::本導入に切り替える")
_fix("064", "39", ".f button::本導入に切り替える", True)
_fix("066", "31", ".provbar", True)
_fix("016", "20.1", None)
_BTN2 = lambda t: JS + "await sleep(1800);[...document.querySelectorAll('button.mini.act')].find(b=>b.textContent.includes('%s')).click();await sleep(700);" % t
_DLG = "[role=dialog]"
for _v in VIEWS_ALL:
    if _v["id"] == "044":
        _v["url"] = "/ops/branches/CU01330"; _v["setup"] = _BTN2("ログイン案内の再送")
    if _v["id"] == "045":
        _v["url"] = "/ops/branches/CU00643"; _v["setup"] = _BTN2("アカウントの停止")
    if _v["id"] == "046":
        _v["url"] = "/ops/branches/CU00588"; _v["setup"] = JS + "await sleep(1800);"
    if _v["id"] == "047":
        _v["url"] = "/ops/branches/CU00588"; _v["setup"] = _BTN2("アカウントの再開")
for _vid, _sels in (("044", {"29": _DLG, "29.1": _DLG + " button::キャンセル", "29.2": _DLG + " button::再送する"}), ("045", {"30": _DLG, "30.1": _DLG + " button::キャンセル", "30.2": _DLG + " button::停止する"}),
                    ("046", {"31": ".f::アカウントのステータス^", "31.1": ".f button::アカウントの再開"}), ("047", {"32": _DLG, "32.1": _DLG + " button::キャンセル", "32.2": _DLG + " button::再開する"})):
    for _it_no, _sel in _sels.items():
        _fix(_vid, _it_no, _sel, True)
_fix("008", "8.3", "label::アカウントのステータス^", True); _fix("008", "8.6", ".f button::アカウントの停止", True); _fix("008", "8.7", "label::アカウントの操作^", True)
_fix("023", "8.3", "label::アカウントのステータス^", True); _fix("023", "8.6", ".f button::アカウントの停止", True); _fix("023", "8.7", "label::アカウントの操作^", True)
_fix("008", "8.4", None, True); _fix("023", "8.4", None, True)
for _v in VIEWS_ALL:
    if _v["id"] in ("008", "023"):
        for _it in _v["items"]:
            if _it["no"] == "8.5":
                _it["sel"] = "-"
for _v in VIEWS_ALL:
    if _v["id"] == "060":
        _v["url"] = "/ops/branches/CU01330"; _v["setup"] = _BTN("所属法人の付け替え")
    if _v["id"] == "062":
        _v["url"] = "/ops/branches/CU01330"
        _v["setup"] = _BTN("所属法人の付け替え") + "const o=[...document.querySelectorAll('.es-modal__body select option')].find(x=>x.value);sets(q('.es-modal__body select'),o.value);await sleep(400);btn('付け替える').click();await sleep(700);"
    if _v["id"] in ("060", "062"):
        for _it in _v["items"]:
            _it.pop("demo_ok", None)
_fix("060", "35", ".es-modal__panel", True); _fix("060", "35.1", ".es-modal__body select", True); _fix("060", "35.2", ".es-modal__body"); _fix("060", "35.3", ".es-modal__actions button::キャンセル"); _fix("060", "35.4", ".es-modal__actions button::付け替える")
# ---- 契約・法人・拠点・子契約の流れ（台帳 F 2026-10-06）の本物の画面
_SAVE_END = lambda d: JS + "await sleep(1800);const i=[...document.querySelectorAll('.pane .f')].find(x=>(x.querySelector('label')||{textContent:''}).textContent.startsWith('契約終了日')).querySelector('input');setv(i,'%s');await sleep(300);q('.pbtn button.save').click();await sleep(300);" % d
V_NEW += [
    ST("069", "AW_BRCH_002", ("契約タブ：休止予定の帯", "Tab Hợp đồng: dải dự kiến tạm ngừng"), ("休止予定の拠点（見本 CU00902）。休止の帯に「休止予定」を出し、契約ステータスは詳細だけ「休止予定」と表示する（保存している値は有効）。", "Chi nhánh dự kiến tạm ngừng (mẫu CU00902). Dải tạm ngừng hiện 「休止予定」 và trạng thái hợp đồng chỉ ở chi tiết hiện 「休止予定」 (giá trị lưu là có hiệu lực)."),
       [X("42", "休止期間の帯（休止予定）", "Dải thời gian tạm ngừng (dự kiến)", "承認済み・まだ始まっていない休止。休止期間（開始〜終了のサイクル月とサイクル数）・再開予定のサイクル月・休止理由・休止中の設備を出す。この期間は子契約を作らない。再開の申請で取り消せる（台帳 F 休止予定の取消）。", "Tạm ngừng đã được duyệt nhưng chưa bắt đầu. Hiện thời gian tạm ngừng (chu kỳ bắt đầu ~ kết thúc và số chu kỳ), chu kỳ dự kiến mở lại, lý do tạm ngừng, thiết bị trong thời gian tạm ngừng. Không tạo hợp đồng con trong thời gian này. Có thể hủy bằng yêu cầu mở lại (sổ quyết định F, hủy dự kiến tạm ngừng).", sel="tr.band", kind="area"),
        X("42.1", "契約ステータス（休止予定の表示）", "Trạng thái hợp đồng (hiển thị dự kiến tạm ngừng)", "詳細だけ「休止予定（yyyy-mm から利用休止になります）」と表示する。編集の画面・CSV の値は保存している有効のまま。", "Chỉ ở chi tiết hiển thị 「休止予定（từ yyyy-mm sẽ tạm ngừng sử dụng）」. Giá trị ở màn hình chỉnh sửa và CSV vẫn là có hiệu lực đã lưu.", sel="label::契約ステータス^", kind="label")],
       "/ops/branches/CU00902?tab=契約"),
    ST("070", "AW_BRCH_003", ("契約終了日が確定済みの月より前（E53）", "Ngày kết thúc hợp đồng sớm hơn tháng đã chốt (E53)"), ("契約終了日に、確定済み・発行済みの子契約の月より前の日付を入れて「保存」を押したとき（保存はしない）。", "Khi nhập ngày kết thúc hợp đồng sớm hơn tháng của hợp đồng con đã chốt / đã phát hành rồi bấm 「保存」 (không lưu)."),
       [X("33", "契約終了日のエラー（E53）", "Lỗi ngày kết thúc hợp đồng (E53)", "{月}の請求が確定済みのため、それより前にはできません。（E53）を契約終了日の下に出し、契約タブを開いて赤い印を付ける。保存しない。", "Hiện E53 (hóa đơn tháng {tháng} đã chốt nên không thể sớm hơn) dưới ngày kết thúc hợp đồng, mở tab Hợp đồng và đánh dấu đỏ. Không lưu.", sel=".f.err .emsg", kind="label", err=["E53"])],
       "/ops/branches/CU00643/edit?tab=契約", setup=_SAVE_END("2026-01-31")),
    ST("071", "AW_BRCH_003", ("契約終了日の後に未確定の子契約が残る（W105）", "Còn hợp đồng con chưa chốt sau ngày kết thúc (W105)"), ("契約終了日を未確定の子契約の月より前にしたとき（警告だけ・自動では取り消さない）。", "Khi đặt ngày kết thúc hợp đồng sớm hơn tháng của hợp đồng con chưa chốt (chỉ cảnh báo, không tự hủy)."),
       [X("34", "未確定の子契約が残る警告（W105）", "Cảnh báo còn hợp đồng con chưa chốt (W105)", "未確定の子契約が{n}件残っています。自動では取り消されません。（W105）を契約終了日の下に出す。保存はできる。取り消すのは申請の承認。", "Hiện W105 (còn {n} hợp đồng con chưa chốt; không tự hủy) dưới ngày kết thúc hợp đồng. Vẫn lưu được. Việc hủy là của phê duyệt yêu cầu.", kind="label", err=["W105"], demo=("警告の出し方が撮れる状態を作れていない（宿題）。保存すると日付が変わるため確認は押さない", "Chưa tạo được trạng thái chụp cảnh báo (宿題). Lưu sẽ đổi ngày nên không bấm xác nhận"))],
       "/ops/branches/CU00643/edit?tab=契約", setup=_SAVE_END("2026-10-31")),
    ST("072", "AW_BRCH_002", ("契約タブ：取消した休止の帯（0か月）", "Tab Hợp đồng: dải tạm ngừng đã hủy (0 tháng)"), ("休止予定を「再開」の申請で取り消し、承認したあと。", "Sau khi hủy dự kiến tạm ngừng bằng yêu cầu 「再開」 và được phê duyệt."),
       [X("43", "取消した休止の帯", "Dải tạm ngừng đã hủy", "休止の履歴に「取消した休止（0か月・通算に入れない・申請番号）」を残す。再開予定月＝休止の開始月で、休止期間は0か月。通算1年には入れない（台帳 F 休止予定の取消）。", "Lưu vào lịch sử tạm ngừng 「取消した休止（0か月・通算に入れない・số đơn）」. Tháng dự kiến mở lại = tháng bắt đầu tạm ngừng, thời gian tạm ngừng 0 tháng. Không tính vào tổng 1 năm (sổ quyết định F, hủy dự kiến tạm ngừng).", kind="area", demo=("再開の承認のあとにだけ出るため、見本データでは撮れない（図だけ）", "Chỉ hiện sau khi phê duyệt mở lại nên không chụp được bằng dữ liệu mẫu (chỉ có hình minh họa)"))],
       "/ops/branches/CU00902?tab=契約"),
    ST("073", "AW_BRCH_002", ("切替の申請が承認待ち（切替が非活性）", "Có yêu cầu chuyển đổi chờ phê duyệt (vô hiệu chuyển đổi)"), ("承認待ちの切替申請がある拠点（契約申請管理）。", "Chi nhánh có yêu cầu chuyển đổi đang chờ phê duyệt (契約申請管理)."),
       [X("44", "切替の非活性（承認待ちの切替申請）", "Vô hiệu chuyển đổi (yêu cầu chuyển đổi chờ phê duyệt)", "「本導入に切り替える」は非活性で、理由「承認待ちの切替申請があります（契約申請管理で処理してください）」をボタンの横に出す。", "「本導入に切り替える」 bị vô hiệu, hiện lý do 「承認待ちの切替申請があります（契約申請管理で処理してください）」 cạnh nút.", kind="button", trig="click", demo=("見本データに承認待ちの切替申請がなく、図だけ", "Dữ liệu mẫu không có yêu cầu chuyển đổi chờ phê duyệt nên chỉ có hình minh họa"))],
       "/ops/branches/CU00975?tab=契約"),
]
for _v in V_NEW:
    if _v["id"] == "063":
        _v["items"].append(X("38.3", "本導入の開始年月", "Tháng bắt đầu triển khai chính thức", "切替の小窓の入力欄（年月）。選べるのは、お試しの開始より後・請求が確定済みの月より後の月だけ（例：2026-12 以降）。実行すると、その月のサイクル以降の子契約を本導入にし、お試しは開始月の前の月までにする。", "Ô nhập (năm-tháng) trong hộp thoại chuyển đổi. Chỉ chọn được tháng sau thời điểm bắt đầu dùng thử và sau tháng hóa đơn đã chốt (ví dụ: từ 2026-12). Khi thực hiện, các hợp đồng con từ chu kỳ của tháng đó trở đi thành triển khai chính thức, thời gian dùng thử kết thúc ở tháng trước tháng đó.", sel=".es-modal__panel input", kind="month", trig="input", req="○", len="年月 yyyy-mm", init="今より先の最初の月", ex="2026-12", err=["E02"]))

for _v in V_NEW:
    if _v["id"] in ("070", "071"):
        _v["wait"] = 100
    if _v["id"] == "070":
        _v["items"][0]["sel"] = "-"
        _v["items"][0]["demo_ok"] = ["コードは E53 をトーストで出す（設計は契約終了日の下・宿題）。トーストはすぐ消えるため撮れない", "Code hiện E53 bằng toast (thiết kế là dưới ngày kết thúc hợp đồng; 宿題). Toast biến mất nhanh nên không chụp được"]

VIEWS = sorted(V_LIST + V_DETAIL + V_EDIT + V_CSV + V_NEW, key=lambda v: v["id"])

# ---------------------------------------------------------------- ベトナム語の埋め込み（状態・メモ・決定・画面名）
TITLE[1] = T(TITLE[0])
SHEET[1] = T(SHEET[0])
CODE_NOTE[1] = T(CODE_NOTE[0])
for _s in SCREENS:
    _s["vi"] = T(_s["ja"])
for _v in VIEWS:
    for _k in ("state", "note"):
        if _v.get(_k) and not _v[_k][1]:
            _v[_k][1] = T(_v[_k][0])
for _d in DECISIONS:
    for _k in ("q", "a"):
        if not _d[_k][1]:
            _d[_k][1] = T(_d[_k][0])
