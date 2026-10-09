# -*- coding: utf-8 -*-
"""
画面設計書のデータ：運営管理者Web ＞ アカウント管理 ＞ 権限（一覧・詳細・登録・編集・削除）
元：本物の Web（app/ops/accounts/permissions・lib/domain/areas/account.ts の saveRole/removeRole・lib/ops/permissions.ts（機能×操作））、台帳 F（2026-10-06・権限の付け方）・運営Web_権限表・CSV入出力_定義
番号は画面ごとに通し。タブ・モーダルの状態では、その状態で増える・変わる項目だけ書く。
"""

TITLE = ["権限（AW_PERM）", "Quyền (vai trò) (AW_PERM)"]
SHEET = ["権限", "Quyền (vai trò)"]
BASENAME = "画面設計書_AW_PERM_権限"
IMG_PREFIX = "AW_PERM"
OUT_DIR = "AW_PERM_権限"
CODE_NOTE = ["画面コードは規約 <Module(2)>_<Feature(4)>_<Seq(3)>（docs/01_仕様/画面コード規約_20261005.md）。AW＝運営管理者Web、PERM＝権限（役割）",
             "Mã màn hình theo quy ước <Module(2)>_<Feature(4)>_<Seq(3)>. AW = Admin Web, PERM = Quyền (vai trò)"]
SITE = "ops"
SYSTEM = {"ja": "運営管理者Web", "vi": "Web quản trị vận hành"}
AUTHOR = "Claude（cloud）／確認：hong"
CREATED = "2026-10-06"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "ops", "loginId": "Ad00010"}
CODE_PATHS = ["app/ops/accounts/permissions", "lib/ops/permissions.ts", "lib/domain/areas/account.ts", "lib/domain/seed/account.ts"]

DECISIONS = [
    {"date": "2026-10-06", "target": "一覧の検索",
     "q": ["権限の一覧に検索を置くか", "Danh sách quyền có ô tìm kiếm không"],
     "a": ["置く。キーワード（権限名・備考）と状態（有効・削除済み。既定は有効）。1ページ 10件（P-LIST）", "Có. Từ khóa (tên quyền, ghi chú) và trạng thái (有効/削除済み, mặc định 有効). 10 dòng/trang"],
     "src": "hong 回答 2026-10-06（補足「bổ sung」）・受付簿 No.174"},
    {"date": "2026-10-06", "target": "詳細画面",
     "q": ["権限の詳細画面は", "Màn chi tiết quyền"],
     "a": ["作る（表示だけ。基本情報・機能別の操作・この権限を持つアカウント。編集・削除はここから）。登録・保存したあとは詳細へ戻る（P-FORM）", "Có làm (chỉ xem. Thông tin cơ bản, thao tác theo chức năng, tài khoản đang có quyền này. Sửa/xóa từ đây). Sau khi đăng ký/lưu quay về chi tiết (P-FORM)"],
     "src": "hong 回答 2026-10-06（補足「bổ sung màn detail」）・受付簿 No.174"},
    {"date": "2026-10-06", "target": "削除",
     "q": ["権限の削除のしかた・条件", "Cách xóa và điều kiện xóa quyền"],
     "a": ["論理削除（状態＝削除済）。削除できない：その権限を持つアカウント（削除済みを除く）がある（E261）／「権限付与」を編集できる運営アカウントが1人もいなくなる（E262。フル権限・システム管理の権限は削除できない）", "Xóa logic (trạng thái 削除済み). Không xóa được khi: còn tài khoản (không tính đã xóa) có quyền này (E261); hoặc không còn tài khoản vận hành nào sửa được 「権限付与」 (E262, không xóa được quyền フル権限/システム管理)"],
     "src": "hong 回答 2026-10-06（運営I2 #6）・コード keepGrantEditor・受付簿 No.174"},
    {"date": "2026-10-05", "target": "権限の付け方",
     "q": ["「権限付与」を CRUD にすると全機能 CRUD か", "Nếu 権限付与 là CRUD thì tất cả chức năng là CRUD?"],
     "a": ["役割ごとに機能 × 操作を手でチェックする。自動の規則は作らない（権限の画面でグループ単位のまとめてチェックを使う）", "Tick tay từng chức năng × thao tác cho mỗi vai trò, không có quy tắc tự động (dùng tick gộp theo nhóm trên màn hình)"],
     "src": "台帳 F（運営の役割の権限の付け方）・受付簿 No.155"},
    {"date": "2026-10-06", "target": "権限（この画面を見られる・操作できる役割）",
     "q": ["だれが見られる・操作できるか", "Ai xem/thao tác được"],
     "a": ["フル権限・システム管理＝CRUD、ほかの6役割（経理・営業・CS・商品管理・商品開発・物流）＝R（閲覧・CSV出力）。「閲覧のみ」役割と倉庫スタッフの扱いは権限表のまま（hong 確認 2026-10-06）", "フル権限・システム管理 = CRUD, 6 vai trò khác = R. Cách xử lý vai trò 「閲覧のみ」 và 倉庫スタッフ giữ theo bảng quyền (hong xác nhận)"],
     "src": "hong 回答 2026-10-06（権限付与は閲覧を許可）・台帳 F・受付簿 No.173"},
    {"date": "2026-10-06", "target": "画面コード",
     "q": ["画面コード", "Mã màn hình"], "a": ["AW_PERM_001〜003", "AW_PERM_001〜003"], "src": "hong 回答 2026-10-06（運営I2 #9）"},
]
CHANGES = [{"ver": "1.2", "date": "2026-10-06", "no": ["5.1", "5.2", "7"], "type": "追加", "reason": ["hong の HTML コメント（2026-10-06）への対応", "Xử lý góp ý (comment HTML) của hong (2026-10-06)"], "impact": ["「まとめて」の列をなくし、見出し行・グループ行に列ごとの一括チェックを置いた（実装済・受付簿 No.181）", "Bỏ cột 「まとめて」, đặt checkbox chọn hàng loạt theo từng cột ở hàng tiêu đề và hàng nhóm (đã triển khai, 受付簿 No.181)"]},
    {"ver": "1.1", "date": "2026-10-06", "no": ["1"], "type": "追加", "reason": ["状態を追加：0件・参照のみ・入力エラー", "Thêm trạng thái: 0 dòng, chỉ xem, lỗi nhập"], "impact": ["権限名の空・重複を項目の下に表示（E01・E260）。実装済", "Hiển thị lỗi (trống/trùng) dưới ô tên quyền (E01・E260). Đã triển khai"]},
    {"ver": "1.1", "date": "2026-10-06", "no": ["1.2", "2"], "type": "変更", "before": ["権限登録ボタン：パターンなし／権限名のエラーはトースト", "Nút đăng ký quyền: chưa có pattern / lỗi tên quyền hiện bằng toast"], "after": ["権限登録に P-FORM／権限名のエラーは項目の下（赤枠）", "Nút đăng ký quyền theo P-FORM / lỗi tên quyền hiện dưới ô (viền đỏ)"], "reason": ["役割レビュー（BA・QC・UI/UX）の指摘への対応", "Xử lý các góp ý từ review vai trò (BA・QC・UI/UX)"], "impact": ["RoleEditor の保存で項目の下にエラー（実装済）", "Lỗi hiện dưới ô khi lưu ở RoleEditor (đã triển khai)"]},
]
HIDE_ALWAYS = []
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [
    {"code": "AW_PERM_001", "ja": "権限一覧", "vi": "Danh sách quyền"},
    {"code": "AW_PERM_002", "ja": "権限詳細", "vi": "Chi tiết quyền"},
    {"code": "AW_PERM_003", "ja": "権限の登録・編集", "vi": "Đăng ký / sửa quyền"},
]

H = (
    "const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));"
    "const clickText=(sel,t,i)=>{const b=[...document.querySelectorAll(sel)].filter(x=>(x.textContent||'').includes(t))[i||0];b&&b.click();};"
    "const delIcon=(i)=>{const b=document.querySelectorAll('.tbl tbody tr')[i||0]?.querySelector('.act button:last-child');b&&b.click();};"
)

L_ITEMS = [
    {"no": "1", "ja": "ヘッダー", "vi": "Đầu trang", "sel": ".ph", "kind": "area", "trig": "view",
     "detail": ["パンくず：アカウント管理 ＞ 権限。見られるのは運営の全役割（登録・編集・削除ができるのはフル権限・システム管理だけ）。", "Breadcrumb: アカウント管理 > 権限. Mọi vai trò vận hành đều xem được (chỉ フル権限・システム管理 mới đăng ký/sửa/xóa được)."]},
    {"no": "1.1", "ja": "CSV出力", "vi": "Xuất CSV", "sel": ".ph", "kind": "button", "trig": "click", "pattern": "P-CSV-OUT",
     "detail": ["ヘッダーの右。一覧の全件（検索条件のとおり。権限名・備考・ユーザー数・機能ごとの操作）。", "Bên phải đầu trang. Toàn bộ danh sách (theo điều kiện tìm kiếm; tên quyền, ghi chú, số người dùng, thao tác theo chức năng)."]},
    {"no": "1.2", "ja": "権限登録", "vi": "Đăng ký quyền", "sel": ".ph .btn.pri", "kind": "button", "trig": "click", "pattern": "P-FORM",
     "detail": ["権限の登録（AW_PERM_003）へ。登録の権限がない役割には出さない。", "Chuyển sang đăng ký quyền (AW_PERM_003). Không hiện với vai trò không có quyền đăng ký."]},
    {"no": "2", "ja": "検索条件", "vi": "Điều kiện tìm kiếm", "sel": ".es-search__main", "kind": "area", "trig": "view", "pattern": "P-LIST",
     "detail": ["キーワード（権限名・備考。部分一致）／状態（有効・削除済み。既定は有効）。", "Từ khóa (tên quyền, ghi chú; khớp một phần) / trạng thái (有効・削除済み; mặc định 有効)."]},
    {"no": "3", "ja": "権限の一覧", "vi": "Danh sách quyền", "sel": ".tbl", "kind": "table", "trig": "view", "pattern": "P-LIST", "err": ["I01"],
     "detail": ["初期の並びは登録順（マスタなので昇順）。1ページ 10件。0件は I01。権限名を押すと詳細（AW_PERM_002）へ。", "Thứ tự ban đầu: theo thứ tự đăng ký (master nên tăng dần). 10 dòng/trang. 0 dòng hiện I01. Nhấn tên quyền để mở chi tiết (AW_PERM_002)."]},
    {"no": "3.1", "ja": "権限名・備考", "vi": "Tên quyền / ghi chú", "sel": ".tbl th::権限名", "kind": "label", "trig": "view",
     "detail": ["権限名は下線つきのリンク。備考は長いと一行で切って表示。", "Tên quyền là link có gạch chân. Ghi chú dài thì cắt thành một dòng."]},
    {"no": "3.2", "ja": "ユーザー数", "vi": "Số tài khoản", "sel": ".tbl th::ユーザー数", "kind": "label", "trig": "view",
     "detail": ["この権限を持つアカウントの数（削除済みのアカウントは数えない）。右寄せ。", "Số tài khoản đang có quyền này (không tính tài khoản đã xóa). Căn phải."]},
    {"no": "3.3", "ja": "状態", "vi": "Trạng thái", "sel": ".tbl th::状態", "kind": "label", "trig": "view",
     "detail": ["「有効」「削除済」（バッジ）。削除済みは検索条件で出したときだけ表示し、行は灰色。", "Badge 「有効」「削除済」. Chỉ hiện quyền đã xóa khi chọn trong điều kiện tìm kiếm, dòng màu xám."]},
    {"no": "3.4", "ja": "操作（編集・削除）", "vi": "Thao tác (sửa / xóa)", "sel": ".tbl .act", "kind": "button", "trig": "click", "pattern": "P-DEL", "err": ["Q01", "S02", "E261", "E262"],
     "detail": ["鉛筆＝編集（AW_PERM_003）、ごみ箱＝削除（確認 Q01 → 論理削除して S02）。削除済みの行には出さない。持っているアカウントがある権限・最後の「権限付与」の編集者になる権限は削除できない（E261・E262）。操作の権限がない役割には出さない。", "Bút chì = sửa (AW_PERM_003), thùng rác = xóa (xác nhận Q01 → xóa logic và hiện S02). Không hiện ở dòng đã xóa. Quyền đang có tài khoản, hoặc quyền khiến không còn ai sửa được 「権限付与」 thì không xóa được (E261・E262). Không hiện với vai trò không có quyền thao tác."]},
    {"no": "4", "ja": "ページ送り", "vi": "Phân trang", "sel": ".pager", "kind": "area", "trig": "view", "pattern": "P-LIST",
     "detail": ["P-LIST のとおり（10／20／50件）。", "Theo P-LIST (10/20/50 dòng)."]},
]

D_ITEMS = [
    {"no": "1", "ja": "ヘッダー", "vi": "Đầu trang", "sel": ".ph", "kind": "area", "trig": "view",
     "detail": ["パンくず：アカウント管理 ＞ 権限 ＞ 権限名。右に「一覧へ戻る」「編集」「削除」（編集・削除は権限のある役割だけ。削除済みの権限には出さない）。", "Danh sách tài khoản > Quyền > Tên quyền. Bên phải có \"Quay lại danh sách\", \"Sửa\", \"Xóa\" (chỉ vai trò có quyền mới sửa/xóa; không hiển thị cho quyền đã xóa)."]},
    {"no": "2", "ja": "基本情報", "vi": "Thông tin cơ bản", "sel": ".card", "kind": "area", "trig": "view",
     "detail": ["権限名・備考・状態・ユーザー数・最終更新（日時と更新した人）。すべて表示だけ。", "Tên quyền, ghi chú, trạng thái, số người dùng, cập nhật cuối (ngày giờ và người cập nhật). Tất cả chỉ hiển thị."]},
    {"no": "3", "ja": "機能ごとの操作", "vi": "Thao tác theo chức năng", "sel": ".card:nth-of-type(n+2)", "kind": "area", "trig": "view", "pattern": "P-TAB",
     "detail": ["系統（基本操作系・法人・拠点・契約管理系 など）ごとのカード。機能ごとに 閲覧・作成・編集・削除・CSV取込・CSV出力 と、機能ごとの操作（承認・公開・確定など）を ✓ で表示（編集画面と同じ並び・表示だけ）。系統は折りたためる。", "Mỗi nhóm (thao tác cơ bản, doanh nghiệp・điểm・hợp đồng…) một thẻ. Mỗi chức năng hiện bằng ✓: xem, tạo, sửa, xóa, nhập CSV, xuất CSV và thao tác riêng của chức năng (duyệt, công khai, xác định…) (cùng bố cục màn sửa, chỉ hiển thị). Nhóm có thể thu gọn."]},
    {"no": "4", "ja": "この権限を持つアカウント", "vi": "Tài khoản có quyền này", "sel": "-", "kind": "table", "trig": "view", "pattern": "P-LIST", "err": ["I01"],
     "detail": ["列：ユーザーID・ユーザー名・アカウント状態。1ページ 10件。名前を押しても動かない（アカウントの操作はアカウント一覧）。0件は I01。", "Cột: ID người dùng, tên người dùng, trạng thái tài khoản. 10 dòng/trang. Nhấn tên không có tác dụng (thao tác tài khoản làm ở danh sách tài khoản). 0 dòng hiện I01."]},
]

E_ITEMS = [
    {"no": "1", "ja": "ヘッダー", "vi": "Đầu trang", "sel": ".ph", "kind": "area", "trig": "view", "pattern": "P-FORM", "err": ["Q02", "S01", "E30", "E31"],
     "detail": ["パンくず：アカウント管理 ＞ 権限 ＞「権限登録」または権限名。右に「キャンセル」「登録」（編集は「保存」）。入力を変えてキャンセルしたら Q02。成功したら S01 を出して詳細（AW_PERM_002）へ（新規は登録した権限の詳細）。", "Danh sách tài khoản > Quyền > \"Đăng ký quyền\" hoặc tên quyền. Bên phải có \"Hủy\" \"Đăng ký\" (sửa là \"Lưu\"). Nhập rồi hủy là Q02. Thành công là S01 rồi đi chi tiết (AW_PERM_002) (mới là chi tiết quyền vừa đăng ký)."]},
    {"no": "2", "ja": "権限名", "vi": "Tên quyền", "sel": "#role-name", "kind": "text", "trig": "input", "req": "○", "len": "文字列 60", "fid": "role-name",
     "ex": ["CS（東日本）", "Tên quyền ví dụ (CS khu vực Đông Nhật Bản)"], "valid": ["ほかの権限（削除済みを除く）と同じ名前は不可。", "Không được trùng tên với quyền khác (không tính quyền đã xóa)."], "err": ["E01", "E04", "E260"],
     "detail": ["アカウントに付ける役割の名前。", "Tên vai trò gán cho tài khoản."]},
    {"no": "3", "ja": "備考", "vi": "Ghi chú", "sel": "#role-note", "kind": "textarea", "trig": "input", "req": "－", "len": "文字列 500", "fid": "role-note",
     "ex": ["東日本のお客様対応。法人・契約の編集ができる", "Ghi chú ví dụ: chăm sóc khách hàng khu vực Đông Nhật Bản, sửa được doanh nghiệp và hợp đồng."], "err": ["E04"],
     "detail": ["どんな人に付ける権限かのメモ。複数行。", "Ghi chú quyền này gán cho ai. Nhiều dòng."],
     "demo_ok": ["コードは1行の入力欄。複数行（500文字）にする（入力の共通基準）", "Code là ô 1 dòng. Đổi thành nhiều dòng (500 ký tự) theo chuẩn nhập chung."]},
    {"no": "4", "ja": "説明文", "vi": "Văn bản giải thích", "sel": ".card .hint", "kind": "label", "trig": "view",
     "detail": ["操作の選び方（「閲覧」を外すとその機能の操作はすべてなくなる・系統の先頭の行でまとめて付けられる・2つ以上の権限を持つアカウントはどれかでできる操作ができる）。", "Cách chọn thao tác: bỏ 「閲覧」 thì mọi thao tác của chức năng đó mất; dòng đầu của mỗi nhóm gán gộp được; tài khoản có từ 2 quyền trở lên làm được thao tác nếu một trong các quyền cho phép (quyền cao hơn)."]},
    {"no": "5", "ja": "系統のカード", "vi": "Thẻ theo nhóm chức năng", "sel": ".card:nth-of-type(n+2)", "kind": "area", "trig": "click", "pattern": "P-TAB",
     "detail": ["系統ごとに1枚。見出しの▼▶で折りたたむ（閉じていても「すべての機能」の行は使える）。見出しの横に「n／m機能で操作あり」。", "Mỗi nhóm một thẻ. Thu gọn bằng ▼▶ ở tiêu đề (dù đang thu gọn vẫn dùng được dòng 「すべての機能」). Cạnh tiêu đề hiện 「n／m chức năng có thao tác」."]},
    {"no": "5.1", "ja": "すべての機能（系統まとめ）", "vi": "Tất cả chức năng", "sel": ".tbl tbody tr:first-child", "kind": "area", "trig": "select",
     "detail": ["その系統の全機能にいっぺんに付ける・外す。操作ごと（作成・閲覧・編集・削除・CSV取込・CSV出力）の列にチェックを置く（全部あり＝✓、一部だけ＝－）。「まとめて」の欄（ドロップダウン）は置かない（hong 2026-10-06）。", "Gán/bỏ cho tất cả chức năng của nhóm cùng lúc bằng ô tick ở từng cột thao tác (tạo・xem・sửa・xóa・nhập CSV・xuất CSV; tất cả = ✓, một phần = －). Không có cột 「まとめて」 (dropdown) (hong 2026-10-06)."]},
    {"no": "5.2", "ja": "機能の行", "vi": "Hàng chức năng", "sel": ".tbl tbody tr:nth-child(2)", "kind": "area", "trig": "check",
     "detail": ["機能名（下に対象の画面名）／閲覧・作成・編集・削除・CSV取込・CSV出力のチェック／その他（機能ごとの操作）。操作を付けると閲覧も付く。閲覧を外すとその機能の操作はすべて外れる。「まとめて」の欄は置かない。", "Tên chức năng (bên dưới là tên màn hình liên quan) / tick xem・tạo・sửa・xóa・nhập CSV・xuất CSV / 「その他」 (thao tác riêng của chức năng). Gán thao tác thì tự gán cả xem. Bỏ xem thì mọi thao tác của chức năng bị bỏ. Không có cột 「まとめて」."]},
    {"no": "6", "ja": "保存時のエラー", "vi": "Lỗi khi lưu", "sel": "-", "kind": "toast", "trig": "view", "err": ["E262"],
     "detail": ["保存すると「権限付与」を編集できる運営アカウントが1人もいなくなるとき（自分のアカウントの権限を外すなど）は E262 を出して保存しない。", "Nếu lưu khiến không còn tài khoản vận hành nào sửa được 「権限付与」 (ví dụ bỏ quyền của chính mình) thì hiện E262 và không lưu."]},
    {"no": "7", "ja": "機能モジュール・権限設定マトリクス（全機能の列まとめ）", "vi": "Ma trận quyền theo module chức năng (tick cột cho toàn bộ)", "sel": "table[aria-label=\"機能モジュール・権限設定マトリクス\"]", "kind": "area", "trig": "check", "detail": ["系統のカードの上にある見出しの行。操作ごと（作成・閲覧・編集・削除・CSV取込・CSV出力）のチェックで、全系統の全機能にいっぺんに付ける・外す（全部あり＝✓、一部だけ＝－）。系統の見出し行にも同じチェックがあり、その系統の中だけに効く（hong 2026-10-06・参考画面）。", "Hàng tiêu đề nằm trên các thẻ nhóm. Tick từng cột thao tác (tạo・xem・sửa・xóa・nhập CSV・xuất CSV) để gán/bỏ cho toàn bộ chức năng của mọi nhóm cùng lúc (tất cả = ✓, một phần = －). Hàng tiêu đề của từng nhóm cũng có tick tương tự và chỉ có tác dụng trong nhóm đó (hong 2026-10-06, màn hình tham khảo)."]},
]

X_ITEMS = [
    {"no": "1", "ja": "削除の確認", "vi": "Xác nhận xóa", "sel": ".modal", "kind": "modal", "trig": "click", "pattern": "P-DEL", "err": ["Q01", "S02", "E30"],
     "detail": ["タイトル「削除」。「キャンセル」「削除する」。「削除する」で論理削除（状態＝削除済）して S02。一覧から外れ、検索条件で「削除済」にすると表示される。", "Tiêu đề 「削除」. 「キャンセル」「削除する」. 「削除する」 thì xóa logic (trạng thái = 削除済み) và hiện S02. Quyền biến mất khỏi danh sách, chọn 「削除済」 ở điều kiện tìm kiếm thì hiện lại."]},
]

N_ITEMS = [
    {"no": "1", "ja": "削除できない", "vi": "Không xóa được", "sel": ".ov .mbox", "kind": "modal", "trig": "click", "err": ["E261", "E262"],
     "detail": ["その権限を持つアカウントがあるとき E261（件数つき）。最後の「権限付与」の編集者になるときは E262。モーダルの「閉じる」で閉じる。", "Khi còn tài khoản đang có quyền này thì E261 (kèm số lượng). Khi quyền này khiến không còn ai sửa được 「権限付与」 thì E262. Đóng modal bằng 「閉じる」."]},
]


def V(id, code, ja, vi, url, items, setup="", note=None, full=True, wait=500, login=None):
    v = {"id": id, "code": code, "state": [ja, vi], "url": url, "setup": (H + setup) if setup else "", "full": full, "wait": wait, "note": note or ["", ""], "items": items}
    if login:
        v["login"] = login
    return v




# >>> review additions（役割レビューの指摘：0件・参照のみ・入力エラーの状態。2026-10-06）
I_006 = [
    {"no": "1", "ja": "0件の表示", "vi": "Hiển thị 0 bản ghi", "sel": ".tbl, .empty", "kind": "area", "trig": "view", "pattern": "P-LIST", "err": ["I01"], "detail": ["検索条件に合う権限がないとき、一覧の中に I01「表示するデータがありません。」を出す（P-LIST）。条件は「クリア」で戻せる。", "Khi không có quyền nào khớp điều kiện tìm kiếm, hiển thị I01「表示するデータがありません。」trong danh sách (P-LIST). Có thể khôi phục điều kiện bằng 「クリア」."]},
]
I_007 = [
    {"no": "1", "ja": "参照のみ（権限が閲覧だけの役割）", "vi": "Chỉ xem (vai trò chỉ có quyền xem)", "sel": ".ph", "kind": "area", "trig": "view", "cond": ["経理（権限付与は閲覧のみ）", "Kế toán (「経理」) (「権限付与」 chỉ được xem)"], "detail": ["経理（権限付与は閲覧のみ）。「権限登録」は出さない（権限表：権限付与は フル権限＝CRUD・ほかの6役割＝R）。", "Kế toán (「経理」) (「権限付与」 chỉ được xem). Không hiển thị 「権限登録」 (bảng quyền: 「権限付与」 do Toàn quyền = CRUD, 6 vai trò còn lại = R)."]},
    {"no": "2", "ja": "一覧の操作の列", "vi": "Cột thao tác của danh sách", "sel": ".tbl", "kind": "table", "trig": "view", "detail": ["行の鉛筆（編集）・ごみ箱（削除）は出さない。", "Không hiển thị biểu tượng bút chì (sửa) và thùng rác (xóa) ở từng dòng."]},
]
I_008 = [
    {"no": "1", "ja": "必須の入力エラー", "vi": "Lỗi nhập bắt buộc", "sel": "#role-name ~ .emsg, .emsg", "kind": "label", "trig": "view", "pattern": "P-FORM", "err": ["E01", "E260"], "detail": ["何も入れずに「登録」を押すと、「権限名」の下に E01 を出して赤枠にする（保存しない）。同じ名前の権限があれば E260。", "Nếu bấm 「登録」 khi chưa nhập gì, hiển thị E01 bên dưới 「権限名」 và tô viền đỏ (không lưu). Nếu đã có quyền trùng tên thì E260."]},
]
# <<< review additions

VIEWS = [
    V("001", "AW_PERM_001", "一覧（初期表示）", "Danh sách (ban đầu)", "/ops/accounts/permissions", L_ITEMS),
    V("002", "AW_PERM_002", "詳細", "Chi tiết", "/ops/accounts/permissions/ops.cs", D_ITEMS),
    V("003", "AW_PERM_003", "登録・編集", "Đăng ký / sửa", "/ops/accounts/permissions/ops.cs/edit", E_ITEMS),
    V("004", "AW_PERM_001", "削除の確認", "Xác nhận xóa", "/ops/accounts/permissions", X_ITEMS, setup="delIcon(1); await sleep(300);"),
    V("005", "AW_PERM_001", "削除できない（使用中）", "Không xóa được (đang dùng)", "/ops/accounts/permissions", N_ITEMS,
      setup="delIcon(1); await sleep(300); [...document.querySelectorAll('.modal button')].find(b=>(b.textContent||'').includes('削除'))?.click(); await sleep(400);"),
    V("006", "AW_PERM_001", "0件（検索結果なし）", "0 bản ghi (không có kết quả tìm kiếm)", "/ops/accounts/permissions", I_006, setup="const kw=document.querySelector('.es-search input'); if(kw){Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(kw,'zzzzzz'); kw.dispatchEvent(new Event('input',{bubbles:true})); await sleep(200); clickText('button','検索'); await sleep(600);}"),
    V("007", "AW_PERM_001", "参照のみ（閲覧の権限だけ）", "Chỉ xem (chỉ có quyền xem)", "/ops/accounts/permissions", I_007, login="Ad00012"),
    V("008", "AW_PERM_003", "入力エラー", "Lỗi nhập", "/ops/accounts/permissions/new", I_008, setup="clickText('.ph button','登録'); await sleep(500);"),
]
