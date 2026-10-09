# -*- coding: utf-8 -*-
"""
画面設計書のデータ：運営管理者Web ＞ 発注・入荷 ＞ 入荷登録（一覧・CSV取込）（AW_RECV）
元は本物の Web（このリポジトリ app/ops/purchasing/receiving、_components/receipts.tsx、lib/csv/data.ts の receiving）。
決定は docs/決定台帳.md（I「入荷の記録と差異」「入荷登録の入力の初期値」ほか）が正。
洗い出し・確認の記録は docs/05_画面設計書/確認メモ_AW_運営C1_発注・入荷.md（回答 2026-10-07）。

画面：AW_RECV_001 入荷登録（一覧・差異の対応）／002 入荷登録 CSV取込（画面コード規約 2026-10-05：Feature 4文字＝RECV）
見本のデータ（今日＝2026-10-05）：未入荷 152・差異あり・対応待ち 1・分納待ち 0・入荷済 179

コードと決定が違うところ（demo_ok＝決定が正・コードを直す宿題。確認メモ §3）：
  ・入荷日の初期値＝運営が発注で入れた入荷希望日（コードは今日）。賞味期限／消費期限の初期値＝発注で入れた希望の期限（コードは仕入先が承認で入れた期限）（H13）
  ・「予定どおり入荷」のボタンは置かない（H13）
  ・「未適用」の印を外す（H4）
  ・メモの文字数は 60（CSV は 200・H8）／数・箱数の上限 999,999（H7）
"""

TITLE = ["入荷登録（AW_RECV）", "Đăng ký nhập kho (AW_RECV)"]
SHEET = ["入荷登録", "Đăng ký nhập kho"]
BASENAME = "画面設計書_AW_RECV_入荷登録"
IMG_PREFIX = "AW_RECV"
OUT_DIR = "AW_RECV_入荷登録"
CODE_NOTE = ["画面コードは規約 <Module(2)>_<Feature(4)>_<Seq(3)>。AW＝運営管理者Web、RECV＝入荷登録（発注の画面は AW_PURC）",
             "Mã màn hình theo quy ước <Module(2)>_<Feature(4)>_<Seq(3)>. AW = Admin Web, RECV = Đăng ký nhập kho (màn đặt hàng là AW_PURC)"]
SITE = "ops"
SYSTEM = {"ja": "運営管理者Web", "vi": "Web quản trị vận hành"}
AUTHOR = "Claude（cloud）／確認：hong"
CREATED = "2026-10-07"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "ops", "loginId": "Ad00010"}   # フル権限（ops.full）
CODE_PATHS = ["app/ops/purchasing", "lib/ops/purchasing", "lib/domain/stock.ts", "lib/domain/areas/stock.ts", "lib/csv", "lib/domain/seed", "app/ops/_ui"]

def J(ja, vi=""):
    return [ja, vi]

DECISIONS = [
    {"date": "2026-10-07", "target": "AW_RECV_001 No.5.10・5.11",
     "q": J("入荷日・賞味期限／消費期限の初期値", "Giá trị mặc định của 入荷日 và 賞味期限／消費期限"),
     "a": J("運営（システム管理）が発注（仮発注・本発注）で入れた入荷希望日・希望の期限を初期値にして、編集できる。「予定どおり入荷」のボタンは置かない。資材以外は期限が必須", "Lấy ngày nhập kho mong muốn và hạn mong muốn mà quản trị vận hành (quản trị hệ thống) nhập khi đặt hàng (đặt hàng tạm・đặt hàng chính thức) làm giá trị ban đầu, có thể sửa. Không có nút “予定どおり入荷”. Ngoài vật tư thì bắt buộc có hạn"),
     "src": "hong 回答 2026-10-07（確認メモ C1 Q5・Q6）・台帳 I「入荷登録の入力の初期値」・受付簿 No.338"},
    {"date": "2026-10-07", "target": "AW_RECV_001 差異の対応",
     "q": J("予定より多く入荷したとき", "Khi nhập nhiều hơn dự kiến"),
     "a": J("「多い分を受け入れる」だけ（発注を閉じ、多い分は倉庫在庫になる）。不足のときの3つの対応は変えない", "Chỉ có “多い分を受け入れる” (đóng đơn đặt hàng, phần nhiều hơn thành tồn kho của kho). 3 cách xử lý khi thiếu không đổi"),
     "src": "hong 回答 2026-10-07（確認メモ C1 Q4）・台帳 I・受付簿 No.339"},
    {"date": "2026-10-07", "target": "AW_RECV_001 差異の対応（法人への連絡）",
     "q": J("「不足を受け入れる」のとき法人へ知らせるか", "Có thông báo cho pháp nhân khi 不足を受け入れる không"),
     "a": J("知らせる：代替品の「お客様への知らせ」（メール X17＋法人Web のお知らせ。既定で送る・運営が外せる・該当の商品を注文した拠点だけ）を使う", "Có thông báo: dùng “thông báo cho khách hàng” của hàng thay thế (email X17 + thông báo trên Web pháp nhân. Mặc định gửi, quản trị vận hành có thể bỏ chọn, chỉ gửi cho chi nhánh đã đặt sản phẩm tương ứng)"),
     "src": "hong 回答 2026-10-07（確認メモ C1 O5）・台帳 I"},
    {"date": "2026-10-07", "target": "AW_RECV_001 No.1.3",
     "q": J("入荷指示 CSV（THOMAS）の列", "Cột của CSV 入荷指示 (THOMAS)"),
     "a": J("フェーズ1 の出力と同じ列にする。hong が CSV の format をあとで提供する（それまで列の定義は open）", "Dùng các cột giống đầu ra của Giai đoạn 1. hong sẽ cung cấp format CSV sau (cho đến lúc đó định nghĩa cột vẫn là open)"),
     "src": "hong 回答 2026-10-07（確認メモ C1 O4）"},
    {"date": "2026-10-07", "target": "AW_RECV_001 一覧の並び",
     "q": J("一覧の初期の並び", "Thứ tự ban đầu của danh sách"),
     "a": J("入荷予定日の昇順 → 発注番号の昇順", "Ngày nhập kho dự kiến tăng dần → mã đơn đặt hàng tăng dần"), "src": "hong 回答 2026-10-07（確認メモ C1 Q10・提案どおり）"},
    {"date": "2026-10-07", "target": "権限",
     "q": J("だれが入荷を登録・差異の対応をできるか", "Ai đăng ký nhập kho và xử lý chênh lệch được"),
     "a": J("権限表の「入荷管理」：フル権限・商品開発＝CRUD、そのほか＝R、倉庫スタッフ＝R/U（入荷の登録・差異の対応ができる）", "“Quản lý nhập kho” trong bảng quyền: toàn quyền・phát triển sản phẩm = CRUD, còn lại = R, nhân viên kho = R/U (đăng ký nhập kho・xử lý chênh lệch được)"),
     "src": "運営Web_権限表_20261003（入荷管理）・台帳 I"},
    {"date": "2026-10-07", "target": "画面コード",
     "q": J("画面コード", "Mã màn hình"),
     "a": J("AW_RECV_001〜002（Feature は 4 文字。並列実行計画の仮の AW_RECV を確定）", "AW_RECV_001〜002 (Feature gồm 4 ký tự. Xác định chính thức AW_RECV tạm trong kế hoạch chạy song song)"), "src": "確認メモ C1 §0"},
]
CHANGES = []

HIDE_ALWAYS = [".es-demo-bar"]
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [
    {"code": "AW_RECV_001", "ja": "入荷登録", "vi": "Đăng ký nhập kho"},
    {"code": "AW_RECV_002", "ja": "入荷登録 CSV取込", "vi": "Nhập CSV đăng ký nhập kho"},
]

# ---------------------------------------------------------------- setup で使う小さな関数（本物の Web は React なので input イベントを出す）
H = (
    "const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));"
    "const setv=(el,v)=>{if(!el)return;const p=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;"
    "Object.getOwnPropertyDescriptor(p,'value').set.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}));};"
    "const setsel=(el,v)=>{if(!el)return;Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(el,v);el.dispatchEvent(new Event('change',{bubbles:true}));};"
    "const btn=(t,root)=>[...(root||document).querySelectorAll('button')].find(b=>(b.textContent||'').trim().includes(t));"
    "const FOOD=/PO-\\d{6}-M\\d+/;"
    "const row0=()=>[...document.querySelectorAll('.tbl tbody tr')].find(r=>FOOD.test(r.textContent||'')&&r.querySelector('input[aria-label=\"入荷した数\"]'));"
    "const saveBtn=()=>[...document.querySelectorAll('button')].find(b=>(b.textContent||'').trim()==='保存');"
    "const inrow=(r,l)=>r.querySelector('input[aria-label=\"'+l+'\"]');"
    "const stateFilter=async(v)=>{setsel(document.querySelector('select[aria-label^=\"入荷の状態\"]'),v);await sleep(100);btn('検索').click();await sleep(500);};"
    "const openResolve=async(food=true)=>{await stateFilter('差異あり・対応待ち');const r=[...document.querySelectorAll('.tbl tbody tr')].find(t=>(FOOD.test(t.textContent||'')===food)&&btn('差異の対応',t));btn('差異の対応',r).click();await sleep(600);};"
    "const planOf=(r)=>{const n=r.querySelectorAll('td');return {qty:parseInt((n[4].textContent||'').replace(/[^0-9]/g,''))||1,box:parseInt((n[5].textContent||'').replace(/[^0-9]/g,''))||1};};"
)
# 未入荷の最初の行に、予定より少ない数を入れて「入荷を登録」→ 差異の対応が開く
SHORT = H + "await sleep(800);const r=row0();const p=planOf(r);setv(inrow(r,'入荷した数'),String(Math.max(1,p.qty-1)));setv(inrow(r,'箱数'),String(p.box));await sleep(200);saveBtn().click();await sleep(800);"
OVER = H + "await sleep(800);const r=row0();const p=planOf(r);setv(inrow(r,'入荷した数'),String(p.qty+5));setv(inrow(r,'箱数'),String(p.box));await sleep(200);saveBtn().click();await sleep(800);"

# ---------------------------------------------------------------- 一覧（AW_RECV_001）の項目
R_HEAD = [
    {"no": "1", "ja": "ヘッダーのボタン", "vi": "Nút ở tiêu đề", "sel": ".ph .btns", "kind": "area", "trig": "view",
     "detail": J("権限がないボタンは出さない（入荷管理の権限）。", "Không hiển thị nút mà người dùng không có quyền (quyền quản lý nhập kho).")},
    {"no": "1.1", "ja": "CSV取込", "vi": "Nhập CSV", "sel": ".ph .btns button::CSV取込", "kind": "button", "trig": "click", "pattern": "P-CSV",
     "cond": J("入荷管理の CSV取込 の権限（フル権限・システム管理は常に可）", "Quyền Nhập CSV của quản lý nhập kho (toàn quyền・quản trị hệ thống luôn được phép)"),
     "detail": J("入荷登録 CSV取込（AW_RECV_002）へ。1行＝1つの発注の今回の入荷。多くの発注の入荷をまとめて登録する。一致した発注は入荷済みにする。", "Chuyển sang Nhập CSV đăng ký nhập kho (AW_RECV_002). 1 dòng = lần nhập kho này của 1 đơn đặt hàng. Đăng ký gộp nhập kho của nhiều đơn đặt hàng. Đơn đặt hàng khớp sẽ chuyển sang đã nhập kho.")},
    {"no": "1.2", "ja": "CSV出力", "vi": "Xuất CSV", "sel": ".ph .btns button::CSV出力", "kind": "button", "trig": "click", "pattern": "P-CSV-OUT",
     "cond": J("入荷管理の CSV出力 の権限", "Quyền Xuất CSV của quản lý nhập kho"),
     "detail": J("いま表示している一覧（入荷予定日・納入倉庫・入荷の状態の条件を反映）を出力する。列：発注番号・入荷予定日・仕入先・品番・商品名・納入倉庫・予定の数・入荷済みの数・回・入荷の状態。", "Xuất danh sách đang hiển thị (phản ánh điều kiện ngày nhập kho dự kiến・kho nhận・trạng thái nhập kho). Các cột: mã đơn đặt hàng・ngày nhập kho dự kiến・nhà cung cấp・mã hàng・tên sản phẩm・kho nhận・số lượng dự kiến・số lượng đã nhập kho・lần・trạng thái nhập kho.")},
    {"no": "1.3", "ja": "入荷指示 CSV（THOMAS）", "vi": "CSV chỉ thị nhập kho (THOMAS)", "sel": ".ph .btns button::入荷指示 CSV（THOMAS）", "kind": "button", "trig": "click",
     "detail": J("THOMAS へ渡す入荷指示の CSV を出力する（今までどおり。入荷実績の CSV は取り込まない：台帳 I）。出力の対象は入荷予定の発注。列はフェーズ1 の出力と同じ。", "Xuất CSV chỉ thị nhập kho gửi cho THOMAS (giữ như trước. Không nhập CSV kết quả nhập kho: sổ quyết định I). Đối tượng xuất là các đơn đặt hàng có nhập kho dự kiến. Các cột giống đầu ra của Giai đoạn 1."),
     "open": J("CSV の列の定義・文字コード（UTF-8 にできるか）。hong が format をあとで提供する。", "Định nghĩa các cột CSV và bộ mã ký tự (có thể dùng UTF-8 không). hong sẽ cung cấp format sau."), "ask": "hong（フェーズ1 の CSV の見本）・ベンダー（THOMAS）",
     "demo_ok": J("いまは出力した旨のトーストだけ（ファイルはまだない）。", "Hiện tại chỉ hiện toast báo đã xuất (chưa có tệp).")},
]
R_NOTE = [
    {"no": "3", "ja": "案内文", "vi": "Văn bản hướng dẫn", "sel": ".card .notice", "kind": "label", "trig": "view",
     "detail": J("運営（システム管理）が入荷した商品の数と箱数を入れる（倉庫にはアカウントがない・THOMAS の入荷実績 CSV は使わない）。発注の数（分納の2回目からは残り）と同じなら入荷済み。違えば「差異あり・対応待ち」で保存し、影響する法人の注文・便を確かめて、分納を待つ（3回まで）／代替品で対応／不足を受け入れる から選ぶ。仕入先に確かめてから決めるときは、いったん閉じてよい（アラートは出たまま）。", "Quản trị vận hành (quản trị hệ thống) nhập số lượng và số thùng sản phẩm đã nhập kho (kho không có tài khoản, không dùng CSV kết quả nhập kho của THOMAS). Nếu bằng số lượng đặt hàng (từ lần giao thứ 2 của giao từng phần là số còn lại) thì là đã nhập kho. Nếu khác thì lưu ở trạng thái “差異あり・対応待ち”, kiểm tra đơn hàng và chuyến giao của pháp nhân bị ảnh hưởng, rồi chọn: chờ giao từng phần (tối đa 3 lần) / xử lý bằng hàng thay thế / chấp nhận thiếu hàng. Khi cần hỏi nhà cung cấp trước khi quyết định thì có thể đóng tạm (cảnh báo vẫn hiển thị).")},
]
R_FILTER = [
    {"no": "4", "ja": "検索条件", "vi": "Điều kiện tìm kiếm", "sel": ".card > div[style*=flex]", "kind": "area", "trig": "view", "pattern": "P-LIST",
     "detail": J("入荷予定日・納入倉庫・入荷の状態を、「検索」か Enter で反映する（前日・今日・翌日・すべての日のボタンは日付だけすぐ効く）。「未適用」の印は出さない。", "Phản ánh ngày nhập kho dự kiến・kho nhận・trạng thái nhập kho bằng nút “検索” hoặc Enter (các nút Hôm trước・Hôm nay・Hôm sau・Tất cả các ngày chỉ phản ánh ngay phần ngày). Không hiển thị dấu “未適用”."),
     "demo_ok": J("コードは条件を変えて未反映のとき「未適用」の印を出す。外す（hong 2026-10-05・H4）。", "Code hiện dấu “未適用” khi đổi điều kiện mà chưa phản ánh. Bỏ dấu này (hong 2026-10-05・H4).")},
    {"no": "4.1", "ja": "入荷予定日", "vi": "Ngày nhập kho dự kiến", "sel": "#rdate", "kind": "date", "trig": "input", "req": "－", "len": J("日付", "Ngày"), "init": J("空（すべての日）", "Trống (tất cả các ngày)"),
     "ex": J("2026/10/06", "Ngày, dạng YYYY/MM/DD"),
     "detail": J("入荷予定日（分納の次の回は次の入荷予定日）が一致する、またはこの日に入荷を記録した発注。空のときは入荷済み以外の全部（と今日入荷済みにしたもの）。", "Đơn đặt hàng có ngày nhập kho dự kiến (lần tiếp theo của giao từng phần là ngày nhập kho dự kiến tiếp theo) trùng khớp, hoặc đã ghi nhận nhập kho trong ngày này. Khi để trống là tất cả trừ đã nhập kho (và những đơn đã nhập kho trong hôm nay).")},
    {"no": "4.2", "ja": "前日", "vi": "Hôm trước", "sel": ".card button::前日", "kind": "button", "trig": "click", "detail": J("入荷予定日を1日前にして、すぐ一覧に反映する。（空のときは今日の前日）", "Đặt ngày nhập kho dự kiến lùi 1 ngày và phản ánh ngay vào danh sách. (Khi trống thì là ngày trước hôm nay)")},
    {"no": "4.3", "ja": "今日", "vi": "Hôm nay", "sel": ".card button::今日", "kind": "button", "trig": "click", "detail": J("入荷予定日を今日にして、すぐ一覧に反映する。", "Đặt ngày nhập kho dự kiến là hôm nay và phản ánh ngay vào danh sách.")},
    {"no": "4.4", "ja": "翌日", "vi": "Hôm sau", "sel": ".card button::翌日", "kind": "button", "trig": "click", "detail": J("入荷予定日を1日後にして、すぐ一覧に反映する。（空のときは今日の翌日）", "Đặt ngày nhập kho dự kiến tiến 1 ngày và phản ánh ngay vào danh sách. (Khi trống thì là ngày sau hôm nay)")},
    {"no": "4.5", "ja": "すべての日", "vi": "Tất cả các ngày", "sel": ".card button::すべての日", "kind": "button", "trig": "click", "detail": J("入荷予定日の条件を外して、すぐ一覧に反映する。", "Bỏ điều kiện ngày nhập kho dự kiến và phản ánh ngay vào danh sách.")},
    {"no": "4.6", "ja": "納入倉庫", "vi": "Kho nhận", "sel": "select[aria-label=\"納入倉庫\"]", "kind": "select", "trig": "select", "req": "－",
     "len": J("選択（納入倉庫のすべて／ES事務所（資材）／中部倉庫／関東倉庫／関西倉庫）", "Chọn (tất cả kho nhận／Văn phòng ES (vật tư)／Kho Chubu／Kho Kanto／Kho Kansai)"), "init": J("納入倉庫（すべて）", "Kho nhận (tất cả)"), "ex": J("関東倉庫", "Một kho nhận (kho Kanto)"),
     "detail": J("発注の納入倉庫で絞る。", "Lọc theo kho nhận của đơn đặt hàng.")},
    {"no": "4.7", "ja": "入荷の状態", "vi": "Trạng thái nhập kho", "sel": "select[aria-label^=\"入荷の状態\"]", "kind": "select", "trig": "select", "req": "－",
     "len": J("選択（未入荷／差異あり・対応待ち／分納待ち／入荷済み。名前の後ろに件数）", "Chọn (chưa nhập kho / chênh lệch, chờ xử lý / chờ giao từng phần / đã nhập kho. Số lượng hiển thị sau tên)"), "init": J("入荷の状態（入荷済み以外）", "Trạng thái nhập kho (trừ đã nhập kho)"), "ex": J("差異あり・対応待ち", "Một trạng thái nhập kho (chênh lệch, chờ xử lý)"),
     "detail": J("入荷の状態で絞る。選ばないときは入荷済み以外（と、この日に入荷済みにしたもの）。", "Lọc theo trạng thái nhập kho. Khi không chọn là tất cả trừ đã nhập kho (và những đơn đã nhập kho trong ngày này)."),
     "demo_ok": J("コードの選択肢は「入荷済」。「入荷済」にそろえる（台帳 I・状態の名前）。", "Lựa chọn trong code là “入荷済”. Thống nhất thành “入荷済み” (sổ quyết định I・tên trạng thái).")},
    {"no": "4.8", "ja": "クリア", "vi": "Xóa điều kiện", "sel": ".card button::クリア", "kind": "button", "trig": "click", "detail": J("条件を初期値に戻す。", "Đưa các điều kiện về giá trị ban đầu.")},
    {"no": "4.9", "ja": "検索", "vi": "Tìm kiếm", "sel": ".card button::検索", "kind": "button", "trig": "click", "detail": J("条件を一覧に反映する。", "Phản ánh các điều kiện vào danh sách.")},
]
R_TABLE = [
    {"no": "5", "ja": "入荷予定の一覧", "vi": "Danh sách nhập kho dự kiến", "sel": ".tbl-wrap", "kind": "table", "trig": "view", "pattern": "P-PAGESIZE",
     "detail": J("本発注した発注（キャンセル・受注不可を除く）を1行ずつ。初期の並びは入荷予定日の昇順 → 発注番号の昇順（hong 2026-10-07）。1回の入荷（分納は1回ごと）につき1行で入力する。入荷済みの行は入力ではなく、入荷した内容を見せる。", "Mỗi dòng là một đơn đặt hàng đã đặt hàng chính thức (trừ hủy và không thể nhận đơn). Thứ tự ban đầu là ngày nhập kho dự kiến tăng dần → mã đơn đặt hàng tăng dần (hong 2026-10-07). Mỗi lần nhập kho (giao từng phần tính theo từng lần) nhập trên 1 dòng. Dòng đã nhập kho không phải ô nhập mà hiển thị nội dung đã nhập."),
     "demo_ok": J("コードはページ送りがない・並べ替えの操作がない（H9）。一覧の共通（並べ替え・ページ送り）に合わせる。", "Code chưa có phân trang và thao tác sắp xếp (H9). Thống nhất theo phần chung của danh sách (sắp xếp・phân trang).")},
    {"no": "5.1", "ja": "入荷予定日", "vi": "Ngày nhập kho dự kiến", "sel": ".tbl tbody tr:first-child td:nth-child(1)", "kind": "label", "trig": "view", "detail": J("仕入先が答えた入荷予定日（分納の次の回があるときは次の入荷予定日・「分納の次の回」と添える）。", "Ngày nhập kho dự kiến mà nhà cung cấp trả lời (khi có lần tiếp theo của giao từng phần thì là ngày nhập kho dự kiến tiếp theo, kèm chú thích “分納の次の回”).")},
    {"no": "5.2", "ja": "仕入先", "vi": "Nhà cung cấp", "sel": ".tbl tbody tr:first-child td:nth-child(2)", "kind": "label", "trig": "view", "detail": J("発注の仕入先名。", "Tên nhà cung cấp của đơn đặt hàng.")},
    {"no": "5.3", "ja": "商品（仕入時の名前）／発注番号", "vi": "Sản phẩm (tên lúc nhập hàng) / Mã đơn đặt hàng", "sel": ".tbl tbody tr:first-child td:nth-child(3)", "kind": "label", "trig": "view",
     "detail": J("商品名は仕入時の名前（公開名ではない）と発注番号。追加発注の発注には「追加発注」のバッジ。", "Tên sản phẩm là tên lúc nhập hàng (không phải tên công khai) và mã đơn đặt hàng. Đơn đặt hàng bổ sung có huy hiệu “追加発注”.")},
    {"no": "5.4", "ja": "納入倉庫", "vi": "Kho nhận", "sel": ".tbl tbody tr:first-child td:nth-child(4)", "kind": "label", "trig": "view", "detail": J("発注の納入倉庫。", "Kho nhận của đơn đặt hàng.")},
    {"no": "5.5", "ja": "予定の数", "vi": "Số lượng dự kiến", "sel": ".tbl tbody tr:first-child td:nth-child(5)", "kind": "label", "trig": "view",
     "detail": J("この回に入荷する予定の数（分納の2回目からは残り）。一部入荷済みのときは「入荷済 n」を添える。", "Số lượng dự kiến nhập trong lần này (từ lần giao thứ 2 của giao từng phần là số còn lại). Khi đã nhập một phần thì kèm “入荷済 n”.")},
    {"no": "5.6", "ja": "予定の箱数", "vi": "Số thùng dự kiến", "sel": ".tbl tbody tr:first-child td:nth-child(6)", "kind": "label", "trig": "view", "detail": J("この回の予定の箱数（仕入先が本発注の承認で入れた箱数。ないときは数÷入り数の切り上げ）。", "Số thùng dự kiến của lần này (số thùng mà nhà cung cấp nhập khi duyệt đặt hàng chính thức. Nếu không có thì làm tròn lên số lượng ÷ số lượng mỗi thùng).")},
    {"no": "5.7", "ja": "回", "vi": "Lần", "sel": ".tbl tbody tr:first-child td:nth-child(7)", "kind": "label", "trig": "view", "detail": J("「いまの回／3」（分納は3回まで・運営の設定で変えられる【仮】）。", "“Lần hiện tại/3” (giao từng phần tối đa 3 lần, quản trị vận hành có thể đổi trong cài đặt [tạm]).")},
    {"no": "5.8", "ja": "入荷した数", "vi": "Số lượng đã nhập kho", "sel": ".tbl tbody tr:first-child input[aria-label=\"入荷した数\"]", "kind": "text", "trig": "input", "req": "○",
     "len": J("整数 0〜999,999", "Số nguyên 0〜999,999"), "init": J("空欄", "Để trống"), "ex": J("120", "Số lượng sản phẩm đã nhập (số nguyên)"), "err": ["E154"],
     "valid": J("0以上の整数。予定と違う数も入れられる（違えば「差異あり・対応待ち」で保存）。上限 999,999（台帳 B「数量の桁」）。", "Số nguyên từ 0 trở lên. Có thể nhập số khác dự kiến (nếu khác thì lưu ở “差異あり・対応待ち”). Giới hạn trên 999,999 (sổ quyết định B “số chữ số của số lượng”)."),
     "detail": J("実際に倉庫に入った商品の数。", "Số lượng sản phẩm thực tế đã vào kho."),
     "demo_ok": J("コードは上限がない（H7）。", "Code không có giới hạn trên (H7).")},
    {"no": "5.9", "ja": "箱数", "vi": "Số thùng", "sel": ".tbl tbody tr:first-child input[aria-label=\"箱数\"]", "kind": "text", "trig": "input", "req": "○",
     "len": J("整数 0〜999,999", "Số nguyên 0〜999,999"), "init": J("空欄", "Để trống"), "ex": J("20", "Số thùng (số nguyên)"), "err": ["E154"],
     "valid": J("0以上の整数。箱数だけ予定と違うのは「一致」（差異にしない）。入り数（ロット）が2以上で、箱数×入り数が入荷した数と1箱分以上ずれるときは入力欄の下に「箱数×入り数と合わない」と出す（保存は進められる）。", "Số nguyên từ 0 trở lên. Chỉ số thùng khác dự kiến vẫn tính là “khớp” (không coi là chênh lệch). Khi số lượng mỗi thùng (lô) từ 2 trở lên và số thùng × số lượng mỗi thùng lệch từ 1 thùng trở lên so với số lượng đã nhập, hiển thị dưới ô nhập “箱数×入り数と合わない” (vẫn có thể tiếp tục lưu)."),
     "detail": J("実際に入った箱の数。", "Số thùng thực tế đã nhập.")},
    {"no": "5.10", "ja": "入荷日", "vi": "Ngày nhập kho", "sel": ".tbl tbody tr:first-child input[aria-label=\"入荷日\"]", "kind": "date", "trig": "input", "req": "－", "len": J("日付", "Ngày"),
     "init": J("運営が発注（仮発注・本発注）で入れた入荷希望日", "Ngày nhập kho mong muốn mà quản trị vận hành nhập khi đặt hàng (đặt hàng tạm・đặt hàng chính thức)"), "valid": J("今日以前の日付だけ（未来の日は選べない：入荷日を正しく入れてください）。初期値が未来の日になるときは今日にする（確認メモ 追加確認）。", "Chỉ ngày từ hôm nay trở về trước (không chọn ngày tương lai). Nếu mặc định rơi vào ngày tương lai thì dùng hôm nay (xem ghi chú xác nhận thêm)."), "ex": J("2026/10/06", "Ngày, dạng YYYY/MM/DD"),
     "detail": J("実際に入荷した日。初期値は運営が発注で入れた入荷希望日（未来の日のときは今日）。直せる。空のときは今日として保存する。", "Ngày thực tế nhập kho. Giá trị ban đầu là ngày nhập kho mong muốn mà quản trị vận hành nhập khi đặt hàng (nếu là ngày tương lai thì dùng hôm nay). Có thể sửa. Để trống thì lưu là hôm nay."),
     "demo_ok": J("コードの初期値は今日（H13）。発注で入れた入荷希望日に直す（hong 2026-10-07）。", "Giá trị ban đầu trong code là hôm nay (H13). Sửa thành ngày nhập kho mong muốn nhập khi đặt hàng (hong 2026-10-07).")},
    {"no": "5.11", "ja": "賞味期限／消費期限", "vi": "Hạn sử dụng (賞味期限)／Hạn tiêu thụ (消費期限)", "sel": ".tbl tbody input[aria-label=\"賞味期限／消費期限\"]", "kind": "date", "trig": "input", "req": "条件付き", "len": J("日付", "Ngày"),
     "init": J("運営が発注で入れた希望の期限", "Hạn mong muốn mà quản trị vận hành nhập khi đặt hàng"), "ex": J("2026/12/20", "Ngày hạn, dạng YYYY/MM/DD"), "err": ["E141"],
     "cond": J("資材の発注には欄を出さない（—）。資材以外はどの商品でも必須（生鮮だけではない）。", "Với đơn đặt hàng vật tư thì không hiển thị ô (—). Ngoài vật tư thì bắt buộc với mọi sản phẩm (không chỉ hàng tươi)."),
     "detail": J("入荷した商品の期限（通常商品は賞味期限・短消費期限商品は消費期限）。初期値は運営が発注で入れた希望の期限。直せる。空のままでは保存できない。", "Hạn của sản phẩm đã nhập (sản phẩm thông thường là hạn sử dụng (賞味期限), sản phẩm có hạn tiêu thụ ngắn là hạn tiêu thụ (消費期限)). Giá trị ban đầu là hạn mong muốn mà quản trị vận hành nhập khi đặt hàng. Có thể sửa. Để trống thì không lưu được."),
     "demo_ok": J("コードの初期値は仕入先が本発注の承認で入れた期限（H13）。発注で入れた希望の期限に直す。", "Giá trị ban đầu trong code là hạn mà nhà cung cấp nhập khi duyệt đặt hàng chính thức (H13). Sửa thành hạn mong muốn nhập khi đặt hàng.")},
    {"no": "5.12", "ja": "メモ", "vi": "Ghi chú", "sel": ".tbl tbody tr:first-child input[placeholder=\"メモ\"]", "kind": "text", "trig": "input", "req": "－", "len": J("文字列 60", "Chuỗi 60 ký tự"),
     "init": J("空欄", "Để trống"), "ex": J("仕入先より電話：1箱つぶれ", "Ghi chú tự do (ví dụ: nhà cung cấp gọi điện, 1 thùng bị móp)"), "err": ["E04"],
     "detail": J("仕入先とのやり取りなど。", "Trao đổi với nhà cung cấp, v.v."),
     "demo_ok": J("コードは文字数の上限がない・CSV は200文字（H8）。1行は60文字にそろえる。", "Code không giới hạn số ký tự, CSV là 200 ký tự (H8). Thống nhất 60 ký tự cho 1 dòng.")},
    {"no": "5.13", "ja": "状態", "vi": "Trạng thái", "sel": ".tbl tbody tr:first-child td:nth-last-child(2)", "kind": "label", "trig": "view", "pattern": "P-STATUS-COLORS",
     "detail": J("未入荷／差異あり・対応待ち／分納待ち／入荷済み のバッジ。差異の対応を決めたときは、対応（分納を待つ・代替品で対応・不足を受け入れる）と代替品設定の ID を添える。差異あり・対応待ちの行は背景を赤みにする。", "Huy hiệu 未入荷／差異あり・対応待ち／分納待ち／入荷済み. Khi đã quyết định cách xử lý chênh lệch thì kèm cách xử lý (chờ giao từng phần・xử lý bằng hàng thay thế・chấp nhận thiếu hàng) và ID của cài đặt hàng thay thế. Dòng chênh lệch, chờ xử lý (差異あり・対応待ち) có nền hơi đỏ.")},
    {"no": "5.14", "ja": "入荷を登録", "vi": "Đăng ký nhập kho", "sel": ".tbl tbody tr:first-child button::入荷を登録", "kind": "button", "trig": "click", "err": ["E154", "E141", "S129", "W124"],
     "cond": J("入荷管理の「入荷の登録」の権限（倉庫スタッフ・商品開発・フル権限など）。未入荷・分納待ちの行だけ", "Quyền “đăng ký nhập kho” của quản lý nhập kho (nhân viên kho・phát triển sản phẩm・toàn quyền, v.v.). Chỉ dòng chưa nhập kho / chờ giao từng phần"),
     "detail": J("入荷した数・箱数・入荷日・賞味期限／消費期限を保存する。数・箱数が空なら E154、期限が空（資材以外）なら E141。予定と同じ数なら入荷済みにして S129。予定と違えば「差異あり・対応待ち」で保存し W124 を出して、差異の対応（モーダル）をすぐ開く。入荷した数は倉庫在庫・代替品設定の在庫の見込みに入る。", "Lưu số lượng đã nhập・số thùng・ngày nhập kho・hạn sử dụng (賞味期限)／hạn tiêu thụ (消費期限). Nếu số lượng・số thùng trống thì E154, nếu hạn trống (ngoài vật tư) thì E141. Nếu bằng số lượng dự kiến thì chuyển sang đã nhập kho và S129. Nếu khác dự kiến thì lưu ở “差異あり・対応待ち”, hiển thị W124 và mở ngay xử lý chênh lệch (modal). Số lượng đã nhập được tính vào tồn kho và dự kiến tồn kho của cài đặt hàng thay thế.")},
]
R_DIFF_BTN = [
    {"no": "5.15", "ja": "差異の対応", "vi": "Xử lý chênh lệch", "sel": ".tbl tbody tr:first-child button::差異の対応", "kind": "button", "trig": "click",
     "cond": J("入荷管理の「差異の対応」の権限。差異あり・対応待ちの行だけ", "Quyền “xử lý chênh lệch” của quản lý nhập kho. Chỉ dòng chênh lệch, chờ xử lý (差異あり・対応待ち)"),
     "detail": J("差異の対応（モーダル）を開く。", "Mở xử lý chênh lệch (modal).")},
]

# ---------------------------------------------------------------- 差異の対応（モーダル）
R_MODAL = [
    {"no": "6", "ja": "入荷の差異の対応（モーダル）", "vi": "Xử lý chênh lệch nhập kho (modal)", "sel": ".mbox", "kind": "modal", "trig": "show",
     "detail": J("予定との差と、影響する法人の注文・便を先に見せてから、対応を選ぶ。決めるまでは「差異あり・対応待ち」のまま、運営の TOP と発注の一覧にアラートを出し続ける。", "Hiển thị trước chênh lệch so với dự kiến cùng đơn hàng và chuyến giao của pháp nhân bị ảnh hưởng, rồi mới chọn cách xử lý. Cho đến khi quyết định vẫn giữ “差異あり・対応待ち” và tiếp tục hiển thị cảnh báo ở TOP vận hành và danh sách đặt hàng.")},
    {"no": "6.1", "ja": "発注の内容", "vi": "Nội dung đơn đặt hàng", "sel": ".mbox .kvgrid", "kind": "label", "trig": "view",
     "detail": J("発注番号・商品・仕入先・入荷日・予定（何回目か・個数・箱数）・入荷（個数・箱数）。", "Mã đơn đặt hàng・sản phẩm・nhà cung cấp・ngày nhập kho・dự kiến (lần thứ mấy・số lượng・số thùng)・nhập kho (số lượng・số thùng).")},
    {"no": "6.2", "ja": "警告の案内", "vi": "Thông báo cảnh báo", "sel": ".mbox .notice", "kind": "label", "trig": "view",
     "detail": J("不足のとき「予定より n個 足りません。仕入先に確かめてから対応を選んでください」。多いとき「予定より n個 多く入荷しました。多い分を受け入れると発注を閉じます」。", "Khi thiếu: “Thiếu n so với dự kiến. Hãy hỏi nhà cung cấp rồi chọn cách xử lý”. Khi nhiều hơn: “Đã nhập nhiều hơn dự kiến n. Nếu chấp nhận phần nhiều hơn thì đơn đặt hàng sẽ đóng”.")},
    {"no": "6.3", "ja": "影響する法人の注文・便", "vi": "Đơn hàng và chuyến giao của pháp nhân bị ảnh hưởng", "sel": ".mbox .tbl-wrap", "kind": "table", "trig": "view",
     "cond": J("不足のときだけ", "Chỉ khi thiếu"),
     "detail": J("不足を受け入れたとき ③ 除外になる便：拠点・お届け日・出荷日・便・配送・注文・足りなくなる数。不足は、この倉庫から出る便のうち後ろの便から割り当てる（先に出る便には入荷した分を回す）。この期間にまだ出荷していない便でこの商品の注文がなければ「…注文はありません（在庫で足りるか、もう出荷済み）」と出す。", "Các chuyến bị ③ loại khi chấp nhận thiếu hàng: chi nhánh・ngày giao・ngày xuất kho・chuyến・vận chuyển・đơn hàng・số lượng bị thiếu. Phần thiếu được phân bổ từ các chuyến sau trong số các chuyến xuất từ kho này (phần đã nhập dành cho các chuyến xuất trước). Nếu trong thời gian này không có đơn hàng sản phẩm này ở chuyến chưa xuất kho thì hiển thị “…注文はありません（在庫で足りるか、もう出荷済み）” (không có đơn hàng, tồn kho đủ hoặc đã xuất kho).")},
    {"no": "6.4", "ja": "対応：分納を待つ", "vi": "Cách xử lý: chờ giao từng phần", "sel": ".mbox label::分納を待つ", "kind": "radio", "trig": "click", "req": "○", "init": J("未選択", "Chưa chọn"),
     "ex": J("分納を待つ", "Giá trị tùy chọn (chờ giao từng phần)"),
     "cond": J("不足のとき。分納が3回済み（この入荷が3回目）なら選べない。", "Khi thiếu. Nếu đã giao từng phần đủ 3 lần (lần nhập này là lần 3) thì không chọn được."),
     "detail": J("仕入先が残りを後で納品する。分納は3回まで。次の入荷予定日を入れる。", "Nhà cung cấp sẽ giao phần còn lại sau. Giao từng phần tối đa 3 lần. Nhập ngày nhập kho dự kiến tiếp theo.")},
    {"no": "6.5", "ja": "対応：代替品で対応", "vi": "Cách xử lý: xử lý bằng hàng thay thế", "sel": ".mbox label::代替品で対応", "kind": "radio", "trig": "click", "req": "○", "ex": J("代替品で対応", "Giá trị tùy chọn (xử lý bằng hàng thay thế)"),
     "cond": J("不足のとき", "Khi thiếu"), "detail": J("代替品設定で代わりの商品を届ける。代替品設定を開いて保存したあと、ここでその設定を選ぶ。", "Giao sản phẩm thay thế bằng cài đặt hàng thay thế. Mở cài đặt hàng thay thế và lưu, sau đó chọn cài đặt đó tại đây.")},
    {"no": "6.6", "ja": "対応：不足を受け入れる（③ 除外）", "vi": "Cách xử lý: chấp nhận thiếu hàng (③ loại khỏi chuyến)", "sel": ".mbox label::不足を受け入れる", "kind": "radio", "trig": "click", "req": "○", "ex": J("不足を受け入れる", "Giá trị tùy chọn (chấp nhận thiếu hàng)"),
     "cond": J("不足のとき", "Khi thiếu"),
     "detail": J("上の便のこの商品を足りない数だけ外す（納品分に含まれない・請求しない）。出荷指示を送った便は版番号つきで再送する。", "Loại sản phẩm này khỏi các chuyến nêu trên đúng số lượng thiếu (không tính vào hàng giao, không thanh toán). Chuyến đã gửi chỉ thị xuất kho thì gửi lại kèm số phiên bản.")},
    {"no": "6.8", "ja": "メモ", "vi": "Ghi chú", "sel": ".mbox input[placeholder=\"仕入先とのやり取りなど\"]", "kind": "text", "trig": "input", "req": "－", "len": J("文字列 60", "Chuỗi 60 ký tự"),
     "init": J("空欄", "Để trống"), "ex": J("仕入先と電話済み。来週火曜に残り納品", "Ghi chú tự do (ví dụ: đã gọi nhà cung cấp, thứ Ba tuần sau giao phần còn lại)"), "err": ["E04"], "detail": J("対応の記録（履歴に残す）。", "Ghi chép về cách xử lý (lưu vào lịch sử)."),
     "demo_ok": J("コードは文字数の上限がない（H8）。", "Code không giới hạn số ký tự (H8).")},
    {"no": "6.9", "ja": "あとで決める（対応待ちのまま）", "vi": "Quyết định sau (giữ trạng thái chờ xử lý)", "sel": ".mbox button::あとで決める", "kind": "button", "trig": "click",
     "detail": J("モーダルを閉じる。差異あり・対応待ちのまま、アラートは出続ける。", "Đóng modal. Giữ nguyên chênh lệch, chờ xử lý (差異あり・対応待ち), cảnh báo tiếp tục hiển thị.")},
    {"no": "6.10", "ja": "この対応にする", "vi": "Chọn cách xử lý này", "sel": ".mbox button::この対応にする", "kind": "button", "trig": "click", "err": ["E155", "S190", "S191", "S192"],
     "cond": J("入荷管理の「差異の対応」の権限。対応を選んでいるときだけ押せる", "Quyền “xử lý chênh lệch” của quản lý nhập kho. Chỉ nhấn được khi đã chọn cách xử lý"),
     "detail": J("選んだ対応を記録する。分納を待つ→次の入荷予定日で「分納待ち」にして S190。代替品→選んだ代替品設定の ID を記録。不足を受け入れる→影響する便を ③ 除外にして S191（法人へ知らせるチェックが ON ならメール X17＋法人Web のお知らせ）。多い分→発注を閉じる。それ以外は S192。", "Ghi lại cách xử lý đã chọn. Chờ giao từng phần → chuyển sang “分納待ち” với ngày nhập kho dự kiến tiếp theo và S190. Hàng thay thế → ghi ID của cài đặt hàng thay thế đã chọn. Chấp nhận thiếu hàng → ③ loại các chuyến bị ảnh hưởng và S191 (nếu ô thông báo cho pháp nhân bật thì gửi email X17 + thông báo trên Web pháp nhân). Phần nhiều hơn → đóng đơn đặt hàng. Các trường hợp khác là S192.")},
]
R_OVER = [
    {"no": "6.7", "ja": "対応：多い分を受け入れる", "vi": "Cách xử lý: chấp nhận phần nhiều hơn", "sel": ".mbox label::多い分を受け入れる", "kind": "radio", "trig": "click", "req": "○", "ex": J("多い分を受け入れる", "Giá trị tùy chọn (chấp nhận phần nhiều hơn)"),
     "cond": J("予定より多く入荷したときだけ（これだけ。初めから選ばれている）", "Chỉ khi đã nhập nhiều hơn dự kiến (chỉ có lựa chọn này. Được chọn sẵn từ đầu)"),
     "detail": J("発注を閉じる。多い分は倉庫在庫になる。", "Đóng đơn đặt hàng. Phần nhiều hơn trở thành tồn kho của kho.")},
]
R_ALT_DATE = [
    {"no": "6.11", "ja": "次の入荷予定日（仕入先の回答）", "vi": "Ngày nhập kho dự kiến tiếp theo (nhà cung cấp trả lời)", "sel": ".mbox .fld input.inp[placeholder=\"yyyy-mm-dd\"]", "kind": "date", "trig": "input", "req": "○", "len": J("日付", "Ngày"), "ex": J("2026/10/13", "Ngày, dạng YYYY/MM/DD"), "err": ["E01"],
     "cond": J("「分納を待つ」を選んだときだけ", "Chỉ khi chọn “分納を待つ”"), "detail": J("残りの数の次の入荷予定日（仕入先に確かめた日）。", "Ngày nhập kho dự kiến tiếp theo của số lượng còn lại (ngày đã xác nhận với nhà cung cấp).")},
]
R_ALT = [
    {"no": "6.12", "ja": "代替品設定を開く", "vi": "Mở cài đặt hàng thay thế", "sel": ".mbox a::代替品設定を開く", "kind": "link", "trig": "click",
     "cond": J("「代替品で対応」を選んだときだけ", "Chỉ khi chọn “代替品で対応”"),
     "detail": J("代替品設定（メニュー管理＞商品注文管理）を、不良の商品・期間・理由を入れて開く。このモーダルは閉じる。", "Mở cài đặt hàng thay thế (Quản lý menu > Quản lý đặt hàng sản phẩm) với sản phẩm lỗi・thời gian・lý do đã nhập. Modal này sẽ đóng.")},
    {"no": "6.13", "ja": "代替品設定", "vi": "Cài đặt hàng thay thế", "sel": ".mbox select[aria-label=\"代替品設定\"]", "kind": "select", "trig": "select", "req": "○",
     "len": J("選択（この商品の代替品設定）", "Chọn (cài đặt hàng thay thế của sản phẩm này)"), "init": J("この商品の代替品設定を選ぶ", "Chọn cài đặt hàng thay thế của sản phẩm này"), "ex": J("ALT-2610-0001", "ID cài đặt hàng thay thế"), "err": ["E02"],
     "cond": J("「代替品で対応」を選んだときだけ", "Chỉ khi chọn “代替品で対応”"), "detail": J("できた代替品設定を選ぶ。", "Chọn cài đặt hàng thay thế đã tạo.")},
]
R_NOTIFY = [
    {"no": "6.14", "ja": "法人へ知らせる（メール・お知らせ）", "vi": "Thông báo cho pháp nhân (email・thông báo)", "sel": ".mbox label::法人へ知らせる", "kind": "check", "trig": "check", "req": "－",
     "init": J("チェックあり", "Đã chọn (bật)"), "ex": J("チェックあり", "Giá trị ô chọn (đã chọn = bật)"),
     "cond": J("「不足を受け入れる」を選んだときだけ", "Chỉ khi chọn “不足を受け入れる”"),
     "detail": J("ON のとき、該当の商品を注文した拠点だけに、メール X17＋法人Web のお知らせを送る（代替品の「お客様への知らせ」と同じ。既定で送る・運営が外せる）。", "Khi bật, gửi email X17 + thông báo trên Web pháp nhân chỉ cho các chi nhánh đã đặt sản phẩm tương ứng (giống “thông báo cho khách hàng” của hàng thay thế. Mặc định gửi, quản trị vận hành có thể bỏ chọn).")},
]

# ---------------------------------------------------------------- 状態（VIEWS）
V = []
def view(i, state, items=None, **kw):
    d = {"id": i, "code": kw.pop("code", "AW_RECV_001"), "state": state, "setup": "", "full": True, "url": "/ops/purchasing/receiving", "note": J(""), "items": items or []}
    d.update(kw)
    V.append(d)

view("001", J("初期表示（入荷済み以外・差異のアラート帯あり）", "Hiển thị ban đầu (trừ đã nhập kho, có dải cảnh báo chênh lệch)"),
     R_HEAD + [{"no": "2", "ja": "入荷の差異のアラート帯", "vi": "Dải cảnh báo chênh lệch nhập kho", "sel": ".notice.ng", "kind": "label", "trig": "view",
                "cond": J("差異あり・対応待ち、または分納の入荷予定日を過ぎたものがあるとき", "Khi có đơn chênh lệch chờ xử lý (差異あり・対応待ち), hoặc đơn giao từng phần đã quá ngày nhập kho dự kiến"),
                "detail": J("「入荷の差異の対応待ちが n件、分納の入荷予定日を過ぎたものが n件あります（発注番号…）。「差異の対応」から対応を選んでください。」", "“Có n đơn nhập kho chênh lệch chờ xử lý, n đơn giao từng phần đã quá ngày nhập kho dự kiến (mã đơn đặt hàng…). Hãy chọn cách xử lý từ “差異の対応”.”")}]
     + R_NOTE + R_FILTER + R_TABLE,
     wait=1500, note=J("入荷予定日の昇順。見本は未入荷 152・差異あり・対応待ち 1・入荷済 179（今日入荷済みにしたもの以外は出さない）。", "Ngày nhập kho dự kiến tăng dần. Dữ liệu mẫu: chưa nhập kho 152・chênh lệch chờ xử lý 1・đã nhập kho 179 (không hiển thị những đơn đã nhập kho trước hôm nay)."))
view("002", J("状態＝差異あり・対応待ちで絞る", "Lọc theo trạng thái = chênh lệch, chờ xử lý (差異あり・対応待ち)"), R_DIFF_BTN,
     setup=H + "await stateFilter('差異あり・対応待ち');", wait=800,
     note=J("入荷の状態で「差異あり・対応待ち」を選んで検索。行は背景が赤み。「差異の対応」を押せる。", "Chọn “差異あり・対応待ち” ở trạng thái nhập kho rồi tìm kiếm. Dòng có nền hơi đỏ. Có thể nhấn “差異の対応”."))
view("003", J("0件（状態＝分納待ち）", "0 kết quả (trạng thái = chờ giao từng phần 分納待ち)"), [],
     setup=H + "await stateFilter('分納待ち');", wait=800,
     note=J("該当なし：「入荷予定はありません」（入荷予定日を選んでいるときは「この日の入荷予定はありません」）。", "Không có kết quả: “入荷予定はありません” (khi đã chọn ngày nhập kho dự kiến thì “この日の入荷予定はありません”)."))
view("004", J("入力中（箱数×入り数が合わない警告）", "Đang nhập (cảnh báo số thùng × số lượng mỗi thùng không khớp)"), [],
     setup=H + "await sleep(800);const r=row0();setv(inrow(r,'入荷した数'),'7');setv(inrow(r,'箱数'),'1');await sleep(300);", wait=600,
     note=J("入荷した数と箱数を入れると、ロットが2以上で箱数×入り数がずれるとき、箱数の下に「箱数×入り数と合わない」と出る（保存は進められる）。", "Khi nhập số lượng đã nhập và số thùng, nếu lô từ 2 trở lên và số thùng × số lượng mỗi thùng bị lệch thì dưới ô số thùng hiện “箱数×入り数と合わない” (vẫn có thể tiếp tục lưu)."))
view("005", J("入力エラー（どの欄か赤く出す）", "Lỗi nhập (tô đỏ đúng ô bị lỗi)"), [],
     setup=H + "await sleep(800);const r=row0();setv(inrow(r,'入荷した数'),'5');await sleep(200);saveBtn().click();await sleep(500);", wait=600,
     note=J("数だけ入れて箱数を空のまま「保存」→ 箱数の欄が赤くなり、下に E01 を出す。画面の上に E154 のトースト。1行も保存しない。", "Chỉ nhập số lượng, để trống số thùng rồi nhấn “保存” → ô số thùng đỏ lên và hiện E01 bên dưới, toast E154 ở trên. Không lưu dòng nào."))
view("006", J("入荷を登録（予定と同じ数＝入荷済）", "Đăng ký nhập kho (số lượng bằng dự kiến = đã nhập kho)"), [],
     setup=H + "await sleep(800);const r=row0();btn('予定どおり入荷',r).click();await sleep(1200);", wait=800,
     note=J("予定と同じ数で登録すると S129 のトーストが出て、行は「入荷済」になる（この日に入荷済みにした行は一覧に残る）。※見本の撮影には予定どおりに登録できる機能を使う。", "Đăng ký với số lượng bằng dự kiến thì hiện toast S129 và dòng chuyển sang “入荷済み” (dòng đã nhập trong ngày vẫn còn trong danh sách). * Để chụp mẫu dùng chức năng đăng ký đúng như dự kiến."))
view("007", J("予定と違う数で登録（差異あり・対応待ち → 差異の対応を開く）", "Đăng ký với số lượng khác dự kiến (chênh lệch, chờ xử lý → mở xử lý chênh lệch)"),
     R_MODAL, setup=SHORT, wait=1200,
     note=J("予定より少ない数で登録すると W124 のトーストが出て、差異の対応（モーダル）がすぐ開く。影響する便の表と、3つの対応。", "Đăng ký với số lượng ít hơn dự kiến thì hiện toast W124 và mở ngay xử lý chênh lệch (modal). Có bảng các chuyến bị ảnh hưởng và 3 cách xử lý."))
view("008", J("差異の対応：分納を待つ", "Xử lý chênh lệch: chờ giao từng phần"), R_ALT_DATE,
     setup=H + "await openResolve();btn('分納を待つ',document.querySelector('.mbox'))&&0;[...document.querySelectorAll('.mbox label')].find(l=>l.textContent.includes('分納を待つ')).querySelector('input').click();await sleep(400);", wait=800,
     note=J("「分納を待つ」を選ぶと「次の入荷予定日（仕入先の回答）」が出る。分納が3回済みのときは選べない。", "Khi chọn “分納を待つ” thì hiện “次の入荷予定日（仕入先の回答）” (ngày nhập kho dự kiến tiếp theo, nhà cung cấp trả lời). Nếu đã giao từng phần đủ 3 lần thì không chọn được."))
view("009", J("差異の対応：代替品で対応", "Xử lý chênh lệch: xử lý bằng hàng thay thế"), R_ALT,
     setup=H + "await openResolve();[...document.querySelectorAll('.mbox label')].find(l=>l.textContent.includes('代替品で対応')).querySelector('input').click();await sleep(400);", wait=800,
     note=J("「代替品で対応」を選ぶと、代替品設定を開くリンクと、この商品の代替品設定の選択が出る。", "Khi chọn “代替品で対応” thì hiện liên kết mở cài đặt hàng thay thế và lựa chọn cài đặt hàng thay thế của sản phẩm này."))
view("010", J("差異の対応：不足を受け入れる", "Xử lý chênh lệch: chấp nhận thiếu hàng"), R_NOTIFY,
     setup=H + "await openResolve();[...document.querySelectorAll('.mbox label')].find(l=>l.textContent.includes('不足を受け入れる')).querySelector('input').click();await sleep(400);", wait=800,
     note=J("「不足を受け入れる」を選ぶと「法人へ知らせる」のチェック（初期 ON）が出る。", "Khi chọn “不足を受け入れる” thì hiện ô chọn “法人へ知らせる” (thông báo cho pháp nhân, ban đầu bật)."))
view("011", J("差異の対応：多い分を受け入れる（予定より多く入荷）", "Xử lý chênh lệch: chấp nhận phần nhiều hơn (nhập nhiều hơn dự kiến)"), R_OVER,
     setup=OVER, wait=1200,
     note=J("予定より多く登録すると、対応は「多い分を受け入れる」だけで、初めから選ばれている。", "Khi đăng ký nhiều hơn dự kiến thì chỉ có cách xử lý “多い分を受け入れる” và được chọn sẵn từ đầu."))
view("012", J("分納待ち（対応を決めた後）", "Chờ giao từng phần (sau khi đã quyết định cách xử lý)"), [],
     setup=H + "await openResolve();[...document.querySelectorAll('.mbox label')].find(l=>l.textContent.includes('分納を待つ')).querySelector('input').click();await sleep(300);const d=document.querySelector('.mbox .fld input.inp[placeholder=\"yyyy-mm-dd\"]');setv(d,'2026-10-13');await sleep(200);btn('この対応にする').click();await sleep(1000);await stateFilter('分納待ち');", wait=1000,
     note=J("分納を待つで決めると、行は「分納待ち」になり、次の入荷予定日が入荷予定日の列に出る（分納の次の回）。", "Khi quyết định chờ giao từng phần, dòng chuyển sang “分納待ち” và ngày nhập kho dự kiến tiếp theo hiện ở cột ngày nhập kho dự kiến (lần tiếp theo của giao từng phần)."))

# ---------------------------------------------------------------- CSV取込（AW_RECV_002）
CSVCOLS = [
    ("2.1", "発注番号", "文字列", "○", "既知の発注（本発注済み・キャンセルと受注不可を除く）の発注番号。ないとエラー。入荷が終わっている・差異の対応待ち・分納が3回済みの発注は取り込めない（理由を出す）。", "PO-202611-M000123-U01", ["E01"],
     "Mã đơn đặt hàng", "Chuỗi", "Mã đơn đặt hàng đã biết (đã đặt hàng chính thức, trừ hủy và không thể nhận đơn). Nếu không có thì lỗi. Đơn đã nhập kho xong・đang chênh lệch chờ xử lý・đã giao từng phần đủ 3 lần thì không nhập được (hiển thị lý do).", "Mã đơn đặt hàng (dạng PO-năm tháng-mã-số)"),
    ("2.2", "入荷した数", "整数", "○", "0以上の整数（上限 999,999）。予定の数（分納の2回目からは残り）と違えば「差異あり・対応待ち」で保存する（警告）。", "120", ["E01", "E14"],
     "Số lượng đã nhập kho", "Số nguyên", "Số nguyên từ 0 trở lên (giới hạn trên 999,999). Nếu khác số lượng dự kiến (từ lần giao thứ 2 của giao từng phần là số còn lại) thì lưu ở “差異あり・対応待ち” (cảnh báo).", "Số lượng đã nhập (số nguyên)"),
    ("2.3", "箱数", "整数", "○", "0以上の整数（上限 999,999）。", "20", ["E01", "E14"],
     "Số thùng", "Số nguyên", "Số nguyên từ 0 trở lên (giới hạn trên 999,999).", "Số thùng (số nguyên)"),
    ("2.4", "入荷日", "日付", "－", "入荷した日（YYYY/MM/DD）。空なら今日（画面と同じ）。未来の日は選べない（今日以前）。", "2026/10/05", ["E157"],
     "Ngày nhập kho", "Ngày", "Ngày đã nhập kho (YYYY/MM/DD). Để trống thì lấy hôm nay (giống màn hình). Không chọn được ngày tương lai (từ hôm nay trở về trước).", "Ngày, dạng YYYY/MM/DD"),
    ("2.5", "賞味期限／消費期限", "日付", "－", "読み取り専用（CSV出力・テンプレートにだけ出る。取り込むときは見ない）。仕入先が本発注の承認で入れた期限（運営が発注で希望の期限を入れているときはそれ）。取り込んだ入荷の期限もこの値を使う。入荷登録では入れない・直さない（hong 2026-10-08）。資材は空。", "2026/12/20", [],
     "Hạn sử dụng (賞味期限)／Hạn tiêu thụ (消費期限)", "Ngày", "Chỉ đọc (chỉ có trong xuất CSV・mẫu, không đọc khi nhập). Hạn mà nhà cung cấp nhập khi duyệt đặt hàng chính thức (nếu quản trị vận hành nhập hạn mong muốn khi đặt hàng thì lấy hạn đó). Hạn của lần nhập được nhập cũng dùng giá trị này. Không nhập, không sửa khi đăng ký nhập kho (hong 2026-10-08). Vật tư để trống.", "Ngày hạn, dạng YYYY/MM/DD"),
    ("2.6", "メモ", "文字列 60", "－", "仕入先とのやり取りなど。最大文字数は 60（コードは 200・H8）。", "仕入先より電話：1箱つぶれ", ["E04"],
     "Ghi chú", "Chuỗi 60 ký tự", "Trao đổi với nhà cung cấp, v.v. Số ký tự tối đa là 60 (code là 200・H8).", "Ghi chú tự do (ví dụ: nhà cung cấp gọi điện, 1 thùng bị móp)"),
]
CSV_RO_VI = "mã hàng・tên sản phẩm・ID nhà cung cấp・kho nhận・số lượng dự kiến・số lượng đã nhập kho・lần・trạng thái nhập kho (chỉ đọc. Chỉ có trong xuất CSV・mẫu. Không đọc khi nhập)"
CSV_RO = "品番・商品名・仕入先ID・納入倉庫・予定の数・入荷済みの数・回・入荷の状態（読み取り専用。CSV出力・テンプレートにだけ出る。取り込むときは見ない）"
cols = [{"no": "2", "ja": "CSVテンプレートの列（定義。画面には出さない）", "vi": "Cột của mẫu CSV (định nghĩa, không hiển thị trên màn hình)", "sel": "-", "kind": "area", "trig": "view",
         "detail": J("取り込むファイルの列の定義（1行目の見出し・この順）。1行＝1つの発注の今回の入荷。キー＝発注番号。読み取り専用の列：" + CSV_RO + "。テンプレートの写しは docs/05_画面設計書/CSVテンプレート/receiving.csv（作り直し方は README）。",
                    "Định nghĩa các cột của tệp nhập (tiêu đề dòng 1, theo thứ tự này). 1 dòng = lần nhập kho này của 1 đơn đặt hàng. Khóa = mã đơn đặt hàng. Các cột chỉ đọc: " + CSV_RO_VI + ". Bản sao mẫu nằm ở docs/05_画面設計書/CSVテンプレート/receiving.csv (cách tạo lại xem README).")}]
for no, ja, ln, rq, vd, ex, er, vi_ja, vi_ln, vi_vd, vi_ex in CSVCOLS:
    cols.append({"no": no, "ja": ja, "vi": vi_ja, "sel": "-", "kind": "text" if "文字" in ln else ("date" if ln == "日付" else "text"), "trig": "input", "req": rq,
                 "len": J(ln, vi_ln), "valid": J(vd, vi_vd), "detail": J(vd, vi_vd), "ex": J(ex, vi_ex), "err": er})

for _c in cols:
    if _c["no"] == "2.5":
        _c["cond"] = J("資材以外は必須。資材の発注の行は空でよい。", "Bắt buộc với hàng không phải vật tư. Dòng đơn vật tư (資材) có thể để trống.")

view("013", J("初期表示（ステップ1 ファイルを選ぶ）", "Hiển thị ban đầu (bước 1: chọn tệp)"),
     [{"no": "1", "ja": "ヘッダー", "vi": "Tiêu đề", "sel": ".ph", "kind": "area", "trig": "view"},
      {"no": "1.1", "ja": "パンくず", "vi": "Breadcrumb (đường dẫn)", "sel": ".crumb", "kind": "label", "trig": "view", "detail": J("「発注・入荷 / 入荷登録 / 入荷登録 CSV取込」。入荷登録はリンク。", "“発注・入荷 / 入荷登録 / 入荷登録 CSV取込” (Đặt hàng・nhập kho / Đăng ký nhập kho / Nhập CSV đăng ký nhập kho). “入荷登録” là liên kết.")},
      {"no": "1.2", "ja": "画面名", "vi": "Tên màn hình", "sel": ".ph h1", "kind": "label", "trig": "view", "detail": J("「入荷登録 CSV取込」", "Tên màn hình: “入荷登録 CSV取込” (Nhập CSV đăng ký nhập kho)")},
      {"no": "1.3", "ja": "キャンセル", "vi": "Hủy", "sel": ".ph .btns button::キャンセル", "kind": "button", "trig": "click", "detail": J("入荷登録へ戻る（何も登録しない）。", "Quay lại đăng ký nhập kho (không đăng ký gì).")}]
     + cols +
     [{"no": "3", "ja": "ファイルを選ぶ（ステップ1）", "vi": "Chọn tệp (bước 1)", "sel": ".card", "kind": "area", "trig": "view", "pattern": "P-CSV"},
      {"no": "3.1", "ja": "説明", "vi": "Mô tả", "sel": ".card .hint", "kind": "label", "trig": "view",
       "detail": J("1行＝1つの発注の今回の入荷。発注番号・入荷した数・箱数・入荷日（空なら今日）を入れる（賞味期限／消費期限は仕入先が入れたものを使うので入れない）。予定と違う数は「差異あり・対応待ち」で保存し、入荷登録の画面で対応を選ぶ。", "1 dòng = lần nhập kho này của 1 đơn đặt hàng. Nhập mã đơn đặt hàng・số lượng đã nhập・số thùng・ngày nhập kho (trống thì là hôm nay) (không nhập hạn sử dụng／hạn tiêu thụ vì dùng hạn nhà cung cấp đã nhập). Số lượng khác dự kiến được lưu ở “差異あり・対応待ち”, chọn cách xử lý ở màn hình đăng ký nhập kho.")},
      {"no": "3.2", "ja": "ファイルを選ぶ", "vi": "Chọn tệp", "sel": ".card button::ファイルを選ぶ", "kind": "file", "trig": "upload", "len": J("CSV（UTF-8）・5,000行まで", "CSV (UTF-8), tối đa 5.000 dòng"), "ex": J("入荷テスト.csv", "Tên tệp CSV (ví dụ tệp thử nghiệm)"), "detail": J("ファイルを選ぶか枠にドラッグ＆ドロップ。選ぶとすぐに確かめて（何も保存しない）ステップ2へ。", "Chọn tệp hoặc kéo thả vào khung. Khi chọn xong sẽ kiểm tra ngay (không lưu gì) và chuyển sang bước 2.")}],
     code="AW_RECV_002", url="/ops/purchasing/receiving/import", wait=1200,
     note=J("フル権限・入荷管理の CSV取込の権限がある人だけが開ける（ほかは入荷登録へ戻る）。列の定義（2.x）は画面には出さない。", "Chỉ người có toàn quyền hoặc quyền Nhập CSV của quản lý nhập kho mới mở được (người khác quay về đăng ký nhập kho). Định nghĩa cột (2.x) không hiển thị trên màn hình."))
CSV_SETUP = (
    "const sleep=ms=>new Promise(r=>setTimeout(r,ms));const q=s=>document.querySelector(s);"
    "const res=await fetch('/api/domain/csv/export',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json','x-es-site':'ops'},body:JSON.stringify({args:{entity:'receiving',scope:{site:'ops'}}})});"
    "const t=await res.json();const esc=v=>'\"'+String(v??'').replace(/\"/g,'\"\"')+'\"';"
    "const h=t.head;const iq=h.indexOf('入荷した数'),ib=h.indexOf('箱数'),io=h.indexOf('入荷日');const ie=h.indexOf('賞味期限／消費期限');"
    "const rows=[h];t.rows.slice(0,2).forEach((r,k)=>{const x=r.slice();x[iq]=String(k?1:r[h.indexOf('予定の数')]);x[ib]='1';x[io]='2026/10/05';x[ie]='2026/12/20';rows.push(x);});"
    "const bad=t.rows[0].slice();bad[0]='PO-XXXXXX';bad[iq]='1';bad[ib]='1';bad[io]='2026/10/05';rows.push(bad);"
    "const text='\\ufeff'+rows.map(r=>r.map(esc).join(',')).join('\\r\\n');"
    "const inp=q('input[type=file]');const dt=new DataTransfer();dt.items.add(new File([text],'入荷テスト.csv',{type:'text/csv'}));inp.files=dt.files;inp.dispatchEvent(new Event('change',{bubbles:true}));await sleep(2500);window.scrollTo(0,q('.card').offsetTop-80);"
)
view("014", J("確認・登録（ステップ2）", "Xác nhận・đăng ký (bước 2)"),
     [{"no": "4", "ja": "確認・登録（ステップ2）", "vi": "Xác nhận・đăng ký (bước 2)", "sel": ".card", "kind": "area", "trig": "show",
       "detail": J("ファイル名・件数と、行ごとの結果。「登録」でエラー以外の行を登録する（エラーの行は取り込まない・hong 2026/10/05）。", "Tên tệp・số lượng và kết quả từng dòng. Nhấn “登録” để đăng ký các dòng không lỗi (dòng lỗi không nhập, hong 2026/10/05).")},
      {"no": "4.1", "ja": "件数", "vi": "Số lượng dòng", "sel": ".card .badge", "kind": "label", "trig": "view", "detail": J("新規／更新／変更なし／エラー の件数（バッジ）。", "Số lượng dòng mới／cập nhật／không đổi／lỗi (huy hiệu).")},
      {"no": "4.2", "ja": "エラーの行", "vi": "Dòng lỗi", "sel": ".card .notice.ng", "kind": "label", "trig": "show", "err": ["E52"],
       "detail": J("「エラーの行 n件は取り込みません…」と、行番号・発注番号・列名・内容の表。内容は 2.x のチェックのとおり。", "“エラーの行 n件は取り込みません…” (n dòng lỗi sẽ không được nhập…) và bảng số dòng・mã đơn đặt hàng・tên cột・nội dung. Nội dung theo các kiểm tra ở 2.x.")},
      {"no": "4.3", "ja": "エラー一覧CSV", "vi": "CSV danh sách lỗi", "sel": ".card button::エラー一覧CSV", "kind": "button", "trig": "click", "detail": J("エラーの行だけを、元の列＋エラーの内容で書き出す（直して選び直すため）。", "Xuất riêng các dòng lỗi, gồm các cột gốc + nội dung lỗi (để sửa rồi chọn lại).")},
      {"no": "4.4", "ja": "登録する内容", "vi": "Nội dung sẽ đăng ký", "sel": ".card b::登録する内容", "kind": "label", "trig": "view",
       "detail": J("行ごとの発注番号・入荷した数・箱数・入荷日・期限。予定と違う数の行は「予定（n）と違う数のため「差異あり・対応待ち」で保存します」の警告。", "Mã đơn đặt hàng・số lượng đã nhập・số thùng・ngày nhập kho・hạn của từng dòng. Dòng có số lượng khác dự kiến hiện cảnh báo “予定（n）と違う数のため「差異あり・対応待ち」で保存します” (lưu ở trạng thái chênh lệch, chờ xử lý vì khác số lượng dự kiến n).")},
      {"no": "4.5", "ja": "ファイルを選び直す", "vi": "Chọn lại tệp", "sel": ".ph .btns button::ファイルを選び直す", "kind": "button", "trig": "click", "detail": J("ステップ1に戻る。何も登録しない。", "Quay lại bước 1. Không đăng ký gì.")},
      {"no": "4.6", "ja": "登録", "vi": "Đăng ký", "sel": ".ph .btns button.pri", "kind": "button", "trig": "click", "err": ["S10"],
       "detail": J("エラー以外の行を登録し、S10 のトースト、入荷登録へ戻る。一致した発注は入荷済みにする。差異のある発注は「差異あり・対応待ち」で保存（対応は入荷登録の画面で選ぶ）。", "Đăng ký các dòng không lỗi, hiện toast S10 và quay lại đăng ký nhập kho. Đơn đặt hàng khớp sẽ chuyển sang đã nhập kho. Đơn có chênh lệch được lưu ở “差異あり・対応待ち” (chọn cách xử lý ở màn hình đăng ký nhập kho).")}],
     code="AW_RECV_002", url="/ops/purchasing/receiving/import", setup=CSV_SETUP, wait=600,
     note=J("ファイルを選んだ直後。見本は CSV出力のファイル（予定どおりの行・1個の行）と、発注番号が誤りの行を1つ足したもの（エラーの行の見本）。", "Ngay sau khi chọn tệp. Dữ liệu mẫu là tệp xuất CSV (dòng đúng dự kiến, dòng 1 sản phẩm) cộng thêm 1 dòng có mã đơn đặt hàng sai (mẫu dòng lỗi)."))


# ---------------------------------------------------------------- レビュー（--review・役割レビュー）の指摘への直し
def _it(vid, no):
    v = next(v for v in V if v["id"] == vid)
    return next(x for x in v["items"] if x["no"] == no)


def _add(x, key, ja, vi, errs=None):
    if key:
        x[key] = J(x[key][0] + ja, x[key][1] + vi) if key in x else J(ja, vi)
    if errs:
        x["err"] = list(dict.fromkeys(list(x.get("err", [])) + errs))


v6 = next(v for v in V if v["id"] == "006")
v6["setup"] = H + "await sleep(800);const r=row0();const p=planOf(r);setv(inrow(r,'入荷した数'),String(p.qty));setv(inrow(r,'箱数'),String(p.box));await sleep(300);saveBtn().click();await sleep(1200);"
v6["note"] = J("予定と同じ数（数と箱数）を入れて「入荷を登録」を押すと S129 のトーストが出て、行は「入荷済」になる（この日に入荷済みにした行は一覧に残る）。", "Nhập số lượng và số thùng bằng dự kiến rồi nhấn “入荷を登録” thì hiện toast S129 và dòng thành “入荷済み” (dòng nhập kho trong ngày hôm nay vẫn còn trong danh sách).")

# 5.x 二重登録・ほかの人が先に登録
_add(_it("001", "5.14"), "detail", "二重に押しても1回だけ記録する。ほかの人が先に同じ入荷を登録していたときは E158（一覧を更新してやり直す）。", " Nhấn đúp cũng chỉ ghi 1 lần. Nếu người khác đã đăng ký nhập kho này trước thì báo E158 (tải lại danh sách rồi làm lại).", ["E158"])
_add(_it("001", "5.10"), None, "", "", ["E157"])

# 6.10 の分岐を表にする
x = _it("007", "6.10")
x["detail"] = J("選んだ対応を記録する。対応と出るメッセージ：分納を待つ→次の入荷予定日で「分納待ち」にして S190／代替品で対応→選んだ代替品設定の ID を記録して S192／不足を受け入れる→影響する便を ③ 除外にして S191（法人へ知らせるが ON ならメール X17＋法人Web のお知らせを送る）／多い分を受け入れる→発注を閉じて S192／対応を選んでいない→E155／ほかの人が先に対応を決めていた・二重に押した→E158。",
                "Ghi nhận cách xử lý đã chọn. Cách xử lý → thông báo: chờ giao từng phần → trạng thái “分納待ち” theo ngày nhập kho dự kiến lần sau, S190 / dùng hàng thay thế → ghi ID thiết lập hàng thay thế đã chọn, S192 / chấp nhận thiếu → loại sản phẩm khỏi các chuyến bị ảnh hưởng (③), S191 (nếu bật “法人へ知らせる” thì gửi mail X17 + thông báo Web pháp nhân) / chấp nhận phần nhiều hơn → đóng đơn, S192 / chưa chọn → E155 / người khác đã quyết trước hoặc nhấn đúp → E158.")
x["err"] = ["E155", "E158", "S190", "S191", "S192"]

# CSV取込
c21 = _it("013", "2.1")
_add(c21, "valid", "同じファイルに同じ発注番号が2行以上あるとエラー（E156）。", " Một file có 2 dòng trở lên cùng mã đơn đặt hàng thì lỗi (E156).", ["E156"])
c24 = _it("013", "2.4")
c24["err"] = ["E01", "E157"]
_add(_it("013", "3.1"), "detail", "同じ発注番号が2行以上あるとエラー（E156）。5,000行を超えるファイルは読み込めない（E51）。", " Nếu có 2 dòng trở lên cùng mã đơn đặt hàng thì lỗi (E156). File quá 5.000 dòng thì không đọc được (E51).", ["E51"])
_add(_it("014", "4.6"), "cond", "エラーを除いて登録できる行が0件のときは押せない。", " Không nhấn được khi không còn dòng hợp lệ nào (sau khi loại các dòng lỗi).", None)
_add(_it("014", "4.6"), "detail", "登録の直前にもう一度確かめる。ほかの人が先に入荷を登録していた行はその行だけ取り込まず E158 を出す。", " Kiểm tra lại ngay trước khi đăng ký. Dòng mà người khác đã đăng ký nhập kho trước thì không nhập dòng đó và báo E158.", ["E158"])


# ---------------------------------------------------------------- 2026-10-08：資材の差異の対応・状態の表示名（台帳 I）
MAT = (" 資材の入荷では出さない（資材は食品の便と一緒に送らない）。", " Không hiện với nhập kho vật tư (vật tư không đi cùng chuyến thực phẩm).")
_it("007", "6.3")["cond"] = J("不足のときだけ。資材の入荷では出さない（影響する便がない）。", "Chỉ khi thiếu hàng. Không hiện với vật tư (không có chuyến bị ảnh hưởng).")
_add(_it("007", "6.5"), "cond", *MAT)
_add(_it("009", "6.12"), "cond", *MAT)
_add(_it("009", "6.13"), "cond", *MAT)
_it("010", "6.14")["cond"] = J("「不足を受け入れる」を選んだときだけ。資材の入荷では出さない（法人への連絡はない）。", "Chỉ khi chọn “不足を受け入れる”. Không hiện với vật tư (không thông báo cho pháp nhân).")
_it("007", "6.6")["detail"] = J("食品：上の便のこの商品を足りない数だけ外す（納品分に含まれない・請求しない）。出荷指示を送った便は版番号つきで再送する。資材：便の除外はなく、不足を受け入れて発注を閉じる。", "Thực phẩm: loại sản phẩm này khỏi các chuyến ở trên đúng số lượng thiếu (không tính vào hàng giao, không tính tiền). Chuyến đã gửi chỉ thị xuất hàng sẽ được gửi lại kèm số phiên bản. Vật tư: không loại khỏi chuyến nào, chấp nhận thiếu và đóng đơn.")
_it("001", "4.7").pop("demo_ok", None)
_it("001", "4.7")["detail"] = J("入荷の状態で絞る。選ばないときは入荷済み以外（と、この日に入荷済みにしたもの）。画面の表示は未入荷／差異あり・対応待ち／分納待ち／入荷済み。", "Lọc theo trạng thái nhập kho. Khi không chọn thì hiện các đơn chưa nhập kho (và đơn đã nhập kho trong ngày). Hiển thị: 未入荷／差異あり・対応待ち／分納待ち／入荷済み.")

view("015", J("差異の対応：資材（代替品・影響する便・法人への連絡を出さない）", "Xử lý chênh lệch: vật tư (không hiện hàng thay thế, chuyến bị ảnh hưởng, thông báo pháp nhân)"), [],
     setup=H + "await openResolve(false);", wait=800,
     note=J("資材の入荷の差異：対応は「分納を待つ」「不足を受け入れる」（多いときは「多い分を受け入れる」）だけ。代替品・影響する便の表・法人へ知らせるは出さない。", "Chênh lệch nhập kho vật tư: chỉ có “分納を待つ”, “不足を受け入れる” (nếu nhiều hơn thì “多い分を受け入れる”). Không hiện hàng thay thế, bảng chuyến bị ảnh hưởng, ô thông báo pháp nhân."))


# ---------------------------------------------------------------- 2026-10-08：並べ替え・CSV取込の説明文
_v1 = next(v for v in V if v["id"] == "001")
_v1["items"] = _v1["items"] + [
    {"no": "4.10", "ja": "並べ替え（項目）", "vi": "Sắp xếp (mục)", "sel": ".card select[aria-label=\"並べ替えの項目\"]", "kind": "select", "trig": "select", "req": "－", "pattern": "P-LIST",
     "len": J("選択（入荷予定日／発注番号／仕入先／商品／納入倉庫／状態）", "Chọn (ngày nhập kho dự kiến / mã đơn / nhà cung cấp / sản phẩm / kho nhận / trạng thái)"), "init": J("並べ替え（初期の順）", "Sắp xếp (thứ tự ban đầu)"), "ex": J("仕入先", "Mục sắp xếp"),
     "detail": J("並べる項目を選ぶ。初期の並びは入荷予定日の昇順 → 発注番号の昇順（hong 2026-10-07）。", "Chọn mục sắp xếp. Thứ tự ban đầu: ngày nhập kho dự kiến tăng dần → mã đơn tăng dần (hong 2026-10-07).")},
    {"no": "4.11", "ja": "昇順・降順の切替", "vi": "Đổi tăng dần/giảm dần", "sel": ".card button[aria-label=\"昇順・降順の切替\"]", "kind": "button", "trig": "click",
     "detail": J("押すと昇順と降順が切り替わる。同じ値のときは発注番号の昇順。クリアで初期の並びに戻る。", "Nhấn để đổi tăng dần/giảm dần. Giá trị bằng nhau thì theo mã đơn tăng dần. Nhấn クリア để về thứ tự ban đầu.")},
]
_t = next(x for x in _v1["items"] if x["no"] == "5")
_t["demo_ok"] = J("コードはページ送りがない（H9）。一覧の共通（ページ送り 10／20／50件）に合わせる。", "Code chưa có phân trang (H9). Thống nhất với danh sách chung (phân trang 10/20/50).")


# ---------------------------------------------------------------- 2026-10-08：ページ送り
_t = next(x for x in _v1["items"] if x["no"] == "5")
_t.pop("demo_ok", None)
_t["detail"] = J(_t["detail"][0].replace("1回の入荷（分納は1回ごと）につき1行で入力する。", "1回の入荷（分納は1回ごと）につき1行で入力する。ページ送りは10／20／50件（初期は10件（ほかの一覧と同じ））。"), _t["detail"][1])
_v1["items"] = _v1["items"] + [
    {"no": "5.15", "ja": "ページ送り", "vi": "Phân trang", "sel": ".pager", "kind": "area", "trig": "view", "pattern": "P-PAGESIZE",
     "detail": J("「n件中 a–b件」・前へ／ページ番号／次へ・表示件数（10／20／50件／ページ。初期は10件（ほかの一覧と同じ））。条件や並べ替えを変えると1ページ目に戻る。CSV出力はページで切らず、絞り込みの全件。", "“n件中 a–b件”, trước/số trang/sau, số dòng mỗi trang (10/20/50, mặc định 10, giống các danh sách khác). Đổi điều kiện hoặc sắp xếp thì về trang 1. Xuất CSV không cắt theo trang mà xuất toàn bộ kết quả lọc.")},
]


# ---------------------------------------------------------------- 2026-10-08：入荷日の初期値＝今日（hong 回答）
_d = _it("001", "5.10")
_d["init"] = J("今日（倉庫に着いた日を登録する日）", "Hôm nay (ngày đăng ký hàng đã tới kho)")
_d["detail"] = J("実際に倉庫に着いた（入荷した）日。初期値は今日で、直せる。空のときは今日として保存する。", "Ngày hàng thực tế tới kho (nhập kho). Mặc định là hôm nay, sửa được. Để trống thì lưu là hôm nay.")
_d["valid"] = J("今日以前の日付だけ（未来の日は選べない：E157）。", "Chỉ ngày từ hôm nay trở về trước (không chọn ngày tương lai: E157).")
_d["demo_ok"] = None
_d.pop("demo_ok")
_d["err"] = ["E157"]
for _dd in DECISIONS:
    if _dd["target"] == "AW_RECV_001 No.5.10・5.11":
        _dd["a"] = J("入荷日の初期値は今日（倉庫に着いた日を登録する日）。賞味期限／消費期限の初期値は運営が発注で入れた希望の期限。どちらも編集できる。「予定どおり入荷」のボタンは置かない。資材以外は期限が必須", "Giá trị mặc định của 入荷日 là hôm nay (ngày đăng ký hàng đã tới kho). Mặc định của 賞味期限／消費期限 là hạn mong muốn mà 運営 nhập khi đặt hàng. Cả hai sửa được. Không có nút “予定どおり入荷”. Bắt buộc có hạn trừ vật tư")
        _dd["src"] = "hong 回答 2026-10-07・10-08（確認メモ C1 Q5・Q6・追加の確認 1）・台帳 I「入荷登録の入力の初期値」・受付簿 No.338"




_it("001", "5.11").pop("demo_ok", None)
_it("001", "5.11")["detail"] = J("入荷した商品の期限（通常商品は賞味期限・短消費期限商品は消費期限）。初期値は運営が発注で入れた希望の期限（なければ仕入先が本発注の承認で入れた期限）。直せる。空のままでは保存できない。", "Hạn của hàng đã nhập kho (hàng thường: 賞味期限, hàng hạn ngắn: 消費期限). Mặc định là hạn mong muốn mà 運営 nhập khi đặt hàng (nếu không có thì hạn nhà cung cấp nhập khi phê duyệt). Sửa được. Không lưu được khi để trống.")


# ---------------------------------------------------------------- 2026-10-08：hong レビュー（検索欄・期間・一括登録・期限は表示のみ・お知らせは常に送る）
def _num(no):
    return tuple(int(x) for x in no.split("."))

def _by(v, no):
    return next(x for x in v["items"] if x["no"] == no)

_v1 = next(v for v in V if v["id"] == "001")
_v1["items"] = [x for x in _v1["items"] if not (x["no"].startswith("4") or x["no"] in ("5.14", "5.15"))]
_v1["items"] += [
    {"no": "3.1", "ja": "入荷日（まとめて保存の入荷日）", "vi": "Ngày nhập kho (dùng chung khi lưu gộp)", "sel": "#rrecv", "kind": "date", "trig": "input", "req": "－", "len": J("日付", "Ngày"),
     "init": J("今日", "Hôm nay"), "ex": J("2026-10-05", "Ngày, dạng YYYY-MM-DD"), "err": ["E157"],
     "valid": J("今日以前の日付だけ（未来の日は選べない：E157。入力欄の下に出す）。空のときは今日として保存する。", "Chỉ ngày từ hôm nay trở về trước (không chọn ngày tương lai: E157, hiện bên dưới ô nhập). Để trống thì lưu là hôm nay."),
     "detail": J("実際に倉庫に着いた日。「保存」で登録する行すべてに同じ日を入れる（行ごとには入れない：hong 2026-10-08）。初期値は今日。", "Ngày hàng thực tế tới kho. Dùng cùng một ngày cho tất cả các dòng được đăng ký bằng “保存” (không nhập theo từng dòng: hong 2026-10-08). Mặc định là hôm nay.")},
    {"no": "3.2", "ja": "保存", "vi": "Lưu", "sel": ".card button::保存", "kind": "button", "trig": "click", "err": ["E154", "S129", "W124", "E158"],
     "cond": J("入荷管理の「入荷の登録」の権限（倉庫スタッフ・商品開発・フル権限など）。入荷した数か箱数を入れた行が1つ以上あるとき押せる。", "Quyền “đăng ký nhập kho” của quản lý nhập kho (nhân viên kho・phát triển sản phẩm・toàn quyền, v.v.). Nhấn được khi có từ 1 dòng đã nhập số lượng hoặc số thùng."),
     "detail": J("入荷した数か箱数を入れた行を、まとめて登録する（ページをまたいでも、入れた行すべて）。先に全行を確かめ、誤りがあれば1行も保存せず、誤りの欄を赤くして下にメッセージを出す（E01・E14 など）とともに E154 のトースト。誤りがなければ、予定と同じ数の行は入荷済みにし、予定と違う数の行は「差異あり・対応待ち」で保存する。全部予定どおりなら S129、違う行があれば W124 を出して、差異の対応（モーダル）を開く（複数あるときは先頭の行。残りは一覧の「差異の対応」から）。入荷した数は倉庫在庫・代替品設定の在庫の見込みに入る。二重に押しても1回だけ記録する。ほかの人が先に同じ入荷を登録していたときは E158。", "Đăng ký gộp các dòng đã nhập số lượng hoặc số thùng (kể cả khi nằm ở nhiều trang). Kiểm tra tất cả các dòng trước; nếu có lỗi thì không lưu dòng nào, tô đỏ ô lỗi và hiện thông báo bên dưới (E01・E14, v.v.) cùng toast E154. Nếu không có lỗi thì dòng bằng số lượng dự kiến thành đã nhập kho, dòng khác dự kiến được lưu ở “差異あり・対応待ち”. Nếu tất cả đúng dự kiến thì S129, nếu có dòng khác thì W124 và mở xử lý chênh lệch (modal) (nhiều dòng thì mở dòng đầu, các dòng còn lại xử lý từ “差異の対応” trên danh sách). Số lượng nhập được tính vào tồn kho và dự kiến tồn kho của cài đặt hàng thay thế. Nhấn đúp cũng chỉ ghi 1 lần. Nếu người khác đã đăng ký nhập kho này trước thì E158.")},
    {"no": "4", "ja": "検索条件", "vi": "Điều kiện tìm kiếm", "sel": ".filter", "kind": "area", "trig": "view", "pattern": "P-LIST",
     "detail": J("他の一覧と同じ検索の部品（キーワード・期間・選ぶ条件）。条件を入れて「検索」か Enter で反映する。「未適用」の印は出さない。", "Dùng cùng thành phần tìm kiếm như các danh sách khác (từ khóa・khoảng thời gian・điều kiện chọn). Nhập điều kiện rồi nhấn “検索” hoặc Enter để phản ánh. Không hiển thị dấu “未適用”."),
     "demo_ok": J("コードは前日・今日・翌日・すべての日のボタンと独自の検索欄を持つ。他の一覧と同じ検索の部品（期間つき）に変える（hong 2026-10-08）。", "Code có các nút Hôm trước・Hôm nay・Hôm sau・Tất cả các ngày và ô tìm kiếm riêng. Đổi sang thành phần tìm kiếm giống các danh sách khác (có khoảng thời gian) (hong 2026-10-08).")},
    {"no": "4.1", "ja": "キーワード", "vi": "Từ khóa", "sel": ".filter .search input", "kind": "text", "trig": "input", "req": "－", "len": J("文字列", "Chuỗi"), "init": J("空欄", "Để trống"), "ex": J("PO-202610-M004", "Mã đơn, tên sản phẩm hoặc nhà cung cấp"),
     "detail": J("発注番号・商品名・仕入先名のどれかに含まれる文字で絞る。", "Lọc theo ký tự có trong mã đơn đặt hàng, tên sản phẩm hoặc tên nhà cung cấp.")},
    {"no": "4.2", "ja": "入荷予定日（から）", "vi": "Ngày nhập kho dự kiến (từ)", "sel": "input[aria-label=\"入荷予定日（から）\"]", "kind": "date", "trig": "input", "req": "－", "len": J("日付", "Ngày"), "init": J("空", "Trống"),
     "ex": J("2026-10-06", "Ngày, dạng YYYY-MM-DD"),
     "detail": J("入荷予定日（分納の次の回は次の入荷予定日）がこの日以後の発注。空なら下限なし。", "Đơn đặt hàng có ngày nhập kho dự kiến (lần tiếp theo của giao từng phần là ngày nhập kho dự kiến tiếp theo) từ ngày này trở đi. Để trống là không giới hạn dưới.")},
    {"no": "4.3", "ja": "入荷予定日（まで）", "vi": "Ngày nhập kho dự kiến (đến)", "sel": "input[aria-label=\"入荷予定日（まで）\"]", "kind": "date", "trig": "input", "req": "－", "len": J("日付", "Ngày"), "init": J("空", "Trống"),
     "ex": J("2026-10-10", "Ngày, dạng YYYY-MM-DD"),
     "detail": J("入荷予定日がこの日以前の発注。空なら上限なし。両方空のときは入荷済み以外の全部（と今日入荷済みにしたもの）。", "Đơn đặt hàng có ngày nhập kho dự kiến đến ngày này. Để trống là không giới hạn trên. Khi cả hai trống là tất cả trừ đã nhập kho (và những đơn đã nhập kho trong hôm nay).")},
    {"no": "4.4", "ja": "納入倉庫", "vi": "Kho nhận", "sel": "select[aria-label=\"納入倉庫（すべて）\"]", "kind": "select", "trig": "select", "req": "－",
     "len": J("選択（納入倉庫のすべて／ES事務所（資材）／中部倉庫／関東倉庫／関西倉庫）", "Chọn (tất cả kho nhận／Văn phòng ES (vật tư)／Kho Chubu／Kho Kanto／Kho Kansai)"), "init": J("納入倉庫（すべて）", "Kho nhận (tất cả)"), "ex": J("関東倉庫", "Một kho nhận (kho Kanto)"),
     "detail": J("発注の納入倉庫で絞る。", "Lọc theo kho nhận của đơn đặt hàng.")},
    {"no": "4.5", "ja": "入荷の状態", "vi": "Trạng thái nhập kho", "sel": "select[aria-label^=\"入荷の状態\"]", "kind": "select", "trig": "select", "req": "－",
     "len": J("選択（未入荷／差異あり・対応待ち／分納待ち／入荷済）", "Chọn (chưa nhập kho / chênh lệch, chờ xử lý / chờ giao từng phần / đã nhập kho)"), "init": J("入荷の状態（入荷済み以外）", "Trạng thái nhập kho (trừ đã nhập kho)"), "ex": J("差異あり・対応待ち", "Một trạng thái nhập kho (chênh lệch, chờ xử lý)"),
     "detail": J("入荷の状態で絞る。選ばないときは入荷済み以外（と、今日入荷済みにしたもの）。", "Lọc theo trạng thái nhập kho. Khi không chọn là tất cả trừ đã nhập kho (và những đơn đã nhập kho trong hôm nay).")},
    {"no": "4.6", "ja": "クリア", "vi": "Xóa điều kiện", "sel": ".filter .f-act button::クリア", "kind": "button", "trig": "click", "detail": J("条件を初期値に戻す。並べ替えも初期の順に戻す。", "Đưa các điều kiện về giá trị ban đầu. Sắp xếp cũng về thứ tự ban đầu.")},
    {"no": "4.7", "ja": "検索", "vi": "Tìm kiếm", "sel": ".filter .f-act button::検索", "kind": "button", "trig": "click", "detail": J("条件を一覧に反映して1ページ目に戻る。", "Phản ánh các điều kiện vào danh sách và về trang 1.")},
    {"no": "4.8", "ja": "並べ替え（項目）", "vi": "Sắp xếp (mục)", "sel": ".filter select[aria-label=\"並べ替えの項目\"]", "kind": "select", "trig": "select", "req": "－",
     "len": J("選択（入荷予定日／発注番号／仕入先／商品／納入倉庫／状態）", "Chọn (ngày nhập kho dự kiến / mã đơn / nhà cung cấp / sản phẩm / kho nhận / trạng thái)"), "init": J("並べ替え（初期の順）", "Sắp xếp (thứ tự ban đầu)"), "ex": J("仕入先", "Mục sắp xếp"),
     "detail": J("並べる項目を選ぶ。初期の並びは入荷予定日の昇順 → 発注番号の昇順（hong 2026-10-07）。", "Chọn mục sắp xếp. Thứ tự ban đầu: ngày nhập kho dự kiến tăng dần → mã đơn tăng dần (hong 2026-10-07).")},
    {"no": "4.9", "ja": "昇順・降順の切替", "vi": "Đổi tăng dần/giảm dần", "sel": ".filter button[aria-label=\"昇順・降順の切替\"]", "kind": "button", "trig": "click",
     "detail": J("押すと昇順と降順が切り替わる。同じ値のときは発注番号の昇順。クリアで初期の並びに戻る。", "Nhấn để đổi tăng dần/giảm dần. Giá trị bằng nhau thì theo mã đơn tăng dần. Nhấn クリア để về thứ tự ban đầu.")},
    {"no": "5.14", "ja": "ページ送り", "vi": "Phân trang", "sel": ".pager", "kind": "area", "trig": "view", "pattern": "P-PAGESIZE",
     "detail": J("「n件中 a–b件」・前へ／ページ番号／次へ・表示件数（10／20／50件／ページ。初期は10件（ほかの一覧と同じ））。条件や並べ替えを変えると1ページ目に戻る。CSV出力はページで切らず、絞り込みの全件。", "“n件中 a–b件”, trước/số trang/sau, số dòng mỗi trang (10/20/50, mặc định 10, giống các danh sách khác). Đổi điều kiện hoặc sắp xếp thì về trang 1. Xuất CSV không cắt theo trang mà xuất toàn bộ kết quả lọc.")},
]
_by(_v1, "3")["detail"] = J("運営（システム管理）が入荷した商品の数と箱数を入れる（倉庫にはアカウントがない・THOMAS の入荷実績 CSV は使わない）。入れた行を上の「保存」でまとめて登録する。発注の数（分納の2回目からは残り）と同じなら入荷済み。違えば「差異あり・対応待ち」で保存し、影響する法人の注文・便を確かめて、分納を待つ（3回まで）／代替品で対応／不足を受け入れる から選ぶ。賞味期限／消費期限は仕入先が入れたものを見せるだけ（ここでは入れない）。", "Quản trị vận hành (quản trị hệ thống) nhập số lượng và số thùng sản phẩm đã nhập kho (kho không có tài khoản, không dùng CSV kết quả nhập kho của THOMAS). Các dòng đã nhập được đăng ký gộp bằng nút “保存” ở trên. Nếu bằng số lượng đặt hàng (từ lần giao thứ 2 của giao từng phần là số còn lại) thì là đã nhập kho. Nếu khác thì lưu ở “差異あり・対応待ち”, kiểm tra đơn hàng và chuyến giao của pháp nhân bị ảnh hưởng, rồi chọn: chờ giao từng phần (tối đa 3 lần) / xử lý bằng hàng thay thế / chấp nhận thiếu hàng. Hạn sử dụng (賞味期限)／hạn tiêu thụ (消費期限) chỉ hiển thị phần nhà cung cấp đã nhập (không nhập ở đây).")
_by(_v1, "5")["detail"] = J(_by(_v1, "5")["detail"][0].replace("1回の入荷（分納は1回ごと）につき1行で入力する。", "1回の入荷（分納は1回ごと）につき1行。入れた行は上の「保存」でまとめて登録する（行ごとの登録ボタンはない）。"), _by(_v1, "5")["detail"][1])
_by(_v1, "5")["detail"] = J(_by(_v1, "5")["detail"][0].replace("入荷済みの行は入力ではなく、入荷した内容を見せる。", "入荷済みの行は入力ではなく、入荷した内容を見せる。"), _by(_v1, "5")["detail"][1])
_by(_v1, "5.1")["detail"] = J("仕入先が答えた入荷予定日（yyyy-mm-dd の形式。分納の次の回があるときは次の入荷予定日・「分納の次の回」と添える）。", "Ngày nhập kho dự kiến mà nhà cung cấp trả lời (dạng yyyy-mm-dd; khi có lần tiếp theo của giao từng phần thì là ngày nhập kho dự kiến tiếp theo, kèm chú thích “分納の次の回”).")
_x = _by(_v1, "5.7")
_x["ja"], _x["vi"] = "入荷の回", "Lần nhập kho"
_x["detail"] = J("「1回目」「2回目」「3回目」。分納の2回目以降は「分納」と添える（分納は3回まで・運営の設定で変えられる【仮】）。", "“1回目”, “2回目”, “3回目”. Từ lần thứ 2 của giao từng phần thì kèm chú thích “分納” (giao từng phần tối đa 3 lần, quản trị vận hành có thể đổi trong cài đặt [tạm]).")
for _n in ("5.8", "5.9"):
    _x = _by(_v1, _n)
    _x["err"] = ["E01", "E14"]
    _x["valid"] = J(_x["valid"][0] + "誤りは「保存」のときまとめて確かめ、誤りのある欄を赤くして下にメッセージを出す（空は E01・数字でないものは E14）。", _x["valid"][1] + " Lỗi được kiểm tra gộp khi nhấn “保存”, ô lỗi được tô đỏ và hiện thông báo bên dưới (trống: E01, không phải số: E14).")
_x = _by(_v1, "5.10")
_x["ja"], _x["vi"], _x["kind"], _x["trig"], _x["sel"] = "入荷日", "Ngày nhập kho", "label", "view", ".tbl tbody tr:first-child td:nth-child(10)"
for _k in ("init", "valid", "len", "ex", "req", "err"):
    _x.pop(_k, None)
_x["detail"] = J("入荷済み・差異あり・対応待ちの行に、登録した入荷日を見せる（未入荷の行は「—」。入れるのは上の入荷日で1回だけ：3.1）。", "Hiển thị ngày nhập kho đã đăng ký ở các dòng đã nhập kho／chênh lệch chờ xử lý (dòng chưa nhập hiện “—”. Chỉ nhập một lần ở ô ngày nhập kho phía trên: 3.1).")
_x = _by(_v1, "5.11")
_x["kind"], _x["trig"], _x["sel"] = "label", "view", ".tbl tbody tr:first-child td:nth-child(11)"
for _k in ("init", "valid", "len", "ex", "req", "err", "cond"):
    _x.pop(_k, None)
_x["cond"] = J("資材の発注は「—」。", "Với đơn đặt hàng vật tư hiện “—”.")
_x["detail"] = J("入荷する商品の期限（通常商品は賞味期限・短消費期限商品は消費期限）。仕入先が本発注の承認で入れたものを表示するだけ（運営が発注で希望の期限を入れているときはそれ）。ここでは入れない・直さない。未入力なら「—」（hong 2026-10-08）。", "Hạn của hàng nhập kho (hàng thường: 賞味期限, hàng hạn ngắn: 消費期限). Chỉ hiển thị phần nhà cung cấp đã nhập khi duyệt đặt hàng chính thức (nếu quản trị vận hành nhập hạn mong muốn khi đặt hàng thì lấy hạn đó). Không nhập, không sửa ở đây. Chưa nhập thì hiện “—” (hong 2026-10-08).")
_by(_v1, "5.12")["sel"] = ".tbl tbody tr:first-child input[placeholder=\"メモ\"]"
_by(_v1, "5.13")["detail"] = J(_by(_v1, "5.13")["detail"][0], _by(_v1, "5.13")["detail"][1])
_v1["items"].sort(key=lambda x: _num(x["no"]))
_v1["note"] = J("入荷予定日の昇順。見本は未入荷 152・差異あり・対応待ち 1・入荷済 179（今日入荷済みにしたもの以外は出さない）。検索は他の一覧と同じ部品（期間つき）。", "Ngày nhập kho dự kiến tăng dần. Dữ liệu mẫu: chưa nhập kho 152・chênh lệch chờ xử lý 1・đã nhập kho 179 (không hiển thị những đơn đã nhập kho trước hôm nay). Tìm kiếm dùng cùng thành phần như các danh sách khác (có khoảng thời gian).")
_v2 = next(v for v in V if v["id"] == "002")
for _x in _v2["items"]:
    if _x["no"] == "5.15":
        _x["no"] = "5.14"
_v3 = next(v for v in V if v["id"] == "003")
_v3["note"] = J("該当なし：「入荷予定はありません」。", "Không có kết quả: “入荷予定はありません”.")
_v10 = next(v for v in V if v["id"] == "010")
_v10["items"] = [x for x in _v10["items"] if x["no"] != "6.14"]
_v10["note"] = J("「不足を受け入れる」を選んでも、お知らせの選択はない。該当の商品を注文した拠点には、メール X17＋法人Web のお知らせを常に送る（hong 2026-10-08）。", "Dù chọn “不足を受け入れる” cũng không có lựa chọn thông báo. Luôn gửi email X17 + thông báo trên Web pháp nhân cho các chi nhánh đã đặt sản phẩm tương ứng (hong 2026-10-08).")
for _x in _v10["items"]:
    if _x["no"] == "6.6":
        _x["detail"] = J(_x["detail"][0] + "法人へのお知らせ（メール X17＋法人Web のお知らせ）は常に送る（選べない）。", _x["detail"][1] + " Luôn gửi thông báo cho pháp nhân (email X17 + thông báo trên Web pháp nhân), không chọn được.")
for _dd in DECISIONS:
    if _dd["target"] == "AW_RECV_001 No.5.10・5.11":
        _dd["target"] = "AW_RECV_001 No.3.1・5.11"
        _dd["a"] = J("入荷日は「保存」の横の欄で1回だけ入れる（初期は今日・今日以前だけ）。行ごとには入れない。賞味期限／消費期限は仕入先が入れたものを表示するだけで、入荷登録では入れない・直さない。入荷登録に「予定どおり入荷」のボタンは置かない。入れた行は「保存」でまとめて登録する", "Ngày nhập kho chỉ nhập một lần ở ô cạnh nút “保存” (mặc định hôm nay, chỉ đến hôm nay). Không nhập theo từng dòng. Hạn sử dụng (賞味期限)／hạn tiêu thụ (消費期限) chỉ hiển thị phần nhà cung cấp đã nhập, không nhập, không sửa ở đăng ký nhập kho. Không đặt nút “予定どおり入荷”. Các dòng đã nhập được đăng ký gộp bằng “保存”")
        _dd["src"] = "hong 回答 2026-10-08（レビュー）・台帳 I「入荷登録の入力の初期値」・受付簿"
for _dd in DECISIONS:
    if "法人へ知らせる" in _dd["q"][0] if isinstance(_dd["q"], (list, tuple)) else "法人へ知らせる" in str(_dd["q"]):
        _dd["a"] = J("知らせる：代替品の「お客様への知らせ」（メール X17＋法人Web のお知らせ。該当の商品を注文した拠点だけ）を、選ばせずに常に送る（hong 2026-10-08）", "Có thông báo: dùng “thông báo cho khách” của hàng thay thế (email X17 + thông báo Web pháp nhân, chỉ chi nhánh đã đặt sản phẩm tương ứng), luôn gửi và không cho chọn (hong 2026-10-08)")


# ---------------------------------------------------------------- 2026-10-08：差異の対応の追加（hong レビュー）
_v9 = next(v for v in V if v["id"] == "009")
_v9["items"] += [
    {"no": "6.15", "ja": "代替品で対応したあとの流れ", "vi": "Luồng sau khi xử lý bằng hàng thay thế", "sel": ".mbox label::代替品で対応", "kind": "label", "trig": "view",
     "cond": J("「代替品で対応」を選んで「この対応にする」を押したあと", "Sau khi chọn “代替品で対応” và nhấn “この対応にする”"),
     "detail": J("① 入荷の差異の記録は「対応済み（代替品で対応・代替品設定の ID）」になり、この発注は閉じる。\n② 代替品設定（メニュー管理＞商品注文管理）で決めた期間・範囲の法人の注文・配送データが、代替品に置き換わる（差し替え）か、次の便で補償として足される（補償）。出荷指示を送った便は版番号つきで再送する。\n③ お届け詳細・納品書・月次注文・ドライバーアプリ・委託配送先の納品リストに「代替品（元：〇〇）」と出る。\n④ 該当の商品を注文した拠点には、メール X17＋法人Web のお知らせを送る（既定。代替品設定の「お客様への知らせ」）。\n⑤ 倉庫の在庫が足りない分は、代替品の追加発注が発注一覧に自動で出る（入荷予定は保存から3日後）。\n⑥ 仕入先への支払いは、不良の数 × 仕入単価を「不良控除（返品）」としてその月の支払額から引く。", "① Bản ghi chênh lệch nhập kho chuyển sang “対応済み (xử lý bằng hàng thay thế, ID cài đặt hàng thay thế)”, đơn đặt hàng này được đóng.\n② Đơn hàng và dữ liệu giao hàng của pháp nhân trong khoảng thời gian・phạm vi đã đặt ở cài đặt hàng thay thế (Quản lý menu > Quản lý đặt hàng sản phẩm) được thay bằng hàng thay thế (thay thế), hoặc được bổ sung ở chuyến sau như bồi thường (bồi thường). Chuyến đã gửi chỉ thị xuất kho thì gửi lại kèm số phiên bản.\n③ Trên chi tiết giao hàng・phiếu giao hàng・đơn hàng hằng tháng・ứng dụng tài xế・danh sách giao hàng của đơn vị giao hàng ủy thác hiện “Hàng thay thế (gốc: ○○)”.\n④ Chi nhánh đã đặt sản phẩm tương ứng được gửi email X17 + thông báo trên Web pháp nhân (mặc định, “thông báo cho khách” của cài đặt hàng thay thế).\n⑤ Phần tồn kho kho không đủ thì đơn đặt hàng bổ sung hàng thay thế tự động hiện trong danh sách đặt hàng (dự kiến nhập kho sau 3 ngày kể từ khi lưu).\n⑥ Thanh toán cho nhà cung cấp: số lượng lỗi × đơn giá nhập được trừ khỏi số tiền thanh toán của tháng dưới dạng “不良控除（返品）”.")},
]
_v11 = next(v for v in V if v["id"] == "011")
_v11["items"] += [
    {"no": "6.16", "ja": "仕入先への支払いの数", "vi": "Số lượng thanh toán cho nhà cung cấp", "sel": ".mbox label::入荷した数", "kind": "radio", "trig": "click", "req": "○",
     "len": J("選択（発注した数で払う／入荷した数で払う）", "Chọn (thanh toán theo số đã đặt / theo số đã nhập kho)"), "init": J("発注した数で払う", "Thanh toán theo số đã đặt"), "ex": J("入荷した数で払う", "Thanh toán theo số đã nhập kho"),
     "cond": J("予定より多く入荷したときだけ", "Chỉ khi đã nhập nhiều hơn dự kiến"),
     "detail": J("多い分の代金を払うかを、そのとき運営が選ぶ（hong 2026-10-08）。「入荷した数で払う」を選ぶと、多い数 × 仕入単価をその月の発注金額（仕入先への支払いの集計）に足す。「発注した数で払う」なら足さない。", "Quản trị vận hành chọn tại thời điểm đó có trả tiền phần nhiều hơn hay không (hong 2026-10-08). Nếu chọn “入荷した数で払う” thì số lượng nhiều hơn × đơn giá nhập được cộng vào số tiền đặt hàng của tháng (tổng hợp thanh toán cho nhà cung cấp). Nếu chọn “発注した数で払う” thì không cộng.")},
]
_by(_v1, "3.2")["detail"] = J(_by(_v1, "3.2")["detail"][0].replace("（複数あるときは先頭の行。残りは一覧の「差異の対応」から）", "（複数あるときは1件ずつ続けて開く。閉じる／決めると次の行の対応が開く）"), _by(_v1, "3.2")["detail"][1].replace("(nhiều dòng thì mở dòng đầu, các dòng còn lại xử lý từ “差異の対応” trên danh sách)", "(nhiều dòng thì mở lần lượt từng dòng: khi đóng/quyết định xong thì mở xử lý của dòng tiếp theo)"))

VIEWS = V
