# -*- coding: utf-8 -*-
"""
画面設計書のデータ：運営管理者Web「お気に入り集計」（AW_FAVO_001）。一覧・絞り込み・CSV出力だけ（保存・削除の操作なし）。
元は本物の Web（app/ops/sales/favorites）。決定は docs/決定台帳.md F 節（2026-10-07「お気に入り件数の数え方」「購入管理・お気に入り集計の細かい点」ほか）。
洗い出し：docs/05_画面設計書/確認メモ_AW_運営E_請求・購入.md Part 3 B（Q-F1〜F4・宿題 H-F1〜F6・open OF1・OF2。2026-10-08 に回答済み）。
データは日本語だけ（vi と ex の説明は翻訳の段階で入れる）。
"""

TITLE = ["お気に入り集計（AW_FAVO）", "Tổng hợp yêu thích (AW_FAVO)"]
SHEET = ["お気に入り集計", "Tổng hợp yêu thích"]
BASENAME = "画面設計書_AW_FAVO_お気に入り集計"
IMG_PREFIX = "AW_FAVO"
OUT_DIR = "AW_FAVO_お気に入り集計"
CODE_NOTE = ["画面コード規約：AW＝Admin Web、FAVO＝お気に入り集計。1 URL（/ops/sales/favorites）＝1画面（状態は番号にしない）", "Quy ước mã màn hình: AW = Admin Web, FAVO = Tổng hợp yêu thích. 1 URL (/ops/sales/favorites) = 1 màn hình (trạng thái không đánh số)"]
SITE = "ops"
SYSTEM = {"ja": "運営管理者Web", "vi": "Web quản trị vận hành"}
AUTHOR = "Claude（cloud）／確認：hong"
CREATED = "2026-10-07"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "ops", "loginId": "Ad00010"}
CODE_PATHS = ["app/ops/sales/favorites", "app/ops/_general/list", "lib/ops/general", "lib/domain/seed"]

DECISIONS = [
    {"date": "2026-10-07", "target": "AW_FAVO_001 全体", "q": ["お気に入り件数の数え方（対象のユーザーと「いつの数」か）（Q-F1）", "Cách đếm số lượt yêu thích (đối tượng người dùng nào và số của thời điểm nào) (Q-F1)"],
     "a": ["有効なアプリ会員だけを数える（退会・利用停止・連携解除は除く。ESQR・ゲストは対象外）。値は現在のスナップショット（期間なし）", "Chỉ đếm hội viên app đang hoạt động (loại trừ đã rút lui, bị tạm ngừng, đã hủy liên kết; ESQR và khách không thuộc đối tượng). Giá trị là ảnh chụp hiện tại (không theo kỳ)"], "src": "hong 回答 2026-10-07（提案どおり）、決定台帳 F"},
    {"date": "2026-10-07", "target": "AW_FAVO_001 No.1", "q": ["検索条件の確定（法人・拠点で絞れないことを含む）（Q-F2）", "Chốt điều kiện tìm kiếm (gồm việc không lọc được theo công ty / chi nhánh) (Q-F2)"],
     "a": ["カテゴリ・前回登場年月・商品名・性別・年代。法人・拠点では絞らない（集計が商品ごと）", "Danh mục, tháng xuất hiện gần nhất, tên sản phẩm, giới tính, độ tuổi. Không lọc theo công ty / chi nhánh (vì tổng hợp theo từng sản phẩm)"], "src": "hong 回答 2026-10-07（提案どおり）、決定台帳 F"},
    {"date": "2026-10-07", "target": "AW_FAVO_001 No.1.8・3.2", "q": ["初期の並びと商品名のリンク（Q-F3）", "Thứ tự ban đầu và link của tên sản phẩm (Q-F3)"],
     "a": ["初期の並びは合計件数の降順。商品名は商品マスタ詳細へのリンク（レビューと同じ規則）", "Thứ tự ban đầu là tổng số lượt giảm dần. Tên sản phẩm là link đến chi tiết master sản phẩm (cùng quy tắc với đánh giá)"], "src": "hong 回答 2026-10-07（提案どおり）、決定台帳 F"},
    {"date": "2026-10-07", "target": "AW_FAVO_001 No.2.1・6", "q": ["CSV出力の列（Q-F4）", "Các cột của xuất CSV (Q-F4)"],
     "a": ["画面の列だけ（性別・年代で絞ったときは絞った後の数）。内部の値は出さない。ファイル名・記録に条件を出す", "Chỉ các cột trên màn hình (khi lọc theo giới tính / độ tuổi thì là số sau khi lọc). Không xuất giá trị nội bộ. Điều kiện được ghi ở tên file và bản ghi"], "src": "hong 回答 2026-10-07（提案どおり）、決定台帳 F"},
]
CHANGES = []
HIDE_ALWAYS = [".demo-note"]
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [
    {"code": "AW_FAVO_001", "ja": "お気に入り集計", "vi": "Tổng hợp yêu thích"},
]

H = (
    "const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));"
    "const setv=(el,v)=>{if(!el)return;Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}));};"
    "const setsel=(el,v)=>{if(!el)return;Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(el,v);el.dispatchEvent(new Event('change',{bubbles:true}));};"
    "const btn=(t,root)=>[...(root||document).querySelectorAll('button')].find(b=>(b.textContent||'').trim().includes(t));"
    "const tick=(g,t)=>{const l=[...document.querySelectorAll('[role=group][aria-label='+g+'] label')].find(x=>x.textContent.includes(t));if(l)l.querySelector('input').click();};"
    "const go=async()=>{document.querySelector('.es-search__main button[type=submit]').click();await sleep(600);};"
)

SEARCH = '.es-search__fields '


def X(no, ja, vi, sel, kind, trig="view", **kw):
    d = {"no": no, "ja": ja, "vi": vi, "sel": sel, "kind": kind, "trig": trig}
    d.update(kw)
    return d


def D(ja, vi=""):
    return [ja, vi]


# ---- 1 検索条件
L_SEARCH = [
    X("1", "検索条件", "Điều kiện tìm kiếm", ".es-search", "area", pattern="P-LIST",
      detail=D("条件はカテゴリ・前回登場年月・商品名・性別・年代の5つ。「検索」か Enter で反映する。法人・拠点では絞らず、法人・拠点別の集計も作らない（集計が商品ごとで、拠点の区別がないため。フェーズ1 のまま。hong 2026-10-07 Q-F2＝A、2026-10-08 回答）。", "Có 5 điều kiện: danh mục, tháng xuất hiện gần nhất, tên sản phẩm, giới tính, độ tuổi. Áp dụng khi nhấn 「検索」 hoặc Enter. Không lọc theo công ty / chi nhánh và cũng không làm tổng hợp theo công ty / chi nhánh (vì tổng hợp theo từng sản phẩm, không phân biệt chi nhánh; giữ nguyên như giai đoạn 1. hong 2026-10-07 Q-F2＝A, trả lời 2026-10-08)."),
      demo_ok=D("コードは条件を変えると「未適用」の印を出す。台帳（P-LIST）は印を出さない（hong 2026-10-05）。表示件数はメモリだけで覚えているが、P-PAGESIZE は人ごと・一覧ごとに覚える（宿題 H-F2）", "Code hiện hiển thị dấu 「未適用」 khi đổi điều kiện. Sổ quyết định (P-LIST) không hiện dấu này (hong 2026-10-05). Số dòng hiển thị hiện chỉ nhớ trong bộ nhớ, nhưng P-PAGESIZE quy định nhớ theo từng người, từng danh sách (bài tập H-F2)")),
    X("1.1", "カテゴリ", "Danh mục", SEARCH + "select[aria-label=カテゴリ]", "select", "select", req="－", len="選択", init=D("カテゴリ", "Danh mục"),
      ex=["主食", "Danh mục sản phẩm (ví dụ: món chính)"], detail=D("選択肢は商品マスタのカテゴリ（一覧の行の値から作る・五十音順）。", "Các lựa chọn là danh mục của master sản phẩm (tạo từ giá trị các dòng của danh sách, theo thứ tự bảng chữ cái tiếng Nhật).")),
    X("1.2", "前回登場年月", "Tháng xuất hiện gần nhất", SEARCH + "select[aria-label=前回登場年月]", "select", "select", req="－", len="選択（yyyy-mm）", init=D("前回登場年月", "Tháng xuất hiện gần nhất"),
      ex=["2026-10", "Tháng xuất hiện gần nhất, dạng yyyy-mm"], detail=D("選択肢は一覧にある年月。「—」（まだ登場していない）は選択肢に出さない。", "Các lựa chọn là các năm tháng có trong danh sách. 「—」 (chưa xuất hiện) không đưa vào lựa chọn."),
      demo_ok=D("コードの年月の書式は「2026年10月」。台帳 M-1（日付）の yyyy-mm に直す（宿題 H-F1）", "Code hiện định dạng năm tháng là 「2026年10月」. Sửa thành yyyy-mm theo sổ quyết định M-1 (ngày) (bài tập H-F1)")),
    X("1.3", "商品名", "Tên sản phẩm", SEARCH + "input[placeholder=商品名]", "text", "input", req="－", len="文字列 60", err=["E04", "E13"],
      ex=["親子丼", "Một phần tên sản phẩm (khớp một phần) (ví dụ: Oyakodon)"], detail=D("商品名の部分一致。前後の空白は取り、全角の英数字は半角に直して検索する。60字を超えたら切り詰めずに E04、絵文字・制御文字は E13（入力欄の下に出し、検索しない）。", "Khớp một phần với tên sản phẩm. Bỏ khoảng trắng ở đầu và cuối, đổi chữ và số toàn-giác sang bán-giác rồi tìm kiếm. Quá 60 ký tự thì hiện E04 mà không cắt bớt; emoji và ký tự điều khiển thì hiện E13 (hiện dưới ô nhập, không tìm kiếm).")),
    X("1.4", "性別", "Giới tính", SEARCH + "[role=group][aria-label=性別]", "check", "check", req="－", len=["複数選択（男性・女性）", "Chọn nhiều (nam / nữ)"], init=D("すべて外れている（＝男性・女性とも数える）", "Bỏ chọn hết (= đếm cả nam và nữ)"),
      ex=["女性", "Giới tính được chọn (ví dụ: nữ)"],
      detail=D("複数選べる。選んだ性別のユーザーだけで、行の件数（合計件数・男性・女性・年代別）を数え直す。「検索」で反映する。", "Chọn được nhiều. Chỉ tính người dùng có giới tính đã chọn để đếm lại số lượt của dòng (tổng số lượt, nam, nữ, theo độ tuổi). Áp dụng khi nhấn 「検索」."),
      cond=D("アプリ会員の性別に「回答しない」の選択肢はあるが（hong 2026-10-08）、この画面にその列・絞り込みは足さない（フェーズ1のまま）。合計件数は男性＋女性より多くなることがある。", "Giới tính của hội viên app có lựa chọn 「回答しない」 (hong 2026-10-08) nhưng màn hình này không thêm cột / bộ lọc cho nó (giữ Phase 1). Tổng số lượt có thể lớn hơn nam + nữ.")),
    X("1.5", "年代", "Độ tuổi", SEARCH + "[role=group][aria-label=年代]", "check", "check", req="－", len=["複数選択（10代・20代・30代・40代・50代・60代以上）", "Chọn nhiều (10 / 20 / 30 / 40 / 50 tuổi, từ 60 tuổi)"], init=D("すべて外れている（＝全年代を数える）", "Bỏ chọn hết (= đếm tất cả độ tuổi)"),
      ex=["30代", "Độ tuổi được chọn (ví dụ: 30 tuổi)"],
      detail=D("複数選べる。選んだ年代のユーザーだけで件数を数え直す。性別と両方選ぶと、その両方に合う人数になる。「検索」で反映する。", "Chọn được nhiều. Chỉ tính người dùng thuộc độ tuổi đã chọn để đếm lại số lượt. Nếu chọn cả giới tính thì là số người thỏa cả hai. Áp dụng khi nhấn 「検索」.")),
    X("1.6", "クリア", "Xóa điều kiện", ".es-search__main button::クリア", "button", "click", detail=D("条件と並べ替えを初期に戻す（件数も絞り込み前の数に戻る）。", "Đưa điều kiện và sắp xếp về ban đầu (số lượt cũng trở về số trước khi lọc).")),
    X("1.7", "検索", "Tìm kiếm", ".es-search__main button[type=submit]", "button", "click", detail=D("条件を反映し、1ページ目へ。性別・年代があるときは件数を数え直す。", "Áp dụng điều kiện và về trang 1. Khi có giới tính / độ tuổi thì đếm lại số lượt.")),
    X("1.8", "並べ替え（項目）", "Sắp xếp (cột)", "select[aria-label=並べ替えの項目]", "select", "select", req="－", len=["選択（一覧の全列）", "Chọn (tất cả các cột của danh sách)"], init=D("合計件数", "Tổng số lượt"),
      ex=["男性", "Cột sắp xếp (ví dụ: nam)"], detail=D("選ぶとすぐ並び替える（条件はそのまま）。一覧の全列で並べ替えられる。初期の並びは合計件数の降順（人気の確認が目的。hong 2026-10-07 Q-F3＝A）。", "Khi chọn sẽ sắp xếp ngay (giữ nguyên điều kiện). Sắp xếp được theo tất cả các cột của danh sách. Thứ tự ban đầu là tổng số lượt giảm dần (mục đích là xem độ phổ biến. hong 2026-10-07 Q-F3＝A).")),
    X("1.9", "昇順／降順", "Tăng dần / giảm dần", ".es-search__extra .sortdir", "button", "click", init=D("降順", "Giảm dần"), detail=D("押すたびに昇順と降順が入れ替わる。", "Mỗi lần nhấn sẽ đổi qua lại giữa tăng dần và giảm dần.")),
]
# ---- 2 ヘッダー
L_HEAD = [
    X("2", "ヘッダー", "Đầu trang", ".ph", "area",
      detail=D("パンくず：購入管理 ＞ お気に入り集計。", "Breadcrumb: 購入管理 (Quản lý mua hàng) ＞ お気に入り集計 (Tổng hợp yêu thích).")),
    X("2.1", "CSV出力", "Xuất CSV", ".ph .btns button::CSV出力", "button", "click", pattern="P-CSV-OUT", err=["S12", "E32"],
      cond=D("売上管理の権限（R 以上。倉庫スタッフは画面そのものがない）", "Quyền quản lý doanh thu (từ R trở lên; nhân viên kho không có màn hình này)"),
      detail=D("いま画面にある列だけを、検索条件のとおり全件出す（一覧と同じ数）。性別・年代で絞ったときは絞った後の数。列は No.6。ファイル名と出力の記録に、条件（カテゴリ・前回登場年月・商品名・性別・年代）を出す。終わったら S12。権限がないときは E32（ボタンは出さない。サーバーも止める）。", "Xuất toàn bộ dữ liệu theo điều kiện tìm kiếm, chỉ gồm các cột đang có trên màn hình (cùng số dòng với danh sách). Khi lọc theo giới tính / độ tuổi thì là số sau khi lọc. Các cột xem No.6. Điều kiện (danh mục, tháng xuất hiện gần nhất, tên sản phẩm, giới tính, độ tuổi) được ghi ở tên file và bản ghi xuất. Xong thì hiện S12. Khi không có quyền thì E32 (không hiện nút; server cũng chặn)."),
      demo_ok=D("コードは画面の列に加えて共通データの全項目（合計・男性・女性・年代・性別×年代の内訳）を右に足し、これらは絞り込み前の数になる。性別・年代の条件はファイル名・記録にも渡していない。決定（画面の列だけ・条件をファイル名と記録に出す）に直す（宿題 H-F5・Q-F4＝A）", "Code hiện thêm vào bên phải toàn bộ mục của dữ liệu chung (tổng, nam, nữ, độ tuổi, chi tiết giới tính × độ tuổi) ngoài các cột trên màn hình, và các cột này là số trước khi lọc. Điều kiện giới tính / độ tuổi cũng chưa được truyền vào tên file và bản ghi. Sửa theo quyết định (chỉ các cột trên màn hình; ghi điều kiện ở tên file và bản ghi) (bài tập H-F5, Q-F4＝A)")),
]
# ---- 3 一覧
L_TABLE = [
    X("3", "一覧の表", "Bảng danh sách", ".tbl", "table", pattern="P-LIST",
      detail=D("1行＝1商品（お気に入りが1件以上ある商品）。初期の並びは合計件数の降順。1ページ 10件（10／20／50）。件数の数え方は No.5。", "1 dòng = 1 sản phẩm (sản phẩm có từ 1 lượt yêu thích trở lên). Thứ tự ban đầu là tổng số lượt giảm dần. 10 dòng / trang (10 / 20 / 50). Cách đếm số lượt xem No.5.")),
    X("3.1", "品番", "Mã sản phẩm", ".tbl th::品番", "label", detail=D("商品の品番（M＋6桁）。", "Mã sản phẩm (M + 6 chữ số).")),
    X("3.2", "商品名", "Tên sản phẩm", ".tbl th::商品名", "link", "click",
      detail=D("押すと商品マスタ詳細へ（レビューと同じ規則。hong 2026-10-07 Q-F3＝A）。", "Nhấn để chuyển đến chi tiết master sản phẩm (cùng quy tắc với đánh giá. hong 2026-10-07 Q-F3＝A)."),
      demo_ok=D("コードは「商品の詳細は…」というトーストを出すだけで移動しない。商品マスタ詳細へ移動し、トースト（直書き）は外す（宿題 H-F4）", "Code hiện chỉ hiện toast 「商品の詳細は…」 mà không chuyển trang. Sửa để chuyển đến chi tiết master sản phẩm và bỏ toast (viết cứng) (bài tập H-F4)")),
    X("3.3", "前回登場年月", "Tháng xuất hiện gần nhất", ".tbl th::前回登場年月", "label", detail=D("月間メニューに載った直近の月（yyyy-mm。今のサイクル月まで）。まだ登場していない商品は「—」。", "Tháng gần nhất sản phẩm có trong menu tháng (yyyy-mm; đến tháng chu kỳ hiện tại). Sản phẩm chưa xuất hiện hiển thị 「—」."),
      demo_ok=D("コードの書式は「2026年10月」。yyyy-mm に直す（宿題 H-F1）", "Code hiện định dạng 「2026年10月」. Sửa thành yyyy-mm (bài tập H-F1)")),
    X("3.4", "登場回数", "Số lần xuất hiện", ".tbl th::登場回数", "label", detail=D("月間メニューに載った回数。まだ登場していない商品は 0。右寄せ。", "Số lần sản phẩm có trong menu tháng. Sản phẩm chưa xuất hiện là 0. Căn phải.")),
    X("3.5", "カテゴリ", "Danh mục", ".tbl th::カテゴリ", "label", detail=D("商品マスタのカテゴリ。", "Danh mục của master sản phẩm.")),
    X("3.6", "合計件数", "Tổng số lượt", ".tbl th::合計件数", "label", detail=D("その商品をお気に入りにしている有効なアプリ会員の数（会員の性別・年代に「回答しない」があるため、男性＋女性や年代別の合計より多くなることがある。「回答しない」の列・絞り込みは足さない。No.1.4）。単位は件。性別・年代で絞ると、その条件に合う分だけ数え直す。右寄せ。", "Số hội viên app đang hoạt động đã yêu thích sản phẩm đó (vì giới tính / độ tuổi của hội viên có lựa chọn 「回答しない」 nên có thể lớn hơn tổng nam + nữ hoặc tổng các độ tuổi; không thêm cột / bộ lọc 「回答しない」, xem No.1.4). Đơn vị là lượt (件). Khi lọc theo giới tính / độ tuổi thì đếm lại chỉ phần phù hợp điều kiện. Căn phải.")),
    X("3.7", "男性", "Nam", ".tbl th::男性", "label", detail=D("お気に入りにしている男性の会員の数。右寄せ。", "Số hội viên nam đã yêu thích. Căn phải.")),
    X("3.8", "女性", "Nữ", ".tbl th::女性", "label", detail=D("お気に入りにしている女性の会員の数。右寄せ。", "Số hội viên nữ đã yêu thích. Căn phải.")),
    X("3.9", "10代", "10 tuổi", ".tbl th::10代", "label", detail=D("10代の会員の数（性別を問わない）。右寄せ。", "Số hội viên 10 tuổi (không phân biệt giới tính). Căn phải.")),
    X("3.10", "20代", "20 tuổi", ".tbl th::20代", "label", detail=D("20代の会員の数（性別を問わない）。右寄せ。", "Số hội viên 20 tuổi (không phân biệt giới tính). Căn phải.")),
    X("3.11", "30代", "30 tuổi", ".tbl th::30代", "label", detail=D("30代の会員の数（性別を問わない）。右寄せ。", "Số hội viên 30 tuổi (không phân biệt giới tính). Căn phải.")),
    X("3.12", "40代", "40 tuổi", ".tbl th::40代", "label", detail=D("40代の会員の数（性別を問わない）。右寄せ。", "Số hội viên 40 tuổi (không phân biệt giới tính). Căn phải.")),
    X("3.13", "50代", "50 tuổi", ".tbl th::50代", "label", detail=D("50代の会員の数（性別を問わない）。右寄せ。", "Số hội viên 50 tuổi (không phân biệt giới tính). Căn phải.")),
    X("3.14", "60代以上", "Từ 60 tuổi", ".tbl th::60代以上", "label", detail=D("60代以上の会員の数（性別を問わない）。右寄せ。", "Số hội viên từ 60 tuổi (không phân biệt giới tính). Căn phải.")),
    X("3.15", "0件の表示", "Hiển thị 0 dòng", ".tbl td.empty", "label", "show", err=["I01"],
      demo_ok=D("コードの文言「条件に一致するデータがありません。…」を I01 に揃える（共通の一覧部品。宿題 H-F4）", "Thống nhất nội dung trong code 「条件に一致するデータがありません。…」 theo I01 (thành phần danh sách chung; bài tập H-F4)")),
    X("4", "ページ送り", "Phân trang", ".pager", "area", pattern="P-PAGESIZE",
      detail=D("「n件中 a–b件」・前へ・番号・次へ・表示件数（10／20／50）。表示件数は人ごと・一覧ごとに覚える。", "「n件中 a–b件」 (a–b trong n), Trước, số trang, Sau, số dòng hiển thị (10 / 20 / 50). Số dòng hiển thị được nhớ theo từng người, từng danh sách.")),
]
# ---- 5 注記・6 CSV
L_NOTE = [
    X("5", "画面下の注記", "Chú thích cuối màn hình", ".card > p.muted", "label",
      detail=D("「お気に入り件数は、アプリでその商品をお気に入りにしているユーザーの数（性別・年代はユーザーの登録情報）。」を出す。数えるのは有効なアプリ会員だけ（退会・利用停止・連携解除は除く。ESQR・ゲストは対象外）。現在の数（期間なし）で、毎日の集計。", "Hiển thị câu 「お気に入り件数は、アプリでその商品をお気に入りにしているユーザーの数（性別・年代はユーザーの登録情報）。」. Chỉ đếm hội viên app đang hoạt động (loại trừ đã rút lui, bị tạm ngừng, đã hủy liên kết; ESQR và khách không thuộc đối tượng). Là số hiện tại (không theo kỳ), tổng hợp hằng ngày."),
      demo_ok=D("コードは「数はデモの値。」を DEMO のときだけ足す。本番には出さない（台帳 K DR-7・8）", "Code chỉ thêm câu 「数はデモの値。」 khi ở DEMO. Không hiển thị ở môi trường thật (sổ quyết định K DR-7, 8)")),
]
L_CSV = [
    X("6", "CSVの列", "Các cột CSV", "-", "area", pattern="P-CSV-OUT",
      detail=D("画面の列だけを出す（絞り込み前の合計や性別×年代の内訳は出さない）。1行＝1商品。年月は yyyy-mm。", "Chỉ xuất các cột trên màn hình (không xuất tổng trước khi lọc hay chi tiết giới tính × độ tuổi). 1 dòng = 1 sản phẩm. Năm tháng dạng yyyy-mm.")),
    X("6.1", "CSV列：品番・商品名・前回登場年月・登場回数・カテゴリ", "Cột CSV: mã sản phẩm, tên sản phẩm, tháng xuất hiện gần nhất, số lần xuất hiện, danh mục", "-", "label", detail=D("画面の No.3.1〜3.5 と同じ値。前回登場年月がないときは空欄にする。", "Cùng giá trị với No.3.1〜3.5 trên màn hình. Khi không có tháng xuất hiện gần nhất thì để trống.")),
    X("6.2", "CSV列：合計件数・男性・女性", "Cột CSV: tổng số lượt, nam, nữ", "-", "label", detail=D("画面の No.3.6〜3.8 と同じ値（性別・年代で絞ったときは絞った後の数）。", "Cùng giá trị với No.3.6〜3.8 trên màn hình (khi lọc theo giới tính / độ tuổi thì là số sau khi lọc).")),
    X("6.3", "CSV列：10代〜60代以上", "Cột CSV: 10 tuổi đến từ 60 tuổi", "-", "label", detail=D("画面の No.3.9〜3.14 の6列と同じ値。", "Cùng giá trị với 6 cột No.3.9〜3.14 trên màn hình.")),
    X("6.4", "ファイル名と記録", "Tên file và bản ghi", "-", "label", pattern="P-CSV-OUT",
      detail=D("ファイル名・出力の記録に、検索条件（カテゴリ・前回登場年月・商品名・性別・年代）を出す。例：お気に入り集計_女性_30代_20261007_1530.csv", "Ghi điều kiện tìm kiếm (danh mục, tháng xuất hiện gần nhất, tên sản phẩm, giới tính, độ tuổi) vào tên file và bản ghi xuất. Ví dụ: お気に入り集計_女性_30代_20261007_1530.csv"),
      demo_ok=D("コードは性別・年代を条件として渡していない。渡す（宿題 H-F5）", "Code chưa truyền giới tính / độ tuổi làm điều kiện. Sửa để truyền (bài tập H-F5)")),
]
NO_PERM = [
    X("7", "権限なしの画面", "Màn hình không có quyền", ".notice", "area", "show", err=["E32"],
      detail=D("売上管理の権限がない役割（倉庫スタッフ）が開いたとき。共通の「この画面を見る権限がありません」の枠だけを出し、一覧・CSV出力は出さない。メニューにも出さない。", "Khi vai trò không có quyền quản lý doanh thu (nhân viên kho) mở màn hình. Chỉ hiện khung chung 「この画面を見る権限がありません」 (không có quyền xem màn hình này), không hiện danh sách và xuất CSV. Cũng không hiện trên menu."),
      demo_ok=D("共通の枠の文言はコード直書き。E32 の言い方に揃える（共通部品）", "Nội dung khung chung đang viết cứng trong code. Thống nhất theo cách nói của E32 (thành phần chung)")),
]


def V(id, ja, vi, items, setup="", note=None, login=None, full=True, wait=600, url="/ops/sales/favorites"):
    v = {"id": id, "code": "AW_FAVO_001", "state": [ja, vi], "url": url, "setup": (H + setup) if setup else "", "full": full, "wait": wait,
         "note": note or ["", ""], "items": items}
    if login:
        v["login"] = login
    return v


VIEWS = [
    V("001", "初期表示（8商品・合計件数の降順）", "Hiển thị ban đầu (8 sản phẩm, tổng số lượt giảm dần)",
      L_SEARCH + L_HEAD + L_TABLE[:15] + [L_TABLE[16]] + L_NOTE + L_CSV,
      note=D("見本は8商品（M001 245・M002 213・M003 197・M005 185・M007 160・M027 142・M023 121・M021 92）。合計件数の降順。", "Mẫu gồm 8 sản phẩm (M001 245, M002 213, M003 197, M005 185, M007 160, M027 142, M023 121, M021 92). Tổng số lượt giảm dần.")),
    V("002", "性別で絞る（女性）→検索", "Lọc theo giới tính (nữ) → tìm kiếm", [L_SEARCH[4], L_SEARCH[7], L_TABLE[6], L_TABLE[8]],
      setup="tick('性別','女性');await go();",
      note=D("女性だけで数え直した件数になる（男性は 0、合計件数＝女性）。", "Số lượt được đếm lại chỉ với nữ (nam là 0, tổng số lượt = nữ).")),
    V("003", "年代で絞る（30代・40代）→検索", "Lọc theo độ tuổi (30 và 40 tuổi) → tìm kiếm", [L_SEARCH[5], L_TABLE[12], L_TABLE[13], L_TABLE[6]],
      setup="tick('年代','30代');tick('年代','40代');await go();",
      note=D("30代・40代だけで数え直す。他の年代の列は 0。", "Đếm lại chỉ với 30 và 40 tuổi. Các cột độ tuổi khác là 0.")),
    V("004", "性別×年代の両方で絞る（女性・30代）→検索", "Lọc cả giới tính × độ tuổi (nữ, 30 tuổi) → tìm kiếm", [L_SEARCH[4], L_SEARCH[5], L_SEARCH[7], L_TABLE[6]],
      setup="tick('性別','女性');tick('年代','30代');await go();",
      note=D("両方に合う人数だけになる。", "Chỉ còn số người thỏa cả hai điều kiện.")),
    V("005", "カテゴリ・前回登場年月・商品名で絞る", "Lọc theo danh mục, tháng xuất hiện gần nhất, tên sản phẩm", [L_SEARCH[1], L_SEARCH[2], L_SEARCH[3], L_SEARCH[7]],
      setup="setsel(document.querySelector('select[aria-label=カテゴリ]'),'主食');await sleep(300);await go();",
      note=D("見本はカテゴリ「主食」で絞った状態（前回登場年月・商品名も同じ「検索」で反映）。", "Mẫu là trạng thái đã lọc theo danh mục 「主食」 (món chính) (tháng xuất hiện gần nhất và tên sản phẩm cũng áp dụng bằng cùng nút 「検索」).")),
    V("006", "前回登場年月が「—」・登場回数 0（親子丼）", "Tháng xuất hiện gần nhất là 「—」, số lần xuất hiện 0 (Oyakodon)", [L_TABLE[3], L_TABLE[4]],
      note=D("M027 親子丼は12月メニューの新商品で、まだ登場していない（前回登場年月＝「—」、登場回数＝0）。初期表示の行。", "M027 Oyakodon là sản phẩm mới của menu tháng 12, chưa xuất hiện (tháng xuất hiện gần nhất = 「—」, số lần xuất hiện = 0). Là dòng của hiển thị ban đầu.")),
    V("007", "0件（商品名 zzz）", "0 dòng (tên sản phẩm zzz)", [L_SEARCH[3], L_SEARCH[7], L_TABLE[15]],
      setup="setv(document.querySelector('input[placeholder=商品名]'),'zzz');await go();",
      note=D("I01 を表の中に出す。", "Hiển thị I01 trong bảng.")),
    V("008", "並べ替え（男性の降順）", "Sắp xếp (nam giảm dần)", [L_SEARCH[8], L_SEARCH[9], L_TABLE[0]],
      setup="setsel(document.querySelector('select[aria-label=並べ替えの項目]'),'m');await sleep(500);",
      note=D("項目を選ぶとすぐ並び替わる。ボタンで昇順と降順を入れ替える。", "Chọn cột thì sắp xếp ngay. Dùng nút để đổi qua lại giữa tăng dần và giảm dần.")),
    V("009", "CSV出力（絞り込みあり・なし）", "Xuất CSV (có lọc / không lọc)", [L_HEAD[1], L_CSV[0], L_CSV[1], L_CSV[2], L_CSV[3], L_CSV[4]],
      setup="tick('性別','女性');tick('年代','30代');await go();const b=btn('CSV出力');if(b){b.click();await sleep(600);}",
      note=D("画面は性別・年代で絞った後に CSV出力 を押した状態（S12 のトースト）。絞り込みなしの出力は同じ操作で、ファイル名に条件が入らない。ファイルの中身は画面に出ないので項目定義のみ。", "Màn hình ở trạng thái đã nhấn 「CSV出力」 sau khi lọc theo giới tính / độ tuổi (toast S12). Xuất không lọc dùng cùng thao tác, điều kiện không vào tên file. Nội dung file không hiện trên màn hình nên chỉ có định nghĩa mục.")),
    V("010", "参照のみ（全役割 R・CSV出力あり）", "Chỉ tham chiếu (mọi vai trò R, có xuất CSV)", [L_HEAD[1]],
      login="Ad00002",
      note=D("CS（Ad00002）・経理（Ad00012）・閲覧のみ（Ad00013）は同じ画面（1状態で代表）。CSV出力は出る。フル権限・システム管理は CRUD だが、この画面に作成・更新の操作はないので見え方は同じ。", "CS (Ad00002), Kế toán (Ad00012), Chỉ xem (Ad00013) có cùng màn hình (đại diện bằng 1 trạng thái). Có hiển thị xuất CSV. Toàn quyền và Quản trị hệ thống là CRUD, nhưng màn hình này không có thao tác tạo / cập nhật nên hiển thị giống nhau.")),
    V("011", "権限なし（倉庫スタッフ）", "Không có quyền (nhân viên kho)", NO_PERM, login="Ad00021",
      note=D("倉庫スタッフ（Ad00021）は売上管理の権限がなく、共通の枠を出す。", "Nhân viên kho (Ad00021) không có quyền quản lý doanh thu nên hiện khung chung.")),
    V("012", "11商品以上のページ送り（10件／20／50）", "Phân trang từ 11 sản phẩm trở lên (10 / 20 / 50 dòng)", [L_TABLE[16]],
      note=D("【撮影不可】seed が8商品だけでページ送りが出ない。再現するには FAVORITE_STATS を11件以上に増やす。sel は想定で、撮影しない（番号は項目定義にだけ出る）。", "【Không chụp được】 Seed chỉ có 8 sản phẩm nên không hiện phân trang. Để tái hiện cần tăng FAVORITE_STATS lên từ 11 dòng. sel là giả định, không chụp (số chỉ xuất hiện trong định nghĩa mục)."),
      setup=""),
]
