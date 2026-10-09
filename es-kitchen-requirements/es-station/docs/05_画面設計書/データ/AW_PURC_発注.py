# -*- coding: utf-8 -*-
"""
画面設計書のデータ：運営管理者Web ＞ 発注・入荷 ＞ 発注（AW_PURC）
  AW_PURC_001 発注一覧（商品ごと）／002 発注一覧（発注データごと＝発注・入荷履歴）／003 発注詳細（通常商品）／004 発注詳細（短消費期限商品）
元は本物の Web（app/ops/purchasing/{orders,history}、_components/{PoList,PoModals,payables}.tsx、orders/[pid]/{NormalBody,ShortBody}.tsx）。
決定は docs/決定台帳.md（I「発注・仕入先サイト・入荷」・E・H）が正。
洗い出し・確認の記録は docs/05_画面設計書/確認メモ_AW_運営C1_発注・入荷.md（回答 2026-10-07）。

・発注・入荷履歴は独立の機能ではなく、AW_PURC_002（発注一覧の「発注データごと」）として書く（hong 回答 2026-10-07・台帳 I）。
・発注詳細は通常商品（003）と短消費期限商品（004）で画面を分ける（hong 回答 2026-10-07）。
・デモ専用ボタン・「仕様確認」「発注メールの文面」の画面は書かない（hong 回答 2026-10-07・確認メモ Q11・Q12）。
見本のデータ（今日＝2026-10-05）：2026-11（公開中・仮発注）／2026-10（本発注・納期回答済）／2026-09（入荷済）

コードと決定が違うところ（demo_ok＝決定が正・コードを直す宿題。確認メモ §3）：H1〜H19
"""

TITLE = ["発注（AW_PURC）", "Đặt hàng (AW_PURC)"]
SHEET = ["発注", "Đặt hàng"]
BASENAME = "画面設計書_AW_PURC_発注"
IMG_PREFIX = "AW_PURC"
OUT_DIR = "AW_PURC_発注"
CODE_NOTE = ["画面コードは規約 <Module(2)>_<Feature(4)>_<Seq(3)>。AW＝運営管理者Web、PURC＝発注（入荷登録は AW_RECV）",
             "Mã màn hình theo quy ước <Module(2)>_<Feature(4)>_<Seq(3)>. AW = Admin Web, PURC = Đặt hàng (nhập kho là AW_RECV)"]
SITE = "ops"
SYSTEM = {"ja": "運営管理者Web", "vi": "Web quản trị vận hành"}
AUTHOR = "Claude（cloud）／確認：hong"
CREATED = "2026-10-07"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "ops", "loginId": "Ad00010"}
CODE_PATHS = ["app/ops/purchasing", "lib/ops/purchasing", "lib/ops/areas/purchasing.ts", "lib/domain/stock.ts", "lib/domain/seed", "app/ops/_ui"]


def J(ja, vi=""):
    return [ja, vi]


DECISIONS = [
    {"date": "2026-10-07", "target": "AW_PURC_002",
     "q": J("発注・入荷履歴を独立の画面にするか", "Có làm 発注・入荷履歴 thành màn hình riêng không"),
     "a": J("独立にしない。発注一覧の「発注データごと」（AW_PURC_002）として書く。メニュー「発注・入荷履歴」は残す", "Không làm màn hình riêng. Ghi như 「発注データごと」 (AW_PURC_002) của danh sách đặt hàng. Giữ lại mục thực đơn 「発注・入荷履歴」"),
     "src": "hong 回答 2026-10-07（確認メモ C1 Q1）・台帳 I（R6）"},
    {"date": "2026-10-07", "target": "AW_PURC_003・004",
     "q": J("通常商品と短消費期限商品の発注の画面", "Màn hình đặt hàng của hàng thường và hàng hạn ngắn"),
     "a": J("発注詳細を2つの画面に分ける（003＝通常商品：発注単位ごと／004＝短消費期限商品：行〔倉庫×納品日〕ごと）。追加発注も2つの流れにする。一覧は1つのまま、一括仮発注・本発注は通常商品だけ", "Chia chi tiết đặt hàng thành 2 màn hình (003 = sản phẩm thường: theo đơn vị đặt hàng / 004 = sản phẩm hạn tiêu thụ ngắn: theo dòng 〈kho × ngày giao〉). Đặt hàng bổ sung cũng thành 2 luồng. Danh sách vẫn là một, đặt hàng tạm・chính thức hàng loạt chỉ cho sản phẩm thường"),
     "src": "hong 回答 2026-10-07（確認メモ C1 Q8・Q16）・台帳 I"},
    {"date": "2026-10-07", "target": "AW_PURC_001 商品追加",
     "q": J("毎月の発注一覧と「商品追加」", "Danh sách đặt hàng hằng tháng và nút 商品追加"),
     "a": J("毎月の発注一覧＝その月のメニューの商品。「商品追加」＝メニュー以外の商品（お菓子・ドレッシングなど）を足す。資材は足さない（資材発注）。足した商品は「メニュー外」の印つきの行で出す", "Danh sách đặt hàng hằng tháng = sản phẩm trong menu của tháng đó. 「商品追加」 = thêm sản phẩm ngoài menu (bánh kẹo, nước sốt trộn salad, v.v.). Không thêm vật tư (đặt hàng vật tư). Sản phẩm đã thêm hiển thị ở dòng có dấu 「メニュー外」"),
     "src": "hong 回答 2026-10-07（確認メモ C1 Q15）・台帳 I・仕様 §2-12"},
    {"date": "2026-10-07", "target": "AW_PURC_002 請求照合",
     "q": J("請求照合を変えられる人", "Ai đổi được 請求照合"),
     "a": J("発注管理の編集ができる役割に加え、経理も「請求照合」だけ変えられる", "Ngoài vai trò có quyền chỉnh sửa quản lý đặt hàng, kế toán cũng đổi được riêng 「請求照合」"), "src": "hong 回答 2026-10-07（確認メモ C1 Q7）・台帳 I・権限表"},
    {"date": "2026-10-07", "target": "AW_PURC_002 発注データ詳細",
     "q": J("詳細の「入荷を登録」ボタン", "Nút 入荷を登録 trong chi tiết"),
     "a": J("「入荷登録を開く」リンクに変える（入荷の記録は入荷登録の1か所）", "Đổi thành liên kết 「入荷登録を開く」 (việc ghi nhận nhập kho chỉ ở một nơi là đăng ký nhập kho)"), "src": "hong 回答 2026-10-07（確認メモ C1 Q3）・台帳 I"},
    {"date": "2026-10-07", "target": "AW_PURC_002 代理入力（出荷報告）",
     "q": J("送り状番号の形式", "Định dạng số vận đơn"),
     "a": J("形式（桁数）は見ない（任意・自由入力）", "Không kiểm tra định dạng (số chữ số) (tùy chọn・nhập tự do)"), "src": "hong 回答 2026-10-07（確認メモ C1 Q9）・台帳 I"},
    {"date": "2026-10-07", "target": "一覧の初期の並び",
     "q": J("初期の並び", "Thứ tự ban đầu"),
     "a": J("商品ごと＝品番の昇順／発注データごと＝最終発注日時の降順", "Theo sản phẩm = mã sản phẩm tăng dần / theo dữ liệu đặt hàng = ngày giờ đặt hàng cuối cùng giảm dần"), "src": "hong 回答 2026-10-07（確認メモ C1 Q10・提案どおり）"},
    {"date": "2026-10-07", "target": "AW_PURC_003 区切り・データリセット・発注済データ確認",
     "q": J("発注単位の区切り3つ・データリセット・発注済データ確認のモーダル", "3 kiểu chia 発注単位, データリセット, modal 発注済データ確認"),
     "a": J("残して設計書に書く", "Giữ lại và ghi vào tài liệu thiết kế"), "src": "hong 回答 2026-10-07（確認メモ C1 Q13・Q14）"},
    {"date": "2026-10-07", "target": "仕様確認・発注メールの文面・デモの印",
     "q": J("コードにだけあるモーダルとデモ専用の表示", "Modal chỉ có trong code và hiển thị dành riêng cho demo"),
     "a": J("「仕様確認」「発注メールの文面」の画面は外す。デモ専用ボタン・デモの印は外す（設計書・仕様にも出さない）", "Bỏ màn hình 「仕様確認」「発注メールの文面」. Bỏ nút và dấu dành riêng cho demo (cũng không đưa vào tài liệu thiết kế・spec)"), "src": "hong 回答 2026-10-07（確認メモ C1 Q11・Q12）・台帳 I"},
    {"date": "2026-10-07", "target": "権限",
     "q": J("だれが発注できるか", "Ai đặt hàng được"),
     "a": J("権限表の「発注管理」：フル権限・商品開発＝CRUD（仮発注・本発注・代理入力・取消・追加発注）、ほか＝R（経理は請求照合だけ変更できる）", "Quyền \"quản lý đặt hàng\" trong bảng quyền: toàn quyền・phát triển sản phẩm = CRUD (đặt hàng tạm・đặt hàng chính thức・nhập hộ・hủy・đặt hàng bổ sung), còn lại = R (kế toán chỉ đổi được đối chiếu hóa đơn)"), "src": "運営Web_権限表_20261003・台帳 I"},
    {"date": "2026-10-07", "target": "画面コード",
     "q": J("画面コード", "Mã màn hình"),
     "a": J("AW_PURC_001〜004", "AW_PURC_001〜004"), "src": "確認メモ C1 §0"},
]
CHANGES = []

HIDE_ALWAYS = [".es-demo-bar"]
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [
    {"code": "AW_PURC_001", "ja": "発注一覧（商品ごと）", "vi": "Danh sách đặt hàng (theo sản phẩm)"},
    {"code": "AW_PURC_002", "ja": "発注一覧（発注データごと＝発注・入荷履歴）", "vi": "Danh sách đặt hàng (theo dữ liệu đặt hàng = lịch sử đặt hàng・nhập kho)"},
    {"code": "AW_PURC_003", "ja": "発注詳細（通常商品）", "vi": "Chi tiết đặt hàng (sản phẩm thường)"},
    {"code": "AW_PURC_004", "ja": "発注詳細（短消費期限商品）", "vi": "Chi tiết đặt hàng (sản phẩm hạn ngắn)"},
]

H = (
    "const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));"
    "const setv=(el,v)=>{if(!el)return;const p=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;"
    "Object.getOwnPropertyDescriptor(p,'value').set.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}));};"
    "const setsel=(el,v)=>{if(!el)return;Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(el,v);el.dispatchEvent(new Event('change',{bubbles:true}));};"
    "const btn=(t,root)=>[...(root||document).querySelectorAll('button')].find(b=>(b.textContent||'').trim().includes(t));"
    "const row=(id)=>[...document.querySelectorAll('tr')].find(tr=>(tr.textContent||'').includes(id));"
    "const search=async(q)=>{const i=document.querySelector('.filter .search input');setv(i,q);await sleep(100);btn('検索',document.querySelector('.filter')).click();await sleep(500);};"
)


def it(no, ja, sel, kind, trig, detail=None, vi="", detail_vi="", **kw):
    d = {"no": no, "ja": ja, "vi": vi, "sel": sel, "kind": kind, "trig": trig}
    if detail:
        d["detail"] = J(detail, detail_vi)
    for k in ("cond", "valid", "init", "ex", "len", "open", "demo_ok"):
        k_vi = kw.pop(k + "_vi", None)
        if k in kw:
            v = kw.pop(k)
            if isinstance(v, (list, tuple)):
                d[k] = list(v)
            elif k_vi is not None:
                d[k] = [v, k_vi]
            elif k == "len":
                d[k] = v
            else:
                d[k] = J(v)
    d.update(kw)
    return d


V = []


def view(i, code, state, items, url, state_vi="", note_vi="", **kw):
    d = {"id": i, "code": code, "state": J(state, state_vi), "setup": "", "full": True, "url": url, "note": J(kw.pop("note", ""), note_vi), "items": items}
    d.update(kw)
    V.append(d)


# ================================================================ 共通の部品（AW_PURC_001・002 で使う）
BANNER = [
    it("2", "仕入先からの通知", ".card:has(.notice), .card .hint", "area", "view",
       "仕入先からの通知を、発注一覧の上の帯に出す（仕入先サイトの回答・入荷の差異・便への影響）。新しい通知がなければ「新しい通知はありません。」。決まりの1行（数量を直せるのは承認まで・分納は3回まで・追加発注・メールの扱い）も出す。", vi="Thông báo từ nhà cung cấp", detail_vi="Hiển thị thông báo từ nhà cung cấp ở dải phía trên danh sách đặt hàng (phản hồi trên site nhà cung cấp, chênh lệch nhập kho, ảnh hưởng tới chuyến giao). Nếu không có thông báo mới thì hiện \"新しい通知はありません。\". Cũng hiển thị một dòng quy tắc (chỉ sửa được số lượng đến khi được duyệt, giao từng phần tối đa 3 lần, đặt hàng bổ sung, cách xử lý email)."),
    it("2.1", "本発注の承認待ち（仕入先が未処理）", ".card .notice.ng button::見る", "label", "view",
       "仕入先が本発注を承認していない（営業日24時間ごとにアラートメールを送っている）発注の件数と、発注番号ごとのアラート回数。「見る」で発注データごと（AW_PURC_002）を「承認待ち」で絞って開く。", cond="仕入先が本発注を承認していない発注があるとき", vi="Chờ duyệt đặt hàng chính thức (nhà cung cấp chưa xử lý)", detail_vi="Số đơn đặt hàng mà nhà cung cấp chưa duyệt đặt hàng chính thức (hệ thống gửi email cảnh báo mỗi 24 giờ làm việc) và số lần cảnh báo theo từng mã đơn đặt hàng. Nút \"見る\" mở danh sách theo dữ liệu đặt hàng (AW_PURC_002) đã lọc theo \"承認待ち\".", cond_vi="Khi có đơn đặt hàng mà nhà cung cấp chưa duyệt đặt hàng chính thức"),
    it("2.2", "受注不可の通知", ".card .notice.ng button::見る", "label", "view",
       "仕入先が「受注不可」と回答した発注（発注番号）。別の仕入先への手配か、発注のキャンセルをする。「見る」で絞って開く。", cond="未確認の受注不可があるとき", vi="Thông báo không nhận đơn", detail_vi="Đơn đặt hàng (mã đơn đặt hàng) mà nhà cung cấp trả lời là \"受注不可\" (không nhận đơn). Cần chuyển sang nhà cung cấp khác hoặc hủy đơn đặt hàng. Nút \"見る\" mở danh sách đã lọc.", cond_vi="Khi có đơn không nhận đơn chưa xác nhận"),
    it("2.3", "分納の通知（確認した）", ".card .notice.warn button::確認した", "button", "click",
       "仕入先が分納を登録した（承認は不要・画面のアラートだけでメールなし）。「確認した」で通知を確認済みにする。", cond="未確認の分納があるとき。「確認した」は発注の編集の権限", vi="Thông báo giao từng phần (đã xác nhận)", detail_vi="Nhà cung cấp đã đăng ký giao từng phần (không cần duyệt; chỉ cảnh báo trên màn hình, không gửi email). Nút \"確認した\" đánh dấu thông báo là đã xác nhận.", cond_vi="Khi có giao từng phần chưa xác nhận. Nút \"確認した\" cần quyền chỉnh sửa đặt hàng"),
    it("2.4", "入荷の差異の通知（入荷登録を開く）", ".card .notice.ng button::入荷登録を開く", "button", "click",
       "入荷の差異が対応待ち、または分納の入荷予定日を過ぎた発注の件数と発注番号・商品・数。「入荷登録を開く」で入荷登録（AW_RECV_001）へ。", cond="差異の対応待ち・分納の予定日超過があるとき", vi="Thông báo chênh lệch nhập kho (mở nhập kho)", detail_vi="Số đơn đặt hàng có chênh lệch nhập kho đang chờ xử lý hoặc đã quá ngày nhập kho dự kiến của giao từng phần, kèm mã đơn đặt hàng, sản phẩm, số lượng. Nút \"入荷登録を開く\" chuyển sang màn hình đăng ký nhập kho (AW_RECV_001).", cond_vi="Khi có chênh lệch đang chờ xử lý hoặc giao từng phần quá ngày dự kiến"),
    it("2.5", "入荷予定日が便に間に合わない（スケジュールを開く）", ".card .notice.ng button::スケジュールを開く", "button", "click",
       "仕入先が答えた入荷予定日が、入荷を待って回した便の出荷に間に合わない発注と便（出荷日・配送ID）。便は自動で動かさない（台帳 I）。「スケジュールを開く」で運営のスケジュールへ。", cond="間に合わない便があるとき", vi="Ngày nhập kho dự kiến không kịp chuyến giao (mở lịch)", detail_vi="Đơn đặt hàng và chuyến giao (ngày xuất hàng, ID giao hàng) mà ngày nhập kho dự kiến do nhà cung cấp trả lời không kịp ngày xuất của chuyến giao đã dời lại để chờ nhập kho. Hệ thống không tự dời chuyến giao (sổ cái I). Nút \"スケジュールを開く\" chuyển sang lịch của bộ phận vận hành.", cond_vi="Khi có chuyến giao không kịp"),
]
TABS = [
    it("5", "表示の切り替え（タブ）", ".seg2", "tab", "click", "「商品ごと」（AW_PURC_001）と「発注データごと（発注・入荷の履歴）」（AW_PURC_002）を切り替える。", pattern="P-TAB", vi="Chuyển chế độ hiển thị (tab)", detail_vi="Chuyển giữa \"商品ごと\" (theo sản phẩm, AW_PURC_001) và \"発注データごと（発注・入荷の履歴）\" (theo dữ liệu đặt hàng, lịch sử đặt hàng・nhập kho, AW_PURC_002)."),
    it("5.1", "商品ごと", ".seg2 button::商品ごと", "tab", "click", "発注一覧（商品ごと）へ。", vi="Theo sản phẩm", detail_vi="Chuyển sang danh sách đặt hàng (theo sản phẩm)."),
    it("5.2", "発注データごと（発注・入荷の履歴）", ".seg2 button::発注データごと", "tab", "click", "発注一覧（発注データごと）へ。メニュー「発注・入荷履歴」も同じ画面を開く（hong 2026-10-07）。", vi="Theo dữ liệu đặt hàng (lịch sử đặt hàng・nhập kho)", detail_vi="Chuyển sang danh sách đặt hàng (theo dữ liệu đặt hàng). Mục thực đơn \"発注・入荷履歴\" cũng mở cùng màn hình này (hong 2026-10-07)."),
]

# ================================================================ AW_PURC_001 発注一覧（商品ごと）
LIST1_HEAD = [
    it("1", "ヘッダーのボタン", ".ph .btns", "area", "view", "権限がないボタンは出さない（発注管理の権限）。", vi="Các nút ở phần đầu trang", detail_vi="Không hiển thị nút mà người dùng không có quyền (quyền quản lý đặt hàng)."),
    it("1.1", "CSV出力", ".ph .btns button::CSV出力", "button", "click", "表示中の一覧（条件を反映）を出力する。列：品番・商品名・区分・カテゴリ・仕入先・オーダー数・必要数・代替品数・仮発注・本発注・倉庫（見込み）・発注ステータス・エラー。", pattern="P-CSV-OUT", cond="発注管理の CSV出力 の権限", vi="Xuất CSV", detail_vi="Xuất danh sách đang hiển thị (đã áp dụng điều kiện lọc). Các cột: mã sản phẩm, tên sản phẩm, phân loại, danh mục, nhà cung cấp, số lượng đơn, số lượng cần, số lượng hàng thay thế, đặt hàng tạm, đặt hàng chính thức, kho (dự kiến), trạng thái đặt hàng, lỗi.", cond_vi="Quyền xuất CSV của quản lý đặt hàng"),
    it("1.2", "発注済データ確認", ".ph .btns button::発注済データ確認", "button", "click", "選んだメニュー年月の発注済みのデータ（仮発注・本発注）と金額を見るモーダル（No.10）を開く。", vi="Xác nhận dữ liệu đã đặt hàng", detail_vi="Mở modal (No.10) xem dữ liệu đã đặt hàng (đặt hàng tạm・đặt hàng chính thức) và số tiền của năm-tháng menu đã chọn."),
    it("1.3", "仮発注", ".ph .btns button::仮発注", "button", "click", "一括仮発注（モーダル No.9）を開く。選んだ商品があればその商品、なければ未発注のある商品が対象。**通常商品だけ**が対象（短消費期限商品は発注詳細 AW_PURC_004 で発注）。", cond="発注管理の「発注の作成」の権限",
       demo_ok="コードは短消費期限商品も対象になる（H19）。対象から外す（hong 2026-10-07・確認メモ Q16）。", vi="Đặt hàng tạm", detail_vi="Mở modal đặt hàng tạm hàng loạt (modal No.9). Nếu đã chọn sản phẩm thì áp dụng cho các sản phẩm đó, nếu chưa chọn thì áp dụng cho các sản phẩm còn chưa đặt hàng. **Chỉ áp dụng cho sản phẩm thường** (sản phẩm hạn tiêu thụ ngắn đặt hàng ở chi tiết đặt hàng AW_PURC_004).", cond_vi="Quyền \"tạo đặt hàng\" của quản lý đặt hàng", demo_ok_vi="Code hiện áp dụng cả sản phẩm hạn tiêu thụ ngắn (H19). Sẽ loại khỏi đối tượng (hong 2026-10-07, ghi chú xác nhận Q16)."),
    it("1.4", "本発注", ".ph .btns button.pri::本発注", "button", "click", "一括本発注（モーダル No.9）を開く。仮発注済の通常商品が対象。", cond="発注管理の「本発注の発行」の権限",
       demo_ok="コードは短消費期限商品も対象になる（H19）。", vi="Đặt hàng chính thức", detail_vi="Mở modal đặt hàng chính thức hàng loạt (modal No.9). Đối tượng là các sản phẩm thường đã đặt hàng tạm.", cond_vi="Quyền \"phát hành đặt hàng chính thức\" của quản lý đặt hàng", demo_ok_vi="Code hiện áp dụng cả sản phẩm hạn tiêu thụ ngắn (H19)."),
    it("1.5", "商品追加", "-", "button", "click",
       "メニューにない商品（お菓子・ドレッシングなど。資材は足さない）を、この月の発注に足す。商品マスタの商品（メニューにないもの）を選び、倉庫・数量・入荷希望日・希望の期限・理由を入れる。足した商品は一覧に「メニュー外」の印つきの行で出る（仮発注→本発注は通常と同じ）。代替品の不足分の追加発注は自動で一覧に出る（この操作は使わない）。",
       cond="発注管理の「発注の作成」の権限", demo_ok="コードに「商品追加」のボタンがない（H16）。仕様 §2-12・台帳 I（hong 2026-10-07）。", vi="Thêm sản phẩm", detail_vi="Thêm vào đặt hàng của tháng này những sản phẩm không có trong menu (bánh kẹo, nước sốt trộn salad, v.v.; không thêm vật tư). Chọn sản phẩm trong danh mục sản phẩm (sản phẩm ngoài menu), rồi nhập kho, số lượng, ngày nhập kho mong muốn, hạn mong muốn và lý do. Sản phẩm đã thêm hiển thị trong danh sách ở dòng có dấu \"メニュー外\" (ngoài menu) (đặt hàng tạm → đặt hàng chính thức giống sản phẩm thường). Phần thiếu của hàng thay thế sẽ tự động xuất hiện trong danh sách dưới dạng đặt hàng bổ sung (không dùng thao tác này).", cond_vi="Quyền \"tạo đặt hàng\" của quản lý đặt hàng", demo_ok_vi="Code chưa có nút \"商品追加\" (H16). Theo spec §2-12 và sổ cái I (hong 2026-10-07)."),
]
LIST1_MID = [
    it("3", "本発注の時期の案内", ".card .notice, .notice", "label", "view",
       "選んだメニュー年月のサイクルの発注の時期。仮発注はメニューの公開の前（仮発注の承認が公開の条件）。本発注は月2回：前半（A・B の便）＝前のサイクルの B5〜C1／後半（C・D の便）＝D5〜次のサイクルの A1。半分ごとに「本発注の時期」「まだ」「過ぎた（済／期限切れ・未本発注 n件）」と、仮発注のままの件数を出す。", vi="Hướng dẫn thời điểm đặt hàng chính thức", detail_vi="Thời điểm đặt hàng của chu kỳ thuộc năm-tháng menu đã chọn. Đặt hàng tạm trước khi công bố menu (duyệt đặt hàng tạm là điều kiện để công bố). Đặt hàng chính thức 2 lần mỗi tháng: nửa đầu (chuyến A・B) = B5〜C1 của chu kỳ trước / nửa sau (chuyến C・D) = D5〜A1 của chu kỳ sau. Với mỗi nửa hiển thị \"本発注の時期\" (đến thời điểm đặt hàng chính thức), \"まだ\" (chưa đến), \"過ぎた（済／期限切れ・未本発注 n件）\" (đã qua: xong / quá hạn・n mục chưa đặt hàng chính thức) và số mục vẫn còn ở trạng thái đặt hàng tạm."),
    it("4", "仮発注の承認（メニューの月ごと）", ".notice::仮発注の承認", "label", "view",
       "承認済（日時・承認者）か未承認か。承認するとメニューの公開の条件がそろう（メニュー管理 ＞ 月間メニュー）。承認の取り消しもできる。", cond="未承認のとき「仮発注を承認」、承認済のとき「承認を取り消す」（発注管理の「仮発注の承認」の権限）", vi="Duyệt đặt hàng tạm (theo tháng menu)", detail_vi="Đã duyệt (ngày giờ・người duyệt) hay chưa duyệt. Khi duyệt thì đủ điều kiện công bố menu (Quản lý menu > Menu tháng). Cũng có thể hủy duyệt.", cond_vi="Khi chưa duyệt hiện \"仮発注を承認\", khi đã duyệt hiện \"承認を取り消す\" (quyền \"duyệt đặt hàng tạm\" của quản lý đặt hàng)"),
    it("4.1", "仮発注を承認／承認を取り消す", ".notice button::仮発注を承認", "button", "click", "押すとすぐ承認（または取り消し）。トーストで知らせる。", vi="Duyệt đặt hàng tạm / Hủy duyệt", detail_vi="Bấm là duyệt (hoặc hủy duyệt) ngay. Thông báo bằng toast."),
] + TABS + [
    it("6", "案内文", ".card .notice", "label", "view",
       "選んだメニュー年月のメニュー（状態・オーダー締切・お客様への納品期間 A1〜D7）。オーダー数・必要数は「メニュー管理 ＞ 商品注文管理」の注文数・調整数の合計（倉庫別）。選んだ商品があれば「n件選択中」。", vi="Dòng hướng dẫn", detail_vi="Menu của năm-tháng menu đã chọn (trạng thái, hạn chốt đơn, kỳ giao hàng cho khách A1〜D7). Số lượng đơn và số lượng cần là tổng của số lượng đặt và số điều chỉnh (theo kho) trong \"Quản lý menu > Quản lý đơn đặt sản phẩm\". Nếu đã chọn sản phẩm thì hiện \"n件選択中\" (đang chọn n mục)."),
]
LIST1_FILTER = [
    it("7", "検索条件", ".filter", "area", "view", "条件は「検索」か Enter で反映する。「未適用」の印は出さない。", pattern="P-LIST",
       demo_ok="コードは条件を変えて未反映のとき「未適用」の印を出す（H4）。外す（hong 2026-10-05）。", vi="Điều kiện tìm kiếm", detail_vi="Điều kiện được áp dụng khi bấm \"検索\" hoặc Enter. Không hiển thị dấu \"未適用\" (chưa áp dụng).", demo_ok_vi="Code hiển thị dấu \"未適用\" khi đổi điều kiện mà chưa áp dụng (H4). Sẽ bỏ (hong 2026-10-05)."),
    it("7.1", "対象年月", ".filter select[aria-label=\"対象年月\"]", "select", "select", "選んだ月のメニューの商品を出す。", req="○", len="選択（メニュー年月）", len_vi="Chọn (năm-tháng menu)", init="直近のメニュー年月", ex="2026-11", vi="Năm-tháng đối tượng", detail_vi="Hiển thị các sản phẩm trong menu của tháng đã chọn.", init_vi="Năm-tháng menu gần nhất", ex_vi="Năm-tháng của menu"),
    it("7.2", "キーワード", ".filter .search input", "text", "input", "品番・商品名・仕入先名の部分一致。", req="－", len="文字列 60", ex="M008", err=["E04"], vi="Từ khóa", detail_vi="Khớp một phần với mã sản phẩm, tên sản phẩm, tên nhà cung cấp.", ex_vi="Mã sản phẩm"),
    it("7.3", "カテゴリ", ".filter select[aria-label=\"カテゴリ\"]", "select", "select", "商品のカテゴリで絞る。", req="－", len="選択", init="カテゴリ", ex="肉類", vi="Danh mục", detail_vi="Lọc theo danh mục của sản phẩm.", init_vi="Danh mục (nhãn mặc định)", ex_vi="Danh mục thịt"),
    it("7.4", "区分", ".filter select[aria-label=\"区分\"]", "select", "select", "通常／短消費期限で絞る。", req="－", len="選択（通常／短消費期限）", len_vi="Chọn (thường / hạn tiêu thụ ngắn)", init="区分", ex="短消費期限", vi="Phân loại", detail_vi="Lọc theo sản phẩm thường / hạn tiêu thụ ngắn.", init_vi="Phân loại (nhãn mặc định)", ex_vi="Sản phẩm hạn tiêu thụ ngắn"),
    it("7.5", "発注ステータス", ".filter select[aria-label=\"発注ステータス\"]", "select", "select", "未発注／一部仮発注／仮発注済／一部本発注／本発注済 で絞る。", req="－", len="選択", init="発注ステータス", ex="仮発注済", vi="Trạng thái đặt hàng", detail_vi="Lọc theo: chưa đặt hàng / một phần đặt hàng tạm / đã đặt hàng tạm / một phần đặt hàng chính thức / đã đặt hàng chính thức.", init_vi="Trạng thái đặt hàng (nhãn mặc định)", ex_vi="Đã đặt hàng tạm"),
    it("7.6", "仕入先", ".filter select[aria-label=\"仕入先\"]", "select", "select", "商品の仕入先で絞る。", req="－", len="選択（仕入先名）", len_vi="Chọn (tên nhà cung cấp)", init="仕入先", ex="株式会社まるすぎ", vi="Nhà cung cấp", detail_vi="Lọc theo nhà cung cấp của sản phẩm.", init_vi="Nhà cung cấp (nhãn mặc định)", ex_vi="Tên nhà cung cấp"),
    it("7.7", "納品予定（から／まで）", ".filter [aria-label=\"納品予定（から）\"]", "date", "input", "その商品の発注データの、仕入先が答えた入荷予定日のうち いちばん早い日で絞る。", req="－", len="日付", ex="2026/11/05", vi="Ngày giao dự kiến (từ / đến)", detail_vi="Lọc theo ngày sớm nhất trong các ngày nhập kho dự kiến mà nhà cung cấp trả lời trong dữ liệu đặt hàng của sản phẩm đó.", ex_vi="Ngày"),
    it("7.8", "クリア", ".filter .f-act button::クリア", "button", "click", "条件を初期値に戻す。", vi="Xóa điều kiện", detail_vi="Đưa điều kiện về giá trị ban đầu."),
    it("7.9", "検索", ".filter .f-act button.pri", "button", "click", "条件を一覧に反映して1ページ目へ。", vi="Tìm kiếm", detail_vi="Áp dụng điều kiện vào danh sách và quay về trang 1."),
    it("7.10", "並べ替え", ".filter .sortbox", "select", "select", "列を選び、ボタンで昇順／降順を切り替える。初期の並びは品番の昇順（hong 2026-10-07）。", req="－", pattern="P-LIST", vi="Sắp xếp", detail_vi="Chọn cột và đổi thứ tự tăng dần / giảm dần bằng nút. Thứ tự ban đầu là mã sản phẩm tăng dần (hong 2026-10-07).", ex=["品番（昇順）", "Cột sắp xếp và chiều tăng/giảm. Mặc định là mã sản phẩm, tăng dần"]),
]
LIST1_TABLE = [
    it("8", "商品の一覧", ".tbl-wrap", "table", "view", "選んだ月のメニューの商品を1行ずつ。ページ送り（10／20／50件）。", pattern="P-PAGESIZE", vi="Danh sách sản phẩm", detail_vi="Mỗi dòng là một sản phẩm trong menu của tháng đã chọn. Phân trang (10 / 20 / 50 mục)."),
    it("8.1", "選択（チェック）", ".tbl tbody tr:first-child input[type=checkbox]", "check", "check", "一括仮発注・本発注の対象にする行を選ぶ。短消費期限商品の行は選べない（発注詳細 AW_PURC_004 で発注）。", req="－",
       demo_ok="コードは短消費期限商品の行も選べる（H19）。", vi="Chọn (checkbox)", detail_vi="Chọn các dòng làm đối tượng của đặt hàng tạm・đặt hàng chính thức hàng loạt. Không chọn được dòng sản phẩm hạn tiêu thụ ngắn (đặt hàng ở chi tiết đặt hàng AW_PURC_004).", demo_ok_vi="Code hiện cho chọn cả dòng sản phẩm hạn tiêu thụ ngắn (H19).", ex=["ON", "Đánh dấu chọn dòng để đưa vào đặt hàng hàng loạt"]),
    it("8.2", "品番", ".tbl tbody tr:first-child td:nth-child(3)", "label", "view", "商品の品番。", vi="Mã sản phẩm", detail_vi="Mã sản phẩm."),
    it("8.3", "商品名", ".tbl tbody tr:first-child button.lnk", "link", "click", "押すと発注詳細（通常商品＝AW_PURC_003／短消費期限商品＝AW_PURC_004）へ。仕入先が未発行の商品には「仕入先未発行」のバッジ（システムで発注できない）。メニュー外の商品には「メニュー外」の印。",
       demo_ok="「メニュー外」の印はコードにない（H16）。", vi="Tên sản phẩm", detail_vi="Bấm để mở chi tiết đặt hàng (sản phẩm thường = AW_PURC_003 / sản phẩm hạn tiêu thụ ngắn = AW_PURC_004). Sản phẩm mà nhà cung cấp chưa được cấp tài khoản có huy hiệu \"仕入先未発行\" (không đặt hàng được qua hệ thống). Sản phẩm ngoài menu có dấu \"メニュー外\".", demo_ok_vi="Dấu \"メニュー外\" chưa có trong code (H16)."),
    it("8.4", "区分", ".tbl tbody tr:first-child td:nth-child(5)", "label", "view", "通常／短消費期限のバッジ。", vi="Phân loại", detail_vi="Huy hiệu thường / hạn tiêu thụ ngắn."),
    it("8.5", "カテゴリ", ".tbl tbody tr:first-child td:nth-child(6)", "label", "view", "商品のカテゴリ。", vi="Danh mục", detail_vi="Danh mục của sản phẩm."),
    it("8.6", "仕入先", ".tbl tbody tr:first-child td:nth-child(7)", "label", "view", "商品の仕入先名。", vi="Nhà cung cấp", detail_vi="Tên nhà cung cấp của sản phẩm."),
    it("8.7", "オーダー数", ".tbl tbody tr:first-child td:nth-child(8)", "label", "view", "法人の注文数の合計（運営Web 商品注文管理）。", vi="Số lượng đơn", detail_vi="Tổng số lượng đặt của các pháp nhân (Quản lý đơn đặt sản phẩm trên Web vận hành)."),
    it("8.8", "必要数", ".tbl tbody tr:first-child td:nth-child(9)", "label", "view", "注文数＋調整数（無料枠）＋営業サンプル分。営業サンプル分＝その商品の受付済の実際の数量＋枠の残り件数×2個（各2個は仮。営業サンプル AW_SMP と同じ）。倉庫ごとに集計する。", vi="Số lượng cần", detail_vi="Số lượng đặt + số điều chỉnh (suất miễn phí) + phần hàng mẫu kinh doanh. Phần hàng mẫu = số lượng thực tế đã tiếp nhận (受付済) của sản phẩm đó + số mẫu còn lại của hạn mức × 2 cái (2 cái mỗi mẫu là tạm; giống AW_SMP). Tổng hợp theo từng kho."),
    it("8.9", "代替品数", ".tbl tbody tr:first-child td:nth-child(10)", "label", "view", "代替品設定で増減した数（＋／−）。本発注済みで増えた分は「追加発注」のバッジ。", vi="Số lượng hàng thay thế", detail_vi="Số tăng giảm (+ / −) do thiết lập hàng thay thế. Phần tăng thêm sau khi đã đặt hàng chính thức có huy hiệu \"追加発注\" (đặt hàng bổ sung)."),
    it("8.10", "仮発注", ".tbl tbody tr:first-child td:nth-child(11)", "label", "view", "仮発注の数の合計。", vi="Đặt hàng tạm", detail_vi="Tổng số lượng đặt hàng tạm."),
    it("8.11", "本発注", ".tbl tbody tr:first-child td:nth-child(12)", "label", "view", "本発注の数の合計。", vi="Đặt hàng chính thức", detail_vi="Tổng số lượng đặt hàng chính thức."),
    it("8.12", "倉庫（見込み）", ".tbl tbody tr:first-child td:nth-child(13)", "link", "click", "倉庫在庫の見込み。押すと倉庫在庫へ。出荷で足りなくなる見込みがあれば「不足見込み」のバッジ。", vi="Kho (dự kiến)", detail_vi="Tồn kho dự kiến của kho. Bấm để mở tồn kho kho. Nếu dự kiến thiếu hàng khi xuất thì có huy hiệu \"不足見込み\" (dự kiến thiếu)."),
    it("8.13", "発注ステータス", ".tbl tbody tr:first-child td:nth-child(14)", "label", "view", "未発注／一部仮発注／仮発注済／一部本発注／本発注済。エラーがあれば「エラー n」のバッジ。", pattern="P-STATUS-COLORS", vi="Trạng thái đặt hàng", detail_vi="Chưa đặt hàng / một phần đặt hàng tạm / đã đặt hàng tạm / một phần đặt hàng chính thức / đã đặt hàng chính thức. Nếu có lỗi thì có huy hiệu \"エラー n\" (lỗi n)."),
    it("8.14", "操作（発注詳細）", ".tbl tbody tr:first-child button.e", "button", "click", "発注詳細へ（商品名と同じ）。", vi="Thao tác (chi tiết đặt hàng)", detail_vi="Mở chi tiết đặt hàng (giống tên sản phẩm)."),
]
view("001", "AW_PURC_001", "初期表示（商品ごと・メニュー年月＝直近）", LIST1_HEAD + BANNER + LIST1_MID + LIST1_FILTER + LIST1_TABLE, "/ops/purchasing/orders", wait=2000,
     note="初期の並びは品番の昇順。上に仕入先からの通知・本発注の時期・仮発注の承認。", state_vi="Hiển thị ban đầu (theo sản phẩm・năm-tháng menu = gần nhất)", note_vi="Thứ tự ban đầu là mã sản phẩm tăng dần. Phía trên có thông báo từ nhà cung cấp・thời điểm đặt hàng chính thức・duyệt đặt hàng tạm.")
view("002", "AW_PURC_001", "仕入先からの通知あり", [], "/ops/purchasing/orders", wait=1500,
     note="通知があるときは No.2.1〜2.5 のうち該当するものが並ぶ。見本では受注不可（PO-202611-M006-U02）・入荷の差異・本発注の承認待ちが出る。便に間に合わない通知は B で作る。", state_vi="Có thông báo từ nhà cung cấp", note_vi="Khi có thông báo thì các mục phù hợp trong No.2.1〜2.5 sẽ xuất hiện. Thông báo không xuất hiện trong dữ liệu mẫu (không nhận đơn・không kịp chuyến giao) được tạo bằng B.")
view("003", "AW_PURC_001", "商品を選択（n件選択中）", [], "/ops/purchasing/orders",
     setup=H + "const c=document.querySelectorAll('.tbl tbody tr input[type=checkbox]');c[0]&&c[0].click();c[2]&&c[2].click();await sleep(400);", wait=1200,
     note="行のチェックで選ぶと案内文に「n件選択中：一括仮発注・本発注は選択した商品が対象です」と出る。", state_vi="Chọn sản phẩm (đang chọn n mục)", note_vi="Khi chọn bằng checkbox của dòng thì dòng hướng dẫn hiện \"n件選択中：一括仮発注・本発注は選択した商品が対象です\" (đang chọn n mục: đặt hàng tạm・chính thức hàng loạt áp dụng cho sản phẩm đã chọn).")
view("004", "AW_PURC_001", "0件（絞り込み）", [], "/ops/purchasing/orders", setup=H + "await search('該当なし該当なし');", wait=1200, note="条件に合う商品がないとき：I01。", state_vi="0 mục (lọc)", note_vi="Khi không có sản phẩm khớp điều kiện: I01.")

# 一括仮発注・本発注（モーダル）
BULK = [
    it("9", "一括仮発注／一括本発注（モーダル）", ".mbox", "modal", "show", "選んだ商品（なければ未発注／仮発注済の商品）を、納品希望ごとにまとめて仮発注・本発注する。通常商品だけが対象。確認画面（No.9.15）を経て作成する。", pattern="P-MODAL-SAVE", vi="Đặt hàng tạm hàng loạt / Đặt hàng chính thức hàng loạt (modal)", detail_vi="Đặt hàng tạm hoặc đặt hàng chính thức gộp theo từng ngày giao mong muốn cho các sản phẩm đã chọn (nếu chưa chọn thì các sản phẩm chưa đặt hàng / đã đặt hàng tạm). Chỉ áp dụng cho sản phẩm thường. Tạo đơn sau khi qua màn hình xác nhận (No.9.15)."),
    it("9.1", "メニュー年月", ".mbox input[disabled]", "text", "view", "一覧で選んだ月（直せない）。", req="－", len="年月", ex="2026-11", vi="Năm-tháng menu", detail_vi="Tháng đã chọn ở danh sách (không sửa được).", ex_vi="Năm-tháng của menu"),
    it("9.2", "納品先倉庫", "#pm-wh", "select", "select", "全倉庫（倉庫ごとに発注データを作る）または1つの倉庫。", req="○", len="選択", init="全倉庫", ex="関東倉庫", vi="Kho nhận hàng", detail_vi="Tất cả kho (tạo dữ liệu đặt hàng theo từng kho) hoặc một kho.", init_vi="Tất cả kho", ex_vi="Tên kho"),
    it("9.3", "納品希望のタブ（①②③・希望納期の追加）", ".mbox .tabs", "tab", "click", "納品希望を最大3つまで足せる（「希望納期の追加」）。本発注では、本発注の時期に入っている半分の納品希望だけを初めに出す。", req="－", len="最大3つ", len_vi="Tối đa 3", vi="Tab ngày giao mong muốn (①②③・thêm ngày giao mong muốn)", detail_vi="Có thể thêm tối đa 3 ngày giao mong muốn (\"希望納期の追加\"). Khi đặt hàng chính thức, ban đầu chỉ hiển thị ngày giao mong muốn của nửa kỳ đang đến thời điểm đặt hàng chính thức."),
    it("9.4", "希望納期", "#pm-wish", "date", "input", "仕入先に伝える希望の納期。", req="－", len="日付", ex="2026/11/07", vi="Ngày giao mong muốn", detail_vi="Ngày giao mong muốn báo cho nhà cung cấp.", ex_vi="Ngày"),
    it("9.5", "期間（前半・後半・その他）", ".mbox .radios", "radio", "click", "前半＝A・B（0〜13）／後半＝C・D（14〜27）／その他＝開始・終了を選ぶ。", req="○", init="前半", ex="後半", vi="Kỳ (nửa đầu・nửa sau・khác)", detail_vi="Nửa đầu = A・B (0〜13) / nửa sau = C・D (14〜27) / khác = chọn ngày bắt đầu・kết thúc.", init_vi="Nửa đầu", ex_vi="Nửa sau"),
    it("9.6", "お客様に納品予定の期間／サイクル（開始〜終了）", ".mbox select[aria-label=\"開始\"]", "select", "select", "「その他」のときだけ選べる（A1〜D7）。開始より前の終了は選べない。", cond="期間＝その他のとき", req="条件付き", len="選択（A1〜D7）", ex="A3", vi="Kỳ giao hàng dự kiến cho khách / chu kỳ (bắt đầu〜kết thúc)", detail_vi="Chỉ chọn được khi chọn \"その他\" (khác) (A1〜D7). Không chọn được ngày kết thúc trước ngày bắt đầu.", cond_vi="Khi kỳ = khác", ex_vi="Chu kỳ bắt đầu"),
    it("9.7", "対象期間（顧客納品日）", ".mbox input[disabled]", "text", "view", "選んだ期間の顧客納品日の範囲（直せない）。", req="－", len="日付〜日付", ex="2026/11/09 〜 2026/11/22", vi="Kỳ đối tượng (ngày giao cho khách)", detail_vi="Khoảng ngày giao cho khách của kỳ đã chọn (không sửa được).", ex_vi="Khoảng ngày"),
    it("9.8", "希望賞味期限", "#pm-bb", "date", "input", "仕入先に伝える希望の賞味期限。", req="－", len="日付", ex="2026/12/20", vi="Hạn sử dụng mong muốn", detail_vi="Hạn sử dụng (賞味期限) mong muốn báo cho nhà cung cấp.", ex_vi="Ngày"),
    it("9.9", "仮発注合計数／本発注合計数", ".mbox input[disabled]", "text", "view", "表の数量の合計（直せない）。", req="－", len="整数", ex="240", vi="Tổng số đặt hàng tạm / Tổng số đặt hàng chính thức", detail_vi="Tổng số lượng trong bảng (không sửa được).", ex_vi="Tổng số lượng"),
    it("9.10", "備考", "#pm-note", "text", "input", "仕入先に伝える内容（製造日・午前着など）。", req="－", len="文字列 60", ex="午前中着でお願いします", err=["E04"], vi="Ghi chú", detail_vi="Nội dung báo cho nhà cung cấp (ngày sản xuất, giao buổi sáng, v.v.).", ex_vi="Ghi chú cho nhà cung cấp: giao trước buổi trưa"),
    it("9.11", "商品と数量の表", ".mbox .tbl", "table", "view",
       "No・品番・商品名（押すと発注詳細）・カテゴリ・仕入先・過去発注（前月メニューの同じ期間・倉庫の本発注数）・基準値（対象期間・倉庫の必要数）・（本発注：オーダー・仮発注数）・発注数（入力）。本発注は仮発注されていない期間は入力できない。", vi="Bảng sản phẩm và số lượng", detail_vi="STT・mã sản phẩm・tên sản phẩm (bấm để mở chi tiết đặt hàng)・danh mục・nhà cung cấp・đặt hàng trước đây (số lượng đặt hàng chính thức của cùng kỳ・kho trong menu tháng trước)・giá trị chuẩn (số lượng cần của kỳ・kho đối tượng)・(đặt hàng chính thức: số đơn・số đặt hàng tạm)・số lượng đặt hàng (nhập). Đặt hàng chính thức không nhập được cho kỳ chưa đặt hàng tạm."),
    it("9.12", "仮発注数／本発注数", ".mbox .tbl tbody tr:first-child input[type=number]", "text", "input",
       "数量（0以上の整数・上限 999,999）。通常商品はロット（箱）単位で入れる（初期値は必要数をロット単位に切り上げた数）。本発注の初期値は仮発注数。本発注には「＋3」「＋5」「＋10」のボタンで足せる。", req="○", len="整数 0〜999,999", init="仮発注＝必要数のロット切り上げ／本発注＝仮発注数", ex="12", err=["E12"],
       demo_ok="コードは上限がない（H7）。", vi="Số lượng đặt hàng tạm / đặt hàng chính thức", detail_vi="Số lượng (số nguyên từ 0 trở lên, tối đa 999,999). Sản phẩm thường nhập theo đơn vị lô (thùng) (giá trị ban đầu là số lượng cần làm tròn lên theo lô). Giá trị ban đầu của đặt hàng chính thức là số đặt hàng tạm. Với đặt hàng chính thức có thể cộng thêm bằng nút \"+3\", \"+5\", \"+10\".", init_vi="Đặt hàng tạm = số lượng cần làm tròn lên theo lô / đặt hàng chính thức = số đặt hàng tạm", ex_vi="Số lượng (thùng)", demo_ok_vi="Code hiện không có giới hạn trên (H7)."),
    it("9.13", "オーダー締切の前の本発注の警告", ".mbox .notice.warn", "label", "show", "本発注のとき、メニューのオーダー締切の前なら「オーダー締切（日付）の前です。本発注数はオーダーが確定してから見直してください」。本発注の時期でないときも警告を出す。", cond="本発注で、締切の前または本発注の時期でないとき",
       demo_ok="コードは「（デモでは実行できます）」と添える。この文言は外す（hong 2026-10-07）。", vi="Cảnh báo đặt hàng chính thức trước hạn chốt đơn", detail_vi="Khi đặt hàng chính thức, nếu còn trước hạn chốt đơn của menu thì hiện \"Chưa đến hạn chốt đơn (ngày). Hãy xem lại số đặt hàng chính thức sau khi đơn được xác định\". Cũng cảnh báo khi chưa đến thời điểm đặt hàng chính thức.", cond_vi="Khi đặt hàng chính thức và còn trước hạn chốt hoặc chưa đến thời điểm đặt hàng chính thức", demo_ok_vi="Code hiện kèm \"(Có thể thực hiện trong bản demo)\". Sẽ bỏ câu này (hong 2026-10-07)."),
    it("9.14", "キャンセル", ".mbox button::キャンセル", "button", "click", "モーダルを閉じる。", vi="Hủy", detail_vi="Đóng modal."),
    it("9.15", "仮発注／本発注（確認画面へ）", ".mbox .mbox-f button.pri", "button", "click", "確認画面（No.9.16）へ進む。", err=["E280"], vi="Đặt hàng tạm / Đặt hàng chính thức (sang màn hình xác nhận)", detail_vi="Chuyển sang màn hình xác nhận (No.9.16)."),
]
BULK_CONFIRM = [
    it("9.16", "確認画面の表", ".mbox .tbl", "table", "view", "納品希望・品番・商品名（仕入時の名前）・仕入先・倉庫・数量・金額（税抜）。数量が入っていなければ「数量が入っていません」。合計（個・金額）を下に出す。仕入先にはメール（本文）で知らせ、仕入先サイトのホームにも出る。", vi="Bảng ở màn hình xác nhận", detail_vi="Ngày giao mong muốn・mã sản phẩm・tên sản phẩm (tên lúc nhập hàng)・nhà cung cấp・kho・số lượng・số tiền (chưa thuế). Nếu chưa nhập số lượng thì hiện \"số lượng chưa được nhập\". Hiển thị tổng (cái・số tiền) bên dưới. Thông báo cho nhà cung cấp bằng email (nội dung) và cũng hiển thị ở trang chủ site nhà cung cấp."),
    it("9.17", "戻って直す", ".mbox button::戻って直す", "button", "click", "入力の画面へ戻る。", vi="Quay lại sửa", detail_vi="Quay lại màn hình nhập."),
    it("9.18", "この内容で仮発注する／本発注する", ".mbox button.pri", "button", "click", "発注データを作成（仮発注）／確定（本発注）して、S193 のトースト。仕入先が未発行の商品は対象外。数量が0の行はスキップ。", err=["S193"], vi="Đặt hàng tạm / đặt hàng chính thức với nội dung này", detail_vi="Tạo dữ liệu đặt hàng (đặt hàng tạm) / xác nhận (đặt hàng chính thức), rồi hiện toast S193. Bỏ qua sản phẩm mà nhà cung cấp chưa được cấp tài khoản. Bỏ qua dòng có số lượng 0."),
]
view("005", "AW_PURC_001", "一括仮発注（入力）", BULK,
     "/ops/purchasing/orders", setup=H + "btn('仮発注',document.querySelector('.ph')).click();await sleep(800);", wait=1500,
     note="対象は通常商品だけ。数量の初期値は必要数をロット単位に切り上げた数。", state_vi="Đặt hàng tạm hàng loạt (nhập)", note_vi="Chỉ áp dụng sản phẩm thường. Giá trị ban đầu của số lượng là số lượng cần làm tròn lên theo lô.")
view("006", "AW_PURC_001", "一括仮発注（確認画面）", BULK_CONFIRM,
     "/ops/purchasing/orders", setup=H + "btn('仮発注',document.querySelector('.ph')).click();await sleep(800);btn('仮発注',document.querySelector('.mbox-f')).click();await sleep(600);", wait=1200, state_vi="Đặt hàng tạm hàng loạt (màn hình xác nhận)")
view("007", "AW_PURC_001", "一括本発注（入力・本発注の時期のお知らせ）", [],
     "/ops/purchasing/orders", setup=H + "btn('本発注',document.querySelector('.ph')).click();await sleep(800);", wait=1500,
     note="本発注の時期（前半＝B5〜C1・後半＝D5〜A1）に入っている半分の納品希望だけを初めに出す。時期でないときは警告。", state_vi="Đặt hàng chính thức hàng loạt (nhập・thông báo thời điểm đặt hàng chính thức)", note_vi="Ban đầu chỉ hiển thị ngày giao mong muốn của nửa kỳ đang đến thời điểm đặt hàng chính thức (nửa đầu = B5〜C1・nửa sau = D5〜A1). Khi chưa đến thời điểm thì có cảnh báo.")
view("008", "AW_PURC_001", "一括本発注（確認画面）", [],
     "/ops/purchasing/orders", setup=H + "btn('本発注',document.querySelector('.ph')).click();await sleep(800);btn('本発注',document.querySelector('.mbox-f')).click();await sleep(600);", wait=1200, state_vi="Đặt hàng chính thức hàng loạt (màn hình xác nhận)")
view("009", "AW_PURC_001", "仕入先未発行の商品を含む（対象外の警告）",
     [it("9.19", "仕入先未発行の商品の警告", ".mbox .notice.warn", "label", "show", "仕入先が未発行（仕入先Webのアカウントなし）の商品は一括の対象外。件数と商品名を出し、「発注詳細の『伝票発注』で発注してください」と案内する。", err=["E145"],
         cond="選んだ商品に仕入先未発行の商品を含むとき", vi="Cảnh báo sản phẩm nhà cung cấp chưa được cấp tài khoản", detail_vi="Sản phẩm mà nhà cung cấp chưa được cấp tài khoản (không có tài khoản Web nhà cung cấp) không thuộc đối tượng đặt hàng hàng loạt. Hiển thị số mục và tên sản phẩm, hướng dẫn \"hãy đặt hàng bằng 'đặt hàng bằng phiếu' ở chi tiết đặt hàng\".", cond_vi="Khi trong các sản phẩm đã chọn có sản phẩm nhà cung cấp chưa được cấp tài khoản")],
     "/ops/purchasing/orders", setup=H + "const r=row('M022');if(r)r.querySelector('input[type=checkbox]').click();await sleep(300);btn('仮発注',document.querySelector('.ph')).click();await sleep(800);", wait=1500, state_vi="Có sản phẩm nhà cung cấp chưa được cấp tài khoản (cảnh báo ngoài đối tượng)")
view("010", "AW_PURC_001", "オーダー締切の前の本発注（警告）", [],
     "/ops/purchasing/orders", setup=H + "btn('本発注',document.querySelector('.ph')).click();await sleep(800);", wait=1500, note="2026-11 のメニューはオーダー締切（2026/10/15）の前。", state_vi="Đặt hàng chính thức trước hạn chốt đơn (cảnh báo)", note_vi="Menu 2026-11 còn trước hạn chốt đơn (2026/10/15).")
SHOW_PO = [
    it("10", "発注済データ確認（モーダル）", ".mbox", "modal", "show", "選んだ月で作成済みの発注データ（仮発注・本発注）と金額。件数・合計数量・合計金額（税抜）・最終発注日の4つの集計と、一覧。", vi="Xác nhận dữ liệu đã đặt hàng (modal)", detail_vi="Dữ liệu đặt hàng (đặt hàng tạm・đặt hàng chính thức) đã tạo trong tháng đã chọn và số tiền. Gồm 4 số tổng hợp: số mục, tổng số lượng, tổng số tiền (chưa thuế), ngày đặt hàng cuối cùng, và danh sách."),
    it("10.1", "CSVダウンロード", ".mbox-h button::CSVダウンロード", "button", "click", "表示している発注データをCSVでダウンロード。", vi="Tải CSV", detail_vi="Tải về dữ liệu đặt hàng đang hiển thị dưới dạng CSV."),
    it("10.2", "一覧", ".mbox .tbl", "table", "view", "発注番号・商品名・タイプ・仕入先・倉庫・納品期間・数量・金額（税抜）・ステータス・仕入先回答。資材は含まない。", vi="Danh sách", detail_vi="Mã đơn đặt hàng・tên sản phẩm・loại・nhà cung cấp・kho・kỳ giao hàng・số lượng・số tiền (chưa thuế)・trạng thái・phản hồi của nhà cung cấp. Không bao gồm vật tư."),
]
view("011", "AW_PURC_001", "発注済データ確認（モーダル）", SHOW_PO,
     "/ops/purchasing/orders", setup=H + "btn('発注済データ確認',document.querySelector('.ph')).click();await sleep(800);", wait=1200, state_vi="Xác nhận dữ liệu đã đặt hàng (modal)")
view("012", "AW_PURC_001", "仮発注の承認（承認済／未承認）", [],
     "/ops/purchasing/orders", setup=H + "const b=btn('仮発注を承認');if(b){b.click();await sleep(800);}", wait=1500,
     note="未承認のとき「仮発注を承認」→ 押すと承認済（日時・承認者）になり「承認を取り消す」が出る。", state_vi="Duyệt đặt hàng tạm (đã duyệt / chưa duyệt)", note_vi="Khi chưa duyệt, bấm \"仮発注を承認\" thì chuyển sang đã duyệt (ngày giờ・người duyệt) và hiện \"承認を取り消す\".")
view("013", "AW_PURC_001", "商品追加（メニュー以外の商品を足す）", [
    it("11", "商品追加（モーダル）", "-", "modal", "show", "メニューにない商品を、選んだ月の発注に足す。商品（商品マスタの有効な商品でメニューにないもの）・納入倉庫・数量・入荷希望日・希望の期限・理由（代替品・営業サンプルの追加・その他）を入れて「追加」。足した商品は一覧に「メニュー外」の印つきの行で出る。資材は選べない（資材発注）。", demo_ok="コードにない（H16）。", vi="Thêm sản phẩm (modal)", detail_vi="Thêm vào đặt hàng của tháng đã chọn những sản phẩm không có trong menu. Nhập sản phẩm (sản phẩm đang dùng trong danh mục sản phẩm nhưng không có trong menu), kho nhận hàng, số lượng, ngày nhập kho mong muốn, hạn mong muốn, lý do (hàng thay thế・thêm hàng mẫu kinh doanh・khác) rồi bấm \"追加\". Sản phẩm đã thêm hiển thị trong danh sách ở dòng có dấu \"メニュー外\". Không chọn được vật tư (đặt hàng vật tư).", demo_ok_vi="Chưa có trong code (H16)."),
    it("11.1", "商品", "-", "select", "select", "商品マスタの有効な商品のうち、選んだ月のメニューにない商品（資材を除く）。", req="○", len="選択（品番・商品名）", len_vi="Chọn (mã sản phẩm, tên sản phẩm)", ex="お菓子（M901）", err=["E02"], vi="Sản phẩm", detail_vi="Trong các sản phẩm đang dùng của danh mục sản phẩm, những sản phẩm không có trong menu của tháng đã chọn (trừ vật tư).", ex_vi="Bánh kẹo (M901)"),
    it("11.2", "納入倉庫", "-", "select", "select", "商品を扱うピッキング倉庫。", req="○", len="選択", ex="関東倉庫", err=["E02"], vi="Kho nhận hàng", detail_vi="Kho lấy hàng có xử lý sản phẩm.", ex_vi="Tên kho"),
    it("11.3", "数量", "-", "text", "input", "1以上の整数（上限 999,999）。通常商品はロット（箱）単位。", req="○", len="整数 1〜999,999", ex="24", err=["E01", "E12"], vi="Số lượng", detail_vi="Số nguyên từ 1 trở lên (tối đa 999,999). Sản phẩm thường tính theo lô (thùng).", ex_vi="Số lượng"),
    it("11.4", "入荷希望日", "-", "date", "input", "仕入先に伝える入荷の希望日。", req="○", len="日付", ex="2026/11/07", err=["E01"], vi="Ngày nhập kho mong muốn", detail_vi="Ngày nhập kho mong muốn báo cho nhà cung cấp.", ex_vi="Ngày"),
    it("11.5", "希望の期限", "-", "date", "input", "希望賞味期限（短消費期限の商品は希望消費期限）。", req="○", len="日付", ex="2026/12/20", err=["E01"], vi="Hạn mong muốn", detail_vi="Hạn sử dụng mong muốn (với sản phẩm hạn tiêu thụ ngắn là hạn tiêu thụ mong muốn).", ex_vi="Ngày"),
    it("11.6", "理由", "-", "select", "select", "代替品／営業サンプルの追加／その他。", req="○", len="選択", init="その他", ex="その他", vi="Lý do", detail_vi="Hàng thay thế / thêm hàng mẫu kinh doanh / khác.", init_vi="Khác", ex_vi="Khác"),
    it("11.7", "追加", "-", "button", "click", "発注データ（仮発注）を作り、仕入先に納期回答を依頼する。", err=["S127"], vi="Thêm", detail_vi="Tạo dữ liệu đặt hàng (đặt hàng tạm) và yêu cầu nhà cung cấp trả lời ngày giao."),
], "/ops/purchasing/orders", wait=1200,
     note="コードに画面がないので、現状の一覧を撮る（番号は付けない）。決定は台帳 I（hong 2026-10-07）。", state_vi="Thêm sản phẩm (thêm sản phẩm ngoài menu)", note_vi="Code chưa có màn hình nên chụp danh sách hiện tại (không đánh số). Quyết định theo sổ cái I (hong 2026-10-07).")

# ================================================================ AW_PURC_002 発注一覧（発注データごと）
LIST2_HEAD = [
    it("1", "ヘッダーのボタン", ".ph .btns", "area", "view", "権限がないボタンは出さない（発注管理の権限）。", vi="Các nút ở phần đầu trang", detail_vi="Không hiển thị nút mà người dùng không có quyền (quyền quản lý đặt hàng)."),
    it("1.1", "CSV出力", ".ph .btns button::CSV出力", "button", "click", "表示中の一覧（条件を反映）を出力。列：発注番号・対象年月・商品名・種類・仕入先・納入倉庫・数量・入荷箱数・発注金額（税抜）・発注ステータス・本発注の承認・仕入先回答・入荷状況・請求照合。", pattern="P-CSV-OUT", cond="発注管理の CSV出力 の権限", vi="Xuất CSV", detail_vi="Xuất danh sách đang hiển thị (đã áp dụng điều kiện lọc). Các cột: mã đơn đặt hàng, năm-tháng đối tượng, tên sản phẩm, loại, nhà cung cấp, kho nhận hàng, số lượng, số thùng nhập kho, số tiền đặt hàng (chưa thuế), trạng thái đặt hàng, duyệt đặt hàng chính thức, phản hồi nhà cung cấp, tình trạng nhập kho, đối chiếu hóa đơn.", cond_vi="Quyền xuất CSV của quản lý đặt hàng"),
    it("1.2", "仕入先への支払の集計", ".ph .btns button::仕入先への支払の集計", "button", "click", "月 × 仕入先の集計（発注金額・不良控除・支払額・請求照合）のモーダル（No.7）を開く。", vi="Tổng hợp thanh toán cho nhà cung cấp", detail_vi="Mở modal (No.7) tổng hợp theo tháng × nhà cung cấp (số tiền đặt hàng・khấu trừ hàng lỗi・số tiền thanh toán・đối chiếu hóa đơn)."),
]
LIST2_FILTER = [
    it("4", "検索条件", ".filter", "area", "view", "条件は「検索」か Enter で反映する。「未適用」の印は出さない。", pattern="P-LIST", demo_ok="コードは「未適用」の印を出す（H4）。外す。", vi="Điều kiện tìm kiếm", detail_vi="Điều kiện được áp dụng khi bấm \"検索\" hoặc Enter. Không hiển thị dấu \"未適用\" (chưa áp dụng).", demo_ok_vi="Code hiển thị dấu \"未適用\" (H4). Sẽ bỏ."),
    it("4.1", "対象年月", ".filter select[aria-label=\"対象年月（すべて）\"]", "select", "select", "メニュー年月で絞る。", req="－", len="選択", init="対象年月（すべて）", ex="2026-11", vi="Năm-tháng đối tượng", detail_vi="Lọc theo năm-tháng menu.", init_vi="Năm-tháng đối tượng (tất cả)", ex_vi="Năm-tháng của menu"),
    it("4.2", "キーワード", ".filter .search input", "text", "input", "発注番号・商品名・仕入時の名前・仕入先名の部分一致。", req="－", len="文字列 60", ex="PO-202611-M008", err=["E04"], vi="Từ khóa", detail_vi="Khớp một phần với mã đơn đặt hàng, tên sản phẩm, tên lúc nhập hàng, tên nhà cung cấp.", ex_vi="Mã đơn đặt hàng"),
    it("4.3", "発注ステータス", ".filter select[aria-label=\"発注ステータス\"]", "select", "select", "仮発注済／本発注済／受注不可／キャンセル で絞る。", req="－", len="選択", init="発注ステータス", ex="本発注済",
       demo_ok="コードの選択肢は「取消済」。「キャンセル」にそろえる（H10）。", vi="Trạng thái đặt hàng", detail_vi="Lọc theo: đã đặt hàng tạm / đã đặt hàng chính thức / không nhận đơn / hủy.", init_vi="Trạng thái đặt hàng (nhãn mặc định)", ex_vi="Đã đặt hàng chính thức", demo_ok_vi="Lựa chọn trong code là \"取消済\". Thống nhất thành \"キャンセル\" (hủy) (H10)."),
    it("4.4", "本発注の承認", ".filter select[aria-label=\"本発注の承認\"]", "select", "select", "承認待ち／承認済 で絞る。", req="－", len="選択", init="本発注の承認", ex="承認待ち", vi="Duyệt đặt hàng chính thức", detail_vi="Lọc theo: chờ duyệt / đã duyệt.", init_vi="Duyệt đặt hàng chính thức (nhãn mặc định)", ex_vi="Chờ duyệt"),
    it("4.5", "仕入先回答", ".filter select[aria-label=\"仕入先回答\"]", "select", "select", "納期回答待ち／納期回答済／出荷済／受注不可 で絞る。", req="－", len="選択", init="仕入先回答", ex="納期回答待ち",
       demo_ok="コードの選択肢は「納期回答済」。「納期回答済」にそろえる（H10）。", vi="Phản hồi nhà cung cấp", detail_vi="Lọc theo: chờ trả lời ngày giao / đã trả lời ngày giao / đã xuất hàng / không nhận đơn.", init_vi="Phản hồi nhà cung cấp (nhãn mặc định)", ex_vi="Chờ trả lời ngày giao", demo_ok_vi="Lựa chọn trong code là \"納期回答済\". Thống nhất thành \"納期回答済み\" (H10)."),
    it("4.6", "入荷状況", ".filter select[aria-label=\"入荷状況\"]", "select", "select", "未入荷／差異あり・対応待ち／入荷済み で絞る。", req="－", len="選択", init="入荷状況", ex="差異あり・対応待ち",
       demo_ok="コードの選択肢は「入荷済」。「入荷済」にそろえる（H10）。", vi="Tình trạng nhập kho", detail_vi="Lọc theo: chưa nhập kho / có chênh lệch・chờ xử lý / đã nhập kho.", init_vi="Tình trạng nhập kho (nhãn mặc định)", ex_vi="Có chênh lệch・chờ xử lý", demo_ok_vi="Lựa chọn trong code là \"入荷済\". Thống nhất thành \"入荷済み\" (H10)."),
    it("4.7", "請求照合", ".filter select[aria-label=\"請求照合\"]", "select", "select", "未照合／照合済／差異あり で絞る。", req="－", len="選択", init="請求照合", ex="未照合", vi="Đối chiếu hóa đơn", detail_vi="Lọc theo: chưa đối chiếu / đã đối chiếu / có chênh lệch.", init_vi="Đối chiếu hóa đơn (nhãn mặc định)", ex_vi="Chưa đối chiếu"),
    it("4.8", "納入倉庫", ".filter select[aria-label=\"納入倉庫\"]", "select", "select", "納入倉庫（資材は ES事務所）で絞る。", req="－", len="選択", init="納入倉庫", ex="関東倉庫", vi="Kho nhận hàng", detail_vi="Lọc theo kho nhận hàng (vật tư là văn phòng ES).", init_vi="Kho nhận hàng (nhãn mặc định)", ex_vi="Tên kho"),
    it("4.9", "仕入先", ".filter select[aria-label=\"仕入先\"]", "select", "select", "仕入先名で絞る。", req="－", len="選択", init="仕入先", ex="株式会社まるすぎ", vi="Nhà cung cấp", detail_vi="Lọc theo tên nhà cung cấp.", init_vi="Nhà cung cấp (nhãn mặc định)", ex_vi="Tên nhà cung cấp"),
    it("4.10", "発注日（から／まで）", ".filter [aria-label=\"発注日（から）\"]", "date", "input", "最終発注日時の日付で絞る。", req="－", len="日付", ex="2026/10/01", vi="Ngày đặt hàng (từ / đến)", detail_vi="Lọc theo ngày của ngày giờ đặt hàng cuối cùng.", ex_vi="Ngày"),
    it("4.11", "納品予定（入荷予定日）（から／まで）", ".filter [aria-label=\"納品予定（入荷予定日）（から）\"]", "date", "input", "仕入先が答えた入荷予定日で絞る。", req="－", len="日付", ex="2026/11/05", vi="Ngày giao dự kiến (ngày nhập kho dự kiến) (từ / đến)", detail_vi="Lọc theo ngày nhập kho dự kiến mà nhà cung cấp đã trả lời.", ex_vi="Ngày"),
    it("4.12", "クリア", ".filter .f-act button::クリア", "button", "click", "条件を初期値に戻す。", vi="Xóa điều kiện", detail_vi="Đưa điều kiện về giá trị ban đầu."),
    it("4.13", "検索", ".filter .f-act button.pri", "button", "click", "条件を一覧に反映して1ページ目へ。", vi="Tìm kiếm", detail_vi="Áp dụng điều kiện vào danh sách và quay về trang 1."),
    it("4.14", "並べ替え", ".filter .sortbox", "select", "select", "列を選び、ボタンで昇順／降順。初期の並びは最終発注日時の降順（hong 2026-10-07）。", req="－", pattern="P-LIST",
       demo_ok="コードの初期の並びは取り込み順（H9）。", vi="Sắp xếp", detail_vi="Chọn cột và đổi tăng dần / giảm dần bằng nút. Thứ tự ban đầu là ngày giờ đặt hàng cuối cùng giảm dần (hong 2026-10-07).", demo_ok_vi="Thứ tự ban đầu trong code là thứ tự nhập dữ liệu (H9).", ex=["最終発注日時（降順）", "Cột sắp xếp và chiều tăng/giảm. Mặc định là ngày giờ đặt hàng cuối cùng, giảm dần"]),
]
LIST2_TABLE = [
    it("5", "発注データの一覧", ".tbl-wrap", "table", "view", "発注データ1件ごと（発注・入荷の履歴・REQ-PO-114）。不良控除（返品）はマイナスの行で出る（代替品設定の仕入先への請求・その月の支払額から引く）。ページ送り。", pattern="P-PAGESIZE", vi="Danh sách dữ liệu đặt hàng", detail_vi="Mỗi dòng là một dữ liệu đặt hàng (lịch sử đặt hàng・nhập kho, REQ-PO-114). Khấu trừ hàng lỗi (trả hàng) hiển thị là dòng số âm (yêu cầu thanh toán cho nhà cung cấp theo thiết lập hàng thay thế, trừ vào số tiền thanh toán của tháng đó). Có phân trang."),
    it("5.1", "発注番号", ".tbl tbody tr:first-child td:nth-child(2) button", "link", "click", "押すと発注データ詳細（モーダル No.8）。不良控除の行は番号のみ（押せない）。通常＝PO-YYYYMM-品番-U01、短消費期限＝PO-YYYYMM-品番-倉庫記号＋Slot。", vi="Mã đơn đặt hàng", detail_vi="Bấm để mở chi tiết dữ liệu đặt hàng (modal No.8). Dòng khấu trừ hàng lỗi chỉ có số (không bấm được). Thường = PO-YYYYMM-品番-U01, hạn tiêu thụ ngắn = PO-YYYYMM-品番-ký hiệu kho + Slot."),
    it("5.2", "対象年月", ".tbl tbody tr:first-child td:nth-child(3)", "label", "view", "発注のメニュー年月。", vi="Năm-tháng đối tượng", detail_vi="Năm-tháng menu của đơn đặt hàng."),
    it("5.3", "商品名（仕入時の名前）", ".tbl tbody tr:first-child td:nth-child(4)", "label", "view", "商品名。仕入時の名前が違うときは下に小さく添える。", vi="Tên sản phẩm (tên lúc nhập hàng)", detail_vi="Tên sản phẩm. Nếu tên lúc nhập hàng khác thì ghi nhỏ bên dưới."),
    it("5.4", "種類", ".tbl tbody tr:first-child td:nth-child(5)", "label", "view", "通常／短消費期限／資材／追加発注／不良控除 のバッジ。", vi="Loại", detail_vi="Huy hiệu: thường / hạn tiêu thụ ngắn / vật tư / đặt hàng bổ sung / khấu trừ hàng lỗi."),
    it("5.5", "仕入先", ".tbl tbody tr:first-child td:nth-child(6)", "label", "view", "仕入先名。", vi="Nhà cung cấp", detail_vi="Tên nhà cung cấp."),
    it("5.6", "納入倉庫", ".tbl tbody tr:first-child td:nth-child(7)", "label", "view", "納入倉庫（資材は ES事務所）。", vi="Kho nhận hàng", detail_vi="Kho nhận hàng (vật tư là văn phòng ES)."),
    it("5.7", "数量", ".tbl tbody tr:first-child td:nth-child(8)", "label", "view", "仮発注数または本発注数。不良控除はマイナス。", vi="Số lượng", detail_vi="Số đặt hàng tạm hoặc số đặt hàng chính thức. Khấu trừ hàng lỗi là số âm."),
    it("5.8", "入荷箱数", ".tbl tbody tr:first-child td:nth-child(9)", "label", "view", "仕入先が本発注の承認で入れた入荷箱数（箱）。ないときは「—」。", vi="Số thùng nhập kho", detail_vi="Số thùng nhập kho (thùng) mà nhà cung cấp nhập khi duyệt đặt hàng chính thức. Nếu chưa có thì hiện \"—\"."),
    it("5.9", "発注金額（税抜）", ".tbl tbody tr:first-child td:nth-child(10)", "label", "view", "本発注したときの仕入単価の写し × 数量。不良控除はマイナス（赤字）。", vi="Số tiền đặt hàng (chưa thuế)", detail_vi="Bản sao đơn giá nhập tại thời điểm đặt hàng chính thức × số lượng. Khấu trừ hàng lỗi là số âm (chữ đỏ)."),
    it("5.10", "発注ステータス", ".tbl tbody tr:first-child td:nth-child(11)", "label", "view", "仮発注済／本発注済／受注不可／キャンセル（不良控除の行は「不良控除」）。", pattern="P-STATUS-COLORS",
       demo_ok="コードは「取消済」（H10）。", vi="Trạng thái đặt hàng", detail_vi="Đã đặt hàng tạm / đã đặt hàng chính thức / không nhận đơn / hủy (dòng khấu trừ hàng lỗi là \"不良控除\").", demo_ok_vi="Code hiện hiển thị \"取消済\" (H10)."),
    it("5.11", "本発注の承認", ".tbl tbody tr:first-child td:nth-child(12)", "label", "view", "承認待ち／承認済。承認待ちのアラートが出ているときは「アラート n回」、分納があれば「分納」のバッジ。", vi="Duyệt đặt hàng chính thức", detail_vi="Chờ duyệt / đã duyệt. Khi đang có cảnh báo chờ duyệt thì có huy hiệu \"アラート n回\" (cảnh báo n lần), nếu có giao từng phần thì có huy hiệu \"分納\"."),
    it("5.12", "仕入先回答", ".tbl tbody tr:first-child td:nth-child(13)", "label", "view", "納期回答待ち／納期回答済／出荷済／受注不可。入荷予定日が回した便に間に合わない追加発注には「便に間に合わない」のバッジ。", vi="Phản hồi nhà cung cấp", detail_vi="Chờ trả lời ngày giao / đã trả lời ngày giao / đã xuất hàng / không nhận đơn. Với đặt hàng bổ sung có ngày nhập kho dự kiến không kịp chuyến giao đã dời lại thì có huy hiệu \"便に間に合わない\" (không kịp chuyến giao)."),
    it("5.13", "入荷状況", ".tbl tbody tr:first-child td:nth-child(14)", "label", "view", "未入荷／差異あり・対応待ち／入荷済み。", vi="Tình trạng nhập kho", detail_vi="Chưa nhập kho / có chênh lệch・chờ xử lý / đã nhập kho."),
    it("5.14", "請求照合", ".tbl tbody tr:first-child select[aria-label=\"請求照合\"]", "select", "select", "仕入先の請求書と発注金額を突き合わせた結果（未照合／照合済／差異あり）。変えたらトースト「請求照合を『○○』にしました」（S128）。", req="－", len="選択（未照合／照合済／差異あり）", len_vi="Chọn (chưa đối chiếu / đã đối chiếu / có chênh lệch)", init="未照合（入荷済みは照合済）", ex="照合済", err=["S128"],
       cond="変えられるのは、発注管理の編集ができる役割と経理（請求照合だけ）。不良控除の行は「—」", vi="Đối chiếu hóa đơn", detail_vi="Kết quả đối chiếu hóa đơn của nhà cung cấp với số tiền đặt hàng (chưa đối chiếu / đã đối chiếu / có chênh lệch). Khi đổi thì hiện toast \"請求照合を『○○』にしました\" (S128).", init_vi="Chưa đối chiếu (đã nhập kho thì là đã đối chiếu)", ex_vi="Đã đối chiếu", cond_vi="Người đổi được là vai trò có quyền chỉnh sửa quản lý đặt hàng và kế toán (chỉ đối chiếu hóa đơn). Dòng khấu trừ hàng lỗi hiện \"—\""),
    it("5.15", "操作（詳細）", ".tbl tbody tr:first-child button.e", "button", "click", "発注データ詳細（モーダル）を開く。", vi="Thao tác (chi tiết)", detail_vi="Mở chi tiết dữ liệu đặt hàng (modal)."),
    it("5.16", "表示中の金額の合計", ".card .notice", "label", "view", "案内文に、表示中の行の金額の合計（税抜・不良控除を含む）を出す。", vi="Tổng số tiền đang hiển thị", detail_vi="Dòng hướng dẫn hiển thị tổng số tiền của các dòng đang hiển thị (chưa thuế, đã gồm khấu trừ hàng lỗi)."),
]
view("014", "AW_PURC_002", "初期表示（発注データごと）", LIST2_HEAD + BANNER + [
    it("3", "表示の切り替え（タブ）", ".seg2", "tab", "click", "「商品ごと」と「発注データごと」を切り替える（AW_PURC_001 No.5）。", pattern="P-TAB", vi="Chuyển chế độ hiển thị (tab)", detail_vi="Chuyển giữa \"商品ごと\" (theo sản phẩm) và \"発注データごと\" (theo dữ liệu đặt hàng) (AW_PURC_001 No.5).")] + LIST2_FILTER + LIST2_TABLE,
     "/ops/purchasing/history", wait=2000, note="初期の並びは最終発注日時の降順。上に仕入先からの通知（AW_PURC_001 と同じ）。", state_vi="Hiển thị ban đầu (theo dữ liệu đặt hàng)", note_vi="Thứ tự ban đầu là ngày giờ đặt hàng cuối cùng giảm dần. Phía trên có thông báo từ nhà cung cấp (giống AW_PURC_001).")
view("015", "AW_PURC_002", "不良控除（返品）のマイナスの行あり", [], "/ops/purchasing/history", setup=H + "await search('SC-ALT-2610-0001');const b=document.querySelector('.tbl tbody td button.lnk');if(b){b.click();await sleep(800);}", wait=1500,
     note="代替品設定の不良の数 × 仕入単価がマイナスの行で出る。見本の SC-ALT-2610-0001（−15,060円）。", state_vi="Có dòng số âm của khấu trừ hàng lỗi (trả hàng)", note_vi="Số hàng lỗi trong thiết lập hàng thay thế × đơn giá nhập hiển thị là dòng số âm. Nếu dữ liệu mẫu không có thì tạo bằng B.")
view("016", "AW_PURC_002", "0件（絞り込み）", [], "/ops/purchasing/history", setup=H + "await search('該当なし該当なし');", wait=1200, note="I01。", state_vi="0 mục (lọc)", note_vi="I01.")
view("017", "AW_PURC_002", "請求照合の変更", [], "/ops/purchasing/history",
     setup=H + "const s=document.querySelector('.tbl tbody select[aria-label=\"請求照合\"]');if(s){setsel(s,'照合済');await sleep(600);}", wait=1200, note="セレクトを変えるとすぐ保存してトースト（S128）。", state_vi="Đổi đối chiếu hóa đơn", note_vi="Khi đổi ô chọn thì lưu ngay và hiện toast (S128).")
PAY = [
    it("7", "仕入先への支払の集計（モーダル）", ".mbox", "modal", "show", "月 × 仕入先の集計。発注金額＝本発注の数 × 仕入単価（本発注したときの写し・キャンセル／受注不可を除く）。不良控除＝代替品設定の不良の数 × 仕入単価（マイナス）。支払額＝発注金額＋不良控除。", vi="Tổng hợp thanh toán cho nhà cung cấp (modal)", detail_vi="Tổng hợp theo tháng × nhà cung cấp. Số tiền đặt hàng = số đặt hàng chính thức × đơn giá nhập (bản sao tại thời điểm đặt hàng chính thức, trừ hủy / không nhận đơn). Khấu trừ hàng lỗi = số hàng lỗi trong thiết lập hàng thay thế × đơn giá nhập (số âm). Số tiền thanh toán = số tiền đặt hàng + khấu trừ hàng lỗi."),
    it("7.1", "対象年月", "#pay-ym", "select", "select", "集計する月。", req="○", len="選択（年月）", init="一覧で選んでいた月", ex="2026-10", vi="Năm-tháng đối tượng", detail_vi="Tháng cần tổng hợp.", init_vi="Tháng đã chọn ở danh sách", ex_vi="Năm-tháng cần tổng hợp"),
    it("7.2", "集計表", ".mbox .tbl", "table", "view", "仕入先・発注（件）・発注金額（税抜）・不良控除（返品）・支払額（税抜）・請求照合。合計の行つき。1件でも差異ありなら差異あり、すべて照合済なら照合済。", vi="Bảng tổng hợp", detail_vi="Nhà cung cấp・đơn đặt hàng (số)・số tiền đặt hàng (chưa thuế)・khấu trừ hàng lỗi (trả hàng)・số tiền thanh toán (chưa thuế)・đối chiếu hóa đơn. Có dòng tổng. Nếu có dù chỉ 1 mục có chênh lệch thì là có chênh lệch, nếu tất cả đã đối chiếu thì là đã đối chiếu."),
    it("7.3", "閉じる", ".mbox button::閉じる", "button", "click", "モーダルを閉じる。", vi="Đóng", detail_vi="Đóng modal."),
]
view("018", "AW_PURC_002", "仕入先への支払の集計（モーダル）", PAY, "/ops/purchasing/history",
     setup=H + "btn('仕入先への支払の集計',document.querySelector('.ph')).click();await sleep(800);", wait=1200, state_vi="Tổng hợp thanh toán cho nhà cung cấp (modal)")

# 発注データ詳細（モーダル）
DETAIL = [
    it("8", "発注データ詳細（モーダル）", ".mbox", "modal", "show", "発注データ1件の状態と、仕入先の回答・本発注の承認・入荷状況。下のボタンは状態と権限によって変わる。", vi="Chi tiết dữ liệu đặt hàng (modal)", detail_vi="Trạng thái của một dữ liệu đặt hàng, phản hồi của nhà cung cấp, duyệt đặt hàng chính thức, tình trạng nhập kho. Các nút bên dưới thay đổi theo trạng thái và quyền."),
    it("8.1", "案内（追加発注・受注不可・キャンセル・代理入力）", ".mbox .notice", "label", "show", "追加発注：理由。受注不可：理由とコメント（別の仕入先へ手配かキャンセル）。キャンセル：日時・者・理由（仕入先サイトの「キャンセル」とメールで知らせた）。代理入力：代理入力した内容。", cond="該当する状態のとき", vi="Hướng dẫn (đặt hàng bổ sung・không nhận đơn・hủy・nhập hộ)", detail_vi="Đặt hàng bổ sung: lý do. Không nhận đơn: lý do và bình luận (chuyển sang nhà cung cấp khác hoặc hủy). Hủy: ngày giờ・người hủy・lý do (đã thông báo bằng tab \"キャンセル\" của site nhà cung cấp và email). Nhập hộ: nội dung đã nhập hộ.", cond_vi="Khi ở trạng thái tương ứng"),
    it("8.2", "進み具合", ".mbox ol.steps", "label", "view", "仮発注済→納期回答済→本発注済→本発注承認済→出荷済→入荷済み。いまの段を強調する。", vi="Tiến độ", detail_vi="Đã đặt hàng tạm → đã trả lời ngày giao → đã đặt hàng chính thức → đã duyệt đặt hàng chính thức → đã xuất hàng → đã nhập kho. Làm nổi bật bước hiện tại."),
    it("8.3", "発注情報", ".mbox .sec:nth-of-type(1)", "area", "view", "商品名・品番・メニュー年月・仕入先・納入倉庫・納品期間・仮発注数・本発注数・発注金額（税抜）・発注ステータス・希望消費期限・最終発注日時。", vi="Thông tin đặt hàng", detail_vi="Tên sản phẩm・mã sản phẩm・năm-tháng menu・nhà cung cấp・kho nhận hàng・kỳ giao hàng・số đặt hàng tạm・số đặt hàng chính thức・số tiền đặt hàng (chưa thuế)・trạng thái đặt hàng・hạn tiêu thụ mong muốn・ngày giờ đặt hàng cuối cùng."),
    it("8.4", "本発注の承認（仕入先）", ".mbox .sec:nth-of-type(2)", "area", "view", "本発注日時・承認日時・納品日・入荷箱数（合計）。分納があれば回ごとの出荷予定日・納品日・数量・入荷箱数。", cond="本発注済のとき",
       demo_ok="コードは回ごとの「入荷した実数・差異・対応」を出さない（H5・H11）。回ごとの予定と実数、差異の状態・対応を追加する。", vi="Duyệt đặt hàng chính thức (nhà cung cấp)", detail_vi="Ngày giờ đặt hàng chính thức・ngày giờ duyệt・ngày giao・số thùng nhập kho (tổng). Nếu có giao từng phần thì hiển thị theo từng lần: ngày xuất dự kiến・ngày giao・số lượng・số thùng nhập kho.", cond_vi="Khi đã đặt hàng chính thức", demo_ok_vi="Code hiện không hiển thị \"số lượng thực tế đã nhập・chênh lệch・xử lý\" theo từng lần (H5・H11). Sẽ bổ sung số dự kiến và số thực tế theo từng lần, trạng thái chênh lệch và cách xử lý."),
    it("8.5", "仕入先回答", ".mbox .sec:nth-of-type(3)", "area", "view", "出荷予定日（納期回答）・出荷日・配送方法・運送会社・送り状番号・賞味期限。", vi="Phản hồi nhà cung cấp", detail_vi="Ngày xuất dự kiến (trả lời ngày giao)・ngày xuất・cách giao hàng・công ty vận chuyển・số vận đơn・hạn sử dụng (賞味期限)."),
    it("8.6", "入荷状況", ".mbox .sec:nth-of-type(4)", "area", "view", "入荷日・入荷数・入荷倉庫。差異ありのときは対応も出す（H5・H11）。", demo_ok="コードは差異・対応を出さない（H11）。", vi="Tình trạng nhập kho", detail_vi="Ngày nhập kho・số lượng nhập kho・kho nhập. Khi có chênh lệch thì cũng hiển thị cách xử lý (H5・H11).", demo_ok_vi="Code hiện không hiển thị chênh lệch・xử lý (H11)."),
    it("8.7", "変更履歴（タブ）", "-", "tab", "click", "数量を直した・キャンセルした・追加したことを、数量つきで残す（REQ-PO-304）。新しいものが上。直せない・消せない。", pattern="P-HIST", demo_ok="コードに変更履歴がない（H5）。", vi="Lịch sử thay đổi (tab)", detail_vi="Ghi lại việc sửa số lượng, hủy, thêm kèm số lượng (REQ-PO-304). Mới nhất ở trên. Không sửa, không xóa được.", demo_ok_vi="Code chưa có lịch sử thay đổi (H5)."),
    it("8.8", "発注を取り消す", ".mbox button::発注を取り消す", "button", "click", "理由を入れる小さなモーダル（No.9.5）へ。入荷済・出荷済は取り消せない。", cond="発注管理の「キャンセル」の権限。受注不可のときも出る", vi="Hủy đơn đặt hàng", detail_vi="Chuyển sang modal nhỏ (No.9.5) để nhập lý do. Không hủy được đơn đã nhập kho・đã xuất hàng.", cond_vi="Quyền \"hủy\" của quản lý đặt hàng. Cũng hiển thị khi không nhận đơn"),
    it("8.9", "追加発注（通常商品）", ".mbox button::追加発注", "button", "click", "新しい発注データ（本発注）を作る小さなモーダル（No.9.6）へ。通常商品だけ。短消費期限商品は AW_PURC_004 で行を足す。", cond="本発注済の通常商品", vi="Đặt hàng bổ sung (sản phẩm thường)", detail_vi="Chuyển sang modal nhỏ (No.9.6) để tạo dữ liệu đặt hàng mới (đặt hàng chính thức). Chỉ cho sản phẩm thường. Sản phẩm hạn tiêu thụ ngắn thì thêm dòng ở AW_PURC_004.", cond_vi="Sản phẩm thường đã đặt hàng chính thức"),
    it("8.10", "代理入力：納期回答", ".mbox button::代理入力：納期回答", "button", "click", "小さなモーダル（No.9.1）へ。ログインしない仕入先（発注方法＝メール・外部）の回答を運営が代わりに入れる。", cond="納期回答待ちのとき", vi="Nhập hộ: trả lời ngày giao", detail_vi="Chuyển sang modal nhỏ (No.9.1). Bộ phận vận hành nhập thay phản hồi của nhà cung cấp không đăng nhập (phương thức đặt hàng = email・bên ngoài).", cond_vi="Khi đang chờ trả lời ngày giao"),
    it("8.11", "本発注数を直す（承認前だけ）", ".mbox button::本発注数を直す", "button", "click", "小さなモーダル（No.9.4）へ。仕入先が本発注を承認するまで。承認後は直せない（増やす＝追加発注・減らす＝キャンセルして出し直し）。", cond="本発注済で承認待ちのとき", vi="Sửa số đặt hàng chính thức (chỉ trước khi duyệt)", detail_vi="Chuyển sang modal nhỏ (No.9.4). Chỉ sửa được đến khi nhà cung cấp duyệt đặt hàng chính thức. Sau khi duyệt không sửa được (tăng = đặt hàng bổ sung・giảm = hủy rồi đặt lại).", cond_vi="Khi đã đặt hàng chính thức và đang chờ duyệt"),
    it("8.12", "代理入力：本発注の承認", ".mbox button::代理入力：本発注の承認", "button", "click", "小さなモーダル（No.9.2）へ。", cond="本発注済で承認待ちのとき", vi="Nhập hộ: duyệt đặt hàng chính thức", detail_vi="Chuyển sang modal nhỏ (No.9.2).", cond_vi="Khi đã đặt hàng chính thức và đang chờ duyệt"),
    it("8.13", "代理入力：出荷報告", ".mbox button::代理入力：出荷報告", "button", "click", "小さなモーダル（No.9.3）へ。", cond="本発注承認済で出荷前のとき", vi="Nhập hộ: báo cáo xuất hàng", detail_vi="Chuyển sang modal nhỏ (No.9.3).", cond_vi="Khi đã duyệt đặt hàng chính thức và chưa xuất hàng"),
    it("8.14", "入荷登録を開く", ".mbox a::入荷登録を開く", "link", "click", "入荷登録（AW_RECV_001）へ。入荷した数・箱数・入荷日・期限は入荷登録で入れる（台帳 I・hong 2026-10-07）。", cond="出荷済で入荷前のとき。入荷管理の権限",
       demo_ok="コードは「入荷を登録」ボタン（数・箱数なしで入荷済みにする）。リンクに変える（H12）。", vi="Mở đăng ký nhập kho", detail_vi="Chuyển sang đăng ký nhập kho (AW_RECV_001). Số lượng・số thùng・ngày nhập kho・hạn nhập tại đăng ký nhập kho (sổ cái I・hong 2026-10-07).", cond_vi="Khi đã xuất hàng và chưa nhập kho. Quyền quản lý nhập kho", demo_ok_vi="Code hiện có nút \"入荷を登録\" (chuyển sang đã nhập kho mà không có số lượng・số thùng). Sẽ đổi thành liên kết (H12)."),
    it("8.15", "閉じる", ".mbox button::閉じる", "button", "click", "モーダルを閉じる。", vi="Đóng", detail_vi="Đóng modal."),
]
view("019", "AW_PURC_002", "発注データ詳細（仮発注済・納期回答待ち）", DETAIL, "/ops/purchasing/history",
     setup=H + "await search('PO-202611-M008-U01');const b=document.querySelector('.tbl tbody td button.lnk');if(b){b.click();await sleep(800);}", wait=1500,
     note="「代理入力：納期回答」と「発注を取り消す」が出る。", state_vi="Chi tiết dữ liệu đặt hàng (đã đặt hàng tạm・chờ trả lời ngày giao)", note_vi="Hiện \"代理入力：納期回答\" (nhập hộ: trả lời ngày giao) và \"発注を取り消す\" (hủy đơn đặt hàng).")
view("020", "AW_PURC_002", "発注データ詳細（本発注・承認待ち）", [], "/ops/purchasing/history",
     setup=H + "await search('PO-202611-M008-U01');const b=document.querySelector('.tbl tbody td button.lnk');if(b){b.click();await sleep(800);}", wait=1500,
     note="本発注にすると「本発注数を直す（承認前だけ）」「代理入力：本発注の承認」が出る。見本は B で本発注の状態を作る。", state_vi="Chi tiết dữ liệu đặt hàng (đặt hàng chính thức・chờ duyệt)", note_vi="Khi đặt hàng chính thức thì hiện \"本発注数を直す（承認前だけ）\" và \"代理入力：本発注の承認\". Trạng thái đặt hàng chính thức của dữ liệu mẫu được tạo bằng B.")
view("021", "AW_PURC_002", "発注データ詳細（本発注承認済・出荷済・入荷済）", [], "/ops/purchasing/history",
     setup=H + "await search('PO-202609');const b=document.querySelector('.tbl tbody td button.lnk');if(b){b.click();await sleep(800);}", wait=1500,
     note="本発注の承認の納品日・入荷箱数、仕入先回答（出荷日・運送会社・送り状番号）、入荷状況。", state_vi="Chi tiết dữ liệu đặt hàng (đã duyệt đặt hàng chính thức・đã xuất hàng・đã nhập kho)", note_vi="Ngày giao・số thùng nhập kho của duyệt đặt hàng chính thức, phản hồi nhà cung cấp (ngày xuất・công ty vận chuyển・số vận đơn), tình trạng nhập kho.")
view("022", "AW_PURC_002", "発注データ詳細（受注不可）", [], "/ops/purchasing/history", setup=H + "await search('PO-202611-M006-U02');const b=document.querySelector('.tbl tbody td button.lnk');if(b){b.click();await sleep(800);}", wait=1500, note="仕入先が受注不可と回答した発注：理由・コメントの案内と「発注を取り消す」。見本の PO-202611-M006-U02。", state_vi="Chi tiết dữ liệu đặt hàng (không nhận đơn)", note_vi="Đơn đặt hàng mà nhà cung cấp trả lời không nhận đơn: hướng dẫn lý do・bình luận và \"発注を取り消す\". Nếu dữ liệu mẫu không có thì tạo bằng B.")
view("023", "AW_PURC_002", "発注データ詳細（キャンセル）", [], "/ops/purchasing/history", setup=H + "await search('PO-202611-M004-U02');const b=document.querySelector('.tbl tbody td button.lnk');if(b){b.click();await sleep(800);}", wait=1500, note="キャンセルした発注：日時・者・理由の案内。", state_vi="Chi tiết dữ liệu đặt hàng (hủy)", note_vi="Đơn đặt hàng đã hủy: hướng dẫn ngày giờ・người hủy・lý do.")
view("024", "AW_PURC_002", "発注データ詳細（追加発注）", [], "/ops/purchasing/history", setup=H + "await search('PO-202610-M004-U05');const b=document.querySelector('.tbl tbody td button.lnk');if(b){b.click();await sleep(800);}", wait=1500, note="追加発注の発注：「追加発注」のバッジと理由の案内。", state_vi="Chi tiết dữ liệu đặt hàng (đặt hàng bổ sung)", note_vi="Đơn đặt hàng bổ sung: huy hiệu \"追加発注\" và hướng dẫn lý do.")
FORMS = [
    it("9", "発注データ詳細の小さなモーダル（代理入力・直す・取り消す・追加発注）", ".mbox", "modal", "show", "どれも 560 幅の小さなモーダル。「戻る」で詳細へ戻る。エラーは入力欄の下のメッセージ。", vi="Các modal nhỏ của chi tiết dữ liệu đặt hàng (nhập hộ・sửa・hủy・đặt hàng bổ sung)", detail_vi="Tất cả đều là modal nhỏ rộng 560. \"戻る\" để quay về chi tiết. Lỗi hiển thị bằng thông báo dưới ô nhập."),
    it("9.1", "代理入力：納期回答", "-", "area", "view", "出荷予定日（必須）・回答の受け方（メール／電話／FAX）。「入力する」で納期回答済みにする。", err=["E01"], vi="Nhập hộ: trả lời ngày giao", detail_vi="Ngày xuất dự kiến (bắt buộc)・cách nhận phản hồi (email / điện thoại / FAX). Bấm \"入力する\" để chuyển sang đã trả lời ngày giao."),
    it("9.2", "代理入力：本発注の承認", "-", "area", "view", "納品日（倉庫に届く日・必須）・入荷箱数（1以上・必須）・賞味期限（資材以外は必須）。", err=["E01", "E12"], vi="Nhập hộ: duyệt đặt hàng chính thức", detail_vi="Ngày giao (ngày hàng đến kho・bắt buộc)・số thùng nhập kho (từ 1 trở lên・bắt buộc)・hạn sử dụng (bắt buộc trừ vật tư)."),
    it("9.3", "代理入力：出荷報告", "-", "area", "view", "出荷日（必須）・配送方法（直送〈運送会社利用〉／自社配送／倉庫へ持込・必須）・運送会社（一覧から選ぶ）・送り状番号（任意・形式は見ない）・賞味期限（資材以外は必須・出荷日より後）。分納のときは、まだ出荷していない先の回から順に入れる。", err=["E01", "E159"],
       demo_ok="コードは配送方法の欄がない（H3）・送り状番号を10〜12桁で見る（H14）。", vi="Nhập hộ: báo cáo xuất hàng", detail_vi="Ngày xuất (bắt buộc)・cách giao hàng (giao thẳng 〈dùng công ty vận chuyển〉 / giao bằng xe công ty / mang đến kho・bắt buộc)・công ty vận chuyển (chọn từ danh sách)・số vận đơn (tùy chọn・không kiểm tra định dạng)・hạn sử dụng (bắt buộc trừ vật tư・sau ngày xuất). Với giao từng phần thì nhập lần lượt từ các lần chưa xuất hàng.", demo_ok_vi="Code hiện chưa có ô cách giao hàng (H3), và kiểm tra số vận đơn 10〜12 chữ số (H14)."),
    it("9.4", "本発注数を直す（承認前だけ）", "-", "area", "view", "本発注数（1以上・上限 999,999）。直すと仕入先に再承認をメールで依頼し、変更前後を履歴に残す。", err=["E12", "S194"], vi="Sửa số đặt hàng chính thức (chỉ trước khi duyệt)", detail_vi="Số đặt hàng chính thức (từ 1 trở lên・tối đa 999,999). Khi sửa sẽ gửi email yêu cầu nhà cung cấp duyệt lại và lưu trước・sau thay đổi vào lịch sử."),
    it("9.5", "発注を取り消す", "-", "area", "view", "理由（必須・60文字）。キャンセルは消さずに履歴に残し、仕入先サイトの「キャンセル」タブとメールで知らせる。", err=["E01", "S195"], vi="Hủy đơn đặt hàng", detail_vi="Lý do (bắt buộc・60 ký tự). Việc hủy không xóa mà lưu vào lịch sử, và thông báo bằng tab \"キャンセル\" của site nhà cung cấp và email."),
    it("9.6", "追加発注（通常商品）", "-", "area", "view", "数量（1以上）・理由（締切後に承認された申込／お試し（発注締め日に間に合った分）／営業サンプルの締め後の追加／その他）。新しい発注データ（本発注）を作り、仕入先に納期回答と本発注の承認を依頼する。", err=["E01", "E12", "S127"], vi="Đặt hàng bổ sung (sản phẩm thường)", detail_vi="Số lượng (từ 1 trở lên)・lý do (đơn được duyệt sau hạn chốt / dùng thử (phần kịp hạn chốt đặt hàng) / thêm hàng mẫu kinh doanh sau khi chốt / khác). Tạo dữ liệu đặt hàng mới (đặt hàng chính thức), yêu cầu nhà cung cấp trả lời ngày giao và duyệt đặt hàng chính thức."),
]
view("025", "AW_PURC_002", "小さなモーダルの一覧（代理入力・直す・取り消す・追加発注）", FORMS, "/ops/purchasing/history", wait=1200,
     note="どのモーダルも状態によって出る。画面ごとの撮影は B で必要なものだけ撮る。", state_vi="Danh sách các modal nhỏ (nhập hộ・sửa・hủy・đặt hàng bổ sung)", note_vi="Mỗi modal xuất hiện tùy theo trạng thái. Việc chụp từng màn hình chỉ chụp những cái cần thiết bằng B.")

# ================================================================ AW_PURC_003 発注詳細（通常商品）
DET_HEAD = [
    it("1", "ヘッダーのボタン", ".ph .btns", "area", "view", "権限がないボタンは出さない。「仕様確認」「発注メールの文面」は外した（hong 2026-10-07）。", vi="Các nút ở phần đầu trang", detail_vi="Không hiển thị nút mà người dùng không có quyền. \"仕様確認\" và \"発注メールの文面\" đã bỏ (hong 2026-10-07)."),
    it("1.1", "発注済データ確認", ".ph .btns button::発注済データ確認", "button", "click", "この商品の発注済みのデータを見るモーダル（AW_PURC_001 No.10）。", vi="Xác nhận dữ liệu đã đặt hàng", detail_vi="Modal xem dữ liệu đã đặt hàng của sản phẩm này (AW_PURC_001 No.10)."),
    it("1.2", "本発注", ".ph .btns button.pri", "button", "click", "この商品の一括本発注（AW_PURC_001 No.9）を開く。仕入先が未発行でも押せる（運営が発注し、回答・承認・出荷報告を代理入力する）。", err=["S193"], cond="発注管理の「本発注の発行」の権限", vi="Đặt hàng chính thức", detail_vi="Mở đặt hàng chính thức hàng loạt (AW_PURC_001 No.9) của sản phẩm này. Bấm được kể cả khi nhà cung cấp chưa được cấp tài khoản (運営 đặt hàng, nhập hộ trả lời/phê duyệt/báo xuất hàng).", cond_vi="Quyền \"phát hành đặt hàng chính thức\" của quản lý đặt hàng"),
    it("2", "代替品設定の案内", ".notice::代替品設定", "label", "show", "代替品設定で増減があるとき、理由・＋／−の数・追加の発注データ番号を案内する。", cond="この商品・月に代替品設定があるとき", vi="Hướng dẫn thiết lập hàng thay thế", detail_vi="Khi có tăng giảm do thiết lập hàng thay thế thì hướng dẫn lý do, số + / −, mã dữ liệu đặt hàng bổ sung.", cond_vi="Khi sản phẩm・tháng này có thiết lập hàng thay thế"),
    it("3", "対象商品・メニュー年月", ".poPick", "area", "view", "商品と月を切り替える。未保存の変更があれば先に確認する（Q02）。", vi="Sản phẩm đối tượng・năm-tháng menu", detail_vi="Chuyển sản phẩm và tháng. Nếu có thay đổi chưa lưu thì xác nhận trước (Q02)."),
    it("3.1", "対象商品", "#po-prod", "select", "select", "選んだ月のメニューの商品。選ぶとその商品の発注詳細へ（通常／短消費期限で画面が変わる）。", req="○", len="選択（商品名（品番））", len_vi="Chọn (tên sản phẩm (mã sản phẩm))", ex="寒干し大根の五目煮（M008）", err=["Q02"], vi="Sản phẩm đối tượng", detail_vi="Các sản phẩm trong menu của tháng đã chọn. Khi chọn sẽ chuyển sang chi tiết đặt hàng của sản phẩm đó (màn hình đổi theo thường / hạn tiêu thụ ngắn).", ex_vi="Món om củ cải khô ngũ vị (M008)"),
    it("3.2", "メニュー年月", "#po-ym", "select", "select", "その商品が入っているメニュー年月。", req="○", len="選択", ex="2026-11", err=["Q02"], vi="Năm-tháng menu", detail_vi="Năm-tháng menu có chứa sản phẩm đó.", ex_vi="Năm-tháng của menu"),
    it("3.3", "モードのバッジ", ".poPick .badge", "label", "view", "「通常商品モード」（短消費期限商品は AW_PURC_004）。", vi="Huy hiệu chế độ", detail_vi="\"通常商品モード\" (chế độ sản phẩm thường) (sản phẩm hạn tiêu thụ ngắn là AW_PURC_004)."),
    it("4", "共通商品基本情報", ".card:has(.kvgrid)", "card", "view", "品番・商品名・仕入時の商品名・カテゴリ・保管方法・仕入先・仕入単価（税抜）・発注ロット（個／箱）・メニュー年月・納品サイクル（A1〜D7・28日間）・オーダー締切。仕入先が未発行のときは警告（システムで仮発注・本発注できない・伝票発注で発注）。", vi="Thông tin cơ bản chung của sản phẩm", detail_vi="Mã sản phẩm・tên sản phẩm・tên sản phẩm lúc nhập hàng・danh mục・cách bảo quản・nhà cung cấp・đơn giá nhập (chưa thuế)・lô đặt hàng (cái / thùng)・năm-tháng menu・chu kỳ giao hàng (A1〜D7・28 ngày)・hạn chốt đơn. Khi nhà cung cấp chưa được cấp tài khoản thì có cảnh báo (không đặt hàng tạm・đặt hàng chính thức được trên hệ thống・đặt hàng bằng phiếu).", ex=["M008", "Thông tin cơ bản của sản phẩm M008 hiển thị dạng thẻ"]),
    it("5", "集計", ".sumbar", "area", "view", "オーダー数・総必要数・総仮発注数・本発注数・発注単位数、と「n単位 本発注済／仮発注済／未発注／エラー／未保存の変更」のバッジ。", vi="Tổng hợp", detail_vi="Số lượng đơn・tổng số lượng cần・tổng số đặt hàng tạm・số đặt hàng chính thức・số đơn vị đặt hàng, cùng các huy hiệu \"n đơn vị đã đặt hàng chính thức / đã đặt hàng tạm / chưa đặt hàng / lỗi / thay đổi chưa lưu\"."),
]
DET_UNIT = [
    it("6", "発注単位の区切り", ".seg2", "tab", "click", "4Cycle別（A・B・C・D ごと）／2Cycle別（A・B／C・D）／全1単位。区切りは一括で変えられる。仮発注済の単位があるときは変えられない（データリセットで未発注に戻す）。", req="○", init="4Cycle別", cond="発注管理の「区切りの変更」の権限", vi="Cách chia đơn vị đặt hàng", detail_vi="Theo 4 chu kỳ (từng A・B・C・D) / theo 2 chu kỳ (A・B / C・D) / toàn bộ 1 đơn vị. Có thể đổi cách chia hàng loạt. Khi có đơn vị đã đặt hàng tạm thì không đổi được (đặt lại về chưa đặt hàng bằng đặt lại dữ liệu).", init_vi="Theo 4 chu kỳ", cond_vi="Quyền \"đổi cách chia\" của quản lý đặt hàng"),
    it("7", "操作バー", ".pobar", "area", "view", "選んだ行（なければ開いている単位の全行）に対する一括操作。", vi="Thanh thao tác", detail_vi="Thao tác hàng loạt cho các dòng đã chọn (nếu chưa chọn thì tất cả dòng của đơn vị đang mở)."),
    it("7.1", "選択した行のみ適用", ".pobar input[type=checkbox]", "check", "check", "チェックすると開いている単位の全行を選ぶ。外すと選択を解く。", req="－", vi="Chỉ áp dụng cho dòng đã chọn", detail_vi="Khi đánh dấu sẽ chọn tất cả dòng của đơn vị đang mở. Bỏ đánh dấu thì bỏ chọn.", ex=["ON", "Đánh dấu chọn để áp dụng thao tác cho các dòng đã chọn"]),
    it("7.2", "入荷希望日 一括", ".pobar select", "select", "select", "選んだ行（なければ全行）の入荷希望日を、当日／前日／2日前などに一括変更する。", req="－", len="選択", init="選択…", ex="前日", vi="Ngày nhập kho mong muốn (hàng loạt)", detail_vi="Đổi hàng loạt ngày nhập kho mong muốn của các dòng đã chọn (nếu chưa chọn thì tất cả dòng) thành cùng ngày / 1 ngày trước / 2 ngày trước, v.v.", init_vi="Chọn…", ex_vi="1 ngày trước"),
    it("7.3", "必要数を仮発注数に一括コピー", ".pobar button::必要数を仮発注数に一括コピー", "button", "click", "選んだ行の日別必要数を仮発注数にコピーする。", vi="Sao chép số lượng cần sang số đặt hàng tạm hàng loạt", detail_vi="Sao chép số lượng cần theo ngày của các dòng đã chọn sang số đặt hàng tạm."),
    it("7.4", "ロット単位に切り上げ", ".pobar button::ロット単位", "button", "click", "発注単位の合計をロット（箱）単位に切り上げる（ロット＝商品の入り数）。", vi="Làm tròn lên theo lô", detail_vi="Làm tròn lên tổng của đơn vị đặt hàng theo lô (thùng) (lô = số cái/thùng của sản phẩm)."),
    it("7.5", "未発注の全単位を一括仮発注", ".pobar button::未発注の全単位を一括仮発注", "button", "click", "未発注の全単位を、必要数をロット切り上げした数で一括仮発注する。", cond="発注管理の「発注の作成」の権限。仕入先が未発行のときは押せない", err=["E145"], vi="Đặt hàng tạm hàng loạt toàn bộ đơn vị chưa đặt hàng", detail_vi="Đặt hàng tạm hàng loạt toàn bộ đơn vị chưa đặt hàng, với số lượng là số lượng cần đã làm tròn lên theo lô.", cond_vi="Quyền \"tạo đặt hàng\" của quản lý đặt hàng. Không bấm được khi nhà cung cấp chưa được cấp tài khoản"),
    it("7.6", "データリセット", ".pobar button.dan", "button", "click", "この商品の未確定の仮発注データを未発注に戻す（確認 Q120）。本発注済のデータは戻らない。", cond="発注管理の「キャンセル」の権限", err=["Q120"], vi="Đặt lại dữ liệu", detail_vi="Đưa dữ liệu đặt hàng tạm chưa chốt của sản phẩm này về chưa đặt hàng (xác nhận Q120). Dữ liệu đã đặt hàng chính thức không quay lại được.", cond_vi="Quyền \"hủy\" của quản lý đặt hàng"),
    it("8", "発注単位（カード）", ".card.unit", "card", "view", "発注単位＝サイクル範囲 × 納入倉庫（必要数がある倉庫だけ）。操作中の1単位だけ明細を開く。", ex=["U01", "Thẻ đơn vị đặt hàng (một đơn vị = phạm vi chu kỳ × kho nhận hàng)"], vi="Đơn vị đặt hàng (thẻ)", detail_vi="Đơn vị đặt hàng = phạm vi chu kỳ × kho nhận hàng (chỉ kho có số lượng cần). Chỉ mở chi tiết của 1 đơn vị đang thao tác."),
    it("8.1", "サイクル記号・発注単位の番号・状態", ".card.unit .unit-h", "label", "view", "A CYCLE などの記号・「発注単位 n」・未発注／仮発注済／本発注済のバッジ・追加発注・未保存のバッジ。", vi="Ký hiệu chu kỳ・số đơn vị đặt hàng・trạng thái", detail_vi="Ký hiệu như A CYCLE・\"発注単位 n\" (đơn vị đặt hàng n)・huy hiệu chưa đặt hàng / đã đặt hàng tạm / đã đặt hàng chính thức・đặt hàng bổ sung・chưa lưu."),
    it("8.2", "発注番号", ".card.unit .mono.po", "label", "view", "PO-YYYYMM-品番-U01 の形。未発注は予定の番号。", vi="Mã đơn đặt hàng", detail_vi="Dạng PO-YYYYMM-品番-U01. Đơn chưa đặt hàng là mã dự kiến."),
    it("8.3", "必要・仮発注・本発注の数", ".card.unit .unit-sum", "label", "view", "「必要 n個／仮発注 n個／本発注 n個」。", vi="Số cần・đặt hàng tạm・đặt hàng chính thức", detail_vi="\"必要 n個 / 仮発注 n個 / 本発注 n個\" (cần n cái / đặt hàng tạm n cái / đặt hàng chính thức n cái)."),
    it("8.4", "仮発注保存／仮発注を更新／変更を保存（再回答依頼）", ".card.unit .unit-h button.pri", "button", "click",
       "未発注＝仮発注を作成して仕入先に納期回答を依頼する。仮発注済＝数量・入荷希望日を直して保存し、納期回答済みなら再回答を依頼する。仮発注数が0なら E280。本発注済の単位は直せない（増やす＝追加発注・減らす＝キャンセルして出し直し）。",
       err=["E280", "E145"], cond="発注管理の権限。仕入先が未発行のときは押せない", vi="Lưu đặt hàng tạm / Cập nhật đặt hàng tạm / Lưu thay đổi (yêu cầu trả lời lại)", detail_vi="Chưa đặt hàng = tạo đặt hàng tạm và yêu cầu nhà cung cấp trả lời ngày giao. Đã đặt hàng tạm = sửa số lượng・ngày nhập kho mong muốn rồi lưu, nếu đã trả lời ngày giao thì yêu cầu trả lời lại. Nếu số đặt hàng tạm là 0 thì E280. Không sửa được đơn vị đã đặt hàng chính thức (tăng = đặt hàng bổ sung・giảm = hủy rồi đặt lại).", cond_vi="Quyền của quản lý đặt hàng. Không bấm được khi nhà cung cấp chưa được cấp tài khoản"),
    it("8.5", "明細を開く／閉じる", ".card.unit .unit-h button.ghost", "button", "click", "この単位の明細を開閉する（開くのは1単位だけ）。", vi="Mở / đóng chi tiết", detail_vi="Mở / đóng chi tiết của đơn vị này (chỉ mở được một đơn vị)."),
    it("8.6", "仕入先回答の行", ".card.unit .ansline", "area", "view", "仕入先回答（納期回答待ち／納期回答済／出荷済）・出荷予定日・送り状・入荷・本発注の承認（承認待ち／承認済・納品日・入荷箱数・分納 n回）。数量を変えて未保存のときは「数量を変更しました（未保存）」。", vi="Dòng phản hồi nhà cung cấp", detail_vi="Phản hồi nhà cung cấp (chờ trả lời ngày giao / đã trả lời ngày giao / đã xuất hàng)・ngày xuất dự kiến・phiếu vận đơn・nhập kho・duyệt đặt hàng chính thức (chờ duyệt / đã duyệt・ngày giao・số thùng nhập kho・giao từng phần n lần). Khi đã đổi số lượng mà chưa lưu thì hiện \"数量を変更しました（未保存）\" (đã đổi số lượng, chưa lưu)."),
    it("8.7", "明細の表", ".card.unit .tbl", "table", "view", "ピッキング日・注文数（うち仮＝仮登録の契約の分）・調整数（無料枠）・サンプル枠（営業サンプル分＝受付済の実際の数量＋枠の残り件数×2個。各2個は仮）・日別必要数・仮発注数（入力）・本発注数・入荷希望日（選択）。行のチェックで一括操作の対象にできる。", vi="Bảng chi tiết", detail_vi="Ngày lấy hàng・số lượng đặt (trong đó tạm = phần của hợp đồng đăng ký tạm)・số điều chỉnh (suất miễn phí)・suất hàng mẫu (phần hàng mẫu = số lượng thực tế đã tiếp nhận + số mẫu còn lại của hạn mức × 2 cái; 2 cái mỗi mẫu là tạm)・số lượng cần theo ngày・số đặt hàng tạm (nhập)・số đặt hàng chính thức・ngày nhập kho mong muốn (chọn). Có thể đưa dòng vào thao tác hàng loạt bằng checkbox."),
    it("8.8", "仮発注数", ".card.unit .tbl tbody tr:first-child input[type=number]", "text", "input", "日別の仮発注数。0以上の整数（上限 999,999）。必要数と違う値は色を変える。", req="○", len="整数 0〜999,999", init="必要数", ex="11", err=["E12"], demo_ok="コードは上限がない（H7）。", vi="Số đặt hàng tạm", detail_vi="Số đặt hàng tạm theo ngày. Số nguyên từ 0 trở lên (tối đa 999,999). Giá trị khác số lượng cần sẽ đổi màu.", init_vi="Số lượng cần", ex_vi="Số lượng (cái)", demo_ok_vi="Code hiện không có giới hạn trên (H7)."),
    it("8.9", "入荷希望日", ".card.unit .tbl tbody tr:first-child select", "select", "select", "仕入先に伝える入荷希望日（当日・前日・2日前など。初期値は当日）。", req="○", len="選択", init="当日", ex="前日", vi="Ngày nhập kho mong muốn", detail_vi="Ngày nhập kho mong muốn báo cho nhà cung cấp (cùng ngày・1 ngày trước・2 ngày trước, v.v. Giá trị ban đầu là cùng ngày).", init_vi="Cùng ngày", ex_vi="1 ngày trước"),
    it("8.10", "合計の案内", ".card.unit .unitfoot", "label", "view", "必要数合計・仮発注数合計（箱数）。合計がロットの倍数でないときは「保存時に切り上げます」の警告。", vi="Hướng dẫn tổng", detail_vi="Tổng số lượng cần・tổng số đặt hàng tạm (số thùng). Khi tổng không là bội số của lô thì cảnh báo \"保存時に切り上げます\" (sẽ làm tròn lên khi lưu)."),
    it("9", "操作中の1単位のみ展開する案内", ".notice.warn", "label", "view", "複数の単位を同時に展開しない旨と、保存しないで画面を離れると確認が出る旨。", vi="Hướng dẫn chỉ mở 1 đơn vị đang thao tác", detail_vi="Không mở nhiều đơn vị cùng lúc; và nếu rời màn hình khi chưa lưu thì sẽ có xác nhận."),
]
view("026", "AW_PURC_003", "初期表示（通常商品・発注単位を1つ開く）", DET_HEAD + DET_UNIT, "/ops/purchasing/orders/M008", wait=2500,
     note="通常商品。発注単位ごとに仮発注・本発注する。短消費期限商品は AW_PURC_004。", state_vi="Hiển thị ban đầu (sản phẩm thường・mở 1 đơn vị đặt hàng)", note_vi="Sản phẩm thường. Đặt hàng tạm・đặt hàng chính thức theo từng đơn vị đặt hàng. Sản phẩm hạn tiêu thụ ngắn là AW_PURC_004.")
view("027", "AW_PURC_003", "数量を変更（未保存・再回答依頼）", [], "/ops/purchasing/orders/M008",
     setup=H + "const i=document.querySelector('.card.unit .tbl tbody tr input[type=number]');if(i){setv(i,String((+i.value||0)+1));await sleep(400);}", wait=1500,
     note="仮発注済の単位の数量を変えると「未保存」のバッジと「変更を保存（再回答依頼）」。", state_vi="Đổi số lượng (chưa lưu・yêu cầu trả lời lại)", note_vi="Khi đổi số lượng của đơn vị đã đặt hàng tạm thì có huy hiệu \"未保存\" (chưa lưu) và nút \"変更を保存（再回答依頼）\".")
view("028", "AW_PURC_003", "未保存の変更（離脱確認）", [], "/ops/purchasing/orders/M008",
     setup=H + "const i=document.querySelector('.card.unit .tbl tbody tr input[type=number]');if(i){setv(i,String((+i.value||0)+1));await sleep(300);}const s=document.querySelector('#po-ym');if(s){const o=[...s.options].find(x=>x.value!==s.value);if(o)setsel(s,o.value);}await sleep(800);", wait=1500,
     note="未保存の変更があるまま商品・月を切り替えると、Q02（破棄して移動）の確認。", state_vi="Thay đổi chưa lưu (xác nhận khi rời)", note_vi="Khi chuyển sản phẩm・tháng mà còn thay đổi chưa lưu thì có xác nhận Q02 (hủy bỏ thay đổi và chuyển).")
view("029", "AW_PURC_003", "データリセット（確認）", [], "/ops/purchasing/orders/M008",
     setup=H + "const b=btn('データリセット');if(b){b.click();await sleep(600);}", wait=1200, note="Q120：未確定の仮発注データを未発注に戻す。本発注済のデータは戻らない。", state_vi="Đặt lại dữ liệu (xác nhận)", note_vi="Q120: đưa dữ liệu đặt hàng tạm chưa chốt về chưa đặt hàng. Dữ liệu đã đặt hàng chính thức không quay lại.")
view("030", "AW_PURC_003", "区切りを切り替えられない（仮発注済あり）", [], "/ops/purchasing/orders/M008",
     setup=H + "const b=[...document.querySelectorAll('.seg2 button')].find(x=>!x.classList.contains('on'));if(b){b.click();await sleep(600);}", wait=1200,
     note="仮発注済の単位があるときは、区切りを変えようとすると案内のトーストが出て切り替わらない。", state_vi="Không đổi được cách chia (có đơn vị đã đặt hàng tạm)", note_vi="Khi có đơn vị đã đặt hàng tạm, nếu định đổi cách chia thì hiện toast hướng dẫn và không chuyển.")
view("031", "AW_PURC_003", "本発注済（数量を直せない）", [], "/ops/purchasing/orders/M003", wait=2000,
     note="本発注済の単位（見本：2026-10）は数量が見るだけ。直すときは追加発注（増）／キャンセルして出し直し（減）。メニュー年月で 2026-10 を選ぶ。", state_vi="Đã đặt hàng chính thức (không sửa được số lượng)", note_vi="Số lượng của đơn vị đã đặt hàng chính thức (dữ liệu mẫu: 2026-10) chỉ xem. Khi cần sửa thì đặt hàng bổ sung (tăng) / hủy rồi đặt lại (giảm). Chọn 2026-10 ở năm-tháng menu.")
view("032", "AW_PURC_003", "仕入先未発行（システム発注できない）", [], "/ops/purchasing/orders/M022", wait=2000,
     note="仕入先が未発行：警告を出し、仮発注・本発注のボタンは押せない（E145）。", state_vi="Nhà cung cấp chưa được cấp tài khoản (không đặt hàng được qua hệ thống)", note_vi="Nhà cung cấp chưa được cấp tài khoản: hiện cảnh báo, không bấm được nút đặt hàng tạm・đặt hàng chính thức (E145).")
view("033", "AW_PURC_003", "代替品設定の追加発注の案内", [], "/ops/purchasing/orders/M003", wait=2000, note="見本：2026-10 の M003（代替商品：＋96個・追加の発注データ PO-202610-M003-ALT1）。", state_vi="Hướng dẫn đặt hàng bổ sung của thiết lập hàng thay thế", note_vi="Dữ liệu mẫu: M003 của 2026-10 (sản phẩm thay thế: +96 cái・dữ liệu đặt hàng bổ sung PO-202610-M003-ALT1).")
view("034", "AW_PURC_003", "追加発注（通常商品：発注データ詳細から）", [], "/ops/purchasing/history", wait=1200,
     note="追加発注は発注データ詳細（AW_PURC_002 No.9.6）から行う。", state_vi="Đặt hàng bổ sung (sản phẩm thường: từ chi tiết dữ liệu đặt hàng)", note_vi="Đặt hàng bổ sung được thực hiện từ chi tiết dữ liệu đặt hàng (AW_PURC_002 No.9.6).")

# ================================================================ AW_PURC_004 発注詳細（短消費期限商品）
SH = [
    it("1", "ヘッダーのボタン", ".ph .btns", "area", "view", "AW_PURC_003 No.1 と同じ（発注済データ確認・本発注）。", vi="Các nút ở phần đầu trang", detail_vi="Giống AW_PURC_003 No.1 (xác nhận dữ liệu đã đặt hàng・đặt hàng chính thức)."),
    it("3", "対象商品・メニュー年月", ".poPick", "area", "view", "AW_PURC_003 No.3 と同じ。バッジは「短消費期限商品モード」。", vi="Sản phẩm đối tượng・năm-tháng menu", detail_vi="Giống AW_PURC_003 No.3. Huy hiệu là \"短消費期限商品モード\" (chế độ sản phẩm hạn tiêu thụ ngắn)."),
    it("4", "共通商品基本情報", ".card:has(.kvgrid)", "card", "view", "品番・商品名・仕入時の商品名・カテゴリ・保管方法・仕入先・仕入単価（税抜）・発注ロット（1個単位〔1倉庫×1納品日ごと〕）・メニュー年月・消費期限保証日数（厳守）・製造後消費期限。短消費期限商品の注意の警告（1倉庫×1顧客納品日＝1発注データ。消費期限の残日数が保証基準を満たしているか確認）。", vi="Thông tin cơ bản chung của sản phẩm", detail_vi="Mã sản phẩm・tên sản phẩm・tên sản phẩm lúc nhập hàng・danh mục・cách bảo quản・nhà cung cấp・đơn giá nhập (chưa thuế)・lô đặt hàng (đơn vị 1 cái 〈theo 1 kho × 1 ngày giao〉)・năm-tháng menu・số ngày đảm bảo hạn tiêu thụ (phải tuân thủ nghiêm)・hạn tiêu thụ sau sản xuất. Cảnh báo lưu ý sản phẩm hạn tiêu thụ ngắn (1 kho × 1 ngày giao cho khách = 1 dữ liệu đặt hàng. Kiểm tra số ngày còn lại của hạn tiêu thụ có đạt tiêu chuẩn đảm bảo không).", ex=["M015", "Thông tin cơ bản của sản phẩm M015 hiển thị dạng thẻ"]),
    it("5", "集計", ".sumbar", "area", "view", "オーダー数・総必要数・総仮発注数・本発注数・発注件数と、「n件 本発注済／仮発注済／未発注／エラー」のバッジ。", vi="Tổng hợp", detail_vi="Số lượng đơn・tổng số lượng cần・tổng số đặt hàng tạm・số đặt hàng chính thức・số mục đặt hàng, cùng các huy hiệu \"n mục đã đặt hàng chính thức / đã đặt hàng tạm / chưa đặt hàng / lỗi\"."),
    it("6", "倉庫・サイクルの絞り込み", ".po-row", "tab", "click", "倉庫（全倉庫／各倉庫〔件数〕）とサイクル（全サイクル／A／B／C／D）で明細を絞る。", req="－", init="全倉庫・全サイクル", vi="Lọc theo kho・chu kỳ", detail_vi="Lọc chi tiết theo kho (tất cả kho / từng kho 〈số mục〉) và chu kỳ (tất cả chu kỳ / A / B / C / D).", init_vi="Tất cả kho・tất cả chu kỳ"),
    it("7", "操作バー", ".pobar", "area", "view", "選んだ行（なければ全行）に対する一括操作。", vi="Thanh thao tác", detail_vi="Thao tác hàng loạt cho các dòng đã chọn (nếu chưa chọn thì tất cả dòng)."),
    it("7.1", "選択した行のみ適用", ".pobar input[type=checkbox]", "check", "check", "チェックすると本発注済でない全行を選ぶ。", req="－", vi="Chỉ áp dụng cho dòng đã chọn", detail_vi="Khi đánh dấu sẽ chọn tất cả các dòng chưa đặt hàng chính thức.", ex=["ON", "Đánh dấu chọn để áp dụng thao tác cho các dòng đã chọn"]),
    it("7.2", "入荷希望日 一括", ".pobar select", "select", "select", "選んだ行の入荷希望日を一括変更する（当日／前日／2日前）。", req="－", len="選択", init="選択…", ex="前日", vi="Ngày nhập kho mong muốn (hàng loạt)", detail_vi="Đổi hàng loạt ngày nhập kho mong muốn của các dòng đã chọn (cùng ngày / 1 ngày trước / 2 ngày trước).", init_vi="Chọn…", ex_vi="1 ngày trước"),
    it("7.3", "基準適合消費期限を自動設定", ".pobar button::基準適合消費期限を自動設定", "button", "click", "選んだ行の希望消費期限を、保証日数を満たす日に自動設定する。エラーの行は仮発注になる。", cond="発注管理の「発注の変更」の権限", vi="Tự động đặt hạn tiêu thụ đạt chuẩn", detail_vi="Tự động đặt hạn tiêu thụ mong muốn của các dòng đã chọn thành ngày đáp ứng số ngày đảm bảo. Dòng đang lỗi sẽ chuyển thành đặt hàng tạm.", cond_vi="Quyền \"thay đổi đặt hàng\" của quản lý đặt hàng"),
    it("7.4", "データリセット", ".pobar button.dan", "button", "click", "未確定の仮発注データを未発注に戻す（確認 Q120）。", cond="発注管理の「キャンセル」の権限", err=["Q120"], vi="Đặt lại dữ liệu", detail_vi="Đưa dữ liệu đặt hàng tạm chưa chốt về chưa đặt hàng (xác nhận Q120).", cond_vi="Quyền \"hủy\" của quản lý đặt hàng"),
    it("8", "全倉庫明細一覧（カード）", ".card:has(.unit-h)", "card", "view", "1倉庫 × 1顧客納品日＝1発注データ（行）。見出しに発注の番号（PO-YYYYMM-品番-…）と保証期限（日厳守）。エラーの行は本発注できない。", ex=["PO-202611-M015-…", "Thẻ danh sách chi tiết tất cả kho (một dòng = 1 kho × 1 ngày giao cho khách)"], vi="Danh sách chi tiết tất cả kho (thẻ)", detail_vi="1 kho × 1 ngày giao cho khách = 1 dữ liệu đặt hàng (dòng). Tiêu đề hiển thị mã đơn đặt hàng (PO-YYYYMM-品番-…) và hạn đảm bảo (phải tuân thủ nghiêm theo ngày). Dòng lỗi không đặt hàng chính thức được."),
    it("8.1", "倉庫", ".tbl tbody tr:first-child td:nth-child(2)", "label", "view", "納入倉庫。", vi="Kho", detail_vi="Kho nhận hàng."),
    it("8.2", "ピッキング日", ".tbl tbody tr:first-child td:nth-child(3)", "label", "view", "ピッキング日（曜日）。", vi="Ngày lấy hàng", detail_vi="Ngày lấy hàng (thứ)."),
    it("8.3", "注文／調整", ".tbl tbody tr:first-child td:nth-child(4)", "label", "view", "注文数／調整数（無料枠）。", vi="Đặt / điều chỉnh", detail_vi="Số lượng đặt / số điều chỉnh (suất miễn phí)."),
    it("8.4", "日別必要", ".tbl tbody tr:first-child td:nth-child(5)", "label", "view", "注文数＋調整数＋営業サンプル分（受付済の実際の数量＋枠の残り件数×2個。各2個は仮）。", vi="Cần theo ngày", detail_vi="Số lượng đặt + số điều chỉnh + phần hàng mẫu (số lượng thực tế đã tiếp nhận + số mẫu còn lại của hạn mức × 2 cái; 2 cái mỗi mẫu là tạm)."),
    it("8.5", "仮発注数", ".tbl tbody tr:first-child input[type=number]", "text", "input", "この行の仮発注数。本発注済の行は本発注数を見るだけ。入力すると確定して保存する（未発注は下書き）。1以上。", req="○", len="整数 1〜999,999", init="日別必要数", ex="4", err=["E12"], demo_ok="コードは上限がない（H7）。", vi="Số đặt hàng tạm", detail_vi="Số đặt hàng tạm của dòng này. Dòng đã đặt hàng chính thức chỉ xem số đặt hàng chính thức. Khi nhập sẽ chốt và lưu (chưa đặt hàng là bản nháp). Từ 1 trở lên.", init_vi="Số lượng cần theo ngày", ex_vi="Số lượng (cái)", demo_ok_vi="Code hiện không có giới hạn trên (H7)."),
    it("8.6", "入荷希望日", ".tbl tbody tr:first-child select", "select", "select", "入荷希望日（当日・前日・2日前）。", req="○", len="選択", init="当日", ex="前日", vi="Ngày nhập kho mong muốn", detail_vi="Ngày nhập kho mong muốn (cùng ngày・1 ngày trước・2 ngày trước).", init_vi="Cùng ngày", ex_vi="1 ngày trước"),
    it("8.7", "希望消費期限", ".tbl tbody tr:first-child .dateinput input, .tbl tbody tr:first-child input[type=text]", "date", "input", "仕入先に伝える希望消費期限。残日数（希望消費期限 − 顧客納品日）が保証日数以上であること。直すとエラーが消えて仮発注になる。", req="○", len="日付", ex="2026/11/13", err=["E01"], vi="Hạn tiêu thụ mong muốn", detail_vi="Hạn tiêu thụ mong muốn báo cho nhà cung cấp. Số ngày còn lại (hạn tiêu thụ mong muốn − ngày giao cho khách) phải bằng hoặc lớn hơn số ngày đảm bảo. Khi sửa thì lỗi biến mất và chuyển thành đặt hàng tạm.", ex_vi="Ngày"),
    it("8.8", "残日数", ".tbl tbody tr:first-child .badge", "label", "view", "「n日 適合／不足」。保証日数以上＝適合。", vi="Số ngày còn lại", detail_vi="\"n日 適合／不足\" (n ngày: đạt / thiếu). Từ số ngày đảm bảo trở lên = đạt."),
    it("8.9", "ステータス", ".tbl tbody tr:first-child td:nth-last-child(2)", "label", "view", "未発注／エラー／仮発注済／本発注済。", pattern="P-STATUS-COLORS", vi="Trạng thái", detail_vi="Chưa đặt hàng / lỗi / đã đặt hàng tạm / đã đặt hàng chính thức."),
    it("8.10", "仕入先回答", ".tbl tbody tr:first-child td:last-child", "label", "view", "納期回答待ち／納期回答済／出荷済、入荷済みのバッジ。", vi="Phản hồi nhà cung cấp", detail_vi="Huy hiệu: chờ trả lời ngày giao / đã trả lời ngày giao / đã xuất hàng, đã nhập kho."),
    it("8.11", "選択した行を一括仮発注", ".unitfoot button.pri", "button", "click", "選んだ未発注の行を一括で仮発注にする。選択にエラーの行があるときは押せない（希望消費期限を直すか「基準適合消費期限を自動設定」）。", cond="発注管理の「発注の作成」の権限。仕入先が未発行のときは押せない", err=["E145"], vi="Đặt hàng tạm hàng loạt các dòng đã chọn", detail_vi="Đặt hàng tạm hàng loạt các dòng chưa đặt hàng đã chọn. Không bấm được khi trong số đã chọn có dòng lỗi (sửa hạn tiêu thụ mong muốn hoặc dùng \"基準適合消費期限を自動設定\").", cond_vi="Quyền \"tạo đặt hàng\" của quản lý đặt hàng. Không bấm được khi nhà cung cấp chưa được cấp tài khoản"),
    it("8.12", "合計", ".unitfoot", "label", "view", "必要数合計・仮発注数合計。", vi="Tổng", detail_vi="Tổng số lượng cần・tổng số đặt hàng tạm."),
    it("9", "追加発注（行を足す）", "-", "button", "click",
       "オーダー締切の後に増えた分（お試し・締め後の営業サンプル・締切後に承認した申込）を、行（倉庫 × 顧客納品日）として足す。入力：倉庫・顧客納品日（ピッキング日）・数量・入荷希望日・希望消費期限（保証日数を満たす日）・理由。保証日数を満たさない期限はエラー（行と同じ）。新しい発注データ（本発注）を作り、仕入先に納期回答と本発注の承認を依頼する。通常商品の追加発注（AW_PURC_002 No.9.6）とは別の流れ。",
       cond="発注管理の「発注の作成」の権限", err=["E01", "E12", "S127"], demo_ok="コードに短消費期限の追加発注がない（H17）。", vi="Đặt hàng bổ sung (thêm dòng)", detail_vi="Thêm phần tăng sau hạn chốt đơn (dùng thử・hàng mẫu kinh doanh sau khi chốt・đơn được duyệt sau hạn chốt) thành dòng (kho × ngày giao cho khách). Nhập: kho・ngày giao cho khách (ngày lấy hàng)・số lượng・ngày nhập kho mong muốn・hạn tiêu thụ mong muốn (ngày đáp ứng số ngày đảm bảo)・lý do. Hạn không đáp ứng số ngày đảm bảo sẽ báo lỗi (giống dòng thường). Tạo dữ liệu đặt hàng mới (đặt hàng chính thức), yêu cầu nhà cung cấp trả lời ngày giao và duyệt đặt hàng chính thức. Là luồng khác với đặt hàng bổ sung của sản phẩm thường (AW_PURC_002 No.9.6).", cond_vi="Quyền \"tạo đặt hàng\" của quản lý đặt hàng", demo_ok_vi="Code chưa có đặt hàng bổ sung cho hạn tiêu thụ ngắn (H17)."),
]
view("035", "AW_PURC_004", "初期表示（短消費期限商品）", SH, "/ops/purchasing/orders/M015", wait=2500,
     note="短消費期限商品。1倉庫×1顧客納品日ごとに1行。エラーの行は本発注できない。", state_vi="Hiển thị ban đầu (sản phẩm hạn tiêu thụ ngắn)", note_vi="Sản phẩm hạn tiêu thụ ngắn. Mỗi 1 kho × 1 ngày giao cho khách là 1 dòng. Dòng lỗi không đặt hàng chính thức được.")
view("036", "AW_PURC_004", "エラー行（残日数が保証日数に足りない）", [], "/ops/purchasing/orders/M005", wait=2500, note="見本：2026-11 の M005・M015 に、希望消費期限が足りない行がある。", state_vi="Dòng lỗi (số ngày còn lại không đủ số ngày đảm bảo)", note_vi="Dữ liệu mẫu: M005・M015 của 2026-11 có dòng hạn tiêu thụ mong muốn không đủ.")
view("037", "AW_PURC_004", "一括仮発注できない（選択にエラー）", [], "/ops/purchasing/orders/M005",
     setup=H + "const c=document.querySelectorAll('.tbl tbody tr.rerr input[type=checkbox]');c[0]&&c[0].click();await sleep(400);", wait=1500, note="エラーの行を選ぶと「選択した行にエラーがあるため、一括仮発注できません」。", state_vi="Không đặt hàng tạm hàng loạt được (có lỗi trong lựa chọn)", note_vi="Khi chọn dòng lỗi thì hiện \"選択した行にエラーがあるため、一括仮発注できません\" (vì trong các dòng đã chọn có lỗi nên không đặt hàng tạm hàng loạt được).")
view("038", "AW_PURC_004", "基準適合消費期限を自動設定", [], "/ops/purchasing/orders/M005",
     setup=H + "const b=btn('基準適合消費期限を自動設定');if(b){b.click();await sleep(1200);}", wait=1500, note="選んだ行（なければ全行）の希望消費期限を、保証日数を満たす日に設定。", state_vi="Tự động đặt hạn tiêu thụ đạt chuẩn", note_vi="Đặt hạn tiêu thụ mong muốn của các dòng đã chọn (nếu chưa chọn thì tất cả dòng) thành ngày đáp ứng số ngày đảm bảo.")
view("039", "AW_PURC_004", "データリセット（確認）", [], "/ops/purchasing/orders/M015",
     setup=H + "const b=btn('データリセット');if(b){b.click();await sleep(600);}", wait=1200, note="Q120。", state_vi="Đặt lại dữ liệu (xác nhận)", note_vi="Q120.")
view("040", "AW_PURC_004", "仕入先未発行", [], "/ops/purchasing/orders/M022", wait=2000, note="仕入先が未発行のときは警告・仮発注のボタンは押せない（見本の短消費期限商品には未発行の仕入先がないので、B で状態を確認する）。", state_vi="Nhà cung cấp chưa được cấp tài khoản", note_vi="Khi nhà cung cấp chưa được cấp tài khoản thì hiện cảnh báo và không bấm được nút đặt hàng tạm (dữ liệu mẫu không có sản phẩm hạn tiêu thụ ngắn nào của nhà cung cấp chưa được cấp tài khoản nên xác nhận trạng thái bằng B).")
view("041", "AW_PURC_004", "追加発注（短消費期限：行を足す）", [], "/ops/purchasing/orders/M015", wait=1500, note="コードにない画面（H17）。決定は台帳 I（hong 2026-10-07）。撮影は現状の画面。", state_vi="Đặt hàng bổ sung (hạn tiêu thụ ngắn: thêm dòng)", note_vi="Màn hình chưa có trong code (H17). Quyết định theo sổ cái I (hong 2026-10-07). Chụp màn hình hiện tại.")


# ---------------------------------------------------------------- 撮影で見つからない番号の調整（状態ごとに出る項目は、その状態の画面へ移す）
def _items(lst, nos):
    return [x for x in lst if x["no"] in nos]


def _set(lst, no, **kw):
    for x in lst:
        if x["no"] == no:
            x.update(kw)


def _vw(i):
    return next(v for v in V if v["id"] == i)


_set(BANNER, "2.5", sel="-")
_set(LIST1_MID, "4.1", sel=".notice button::承認")
_set(LIST2_TABLE, "5.14", sel=".tbl tbody select[aria-label=\"請求照合\"]")
_set(DETAIL, "8.1", sel="-")
_set(DETAIL, "8.6", sel=".mbox section.sec:last-of-type")
_set(DETAIL, "8.14", sel=".mbox a::入荷登録を開く")
_set(DET_HEAD, "2", sel="-")
_set(DET_UNIT, "8.4", sel=".card.unit .unit-h button.sm::仮発注")
_set(LIST1_HEAD, "1.3", err=["S193", "E145"])
_set(LIST1_HEAD, "1.4", err=["S193", "E145"])
_set(LIST1_MID, "4.1", cond=J("発注管理の「仮発注の承認」の権限（フル権限・商品開発）。未承認のとき「仮発注を承認」、承認済のとき「承認を取り消す」を出す。", "Quyền “仮発注の承認” của 発注管理 (フル権限・商品開発). Chưa phê duyệt thì hiện “仮発注を承認”, đã phê duyệt thì hiện “承認を取り消す”."))

OPEN_FIRST = H + "await sleep(600);const b=document.querySelector('.tbl tbody td button.lnk');if(b){b.click();await sleep(800);}"
_vw("019")["items"] = _items(DETAIL, {"8", "8.2", "8.3", "8.5", "8.6", "8.7", "8.8", "8.10", "8.15"})
v020 = _vw("020")
v020["state"] = J("発注データ詳細（本発注承認済・出荷前）", "Chi tiết dữ liệu đặt hàng (đã đặt chính thức & phê duyệt, chưa xuất hàng)")
v020["note"] = J("本発注が承認済みで、まだ出荷されていない発注（見本：2026-10）。「追加発注」「代理入力：出荷報告」「発注を取り消す」が出る。数量は直せない（増やす＝追加発注・減らす＝キャンセルして出し直し）。", "Đơn đã đặt chính thức & phê duyệt, chưa xuất hàng (mẫu: 2026-10). Có 追加発注, 代理入力：出荷報告, 発注を取り消す. Không sửa được số lượng (tăng = đặt bổ sung, giảm = hủy rồi đặt lại).")
v020["setup"] = H + "await search('PO-202610-M008-U01');" + "const b=document.querySelector('.tbl tbody td button.lnk');if(b){b.click();await sleep(800);}"
v020["items"] = _items(DETAIL, {"8.4", "8.9", "8.13"})
v023 = _vw("023")
v023["items"] = _items(DETAIL, {"8.1"})
# 代理入力の小さなモーダルを開く
_vw("025")["setup"] = H + "await search('PO-202611-M008-U01');const b=document.querySelector('.tbl tbody td button.lnk');if(b){b.click();await sleep(800);}const x=btn('代理入力：納期回答');if(x){x.click();await sleep(600);}"
_vw("033")["items"] = _items(DET_HEAD, {"2"})

# 本発注を実行して「承認待ち」をつくり、その詳細を撮る（デモのデータ）
V.append({"id": "042", "code": "AW_PURC_001", "state": J("一括本発注を実行したあと（承認待ちの発注ができる）", "Sau khi chạy đặt hàng chính thức hàng loạt (có đơn chờ phê duyệt)"), "setup": H + "await sleep(800);const r=row('M011');if(r)r.querySelector('input[type=checkbox]').click();await sleep(300);btn('本発注',document.querySelector('.ph')).click();await sleep(900);btn('本発注',document.querySelector('.mbox-f')).click();await sleep(700);btn('この内容で本発注する').click();await sleep(1500);", "full": True, "url": "/ops/purchasing/orders", "wait": 1500,
          "note": J("確認画面で「この内容で本発注する」を押した直後。S193 のトースト。仕入先の画面には本発注が承認待ちで出る。", "Ngay sau khi nhấn “この内容で本発注する” ở màn xác nhận. Toast S193. Bên nhà cung cấp hiện đơn chờ phê duyệt."), "items": []})
V.append({"id": "043", "code": "AW_PURC_002", "state": J("発注データ詳細（本発注・承認待ち）", "Chi tiết dữ liệu đặt hàng (đặt chính thức, chờ phê duyệt)"), "setup": H + "await search('PO-202611-M011');const b=[...document.querySelectorAll('.tbl tbody tr')].find(t=>t.textContent.includes('承認待ち'));if(b){b.querySelector('td button.lnk').click();await sleep(800);}", "full": True, "url": "/ops/purchasing/history", "wait": 1500,
          "note": J("本発注にすると、仕入先が承認するまでの間「本発注数を直す（承認前だけ）」「代理入力：本発注の承認」が出る。", "Sau khi đặt chính thức, trong lúc nhà cung cấp chưa phê duyệt có hiện “本発注数を直す（承認前だけ）”, “代理入力：本発注の承認”."), "items": _items(DETAIL, {"8.11", "8.12"})})
V.append({"id": "044", "code": "AW_PURC_002", "state": J("発注データ詳細（出荷済・入荷前）", "Chi tiết dữ liệu đặt hàng (đã xuất hàng, chưa nhập kho)"), "setup": H + "await search('PO-202610-M008-U01');const b=document.querySelector('.tbl tbody td button.lnk');if(b){b.click();await sleep(800);}const x=btn('代理入力：出荷報告');if(x){x.click();await sleep(600);setv(document.querySelector('#s6d'),'2026-10-05');setsel(document.querySelectorAll('.mbox select')[1],'ヤマト運輸');setv(document.querySelector('#s6bb'),'2026-12-20');await sleep(200);btn('出荷報告を入力する').click();await sleep(1500);}", "full": True, "url": "/ops/purchasing/history", "wait": 1500,
          "note": J("出荷済みで、まだ入荷していない発注：「入荷登録を開く」で入荷登録へ。（撮影では代理入力の出荷報告で出荷済みにした）", "Đơn đã xuất hàng, chưa nhập kho: “入荷登録を開く” mở màn đăng ký nhập kho."), "items": _items(DETAIL, {"8.14"})})


# ---------------------------------------------------------------- 役割レビューの指摘への直し（2026-10-07）
def _x(lst, no):
    return next(x for x in lst if x["no"] == no)


def _app(x, key, ja, vi):
    x[key] = J(x[key][0] + ja, x[key][1] + vi) if key in x else J(ja, vi)


def _rep(x, key, a, b, vb):
    ja, vi = x[key]
    assert a in ja, (x["no"], a)
    x[key] = J(ja.replace(a, b), vi + vb)


NOMAIL = ("発注方法＝外部の仕入先にはメールを送らない（運営が代理で入れる：台帳 I）。", " Nhà cung cấp có phương thức đặt hàng “ngoài hệ thống” (外部) thì không gửi mail (運営 nhập hộ: 台帳 I).")
_app(_x(BULK_CONFIRM, "9.16"), "detail", *NOMAIL)
_app(_x(BULK_CONFIRM, "9.18"), "detail", *NOMAIL)
for n in ("9.4", "9.5", "9.6"):
    _app(_x(FORMS, n), "detail", *NOMAIL)
_x(BULK, "9")["detail"][0] = _x(BULK, "9")["detail"][0].replace("確認画面（No.9.15）", "確認画面（No.9.16）")

# 発注データ詳細：入荷へのつながり（資材・分納待ち・差異あり）
d814 = _x(DETAIL, "8.14")
d814["cond"] = J("入荷管理の権限。出荷済で入荷前のとき。資材の発注（出荷の報告がなく入荷は運営の手入力）・分納待ち・差異あり・対応待ちのときも出す。", "Quyền quản lý nhập kho. Khi đã xuất hàng & chưa nhập kho. Cũng hiện với đơn vật tư (資材: không có báo xuất hàng, nhập kho do 運営 nhập tay), 分納待ち và 差異あり・対応待ち.")
_app(d814, "detail", "差異あり・対応待ちのときは入荷登録で「差異の対応」を開く（この画面では対応を決めない）。", " Khi 差異あり・対応待ち thì mở “差異の対応” ở màn đăng ký nhập kho (không quyết xử lý ở màn này).")
_rep(_x(DETAIL, "8.2"), "detail", "仮発注済→納期回答済→本発注済→本発注承認済→出荷済→入荷済み", "仮発注→納期回答待ち→納期回答済→本発注→本発注の承認待ち→本発注承認済み→出荷済→入荷済（仕様 §3）", " (theo 仕様 §3: 仮発注→納期回答待ち→納期回答済→本発注→本発注の承認待ち→本発注承認済み→出荷済→入荷済み).")

# 発注データごと：入荷の状態に「分納待ち」・値の名前を仕様 §3 にそろえる
f46 = _x(LIST2_FILTER, "4.6")
f46["ja"] = "入荷の状態"
f46["vi"] = "Trạng thái nhập kho"
f46["detail"] = J("未入荷／分納待ち／差異あり・対応待ち／入荷済み で絞る（入荷登録 AW_RECV_001 の「入荷の状態」と同じ名前・同じ値）。", "Lọc theo 未入荷／分納待ち／差異あり・対応待ち／入荷済み (cùng tên, cùng giá trị với “入荷の状態” của AW_RECV_001).")
f46["demo_ok"] = J("コードは項目名「入荷状況」・値に「分納待ち」がない・「入荷済」。入荷登録とそろえる（H10）。", "Code đặt tên mục “入荷状況”, không có giá trị “分納待ち”, và dùng “入荷済”. Thống nhất với màn đăng ký nhập kho (H10).")
f45 = _x(LIST2_FILTER, "4.5")
f45["detail"] = J("納期回答待ち／納期回答済／出荷済／受注不可 で絞る。", "Lọc theo 納期回答待ち／納期回答済／出荷済／受注不可.")
r513 = _x(LIST2_TABLE, "5.13")
r513["ja"] = "入荷の状態"
r513["vi"] = "Trạng thái nhập kho"
r513["detail"] = J("未入荷／分納待ち／差異あり・対応待ち／入荷済み。入荷登録（AW_RECV_001）の状態と同じ。", "未入荷／分納待ち／差異あり・対応待ち／入荷済み. Giống trạng thái ở AW_RECV_001.")
r512 = _x(LIST2_TABLE, "5.12")
r512["detail"] = J("納期回答待ち／納期回答済／出荷済／受注不可。入荷予定日が回した便に間に合わない追加発注には「便に間に合わない」のバッジ。", "納期回答待ち／納期回答済／出荷済／受注不可. Đơn đặt bổ sung có ngày nhập kho dự kiến không kịp chuyến thì có badge “便に間に合わない”.")
for sh in ("8.3",):
    pass

# 一覧の番号と選択位置
_set(LIST1_MID, "3", sel=".notice::サイクルの発注の時期")
_set(LIST1_MID, "6", sel=".seg2 + .card .notice")
v13 = _vw("013")
v13["note"] = J("コードに画面がないので、現状の一覧を撮る（項目 11.x は画面の場所を持たない＝sel なし）。決定は台帳 I（hong 2026-10-07）。", "Code chưa có màn hình nên chụp danh sách hiện tại (các mục 11.x không có vị trí trên màn hình = không có sel). Quyết định: 台帳 I (hong 2026-10-07).")

# 小さなモーダルの項目を1つずつ
NF = [
    it("9.7", "出荷予定日（代理入力：納期回答）", "-", "date", "input", "仕入先が答えた（メール・電話・FAX）出荷予定日。", vi="Ngày xuất hàng dự kiến (nhập hộ: trả lời ngày giao)", detail_vi="Ngày xuất hàng dự kiến mà nhà cung cấp đã trả lời (mail, điện thoại, FAX).", req="○", len="日付", len_vi="Ngày", ex="2026/11/05", ex_vi="Ngày dạng YYYY/MM/DD", err=["E01"]),
    it("9.8", "回答の受け方", "-", "select", "select", "メール／電話／FAX。", vi="Cách nhận trả lời", detail_vi="Mail / điện thoại / FAX.", req="○", len="選択（メール／電話／FAX）", len_vi="Chọn (mail/điện thoại/FAX)", init="メール", init_vi="Mail", ex="電話", ex_vi="Cách nhà cung cấp đã trả lời"),
    it("9.9", "納品日（倉庫に届く日）", "-", "date", "input", "本発注の承認（代理入力）で入れる、倉庫に届く日。", vi="Ngày giao (ngày hàng tới kho)", detail_vi="Ngày hàng tới kho, nhập khi nhập hộ phê duyệt đặt hàng chính thức.", req="○", len="日付", len_vi="Ngày", ex="2026/11/06", ex_vi="Ngày dạng YYYY/MM/DD", err=["E01"]),
    it("9.10", "入荷箱数", "-", "text", "input", "本発注の承認で入れる入荷箱数。1以上。", vi="Số thùng nhập kho", detail_vi="Số thùng nhập kho nhập khi phê duyệt đặt hàng chính thức. Từ 1 trở lên.", req="○", len="整数 1〜999,999", len_vi="Số nguyên 1–999.999", ex="20", ex_vi="Số thùng", err=["E01", "E12"]),
    it("9.11", "賞味期限／消費期限（本発注の承認）", "-", "date", "input", "仕入先の承認で入れる期限（通常商品は賞味期限・短消費期限商品は消費期限）。", vi="Hạn sử dụng (phê duyệt đặt hàng chính thức)", detail_vi="Hạn do nhà cung cấp nhập khi phê duyệt (hàng thường: 賞味期限, hàng hạn ngắn: 消費期限).", req="条件付き", cond="資材以外は必須（台帳 E）。", cond_vi="Bắt buộc với hàng không phải vật tư (台帳 E).", len="日付", len_vi="Ngày", ex="2026/12/20", ex_vi="Ngày dạng YYYY/MM/DD", err=["E01"]),
    it("9.12", "出荷日", "-", "date", "input", "仕入先が出荷した日（出荷報告の代理入力）。", vi="Ngày xuất hàng", detail_vi="Ngày nhà cung cấp xuất hàng (nhập hộ báo xuất hàng).", req="○", len="日付", len_vi="Ngày", ex="2026/11/05", ex_vi="Ngày dạng YYYY/MM/DD", err=["E01"]),
    it("9.13", "配送方法", "-", "select", "select", "直送（運送会社利用）／自社配送／倉庫へ持込。前回の値を初期値にする。", vi="Phương thức giao hàng", detail_vi="Giao thẳng (dùng công ty vận chuyển) / tự giao / mang tới kho. Giá trị lần trước là mặc định.", req="○", len="選択（直送〈運送会社利用〉／自社配送／倉庫へ持込）", len_vi="Chọn (giao thẳng / tự giao / mang tới kho)", init="前回の値", init_vi="Giá trị lần trước", ex="直送（運送会社利用）", ex_vi="Phương thức đã chọn", err=["E02"], demo_ok="コードに配送方法の欄がない（H3）。", demo_ok_vi="Code chưa có ô phương thức giao hàng (H3)."),
    it("9.14", "運送会社", "-", "select", "select", "運送会社を一覧から選ぶ。前回の値を初期値にする。", vi="Công ty vận chuyển", detail_vi="Chọn công ty vận chuyển từ danh sách. Giá trị lần trước là mặc định.", req="－", cond="配送方法が直送（運送会社利用）のとき選ぶ。", cond_vi="Chọn khi phương thức giao là giao thẳng (dùng công ty vận chuyển).", len="選択", len_vi="Chọn", init="前回の値", init_vi="Giá trị lần trước", ex="ヤマト運輸", ex_vi="Tên công ty vận chuyển", open="直送のとき運送会社を必須にするか（仕様 §5-7 に書いていない）。", open_vi="Có bắt buộc chọn công ty vận chuyển khi giao thẳng không (仕様 §5-7 không ghi).", ask="hong"),
    it("9.15", "送り状番号", "-", "text", "input", "任意。形式（桁数）は見ない（台帳 I・2026-10-07）。", vi="Số vận đơn", detail_vi="Không bắt buộc. Không kiểm tra định dạng (số chữ số) (台帳 I, 2026-10-07).", req="－", len="文字列 60", len_vi="Chuỗi 60 ký tự", ex="490612345678", ex_vi="Số vận đơn", err=["E04"], demo_ok="コードは10〜12桁の数字を要求する（H14）。", demo_ok_vi="Code đang yêu cầu 10–12 chữ số (H14)."),
    it("9.16", "賞味期限／消費期限（出荷報告）", "-", "date", "input", "出荷報告で入れる期限。出荷日より後の日付。", vi="Hạn sử dụng (báo xuất hàng)", detail_vi="Hạn nhập khi báo xuất hàng. Phải sau ngày xuất hàng.", req="条件付き", cond="資材以外は必須。", cond_vi="Bắt buộc với hàng không phải vật tư.", len="日付", len_vi="Ngày", ex="2026/12/20", ex_vi="Ngày dạng YYYY/MM/DD", err=["E01", "E159"]),
    it("9.17", "本発注数（直す）", "-", "text", "input", "承認前だけ直せる本発注数。", vi="Số lượng đặt chính thức (sửa)", detail_vi="Số lượng đặt chính thức, chỉ sửa được trước khi phê duyệt.", req="○", len="整数 1〜999,999", len_vi="Số nguyên 1–999.999", init="いまの本発注数", init_vi="Số lượng đặt chính thức hiện tại", ex="120", ex_vi="Số lượng", err=["E12"]),
    it("9.18", "理由（取り消す）", "-", "text", "input", "取り消す理由。履歴に残し、仕入先にも知らせる。", vi="Lý do (hủy)", detail_vi="Lý do hủy. Lưu vào lịch sử và báo cho nhà cung cấp.", req="○", len="文字列 60", len_vi="Chuỗi 60 ký tự", ex="メニュー変更のため", ex_vi="Lý do hủy", err=["E01", "E04"]),
    it("9.19", "数量（追加発注）", "-", "text", "input", "追加発注の数量。", vi="Số lượng (đặt bổ sung)", detail_vi="Số lượng đặt bổ sung.", req="○", len="整数 1〜999,999", len_vi="Số nguyên 1–999.999", init="ロットの2倍", init_vi="2 lần lô", ex="24", ex_vi="Số lượng", err=["E12"]),
    it("9.20", "理由（追加発注）", "-", "select", "select", "締切後に承認された申込／お試し（発注締め日に間に合った分）／営業サンプルの締め後の追加／その他。", vi="Lý do (đặt bổ sung)", detail_vi="Đơn duyệt sau hạn / dùng thử (kịp ngày chốt đặt hàng) / thêm mẫu sau khi chốt / khác.", req="○", len="選択", len_vi="Chọn", init="締切後に承認された申込", init_vi="Đơn duyệt sau hạn chốt", ex="その他", ex_vi="Lý do chọn", err=["E02"]),
]
_vw("025")["items"] = _vw("025")["items"] + NF


# ---------------------------------------------------------------- コードに反映したあとの直し（2026-10-08・台帳 I）
def _pop(lst, *nos):
    for n_ in nos:
        _x(lst, n_).pop("demo_ok", None)


def _noerr(x, code):
    x["err"] = [e for e in x.get("err", []) if e != code]


# 一括・商品追加・状態名・配送方法などはコードに反映済み
_pop(LIST1_HEAD, "1.3", "1.4", "1.5")
_pop(LIST1_TABLE, "8.1", "8.3")
_pop(BULK, "9.12", "9.13")
_vw("005")["items"] = [x for x in _vw("005")["items"] if x["no"] != "9.13"]
_vw("010")["items"] = _items(BULK, {"9.13"})
_pop(LIST2_FILTER, "4.3", "4.5", "4.6")
_pop(LIST2_TABLE, "5.10")
_pop(DETAIL, "8.14")
for _n in ("9.3", "9.13", "9.15"):
    _x(FORMS if _n == "9.3" else NF, _n).pop("demo_ok", None)
for _x_ in (_x(LIST1_HEAD, "1.3"), _x(LIST1_HEAD, "1.4")):
    _noerr(_x_, "E145")
_noerr(_x(DET_HEAD, "1.2"), "E145")
_noerr(_x(DET_UNIT, "7.5"), "E145")
_noerr(_x(DET_UNIT, "8.4"), "E145")
_noerr(_x(SH, "8.11"), "E145")
_x(DET_UNIT, "7.5")["cond"] = J("発注管理の「発注の作成」の権限。", "Quyền “tạo đặt hàng” của 発注管理.")
_x(DET_UNIT, "8.4")["cond"] = J("発注管理の権限。", "Quyền của 発注管理.")
_x(SH, "8.11")["cond"] = J("発注管理の「発注の作成」の権限。", "Quyền “tạo đặt hàng” của 発注管理.")
_x(LIST2_FILTER, "4.6")["detail"] = J("未入荷／分納待ち／差異あり・対応待ち／入荷済み で絞る（入荷登録 AW_RECV_001 の「入荷の状態」と同じ名前・同じ値。画面の表示は仕様 §3 の名前）。", "Lọc theo 未入荷／分納待ち／差異あり・対応待ち／入荷済み (cùng tên, cùng giá trị với “入荷の状態” của AW_RECV_001; hiển thị theo tên trong 仕様 §3).")
_x(LIST2_TABLE, "5.14")["init"] = J("未照合（入荷済みでも自動で照合済にしない）", "未照合 (không tự động đặt 照合済 kể cả khi đã nhập kho)")
_x(LIST2_TABLE, "5.14")["cond"] = J("変えられるのは、発注管理の編集ができる役割（フル権限・商品開発）と経理（請求照合だけ。機能「発注管理：請求照合」）。ほかの役割は見るだけ。不良控除の行は「—」。変えた人・日時・変更前後を詳細の「請求照合の変更履歴」に残す。", "Người đổi được: vai trò sửa được 発注管理 (フル権限・商品開発) và 経理 (chỉ 請求照合; chức năng “発注管理：請求照合”). Vai trò khác chỉ xem. Dòng 不良控除 là “—”. Người đổi, thời điểm, trước/sau được lưu ở “請求照合の変更履歴” trong chi tiết.")

# 仕入先未発行：運営が発注し、回答・承認・出荷報告は運営が代理入力する
_x(DET_HEAD, "4")["detail"] = J("品番・商品名・仕入時の商品名・カテゴリ・保管方法・仕入先・仕入単価（税抜）・発注ロット（個／箱）・メニュー年月・納品サイクル（A1〜D7・28日間）・オーダー締切。仕入先が未発行（仕入先Webのアカウントなし）のときは案内を出す（回答・本発注の承認・出荷報告はメール・電話などシステム外で受けて運営が代理入力する。発注はシステムでできる）。", "Mã hàng, tên sản phẩm, tên khi nhập hàng, danh mục, cách bảo quản, nhà cung cấp, đơn giá nhập (chưa thuế), lô đặt hàng (cái/thùng), tháng menu, chu kỳ giao (A1〜D7, 28 ngày), hạn chốt đơn. Nếu nhà cung cấp chưa được cấp tài khoản (không có tài khoản Web nhà cung cấp) thì hiện hướng dẫn (trả lời, phê duyệt đặt hàng chính thức, báo xuất hàng nhận qua mail/điện thoại ngoài hệ thống rồi 運営 nhập hộ; vẫn đặt hàng được trên hệ thống).")
v009 = _vw("009")
v009["state"] = J("仕入先未発行の商品を含む（対象から外さない）", "Có sản phẩm của nhà cung cấp chưa được cấp tài khoản (không loại khỏi đối tượng)")
v009["items"] = []
v009["note"] = J("仕入先が未発行の商品も一括仮発注・本発注の対象（運営が発注し、回答・承認・出荷報告は運営が代理入力する：台帳 I・2026-10-08）。警告は出さない。", "Sản phẩm của nhà cung cấp chưa được cấp tài khoản cũng là đối tượng đặt hàng tạm/chính thức hàng loạt (運営 đặt hàng, trả lời/phê duyệt/báo xuất hàng do 運営 nhập hộ: 台帳 I 2026-10-08). Không hiện cảnh báo.")
_vw("032")["state"] = J("仕入先未発行（案内あり・発注はできる）", "Nhà cung cấp chưa được cấp tài khoản (có hướng dẫn, vẫn đặt hàng được)")
_vw("032")["note"] = J("仕入先が未発行：案内を出す。仮発注・本発注はできる（回答・承認・出荷報告は運営が代理入力）。", "Nhà cung cấp chưa được cấp tài khoản: hiện hướng dẫn. Vẫn đặt hàng tạm/chính thức được (trả lời, phê duyệt, báo xuất hàng do 運営 nhập hộ).")
_vw("040")["state"] = J("仕入先未発行（案内あり・発注はできる）", "Nhà cung cấp chưa được cấp tài khoản (có hướng dẫn, vẫn đặt hàng được)")
_vw("040")["note"] = J("見本の M022（ほうじ茶ラテ・仕入先 SP00008 未発行）。状態は 003 の 032 と同じ扱い。", "Mẫu M022 (ほうじ茶ラテ, nhà cung cấp SP00008 chưa được cấp tài khoản). Xử lý giống 032 của AW_PURC_003.")

# 商品追加（モーダル）
_vw("013")["setup"] = H + "await sleep(800);btn('商品追加',document.querySelector('.ph')).click();await sleep(700);"
_vw("013")["note"] = J("メニューにない商品を仮発注として足す。資材は選べない。足した商品は一覧に「メニュー外」の印つきで出る。", "Thêm sản phẩm không có trong menu dưới dạng đặt hàng tạm. Không chọn được vật tư (資材). Sản phẩm thêm hiện trong danh sách với dấu “メニュー外”.")
_vw("013")["items"] = [
    it("11", "商品追加（モーダル）", ".mbox", "modal", "show", "メニューにない商品を、選んだ月の発注に仮発注として足す。資材は足せない（資材発注から）。足した商品は一覧に「メニュー外」の印つきで出る。代替品の不足分の追加発注は自動で一覧に出る（この操作は使わない）。", vi="Thêm sản phẩm (modal)", detail_vi="Thêm sản phẩm không có trong menu vào đặt hàng của tháng đã chọn dưới dạng đặt hàng tạm. Không thêm được vật tư (dùng màn đặt hàng vật tư). Sản phẩm thêm hiện trong danh sách với dấu “メニュー外”. Đặt hàng bổ sung cho phần thiếu của hàng thay thế tự hiện trong danh sách (không dùng thao tác này).", cond="発注管理の「発注の作成」の権限", cond_vi="Quyền “tạo đặt hàng” của 発注管理", pattern="P-MODAL-SAVE"),
    it("11.1", "商品", ".mbox select[aria-label=\"商品\"]", "select", "select", "商品マスタの商品のうち、選んだ月のメニューにない商品（資材を除く）。", vi="Sản phẩm", detail_vi="Sản phẩm trong danh mục sản phẩm mà menu tháng đã chọn không có (trừ vật tư).", req="○", len="選択", len_vi="Chọn", init="選択…", init_vi="Chọn…", ex="鶏の唐揚げ（M025・短消費期限）", ex_vi="Sản phẩm chọn", err=["E02"]),
    it("11.2", "納入倉庫", ".mbox select[aria-label=\"納入倉庫\"]", "select", "select", "納入するピッキング倉庫。", vi="Kho nhận hàng", detail_vi="Kho lấy hàng nhận hàng.", req="○", len="選択", len_vi="Chọn", init="選択…", init_vi="Chọn…", ex="関東倉庫", ex_vi="Tên kho", err=["E02"]),
    it("11.3", "顧客納品日", ".mbox select[aria-label=\"顧客納品日\"]", "select", "select", "お客様への納品日（A1〜D7）。選ぶと、入荷希望日（3日前）と希望の期限（通常＝30日後、短消費期限＝保証日数後）の初期値が入る。", vi="Ngày giao khách", detail_vi="Ngày giao cho khách (A1〜D7). Khi chọn, ngày nhập kho mong muốn (trước 3 ngày) và hạn mong muốn (hàng thường = sau 30 ngày, hạn ngắn = sau số ngày bảo đảm) được điền sẵn.", req="○", len="選択（A1〜D7）", len_vi="Chọn (A1〜D7)", init="選択…", init_vi="Chọn…", ex="A3（11/11）", ex_vi="Ngày giao", err=["E02"]),
    it("11.4", "数量", ".mbox input[aria-label=\"数量\"]", "text", "input", "1以上の整数（上限 999,999）。通常商品はロット（箱）単位に切り上げる。", vi="Số lượng", detail_vi="Số nguyên từ 1 (tối đa 999.999). Hàng thường được làm tròn lên theo lô (thùng).", req="○", len="整数 1〜999,999", len_vi="Số nguyên 1–999.999", init="空欄", init_vi="Để trống", ex="24", ex_vi="Số lượng", err=["E12"]),
    it("11.5", "入荷希望日", ".mbox .fld::入荷希望日", "date", "input", "仕入先に伝える入荷の希望日。", vi="Ngày nhập kho mong muốn", detail_vi="Ngày nhập kho mong muốn gửi cho nhà cung cấp.", req="○", len="日付", len_vi="Ngày", ex="2026/11/07", ex_vi="Ngày dạng YYYY/MM/DD", err=["E01"]),
    it("11.6", "希望賞味期限／希望消費期限", ".mbox .fld::希望賞味期限", "date", "input", "通常商品は希望賞味期限、短消費期限商品は希望消費期限。短消費期限は顧客納品日からの日数が保証日数以上であること（足りなければエラー）。", vi="Hạn mong muốn (賞味期限／消費期限)", detail_vi="Hàng thường: 希望賞味期限; hàng hạn ngắn: 希望消費期限. Hàng hạn ngắn phải đủ số ngày bảo đảm kể từ ngày giao khách (thiếu thì báo lỗi).", req="○", len="日付", len_vi="Ngày", ex="2026/12/20", ex_vi="Ngày dạng YYYY/MM/DD", err=["E01"]),
    it("11.7", "理由", ".mbox select[aria-label=\"理由\"]", "select", "select", "代替品／営業サンプルの追加／その他。", vi="Lý do", detail_vi="Hàng thay thế / thêm mẫu bán hàng / khác.", req="－", len="選択", len_vi="Chọn", init="その他", init_vi="Khác", ex="営業サンプルの追加", ex_vi="Lý do chọn"),
    it("11.8", "追加", ".mbox .mbox-f button.pri", "button", "click", "仮発注を作り、仕入先に納期回答を依頼する。トースト「商品を追加しました（発注番号）」。", vi="Thêm", detail_vi="Tạo đặt hàng tạm và nhờ nhà cung cấp trả lời ngày giao. Toast “商品を追加しました (mã đơn)”.", err=["S127"]),
]
# 短消費期限商品の追加発注（行を足す）
_x(SH, "9").update({"sel": ".pobar button::追加発注（行を足す）", "kind": "button", "trig": "click"})
_x(SH, "9").pop("demo_ok", None)
v041 = _vw("041")
v041["state"] = J("追加発注（短消費期限：行を足す）", "Đặt hàng bổ sung (hạn tiêu thụ ngắn: thêm dòng)")
v041["note"] = J("「追加発注（行を足す）」を押すとモーダルが開く。行（倉庫×顧客納品日）を足して、新しい発注データ（本発注）を作る。", "Nhấn “追加発注（行を足す）” sẽ mở modal. Thêm một dòng (kho × ngày giao khách) và tạo dữ liệu đặt hàng mới (đặt hàng chính thức).")
v041["setup"] = H + "await sleep(800);const b=btn('追加発注（行を足す）');if(b){b.click();await sleep(700);}"
v041["items"] = [
    it("9.1", "追加発注（行を足す）（モーダル）", ".mbox", "modal", "show", "オーダー締切の後に増えた分を、行（倉庫×顧客納品日）として足す。新しい発注データ（本発注）を作り、仕入先に納期回答と本発注の承認を依頼する。", vi="Đặt hàng bổ sung (thêm dòng) (modal)", detail_vi="Thêm phần tăng sau hạn chốt thành một dòng (kho × ngày giao khách). Tạo dữ liệu đặt hàng chính thức mới và nhờ nhà cung cấp trả lời ngày giao + phê duyệt.", pattern="P-MODAL-SAVE"),
    it("9.2", "納入倉庫", ".mbox select[aria-label=\"納入倉庫\"]", "select", "select", "納入倉庫。", vi="Kho nhận hàng", detail_vi="Kho nhận hàng.", req="○", len="選択", len_vi="Chọn", init="選択…", init_vi="Chọn…", ex="関東倉庫", ex_vi="Tên kho", err=["E02"]),
    it("9.3", "顧客納品日", ".mbox select[aria-label=\"顧客納品日\"]", "select", "select", "お客様への納品日（A1〜D7）。選ぶと入荷希望日（3日前）と希望消費期限（保証日数後）が入る。", vi="Ngày giao khách", detail_vi="Ngày giao cho khách (A1〜D7). Khi chọn thì điền sẵn ngày nhập kho mong muốn (trước 3 ngày) và hạn tiêu thụ mong muốn (sau số ngày bảo đảm).", req="○", len="選択（A1〜D7）", len_vi="Chọn (A1〜D7)", init="選択…", init_vi="Chọn…", ex="B2（11/17）", ex_vi="Ngày giao", err=["E02"]),
    it("9.4", "数量", ".mbox input[aria-label=\"数量\"]", "text", "input", "1以上の整数（上限 999,999）。", vi="Số lượng", detail_vi="Số nguyên từ 1 (tối đa 999.999).", req="○", len="整数 1〜999,999", len_vi="Số nguyên 1–999.999", init="空欄", init_vi="Để trống", ex="7", ex_vi="Số lượng", err=["E12"]),
    it("9.5", "入荷希望日", ".mbox .fld::入荷希望日", "date", "input", "仕入先に伝える入荷の希望日。", vi="Ngày nhập kho mong muốn", detail_vi="Ngày nhập kho mong muốn gửi cho nhà cung cấp.", req="○", len="日付", len_vi="Ngày", ex="2026/11/14", ex_vi="Ngày dạng YYYY/MM/DD", err=["E01"]),
    it("9.6", "希望消費期限", ".mbox .fld::希望消費期限", "date", "input", "顧客納品日からの日数が保証日数以上であること。足りなければエラー（通常の行と同じ）。", vi="Hạn tiêu thụ mong muốn", detail_vi="Số ngày kể từ ngày giao khách phải bằng hoặc lớn hơn số ngày bảo đảm. Thiếu thì báo lỗi (giống dòng thường).", req="○", len="日付", len_vi="Ngày", ex="2026/11/22", ex_vi="Ngày dạng YYYY/MM/DD", err=["E01"]),
    it("9.7", "理由", ".mbox select[aria-label=\"理由\"]", "select", "select", "締切後に承認された申込／お試し（発注締め日に間に合った分）／営業サンプルの締め後の追加／その他。", vi="Lý do", detail_vi="Đơn duyệt sau hạn / dùng thử (kịp ngày chốt đặt hàng) / thêm mẫu sau khi chốt / khác.", req="○", len="選択", len_vi="Chọn", init="締切後に承認された申込", init_vi="Đơn duyệt sau hạn chốt", ex="その他", ex_vi="Lý do chọn"),
    it("9.8", "追加発注する", ".mbox .mbox-f button.pri", "button", "click", "新しい発注データ（本発注）を作る。トースト「追加発注しました（発注番号）」。", vi="Đặt hàng bổ sung", detail_vi="Tạo dữ liệu đặt hàng chính thức mới. Toast “追加発注しました (mã đơn)”.", err=["S127"]),
]
# 請求照合の変更履歴（発注データ詳細）
V.append({"id": "045", "code": "AW_PURC_002", "state": J("発注データ詳細（請求照合の変更履歴）", "Chi tiết dữ liệu đặt hàng (lịch sử đổi 請求照合)"),
          "setup": H + "await sleep(1000);const s=document.querySelector('.tbl tbody select[aria-label=\"請求照合\"]');if(s){setsel(s,'照合済');await sleep(800);}const b=document.querySelector('.tbl tbody td button.lnk');if(b){b.click();await sleep(900);}",
          "full": True, "url": "/ops/purchasing/history", "wait": 1500,
          "note": J("請求照合を変えると、変えた人・日時・変更前後が詳細の「請求照合の変更履歴」に残る（新しいものが上）。", "Khi đổi 請求照合, người đổi, thời điểm, trước/sau được lưu ở “請求照合の変更履歴” trong chi tiết (mới nhất ở trên)."),
          "items": [it("8.16", "請求照合の変更履歴", ".mbox section.sec::請求照合の変更履歴", "area", "view", "日時・変更した人・変更前・変更後。変えるたびに1行。直せない・消せない。", vi="Lịch sử đổi 請求照合", detail_vi="Thời điểm, người đổi, trước, sau. Mỗi lần đổi một dòng. Không sửa/xóa được.", pattern="P-HIST", cond="請求照合を1回以上変えたとき", cond_vi="Khi 請求照合 đã được đổi ít nhất 1 lần")]})


# ---------------------------------------------------------------- 2026-10-08：変更履歴タブ・入荷の回ごとの記録・2画面・短消費期限の発注番号
_x(DET_HEAD, "3.3").update({"ja": "区分のバッジ", "vi": "Badge loại sản phẩm"})
_x(DET_HEAD, "3.3")["detail"] = J("この画面の区分：「通常商品」（発注単位ごとに発注）。短消費期限商品は別の画面（AW_PURC_004）で、バッジは「短消費期限商品」。", "Loại của màn hình này: “通常商品” (đặt hàng theo đơn vị đặt hàng). Sản phẩm hạn tiêu thụ ngắn dùng màn khác (AW_PURC_004), badge là “短消費期限商品”.")
d86 = _x(DETAIL, "8.6")
d86["detail"] = J("入荷日・入荷数・入荷倉庫。入荷の記録があれば、回ごとの表（回・入荷日・予定の数・入荷した数・箱数・賞味期限／消費期限・状態〔一致／差異あり・対応待ち／対応済〕・差異の対応〔分納を待つ／代替品／不足を受け入れる／多い分を受け入れる〕）を出す。", "Ngày nhập kho, số lượng nhập kho, kho nhập. Nếu có bản ghi nhập kho thì hiện bảng theo từng lần (lần, ngày nhập, số lượng dự kiến, số lượng nhập, số thùng, hạn sử dụng, trạng thái [khớp / chênh lệch chờ xử lý / đã xử lý], cách xử lý chênh lệch).")
d86.pop("demo_ok", None)
d87 = _x(DETAIL, "8.7")
d87.update({"ja": "変更履歴（タブ）", "sel": ".mbox .tabs button::変更履歴", "kind": "tab"})
d87["detail"] = J("「詳細」と「変更履歴」のタブ。変更履歴は、数量を直した・キャンセルした・追加した・請求照合を変えたことを、日時・操作した人・内容で残す（新しいものが上。直せない・消せない）。", "Tab “詳細” và “変更履歴”. Lịch sử thay đổi lưu việc sửa số lượng, hủy, đặt bổ sung, đổi 請求照合 theo thời điểm, người thao tác, nội dung (mới nhất ở trên, không sửa/xóa được).")
d87.pop("demo_ok", None)
V.append({"id": "046", "code": "AW_PURC_002", "state": J("発注データ詳細（変更履歴タブ）", "Chi tiết dữ liệu đặt hàng (tab 変更履歴)"),
          "setup": H + "await search('PO-202610-M008-U01');const b=document.querySelector('.tbl tbody td button.lnk');if(b){b.click();await sleep(900);}const t=btn('変更履歴',document.querySelector('.mbox'));if(t){t.click();await sleep(500);}",
          "full": True, "url": "/ops/purchasing/history", "wait": 1500,
          "note": J("「変更履歴」のタブ：日時・操作した人・操作の一覧。発注した・数量を直した・取り消した・請求照合を変えたなどが新しい順に並ぶ。", "Tab “変更履歴”: danh sách thời điểm, người thao tác, nội dung. Các việc đặt hàng, sửa số lượng, hủy, đổi 請求照合… theo thứ tự mới nhất trước."),
          "items": [it("8.17", "変更履歴の表", ".mbox .tbl", "table", "view", "日時・操作した人・操作。請求照合の変更も同じ表に並べる。", vi="Bảng lịch sử thay đổi", detail_vi="Thời điểm, người thao tác, nội dung. Việc đổi 請求照合 cũng nằm trong cùng bảng.", pattern="P-HIST")]})
# 発注番号（短消費期限）
_x(SH, "8").update({"detail": J("1倉庫 × 1顧客納品日＝1発注データ（行）。見出しに行ごとの発注番号の形（PO-YYYYMM-品番-倉庫記号＋Slot）と保証期限（日厳守）。エラーの行は本発注できない。", "1 kho × 1 ngày giao khách = 1 dữ liệu đặt hàng (dòng). Tiêu đề hiện dạng mã đơn của từng dòng (PO-YYYYMM-mã hàng-ký hiệu kho+Slot) và hạn bảo đảm (nghiêm ngặt theo ngày). Dòng lỗi không đặt hàng chính thức được.")})


# ---------------------------------------------------------------- 2026-10-08：hong レビュー（通知を小さく・データリセットを外す・詳細は画面・仮発注にも +3 +5 +10）
V[:] = [v for v in V if v["id"] not in ("029", "039")]
for _v in V:
    _v["items"] = [x for x in _v["items"] if x.get("ja") != "データリセット"]
for _dd in DECISIONS:
    if _dd["target"] == "AW_PURC_003 区切り・データリセット・発注済データ確認":
        _dd["a"] = J("区切り3つ・発注済データ確認は残して設計書に書く。データリセットのボタンは外す（hong 2026-10-08）", "Giữ 3 kiểu chia và modal 発注済データ確認 và ghi vào tài liệu thiết kế. Bỏ nút データリセット (hong 2026-10-08)")
for _dd in DECISIONS:
    if "発注済データ確認" in _dd["target"] and "データリセット" in _dd["target"]:
        _dd["target"] = "AW_PURC_003 区切り・発注済データ確認（データリセットは外した）"

# 003：選べる行（短消費期限商品は選べない）のチェックを入れる
_vw("003")["setup"] = _vw("003")["setup"].replace("const c=document.querySelectorAll('.tbl tbody tr input[type=checkbox]');", "const c=document.querySelectorAll('.tbl tbody tr input[type=checkbox]:not([disabled])');")

# 通知は1行ずつ小さく
for _x in BANNER:
    if _x["no"] == "2":
        _x["detail"] = J("仕入先からの通知を、発注一覧の上に1行ずつ小さく並べる（長い文は … で切る）。新しい通知がなければ「新しい通知はありません。」。決まりの1行（数量を直せるのは承認まで・分納は3回まで・追加発注・メールの扱い）は「発注の決まり」を開くと出る（初めは閉じている：hong 2026-10-08）。", "Hiển thị các thông báo từ nhà cung cấp, mỗi thông báo một dòng nhỏ phía trên danh sách đặt hàng (câu dài bị cắt bằng …). Nếu không có thông báo mới thì hiện “新しい通知はありません。”. Dòng quy tắc (chỉ sửa được số lượng đến khi được duyệt, giao từng phần tối đa 3 lần, đặt hàng bổ sung, cách xử lý email) hiện khi mở “発注の決まり” (ban đầu đóng: hong 2026-10-08).")

# 一括の仮発注にも +3 +5 +10（hong 2026-10-08）
for _x in V[0]["items"] if False else []:
    pass
for _v in V:
    for _x in _v["items"]:
        if _x["no"] == "9.12" and _x.get("ja", "").startswith("仮発注数"):
            _x["detail"] = J(_x["detail"][0] + "仮発注・本発注とも、数量欄の下の「+3」「+5」「+10」で、いまの数に足せる（まとめて足せる：hong 2026-10-08）。", _x["detail"][1] + " Cả đặt hàng tạm lẫn chính thức đều có thể cộng thêm vào số hiện tại bằng “+3”, “+5”, “+10” dưới ô số lượng (cộng gộp: hong 2026-10-08).")

# 商品追加：顧客納品日の説明
for _v in V:
    for _x in _v["items"]:
        if _x["no"] == "11.3" and _x.get("ja") == "顧客納品日":
            _x["ja"], _x["vi"] = "お客様への納品日", "Ngày giao cho khách"
            _x["detail"] = J("お客様への納品日（A1〜D7）。ここで足すのは仮発注（本発注は一覧の「本発注」で行う）。選ぶと、入荷希望日（3日前）と希望の期限（通常＝30日後、短消費期限＝保証日数後）の初期値が入る。", "Ngày giao cho khách (A1〜D7). Thứ được thêm ở đây là đặt hàng tạm (đặt hàng chính thức thực hiện bằng “本発注” trên danh sách). Khi chọn, giá trị ban đầu của ngày nhập kho mong muốn (3 ngày trước) và hạn mong muốn (thường = sau 30 ngày, hạn tiêu thụ ngắn = sau số ngày bảo đảm) được điền.")

# 発注データ詳細は画面（モーダルではない）
for _v in V:
    if _v["code"] != "AW_PURC_002":
        continue
    _v["setup"] = _v.get("setup", "").replace("document.querySelector('.mbox')", "document")
    if _v["id"] in ("015", "019", "020", "021", "022", "023", "024", "025", "043", "044", "045", "046"):
        _v["wait"] = max(_v.get("wait", 0), 1800)
    for _x in _v["items"]:
        if _x["no"].split(".")[0] == "8":
            _x["sel"] = _x["sel"].replace(".mbox", ".card") if _x["sel"] not in ("-",) else "-"
            if _x["no"] == "8":
                _x["ja"] = "発注データ詳細（画面）"
                _x["vi"] = "Chi tiết dữ liệu đặt hàng (màn hình)"
                _x["kind"], _x["trig"] = "area", "view"
                _x["detail"] = J("発注・入荷履歴の発注番号から開く画面（モーダルではない：hong 2026-10-08）。発注データ1件の状態と、仕入先の回答・本発注の承認・入荷状況。下のボタンは状態と権限で出し分ける。「履歴へ戻る」で一覧に戻る。", "Màn hình mở từ mã đơn đặt hàng trong lịch sử đặt hàng・nhập kho (không phải modal: hong 2026-10-08). Trạng thái của 1 dữ liệu đặt hàng, phản hồi của nhà cung cấp・duyệt đặt hàng chính thức・tình trạng nhập kho. Các nút bên dưới hiển thị tùy trạng thái và quyền. Nhấn “履歴へ戻る” để về danh sách.")
            if _x["no"] == "8.15":
                _x["ja"], _x["vi"] = "履歴へ戻る", "Quay lại lịch sử"
                _x["sel"] = ".card button::履歴へ戻る"
                _x["detail"] = J("発注・入荷履歴の一覧へ戻る。", "Quay về danh sách lịch sử đặt hàng・nhập kho.")
                _x["detail_vi"] = "Quay về danh sách lịch sử đặt hàng・nhập kho."
        for _k in ("detail", "state"):
            pass
for _v in V:
    for _x in _v["items"]:
        if _x["no"] in ("5.1", "5.15") and "（モーダル" in _x.get("detail", ["", ""])[0]:
            _x["detail"] = J(_x["detail"][0].replace("発注データ詳細（モーダル No.8）", "発注データ詳細（画面 No.8）").replace("発注データ詳細（モーダル）を開く", "発注データ詳細（画面）を開く"), _x["detail"][1].replace("modal No.8", "màn hình No.8").replace("modal", "màn hình"))

# 商品の基本情報は1つの帯にまとめた（画面がうるさくならないように：hong 2026-10-08）
for _v in V:
    for _x in _v["items"]:
        if _x["no"] == "4" and _x.get("ja") == "共通商品基本情報":
            _x["sel"], _x["ja"], _x["vi"], _x["kind"] = ".pinfo", "商品の基本情報（1つの帯）", "Thông tin cơ bản của sản phẩm (một dải)", "label"
            _x["detail"] = J("品番・仕入時の商品名・カテゴリ／保管方法・仕入先・仕入単価（税抜）・ロット・" + ("消費期限保証日数（製造後の消費期限）" if _v["code"] == "AW_PURC_004" else "オーダー締切") + "を、1つの帯に並べる（枠の数を減らす：hong 2026-10-08）。", "Hiển thị mã sản phẩm・tên sản phẩm lúc nhập hàng・danh mục／cách bảo quản・nhà cung cấp・đơn giá nhập (chưa thuế)・lô・" + ("số ngày bảo đảm hạn tiêu thụ (hạn tiêu thụ sau sản xuất)" if _v["code"] == "AW_PURC_004" else "hạn chốt đơn hàng") + " trong một dải (giảm số khung: hong 2026-10-08).")

VIEWS = V
