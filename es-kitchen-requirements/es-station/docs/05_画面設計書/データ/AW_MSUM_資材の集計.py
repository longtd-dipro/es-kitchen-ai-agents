# -*- coding: utf-8 -*-
"""
画面設計書のデータ：運営管理者Web「資材の集計」（AW_MSUM）。
元は本物の Web（app/ops/delivery/material-summary）。決定は docs/決定台帳.md「運営D 資材の集計」（確認メモ D-3b Q-MS1・2）・
「資材の注文」（OP000036 資材の追加配送・【仮】¥2,000／回）・受付簿 No.154・177。
コードとの違い（demo_ok）：出荷日の初期値（コードは 2026-10-06 固定）、説明文の「仮 1,000円」、0件の文言、CSV 完了の文言、お届け予定日の CSV の形。
"""

TITLE = ["資材の集計（AW_MSUM）※資材注文管理の『出荷日の集計』タブへ統合予定", "Tổng hợp vật tư (AW_MSUM) *dự kiến gộp vào tab 『出荷日の集計』 của 資材注文管理"]
SHEET = ["資材の集計", "Tổng hợp vật tư"]
BASENAME = "画面設計書_AW_MSUM_資材の集計"
IMG_PREFIX = "AW_MSUM"
OUT_DIR = "AW_MSUM_資材の集計"
CODE_NOTE = ["画面コード規約：AW＝Admin Web、MSUM＝資材の集計（Material Summary）", "Quy ước mã màn hình: AW = Admin Web, MSUM = Material Summary (tổng hợp vật tư)"]
SITE = "ops"
SYSTEM = {"ja": "運営管理者Web", "vi": "Web quản trị vận hành"}
AUTHOR = "Claude（cloud）／確認：hong"
CREATED = "2026-10-07"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "ops", "loginId": "Ad00010"}   # フル権限（ops.full・マスタ管理者・営業担当）
CODE_PATHS = ["app/ops/delivery/material-summary", "app/ops/delivery/_components", "lib/ops/areas/delivery.ts", "lib/ops/delivery", "lib/domain/seed"]

SRC = "hong 回答 2026-10-07（確認メモ_AW_運営D_配送）"

SRC3 = "hong 回答 2026-10-08（確認メモ_AW_運営D_配送 Stage B）"
SRC4 = "hong 回答 2026-10-08（HTML レビュー）"
DECISIONS = [
    {"date": "2026-10-08", "target": "AW_MSUM 全体（タイトル・No.1・パンくず・権限）",
     "q": ["資材の集計の目的と、資材注文管理に統合するか（HTML レビュー M-1）", "Mục đích 資材の集計 và có gộp vào 資材注文管理 không (review HTML M-1)"],
     "a": ["資材注文管理（運営B）の「出荷日の集計」タブに統合する。配送のメニューから外す。資材注文管理と出荷・配送管理のどちらかの閲覧権限があれば見える。この設計書は残し、運営B の資材注文管理の設計書を作るときに内容を移す", "Gộp vào tab 「出荷日の集計」 của 資材注文管理 (運営B). Bỏ khỏi menu 配送. Có quyền xem 資材注文管理 hoặc 出荷・配送管理 là xem được. Giữ tài liệu này, khi làm thiết kế 資材注文管理 sẽ chuyển nội dung sang"],
     "src": SRC4},
    {"date": "2026-10-08", "target": "AW_MSUM_001 No.4.1",
     "q": ["資材の合計の並び順（M1）", "Thứ tự dòng của bảng tổng vật tư (M1)"],
     "a": ["資材IDの昇順が既定。ほかの一覧と同じく並べ替えができる（項目＋昇順／降順。P-LIST の決まり）", "Mặc định 資材ID tăng dần; sắp xếp được như các danh sách khác (mục + tăng/giảm; quy tắc P-LIST)"],
     "src": SRC3},
    {"date": "2026-10-07", "target": "AW_MSUM_001 全体・No.6",
     "q": ["「ピッキング済」の印と送り状番号の入力口はどの画面か（Q-MS1）", "Dấu 「ピッキング済」 và nơi nhập số vận đơn nằm ở màn hình nào (Q-MS1)"],
     "a": ["B：資材の集計は閲覧・印刷・ヤマト送り状CSVだけ。「ピッキング済」の印は作らず、送り状番号の入力＝出荷済のまま（資材注文管理・受付簿 No.154）", "B: Màn 資材の集計 chỉ xem, in và xuất CSV vận đơn (ヤマト). Không tạo dấu 「ピッキング済」; nhập số vận đơn = đã xuất kho như cũ (資材注文管理, 受付簿 No.154)"], "src": SRC},
    {"date": "2026-10-07", "target": "AW_MSUM_001 No.3.1・3.3",
     "q": ["出荷日の初期値と選び方（Q-MS2）", "Giá trị ban đầu và cách chọn 出荷日 (Q-MS2)"],
     "a": ["A：初期値＝今日以降で最初の出荷日（なければ最後の日）、選択リストのまま。「クリア」も同じ初期値に戻す", "A: Giá trị ban đầu = ngày xuất kho đầu tiên từ hôm nay trở đi (không có thì ngày cuối cùng), vẫn chọn trong danh sách. 「クリア」 cũng về giá trị ban đầu này"], "src": SRC},
]
CHANGES = []
HIDE_ALWAYS = []
STATIC_CSS = ""
VIEWS_CSS = ""
VIEWER_CSS = ""

SCREENS = [
    {"code": "AW_MSUM_001", "ja": "資材の集計", "vi": "Tổng hợp vật tư"},
]

H = (
    "const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));"
    "const setd=async(v)=>{const s=document.querySelector('select[aria-label=出荷日]');"
    "Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(s,v);s.dispatchEvent(new Event('change',{bubbles:true}));await sleep(200);"
    "[...document.querySelectorAll('.card .btn.pri')].find(b=>b.textContent.trim()==='検索').click();await sleep(500);};"
)

DEMO_FIXED = ["コードは出荷日を 2026-10-06 に固定している（クリアも同じ）。決定どおり「今日以降で最初の出荷日（なければ最後の日）」に直す（デモの今日 2026-10-05 なら 2026-10-05）。この状態の画像は決定どおりの表示にするため、撮影時に 2026-10-05 を選んで検索している",
              "Code cố định 出荷日 = 2026-10-06 (クリア cũng vậy). Sửa theo quyết định: ngày xuất kho đầu tiên từ hôm nay trở đi (không có thì ngày cuối cùng); hôm nay demo là 2026-10-05 thì 2026-10-05. Ảnh chụp của trạng thái này chọn 2026-10-05 rồi bấm 検索 để khớp với quyết định"]

ITEMS = [
    {"no": "1", "ja": "ヘッダー", "vi": "Đầu trang", "sel": ".ph", "kind": "area", "trig": "view",
     "detail": ["資材注文管理の『出荷日の集計』タブへ統合予定（hong 2026-10-08）。運営B の資材注文管理の設計書を作るときにこの内容を移す。パンくず（統合後）：資材注文管理 ＞ 出荷日の集計（現行の画面は 配送管理 ＞ 資材の集計）。タイトル「資材の集計（ES事務所）」。見られるのは資材注文管理と出荷・配送管理のどちらかの閲覧権限がある役割。配送のメニューからは外す。資材は ES事務所でピッキングしてヤマト運輸で直送する（倉庫マスタ WH00004・THOMAS 連携なし）。この画面は閲覧・印刷・ヤマト送り状CSVだけで、「ピッキング済」の印は作らない（Q-MS1＝B）。",
                "Dự kiến gộp vào tab 『出荷日の集計』 của 資材注文管理 (hong 2026-10-08). Khi làm thiết kế 資材注文管理 (運営B) sẽ chuyển nội dung này sang. Breadcrumb (sau khi gộp): 資材注文管理 > 出荷日の集計 (màn hiện tại: 配送管理 > 資材の集計). Tiêu đề 「資材の集計（ES事務所）」. Vai trò có quyền xem 資材注文管理 hoặc 出荷・配送管理 đều xem được. Bỏ khỏi menu 配送. Vật tư được lấy hàng ở văn phòng ES rồi giao thẳng bằng ヤマト運輸 (kho WH00004, không liên kết THOMAS). Màn này chỉ xem, in và xuất CSV vận đơn ヤマト; không có dấu 「ピッキング済」 (Q-MS1 = B)."]},
    {"no": "1.1", "ja": "CSV出力", "vi": "Xuất CSV", "sel": ".ph .btns .btn.csv", "kind": "button", "trig": "click", "pattern": "P-CSV-OUT", "err": ["S12"],
     "detail": ["選んだ出荷日の資材の一覧を出す（1行＝配送の1資材）。列：配送No・拠点・出荷日・お届け予定日・資材ID・資材名・数（列の定義は No.7）。出力の条件は出荷日。完了は S12。CSV出力の権限は閲覧できる役割すべて。",
                "Xuất danh sách vật tư của ngày xuất kho đã chọn (1 dòng = 1 vật tư của 1 chuyến). Cột: 配送No, 拠点, 出荷日, お届け予定日, 資材ID, 資材名, 数 (định nghĩa cột ở No.7). Điều kiện xuất là 出荷日. Xong hiện S12. Quyền CSV出力: mọi vai trò xem được."]},
    {"no": "1.2", "ja": "送り状CSV（ヤマト）", "vi": "CSV vận đơn (ヤマト)", "sel": ".ph .btns button::送り状CSV", "kind": "button", "trig": "click", "err": ["S12"],
     "detail": ["選んだ出荷日の資材の配送すべての、資材の直送用のヤマト送り状CSVを出す（委託の引き取り便用の yamato_pickup_yyyymmdd.csv とは別ファイル。ファイル名 yamato_material_yyyymmdd.csv・4列・定義は No.7.8〜7.11）。ヤマトへの連携の形のまま（CSV入出力_定義：変更なし）。完了は S12。",
                "Xuất CSV vận đơn ヤマト cho giao thẳng vật tư, cho mọi chuyến vật tư của ngày xuất kho đã chọn (khác file yamato_pickup_yyyymmdd.csv của chuyến ủy thác đến nhận; tên file yamato_material_yyyymmdd.csv, 4 cột, định nghĩa ở No.7.8〜7.11). Giữ nguyên dạng liên kết với ヤマト (CSV入出力_定義: không đổi). Xong hiện S12."],
     "open": ["ヤマトの送り状CSVの列（宛名・記事欄・配達時間帯など）と文字コード（コードは4列・UTF-8 BOM。本番は Shift_JIS の予定）はヤマトの確認待ち", "Cột của CSV vận đơn ヤマト (tên người nhận, ô ghi chú, khung giờ giao...) và bảng mã (code hiện 4 cột, UTF-8 BOM; bản chính thức dự kiến Shift_JIS) đang chờ ヤマト xác nhận"],
     "ask": "お客様・ヤマト運輸",
     "demo_ok": ["コードは専用の文言「ヤマト運輸の送り状CSV（n件）を出力しました（デモ）」を出す。S12「CSVを出力しました（{n}行・{ファイル名}）。」に揃える", "Code hiện câu riêng 「ヤマト運輸の送り状CSV（n件）を出力しました（デモ）」. Đồng nhất về S12 「CSVを出力しました（{n}行・{ファイル名}）。」"]},
    {"no": "1.3", "ja": "印刷", "vi": "In", "sel": ".ph .btns button::印刷", "kind": "button", "trig": "click",
     "detail": ["ブラウザの印刷を開く（ES事務所のピッキング作業用）。資材の合計と配送ごとの中身の2つの表を印刷する。ピッキング済のチェックは印刷した表に手書きで行う（画面にチェック欄は作らない：Q-MS1＝B）。",
                "Mở chức năng in của trình duyệt (dùng cho việc lấy hàng ở văn phòng ES). In 2 bảng: tổng vật tư và nội dung từng chuyến. Việc đánh dấu đã lấy hàng làm tay trên bản in (không tạo ô check trên màn hình: Q-MS1 = B)."],
     "open": ["印刷の用紙（コードの説明文は A3・1ページに収まる表）は台帳・仕様に決定がない。用紙の大きさと印刷の要否をお客様に確認する（コードに @page の指定はない）", "Khổ giấy in (câu giải thích trong code ghi A3, bảng vừa 1 trang) chưa có quyết định trong sổ quyết định/đặc tả. Cần hỏi khách khổ giấy và có cần in không (code không có @page)"],
     "ask": "お客様（ES事務所）"},
    {"no": "2", "ja": "説明", "vi": "Giải thích", "sel": ".notice", "kind": "label", "trig": "show",
     "detail": ["資材は ES事務所でピッキングしてヤマト運輸で直送すること、出荷日ごとに資材の合計（ピッキングの数）と配送ごとの中身を出すこと、月の2回目以降の注文に資材の追加配送（OP000036）が付くことを書く。金額は【仮】¥2,000／回（台帳「資材の注文」。マスタの値を出し、文言に固定の金額を書かない）。",
                "Ghi: vật tư được lấy hàng ở văn phòng ES rồi giao thẳng bằng ヤマト運輸; theo từng ngày xuất kho hiển thị tổng vật tư (số lượng cần lấy) và nội dung từng chuyến; đơn từ lần thứ 2 trong tháng có thêm phí giao vật tư bổ sung (OP000036). Số tiền [tạm] 2.000 yên/lần (sổ quyết định 「資材の注文」; lấy giá trị từ master, không viết cứng số tiền trong câu)."],
     "open": ["資材の追加配送（OP000036）の金額は【仮】¥2,000／回。台帳「金額は客先確認」", "Số tiền phí giao vật tư bổ sung (OP000036) là [tạm] 2.000 yên/lần. Sổ quyết định ghi 「金額は客先確認」"],
     "ask": "お客様（営業）",
     "demo_ok": ["コードの説明文は「仮 1,000円」（古い値）と「A3」を固定で書いている。金額はマスタの値にし、「A3」は No.1.3 の確認が済むまで書かない", "Câu giải thích trong code ghi cứng 「仮 1,000円」 (giá trị cũ) và 「A3」. Số tiền lấy từ master; không ghi 「A3」 cho tới khi xong xác nhận ở No.1.3"]},
    {"no": "3", "ja": "検索エリア", "vi": "Khu vực tìm kiếm", "sel": ".card .fg", "kind": "area", "trig": "view",
     "detail": ["出荷日を選んで「検索」で表に反映する。「未適用」の印は出さない（P-LIST の決まり）。", "Chọn 出荷日 rồi bấm 「検索」 để áp dụng vào bảng. Không hiện dấu 「未適用」 (quy ước P-LIST)."]},
    {"no": "3.1", "ja": "出荷日", "vi": "Ngày xuất kho", "sel": "select[aria-label=出荷日]", "kind": "select", "trig": "select", "req": "－",
     "len": ["選択（資材の配送がある出荷日だけ）", "Chọn (chỉ các ngày xuất kho có chuyến vật tư)"],
     "init": ["今日以降で最初の出荷日（なければ最後の日）", "Ngày xuất kho đầu tiên từ hôm nay trở đi (không có thì ngày cuối cùng)"],
     "ex": ["2026-10-05（月）", "Ngày xuất kho 5/10/2026 (thứ Hai) trong danh sách các ngày có chuyến vật tư; hiển thị dạng yyyy-mm-dd（thứ）"],
     "detail": ["選択肢は資材の配送がある出荷日（昇順）。空の選択はない。選んだだけでは表は変わらず、「検索」で反映する。ここにない日は選べない（0件の日は出ない）。初期値は hong 決定（2026-10-07 Q-MS2＝A）。",
                "Lựa chọn là các ngày xuất kho có chuyến vật tư (tăng dần). Không có lựa chọn trống. Chọn xong bảng chưa đổi, bấm 「検索」 mới áp dụng. Ngày không có trong danh sách thì không chọn được (không có ngày 0 chuyến). Giá trị ban đầu theo quyết định của hong (2026-10-07 Q-MS2 = A)."],
     "demo_ok": DEMO_FIXED},
    {"no": "3.2", "ja": "ピッキング場所", "vi": "Nơi lấy hàng", "sel": "input.inp[disabled]", "kind": "text", "trig": "view", "req": "－",
     "len": ["固定の表示（入力できない）", "Hiển thị cố định (không nhập được)"],
     "init": ["WH00004 ES事務所（資材）", "WH00004 Văn phòng ES (vật tư)"],
     "ex": ["WH00004 ES事務所（資材）", "Nơi lấy vật tư: văn phòng ES (mã kho WH00004), luôn bị khóa, không sửa được"],
     "cond": ["常に入力不可", "Luôn bị khóa"],
     "detail": ["資材のピッキング場所。ES事務所（倉庫マスタ WH00004）で固定。", "Nơi lấy vật tư. Cố định là văn phòng ES (master kho WH00004)."]},
    {"no": "3.3", "ja": "クリア", "vi": "Xóa điều kiện", "sel": ".card .btn.out::クリア", "kind": "button", "trig": "click",
     "detail": ["出荷日を初期値（No.3.1）に戻し、表も戻す。", "Đưa 出荷日 về giá trị ban đầu (No.3.1) và bảng cũng quay lại."],
     "demo_ok": DEMO_FIXED},
    {"no": "3.4", "ja": "検索", "vi": "Tìm kiếm", "sel": ".card .btn.pri::検索", "kind": "button", "trig": "click",
     "detail": ["選んだ出荷日を表に反映する（Enter でも反映）。", "Áp dụng 出荷日 đã chọn vào bảng (Enter cũng áp dụng)."]},
    {"no": "4", "ja": "資材の合計", "vi": "Tổng vật tư", "sel": ".sec-h h2::資材の合計", "kind": "label", "trig": "view",
     "detail": ["見出し「資材の合計（n件の配送）」。n＝選んだ出荷日の資材の配送の件数。ES事務所のピッキングの数。", "Tiêu đề 「資材の合計（n件の配送）」. n = số chuyến vật tư của ngày xuất kho đã chọn. Là số lượng cần lấy ở văn phòng ES."]},
    {"no": "4.1", "ja": "資材の合計の表", "vi": "Bảng tổng vật tư", "sel": ".tbl::資材ID", "kind": "table", "trig": "view",
     "pattern": "P-LIST",
     "demo_ok": ["コードは配送の明細に出てきた順で並べる。資材IDの昇順を既定にし、並べ替えもできるようにする（hong 2026-10-08 M1）", "Code sắp theo thứ tự xuất hiện trong chi tiết chuyến. Cần mặc định 資材ID tăng dần và cho phép sắp xếp (hong 2026-10-08 M1)"],
     "detail": ["列：資材ID・資材名・合計数（右寄せ）・配送の件数（右寄せ）。並びは資材IDの昇順が既定で、ほかの一覧と同じく並べ替えができる（項目＋昇順／降順）。同じ資材は1行にまとめ、合計数＝選んだ出荷日の全配送の数の合計、配送の件数＝その資材を含む配送の数。",
                "Cột: 資材ID, 資材名, 合計数 (căn phải), 配送の件数 (căn phải). Mặc định xếp 資材ID tăng dần, sắp xếp được như các danh sách khác (mục + tăng/giảm). Cùng vật tư gộp 1 dòng; 合計数 = tổng số lượng của mọi chuyến trong ngày xuất kho đã chọn, 配送の件数 = số chuyến có vật tư đó."]},
    {"no": "4.2", "ja": "0件の表示", "vi": "Hiển thị 0 dòng", "sel": "-", "kind": "label", "trig": "show", "err": ["I01"],
     "detail": ["資材の配送が1件もないときだけ出す（出荷日の選択肢は資材の配送がある日だけなので、画面の操作では出ない）。I01 を表の中に出す。",
                "Chỉ hiện khi hoàn toàn không có chuyến vật tư nào (danh sách 出荷日 chỉ gồm ngày có chuyến vật tư nên thao tác trên màn hình không tạo ra trạng thái này). Hiện I01 trong bảng."],
     "demo_ok": ["コードは「この日の資材の配送はありません」と出す。I01 に揃える", "Code hiện 「この日の資材の配送はありません」. Đồng nhất về I01"]},
    {"no": "5", "ja": "配送ごとの中身", "vi": "Nội dung từng chuyến", "sel": ".sec-h h2::配送ごとの中身", "kind": "label", "trig": "view",
     "detail": ["見出し。選んだ出荷日の資材の配送を1行ずつ出す。", "Tiêu đề. Hiển thị từng chuyến vật tư của ngày xuất kho đã chọn, mỗi chuyến 1 dòng."]},
    {"no": "5.1", "ja": "配送ごとの表", "vi": "Bảng từng chuyến", "sel": ".tbl::料金（税抜）", "kind": "table", "trig": "view",
     "detail": ["並びは配送No順（出荷日が同じなので）。取消の資材注文の配送は出さない。0件の文言は No.4.2 と同じ。資材の配送データは注文を確定したたびに作り、同じ拠点・同じ納品日・出荷前なら1件にまとめる。表は画面の幅の中に収め、画面全体の横スクロールは出さない（はみ出すときは表の中だけ横スクロール）。長い拠点名・コース名・倉庫名は列の幅に上限を決めて折り返す（または省略して、触れると全文をツールチップで出す）。",
                "Sắp theo 配送No (cùng ngày xuất kho). Không hiển thị chuyến của đơn vật tư đã hủy. Câu khi 0 dòng giống No.4.2. Dữ liệu chuyến vật tư được tạo mỗi lần chốt giỏ hàng; cùng chi nhánh, cùng ngày giao, chưa xuất kho thì gộp thành 1 chuyến. Bảng nằm gọn trong chiều rộng màn hình, không có thanh cuộn ngang toàn trang (nếu tràn thì chỉ cuộn ngang trong bảng). Tên chi nhánh・khóa học・kho dài thì đặt giới hạn độ rộng cột và xuống dòng (hoặc rút gọn, chạm vào thì hiện toàn văn bằng tooltip)."]},
    {"no": "5.2", "ja": "配送No", "vi": "Mã chuyến", "sel": ".tbl th::配送No", "kind": "label", "trig": "view", "detail": ["DL-yymmdd-nnnn（日付＝出荷日）。等幅で出す。", "DL-yymmdd-nnnn (ngày = ngày xuất kho). Hiển thị font đơn cách."]},
    {"no": "5.3", "ja": "拠点", "vi": "Chi nhánh", "sel": ".tbl th::拠点", "kind": "label", "trig": "view", "detail": ["拠点IDと拠点名（例 CU00871 株式会社サンプル 大阪支店）。", "Mã và tên chi nhánh (ví dụ CU00871 株式会社サンプル 大阪支店)."]},
    {"no": "5.4", "ja": "種類", "vi": "Loại", "sel": ".tbl th::種類", "kind": "label", "trig": "view",
     "detail": ["3種類：資材の初期セット（新規の申込・無料）／通常の資材注文（料金に含む）／通常の資材注文（このサイクルの2回目以降）。初期セットは回数に数えない。",
                "3 loại: bộ vật tư ban đầu (đăng ký mới, miễn phí) / đơn vật tư thường (đã gồm trong phí) / đơn vật tư thường (từ lần thứ 2 của chu kỳ này). Bộ ban đầu không tính vào số lần."]},
    {"no": "5.5", "ja": "中身", "vi": "Nội dung", "sel": ".tbl th::中身", "kind": "label", "trig": "view", "detail": ["「資材名 数」を「、」でつなぐ。", "Nối các cặp 「資材名 数」 bằng 「、」."]},
    {"no": "5.6", "ja": "納品予定日", "vi": "Ngày giao dự kiến", "sel": ".tbl th::納品予定日", "kind": "label", "trig": "view", "detail": ["yyyy-mm-dd（曜日）。出荷日＋その配送の資材リードタイム（契約の配送区分「資材」の日数。0〜7日・既定2日）。", "yyyy-mm-dd (thứ). Ngày xuất kho + lead time vật tư của chuyến đó (số ngày của loại giao 「資材」 trong hợp đồng; 0〜7 ngày, mặc định 2)."]},
    {"no": "5.7", "ja": "料金（税抜）", "vi": "Phí (chưa thuế)", "sel": ".tbl th::料金", "kind": "label", "trig": "view",
     "detail": ["資材の追加配送（月の2回目以降の注文）のときだけ「OP000036 資材の追加配送 ¥2,000」の形で出す（金額はオプションマスタの値）。ほかは「—」。",
                "Chỉ hiện dạng 「OP000036 資材の追加配送 ¥2,000」 khi là phí giao vật tư bổ sung (đơn từ lần thứ 2 trong tháng); số tiền lấy từ master option. Còn lại hiện 「—」."],
     "open": ["資材の追加配送の金額は【仮】¥2,000／回（客先確認）", "Số tiền phí giao vật tư bổ sung [tạm] 2.000 yên/lần (chờ khách xác nhận)"], "ask": "お客様（営業）"},
    {"no": "6", "ja": "補足の説明", "vi": "Giải thích bổ sung", "sel": "p.muted", "kind": "label", "trig": "show",
     "detail": ["状況はヤマトの送り状番号で追跡ページを開いて確かめる。送り状番号・発送日は資材注文管理（運営B）の詳細で入力し、入力すると出荷済になる（受付簿 No.154）。この画面に「ピッキング済」の印・送り状番号の入力口は置かない（Q-MS1＝B）。",
                "Trạng thái xem bằng cách mở trang tra cứu theo số vận đơn ヤマト. Số vận đơn và ngày gửi nhập ở màn chi tiết 資材注文管理 (運営B); nhập xong thì chuyển 出荷済 (受付簿 No.154). Màn này không có dấu 「ピッキング済」 và không có chỗ nhập số vận đơn (Q-MS1 = B)."],
     "demo_ok": ["コードは先頭に「見本のデータです。」を付ける（デモ専用。本番では出さない）", "Code thêm 「見本のデータです。」 ở đầu (chỉ dành cho demo; bản chính thức không hiện)"]},
]

# 画面にない定義（CSV の列）。番号は項目定義にだけ出る
CSV_ITEMS = [
    {"no": "7", "ja": "CSVの列の定義", "vi": "Định nghĩa cột CSV", "sel": "-", "kind": "area", "trig": "view",
     "detail": ["2つのCSVの列。「CSV出力」（No.1.1）は7列、「送り状CSV（ヤマト）」（No.1.2）は4列。どちらも選んだ出荷日の資材の配送が対象。文字コードはコードでは UTF-8（BOM あり）、本番は Shift_JIS の予定（ヤマトの確認待ち：No.1.2）。",
                "Cột của 2 file CSV. 「CSV出力」 (No.1.1) 7 cột, 「送り状CSV（ヤマト）」 (No.1.2) 4 cột. Cả hai lấy các chuyến vật tư của ngày xuất kho đã chọn. Bảng mã: code hiện UTF-8 (có BOM), bản chính thức dự kiến Shift_JIS (chờ ヤマト xác nhận: No.1.2)."]},
    {"no": "7.1", "ja": "【CSV出力】配送No", "vi": "[CSV出力] Mã chuyến", "sel": "-", "kind": "label", "trig": "view", "len": "文字列（DL-yymmdd-nnnn）",
     "detail": ["配送の番号。例 DL-261006-0103。1行＝配送の1資材。", "Mã chuyến. Ví dụ DL-261006-0103. 1 dòng = 1 vật tư của 1 chuyến."]},
    {"no": "7.2", "ja": "【CSV出力】拠点", "vi": "[CSV出力] Chi nhánh", "sel": "-", "kind": "label", "trig": "view", "len": "文字列",
     "detail": ["拠点IDと拠点名。例 CU00871 株式会社サンプル 大阪支店。", "Mã và tên chi nhánh. Ví dụ CU00871 株式会社サンプル 大阪支店."]},
    {"no": "7.3", "ja": "【CSV出力】出荷日", "vi": "[CSV出力] Ngày xuất kho", "sel": "-", "kind": "label", "trig": "view", "len": "日付（yyyy-mm-dd）",
     "detail": ["例 2026-10-06。", "Ví dụ 2026-10-06."]},
    {"no": "7.4", "ja": "【CSV出力】お届け予定日", "vi": "[CSV出力] Ngày giao dự kiến", "sel": "-", "kind": "label", "trig": "view", "len": "日付（yyyy-mm-dd）",
     "detail": ["例 2026-10-08。", "Ví dụ 2026-10-08."],
     "demo_ok": ["コードは「2026/10/08（木）」の形の文字列を渡している。P-CSV-OUT（日付は yyyy-mm-dd）に揃える", "Code truyền chuỗi dạng 「2026/10/08（木）」. Đồng nhất theo P-CSV-OUT (ngày dạng yyyy-mm-dd)"]},
    {"no": "7.5", "ja": "【CSV出力】資材ID", "vi": "[CSV出力] Mã vật tư", "sel": "-", "kind": "label", "trig": "view", "len": "文字列（S＋3桁）",
     "detail": ["資材マスタの ID。例 S001。", "ID trong master vật tư. Ví dụ S001."]},
    {"no": "7.6", "ja": "【CSV出力】資材名", "vi": "[CSV出力] Tên vật tư", "sel": "-", "kind": "label", "trig": "view", "len": "文字列 60",
     "detail": ["資材マスタの名前。", "Tên trong master vật tư."]},
    {"no": "7.7", "ja": "【CSV出力】数", "vi": "[CSV出力] Số lượng", "sel": "-", "kind": "label", "trig": "view", "len": ["整数 0〜999,999", "Số nguyên 0〜999.999"],
     "detail": ["その配送のその資材の数。", "Số lượng vật tư đó trong chuyến đó."]},
    {"no": "7.8", "ja": "【ヤマト】配送No", "vi": "[ヤマト] Mã chuyến", "sel": "-", "kind": "label", "trig": "view", "len": "文字列（DL-yymmdd-nnnn）",
     "detail": ["1行＝配送1件（資材の中身は1つのセルにまとめる）。", "1 dòng = 1 chuyến (nội dung vật tư gộp trong 1 ô)."],
     "open": ["ヤマトの送り状CSVの列は暫定の4列（No.1.2）", "Cột CSV vận đơn ヤマト hiện tạm 4 cột (No.1.2)"], "ask": "お客様・ヤマト運輸"},
    {"no": "7.9", "ja": "【ヤマト】拠点", "vi": "[ヤマト] Chi nhánh", "sel": "-", "kind": "label", "trig": "view", "len": "文字列",
     "detail": ["拠点IDと拠点名。", "Mã và tên chi nhánh."]},
    {"no": "7.10", "ja": "【ヤマト】お届け予定日", "vi": "[ヤマト] Ngày giao dự kiến", "sel": "-", "kind": "label", "trig": "view", "len": "日付（yyyy-mm-dd）",
     "detail": ["お届け先に着く日（資材は営業所止めではなく直送）。出荷日＋その配送の資材リードタイム（既定2日。No.5.6 と同じ）。", "Ngày hàng tới nơi nhận (vật tư giao thẳng, không giữ ở bưu cục). Ngày xuất kho + lead time vật tư của chuyến đó (mặc định 2 ngày; giống No.5.6)."],
     "demo_ok": ["コードは「2026/10/08（木）」の形の文字列を渡している。yyyy-mm-dd に揃える（ヤマトの受け入れる形は確認待ち）", "Code truyền chuỗi dạng 「2026/10/08（木）」. Đồng nhất yyyy-mm-dd (dạng ヤマト nhận còn chờ xác nhận)"]},
    {"no": "7.11", "ja": "【ヤマト】中身", "vi": "[ヤマト] Nội dung", "sel": "-", "kind": "label", "trig": "view", "len": "文字列",
     "detail": ["「資材名 数」を「、」でつないだ文字。例 保冷バッグ 1、ステッカー 1。", "Chuỗi nối các cặp 「資材名 数」 bằng 「、」. Ví dụ 保冷バッグ 1、ステッカー 1."]},
]

def V(id, ja, vi, setup, items, note=None, wait=500):
    return {"id": id, "code": "AW_MSUM_001", "state": [ja, vi], "url": "/ops/delivery/material-summary", "setup": (H + setup) if setup else "", "full": True, "wait": wait,
            "note": note or ["", ""], "items": items}

VIEWS = [
    V("001", "初期表示（出荷日の初期値）", "Hiển thị ban đầu (giá trị ban đầu của 出荷日)", "await setd('2026-10-05');", ITEMS + CSV_ITEMS,
      note=["資材注文管理の『出荷日の集計』タブへ統合予定（hong 2026-10-08）。運営B の資材注文管理の設計書を作るときにこの内容を移す。決定（hong 2026-10-07 Q-MS2＝A）：出荷日の初期値＝今日以降で最初の出荷日。デモの今日 2026-10-05 では 2026-10-05（無料の資材注文 MO-2610-0012）。コードは 2026-10-06 固定（宿題）。",
            "Dự kiến gộp vào tab 『出荷日の集計』 của 資材注文管理 (hong 2026-10-08). Khi làm thiết kế 資材注文管理 (運営B) sẽ chuyển nội dung này sang. Quyết định (hong 2026-10-07 Q-MS2 = A): 出荷日 ban đầu = ngày xuất kho đầu tiên từ hôm nay. Hôm nay demo 2026-10-05 nên là 2026-10-05 (đơn vật tư miễn phí MO-2610-0012). Code cố định 2026-10-06 (việc phải sửa)."]),
    V("002", "別の出荷日（資材の追加配送あり）", "Ngày xuất kho khác (có phí giao vật tư bổ sung)", "await setd('2026-10-06');",
      [
          {"no": "3.1", "ja": "出荷日", "vi": "Ngày xuất kho", "sel": "select[aria-label=出荷日]", "kind": "select", "trig": "select", "req": "－",
           "len": ["選択（資材の配送がある出荷日だけ）", "Chọn (chỉ các ngày xuất kho có chuyến vật tư)"], "ex": ["2026-10-06（火）", "Ngày xuất kho 6/10/2026 (thứ Ba) trong danh sách; chọn rồi bấm 検索"],
           "detail": ["別の日を選んで「検索」を押した状態。", "Trạng thái đã chọn ngày khác và bấm 「検索」."]},
          {"no": "4.1", "ja": "資材の合計の表", "vi": "Bảng tổng vật tư", "sel": ".tbl::資材ID", "kind": "table", "trig": "view",
           "detail": ["この日の資材の合計。", "Tổng vật tư của ngày này."]},
          {"no": "5.1", "ja": "配送ごとの表", "vi": "Bảng từng chuyến", "sel": ".tbl::料金（税抜）", "kind": "table", "trig": "view",
           "detail": ["この日の配送（MO-2610-0013・DL-261006-0103）は、大阪支店のこのサイクル2回目の資材注文なので、料金の列に資材の追加配送（OP000036）が出る。",
                      "Chuyến ngày này (MO-2610-0013・DL-261006-0103) là đơn vật tư lần thứ 2 của chu kỳ này của chi nhánh Osaka nên cột phí hiện phí giao vật tư bổ sung (OP000036)."]},
      ],
      note=["資材注文管理の『出荷日の集計』タブへ統合予定（hong 2026-10-08）。運営B の資材注文管理の設計書を作るときにこの内容を移す。見本のこの日は、料金の列に資材の追加配送が出る。", "Dự kiến gộp vào tab 『出荷日の集計』 của 資材注文管理 (hong 2026-10-08). Khi làm thiết kế 資材注文管理 (運営B) sẽ chuyển nội dung này sang. Ngày này trong dữ liệu mẫu có phí giao vật tư bổ sung ở cột phí."]),
    V("003", "送り状CSV（ヤマト）を出力（トースト）", "Xuất CSV vận đơn (ヤマト) (toast)", "document.querySelector('.ph .btns .btn.out').click();await sleep(400);",
      [
          {"no": "1.2", "ja": "送り状CSV（ヤマト）", "vi": "CSV vận đơn (ヤマト)", "sel": ".ph .btns button::送り状CSV", "kind": "button", "trig": "click", "err": ["S12"],
           "detail": ["押すとファイルを保存し、トーストを出す（S12）。", "Bấm thì lưu file và hiện toast (S12)."]},
          {"no": "8", "ja": "完了のトースト", "vi": "Toast hoàn tất", "sel": ".toast", "kind": "toast", "trig": "show", "err": ["S12"],
           "detail": ["完了の文言は S12（「CSVを出力しました（{n}行・{ファイル名}）。」）。", "Câu hoàn tất là S12 (「CSVを出力しました（{n}行・{ファイル名}）。」), hiện dạng toast."],
           "demo_ok": ["コードは「ヤマト運輸の送り状CSV（n件）を出力しました（デモ）」。S12 に揃える", "Code hiện 「ヤマト運輸の送り状CSV（n件）を出力しました（デモ）」. Đồng nhất về S12"]},
      ],
      note=["資材注文管理の『出荷日の集計』タブへ統合予定（hong 2026-10-08）。運営B の資材注文管理の設計書を作るときにこの内容を移す。", "Dự kiến gộp vào tab 『出荷日の集計』 của 資材注文管理 (hong 2026-10-08). Khi làm thiết kế 資材注文管理 (運営B) sẽ chuyển nội dung này sang."]),
]
