# -*- coding: utf-8 -*-
"""
画面設計書のデータ：運営管理者Web「棚卸し（拠点在庫）」（AW_STCK）。運営E（請求・購入）の1機能。
元は本物の Web（app/ops/billing/stock・lib/ops/billing/{logic,masters,types}.ts・lib/ops/areas/billing.ts）。
決まり：docs/決定台帳.md F の 2026-10-08 の行（在庫調整（まとめて）の保存・在庫の代理入力・確認済にするの権限・休止の月の実績精算・「締め月を進める」ボタン）と 2026-10-07 の行（「棚卸し（拠点在庫）の画面名・権限・調整」「運営の棚卸の代理入力・確認済」「請求の締め月の進め方」「運営E の選べる月・CSV の列」）。
洗い出し：docs/05_画面設計書/確認メモ_AW_運営E_請求・購入.md Part 1-A と「回答」節（hong 2026-10-07・提案どおり）。
作り方：データは台帳に合わせて書いた。コードが台帳と違うところは demo_ok（理由つき）。台帳にもない点は open（ask）にした。

画面（Screen Code）：001 一覧＝/ops/billing/stock／002 在庫詳細＝/ops/billing/stock/{拠点ID}／003 在庫調整＝/ops/billing/stock/{拠点ID}/edit／
004 在庫調整（まとめて）＝/ops/billing/stock/bulk?ids=…／005 棚卸の代理入力＝/ops/billing/stock/{拠点ID}/count（台帳で新設。まだコードにない）。
状態（VIEWS）の id は 001 から連番。メモの 36 状態から、台帳で消えたもの（督促・取消・経理の鉛筆）を外し、新設の代理入力・確認済・商品を足す行を足した。
「【撮影不可】」と書いた状態は、いまの見本データ（seed）で再現できない、またはコードにまだ画面がない（sel・setup は想定）。

004 の拠点を選んだ状態も【撮影不可】：本物の Web の「在庫調整（まとめて）」は、拠点の在庫行に無い商品を引いて落ち（Cannot read properties of undefined (reading 'prev')）、どの拠点でも画面が出ない（app/ops/billing/stock/bulk/page.tsx）。コードの直しを待つ。

メッセージ：新規は 運営E の範囲（E180〜E181・Q140・S140〜S141・I142・W140）だけ。W140 は残るが、台帳 F 2026-10-08 で 004 の err から外した（一部スキップはしない）。代理入力の E320・E327 は法人Web の E320・E327 に統合して廃止した（ja_o を足して共用。2026-10-08）。
運営E 共通の W141（詳細・実績精算の読み込めなかった）・E184（実績精算が確定済みのため変更できない）は実績精算で採番済み。
"""

TITLE = ["棚卸し（拠点在庫）（AW_STCK）", "Kiểm kê (tồn kho chi nhánh) (AW_STCK)"]
SHEET = ["棚卸し（拠点在庫）", "Kiểm kê (tồn kho chi nhánh)"]
BASENAME = "画面設計書_AW_STCK_棚卸し"
IMG_PREFIX = "AW_STCK"
OUT_DIR = "AW_STCK_棚卸し"
CODE_NOTE = ["画面コード規約：AW＝Admin Web、STCK＝棚卸し（拠点在庫）。005 は台帳 F 2026-10-07 で新設（棚卸の代理入力）", "Quy ước mã màn hình: AW = Admin Web, STCK = Kiểm kê (tồn kho chi nhánh). 005 được thêm mới theo 台帳 F 2026-10-07 (nhập thay kiểm kê)"]
SITE = "ops"
SYSTEM = {"ja": "運営管理者Web", "vi": "Web quản trị vận hành"}
AUTHOR = "Claude（cloud）／確認：hong"
CREATED = "2026-10-07"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "ops", "loginId": "Ad00010"}
CODE_PATHS = ["app/ops/billing/stock", "app/ops/billing/_components", "lib/ops/billing", "lib/domain/seed"]

_HY = "hong 回答（チャット 2026-10-07・提案どおり）"
DECISIONS = [
    {"date": "2026-10-07", "target": "AW_STCK 全体（画面名）", "q": ["画面名（メニュー・タイトル・パンくず・CSV名）", "Tên màn hình (menu, tiêu đề, breadcrumb, tên CSV)"],
     "a": ["「棚卸し（拠点在庫）」に統一。子画面は 在庫詳細／在庫調整／在庫調整（まとめて）。「在庫管理」は権限の機能名としてだけ残す", "Thống nhất là 「棚卸し（拠点在庫）」(Kiểm kê tồn kho chi nhánh). Các màn con: Chi tiết tồn kho / Điều chỉnh tồn kho / Điều chỉnh tồn kho (hàng loạt). 「在庫管理」 chỉ còn là tên chức năng trong bảng quyền"], "src": _HY + " STCK Q-S1（台帳 F）"},
    {"date": "2026-10-07", "target": "AW_STCK_003・004・002 No.1.2", "q": ["在庫調整の権限（単件・まとめて・取消）", "Quyền điều chỉnh tồn kho (từng chi nhánh, hàng loạt, hủy)"],
     "a": ["在庫調整（単件・まとめて）は フル権限・システム管理だけ。経理・CS・物流は閲覧とCSV出力だけ（鉛筆・まとめて在庫調整は出さない）", "Điều chỉnh tồn kho (từng chi nhánh, hàng loạt) chỉ dành cho Toàn quyền và Quản trị hệ thống. Kế toán, CS, Logistics chỉ xem và xuất CSV (không hiện biểu tượng bút chì và nút điều chỉnh tồn kho hàng loạt)"], "src": _HY + " STCK Q-S3（台帳 F）"},
    {"date": "2026-10-07", "target": "AW_STCK_002 No.6・003 No.5", "q": ["在庫調整の取消", "Hủy điều chỉnh tồn kho"],
     "a": ["取消は置かない。誤りは反対向きの調整を新しく入れる（履歴は増えるだけ）", "Không có chức năng hủy. Nếu sai thì nhập thêm một điều chỉnh ngược chiều (lịch sử chỉ tăng thêm)"], "src": _HY + " STCK Q-S4（台帳 F）"},
    {"date": "2026-10-07", "target": "AW_STCK_003 No.4.3・004 No.5", "q": ["調整で選べる商品と拠点間の移動", "Sản phẩm chọn được khi điều chỉnh và việc chuyển giữa các chi nhánh"],
     "a": ["単件・まとめてとも全商品から選べる。拠点間の移動は「まとめて」の画面で 移動元に −、移動先に ＋ を別々に入れる（1操作の移動画面は作らない）", "Cả từng chi nhánh và hàng loạt đều chọn được từ toàn bộ sản phẩm. Chuyển giữa các chi nhánh nhập ở màn hình hàng loạt: nhập − cho nơi chuyển đi và ＋ cho nơi chuyển đến, riêng từng ô (không làm màn hình chuyển một thao tác)"], "src": _HY + " STCK Q-S5（台帳 F）"},
    {"date": "2026-10-07", "target": "AW_STCK_002 No.1", "q": ["「督促を送る」ボタン", "Nút 「督促を送る」 (Gửi nhắc nhở)"],
     "a": ["置かない（毎週の自動リマインドだけ）", "Không đặt (chỉ có nhắc nhở tự động hằng tuần)"], "src": _HY + " STCK Q-S6（台帳 F）"},
    {"date": "2026-10-07", "target": "AW_STCK_001 No.3・4", "q": ["一覧の初期の並び・棚卸の絞り込み・検索欄", "Thứ tự ban đầu của danh sách, bộ lọc kiểm kê, ô tìm kiếm"],
     "a": ["初期の並びは拠点ID の昇順。「棚卸」の絞り込みは すべて／棚卸前／棚卸後／棚卸なし の4つ。検索は 拠点名・拠点ID・子契約番号", "Thứ tự ban đầu là ID chi nhánh tăng dần. Bộ lọc 「棚卸」 có 4 giá trị: Tất cả / Trước kiểm kê / Sau kiểm kê / Không kiểm kê. Tìm kiếm theo tên chi nhánh, ID chi nhánh, số hợp đồng con"], "src": _HY + " STCK Q-S7（台帳 F）"},
    {"date": "2026-10-07", "target": "AW_STCK_005・002 No.1.3・1.4", "q": ["運営の棚卸の代理入力と確認済", "Vận hành nhập thay kiểm kê và xác nhận"],
     "a": ["代理入力は専用の画面（/ops/billing/stock/{ID}/count・AW_STCK_005）。商品ごとの 今ある数・捨てた数・届いた数、0〜999,999、報告者＝ログイン中の運営、方法＝「運営（代理入力）」、最後の報告が有効。在庫詳細に「確認済にする」を置く（確認後は法人・ドライバーは報告し直せない＝E326）", "Nhập thay có màn hình riêng (/ops/billing/stock/{ID}/count, AW_STCK_005). Theo từng sản phẩm: số hiện có, số đã bỏ, số đã nhận, 0〜999,999; người báo cáo = nhân viên vận hành đang đăng nhập, cách báo cáo = 「運営（代理入力）」, báo cáo cuối cùng có hiệu lực. Đặt nút 「確認済にする」 ở chi tiết tồn kho (sau khi xác nhận, pháp nhân và tài xế không báo cáo lại được = E326)"], "src": _HY + " STCK Q-S2（台帳 F）"},
    {"date": "2026-10-07", "target": "AW_STCK_001 No.2", "q": ["締め月の進め方", "Cách chuyển tháng chốt"],
     "a": ["運営が「締め月を進める」操作で進める（全請求書が発行済み／取消のときだけ押せる。残りがあれば警告）。暦では自動で進めない。棚卸し・実績精算・請求で同じ", "Vận hành chuyển bằng thao tác 「締め月を進める」 (chỉ bấm được khi toàn bộ hóa đơn đã phát hành hoặc đã hủy; còn sót thì cảnh báo). Không tự chuyển theo lịch. Kiểm kê, quyết toán thực tế, thanh toán đều giống nhau"], "src": _HY + " Q-E6・STCK X1（台帳 F）"},
    {"date": "2026-10-07", "target": "AW_STCK_001 No.3.1・1.1", "q": ["選べる月とCSVの列", "Các tháng chọn được và các cột CSV"],
     "a": ["選べる月は写し（確定時の保存）のある月すべて（初期値＝当月）。CSV は画面の列＋全項目の ID・名前・状態・更新日時、1行＝1拠点（商品別は要望が出てから）。ファイル名は画面名に合わせる", "Các tháng chọn được là mọi tháng có bản lưu (lưu khi chốt) (giá trị ban đầu = tháng hiện tại). CSV gồm các cột trên màn hình + ID, tên, trạng thái, thời điểm cập nhật của mọi mục, 1 dòng = 1 chi nhánh (theo sản phẩm sẽ làm khi có yêu cầu). Tên file theo tên màn hình"], "src": _HY + " 運営E 横断 X2・X3（台帳 F）"},
    {"date": "2026-10-08", "target": "AW_STCK_004 No.1.2・005 No.1.2・002 No.1.3・1.4・001 No.2",
     "q": ["在庫調整（まとめて）の保存／代理入力・確認済にするの権限／休止の月の実績精算／「締め月を進める」ボタン", "Lưu điều chỉnh tồn kho (hàng loạt) / quyền nhập thay và xác nhận / quyết toán thực tế tháng tạm dừng / nút 「締め月を進める」"],
     "a": ["在庫調整（まとめて）は拠点ごとのタブで入れ、保存はタブ（拠点）ごと（リアルタイム保存はしない）。確定済み・請求済みの拠点のタブは保存できない（E184／請求済みは E54）。「一部だけ登録して残りをスキップ（W140）」は使わない。"
            "代理入力（005）と「確認済にする」（002）は フル権限・CS・物流（権限表の「廃棄入力」＝R/U）。在庫調整（003・004）はフル権限・システム管理だけ。細かい点は権限の画面であとから調整してよい。"
            "休止の始めの報告があれば、その月は通常の行で確定し、翌月から「対象外」。すでに休止中の拠点（移行で「利用休止」）は最初から「対象外」。"
            "「締め月を進める」は AW_BILL 001 No.1.3 に置く。押せない間は非活性＋ツールチップ（理由）、押してからのエラーは出さない、押すときは確認ダイアログあり。",
            "Điều chỉnh tồn kho (hàng loạt) nhập theo tab của từng chi nhánh, lưu theo từng tab (chi nhánh), không lưu theo thời gian thực. Tab của chi nhánh đã chốt / đã thanh toán không lưu được (E184 / đã thanh toán là E54). Không dùng 「chỉ đăng ký một phần, bỏ qua phần còn lại (W140)」. "
            "Nhập thay (005) và 「確認済にする」 (002) dành cho Toàn quyền, CS, Logistics (「廃棄入力」 trong bảng quyền = R/U). Điều chỉnh tồn kho (003, 004) chỉ dành cho Toàn quyền và Quản trị hệ thống. Các chi tiết nhỏ có thể chỉnh sau ở màn hình quyền. "
            "Nếu có báo cáo bắt đầu tạm dừng thì tháng đó là dòng bình thường, từ tháng sau là 「対象外」. Chi nhánh đã tạm dừng từ trước (chuyển đổi thành 「利用休止」) là 「対象外」 ngay từ đầu. "
            "「締め月を進める」 đặt ở AW_BILL 001 No.1.3. Khi chưa bấm được thì vô hiệu hóa + tooltip (lý do), không hiện lỗi sau khi bấm, khi bấm có hộp thoại xác nhận."],
     "src": "hong 回答 2026/10/08（台帳 F 2026-10-08）"},
    {"date": "2026-10-08", "target": "AW_STCK_004 No.1.1・1.2・3・4・5",
     "q": ["在庫調整（まとめて）の保存後と理由欄", "Sau khi lưu và ô lý do của điều chỉnh tồn kho (hàng loạt)"],
     "a": ["タブ（拠点）を保存しても同じ画面に残る（保存したタブには ✓ を付けて入力を固定。全タブを保存するか「キャンセル」したら一覧へ戻る）。理由の欄はタブ（拠点）ごとに持つ（前のタブの理由を使うボタンは置いてよい）。",
            "Lưu một tab (chi nhánh) thì vẫn ở lại cùng màn hình (tab đã lưu được gắn ✓ và khóa phần nhập). Lưu hết mọi tab hoặc bấm 「キャンセル」 thì về danh sách. Ô lý do có riêng cho từng tab (chi nhánh) (được đặt nút dùng lại lý do của tab trước)."],
     "src": "hong 回答 2026/10/08（台帳 F 2026-10-08）"},
    {"date": "2026-10-08", "target": "AW_STCK_002 No.4.8・状態のお知らせ No.3・001 No.4.5", "q": ["事務手数料（¥3,000）の見せ方（リリース後の最初のサイクル）", "Cách hiển thị phí hành chính (¥3,000) (chu kỳ đầu tiên sau khi phát hành)"],
     "a": ["事務手数料は25日になっても報告がない拠点に付ける（最初の棚卸報告の前の拠点にも付ける。管理ロスは出さない）。ただし、リリース後の最初のサイクルだけは事務手数料も免除する。案内に「リリース後の最初のサイクルは事務手数料がかかりません」と書く（メッセージ ID は採番待ち）", "Phí hành chính áp dụng cho chi nhánh vẫn chưa có báo cáo đến ngày 25 (cũng áp dụng cho chi nhánh chưa có báo cáo kiểm kê đầu tiên; không hiện hao hụt quản lý). Tuy nhiên, chỉ riêng chu kỳ đầu tiên sau khi phát hành thì cũng được miễn phí hành chính. Trong thông báo ghi 「リリース後の最初のサイクルは事務手数料がかかりません」 (ID thông báo đang chờ cấp số)"],
     "src": "hong 回答 2026/10/08（台帳 F 2026-10-08）"},
]
CHANGES = []
HIDE_ALWAYS = [".demo-note"]
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [
    {"code": "AW_STCK_001", "ja": "棚卸し（拠点在庫）一覧", "vi": "Danh sách kiểm kê (tồn kho chi nhánh)"},
    {"code": "AW_STCK_002", "ja": "在庫詳細", "vi": "Chi tiết tồn kho"},
    {"code": "AW_STCK_003", "ja": "在庫調整", "vi": "Điều chỉnh tồn kho"},
    {"code": "AW_STCK_004", "ja": "在庫調整（まとめて）", "vi": "Điều chỉnh tồn kho (hàng loạt)"},
    {"code": "AW_STCK_005", "ja": "棚卸の代理入力", "vi": "Nhập thay kiểm kê"},
]

H = (
    "const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));"
    "const setv=(el,v)=>{if(!el)return;const p=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;"
    "Object.getOwnPropertyDescriptor(p,'value').set.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}));};"
    "const setsel=(el,v)=>{if(!el)return;Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(el,v);el.dispatchEvent(new Event('change',{bubbles:true}));};"
    "const btn=(t,root)=>[...(root||document).querySelectorAll('button')].find(b=>(b.textContent||'').trim().includes(t));"
)


VI_NAMES = {
 "ヘッダー": "Header",
 "CSV出力": "Nút 「CSV出力」",
 "締め月と締めの決まり": "Tháng chốt và quy tắc chốt",
 "締め月（バッジ）・対象期間": "Tháng chốt (badge), kỳ đối tượng",
 "過去月の案内": "Thông báo tháng quá khứ",
 "検索条件": "Điều kiện tìm kiếm",
 "対象月": "Tháng đối tượng",
 "法人名・法人ID": "Tên pháp nhân, ID pháp nhân",
 "拠点名・拠点ID・子契約番号": "Tên chi nhánh, ID chi nhánh, số hợp đồng con",
 "棚卸": "Kiểm kê",
 "実績精算": "Quyết toán thực tế",
 "クリア": "Nút 「クリア」",
 "検索": "Nút 「検索」",
 "並べ替え（項目・昇順／降順）": "Sắp xếp (mục, tăng dần / giảm dần)",
 "一覧の表": "Bảng danh sách",
 "選択（チェック・すべて選択）": "Chọn (ô chọn, chọn tất cả)",
 "拠点ID": "ID chi nhánh",
 "拠点名": "Tên chi nhánh",
 "法人名": "Tên pháp nhân",
 "棚卸（当月・報告日）": "Kiểm kê (tháng hiện tại, ngày báo cáo)",
 "計算在庫（合計）": "Tồn kho tính toán (tổng)",
 "在庫調整": "Điều chỉnh tồn kho",
 "管理ロス（点）": "Hao hụt quản lý (số lượng)",
 "差分率": "Tỷ lệ chênh lệch",
 "廃棄率": "Tỷ lệ hủy",
 "操作（鉛筆）": "Thao tác (bút chì)",
 "0件の表示": "Hiển thị khi 0 kết quả",
 "ページ送り": "Phân trang",
 "選択バー": "Thanh chọn",
 "まとめて在庫調整": "Nút 「まとめて在庫調整」",
 "読み込めなかった表示": "Hiển thị khi không tải được",
 "実績精算詳細": "Nút 「実績精算詳細」",
 "編集": "Nút 「編集」",
 "代理入力": "Nút 「代理入力」",
 "確認済にする": "Nút 「確認済にする」",
 "概要のバッジ": "Badge tóm tắt",
 "状態のお知らせ": "Thông báo theo trạng thái",
 "棚卸報告（カード）": "Báo cáo kiểm kê (thẻ)",
 "状態": "Trạng thái",
 "報告日": "Ngày báo cáo",
 "報告者": "Người báo cáo",
 "報告の方法": "Cách báo cáo",
 "報告の締め": "Hạn báo cáo",
 "確認の状態": "Trạng thái xác nhận",
 "商品ごとの実数": "Số thực theo sản phẩm",
 "未報告のときの案内": "Thông báo khi chưa báo cáo",
 "計算在庫の表": "Bảng tồn kho tính toán",
 "10%以上の行の色": "Màu dòng từ 10% trở lên",
 "登録済みの在庫調整": "Điều chỉnh tồn kho đã đăng ký",
 "キャンセル": "Nút 「キャンセル」",
 "保存": "Nút 「保存」",
 "説明": "Mô tả",
 "在庫調整の入力表": "Bảng nhập điều chỉnh tồn kho",
 "数量": "Số lượng",
 "理由": "Lý do",
 "商品を追加": "Thêm sản phẩm",
 "編集できないときの表示": "Hiển thị khi không sửa được",
 "拠点×商品の表": "Bảng chi nhánh × sản phẩm",
 "数量（マス）": "Số lượng (ô)",
 "計算在庫（参考）": "Tồn kho tính toán (tham khảo)",
 "拠点が選ばれていません": "Chưa chọn chi nhánh",
 "報告の情報": "Thông tin báo cáo",
 "商品の表": "Bảng sản phẩm",
 "今ある数": "Số hiện có",
 "捨てた数": "Số đã bỏ",
 "届いた数": "Số đã nhận",
 "入力できる期間・確認済のあと": "Thời gian nhập được, sau khi xác nhận"
}


def F(no, ja, sel, kind, trig="view", **kw):
    d = {"no": no, "ja": ja, "vi": VI_NAMES.get(ja, ""), "sel": sel, "kind": kind, "trig": trig}
    d.update(kw)
    return d


def J(s):
    """日本語だけの [ja, vi] 。vi は後の翻訳で埋める"""
    return [s, ""]


def pick(cat, *nos):
    m = {i["no"]: i for i in cat}
    return [m[n] for n in nos]


# ================================================================ 共通の短い部品
SEL_CHECK = "---"
PERM_FULL = ["フル権限・システム管理だけ（台帳 F 2026-10-07）", "Chỉ Toàn quyền và Quản trị hệ thống (台帳 F 2026-10-07)"]

# ================================================================ AW_STCK_001 一覧
L1 = [
    F("1", "ヘッダー", ".es-pagehead", "area",
      detail=["パンくず：請求 / 棚卸し（拠点在庫）。タイトル「棚卸し（拠点在庫）」。メニュー「請求」の下の同じ名前の項目から開く。", "Breadcrumb: 請求 / 棚卸し（拠点在庫）. Tiêu đề 「棚卸し（拠点在庫）」. Mở từ mục cùng tên bên dưới menu 「請求」."]),
    F("1.1", "CSV出力", ".es-pagehead__actions button::CSV出力", "button", "click", pattern="P-CSV-OUT", err=["S12"],
      cond=["閲覧できる役割すべてに出す（権限表）", "Hiện cho mọi vai trò được xem (bảng quyền)"],
      detail=["検索条件のとおりの全件を出す。1行＝1拠点（商品別は要望が出てから）。列：画面の列（拠点ID・拠点名・法人ID・法人名・子契約番号・棚卸・報告日・計算在庫（合計）・在庫調整（件）・在庫調整（点）・管理ロス（点）・差分率・廃棄率・実績精算）に、全項目の ID・名前・状態・更新日時を足す。ファイル名は「棚卸し（拠点在庫）」（画面名に合わせる）。", "Xuất toàn bộ theo điều kiện tìm kiếm. 1 dòng = 1 chi nhánh (theo sản phẩm sẽ làm khi có yêu cầu). Cột: các cột trên màn hình (ID chi nhánh, tên chi nhánh, ID pháp nhân, tên pháp nhân, số hợp đồng con, kiểm kê, ngày báo cáo, tồn kho tính toán (tổng), điều chỉnh tồn kho (số lần), điều chỉnh tồn kho (số lượng), hao hụt quản lý (số lượng), tỷ lệ chênh lệch, tỷ lệ hủy, quyết toán thực tế) cộng thêm ID, tên, trạng thái, thời điểm cập nhật của mọi mục. Tên file là 「棚卸し（拠点在庫）」 (theo tên màn hình)."],
      demo_ok=["コードの列は画面の列だけ（14 列）で、更新日時などがない。ファイル名の画面名も「在庫一覧」のまま。台帳 F 2026-10-07（運営E の選べる月・CSV の列）に合わせて直す。", "Các cột trong code chỉ có cột trên màn hình (14 cột), không có thời điểm cập nhật v.v. Tên file cũng vẫn là 「在庫一覧」. Sửa theo 台帳 F 2026-10-07 (tháng chọn được và cột CSV của 運営E)."],
      open=["足す「更新日時」が何の更新日時か（報告・在庫調整・納品のどれの最後か）が台帳にない。拠点の在庫の最終更新と読む案で良いか", "Sổ quyết định không ghi 「更新日時」 được thêm là thời điểm cập nhật của cái gì (lần cuối của báo cáo, điều chỉnh tồn kho hay giao hàng). Có thể hiểu là lần cập nhật cuối của tồn kho chi nhánh được không"], ask="hong"),
    F("2", "締め月と締めの決まり", ".bl-meta::締め月", "area",
      detail=["締め月（例：2026-10）と「20日締め・25日確定・翌月1日発行」を出す（運営E の全画面で同じ帯）。締め月は運営が「締め月を進める」操作で進める。ボタンは AW_BILL 001 No.1.3 に置く（この画面には置かない。台帳 F 2026-10-08）。押せない間は非活性にして理由をツールチップで出し、押してからのエラーは出さない。押すときは確認ダイアログ（元に戻せない旨）を出す。暦では自動で進めない。「デモの今日…」の文は設計書に入れない（デモのときだけ出る）。", "Hiện tháng chốt (ví dụ: 2026-10) và 「20日締め・25日確定・翌月1日発行」 (chốt ngày 20, xác nhận ngày 25, phát hành ngày 1 tháng sau) (dải giống nhau ở mọi màn hình của 運営E). Tháng chốt do vận hành chuyển bằng thao tác 「締め月を進める」. Nút đặt ở AW_BILL 001 No.1.3 (không đặt ở màn hình này; 台帳 F 2026-10-08). Khi chưa bấm được thì vô hiệu hóa và hiện lý do bằng tooltip, không hiện lỗi sau khi bấm. Khi bấm có hộp thoại xác nhận (nêu rõ không hoàn tác được). Không tự chuyển theo lịch. Câu 「デモの今日…」 không đưa vào tài liệu thiết kế (chỉ hiện khi demo)."],
      demo_ok=["コードは締め月が seed の 2026-10 固定で、進める操作がない。台帳 F 2026-10-07（請求の締め月の進め方）のとおり、運営の操作で進める画面にする（ボタンは AW_BILL 001 No.1.3。台帳 F 2026-10-08）。", "Trong code tháng chốt cố định là 2026-10 của seed, không có thao tác chuyển. Làm màn hình do vận hành thao tác chuyển, theo 台帳 F 2026-10-07 (cách chuyển tháng chốt của thanh toán); nút đặt ở AW_BILL 001 No.1.3 (台帳 F 2026-10-08)."],
      ),
    F("2.1", "締め月（バッジ）・対象期間", ".bl-meta::対象期間", "label",
      detail=["選んでいる月（当月は「（当月）」付き）と、その月の対象期間（前月21日〜当月20日）をバッジで出す。説明文：拠点ごとの在庫・棚卸報告・在庫調整。差分率＝(理論 − 報告) ÷ 理論、廃棄率＝廃棄 ÷ (前回の在庫 ＋ 納品)。10%以上は赤で表示。", "Hiện bằng badge tháng đang chọn (tháng hiện tại có kèm 「（当月）」) và kỳ đối tượng của tháng đó (từ ngày 21 tháng trước đến ngày 20 tháng này). Văn bản mô tả: tồn kho từng chi nhánh, báo cáo kiểm kê, điều chỉnh tồn kho. Tỷ lệ chênh lệch = (lý thuyết − báo cáo) ÷ lý thuyết, tỷ lệ hủy = hủy ÷ (tồn lần trước ＋ giao hàng). Từ 10% trở lên hiện màu đỏ."]),
    F("2.2", "過去月の案内", ".es-inline::確定済みです", "label", err=["I03"],
      cond=["当月より前の月を選んだとき", "Khi chọn tháng trước tháng hiện tại"],
      detail=["「{月}は確定済みです。確定したときの記録を表示しています」＋（見るだけ）。写しから出し、記録のない月は合成しない。", "「{月}は確定済みです。確定したときの記録を表示しています」 ＋ (chỉ xem). Hiện từ bản lưu, tháng không có bản ghi thì không tự tổng hợp."],
      demo_ok=["コードは写しのない月を今月の値から合成して出す（本物の写しは 2026-09 だけ）。写し（確定時の保存）から出すように直す（在庫.md §6-5）。", "Code tự tổng hợp tháng không có bản lưu từ giá trị tháng này (bản lưu thật chỉ có 2026-09). Sửa để hiện từ bản lưu (lưu khi chốt) (在庫.md §6-5)."]),
    F("3", "検索条件", ".es-search", "area", pattern="P-LIST",
      detail=["「検索」か Enter で反映。初期の並びは拠点ID の昇順（法人Web の「拠点ごとの状況」と同じ）。", "Áp dụng bằng 「検索」 hoặc Enter. Thứ tự ban đầu là ID chi nhánh tăng dần (giống 「拠点ごとの状況」 của 法人Web)."]),
    F("3.1", "対象月", ".es-search__fields select::（当月）", "select", "select", req="○", len=["選択（写しのある月すべて）", "Chọn (mọi tháng có bản lưu)"], init=["当月", "Tháng hiện tại"],
      ex=["2026年10月（当月）", "Tháng đối tượng (tháng hiện tại)"],
      detail=["「すべて」はない。選べる月は写し（確定時の保存）のある月すべて。選ぶと表の中身がその月の記録に変わる（URL ?m=YYYY-MM）。", "Không có 「すべて」. Các tháng chọn được là mọi tháng có bản lưu (lưu khi chốt). Khi chọn, nội dung bảng chuyển sang bản ghi của tháng đó (URL ?m=YYYY-MM)."],
      demo_ok=["コードは当月＋過去2か月の固定（PERIODS）。写しのある月すべてに直す（台帳 F 2026-10-07 運営E の選べる月）。", "Code cố định tháng hiện tại + 2 tháng trước (PERIODS). Sửa thành mọi tháng có bản lưu (台帳 F 2026-10-07, tháng chọn được của 運営E)."]),
    F("3.2", "法人名・法人ID", ".es-search__fields input[placeholder=\"法人名・法人ID\"]", "text", "input", req="－", len="文字列 60", ex=["株式会社サンプル", "Tên pháp nhân hoặc ID pháp nhân (ví dụ: Công ty cổ phần Sample)"],
      detail=["法人名・法人ID の部分一致。", "Khớp một phần với tên pháp nhân / ID pháp nhân."]),
    F("3.3", "拠点名・拠点ID・子契約番号", ".es-search__fields input[placeholder^=拠点名]", "text", "input", req="－", len="文字列 60", ex=["CU00643", "Tên chi nhánh, ID chi nhánh hoặc số hợp đồng con (ví dụ: ID chi nhánh CU00643)"],
      detail=["拠点名・拠点ID・子契約番号の部分一致（台帳 F 2026-10-07）。実績精算の同じ欄と同じ。", "Khớp một phần với tên chi nhánh, ID chi nhánh, số hợp đồng con (台帳 F 2026-10-07). Giống ô cùng loại ở quyết toán thực tế."],
      demo_ok=["コードの欄名は「拠点名・拠点ID」で、子契約番号にも当たる。欄名を「拠点名・拠点ID・子契約番号」に直す。", "Tên ô trong code là 「拠点名・拠点ID」 nhưng cũng khớp số hợp đồng con. Sửa tên ô thành 「拠点名・拠点ID・子契約番号」."]),
    F("3.4", "棚卸", ".es-search__fields select::棚卸（すべて）", "select", "select", req="－", len=["選択（棚卸前／棚卸後／棚卸なし）", "Chọn (Trước kiểm kê / Sau kiểm kê / Không kiểm kê)"], init=["（すべて）", "(Tất cả)"],
      ex=["棚卸なし", "Giá trị lọc trạng thái kiểm kê (ví dụ: Không kiểm kê)"],
      detail=["すべて／棚卸前／棚卸後／棚卸なし の4つ（台帳 F 2026-10-07）。棚卸なしの拠点は「棚卸前」にも「棚卸後」にも入れない。", "4 giá trị: Tất cả / Trước kiểm kê / Sau kiểm kê / Không kiểm kê (台帳 F 2026-10-07). Chi nhánh không kiểm kê không thuộc 「棚卸前」 cũng không thuộc 「棚卸後」."],
      demo_ok=["コードの選択肢は 棚卸前・棚卸後 の2つで、棚卸なしの拠点が「棚卸前」に入る。4つに直す。", "Lựa chọn trong code chỉ có 2 giá trị: 棚卸前・棚卸後, chi nhánh không kiểm kê bị tính vào 「棚卸前」. Sửa thành 4 giá trị."]),
    F("3.5", "実績精算", ".es-search__fields select::実績精算（すべて）", "select", "select", req="－", len=["選択（確定／未確定）", "Chọn (Đã chốt / Chưa chốt)"], init=["（すべて）", "(Tất cả)"],
      ex=["未確定", "Trạng thái quyết toán thực tế (ví dụ: Chưa chốt)"], detail=["確定／未確定。実績精算（AW_ACTL）の状態に合わせる。", "Đã chốt / Chưa chốt. Khớp với trạng thái quyết toán thực tế (AW_ACTL)."]),
    F("3.6", "クリア", ".es-search__main button::クリア", "button", "click", detail=["条件を初期に戻して反映する（対象月は当月）。", "Đưa điều kiện về ban đầu và áp dụng (tháng đối tượng là tháng hiện tại)."]),
    F("3.7", "検索", ".es-search__main button.es-btn--solid", "button", "click", detail=["条件を反映し、1ページ目へ。選択している行は解除する。", "Áp dụng điều kiện và về trang 1. Bỏ chọn các dòng đang chọn."]),
    F("3.8", "並べ替え（項目・昇順／降順）", "-", "select", "select", req="－", len=["選択（一覧の全列）", "Chọn (mọi cột của danh sách)"], init=["拠点ID・昇順", "ID chi nhánh, tăng dần"],
      ex=["管理ロス（点）", "Cột sắp xếp (ví dụ: Hao hụt quản lý (số lượng))"], pattern="P-LIST",
      detail=["並べる項目は一覧の全列（項目＋昇順／降順）。初期は拠点ID の昇順（台帳 F 2026-10-07・台帳 K）。", "Mục sắp xếp là mọi cột của danh sách (mục + tăng dần / giảm dần). Ban đầu là ID chi nhánh tăng dần (台帳 F 2026-10-07, 台帳 K)."],
      demo_ok=["コードは並べ替えなしで、拠点マスタの登録順。並べ替えを足し、初期を拠点ID の昇順にする（H-S1・台帳 K）。", "Code không sắp xếp, theo thứ tự đăng ký của master chi nhánh. Thêm chức năng sắp xếp và đặt ban đầu là ID chi nhánh tăng dần (H-S1, 台帳 K)."]),
    F("4", "一覧の表", ".es-table", "table", pattern="P-LIST",
      detail=["1行＝1拠点（当月で有効・利用休止・解約手続き中の契約がある拠点）。拠点ID を押すと在庫詳細（AW_STCK_002）。数値は右寄せ。", "1 dòng = 1 chi nhánh (chi nhánh có hợp đồng hiệu lực, tạm ngưng sử dụng hoặc đang làm thủ tục hủy trong tháng hiện tại). Bấm ID chi nhánh để mở chi tiết tồn kho (AW_STCK_002). Số căn phải."],
      demo_ok=["惣菜買取の拠点（在庫管理の対象外）が通常の拠点と同じに出る。買取の拠点は出さない・または対象外と分かるようにする（在庫.md §5-10・H-S11）。", "Chi nhánh mua đứt món ăn kèm (ngoài đối tượng quản lý tồn kho) vẫn hiện giống chi nhánh thường. Không hiện chi nhánh mua đứt, hoặc hiện sao cho biết là ngoài đối tượng (在庫.md §5-10, H-S11)."]),
    F("4.1", "選択（チェック・すべて選択）", ".es-table thead .es-check", "check", "check", req="－", len="選択", ex=["選択", "Chọn"], pattern="P-LIST",
      cond=["フル権限で、当月で、実績精算が確定済み・請求済みでない拠点の行だけ", "Chỉ dòng của chi nhánh khi có Toàn quyền, là tháng hiện tại và quyết toán thực tế chưa chốt, chưa thanh toán"],
      detail=["行を選ぶと下に選択バー（6）が出る。権限がない役割・過去月・確定済み・請求済みの行にはチェックを出さない。", "Khi chọn dòng, thanh chọn (6) hiện ở dưới. Không hiện ô chọn cho vai trò không có quyền, tháng quá khứ, dòng đã chốt, đã thanh toán."],
      demo_ok=["コードは権限に関係なくチェックが出る（ボタンだけ出し分け）。まとめて在庫調整できない役割には出さない（H-S3）。", "Code hiện ô chọn bất kể quyền (chỉ phân biệt nút). Không hiện cho vai trò không điều chỉnh tồn kho hàng loạt được (H-S3)."]),
    F("4.2", "拠点ID", ".es-table th::拠点ID", "link", "click", detail=["押すと在庫詳細（AW_STCK_002）。見ている月を引き継ぐ。", "Bấm để mở chi tiết tồn kho (AW_STCK_002). Giữ nguyên tháng đang xem."]),
    F("4.3", "拠点名", ".es-table th::拠点名", "label"),
    F("4.4", "法人名", ".es-table th::法人名", "label", detail=["法人なしの拠点は「（法人なし）」。", "Chi nhánh không có pháp nhân hiện 「（法人なし）」."]),
    F("4.5", "棚卸（当月・報告日）", ".es-table th::棚卸", "label", pattern="P-STATUS-COLORS",
      detail=["バッジ：棚卸前（黄）／棚卸後（緑）／棚卸なし（灰）。棚卸後は報告日を下に出す。棚卸前で最初の報告がまだの拠点は「最初の報告待ち」を添える（25日になっても報告がなければ事務手数料がかかる。ただし、リリース後の最初のサイクルは事務手数料がかかりません。メッセージ ID は採番待ち）。過去月の列名は「棚卸（報告日）」。", "Badge: Trước kiểm kê (vàng) / Sau kiểm kê (xanh lá) / Không kiểm kê (xám). Sau kiểm kê thì hiện ngày báo cáo ở dưới. Chi nhánh trước kiểm kê chưa có báo cáo đầu tiên kèm 「最初の報告待ち」 (nếu đến ngày 25 vẫn chưa báo cáo thì phát sinh phí hành chính; tuy nhiên chu kỳ đầu tiên sau khi phát hành không mất phí hành chính; ID thông báo đang chờ cấp số). Tên cột của tháng quá khứ là 「棚卸（報告日）」."]),
    F("4.6", "計算在庫（合計）", ".es-table th::計算在庫", "label", detail=["前回の棚卸 ＋ 納品 − 販売 − 廃棄 ± 在庫調整 の合計（点）。右寄せ。", "Tổng của: kiểm kê lần trước ＋ giao hàng − bán − hủy ± điều chỉnh tồn kho (số lượng). Căn phải."]),
    F("4.7", "在庫調整", ".es-table th::在庫調整", "label", detail=["登録済みの調整の件数と合計（例：2件（+3点））。なければ「—」。", "Số lần điều chỉnh đã đăng ký và tổng (ví dụ: 2件（+3点）). Không có thì 「—」."]),
    F("4.8", "管理ロス（点）", ".es-table th::管理ロス", "label",
      detail=["棚卸後だけ出す（−は不足・＋は過剰）。棚卸前は「棚卸前」、棚卸なし・最初の報告待ちは「—」。", "Chỉ hiện sau kiểm kê (− là thiếu, ＋ là thừa). Trước kiểm kê hiện 「棚卸前」, không kiểm kê / chờ báo cáo đầu tiên hiện 「—」."]),
    F("4.9", "差分率", ".es-table th::差分率", "label",
      detail=["差分率＝(理論 − 報告) ÷ 理論（報告のある拠点だけ）。絶対値が10%以上は赤字（10% で確定。hong 2026-10-08・客先には未確認。TOP の廃棄率アラートは 3% で確定）。棚卸なしの拠点は「棚卸なし」。", "Tỷ lệ chênh lệch = (lý thuyết − báo cáo) ÷ lý thuyết (chỉ chi nhánh có báo cáo). Giá trị tuyệt đối từ 10% trở lên chữ đỏ (10% là giá trị chính thức; hong 2026-10-08, chưa xác nhận với khách. Cảnh báo tỷ lệ hủy ở TOP là 3%, đã chốt). Chi nhánh không kiểm kê hiện 「棚卸なし」."],),
    F("4.10", "廃棄率", ".es-table th::廃棄率", "label",
      detail=["廃棄率＝廃棄 ÷（前回の在庫 ＋ 納品）。どの画面・用途でもこの式が1つ（台帳 H）。10%以上は赤字。", "Tỷ lệ hủy = hủy ÷ (tồn lần trước ＋ giao hàng). Mọi màn hình, mục đích đều dùng một công thức này (台帳 H). Từ 10% trở lên chữ đỏ."],
      open=["式「廃棄 ÷（前回の在庫＋納品）」は確認ではなく、客先へ次の会議で伝える（`_OPEN一覧` 1005-04）", "Công thức 「廃棄 ÷（前回の在庫＋納品）」 không phải để xác nhận mà sẽ thông báo cho khách hàng ở cuộc họp tới (`_OPEN一覧` 1005-04)"], ask="お客様（次の会議で伝達）"),
    F("4.11", "実績精算", ".es-table th::実績精算", "label", pattern="P-STATUS-COLORS", detail=["バッジ：確定（緑）／未確定（黄）。", "Badge: Đã chốt (xanh lá) / Chưa chốt (vàng)."]),
    F("4.12", "操作（鉛筆）", ".es-rowactions a", "button", "click",
      cond=PERM_FULL,
      detail=["押すと在庫調整（AW_STCK_003）。フル権限・システム管理だけに出す。過去月・実績精算が確定済み・請求済みの行には出さない。", "Bấm để mở điều chỉnh tồn kho (AW_STCK_003). Chỉ hiện với Toàn quyền và Quản trị hệ thống. Không hiện ở tháng quá khứ, dòng quyết toán thực tế đã chốt, đã thanh toán."],
      demo_ok=["コードはフル・CS・物流に鉛筆が出て、経理にも出て保存で E32 になる。フル権限・システム管理だけに直す（台帳 F 2026-10-07）。請求済みの拠点にも出さない（H-S12）。", "Trong code biểu tượng bút chì hiện cho Toàn quyền, CS, Logistics, và cả Kế toán (lưu thì ra E32). Sửa để chỉ hiện với Toàn quyền và Quản trị hệ thống (台帳 F 2026-10-07). Cũng không hiện ở chi nhánh đã thanh toán (H-S12)."]),
    F("4.13", "0件の表示", ".es-table td.dim", "label", err=["I01"],
      demo_ok=["コードの文言「条件に合う拠点はありません」を I01 に揃える。", "Thống nhất câu chữ 「条件に合う拠点はありません」 của code thành I01."]),
    F("5", "ページ送り", ".es-pagination", "area", pattern="P-PAGESIZE",
      detail=["「n件中 a–b件」・前へ・番号・次へ・表示件数（10／20／50）。1ページ10件。", "「n件中 a–b件」, Trước, số trang, Sau, số dòng hiển thị (10/20/50). Mỗi trang 10 dòng."],
      demo_ok=["表示件数を利用者・一覧ごとに覚える（H-S2）。コードは画面の中だけ。", "Ghi nhớ số dòng hiển thị theo từng người dùng, từng danh sách (H-S2). Code chỉ giữ trong màn hình."]),
    F("6", "選択バー", ".es-selbar", "area", detail=["1件以上選ぶと下に「n件選択中」「選択を解除」とボタンが出る。過去月では出さない。", "Khi chọn từ 1 dòng trở lên, phía dưới hiện 「n件選択中」, 「選択を解除」 và các nút. Không hiện ở tháng quá khứ."]),
    F("6.1", "まとめて在庫調整", ".es-selbar button::まとめて在庫調整", "button", "click", cond=PERM_FULL,
      detail=["選んだ拠点の ID を引き継いで在庫調整（まとめて）（AW_STCK_004）を開く。フル権限・システム管理だけ。", "Mở điều chỉnh tồn kho (hàng loạt) (AW_STCK_004) với ID các chi nhánh đã chọn. Chỉ Toàn quyền và Quản trị hệ thống."]),
    F("7", "読み込めなかった表示", ".bl-meta::読み込めませんでした", "label",
      detail=["通信・サーバーのエラーのとき、締め月の帯の位置に赤い一行を出す（画像なし：見本データではエラーを起こせない）。一覧を読み込めなかったときの文言は W103。", "Khi lỗi kết nối / máy chủ, hiện một dòng đỏ tại vị trí dải tháng chốt (không có ảnh: dữ liệu mẫu không gây ra lỗi được). Câu chữ khi không tải được danh sách là W103."], err=["W103"]),
]

# ================================================================ AW_STCK_002 在庫詳細
L2 = [
    F("1", "ヘッダー", ".es-pagehead", "area",
      detail=["パンくず：請求 / 棚卸し（拠点在庫）（押すと一覧）/ 在庫詳細。タイトル「在庫詳細」＋拠点ID。", "Breadcrumb: 請求 / 棚卸し（拠点在庫）(bấm để về danh sách) / 在庫詳細. Tiêu đề 「在庫詳細」 + ID chi nhánh."],
      demo_ok=["コードのパンくずの途中は「在庫管理」。「棚卸し（拠点在庫）」に直す（台帳 F 2026-10-07 画面名）。", "Giữa breadcrumb trong code là 「在庫管理」. Sửa thành 「棚卸し（拠点在庫）」 (台帳 F 2026-10-07, tên màn hình)."]),
    F("1.1", "実績精算詳細", ".es-pagehead__actions button::実績精算詳細", "button", "click", detail=["押すとその拠点・月の実績精算の詳細（AW_ACTL_002）。閲覧できる役割すべてに出す。", "Bấm để mở chi tiết quyết toán thực tế của chi nhánh và tháng đó (AW_ACTL_002). Hiện cho mọi vai trò được xem."]),
    F("1.2", "編集", ".es-pagehead__actions button::編集", "button", "click", cond=PERM_FULL,
      detail=["押すと在庫調整（AW_STCK_003）。当月で、実績精算が確定済み・請求済みでないときだけ出す。", "Bấm để mở điều chỉnh tồn kho (AW_STCK_003). Chỉ hiện khi là tháng hiện tại và quyết toán thực tế chưa chốt, chưa thanh toán."],
      demo_ok=["コードはフル・CS・物流に出る。フル権限・システム管理だけに直す（台帳 F 2026-10-07）。", "Trong code hiện cho Toàn quyền, CS, Logistics. Sửa để chỉ hiện với Toàn quyền và Quản trị hệ thống (台帳 F 2026-10-07)."]),
    F("1.3", "代理入力", "-", "button", "click", err=["E32"],
      cond=["当月で、実績精算が確定済み・請求済みでない拠点（編集 1.2 と同じ）。棚卸なしの拠点には出さない。最初の報告前の扱いは通常と同じ。出す役割はフル権限・CS・物流（台帳 F 2026-10-08・権限表の「廃棄入力」＝R/U）", "Chi nhánh của tháng hiện tại và quyết toán thực tế chưa chốt, chưa thanh toán (giống 1.2). Không hiện với chi nhánh không kiểm kê. Cách xử lý trước báo cáo đầu tiên giống bình thường. Vai trò được hiện: Toàn quyền, CS, Logistics (台帳 F 2026-10-08, 「廃棄入力」 trong bảng quyền = R/U)"],
      detail=["押すと棚卸の代理入力（AW_STCK_005）。お客様の入力期限（20日）を過ぎたあと（21〜25日）に運営が追加・修正するための入り口（台帳 E）。確定済み・請求済みの月は出さない（確定後に報告を入れ直すと管理ロスが変わるため。台帳 F「確定した月は編集できない」・在庫.md §6-4）。棚卸なしの拠点には出さない（管理ロスも事務手数料もないため）。画面はまだコードにない。出す役割はフル権限・CS・物流（在庫調整の鉛筆はフル権限・システム管理だけ）。細かい点は権限の画面であとから調整してよい（台帳 F 2026-10-08）。", "Bấm để mở nhập thay kiểm kê (AW_STCK_005). Là lối vào để vận hành bổ sung / sửa sau hạn nhập của khách (ngày 20), tức ngày 21〜25 (台帳 E). Không hiện ở tháng đã chốt / đã thanh toán (vì nếu nhập lại báo cáo sau khi chốt thì hao hụt quản lý thay đổi; 台帳 F 「確定した月は編集できない」, 在庫.md §6-4). Không hiện với chi nhánh không kiểm kê (vì không có hao hụt quản lý và phí hành chính). Màn hình chưa có trong code. Vai trò được hiện là Toàn quyền, CS, Logistics (bút chì điều chỉnh tồn kho chỉ dành cho Toàn quyền và Quản trị hệ thống). Các chi tiết nhỏ có thể chỉnh sau ở màn hình quyền (台帳 F 2026-10-08)."],
      demo_ok=["コードに代理入力の画面がない（実績精算の編集の「棚卸の申告」チェックは実数が入らない）。AW_STCK_005 を新設する（台帳 F 2026-10-07）。", "Code chưa có màn hình nhập thay (ô 「棚卸の申告」 ở màn sửa quyết toán thực tế không nhập được số thực). Thêm mới AW_STCK_005 (台帳 F 2026-10-07)."],
      open=["運営が代理入力できる期間（25日まで／それ以降も）と、確認済みのあとに運営が代理入力できるかが、台帳にない（役割は決定済み）", "Sổ quyết định không ghi: thời gian vận hành được nhập thay (đến ngày 25 / cả sau đó) và vận hành có nhập thay được sau khi đã xác nhận không (vai trò đã quyết)"], ask="hong"),
    F("1.4", "確認済にする", "-", "button", "click", err=["Q140", "S141"],
      cond=["当月で、実績精算が確定済み・請求済みでなく、報告済みで、まだ確認済みでないとき。棚卸なしの拠点には出さない。出す役割は 1.3 と同じ（フル権限・CS・物流。台帳 F 2026-10-08）", "Khi là tháng hiện tại, quyết toán thực tế chưa chốt, chưa thanh toán, đã báo cáo và chưa xác nhận. Không hiện với chi nhánh không kiểm kê. Vai trò được hiện giống 1.3 (Toàn quyền, CS, Logistics; 台帳 F 2026-10-08)"],
      detail=["押すと確認の小窓（Q140）。「確認済にする」で確定すると、法人・ドライバーは報告し直せなくなる（法人Web の E326）。確認後は S141 のトーストを出し、ボタンを「確認済」の表示に変える（4.6）。", "Bấm để hiện cửa sổ xác nhận (Q140). Khi chốt bằng 「確認済にする」, pháp nhân và tài xế không báo cáo lại được (E326 của 法人Web). Sau khi xác nhận hiện toast S141 và đổi nút thành hiển thị 「確認済」 (4.6)."],
      demo_ok=["コードにない操作（API の confirmStock はあるが画面から呼んでいない）。新設する（台帳 F 2026-10-07）。", "Thao tác chưa có trong code (API confirmStock có nhưng màn hình không gọi). Thêm mới (台帳 F 2026-10-07)."]),
    F("2", "概要のバッジ", ".bl-meta::対象期間", "area", pattern="P-STATUS-COLORS",
      detail=["拠点名・法人名（法人なしは「法人なし」）・月・当月の棚卸前／後（棚卸後は報告日つき）・対象期間・実績精算 確定済・差分率・廃棄率・10%以上のときの赤いタグ。", "Tên chi nhánh, tên pháp nhân (không có pháp nhân thì 「法人なし」), tháng, trước / sau kiểm kê của tháng hiện tại (sau kiểm kê kèm ngày báo cáo), kỳ đối tượng, quyết toán thực tế đã chốt, tỷ lệ chênh lệch, tỷ lệ hủy, thẻ đỏ khi từ 10% trở lên."]),
    F("3", "状態のお知らせ", ".es-inline", "area",
      detail=["状態で1つ出す。棚卸なし：この拠点は棚卸なしです。管理ロス・事務手数料はありません。／最初の報告待ち：最初の棚卸報告がまだです。管理ロスは最初の報告のあとに出します。25日になっても報告がないと事務手数料（¥3,000）がかかります（最初の報告の前の拠点にも付く）が、リリース後の最初のサイクルは事務手数料がかかりません（メッセージ ID は採番待ち）。／当月の棚卸前：当月の棚卸はまだです。いまの計算在庫を表示しています。／棚卸後：当月の棚卸は報告済みです。在庫調整は管理ロスと実績精算に影響します。／確定済みで編集不可：実績精算が確定済みのため変更できません。確定を解除してから直してください（E184）。／過去月：確定済みです。確定したときの記録を表示しています（見るだけ）。／惣菜買取・解約後の拠点、および「対象外」の休止中の拠点：事務手数料の案内もリマインドも出さない（台帳 E 2026-10-05・在庫.md §5-10）。休止の始めの報告がある月は通常の行（報告の有無の表示も通常どおり）で、翌月から「対象外」。リリース時にすでに休止中の拠点は最初から「対象外」（台帳 F 2026-10-08）。", "Hiện một thông báo theo trạng thái. Không kiểm kê: chi nhánh này không kiểm kê, không có hao hụt quản lý và phí hành chính. / Chờ báo cáo đầu tiên: chưa có báo cáo kiểm kê đầu tiên, hao hụt quản lý sẽ hiện sau báo cáo đầu tiên. Nếu đến ngày 25 vẫn chưa có báo cáo thì phát sinh phí hành chính (¥3,000) (cũng áp dụng cho chi nhánh chưa có báo cáo đầu tiên), nhưng chu kỳ đầu tiên sau khi phát hành không mất phí hành chính (ID thông báo đang chờ cấp số). / Trước kiểm kê tháng hiện tại: chưa kiểm kê tháng này, đang hiện tồn kho tính toán hiện tại. / Sau kiểm kê: đã báo cáo kiểm kê tháng này, điều chỉnh tồn kho ảnh hưởng đến hao hụt quản lý và quyết toán thực tế. / Đã chốt nên không sửa được: quyết toán thực tế đã chốt nên không đổi được, hãy hủy chốt rồi sửa (E184). / Tháng quá khứ: đã chốt, đang hiện bản ghi lúc chốt (chỉ xem). / Mua đứt món ăn kèm, sau khi hủy hợp đồng và chi nhánh tạm dừng ở trạng thái 「対象外」: không hiện thông báo phí hành chính và nhắc nhở (台帳 E 2026-10-05, 在庫.md §5-10). Tháng có báo cáo bắt đầu tạm dừng là dòng bình thường (hiển thị có / chưa báo cáo như thường), từ tháng sau là 「対象外」. Chi nhánh đã tạm dừng từ lúc phát hành là 「対象外」 ngay từ đầu (台帳 F 2026-10-08)."],
      err=["I03"],
      demo_ok=["コードの文言に「点検」「申告」「督促」が残る。「棚卸」「報告」に直し、督促の語は消す（台帳 F 用語の統一・H-S4）。", "Trong câu chữ của code còn 「点検」「申告」「督促」. Sửa thành 「棚卸」「報告」, bỏ từ nhắc nhở (台帳 F thống nhất thuật ngữ, H-S4)."]),
    F("4", "棚卸報告（カード）", ".es-card::棚卸報告", "area",
      detail=["その月の棚卸報告の状態。最後の報告が有効（同じ月に法人・ドライバー・運営の報告があれば、最後のもの）。", "Trạng thái báo cáo kiểm kê của tháng đó. Báo cáo cuối cùng có hiệu lực (nếu cùng tháng có báo cáo của pháp nhân, tài xế, vận hành thì lấy cái cuối)."],
      demo_ok=["コードのカード名は「棚卸報告（棚卸の申告）」で、項目名に「申告」が残る。「棚卸報告」「報告」に直す（H-S4）。", "Tên thẻ trong code là 「棚卸報告（棚卸の申告）」, tên mục còn 「申告」. Sửa thành 「棚卸報告」「報告」 (H-S4)."]),
    F("4.1", "状態", ".es-card label.es-field__label::状態^", "label", pattern="P-STATUS-COLORS", detail=["報告済（緑）／未報告（赤）。", "Đã báo cáo (xanh lá) / Chưa báo cáo (đỏ)."],
      demo_ok=["コードは「申告済」「未申告」。「報告済」「未報告」に直す（H-S4）。", "Code dùng 「申告済」「未申告」. Sửa thành 「報告済」「未報告」 (H-S4)."]),
    F("4.2", "報告日", ".es-card label.es-field__label::申告日^", "label", detail=["最後の報告の日（yyyy-mm-dd）。未報告は「—」。", "Ngày của báo cáo cuối cùng (yyyy-mm-dd). Chưa báo cáo thì 「—」."]),
    F("4.3", "報告者", ".es-card label.es-field__label::申告者^", "label",
      detail=["報告した方の氏名。代理入力の場合は、ログイン中の運営の氏名（台帳 F 2026-10-07）。未報告は「—」。", "Họ tên người báo cáo. Nếu nhập thay thì là họ tên nhân viên vận hành đang đăng nhập (台帳 F 2026-10-07). Chưa báo cáo thì 「—」."],
      demo_ok=["コードの報告者・登録者は固定の名前（運営 佐藤）。ログイン中の運営アカウントにする（H-S5）。", "Người báo cáo / người đăng ký trong code là tên cố định (運営 佐藤). Đổi thành tài khoản vận hành đang đăng nhập (H-S5)."]),
    F("4.4", "報告の方法", ".es-card label.es-field__label::申告の方法^", "label",
      detail=["ES配送便ドライバー（ドライバーアプリ）／企業担当者（法人Web の棚卸報告）／運営（代理入力）。最後に報告した方の方法を出す。未報告は「—」。", "Tài xế ES配送便 (app tài xế) / Người phụ trách doanh nghiệp (báo cáo kiểm kê ở 法人Web) / Vận hành (nhập thay). Hiện cách báo cáo của người báo cáo cuối cùng. Chưa báo cáo thì 「—」."]),
    F("4.5", "報告の締め", ".es-card label.es-field__label::申告の締め^", "label",
      detail=["お客様 20日・運営 25日の2行（例：お客様 2026/10/20・運営 2026/10/25）。", "2 dòng: khách hàng ngày 20, vận hành ngày 25 (ví dụ: お客様 2026/10/20・運営 2026/10/25)."],
      demo_ok=["コードは「…/20（対象期間の最終日）」の1行だけ。お客様 20日・運営 25日の2行にする（H-S9・台帳 E）。", "Code chỉ có 1 dòng 「…/20（対象期間の最終日）」. Sửa thành 2 dòng: khách hàng ngày 20, vận hành ngày 25 (H-S9, 台帳 E)."]),
    F("4.6", "確認の状態", "-", "label", pattern="P-STATUS-COLORS",
      cond=["報告済みのとき", "Khi đã báo cáo"],
      detail=["確認済みのときは「確認済」（緑）。まだなら「確認前」（灰）。確認済みのあと、法人・ドライバーは報告し直せない（E326）。", "Khi đã xác nhận hiện 「確認済」 (xanh lá). Chưa thì 「確認前」 (xám). Sau khi xác nhận, pháp nhân và tài xế không báo cáo lại được (E326)."],
      open=["確認した人・日時を画面に出すかが台帳にない", "Sổ quyết định không ghi có hiện người xác nhận và thời điểm xác nhận trên màn hình hay không"], ask="hong"),
    F("4.7", "商品ごとの実数", ".es-card label.es-field__label::商品ごとの実数^", "label", detail=["報告済みなら「下の表の『棚卸』の列」。未報告なら「報告されると下の表に出ます」。", "Nếu đã báo cáo thì 「下の表の『棚卸』の列」 (cột 『棚卸』 của bảng bên dưới). Chưa báo cáo thì 「報告されると下の表に出ます」 (sẽ hiện ở bảng bên dưới khi có báo cáo)."],
      demo_ok=["コードは「点検申告」の列名を指す。表の列名を「棚卸」に直す（H-S4）。", "Code trỏ đến tên cột 「点検申告」. Sửa tên cột của bảng thành 「棚卸」 (H-S4)."]),
    F("4.8", "未報告のときの案内", ".es-card .foot", "label", cond=["未報告で、棚卸なしでなく、「対象外」の休止中・惣菜買取・解約後でないとき（休止の始めの月は通常どおり出す）", "Khi chưa báo cáo, không phải không kiểm kê, và không phải tạm dừng ở trạng thái 「対象外」 / mua đứt món ăn kèm / sau khi hủy hợp đồng (tháng bắt đầu tạm dừng vẫn hiện như bình thường)"],
      detail=["お客様の入力は20日まで。25日までに報告がない（運営の代理入力も含む）と、事務手数料（¥3,000・税抜）がかかる（最初の棚卸報告の前の拠点にも付く。管理ロスは出さない）。ただし、リリース後の最初のサイクルだけは事務手数料もかからない。案内には「リリース後の最初のサイクルは事務手数料がかかりません」と書く（メッセージ ID は採番待ち）。督促を送るボタンは置かない（毎週の自動リマインドだけ）。「対象外」の休止中・惣菜買取・解約後の拠点には出さない（事務手数料の対象外。台帳 E 2026-10-05・在庫.md §5-10）。休止の始めの報告がある月は通常の行、翌月から「対象外」（台帳 F 2026-10-08）。", "Khách hàng nhập đến ngày 20. Nếu đến ngày 25 vẫn chưa có báo cáo (kể cả vận hành nhập thay) thì phát sinh phí hành chính (¥3,000, chưa gồm thuế) (cũng áp dụng cho chi nhánh chưa có báo cáo kiểm kê đầu tiên; không hiện hao hụt quản lý). Tuy nhiên, chỉ riêng chu kỳ đầu tiên sau khi phát hành thì cũng được miễn phí hành chính. Trong thông báo ghi 「リリース後の最初のサイクルは事務手数料がかかりません」 (Chu kỳ đầu tiên sau khi phát hành không mất phí hành chính; ID thông báo đang chờ cấp số). Không đặt nút gửi nhắc nhở (chỉ có nhắc nhở tự động hằng tuần). Không hiện với chi nhánh tạm dừng ở trạng thái 「対象外」, mua đứt món ăn kèm hoặc sau khi hủy hợp đồng (ngoài đối tượng phí hành chính; 台帳 E 2026-10-05, 在庫.md §5-10). Tháng có báo cáo bắt đầu tạm dừng là dòng bình thường, từ tháng sau là 「対象外」 (台帳 F 2026-10-08)."],
      demo_ok=["コードには「督促を送る」ボタンがある（押してもメールは送らない）。ボタンを外す（台帳 F 2026-10-07）。", "Trong code có nút 「督促を送る」 (bấm cũng không gửi mail). Bỏ nút này (台帳 F 2026-10-07)."]),
    F("5", "計算在庫の表", ".es-card::＝ 計算在庫", "table",
      detail=["1行＝1商品（その拠点に関係する商品）。列：商品・前回の棚卸・＋納品・−販売（アプリの売れた数 − 返金済）・−廃棄・±在庫調整・＝計算在庫・［棚卸後だけ］棚卸（実数）・差（管理ロス）・差分率・廃棄率。末尾に合計の行。棚卸前の見出しは「いまの計算在庫」、棚卸後は「計算在庫と棚卸（管理ロス）」。", "1 dòng = 1 sản phẩm (sản phẩm liên quan đến chi nhánh đó). Cột: sản phẩm, kiểm kê lần trước, ＋giao hàng, −bán (số bán của app − đã hoàn tiền), −hủy, ±điều chỉnh tồn kho, ＝tồn kho tính toán, [chỉ sau kiểm kê] kiểm kê (số thực), chênh lệch (hao hụt quản lý), tỷ lệ chênh lệch, tỷ lệ hủy. Cuối bảng có dòng tổng. Tiêu đề trước kiểm kê là 「いまの計算在庫」, sau kiểm kê là 「計算在庫と棚卸（管理ロス）」."],
      demo_ok=["コードの列名は「前回の点検申告」「点検申告」。「前回の棚卸」「棚卸」に直す（H-S4）。", "Tên cột trong code là 「前回の点検申告」「点検申告」. Sửa thành 「前回の棚卸」「棚卸」 (H-S4)."]),
    F("5.1", "10%以上の行の色", ".es-table tbody tr[style]", "label",
      detail=["差分率・廃棄率の絶対値が10%以上の商品の行を赤い背景にし、その率を赤字にする（しきい値は当面10%固定）。", "Dòng sản phẩm có giá trị tuyệt đối của tỷ lệ chênh lệch / tỷ lệ hủy từ 10% trở lên có nền đỏ và tỷ lệ đó chữ đỏ (ngưỡng tạm thời cố định 10%)."]),
    F("6", "登録済みの在庫調整", ".es-card::登録済みの在庫調整", "table", pattern="P-HIST",
      detail=["その月の在庫調整の履歴（追記だけ。取消・削除はない）。列：ID・登録日時・登録者・商品・数量・理由。数量は符号つき（+3点）。誤りは反対向きの調整を新しく入れて直す。", "Lịch sử điều chỉnh tồn kho của tháng đó (chỉ thêm, không hủy / xóa). Cột: ID, thời điểm đăng ký, người đăng ký, sản phẩm, số lượng, lý do. Số lượng có dấu (+3点). Nếu sai thì nhập thêm điều chỉnh ngược chiều để sửa."],
      demo_ok=["コードの在庫調整は月を持たず、拠点の調整を全部足す（月が進むと二重に効く）。締め月ごとに持つ（H-S7）。登録者は固定名（H-S5）。", "Điều chỉnh tồn kho trong code không có tháng, cộng toàn bộ điều chỉnh của chi nhánh (khi sang tháng sẽ tác động hai lần). Phải giữ theo từng tháng chốt (H-S7). Người đăng ký là tên cố định (H-S5)."]),
    F("6.1", "0件の表示", ".es-card td.dim", "label", err=["I01"], detail=["調整がないときは I01。", "Khi không có điều chỉnh thì hiện I01."],
      demo_ok=["コードの文言「この期間の在庫調整はありません」を I01 に揃える。", "Thống nhất câu chữ 「この期間の在庫調整はありません」 của code thành I01."]),
    F("7", "読み込めなかった表示", ".bl-meta::読み込めませんでした", "label",
      detail=["詳細・在庫調整・代理入力の読み込みに失敗したとき（W141。「{対象}を読み込めませんでした。時間をおいて、もう一度お試しください。」）。画像なし。", "Khi tải chi tiết / điều chỉnh tồn kho / nhập thay thất bại (W141. 「{対象}を読み込めませんでした。時間をおいて、もう一度お試しください。」). Không có ảnh."]),
]

# ================================================================ AW_STCK_003 在庫調整
L3 = [
    F("1", "ヘッダー", ".es-pagehead", "area",
      detail=["パンくず：請求 / 棚卸し（拠点在庫）/ 在庫調整。タイトル「在庫調整」＋拠点ID。フル権限・システム管理だけが開ける（それ以外の役割は鉛筆が出ない）。", "Breadcrumb: 請求 / 棚卸し（拠点在庫）/ 在庫調整. Tiêu đề 「在庫調整」 + ID chi nhánh. Chỉ Toàn quyền và Quản trị hệ thống mở được (vai trò khác không hiện bút chì)."],
      demo_ok=["コードのパンくずの途中は「在庫管理」。「棚卸し（拠点在庫）」に直す。", "Giữa breadcrumb trong code là 「在庫管理」. Sửa thành 「棚卸し（拠点在庫）」."]),
    F("1.1", "キャンセル", ".es-pagehead__actions button::キャンセル", "button", "click", err=["Q02"],
      detail=["入力があれば「編集内容を破棄しますか？」（Q02）。なければそのまま在庫詳細へ戻る。", "Nếu có nhập thì hiện 「編集内容を破棄しますか？」 (Q02). Nếu không thì về thẳng chi tiết tồn kho."]),
    F("1.2", "保存", ".es-pagehead__actions button::保存", "button", "click", err=["S01", "E54", "E30", "E31", "E32", "E181"], cond=PERM_FULL,
      detail=["数量を入れた行をまとめてチェックして登録する。保存したらすぐ計算在庫に反映（申請・承認なし）。成功したら S01 のトーストを出して在庫詳細へ。数量がどの行にもなければ E181。請求済みの拠点は E54。フル権限・システム管理だけ（権限がない役割が /edit を直接開いたときは保存ボタンを出さない。それでも保存が送られたら E32）。", "Kiểm tra cùng lúc các dòng đã nhập số lượng rồi đăng ký. Sau khi lưu phản ánh ngay vào tồn kho tính toán (không có đề xuất / phê duyệt). Thành công thì hiện toast S01 và về chi tiết tồn kho. Nếu không dòng nào có số lượng thì E181. Chi nhánh đã thanh toán thì E54. Chỉ Toàn quyền và Quản trị hệ thống (vai trò không có quyền mở trực tiếp /edit thì không hiện nút lưu; nếu vẫn gửi lưu thì E32)."],
      demo_ok=["コードのチェックは「数量と理由の両方を入力してください（n件）」のトーストと赤枠だけで、範囲・桁がない。エラーは項目の下に出す（E01・E04・E13・E180・E12。H-S6）。登録者は固定名（H-S5）。", "Kiểm tra trong code chỉ có toast 「数量と理由の両方を入力してください（n件）」 và viền đỏ, không có kiểm tra phạm vi / số chữ số. Hiện lỗi dưới từng mục (E01, E04, E13, E180, E12. H-S6). Người đăng ký là tên cố định (H-S5)."]),
    F("2", "概要のバッジ", ".bl-meta::対象期間", "area", detail=["拠点名・法人名・月・当月の棚卸前／後・対象期間・差分率・廃棄率（在庫詳細と同じ）。", "Tên chi nhánh, tên pháp nhân, tháng, trước / sau kiểm kê của tháng hiện tại, kỳ đối tượng, tỷ lệ chênh lệch, tỷ lệ hủy (giống chi tiết tồn kho)."]),
    F("3", "説明", ".es-inline", "area",
      detail=["調整したい商品の行に、数量（＋増やす／−減らす）と理由を入れて「保存」。保存するとすぐ計算在庫に反映されます（申請・承認はありません）。理由は履歴に残ります。棚卸後の拠点には「在庫調整は管理ロスと実績精算に影響します」の警告も出す。", "Nhập số lượng (＋tăng / −giảm) và lý do vào dòng sản phẩm cần điều chỉnh rồi bấm 「保存」. Sau khi lưu sẽ phản ánh ngay vào tồn kho tính toán (không có đề xuất / phê duyệt). Lý do được lưu trong lịch sử. Với chi nhánh đã kiểm kê còn hiện cảnh báo 「在庫調整は管理ロスと実績精算に影響します」."],
      demo_ok=["コードの文言の「監査ログ」を「履歴」に直す（登録者を画面の履歴に出すため）。", "Sửa 「監査ログ」 trong câu chữ của code thành 「履歴」 (vì hiện người đăng ký trong lịch sử trên màn hình)."]),
    F("4", "在庫調整の入力表", ".es-table", "table", pattern="P-FORM",
      detail=["計算在庫の表（在庫詳細と同じ列）の右端に、行ごとの 数量・理由 の入力欄を置く。全商品から選べる（その拠点に関係しない商品も足せる。拠点間の移動の移動先に行がないため）。", "Đặt ô nhập số lượng, lý do cho từng dòng ở bên phải bảng tồn kho tính toán (cùng cột với chi tiết tồn kho). Chọn được từ toàn bộ sản phẩm (có thể thêm cả sản phẩm không liên quan đến chi nhánh, vì nơi chuyển đến của việc chuyển giữa chi nhánh chưa có dòng)."],
      demo_ok=["コードはその拠点に関係する商品の行にしか入力できない。商品を足せるようにする（台帳 F 2026-10-07）。", "Trong code chỉ nhập được ở dòng sản phẩm liên quan đến chi nhánh. Làm để thêm được sản phẩm (台帳 F 2026-10-07)."]),
    F("4.1", "数量", ".es-table input[placeholder=\"±点\"]", "text", "input", req="条件付き", len=["整数（0以外・−999,999〜999,999）", "Số nguyên (khác 0, −999,999〜999,999)"],
      init=["空", "Trống"], ex=["-3", "Số lượng điều chỉnh có dấu (số nguyên khác 0, ví dụ: -3 = giảm 3)"], err=["E180", "E12", "E14"],
      cond=["行ごと。数量か理由のどちらかを入れた行は、両方必須", "Theo từng dòng. Dòng đã nhập số lượng hoặc lý do thì bắt buộc cả hai"],
      valid=["0以外の整数（符号つき）。全角の数字・マイナスは半角に直す。範囲は −999,999〜999,999（入力の共通基準 ⑤）。数量がどの行にもなければ保存で E181。", "Số nguyên khác 0 (có dấu). Số và dấu trừ toàn góc đổi sang nửa góc. Phạm vi −999,999〜999,999 (chuẩn nhập chung ⑤). Nếu không dòng nào có số lượng thì lưu sẽ ra E181."],
      detail=["＋は増やす、−は減らす。右寄せ。エラーは欄の下に赤枠と文言（P-FORM）。", "＋ là tăng, − là giảm. Căn phải. Lỗi hiện viền đỏ và câu chữ dưới ô (P-FORM)."],
      demo_ok=["コードは範囲・桁のチェックがない。入力の共通基準 ⑤ に合わせる（H-S6）。", "Code không kiểm tra phạm vi / số chữ số. Sửa theo chuẩn nhập chung ⑤ (H-S6)."]),
    F("4.2", "理由", ".es-table input[placeholder^=理由]", "text", "input", req="条件付き", len="文字列 500", init=["空", "Trống"], ex=["拠点間移動（CU00871 から）", "Lý do điều chỉnh (ví dụ: chuyển giữa chi nhánh, từ CU00871)"], err=["E01", "E04", "E13"],
      cond=["行ごと。数量を入れた行は必須", "Theo từng dòng. Dòng đã nhập số lượng thì bắt buộc"],
      detail=["在庫調整の理由。履歴に残る。絵文字は使えない。", "Lý do điều chỉnh tồn kho. Được lưu trong lịch sử. Không dùng được emoji."],
      demo_ok=["コードは理由の桁・絵文字のチェックがない（H-S6）。1行の欄の最大は 60 文字だが、理由は備考と同じ 500 文字とする。", "Code không kiểm tra số chữ số / emoji của lý do (H-S6). Ô một dòng tối đa 60 ký tự nhưng lý do là 500 ký tự giống ghi chú."]),
    F("4.3", "商品を追加", "-", "select", "select", req="－", len=["選択（全商品から検索）", "Chọn (tìm trong toàn bộ sản phẩm)"], init=["空", "Trống"], ex=["バターチキンカレー", "Tên sản phẩm cần thêm (ví dụ: Cà ri gà bơ)"],
      cond=["拠点に行がない商品を足すとき", "Khi thêm sản phẩm chi nhánh chưa có dòng"],
      detail=["商品名・品番で探して選ぶと、数量 0 の行が表に足される（その拠点に関係しない商品も選べる）。足した行も、数量と理由を入れれば登録される。", "Tìm theo tên sản phẩm / mã hàng rồi chọn thì bảng được thêm một dòng số lượng 0 (chọn được cả sản phẩm không liên quan đến chi nhánh). Dòng đã thêm cũng được đăng ký nếu nhập số lượng và lý do."],
      demo_ok=["コードにない（関係する商品の行しかない）。台帳 F 2026-10-07（調整は全商品から選べる）のとおり新設する。", "Chưa có trong code (chỉ có dòng sản phẩm liên quan). Thêm mới theo 台帳 F 2026-10-07 (điều chỉnh chọn được từ toàn bộ sản phẩm)."]),
    F("5", "登録済みの在庫調整", ".es-card::登録済みの在庫調整", "table", pattern="P-HIST", err=["I01"],
      detail=["在庫詳細と同じ履歴の表（読むだけ）。取消の列・ボタンは置かない。誤りは反対向きの数量を新しい行として入れて直す。調整がない（0件）ときは I01（在庫詳細 6.1 と同じ）。", "Bảng lịch sử giống chi tiết tồn kho (chỉ đọc). Không đặt cột / nút hủy. Nếu sai thì nhập số lượng ngược chiều thành dòng mới để sửa. Khi không có điều chỉnh (0 dòng) thì hiện I01 (giống 6.1 của chi tiết tồn kho)."],
      demo_ok=["コードは各行に「取消」ボタンがあり、押すと行を消して計算在庫に戻して見せる。取消を外す（台帳 F 2026-10-07・履歴は消せない）。", "Trong code mỗi dòng có nút 「取消」, bấm sẽ xóa dòng và hiện lại tồn kho tính toán. Bỏ chức năng hủy (台帳 F 2026-10-07, không xóa được lịch sử)."]),
    F("6", "編集できないときの表示", ".es-inline--negative", "label", err=["E54"],
      cond=["実績精算が確定済み・請求済みの拠点を /edit で直接開いたとき", "Khi mở trực tiếp /edit của chi nhánh có quyết toán thực tế đã chốt hoặc đã thanh toán"],
      detail=["入力欄と保存を出さず、在庫詳細の見た目で「実績精算が確定済みのため変更できません。確定を解除してから直してください。」（E184）を出す。請求済みの月は E54。確定後に見つかった誤りは、翌月の請求詳細の「③ 調整」で相殺する。", "Không hiện ô nhập và nút lưu, hiện 「実績精算が確定済みのため変更できません。確定を解除してから直してください。」 (E184) với giao diện của chi tiết tồn kho. Tháng đã thanh toán thì E54. Lỗi phát hiện sau khi chốt sẽ bù trừ ở 「③ 調整」 của chi tiết thanh toán tháng sau."],
      demo_ok=["コードは確定済み・法人確定だけ見て請求済みを見ない（保存で E54 になる）。請求済みの拠点にも編集を出さない（H-S12）。", "Code chỉ xem đã chốt / pháp nhân đã chốt chứ không xem đã thanh toán (lưu thì ra E54). Không hiện chức năng sửa ở chi nhánh đã thanh toán (H-S12)."]),
]

# ================================================================ AW_STCK_004 在庫調整（まとめて）
L4 = [
    F("1", "ヘッダー", ".es-pagehead", "area",
      detail=["パンくず：請求 / 棚卸し（拠点在庫）/ 在庫調整（まとめて）。タイトル「在庫調整（まとめて）」。一覧で拠点を選んで開く（URL ?ids=…）。選んだ拠点は拠点ごとのタブで入れる（台帳 F 2026-10-08）。", "Breadcrumb: 請求 / 棚卸し（拠点在庫）/ 在庫調整（まとめて）. Tiêu đề 「在庫調整（まとめて）」. Chọn chi nhánh ở danh sách rồi mở (URL ?ids=…). Chi nhánh đã chọn được nhập theo từng tab chi nhánh (台帳 F 2026-10-08)."],
      demo_ok=["コードのパンくずの途中は「在庫管理」。「棚卸し（拠点在庫）」に直す。", "Giữa breadcrumb trong code là 「在庫管理」. Sửa thành 「棚卸し（拠点在庫）」."]),
    F("1.1", "キャンセル", ".es-pagehead__actions button::キャンセル", "button", "click", err=["Q02"], detail=["入力があるタブ（拠点）ごとに破棄の確認（Q02）を出す。入力のないタブ・保存済み（✓）のタブは確認なし。確認のあと一覧へ戻る（保存済みのタブの分はそのまま残る）。", "Hiện xác nhận hủy bỏ (Q02) theo từng tab (chi nhánh) có nhập. Tab không nhập và tab đã lưu (✓) thì không xác nhận. Sau khi xác nhận thì về danh sách (phần của các tab đã lưu vẫn được giữ nguyên)."]),
    F("1.2", "保存", ".es-pagehead__actions button::保存", "button", "click", err=["Q11", "S11", "E184", "E54", "E181", "E01", "E32", "E30"], cond=PERM_FULL,
            detail=["保存は開いているタブ（拠点）ごと。リアルタイム保存はしない（台帳 F 2026-10-08）。そのタブの理由と、そのタブで数量を入れたマスをチェックして確認（Q11：選択した{n}件を在庫調整しますか？。{n}＝そのタブで数量を入れたマスの件数）→ そのタブの分だけ登録。保存したらすぐ計算在庫に反映。登録できたら S11（そのタブの分）を出し、同じ画面に残って、保存したタブに ✓ を付けて入力（数量・理由）を固定する（もう一度保存はできない）。全タブを保存したら一覧へ戻る。実績精算が確定済みの拠点のタブは保存できず E184、請求済みの拠点のタブは E54（入力欄と保存は出さない）。保存できないタブがあっても、ほかのタブは保存できる（保存できなかったタブは ✓ が付かない）。「一部だけ登録して残りをスキップ（W140）」は使わない。数量がそのタブのどのマスにもなければ E181。理由が空なら、そのタブの理由の欄の下に E01。フル権限・システム管理だけ（保存ボタンがない役割は E32）。", "Lưu theo từng tab (chi nhánh) đang mở. Không lưu theo thời gian thực (台帳 F 2026-10-08). Kiểm tra lý do của tab đó và các ô đã nhập số lượng trong tab đó rồi xác nhận (Q11: điều chỉnh tồn kho {n} dòng đã chọn?; {n} = số ô đã nhập số lượng trong tab) → chỉ đăng ký phần của tab đó. Sau khi lưu phản ánh ngay vào tồn kho tính toán. Đăng ký được thì hiện S11 (phần của tab đó), vẫn ở lại cùng màn hình, gắn ✓ cho tab đã lưu và khóa phần nhập (số lượng, lý do) (không lưu lại lần nữa). Lưu hết mọi tab thì về danh sách. Tab của chi nhánh đã chốt quyết toán thực tế thì không lưu được và hiện E184, tab của chi nhánh đã thanh toán thì E54 (không hiện ô nhập và nút lưu). Dù có tab không lưu được thì các tab khác vẫn lưu được (tab không lưu được không có ✓). Không dùng 「đăng ký một phần, bỏ qua phần còn lại (W140)」. Nếu không ô nào trong tab có số lượng thì E181. Nếu lý do để trống thì E01 dưới ô lý do của tab đó. Chỉ Toàn quyền và Quản trị hệ thống (vai trò không có nút lưu thì E32)."],
      demo_ok=["コードは確認がなく、複数拠点をまとめて1回で保存し、確定済み・請求済みの拠点を黙ってスキップして「保存しました」を出す。拠点ごとのタブ・タブ単位の確認（Q11）・結果（S11）・保存したタブに ✓ を付けて固定し同じ画面に残る（全タブ保存で一覧へ）・保存できない拠点のタブ（E184・E54）に直す（H-S13・台帳 F 2026-10-08）。コードの保存後は一覧へ戻る。", "Code không có xác nhận, lưu nhiều chi nhánh cùng một lần, âm thầm bỏ qua chi nhánh đã chốt / đã thanh toán và hiện 「保存しました」. Sửa thành: tab theo chi nhánh, xác nhận theo tab (Q11), kết quả (S11), gắn ✓ và khóa tab đã lưu, ở lại cùng màn hình (lưu hết mọi tab thì về danh sách), tab chi nhánh không lưu được (E184, E54) (H-S13, 台帳 F 2026-10-08). Trong code sau khi lưu thì về danh sách."]),
    F("2", "概要のバッジ", ".bl-meta::拠点", "area", detail=["締め月・拠点の数（n拠点）・法人名（・区切り）。", "Tháng chốt, số chi nhánh (n拠点), tên pháp nhân (ngăn cách bằng ・)."]),
    F("3", "説明", ".es-inline", "area",
      detail=["拠点ごとのタブを開き、調整したい商品のマスに数量（＋増やす／−減らす）を入れ、そのタブの理由を書いて保存。保存はタブ（拠点）ごとで、保存するとすぐ計算在庫に反映されます（リアルタイム保存はしません）。保存したタブには ✓ が付いて入力が固定され、同じ画面に残ります。全タブを保存するか「キャンセル」すると一覧へ戻ります。理由はタブごとに書き、そのタブで入れたマスすべてに同じものが入り、履歴に残ります。拠点間の移動は、移動元の拠点のタブに −、移動先の拠点のタブに ＋ を、それぞれのタブで別々に入れて保存する。", "Mở tab của từng chi nhánh, nhập số lượng (＋tăng / −giảm) vào ô sản phẩm cần điều chỉnh, viết lý do của tab đó rồi lưu. Lưu theo từng tab (chi nhánh), sau khi lưu phản ánh ngay vào tồn kho tính toán (không lưu theo thời gian thực). Tab đã lưu được gắn ✓ và khóa phần nhập, vẫn ở lại cùng màn hình. Lưu hết mọi tab hoặc bấm 「キャンセル」 thì về danh sách. Lý do viết riêng cho từng tab, cùng một lý do được gán cho mọi ô đã nhập trong tab đó và lưu trong lịch sử. Chuyển giữa các chi nhánh: nhập − ở tab chi nhánh chuyển đi và ＋ ở tab chi nhánh chuyển đến, lưu riêng từng tab."]),
    F("4", "理由", ".es-card input[placeholder^=例）]", "text", "input", req="○", len="文字列 500", init=["空", "Trống"], ex=["拠点間移動（CU00871 から CU00643 へ）", "Lý do của tab (chi nhánh) đó (ví dụ: chuyển giữa chi nhánh, từ CU00871 sang CU00643)"], err=["E01", "E04", "E13"],
      valid=["タブ（拠点）ごとに必須（そのタブで数量を入れたマスがあるとき）。500文字まで。絵文字は使えない。保存したタブ（✓）では固定して変えられない。", "Bắt buộc theo từng tab (chi nhánh) (khi tab đó có ô đã nhập số lượng). Tối đa 500 ký tự. Không dùng được emoji. Ở tab đã lưu (✓) thì bị khóa, không sửa được."],
      detail=["理由の欄はタブ（拠点）ごとに持つ（全タブで1つではない）。そのタブで入れたマスすべてに同じ理由を付け、履歴に残る。「前のタブの理由を使う」ボタンで、前のタブの理由をこのタブの欄へ写せる（写したあとは直せる。1つ目のタブには出さない）。絵文字は使えない。", "Ô lý do có riêng cho từng tab (chi nhánh) (không phải một ô cho mọi tab). Gắn cùng một lý do cho mọi ô đã nhập trong tab đó và lưu trong lịch sử. Nút 「前のタブの理由を使う」 sao chép lý do của tab trước vào ô của tab này (sau khi sao chép vẫn sửa được; không hiện ở tab đầu tiên). Không dùng được emoji."],
      demo_ok=["コードは理由の欄が全体で1つで、桁・絵文字のチェックがない。タブ（拠点）ごとの欄に直す（台帳 F 2026-10-08）。エラーは項目の下に出す（H-S6）。", "Trong code ô lý do chỉ có một cho toàn bộ và không kiểm tra số chữ số / emoji. Sửa thành ô riêng cho từng tab (chi nhánh) (台帳 F 2026-10-08). Hiện lỗi dưới từng mục (H-S6)."]),
    F("5", "拠点×商品の表", ".es-table", "table", pattern="P-FORM",
      detail=["拠点ごとのタブ（タブ名＝拠点名・拠点ID・棚卸前／後）。タブの中は 行＝商品（全商品）で、マスごとに計算在庫（参考）と数量の入力欄。全商品から選べる。各タブに、そのタブの理由の欄（No.4）を持つ。保存したタブには名前に ✓ を付け、数量と理由を固定する。確定済み・請求済みの拠点のタブは入力欄と保存を出さず、E184／E54 の案内を出す。", "Mỗi chi nhánh một tab (tên tab = tên chi nhánh, ID chi nhánh, trước / sau kiểm kê). Trong tab, dòng = sản phẩm (toàn bộ sản phẩm), mỗi ô có tồn kho tính toán (tham khảo) và ô nhập số lượng. Chọn được từ toàn bộ sản phẩm. Mỗi tab có ô lý do riêng (No.4). Tab đã lưu được gắn ✓ vào tên và khóa số lượng, lý do. Tab của chi nhánh đã chốt / đã thanh toán không hiện ô nhập và nút lưu, hiện thông báo E184 / E54."]),
    F("5.1", "数量（マス）", ".es-table input[placeholder=\"±点\"]", "text", "input", req="－", len=["整数（0以外・−999,999〜999,999）", "Số nguyên (khác 0, −999,999〜999,999)"], init=["空", "Trống"], ex=["-5", "Số lượng điều chỉnh có dấu (số nguyên khác 0, ví dụ: -5 = giảm 5 ở nơi chuyển đi)"], err=["E180", "E12", "E14"],
      valid=["0以外の整数（符号つき）。全角は半角に直す。空のマスは調整しない。", "Số nguyên khác 0 (có dấu). Toàn góc đổi sang nửa góc. Ô trống thì không điều chỉnh."], detail=["右寄せ。移動元は −、移動先は ＋。", "Căn phải. Nơi chuyển đi là −, nơi chuyển đến là ＋."],
      demo_ok=["コードは範囲・桁のチェックがない（H-S6）。", "Code không kiểm tra phạm vi / số chữ số (H-S6)."]),
    F("5.2", "計算在庫（参考）", ".es-table .small::計算在庫", "label", detail=["そのマスの拠点・商品のいまの計算在庫（点）。入力の目安に出す。", "Tồn kho tính toán hiện tại (số lượng) của chi nhánh và sản phẩm trong ô đó. Hiện để làm mốc khi nhập."]),
    F("6", "拠点が選ばれていません", ".es-inline--warning", "label",
      cond=["拠点を選ばずに /bulk を開いたとき", "Khi mở /bulk mà không chọn chi nhánh"],
      err=["I142"],
      detail=["I142（「拠点が選ばれていません。一覧で拠点を選んでください。」）を出し、入力欄は出さない。", "Hiện I142 (「拠点が選ばれていません。一覧で拠点を選んでください。」) và không hiện ô nhập."]),
]

# ================================================================ AW_STCK_005 棚卸の代理入力（新設・コードにまだない）
L5 = [
    F("1", "ヘッダー", ".es-pagehead", "area",
      detail=["パンくず：請求 / 棚卸し（拠点在庫）/ 棚卸の代理入力。タイトル「棚卸の代理入力」＋拠点ID。在庫詳細の「代理入力」から開く（URL /ops/billing/stock/{拠点ID}/count）。", "Breadcrumb: 請求 / 棚卸し（拠点在庫）/ 棚卸の代理入力. Tiêu đề 「棚卸の代理入力」 + ID chi nhánh. Mở từ 「代理入力」 ở chi tiết tồn kho (URL /ops/billing/stock/{拠点ID}/count)."]),
    F("1.1", "キャンセル", ".es-pagehead__actions button::キャンセル", "button", "click", err=["Q02"], detail=["入力があれば破棄の確認（Q02）。在庫詳細へ戻る。", "Nếu có nhập thì hiện xác nhận hủy bỏ (Q02). Về chi tiết tồn kho."]),
    F("1.2", "保存", ".es-pagehead__actions button::保存", "button", "click", err=["S140", "E320", "E327", "E32", "E31", "E30"],
      cond=["保存できる役割はフル権限・CS・物流（1.3 と同じ。台帳 F 2026-10-08）。実績精算が確定済み・請求済みの月は開けない（6）", "Vai trò được lưu: Toàn quyền, CS, Logistics (giống 1.3; 台帳 F 2026-10-08). Không mở được tháng quyết toán thực tế đã chốt / đã thanh toán (6)"],
      detail=["全商品の今ある数を入れて保存すると、その拠点・月の棚卸報告として登録する（法人Web と同じ。最後の報告が有効）。成功したら S140 のトーストを出して在庫詳細へ。今ある数が空の商品があれば E320。フル権限・CS・物流以外の役割は保存ボタンを出さず、送られても E32。入力のチェックは 4 の表の各欄のとおり。保存の前に確認の小窓を出すかは open。", "Nhập số hiện có của toàn bộ sản phẩm rồi lưu thì đăng ký thành báo cáo kiểm kê của chi nhánh và tháng đó (giống 法人Web, báo cáo cuối cùng có hiệu lực). Thành công thì hiện toast S140 và về chi tiết tồn kho. Nếu có sản phẩm để trống số hiện có thì E320. Vai trò ngoài Toàn quyền, CS, Logistics thì không hiện nút lưu, nếu vẫn gửi thì E32. Kiểm tra nhập theo từng ô của bảng ở mục 4. Việc có hiện cửa sổ xác nhận trước khi lưu hay không là mục open."],
      open=["保存の前に確認の小窓を出すか（法人Web の棚卸報告は「棚卸を報告しますか？」Q207 を出す）が台帳にない", "Sổ quyết định không ghi có hiện cửa sổ xác nhận trước khi lưu hay không (báo cáo kiểm kê ở 法人Web hiện 「棚卸を報告しますか？」 Q207)"], ask="hong"),
    F("2", "概要のバッジ", ".bl-meta::対象期間", "area", detail=["拠点名・法人名・月度・対象期間・報告の締め（運営 25日）。", "Tên chi nhánh, tên pháp nhân, tháng, kỳ đối tượng, hạn báo cáo (vận hành ngày 25)."]),
    F("3", "報告の情報", ".es-card::報告", "area", detail=["読むだけ。報告者・方法は保存のときに決まる。", "Chỉ đọc. Người báo cáo và cách báo cáo được xác định khi lưu."]),
    F("3.1", "報告者", ".es-card label.es-field__label::報告者^", "label", detail=["ログイン中の運営アカウントの氏名（台帳 F 2026-10-07）。変えられない。", "Họ tên tài khoản vận hành đang đăng nhập (台帳 F 2026-10-07). Không đổi được."]),
    F("3.2", "報告の方法", ".es-card label.es-field__label::報告の方法^", "label", detail=["「運営（代理入力）」で固定。", "Cố định là 「運営（代理入力）」."]),
    F("3.3", "報告日", ".es-card label.es-field__label::報告日^", "label", detail=["保存した日（自動）。", "Ngày lưu (tự động)."]),
    F("4", "商品の表", ".es-table", "table", pattern="P-FORM",
      detail=["法人Web の棚卸報告と同じ列（台帳 F 2026-10-07）：商品・前回の棚卸・お届け中・廃棄する・今ある数・捨てた数・届いた数。初めに出すのはその拠点に関係する商品。一覧にない商品は「商品を追加」（4.4）で足せる（前回の数 0。法人Web の棚卸報告と同じ。台帳 F 2026-10-05「法人Web 版 1.0 のレビュー」⑤）。足した行は E327 の対象外。", "Các cột giống báo cáo kiểm kê ở 法人Web (台帳 F 2026-10-07): sản phẩm, kiểm kê lần trước, đang giao, cần bỏ, số hiện có, số đã bỏ, số đã nhận. Ban đầu chỉ hiện sản phẩm liên quan đến chi nhánh đó; sản phẩm ngoài danh sách thêm được bằng 「商品を追加」 (4.4) (lần trước = 0; giống báo cáo kiểm kê ở 法人Web; 台帳 F 2026-10-05 「法人Web 版 1.0 のレビュー」 ⑤). Dòng đã thêm không áp dụng E327."],
      open=["既に報告がある拠点で開いたとき、入力欄に最後の報告の数を初期値として入れるかが台帳にない", "Sổ quyết định không ghi khi mở chi nhánh đã có báo cáo thì có điền số của báo cáo cuối cùng vào ô nhập làm giá trị ban đầu hay không"], ask="hong"),
    F("4.1", "今ある数", ".es-table input[aria-label^=今ある数]", "text", "input", req="○", len=["整数（0〜999,999）", "Số nguyên (0〜999,999)"], init=["空", "Trống"], ex=["12", "Số lượng đã đếm (số nguyên, ví dụ: 12)"], err=["E320", "E12", "E14"],
      valid=["0〜999,999 の整数（台帳 E・入力の共通基準）。全角は半角に直す。ない商品は 0 を入れる。すべての商品で必須。", "Số nguyên 0〜999,999 (台帳 E, chuẩn nhập chung). Toàn góc đổi sang nửa góc. Sản phẩm không có thì nhập 0. Bắt buộc ở mọi sản phẩm."], detail=["数えた在庫の数。右寄せ。", "Số tồn kho đã đếm. Căn phải."]),
    F("4.2", "捨てた数", ".es-table input[aria-label^=捨てた数]", "text", "input", req="－", len=["整数（0〜999,999）", "Số nguyên (0〜999,999)"], init=["0", "0"], ex=["2", "Số lượng đã bỏ (số nguyên, ví dụ: 2)"], err=["E12", "E14", "E327"],
      valid=["0〜999,999 の整数。今ある数と捨てた数の合計が、前回の棚卸と届いた数の合計を超えるときは E327。", "Số nguyên 0〜999,999. Nếu tổng số hiện có và số đã bỏ vượt tổng kiểm kê lần trước và số đã nhận thì E327."], detail=["前回の棚卸のあとに捨てた数。空は 0。", "Số đã bỏ sau lần kiểm kê trước. Để trống là 0."]),
    F("4.3", "届いた数", ".es-table input[aria-label^=届いた数]", "text", "input", req="－", len=["整数（0〜999,999）", "Số nguyên (0〜999,999)"], init=["0", "0"], ex=["5", "Số lượng đã nhận (số nguyên, ví dụ: 5)"], err=["E12", "E14", "E327"],
      valid=["0〜999,999 の整数。お届け中の数以下（「0〜お届け中の数」の範囲外は E12）。", "Số nguyên 0〜999,999. Không vượt số đang giao (ngoài phạm vi 「0〜お届け中の数」 thì E12)."], detail=["お届け中の便のうち、数えたときに届いていた数。空は 0。", "Số đã đến nơi tại thời điểm đếm trong các chuyến đang giao. Để trống là 0."]),
    F("4.4", "商品を追加", "-", "button", "click", init=["なし", "Không có"],
      detail=["一覧にない商品を足す。JAN のスキャン（スマホのカメラ）か商品名の検索で商品を選ぶと、表に行が足される（前回の数 0）。足した行も、今ある数を入れれば報告に含まれる。動きは法人Web の棚卸報告（CW_STOCK No.3.15）と同じ。", "Thêm sản phẩm ngoài danh sách. Chọn sản phẩm bằng quét JAN (camera điện thoại) hoặc tìm theo tên sản phẩm thì bảng được thêm một dòng (lần trước = 0). Dòng đã thêm cũng được đưa vào báo cáo nếu nhập số hiện có. Hoạt động giống báo cáo kiểm kê ở 法人Web (CW_STOCK No.3.15)."]),
    F("5", "入力できる期間・確認済のあと", ".bl-meta::期間", "label",
      detail=["お客様の入力期限は20日。21〜25日は運営が代理で追加・修正する（台帳 E）。同じ月に両方の報告があれば最後の報告が有効。", "Hạn nhập của khách hàng là ngày 20. Ngày 21〜25 vận hành nhập thay để bổ sung / sửa (台帳 E). Nếu cùng tháng có cả hai báo cáo thì báo cáo cuối cùng có hiệu lực."],
      open=["運営が代理入力できる期間（25日まで／それ以降も）と、確認済みにしたあとに運営が代理入力できるかが台帳にない", "Sổ quyết định không ghi: thời gian vận hành được nhập thay (đến ngày 25 / cả sau đó) và vận hành có nhập thay được sau khi đã xác nhận không"], ask="hong"),
    F("6", "編集できないときの表示", ".es-inline--negative", "label", err=["E184", "E54"],
      cond=["実績精算が確定済み・請求済みの拠点を /count で直接開いたとき", "Khi mở trực tiếp /count của chi nhánh có quyết toán thực tế đã chốt hoặc đã thanh toán"],
      detail=["入力欄と保存を出さず、在庫詳細の見た目で「実績精算が確定済みのため変更できません。確定を解除してから直してください。」（E184）を出す。請求済みの月は E54。確定後に報告を入れ直すと管理ロスが変わるため（台帳 F「確定した月は編集できない」・在庫.md §6-4）。在庫詳細の「代理入力」「確認済にする」もこの月には出さない。", "Không hiện ô nhập và nút lưu, hiện 「実績精算が確定済みのため変更できません。確定を解除してから直してください。」 (E184) với giao diện của chi tiết tồn kho. Tháng đã thanh toán thì E54. Vì nếu nhập lại báo cáo sau khi chốt thì hao hụt quản lý thay đổi (台帳 F 「確定した月は編集できない」, 在庫.md §6-4). 「代理入力」 và 「確認済にする」 ở chi tiết tồn kho cũng không hiện ở tháng này."]),
]

# ================================================================ 状態（VIEWS）
_cnt = [0]


VI_V = {
 "初期表示": "Hiển thị ban đầu",
 "検索して絞り込み（棚卸前・実績精算未確定）": "Tìm kiếm và lọc (trước kiểm kê, quyết toán thực tế chưa chốt)",
 "0件": "0 kết quả",
 "ページ送り・表示件数 20件": "Phân trang, hiển thị 20 dòng",
 "行を選択（選択バー）": "Chọn dòng (thanh chọn)",
 "過去月（2026-09・確定済み・参照のみ）": "Tháng quá khứ (2026-09, đã chốt, chỉ xem)",
 "棚卸後の拠点（バッジ・報告日・管理ロス・差分率・廃棄率）": "Chi nhánh sau kiểm kê (badge, ngày báo cáo, hao hụt quản lý, tỷ lệ chênh lệch, tỷ lệ hủy)",
 "差分率・廃棄率が10%以上（赤字）": "Tỷ lệ chênh lệch / tỷ lệ hủy từ 10% trở lên (chữ đỏ)",
 "最初の棚卸報告待ち（棚卸前＋「最初の報告待ち」・管理ロス「—」）": "Chờ báo cáo kiểm kê đầu tiên (trước kiểm kê + 「最初の報告待ち」, hao hụt quản lý 「—」)",
 "棚卸なし（バッジ・管理ロス「—」・差分率「棚卸なし」）": "Không kiểm kê (badge, hao hụt quản lý 「—」, tỷ lệ chênh lệch 「棚卸なし」)",
 "実績精算が確定済みの行（バッジ「確定」・チェック／鉛筆なし）": "Dòng quyết toán thực tế đã chốt (badge 「確定」, không có ô chọn / bút chì)",
 "CSV出力": "Xuất CSV",
 "参照のみ（閲覧のみ・Ad00013）": "Chỉ xem (chỉ có quyền xem, Ad00013)",
 "フル権限以外（経理・Ad00012）": "Ngoài Toàn quyền (Kế toán, Ad00012)",
 "読み込めませんでした（赤い一行）": "Không tải được (dòng đỏ)",
 "当月・棚卸前（いまの計算在庫・登録済みの調整なし）": "Tháng hiện tại, trước kiểm kê (tồn kho tính toán hiện tại, chưa có điều chỉnh đã đăng ký)",
 "当月・棚卸後（報告カード・差・管理ロス・差分率）": "Tháng hiện tại, sau kiểm kê (thẻ báo cáo, chênh lệch, hao hụt quản lý, tỷ lệ chênh lệch)",
 "棚卸後・10%以上の行が赤＋赤いタグ": "Sau kiểm kê, dòng từ 10% trở lên màu đỏ + thẻ đỏ",
 "最初の棚卸報告待ち（警告のお知らせ）": "Chờ báo cáo kiểm kê đầu tiên (thông báo cảnh báo)",
 "棚卸なし（お知らせ）": "Không kiểm kê (thông báo)",
 "登録済みの在庫調整あり（表に行）": "Có điều chỉnh tồn kho đã đăng ký (có dòng trong bảng)",
 "実績精算が確定済み（変更できない案内・鉛筆なし）": "Quyết toán thực tế đã chốt (thông báo không đổi được, không có bút chì)",
 "過去月（?m=2026-09・確定時の記録・参照のみ）": "Tháng quá khứ (?m=2026-09, bản ghi lúc chốt, chỉ xem)",
 "運営の代理入力で報告済み（方法「運営（代理入力）」・報告者＝運営の氏名）": "Đã báo cáo bằng nhập thay của vận hành (cách báo cáo 「運営（代理入力）」, người báo cáo = họ tên vận hành)",
 "「確認済にする」の確認の小窓": "Cửa sổ xác nhận của 「確認済にする」",
 "確認済（ボタンが「確認済」の表示に変わる・S141）": "Đã xác nhận (nút đổi thành hiển thị 「確認済」, S141)",
 "見つかりません（E100）": "Không tìm thấy (E100)",
 "読み込めませんでした": "Không tải được",
 "初期（行ごとの数量・理由の入力欄）": "Ban đầu (ô nhập số lượng, lý do theo từng dòng)",
 "入力エラー（数量だけ・理由だけ）": "Lỗi nhập (chỉ có số lượng, chỉ có lý do)",
 "商品を足した行（全商品から選べる）": "Dòng đã thêm sản phẩm (chọn được từ toàn bộ sản phẩm)",
 "保存成功（S01）": "Lưu thành công (S01)",
 "編集内容を破棄しますか（Q02）": "Hủy nội dung đã sửa? (Q02)",
 "編集できない（確定済み・請求済）": "Không sửa được (đã chốt, đã thanh toán)",
 "初期（拠点 n 件 × 全商品のマス・理由）": "Ban đầu (n chi nhánh × ô của toàn bộ sản phẩm, lý do)",
 "入力エラー（数量なし・理由なし）": "Lỗi nhập (không có số lượng, không có lý do)",
 "保存の確認（Q11）": "Xác nhận lưu (Q11)",
 "保存成功（S11・保存したタブに ✓ で固定）／全タブ保存後の一覧／保存できない拠点のタブ（E184・E54）": "Lưu thành công (S11, tab đã lưu gắn ✓ và khóa) / danh sách sau khi lưu hết mọi tab / tab chi nhánh không lưu được (E184, E54)",
 "拠点が選ばれていません": "Chưa chọn chi nhánh",
 "権限なし（保存ボタンなし・Ad00002）": "Không có quyền (không có nút lưu, Ad00002)",
 "初期（商品ごとの今ある数・捨てた数・届いた数）": "Ban đầu (số hiện có, số đã bỏ, số đã nhận theo từng sản phẩm)",
 "報告済みの拠点を開いた（最後の報告が有効・上書き）": "Mở chi nhánh đã báo cáo (báo cáo cuối cùng có hiệu lực, ghi đè)",
 "入力エラー（今ある数が空・合計が超える・範囲外）": "Lỗi nhập (số hiện có để trống, tổng vượt quá, ngoài phạm vi)",
 "保存成功（S140）": "Lưu thành công (S140)",
 "当月 2026-10・全拠点が「棚卸前」・1ページ10件。初期の並びは拠点ID の昇順（コードは並べ替えなし：demo_ok）。": "Tháng hiện tại 2026-10, mọi chi nhánh ở trạng thái 「棚卸前」, 10 dòng mỗi trang. Thứ tự ban đầu là ID chi nhánh tăng dần (code không sắp xếp: demo_ok).",
 "写し（確定時の保存）のある月を選んだ状態。チェック・鉛筆は出ない。コードは 2026-09 を出せるが、写しから出す直しは宿題（H-S8）。": "Trạng thái đã chọn tháng có bản lưu (lưu khi chốt). Không hiện ô chọn và bút chì. Code hiện được 2026-09 nhưng việc sửa để hiện từ bản lưu là việc còn lại (H-S8).",
 "当月の報告が 1 拠点以上ある状態。いまの見本データにない。事前に法人Web の棚卸報告（または代理入力 AW_STCK_005）で 1 拠点の当月分を報告しておく。実績精算の編集の「棚卸の申告」チェックで作ると実数が 0 になり見本として不適。": "Trạng thái có báo cáo tháng hiện tại từ 1 chi nhánh trở lên. Dữ liệu mẫu hiện tại không có. Cần báo cáo trước phần tháng hiện tại của 1 chi nhánh bằng báo cáo kiểm kê ở 法人Web (hoặc nhập thay AW_STCK_005). Nếu tạo bằng ô 「棚卸の申告」 ở màn sửa quyết toán thực tế thì số thực là 0, không phù hợp làm mẫu.",
 "棚卸後の拠点の数をずらして 10% 以上の差を作る。いまの見本データにない。": "Làm lệch số của chi nhánh sau kiểm kê để tạo chênh lệch từ 10% trở lên. Dữ liệu mẫu hiện tại không có.",
 "棚卸の記録が 1 つもない拠点（お試し開始の CU00975 など）。見本データに無ければ足す。実際に出るかは撮影のときに確かめる。": "Chi nhánh chưa có bản ghi kiểm kê nào (ví dụ CU00975 bắt đầu dùng thử). Nếu dữ liệu mẫu không có thì thêm vào. Có hiện thật hay không sẽ kiểm tra khi chụp.",
 "拠点の設定「棚卸報告＝なし」にした拠点（運営A の拠点編集）。いまの見本データにない。": "Chi nhánh có cài đặt 「棚卸報告＝なし」 (sửa chi nhánh ở 運営A). Dữ liệu mẫu hiện tại không có.",
 "実績精算の詳細で 1 拠点を確定してから開く（操作で作る）。": "Chốt 1 chi nhánh ở chi tiết quyết toán thực tế rồi mở (tạo bằng thao tác).",
 "押すと S12 のトースト。ファイル名は「棚卸し（拠点在庫）」（画面名に合わせる。コードは「在庫一覧」）。": "Bấm sẽ hiện toast S12. Tên file là 「棚卸し（拠点在庫）」 (theo tên màn hình. Code dùng 「在庫一覧」).",
 "チェック・鉛筆・「まとめて在庫調整」なし。CSV出力はある。": "Không có ô chọn, bút chì, 「まとめて在庫調整」. Có 「CSV出力」.",
 "経理・CS・物流も閲覧とCSV出力だけ（台帳 F 2026-10-07）。コードは経理にも鉛筆が出る（demo_ok）。": "Kế toán, CS, Logistics cũng chỉ xem và xuất CSV (台帳 F 2026-10-07). Code hiện bút chì cả cho Kế toán (demo_ok).",
 "通信を遮断して確認する。見本データでは再現できない。": "Kiểm tra bằng cách ngắt kết nối. Không tái hiện được bằng dữ liệu mẫu.",
 "見本の CU00643 の当月。棚卸前の見出し「いまの計算在庫」。代理入力・確認済の操作の見え方は、コードにまだないため想定。": "Tháng hiện tại của CU00643 trong dữ liệu mẫu. Tiêu đề trước kiểm kê là 「いまの計算在庫」. Cách hiển thị thao tác nhập thay / xác nhận là giả định vì code chưa có.",
 "棚卸後の拠点が必要（001 の棚卸後と同じ）。いまの見本データにない。": "Cần chi nhánh sau kiểm kê (giống sau kiểm kê ở 001). Dữ liệu mẫu hiện tại không có.",
 "10%以上の行が赤い背景になり、概要のバッジに赤いタグ「要確認（10%以上）」が出る。いまの見本データにない。": "Dòng từ 10% trở lên có nền đỏ, badge tóm tắt hiện thẻ đỏ 「要確認（10%以上）」. Dữ liệu mẫu hiện tại không có.",
 "棚卸の記録がない拠点（001 の最初の報告待ちと同じ）。実績精算に管理ロスの行は作らない。": "Chi nhánh chưa có bản ghi kiểm kê (giống chờ báo cáo đầu tiên ở 001). Không tạo dòng hao hụt quản lý ở quyết toán thực tế.",
 "棚卸なしの拠点（001 の棚卸なしと同じ）。「督促」の語は出さない（直す宿題）。": "Chi nhánh không kiểm kê (giống không kiểm kê ở 001). Không hiện từ 「督促」 (việc còn lại cần sửa).",
 "在庫調整（AW_STCK_003）で保存したあとの拠点。取消ボタンはない。": "Chi nhánh sau khi lưu ở điều chỉnh tồn kho (AW_STCK_003). Không có nút hủy.",
 "実績精算を確定した拠点（001 の確定済みと同じ）。": "Chi nhánh đã chốt quyết toán thực tế (giống đã chốt ở 001).",
 "一覧の過去月から行を開いた状態。": "Trạng thái mở dòng từ tháng quá khứ trong danh sách.",
 "代理入力の画面（AW_STCK_005）がまだコードにないため再現できない。sel・setup は想定。": "Không tái hiện được vì màn hình nhập thay (AW_STCK_005) chưa có trong code. sel và setup là giả định.",
 "Q140。操作がコードにまだないため再現できない。sel・setup は想定。": "Q140. Không tái hiện được vì thao tác chưa có trong code. sel và setup là giả định.",
 "確認後、法人・ドライバーは報告し直せない（E326）。操作がコードにまだないため再現できない。": "Sau khi xác nhận, pháp nhân và tài xế không báo cáo lại được (E326). Không tái hiện được vì thao tác chưa có trong code.",
 "「編集」「代理入力」「確認済にする」なし。「実績精算詳細」はある。": "Không có 「編集」「代理入力」「確認済にする」. Có 「実績精算詳細」.",
 "存在しない拠点ID を開いた状態。「拠点（CU99999）が見つかりません。」（E100）。コードの文言「拠点が見つかりません。」を E100 に揃える。": "Trạng thái mở ID chi nhánh không tồn tại. 「拠点（CU99999）が見つかりません。」 (E100). Thống nhất câu chữ 「拠点が見つかりません。」 của code thành E100.",
 "取消ボタンのない形が正（コードは「取消」ボタンがある：demo_ok）。商品を足す入力（4.3）はコードにまだない。": "Dạng không có nút hủy là đúng (code có nút 「取消」: demo_ok). Ô thêm sản phẩm (4.3) chưa có trong code.",
 "片方だけ入れて保存。エラーは項目の下に赤枠と文言（コードはトーストと赤枠だけ：demo_ok）。": "Chỉ nhập một bên rồi lưu. Lỗi hiện viền đỏ và câu chữ dưới mục (code chỉ có toast và viền đỏ: demo_ok).",
 "拠点に関係しない商品を足すと数量 0 の行ができる。コードにない入力のため再現できない。": "Thêm sản phẩm không liên quan đến chi nhánh sẽ tạo dòng số lượng 0. Không tái hiện được vì ô nhập này chưa có trong code.",
 "保存して在庫詳細へ戻る。登録済みの在庫調整に 1 行増える。": "Lưu rồi về chi tiết tồn kho. Điều chỉnh tồn kho đã đăng ký tăng thêm 1 dòng.",
 "実績精算が確定済みの拠点（AW_STCK_001 の確定済みと同じ拠点）の /edit を直接開く。詳細の見た目で案内が出る。": "Mở trực tiếp /edit của chi nhánh có quyết toán thực tế đã chốt (cùng chi nhánh đã chốt ở AW_STCK_001). Thông báo hiện với giao diện của chi tiết.",
 "一覧で 2 拠点を選んで「まとめて在庫調整」を押した状態（フル権限）。拠点ごとのタブで開く。": "Trạng thái chọn 2 chi nhánh ở danh sách rồi bấm 「まとめて在庫調整」 (Toàn quyền). Mở theo tab từng chi nhánh.",
 "何も入れずに、開いているタブで保存。そのタブに数量がなければ E181、数量だけ入れてそのタブの理由がなければ、そのタブの理由の欄の下に E01。": "Lưu ở tab đang mở mà không nhập gì. Tab không có số lượng thì E181, chỉ nhập số lượng mà tab đó không có lý do thì E01 dưới ô lý do của tab đó.",
 "タブ（拠点）単位の確認の小窓 Q11。コードにはまだない（H-S13）ため、小窓の見え方は想定。": "Cửa sổ xác nhận Q11 theo tab (chi nhánh). Code chưa có (H-S13) nên cách hiển thị cửa sổ là giả định.",
 "保存はタブ（拠点）ごと。成功するとそのタブの分が S11、同じ画面に残り、保存したタブに ✓ が付いて入力が固定される。全タブを保存すると一覧へ戻る（「キャンセル」でも一覧へ戻る）。確定済み・請求済みの拠点（AW_STCK_001 の確定済みの拠点）のタブは保存できず E184（請求済みは E54）。コードは複数拠点をまとめて保存して一覧へ戻り、確定済み・請求済みは黙ってスキップする（H-S13）ため、再現できない。": "Lưu theo từng tab (chi nhánh). Thành công thì phần của tab đó hiện S11, vẫn ở lại cùng màn hình, tab đã lưu gắn ✓ và khóa phần nhập. Lưu hết mọi tab thì về danh sách (bấm 「キャンセル」 cũng về danh sách). Tab của chi nhánh đã chốt / đã thanh toán (chi nhánh đã chốt ở AW_STCK_001) không lưu được và hiện E184 (đã thanh toán là E54). Code lưu nhiều chi nhánh cùng lúc rồi về danh sách, âm thầm bỏ qua chi nhánh đã chốt / đã thanh toán (H-S13) nên không tái hiện được.",
 "ids なしで /bulk を直接開く。": "Mở trực tiếp /bulk không có ids.",
 "フル権限以外が /bulk を直接開いた状態。保存ボタンは出ない（コードもフル権限・システム管理だけ）。": "Trạng thái vai trò ngoài Toàn quyền mở trực tiếp /bulk. Không hiện nút lưu (code cũng chỉ cho Toàn quyền).",
 "画面がまだコードにない。法人Web の棚卸報告（CW_STOCK）と同じ列と「商品を追加」（JAN スキャン／商品名検索）。sel・setup は想定。": "Màn hình chưa có trong code. Các cột và nút 「商品を追加」 (quét JAN / tìm theo tên sản phẩm) giống báo cáo kiểm kê của 法人Web (CW_STOCK). sel và setup là giả định.",
 "コードにまだない。": "Chưa có trong code.",
 "コードにまだない。E320・E327・E12 を欄の下／トーストで出す。足した行（前回の数 0）は E327 の対象外。": "Chưa có trong code. Hiện E320, E327, E12 dưới ô / bằng toast. Dòng đã thêm (lần trước = 0) không áp dụng E327.",
 "権限なし（保存ボタンなし・Ad00012）": "Không có quyền (không có nút lưu, Ad00012)",
 "フル権限以外（CS・Ad00002）が /edit を直接開いた状態。保存ボタンは出ない（保存が送られたら E32）。コードの動き（開けるか・保存ボタンの有無）は撮影のときに確かめる。": "Trạng thái vai trò ngoài Toàn quyền (CS, Ad00002) mở trực tiếp /edit. Không hiện nút lưu (nếu vẫn gửi lưu thì E32). Khi chụp sẽ kiểm tra hoạt động của code (có mở được không, có nút lưu không).",
 "代理入力できる役割はフル権限・CS・物流（細かい点は権限の画面であとから調整）。それ以外の経理（Ad00012）が /count を直接開いた状態。保存ボタンは出さない（送られたら E32）。コードにまだない。": "Vai trò nhập thay được là Toàn quyền, CS, Logistics (chi tiết nhỏ chỉnh sau ở màn hình quyền). Trạng thái Kế toán (Ad00012), vai trò ngoài các vai trò đó, mở trực tiếp /count. Không hiện nút lưu (nếu vẫn gửi thì E32). Chưa có trong code.",
 "実績精算が確定済み・請求済みの拠点（AW_STCK_001 の確定済みと同じ拠点）の /count を直接開く。在庫詳細の見た目で E184（請求済みの月は E54）が出る。コードにまだない。": "Mở trực tiếp /count của chi nhánh có quyết toán thực tế đã chốt / đã thanh toán (cùng chi nhánh đã chốt ở AW_STCK_001). Hiện E184 (tháng đã thanh toán thì E54) với giao diện của chi tiết tồn kho. Chưa có trong code.",
 "保存して在庫詳細へ戻り、報告の方法が「運営（代理入力）」になる。コードにまだない。": "Lưu rồi về chi tiết tồn kho, cách báo cáo trở thành 「運営（代理入力）」. Chưa có trong code.",
 "コードにまだない。「拠点（CU99999）が見つかりません。」": "Chưa có trong code. 「拠点（CU99999）が見つかりません。」",
 "入力があるタブ（拠点）ごとの破棄の確認。確認のあと一覧へ戻る。": "Xác nhận hủy bỏ theo từng tab (chi nhánh) có nhập. Sau khi xác nhận thì về danh sách.",
 "": ""
}


def V(code, ja, url, items, note="", setup="", login=None, today=None, full=True, wait=600, ng=False):
    _cnt[0] += 1
    n = ("【撮影不可】" + note) if ng else note
    v = {"id": "%03d" % _cnt[0], "code": code, "state": [ja, VI_V.get(ja, "")], "url": url, "setup": (H + setup) if setup else "", "full": full, "wait": wait,
         "note": [n, ("【Không chụp được】" if ng else "") + VI_V.get(note, "")] if n else ["", ""], "items": items}
    if login: v["login"] = login
    if today: v["today"] = today
    return v


U = "/ops/billing/stock"
UD = U + "/CU00643"
CONF = lambda i: ("await fetch('/api/ops/area/billing/actAll',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json','x-es-site':'ops'},body:JSON.stringify({args:{id:'%s'}})}).catch(()=>null);" % i)
GO = "const go=async(u)=>{const r=window.next&&window.next.router;if(r){r.push(u);await sleep(1800);}};"
CLR = "const cb=btn('クリア');if(cb){cb.click();await sleep(500);}"
SAVE = "const sb=document.querySelector('.es-pagehead__actions .es-btn--solid');if(sb){sb.click();await sleep(500);}"

VIEWS = [
    # ---------------------------------------------------------------- 001 一覧
    V("AW_STCK_001", "初期表示", U, [L1[i] for i in range(len(L1)) if L1[i]["no"] not in ("2.2", "4.13", "6", "6.1", "7")],
      note="当月 2026-10・全拠点が「棚卸前」・1ページ10件。初期の並びは拠点ID の昇順（コードは並べ替えなし：demo_ok）。"),
    V("AW_STCK_001", "検索して絞り込み（棚卸前・実績精算未確定）", U, pick(L1, "3.4", "3.5", "3.7", "4"),
      setup=CLR +
      "const ss=[...document.querySelectorAll('.es-search__fields select')];setsel(ss[2],'before');setsel(ss[3],'no');await sleep(200);const sb=document.querySelector('.es-search__main button.es-btn--solid');if(sb){sb.click();await sleep(500);}"),
    V("AW_STCK_001", "0件", U, pick(L1, "3.2", "3.7", "4.13"),
      setup=CLR + "setv(document.querySelector('.es-search__fields input[placeholder=\"法人名・法人ID\"]'),'zzz');const sb=document.querySelector('.es-search__main button.es-btn--solid');if(sb){sb.click();await sleep(500);}"),
    V("AW_STCK_001", "ページ送り・表示件数 20件", U, pick(L1, "5"),
      setup=CLR + "setsel(document.querySelector('.es-pagination select'),'20');await sleep(500);"),
    V("AW_STCK_001", "行を選択（選択バー）", U, pick(L1, "4.1", "6", "6.1"),
      setup=CLR + "const c=document.querySelector('.es-table tbody .es-check input');if(c){c.click();await sleep(400);}"),
    V("AW_STCK_001", "過去月（2026-09・確定済み・参照のみ）", U + "?m=2026-09", pick(L1, "2.1", "2.2", "3.1", "4"),
      note="写し（確定時の保存）のある月を選んだ状態。チェック・鉛筆は出ない。コードは 2026-09 を出せるが、写しから出す直しは宿題（H-S8）。"),
    V("AW_STCK_001", "棚卸後の拠点（バッジ・報告日・管理ロス・差分率・廃棄率）", U, pick(L1, "4.5", "4.7", "4.8", "4.9", "4.10"),
      note="当月の報告が 1 拠点以上ある状態。いまの見本データにない。事前に法人Web の棚卸報告（または代理入力 AW_STCK_005）で 1 拠点の当月分を報告しておく。実績精算の編集の「棚卸の申告」チェックで作ると実数が 0 になり見本として不適。", ng=True),
    V("AW_STCK_001", "差分率・廃棄率が10%以上（赤字）", U, pick(L1, "4.9", "4.10"),
      note="棚卸後の拠点の数をずらして 10% 以上の差を作る。いまの見本データにない。", ng=True),
    V("AW_STCK_001", "最初の棚卸報告待ち（棚卸前＋「最初の報告待ち」・管理ロス「—」）", U, pick(L1, "4.5", "4.8"),
      note="棚卸の記録が 1 つもない拠点（お試し開始の CU00975 など）。見本データに無ければ足す。実際に出るかは撮影のときに確かめる。", ng=True),
    V("AW_STCK_001", "棚卸なし（バッジ・管理ロス「—」・差分率「棚卸なし」）", U, pick(L1, "3.4", "4.5", "4.8", "4.9"),
      note="拠点の設定「棚卸報告＝なし」にした拠点（運営A の拠点編集）。いまの見本データにない。", ng=True),
    V("AW_STCK_001", "実績精算が確定済みの行（バッジ「確定」・チェック／鉛筆なし）", U, pick(L1, "4.1", "4.11", "4.12"),
      setup=CONF("CU00871") + GO + "await go('/ops/billing/stock/CU00871');await go('/ops/billing/stock');",
      note="実績精算の詳細で 1 拠点を確定してから開く（操作で作る）。"),
    V("AW_STCK_001", "CSV出力", U, pick(L1, "1.1"),
      setup="const b=btn('CSV出力');if(b){b.click();await sleep(700);}",
      note="押すと S12 のトースト。ファイル名は「棚卸し（拠点在庫）」（画面名に合わせる。コードは「在庫一覧」）。"),
    V("AW_STCK_001", "参照のみ（閲覧のみ・Ad00013）", U, pick(L1, "1.1", "4.1"), login="Ad00013",
      note="チェック・鉛筆・「まとめて在庫調整」なし。CSV出力はある。"),
    V("AW_STCK_001", "フル権限以外（経理・Ad00012）", U, pick(L1, "4.1"), login="Ad00012",
      note="経理・CS・物流も閲覧とCSV出力だけ（台帳 F 2026-10-07）。コードは経理にも鉛筆が出る（demo_ok）。"),
    V("AW_STCK_001", "読み込めませんでした（赤い一行）", U, pick(L1, "7"),
      note="通信を遮断して確認する。見本データでは再現できない。", ng=True),

    # ---------------------------------------------------------------- 002 在庫詳細
    V("AW_STCK_002", "当月・棚卸前（いまの計算在庫・登録済みの調整なし）", UD, [i for i in L2 if i["no"] not in ("4.6", "5.1", "7")],
      note="見本の CU00643 の当月。棚卸前の見出し「いまの計算在庫」。代理入力・確認済の操作の見え方は、コードにまだないため想定。"),
    V("AW_STCK_002", "当月・棚卸後（報告カード・差・管理ロス・差分率）", UD, pick(L2, "3", "4", "4.1", "4.2", "4.3", "4.4", "4.5", "5"),
      note="棚卸後の拠点が必要（001 の棚卸後と同じ）。いまの見本データにない。", ng=True),
    V("AW_STCK_002", "棚卸後・10%以上の行が赤＋赤いタグ", UD, pick(L2, "2", "5", "5.1"),
      note="10%以上の行が赤い背景になり、概要のバッジに赤いタグ「要確認（10%以上）」が出る。いまの見本データにない。", ng=True),
    V("AW_STCK_002", "最初の棚卸報告待ち（警告のお知らせ）", UD, pick(L2, "3"),
      note="棚卸の記録がない拠点（001 の最初の報告待ちと同じ）。実績精算に管理ロスの行は作らない。", ng=True),
    V("AW_STCK_002", "棚卸なし（お知らせ）", UD, pick(L2, "3"),
      note="棚卸なしの拠点（001 の棚卸なしと同じ）。「督促」の語は出さない（直す宿題）。", ng=True),
    V("AW_STCK_002", "登録済みの在庫調整あり（表に行）", UD, pick(L2, "6"),
      note="在庫調整（AW_STCK_003）で保存したあとの拠点。取消ボタンはない。"),
    V("AW_STCK_002", "実績精算が確定済み（変更できない案内・鉛筆なし）", U + "/CU00871", pick(L2, "3"),
      setup=CONF("CU00871") + GO + "await go('/ops/billing/stock');await go('/ops/billing/stock/CU00871');",
      note="実績精算を確定した拠点（001 の確定済みと同じ）。"),
    V("AW_STCK_002", "過去月（?m=2026-09・確定時の記録・参照のみ）", UD + "?m=2026-09", pick(L2, "3", "5", "6"),
      note="一覧の過去月から行を開いた状態。"),
    V("AW_STCK_002", "運営の代理入力で報告済み（方法「運営（代理入力）」・報告者＝運営の氏名）", UD, pick(L2, "4.1", "4.3", "4.4", "4.5"),
      note="代理入力の画面（AW_STCK_005）がまだコードにないため再現できない。sel・setup は想定。", ng=True),
    V("AW_STCK_002", "「確認済にする」の確認の小窓", UD, pick(L2, "1.4"),
      setup="const b=btn('確認済にする');if(b){b.click();await sleep(500);}",
      note="Q140。操作がコードにまだないため再現できない。sel・setup は想定。", ng=True),
    V("AW_STCK_002", "確認済（ボタンが「確認済」の表示に変わる・S141）", UD, pick(L2, "1.4", "4.6"),
      note="確認後、法人・ドライバーは報告し直せない（E326）。操作がコードにまだないため再現できない。", ng=True),
    V("AW_STCK_002", "参照のみ（閲覧のみ・Ad00013）", UD, pick(L2, "1", "1.1"), login="Ad00013",
      note="「編集」「代理入力」「確認済にする」なし。「実績精算詳細」はある。"),
    V("AW_STCK_002", "見つかりません（E100）", U + "/CU99999", pick(L2, "3"),
      note="存在しない拠点ID を開いた状態。「拠点（CU99999）が見つかりません。」（E100）。コードの文言「拠点が見つかりません。」を E100 に揃える。"),
    V("AW_STCK_002", "読み込めませんでした", UD, pick(L2, "7"),
      note="通信を遮断して確認する。見本データでは再現できない。", ng=True),

    # ---------------------------------------------------------------- 003 在庫調整
    V("AW_STCK_003", "初期（行ごとの数量・理由の入力欄）", UD + "/edit", [i for i in L3 if i["no"] not in ("4.3", "6")],
      note="取消ボタンのない形が正（コードは「取消」ボタンがある：demo_ok）。商品を足す入力（4.3）はコードにまだない。"),
    V("AW_STCK_003", "入力エラー（数量だけ・理由だけ）", UD + "/edit", pick(L3, "1.2", "4.1", "4.2"),
      setup="const q=[...document.querySelectorAll('.es-table input[placeholder=\"±点\"]')];setv(q[0],'3');" + SAVE,
      note="片方だけ入れて保存。エラーは項目の下に赤枠と文言（コードはトーストと赤枠だけ：demo_ok）。"),
    V("AW_STCK_003", "商品を足した行（全商品から選べる）", UD + "/edit", pick(L3, "4", "4.3"),
      note="拠点に関係しない商品を足すと数量 0 の行ができる。コードにない入力のため再現できない。", ng=True),
    V("AW_STCK_003", "保存成功（S01）", UD + "/edit", pick(L3, "5"),
      setup="const q=[...document.querySelectorAll('.es-table input[placeholder=\"±点\"]')];const r=[...document.querySelectorAll('.es-table input[placeholder^=理由]')];setv(q[0],'3');setv(r[0],'拠点間移動');" + SAVE + "await sleep(1500);",
      note="保存して在庫詳細へ戻る。登録済みの在庫調整に 1 行増える。"),
    V("AW_STCK_003", "編集内容を破棄しますか（Q02）", UD + "/edit", pick(L3, "1.1"),
      setup="const q=document.querySelector('.es-table input[placeholder=\"±点\"]');setv(q,'1');const b=btn('キャンセル');if(b){b.click();await sleep(500);}"),
    V("AW_STCK_003", "編集できない（確定済み・請求済）", U + "/CU00871/edit", pick(L3, "6"),
      setup=CONF("CU00871") + GO + "await go('/ops/billing/stock');await go('/ops/billing/stock/CU00871/edit');",
      note="実績精算が確定済みの拠点（AW_STCK_001 の確定済みと同じ拠点）の /edit を直接開く。詳細の見た目で案内が出る。"),

    # ---------------------------------------------------------------- 004 在庫調整（まとめて）
    V("AW_STCK_004", "初期（拠点 n 件 × 全商品のマス・理由）", U + "/bulk?ids=CU00643,CU00871", [i for i in L4 if i["no"] != "6"],
      note="一覧で 2 拠点を選んで「まとめて在庫調整」を押した状態（フル権限）。拠点ごとのタブで開く。", ng=True),
    V("AW_STCK_004", "入力エラー（数量なし・理由なし）", U + "/bulk?ids=CU00643,CU00871", pick(L4, "1.2", "4", "5.1"),
      setup=SAVE, note="何も入れずに、開いているタブで保存。そのタブに数量がなければ E181、数量だけ入れてそのタブの理由がなければ、そのタブの理由の欄の下に E01。", ng=True),
    V("AW_STCK_004", "保存の確認（Q11）", U + "/bulk?ids=CU00643,CU00871", pick(L4, "1.2"),
      setup="const q=[...document.querySelectorAll('.es-table input[placeholder=\"±点\"]')];setv(q[0],'-2');setv(q[1],'2');setv(document.querySelector('.es-card input[placeholder^=例）]'),'拠点間移動');" + SAVE,
      note="タブ（拠点）単位の確認の小窓 Q11。コードにはまだない（H-S13）ため、小窓の見え方は想定。", ng=True),
    V("AW_STCK_004", "保存成功（S11・保存したタブに ✓ で固定）／全タブ保存後の一覧／保存できない拠点のタブ（E184・E54）", U + "/bulk?ids=CU00643,CU00871", pick(L4, "1.2"),
      note="保存はタブ（拠点）ごと。成功するとそのタブの分が S11、同じ画面に残り、保存したタブに ✓ が付いて入力が固定される。全タブを保存すると一覧へ戻る（「キャンセル」でも一覧へ戻る）。確定済み・請求済みの拠点（AW_STCK_001 の確定済みの拠点）のタブは保存できず E184（請求済みは E54）。コードは複数拠点をまとめて保存して一覧へ戻り、確定済み・請求済みは黙ってスキップする（H-S13）ため、再現できない。", ng=True),
    V("AW_STCK_004", "拠点が選ばれていません", U + "/bulk", pick(L4, "6"), note="ids なしで /bulk を直接開く。"),
    V("AW_STCK_004", "編集内容を破棄しますか（Q02）", U + "/bulk?ids=CU00643,CU00871", pick(L4, "1.1"),
      note="入力があるタブ（拠点）ごとの破棄の確認。確認のあと一覧へ戻る。", setup="setv(document.querySelector('.es-card input[placeholder^=例）]'),'x');const b=btn('キャンセル');if(b){b.click();await sleep(500);}", ng=True),
    V("AW_STCK_004", "権限なし（保存ボタンなし・Ad00002）", U + "/bulk?ids=CU00643,CU00871", pick(L4, "1.2"), login="Ad00002",
      note="フル権限以外が /bulk を直接開いた状態。保存ボタンは出ない（コードもフル権限・システム管理だけ）。", ng=True),

    # ---------------------------------------------------------------- 005 棚卸の代理入力（新設）
    V("AW_STCK_005", "初期（商品ごとの今ある数・捨てた数・届いた数）", UD + "/count", [i for i in L5],
      note="画面がまだコードにない。法人Web の棚卸報告（CW_STOCK）と同じ列と「商品を追加」（JAN スキャン／商品名検索）。sel・setup は想定。", ng=True),
    V("AW_STCK_005", "報告済みの拠点を開いた（最後の報告が有効・上書き）", UD + "/count", pick(L5, "3", "4"),
      note="コードにまだない。", ng=True),
    V("AW_STCK_005", "入力エラー（今ある数が空・合計が超える・範囲外）", UD + "/count", pick(L5, "1.2", "4.1", "4.2", "4.3"),
      note="コードにまだない。E320・E327・E12 を欄の下／トーストで出す。足した行（前回の数 0）は E327 の対象外。", ng=True),
    V("AW_STCK_005", "保存成功（S140）", UD + "/count", pick(L5, "1.2", "3.1", "3.2"),
      note="保存して在庫詳細へ戻り、報告の方法が「運営（代理入力）」になる。コードにまだない。", ng=True),
    V("AW_STCK_005", "編集内容を破棄しますか（Q02）", UD + "/count", pick(L5, "1.1"), note="コードにまだない。", ng=True),
    V("AW_STCK_005", "見つかりません（E100）", U + "/CU99999/count", pick(L5, "1"), note="コードにまだない。「拠点（CU99999）が見つかりません。」", ng=True),

    # ---------------------------------------------------------------- 役割レビュー（STCK）で足した状態（id は末尾に連番）
    V("AW_STCK_005", "編集できない（確定済み・請求済）", UD + "/count", pick(L5, "6"),
      note="実績精算が確定済み・請求済みの拠点（AW_STCK_001 の確定済みと同じ拠点）の /count を直接開く。在庫詳細の見た目で E184（請求済みの月は E54）が出る。コードにまだない。", ng=True),
    V("AW_STCK_003", "権限なし（保存ボタンなし・Ad00002）", UD + "/edit", pick(L3, "1.2"), login="Ad00002",
      note="フル権限以外（CS・Ad00002）が /edit を直接開いた状態。保存ボタンは出ない（保存が送られたら E32）。コードの動き（開けるか・保存ボタンの有無）は撮影のときに確かめる。"),
    V("AW_STCK_005", "権限なし（保存ボタンなし・Ad00012）", UD + "/count", pick(L5, "1.2"), login="Ad00012",
      note="代理入力できる役割はフル権限・CS・物流（細かい点は権限の画面であとから調整）。それ以外の経理（Ad00012）が /count を直接開いた状態。保存ボタンは出さない（送られたら E32）。コードにまだない。", ng=True),
]


# ---------------------------------------------------------------- 撮影できない状態の項目（デモの画面で場所が見つからない番号）
# 項目は 001〜005 の画面で共有しているので、撮影できない状態の中だけ、見つからない項目の写しに demo_ok（理由）を足す。
_R_OFFLINE = ["通信を遮断した状態は見本データでは作れず、画面に場所がない（撮影不可）。", "Trạng thái ngắt kết nối không tạo được bằng dữ liệu mẫu nên không có vị trí trên màn hình (không chụp được)."]
_R_NOSEED = ["10%以上の行が見本データにないため、画面に場所がない（撮影不可）。", "Dữ liệu mẫu không có dòng từ 10% trở lên nên không có vị trí trên màn hình (không chụp được)."]
_R_BULK = ["本物の Web の「在庫調整（まとめて）」は、拠点の在庫行に無い商品を引いて落ちる（reading 'prev'）ため、画面が出ず場所が見つからない（撮影不可・H-S13）。", "Màn hình 「在庫調整（まとめて）」 của Web thật bị lỗi khi lấy sản phẩm không có trong dòng tồn kho của chi nhánh (reading 'prev') nên không hiện màn hình, không tìm thấy vị trí (không chụp được, H-S13)."]
_R_NOCODE = ["この画面（代理入力・AW_STCK_005）はコードにまだなく、場所が見つからない（撮影不可。台帳 F 2026-10-07 で新設）。", "Màn hình này (nhập thay, AW_STCK_005) chưa có trong code nên không tìm thấy vị trí (không chụp được; thêm mới theo 台帳 F 2026-10-07)."]
_MISS = {
    "015": ({"7"}, _R_OFFLINE), "029": ({"7"}, _R_OFFLINE), "018": ({"5.1"}, _R_NOSEED),
    "036": ({"1.1", "2", "3", "5", "5.2"}, _R_BULK), "041": ({"1.1"}, _R_BULK),
    "043": ({"1", "1.1", "1.2", "2", "3", "3.1", "3.2", "3.3", "4", "4.1", "4.2", "4.3", "5", "6"}, _R_NOCODE),
    "044": ({"3", "4"}, _R_NOCODE), "045": ({"1.2", "4.1", "4.2", "4.3"}, _R_NOCODE), "046": ({"1.2", "3.1", "3.2"}, _R_NOCODE),
    "047": ({"1.1"}, _R_NOCODE), "048": ({"1"}, _R_NOCODE), "049": ({"6"}, _R_NOCODE), "051": ({"1.2"}, _R_NOCODE),
}


def _ok_pair(old):
    if not old:
        return None
    return list(old) if isinstance(old, (list, tuple)) else [old, old]


for _v in VIEWS:
    if _v["id"] not in _MISS:
        continue
    _nos, _why = _MISS[_v["id"]]
    _items = []
    for _it in _v["items"]:
        if _it["no"] in _nos:
            _it = dict(_it)
            _old = _ok_pair(_it.get("demo_ok"))
            _it["demo_ok"] = [_old[0] + "／" + _why[0], _old[1] + " / " + _why[1]] if _old else list(_why)
        _items.append(_it)
    _v["items"] = _items
