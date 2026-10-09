# -*- coding: utf-8 -*-
"""
画面設計書のデータ：運営管理者Web ＞ ダッシュボード（運営TOP）
元：本物の Web（このリポジトリ app/ops/page.tsx ・ lib/ops/general/top.ts ・ lib/ops/billing/confirmAlert.ts ほか）、決定台帳 F（運営A Q-D1〜D6・運営 TOP の警告・カレンダーの置き場）・M-3、
    運営Web_権限表、基本設計_全体の定義_提案 §10-6-1、確認メモ_AW_運営A_申請・法人・契約.md（Part 3・Part 4）
日本語に続けてベトナム語を T(日本語, ベトナム語) で書く（T は VI に覚えさせ、最後に埋める）。
番号は画面ごとに通し。状態 001〜016 はメモ Part 3・Part 4 のとおり（017 は末尾に足した）。
"""

TITLE = ["ダッシュボード（AW_DASH）", "Dashboard (AW_DASH)"]
SHEET = ["ダッシュボード", "Dashboard"]
BASENAME = "画面設計書_AW_DASH_ダッシュボード"
IMG_PREFIX = "AW_DASH"
OUT_DIR = "AW_DASH_ダッシュボード"
CODE_NOTE = ["画面コードは規約 <Module(2)>_<Feature(4)>_<Seq(3)>（docs/01_仕様/画面コード規約_20261005.md）。AW＝運営管理者Web、DASH＝ダッシュボード。1画面（AW_DASH_001）", "Mã màn hình theo quy ước <Module(2)>_<Feature(4)>_<Seq(3)> (docs/01_仕様/画面コード規約_20261005.md). AW = Web quản trị vận hành, DASH = dashboard. 1 màn hình (AW_DASH_001)"]
SITE = "ops"
SYSTEM = {"ja": "運営管理者Web", "vi": "Web quản trị vận hành"}
AUTHOR = "Claude（cloud）／確認：hong"
CREATED = "2026-10-07"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "ops", "loginId": "Ad00010"}
CODE_PATHS = ["app/ops/page.tsx", "app/ops/_general", "lib/ops", "lib/domain/seed"]

VI = {}


def T(ja, vi):
    """日本語とベトナム語を一緒に書く（VI に覚え、最後に埋める）"""
    VI[ja] = vi
    return ja


def D(date, target, q, a, src):
    return {"date": date, "target": target, "q": [T(q[0], q[1]), ""], "a": [T(a[0], a[1]), ""], "src": src}


_M = "hong 回答 2026-10-05（確認メモ_AW_運営A_申請・法人・契約 Part 3）・台帳 F"
DECISIONS = [
    D("2026-10-05", "アラートの範囲と名前", ("ダッシュボードのアラートの範囲と名前（運営A Q-D1）", "Phạm vi và tên của cảnh báo trên dashboard (運営A Q-D1)"),
      ("全部出す（根拠のない4つは客先へ確認）。名前は「アラート」。画面の見出しは現在「お知らせ（アラート一覧）」のまま（宿題）。W4「反映／反映しない」を TOP で押してよいかは客先へ",
       "Hiển thị tất cả (4 mục chưa có căn cứ thì hỏi khách). Tên là 「アラート」. Tiêu đề màn hình hiện vẫn là 「お知らせ（アラート一覧）」 (việc cần sửa code). Có cho bấm 「反映／反映しない」 ngay trên TOP không thì hỏi khách"), _M),
    D("2026-10-05", "廃棄率3%超のアラート", ("廃棄率の集計（運営A Q-D2）", "Cách tổng hợp tỉ lệ hủy (運営A Q-D2)"),
      ("実績精算が未確定の月の拠点を数え、「廃棄率が3%を超えた拠点 n件」を出して実績精算へ。TOP は 3%（色付けの 10% とは別）。運営E と合わせる。実装はまだ（宿題 D1）",
       "Đếm các điểm có tháng 実績精算 chưa chốt, hiện 「廃棄率が3%を超えた拠点 n件」 và dẫn tới 実績精算. TOP dùng 3% (khác 10% khi tô màu). Thống nhất với 運営E. Chưa cài đặt (việc cần sửa code D1)"),
      _M),
    D("2026-10-05", "グラフの条件・大きさ・CSV", ("グラフの条件・既定・大きさ・CSV（運営A Q-D3）", "Điều kiện, mặc định, kích thước, CSV của biểu đồ (運営A Q-D3)"),
      ("条件はコードのまま（月次＝期間・法人・拠点、お気に入り＝期間・法人・拠点・カテゴリ）。お気に入り分析は大きく（横いっぱい）。CSV なし",
       "Giữ điều kiện như code (hàng tháng = kỳ, pháp nhân, điểm; yêu thích = kỳ, pháp nhân, điểm, danh mục). Phân tích yêu thích hiển thị lớn (ngang hết). Không có CSV"), _M),
    D("2026-10-05", "在庫点検（棚卸）の締めの表示", ("アラート・カレンダーの締めは 20日か 25日か（運営A Q-D4）", "Hạn chốt trong cảnh báo / lịch là ngày 20 hay 25 (運営A Q-D4)"),
      ("お客様の締め20日の表示のまま。台帳 H の「判定は25日」は変えない（TOP の表示だけ例外）",
       "Giữ hiển thị hạn chốt ngày 20 của khách. Không đổi 「判定は25日」 ở sổ quyết định H (chỉ hiển thị TOP là ngoại lệ)"), _M),
    D("2026-10-05", "役割ごとのアラートの出し分け", ("役割ごとのアラート出し分け（運営A Q-D5）", "Phân biệt cảnh báo theo vai trò (運営A Q-D5)"),
      ("出し分けない。全役割に全アラートを出す（基本設計 §10-6-1 P1「権限のない画面はメニューに出さない」の例外。基本設計に例外として書く）",
       "Không phân biệt. Hiển thị mọi cảnh báo cho mọi vai trò (ngoại lệ của 基本設計 §10-6-1 P1 「画面にメニューを出さない」; ghi như ngoại lệ trong 基本設計)"), _M),
    D("2026-10-06", "読込失敗の見せ方", ("ダッシュボードの読込失敗の見せ方（運営A Q-D6）", "Cách hiển thị khi tải lỗi trên dashboard (運営A Q-D6)"),
      ("部品（アラート・スケジュール・グラフ別）ごとに W103 と「再読み込み」を出す。1つの失敗で全体を隠さない",
       "Hiện W103 và nút 「再読み込み」 theo từng bộ phận (cảnh báo / lịch / biểu đồ). Một bộ phận lỗi không che cả trang"), "hong 回答 2026-10-06（確認メモ Part 4 の 4-3）・台帳 F"),
    D("2026-10-05", "アラートの置き場・カレンダー", ("入荷の差異・資材の在庫不足の置き場、カレンダーの表示（台帳 F）", "Vị trí của chênh lệch nhập kho / thiếu vật tư và cách hiển thị lịch (sổ F)"),
      ("入荷の差異の対応待ち・資材の在庫不足・追加発注の入荷遅れは別カードにせず、アラート一覧の行に出す。カレンダーは「1ヶ月」だけ（日ごとの A1〜D7 の枠を出し、前後の月へ移る）",
       "Chênh lệch nhập kho, thiếu vật tư, đơn bổ sung nhập trễ không làm thẻ riêng mà hiện thành dòng trong danh sách cảnh báo. Lịch chỉ có 「1ヶ月」 (hiện ô A1〜D7 theo ngày, chuyển tháng trước / sau)"),
      "台帳 F「運営 TOP の警告・カレンダーの置き場」・hong 回答 2026-10-05"),
    D("2026-10-05", "営業サンプルの警告", ("営業サンプルの警告を残すか", "Có giữ cảnh báo mẫu kinh doanh không"),
      ("残す（今月・来月の受付と月の枠の残り・出荷週の締めがまだの受付）。中身の細部は客先へ確認（open）", "Giữ lại (tiếp nhận tháng này / tháng sau, hạn mức còn lại, đơn chưa chốt tuần xuất hàng). Chi tiết hỏi khách (open)"),
      "台帳 F「運営 TOP のカレンダー」・hong 回答 2026-10-05"),
    D("2026-10-05", "画面の構成", ("1段目・2段目・3段目の構成", "Bố cục tầng 1, 2, 3"),
      ("1段目＝警告帯＋アラート＋スケジュール、2段目＝月次購入額推移、3段目＝お気に入り × 購入分析（横いっぱい）。支払い方法別のグラフは出さない。グラフの「売上」は「購入」と書く",
       "Tầng 1 = dải cảnh báo + cảnh báo + lịch, tầng 2 = biểu đồ mua hàng hàng tháng, tầng 3 = yêu thích × mua hàng (ngang hết). Không hiện biểu đồ theo phương thức thanh toán. Chữ 「売上」 trong biểu đồ ghi là 「購入」"),
      "台帳 M-3「運営の TOP」"),
]
CHANGES = []

HIDE_ALWAYS = []
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [
    {"code": "AW_DASH_001", "ja": "ダッシュボード", "vi": "Dashboard"},
]

import re

_PAIR = ("detail", "init", "cond", "valid", "open", "demo_ok", "chk")


def F(no, ja, sel, kind, trig="view", **kw):
    d = {"no": no, "ja": ja, "vi": "", "sel": sel, "kind": kind, "trig": trig}
    for k, v in kw.items():
        if k in _PAIR and isinstance(v, str):
            v = [v, ""]
        d[k] = v
    return d


def V(vid, state, url, setup="", items=(), **kw):
    d = {"id": vid, "code": "AW_DASH_001", "state": state, "url": url, "setup": setup, "items": list(items)}
    d.update(kw)
    return d


JS = ("const sleep=ms=>new Promise(r=>setTimeout(r,ms));"
      "const setv=(el,v)=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}));};"
      "const sets=(el,v)=>{Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(el,v);el.dispatchEvent(new Event('change',{bubbles:true}));};"
      "const btn=(t,root)=>[...(root||document).querySelectorAll('button')].find(b=>b.textContent.replace(/\\s+/g,'').includes(t));"
      "const q=s=>document.querySelector(s);")

# ------------------------------------------------------------------ 共通の言い回し（コードとの差）
H_NAME = T("コードのカード名は「お知らせ（アラート一覧）」。台帳 F（Q-D1）は名前を「アラート」にする。メニュー「お知らせ・ご意見」と紛らわしいため（宿題）。仕様が正",
           "Tên thẻ trong code là 「お知らせ（アラート一覧）」. Sổ F (Q-D1) đổi thành 「アラート」 vì dễ nhầm với menu 「お知らせ・ご意見」 (việc cần sửa code). Theo đặc tả")
H_RANGE = T("コードは期間の前後（から＞まで）をチェックしない（結果が0件になるだけ）。仕様は E08（宿題）。仕様が正",
            "Code không kiểm tra thứ tự kỳ (から > まで) (chỉ ra 0 dòng). Đặc tả dùng E08 (việc cần sửa code). Theo đặc tả")
H_SEARCHBAR = T("グラフの条件の枠はまだ旧 .filter の部品。台帳 K は検索条件の枠を es-search に統一する（宿題 D5）。仕様が正",
                "Khung điều kiện của biểu đồ vẫn là thành phần .filter cũ. Sổ K thống nhất khung điều kiện là es-search (việc cần sửa code D5). Theo đặc tả")
H_NOSEED = T("見本のデータでは作れない状態（画面は通常の表示のまま撮影した）。コードの分岐は実装済み。データを足したら撮り直す",
             "Trạng thái không tạo được bằng dữ liệu mẫu (ảnh chụp màn hình thường). Nhánh code đã cài đặt. Khi bổ sung dữ liệu thì chụp lại")
H_UNIMPL = T("コードはまだ作っていない（宿題）。仕様が正", "Code chưa làm (việc cần sửa). Theo đặc tả")

HEAD = [
    F("1", T("ヘッダー", "Phần đầu trang"), ".ph", "area", detail=T("パンくず（ダッシュボード）と画面名。操作ボタンは置かない（CSV 出力もなし・台帳 K）。", "Breadcrumb (ダッシュボード) và tên màn hình. Không đặt nút thao tác (không có CSV; sổ K).")),
    F("1.1", T("パンくず", "Breadcrumb"), ".ph .crumb", "label", detail=T("「ダッシュボード」。ログイン後に最初に開く画面（台帳 STEP7 S7-24）。", "「ダッシュボード」. Là màn hình đầu tiên sau khi đăng nhập (sổ STEP7 S7-24).")),
    F("1.2", T("画面名", "Tên màn hình"), ".ph h1", "label", detail=T("「ダッシュボード」", "Chữ 「ダッシュボード」")),
]


def alert_row(no, name_ja, name_vi, sel, detail, **kw):
    return F(no, T(name_ja, name_vi), sel, "label", detail=detail, **kw)


# ------------------------------------------------------------------ 001 初期表示
ALERT_CARD = [
    F("2", T("アラート", "Cảnh báo"), ".dgrid > .card:nth-child(1)", "area",
      detail=T("アラートの一覧（1段目の左）。共通データの件数から作り、0件の項目は出さない。項目は固定（配送・発注・入荷・追加発注・資材・契約申請・請求・棚卸・営業サンプル・お知らせ・お問い合わせ・廃棄率）。利用者が選ぶ機能は作らない。全役割に全部出す（台帳 F Q-D5。基本設計 §10-6-1 P1 の例外）。",
               "Danh sách cảnh báo (bên trái tầng 1). Tạo từ số liệu dữ liệu chung, mục 0 dòng thì không hiện. Các mục cố định (giao hàng, đặt hàng, nhập kho, đơn bổ sung, vật tư, đơn hợp đồng, hóa đơn, kiểm kê, mẫu kinh doanh, thông báo, liên hệ, tỉ lệ hủy). Không làm chức năng cho người dùng chọn. Hiện tất cả cho mọi vai trò (sổ F Q-D5; ngoại lệ của 基本設計 §10-6-1 P1)."),
      demo_ok=H_NAME),
    F("2.1", T("アラートの見出し", "Tiêu đề cảnh báo"), ".dgrid > .card:nth-child(1) h3", "label", detail=T("「アラート」（現在のコードは「お知らせ（アラート一覧）」）。", "「アラート」 (code hiện tại là 「お知らせ（アラート一覧）」).")),
    F("2.2", T("今日の日付", "Ngày hôm nay"), ".dgrid > .card:nth-child(1) .dhd .muted", "label", len="日付 yyyy-mm-dd", detail=T("「今日 2026-10-05」。デモの日付変更帯で変えた日付が出る。", "「今日 2026-10-05」. Hiện ngày đã đổi bằng dải đổi ngày của bản demo.")),
    F("2.3", T("アラートの行", "Dòng cảnh báo"), "ul.dalert", "area",
      detail=T("1行＝1項目。左から「領域名・内容・開く」。内容は件数と、わかる範囲の中身（1行に収まらないときは折り返す）。色は行の左の印：赤＝すぐ対応（ng）／黄＝対応が必要（warn）／青＝参考（info）。並びは固定（配送→発注→入荷→追加発注→資材→契約申請→請求→棚卸→営業サンプル→お知らせ→お問い合わせ）。行ごとの中身は状態 007・008。",
               "1 dòng = 1 mục. Từ trái: tên lĩnh vực, nội dung, 「開く」. Nội dung gồm số lượng và chi tiết trong phạm vi biết (xuống dòng nếu không vừa 1 dòng). Màu theo dấu bên trái: đỏ = xử lý ngay (ng) / vàng = cần xử lý (warn) / xanh = tham khảo (info). Thứ tự cố định (giao hàng → đặt hàng → nhập kho → đơn bổ sung → vật tư → đơn hợp đồng → hóa đơn → kiểm kê → mẫu kinh doanh → thông báo → liên hệ). Chi tiết từng dòng ở trạng thái 007・008.")),
    F("2.4", T("開く", "Mở"), "ul.dalert a", "link", "click", detail=T("行の右。その領域の画面（配送の確認が必要なもの・発注一覧・入荷・資材在庫・契約申請管理・請求の確定・棚卸・営業サンプル・お問い合わせ）を開く。", "Bên phải dòng. Mở màn hình của lĩnh vực đó (mục giao hàng cần xác nhận, danh sách đặt hàng, nhập kho, tồn vật tư, quản lý đơn hợp đồng, chốt hóa đơn, kiểm kê, mẫu kinh doanh, liên hệ).")),
]
SCHED_CARD = [
    F("3", T("スケジュール", "Lịch"), ".dgrid > .card:nth-child(2)", "area",
      detail=T("スケジュール（1段目の右）。表示は「1ヶ月」だけ（4週間の ES サイクル表示はなくした・台帳 F）。月曜始まりの週で並べ、日ごとに ES サイクルの枠（A1〜D7）と予定を出す。予定は共通データ（配送・サイクル・メニュー）から作る。出す予定は固定：サイクル開始・オーダー締切・メニュー公開（自動公開を含む）・出荷の件数・資材便・棚卸／実績精算の締め（20日）・請求の確定の開始（21日）。",
               "Lịch (bên phải tầng 1). Chỉ hiển thị 「1ヶ月」 (bỏ hiển thị 4 tuần theo chu kỳ ES; sổ F). Xếp theo tuần bắt đầu từ thứ Hai, mỗi ngày hiện ô chu kỳ ES (A1〜D7) và lịch. Lịch tạo từ dữ liệu chung (giao hàng, chu kỳ, menu). Các mục cố định: bắt đầu chu kỳ, hạn chốt order, công khai menu (gồm tự động công khai), số lượng xuất hàng, chuyến vật tư, hạn chốt kiểm kê / quyết toán thực tế (ngày 20), bắt đầu chốt hóa đơn (ngày 21).")),
    F("3.1", T("スケジュールの見出し", "Tiêu đề lịch"), ".dgrid > .card:nth-child(2) h3", "label", len=["文字列（表示中の月 yyyy-mm）", "Chuỗi (tháng đang hiển thị yyyy-mm)"], detail=T("「スケジュール｜2026-10」。表示している月。", "「スケジュール｜2026-10」. Tháng đang hiển thị.")),
    F("3.2", T("前へ", "Trước"), "button::前へ", "button", "click", detail=T("前の月へ移る。", "Chuyển sang tháng trước.")),
    F("3.3", T("今日", "Hôm nay"), "button::今日", "button", "click", cond=T("今日を含む月を見ているときは非活性（押せない）", "Không khả dụng khi đang xem tháng chứa hôm nay (không bấm được)"), detail=T("今日を含む月に戻る。", "Quay về tháng chứa hôm nay.")),
    F("3.4", T("次へ", "Sau"), "button::次へ", "button", "click", detail=T("次の月へ移る。", "Chuyển sang tháng sau.")),
    F("3.5", T("配送管理のスケジュールへ", "Tới lịch của quản lý giao hàng"), "a::配送管理のスケジュールへ", "link", "click", detail=T("配送管理のスケジュール（/ops/delivery/schedule）を開く。", "Mở lịch của quản lý giao hàng (/ops/delivery/schedule).")),
    F("3.6", T("曜日の見出し", "Tiêu đề thứ"), ".dcal", "area", detail=T("月・火・水・木・金・土・日。土日のマスは薄い色（off）。表示している月の外の日は灰色（out）。", "Thứ Hai đến Chủ nhật. Ô thứ Bảy, Chủ nhật màu nhạt (off). Ngày ngoài tháng đang xem màu xám (out).")),
    F("3.7", T("日付のマス", "Ô ngày"), ".dcell:not(.out)", "label", detail=T("「mm-dd」と、その日の ES サイクルの枠（A1〜D7。右の小さな印）、その下に予定。今日のマスは強調する（today）。", "「mm-dd」, ô chu kỳ ES của ngày (A1〜D7; dấu nhỏ bên phải) và lịch phía dưới. Ô hôm nay được làm nổi bật (today).")),
    F("3.8", T("今日のマス", "Ô hôm nay"), ".dcell.today", "label", detail=T("今日の日付のマス。", "Ô của ngày hôm nay.")),
    F("3.9", T("ES サイクルの枠", "Ô chu kỳ ES"), ".dcell .slot", "label", len="A1〜D7", detail=T("1サイクルを A・B・C・D の4週（各7日）に分けた枠。", "Một chu kỳ chia 4 tuần A, B, C, D (mỗi tuần 7 ngày).")),
]
LINE_CARD = [
    F("4", T("月次購入額推移", "Biến động giá trị mua hàng hàng tháng"), ".dgrid > .card:nth-child(3)", "area",
      detail=T("2段目（横いっぱい）。折れ線＝月ごとの購入額（税抜）。支払い方法別のグラフは置かない。「売上」は「購入」と書く。", "Tầng 2 (ngang hết). Đường gấp khúc = giá trị mua mỗi tháng (chưa thuế). Không đặt biểu đồ theo phương thức thanh toán. Chữ 「売上」 ghi là 「購入」.")),
    F("4.1", T("グラフの見出し", "Tiêu đề biểu đồ"), ".dgrid > .card:nth-child(3) h3", "label", detail=T("「月次購入額推移」。右に表示している期間（例「2025-10〜2026-09」）。", "「月次購入額推移」. Bên phải là kỳ đang hiển thị (ví dụ 「2025-10〜2026-09」).")),
    F("4.2", T("検索条件", "Điều kiện tìm kiếm"), ".dgrid > .card:nth-child(3) .filter", "area", pattern="P-LIST",
      detail=T("条件は「検索」か Enter で効く（一覧と同じ）。変えたまま押していないと、グラフは前の条件のまま。「未適用」の印は出さない。", "Điều kiện có hiệu lực khi bấm 「検索」 hoặc Enter (giống danh sách). Đã đổi mà chưa bấm thì biểu đồ vẫn theo điều kiện cũ. Không hiện dấu 「未適用」."),
      demo_ok=H_SEARCHBAR),
    F("4.3", T("期間（から）", "Kỳ (từ)"), '.dgrid > .card:nth-child(3) input[aria-label="期間（から）"]', "month", "input", req="－", len="年月 yyyy-mm", init=T("データのある最新の月から12ヶ月前", "12 tháng trước tính từ tháng mới nhất có dữ liệu"), ex=["2025-10", "Tháng bắt đầu của kỳ (yyyy-mm)"],
      detail=T("月の入力欄（共通の月の部品）。空は制限なし。", "Ô nhập tháng (thành phần tháng chung). Để trống là không giới hạn.")),
    F("4.4", T("期間（まで）", "Kỳ (đến)"), '.dgrid > .card:nth-child(3) input[aria-label="期間（まで）"]', "month", "input", req="－", len="年月 yyyy-mm", init=T("データのある最新の月", "Tháng mới nhất có dữ liệu"), ex=["2026-09", "Tháng kết thúc của kỳ (yyyy-mm)"], err=["E08"],
      valid=T("「から」より前の月は E08（「まで」の欄の下に出す。検索はしない）。", "Tháng trước 「から」 thì E08 (hiện dưới ô 「まで」; không tìm kiếm)."), demo_ok=H_RANGE),
    F("4.5", T("法人", "Pháp nhân"), '.dgrid > .card:nth-child(3) select[aria-label="法人"]', "select", "select", req="－", len=["選択（法人（すべて）／法人名）", "Chọn (Tất cả pháp nhân / tên pháp nhân)"], init=T("法人（すべて）", "Tất cả pháp nhân"), ex=["株式会社サンプル", "Lọc theo pháp nhân (tên pháp nhân)"],
      detail=T("法人を選ぶと、拠点の選択肢がその法人の拠点だけになる（法人を変えたら拠点は選び直し）。", "Chọn pháp nhân thì lựa chọn điểm chỉ còn điểm của pháp nhân đó (đổi pháp nhân thì chọn lại điểm).")),
    F("4.6", T("拠点", "Điểm"), '.dgrid > .card:nth-child(3) select[aria-label="拠点"]', "select", "select", req="－", len=["選択（拠点（すべて）／拠点名）", "Chọn (Tất cả điểm / tên điểm)"], init=T("拠点（すべて）", "Tất cả điểm"), ex=["株式会社サンプル 本社", "Lọc theo điểm (tên điểm)"]),
    F("4.7", T("クリア", "Xóa điều kiện"), ".dgrid > .card:nth-child(3) .f-act button::クリア", "button", "click", detail=T("条件を初期値に戻して、すぐ反映する。", "Đưa điều kiện về giá trị ban đầu và áp dụng ngay.")),
    F("4.8", T("検索", "Tìm kiếm"), ".dgrid > .card:nth-child(3) .f-act button::検索", "button", "click", detail=T("条件を反映してグラフを描き直す。", "Áp dụng điều kiện và vẽ lại biểu đồ.")),
    F("4.9", T("折れ線グラフ", "Biểu đồ đường"), ".dgrid > .card:nth-child(3) svg.dsvg", "area",
      detail=T("横軸＝月、縦軸＝購入額（万円）。各月の点にマウスを置くと「2026-09：962,300円」の形で金額を出す（金額は「1,000円」の書き方）。購入額が小さい・0の月でも目盛りは最小 1万円刻みで描く。", "Trục ngang = tháng, trục dọc = giá trị mua (vạn yên). Rê chuột lên điểm của mỗi tháng sẽ hiện số tiền dạng 「2026-09：962,300円」 (cách viết 「1,000円」). Kể cả khi giá trị nhỏ / bằng 0, thang chia tối thiểu 1 vạn yên.")),
]
FAV_CARD = [
    F("5", T("お気に入り × 購入分析", "Phân tích yêu thích × mua hàng"), ".dgrid > .card:nth-child(4)", "area",
      detail=T("3段目（横いっぱい）。棒＝商品ごとの購入金額（左軸）、線＝お気に入り件数（右軸）。お気に入りの分析は大きく見せる（台帳 M-3・REQ-UI-003）。", "Tầng 3 (ngang hết). Cột = giá trị mua theo sản phẩm (trục trái), đường = số lượt yêu thích (trục phải). Phân tích yêu thích hiển thị lớn (sổ M-3, REQ-UI-003)."),
      demo_ok=T("コードはグラフの大きさが月次購入額推移と同じ（宿題 D4）。仕様はお気に入りを大きく", "Code để biểu đồ cùng kích thước với biểu đồ hàng tháng (việc cần sửa D4). Đặc tả: phần yêu thích hiển thị lớn")),
    F("5.1", T("グラフの見出し", "Tiêu đề biểu đồ"), ".dgrid > .card:nth-child(4) h3", "label", detail=T("「お気に入り × 購入分析」。右に表示している期間と商品数（例「2026-09・10商品」）。", "「お気に入り × 購入分析」. Bên phải là kỳ và số sản phẩm đang hiển thị (ví dụ 「2026-09・10商品」).")),
    F("5.2", T("検索条件", "Điều kiện tìm kiếm"), ".dgrid > .card:nth-child(4) .filter", "area", pattern="P-LIST", detail=T("月次購入額推移と同じ動き。条件は 期間・法人・拠点・カテゴリ。", "Cùng cách hoạt động với biểu đồ hàng tháng. Điều kiện gồm kỳ, pháp nhân, điểm, danh mục."), demo_ok=H_SEARCHBAR),
    F("5.3", T("期間（から）", "Kỳ (từ)"), '.dgrid > .card:nth-child(4) input[aria-label="期間（から）"]', "month", "input", req="－", len="年月 yyyy-mm", init=T("データのある最新の月", "Tháng mới nhất có dữ liệu"), ex=["2026-09", "Tháng bắt đầu của kỳ (yyyy-mm)"]),
    F("5.4", T("期間（まで）", "Kỳ (đến)"), '.dgrid > .card:nth-child(4) input[aria-label="期間（まで）"]', "month", "input", req="－", len="年月 yyyy-mm", init=T("データのある最新の月", "Tháng mới nhất có dữ liệu"), ex=["2026-09", "Tháng kết thúc của kỳ (yyyy-mm)"], err=["E08"],
      valid=T("「から」より前の月は E08。", "Tháng trước 「から」 thì E08."), demo_ok=H_RANGE),
    F("5.5", T("法人", "Pháp nhân"), '.dgrid > .card:nth-child(4) select[aria-label="法人"]', "select", "select", req="－", len=["選択（法人（すべて）／法人名）", "Chọn (Tất cả pháp nhân / tên pháp nhân)"], init=T("法人（すべて）", "Tất cả pháp nhân"), ex=["株式会社サンプル", "Lọc theo pháp nhân (tên pháp nhân)"]),
    F("5.6", T("拠点", "Điểm"), '.dgrid > .card:nth-child(4) select[aria-label="拠点"]', "select", "select", req="－", len=["選択（拠点（すべて）／拠点名）", "Chọn (Tất cả điểm / tên điểm)"], init=T("拠点（すべて）", "Tất cả điểm"), ex=["株式会社サンプル 大阪支店", "Lọc theo điểm (tên điểm)"]),
    F("5.7", T("カテゴリ", "Danh mục"), ".dgrid > .card:nth-child(4) [aria-label=\"カテゴリ\"]", "check", "check", req="－", len=["複数選択（商品カテゴリ。1つも選ばなければ全部）", "Chọn nhiều (danh mục sản phẩm. Không chọn thì là tất cả)"], init=T("選ばない（全カテゴリ）", "Không chọn (tất cả danh mục)"), ex=["サラダ・主食", "Lọc theo danh mục sản phẩm (chọn nhiều)"],
      detail=T("チェックを付けたカテゴリの商品だけを出す。1つも付けなければ全カテゴリ。", "Chỉ hiện sản phẩm của danh mục được đánh dấu. Không đánh dấu thì là tất cả danh mục.")),
    F("5.8", T("クリア", "Xóa điều kiện"), ".dgrid > .card:nth-child(4) .f-act button::クリア", "button", "click", detail=T("条件を初期値に戻して、すぐ反映する。", "Đưa điều kiện về giá trị ban đầu và áp dụng ngay.")),
    F("5.9", T("検索", "Tìm kiếm"), ".dgrid > .card:nth-child(4) .f-act button::検索", "button", "click", detail=T("条件を反映してグラフを描き直す。", "Áp dụng điều kiện và vẽ lại biểu đồ.")),
    F("5.10", T("棒と線のグラフ", "Biểu đồ cột và đường"), ".dgrid > .card:nth-child(4) svg.dsvg", "area",
      detail=T("横軸＝商品（長い名前は8文字で省略）、左軸＝購入金額（万円）、右軸＝お気に入り件数。棒・点にマウスを置くと「商品名：金額・お気に入り n件」を出す。", "Trục ngang = sản phẩm (tên dài rút gọn 8 ký tự), trục trái = giá trị mua (vạn yên), trục phải = số lượt yêu thích. Rê chuột lên cột / điểm hiện 「tên sản phẩm：số tiền・お気に入り n件」.")),
    F("5.11", T("凡例", "Chú giải"), ".dgrid > .card:nth-child(4) .dleg", "label", detail=T("「購入金額（左）」（青い棒）・「お気に入り件数（右）」（黄色い線）。", "「購入金額（左）」 (cột xanh) và 「お気に入り件数（右）」 (đường vàng).")),
]
V001 = V("001", T("初期表示（今日 2026-10-05）", "Hiển thị ban đầu (hôm nay 2026-10-05)"), "/ops", "", HEAD + ALERT_CARD + SCHED_CARD + LINE_CARD + FAV_CARD, full=True, wait=1200,
         note=T("フル権限（Ad00010）で表示。ログイン後に最初に開く画面（/ops）。上に出る帯（請求の確定・メニューの自動公開・確定済みの月に反映していない変更）は条件があるときだけ出る（状態 003・004・006）。",
                "Hiển thị với quyền đầy đủ (Ad00010). Màn hình mở đầu tiên sau khi đăng nhập (/ops). Các dải phía trên (chốt hóa đơn, tự động công khai menu, thay đổi chưa phản ánh vào tháng đã chốt) chỉ hiện khi có điều kiện (trạng thái 003・004・006)."))

# ------------------------------------------------------------------ 002 アラートなし
V002 = V("002", T("アラートなし（「対応が必要なものはありません。」）", "Không có cảnh báo (「対応が必要なものはありません。」)"), "/ops", "", [
    F("6", T("アラートなしのメッセージ", "Thông báo không có cảnh báo"), ".dgrid > .card:nth-child(1) p.muted", "label", "show", err=["I17"],
      detail=T("すべての項目が0件のとき、行の代わりに I17 を出す（I01「該当するデータがありません」とは意味が違うので別の文言）。", "Khi mọi mục đều 0 dòng thì hiện I17 thay cho các dòng (khác nghĩa với I01 「該当するデータがありません」 nên là câu khác)."),
      demo_ok=H_NOSEED),
], note=T("見本のデータにはいつも対応が必要な件数があり、この状態は撮影できない。画像は通常の画面（状態 001）で、メッセージの番号は枠が出ない（demo_ok）。", "Dữ liệu mẫu luôn có mục cần xử lý nên không chụp được trạng thái này. Ảnh là màn hình thường (trạng thái 001), số của thông báo không hiện khung (demo_ok)."))

# ------------------------------------------------------------------ 003 請求の確定がまだです
V003 = V("003", T("請求の確定がまだです（赤の帯・今日 2026-10-21）", "Chưa chốt hóa đơn (dải đỏ, hôm nay 2026-10-21)"), "/ops", "", [
    F("6", T("請求の確定の帯", "Dải chốt hóa đơn"), ".card::請求の確定がまだです", "area", err=["W106"],
      detail=T("20日締めのあと、21日から確定が済むまでダッシュボードの一番上に赤い帯で出す（台帳 M-3：25日に自動では確定しない）。見出し＝「請求の確定がまだです（締め {月}・未確定 実績精算 {n}件・前払い {n}件）」。確定が済む（未確定が0件になる）と帯は消える。", "Từ ngày 21 sau hạn chốt ngày 20, hiện dải đỏ trên cùng dashboard cho đến khi chốt xong (sổ M-3: không tự động chốt vào ngày 25). Tiêu đề = 「請求の確定がまだです（締め {月}・未確定 実績精算 {n}件・前払い {n}件）」. Khi chốt xong (còn 0 dòng chưa chốt) thì dải biến mất.")),
    F("6.1", T("請求の確定を開く", "Mở chốt hóa đơn"), "a::請求の確定を開く", "link", "click", detail=T("請求の確定（/ops/billing/confirm?m={締めの月}）を開く。", "Mở chốt hóa đơn (/ops/billing/confirm?m={tháng chốt}).")),
    F("6.2", T("説明の1行", "Dòng giải thích"), "p.muted::20日締めのあと", "label", detail=T("「20日締めのあと（{21日の日付} から）、確定が済むまで出します。25日に自動では確定しません。」", "「20日締めのあと（{ngày 21} から）、確定が済むまで出します。25日に自動では確定しません。」")),
    F("6.3", T("法人ごとの未確定の拠点", "Điểm chưa chốt theo pháp nhân"), "ul::前払い 未確定", "area", detail=T("1行＝1法人（または法人の中の拠点のまとまり）。「法人名：実績精算 未確定 {拠点名}／前払い 未確定 {拠点名}」。法人名は請求の確定の法人の画面へのリンク。", "1 dòng = 1 pháp nhân (hoặc nhóm điểm trong pháp nhân). 「Tên pháp nhân：実績精算 未確定 {tên điểm}／前払い 未確定 {tên điểm}」. Tên pháp nhân là liên kết tới màn hình pháp nhân của chốt hóa đơn.")),
    F("6.4", T("請求の行（アラート）", "Dòng hóa đơn (cảnh báo)"), "li::Bill One", "label", detail=T("アラートの行の「請求」は Bill One の送付エラーだけ（請求書の確定のお知らせは、この帯に出す）。", "Dòng 「請求」 trong cảnh báo chỉ có lỗi gửi Bill One (thông báo chốt hóa đơn hiện ở dải này).")),
], today="2026/10/21", note=T("デモの日付を 2026-10-21 にして撮影（21日から出る）。", "Chụp với ngày demo 2026-10-21 (hiện từ ngày 21)."))

# ------------------------------------------------------------------ 004 メニューが自動公開の条件を満たしていない
V004 = V("004", T("メニューが自動公開の条件を満たしていない（今日 2026-10-29）", "Menu chưa đủ điều kiện tự động công khai (hôm nay 2026-10-29)"), "/ops", "", [
    F("6", T("メニューの自動公開の帯", "Dải tự động công khai menu"), ".card::が自動公開の条件を満たしていません", "area", err=["W107"],
      detail=T("自動公開日の3日前から、条件が足りない月間メニューごとに黄色の帯を出す（通知は送らない・台帳 F／M-2）。見出し＝「{メニュー名}が自動公開の条件を満たしていません（自動公開日 {日付}）」。自動公開日の既定＝そのメニューのオーダー開始日（前月1日）。条件：全商品が公開可能・メニューPDFあり・その月の仮発注が承認済み。足りない条件は下の箇条書きに出す。条件がそろうと帯は消える。", "Từ 3 ngày trước ngày tự động công khai, hiện dải vàng cho từng menu tháng thiếu điều kiện (không gửi thông báo; sổ F / M-2). Tiêu đề = 「{tên menu}が自動公開の条件を満たしていません（自動公開日 {ngày}）」. Ngày tự động công khai mặc định = ngày bắt đầu order của menu đó (ngày 1 tháng trước). Điều kiện: toàn bộ sản phẩm có thể công khai, có PDF menu, đơn đặt hàng tạm của tháng đã duyệt. Điều kiện còn thiếu hiện ở danh sách gạch đầu dòng bên dưới. Đủ điều kiện thì dải biến mất.")),
    F("6.1", T("メニューを開く", "Mở menu"), "a::メニューを開く", "link", "click", detail=T("そのメニューの画面（/ops/menu/monthly/{メニューID}）を開く。", "Mở màn hình của menu đó (/ops/menu/monthly/{ID menu}).")),
    F("6.2", T("説明の1行", "Dòng giải thích"), "p.muted::までに次を済ませてください", "label", detail=T("「自動公開日 {日付} までに次を済ませてください。」", "「自動公開日 {ngày} までに次を済ませてください。」")),
    F("6.3", T("足りない条件", "Điều kiện còn thiếu"), "ul::メニューPDF", "area", detail=T("公開可能になっていない商品（品数と商品ID）・メニューPDFがない・その月の仮発注が承認されていない、のうち足りないものだけを並べる。", "Chỉ liệt kê điều kiện còn thiếu: sản phẩm chưa thể công khai (số sản phẩm và ID), chưa có PDF menu, đơn đặt hàng tạm của tháng chưa duyệt.")),
], today="2026/10/29", note=T("デモの日付を 2026-10-29 にして撮影（自動公開日 2026-11-01 の3日前）。この日は請求の確定の帯（状態 003）も出ている。", "Chụp với ngày demo 2026-10-29 (3 ngày trước ngày tự động công khai 2026-11-01). Hôm đó dải chốt hóa đơn (trạng thái 003) cũng hiện."))

# ------------------------------------------------------------------ 005 入荷の差異・資材の在庫不足
V005 = V("005", T("入荷の差異・資材の在庫不足（アラートの行）", "Chênh lệch nhập kho / thiếu vật tư (dòng cảnh báo)"), "/ops", "", [
    alert_row("6", "入荷の行", "Dòng nhập kho", "li::入荷の差異",
              T("入荷の差異の対応待ち（予定の数と入荷の数が違う発注）と、分納の入荷予定日を過ぎたものを、対応するまで出し続ける。例「入荷の差異の対応待ち 1件（PO-202610-M002-KA2：予定 8個 → 入荷 6個）」。分納の遅れは「分納の入荷予定日を過ぎた n件」。「開く」は入荷の画面へ。台帳 I・発注・仕入・入荷 §8-4。",
                "Hiện cho đến khi xử lý: nhập kho chờ xử lý chênh lệch (đơn có số dự kiến khác số nhập) và đợt giao từng phần quá ngày dự kiến nhập. Ví dụ 「入荷の差異の対応待ち 1件（PO-202610-M002-KA2：予定 8個 → 入荷 6個）」. Giao trễ từng phần là 「分納の入荷予定日を過ぎた n件」. 「開く」 tới màn hình nhập kho. Sổ I, đặt hàng・nhập kho §8-4.")),
    alert_row("6.1", "資材の行", "Dòng vật tư", "li::資材の在庫不足",
              T("倉庫の資材の在庫がしきい値を下回っているものを件数と中身（倉庫・資材名・在庫数・しきい値）で出す。例「資材の在庫不足 5件（ES事務所（資材） スプーン 40（しきい値 50）…）」。別のカードにせず、アラートの行に出す（台帳 F）。「開く」は資材在庫の画面へ。",
                "Hiện số lượng và nội dung (kho, tên vật tư, tồn kho, ngưỡng) của vật tư trong kho có tồn thấp hơn ngưỡng. Ví dụ 「資材の在庫不足 5件（ES事務所（資材） スプーン 40（しきい値 50）…）」. Không làm thẻ riêng mà hiện ở dòng cảnh báo (sổ F). 「開く」 tới màn hình tồn vật tư."),
              open=T("資材の在庫のしきい値（最小数）の決め方と、ダッシュボードに「資材の在庫不足」を出すこと自体（仕様 在庫.md 2-8 は在庫を持つだけで、しきい値の決まりがない）", "Cách đặt ngưỡng tồn vật tư (số tối thiểu) và việc có hiển thị 「資材の在庫不足」 trên dashboard hay không (đặc tả 在庫.md 2-8 chỉ nói giữ tồn kho, chưa có quy định ngưỡng)"), ask="お客様（運用）"),
    alert_row("6.2", "追加発注の行", "Dòng đơn bổ sung", "li::入荷予定日が便に間に合わない",
              T("追加発注の入荷予定日が便に間に合わないものを「入荷予定日が便に間に合わない追加発注 n件（便は自動で動かしません。スケジュールで直してください）」で出す。「開く」は配送のスケジュールへ。",
                "Hiện đơn bổ sung có ngày nhập dự kiến không kịp chuyến, dạng 「入荷予定日が便に間に合わない追加発注 n件（便は自動で動かしません。スケジュールで直してください）」. 「開く」 tới lịch giao hàng."),
              open=T("追加発注の入荷遅れを TOP に出すか（台帳 M-2 は便の自動移動まで。TOP 表示の記述なし）", "Có hiển thị đơn bổ sung nhập trễ trên TOP không (sổ M-2 chỉ đến việc tự chuyển chuyến; không có mô tả hiển thị TOP)"), ask="お客様（運用）",
              demo_ok=H_NOSEED),
], note=T("入荷の差異・資材の在庫不足は見本のデータにある。追加発注の入荷遅れ・分納の遅れは見本に対象がなく画面に出ない（撮影できない）。", "Chênh lệch nhập kho và thiếu vật tư có trong dữ liệu mẫu. Đơn bổ sung nhập trễ và giao từng phần trễ không có đối tượng trong dữ liệu mẫu nên không hiện (không chụp được)."))

# ------------------------------------------------------------------ 006 確定済みの月に反映していない変更
V006 = V("006", T("確定済みの月に反映していない変更（反映／反映しない）", "Thay đổi chưa phản ánh vào tháng đã chốt (反映／反映しない)"), "/ops", "", [
    F("6", T("確定済みの月の帯", "Dải tháng đã chốt"), ".card::確定済みの月に反映していない変更", "area",
      detail=T("プランの変更・誤りの訂正を承認したとき、請求の確定済み（まだ発行していない）の月は変えずに、この帯に1件ずつ出す。見出し＝「確定済みの月に反映していない変更 {n}件」。1行＝「{拠点名} {年月} サイクル：{原因}（{申請ID}）・請求の状態 {状態}」。請求の画面で確定を解除してから「反映」する。反映しないときは請求調整で対応する。", "Khi duyệt đổi gói / sửa lỗi, tháng đã chốt hóa đơn (chưa phát hành) không bị thay đổi mà hiện từng dòng ở dải này. Tiêu đề = 「確定済みの月に反映していない変更 {n}件」. 1 dòng = 「{tên điểm} {năm-tháng} サイクル：{nguyên nhân}（{ID đơn}）・請求の状態 {trạng thái}」. Hủy chốt ở màn hình hóa đơn rồi bấm 「反映」. Nếu không phản ánh thì xử lý bằng điều chỉnh hóa đơn."),
      open=T("この帯で「反映」「反映しない」を押してよいか（台帳 M-3 は「確定した月はロック・確定解除してから」まで。コードのコメントに 2026/10/03 決定とあるが決定記録がない）", "Có cho bấm 「反映」「反映しない」 ngay ở dải này không (sổ M-3 chỉ nói tới 「tháng đã chốt bị khóa, hủy chốt rồi mới」. Comment trong code ghi quyết định 2026/10/03 nhưng không có bản ghi quyết định)"), ask="お客様（運用）", demo_ok=H_NOSEED),
    F("6.1", T("反映", "Phản ánh"), "button::反映", "button", "click", cond=T("確定を解除してあるとき（反映できるとき）だけ出す。権限（請求の確定の操作）がある役割だけ", "Chỉ hiện khi đã hủy chốt (có thể phản ánh). Chỉ vai trò có quyền (thao tác chốt hóa đơn)"), detail=T("その月へ変更を反映する。まだ確定が残っているときは「確定解除へ」のリンクにする。", "Phản ánh thay đổi vào tháng đó. Nếu vẫn còn chốt thì là liên kết 「確定解除へ」."), demo_ok=H_NOSEED),
    F("6.2", T("反映しない", "Không phản ánh"), "button::反映しない", "button", "click", cond=T("権限（請求の確定の操作）がある役割だけ", "Chỉ vai trò có quyền (thao tác chốt hóa đơn)"), detail=T("その月へ反映しないことにして、帯から外す。", "Quyết định không phản ánh vào tháng đó và bỏ khỏi dải."), demo_ok=H_NOSEED),
], note=T("見本のデータでは作れない（確定済みの月に、プラン変更の承認がかかる必要がある）。画像は通常の画面で、帯の番号は枠が出ない（demo_ok）。", "Không tạo được bằng dữ liệu mẫu (cần duyệt đổi gói vào tháng đã chốt). Ảnh là màn hình thường, số của dải không hiện khung (demo_ok)."))

# ------------------------------------------------------------------ 007 アラートの各行
V007 = V("007", T("アラートの各行（今日 2026-10-21）", "Từng dòng cảnh báo (hôm nay 2026-10-21)"), "/ops", "", [
    alert_row("6", "配送の行", "Dòng giao hàng", "li::ドライバー未設定",
              T("配送管理の「確認が必要」の件数（メニューのバッジと同じ）。行の文は「配送：確認が必要 n件（ドライバー未設定・変更の締切・短消費期限など）」。赤（ng）。「開く」は配送の確認画面へ。", "Số mục 「確認が必要」 của quản lý giao hàng (giống huy hiệu menu). dòng ghi 「配送：確認が必要 n件（ドライバー未設定・変更の締切・短消費期限など）」. Màu đỏ (ng). 「開く」 tới màn hình xác nhận giao hàng.")),
    alert_row("6.1", "発注の行", "Dòng đặt hàng", "li::本発注の未承認",
              T("本発注から24時間を過ぎても仕入先が承認していないもの・仕入先が受注不可と回答したものを「本発注の未承認（24時間超）n件・仕入先の受注不可 n件」で出す。赤（ng）。「開く」は発注一覧へ。発注 §7-1・メール一覧 X10「運営トップにも出す」。", "Đơn đặt hàng chính quá 24 giờ mà nhà cung cấp chưa duyệt, hoặc nhà cung cấp trả lời không nhận đơn, hiện dạng 「本発注の未承認（24時間超）n件・仕入先の受注不可 n件」. Màu đỏ (ng). 「開く」 tới danh sách đặt hàng. Đặt hàng §7-1, danh sách mail X10 「hiện cả ở TOP vận hành」.")),
    alert_row("6.2", "契約申請の行", "Dòng đơn hợp đồng", "li::対応が必要な申請",
              T("契約申請管理のメニューのバッジと同じ件数（受付中・契約設定中の申込と、承認待ち・対応中の変更申請）。「契約申請 対応が必要な申請 n件」。黄（warn）。「開く」は契約申請管理へ（AW_APPL_001）。", "Cùng số lượng với huy hiệu menu quản lý đơn hợp đồng (đơn đăng ký 受付中・契約設定中 và đơn thay đổi 承認待ち・対応中). 「契約申請 対応が必要な申請 n件」. Màu vàng (warn). 「開く」 tới quản lý đơn hợp đồng (AW_APPL_001).")),
    alert_row("6.3", "請求の行", "Dòng hóa đơn", "li::Bill One",
              T("Bill One への請求書の送付がエラーになったものの件数（外部連携_エラーの流れ E8）。「請求 Bill One の送付エラー n件」。黄（warn）。「開く」は請求の確定へ。", "Số hóa đơn gửi tới Bill One bị lỗi (外部連携_エラーの流れ E8). 「請求 Bill One の送付エラー n件」. Màu vàng (warn). 「開く」 tới chốt hóa đơn.")),
    alert_row("6.4", "棚卸の行", "Dòng kiểm kê", "li::未申告の拠点",
              T("この締めでまだ棚卸を申告していない拠点（棚卸なしの拠点は除く）。「棚卸 未申告の拠点 n件（締め mm-dd）」。締めは お客様の締め20日の表示のまま。21〜25日は運営が代理で入れられるが、表示は変えない（台帳 F Q-D4＝B。台帳 H の「判定は25日」とはずれ）。黄（warn）。「開く」は棚卸の画面へ。", "Các điểm chưa khai báo kiểm kê ở kỳ chốt này (trừ điểm không kiểm kê). 「棚卸 未申告の拠点 n件（締め mm-dd）」. Hạn chốt giữ hiển thị ngày 20 của khách. Ngày 21〜25 vận hành có thể nhập thay nhưng không đổi hiển thị (sổ F Q-D4=B. Lệch với 「判定は25日」 của sổ H). Màu vàng (warn). 「開く」 tới màn hình kiểm kê.")),
    alert_row("6.5", "営業サンプルの行", "Dòng mẫu kinh doanh", "li::出荷週の締めがまだ",
              T("今月・来月の受付件数と月の枠の残り、出荷週の締めがまだの受付を1行にまとめる。「10月分の受付 4／60件（残り 56件）・11月分の受付 4／60件（残り 56件）・出荷週の締めがまだ 5件」。青（info）。警告は残す（台帳 F）。「開く」は営業サンプルへ。", "Gộp thành 1 dòng số tiếp nhận tháng này / tháng sau cùng hạn mức còn lại và đơn tiếp nhận chưa chốt tuần xuất hàng. 「10月分の受付 4／60件（残り 56件）・11月分の受付 4／60件（残り 56件）・出荷週の締めがまだ 5件」. Màu xanh (info). Giữ cảnh báo (sổ F). 「開く」 tới mẫu kinh doanh."),
              open=T("営業サンプルの警告の中身（月の枠の残りをどの時点で出すか・出荷週の締めがまだの意味）。台帳 E は「警告は残す」だけ", "Nội dung cảnh báo mẫu kinh doanh (hiện hạn mức còn lại vào thời điểm nào, ý nghĩa của chưa chốt tuần xuất hàng). Sổ E chỉ nói 「giữ cảnh báo」"), ask="お客様（運用）"),
    alert_row("6.6", "お知らせの行", "Dòng thông báo", "li::配信予約",
              T("配信を予定しているお知らせの件数。台帳では「予約」を使わず「予定中」に統一する。仕様の文は「お知らせ：予定中のお知らせ n件」。青（info）。「開く」はお知らせ一覧へ。", "Số thông báo đã lên lịch gửi. Sổ quyết định không dùng 「予約」 mà thống nhất 「予定中」. Câu theo đặc tả 「お知らせ：予定中のお知らせ n件」. Màu xanh (info). 「開く」 tới danh sách thông báo."),
              open=T("お知らせの配信を TOP に出すか（仕様に記述なし。コードは「配信予約 n件」）", "Có hiển thị việc gửi thông báo trên TOP không (đặc tả không có mô tả. Code là 「配信予約 n件」)"), ask="お客様（運用）",
              demo_ok=T("コードの文言は「配信予約 n件」（宿題 D3）。仕様は「予定中」。見本のデータに配信予定のお知らせがなく、行は出ない（撮影できない）", "Câu trong code là 「配信予約 n件」 (việc cần sửa D3). Đặc tả là 「予定中」. Dữ liệu mẫu không có thông báo đã lên lịch nên dòng không hiện (không chụp được)")),
    alert_row("6.7", "お問い合わせの行", "Dòng liên hệ", "li::新しいお問い合わせ",
              T("まだ開いていないお問い合わせの件数。「お問い合わせ 新しいお問い合わせ n件（HubSpot 送信）」。HubSpot に送れなかったものは ES に残さないので、「送信エラー」の行は作らない（台帳）。黄（warn）。「開く」はお問い合わせへ。", "Số liên hệ chưa mở. 「お問い合わせ 新しいお問い合わせ n件（HubSpot 送信）」. Liên hệ không gửi được tới HubSpot không lưu ở ES nên không làm dòng 「送信エラー」 (sổ quyết định). Màu vàng (warn). 「開く」 tới liên hệ.")),
], today="2026/10/21", note=T("デモの日付を 2026-10-21 にして撮影（発注の行は21日の時点で出る）。この日は請求の確定の帯（状態 003）も出ている。", "Chụp với ngày demo 2026-10-21 (dòng đặt hàng hiện ở thời điểm ngày 21). Hôm đó dải chốt hóa đơn (trạng thái 003) cũng hiện."))

# ------------------------------------------------------------------ 008 スケジュール（1ヶ月）
V008 = V("008", T("スケジュール：今月（日ごとの枠と予定）", "Lịch: tháng này (ô và lịch theo ngày)"), "/ops", "", [
    F("6", T("サイクル開始", "Bắt đầu chu kỳ"), ".dcell span::サイクル開始", "label", detail=T("そのサイクルの A1 の日に「2026-10 サイクル開始」。", "Vào ngày A1 của chu kỳ hiện 「2026-10 サイクル開始」.")),
    F("6.1", T("オーダー締切", "Hạn chốt order"), ".dcell span::オーダー締切", "label", detail=T("次のサイクル月のオーダー締切日（A4）に「オーダー締切（2026-11）」。", "Vào ngày hạn chốt order của tháng chu kỳ kế tiếp (A4) hiện 「オーダー締切（2026-11）」.")),
    F("6.2", T("メニュー公開", "Công khai menu"), ".dcell span::メニュー公開", "label", detail=T("月間メニューの公開（自動公開を含む）の日に「メニュー公開（2026-12）」。", "Vào ngày công khai menu tháng (gồm tự động công khai) hiện 「メニュー公開（2026-12）」.")),
    F("6.3", T("出荷の件数", "Số lượng xuất hàng"), ".dcell span::出荷", "label", detail=T("その日に出荷する件数「出荷 n件」。", "Số lượng xuất hàng trong ngày 「出荷 n件」.")),
    F("6.4", T("資材便", "Chuyến vật tư"), ".dcell span::資材便", "label", detail=T("その日の資材便の件数「資材便 n件」。", "Số chuyến vật tư trong ngày 「資材便 n件」.")),
    F("6.5", T("棚卸・実績精算の締め", "Hạn chốt kiểm kê・quyết toán thực tế"), ".dcell span::棚卸・実績精算の締め", "label", detail=T("毎月20日（お客様の締め）。台帳 F Q-D4＝B：25日の判定は表示しない。", "Ngày 20 hàng tháng (hạn chốt của khách). Sổ F Q-D4=B: không hiển thị phán định ngày 25.")),
    F("6.6", T("請求の確定（この日から）", "Chốt hóa đơn (từ ngày này)"), ".dcell span::請求の確定", "label", detail=T("毎月21日に「請求の確定（この日から）」。この日から確定が済むまで、上に赤い帯が出る（状態 003）。", "Ngày 21 hàng tháng hiện 「請求の確定（この日から）」. Từ ngày này đến khi chốt xong, dải đỏ phía trên hiện (trạng thái 003).")),
], note=T("記載したすべての予定を見本の日付（2026-10）に出して撮影。4週間の ES サイクル表示は無くなり、「1ヶ月」の表示だけ（台帳 F）。", "Chụp với tất cả lịch nêu trên hiện trong ngày mẫu (2026-10). Bỏ hiển thị 4 tuần theo chu kỳ ES, chỉ còn hiển thị 「1ヶ月」 (sổ F)."))

# ------------------------------------------------------------------ 009 スケジュール 次の月
V009 = V("009", T("スケジュール：次の月へ・今日へ戻る", "Lịch: sang tháng sau / quay lại hôm nay"), "/ops", JS + "btn('次へ').click();await sleep(700);", [
    F("6", T("次の月のスケジュール", "Lịch tháng sau"), ".dgrid > .card:nth-child(2)", "area",
      detail=T("「次へ」を押すと次の月（見出しが「スケジュール｜2026-11」に変わる）。「前へ」で前の月。今日を含まない月では「今日」を押せるようになり、押すと今日の月に戻る。月が変わっても日ごとの A1〜D7 の枠と予定を出す。", "Bấm 「次へ」 chuyển sang tháng sau (tiêu đề đổi thành 「スケジュール｜2026-11」). 「前へ」 về tháng trước. Ở tháng không chứa hôm nay, nút 「今日」 bấm được và bấm sẽ về tháng của hôm nay. Dù đổi tháng vẫn hiện ô A1〜D7 và lịch theo ngày.")),
    F("6.1", T("今日（押せる）", "Hôm nay (bấm được)"), "button::今日", "button", "click", cond=T("今日を含まない月を見ているとき活性", "Khả dụng khi đang xem tháng không chứa hôm nay"), detail=T("押すと今日を含む月に戻る。", "Bấm để về tháng chứa hôm nay.")),
], wait=900, note=T("「次へ ›」を押した直後の画面。", "Màn hình ngay sau khi bấm 「次へ ›」."))

# ------------------------------------------------------------------ 010 月次購入額推移 条件
V010 = V("010", T("月次購入額推移：法人を選んで検索", "Biến động mua hàng hàng tháng: chọn pháp nhân rồi tìm kiếm"), "/ops",
         JS + "const c=q('.dgrid > .card:nth-child(3)');sets(c.querySelector('select[aria-label=\"法人\"]'),'CU00001');await sleep(200);c.querySelector('.f-act .btn.pri').click();await sleep(800);", [
    F("6", T("絞り込んだグラフ", "Biểu đồ sau khi lọc"), ".dgrid > .card:nth-child(3) svg.dsvg", "area", detail=T("条件（期間・法人・拠点）に合う月の購入額だけで描き直す。条件を変えて「検索」を押すまでは前の条件のまま（変えたままの状態は何も印を出さない）。", "Vẽ lại chỉ với giá trị mua của các tháng khớp điều kiện (kỳ, pháp nhân, điểm). Cho đến khi đổi điều kiện và bấm 「検索」 vẫn theo điều kiện cũ (không hiện dấu khi đã đổi mà chưa bấm).")),
    F("6.1", T("拠点の選択肢", "Lựa chọn điểm"), ".dgrid > .card:nth-child(3) select[aria-label=\"拠点\"]", "select", "select", req="－", len=["選択（拠点（すべて）／拠点名）", "Chọn (Tất cả điểm / tên điểm)"], init=T("拠点（すべて）", "Tất cả điểm"), ex=["株式会社サンプル 本社", "Điểm của pháp nhân đã chọn"], detail=T("法人を選ぶと、その法人の拠点だけが選択肢になる。", "Chọn pháp nhân thì lựa chọn chỉ gồm các điểm của pháp nhân đó.")),
], wait=900, note=T("法人＝株式会社サンプルを選んで「検索」を押した直後。", "Ngay sau khi chọn pháp nhân = 株式会社サンプル và bấm 「検索」."))

# ------------------------------------------------------------------ 011 お気に入り × 購入分析
V011 = V("011", T("お気に入り × 購入分析：カテゴリを選んで検索", "Yêu thích × mua hàng: chọn danh mục rồi tìm kiếm"), "/ops",
         JS + "const c=q('.dgrid > .card:nth-child(4)');const cb=c.querySelectorAll('.filter input[type=checkbox]')[4];cb.click();await sleep(200);c.querySelector('.f-act .btn.pri').click();await sleep(800);", [
    F("6", T("カテゴリを絞ったグラフ", "Biểu đồ đã lọc theo danh mục"), ".dgrid > .card:nth-child(4) svg.dsvg", "area", detail=T("選んだカテゴリの商品だけを棒（購入金額）と線（お気に入り件数）で出す。右の見出しの商品数も変わる。", "Chỉ hiện sản phẩm của danh mục đã chọn bằng cột (giá trị mua) và đường (số lượt yêu thích). Số sản phẩm ở tiêu đề bên phải cũng đổi.")),
], wait=900, note=T("カテゴリを1つ選んで「検索」を押した直後。", "Ngay sau khi chọn 1 danh mục và bấm 「検索」."))

# ------------------------------------------------------------------ 012 グラフ 0件
V012 = V("012", T("グラフ 0件（期間を未来にして検索）", "Biểu đồ 0 dòng (đặt kỳ ở tương lai rồi tìm kiếm)"), "/ops",
         JS + "for(const n of [3,4]){const c=q('.dgrid > .card:nth-child('+n+')');setv(c.querySelector('input[aria-label=\"期間（から）\"]'),'2030-01');setv(c.querySelector('input[aria-label=\"期間（まで）\"]'),'2030-12');await sleep(200);c.querySelector('.f-act .btn.pri').click();await sleep(500);}", [
    F("6", T("0件のメッセージ（月次購入額推移）", "Thông báo 0 dòng (biến động hàng tháng)"), ".dgrid > .card:nth-child(3) p.muted", "label", "show", err=["I01"],
      detail=T("該当する月がなければ、グラフの場所に I01 を出す（コードの文言は「条件に一致するデータがありません。条件を変えるか「クリア」を押してください。」。I01 に統一する・宿題）。", "Nếu không có tháng phù hợp thì hiện I01 ở chỗ biểu đồ (câu trong code là 「条件に一致するデータがありません。条件を変えるか「クリア」を押してください。」. Thống nhất thành I01; việc cần sửa)."),
      demo_ok=T("コードの文言は「条件に一致するデータがありません。条件を変えるか「クリア」を押してください。」（宿題）。仕様は I01", "Câu trong code là 「条件に一致するデータがありません。条件を変えるか「クリア」を押してください。」 (việc cần sửa). Đặc tả là I01")),
    F("6.1", T("0件のメッセージ（お気に入り × 購入分析）", "Thông báo 0 dòng (yêu thích × mua hàng)"), ".dgrid > .card:nth-child(4) p.muted", "label", "show", err=["I01"], detail=T("同じ。グラフも凡例も出さない。", "Giống trên. Không hiện biểu đồ và chú giải."),
      demo_ok=T("コードの文言は上と同じ（宿題）。仕様は I01", "Câu trong code giống trên (việc cần sửa). Đặc tả là I01")),
], wait=900, note=T("両方のグラフの期間を 2030-01〜2030-12 にして「検索」を押した直後。", "Ngay sau khi đặt kỳ của cả hai biểu đồ là 2030-01〜2030-12 và bấm 「検索」."))

# ------------------------------------------------------------------ 013 権限が違う役割（CS）
V013 = V("013", T("権限が違う役割（CS）", "Vai trò khác quyền (CS)"), "/ops", "", [
    F("6", T("アラート（全部出る）", "Cảnh báo (hiện tất cả)"), ".dgrid > .card:nth-child(1)", "area", detail=T("CS（Ad00002・契約の編集は R/U）でも、フル権限と同じアラートを全部出す（台帳 F Q-D5＝B）。ダッシュボードは全7役割が閲覧でき、CSV はない（権限表）。「開く」で開く先の画面を見る権限がなければ、その画面側で権限なしを出す（ダッシュボードの側では隠さない）。", "CS (Ad00002, sửa hợp đồng là R/U) cũng hiện tất cả cảnh báo giống quyền đầy đủ (sổ F Q-D5=B). Dashboard cả 7 vai trò đều xem được, không có CSV (bảng quyền). Nếu không có quyền xem màn hình đích của 「開く」 thì màn hình đó hiện không có quyền (không ẩn ở phía dashboard).")),
], login="Ad00002", wait=1200, note=T("CS（Ad00002）で表示。", "Hiển thị với CS (Ad00002)."))

# ------------------------------------------------------------------ 014 廃棄率 3% 超
V014 = V("014", T("廃棄率が3%を超えた拠点のアラート（未実装）", "Cảnh báo điểm có tỉ lệ hủy trên 3% (chưa cài đặt)"), "/ops", "", [
    alert_row("6", "廃棄率の行", "Dòng tỉ lệ hủy", "li::廃棄率が3%を超えた拠点",
              T("実績精算が未確定の月の拠点を数え、廃棄率（廃棄 ÷（前回の在庫 ＋ 納品））が3%を超えた拠点を「廃棄率が3%を超えた拠点 n件」で出す（台帳 F Q-D2・H。在庫.md 7-9・受付簿 #122）。色は黄（warn）。「開く」は実績精算へ。TOP は3%で、実績精算の画面の色付けの10%とは別（目的が違う）。運営E と数え方を合わせる。", "Đếm các điểm có tháng 実績精算 chưa chốt, hiện điểm có tỉ lệ hủy (hủy ÷ (tồn lần trước + giao hàng)) trên 3% dạng 「廃棄率が3%を超えた拠点 n件」 (sổ F Q-D2・H. 在庫.md 7-9, sổ tiếp nhận #122). Màu vàng (warn). 「開く」 tới 実績精算. TOP dùng 3%, khác 10% tô màu ở màn hình 実績精算 (mục đích khác). Thống nhất cách đếm với 運営E."),
              err=["W108"], demo_ok=H_UNIMPL),
], note=T("コードはまだ作っていないので、画像は通常の画面（状態 001）で、行の番号は枠が出ない（demo_ok・宿題 D1）。", "Code chưa làm nên ảnh là màn hình thường (trạng thái 001), số của dòng không hiện khung (demo_ok, việc cần sửa D1)."))

# ------------------------------------------------------------------ 015 読込中・読込失敗
FAILJS = (JS +
          "const orig=window.fetch;window.__kdOrig=orig;"
          "window.fetch=(u,o)=>{const s=String(u&&u.url||u);return /\\/ops\\/area\\/general\\/(topAlerts|topSchedule|dashLine|dashFav)/.test(s)?Promise.resolve(new Response('{\"message\":\"x\"}',{status:500,headers:{'Content-Type':'application/json'}})):orig(u,o);};"
          "const go=t=>[...document.querySelectorAll('a')].find(a=>a.textContent.replace(/\\s+/g,'').includes(t));"
          "go('契約申請管理').click();await sleep(1500);go('ダッシュボード').click();await sleep(1500);")
V015 = V("015", T("アラート・スケジュール・グラフの読込失敗（部品ごと）", "Lỗi tải cảnh báo / lịch / biểu đồ (theo từng bộ phận)"), "/ops", FAILJS, [
    F("6", T("読込失敗（アラート）", "Lỗi tải (cảnh báo)"), ".dgrid > .card:nth-child(1) [role=alert]", "label", "show", err=["W103"],
      detail=T("アラートを読み込めなかったときは、アラートの場所に W103 と「再読み込み」を出す。ほかの部品（スケジュール・グラフ）は止めない（台帳 F Q-D6＝A）。", "Khi không tải được cảnh báo thì hiện W103 và nút 「再読み込み」 ở chỗ cảnh báo. Không làm dừng các bộ phận khác (lịch, biểu đồ) (sổ F Q-D6=A).")),
    F("6.1", T("再読み込み", "Tải lại"), ".dgrid > .card:nth-child(1) [role=alert] button", "button", "click", detail=T("その部品だけを読み直す。成功すれば通常の表示に戻る。", "Chỉ tải lại bộ phận đó. Thành công thì quay về hiển thị bình thường.")),
    F("6.2", T("読込失敗（スケジュール）", "Lỗi tải (lịch)"), ".dgrid > .card:nth-child(2) [role=alert]", "label", "show", err=["W103"], detail=T("スケジュールも同じ。見出し・前へ・今日・次へのボタンは残す（月を表示できなければ非活性）。", "Lịch cũng vậy. Giữ tiêu đề và các nút trước / hôm nay / sau (không khả dụng nếu không hiển thị được tháng).")),
    F("6.3", T("読込失敗（月次購入額推移）", "Lỗi tải (biến động mua hàng hàng tháng)"), ".dgrid > .card:nth-child(3) [role=alert]", "label", "show", err=["W103"], detail=T("グラフの場所に出す。検索条件の枠は残し、条件を変えて「検索」でも読み直せる。", "Hiện ở chỗ biểu đồ. Giữ khung điều kiện tìm kiếm, đổi điều kiện rồi bấm 「検索」 cũng tải lại được.")),
    F("6.4", T("読込失敗（お気に入り × 購入分析）", "Lỗi tải (yêu thích × mua hàng)"), ".dgrid > .card:nth-child(4) [role=alert]", "label", "show", err=["W103"], detail=T("同じ。", "Giống trên.")),
    F("6.5", T("読み込み中", "Đang tải"), ".dgrid > .card p.muted", "label", "show", err=["I103"], detail=T("読み込み中は各部品の場所に「読み込み中…」を出す（I103）。画面の一番外側のデータ（アラートなど全体の土台）が読めないときは、見出しと W103 だけを出す。", "Khi đang tải, ở chỗ mỗi bộ phận hiện 「読み込み中…」 (I103). Nếu dữ liệu ngoài cùng của màn hình (nền chung của cảnh báo...) không đọc được thì chỉ hiện tiêu đề và W103."),
      demo_ok=T("コードの文言は「読み込み中…」のまま（共通メッセージ I103 の文言「読み込み中です。」に合わせる・宿題）。画像は読み込みが終わったあとのため枠が出ない", "Câu trong code là 「読み込み中…」 (cần sửa cho khớp I103 「読み込み中です。」). Ảnh chụp sau khi tải xong nên không hiện khung")),
], wait=500, note=T("読み込みの通信を失敗させて撮影（ブラウザの中で通信を止めて、ほかの画面を開いてから戻る）。4つの部品が個別に W103 を出す。", "Chụp khi làm thất bại giao tiếp tải (chặn giao tiếp trong trình duyệt, mở màn hình khác rồi quay lại). 4 bộ phận hiện W103 riêng."))

# ------------------------------------------------------------------ 016 倉庫スタッフ
V016 = V("016", T("倉庫スタッフにも全アラートが出る（Q-D5＝B の例外の見え方）", "Nhân viên kho cũng thấy toàn bộ cảnh báo (cách hiển thị ngoại lệ của Q-D5=B)"), "/ops", "", [
    F("6", T("アラート（倉庫スタッフ）", "Cảnh báo (nhân viên kho)"), ".dgrid > .card:nth-child(1)", "area", detail=T("倉庫スタッフ（Ad00021・入荷管理だけ R/U）にも、請求・契約申請などを含む全アラートと「開く」を出す（台帳 F Q-D5＝B。基本設計 §10-6-1 P1「権限のない画面はメニューに出さない」の例外で、基本設計に例外として書く）。「開く」の先を見る権限がなければ、その画面で権限なしを出す。", "Nhân viên kho (Ad00021, chỉ R/U cho quản lý nhập kho) cũng thấy toàn bộ cảnh báo gồm hóa đơn, đơn hợp đồng... và 「開く」 (sổ F Q-D5=B. Là ngoại lệ của 基本設計 §10-6-1 P1 「màn hình không có quyền thì không hiện trên menu」, ghi như ngoại lệ trong 基本設計). Nếu không có quyền xem màn hình đích thì màn hình đó hiện không có quyền.")),
    F("6.1", T("契約申請の行（倉庫スタッフ）", "Dòng đơn hợp đồng (nhân viên kho)"), "li::対応が必要な申請", "label", detail=T("倉庫スタッフはメニューに契約申請管理を持たないが、この行は出す。「開く」を押すと契約申請管理の側で権限なしを出す。", "Nhân viên kho không có quản lý đơn hợp đồng trên menu nhưng dòng này vẫn hiện. Bấm 「開く」 thì phía quản lý đơn hợp đồng hiện không có quyền.")),
], login="Ad00021", wait=1200, note=T("倉庫スタッフ（Ad00021）で表示。", "Hiển thị với nhân viên kho (Ad00021)."))

# ------------------------------------------------------------------ 017 メニューを自動公開できなかった
V017 = V("017", T("メニューを自動公開できなかった（今日 2026-11-02）", "Menu không thể tự động công khai (hôm nay 2026-11-02)"), "/ops", "", [
    F("6", T("自動公開できなかった帯", "Dải không thể tự động công khai"), ".card::を自動公開できませんでした", "area", err=["W107"],
      detail=T("自動公開日（2026-11-01）を過ぎても条件が足りないときは、見出しを「{メニュー名}を自動公開できませんでした（自動公開日 {日付}）」に変え、説明を「条件がそろうまで公開しません。」にする。足りない条件の箇条書きは同じ。条件が足りないまま公開する手段はない（台帳 M-2）。", "Khi đã quá ngày tự động công khai (2026-11-01) mà vẫn thiếu điều kiện thì đổi tiêu đề thành 「{tên menu}を自動公開できませんでした（自動公開日 {ngày}）」 và phần giải thích thành 「条件がそろうまで公開しません。」. Danh sách gạch đầu dòng điều kiện còn thiếu giữ nguyên. Không có cách công khai khi còn thiếu điều kiện (sổ M-2).")),
], today="2026/11/02", note=T("デモの日付を 2026-11-02 にして撮影（自動公開日の後）。", "Chụp với ngày demo 2026-11-02 (sau ngày tự động công khai)."))

VIEWS = [V001, V002, V003, V004, V005, V006, V007, V008, V009, V010, V011, V012, V013, V014, V015, V016, V017]
for _v in VIEWS:
    for _it in _v["items"]:
        pass
    _v["state"] = [_v["state"], ""] if isinstance(_v["state"], str) else _v["state"]
    _v["note"] = [_v.get("note", ""), ""] if isinstance(_v.get("note", ""), str) else _v["note"]


def _fill_vi(o, key=None):
    if isinstance(o, list) and len(o) == 2 and all(isinstance(x, str) for x in o):
        if o[1] == "":
            o[1] = VI[o[0]] if o[0] in VI else ""
    elif isinstance(o, dict):
        if "ja" in o and o.get("vi") == "":
            o["vi"] = VI.get(o["ja"], "")
        for k, v in o.items():
            _fill_vi(v, k)
    elif isinstance(o, list):
        for v in o:
            _fill_vi(v, key)


for _o in (TITLE, SHEET, CODE_NOTE, SYSTEM, DECISIONS, SCREENS, VIEWS):
    _fill_vi(_o)
