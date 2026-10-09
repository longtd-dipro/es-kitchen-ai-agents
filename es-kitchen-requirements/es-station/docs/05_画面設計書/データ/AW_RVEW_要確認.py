# -*- coding: utf-8 -*-
"""
画面設計書のデータ：運営管理者Web「要確認」（AW_RVEW）。一覧（AW_RVEW_001）と詳細（AW_RVEW_002）。
元は本物の Web（app/ops/delivery/review）。決定は docs/決定台帳.md「運営D 要確認（確認メモ D-3a Q-RV1〜3）」・受付簿 No.294。
洗い出し：docs/05_画面設計書/確認メモ_AW_運営D_配送.md（D-3a）。区分の中身の出どころ：配送_08 §15-9、配送_02／04／05／06／09／11／12。
コードとの違い（demo_ok）：並べ替え・表示件数の記憶・戻ったときの条件の復元・日付の書き方・区分ごとの詳細・「日付を指定して解決」の廃止・対象外の入口・
自動で閉じる区分・理由の複数行／500文字・Q02／Q01・メッセージ（宿題＝コードを直す）。
区分の中身は hong 指示 2026-10-07（定義の補足・Claude 案。配送_08 §15-9／配送_10 No.3／台帳）で補った。
"""

TITLE = ["要確認（AW_RVEW）", "Mục cần xác nhận (AW_RVEW)"]
SHEET = ["要確認", "Mục cần xác nhận"]
BASENAME = "画面設計書_AW_RVEW_要確認"
IMG_PREFIX = "AW_RVEW"
OUT_DIR = "AW_RVEW_要確認"
CODE_NOTE = ["画面コード規約：AW＝Admin Web、RVEW＝Review（確認の一覧。AW_REVI＝レビュー・ご意見と区別。運営D 配送）", "Quy ước mã màn hình: AW = Admin Web, RVEW = Review (danh sách cần xác nhận; phân biệt với AW_REVI = đánh giá/ý kiến; 運営D 配送)"]
SITE = "ops"
SYSTEM = {"ja": "運営管理者Web", "vi": "Web quản trị vận hành"}
AUTHOR = "Claude（cloud）／確認：hong"
CREATED = "2026-10-07"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "ops", "loginId": "Ad00010"}
CODE_PATHS = ["app/ops/delivery/review", "app/ops/delivery/_components", "lib/ops/delivery", "lib/ops/areas/delivery.ts", "lib/domain/seed"]

_SRC = "hong 回答 2026-10-07（確認メモ_AW_運営D_配送）"
DECISIONS = [
    {"date": "2026-10-07", "target": "AW_RVEW_002 No.3・7", "q": ["詳細に何を出すか（区分ごとの中身。Q-RV1）", "Chi tiết hiển thị gì (nội dung theo từng loại; Q-RV1)"],
     "a": ["B：19区分すべての専用の詳細を設計する。仕様に中身がない区分は推測で埋めず、設計書の段階で区分ごとに hong に聞く（→ 該当する区分は chk）", "B: thiết kế chi tiết riêng cho cả 19 loại. Loại nào quy cách chưa có nội dung thì không tự suy đoán, hỏi hong theo từng loại ở giai đoạn thiết kế (→ các loại đó để chk)"], "src": _SRC},
    {"date": "2026-10-07", "target": "AW_RVEW_002 No.4", "q": ["「対応」の欄は何を変えるのか（日付を指定して解決。Q-RV2）", "Ô 「対応」 thay đổi cái gì (giải quyết bằng chỉ định ngày; Q-RV2)"],
     "a": ["A：記録だけ。日付は「配送データ詳細の編集」へのリンクで直し、戻って「対応済」にする。対応欄は「対応の内容（メモ）」と「理由」にし、日付の欄とラジオ「日付を指定して解決」は外す", "A: chỉ ghi nhận. Ngày được sửa bằng link tới 「配送データ詳細の編集」, rồi quay lại chuyển sang 「対応済」. Ô xử lý gồm 「対応の内容（メモ）」 và 「理由」; bỏ ô ngày và radio 「日付を指定して解決」"], "src": _SRC},
    {"date": "2026-10-07", "target": "AW_RVEW_002 No.1.4・1.5・3、AW_RVEW_001 No.4.10", "q": ["閉じ方：「対応済」「対象外」と、原因が別の画面で解消する区分（Q-RV3）", "Cách đóng: 「対応済」「対象外」 và các loại có nguyên nhân ở màn hình khác (Q-RV3)"],
     "a": ["A：原因が他の画面にある区分（トラブル・ドライバー未設定・変更申請・子の確定待ち・欠配）は、解消したら自動で閉じる。手動で閉じるのは日付・連携系だけ。「対象外」は理由必須の1つの入口（ヘッダのボタン）に統一し、Q01 で確認する。ラジオの「対象外にする」は廃止", "A: loại có nguyên nhân ở màn hình khác (sự cố, chưa chỉ định tài xế, yêu cầu đổi, chờ xác nhận giao con, giao thiếu) sẽ tự đóng khi nguyên nhân được giải quyết. Chỉ loại liên quan ngày và liên kết mới đóng thủ công. 「対象外」 gộp về 1 cửa duy nhất (nút ở đầu trang), bắt buộc lý do, xác nhận bằng Q01. Bỏ radio 「対象外にする」"], "src": _SRC},
]
_SRC2 = "hong 指示 2026-10-07（定義の補足・Claude 案）"
DECISIONS += [
    {"date": "2026-10-07", "target": "AW_RVEW_001 No.4.10・AW_RVEW_002 No.3", "q": ["詳細を開く入口（全区分で詳細を開けるか）", "Lối mở chi tiết (mọi loại đều mở được chi tiết?)"],
     "a": ["一覧の各行に「詳細」リンクを置き、全区分で詳細を開ける。「対応する ›」は従来どおり原因の画面へ直接行く。詳細には必ず「原因の画面へ」リンクを出す", "Mỗi dòng của danh sách có link 「詳細」, mọi loại đều mở được chi tiết. 「対応する ›」 vẫn đi thẳng tới màn hình nguyên nhân như trước. Chi tiết luôn có link 「原因の画面へ」"], "src": _SRC2},
    {"date": "2026-10-07", "target": "AW_RVEW_002 No.1.4・7・7.1・4.2・4.1", "q": ["対象外にするの理由欄・確認の文・元に戻せるか／対応の内容（メモ）は必須か", "Ô lý do, câu xác nhận, có hoàn lại được không của 対象外 / 「対応の内容（メモ）」 có bắt buộc không"],
     "a": ["ヘッダーの1つの入口。確認の小窓（Q136）に理由の入力欄（必須・複数行 500字）を置き、「対応の内容」欄の理由とは共用しない。対象外にしたものは画面から元に戻せない。同じ問題をバッチがもう一度見つけたときは新しい「要確認」として出る（配送_08 §15-9：UNIQUE は open のときだけ）。Q136 の文面は「対象外にしますか？／この要確認を閉じます。理由が履歴に残ります。同じ問題がもう一度見つかったときは、新しく出ます。」。「対応の内容（メモ）」は任意（500字・resolution_note）。理由は対象外のときだけ必須", "Một cửa duy nhất ở đầu trang. Cửa sổ xác nhận (Q136) có ô nhập lý do (bắt buộc, nhiều dòng, 500 ký tự), không dùng chung với ô lý do ở khung 「対応の内容」. Mục đã chuyển 対象外 không thể hoàn lại từ màn hình. Khi batch phát hiện lại cùng vấn đề thì xuất hiện thành mục mới (配送_08 §15-9: UNIQUE chỉ áp dụng khi open). Nội dung Q136: 「対象外にしますか？／この要確認を閉じます。理由が履歴に残ります。同じ問題がもう一度見つかったときは、新しく出ます。」. 「対応の内容（メモ）」 là tùy chọn (500 ký tự, resolution_note). Lý do chỉ bắt buộc khi 対象外"], "src": _SRC2},
    {"date": "2026-10-07", "target": "AW_RVEW_002 No.1.5・3", "q": ["閉じ方の分類（自動／手動）", "Phân loại cách đóng (tự động / thủ công)"],
     "a": ["自動で閉じる＝原因が他の画面で解消したとき（トラブル・トラブルの自動子・ドライバー未設定・変更申請の期限到来・子の確定待ち・欠配・出荷指示の再送が必要／送信失敗・請求漏れ〈子契約ができたとき〉）。手動で閉じる（対応済／対象外）＝予定生成不可・オーバーライドの失効／提案中・短消費期限の注意・確定生成の失敗・送り状の anomaly・出荷実績NG", "Tự đóng = khi nguyên nhân được giải quyết ở màn hình khác (sự cố, giao hàng con tự sinh của sự cố, chưa chỉ định tài xế, đến hạn yêu cầu đổi, chờ xác nhận giao con, giao thiếu, gửi lại / gửi thất bại lệnh xuất kho, sót yêu cầu thanh toán [khi hợp đồng con được tạo]). Đóng thủ công (対応済/対象外) = 予定生成不可, override hết hiệu lực / đang đề xuất, lưu ý hạn sử dụng ngắn, chốt tạo dữ liệu thất bại, số vận đơn bất thường, thực xuất NG"], "src": _SRC2},
    {"date": "2026-10-07", "target": "AW_RVEW_002 No.3.4・3.8・3.10・3.14・3.15・3.16・3.17・3.19・3.20", "q": ["区分ごとの詳細の中身", "Nội dung chi tiết theo từng loại"],
     "a": ["予定生成不可＝契約・拠点・サイクル・理由（候補日の表は出さない）／短消費期限の注意＝対象・出荷日〜納品日の日数・安全日数（既定2日）・商品の表（商品名／消費期限日数／出荷〜納品の日数／判定）／オーバーライド＝契約・拠点・状態・理由／出荷指示の送信失敗・再送＝出荷指示ID・配送No・理由（取込の行メッセージ）／出荷実績NG＝取込ファイル名・行番号・エラー内容（取込の備考 note）／請求漏れ＝契約・請求月・欠けている子契約／確定生成の失敗＝batch_errors の内容（対象・エラー内容・発生日時）／送り状の anomaly＝配送No・送り状番号・「出荷指示の送信成功記録がありません」", "予定生成不可 = hợp đồng, chi nhánh, chu kỳ, lý do (không hiển thị bảng ngày ứng viên) / lưu ý hạn sử dụng ngắn = đối tượng, số ngày xuất→giao, số ngày an toàn (mặc định 2), bảng sản phẩm (tên / số ngày hạn dùng / số ngày xuất→giao / phán định) / override = hợp đồng, chi nhánh, trạng thái, lý do / gửi thất bại & gửi lại lệnh xuất kho = ID lệnh xuất kho, số giao hàng, lý do (thông báo dòng khi nhập) / thực xuất NG = tên tệp, số dòng, nội dung lỗi (ghi chú note của lần nhập) / sót yêu cầu thanh toán = hợp đồng, tháng thanh toán, hợp đồng con còn thiếu / chốt tạo dữ liệu thất bại = nội dung batch_errors (đối tượng, nội dung lỗi, ngày giờ phát sinh) / số vận đơn bất thường = số giao hàng, số vận đơn, 「出荷指示の送信成功記録がありません」"], "src": _SRC2},
    {"date": "2026-10-07", "target": "AW_RVEW_001 No.2.2・AW_RVEW_002 No.1.1・3", "q": ["「件数しきい値の超過」「数量が届いていない（オーダー）」は区分に載せるか", "Có đưa 「件数しきい値の超過」 và 「数量が届いていない（オーダー）」 vào danh sách loại không"],
     "a": ["載せない（要確認の区分ではない）。件数しきい値の超過日は枠線と件数で示すだけで処理は止めない（配送_08 §5.2。15-9 の表にもない）。数量はオーダー枠を確定生成のときに必ず作り、注文がなければ標準数量（配送_10 No.3 の両立案）なので出ない。一覧・詳細の区分から外し、コードの区分名が残る点は demo_ok に書く", "Không đưa vào (không phải loại cần xác nhận). Ngày vượt ngưỡng số lượng chỉ hiện bằng khung viền và số lượng, không dừng xử lý (配送_08 §5.2; cũng không có trong bảng 15-9). Khung số lượng đặt hàng luôn được tạo khi chốt, không có đơn thì dùng số lượng tiêu chuẩn (phương án song song của 配送_10 No.3) nên không xuất hiện. Bỏ khỏi danh sách loại ở danh sách/chi tiết; phần code còn tên loại ghi ở demo_ok"], "src": _SRC2},
]
CHANGES = []

HIDE_ALWAYS = [".es-inline--info"]
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [
    {"code": "AW_RVEW_001", "ja": "要確認一覧", "vi": "Danh sách mục cần xác nhận"},
    {"code": "AW_RVEW_002", "ja": "要確認詳細", "vi": "Chi tiết mục cần xác nhận"},
]

H = (
    "const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));"
    "const setv=(el,v)=>{if(!el)return;const p=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;"
    "Object.getOwnPropertyDescriptor(p,'value').set.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}));};"
    "const setsel=(el,v)=>{if(!el)return;Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(el,v);el.dispatchEvent(new Event('change',{bubbles:true}));};"
    "const btn=(t,root)=>[...(root||document).querySelectorAll('button')].find(b=>(b.textContent||'').trim().includes(t));"
)


def I(no, ja, vi, sel, kind, trig="view", **kw):
    d = {"no": no, "ja": ja, "vi": vi, "sel": sel, "kind": kind, "trig": trig}
    d.update(kw)
    return d


def pick(items, *nos):
    by = {x["no"]: x for x in items}
    return [by[n] for n in nos]


KINDS = ["トラブル報告（未解決）", "子の確定待ち", "欠配", "予定生成不可", "リードタイム差", "3日超の移動", "短消費期限の注意", "変更申請の期限到来",
           "オーバーライドの失効・提案中", "ドライバー未設定", "出荷実績の数量差", "出荷指示の送信失敗", "出荷指示の再送", "出荷実績NG",
           "送り状の先行（anomaly）", "取込エラー", "請求漏れ", "確定生成の失敗"]

# ============================================================ AW_RVEW_001 一覧
L_ITEMS = [
    I("1", "ヘッダー", "Đầu trang", ".es-pagehead", "area",
      detail=["パンくず：配送管理 ＞ この画面の名前。メニュー「配送管理」の中の1画面。メニューのバッジ＝この一覧の「未対応」の件数（同じデータを数える）。権限は「出荷・配送管理」（フル権限・営業・CS・商品管理・商品開発＝CRUD、物流＝R/U、経理＝R）。",
              "Breadcrumb: 配送管理 > tên màn hình này. Là 1 màn trong menu 「配送管理」. Badge của menu = số dòng 「未対応」 của danh sách này (đếm cùng dữ liệu). Quyền theo 「出荷・配送管理」 (フル権限, 営業, CS, 商品管理, 商品開発 = CRUD; 物流 = R/U; 経理 = R)."]),
    I("1.1", "CSV出力", "Xuất CSV", ".es-pagehead__actions button::CSV出力", "button", "click", pattern="P-CSV-OUT", err=["S12"],
      detail=["ヘッダーの右。検索条件のとおりの全件。列：ID・区分・内容・対象・法人・拠点・納品日・検出・最終検出・状態。閲覧できる役割すべてに出す。",
              "Bên phải đầu trang. Toàn bộ dòng theo điều kiện tìm kiếm. Cột: ID, 区分, 内容, 対象, 法人・拠点, 納品日, 検出, 最終検出, 状態. Hiện với mọi vai trò xem được."],
      demo_ok=["コードは日付を MM-DD の短い形で出す。yyyy-mm-dd・yyyy-mm-dd HH:MM に揃える（台帳 M 日付の書き方）", "Code xuất ngày dạng MM-DD ngắn; sửa thành yyyy-mm-dd / yyyy-mm-dd HH:MM (sổ quyết định M: cách viết ngày)"]),
    I("2", "検索条件", "Điều kiện tìm kiếm", ".es-search", "area", pattern="P-LIST",
      detail=["「検索」か Enter で反映。区分・状態・キーワード・納品日で絞る。初期の並びは検出日時の新しい順。「未適用」の印は出さない。",
              "Áp dụng khi nhấn 検索 hoặc Enter. Lọc theo 区分, 状態, từ khóa, 納品日. Thứ tự ban đầu: 検出日時 mới nhất trước. Không hiện dấu 「未適用」."]),
    I("2.1", "キーワード", "Từ khóa", ".es-search__fields input[placeholder^=配送No]", "text", "input", req="－", len="文字列 60",
      ex=["DL-261109-0001", "Số giao hàng (DL-YYMMDD-NNNN); cũng có thể gõ ID dự định, tên công ty/chi nhánh"],
      cond=["欄の幅は下限 360px（全角約22字が見える）。60字まで入れられるので、はみ出す分は欄の中でスクロールする。", "Chiều rộng ô tối thiểu 360px (hiển thị khoảng 22 ký tự toàn góc). Nhập tối đa 60 ký tự nên phần dài hơn cuộn trong ô."],
      detail=["区分・内容・対象・法人・拠点・日付の文字に部分一致。入力欄の見出し文は「配送No・予定ID、法人・拠点・契約ID」。",
              "Khớp một phần với chữ trong 区分, 内容, 対象, 法人・拠点 và ngày. Gợi ý trong ô: 「配送No・予定ID、法人・拠点・契約ID」."],
      demo_ok=["見出し文には契約ID とあるが、検索の対象に契約ID の欄はない（法人・拠点の文字に入っているときだけ当たる）。見出し文か検索対象のどちらかを直す", "Gợi ý ghi 契約ID nhưng vùng tìm không có cột 契約ID (chỉ khớp khi nằm trong chữ 法人・拠点). Cần sửa gợi ý hoặc phạm vi tìm"]),
    I("2.2", "区分", "Loại", ".es-search__fields select[aria-label=区分]", "select", "select", req="－", len=["選択（全区分）", "Chọn (tất cả các loại)"], init=["（区分）", "(Loại)"],
      ex=["トラブル報告（未解決）", "Một trong các loại; có thể mở sẵn bằng URL ?kind="],
      detail=["全区分（配送_08 §15-9）：" + "・".join(KINDS) + "。URL の ?kind= で選んだ状態で開ける（スケジュールの月表示のパネルから）。",
              "Tất cả các loại (配送_08 §15-9): " + ", ".join(KINDS) + ". Có thể mở sẵn loại đã chọn bằng URL ?kind= (từ panel ở màn hình lịch tháng của スケジュール)."],
      demo_ok=["コードの区分のうち、実際に一覧に出るのは一部（トラブル・子の確定待ち・欠配・ドライバー未設定・変更申請の期限到来・オーバーライドの提案中）だけ。残りは検出の処理（バッチ）が未実装（配送_08 §15-9・H5）。コードの区分名に残る「件数しきい値の超過」「数量が届いていない（オーダー）」は要確認の区分ではないので外す（hong 指示 2026-10-07）。「確定生成の失敗」はコードにない", "Trong các loại, code chỉ sinh ra một phần (sự cố, chờ xác nhận giao con, giao thiếu, chưa chỉ định tài xế, hạn yêu cầu đổi, đề xuất override). Phần còn lại chưa có xử lý phát hiện (batch) (配送_08 §15-9, H5). Code còn tên loại 「件数しきい値の超過」 và 「数量が届いていない（オーダー）」, nhưng hai loại này không phải loại cần xác nhận nên bỏ khỏi danh sách (hong chỉ thị 2026-10-07); 「確定生成の失敗」 thì code chưa có"]),
    I("2.3", "状態", "Trạng thái", ".es-search__fields select[aria-label=すべての状態]", "select", "select", req="－", len=["選択（未対応／対応済／対象外）", "Chọn (chưa xử lý / đã xử lý / loại trừ)"], init=["未対応", "未対応 (Chưa xử lý)"],
      ex=["対応済", "Trạng thái xử lý: 未対応 (open), 対応済 (resolved), 対象外 (ignored)"],
      detail=["状態は3つ：未対応（open）・対応済（resolved）・対象外（ignored）。空にすると「すべての状態」。", "3 trạng thái: 未対応 (open), 対応済 (resolved), 対象外 (ignored). Để trống = 「すべての状態」."]),
    I("2.4", "納品日（から）", "Ngày giao (từ)", "input[aria-label=\"納品日（から）\"]", "date", "input", req="－", len="日付", ex=["2026-11-01", "Ngày giao từ (yyyy-mm-dd)"],
      detail=["納品日の範囲の始め。yyyy-mm-dd。", "Đầu khoảng ngày giao. yyyy-mm-dd."],
      demo_ok=["コードの絞り込みは年を 2026 に固定している（logic.ts）。2027年以降に動かなくなるので、年をデータの日付から取る（H4）", "Bộ lọc của code cố định năm 2026 (logic.ts) nên từ 2027 sẽ sai; lấy năm từ dữ liệu (H4)"]),
    I("2.5", "納品日（まで）", "Ngày giao (đến)", "input[aria-label=\"納品日（まで）\"]", "date", "input", req="－", len="日付", ex=["2026-11-30", "Ngày giao đến (yyyy-mm-dd)"],
      detail=["納品日の範囲の終わり。yyyy-mm-dd。", "Cuối khoảng ngày giao. yyyy-mm-dd."]),
    I("2.6", "クリア", "Xóa điều kiện", ".es-search__main button::クリア", "button", "click",
      detail=["条件を初期値（状態＝未対応・ほかは空）に戻して検索する。", "Đưa điều kiện về mặc định (状態 = 未対応, còn lại để trống) và tìm lại."]),
    I("2.7", "検索", "Tìm kiếm", ".es-search__main button[type=submit]", "button", "click",
      detail=["条件を反映する（Enter でも同じ）。結果のトーストは出さない。", "Áp dụng điều kiện (Enter cũng vậy). Không hiện toast kết quả."],
      demo_ok=["コードは検索のたびにトースト「検索しました（n件）」を出す（Message List にない）。外す（H12）", "Code hiện toast 「検索しました（n件）」 mỗi lần tìm (không có trong Message List). Bỏ (H12)"]),
    I("2.8", "並べ替え", "Sắp xếp", "-", "select", "select", req="－", len=["選択（一覧の全列）＋昇順／降順", "Chọn (mọi cột) + tăng/giảm"], init=["検出日時（降順）", "検出日時 (giảm dần)"],
      ex=["納品日（昇順）", "Chọn cột sắp xếp và chiều tăng/giảm"],
      detail=["並べる項目は一覧の全列（台帳 K 一覧の決まり）。初期は検出日時の新しい順。", "Cột để sắp xếp là mọi cột của danh sách (sổ quyết định K: quy tắc danh sách). Mặc định: 検出日時 mới nhất trước."],
      demo_ok=["コードに並べ替えがない。足す（H1）", "Code chưa có sắp xếp; thêm (H1)"]),
    I("3", "件数と説明", "Số lượng và giải thích", ".tools", "area",
      detail=["左：「{状態} {n}件（検出日時の新しい順）」。右：解消するまで残ること、同じ問題を再検出したときは件数を増やさず最終検出日時だけ更新することの説明。",
              "Trái: 「{状態} {n}件（検出日時の新しい順）」. Phải: giải thích mục sẽ còn đến khi giải quyết xong; phát hiện lại cùng vấn đề thì không tăng số lượng mà chỉ cập nhật 最終検出日時."],
      demo_ok=["並べ替えを足したら「（検出日時の新しい順）」の固定の文言を現在の並びに合わせる", "Khi thêm sắp xếp, sửa câu cố định 「（検出日時の新しい順）」 cho khớp thứ tự hiện tại"]),
    I("4", "一覧の表", "Bảng danh sách", ".es-table", "table", pattern="P-LIST",
      detail=["1ページの件数は 10／20／50／100 から選ぶ（既定10。決定 2026-10-08）。初期の並びは検出日時の新しい順。0件は I01。詳細から戻ったとき、検索条件・ページ・表示件数を戻す。横スクロールを出さない：画面幅 1440px に収める（列は「検出」と「最終検出」を1列にまとめた全9列。長い値は折り返すか省略する）。",
              "Số dòng/trang chọn trong 10 / 20 / 50 / 100 (mặc định 10; quyết định 2026-10-08). Thứ tự ban đầu: 検出日時 mới nhất trước. 0 dòng hiện I01. Quay lại từ chi tiết thì khôi phục điều kiện tìm kiếm, trang, số dòng. Không có thanh cuộn ngang: vừa trong chiều rộng màn hình 1440px (gộp 「検出」 và 「最終検出」 thành 1 cột, tổng 9 cột; giá trị dài thì xuống dòng hoặc rút gọn)."],
      demo_ok=["コードは詳細から戻ると必ず「状態＝未対応」の初期の条件に戻る（H3）。条件・ページを戻す", "Code luôn trả về điều kiện mặc định 「状態＝未対応」 khi quay lại từ chi tiết (H3); cần khôi phục điều kiện, trang"]),
    I("4.1", "No", "STT", ".es-table th::No", "label", detail=["表示中の通し番号（ページをまたいで続く）。", "Số thứ tự đang hiển thị (liên tục qua các trang)."]),
    I("4.2", "区分", "Loại", ".es-table th::区分", "label",
      detail=["全区分のどれか（バッジ）。色はコードの値：トラブル・欠配＝赤、子の確定待ち・ドライバー未設定・変更申請の期限到来＝黄、オーバーライドの提案中＝青。",
              "Một trong các loại (badge). Màu theo code: sự cố, giao thiếu = đỏ; chờ xác nhận giao con, chưa chỉ định tài xế, hạn yêu cầu đổi = vàng; đề xuất override = xanh dương."]),
    I("4.3", "内容", "Nội dung", ".es-table th::内容", "label", detail=["原因の文（1行・長いときは末尾を「…」で省略し、マウスを載せると全文を出す）。詳細の「原因の文」と同じ。", "Câu nêu nguyên nhân (1 dòng, dài thì rút gọn bằng 「…」 và hiện đầy đủ khi rê chuột). Giống 「原因の文」 ở chi tiết."]),
    I("4.4", "対象", "Đối tượng", ".es-table th::対象", "link", "click",
      detail=["配送No（DL-…）・予定ID・申請ID。配送Noなら出荷・配送管理の配送データ詳細へ。それ以外はこの項目の詳細へ。", "Số giao hàng (DL-…), ID dự định, ID yêu cầu. Nếu là số giao hàng thì mở chi tiết dữ liệu giao hàng của 出荷・配送管理; còn lại mở chi tiết của mục này."]),
    I("4.5", "法人・拠点", "Công ty・chi nhánh", ".es-table th::法人・拠点", "label", detail=["法人名（上段）と拠点名（下段）を2段で出し、長いときは折り返す（切らない・省略しない）。列の幅は画面幅に収まる範囲で広げすぎない。", "Tên công ty (dòng trên) và tên chi nhánh (dòng dưới) hiển thị 2 dòng; dài thì xuống dòng (không cắt, không rút gọn). Độ rộng cột vừa trong chiều rộng màn hình."]),
    I("4.6", "納品日", "Ngày giao", ".es-table th::納品日", "label",
      detail=["yyyy-mm-dd（曜日）。子の確定待ちは「（仮）」付き。", "yyyy-mm-dd (thứ). Loại chờ xác nhận giao con có kèm 「（仮）」."],
      demo_ok=["コードは MM/DD（曜）で出す。yyyy-mm-dd に揃える（H4）", "Code hiện MM/DD (thứ); sửa thành yyyy-mm-dd (H4)"]),
    I("4.7", "検出", "Phát hiện", ".es-table th::検出", "label", detail=["「検出」の1列に2段で出す。上段＝初めて検出した日時（first_detected_at）。yyyy-mm-dd HH:MM。下段＝最終検出（No.4.8）。横スクロールをなくすため、検出と最終検出は1列にまとめる（hong 指示 2026-10-08・役割レビュー）。", "Hiển thị 2 dòng trong 1 cột 「検出」. Dòng trên = ngày giờ phát hiện lần đầu (first_detected_at), yyyy-mm-dd HH:MM. Dòng dưới = 最終検出 (No.4.8). Gộp phát hiện và phát hiện gần nhất vào 1 cột để không còn thanh cuộn ngang (hong 2026-10-08, role review)."],
      demo_ok=["コードは MM-DD HH:MM。yyyy-mm-dd HH:MM に揃える（H4）", "Code hiện MM-DD HH:MM; sửa thành yyyy-mm-dd HH:MM (H4)"]),
    I("4.8", "最終検出", "Phát hiện gần nhất", "-", "label", detail=["「検出」の列の下段に「最終 yyyy-mm-dd HH:MM」で出す（last_detected_at。同じ問題を再検出するたびに更新）。列としては分けない。", "Hiển thị ở dòng dưới của cột 「検出」 dạng 「最終 yyyy-mm-dd HH:MM」 (last_detected_at; cập nhật mỗi lần phát hiện lại cùng vấn đề). Không tách thành cột riêng."]),
    I("4.9", "状態", "Trạng thái", ".es-table th::状態", "label",
      detail=["未対応＝黄、対応済＝緑、対象外＝灰（バッジ。P-STATUS-COLORS）。", "未対応 = vàng, 対応済 = xanh lá, 対象外 = xám (badge; P-STATUS-COLORS)."]),
    I("4.10", "操作", "Thao tác", ".es-table th::操作", "link", "click",
      detail=["各行に「詳細 ›」リンクを置き、全区分で詳細を開ける。未対応の行はさらに「対応する ›」を置く。「対応する ›」は原因の画面（配送データ詳細・スケジュール・出荷指示など）へ直接行く。権限がない（参照だけの）役割には「対応する ›」を出さない（「詳細 ›」は出す）。",
              "Mỗi dòng có link 「詳細 ›」, mở được chi tiết của mọi loại. Dòng 未対応 có thêm 「対応する ›」. 「対応する ›」 đi thẳng tới màn hình nguyên nhân (chi tiết dữ liệu giao hàng, スケジュール, 出荷指示...). Không hiện 「対応する ›」 với vai trò không có quyền (chỉ xem); 「詳細 ›」 vẫn hiện."],
      demo_ok=["H10：コードは参照だけの役割（経理）にも対応欄が出る。出さない。また、コードは未対応の行に「対応する ›」だけを置き、区分によっては原因の画面へ直接行って詳細を開けない。全行に「詳細 ›」を足す（hong 指示 2026-10-07）", "H10: code vẫn hiện ô xử lý với vai trò chỉ xem (経理); phải ẩn. Ngoài ra code chỉ đặt 「対応する ›」 ở dòng 未対応 và với một số loại thì đi thẳng tới màn hình nguyên nhân, không mở được chi tiết. Thêm 「詳細 ›」 vào mọi dòng (hong chỉ thị 2026-10-07)"]),
    I("4.11", "0件の表示", "Hiển thị khi 0 dòng", ".es-table tbody td[colspan]", "label", err=["I01"],
      detail=["条件に合う行がないときは表の中に I01。", "Khi không có dòng nào khớp điều kiện thì hiện I01 trong bảng."],
      demo_ok=["コードの文言「条件に合うデータはありません」を I01 に揃える（H17）", "Câu của code 「条件に合うデータはありません」 cần thống nhất về I01 (H17)"]),
    I("5", "ページ送り", "Phân trang", ".es-pagination", "area", pattern="P-PAGESIZE",
      detail=["「n件中 a–b件」・前へ・番号・次へ・表示件数（10／20／50／100。既定10）。", "「n件中 a–b件」, trước, số trang, sau, số dòng/trang (10 / 20 / 50 / 100; mặc định 10)."],
      demo_ok=["コードは表示件数を覚えない（H2）。利用者・一覧ごとに覚える", "Code không nhớ số dòng (H2); cần nhớ theo từng người và từng danh sách"]),
]

# ============================================================ AW_RVEW_002 詳細
def K(no, ja, vi, detail, chk=None, demo_ok=None):
    d = I(no, ja, vi, "-", "label", detail=detail)
    if chk:
        d["chk"] = chk
    if demo_ok:
        d["demo_ok"] = demo_ok
    return d


_NOKAI = ["区分別の追加の表示は仕様にない", "Chưa có quy định hiển thị bổ sung theo loại"]
D_KINDS = [
    K("3.1", "トラブル報告（未解決）", "Báo cáo sự cố (chưa giải quyết)",
      ["【載る条件】未解決のトラブル報告がある配送（報告の登録と同時に開く。配送データの状態は変えない）。【対象】配送。【閉じ方】自動：運営（物流）が配送のトラブルをまとめて解決すると、同じトランザクションで閉じる。【内容】トラブルの種類と報告メモ。【原因の画面】配送データ詳細のトラブルのタブ。（配送_08 §15-9・配送_07）",
       "[Điều kiện] giao hàng có báo cáo sự cố chưa giải quyết (mở cùng lúc khi đăng ký báo cáo; không đổi trạng thái giao hàng). [Đối tượng] giao hàng. [Cách đóng] tự động: khi 運営 (vận chuyển) giải quyết sự cố của giao hàng thì đóng trong cùng giao dịch. [Nội dung] loại sự cố và ghi chú báo cáo. [Màn nguyên nhân] tab sự cố ở chi tiết dữ liệu giao hàng. (配送_08 §15-9, 配送_07)"],
      demo_ok=["コードは未解決のまま「対応済」にできる。トラブルの解決で自動に閉じる形に直す（Q-RV3）", "Code cho phép bấm 「対応済」 khi sự cố chưa giải quyết; sửa thành tự đóng khi sự cố được giải quyết (Q-RV3)"]),
    K("3.2", "子の確定待ち", "Chờ xác nhận giao hàng con",
      ["【載る条件】トラブルの自動子（報告の登録と同時に作る子の配送）が未確定（日付・数量が未確定。状態＝確認中）。【対象】子の配送。【閉じ方】自動：トラブルの解決と同じトランザクションで閉じる。【内容】子の配送の内容メモ（1行目）と「日付・数量が未確定」。納品日は「（仮）」付き。（配送_08 §15-9）",
       "[Điều kiện] giao hàng con tự sinh của sự cố (tạo cùng lúc khi đăng ký báo cáo) chưa xác nhận (chưa chốt ngày/số lượng; trạng thái = 確認中). [Đối tượng] giao hàng con. [Cách đóng] tự động: đóng cùng giao dịch với việc giải quyết sự cố. [Nội dung] ghi chú nội bộ của giao hàng con (dòng 1) và 「日付・数量が未確定」. Ngày giao có kèm 「（仮）」. (配送_08 §15-9)"]),
    K("3.3", "欠配", "Giao thiếu (không hoàn tất)",
      ["【載る条件】最後の区間が自社・委託ドライバーの配送で、納品日を過ぎた翌朝（毎日06:00 の検知）になっても 納品済・中止・取消 のいずれでもない（状態＝出荷済・受取済で、未解決のトラブル報告がないもの）。状態は変えない（みなし完了にしない）。【対象】配送。【閉じ方】自動：納品済・中止・取消になると閉じる。【内容】お届け日と現在の状態。運送会社が直接配達する分は載らない（みなしで納品済）。（配送_06 §11-2・配送_08 §15-9）",
       "[Điều kiện] giao hàng có chặng cuối do tài xế tự có/ủy thác chở; qua ngày giao, đến sáng hôm sau (batch 06:00) vẫn chưa ở trạng thái 納品済/中止/取消 (trạng thái 出荷済 hoặc 受取済 và không có báo cáo sự cố chưa giải quyết). Không đổi trạng thái (không coi là hoàn tất). [Đối tượng] giao hàng. [Cách đóng] tự động: đóng khi thành 納品済/中止/取消. [Nội dung] ngày giao và trạng thái hiện tại. Phần do hãng vận chuyển giao trực tiếp thì không xuất hiện (coi như đã giao). (配送_06 §11-2, 配送_08 §15-9)"]),
    K("3.4", "予定生成不可", "Không tạo được dự định",
      ["【載る条件】納品日の振り替えで、20日以内に納品できる日が1つも見つからない／出荷不可日を振り替えられない。自動では日付を決めない。判定は灰「予定生成不可」。【対象】予定。【閉じ方】手動（対応済／対象外）：日付は「配送データ詳細の編集」で直し、戻って「対応済」。【内容】対象の契約・拠点・サイクル・理由（「20日以内に候補が無い」「出荷不可日を振り替えられない」のどちらか）。候補日の表は出さない（仕様にない）。（配送_02・配送_05 §9・配送_08 §15-9）",
       "[Điều kiện] khi dời ngày giao, không tìm được ngày giao nào trong 20 ngày / không dời được ngày không xuất hàng. Không tự quyết ngày. Phán định màu xám 「予定生成不可」. [Đối tượng] dự định. [Cách đóng] thủ công (対応済/対象外): sửa ngày ở 「配送データ詳細の編集」, quay lại rồi chọn 「対応済」. [Nội dung] hợp đồng, chi nhánh, chu kỳ, lý do (một trong 「20日以内に候補が無い」 / 「出荷不可日を振り替えられない」). Không hiển thị bảng ngày ứng viên (quy cách không có). (配送_02, 配送_05 §9, 配送_08 §15-9)"],
      demo_ok=["コードは区分に関係なく、この区分の見本（候補日の表・「20日以内に納品できる日が見つかりません」）を全件に出す（H5・Q-RV1）。候補日の表は仕様にないので出さない。実データの原因の文を出す", "Code hiện mẫu của loại này (bảng ngày ứng viên, 「20日以内に納品できる日が見つかりません」) cho mọi loại (H5, Q-RV1). Bảng ngày ứng viên không có trong quy cách nên không hiển thị; phải hiện câu nguyên nhân từ dữ liệu thật"]),
    K("3.5", "リードタイム差", "Chênh lead time",
      ["【載る条件】実リードタイム − 契約リードタイム ＞ 1日。判定は赤「実リードタイム N日（契約 M日・＋K日）」。【対象】予定または配送データ。【閉じ方】手動（日付系）。【内容】実リードタイム N日・契約リードタイム M日・差 K日。（配送_08 §15-5・§15-9）",
       "[Điều kiện] lead time thực − lead time hợp đồng > 1 ngày. Phán định màu đỏ 「実リードタイム N日（契約 M日・＋K日）」. [Đối tượng] dự định hoặc dữ liệu giao hàng. [Cách đóng] thủ công (liên quan ngày). [Nội dung] lead time thực N ngày, lead time hợp đồng M ngày, chênh K ngày. (配送_08 §15-5, §15-9)"]),
    K("3.6", "3日超の移動", "Dịch chuyển quá 3 ngày",
      ["【載る条件】本来の枠の日から3日を超えて動いた（連休・年末年始で数日先まで戻ることがある）。納品日の移動量に上限は置かない。【対象】予定または配送データ。【閉じ方】手動（日付系）。【内容】移動日数と本来の枠の日。（配送_02 §4-5・配送_08 §15-9）",
       "[Điều kiện] ngày bị dịch quá 3 ngày so với khung gốc (kỳ nghỉ dài, Tết... có thể phải lùi nhiều ngày). Không đặt giới hạn mức dịch ngày giao. [Đối tượng] dự định hoặc dữ liệu giao hàng. [Cách đóng] thủ công (liên quan ngày). [Nội dung] số ngày dịch và ngày của khung gốc. (配送_02 §4-5, 配送_08 §15-9)"]),
    K("3.8", "短消費期限の注意", "Lưu ý hạn sử dụng ngắn",
      ["【載る条件】出荷日〜納品日の日数 ＞ 消費期限日数 − 安全日数（既定2日。全社共通の設定）の商品を含む。予定の生成・再計算・倉庫の変更・複製のときに判定。分割は運営が判断する（自動で分割しない）。【対象】配送または予定。【閉じ方】手動（対応済／対象外）。【内容】対象（配送または予定）・出荷日〜納品日の日数・安全日数（既定2日）と、該当商品の表（商品名／消費期限日数／出荷〜納品の日数／判定）。（配送_08 §15-9・配送_01）",
       "[Điều kiện] có sản phẩm mà số ngày từ ngày xuất đến ngày giao > số ngày hạn sử dụng − số ngày an toàn (mặc định 2 ngày; cài đặt chung toàn công ty). Phán định khi tạo/tính lại dự định, đổi kho, nhân bản. 運営 quyết định việc tách (không tự tách). [Đối tượng] giao hàng hoặc dự định. [Cách đóng] thủ công (対応済/対象外). [Nội dung] đối tượng (giao hàng hoặc dự định), số ngày từ ngày xuất đến ngày giao, số ngày an toàn (mặc định 2 ngày) và bảng sản phẩm liên quan (tên sản phẩm / số ngày hạn sử dụng / số ngày xuất→giao / phán định). (配送_08 §15-9, 配送_01)"],
      demo_ok=["コードはこの区分を生成しない（検出の処理が未実装）。見本の中身（分割・倉庫を戻す・このまま出荷のラジオ）は決定（対応は記録だけ）と合わないので出さない", "Code không sinh loại này (chưa có xử lý phát hiện). Nội dung mẫu (radio tách/đưa kho về/giữ nguyên) không khớp quyết định (xử lý chỉ ghi nhận) nên không hiển thị"]),
    K("3.9", "変更申請の期限到来", "Đến hạn yêu cầu đổi ngày",
      ["【載る条件】処理期限（オーダー締切）の3日前（既定3日）になっても 申請中・提案中 のもの。締切を過ぎても運営が処理するまで残す（自動で却下しない）。【対象】配送または予定。【閉じ方】自動：変更申請を処理（承認・否認など）すると閉じる。【内容】オーダー締切日と申請の状況。【原因の画面】配送データ詳細の変更申請の枠。（配送_08 §15-9）",
       "[Điều kiện] yêu cầu vẫn ở trạng thái 申請中 / 提案中 khi còn 3 ngày (mặc định) tới hạn xử lý (chốt đặt hàng). Qua hạn vẫn giữ đến khi 運営 xử lý (không tự từ chối). [Đối tượng] giao hàng hoặc dự định. [Cách đóng] tự động: đóng khi yêu cầu đổi ngày được xử lý (duyệt, từ chối...). [Nội dung] ngày chốt đặt hàng và tình trạng yêu cầu. [Màn nguyên nhân] khung yêu cầu đổi ngày ở chi tiết giao hàng. (配送_08 §15-9)"]),
    K("3.10", "オーバーライドの失効・提案中", "Override hết hiệu lực / đang đề xuất",
      ["【載る条件】失効・提案中・再アンカーできなかったオーバーライド／適用中のオーバーライドが成立しなくなったもの（毎日03:00 の再検査）。法人の申請履歴にも残す。【対象】配送または予定。【閉じ方】手動（対応済／対象外）。【内容】対象の契約・拠点・状態（失効／提案中／再アンカー不可／成立しなくなった）・理由。コードで実際に出るのは「別の日のご提案（法人の返事待ち）」だけ。（配送_04 §8・配送_08 §15-9）",
       "[Điều kiện] override hết hiệu lực / đang đề xuất / không neo lại được; override đang áp dụng nhưng không còn thành lập (kiểm tra lại hằng ngày lúc 03:00). Cũng ghi vào lịch sử yêu cầu của công ty. [Đối tượng] giao hàng hoặc dự định. [Cách đóng] thủ công (対応済/対象外). [Nội dung] hợp đồng, chi nhánh, trạng thái (hết hiệu lực / đang đề xuất / không neo lại được / không còn thành lập), lý do. Code thực tế chỉ sinh 「別の日のご提案（法人の返事待ち）」. (配送_04 §8, 配送_08 §15-9)"],
      demo_ok=["コードの内容の文は「{日付} をご提案中（法人の返事待ち）」だけ。コードは詳細に別の区分の見本（候補日の表）を出す（H5）", "Câu nội dung của code chỉ là 「{ngày} をご提案中（法人の返事待ち）」. Code hiện mẫu của loại khác (bảng ngày ứng viên) ở chi tiết (H5)"]),
    K("3.11", "ドライバー未設定", "Chưa chỉ định tài xế",
      ["【載る条件】納品日の3日前になっても、割り当てる区間（自社・委託の区間）に担当がない。3日前と前日に委託配送会社Webにも表示し、委託の区間なら担当の委託配送会社へメールする。出荷は止めない。【対象】配送。【閉じ方】自動：担当を割り当てると閉じる。【内容】担当がいない区間（n次・運送会社）。（配送_06・配送_08 §15-9）",
       "[Điều kiện] đến 3 ngày trước ngày giao mà chặng cần chỉ định (tự có/ủy thác) chưa có người phụ trách. Hiển thị cả ở Web hãng vận chuyển ủy thác vào 3 ngày trước và ngày hôm trước; nếu là chặng ủy thác thì gửi mail cho hãng phụ trách. Không chặn xuất kho. [Đối tượng] giao hàng. [Cách đóng] tự động: đóng khi đã chỉ định người phụ trách. [Nội dung] chặng chưa có người phụ trách (lần n, hãng vận chuyển). (配送_06, 配送_08 §15-9)"]),
    K("3.13", "出荷実績の数量差", "Chênh số lượng thực xuất",
      ["【載る条件】出荷実績の取込で、出荷数（shipped_qty）が予定数（planned_qty）と違う。数量は自動で直さない。【対象】配送。【閉じ方】手動（連携系）。【内容】出荷数と予定数。（配送_12 §19.4）",
       "[Điều kiện] khi nhập thực xuất, số xuất (shipped_qty) khác số dự định (planned_qty). Không tự sửa số lượng. [Đối tượng] giao hàng. [Cách đóng] thủ công (liên quan liên kết). [Nội dung] số xuất và số dự định. (配送_12 §19.4)"]),
    K("3.14", "出荷指示の送信失敗", "Gửi lệnh xuất kho thất bại",
      ["【載る条件】出荷指示の送信が失敗し、再試行の上限を超えた（locked にはしない）。【対象】配送（出荷指示ID・配送No）。【閉じ方】自動：運営が「送信済にする」を押したとき閉じる。【内容】対象（出荷指示ID・配送No）・理由（取込の行メッセージ）。（配送_12 §16.10・§16.14）",
       "[Điều kiện] gửi lệnh xuất kho thất bại và vượt giới hạn thử lại (không chuyển sang locked). [Đối tượng] giao hàng (ID lệnh xuất kho, số giao hàng). [Cách đóng] tự động: đóng khi 運営 bấm 「送信済にする」. [Nội dung] đối tượng (ID lệnh xuất kho, số giao hàng), lý do (thông báo của dòng khi nhập). (配送_12 §16.10, §16.14)"],
      demo_ok=["コードはこの区分を生成しない（送信失敗は設計書に説明だけ・撮らない：D-2 確認メモ Q5＝C）", "Code không sinh loại này (chỉ mô tả trong thiết kế, không chụp: ghi chú xác nhận D-2 Q5 = C)"]),
    K("3.15", "出荷指示の再送", "Gửi lại lệnh xuất kho",
      ["【載る条件】最後に送信成功した版と今の内容が違う（毎日07:00 の差分検知）。「再送が必要：N件」。再送できるのは、その配送の出荷実績を受け取るまで。【対象】配送（出荷指示ID・配送No）。【閉じ方】自動：運営が「送信済にする」を押したとき閉じる。再送は「変更した行の CSV を出し、運営が THOMAS に登録して『送信済にする』を押す」（hong 回答 2026-10-07・出荷・配送管理 Q4＝B）。【内容】対象（出荷指示ID・配送No）・理由（取込の行メッセージ）。（配送_05 §10・配送_12 §16.12）",
       "[Điều kiện] nội dung hiện tại khác phiên bản đã gửi thành công gần nhất (phát hiện chênh lệch hằng ngày lúc 07:00). 「再送が必要：N件」. Chỉ gửi lại được đến khi nhận thực xuất của giao hàng đó. [Đối tượng] giao hàng (ID lệnh xuất kho, số giao hàng). [Cách đóng] tự động: đóng khi 運営 bấm 「送信済にする」. Gửi lại = 「xuất CSV các dòng đã đổi, 運営 đăng ký vào THOMAS rồi bấm 『送信済にする』」 (hong trả lời 2026-10-07, 出荷・配送管理 Q4 = B). [Nội dung] đối tượng (ID lệnh xuất kho, số giao hàng), lý do (thông báo của dòng khi nhập). (配送_05 §10, 配送_12 §16.12)"]),
    K("3.16", "出荷実績NG", "Thực xuất NG",
      ["【載る条件】出荷実績の取込で結果コードが ng。配送データの状態は変えない。【対象】配送。【閉じ方】手動（対応済／対象外）。【内容】取込ファイル名・行番号・エラー内容（取込の備考 note）。（配送_12 §19.4）",
       "[Điều kiện] khi nhập thực xuất, mã kết quả là ng. Không đổi trạng thái dữ liệu giao hàng. [Đối tượng] giao hàng. [Cách đóng] thủ công (対応済/対象外). [Nội dung] tên tệp nhập, số dòng, nội dung lỗi (ghi chú note của lần nhập). (配送_12 §19.4)"]),
    K("3.17", "送り状の先行（anomaly）", "Số vận đơn có trước (bất thường)",
      ["【載る条件】出荷指示の送信成功の記録がないのに送り状番号が付いている配送データ（毎日07:00 の検知、送り状番号の取込でも）。「出荷指示より先に送り状番号が付いています：N件」。locked にはしない。【対象】配送。【閉じ方】手動（連携系）。【内容】配送No・送り状番号・「出荷指示の送信成功記録がありません」。（配送_04 §8-6・配送_05・配送_12 §16.11）",
       "[Điều kiện] dữ liệu giao hàng chưa có bản ghi gửi lệnh xuất kho thành công nhưng đã gắn số vận đơn (phát hiện hằng ngày lúc 07:00, cả khi nhập số vận đơn). 「出荷指示より先に送り状番号が付いています：N件」. Không chuyển sang locked. [Đối tượng] giao hàng. [Cách đóng] thủ công (liên quan liên kết). [Nội dung] số giao hàng, số vận đơn, 「出荷指示の送信成功記録がありません」. (配送_04 §8-6, 配送_05, 配送_12 §16.11)"]),
    K("3.18", "取込エラー", "Lỗi nhập tệp",
      ["【載る条件】出荷実績・送り状番号の取込で誤りの行がある（1行の誤りでファイル全体は止めない）。【対象】取込（ファイル）。【閉じ方】手動（連携系）。【内容】取込のファイル、受け取った／飛ばした／誤りの行数、行ごとの理由。（配送_05・配送_12 §19.5）",
       "[Điều kiện] khi nhập thực xuất/số vận đơn có dòng lỗi (một dòng lỗi không làm dừng cả tệp). [Đối tượng] lần nhập (tệp). [Cách đóng] thủ công (liên quan liên kết). [Nội dung] tệp nhập, số dòng đã nhận / bỏ qua / lỗi, lý do từng dòng. (配送_05, 配送_12 §19.5)"]),
    K("3.19", "請求漏れ", "Sót yêu cầu thanh toán",
      ["【載る条件】請求確定日を過ぎた請求月で、有効な契約に子契約がない（毎日05:00 の検知）。【対象】契約×請求月。【閉じ方】自動：子契約ができたとき閉じる。【内容】対象の契約・請求月・欠けている子契約。【原因の画面】契約の子契約。（配送_04 §7・配送_09）",
       "[Điều kiện] tháng thanh toán đã qua ngày chốt thanh toán mà hợp đồng hiệu lực chưa có hợp đồng con (phát hiện hằng ngày lúc 05:00). [Đối tượng] hợp đồng × tháng thanh toán. [Cách đóng] tự động: đóng khi hợp đồng con được tạo. [Nội dung] hợp đồng, tháng thanh toán, hợp đồng con còn thiếu. [Màn nguyên nhân] hợp đồng con của hợp đồng. (配送_04 §7, 配送_09)"]),
    K("3.20", "確定生成の失敗", "Chốt tạo dữ liệu thất bại",
      ["【載る条件】確定生成のバッチが、再試行しても失敗した（batch_errors に記録）。【対象】失敗した対象。【閉じ方】手動（対応済／対象外）。【内容】batch_errors の内容（対象・エラー内容・発生日時）。（配送_08 §15-9・配送_09 §17-1）",
       "[Điều kiện] batch tạo dữ liệu chốt thất bại dù đã thử lại (ghi vào batch_errors). [Đối tượng] đối tượng bị lỗi. [Cách đóng] thủ công (対応済/対象外). [Nội dung] nội dung của batch_errors (đối tượng, nội dung lỗi, ngày giờ phát sinh). (配送_08 §15-9, 配送_09 §17-1)"],
      demo_ok=["コードはこの区分を生成しない（検出の処理が未実装）。バッチの失敗の記録（batch_errors）から要確認を出す", "Code không sinh loại này (chưa có xử lý phát hiện). Cần sinh mục cần xác nhận từ ghi nhận lỗi batch (batch_errors)"]),
]

D_ITEMS = [
    I("1", "ヘッダー", "Đầu trang", ".es-pagehead", "area",
      detail=["パンくず：配送管理 ＞ この一覧の名前 ＞ 詳細。タイトルに対象（配送Noなど）。見出しの下に区分・状態・検出日時。ボタンは右上。",
              "Breadcrumb: 配送管理 > tên danh sách này > Chi tiết. Tiêu đề có đối tượng (số giao hàng...). Dưới tiêu đề là 区分, 状態, ngày giờ phát hiện. Nút ở góc phải trên."]),
    I("1.1", "区分", "Loại", ".stat .es-badge", "label", detail=["全区分のどれか（バッジ）。区分によって下の「区分別の内容」「閉じ方」が変わる。", "Một trong các loại (badge). Mục 「区分別の内容」 bên dưới và cách đóng thay đổi theo loại."]),
    I("1.2", "状態", "Trạng thái", ".stat span.k::状態", "label", detail=["未対応（黄）／対応済（緑）／対象外（灰）。", "未対応 (vàng) / 対応済 (xanh lá) / 対象外 (xám)."]),
    I("1.3", "検出日時", "Ngày giờ phát hiện", ".stat > span:last-child", "label",
      detail=["「yyyy-mm-dd HH:MM ・ 最終検出 yyyy-mm-dd HH:MM」。初回検出（first_detected_at）と最終検出（last_detected_at）。",
              "「yyyy-mm-dd HH:MM ・ 最終検出 yyyy-mm-dd HH:MM」. Lần phát hiện đầu (first_detected_at) và gần nhất (last_detected_at)."],
      demo_ok=["コードは「（3回）」を固定で書く・日付を MM-DD で出す。回数は出さず、yyyy-mm-dd HH:MM で出す（H4・H7）", "Code ghi cứng 「（3回）」 và hiện ngày dạng MM-DD. Không hiện số lần; hiện yyyy-mm-dd HH:MM (H4, H7)"]),
    I("1.4", "対象外にする", "Chuyển sang 対象外", ".es-pagehead__actions button::対象外にする", "button", "click", err=["E32"],
      cond=["状態＝未対応で、出荷・配送管理の更新の権限がある役割だけに出す。全区分に出す（誤検出を逃がす入口はこの1つだけ）。見た目は副ボタン（枠線だけ・塗りなし・文字は標準色）にして、主ボタン「対応して閉じる」（塗りつぶし）と区別する。元に戻せない操作なので赤は使わず、押したあとに必ず確認の小窓（No.7）を挟む。ボタンの並びは「対象外にする（副）」「対応して閉じる（主）」の順で、主ボタンを右端に置く。", "Chỉ hiện khi 状態 = 未対応 và vai trò có quyền cập nhật 出荷・配送管理. Hiện cho mọi loại (đây là lối duy nhất để bỏ qua phát hiện nhầm). Giao diện là nút phụ (chỉ có viền, không tô nền, chữ màu chuẩn) để phân biệt với nút chính 「対応して閉じる」 (tô nền). Là thao tác không hoàn tác được nên không dùng màu đỏ, nhưng luôn có cửa sổ xác nhận (No.7) sau khi nhấn. Thứ tự nút: 「対象外にする」 (phụ) rồi 「対応して閉じる」 (chính), nút chính ở ngoài cùng bên phải."],
      detail=["押すと確認の小窓（Q136・No.7）が開く。小窓に理由の入力欄（必須・複数行 500字）があり、「対象外にする」で状態を対象外にして閉じる（S136）。理由は履歴に残る。理由の欄は「対応の内容」欄の理由とは共用しない。対象外にしたものは画面から元に戻せない。同じ問題をバッチがもう一度見つけたときは新しい「要確認」として出る（配送_08 §15-9：UNIQUE は open のときだけ）。ラジオの「対象外にする」は廃止（決定 2026-10-07）。",
              "Nhấn thì mở cửa sổ xác nhận (Q136, No.7). Trong cửa sổ có ô nhập lý do (bắt buộc, nhiều dòng, 500 ký tự); bấm 「対象外にする」 để chuyển 状態 sang 対象外 và đóng (S136). Lý do được lưu vào lịch sử. Ô lý do này không dùng chung với ô lý do ở khung 「対応」. Mục đã chuyển 対象外 không thể hoàn lại từ màn hình. Khi batch phát hiện lại cùng vấn đề thì xuất hiện thành mục cần xác nhận mới (配送_08 §15-9: UNIQUE chỉ áp dụng khi open). Radio 「対象外にする」 bị bỏ (quyết định 2026-10-07)."],
      demo_ok=["コードはヘッダのボタンを押すとすぐ閉じ（確認・理由なし）、ラジオ「対象外にする」＋「対応して閉じる」でも「対応済」になる（二重の入口）。入口をこのボタン1つにし、Q136 と小窓の理由欄を足す", "Code đóng ngay khi bấm nút ở đầu trang (không xác nhận, không lý do), và radio 「対象外にする」 + 「対応して閉じる」 lại thành 「対応済」 (hai lối). Chỉ giữ nút này, thêm Q136 và ô lý do trong cửa sổ"]),
    I("1.5", "対応して閉じる", "Xử lý xong và đóng", ".es-pagehead__actions button::対応して閉じる", "button", "click", err=["E04", "E32"],
      cond=["状態＝未対応で、更新の権限があり、手動で閉じる区分（予定生成不可・オーバーライドの失効／提案中・短消費期限の注意・確定生成の失敗・送り状の anomaly・出荷実績NG など）のときだけ。自動で閉じる区分（トラブル・トラブルの自動子・ドライバー未設定・変更申請の期限到来・子の確定待ち・欠配・出荷指示の再送が必要／送信失敗・請求漏れ）には出さない。原因が他の画面で解消すると自動で閉じる。", "Chỉ hiện khi 状態 = 未対応, có quyền cập nhật và loại đóng thủ công (予定生成不可, override hết hiệu lực/đang đề xuất, lưu ý hạn sử dụng ngắn, chốt tạo dữ liệu thất bại, số vận đơn bất thường, thực xuất NG...). Loại tự đóng (sự cố, giao hàng con tự sinh của sự cố, chưa chỉ định tài xế, đến hạn yêu cầu đổi, chờ xác nhận giao con, giao thiếu, gửi lại/gửi thất bại lệnh xuất kho, sót yêu cầu thanh toán) thì không hiện; các loại này tự đóng khi nguyên nhân được giải quyết ở màn hình khác."],
      valid=["「対応の内容（メモ）」「理由」はどちらも任意（各500文字まで）。理由が必須なのは「対象外にする」のときだけ。日付は入れない（この画面では日付を直さない）。", "「対応の内容（メモ）」 và 「理由」 đều tùy chọn (mỗi ô tối đa 500 ký tự). Lý do chỉ bắt buộc khi 「対象外にする」. Không nhập ngày (màn hình này không sửa ngày)."],
      detail=["押すと状態を対応済にして、対応者・日時・メモ・理由を残し、一覧へ戻る（S136）。日付の直しは先に「配送データ詳細の編集」で行う。閉じたあと、同じ問題を再検出したときは新しい行として出る（H6）。",
              "Nhấn thì chuyển 状態 sang 対応済, lưu người xử lý, ngày giờ, ghi chú, lý do và quay về danh sách (S136). Việc sửa ngày làm trước ở 「配送データ詳細の編集」. Sau khi đóng, nếu phát hiện lại cùng vấn đề thì xuất hiện thành mục mới (H6)."],
      demo_ok=["コードは同じ ID で再検出しても対応済のまま（状態を ID で持つ）。再検出は新しい行にする（H6）。押したあと一覧へ戻るとき、条件を保つ（H3）", "Code giữ 対応済 dù phát hiện lại cùng ID (giữ trạng thái theo ID); phát hiện lại phải thành dòng mới (H6). Khi quay về danh sách phải giữ điều kiện (H3)"]),
    I("2", "内容", "Nội dung", ".es-card", "area",
      detail=["読むだけ（入力欄ではない）。区分ごとの中身は「区分別の内容」。", "Chỉ đọc (không phải ô nhập). Nội dung riêng theo loại xem 「区分別の内容」."]),
    I("2.1", "対象", "Đối tượng", ".es-field::対象", "link", "click",
      detail=["配送No・予定ID・申請ID・契約など。配送データなら配送データ詳細へのリンク。", "Số giao hàng, ID dự định, ID yêu cầu, hợp đồng... Nếu là dữ liệu giao hàng thì là link tới chi tiết dữ liệu giao hàng."],
      demo_ok=["コードは文字だけ（リンクにしない）。リンクにする", "Code chỉ hiện chữ (không có link); cần là link"]),
    I("2.2", "法人・拠点", "Công ty・chi nhánh", ".es-field::法人・拠点", "label", detail=["法人名＋拠点名。", "Tên công ty + tên chi nhánh."]),
    I("2.3", "納品日", "Ngày giao", ".es-field::納品日", "label", detail=["yyyy-mm-dd（曜日）。日付系の区分は「本来の納品日」。", "yyyy-mm-dd (thứ). Loại liên quan ngày ghi 「本来の納品日」."],
      demo_ok=["コードは見本の日付（2026-11-20）を固定で出す。押した行の値を出す（H5）", "Code hiện cứng ngày mẫu (2026-11-20); phải hiện giá trị của dòng đã chọn (H5)"]),
    I("2.4", "原因の文", "Câu nêu nguyên nhân", ".es-inline--negative", "area",
      detail=["何が起きたかを1〜2文で示す枠（一覧の「内容」と同じ文）。区分によって内容が違う。", "Khung nêu 1–2 câu về điều đã xảy ra (cùng câu với cột 「内容」 ở danh sách). Nội dung khác nhau theo loại."],
      demo_ok=["コードは区分に関係なく見本の文（20日以内に納品できる日が見つかりません）を出す（H5・Q-RV1）。実データの文を出す", "Code hiện câu mẫu (20日以内に納品できる日が見つかりません) cho mọi loại (H5, Q-RV1); phải hiện câu từ dữ liệu thật"]),
    I("2.5", "対象の画面へ", "Đến màn hình đối tượng", "-", "link", "click",
      detail=["原因のある画面へのリンク（例：配送データ詳細・配送データ詳細の編集・スケジュール・契約の子契約）。日付を直すときはここから「配送データ詳細の編集」へ行き、直したら戻って「対応済」にする（Q-RV2）。",
              "Link tới màn hình có nguyên nhân (ví dụ: chi tiết dữ liệu giao hàng, 配送データ詳細の編集, スケジュール, hợp đồng con). Khi sửa ngày, đi từ đây tới 「配送データ詳細の編集」, sửa xong quay lại chọn 「対応済」 (Q-RV2)."],
      demo_ok=["コードは「関連」の見本のリンク（拠点の受取不可日・スケジュールの日表示など）だけで、対象の画面へのリンクがない。足す", "Code chỉ có link mẫu ở 「関連」 (ngày không nhận của chi nhánh, lịch ngày...), chưa có link tới màn hình đối tượng; cần thêm"]),
    I("3", "区分別の内容", "Nội dung theo loại", "-", "area",
      detail=["全区分に専用の詳細がある（決定 2026-10-07 Q-RV1＝B）。ここは区分ごとの「載る条件・対象・閉じ方・内容」を、仕様（配送_08 §15-9 ほか）と hong 指示 2026-10-07（定義の補足）にあるものだけ書く。画面では「内容」の下に、その区分の中身（原因の文・追加の表）を出す。",
              "Tất cả các loại đều có chi tiết riêng (quyết định 2026-10-07 Q-RV1 = B). Ở đây chỉ ghi 「điều kiện xuất hiện, đối tượng, cách đóng, nội dung」 của từng loại theo đúng quy cách (配送_08 §15-9 và các phần khác) và chỉ thị bổ sung của hong 2026-10-07. Nội dung không có trong quy cách và chỉ thị bổ sung của hong 2026-10-07 thì không tự thêm. Trên màn hình, dưới 「内容」 hiện phần riêng của loại đó (câu nguyên nhân, bảng bổ sung)."],
      demo_ok=["コードは見本の#142（予定生成不可）と#156（消費期限の注意）だけ中身があり、ほかの区分は見本#142の中身を出す。かつ実データでは全件が#142の見本になる（番号を入れない）。区分ごとの中身に直す", "Code chỉ có nội dung cho mẫu #142 (予定生成不可) và #156 (消費期限の注意), loại khác hiện nội dung mẫu #142; với dữ liệu thật thì mọi mục đều thành mẫu #142 (không gán số). Sửa thành nội dung theo từng loại. 「件数しきい値の超過」 và 「数量が届いていない（オーダー）」 không phải loại cần xác nhận nên bỏ khỏi tên loại/mẫu của code (ngày vượt ngưỡng chỉ hiện bằng khung viền và số lượng ở lịch [配送_05 §9, §5.2]; khung số lượng đặt hàng luôn được tạo khi chốt, không có đơn thì dùng số lượng tiêu chuẩn [配送_10 No.3]; hong chỉ thị 2026-10-07)"]),
] + D_KINDS + [
    I("4", "対応", "Xử lý", ".es-section-title::対応", "area", cond=["状態＝未対応で、更新の権限がある役割だけに出す（参照だけの役割には出さない）。", "Chỉ hiện khi 状態 = 未対応 và vai trò có quyền cập nhật (không hiện với vai trò chỉ xem)."],
      detail=["画面の並びは、内容（No.2）→区分別の内容（No.3）→対応（この欄）→履歴（No.5）→関連（No.6）の番号順。対応欄は内容の直下に置く（履歴・関連の下に置かない）。この画面は記録だけ。日付は「配送データ詳細の編集」で直し、ここでは対応の内容と理由を残す（決定 2026-10-07 Q-RV2）。日付の欄とラジオ「日付を指定して解決」「この回は納品しない（スキップ）」「対象外にする」は置かない。",
              "Thứ tự trên màn hình theo số: nội dung (No.2) → nội dung theo loại (No.3) → xử lý (mục này) → lịch sử (No.5) → liên quan (No.6). Ô xử lý đặt ngay dưới phần nội dung (không đặt dưới lịch sử/liên quan). Mục này chỉ để ghi nhận. Ngày được sửa ở 「配送データ詳細の編集」; ở đây chỉ lưu nội dung xử lý và lý do (quyết định 2026-10-07 Q-RV2). Không có ô ngày và radio 「日付を指定して解決」「この回は納品しない（スキップ）」「対象外にする」."],
      demo_ok=["H10：コードは参照だけの役割にも欄を出す。ラジオ・日付欄・「法人への連絡」のチェックを外す（Q-RV2）", "H10: code hiện ô cả với vai trò chỉ xem. Bỏ radio, ô ngày và checkbox 「法人への連絡」 (Q-RV2)"]),
    I("4.1", "対応の内容（メモ）", "Nội dung xử lý (ghi chú)", ".es-field::対応の内容", "textarea", "input", req="－", len=["文字列 500（複数行）", "Chuỗi tối đa 500 (nhiều dòng)"], err=["E04", "E13"],
      ex=["配送データ詳細の編集で納品日を2026-12-11に変更した。法人へ連絡済み。", "Ghi chú xử lý (nhiều dòng, tối đa 500 ký tự), ví dụ đã sửa ngày giao ở màn chỉnh sửa và đã liên hệ công ty"],
      detail=["やった対応のメモ。任意（resolution_note）。複数行・500文字まで。履歴に残る。", "Ghi chú việc đã làm. Tùy chọn (resolution_note). Nhiều dòng, tối đa 500 ký tự. Lưu vào lịch sử."],
      demo_ok=["コードの「対応の内容」はラジオ（日付を指定して解決ほか）。メモの複数行の欄に変える。内部コードの文字（date：…）を履歴に出さない（H11）", "「対応の内容」 của code là radio (日付を指定して解決...). Đổi thành ô ghi chú nhiều dòng; không hiện chuỗi mã nội bộ (date：…) ở lịch sử (H11)"]),
    I("4.2", "理由", "Lý do", ".es-field::理由", "textarea", "input", req="－", len=["文字列 500（複数行）", "Chuỗi tối đa 500 (nhiều dòng)"], err=["E04", "E13"],
      ex=["拠点の倉庫移転に合わせ、移転後の最初の納品可能日に変更するため", "Lý do xử lý (nhiều dòng, tối đa 500 ký tự), ví dụ đổi sang ngày giao đầu tiên sau khi chi nhánh chuyển kho"],
      valid=["任意。500文字まで。前後の空白を取る。理由が必須なのは「対象外にする」の小窓の理由欄（No.7.1）だけで、この欄とは共用しない。", "Tùy chọn. Tối đa 500 ký tự. Bỏ khoảng trắng đầu/cuối. Lý do chỉ bắt buộc ở ô lý do của cửa sổ 「対象外にする」 (No.7.1), không dùng chung với ô này."],
      detail=["「対応して閉じる」で残す理由。任意。履歴に残る。", "Lý do để lại khi 「対応して閉じる」. Tùy chọn. Lưu vào lịch sử."],
      demo_ok=["H8：コードは1行の欄で最大文字数がなく、必須。複数行・500文字・任意にする（必須は「対象外にする」の小窓の理由欄だけ。hong 指示 2026-10-07）。H9：コードの文言「理由を入力してください」は小窓の理由欄で E01 に揃える", "H8: code là ô 1 dòng, không giới hạn ký tự và bắt buộc; đổi thành nhiều dòng, 500 ký tự, tùy chọn (chỉ ô lý do của cửa sổ 「対象外にする」 là bắt buộc; hong chỉ thị 2026-10-07). H9: câu 「理由を入力してください」 của code thống nhất về E01 ở ô lý do của cửa sổ"]),
    I("4.3", "配送データ詳細の編集へ", "Đến 配送データ詳細の編集", "-", "link", "click",
      cond=["日付系の区分（予定生成不可・リードタイム差・3日超の移動）のとき。配送データがある対象だけ。", "Khi loại liên quan ngày (予定生成不可, リードタイム差, 3日超の移動). Chỉ với đối tượng có dữ liệu giao hàng."],
      detail=["日付を直す入口。出荷日の前日までは配送データ詳細の「編集」から1件ずつ（理由必須・同じ前半／後半）、出荷日の当日以降は取消＋複製（配送_08 §15-9）。直したら、この画面へ戻って「対応して閉じる」。",
              "Lối để sửa ngày. Đến trước ngày xuất 1 ngày thì sửa từng dữ liệu ở 「編集」 của chi tiết dữ liệu giao hàng (bắt buộc lý do, cùng nửa đầu/nửa sau); từ ngày xuất trở đi thì hủy + nhân bản (配送_08 §15-9). Sửa xong thì quay lại màn hình này bấm 「対応して閉じる」."],
      demo_ok=["コードにない（日付を直す欄をこの画面に持っていた）。リンクを足す（Q-RV2）", "Code chưa có (code để ô sửa ngày ngay ở màn hình này). Thêm link (Q-RV2)"]),
    I("4.4", "対応欄の注記", "Ghi chú dưới ô xử lý", ".es-card .note", "label",
      detail=["「対応して閉じる」で状態を対応済にし、対応者・日時・内容・理由（どちらも任意）を残す。同じ問題を再検出したときは新しい行として出る。", "「対応して閉じる」 chuyển 状態 sang 対応済 và lưu người xử lý, ngày giờ, nội dung, lý do. Phát hiện lại cùng vấn đề thì xuất hiện thành mục mới."],
      demo_ok=["コードの注記は見本の区分だけ「再び起きたら新しい要確認」と書く。全区分で同じにし、コードも ID を固定せず新しい行にする（H6）", "Chú thích của code chỉ có ở loại mẫu. Thống nhất mọi loại; code cũng không cố định ID mà tạo dòng mới (H6)"]),
    I("5", "検出と対応の履歴", "Lịch sử phát hiện và xử lý", ".es-timeline", "area",
      detail=["表示だけ（直せない・消せない）。新しいものが上。行：検出（初回・システム）／最終検出（システム）／対応（対応済・対象外にした人・日時・対応の内容・理由）。",
              "Chỉ xem (không sửa, không xóa). Mới nhất ở trên. Dòng: phát hiện (lần đầu, hệ thống) / phát hiện gần nhất (hệ thống) / xử lý (người chuyển 対応済・対象外, ngày giờ, nội dung xử lý, lý do)."],
      demo_ok=["コードは作り物の履歴（「物流 田中」のメモ・「システム」の再検出3行）と内部コード（date：…）を出す（H7・H11）。持っている値（初回検出・最終検出・対応）だけにして、新しいものを上にする", "Code hiện lịch sử giả (ghi chú 「物流 田中」, 3 dòng phát hiện lại của 「システム」) và mã nội bộ (date：…) (H7, H11). Chỉ giữ các giá trị thật (lần đầu, gần nhất, xử lý) và đặt mới nhất ở trên"]),
    I("6", "関連", "Liên quan", ".rv", "area",
      detail=["関連する画面へのリンク（区分によって違う）。", "Link tới các màn hình liên quan (khác nhau theo loại)."],
      demo_ok=["コードのリンクは見本の区分のものを固定で出す。区分ごとに「対象の画面へ」（No.2.5）に置き換える", "Link của code là cố định theo loại mẫu. Thay bằng 「対象の画面へ」 (No.2.5) theo từng loại"]),
    I("7", "対象外にする確認の小窓", "Cửa sổ xác nhận 対象外", "-", "modal", "show", err=["Q136"],
      detail=["ヘッダーの「対象外にする」を押すと出る。本文は Q136（メッセージ一覧の文）と、理由の入力欄（必須）。入力があるので、小窓の外のクリック・Esc・×・キャンセルでは何も保存せず小窓だけ閉じる。",
              "Hiện khi bấm 「対象外にする」 ở đầu trang. Nội dung là Q136 (câu trong danh sách thông báo) và ô nhập lý do (bắt buộc). Có nội dung nhập nên bấm ngoài cửa sổ, Esc, ×, キャンセル chỉ đóng cửa sổ, không lưu gì."],
      demo_ok=["コードにない（ボタンを押すとすぐ閉じる）。足す", "Code chưa có (bấm nút là đóng ngay). Thêm"]),
    I("7.1", "理由（対象外）", "Lý do (対象外)", "-", "textarea", "input", req="○", len=["文字列 500（複数行）", "Chuỗi tối đa 500 (nhiều dòng)"], err=["E01", "E04", "E13"],
      ex=["同じ配送の別の要確認で対応済みのため、この件は閉じる", "Lý do chuyển 対象外 (nhiều dòng, tối đa 500 ký tự), ví dụ đã xử lý ở mục cần xác nhận khác của cùng giao hàng nên đóng mục này"],
      valid=["必須。500文字まで。前後の空白を取る。空なら E01（項目の下）。「対応の内容」欄の理由（No.4.2）とは共用しない。", "Bắt buộc. Tối đa 500 ký tự. Bỏ khoảng trắng đầu/cuối. Để trống hiện E01 (dưới ô). Không dùng chung với ô lý do ở khung 「対応」 (No.4.2)."],
      detail=["対象外にする理由。履歴に残る。", "Lý do chuyển sang 対象外. Lưu vào lịch sử."],
      demo_ok=["コードにない（小窓がない）。足す", "Code chưa có (không có cửa sổ). Thêm"]),
    I("7.2", "対象外にする（確定）", "対象外にする (xác nhận)", "-", "button", "click", err=["E01", "E177", "E30", "E31", "E32"],
      detail=["理由が空なら小窓を閉じず、理由の欄に E01。理由があれば状態を対象外にして閉じ、S136 を出して一覧へ戻る。対象外にしたものは画面から元に戻せない。",
              "Nếu lý do trống thì không đóng cửa sổ mà hiện E01 ở ô lý do. Có lý do thì chuyển 状態 sang 対象外 và đóng, hiện S136 rồi quay về danh sách. Mục đã chuyển 対象外 không thể hoàn lại từ màn hình."],
      demo_ok=["コードにない。足す", "Code chưa có. Thêm"]),
    I("7.3", "キャンセル（対象外）", "キャンセル (対象外)", "-", "button", "click",
      detail=["何も保存せず小窓を閉じる。", "Đóng cửa sổ, không lưu gì."],
      demo_ok=["コードにない。足す", "Code chưa có. Thêm"]),
    I("8", "完了のトースト", "Toast hoàn tất", "-", "toast", "show", err=["S136"],
      detail=["対応済み・対象外にしたときの S136。トーストのあと一覧へ戻る。", "S136 khi chuyển sang 対応済 / 対象外. Sau toast thì quay về danh sách."],
      demo_ok=["コードの文言は「要確認を対応済みにしました」（句点なし）。S136 に揃える（H9）", "Câu của code là 「要確認を対応済みにしました」 (không có dấu chấm). Thống nhất về S136 (H9)"]),
    I("9", "エラーのトースト", "Toast lỗi", "-", "toast", "show", err=["E177", "E30", "E31", "E32"],
      detail=["開いている間にほかの人が閉じた・自動で閉じたとき E177。保存できないとき E30。ほかの人が先に更新したとき E31。権限がないとき E32。", "Khi trong lúc mở đã có người khác đóng/tự động đóng thì E177. Không lưu được thì E30. Người khác cập nhật trước thì E31. Không có quyền thì E32."],
      demo_ok=["コードは409（ほかの人が先に閉じた）の表示がない。E177 を足す", "Code chưa hiển thị lỗi 409 (người khác đã đóng trước). Thêm E177"]),
    I("10", "見つかりません", "Không tìm thấy", ".es-empty", "area", err=["E100"],
      detail=["存在しない ID の URL を開いたとき、見出しと空の表示。「{対象}（{ID}）が見つかりません。」（対象＝この項目）。一覧へ戻るリンク。", "Khi mở URL có ID không tồn tại: hiện tiêu đề và vùng trống. 「{対象}（{ID}）が見つかりません。」 ({対象} = mục này). Có link quay về danh sách."],
      demo_ok=["コードの文言「要確認が見つかりません」を E100 に揃える", "Câu 「要確認が見つかりません」 của code cần thống nhất về E100"]),
]


def V(id, code, ja, vi, url, items, setup="", note=None, full=True, wait=500, login=None):
    v = {"id": id, "code": code, "state": [ja, vi], "url": url, "setup": (H + setup) if setup else "", "full": full, "wait": wait, "note": note or ["", ""], "items": items}
    if login: v["login"] = login
    return v


_LIST_COMMON = pick(L_ITEMS, "1", "1.1", "2", "2.1", "2.2", "2.3", "2.4", "2.5", "2.6", "2.7", "2.8", "3", "4", "4.1", "4.2", "4.3", "4.4", "4.5", "4.6", "4.7", "4.8", "4.9", "4.10", "5")
_SEARCH_ADDR = "setv(document.querySelector('.es-search__fields input[placeholder^=配送No]'),'該当なし');document.querySelector('.es-search__main button[type=submit]').click();await sleep(700);"
_CLOSE_THEN_LIST = (
    "const b=btn('対応して閉じる');if(b){b.click();await sleep(1500);}"
    "setsel(document.querySelector('select[aria-label=すべての状態]'),'対応済');await sleep(300);"
    "document.querySelector('.es-search__main button[type=submit]').click();await sleep(800);"
)

VIEWS = [
    V("001", "AW_RVEW_001", "初期表示（状態＝未対応・検出の新しい順）", "Ban đầu (状態 = 未対応, mới phát hiện trước)", "/ops/delivery/review", _LIST_COMMON,
      note=["状態＝未対応・検出日時の新しい順・1ページ10件。並べ替え・表示件数の記憶・日付の書き方はコードが未対応（宿題）。", "状態 = 未対応, 検出日時 mới nhất trước, 10 dòng/trang. Sắp xếp, nhớ số dòng, cách viết ngày: code chưa có (việc phải sửa)."]),
    V("002", "AW_RVEW_001", "区分で絞り込み", "Lọc theo loại", "/ops/delivery/review?kind=トラブル報告（未解決）",
      pick(L_ITEMS, "2.2", "2.7", "3", "4", "4.2", "4.3", "4.4", "4.10"),
      note=["URL の ?kind= で区分を選んだ状態で開く（スケジュールの月表示のパネルから）。区分を選んで「検索」でも同じ。", "Mở sẵn loại đã chọn bằng ?kind= trong URL (từ panel ở lịch tháng của スケジュール). Chọn loại rồi bấm 「検索」 cũng được."]),
    V("003", "AW_RVEW_001", "0件", "0 dòng", "/ops/delivery/review", pick(L_ITEMS, "2.1", "2.7", "4", "4.11"), setup=_SEARCH_ADDR,
      note=["該当のない言葉で検索した。表の中に I01。", "Tìm bằng từ không khớp. Bảng hiện I01."]),
    V("004", "AW_RVEW_002", "詳細 初期表示（未対応・手動で閉じる区分）", "Chi tiết: ban đầu (未対応, loại đóng thủ công)", "/ops/delivery/review/RV-PR-DD-20261005-0095",
      [x for x in D_ITEMS if x["no"] not in ("10",)],
      note=["見本：別の日のご提案（オーバーライドの提案中）。決定どおりの対応欄（メモ・理由）・対象外の入口・区分別の内容はコードが未対応（宿題）。自動で閉じる区分の詳細は、見本データに ID を確かめてから撮る。", "Mẫu: 別の日のご提案 (đề xuất override). Ô xử lý (ghi chú, lý do), cửa 対象外, nội dung theo loại đúng quyết định: code chưa có (việc phải sửa). Chi tiết của loại tự đóng chụp sau khi xác nhận ID trong dữ liệu mẫu."]),
    V("005", "AW_RVEW_002", "詳細 入力エラー（対象外の理由が空）", "Chi tiết: lỗi nhập (lý do 対象外 trống)", "/ops/delivery/review/RV-PR-DD-20261005-0095",
      pick(D_ITEMS, "1.4", "7", "7.1", "7.2"),
      note=["「対象外にする」を押し、理由を空のまま小窓の「対象外にする」を押した。理由の下に E01。コードにはこの小窓がまだない（宿題）。", "Bấm 「対象外にする」, để trống lý do rồi bấm 「対象外にする」 trong cửa sổ. Dưới ô lý do hiện E01. Code chưa có cửa sổ này (việc phải sửa)."]),
    V("006", "AW_RVEW_002", "見つかりません", "Không tìm thấy", "/ops/delivery/review/XXX", pick(D_ITEMS, "1", "10"),
      note=["存在しない ID。", "ID không tồn tại."]),
    V("007", "AW_RVEW_002", "詳細 対応済（閉じたあと）", "Chi tiết: 対応済 (sau khi đóng)", "/ops/delivery/review/RV-PR-DD-20261005-0095",
      pick(D_ITEMS, "1", "1.1", "1.2", "1.3", "2", "5", "8"), setup=_CLOSE_THEN_LIST + "const a=[...document.querySelectorAll('td.c a')].find(x=>(x.textContent||'').includes('詳細'));if(a){a.click();await sleep(1200);}",
      note=["「対応して閉じる」のあと、状態＝対応済で開き直した。対応欄と2つのボタンは出ない。履歴に対応者・日時。この状態を撮ると見本データの状態が変わるので、001〜006 のあとに撮る。", "Sau khi 「対応して閉じる」, mở lại với 状態 = 対応済. Không còn ô xử lý và 2 nút. Lịch sử có người xử lý, ngày giờ. Chụp trạng thái này sẽ làm đổi dữ liệu mẫu nên chụp sau 001–006."]),
    V("008", "AW_RVEW_001", "状態＝対応済", "状態 = 対応済", "/ops/delivery/review", pick(L_ITEMS, "2.3", "2.7", "4", "4.9", "4.10"),
      setup="setsel(document.querySelector('select[aria-label=すべての状態]'),'対応済');await sleep(300);document.querySelector('.es-search__main button[type=submit]').click();await sleep(800);",
      note=["状態を対応済にして検索。操作の列は「詳細 ›」。007 のあとに撮る。", "Chọn 状態 là 対応済 rồi tìm. Cột thao tác là 「詳細 ›」. Chụp sau 007."]),
    V("009", "AW_RVEW_002", "詳細 参照のみの役割（経理 R・未対応）", "Chi tiết: vai trò chỉ xem (経理 R, 未対応)", "/ops/delivery/review/RV-PR-DD-20261005-0095",
      pick(D_ITEMS, "1", "1.1", "1.2", "1.3") + [dict(x, sel="-") for x in pick(D_ITEMS, "1.4", "1.5", "4")], login="Ad00012",
      note=["経理（出荷・配送管理＝R）で、未対応の詳細を開いた。ヘッダーの「対象外にする」「対応して閉じる」と、対応欄（No.4）は出ない（状態が未対応でも出さない。007 は対応済で別の理由）。004 と同じ行なので、007 が行を閉じる前（004 のあと）に撮る。", "Mở chi tiết mục 未対応 bằng 経理 (出荷・配送管理 = R). Hai nút 「対象外にする」「対応して閉じる」 ở đầu trang và ô xử lý (No.4) không hiện (dù 状態 là 未対応; 007 là 対応済 nên ẩn vì lý do khác). Cùng dòng với 004 nên chụp trước khi 007 đóng dòng (sau 004)."]),
]
