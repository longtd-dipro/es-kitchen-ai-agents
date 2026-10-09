# -*- coding: utf-8 -*-
"""
委託配送先Web「配送管理（一覧＋一括設定・詳細）」（OW_DELV）の画面設計書データ。
元：本物の Web（app/carrier/deliveries/page.tsx・[id]/page.tsx・_ui/csv.tsx・_ui/alt.tsx・lib/carrier/{logic,fromDomain,area}.ts）。
決定：docs/決定台帳.md F（2026-10-07：委託配送先に拠点の電話・担当者・理論在庫を見せる／集金管理・配送詳細の備考は保存／一覧の並べ替え・ページ送りは標準）、
      台帳 K・M-1（一覧の標準・CSV出力）、台帳 S（2026-10-08：#427 完了から90日・#430 予定にも割当・#431 初期の期間と並び・#446 最大文字数・#451 営業サンプル）、
      確認メモ_TW_委託配送先 §3（H-1〜H-5・H-15・H-27〜H-34）。
コードがまだ決定に追いついていないところは demo_ok。「割当期間：納品日の7日前〜前日」の扱いは要確認（open・ask: hong）。
見本データで撮れない状態（出荷済・受取済・確認中のとき、路線便の送り状、代替品の荷物の中身、他）は demo_ok に理由を書く。
"""

TITLE = ["配送管理（OW_DELV）", "Quản lý giao hàng (OW_DELV)"]
SHEET = ["配送管理", "Quản lý giao hàng"]
BASENAME = "画面設計書_OW_DELV_配送管理"
IMG_PREFIX = "OW_DELV"
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
    {"date": "2026-10-08", "target": "OW_DELV_002 No.32・39.3・40",
     "q": ["委託配送先が消せる資料", "Tài liệu mà đối tác giao hàng được xóa"],
     "a": ["自分でアップロードしたファイルだけ消せる。お客様がアップロードした資料は見るだけで消せない", "Chỉ xóa được tệp do chính mình tải lên. Tài liệu do khách tải lên chỉ xem, không xóa được"],
     "src": "台帳 F 2026-10-08「委託配送先が消せる資料」（hong 回答：役割レビュー 委託配送先Web #3）"},
    {"date": "2026-10-07", "target": "OW_DELV 全体",
     "q": ["Screen Code の頭文字", "Tiền tố Screen Code"],
     "a": ["OW（委託配送先Web）", "OW (委託配送先Web)"], "src": "hong 回答 2026-10-07（台帳 F・受付簿 No.290）"},
    {"date": "2026-10-07", "target": "OW_DELV_002 No.21.11・22",
     "q": ["配送詳細の備考を保存するか", "Có lưu ô ghi chú ở chi tiết giao hàng không"],
     "a": ["保存できる（500文字まで）。コードは画面の中だけで保存されない", "Lưu được (tối đa 500 ký tự). Code hiện chỉ giữ trong màn hình, không lưu"], "src": "hong 回答 2026-10-07（台帳 F「委託配送先の集金管理・お知らせ」・受付簿 No.293）"},
    {"date": "2026-10-07", "target": "OW_DELV_002 No.28・実績タブ",
     "q": ["委託配送先に見せる配送のデータの範囲（拠点の連絡先・理論在庫）（Q-17）", "Phạm vi dữ liệu giao hàng hiển thị cho đối tác (liên hệ của 拠点, tồn lý thuyết) (Q-17)"],
     "a": ["拠点の電話番号・担当者・理論在庫を見せる（推奨の「見せない」ではなく、見せる）", "Hiển thị số điện thoại, người phụ trách của 拠点 và tồn lý thuyết (không phải đề xuất 「không hiện」 mà là hiện)"], "src": "hong 回答 2026-10-07（台帳 F「委託配送先に見せる配送のデータ」・受付簿 No.293）"},
    {"date": "2026-10-08", "target": "OW_DELV_001 No.3.1〜3.3・5",
     "q": ["配送管理の初期の期間と並び（確認表 H-16）", "Khoảng thời gian và thứ tự mặc định của Quản lý giao hàng (bảng xác nhận H-16)"],
     "a": ["運営（AW_DLVR）と同じ：出荷日基準・当週から2週間・出荷日の昇順。列見出しを押して全列で並べ替えられる", "Giống 運営 (AW_DLVR): cơ sở ngày xuất, từ tuần hiện tại 2 tuần, ngày xuất tăng dần. Bấm tiêu đề cột để sắp xếp mọi cột"],
     "src": "hong 回答 2026-10-08（台帳 S「配送管理の初期の期間と並び（OW）」・受付簿 #431）。置き換えた旧案：納品日基準・今日の3日前〜10日後・納品日の昇順（Claude 推奨 Q-12）"},
    {"date": "2026-10-08", "target": "OW_DELV_001 No.4.1〜4.3・5.2・11・13・OW_DELV_002 No.19〜19.6",
     "q": ["配送スタッフを割り当てる対象（OW）（確認表 H-15）", "Đối tượng được gán nhân viên giao hàng (OW) (bảng xác nhận H-15)"],
     "a": ["出荷待より前の「予定」にも割り当てられる（コードの今の動き）。配送の内容（日付・数量など）が変わったときは、割当は自動で外れる（残さない）。ホームの枠「通知」（OW_HOME No.8.2）で知らせ、ドライバーを設定し直す（台帳 S・受付簿 #463）。「割当期間：納品日の7日前〜前日」の扱いは要確認のまま（open）", "Gán được cả cho chuyến 「予定」 (trước 出荷待) (đúng hành vi hiện tại của code). Khi nội dung chuyến (ngày, số lượng v.v.) thay đổi thì phân công tự động bị gỡ (không giữ lại). Báo ở khung 「通知」 của Trang chủ (OW_HOME No.8.2) và gán lại tài xế (台帳 S・受付簿 #463). Cách xử lý câu 「割当期間：納品日の7日前〜前日」 vẫn cần xác nhận (open)"],
     "src": "hong 回答 2026-10-08（台帳 S「配送スタッフを割り当てる対象（OW）」・受付簿 #430）。置き換えた旧案：予定には割り当てない・7日前〜前日の文を外す（Claude 推奨 Q-9）"},
    {"date": "2026-10-08", "target": "OW_DELV_001 No.5", "q": ["委託配送先Web でも完了から90日で見えなくするか（確認表 H-12）", "Web đối tác có ẩn chuyến sau 90 ngày kể từ khi hoàn tất không (bảng xác nhận H-12)"], "a": ["見えなくする。OW も、完了から90日を過ぎた配送は一覧に出さない（運営には残る。DA と同じ）", "Có ẩn. OW cũng không hiện chuyến đã hoàn tất quá 90 ngày trong danh sách (vẫn còn ở 運営. Giống DA)"], "src": "hong 回答 2026-10-08（台帳 S「委託配送先Web の配送の表示期間」・受付簿 #427）"},
    {"date": "2026-10-08", "target": "OW_DELV_001 No.5.17", "q": ["営業サンプルの配送データを運営でどう見せるか・委託配送先はどう見るか（確認表 C2-10）", "Dữ liệu giao hàng mẫu của kinh doanh hiện thế nào ở 運営 và đối tác xem ra sao (bảng xác nhận C2-10)"], "a": ["運営D の一覧には種類「サンプル」で出す（契約・拠点は空・300件/日に数える）。委託配送先Web の配送管理でサンプルの配送をどう見るかは決まっていない（open・ask: hong）", "Ở danh sách 運営D hiện với loại 「サンプル」 (hợp đồng・điểm giao để trống・tính vào 300 chuyến/ngày). Việc đối tác xem chuyến mẫu ở Quản lý giao hàng của Web đối tác chưa được quyết (open・ask: hong)"], "src": "hong 回答 2026-10-08（台帳 S「営業サンプルの配送データの見せ方」・受付簿 #451）"},
    {"date": "2026-10-08", "target": "OW_DELV_001 No.8.1〜8.8・OW_DELV_002 No.21.11", "q": ["最大文字数を超えたとき（E04）（確認表 X-5）", "Khi vượt số ký tự tối đa (E04) (bảng xác nhận X-5)"], "a": ["入力欄の上限で入力を止める。貼り付け・CSV のときだけ E04 を出す", "Chặn nhập ở giới hạn của ô nhập. Chỉ khi dán hoặc CSV mới hiện E04"], "src": "hong 回答 2026-10-08（台帳 S「最大文字数を超えたとき（E04）」・受付簿 #446）"},
    {"date": "2026-10-07", "target": "OW_DELV_002 No.21.3・22",
     "q": ["集金予定額と実際の集金額・賞味期限の色・添付資料の扱い", "Số tiền thu dự kiến và thực tế, màu hạn sử dụng, tài liệu đính kèm"],
     "a": ["集金予定額と集金額は別に出す。賞味期限は色を付けない。顧客・委託がアップロードした資料を同じ画面で見られる。削除できるのは委託が自分でアップロードしたファイルだけ（台帳 F 2026-10-08）", "Hiện riêng số tiền thu dự kiến và số tiền thu thực. Hạn sử dụng không tô màu. Xem được tài liệu khách/đối tác tải lên ngay trên màn này. Chỉ xóa được tệp do đối tác tự tải lên (台帳 F 2026-10-08)"],
     "src": "確認メモ_TW H-29・H-31・H-32（決定済み：配送_06・§8E-3・REQ-DL-415・416）"},
]
CHANGES = []

HIDE_ALWAYS = [".es-demo-bar", "#es-review"]
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [
    {"code": "OW_DELV_001", "ja": "配送管理（一覧）", "vi": "Quản lý giao hàng (danh sách)"},
    {"code": "OW_DELV_002", "ja": "配送詳細", "vi": "Chi tiết giao hàng"},
]

def I(no, ja, vi, sel, kind="label", trig="view", **kw):
    d = {"no": no, "ja": ja, "vi": vi, "sel": sel, "kind": kind, "trig": trig}
    d.update(kw)
    return d

def V(id, code, ja, vi, url, items, note=None, **kw):
    if code == "OW_DELV_002":      # 詳細は最初の読み込みが遅いことがあるので、タブが出るまで待ってから操作する
        su = kw.get("setup", "")
        if su.startswith(H): su = su[len(H):]
        kw["setup"] = H + WAITD + su
    d = {"id": id, "code": code, "state": [ja, vi], "url": url, "setup": "", "full": True, "wait": 600, "note": note or ["", ""], "items": items}
    d.update(kw)
    return d

H = ("const wait=(ms)=>new Promise(r=>setTimeout(r,ms));"
     "const setv=(el,v)=>{const p=Object.getPrototypeOf(el);Object.getOwnPropertyDescriptor(p,'value').set.call(el,v);el.dispatchEvent(new Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}));};"
     "const rowOf=(no)=>[...document.querySelectorAll('.dtbl tbody tr')].find(tr=>tr.textContent.includes(no));"
     "const tick=(no)=>rowOf(no).querySelector('input[type=checkbox]').click();")
ADV = "document.querySelector('button[aria-label=\"詳細検索\"]').click();await wait(300);"
WAITD = "for(let i=0;i<40&&!document.querySelector('.tabs');i++){await wait(250);}await wait(300);"
EDIT = "document.querySelector('.driver .btn.pri').click();await wait(300);"
CODE_DELV = lambda ja, vi: {"demo_ok": [ja, vi]}
CODE_SORT = {"demo_ok": ["コードの一覧は1ページ 10／20／50件のページ送りはあるが、列の並べ替えがなく、出荷日の昇順にも並べない（確認メモ H-4・Q-12）。また画面幅 1440px で表が約2115pxになり、届け先拠点名・届け先住所・送り状番号・配送区分が見える範囲の外（横スクロールの先）に出て、担当区間・引取先は文字が切れる（役割レビュー #10）。列を絞る・配送No と届け先を固定する・折り返す（コード・画面の宿題）。", "Danh sách trong code đã có phân trang 10／20／50 dòng nhưng chưa có sắp xếp cột và chưa xếp ngày xuất tăng dần. Ngoài ra ở 1440px bảng rộng ≈2115px nên 届け先拠点名・届け先住所・送り状番号・配送区分 nằm ngoài khung nhìn (phải kéo ngang), 担当区間・引取先 bị cắt chữ (役割レビュー #10); cần bớt cột / cố định 配送No và 届け先 / xuống dòng (việc của code・màn hình) (確認メモ H-4・Q-12). Việc còn tồn"]}

# ------------------------------------------------------------------ 一覧
L1 = [
    I("1", "見出し", "Tiêu đề trang", ".crumb", "area", detail=["パンくず「ホーム ／ 配送管理」。", "Breadcrumb 「ホーム ／ 配送管理」."]),
    I("1.1", "画面名", "Tên màn hình", "h1.ptitle", "label", detail=["画面名は「配送管理」。", "Tên màn hình là 「配送管理」."]),
    I("2", "CSV出力", "Xuất CSV", ".phead .btn::CSV出力", "button", "click", pattern="P-CSV-OUT", err=["S12"],
      detail=["見出しの右。検索条件のとおりの全件（ページに関係なく）を出す。自社が運ぶ区間の配送だけで、運営のメモなどは出さない。列：配送No・配送ID・区間ID・納品日・出荷予定日・出荷日（実績）・温度帯・配送区分・引取先・担当区間・届け先・住所・配送スタッフID・配送スタッフ名・状態・箱数・集金額（税込）・駐車料金（税込）・納品の時刻・トラブル。0件のときは押せない。",
              "Bên phải tiêu đề. Xuất toàn bộ dòng theo điều kiện tìm kiếm (không phụ thuộc trang). Chỉ gồm chuyến thuộc chặng công ty mình chạy, không có ghi chú nội bộ của 運営. Cột: số giao hàng, ID giao hàng, ID chặng, ngày giao, ngày xuất dự kiến, ngày xuất (thực tế), vùng nhiệt, loại giao hàng, nơi lấy hàng, chặng phụ trách, nơi giao, địa chỉ, ID và tên nhân viên giao hàng, trạng thái, số thùng, tiền thu (gồm thuế), phí đỗ xe (gồm thuế), giờ giao, sự cố. 0 dòng thì không bấm được."]),
    I("3", "検索条件", "Điều kiện tìm kiếm", ".search-row", "area", pattern="P-LIST",
      detail=["検索条件の枠は es-search。「検索」か Enter で反映する。「未適用」の印は出さない。初期は出荷日基準・当週から2週間（運営の出荷・配送管理と同じ）。条件は一覧・CSV出力・件数のすべてに効く。",
              "Khung điều kiện dùng es-search. Áp dụng khi nhấn 「検索」 hoặc Enter. Không hiện dấu 「未適用」. Mặc định theo ngày xuất, từ tuần hiện tại 2 tuần (giống Quản lý xuất hàng・giao hàng của 運営). Điều kiện áp dụng cho danh sách, xuất CSV và số lượng."],
      demo_ok=["コードは独自の検索行（es-search の部品ではない）で、「未適用」の印は出さない（確認メモ H-1・H-2）。部品を es-search にそろえるのは宿題", "Code dùng hàng tìm kiếm riêng (không phải thành phần es-search), không hiện dấu 「未適用」 (確認メモ H-1・H-2). Việc đưa về es-search còn tồn"]),
    I("3.1", "期間（開始日）", "Khoảng thời gian (từ ngày)", "input[aria-label=\"開始日\"]", "date", "input", req="－", len="日付（yyyy-mm-dd）",
      init=["当週の月曜（出荷日基準）", "Thứ Hai của tuần hiện tại (cơ sở ngày xuất)"], ex=["2026-10-05", "Ngày bắt đầu của khoảng tìm kiếm"],
      detail=["基準（出荷日／納品日）の日付がこの日以降の配送を出す。初期は出荷日基準で、当週から2週間（運営と同じ：台帳 S・受付簿 #431）。日付の入力欄は共通の部品。空なら下限なし。", "Hiện các chuyến có ngày theo cơ sở (ngày xuất / ngày giao) từ ngày này. Ban đầu cơ sở ngày xuất, từ tuần hiện tại 2 tuần (giống 運営: 台帳 S・受付簿 #431). Ô ngày dùng component chung. Để trống thì không giới hạn dưới."], err=["E08"],
      demo_ok=["コードの初期の期間は「納品日基準・今日の3日前〜10日後」（確認メモ Q-12）。出荷日基準・当週から2週間に直すのは宿題", "Khoảng thời gian ban đầu trong code là 「cơ sở ngày giao, 3 ngày trước đến 10 ngày sau hôm nay」 (確認メモ Q-12). Việc sửa thành cơ sở ngày xuất, từ tuần hiện tại 2 tuần còn tồn"]),
    I("3.2", "期間（終了日）", "Khoảng thời gian (đến ngày)", "input[aria-label=\"終了日\"]", "date", "input", req="－", len="日付（yyyy-mm-dd）",
      init=["開始日から2週間後", "2 tuần sau ngày bắt đầu"], ex=["2026-10-18", "Ngày kết thúc của khoảng tìm kiếm"],
      detail=["基準の日付がこの日以前の配送を出す。初期は開始日から2週間後（運営と同じ）。開始日より前の日は E08。", "Hiện các chuyến có ngày theo cơ sở đến ngày này. Ban đầu là 2 tuần sau ngày bắt đầu (giống 運営). Ngày trước ngày bắt đầu: E08."], err=["E08"]),
    I("3.3", "期間の基準", "Cơ sở của khoảng thời gian", ".radios", "radio", "select", req="－", len="選択",
      init=["出荷日", "Ngày xuất"], ex=["納品日", "Chọn ngày xuất hoặc ngày giao"],
      detail=["「出荷日」（既定）か「納品日」。運営の出荷・配送管理と同じで、既定は出荷日基準（台帳 S・受付簿 #431）。", "Chọn 「出荷日」 (mặc định) hoặc 「納品日」. Giống Quản lý xuất hàng・giao hàng của 運営, mặc định theo ngày xuất (台帳 S・受付簿 #431)."],
      demo_ok=["コードの既定は「納品日」（確認メモ Q-12）。出荷日に直すのは宿題", "Mặc định trong code là 「納品日」 (確認メモ Q-12). Việc sửa thành ngày xuất còn tồn"]),
    I("3.4", "クリア", "Xóa điều kiện", ".search-row .btn.out", "button", "click", detail=["検索条件（詳細条件も）を初期値に戻して再検索する。", "Đưa điều kiện (cả điều kiện chi tiết) về mặc định và tìm lại."]),
    I("3.5", "検索", "Tìm kiếm", ".search-row .btn.pri", "button", "click", detail=["条件を一覧に反映して1ページ目に戻す。Enter でも同じ。", "Áp dụng điều kiện vào danh sách và quay về trang 1. Nhấn Enter cũng giống vậy."]),
    I("3.6", "詳細条件を開く", "Mở điều kiện chi tiết", "button[aria-label=\"詳細検索\"]", "button", "click", pattern="P-LIST",
      detail=["▼で詳細条件（拠点名・住所・温度帯・状態・担当区間・引取先・配送No・キーワード）を開閉する。条件の欄が2行以上になるときだけ開閉のボタンを出す。", "Nút ▼ mở/đóng điều kiện chi tiết (tên 拠点, địa chỉ, vùng nhiệt, trạng thái, chặng, nơi lấy hàng, số giao hàng, từ khóa). Chỉ hiện nút khi ô điều kiện xuống từ 2 hàng."]),
    I("4", "一括操作のバー", "Thanh thao tác hàng loạt", ".bulkbar", "area",
      detail=["一覧の上。配送スタッフ未設定の絞り込み・選択の件数・一括設定のボタンを並べる。", "Phía trên danh sách. Xếp nút lọc chưa gán nhân viên, số dòng đang chọn, nút gán hàng loạt."]),
    I("4.1", "配送スタッフ未設定のみ", "Chỉ chuyến chưa gán nhân viên", ".chip", "button", "click",
      detail=["押すと配送スタッフが決まっていない配送だけに絞る（もう一度押すと戻す）。ボタンの（n件）は、割り当てられる状態（予定・出荷待。中継からの2次は出荷済も）で未設定の件数。", "Bấm để lọc chỉ các chuyến chưa gán nhân viên giao hàng (bấm lần nữa để bỏ). (n件) là số chuyến chưa gán ở trạng thái gán được (予定・出荷待; chặng 2 từ trung chuyển cả 出荷済)."],
      ),
    I("4.2", "一括設定の案内", "Hướng dẫn gán hàng loạt", ".bulkbar .hint", "label",
      detail=["何も選んでいないとき：「予定・出荷待の配送（中継からの2次は出荷済も）を選択すると、配送スタッフを一括設定できます」。選んだあとは「n件選択中」と「選択解除」に替わる。", "Khi chưa chọn gì: 「予定・出荷待の配送（中継からの2次は出荷済も）を選択すると、配送スタッフを一括設定できます」. Sau khi chọn đổi thành 「n件選択中」 và 「選択解除」."]),
    I("4.3", "配送スタッフを一括設定", "Gán nhân viên giao hàng hàng loạt", ".bulkbar .btn.pri", "button", "click", err=["Q11"],
      detail=["選んだ配送に同じ配送スタッフを設定する画面（No.13）を開く。1件も選んでいないときは押せない。割り当てられるのは自社が運ぶ区間の配送で、状態が予定・出荷待のもの（中継からの2次は出荷済も）。予定にも割り当てられる（台帳 S・受付簿 #430）。",
              "Mở màn gán cùng một nhân viên cho các chuyến đã chọn (No.13). Chưa chọn dòng nào thì không bấm được. Chỉ gán được chuyến thuộc chặng công ty mình chạy ở trạng thái 予定・出荷待 (chặng 2 từ điểm trung chuyển cả 出荷済). Gán được cả chuyến 予定 (台帳 S・受付簿 #430)."]),
    I("5", "配送の一覧", "Danh sách giao hàng", ".dtbl", "table", pattern="P-LIST", err=["I01"],
      detail=["自社が運ぶ区間ごとに1行（同じ配送の2区間を運ぶときは、配送Noの末尾に :1・:2）。1ページ 10件（10／20／50）。列見出しを押して全列で並べ替え、初期は出荷日の昇順（同じなら配送No。運営と同じ）。行の配送Noを押すと配送詳細（OW_DELV_002）へ。詳細から戻ると条件・ページ・件数を戻す。0件は I01。配送スタッフ未設定の行は薄い黄色で強調する。完了から90日を過ぎた配送は一覧に出さない（運営の画面には残る。ドライバーアプリと同じ：台帳 S・受付簿 #427）。",
              "Mỗi chặng công ty mình chạy là 1 dòng (nếu chạy 2 chặng của cùng một chuyến thì cuối số giao hàng có :1・:2). 10 dòng/trang (10／20／50). Bấm tiêu đề cột để sắp xếp mọi cột, mặc định ngày xuất tăng dần (bằng nhau thì theo số giao hàng; giống 運営). Bấm số giao hàng để mở chi tiết (OW_DELV_002). Quay lại từ chi tiết thì khôi phục điều kiện, trang, số dòng. 0 dòng: I01. Dòng chưa gán nhân viên được tô vàng nhạt. Chuyến đã hoàn tất quá 90 ngày thì không hiện trong danh sách (vẫn còn ở màn hình 運営; giống ứng dụng tài xế: 台帳 S・受付簿 #427)."], **CODE_SORT),
    I("5.1", "すべて選択", "Chọn tất cả", ".dtbl th input", "check", "check", req="－", len="選択", init=["未選択", "Chưa chọn"], ex=["オン", "Bật/tắt chọn tất cả dòng chọn được trong danh sách đang hiện"],
      detail=["いま表示しているページの中で選べる行（割当できる状態）をすべて選ぶ／外す。ほかのページの行は選ばない。", "Chọn/bỏ chọn mọi dòng chọn được (trạng thái gán được) trong trang đang hiện. Không chọn dòng ở trang khác."],
      demo_ok=["コードの「すべて選択」は、ページに関係なく、条件に合う全件の選べる行を選ぶ（allOn・selectable が list 全体）。設計はいまのページだけ。宿題", "「すべて選択」 trong code chọn mọi dòng chọn được của toàn bộ kết quả theo điều kiện, không phụ thuộc trang. Thiết kế chỉ chọn trang đang hiện. Việc còn tồn"]),
    I("5.2", "行の選択", "Chọn dòng", ".dtbl tbody input[type=checkbox]", "check", "check", req="－", len="選択", init=["未選択", "Chưa chọn"], ex=["オン", "Chọn dòng để gán hàng loạt"],
      detail=["割当できない状態の行（確認中・出荷済・受取済・納品済など。中継からの2次は出荷済も選べる）は選べず、理由を吹き出しで出す。選ぶと行が強調され、バー（No.4）が「n件選択中」になる。",
              "Dòng ở trạng thái không gán được (確認中・出荷済・受取済・納品済 …; chặng 2 từ trung chuyển chọn được cả 出荷済) không chọn được, hiện lý do trong chú thích. Chọn thì dòng được tô, thanh (No.4) đổi thành 「n件選択中」."]),
    I("5.3", "No", "STT", ".dtbl th::No", "label", detail=["通し番号（ページをまたいで続く）。", "Số thứ tự (liên tục qua các trang)."]),
    I("5.4", "出荷予定日", "Ngày xuất dự kiến", ".dtbl th::出荷予定日", "label", detail=["yyyy-mm-dd。", "yyyy-mm-dd."]),
    I("5.5", "納品日", "Ngày giao", ".dtbl th::納品日", "label", detail=["yyyy-mm-dd。委託配送先が日付を変えることはできない（運営が決める）。", "yyyy-mm-dd. Đối tác không đổi được ngày (do 運営 quyết định)."]),
    I("5.6", "配送No", "Số giao hàng", ".dtbl th::配送No", "link", "click",
      detail=["DL-YYMMDD-NNNN。押すと配送詳細（OW_DELV_002）へ。出荷した配送には「出荷 yyyy-mm-dd（実績）」を下に出す。", "DL-YYMMDD-NNNN. Bấm để mở chi tiết (OW_DELV_002). Chuyến đã xuất hiện thêm dòng 「出荷 yyyy-mm-dd（実績）」 bên dưới."]),
    I("5.7", "状態", "Trạng thái", ".dtbl th::状態", "label",
      detail=["予定・確認中・出荷待・出荷済・受取済・納品済・一部納品済・再配送待・中止・取消。色は共通の状態の色（緑＝有効・青＝予定・黄＝対応待ち・赤＝エラー・灰＝終了）。トラブル報告があるときは「トラブル報告」、出荷指示の送信後に担当を変えたときは「出荷指示の再送待ち」、代替品の配送は「代替品あり・出荷指示 rev{n}」のバッジを下に重ねる。",
              "予定・確認中・出荷待・出荷済・受取済・納品済・一部納品済・再配送待・中止・取消. Màu theo bảng màu trạng thái chung (xanh lá = hiệu lực, xanh dương = dự kiến, vàng = chờ xử lý, đỏ = lỗi, xám = kết thúc). Có báo cáo sự cố thì xếp thêm badge 「トラブル報告」; đổi phụ trách sau khi gửi chỉ thị xuất hàng thì 「出荷指示の再送待ち」; chuyến có hàng thay thế có badge 「代替品あり・出荷指示 rev{n}」."],
      demo_ok=["コードの代替品バッジの「rev2」は固定の文字（確認メモ H-34）。実際の版の番号にするのは宿題", "「rev2」 trong badge hàng thay thế của code là chữ cố định (確認メモ H-34). Dùng số phiên bản thực tế là việc còn tồn"]),
    I("5.8", "配送スタッフID", "ID nhân viên giao hàng", ".dtbl th::配送スタッフID", "label", detail=["DR＋5桁。未設定は空。", "DR + 5 chữ số. Chưa gán thì để trống."]),
    I("5.9", "配送スタッフ名", "Tên nhân viên giao hàng", ".dtbl th::配送スタッフ名", "label",
      detail=["担当の名前。未設定は黄色の「未設定」バッジ。納品日の前日で未設定なら「前日・要対応」を赤い小さな字で添える。", "Tên người phụ trách. Chưa gán thì badge vàng 「未設定」. Nếu đến 1 ngày trước ngày giao vẫn chưa gán thì kèm chữ đỏ nhỏ 「前日・要対応」."]),
    I("5.10", "温度帯", "Vùng nhiệt", ".dtbl th::温度帯", "label", detail=["冷凍・冷蔵・資材（アイコンつき）。", "Lạnh đông, lạnh, vật tư (có biểu tượng)."]),
    I("5.11", "担当区間", "Chặng phụ trách", ".dtbl th::担当区間", "label", detail=["「1次（＝最終区間）」「1次（倉庫 → 中継）」「2次（中継 → 拠点）」。運送会社が運ぶ区間は出さない。", "「1次（＝最終区間）」「1次（倉庫 → 中継）」「2次（中継 → 拠点）」. Không hiện chặng do hãng vận tải chạy."]),
    I("5.12", "引取先", "Nơi lấy hàng", ".dtbl th::引取先", "label", detail=["倉庫・中継先のID と名前。", "ID và tên kho / điểm trung chuyển."]),
    I("5.13", "届け先拠点名", "Tên 拠点 nơi giao", ".dtbl th::届け先拠点名", "label", detail=["届け先の拠点名（法人名つき）。", "Tên 拠点 nơi giao (kèm tên pháp nhân)."]),
    I("5.14", "届け先住所", "Địa chỉ nơi giao", ".dtbl th::届け先住所", "label", detail=["都道府県から番地まで。", "Từ tỉnh/thành đến số nhà."]),
    I("5.15", "送り状番号", "Số phiếu gửi", ".dtbl th::送り状番号", "label", detail=["引き取り便のため ES が採番する（配送No＋箱番号。例 DL-261006-0001:1-01）。路線便の荷物は運送会社の送り状番号を出す。", "ES cấp số cho chuyến lấy hàng (số giao hàng + số thùng, ví dụ DL-261006-0001:1-01). Hàng đi tuyến thì hiện số phiếu của hãng vận tải."]),
    I("5.16", "配送区分", "Loại giao hàng", ".dtbl th::配送区分", "label", detail=["ES配送便／COOL便。", "ES配送便／COOL便."]),
    I("5.17", "営業サンプルの配送", "Giao hàng mẫu của kinh doanh", "-", "label",
      detail=["営業サンプルの配送データは、運営D の一覧では種類「サンプル」で出る（契約・拠点は空。1日300件の数に数える：台帳 S・受付簿 #451）。委託配送先Web の配送管理で、委託配送先がサンプルの配送をどう見るか（一覧に出すか・どの列を見せるか・状態や CSV出力の扱い）は決まっていないので、この設計書には書かない。",
              "Dữ liệu giao hàng mẫu của kinh doanh hiện ở danh sách 運営D với loại 「サンプル」 (hợp đồng・điểm giao để trống; tính vào 300 chuyến/ngày: 台帳 S・受付簿 #451). Việc đối tác xem chuyến mẫu ở Quản lý giao hàng của Web đối tác (có hiện trong danh sách không, hiện cột nào, xử lý trạng thái và xuất CSV) chưa được quyết nên không ghi trong tài liệu này."],
      open=["委託配送先Web の配送管理で、委託配送先が営業サンプルの配送をどう見るか（一覧に出すか・出すなら列・状態・CSV出力）が決まっていない。hong に確認する", "Chưa quyết đối tác xem chuyến mẫu của kinh doanh thế nào ở Quản lý giao hàng của Web đối tác (có hiện trong danh sách không; nếu có thì cột, trạng thái, xuất CSV). Cần hỏi hong"], ask="hong"),
    I("6", "ページ送り", "Phân trang", ".pager", "area", pattern="P-LIST",
      detail=["「n件中 a–b件」・前へ・ページ番号・次へ。", "「n件中 a–b件」, trước, số trang, sau."]),
    I("6.1", "表示件数", "Số dòng hiển thị", ".pager select", "select", "select", req="－", len="選択", init=["10件/ページ", "10 dòng/trang"], ex=["10件/ページ", "Chọn 10 / 20 / 50 dòng mỗi trang"],
      detail=["10・20・50件。変えると1ページ目に戻る。", "10・20・50 dòng. Đổi thì quay về trang 1."]),
    I("7", "注記", "Ghi chú", ".panel > p.hint", "label",
      detail=["状態の意味と、配送スタッフを割り当てられる区間・状態（予定・出荷待。中継からの2次は出荷済も）の説明。「割当は納品日の7日前〜前日」の文を置くかは決まっていない（open）。", "Giải thích ý nghĩa trạng thái và chặng/trạng thái có thể gán nhân viên (予定・出荷待; chặng 2 từ trung chuyển cả 出荷済). Chưa quyết có đặt câu 「割当は納品日の7日前〜前日」 hay không (open)."],
      open=["「割当期間：納品日の7日前〜前日」の扱い（この文を画面に置くか、期間の外は割り当てられないのか）が決まっていない（台帳 S・受付簿 #430 で要確認のまま）。コードの注記・割当の画面には、この文がある。hong に確認する", "Chưa quyết cách xử lý 「割当期間：納品日の7日前〜前日」 (có đặt câu này trên màn hình không, ngoài khoảng đó có không gán được không) (vẫn cần xác nhận ở 台帳 S・受付簿 #430). Ghi chú và màn gán trong code đang có câu này. Cần hỏi hong"], ask="hong"),
]
L2 = [
    I("8", "詳細条件", "Điều kiện chi tiết", ".adv", "area", pattern="P-LIST", detail=["▼で開く。ここの条件も「検索」か Enter で反映する。", "Mở bằng ▼. Điều kiện ở đây cũng áp dụng khi nhấn 「検索」 hoặc Enter."]),
    I("8.1", "拠点名", "Tên 拠点", ".adv input[placeholder=\"拠点名\"]", "text", "input", req="－", len="文字列 60", ex=["ひかり物産 川崎", "Một phần tên 拠点 nơi giao"], detail=["届け先の拠点名を部分一致で探す。入力欄は60文字の上限で止まり、それ以上は入らない。貼り付けで上限を超えたときだけ E04 を出す（台帳 S・受付簿 #446）。", "Tìm khớp một phần theo tên 拠点 nơi giao. Ô nhập bị chặn ở giới hạn 60 ký tự, không nhập thêm được. Chỉ khi dán vượt giới hạn mới hiện E04 (台帳 S・受付簿 #446)."], demo_ok=["入力欄の上限で止める動き（台帳 S・受付簿 #446）は宿題。", "Việc chặn nhập ở giới hạn của ô nhập (台帳 S・受付簿 #446) còn tồn."], err=["E04"]),
    I("8.2", "配送先住所", "Địa chỉ nơi giao", ".adv input[placeholder=\"配送先住所\"]", "text", "input", req="－", len="文字列 255", ex=["川崎市川崎区", "Một phần địa chỉ nơi giao"], detail=["届け先住所を部分一致で探す。入力欄は255文字の上限で止まり、それ以上は入らない。貼り付けで上限を超えたときだけ E04 を出す（台帳 S・受付簿 #446）。", "Tìm khớp một phần theo địa chỉ nơi giao. Ô nhập bị chặn ở giới hạn 255 ký tự, không nhập thêm được. Chỉ khi dán vượt giới hạn mới hiện E04 (台帳 S・受付簿 #446)."], demo_ok=["入力欄の上限で止める動き（台帳 S・受付簿 #446）は宿題。", "Việc chặn nhập ở giới hạn của ô nhập (台帳 S・受付簿 #446) còn tồn."], err=["E04"]),
    I("8.3", "温度帯", "Vùng nhiệt", ".adv select[aria-label=\"温度帯\"]", "select", "select", req="－", len="選択", init=["温度帯（指定なし）", "Vùng nhiệt (không chỉ định)"], ex=["冷蔵", "Chọn 冷凍 / 冷蔵 / 資材"], detail=["選択肢：冷凍・冷蔵・資材。", "Lựa chọn: lạnh đông, lạnh, vật tư."]),
    I("8.4", "状態", "Trạng thái", ".adv select[aria-label=\"状態\"]", "select", "select", req="－", len="選択", init=["状態（指定なし）", "Trạng thái (không chỉ định)"], ex=["出荷待", "Chọn một trạng thái giao hàng"], detail=["選択肢：予定・確認中・出荷待・出荷済・受取済・納品済・一部納品済・再配送待・中止・取消。", "Lựa chọn: 予定・確認中・出荷待・出荷済・受取済・納品済・一部納品済・再配送待・中止・取消."]),
    I("8.5", "担当区間", "Chặng phụ trách", ".adv select[aria-label=\"担当区間\"]", "select", "select", req="－", len="選択", init=["担当区間（指定なし）", "Chặng (không chỉ định)"], ex=["2次", "Chọn 1次 hoặc 2次"], detail=["選択肢：1次・2次。", "Lựa chọn: 1次・2次."]),
    I("8.6", "引取先", "Nơi lấy hàng", ".adv select[aria-label=\"引取先\"]", "select", "select", req="－", len="選択", init=["引取先（指定なし）", "Nơi lấy hàng (không chỉ định)"], ex=["WH00001 関東倉庫", "Chọn kho / điểm trung chuyển trong các chuyến hiện có"], detail=["選択肢は、いまの配送の引取先（倉庫・中継）から作る。", "Lựa chọn được tạo từ nơi lấy hàng (kho, trung chuyển) của các chuyến hiện có."]),
    I("8.7", "配送No", "Số giao hàng", ".adv input[placeholder=\"配送No\"]", "text", "input", req="－", len="文字列 60", ex=["DL-261006", "Một phần số giao hàng"], detail=["配送Noを部分一致で探す。入力欄は60文字の上限で止まり、それ以上は入らない。貼り付けで上限を超えたときだけ E04 を出す（台帳 S・受付簿 #446）。", "Tìm khớp một phần theo số giao hàng. Ô nhập bị chặn ở giới hạn 60 ký tự, không nhập thêm được. Chỉ khi dán vượt giới hạn mới hiện E04 (台帳 S・受付簿 #446)."], demo_ok=["入力欄の上限で止める動き（台帳 S・受付簿 #446）は宿題。", "Việc chặn nhập ở giới hạn của ô nhập (台帳 S・受付簿 #446) còn tồn."], err=["E04"]),
    I("8.8", "キーワード", "Từ khóa", ".adv input[placeholder=\"配送No、送り状番号、配送スタッフID・名\"]", "text", "input", req="－", len="文字列 60", ex=["山口", "Một phần số giao hàng / số phiếu gửi / ID・tên nhân viên"], detail=["配送No・送り状番号・配送スタッフID・名を部分一致で探す。入力欄は60文字の上限で止まり、それ以上は入らない。貼り付けで上限を超えたときだけ E04 を出す（台帳 S・受付簿 #446）。", "Tìm khớp một phần theo số giao hàng, số phiếu gửi, ID hoặc tên nhân viên. Ô nhập bị chặn ở giới hạn 60 ký tự, không nhập thêm được. Chỉ khi dán vượt giới hạn mới hiện E04 (台帳 S・受付簿 #446)."], demo_ok=["入力欄の上限で止める動き（台帳 S・受付簿 #446）は宿題。", "Việc chặn nhập ở giới hạn của ô nhập (台帳 S・受付簿 #446) còn tồn."], err=["E04"]),
]
L3 = [
    I("9", "0件のとき", "Khi 0 dòng", "td.empty", "label", err=["I01"],
      detail=["I01「表示するデータがありません。」を一覧の中に出す。CSV出力は押せない。", "Hiện I01 「表示するデータがありません。」 trong danh sách. Không bấm được xuất CSV."],
      demo_ok=["コードの文言は「条件に一致する配送はありません。」で I01 と違う（確認メモ H-15）。I01 に揃えるのは宿題", "Câu trong code là 「条件に一致する配送はありません。」 khác I01 (確認メモ H-15). Việc đồng nhất về I01 còn tồn"]),
]
L4 = [
    I("10", "選んだ行", "Dòng đã chọn", ".dtbl tr.sel", "label", detail=["選んだ行は背景を強調する。", "Dòng đã chọn được tô nền."]),
    I("10.1", "選択件数", "Số dòng đã chọn", ".bulkbar b", "label", detail=["「n件選択中」。選ぶと一括設定のボタンが押せる。", "「n件選択中」. Chọn xong thì bấm được nút gán hàng loạt."]),
    I("10.2", "選択解除", "Bỏ chọn", ".bulkbar .linkbtn", "button", "click", detail=["選んだ行をすべて外す。", "Bỏ chọn mọi dòng đã chọn."]),
]
L5 = [
    I("11", "選べない行", "Dòng không chọn được", ".dtbl tbody input:disabled", "check", "check", req="－", len="選択", init=["選択不可", "Không chọn được"], ex=["（選択不可）", "Ô chọn bị vô hiệu"],
      detail=["割り当てられない状態の行はチェック欄を無効にし、理由を吹き出しで出す。確認中：「確認中のため、確定後に割り当てます」／出荷済・受取済：「スタッフが荷物を受け取り済み（または出荷済み）のため変更できません」／納品済・一部納品済・再配送待・中止・取消：「この状態では変更できません」。予定の配送は選べる（台帳 S・受付簿 #430）。",
              "Dòng ở trạng thái không gán được thì vô hiệu ô chọn và hiện lý do trong chú thích. 確認中: 「確認中のため、確定後に割り当てます」／出荷済・受取済: 「スタッフが荷物を受け取り済み（または出荷済み）のため変更できません」／納品済・一部納品済・再配送待・中止・取消: 「この状態では変更できません」. Chuyến 予定 chọn được (台帳 S・受付簿 #430)."],
      demo_ok=["見本データの栄成ロジには確認中・出荷済・受取済の配送がないので、納品済の行だけ撮れる", "Dữ liệu mẫu của 栄成ロジ không có chuyến 確認中・出荷済・受取済 nên chỉ chụp được dòng 納品済"]),
]
L6 = [
    I("12", "ドライバー未設定の警告帯", "Dải cảnh báo chưa gán tài xế", ".alert", "area", err=["W300"],
      detail=["納品日の3日前と前日になっても配送スタッフが決まっていない配送があるとき、一覧の上に警告帯を出す（W300：件数と最も近い納品日）。納品日の前日になっても未設定の配送は、運営の配送の「確認が必要な配送」の一覧（運営D・assignment_missing）に出る。",
              "Khi có chuyến chưa gán nhân viên vào 3 ngày trước và 1 ngày trước ngày giao thì hiện dải cảnh báo phía trên danh sách (W300: số chuyến và ngày giao gần nhất). Chuyến vẫn chưa gán đến 1 ngày trước ngày giao sẽ hiện ở danh sách 「確認が必要な配送」 của 運営 (運営D・assignment_missing)."],
      demo_ok=["コードは前日（明日納品）の分だけを出し、3日前はない・文言は「明日（…）納品の n件が配送スタッフ未設定です。」（確認メモ H-33）。W300 に揃えるのは宿題", "Code chỉ hiện phần 1 ngày trước (giao ngày mai), không có 3 ngày trước; câu là 「明日（…）納品の n件が配送スタッフ未設定です。」 (確認メモ H-33). Việc đồng nhất về W300 còn tồn"]),
    I("12.1", "未設定を表示", "Hiện chưa gán", ".alert .btn.sm", "button", "click", detail=["押すと「配送スタッフ未設定のみ」の絞り込み（No.4.1）を入れる。", "Bấm để bật bộ lọc 「配送スタッフ未設定のみ」 (No.4.1)."]),
    I("12.2", "未設定の行", "Dòng chưa gán", ".dtbl tr.unassigned .badge", "label", detail=["配送スタッフ名の欄に黄色の「未設定」バッジ。納品日の前日は「前日・要対応」を添える。", "Ô tên nhân viên có badge vàng 「未設定」. Đến 1 ngày trước ngày giao kèm 「前日・要対応」."]),
]
MODAL = [
    I("13", "配送スタッフ一括設定", "Gán nhân viên giao hàng hàng loạt", ".modal", "modal",
      detail=["選んだ配送に同じ配送スタッフを設定する画面（モーダル）。背景を押す・Esc・キャンセルで閉じる（設定は保存しない）。「選択した n件の配送に、同じ配送スタッフを設定します。」と出す。割当は自社が運ぶ区間に対して行う。",
              "Màn (modal) gán cùng một nhân viên cho các chuyến đã chọn. Đóng bằng bấm nền, Esc hoặc キャンセル (không lưu). Hiện 「選択した n件の配送に、同じ配送スタッフを設定します。」. Việc gán áp dụng cho chặng công ty mình chạy."]),
    I("13.1", "割当の注意", "Lưu ý về việc gán", ".modal .hint", "label",
      detail=["「割当は自社が運ぶ区間（担当区間）に対して行います。」。「割当期間は納品日の7日前〜前日です」の文を置くかは決まっていない（open）。", "Ghi 「割当は自社が運ぶ区間（担当区間）に対して行います。」. Chưa quyết có đặt câu 「割当期間は納品日の7日前〜前日です」 hay không (open)."],
      open=["「割当期間：納品日の7日前〜前日」の扱いが決まっていない（No.7 と同じ）。コードは「割当期間は納品日の7日前〜前日です。」を出している。hong に確認する", "Chưa quyết cách xử lý 「割当期間：納品日の7日前〜前日」 (giống No.7). Code đang hiện 「割当期間は納品日の7日前〜前日です。」. Cần hỏi hong"], ask="hong"),
    I("13.2", "配送スタッフ", "Nhân viên giao hàng", "#asStaff", "select", "select", req="○", len="選択", init=["配送スタッフを選択", "Chọn nhân viên giao hàng"],
      ex=["山口 健　ID: DR00014", "Nhân viên có trạng thái 有効; hiện kèm số chuyến phụ trách trong ngày (khi các dòng chọn cùng ngày giao)"],
      detail=["ステータスが「有効」の配送スタッフだけ選べる。選んだ配送がすべて同じ納品日なら、各人のその日の担当件数（全配送で数える）を添える。確定のときに未選択なら E02、ステータスが「有効」でない人は E408。",
              "Chỉ chọn được nhân viên có trạng thái 「有効」. Nếu các chuyến đã chọn cùng ngày giao thì kèm số chuyến người đó phụ trách trong ngày (đếm trên mọi chuyến). Khi xác nhận mà chưa chọn: E02; nhân viên không ở trạng thái 「有効」: E408."],
      err=["E02", "E408"]),
    I("13.3", "対象の配送", "Các chuyến đối tượng", ".modal .tbl", "table",
      detail=["列：納品日・配送No・担当区間・届け先拠点名・温度帯・現在の配送スタッフ（未設定は黄色のバッジ）。行の×で対象から外せる（全部外すと画面を閉じる）。",
              "Cột: ngày giao, số giao hàng, chặng, tên 拠点 nơi giao, vùng nhiệt, nhân viên hiện tại (chưa gán là badge vàng). Bấm × ở dòng để bỏ khỏi đối tượng (bỏ hết thì đóng màn)."]),
    I("13.4", "キャンセル", "Hủy", ".modal footer .btn.out", "button", "click", detail=["画面を閉じる（設定しない）。", "Đóng màn (không gán)."]),
    I("13.5", "確定", "Xác nhận", ".modal footer .btn.pri", "button", "click", err=["S301", "S11", "E409"],
      detail=["選んだ配送すべてに設定し、画面を閉じて一覧を読み直す。同じ配送を運営が同時に変えていたときは E31（同時更新）の確認を出す。出荷指示の送信後（出荷待）の配送の担当を変えたときは「出荷指示の再送待ち」になり、運営が再送する。1件でも割当できない状態があれば E409 のトーストを出して何も変えない。押したら二重に押せなくする。",
              "Gán cho mọi chuyến đã chọn, đóng màn và tải lại danh sách. Đổi phụ trách của chuyến đã gửi chỉ thị xuất hàng (出荷待) thì chuyển 「出荷指示の再送待ち」 và 運営 gửi lại. Có chuyến ở trạng thái không gán được thì hiện toast E409 và không đổi gì. Khóa nút sau khi bấm."]),
]
OVERWRITE = [
    I("14", "上書きの警告", "Cảnh báo ghi đè", ".modal .warnbox", "label", err=["W301"],
      detail=["選んだ配送に設定済みのものが含まれるとき、W301 を警告の枠に出す（確定すると上書き。出荷指示の送信後の配送は「出荷指示の再送待ち」になる）。件数は設定済みの行の数。",
              "Khi trong các chuyến đã chọn có chuyến đã gán thì hiện W301 trong khung cảnh báo (xác nhận sẽ ghi đè; chuyến đã gửi chỉ thị xuất hàng sẽ ở trạng thái 「出荷指示の再送待ち」). Số lượng là số dòng đã gán."]),
]
NOINPUT = [
    I("15", "確定の入力チェック", "Kiểm tra khi xác nhận", "#asStaff", "select", "select", req="○", len="選択", init=["配送スタッフを選択", "Chọn nhân viên giao hàng"], ex=["（未選択）", "Chưa chọn nhân viên"],
      err=["E02"],
      detail=["配送スタッフを選ばずに「確定」を押したら、項目の下に E02「配送スタッフを選択してください。」を出して赤枠にする。", "Nhấn 「確定」 mà chưa chọn nhân viên thì hiện E02 「配送スタッフを選択してください。」 dưới mục và viền đỏ."],
      demo_ok=["コードは未選択のあいだ「確定」を押せなくしていて、エラーの文言を出さない（確認メモ H-9）。宿題", "Code vô hiệu nút 「確定」 khi chưa chọn nên không hiện câu lỗi (確認メモ H-9). Việc còn tồn"]),
]
DONE = [
    I("16", "設定完了のトースト", "Toast hoàn tất gán", ".toast", "toast", "show", err=["S301", "S11"],
      detail=["設定できたら S301「{n}件に配送スタッフを設定しました（{m}件は出荷指示の再送待ちです）。」。再送待ちがなければ S11（操作名＝配送スタッフの設定）。",
              "Gán xong hiện S301 「{n}件に配送スタッフを設定しました（{m}件は出荷指示の再送待ちです）。」. Không có chuyến chờ gửi lại thì S11 (tên thao tác = gán nhân viên giao hàng)."],
      demo_ok=["コードのトーストは「n件の配送に ○○ を設定しました（m件は出荷指示の再送待ち）」（共通メッセージを使っていない・確認メモ H-17）。宿題", "Toast trong code là 「n件の配送に ○○ を設定しました（m件は出荷指示の再送待ち）」 (chưa dùng thông điệp chung, 確認メモ H-17). Việc còn tồn"]),
]
CSVDONE = [
    I("17", "CSV出力のトースト", "Toast xuất CSV", ".toast", "toast", "show", err=["S12"],
      detail=["出力できたら S12「CSVを出力しました（{n}行・{ファイル名}）。」。ファイル名＝画面名＋条件＋日時。", "Xuất xong hiện S12 「CSVを出力しました（{n}行・{ファイル名}）。」. Tên tệp = tên màn hình + điều kiện + ngày giờ."]),
]

# ------------------------------------------------------------------ 詳細
D1 = [
    I("18", "見出し", "Tiêu đề trang", ".crumb", "area", detail=["パンくず「ホーム ／ 配送管理 ／ 配送詳細」。画面名の右に配送No。他社の配送No・存在しない配送Noは「見つかりません」（No.42）。", "Breadcrumb 「ホーム ／ 配送管理 ／ 配送詳細」. Bên phải tên màn là số giao hàng. Số giao hàng của công ty khác hoặc không tồn tại: 「見つかりません」 (No.42)."]),
    I("18.1", "画面名・配送No", "Tên màn hình và số giao hàng", "h1.ptitle", "label", detail=["「配送詳細 {配送No}」。", "「配送詳細 {配送No}」."]),
    I("19", "配送スタッフ選択", "Chọn nhân viên giao hàng", ".driver", "area", pattern="P-FORM",
      detail=["配送スタッフを決める枠。担当が決まっていないときは編集の状態で開く。決まっているときは名前を出し、「編集」で変える。割り当てられる状態は予定・出荷待（中継からの2次は出荷済も）。編集中に離れたら Q02。確定は画面の上のボタン1つ（枠の外に別の保存は置かない）。",
              "Khung quyết định nhân viên giao hàng. Chưa gán thì mở ở trạng thái đang sửa; đã gán thì hiện tên, đổi bằng 「編集」. Trạng thái gán được: 予定・出荷待 (chặng 2 từ trung chuyển cả 出荷済). Rời khi đang sửa: Q02. Xác nhận bằng 1 nút (không có nút lưu riêng ngoài khung)."],
      err=["Q02"]),
    I("19.1", "未設定のバッジ", "Badge chưa gán", ".driver h3 .badge", "label", detail=["担当が決まっていないとき、見出しの横に黄色の「未設定」。", "Khi chưa gán hiển thị badge vàng 「未設定」 cạnh tiêu đề."]),
    I("19.2", "担当区間の説明", "Giải thích chặng phụ trách", ".driver p.hint", "label",
      detail=["「担当区間：{区間}（{引取先} → {届け先}）」。割り当てられない状態のときは理由を赤で添える。「割当期間：納品日の7日前〜前日」の文を置くかは決まっていない（open）。",
              "「担当区間：{区間}（{引取先} → {届け先}）」. Trạng thái không gán được thì kèm lý do màu đỏ. Chưa quyết có đặt câu 「割当期間：納品日の7日前〜前日」 hay không (open)."],
      open=["「割当期間：納品日の7日前〜前日」の扱いが決まっていない（No.7 と同じ）。コードはこの文を出している。hong に確認する", "Chưa quyết cách xử lý 「割当期間：納品日の7日前〜前日」 (giống No.7). Code đang hiện câu này. Cần hỏi hong"], ask="hong"),
    I("19.3", "配送スタッフ", "Nhân viên giao hàng", "#drvSel", "select", "select", req="○", len="選択", init=["配送スタッフ（未選択）", "Nhân viên giao hàng (chưa chọn)"],
      ex=["山口 健　ID: DR00014", "Nhân viên có trạng thái 有効; kèm số chuyến phụ trách trong ngày giao"],
      detail=["ステータスが「有効」の配送スタッフだけ選べる。各人の納品日の担当件数を添える。未選択で確定したら E02、有効でない人は E408。", "Chỉ chọn được nhân viên có trạng thái 「有効」. Kèm số chuyến người đó phụ trách trong ngày giao. Xác nhận mà chưa chọn: E02; nhân viên không 「有効」: E408."], err=["E02", "E408"]),
    I("19.4", "キャンセル", "Hủy", ".driver .acts .btn:not(.pri)", "button", "click", detail=["編集をやめて元の担当に戻す。変更があれば Q02 を出す。", "Thôi sửa và quay về phụ trách cũ. Có thay đổi thì hiện Q02."], err=["Q02"]),
    I("19.5", "確定", "Xác nhận", ".driver .acts .btn.pri", "button", "click", err=["S01", "S302", "E409"],
      detail=["担当を決めて保存する（S01）。運営が同時に変えていたときは E31（上書きの確認）。出荷指示の送信後（出荷待）に別の人へ変えたときは S302「配送スタッフを変更しました。運営が出荷指示を再送します。」を出し、「出荷指示の再送待ち」になる。割当できない状態なら E409。",
              "Quyết định phụ trách và lưu (S01). Đổi sang người khác sau khi đã gửi chỉ thị xuất hàng (出荷待) thì hiện S302 「配送スタッフを変更しました。運営が出荷指示を再送します。」 và chuyển 「出荷指示の再送待ち」. Trạng thái không gán được: E409."],
      demo_ok=["コードのトーストは「配送スタッフを確定しました」「配送スタッフを変更しました（運営が出荷指示を再送します）」（共通メッセージを使っていない・確認メモ H-17）。宿題", "Toast trong code là 「配送スタッフを確定しました」「配送スタッフを変更しました（運営が出荷指示を再送します）」 (chưa dùng thông điệp chung, 確認メモ H-17). Việc còn tồn"]),
    I("19.6", "配送の内容が変わったとき", "Khi nội dung chuyến thay đổi", "-", "label",
      detail=["配送の内容（日付・数量など）が変わったときは、割当は自動で外れ、配送スタッフは「未設定」に戻る（予定の配送でも同じ）。ホームの枠「通知」（OW_HOME No.8.2。メッセージ I308）で知らせる。知らせを見たら、この枠（No.19）でドライバーを設定し直す（台帳 S・受付簿 #463）。",
              "Khi nội dung chuyến (ngày, số lượng v.v.) thay đổi thì phân công tự động bị gỡ và nhân viên giao hàng quay về 「未設定」 (chuyến 予定 cũng vậy). Báo ở khung 「通知」 của Trang chủ (OW_HOME No.8.2; thông điệp I308). Xem thông báo xong thì gán lại tài xế ở khung này (No.19) (台帳 S・受付簿 #463)."],
      demo_ok=["コードに、配送の内容が変わったときに割当を外す動きと、知らせ（ホームの枠「通知」）はない。宿題", "Code chưa có thông báo khi nội dung chuyến thay đổi (khung 「通知」 của Trang chủ). Việc còn tồn"]),
    I("20", "タブ", "Tab", ".tabs", "area", pattern="P-TAB",
      detail=["配送概要・配送住所・実績・トラブル（件数つき）・添付資料。選んだタブは URL（?tab=）に持つ。", "配送概要・配送住所・実績・トラブル (kèm số lượng)・添付資料. Tab đang chọn giữ trong URL (?tab=)."]),
    I("21", "配送情報", "Thông tin giao hàng", ".collap:nth-of-type(2)", "area", detail=["配送概要タブの枠。読むだけの項目と、備考。", "Khung của tab 配送概要. Gồm các mục chỉ xem và ô ghi chú."]),
    I("21.1", "出荷予定日", "Ngày xuất dự kiến", ".collap:nth-of-type(2) .grid3 > .fld:nth-child(1)", "label", detail=["yyyy-mm-dd。", "yyyy-mm-dd."]),
    I("21.2", "納品日", "Ngày giao", ".collap:nth-of-type(2) .grid3 > .fld:nth-child(2)", "label", detail=["yyyy-mm-dd。変えられない。", "yyyy-mm-dd. Không đổi được."]),
    I("21.3", "状態", "Trạng thái", ".collap:nth-of-type(2) .grid3 > .fld:nth-child(3)", "label",
      detail=["一覧の状態（No.5.7）と同じバッジ。「ドライバーアプリの受取・納品報告で変わります」を添える。", "Cùng badge với trạng thái ở danh sách (No.5.7). Kèm 「ドライバーアプリの受取・納品報告で変わります」."]),
    I("21.4", "配送No", "Số giao hàng", ".collap:nth-of-type(2) .grid3 > .fld:nth-child(4)", "label", detail=["DL-YYMMDD-NNNN（区間を2つ運ぶときは末尾に :1・:2）。", "DL-YYMMDD-NNNN (chạy 2 chặng thì cuối có :1・:2)."]),
    I("21.5", "出荷日（実績）", "Ngày xuất (thực tế)", ".collap:nth-of-type(2) .grid3 > .fld:nth-child(5)", "label", detail=["出荷した日。まだなら「—」。", "Ngày đã xuất. Chưa xuất thì 「—」."]),
    I("21.6", "荷物名", "Tên hàng", ".collap:nth-of-type(2) .grid3 > .fld:nth-child(6)", "label", detail=["冷凍惣菜・冷蔵惣菜・資材。", "Món ăn lạnh đông, món ăn lạnh, vật tư."]),
    I("21.7", "温度帯", "Vùng nhiệt", ".collap:nth-of-type(2) .grid3 > .fld:nth-child(7)", "label", detail=["冷凍・冷蔵・資材。", "Lạnh đông, lạnh, vật tư."]),
    I("21.8", "配送区分", "Loại giao hàng", ".collap:nth-of-type(2) .grid3 > .fld:nth-child(8)", "label", detail=["ES配送便／COOL便。", "ES配送便／COOL便."]),
    I("21.9", "担当区間", "Chặng phụ trách", ".collap:nth-of-type(2) .grid3 > .fld:nth-child(9)", "label", detail=["「1次（＝最終区間）」「1次（倉庫 → 中継）」「2次（中継 → 拠点）」。", "「1次（＝最終区間）」「1次（倉庫 → 中継）」「2次（中継 → 拠点）」."]),
    I("21.10", "引取先", "Nơi lấy hàng", ".collap:nth-of-type(2) .grid3 > .fld:nth-child(10)", "label", detail=["倉庫・中継先のID と名前。", "ID và tên kho / điểm trung chuyển."]),
    I("21.11", "備考", "Ghi chú", ".collap:nth-of-type(2) .grid3 > .fld.span3", "textarea", "input", req="－", len="文字列 500",
      ex=["搬入は裏口からお願いします", "Ghi chú do đối tác nhập, hiện cho 運営 (tối đa 500 ký tự)"],
      detail=["委託配送先が書く備考。複数行・500文字まで・文字数を右下に出す。保存する（運営の配送の詳細にも出る）。この備考は委託配送先の備考で、運営が書く備考（運営のメモ）とは別の欄。運営が同時に変えていたときは E31。編集の保存は画面の上の「確定」ではなく、備考だけは「保存」のあとに S01。入力欄は500文字の上限で止まり、それ以上は入らない。貼り付けで上限を超えたときだけ E04 を出す（台帳 S・受付簿 #446）。",
              "Ghi chú do đối tác viết. Nhiều dòng, tối đa 500 ký tự, hiện số ký tự ở góc dưới phải. Có lưu (cũng hiện ở chi tiết giao hàng của 運営). Lưu ghi chú xong hiện S01. Ô nhập bị chặn ở giới hạn 500 ký tự, không nhập thêm được. Chỉ khi dán vượt giới hạn mới hiện E04 (台帳 S・受付簿 #446)."],
      err=["E04", "S01"],
      demo_ok=["コードの備考は 100文字までで、画面の中だけで保存されない（確認メモ H-7・H-30。hong 2026-10-07：備考は保存する）。500文字・保存は宿題", "Ghi chú trong code tối đa 100 ký tự và không lưu (確認メモ H-7・H-30; hong 2026-10-07: ghi chú được lưu). Việc nâng lên 500 ký tự và lưu còn tồn"]),
    I("22", "送り状番号", "Số phiếu gửi", ".collap .collap", "area",
      detail=["配送情報の中の枠。引き取り便のため ES が採番した送り状番号（配送No＋箱番号）を箱の数だけ並べる。", "Khung trong thông tin giao hàng. Xếp số phiếu gửi do ES cấp (số giao hàng + số thùng) theo số thùng."]),
]
D_ASSIGNED = [
    I("23", "担当の表示", "Hiển thị người phụ trách", ".driver .staffline", "label",
      detail=["担当の名前・ID・その日の担当件数（「10/07の担当件数：n件」）。割り当てられる状態なら「編集」が押せる。", "Tên, ID và số chuyến phụ trách trong ngày (「10/07の担当件数：n件」). Trạng thái gán được thì bấm được 「編集」."]),
    I("23.1", "編集", "Sửa", ".driver .acts .btn.pri", "button", "click", detail=["担当を変える編集の状態にする。", "Chuyển sang trạng thái sửa để đổi người phụ trách."]),
]
D_CHANGE = [
    I("24", "出荷指示の再送の注意", "Lưu ý gửi lại chỉ thị xuất hàng", ".driver .hint::出荷指示の送信後に変更すると", "label",
      detail=["出荷待の配送で担当を変えるときだけ、選択欄の下に「出荷指示の送信後に変更すると、運営が出荷指示を再送します（「出荷指示の再送待ち」になります）。」を出す。", "Chỉ khi đổi người phụ trách chuyến 出荷待 mới hiện dưới ô chọn 「出荷指示の送信後に変更すると、運営が出荷指示を再送します（「出荷指示の再送待ち」になります）。」."]),
]
D_LOCK = [
    I("25", "編集できない状態", "Trạng thái không sửa được", ".driver .acts .btn.pri[disabled]", "button", "click", req="－",
      detail=["割り当てられない状態（確認中・出荷済・受取済・納品済など）は「編集」を押せなくし、理由を赤い文で出す（吹き出しにも同じ文）。", "Trạng thái không gán được (確認中・出荷済・受取済・納品済 …) thì vô hiệu 「編集」 và hiện lý do bằng chữ đỏ (cũng có trong chú thích)."]),
    I("25.1", "理由", "Lý do", ".driver .err", "label", detail=["確認中：「確認中のため、確定後に割り当てます」／出荷済・受取済：「スタッフが荷物を受け取り済み（または出荷済み）のため変更できません」／その他：「この状態では変更できません」。", "確認中: 「確認中のため、確定後に割り当てます」／出荷済・受取済: 「スタッフが荷物を受け取り済み（または出荷済み）のため変更できません」／khác: 「この状態では変更できません」."]),
]
D_TROUBLE_BAND = [
    I("26", "トラブル報告の帯", "Dải báo cáo sự cố", ".alert", "area",
      detail=["トラブルが対応中のときだけ、配送情報の中に帯を出す（「トラブル報告：対応中 n件（種類）」と「状態は受取済のまま、運営が解決します」）。「トラブルを見る」でトラブルのタブを開く。", "Chỉ khi có sự cố đang xử lý mới hiện dải trong thông tin giao hàng (「トラブル報告：対応中 n件（種類）」 và 「状態は受取済のまま、運営が解決します」). 「トラブルを見る」 mở tab トラブル."]),
    I("26.1", "トラブルを見る", "Xem sự cố", ".alert .btn.sm", "button", "click", detail=["トラブルのタブへ移る。", "Chuyển tới tab トラブル."]),
]
D_PART_BAND = [
    I("27", "一部納品の帯", "Dải giao một phần", ".alert.info", "area",
      detail=["一部納品済のときだけ帯を出す（「一部納品：{商品} n個が不足　理由：…　再配送：…」）。「トラブルを見る」でトラブルのタブを開く。", "Chỉ khi 一部納品済 mới hiện dải (「一部納品：{商品} n個が不足　理由：…　再配送：…」). 「トラブルを見る」 mở tab トラブル."]),
]
D_TRACK = [
    I("28", "路線便の送り状（追跡）", "Phiếu gửi tuyến (theo dõi)", "-", "area",
      detail=["路線便（ヤマトなど）の荷物のときは、送り状番号の枠に運送会社名・番号・追跡ページのボタンを出す。ES が採番する番号（配送No＋箱番号）は路線便には出さない。", "Với hàng đi tuyến (Yamato v.v.) thì khung số phiếu gửi hiện tên hãng, số phiếu và nút trang theo dõi. Không hiện số ES cấp (số giao hàng + số thùng) cho hàng đi tuyến."],
      demo_ok=["見本データの栄成ロジには路線便の配送がない（ヤマト区間の配送がない）ので撮れない", "Dữ liệu mẫu của 栄成ロジ không có chuyến đi tuyến (không có chặng Yamato) nên không chụp được"]),
]
D_ALT = [
    I("29", "代替品のバッジ", "Badge hàng thay thế", ".badge.b-amber::代替品あり", "label",
      detail=["代替品の設定がある配送は、状態の下に「代替品あり・出荷指示 rev{n}」を出す。n は出荷指示の実際の版の番号。", "Chuyến có thiết lập hàng thay thế hiện 「代替品あり・出荷指示 rev{n}」 dưới trạng thái. n là số phiên bản thực của chỉ thị xuất hàng."],
      demo_ok=["コードの「rev2」は固定の文字（確認メモ H-34）。実際の版の番号は宿題", "「rev2」 trong code là chữ cố định (確認メモ H-34). Số phiên bản thực là việc còn tồn"]),
    I("29.1", "荷物の中身の変更", "Thay đổi nội dung hàng", "-", "area",
      detail=["代替品の設定がある配送には「荷物の中身の変更（代替品 ALT-…）」の枠を出す：出荷指示を版番号つきで再送すること・不良商品と代替商品・荷物の中身（代替品／補償）・回収と廃棄の指示（ドライバーアプリの ② 在庫/廃棄 の「代替品の回収」）。納品リストにも「代替品（元：〇〇）」を出す。",
              "Chuyến có thiết lập hàng thay thế hiện khung 「荷物の中身の変更（代替品 ALT-…）」: gửi lại chỉ thị xuất hàng kèm số phiên bản, hàng lỗi và hàng thay thế, nội dung hàng (thay thế / bồi thường), chỉ dẫn thu hồi và hủy (「代替品の回収」 ở màn ② 在庫/廃棄 của ứng dụng tài xế). Danh sách giao hàng cũng hiện 「代替品（元：〇〇）」."],
      demo_ok=["コードの配送詳細は代替品の情報を取得せず（alt が常に空）、この枠が出ない（確認メモ H-34）。宿題", "Chi tiết giao hàng trong code không lấy thông tin hàng thay thế (alt luôn rỗng) nên khung này không hiện (確認メモ H-34). Việc còn tồn"]),
]
D_ADDR = [
    I("30", "引取先", "Nơi lấy hàng", ".collap:nth-of-type(2)", "area", detail=["引取先（倉庫・中継）の情報。倉庫・中継先の実データを出す。", "Thông tin nơi lấy hàng (kho / trung chuyển). Hiện dữ liệu thực của kho / trung chuyển."],
      demo_ok=["コードの郵便番号・住所・受付時間・電話・受け渡し手順は固定の見本値（確認メモ H-28）。実データにするのは宿題", "Mã bưu chính, địa chỉ, giờ nhận, điện thoại, hướng dẫn bàn giao trong code là giá trị mẫu cố định (確認メモ H-28). Dùng dữ liệu thực là việc còn tồn"]),
    I("30.1", "引取先の電話番号", "Điện thoại nơi lấy hàng", ".collap:nth-of-type(2) .grid3 > .fld:nth-child(5)", "label", detail=["引取先の電話番号。", "Điện thoại nơi lấy hàng."]),
    I("30.2", "受け渡し手順", "Hướng dẫn bàn giao", ".collap:nth-of-type(2) .grid3 > .fld:nth-child(6)", "label", detail=["中継拠点の受け渡し手順（PDF）。押して開く。", "Hướng dẫn bàn giao điểm trung chuyển (PDF). Bấm để mở."]),
    I("31", "届け先住所", "Địa chỉ nơi giao", ".collap:nth-of-type(3)", "area",
      detail=["届け先拠点の住所・連絡先。拠点の電話番号・担当者を見せる（hong 2026-10-07。緊急のときに配送スタッフが連絡できるように）。受取時間帯は複数あれば全部を順に、納品条件も出す。",
              "Địa chỉ và liên hệ của 拠点 nơi giao. Hiển thị số điện thoại và người phụ trách của 拠点 (hong 2026-10-07; để nhân viên giao hàng liên hệ khi khẩn cấp). Khung giờ nhận nếu có nhiều thì hiện tất cả theo thứ tự, và cả điều kiện giao hàng."],
      demo_ok=["コードの郵便番号・部署名・電話・担当者名は固定の見本値で、受取時間帯・納品条件の欄がない（確認メモ H-28）。実データにして欄を足すのは宿題", "Mã bưu chính, tên bộ phận, điện thoại, người phụ trách trong code là giá trị mẫu cố định và chưa có ô khung giờ nhận, điều kiện giao (確認メモ H-28). Dùng dữ liệu thực và thêm ô là việc còn tồn"]),
    I("31.1", "メイン担当者名・電話番号", "Người phụ trách chính và điện thoại", ".collap:nth-of-type(3) .grid3 > .fld:nth-child(8)", "label", detail=["拠点のメイン担当者名と電話番号。", "Tên người phụ trách chính và điện thoại của 拠点."]),
    I("32", "搬入経路・添付資料", "Lộ trình vận chuyển, tài liệu đính kèm", ".fld::搬入経路・添付資料", "area",
      detail=["顧客が上げた搬入経路の資料（画像・PDF）を一覧にして、押すとビューア（No.39）で開く。見るだけで、委託配送先は削除できない（台帳 F 2026-10-08）。", "Danh sách tài liệu lộ trình vận chuyển khách tải lên (ảnh, PDF); bấm để mở trong màn xem (No.39). Chỉ xem, đối tác không xóa được (台帳 F 2026-10-08)."],
      demo_ok=["コードの6ファイルは固定の見本（確認メモ H-29）。実データは宿題", "6 tệp trong code là mẫu cố định (確認メモ H-29). Dữ liệu thực là việc còn tồn"]),
    I("32.1", "非公開の搬入経路・添付資料", "Lộ trình / tài liệu không công khai", ".fld::非公開の搬入経路", "area",
      detail=["委託配送先と運営だけが見る資料。「ファイルを追加」で追加できる（JPG・PNG・PDF・HEIC・1つ5MBまで・10件まで。E11・E411）。追加できたら S303。", "Tài liệu chỉ đối tác và 運営 xem. Thêm bằng 「ファイルを追加」 (JPG・PNG・PDF・HEIC, mỗi tệp ≤5MB, tối đa 10 tệp; E11・E411). Thêm xong hiện S303."], err=["E11", "E411", "S303"],
      demo_ok=["コードの追加はファイル名のトーストだけで保存せず、形式・サイズのチェックもない（確認メモ H-19・H-29）。宿題", "Thêm tệp trong code chỉ hiện toast tên tệp, không lưu và không kiểm tra định dạng/kích thước (確認メモ H-19・H-29). Việc còn tồn"]),
]
D_RES_EMPTY = [
    I("33", "実績（納品前）", "Kết quả (trước khi giao)", ".collap:nth-of-type(2)", "area", err=["I302"],
      detail=["納品前（納品済・一部納品済以外）は I302「納品後に表示されます（いまの状態：{状態}）。」を出す。", "Trước khi giao (khác 納品済・一部納品済) hiện I302 「納品後に表示されます（いまの状態：{状態}）。」."],
      demo_ok=["コードの文言は「納品後に表示されます。（いまの状態：…）」（確認メモ H-17）。I302 に揃えるのは宿題", "Câu trong code là 「納品後に表示されます。（いまの状態：…）」 (確認メモ H-17). Việc đồng nhất về I302 còn tồn"]),
]
D_RES = [
    I("34", "配送実績", "Kết quả giao hàng", ".collap:nth-of-type(2)", "area", detail=["納品済・一部納品済の配送の実績。納品日時・備考・廃棄数確認・陳列結果確認。", "Kết quả của chuyến 納品済・一部納品済. Giờ giao, ghi chú, xác nhận hủy, xác nhận trưng bày."]),
    I("34.1", "納品日時", "Ngày giờ giao", ".collap:nth-of-type(2) .grid3 > .fld", "label", detail=["納品した日時（yyyy-mm-dd HH:MM）。", "Ngày giờ đã giao (yyyy-mm-dd HH:MM)."]),
    I("34.2", "廃棄数確認", "Xác nhận số hủy", ".collap .collap:nth-of-type(1)", "area",
      detail=["廃棄数・理論在庫・実在庫・差異の合計と、商品ごとの表（写真・品番・商品名・カテゴリ・廃棄数・賞味期限・理論在庫・実在庫）。理論在庫は委託配送先に見せる（hong 2026-10-07）。賞味期限には色を付けない（確認メモ H-32）。",
              "Tổng số hủy, tồn lý thuyết, tồn thực tế, chênh lệch và bảng theo sản phẩm (ảnh, mã, tên, loại, số hủy, hạn sử dụng, tồn lý thuyết, tồn thực tế). Tồn lý thuyết được hiển thị cho đối tác (hong 2026-10-07). Hạn sử dụng không tô màu (確認メモ H-32)."],
      demo_ok=["コードは賞味期限が '2026-10-14' のときだけ赤くする（固定の見本・確認メモ H-32）。宿題", "Code chỉ tô đỏ khi hạn sử dụng là '2026-10-14' (mẫu cố định, 確認メモ H-32). Việc còn tồn"]),
    I("34.3", "陳列結果確認", "Xác nhận trưng bày", ".collap .collap:nth-of-type(2)", "area",
      detail=["予定合計数・実際合計数・差異合計数と、商品ごとの表（予定数・実際数・誤差）。一部納品のときの実際数は納品数。不足は赤字。", "Tổng dự kiến, thực tế, chênh lệch và bảng theo sản phẩm (số dự kiến, thực tế, sai lệch). Giao một phần thì số thực tế là số đã giao. Thiếu hụt chữ đỏ."]),
]
D_TROUBLE_TAB = [
    I("35", "トラブル報告", "Báo cáo sự cố", ".collap:nth-of-type(2)", "area", err=["I01"],
      detail=["この配送にドライバーアプリから報告されたトラブルの表。列：報告の時刻・場面（荷物受取時／配達時）・種類・内容・報告者（配送スタッフ）・写真・対応状況・運営の対応。陳列の差異・未配送は自動で報告される。対応（分納・再配送・取消）は運営が決め、決まると「解決済」になる。報告がなければ「この配送にトラブル報告はありません。」。",
              "Bảng sự cố mà ứng dụng tài xế báo cáo cho chuyến này. Cột: giờ báo cáo, cảnh (lúc nhận hàng／lúc giao), loại, nội dung, người báo cáo (nhân viên giao hàng), ảnh, tình trạng xử lý, cách xử lý của 運営. Sai lệch trưng bày và chưa giao được báo cáo tự động. Cách xử lý (giao chia, giao lại, hủy) do 運営 quyết định, quyết xong chuyển 「解決済」. Không có báo cáo thì 「この配送にトラブル報告はありません。」."],
      demo_ok=["コードの「場面」は常に「配達時」、写真は常に0枚（確認メモ H-35）。荷物受取時・配達時の区別と写真（最低1枚・最大20枚）は宿題", "「場面」 trong code luôn là 「配達時」 và ảnh luôn 0 (確認メモ H-35). Phân biệt lúc nhận hàng/lúc giao và ảnh (tối thiểu 1, tối đa 20) là việc còn tồn"]),
]
D_PART_TAB = [
    I("36", "一部納品の内容", "Nội dung giao một phần", ".collap:nth-of-type(3)", "area",
      detail=["一部納品済のときだけ出す。不足の商品の表（品番・商品名・予定数・納品数・不足数）と、不足の合計・理由・再配送。再配送は子の配送（確認中）の番号と納品日、または運営が決めた解決の仕方。", "Chỉ hiện khi 一部納品済. Bảng sản phẩm thiếu (mã, tên, dự kiến, đã giao, thiếu) và tổng thiếu, lý do, giao lại. Giao lại là số và ngày giao của chuyến con (確認中) hoặc cách giải quyết do 運営 quyết định."]),
]
D_FILES = [
    I("37", "駐車報告", "Báo cáo đỗ xe", ".collap:nth-of-type(2)", "area",
      detail=["配送スタッフがドライバーアプリから入れた駐車料金（税込）とレシート。駐車料金は集金とは別（ドライバーが立て替え、委託がまとめて運営へ請求する・法人Webには出さない）。報告がなければ「—（駐車報告なし）」。", "Phí đỗ xe (gồm thuế) và biên lai do nhân viên nhập trên ứng dụng tài xế. Phí đỗ xe tách khỏi tiền thu (tài xế ứng trước, đối tác gộp lại yêu cầu 運営; không hiện ở Web pháp nhân). Không có báo cáo thì 「—（駐車報告なし）」."]),
    I("37.1", "駐車料金（税込）", "Phí đỗ xe (gồm thuế)", ".collap:nth-of-type(2) .grid3 > .fld:nth-child(1)", "label", detail=["円（3桁区切り）。", "Yên (phân cách hàng nghìn)."]),
    I("37.2", "レシート", "Biên lai", ".collap:nth-of-type(2) .grid3 > .fld:nth-child(2)", "link", "click", detail=["レシートの画像。押すとビューア（No.39）で開く。", "Ảnh biên lai. Bấm để mở trong màn xem (No.39)."]),
    I("38", "集金報告", "Báo cáo thu tiền", ".collap:nth-of-type(3)", "area", detail=["集金予定額と、実際に集めた額を別に出す（REQ-DL-415）。", "Hiện riêng số tiền thu dự kiến và số tiền thực thu (REQ-DL-415)."],
      demo_ok=["コードは集金予定額と集金額が同じ値（完了なら実額・未完了なら予定額の1つ）（確認メモ H-31）。別に出すのは宿題", "Code hiện số tiền dự kiến và thực thu cùng một giá trị (đã xong thì số thực, chưa xong thì số dự kiến) (確認メモ H-31). Hiện riêng là việc còn tồn"]),
    I("38.1", "集金予定額", "Số tiền thu dự kiến", ".collap:nth-of-type(3) .grid3 > .fld:nth-child(1)", "label", detail=["最終区間だけ。注文時の集金の予定額（円）。", "Chỉ chặng cuối. Số tiền dự kiến thu khi đặt hàng (yên)."]),
    I("38.2", "集金額（税込）", "Số tiền thu (gồm thuế)", ".collap:nth-of-type(3) .grid3 > .fld:nth-child(2)", "label", detail=["配送スタッフが報告した実際の集金額（円）。報告前は空。", "Số tiền thực thu do nhân viên báo cáo (yên). Chưa báo cáo thì để trống."]),
]
D_VIEWER = [
    I("39", "添付ファイルの表示", "Xem tệp đính kèm", ".modal.viewer", "modal",
      detail=["画像・PDF を大きく開く。← → キーか左右の矢印で前後へ、枚数（n / m）を下に出す。閉じるボタン・背景・Esc で閉じる。", "Mở lớn ảnh / PDF. Dùng phím ← → hoặc mũi tên trái phải để chuyển, hiện số thứ tự (n / m) bên dưới. Đóng bằng nút đóng, nền hoặc Esc."]),
    I("39.1", "ダウンロード", "Tải xuống", ".modal.viewer button[aria-label=\"ダウンロード\"]", "button", "click", detail=["表示中のファイルをダウンロードする。", "Tải tệp đang xem xuống."], demo_ok=["コードはダウンロードせずトーストだけ（確認メモ H-29）。宿題", "Code chỉ hiện toast, không tải (確認メモ H-29). Việc còn tồn"]),
    I("39.2", "縮小・拡大", "Thu nhỏ / phóng to", ".modal.viewer button[aria-label=\"拡大\"]", "button", "click", detail=["画像を0.5〜3倍に縮小・拡大する（0.25刻み）。", "Thu nhỏ / phóng to ảnh 0,5〜3 lần (bước 0,25)."]),
    I("39.3", "その他（削除）", "Khác (xóa)", ".modal.viewer button[aria-label=\"その他\"]", "button", "click", err=["Q01"], detail=["押すとメニュー「削除」を出す。削除できるのは、委託配送先が自分でアップロードしたファイル（No.32.1）だけ。お客様がアップロードした資料（No.32）では「削除」を出さない（台帳 F 2026-10-08）。押すと確認（No.40）。", "Bấm hiện menu 「削除」. Chỉ xóa được tệp do chính đối tác tải lên (No.32.1). Với tài liệu do khách tải lên (No.32) không hiện 「削除」 (台帳 F 2026-10-08). Bấm thì hiện xác nhận (No.40)."],
      demo_ok=["コードは6ファイルすべてで「削除」を出し、お客様の資料も消せる見た目（実際には消さない）。台帳 F 2026-10-08：自分が上げたファイルだけ消せる。宿題", "Code hiện 「削除」 cho cả 6 tệp, kể cả tài liệu của khách (thực tế không xóa). 台帳 F 2026-10-08: chỉ xóa được tệp do mình tải lên. Việc còn tồn"]),
    I("39.4", "閉じる", "Đóng", ".modal.viewer button[aria-label=\"閉じる\"]", "button", "click", detail=["表示を閉じる。", "Đóng màn xem."]),
    I("39.5", "前の画像・次の画像", "Ảnh trước / sau", ".modal.viewer .nav.next", "button", "click", detail=["前後のファイルへ。端まで来たら反対側へ回る。", "Chuyển sang tệp trước/sau. Tới đầu/cuối thì quay vòng sang phía đối diện."]),
]
D_DEL = [
    I("40", "ファイルの削除確認", "Xác nhận xóa tệp", ".modal.sm", "modal", err=["Q01"],
      detail=["Q01：「このファイルを削除しますか？」。委託配送先が自分でアップロードしたファイルだけが対象。ボタンは「キャンセル」「削除する」。削除できたら S02。論理削除。", "Q01: 「このファイルを削除しますか？」. Nút 「キャンセル」「削除する」. Xóa xong hiện S02. Xóa logic."], pattern="P-DEL",
      demo_ok=["コードのファイル削除はトースト「ファイルを削除しました」だけで実際には消さない（確認メモ H-29）。宿題", "Xóa tệp trong code chỉ hiện toast 「ファイルを削除しました」 và không xóa thật (確認メモ H-29). Việc còn tồn"]),
    I("40.1", "削除する", "Xóa", ".modal.sm .btn.pri", "button", "click", err=["S02", "E33"], detail=["ファイルを削除して S02。失敗は E33。", "Xóa tệp và hiện S02. Thất bại: E33."]),
]
D_LEAVE = [
    I("41", "編集中に離れる確認", "Xác nhận khi rời lúc đang sửa", ".modal.sm", "modal", err=["Q02"], pattern="P-FORM",
      detail=["配送スタッフを選び直したまま、サイドメニュー・ヘッダーなどで別の画面へ移ろうとしたら Q02（キャンセル／破棄）を出す。ブラウザを閉じる・再読み込みでも同じ。", "Đang đổi nhân viên mà định chuyển sang màn khác bằng menu bên, header v.v. thì hiện Q02 (キャンセル／破棄). Đóng trình duyệt hoặc tải lại cũng giống vậy."]),
]
D_NOTFOUND = [
    I("42", "見つからないときの表示", "Hiển thị khi không tìm thấy", ".placeholder", "area", err=["I400"],
      detail=["他社の配送No・存在しない配送Noを開いたときは I400「配送が見つかりません。」と「配送管理に戻る」を出す。他社のデータの有無は分からないようにする。", "Khi mở số giao hàng của công ty khác hoặc không tồn tại hiện I400 「配送が見つかりません。」 và nút 「配送管理に戻る」. Không để lộ việc dữ liệu của công ty khác có tồn tại hay không."],
      demo_ok=["コードの文言は「配送 {配送No} は見つかりません。」（確認メモ H-15・I400）。宿題", "Câu trong code là 「配送 {配送No} は見つかりません。」 (確認メモ H-15・I400). Việc còn tồn"]),
]

VIEWS = [
    V("001", "OW_DELV_001", "初期表示（出荷日基準・当週から2週間）", "Hiển thị ban đầu (cơ sở ngày xuất, từ tuần hiện tại 2 tuần)", "/carrier/deliveries", L1,
      note=["栄成ロジ（DE00001）。デモの今日（2026-10-05）の週から2週間（10/05〜10/18）の配送。見本では川崎工場あての2件（10/07・代替品あり）。画面の写真はコードの今の動き（納品日基準・今日の3日前〜10日後）。", "栄成ロジ (DE00001). Các chuyến trong 2 tuần từ tuần của 'hôm nay' (2026-10-05) (10/05〜10/18). Mẫu có 2 chuyến tới 川崎工場 (10/07, có hàng thay thế). Ảnh màn hình là hành vi hiện tại của code (cơ sở ngày giao, 3 ngày trước đến 10 ngày sau hôm nay)."]),
    V("002", "OW_DELV_001", "詳細条件を開く", "Mở điều kiện chi tiết", "/carrier/deliveries", L2, setup=H + ADV, wait=500,
      note=["▼を押して詳細条件を開いた状態。", "Đã bấm ▼ để mở điều kiện chi tiết."]),
    V("003", "OW_DELV_001", "0件（I01）", "0 dòng (I01)", "/carrier/deliveries", L3,
      setup=H + ADV + "setv(document.querySelector('.adv input[placeholder=\"配送No\"]'),'ZZZ');document.querySelector('.search-row .btn.pri').click();await wait(400);", wait=500,
      note=["存在しない配送Noで検索した状態。", "Đã tìm bằng số giao hàng không tồn tại."]),
    V("004", "OW_DELV_001", "行を選択（一括バー「n件選択中」）", "Chọn dòng (thanh 「n件選択中」)", "/carrier/deliveries", L4,
      setup=H + "tick('DL-261006-0001:1');await wait(300);", wait=500,
      note=["先頭の行をチェックした状態。", "Đã chọn dòng đầu tiên."]),
    V("005", "OW_DELV_001", "選べない行（納品済・理由のツールチップ）", "Dòng không chọn được (chú thích lý do)", "/carrier/deliveries", L5, today="2026/09/20",
      note=["デモの今日を 2026/09/20 にして、納品済の行（チェック欄が無効）を出した状態。確認中・出荷済・受取済は見本データにない。", "Đặt 'hôm nay' = 2026/09/20 để hiện dòng 納品済 (ô chọn bị vô hiệu). Dữ liệu mẫu không có 確認中・出荷済・受取済."]),
    V("006", "OW_DELV_001", "未設定のみ＋ドライバー未設定の警告帯", "Chỉ chưa gán + dải cảnh báo chưa gán tài xế", "/carrier/deliveries", L6, today="2026/12/01",
      setup=H + "document.querySelector('.chip').click();await wait(400);", wait=500,
      note=["デモの今日を 2026/12/01 にした状態。翌日（12/02）納品の川崎工場の2次の区間が未設定。チップ「配送スタッフ未設定のみ」を押した。", "Đặt 'hôm nay' = 2026/12/01. Chặng 2 đi 川崎工場 giao ngày mai (12/02) chưa gán. Đã bấm chip 「配送スタッフ未設定のみ」."]),
    V("007", "OW_DELV_001", "配送スタッフ一括設定（モーダル）", "Gán nhân viên hàng loạt (modal)", "/carrier/deliveries", MODAL, today="2026/12/01",
      setup=H + "tick('DL-261201-0001:2');await wait(200);document.querySelector('.bulkbar .btn.pri').click();await wait(400);", wait=500,
      note=["未設定の1件（DL-261201-0001:2）を選んで「配送スタッフを一括設定」を押した状態。", "Đã chọn 1 chuyến chưa gán (DL-261201-0001:2) và bấm 「配送スタッフを一括設定」."]),
    V("008", "OW_DELV_001", "一括設定：上書きの警告（設定済みを含む）", "Gán hàng loạt: cảnh báo ghi đè (có chuyến đã gán)", "/carrier/deliveries", OVERWRITE, today="2026/12/01",
      setup=H + "tick('DL-261201-0001:1');tick('DL-261201-0001:2');await wait(200);document.querySelector('.bulkbar .btn.pri').click();await wait(400);", wait=500,
      note=["設定済み（:1）と未設定（:2）の2件を選んだ状態。1件が上書きになる。", "Đã chọn 2 chuyến: đã gán (:1) và chưa gán (:2). 1 chuyến sẽ bị ghi đè."]),
    V("009", "OW_DELV_001", "一括設定：入力エラー（スタッフ未選択）", "Gán hàng loạt: lỗi nhập (chưa chọn nhân viên)", "/carrier/deliveries", NOINPUT, today="2026/12/01",
      setup=H + "tick('DL-261201-0001:2');await wait(200);document.querySelector('.bulkbar .btn.pri').click();await wait(400);", wait=500,
      note=["スタッフを選ばない状態。コードは「確定」を押せなくしているので、エラーの文言は出ない（宿題）。", "Trạng thái chưa chọn nhân viên. Code vô hiệu nút 「確定」 nên không hiện câu lỗi (việc còn tồn)."]),
    V("010", "OW_DELV_001", "一括設定：完了（トースト・出荷指示の再送待ち）", "Gán hàng loạt: hoàn tất (toast, chờ gửi lại chỉ thị)", "/carrier/deliveries", DONE, today="2026/12/01",
      setup=H + "tick('DL-261201-0001:2');await wait(200);document.querySelector('.bulkbar .btn.pri').click();await wait(400);setv(document.querySelector('#asStaff'),'DR00015');await wait(200);document.querySelector('.modal footer .btn.pri').click();await wait(500);", wait=300,
      note=["DR00015 を選んで「確定」を押した直後。トーストが出る。", "Ngay sau khi chọn DR00015 và bấm 「確定」. Hiện toast."]),
    V("011", "OW_DELV_001", "CSV出力（トースト S12）", "Xuất CSV (toast S12)", "/carrier/deliveries", CSVDONE,
      setup=H + "[...document.querySelectorAll('.phead .btn')].find(b=>b.textContent.includes('CSV')).click();await wait(600);", wait=300,
      note=["「CSV出力」を押した直後。", "Ngay sau khi bấm 「CSV出力」."]),
    V("012", "OW_DELV_002", "配送概要（出荷待・担当未設定・割当の編集中）", "Tổng quan giao hàng (出荷待, chưa gán, đang sửa phân công)", "/carrier/deliveries/DL-261215-0001:2", D1, today="2026/12/15",
      note=["デモの今日を 2026/12/15 にして、翌日納品の川崎工場の2次の区間（担当未設定・出荷待）を開いた状態。未設定なので編集の状態で開く。", "Đặt 'hôm nay' = 2026/12/15 và mở chặng 2 đi 川崎工場 giao ngày mai (chưa gán, 出荷待). Vì chưa gán nên mở ở trạng thái sửa."]),
    V("013", "OW_DELV_002", "配送概要（担当設定済み・担当件数の表示）", "Tổng quan (đã gán, hiện số chuyến phụ trách)", "/carrier/deliveries/DL-261020-0001", D_ASSIGNED,
      note=["DR00015 が担当の配送（名古屋本社・10/21・出荷待）。", "Chuyến có DR00015 phụ trách (名古屋本社, 10/21, 出荷待)."]),
    V("014", "OW_DELV_002", "割当の変更（出荷指示の再送待ちの注意）", "Đổi phân công (lưu ý gửi lại chỉ thị xuất hàng)", "/carrier/deliveries/DL-261020-0001", D_CHANGE,
      setup=H + EDIT + "setv(document.querySelector('#drvSel'),'DR00014');await wait(300);", wait=500,
      note=["「編集」を押して別の配送スタッフ（DR00014）を選んだ状態（まだ確定しない）。", "Đã bấm 「編集」 và chọn nhân viên khác (DR00014), chưa xác nhận."]),
    V("015", "OW_DELV_002", "割当できない状態（納品済・「編集」が無効＋理由）", "Trạng thái không gán được (納品済, 「編集」 vô hiệu + lý do)", "/carrier/deliveries/DL-260918-0001", D_LOCK,
      note=["納品済の配送。確認中・出荷済・受取済は見本データにないので、納品済で代表させる。", "Chuyến 納品済. Dữ liệu mẫu không có 確認中・出荷済・受取済 nên dùng 納品済 làm đại diện."]),
    V("016", "OW_DELV_002", "配送概要：トラブル報告あり（対応中の帯）", "Tổng quan: có báo cáo sự cố (dải đang xử lý)", "/carrier/deliveries/DL-260918-0003:2", D_TROUBLE_BAND,
      note=["遅延のトラブルが対応中の配送（川崎工場の2次の区間）。", "Chuyến có sự cố trễ đang xử lý (chặng 2 đi 川崎工場)."]),
    V("017", "OW_DELV_002", "配送概要：一部納品済（不足の帯）", "Tổng quan: 一部納品済 (dải thiếu hàng)", "/carrier/deliveries/DL-260914-0001", D_PART_BAND, login="DE00006",
      note=["みどり便（DE00006）の一部納品済の配送。", "Chuyến 一部納品済 của みどり便 (DE00006)."]),
    V("018", "OW_DELV_002", "配送概要：路線便の送り状（追跡リンク）", "Tổng quan: phiếu gửi hàng đi tuyến (liên kết theo dõi)", "/carrier/deliveries/DL-261103-0001:1", D_TRACK,
      note=["路線便の配送が見本データにないので、通常の配送を開く（追跡の枠は撮れない）。", "Dữ liệu mẫu không có chuyến đi tuyến nên mở chuyến thường (không chụp được khung theo dõi)."]),
    V("019", "OW_DELV_002", "配送概要：代替品あり（荷物の中身の変更・回収／廃棄）", "Tổng quan: có hàng thay thế (đổi nội dung hàng, thu hồi / hủy)", "/carrier/deliveries/DL-261006-0001:1", D_ALT,
      note=["代替品の設定（ALT-2610-0001）がある配送。状態のバッジは出るが、荷物の中身の変更の枠は出ない（宿題）。", "Chuyến có thiết lập hàng thay thế (ALT-2610-0001). Badge trạng thái hiện nhưng khung đổi nội dung hàng chưa hiện (việc còn tồn)."]),
    V("020", "OW_DELV_002", "配送住所タブ（引取先・届け先・搬入経路）", "Tab địa chỉ (nơi lấy, nơi giao, lộ trình)", "/carrier/deliveries/DL-261020-0001?tab=address", D_ADDR,
      note=["?tab=address。", "?tab=address."]),
    V("021", "OW_DELV_002", "実績タブ（納品前：空）", "Tab kết quả (trước khi giao: trống)", "/carrier/deliveries/DL-261020-0001?tab=result", D_RES_EMPTY,
      note=["納品前の配送の実績タブ。", "Tab kết quả của chuyến chưa giao."]),
    V("022", "OW_DELV_002", "実績タブ（納品済：廃棄数確認・陳列結果確認）", "Tab kết quả (đã giao: xác nhận hủy, trưng bày)", "/carrier/deliveries/DL-260918-0001?tab=result", D_RES,
      note=["納品済の配送の実績タブ。", "Tab kết quả của chuyến đã giao."]),
    V("023", "OW_DELV_002", "トラブルタブ（報告一覧・運営の対応）", "Tab sự cố (danh sách báo cáo, xử lý của 運営)", "/carrier/deliveries/DL-260918-0003:2?tab=trouble", D_TROUBLE_TAB,
      note=["?tab=trouble。遅延のトラブルが対応中。", "?tab=trouble. Sự cố trễ đang xử lý."]),
    V("024", "OW_DELV_002", "トラブルタブ（一部納品の内容）", "Tab sự cố (nội dung giao một phần)", "/carrier/deliveries/DL-260914-0001?tab=trouble", D_PART_TAB, login="DE00006",
      note=["みどり便の一部納品済の配送のトラブルタブ。", "Tab sự cố của chuyến 一部納品済 của みどり便."]),
    V("025", "OW_DELV_002", "添付資料タブ（駐車報告・集金報告）", "Tab tài liệu (báo cáo đỗ xe, thu tiền)", "/carrier/deliveries/DL-260918-0001?tab=files", D_FILES,
      note=["?tab=files。", "?tab=files."]),
    V("026", "OW_DELV_002", "添付ファイルの表示（ビューア）", "Xem tệp đính kèm (viewer)", "/carrier/deliveries/DL-261020-0001?tab=address", D_VIEWER,
      setup=H + "document.querySelector('button[aria-label=\"IMG_0291.jpgを表示\"]').click();await wait(500);", wait=500,
      note=["配送住所タブの添付ファイルを押した状態。", "Đã bấm tệp đính kèm ở tab địa chỉ."]),
    V("027", "OW_DELV_002", "添付ファイルの削除確認（Q01）", "Xác nhận xóa tệp đính kèm (Q01)", "/carrier/deliveries/DL-261020-0001?tab=address", D_DEL,
      setup=H + "document.querySelector('button[aria-label=\"IMG_0291.jpgを表示\"]').click();await wait(400);document.querySelector('.modal.viewer button[aria-label=\"その他\"]').click();await wait(300);document.querySelector('.modal.viewer .menu-pop button').click();await wait(400);", wait=500,
      note=["ビューアの「その他」→「削除」を押した状態。", "Đã bấm 「その他」 → 「削除」 trong viewer."]),
    V("028", "OW_DELV_002", "編集中に離れる（Q02）", "Rời khi đang sửa (Q02)", "/carrier/deliveries/DL-261020-0001", D_LEAVE,
      setup=H + EDIT + "setv(document.querySelector('#drvSel'),'DR00014');await wait(300);document.querySelector('.menu a[href=\"/carrier/schedule\"]').click();await wait(500);", wait=500,
      note=["担当を選び直してサイドメニューの「スケジュール」を押した直後。", "Ngay sau khi đổi nhân viên và bấm 「スケジュール」 ở menu bên."]),
    V("029", "OW_DELV_002", "見つからない（他社の配送ID）", "Không tìm thấy (ID giao hàng của công ty khác)", "/carrier/deliveries/DL-261020-0001", D_NOTFOUND, login="DE00006",
      note=["みどり便（DE00006）が栄成ロジの配送IDを開いた状態。", "みどり便 (DE00006) mở ID giao hàng của 栄成ロジ."]),
]
