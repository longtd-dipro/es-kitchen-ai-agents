# -*- coding: utf-8 -*-
"""
画面設計書のデータ：運営管理者Web ＞ 代理・紹介管理 ＞ 紹介フィーマスタ（一覧・詳細・登録・編集）
元：本物の Web（app/ops/agency/fee-plans・lib/ops/general/logic.ts の validateFee・planAmountTxt ほか・lib/domain/areas/referral.ts・lib/domain/seed/referral.ts）、
台帳 L（企業紹介のフィー・代理店のフィーパターン）・B（代理店フィーの基準額）、docs/01_仕様/70_代理店/代理店・紹介.md、運営Web_権限表。
（運営I1：hong の確認前の提案を含む。提案は DECISIONS で「提案」と書き、確認メモ_AW_運営I1_代理店.md に質問を残してある）
"""

TITLE = ["紹介フィーマスタ（AW_FEPL）", "Master phí giới thiệu (AW_FEPL)"]
SHEET = ["紹介フィーマスタ", "Master phí giới thiệu"]
BASENAME = "画面設計書_AW_FEPL_紹介フィーマスタ"
IMG_PREFIX = "AW_FEPL"
OUT_DIR = "AW_FEPL_紹介フィーマスタ"
CODE_NOTE = ["画面コードは規約 <Module(2)>_<Feature(4)>_<Seq(3)>（docs/01_仕様/画面コード規約_20261005.md）。AW＝運営管理者Web、FEPL＝紹介フィー（Fee Plan）。Feature は Figma の画面コードに合わせた（hong 指示 2026-10-08）",
             "Mã màn hình theo quy ước <Module(2)>_<Feature(4)>_<Seq(3)>. AW = Admin Web, FEPL = Fee Plan. Feature theo mã màn hình trong Figma (chỉ thị của hong 2026-10-08)"]
SITE = "ops"
SYSTEM = {"ja": "運営管理者Web", "vi": "Web quản trị vận hành"}
AUTHOR = "Claude（cloud）／確認：hong"
CREATED = "2026-10-08"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "ops", "loginId": "Ad00010"}
CODE_PATHS = ["app/ops/agency", "lib/ops/general", "lib/domain/areas/referral.ts", "lib/domain/seed/referral.ts"]

DECISIONS = [
    {"date": "2026-10-05", "target": "AW_FEPL_001・004〜007", "q": ["フィーのパターンとその金額・率", "Các mẫu phí và số tiền / tỷ lệ"],
     "a": ["A＝企業紹介（1回・¥33,000）／B＝代理店紹介（1回・月次提供数ごとの金額。金額は【仮】：50まで ¥22,000／100まで ¥33,000／それより上 ¥55,000）／C＝パートナー紹介（毎月・基準額の10%・36ヶ月）／D＝特別代理店（毎月・基準額の7%・期限なし）。この4件が見本のデータ", "A = giới thiệu doanh nghiệp (1 lần・¥33,000) / B = giới thiệu đại lý (1 lần・theo số suất, số tiền là tạm) / C = đối tác (hàng tháng・10%・36 tháng) / D = đại lý đặc biệt (hàng tháng・7%・không kỳ hạn). 4 bản ghi này là dữ liệu mẫu"],
     "src": "台帳 L「企業紹介のフィー」「代理店のフィーパターン」（hong 2026-09-30・10-05）、REQ-AG-006"},
    {"date": "2026-10-01", "target": "AW_FEPL_002・003 No.3.2", "q": ["フィーの基準額", "Số tiền cơ sở tính phí"],
     "a": ["基準額＝税抜・値引き後の固定額（前払い）だけ。実績精算（後払い）は入れない。お試し期間の請求は対象外。金額は自動で計算するが、支払履歴で手で直せる", "Cơ sở = số tiền cố định sau giảm giá chưa thuế (trả trước). Không tính phần quyết toán thực tế. Kỳ dùng thử không tính. Tự tính, có thể sửa tay ở lịch sử chi trả"],
     "src": "台帳 B「代理店フィーの基準額」、REQ-AG-002"},
    {"date": "2026-10-05", "target": "AW_FEPL_002・003 No.4.1", "q": ["フィー条件を変えたとき、すでに適用した紹介履歴はどうなるか", "Khi đổi điều kiện phí, lịch sử giới thiệu đã áp dụng thế nào"],
     "a": ["適用済みの紹介履歴は適用した時点の条件のまま（紹介のときのプランをそのまま使う。途中で変わっても計算し直し・差額の精算はしない）。変更後はこれから適用する紹介から使われる。使用中のとき保存の前に W180 で確認する", "Lịch sử đã áp dụng giữ điều kiện lúc áp dụng; điều kiện mới dùng cho giới thiệu từ nay. Đang dùng thì xác nhận bằng W180 trước khi lưu"],
     "src": "代理店・紹介.md 4、REQ-AG-023"},
    {"date": "2026-10-08", "target": "AW_FEPL_001 No.3.9", "q": ["使用中のフィープランの削除", "Xóa gói phí đang dùng"],
     "a": ["代理店または紹介履歴で使われているフィープランは削除できない（E275）。使わなくするときはステータスを「無効」にする。削除は論理削除（P-DEL）", "Gói đang được đại lý hoặc lịch sử giới thiệu dùng thì không xóa được (E275); muốn ngừng dùng thì đặt 「無効」. Xóa là xóa logic"],
     "src": "Claude 提案・hong 確認待ち（コードの動きに合わせた。メッセージ E275 を新設）"},
    {"date": "2026-10-08", "target": "AW_FEPL_001 No.1.2・3.9", "q": ["フィープランを運営が増やす・消す必要があるか", "Vận hành có cần thêm / xóa gói phí không"], "a": ["追加できる（標準は A〜D の4つ）。削除は使用中は不可（E275）のまま。台帳 L の「4つだけ」を置き換えた", "Được thêm (chuẩn là 4 gói A〜D). Xóa vẫn không được khi đang dùng (E275). Thay thế mục 「chỉ 4 mẫu」 của sổ cái L"], "src": "hong 回答 2026-10-08・台帳 Q・受付簿 #408"},
    {"date": "2026-10-03", "target": "権限", "q": ["だれが見られる・操作できるか", "Ai được xem và thao tác"],
     "a": ["フル権限・システム管理・営業＝CRUD、ほか＝R。「代理店・パートナー管理」の1つの権限で4つの画面をまとめて決める", "Toàn quyền・Quản trị hệ thống・Kinh doanh = CRUD, còn lại = R. Một quyền cho cả 4 màn"],
     "src": "運営Web_権限表_20261003（パートナー・配送管理系）"},
    {"date": "2026-10-08", "target": "画面コード", "q": ["画面コード", "Mã màn hình"], "a": ["AW_FEPL_001〜004", "AW_FEPL_001〜004"], "src": "画面コード規約（Feature は Figma の画面コードに合わせた（hong 指示 2026-10-08））"},
    {"date": "2026-10-08", "target": "AW_FEPL_001 No.1.1", "q": ["CSV出力の列", "Cột xuất CSV"], "a": ["一覧の列＋詳細のデータ（Figma の一覧には CSV出力がないが、hong が4画面とも出すと回答）", "Cột danh sách + dữ liệu chi tiết"], "src": "hong 回答 2026-10-08・台帳 Q・受付簿 #401"},
    {"date": "2026-10-08", "target": "AW_FEPL_003 No.2.3", "q": ["代理店の紹介フィープランの選択肢", "Lựa chọn gói phí của đại lý"], "a": ["紹介元区分が「代理店紹介」のプランだけ", "Chỉ gói có loại nguồn 「代理店紹介」"], "src": "hong 回答 2026-10-08・台帳 Q・受付簿 #397"},
    {"date": "2026-10-08", "target": "AW_FEPL_001〜004", "q": ["画面コード", "Mã màn hình"], "a": ["Figma のとおり FEPL（001 一覧／002 登録／003 編集／004 詳細）", "Theo Figma: FEPL"], "src": "hong 回答 2026-10-08・台帳 Q・受付簿 #407"},
    {"date": "2026-10-08", "target": "AW_FEPL_001・002〜004", "q": ["Figma との細かい差（No 列・並べ替え・変更履歴）", "Khác biệt nhỏ với Figma"], "a": ["Figma に合わせる。CSV出力（Figma にない）は Q6 で出すと決めたので残す。連動する値引き（Figma にない）も残す", "Theo Figma. Giữ CSV出力 (Q6) và 「連動する値引き」"], "src": "hong 指示 2026-10-08（確認メモ m1〜m7 を提案どおり反映）"},
]
CHANGES = []
HIDE_ALWAYS = []
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [
    {"code": "AW_FEPL_001", "ja": "紹介フィーマスタ一覧", "vi": "Danh sách master phí giới thiệu"},
    {"code": "AW_FEPL_002", "ja": "紹介フィーマスタ登録", "vi": "Đăng ký master phí giới thiệu"},
    {"code": "AW_FEPL_003", "ja": "紹介フィーマスタ編集", "vi": "Sửa master phí giới thiệu"},
    {"code": "AW_FEPL_004", "ja": "紹介フィーマスタ詳細", "vi": "Chi tiết master phí giới thiệu"},
]

H = (
    "const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));"
    "const clickText=(sel,t,i)=>{const b=[...document.querySelectorAll(sel)].filter(x=>(x.textContent||'').includes(t))[i||0];b&&b.click();};"
    "const setv=async(sel,v)=>{const n=document.querySelector(sel);if(n){Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(n,v);n.dispatchEvent(new Event('input',{bubbles:true}));await sleep(200);}};"
)


def it(no, ja, sel, kind, trig, detail=None, vi="", dvi="", **kw):
    d = {"no": no, "ja": ja, "vi": vi, "sel": sel, "kind": kind, "trig": trig}
    if detail:
        d["detail"] = [detail, dvi]
    for k in ("init", "cond", "valid", "ex", "demo_ok", "open", "chk"):
        if k in kw:
            kw[k] = [kw[k], ""] if isinstance(kw[k], str) else kw[k]
    d.update(kw)
    return d


L_ITEMS = [
    it("1", "ヘッダー", ".ph", "area", "view",
       "パンくず：代理・紹介管理 ＞ 紹介フィーマスタ。見られるのは運営の全役割（操作できるのはフル権限・システム管理・営業。ほかは閲覧のみ：権限表「代理店・パートナー管理」）。",
       vi="Header",
       dvi="Breadcrumb: Quản lý đại lý・giới thiệu ＞ Master phí giới thiệu. Mọi vai trò của bộ phận vận hành đều xem được (chỉ Toàn quyền・Quản trị hệ thống・Kinh doanh được thao tác, các vai trò khác chỉ xem: bảng quyền 「代理店・パートナー管理」)."),
    it("1.1", "CSV出力", ".ph", "button", "click", "ヘッダーの右。一覧の列＋詳細のデータ（フィー条件）を全件で出す。閲覧できる役割には全員に出す。列の定義は CSV入出力_定義 に足す（台帳 Q・受付簿 #401）。", pattern="P-CSV-OUT",
       vi="Xuất CSV",
       dvi="Nằm bên phải header. Xuất toàn bộ bản ghi gồm các cột của danh sách và dữ liệu chi tiết (điều kiện phí). Định nghĩa cột sẽ bổ sung vào CSV入出力_定義 (#401). Hiển thị cho mọi vai trò có quyền xem."),
    it("1.2", "新規登録", ".ph .btn.pri", "button", "click", "紹介フィーマスタの登録（AW_FEPL_002）へ。登録の権限がない役割には出さない。", pattern="P-FORM",
       vi="Đăng ký mới",
       dvi="Chuyển sang màn đăng ký master phí giới thiệu (AW_FEPL_003). Không hiển thị với vai trò không có quyền đăng ký."),
    it("2", "紹介フィーの一覧", ".tbl", "table", "view",
       "検索条件は置かない（フィーのパターンは4件が基本）。並びはフィープランID の昇順。1ページ 10件。0件は I01。削除済みは出さない。", pattern="P-LIST", err=["I01"],
       vi="Danh sách phí giới thiệu",
       dvi="Không đặt điều kiện tìm kiếm (mẫu phí cơ bản chỉ có 4 bản ghi). Sắp xếp tăng dần theo ID gói phí. 10 dòng mỗi trang. Không có dữ liệu thì hiện I01. Không hiển thị bản ghi đã xóa.",
       demo_ok=["P-LIST は検索条件を置く決まりだが、4件の一覧なので置かない（コードのとおり）", "P-LIST yêu cầu có khu tìm kiếm nhưng danh sách 4 dòng nên không đặt (theo code)"]),
    it("2.1", "フィープランID", ".tbl th::フィープランID", "link", "click", "RFP＋6桁（システムが採番）。下線つきのリンク。押すと詳細（AW_FEPL_004）へ。",
       vi="ID gói phí",
       dvi="RFP + 6 chữ số (hệ thống tự đánh số). Là liên kết có gạch chân; bấm vào sẽ mở chi tiết (AW_FEPL_004)."),
    it("2.2", "フィープラン名", ".tbl th::フィープラン名", "label", "view", "例：C：パートナー紹介。",
       vi="Tên gói phí", dvi="Tên của gói phí. Ví dụ: C：パートナー紹介 (gói giới thiệu đối tác)."),
    it("2.3", "紹介元区分", ".tbl th::紹介元区分", "label", "view", "法人／代理店。法人＝法人からの紹介（企業紹介）、代理店＝代理店からの紹介。",
       vi="Phân loại nguồn giới thiệu",
       dvi="Công ty / Đại lý. Công ty = giới thiệu từ công ty (giới thiệu doanh nghiệp), Đại lý = giới thiệu từ đại lý."),
    it("2.4", "支払区分", ".tbl th::支払区分", "label", "view", "単発／継続（「継続（ヶ月）」「継続（永続）」は「継続」と表示）。",
       vi="Phân loại chi trả",
       dvi="Một lần / Liên tục (cả 「継続（ヶ月）」 và 「継続（永続）」 đều hiển thị là 「継続」)."),
    it("2.5", "算定方式", ".tbl th::算定方式", "label", "view", "固定額／月次提供数別の金額／請求額割合。",
       vi="Phương thức tính toán",
       dvi="Số tiền cố định / Số tiền theo số suất cung cấp hàng tháng / Tỷ lệ theo số tiền hóa đơn."),
    it("2.6", "フィー金額・率（税込）", ".tbl th::フィー金額", "label", "view",
       "固定額は円（例：33,000円）、請求額割合は%（例：10%）、月次提供数別の金額は「プラン別設定」。税込。金額・率・文字が混ざる列なので左寄せ。",
       vi="Số tiền・tỷ lệ phí (đã gồm thuế)",
       dvi="Số tiền cố định hiển thị bằng yên (ví dụ: 33,000円), tỷ lệ theo số tiền hóa đơn hiển thị bằng % (ví dụ: 10%), số tiền theo số suất hàng tháng hiển thị 「プラン別設定」. Đã gồm thuế. Cột trộn số tiền, tỷ lệ và chữ nên căn trái."),
    it("2.7", "支払期間", ".tbl th::支払期間", "label", "view", "単発＝1回、継続（ヶ月）＝「36ヶ月」、継続（永続）＝永続。",
       vi="Thời hạn chi trả",
       dvi="Một lần = 1回, Liên tục (tháng) = ví dụ 「36ヶ月」 (36 tháng), Liên tục (vĩnh viễn) = 永続."),
    it("2.8", "状態", ".tbl th::状態", "label", "view", "バッジ：有効／無効。", pattern="P-STATUS-COLORS",
       vi="Trạng thái", dvi="Huy hiệu (badge): Hiệu lực / Vô hiệu."),
    it("2.9", "最終更新日", ".tbl th::最終更新日", "label", "view", "yyyy-mm-dd。保存した日。",
       vi="Ngày cập nhật cuối", dvi="Định dạng yyyy-mm-dd. Là ngày lưu gần nhất."),
    it("2.10", "操作（編集・削除）", ".tbl .act", "button", "click",
       "鉛筆＝編集（AW_FEPL_003）、ごみ箱＝削除（確認 Q01 → 論理削除して S02）。代理店または紹介履歴で使われているときは確認の前に E275 を出して削除しない。編集・削除は権限のある役割にだけ出す。",
       pattern="P-DEL", err=["Q01", "S02", "E30", "E275"],
       vi="Thao tác (sửa・xóa)",
       dvi="Biểu tượng bút chì = sửa (AW_FEPL_003), thùng rác = xóa (xác nhận Q01 → xóa logic rồi hiện S02). Nếu đang được đại lý hoặc lịch sử giới thiệu sử dụng thì hiện E275 trước khi xác nhận và không xóa. Chỉ hiển thị sửa・xóa cho vai trò có quyền.",
       demo_ok=["コードは削除できないとき独自の文言のトーストを出す。E275 にそろえる", "Code hiện toast riêng khi không xóa được; đồng nhất E275"]),
    it("3", "ページ送り", ".pager", "area", "view", "P-LIST のとおり（10／20／50件）。", pattern="P-LIST",
       vi="Phân trang", dvi="Theo P-LIST (10 / 20 / 50 dòng mỗi trang)."),
    it("N1", "No（行番号）", "-", "label", "view",
       "一覧の左端に「No」の列（1から。ページをまたいで続ける）。",
       vi="Số thứ tự (No)", dvi="Cột 「No」 ở ngoài cùng bên trái danh sách (từ 1, đếm tiếp qua các trang)."),
    it("N2", "並べ替え・検索の折りたたみ", "-", "button", "view",
       "検索条件の右に「並べ替え」ボタン（P-LIST の並べ替え）。検索条件の左の矢印で検索の欄を折りたためる。",
       vi="Sắp xếp・thu gọn tìm kiếm", dvi="Nút 「並べ替え」 bên phải điều kiện tìm kiếm (sắp xếp theo P-LIST). Mũi tên bên trái điều kiện tìm kiếm cho phép thu gọn khu vực tìm kiếm."),
]

D_ITEMS = [
    it("1", "ヘッダー", ".ph", "area", "view",
       "パンくず：代理・紹介管理 ＞ 紹介フィーマスタ ＞ 紹介フィーマスタ詳細。タイトル「紹介フィーマスタ詳細 RFP000003」。右に「削除」「編集」（権限のある役割だけ）。",
       vi="Header",
       dvi="Breadcrumb: Quản lý đại lý・giới thiệu ＞ Master phí giới thiệu ＞ Chi tiết master phí giới thiệu. Tiêu đề 「紹介フィーマスタ詳細 RFP000003」. Bên phải có nút 「削除」 (xóa) và 「編集」 (sửa), chỉ hiển thị cho vai trò có quyền."),
    it("1.1", "削除", ".ph .btn.dan", "button", "click",
       "削除の確認（Q01）→ 論理削除して一覧へ（P-DEL）。使用中は E275 で削除しない。", pattern="P-DEL", err=["Q01", "S02", "E30", "E275"],
       vi="Xóa",
       dvi="Xác nhận xóa (Q01) → xóa logic rồi quay về danh sách (P-DEL). Nếu đang được sử dụng thì hiện E275 và không xóa."),
    it("1.2", "編集", ".ph .btn.pri", "button", "click", "登録・編集（AW_FEPL_003）へ。編集の権限がない役割には出さない。",
       vi="Sửa", dvi="Chuyển sang màn đăng ký・sửa (AW_FEPL_003). Không hiển thị với vai trò không có quyền sửa."),
    it("2", "紹介フィー情報（表示）", ".sec", "area", "view",
       "フィープランID・フィープラン名・紹介元区分・ステータス・備考・連動する値引き。表示だけ。",
       vi="Thông tin phí giới thiệu (hiển thị)",
       dvi="ID gói phí, tên gói phí, phân loại nguồn giới thiệu, Trạng thái, ghi chú và các khoản giảm giá liên kết. Chỉ để hiển thị."),
    it("2.1", "連動する値引き", ".chipline", "area", "view",
       "値引きマスタ（AW_DISC）で「紹介フィープラン（請求名称）」にこのプランを選んだ値引きのチップ。押すと値引きマスタを開く。なければ「連動する値引きはありません」。見るだけ。",
       vi="Giảm giá liên kết",
       dvi="Chip của các khoản giảm giá đã chọn gói này ở mục 「紹介フィープラン（請求名称）」 trong master giảm giá (AW_DISC). Bấm vào sẽ mở master giảm giá. Nếu không có thì hiện 「連動する値引きはありません」 (không có giảm giá liên kết). Chỉ để xem."),
    it("3", "フィー条件（表示）", ".sec", "area", "view",
       "支払区分・支払い期間・算定方法と、算定方法に応じた金額・率・段ごとの金額。",
       vi="Điều kiện phí (hiển thị)",
       dvi="Phân loại chi trả, thời hạn chi trả, phương thức tính toán, cùng số tiền, tỷ lệ hoặc số tiền theo từng bậc tương ứng với phương thức tính toán."),
    it("3.1", "適用済みの案内", ".notice", "label", "show",
       "このプランを使っている紹介履歴があるとき、「このプランは紹介履歴 n件に適用済みです。条件を変更しても、適用済みの紹介履歴は適用時点の条件のまま変わりません」と出す。",
       vi="Thông báo đã áp dụng",
       dvi="Khi có lịch sử giới thiệu đang dùng gói này, hiện thông báo 「このプランは紹介履歴 n件に適用済みです。条件を変更しても、適用済みの紹介履歴は適用時点の条件のまま変わりません」 (gói này đã áp dụng cho n lịch sử giới thiệu; dù đổi điều kiện, các lịch sử đã áp dụng vẫn giữ điều kiện lúc áp dụng)."),
    it("5", "変更履歴", "-", "tab", "view",
       "詳細に「変更履歴」の欄（変更日時・変更内容・変更者の表。新しい順。見るだけ）を出す。",
       vi="Lịch sử thay đổi", dvi="Hiển thị mục 「変更履歴」 (bảng ngày giờ・nội dung・người thay đổi, mới nhất trước, chỉ xem) ở màn chi tiết."),
]

D_KIND_ITEMS = [
    it("3.2", "支払区分・支払い期間", "#fp-months", "label", "view",
       "単発は支払い期間に「1回」、継続（永続）は「永続」、継続（ヶ月）は月数と「ヶ月」。",
       vi="Phân loại chi trả・thời hạn chi trả",
       dvi="Một lần: thời hạn chi trả hiện 「1回」; liên tục (vĩnh viễn): hiện 「永続」; liên tục (tháng): hiện số tháng kèm 「ヶ月」."),
    it("3.3", "算定方法の設定", ".box", "area", "view",
       "固定額は「固定額設定」（フィー金額（円）税込）、請求額割合は「請求額割合設定」（フィー率（%）。紹介先法人への月次請求額（税込）に対する割合）、月次提供数別の金額は「月次提供数別の金額設定」（〜50食・51〜100食・101食〜の3段の金額）。",
       vi="Thiết lập phương thức tính toán",
       dvi="Số tiền cố định: hiện 「固定額設定」 (số tiền phí, yên, đã gồm thuế). Tỷ lệ theo số tiền hóa đơn: hiện 「請求額割合設定」 (tỷ lệ phí %, là tỷ lệ so với số tiền hóa đơn hàng tháng đã gồm thuế gửi công ty được giới thiệu). Số tiền theo số suất hàng tháng: hiện 「月次提供数別の金額設定」 (số tiền của 3 bậc: đến 50 suất・51〜100 suất・từ 101 suất)."),
]

F_ITEMS = [
    it("1", "ヘッダー", ".ph", "area", "view",
       "タイトル「紹介フィーマスタ登録」「紹介フィーマスタ編集 RFP000003」。右に「キャンセル」「登録」（編集は「保存」）。",
       pattern="P-FORM", err=["Q02", "S01", "E30", "E31"],
       vi="Header",
       dvi="Tiêu đề 「紹介フィーマスタ登録」 (đăng ký) hoặc 「紹介フィーマスタ編集 RFP000003」 (sửa). Bên phải có nút 「キャンセル」 (hủy) và 「登録」 (đăng ký; khi sửa là 「保存」 - lưu).",
       demo_ok=["コードは保存のトーストに名前や件数を入れる。S01 にそろえる", "Code đưa tên và số lượng vào toast; đồng nhất S01"]),
    it("2", "紹介フィー情報", ".sec", "area", "view", "プランの名前・区分・ステータス・備考。",
       vi="Thông tin phí giới thiệu", dvi="Tên gói, phân loại, Trạng thái và ghi chú của gói phí."),
    it("2.1", "フィープランID", "#fp-id", "text", "view", "RFP＋6桁（システムが採番）。画面では変えられない（登録のときは空）。", req="－", init=["空（保存で採番）", "Để trống (đánh số khi lưu)"],
       ex=["RFP000005", "ID gói phí: RFP + 6 chữ số, hệ thống tự đánh số khi lưu"],
       vi="ID gói phí", dvi="RFP + 6 chữ số (hệ thống tự đánh số). Không thể sửa trên màn hình (khi đăng ký mới thì để trống)."),
    it("2.2", "フィープラン名", "#fp-name", "text", "input", "プランの名前。例：C：パートナー紹介。", err=["E01", "E04"], req="○", len="文字列 60", fid="fp-name",
       ex=["C：パートナー紹介", "Tên gói phí, ví dụ: 「C：パートナー紹介」 (gói giới thiệu đối tác)"],
       vi="Tên gói phí", dvi="Tên của gói phí. Ví dụ: C：パートナー紹介 (gói giới thiệu đối tác)."),
    it("2.3", "紹介元区分", "input[name=fp-src]", "radio", "select", "法人紹介（企業紹介）／代理店紹介。新規は「法人紹介」。代理店の「紹介フィープラン」の選択肢は、「代理店紹介」のプランだけにする（受付簿 #397）。",
       req="○", len=["選択（法人紹介／代理店紹介）", "Chọn một (giới thiệu từ công ty / giới thiệu từ đại lý)"], init=["法人紹介", "Giới thiệu từ công ty"],
       ex=["代理店紹介", "Phân loại nguồn giới thiệu: giới thiệu từ đại lý"],
       vi="Phân loại nguồn giới thiệu",
       dvi="Giới thiệu từ công ty (giới thiệu doanh nghiệp) / giới thiệu từ đại lý. Khi đăng ký mới mặc định là 「法人紹介」. Lựa chọn 「紹介フィープラン」 của đại lý chỉ gồm các gói thuộc 「代理店紹介」 (#397)."),
    it("2.4", "ステータス", "input[name=fp-status]", "radio", "select", "有効／無効。「無効」のプランは、代理店・紹介履歴の新しい選択肢に出ない（すでに使っているものはそのまま）。",
       req="○", len=["選択（有効／無効）", "Chọn một (hiệu lực / vô hiệu)"], init=["有効", "Hiệu lực"], ex=["有効", "Trạng thái gói phí: hiệu lực"],
       vi="Trạng thái",
       dvi="Hiệu lực / Vô hiệu. Gói 「無効」 sẽ không xuất hiện trong lựa chọn mới của đại lý và lịch sử giới thiệu (những nơi đang dùng thì giữ nguyên)."),
    it("2.5", "備考", "#fp-note", "text", "input", "運営だけが見るメモ。", err=["E04"], req="－", len="文字列 500", fid="fp-note",
       ex=["特別契約代理店向け。", "Ghi chú nội bộ, ví dụ: 「特別契約代理店向け。」 (dành cho đại lý hợp đồng đặc biệt)"],
       vi="Ghi chú", dvi="Ghi chú chỉ bộ phận vận hành xem được.",
       demo_ok=["コードは1行の入力欄。台帳（メモ・備考は最大500文字・複数行）にそろえて複数行にする", "Code là ô 1 dòng; đổi thành nhiều dòng theo 台帳"]),
    it("2.6", "連動する値引き", "-", "area", "view", "登録のときは出さない。編集・詳細では値引きマスタの該当をチップで見せるだけ（変えられない）。",
       vi="Giảm giá liên kết",
       dvi="Không hiển thị khi đăng ký mới. Ở màn sửa・chi tiết chỉ hiển thị các khoản giảm giá tương ứng trong master giảm giá dưới dạng chip (không thể thay đổi)."),
    it("3", "フィー条件", ".sec", "area", "view", "支払区分・支払い期間・算定方法。",
       vi="Điều kiện phí", dvi="Phân loại chi trả, thời hạn chi trả và phương thức tính toán."),
    it("3.1", "使用中の案内", "-", "label", "show", "使用中（紹介履歴に適用済み）のとき、条件を変えても適用済みの紹介履歴は適用時点の条件のままと案内する。",
       cond=["編集で、このプランを使っている紹介履歴があるとき", "Khi sửa và có lịch sử giới thiệu đang dùng gói này"],
       vi="Thông báo đang sử dụng",
       dvi="Khi gói đang được sử dụng (đã áp dụng cho lịch sử giới thiệu), thông báo rằng dù đổi điều kiện thì lịch sử giới thiệu đã áp dụng vẫn giữ điều kiện lúc áp dụng."),
    it("3.2", "支払区分", "input[name=fp-pay]", "radio", "select",
       "単発／継続（ヶ月）／継続（永続）。「単発」を選ぶと支払い期間は「1回」、「継続（永続）」は「永続」になり、入力できない。「継続（ヶ月）」を選ぶと月数を入れる。",
       req="○", len=["選択（単発／継続（ヶ月）／継続（永続））", "Chọn một (một lần / liên tục theo tháng / liên tục vĩnh viễn)"], init=["単発", "Một lần"],
       ex=["継続（ヶ月）", "Phân loại chi trả: liên tục theo số tháng"],
       vi="Phân loại chi trả",
       dvi="Một lần / Liên tục (tháng) / Liên tục (vĩnh viễn). Chọn 「単発」 thì thời hạn chi trả là 「1回」, chọn 「継続（永続）」 thì là 「永続」 và không nhập được. Chọn 「継続（ヶ月）」 thì nhập số tháng."),
    it("3.3", "支払い期間", "#fp-months", "text", "input", "「継続（ヶ月）」のときだけ入力できる月数（1〜99の整数）。単発は「1回」、永続は「永続」と表示する。",
       err=["E12", "E14"], req="条件付き", len="数値 2桁", fid="fp-months",
       ex=["36", "Số tháng chi trả, số nguyên 1〜99 (ví dụ 36 tháng)"],
       cond=["支払区分が「継続（ヶ月）」のとき必須", "Bắt buộc khi phân loại chi trả là 「継続（ヶ月）」"],
       vi="Thời hạn chi trả",
       dvi="Số tháng (số nguyên 1〜99), chỉ nhập được khi chọn 「継続（ヶ月）」. Một lần hiển thị 「1回」, vĩnh viễn hiển thị 「永続」.",
       demo_ok=["コードは1以上かどうかだけを見る。台帳（回数・月数は99まで）にそろえて 1〜99 にする", "Code chỉ kiểm tra ≥1; đồng nhất 台帳 (≤99)"]),
    it("3.4", "算定方法", "input[name=fp-calc]", "radio", "select",
       "固定額／月次提供数別の金額／請求額割合。選ぶと下の設定の箱が切り替わる。契約条件に応じて選ぶ。",
       req="○", len=["選択（固定額／月次提供数別の金額／請求額割合）", "Chọn một (số tiền cố định / số tiền theo số suất hàng tháng / tỷ lệ theo số tiền hóa đơn)"], init=["固定額", "Số tiền cố định"],
       ex=["請求額割合", "Phương thức tính toán: tỷ lệ theo số tiền hóa đơn"],
       vi="Phương thức tính toán",
       dvi="Số tiền cố định / Số tiền theo số suất hàng tháng / Tỷ lệ theo số tiền hóa đơn. Khi chọn, khung thiết lập bên dưới sẽ chuyển theo. Chọn theo điều kiện hợp đồng."),
    it("3.5", "フィー金額（円）税込", "#fp-amount", "text", "input", "「固定額」のとき。1円以上の整数（税込）。", err=["E01", "E12", "E14"], req="条件付き", len="数値 9桁", fid="fp-amount",
       ex=["33000", "Số tiền phí cố định (yên, đã gồm thuế), ví dụ 33.000 yên"],
       cond=["算定方法が「固定額」のとき必須", "Bắt buộc khi phương thức tính toán là 「固定額」"],
       valid=["1〜999,999,999 の整数", "Số nguyên từ 1 đến 999,999,999"],
       vi="Số tiền phí (yên) đã gồm thuế",
       dvi="Dùng khi chọn 「固定額」. Số nguyên từ 1 yên trở lên (đã gồm thuế).",
       demo_ok=["コードのメッセージは「金額を入力してください」。E01・E12 にそろえる", "Câu của code là 「金額を入力してください」; đồng nhất E01・E12"]),
    it("3.6", "フィー率（%）", "-", "text", "input", "「請求額割合」のとき。紹介先法人への月次請求額（税込）に対する割合。1〜100の数値。", err=["E01", "E12", "E14"], req="条件付き", len="数値 3桁", fid="fp-rate",
       ex=["10", "Tỷ lệ phí (%), ví dụ 10 nghĩa là 10%"],
       cond=["算定方法が「請求額割合」のとき必須", "Bắt buộc khi phương thức tính toán là 「請求額割合」"],
       valid=["1〜100", "Từ 1 đến 100"],
       vi="Tỷ lệ phí (%)",
       dvi="Dùng khi chọn 「請求額割合」. Là tỷ lệ so với số tiền hóa đơn hàng tháng (đã gồm thuế) gửi công ty được giới thiệu. Giá trị từ 1 đến 100.",
       demo_ok=["コードのメッセージは「1〜100の数値を入力してください」。E12 にそろえる", "Câu của code là 「1〜100の数値を入力してください」; đồng nhất E12"]),
    it("3.7", "月次提供数別の金額", "-", "text", "input",
       "「月次提供数別の金額」のとき。月次提供数の3段（〜50食／51〜100食／101食〜）ごとのフィー金額（円・税込）。段の区切り（50・100）は固定で、画面からは変えない。各段 1円以上。",
       err=["E01", "E12", "E14"], req="条件付き", len="数値 9桁",
       ex=["22000", "Số tiền phí của một bậc (yên, đã gồm thuế), ví dụ 22.000 yên cho bậc đến 50 suất"],
       cond=["算定方法が「月次提供数別の金額」のとき3段とも必須", "Bắt buộc nhập đủ cả 3 bậc khi phương thức tính toán là 「月次提供数別の金額」"],
       valid=["1〜999,999,999 の整数", "Số nguyên từ 1 đến 999,999,999"],
       vi="Số tiền theo số suất cung cấp hàng tháng",
       dvi="Dùng khi chọn 「月次提供数別の金額」. Số tiền phí (yên, đã gồm thuế) cho từng bậc trong 3 bậc số suất hàng tháng (đến 50 suất / 51〜100 suất / từ 101 suất). Mốc chia bậc (50・100) là cố định, không thay đổi từ màn hình. Mỗi bậc từ 1 yên trở lên."),
    it("4", "保存の確認（条件を変えたとき）", "-", "modal", "show",
       "使用中のプランで、フィー条件（支払区分・月数・算定方法・金額・率・段の金額）を変えて保存すると W180 を出す。「保存する」で保存、「キャンセル」で編集に戻る。名前・ステータス・備考だけの変更では出さない。",
       err=["W180"], pattern="P-MODAL-SAVE",
       vi="Xác nhận lưu (khi đổi điều kiện)",
       dvi="Với gói đang sử dụng, nếu đổi điều kiện phí (phân loại chi trả・số tháng・phương thức tính toán・số tiền・tỷ lệ・số tiền từng bậc) rồi lưu thì hiện W180. Bấm 「保存する」 để lưu, 「キャンセル」 để quay lại màn sửa. Nếu chỉ đổi tên・Trạng thái・ghi chú thì không hiện."),
    it("5", "変更履歴", "-", "tab", "view",
       "編集に「変更履歴」の欄（変更日時・変更内容・変更者の表。新しい順。見るだけ）を出す。",
       vi="Lịch sử thay đổi", dvi="Hiển thị mục 「変更履歴」 (bảng ngày giờ・nội dung・người thay đổi, mới nhất trước, chỉ xem) ở màn sửa."),
]

V = lambda id, code, ja, url, items, setup="", note=None, login=None, wait=600, vi="", nvi="": dict(
    {"id": id, "code": code, "state": [ja, vi], "url": url, "setup": (H + setup) if setup else "", "full": True, "wait": wait,
     "note": [note or "", nvi if note else ""], "items": items}, **({"login": login} if login else {}))

VIEWS = [
    V("001", "AW_FEPL_001", "初期表示", "/ops/agency/fee-plans", L_ITEMS, vi="Hiển thị ban đầu"),
    V("002", "AW_FEPL_001", "削除できない（使用中）", "/ops/agency/fee-plans", [
        it("2.10", "削除できない", "body", "toast", "show", "使用中のプラン（見本：A：企業紹介）は確認の前に E275 を出して削除しない。", err=["E275"],
           vi="Không xóa được",
           dvi="Gói đang sử dụng (mẫu: A：企業紹介 - giới thiệu doanh nghiệp) sẽ hiện E275 trước khi xác nhận và không bị xóa.")],
      setup="document.querySelector('.tbl tbody tr .act button:last-child')?.click(); await sleep(500);",
      vi="Không xóa được (đang sử dụng)"),
    V("003", "AW_FEPL_001", "参照のみ（閲覧の権限だけ）", "/ops/agency/fee-plans", [
        it("1.2", "新規登録", ".ph", "area", "view", "登録・編集・削除の権限がないので「新規登録」と行の編集・削除は出ない。CSV出力は出る。",
           vi="Đăng ký mới",
           dvi="Vì không có quyền đăng ký・sửa・xóa nên 「新規登録」 và nút sửa・xóa ở từng dòng không hiển thị. Nút xuất CSV vẫn hiển thị.")],
      login="Ad00012", vi="Chỉ xem (chỉ có quyền xem)"),
    V("004", "AW_FEPL_004", "詳細（A：固定額・単発）", "/ops/agency/fee-plans/RFP000001", D_ITEMS + D_KIND_ITEMS, vi="Chi tiết (A: số tiền cố định・một lần)"),
    V("005", "AW_FEPL_004", "詳細（B：月次提供数別の金額）", "/ops/agency/fee-plans/RFP000002", D_KIND_ITEMS, vi="Chi tiết (B: số tiền theo số suất hàng tháng)"),
    V("006", "AW_FEPL_004", "詳細（C：請求額割合・継続（ヶ月））", "/ops/agency/fee-plans/RFP000003", D_KIND_ITEMS, vi="Chi tiết (C: tỷ lệ theo số tiền hóa đơn・liên tục theo tháng)"),
    V("007", "AW_FEPL_004", "詳細（D：請求額割合・継続（永続））", "/ops/agency/fee-plans/RFP000004", D_KIND_ITEMS, vi="Chi tiết (D: tỷ lệ theo số tiền hóa đơn・liên tục vĩnh viễn)"),
    V("008", "AW_FEPL_002", "新規登録", "/ops/agency/fee-plans/new", F_ITEMS, vi="Đăng ký mới"),
    V("009", "AW_FEPL_002", "入力エラー", "/ops/agency/fee-plans/new", [
        it("2.2", "入力エラー", ".sec", "area", "view", "名前と金額を空にして「登録」を押した状態。赤枠と項目の下の文を出す。", err=["E01"], pattern="P-FORMBOX",
           vi="Lỗi nhập liệu",
           dvi="Trạng thái sau khi để trống tên và số tiền rồi bấm 「登録」. Hiện viền đỏ và câu thông báo dưới từng mục.")],
      setup="clickText('.ph button','登録'); await sleep(500);", vi="Lỗi nhập liệu"),
    V("010", "AW_FEPL_003", "編集", "/ops/agency/fee-plans/RFP000003/edit", [
        it("1", "ヘッダー", ".ph", "area", "view", "タイトル「紹介フィーマスタ編集 RFP000003」。使用中の案内が出る。", pattern="P-FORM",
           vi="Header",
           dvi="Tiêu đề 「紹介フィーマスタ編集 RFP000003」. Có hiện thông báo đang sử dụng.")], vi="Sửa"),
    V("011", "AW_FEPL_003", "編集（条件を変えた保存の確認）", "/ops/agency/fee-plans/RFP000003/edit", [
        it("4", "保存の確認", ".modal", "modal", "show", "使用中のプランのフィー率を変えて「保存」を押した状態。W180 を出す。", err=["W180"],
           vi="Xác nhận lưu",
           dvi="Trạng thái sau khi đổi tỷ lệ phí của gói đang sử dụng rồi bấm 「保存」. Hiện W180.")],
      setup="await setv('#fp-rate','12'); clickText('.ph button','保存'); await sleep(500);", vi="Sửa (xác nhận lưu khi đổi điều kiện)"),
    V("012", "AW_FEPL_003", "編集を破棄する確認", "/ops/agency/fee-plans/RFP000003/edit", [
        it("1", "破棄の確認", ".modal", "modal", "show", "入力を変えてから「キャンセル」を押すと確認 Q02。", err=["Q02"], pattern="P-FORM",
           vi="Xác nhận hủy bỏ",
           dvi="Sau khi thay đổi nội dung nhập rồi bấm 「キャンセル」 thì hiện xác nhận Q02.")],
      setup="await setv('#fp-note','変更'); clickText('.ph button','キャンセル'); await sleep(400);", vi="Xác nhận hủy bỏ khi đang sửa"),
]
