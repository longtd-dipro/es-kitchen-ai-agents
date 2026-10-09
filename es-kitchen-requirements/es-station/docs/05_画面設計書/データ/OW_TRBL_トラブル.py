# -*- coding: utf-8 -*-
"""
委託配送先Web「トラブル」（OW_TRBL）の画面設計書データ。
元：本物の Web（app/carrier/troubles/page.tsx・lib/carrier/fromDomain.ts の troubleViews）。
決定：docs/決定台帳.md F・K（一覧の標準・未適用の印は出さない・0件は I01）、確認メモ_TW_委託配送先 §3（H-1〜H-5・H-15・H-35）。
コードがまだ決定に追いついていないところは demo_ok。決定（台帳 S・2026-10-08）：#433 委託配送先Web からもトラブルを報告できる（報告フォーム OW_TRBL_002 を足す。項目・写真の決まり P-PHOTO はドライバーアプリ DA_RPTD と同じ）・一覧に「運営の対応・完了日時」の列。
見本データで撮れない状態（自動報告の行・複数ページ）は demo_ok に理由を書く。
"""

TITLE = ["トラブル（OW_TRBL）", "Sự cố (OW_TRBL)"]
SHEET = ["トラブル", "Sự cố"]
BASENAME = "画面設計書_OW_TRBL_トラブル"
IMG_PREFIX = "OW_TRBL"
OUT_DIR = "委託配送先Web"
CODE_NOTE = ["Screen Code は台帳 F（2026-10-07）の決まり：OW_<機能略>_<3桁>。委託配送先＝OW", "Screen Code theo 台帳 F (2026-10-07): OW_<機能略>_<3 chữ số>. 委託配送先 = OW"]
SITE = "carrier"
SYSTEM = {"ja": "委託配送先Web", "vi": "Web đối tác giao hàng (委託配送先Web)"}
AUTHOR = "Claude／確認：hong"
CREATED = "2026-10-07"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "carrier", "loginId": "DE00001"}
CODE_PATHS = ["app/carrier", "lib/carrier", "lib/domain/seed"]

DECISIONS = [
    {"date": "2026-10-07", "target": "OW_TRBL 全体",
     "q": ["Screen Code の頭文字", "Tiền tố Screen Code"],
     "a": ["OW（委託配送先Web）", "OW (委託配送先Web)"], "src": "hong 回答 2026-10-07（台帳 F・受付簿 No.290）"},
    {"date": "2026-10-08", "target": "OW_TRBL_001 No.1.2・OW_TRBL_002 全体",
     "q": ["トラブル画面は参照のみか、委託配送先も報告できるか（確認表 H-19）", "Màn Sự cố chỉ xem hay đối tác cũng báo cáo được (bảng xác nhận H-19)"],
     "a": ["委託配送先Web からもトラブルを報告できる（報告フォーム OW_TRBL_002 を足す）。一覧の列（運営の対応・完了日時）は案どおり。報告項目と写真の決まり（P-PHOTO）はドライバーアプリの報告（DA_RPTD）と同じ", "Web đối tác giao hàng cũng báo cáo được sự cố (thêm form báo cáo OW_TRBL_002). Cột của danh sách (cách xử lý của 運営・ngày giờ hoàn tất) theo đề xuất. Mục báo cáo và quy tắc ảnh (P-PHOTO) giống báo cáo của ứng dụng tài xế (DA_RPTD)"],
     "src": "hong 回答 2026-10-08（台帳 S「トラブル画面（OW）」・受付簿 #433）。置き換えた旧案：参照のみ・報告のフォームは置かない（Claude 推奨 Q-15）"},
    {"date": "2026-10-07", "target": "OW_TRBL_001 No.3・4",
     "q": ["一覧の初期の並び・ページ送り・並べ替え", "Thứ tự mặc định, phân trang, sắp xếp của danh sách"],
     "a": ["受付日時の降順。1ページ 10件（10／20／50／100）。全列で並べ替え。検索条件の枠は es-search で「未適用」の印は出さない", "Giờ tiếp nhận giảm dần. 10 dòng/trang (10／20／50／100). Sắp xếp mọi cột. Khung điều kiện dùng es-search, không hiện dấu 「未適用」"],
     "src": "台帳 F・K（確認メモ H-1〜H-4。初期の並びは台帳 E「一覧の初期の並び」＝更新日時の降順の読み替え）"},
    {"date": "2026-10-07", "target": "OW_TRBL_001 No.4.6・4.9",
     "q": ["トラブルの種類・場面と写真の枚数", "Loại sự cố, cảnh và số ảnh"],
     "a": ["場面は荷物受取時と配達時に分かれる。写真は任意（最低は不要）・最大20枚（ドライバーアプリの報告と同じ：DA_RPTD No.5）。運営の対応と完了日時は一覧にも出す", "Cảnh chia thành lúc nhận hàng và lúc giao hàng. Ảnh không bắt buộc, tối đa 20 (giống báo cáo ở ứng dụng tài xế: DA_RPTD No.5). Cách xử lý của 運営 và ngày giờ hoàn tất cũng hiện ở danh sách"],
     "src": "確認メモ_TW H-35（決定済み：配送_06 §12-2）。運営の対応・完了日時の列は確認メモ §1-4 の状態 005 に合わせた Claude の案"},
]
CHANGES = []

HIDE_ALWAYS = [".es-demo-bar", "#es-review"]
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [{"code": "OW_TRBL_001", "ja": "トラブル一覧", "vi": "Danh sách sự cố"}, {"code": "OW_TRBL_002", "ja": "トラブル報告", "vi": "Báo cáo sự cố"}]

def I(no, ja, vi, sel, kind="label", trig="view", **kw):
    d = {"no": no, "ja": ja, "vi": vi, "sel": sel, "kind": kind, "trig": trig}
    d.update(kw)
    return d

def V(id, code, ja, vi, url, items, note=None, **kw):
    d = {"id": id, "code": code, "state": [ja, vi], "url": url, "setup": "", "full": True, "wait": 600, "note": note or ["", ""], "items": items}
    d.update(kw)
    return d

H = ("const wait=(ms)=>new Promise(r=>setTimeout(r,ms));"
     "const setv=(el,v)=>{const p=Object.getPrototypeOf(el);Object.getOwnPropertyDescriptor(p,'value').set.call(el,v);el.dispatchEvent(new Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}));};")
SUBMIT = "document.querySelector('.search-row .btn.pri').click();await wait(400);"

L1 = [
    I("1", "見出し", "Tiêu đề trang", ".crumb", "area", detail=["パンくず「ホーム ／ トラブル」。", "Breadcrumb 「ホーム ／ トラブル」."]),
    I("1.1", "画面名", "Tên màn hình", "h1.ptitle", "label", detail=["画面名は「トラブル」。委託配送先Web からも報告できる（No.1.2）。ドライバーアプリ・運営の代理登録で報告されたものも、この一覧に出る。", "Tên màn hình là 「トラブル」. Web đối tác cũng báo cáo được (No.1.2). Sự cố báo cáo qua ứng dụng tài xế hoặc do 運営 đăng ký hộ cũng hiện trong danh sách này."]),
    I("1.2", "トラブルを報告", "Báo cáo sự cố", "-", "button", "click",
      detail=["見出しの右。トラブル報告（OW_TRBL_002）を開く（台帳 S・受付簿 #433）。", "Bên phải tiêu đề. Mở màn báo cáo sự cố (OW_TRBL_002) (台帳 S・受付簿 #433)."],
      demo_ok=["コードにトラブルの報告フォームがない（一覧は参照のみ）。画面とボタンを足すのは宿題", "Code chưa có form báo cáo sự cố (danh sách chỉ xem). Việc thêm màn hình và nút còn tồn"]),
    I("2", "対応中の警告", "Cảnh báo đang xử lý", ".alert", "area", err=["W302"],
      detail=["対応中のトラブルが1件でもあるときだけ、一覧の上に出す（W302：件数）。検索条件に関係なく、自社の対応中の全件を数える。対応は運営が決め、決まると「解決済」になる。",
              "Chỉ hiện phía trên danh sách khi có ít nhất 1 sự cố đang xử lý (W302: số lượng). Đếm toàn bộ sự cố đang xử lý của công ty bất kể điều kiện tìm kiếm. 運営 quyết định cách xử lý, quyết xong chuyển 「解決済」."],
      demo_ok=["コードの文言は「対応中のトラブルが n件あります。対応は運営（ESキッチン）が決めます。決まると「解決済」になります。」で W302 と言い回しが少し違う（確認メモ H-17）。W302 に揃えるのは宿題", "Câu trong code là 「対応中のトラブルが n件あります。…」 hơi khác W302 (確認メモ H-17). Việc đồng nhất về W302 còn tồn"]),
    I("3", "検索条件", "Điều kiện tìm kiếm", ".search-row", "area", pattern="P-LIST",
      detail=["検索条件の枠は es-search。「検索」か Enter で反映する。「未適用」の印は出さない。初期の期間は今日のサイクル（月曜始まりの4週）。",
              "Khung điều kiện dùng es-search. Áp dụng khi nhấn 「検索」 hoặc Enter. Không hiện dấu 「未適用」. Khoảng thời gian mặc định là chu kỳ hôm nay (4 tuần bắt đầu từ thứ Hai)."],
      demo_ok=["コードは独自の検索行（es-search の部品ではない）で、「未適用」の印は出さない（確認メモ H-1・H-2）。部品を es-search にそろえるのは宿題", "Code dùng hàng tìm kiếm riêng (không phải thành phần es-search), không hiện dấu 「未適用」 (確認メモ H-1・H-2). Việc đưa về es-search còn tồn"]),
    I("3.1", "受付日（開始日）", "Ngày tiếp nhận (từ ngày)", "input[aria-label=\"開始日\"]", "date", "input", req="－", len="日付（yyyy-mm-dd）",
      init=["今日のサイクルの初日", "Ngày đầu của chu kỳ hôm nay"], ex=["2026-09-14", "Ngày bắt đầu khoảng thời gian tiếp nhận"],
      detail=["受付日がこの日以降のトラブルを出す。空なら下限なし。", "Hiện sự cố có ngày tiếp nhận từ ngày này. Để trống thì không giới hạn dưới."], err=["E08"]),
    I("3.2", "受付日（終了日）", "Ngày tiếp nhận (đến ngày)", "input[aria-label=\"終了日\"]", "date", "input", req="－", len="日付（yyyy-mm-dd）",
      init=["今日のサイクルの最終日", "Ngày cuối của chu kỳ hôm nay"], ex=["2026-10-11", "Ngày kết thúc khoảng thời gian tiếp nhận"],
      detail=["受付日がこの日以前のトラブルを出す。開始日より前の日は E08。", "Hiện sự cố có ngày tiếp nhận đến ngày này. Ngày trước ngày bắt đầu: E08."], err=["E08"]),
    I("3.3", "対応状況", "Tình trạng xử lý", "select[aria-label=\"対応状況\"]", "select", "select", req="－", len="選択",
      init=["指定なし", "Không chỉ định"], ex=["対応中", "Chọn 対応中 hoặc 解決済み"], detail=["選択肢：対応中・解決済み。", "Lựa chọn: 対応中・解決済み."]),
    I("3.4", "種類", "Loại", "select[aria-label=\"種類\"]", "select", "select", req="－", len="選択",
      init=["指定なし", "Không chỉ định"], ex=["遅延", "Chọn một loại sự cố"],
      detail=["選択肢は、運営のトラブルの種類のマスタの区分と同じ名前：数量相違・誤配送・破損・品質不良・不在・受け取り不可・遅延・その他（確認メモ H-35）。「数量相違」は陳列（検品）の差異・未配送など自動で報告されるトラブルの区分でもあるので、一覧の自動報告の行もこの選択肢で絞れる。ドライバーアプリで選ぶ報告の分類（箱数不足・商品不足・交通渋滞・事故など）は、運営が解決するときにこの区分に付ける（付くまでは区分が付いていない行として出る）。",
              "Lựa chọn trùng tên với các phân loại trong master loại sự cố của 運営: 数量相違・誤配送・破損・品質不良・不在・受け取り不可・遅延・その他 (確認メモ H-35). 「数量相違」 cũng là phân loại của sự cố tự động (sai lệch trưng bày/kiểm hàng, chưa giao được) nên lọc được cả các dòng tự động. Phân loại tài xế chọn trên app (thiếu thùng, thiếu hàng, kẹt xe, tai nạn...) sẽ được 運営 gán vào các phân loại này khi xử lý (trước đó là dòng chưa được gán phân loại)."]),
    I("3.5", "クリア", "Xóa điều kiện", ".search-row .btn.out", "button", "click", detail=["検索条件を初期値に戻して再検索する。", "Đưa điều kiện về mặc định và tìm lại."]),
    I("3.6", "検索", "Tìm kiếm", ".search-row .btn.pri", "button", "click", detail=["条件を一覧に反映して1ページ目に戻す。Enter でも同じ。", "Áp dụng điều kiện vào danh sách và quay về trang 1. Nhấn Enter cũng giống vậy."]),
    I("4", "トラブルの一覧", "Danh sách sự cố", ".tbl", "table", pattern="P-LIST", err=["I01"],
      detail=["自社の区間を含む配送のトラブル。1ページ 10件（10／20／50／100）。初期の並びは受付日時の降順。列見出しを押して全列で並べ替える。行を押すと、その配送の配送詳細のトラブルのタブ（OW_DELV_002）を開く。詳細から戻ると条件・ページ・件数を戻す。0件は I01。",
              "Sự cố của các chuyến có chặng thuộc công ty mình. 10 dòng/trang (10／20／50／100). Mặc định giờ tiếp nhận giảm dần. Bấm tiêu đề cột để sắp xếp mọi cột. Bấm dòng để mở tab sự cố của chi tiết giao hàng đó (OW_DELV_002). Quay lại từ chi tiết thì khôi phục điều kiện, trang, số dòng. 0 dòng: I01."],
      demo_ok=["コードの一覧は並べ替え・ページ送りがなく（「n件中 1–n件」の見本）、0件の文言は「条件に一致するトラブルはありません。」（確認メモ H-3・H-4・H-15）。宿題", "Danh sách trong code chưa có sắp xếp và phân trang (mẫu 「n件中 1–n件」), câu 0 dòng là 「条件に一致するトラブルはありません。」 (確認メモ H-3・H-4・H-15). Việc còn tồn"]),
    I("4.1", "No", "STT", ".tbl th::No", "label", detail=["通し番号。", "Số thứ tự."]),
    I("4.2", "受付日時", "Giờ tiếp nhận", ".tbl th::受付日時", "label", detail=["報告された日時（yyyy-mm-dd HH:MM）。", "Ngày giờ được báo cáo (yyyy-mm-dd HH:MM)."]),
    I("4.3", "配送No", "Số giao hàng", ".tbl th::配送No", "link", "click", detail=["トラブルのあった配送のNo。行を押すと配送詳細のトラブルのタブへ。自社の配送でなければ開かない。", "Số của chuyến xảy ra sự cố. Bấm dòng để mở tab sự cố của chi tiết giao hàng. Không mở nếu không phải chuyến của công ty mình."]),
    I("4.4", "届け先", "Nơi giao", ".tbl th::届け先", "label", detail=["届け先の拠点名。", "Tên 拠点 nơi giao."]),
    I("4.5", "種類", "Loại", ".tbl th::種類", "label", detail=["トラブルの種類（運営のマスタ）。", "Loại sự cố (master của 運営)."]),
    I("4.6", "内容", "Nội dung", ".tbl th::内容", "label",
      detail=["配送スタッフ（または委託配送先Web から報告した人）が書いた内容。場面（荷物受取時／配達時）と写真（任意・最大20枚）も、この行から配送詳細で見る。陳列（検品）の差異・未配送は自動で報告され、報告者は「自動」。",
              "Nội dung do nhân viên giao hàng (hoặc người báo cáo từ Web đối tác) viết. Cảnh (lúc nhận hàng／lúc giao) và ảnh (không bắt buộc, tối đa 20) xem ở chi tiết giao hàng từ dòng này. Sai lệch trưng bày (kiểm hàng) và chưa giao được báo cáo tự động, người báo cáo là 「自動」."]),
    I("4.7", "報告者（配送スタッフ）", "Người báo cáo (nhân viên giao hàng)", ".tbl th::報告者", "label", detail=["配送スタッフの名前とID。自動報告は「自動」。委託配送先Web から報告したものの書き方は決まっていない（open）。", "Tên và ID nhân viên giao hàng. Báo cáo tự động ghi 「自動」. Cách ghi với báo cáo từ Web đối tác chưa quyết (open)."],
      open=["委託配送先Web から報告したとき、報告者の欄に何を出すか（委託配送先名か、報告する人の選択か）が決まっていない。hong に確認する", "Chưa quyết cột người báo cáo hiện gì khi báo cáo từ Web đối tác (tên đối tác hay chọn người báo cáo). Cần hỏi hong"], ask="hong"),
    I("4.8", "対応状況", "Tình trạng xử lý", ".tbl th::対応状況", "label", detail=["「対応中」（黄）か「解決済」（緑）のバッジ。運営が解決すると替わる。", "Badge 「対応中」 (vàng) hoặc 「解決済」 (xanh lá). Đổi khi 運営 giải quyết xong."]),
    I("4.9", "運営の対応・完了日時", "Cách xử lý của 運営, ngày giờ hoàn tất", "-", "label",
      detail=["運営が決めた対応（全数を納品して解決・一部納品で解決・再配送で解決・配送を中止して解決 など）と完了日時。対応中は「運営（ESキッチン）が対応を決めます」。", "Cách xử lý do 運営 quyết định (giao đủ để giải quyết, giao một phần, giao lại, hủy chuyến …) và ngày giờ hoàn tất. Đang xử lý thì 「運営（ESキッチン）が対応を決めます」."],
      demo_ok=["コードの一覧にこの列はなく、配送詳細のトラブルのタブにだけ出す（確認メモ §1-4）。一覧にも出すのは宿題", "Danh sách trong code chưa có cột này, chỉ hiện ở tab sự cố của chi tiết giao hàng (確認メモ §1-4). Việc hiện cả ở danh sách còn tồn"]),
    I("5", "ページ送り", "Phân trang", ".pager", "area", pattern="P-LIST", detail=["「n件中 a–b件」・ページ番号・表示件数（10／20／50／100）。", "「n件中 a–b件」, số trang, số dòng hiển thị (10／20／50／100)."],
      demo_ok=["コードは「n件中 1-n件」だけでページ送りと表示件数がない（確認メモ H-3）。宿題", "Code chỉ có 「n件中 1-n件」, chưa có phân trang và số dòng hiển thị (確認メモ H-3). Việc còn tồn"]),
    I("6", "注記", "Ghi chú", ".panel > p.hint", "label",
      detail=["配送スタッフがドライバーアプリから、または委託配送先Web から報告したトラブルであること、種類（荷物受取時／配達時）、陳列（検品）の差異・未配送は自動で報告されること、行を押すと配送詳細（トラブル）を開くこと、対応は運営が決めること、初期の期間は今日のサイクルであること。",
              "Giải thích: sự cố do nhân viên giao hàng báo cáo từ ứng dụng tài xế hoặc từ Web đối tác, các loại (lúc nhận hàng／lúc giao), sai lệch trưng bày (kiểm hàng) và chưa giao được báo cáo tự động, bấm dòng để mở chi tiết giao hàng (sự cố), 運営 quyết định cách xử lý, khoảng thời gian mặc định là chu kỳ hôm nay."]),
]
L2 = [
    I("7", "条件を変えた表示", "Hiển thị khi đổi điều kiện", ".tbl", "table", pattern="P-LIST",
      detail=["受付日・対応状況・種類のすべてに合うトラブルだけを出す。警告（No.2）の件数は変わらない。", "Chỉ hiện sự cố khớp với cả ngày tiếp nhận, tình trạng xử lý và loại. Số lượng ở cảnh báo (No.2) không đổi."]),
]
L3 = [
    I("8", "0件のとき", "Khi 0 dòng", "td.empty", "label", err=["I01"],
      detail=["I01「表示するデータがありません。」を一覧の中に出す。", "Hiện I01 「表示するデータがありません。」 trong danh sách."]),
]
L4 = [
    I("9", "自動報告の行", "Dòng báo cáo tự động", "-", "label",
      detail=["陳列（検品）の差異・未配送は、配送スタッフの報告がなくてもシステムが自動で報告する。報告者の欄は「自動」。種類は「数量相違」「未配送」。", "Sai lệch trưng bày (kiểm hàng) và chưa giao được hệ thống tự báo cáo dù nhân viên không báo. Cột người báo cáo ghi 「自動」. Loại là 「数量相違」「未配送」."],
      demo_ok=["見本データの栄成ロジ・みどり便・山本配送には自動報告のトラブルがなく、コードも報告者を「自動」と出さない（確認メモ §1-4）", "Dữ liệu mẫu của 栄成ロジ・みどり便・山本配送 không có sự cố tự động và code cũng không ghi người báo cáo là 「自動」 (確認メモ §1-4)"]),
]
L5 = [
    I("10", "解決済みの行", "Dòng đã giải quyết", ".tbl tbody tr", "link", "click",
      detail=["対応状況が緑の「解決済」。運営の対応（例：一部納品で解決（不足は再配送））と完了日時（yyyy-mm-dd HH:MM）は配送詳細のトラブルのタブで見る。", "Tình trạng xử lý là 「解決済」 màu xanh lá. Cách xử lý của 運営 (ví dụ: giao một phần để giải quyết (phần thiếu giao lại)) và giờ hoàn tất (yyyy-mm-dd HH:MM) xem ở tab sự cố của chi tiết giao hàng."]),
]
L6 = [
    I("11", "配送詳細（トラブルのタブ）へ", "Tới chi tiết giao hàng (tab sự cố)", ".tabs button.on", "tab", "click",
      detail=["行を押すと、その配送の配送詳細（OW_DELV_002）のトラブルのタブを開く。キーボードは行にフォーカスして Enter。", "Bấm dòng sẽ mở tab sự cố của chi tiết giao hàng đó (OW_DELV_002). Bàn phím: focus vào dòng rồi nhấn Enter."]),
]

# ------------------------------------------------------------------ 報告フォーム（OW_TRBL_002）
# 項目・写真の決まりはドライバーアプリの報告（DA_RPTD_002）と同じ。台帳 S・受付簿 #433。コードにはまだ画面がないため、撮影の見本は一覧と同じ画面
NOFORM = {"demo_ok": ["コードにトラブルの報告フォームがない。画面を足すのは宿題", "Code chưa có form báo cáo sự cố. Việc thêm màn hình còn tồn"]}
F1 = [
    I("12", "見出し", "Tiêu đề trang", "-", "area",
      detail=["パンくず「ホーム ／ トラブル ／ トラブル報告」。画面名は「トラブル報告」。見出しの右に「キャンセル」「送信」。", "Breadcrumb 「ホーム ／ トラブル ／ トラブル報告」. Tên màn là 「トラブル報告」. Bên phải tiêu đề có 「キャンセル」「送信」."], **NOFORM),
    I("12.1", "キャンセル", "Hủy", "-", "button", "click", err=["Q02"], detail=["トラブル一覧（OW_TRBL_001）へ戻る。入力を変えていたら Q02。", "Về danh sách sự cố (OW_TRBL_001). Đã sửa thì hiện Q02."]),
    I("12.2", "送信", "Gửi", "-", "button", "click", pattern="P-FORM", err=["Q315", "Q316", "S315", "S316"],
      detail=["入力をまとめてチェックして、問題がなければ確認（Q315）を出す。同じ対象・同じ種類の未解決の報告があれば追記の確認（Q316）を出す（不足のトラブルは1件：台帳 E）。押したら二重に押せなくする。報告は運営（ESキッチン）に届き、取消・再配送などの対応は運営が行う。",
              "Kiểm tra gộp nội dung nhập, nếu ổn thì hiện xác nhận (Q315). Nếu đã có báo cáo chưa giải quyết cùng đối tượng・cùng loại thì hiện xác nhận bổ sung (Q316) (sự cố thiếu hàng chỉ 1 mục: 台帳 E). Khóa nút sau khi bấm. Báo cáo gửi đến 運営 (ES Kitchen), việc hủy・giao lại do 運営 xử lý."]),
    I("13", "説明", "Hướng dẫn", "-", "label",
      detail=["「※影響を受けた受取地点または納品先を選択してください。※複数の拠点でトラブルが発生している場合は、拠点ごとに登録してください。※報告は運営（ESキッチン）に届きます。」。ドライバーアプリの報告（DA_RPTD_001 No.3）と同じ。",
              "「※影響を受けた受取地点または納品先を選択してください。※複数の拠点でトラブルが発生している場合は、拠点ごとに登録してください。※報告は運営（ESキッチン）に届きます。」. Giống báo cáo ở ứng dụng tài xế (DA_RPTD_001 No.3)."]),
    I("14", "場面", "Cảnh", "-", "radio", "select", req="○", len=["選択（2つ）", "Chọn (2 lựa chọn)"], init=["未選択", "Chưa chọn"], ex=["配達時のトラブル", "Chọn 荷物受取時のトラブル hoặc 配達時のトラブル"], err=["E02"],
      detail=["「荷物受取時のトラブル」（受取地点＝倉庫・中継先）か「配達時のトラブル」（配送＝納品先）。選ぶと、対象（No.15）とトラブル内容（No.17）の選択肢が変わる。", "Chọn 「荷物受取時のトラブル」 (điểm nhận = kho・trung chuyển) hoặc 「配達時のトラブル」 (đơn giao = nơi nhận). Chọn xong thì lựa chọn của đối tượng (No.15) và nội dung sự cố (No.17) đổi theo."]),
    I("15", "対象（受取地点・配送）", "Đối tượng (điểm nhận・đơn giao)", "-", "select", "select", req="○", len="選択", init=["未選択", "Chưa chọn"], ex=["DL-261005-0001　ひかり物産 川崎", "Chọn điểm nhận hoặc đơn giao (số giao hàng・tên 拠点 nơi giao)"], err=["E02"],
      detail=["場面が「荷物受取時」なら受取地点（倉庫・中継先）、「配達時」なら自社が運ぶ区間の配送（配送No・届け先拠点名）から1つ選ぶ。複数の拠点で起きたトラブルは拠点ごとに報告する。",
              "Nếu cảnh là 「荷物受取時」 thì chọn 1 điểm nhận (kho・trung chuyển), nếu 「配達時」 thì chọn 1 đơn giao thuộc chặng công ty mình chạy (số giao hàng・tên 拠点 nơi giao). Sự cố xảy ra ở nhiều 拠点 thì báo cáo riêng từng 拠点."],
      open=["報告できる対象の範囲（今日の分だけか、過去の配送も選べるか。完了済みの配送を選べるか：ドライバーアプリは完了前の配送・今日の受取地点だけ）が決まっていない。hong に確認する", "Chưa quyết phạm vi đối tượng báo cáo được (chỉ hôm nay hay chọn được cả chuyến quá khứ; chọn được chuyến đã hoàn tất không: ứng dụng tài xế chỉ chuyến chưa hoàn tất・điểm nhận hôm nay). Cần hỏi hong"], ask="hong"),
    I("16", "影響を受けた送り状番号", "Số phiếu gửi bị ảnh hưởng", "-", "check", "check", req="条件付き", len=["選択（複数）", "Chọn (nhiều mục)"], init=["オフ", "Tắt"], ex=["オン", "Bật"],
      cond=["トラブル内容が箱数不足・誤配送・荷物破損・商品不足・誤配送のとき必須", "Bắt buộc khi nội dung là 箱数不足・誤配送・荷物破損・商品不足・誤配送"], err=["E02"],
      detail=["対象の箱（送り状番号）の一覧から、影響を受けたものにチェックする。見出しのチェックで全部を選ぶ／外す。必須の内容で1つも選ばなければ、項目の下に E02 を出す。", "Check các thùng (số phiếu gửi) bị ảnh hưởng trong danh sách thùng của đối tượng. Check ở tiêu đề để chọn/bỏ tất cả. Nội dung bắt buộc mà không chọn thùng nào thì hiện E02 dưới mục."]),
    I("17", "トラブル内容", "Nội dung sự cố", "-", "radio", "select", req="○", len=["選択（4つ）", "Chọn (4 lựa chọn)"], init=["未選択", "Chưa chọn"], ex=["箱数不足", "箱数不足 (thiếu thùng)"], err=["E02"],
      detail=["荷物受取時：箱数不足／誤配送／荷物破損／その他。配達時：商品不足・誤配送／交通渋滞・事故／不在・連絡不可／その他。1つだけ選ぶ（ドライバーアプリの報告と同じ選択肢）。運営の6区分へは固定表で読み替える（商品不足・誤配送は運営が区分を付ける：台帳 M-4）。",
              "Lúc nhận hàng: 箱数不足／誤配送／荷物破損／その他. Lúc giao: 商品不足・誤配送／交通渋滞・事故／不在・連絡不可／その他. Chọn đúng 1 (cùng lựa chọn với báo cáo ở ứng dụng tài xế). Đổi sang 6 phân loại của 運営 bằng bảng cố định (商品不足・誤配送 do 運営 gắn phân loại: 台帳 M-4)."]),
    I("18", "写真", "Ảnh", "-", "file", "upload", pattern="P-PHOTO", req="－", len=["JPG・PNG・HEIC 1枚5MB 最大20枚", "JPG/PNG/HEIC, mỗi ảnh tối đa 5MB, tối đa 20 ảnh"], ex=["IMG_0456.jpg", "Ảnh chụp tình huống"], err=["E441"],
      detail=["状況の写真（任意・最低は不要）。パソコンやスマホから選ぶ（複数枚まとめて選べる）。最大20枚・JPG／PNG／HEIC・1枚5MB まで（P-PHOTO。ドライバーアプリの報告と同じ）。守れないときは E441。入れた写真は縮小して見せ、×で消せる。運営の配送詳細で見られ、12ヶ月保存する。",
              "Ảnh tình huống (không bắt buộc, không cần tối thiểu). Chọn từ máy tính hoặc điện thoại (chọn nhiều ảnh cùng lúc). Tối đa 20 ảnh・JPG/PNG/HEIC・mỗi ảnh tối đa 5MB (P-PHOTO; giống báo cáo ở ứng dụng tài xế). Vi phạm thì E441. Ảnh đã thêm hiện thu nhỏ, xóa được bằng ×. Xem được ở chi tiết giao hàng của 運営, lưu 12 tháng."],
      demo_ok=["コードにこの欄がない。画面を足すのは宿題", "Code chưa có mục này. Việc thêm màn hình còn tồn"]),
    I("19", "備考", "Ghi chú", "-", "textarea", "input", req="条件付き", len="文字列 500", init=["空", "Trống"], ex=["受付が不在で渡せなかった", "Không có người ở quầy nên không giao được"], err=["E01", "E04"],
      cond=["トラブル内容が「その他」のとき必須", "Bắt buộc khi nội dung là 「その他」"],
      detail=["状況の説明。「その他」のときは必須（見出しに「（必須）」）で、空なら E01。500文字まで。前後の空白は取る。入力欄は500文字の上限で止まり、それ以上は入らない。貼り付けで上限を超えたときだけ E04 を出す（台帳 S・受付簿 #446）。", "Mô tả tình huống. Bắt buộc khi chọn 「その他」 (tiêu đề có 「（必須）」), để trống thì E01. Tối đa 500 ký tự. Bỏ khoảng trắng đầu/cuối. Ô nhập bị chặn ở giới hạn 500 ký tự, không nhập thêm được. Chỉ khi dán vượt giới hạn mới hiện E04 (台帳 S・受付簿 #446)."], demo_ok=["入力欄の上限で止める動き（台帳 S・受付簿 #446）は宿題。", "Việc chặn nhập ở giới hạn của ô nhập (台帳 S・受付簿 #446) còn tồn."]),
]
F2 = [
    I("20", "入力エラー", "Lỗi nhập", "-", "label", err=["E01", "E02"],
      detail=["何も入れずに「送信」を押したら、場面・対象・トラブル内容に E02、必須の項目（送り状番号・備考）に E02／E01 を項目の下に出して赤枠にする（P-FORM）。最初のエラーの項目へスクロールする。", "Bấm 「送信」 khi chưa nhập gì thì hiện E02 dưới cảnh・đối tượng・nội dung sự cố, và E02／E01 dưới các mục bắt buộc (số phiếu gửi・ghi chú), tô viền đỏ (P-FORM). Cuộn tới mục lỗi đầu tiên."], **NOFORM),
]
F3 = [
    I("21", "送信の確認", "Xác nhận gửi", "-", "modal", err=["Q315"],
      detail=["Q315「この内容で報告を送信しますか？／報告は運営（ESキッチン）に届きます。取消・再配送などの対応は運営が行います。」。ボタンは「報告する」「キャンセル」。二度押しで二重に送らない。", "Q315 「この内容で報告を送信しますか？／報告は運営（ESキッチン）に届きます。取消・再配送などの対応は運営が行います。」. Nút 「報告する」「キャンセル」. Bấm 2 lần không gửi trùng."], **NOFORM),
    I("22", "報告済みへの追記", "Bổ sung vào báo cáo đã gửi", "-", "modal", err=["Q316"],
      detail=["同じ対象・同じ種類の未解決の報告があるとき、Q316「報告済みです。追記しますか？」。追記すると報告は増えず、既存のトラブルに内容を足して運営に送る。ボタンは「追記して送信」「キャンセル」。", "Khi có báo cáo chưa giải quyết cùng đối tượng・cùng loại thì Q316 「報告済みです。追記しますか？」. Bổ sung thì không tăng số báo cáo, thêm nội dung vào sự cố hiện có rồi gửi 運営. Nút 「追記して送信」「キャンセル」."], **NOFORM),
]
F4 = [
    I("23", "離脱の確認", "Xác nhận rời đi", "-", "modal", err=["Q02"], pattern="P-FORM",
      detail=["場面・対象・送り状番号・トラブル内容・写真・備考のどれかを入れたあと、キャンセル・別の画面への移動・再読み込みで Q02（キャンセル／破棄）を出す。", "Sau khi đã nhập cảnh・đối tượng・số phiếu gửi・nội dung sự cố・ảnh・ghi chú, hủy・chuyển màn・tải lại thì hiện Q02 (キャンセル／破棄)."], **NOFORM),
    I("24", "送信後", "Sau khi gửi", "-", "toast", "show", err=["S315", "S316"],
      detail=["送ったらトラブル一覧（OW_TRBL_001）へ戻り、S315「「{名前}」のトラブルを運営に報告しました。」（追記は S316「報告済みのトラブルに追記しました。」）を出す。報告したトラブルは一覧に、対応状況「対応中」で出る。", "Gửi xong về danh sách sự cố (OW_TRBL_001) và hiện S315 「「{名前}」のトラブルを運営に報告しました。」 (bổ sung: S316 「報告済みのトラブルに追記しました。」). Sự cố đã báo hiện trong danh sách với tình trạng 「対応中」."], **NOFORM),
]

VIEWS = [
    V("001", "OW_TRBL_001", "初期表示（今サイクルの期間・対応中バナー）", "Hiển thị ban đầu (khoảng thời gian chu kỳ này, dải đang xử lý)", "/carrier/troubles", L1,
      note=["栄成ロジ（DE00001）。デモの今日（2026-10-05）の9月サイクル（9/14〜10/11）。9/19 の遅延のトラブルが対応中。", "栄成ロジ (DE00001). Chu kỳ tháng 9 của 'hôm nay' (2026-10-05) là 9/14〜10/11. Sự cố trễ ngày 9/19 đang xử lý."]),
    V("002", "OW_TRBL_001", "条件変更（受付日・対応状況・種類）", "Đổi điều kiện (ngày tiếp nhận, tình trạng, loại)", "/carrier/troubles", L2,
      setup=H + "setv(document.querySelector('select[aria-label=\"種類\"]'),'遅延');await wait(200);" + SUBMIT, wait=500,
      note=["種類を「遅延」にして検索した状態。", "Đã chọn loại 「遅延」 và tìm."]),
    V("003", "OW_TRBL_001", "0件（I01）", "0 dòng (I01)", "/carrier/troubles", L3,
      setup=H + "setv(document.querySelector('select[aria-label=\"対応状況\"]'),'解決済');await wait(200);" + SUBMIT, wait=500,
      note=["対応状況を「解決済」にして検索した状態（栄成ロジに解決済みはない）。", "Đã chọn tình trạng 「解決済」 và tìm (栄成ロジ không có sự cố đã giải quyết)."]),
    V("004", "OW_TRBL_001", "自動報告の行（検品の差異・未配送）", "Dòng báo cáo tự động (sai lệch kiểm hàng, chưa giao)", "/carrier/troubles", L4,
      note=["見本データに自動報告がないため、初期表示と同じ画面。", "Dữ liệu mẫu không có báo cáo tự động nên màn hình giống ban đầu."]),
    V("005", "OW_TRBL_001", "解決済みの行（運営の対応・完了日時）", "Dòng đã giải quyết (xử lý của 運営, ngày giờ hoàn tất)", "/carrier/troubles", L5, login="DE00006",
      note=["みどり便（DE00006）。9/15 の数量相違のトラブルが解決済み。", "みどり便 (DE00006). Sự cố sai lệch số lượng ngày 9/15 đã giải quyết."]),
    V("006", "OW_TRBL_001", "行を押して配送詳細（トラブルタブ）へ", "Bấm dòng để tới chi tiết giao hàng (tab sự cố)", "/carrier/troubles", L6,
      setup=H + "document.querySelector('.tbl tbody tr').click();for(let i=0;i<40&&!document.querySelector('.tabs');i++){await wait(250);}await wait(400);", wait=500,
      note=["栄成ロジの行を押した直後。配送詳細（OW_DELV_002）のトラブルのタブが開く。", "Ngay sau khi bấm dòng của 栄成ロジ. Mở tab sự cố của chi tiết giao hàng (OW_DELV_002)."]),
    V("007", "OW_TRBL_002", "報告フォーム（初期）", "Form báo cáo (ban đầu)", "/carrier/troubles", F1,
      note=["委託配送先Web からの報告フォーム（台帳 S・受付簿 #433）。コードにまだ画面がないので、撮影の見本は一覧と同じ画面。項目・写真の決まりはドライバーアプリの報告（DA_RPTD_002）と同じ。", "Form báo cáo từ Web đối tác (台帳 S・受付簿 #433). Code chưa có màn hình nên ảnh mẫu giống màn danh sách. Mục nhập và quy tắc ảnh giống báo cáo ở ứng dụng tài xế (DA_RPTD_002)."]),
    V("008", "OW_TRBL_002", "入力エラー（何も入れずに送信）", "Lỗi nhập (gửi khi chưa nhập gì)", "/carrier/troubles", F2,
      note=["コードにまだ画面がない。", "Code chưa có màn hình."]),
    V("009", "OW_TRBL_002", "送信の確認・報告済みへの追記", "Xác nhận gửi・bổ sung vào báo cáo đã gửi", "/carrier/troubles", F3,
      note=["コードにまだ画面がない。", "Code chưa có màn hình."]),
    V("010", "OW_TRBL_002", "編集中に離れる（Q02）・送信後", "Rời khi đang nhập (Q02)・sau khi gửi", "/carrier/troubles", F4,
      note=["コードにまだ画面がない。", "Code chưa có màn hình."]),
]
