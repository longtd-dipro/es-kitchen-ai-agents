# -*- coding: utf-8 -*-
"""
画面設計書のデータ：運営管理者Web ＞ 契約申請管理（一覧・申請詳細（変更の承認）・契約申込の代理入力・変更申請の代理入力・新規申込CSV取込）
元：本物の Web（このリポジトリ app/ops/applications ・ lib/ops/applications ・ lib/ops/areas/applications.ts ・ lib/corp/sites/logic.ts ・ app/ops/_ui/CsvImportScreen）、
    決定台帳 B・E・F（運営A 契約申請管理 Q1〜Q14・2026-10-06 の流れ）・K・M、申請・承認.md、申込フォーム.md §10、運営Web_権限表、
    確認メモ_AW_運営A_申請・法人・契約.md（Part 1・Part 4）
受付（申込の確認 → 仮登録 → 詳細情報設定 → 本登録）は別シート AW_INTK_001（台帳 F 運営A Q10＝B）。
日本語に続けてベトナム語を T(日本語, ベトナム語) で書く（T は VI に覚えさせ、最後に埋める）。
番号は画面ごとに通し。状態 id はこのファイルの中で 001 から出てくる順に付けた（メモ Part 1・Part 4 の id との対応は 確認メモ Part 5）。
"""

TITLE = ["契約申請管理（AW_APPL）", "Quản lý đơn hợp đồng (AW_APPL)"]
SHEET = ["契約申請管理", "Quản lý đơn hợp đồng"]
BASENAME = "画面設計書_AW_APPL_契約申請管理"
IMG_PREFIX = "AW_APPL"
OUT_DIR = "AW_APPL_契約申請管理"
CODE_NOTE = ["画面コードは規約 <Module(2)>_<Feature(4)>_<Seq(3)>（docs/01_仕様/画面コード規約_20261005.md）。AW＝運営管理者Web、APPL＝契約申請管理。001 一覧／002 申請詳細（変更の承認）／004 契約申込新規登録（代理入力）／005 変更申請の代理入力／006 新規申込CSV取込。003（受付）は AW_INTK_001 に分けた（台帳 F 運営A Q10＝B）",
             "Mã màn hình theo quy ước <Module(2)>_<Feature(4)>_<Seq(3)> (docs/01_仕様/画面コード規約_20261005.md). AW = Web quản trị vận hành, APPL = quản lý đơn hợp đồng. 001 danh sách / 002 chi tiết đơn (duyệt thay đổi) / 004 đăng ký đơn hợp đồng mới (nhập thay) / 005 nhập thay đơn thay đổi / 006 nhập CSV đơn mới. 003 (tiếp nhận) tách sang AW_INTK_001 (sổ F 運営A Q10=B)"]
SITE = "ops"
SYSTEM = {"ja": "運営管理者Web", "vi": "Web quản trị vận hành"}
AUTHOR = "Claude（cloud）／確認：hong"
CREATED = "2026-10-07"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "ops", "loginId": "Ad00010"}
CODE_PATHS = ["app/ops/applications", "app/ops/_ui", "lib/ops", "lib/corp/sites", "lib/domain/seed", "components/csv"]

VI = {}


def T(ja, vi):
    """日本語とベトナム語を一緒に書く（VI に覚え、最後に埋める）"""
    VI[ja] = vi
    return ja


def D(date, target, q, a, src):
    return {"date": date, "target": target, "q": [T(*q), ""], "a": [T(*a), ""], "src": src}


_M = "hong 回答 2026-10-05（確認メモ_AW_運営A_申請・法人・契約 Part 1）・台帳 F（契約申請管理の画面の決め）"
_M2 = "hong 回答 2026-10-06（確認メモ Part 4 の 4-3）・台帳 F"
DECISIONS = [
    D("2026-10-05", "受付の画面の作り（Q1）", ("申請詳細（新規）：見本と実データの二重構造をどうするか（運営A Q1）", "Chi tiết đơn (mới): xử lý cấu trúc kép giữa dữ liệu mẫu và dữ liệu thật (運営A Q1)"),
      ("申請詳細（受付）は申込フォーム §10-2 の1本の流れ（申込内容の確認 → 仮登録 → 詳細情報設定 → 本登録）。完了済みは詳細情報設定を参照のみで開く。受付は別シート AW_INTK_001 に書く", "Chi tiết đơn (tiếp nhận) là 1 luồng theo 申込フォーム §10-2 (xác nhận nội dung → đăng ký tạm → cài đặt thông tin chi tiết → đăng ký chính thức). Đơn hoàn tất mở ở chế độ chỉ xem của phần cài đặt thông tin chi tiết. Tiếp nhận ghi ở sheet riêng AW_INTK_001"), _M),
    D("2026-10-05", "代理入力・CSV取込の権限（Q3）", ("代理入力・CSV取込をできる役割（運営A Q3）", "Vai trò được nhập thay / nhập CSV (運営A Q3)"),
      ("新規登録（代理入力）・変更申請の代理入力・CSV取込はフル権限だけ（台帳 E「作成・CSV取込はしない」の読みどおり）。CS に要るなら hong が例外を決める。承認・却下・取り下げは R/U（CS）も行える", "Đăng ký (nhập thay) / nhập thay đơn thay đổi / nhập CSV chỉ vai trò toàn quyền (theo cách đọc của sổ E 「không tạo, không nhập CSV」). Nếu CS cần thì hong quyết định ngoại lệ. Duyệt / từ chối / rút đơn thì R/U (CS) cũng làm được"), _M),
    D("2026-10-05", "一覧の初期の並び（Q4）", ("一覧の初期の並びと並べ替え（運営A Q4）", "Thứ tự ban đầu và sắp xếp của danh sách (運営A Q4)"),
      ("3つのタブとも申請日の降順。並べる項目は一覧の全列（台帳 K）。「登録したばかり」の行は先頭に出して選択色にする", "Cả 3 tab đều theo ngày xin giảm dần. Mục sắp xếp là mọi cột của danh sách (sổ K). Dòng 「vừa đăng ký」 hiện ở đầu và tô màu chọn"), _M),
    D("2026-10-05", "検索条件・CSV列（Q5）", ("検索条件とCSV出力の列（運営A Q5）", "Điều kiện tìm kiếm và cột CSV xuất (運営A Q5)"),
      ("検索は今の条件に 申請日の範囲・法人・開始サイクル月・受付経路 を足す（契約変更・休止・解約タブは ES営業担当・「オーダー締切を過ぎたもの」も）。CSV列は画面の列に 法人ID・拠点ID・申請者・受付経路・却下／取り下げの理由 を足す", "Thêm vào điều kiện hiện có: khoảng ngày xin, pháp nhân, tháng chu kỳ bắt đầu, kênh tiếp nhận (tab thay đổi / tạm dừng・hủy thêm ES営業担当 và 「quá hạn chốt order」). Cột CSV thêm ID pháp nhân, ID điểm, người xin, kênh tiếp nhận, lý do từ chối / rút đơn vào các cột của màn hình"), _M),
    D("2026-10-05", "CSV取込のエラー行（Q6）", ("新規申込CSV取込：エラー行の扱い（運営A Q6）", "Nhập CSV đơn mới: xử lý dòng lỗi (運営A Q6)"),
      ("台帳 F に従い、エラーを含む法人キーの申込ごと取り込まず、ほかの申込は登録する（申込フォーム §10-8-1「1つでもあれば何も登録しない」を直す）", "Theo sổ F: loại bỏ cả đơn của khóa pháp nhân có lỗi, các đơn khác vẫn đăng ký (sửa 申込フォーム §10-8-1 「có 1 lỗi thì không đăng ký gì」)"), _M),
    D("2026-10-05", "変更申請の代理入力（Q7・Q11）", ("変更申請の代理入力を法人Webと同じ項目にするか（運営A Q7・Q11）", "Nhập thay đơn thay đổi có dùng cùng mục như Web pháp nhân không (運営A Q7・Q11)"),
      ("1画面で種類ごとに項目を出し分ける（法人Web「ご希望の内容」＝申請・承認 §6 と同じ）＋受付経路・複数拠点。項目定義は法人B と共通。休止・再開・解約は別の入力欄", "Một màn hình hiện mục khác nhau theo loại (giống 「ご希望の内容」 của Web pháp nhân = 申請・承認 §6) + kênh tiếp nhận + nhiều điểm. Định nghĩa mục dùng chung với 法人B. Tạm dừng・tiếp tục・hủy có ô nhập riêng"), _M + "／hong 回答 2026-10-06（Q11）"),
    D("2026-10-05", "承認時の法人への知らせ（Q8）", ("オーダーを新しい条件に戻したことを法人へ知らせるか（運営A Q8）", "Có thông báo cho pháp nhân việc đã đưa order về điều kiện mới không (運営A Q8)"),
      ("承認ダイアログにチェック「オーダーを戻したことを法人へ知らせる」（既定 ON）を置き、ON のとき M5 のお知らせに一文を足す", "Đặt ô chọn 「オーダーを戻したことを法人へ知らせる」 (mặc định ON) trong hộp thoại duyệt; khi ON thì thêm một câu vào thông báo M5"), _M),
    D("2026-10-05", "受付中の取り下げ（Q9）", ("受付中の申込を運営が取り下げられるか（運営A Q9）", "Vận hành có rút được đơn đang ở 受付中 không (運営A Q9)"),
      ("受付中にも運営が「取り下げ」できる（理由＝お客様のご連絡）。「却下」とは意味が違うため。詳しくは AW_INTK_001", "Vận hành cũng rút được ở 受付中 (lý do = khách đã liên lạc). Vì khác nghĩa với 「却下」. Chi tiết ở AW_INTK_001"), _M),
    D("2026-10-05", "シートの分け方（Q10）", ("シートの分け方（運営A Q10）", "Cách chia sheet (運営A Q10)"),
      ("2シート：AW_APPL（001・002・004〜006）＋受付 AW_INTK_001", "2 sheet: AW_APPL (001・002・004〜006) + tiếp nhận AW_INTK_001"), _M),
    D("2026-10-06", "再開できる拠点（Q12・Q14）", ("再開の代理入力：再開できる拠点の条件（Part 1 Q12・Q14）", "Nhập thay 再開: điều kiện điểm được tiếp tục (Part 1 Q12・Q14)"),
      ("再開できるのは「休止中」と「休止予定」の拠点。休止予定の拠点に出すと「休止予定の取消」になり、再開予定月＝休止の開始月（休止期間0か月）・履歴に「取消した休止（0か月）」を残して通算に入れない", "Điểm tiếp tục được là 「休止中」 và 「休止予定」. Khi dùng cho điểm 休止予定 thì thành 「休止予定の取消」, tháng tiếp tục dự kiến = tháng bắt đầu tạm dừng (thời gian tạm dừng 0 tháng), lưu lịch sử 「取消した休止（0か月）」 và không tính vào tổng"), "hong 回答 2026-10-06（Q12・Q14＝B）・台帳 F"),
    D("2026-10-06", "申請内容は実際の申込の値（Q13）", ("見本データ（受付 AP）の出どころ（Part 1 Q13）", "Nguồn dữ liệu mẫu của tiếp nhận AP (Part 1 Q13)"),
      ("seed の申込を実データにして見本テンプレートをやめる。代理入力・申込で入れた住所・担当者・営業担当は受付・仮登録に引き継ぐ", "Dùng dữ liệu thật cho đơn của seed và bỏ mẫu tạm. Địa chỉ, người phụ trách, nhân viên kinh doanh nhập qua nhập thay / đơn được chuyển sang tiếp nhận và đăng ký tạm"), _M2),
    D("2026-10-06", "CSV取込の画面", ("新規申込のCSV取込をモーダルで開くか、画面で開くか", "Nhập CSV đơn mới mở bằng modal hay bằng màn hình"),
      ("モーダルではなく専用の画面（名称「新規申込CSV取込」）。ボタンは「CSV出力」「CSV取込」の順。テンプレートのボタンは画面に置かない（列の定義は項目定義）。コード実装済み（/ops/applications/import）", "Không dùng modal mà là màn hình riêng (tên 「新規申込CSV取込」). Thứ tự nút 「CSV出力」「CSV取込」. Không đặt nút mẫu trên màn hình (định nghĩa cột nằm ở định nghĩa mục). Code đã cài (/ops/applications/import)"), "台帳 F 2026-10-06 (6)・台帳 E「CSV取込の画面」"),
    D("2026-10-07", "受付経路の検索（Q15）", ("一覧の検索「受付経路」の選択肢（運営A Q15）", "Lựa chọn của ô tìm kiếm 「受付経路」 ở danh sách (運営A Q15)"),
      ("8つ：法人Web／ログインなしの申込／電話／営業（訪問）／紙の申込書／メール／CSV取込／その他。新規契約タブ・契約変更タブ・休止・解約タブで同じ。コード実装済み", "8 giá trị: 法人Web／ログインなしの申込／電話／営業（訪問）／紙の申込書／メール／CSV取込／その他. Giống nhau ở tab đơn mới, tab thay đổi, tab tạm dừng・hủy. Code đã cài"), "hong 回答 2026-10-07（Q15）・台帳 F"),
    D("2026-10-07", "休止・解約タブの代理入力（Q17）", ("休止・解約タブの変更申請の代理入力を契約変更タブと同じ形にするか（運営A Q17）", "Nhập thay đơn thay đổi ở tab tạm dừng・hủy có cùng dạng với tab thay đổi hợp đồng không (運営A Q17)"),
      ("同じ形にする：複数拠点・データから選ぶ法人・選べる最早月から・理由は500文字まで。項目は法人Webの「ご希望の内容」（申請・承認 §6-6 休止・§6-7 再開・§6-8 解約）と同じ。再開は休止中・休止予定の拠点だけ。コード実装済み", "Dùng cùng dạng: nhiều điểm・pháp nhân chọn từ dữ liệu・từ tháng sớm nhất chọn được・lý do tối đa 500 ký tự. Mục giống 「ご希望の内容」 của Web pháp nhân (申請・承認 §6-6 tạm dừng・§6-7 tiếp tục・§6-8 hủy). 再開 chỉ cho điểm 休止中・休止予定. Code đã cài"), "hong 回答 2026-10-07（Q17）・台帳 F"),
    D("2026-10-05", "承認者・入力者", ("承認者・入力者をどうするか", "Người duyệt / người nhập là ai"),
      ("ログイン中の運営ユーザー（自己承認は可・履歴に残す）。コードは承認者「井上 悠」・入力者「にっしぐち（運営）」の固定（宿題 H8）", "Người dùng vận hành đang đăng nhập (tự duyệt được, lưu lịch sử). Code cố định người duyệt 「井上 悠」 và người nhập 「にっしぐち（運営）」 (việc cần sửa H8)"), "基本設計 R7・申請・承認 §3-6・§11"),
]
CHANGES = []

HIDE_ALWAYS = []
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [
    {"code": "AW_APPL_001", "ja": "契約申請管理（一覧）", "vi": "Quản lý đơn hợp đồng (danh sách)"},
    {"code": "AW_APPL_002", "ja": "申請詳細（変更の承認）", "vi": "Chi tiết đơn (duyệt thay đổi)"},
    {"code": "AW_APPL_004", "ja": "契約申込新規登録（代理入力）", "vi": "Đăng ký đơn hợp đồng mới (nhập thay)"},
    {"code": "AW_APPL_005", "ja": "変更申請の代理入力", "vi": "Nhập thay đơn thay đổi"},
    {"code": "AW_APPL_006", "ja": "新規申込CSV取込", "vi": "Nhập CSV đơn mới"},
]

import re

_PAIR = ("detail", "init", "cond", "valid", "open", "demo_ok", "chk")


_JP = re.compile(r"[぀-ヿ㐀-鿿]")
_LEN_BASE = [("複数選択", "Chọn nhiều"), ("文字列", "Chuỗi"), ("選択", "Chọn"), ("年月日", "Ngày"), ("年月", "Năm-tháng"), ("日付", "Ngày"), ("整数", "Số nguyên"), ("数値", "Số"),
             ("金額", "Số tiền"), ("円", "yên"), ("件", " mục"), ("桁", " chữ số"), ("（", " ("), ("）", ")"), ("／", " / "), ("・", ", "), ("〜", "〜"), ("＋", "+"), ("：", ": ")]
# 型・桁数に出てくる選択肢などの訳（長い語を先に置換する）
LEN_TOK = {
    "受付中": "đang tiếp nhận", "契約設定中": "đang cài đặt hợp đồng", "完了": "hoàn tất", "却下": "từ chối", "取り下げ済": "đã rút đơn", "承認待ち": "chờ duyệt", "対応中": "đang xử lý",
    "承認済": "đã duyệt", "一部承認": "duyệt một phần", "本導入": "chính thức", "お試しキャンペーン": "chiến dịch dùng thử", "お試し": "dùng thử", "切替": "chuyển đổi", "ESライト": "ES Light",
    "ESスタンダード": "ES Standard", "拠点ごと": "theo từng điểm", "冷蔵庫・冷凍庫": "tủ lạnh・tủ đông", "冷蔵庫": "tủ lạnh", "自動販売機": "máy bán hàng tự động", "自販機": "máy bán hàng",
    "並び": "sắp xếp", "申請ID": "ID đơn", "申請日": "ngày xin", "法人名": "tên pháp nhân", "営業担当": "nhân viên kinh doanh", "申込にある": "có trong đơn", "プランID": "ID gói", "プラン": "gói",
    "継続": "giữ nguyên", "入替": "thay", "追加": "thêm", "回収": "thu hồi", "不要": "không cần", "必要": "cần", "設備の異動": "di chuyển thiết bị", "機種変更": "đổi máy", "依頼しない": "không yêu cầu",
    "委託配送先マスタの会社": "công ty trong master đơn vị giao ủy thác", "この子契約以降すべて": "từ hợp đồng con này trở đi", "この子契約だけ": "chỉ hợp đồng con này",
    "開始月を翌サイクルへ繰り下げる": "dời tháng bắt đầu sang chu kỳ sau", "運営が代理でオーダーする": "vận hành order thay", "今月分": "phần tháng này", "定型": "định sẵn",
    "複数行": "nhiều dòng", "例": "ví dụ", "タブにある": "có trong tab", "法人Web": "Web pháp nhân", "ログインなしの申込": "đơn không đăng nhập", "電話": "điện thoại", "営業（訪問）": "kinh doanh (thăm)",
    "紙の申込書": "đơn giấy", "メール": "email", "CSV取込": "nhập CSV", "その他": "khác", "口座振替": "chuyển khoản tự động", "銀行振込": "chuyển khoản ngân hàng", "クレジットカード": "thẻ tín dụng",
    "月払い": "trả hàng tháng", "年払い": "trả hàng năm", "法人に請求": "xuất hóa đơn cho pháp nhân", "この拠点に請求": "xuất hóa đơn cho điểm này", "前倒す": "đẩy sớm", "後ろ倒す": "dời muộn",
    "通常": "thông thường", "短消費期限なし": "không hạn ngắn", "回": " lần", "ES配送便": "chuyến ES", "COOL便": "chuyến COOL", "申込": "đơn", "タブ": "tab", "法人": "pháp nhân", "拠点": "điểm",
    "ステータス": "trạng thái", "翌月（後払い）": "tháng sau (trả sau)", "ヶ月前": " tháng trước", "当月": "tháng này", "前の日に早める": "đẩy sớm sang ngày trước", "後の日に遅らせる": "dời muộn sang ngày sau",
    "休止中": "đang tạm dừng", "休止予定": "dự kiến tạm dừng", "休止": "tạm dừng", "再開": "tiếp tục", "解約": "hủy", "変更しない": "không đổi", "プラン標準": "tiêu chuẩn của gói", "標準": "tiêu chuẩn",
    "全て買取": "mua lại toàn bộ", "返却": "trả lại", "全部": "toàn bộ", "元払い": "người gửi trả phí", "休止の開始サイクル月": "tháng chu kỳ bắt đầu tạm dừng", "利用中": "đang dùng", "有効": "hiệu lực",
    "運営ユーザー": "người dùng vận hành", "役割では絞らない": "không lọc theo vai trò", "法人名": "tên pháp nhân", "機種マスタ": "master máy", "機種": "máy", "公開中": "đang công khai", "選べる最早月以降": "từ tháng sớm nhất chọn được",
    "ご利用月": "tháng sử dụng", "サイクル": "chu kỳ", "末日": "ngày cuối", "最短の解約日以降": "từ ngày hủy sớm nhất", "開始より後": "sau tháng bắt đầu", "名": "tên", "ID": "ID", "電話番号": "số điện thoại",
    "変えない": "không đổi", "運送会社": "hãng vận chuyển", "納品会社": "công ty giao hàng", "委託配送先": "đơn vị giao ủy thác", "ない場合は全部": "không có thì là tất cả", "1つも選ばなければ全部": "không chọn thì là tất cả",
    "ある": "có", "のとき": " khi", "と": " và ", "の": " ", "以上": " trở lên", "以内": " trở xuống",
}


LENVI = {
    '選択（10／20／50 件／ページ）': 'Chọn (10 / 20 / 50 dòng / trang)',
    '選択（タブにある申請の種類）': 'Chọn (loại đơn có trong tab)',
    '申請詳細 CH-yyyymmdd-nnnn ＋ ステータス': 'Chi tiết đơn CH-yyyymmdd-nnnn + trạng thái',
    '選択（定型7つ）': 'Chọn (7 lý do định sẵn)',
    '選択（なし／あり（OP000007 設置代行））': 'Chọn (không / có (OP000007 lắp đặt hộ))',
    '選択（倉庫マスタ）': 'Chọn (master kho)',
    '選択（運送会社／納品会社／1日〜3日）': 'Chọn (hãng vận chuyển / công ty giao hàng / 1〜3 ngày)',
    '選択（置いたまま（保管料なし）／引き揚げる）': 'Chọn (để nguyên (không phí lưu kho) / thu hồi)',
    '選択（報告を待つ（報告があれば精算）／スキップする（報告なしで進める））': 'Chọn (chờ báo cáo (có báo cáo thì quyết toán) / bỏ qua (tiếp tục không cần báo cáo))',
    '選択（休止前と同じ／見直す（子契約の配送ルートで直す））': 'Chọn (giống trước khi tạm dừng / xem lại (sửa ở tuyến giao hàng của hợp đồng con))',
    '文字列（ログイン中の運営ユーザー）': 'Chuỗi (người dùng vận hành đang đăng nhập)',
    '選択（有効な運営ユーザー。役割では絞らない）': 'Chọn (người dùng vận hành đang hoạt động; không lọc theo vai trò)',
    '選択（新しい法人／既存の法人）': 'Chọn (pháp nhân mới / pháp nhân có sẵn)',
    '選択（有効な法人。法人ID＋法人名）': 'Chọn (pháp nhân đang hoạt động; ID + tên pháp nhân)',
    '選択（プランマスタの公開中のプラン）': 'Chọn (gói đang công khai trong master gói)',
    '選択（冷蔵庫／冷蔵庫＋冷凍庫／冷蔵庫＋自販機／自販機のみ）': 'Chọn (tủ lạnh / tủ lạnh + tủ đông / tủ lạnh + máy bán hàng / chỉ máy bán hàng)',
    '選択（法人／この拠点）': 'Chọn (pháp nhân / điểm này)',
    '選択（3ヶ月前／2ヶ月前／1ヶ月前／当月／翌月）': 'Chọn (3 tháng trước / 2 tháng trước / 1 tháng trước / tháng này / tháng sau)',
    '文字列 60（名前・フリガナ・メール・電話）': 'Chuỗi 60 (tên, furigana, email, điện thoại)',
    '選択（人数の区分）': 'Chọn (nhóm số người)',
    '複数選択（オプションマスタの「申込に出す」かつ使用中のもの）': 'Chọn nhiều (tùy chọn đang dùng và được đánh dấu hiện khi đăng ký trong master tùy chọn)',
    '選択（法人の担当者・拠点の担当者のメールのどれか）': 'Chọn (một trong email của người phụ trách pháp nhân, điểm)',
    '選択（お試しの月数）': 'Chọn (số tháng dùng thử)',
    'ES配送便（固定・選択肢なし）': 'Chuyến ES (cố định, không có lựa chọn)',
    '選択（電話／メール／営業（訪問）／運営の判断（例：長期の不在）／その他）': 'Chọn (điện thoại / email / kinh doanh (thăm) / quyết định của vận hành (ví dụ: vắng mặt dài ngày) / khác)',
    '選択（プランの変更／配送の変更／設備の変更／拠点情報の変更／法人情報の変更）': 'Chọn (đổi gói / đổi giao hàng / đổi thiết bị / đổi thông tin điểm / đổi thông tin pháp nhân)',
    '選択（利用中の拠点がある法人。法人ID＋法人名）': 'Chọn (pháp nhân có điểm đang dùng; ID + tên pháp nhân)',
    '選択（プランマスタの公開中のプラン・コース）': 'Chọn (gói và khóa đang công khai trong master gói)',
    'ES配送便（固定）': 'Chuyến ES (cố định)',
    '選択（設備を追加したい／サイズを変えたい／機種を変えたい／設備を返却したい）': 'Chọn (muốn thêm thiết bị / muốn đổi kích thước / muốn đổi máy / muốn trả thiết bị)',
    '選択（機種マスタの公開中の機種。機種コード＋機種名）': 'Chọn (máy đang công khai trong master máy; mã máy + tên máy)',
    '選択（1台〜）': 'Chọn (từ 1 máy)',
    '複数選択（お届け先名・フリガナ／お届け先の住所／電話番号／請求書の宛先／ゲストモード／お届けできない曜日／設備の希望日）': 'Chọn nhiều (tên nơi giao, furigana / địa chỉ nơi giao / số điện thoại / nơi nhận hóa đơn / chế độ khách / ngày không giao được / ngày mong muốn lắp đặt)',
    '複数選択（住所／電話番号・FAX番号）': 'Chọn nhiều (địa chỉ / số điện thoại, FAX)',
    '選択（47都道府県）': 'Chọn (47 tỉnh thành)',
    '選択（法人の拠点。拠点ID＋拠点名＋親契約番号）': 'Chọn (điểm của pháp nhân; ID điểm + tên điểm + số hợp đồng cha)',
    '選択（選べる最早月以降のサイクル月）': 'Chọn (tháng chu kỳ từ tháng sớm nhất chọn được)',
    '選択（開始より後のサイクル月）': 'Chọn (tháng chu kỳ sau tháng bắt đầu)',
    '選択（休止予定の拠点は休止の開始サイクル月に固定）': 'Chọn (điểm dự kiến tạm dừng cố định ở tháng chu kỳ bắt đầu tạm dừng)',
    '文字列 CU＋5桁': 'Chuỗi CU + 5 chữ số',
}


def _lv(s):
    if s in LENVI:
        return LENVI[s]
    out = s
    for a, b in sorted(LEN_TOK.items(), key=lambda x: -len(x[0])):
        out = out.replace(a, b)
    for a, b in _LEN_BASE:
        out = out.replace(a, b)
    return re.sub(r"\s+", " ", out).strip()


def F(no, ja, sel, kind, trig="view", **kw):
    d = {"no": no, "ja": ja, "vi": "", "sel": sel, "kind": kind, "trig": trig}
    for k, v in kw.items():
        if k in _PAIR and isinstance(v, str):
            v = [v, ""]
        if k == "len" and isinstance(v, str) and not re.match(r"^文字列 \d+$", v):
            lv = _lv(v)
            v = [v, lv] if not _JP.search(lv) else v
        d[k] = v
    return d


def CAT(*jas):
    """T() で書いた日本語を並べてつなぐ（訳も同じ順につなぐ）"""
    ja = "".join(jas)
    VI[ja] = "".join(VI[j] for j in jas)
    return ja


def V(vid, code, state, url, setup="", items=(), **kw):
    d = {"id": vid, "code": code, "state": state, "url": url, "setup": setup, "items": list(items)}
    d.update(kw)
    return d


JS = ("const sleep=ms=>new Promise(r=>setTimeout(r,ms));"
      "const setv=(el,v)=>{const p=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(p,'value').set.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}));};"
      "const sets=(el,v)=>{Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(el,v);el.dispatchEvent(new Event('change',{bubbles:true}));};"
      "const btn=(t,root)=>[...(root||document).querySelectorAll('button')].find(b=>b.textContent.replace(/\\s+/g,'').includes(t));"
      "const q=s=>document.querySelector(s);const qa=s=>[...document.querySelectorAll(s)];"
      "const tab=t=>qa('.es-tab').find(b=>b.textContent.trim().startsWith(t));")
TABNEW = JS + "tab('新規契約').click();await sleep(500);"
TABCH = JS + "tab('契約変更').click();await sleep(600);"
TABST = JS + "tab('休止・解約').click();await sleep(600);"
SUBMIT = "btn('検索',q('.es-search__actions')).click();await sleep(500);"
OPEN = lambda no: "[...document.querySelectorAll('a.idlink')].find(a=>a.textContent.trim()==='%s').click();await sleep(900);" % no

# ------------------------------------------------------------------ 共通の言い回し（コードとの差）
FULL = T("フル権限（契約申請の作成＝代理入力・CSV取込ができる役割）だけに表示", "Chỉ hiển thị cho vai trò toàn quyền (có thể tạo đơn = nhập thay, nhập CSV)")
UPD = T("契約申請の編集ができる役割（フル権限・CS）だけに表示", "Chỉ hiển thị cho vai trò sửa được đơn hợp đồng (toàn quyền, CS)")
H_SORT = T("コードの初期の並びは新規契約タブ＝申請ID昇順（変更・休止・解約は申請日の降順）。仕様は3タブとも申請日の降順で、並べ替えは全列（宿題 H1）。仕様が正", "Thứ tự ban đầu trong code: tab đơn mới = ID tăng dần (thay đổi / tạm dừng・hủy thì ngày xin giảm dần). Đặc tả: cả 3 tab đều theo ngày xin giảm dần, sắp xếp được mọi cột (việc cần sửa H1). Theo đặc tả")
H_PAGE = T("コードは全件を1ページに出し、ページ送りは見た目だけ（10／20／50件の切替なし）。仕様は台帳 K（1ページ10件・10／20／50・全列の並べ替え・ページ送り）（宿題 H1）。仕様が正", "Code hiện toàn bộ trên 1 trang, phân trang chỉ là hình thức (không đổi 10/20/50). Đặc tả theo sổ K (10 dòng/trang, 10/20/50, sắp xếp mọi cột, phân trang) (việc cần sửa H1). Theo đặc tả")
H_PLACE = T("コードのキーワード欄の文言は「申請ID・法人名・拠点名・担当者名」だが、探す対象は申請ID・法人名・拠点名・ES営業担当。文言を実際の対象に合わせる（宿題）。仕様が正", "Chữ gợi ý ô từ khóa trong code là 「申請ID・法人名・拠点名・担当者名」 nhưng đối tượng tìm là ID đơn, tên pháp nhân, tên điểm, ES営業担当. Sửa chữ cho đúng đối tượng (việc cần sửa). Theo đặc tả")
H_SEARCH = T("コードは検索の横に「未適用」の印を出す部品がある（宿題）。仕様は出さない（P-LIST）。仕様が正", "Code có thành phần hiện dấu 「未適用」 cạnh nút tìm kiếm (việc cần sửa). Đặc tả không hiện (P-LIST). Theo đặc tả")
H_REQNO = T("コードの画面・メッセージに決定番号・REQ 番号が出ている箇所がある（宿題 H12）。開発用の説明は画面に出さない（台帳 K）。仕様が正", "Một số chỗ trong màn hình / thông báo của code hiện số quyết định, số REQ (việc cần sửa H12). Không hiện mô tả cho phát triển trên màn hình (sổ K). Theo đặc tả")
H_MSG = T("コードの文言は共通メッセージと違う。仕様は共通メッセージ（[msg]）", "Câu trong code khác với thông báo chung. Đặc tả dùng thông báo chung ([msg])")
H_NOSEED = T("見本のデータでは作れない状態（画面は通常の表示のまま撮影した）。データを足したら撮り直す", "Trạng thái không tạo được bằng dữ liệu mẫu (ảnh chụp màn hình thường). Khi bổ sung dữ liệu thì chụp lại")
H_SELF = T("承認者・入力者はログイン中の運営ユーザー（自己承認は可・履歴に残す）。コードは「井上 悠」「にっしぐち（運営）」の固定（宿題 H8）。仕様が正", "Người duyệt / người nhập là người dùng vận hành đang đăng nhập (tự duyệt được, lưu lịch sử). Code cố định 「井上 悠」「にっしぐち（運営）」 (việc cần sửa H8). Theo đặc tả")

# ====================================================================== AW_APPL_001 一覧
C1 = "AW_APPL_001"
SEARCHSEL = lambda n: ".es-search__fields > div:nth-child(%d) select" % n
L_HEAD = [
    F("1", T("ヘッダー", "Phần đầu trang"), ".es-pagehead", "area", detail=T("パンくず（契約申請管理）・画面名・操作ボタン（CSV出力・CSV取込・新規登録（代理入力）または変更申請の代理入力）。ボタンは権限のない役割には出さない（灰色にしない）。CSV出力を先に、CSV取込を右に置く（台帳 F・運営の一覧すべてでそろえる）。", "Breadcrumb (契約申請管理), tên màn hình, các nút thao tác (CSV出力・CSV取込・新規登録（代理入力） hoặc 変更申請の代理入力). Không hiện nút với vai trò không có quyền (không làm xám). CSV出力 đặt trước, CSV取込 bên phải (sổ F; thống nhất ở mọi danh sách vận hành).")),
    F("1.1", T("パンくず", "Breadcrumb"), ".es-breadcrumb", "label", detail=T("「契約申請管理」。リンクは動かない（表示だけ）。", "「契約申請管理」. Liên kết không hoạt động (chỉ hiển thị).")),
    F("1.2", T("画面名", "Tên màn hình"), ".es-pagehead__title", "label", detail=T("「契約申請管理」", "Chữ 「契約申請管理」")),
    F("1.3", T("CSV出力", "Xuất CSV"), "button::CSV出力", "button", "click", pattern="P-CSV-OUT", err=["S12"], detail=T("表示しているタブの、検索条件のとおりの全件をタブごとの列で出力する（新規契約タブと、契約変更・休止・解約タブで列が違う）。列は画面の列に 法人ID・拠点ID・申請者・受付経路・却下／取り下げの理由 を足す（台帳 F 運営A Q5。コードは画面の列だけ・宿題）。閲覧できる役割すべてに出す。", "Xuất toàn bộ theo điều kiện tìm kiếm của tab đang hiển thị với cột theo từng tab (tab đơn mới và tab thay đổi / tạm dừng・hủy có cột khác nhau). Cột = cột của màn hình + ID pháp nhân, ID điểm, người xin, kênh tiếp nhận, lý do từ chối / rút đơn (sổ F 運営A Q5. Code chỉ có cột của màn hình; việc cần sửa). Hiển thị cho mọi vai trò xem được."),
      demo_ok=T("コードの列は画面の列だけ（法人ID・拠点ID・申請者・受付経路・却下／取り下げの理由がない・宿題）。仕様が正", "Cột trong code chỉ là cột của màn hình (không có ID pháp nhân, ID điểm, người xin, kênh tiếp nhận, lý do từ chối / rút đơn; việc cần sửa). Theo đặc tả")),
    F("1.4", T("CSV取込", "Nhập CSV"), "button::CSV取込", "button", "click", cond=CAT(T("新規契約タブでだけ表示。", "Chỉ hiển thị ở tab đơn mới. "), FULL), pattern="P-CSV", detail=T("押すと画面 AW_APPL_006「新規申込CSV取込」へ進む（状態 061〜）。新規申込の一括登録だけ（契約変更・休止・解約の取込はない）。", "Bấm để sang màn hình AW_APPL_006 「新規申込CSV取込」 (trạng thái 061〜). Chỉ đăng ký hàng loạt đơn mới (không có nhập cho thay đổi / tạm dừng・hủy).")),
    F("1.5", T("新規登録（代理入力）", "Đăng ký mới (nhập thay)"), "button::新規登録（代理入力）", "button", "click", cond=CAT(T("新規契約タブでだけ表示。", "Chỉ hiển thị ở tab đơn mới. "), FULL), detail=T("押すと AW_APPL_004「契約申込新規登録」へ進む。電話・紙・メール・営業で受けた申込を運営が入力する。", "Bấm để sang AW_APPL_004 「契約申込新規登録」. Vận hành nhập đơn nhận qua điện thoại, giấy, email, nhân viên kinh doanh.")),
]
L_TABS = [
    F("2", T("タブ", "Tab"), ".es-tabs", "area", pattern="P-TAB", detail=T("タブは「新規契約」「契約変更」「休止・解約」の3つ。件数をタブに出す。タブはアドレス（?tab=）に持ち、戻ったときに同じタブを開く（宿題 H2：コードはメモリに持つ）。タブを切り替えるとそのタブの条件に戻る（検索語だけ残す）。", "3 tab: 「新規契約」「契約変更」「休止・解約」. Hiện số lượng trên tab. Tab được lưu ở địa chỉ (?tab=) và mở lại đúng tab khi quay lại (việc cần sửa H2: code giữ trong bộ nhớ). Chuyển tab thì về điều kiện của tab đó (chỉ giữ từ khóa)."), demo_ok=T("タブをアドレスに持つ（P-TAB）のは宿題 H2（コードはメモリ）。仕様が正", "Việc giữ tab ở địa chỉ (P-TAB) là việc cần sửa H2 (code giữ trong bộ nhớ). Theo đặc tả")),
    F("2.1", T("新規契約", "Đơn mới"), ".es-tab::新規契約", "tab", "click", detail=T("申込の受付。件数＝対応が必要な申込（受付中・契約設定中）の数。右に内訳「受付中 n／契約設定中 n」。", "Tiếp nhận đơn. Số = số đơn cần xử lý (受付中・契約設定中). Bên phải là chi tiết 「受付中 n／契約設定中 n」.")),
    F("2.2", T("契約変更", "Thay đổi hợp đồng"), ".es-tab::契約変更", "tab", "click", detail=T("プラン・配送・設備・拠点情報・法人情報の変更申請の承認。件数＝承認待ち・対応中の数。", "Duyệt đơn thay đổi gói, giao hàng, thiết bị, thông tin điểm, thông tin pháp nhân. Số = số đơn 承認待ち・対応中.")),
    F("2.3", T("休止・解約", "Tạm dừng・hủy"), ".es-tab::休止・解約", "tab", "click", detail=T("休止・再開・解約の申請の承認。件数＝承認待ち・対応中の数。", "Duyệt đơn tạm dừng, tiếp tục, hủy. Số = số đơn 承認待ち・対応中.")),
]
L_SEARCH_NEW = [
    F("3", T("検索条件", "Điều kiện tìm kiếm"), ".es-search", "area", pattern="P-LIST", detail=T("条件は「検索」か Enter で反映する。検索条件の枠は es-search（台帳 K）。タブごとに条件の種類が違う（新規契約タブ／契約変更・休止・解約タブ）。", "Điều kiện được áp dụng khi bấm 「検索」 hoặc Enter. Khung điều kiện là es-search (sổ K). Loại điều kiện khác nhau theo tab (tab đơn mới / tab thay đổi・tạm dừng・hủy)."), demo_ok=H_SEARCH),
    F("3.1", T("キーワード", "Từ khóa"), ".es-search input", "text", "input", req="－", len="文字列 60", init=T("空", "Trống"), ex=["AP-20260910-0031", "Từ khóa tìm theo ID đơn / tên pháp nhân / tên điểm / ES営業担当 (khớp một phần)"],
      valid=T("部分一致。全角・半角、大文字・小文字を区別しない。前後の空白は取る。61文字以上は E04（入力欄の下。切り捨てず、検索もしない）。", "Khớp một phần. Không phân biệt toàn / nửa góc, hoa / thường. Bỏ khoảng trắng đầu cuối. Từ 61 ký tự trở lên thì E04 (dưới ô nhập; không cắt, không tìm kiếm)."), err=["E04"], detail=T("申請ID・法人名・拠点名・ES営業担当のどれかに含まれる行。", "Các dòng có chứa trong ID đơn, tên pháp nhân, tên điểm hoặc ES営業担当."), demo_ok=H_PLACE),
    F("3.2", T("契約区分", "Loại hợp đồng"), SEARCHSEL(2), "select", "select", req="－", len="選択（本導入／お試し／切替）", init=T("未選択（先頭＝条件名）", "Chưa chọn (đầu = tên điều kiện)"), ex=["お試し", "Lọc theo loại hợp đồng: dùng thử"]),
    F("3.3", T("プラン", "Gói"), SEARCHSEL(3), "select", "select", req="－", len="選択（申込にあるプラン）", init=T("未選択", "Chưa chọn"), ex=["ES000004 100プラン", "Lọc theo gói (ID + tên gói)"]),
    F("3.4", T("コース", "Khóa"), SEARCHSEL(4), "select", "select", req="－", len="選択（ESライト／ESスタンダード）", init=T("未選択", "Chưa chọn"), ex=["ESスタンダード", "Lọc theo khóa (loại menu)"]),
    F("3.5", T("設備区分", "Loại thiết bị"), SEARCHSEL(5), "select", "select", req="－", len="選択（拠点ごと／冷蔵庫／自販機）", init=T("未選択", "Chưa chọn"), ex=["自販機", "Lọc theo loại thiết bị"]),
    F("3.6", T("ES営業担当", "Nhân viên kinh doanh ES"), SEARCHSEL(6), "select", "select", req="－", len="選択（申込にある営業担当）", init=T("未選択", "Chưa chọn"), ex=["田中 健一", "Lọc theo nhân viên kinh doanh phụ trách"]),
    F("3.7", T("ステータス", "Trạng thái"), SEARCHSEL(7), "select", "select", req="－", len="選択（受付中／契約設定中／完了／却下／取り下げ済）", init=T("未選択", "Chưa chọn"), ex=["受付中", "Lọc theo trạng thái đơn"]),
    F("3.8", T("並び", "Sắp xếp"), SEARCHSEL(13), "select", "select", req="－", len="選択（並び：申請ID／並び：申請日）", init=T("並び：申請ID", "Sắp xếp: ID đơn"), ex=["並び：申請日", "Chọn mục sắp xếp (hiện chỉ có ID đơn / ngày xin)"], detail=T("仕様は初期＝申請日の降順で、並べる項目は一覧の全列（台帳 K・宿題 H1）。", "Đặc tả: ban đầu = ngày xin giảm dần, mục sắp xếp là mọi cột của danh sách (sổ K, việc cần sửa H1)."), demo_ok=H_SORT),
    F("3.9", T("申請日（から）", "Ngày xin (từ)"), 'input[aria-label="申請日（から）"]', "date", "input", req="－", len="日付 yyyy-mm-dd", init=T("空", "Trống"), ex=["2026-09-01", "Ngày xin từ ngày này (yyyy-mm-dd)"], detail=T("から〜まで。片方だけでもよい。", "Từ〜đến. Chỉ một bên cũng được.")),
    F("3.10", T("申請日（まで）", "Ngày xin (đến)"), 'input[aria-label="申請日（まで）"]', "date", "input", req="－", len="日付 yyyy-mm-dd", init=T("空", "Trống"), ex=["2026-09-30", "Ngày xin đến ngày này (yyyy-mm-dd)"], err=["E08"], valid=T("「から」より前の日付は E08（「まで」の欄の下に出す。検索はしない）。", "Ngày trước 「から」 thì E08 (hiện dưới ô 「まで」; không tìm kiếm).")),
    F("3.11", T("法人", "Pháp nhân"), 'select[aria-label="法人"]', "select", "select", req="－", len="選択（法人名）", init=T("未選択", "Chưa chọn"), ex=["株式会社サンプルフーズ", "Lọc theo pháp nhân (tên pháp nhân)"]),
    F("3.12", T("開始サイクル月", "Tháng chu kỳ bắt đầu"), 'input[aria-label="開始サイクル月"]', "month", "input", req="－", len="年月 yyyy-mm", init=T("空", "Trống"), ex=["2026-11", "Tháng chu kỳ bắt đầu (yyyy-mm)"]),
    F("3.13", T("受付経路", "Kênh tiếp nhận"), SEARCHSEL(8), "select", "select", req="－", len="選択（法人Web／ログインなしの申込／電話／営業（訪問）／紙の申込書／メール／CSV取込／その他）", init=T("未選択", "Chưa chọn"), ex=["電話", "Lọc theo kênh tiếp nhận (nhập thay thì chọn kênh khi nhập)"]),
    F("3.14", T("クリア", "Xóa điều kiện"), ".es-search__actions button::クリア", "button", "click", detail=T("条件をすべて初期値に戻し、すぐ反映する。", "Đưa mọi điều kiện về giá trị ban đầu và áp dụng ngay.")),
    F("3.15", T("検索", "Tìm kiếm"), ".es-search__actions button::検索", "button", "click", detail=T("条件を反映して表示し直す。Enter でも同じ。", "Áp dụng điều kiện và hiển thị lại. Enter cũng như vậy.")),
]
L_TABLE_NEW = [
    F("4", T("一覧（新規契約）", "Danh sách (đơn mới)"), ".es-table-wrap", "table", pattern="P-LIST", detail=T("1行＝1申込（複数拠点の申込は1行）。却下・取り下げ済みの行も出す（灰・赤のバッジ）。初期の並びは申請日の降順（コードは申請ID昇順）。ステータスのバッジの色：受付中＝黄・契約設定中＝青・完了＝緑・却下＝赤・取り下げ済＝灰。", "1 dòng = 1 đơn (đơn nhiều điểm là 1 dòng). Hiện cả dòng 却下・取り下げ済み (badge xám, đỏ). Thứ tự ban đầu: ngày xin giảm dần (code là ID tăng dần). Màu badge trạng thái: 受付中 = vàng, 契約設定中 = xanh, 完了 = xanh lá, 却下 = đỏ, 取り下げ済み = xám."), demo_ok=H_SORT),
    F("4.1", T("No", "No"), "th::No", "label", len="整数", detail=T("表示順の連番（その時点の並びの番号）。", "Số thứ tự hiển thị (số theo thứ tự lúc đó).")),
    F("4.2", T("申請ID", "ID đơn"), ".es-table tbody tr:nth-child(1) a.idlink", "link", "click", len="文字列 AP-yyyymmdd-nnnn", detail=T("クリックで AW_INTK_001（受付）へ。却下・取り下げ済みの行はダイアログで理由と日時だけを出す（状態 004）。代理入力の申込は「代理入力」の札と受付経路を下に出す。", "Bấm để sang AW_INTK_001 (tiếp nhận). Dòng 却下・取り下げ済み chỉ hiện lý do và ngày giờ ở hộp thoại (trạng thái 004). Đơn nhập thay hiện nhãn 「代理入力」 và kênh tiếp nhận ở dưới.")),
    F("4.3", T("契約区分", "Loại hợp đồng"), "th::契約区分", "label", len="本導入／お試し／切替"),
    F("4.4", T("法人名／拠点名", "Tên pháp nhân / tên điểm"), "th::法人名／拠点名", "label", detail=T("上段に法人名（太字）、下段に拠点名。複数拠点の申込は拠点名を「・」でつなぐ。", "Dòng trên là tên pháp nhân (đậm), dòng dưới là tên điểm. Đơn nhiều điểm nối tên điểm bằng 「・」.")),
    F("4.5", T("プラン", "Gói"), "th::プラン", "label", detail=T("「ES000004 100プラン」の形。複数拠点で違うときは「複数（n拠点）」。", "Dạng 「ES000004 100プラン」. Nhiều điểm khác nhau thì 「複数（n拠点）」.")),
    F("4.6", T("コース", "Khóa"), "th::コース", "label", detail=T("ESライト／ESスタンダード（設備が違うときは括弧で付ける）。", "ESライト／ESスタンダード (kèm trong ngoặc nếu thiết bị khác).")),
    F("4.7", T("設備区分", "Loại thiết bị"), "th::設備区分", "label", detail=T("冷蔵庫／自販機。拠点で違うときは「拠点ごと」。", "冷蔵庫／自販機. Điểm khác nhau thì 「拠点ごと」.")),
    F("4.8", T("配送区分", "Loại giao hàng"), "th::配送区分", "label", detail=T("ES配送便／COOL便（複数あれば「・」でつなぐ）。", "ES配送便／COOL便 (nhiều loại thì nối bằng 「・」).")),
    F("4.9", T("納品回数", "Số lần giao"), "th::納品回数", "label", detail=T("「月2回」の形。未入力は「—」。", "Dạng 「月2回」. Chưa nhập là 「—」.")),
    F("4.10", T("アカウント状態", "Trạng thái tài khoản"), "th::アカウント状態", "label", detail=T("未発行（黄）／発行済（緑）／ログイン済（緑）。申込を仮登録するとアカウントを発行する（AW_INTK_001）。", "Chưa cấp (vàng) / Đã cấp (xanh lá) / Đã đăng nhập (xanh lá). Khi đăng ký tạm đơn sẽ cấp tài khoản (AW_INTK_001).")),
    F("4.11", T("ES営業担当", "Nhân viên kinh doanh ES"), "th::ES営業担当", "label", detail=T("申込を担当する運営ユーザー。未設定は空。", "Người dùng vận hành phụ trách đơn. Chưa đặt thì để trống.")),
    F("4.12", T("ステータス", "Trạng thái"), "th::ステータス", "label", len="受付中／契約設定中／完了／却下／取り下げ済"),
    F("4.13", T("申請日", "Ngày xin"), "th::申請日", "label", len="日付 yyyy-mm-dd"),
]
L_PAGER = [
    F("5", T("ページ送り", "Phân trang"), ".es-pagination", "area", pattern="P-LIST", detail=T("1ページ10件・表示件数 10／20／50（台帳 K）。件数は「n件中 a–b件」。", "10 dòng/trang, số dòng hiển thị 10/20/50 (sổ K). Số lượng hiển thị 「n件中 a–b件」."), demo_ok=H_PAGE),
    F("5.1", T("件数", "Số lượng"), ".es-pagination__meta", "label", detail=T("「n件中 a–b件」。0件は「0件中 0–0件」。", "「n件中 a–b件」. 0 dòng là 「0件中 0–0件」.")),
    F("5.2", T("表示件数", "Số dòng hiển thị"), 'select[aria-label="表示件数"]', "select", "select", req="－", len="選択（10／20／50 件／ページ）", init=T("10件／ページ", "10 dòng / trang"), ex=["20件／ページ", "Số dòng hiển thị mỗi trang"], detail=T("変えると1ページ目に戻る。選んだ件数は人ごと・一覧ごとに覚える（P-PAGESIZE）。", "Đổi thì về trang 1. Số đã chọn được nhớ theo từng người, từng danh sách (P-PAGESIZE)."), demo_ok=H_PAGE),
]
V001 = V("001", C1, T("新規契約タブ 初期（6件）", "Tab đơn mới, ban đầu (6 dòng)"), "/ops/applications", TABNEW, L_HEAD + L_TABS + L_SEARCH_NEW + L_TABLE_NEW + L_PAGER, full=True, wait=700,
         note=T("フル権限（Ad00010）。見本の新規申込は 6 件（受付中 3・契約設定中 3）。完了・却下・取り下げ済みの行も一覧に出る。", "Toàn quyền (Ad00010). Đơn mới của dữ liệu mẫu có 6 dòng (受付中 3, 契約設定中 3). Dòng hoàn tất, từ chối, rút đơn cũng hiện trong danh sách."))
V002 = V("002", C1, T("検索して絞り込み（契約区分＝お試し）", "Tìm kiếm thu hẹp (loại hợp đồng = お試し)"), "/ops/applications", TABNEW + "sets(q('.es-search__fields > div:nth-child(2) select'),'お試し');await sleep(200);" + SUBMIT, [
    F("6", T("絞り込んだ一覧", "Danh sách đã lọc"), ".es-table-wrap", "table", pattern="P-LIST", detail=T("「検索」を押した時点で条件を反映する。件数・ページは1ページ目に戻る。タブの件数は条件に関係なく全体の件数。", "Phản ánh điều kiện khi bấm 「検索」. Số lượng và trang về trang 1. Số trên tab là số toàn bộ, không phụ thuộc điều kiện.")),
], wait=500)
V003 = V("003", C1, T("該当なし（0件）", "Không có dữ liệu (0 dòng)"), "/ops/applications", TABNEW + "setv(q('.es-search input'),'zzz');await sleep(100);" + SUBMIT, [
    F("6", T("0件のメッセージ", "Thông báo 0 dòng"), ".es-table tbody td[colspan]", "label", "show", err=["I01"], detail=T("一覧の中に I01 を1行で出す（コードの文言は「条件に合う申請はありません」。I01 に統一する・宿題）。", "Hiện I01 trong 1 dòng của danh sách (câu trong code là 「条件に合う申請はありません」. Thống nhất thành I01; việc cần sửa)."),
      demo_ok=T("コードの文言は「条件に合う申請はありません」（宿題）。仕様は I01", "Câu trong code là 「条件に合う申請はありません」 (việc cần sửa). Đặc tả là I01")),
], wait=500)
V004 = V("004", C1, T("却下・取り下げ済みの行：理由と日時のダイアログ", "Dòng 却下・取り下げ済み: hộp thoại lý do và ngày giờ"), "/ops/applications", TABNEW + OPEN("AP-20260915-0048"), [
    F("6", T("申請詳細（却下・取り下げ済）", "Chi tiết đơn (từ chối / rút đơn)"), ".es-dialog__panel", "modal", detail=T("却下・取り下げ済みの申込は受付画面（AW_INTK_001）を開かず、理由と日時だけをダイアログで出す（直接アドレスで開いたときも同じ内容を画面で出す）。項目は 法人／拠点・ステータス・却下した人・日時（取り下げは取り下げ日時）・却下理由（取り下げは取り下げ理由）・お客様へのひとこと。", "Đơn bị từ chối / rút không mở màn hình tiếp nhận (AW_INTK_001) mà chỉ hiện lý do và ngày giờ bằng hộp thoại (mở trực tiếp bằng địa chỉ cũng hiện cùng nội dung trên màn hình). Mục gồm: pháp nhân / điểm, trạng thái, người từ chối・ngày giờ (rút đơn là ngày giờ rút), lý do từ chối (rút đơn là lý do rút), lời nhắn cho khách.")),
    F("6.1", T("法人／拠点", "Pháp nhân / điểm"), ".es-dialog__panel .es-field:nth-child(1)", "label", detail=T("「法人名／拠点名」。", "「Tên pháp nhân／tên điểm」.")),
    F("6.2", T("ステータス", "Trạng thái"), ".es-dialog__panel .es-field:nth-child(2)", "label", detail=T("却下（赤）／取り下げ済（灰）。", "却下 (đỏ) / 取り下げ済み (xám).")),
    F("6.3", T("却下した人・日時", "Người từ chối・ngày giờ"), ".es-dialog__panel .es-field:nth-child(3)", "label", detail=T("ログイン中の運営ユーザーの名前と日時（取り下げのときは「取り下げ日時」）。記録がなければ「—」。", "Tên người dùng vận hành đang đăng nhập và ngày giờ (rút đơn thì là 「取り下げ日時」). Không có ghi chép thì 「—」."), demo_ok=T("見本の却下は、人・日時の記録がなく「—」を出す。実装後の見本データには記録を入れる", "Từ chối trong dữ liệu mẫu không có ghi chép người / ngày giờ nên hiện 「—」. Sau khi cài đặt sẽ đưa ghi chép vào dữ liệu mẫu")),
    F("6.4", T("却下理由", "Lý do từ chối"), ".es-dialog__panel .es-field:nth-child(4)", "label", detail=T("却下の定型7つ（申請内容に不備がある／設置条件を満たさない／オーダー締切に間に合わない／設備・在庫の手配ができない／配送エリア・配送ルートの都合で対応できない／契約条件（最低利用期間など）に合わない／その他）から選んだ文言と、お客様へのひとこと。取り下げは取り下げ理由。", "Câu đã chọn trong 7 lý do từ chối định sẵn (đơn có thiếu sót / không đạt điều kiện lắp đặt / không kịp hạn chốt order / không thể chuẩn bị thiết bị・tồn kho / không đáp ứng được do khu vực・tuyến giao hàng / không phù hợp điều kiện hợp đồng (thời gian sử dụng tối thiểu...) / khác) và lời nhắn cho khách. Rút đơn là lý do rút."),
      open=T("却下の定型7つの文言と、お客様に送る却下メールの定型文（M6）の言い回し（決定ファイルに一覧がない）", "Câu chữ của 7 lý do từ chối định sẵn và câu mẫu của email từ chối gửi khách (M6) (không có danh sách trong file quyết định)"), ask="お客様（運用）"),
    F("6.5", T("閉じる", "Đóng"), ".es-dialog__panel button::閉じる", "button", "click", detail=T("ダイアログを閉じる。", "Đóng hộp thoại.")),
], wait=700, note=T("申請 AP-20260915-0048（却下）。取り下げ済み AP-20260918-0050 も同じ形。", "Đơn AP-20260915-0048 (từ chối). Đơn đã rút AP-20260918-0050 cũng cùng dạng."))

# 契約変更タブ（6件）
L_SEARCH_CH = [
    F("7", T("検索条件（契約変更・休止・解約）", "Điều kiện tìm kiếm (thay đổi・tạm dừng・hủy)"), ".es-search", "area", pattern="P-LIST", detail=T("契約変更タブと休止・解約タブの条件は同じ種類。キーワード・申請の種類・拠点・ステータス・並び（コード）。受付経路・ES営業担当・申請日の範囲・法人・開始サイクル月・「オーダー締切を過ぎたもの」を足してある（台帳 F 運営A Q5）。絞り込みはサーバー側。", "Điều kiện của tab thay đổi và tab tạm dừng・hủy cùng loại: từ khóa, loại đơn, điểm, trạng thái, sắp xếp (code). Đã thêm kênh tiếp nhận, ES営業担当, khoảng ngày xin, pháp nhân, tháng chu kỳ bắt đầu, 「quá hạn chốt order」 (sổ F 運営A Q5). Lọc phía máy chủ."), demo_ok=H_SEARCH),
    F("7.1", T("申請の種類", "Loại đơn"), SEARCHSEL(2), "select", "select", req="－", len="選択（タブにある申請の種類）", init=T("未選択", "Chưa chọn"), ex=["プランの変更", "Lọc theo loại đơn (gói / giao hàng / thiết bị / thông tin điểm / thông tin pháp nhân hoặc tạm dừng / tiếp tục / hủy)"]),
    F("7.2", T("拠点", "Điểm"), SEARCHSEL(3), "select", "select", req="－", len="選択（タブにある拠点）", init=T("未選択", "Chưa chọn"), ex=["株式会社サンプル 大阪支店", "Lọc theo điểm"]),
    F("7.3", T("ステータス", "Trạng thái"), SEARCHSEL(4), "select", "select", req="－", len="選択（承認待ち／対応中／承認済／一部承認／却下／取り下げ済）", init=T("未選択", "Chưa chọn"), ex=["承認待ち", "Lọc theo trạng thái đơn"], detail=T("対応中＝複数拠点の申請で一部が済んでいない状態「対応中 n/m」（台帳 F #42）。", "対応中 = đơn nhiều điểm mà một phần chưa xong, trạng thái 「対応中 n/m」 (sổ F #42).")),
    F("7.4", T("並び", "Sắp xếp"), SEARCHSEL(12), "select", "select", req="－", len="選択（並び：申請日／並び：申請ID）", init=T("並び：申請日", "Sắp xếp: ngày xin"), ex=["並び：申請ID", "Chọn mục sắp xếp"], demo_ok=H_SORT),
    F("7.5", T("ES営業担当（契約変更・休止・解約）", "ES営業担当 (thay đổi・tạm dừng・hủy)"), 'select[aria-label="ES営業担当"]', "select", "select", req="－", len="選択（営業担当）", init=T("未選択", "Chưa chọn"), ex=["井上 悠", "Lọc theo nhân viên kinh doanh phụ trách"]),
    F("7.7", T("受付経路", "Kênh tiếp nhận"), SEARCHSEL(5), "select", "select", req="－", len="選択（法人Web／ログインなしの申込／電話／営業（訪問）／紙の申込書／メール／CSV取込／その他）", init=T("未選択", "Chưa chọn"), ex=["電話", "Lọc theo kênh tiếp nhận"], detail=T("新規契約タブと同じ8つの選択肢（台帳 F 運営A Q15）。法人Webからの申請は「法人Web」、代理入力は入力した経路（一覧にない値は「その他」）。", "Cùng 8 lựa chọn như tab đơn mới (sổ F 運営A Q15). Đơn từ Web pháp nhân là 「法人Web」, nhập thay là kênh đã nhập (giá trị ngoài danh sách là 「その他」).")),
    F("7.6", T("オーダー締切を過ぎたもの", "Đơn quá hạn chốt order"), 'label::オーダー締切を過ぎたもの', "check", "check", req="－", len="ON／OFF", init="OFF", ex=["ON", "Chỉ hiện đơn đã quá hạn chốt order"]),
    F("7.8", T("申請日（から）", "Ngày xin (từ)"), 'input[aria-label="申請日（から）"]', "date", "input", req="－", len="日付 yyyy-mm-dd", init=T("空", "Trống"), ex=["2026-09-01", "Ngày xin từ ngày này (yyyy-mm-dd)"], detail=T("から〜まで。片方だけでもよい。新規契約タブと同じ（3.9・3.10）。", "Từ〜đến. Chỉ một bên cũng được. Giống tab đơn mới (3.9・3.10).")),
    F("7.9", T("申請日（まで）", "Ngày xin (đến)"), 'input[aria-label="申請日（まで）"]', "date", "input", req="－", len="日付 yyyy-mm-dd", init=T("空", "Trống"), ex=["2026-09-30", "Ngày xin đến ngày này (yyyy-mm-dd)"], err=["E08"], valid=T("「から」より前の日付は E08（「まで」の欄の下に出す。検索はしない）。", "Ngày trước 「から」 thì E08 (hiện dưới ô 「まで」; không tìm kiếm).")),
    F("7.10", T("法人", "Pháp nhân"), 'select[aria-label="法人"]', "select", "select", req="－", len="選択（タブにある法人名）", init=T("未選択", "Chưa chọn"), ex=["株式会社サンプル", "Lọc theo pháp nhân (tên pháp nhân)"]),
    F("7.11", T("開始サイクル月", "Tháng chu kỳ bắt đầu"), 'input[aria-label="開始サイクル月"]', "month", "input", req="－", len="年月 yyyy-mm", init=T("空", "Trống"), ex=["2026-11", "Tháng chu kỳ bắt đầu (yyyy-mm)"], detail=T("申請の開始サイクル月（法人情報の変更は開始月がないので当たらない）。", "Tháng chu kỳ bắt đầu của đơn (đơn thay đổi thông tin pháp nhân không có tháng bắt đầu nên không khớp)."))
]
L_TABLE_CH = [
    F("8", T("一覧（契約変更）", "Danh sách (thay đổi hợp đồng)"), ".es-table-wrap", "table", pattern="P-LIST", detail=T("1行＝1申請（1拠点につき1申請。複数拠点の申請は拠点ごとに1行）。初期の並びは申請日の降順。法人Web・代理入力のどちらの申請も同じ行（代理入力は「代理入力」の札）。", "1 dòng = 1 đơn (1 đơn mỗi điểm. Đơn nhiều điểm là 1 dòng cho mỗi điểm). Thứ tự ban đầu: ngày xin giảm dần. Đơn từ Web pháp nhân và nhập thay đều cùng dòng (nhập thay có nhãn 「代理入力」).")),
    F("8.1", T("申請ID", "ID đơn"), ".es-table tbody tr:nth-child(1) a.idlink", "link", "click", len="文字列 CH-yyyymmdd-nnnn", detail=T("クリックで AW_APPL_002（申請詳細）へ。", "Bấm để sang AW_APPL_002 (chi tiết đơn).")),
    F("8.2", T("申請の種類", "Loại đơn"), "th::申請の種類", "label", detail=T("プランの変更／配送の変更／設備の変更／拠点情報の変更／法人情報の変更（契約変更タブ）、休止／再開／解約（休止・解約タブ）。", "Đổi gói / đổi giao hàng / đổi thiết bị / đổi thông tin điểm / đổi thông tin pháp nhân (tab thay đổi), tạm dừng / tiếp tục / hủy (tab tạm dừng・hủy).")),
    F("8.3", T("法人名／拠点名", "Tên pháp nhân / tên điểm"), "th::法人名／拠点名", "label"),
    F("8.4", T("変更の内容", "Nội dung thay đổi"), "th::変更の内容", "label", detail=T("変わる項目の要約（例「プラン 50プラン → 100プラン」）。", "Tóm tắt các mục thay đổi (ví dụ 「プラン 50プラン → 100プラン」).")),
    F("8.5", T("開始サイクル月", "Tháng chu kỳ bắt đầu"), "th::開始サイクル月", "label", detail=T("反映が始まるサイクル月。法人情報の変更は「承認後すぐ」。", "Tháng chu kỳ bắt đầu phản ánh. Đổi thông tin pháp nhân là 「承認後すぐ」.")),
    F("8.6", T("オーダー締切", "Hạn chốt order"), "th::オーダー締切", "label", detail=T("「あと n日」と締切日。3日以内は黄、過ぎたら赤で「n日 超過」（状態 006・008）。承認済みなどは「—」。", "「あと n日」 và ngày chốt. Trong vòng 3 ngày màu vàng, quá hạn màu đỏ 「n日 超過」 (trạng thái 006・008). Đã duyệt... thì 「—」.")),
    F("8.7", T("ES営業担当", "Nhân viên kinh doanh ES"), "th::ES営業担当", "label"),
    F("8.8", T("ステータス", "Trạng thái"), "th::ステータス", "label", len="承認待ち／対応中／承認済／一部承認／却下／取り下げ済", detail=T("承認待ち＝黄・対応中／一部承認＝青・承認済＝緑・却下＝赤・取り下げ済＝灰。", "承認待ち = vàng, 対応中 / 一部承認 = xanh, 承認済み = xanh lá, 却下 = đỏ, 取り下げ済み = xám.")),
    F("8.9", T("申請日", "Ngày xin"), "th::申請日", "label", len="日付 yyyy-mm-dd"),
]
V005 = V("005", C1, T("契約変更タブ（6件）", "Tab thay đổi hợp đồng (6 dòng)"), "/ops/applications", TABCH, L_SEARCH_CH + L_TABLE_CH + [
    F("10", T("変更申請の代理入力", "Nhập thay đơn thay đổi"), "button::変更申請の代理入力", "button", "click", cond=CAT(T("契約変更タブ・休止・解約タブでだけ表示（表示しているタブの種類で開く）。", "Chỉ hiển thị ở tab thay đổi và tab tạm dừng・hủy (mở theo loại của tab đang hiển thị). "), FULL), detail=T("契約変更タブ → AW_APPL_005（種類＝プラン・配送・設備・拠点情報・法人情報）／休止・解約タブ → 同（種類＝休止・再開・解約）。", "Tab thay đổi → AW_APPL_005 (loại = gói, giao hàng, thiết bị, thông tin điểm, thông tin pháp nhân) / tab tạm dừng・hủy → cùng màn (loại = tạm dừng, tiếp tục, hủy)."))
], full=True, wait=700,
         note=T("見本の変更申請：承認待ち 5（法人情報・プラン・拠点情報・設備・配送）・承認済み 1。1申請＝1拠点（すべて1拠点）。", "Đơn thay đổi của dữ liệu mẫu: 承認待ち 5 (thông tin pháp nhân, gói, thông tin điểm, thiết bị, giao hàng), 承認済み 1. 1 đơn = 1 điểm (tất cả 1 điểm)."))
V006 = V("006", C1, T("オーダー締切の列：あと3日以内（黄）", "Cột hạn chốt order: trong vòng 3 ngày (vàng)"), "/ops/applications", TABCH, [
    F("9", T("オーダー締切（あと3日以内）", "Hạn chốt order (trong vòng 3 ngày)"), ".es-table tbody tr .apx-warn", "label", detail=T("締切（サイクル月の前月15日）の3日前からは「あと n日」を黄で出す。承認待ち・対応中の申請だけに出す。", "Từ 3 ngày trước hạn chốt (ngày 15 tháng trước của tháng chu kỳ) hiện 「あと n日」 màu vàng. Chỉ hiện với đơn 承認待ち・対応中.")),
], today="2026/10/12", wait=700, note=T("デモの日付を 2026-10-12 にして撮影（CH-20260925-0001 のオーダー締切 2026-10-15 まであと3日）。", "Chụp với ngày demo 2026-10-12 (hạn chốt order 2026-10-15 của CH-20260925-0001, còn 3 ngày)."))
V007 = V("007", C1, T("休止・解約タブ（5件・代理入力の印）", "Tab tạm dừng・hủy (5 dòng, nhãn nhập thay)"), "/ops/applications", TABST, [
    F("9", T("代理入力の印", "Nhãn nhập thay"), ".es-table tbody .es-badge::代理入力", "label", detail=T("運営が電話・メールで受けて代理入力した申請には、申請IDの下に「代理入力」の札を出す（法人Webからの申請は出ない）。", "Đơn do vận hành nhận qua điện thoại / email và nhập thay hiện nhãn 「代理入力」 dưới ID đơn (đơn từ Web pháp nhân thì không hiện).")),
    F("9.1", T("休止・解約の申請の種類", "Loại đơn tạm dừng・hủy"), ".es-table tbody tr:nth-child(1) td:nth-child(3) .es-badge", "label", detail=T("解約／再開／休止。再開は休止中の拠点の再開と、休止予定の取消（休止期間0か月）の両方。", "Hủy / tiếp tục / tạm dừng. Tiếp tục gồm tiếp tục điểm đang tạm dừng và hủy bỏ tạm dừng dự kiến (thời gian tạm dừng 0 tháng).")),
], wait=700, note=T("休止・解約タブ。見本：解約（承認済）・再開（休止予定の取消・承認待ち）・休止（承認待ち／承認済）・代理入力の休止（承認済）。", "Tab tạm dừng・hủy. Dữ liệu mẫu: hủy (đã duyệt), tiếp tục (hủy bỏ tạm dừng dự kiến, chờ duyệt), tạm dừng (chờ duyệt / đã duyệt), tạm dừng nhập thay (đã duyệt)."))
V008 = V("008", C1, T("オーダー締切の列：超過（赤）", "Cột hạn chốt order: quá hạn (đỏ)"), "/ops/applications", TABCH, [
    F("9", T("オーダー締切（超過）", "Hạn chốt order (quá hạn)"), ".es-table tbody tr .apx-dang", "label", detail=T("締切を過ぎた承認待ち・対応中の申請は赤で「n日 超過」。承認するときに開始月の扱いを2択から選ぶ（状態 020）。", "Đơn 承認待ち・対応中 đã quá hạn chốt hiện màu đỏ 「n日 超過」. Khi duyệt chọn cách xử lý tháng bắt đầu trong 2 lựa chọn (trạng thái 020).")),
], today="2026/10/16", wait=700, note=T("デモの日付を 2026-10-16 にして撮影（2026-10-15 の締切を過ぎる）。", "Chụp với ngày demo 2026-10-16 (quá hạn chốt 2026-10-15)."))
V009 = V("009", C1, T("メニューのバッジ（件数と内訳）", "Huy hiệu menu (số lượng và chi tiết)"), "/ops/applications", "", [
    F("9", T("メニューのバッジ", "Huy hiệu menu"), "a.nav-g .nbadge", "label", detail=T("サイドメニュー「契約申請管理」の右に、対応が必要な件数（受付中＋契約設定中の申込と、承認待ち・対応中の変更申請の合計。見本は 13）を出す。0件のときは出さない。マウスを置くと内訳「受付中 n／契約設定中 n・変更・休止・解約の承認待ち n」を出す（台帳 F #42。標準のツールチップのため画像には写らない）。ダッシュボードのアラート「契約申請」と同じ件数。", "Bên phải menu 「契約申請管理」 hiện số lượng cần xử lý (tổng đơn 受付中+契約設定中 và đơn thay đổi 承認待ち・対応中; dữ liệu mẫu là 13). Bằng 0 thì không hiện. Rê chuột hiện chi tiết 「受付中 n／契約設定中 n・変更・休止・解約の承認待ち n」 (sổ F #42; là tooltip chuẩn nên không có trong ảnh). Cùng số với cảnh báo 「契約申請」 của dashboard.")),
], wait=500)
V010 = V("010", C1, T("CSV出力（トースト）", "Xuất CSV (toast)"), "/ops/applications", TABNEW + "btn('CSV出力').click();await sleep(700);", [
    F("6", T("出力のトースト", "Toast xuất"), ".toast", "toast", "show", pattern="P-CSV-OUT", err=["S12"], detail=T("検索条件のとおりの全件（ページに関係なく）。UTF-8（BOM あり）・CRLF。ファイル名は「契約申請管理_タブ-{タブ名}_{yyyymmdd-HHmm}.csv」。0件のときも見出し行だけのファイルを出す。", "Toàn bộ theo điều kiện tìm kiếm (không phụ thuộc trang). UTF-8 (có BOM)・CRLF. Tên tệp 「契約申請管理_タブ-{tên tab}_{yyyymmdd-HHmm}.csv」. Dù 0 dòng vẫn xuất tệp chỉ có dòng tiêu đề."),
      demo_ok=T("コードのトーストは「CSVを出力しました（n行・ファイル名）」。S12 の文言に合わせる（[msg]）", "Toast trong code là 「CSVを出力しました（n行・ファイル名）」. Đưa về đúng câu của S12 ([msg])")),
], wait=300)
V011 = V("011", C1, T("参照だけの役割（代理入力・CSV取込なし）", "Vai trò chỉ xem (không có nhập thay・nhập CSV)"), "/ops/applications", TABNEW, [
    F("6", T("参照だけの役割のヘッダー", "Phần đầu trang vai trò chỉ xem"), ".es-pagehead__actions", "area", detail=T("経理（Ad00012・契約申請管理＝R）・閲覧のみ（Ad00013）には、CSV出力だけを出す。新規登録（代理入力）・CSV取込・変更申請の代理入力は出さない。一覧の申請IDから詳細（参照のみ・承認・却下なし）は開ける。", "Với kế toán (Ad00012, 契約申請管理 = R) và chỉ xem (Ad00013) chỉ hiện CSV出力. Không hiện 新規登録（代理入力）・CSV取込・変更申請の代理入力. Mở được chi tiết (chỉ xem, không duyệt・từ chối) từ ID đơn trong danh sách.")),
], login="Ad00012", wait=700, note=T("経理（Ad00012）で表示。", "Hiển thị với kế toán (Ad00012)."))
V012 = V("012", C1, T("CS（承認はできる・代理入力はできない）", "CS (duyệt được, không nhập thay được)"), "/ops/applications", TABNEW, [
    F("6", T("CS のヘッダー", "Phần đầu trang CS"), ".es-pagehead__actions", "area", detail=T("CS（Ad00002・契約申請管理＝R/U）は、承認・却下・受付の保存・仮登録・本登録・取り下げはできるが、新規登録（代理入力）・変更申請の代理入力・CSV取込（作成扱い）は出さない（台帳 F 運営A Q3＝A。CS に要るなら hong が例外を決める）。", "CS (Ad00002, 契約申請管理 = R/U) duyệt / từ chối / lưu tiếp nhận / đăng ký tạm / đăng ký chính thức / rút đơn được, nhưng không hiện 新規登録（代理入力）・変更申請の代理入力・CSV取込 (coi như tạo mới) (sổ F 運営A Q3=A. Nếu CS cần thì hong quyết định ngoại lệ).")),
], login="Ad00002", wait=700, note=T("CS（Ad00002）で表示。", "Hiển thị với CS (Ad00002)."))

RO0 = lambda no, label, ja, vi, detail, **kw: F(no, T(ja, vi), "-", "label", detail=detail, **kw)
# ====================================================================== AW_APPL_002 申請詳細（変更の承認）
C2 = "AW_APPL_002"
DTAB = lambda name: JS + "qa('[role=tab]').find(b=>b.textContent.trim().startsWith('%s')).click();await sleep(700);" % name
FILL25 = (JS + "qa('[role=tab]').find(b=>b.textContent.trim().startsWith('影響と設定')).click();await sleep(500);"
          "const ii=qa('input').find(x=>/例）A3/.test(x.placeholder));setv(ii,'A3／B5／C3');ii.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));await sleep(900);"
          "qa('[role=tab]').find(b=>b.textContent.trim().startsWith('拠点ごとの承認')).click();await sleep(500);")
RO = lambda no, label, ja, vi, detail, **kw: F(no, T(ja, vi), "label::%s^" % label, "label", detail=detail, **kw)

D_HEAD = [
    F("1", T("ヘッダー", "Phần đầu trang"), ".es-pagehead", "area", detail=T("パンくず（契約申請管理 / 申請詳細）・画面名と申請ID・ステータスの札・次のタブへ進むボタン。申請IDの形で画面が決まる：CH-… ＝この画面（変更の承認）、AP-… ＝受付（AW_INTK_001）。", "Breadcrumb (契約申請管理 / 申請詳細), tên màn hình + ID đơn + badge trạng thái, nút sang tab tiếp. Dạng ID đơn quyết định màn hình: CH-… = màn hình này (duyệt thay đổi), AP-… = tiếp nhận (AW_INTK_001).")),
    F("1.1", T("パンくず", "Breadcrumb"), ".es-breadcrumb a", "link", "click", detail=T("「契約申請管理」を押すと一覧へ戻る。戻る先のタブは、その申請の種類のタブ（契約変更／休止・解約）。", "Bấm 「契約申請管理」 để về danh sách. Tab quay về là tab theo loại đơn (thay đổi / tạm dừng・hủy).")),
    F("1.2", T("画面名・申請ID・ステータス", "Tên màn hình・ID đơn・trạng thái"), ".es-pagehead__title", "label", len="申請詳細 CH-yyyymmdd-nnnn ＋ ステータス", detail=T("ステータス＝全拠点の状態から決める：承認待ち（黄）／対応中 n/m（青）／承認済（緑）／一部承認（青）／却下（赤）／取り下げ済（灰）。", "Trạng thái được quyết định từ trạng thái các điểm: 承認待ち (vàng) / 対応中 n/m (xanh) / 承認済み (xanh lá) / 一部承認 (xanh) / 却下 (đỏ) / 取り下げ済み (xám).")),
    F("1.3", T("次のタブへ進むボタン", "Nút sang tab tiếp"), ".es-pagehead__actions button", "button", "click", detail=T("承認待ちのときだけ出す。必須の設定が残っていれば「影響と設定へ」、そろっていれば「拠点ごとの承認へ」（法人情報の変更は「法人単位の承認へ」）。処理済みの申請には出さない。", "Chỉ hiện khi đang 承認待ち. Còn thiết lập bắt buộc thì là 「影響と設定へ」, đã đủ thì là 「拠点ごとの承認へ」 (đổi thông tin pháp nhân là 「法人単位の承認へ」). Không hiện với đơn đã xử lý.")),
]
D_TABS = [
    F("2", T("申請内容のタブ", "Tab của đơn"), ".es-tabs", "area", pattern="P-TAB", detail=T("どの申請も同じ4つ：申請内容／変更される項目／影響と設定／拠点ごとの承認（法人情報の変更は「法人単位の承認」）。開くときは「申請内容」から。必須の設定が残っていれば「影響と設定（要入力）」に残り件数を出す。タブはアドレスに持つ（宿題 H2）。", "Luôn 4 tab: nội dung đơn / mục thay đổi / ảnh hưởng và thiết lập / duyệt theo điểm (đổi thông tin pháp nhân là 「法人単位の承認」). Khi mở bắt đầu từ 「申請内容」. Còn thiết lập bắt buộc thì 「影響と設定（要入力）」 hiện số còn lại. Tab được lưu ở địa chỉ (việc cần sửa H2)."),
      demo_ok=T("タブをアドレスに持つ（P-TAB）のは宿題 H2。仕様が正", "Việc giữ tab ở địa chỉ (P-TAB) là việc cần sửa H2. Theo đặc tả")),
    F("2.1", T("申請内容", "Nội dung đơn"), ".es-tab::申請内容", "tab", "click", detail=T("申請情報と、お客様の申請内容。", "Thông tin đơn và nội dung khách xin.")),
    F("2.2", T("変更される項目", "Mục thay đổi"), ".es-tab::変更される項目", "tab", "click", detail=T("法人画面の項目名で、変わる行だけ（変更前→変更後・いつから）。", "Chỉ các dòng thay đổi, theo tên mục của màn hình pháp nhân (trước → sau, từ khi nào).")),
    F("2.3", T("影響と設定", "Ảnh hưởng và thiết lập"), ".es-tab::影響と設定", "tab", "click", detail=T("承認すると動くもの・請求済みの月の差額・承認の前にする設定。", "Những gì chạy khi duyệt, chênh lệch tháng đã xuất hóa đơn, thiết lập cần làm trước khi duyệt.")),
    F("2.4", T("拠点ごとの承認", "Duyệt theo điểm"), ".es-tab::拠点ごとの承認", "tab", "click", detail=T("拠点ごとの承認・却下。件数＝まだ処理していない拠点の数。", "Duyệt / từ chối theo điểm. Số = số điểm chưa xử lý.")),
]
V013 = V("013", C2, T("申請内容（プランの変更 CH-20260925-0001）", "Nội dung đơn (đổi gói CH-20260925-0001)"), "/ops/applications/CH-20260925-0001", "", D_HEAD + D_TABS + [
    F("3", T("申請情報", "Thông tin đơn"), "h2::申請情報^", "area", detail=T("申請の基本情報（参照のみ）。", "Thông tin cơ bản của đơn (chỉ xem).")),
    RO("3.1", "申請の種類", "申請の種類", "Loại đơn", T("プランの変更／配送の変更／設備の変更／拠点情報の変更／法人情報の変更／休止／再開／解約。", "Đổi gói / đổi giao hàng / đổi thiết bị / đổi thông tin điểm / đổi thông tin pháp nhân / tạm dừng / tiếp tục / hủy.")),
    RO("3.2", "法人", "法人", "Pháp nhân", T("法人名と法人ID。", "Tên và ID pháp nhân.")),
    RO("3.3", "申請者", "申請者", "Người xin", T("申請した人の名前（法人アカウント／拠点アカウント）と受付経路。法人Webからの申請は「（法人Web）」、代理入力は入力した運営ユーザー（コードは「にっしぐち（運営）」固定・宿題 H8）。", "Tên người xin (tài khoản pháp nhân / tài khoản điểm) và kênh tiếp nhận. Đơn từ Web pháp nhân là 「（法人Web）」, nhập thay là người dùng vận hành đã nhập (code cố định 「にっしぐち（運営）」; việc cần sửa H8)."), demo_ok=H_SELF),
    RO("3.4", "申請日", "申請日", "Ngày xin", T("yyyy-mm-dd。", "yyyy-mm-dd."), len="日付 yyyy-mm-dd"),
    RO("3.5", "開始", "開始", "Bắt đầu", T("反映が始まるサイクル月（例「2026-11サイクル」）。法人情報の変更は「承認後すぐ（未発行の請求書から）」。", "Tháng chu kỳ bắt đầu phản ánh (ví dụ 「2026-11サイクル」). Đổi thông tin pháp nhân là 「承認後すぐ（未発行の請求書から）」.")),
    F("4", T("お客様の申請内容", "Nội dung khách xin"), "h2::お客様の申請内容^", "area", detail=T("法人Webの「ご希望の内容」と同じ項目（申請・承認 §6）を、申請の種類ごとに出す。以下はプランの変更の例。", "Hiện các mục giống 「ご希望の内容」 của Web pháp nhân (申請・承認 §6) theo từng loại đơn. Dưới đây là ví dụ đổi gói.")),
    RO("4.1", "対象の拠点", "対象の拠点", "Điểm đối tượng", T("申請の対象の拠点名（1申請＝1拠点。複数拠点を選んだ代理入力は、拠点ごとに別の申請ができる）。", "Tên điểm đối tượng (1 đơn = 1 điểm. Nhập thay chọn nhiều điểm thì tạo đơn riêng cho từng điểm).")),
    RO("4.2", "変更したいこと", "変更したいこと", "Điều muốn đổi", T("変更の種類の要約（例「プランの変更（増量・冷凍の追加）」）。", "Tóm tắt loại thay đổi (ví dụ 「プランの変更（増量・冷凍の追加）」).")),
    RO("4.3", "変更後のプラン", "変更後のプラン", "Gói sau khi đổi", T("プランID・プラン名とコース。", "ID và tên gói và khóa.")),
    RO("4.4", "開始したいサイクル月", "開始したいサイクル月", "Tháng chu kỳ muốn bắt đầu", T("お客様の希望のサイクル月。締切を過ぎていれば運営が承認のときに開始月の扱いを選ぶ（状態 020）。", "Tháng chu kỳ khách mong muốn. Nếu đã quá hạn thì vận hành chọn cách xử lý tháng bắt đầu khi duyệt (trạng thái 020).")),
    RO("4.5", "理由", "理由", "Lý do", T("お客様が書いた理由（最大500文字・複数行）。", "Lý do khách viết (tối đa 500 ký tự, nhiều dòng)."), len="文字列 500"),
], full=True, wait=900, note=T("プランの変更（大阪支店・承認待ち）。法人Web から出された申請。", "Đổi gói (chi nhánh Osaka, chờ duyệt). Đơn do Web pháp nhân gửi."))

V014 = V("014", C2, T("変更される項目（前 → 後・いつから・月額の影響）", "Mục thay đổi (trước → sau, từ khi nào, ảnh hưởng tiền hàng tháng)"), "/ops/applications/CH-20260925-0001", DTAB("変更される項目"), [
    F("5", T("変更される項目", "Mục thay đổi"), "h2::変更される項目^", "area", detail=T("法人画面の項目名で、変わる行だけを出す。複数拠点の申請は拠点ごとに分ける。承認時、申請の「変更前の値」と今の値が違えば承認を止める（E66・宿題 H7）。", "Chỉ hiện các dòng thay đổi theo tên mục của màn hình pháp nhân. Đơn nhiều điểm thì tách theo điểm. Khi duyệt, nếu 「giá trị trước」 của đơn khác giá trị hiện tại thì chặn duyệt (E66, việc cần sửa H7).")),
    F("5.1", T("法人画面を開く", "Mở màn hình pháp nhân"), "a::法人画面を開く", "link", "click", detail=T("法人詳細（AW_CORP_002）を開く。", "Mở chi tiết pháp nhân (AW_CORP_002).")),
    F("5.2", T("変更の表", "Bảng thay đổi"), ".apx-chg", "table", detail=T("列＝画面 ＞ 項目（リンク）・変更前・変更後・いつから。変更後は太字。月額が変わるときは最後に月額（税抜）の合計行。「画面 ＞ 項目」を押すと、その項目の画面（子契約・拠点・法人）を開く。", "Cột = màn hình > mục (liên kết), trước, sau, từ khi nào. Sau thay đổi in đậm. Khi tiền hàng tháng đổi thì có dòng tổng tiền hàng tháng (chưa thuế) ở cuối. Bấm 「màn hình > mục」 để mở màn hình đó (hợp đồng con, điểm, pháp nhân).")),
    F("5.3", T("画面 ＞ 項目", "Màn hình > mục"), ".apx-chg tbody tr:nth-child(1) td:nth-child(1)", "link", "click", detail=T("例「子契約 ＞ 契約」。下の小さな文字に項目名（例「プランID」）。", "Ví dụ 「子契約 ＞ 契約」. Chữ nhỏ bên dưới là tên mục (ví dụ 「プランID」).")),
    F("5.4", T("月額（税抜）の合計行", "Dòng tổng tiền hàng tháng (chưa thuế)"), ".apx-chg tr.tot", "label", detail=T("プランの変更のとき、変更前と変更後の月額（税抜）を出す。「27,500円 → 52,500円」。金額は「1,000円」の書き方・右寄せ。", "Khi đổi gói hiện tiền hàng tháng (chưa thuế) trước và sau. 「27,500円 → 52,500円」. Số tiền viết dạng 「1,000円」, căn phải.")),
], wait=800)

IMP_ITEMS = [
    F("6", T("拠点ごとの設定カード", "Thẻ thiết lập theo điểm"), ".card:has(.apx-imp)", "area", detail=T("拠点ごとに1枚。見出し＝拠点名・拠点ID／親契約番号。右に札：要入力（黄）／設定済み（緑）／設定なし（灰）。必須の設定がそろうと「設定済」。", "Mỗi điểm một thẻ. Tiêu đề = tên điểm・ID điểm / số hợp đồng cha. Bên phải là nhãn: 要入力 (vàng) / 設定済み (xanh lá) / 設定なし (xám). Đủ thiết lập bắt buộc là 「設定済」.")),
    F("6.1", T("承認すると動くもの（影響）", "Những gì chạy khi duyệt (ảnh hưởng)"), ".apx-imp", "table", detail=T("申請の種類ごとの共通の表（項目・内容・いつ）。プランの変更：子契約の書き換え（件数と月）・納品予定と注文（デフォルトの注文は作り直し、上限を超える登録済みの注文はデフォルトに戻して法人へ再注文のお願い）・設備の異動。オーダー期間中の承認は、登録済み・デフォルトの注文を新しい条件に自動で戻す（締切まで法人が入れ直せる）。", "Bảng chung theo loại đơn (mục, nội dung, khi nào). Đổi gói: ghi lại hợp đồng con (số lượng và tháng), lịch giao và order (order tự động được tạo lại, order đã đăng ký vượt giới hạn thì đưa về mặc định và nhờ pháp nhân order lại), di chuyển thiết bị. Duyệt trong thời gian order thì tự đưa order đã đăng ký・tự động về điều kiện mới (pháp nhân nhập lại được đến hạn chốt).")),
    F("6.2", T("請求済みの月にかかる差額", "Chênh lệch tháng đã xuất hóa đơn"), ".secttl::請求済みの月にかかる差額", "label", detail=T("請求済みの月に影響するとき、月ごとの 請求した額・変更後の額・差額（税抜）の表と合計の説明を出す。承認すると調整明細を自動で作り、次の請求書で精算する（日割りなし・サイクル月ごとの満額の差）。", "Khi ảnh hưởng tháng đã xuất hóa đơn, hiện bảng số tiền đã xuất, số tiền sau thay đổi, chênh lệch (chưa thuế) theo tháng và giải thích tổng. Khi duyệt tự tạo dòng điều chỉnh và quyết toán ở hóa đơn kế tiếp (không tính theo ngày; chênh lệch toàn bộ theo từng tháng chu kỳ).")),
    F("6.3", T("設備の異動の案", "Phương án di chuyển thiết bị"), ".secttl::設備の異動の案", "label", detail=T("今の貸出とプランの標準貸出設備を比べた案（入替＝大きいサイズへ・追加・回収）。「自動の案」の札。回収の配送はシステムでは作らない（回収したら貸出を「回収済」にする）。承認の前に運営が直せる。", "Phương án so sánh cho mượn hiện tại với thiết bị cho mượn tiêu chuẩn của gói (thay = sang kích thước lớn hơn, thêm, thu hồi). Nhãn 「自動の案」. Không tạo chuyến giao thu hồi trong hệ thống (khi thu hồi thì đặt cho mượn thành 「回収済」). Vận hành sửa được trước khi duyệt.")),
    F("6.4", T("異動の区分", "Loại di chuyển"), ".card:has(.apx-imp) select", "select", "select", req="－", len="選択（継続／入替／追加／回収）", init=T("案のとおり", "Theo phương án"), ex=["追加", "Loại di chuyển của dòng thiết bị"], detail=T("行ごとに 継続・入替・追加・回収 から選ぶ。入替・追加は異動後の機種を選ぶ。", "Chọn theo từng dòng trong 継続・入替・追加・回収. Thay / thêm thì chọn máy sau di chuyển.")),
    F("6.5", T("台数", "Số lượng"), ".card:has(.apx-imp) input[type=number]", "text", "input", req="○", len="整数 1〜99", init=T("案のとおり", "Theo phương án"), ex=["1", "Số lượng máy (số nguyên 1〜99)"], err=["E12"], valid=T("1〜99の整数（入力の共通基準：台数）。", "Số nguyên 1〜99 (chuẩn nhập chung: số máy)."), demo_ok=T("コードは台数の範囲チェックがない（宿題）。仕様が正", "Code không kiểm tra phạm vi số máy (việc cần sửa). Theo đặc tả")),
    F("6.6", T("費用の案", "Phương án chi phí"), ".secttl::費用の案", "label", detail=T("設備の異動から作る費用の案（税抜）。列＝請求（チェック）・費目・金額（税抜）・単発／月額・根拠。承認の前に金額・単発／月額を直せる。「行から費用の案を作り直す」で行の内容から作り直し、「案を保存」で保存する（保存するまで承認に反映しない）。", "Phương án chi phí (chưa thuế) tạo từ di chuyển thiết bị. Cột = tính phí (ô chọn), khoản mục, số tiền (chưa thuế), một lần / hàng tháng, căn cứ. Sửa được số tiền, một lần / hàng tháng trước khi duyệt. 「行から費用の案を作り直す」 tạo lại từ nội dung dòng, 「案を保存」 để lưu (chưa lưu thì chưa phản ánh vào duyệt)."),
      demo_ok=T("コードの「根拠」の列に決定番号（例「決定 28-16・28-53」）が出る（宿題 H12）。仕様は出さない", "Cột 「根拠」 trong code hiện số quyết định (ví dụ 「決定 28-16・28-53」) (việc cần sửa H12). Đặc tả không hiện")),
    F("6.7", T("金額（税抜）", "Số tiền (chưa thuế)"), ".card:has(.apx-imp) input[type=number][value]", "text", "input", req="○", len="金額 0〜999,999,999", init=T("案のとおり", "Theo phương án"), ex=["7,800", "Số tiền (chưa thuế, 0〜999,999,999)"], err=["E12"], valid=T("0〜999,999,999 の整数（入力の共通基準：金額）。", "Số nguyên 0〜999,999,999 (chuẩn nhập chung: số tiền)."), demo_ok=T("コードは金額の範囲チェックがない（宿題）。仕様が正", "Code không kiểm tra phạm vi số tiền (việc cần sửa). Theo đặc tả")),
    F("6.8", T("メモ（運営だけ）", "Ghi chú (chỉ vận hành)"), ".card:has(.apx-imp) textarea", "textarea", "input", req="－", len="文字列 500（複数行）", init=T("空", "Trống"), ex=["エレベーターなし3階のため入れ替えの配送 +3,000円", "Ghi chú nội bộ (tối đa 500 ký tự, nhiều dòng)"], err=["E04", "E13"], detail=T("運営だけが見るメモ（法人には出さない）。", "Ghi chú chỉ vận hành xem (không hiện cho pháp nhân)."), demo_ok=T("コードは最大文字数・絵文字のチェックがない（宿題）。仕様が正", "Code không kiểm tra số ký tự tối đa, emoji (việc cần sửa). Theo đặc tả")),
    F("6.9", T("案を保存", "Lưu phương án"), "button::案を保存", "button", "click", cond=T("案を変えたときだけ活性", "Chỉ khả dụng khi đã đổi phương án"), err=["S20"], detail=T("費用の案・設備の異動の案を保存する。保存できたら S20。", "Lưu phương án chi phí và di chuyển thiết bị. Lưu được thì S20.")),
    F("6.10", T("承認の前にする設定", "Thiết lập trước khi duyệt"), ".secttl::承認の前にする設定", "label", detail=T("承認の前にする設定。必須の欄がすべてそろうと「設定済」になり、承認できる。入れた値はすぐ保存する（処理済みの拠点は参照のみ）。申請の種類ごとに欄が違う（状態 024〜030）。選択肢（運送会社・倉庫・リードタイム・委託先）はマスタから出す（宿題 H11：コードは固定の一覧）。", "Thiết lập trước khi duyệt. Khi điền đủ các ô bắt buộc thì thành 「設定済」 và duyệt được. Giá trị đã nhập được lưu ngay (điểm đã xử lý chỉ xem). Ô khác nhau theo loại đơn (trạng thái 024〜030). Lựa chọn (hãng vận chuyển, kho, lead time, đơn vị ủy thác) lấy từ master (việc cần sửa H11: code dùng danh sách cố định)."), demo_ok=T("コードの選択肢は固定の一覧（倉庫2・運送会社7・リードタイム3・委託先4）。仕様はマスタ（宿題 H11）", "Lựa chọn trong code là danh sách cố định (kho 2, hãng vận chuyển 7, lead time 3, đơn vị ủy thác 4). Đặc tả dùng master (việc cần sửa H11)")),
    F("6.11", T("配送回数（新しいプランで）", "Số lần giao (theo gói mới)"), "label::配送回数（新しいプランで）^", "select", "select", req="－", len="選択（1回〜4回）", init=T("お客様の申請（プランの標準）", "Theo đơn của khách (tiêu chuẩn của gói)"), ex=["3回", "Số lần giao theo gói mới (1〜4 lần)"], detail=T("プランの標準を超えた分は、配送回数追加（A型オプション）で自動計上する。", "Phần vượt tiêu chuẩn của gói được tự động tính theo tùy chọn thêm lần giao (loại A).")),
    F("6.12", T("納品サイクルの枠", "Ô chu kỳ giao hàng"), "label::納品サイクルの枠^", "text", "input", req="○", len="文字列 60（例 A3／B5／C3）", init=T("空", "Trống"), ex=["A3／B5／C3", "Ô chu kỳ giao hàng, chọn đúng số lần giao (ví dụ A3／B5／C3)"], err=["E01"], valid=T("配送回数の分だけ入れる（「／」でつなぐ）。空のままだと承認できない（拠点ごとの承認で「影響と設定を入力」になる）。", "Nhập đúng số lần giao (nối bằng 「／」). Để trống thì không duyệt được (ở duyệt theo điểm là 「影響と設定を入力」)."), detail=T("お客様の配送のサイクル枠（A1〜D7）。", "Ô chu kỳ giao hàng của khách (A1〜D7).")),
    F("6.13", T("設備の入替（サイズアップ）", "Thay thiết bị (nâng kích thước)"), "label::設備の入替（サイズアップ）^", "select", "select", req="－", len="選択（不要／必要（設備の異動：機種変更））", init=T("不要", "Không cần"), ex=["必要（設備の異動：機種変更）", "Có cần thay thiết bị không"], detail=T("必要を選ぶと、設備の搬入予定日を入れる欄が有効になる。", "Chọn cần thì ô nhập ngày dự kiến đưa thiết bị vào được kích hoạt.")),
    F("6.14", T("設備の搬入予定日", "Ngày dự kiến đưa thiết bị vào"), "label::設備の搬入予定日（入替が必要なとき）^", "date", "input", req="条件付き", len="日付 yyyy-mm-dd", init=T("空", "Trống"), ex=["2026-10-28", "Ngày dự kiến đưa thiết bị vào (yyyy-mm-dd)"], err=["E08"], cond=T("設備の入替＝必要 のときだけ入れる（必須）", "Chỉ nhập khi thay thiết bị = cần (bắt buộc)"), demo_ok=T("コードは日付を文字で入力する。仕様は共通の日付部品。仕様が正", "Code nhập ngày bằng chữ. Đặc tả dùng thành phần ngày chung. Theo đặc tả")),
    F("6.15", T("委託配送先への見積依頼", "Yêu cầu báo giá cho đơn vị giao ủy thác"), "label::委託配送先への見積依頼（任意）^", "select", "select", req="－", len="選択（依頼しない／委託配送先マスタの会社）", init=T("依頼しない", "Không yêu cầu"), ex=["DE00001 栄成ロジ（関東・中部／月〜土）", "Đơn vị giao ủy thác để yêu cầu báo giá (lọc theo khu vực / thứ trong master)"], detail=T("対応できるか・金額を委託配送先ポータルで聞く（回答期限は2営業日）。必須ではなく、回答を待たずに承認できる。委託配送先マスタの対応エリア・曜日で絞った会社を選ぶ。", "Hỏi khả năng đáp ứng và số tiền qua cổng của đơn vị giao ủy thác (hạn trả lời 2 ngày làm việc). Không bắt buộc, duyệt được mà không chờ trả lời. Chọn công ty đã lọc theo khu vực・thứ trong master đơn vị giao ủy thác.")),
]
V015 = V("015", C2, T("影響と設定：プランの変更（影響・差額・設備の異動の案・承認前の設定）", "Ảnh hưởng và thiết lập: đổi gói (ảnh hưởng, chênh lệch, phương án thiết bị, thiết lập trước duyệt)"), "/ops/applications/CH-20260925-0001", DTAB("影響と設定"), IMP_ITEMS, full=True, wait=800,
         note=T("プランの変更（CH-20260925-0001）。ほかの種類の欄は 状態 024〜030。", "Đổi gói (CH-20260925-0001). Ô của các loại khác ở trạng thái 024〜030."))

BOARD_ITEMS = [
    F("7", T("拠点ごとの承認", "Duyệt theo điểm"), "#apxboard", "area", detail=T("拠点ごとに承認・却下する（1申請＝1拠点が基本。法人情報の変更は法人単位）。見出しの右に全体の状態の札。", "Duyệt / từ chối theo điểm (cơ bản 1 đơn = 1 điểm. Đổi thông tin pháp nhân là theo pháp nhân). Bên phải tiêu đề là nhãn trạng thái toàn bộ.")),
    F("7.1", T("オーダー締切の帯", "Dải hạn chốt order"), "#apxboard .es-inline", "label", detail=T("承認待ちのとき、締切までの日数を出す：「オーダー締切 {日付} まで あと {n}日（今日 {日付}）。締切を過ぎてから承認するときは、開始月の扱いを2択から選びます。」。3日以内は黄、過ぎていれば赤で「{日付} を {n}日 過ぎています」（状態 020）。", "Khi đang chờ duyệt, hiện số ngày đến hạn chốt: 「オーダー締切 {ngày} まで あと {n}日（今日 {ngày}）。締切を過ぎてから承認するときは、開始月の扱いを2択から選びます。」. Trong 3 ngày màu vàng, quá hạn màu đỏ 「{ngày} を {n}日 過ぎています」 (trạng thái 020)."),
      demo_ok=T("締切後の承認で選ぶ2択は、仕様（Message List）ではボタンの2択。コードはダイアログの中の選択（宿題）。画面の文は Message List「オーダー締切を過ぎています」に合わせる", "Hai lựa chọn khi duyệt sau hạn, theo đặc tả (Message List) là 2 nút. Code là lựa chọn trong hộp thoại (việc cần sửa). Câu trên màn hình khớp Message List 「オーダー締切を過ぎています」")),
    F("7.2", T("拠点の表", "Bảng điểm"), "#apxboard .es-table", "table", detail=T("列＝拠点（名前・ID）・変更の内容・月額への影響（税抜・右寄せ）・状態・操作。状態＝承認待ち（黄）／✓ 承認済（緑）／却下（赤。理由を下に出す）／取り下げ済（灰）。承認・却下した拠点はその場で確定する（「やり直す」はない・台帳 F #11）。", "Cột = điểm (tên・ID), nội dung thay đổi, ảnh hưởng tiền hàng tháng (chưa thuế, căn phải), trạng thái, thao tác. Trạng thái = 承認待ち (vàng) / ✓ 承認済み (xanh lá) / 却下 (đỏ, hiện lý do bên dưới) / 取り下げ済み (xám). Điểm đã duyệt / từ chối được xác định ngay (không có 「やり直す」; sổ F #11).")),
    F("7.3", T("却下", "Từ chối"), "#apxboard button::却下", "button", "click", cond=UPD, detail=T("却下の小窓を開く（状態 022）。処理済みの拠点には出さない。", "Mở cửa sổ từ chối (trạng thái 022). Không hiện với điểm đã xử lý.")),
    F("7.5", T("影響と設定を入力", "Nhập ảnh hưởng và thiết lập"), "#apxboard button::影響と設定を入力", "button", "click", detail=T("必須の設定が空の拠点は、承認ボタンの代わりにこのボタンを出し、押すと「影響と設定」のタブへ移る。", "Với điểm còn thiết lập bắt buộc trống, hiện nút này thay cho nút duyệt; bấm để sang tab 「影響と設定」.")),
]
BOARD_APPROVE = [
    F("7.4", T("この拠点を承認", "Duyệt điểm này"), "#apxboard button::この拠点を承認", "button", "click", cond=CAT(UPD, T("。必須の設定がそろっているときだけ有効（そろっていなければ「影響と設定を入力」を出す）", ". Chỉ khả dụng khi đã đủ thiết lập bắt buộc (nếu chưa đủ thì hiện 「影響と設定を入力」)")), detail=T("承認の確認ダイアログを開く（状態 018）。承認できない理由（承認待ちの別の申請・休止の通算超過・解約日がルール外など）があれば、ボタンを非活性にして理由を赤字で出す。法人情報の変更は「法人の変更を承認」。", "Mở hộp thoại xác nhận duyệt (trạng thái 018). Nếu có lý do không duyệt được (đơn khác đang chờ, vượt tổng tạm dừng, ngày hủy ngoài quy tắc...) thì làm nút không khả dụng và hiện lý do chữ đỏ. Đổi thông tin pháp nhân là 「法人の変更を承認」.")),
]
V016 = V("016", C2, T("拠点ごとの承認：要入力（承認できない・「影響と設定を入力」）", "Duyệt theo điểm: cần nhập (chưa duyệt được, 「影響と設定を入力」)"), "/ops/applications/CH-20260925-0001", DTAB("拠点ごとの承認"), BOARD_ITEMS, full=True, wait=800,
         note=T("必須の設定（納品サイクルの枠）が空のとき。", "Khi thiết lập bắt buộc (ô chu kỳ giao hàng) còn trống."))
V017 = V("017", C2, T("拠点ごとの承認：設定済み（承認できる）", "Duyệt theo điểm: đã thiết lập (duyệt được)"), "/ops/applications/CH-20260925-0001", FILL25, [
    F("7", T("この拠点を承認（有効）", "Duyệt điểm này (khả dụng)"), "#apxboard button::この拠点を承認", "button", "click", cond=UPD, detail=T("必須の設定がそろうと有効になる。タブ「影響と設定」の札は「設定済」に変わる。", "Khi đủ thiết lập bắt buộc thì khả dụng. Nhãn của tab 「影響と設定」 đổi thành 「設定済」.")),
] + BOARD_APPROVE, wait=800, note=T("「納品サイクルの枠」を入れたあと。", "Sau khi nhập 「納品サイクルの枠」."))
V018 = V("018", C2, T("承認ダイアログ（確認チェック）", "Hộp thoại duyệt (ô chọn xác nhận)"), "/ops/applications/CH-20260925-0001", FILL25 + "btn('この拠点を承認').click();await sleep(900);", [
    F("8", T("承認ダイアログ", "Hộp thoại duyệt"), ".es-dialog__panel", "modal", err=["S109"], detail=T("見出し＝「{拠点名} の {種類} を承認しますか？」（Message List は「このお申し込みを承認しますか？」・[msg]）。中身：変更の要約・影響の表・請求済みの月の差額・「承認前に変更前の値と今の値を比べる」の注記・承認の前にした設定の表・適用範囲・確認のチェック。ボタン＝[キャンセル][承認する]。承認できたら S109 のトースト（宛先の法人へお知らせメールを送る）。", "Tiêu đề = 「{tên điểm} の {loại} を承認しますか？」 (Message List là 「このお申し込みを承認しますか？」; [msg]). Nội dung: tóm tắt thay đổi, bảng ảnh hưởng, chênh lệch tháng đã xuất hóa đơn, chú thích 「so sánh giá trị trước và hiện tại trước khi duyệt」, bảng thiết lập đã làm trước khi duyệt, phạm vi áp dụng, ô chọn xác nhận. Nút = [キャンセル][承認する]. Duyệt được thì toast S109 (gửi email thông báo cho pháp nhân)."),
      demo_ok=T("コードの見出し・ボタン名は Message List と違う（「承認する」）。仕様は共通メッセージ（[msg]）", "Tiêu đề và tên nút trong code khác Message List (「承認する」). Đặc tả dùng thông báo chung ([msg])")),
    F("8.1", T("影響の表", "Bảng ảnh hưởng"), ".es-dialog__panel table", "table", detail=T("申請の種類ごとの影響（項目・内容・いつ）。移行割 DC000021 の対象なら、チェック「移行割を付ける」（既定 ON・運営が外せる）が出る。", "Ảnh hưởng theo loại đơn (mục, nội dung, khi nào). Nếu thuộc đối tượng giảm giá chuyển đổi DC000021 thì có ô chọn 「移行割を付ける」 (mặc định ON, vận hành bỏ được).")),
    F("8.2", T("承認前に値を比べる注記", "Chú thích so sánh giá trị trước khi duyệt"), ".es-dialog__panel .es-inline::変更前の値", "label", err=["E66"], detail=T("承認のとき、申請の「変更前の値」と今の値を比べ、違えば E66 で承認を止める（台帳 F・TL-1・宿題 H7）。", "Khi duyệt, so sánh 「giá trị trước」 của đơn với giá trị hiện tại, nếu khác thì chặn duyệt bằng E66 (sổ F・TL-1; việc cần sửa H7)."), demo_ok=T("コードは注記だけでなく、値が違うときの承認停止も実装済み。画像の見本は値が同じため止まらない", "Code đã cài cả chặn duyệt khi giá trị khác (không chỉ chú thích). Dữ liệu mẫu trong ảnh có giá trị giống nhau nên không bị chặn")),
    F("8.3", T("適用範囲", "Phạm vi áp dụng"), ".es-dialog__panel select", "select", "select", req="○", len="選択（この子契約以降すべて／この子契約だけ）", init=T("この子契約以降すべて", "Từ hợp đồng con này trở đi"), ex=["この子契約だけ（2026-11 のみ）", "Phạm vi áp dụng khi duyệt (giống lưu hợp đồng con)"], detail=T("プランの変更など子契約に当てる変更は、保存と同じ適用範囲を選ぶ。選んだ範囲は変更履歴に残す。", "Thay đổi áp dụng vào hợp đồng con như đổi gói chọn phạm vi áp dụng giống khi lưu. Phạm vi đã chọn được lưu trong lịch sử thay đổi.")),
    F("8.4", T("オーダーを戻したことを法人へ知らせる", "Thông báo cho pháp nhân việc đã đưa order về điều kiện mới"), ".es-dialog__panel label::オーダーを戻したことを法人へ知らせる", "check", "check", req="－", len="ON／OFF", init="ON", ex=["ON", "Thông báo cho pháp nhân việc đã đưa order về điều kiện mới"], detail=T("オーダー期間中に承認して登録済み・デフォルトの注文を新しい条件に戻したときのチェック。ON のとき法人への承認のお知らせ（M5）に「戻したこと・締切まで入れ直せること」の一文を足す（台帳 F 運営A Q8）。", "Ô chọn khi duyệt trong thời gian order và đã đưa order đã đăng ký・tự động về điều kiện mới. Khi ON thì thêm vào thông báo duyệt gửi pháp nhân (M5) một câu 「đã đưa về・nhập lại được đến hạn chốt」 (sổ F 運営A Q8)."),
      demo_ok=T("コードの承認ダイアログにこのチェックがない（お知らせは任意で送ると書かれているだけ・宿題）。仕様が正", "Hộp thoại duyệt trong code chưa có ô chọn này (chỉ ghi là gửi thông báo tùy chọn; việc cần sửa). Theo đặc tả")),
    F("8.5", T("お知らせの宛先と文面の確認", "Xác nhận người nhận và nội dung thông báo"), ".es-dialog__panel .secttl::お知らせ", "label", detail=T("承認ダイアログで、送る法人へのお知らせの宛先と文面を確認できる（申請・承認 §7-2・宿題 H13）。コードは「影響と設定」の折りたたみに文面の見本を置く。", "Trong hộp thoại duyệt xác nhận được người nhận và nội dung thông báo gửi pháp nhân (申請・承認 §7-2; việc cần sửa H13). Code đặt mẫu nội dung trong phần thu gọn của 「影響と設定」."), demo_ok=T("コードのダイアログには宛先・文面の確認の欄がない（宿題 H13）。仕様が正", "Hộp thoại trong code chưa có phần xác nhận người nhận・nội dung (việc cần sửa H13). Theo đặc tả")),
    F("8.6", T("確認のチェック", "Ô chọn xác nhận"), ".es-dialog__panel label.es-check", "check", "check", req="○", len="ON／OFF", init="OFF", ex=["ON", "Ô xác nhận đã kiểm tra mục thay đổi・ảnh hưởng・thiết lập"], err=["E02"], valid=T("ON にしないと「承認する」を押せない（押すと入力エラー）。", "Không bật ON thì bấm 「承認する」 sẽ bị lỗi nhập."), detail=T("「変更される項目・影響・設定を確認しました」。", "「変更される項目・影響・設定を確認しました」.")),
    F("8.7", T("キャンセル", "Hủy"), ".es-dialog__panel button::キャンセル", "button", "click", detail=T("ダイアログを閉じる（保存した設定はそのまま）。", "Đóng hộp thoại (thiết lập đã lưu vẫn giữ).")),
    F("8.8", T("承認する", "Duyệt"), ".es-dialog__panel button::承認する", "button", "click", err=["S109"], detail=T("チェックが入っていれば承認する。承認した拠点は「✓ 承認済」になり、法人へお知らせメールを送る。", "Nếu đã chọn xác nhận thì duyệt. Điểm đã duyệt thành 「✓ 承認済」 và gửi email thông báo cho pháp nhân.")),
], wait=900, note=T("設定を入れたあと「この拠点を承認」を押した直後。", "Ngay sau khi nhập thiết lập và bấm 「この拠点を承認」."))
V019 = V("019", C2, T("承認ダイアログのエラー（確認チェックが未）", "Lỗi hộp thoại duyệt (chưa chọn xác nhận)"), "/ops/applications/CH-20260925-0001", FILL25 + "btn('この拠点を承認').click();await sleep(800);btn('承認する').click();await sleep(500);", [
    F("8", T("エラーの文言", "Câu lỗi"), "#apxErr", "label", "show", err=["E67"], detail=T("確認のチェックが未のまま「承認する」を押したとき、ダイアログの下に赤字で出す（「確認にチェックを入れてください。」）。必須の文字欄が空のときは、その欄を赤枠にして欄の下に E01 を出し、最初のエラーの所までスクロールする。", "Khi bấm 「承認する」 mà chưa chọn ô xác nhận, hiện chữ đỏ dưới hộp thoại (「確認にチェックを入れてください。」). Nếu ô chữ bắt buộc trống thì viền đỏ ô đó, hiện E01 dưới ô và cuộn tới lỗi đầu tiên.")),
], wait=700)
V020 = V("020", C2, T("承認ダイアログ：オーダー締切後（開始月の扱い 2択）", "Hộp thoại duyệt: sau hạn chốt order (2 lựa chọn xử lý tháng bắt đầu)"), "/ops/applications/CH-20260925-0001", FILL25 + "btn('この拠点を承認').click();await sleep(900);", [
    F("8", T("締切を過ぎています（帯）", "Đã quá hạn chốt (dải)"), "#apxboard .es-inline, .es-dialog__panel .es-inline", "label", err=["E68"], detail=T("オーダー締切を過ぎてから承認するとき、拠点ごとの承認の帯を赤にして「オーダー締切 {日付} を {n}日 過ぎています」を出す。", "Khi duyệt sau hạn chốt order, dải duyệt theo điểm màu đỏ và hiện 「オーダー締切 {ngày} を {n}日 過ぎています」.")),
    F("8.1", T("開始月の扱い", "Cách xử lý tháng bắt đầu"), ".es-dialog__panel label::開始月の扱い（承認のときに選ぶ）^", "select", "select", req="○", len="選択（開始月を翌サイクルへ繰り下げる／運営が代理でオーダーする（今月分））", init=T("開始月を翌サイクルへ繰り下げる", "Dời tháng bắt đầu sang chu kỳ sau"), ex=["運営が代理でオーダーする（今月分）", "Cách xử lý tháng bắt đầu khi quá hạn chốt order"], detail=T("繰り下げる＝開始サイクル月を1つ後ろに直し、法人へのお知らせに書く。代理でオーダーする＝今月分は運営が代わりにオーダーを入れ、開始月は変えない。選んだ内容は法人へのお知らせにも書く。Message List はこの2択をボタン「翌サイクルへ繰り下げ」「運営が代理オーダー」で出す（宿題）。", "Dời = chỉnh tháng chu kỳ bắt đầu lùi 1 tháng và ghi vào thông báo gửi pháp nhân. Order thay = vận hành order thay phần tháng này, không đổi tháng bắt đầu. Nội dung đã chọn cũng ghi vào thông báo cho pháp nhân. Message List hiện 2 lựa chọn này bằng nút 「翌サイクルへ繰り下げ」「運営が代理オーダー」 (việc cần sửa)."),
      demo_ok=T("コードはダイアログ内のドロップダウン。仕様（Message List）は2つのボタン", "Code là dropdown trong hộp thoại. Đặc tả (Message List) là 2 nút")),
], today="2026/10/16", wait=900, note=T("デモの日付を 2026-10-16 にして撮影（締切 2026-10-15 を過ぎる）。", "Chụp với ngày demo 2026-10-16 (quá hạn chốt 2026-10-15)."))
V021 = V("021", C2, T("承認済（✓・参照のみ・「やり直す」なし）", "Đã duyệt (✓, chỉ xem, không có 「やり直す」)"), "/ops/applications/CH-20260927-0002", DTAB("拠点ごとの承認"), [
    F("7", T("承認済みの拠点", "Điểm đã duyệt"), "#apxboard .es-badge::承認済み", "label", detail=T("承認した拠点は「✓ 承認済」（緑）。操作の欄には承認した人・日時を出す。承認済みの申請は参照のみで、「やり直す」ボタンは置かない（台帳 F #11）。", "Điểm đã duyệt hiện 「✓ 承認済」 (xanh lá). Cột thao tác hiện người duyệt・ngày giờ. Đơn đã duyệt chỉ xem, không đặt nút 「やり直す」 (sổ F #11)."), demo_ok=T("見本の承認済みは承認した人・日時の記録がなく、操作欄は空", "Đơn đã duyệt của dữ liệu mẫu không có ghi chép người duyệt・ngày giờ nên cột thao tác trống")),
    F("7.1", T("全拠点処理済みの帯", "Dải đã xử lý toàn bộ điểm"), "#apxboard .es-inline", "label", detail=T("すべての拠点を処理すると「すべての拠点を処理しました（{状態}）。承認した拠点へ反映のお知らせ、却下した拠点へ理由つきのお知らせを送りました。」を出す。", "Khi đã xử lý toàn bộ điểm hiện 「すべての拠点を処理しました（{trạng thái}）。承認した拠点へ反映のお知らせ、却下した拠点へ理由つきのお知らせを送りました。」."), demo_ok=T("見本の承認済み（CH-20260927-0002）は取込データのため、この帯が出ない場合がある", "Đơn đã duyệt của dữ liệu mẫu (CH-20260927-0002) là dữ liệu nhập nên có thể không hiện dải này")),
], full=True, wait=800, note=T("解約（カフェ花 横浜店・承認済）。", "Hủy (chi nhánh Yokohama của カフェ花, đã duyệt)."))
V022 = V("022", C2, T("却下の小窓（理由は必須）", "Cửa sổ từ chối (lý do bắt buộc)"), "/ops/applications/CH-20260929-0001", DTAB("法人単位の承認") + "btn('却下').click();await sleep(800);", [
    F("9", T("却下の小窓", "Cửa sổ từ chối"), ".es-modal__panel", "modal", err=["S31"], detail=T("見出し＝「{拠点名} の申請を却下しますか？」。法人へ、この拠点の却下のお知らせを理由つきで送る。ボタン＝[キャンセル][却下する]。却下できたら S31 のトースト。法人情報の変更は法人単位。", "Tiêu đề = 「{tên điểm} の申請を却下しますか？」. Gửi thông báo từ chối của điểm này kèm lý do cho pháp nhân. Nút = [キャンセル][却下する]. Từ chối được thì toast S31. Đổi thông tin pháp nhân là theo pháp nhân.")),
    F("9.1", T("却下の理由", "Lý do từ chối"), ".es-modal__panel select", "select", "select", req="○", len="選択（定型7つ）", init=T("未選択（選択してください）", "Chưa chọn (hãy chọn)"), ex=["設置条件を満たさない", "Lý do từ chối (chọn trong 7 lý do định sẵn)"], err=["E02"], detail=T("定型7つ：申請内容に不備がある／設置条件を満たさない／オーダー締切に間に合わない／設備・在庫の手配ができない／配送エリア・配送ルートの都合で対応できない／契約条件（最低利用期間など）に合わない／その他（下に詳しく書く）。「設置条件を満たさない」は冷蔵庫→自販機の却下用（台帳 B・受付簿 #27）。", "7 lý do định sẵn: đơn có thiếu sót / không đạt điều kiện lắp đặt / không kịp hạn chốt order / không thể chuẩn bị thiết bị・tồn kho / không đáp ứng được do khu vực・tuyến giao hàng / không phù hợp điều kiện hợp đồng (thời gian sử dụng tối thiểu...) / khác (ghi chi tiết bên dưới). 「設置条件を満たさない」 dùng để từ chối đổi tủ lạnh → máy bán hàng (sổ B, sổ tiếp nhận #27)."),
      open=T("却下の定型7つの文言（決定ファイルに一覧がない）", "Câu chữ của 7 lý do từ chối định sẵn (không có danh sách trong file quyết định)"), ask="お客様（運用）"),
    F("9.2", T("お客様へのひとこと", "Lời nhắn cho khách"), ".es-modal__panel textarea", "textarea", "input", req="－", len="文字列 500（複数行）", init=T("空", "Trống"), ex=["設置場所の寸法を確認のうえ、あらためてお申し込みください。", "Lời nhắn gửi khách (tối đa 500 ký tự, nhiều dòng)"], err=["E04", "E13"], detail=T("法人へのお知らせに添える任意の一文。「その他」を選んだときは詳しい理由をここに書く。", "Một câu tùy chọn kèm theo thông báo gửi pháp nhân. Khi chọn 「その他」 thì ghi lý do chi tiết ở đây."), demo_ok=T("コードは最大文字数・絵文字のチェックがない（宿題）。仕様が正", "Code không kiểm tra số ký tự tối đa, emoji (việc cần sửa). Theo đặc tả")),
    F("9.3", T("却下する", "Từ chối"), ".es-modal__panel button::却下する", "button", "click", detail=T("理由を選んでいれば却下する。却下した拠点は「却下」（赤）になり、理由を状態の下に出す。", "Nếu đã chọn lý do thì từ chối. Điểm bị từ chối thành 「却下」 (đỏ), lý do hiện dưới trạng thái.")),
], wait=800)
V023 = V("023", C2, T("却下の理由が未選択（エラー）", "Chưa chọn lý do từ chối (lỗi)"), "/ops/applications/CH-20260929-0001", DTAB("法人単位の承認") + "btn('却下').click();await sleep(800);btn('却下する').click();await sleep(500);", [
    F("9", T("理由未選択のエラー", "Lỗi chưa chọn lý do"), ".es-modal__panel .es-field__msg--error", "label", "show", err=["E02"], detail=T("理由を選ばずに「却下する」を押すと、理由の欄を赤枠にして欄の下に E02 を出す（コードの文言は「却下の理由を選んでください。」。Message List は「却下の理由をご入力ください。」）。", "Bấm 「却下する」 mà chưa chọn lý do thì viền đỏ ô lý do và hiện E02 dưới ô (câu trong code là 「却下の理由を選んでください。」; Message List là 「却下の理由をご入力ください。」)."), demo_ok=H_MSG),
], wait=700)

def kind_view(vid, state, no, tab_items, note, tabs=("申請内容", "影響と設定"), **kw):
    return V(vid, C2, state, "/ops/applications/" + no, kw.pop("setup", ""), tab_items, full=True, wait=800, note=note, **kw)

V024 = kind_view("024", T("配送の変更（納品不可曜日・CH-20260922-0001）", "Đổi giao hàng (ngày không giao được・CH-20260922-0001)"), "CH-20260922-0001", [
    RO0("3", "変更したいこと", "変更したいこと", "Điều muốn đổi", T("配送方法（ES配送便／COOL便）・お届け回数・納品不可曜日のうち、どれを変えるか。納品不可曜日の変更は「配送の変更」でなく「拠点情報の変更」の入口が正（台帳 F）。", "Đổi cái nào trong phương thức giao (ES配送便／COOL便), số lần giao, ngày không giao được. Việc đổi ngày không giao được lối vào đúng là 「拠点情報の変更」 chứ không phải 「配送の変更」 (sổ F)."), demo_ok=T("見本の申請 CH-20260922-0001 は納品不可曜日の変更（配送の変更）。仕様は納品不可曜日と設備の希望日の入口を「拠点情報の変更」だけにする（代理入力は対応済み）", "Đơn mẫu CH-20260922-0001 là đổi ngày không giao được (đổi giao hàng). Đặc tả để lối vào ngày không giao được và ngày mong muốn lắp đặt chỉ là 「拠点情報の変更」 (nhập thay đã đáp ứng)")),
    RO0("3.1", "ご要望", "ご要望", "Yêu cầu", T("お客様が書いた自由記述（最大500文字）。", "Văn bản tự do khách viết (tối đa 500 ký tự)."), len="文字列 500"),
    F("4", T("配送ルートを確認した", "Đã kiểm tra tuyến giao hàng"), "label::配送ルート（倉庫・運送会社・納品会社）を確認した必須^", "check", "check", req="○", len="ON／OFF", init="OFF", ex=["ON", "Ô xác nhận đã kiểm tra tuyến giao hàng (kho, hãng vận chuyển, công ty giao)"], err=["E01"], detail=T("承認の前にする設定（必須）。倉庫・運送会社・納品会社が新しい曜日で成り立つか確認する。", "Thiết lập trước khi duyệt (bắt buộc). Kiểm tra kho, hãng vận chuyển, công ty giao có hợp lý với thứ mới không.")),
    F("4.1", T("変更後の最初の納品日", "Ngày giao đầu tiên sau thay đổi"), "label::変更後の最初の納品日^", "date", "input", req="○", len="日付 yyyy-mm-dd", init=T("空", "Trống"), ex=["2026-11-09", "Ngày giao đầu tiên sau thay đổi (yyyy-mm-dd)"], err=["E01"], detail=T("この日以降の配送データを新しい条件で作り直す。", "Tạo lại dữ liệu giao hàng từ ngày này theo điều kiện mới."), demo_ok=T("コードは日付を文字で入力する。仕様は共通の日付部品。仕様が正", "Code nhập ngày bằng chữ. Đặc tả dùng thành phần ngày chung. Theo đặc tả")),
], T("配送の変更（川崎工場・承認待ち）。画像は「影響と設定」のタブ。", "Đổi giao hàng (nhà máy Kawasaki, chờ duyệt). Ảnh là tab 「影響と設定」."), setup=DTAB("影響と設定"))
V025 = kind_view("025", T("設備の変更（サイズ変更・電子レンジ追加・CH-20260923-0001）", "Đổi thiết bị (đổi kích thước・thêm lò vi sóng・CH-20260923-0001)"), "CH-20260923-0001", [
    RO0("3", "設置・回収の配送", "設置・回収の配送", "Giao lắp đặt・thu hồi", T("設置・回収の配送を希望するか（希望するときは金額を運営が入れる）。", "Có muốn giao lắp đặt・thu hồi không (nếu muốn thì vận hành nhập số tiền).")),
    F("4", T("設備の送付（搬入）予定日", "Ngày dự kiến gửi (đưa vào) thiết bị"), "label::設備の送付（搬入）予定日^", "date", "input", req="○", len="日付 yyyy-mm-dd", init=T("空", "Trống"), ex=["2026-10-28", "Ngày dự kiến đưa thiết bị vào (yyyy-mm-dd)"], err=["E01"], detail=T("設備手配のリードタイムは1週間程度。", "Lead time chuẩn bị thiết bị khoảng 1 tuần."), demo_ok=T("コードは日付を文字で入力する。仕様は共通の日付部品。仕様が正", "Code nhập ngày bằng chữ. Đặc tả dùng thành phần ngày chung. Theo đặc tả")),
    F("4.1", T("設備を運ぶ運送会社", "Hãng vận chuyển thiết bị"), "label::設備を運ぶ運送会社^", "select", "select", req="－", len="選択（運送会社・委託配送先）", init=T("ヤマト運輸", "Yamato Transport"), ex=["ヤマト運輸", "Hãng vận chuyển thiết bị (Yamato Transport)"], demo_ok=T("選択肢はマスタから出す（宿題 H11）。コードは固定の一覧", "Lựa chọn lấy từ master (việc cần sửa H11). Code dùng danh sách cố định")),
    F("4.2", T("回収（引揚）予定日", "Ngày dự kiến thu hồi"), "label::回収（引揚）予定日（回収があるとき）^", "date", "input", req="条件付き", len="日付 yyyy-mm-dd", init=T("空", "Trống"), ex=["2026-11-02", "Ngày dự kiến thu hồi (yyyy-mm-dd)"], cond=T("設備の異動に「回収」の行があるときだけ入れる", "Chỉ nhập khi di chuyển thiết bị có dòng 「回収」"), demo_ok=T("コードは日付を文字で入力する。仕様は共通の日付部品。仕様が正", "Code nhập ngày bằng chữ. Đặc tả dùng thành phần ngày chung. Theo đặc tả")),
    F("4.3", T("設置代行", "Lắp đặt hộ"), "label::設置代行^", "select", "select", req="－", len="選択（なし／あり（OP000007 設置代行））", init=T("なし", "Không"), ex=["あり（OP000007 設置代行）", "Có dùng dịch vụ lắp đặt hộ không"]),
], T("設備の変更（ことぶき商会 本店・承認待ち）。画像は「影響と設定」のタブ。設備の異動の案・費用の案は状態 015 と同じ。", "Đổi thiết bị (chi nhánh chính ことぶき商会, chờ duyệt). Ảnh là tab 「影響と設定」. Phương án di chuyển thiết bị・chi phí giống trạng thái 015."), setup=DTAB("影響と設定"))
V026 = kind_view("026", T("拠点情報の変更（住所・電話・請求先・CH-20260924-0001）", "Đổi thông tin điểm (địa chỉ・điện thoại・nơi nhận hóa đơn・CH-20260924-0001)"), "CH-20260924-0001", [
    F("3", T("ピッキング倉庫（新しい住所で見直し）", "Kho picking (xem lại theo địa chỉ mới)"), "label::ピッキング倉庫（新しい住所で見直し）^", "select", "select", req="－", len="選択（倉庫マスタ）", init=T("今の倉庫", "Kho hiện tại"), ex=["WH00001 関東倉庫", "Kho picking (master kho)"], demo_ok=T("選択肢はマスタから出す（宿題 H11）。コードは固定の一覧（倉庫2）", "Lựa chọn lấy từ master (việc cần sửa H11). Code dùng danh sách cố định (2 kho)")),
    F("3.1", T("運送会社・納品会社・リードタイム", "Hãng vận chuyển・công ty giao・lead time"), "label::運送会社^", "select", "select", req="－", len="選択（運送会社／納品会社／1日〜3日）", init=T("今の設定", "Thiết lập hiện tại"), ex=["ヤマト運輸", "Hãng vận chuyển / công ty giao / lead time"], detail=T("住所が変わると配送ルートも見直す。運送会社・納品会社・リードタイムの3つの選択欄。", "Khi địa chỉ đổi thì xem lại cả tuyến giao hàng. Ba ô chọn: hãng vận chuyển, công ty giao, lead time.")),
    F("3.2", T("新しい住所で配送する最初の納品日", "Ngày giao đầu tiên theo địa chỉ mới"), "label::新しい住所で配送する最初の納品日^", "date", "input", req="○", len="日付 yyyy-mm-dd", init=T("空", "Trống"), ex=["2026-11-09", "Ngày giao đầu tiên theo địa chỉ mới (yyyy-mm-dd)"], err=["E01"], detail=T("この日以降の配送データを、新しい住所・配送ルートで作り直す。", "Tạo lại dữ liệu giao hàng từ ngày này theo địa chỉ・tuyến giao mới."), demo_ok=T("コードは日付を文字で入力する。仕様は共通の日付部品。仕様が正", "Code nhập ngày bằng chữ. Đặc tả dùng thành phần ngày chung. Theo đặc tả")),
    F("3.3", T("搬入経路の資料を確認した", "Đã kiểm tra tài liệu đường đưa hàng vào"), "label::搬入経路の資料を新しい住所で確認した必須^", "check", "check", req="○", len="ON／OFF", init="OFF", ex=["ON", "Ô xác nhận đã kiểm tra tài liệu đường đưa hàng vào"], err=["E01"], detail=T("承認の前にする設定（必須）。", "Thiết lập trước khi duyệt (bắt buộc).")),
    F("3.4", T("請求の宛先を確認した", "Đã kiểm tra nơi nhận hóa đơn"), "label::請求の宛先（請求書の枚数・Bill One の発行先）を確認した必須^", "check", "check", req="○", len="ON／OFF", init="OFF", ex=["ON", "Ô xác nhận đã kiểm tra số hóa đơn và nơi phát hành Bill One"], err=["E01"], detail=T("請求書の宛先を変えるとき必須（請求書の枚数・Bill One の発行先を確認）。", "Bắt buộc khi đổi nơi nhận hóa đơn (kiểm tra số hóa đơn và nơi phát hành Bill One).")),
], T("拠点情報の変更（ことぶき商会 横浜倉庫・承認待ち）。画像は「影響と設定」のタブ。承認で拠点の住所・電話・請求先を新しい内容にする。", "Đổi thông tin điểm (kho Yokohama của ことぶき商会, chờ duyệt). Ảnh là tab 「影響と設定」. Duyệt thì đổi địa chỉ, điện thoại, nơi nhận hóa đơn của điểm sang nội dung mới."), setup=DTAB("影響と設定"))
V027 = kind_view("027", T("法人情報の変更（法人単位・CH-20260929-0001）", "Đổi thông tin pháp nhân (theo pháp nhân・CH-20260929-0001)"), "CH-20260929-0001", [
    F("3", T("法人単位の承認", "Duyệt theo pháp nhân"), ".card:has(.apx-imp)", "area", detail=T("法人情報（請求書に載る住所・電話番号・FAX番号）の変更は法人1件として承認・却下する（拠点ごとではない）。承認すると法人全体に反映し、未発行の請求書から新しい内容になる（発行済みの請求書はそのまま）。法人へお知らせメールを1通送る。", "Thay đổi thông tin pháp nhân (địa chỉ, số điện thoại, FAX ghi trên hóa đơn) được duyệt / từ chối như 1 pháp nhân (không theo điểm). Duyệt thì phản ánh cho toàn pháp nhân, từ hóa đơn chưa phát hành sẽ theo nội dung mới (hóa đơn đã phát hành giữ nguyên). Gửi 1 email thông báo cho pháp nhân.")),
    F("3.1", T("請求書の宛先の手配", "Chuẩn bị nơi nhận hóa đơn"), "label::請求書の宛先（Bill One の発行先）を新しい内容に直す手配をした必須^", "check", "check", req="○", len="ON／OFF", init="OFF", ex=["ON", "Ô xác nhận đã chuẩn bị đổi nơi nhận hóa đơn (nơi phát hành Bill One)"], err=["E01"], detail=T("承認の前にする設定（必須）。", "Thiết lập trước khi duyệt (bắt buộc).")),
    F("3.2", T("法人単位の承認の表", "Bảng duyệt theo pháp nhân"), "-", "area", detail=T("拠点の代わりに「法人」の行が1つ。ボタンは「法人の変更を承認」「却下」。", "Thay cho điểm là 1 dòng 「法人」. Nút 「法人の変更を承認」「却下」.")),
], T("法人情報の変更（サンプル・承認待ち）。画像は「影響と設定」のタブ。", "Đổi thông tin pháp nhân (サンプル, chờ duyệt). Ảnh là tab 「影響と設定」."), setup=DTAB("影響と設定"))
V028 = kind_view("028", T("休止（通算・再開予定月・CH-20260926-0001）", "Tạm dừng (tổng thời gian・tháng tiếp tục dự kiến・CH-20260926-0001)"), "CH-20260926-0001", [
    F("3", T("休止の通算", "Tổng thời gian tạm dừng"), ".secttl::休止の通算", "area", detail=T("休止は通算1年（12ヶ月）が上限。過去の休止の履歴（月数）と、今回を足した通算・残り月数を出す。再開予定月は必須で「決まっていない」は選べない。上限を超える申請は承認を止める（状態 033）。取消した休止（休止予定の取消）は通算に入れない。", "Tạm dừng tối đa tổng 1 năm (12 tháng). Hiện lịch sử tạm dừng trước đó (số tháng) và tổng đã cộng lần này, số tháng còn lại. Tháng tiếp tục dự kiến bắt buộc, không chọn được 「決まっていない」. Đơn vượt giới hạn thì chặn duyệt (trạng thái 033). Tạm dừng đã hủy (hủy bỏ tạm dừng dự kiến) không tính vào tổng.")),
    F("3.1", T("休止中の設備", "Thiết bị trong thời gian tạm dừng"), "label::休止中の設備^", "select", "select", req="－", len="選択（置いたまま（保管料なし）／引き揚げる）", init=T("置いたまま（保管料なし）", "Để nguyên (không phí lưu kho)"), ex=["引き揚げる", "Thiết bị trong thời gian tạm dừng: để nguyên / thu hồi"], detail=T("初期値＝お客様の申請（休止の設備）。お客様が「引き揚げる」と申請しても、コードの初期値は「置いたまま」（宿題 H11）。引き揚げるときは引揚予定日を入れる。", "Giá trị ban đầu = đơn của khách (thiết bị khi tạm dừng). Dù khách xin 「引き揚げる」, giá trị ban đầu trong code vẫn là 「置いたまま」 (việc cần sửa H11). Nếu thu hồi thì nhập ngày dự kiến thu hồi."), open=T("休止の設備：申請が「引き揚げる」のとき、初期値を申請に合わせるか（仕様に明記なし）", "Thiết bị khi tạm dừng: nếu đơn là 「引き揚げる」 thì giá trị ban đầu có khớp với đơn không (đặc tả không ghi rõ)"), ask="お客様（運用）"),
    F("3.2", T("設備の引揚予定日", "Ngày dự kiến thu hồi thiết bị"), "label::設備の引揚予定日（引き揚げるとき）^", "date", "input", req="条件付き", len="日付 yyyy-mm-dd", init=T("空", "Trống"), ex=["2026-11-30", "Ngày dự kiến thu hồi thiết bị (yyyy-mm-dd)"], cond=T("休止中の設備＝引き揚げる のときだけ必須", "Chỉ bắt buộc khi thiết bị trong thời gian tạm dừng = 引き揚げる"), demo_ok=T("コードは日付を文字で入力する。仕様は共通の日付部品。仕様が正", "Code nhập ngày bằng chữ. Đặc tả dùng thành phần ngày chung. Theo đặc tả")),
    F("3.3", T("休止期間の配送データの取消の確認", "Xác nhận hủy dữ liệu giao hàng trong thời gian tạm dừng"), "label::休止期間の配送データ（作成済み）を取り消すことを確認した必須^", "check", "check", req="○", len="ON／OFF", init="OFF", ex=["ON", "Ô xác nhận sẽ hủy dữ liệu giao hàng đã tạo trong thời gian tạm dừng"], err=["E01"], detail=T("休止のサイクルの配送予定・配送データ・注文を取り消す（締切を過ぎたサイクルは届ける）。未確定の先行子契約は「取消」として残す（台帳 F 2026-10-06 (4)）。", "Hủy lịch giao, dữ liệu giao, order của các chu kỳ tạm dừng (chu kỳ đã quá hạn chốt thì vẫn giao). Hợp đồng con tiến hành trước chưa chốt giữ lại ở trạng thái 「取消」 (sổ F 2026-10-06 (4)).")),
    F("3.4", T("棚卸報告", "Báo cáo kiểm kê"), "label::棚卸報告（任意）^", "select", "select", req="－", len="選択（報告を待つ（報告があれば精算）／スキップする（報告なしで進める））", init=T("報告を待つ（報告があれば精算）", "Chờ báo cáo (có báo cáo thì quyết toán)"), ex=["スキップする（報告なしで進める）", "Chờ báo cáo kiểm kê hay bỏ qua"], detail=T("休止の始め・休止中・再開のときの棚卸報告は任意。報告がないときは「スキップ」を選んで理由を書く。", "Báo cáo kiểm kê khi bắt đầu tạm dừng・đang tạm dừng・tiếp tục là tùy chọn. Nếu không có báo cáo thì chọn 「スキップ」 và ghi lý do.")),
    F("3.5", T("スキップの理由", "Lý do bỏ qua"), "label::スキップの理由（スキップするときだけ必須）^", "text", "input", req="条件付き", len="文字列 60", init=T("空", "Trống"), ex=["お客様と相談し、報告なしで進める", "Lý do bỏ qua báo cáo kiểm kê (tối đa 60 ký tự)"], err=["E01", "E04"], cond=T("棚卸報告＝スキップする のときだけ必須", "Chỉ bắt buộc khi báo cáo kiểm kê = スキップする")),
], T("休止（ひかり物産 本社・承認待ち）。画像は「影響と設定」のタブ。", "Tạm dừng (trụ sở ひかり物産, chờ duyệt). Ảnh là tab 「影響と設定」."), setup=DTAB("影響と設定"))
V029 = kind_view("029", T("再開（休止予定の取消・CH-20260927-0001）", "Tiếp tục (hủy bỏ tạm dừng dự kiến・CH-20260927-0001)"), "CH-20260927-0001", [
    RO0("3", "再開するサイクル月", "再開するサイクル月", "Tháng chu kỳ tiếp tục", T("休止予定の拠点に出した「再開」は「休止予定の取消」になり、再開予定月＝休止の開始月（休止期間0か月）。承認すると休止は始まらず、先行子契約の「取消」を戻して配送予定を作り直す。注文は戻らない（お客様がもう一度入れる）。休止の履歴に「取消した休止（0か月）」を残し、通算1年には入れない（台帳 F 2026-10-06・Q14＝B）。", "「再開」 đưa cho điểm 休止予定 trở thành 「休止予定の取消」, tháng tiếp tục dự kiến = tháng bắt đầu tạm dừng (thời gian tạm dừng 0 tháng). Duyệt thì tạm dừng không bắt đầu, đưa 「取消」 của hợp đồng con tiến hành trước về lại và tạo lại lịch giao. Order không được khôi phục (khách nhập lại). Lưu lịch sử 「取消した休止（0か月）」 và không tính vào tổng 1 năm (sổ F 2026-10-06・Q14=B).")),
    F("3.1", T("配送ルート", "Tuyến giao hàng"), "label::配送ルート^", "select", "select", req="－", len="選択（休止前と同じ／見直す（子契約の配送ルートで直す））", init=T("休止前と同じ", "Giống trước khi tạm dừng"), ex=["見直す（子契約の配送ルートで直す）", "Tuyến giao hàng khi tiếp tục"]),
    F("3.2", T("再開後の最初の納品日", "Ngày giao đầu tiên sau khi tiếp tục"), "label::再開後の最初の納品日^", "date", "input", req="○", len="日付 yyyy-mm-dd", init=T("空", "Trống"), ex=["2027-01-12", "Ngày giao đầu tiên sau khi tiếp tục (yyyy-mm-dd)"], err=["E01"], demo_ok=T("コードは日付を文字で入力する。仕様は共通の日付部品。仕様が正", "Code nhập ngày bằng chữ. Đặc tả dùng thành phần ngày chung. Theo đặc tả")),
    F("3.3", T("設備の再設置日", "Ngày lắp đặt lại thiết bị"), "label::設備の再設置日（引き揚げていたとき）^", "date", "input", req="条件付き", len="日付 yyyy-mm-dd", init=T("空", "Trống"), ex=["2027-01-08", "Ngày lắp đặt lại thiết bị (yyyy-mm-dd)"], cond=T("休止中に設備を引き揚げていたときだけ入れる", "Chỉ nhập khi đã thu hồi thiết bị trong thời gian tạm dừng"), demo_ok=T("コードは日付を文字で入力する。仕様は共通の日付部品。仕様が正", "Code nhập ngày bằng chữ. Đặc tả dùng thành phần ngày chung. Theo đặc tả"),
      open=T("再開：引き揚げた設備の最低利用期間を「数え直す（既定）」か「残りを引き継ぎ再設置費 OP000015」かを運営が選ぶ欄（承認画面にまだない）", "Tiếp tục: ô để vận hành chọn thời gian sử dụng tối thiểu của thiết bị đã thu hồi là 「tính lại (mặc định)」 hay 「kế thừa phần còn lại và phí lắp lại OP000015」 (chưa có trên màn hình duyệt)"), ask="お客様（運用）"),
], T("再開（サンプル 名古屋営業所・休止予定の取消・承認待ち）。画像は「影響と設定」のタブ。", "Tiếp tục (chi nhánh Nagoya của サンプル, hủy bỏ tạm dừng dự kiến, chờ duyệt). Ảnh là tab 「影響と設定」."), setup=DTAB("影響と設定"))
V030 = kind_view("030", T("解約（解約日の判定・委託配送会社への通知・CH-20260927-0002）", "Hủy (xác định ngày hủy・thông báo công ty giao ủy thác・CH-20260927-0002)"), "CH-20260927-0002", [
    F("3", T("解約日の判定", "Xác định ngày hủy"), ".secttl::解約日の判定", "area", detail=T("受付日とオーダー締切（既定は前月15日）で最短の解約日が決まる。締切の前（オーダー期間中）に受けたら翌月から、後なら翌々月から適用。解約日はサイクルの終わり（日割りなし）。最短の解約日より前は承認できない（承認ボタンを非活性にして理由を出す）。自販機の拠点も同じ締切（自販機だけ早める締切はない）。", "Ngày hủy sớm nhất được quyết định bởi ngày tiếp nhận và hạn chốt order (mặc định ngày 15 tháng trước). Nhận trước hạn chốt (trong thời gian order) thì áp dụng từ tháng sau, sau hạn thì từ tháng sau nữa. Ngày hủy là cuối chu kỳ (không tính theo ngày). Trước ngày hủy sớm nhất thì không duyệt được (làm nút duyệt không khả dụng và hiện lý do). Điểm máy bán hàng cũng cùng hạn chốt (không có hạn chốt sớm riêng).")),
    F("3.1", T("委託配送会社への通知", "Thông báo cho công ty giao ủy thác"), ".secttl::委託配送会社への通知", "label", detail=T("承認すると自動で送る通知の表（配送区分・宛先・メモ）とメール見本。", "Bảng thông báo tự động gửi khi duyệt (loại giao hàng, người nhận, ghi chú) và email mẫu.")),
    F("3.2", T("最後の納品日", "Ngày giao cuối cùng"), "label::最後の納品日^", "date", "input", req="○", len="日付 yyyy-mm-dd", init=T("空", "Trống"), ex=["2026-10-30", "Ngày giao cuối cùng (yyyy-mm-dd)"], err=["E01"], demo_ok=T("コードは日付を文字で入力する。仕様は共通の日付部品。仕様が正", "Code nhập ngày bằng chữ. Đặc tả dùng thành phần ngày chung. Theo đặc tả")),
    F("3.3", T("設備の引揚予定日", "Ngày dự kiến thu hồi thiết bị"), "label::設備の引揚予定日^", "date", "input", req="○", len="日付 yyyy-mm-dd", init=T("空", "Trống"), ex=["2026-11-05", "Ngày dự kiến thu hồi thiết bị (yyyy-mm-dd)"], err=["E01"], demo_ok=T("コードは日付を文字で入力する。仕様は共通の日付部品。仕様が正", "Code nhập ngày bằng chữ. Đặc tả dùng thành phần ngày chung. Theo đặc tả")),
    F("3.4", T("違約金の確認", "Xác nhận tiền phạt"), "label::違約金（設備ごとに判定して合算）を確認した必須^", "check", "check", req="○", len="ON／OFF", init="OFF", ex=["ON", "Ô xác nhận đã kiểm tra tiền phạt (xác định theo từng thiết bị rồi cộng lại)"], err=["E01"], detail=T("最低利用期間に満たない設備の違約金を設備ごとに判定して合算する。承認の前にする設定（必須）。", "Xác định tiền phạt của thiết bị chưa đủ thời gian sử dụng tối thiểu theo từng thiết bị rồi cộng lại. Thiết lập trước khi duyệt (bắt buộc).")),
    F("3.5", T("残った商品（在庫）の扱い", "Cách xử lý sản phẩm còn lại (tồn kho)"), ".fld:has(.fl)", "select", "select", req="○", len="選択（全て買取／返却（全部・元払い））", init=T("未選択", "Chưa chọn"), ex=["全て買取", "Cách xử lý sản phẩm còn lại khi hủy"], detail=T("解約のときだけ。全て買取＝最終の請求書に買取の行／返却＝全部・元払い（買取の行なし・管理ロスなし）。商品ごとには分けない。どちらも最後の棚卸報告は必須。代理入力の欄（AW_APPL_005 状態 057）で選ぶ。", "Chỉ khi hủy. Mua lại toàn bộ = dòng mua lại trong hóa đơn cuối / Trả lại = toàn bộ・người gửi trả phí (không có dòng mua lại・không tổn thất quản lý). Không tách theo sản phẩm. Cả hai đều bắt buộc báo cáo kiểm kê cuối cùng. Chọn ở ô nhập thay (AW_APPL_005 trạng thái 057)."), demo_ok=T("この欄は代理入力の画面（AW_APPL_005）の入力で、申請詳細には出ない", "Ô này là nhập ở màn hình nhập thay (AW_APPL_005), không hiện trên chi tiết đơn")),
], T("解約（カフェ花 横浜店・承認済）。画像は「影響と設定」のタブ。", "Hủy (chi nhánh Yokohama của カフェ花, đã duyệt). Ảnh là tab 「影響と設定」."), setup=DTAB("影響と設定"))
V031 = V("031", C2, T("参照のみの役割（承認・却下なし）", "Vai trò chỉ xem (không duyệt・từ chối)"), "/ops/applications/CH-20260925-0001", DTAB("拠点ごとの承認"), [
    F("7", T("操作の欄（参照のみ）", "Cột thao tác (chỉ xem)"), "#apxboard .es-table", "table", detail=T("経理（Ad00012・契約申請管理＝R）・閲覧のみ（Ad00013）には、承認・却下のボタンを出さない（灰色にもしない）。申請内容・変更される項目・影響と設定は参照できる。CS（R/U）は承認・却下できる。", "Với kế toán (Ad00012, 契約申請管理 = R) và chỉ xem (Ad00013) không hiện nút duyệt・từ chối (cũng không làm xám). Xem được nội dung đơn, mục thay đổi, ảnh hưởng và thiết lập. CS (R/U) duyệt・từ chối được.")),
], login="Ad00012", full=True, wait=900, note=T("経理（Ad00012）で表示。", "Hiển thị với kế toán (Ad00012)."))
V032 = V("032", C2, T("見つかりません（存在しない申請ID）", "Không tìm thấy (ID đơn không tồn tại)"), "/ops/applications/CH-99999999-0001", "", [
    F("10", T("見つからないメッセージ", "Thông báo không tìm thấy"), ".card .pad", "label", "show", err=["E100"], detail=T("存在しない申請IDのアドレスを開いたとき、画面名と申請IDの下に「この申請は見つかりません。」と一覧へ戻るリンクを出す（E100 の「申請」版）。", "Khi mở địa chỉ có ID đơn không tồn tại, dưới tên màn hình và ID đơn hiện 「この申請は見つかりません。」 và liên kết quay về danh sách (bản 「申請」 của E100)."), demo_ok=T("コードの文言は「この申請は見つかりません。契約申請管理へ戻る」。共通メッセージ E100「{対象}（{ID}）が見つかりません。」に合わせる（宿題）", "Câu trong code là 「この申請は見つかりません。契約申請管理へ戻る」. Đưa về E100 「{対象}（{ID}）が見つかりません。」 (việc cần sửa)")),
], wait=700)
NOSEED = lambda vid, state, no, ja, vi, det, **kw: V(vid, C2, state, "/ops/applications/CH-20260925-0001", "", [
    F("10", T(ja, vi), ".es-tabs", "area", detail=det, demo_ok=H_NOSEED, **kw)], wait=700,
    note=T("見本のデータには作れない状態のため、画像は通常の画面（状態 013）。", "Trạng thái không tạo được bằng dữ liệu mẫu nên ảnh là màn hình thường (trạng thái 013)."))
V033 = NOSEED("033", T("休止：通算超過（承認できない）", "Tạm dừng: vượt tổng thời gian (không duyệt được)"), "", "休止の通算超過", "Tạm dừng vượt tổng thời gian",
              T("休止の通算が12ヶ月を超える申請は、承認ボタンを非活性にして理由を赤字で出す（「休止は通算12ヶ月までです。残り{n}ヶ月を超える期間は選べません。」）。却下はできる。登録時（代理入力）にも同じ検査で止める（AW_APPL_005 状態 055）。", "Đơn tạm dừng làm tổng vượt 12 tháng thì làm nút duyệt không khả dụng và hiện lý do chữ đỏ (「休止は通算12ヶ月までです。残り{n}ヶ月を超える期間は選べません。」). Vẫn từ chối được. Khi đăng ký (nhập thay) cũng chặn bằng cùng kiểm tra (AW_APPL_005 trạng thái 055)."))
V034 = NOSEED("034", T("冷蔵庫→自販機の変更（現場調査・開始月）", "Đổi tủ lạnh → máy bán hàng (khảo sát hiện trường・tháng bắt đầu)"), "", "冷蔵庫→自販機の切替", "Chuyển tủ lạnh → máy bán hàng",
              T("冷蔵庫の拠点を自販機にする変更は、承認のとき運営が開始月を決める（法人の希望月は参考。現場調査・自販機の手配に合わせる）。冷蔵庫の拠点がこの条件を満たさないときは「設置条件を満たさない」で却下できる（台帳 B・受付簿 #27）。移行割 DC000021 の対象なら事前にチェックする。", "Việc đổi điểm tủ lạnh sang máy bán hàng do vận hành quyết định tháng bắt đầu khi duyệt (tháng khách mong muốn chỉ tham khảo; theo khảo sát hiện trường và chuẩn bị máy). Nếu điểm tủ lạnh không đạt điều kiện thì từ chối được với 「設置条件を満たさない」 (sổ B, sổ tiếp nhận #27). Nếu thuộc đối tượng giảm giá chuyển đổi DC000021 thì chọn trước."))
V035 = NOSEED("035", T("確定済みの月（ロック・反映待ち）", "Tháng đã chốt (khóa・chờ phản ánh)"), "", "確定済みの月", "Tháng đã chốt",
              T("プランの変更などで、請求の確定済み（まだ発行していない）の月にかかるときは、その月を変えずに承認する。ダッシュボードの帯「確定済みの月に反映していない変更」に出し、請求の画面で確定を解除してから「反映」する（AW_DASH 状態 006）。承認ダイアログには「確定済みの月は変えない」と書く。", "Khi đổi gói... ảnh hưởng tháng đã chốt hóa đơn (chưa phát hành) thì duyệt mà không đổi tháng đó. Hiện ở dải 「確定済みの月に反映していない変更」 của dashboard, hủy chốt ở màn hình hóa đơn rồi bấm 「反映」 (AW_DASH trạng thái 006). Hộp thoại duyệt ghi 「確定済みの月は変えない」."))
V036 = NOSEED("036", T("対応中 n/m・一部承認（複数拠点の申請）", "対応中 n/m・一部承認 (đơn nhiều điểm)"), "", "対応中 n/m", "Đang xử lý n/m",
              T("複数拠点の申請で一部の拠点だけ処理したときは、ステータスを「対応中 n/m」（承認 n 拠点／全 m 拠点）にし、全部処理すると「承認済」「一部承認」「却下」になる（台帳 F #42）。一覧の件数・メニューのバッジは対応中を含む。見本の変更申請はすべて1拠点のため作れない。", "Đơn nhiều điểm mà mới xử lý một phần thì trạng thái là 「対応中 n/m」 (đã duyệt n điểm / tổng m điểm), xử lý hết thì thành 「承認済」「一部承認」「却下」 (sổ F #42). Số trong danh sách và huy hiệu menu tính cả đang xử lý. Đơn thay đổi của dữ liệu mẫu đều 1 điểm nên không tạo được."))
V037 = V("037", C2, T("却下済み（理由を表示）", "Đã từ chối (hiện lý do)"), "/ops/applications/CH-20260929-0001", DTAB("法人単位の承認") + "btn('却下').click();await sleep(800);sets(q('.es-modal__panel select'),'申請内容に不備がある');await sleep(200);btn('却下する').click();await sleep(1200);", [
    F("7", T("却下した拠点（理由つき）", "Điểm đã từ chối (kèm lý do)"), "#apxboard .es-badge::却下", "label", err=["S31"], detail=T("却下した拠点は「却下」（赤）に変わり、理由を状態の下に出す。却下のトースト（S31）を出し、法人へ理由つきでお知らせを送る。却下した申請は「やり直す」ができない。", "Điểm bị từ chối chuyển thành 「却下」 (đỏ), lý do hiện dưới trạng thái. Hiện toast từ chối (S31) và gửi thông báo kèm lý do cho pháp nhân. Đơn đã từ chối không 「やり直す」 được.")),
], full=True, wait=900, note=T("CH-20260929-0001 を却下した直後（この撮影でデータが変わるため、状態の最後に置く）。", "Ngay sau khi từ chối CH-20260929-0001 (ảnh chụp này làm đổi dữ liệu nên đặt ở cuối các trạng thái)."))

# ====================================================================== AW_APPL_004 契約申込新規登録（代理入力）
C4 = "AW_APPL_004"
FL = lambda label: ".fld::%s" % label
CARDN = lambda n: ".apx-narrow > :nth-child(%d)" % n
REG_JS = (JS + "const fld=t=>qa('.fld').find(f=>f.querySelector('.fl')&&f.querySelector('.fl').textContent.replace('必須','').trim()===t);"
          "const sel=(t,v)=>sets(fld(t).querySelector('select'),v);const inp=(t,v)=>setv(fld(t).querySelector('input,textarea'),v);")
REG_FILL = ("sel('受付経路','電話');sel('ES営業担当','田中 健一');inp('法人名','株式会社テスト食品');inp('法人名フリガナ','カブシキガイシャテストショクヒン');inp('請求先法人名','株式会社テスト食品');"
            "inp('担当者名','山田 太郎');inp('フリガナ','ヤマダ タロウ');inp('メールアドレス','yamada@test.example');"
            "sel('契約区分','本導入');inp('拠点名','テスト食品 本社');inp('郵便番号','105-0011');inp('住所','東京都港区芝公園1-2-3');sel('プラン','ES000004 100プラン（ESスタンダード）');sel('コース','ESスタンダード');sel('配送区分','ES配送便');sel('設備の希望','冷蔵庫');inp('開始サイクル月（希望）','2026-11');await sleep(300);")
NF_HEAD = [
    F("1", T("ヘッダー", "Phần đầu trang"), ".es-pagehead", "area", detail=T("パンくず（契約申請管理 / 契約申込新規登録）・画面名・[キャンセル][登録]。新規契約タブの「新規登録（代理入力）」からだけ入る（台帳 28-33）。フル権限だけが使える（台帳 F 運営A Q3）。", "Breadcrumb (契約申請管理 / 契約申込新規登録), tên màn hình, [キャンセル][登録]. Chỉ vào từ 「新規登録（代理入力）」 của tab đơn mới (sổ 28-33). Chỉ vai trò toàn quyền dùng được (sổ F 運営A Q3).")),
    F("1.1", T("パンくず", "Breadcrumb"), ".es-breadcrumb a", "link", "click", detail=T("「契約申請管理」を押すと一覧へ戻る。入力があるときは破棄の確認（Q02）を出す。", "Bấm 「契約申請管理」 để về danh sách. Nếu đã nhập thì hiện xác nhận hủy (Q02).")),
    F("1.2", T("画面名", "Tên màn hình"), ".es-pagehead__title", "label", detail=T("「契約申込新規登録（代理入力）」", "Chữ 「契約申込新規登録（代理入力）」")),
    F("1.3", T("キャンセル", "Hủy"), ".es-pagehead__actions button::キャンセル", "button", "click", err=["Q02"], detail=T("一覧へ戻る。入力を変えていれば Q02「入力内容を破棄しますか？」（状態 044）。ブラウザを閉じる・再読み込み・ほかの画面への移動でも同じ（台帳 F）。", "Về danh sách. Nếu đã sửa nội dung thì Q02 「入力内容を破棄しますか？」 (trạng thái 044). Đóng trình duyệt, tải lại, chuyển màn hình cũng vậy (sổ F).")),
    F("1.4", T("登録", "Đăng ký"), ".es-pagehead__actions button::登録", "button", "click", cond=FULL, err=["S32", "E30", "E32"], pattern="P-FORM", detail=T("全項目をまとめてチェックし、エラーがなければ申込（受付中）を1件作る。作れたら S32 のトーストを出して一覧へ戻り、登録した行を先頭に選択色で出す（状態 045）。登録のあとは受付（AW_INTK_001）から、Web の申込と同じ流れで進める。押したら無効にする（二重送信を防ぐ）。", "Kiểm tra gộp mọi mục, không lỗi thì tạo 1 đơn (受付中). Tạo được thì hiện toast S32 và về danh sách, dòng vừa đăng ký hiện ở đầu và tô màu chọn (trạng thái 045). Sau khi đăng ký, tiếp tục từ tiếp nhận (AW_INTK_001) theo luồng giống đơn từ Web. Bấm xong thì khóa nút (chống gửi hai lần).")),
]
NF_RECV = [
    F("2", T("受付の情報", "Thông tin tiếp nhận"), "h2::受付の情報^", "area", detail=T("どこから受けたか（履歴に残る）。運営だけの項目。", "Nhận từ đâu (lưu vào lịch sử). Mục chỉ dành cho vận hành.")),
    F("2.1", T("受付経路", "Kênh tiếp nhận"), FL("受付経路"), "select", "select", req="○", len="選択（電話／営業（訪問）／紙の申込書／メール／その他）", init=T("未選択（選択してください）", "Chưa chọn (hãy chọn)"), ex=["電話", "Kênh tiếp nhận (điện thoại)"], err=["E02"], detail=T("申込を受けた経路。履歴と一覧（代理入力の札の下）に出る。CSV取込の申込は「CSV取込」になる（申込フォーム §10-8）。", "Kênh nhận đơn. Hiện ở lịch sử và danh sách (dưới nhãn nhập thay). Đơn nhập CSV là 「CSV取込」 (申込フォーム §10-8).")),
    F("2.2", T("受付日", "Ngày tiếp nhận"), FL("受付日"), "date", "input", req="○", len="日付 yyyy-mm-dd", init=T("今日", "Hôm nay"), ex=["2026-10-05", "Ngày tiếp nhận (yyyy-mm-dd)"], err=["E01"], detail=T("受けた日。開始サイクル月の選べる最早月（締切前＝翌月から・締切後＝翌々月から）の判定に使う。", "Ngày nhận. Dùng để xác định tháng sớm nhất chọn được cho tháng chu kỳ bắt đầu (trước hạn chốt = từ tháng sau, sau hạn = từ tháng sau nữa)."), demo_ok=T("コードはブラウザの日付入力（type=date）。仕様は共通の日付部品（宿題）", "Code dùng ô nhập ngày của trình duyệt (type=date). Đặc tả dùng thành phần ngày chung (việc cần sửa)")),
    F("2.3", T("入力者", "Người nhập"), FL("入力者"), "label", len="文字列（ログイン中の運営ユーザー）", detail=T("入力した運営ユーザー（変えられない）。履歴の「操作した人」になる。", "Người dùng vận hành đã nhập (không đổi được). Trở thành 「người thao tác」 trong lịch sử."), demo_ok=H_SELF),
    F("2.4", T("ES営業担当", "Nhân viên kinh doanh ES"), FL("ES営業担当"), "select", "select", req="－", len="選択（有効な運営ユーザー。役割では絞らない）", init=T("未選択", "Chưa chọn"), ex=["田中 健一", "Nhân viên kinh doanh ES phụ trách"], detail=T("申込を担当する運営ユーザー。受付・仮登録を経て、法人の「ES営業担当」に入る。", "Người dùng vận hành phụ trách đơn. Sau tiếp nhận・đăng ký tạm sẽ vào 「ES営業担当」 của pháp nhân."), demo_ok=T("選択肢は有効な運営ユーザー（アカウント）。コードは固定の3名（宿題 H9）", "Lựa chọn là người dùng vận hành đang hoạt động (tài khoản). Code cố định 3 người (việc cần sửa H9)")),
]
NF_CORP = [
    F("3", T("法人", "Pháp nhân"), "h2::法人^", "area", detail=T("法人の区分で、新しい法人（法人の情報を入れる）か既存の法人（拠点を足す）かを選ぶ。", "Chọn theo loại pháp nhân: pháp nhân mới (nhập thông tin pháp nhân) hoặc pháp nhân có sẵn (thêm điểm).")),
    F("3.1", T("法人の区分", "Loại pháp nhân"), FL("法人の区分"), "select", "select", req="○", len="選択（新しい法人／既存の法人）", init=T("新しい法人", "Pháp nhân mới"), ex=["既存の法人", "Pháp nhân có sẵn thì thêm điểm"], detail=T("既存の法人を選ぶと法人名などの欄は出ず、法人を選ぶ欄が出る（状態 039）。", "Chọn pháp nhân có sẵn thì không hiện các ô tên pháp nhân..., hiện ô chọn pháp nhân (trạng thái 039).")),
    F("3.2", T("法人名", "Tên pháp nhân"), FL("法人名必須"), "text", "input", req="○", len="文字列 60", init=T("空", "Trống"), ex=["株式会社サンプルフーズ", "Tên pháp nhân (tối đa 60 ký tự)"], err=["E01", "E04", "E13"], detail=T("新しい法人のときだけ。前後の空白を取り、全角の英数字・ハイフンは半角に直す。絵文字は不可。", "Chỉ khi pháp nhân mới. Bỏ khoảng trắng đầu cuối, đổi chữ số / chữ cái / dấu gạch toàn góc sang nửa góc. Không dùng emoji."), demo_ok=T("コードは最大文字数・絵文字のチェックがない（宿題 H9）。仕様が正", "Code không kiểm tra số ký tự tối đa, emoji (việc cần sửa H9). Theo đặc tả")),
    F("3.3", T("法人名フリガナ", "Furigana tên pháp nhân"), FL("法人名フリガナ必須"), "text", "input", req="○", len="文字列 60", init=T("空", "Trống"), ex=["カブシキガイシャサンプルフーズ", "Furigana bằng Katakana toàn góc (tối đa 60 ký tự)"], err=["E01", "E03", "E04"], valid=T("全角カタカナ・長音・スペース", "Katakana toàn góc, âm dài, khoảng trắng"), demo_ok=T("コードは全角カタカナのチェックがない（宿題 H9）。仕様が正", "Code không kiểm tra Katakana toàn góc (việc cần sửa H9). Theo đặc tả")),
    F("3.4", T("請求先法人名", "Tên pháp nhân nhận hóa đơn"), FL("請求先法人名必須"), "text", "input", req="○", len="文字列 60", init=T("空", "Trống"), ex=["株式会社サンプルフーズ 経理部", "Tên nhận hóa đơn (nếu giống tên pháp nhân thì ghi giống)"], err=["E01", "E04", "E13", "W02"], detail=T("請求書の宛名（法人名と同じなら同じ名前）。印字できない文字は W02（保存はできる）。", "Tên người nhận trên hóa đơn (giống tên pháp nhân thì ghi giống). Ký tự không in được thì W02 (vẫn lưu được)."), demo_ok=T("コードは最大文字数のチェックがない（宿題 H9）。仕様が正", "Code không kiểm tra số ký tự tối đa (việc cần sửa H9). Theo đặc tả")),
    F("3.5", T("請求書に載る住所", "Địa chỉ ghi trên hóa đơn"), FL("請求書に載る住所"), "text", "input", req="○", len="文字列 255", init=T("空", "Trống"), ex=["〒105-0011 東京都港区芝公園1-2-3", "Mã bưu chính và địa chỉ (tối đa 255 ký tự)"], err=["E01", "E04", "E05"], valid=T("郵便番号7桁（ハイフンは任意）・都道府県・市区町村・町域・番地・建物は分けて入れる（申込フォーム §5-1）。住所検索で自動入力できる。", "Mã bưu chính 7 số (gạch ngang tùy chọn), tỉnh, quận / huyện, khu phố, số nhà, tòa nhà nhập riêng (申込フォーム §5-1). Có thể tự nhập bằng tìm địa chỉ."),
      demo_ok=T("コードは郵便番号と住所を1つの文字欄で受ける（任意）。仕様は §5-1 の分けた入力（必須）で、住所検索つき（宿題 H9）", "Code nhận mã bưu chính và địa chỉ trong 1 ô chữ (tùy chọn). Đặc tả là nhập riêng theo §5-1 (bắt buộc), có tìm địa chỉ (việc cần sửa H9)")),
    F("3.6", T("法人の電話番号", "Điện thoại pháp nhân"), CARDN(3) + " .frow:nth-child(2) .fld:nth-child(5)", "text", "input", req="○", len="文字列 20", init=T("空", "Trống"), ex=["03-1234-5678", "Số điện thoại (số và dấu gạch ngang, 10〜11 chữ số)"], err=["E01", "E06"], valid=T("数字とハイフン。ハイフンを除いて10〜11桁。", "Số và dấu gạch ngang. Bỏ gạch ngang còn 10〜11 chữ số."), demo_ok=T("コードは必須でなく桁数のチェックもない（宿題 H9）。仕様が正", "Code không bắt buộc và không kiểm tra số chữ số (việc cần sửa H9). Theo đặc tả")),
    F("3.7", T("法人（既存）", "Pháp nhân (có sẵn)"), 'select[value=""]', "select", "select", req="条件付き", len="選択（有効な法人。法人ID＋法人名）", init=T("未選択（法人ID・法人名で選ぶ）", "Chưa chọn (chọn theo ID・tên pháp nhân)"), ex=["CU00001 株式会社サンプル", "Pháp nhân có sẵn (ID + tên)"], err=["E02"], cond=T("法人の区分＝既存の法人 のときだけ（状態 039）", "Chỉ khi loại pháp nhân = pháp nhân có sẵn (trạng thái 039)"), demo_ok=T("選択肢は法人マスタ（取消の法人は出さない）。コードは固定の6社（宿題 H9）", "Lựa chọn lấy từ master pháp nhân (không hiện pháp nhân đã hủy). Code cố định 6 công ty (việc cần sửa H9)")),
]
NF_STAFF = [
    F("4", T("法人のご担当者（メイン担当者）", "Người phụ trách của pháp nhân (người phụ trách chính)"), "h2::法人のご担当者（メイン担当者）^", "area", detail=T("この方が申込者になる。仮登録でアカウントを発行するときの案内先になる。法人の担当者はメイン担当者1名と請求担当者1名が必須（申込フォーム §5-2。代理入力はメイン担当者だけ入れ、請求担当者はメイン担当者と同じ扱い）。", "Người này là người đăng ký. Là nơi gửi hướng dẫn khi cấp tài khoản lúc đăng ký tạm. Người phụ trách của pháp nhân bắt buộc 1 người chính và 1 người phụ trách hóa đơn (申込フォーム §5-2. Nhập thay chỉ nhập người chính, người phụ trách hóa đơn coi như giống người chính).")),
    F("4.1", T("担当者名", "Tên người phụ trách"), FL("担当者名必須"), "text", "input", req="○", len="文字列 60", init=T("空", "Trống"), ex=["山田 太郎", "Họ tên người phụ trách (tối đa 60 ký tự)"], err=["E01", "E04", "E13"]),
    F("4.2", T("フリガナ", "Furigana"), FL("フリガナ必須"), "text", "input", req="○", len="文字列 60", init=T("空", "Trống"), ex=["ヤマダ タロウ", "Furigana bằng Katakana toàn góc (tối đa 60 ký tự)"], err=["E01", "E03", "E04"], valid=T("全角カタカナ・長音・スペース", "Katakana toàn góc, âm dài, khoảng trắng")),
    F("4.3", T("メールアドレス", "Địa chỉ email"), FL("メールアドレス必須"), "text", "input", req="○", len="文字列 160", init=T("空", "Trống"), ex=["yamada@abc.co.jp", "Địa chỉ email (dạng x@y.z, tối đa 160 ký tự)"], err=["E01", "E07"], valid=T("x@y.z の形。", "Dạng x@y.z."), detail=T("アカウント発行の案内先（仮登録で、アカウント発行を ON にしたとき）。", "Nơi gửi hướng dẫn cấp tài khoản (khi bật cấp tài khoản lúc đăng ký tạm)."), demo_ok=T("コードはメールの形式チェックがない（宿題 H9）。仕様が正", "Code không kiểm tra định dạng email (việc cần sửa H9). Theo đặc tả")),
    F("4.4", T("担当者の電話番号", "Điện thoại người phụ trách"), CARDN(4) + " .fld:nth-child(4)", "text", "input", req="－", len="文字列 20", init=T("空", "Trống"), ex=["03-1234-5678", "Số điện thoại (10〜11 chữ số)"], err=["E06"], valid=T("数字とハイフン。ハイフンを除いて10〜11桁。", "Số và dấu gạch ngang. Bỏ gạch ngang còn 10〜11 chữ số.")),
]
NF_BR = [
    F("5", T("拠点の申込内容", "Nội dung đơn của điểm"), "#nfbrs .nf-br:nth-child(1)", "area", detail=T("拠点ごとに1件の親契約になる。「拠点を追加」で拠点を増やす（拠点2以降は「この拠点を外す」）。お試しも複数拠点を申し込める。", "Mỗi điểm là 1 hợp đồng cha. Thêm điểm bằng 「拠点を追加」 (từ điểm 2 có 「この拠点を外す」). Dùng thử cũng đăng ký được nhiều điểm.")),
    F("5.1", T("契約区分", "Loại hợp đồng"), FL("契約区分必須"), "select", "select", req="○", len="選択（本導入／お試しキャンペーン／切替（お試し→本導入））", init=T("未選択（選択してください）", "Chưa chọn (hãy chọn)"), ex=["本導入", "Loại hợp đồng"], err=["E02"], detail=T("「切替（お試し→本導入）」はお試し中の拠点を本導入へ切り替える申込（状態 040）。お試しのときは設備は冷蔵庫・冷凍庫に固定し、自販機は選べない（申込フォーム §4-8）。", "「切替（お試し→本導入）」 là đơn chuyển điểm đang dùng thử sang chính thức (trạng thái 040). Khi dùng thử thiết bị cố định tủ lạnh・tủ đông, không chọn được máy bán hàng (申込フォーム §4-8).")),
    F("5.2", T("拠点名", "Tên điểm"), "#nfbrs .nf-br:nth-child(1) " + ".fld:nth-child(2)", "text", "input", req="○", len="文字列 60", init=T("空", "Trống"), ex=["東京本社", "Tên điểm giao hàng (tối đa 60 ký tự)"], err=["E01", "E04", "E13"]),
    F("5.3", T("郵便番号", "Mã bưu chính"), "#nfbrs .nf-br:nth-child(1) .fld:nth-child(3)", "text", "input", req="○", len="文字列 8", init=T("空", "Trống"), ex=["103-0027", "Mã bưu chính 7 chữ số (gạch ngang tùy chọn)"], err=["E01", "E05"], valid=T("数字7桁（ハイフンは任意）。保存は 123-4567 の形。", "7 chữ số (gạch ngang tùy chọn). Lưu dạng 123-4567.")),
    F("5.4", T("住所", "Địa chỉ"), "#nfbrs .nf-br:nth-child(1) .fld:nth-child(4)", "text", "input", req="○", len="文字列 255", init=T("空", "Trống"), ex=["東京都中央区日本橋1-1-1 サンプルビル5F", "Địa chỉ từ tỉnh đến tên tòa nhà (tối đa 255 ký tự)"], err=["E01", "E04", "E13"], demo_ok=T("コードは住所を1つの文字欄で受ける。仕様は都道府県・市区町村・町域・番地・建物を分けて入れる（申込フォーム §4-5・宿題 H9）", "Code nhận địa chỉ trong 1 ô chữ. Đặc tả nhập riêng tỉnh, quận / huyện, khu phố, số nhà, tòa nhà (申込フォーム §4-5; việc cần sửa H9)")),
    F("5.5", T("プラン", "Gói"), FL("プラン必須"), "select", "select", req="○", len="選択（プランマスタの公開中のプラン）", init=T("未選択（選択してください）", "Chưa chọn (hãy chọn)"), ex=["ES000004 100プラン（ESスタンダード）", "Gói (chọn từ master gói đang công khai)"], err=["E02"], detail=T("自動販売機は100プラン以上（50プランでは自販機を選べない）。", "Máy bán hàng từ gói 100 trở lên (gói 50 không chọn được máy bán hàng)."), demo_ok=T("選択肢はプランマスタの公開中のプラン。コードは固定の3つ（宿題 H9）", "Lựa chọn lấy từ master gói đang công khai. Code cố định 3 gói (việc cần sửa H9)")),
    F("5.6", T("コース", "Khóa"), FL("コース必須"), "select", "select", req="○", len="選択（ESライト／ESスタンダード）", init=T("未選択（選択してください）", "Chưa chọn (hãy chọn)"), ex=["ESスタンダード", "Khóa (loại menu)"], err=["E02"], detail=T("設備が自販機のときは ESライト（自販機）に固定する。", "Khi thiết bị là máy bán hàng thì cố định ESライト（自販機）.")),
    F("5.7", T("配送区分", "Loại giao hàng"), FL("配送区分必須"), "select", "select", req="○", len="選択（ES配送便／COOL便）", init=T("未選択（選択してください）", "Chưa chọn (hãy chọn)"), ex=["ES配送便", "Loại giao hàng"], err=["E02"], detail=T("設備が自販機の拠点は ES配送便に固定（選択肢を出さない・状態 042）。", "Điểm có máy bán hàng cố định ES配送便 (không hiện lựa chọn; trạng thái 042).")),
    F("5.8", T("納品不可曜日", "Ngày không giao được"), FL("納品不可曜日"), "text", "input", req="－", len="文字列 60", init=T("空", "Trống"), ex=["土・日・祝日", "Các thứ không giao được (ví dụ T7・CN・ngày lễ)"], err=["E04"], detail=T("月〜日と祝日のチェックで選ぶ。全部は選べない（お届けできる日が残ること）。", "Chọn bằng ô đánh dấu thứ Hai〜Chủ nhật và ngày lễ. Không chọn hết được (phải còn ngày giao được)."), demo_ok=T("コードは文字欄。仕様は月〜日＋祝日のチェック（申込フォーム §4-5・宿題 H9）", "Code là ô chữ. Đặc tả là ô đánh dấu thứ Hai〜Chủ nhật + ngày lễ (申込フォーム §4-5; việc cần sửa H9)")),
    F("5.9", T("設置フロア", "Tầng lắp đặt"), FL("設置フロア"), "text", "input", req="条件付き", len="文字列 60", init=T("空", "Trống"), ex=["2F 給湯室", "Tầng / vị trí lắp đặt (tối đa 60 ký tự)"], err=["E01", "E04"], cond=T("設備に自販機を含むときだけ必須（冷蔵庫・冷凍庫は任意）", "Chỉ bắt buộc khi thiết bị có máy bán hàng (tủ lạnh・tủ đông là tùy chọn)"), detail=T("すべての拠点で出す。仮登録で拠点の専用の項目「設置フロア」に入る（配送備考に混ぜない・台帳 B）。", "Hiện ở mọi điểm. Khi đăng ký tạm sẽ vào mục riêng 「設置フロア」 của điểm (không trộn vào ghi chú giao hàng; sổ B).")),
    F("5.10", T("基準数のパターン", "Mẫu số lượng chuẩn"), FL("基準数のパターン"), "select", "select", req="○", len="選択（通常／短消費期限なし）", init=T("通常", "Thông thường"), ex=["短消費期限なし", "Mẫu số lượng chuẩn (không đưa sản phẩm hạn ngắn vào order tự động)"], detail=T("短消費期限なし＝消費期限の短い商品を自動注文に入れない（料金は同じ）。契約（申込）時に決め、契約後は運営の法人・拠点の画面だけで変えられる。自販機の拠点では出さない。", "Không có hạn ngắn = không đưa sản phẩm hạn ngắn vào order tự động (giá giống nhau). Quyết định khi ký (đăng ký) hợp đồng, sau đó chỉ đổi được ở màn hình pháp nhân・điểm của vận hành. Không hiện ở điểm máy bán hàng.")),
    F("5.11", T("設備の希望", "Thiết bị mong muốn"), FL("設備の希望必須"), "select", "select", req="○", len="選択（冷蔵庫／冷蔵庫＋冷凍庫／冷蔵庫＋自販機／自販機のみ）", init=T("未選択（選択してください）", "Chưa chọn (hãy chọn)"), ex=["冷蔵庫", "Thiết bị mong muốn"], err=["E02"], detail=T("自販機を含む選択（冷蔵庫＋自販機・自販機のみ）にすると、配送区分は ES配送便に固定・設置フロアが必須・基準数のパターンは出さない。", "Chọn có máy bán hàng (tủ lạnh + máy bán hàng, chỉ máy bán hàng) thì loại giao hàng cố định ES配送便, bắt buộc tầng lắp đặt, không hiện mẫu số lượng chuẩn.")),
    F("5.12", T("開始サイクル月（希望）", "Tháng chu kỳ bắt đầu (mong muốn)"), FL("開始サイクル月（希望）必須"), "month", "input", req="○", len="年月 yyyy-mm", init=T("空", "Trống"), ex=["2026-11", "Tháng chu kỳ bắt đầu mong muốn (yyyy-mm)"], err=["E01", "E68"], detail=T("契約はサイクル単位のため日は選ばない（A1＝その月の最初の月曜）。オーダー締切の前の申込は翌月以降、締切後の申込は翌々月以降だけ選べる（申込フォーム §4-2）。", "Hợp đồng theo đơn vị chu kỳ nên không chọn ngày (A1 = thứ Hai đầu tiên của tháng đó). Đơn trước hạn chốt order chọn từ tháng sau, đơn sau hạn chọn từ tháng sau nữa (申込フォーム §4-2)."), demo_ok=T("コードは年月を選ぶが、受付日と締切による「選べる最早月」の制限がない（宿題 H10）。仕様が正", "Code chọn năm-tháng nhưng chưa có giới hạn 「tháng sớm nhất chọn được」 theo ngày tiếp nhận và hạn chốt (việc cần sửa H10). Theo đặc tả")),
    F("5.13", T("拠点のご担当者", "Người phụ trách của điểm"), FL("拠点のご担当者"), "text", "input", req="－", len="文字列 255", init=T("空", "Trống"), ex=["鈴木 花子・スズキ ハナコ・suzuki@abc.co.jp", "Họ tên・furigana・email (để trống nếu giống người phụ trách chính của pháp nhân)"], detail=T("氏名・フリガナ・メール。法人のメイン担当者と同じなら空欄。仕様は拠点ごとの担当者の表（区分・担当者名・フリガナ・メール・電話・行の追加／削除）で、拠点のメイン担当者1名が必須（請求先＝この拠点なら請求担当者も必須）。", "Họ tên・furigana・email. Giống người phụ trách chính của pháp nhân thì để trống. Đặc tả là bảng người phụ trách theo điểm (loại, tên, furigana, email, điện thoại, thêm / xóa dòng), bắt buộc 1 người phụ trách chính của điểm (nếu nơi nhận hóa đơn = điểm này thì cả người phụ trách hóa đơn)."),
      demo_ok=T("コードは1行の文字欄。仕様は担当者の表（宿題 H9）", "Code là ô chữ 1 dòng. Đặc tả là bảng người phụ trách (việc cần sửa H9)")),
    F("5.14", T("請求先", "Nơi nhận hóa đơn"), FL("請求先"), "select", "select", req="○", len="選択（法人／この拠点）", init=T("法人", "Pháp nhân"), ex=["この拠点", "Nơi nhận hóa đơn"], detail=T("法人なしの拠点は「この拠点」になる。「この拠点」のときは、支払方法・支払サイクル（月払い／年払い）・請求担当者も必要（申込フォーム §4-6）。", "Điểm không có pháp nhân thì là 「この拠点」. Khi 「この拠点」 cần cả phương thức thanh toán, chu kỳ thanh toán (hàng tháng / hàng năm) và người phụ trách hóa đơn (申込フォーム §4-6).")),
    F("5.15", T("配送備考", "Ghi chú giao hàng"), FL("配送備考"), "textarea", "input", req="－", len="文字列 500（複数行）", init=T("空", "Trống"), ex=["8:00〜10:00／通用口から搬入", "Ghi chú giao hàng (tối đa 500 ký tự, nhiều dòng)"], err=["E04", "E13"], detail=T("配送の希望（曜日など）は配送パターン・納品サイクルを選ばせず、ここで受ける。", "Mong muốn giao hàng (thứ...) không cho chọn mẫu giao hàng・chu kỳ giao mà nhận ở đây.")),
    F("5.16", T("拠点を追加", "Thêm điểm"), "button::拠点を追加", "button", "click", detail=T("拠点の申込内容のカードを1つ増やす（拠点はいくつでも追加できる）。", "Thêm một thẻ nội dung đơn của điểm (thêm bao nhiêu điểm cũng được).")),
    F("5.17", T("添付資料", "Tài liệu đính kèm"), "h2::添付資料^", "area", detail=T("申込書（紙・PDF）と、搬入経路資料・設置場所写真。任意。JPG・PNG・PDF・HEIC、1ファイル5MB・10件まで。Excel・Word は受けない（E11・E119）。", "Đơn đăng ký (giấy・PDF), tài liệu đường đưa hàng, ảnh nơi lắp đặt. Tùy chọn. JPG・PNG・PDF・HEIC, mỗi tệp 5MB, tối đa 10 tệp. Không nhận Excel・Word (E11・E119)."), demo_ok=T("コードのファイル欄は文字を入れる欄（ファイルを選べない・宿題 H9）。仕様はファイル添付", "Ô tệp trong code là ô nhập chữ (không chọn được tệp; việc cần sửa H9). Đặc tả là đính kèm tệp")),
]
NF_SPEC = [
    F("6", T("仕様にあってコードにない入力（申込フォーム §4・§5・§10-8）", "Mục nhập có trong đặc tả nhưng chưa có trong code (申込フォーム §4・§5・§10-8)"), "-", "area", detail=T("代理入力は法人Webと同じ項目・同じチェックに運営だけの項目を足す（台帳 28-33）。コードの入力は約半分で、次の項目が足りない（宿題 H9）。次の項目は設計書の定義として書く。", "Nhập thay có cùng mục・cùng kiểm tra với Web pháp nhân và thêm mục chỉ dành cho vận hành (sổ 28-33). Nhập trong code chỉ khoảng một nửa, thiếu các mục sau (việc cần sửa H9). Các mục sau được ghi như định nghĩa của tài liệu thiết kế.")),
    F("6.1", T("支払方法", "Phương thức thanh toán"), "-", "select", "select", req="条件付き", len="選択（口座振替／銀行振込／クレジットカード）", init=T("未選択", "Chưa chọn"), ex=["口座振替", "Phương thức thanh toán"], err=["E02"], cond=T("法人の支払方法（新しい法人のとき）。請求先＝この拠点 の拠点にも必須", "Phương thức thanh toán của pháp nhân (khi pháp nhân mới). Cũng bắt buộc với điểm có nơi nhận hóa đơn = điểm này"), detail=T("クレジットカードは選択肢に残し、決済はシステムの外（ES は区分だけ持つ）。", "Thẻ tín dụng vẫn là một lựa chọn, thanh toán ngoài hệ thống (ES chỉ giữ phân loại)."), demo_ok=T("コードに欄がない（宿題 H9）", "Code chưa có ô (việc cần sửa H9)")),
    F("6.2", T("支払サイクル", "Chu kỳ thanh toán"), "-", "select", "select", req="条件付き", len="選択（月払い／年払い）", init=T("月払い", "Hàng tháng"), ex=["年払い", "Chu kỳ thanh toán (hàng năm)"], err=["E02"], cond=T("法人（新しい法人）または 請求先＝この拠点 の拠点", "Pháp nhân (pháp nhân mới) hoặc điểm có nơi nhận hóa đơn = điểm này"), demo_ok=T("コードに欄がない（宿題 H9）", "Code chưa có ô (việc cần sửa H9)")),
    F("6.3", T("請求書の発行時期", "Thời điểm phát hành hóa đơn"), "-", "select", "select", req="○", len="選択（3ヶ月前／2ヶ月前／1ヶ月前／当月／翌月）", init=T("1ヶ月前", "1 tháng trước"), ex=["1ヶ月前", "Thời điểm phát hành hóa đơn so với tháng chu kỳ"], err=["E02"], cond=T("新しい法人のときだけ（拠点では聞かない）", "Chỉ khi pháp nhân mới (không hỏi ở điểm)"), detail=T("請求書発行リードタイム（既定 1ヶ月前）。申込後は法人は参照のみ。", "Lead time phát hành hóa đơn (mặc định 1 tháng trước). Sau khi đăng ký pháp nhân chỉ xem."), demo_ok=T("コードに欄がない（宿題 H9）", "Code chưa có ô (việc cần sửa H9)")),
    F("6.4", T("法人の請求担当者", "Người phụ trách hóa đơn của pháp nhân"), "-", "text", "input", req="－", len="文字列 60（名前・フリガナ・メール・電話）", init=T("空（メイン担当者と同じ）", "Trống (giống người phụ trách chính)"), ex=["経理 花子・ケイリ ハナコ・keiri@abc.co.jp", "Người phụ trách hóa đơn (để trống thì giống người phụ trách chính)"], detail=T("空ならメイン担当者と同じ（CSV 取込と同じ）。", "Để trống thì giống người phụ trách chính (giống nhập CSV)."), demo_ok=T("コードに欄がない（宿題 H9）", "Code chưa có ô (việc cần sửa H9)")),
    F("6.5", T("配送回数（月）", "Số lần giao (tháng)"), "-", "select", "select", req="○", len="選択（プラン標準／＋1回／＋2回）", init=T("プラン標準", "Tiêu chuẩn của gói"), ex=["プラン標準", "Số lần giao mỗi tháng"], err=["E02"], detail=T("標準を超えた分は配送回数追加（OP000001・1回あたり月額 3,000円）。お試しは選べない（プラン標準で固定）。選んだ回数が受付の配送回数の初期値になる。", "Phần vượt tiêu chuẩn là thêm lần giao (OP000001, 3,000 yên/tháng cho mỗi lần). Dùng thử không chọn được (cố định tiêu chuẩn của gói). Số lần đã chọn là giá trị ban đầu của số lần giao ở tiếp nhận."), demo_ok=T("コードに欄がない（宿題 H9）", "Code chưa có ô (việc cần sửa H9)")),
    F("6.6", T("納品不可になった場合", "Khi ngày giao không được"), "-", "select", "select", req="○", len="選択（前の日に早める／後の日に遅らせる）", init=T("未選択", "Chưa chọn"), ex=["前の日に早める", "Cách xử lý khi ngày giao không được"], err=["E02"], demo_ok=T("コードに欄がない（宿題 H9）", "Code chưa có ô (việc cần sửa H9)")),
    F("6.7", T("従業員数概算", "Số nhân viên ước tính"), "-", "select", "select", req="○", len="選択（人数の区分）", init=T("未選択", "Chưa chọn"), ex=["50〜99名", "Số nhân viên ước tính (nhóm số người)"], err=["E02"], demo_ok=T("コードに欄がない（宿題 H9）", "Code chưa có ô (việc cần sửa H9)")),
    F("6.8", T("オプション", "Tùy chọn"), "-", "check", "check", req="－", len="複数選択（オプションマスタの「申込に出す」かつ使用中のもの）", init=T("選ばない", "Không chọn"), ex=["OP000007 設置代行", "Tùy chọn (chọn nhiều từ master tùy chọn đang hiển thị khi đăng ký)"], detail=T("名前・金額・料金種別（月額／単発）はマスタのとおり。自販機ラッピング変更（OP000017）は自販機の拠点だけ。ES-QR 利用料（OP000002）は申込では選ばせない（運営が付ける）。", "Tên, số tiền, loại phí (hàng tháng / một lần) theo master. Đổi dán decal máy bán hàng (OP000017) chỉ điểm máy bán hàng. Phí ES-QR (OP000002) không cho chọn khi đăng ký (vận hành thêm)."), demo_ok=T("コードに欄がない（宿題 H9）", "Code chưa có ô (việc cần sửa H9)")),
    F("6.9", T("申込者", "Người đăng ký"), "-", "select", "select", req="○", len="選択（法人の担当者・拠点の担当者のメールのどれか）", init=T("法人のメイン担当者", "Người phụ trách chính của pháp nhân"), ex=["yamada@abc.co.jp", "Người đăng ký (chọn trong người phụ trách đã nhập)"], err=["E02"], detail=T("お申し込み者は登録するご担当者から1人選ぶ（申込フォーム §5-3・hong 2026-10-03 A2）。", "Chọn 1 người đăng ký trong những người phụ trách đã đăng ký (申込フォーム §5-3, hong 2026-10-03 A2)."), demo_ok=T("コードは「法人のご担当者（メイン担当者）＝申込者」の固定（宿題 H9）", "Code cố định 「người phụ trách chính của pháp nhân = người đăng ký」 (việc cần sửa H9)")),
    F("6.10", T("お試し期間月数", "Số tháng dùng thử"), "-", "select", "select", req="条件付き", len="選択（お試しの月数）", init=T("未選択", "Chưa chọn"), ex=["1ヶ月", "Số tháng dùng thử"], err=["E02"], cond=T("契約区分＝お試しキャンペーン のときだけ必須", "Chỉ bắt buộc khi loại hợp đồng = chiến dịch dùng thử"), demo_ok=T("コードに欄がない（宿題 H9）", "Code chưa có ô (việc cần sửa H9)")),
    F("6.11", T("アカウントを発行するか", "Có cấp tài khoản không"), "-", "check", "check", req="○", len="ON／OFF", init=T("ON", "ON"), ex=["ON", "Có cấp tài khoản hay không"], detail=T("登録のあとの仮登録（AW_INTK_001）でアカウントを発行するかの初期値。CSV 取込の「アカウントを発行するか」と同じ。", "Giá trị ban đầu việc có cấp tài khoản ở đăng ký tạm (AW_INTK_001) sau khi đăng ký hay không. Giống 「アカウントを発行するか」 của nhập CSV."), demo_ok=T("コードに欄がない（宿題 H9）。仮登録の確認の画面で選ぶ（状態は AW_INTK_001）", "Code chưa có ô (việc cần sửa H9). Chọn ở màn hình xác nhận đăng ký tạm (trạng thái của AW_INTK_001)")),
]
V038 = V("038", C4, T("初期（新しい法人）", "Ban đầu (pháp nhân mới)"), "/ops/applications/proxy/new", "", NF_HEAD + NF_RECV + NF_CORP + NF_STAFF + NF_BR + NF_SPEC, full=True, wait=900,
         note=T("フル権限（Ad00010）で「新規登録（代理入力）」を押した直後。コードの入力欄と、仕様にあってコードにない欄（番号 6）を分けて書いた。", "Ngay sau khi toàn quyền (Ad00010) bấm 「新規登録（代理入力）」. Ghi tách các ô nhập trong code và các ô có trong đặc tả nhưng chưa có trong code (số 6)."))
V039 = V("039", C4, T("既存の法人に拠点を足す", "Thêm điểm vào pháp nhân có sẵn"), "/ops/applications/proxy/new", REG_JS + "sets(fld('法人の区分').querySelector('select'),'既存の法人');await sleep(600);", [
    F("7", T("既存の法人を選ぶ欄", "Ô chọn pháp nhân có sẵn"), FL("法人必須"), "select", "select", req="○", len="選択（有効な法人。法人ID＋法人名）", init=T("未選択（法人ID・法人名で選ぶ）", "Chưa chọn (chọn theo ID・tên pháp nhân)"), ex=["CU00001 株式会社サンプル", "Pháp nhân có sẵn (ID + tên)"], err=["E02"], detail=T("法人の区分＝既存の法人 のとき、法人名などの欄に代えて表示する。選んだ法人の拠点として申込を作る（法人の情報はそのまま）。", "Khi loại pháp nhân = pháp nhân có sẵn thì hiện thay cho các ô tên pháp nhân.... Tạo đơn như điểm của pháp nhân đã chọn (thông tin pháp nhân giữ nguyên)."), demo_ok=T("選択肢は法人マスタ。コードは固定の法人（宿題 H9）", "Lựa chọn lấy từ master pháp nhân. Code cố định các pháp nhân (việc cần sửa H9)")),
], wait=800)
V040 = V("040", C4, T("契約区分＝切替（お試し→本導入）", "Loại hợp đồng = 切替 (dùng thử → chính thức)"), "/ops/applications/proxy/new", REG_JS + "sets(fld('契約区分').querySelector('select'),'切替（お試し→本導入）');await sleep(600);", [
    F("7", T("切替の説明", "Giải thích về chuyển đổi"), ".fld:has(select)::切替（お試し→本導入）", "label", detail=T("「切替（お試し→本導入）」は、お試し中の拠点を本導入へ切り替える申込。登録すると受付の「切替」と同じ画面（拠点ごとに、同じ親契約の契約種別を本導入へ変える）になる。CSV 取込では受けられない（E71）。", "「切替（お試し→本導入）」 là đơn chuyển điểm đang dùng thử sang chính thức. Đăng ký xong thì ra cùng màn hình 「切替」 của tiếp nhận (với từng điểm, đổi loại hợp đồng của cùng hợp đồng cha sang chính thức). Nhập CSV không nhận được (E71)."), err=["E71"]),
], wait=800)
V041 = V("041", C4, T("拠点を追加（拠点2）", "Thêm điểm (điểm 2)"), "/ops/applications/proxy/new", JS + "btn('拠点を追加').click();await sleep(600);", [
    F("7", T("拠点2の申込内容", "Nội dung đơn của điểm 2"), "#nfbrs .nf-br:nth-child(2)", "area", detail=T("拠点のカードが1つ増える。見出しの右に「この拠点を外す」（拠点2以降）。複数拠点の申込は、登録すると1つの申込（1行）になり、受付で拠点ごとに仮登録・本登録する。", "Thêm một thẻ điểm. Bên phải tiêu đề có 「この拠点を外す」 (từ điểm 2). Đơn nhiều điểm sau khi đăng ký trở thành 1 đơn (1 dòng), ở tiếp nhận đăng ký tạm・đăng ký chính thức theo từng điểm.")),
    F("7.1", T("この拠点を外す", "Bỏ điểm này"), "button::この拠点を外す", "button", "click", detail=T("拠点2以降のカードを外す（入力した内容は消える。確認は出さない）。", "Bỏ thẻ của điểm 2 trở đi (nội dung đã nhập mất; không hiện xác nhận).")),
], wait=800)
V042 = V("042", C4, T("設備＝自販機のみ（配送区分は ES配送便に固定・設置フロア必須）", "Thiết bị = chỉ máy bán hàng (loại giao hàng cố định ES配送便, bắt buộc tầng lắp đặt)"), "/ops/applications/proxy/new", REG_JS + "sets(fld('設備の希望').querySelector('select'),'自販機のみ');await sleep(600);", [
    F("7", T("配送区分（固定）", "Loại giao hàng (cố định)"), FL("配送区分必須"), "select", "select", req="○", len="ES配送便（固定・選択肢なし）", init=T("ES配送便", "Chuyến ES"), ex=["ES配送便", "Cố định ES配送便 (không có lựa chọn)"], detail=T("設備が自販機の拠点は ES配送便に固定。欄の下に「設備が自販機の拠点は ES配送便に固定です。」（決定番号は画面に出さない）。コースも ESライト（自販機）に固定して表示だけにする（申込フォーム §4-8）。", "Điểm có máy bán hàng cố định ES配送便. Dưới ô ghi 「設備が自販機の拠点は ES配送便に固定です。」 (không hiện số quyết định trên màn hình). Khóa cũng cố định ESライト（自販機） và chỉ hiển thị (申込フォーム §4-8)."), demo_ok=T("コードのコースは選択のまま（自販機でも選べる）。仕様は ESライト（自販機）に固定（宿題 H9）", "Khóa trong code vẫn là ô chọn (máy bán hàng cũng chọn được). Đặc tả cố định ESライト（自販機） (việc cần sửa H9)")),
    F("7.1", T("設置フロア（必須）", "Tầng lắp đặt (bắt buộc)"), FL("設置フロア必須"), "text", "input", req="○", len="文字列 60", init=T("空", "Trống"), ex=["2F 給湯室", "Tầng / vị trí lắp đặt (tối đa 60 ký tự)"], err=["E01"], detail=T("自販機のときだけ必須。必須の印が付く。", "Chỉ bắt buộc khi máy bán hàng. Có dấu bắt buộc.")),
    F("7.2", T("基準数のパターン（出さない）", "Mẫu số lượng chuẩn (không hiện)"), FL("基準数のパターン"), "label", detail=T("自販機の拠点では出さない（自販機の基準数のため）。", "Không hiện ở điểm máy bán hàng (vì dùng số lượng chuẩn của máy bán hàng)."), demo_ok=T("この状態では欄が出ないため枠も出ない（意図どおり）", "Ở trạng thái này ô không hiện nên không có khung (đúng ý đồ)")),
], wait=800)
V043 = V("043", C4, T("入力エラー（必須が空のまま登録）", "Lỗi nhập (đăng ký khi mục bắt buộc còn trống)"), "/ops/applications/proxy/new", JS + "btn('登録').click();await sleep(800);", [
    F("7", T("エラーの項目", "Mục lỗi"), ".fld.bad", "label", "show", err=["E01", "E02", "E05", "E06", "E07"], pattern="P-FORM", detail=T("「登録」で全項目をまとめてチェックする。エラーの項目は赤枠にし、項目の下にその文言を出す（必須は E01・選択は E02）。最初のエラーの所までスクロールする。コードは項目の下に「{項目名}を入力してください」と出し、さらにトースト「入力されていない項目があります（n件）」も出す（宿題 H12）。", "Bấm 「登録」 kiểm tra gộp mọi mục. Mục lỗi viền đỏ, hiện câu lỗi dưới mục (bắt buộc E01, chọn E02). Cuộn tới lỗi đầu tiên. Code hiện 「{項目名}を入力してください」 dưới mục và cả toast 「入力されていない項目があります（n件）」 (việc cần sửa H12)."),
      demo_ok=T("コードの文言は「〜を入力してください」とトースト「入力されていない項目があります（n件）」。仕様は共通メッセージ（E01・E02）で項目の下だけ（宿題 H12）", "Câu trong code là 「〜を入力してください」 và toast 「入力されていない項目があります（n件）」. Đặc tả dùng thông báo chung (E01・E02), chỉ dưới mục (việc cần sửa H12)")),
], wait=800)
V044 = V("044", C4, T("破棄の確認（Q02）", "Xác nhận hủy bỏ (Q02)"), "/ops/applications/proxy/new", JS + "setv(qa('.fld input')[1],'x');await sleep(300);btn('キャンセル').click();await sleep(800);", [
    F("7", T("破棄の確認", "Xác nhận hủy bỏ"), ".es-modal__panel", "modal", err=["Q02"], detail=T("入力を変えたあとに「キャンセル」・パンくず・ほかの画面への移動・ブラウザを閉じる／再読み込み をしたときに出す（全サイト共通・台帳 F）。ボタン＝[キャンセル（続ける）][破棄]。コードの本文は「編集中の内容は保存されません。編集内容を破棄してもよろしいですか？」。", "Hiện khi đã sửa nội dung rồi bấm 「キャンセル」, breadcrumb, chuyển màn hình, đóng / tải lại trình duyệt (chung toàn hệ thống; sổ F). Nút = [キャンセル（続ける）][破棄]. Nội dung trong code là 「編集中の内容は保存されません。編集内容を破棄してもよろしいですか？」."),
      demo_ok=T("コードの文言は Q02「入力内容を破棄しますか？／保存していない内容は失われます。」と違う（[msg]）", "Câu trong code khác Q02 「入力内容を破棄しますか？／保存していない内容は失われます。」 ([msg])")),
], wait=800)

# ====================================================================== AW_APPL_005 変更申請の代理入力
C5 = "AW_APPL_005"
PRE5 = (JS + "const fld=t=>qa('.fld').find(f=>f.querySelector('.fl')&&f.querySelector('.fl').textContent.replace('必須','').trim().startsWith(t));"
        "const sel=(t,v)=>sets(fld(t).querySelector('select'),v);const inp=(t,v)=>setv(fld(t).querySelector('input,textarea'),v);"
        "const chk=(i)=>{const c=qa('.es-check input').filter(x=>!x.disabled)[i];c.click();};")
KIND = lambda k, branch=0: PRE5 + "sel('申請の種類','%s');await sleep(300);sel('法人','CU00001');await sleep(500);chk(%d);await sleep(600);" % (k, branch)
CH_HEAD = [
    F("1", T("ヘッダー", "Phần đầu trang"), ".es-pagehead", "area", detail=T("パンくず（契約申請管理 / 変更申請の代理入力）・画面名・[キャンセル][登録]。契約変更タブ・休止・解約タブの「変更申請の代理入力」から入る（開く種類はタブで決まる）。フル権限だけが使える（台帳 F 運営A Q3）。電話・メールで受けた変更を運営が入力し、登録すると承認待ちの申請ができる。", "Breadcrumb (契約申請管理 / 変更申請の代理入力), tên màn hình, [キャンセル][登録]. Vào từ 「変更申請の代理入力」 của tab thay đổi / tab tạm dừng・hủy (loại mở theo tab). Chỉ vai trò toàn quyền dùng được (sổ F 運営A Q3). Vận hành nhập thay đổi nhận qua điện thoại / email, đăng ký xong tạo đơn chờ duyệt.")),
    F("1.1", T("キャンセル", "Hủy"), ".es-pagehead__actions button::キャンセル", "button", "click", err=["Q02"], detail=T("一覧へ戻る（元のタブ）。入力を変えていれば Q02（状態 060）。", "Về danh sách (tab ban đầu). Nếu đã sửa thì Q02 (trạng thái 060).")),
    F("1.2", T("登録", "Đăng ký"), ".es-pagehead__actions button::登録", "button", "click", cond=FULL, err=["S33", "E30", "E32"], pattern="P-FORM", detail=T("全項目をまとめてチェックし、エラーがなければ承認待ちの申請を作る（複数拠点を選んだときは拠点ごとに1件）。S33 のトーストを出して、1件なら申請詳細（AW_APPL_002）、複数なら一覧へ移る。承認は法人Webの申請と同じ申請詳細（影響と設定 → 拠点ごとの承認）で行う。", "Kiểm tra gộp mọi mục, không lỗi thì tạo đơn chờ duyệt (chọn nhiều điểm thì mỗi điểm 1 đơn). Hiện toast S33, 1 đơn thì sang chi tiết đơn (AW_APPL_002), nhiều đơn thì sang danh sách. Duyệt ở chi tiết đơn giống đơn từ Web pháp nhân (ảnh hưởng và thiết lập → duyệt theo điểm).")),
]
CH_RECV = [
    F("2", T("受付の情報", "Thông tin tiếp nhận"), "h2::受付の情報^", "area", detail=T("どこから受けたか（履歴に残る）。運営だけの項目。", "Nhận từ đâu (lưu vào lịch sử). Mục chỉ dành cho vận hành.")),
    F("2.1", T("受付経路", "Kênh tiếp nhận"), FL("受付経路"), "select", "select", req="○", len="選択（電話／メール／営業（訪問）／運営の判断（例：長期の不在）／その他）", init=T("未選択（選択してください）", "Chưa chọn (hãy chọn)"), ex=["電話", "Kênh tiếp nhận (điện thoại)"], err=["E02"], detail=T("申請を受けた経路。履歴と一覧（「代理入力」の札）に出る。", "Kênh nhận đơn. Hiện ở lịch sử và danh sách (nhãn 「代理入力」).")),
    F("2.2", T("受付日", "Ngày tiếp nhận"), FL("受付日"), "date", "input", req="○", len="日付 yyyy-mm-dd", init=T("今日", "Hôm nay"), ex=["2026-10-05", "Ngày tiếp nhận (yyyy-mm-dd)"], err=["E01"], detail=T("受けた日。解約・休止などの最短の日付の判定に使う（解約は受付日とオーダー締切で最短の解約日が決まる）。", "Ngày nhận. Dùng để xác định ngày sớm nhất của hủy, tạm dừng... (hủy: ngày hủy sớm nhất do ngày tiếp nhận và hạn chốt order quyết định)."), demo_ok=T("コードは日付を文字で入力する（カレンダーの部品はある）。仕様は共通の日付部品（宿題）", "Code nhập ngày bằng chữ (có thành phần lịch). Đặc tả dùng thành phần ngày chung (việc cần sửa)")),
    F("2.3", T("入力者", "Người nhập"), FL("入力者"), "label", len="文字列（ログイン中の運営ユーザー）", detail=T("入力した運営ユーザー（変えられない）。履歴の「操作した人」になる。", "Người dùng vận hành đã nhập (không đổi được). Trở thành 「người thao tác」 trong lịch sử."), demo_ok=H_SELF),
]
CH_CONTENT = [
    F("3", T("申請の内容", "Nội dung đơn"), "h2::申請の内容^", "area", detail=T("1回の申請で1種類（法人Webと同じ）。種類を変えると、種類ごとの項目（法人Webの「ご希望の内容」と同じ・申請・承認 §6）に出し分ける。契約変更タブ＝プラン・配送・設備・拠点情報・法人情報、休止・解約タブ＝休止・再開・解約。", "1 lần xin 1 loại (giống Web pháp nhân). Đổi loại thì hiện mục khác nhau theo loại (giống 「ご希望の内容」 của Web pháp nhân; 申請・承認 §6). Tab thay đổi = gói, giao hàng, thiết bị, thông tin điểm, thông tin pháp nhân; tab tạm dừng・hủy = tạm dừng, tiếp tục, hủy.")),
    F("3.1", T("申請の種類", "Loại đơn"), FL("申請の種類"), "select", "select", req="○", len="選択（プランの変更／配送の変更／設備の変更／拠点情報の変更／法人情報の変更）", init=T("プランの変更", "Đổi gói"), ex=["配送の変更", "Loại đơn"], err=["E02"], detail=T("種類を変えると、法人・拠点・入力した内容をリセットする。休止・解約タブでは 休止／再開／解約。", "Đổi loại thì đặt lại pháp nhân, điểm, nội dung đã nhập. Ở tab tạm dừng・hủy là 休止／再開／解約.")),
    F("3.2", T("法人", "Pháp nhân"), FL("法人"), "select", "select", req="○", len="選択（利用中の拠点がある法人。法人ID＋法人名）", init=T("未選択（法人ID・法人名で選ぶ）", "Chưa chọn (chọn theo ID・tên pháp nhân)"), ex=["CU00001 株式会社サンプル", "Pháp nhân (ID + tên)"], err=["E02"]),
    F("3.3", T("種類の説明", "Giải thích loại đơn"), ".fld.wide .es-inline", "label", detail=T("種類ごとの説明を1行出す（例「プランとコースを選びます（いまと同じプランは選べません）。…」）。", "Hiện 1 dòng giải thích theo loại (ví dụ 「プランとコースを選びます（いまと同じプランは選べません）。…」).")),
    F("3.4", T("拠点（複数選べます）", "Điểm (chọn được nhiều)"), FL("拠点（複数選べます）"), "check", "check", req="○", len="複数選択（法人の拠点）", init=T("未選択", "Chưa chọn"), ex=["CU00950 株式会社サンプル 横浜営業所", "Điểm áp dụng (chọn nhiều)"], err=["E02"], detail=T("複数の拠点を選べる（拠点ごとに別の申請ができ、拠点ごとに内容を入れる）。承認待ちの申請がある拠点・その手続きの対象外の拠点（休止予定など）は選べず、理由を横に出す。法人情報の変更は拠点を選ばず法人1件。", "Chọn được nhiều điểm (mỗi điểm một đơn riêng và nhập nội dung theo từng điểm). Điểm đang có đơn chờ duyệt và điểm ngoài đối tượng của thủ tục (như đang dự kiến tạm dừng) không chọn được, hiện lý do bên cạnh. Đổi thông tin pháp nhân không chọn điểm mà là 1 pháp nhân.")),
]
V046 = V("046", C5, T("プランの変更：初期", "Đổi gói: ban đầu"), "/ops/applications/proxy/change", "", CH_HEAD + CH_RECV + CH_CONTENT, full=True, wait=900,
         note=T("契約変更タブで「変更申請の代理入力」を押した直後（種類＝プランの変更）。", "Ngay sau khi bấm 「変更申請の代理入力」 ở tab thay đổi (loại = đổi gói)."))
V047 = V("047", C5, T("プランの変更：拠点とプランを選ぶ", "Đổi gói: chọn điểm và gói"), "/ops/applications/proxy/change", KIND("chg", 0), [
    F("4", T("拠点ごとのご希望の内容", "Nội dung mong muốn theo từng điểm"), ".nf-br", "area", detail=T("選んだ拠点ごとに1枚（見出し＝「{拠点名}のご希望の内容」・右に「いまのプラン」）。複数拠点のときは、2枚目以降に「{1枚目の拠点名} と同じ内容を入れる」ボタンを出す。", "Mỗi điểm đã chọn 1 thẻ (tiêu đề = 「{tên điểm}のご希望の内容」, bên phải 「いまのプラン」). Khi nhiều điểm, từ thẻ thứ 2 hiện nút 「{tên điểm thẻ 1} と同じ内容を入れる」.")),
    F("4.1", T("開始したいご利用月", "Tháng sử dụng muốn bắt đầu"), FL("開始したいご利用月"), "select", "select", req="○", len="選択（選べる最早月以降のご利用月）", init=T("未選択", "Chưa chọn"), ex=["2026-11", "Tháng sử dụng muốn bắt đầu (từ tháng sớm nhất chọn được)"], err=["E02", "E68"], detail=T("締切までに申し込めば翌月のご利用月から、締切を過ぎれば翌々月から。いちばん早い月を欄の下に書く。選べる最早月は受付日とオーダー締切から決める（受付日の月から4つのご利用月のうち、締切前のものを出す。受付日を変えると選び直す）。", "Đăng ký trước hạn chốt thì từ tháng sử dụng kế tiếp, quá hạn thì từ tháng sau nữa. Ghi tháng sớm nhất dưới ô. Tháng sớm nhất chọn được quyết định từ ngày tiếp nhận và hạn chốt order (hiện các tháng còn trước hạn chốt trong 4 tháng tính từ tháng của ngày tiếp nhận; đổi ngày tiếp nhận thì chọn lại).")),
    F("4.2", T("変更後のプラン", "Gói sau khi đổi"), FL("変更後のプラン"), "select", "select", req="○", len="選択（プランマスタの公開中のプラン・コース）", init=T("未選択", "Chưa chọn"), ex=["100プラン（ESスタンダード）", "Gói và khóa sau khi đổi"], err=["E02"], detail=T("いまと同じプランは選べない。自動販売機は100プラン以上。選ぶとプランの標準貸出設備の差分から、承認の前に「影響と設定」で設備の異動の案を直せる。", "Không chọn được gói giống hiện tại. Máy bán hàng từ gói 100 trở lên. Sau khi chọn có thể sửa phương án di chuyển thiết bị ở 「影響と設定」 trước khi duyệt, dựa trên chênh lệch thiết bị cho mượn tiêu chuẩn của gói.")),
    F("4.3", T("変更の理由", "Lý do thay đổi"), FL("変更の理由"), "textarea", "input", req="－", len="文字列 500（複数行）", init=T("空", "Trống"), ex=["1月の増員で提供数が足りないため", "Lý do thay đổi (tối đa 500 ký tự, nhiều dòng)"], err=["E04", "E13"], demo_ok=T("コードは最大文字数（500）は止めるが、絵文字のチェックがない（宿題）。仕様が正", "Code chặn số ký tự tối đa (500) nhưng không kiểm tra emoji (việc cần sửa). Theo đặc tả")),
], full=True, wait=900, note=T("法人＝株式会社サンプルを選び、先頭の選べる拠点にチェックしたところ。", "Đã chọn pháp nhân = 株式会社サンプル và đánh dấu điểm đầu tiên chọn được."))
V048 = V("048", C5, T("配送の変更（配送方法・お届け回数）", "Đổi giao hàng (phương thức giao・số lần giao)"), "/ops/applications/proxy/change", KIND("opt", 1), [
    F("4", T("配送方法", "Phương thức giao"), FL("配送方法"), "label", detail=T("ES配送便／COOL便の変更。選択肢は拠点の条件で決まる。設備が自販機の拠点は ES配送便に固定（表示だけ・状態 049）。納品不可曜日・設備の希望日の変更は「拠点情報の変更」だけが入口（台帳 F）。", "Đổi ES配送便／COOL便. Lựa chọn do điều kiện của điểm quyết định. Điểm có máy bán hàng cố định ES配送便 (chỉ hiển thị; trạng thái 049). Đổi ngày không giao được và ngày mong muốn lắp đặt chỉ có lối vào 「拠点情報の変更」 (sổ F).")),
    F("4.1", T("お届け回数", "Số lần giao"), FL("お届け回数"), "select", "select", req="○", len="選択（変更しない／プラン標準／標準＋1回／標準＋2回）", init=T("未選択", "Chưa chọn"), ex=["3回（標準＋1回・＋3,000円／月）", "Số lần giao mỗi tháng"], err=["E02"], detail=T("標準の回数はプランで決まる。標準を超えた分は、お届け回数追加（OP000001・1回あたり月額 3,000円）。", "Số lần chuẩn do gói quyết định. Phần vượt chuẩn là thêm lần giao (OP000001, 3,000 yên/tháng cho mỗi lần).")),
    F("4.2", T("お届けできない曜日（参照）", "Ngày không giao được (xem)"), FL("お届けできない曜日"), "label", detail=T("いまの設定を参照のみで出し、変更は「拠点情報の変更」からと案内する。", "Hiện thiết lập hiện tại chỉ để xem và hướng dẫn đổi ở 「拠点情報の変更」.")),
    F("4.3", T("ご要望・ご事情", "Yêu cầu・hoàn cảnh"), FL("ご要望・ご事情"), "textarea", "input", req="－", len="文字列 500（複数行）", init=T("空", "Trống"), ex=["水曜の午前は会議で受け取れないため、配送時間帯を午後にしてください", "Yêu cầu / hoàn cảnh (tối đa 500 ký tự, nhiều dòng)"], err=["E04", "E13"], demo_ok=T("コードは最大文字数（500）は止めるが、絵文字のチェックがない（宿題）。仕様が正", "Code chặn số ký tự tối đa (500) nhưng không kiểm tra emoji (việc cần sửa). Theo đặc tả")),
], full=True, wait=900, note=T("法人＝株式会社サンプルを選び、先頭の選べる拠点（自販機の拠点 CU00643）にチェックしたところ。", "Đã chọn pháp nhân = 株式会社サンプル và đánh dấu điểm đầu tiên chọn được (điểm máy bán hàng CU00643)."))
V049 = V("049", C5, T("配送の変更：設備が自販機の拠点（配送方法は固定）", "Đổi giao hàng: điểm có máy bán hàng (phương thức giao cố định)"), "/ops/applications/proxy/change", KIND("opt", 0), [
    F("4", T("配送方法（固定）", "Phương thức giao (cố định)"), FL("配送方法"), "label", len="ES配送便（固定）", detail=T("設備が自販機の拠点は ES配送便に固定で、選択肢を出さない（「ES配送便（自動販売機のある拠点は固定です）」）。COOL便への変更は登録できない（共通メッセージの E は使わず、選択肢そのものを出さない）。", "Điểm có máy bán hàng cố định ES配送便 và không hiện lựa chọn (「ES配送便（自動販売機のある拠点は固定です）」). Không đăng ký được đổi sang COOL便 (không dùng E của thông báo chung mà không hiện lựa chọn).")),
], wait=900, note=T("先頭の選べる拠点（自販機の拠点 CU00643）。", "Điểm đầu tiên chọn được (điểm máy bán hàng CU00643)."))
V050 = V("050", C5, T("設備の変更（追加・サイズ変更・機種変更・返却）", "Đổi thiết bị (thêm・đổi kích thước・đổi máy・trả lại)"), "/ops/applications/proxy/change", KIND("eqp", 1), [
    F("4", T("ご希望の内容", "Nội dung mong muốn"), FL("ご希望の内容"), "select", "select", req="○", len="選択（設備を追加したい／サイズを変えたい／機種を変えたい／設備を返却したい）", init=T("未選択", "Chưa chọn"), ex=["設備を追加したい", "Nội dung mong muốn về thiết bị"], err=["E02"], detail=T("サイズ・機種の変更と返却は、いまお使いの設備の中から選ぶ。設備の希望日の変更は「拠点情報の変更」だけが入口。", "Đổi kích thước・máy và trả lại chọn trong thiết bị đang dùng. Đổi ngày mong muốn lắp đặt chỉ có lối vào 「拠点情報の変更」.")),
    F("4.1", T("変更後の設備", "Thiết bị sau khi đổi"), FL("変更後の設備"), "select", "select", req="○", len="選択（機種マスタの公開中の機種。機種コード＋機種名）", init=T("未選択", "Chưa chọn"), ex=["RF000003　冷蔵ショーケース 105L", "Thiết bị sau khi đổi (mã máy + tên máy)"], err=["E02"], detail=T("機種マスタの公開中の機種だけ。追加の設備（電子レンジ・資材ボックスなど）も選べる。サイズアップは差額だけ請求（OP000023）。", "Chỉ các máy đang công khai trong master máy. Chọn được cả thiết bị bổ sung (lò vi sóng, hộp vật tư...). Nâng kích thước chỉ tính chênh lệch (OP000023).")),
    F("4.2", T("台数", "Số lượng"), FL("台数"), "select", "select", req="○", len="選択（1台〜）", init=T("未選択", "Chưa chọn"), ex=["1台", "Số lượng (追加は台数を増やす / 返却は台数を返す)"], err=["E02"], detail=T("追加のときは増やす台数、返却のときは返す台数。", "Khi thêm là số máy tăng, khi trả lại là số máy trả.")),
    F("4.3", T("ご要望・ご事情", "Yêu cầu・hoàn cảnh"), FL("ご要望・ご事情"), "textarea", "input", req="－", len="文字列 500（複数行）", init=T("空", "Trống"), ex=["増員で入りきらないため、冷蔵庫を1台増やしたいです", "Yêu cầu / hoàn cảnh (tối đa 500 ký tự, nhiều dòng)"], err=["E04", "E13"], demo_ok=T("コードは最大文字数（500）は止めるが、絵文字のチェックがない（宿題）。仕様が正", "Code chặn số ký tự tối đa (500) nhưng không kiểm tra emoji (việc cần sửa). Theo đặc tả")),
], full=True, wait=900, note=T("入力から設備の異動の案を作る。承認の前に、申請詳細（AW_APPL_002 状態 015）で行と費用を直せる。", "Tạo phương án di chuyển thiết bị từ nhập liệu. Trước khi duyệt sửa được dòng và chi phí ở chi tiết đơn (AW_APPL_002 trạng thái 015)."))
V051 = V("051", C5, T("拠点情報の変更（変えたいものをチェック）", "Đổi thông tin điểm (đánh dấu mục muốn đổi)"), "/ops/applications/proxy/change", KIND("inf", 1), [
    F("4", T("ES-QR の利用設定・お試し期間月数（参照）", "Thiết lập ES-QR・số tháng dùng thử (xem)"), FL("ES-QR の利用設定"), "label", detail=T("いまの設定を参照のみで出す（ES-QR は運営だけが付け外し・お試し期間月数は本契約では「—」）。", "Hiện thiết lập hiện tại chỉ để xem (ES-QR chỉ vận hành thêm / bỏ・số tháng dùng thử là 「—」 với hợp đồng chính thức).")),
    F("4.1", T("変更したいもの", "Mục muốn đổi"), FL("変更したいもの"), "check", "check", req="○", len="複数選択（お届け先名・フリガナ／お届け先の住所／電話番号／請求書の宛先／ゲストモード／お届けできない曜日／設備の希望日）", init=T("選ばない", "Không chọn"), ex=["お届け先の住所", "Mục muốn đổi (chọn nhiều)"], err=["E02"], detail=T("変えたいものだけチェックする。チェックしたものの入力欄だけが下に出る。承認が必要な項目（拠点名・フリガナ・住所・電話・請求書の宛先・ゲストモード・納品不可曜日・設備の希望日）が対象。納品不可曜日と設備の希望日は、この「拠点情報の変更」だけが入口。", "Chỉ đánh dấu mục muốn đổi. Chỉ ô nhập của mục đã đánh dấu hiện bên dưới. Đối tượng là mục cần duyệt (tên điểm, furigana, địa chỉ, điện thoại, nơi nhận hóa đơn, chế độ khách, ngày không giao được, ngày mong muốn lắp đặt). Ngày không giao được và ngày mong muốn lắp đặt chỉ có lối vào 「拠点情報の変更」 này.")),
    F("4.2", T("ご事情・ご要望", "Hoàn cảnh・yêu cầu"), FL("ご事情・ご要望"), "textarea", "input", req="－", len="文字列 500（複数行）", init=T("空", "Trống"), ex=["オフィスを移転したため、お届け先と電話番号が変わります", "Hoàn cảnh / yêu cầu (tối đa 500 ký tự, nhiều dòng)"], err=["E04", "E13"], demo_ok=T("コードは最大文字数（500）は止めるが、絵文字のチェックがない（宿題）。仕様が正", "Code chặn số ký tự tối đa (500) nhưng không kiểm tra emoji (việc cần sửa). Theo đặc tả")),
], full=True, wait=900, note=T("チェックを選ぶと、その項目の入力欄が出る（住所なら郵便番号・都道府県・市区町村・町域・番地・建物）。", "Chọn ô đánh dấu thì hiện ô nhập của mục đó (địa chỉ gồm mã bưu chính, tỉnh, quận / huyện, khu phố, số nhà, tòa nhà)."))
V052 = V("052", C5, T("法人情報の変更（法人1件）", "Đổi thông tin pháp nhân (1 pháp nhân)"), "/ops/applications/proxy/change", PRE5 + "sel('申請の種類','cop');await sleep(300);sel('法人','CU00001');await sleep(500);qa('.es-check input')[0].click();qa('.es-check input')[1].click();await sleep(600);", [
    F("4", T("法人情報の変更", "Đổi thông tin pháp nhân"), "h2::法人情報の変更^", "area", detail=T("請求書に載る法人の住所・電話番号・FAX番号。拠点は選ばず、法人1件として承認する。承認のあと、未発行の請求書から新しい内容になる（発行済みの請求書はそのまま）。", "Địa chỉ, số điện thoại, FAX của pháp nhân ghi trên hóa đơn. Không chọn điểm, duyệt như 1 pháp nhân. Sau khi duyệt, từ hóa đơn chưa phát hành sẽ theo nội dung mới (hóa đơn đã phát hành giữ nguyên).")),
    F("4.1", T("変更したいもの", "Mục muốn đổi"), FL("変更したいもの"), "check", "check", req="○", len="複数選択（住所／電話番号・FAX番号）", init=T("選ばない", "Không chọn"), ex=["住所", "Mục muốn đổi (chọn nhiều)"], err=["E02"], detail=T("チェックしたものの入力欄だけが下に出る。", "Chỉ ô nhập của mục đã đánh dấu hiện bên dưới.")),
    F("4.2", T("郵便番号（変更後）", "Mã bưu chính (sau khi đổi)"), FL("郵便番号（変更後）"), "text", "input", req="条件付き", len="文字列 8", init=T("空", "Trống"), ex=["105-0011", "Mã bưu chính 7 chữ số (gạch ngang tùy chọn)"], err=["E01", "E05"], cond=T("住所にチェックしたときだけ", "Chỉ khi đánh dấu địa chỉ"), valid=T("数字7桁（ハイフンは任意）。保存は 123-4567 の形。", "7 chữ số (gạch ngang tùy chọn). Lưu dạng 123-4567.")),
    F("4.3", T("都道府県（変更後）", "Tỉnh / thành (sau khi đổi)"), FL("都道府県（変更後）"), "select", "select", req="条件付き", len="選択（47都道府県）", init=T("未選択", "Chưa chọn"), ex=["東京都", "Tỉnh / thành (47 tỉnh thành)"], err=["E02"], cond=T("住所にチェックしたときだけ", "Chỉ khi đánh dấu địa chỉ")),
    F("4.4", T("市区町村・町域・番地・建物（変更後）", "Quận / huyện・khu phố・số nhà・tòa nhà (sau khi đổi)"), FL("市区町村（変更後）"), "text", "input", req="条件付き", len="文字列 255", init=T("空", "Trống"), ex=["港区", "Quận / huyện (tòa nhà là tùy chọn)"], err=["E01", "E04", "E13", "W02"], cond=T("住所にチェックしたときだけ。市区町村・町域・番地は必須、建物・部屋番号は任意", "Chỉ khi đánh dấu địa chỉ. Quận / huyện, khu phố, số nhà bắt buộc; tòa nhà・số phòng tùy chọn"), detail=T("4つの入力欄：市区町村／町域・番地／建物・部屋番号。印字できない文字は W02。", "Bốn ô nhập: quận / huyện / khu phố・số nhà / tòa nhà・số phòng. Ký tự không in được thì W02.")),
    F("4.5", T("電話番号・FAX番号（変更後）", "Điện thoại・FAX (sau khi đổi)"), FL("電話番号（変更後）"), "text", "input", req="条件付き", len="文字列 20", init=T("空", "Trống"), ex=["03-5401-2300", "Số điện thoại (10〜11 chữ số)"], err=["E01", "E06"], cond=T("電話番号・FAX番号にチェックしたときだけ（電話番号は必須、FAX番号は任意）", "Chỉ khi đánh dấu điện thoại・FAX (điện thoại bắt buộc, FAX tùy chọn)"), valid=T("数字とハイフン。ハイフンを除いて10〜11桁。", "Số và dấu gạch ngang. Bỏ gạch ngang còn 10〜11 chữ số.")),
    F("4.6", T("理由", "Lý do"), FL("理由"), "textarea", "input", req="－", len="文字列 500（複数行）", init=T("空", "Trống"), ex=["代表番号の変更のため", "Lý do (tối đa 500 ký tự, nhiều dòng)"], err=["E04", "E13"], demo_ok=T("コードは最大文字数（500）は止めるが、絵文字のチェックがない（宿題）。仕様が正", "Code chặn số ký tự tối đa (500) nhưng không kiểm tra emoji (việc cần sửa). Theo đặc tả")),
], full=True, wait=900)
V053 = V("053", C5, T("複数拠点を選ぶ（拠点ごとに内容を入れる）", "Chọn nhiều điểm (nhập nội dung theo từng điểm)"), "/ops/applications/proxy/change", KIND("chg", 0) + "chk(1);await sleep(600);const m1=qa('.nf-br')[0].querySelector('select');sets(m1,m1.options[2].value);await sleep(500);", [
    F("4", T("2つ目の拠点のカード", "Thẻ của điểm thứ 2"), ".nf-br:nth-of-type(2), .card.nf-br + .card.nf-br", "area", detail=T("拠点を2つ以上選ぶと、拠点ごとにご希望の内容のカードが並ぶ（受付経路＝代理入力・台帳 F Q7）。登録すると拠点ごとに1件の申請ができる（一覧の申請IDは拠点ごと）。", "Chọn từ 2 điểm trở lên thì thẻ nội dung mong muốn xếp theo từng điểm (kênh tiếp nhận = nhập thay; sổ F Q7). Đăng ký xong tạo 1 đơn cho mỗi điểm (ID đơn trong danh sách theo từng điểm).")),
    F("4.1", T("同じ内容を入れる", "Điền cùng nội dung"), "button::と同じ内容を入れる", "button", "click", detail=T("2枚目以降のカードに出る。1枚目の拠点に入れた内容を、その拠点にコピーする。", "Hiện ở thẻ từ thứ 2. Sao chép nội dung đã nhập ở điểm thứ 1 sang điểm đó.")),
], full=True, wait=900, note=T("承認待ちの申請がある拠点・対象外の拠点は選べない（理由を横に出す）。", "Điểm có đơn đang chờ duyệt và điểm ngoài đối tượng không chọn được (hiện lý do bên cạnh)."))
PICK = "const pick=(t,i)=>{const s=fld(t).querySelector('select');sets(s,[...s.options][i].value);};const chkId=(id)=>{const c=qa('.es-check input').find(x=>x.closest('.es-check').textContent.includes(id));c.click();};"
STOP = lambda k, branch: PRE5 + PICK + "sel('申請の種類','%s');await sleep(300);sel('法人','CU00001');await sleep(500);chkId('%s');await sleep(600);" % (k, branch)
_REASON500 = T("複数行 500文字まで（法人Webと同じ）。", "Nhiều dòng, tối đa 500 ký tự (giống Web pháp nhân).")
_STOP_COMMON = [
    F("4", T("申請の種類（休止・解約タブ）", "Loại đơn (tab tạm dừng・hủy)"), FL("申請の種類"), "select", "select", req="○", len="選択（休止／再開／解約）", init=T("休止", "Tạm dừng"), ex=["解約", "Loại đơn"], err=["E02"], detail=T("休止・解約タブの「変更申請の代理入力」では 休止／再開／解約 から選ぶ。契約変更タブと同じ形の1画面で、種類を変えると、法人・拠点・入力した内容をリセットして種類ごとの項目（法人Webの「ご希望の内容」と同じ・申請・承認 §6-6〜§6-8）に出し分ける（台帳 F 運営A Q17）。", "Ở 「変更申請の代理入力」 của tab tạm dừng・hủy chọn trong 休止／再開／解約. Cùng một màn hình như tab thay đổi hợp đồng; đổi loại thì đặt lại pháp nhân, điểm, nội dung đã nhập và hiện mục theo loại (giống 「ご希望の内容」 của Web pháp nhân, 申請・承認 §6-6〜§6-8) (sổ F 運営A Q17).")),
    F("4.1", T("法人", "Pháp nhân"), FL("法人"), "select", "select", req="○", len="選択（利用中の拠点がある法人。法人ID＋法人名）", init=T("未選択（法人ID・法人名で選ぶ）", "Chưa chọn (chọn theo ID・tên pháp nhân)"), ex=["CU00001 株式会社サンプル", "Pháp nhân (ID + tên)"], err=["E02"], detail=T("共通データの法人から選ぶ（契約変更タブと同じ）。", "Chọn từ pháp nhân trong dữ liệu chung (giống tab thay đổi hợp đồng).")),
    F("4.2", T("拠点（複数選べます）", "Điểm (chọn được nhiều)"), FL("拠点（複数選べます）"), "check", "check", req="○", len="複数選択（法人の拠点）", init=T("未選択", "Chưa chọn"), ex=["CU00950 株式会社サンプル 横浜営業所", "Điểm áp dụng (chọn nhiều)"], err=["E02"], detail=T("複数の拠点を選べる（拠点ごとに内容を入れる）。承認待ちの申請がある拠点・その手続きの対象外の拠点は選べず、理由を横に出す。再開は休止中・休止予定の拠点だけ（台帳 運営A Q12・Q14）。", "Chọn được nhiều điểm (nhập nội dung theo từng điểm). Điểm đang có đơn chờ duyệt và điểm ngoài đối tượng của thủ tục không chọn được, hiện lý do bên cạnh. 再開 chỉ cho điểm đang 休止中・休止予定 (sổ 運営A Q12・Q14).")),
]
V054 = V("054", C5, T("休止（通算・再開予定月）", "Tạm dừng (tổng thời gian・tháng tiếp tục dự kiến)"), "/ops/applications/proxy/stop", STOP("sus", "CU00950") + "pick('休止の理由',1);pick('開始したいご利用月',1);pick('休止中の設備',1);pick('休止したい期間',3);await sleep(600);", _STOP_COMMON + [
    F("5", T("拠点ごとのご希望の内容", "Nội dung mong muốn theo từng điểm"), ".nf-br", "area", detail=T("選んだ拠点ごとに1枚（見出し＝「{拠点名}のご希望の内容」・右に「いまのプラン」）。複数拠点のときは、2枚目以降に「{1枚目の拠点名} と同じ内容を入れる」ボタンを出す。", "Mỗi điểm đã chọn 1 thẻ (tiêu đề = 「{tên điểm}のご希望の内容」, bên phải 「いまのプラン」). Khi nhiều điểm, từ thẻ thứ 2 hiện nút 「{tên điểm thẻ 1} と同じ内容を入れる」.")),
    F("5.1", T("休止の理由", "Lý do tạm dừng"), FL("休止の理由"), "select", "select", req="○", len=["選択（オフィスの改装・移転／長期休業・繁忙期の変動／ご利用人数の一時的な減少／費用の見直し／その他）", "Chọn (cải tạo, chuyển văn phòng／nghỉ dài hạn, biến động mùa cao điểm／giảm tạm thời số người dùng／xem lại chi phí／khác)"], init=T("未選択", "Chưa chọn"), ex=["オフィスの改装・移転", "Lý do tạm dừng"], err=["E02"], detail=T("承認すると、休止の理由（選択）と、あれば「差し支えなければ詳しくお聞かせください」（5.8）の両方を持ち、「理由（詳しく）」の形で休止理由に出す（拠点の契約タブの休止の帯・法人Webの休止の帯・注文画面。法人Web・運営の代理入力とも。hong 2026-10-08 Q23）。", "Khi duyệt, lưu cả lý do tạm dừng (chọn) và 「差し支えなければ詳しくお聞かせください」 (5.8, nếu có), hiện ở lý do tạm dừng dạng 「lý do（chi tiết）」 (dải tạm dừng tab hợp đồng chi nhánh・dải tạm dừng Web pháp nhân・màn hình đặt hàng; cả nhập hộ của Web pháp nhân và vận hành. hong 2026-10-08 Q23)."), open=T("休止の理由6択の文言（コードは5）：運営は承認画面で表示するだけ（受付簿 #12 は保留）", "Câu chữ 6 lựa chọn lý do tạm dừng (code có 5): vận hành chỉ hiển thị ở màn hình duyệt (sổ tiếp nhận #12 để lại)"), ask="お客様（運用）"),
    F("5.2", T("開始したいご利用月", "Tháng sử dụng muốn bắt đầu"), FL("開始したいご利用月"), "select", "select", req="○", len="選択（選べる最早月以降のご利用月）", init=T("未選択", "Chưa chọn"), ex=["2026-11", "Tháng sử dụng muốn bắt đầu (từ tháng sớm nhất chọn được)"], err=["E02", "E68"], detail=T("締切までに申し込めば翌月のご利用月から、締切を過ぎれば翌々月から。いちばん早い月を欄の下に書く（契約変更タブと同じ：受付日の月から4つのうち締切前のもの。受付日を変えると選び直す）。", "Đăng ký trước hạn chốt thì từ tháng sử dụng kế tiếp, quá hạn thì từ tháng sau nữa. Ghi tháng sớm nhất dưới ô (giống tab thay đổi hợp đồng: các tháng còn trước hạn chốt trong 4 tháng tính từ tháng của ngày tiếp nhận; đổi ngày tiếp nhận thì chọn lại).")),
    F("5.3", T("休止中の設備", "Thiết bị trong thời gian tạm dừng"), FL("休止中の設備"), "select", "select", req="○", len=["選択（引き揚げる／置いたままにしたい（保管料はかかりません））", "Chọn (thu hồi／muốn để lại (không tính phí lưu kho))"], init=T("未選択", "Chưa chọn"), ex=["置いたままにしたい（保管料はかかりません）", "Xử lý thiết bị khi tạm dừng"], err=["E02"], detail=T("置いたままの設備は、休止中の最低利用期間のカウントが止まる。引き揚げた設備も、設置し直したときに休止前の残りを引き継ぐ。", "Thiết bị để lại: tạm dừng đếm thời gian sử dụng tối thiểu trong lúc tạm dừng. Thiết bị đã thu hồi cũng kế thừa phần còn lại trước tạm dừng khi lắp lại.")),
    F("5.4", T("通算の休止月数（過去の休止の累計）", "Số tháng tạm dừng tích lũy (các lần tạm dừng trước)"), FL("通算の休止月数"), "label", detail=T("表示のみ。過去の休止の累計月数（取消した休止は0か月で通算に入れない）。通算は上限12ヶ月。", "Chỉ hiển thị. Tổng số tháng của các lần tạm dừng trước (lần đã hủy là 0 tháng, không tính vào tổng). Tổng tối đa 12 tháng.")),
    F("5.5", T("残り月数", "Số tháng còn lại"), FL("残り月数"), "label", err=["E69"], detail=T("表示のみ。通算12ヶ月までの残り。0ヶ月のときは「休止はお申し込みできません（解約をご案内します）」を出し、登録できない。", "Chỉ hiển thị. Số tháng còn lại đến tổng 12 tháng. Khi còn 0 tháng hiện 「休止はお申し込みできません（解約をご案内します）」 và không đăng ký được.")),
    F("5.6", T("休止したい期間", "Thời gian muốn tạm dừng"), FL("休止したい期間"), "select", "select", req="○", len=["選択（1ヶ月／2ヶ月／3ヶ月／6ヶ月のうち残り月数以内）", "Chọn (trong 1／2／3／6 tháng, không vượt số tháng còn lại)"], init=T("未選択", "Chưa chọn"), ex=["3ヶ月", "Thời gian tạm dừng (trong số tháng còn lại)"], err=["E02", "E69"], detail=T("残り月数を超える期間は選択肢に出ない（上限を超える入力は E69「休止は通算12ヶ月までです。残り{n}ヶ月を超える期間は選べません。」）。", "Thời gian vượt số tháng còn lại không hiện trong lựa chọn (nhập vượt giới hạn là E69 「休止は通算12ヶ月までです。残り{n}ヶ月を超える期間は選べません。」).")),
    F("5.7", T("再開予定月", "Tháng tiếp tục dự kiến"), FL("再開予定月"), "label", detail=T("表示のみ。開始したいご利用月と休止したい期間から決まる（「決まっていない」は選べない）。今回の休止後の通算・残りも出す。", "Chỉ hiển thị. Quyết định từ tháng muốn bắt đầu và thời gian muốn tạm dừng (không chọn được 「決まっていない」). Hiện cả tổng và số còn lại sau lần tạm dừng này.")),
    F("5.8", T("差し支えなければ詳しくお聞かせください", "Nếu được, xin cho biết chi tiết"), FL("差し支えなければ詳しくお聞かせください"), "textarea", "input", req="－", len="文字列 500（複数行）", init=T("空", "Trống"), ex=["2月から4月までオフィスを改装するため", "Chi tiết (tối đa 500 ký tự, nhiều dòng)"], err=["E04", "E13"], detail=_REASON500, demo_ok=T("コードは最大文字数（500）は止めるが、絵文字のチェックがない（宿題）。仕様が正", "Code chặn số ký tự tối đa (500) nhưng không kiểm tra emoji (việc cần sửa). Theo đặc tả")),
], full=True, wait=900, note=T("法人＝株式会社サンプル・拠点＝横浜営業所にチェック・休止の理由＝2つ目・開始＝2つ目のご利用月・設備＝置いたまま・期間＝6ヶ月。", "Pháp nhân = 株式会社サンプル, tick điểm = chi nhánh Yokohama, lý do = lựa chọn thứ 2, bắt đầu = tháng thứ 2, thiết bị = để lại, thời gian = 6 tháng."))
V055 = V("055", C5, T("休止：通算超過（登録できない）", "Tạm dừng: vượt tổng thời gian (không đăng ký được)"), "/ops/applications/proxy/stop", "", [
    F("5", T("通算超過のメッセージ", "Thông báo vượt tổng thời gian"), FL("残り月数"), "label", "show", err=["E69"], detail=T("通算の休止が12ヶ月に達している拠点は、残り月数に「0ヶ月　通算12ヶ月に達しているため、休止はお申し込みできません（解約をご案内します）」を出し、休止したい期間の選択肢が空になって登録できない。サーバーも同じ判定で止める（E69）。取消した休止は通算に入れない。", "Điểm đã đạt tổng 12 tháng tạm dừng: ô số tháng còn lại hiện 「0ヶ月　通算12ヶ月に達しているため、休止はお申し込みできません（解約をご案内します）」, lựa chọn thời gian trống nên không đăng ký được. Máy chủ cũng chặn theo cùng phán định (E69). Lần tạm dừng đã hủy không tính vào tổng."), demo_ok=H_NOSEED),
], wait=700, note=T("見本の拠点には、通算12ヶ月に達しているものがなく、この状態は作れない（画像は通常の画面）。", "Không điểm nào của dữ liệu mẫu đạt tổng 12 tháng nên không tạo được trạng thái này (ảnh là màn hình thường)."))
V056 = V("056", C5, T("再開（休止予定の取消）", "Tiếp tục (hủy bỏ tạm dừng dự kiến)"), "/ops/applications/proxy/stop", STOP("rsm", "CU00643") + "await sleep(300);", _STOP_COMMON + [
    F("5", T("再開するご利用月（休止予定の取消）", "Tháng sử dụng tiếp tục (hủy bỏ tạm dừng dự kiến)"), FL("再開するご利用月"), "label", detail=T("休止予定（承認済み・まだ始まっていない休止）の拠点を選ぶと、「休止予定の取消」になり、再開するご利用月は休止の開始月で決まる（表示のみ・休止期間0か月）。承認すると休止は始まらず、休止の履歴に『取消した休止（0か月）』を残して通算1年には入れない。取消にした子契約と納品予定は作り直すが、注文は戻らない（お客様がもう一度入れる）。", "Chọn điểm 休止予定 (đã duyệt, chưa bắt đầu tạm dừng) thì thành 「休止予定の取消」, tháng sử dụng tiếp tục do tháng bắt đầu tạm dừng quyết định (chỉ hiển thị, thời gian tạm dừng 0 tháng). Khi duyệt, tạm dừng không bắt đầu, lưu lịch sử 『取消した休止（0か月）』 và không tính vào tổng 1 năm. Hợp đồng con và lịch giao đã hủy sẽ được tạo lại nhưng order không quay lại (khách nhập lại).")),
    F("5.1", T("再開後のプラン", "Gói sau khi tiếp tục"), FL("再開後のプラン"), "select", "select", req="○", len="選択（プランマスタの公開中のプラン・コース）", init=T("未選択", "Chưa chọn"), ex=["100プラン（ESスタンダード）", "Gói sau khi tiếp tục"], err=["E02"], detail=T("休止前のプランを欄の下に出す。同じでも、変えてもよい。", "Hiện gói trước khi tạm dừng dưới ô. Giữ nguyên hay đổi đều được.")),
    F("5.2", T("休止前のご契約内容", "Nội dung hợp đồng trước khi tạm dừng"), FL("休止前のご契約内容"), "select", "select", req="○", len=["選択（変更なし／変更あり）", "Chọn (không đổi／có thay đổi)"], init=T("未選択", "Chưa chọn"), ex=["変更なし", "Nội dung hợp đồng trước tạm dừng"], err=["E02"], detail=T("コース・配送・設備・お届け先・ご担当者・請求書。休止前の内容を欄の下に出す。", "Khóa・giao hàng・thiết bị・nơi giao・người phụ trách・hóa đơn. Hiện nội dung trước tạm dừng dưới ô.")),
    F("5.3", T("ご要望", "Yêu cầu"), FL("ご要望"), "textarea", "input", req="－", len="文字列 500（複数行）", init=T("空", "Trống"), ex=["冷蔵庫は休止前と同じ場所に設置してください", "Yêu cầu (tối đa 500 ký tự, nhiều dòng)"], err=["E04", "E13"], detail=_REASON500, demo_ok=T("コードは最大文字数（500）は止めるが、絵文字のチェックがない（宿題）。仕様が正", "Code chặn số ký tự tối đa (500) nhưng không kiểm tra emoji (việc cần sửa). Theo đặc tả")),
], full=True, wait=900, note=T("法人＝株式会社サンプル・拠点＝CU00643（休止予定）にチェック。", "Pháp nhân = 株式会社サンプル, tick điểm CU00643 (休止予定)."))
V057 = V("057", C5, T("解約（解約日・残った商品の扱い）", "Hủy (ngày hủy・cách xử lý sản phẩm còn lại)"), "/ops/applications/proxy/stop", STOP("cxl", "CU00950") + "pick('解約日',0);pick('解約の理由',1);pick('残った商品',0);await sleep(600);", _STOP_COMMON + [
    F("5", T("拠点ごとのご希望の内容", "Nội dung mong muốn theo từng điểm"), ".nf-br", "area", detail=T("選んだ拠点ごとに1枚。複数拠点のときは、2枚目以降に「{1枚目の拠点名} と同じ内容を入れる」ボタンを出す。", "Mỗi điểm đã chọn 1 thẻ. Khi nhiều điểm, từ thẻ thứ 2 hiện nút 「{tên điểm thẻ 1} と同じ内容を入れる」.")),
    F("5.1", T("解約日", "Ngày hủy"), FL("解約日"), "select", "select", req="○", len=["選択（選べる最短の解約日以降。「{日}（{月}分の末日）　適用月 {月}分（申込締切 {日}）」）", "Chọn (từ ngày hủy sớm nhất chọn được. 「{ngày}（ngày cuối của {tháng}）　tháng áp dụng {tháng}（hạn chốt đăng ký {ngày}）」)"], init=T("未選択", "Chưa chọn"), ex=["2026-12-06（2026年11月分の末日）　適用月 2026年12月分（申込締切 2026-11-15）", "Ngày hủy (từ ngày hủy sớm nhất chọn được)"], err=["E02", "E68"], detail=T("解約日＝適用月の前のサイクルの末日（日割りなし）。締切（既定は前月15日）までの申込は翌月から、締切を過ぎると翌々月から適用する。最短の解約日より前は選択肢に出ない。自販機の拠点も同じ締切。選択肢は受付日から決める（受付日を変えると選び直す）。各サイクルの末日はサイクル暦（納品サイクル）の値（hong 2026-10-08 Q24）。", "Ngày hủy = ngày cuối của chu kỳ trước tháng áp dụng (không tính theo ngày). Đơn trước hạn chốt (mặc định ngày 15 tháng trước) áp dụng từ tháng kế tiếp, quá hạn thì từ tháng sau nữa. Ngày trước ngày hủy sớm nhất không hiện trong lựa chọn. Điểm máy bán hàng cũng cùng hạn chốt. Lựa chọn tính từ ngày tiếp nhận (đổi ngày tiếp nhận thì chọn lại). Ngày cuối của mỗi chu kỳ lấy theo lịch chu kỳ (chu kỳ giao hàng) (hong 2026-10-08 Q24)."), open=T("2026年12月サイクルの末日がコードの表では 2027/01/10、サイクル暦では 2027/01/03 と食い違っていた。暦に合わせて直したが、正しい末日はどちらか（確認メモ Part 5 Q24）", "Ngày cuối của chu kỳ tháng 12/2026 là 2027/01/10 trong bảng của code nhưng 2027/01/03 trong lịch chu kỳ. Đã sửa theo lịch, cần xác nhận ngày cuối đúng là ngày nào (確認メモ Part 5 Q24)"), ask="hong／開発（確認メモ Part 5 Q24）"),
    F("5.2", T("解約の理由", "Lý do hủy"), FL("解約の理由"), "select", "select", req="○", len=["選択（拠点の閉鎖・統合／ご利用人数の減少／費用の見直し／他社サービスへの切替／その他）", "Chọn (đóng, hợp nhất điểm／giảm số người dùng／xem lại chi phí／chuyển sang dịch vụ khác／khác)"], init=T("未選択", "Chưa chọn"), ex=["拠点の閉鎖・統合", "Lý do hủy"], err=["E02"], open=T("解約の理由ごとの引き止め（理由の選択肢）：法人Webと同じ選択（客先に確認）", "Giữ chân theo lý do hủy (lựa chọn lý do): cùng lựa chọn với Web pháp nhân (hỏi khách)"), ask="お客様（運用）"),
    F("5.3", T("残った商品（在庫）の扱い", "Cách xử lý sản phẩm còn lại (tồn kho)"), FL("残った商品（在庫）の扱い"), "select", "select", req="○", len="選択（全て買取／返却（全部・元払い））", init=T("未選択", "Chưa chọn"), ex=["全て買取（最終のご請求書に買取として載せます）", "Cách xử lý sản phẩm còn lại khi hủy"], err=["E02"], detail=T("全て買取＝最終の請求書に買取の行／返却＝全部・元払い（買取の行なし・管理ロスなし）。商品ごとには分けない。どちらも最後の棚卸報告は必須。", "Mua lại toàn bộ = dòng mua lại trong hóa đơn cuối / Trả lại = toàn bộ・người gửi trả phí (không có dòng mua lại・không tổn thất quản lý). Không tách theo sản phẩm. Cả hai đều bắt buộc báo cáo kiểm kê cuối cùng.")),
    F("5.4", T("差し支えなければ詳しくお聞かせください", "Nếu được, xin cho biết chi tiết"), FL("差し支えなければ詳しくお聞かせください"), "textarea", "input", req="－", len="文字列 500（複数行）", init=T("空", "Trống"), ex=["店舗の閉店のため", "Chi tiết (tối đa 500 ký tự, nhiều dòng)"], err=["E04", "E13"], detail=_REASON500, demo_ok=T("コードは最大文字数（500）は止めるが、絵文字のチェックがない（宿題）。仕様が正", "Code chặn số ký tự tối đa (500) nhưng không kiểm tra emoji (việc cần sửa). Theo đặc tả")),
], full=True, wait=900, note=T("法人＝株式会社サンプル・拠点＝横浜営業所にチェック・解約日＝最短・理由＝2つ目・在庫＝全て買取。", "Pháp nhân = 株式会社サンプル, tick điểm = chi nhánh Yokohama, ngày hủy = sớm nhất, lý do = lựa chọn thứ 2, tồn kho = mua lại toàn bộ."))
V058 = V("058", C5, T("休止・解約：複数拠点を選ぶ（拠点ごとに内容を入れる）", "Tạm dừng・hủy: chọn nhiều điểm (nhập nội dung theo từng điểm)"), "/ops/applications/proxy/stop", STOP("cxl", "CU00950") + "chkId('CU00961');await sleep(600);", [
    F("5", T("2つ目の拠点のカード", "Thẻ của điểm thứ 2"), ".nf-br:nth-of-type(2), .card.nf-br + .card.nf-br", "area", detail=T("拠点を2つ以上選ぶと、拠点ごとにご希望の内容のカードが並ぶ（契約変更タブと同じ）。2枚目以降に「{1枚目の拠点名} と同じ内容を入れる」ボタンを出す。登録すると、開始月・内容が同じ拠点は1件の申請にまとめ、違えば申請を分ける（法人Webと同じ）。", "Chọn từ 2 điểm trở lên thì mỗi điểm có 1 thẻ nội dung mong muốn (giống tab thay đổi hợp đồng). Từ thẻ thứ 2 hiện nút 「{tên điểm thẻ 1} と同じ内容を入れる」. Khi đăng ký, các điểm có tháng bắt đầu・nội dung giống nhau gộp thành 1 đơn, khác nhau thì tách đơn (giống Web pháp nhân).")),
], wait=900, note=T("解約で、横浜営業所と千葉営業所の2拠点にチェックしたところ。", "Ở 解約, đã tick 2 điểm: chi nhánh Yokohama và chi nhánh Chiba."))
V059 = V("059", C5, T("入力エラー（必須が空のまま登録）", "Lỗi nhập (đăng ký khi mục bắt buộc còn trống)"), "/ops/applications/proxy/change", JS + "btn('登録').click();await sleep(800);", [
    F("4", T("エラーの項目", "Mục lỗi"), ".fld.bad", "label", "show", err=["E01", "E02"], pattern="P-FORM", detail=T("「登録」で全項目をまとめてチェックし、エラーの項目を赤枠にして項目の下にその文言を出す（必須は E01・選択は E02）。最初のエラーの所までスクロールする。コードは「{項目名}を入力してください」とトースト「入力されていない項目があります（n件）」も出す（宿題 H12）。", "Bấm 「登録」 kiểm tra gộp mọi mục, mục lỗi viền đỏ và hiện câu lỗi dưới mục (bắt buộc E01, chọn E02). Cuộn tới lỗi đầu tiên. Code hiện 「{項目名}を入力してください」 và cả toast 「入力されていない項目があります（n件）」 (việc cần sửa H12)."), demo_ok=T("コードの文言は「〜を入力してください」とトースト。仕様は共通メッセージで項目の下だけ（宿題 H12）", "Câu trong code là 「〜を入力してください」 và toast. Đặc tả dùng thông báo chung, chỉ dưới mục (việc cần sửa H12)")),
], wait=800)
V060 = V("060", C5, T("破棄の確認（Q02）", "Xác nhận hủy bỏ (Q02)"), "/ops/applications/proxy/change", PRE5 + "sel('受付経路','電話');await sleep(300);btn('キャンセル').click();await sleep(800);", [
    F("4", T("破棄の確認", "Xác nhận hủy bỏ"), ".es-modal__panel", "modal", err=["Q02"], detail=T("入力を変えたあとに「キャンセル」・パンくず・ほかの画面への移動・ブラウザを閉じる／再読み込み をしたときに出す。[キャンセル（続ける）][破棄]。", "Hiện khi đã sửa rồi bấm 「キャンセル」, breadcrumb, chuyển màn hình, đóng / tải lại trình duyệt. [キャンセル（続ける）][破棄]."), demo_ok=T("コードの文言は Q02 と違う（[msg]）", "Câu trong code khác Q02 ([msg])")),
], wait=800)

# ====================================================================== AW_APPL_006 新規申込CSV取込
C6 = "AW_APPL_006"
CSV_JS_HEAD = ("const res=await fetch('/api/domain/csv/template',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json','x-es-site':'ops'},body:JSON.stringify({args:{entity:'newApplications'}})});"
               "const t=await res.json();let head=t.head.slice();let rows=t.rows.map(r=>r.slice());let fname='新規申込_取込テスト.csv';let ftype='text/csv';let blob=null;const ci=h=>head.findIndex(x=>x.startsWith(h));")
CSV_JS_TAIL = ("const esc=v=>'\"'+String(v??'').replace(/\"/g,'\"\"')+'\"';const text='\\ufeff'+[head,...rows].map(r=>r.map(esc).join(',')).join('\\r\\n');"
               "const inp=document.querySelector('.csvpage input[type=file]');const dt=new DataTransfer();dt.items.add(new File([blob||text],fname,{type:ftype}));inp.files=dt.files;inp.dispatchEvent(new Event('change',{bubbles:true}));await sleep(2500);")
CSV_ROWS_OK = "rows[0][0]='A';rows[1][0]='A';"
CSV_ROWS_ERR = (CSV_ROWS_OK + "const r2=rows[0].slice();r2[0]='B';r2[ci('プラン')]='ES999999';rows.push(r2);"
                "const r3=rows[0].slice();r3[0]='C';rows.push(r3);const r4=rows[0].slice();r4[0]='C';r4[ci('法人名')]='違う名前';rows.push(r4);")
CSV_MK = lambda mods: JS + CSV_JS_HEAD + mods + CSV_JS_TAIL

# 列の定義（lib/csv/apply.ts の COLS と同じ順）：(ラベル, vi, 法人・申込の列か, 必須か, 型・桁数, 選択肢/注記, データ例, 例の説明)
_COLS = [
    ("法人キー", "Khóa pháp nhân", 1, 1, "文字列", "同じ申込にまとめる目印（CSV の中だけで使う任意の文字）", "A", "Dấu hiệu gộp các dòng thành cùng một đơn (ký tự tùy ý chỉ dùng trong CSV)"),
    ("受付経路", "Kênh tiếp nhận", 1, 1, "選択（電話／営業（訪問）／紙の申込書／メール／その他）", "運営だけの項目", "電話", "Kênh tiếp nhận (điện thoại)"),
    ("ES営業担当", "Nhân viên kinh doanh ES", 1, 0, "文字列 50", "運営アカウントの名前", "田中 健一", "Nhân viên kinh doanh phụ trách (tên tài khoản vận hành)"),
    ("契約区分", "Loại hợp đồng", 0, 1, "選択（本導入／お試し）", "切替（お試し→本導入）は CSV では受けられない（E71）。同じ法人キーの行は同じ契約区分（本導入とお試しは別の申込）", "本導入", "Loại hợp đồng (chính thức)"),
    ("お試し期間月数", "Số tháng dùng thử", 0, 0, "整数 1〜12", "お試しのとき必須", "1", "Số tháng dùng thử (1〜12)"),
    ("アカウントを発行するか", "Có cấp tài khoản không", 1, 1, "選択（1／0）", "1＝する／0＝しない", "1", "1 = cấp tài khoản, 0 = không cấp"),
    ("法人ID", "ID pháp nhân", 1, 0, "文字列 CU＋5桁", "今ある法人に拠点を足すとき。空欄＝新しい法人。見つからない・取消の法人は行エラー", "CU00001", "ID pháp nhân có sẵn khi thêm điểm (để trống = pháp nhân mới)"),
    ("法人名", "Tên pháp nhân", 1, 0, "文字列 60", "新しい法人のとき必須", "株式会社サンプルフーズ", "Tên pháp nhân (tối đa 60 ký tự)"),
    ("法人名フリガナ", "Furigana tên pháp nhân", 1, 0, "文字列 60", "新しい法人のとき必須。全角カタカナ", "カブシキガイシャサンプルフーズ", "Furigana bằng Katakana toàn góc"),
    ("請求先法人名", "Tên pháp nhân nhận hóa đơn", 1, 0, "文字列 60", "新しい法人のとき必須", "株式会社サンプルフーズ 経理部", "Tên pháp nhân nhận hóa đơn"),
    ("法人の郵便番号", "Mã bưu chính của pháp nhân", 1, 0, "文字列 8", "新しい法人のとき必須。数字7桁（ハイフンは任意）", "105-0011", "Mã bưu chính 7 chữ số"),
    ("法人の都道府県", "Tỉnh / thành của pháp nhân", 1, 0, "文字列 10", "新しい法人のとき必須。47都道府県", "東京都", "Tỉnh / thành"),
    ("法人の市区町村・番地", "Quận / huyện・số nhà của pháp nhân", 1, 0, "文字列 100", "新しい法人のとき必須。市区町村と番地は最後の市・区・町・村で切って分ける", "港区芝公園1-2-3", "Quận / huyện và số nhà"),
    ("法人の建物", "Tòa nhà của pháp nhân", 1, 0, "文字列 100", "任意", "芝パークビル8F", "Tên tòa nhà (tùy chọn)"),
    ("法人の電話番号", "Điện thoại của pháp nhân", 1, 0, "文字列 20", "新しい法人のとき必須。数字とハイフン・10〜11桁", "03-5401-2200", "Số điện thoại"),
    ("法人のFAX番号", "FAX của pháp nhân", 1, 0, "文字列 20", "任意", "03-5401-2201", "Số FAX (tùy chọn)"),
    ("法人の支払い方法", "Phương thức thanh toán của pháp nhân", 1, 0, "選択（口座振替／銀行振込／クレジットカード）", "新しい法人のとき必須", "口座振替", "Phương thức thanh toán"),
    ("法人の支払サイクル", "Chu kỳ thanh toán của pháp nhân", 1, 0, "選択（月払い／年払い）", "新しい法人のとき必須", "月払い", "Chu kỳ thanh toán"),
    ("請求書の発行時期", "Thời điểm phát hành hóa đơn", 1, 0, "選択（3ヶ月前／2ヶ月前／1ヶ月前／当月／翌月（後払い））", "新しい法人のとき必須", "1ヶ月前", "Thời điểm phát hành hóa đơn so với tháng chu kỳ"),
    ("法人メイン担当者名", "Tên người phụ trách chính của pháp nhân", 1, 0, "文字列 60", "新しい法人のとき必須", "山田 太郎", "Tên người phụ trách chính"),
    ("法人メイン担当者フリガナ", "Furigana người phụ trách chính của pháp nhân", 1, 0, "文字列 60", "新しい法人のとき必須。全角カタカナ", "ヤマダ タロウ", "Furigana bằng Katakana toàn góc"),
    ("法人メイン担当者メール", "Email người phụ trách chính của pháp nhân", 1, 0, "文字列 200", "新しい法人のとき必須。x@y.z の形（E07）", "yamada@example.jp", "Email người phụ trách chính"),
    ("法人メイン担当者電話", "Điện thoại người phụ trách chính của pháp nhân", 1, 0, "文字列 20", "新しい法人のとき必須", "03-0000-0001", "Điện thoại người phụ trách chính"),
    ("法人請求担当者名", "Tên người phụ trách hóa đơn của pháp nhân", 1, 0, "文字列 60", "空欄＝メイン担当者と同じ", "経理 花子", "Tên người phụ trách hóa đơn (để trống = giống người chính)"),
    ("法人請求担当者フリガナ", "Furigana người phụ trách hóa đơn của pháp nhân", 1, 0, "文字列 60", "任意", "ケイリ ハナコ", "Furigana người phụ trách hóa đơn"),
    ("法人請求担当者メール", "Email người phụ trách hóa đơn của pháp nhân", 1, 0, "文字列 200", "任意。x@y.z の形（E07）", "keiri@example.jp", "Email người phụ trách hóa đơn"),
    ("法人請求担当者電話", "Điện thoại người phụ trách hóa đơn của pháp nhân", 1, 0, "文字列 20", "任意", "03-0000-0003", "Điện thoại người phụ trách hóa đơn"),
    ("お申し込み者", "Người đăng ký", 1, 1, "文字列 200", "法人・拠点の担当者のメールアドレスのどれか（申込フォーム §5-3・A2）", "yamada@example.jp", "Người đăng ký (một trong email của người phụ trách)"),
    ("設備タイプ", "Loại thiết bị", 0, 1, "選択（冷蔵庫・冷凍庫／自動販売機）", "自動販売機は設置フロアが必須・配送方法は ES配送便", "冷蔵庫・冷凍庫", "Loại thiết bị"),
    ("プラン", "Gói", 0, 1, "文字列（プランID）", "プランマスタの公開中のプランID（例 ES000004）。公開中でなければ行エラー", "ES000004", "ID gói đang công khai"),
    ("コース", "Khóa", 0, 1, "選択（ESライト／ESスタンダード）", "プランにないコースは行エラー", "ESスタンダード", "Khóa (loại menu)"),
    ("配送方法", "Phương thức giao", 0, 1, "選択（ES配送便／COOL便）", "自動販売機は ES配送便", "ES配送便", "Phương thức giao"),
    ("配送回数（月）", "Số lần giao (tháng)", 0, 1, "整数 1〜8", "プラン標準／＋1回／＋2回の回数", "2", "Số lần giao mỗi tháng"),
    ("契約開始希望年月", "Tháng bắt đầu hợp đồng mong muốn", 0, 0, "年月 yyyy-mm", "本導入のとき必須", "2027-01", "Tháng bắt đầu hợp đồng mong muốn (yyyy-mm)"),
    ("設置フロア", "Tầng lắp đặt", 0, 0, "文字列 60", "自動販売機は必須", "2F 休憩室", "Tầng / vị trí lắp đặt"),
    ("オプション", "Tùy chọn", 0, 0, "文字列 200", "オプションコードを ; でつなぐ（申込に出せるものだけ。ES-QR 利用料は不可）", "OP000007", "Mã tùy chọn nối bằng dấu ;"),
    ("消費期限の短い商品の扱い", "Cách xử lý sản phẩm hạn ngắn", 0, 1, "選択（通常／短消費期限なし）", "短消費期限なし＝自動注文に入れない", "通常", "Cách xử lý sản phẩm hạn ngắn"),
    ("プラン外の備考", "Ghi chú ngoài gói", 0, 0, "文字列 500", "任意", "搬入は裏口からお願いします", "Ghi chú ngoài gói (tối đa 500 ký tự)"),
    ("納品先名", "Tên nơi giao", 0, 1, "文字列 60", "", "東京本社", "Tên điểm giao hàng"),
    ("納品先名フリガナ", "Furigana tên nơi giao", 0, 1, "文字列 60", "全角カタカナ", "トウキョウホンシャ", "Furigana bằng Katakana toàn góc"),
    ("納品先の郵便番号", "Mã bưu chính nơi giao", 0, 1, "文字列 8", "数字7桁（ハイフンは任意）", "100-0001", "Mã bưu chính 7 chữ số"),
    ("納品先の都道府県", "Tỉnh / thành nơi giao", 0, 1, "文字列 10", "47都道府県", "東京都", "Tỉnh / thành"),
    ("納品先の市区町村・番地", "Quận / huyện・số nhà nơi giao", 0, 1, "文字列 100", "", "千代田区千代田1-1", "Quận / huyện và số nhà"),
    ("納品先の建物", "Tòa nhà nơi giao", 0, 0, "文字列 100", "任意", "サンプルビル5F", "Tên tòa nhà (tùy chọn)"),
    ("納品先の電話番号", "Điện thoại nơi giao", 0, 1, "文字列 20", "数字とハイフン・10〜11桁", "03-0000-0002", "Số điện thoại"),
    ("納品先のFAX番号", "FAX nơi giao", 0, 0, "文字列 20", "任意", "03-0000-0004", "Số FAX (tùy chọn)"),
    ("従業員数概算", "Số nhân viên ước tính", 0, 1, "整数 0〜99999", "", "120", "Số nhân viên ước tính"),
    ("納品不可曜日", "Ngày không giao được", 0, 0, "文字列 50", "「月;水」のように ; でつなぐ", "土;日", "Các thứ không giao được nối bằng dấu ;"),
    ("納品不可になった場合", "Khi ngày giao không được", 0, 1, "選択（前倒す／後ろ倒す）", "", "前倒す", "Cách xử lý khi ngày giao không được"),
    ("配送の希望", "Mong muốn giao hàng", 0, 0, "文字列 200", "任意", "午前中の配送を希望", "Mong muốn giao hàng"),
    ("請求書", "Hóa đơn", 0, 1, "選択（法人に請求／この拠点に請求）", "", "法人に請求", "Nơi nhận hóa đơn"),
    ("拠点の支払方法", "Phương thức thanh toán của điểm", 0, 0, "選択（口座振替／銀行振込／クレジットカード）", "この拠点に請求のとき必須", "口座振替", "Phương thức thanh toán của điểm"),
    ("拠点の支払サイクル", "Chu kỳ thanh toán của điểm", 0, 0, "選択（月払い／年払い）", "この拠点に請求のとき必須", "月払い", "Chu kỳ thanh toán của điểm"),
    ("拠点メイン担当者名", "Tên người phụ trách chính của điểm", 0, 0, "文字列 60", "空欄＝法人のメイン担当者と同じ", "鈴木 花子", "Tên người phụ trách chính của điểm"),
    ("拠点メイン担当者フリガナ", "Furigana người phụ trách chính của điểm", 0, 0, "文字列 60", "任意", "スズキ ハナコ", "Furigana người phụ trách chính của điểm"),
    ("拠点メイン担当者メール", "Email người phụ trách chính của điểm", 0, 0, "文字列 200", "任意。x@y.z の形（E07）", "suzuki@example.jp", "Email người phụ trách chính của điểm"),
    ("拠点メイン担当者電話", "Điện thoại người phụ trách chính của điểm", 0, 0, "文字列 20", "任意", "03-0000-0005", "Điện thoại người phụ trách chính của điểm"),
]
NOTE_VI = {'1＝する／0＝しない': '1 = cấp, 0 = không cấp',
    '47都道府県': '47 tỉnh thành',
    '「月;水」のように ; でつなぐ': 'Nối bằng dấu ; (ví dụ 「月;水」)',
    'お試しのとき必須': 'Bắt buộc khi dùng thử',
    'この拠点に請求のとき必須': 'Bắt buộc khi xuất hóa đơn cho điểm này',
    'オプションコードを ; でつなぐ（申込に出せるものだけ。ES-QR 利用料は不可）': 'Nối mã tùy chọn bằng dấu ; (chỉ loại hiện được khi đăng ký; không dùng phí ES-QR)',
    'プランにないコースは行エラー': 'Khóa không có trong gói là lỗi dòng',
    'プランマスタの公開中のプランID（例 ES000004）。公開中でなければ行エラー': 'ID gói đang công khai trong master gói (ví dụ ES000004). Không công khai là lỗi dòng',
    'プラン標準／＋1回／＋2回の回数': 'Số lần: tiêu chuẩn của gói / +1 lần / +2 lần',
    '今ある法人に拠点を足すとき。空欄＝新しい法人。見つからない・取消の法人は行エラー': 'Khi thêm điểm vào pháp nhân có sẵn. Để trống = pháp nhân mới. Pháp nhân không tìm thấy・đã hủy là lỗi dòng',
    '任意': 'Tùy chọn',
    '任意。x@y.z の形（E07）': 'Tùy chọn. Dạng x@y.z (E07)',
    '全角カタカナ': 'Katakana toàn góc',
    '切替（お試し→本導入）は CSV では受けられない（E71）。同じ法人キーの行は同じ契約区分（本導入とお試しは別の申込）': 'Không nhận 切替 (dùng thử → chính thức) qua CSV (E71). Các dòng cùng khóa pháp nhân phải cùng loại hợp đồng (chính thức và dùng thử là đơn riêng)',
    '同じ申込にまとめる目印（CSV の中だけで使う任意の文字）': 'Dấu hiệu gộp vào cùng một đơn (ký tự tùy ý chỉ dùng trong CSV)',
    '数字7桁（ハイフンは任意）': '7 chữ số (gạch ngang tùy chọn)',
    '数字とハイフン・10〜11桁': 'Số và dấu gạch ngang, 10〜11 chữ số',
    '新しい法人のとき必須': 'Bắt buộc khi pháp nhân mới',
    '新しい法人のとき必須。47都道府県': 'Bắt buộc khi pháp nhân mới. 47 tỉnh thành',
    '新しい法人のとき必須。x@y.z の形（E07）': 'Bắt buộc khi pháp nhân mới. Dạng x@y.z (E07)',
    '新しい法人のとき必須。全角カタカナ': 'Bắt buộc khi pháp nhân mới. Katakana toàn góc',
    '新しい法人のとき必須。市区町村と番地は最後の市・区・町・村で切って分ける': 'Bắt buộc khi pháp nhân mới. Tách quận / huyện và số nhà tại 市・区・町・村 cuối cùng',
    '新しい法人のとき必須。数字7桁（ハイフンは任意）': 'Bắt buộc khi pháp nhân mới. 7 chữ số (gạch ngang tùy chọn)',
    '新しい法人のとき必須。数字とハイフン・10〜11桁': 'Bắt buộc khi pháp nhân mới. Số và dấu gạch ngang, 10〜11 chữ số',
    '本導入のとき必須': 'Bắt buộc khi chính thức',
    '法人・拠点の担当者のメールアドレスのどれか（申込フォーム §5-3・A2）': 'Một trong email của người phụ trách pháp nhân・điểm (申込フォーム §5-3・A2)',
    '短消費期限なし＝自動注文に入れない': 'Không hạn ngắn = không đưa vào order tự động',
    '空欄＝メイン担当者と同じ': 'Để trống = giống người phụ trách chính',
    '空欄＝法人のメイン担当者と同じ': 'Để trống = giống người phụ trách chính của pháp nhân',
    '自動販売機は ES配送便': 'Máy bán hàng dùng chuyến ES',
    '自動販売機は必須': 'Bắt buộc với máy bán hàng',
    '自動販売機は設置フロアが必須・配送方法は ES配送便': 'Máy bán hàng: bắt buộc tầng lắp đặt, phương thức giao là chuyến ES',
    '運営だけの項目': 'Mục chỉ dành cho vận hành',
    '運営アカウントの名前': 'Tên tài khoản vận hành'}
LEN_JA = {"文字列": "Chuỗi", "整数": "Số nguyên", "選択": "Chọn", "年月": "Năm-tháng"}


def _len(s):
    return [s, _lv(s)]


def _csv_cols():
    out = []
    for i, (ja, vi, corp, req, ln, note, ex, exvi) in enumerate(_COLS, 1):
        kind = "select" if ln.startswith("選択") else ("month" if ln.startswith("年月") else "text")
        key = i == 1
        detail = T("取込の列 %d。" % i, "Cột nhập số %d." % i) if False else None
        detail = (T("法人・申込の列（同じ法人キーの行で1つ。最初の行の値を使い、ほかの行は空欄か同じ値。違えば E70）。", "Cột của pháp nhân・đơn (1 giá trị cho các dòng cùng khóa pháp nhân. Dùng giá trị dòng đầu, các dòng khác để trống hoặc giống; khác thì E70).") if corp else T("拠点の列（1行＝1拠点）。", "Cột của điểm (1 dòng = 1 điểm)."))
        valid = T(note, NOTE_VI[note]) if note else T("特になし", "Không có")
        kw = {"req": "○" if req else "－", "len": _len(ln), "init": T("空", "Trống"), "ex": [ex, exvi], "valid": valid, "detail": detail}
        errs = ["E01"] if req else []
        if kind == "select": errs.append("E02")
        if "メール" in ja: errs.append("E07")
        if "電話" in ja or "FAX" in ja: errs.append("E06")
        if "郵便番号" in ja: errs.append("E05")
        if corp and not key: errs.append("E70")
        if ja == "契約区分": errs.append("E71")
        errs += ["E04"] if ("文字列" in ln and any(c.isdigit() for c in ln)) else []
        kw["err"] = [e for i2, e in enumerate(errs) if e not in errs[:i2]]
        out.append(F("2.%d" % (i + 1), T(ja, vi), "-", kind, "input", **kw))
    return out


CSV_COLS = _csv_cols()
CSV_HEAD = [
    F("1", T("ヘッダー", "Phần đầu trang"), ".csvph", "area", detail=T("一覧（新規契約タブ）の「CSV取込」（AW_APPL_001 の 1.4）から開く画面（モーダルではない）。パンくず・画面名・キャンセル。フル権限だけが開ける（台帳 F 運営A Q3）。名称は「新規申込CSV取込」。", "Màn hình mở từ 「CSV取込」 (AW_APPL_001, mục 1.4) của danh sách (tab đơn mới) (không phải modal). Breadcrumb, tên màn hình, hủy. Chỉ vai trò toàn quyền mở được (sổ F 運営A Q3). Tên là 「新規申込CSV取込」.")),
    F("1.1", T("パンくず", "Breadcrumb"), ".crumb", "label", detail=T("「契約申請管理 / 新規申込CSV取込」。「契約申請管理」は一覧へ戻るリンク。", "「契約申請管理 / 新規申込CSV取込」. 「契約申請管理」 là liên kết quay về danh sách.")),
    F("1.2", T("画面名", "Tên màn hình"), ".csvph h1", "label", detail=T("画面名は「新規申込CSV取込」。", "Tên màn hình là 「新規申込CSV取込」.")),
    F("1.3", T("キャンセル", "Hủy"), ".csvph .btns button.out::キャンセル", "button", "click", detail=T("契約申請管理（新規契約タブ）へ戻る。何も登録しない。", "Về quản lý đơn hợp đồng (tab đơn mới). Không đăng ký gì.")),
    F("2", T("CSVテンプレートの列（定義。画面には出さない）", "Cột của CSV mẫu (định nghĩa; không hiển thị trên màn hình)"), "-", "area",
      detail=T("取り込むファイルの列の定義（1行目の見出し・この順。必須でない列は見出しに【注記】が付く＝外してよい）。1行＝1拠点。同じ「法人キー」の行を1つの申込にまとめ、法人・申込の列は最初の行の値を使う（違えば E70）。法人IDを入れると今ある法人に拠点を足す。切替（お試し→本導入）の行は受けない（E71。画面から登録）。取り込むと申込ごとに「受付中」（受付経路＝入れた値）ができ、あとは画面から来た申込と同じ流れ（AW_INTK_001）で進める。CSV から直接 仮登録・本登録はしない。添付ファイルは CSV に入れない（登録後に申請詳細で添付）。UTF-8（BOM 可）・5,000行まで。エラーを含む法人キーの申込は取り込まず、ほかの申込を登録する（台帳 F）。画面にはテンプレートのボタンを出さず、列の定義はこの項目定義に書く（台帳 F 2026-10-06 (6)）。テンプレートの写しは docs/05_画面設計書/CSVテンプレート/newApplications.csv。", "Định nghĩa cột của tệp nhập (dòng 1 = tiêu đề, theo thứ tự này; cột không bắt buộc có 【ghi chú】 ở tiêu đề = được bỏ). 1 dòng = 1 điểm. Các dòng cùng 「法人キー」 gộp thành 1 đơn, cột của pháp nhân・đơn dùng giá trị dòng đầu (khác thì E70). Nhập ID pháp nhân thì thêm điểm vào pháp nhân có sẵn. Không nhận dòng 切替 (dùng thử → chính thức) (E71; đăng ký trên màn hình). Nhập xong mỗi đơn thành 「受付中」 (kênh tiếp nhận = giá trị đã nhập), sau đó tiếp tục theo luồng giống đơn từ màn hình (AW_INTK_001). Không đăng ký tạm・đăng ký chính thức trực tiếp từ CSV. Không đưa tệp đính kèm vào CSV (đính kèm ở chi tiết đơn sau khi đăng ký). UTF-8 (có BOM được), tối đa 5.000 dòng. Đơn của khóa pháp nhân có lỗi không nhập, các đơn khác vẫn đăng ký (sổ F). Không đặt nút mẫu trên màn hình, định nghĩa cột ghi trong định nghĩa mục này (sổ F 2026-10-06 (6)). Bản sao mẫu ở docs/05_画面設計書/CSVテンプレート/newApplications.csv."),
      demo_ok=T("テンプレートの写し（CSVテンプレート/newApplications.csv）はまだ作っていない。コードの説明の中に「テンプレート（CSV）」のリンクがある（台帳 F はボタンを置かない・宿題）", "Bản sao mẫu (CSVテンプレート/newApplications.csv) chưa tạo. Trong phần giải thích của code có liên kết 「テンプレート（CSV）」 (sổ F không đặt nút; việc cần sửa)")),
] + CSV_COLS
_N = len(CSV_COLS) + 2
CSV_STEP1 = [
    F("3", T("ファイルを選ぶ（ステップ1）", "Chọn tệp (bước 1)"), "#sec-csv", "area", pattern="P-CSV", detail=T("2ステップ：① ファイルを選ぶ → ② 確認・登録（P-CSV）。選ぶとすぐ確かめて（何も保存しない）ステップ2へ進む。", "2 bước: ① chọn tệp → ② xác nhận・đăng ký (P-CSV). Chọn xong kiểm tra ngay (không lưu gì) rồi sang bước 2.")),
    F("3.1", T("手順", "Quy trình"), "-", "label", detail=T("1 ファイルを選ぶ → 2 確認・登録（カードの外・中央）。今の手順を濃く、済んだ手順を緑に。", "1 chọn tệp → 2 xác nhận・đăng ký (ngoài thẻ, ở giữa). Bước hiện tại đậm, bước đã xong màu xanh lá."), demo_ok=T("コードの手順の表示（ol.steps）は、この画面では非表示（display:none）になっていて画面に出ない（宿題）。仕様は手順を出す（P-CSV）", "Hiển thị quy trình (ol.steps) trong code bị ẩn (display:none) trên màn hình này nên không hiện (việc cần sửa). Đặc tả hiện quy trình (P-CSV)")),
    F("3.2", T("説明", "Giải thích"), "#sec-csv .hint", "label", detail=T("箇条書き：1行＝1拠点・法人キーが同じ行は1つの申込／添付ファイルは送れない／UTF-8・5,000行まで・エラーを含む法人キーの申込は取り込まず、ほかを登録。", "Gạch đầu dòng: 1 dòng = 1 điểm, các dòng cùng khóa pháp nhân là 1 đơn / không gửi được tệp đính kèm / UTF-8, tối đa 5.000 dòng, đơn của khóa pháp nhân có lỗi không nhập, các đơn khác đăng ký."), demo_ok=T("コードの説明にテンプレート（CSV）のリンクがある（台帳 F はテンプレートのボタンを置かない・宿題）", "Phần giải thích trong code có liên kết mẫu (CSV) (sổ F không đặt nút mẫu; việc cần sửa)")),
    F("3.3", T("ファイルを選ぶ", "Chọn tệp"), "#sec-csv button.out::ファイルを選ぶ", "file", "input", req="○", len=["CSV（UTF-8・.csv）1ファイル", "CSV (UTF-8, .csv) 1 tệp"], init=T("なし", "Chưa có"), ex=["新規申込_取込テスト.csv", "Tên tệp CSV (UTF-8) theo cột của mẫu"], err=["E51", "E113", "E106", "E107"],
      detail=T("ファイルを選ぶか、枠にドラッグ＆ドロップ。.csv 以外・UTF-8 以外は E51（状態 063）、データの行がないファイルは E107、5,000行を超えるファイルは E106、見出しの列が 2.1〜 と違うファイルは E113（状態 063）を、その場でエラーの帯に出す。", "Chọn tệp hoặc kéo thả vào khung. Không phải .csv・không phải UTF-8 thì E51 (trạng thái 063), tệp không có dòng dữ liệu thì E107, tệp quá 5.000 dòng thì E106, tệp có cột tiêu đề khác 2.1〜 thì E113 (trạng thái 063), hiện ngay ở dải lỗi.")),
    F("3.4", T("ドラッグ＆ドロップの枠", "Khung kéo thả"), "#sec-csv button.out::ファイルを選ぶ^2", "area", detail=T("ファイルを重ねると枠が青くなる。選んだファイル名を下に出す。", "Khi kéo tệp vào, khung chuyển màu xanh. Tên tệp đã chọn hiện ở dưới.")),
]
V061 = V("061", C6, T("ファイルを選ぶ（ステップ1・列の定義）", "Chọn tệp (bước 1, định nghĩa cột)"), "/ops/applications/import", "", CSV_HEAD + CSV_STEP1, full=True, wait=700,
         note=T("一覧（新規契約タブ）の「CSV取込」を押した直後。列の定義（番号 2）は画面に出ないため、画像には枠が出ない。", "Ngay sau khi bấm 「CSV取込」 ở danh sách (tab đơn mới). Định nghĩa cột (số 2) không hiện trên màn hình nên ảnh không có khung."))
V062 = V("062", C6, T("確認・登録（ステップ2：エラーの行あり）", "Xác nhận・đăng ký (bước 2: có dòng lỗi)"), "/ops/applications/import", CSV_MK(CSV_ROWS_ERR), [
    F("4", T("確認・登録（ステップ2）", "Xác nhận・đăng ký (bước 2)"), "#sec-csv", "area", "show", pattern="P-CSV", err=["S104", "E34"], detail=T("ファイル名・件数と、申込ごとの結果。「登録」でエラーのない申込だけ登録する（エラーを含む法人キーの申込は取り込まない）。", "Tên tệp・số lượng và kết quả theo từng đơn. 「登録」 chỉ đăng ký các đơn không lỗi (đơn của khóa pháp nhân có lỗi không nhập).")),
    F("4.1", T("エラーの帯", "Dải lỗi"), "#sec-csv .notice.ng", "area", "show", err=["E52", "E70"], detail=T("「エラーを含む法人キー n件の申込は取り込みません。ほかの申込（m件）は登録できます。」を赤い帯で出し、行番号・キー・列名・内容の表は先頭50件だけ＋全件の数（全部はエラー一覧CSV）。同じ法人キーで法人の列が違うときは E70、公開中でないプランは行エラー。", "Hiện dải đỏ 「エラーを含む法人キー n件の申込は取り込みません。ほかの申込（m件）は登録できます。」, bảng số dòng・khóa・tên cột・nội dung chỉ 50 dòng đầu + tổng số (toàn bộ ở CSV danh sách lỗi). Cùng khóa pháp nhân mà cột pháp nhân khác thì E70, gói không công khai là lỗi dòng."),
      demo_ok=T("コードの文言は「エラーを含む法人キー n件の申込は取り込みません。…」。共通メッセージ E52 は「n件のエラーがあるため取り込めません」で、台帳 F の「エラーの行は除外して登録」に合わせて直す（[msg]）", "Câu trong code là 「エラーを含む法人キー n件の申込は取り込みません。…」. E52 của thông báo chung là 「n件のエラーがあるため取り込めません」, sửa cho khớp 「loại dòng lỗi rồi đăng ký」 của sổ F ([msg])")),
    F("4.2", T("エラー一覧CSV", "CSV danh sách lỗi"), "#sec-csv button::エラー一覧CSV", "button", "click", detail=T("エラーの行だけを、元の列＋エラーの内容で書き出す（直して選び直すため）。", "Xuất riêng các dòng lỗi với cột gốc + nội dung lỗi (để sửa rồi chọn lại).")),
    F("4.3", T("登録する内容", "Nội dung đăng ký"), "th::変わる項目（前 → 後）^", "table", detail=T("登録される申込の表（行番号・区分・キー・名前・変わる項目 前 → 後）。登録できる申込は「新規」。", "Bảng đơn sẽ đăng ký (số dòng・loại・khóa・tên・mục thay đổi trước → sau). Đơn đăng ký được là 「新規」.")),
    F("4.4", T("ファイルを選び直す", "Chọn lại tệp"), ".csvph .btns button.out::ファイルを選び直す", "button", "click", detail=T("ステップ1に戻る。何も登録しない。", "Quay về bước 1. Không đăng ký gì.")),
    F("4.5", T("登録する（新規 n件）", "Đăng ký (mới n)"), ".csvph .btns button.pri", "button", "click", err=["S104", "E34"], cond=T("登録できる申込が1つ以上あるとき（エラーの申込があっても押せる）", "Khi có từ 1 đơn đăng ký được (có đơn lỗi vẫn bấm được)"), detail=T("エラーのない申込だけを登録し、S104 のトースト（取り込んだ件数・取り込まなかった行）を出して一覧（新規契約タブ・申請日の降順）へ戻る（状態 067）。登録した申込は「受付中」で、受付経路＝入れた値・代理入力の札が付く。100件を超えるときは裏で取り込む（I104）。", "Chỉ đăng ký các đơn không lỗi, hiện toast S104 (số lượng đã nhập・số dòng không nhập) và về danh sách (tab đơn mới, ngày xin giảm dần) (trạng thái 067). Đơn đã đăng ký là 「受付中」, có nhãn nhập thay với kênh tiếp nhận = giá trị đã nhập. Trên 100 đơn thì nhập ở nền (I104)."),
      demo_ok=T("コードの「登録する」の件数の書き方は「新規 n件」。共通メッセージ S104「更新{n}件」に合わせる（[msg]）", "Cách viết số lượng nút 「登録する」 trong code là 「新規 n件」. Đưa về S104 「更新{n}件」 của thông báo chung ([msg])")),
], wait=900, note=T("テンプレートの2行を同じ法人キー A、エラーの申込（プランが公開中でない法人キー B・法人名が違う法人キー C）を足したファイルを選んだ直後。", "Ngay sau khi chọn tệp gồm 2 dòng mẫu cùng khóa pháp nhân A, thêm đơn lỗi (khóa pháp nhân B gói không công khai, khóa pháp nhân C tên pháp nhân khác nhau)."))
V063 = V("063", C6, T("ファイル全体のエラー：見出しが違う（E113）・.csv でない（E51）", "Lỗi toàn tệp: tiêu đề khác (E113)・không phải .csv (E51)"), "/ops/applications/import", CSV_MK("head[0]='法人のキー';"), [
    F("5", T("ファイル全体のエラー", "Lỗi toàn tệp"), "#sec-csv .notice.ng", "label", "show", err=["E113", "E51"], detail=T("見出しの列が定義と違うときは E113、.csv 以外・UTF-8 以外・読めないファイルは E51。ステップ2へ進まず、ステップ1のまま帯を出す（「登録」は出ない）。画像は E113。", "Cột tiêu đề khác định nghĩa thì E113; tệp không phải .csv・không phải UTF-8・không đọc được thì E51. Không sang bước 2, giữ ở bước 1 và hiện dải lỗi (không hiện 「登録」). Ảnh là E113."), demo_ok=T("コードの E113 の文言は「…テンプレートのファイルを元に作り直してください」（共通メッセージは「CSV出力のファイルを元に」）。この画面にはテンプレートのボタンがないため文言を直す（[msg]）", "Câu E113 trong code là 「…テンプレートのファイルを元に作り直してください」 (thông báo chung là 「CSV出力のファイルを元に」). Màn hình này không có nút mẫu nên sửa câu ([msg])")),
], wait=700)
V064 = V("064", C6, T("登録できる申込がない（全申込がエラー）", "Không có đơn đăng ký được (tất cả đơn lỗi)"), "/ops/applications/import", CSV_MK("rows.forEach(r=>{r[ci('プラン')]='ES999999';});"), [
    F("6", T("登録できる申込がない", "Không có đơn đăng ký được"), "#sec-csv .notice.ng", "label", "show", err=["E114"], detail=T("すべての申込がエラーのとき、E114 を出し、「登録する」を押せなくする（非活性）。エラー一覧CSV で直して選び直す。", "Khi mọi đơn đều lỗi thì hiện E114 và làm nút 「登録する」 không khả dụng. Sửa ở CSV danh sách lỗi rồi chọn lại.")),
    F("6.1", T("登録する（新規 0件）（非活性）", "Đăng ký (mới 0) (không khả dụng)"), ".csvph .btns button.pri", "button", "click", cond=T("登録できる申込がないときは非活性", "Không khả dụng khi không có đơn đăng ký được")),
], wait=800)
V065 = V("065", C6, T("権限がない役割（一覧へ戻る）", "Vai trò không có quyền (về danh sách)"), "/ops/applications/import", "", [
    F("7", T("CSV取込の権限がない役割", "Vai trò không có quyền nhập CSV"), ".es-pagehead", "area", detail=T("一覧に「CSV取込」を出さない役割（経理・閲覧のみ・CS など）がアドレスを直接開いたときは、この画面を出さず契約申請管理の一覧へ戻す。サーバーも止める（E32）。", "Vai trò không hiện 「CSV取込」 trên danh sách (kế toán・chỉ xem・CS...) mà mở địa chỉ trực tiếp thì không hiện màn hình này mà quay về danh sách quản lý đơn hợp đồng. Máy chủ cũng chặn (E32)."), err=["E32"]),
], login="Ad00012", wait=800, note=T("経理（Ad00012）がアドレスを直接開いた直後（一覧に戻る）。", "Ngay sau khi kế toán (Ad00012) mở trực tiếp địa chỉ (quay về danh sách)."))

# ------------------------------------------------------------------ 登録・取込を実行する状態（データが変わるため、そのあとの状態は使わない）
V045 = V("045", C4, T("登録完了（受付中の申込として一覧に追加）", "Đăng ký xong (thêm vào danh sách là đơn 受付中)"), "/ops/applications/proxy/new", REG_JS + REG_FILL + "btn('登録').click();await sleep(1500);", [
    F("8", T("登録のトースト", "Toast đăng ký"), ".toast", "toast", "show", err=["S32"], detail=T("登録できたら S32（「申込を登録しました。受付中として一覧に追加しました。」）を出して一覧（新規契約タブ）へ戻る。コードの文言は申請IDを含む（「登録しました。受付中の申込として一覧に追加しました（AP-…）」）。", "Đăng ký được thì hiện S32 (「申込を登録しました。受付中として一覧に追加しました。」) và về danh sách (tab đơn mới). Câu trong code có kèm ID đơn (「登録しました。受付中の申込として一覧に追加しました（AP-…）」)."), demo_ok=H_MSG),
    F("8.1", T("登録したばかりの行", "Dòng vừa đăng ký"), ".es-table tbody tr.is-selected", "label", detail=T("登録した申込を一覧の先頭に出し、選択色にする（次に操作する行がわかる）。ステータスは受付中（黄）、申請IDの下に「代理入力」の札と受付経路。申請IDを押すと受付（AW_INTK_001）へ進む。", "Hiện đơn vừa đăng ký ở đầu danh sách và tô màu chọn (biết dòng cần thao tác tiếp). Trạng thái 受付中 (vàng), dưới ID đơn có nhãn 「代理入力」 và kênh tiếp nhận. Bấm ID đơn để sang tiếp nhận (AW_INTK_001).")),
], wait=700, note=T("必須の項目を入れて「登録」を押した直後（この撮影で申込が1件増えるため、一覧の状態は撮影のあとに見本へ戻す）。", "Ngay sau khi nhập mục bắt buộc và bấm 「登録」 (ảnh này làm tăng 1 đơn nên sau khi chụp đưa trạng thái danh sách về mẫu)."))
V066 = V("066", C5, T("登録完了（承認待ちの申請ができる）", "Đăng ký xong (tạo được đơn chờ duyệt)"), "/ops/applications/proxy/change", PRE5 + "sel('受付経路','電話');sel('法人','CU00001');await sleep(500);chk(0);await sleep(600);const mm=fld('開始したいご利用月').querySelector('select');sets(mm,mm.options[2].value);await sleep(200);const pl=fld('変更後のプラン').querySelector('select');sets(pl,[...pl.options].find(o=>/150プラン（ESスタンダード）/.test(o.text)).value);await sleep(300);btn('登録').click();await sleep(1500);", [
    F("8", T("登録のトースト", "Toast đăng ký"), ".toast", "toast", "show", err=["S33"], detail=T("登録できたら S33（「変更申請を登録しました。承認待ちとして追加しました。」）を出す。1拠点なら申請詳細（AW_APPL_002）、複数拠点なら一覧へ移る。コードの文言は申請IDを含む。", "Đăng ký được thì hiện S33 (「変更申請を登録しました。承認待ちとして追加しました。」). 1 điểm thì sang chi tiết đơn (AW_APPL_002), nhiều điểm thì sang danh sách. Câu trong code có kèm ID đơn."), demo_ok=H_MSG),
    F("8.1", T("承認待ちの申請（代理入力）", "Đơn chờ duyệt (nhập thay)"), ".es-pagehead__title", "label", detail=T("登録した申請は承認待ち（黄）。申請者は入力した運営ユーザー（受付経路つき）。法人Webからの申請と同じ申請詳細で、影響と設定 → 拠点ごとの承認へ進む。", "Đơn đã đăng ký ở trạng thái 承認待ち (vàng). Người xin là người dùng vận hành đã nhập (kèm kênh tiếp nhận). Tiếp tục ở chi tiết đơn giống đơn từ Web pháp nhân: ảnh hưởng và thiết lập → duyệt theo điểm.")),
], wait=900, note=T("プランの変更（横浜営業所以外の選べる拠点）を登録した直後。この撮影で申請が1件増える。", "Ngay sau khi đăng ký đổi gói (một điểm chọn được ngoài chi nhánh Yokohama). Ảnh này làm tăng 1 đơn."))
V067 = V("067", C6, T("取込の完了（登録 → 一覧へ）", "Nhập xong (đăng ký → về danh sách)"), "/ops/applications/import", CSV_MK(CSV_ROWS_ERR) + "btn('登録する').click();await sleep(1500);", [
    F("9", T("取込のトースト", "Toast nhập"), ".toast", "toast", "show", err=["S104"], detail=T("エラーのない申込を登録し、S104（取り込んだ件数・取り込まなかった行）を出して一覧（新規契約タブ）へ戻る。登録した申込は「受付中」で、代理入力の札と受付経路が付く。エラーを含む申込は取り込まれていない（エラー一覧CSV で直して、再度取り込む）。", "Đăng ký các đơn không lỗi, hiện S104 (số lượng đã nhập・số dòng không nhập) và về danh sách (tab đơn mới). Đơn đã đăng ký là 「受付中」, có nhãn nhập thay và kênh tiếp nhận. Đơn có lỗi chưa được nhập (sửa ở CSV danh sách lỗi rồi nhập lại)."), demo_ok=T("コードのトーストは「新規」件数の文言。共通メッセージ S104「CSVを取り込みました（更新{n}件・取り込まなかった行{m}件）」に合わせる（[msg]）", "Toast trong code dùng câu số lượng 「新規」. Đưa về S104 「CSVを取り込みました（更新{n}件・取り込まなかった行{m}件）」 của thông báo chung ([msg])")),
], wait=800, note=T("エラーを含む申込（法人キー B・C）を除いて登録した直後。この撮影で申込が増えるため、撮影のあとに見本へ戻す。", "Ngay sau khi đăng ký trừ các đơn có lỗi (khóa pháp nhân B・C). Ảnh này làm tăng đơn nên sau khi chụp đưa về mẫu."))

VIEWS = sorted([V001, V002, V003, V004, V005, V006, V007, V008, V009, V010, V011, V012,
                V013, V014, V015, V016, V017, V018, V019, V020, V021, V022, V023, V024, V025, V026, V027, V028, V029, V030, V031, V032, V033, V034, V035, V036, V037,
                V038, V039, V040, V041, V042, V043, V044, V045,
                V046, V047, V048, V049, V050, V051, V052, V053, V054, V055, V056, V057, V058, V059, V060,
                V061, V062, V063, V064, V065, V066, V067], key=lambda v: v["id"])
for _v in VIEWS:
    _v["state"] = [_v["state"], ""] if isinstance(_v["state"], str) else _v["state"]
    _v["note"] = [_v.get("note", ""), ""] if isinstance(_v.get("note", ""), str) else _v["note"]


def _fill_vi(o, key=None):
    if isinstance(o, list) and len(o) == 2 and all(isinstance(x, str) for x in o):
        if o[1] == "":
            o[1] = VI[o[0]] if o[0] in VI else (o[0] if not _JP.search(o[0]) else "")
    elif isinstance(o, dict):
        if "ja" in o and o.get("vi") == "":
            o["vi"] = VI.get(o["ja"], "")
        for k, v in o.items():
            _fill_vi(v, k)
    elif isinstance(o, list):
        for v in o:
            _fill_vi(v, key)


for _o in (DECISIONS, SCREENS, VIEWS):
    _fill_vi(_o)
