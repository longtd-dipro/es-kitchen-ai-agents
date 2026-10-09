# -*- coding: utf-8 -*-
"""
画面設計書のデータ：運営管理者Web ＞ 代理・紹介管理 ＞ 支払履歴（一覧・詳細・編集）
元：本物の Web（app/ops/agency/payments・lib/ops/general/logic.ts の payTotals・validatePay・lib/domain/areas/referral.ts の savePayment・lib/domain/seed/referral.ts）、
台帳 L・B、docs/01_仕様/70_代理店/代理店・紹介.md（2 フィーの金額・率、6 運営の画面）、docs/議事録_仕様/代理店紹介_詳細要件仕様.md（REQ-AG-043・045・046、凍結）、運営Web_権限表。
（運営I1：hong の確認前の提案を含む。提案は DECISIONS で「提案」と書き、確認メモ_AW_運営I1_代理店.md に質問を残してある）
"""

TITLE = ["支払履歴（AW_FEPA）", "Lịch sử chi trả (AW_FEPA)"]
SHEET = ["支払履歴", "Lịch sử chi trả"]
BASENAME = "画面設計書_AW_FEPA_支払履歴"
IMG_PREFIX = "AW_FEPA"
OUT_DIR = "AW_FEPA_支払履歴"
CODE_NOTE = ["画面コードは規約 <Module(2)>_<Feature(4)>_<Seq(3)>（docs/01_仕様/画面コード規約_20261005.md）。AW＝運営管理者Web、FEPA＝フィーの支払（Payment）。Feature は Figma の画面コードに合わせた（hong 指示 2026-10-08）（規約の例 UA_FEPA はアプリ側の別のモジュール）",
             "Mã màn hình theo quy ước <Module(2)>_<Feature(4)>_<Seq(3)>. AW = Admin Web, FEPA = Payment. Feature theo mã màn hình trong Figma (chỉ thị của hong 2026-10-08)"]
SITE = "ops"
SYSTEM = {"ja": "運営管理者Web", "vi": "Web quản trị vận hành"}
AUTHOR = "Claude（cloud）／確認：hong"
CREATED = "2026-10-08"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "ops", "loginId": "Ad00010"}
CODE_PATHS = ["app/ops/agency", "lib/ops/general", "lib/domain/areas/referral.ts", "lib/domain/seed/referral.ts"]

DECISIONS = [
    {"date": "2026-10-01", "target": "AW_FEPA_004 No.3", "q": ["フィーの金額の計算", "Cách tính số tiền phí"],
     "a": ["基準額＝税抜・値引き後の固定額（前払い）だけ。実績精算（後払い）は入れない。お試し期間の請求は対象外。金額は自動で計算し、調整額で手で直せる（価格改定・イレギュラーのため）", "Cơ sở = số tiền cố định sau giảm giá chưa thuế (trả trước), không tính quyết toán thực tế, kỳ dùng thử không tính. Tự tính, sửa tay bằng số điều chỉnh"],
     "src": "台帳 B「代理店フィーの基準額」、代理店・紹介.md 2-1・2-2、REQ-AG-002・004"},
    {"date": "2026-10-05", "target": "AW_FEPA_001 No.3", "q": ["代理店ごと・月ごとのデータ", "Dữ liệu theo từng đại lý, từng tháng"],
     "a": ["支払は「支払先（代理店または紹介元の法人）× 支払対象月」で1件。1件の中に、その月に払う紹介（紹介履歴）の行が並ぶ（内訳）。契約のデータは上書きせず、月ごとに新しいデータを作る", "1 bản ghi = người nhận (đại lý hoặc công ty giới thiệu) × tháng chi trả; bên trong là các dòng giới thiệu (nội dung chi tiết). Không ghi đè, mỗi tháng tạo mới"],
     "src": "代理店・紹介.md 6、REQ-AG-043・044"},
    {"date": "2026-10-08", "target": "AW_FEPA_001 No.3.8・AW_FEPA_002・002 No.3.1", "q": ["支払状況の名前と、直す場所", "Tên trạng thái chi trả và nơi sửa"],
     "a": ["未決。仕様の原典（REQ-AG-043・暫定）は「未確認／確認済み」、コードは「未払い／支払済／対象外」。REQ-AG-045（決定済み）は「一覧から支払いステータス・支払日を直せる」だが、コードは詳細の編集だけ。どれにそろえるか hong に聞く（確認メモ Q7）。それまではコードのとおり書き、open に残す", "Chưa quyết. Nguyên bản REQ-AG-043: 「未確認／確認済み」; code: 「未払い／支払済／対象外」. REQ-AG-045 (đã quyết) cho sửa từ danh sách nhưng code chỉ sửa ở màn chi tiết. Hỏi hong (Q7)"],
     "src": "確認メモ_AW_運営I1_代理店 Q7"},
    {"date": "2026-10-08", "target": "AW_FEPA_001", "q": ["支払履歴をだれがいつ作るか、支払先への通知", "Ai tạo lịch sử chi trả và khi nào; thông báo cho người nhận"],
     "a": ["未決（客先確認）。支払のタイミング・拠点を足したときに発生する条件・代理店への支払い金額のCSV通知・プラン変更／解約の通知は仕様でも未決（代理店・紹介.md U3〜U5）。コードにも支払履歴を作る操作がなく、見本のデータだけ。この画面では作る・消すの操作を置かない", "Chưa quyết (hỏi khách): thời điểm, điều kiện, thông báo. Code không có thao tác tạo, chỉ có dữ liệu mẫu. Màn này không có tạo mới / xóa"],
     "src": "代理店・紹介.md 7（U3〜U5）"},
    {"date": "2026-10-03", "target": "権限", "q": ["だれが見られる・操作できるか", "Ai được xem và thao tác"],
     "a": ["フル権限・システム管理・営業＝CRUD、ほか＝R。この画面には新規登録・削除がないので、CRUD の役割にも出るのは「編集」と「CSV出力」だけ", "Toàn quyền・Quản trị hệ thống・Kinh doanh = CRUD, còn lại = R. Màn này chỉ có 「編集」 và 「CSV出力」"],
     "src": "運営Web_権限表_20261003（パートナー・配送管理系）"},
    {"date": "2026-10-08", "target": "画面コード", "q": ["画面コード", "Mã màn hình"], "a": ["AW_FEPA_001〜004", "AW_FEPA_001〜004"], "src": "画面コード規約（Feature は Figma の画面コードに合わせた（hong 指示 2026-10-08））"},
    {"date": "2026-10-08", "target": "AW_FEPA_002・003 No.7、AW_FEPA_001 No.3.5", "q": ["支払の処理方法（振込／請求値引き）はだれが決めるか", "Ai quyết định phương thức xử lý"], "a": ["運営が編集で選ぶ（初期値＝代理店は振込・法人は請求値引き）", "Bộ phận vận hành chọn khi sửa (mặc định: đại lý = chuyển khoản, công ty = giảm trừ)"], "src": "hong 回答 2026-10-08・台帳 Q・受付簿 #402"},
    {"date": "2026-10-08", "target": "AW_FEPA_001 No.1.1", "q": ["CSV出力の列", "Cột xuất CSV"], "a": ["一覧の列＋詳細のデータ", "Cột danh sách + dữ liệu chi tiết"], "src": "hong 回答 2026-10-08・台帳 Q・受付簿 #401"},
    {"date": "2026-10-08", "target": "AW_FEPA_001 No.2", "q": ["支払履歴の検索条件", "Điều kiện tìm kiếm"], "a": ["Figma のとおり：キーワード・紹介フィープラン・支払区分・支払状況・フィー算定方式・支払対象月", "Theo Figma"], "src": "hong 回答 2026-10-08・台帳 Q・受付簿 #406"},
    {"date": "2026-10-08", "target": "AW_FEPA_001〜004", "q": ["画面コード", "Mã màn hình"], "a": ["Figma のとおり FEPA（001 一覧／002 編集（代理店）／003 編集（法人）／004 詳細）", "Theo Figma: FEPA"], "src": "hong 回答 2026-10-08・台帳 Q・受付簿 #407"},
    {"date": "2026-10-08", "target": "AW_FEPA_001 No.1.2", "q": ["支払状況・支払日を一覧で一括編集できるか", "Sửa hàng loạt tình trạng・ngày chi trả ở danh sách"], "a": ["する。複数選んで「支払済にする（支払日指定）」「未払いに戻す」「対象外にする」。詳細の編集も残す", "Có. Chọn nhiều rồi 「支払済にする」/「未払いに戻す」/「対象外にする」. Vẫn giữ sửa ở màn chi tiết"], "src": "hong 回答 2026-10-08・台帳 Q・受付簿 #409"},
    {"date": "2026-10-08", "target": "AW_FEPA_001・002・003", "q": ["Figma との細かい差（No 列・並べ替え・変更履歴）", "Khác biệt nhỏ với Figma"], "a": ["Figma に合わせる", "Theo Figma"], "src": "hong 指示 2026-10-08（確認メモ m1〜m7 を提案どおり反映）"},
]
CHANGES = []
HIDE_ALWAYS = []
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [
    {"code": "AW_FEPA_001", "ja": "支払履歴一覧", "vi": "Danh sách lịch sử chi trả"},
    {"code": "AW_FEPA_002", "ja": "フィー支払履歴編集（代理店）", "vi": "Sửa lịch sử chi trả phí (đại lý)"},
    {"code": "AW_FEPA_003", "ja": "フィー支払履歴編集（法人）", "vi": "Sửa lịch sử chi trả phí (công ty)"},
    {"code": "AW_FEPA_004", "ja": "フィー支払履歴詳細", "vi": "Chi tiết lịch sử chi trả phí"},
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
       "パンくず：代理・紹介管理 ＞ 支払履歴。見られるのは運営の全役割（編集できるのはフル権限・システム管理・営業。ほかは閲覧のみ：権限表「代理店・パートナー管理」）。新規登録・削除のボタンはない。",
       vi="Phần đầu trang",
       dvi="Breadcrumb: Quản lý đại lý・giới thiệu > Lịch sử chi trả. Tất cả vai trò của bộ phận vận hành đều xem được (chỉ Toàn quyền・Quản trị hệ thống・Kinh doanh được sửa, còn lại chỉ xem: bảng quyền 「代理店・パートナー管理」). Không có nút đăng ký mới và xóa."),
    it("1.1", "CSV出力", ".ph", "button", "click",
       "ヘッダーの右。一覧の列＋詳細のデータ（紹介フィー内訳）を、検索条件のとおりの全件で出す。閲覧できる役割には全員に出す。列の定義は CSV入出力_定義 に足す（台帳 Q・受付簿 #401）。", pattern="P-CSV-OUT",
       vi="Xuất CSV",
       dvi="Ở bên phải phần đầu trang. Xuất toàn bộ bản ghi theo điều kiện tìm kiếm, gồm các cột của danh sách và dữ liệu chi tiết (nội dung chi tiết phí giới thiệu). Định nghĩa cột sẽ bổ sung vào CSV入出力_定義 (#401). Hiển thị cho mọi vai trò có quyền xem."),
    it("2", "検索条件", ".card", "area", "view",
       "キーワード（代理店名・ID、法人名・ID、紹介ID の部分一致）／紹介フィープラン／支払区分（単発・継続）／支払状況（未払い・支払済・対象外）／フィー算定方式（固定額・月次提供数別の金額・請求額割合）／支払対象月。「検索」か Enter で反映（Figma のとおり：受付簿 #406）。",
       pattern="P-LIST",
       vi="Điều kiện tìm kiếm",
       dvi="Từ khóa (khớp một phần tên・ID đại lý, tên・ID công ty, ID giới thiệu) / gói phí giới thiệu / loại chi trả (một lần・liên tục) / tình trạng chi trả (chưa chi trả・đã chi trả・ngoài đối tượng) / cách tính phí (số tiền cố định・theo số suất hàng tháng・tỷ lệ theo số tiền hóa đơn) / tháng chi trả. Áp dụng khi bấm 「検索」 hoặc Enter (theo Figma: #406)."),
    it("1.2", "一括操作", "-", "button", "click",
       "一覧の左のチェックで複数の支払を選ぶと出る。「支払済にする」（支払日を指定するモーダル。支払日は必須：E01）、「未払いに戻す」、「対象外にする」。押すと確認（Q01）→ 選んだ全件に反映して S01。調整額・処理方法・備考は詳細の編集だけ（一括では変えない）。編集の権限がない役割には出さない。",
       pattern="P-BULK", err=["Q01", "S01", "E01", "E30"],
       vi="Thao tác hàng loạt", dvi="Hiện ra khi chọn nhiều khoản chi trả bằng ô tick bên trái danh sách. 「支払済にする」 (modal chỉ định ngày chi trả, bắt buộc: E01), 「未払いに戻す」, 「対象外にする」. Bấm sẽ xác nhận (Q01) → áp dụng cho tất cả mục đã chọn, hiện S01. Số tiền điều chỉnh・phương thức xử lý・ghi chú chỉ sửa ở màn chi tiết (không sửa hàng loạt). Không hiển thị với vai trò không có quyền sửa."),
    it("3", "支払の一覧", ".tbl", "table", "view",
       "初期の並びは支払対象月の新しい順（同じ月は支払いIDの降順）。1ページ 10件。0件は I01。金額は右寄せ・税込。", pattern="P-LIST", err=["I01"],
       vi="Danh sách chi trả",
       dvi="Thứ tự mặc định: tháng chi trả mới nhất trước (cùng tháng thì ID chi trả giảm dần). 10 dòng mỗi trang. Không có dữ liệu thì hiện I01. Số tiền căn phải, đã gồm thuế.",
       demo_ok=["コードの初期の並びは未確認（支払対象月の新しい順にそろえる）", "Thứ tự mặc định của code chưa xác nhận; đồng nhất theo tháng chi trả mới nhất trước"]),
    it("3.1", "支払対象月", ".tbl th::支払対象月", "label", "view", "yyyy-mm。この月に払う分。",
       vi="Tháng chi trả", dvi="Định dạng yyyy-mm. Khoản chi trả của tháng này."),
    it("3.2", "支払いID", ".tbl th::支払いID", "link", "click", "FP＋年月（6桁）＋「-」＋連番4桁（例：FP202608-0001）。下線つきのリンク。押すと詳細（AW_FEPA_004）へ。",
       vi="ID chi trả", dvi="FP + năm tháng (6 chữ số) + 「-」 + số thứ tự 4 chữ số (ví dụ: FP202608-0001). Là liên kết có gạch chân, bấm để sang màn chi tiết (AW_FEPA_004)."),
    it("3.3", "支払先区分", ".tbl th::支払先区分", "label", "view", "代理店／法人。",
       vi="Loại người nhận chi trả", dvi="Đại lý hoặc công ty."),
    it("3.4", "支払先", ".tbl th::支払先", "label", "view", "支払先の ID と名前（代理店または紹介元の法人）。",
       vi="Người nhận chi trả", dvi="ID và tên của người nhận chi trả (đại lý hoặc công ty giới thiệu)."),
    it("3.5", "処理方法", ".tbl th::処理方法", "label", "view", "振込／請求値引き。初期値は代理店＝振込、法人＝請求値引き（次回以降の請求から差し引く）。運営が編集で選ぶ（受付簿 #402）。",
       vi="Phương thức xử lý", dvi="Chuyển khoản hoặc giảm trừ trên hóa đơn. Giá trị ban đầu: đại lý = chuyển khoản, công ty = giảm trừ trên hóa đơn (trừ vào các hóa đơn từ kỳ sau). Bộ phận vận hành chọn khi sửa (#402)."),
    it("3.6", "対象件数", ".tbl th::対象件数", "label", "view", "内訳の行数（その月に払う紹介の件数）。右寄せ。",
       vi="Số bản ghi đối tượng", dvi="Số dòng chi tiết thành phần (số lượt giới thiệu được chi trả trong tháng đó). Căn phải."),
    it("3.7", "算定合計額（税込）", ".tbl th::算定合計額", "label", "view", "内訳の算定額の合計。右寄せ。",
       vi="Tổng số tiền tính toán (đã gồm thuế)", dvi="Tổng số tiền tính toán của các dòng chi tiết thành phần. Căn phải."),
    it("3.8", "調整合計額（税込）", ".tbl th::調整合計額", "label", "view", "内訳の調整額の合計（マイナスは減額）。右寄せ。",
       vi="Tổng số tiền điều chỉnh (đã gồm thuế)", dvi="Tổng số tiền điều chỉnh của các dòng chi tiết thành phần (số âm là giảm trừ). Căn phải."),
    it("3.9", "支払合計額（税込）", ".tbl th::支払合計額", "label", "view", "算定合計額＋調整合計額。右寄せ。",
       vi="Tổng số tiền chi trả (đã gồm thuế)", dvi="Tổng số tiền tính toán + tổng số tiền điều chỉnh. Căn phải."),
    it("3.10", "支払状況", ".tbl th::支払状況", "label", "view", "バッジ：未払い／支払済／対象外。", pattern="P-STATUS-COLORS",
       vi="Tình trạng chi trả", dvi="Huy hiệu: chưa chi trả / đã chi trả / ngoài đối tượng.",
       open=["支払状況の名前（コード：未払い／支払済／対象外、原典：未確認／確認済み）と、一覧から直せるか（確認メモ Q7）", "Tên tình trạng chi trả (code: 未払い／支払済／対象外, nguyên bản: 未確認／確認済み) và có sửa được từ danh sách không (ghi chú xác nhận Q7) - hong"]),
    it("3.11", "支払日", ".tbl th::支払日", "label", "view", "支払済みのときだけ入る（yyyy-mm-dd）。",
       vi="Ngày chi trả", dvi="Chỉ có giá trị khi đã chi trả (yyyy-mm-dd)."),
    it("3.12", "操作（編集）", ".tbl .act", "button", "click", "鉛筆＝編集（AW_FEPA_002）。編集の権限がない役割には出さない。削除はない。",
       vi="Thao tác (sửa)", dvi="Biểu tượng bút chì = sửa (AW_FEPA_002). Không hiển thị cho vai trò không có quyền sửa. Không có thao tác xóa."),
    it("4", "ページ送り", ".pager", "area", "view", "P-LIST のとおり（10／20／50件）。", pattern="P-LIST",
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
       "パンくず：代理・紹介管理 ＞ 支払履歴 ＞ フィー支払履歴詳細。タイトル「フィー支払履歴詳細 FP202608-0001」。右に「編集」（権限のある役割だけ）。削除はない。",
       vi="Phần đầu trang",
       dvi="Breadcrumb: Quản lý đại lý・giới thiệu > Lịch sử chi trả > Chi tiết lịch sử chi trả phí. Tiêu đề 「フィー支払履歴詳細 FP202608-0001」. Bên phải có nút 「編集」 (chỉ vai trò có quyền). Không có thao tác xóa."),
    it("1.1", "編集", ".ph .btn.pri", "button", "click", "編集（AW_FEPA_002）へ。編集の権限がない役割には出さない。",
       vi="Sửa", dvi="Chuyển sang màn sửa (AW_FEPA_002). Không hiển thị cho vai trò không có quyền sửa."),
    it("2", "支払い基本情報", ".sec", "area", "view", "支払いID・支払対象月・支払い先区分・支払い先・処理方法・紹介件数。すべて表示だけ（変えられない）。",
       vi="Thông tin cơ bản về chi trả", dvi="ID chi trả・tháng chi trả・loại người nhận chi trả・người nhận chi trả・phương thức xử lý・số lượt giới thiệu. Tất cả chỉ hiển thị (không sửa được)."),
    it("2.1", "支払い先", ".fld::支払い先", "label", "view", "支払い先区分が代理店のとき「支払い先（紹介元代理店）」、法人のとき「支払い先（紹介元法人）」。ID と名前。",
       vi="Người nhận chi trả", dvi="Khi loại người nhận là đại lý thì hiện 「支払い先（紹介元代理店）」, khi là công ty thì hiện 「支払い先（紹介元法人）」. Hiển thị ID và tên."),
    it("2.2", "紹介件数", ".fld::紹介件数", "label", "view", "内訳の行数。例：2件。",
       vi="Số lượt giới thiệu", dvi="Số dòng chi tiết thành phần. Ví dụ: 2 bản ghi."),
    it("3", "紹介フィー", ".sec", "area", "view", "支払い状況・支払日・合計・備考。",
       vi="Phí giới thiệu", dvi="Tình trạng chi trả・ngày chi trả・tổng số tiền・ghi chú."),
    it("3.1", "支払い状況", "input[name=p-status]", "label", "view", "未払い／支払済／対象外。編集で変えられる。",
       vi="Tình trạng chi trả", dvi="Chưa chi trả / đã chi trả / ngoài đối tượng. Có thể thay đổi ở màn sửa."),
    it("3.2", "支払日", "#p-date", "label", "view", "支払済みのときだけ入る。それ以外は空。",
       vi="Ngày chi trả", dvi="Chỉ có giá trị khi đã chi trả. Các trường hợp khác để trống."),
    it("3.3", "合計の枠", ".sum", "area", "view",
       "算定対象合計額（フィー計算の元になった請求額の合計）／算定合計額（フィーとして算定された金額の合計）／調整合計額／支払い合計額（算定合計額＋調整合計額）。税込。内訳の行の合計。",
       vi="Khung tổng số tiền",
       dvi="Tổng số tiền đối tượng tính toán (tổng số tiền hóa đơn làm cơ sở tính phí) / tổng số tiền tính toán (tổng số tiền được tính là phí) / tổng số tiền điều chỉnh / tổng số tiền chi trả (tổng tính toán + tổng điều chỉnh). Đã gồm thuế. Là tổng các dòng chi tiết thành phần."),
    it("3.4", "備考", "#p-note", "label", "view", "運営だけが見るメモ。",
       vi="Ghi chú", dvi="Ghi chú chỉ bộ phận vận hành xem."),
    it("4", "紹介フィー内訳", ".tbl", "table", "view",
       "No・紹介ID・紹介先法人・紹介フィープラン・支払区分・拠点数・算定方式・算定対象額・フィー金額・率（税込）・算定額・調整額・支払額（税込）。紹介IDを押すと紹介履歴の詳細（AW_REFE_005）へ。金額は右寄せ。",
       vi="Chi tiết thành phần phí giới thiệu",
       dvi="No・ID giới thiệu・công ty được giới thiệu・gói phí giới thiệu・loại chi trả・số cơ sở・cách tính toán・số tiền đối tượng tính toán・số tiền phí・tỷ lệ (đã gồm thuế)・số tiền tính toán・số tiền điều chỉnh・số tiền chi trả (đã gồm thuế). Bấm ID giới thiệu để sang chi tiết lịch sử giới thiệu (AW_REFE_005). Số tiền căn phải."),
    it("4.1", "算定額", ".tbl th::算定額", "label", "view",
       "固定額はその額。請求額割合は算定対象額×率（円未満は四捨五入）。月次提供数別の金額は、月次提供数に当てはまる段の金額。基準額は税抜・値引き後の固定額（前払い）だけで、お試し期間の請求は入れない。",
       vi="Số tiền tính toán",
       dvi="Số tiền cố định thì lấy đúng số đó. Theo tỷ lệ hóa đơn thì bằng số tiền đối tượng tính toán x tỷ lệ (làm tròn dưới 1 đồng). Số tiền theo số lượng cung cấp hàng tháng là số tiền của bậc tương ứng. Cơ sở chỉ là số tiền cố định (trả trước) sau giảm giá chưa thuế, không tính hóa đơn kỳ dùng thử."),
    it("5", "変更履歴", ".tabs", "tab", "view", "変更日時・変更内容・変更者の表（新しい順）。支払履歴を作ったときは変更者「システム」。見るだけ。", pattern="P-HIST",
       vi="Lịch sử thay đổi", dvi="Bảng ngày giờ thay đổi・nội dung thay đổi・người thay đổi (mới nhất trước). Khi tạo lịch sử chi trả thì người thay đổi là 「システム」. Chỉ để xem."),
]

F_ITEMS = [
    it("1", "ヘッダー", ".ph", "area", "view",
       "タイトル「フィー支払履歴編集 FP202608-0001」。右に「キャンセル」「保存」。変えられるのは支払い状況・支払日・備考・調整額だけ。",
       pattern="P-FORM", err=["Q02", "S01", "E30", "E31"],
       vi="Phần đầu trang",
       dvi="Tiêu đề 「フィー支払履歴編集 FP202608-0001」. Bên phải có 「キャンセル」 (hủy) và 「保存」 (lưu). Chỉ sửa được tình trạng chi trả・ngày chi trả・ghi chú・số tiền điều chỉnh.",
       demo_ok=["コードは保存のトーストに「支払履歴を保存しました」を出す。S01 にそろえる", "Code hiện toast riêng 「支払履歴を保存しました」; đồng nhất theo S01"]),
    it("2", "支払い状況", "input[name=p-status]", "radio", "select",
       "未払い／支払済／対象外。「支払済」を選ぶと、支払日が空のときは今日の日付が入る。「未払い」「対象外」に戻して保存すると支払日は消える。",
       vi="Tình trạng chi trả",
       dvi="Chưa chi trả / đã chi trả / ngoài đối tượng. Khi chọn 「支払済」 mà ngày chi trả đang trống thì tự điền ngày hôm nay. Nếu quay lại 「未払い」 hoặc 「対象外」 rồi lưu thì ngày chi trả bị xóa.",
       req="○", len=["選択（未払い／支払済／対象外）", "Chọn một (chưa chi trả / đã chi trả / ngoài đối tượng)"], init=["いまの値", "Giá trị hiện tại"],
       ex=["支払済", "Tình trạng chi trả: đã chi trả"],
       open=["支払状況の名前と直す場所（確認メモ Q7）", "Tên tình trạng chi trả và nơi sửa (ghi chú xác nhận Q7) - hong"]),
    it("3", "支払日", "#p-date", "date", "input",
       "「支払済」のときだけ入力できる。それ以外は入力できず、空。", err=["E01"], req="条件付き", len="日付 yyyy-mm-dd", fid="p-date",
       vi="Ngày chi trả",
       dvi="Chỉ nhập được khi là 「支払済」. Các trường hợp khác không nhập được và để trống.",
       ex=["2026-08-25", "Ngày chi trả (yyyy-mm-dd)"],
       cond=["支払い状況が「支払済」のとき必須", "Bắt buộc khi tình trạng chi trả là 「支払済」"],
       demo_ok=["コードのメッセージは「支払済みの場合は支払日を入力してください」。E01 にそろえる", "Câu của code là 「支払済みの場合は支払日を入力してください」; đồng nhất theo E01"]),
    it("4", "備考", "#p-note", "text", "input", "運営だけが見るメモ。", err=["E04"], req="－", len="文字列 500", fid="p-note",
       vi="Ghi chú", dvi="Ghi chú chỉ bộ phận vận hành xem.",
       ex=["振込手数料は当社負担", "Ghi chú tự do của bộ phận vận hành (tối đa 500 ký tự)"],
       demo_ok=["コードは1行の入力欄。台帳（メモ・備考は最大500文字・複数行）にそろえて複数行にする", "Code là ô nhập 1 dòng; đổi thành nhiều dòng theo 台帳 (ghi chú tối đa 500 ký tự, nhiều dòng)"]),
    it("5", "調整額", "input[aria-label=調整額]", "text", "input",
       "内訳の行ごと。円。マイナスは減額。100円刻みで増減できる。入れると、その行の支払額と上の合計の枠がその場で計算し直される。保存で確定する。",
       err=["E12", "E14"], req="－",
       vi="Số tiền điều chỉnh",
       dvi="Theo từng dòng chi tiết thành phần. Đơn vị đồng. Số âm là giảm trừ. Tăng giảm theo bước 100 đồng. Khi nhập, số tiền chi trả của dòng đó và khung tổng ở trên được tính lại ngay. Lưu để xác nhận.",
       len=["数値（マイナス可）10桁", "Số (cho phép số âm) tối đa 10 chữ số"], init=["0", "0 (đồng)"],
       ex=["-100", "Số điều chỉnh (đồng), số âm là giảm trừ"],
       valid=["整数（−999,999,999〜999,999,999）", "Số nguyên (từ -999,999,999 đến 999,999,999)"],
       demo_ok=["コードは数値かどうかを見ない（整数に丸める）。E14・E12 を足す", "Code không kiểm tra có phải số hay không (làm tròn thành số nguyên); bổ sung E14・E12"]),
    it("6", "調整額の案内", ".sec p", "label", "show", "「調整額を入力すると、支払額と上部の合計が自動で再計算されます（マイナスは減額）。」と出す。",
       vi="Hướng dẫn về số tiền điều chỉnh", dvi="Hiển thị dòng 「調整額を入力すると、支払額と上部の合計が自動で再計算されます（マイナスは減額）。」 (nhập số tiền điều chỉnh thì số tiền chi trả và tổng ở trên tự tính lại, số âm là giảm trừ)."),
    it("7", "処理方法", "#p-method", "select", "select", "振込／請求値引き。初期値は支払先区分で決める（代理店＝振込、法人＝請求値引き）。運営が選び直せる（受付簿 #402）。必須。",
       err=["E02"], req="○", len=["選択（振込／請求値引き）", "Chọn (chuyển khoản／giảm trừ trên hóa đơn)"], init=["代理店＝振込、法人＝請求値引き", "Đại lý = chuyển khoản, công ty = giảm trừ trên hóa đơn"], ex=["振込", "Phương thức xử lý: chuyển khoản"],
       vi="Phương thức xử lý", dvi="Chuyển khoản / giảm trừ trên hóa đơn. Giá trị ban đầu quyết định theo loại người nhận (đại lý = chuyển khoản, công ty = giảm trừ trên hóa đơn). Bộ phận vận hành có thể chọn lại (#402). Bắt buộc."),
    it("8", "変更履歴", "-", "tab", "view",
       "編集に「変更履歴」の欄（変更日時・変更内容・変更者の表。新しい順。見るだけ）を出す。",
       vi="Lịch sử thay đổi", dvi="Hiển thị mục 「変更履歴」 (bảng ngày giờ・nội dung・người thay đổi, mới nhất trước, chỉ xem) ở màn sửa."),
]

V = lambda id, code, ja, vi, url, items, setup="", note=None, nvi="", login=None, wait=600: dict(
    {"id": id, "code": code, "state": [ja, vi], "url": url, "setup": (H + setup) if setup else "", "full": True, "wait": wait,
     "note": [note or "", nvi if note else ""], "items": items}, **({"login": login} if login else {}))

VIEWS = [
    V("001", "AW_FEPA_001", "初期表示", "Hiển thị ban đầu", "/ops/agency/payments", L_ITEMS),
    V("002", "AW_FEPA_001", "0件（検索結果なし）", "0 bản ghi (không có kết quả tìm kiếm)", "/ops/agency/payments", [
        it("3", "支払の一覧", ".tbl", "table", "view", "検索結果が0件のときは I01。", err=["I01"],
           vi="Danh sách chi trả", dvi="Khi kết quả tìm kiếm là 0 bản ghi thì hiện I01.")],
      setup="await search('zzzzzz');"),
    V("003", "AW_FEPA_001", "参照のみ（閲覧の権限だけ）", "Chỉ xem (chỉ có quyền xem)", "/ops/agency/payments", [
        it("3.12", "操作（編集）", ".tbl", "table", "view", "編集の権限がないので行の編集の操作は出ない。CSV出力は出る。",
           vi="Thao tác (sửa)", dvi="Vì không có quyền sửa nên không hiện thao tác sửa ở từng dòng. Nút 「CSV出力」 vẫn hiện.")],
      login="Ad00012"),
    V("004", "AW_FEPA_004", "詳細（代理店・振込・未払い）", "Chi tiết (đại lý・chuyển khoản・chưa chi trả)", "/ops/agency/payments/FP202608-0001", D_ITEMS),
    V("005", "AW_FEPA_004", "詳細（法人・請求値引き）", "Chi tiết (công ty・giảm trừ trên hóa đơn)", "/ops/agency/payments/FP202609-0001", [
        it("2.1", "支払い先", ".fld::支払い先", "label", "view", "支払い先区分が法人のとき「支払い先（紹介元法人）」。処理方法は「請求値引き」。内訳はA：企業紹介の固定額（33,000円）で、算定対象額は 0円。",
           vi="Người nhận chi trả", dvi="Khi loại người nhận là công ty thì hiện 「支払い先（紹介元法人）」. Phương thức xử lý là 「請求値引き」 (giảm trừ trên hóa đơn). Chi tiết thành phần là A: số tiền cố định giới thiệu doanh nghiệp (33,000 đồng), số tiền đối tượng tính toán là 0 đồng.")]),
    V("006", "AW_FEPA_004", "詳細（支払済み）", "Chi tiết (đã chi trả)", "/ops/agency/payments/FP202607-0001", [
        it("3.2", "支払日", "#p-date", "label", "view", "支払済みのとき、支払日を表示する。",
           vi="Ngày chi trả", dvi="Khi đã chi trả thì hiển thị ngày chi trả.")]),
    V("007", "AW_FEPA_002", "編集", "Sửa", "/ops/agency/payments/FP202608-0001/edit", F_ITEMS),
    V("008", "AW_FEPA_002", "編集（調整額を入れた）", "Sửa (đã nhập số tiền điều chỉnh)", "/ops/agency/payments/FP202608-0001/edit", [
        it("5", "調整額", "input[aria-label=調整額]", "text", "input", "調整額に -100 を入れた状態。支払額と上部の合計が計算し直される。",
           vi="Số tiền điều chỉnh", dvi="Trạng thái đã nhập -100 vào số tiền điều chỉnh. Số tiền chi trả và tổng ở trên được tính lại.",
           ex=["-100", "Số điều chỉnh (đồng), số âm là giảm trừ"])],
      setup="await setv('input[aria-label=調整額]','-100');"),
    V("009", "AW_FEPA_002", "入力エラー（支払済みで支払日なし）", "Lỗi nhập liệu (đã chi trả nhưng không có ngày chi trả)", "/ops/agency/payments/FP202608-0001/edit", [
        it("3", "入力エラー", ".sec", "area", "view", "「支払済」を選び、支払日を消して「保存」を押した状態。支払日に赤枠と文。", err=["E01"], pattern="P-FORMBOX",
           vi="Lỗi nhập liệu", dvi="Trạng thái đã chọn 「支払済」, xóa ngày chi trả rồi bấm 「保存」. Ô ngày chi trả hiện viền đỏ và câu báo lỗi.")],
      setup="document.querySelectorAll('input[name=p-status]')[1]?.click(); await sleep(300); await setv('#p-date',''); clickText('.ph button','保存'); await sleep(500);"),
    V("010", "AW_FEPA_002", "編集を破棄する確認", "Xác nhận hủy nội dung đang sửa", "/ops/agency/payments/FP202608-0001/edit", [
        it("1", "破棄の確認", ".modal", "modal", "show", "入力を変えてから「キャンセル」を押すと確認 Q02。", err=["Q02"], pattern="P-FORM",
           vi="Xác nhận hủy", dvi="Sau khi thay đổi nội dung nhập rồi bấm 「キャンセル」 thì hiện hộp xác nhận Q02.")],
      setup="await setv('#p-note','変更'); clickText('.ph button','キャンセル'); await sleep(400);"),
    V("011", "AW_FEPA_003", "編集（法人・請求値引き）", "Sửa (công ty・giảm trừ trên hóa đơn)", "/ops/agency/payments/FP202609-0001/edit", [
        it("2", "支払い状況", "input[name=p-status]", "radio", "select", "支払い先区分が法人の支払の編集。内容は代理店向け（AW_FEPA_002）と同じ。支払い先は「支払い先（紹介元法人）」、処理方法は「請求値引き」。",
           req="○", len=["選択（未払い／支払済／対象外）", "Chọn (chưa chi trả／đã chi trả／ngoài đối tượng)"], init=["いまの値", "Giá trị hiện tại"], ex=["未払い", "Tình trạng chi trả hiện tại"],
           vi="Tình trạng chi trả", dvi="Sửa lịch sử chi trả có người nhận là công ty. Nội dung giống bản dành cho đại lý (AW_FEPA_002). Người nhận hiển thị 「支払い先（紹介元法人）」, phương thức xử lý là 「請求値引き」.")]),
    V("012", "AW_FEPA_001", "一括操作（2件選択中）", "Thao tác hàng loạt (đang chọn 2 mục)", "/ops/agency/payments", [
        it("1.2", "一括操作", ".es-selbar", "button", "click", "左のチェックで選ぶと下に一括操作のバーが出る：「支払済にする」「未払いに戻す」「対象外にする」と、「選択を解除」。", err=["Q01", "S01"], pattern="P-BULK",
           vi="Thao tác hàng loạt", dvi="Chọn bằng ô tick bên trái thì thanh thao tác hàng loạt hiện ở dưới: 「支払済にする」「未払いに戻す」「対象外にする」 và 「選択を解除」.")],
      setup="document.querySelectorAll('tbody .es-check input[type=checkbox]').forEach((b,i)=>{ if(i<2) b.click(); }); await sleep(400);"),
    V("013", "AW_FEPA_001", "一括操作：支払済にする（支払日を指定）", "Thao tác hàng loạt: 支払済にする (chỉ định ngày chi trả)", "/ops/agency/payments", [
        it("1.2", "支払済にする（支払日の指定）", ".mbox", "modal", "show", "「支払済にする」を押すと、支払日を指定する画面が出る。支払日は必須（E01）。決めると選んだ全件を支払済にして S01。", err=["E01", "S01"],
           vi="支払済にする (chỉ định ngày chi trả)", dvi="Bấm 「支払済にする」 thì hiện màn chỉ định ngày chi trả. Ngày chi trả là bắt buộc (E01). Sau khi xác nhận, chuyển tất cả mục đã chọn sang đã chi trả và hiện S01.")],
      setup="document.querySelectorAll('tbody .es-check input[type=checkbox]').forEach((b,i)=>{ if(i<2) b.click(); }); await sleep(300); clickText('.es-selbar button','支払済にする'); await sleep(500);"),
]
