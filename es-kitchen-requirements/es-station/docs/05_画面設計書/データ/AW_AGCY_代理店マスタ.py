# -*- coding: utf-8 -*-
"""
画面設計書のデータ：運営管理者Web ＞ 代理・紹介管理 ＞ 代理店マスタ（一覧・詳細・登録・編集）
元：本物の Web（app/ops/agency/agencies・app/ops/agency/_components・lib/ops/general/logic.ts・lib/domain/areas/referral.ts）、
台帳 L（代理店のフィーパターン・紐付け）・B（代理店フィーの基準額）、docs/01_仕様/70_代理店/代理店・紹介.md、運営Web_権限表。
（運営I1：hong の確認前の提案を含む。提案は DECISIONS で「提案」と書き、確認メモ_AW_運営I1_代理店.md に質問を残してある）
"""

TITLE = ["代理店マスタ（AW_AGCY）", "Master đại lý (AW_AGCY)"]
SHEET = ["代理店マスタ", "Master đại lý"]
BASENAME = "画面設計書_AW_AGCY_代理店マスタ"
IMG_PREFIX = "AW_AGCY"
OUT_DIR = "AW_AGCY_代理店マスタ"
CODE_NOTE = ["画面コードは規約 <Module(2)>_<Feature(4)>_<Seq(3)>（docs/01_仕様/画面コード規約_20261005.md）。AW＝運営管理者Web、AGCY＝代理店（Agency）。Feature は Figma の画面コードに合わせた（hong 指示 2026-10-08）",
             "Mã màn hình theo quy ước <Module(2)>_<Feature(4)>_<Seq(3)>. AW = Admin Web, AGCY = Agency. Feature theo mã màn hình trong Figma (chỉ thị của hong 2026-10-08)"]
SITE = "ops"
SYSTEM = {"ja": "運営管理者Web", "vi": "Web quản trị vận hành"}
AUTHOR = "Claude（cloud）／確認：hong"
CREATED = "2026-10-08"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "ops", "loginId": "Ad00010"}
CODE_PATHS = ["app/ops/agency", "lib/ops/general", "lib/domain/areas/referral.ts", "lib/domain/seed/referral.ts"]

DECISIONS = [
    {"date": "2026-10-05", "target": "AW_AGCY_002・003 No.2.5", "q": ["代理店に付けるフィーのパターン", "Mẫu phí gắn cho đại lý"],
     "a": ["パターンは A（企業紹介）・B（代理店紹介）・C（パートナー紹介）・D（特別代理店）の4つだけ。代理店の詳細で選ぶ（紹介フィーマスタの4件）", "Chỉ có 4 mẫu A・B・C・D; chọn ở màn đại lý (4 bản ghi của master phí giới thiệu)"],
     "src": "台帳 L「代理店のフィーパターン」（hong 2026-10-05）、代理店・紹介.md 1-2"},
    {"date": "2026-07-29", "target": "AW_AGCY_004・003", "q": ["代理店の紐付けの単位", "Đơn vị gắn đại lý"],
     "a": ["法人単位（1法人＝1代理店）。拠点ごとに別の代理店にはできない。紹介履歴は親契約の代理店コードから自動で作る", "Theo công ty (1 công ty = 1 đại lý). Lịch sử giới thiệu tự tạo từ mã đại lý của hợp đồng mẹ"],
     "src": "台帳 L「代理店の紐付け」、REQ-AG-021"},
    {"date": "2026-10-08", "target": "AW_AGCY_001 No.3.13、AW_AGCY_004 No.1.1", "q": ["紹介履歴のある代理店の削除", "Xóa đại lý đã có lịch sử giới thiệu"],
     "a": ["削除できない。使わなくするときはステータスを「無効」にする（E274）。削除は論理削除（P-DEL）", "Không xóa được; muốn ngừng dùng thì đặt Trạng thái 「無効」(E274). Xóa là xóa logic (P-DEL)"],
     "src": "Claude 提案・hong 確認待ち（コードの動きに合わせた。メッセージ E274 を新設）"},
    {"date": "2026-10-03", "target": "権限", "q": ["だれが見られる・操作できるか", "Ai được xem và thao tác"],
     "a": ["フル権限・システム管理・営業＝CRUD（CSV出力・CSV取込を含む権限の列は権限表）、ほか＝R。「代理店・パートナー管理」の1つの権限で、紹介フィーマスタ・代理店マスタ・紹介履歴・支払履歴をまとめて決める", "Toàn quyền・Quản trị hệ thống・Kinh doanh = CRUD, còn lại = R. Một quyền 「代理店・パートナー管理」 áp cho 4 màn"],
     "src": "運営Web_権限表_20261003（パートナー・配送管理系）"},
    {"date": "2026-10-08", "target": "画面コード", "q": ["画面コード", "Mã màn hình"], "a": ["AW_AGCY_001〜004", "AW_AGCY_001〜004"], "src": "画面コード規約（Feature は Figma の画面コードに合わせた（hong 指示 2026-10-08））"},
    {"date": "2026-10-08", "target": "AW_AGCY_002・003 No.3.1", "q": ["代理店の紹介フィープランの選択肢", "Lựa chọn gói phí giới thiệu của đại lý"], "a": ["紹介元区分「代理店紹介」の有効プラン（B・C・D）だけ。A：企業紹介は付けない", "Chỉ gói hiệu lực có loại nguồn 「代理店紹介」 (B・C・D). Không gắn A"], "src": "hong 回答 2026-10-08・台帳 Q・受付簿 #397"},
    {"date": "2026-10-08", "target": "AW_AGCY_002・003 No.2.4", "q": ["「無効」の代理店を新しい申込の代理店コードに指定できるか", "Có chỉ định đại lý 「無効」 làm mã đại lý của đơn mới không"], "a": ["できない。既存の紹介履歴・支払履歴は残る", "Không. Lịch sử giới thiệu・chi trả hiện có vẫn giữ"], "src": "hong 回答 2026-10-08・台帳 Q・受付簿 #400"},
    {"date": "2026-10-08", "target": "AW_AGCY_001 No.1.1", "q": ["CSV出力の列", "Cột xuất CSV"], "a": ["一覧の列＋詳細のデータ。列の定義は CSV入出力_定義 に足す", "Cột danh sách + dữ liệu chi tiết. Bổ sung định nghĩa vào CSV入出力_定義"], "src": "hong 回答 2026-10-08・台帳 Q・受付簿 #401"},
    {"date": "2026-10-08", "target": "AW_AGCY_001 No.3.5〜3.7", "q": ["件数の列の定義（Figma の注記「有効紹介数＝紹介合計数－満了－解約済み」）", "Định nghĩa cột số lượng (ghi chú Figma)"], "a": ["満了＝支払い期間が満了した紹介、解約済み＝途中解約など（hong）。列の置き換えは「契約前」の扱いを確認中（確認メモ Q12）", "満了 = giới thiệu hết thời hạn chi trả, 解約済み = hủy giữa chừng v.v. (hong). Việc thay cột đang chờ xác nhận cách tính 「契約前」 (Q12)"], "src": "hong 回答 2026-10-08（確認メモ Q12・台帳には未記入）"},
    {"date": "2026-10-08", "target": "AW_AGCY_001・004", "q": ["画面コードの Feature", "Feature của mã màn hình"], "a": ["Figma のとおり AGCY（001 一覧／002 登録／003 編集／004 詳細）", "Theo Figma: AGCY (001 danh sách／002 đăng ký／003 sửa／004 chi tiết)"], "src": "hong 回答 2026-10-08・台帳 Q・受付簿 #407"},
    {"date": "2026-10-08", "target": "AW_AGCY_001 No.3.5〜3.7", "q": ["件数の列", "Các cột số lượng"], "a": ["紹介合計数・有効紹介数・現在契約中。有効紹介数＝ステータスが「有効」の件数", "Tổng số giới thiệu・số giới thiệu hiệu lực・đang trong hợp đồng"], "src": "hong 回答 2026-10-08・台帳 Q・受付簿 #410"},
    {"date": "2026-10-08", "target": "AW_AGCY_001・003", "q": ["Figma との細かい差（No 列・並べ替え・タブ）", "Khác biệt nhỏ với Figma"], "a": ["Figma に合わせる", "Theo Figma"], "src": "hong 指示 2026-10-08（確認メモ m1〜m7 を提案どおり反映）"},
]
CHANGES = []
HIDE_ALWAYS = []
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [
    {"code": "AW_AGCY_001", "ja": "代理店一覧", "vi": "Danh sách đại lý"},
    {"code": "AW_AGCY_002", "ja": "代理店登録", "vi": "Đăng ký đại lý"},
    {"code": "AW_AGCY_003", "ja": "代理店情報編集", "vi": "Sửa thông tin đại lý"},
    {"code": "AW_AGCY_004", "ja": "代理店情報詳細", "vi": "Chi tiết thông tin đại lý"},
]

H = (
    "const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));"
    "const tab=(t)=>[...document.querySelectorAll('.tabs button')].find(b=>(b.textContent||'').trim()===t)?.click();"
    "const clickText=(sel,t,i)=>{const b=[...document.querySelectorAll(sel)].filter(x=>(x.textContent||'').includes(t))[i||0];b&&b.click();};"
    "const search=async(w)=>{const kw=document.querySelector('.es-search input');if(kw){Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(kw,w);kw.dispatchEvent(new Event('input',{bubbles:true}));await sleep(200);clickText('button','検索');await sleep(600);}};"
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
       "パンくず：代理・紹介管理 ＞ 代理店マスタ。見られるのは運営の全役割（操作できるのはフル権限・システム管理・営業。ほかは閲覧のみ：権限表「代理店・パートナー管理」）。",
       vi="Phần đầu trang",
       dvi="Breadcrumb: Quản lý đại lý・giới thiệu ＞ Master đại lý. Mọi vai trò của bộ phận vận hành đều xem được (chỉ Toàn quyền・Quản trị hệ thống・Kinh doanh được thao tác, còn lại chỉ xem: bảng quyền 「代理店・パートナー管理」)."),
    it("1.1", "CSV出力", ".ph", "button", "click",
       "ヘッダーの右。一覧の列＋詳細のデータ（担当者・紹介履歴・支払履歴）を、検索条件のとおりの全件で出す。閲覧できる役割には全員に出す。列の定義は CSV入出力_定義 に足す（台帳 Q・受付簿 #401）。", pattern="P-CSV-OUT",
       vi="Xuất CSV",
       dvi="Nằm bên phải phần đầu trang. Xuất các cột của danh sách cộng với dữ liệu ở màn chi tiết (người phụ trách・lịch sử giới thiệu・lịch sử chi trả), toàn bộ bản ghi theo điều kiện tìm kiếm. Định nghĩa cột sẽ bổ sung vào CSV入出力_定義 (sổ cái Q・#401). Hiển thị cho mọi vai trò được xem."),
    it("1.2", "新規登録", ".ph .btn.pri", "button", "click",
       "代理店の登録（AW_AGCY_002）へ。登録の権限がない役割には出さない。", pattern="P-FORM",
       vi="Đăng ký mới",
       dvi="Chuyển sang màn đăng ký đại lý (AW_AGCY_002). Không hiển thị với vai trò không có quyền đăng ký."),
    it("2", "検索条件", ".card", "area", "view",
       "キーワード（代理店名・代理店ID の部分一致）／紹介フィープラン（紹介フィーマスタの名前）／ステータス（有効・無効）。「検索」か Enter で反映。", pattern="P-LIST",
       vi="Điều kiện tìm kiếm",
       dvi="Từ khóa (khớp một phần tên đại lý・ID đại lý) / gói phí giới thiệu (tên trong master phí giới thiệu) / Trạng thái (hiệu lực・vô hiệu). Bấm 「検索」 hoặc Enter để áp dụng."),
    it("3", "代理店の一覧", ".tbl", "table", "view",
       "初期の並びは代理店IDの昇順。1ページ 10件。0件は I01。削除済みの代理店は出さない。", pattern="P-LIST", err=["I01"],
       vi="Danh sách đại lý",
       dvi="Mặc định sắp xếp theo ID đại lý tăng dần, 10 dòng mỗi trang. Khi 0 bản ghi hiện I01. Không hiển thị đại lý đã xóa."),
    it("3.1", "代理店ID", ".tbl th::代理店ID", "link", "click",
       "AG＋5桁（システムが採番）。下線つきのリンク。押すと詳細（AW_AGCY_004）へ。",
       vi="ID đại lý",
       dvi="AG + 5 chữ số (hệ thống tự cấp). Là liên kết có gạch chân; bấm vào sẽ mở màn chi tiết (AW_AGCY_004)."),
    it("3.2", "代理店名", ".tbl th::代理店名", "label", "view", "代理店の名前（全角・60文字まで）。",
       vi="Tên đại lý", dvi="Tên của đại lý (ký tự toàn chiều rộng, tối đa 60 ký tự)."),
    it("3.3", "紹介フィープラン", ".tbl th::紹介フィープラン", "label", "view",
       "代理店に付けているフィーのパターン名（例：C：パートナー紹介）。紹介フィーマスタ（AW_FEPL）の名前。",
       vi="Gói phí giới thiệu",
       dvi="Tên mẫu phí đang gắn cho đại lý (ví dụ: C：パートナー紹介). Là tên trong master phí giới thiệu (AW_FEPL)."),
    it("3.4", "メイン担当者名", ".tbl th::メイン担当者名", "label", "view", "担当者の先頭の1人の名前。",
       vi="Tên người phụ trách chính", dvi="Tên của người phụ trách đứng đầu danh sách."),
    it("3.5", "紹介合計数", ".tbl th::紹介合計数", "label", "view",
       "この代理店が紹介元の紹介履歴の件数（満了・途中解約・契約前を含む全部）。右寄せ。",
       vi="Tổng số giới thiệu",
       dvi="Số bản ghi lịch sử giới thiệu có đại lý này là nguồn giới thiệu (gồm tất cả: đã hết hạn・hủy giữa chừng・chưa ký hợp đồng). Căn phải."),
    it("3.6", "有効紹介数", ".tbl th::有効紹介数", "label", "view",
       "紹介履歴のうちステータスが「有効」の件数（契約前・満了・途中解約は入れない。満了＝支払い期間が満了、途中解約＝解約など）。右寄せ。列の名前は「有効紹介数」（受付簿 #410）。",
       vi="Số giới thiệu hiệu lực",
       dvi="Số bản ghi lịch sử giới thiệu có Trạng thái 「有効」 (không tính chưa ký hợp đồng・hết hạn・hủy giữa chừng; hết hạn = hết thời hạn chi trả, hủy giữa chừng = hủy hợp đồng v.v.). Căn phải. Tên cột là 「有効紹介数」 (#410)."),
    it("3.7", "現在契約中", ".tbl th::現在契約中", "label", "view",
       "紹介履歴のうち、親契約が「有効」または「解約手続き中」の件数。右寄せ。",
       vi="Đang trong hợp đồng",
       dvi="Số bản ghi lịch sử giới thiệu mà hợp đồng mẹ ở trạng thái 「有効」 hoặc 「解約手続き中」 (đang làm thủ tục hủy). Căn phải."),
    it("3.8", "ステータス", ".tbl th::ステータス", "label", "view", "バッジ：有効（緑）／無効。", pattern="P-STATUS-COLORS",
       vi="Trạng thái", dvi="Huy hiệu: hiệu lực (xanh lá) / vô hiệu."),
    it("3.9", "操作（編集）", ".tbl .act", "button", "click",
       "鉛筆＝編集（AW_AGCY_003）。編集の権限がない役割には出さない。",
       vi="Thao tác (sửa)",
       dvi="Biểu tượng bút chì = sửa (AW_AGCY_003). Không hiển thị với vai trò không có quyền sửa."),
    it("3.10", "操作（削除）", ".tbl .act", "button", "click",
       "ごみ箱＝削除（確認 Q01 → 論理削除して S02）。紹介履歴のある代理店は確認の前に E274 を出して削除しない。削除の権限（フル権限・システム管理）がない役割には出さない。",
       pattern="P-DEL", err=["Q01", "S02", "E30", "E274"],
       vi="Thao tác (xóa)",
       dvi="Biểu tượng thùng rác = xóa (xác nhận Q01 → xóa logic rồi hiện S02). Đại lý đã có lịch sử giới thiệu sẽ hiện E274 trước bước xác nhận và không bị xóa. Không hiển thị với vai trò không có quyền xóa (Toàn quyền・Quản trị hệ thống).",
       demo_ok=["コードは削除できないとき、画面のメッセージ（トースト）を出す。E274 の文言にそろえる", "Khi không xóa được, code hiện thông báo (toast) trên màn hình; cần đồng nhất với nội dung E274"]),
    it("4", "ページ送り", ".pager", "area", "view", "P-LIST のとおり（10／20／50件）。", pattern="P-LIST",
       vi="Phân trang", dvi="Theo mẫu P-LIST (10 / 20 / 50 dòng mỗi trang)."),
    it("N1", "No（行番号）", "-", "label", "view",
       "一覧の左端に「No」の列（1から。ページをまたいで続ける）。",
       vi="Số thứ tự (No)", dvi="Cột 「No」 ở ngoài cùng bên trái danh sách (từ 1, đếm tiếp qua các trang)."),
    it("N2", "並べ替え・検索の折りたたみ", "-", "button", "view",
       "検索条件の右に「並べ替え」ボタン（P-LIST の並べ替え）。検索条件の左の矢印で検索の欄を折りたためる。",
       vi="Sắp xếp・thu gọn tìm kiếm", dvi="Nút 「並べ替え」 bên phải điều kiện tìm kiếm (sắp xếp theo P-LIST). Mũi tên bên trái điều kiện tìm kiếm cho phép thu gọn khu vực tìm kiếm."),
]

D_ITEMS = [
    it("1", "ヘッダー", ".ph", "area", "view",
       "パンくず：代理・紹介管理 ＞ 代理店マスタ ＞ 代理店情報詳細。タイトル「代理店情報詳細 AG00021」。右に「削除」「編集」（権限のある役割だけ）。",
       vi="Phần đầu trang",
       dvi="Breadcrumb: Quản lý đại lý・giới thiệu ＞ Master đại lý ＞ Chi tiết thông tin đại lý. Tiêu đề 「代理店情報詳細 AG00021」. Bên phải có nút 「削除」 và 「編集」 (chỉ hiện với vai trò có quyền)."),
    it("1.1", "削除", ".ph .btn.dan", "button", "click",
       "削除の確認（Q01）→ 論理削除（P-DEL）して一覧へ。紹介履歴がある代理店は E274 で削除しない。", pattern="P-DEL", err=["Q01", "S02", "E30", "E274"],
       vi="Xóa",
       dvi="Xác nhận xóa (Q01) → xóa logic (P-DEL) rồi quay về danh sách. Đại lý đã có lịch sử giới thiệu sẽ hiện E274 và không bị xóa."),
    it("1.2", "編集", ".ph .btn.pri", "button", "click", "登録・編集（AW_AGCY_003）へ。編集の権限がない役割には出さない。",
       vi="Sửa", dvi="Chuyển sang màn đăng ký・sửa (AW_AGCY_003). Không hiển thị với vai trò không có quyền sửa."),
    it("2", "代理店情報（表示）", ".sec", "area", "view",
       "代理店ID・代理店名・代理店名カナ・ステータス・電話番号・FAX番号・郵便番号・都道府県・市区町村・町域・番地・建物・部屋番号・備考。すべて表示だけ。",
       vi="Thông tin đại lý (hiển thị)",
       dvi="ID đại lý・tên đại lý・tên đại lý (katakana)・Trạng thái・số điện thoại・số FAX・mã bưu điện・tỉnh/thành・quận/huyện・khu phố・số nhà・tòa nhà・số phòng・ghi chú. Tất cả chỉ để xem."),
    it("3", "紹介フィープラン（表示）", ".sec", "area", "view",
       "代理店に付けたフィープラン名と、そのプランのフィー支払区分・フィー算定方式・フィー金額・率（税込）・フィー支払期間（紹介フィーマスタから自動で反映）。",
       vi="Gói phí giới thiệu (hiển thị)",
       dvi="Tên gói phí gắn cho đại lý, cùng phân loại chi trả phí・phương thức tính phí・số tiền phí・tỷ lệ (đã gồm thuế)・thời hạn chi trả phí của gói đó (tự động lấy từ master phí giới thiệu)."),
    it("4", "担当者（表示）", ".sec", "area", "view", "担当者の表（区分・担当者名・フリガナ・メールアドレス・電話番号）。",
       vi="Người phụ trách (hiển thị)",
       dvi="Bảng người phụ trách (phân loại・tên người phụ trách・furigana・địa chỉ email・số điện thoại)."),
    it("5", "タブ", ".tabs", "tab", "click", "タブ：紹介履歴・支払履歴・変更履歴。初期は「紹介履歴」。", pattern="P-TAB",
       vi="Tab", dvi="Các tab: lịch sử giới thiệu・lịch sử chi trả・lịch sử thay đổi. Mặc định hiển thị 「紹介履歴」."),
    it("5.1", "紹介履歴（タブ）", ".tabs", "tab", "click",
       "この代理店が紹介元の紹介履歴の表（No・紹介ID・親契約番号・法人名・拠点名・紹介フィープラン・支払区分・ステータス・算定方式・開始月・終了予定月・終了月）。紹介IDを押すと紹介履歴の詳細（AW_REFE_005）へ。0件のときは「この代理店からの紹介はまだありません。法人・契約管理 ＞ 拠点（親契約）で代理店コードを設定すると表示されます」と出す。",
       err=["I01"], demo_ok=["0件のときの文言は I01 にそろえる（コードは独自の案内文）", "Nội dung khi 0 bản ghi cần đồng nhất với I01 (code đang dùng câu hướng dẫn riêng)"],
       vi="Lịch sử giới thiệu (tab)",
       dvi="Bảng lịch sử giới thiệu có đại lý này là nguồn giới thiệu (No・ID giới thiệu・số hợp đồng mẹ・tên công ty・tên chi nhánh・gói phí giới thiệu・loại chi trả・Trạng thái・phương thức tính・tháng bắt đầu・tháng dự kiến kết thúc・tháng kết thúc). Bấm ID giới thiệu để mở chi tiết lịch sử giới thiệu (AW_REFE_005). Khi 0 bản ghi hiện câu 「この代理店からの紹介はまだありません。法人・契約管理 ＞ 拠点（親契約）で代理店コードを設定すると表示されます」 (Chưa có giới thiệu nào từ đại lý này; sẽ hiển thị khi cài mã đại lý ở Quản lý công ty・hợp đồng ＞ chi nhánh (hợp đồng mẹ))."),
    it("5.2", "支払履歴（タブ）", ".tabs", "tab", "click",
       "この代理店への支払の表（No・支払対象月・支払いID・対象件数・支払合計額（税込）・支払状況・支払日）。支払いIDを押すと支払履歴の詳細（AW_FEPA_004）へ。0件のときは I01。", err=["I01"],
       vi="Lịch sử chi trả (tab)",
       dvi="Bảng các khoản chi trả cho đại lý này (No・tháng đối tượng chi trả・ID chi trả・số lượng đối tượng・tổng tiền chi trả (đã gồm thuế)・tình trạng chi trả・ngày chi trả). Bấm ID chi trả để mở chi tiết lịch sử chi trả (AW_FEPA_004). Khi 0 bản ghi hiện I01."),
    it("5.3", "変更履歴（タブ）", ".tabs", "tab", "click", "変更日時・変更内容・変更者の表（新しい順）。見るだけ。", pattern="P-HIST",
       vi="Lịch sử thay đổi (tab)", dvi="Bảng ngày giờ thay đổi・nội dung thay đổi・người thay đổi (mới nhất lên trước). Chỉ để xem."),
]

F_ITEMS = [
    it("1", "ヘッダー", ".ph", "area", "view",
       "タイトル「代理店登録」「代理店情報編集 AG00021」。右に「キャンセル」「登録」（編集は「保存」）。一覧の「新規登録」と、詳細の「編集」から来る。",
       pattern="P-FORM", err=["Q02", "S01", "E30", "E31"],
       vi="Phần đầu trang",
       dvi="Tiêu đề 「代理店登録」 hoặc 「代理店情報編集 AG00021」. Bên phải có nút 「キャンセル」 và 「登録」 (khi sửa là 「保存」). Đi vào từ 「新規登録」 ở danh sách và 「編集」 ở màn chi tiết.",
       demo_ok=["コードは保存のトーストに代理店名を入れる。S01 にそろえる", "Code đưa tên đại lý vào toast khi lưu; cần đồng nhất với S01"]),
    it("2", "代理店情報", ".sec", "area", "view", "代理店の基本情報。",
       vi="Thông tin đại lý", dvi="Thông tin cơ bản của đại lý."),
    it("2.1", "代理店ID", "#f-id", "text", "view", "AG＋5桁（システムが採番）。画面では変えられない（登録のときは空）。",
       init=["空（保存で採番）", "Trống (hệ thống cấp khi lưu)"], req="－",
       ex=["AG00022", "ID đại lý: AG + 5 chữ số, hệ thống tự cấp (ví dụ: AG00022)"],
       vi="ID đại lý", dvi="AG + 5 chữ số (hệ thống tự cấp). Không sửa được trên màn hình (khi đăng ký mới để trống)."),
    it("2.2", "代理店名", "#f-name", "text", "input", "代理店の名前。", err=["E01", "E04"], req="○", len=["文字列 60", "Chuỗi tối đa 60 ký tự"], fid="f-name",
       ex=["株式会社ブリッジワークス", "Tên đại lý (ví dụ: công ty cổ phần Bridge Works)"],
       vi="Tên đại lý", dvi="Tên của đại lý."),
    it("2.3", "代理店名カナ", "#f-kana", "text", "input", "全角カタカナ。", err=["E01", "E03", "E04"], req="○", len=["文字列 60", "Chuỗi tối đa 60 ký tự"], fid="f-kana",
       ex=["カブシキガイシャブリッジワークス", "Tên đại lý viết bằng katakana toàn chiều rộng (ví dụ: công ty Bridge Works)"],
       demo_ok=["コードはカタカナかどうかを見ない。E03 を足す", "Code chưa kiểm tra có phải katakana hay không; cần thêm E03"],
       vi="Tên đại lý (katakana)", dvi="Katakana toàn chiều rộng."),
    it("2.4", "ステータス", "#f-status", "select", "select", "有効／無効。新規は「有効」。「無効」にしても紹介履歴・支払履歴は残る。「無効」の代理店は、新しい申込の代理店コードに指定できない（受付簿 #400）。",
       req="○", len=["選択（有効／無効）", "Chọn (hiệu lực / vô hiệu)"], init=["有効", "Hiệu lực"], ex=["有効", "Trạng thái đại lý: 「有効」 hoặc 「無効」"], fid="f-status",
       vi="Trạng thái",
       dvi="Hiệu lực / vô hiệu. Đăng ký mới mặc định 「有効」. Dù đặt 「無効」 thì lịch sử giới thiệu・lịch sử chi trả vẫn được giữ lại. Đại lý 「無効」 không thể được chỉ định làm mã đại lý của đơn đăng ký mới (#400)."),
    it("2.5", "電話番号", "#f-tel", "text", "input", "半角の数字とハイフン。", err=["E01", "E06"], req="○", len=["文字列 13", "Chuỗi tối đa 13 ký tự"], fid="f-tel",
       ex=["03-1234-5678", "Số điện thoại, chữ số và dấu gạch ngang nửa chiều rộng"], demo_ok=["コードは10〜13文字の「数字とハイフン」を見る。E06（10〜11桁の数字・ハイフン可）にそろえる", "Code kiểm tra 「chữ số và dấu gạch ngang」 dài 10-13 ký tự; cần đồng nhất với E06 (10-11 chữ số, cho phép dấu gạch ngang)"],
       vi="Số điện thoại", dvi="Chữ số và dấu gạch ngang nửa chiều rộng."),
    it("2.6", "FAX番号", "#f-fax", "text", "input", "半角の数字とハイフン。空でもよい。", err=["E06"], req="－", len=["文字列 13", "Chuỗi tối đa 13 ký tự"], fid="f-fax",
       ex=["03-1234-5679", "Số FAX, chữ số và dấu gạch ngang nửa chiều rộng"], demo_ok=["コードは形を見ない。E06 を足す", "Code chưa kiểm tra định dạng; cần thêm E06"],
       vi="Số FAX", dvi="Chữ số và dấu gạch ngang nửa chiều rộng. Được để trống."),
    it("2.7", "郵便番号", "#f-zip", "text", "input", "数字7桁（ハイフン可）。", err=["E01", "E05"], req="○", len=["文字列 8", "Chuỗi tối đa 8 ký tự"], fid="f-zip",
       ex=["100-0005", "Mã bưu điện 7 chữ số, có thể kèm dấu gạch ngang"],
       vi="Mã bưu điện", dvi="7 chữ số (cho phép dấu gạch ngang)."),
    it("2.8", "都道府県", "#f-pref", "select", "select", "47都道府県から選ぶ。", err=["E02"], req="○", len=["選択（47都道府県）", "Chọn (47 tỉnh/thành)"], fid="f-pref",
       ex=["東京都", "Tỉnh/thành, chọn từ 47 tỉnh/thành (ví dụ: Tokyo)"], demo_ok=["コードの選択肢は10都道府県だけ。47に直す", "Code chỉ có 10 tỉnh/thành trong danh sách chọn; cần sửa thành 47"],
       vi="Tỉnh/thành", dvi="Chọn từ 47 tỉnh/thành."),
    it("2.9", "市区町村", "#f-city", "text", "input", "市区町村。", err=["E01", "E04"], req="○", len=["文字列 60", "Chuỗi tối đa 60 ký tự"], fid="f-city",
       ex=["千代田区丸の内", "Quận/huyện/thành phố (ví dụ: quận Chiyoda, Marunouchi)"],
       vi="Quận/huyện", dvi="Thành phố, quận, huyện."),
    it("2.10", "町域・番地", "#f-addr", "text", "input", "町域と番地。", err=["E01", "E04"], req="○", len=["文字列 60", "Chuỗi tối đa 60 ký tự"], fid="f-addr",
       ex=["1-2-3", "Khu phố và số nhà (ví dụ: 1-2-3)"],
       vi="Khu phố・số nhà", dvi="Khu phố và số nhà."),
    it("2.11", "建物・部屋番号", "#f-bldg", "text", "input", "建物名と部屋番号。空でもよい。", err=["E04"], req="－", len=["文字列 60", "Chuỗi tối đa 60 ký tự"], fid="f-bldg",
       ex=["丸の内ビル 8F", "Tên tòa nhà và số phòng (ví dụ: tòa nhà Marunouchi tầng 8)"],
       vi="Tòa nhà・số phòng", dvi="Tên tòa nhà và số phòng. Được để trống."),
    it("2.12", "備考", "#f-note", "text", "input", "運営だけが見るメモ。", err=["E04"], req="－", len=["文字列 500", "Chuỗi tối đa 500 ký tự"], fid="f-note",
       ex=["関東エリアを中心に法人紹介を担当", "Ghi chú nội bộ (ví dụ: phụ trách giới thiệu công ty, chủ yếu khu vực Kanto)"],
       demo_ok=["コードは1行の入力欄。台帳（メモ・備考は最大500文字・複数行）にそろえて複数行にする", "Code đang là ô nhập 1 dòng; đổi thành nhiều dòng theo 台帳 (ghi chú tối đa 500 ký tự, nhiều dòng)"],
       vi="Ghi chú", dvi="Ghi chú chỉ bộ phận vận hành xem."),
    it("3", "紹介フィープラン", ".sec", "area", "view", "代理店に付けるフィーのパターン。",
       vi="Gói phí giới thiệu", dvi="Mẫu phí gắn cho đại lý."),
    it("3.1", "紹介フィープラン", "#f-plan", "select", "select",
       "紹介フィーマスタ（AW_FEPL）で「有効」かつ紹介元区分が「代理店紹介」のプラン（B・C・D）から選ぶ（A：企業紹介は法人からの紹介なので出さない：受付簿 #397）。選ぶと下の4つの欄（フィー支払区分・算定方式・金額・率・支払期間）が自動で変わる。",
       err=["E02"], req="○", len=["選択（有効なフィープラン）", "Chọn (gói phí đang hiệu lực)"], fid="f-plan",
       ex=["C：パートナー紹介", "Tên gói phí giới thiệu (ví dụ: C：giới thiệu đối tác)"],
       vi="Gói phí giới thiệu",
       dvi="Chọn từ các gói đang 「有効」 có loại nguồn 「代理店紹介」 (B・C・D) trong master phí giới thiệu (AW_FEPL); gói A (giới thiệu doanh nghiệp) không hiển thị vì là giới thiệu từ công ty (#397). Khi chọn, các ô bên dưới (phân loại chi trả phí・phương thức tính・số tiền・tỷ lệ・thời hạn chi trả) tự động đổi theo."),
    it("3.2", "フィー支払区分・算定方式・金額・率・支払期間", ".sec .fg", "area", "view",
       "選んだフィープランの内容を表示するだけ（変えられない）。金額・率を変えたいときは紹介フィーマスタを直す。",
       vi="Phân loại chi trả・phương thức tính・số tiền・tỷ lệ・thời hạn chi trả phí",
       dvi="Chỉ hiển thị nội dung gói phí đã chọn (không sửa được). Muốn đổi số tiền・tỷ lệ thì sửa ở master phí giới thiệu."),
    it("4", "担当者", ".sec", "area", "view", "代理店の担当者の表。1名以上必要。",
       vi="Người phụ trách", dvi="Bảng người phụ trách của đại lý. Cần ít nhất 1 người."),
    it("4.1", "担当者の行", ".sec .tbl", "table", "input",
       "区分（メイン担当者／サブ担当者／経理担当者）・担当者名・フリガナ・メールアドレス・電話番号。登録の初期は「メイン担当者」の空の1行。ごみ箱で行を消す。",
       err=["E01", "E07", "E06"], req="○", len=["担当者名 60、フリガナ 60、メール 254、電話 13", "Tên người phụ trách 60, furigana 60, email 254, điện thoại 13 ký tự"],
       ex=["メイン担当者／山田 太郎／ヤマダ タロウ／taro.yamada@example.jp／090-1234-5678", "Một dòng người phụ trách: phân loại / tên / furigana / email / điện thoại (ví dụ: người phụ trách chính Yamada Taro)"],
       demo_ok=["コードは行の下にまとめた1つの文を出す。項目ごとに E01・E07・E06 を出す", "Code hiện một câu chung dưới bảng; cần đổi thành hiện lỗi E01・E07・E06 theo từng ô"],
       vi="Dòng người phụ trách",
       dvi="Phân loại (người phụ trách chính / phụ / kế toán)・tên người phụ trách・furigana・địa chỉ email・số điện thoại. Khi đăng ký mới mặc định có 1 dòng trống 「メイン担当者」. Bấm thùng rác để xóa dòng."),
    it("4.2", "行を追加", ".sec .btn.out", "button", "click", "「サブ担当者」の空の行を足す。",
       vi="Thêm dòng", dvi="Thêm một dòng trống loại 「サブ担当者」 (người phụ trách phụ)."),
    it("5", "入力エラー", ".sec", "area", "view",
       "保存で全項目を確かめ、赤枠と項目の下の文を出す。上にトースト「入力内容を確認してください（赤枠の項目）」。", pattern="P-FORMBOX",
       vi="Lỗi nhập liệu",
       dvi="Khi lưu sẽ kiểm tra tất cả các ô, hiện khung đỏ và câu thông báo bên dưới ô. Phía trên hiện toast 「入力内容を確認してください（赤枠の項目）」 (Hãy xác nhận nội dung nhập (các ô viền đỏ))."),
    it("6", "タブ（紹介履歴・支払履歴・変更履歴）", "-", "tab", "view",
       "編集の画面でも、詳細と同じ「紹介履歴・支払履歴・変更履歴」のタブを下に出す（Figma の AW_AGCY_003）。初期は「紹介履歴」。",
       vi="Tab (lịch sử giới thiệu・chi trả・thay đổi)", dvi="Màn sửa cũng hiển thị bên dưới các tab 「紹介履歴・支払履歴・変更履歴」 giống màn chi tiết (Figma AW_AGCY_003). Mặc định là 「紹介履歴」."),
]


def V(id, code, ja, url, items, setup="", note=None, login=None, wait=600, vi="", nvi=""):
    return dict(
        {"id": id, "code": code, "state": [ja, vi], "url": url, "setup": (H + setup) if setup else "", "full": True, "wait": wait,
         "note": [note or "", nvi], "items": items}, **({"login": login} if login else {}))


VIEWS = [
    V("001", "AW_AGCY_001", "初期表示", "/ops/agency/agencies", L_ITEMS, vi="Hiển thị ban đầu"),
    V("002", "AW_AGCY_001", "0件（検索結果なし）", "/ops/agency/agencies", [
        it("3", "代理店の一覧", ".tbl", "table", "view", "検索結果が0件のときは I01。", err=["I01"],
           vi="Danh sách đại lý", dvi="Khi kết quả tìm kiếm là 0 bản ghi thì hiện I01.")],
      setup="await search('zzzzzz');", vi="0 bản ghi (không có kết quả tìm kiếm)"),
    V("003", "AW_AGCY_001", "削除の確認", "/ops/agency/agencies", [
        it("3.10", "削除の確認", ".modal", "modal", "show", "紹介履歴のない代理店（見本：AG00012）を削除する。確認 Q01 → 削除 → S02。", err=["Q01", "S02"], pattern="P-DEL",
           vi="Xác nhận xóa", dvi="Xóa đại lý chưa có lịch sử giới thiệu (mẫu: AG00012). Xác nhận Q01 → xóa → S02.")],
      setup="await search('AG00012'); document.querySelector('.tbl tbody tr .act button:last-child')?.click(); await sleep(400);",
      vi="Xác nhận xóa"),
    V("004", "AW_AGCY_001", "削除できない（紹介履歴あり）", "/ops/agency/agencies", [
        it("3.10", "削除できない", "body", "toast", "show", "紹介履歴のある代理店（見本：AG00021）は確認の前に E274 を出して削除しない。", err=["E274"],
           vi="Không xóa được", dvi="Đại lý đã có lịch sử giới thiệu (mẫu: AG00021) sẽ hiện E274 trước bước xác nhận và không bị xóa.")],
      setup="await search('AG00021'); document.querySelector('.tbl tbody tr .act button:last-child')?.click(); await sleep(500);",
      vi="Không xóa được (đã có lịch sử giới thiệu)"),
    V("005", "AW_AGCY_001", "参照のみ（閲覧の権限だけ）", "/ops/agency/agencies", [
        it("1.2", "新規登録", ".ph", "area", "view", "登録の権限がないので「新規登録」と行の編集・削除の操作は出ない。CSV出力は出る。",
           vi="Đăng ký mới", dvi="Vì không có quyền đăng ký nên không hiện 「新規登録」 và các thao tác sửa・xóa ở từng dòng. Nút xuất CSV vẫn hiện.")],
      login="Ad00012", vi="Chỉ xem (chỉ có quyền xem)"),
    V("006", "AW_AGCY_004", "詳細（紹介履歴のタブ）", "/ops/agency/agencies/AG00021", D_ITEMS, vi="Chi tiết (tab lịch sử giới thiệu)"),
    V("007", "AW_AGCY_004", "詳細（支払履歴のタブ）", "/ops/agency/agencies/AG00021", [
        D_ITEMS[8]], setup="tab('支払履歴'); await sleep(300);", vi="Chi tiết (tab lịch sử chi trả)"),
    V("008", "AW_AGCY_004", "詳細（変更履歴のタブ）", "/ops/agency/agencies/AG00021", [
        D_ITEMS[9]], setup="tab('変更履歴'); await sleep(300);", vi="Chi tiết (tab lịch sử thay đổi)"),
    V("009", "AW_AGCY_004", "詳細（紹介がまだない代理店）", "/ops/agency/agencies/AG00012", [
        it("5.1", "紹介履歴（タブ）", ".tabs", "tab", "view", "紹介履歴が0件のとき。", err=["I01"],
           vi="Lịch sử giới thiệu (tab)", dvi="Trường hợp lịch sử giới thiệu là 0 bản ghi.")],
      vi="Chi tiết (đại lý chưa có giới thiệu nào)"),
    V("010", "AW_AGCY_002", "新規登録", "/ops/agency/agencies/new", F_ITEMS, vi="Đăng ký mới"),
    V("011", "AW_AGCY_002", "入力エラー", "/ops/agency/agencies/new", [
        it("5", "入力エラー", ".sec", "area", "view", "何も入れずに「登録」を押した状態。必須の欄に赤枠と文、担当者の行にも赤枠。", err=["E01"], pattern="P-FORMBOX",
           vi="Lỗi nhập liệu", dvi="Trạng thái bấm 「登録」 khi chưa nhập gì. Các ô bắt buộc hiện khung đỏ và câu thông báo, dòng người phụ trách cũng có khung đỏ.")],
      setup="clickText('.ph button','登録'); await sleep(500);", vi="Lỗi nhập liệu"),
    V("012", "AW_AGCY_003", "編集", "/ops/agency/agencies/AG00021/edit", [
        it("1", "ヘッダー", ".ph", "area", "view", "タイトル「代理店情報編集 AG00021」。代理店IDは変えられない。保存で変更履歴に1行足す。", pattern="P-FORM",
           vi="Phần đầu trang", dvi="Tiêu đề 「代理店情報編集 AG00021」. Không sửa được ID đại lý. Khi lưu sẽ thêm 1 dòng vào lịch sử thay đổi.")],
      vi="Sửa"),
    V("013", "AW_AGCY_003", "編集を破棄する確認", "/ops/agency/agencies/AG00021/edit", [
        it("1", "破棄の確認", ".modal", "modal", "show", "入力を変えてから「キャンセル」を押すと確認 Q02。破棄すると詳細に戻る。", err=["Q02"], pattern="P-FORM",
           vi="Xác nhận hủy chỉnh sửa", dvi="Sau khi đã đổi nội dung nhập mà bấm 「キャンセル」 thì hiện xác nhận Q02. Nếu hủy bỏ sẽ quay về màn chi tiết.")],
      setup="const n=document.querySelector('#f-note');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(n,'変更');n.dispatchEvent(new Event('input',{bubbles:true}));await sleep(200);clickText('.ph button','キャンセル');await sleep(400);",
      vi="Xác nhận hủy chỉnh sửa"),
]
