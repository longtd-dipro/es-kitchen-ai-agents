# -*- coding: utf-8 -*-
"""
画面設計書のデータ：運営管理者Web ＞ 契約申請管理 ＞ 申請詳細（新規契約の受付）
元：本物の Web（このリポジトリ app/ops/applications/_components/intake ・ lib/ops/applications/intake*.ts ・ data/intake-samples.json ・ lib/domain/areas/apply.ts）、
    決定台帳 B・F（運営A 契約申請管理 Q1〜Q10・2026-10-06 の流れ(1)(2)(5)）・M、申込フォーム §10・§11・§12、運営Web_権限表、
    確認メモ_AW_運営A_申請・法人・契約.md（Part 1・Part 4）
一覧・変更の承認・代理入力・CSV取込は AW_APPL（台帳 F 運営A Q10＝B：2シート）。申込（AP-…）の詳細は この AW_INTK_001 に書く。
日本語に続けてベトナム語を T(日本語, ベトナム語) で書く（T は VI に覚えさせ、最後に埋める）。
番号は画面ごとに通し。状態 id はこのファイルの中で 001 から出てくる順に付けた（メモ Part 1・Part 4 の id との対応は 確認メモ Part 5）。
"""

TITLE = ["受付（AW_INTK）", "Tiếp nhận (AW_INTK)"]
SHEET = ["受付", "Tiếp nhận"]
BASENAME = "画面設計書_AW_INTK_申請受付"
IMG_PREFIX = "AW_INTK"
OUT_DIR = "AW_INTK_申請受付"
CODE_NOTE = ["画面コードは規約 <Module(2)>_<Feature(4)>_<Seq(3)>（docs/01_仕様/画面コード規約_20261005.md）。AW＝運営管理者Web、INTK＝受付（新規契約の申込の受付）。AW_INTK_001 は申請詳細（AP-…）の1画面で、申込内容の確認 → 仮登録 → 詳細情報設定 → 本登録 の1本の流れ（台帳 F 運営A Q1）。一覧・変更の承認・代理入力・CSV取込は AW_APPL（Q10＝B）",
             "Mã màn hình theo quy ước <Module(2)>_<Feature(4)>_<Seq(3)> (docs/01_仕様/画面コード規約_20261005.md). AW = Web quản trị vận hành, INTK = tiếp nhận (tiếp nhận đơn hợp đồng mới). AW_INTK_001 là 1 màn hình chi tiết đơn (AP-…), 1 luồng: xác nhận nội dung đơn → đăng ký tạm → cài đặt thông tin chi tiết → đăng ký chính thức (sổ F 運営A Q1). Danh sách・duyệt thay đổi・nhập thay・nhập CSV ở AW_APPL (Q10=B)"]
SITE = "ops"
SYSTEM = {"ja": "運営管理者Web", "vi": "Web quản trị vận hành"}
AUTHOR = "Claude（cloud）／確認：hong"
CREATED = "2026-10-07"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "ops", "loginId": "Ad00010"}
CODE_PATHS = ["app/ops/applications", "app/ops/_ui", "lib/ops", "lib/domain", "components/DateInput.tsx"]

VI = {}


def T(ja, vi):
    """日本語とベトナム語を一緒に書く（VI に覚え、最後に埋める）"""
    VI[ja] = vi
    return ja


def D(date, target, q, a, src):
    return {"date": date, "target": target, "q": [T(*q), ""], "a": [T(*a), ""], "src": src}


_M = "hong 回答 2026-10-05（確認メモ_AW_運営A_申請・法人・契約 Part 1）・台帳 F（契約申請管理の画面の決め）"
_M2 = "hong 回答 2026-10-06（確認メモ Part 4 の 4-3）・台帳 F（契約・法人・拠点・子契約の流れで確認した点）"
DECISIONS = [
    D("2026-10-05", "受付の画面の作り（Q1）", ("申請詳細（新規）：見本と実データの二重構造（運営A Q1）", "Chi tiết đơn (mới): cấu trúc kép giữa dữ liệu mẫu và dữ liệu thật (運営A Q1)"),
      ("§10-2 の1本の流れ（申込内容の確認 → 仮登録 → 詳細情報設定 → 本登録）を正にする。共通データの登録パネル（開始サイクル月・基準数のパターン・初期費用）の欄は詳細情報設定の各タブへ吸収し、パネルは設計書に書かない。完了済みの申込は詳細情報設定を参照のみで開く（全拠点「本登録済」＋申請完了の内容）", "Lấy luồng 1 mạch §10-2 (xác nhận nội dung → đăng ký tạm → cài đặt thông tin chi tiết → đăng ký chính thức) làm chuẩn. Các ô của bảng đăng ký dữ liệu chung (tháng chu kỳ bắt đầu, mẫu số lượng chuẩn, phí ban đầu) được gộp vào từng tab của cài đặt thông tin chi tiết, không ghi bảng này trong tài liệu thiết kế. Đơn đã hoàn tất mở ở chế độ chỉ xem của cài đặt thông tin chi tiết (toàn bộ điểm 「本登録済」 + nội dung hoàn tất đơn)"), _M),
    D("2026-10-05", "詳細情報設定のタブ（Q2）", ("詳細情報設定のタブは6か8か（運営A Q2）", "Tab cài đặt thông tin chi tiết: 6 hay 8 (運営A Q2)"),
      ("spec の6タブ：法人／拠点／親契約／子契約／設備・オプション／料金・請求（拠点タブの中は 基本情報／請求／資料 の見出し。契約種別の切替は親契約タブの先頭）", "6 tab theo đặc tả: pháp nhân / điểm / hợp đồng cha / hợp đồng con / thiết bị・tùy chọn / phí・hóa đơn (trong tab điểm là các tiêu đề 基本情報／請求／資料. Việc chuyển loại hợp đồng ở đầu tab hợp đồng cha)"), _M),
    D("2026-10-05", "受付中の取り下げ（Q9）", ("受付中の申込を運営が取り下げられるか（運営A Q9）", "Vận hành có rút được đơn đang 受付中 không (運営A Q9)"),
      ("受付中にも「取り下げ」を置く（理由＝お客様のご連絡・必須）。却下とは意味が違うため。仮登録のあとの取り下げは運営だけ（法人Web からは取り下げない）", "Cũng đặt 「取り下げ」 ở 受付中 (lý do = khách đã liên lạc, bắt buộc). Vì khác nghĩa với 「却下」. Việc rút đơn sau đăng ký tạm chỉ do vận hành (không rút từ Web pháp nhân)"), _M),
    D("2026-10-05", "仮登録のあとの却下・取り下げ", ("仮登録のあとの却下・取り下げで何が起きるか", "Điều gì xảy ra khi từ chối / rút đơn sau đăng ký tạm"),
      ("まだ本登録していない拠点の 拠点・親契約・注文・資材の初期セットを取消にし、アカウントを停止する。本登録した拠点は解約の手続き。申込は「却下」「取り下げ済」になる", "Hủy điểm・hợp đồng cha・order・bộ vật tư ban đầu của các điểm chưa đăng ký chính thức và khóa tài khoản. Điểm đã đăng ký chính thức thì làm thủ tục hủy. Đơn thành 「却下」「取り下げ済」"), "台帳 F #26（仮登録後の却下・取り下げ）・hong 回答 2026-10-05"),
    D("2026-10-06", "本登録の入口を1つに（流れ(1)）", ("本登録のボタンを1つにする（流れで確認した点 (1)）", "Chỉ 1 nút đăng ký chính thức (điểm xác nhận (1))"),
      ("本登録は拠点ごとに1つの操作「この拠点を本登録」に統一する。画面だけで変わる「この拠点を確定」「正式登録する」は無くす。押すとデータに保存され、拠点・親契約・法人の状態が変わる（法人は最初の拠点が本登録になったとき正式登録）。再読み込みしても保存されている", "Thống nhất đăng ký chính thức thành 1 thao tác 「この拠点を本登録」 cho từng điểm. Bỏ 「この拠点を確定」「正式登録する」 chỉ đổi trên màn hình. Bấm thì lưu vào dữ liệu và đổi trạng thái điểm・hợp đồng cha・pháp nhân (pháp nhân thành 「正式登録」 khi điểm đầu tiên được đăng ký chính thức). Tải lại vẫn còn đã lưu"), _M2),
    D("2026-10-06", "申請内容は実際の申込の値（流れ(2)・Q13）", ("見本の固定データをやめる（流れで確認した点 (2)・Part 1 Q13）", "Bỏ dữ liệu cố định mẫu (điểm xác nhận (2)・Part 1 Q13)"),
      ("申請内容は実際の申込の値を出す。代理入力・申込で入れた住所・担当者・営業担当は受付・仮登録に引き継ぐ。seed の申込を実データにして見本テンプレートをやめる", "Hiện giá trị thực của đơn. Địa chỉ, người phụ trách, nhân viên kinh doanh nhập qua nhập thay / đơn được chuyển sang tiếp nhận・đăng ký tạm. Dùng dữ liệu thật cho đơn của seed và bỏ mẫu tạm"), _M2),
    D("2026-10-06", "切替の2つの入口（流れ(5)）", ("お試し→本導入の切替の入口（流れで確認した点 (5)）", "Lối vào chuyển dùng thử → chính thức (điểm xác nhận (5))"),
      ("お客様の申請（契約申請管理で承認）と、運営が直接行う拠点の「本導入に切り替える」の2つ。どちらも同じ処理。承認待ちの切替申請がある拠点では、拠点のボタンは非活性（理由を出す）。この受付の「切替」の申込は前者", "Hai lối: đơn của khách (duyệt ở quản lý đơn hợp đồng) và nút 「本導入に切り替える」 của điểm do vận hành trực tiếp làm. Cùng một xử lý. Điểm có đơn chuyển đang chờ duyệt thì nút của điểm không khả dụng (hiện lý do). Đơn 「切替」 ở tiếp nhận này là loại trước"), _M2),
    D("2026-10-05", "開始サイクル月とオーダー締切", ("受付で開始サイクル月とオーダー締切をどう扱うか", "Xử lý tháng chu kỳ bắt đầu và hạn chốt order ở tiếp nhận thế nào"),
      ("受付に「締切まであと○日」と締切後の2択（繰り下げ／代理オーダー）を出す（申込フォーム §10-5・台帳 B）。置き場所は申込内容確認の「開始スケジュール」タブの上（hong 2026-10-07 Q19）。コードは「あと○日」の帯と、2択を選ぶ操作（状態 032）を実装済み。選ぶとすぐ保存して変更履歴に残し、仮登録（申込内容の確認の完了）で反映する（繰り下げ＝締切に間に合う翌サイクルへ／代理オーダー＝希望の月から開始）。選ばなかったときの既定は繰り下げ（hong 2026-10-08 Q22）", "Hiện 「締切まであと○日」 và 2 lựa chọn sau hạn (dời / order thay) ở tiếp nhận (申込フォーム §10-5・sổ B). Vị trí: phía trên tab 「開始スケジュール」 của xác nhận nội dung đơn (hong 2026-10-07 Q19). Code đã cài dải 「あと○日」 và thao tác chọn 2 lựa chọn (trạng thái 032). Chọn xong thì lưu ngay và ghi vào lịch sử thay đổi, áp dụng khi đăng ký tạm (hoàn tất xác nhận nội dung đơn): dời = sang chu kỳ kế tiếp kịp hạn chốt / order thay = bắt đầu từ tháng mong muốn. Mặc định khi không chọn là dời (hong 2026-10-08 Q22)"), "台帳 B・申込フォーム §10-5・hong 回答 Q19"),
    D("2026-10-07", "他社乗り換えキャンペーン", ("受付で他社乗り換えキャンペーンの該当を確かめる欄を作るか", "Có tạo ô xác nhận đối tượng chiến dịch chuyển từ hãng khác ở tiếp nhận không"),
      ("作らない。該当するお客様がいれば、システム管理者が割引（DC000012）を手で足す（hong 2026-10-07）", "Không tạo. Nếu có khách thuộc diện này, quản trị hệ thống tự thêm giảm giá (DC000012) bằng tay (hong 2026-10-07)"), "hong 回答 Q18"),
]
CHANGES = []

HIDE_ALWAYS = []
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [
    {"code": "AW_INTK_001", "ja": "受付（申請詳細・新規契約）", "vi": "Tiếp nhận (chi tiết đơn・hợp đồng mới)"},
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
OPEN = None
# ------------------------------------------------------------------ 共通の言い回し（コードとの差）
UPD = T("契約申請の編集ができる役割（フル権限・CS）だけに表示", "Chỉ hiển thị cho vai trò sửa được đơn hợp đồng (toàn quyền, CS)")
FULL = UPD
H_REQNO = T("コードの画面・メッセージに決定番号・REQ 番号が出ている箇所がある（宿題 H12）。開発用の説明は画面に出さない（台帳 K）。仕様が正", "Một số chỗ trong màn hình / thông báo của code hiện số quyết định, số REQ (việc cần sửa H12). Không hiện mô tả cho phát triển trên màn hình (sổ K). Theo đặc tả")
H_MSG = T("コードの文言は共通メッセージと違う。仕様は共通メッセージ（[msg]）", "Câu trong code khác với thông báo chung. Đặc tả dùng thông báo chung ([msg])")
H_NOSEED = T("見本のデータでは作れない状態（画面は通常の表示のまま撮影した）。データを足したら撮り直す", "Trạng thái không tạo được bằng dữ liệu mẫu (ảnh chụp màn hình thường). Khi bổ sung dữ liệu thì chụp lại")
H_SELF = T("承認者・入力者はログイン中の運営ユーザー（自己承認は可・履歴に残す）。コードは固定（宿題 H8）。仕様が正", "Người duyệt / người nhập là người dùng vận hành đang đăng nhập (tự duyệt được, lưu lịch sử). Code cố định (việc cần sửa H8). Theo đặc tả")
H_DATE = T("コードは日付を文字で入力する。仕様は共通の日付部品（宿題）。仕様が正", "Code nhập ngày bằng chữ. Đặc tả dùng thành phần ngày chung (việc cần sửa). Theo đặc tả")
H_PREPAID = T("コードの文言に「前払い」「後払い」が残る。台帳 B・M-1 は出さない（宿題 H6）。仕様が正", "Câu trong code còn chữ 「前払い」「後払い」. Sổ B・M-1 không hiện (việc cần sửa H6). Theo đặc tả")
H_MAXLEN = T("コードは最大文字数・絵文字のチェックがない（宿題）。仕様が正", "Code không kiểm tra số ký tự tối đa, emoji (việc cần sửa). Theo đặc tả")
C = "AW_INTK_001"
DTAB = lambda name: JS + "qa('.es-tab').find(b=>b.textContent.trim().startsWith('%s')).click();await sleep(700);" % name
ATAB = DTAB
RO = lambda no, label, ja, vi, detail, **kw: F(no, T(ja, vi), "label::%s^" % label, "label", detail=detail, **kw)

# ====================================================================== AW_INTK_001 受付：申込内容の確認（受付中）
ROUTE = "AP-20260910-0031"
I_HEAD = [
    F("1", T("ヘッダー", "Phần đầu trang"), ".es-pagehead", "area", detail=T("パンくず（契約申請管理 / 申請詳細）・画面名と申請ID・ステータスの札・操作ボタン。申請ID が AP-… の申込のとき開く（CH-… は AW_APPL_002）。一覧（AW_APPL_001）の申請IDから入る。ステータス＝受付中（黄）／契約設定中（青）／完了（緑）。却下・取り下げ済みは理由と日時だけの画面（状態 024）。", "Breadcrumb (契約申請管理 / 申請詳細), tên màn hình + ID đơn, badge trạng thái, các nút thao tác. Mở khi ID đơn là AP-… (CH-… là AW_APPL_002). Vào từ ID đơn của danh sách (AW_APPL_001). Trạng thái = 受付中 (vàng) / 契約設定中 (xanh) / 完了 (xanh lá). Đơn bị từ chối・đã rút chỉ hiện lý do và ngày giờ (trạng thái 024).")),
    F("1.1", T("パンくず", "Breadcrumb"), ".es-breadcrumb a", "link", "click", detail=T("「契約申請管理」を押すと一覧へ戻る。編集中の変更があれば破棄の確認（Q02）を出す。", "Bấm 「契約申請管理」 để về danh sách. Nếu có thay đổi đang sửa thì hiện xác nhận hủy bỏ (Q02).")),
    F("1.2", T("画面名・申請ID・ステータス", "Tên màn hình・ID đơn・trạng thái"), ".es-pagehead__title", "label", len=["申請詳細 AP-yyyymmdd-nnnn ＋ ステータス", "Chi tiết đơn AP-yyyymmdd-nnnn + trạng thái"], detail=T("申請ID の形は AP-yyyymmdd-nnnn（システムが採番）。", "Dạng ID đơn là AP-yyyymmdd-nnnn (hệ thống cấp).")),
    F("1.3", T("却下", "Từ chối"), ".es-pagehead__actions button::却下", "button", "click", cond=UPD, detail=T("却下の小窓を開く（状態 007）。理由は必須。法人へ却下のお知らせを理由つきで送る。仮登録のあとの却下もここ（まだ本登録していない拠点を取消にしアカウントを停止）。", "Mở cửa sổ từ chối (trạng thái 007). Lý do bắt buộc. Gửi thông báo từ chối kèm lý do cho pháp nhân. Từ chối sau đăng ký tạm cũng ở đây (hủy điểm chưa đăng ký chính thức và khóa tài khoản).")),
    F("1.4", T("取り下げ", "Rút đơn"), ".es-pagehead__actions button::取り下げ", "button", "click", cond=UPD, detail=T("受付中にも運営が取り下げられる（理由＝お客様のご連絡・必須。台帳 F 運営A Q9＝A）。ログインなしの申込・代理入力の申込には法人側の手段がないため。仮登録のあとの取り下げは運営だけ（状態 009・028）。", "Vận hành cũng rút được ở 受付中 (lý do = khách đã liên lạc, bắt buộc; sổ F 運営A Q9=A). Vì đơn không đăng nhập・đơn nhập thay không có cách phía pháp nhân. Rút đơn sau đăng ký tạm chỉ do vận hành (trạng thái 009・028).")),
    F("1.5", T("申込内容の確認を完了", "Hoàn tất xác nhận nội dung đơn"), ".es-pagehead__actions button::申込内容の確認を完了", "button", "click", cond=UPD, detail=T("申込内容の確認が済んだら押す。配送の設定（倉庫）が未入力なら配送の設定のタブを編集で開き、足りない欄を赤くして「ピッキング倉庫が未設定です（n件）」を出す。そろっていれば保存して仮登録の確認（状態 013）へ。", "Bấm khi đã xác nhận xong nội dung đơn. Nếu thiết lập giao hàng (kho) chưa nhập thì mở tab thiết lập giao hàng ở chế độ sửa, tô đỏ ô còn thiếu và hiện 「ピッキング倉庫が未設定です（n件）」. Nếu đủ thì lưu và sang xác nhận đăng ký tạm (trạng thái 013).")),
]
I_TABS = [
    F("2", T("申込内容確認のタブ", "Tab xác nhận nội dung đơn"), ".es-tabs", "area", pattern="P-TAB", detail=T("申請内容／配送の設定／開始スケジュール（受付に必要な種類だけ）／共通情報。配送の設定が未入力なら「要入力」を出す。タブの切り替えで編集中の変更があれば破棄の確認（Q02）。", "Nội dung đơn / thiết lập giao hàng / lịch bắt đầu (chỉ loại cần cho tiếp nhận) / thông tin chung. Thiết lập giao hàng chưa nhập thì hiện 「要入力」. Khi chuyển tab mà có thay đổi đang sửa thì xác nhận hủy bỏ (Q02)."), demo_ok=T("タブをアドレスに持つ（P-TAB）のは宿題 H2。仕様が正", "Việc giữ tab ở địa chỉ (P-TAB) là việc cần sửa H2. Theo đặc tả")),
    F("2.1", T("申請内容", "Nội dung đơn"), ".es-tab::申請内容", "tab", "click", detail=T("申請情報と拠点別の申込内容。", "Thông tin đơn và nội dung đơn theo từng điểm.")),
    F("2.2", T("配送の設定", "Thiết lập giao hàng"), ".es-tab::配送の設定", "tab", "click", detail=T("拠点ごとのピッキング倉庫・配送回数（状態 002）。", "Kho picking・số lần giao theo từng điểm (trạng thái 002).")),
    F("2.3", T("開始スケジュール", "Lịch bắt đầu"), ".es-tab::開始スケジュール", "tab", "click", detail=T("拠点ごとの契約開始年月・サイクル初日（状態 004）。", "Tháng bắt đầu hợp đồng・ngày đầu chu kỳ theo từng điểm (trạng thái 004).")),
    F("2.4", T("共通情報", "Thông tin chung"), ".es-tab::共通情報", "tab", "click", detail=T("申込担当者の表と法人情報（状態 005・006）。", "Bảng người phụ trách đơn và thông tin pháp nhân (trạng thái 005・006).")),
]
I_INFO = [
    F("3", T("申請情報", "Thông tin đơn"), "h2::申請情報^", "area", detail=T("申込の基本情報（参照のみ）。申請内容は実際の申込の値を出す（見本の固定データをやめる・台帳 F 2026-10-06 (2)）。代理入力・申込で入れた住所・担当者・営業担当は受付・仮登録に引き継ぐ。", "Thông tin cơ bản của đơn (chỉ xem). Hiện giá trị thực của đơn (bỏ dữ liệu cố định mẫu; sổ F 2026-10-06 (2)). Địa chỉ, người phụ trách, nhân viên kinh doanh nhập qua nhập thay / đơn được chuyển sang tiếp nhận・đăng ký tạm.")),
    RO("3.1", "申請日", "申請日", "Ngày xin", T("yyyy-mm-dd。", "yyyy-mm-dd."), len="日付 yyyy-mm-dd"),
    RO("3.2", "申込区分", "申込区分", "Loại đơn", T("本導入の新規申込／お試しキャンペーン／切替（お試し→本導入）。", "Đơn mới chính thức / chiến dịch dùng thử / chuyển (dùng thử → chính thức).")),
    RO("3.3", "法人", "法人", "Pháp nhân", T("法人名と「新しい法人」「既存の法人」の別。", "Tên pháp nhân và phân biệt 「新しい法人」「既存の法人」.")),
    RO("3.4", "申込者", "申込者", "Người đăng ký", T("申込者の名前と、ログインなしで申込／ログイン中のアカウント／代理入力（受付経路）の別。申込者のメール・電話も出す（台帳 28-117）。", "Tên người đăng ký và phân biệt đăng ký không đăng nhập / tài khoản đang đăng nhập / nhập thay (kênh tiếp nhận). Hiện cả email・điện thoại người đăng ký (sổ 28-117).")),
    RO("3.5", "拠点数", "拠点数", "Số điểm", T("申込の拠点数（「4拠点」）。", "Số điểm của đơn (「4拠点」).")),
    RO("3.6", "親契約", "親契約", "Hợp đồng cha", T("仮登録で採番する（受付中は「仮登録で採番」）。", "Cấp số khi đăng ký tạm (ở 受付中 hiện 「仮登録で採番」).")),
    RO("3.7", "子契約", "子契約", "Hợp đồng con", T("本登録で作成する。", "Tạo khi đăng ký chính thức.")),
    F("4", T("拠点別の申込内容", "Nội dung đơn theo từng điểm"), "h2::拠点別の申込内容^", "area", detail=T("拠点を列にした表（項目 × 拠点）。拠点名・開始サイクル月・契約区分・プラン・コース・設備・配送・担当者など、申込の値を拠点ごとに並べる。複数拠点の申込は拠点1・拠点2… の列が並ぶ。", "Bảng có điểm là cột (mục × điểm). Xếp giá trị của đơn theo từng điểm: tên điểm, tháng chu kỳ bắt đầu, loại hợp đồng, gói, khóa, thiết bị, giao hàng, người phụ trách... Đơn nhiều điểm có các cột điểm 1, điểm 2…")),
]
V001 = V("001", C, T("申込内容の確認：申請内容（本導入 4拠点・受付中）", "Xác nhận nội dung đơn: nội dung đơn (chính thức 4 điểm・受付中)"), "/ops/applications/" + ROUTE, "", I_HEAD + I_TABS + I_INFO, full=True, wait=900,
         note=T("AP-20260910-0031（ログインなしで申込・新しい法人・4拠点・受付中）。画面の下にある「受付のそのほかの設定（共通データ）」（開始サイクル月・基準数のパターン・初期費用の登録パネル）は、台帳 F 運営A Q1 で詳細情報設定の各タブへ吸収するため、設計書には書かない。", "AP-20260910-0031 (đăng ký không đăng nhập・pháp nhân mới・4 điểm・受付中). Phần 「受付のそのほかの設定（共通データ）」 ở cuối màn hình (bảng đăng ký tháng chu kỳ bắt đầu, mẫu số lượng chuẩn, phí ban đầu) được gộp vào từng tab của cài đặt thông tin chi tiết theo sổ F 運営A Q1 nên không ghi trong tài liệu thiết kế."))
V002 = V("002", C, T("配送の設定（倉庫・配送回数）", "Thiết lập giao hàng (kho・số lần giao)"), "/ops/applications/" + ROUTE, ATAB("配送の設定"), [
    F("7", T("配送の設定", "Thiết lập giao hàng"), "#rtview", "area", detail=T("拠点ごと・配送種別（冷蔵配送・資材配送）ごとに ピッキング倉庫・配送回数を入れる。資材配送は倉庫の既定（資材用の倉庫）・都度配送で、資材の初期セット（無料）の納品日は仮登録のあと詳細情報設定の「子契約」タブ（配送ルートの下）で決める。倉庫が未入力の間は「配送の設定」タブに「要入力」を出し、編集で開く。", "Nhập kho picking・số lần giao theo từng điểm・từng loại giao (giao lạnh, giao vật tư). Giao vật tư dùng kho mặc định (kho vật tư)・giao theo từng lần, ngày giao bộ vật tư ban đầu (miễn phí) quyết định ở tab 「子契約」 (dưới tuyến giao hàng) của cài đặt thông tin chi tiết sau đăng ký tạm. Khi chưa nhập kho thì tab 「配送の設定」 hiện 「要入力」 và mở ở chế độ sửa.")),
    F("7.1", T("編集", "Sửa"), "#rtEdit", "button", "click", cond=UPD, detail=T("配送の設定を編集にする。編集中は [キャンセル][保存] に変わる。", "Chuyển thiết lập giao hàng sang chế độ sửa. Khi sửa đổi thành [キャンセル][保存].")),
    F("7.2", T("配送の設定の表", "Bảng thiết lập giao hàng"), "#rtview table", "table", detail=T("列＝拠点・配送種別・ピッキング倉庫・配送回数・納品回数（合計）・配送回数追加。納品回数（合計）は「月n回」。プランの標準を超えた分は配送回数追加（OP000001・1回あたり月額 3,000円）を自動で計上する。", "Cột = điểm, loại giao, kho picking, số lần giao, số lần giao (tổng)・thêm lần giao. Số lần giao (tổng) là 「月n回」. Phần vượt tiêu chuẩn của gói được tự động tính thêm lần giao (OP000001, 3,000 yên/tháng cho mỗi lần)."), demo_ok=T("コードの納品回数の表示は「0回」など申込の配送回数が未入力のため 0 のまま", "Hiển thị số lần giao trong code là 0 (như 「0回」) vì số lần giao của đơn chưa nhập")),
], full=True, wait=800)
V003 = V("003", C, T("配送の設定：編集中・倉庫が未設定（エラー）", "Thiết lập giao hàng: đang sửa・chưa đặt kho (lỗi)"), "/ops/applications/" + ROUTE, ATAB("配送の設定") + "q('#rtEdit').click();await sleep(600);sets(q('#rtcard tbody tr:nth-child(1) td:nth-child(4) select'),'2');await sleep(300);q('#rtSave').click();await sleep(800);", [
    F("7", T("編集中の配送の設定", "Thiết lập giao hàng đang sửa"), "#rtcard", "area", pattern="P-FORM", detail=T("編集中はピッキング倉庫・配送回数の選択欄に変わり、見出しの右に [キャンセル][保存]。「既定の倉庫を入れる」でエリアの既定の倉庫を拠点ごとに入れられる。", "Khi sửa, ô kho picking・số lần giao thành ô chọn, bên phải tiêu đề có [キャンセル][保存]. Bấm 「既定の倉庫を入れる」 để nhập kho mặc định theo khu vực cho từng điểm.")),
    F("7.1", T("ピッキング倉庫", "Kho picking"), "#rtcard tbody tr:nth-child(2) select", "select", "select", req="○", len=["選択（倉庫マスタ）", "Chọn (master kho)"], init=T("未選択（選択）", "Chưa chọn (chọn)"), ex=["WH00001 関東倉庫", "Kho picking (master kho)"], err=["E72"], valid=T("配送回数が1回以上の配送種別は必須。未入力なら赤枠にして「ピッキング倉庫が未設定です（n件）」を出す。", "Bắt buộc với loại giao có số lần giao từ 1 trở lên. Chưa nhập thì viền đỏ và hiện 「ピッキング倉庫が未設定です（n件）」."), demo_ok=T("コードは倉庫の選択肢が固定の4つ（宿題 H11）。仕様はマスタ", "Lựa chọn kho trong code là 4 kho cố định (việc cần sửa H11). Đặc tả dùng master")),
    F("7.2", T("配送回数", "Số lần giao"), "#rtcard tbody tr:nth-child(1) td:nth-child(4) select", "select", "select", req="○", len="選択（0回〜8回）", init=T("0回", "0 lần"), ex=["2回", "Số lần giao mỗi tháng (0〜8)"], detail=T("拠点ごとの月の配送回数（冷蔵配送）。プランの標準を超えると配送回数追加が付く。", "Số lần giao mỗi tháng theo điểm (giao lạnh). Vượt tiêu chuẩn của gói thì tính thêm lần giao.")),
    F("7.3", T("保存", "Lưu"), "#rtSave", "button", "click", err=["S01", "E72"], detail=T("倉庫が未設定の拠点があれば保存せず、赤枠と E72（トースト）。そろっていれば保存して「配送の設定を保存しました」（S01）を出す。", "Nếu có điểm chưa đặt kho thì không lưu, viền đỏ và E72 (toast). Đủ thì lưu và hiện 「配送の設定を保存しました」 (S01)."), demo_ok=H_MSG),
    F("7.4", T("キャンセル", "Hủy"), "#rtCancel", "button", "click", err=["Q02"], detail=T("変更があれば破棄の確認（Q02）。なければそのまま参照に戻る。", "Nếu có thay đổi thì xác nhận hủy bỏ (Q02). Không thì về chế độ xem.")),
], full=True, wait=900, note=T("編集にして、拠点1の配送回数を2回にして倉庫を入れずに保存した直後。", "Ngay sau khi chuyển sang sửa, đặt số lần giao của điểm 1 là 2 lần và lưu mà không nhập kho."))
V004 = V("004", C, T("開始スケジュール", "Lịch bắt đầu"), "/ops/applications/" + ROUTE, ATAB("開始スケジュール"), [
    F("7.1", T("締切まであと○日（受付）", "Còn ○ ngày đến hạn chốt (tiếp nhận)"), ".es-inline", "label", cond=T("受付中のとき", "Khi 受付中"), detail=T("開始スケジュールのタブの上に、開始サイクル月のオーダー締切までの日数を出す（「オーダー締切 {日} まで あと {n}日（今日 {日}）」。3日以内は黄、締切を過ぎたら赤で「{n}日 過ぎています」）。置き場所は台帳 運営A Q19＝開始スケジュールのタブ（申込フォーム §10-5）。締切を過ぎたあとは、開始月の扱いの2択（開始月の繰り下げ／運営が代理でオーダー）も同じタブに出す（状態 032）。", "Phía trên tab lịch bắt đầu hiện số ngày đến hạn chốt order của tháng chu kỳ bắt đầu (「オーダー締切 {ngày} まで あと {n}日（今日 {ngày}）」; trong 3 ngày là màu vàng, quá hạn là màu đỏ 「{n}日 過ぎています」). Vị trí theo sổ 運営A Q19 = tab lịch bắt đầu (申込フォーム §10-5). Sau khi quá hạn, 2 lựa chọn xử lý tháng bắt đầu (dời tháng bắt đầu / vận hành order thay) cũng hiện ở cùng tab (trạng thái 032).")),
    F("7", T("拠点別の開始スケジュール", "Lịch bắt đầu theo từng điểm"), "h2::拠点別の開始スケジュール^", "area", detail=T("拠点ごとの 契約開始年月（開始サイクル月）・サイクル初日（A1＝その月の最初の月曜）・親契約（仮登録で採番）。契約はサイクル単位で日は選ばない。開始サイクル月は、仮登録の前なら詳細情報設定の親契約タブ（開始サイクル月）で直せる（台帳 F Q1：共通データの登録パネルの欄を各タブへ吸収）。", "Theo từng điểm: tháng bắt đầu hợp đồng (tháng chu kỳ bắt đầu), ngày đầu chu kỳ (A1 = thứ Hai đầu tiên của tháng đó), hợp đồng cha (cấp số khi đăng ký tạm). Hợp đồng theo đơn vị chu kỳ nên không chọn ngày. Tháng chu kỳ bắt đầu sửa được ở tab hợp đồng cha của cài đặt thông tin chi tiết (sổ F Q1: gộp ô của bảng đăng ký dữ liệu chung vào các tab).")),
], wait=800, note=T("受付に必要な申込の種類（本導入・お試し）のときだけ出るタブ。", "Tab chỉ hiện với loại đơn cần cho tiếp nhận (chính thức・dùng thử)."))
V005 = V("005", C, T("共通情報（新しい法人）", "Thông tin chung (pháp nhân mới)"), "/ops/applications/" + ROUTE, ATAB("共通情報"), [
    F("7", T("共通情報", "Thông tin chung"), "h2::共通情報^", "area", detail=T("申込担当者の表と法人情報（参照のみ）。申込者は担当者の中から1名を選ぶ（申込フォーム §5-3・A2）。", "Bảng người phụ trách đơn và thông tin pháp nhân (chỉ xem). Người đăng ký chọn 1 người trong số người phụ trách (申込フォーム §5-3・A2).")),
    F("7.1", T("申込担当者の表", "Bảng người phụ trách đơn"), ".secttl::申込担当者", "table", detail=T("列＝所属（法人／拠点）・区分（メイン／請求／サブ）・氏名・フリガナ・メールアドレス・電話番号。申込者に「申込者」の札。仮登録で、法人のご担当者は法人詳細、拠点のご担当者は拠点詳細の担当者テーブルに入る。拠点のご担当者が法人のメイン担当者と同じなら「法人のメイン担当者と同じ」と出す。", "Cột = trực thuộc (pháp nhân / điểm), loại (chính / hóa đơn / phụ), họ tên, furigana, email, điện thoại. Người đăng ký có nhãn 「申込者」. Khi đăng ký tạm, người phụ trách pháp nhân vào bảng người phụ trách của chi tiết pháp nhân, người phụ trách điểm vào của chi tiết điểm. Nếu người phụ trách điểm giống người phụ trách chính của pháp nhân thì hiện 「法人のメイン担当者と同じ」.")),
    F("7.2", T("法人情報", "Thông tin pháp nhân"), ".secttl::法人情報", "area", detail=T("法人名・フリガナ・請求先法人名・請求書に載る住所・電話番号。新しい法人は「新規の法人」の札、既存の法人は「既存の法人」の札と請求情報を出す。値がないときは「—」。", "Tên pháp nhân, furigana, tên nhận hóa đơn, địa chỉ ghi trên hóa đơn, điện thoại. Pháp nhân mới có nhãn 「新規の法人」, pháp nhân có sẵn có nhãn 「既存の法人」 và thông tin hóa đơn. Không có giá trị thì 「—」.")),
], full=True, wait=800)
V006 = V("006", C, T("共通情報（既存の法人）", "Thông tin chung (pháp nhân có sẵn)"), "/ops/applications/AP-20261003-0069", ATAB("共通情報"), [
    F("7", T("既存の法人の情報", "Thông tin pháp nhân có sẵn"), ".secttl::法人情報", "area", detail=T("既存の法人に拠点を足す申込は「既存の法人」の札を出し、法人ステータス・請求情報（支払方法・サイクルなど）も参照できる。法人の情報はそのまま（この申込では変えない）。", "Đơn thêm điểm vào pháp nhân có sẵn hiện nhãn 「既存の法人」, xem được cả trạng thái pháp nhân・thông tin hóa đơn (phương thức・chu kỳ thanh toán...). Thông tin pháp nhân giữ nguyên (đơn này không đổi).")),
    F("7.1", T("請求情報", "Thông tin hóa đơn"), ".secttl::請求情報", "area", detail=T("既存の法人の請求条件（支払方法・支払サイクル・請求書発行リードタイム など）を参照のみで出す。", "Hiện điều kiện hóa đơn của pháp nhân có sẵn (phương thức・chu kỳ thanh toán, lead time phát hành hóa đơn...) chỉ để xem."), demo_ok=H_PREPAID),
], full=True, wait=800, note=T("AP-20261003-0069（ことぶき商会・既存の法人に拠点を足す申込）。", "AP-20261003-0069 (ことぶき商会, đơn thêm điểm vào pháp nhân có sẵn)."))
RJ_OPEN = JS + "btn('却下',q('.es-pagehead__actions')).click();await sleep(800);"
WD_OPEN = JS + "btn('取り下げ',q('.es-pagehead__actions')).click();await sleep(800);"
V007 = V("007", C, T("却下の小窓（理由は必須）", "Cửa sổ từ chối (lý do bắt buộc)"), "/ops/applications/" + ROUTE, RJ_OPEN, [
    F("8", T("却下の小窓", "Cửa sổ từ chối"), ".es-modal__panel", "modal", err=["Q14", "S19"], detail=T("見出し＝「この申込を却下しますか？」。却下理由（定型7つ）と詳しい理由。法人へ却下のお知らせを理由つきで送る。仮登録のあとは「仮登録した拠点のうち、まだ本登録していない拠点の 拠点・親契約・注文・資材の初期セットを取消にし、アカウントを停止します」の注意を出す。却下できたら S19 のトーストを出して一覧（新規契約タブ）へ戻る。", "Tiêu đề = 「この申込を却下しますか？」. Lý do từ chối (7 lý do định sẵn) và lý do chi tiết. Gửi thông báo từ chối kèm lý do cho pháp nhân. Sau đăng ký tạm hiện lưu ý 「Hủy điểm・hợp đồng cha・order・bộ vật tư ban đầu của các điểm chưa đăng ký chính thức và khóa tài khoản」. Từ chối được thì toast S19 và về danh sách (tab đơn mới)."), demo_ok=H_MSG),
    F("8.1", T("却下理由", "Lý do từ chối"), ".es-modal__panel select", "select", "select", req="○", len=["選択（定型7つ）", "Chọn (7 lý do định sẵn)"], init=T("未選択（選んでください）", "Chưa chọn (hãy chọn)"), ex=["配送エリア・配送ルートの都合で対応できない", "Lý do từ chối (chọn trong 7 lý do định sẵn)"], err=["E02"], detail=T("定型は AW_APPL_002 の却下の小窓（状態 022）と同じ7つ。", "7 lý do định sẵn giống cửa sổ từ chối của AW_APPL_002 (trạng thái 022)."), open=T("却下の定型7つの文言（決定ファイルに一覧がない）", "Câu chữ của 7 lý do từ chối định sẵn (không có danh sách trong file quyết định)"), ask="お客様（運用）"),
    F("8.2", T("詳しい理由", "Lý do chi tiết"), ".es-modal__panel textarea", "textarea", "input", req="－", len="文字列 500（複数行）", init=T("空", "Trống"), ex=["設置場所の寸法が合わないため", "Lý do chi tiết (tối đa 500 ký tự, nhiều dòng)"], err=["E04", "E13"], demo_ok=H_MAXLEN),
    F("8.3", T("却下する", "Từ chối"), ".es-modal__panel button::却下する", "button", "click", detail=T("理由を選んでいれば却下する。申込は「却下」（赤）になり、一覧では理由と日時のダイアログだけで見られる。", "Nếu đã chọn lý do thì từ chối. Đơn thành 「却下」 (đỏ), ở danh sách chỉ xem được bằng hộp thoại lý do và ngày giờ.")),
], wait=800)
V008 = V("008", C, T("却下の理由が未選択（エラー）", "Chưa chọn lý do từ chối (lỗi)"), "/ops/applications/" + ROUTE, RJ_OPEN + "btn('却下する',q('.es-modal__panel')).click();await sleep(500);", [
    F("8", T("理由未選択のエラー", "Lỗi chưa chọn lý do"), ".es-modal__panel .es-field__msg--error", "label", "show", err=["E02"], detail=T("理由を選ばずに「却下する」を押すと、理由の欄を赤枠にして E02 を出す（コードの文言は「却下理由を選んでください。」）。", "Bấm 「却下する」 mà chưa chọn lý do thì viền đỏ ô lý do và hiện E02 (câu trong code là 「却下理由を選んでください。」)."), demo_ok=H_MSG),
], wait=700)
V009 = V("009", C, T("取り下げの小窓（受付中・理由は必須）", "Cửa sổ rút đơn (受付中・lý do bắt buộc)"), "/ops/applications/" + ROUTE, WD_OPEN, [
    F("8", T("取り下げの小窓", "Cửa sổ rút đơn"), ".es-modal__panel", "modal", err=["Q14", "S19"], detail=T("見出し＝「この申込を取り下げしますか？」（コードの文言。「取り下げますか？」に直す）。理由＝お客様からのご連絡（文字で・必須）。「却下」と違い、法人の意思による取り下げの記録になる。取り下げできたら S19 のトーストを出して一覧へ戻る。", "Tiêu đề = 「この申込を取り下げしますか？」 (câu của code; sửa thành 「取り下げますか？」). Lý do = khách đã liên lạc (bằng chữ・bắt buộc). Khác 「却下」, ghi nhận là rút đơn theo ý muốn của pháp nhân. Rút được thì toast S19 và về danh sách."), demo_ok=H_MSG),
    F("8.1", T("取り下げの理由（お客様からのご連絡）", "Lý do rút đơn (khách đã liên lạc)"), ".es-modal__panel textarea", "textarea", "input", req="○", len="文字列 500（複数行）", init=T("空", "Trống"), ex=["お客様から電話で、導入を見送るとご連絡がありました", "Lý do rút đơn (khách đã liên lạc, tối đa 500 ký tự, nhiều dòng)"], err=["E01", "E04", "E13"], demo_ok=H_MAXLEN),
    F("8.2", T("取り下げする", "Rút đơn"), ".es-modal__panel button::取り下げする", "button", "click", detail=T("理由を入れていれば取り下げる。申込は「取り下げ済」（灰）になる。", "Nếu đã nhập lý do thì rút đơn. Đơn thành 「取り下げ済」 (xám)."), demo_ok=T("ボタン名はコードで「取り下げする」。「取り下げる」に直す（[msg]）", "Tên nút trong code là 「取り下げする」. Sửa thành 「取り下げる」 ([msg])")),
], wait=800)
V010 = V("010", C, T("取り下げの理由が未入力（エラー）", "Chưa nhập lý do rút đơn (lỗi)"), "/ops/applications/" + ROUTE, WD_OPEN + "btn('取り下げする',q('.es-modal__panel')).click();await sleep(500);", [
    F("8", T("理由未入力のエラー", "Lỗi chưa nhập lý do"), ".es-modal__panel .es-field__msg--error", "label", "show", err=["E01"], detail=T("理由を入れずに押すと、理由の欄を赤枠にして E01（コードの文言は「取り下げの理由を入れてください。」）。", "Bấm mà chưa nhập lý do thì viền đỏ ô lý do và hiện E01 (câu trong code là 「取り下げの理由を入れてください。」)."), demo_ok=H_MSG),
], wait=700)
V011 = V("011", C, T("お試し（AP-20260922-0057）：申込内容の確認", "Dùng thử (AP-20260922-0057): xác nhận nội dung đơn"), "/ops/applications/AP-20260922-0057", "", [
    F("7", T("お試しの申込の違い", "Điểm khác của đơn dùng thử"), "h2::拠点別の申込内容^", "area", detail=T("お試しキャンペーンの申込は、申込内容に お試し期間（月数）・割引（お試しキャンペーン割引）が入り、設備は冷蔵庫・冷凍庫に固定（自販機は選べない・申込フォーム §4-8）。仮登録でお試しのオーダー（個数は割合で自動計算・法人は編集不可）を自動で作る。お試し中は資材のご注文はできない（法人Web）。", "Đơn chiến dịch dùng thử có thêm thời gian dùng thử (số tháng) và giảm giá (giảm giá chiến dịch dùng thử), thiết bị cố định tủ lạnh・tủ đông (không chọn được máy bán hàng; 申込フォーム §4-8). Khi đăng ký tạm tự tạo order dùng thử (số lượng tự tính theo tỉ lệ・pháp nhân không sửa được). Đang dùng thử không đặt được vật tư (Web pháp nhân)."), demo_ok=T("見本の AP-20260922-0057 は設備が自販機（お試しでは選べない組み合わせ）。見本データの直しは別途", "AP-20260922-0057 của dữ liệu mẫu có thiết bị là máy bán hàng (tổ hợp không chọn được khi dùng thử). Sửa dữ liệu mẫu làm riêng")),
], full=True, wait=900)

# ====================================================================== 詳細情報設定（仮登録のあと）
DNO = "AP-20260920-0052"
DEDIT = JS + "if(q('#btnEdit')){q('#btnEdit').click();}await sleep(700);"
D_TABLE = [
    F("1", T("拠点の表", "Bảng điểm"), "#dscreen .card:first-child", "area", detail=T("申込の拠点を行にした表（No・拠点名・プラン・開始サイクル月・状態・操作）。行を押すとその拠点の詳細情報設定を開く。状態＝仮登録（青）／本登録済み（緑）／対象外（灰）。", "Bảng điểm của đơn theo dòng (No, tên điểm, gói, tháng chu kỳ bắt đầu, trạng thái, thao tác). Bấm dòng để mở cài đặt thông tin chi tiết của điểm đó. Trạng thái = 仮登録 (xanh) / 本登録済み (xanh lá) / 対象外 (xám).")),
    F("1.1", T("この拠点を本登録", "Đăng ký chính thức điểm này"), ".brconf", "button", "click", cond=UPD, err=["W109", "E65", "S35"], detail=T("本登録の入口はこのボタン1つだけ（拠点ごと。台帳 F 2026-10-06 (1)：画面だけで変わる「この拠点を確定」「正式登録する」は無くす）。押すと確認（状態 022）→ 拠点・親契約・法人の状態が変わる（保存される。再読み込みしても同じ）。足りない情報（仮登録がまだ・住所・電話・メイン担当者・プラン・配送の設定 など）があるときは非活性にして、横に「足りない情報：…」を出す。必須のタブを保存していないときは「必須のタブを保存してください（n／m）」を出す。", "Lối vào đăng ký chính thức chỉ là nút này (theo từng điểm; sổ F 2026-10-06 (1): bỏ 「この拠点を確定」「正式登録する」 chỉ đổi trên màn hình). Bấm thì xác nhận (trạng thái 022) → trạng thái điểm・hợp đồng cha・pháp nhân thay đổi (được lưu; tải lại vẫn như vậy). Khi còn thiếu thông tin (chưa đăng ký tạm・địa chỉ・điện thoại・người phụ trách chính・gói・thiết lập giao hàng...) thì không khả dụng và bên cạnh hiện 「足りない情報：…」. Khi chưa lưu tab bắt buộc thì hiện 「必須のタブを保存してください（n／m）」."), demo_ok=H_MSG),
    F("1.2", T("足りない情報の理由", "Lý do thiếu thông tin"), ".brow .mm", "label", detail=T("ボタンの下に「足りない情報：仮登録がまだです・住所…・メイン担当者（氏名・メールアドレス）」または「必須のタブを保存してください（n／m）」を出す。", "Dưới nút hiện 「足りない情報：chưa đăng ký tạm・địa chỉ…・người phụ trách chính (họ tên・email)」 hoặc 「必須のタブを保存してください（n／m）」.")),
]
D_TABS = [
    F("2", T("詳細情報設定のタブ", "Tab cài đặt thông tin chi tiết"), ".dtabs .es-tabs", "area", pattern="P-TAB", detail=T("タブは6つ（台帳 F 運営A Q2＝A）：法人／拠点／親契約／子契約／設備・オプション／料金・請求。拠点の基本情報・請求・資料は「拠点」タブの中の見出しにまとめ、契約種別の切替は「親契約」タブの先頭に置く。必須で保存していないタブには「未保存」、保存エラーのタブには「要確認」を出す。法人が既存の申込は「法人」タブが出ない。", "6 tab (sổ F 運営A Q2=A): pháp nhân / điểm / hợp đồng cha / hợp đồng con / thiết bị・tùy chọn / phí・hóa đơn. Thông tin cơ bản, hóa đơn, tài liệu của điểm gộp thành tiêu đề trong tab 「拠点」, việc chuyển loại hợp đồng đặt ở đầu tab 「親契約」. Tab bắt buộc chưa lưu hiện 「未保存」, tab lỗi lưu hiện 「要確認」. Đơn có pháp nhân sẵn không có tab 「法人」.")),
    F("2.1", T("拠点名・保存の状態", "Tên điểm・trạng thái lưu"), ".tsub", "label", detail=T("「拠点1｜拠点名」と、そのタブの保存の状態：編集中／本登録済み／申込内容確認で確認済み／自動保存／最終更新 {日時} {操作者}／未保存／任意。", "「拠点1｜tên điểm」 và trạng thái lưu của tab đó: đang sửa / đã đăng ký chính thức / đã xác nhận ở xác nhận nội dung đơn / tự động lưu / cập nhật lần cuối {ngày giờ} {người thao tác} / chưa lưu / tùy chọn.")),
]
V012 = V("012", C, T("仮登録の確認（アカウント発行 既定ON・宛先）", "Xác nhận đăng ký tạm (cấp tài khoản mặc định ON・người nhận)"), "/ops/applications/AP-20261003-0069", JS + "qa('.es-tab').find(b=>b.textContent.trim().startsWith('配送の設定')).click();await sleep(600);if(q('#rtEdit')){q('#rtEdit').click();}await sleep(500);qa('#rtcard tbody tr td:nth-child(4) select').forEach(s=>sets(s,'2'));await sleep(400);qa('#rtcard select').filter(s=>!s.value&&[...s.options].some(o=>/^WH/.test(o.value))).forEach(s=>sets(s,[...s.options].find(o=>/^WH/.test(o.value)).value));await sleep(500);q('#rtSave').click();await sleep(900);" + "btn('申込内容の確認を完了').click();await sleep(1000);", [
    F("8", T("仮登録の確認", "Xác nhận đăng ký tạm"), ".es-dialog__panel", "modal", err=["S34"], detail=T("見出し＝「申込内容を仮登録しますか？」。注意事項「子契約・配送データは本登録（拠点ごと）で作ります。仮登録では、拠点・親契約・アカウント・最初のオーダー・資材の初期セットを作ります」、仮登録の対象（法人情報・拠点情報・親契約の件数）、アカウント発行確認、ログイン案内メールの宛先の表。[キャンセル][仮登録する]。", "Tiêu đề = 「申込内容を仮登録しますか？」. Lưu ý 「子契約・配送データは本登録（拠点ごと）で作ります。仮登録では、拠点・親契約・アカウント・最初のオーダー・資材の初期セットを作ります」, đối tượng đăng ký tạm (số lượng thông tin pháp nhân・điểm・hợp đồng cha), xác nhận cấp tài khoản, bảng người nhận email hướng dẫn đăng nhập. [キャンセル][仮登録する]."), demo_ok=H_MSG),
    F("8.1", T("アカウント発行", "Cấp tài khoản"), ".es-dialog__panel label.es-check", "check", "check", req="○", len="ON／OFF", init=T("ON（既定）", "ON (mặc định)"), ex=["ON", "Có cấp tài khoản pháp nhân・điểm khi đăng ký tạm hay không"], detail=T("ON（既定）：仮登録のときに法人アカウント・拠点アカウントを発行し、全担当者へログイン案内を送る。OFF：仮登録ではアカウントを発行せず、拠点の本登録のときに発行して案内を送る。既存の法人に拠点を足す申込は法人アカウントを新しく作らない。", "ON (mặc định): cấp tài khoản pháp nhân・tài khoản điểm khi đăng ký tạm và gửi hướng dẫn đăng nhập cho toàn bộ người phụ trách. OFF: không cấp tài khoản khi đăng ký tạm, cấp và gửi hướng dẫn khi đăng ký chính thức điểm. Đơn thêm điểm vào pháp nhân có sẵn không tạo tài khoản pháp nhân mới.")),
    F("8.2", T("ログイン案内メールの宛先", "Người nhận email hướng dẫn đăng nhập"), ".es-dialog__panel .secttl::ログイン案内メールの宛先", "area", detail=T("アカウントごと（法人／拠点）に、メイン・サブ・請求担当者の全員（担当者でなければお申し込み者）の名前とメールアドレスを表で出す（台帳 28-139）。同じ人は1通。", "Theo từng tài khoản (pháp nhân / điểm), hiện bảng họ tên và email của toàn bộ người phụ trách chính・phụ・hóa đơn (nếu không phải người phụ trách thì là người đăng ký) (sổ 28-139). Cùng một người thì 1 email.")),
    F("8.3", T("仮登録する", "Đăng ký tạm"), ".es-dialog__panel button::仮登録する", "button", "click", err=["S34", "E30"], detail=T("配送の設定を保存してから仮登録する（申込内容の確認を完了 → 仮登録の順）。仮登録すると申込は「契約設定中」になり、仮登録の完了（状態 032）を出す。", "Lưu thiết lập giao hàng rồi đăng ký tạm (hoàn tất xác nhận nội dung đơn → đăng ký tạm). Đăng ký tạm thì đơn thành 「契約設定中」 và hiện hoàn tất đăng ký tạm (trạng thái 032).")),
], wait=900, note=T("AP-20261003-0069（既存の法人に拠点を足す申込）で「申込内容の確認を完了」を押した直後。", "Ngay sau khi bấm 「申込内容の確認を完了」 ở AP-20261003-0069 (đơn thêm điểm vào pháp nhân có sẵn)."))
V013 = V("013", C, T("詳細情報設定：拠点の表とタブ（子契約・参照）", "Cài đặt thông tin chi tiết: bảng điểm và tab (hợp đồng con・xem)"), "/ops/applications/" + DNO, "", D_TABLE + D_TABS + [
    F("3", T("契約（プラン・コース）", "Hợp đồng (gói・khóa)"), ".vbody .secttl", "area", detail=T("子契約タブ：子契約ID・契約サイクル月・契約（プランID・コース・適用開始月／終了月）・アプリの利用設定（1日上限数・1ヶ月上限金額）・配送・納品スケジュール（配送区分・納品不可曜日・納品予定日になった場合・配送備考）・配送ルート設定・メモ。仮登録のときの最初のサイクルの子契約を直す。", "Tab hợp đồng con: ID hợp đồng con・tháng chu kỳ hợp đồng・hợp đồng (ID gói・khóa・tháng bắt đầu / kết thúc áp dụng)・thiết lập sử dụng ứng dụng (số lượng tối đa mỗi ngày・số tiền tối đa mỗi tháng)・lịch giao (loại giao・ngày không giao được・khi ngày giao dự kiến không được・ghi chú giao hàng)・thiết lập tuyến giao hàng・ghi chú. Sửa hợp đồng con của chu kỳ đầu tiên khi đăng ký tạm.")),
], full=True, wait=900, note=T("AP-20260920-0052（契約設定中・1拠点）。「保存」「キャンセル」は編集にしたときだけ出る。コードの拠点の表にある「操作」の見出しの下に本登録のボタンが並ぶ。", "AP-20260920-0052 (契約設定中・1 điểm). 「保存」「キャンセル」 chỉ hiện khi sửa. Nút đăng ký chính thức nằm dưới tiêu đề 「操作」 của bảng điểm trong code."))
V014 = V("014", C, T("法人タブ（基本情報・住所・担当者・請求）", "Tab pháp nhân (thông tin cơ bản・địa chỉ・người phụ trách・hóa đơn)"), "/ops/applications/" + DNO, DTAB("法人"), [
    F("3", T("法人の基本情報", "Thông tin cơ bản của pháp nhân"), ".secttl::法人の基本情報", "area", detail=T("法人名・法人名フリガナ・法人名（契約）・請求先法人名・ES営業担当（必須）・法人ステータス（仮登録・参照）・法人ID。仮登録のときに法人を作る。入力の決まり（文字数・全角カタカナなど）は法人編集（AW_CORP_003）と同じ。", "Tên pháp nhân・furigana・tên pháp nhân (hợp đồng)・tên nhận hóa đơn・ES営業担当 (bắt buộc)・trạng thái pháp nhân (đăng ký tạm・xem)・ID pháp nhân. Tạo pháp nhân khi đăng ký tạm. Quy tắc nhập (số ký tự, Katakana toàn góc...) giống sửa pháp nhân (AW_CORP_003).")),
    F("3.1", T("請求書に載る住所", "Địa chỉ ghi trên hóa đơn"), ".secttl::請求書に載る住所", "area", detail=T("郵便番号・都道府県・市区町村・町名・番地・建物等・電話番号。郵便番号・都道府県・市区町村・町名・番地・電話番号は必須（本登録の条件）。", "Mã bưu chính・tỉnh・quận / huyện・khu phố・số nhà・tòa nhà・điện thoại. Mã bưu chính, tỉnh, quận / huyện, khu phố・số nhà, điện thoại là bắt buộc (điều kiện đăng ký chính thức).")),
    F("3.2", T("法人の担当者", "Người phụ trách của pháp nhân"), ".secttl::法人の担当者", "table", detail=T("区分（メイン担当者／請求担当者／サブ担当者）・担当者名・フリガナ・メールアドレス・電話番号の表。メイン担当者1名・請求担当者1名は必須（本登録の条件。申込フォーム §5-2）。", "Bảng loại (người phụ trách chính / hóa đơn / phụ)・họ tên・furigana・email・điện thoại. Bắt buộc 1 người phụ trách chính và 1 người phụ trách hóa đơn (điều kiện đăng ký chính thức; 申込フォーム §5-2).")),
    F("3.3", T("請求", "Hóa đơn"), ".secttl::請求", "area", detail=T("請求書の発行単位・請求書発行リードタイム・入金期限・支払方法・口座振替の手続きステータス・支払サイクル・起算月（年払いのとき）・Bill One 発行先ID。いずれかの拠点の請求先＝法人 のときは必須（AW_CORP_003 と同じ）。", "Đơn vị phát hành hóa đơn・lead time phát hành hóa đơn・hạn thanh toán・phương thức thanh toán・trạng thái thủ tục chuyển khoản tự động・chu kỳ thanh toán・tháng khởi tính (khi trả hàng năm)・ID nơi phát hành Bill One. Bắt buộc khi nơi nhận hóa đơn của một điểm nào đó = pháp nhân (giống AW_CORP_003)."), demo_ok=T("コードの請求書発行リードタイムの選択肢に「後払い」の文言が残る（宿題 H6）。仕様が正", "Lựa chọn lead time phát hành hóa đơn trong code còn chữ 「後払い」 (việc cần sửa H6). Theo đặc tả")),
], full=True, wait=900)
V015 = V("015", C, T("拠点タブ（基本情報・住所・担当者・請求先と請求条件・資料）", "Tab điểm (thông tin cơ bản・địa chỉ・người phụ trách・nơi nhận và điều kiện hóa đơn・tài liệu)"), "/ops/applications/" + DNO, DTAB("拠点"), [
    F("3", T("基本情報", "Thông tin cơ bản"), ".secttl::基本情報", "area", detail=T("拠点名・拠点名フリガナ・所属法人・従業員数・拠点ステータス（仮登録・参照）・拠点ID。拠点の基本情報・請求・資料は「拠点」タブの見出しにまとめる（台帳 F Q2）。", "Tên điểm・furigana tên điểm・pháp nhân trực thuộc・số nhân viên・trạng thái điểm (đăng ký tạm・xem)・ID điểm. Thông tin cơ bản, hóa đơn, tài liệu của điểm gộp thành tiêu đề của tab 「拠点」 (sổ F Q2).")),
    F("3.1", T("住所", "Địa chỉ"), ".secttl::住所", "area", detail=T("拠点の郵便番号・都道府県・市区町村・町名・番地・建物等・電話番号（必須の項目は法人の住所と同じ）。設置フロアは申込の値を引き継ぐ（自販機は必須）。", "Mã bưu chính・tỉnh・quận / huyện・khu phố・số nhà・tòa nhà・điện thoại của điểm (mục bắt buộc giống địa chỉ pháp nhân). Tầng lắp đặt kế thừa giá trị của đơn (máy bán hàng là bắt buộc)."), demo_ok=T("コードの拠点タブに「設置フロア」の欄がない（拠点の専用の項目に入る・台帳 B）。仕様が正", "Tab điểm trong code chưa có ô 「設置フロア」 (vào mục riêng của điểm; sổ B). Theo đặc tả")),
    F("3.2", T("担当者", "Người phụ trách"), ".secttl::担当者", "table", detail=T("拠点のご担当者の表。メイン担当者1名は必須（法人と同じなら不要）。請求先＝この拠点 なら請求担当者も必須（申込フォーム §4-7）。", "Bảng người phụ trách của điểm. Bắt buộc 1 người phụ trách chính (không cần nếu giống pháp nhân). Nếu nơi nhận hóa đơn = điểm này thì bắt buộc cả người phụ trách hóa đơn (申込フォーム §4-7).")),
    F("3.3", T("請求先と請求条件", "Nơi nhận và điều kiện hóa đơn"), ".secttl::請求先と請求条件", "area", detail=T("請求先（法人／この拠点）・請求書発行リードタイムの上書き・入金期限・支払方法・口座振替の手続きステータス・支払サイクル・起算月・Bill One 発行先ID。請求先＝この拠点のときだけ請求条件が必須。", "Nơi nhận hóa đơn (pháp nhân / điểm này)・ghi đè lead time phát hành hóa đơn・hạn thanh toán・phương thức thanh toán・trạng thái thủ tục chuyển khoản tự động・chu kỳ thanh toán・tháng khởi tính・ID nơi phát hành Bill One. Điều kiện hóa đơn chỉ bắt buộc khi nơi nhận hóa đơn = điểm này.")),
    F("3.4", T("資料", "Tài liệu"), ".secttl::資料", "area", detail=T("添付資料（法人に公開）と添付資料（社内のみ・非公開）の2つの表（ファイル名・形式・容量・登録日・操作）。JPG・PNG・PDF・HEIC、1ファイル5MB・10件まで（E11・E119）。", "Hai bảng tài liệu đính kèm (công khai cho pháp nhân) và tài liệu đính kèm (chỉ nội bộ・không công khai) (tên tệp・định dạng・dung lượng・ngày đăng ký・thao tác). JPG・PNG・PDF・HEIC, mỗi tệp 5MB, tối đa 10 tệp (E11・E119)."), err=["E11", "E119"]),
], full=True, wait=900)
V016 = V("016", C, T("親契約タブ（契約種別・開始サイクル月・子契約の一覧）", "Tab hợp đồng cha (loại hợp đồng・tháng chu kỳ bắt đầu・danh sách hợp đồng con)"), "/ops/applications/" + DNO, DTAB("親契約"), [
    F("4", T("編集", "Sửa"), "#btnEdit", "button", "click", cond=UPD, detail=T("そのタブを編集にする（参照 → 編集 → 保存／キャンセル。DS の CrudPattern）。本登録済みの拠点・完了した申込には出さない（参照のみ）。自動保存のタブにも出さない。", "Chuyển tab đó sang chế độ sửa (xem → sửa → lưu / hủy; CrudPattern của DS). Không hiện với điểm đã đăng ký chính thức・đơn đã hoàn tất (chỉ xem). Không hiện với tab tự động lưu.")),
    F("3", T("親契約", "Hợp đồng cha"), ".secttl::親契約", "area", detail=T("親契約番号（契約ID）・契約種別・契約ステータス（仮登録）・開始サイクル月（必須）・契約開始年月・代理店コード（紹介有無）・お試し期間（月数）。契約種別の切替（お試し→本導入）は、このタブの先頭に置く（台帳 F Q2。状態 023）。", "Số hợp đồng cha (ID hợp đồng)・loại hợp đồng・trạng thái hợp đồng (đăng ký tạm)・tháng chu kỳ bắt đầu (bắt buộc)・tháng bắt đầu hợp đồng・mã đại lý (có giới thiệu hay không)・thời gian dùng thử (số tháng). Việc chuyển loại hợp đồng (dùng thử → chính thức) đặt ở đầu tab này (sổ F Q2; trạng thái 023).")),
    F("3.1", T("開始サイクル月", "Tháng chu kỳ bắt đầu"), ".fld::開始サイクル月", "select", "select", req="○", len=["年月 yyyy-mm（選択）", "Năm-tháng yyyy-mm (chọn)"], init=T("申込の希望月", "Tháng mong muốn của đơn"), ex=["2026-11", "Tháng chu kỳ bắt đầu hợp đồng"], err=["E02", "E68"], detail=T("仮登録のあとで直せる（共通データの登録パネルの欄をここへ吸収・台帳 F Q1）。オーダー締切を過ぎた月は選べない（E68）。", "Sửa được sau khi đăng ký tạm (gộp ô của bảng đăng ký dữ liệu chung vào đây; sổ F Q1). Không chọn được tháng đã quá hạn chốt order (E68).")),
    F("3.2", T("子契約の一覧", "Danh sách hợp đồng con"), ".secttl::一覧（子契約）", "table", detail=T("契約・サイクル月・子契約ID・プラン・配送区分・請求対象月・請求ステータス・生成方法の表。仮登録では最初のサイクルの子契約を作り、先のサイクルは本登録で作る。", "Bảng tháng chu kỳ hợp đồng・ID hợp đồng con・gói・loại giao・tháng tính phí・trạng thái hóa đơn・cách tạo. Khi đăng ký tạm tạo hợp đồng con của chu kỳ đầu tiên, các chu kỳ sau tạo khi đăng ký chính thức."), demo_ok=H_PREPAID),
], full=True, wait=900)
V017 = V("017", C, T("子契約タブ：配送ルート・メモ", "Tab hợp đồng con: tuyến giao hàng・ghi chú"), "/ops/applications/" + DNO, DTAB("子契約"), [
    F("3", T("配送・納品スケジュール", "Lịch giao"), ".secttl::配送・納品スケジュール", "area", detail=T("配送区分（必須）・納品不可曜日（月〜日＋祝日のチェック。全部は選べない）・納品予定日になった場合（前倒す／後ろ倒す・必須）・配送備考（500文字）。", "Loại giao (bắt buộc)・ngày không giao được (ô đánh dấu thứ Hai〜Chủ nhật + ngày lễ; không chọn hết)・khi ngày giao dự kiến không được (đẩy sớm / dời muộn; bắt buộc)・ghi chú giao hàng (500 ký tự)."), demo_ok=T("コードの納品不可曜日・配送備考は1行の欄。仕様は曜日のチェック・500文字（宿題）", "Ngày không giao được・ghi chú giao hàng trong code là ô 1 dòng. Đặc tả là ô đánh dấu thứ・500 ký tự (việc cần sửa)")),
    F("3.1", T("配送ルート設定", "Thiết lập tuyến giao hàng"), ".secttl::配送ルート設定（配送種別ごと）", "table", detail=T("配送種別ごとに ピッキング倉庫・運送会社・納品会社・途中経由・リードタイム・配送回数・配送パターン と、曜日・週（A〜D）の枠を入れる（すべて必須）。「エリアの既定値を入れる」で入れる。資材の初期セット（無料）の納品日もここで決める。選択肢はマスタから出す（宿題 H11）。", "Nhập theo từng loại giao: kho picking・hãng vận chuyển・công ty giao・điểm trung chuyển・lead time・số lần giao・mẫu giao và ô thứ・tuần (A〜D) (tất cả bắt buộc). Nhập bằng 「エリアの既定値を入れる」. Ngày giao bộ vật tư ban đầu (miễn phí) cũng quyết định ở đây. Lựa chọn lấy từ master (việc cần sửa H11)."), demo_ok=T("コードの選択肢は固定の一覧（倉庫2・運送会社7・リードタイム3・委託先4）。仕様はマスタ（宿題 H11）", "Lựa chọn trong code là danh sách cố định (kho 2, hãng vận chuyển 7, lead time 3, đơn vị ủy thác 4). Đặc tả dùng master (việc cần sửa H11)")),
    F("3.2", T("運営メモ", "Ghi chú vận hành"), ".fld::運営メモ", "textarea", "input", req="－", len="文字列 500（複数行）", init=T("空", "Trống"), ex=["営業から、設置は午前中を希望と連絡あり", "Ghi chú nội bộ (tối đa 500 ký tự, nhiều dòng)"], err=["E04", "E13"], detail=T("運営だけが見る自由記述（法人には出さない）。", "Văn bản tự do chỉ vận hành xem (không hiện cho pháp nhân)."), demo_ok=H_MAXLEN),
], full=True, wait=900)
V018 = V("018", C, T("設備・オプションタブ", "Tab thiết bị・tùy chọn"), "/ops/applications/" + DNO, DTAB("設備・オプション"), [
    F("3", T("設備の異動（この子契約で登録）", "Di chuyển thiết bị (đăng ký ở hợp đồng con này)"), ".secttl::設備の異動（この子契約で登録）", "table", detail=T("列＝異動区分・対象の貸出ID・設備区分・機種・数量・月額（税抜）・初期（税抜）・予定日・理由・操作。プランの標準貸出設備から自動で引き当てる（機種マスタの公開中の機種）。サイズ差額は差額だけ請求（OP000023）。", "Cột = loại di chuyển・ID cho mượn đối tượng・loại thiết bị・máy・số lượng・tiền hàng tháng (chưa thuế)・ban đầu (chưa thuế)・ngày dự kiến・lý do・thao tác. Tự động lấy từ thiết bị cho mượn tiêu chuẩn của gói (máy đang công khai trong master máy). Chênh lệch kích thước chỉ tính phần chênh (OP000023)."), demo_ok=T("見本の貸出は申込から引き当てられていないため表は空（宿題 H8）", "Cho mượn trong dữ liệu mẫu chưa được lấy từ đơn nên bảng trống (việc cần sửa H8)")),
    F("3.1", T("搬入希望日・設置予定日", "Ngày mong muốn đưa vào・ngày dự kiến lắp đặt"), ".fld::搬入希望日", "date", "input", req="○", len="日付 yyyy-mm-dd", init=T("空", "Trống"), ex=["2026-11-02", "Ngày mong muốn đưa vào・ngày dự kiến lắp đặt (yyyy-mm-dd)"], err=["E01"], detail=T("必須のタブ「設備・オプション」を保存する条件。設備手配のリードタイムは1週間程度。", "Điều kiện lưu tab bắt buộc 「設備・オプション」. Lead time chuẩn bị thiết bị khoảng 1 tuần."), demo_ok=H_DATE),
    F("3.2", T("オプション・割引", "Tùy chọn・giảm giá"), ".secttl::オプション・割引（このサイクル月）", "table", detail=T("列＝異動区分・区分・コード・名称・数量・金額・率（＋請求／−値引き）・適用開始月・理由・操作。申込で選んだオプション（設置代行 OP000007 など）と、お試しキャンペーン割引などを出す。", "Cột = loại di chuyển・loại・mã・tên・số lượng・số tiền・tỉ lệ (+ tính phí / − giảm giá)・tháng bắt đầu áp dụng・lý do・thao tác. Hiện tùy chọn đã chọn khi đăng ký (lắp đặt hộ OP000007...) và giảm giá chiến dịch dùng thử...")),
], full=True, wait=900)
V019 = V("019", C, T("料金・請求タブ（固定額・金額サマリー・値引き）", "Tab phí・hóa đơn (số tiền cố định・tóm tắt số tiền・giảm giá)"), "/ops/applications/" + DNO, DTAB("料金・請求"), [
    F("3", T("固定額の請求額", "Số tiền cố định"), ".secttl::固定額（前払い）の請求額", "table", detail=T("請求月・料金項目（基本料金など）・料金種別・対象期間・税抜金額・税率・出どころ区分の表。お試しはお試しキャンペーン割引の行が入る。金額は「1,000円」の書き方（税抜）。", "Bảng tháng phát hành hóa đơn・khoản phí (phí cơ bản...)・loại phí・kỳ áp dụng・số tiền chưa thuế・thuế suất・phân loại nguồn. Dùng thử có thêm dòng giảm giá chiến dịch dùng thử. Số tiền viết dạng 「1,000円」 (chưa thuế)."), demo_ok=H_PREPAID),
    F("3.1", T("金額サマリー", "Tóm tắt số tiền"), ".fld::内訳", "label", detail=T("「初期 n円・月額 n円・単発 n円・値引き n円」の合計の要約。", "Tóm tắt tổng 「ban đầu n yên・hàng tháng n yên・một lần n yên・giảm giá n yên」.")),
    F("3.2", T("値引き・負担額", "Giảm giá・phần chịu"), ".secttl::値引き・負担額", "area", detail=T("福利厚生の適用（適用する／しない）・価格調整（このサイクル月）。企業負担額は運営が受付で聞く（申込では聞かない・申込フォーム §5-1）。", "Áp dụng phúc lợi (áp dụng / không)・điều chỉnh giá (tháng chu kỳ này). Số tiền công ty chịu do vận hành hỏi ở tiếp nhận (không hỏi khi đăng ký; 申込フォーム §5-1).")),
], full=True, wait=900)
V020 = V("020", C, T("編集中（保存・キャンセル）", "Đang sửa (lưu・hủy)"), "/ops/applications/" + DNO, DEDIT, [
    F("4", T("保存", "Lưu"), "#btnSave", "button", "click", cond=UPD, pattern="P-FORM", err=["S01", "E30", "E31"], detail=T("必須の欄をまとめてチェックし、エラーがなければそのタブを保存する（共通データへ入れる欄・担当者の表・設備の表を含む）。保存できたら「{拠点名}／{タブ名} を保存しました」（S01）。ほかの人が先に保存していれば E31。再読み込みしても保存した内容が残る。", "Kiểm tra gộp các ô bắt buộc, không lỗi thì lưu tab đó (gồm ô nhập vào dữ liệu chung・bảng người phụ trách・bảng thiết bị). Lưu được thì 「{tên điểm}／{tên tab} を保存しました」 (S01). Người khác đã lưu trước thì E31. Tải lại vẫn còn nội dung đã lưu."), demo_ok=H_MSG),
    F("4.1", T("キャンセル", "Hủy"), "#btnCancel", "button", "click", err=["Q02"], detail=T("編集をやめて参照に戻る。変更があれば破棄の確認（Q02）。", "Dừng sửa và về chế độ xem. Nếu có thay đổi thì xác nhận hủy bỏ (Q02).")),
    F("4.2", T("編集中の表示", "Hiển thị khi sửa"), ".tsub .tmeta", "label", detail=T("タブの保存の状態の表示が「編集中」になる。他のタブ・拠点への移動やパンくずで離れると、変更があれば破棄の確認（状態 027）。", "Phần hiển thị trạng thái lưu của tab thành 「編集中」. Khi rời đi bằng tab・điểm khác hoặc breadcrumb, nếu có thay đổi thì xác nhận hủy bỏ (trạng thái 027).")),
], wait=900, note=T("子契約タブで「編集」を押した直後。", "Ngay sau khi bấm 「編集」 ở tab hợp đồng con."))
V021 = V("021", C, T("保存エラー（タブに「要確認」・n件）", "Lỗi lưu (tab hiện 「要確認」・n mục)"), "/ops/applications/" + DNO, DEDIT + "btn('保存',q('.es-pagehead__actions')).click();await sleep(800);", [
    F("4", T("入力内容に不足があります", "Nội dung nhập còn thiếu"), ".toast", "toast", "show", err=["E01", "E30"], pattern="P-FORM", detail=T("必須の欄が空のまま「保存」を押すと、保存せずにエラーの欄を赤枠にして、最初の欄までスクロールし、トースト「入力内容に不足があります（n件）」を出す。そのタブの見出しに「要確認」の札を付ける（札の言葉は「要確認」のまま・台帳 運営A Q20）。エラーの文言は項目の下（E01 など）。", "Bấm 「保存」 khi còn ô bắt buộc trống thì không lưu, viền đỏ các ô lỗi, cuộn tới ô đầu tiên và hiện toast 「入力内容に不足があります（n件）」. Gắn nhãn 「要確認」 ở tiêu đề tab đó (chữ của nhãn giữ 「要確認」, sổ 運営A Q20). Câu lỗi nằm dưới mục (E01...)."), demo_ok=T("コードのエラーはトーストと赤枠で、項目の下の文言はない（宿題 H12）。仕様は項目の下に共通メッセージ（E01 ほか）", "Lỗi trong code là toast và viền đỏ, không có câu dưới mục (việc cần sửa H12). Đặc tả là thông báo chung dưới mục (E01...)")),
    F("4.1", T("「要確認」の札", "Nhãn 「要確認」"), ".dtabs .es-tab__count", "label", detail=T("エラーのあるタブに「要確認」の札を出す（保存できていない必須のタブは「未保存」）。言葉は「要確認」のまま（hong 2026-10-07・台帳 運営A Q20）。", "Gắn nhãn 「要確認」 vào tab có lỗi (tab bắt buộc chưa lưu là 「未保存」). Giữ chữ 「要確認」 (hong 2026-10-07, sổ 運営A Q20).")),
], wait=900, note=T("編集にして、何も入れずに「保存」を押した直後（子契約タブ）。", "Ngay sau khi chuyển sang sửa và bấm 「保存」 mà không nhập gì (tab hợp đồng con)."))
V022 = V("022", C, T("本登録の確認・完了（拠点ごと）", "Xác nhận・hoàn tất đăng ký chính thức (theo điểm)"), "/ops/applications/" + DNO, "", [
    F("5", T("本登録の確認", "Xác nhận đăng ký chính thức"), ".brconf", "button", "click", err=["S35"], detail=T("「この拠点を本登録」を押すと確認の小窓（見出し＝「{拠点番号}｜{拠点名} を本登録しますか？」・対象・適用日・この本登録で進む n／m拠点）。「この拠点を本登録」で拠点・親契約・法人の状態を変える（法人は最初の拠点が本登録になったとき正式登録）。完了の小窓に本登録前→本登録後の表を出し、残りの拠点数、全拠点なら「全n拠点の本登録が完了しました」と「申請完了の内容を確認」を出す（状態 025）。申込は全拠点が済むと「完了」。", "Bấm 「この拠点を本登録」 thì hiện cửa sổ xác nhận (tiêu đề = 「{số điểm}｜{tên điểm} を本登録しますか？」・đối tượng・ngày áp dụng・n/m điểm sẽ đi tiếp qua đăng ký chính thức này). Bấm 「この拠点を本登録」 để đổi trạng thái điểm・hợp đồng cha・pháp nhân (pháp nhân thành 「正式登録」 khi điểm đầu tiên được đăng ký chính thức). Cửa sổ hoàn tất hiện bảng trước → sau đăng ký chính thức, số điểm còn lại, nếu toàn bộ điểm thì hiện 「全n拠点の本登録が完了しました」 và 「申請完了の内容を確認」 (trạng thái 025). Đơn thành 「完了」 khi toàn bộ điểm xong."), demo_ok=H_NOSEED),
], wait=700, note=T("見本の申込には、本登録に必要な情報（住所・電話・メイン担当者・プラン・配送の設定）と必須のタブの保存がそろうものがなく、本登録の確認・完了は撮影できない（画像は拠点の表。ボタンは非活性で、足りない情報を横に出す）。", "Không đơn nào trong dữ liệu mẫu đủ thông tin cần cho đăng ký chính thức (địa chỉ・điện thoại・người phụ trách chính・gói・thiết lập giao hàng) và đã lưu các tab bắt buộc, nên không chụp được xác nhận・hoàn tất đăng ký chính thức (ảnh là bảng điểm. Nút không khả dụng, bên cạnh hiện thông tin còn thiếu)."))
V023 = V("023", C, T("切替（お試し→本導入・AP-20261005-0071）", "Chuyển (dùng thử → chính thức・AP-20261005-0071)"), "/ops/applications/AP-20261005-0071", DTAB("親契約"), [
    F("3", T("契約種別の切替", "Chuyển loại hợp đồng"), ".secttl::契約種別の期間", "area", detail=T("お試し中の拠点を本導入へ切り替える申込。拠点ごとに、同じ親契約の契約種別を本導入へ変える。切替の入口は2つ（お客様の申請を契約申請管理で承認／運営が拠点の画面で「本導入に切り替える」）で、どちらも同じ処理（台帳 F 2026-10-06 (5)）。承認待ちの切替申請がある拠点は、拠点の「本導入に切り替える」を非活性にして理由を出す（AW_BRCH）。仕様は契約種別の切替を「親契約」タブの先頭に置く（Q2）。コードは「親契約」タブの先頭に、見出し「契約種別の期間（親契約 {番号}）」（契約種別の履歴の表）・「お試しの期間の終了」（お試しの終了日・切替後の扱い）・「引き継ぐもの・引き継がないもの」（表）の3つを並べている。", "Đơn chuyển điểm đang dùng thử sang chính thức. Với từng điểm, đổi loại hợp đồng của cùng hợp đồng cha sang chính thức. Có 2 lối vào (đơn của khách duyệt ở quản lý đơn hợp đồng / vận hành bấm 「本導入に切り替える」 ở màn hình điểm), cùng một xử lý (sổ F 2026-10-06 (5)). Điểm có đơn chuyển đang chờ duyệt thì nút 「本導入に切り替える」 của điểm không khả dụng và hiện lý do (AW_BRCH). Đặc tả đặt việc chuyển loại hợp đồng ở đầu tab 「親契約」 (Q2). Code đặt ở đầu tab 「親契約」 3 mục: 「契約種別の期間（親契約 {số}）」 (bảng lịch sử loại hợp đồng), 「お試しの期間の終了」 (ngày kết thúc dùng thử・cách xử lý sau khi chuyển), 「引き継ぐもの・引き継がないもの」 (bảng)."), demo_ok=T("コードの見出しは「契約種別の期間」「お試しの期間の終了」「引き継ぐもの・引き継がないもの」の3つで、仕様の呼び名「契約種別の切替」の見出しはない（見出しの言葉を揃えるのは宿題）。置き場所（親契約タブの先頭）は仕様どおり", "Tiêu đề trong code là 3 mục 「契約種別の期間」「お試しの期間の終了」「引き継ぐもの・引き継がないもの」, không có tiêu đề tên theo đặc tả 「契約種別の切替」 (thống nhất tên tiêu đề là việc cần sửa). Vị trí (đầu tab hợp đồng cha) đúng đặc tả")),
    F("3.1", T("切替の申込の拠点の表", "Bảng điểm của đơn chuyển"), "#dscreen .card:first-child", "area", detail=T("切替の申込は複数拠点のとき拠点ごとに本登録の相当（切替の確定）を行う。法人は既存で、法人タブは出ない。", "Đơn chuyển nhiều điểm thì thực hiện việc tương đương đăng ký chính thức (xác định chuyển) theo từng điểm. Pháp nhân có sẵn nên không có tab pháp nhân.")),
], full=True, wait=900)
V024 = V("024", C, T("却下・取り下げ済みを直接アドレスで開く（理由・日時だけ）", "Mở trực tiếp bằng địa chỉ đơn bị từ chối・đã rút (chỉ lý do・ngày giờ)"), "/ops/applications/AP-20260915-0048", "", [
    F("3", T("申請情報（却下）", "Thông tin đơn (từ chối)"), "h2::申請情報^", "area", detail=T("却下・取り下げ済みの申込は受付画面を開かず、申請情報（法人／拠点・ステータス・却下した人・日時（取り下げは取り下げ日時）・却下理由（取り下げは取り下げ理由）・お客様へのひとこと）だけを出す。一覧からは同じ内容をダイアログで出す（AW_APPL_001 状態 004）。", "Đơn bị từ chối / đã rút không mở màn hình tiếp nhận mà chỉ hiện thông tin đơn (pháp nhân / điểm・trạng thái・người từ chối・ngày giờ (rút đơn là ngày giờ rút)・lý do từ chối (rút đơn là lý do rút)・lời nhắn cho khách). Từ danh sách hiện cùng nội dung bằng hộp thoại (AW_APPL_001 trạng thái 004)."), demo_ok=T("見本の却下は却下した人・日時の記録がなく「—」を出す", "Từ chối trong dữ liệu mẫu không có ghi chép người từ chối・ngày giờ nên hiện 「—」")),
], wait=800, note=T("AP-20260915-0048（却下）。取り下げ済み AP-20260918-0050 も同じ形。", "AP-20260915-0048 (từ chối). Đơn đã rút AP-20260918-0050 cũng cùng dạng."))
V025 = V("025", C, T("申請完了の内容", "Nội dung hoàn tất đơn"), "/ops/applications/AP-20260410-0019", JS + "btn('申請完了の内容を確認').click();await sleep(900);", [
    F("5", T("申請完了の内容", "Nội dung hoàn tất đơn"), ".es-dialog__panel", "modal", detail=T("見出し＝申請完了の案内。説明・項目／名称／変更前／変更後の表（法人・拠点・親契約・子契約・オーダー・アカウントなどが 仮登録→本登録、生成済み など）・完了のメッセージ（法人へ完了のお知らせを送った旨）。完了した申込のヘッダーの「申請完了の内容を確認」から、全拠点の本登録のあとにも開く。", "Tiêu đề = hướng dẫn hoàn tất đơn. Giải thích, bảng mục / tên / trước / sau (pháp nhân・điểm・hợp đồng cha・hợp đồng con・order・tài khoản... từ đăng ký tạm → đăng ký chính thức, đã tạo...), thông báo hoàn tất (đã gửi thông báo hoàn tất cho pháp nhân). Mở từ 「申請完了の内容を確認」 ở phần đầu đơn đã hoàn tất, và cả sau khi toàn bộ điểm đăng ký chính thức.")),
], wait=900, note=T("完了済みの申込 AP-20260410-0019 の「申請完了の内容を確認」を押した直後。", "Ngay sau khi bấm 「申請完了の内容を確認」 của đơn đã hoàn tất AP-20260410-0019."))
V026 = V("026", C, T("完了済みの申込を開く（詳細情報設定を参照のみ）", "Mở đơn đã hoàn tất (cài đặt thông tin chi tiết chỉ xem)"), "/ops/applications/AP-20260410-0019", "", D_TABLE[:1] + [
    F("3", T("完了済みの表示", "Hiển thị đơn đã hoàn tất"), ".es-pagehead__actions", "area", detail=T("完了した申込は、詳細情報設定を参照のみで開く（全拠点「本登録済」＋ヘッダーに「申請完了の内容を確認」。台帳 F 運営A Q1(b)＝A）。編集・保存・却下・取り下げ・本登録のボタンは出さない。コードは申込内容確認の段階から開く場合がある（宿題・Q1(b)）。", "Đơn hoàn tất mở ở chế độ chỉ xem của cài đặt thông tin chi tiết (toàn bộ điểm 「本登録済」 + 「申請完了の内容を確認」 ở phần đầu; sổ F 運営A Q1(b)=A). Không hiện nút sửa・lưu・từ chối・rút đơn・đăng ký chính thức. Code có thể mở từ giai đoạn xác nhận nội dung đơn (việc cần sửa; Q1(b))."), demo_ok=T("見本の完了済みの申込は詳細情報設定の拠点が1つで「本登録済」の札が出る。コードの拠点の表の見え方は宿題", "Đơn hoàn tất của dữ liệu mẫu có 1 điểm trong cài đặt thông tin chi tiết với nhãn 「本登録済」. Cách hiển thị bảng điểm trong code là việc cần sửa")),
], full=True, wait=900, note=T("AP-20260410-0019（完了）。", "AP-20260410-0019 (hoàn tất)."))
V027 = V("027", C, T("破棄の確認（編集中にタブ・拠点を移る）", "Xác nhận hủy bỏ (chuyển tab・điểm khi đang sửa)"), "/ops/applications/" + DNO, DEDIT + "setv(q('textarea'),'メモ');await sleep(300);qa('.dtabs .es-tab').find(b=>b.textContent.trim().startsWith('法人')).click();await sleep(800);", [
    F("5", T("破棄の確認", "Xác nhận hủy bỏ"), ".es-modal__panel", "modal", err=["Q02"], detail=T("編集中に変更があるまま、ほかのタブ・拠点・一覧・ブラウザの再読み込みへ移ろうとしたときに出す。見出し＝「編集中の内容を破棄しますか？」・本文「保存していない変更は失われます。」・[編集を続ける][破棄して移動]（キャンセルのときは [破棄する]）。", "Hiện khi đang sửa có thay đổi mà định chuyển sang tab・điểm khác, danh sách, tải lại trình duyệt. Tiêu đề = 「編集中の内容を破棄しますか？」・nội dung 「保存していない変更は失われます。」・[編集を続ける][破棄して移動] (khi hủy là [破棄する])."), demo_ok=T("コードの文言は Q02「入力内容を破棄しますか？／保存していない内容は失われます。」と違う（[msg]）", "Câu trong code khác Q02 「入力内容を破棄しますか？／保存していない内容は失われます。」 ([msg])")),
], wait=900)
V028 = V("028", C, T("取り下げ（仮登録のあと・理由は必須）", "Rút đơn (sau đăng ký tạm・lý do bắt buộc)"), "/ops/applications/AP-20261001-0066", WD_OPEN, [
    F("5", T("仮登録のあとの取り下げ", "Rút đơn sau đăng ký tạm"), ".es-modal__panel", "modal", err=["Q14", "S19"], detail=T("仮登録のあとの取り下げ・却下は運営だけ（法人は運営へ連絡）。小窓に「仮登録した拠点のうち、まだ本登録していない拠点の 拠点・親契約・注文・資材の初期セットを取消にし、アカウントを停止します（本登録した拠点は解約の手続き）」を出す（台帳 F #26）。理由は必須。", "Chỉ vận hành rút đơn・từ chối sau đăng ký tạm (pháp nhân liên hệ vận hành). Cửa sổ hiện 「仮登録した拠点のうち、まだ本登録していない拠点の 拠点・親契約・注文・資材の初期セットを取消にし、アカウントを停止します（本登録した拠点は解約の手続き）」 (sổ F #26). Lý do bắt buộc."), demo_ok=H_MSG),
], wait=800, note=T("AP-20261001-0066（契約設定中）で「取り下げ」を押した直後。", "Ngay sau khi bấm 「取り下げ」 ở AP-20261001-0066 (契約設定中)."))
V029 = V("029", C, T("見つかりません（存在しない申請ID）", "Không tìm thấy (ID đơn không tồn tại)"), "/ops/applications/AP-99999999-0001", "", [
    F("5", T("見つからないメッセージ", "Thông báo không tìm thấy"), ".card .pad", "label", "show", err=["E100"], detail=T("存在しない申請IDのアドレスを開いたとき、「この申請は見つかりません。」と一覧へ戻るリンクを出す（E100 の「申請」版）。", "Khi mở địa chỉ có ID đơn không tồn tại, hiện 「この申請は見つかりません。」 và liên kết quay về danh sách (bản 「申請」 của E100)."), demo_ok=T("コードの文言は「この申請は見つかりません。契約申請管理へ戻る」。E100 に合わせる（宿題）", "Câu trong code là 「この申請は見つかりません。契約申請管理へ戻る」. Đưa về E100 (việc cần sửa)")),
], wait=700)
V030 = V("030", C, T("参照だけの役割（編集・本登録・却下なし）", "Vai trò chỉ xem (không sửa・đăng ký chính thức・từ chối)"), "/ops/applications/" + ROUTE, "", [
    F("5", T("参照だけの役割のヘッダー", "Phần đầu trang vai trò chỉ xem"), ".es-pagehead", "area", detail=T("経理（Ad00012・契約申請管理＝R）・閲覧のみ（Ad00013）には、却下・取り下げ・申込内容の確認を完了・編集・保存・本登録のボタンを出さない（灰色にもしない）。内容は参照できる。CS（R/U）は受付の保存・仮登録・本登録・取り下げ・却下ができる（台帳 F Q3）。", "Với kế toán (Ad00012, 契約申請管理 = R) và chỉ xem (Ad00013) không hiện nút từ chối・rút đơn・hoàn tất xác nhận nội dung đơn・sửa・lưu・đăng ký chính thức (cũng không làm xám). Xem được nội dung. CS (R/U) lưu tiếp nhận・đăng ký tạm・đăng ký chính thức・rút đơn・từ chối được (sổ F Q3).")),
], login="Ad00012", full=True, wait=900, note=T("経理（Ad00012）で表示。", "Hiển thị với kế toán (Ad00012)."))
V031 = V("031", C, T("仮登録の完了（拠点ごとの結果表）", "Hoàn tất đăng ký tạm (bảng kết quả theo điểm)"), "/ops/applications/AP-20261003-0069", JS + "qa('.es-tab').find(b=>b.textContent.trim().startsWith('配送の設定')).click();await sleep(600);if(q('#rtEdit')){q('#rtEdit').click();}await sleep(500);qa('#rtcard tbody tr td:nth-child(4) select').forEach(s=>sets(s,'2'));await sleep(400);qa('#rtcard select').filter(s=>!s.value&&[...s.options].some(o=>/^WH/.test(o.value))).forEach(s=>sets(s,[...s.options].find(o=>/^WH/.test(o.value)).value));await sleep(500);q('#rtSave').click();await sleep(900);" + "btn('申込内容の確認を完了').click();await sleep(900);btn('仮登録する',q('.es-dialog__panel')).click();await sleep(1500);", [
    F("5", T("仮登録の完了", "Hoàn tất đăng ký tạm"), ".es-dialog__panel", "modal", err=["S34"], detail=T("見出し＝仮登録の完了。法人（名前・ID・状態）と法人アカウント（ログインID・発行済・案内送信済／既存の法人は既存のアカウントのまま／OFF なら未発行）を出し、下に「拠点ごとに作ったもの」の表（1行＝1拠点）：拠点・親契約・子契約（最初のサイクル）・オーダー・資材の初期セット・拠点アカウント。ボタン＝「詳細情報の設定へ進む」。仮登録で作るもの＝拠点・親契約・アカウント・最初のオーダー・資材の初期セット（子契約・配送データは本登録で作る）。", "Tiêu đề = hoàn tất đăng ký tạm. Hiện pháp nhân (tên・ID・trạng thái) và tài khoản pháp nhân (ID đăng nhập・đã cấp・đã gửi hướng dẫn / pháp nhân có sẵn giữ tài khoản hiện có / OFF thì chưa cấp), bên dưới là bảng 「拠点ごとに作ったもの」 (1 dòng = 1 điểm): điểm・hợp đồng cha・hợp đồng con (chu kỳ đầu tiên)・order・bộ vật tư ban đầu・tài khoản điểm. Nút = 「詳細情報の設定へ進む」. Thứ được tạo khi đăng ký tạm = điểm・hợp đồng cha・tài khoản・order đầu tiên・bộ vật tư ban đầu (hợp đồng con・dữ liệu giao hàng tạo khi đăng ký chính thức)."), demo_ok=H_MSG),
], wait=900, note=T("AP-20261003-0069 を仮登録した直後（この撮影で申込が「契約設定中」に変わるため、状態の最後に置く）。", "Ngay sau khi đăng ký tạm AP-20261003-0069 (ảnh này làm đơn chuyển sang 「契約設定中」 nên đặt ở cuối các trạng thái)."))

V032 = V("032", C, T("開始スケジュール：締切後の開始月の扱い（2択）", "Lịch bắt đầu: cách xử lý tháng bắt đầu sau hạn chốt (2 lựa chọn)"), "/ops/applications/AP-20260910-0031", ATAB("開始スケジュール") + "sets(q('#lateChoice select'),'代理');await sleep(1200);", [
    F("7.1", T("締切を過ぎています（帯）", "Đã quá hạn chốt (dải)"), ".es-inline", "label", cond=T("受付中で、開始サイクル月のオーダー締切を過ぎているとき", "Khi 受付中 và đã quá hạn chốt order của tháng chu kỳ bắt đầu"), err=["E68"], detail=T("締切を過ぎたら赤の帯で「オーダー締切 {日} を {n}日 過ぎています（今日 {日}）」を出す。", "Quá hạn thì hiện dải đỏ 「オーダー締切 {ngày} を {n}日 過ぎています（今日 {ngày}）」.")),
    F("7.2", T("開始月の扱い（締切後）", "Cách xử lý tháng bắt đầu (sau hạn chốt)"), "#lateChoice select", "select", "select", req="○", len=["選択（開始月を翌サイクルへ繰り下げる／運営が代理でオーダーする）", "Chọn (dời tháng bắt đầu sang chu kỳ sau／vận hành order thay)"], init=T("開始月を翌サイクルへ繰り下げる", "Dời tháng bắt đầu sang chu kỳ sau"), ex=["運営が代理でオーダーする（希望の2026年11月サイクルから開始）", "Cách xử lý tháng bắt đầu khi quá hạn chốt order"], err=["S01"], detail=T("オーダー締切を過ぎた申込（受付中）だけに出す。繰り下げる＝開始サイクル月を締切に間に合う翌サイクルへ直す（欄に直した月を書く）。代理でオーダーする＝運営が代わりにオーダーを入れ、開始月は希望のまま。選ぶとすぐ保存して変更履歴に残し（S01）、仮登録（申込内容の確認の完了）で反映して、受付の注意と申請情報に書く。選ばなかったときは繰り下げ（hong 2026-10-08 Q22）。仮登録のあとは選べない（申請情報に選んだ内容だけを出す）。変更申請の承認ダイアログ（AW_APPL_002 状態 020）と同じ2択。", "Chỉ hiện với đơn quá hạn chốt order (受付中). Dời = chỉnh tháng chu kỳ bắt đầu sang chu kỳ kế tiếp kịp hạn chốt (ghi tháng đã chỉnh trong ô). Order thay = vận hành order thay, giữ nguyên tháng bắt đầu mong muốn. Chọn xong thì lưu ngay và ghi vào lịch sử thay đổi (S01), áp dụng khi đăng ký tạm (hoàn tất xác nhận nội dung đơn) và ghi vào chú ý của tiếp nhận và thông tin đơn. Không chọn thì là dời. Sau đăng ký tạm không chọn được (thông tin đơn chỉ hiện nội dung đã chọn). Khi không chọn thì mặc định là dời (hong 2026-10-08 Q22). Cùng 2 lựa chọn với hộp thoại duyệt đơn thay đổi (AW_APPL_002 trạng thái 020)."), demo_ok=T("Message List はこの2択を2つのボタン「翌サイクルへ繰り下げ」「運営が代理オーダー」で出す。コードはドロップダウン（変更申請の承認ダイアログと同じ）", "Message List hiện 2 lựa chọn này bằng 2 nút 「翌サイクルへ繰り下げ」「運営が代理オーダー」. Code là dropdown (giống hộp thoại duyệt đơn thay đổi)")),
    F("7.3", T("変更履歴", "Lịch sử thay đổi"), ".secttl::変更履歴", "table", cond=T("選んだあと（保存済み）", "Sau khi đã chọn (đã lưu)"), detail=T("選んだ内容は変更履歴に「締切後の開始月の扱い：{前} → {後}（オーダー締切 {日}・開始希望 {月}）」で残る（日時・変更内容・変更者）。仮登録のあとは申請情報に「締切後の開始月の扱い」「{扱い}（{月}サイクルから開始）」を出す。", "Nội dung đã chọn được lưu trong lịch sử thay đổi dạng 「締切後の開始月の扱い：{trước} → {sau}（オーダー締切 {ngày}・開始希望 {tháng}）」 (ngày giờ・nội dung thay đổi・người thay đổi). Sau đăng ký tạm, thông tin đơn hiện 「締切後の開始月の扱い」 「{cách xử lý}（bắt đầu từ chu kỳ {tháng}）」.")),
], today="2026/10/20", wait=900, note=T("デモの日付を 2026-10-20 にして撮影（AP-20260910-0031 の開始サイクル月 2026-11 のオーダー締切 2026-10-15 を過ぎる）。「運営が代理でオーダーする」を選んだ直後（この撮影で AP-20260910-0031 の開始月の扱いが決まるので、状態の最後に置く）。", "Chụp với ngày demo 2026-10-20 (quá hạn chốt order 2026-10-15 của tháng chu kỳ bắt đầu 2026-11 của AP-20260910-0031). Ngay sau khi chọn 「運営が代理でオーダーする」 (lần chụp này quyết định cách xử lý tháng bắt đầu của AP-20260910-0031 nên đặt ở cuối các trạng thái)."))

VIEWS = sorted([V001, V002, V003, V004, V005, V006, V007, V008, V009, V010, V011, V012, V013, V014, V015, V016, V017, V018, V019, V020, V021, V022, V023, V024, V025, V026, V027, V028, V029, V030, V031, V032], key=lambda v: v["id"])
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
