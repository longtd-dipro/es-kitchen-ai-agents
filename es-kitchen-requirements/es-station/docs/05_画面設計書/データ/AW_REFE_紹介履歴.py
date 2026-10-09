# -*- coding: utf-8 -*-
"""
画面設計書のデータ：運営管理者Web ＞ 代理・紹介管理 ＞ 紹介履歴（一覧・詳細・編集）
元：本物の Web（app/ops/agency/referrals・app/ops/agency/_components/common.tsx・lib/ops/general/logic.ts の refEnd・refStatus・buildReferrals・validateRef・lib/domain/areas/referral.ts）、
台帳 L・B、docs/01_仕様/70_代理店/代理店・紹介.md（3 36ヶ月の数え方・4 プランが変わったとき）、運営Web_権限表。
（運営I1：hong の確認前の提案を含む。提案は DECISIONS で「提案」と書き、確認メモ_AW_運営I1_代理店.md に質問を残してある）
"""

TITLE = ["紹介履歴（AW_REFE）", "Lịch sử giới thiệu (AW_REFE)"]
SHEET = ["紹介履歴", "Lịch sử giới thiệu"]
BASENAME = "画面設計書_AW_REFE_紹介履歴"
IMG_PREFIX = "AW_REFE"
OUT_DIR = "AW_REFE_紹介履歴"
CODE_NOTE = ["画面コードは規約 <Module(2)>_<Feature(4)>_<Seq(3)>（docs/01_仕様/画面コード規約_20261005.md）。AW＝運営管理者Web、REFE＝紹介履歴（Referral）。Feature は Figma の画面コードに合わせた（hong 指示 2026-10-08）",
             "Mã màn hình theo quy ước <Module(2)>_<Feature(4)>_<Seq(3)>. AW = Admin Web, REFE = Referral. Feature theo mã màn hình trong Figma (chỉ thị của hong 2026-10-08)"]
SITE = "ops"
SYSTEM = {"ja": "運営管理者Web", "vi": "Web quản trị vận hành"}
AUTHOR = "Claude（cloud）／確認：hong"
CREATED = "2026-10-08"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "ops", "loginId": "Ad00010"}
CODE_PATHS = ["app/ops/agency", "lib/ops/general", "lib/domain/areas/referral.ts", "lib/domain/seed/referral.ts"]

DECISIONS = [
    {"date": "2026-07-29", "target": "AW_REFE_001・002", "q": ["紹介履歴のつくり方", "Cách tạo lịch sử giới thiệu"],
     "a": ["親契約の「代理店コード」（または紹介元の法人）から自動で作る。運営がこの画面で新しく作ることはしない（新規登録のボタンなし）。変えられるのは紹介フィープラン・支払い開始年月・備考だけ。紹介元・親契約・紹介先は親契約（法人・契約管理）で直す", "Tự tạo từ 「mã đại lý」 của hợp đồng mẹ (hoặc công ty giới thiệu). Không tạo mới ở màn này. Chỉ sửa được gói phí, tháng bắt đầu chi trả, ghi chú"],
     "src": "代理店・紹介.md 1-4・5-1、REQ-AG-021・031"},
    {"date": "2026-10-05", "target": "AW_REFE_005・003 No.4", "q": ["紹介のときのプランが変わったとき", "Khi gói thay đổi sau lúc giới thiệu"],
     "a": ["紹介に適用したフィー条件は適用した時点のものを紹介履歴に写して持つ。紹介フィーマスタを後から直しても、適用済みの紹介履歴は変わらない。途中でプランが変わっても計算し直し・差額の精算はしない。紹介フィープランを選び直したときだけ、新しいプランの条件を写し直す", "Điều kiện phí được sao vào lịch sử lúc áp dụng. Sửa master sau này không ảnh hưởng. Chỉ khi chọn lại gói mới sao điều kiện mới"],
     "src": "代理店・紹介.md 4、REQ-AG-023・044"},
    {"date": "2026-10-08", "target": "AW_REFE_001 No.5.10〜5.12", "q": ["ステータス・終了予定月・終了月の決め方", "Cách xác định Trạng thái / tháng kết thúc dự kiến / tháng kết thúc"],
     "a": ["親契約が「仮登録」＝契約前。親契約が終了済み＝終了予定月以前に終わったら「途中解約」、終了予定月まで続いていれば「満了」。親契約が続いていれば、今月が終了予定月を過ぎたら「満了」、それまでは「有効」。終了予定月＝単発は支払い開始年月、継続（ヶ月）は開始年月から月数ぶん（開始月を1ヶ月目として数える）、継続（永続）は空。終了月＝満了は終了予定月、途中解約は親契約の終了月", "Hợp đồng mẹ 「仮登録」= 契約前. Kết thúc trước tháng dự kiến = 途中解約, đến hết = 満了. Tháng dự kiến: 単発 = tháng bắt đầu; 継続(ヶ月) = bắt đầu + số tháng - 1; 永続 = trống"],
     "src": "Claude がコード（lib/ops/general/logic.ts）から書き起こした。台帳に決定なし・hong 確認待ち（確認メモ Q3）"},
    {"date": "2026-10-08", "target": "AW_REFE_005 No.3.2", "q": ["継続（36ヶ月）の数え方", "Cách đếm kỳ 36 tháng"],
     "a": ["決定済み（台帳 L）：法人単位で、最初の拠点の契約開始から数え、全拠点がなくなったらリセット。コードは紹介履歴ごと（親契約ごと）に支払い開始年月から数える → コードを直す宿題（確認メモ H1）。設計書は決定のとおり書く", "Đã quyết (台帳 L): đếm theo công ty từ chi nhánh đầu tiên, reset khi hết chi nhánh. Code đếm theo từng hợp đồng mẹ → việc phải sửa code (H1)"],
     "src": "台帳 L「代理店の紐付け」、確認メモ_AW_運営I1_代理店 H1"},
    {"date": "2026-10-03", "target": "権限", "q": ["だれが見られる・操作できるか", "Ai được xem và thao tác"],
     "a": ["フル権限・システム管理・営業＝CRUD、ほか＝R。この画面には新規登録・削除がないので、CRUD の役割にも出るのは「編集」と「CSV出力」だけ", "Toàn quyền・Quản trị hệ thống・Kinh doanh = CRUD, còn lại = R. Màn này không có đăng ký mới / xóa nên chỉ có 「編集」 và 「CSV出力」"],
     "src": "運営Web_権限表_20261003（パートナー・配送管理系）"},
    {"date": "2026-10-08", "target": "画面コード", "q": ["画面コード", "Mã màn hình"], "a": ["AW_REFE_001〜004", "AW_REFE_001〜004"], "src": "画面コード規約（Feature は Figma の画面コードに合わせた（hong 指示 2026-10-08））"},
    {"date": "2026-10-08", "target": "AW_REFE_005 No.2.9・2.10", "q": ["ステータス・終了予定月・終了月の決め方", "Cách xác định trạng thái / tháng kết thúc"], "a": ["コードのとおり（確認済み）", "Theo code (đã xác nhận)"], "src": "hong 回答 2026-10-08・台帳 Q・受付簿 #398"},
    {"date": "2026-10-08", "target": "AW_REFE_005 No.2.3", "q": ["企業紹介の紹介元法人をどこで入れるか", "Nhập công ty giới thiệu (giới thiệu doanh nghiệp) ở đâu"], "a": ["運営が申込の承認のときに入力する", "Bộ phận vận hành nhập khi phê duyệt đơn đăng ký"], "src": "hong 回答 2026-10-08・台帳 Q・受付簿 #399"},
    {"date": "2026-10-08", "target": "AW_REFE_002", "q": ["紹介履歴を運営が手で登録できるか（Figma の AW_REFE_002）", "Có cho vận hành tự đăng ký lịch sử giới thiệu không"], "a": ["自動を基本にし、紹介元が法人のものだけ運営が手で登録できる。代理店からの紹介は自動のまま。削除の可否は未確認（確認メモ Q10）。AW_REFE_002 はコードができてから撮影・追記する", "Mặc định tự động; chỉ nguồn là công ty mới được đăng ký tay. Chưa rõ có xóa được không. AW_REFE_002 sẽ chụp và bổ sung khi code có"], "src": "hong 回答 2026-10-08・台帳 Q・受付簿 #403"},
    {"date": "2026-10-08", "target": "用語", "q": ["言葉のゆれ", "Khác biệt thuật ngữ"], "a": ["台帳・コードの言葉にそろえる：有効・単発・請求額割合・企業紹介・支払済（#381）", "Thống nhất theo sổ cái・code"], "src": "hong 回答 2026-10-08・台帳 Q・受付簿 #404"},
    {"date": "2026-10-08", "target": "AW_REFE_001〜005", "q": ["画面コード", "Mã màn hình"], "a": ["Figma のとおり REFE（001 一覧／002 登録／003 編集（代理店から）／004 編集（法人から）／005 詳細）", "Theo Figma: REFE"], "src": "hong 回答 2026-10-08・台帳 Q・受付簿 #407"},
    {"date": "2026-10-08", "target": "AW_REFE_005 No.1.2", "q": ["紹介の削除ではなく中止（Figma の「削除」ボタン）", "Xóa lịch sử giới thiệu"], "a": ["削除ではなく「紹介の中止」：解約・問題が起きたとき、運営がこの紹介（紹介コード）を中止できる（自動で作ったものも）。契約の中止ではなく、親契約・代理店コードは変えずフィーの支払だけを止める。細部は hong 確認済み", "Dừng chứ không xóa: khi có hủy hợp đồng/sự cố vận hành có thể dừng (cả bản tự tạo). Chi tiết là đề xuất"], "src": "hong 回答 2026-10-08・台帳 Q・受付簿 #412"},
    {"date": "2026-10-08", "target": "AW_REFE_002・005 No.2.3", "q": ["企業紹介の紹介元法人と手での登録の関係", "Quan hệ giữa công ty giới thiệu và đăng ký tay"], "a": ["通常は申込の承認で入力し、紹介履歴が自動で作られる。手での登録は承認の後の後付けだけ", "Thường nhập khi phê duyệt đơn và tự tạo lịch sử; đăng ký tay chỉ để bổ sung sau"], "src": "hong 回答 2026-10-08・台帳 Q・受付簿 #411"},
    {"date": "2026-10-08", "target": "AW_REFE_001・003", "q": ["Figma との細かい差（No 列・検索条件・列の名前・変更履歴）", "Khác biệt nhỏ với Figma"], "a": ["Figma に合わせる（紹介元区分の検索なし・終了月の検索あり・「契約ID」「紹介先法人ID-法人名」）", "Theo Figma"], "src": "hong 指示 2026-10-08（確認メモ m1〜m7 を提案どおり反映）"},
]
CHANGES = []
HIDE_ALWAYS = []
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [
    {"code": "AW_REFE_001", "ja": "紹介履歴一覧", "vi": "Danh sách lịch sử giới thiệu"},
    {"code": "AW_REFE_002", "ja": "紹介履歴登録（紹介元が法人のとき）", "vi": "Đăng ký lịch sử giới thiệu (khi nguồn là công ty)"},
    {"code": "AW_REFE_003", "ja": "紹介履歴編集（代理店からの紹介）", "vi": "Sửa lịch sử giới thiệu (từ đại lý)"},
    {"code": "AW_REFE_004", "ja": "紹介履歴編集（法人からの紹介）", "vi": "Sửa lịch sử giới thiệu (từ công ty)"},
    {"code": "AW_REFE_005", "ja": "紹介履歴詳細", "vi": "Chi tiết lịch sử giới thiệu"},
]

H = (
    "const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));"
    "const clickText=(sel,t,i)=>{const b=[...document.querySelectorAll(sel)].filter(x=>(x.textContent||'').includes(t))[i||0];b&&b.click();};"
    "const setv=async(sel,v)=>{const n=document.querySelector(sel);if(n){Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(n,v);n.dispatchEvent(new Event('input',{bubbles:true}));await sleep(200);}};"
    "const search=async(w)=>{await setv('.es-search input',w);clickText('button','検索');await sleep(600);};"
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
       "パンくず：代理・紹介管理 ＞ 紹介履歴。見られるのは運営の全役割（編集できるのはフル権限・システム管理・営業。ほかは閲覧のみ：権限表「代理店・パートナー管理」）。新規登録・削除のボタンはない。", vi="Phần đầu", dvi="Breadcrumb: Quản lý đại lý・giới thiệu > Lịch sử giới thiệu. Tất cả vai trò của bộ phận vận hành đều xem được (chỉ Toàn quyền・Quản trị hệ thống・Kinh doanh được sửa, còn lại chỉ xem: bảng quyền 「Quản lý đại lý・đối tác」). Không có nút đăng ký mới / xóa."),
    it("1.1", "CSV出力", ".ph", "button", "click",
       "ヘッダーの右。一覧の列＋詳細のデータ（紹介フィープランの条件・変更履歴）を、検索条件のとおりの全件で出す。閲覧できる役割には全員に出す。列の定義は CSV入出力_定義 に足す（台帳 Q・受付簿 #401。REQ-AG-042 の請求額・支払額・月ごとの支払い金額を含めるかは客先確認）。", pattern="P-CSV-OUT", vi="Xuất CSV", dvi="Nằm bên phải phần đầu. Xuất các cột của danh sách cộng với dữ liệu chi tiết, toàn bộ bản ghi theo điều kiện tìm kiếm (định nghĩa cột bổ sung vào CSV入出力_定義, #401; cân nhắc thêm theo REQ-AG-042: nguồn giới thiệu, nơi được giới thiệu, gói, số tiền yêu cầu thanh toán, số tiền chi trả, ngày kết thúc dự kiến, số tiền chi trả theo tháng). Hiển thị cho mọi vai trò được xem."),
    it("1.2", "説明", ".notice", "label", "show",
       "「紹介履歴は、親契約の『代理店コード（紹介有無）』から自動で作られます。新しい紹介は 法人・契約管理 ＞ 拠点一覧 で親契約に代理店コードを設定してください。ここで変更できるのは紹介フィープラン・支払い開始年月・備考です。」と出す。「拠点一覧」のリンクで拠点一覧（親契約）を開く。", vi="Giải thích", dvi="Hiển thị dòng: 「Lịch sử giới thiệu được tự động tạo từ 『mã đại lý (có/không giới thiệu)』 của hợp đồng mẹ. Để thêm giới thiệu mới, hãy đặt mã đại lý cho hợp đồng mẹ tại Quản lý công ty・hợp đồng > Danh sách chi nhánh. Ở đây chỉ sửa được gói phí giới thiệu, tháng bắt đầu chi trả và ghi chú.」 Link 「拠点一覧」 mở danh sách chi nhánh (hợp đồng mẹ)."),
    it("2", "検索条件", ".card", "area", "view",
       "キーワード（代理店名・ID、法人名・ID、紹介ID、親契約番号の部分一致）／紹介フィープラン／支払区分（単発・継続）／ステータス（契約前・有効・満了・途中解約・中止）／フィー算定方式（固定額・月次提供数別の金額・請求額割合）／開始月・終了月（それぞれ年月の1つ）。紹介元区分では絞らない（Figma のとおり）。「検索」か Enter で反映。",
       pattern="P-LIST", vi="Điều kiện tìm kiếm", dvi="Từ khóa (khớp một phần tên/ID đại lý, tên/ID công ty, ID giới thiệu, số hợp đồng mẹ) / gói phí giới thiệu / loại chi trả (một lần・liên tục) / Trạng thái (trước hợp đồng・hiệu lực・hết hạn・hủy giữa chừng・dừng) / cách tính phí (số tiền cố định・số tiền theo số suất cung cấp hàng tháng・tỷ lệ trên số tiền yêu cầu) / tháng bắt đầu・tháng kết thúc (mỗi cái một tháng). Không lọc theo loại nguồn giới thiệu (theo Figma). Áp dụng khi bấm 「検索」 hoặc Enter."),
    it("3", "紹介履歴の一覧", ".tbl", "table", "view",
       "初期の並びは紹介IDの昇順。1ページ 10件。0件は I01。", pattern="P-LIST", err=["I01"],
       demo_ok=["コードの初期の並びは親契約の並び。紹介IDの昇順にそろえる", "Thứ tự mặc định của code theo hợp đồng mẹ; đồng nhất theo ID giới thiệu tăng dần"], vi="Danh sách lịch sử giới thiệu", dvi="Mặc định sắp xếp tăng dần theo ID giới thiệu. 10 bản ghi mỗi trang. Nếu 0 bản ghi thì hiển thị I01."),
    it("3.1", "紹介ID", ".tbl th::紹介ID", "link", "click", "REF＋6桁（システムが親契約から作るときに採番）。下線つきのリンク。押すと詳細（AW_REFE_005）へ。", vi="ID giới thiệu", dvi="REF + 6 chữ số (hệ thống đánh số khi tạo từ hợp đồng mẹ). Link có gạch chân. Bấm để mở chi tiết (AW_REFE_005)."),
    it("3.2", "紹介元", ".tbl th::紹介元", "label", "view", "紹介元の代理店名（または法人名）。名前が取れないときは ID。", vi="Nguồn giới thiệu", dvi="Tên đại lý (hoặc tên công ty) giới thiệu. Nếu không lấy được tên thì hiển thị ID."),
    it("3.3", "紹介元区分", ".tbl th::紹介元区分", "label", "view", "代理店／法人。親契約に代理店コードがあれば代理店、なければ紹介元の法人。", vi="Loại nguồn giới thiệu", dvi="Đại lý / Công ty. Nếu hợp đồng mẹ có mã đại lý thì là đại lý, nếu không thì là công ty giới thiệu."),
    it("3.4", "紹介先法人ID-法人名", ".tbl th::紹介先法人", "label", "view", "法人ID と法人名を「CU000000　法人名」の形で（親契約の法人）。見出しは「紹介先法人ID-法人名」（Figma）。法人がないときは「（法人なし）」。", vi="Công ty được giới thiệu", dvi="ID công ty và tên công ty (công ty của hợp đồng mẹ). Nếu không có công ty thì hiển thị 「（法人なし）」 (không có công ty)."),
    it("3.5", "紹介先拠点", ".tbl th::紹介先拠点", "label", "view", "拠点ID と拠点名。", vi="Chi nhánh được giới thiệu", dvi="ID chi nhánh và tên chi nhánh."),
    it("3.6", "契約ID", ".tbl th::契約ID", "link", "click", "親契約の番号（CP＋数字）。見出しは「契約ID」（Figma）。押すと法人・契約管理 ＞ 拠点一覧を開く（開いたことをトーストで知らせる）。", vi="Số hợp đồng mẹ", dvi="Bấm để mở Quản lý công ty・hợp đồng > Danh sách chi nhánh (có thông báo toast cho biết đã mở)."),
    it("3.7", "紹介フィープラン", ".tbl th::紹介フィープラン", "label", "view", "この紹介に適用しているフィープランの名前（例：C：パートナー紹介）。", vi="Gói phí giới thiệu", dvi="Tên gói phí đang áp dụng cho lần giới thiệu này (ví dụ: C：パートナー紹介)."),
    it("3.8", "支払区分", ".tbl th::支払区分", "label", "view", "単発／継続。", vi="Loại chi trả", dvi="Một lần / Liên tục."),
    it("3.9", "ステータス", ".tbl th::ステータス", "label", "view", "バッジ：契約前／有効／満了／途中解約。決め方は AW_REFE_005 の No.2.9。", pattern="P-STATUS-COLORS", vi="Trạng thái", dvi="Badge: trước hợp đồng / hiệu lực / hết hạn / hủy giữa chừng. Cách xác định xem No.2.9 của AW_REFE_005."),
    it("3.10", "フィー算定方式", ".tbl th::フィー算定方式", "label", "view", "固定額／月次提供数別の金額／請求額割合。", vi="Cách tính phí", dvi="Số tiền cố định / số tiền theo số suất cung cấp hàng tháng / tỷ lệ trên số tiền yêu cầu."),
    it("3.11", "開始月", ".tbl th::開始月", "label", "view", "支払い開始年月（yyyy-mm）。契約前は空。", vi="Tháng bắt đầu", dvi="Tháng bắt đầu chi trả (yyyy-mm). Để trống nếu trước hợp đồng."),
    it("3.12", "終了予定月", ".tbl th::終了予定月", "label", "view", "支払いが終わる予定の年月（yyyy-mm）。永続は空。", vi="Tháng kết thúc dự kiến", dvi="Tháng dự kiến kết thúc chi trả (yyyy-mm). Để trống nếu liên tục vĩnh viễn."),
    it("3.13", "終了月", ".tbl th::終了月", "label", "view", "実際に終わった年月（yyyy-mm）。満了・途中解約のとき。", vi="Tháng kết thúc", dvi="Tháng thực tế kết thúc (yyyy-mm). Dùng khi hết hạn hoặc hủy giữa chừng."),
    it("3.14", "操作（編集）", ".tbl .act", "button", "click", "鉛筆＝編集（AW_REFE_003）。編集の権限がない役割には出さない。削除はない。", vi="Thao tác (sửa)", dvi="Biểu tượng bút chì = sửa (AW_REFE_003). Không hiển thị với vai trò không có quyền sửa. Không có xóa."),
    it("4", "ページ送り", ".pager", "area", "view", "P-LIST のとおり（10／20／50件）。", pattern="P-LIST", vi="Phân trang", dvi="Theo P-LIST (10／20／50 bản ghi)."),
    it("N1", "No（行番号）", "-", "label", "view",
       "一覧の左端に「No」の列（1から。ページをまたいで続ける）。",
       vi="Số thứ tự (No)", dvi="Cột 「No」 ở ngoài cùng bên trái danh sách (từ 1, đếm tiếp qua các trang)."),
    it("N2", "並べ替え・検索の折りたたみ", "-", "button", "view",
       "検索条件の右に「並べ替え」ボタン（P-LIST の並べ替え）。検索条件の左の矢印で検索の欄を折りたためる。",
       vi="Sắp xếp・thu gọn tìm kiếm", dvi="Nút 「並べ替え」 bên phải điều kiện tìm kiếm (sắp xếp theo P-LIST). Mũi tên bên trái điều kiện tìm kiếm cho phép thu gọn khu vực tìm kiếm."),
]

D_ITEMS = [
    it("1", "ヘッダー", ".ph", "area", "view",
       "パンくず：代理・紹介管理 ＞ 紹介履歴 ＞ 紹介履歴詳細。タイトル「紹介履歴詳細 REF000001」。右に「編集」（権限のある役割だけ）。削除はない。", vi="Phần đầu", dvi="Breadcrumb: Quản lý đại lý・giới thiệu > Lịch sử giới thiệu > Chi tiết lịch sử giới thiệu. Tiêu đề 「紹介履歴詳細 REF000001」. Bên phải có nút 「編集」 (chỉ vai trò có quyền). Không có xóa."),
    it("1.1", "編集", ".ph .btn.pri", "button", "click", "編集（AW_REFE_003）へ。編集の権限がない役割には出さない。", vi="Sửa", dvi="Chuyển sang màn sửa (AW_REFE_003). Không hiển thị với vai trò không có quyền sửa."),
    it("1.2", "紹介の中止", "-", "button", "click",
       "解約・問題が起きたときに、運営がこの紹介（紹介コード）を中止する。契約の中止ではない：親契約・契約・代理店コードは変えず、この紹介のフィーの支払だけを止める（削除ではない）。自動で作ったものも中止できる。押すと確認（Q01）→ 理由（必須・最大500文字）を入れて中止 → 以降の月の支払をやめる（未払いの月は「対象外」。支払済みの月はそのまま）。ステータスは「中止」、終了月は中止した年月（親契約が解約された場合は従来どおり自動で「途中解約」。有効紹介数には入れない）。「中止を取り消す」で戻せる（止めた月の支払は作り直さない）。権限のある役割（フル権限・システム管理・営業）だけに出す。",
       err=["Q01", "S01", "E01", "E04"],
       vi="Dừng giới thiệu (紹介の中止)", dvi="Khi có hủy hợp đồng hoặc sự cố, bộ phận vận hành dừng lần giới thiệu này (mã giới thiệu). Không phải dừng hợp đồng: hợp đồng mẹ・hợp đồng・mã đại lý giữ nguyên, chỉ ngừng chi trả phí của lần giới thiệu này (không xóa). Bản tự tạo cũng dừng được. Bấm sẽ xác nhận (Q01) → nhập lý do (bắt buộc, tối đa 500 ký tự) và dừng → ngừng chi trả các tháng sau (tháng chưa chi trả chuyển thành 「対象外」; tháng đã chi trả giữ nguyên). Trạng thái là 「中止」, tháng kết thúc là tháng dừng (nếu hợp đồng mẹ bị hủy thì vẫn tự động là 「途中解約」; không tính vào số giới thiệu hiệu lực). Có thể hoàn tác bằng 「中止を取り消す」 (không tạo lại các khoản đã dừng). Chỉ hiển thị cho vai trò có quyền (Toàn quyền・Quản trị hệ thống・Kinh doanh)."),
    it("2", "紹介基本情報", ".sec", "area", "view",
       "紹介元・親契約・紹介先は親契約（法人・契約管理）から反映するので、この画面では変えられない。変更は親契約で行う。", vi="Thông tin giới thiệu cơ bản", dvi="Nguồn giới thiệu・hợp đồng mẹ・nơi được giới thiệu được phản ánh từ hợp đồng mẹ (Quản lý công ty・hợp đồng) nên không sửa được ở màn này. Việc thay đổi thực hiện ở hợp đồng mẹ."),
    it("2.1", "紹介ID", ".fld::紹介ID", "label", "view", "REF＋6桁。", vi="ID giới thiệu", dvi="REF + 6 chữ số."),
    it("2.2", "紹介元区分", ".fld::紹介元区分", "label", "view", "代理店／法人。", vi="Loại nguồn giới thiệu", dvi="Đại lý / Công ty."),
    it("2.3", "紹介元（代理店／法人）", ".fld::紹介元", "label", "view",
       "ID と名前。紹介元が法人のとき（企業紹介）の紹介元法人は、運営が申込の承認のときに入力する（受付簿 #399）。親契約・運営の契約申請管理（受付・承認）に「紹介元（法人）」を入れる欄がある（コード済）。", vi="Nguồn giới thiệu (đại lý／công ty)", dvi="ID và tên. Khi nguồn giới thiệu là công ty (giới thiệu doanh nghiệp), công ty giới thiệu do bộ phận vận hành nhập khi phê duyệt đơn đăng ký (#399). Đã có ô nhập 「紹介元（法人）」 ở hợp đồng mẹ và ở phần tiếp nhận・phê duyệt đơn của vận hành (đã làm trong code)."),
    it("2.4", "親契約番号", ".fld::親契約番号", "label", "view", "親契約番号と「親契約を開く」ボタン。押すと拠点一覧（法人・契約管理）を開く。", vi="Số hợp đồng mẹ", dvi="Số hợp đồng mẹ và nút 「親契約を開く」 (mở hợp đồng mẹ). Bấm để mở danh sách chi nhánh (Quản lý công ty・hợp đồng)."),
    it("2.5", "紹介先法人・紹介先拠点", ".fld::紹介先法人", "label", "view", "法人ID＋法人名／拠点ID＋拠点名。", vi="Công ty・chi nhánh được giới thiệu", dvi="ID công ty + tên công ty / ID chi nhánh + tên chi nhánh."),
    it("2.6", "契約ステータス（親契約）", ".fld::契約ステータス", "label", "view", "親契約のステータス（仮登録・有効・利用休止・解約手続き中・終了）。", vi="Trạng thái hợp đồng (hợp đồng mẹ)", dvi="Trạng thái của hợp đồng mẹ (đăng ký tạm・hiệu lực・tạm ngừng sử dụng・đang làm thủ tục hủy・kết thúc)."),
    it("2.7", "契約開始年月", ".fld::契約開始年月", "label", "view", "親契約の開始サイクル月（yyyy-mm）。仮登録は「—（未開始）」。契約開始年月は親契約の値で、紹介履歴では変えない（手で登録する AW_REFE_002 でも親契約から自動で入る）。", vi="Tháng bắt đầu hợp đồng", dvi="Tháng chu kỳ bắt đầu của hợp đồng mẹ (yyyy-mm). Nếu đăng ký tạm thì hiển thị 「—（未開始）」 (chưa bắt đầu)."),
    it("2.8", "支払い開始年月", "#r-paystart", "label", "view", "紹介フィーを払い始める年月（yyyy-mm）。契約開始年月以降。編集で変えられる。", vi="Tháng bắt đầu chi trả", dvi="Tháng bắt đầu chi trả phí giới thiệu (yyyy-mm). Từ tháng bắt đầu hợp đồng trở đi. Có thể thay đổi bằng chức năng sửa."),
    it("2.9", "紹介ステータス", ".fld::紹介ステータス", "label", "view",
       "バッジ：契約前／有効／満了／途中解約。親契約が「仮登録」＝契約前。親契約が終了済みで、終了予定月より前に終わった＝途中解約、終了予定月まで続いた＝満了。親契約が続いていて、今月が終了予定月を過ぎた＝満了、それまで＝有効。保存のたびに計算し直す（決め方は hong 確認済み：受付簿 #398）。", vi="Trạng thái giới thiệu", dvi="Badge: trước hợp đồng / hiệu lực / hết hạn / hủy giữa chừng. Hợp đồng mẹ 「仮登録」 = trước hợp đồng. Hợp đồng mẹ đã kết thúc: kết thúc trước tháng kết thúc dự kiến = hủy giữa chừng, kéo dài đến tháng kết thúc dự kiến = hết hạn. Hợp đồng mẹ vẫn tiếp tục: tháng này đã qua tháng kết thúc dự kiến = hết hạn, trước đó = hiệu lực. Tính lại mỗi lần lưu (hong đã xác nhận: #398)."),
    it("2.10", "終了予定月・終了月", ".fld::終了予定月", "label", "view",
       "終了予定月＝単発は支払い開始年月、継続（ヶ月）は支払い開始年月から月数ぶん（開始月を1ヶ月目）、継続（永続）は「—」。終了月＝満了は終了予定月、途中解約は親契約の終了月。", vi="Tháng kết thúc dự kiến・tháng kết thúc", dvi="Tháng kết thúc dự kiến: một lần = tháng bắt đầu chi trả; liên tục (ヶ月) = tính từ tháng bắt đầu chi trả đủ số tháng (tháng bắt đầu là tháng thứ 1); liên tục (vĩnh viễn) = 「—」. Tháng kết thúc: hết hạn = tháng kết thúc dự kiến; hủy giữa chừng = tháng kết thúc của hợp đồng mẹ."),
    it("2.11", "備考", "#r-note", "label", "view", "運営だけが見るメモ。", vi="Ghi chú", dvi="Ghi chú chỉ bộ phận vận hành xem."),
    it("3", "紹介フィープラン", ".sec", "area", "view",
       "この紹介に適用しているフィープランの名前と、適用した時点のフィー支払区分・フィー算定方式・フィー金額・率（税込）・フィー支払期間。",
       demo_ok=["継続（36ヶ月）の数え方：決定は「法人単位で最初の拠点の契約開始から数え、全拠点がなくなったらリセット」。コードは紹介履歴ごと（親契約ごと）に支払い開始年月から数える。コードを決定にそろえる（確認メモ H1）", "Cách đếm kỳ liên tục (36 tháng): quyết định đếm theo công ty từ lúc chi nhánh đầu tiên bắt đầu hợp đồng, reset khi không còn chi nhánh nào. Code đếm theo từng lịch sử giới thiệu (từng hợp đồng mẹ) từ tháng bắt đầu chi trả (sửa code theo quyết định, H1)"], vi="Gói phí giới thiệu", dvi="Tên gói phí đang áp dụng cho lần giới thiệu này, cùng loại chi trả phí・cách tính phí・số tiền / tỷ lệ (đã gồm thuế)・thời gian chi trả phí tại thời điểm áp dụng."),
    it("3.1", "適用時点の条件の案内", ".sec .hint", "label", "show",
       "「この紹介に適用した時点の条件です（紹介フィーマスタを後から変更しても変わりません）。」と出す。紹介フィーマスタが後から変わっているときは、赤字で「現在の紹介フィーマスタ：…」を並べて出す。", vi="Giải thích điều kiện áp dụng", dvi="Hiển thị dòng: 「Đây là điều kiện tại thời điểm áp dụng cho lần giới thiệu này (không thay đổi dù sau này sửa master phí giới thiệu).」 Nếu master phí giới thiệu đã thay đổi sau đó, hiển thị thêm chữ đỏ 「現在の紹介フィーマスタ：…」 (master hiện tại) bên cạnh."),
    it("4", "変更履歴", ".tabs", "tab", "view", "変更日時・変更内容・変更者の表（新しい順）。親契約から自動で作ったときは変更者「システム」。見るだけ。", pattern="P-HIST", vi="Lịch sử thay đổi", dvi="Bảng gồm ngày giờ thay đổi・nội dung thay đổi・người thay đổi (mới nhất trước). Khi tạo tự động từ hợp đồng mẹ thì người thay đổi là 「システム」 (hệ thống). Chỉ xem."),
]

F_ITEMS = [
    it("1", "ヘッダー", ".ph", "area", "view",
       "タイトル「紹介履歴編集 REF000001」。右に「キャンセル」「保存」。詳細の「編集」から来る。変えられるのは下の3つ（紹介フィープラン・支払い開始年月・備考）だけ。",
       pattern="P-FORM", err=["Q02", "S01", "E30", "E31"], vi="Phần đầu", dvi="Tiêu đề 「紹介履歴編集 REF000001」. Bên phải có nút 「キャンセル」 (hủy) và 「保存」 (lưu). Đến từ nút 「編集」 ở màn chi tiết. Chỉ sửa được 3 mục bên dưới (gói phí giới thiệu・tháng bắt đầu chi trả・ghi chú)."),
    it("2", "支払い開始年月", "#r-paystart", "month", "input",
       "紹介フィーを払い始める年月。契約開始年月以降。保存すると終了予定月・ステータス・終了月を計算し直す。",
       err=["E01", "E276"], req="条件付き", len=["年月 yyyy-mm", "Năm tháng yyyy-mm"], fid="r-paystart", ex=["2026-05", "Tháng bắt đầu chi trả (yyyy-mm), ví dụ tháng 5 năm 2026"],
       cond=["親契約が「仮登録」以外のとき必須（仮登録は空でよい）", "Bắt buộc khi hợp đồng mẹ không phải 「仮登録」 (đăng ký tạm thì để trống được)"], valid=["契約開始年月以降", "Từ tháng bắt đầu hợp đồng trở đi"],
       demo_ok=["コードのメッセージは「支払い開始年月は契約開始年月以降を指定してください」。E276 にそろえる", "Câu của code là 「…契約開始年月以降を指定してください」; đồng nhất E276"], vi="Tháng bắt đầu chi trả", dvi="Tháng bắt đầu chi trả phí giới thiệu. Từ tháng bắt đầu hợp đồng trở đi. Khi lưu sẽ tính lại tháng kết thúc dự kiến・Trạng thái・tháng kết thúc."),
    it("3", "紹介フィープラン", "#f-plan", "select", "select",
       "紹介フィーマスタで「有効」のプランから選ぶ。選び直したときだけ、新しいプランの条件を写し直す（そのまま保存なら適用時点の条件を保つ）。選ぶと下の4つの欄（支払区分・算定方式・金額・率・支払期間）が変わる。",
       err=["E02"], req="○", len=["選択（有効なフィープラン）", "Chọn (gói phí đang hiệu lực)"], fid="f-plan", ex=["C：パートナー紹介", "Tên gói phí giới thiệu, ví dụ gói C dành cho giới thiệu đối tác"],
       demo_ok=["コードのプランの選択肢は有効なプラン全部。紹介元区分に合うプランだけにするか（受付簿 #397）", "Lựa chọn của code là mọi gói hiệu lực; xem xét lọc theo loại nguồn giới thiệu (Q2)"], vi="Gói phí giới thiệu", dvi="Chọn từ các gói đang 「有効」 (hiệu lực) trong master phí giới thiệu. Chỉ khi chọn lại mới sao điều kiện của gói mới (lưu nguyên thì giữ điều kiện tại thời điểm áp dụng). Khi chọn, 4 ô bên dưới (loại chi trả・cách tính・số tiền・tỷ lệ・thời gian chi trả) sẽ thay đổi."),
    it("4", "備考", "#r-note", "text", "input", "運営だけが見るメモ。", err=["E04"], req="－", len=["文字列 500", "Chuỗi ký tự, tối đa 500"], fid="r-note", ex=["法人の代理店（AG00021）を既定にした拠点の追加", "Ghi chú tự do, ví dụ thêm chi nhánh đặt đại lý của công ty (AG00021) làm mặc định"],
       demo_ok=["コードは1行の入力欄。台帳（メモ・備考は最大500文字・複数行）にそろえて複数行にする", "Code là ô 1 dòng; đổi thành nhiều dòng theo 台帳"], vi="Ghi chú", dvi="Ghi chú chỉ bộ phận vận hành xem."),
    it("5", "保存", ".ph .btn.pri", "button", "click",
       "保存すると、変更の内容を変更履歴に1行足す（例：「支払い開始年月を『2026年6月 → 2026年5月』に変更」）。支払履歴はこの保存では作り直さない。", err=["S01"],
       demo_ok=["コードは保存のトーストに「紹介履歴を保存しました」を出す。S01 にそろえる", "Code hiện toast riêng; đồng nhất S01"], vi="Lưu", dvi="Khi lưu, thêm 1 dòng nội dung thay đổi vào lịch sử thay đổi (ví dụ: 「支払い開始年月を『2026年6月 → 2026年5月』に変更」). Lịch sử chi trả không được tạo lại khi lưu."),
    it("6", "変更履歴", "-", "tab", "view",
       "編集に「変更履歴」の欄（変更日時・変更内容・変更者の表。新しい順。見るだけ）を出す。",
       vi="Lịch sử thay đổi", dvi="Hiển thị mục 「変更履歴」 (bảng ngày giờ・nội dung・người thay đổi, mới nhất trước, chỉ xem) ở màn sửa."),
]

V = lambda id, code, ja, vi, url, items, setup="", note=None, login=None, wait=600: dict(
    {"id": id, "code": code, "state": [ja, vi], "url": url, "setup": (H + setup) if setup else "", "full": True, "wait": wait,
     "note": [note or "", ""], "items": items}, **({"login": login} if login else {}))

VIEWS = [
    V("001", "AW_REFE_001", "初期表示", "Hiển thị ban đầu", "/ops/agency/referrals", L_ITEMS),
    V("002", "AW_REFE_001", "0件（検索結果なし）", "0 bản ghi (không có kết quả tìm kiếm)", "/ops/agency/referrals", [
        it("3", "紹介履歴の一覧", ".tbl", "table", "view", "検索結果が0件のときは I01。", err=["I01"], vi="Danh sách lịch sử giới thiệu", dvi="Khi kết quả tìm kiếm là 0 bản ghi thì hiển thị I01.")],
      setup="await search('zzzzzz');"),
    V("003", "AW_REFE_001", "参照のみ（閲覧の権限だけ）", "Chỉ xem (chỉ có quyền xem)", "/ops/agency/referrals", [
        it("3.14", "操作（編集）", ".tbl", "table", "view", "編集の権限がないので行の編集の操作は出ない。CSV出力は出る。", vi="Thao tác (sửa)", dvi="Vì không có quyền sửa nên không hiển thị thao tác sửa ở từng dòng. Vẫn hiển thị Xuất CSV.")],
      login="Ad00012"),
    V("004", "AW_REFE_005", "詳細（有効・代理店からの紹介）", "Chi tiết (hiệu lực, giới thiệu từ đại lý)", "/ops/agency/referrals/REF000001", D_ITEMS),
    V("005", "AW_REFE_005", "詳細（契約前）", "Chi tiết (trước hợp đồng)", "/ops/agency/referrals/REF000005", [
        it("2.9", "紹介ステータス", ".fld::紹介ステータス", "label", "view", "親契約が仮登録のとき「契約前」。契約開始年月は「—（未開始）」、支払い開始年月・終了予定月・終了月は空。", vi="Trạng thái giới thiệu", dvi="Khi hợp đồng mẹ là đăng ký tạm thì hiển thị 「契約前」 (trước hợp đồng). Tháng bắt đầu hợp đồng là 「—（未開始）」, tháng bắt đầu chi trả・tháng kết thúc dự kiến・tháng kết thúc để trống.")]),
    V("006", "AW_REFE_005", "詳細（途中解約）", "Chi tiết (hủy giữa chừng)", "/ops/agency/referrals/REF000003", [
        it("2.9", "紹介ステータス", ".fld::紹介ステータス", "label", "view", "親契約が終了予定月より前に終わったとき「途中解約」。終了月に親契約の終了月を入れる。", vi="Trạng thái giới thiệu", dvi="Khi hợp đồng mẹ kết thúc trước tháng kết thúc dự kiến thì hiển thị 「途中解約」 (hủy giữa chừng). Tháng kết thúc của hợp đồng mẹ được điền vào tháng kết thúc.")]),
    V("007", "AW_REFE_005", "詳細（紹介元が法人）", "Chi tiết (nguồn giới thiệu là công ty)", "/ops/agency/referrals/REF000004", [
        it("2.3", "紹介元（法人）", ".fld::紹介元", "label", "view", "紹介元区分が「法人」のとき、項目名は「紹介元（法人）」。親契約に紹介元法人の項目がまだないため、見出しの下に「仮データ（要仕様決定）」の注を出す。", vi="Nguồn giới thiệu (công ty)", dvi="Khi loại nguồn giới thiệu là 「法人」 (công ty), tên mục là 「紹介元（法人）」. Vì hợp đồng mẹ chưa có mục công ty giới thiệu nên dưới tiêu đề hiển thị ghi chú 「仮データ（要仕様決定）」 (dữ liệu tạm, cần quyết định spec).")]),
    V("008", "AW_REFE_003", "編集", "Sửa", "/ops/agency/referrals/REF000001/edit", F_ITEMS),
    V("009", "AW_REFE_003", "入力エラー", "Lỗi nhập liệu", "/ops/agency/referrals/REF000001/edit", [
        it("2", "入力エラー", ".sec", "area", "view", "支払い開始年月を空にして「保存」を押した状態。赤枠と項目の下の文。", err=["E01"], pattern="P-FORMBOX", vi="Lỗi nhập liệu", dvi="Trạng thái bỏ trống tháng bắt đầu chi trả rồi bấm 「保存」. Viền đỏ và câu thông báo dưới mục.")],
      setup="await setv('#r-paystart',''); clickText('.ph button','保存'); await sleep(500);"),
    V("010", "AW_REFE_003", "編集を破棄する確認", "Xác nhận hủy bỏ nội dung đang sửa", "/ops/agency/referrals/REF000001/edit", [
        it("1", "破棄の確認", ".modal", "modal", "show", "入力を変えてから「キャンセル」を押すと確認 Q02。", err=["Q02"], pattern="P-FORM", vi="Xác nhận hủy bỏ", dvi="Sau khi thay đổi nội dung rồi bấm 「キャンセル」 thì hiển thị xác nhận Q02.")],
      setup="await setv('#r-note','変更'); clickText('.ph button','キャンセル'); await sleep(400);"),
    V("011", "AW_REFE_004", "編集（紹介元が法人）", "Sửa (nguồn giới thiệu là công ty)", "/ops/agency/referrals/REF000004/edit", [
        it("2", "紹介元（法人）", ".fld::紹介元", "label", "view", "紹介元区分が「法人」の紹介履歴の編集。紹介元の法人は親契約から反映するので、ここでは変えられない。変えられるのは支払い開始年月・紹介フィープラン・備考だけ（Figma の AW_REFE_004 は紹介元法人・契約・拠点も選べる：確認メモ Q10）。",
           vi="Nguồn giới thiệu (công ty)", dvi="Sửa lịch sử giới thiệu có loại nguồn là 「法人」. Công ty giới thiệu lấy từ hợp đồng mẹ nên không sửa được ở đây; chỉ sửa tháng bắt đầu chi trả, gói phí, ghi chú (Figma AW_REFE_004 cho chọn cả công ty giới thiệu・hợp đồng・chi nhánh: câu hỏi Q10).")]),
    V("012", "AW_REFE_002", "登録（紹介元が法人）", "Đăng ký (nguồn giới thiệu là công ty)", "/ops/agency/referrals/new", [
        it("1", "紹介履歴の登録", ".ph", "area", "view", "紹介元が法人の紹介履歴を、運営が手で登録する（承認のときに入れ忘れた後付けなど）。一覧の「新規登録」から来る。代理店コードのある親契約は自動で作るのでここでは作らない。権限のある役割（フル権限・システム管理・営業）だけ。", pattern="P-FORM", err=["Q02", "S01", "E30"],
           vi="Đăng ký lịch sử giới thiệu", dvi="Vận hành đăng ký tay lịch sử giới thiệu có nguồn là công ty (để bổ sung sau khi quên nhập lúc phê duyệt...). Đến từ nút 「新規登録」 ở danh sách. Hợp đồng mẹ có mã đại lý thì tự động tạo nên không tạo ở đây. Chỉ vai trò có quyền (Toàn quyền・Quản trị hệ thống・Kinh doanh)."),
        it("2", "紹介元区分", ".fld::紹介元区分", "label", "view", "「法人」の固定（代理店からの紹介は親契約の代理店コードから自動で作る）。", vi="Loại nguồn giới thiệu", dvi="Cố định 「法人」 (giới thiệu từ đại lý được tạo tự động từ mã đại lý của hợp đồng mẹ)."),
        it("3", "紹介元法人ID・法人名", "#n-src", "select", "select", "紹介元の法人を法人の一覧から選ぶ。", err=["E02"], req="○", len=["選択（法人）", "Chọn (công ty)"], ex=["CU00001・株式会社みらい商事", "ID・tên công ty giới thiệu"], vi="Công ty giới thiệu (ID・tên)", dvi="Chọn công ty giới thiệu từ danh sách công ty."),
        it("4", "紹介先契約ID", "#n-contract", "select", "select", "代理店コードのない親契約で、まだ紹介履歴がないものから選ぶ。選ぶと下の紹介先法人・拠点・契約開始年月が入る（変えられない）。", err=["E02"], req="○", len=["選択（親契約）", "Chọn (hợp đồng mẹ)"], ex=["CP0000003　株式会社サンプル　名古屋営業所", "Hợp đồng mẹ nơi được giới thiệu"], vi="Hợp đồng nơi được giới thiệu", dvi="Chọn từ các hợp đồng mẹ chưa có mã đại lý và chưa có lịch sử giới thiệu. Khi chọn, công ty・chi nhánh・tháng bắt đầu hợp đồng bên dưới tự điền (không sửa được)."),
        it("5", "支払い開始年月", "#n-paystart", "month", "input", "紹介フィーを払い始める年月。契約開始年月以降。初期値は契約開始年月。", err=["E01", "E276"], req="○", len="年月 yyyy-mm", ex=["2026-11", "Tháng bắt đầu chi trả phí giới thiệu"], vi="Tháng bắt đầu chi trả", dvi="Tháng bắt đầu chi trả phí giới thiệu. Từ tháng bắt đầu hợp đồng trở đi. Mặc định là tháng bắt đầu hợp đồng."),
        it("6", "紹介フィープラン", "#f-plan", "select", "select", "紹介元区分が「法人」の有効なプラン（A：企業紹介）から選ぶ。", err=["E02"], req="○", len=["選択（法人向けのフィープラン）", "Chọn (gói phí dành cho công ty)"], ex=["A：企業紹介", "Gói phí giới thiệu doanh nghiệp"], vi="Gói phí giới thiệu", dvi="Chọn từ các gói đang 「有効」 có loại nguồn 「法人」 (A：giới thiệu doanh nghiệp)."),
    ]),
    V("013", "AW_REFE_005", "紹介の中止（確認と理由）", "Dừng giới thiệu (xác nhận và lý do)", "/ops/agency/referrals/REF000001", [
        it("1.2", "紹介の中止（確認と理由）", ".mbox", "modal", "show", "「紹介の中止」を押すと、確認（Q01）と理由の欄が1つの画面で出る。理由は必須（E01）・500文字まで（E04）。「中止する」で中止。", err=["Q01", "E01", "E04", "S01"],
           vi="Dừng giới thiệu (xác nhận và lý do)", dvi="Bấm 「紹介の中止」 thì hiện xác nhận (Q01) và ô lý do trong một màn hình. Lý do bắt buộc (E01), tối đa 500 ký tự (E04). Bấm 「中止する」 để dừng.")],
      setup="clickText('.ph button','紹介の中止'); await sleep(500);"),
    V("014", "AW_REFE_005", "詳細（中止）", "Chi tiết (đã dừng)", "/ops/agency/referrals/REF000001", [
        it("2.9", "紹介ステータス（中止）", ".fld::紹介ステータス", "label", "view", "中止した紹介のステータスは「中止」。終了月は中止した年月。詳細の右上は「中止を取り消す」に変わる。", vi="Trạng thái giới thiệu (đã dừng)", dvi="Trạng thái của giới thiệu đã dừng là 「中止」. Tháng kết thúc là tháng dừng. Nút ở trên bên phải chuyển thành 「中止を取り消す」.")],
      setup="clickText('.ph button','紹介の中止'); await sleep(400); const t=document.querySelector('#stop-reason'); Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(t,'契約の解約にともない紹介を中止'); t.dispatchEvent(new Event('input',{bubbles:true})); await sleep(200); clickText('.mbox-f button','中止する'); await sleep(1500);"),
]
