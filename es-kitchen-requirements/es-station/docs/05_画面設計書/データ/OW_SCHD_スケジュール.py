# -*- coding: utf-8 -*-
"""
委託配送先Web「スケジュール（月・週）」（OW_SCHD）の画面設計書データ。
元：本物の Web（app/carrier/schedule/page.tsx・_ui/Calendar.tsx・lib/carrier/logic.ts の calRows・cycOf）。
決定：docs/決定台帳.md F・K（一覧の標準、未適用の印は出さない）、台帳 L（運営スケジュールの月表示を委託でも使う）、確認メモ_TW_委託配送先 §3（H-1・H-24〜H-26・H-33）。
コードがまだ決定に追いついていないところは demo_ok。決定（台帳 S・2026-10-08）：#430 予定にも配送スタッフを割り当てられる（「割当期間：納品日の7日前〜前日」の扱いは要確認：open・ask: hong）。
"""

TITLE = ["スケジュール（OW_SCHD）", "Lịch (OW_SCHD)"]
SHEET = ["スケジュール", "Lịch"]
BASENAME = "画面設計書_OW_SCHD_スケジュール"
IMG_PREFIX = "OW_SCHD"
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
    {"date": "2026-10-07", "target": "OW_SCHD 全体",
     "q": ["Screen Code の頭文字", "Tiền tố Screen Code"],
     "a": ["OW（委託配送先Web）", "OW (委託配送先Web)"], "src": "hong 回答 2026-10-07（台帳 F・受付簿 No.290）"},
    {"date": "2026-10-07", "target": "OW_SCHD_001 No.5.2",
     "q": ["月のマスを押したときの動き", "Hành vi khi bấm vào ô ngày của lịch tháng"],
     "a": ["その日を含む週の表示に切り替える（運営スケジュールの月表示と同じ動き）。配送管理へは移らない", "Chuyển sang hiển thị tuần chứa ngày đó (giống lịch tháng của 運営). Không chuyển sang Quản lý giao hàng"],
     "src": "確認メモ_TW H-25（台帳 L「運営スケジュールの月表示」の決定済み）"},
    {"date": "2026-10-07", "target": "OW_SCHD_001 No.5.2.5",
     "q": ["予定（締切前でまだ確定していない配送）の見せ方", "Cách hiển thị chuyến dự kiến (trước hạn chốt, chưa xác nhận)"],
     "a": ["点線の枠と「予定 N件」。出すのは納品日・拠点名・温度帯・件数だけ。予定は翌月サイクルまで", "Khung nét đứt và 「予定 N件」. Chỉ hiện ngày giao, tên 拠点, vùng nhiệt, số chuyến. Dự kiến chỉ đến chu kỳ tháng sau"],
     "src": "確認メモ_TW H-26（配送_08 §15-3・配送_06 §11-6 の決定済み）"},
    {"date": "2026-10-08", "target": "OW_SCHD_001 No.8・11・12",
     "q": ["予定の配送にも配送スタッフを割り当てられるか（確認表 H-15）", "Có gán nhân viên giao hàng cho chuyến dự kiến không (bảng xác nhận H-15)"],
     "a": ["予定にも割り当てられる（コードの今の動き）。配送の内容（日付・数量など）が変わったときは、割当は自動で外れる。ホームの枠「通知」で知らせ、ドライバーを設定し直す（受付簿 #463）。「割当期間：納品日の7日前〜前日」の扱いは要確認のまま（open）", "Gán được cả cho chuyến 「予定」 (đúng hành vi hiện tại của code). Khi nội dung chuyến (ngày, số lượng v.v.) thay đổi thì phân công tự động bị gỡ. Báo ở khung 「通知」 của Trang chủ và gán lại tài xế (受付簿 #463). Cách xử lý 「割当期間：納品日の7日前〜前日」 vẫn cần xác nhận (open)"],
     "src": "hong 回答 2026-10-08（台帳 S「配送スタッフを割り当てる対象（OW）」・受付簿 #430）。置き換えた旧案：予定は見るだけ・7日前〜前日の文を外す（Claude 推奨 Q-9）"},
    {"date": "2026-10-07", "target": "OW_SCHD_001 No.4",
     "q": ["検索条件の枠と検索のしかた", "Khung và cách tìm kiếm"],
     "a": ["es-search。「検索」か Enter で反映。「未適用」の印は出さない。検索のトーストは出さない", "es-search. Áp dụng khi nhấn 「検索」 hoặc Enter. Không hiện dấu 「未適用」. Không hiện toast khi tìm"],
     "src": "台帳 F・K（確認メモ H-1・H-2）"},
]
CHANGES = []

HIDE_ALWAYS = [".es-demo-bar", "#es-review"]
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [{"code": "OW_SCHD_001", "ja": "スケジュール", "vi": "Lịch"}]

def I(no, ja, vi, sel, kind="label", trig="view", **kw):
    d = {"no": no, "ja": ja, "vi": vi, "sel": sel, "kind": kind, "trig": trig}
    d.update(kw)
    return d

def V(id, code, ja, vi, url, items, note=None, **kw):
    d = {"id": id, "code": code, "state": [ja, vi], "url": url, "setup": "", "full": True, "wait": 600, "note": note or ["", ""], "items": items}
    d.update(kw)
    return d

SET = ("const set=(el,v)=>{const p=Object.getPrototypeOf(el);Object.getOwnPropertyDescriptor(p,'value').set.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}));};"
       "const wait=(ms)=>new Promise(r=>setTimeout(r,ms));")
WEEK = "document.querySelectorAll('.toggle button')[1].click();await wait(400);"

ALERT_W300 = I("8", "ドライバー未設定の警告枠", "Khung cảnh báo chưa gán tài xế", "-", "area", err=["W300"],
    detail=["納品日の3日前と前日になっても配送スタッフが決まっていない配送があるとき、画面の上に警告枠を出す（W300）。枠の中の「配送管理へ」で、未設定の配送の一覧へ移る。配送管理にも同じ枠を出す。ホームでは、同じ警告をホームの枠「通知」に出す（OW_HOME No.8.1。台帳 S・受付簿 #428）。",
            "Khi có chuyến chưa gán nhân viên giao hàng vào 3 ngày trước và 1 ngày trước ngày giao thì hiện khung cảnh báo ở đầu màn hình (W300). Nút 「配送管理へ」 trong khung chuyển tới danh sách chuyến chưa gán. Cùng khung cũng hiện ở Quản lý giao hàng. Ở Trang chủ, cùng cảnh báo hiện trong khung 「通知」 (OW_HOME No.8.1; 台帳 S・受付簿 #428)."],
    demo_ok=["コードのスケジュールは警告枠を出さない（確認メモ H-33）。宿題", "Màn Lịch trong code không hiện khung cảnh báo (確認メモ H-33). Việc còn tồn"])

ITEMS_MAIN = [
    I("1", "見出し", "Tiêu đề trang", ".crumb", "area", detail=["パンくず「ホーム ／ スケジュール」と画面名「スケジュール」。", "Breadcrumb 「ホーム ／ スケジュール」 và tên màn 「スケジュール」."]),
    I("1.1", "画面名", "Tên màn hình", "h1.ptitle", "label", detail=["画面名は「スケジュール」。", "Tên màn hình là 「スケジュール」."]),
    I("2", "月・週の切替", "Chuyển tháng / tuần", ".toggle", "area",
      detail=["月表示と週表示を切り替える。開いたときは月表示。切り替えても検索条件は残る。", "Chuyển giữa hiển thị tháng và tuần. Khi mở là hiển thị tháng. Chuyển đổi không làm mất điều kiện tìm kiếm."]),
    I("2.1", "月", "Tháng", ".toggle button:first-child", "button", "click", detail=["月のカレンダーを出す（既定）。", "Hiện lịch tháng (mặc định)."]),
    I("2.2", "週", "Tuần", ".toggle button:last-child", "button", "click",
      detail=["今日を含む週の表示にする。日付のマスの下に、その日の配送を拠点名のチップで並べる。", "Chuyển sang hiển thị tuần chứa ngày hôm nay. Dưới ô ngày xếp các chuyến trong ngày dưới dạng chip tên 拠点."]),
    I("3", "表示する月", "Tháng hiển thị", ".calbar .inp", "month", "select", req="－", len="年月（yyyy-mm）",
      init=["今月（デモの今日が属する月）", "Tháng hiện tại (tháng của ngày hôm nay)"], ex=["2026-10", "Năm-tháng đang xem"],
      detail=["いま見ている年月（yyyy-mm）。選べる範囲は、配送のある最初の月から、予定を作ってある翌月サイクルの月まで。範囲の外は選べない。", "Năm-tháng đang xem (yyyy-mm). Phạm vi chọn được: từ tháng đầu tiên có chuyến giao đến tháng của chu kỳ tháng sau đã tạo lịch dự kiến. Ngoài phạm vi không chọn được."],
      demo_ok=["コードの月の入力は表示だけで選べない（確認メモ H-24）。宿題", "Ô tháng trong code chỉ để hiển thị, chưa chọn được (確認メモ H-24). Việc còn tồn"]),
    I("3.1", "前の月", "Tháng trước", "button[aria-label=\"前へ\"]", "button", "click", err=["I200"],
      detail=["1つ前の月（週表示のときは前の週）へ移る。配送のある最初の月より前は I200（トースト）。", "Chuyển sang tháng trước (hiển thị tuần thì tuần trước). Trước tháng đầu tiên có chuyến giao: I200 (toast)."],
      demo_ok=["コードのボタンは押しても動かない（確認メモ H-24）。宿題", "Nút trong code bấm không có tác dụng (確認メモ H-24). Việc còn tồn"]),
    I("3.2", "次の月", "Tháng sau", "button[aria-label=\"次へ\"]", "button", "click", err=["I201"],
      detail=["1つ先の月（週表示のときは次の週）へ移る。予定は翌月サイクルまで。それより先は I201（トースト）。", "Chuyển sang tháng sau (hiển thị tuần thì tuần sau). Dự kiến chỉ đến chu kỳ tháng sau; xa hơn: I201 (toast)."],
      demo_ok=["コードのボタンは押しても動かない（確認メモ H-24）。宿題", "Nút trong code bấm không có tác dụng (確認メモ H-24). Việc còn tồn"]),
    I("3.3", "今日", "Hôm nay", ".calbar .btn.sm", "button", "click",
      detail=["今日を含む月（週表示のときは今日を含む週）に戻す。", "Quay về tháng chứa hôm nay (hiển thị tuần thì tuần chứa hôm nay)."],
      demo_ok=["コードのボタンは押しても動かない（確認メモ H-24）。宿題", "Nút trong code bấm không có tác dụng (確認メモ H-24). Việc còn tồn"]),
    I("4", "検索条件", "Điều kiện tìm kiếm", ".search-row", "area", pattern="P-LIST",
      detail=["検索条件の枠は es-search。「検索」か Enter で反映する（入力中は変えない）。「未適用」の印は出さない。条件はカレンダー（月・週どちらも）の件数・チップに効く。",
              "Khung điều kiện dùng es-search. Áp dụng khi nhấn 「検索」 hoặc Enter (không đổi khi đang nhập). Không hiện dấu 「未適用」. Điều kiện áp dụng cho số chuyến và chip của lịch (cả tháng và tuần)."],
      demo_ok=["コードは独自の検索行（es-search の部品ではない）で、「未適用」の印は出さず、検索すると「検索しました（n件）」のトーストを出す（確認メモ H-1・H-2）。宿題", "Code dùng hàng tìm kiếm riêng (không phải thành phần es-search), không hiện dấu 「未適用」 và khi tìm hiện toast 「検索しました（n件）」 (確認メモ H-1・H-2). Việc còn tồn"]),
    I("4.1", "拠点名・配送No・送り状番号", "Tên 拠点, số giao hàng, số phiếu gửi", "input[placeholder=\"拠点名、配送No、送り状番号\"]", "text", "input", req="－", len="文字列 60",
      ex=["ひかり物産", "Một phần tên 拠点 / số giao hàng (DL-…) / số phiếu gửi"],
      detail=["届け先拠点名・配送No・配送ID・送り状番号を部分一致で探す。前後の空白は取り、全角の英数字は半角に直す。入力欄は60文字の上限で止まり、それ以上は入らない。貼り付けで上限を超えたときだけ E04 を出す（台帳 S・受付簿 #446）。", "Tìm khớp một phần theo tên 拠点 nơi giao, số giao hàng, ID giao hàng, số phiếu gửi. Bỏ khoảng trắng đầu/cuối, đổi chữ số/chữ cái toàn góc sang nửa góc. Ô nhập bị chặn ở giới hạn 60 ký tự, không nhập thêm được. Chỉ khi dán vượt giới hạn mới hiện E04 (台帳 S・受付簿 #446)."], demo_ok=["入力欄の上限で止める動き（台帳 S・受付簿 #446）は宿題。", "Việc chặn nhập ở giới hạn của ô nhập (台帳 S・受付簿 #446) còn tồn."],
      err=["E04"]),
    I("4.2", "届け先の住所", "Địa chỉ nơi giao", "input[placeholder=\"届け先の住所\"]", "text", "input", req="－", len="文字列 255",
      ex=["川崎市川崎区", "Một phần địa chỉ nơi giao"],
      detail=["届け先の住所を部分一致で探す。入力欄は255文字の上限で止まり、それ以上は入らない。貼り付けで上限を超えたときだけ E04 を出す（台帳 S・受付簿 #446）。", "Tìm khớp một phần theo địa chỉ nơi giao. Ô nhập bị chặn ở giới hạn 255 ký tự, không nhập thêm được. Chỉ khi dán vượt giới hạn mới hiện E04 (台帳 S・受付簿 #446)."], demo_ok=["入力欄の上限で止める動き（台帳 S・受付簿 #446）は宿題。", "Việc chặn nhập ở giới hạn của ô nhập (台帳 S・受付簿 #446) còn tồn."], err=["E04"]),
    I("4.3", "クリア", "Xóa điều kiện", ".search-row .btn.out", "button", "click", detail=["検索条件を初期値に戻して再検索する。", "Đưa điều kiện về mặc định và tìm lại."]),
    I("4.4", "検索", "Tìm kiếm", ".search-row .btn.pri", "button", "click", detail=["条件をカレンダーに反映する。Enter でも同じ。", "Áp dụng điều kiện vào lịch. Nhấn Enter cũng giống vậy."]),
    I("5", "カレンダー（月）", "Lịch (tháng)", ".cal-inner", "area",
      detail=["月曜始まりの月カレンダー。自社が運ぶ区間の配送を納品日で数える。サイクル（A1〜D7）の色で週を分ける。", "Lịch tháng bắt đầu từ thứ Hai. Đếm các chuyến thuộc chặng công ty mình chạy theo ngày giao. Phân biệt tuần bằng màu chu kỳ (A1〜D7)."]),
    I("5.1", "曜日の見出し", "Tiêu đề thứ", ".dow", "label", detail=["月・火・水・木・金・土・日。", "月・火・水・木・金・土・日."]),
    I("5.2", "日付のマス", "Ô ngày", ".cal .day:not(.other)", "link", "click",
      detail=["1日＝1マス。押すと、その日を含む週の表示に切り替える（配送管理へは移らない）。今日は枠を強調、先月・来月の日は灰色。", "1 ngày = 1 ô. Bấm để chuyển sang hiển thị tuần chứa ngày đó (không chuyển sang Quản lý giao hàng). Hôm nay viền nổi bật, ngày tháng trước/sau màu xám."],
      demo_ok=["コードはマスを押すと配送管理へ移る（確認メモ H-25）。週表示へ切り替える動きは宿題", "Code bấm ô sẽ chuyển sang Quản lý giao hàng (確認メモ H-25). Việc chuyển sang hiển thị tuần là việc còn tồn"]),
    I("5.2.1", "日付", "Ngày", ".cal .day:not(.other) .num", "label", detail=["日（1〜31）。", "Ngày (1〜31)."]),
    I("5.2.2", "サイクル", "Chu kỳ", ".cal .day:not(.other) .cy", "label", detail=["「◯月サイクル」と週の記号（A1〜D7）。サイクルのない日は「サイクル休止」。", "「◯月サイクル」 và ký hiệu tuần (A1〜D7). Ngày không có chu kỳ ghi 「サイクル休止」."]),
    I("5.2.3", "温度帯の件数", "Số chuyến theo vùng nhiệt", ".cal .day:not(.other) .tags", "label",
      detail=["その日の配送の温度帯ごとの件数（冷凍・冷蔵・資材。アイコンと件数）。配送のない日は何も出さない。", "Số chuyến theo vùng nhiệt trong ngày (lạnh đông, lạnh, vật tư; biểu tượng và số). Ngày không có chuyến thì để trống."]),
    I("5.3", "凡例", "Chú giải", ".legend", "label", detail=["サイクルの色・祝休日・配送スタッフ未設定・当日・温度帯のアイコンの意味。予定の配送の見え方（点線の枠）も書く。", "Ý nghĩa màu chu kỳ, ngày lễ/nghỉ, chưa gán nhân viên giao hàng, ngày hôm nay, biểu tượng vùng nhiệt. Có cả cách hiển thị chuyến dự kiến (khung nét đứt)."]),
    ALERT_W300,
]
ITEMS_WEEK = [
    I("6", "カレンダー（週）", "Lịch (tuần)", ".cal-inner", "area",
      detail=["今日を含む週（月〜日）。上段が日付のマス、下段がその日の配送のチップ。", "Tuần chứa hôm nay (thứ Hai đến Chủ nhật). Hàng trên là ô ngày, hàng dưới là chip các chuyến trong ngày."]),
    I("6.1", "配送のチップ", "Chip chuyến giao", ".wk-list button", "link", "click",
      detail=["温度帯のアイコンと届け先拠点名。押すと配送詳細（OW_DELV_002）を開く。2件以上ある日は縦に並べる。", "Biểu tượng vùng nhiệt và tên 拠点 nơi giao. Bấm mở chi tiết giao hàng (OW_DELV_002). Ngày có ≥2 chuyến xếp theo chiều dọc."]),
    I("6.2", "配送なし", "Không có chuyến", ".wk-list .hint", "label", detail=["配送のない日は「配送なし」と出す。", "Ngày không có chuyến hiện 「配送なし」."]),
]
ITEMS_SEARCH = [
    I("7", "検索中の表示", "Hiển thị khi đang tìm", ".cal-inner", "area",
      detail=["条件に合う配送だけを数え、チップに出す。条件を変えて「検索」を押すまでは変わらない。クリアで全件に戻す。", "Chỉ đếm và hiện các chuyến khớp điều kiện. Không đổi cho đến khi nhấn 「検索」 sau khi đổi điều kiện. Bấm Xóa để quay về tất cả."]),
]
ITEMS_NOHIT = [
    I("7.1", "条件に合う配送がない週", "Tuần không có chuyến khớp điều kiện", ".wk-list .hint", "label",
      detail=["週表示の各日に「配送なし」を出す。月表示は件数を出さない。0件のメッセージ（I01）は出さない（カレンダーの形を保つ）。", "Mỗi ngày của hiển thị tuần hiện 「配送なし」. Hiển thị tháng không hiện số chuyến. Không hiện thông báo 0 mục (I01) (giữ nguyên hình dạng lịch)."], err=["I01"]),
]
ITEMS_MOVE = [
    I("9", "月の移動（範囲内）", "Chuyển tháng (trong phạm vi)", ".calbar", "area", err=["I200", "I201"],
      detail=["‹ › で1か月ずつ動く。見られる範囲は、配送のある最初の月から翌月サイクルまで。移った先でも検索条件を保つ。", "Dùng ‹ › để chuyển từng tháng. Phạm vi xem được: từ tháng đầu tiên có chuyến đến chu kỳ tháng sau. Giữ điều kiện tìm kiếm sau khi chuyển."],
      demo_ok=["コードのボタンは動かない（確認メモ H-24）。宿題", "Nút trong code không hoạt động (確認メモ H-24). Việc còn tồn"]),
]
ITEMS_OUT = [
    I("10", "範囲の外（トースト）", "Ngoài phạm vi (toast)", "-", "toast", "show", err=["I200", "I201"],
      detail=["範囲の外へ移ろうとしたときのトースト。前は I200、先は I201。月は変えない。", "Toast khi định chuyển ra ngoài phạm vi. Lùi: I200, tiến: I201. Không đổi tháng."],
      demo_ok=["コードのボタンは動かないためトーストが出ない（確認メモ H-24）。宿題", "Nút trong code không hoạt động nên không hiện toast (確認メモ H-24). Việc còn tồn"]),
]
ITEMS_DRAFT = [
    I("11", "予定のマス", "Ô dự kiến", ".cal .day.unset:not(.other)", "link", "click",
      detail=["締切前でまだ確定していない配送（状態「予定」）だけの日。点線の枠で「予定 N件」と出し、納品日・拠点名・温度帯・件数だけを見せる（数量・納品条件は出さない）。予定は翌月サイクルまで。押すと週表示へ。予定にも配送スタッフを割り当てられる（割当は配送管理・配送詳細で行い、この画面では割り当てない：台帳 S・受付簿 #430）。",
              "Ngày chỉ có chuyến chưa chốt trước hạn (trạng thái 「予定」). Hiện khung nét đứt 「予定 N件」, chỉ cho xem ngày giao, tên 拠点, vùng nhiệt, số chuyến (không hiện số lượng, điều kiện giao). Dự kiến chỉ đến chu kỳ tháng sau. Bấm để sang hiển thị tuần. Có thể gán nhân viên giao hàng cả cho chuyến dự kiến (việc gán thực hiện ở Quản lý giao hàng・Chi tiết giao hàng, không gán ở màn này: 台帳 S・受付簿 #430)."],
      open=["「割当期間：納品日の7日前〜前日」の扱い（予定のうち、いつから割り当てられるか）が決まっていない（台帳 S・受付簿 #430 で要確認のまま）。hong に確認する", "Chưa quyết cách xử lý 「割当期間：納品日の7日前〜前日」 (chuyến 予定 được gán từ khi nào) (vẫn cần xác nhận ở 台帳 S・受付簿 #430). Cần hỏi hong"], ask="hong",
      demo_ok=["コードは予定も確定と同じ表示で、範囲の制限もない（確認メモ H-26）。点線の枠と「予定 N件」は宿題", "Code hiển thị chuyến dự kiến giống chuyến đã chốt và không giới hạn phạm vi (確認メモ H-26). Khung nét đứt và 「予定 N件」 là việc còn tồn"]),
]
ITEMS_UNSET = [
    I("12", "配送スタッフ未設定のマス", "Ô có chuyến chưa gán nhân viên", ".cal .day.unset .badge", "label",
      detail=["配送スタッフが決まっていない配送がある日のマスに、黄色の「未 n件」（n＝その日の未設定の件数）を出す。月・週のどちらでも同じ。押すと週表示へ。", "Ô ngày có chuyến chưa gán nhân viên giao hàng hiện badge vàng 「未 n件」 (n = số chuyến chưa gán trong ngày). Giống nhau ở hiển thị tháng và tuần. Bấm để sang hiển thị tuần."]),
]

VIEWS = [
    V("001", "OW_SCHD_001", "月表示 初期（凡例つき）", "Hiển thị tháng ban đầu (có chú giải)", "/carrier/schedule", ITEMS_MAIN,
      note=["栄成ロジ（DE00001）で開いた直後。月表示。デモの今日は 2026-10-05。", "Vừa mở bằng 栄成ロジ (DE00001). Hiển thị tháng. 'Hôm nay' của demo là 2026-10-05."]),
    V("002", "OW_SCHD_001", "週表示（今週・配送のチップ）", "Hiển thị tuần (tuần này, chip chuyến giao)", "/carrier/schedule", ITEMS_WEEK, setup=SET + WEEK, wait=600,
      note=["「週」に切り替えた状態。デモの今日（10/05）を含む週（10/05〜10/11）。10/07 に川崎工場への2件がある。", "Đã chuyển sang 「週」. Tuần chứa hôm nay (10/05) là 10/05〜10/11. Ngày 10/07 có 2 chuyến tới 川崎工場."]),
    V("003", "OW_SCHD_001", "検索条件あり（拠点名）", "Có điều kiện tìm kiếm (tên 拠点)", "/carrier/schedule", ITEMS_SEARCH,
      setup=SET + "set(document.querySelector('input[placeholder=\"拠点名、配送No、送り状番号\"]'),'ひかり物産');document.querySelector('.search-row .btn.pri').click();await wait(500);", wait=600,
      note=["拠点名に「ひかり物産」を入れて検索した状態（月表示）。", "Đã nhập 「ひかり物産」 vào tên 拠点 và tìm (hiển thị tháng)."]),
    V("004", "OW_SCHD_001", "検索 0件（週表示「配送なし」）", "Tìm 0 kết quả (tuần: 「配送なし」)", "/carrier/schedule", ITEMS_NOHIT,
      setup=SET + WEEK + "set(document.querySelector('input[placeholder=\"拠点名、配送No、送り状番号\"]'),'存在しない拠点');document.querySelector('.search-row .btn.pri').click();await wait(500);", wait=600,
      note=["存在しない拠点名で検索した週表示。どの日も「配送なし」。", "Hiển thị tuần tìm theo tên 拠点 không tồn tại. Ngày nào cũng 「配送なし」."]),
    V("005", "OW_SCHD_001", "前の月・次の月へ移動（範囲内）", "Chuyển sang tháng trước / sau (trong phạm vi)", "/carrier/schedule", ITEMS_MOVE,
      note=["‹ › で月を移る。コードのボタンはまだ動かない（宿題）ので画面は初期表示と同じ。", "Chuyển tháng bằng ‹ ›. Nút trong code chưa hoạt động (việc còn tồn) nên màn hình giống ban đầu."]),
    V("006", "OW_SCHD_001", "範囲の外（トースト：これより前／先はありません）", "Ngoài phạm vi (toast: không có tháng trước / sau)", "/carrier/schedule", ITEMS_OUT,
      note=["範囲の外へ移ろうとするとトースト（I200・I201）。コードがまだ動かないので撮れない。", "Định chuyển ra ngoài phạm vi thì hiện toast (I200・I201). Code chưa hoạt động nên không chụp được."]),
    V("007", "OW_SCHD_001", "予定のマス（点線・「予定 N件」・翌月サイクルまで）", "Ô dự kiến (nét đứt, 「予定 N件」, đến chu kỳ tháng sau)", "/carrier/schedule", ITEMS_DRAFT, today="2026/12/01",
      note=["デモの今日を 2026/12/01 にした月表示。12/16・12/30 は「予定」の配送。コードはまだ確定と同じ表示（宿題）。", "Hiển thị tháng với 'hôm nay' = 2026/12/01. 12/16・12/30 là chuyến 「予定」. Code còn hiển thị giống chuyến đã chốt (việc còn tồn)."]),
    V("008", "OW_SCHD_001", "ドライバー未設定のマス（黄「未 n件」）", "Ô chưa gán nhân viên (vàng 「未 n件」)", "/carrier/schedule", ITEMS_UNSET, today="2026/12/01", setup=SET + WEEK, wait=600,
      note=["デモの今日を 2026/12/01 にした週表示。翌日 12/02 に、配送スタッフが決まっていない2次の区間がある。", "Hiển thị tuần với 'hôm nay' = 2026/12/01. Ngày mai 12/02 có chặng thứ 2 chưa gán nhân viên giao hàng."]),
]
