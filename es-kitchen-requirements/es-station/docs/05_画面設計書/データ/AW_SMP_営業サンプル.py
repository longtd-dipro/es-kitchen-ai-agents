# -*- coding: utf-8 -*-
"""
画面設計書のデータ：運営管理者Web「営業サンプル」（AW_SMP）。ブック「運営管理者Web_メニュー・発注」（運営C2）。
元は本物の Web（app/ops/purchasing/samples）。決定は docs/決定台帳.md「運営C2 の画面の決まり」「営業サンプルの登録後に直せる内容」
「営業サンプルの取消」「営業サンプルの受付の締め」「運営C2 の操作と権限」、M-5、確認メモ_AW_運営C2 §9、F「運営C2 の画面の作り」「営業サンプルの発注への反映」（2026-10-08）。
2026-10-08（hong の回答・受付簿 #337）：詳細画面 AW_SMP_003 を作る（一覧の列は 受付日・宛先・商品・納品日・発送日・状態・操作 に絞る）。一覧は2タブ（サンプル一覧／出荷週の受付）。発注への反映は C1（この画面には出さない）。
2026-10-08：配送ルートは登録のたびに「ピッキング倉庫・配送会社・中継先」を都度入れる（既存ルートは選ばせない）。送り状番号は登録後に「メモ・送り状番号」のモーダルで入れる（台帳 F「営業サンプルのルート入力・送り状番号」）。
2026-10-08（運営C2）：宛先の送付履歴のモーダルは作らない（同じ宛先は登録画面の警告 W121 だけ・止めない）。配送会社は委託配送先マスタ・中継先は倉庫マスタの中継先から選ぶ。メモ・送り状番号の変更は変更履歴に残し、モーダルの下に表で出す。
2026-10-08（運営C2・受付簿 #335）：締めの取消を作る（その出荷週の最初の発送日の前日まで。取り消すと出荷指示は取消・変更行のCSVを出して再登録）。営業サンプルの配送データは出荷指示と同時（受付を締めたとき）に作る（見え方は運営D で確認）。登録画面で選んだ商品の数量を一括変更できる。
2026-10-08（運営C2・受付簿 #448・#449）：締め後追加のサンプルも取り消せる。取消の期限は各サンプルの発送日の前日 23:59（日本時間）、締めの取消は週の最初の発送日の前日 23:59（日本時間）。手動で締めを取り消した週は自動で締めない。出荷指示は締めてから見込み在庫を引く。枠を超える登録は止める（E149）。倉庫が分かれるサンプルは2回登録（倉庫を変えると扱わない商品の選択は外れ、数量は残す）。発注に出す枠の数は「実際の登録数量（受付済）＋枠の残り件数×2」。
コードとの違い（demo_ok）：取消・自動締め・出荷指示CSV・並び（受付日時の降順）・取消の表示・住所の自動入力・
メモの複数行 500（登録画面）・文字数と電話・郵便番号のチェック・納品日の上限・枠超過などのメッセージ（ID）・デモ専用の説明（決定の根拠の帯など）。
"""


def T(ja):
    return [ja, ""]


def X(v):
    return [v, ""]


TITLE = ["営業サンプル（AW_SMP）", "Mẫu kinh doanh (AW_SMP)"]
SHEET = ["営業サンプル", "Mẫu kinh doanh"]
BASENAME = "画面設計書_AW_SMP_営業サンプル"
IMG_PREFIX = "AW_SMP"
OUT_DIR = "AW_SMP_営業サンプル"
CODE_NOTE = ["画面コード規約：AW＝Admin Web、SMP＝営業サンプル（Sample）。001＝一覧・002＝登録・003＝詳細", "Quy ước mã màn hình: AW = Admin Web, SMP = Sample. 001 = danh sách・002 = đăng ký・003 = chi tiết"]
SITE = "ops"
SYSTEM = {"ja": "運営管理者Web", "vi": "Web quản trị vận hành"}
AUTHOR = "Claude（cloud）／確認：hong"
CREATED = "2026-10-07"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "ops", "loginId": "Ad00010"}
CODE_PATHS = ["app/ops/purchasing/samples", "app/ops/purchasing/_components", "lib/ops/purchasing", "lib/domain/seed", "lib/domain/areas/sample.ts"]

DECISIONS = [
    {"date": "2026-10-07", "target": "AW_SMP_001 No.5.13・8", "q": ["登録後に直せる内容（Q-S3）", "Nội dung sửa được sau khi đăng ký (Q-S3)"],
     "a": ["メモだけ直せる（複数行500文字・受付済／締め済／締め後追加のどれでも可・変更履歴に残す）。一覧の行の「メモ」ボタン→モーダル（詳細画面は 2026-10-08 に作ることに変更：AW_SMP_003）。宛先・商品・納品日などは直せない（誤りは取消して登録し直す）", "Chỉ sửa được ghi chú (nhiều dòng, tối đa 500 ký tự; sửa được ở mọi trạng thái 受付済/締め済/締め後追加; lưu vào lịch sử thay đổi). Nút 「メモ」 ở dòng danh sách → modal (màn chi tiết được đổi thành có làm ngày 2026-10-08: AW_SMP_003). Không sửa được địa chỉ nhận, sản phẩm, ngày giao... (nếu sai thì hủy rồi đăng ký lại)"],
     "src": "hong 回答 2026-10-07"},
    {"date": "2026-10-07", "target": "AW_SMP_001 No.5.14・9", "q": ["登録した営業サンプルの取消（Q-S4）", "Hủy mẫu kinh doanh đã đăng ký (Q-S4)"],
     "a": ["受付済はすぐ取消せる。締め済と締め後追加も、そのサンプルの発送日の前日 23:59（日本時間）まで取消せる（締め済は画面に「出荷指示は作成済みです。THOMAS へ変更行のCSVを出力して再登録してください」を出す。2026-10-08 に締め後追加も取消せると確定）。発送日以降は取消せない（E151）。理由は必須。状態「取消」は枠に数えず、一覧は既定で出さない。編集は作らない", "受付済 hủy được ngay. 締め済 và 締め後追加 cũng hủy được đến 23:59 (giờ Nhật Bản) ngày trước ngày gửi của chính mẫu đó (締め済: màn hình hiện 「出荷指示は作成済みです。THOMAS へ変更行のCSVを出力して再登録してください」; ngày 2026-10-08 chốt là 締め後追加 cũng hủy được). Từ ngày gửi trở đi không hủy được (E151). Bắt buộc nhập lý do. Trạng thái 「取消」 không tính vào hạn mức, danh sách mặc định không hiển thị. Không làm chức năng sửa"],
     "src": "hong 回答 2026-10-07"},
    {"date": "2026-10-07", "target": "AW_SMP_001 No.7", "q": ["受付の締めの自動化（Q-S5）", "Tự động hóa việc chốt tiếp nhận (Q-S5)"],
     "a": ["自動と手動の両方。出荷週の月曜の2営業日前に自動で締める（N＝2は仮・運営Iの設定で変える）。「受付を締める」で早く締められる（締めの取り消しは 2026-10-08 の行で作ることに変更）。手動で締めを取り消した週は、自動で締めない（2026-10-08）。運営TOPに「出荷週の受付が未締めのサンプル n件」の警告。自動で締めたときも出荷指示を作り、THOMAS用CSVを出す（一覧から再ダウンロードできる）", "Cả tự động và thủ công. Tự động chốt trước thứ Hai của tuần gửi 2 ngày làm việc (N=2 là tạm, đổi ở cài đặt Vận hành I). Bấm 「受付を締める」 để chốt sớm (việc hủy chốt được làm theo dòng 2026-10-08). Tuần đã được hủy chốt thủ công thì không tự động chốt nữa (2026-10-08). Trang TOP vận hành có cảnh báo 「Có n mẫu của tuần gửi chưa chốt tiếp nhận」. Khi tự động chốt cũng tạo chỉ thị xuất hàng và xuất CSV cho THOMAS (có thể tải lại từ danh sách)"],
     "src": "hong 回答 2026-10-07"},
    {"date": "2026-10-07", "target": "AW_SMP_001・002 全体", "q": ["運営C2 の画面の決まり（確認メモ §2-2 の20件）", "Quy ước màn hình Vận hành C2 (20 mục ở Ghi chú xác nhận §2-2)"],
     "a": ["デモ専用の説明・「仮置き」を外す。ID＝SM-YYMM-NNN（枝番は付けない。2026-10-08 に変更）・出荷指示 SS-…。数量1〜9個・枠は宛先1か所＝1件。初期の並び＝受付日時の降順。枠が未設定の月は警告して登録できる。納品日＝今日〜配送サイクルのある最後の日。郵便番号から住所を自動入力。ページ送り10件。発注への反映は C1", "Bỏ phần giải thích chỉ dành cho demo và 「仮置き」. ID = SM-YYMM-NNN (không có số nhánh; đổi ngày 2026-10-08), chỉ thị xuất hàng SS-…. Số lượng 1〜9 cái, hạn mức: 1 địa chỉ nhận = 1 mẫu. Thứ tự ban đầu = ngày giờ tiếp nhận giảm dần. Tháng chưa đặt hạn mức thì cảnh báo nhưng vẫn đăng ký được. Ngày giao = từ hôm nay đến ngày cuối cùng có chu kỳ giao hàng. Tự động điền địa chỉ từ mã bưu điện. Phân trang 10 dòng. Phản ánh vào đặt hàng do C1"],
     "src": "hong 回答 2026-10-07"},
    {"date": "2026-10-07", "target": "AW_SMP_001・002 ボタン", "q": ["操作と権限（Q-C4）", "Thao tác và quyền (Q-C4)"],
     "a": ["登録＝作成（営業・フル権限）。受付を締める・取消＝機能ごとの操作（商品管理 R/U も可）。CSV出力は閲覧できる全役割（1行＝1商品）", "Đăng ký = quyền tạo (kinh doanh・toàn quyền). Chốt tiếp nhận・hủy = thao tác theo chức năng (quản lý sản phẩm R/U cũng được). Xuất CSV: mọi vai trò xem được (1 dòng = 1 sản phẩm)"],
     "src": "hong 回答 2026-10-07"},
    {"date": "2026-10-08", "target": "AW_SMP_002 No.5.2・5.3・5.4・5.5・5.6", "q": ["営業サンプルのリードタイム（O1）", "Lead time của mẫu kinh doanh (O1)"],
     "a": ["リードタイムは倉庫ごとではなく、宛先（受け取る会社の住所）ごとに毎回違う。登録のたびに運営が「リードタイム（日）」を手で入れる（必須・整数0〜30・1回の登録で1つ）。発送日＝納品日−リードタイム。システムの自動の提案はしない。同じ宛先への前回のリードタイムを参考に出す。倉庫ごとの値は持たない（受付簿 #322）", "Lead time không theo kho mà khác nhau theo từng địa chỉ nhận (địa chỉ công ty nhận hàng), mỗi lần có thể khác. Mỗi lần đăng ký, vận hành nhập tay 「リードタイム（日）」 (bắt buộc・số nguyên 0〜30・1 giá trị cho mỗi lần đăng ký). Ngày gửi = ngày giao − lead time. Hệ thống KHÔNG tự gợi ý. Hiện lead time của lần gửi trước tới cùng địa chỉ để tham khảo. Không giữ giá trị theo từng kho (Sổ tiếp nhận #322)"],
     "src": "hong 回答 2026-10-08"},
    {"date": "2026-10-08", "target": "AW_SMP_002 No.5.6・AW_SMP_001 No.5.11・2.2", "q": ["運営C2 の細かい点（O2・O3 ほか）", "Các điểm chi tiết Vận hành C2 (O2・O3 v.v.)"],
     "a": ["ピッキングできない日は、関西・中部も当面は関東と同じとして扱い、リリース後にデータで調整する（確認待ちの問いではなくなった）。出荷指示のCSVは配送の出荷指示CSVの形を使う（THOMAS ベンダー確認待ちの問いはなくなった）。数量は1〜9個のまま。営業サンプルの「枠が未設定の月」を作れるよう、見本データに枠のない月を作る（受付簿 #320）", "Ngày không picking được: kho Kansai・Chubu tạm coi như Kanto, điều chỉnh bằng dữ liệu sau khi release (không còn là câu hỏi chờ xác nhận). CSV chỉ thị xuất hàng dùng định dạng CSV chỉ thị xuất hàng hiện có của giao hàng (không còn câu hỏi chờ nhà cung cấp THOMAS). Số lượng vẫn 1〜9 cái. Để chụp được trạng thái 「tháng chưa đặt hạn mức」, tạo tháng không có hạn mức trong dữ liệu mẫu (Sổ tiếp nhận #320)"],
     "src": "hong 回答 2026-10-08"},
    {"date": "2026-10-08", "target": "AW_SMP_001 No.2・3・7（タブ）／No.5 ほか", "q": ["運営C2 の画面の作り（営業サンプルの一覧）", "Cách làm màn hình Vận hành C2 (danh sách mẫu kinh doanh)"],
     "a": ["一覧をタブで分ける：「サンプル一覧」（初期表示・検索＋10件の表）／「出荷週の受付」（出荷週ごとの表・受付を締める・自動で締める案内・余りを在庫へ戻す）。枠の4つの数字は両タブの上に共通。タブは URL の ?tab=。「仮置きの前提（確認待ち）」のカードは画面から外す（決定済みの内容は登録画面の項目説明へ）。台帳 F「運営C2 の画面の作り」・受付簿 #325", "Chia danh sách thành tab: 「サンプル一覧」 (mặc định・tìm kiếm + bảng 10 dòng) / 「出荷週の受付」 (bảng theo tuần gửi・chốt tiếp nhận・giải thích tự động chốt・trả hàng dư về kho). 4 con số hạn mức dùng chung phía trên cả hai tab. Tab giữ trong URL ?tab=. Bỏ thẻ 「仮置きの前提（確認待ち）」 khỏi màn hình (nội dung đã quyết chuyển vào mô tả mục của màn đăng ký). Sổ cái F 「運営C2 の画面の作り」・Sổ tiếp nhận #325"],
     "src": "hong 回答 2026-10-08"},
    {"date": "2026-10-08", "target": "AW_SMP_001（発注への反映は出さない）", "q": ["営業サンプルの発注への反映（運営C2→C1）", "Phản ánh mẫu kinh doanh vào đặt hàng (Vận hành C2→C1)"],
     "a": ["締め前の発注は、対象商品ごとに「実際に登録された数量（受付済）＋枠の残り件数×2個」で出す（2026-10-08 の hong 確認で、以前の「枠の件数〔上限〕までの数」を置き換え）。発注に出る月はその枠を決めたメニューの月。締め後に増えた分は次回に決める。週への割り振り・短消費期限は C1 で決める。この画面には「発注への反映」の項目を出さない。台帳 F「営業サンプルの発注への反映」・受付簿 #326", "Trước khi chốt, đặt hàng tính cho từng sản phẩm đối tượng = 「số lượng thực tế đã đăng ký (受付済) + số mẫu còn lại của hạn mức × 2 cái」 (xác nhận hong 2026-10-08, thay cách cũ 「theo số mẫu tối đa của hạn mức」). Tháng hiện trong đặt hàng là tháng của menu đã đặt hạn mức đó. Phần tăng thêm sau khi chốt sẽ quyết lần sau. Phân bổ theo tuần・hạn sử dụng ngắn do C1 quyết. Màn hình này không hiển thị mục 「発注への反映」. Sổ cái F 「営業サンプルの発注への反映」・Sổ tiếp nhận #326"],
     "src": "hong 回答 2026-10-08"},
    {"date": "2026-10-08", "target": "AW_SMP_002 No.3.10〜3.13・4.1・4.4・5.5・1.2／AW_SMP_001 No.5・5.1・7.2", "q": ["営業サンプルの配送ルート（運営C2）", "Tuyến giao hàng của mẫu kinh doanh (Vận hành C2)"],
     "a": ["ピッキング倉庫は商品ごとではなく、お客様（宛先）ごと。1回の登録で配送ルートを1つ指定する（ピッキング倉庫・配送会社・中継先［任意］。ルートは都度指定できる可変の構造）。登録全体のピッキング倉庫はルートから決まり、その倉庫が扱わない商品（取扱倉庫に入っていない商品）は選べない（非活性にして理由を出す）。倉庫が分かれる出荷（枝番 -1・-2）は作らない（ID＝SM-YYMM-NNN のみ・出荷指示は1倉庫）。リードタイムの手入力（0〜30日）・発送日＝納品日−リードタイム・前倒しの決まりは変わらない。ルートの入力のしかたは次の行（登録のたびに都度入れる）で決まった。台帳 F 2026-10-08・受付簿 #329", "Kho picking không theo sản phẩm mà theo khách nhận (địa chỉ nhận). Mỗi lần đăng ký chỉ định 1 tuyến giao hàng (kho picking・công ty vận chuyển・điểm trung chuyển [tùy chọn]; tuyến là cấu trúc linh hoạt, chỉ định mỗi lần). Kho picking của cả lần đăng ký lấy từ tuyến; sản phẩm mà kho đó không xử lý (không có trong kho xử lý) thì không chọn được (vô hiệu hóa kèm lý do). KHÔNG tách chuyến theo kho (không có số nhánh -1/-2: ID chỉ là SM-YYMM-NNN, chỉ thị xuất hàng theo 1 kho). Giữ nguyên: nhập tay lead time (0〜30 ngày), ngày gửi = ngày giao − lead time, luật dời sớm. Cách nhập tuyến đã được quyết ở dòng tiếp theo (nhập từng lần đăng ký). Sổ cái F 2026-10-08・Sổ tiếp nhận #329"],
     "src": "hong 回答 2026-10-08（チャット Q4）"},
    {"date": "2026-10-08", "target": "AW_SMP_002 No.3.10〜3.13／AW_SMP_001 No.1.1・5.9.1・5.9.2・5.12・5.13・8", "q": ["営業サンプルのルート入力・送り状番号（運営C2）", "Nhập tuyến và số vận đơn của mẫu kinh doanh (Vận hành C2)"],
     "a": ["配送ルートは登録のたびに「ピッキング倉庫・配送会社・中継先」を都度入れる（既存のルートを選ぶ形にはしない）。ピッキング倉庫は倉庫マスタの有効なピッキング倉庫から選び、配送会社・中継先は文字で入れる（60文字まで）。送り状番号の入力欄をサンプルに持つ。出荷後に分かるので、登録後に直せるのは「メモ」と「送り状番号」（一覧の行の「メモ・送り状番号」→モーダル。台帳 F 2026-10-07「メモだけ」を広げる）。送り状番号は任意・半角英数字とハイフン・30文字まで。一覧とCSV出力にも出す。台帳 F 2026-10-08・受付簿 #331", "Tuyến giao hàng nhập tay mỗi lần đăng ký: 「kho picking・công ty vận chuyển・điểm trung chuyển」 (không cho chọn tuyến có sẵn). Kho picking chọn từ kho picking đang hiệu lực trong master kho; công ty vận chuyển và điểm trung chuyển nhập bằng chữ (tối đa 60 ký tự). Mẫu có ô số vận đơn (送り状番号). Vì chỉ biết sau khi xuất hàng nên sau khi đăng ký sửa được 「ghi chú」 và 「số vận đơn」 (nút 「メモ・送り状番号」 ở dòng danh sách → modal; mở rộng quyết định Sổ cái F 2026-10-07 「chỉ ghi chú」). Số vận đơn: tùy chọn・chữ số/chữ cái nửa chiều rộng và gạch nối・tối đa 30 ký tự. Hiện cả ở danh sách và CSV出力. Sổ cái F 2026-10-08・Sổ tiếp nhận #331"],
     "src": "hong 回答 2026-10-08（チャット）"},
    {"date": "2026-10-08", "target": "AW_SMP_001 No.5.3・（宛先の送付履歴のモーダルを削除）／AW_SMP_002 No.3.9・3.10・3.12・3.13・7.5", "q": ["営業サンプルの宛先履歴・重複・配送データ・ルートの選択（運営C2）", "Lịch sử địa chỉ・trùng・dữ liệu giao hàng・chọn tuyến của mẫu kinh doanh (Vận hành C2)"],
     "a": ["一覧の「宛先の送付履歴」のモーダルは作らない（2026-10-01 承認の履歴モーダルを置き換え。法人名は文字だけで、押しても開かない）。同じ宛先（法人名＋住所）に過去の送付があるときは、登録画面で警告を出すだけ（W121。止めない＝マーケティングのキャンペーンなどで続けて送ることがあるため）。営業サンプルでも配送データを作る（作る時期・見え方は要確認＝AW_SMP_001 No.7.5 の open）。配送会社と中継先は文字入力ではなくマスタから選ぶ（配送会社＝委託配送先マスタ、中継先＝倉庫マスタの中継先）。台帳 F 2026-10-08・受付簿 #333", "KHÔNG làm modal 「Lịch sử gửi tới địa chỉ」 ở danh sách (thay thế modal lịch sử đã duyệt 2026-10-01; tên công ty chỉ hiện chữ, bấm không mở gì). Khi đã từng gửi tới cùng địa chỉ (tên công ty + địa chỉ) thì chỉ hiện cảnh báo ở màn đăng ký (W121; KHÔNG chặn vì có thể gửi liên tiếp, ví dụ chiến dịch marketing). Mẫu kinh doanh cũng tạo dữ liệu giao hàng (thời điểm tạo・cách hiển thị cần xác nhận = open ở AW_SMP_001 No.7.5). Công ty vận chuyển và điểm trung chuyển chọn từ master thay vì nhập chữ (công ty vận chuyển = master công ty vận chuyển ủy thác, điểm trung chuyển = kho loại trung chuyển trong master kho). Sổ cái F 2026-10-08・Sổ tiếp nhận #333"],
     "src": "hong 回答 2026-10-08（チャット）"},
    {"date": "2026-10-08", "target": "AW_SMP_001 No.5.13・8（メモ・送り状番号のモーダル）", "q": ["サンプルの変更履歴（運営C2）", "Lịch sử thay đổi của mẫu kinh doanh (Vận hành C2)"],
     "a": ["営業サンプルのメモ・送り状番号の変更は変更履歴に残す（日時・変更した人・項目・変更前→後）。モーダルの下に表で出す（最新が上）。台帳 F 2026-10-08・受付簿 #334", "Thay đổi ghi chú・số vận đơn của mẫu kinh doanh được lưu vào lịch sử thay đổi (ngày giờ・người sửa・mục・trước → sau). Hiện dưới dạng bảng dưới modal (mới nhất ở trên). Sổ cái F 2026-10-08・Sổ tiếp nhận #334"],
     "src": "hong 回答 2026-10-08（チャット）"},
    {"date": "2026-10-08", "target": "AW_SMP_001 No.7.5・7.8〜7.10・11／AW_SMP_002 No.4.5・4.6", "q": ["営業サンプルの締めの取消・配送データ・数量の一括変更（運営C2）", "Hủy chốt, dữ liệu giao hàng và đổi số lượng hàng loạt của mẫu kinh doanh (Vận hành C2)"],
     "a": ["締めの取消ができる：その出荷週の最初の発送日の前日まで。取り消すと、その週の出荷指示は取消になり、画面に「変更行の CSV を出して再登録してください」と出す（台帳 L の出荷指示後の変更と同じ方法）。それ以降は取り消せない（ボタンを出さず、理由を表に書く。「前日まで」は前日 23:59〔日本時間〕。2026-10-08 に明確化）。営業サンプルの配送データは、出荷指示と同時（受付を締めたとき）に作る（種類「サンプル」・入れたルートつき）。運営D の出荷・配送管理と委託配送先Web での見え方は運営D の確認で決める。サンプル登録の商品の数量は、選んだ商品をまとめて一括で変更できる。数量の初期値は各2個。枠1件の発注への数え方は各2個。発注に出す数は「実際の登録数量（受付済）＋枠の残り件数×2個」（2026-10-08 に確定。台帳 S・受付簿 #448）。台帳 F 2026-10-08・受付簿 #335", "Có thể hủy chốt: đến trước ngày gửi đầu tiên của tuần gửi đó. Khi hủy, chỉ thị xuất hàng của tuần đó bị hủy và màn hình hiện 「Hãy xuất CSV dòng thay đổi và đăng ký lại」 (cùng cách với thay đổi sau chỉ thị xuất hàng ở Sổ cái L). Sau thời hạn thì không hủy được (không hiện nút, ghi lý do trong bảng; 「đến trước ngày」 là đến 23:59 giờ Nhật Bản của ngày trước đó, làm rõ ngày 2026-10-08). Dữ liệu giao hàng (配送データ) của mẫu kinh doanh được tạo cùng lúc với chỉ thị xuất hàng (khi chốt tiếp nhận) (loại 「サンプル」, kèm tuyến đã nhập). Cách hiển thị ở Vận hành D 出荷・配送管理 và Web công ty vận chuyển ủy thác sẽ quyết ở xác nhận của Vận hành D. Số lượng sản phẩm ở màn đăng ký đổi hàng loạt được cho các sản phẩm đã chọn. Số lượng ban đầu mỗi sản phẩm là 2 cái. Cách tính vào đặt hàng cho 1 mẫu: mỗi sản phẩm 2 cái. Số đưa vào đặt hàng = 「số lượng thực tế đã đăng ký (受付済) + số mẫu còn lại của hạn mức × 2 cái」 (chốt ngày 2026-10-08; sổ cái R・sổ tiếp nhận #448). Sổ cái F 2026-10-08・Sổ tiếp nhận #335"],
     "src": "hong 回答 2026-10-08（チャット）"},
    {"date": "2026-10-08", "target": "AW_SMP_003 全体／AW_SMP_001 No.5・5.1・5.4〜5.13", "q": ["営業サンプルの詳細（閲覧）画面を足す（運営C2）", "Thêm màn hình chi tiết (xem) mẫu kinh doanh (Vận hành C2)"],
     "a": ["営業サンプルの詳細（AW_SMP_003）を作る（2026-10-07 の「詳細画面は作らない」を置き換え）。宛先・商品と数量・ルート・リードタイム・納品日と発送日・状態・登録者・出荷指示・配送データ・送り状番号・メモ・変更履歴を1画面で見る。「メモ・送り状番号を編集」「取消」はここにも置く。一覧の列は 受付日・宛先・商品・納品日・発送日・状態・操作 に絞り（サンプルNo は詳細を開くリンク）、残りは詳細で見る。CSV出力は全項目のまま。台帳 F「詳細（閲覧）画面を足す」・受付簿 #337", "Làm màn chi tiết mẫu kinh doanh (AW_SMP_003) (thay quyết định 「không làm màn chi tiết」 ngày 2026-10-07). Xem trong 1 màn: địa chỉ nhận・sản phẩm và số lượng・tuyến giao hàng・lead time・ngày giao và ngày gửi・trạng thái・người đăng ký・chỉ thị xuất hàng・dữ liệu giao hàng・số vận đơn・ghi chú・lịch sử thay đổi. Nút 「メモ・送り状番号を編集」 và 「取消」 cũng đặt ở đây. Cột danh sách rút gọn còn Ngày tiếp nhận・Địa chỉ nhận・Sản phẩm・Ngày giao・Ngày gửi・Trạng thái・Thao tác (Số mẫu là link mở chi tiết), phần còn lại xem ở chi tiết. CSV出力 vẫn đủ cột. Sổ cái F 「詳細（閲覧）画面を足す」・Sổ tiếp nhận #337"],
     "src": "hong 回答 2026-10-08（チャット「詳細（view）画面が要る」）"},
    {"date": "2026-10-08", "target": "AW_SMP_001 No.5.14・7.7〜7.9・9・11・11.2、AW_SMP_003 No.1.3", "q": ["営業サンプルの取消・締めの取消の細かい点（運営C2・確認表 C2-6）", "Chi tiết hủy mẫu và hủy chốt của mẫu kinh doanh (Vận hành C2・bảng xác nhận C2-6)"],
     "a": ["①締めの後に追加したサンプル（締め後追加）も取り消せる ②手動で締めを取り消したあと、その週は自動締めが再び動かない（運営が「受付を締める」で手で締め直す） ③「前日まで」は前日 23:59（日本時間）。サンプルの取消は各サンプルの発送日の前日 23:59、締めの取消はその週の最初の発送日の前日 23:59", "① Mẫu thêm sau khi chốt (締め後追加) cũng hủy được. ② Sau khi hủy chốt thủ công, tuần đó không còn tự động chốt lại (vận hành chốt lại thủ công bằng 「受付を締める」). ③ 「Đến trước ngày」 là đến 23:59 (giờ Nhật Bản) của ngày trước đó. Hủy mẫu tính theo ngày gửi của từng mẫu; hủy chốt tính theo ngày gửi đầu tiên của tuần"],
     "src": "hong 回答 2026-10-08（確認表 C2-6）・台帳 S「営業サンプルの取消・締めの取消」・受付簿 #449"},
    {"date": "2026-10-08", "target": "AW_SMP_001 No.7・7.5・10.2", "q": ["サンプルの出荷指示は見込み在庫からいつ引くか（運営C2・確認表 C2-3）", "Khi nào trừ chỉ thị xuất hàng của mẫu khỏi tồn kho dự kiến (Vận hành C2・bảng xác nhận C2-3)"],
     "a": ["受付を締めて出荷指示ができてから、倉庫在庫の見込み在庫（出荷予定）から引く。締める前の受付済は引かない。締めを取り消して出荷指示が取り消されれば引かない（倉庫在庫 AW_WHS_001 No.5.8 に反映）", "Chỉ trừ khỏi tồn kho dự kiến của kho (dự kiến xuất) sau khi chốt tiếp nhận và đã có chỉ thị xuất hàng. Mẫu 受付済 trước khi chốt thì không trừ. Nếu hủy chốt làm chỉ thị xuất hàng bị hủy thì không trừ (phản ánh ở tồn kho kho AW_WHS_001 No.5.8)"],
     "src": "hong 回答 2026-10-08（確認表 C2-3）・台帳 S「運営C2 の細部」・受付簿 #448"},
    {"date": "2026-10-08", "target": "AW_SMP_002 No.1.2・6", "q": ["枠を超える登録を止めるか（運営C2・確認表 C2-4）", "Có chặn đăng ký vượt hạn mức không (Vận hành C2・bảng xác nhận C2-4)"],
     "a": ["止める（E149。「登録」ボタンを非活性にし、ページ上部のメッセージエリアに出す）。Message List とデモ（2026-10-01 確定）にあった決まりを、hong が 2026-10-08 に確認した（台帳に行はない）。別の倉庫の商品を2回に分けて登録するときは、2回とも枠に数える", "Chặn (E149; vô hiệu hóa nút 「登録」 và hiện ở vùng thông báo đầu trang). Quy định đã có trong Message List và demo (chốt 2026-10-01) được hong xác nhận ngày 2026-10-08 (sổ cái không có dòng riêng). Khi chia sản phẩm của kho khác thành 2 lần đăng ký thì cả 2 lần đều tính vào hạn mức"],
     "src": "hong 確認 2026-10-08（確認表 C2-4）・受付簿 #448（台帳に確認の行はない）"},
    {"date": "2026-10-08", "target": "AW_SMP_002 No.3.11・4・4.1・4.2", "q": ["倉庫が分かれるサンプルの扱い（運営C2・確認表 C2-5）", "Cách xử lý mẫu bị chia kho (Vận hành C2・bảng xác nhận C2-5)"],
     "a": ["2回登録のまま（倉庫が分かれる出荷・枝番は作らない）。ルートの倉庫が扱わない商品は選べないので、別の倉庫の商品は、もう1回登録する（枠は2件・同じ宛先への2回目に W121 の警告）。倉庫を変えたときは、新しい倉庫が扱わない商品の選択は外れ、数量は残す", "Vẫn là đăng ký 2 lần (không tạo chuyến chia kho・số nhánh). Sản phẩm mà kho của tuyến không xử lý thì không chọn được, nên sản phẩm của kho khác thì đăng ký thêm 1 lần nữa (hạn mức tính 2 mẫu・lần thứ 2 tới cùng địa chỉ có cảnh báo W121). Khi đổi kho, lựa chọn của sản phẩm mà kho mới không xử lý bị bỏ chọn, số lượng vẫn giữ"],
     "src": "hong 回答 2026-10-08（確認表 C2-5）・台帳 S「運営C2 の細部」・受付簿 #448"},
    {"date": "2026-10-08", "target": "（この画面には出さない。発注 AW_PURC・月間メニュー AW_MENU に関わる）", "q": ["発注に出す営業サンプルの数（運営C2・確認表 C2-2）", "Số mẫu kinh doanh đưa vào đặt hàng (Vận hành C2・bảng xác nhận C2-2)"],
     "a": ["対象商品ごとに「実際に登録された数量（受付済）＋枠の残り件数×2個」。以前の「枠1件＝各2個で枠の件数（上限）まで」を置き換え。この画面には「発注への反映」の項目を出さない（数の計算は発注 AW_PURC・月間メニュー AW_MENU の設計書が正）", "Cho từng sản phẩm đối tượng: 「số lượng thực tế đã đăng ký (受付済) + số mẫu còn lại của hạn mức × 2 cái」. Thay cách cũ 「1 mẫu của hạn mức = mỗi sản phẩm 2 cái, tính đến số mẫu tối đa」. Màn hình này không hiển thị mục 「発注への反映」 (cách tính số theo tài liệu thiết kế đặt hàng AW_PURC・menu tháng AW_MENU)"],
     "src": "hong 回答 2026-10-08（確認表 C2-2）・台帳 S「運営C2 の細部」・受付簿 #448"},
]
CHANGES = []
HIDE_ALWAYS = []
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [
    {"code": "AW_SMP_001", "ja": "営業サンプル一覧", "vi": "Danh sách mẫu kinh doanh"},
    {"code": "AW_SMP_002", "ja": "サンプル登録", "vi": "Đăng ký mẫu"},
    {"code": "AW_SMP_003", "ja": "サンプル詳細", "vi": "Chi tiết mẫu"},
]

H = (
    "const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));"
    "const setv=(el,v)=>{if(!el)return;const p=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;"
    "Object.getOwnPropertyDescriptor(p,'value').set.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}));};"
    "const setsel=(el,v)=>{if(!el)return;Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(el,v);el.dispatchEvent(new Event('change',{bubbles:true}));};"
    "const btn=(t,root)=>[...(root||document).querySelectorAll('button')].find(b=>(b.textContent||'').trim().includes(t));"
    "const q=(s)=>document.querySelector(s);"
    # 日付の入力欄は、文字を入れて確定（フォーカスを外す）
    "const setd=async(id,v)=>{const el=q(id);if(!el)return;el.focus();setv(el,v);el.blur();await sleep(250);};"
    "const addr=async(o)=>{o=o||{};setv(q('#sm-company'),o.company||'株式会社テスト食品');setv(q('#sm-pic'),'山田 太郎');setv(q('#sm-tel'),'03-1234-5678');"
    "setv(q('#sm-zip'),o.zip||'105-0011');setsel(q('#sm-pref'),o.pref||'東京都');setv(q('#sm-city'),o.city||'港区');setv(q('#sm-town'),o.town||'芝公園1-2-3');"
    "if(o.bld)setv(q('#sm-bld'),o.bld);await sleep(250);};"
)
MODAL = ".ov .modal, .ov .mbox"

# ---------------------------------------------------------------- 一覧（AW_SMP_001）

L_HEAD = [
    {"no": "1", "ja": "ヘッダー", "vi": "Đầu trang", "sel": ".ph", "kind": "area", "trig": "view",
     "detail": ["パンくず：発注・入荷 ＞ 営業サンプル。営業の依頼で運営が宛先を登録し、出荷週ごとに受け付けて THOMAS へ出荷指示を出す。詳細は サンプルNo を押して開く（AW_SMP_003）。メモ・送り状番号の編集は一覧の行のモーダルからもできる。月の枠は メニュー管理 ＞ 月間メニューで設定する（運営B）。", "Breadcrumb: Đặt hàng・Nhập hàng ＞ Mẫu kinh doanh. Theo yêu cầu của kinh doanh, vận hành đăng ký địa chỉ nhận, tiếp nhận theo từng tuần gửi và ra chỉ thị xuất hàng cho THOMAS. Mở chi tiết bằng cách bấm Số mẫu (AW_SMP_003). Cũng có thể sửa ghi chú・số vận đơn bằng modal ở dòng danh sách. Hạn mức tháng đặt ở Quản lý menu ＞ Menu tháng (Vận hành B)."],
     "demo_ok": ["コードに「決定の根拠」の帯（Basis）が出る。デモ専用の説明は外す（確認メモ Q-C3）", "Code đang hiện thanh 「Căn cứ quyết định」 (Basis). Bỏ phần giải thích chỉ dành cho demo (Ghi chú xác nhận Q-C3)"]},
    {"no": "1.1", "ja": "CSV出力", "vi": "Xuất CSV", "sel": ".ph .btns button::CSV出力", "kind": "button", "trig": "click", "pattern": "P-CSV-OUT",
     "detail": ["ヘッダーの右。閲覧できる全役割に出す。1行＝サンプルの1商品（サンプルの項目を商品の数だけ繰り返す）。列：サンプルNo・受付日・法人名・郵便番号・住所・担当者名・電話番号・品番・商品・数量・納品日・発送日・倉庫・配送会社・中継先・送り状番号・リードタイム（日）・出荷週・状態・出荷指示・前倒しの理由・メモ・登録者。検索条件のとおりの全件（取消を表示しているときは取消も出す）。", "Bên phải đầu trang. Hiện cho mọi vai trò xem được. 1 dòng = 1 sản phẩm của mẫu (lặp các mục của mẫu theo số sản phẩm). Cột: Số mẫu・Ngày tiếp nhận・Tên công ty・Mã bưu điện・Địa chỉ・Người phụ trách・Số điện thoại・Mã hàng・Sản phẩm・Số lượng・Ngày giao・Ngày gửi・Kho・Công ty vận chuyển・Điểm trung chuyển・Số vận đơn・Lead time (ngày)・Tuần gửi・Trạng thái・Chỉ thị xuất hàng・Lý do dời sớm・Ghi chú・Người đăng ký. Toàn bộ kết quả theo điều kiện tìm kiếm (khi đang hiển thị mẫu hủy thì xuất cả mẫu hủy)."],
     "demo_ok": ["コードの CSV出力の列の並びは、登録者が担当者名の次にあるなど設計書の順（末尾に登録者）と違う。設計書の順に揃える（確認メモ H12）", "Thứ tự cột CSV出力 trong code khác tài liệu (cột Người đăng ký nằm sau Tên người phụ trách, không phải cuối). Sắp xếp theo thứ tự tài liệu thiết kế (Ghi chú xác nhận H12)"]},
    {"no": "1.2", "ja": "サンプルを登録", "vi": "Đăng ký mẫu", "sel": ".ph .btns button::サンプルを登録", "kind": "button", "trig": "click",
     "cond": ["営業サンプルの作成権限（営業・フル権限）があるとき。ないときは出さない", "Khi có quyền tạo mẫu kinh doanh (kinh doanh・toàn quyền). Không có quyền thì không hiện"],
     "detail": ["サンプル登録（AW_SMP_002）へ。", "Chuyển sang Đăng ký mẫu (AW_SMP_002)."]},
]
L_QUOTA = [
    {"no": "2", "ja": "枠の概要", "vi": "Tổng quan hạn mức", "sel": ".card .kpis", "kind": "area", "trig": "view",
     "detail": ["月ごとの営業サンプル枠。4つの数字（枠・受付済・残り枠・対象商品）は2つのタブの上に共通で出す。月は月間メニューのある月（枠はメニューごと＝その枠を決めたメニューの月）。枠の設定は メニュー管理 ＞ 月間メニューで行う（この画面では直さない）。", "Hạn mức mẫu kinh doanh theo tháng. 4 con số (hạn mức・đã tiếp nhận・còn lại・sản phẩm đối tượng) hiển thị chung phía trên cả hai tab. Tháng là tháng có Menu tháng (hạn mức theo từng menu = tháng của menu đã đặt hạn mức đó). Việc đặt hạn mức thực hiện ở Quản lý menu ＞ Menu tháng (không sửa ở màn hình này)."],
     "demo_ok": ["コードの月は 2026-09〜12 の固定値（SMP_YMS）。月間メニューのある月から読む（確認メモ H7）", "Tháng trong code là giá trị cố định 2026-09〜12 (SMP_YMS). Đọc từ các tháng có Menu tháng (Ghi chú xác nhận H7)"]},
    {"no": "2.1", "ja": "枠の月の切替", "vi": "Chuyển tháng", "sel": ".seg2", "kind": "tab", "trig": "click",
     "init": ["納品日が今日以降のいちばん近い月（直前に見た月を覚える）", "Tháng gần nhất có ngày giao từ hôm nay trở đi (nhớ tháng xem trước đó)"], "detail": ["押した月の KPI を表示する（一覧の絞り込みには影響しない）。", "Hiện KPI của tháng được bấm (không ảnh hưởng đến bộ lọc danh sách)."]},
    {"no": "2.2", "ja": "営業サンプル枠（月の合計）", "vi": "Hạn mức mẫu (tổng tháng)", "sel": ".kpis > div::営業サンプル枠", "kind": "label", "trig": "view", "err": ["W120"],
     "detail": ["その月の合計件数（既定は月60件・足せる）。枠が未設定の月は「未設定」と出し、W120 を出す（登録はできる）。", "Tổng số mẫu của tháng (mặc định 60 mẫu/tháng, có thể tăng). Tháng chưa đặt hạn mức hiện 「Chưa đặt」 và hiện W120 (vẫn đăng ký được)."],
     "demo_ok": ["見本データに枠のない月がないため、この状態は画面写真に撮れない（見本データに枠のない月を作る＝台帳 F 2026-10-08・受付簿 #320）", "Dữ liệu mẫu không có tháng nào không có hạn mức nên không chụp được trạng thái này (tạo tháng không có hạn mức trong dữ liệu mẫu = Sổ cái F 2026-10-08・Sổ tiếp nhận #320)"]},
    {"no": "2.3", "ja": "受付済（宛先の数）", "vi": "Đã tiếp nhận (số địa chỉ nhận)", "sel": ".kpis > div::受付済", "kind": "label", "trig": "view",
     "detail": ["その月の宛先の数。宛先1か所＝1件（数量が2個以上でも1件）。状態「取消」は数えない。", "Số địa chỉ nhận của tháng. 1 địa chỉ nhận = 1 mẫu (dù số lượng từ 2 cái trở lên vẫn là 1). Trạng thái 「取消」 không tính."],
     "demo_ok": ["コードは取消を知らない（取消を作ったとき、数えない扱いにする）。台帳 F 2026-10-07", "Code chưa biết đến việc hủy (khi làm chức năng hủy thì không tính mẫu hủy). Sổ cái F 2026-10-07"]},
    {"no": "2.4", "ja": "残り枠", "vi": "Hạn mức còn lại", "sel": ".kpis > div::残り枠", "kind": "label", "trig": "view",
     "detail": ["月の合計 − 受付済。枠が未設定のときは「—」。0 を下回る（枠を超えている）ときは赤字で「枠を超えています」。", "Tổng tháng − 受付済. Khi chưa đặt hạn mức hiện 「—」. Nếu nhỏ hơn 0 (vượt hạn mức) thì chữ đỏ 「Đã vượt hạn mức」."]},
    {"no": "2.5", "ja": "対象商品", "vi": "Sản phẩm đối tượng", "sel": ".kpis > div::対象商品", "kind": "label", "trig": "view",
     "detail": ["商品マスタの「営業サンプル」にチェックした商品の数。数量の初期値は各2個（1〜9個）。", "Số sản phẩm được tích 「営業サンプル」 trong master sản phẩm. Số lượng ban đầu là 2 cái mỗi sản phẩm (1〜9)."]},
    {"no": "3", "ja": "タブ", "vi": "Tab", "sel": ".tabs", "kind": "area", "trig": "view", "pattern": "P-TAB",
     "detail": ["「サンプル一覧」（初期表示）／「出荷週の受付」の2つ。タブは URL の ?tab= で持つ（出荷週の受付＝?tab=出荷週の受付）。4つの数字（2）は両タブの上に共通。", "2 tab: 「サンプル一覧」 (mặc định) / 「出荷週の受付」. Tab được giữ trong URL (?tab=; 出荷週の受付 = ?tab=出荷週の受付). 4 con số (2) dùng chung phía trên cả hai tab."]},
    {"no": "3.1", "ja": "サンプル一覧（タブ）", "vi": "Danh sách mẫu (tab)", "sel": ".tabs button::サンプル一覧", "kind": "tab", "trig": "click",
     "init": ["選択中（初期表示）", "Đang chọn (mặc định)"], "detail": ["検索条件（4）と営業サンプルの一覧（5）・ページ送り（6）を出す。", "Hiện điều kiện tìm kiếm (4), danh sách mẫu kinh doanh (5) và phân trang (6)."]},
    {"no": "3.2", "ja": "出荷週の受付（タブ）", "vi": "Tiếp nhận theo tuần gửi (tab)", "sel": ".tabs button::出荷週の受付", "kind": "tab", "trig": "click",
     "detail": ["出荷週ごとの受付の表（7）を出す。「受付を締める」・自動で締める案内・「余りを在庫へ戻す」はこのタブ。", "Hiện bảng tiếp nhận theo tuần gửi (7). 「受付を締める」・giải thích tự động chốt・「余りを在庫へ戻す」 nằm ở tab này."]},
]
L_WEEK = [
    {"no": "7", "ja": "出荷週ごとの受付", "vi": "Tiếp nhận theo tuần gửi", "sel": ".sm-ws", "kind": "table", "trig": "view",
     "cond": ["「出荷週の受付」タブ", "Tab 「出荷週の受付」"],
     "detail": ["出荷週＝発送日の週（月曜〜日曜）。受付の締めの日に、受付済のサンプルへ出荷指示（SS-YYMMDD-倉庫の記号）を作って THOMAS 用CSVを出す。締めの後に追加したサンプルは「締め後追加」と表示し、出荷指示を作らない。締め後の余りは「在庫戻しの出荷指示」で ES へ戻す。出荷指示ができると、その数を倉庫在庫の見込み在庫（出荷予定）から引く（締める前の受付済は引かない）。", "Tuần gửi = tuần của ngày gửi (thứ Hai〜Chủ nhật). Vào ngày chốt tiếp nhận, tạo chỉ thị xuất hàng (SS-YYMMDD-ký hiệu kho) cho các mẫu 受付済 và xuất CSV cho THOMAS. Mẫu thêm sau khi chốt hiện 「締め後追加」 và không tạo chỉ thị xuất hàng. Hàng dư sau chốt trả về ES bằng 「chỉ thị xuất hàng trả về kho」. Khi đã có chỉ thị xuất hàng thì số đó được trừ khỏi tồn kho dự kiến (dự kiến xuất) của kho (mẫu 受付済 trước khi chốt thì không trừ)."],
     "demo_ok": ["コードの上の説明文（REQ の番号入り）は外す。表の見出しの下にある説明は I122 の一言だけにする", "Bỏ đoạn giải thích phía trên của code (có số REQ). Phần giải thích dưới tiêu đề bảng chỉ giữ một câu I122"]},
    {"no": "7.1", "ja": "出荷週", "vi": "Tuần gửi", "sel": ".sm-ws th::出荷週", "kind": "label", "trig": "view",
     "detail": ["「MM-DD〜MM-DD（n月サイクル X週）」。出荷週の一覧は、受付があった週・締めた週と、これからの4週。", "「MM-DD〜MM-DD (chu kỳ tháng n, tuần X)」. Danh sách tuần gửi gồm các tuần có tiếp nhận, tuần đã chốt và 4 tuần sắp tới."]},
    {"no": "7.2", "ja": "サンプル", "vi": "Số mẫu", "sel": ".sm-ws th::サンプル", "kind": "label", "trig": "view",
     "detail": ["その出荷週のサンプルの件数（1登録＝1件）。取消は数えない。", "Số mẫu của tuần gửi đó (1 đăng ký = 1 mẫu). Mẫu hủy không tính."]},
    {"no": "7.3", "ja": "内訳", "vi": "Chi tiết", "sel": ".sm-ws th::内訳", "kind": "label", "trig": "view",
     "detail": ["状態ごとの件数（受付済・締め済・締め後追加）。", "Số lượng theo trạng thái (受付済・締め済・締め後追加)."]},
    {"no": "7.4", "ja": "受付", "vi": "Tiếp nhận", "sel": ".sm-ws th::受付", "kind": "label", "trig": "view",
     "detail": ["締める前は「受付中」（青）。締めたあとは「締め済」（緑）と締めた日時。自動で締めた場合も同じ（日時は自動の実行時刻）。", "Trước khi chốt là 「Đang tiếp nhận」 (xanh dương). Sau khi chốt là 「締め済」 (xanh lá) kèm ngày giờ chốt. Chốt tự động cũng giống vậy (ngày giờ là thời điểm chạy tự động)."]},
    {"no": "7.5", "ja": "受付を締める", "vi": "Chốt tiếp nhận", "sel": ".sm-ws button::受付を締める", "kind": "button", "trig": "click", "err": ["Q120", "S124"],
     "cond": ["受付中の出荷週。営業サンプルの更新権限（営業・フル権限・商品管理）があるとき出す", "Tuần gửi đang tiếp nhận. Hiện khi có quyền cập nhật mẫu kinh doanh (kinh doanh・toàn quyền・quản lý sản phẩm)"],
     "detail": ["自動の締めの前に、運営が早く締めるときに押す（確認 Q120 → 出荷指示を作成・THOMAS 用CSVを出す → S124）。締め後に取り消すときは 7.8。 同時に配送データも作る（7.10）。出荷指示ができた数は、倉庫在庫の見込み在庫（出荷予定）から引く。", "Bấm khi vận hành muốn chốt sớm trước giờ tự động chốt (xác nhận Q120 → tạo chỉ thị xuất hàng・xuất CSV cho THOMAS → S124). Muốn hủy chốt sau đó thì dùng 7.8. Đồng thời tạo dữ liệu giao hàng (7.10). Số của chỉ thị xuất hàng đã tạo được trừ khỏi tồn kho dự kiến (dự kiến xuất) của kho."]},
    {"no": "7.6", "ja": "余りを在庫へ戻す", "vi": "Trả hàng dư về kho", "sel": ".sm-ws button::余りを在庫へ戻す", "kind": "button", "trig": "click",
     "cond": ["締め済の出荷週", "Tuần gửi đã 締め済"], "detail": ["在庫戻しの出荷指示（AW_WHS_005）へ移る。", "Chuyển sang Chỉ thị xuất hàng trả về kho (AW_WHS_005)."],
     "demo_ok": ["コードは押すとトーストに REQ 番号を出す。トーストは出さずに画面を移る", "Code khi bấm sẽ hiện số REQ trong toast. Không hiện toast mà chuyển màn hình"]},
    {"no": "7.7", "ja": "自動で締める案内", "vi": "Giải thích tự động chốt", "sel": "-", "kind": "label", "trig": "view", "err": ["I122"],
     "open": ["手動で締めを取り消した週は自動で締めない（決定済み）。そのとき表の「受付」に「受付中（自動締めなし）」のように、自動で締まらないことを出すか。出すなら言葉は未決。運営TOP の警告「出荷週の受付が未締めのサンプルが n件」はそのまま出してよいか", "Tuần đã hủy chốt thủ công thì không tự động chốt (đã quyết). Khi đó ở cột 「受付」 của bảng có hiện việc không tự động chốt, ví dụ 「受付中（自動締めなし）」 không? Nếu hiện thì câu chữ chưa quyết. Cảnh báo TOP vận hành 「Có n mẫu của tuần gửi chưa chốt」 có tiếp tục hiện như cũ không"], "ask": "hong",
     "detail": ["表の上に I122 を出す（N＝2は仮。運営の設定「自動締めの営業日数」で変える＝運営I）。出荷週の月曜の{n}営業日前の営業開始時に自動で締め、受付済に出荷指示を作る（手動で締めたときと同じ。S124 は運営TOPのお知らせには出さない）。手動で締めを取り消した週は、自動締めが再び動かない（運営が「受付を締める」で手で締め直す。2026-10-08）。", "Hiện I122 phía trên bảng (N=2 là tạm. Đổi ở cài đặt vận hành 「Số ngày làm việc tự động chốt」 = Vận hành I). Tự động chốt vào giờ bắt đầu làm việc, {n} ngày làm việc trước thứ Hai của tuần gửi, tạo chỉ thị xuất hàng cho 受付済 (giống khi chốt thủ công. S124 không hiện ở thông báo TOP vận hành). Tuần đã được hủy chốt thủ công thì không tự động chốt lại nữa (vận hành chốt lại thủ công bằng 「受付を締める」; 2026-10-08)."],
     "demo_ok": ["コードに自動の締めはない（手で締めるだけ）。自動の締め・設定（運営I）・運営TOP の警告「出荷週の受付が未締めのサンプルが n件」は台帳 F 2026-10-07・受付簿 #310〜#318 の宿題", "Code không có tự động chốt (chỉ chốt bằng tay). Việc tự động chốt・cài đặt (Vận hành I)・cảnh báo TOP vận hành 「Có n mẫu của tuần gửi chưa chốt」 là việc phải làm theo Sổ cái F 2026-10-07・Sổ tiếp nhận #310〜#318"]},
    {"no": "7.8", "ja": "締めを取り消す", "vi": "Hủy chốt", "sel": ".sm-ws button::締めを取り消す", "kind": "button", "trig": "click",
     "cond": ["締め済の出荷週で、その週の最初の発送日の前日 23:59（日本時間）まで。営業サンプルの更新権限（受付を締めると同じ）があるとき出す", "Tuần gửi đã 締め済 và còn đến 23:59 (giờ Nhật Bản) ngày trước ngày gửi đầu tiên của tuần đó. Hiện khi có quyền cập nhật mẫu kinh doanh (giống quyền chốt tiếp nhận)"],
     "detail": ["押すと確認モーダル（No.11）。「締めを取り消す」で、その週の 締め済 のサンプルを 受付済 に戻し、出荷指示を取り消す。締めたあとに追加したサンプル（締め後追加）はそのまま。週の「締め済」の表示は「受付中」に戻る。取り消したあと、トーストで「出荷指示を取り消しました。変更行のCSVを出力して再登録してください」と知らせる（台帳 L の出荷指示後の変更と同じ方法）。取り消せる期限は、その週の最初の発送日の前日 23:59（日本時間）まで。取り消した週は自動締めが再び動かない（手で締め直す）。", "Bấm → modal xác nhận (No.11). Bấm 「Hủy chốt」: các mẫu 締め済 của tuần đó quay về 受付済 và chỉ thị xuất hàng bị hủy. Mẫu thêm sau khi chốt (締め後追加) giữ nguyên. Hiển thị 「締め済」 của tuần trở lại 「Đang tiếp nhận」. Sau khi hủy, toast báo 「Đã hủy chỉ thị xuất hàng. Hãy xuất CSV dòng thay đổi và đăng ký lại」 (cùng cách với thay đổi sau chỉ thị xuất hàng ở Sổ cái L). Hạn hủy là đến 23:59 (giờ Nhật Bản) ngày trước ngày gửi đầu tiên của tuần. Tuần đã hủy chốt thì không tự động chốt lại nữa (chốt lại thủ công)."],
     "demo_ok": ["確認の文章・トーストの文章は、コードに文字を直接書いている（共通メッセージに未登録）。メッセージ一覧への追加は別途", "Câu xác nhận・câu toast đang viết trực tiếp trong code (chưa đăng ký ở danh sách message chung). Việc thêm vào danh sách message làm riêng"]},
    {"no": "7.9", "ja": "取り消せない理由", "vi": "Lý do không hủy được", "sel": "-", "kind": "label", "trig": "view",
     "cond": ["締め済で、その週の最初の発送日の前日 23:59（日本時間）を過ぎたとき（最初の発送日以降）", "Tuần đã 締め済 và đã quá 23:59 (giờ Nhật Bản) ngày trước ngày gửi đầu tiên của tuần đó (từ ngày gửi đầu tiên trở đi)"],
     "detail": ["「締めを取り消す」ボタンを出さず、同じ場所に「最初の発送日（MM-DD）を過ぎたため、取り消せません」と書く。取り消す必要があるときは、個別のサンプルの取消（AW_SMP_001 No.5.9）や在庫戻しで対応する。", "Không hiện nút 「Hủy chốt」, thay vào đó ghi cùng chỗ 「Đã quá ngày gửi đầu tiên (MM-DD) nên không thể hủy」. Khi cần hủy thì xử lý bằng hủy từng mẫu (AW_SMP_001 No.5.9) hoặc trả về kho."],
     "demo_ok": ["今日は 10-08 で、見本データにこの状態の週がないため画面写真は出さない", "Hôm nay là 10-08 và dữ liệu mẫu không có tuần ở trạng thái này nên không có ảnh màn hình"]},
    {"no": "7.10", "ja": "配送データ（締めと同時に作る）", "vi": "Dữ liệu giao hàng (tạo cùng lúc khi chốt)", "sel": "-", "kind": "label", "trig": "view",
     "open": ["作る時期は決まった（出荷指示と同時＝受付を締めたとき。種類「サンプル」・入れたルートつき）。運営D の一覧での見せ方も決まった（種類「サンプル」で出す・契約・拠点は空・1日300件に数える：AW_DLVR・受付簿 #451）。まだ決まっていないこと：委託配送先Web（OW）での見せ方（営業サンプルの配送だと分かる表示・配送会社が見る範囲）。OW 側の設計書で決める。いまのコードは配送データを作らない", "Đã quyết thời điểm tạo (cùng lúc với chỉ thị xuất hàng = khi chốt tiếp nhận; loại 「サンプル」, kèm tuyến đã nhập). Cách hiển thị ở danh sách Vận hành D cũng đã quyết (hiện với loại 「サンプル」・hợp đồng và chi nhánh để trống・tính vào 300 chuyến/ngày: AW_DLVR・sổ tiếp nhận #451). Chưa quyết: cách hiển thị ở Web công ty vận chuyển ủy thác (OW) (cách nhận biết là giao hàng mẫu kinh doanh, phạm vi công ty vận chuyển được xem). Sẽ quyết ở tài liệu thiết kế OW. Code hiện chưa tạo dữ liệu giao hàng"], "ask": "OW の設計書",
     "detail": ["営業サンプルの配送データは、受付を締めて出荷指示を作るとき（手動・自動とも）に同時に作る。種類は「サンプル」で、登録のときに入れた配送ルート（ピッキング倉庫・配送会社・中継先）を付ける。締めを取り消したときは、出荷指示と一緒に取り消す。", "Dữ liệu giao hàng của mẫu kinh doanh được tạo cùng lúc khi chốt tiếp nhận và tạo chỉ thị xuất hàng (cả thủ công lẫn tự động). Loại là 「サンプル」, kèm tuyến giao hàng đã nhập khi đăng ký (kho picking・công ty vận chuyển・điểm trung chuyển). Khi hủy chốt thì hủy cùng chỉ thị xuất hàng."],
     "demo_ok": ["コードは未対応（配送データを作らない）。作り方は設計のみ", "Code chưa làm (chưa tạo dữ liệu giao hàng). Chỉ mới thiết kế"]},
]
L_SEARCH = [
    {"no": "4", "ja": "検索条件", "vi": "Điều kiện tìm kiếm", "sel": ".filter", "kind": "area", "trig": "view", "pattern": "P-LIST",
     "detail": ["サンプルNo・法人名・担当者のキーワード／出荷週／月／倉庫／状態／受付日（から・まで）。「検索」か Enter で反映。取消は既定では出さない（状態で「取消」を選ぶと出る）。", "Từ khóa số mẫu・tên công ty・người phụ trách / tuần gửi / tháng / kho / trạng thái / ngày tiếp nhận (từ・đến). Áp dụng bằng 「Tìm」 hoặc Enter. Mặc định không hiện mẫu hủy (chọn trạng thái 「取消」 mới hiện)."]},
    {"no": "4.1", "ja": "キーワード", "vi": "Từ khóa", "sel": ".filter .search input", "kind": "text", "trig": "input", "req": "－", "len": "文字列 60",
     "ex": ["ミズホ", "Từ khóa tìm kiếm (một phần tên công ty), dạng chuỗi"], "detail": ["サンプルNo・法人名・担当者名を部分一致で探す。", "Tìm theo khớp một phần số mẫu・tên công ty・tên người phụ trách."], "err": ["E04"]},
    {"no": "4.2", "ja": "出荷週", "vi": "Tuần gửi", "sel": ".filter select[aria-label=\"出荷週\"]", "kind": "select", "trig": "select", "req": "－", "len": "選択",
     "init": ["（未選択）", "(Chưa chọn)"], "ex": ["10-12〜10-18（10月サイクル A週）", "Một tuần gửi được chọn từ danh sách, dạng 「MM-DD〜MM-DD (chu kỳ tháng n, tuần X)」"], "detail": ["一覧の出荷週と同じ。", "Giống tuần gửi trong danh sách."]},
    {"no": "4.3", "ja": "月", "vi": "Tháng", "sel": ".filter select[aria-label=\"月\"]", "kind": "select", "trig": "select", "req": "－", "len": "選択",
     "init": ["（未選択）", "(Chưa chọn)"], "ex": ["2026-11", "Tháng áp dụng (tháng chu kỳ), dạng yyyy-mm"], "detail": ["サンプルの対象月（納品日のサイクル月）。", "Tháng áp dụng của mẫu (tháng chu kỳ của ngày giao)."]},
    {"no": "4.4", "ja": "倉庫", "vi": "Kho", "sel": ".filter select[aria-label=\"倉庫\"]", "kind": "select", "trig": "select", "req": "－", "len": "選択",
     "init": ["（未選択）", "(Chưa chọn)"], "ex": ["関東倉庫", "Tên kho picking, chọn từ danh sách"], "detail": ["倉庫マスタの有効なピッキング倉庫。", "Kho picking đang hiệu lực trong master kho."]},
    {"no": "4.5", "ja": "状態", "vi": "Trạng thái", "sel": ".filter select[aria-label=\"状態\"]", "kind": "select", "trig": "select", "req": "－", "len": "選択",
     "init": ["（未選択）＝取消以外すべて", "(Chưa chọn) = tất cả trừ 取消"], "ex": ["受付済", "Trạng thái mẫu, chọn từ danh sách"],
     "detail": ["受付済／締め済／締め後追加／取消。未選択のときは取消を出さない。", "受付済／締め済／締め後追加／取消. Khi chưa chọn thì không hiện mẫu hủy."],
     "demo_ok": ["コードの選択肢に「取消」がない。取消を作るとき足し、未選択では取消を除く（台帳 F 営業サンプルの取消）", "Lựa chọn trong code không có 「取消」. Khi làm chức năng hủy thì thêm vào, và khi chưa chọn thì loại mẫu hủy (Sổ cái F, hủy mẫu kinh doanh)"]},
    {"no": "4.6", "ja": "受付日（から）", "vi": "Ngày tiếp nhận (từ)", "sel": ".filter .f-grid input[aria-label=\"受付日（から）\"]", "kind": "date", "trig": "input", "req": "－", "len": "日付",
     "ex": ["2026-10-01", "Ngày tiếp nhận, dạng yyyy-mm-dd"], "detail": ["登録した日。まで より後は指定できない。", "Ngày đăng ký. Không chọn được sau ngày 「đến」."], "err": ["E02"]},
    {"no": "4.7", "ja": "受付日（まで）", "vi": "Ngày tiếp nhận (đến)", "sel": ".filter .f-grid input[aria-label=\"受付日（まで）\"]", "kind": "date", "trig": "input", "req": "－", "len": "日付",
     "ex": ["2026-10-31", "Ngày tiếp nhận, dạng yyyy-mm-dd"], "detail": ["登録した日。", "Ngày đăng ký."]},
    {"no": "4.8", "ja": "クリア・検索", "vi": "Xóa・Tìm", "sel": ".filter .f-act", "kind": "button", "trig": "click", "detail": ["「クリア」で条件を空に戻す。「検索」で反映する。", "「Xóa」 đưa điều kiện về trống. 「Tìm」 để áp dụng."]},
    {"no": "4.9", "ja": "並べ替え", "vi": "Sắp xếp", "sel": ".sortbox", "kind": "select", "trig": "select", "req": "－", "len": "選択",
     "init": ["受付日時の降順（初期の並び）", "Ngày giờ tiếp nhận giảm dần (thứ tự ban đầu)"], "ex": ["納品日", "Mục sắp xếp, chọn từ danh sách"], "detail": ["並べる項目と昇順・降順を選ぶ。初期の並びは受付日時の降順（新しい受付が上）。", "Chọn mục sắp xếp và tăng dần・giảm dần. Thứ tự ban đầu là ngày giờ tiếp nhận giảm dần (mẫu mới ở trên)."],
     "demo_ok": ["コードの初期の並びは発送日の昇順。受付日時の降順に直す（台帳 F 運営C2 の画面の決まり）", "Thứ tự ban đầu của code là ngày gửi tăng dần. Sửa thành ngày giờ tiếp nhận giảm dần (Sổ cái F, Quy ước màn hình Vận hành C2)"]},
]
L_TABLE = [
    {"no": "5", "ja": "営業サンプルの一覧", "vi": "Bảng mẫu kinh doanh", "sel": ".tbl:not(.sm-ws)", "kind": "table", "trig": "view", "pattern": "P-LIST", "err": ["I01"],
     "detail": ["1ページ 10件。0件は I01 を一覧の中に出す。1行＝1回の登録（倉庫が分かれる出荷・枝番は作らない。台帳 F 2026-10-08）。列は サンプルNo・受付日・宛先・商品・納品日・発送日・状態・操作 に絞る。担当者・登録者・数量・倉庫・配送会社／中継先・送り状番号・出荷指示は詳細（AW_SMP_003）で見る（CSV出力は全項目のまま）。サンプルNo を押すと詳細を開く（台帳 F「詳細（閲覧）画面を足す」・受付簿 #337）。", "10 dòng/trang. Khi 0 dòng hiện I01 trong danh sách. 1 dòng = 1 lần đăng ký (không tách chuyến theo kho, không có số nhánh; Sổ cái F 2026-10-08). Cột rút gọn còn: Số mẫu・Ngày tiếp nhận・Địa chỉ nhận・Sản phẩm・Ngày giao・Ngày gửi・Trạng thái・Thao tác. Người phụ trách・Người đăng ký・Số lượng・Kho・Công ty vận chuyển/điểm trung chuyển・Số vận đơn・Chỉ thị xuất hàng xem ở màn chi tiết (AW_SMP_003); CSV出力 vẫn đủ cột. Bấm Số mẫu để mở chi tiết (Sổ cái F 「詳細（閲覧）画面を足す」・Sổ tiếp nhận #337)."],
     "demo_ok": ["コードの0件の文言を I01 に揃える。コードは倉庫が分かれる登録を枝番 -1／-2 の2行で出す。枝番をやめる（台帳 F 2026-10-08・受付簿 #329）", "Thống nhất câu hiển thị 0 dòng của code theo I01. Code đang hiện đăng ký chia kho thành 2 dòng có số nhánh -1/-2. Bỏ số nhánh (Sổ cái F 2026-10-08・Sổ tiếp nhận #329)"]},
    {"no": "5.1", "ja": "サンプルNo", "vi": "Số mẫu", "sel": ".tbl th::サンプルNo", "kind": "link", "trig": "click",
     "detail": ["押すと営業サンプルの詳細（AW_SMP_003）を開く（/ops/purchasing/samples/サンプルNo）。SM-YYMM-NNN（YYMM＝サイクル月）。枝番（-1・-2）は付けない（倉庫が分かれる出荷を作らないため）。システムが採番する。", "SM-YYMM-NNN (YYMM = tháng chu kỳ). Không có số nhánh -1・-2 (vì không tách chuyến theo kho). Hệ thống tự đánh số. Bấm để mở màn chi tiết (AW_SMP_003)."],
     "demo_ok": ["コードは倉庫が分かれたとき枝番（-1・-2）を付ける。やめる（台帳 F 2026-10-08・受付簿 #329）", "Code thêm số nhánh (-1・-2) khi chia kho. Bỏ (Sổ cái F 2026-10-08・Sổ tiếp nhận #329)"]},
    {"no": "5.2", "ja": "受付日", "vi": "Ngày tiếp nhận", "sel": ".tbl th::受付日", "kind": "label", "trig": "view", "detail": ["yyyy-mm-dd。登録した日。", "yyyy-mm-dd. Ngày đăng ký."]},
    {"no": "5.3", "ja": "宛先", "vi": "Địa chỉ nhận", "sel": ".tbl th::宛先", "kind": "label", "trig": "view",
     "detail": ["法人名（文字だけ。押しても何も開かない＝宛先の送付履歴のモーダルは作らない。台帳 F 2026-10-08）。下に都道府県・市区町村。法人・拠点・契約とはつながない。同じ宛先への過去の送付は、登録画面の警告（W121）だけで知らせる。", "Tên công ty (chỉ hiện chữ, bấm không mở gì = không làm modal lịch sử gửi tới địa chỉ; Sổ cái F 2026-10-08). Bên dưới là tỉnh/thành・quận/huyện. Không liên kết với công ty・chi nhánh・hợp đồng. Việc đã gửi trước đây tới cùng địa chỉ chỉ báo bằng cảnh báo (W121) ở màn đăng ký."]},
    {"no": "5.4", "ja": "担当者", "vi": "Người phụ trách", "sel": "-", "kind": "label", "trig": "view", "detail": ["先方の担当者名。　一覧の列からは外し、詳細（AW_SMP_003 No.3.2）で見る。", "Tên người phụ trách phía khách. Đã bỏ khỏi cột danh sách, xem ở màn chi tiết (AW_SMP_003 No.3.2)."]},
    {"no": "5.4.1", "ja": "登録者", "vi": "Người đăng ký", "sel": "-", "kind": "label", "trig": "view",
     "detail": ["そのサンプルを登録した運営のアカウント名（担当者の右）。CSV出力にも「登録者」の列で出す。登録後に変わらない。　一覧の列からは外し、詳細（AW_SMP_003 No.2.3）で見る。", "Tên tài khoản vận hành đã đăng ký mẫu đó (bên phải Người phụ trách). Cũng xuất ra CSV出力 ở cột 「登録者」. Không đổi sau khi đăng ký. Đã bỏ khỏi cột danh sách, xem ở màn chi tiết (AW_SMP_003 No.2.3)."],
     "ex": ["にっしぐち（運営）", "Tên tài khoản vận hành, hệ thống tự ghi"]},
    {"no": "5.5", "ja": "商品", "vi": "Sản phẩm", "sel": ".tbl th::商品", "kind": "label", "trig": "view", "detail": ["「商品名×数量」を「、」でつなぐ。長いときは省略し、マウスを乗せると全文。", "Nối 「tên sản phẩm×số lượng」 bằng 「、」. Nếu dài thì rút gọn, rê chuột vào để xem đầy đủ."]},
    {"no": "5.6", "ja": "数量", "vi": "Số lượng", "sel": "-", "kind": "label", "trig": "view", "detail": ["その行の数量の合計（右寄せ）。　一覧の列からは外し、詳細（AW_SMP_003 No.4）で見る。", "Tổng số lượng của dòng đó (căn phải). Đã bỏ khỏi cột danh sách, xem ở màn chi tiết (AW_SMP_003 No.4)."]},
    {"no": "5.7", "ja": "納品日", "vi": "Ngày giao", "sel": ".tbl th::納品日", "kind": "label", "trig": "view", "detail": ["yyyy-mm-dd（曜）。ピッキングできない日で前倒ししたときは、振り替えたあとの日。", "yyyy-mm-dd (thứ). Khi đã dời sớm do ngày không picking được thì là ngày sau khi dời."]},
    {"no": "5.8", "ja": "発送日", "vi": "Ngày gửi", "sel": ".tbl th::発送日", "kind": "label", "trig": "view",
     "detail": ["納品日 − リードタイム（登録のとき運営が入れた値。宛先ごと）。ピッキングできない日なら直前のピッキングできる日に前倒しし、「前倒し」の黄バッジと理由を出す。", "Ngày giao − lead time (giá trị vận hành nhập lúc đăng ký, theo từng địa chỉ nhận). Nếu là ngày không picking được thì dời sớm về ngày picking được gần nhất trước đó, hiện badge vàng 「前倒し」 và lý do."],
     "demo_ok": ["理由の表示（「〇〇のため」）をメッセージの ID にする（確認メモ H11）", "Hiển thị lý do (「do 〇〇」) bằng ID thông báo (Ghi chú xác nhận H11)"]},
    {"no": "5.9", "ja": "倉庫", "vi": "Kho", "sel": "-", "kind": "label", "trig": "view", "detail": ["ピッキング倉庫（関東・関西・中部）。　一覧の列からは外し、詳細（AW_SMP_003 No.5.1）で見る。", "Kho picking (Kanto・Kansai・Chubu). Đã bỏ khỏi cột danh sách, xem ở màn chi tiết (AW_SMP_003 No.5.1)."]},
    {"no": "5.9.1", "ja": "配送会社・中継先", "vi": "Công ty vận chuyển・điểm trung chuyển", "sel": "-", "kind": "label", "trig": "view",
     "detail": ["登録のとき入れた配送ルートの「配送会社」。中継先があれば「配送会社 ／ 中継先」の形で並べる。登録後は変わらない。　一覧の列からは外し、詳細（AW_SMP_003 No.5.2・5.3）で見る。", "「Công ty vận chuyển」 của tuyến giao hàng nhập lúc đăng ký. Nếu có điểm trung chuyển thì hiện dạng 「công ty vận chuyển ／ điểm trung chuyển」. Không đổi sau khi đăng ký. Đã bỏ khỏi cột danh sách, xem ở màn chi tiết (AW_SMP_003 No.5.2・5.3)."],
     "ex": ["ヤマト運輸 ／ ヤマト運輸 練馬営業所", "Công ty vận chuyển (/ điểm trung chuyển nếu có), do vận hành nhập lúc đăng ký"]},
    {"no": "5.9.2", "ja": "送り状番号", "vi": "Số vận đơn", "sel": "-", "kind": "label", "trig": "view",
     "detail": ["出荷後に分かる送り状番号。入れていなければ空。「メモ・送り状番号」のモーダルで入れる・直す（5.13）。CSV出力にも出す。　一覧の列からは外し、詳細（AW_SMP_003 No.6.3）で見る。", "Số vận đơn biết sau khi xuất hàng. Chưa nhập thì để trống. Nhập・sửa ở modal 「メモ・送り状番号」 (5.13). Cũng xuất ra CSV出力. Đã bỏ khỏi cột danh sách, xem ở màn chi tiết (AW_SMP_003 No.6.3)."],
     "ex": ["123456789012", "Số vận đơn của công ty vận chuyển (chữ số/chữ cái nửa chiều rộng và gạch nối, tối đa 30 ký tự)"]},
    {"no": "5.10", "ja": "状態", "vi": "Trạng thái", "sel": ".tbl th::状態", "kind": "label", "trig": "view", "pattern": "P-STATUS-COLORS",
     "detail": ["受付済（青）＝受付中で出荷指示はまだ／締め済（緑）＝出荷指示を作成済／締め後追加（黄）＝締めたあとに追加したため出荷指示なし／取消（灰）＝枠に数えず、既定では一覧に出さない。", "受付済 (xanh dương) = đang tiếp nhận, chưa có chỉ thị xuất hàng / 締め済 (xanh lá) = đã tạo chỉ thị xuất hàng / 締め後追加 (vàng) = thêm sau khi chốt nên không có chỉ thị xuất hàng / 取消 (xám) = không tính hạn mức, mặc định không hiện trong danh sách."],
     "demo_ok": ["コードに「取消」の状態がない（台帳 F 営業サンプルの取消）", "Code chưa có trạng thái 「取消」 (Sổ cái F, hủy mẫu kinh doanh)"]},
    {"no": "5.11", "ja": "出荷指示", "vi": "Chỉ thị xuất hàng", "sel": "-", "kind": "link", "trig": "click",
     "detail": ["締め済は「あり（SS-YYMMDD-倉庫の記号）」。押すと THOMAS 用CSVを再ダウンロードする（形式は配送の出荷指示CSVと同じ）。受付済は「なし（締めると作成）」、締め後追加は「なし（締め後追加）」。　一覧の列からは外し、詳細（AW_SMP_003 No.6.1）で見る。出荷指示ができるのは受付を締めたとき（手動・自動とも）で、配送データも同時に作る（7.10）。", "締め済 hiện 「Có (SS-YYMMDD-ký hiệu kho)」. Bấm để tải lại CSV cho THOMAS (định dạng giống CSV chỉ thị xuất hàng của giao hàng). 受付済 là 「Không (tạo khi chốt)」, 締め後追加 là 「Không (thêm sau khi chốt)」. Đã bỏ khỏi cột danh sách, xem ở màn chi tiết (AW_SMP_003 No.6.1). Chỉ thị xuất hàng được tạo khi chốt tiếp nhận (cả thủ công lẫn tự động), dữ liệu giao hàng cũng được tạo cùng lúc (7.10)."],
     "demo_ok": ["コードに出荷指示のCSVを出す機能がない（締めたときに出す・一覧から再ダウンロードする）。台帳 F 運営C2 の画面の決まり", "Code chưa có chức năng xuất CSV chỉ thị xuất hàng (xuất khi chốt・tải lại từ danh sách). Sổ cái F, Quy ước màn hình Vận hành C2"]},
    {"no": "5.12", "ja": "操作", "vi": "Thao tác", "sel": ".tbl th::操作", "kind": "label", "trig": "view",
     "detail": ["行の右端。「メモ・送り状番号」（一覧に出るボタン）と「取消」（取消を作るとき足す）。詳細にも同じ操作を置く（AW_SMP_003 No.1.2・1.3）。権限がない役割には出さない。", "Cuối bên phải dòng. Nút 「メモ・送り状番号」 (đang hiện ở danh sách) và 「取消」 (thêm khi làm chức năng hủy). Màn chi tiết cũng có cùng thao tác (AW_SMP_003 No.1.2・1.3). Không hiện cho vai trò không có quyền."],
     "demo_ok": ["コードの操作の列には「メモ・送り状番号」のボタンだけがある。「取消」のボタンを足す（台帳 F 2026-10-07）", "Cột thao tác trong code chỉ có nút 「メモ・送り状番号」. Thêm nút 「取消」 (Sổ cái F 2026-10-07)"]},
    {"no": "5.13", "ja": "メモ・送り状番号（ボタン）", "vi": "Ghi chú・số vận đơn (nút)", "sel": ".tbl button::メモ・送り状番号", "kind": "button", "trig": "click",
     "cond": ["営業サンプルの更新権限があるとき（受付を締める・取消と同じ機能ごとの操作）。どの状態の行にも出す（取消の行を除く）", "Khi có quyền cập nhật mẫu kinh doanh (thao tác theo chức năng, giống chốt tiếp nhận・hủy). Hiện ở dòng thuộc mọi trạng thái (trừ dòng đã hủy)"],
     "detail": ["「メモ・送り状番号」の編集のモーダル（8）を開く。メモは一覧の列には出さない（CSV には出す）。送り状番号は詳細（AW_SMP_003 No.6.3）に出す。変更履歴はモーダルの下と詳細（AW_SMP_003 No.7）に出る。詳細の「メモ・送り状番号を編集」からも同じモーダルを開く。", "Mở modal sửa 「メモ・送り状番号」 (8). Ghi chú không hiện ở cột danh sách (có trong CSV). Số vận đơn hiện ở màn chi tiết (AW_SMP_003 No.6.3). Lịch sử thay đổi hiện dưới modal và ở màn chi tiết (AW_SMP_003 No.7). Nút 「メモ・送り状番号を編集」 ở màn chi tiết cũng mở cùng modal này."],
     "demo_ok": ["コードの「取消」の行（状態「取消」）はまだない。取消を作るとき、取消の行には出さない", "Code chưa có dòng 「取消」. Khi làm chức năng hủy thì không hiện nút ở dòng hủy"]},
    {"no": "5.14", "ja": "取消（ボタン）", "vi": "Hủy (nút)", "sel": "-", "kind": "button", "trig": "click", "err": ["E151"],
     "cond": ["受付済：いつでも／締め済：そのサンプルの発送日の前日 23:59（日本時間）まで／締め後追加：同じ（発送日の前日 23:59 まで）／発送日以降と取消済は押せない（E151）。営業サンプルの更新権限（営業・フル権限・商品管理）があるとき出す", "受付済: bất cứ lúc nào / 締め済: đến 23:59 (giờ Nhật Bản) ngày trước ngày gửi của chính mẫu đó / 締め後追加: giống vậy (đến 23:59 ngày trước ngày gửi) / Từ ngày gửi trở đi và mẫu đã hủy thì không bấm được (E151). Hiện khi có quyền cập nhật mẫu kinh doanh (kinh doanh・toàn quyền・quản lý sản phẩm)"],
     "detail": ["取消の確認のモーダルを開く。締めの後に追加したサンプル（締め後追加）も取り消せる。取り消せる期限は、週の最初の発送日ではなく、そのサンプル自身の発送日の前日 23:59（日本時間）まで。発送日以降は E151 のトースト。", "Mở modal xác nhận hủy. Mẫu thêm sau khi chốt (締め後追加) cũng hủy được. Hạn hủy không tính theo ngày gửi đầu tiên của tuần mà theo ngày gửi của chính mẫu đó: đến 23:59 (giờ Nhật Bản) ngày trước đó. Từ ngày gửi trở đi hiện toast E151."],
     "demo_ok": ["コードに取消がない（台帳 F 営業サンプルの取消）", "Code chưa có chức năng hủy (Sổ cái F, hủy mẫu kinh doanh)"]},
    {"no": "6", "ja": "ページ送り", "vi": "Phân trang", "sel": ".card .pager", "kind": "area", "trig": "view", "pattern": "P-LIST",
     "detail": ["「n件中 a–b件」・ページ番号・表示件数（10／20／50）。初期は10件。", "「a–b trong n mẫu」・số trang・số dòng hiển thị (10/20/50). Ban đầu là 10 dòng."]},
]
EMPTY = [{"no": "5.15", "ja": "0件の表示", "vi": "Hiển thị 0 dòng", "sel": ".tbl td.empty", "kind": "label", "trig": "show", "err": ["I01"],
          "demo_ok": ["コードの文言を I01 に揃える", "Thống nhất câu của code theo I01"]}]

# モーダル
M_MEMO = [
    {"no": "8", "ja": "メモ・送り状番号の編集（モーダル）", "vi": "Sửa ghi chú・số vận đơn (modal)", "sel": MODAL, "kind": "modal", "trig": "show", "pattern": "P-HIST",
     "detail": ["登録したあとに直せるのは「メモ」と「送り状番号」だけ（宛先・商品・納品日・配送ルートは直せない。誤りは取消して登録し直す）。送り状番号は出荷後に分かるため。受付済・締め済・締め後追加のどれでも直せる。出荷指示には影響しない。直した内容は変更履歴に残る（いつ・誰が・前→後）。", "Sau khi đăng ký chỉ sửa được 「ghi chú」 và 「số vận đơn」 (không sửa được địa chỉ nhận・sản phẩm・ngày giao・tuyến giao hàng. Nếu sai thì hủy rồi đăng ký lại). Số vận đơn chỉ biết sau khi xuất hàng. Sửa được ở cả 受付済・締め済・締め後追加. Không ảnh hưởng đến chỉ thị xuất hàng. Nội dung đã sửa được lưu vào lịch sử thay đổi (khi nào・ai・trước → sau)."]},
    {"no": "8.1", "ja": "サンプルNo・宛先", "vi": "Số mẫu・Địa chỉ", "sel": ".ov .mbox p.muted", "kind": "label", "trig": "view", "detail": ["対象のサンプルNo・法人名。読むだけ。", "Số mẫu・tên công ty của mẫu đối tượng. Chỉ đọc."]},
    {"no": "8.2", "ja": "送り状番号（任意）", "vi": "Số vận đơn (tùy chọn)", "sel": "#sm-trk", "kind": "text", "trig": "input", "req": "－", "len": "文字列 30", "fid": "sm-trk",
     "init": ["いまの送り状番号（なければ空）", "Số vận đơn hiện tại (trống nếu chưa có)"], "ex": ["123456789012", "Số vận đơn của công ty vận chuyển, chữ số/chữ cái nửa chiều rộng và gạch nối (tối đa 30 ký tự)"],
     "valid": ["任意。半角英数字とハイフン。30文字まで。前後の空白を取る。空にもできる。", "Tùy chọn. Chữ số/chữ cái nửa chiều rộng và gạch nối. Tối đa 30 ký tự. Bỏ khoảng trắng đầu cuối. Có thể để trống."], "err": ["E04"],
     "detail": ["出荷後に分かった送り状番号。詳細（AW_SMP_003 No.6.3）とCSV出力に出る。", "Số vận đơn biết sau khi xuất hàng. Hiện ở màn chi tiết (AW_SMP_003 No.6.3) và CSV出力."],
     "demo_ok": ["コードは31文字目以降を入れられない（E04 は出ない）。文字の種類が違うときの文言は共通メッセージにまだない（宿題）", "Code không cho nhập từ ký tự thứ 31 (E04 không hiện). Câu khi sai loại ký tự chưa có trong thông báo chung (việc phải làm)"]},
    {"no": "8.3", "ja": "メモ", "vi": "Ghi chú", "sel": "#sm-memo-m", "kind": "textarea", "trig": "input", "req": "－", "len": ["文字列 500（複数行）", "Chuỗi tối đa 500 ký tự (nhiều dòng)"], "fid": "sm-memo-m",
     "init": ["いまのメモ（登録時のメモ）", "Ghi chú hiện tại (ghi chú lúc đăng ký)"], "ex": ["商談名：給食センター向け新メニューの試食。営業担当は佐藤。", "Ghi chú hiện tại (nhiều dòng, tối đa 500 ký tự): tên cuộc thương thảo, người phụ trách kinh doanh"],
     "valid": ["500文字まで。前後の空白を取る。空にもできる。", "Tối đa 500 ký tự. Bỏ khoảng trắng đầu cuối. Có thể để trống."], "err": ["E04", "E13"]},
    {"no": "8.4", "ja": "変更履歴", "vi": "Lịch sử thay đổi", "sel": ".ov .mbox .tbl", "kind": "table", "trig": "view",
     "detail": ["メモ・送り状番号を直した日時・直した人・項目・変更前→変更後。新しい順（最新が上）。変わった項目だけ1行ずつ残す。まだ直していないときは「変更履歴はまだありません。」と出す。登録したときの値は履歴に出さない（直したときから残る）。", "Ngày giờ sửa ghi chú・số vận đơn, người sửa, mục, giá trị trước → sau. Mới nhất ở trên. Mỗi mục thay đổi lưu thành 1 dòng. Khi chưa sửa lần nào hiện 「変更履歴はまだありません。」. Giá trị lúc đăng ký không hiện trong lịch sử (chỉ lưu từ lần sửa)."]},
    {"no": "8.5", "ja": "保存", "vi": "Lưu", "sel": ".ov button::保存", "kind": "button", "trig": "click", "err": ["S01"], "detail": ["メモと送り状番号を保存して閉じる（S01）。他の人が先に直していたら E31。", "Lưu ghi chú và số vận đơn rồi đóng (S01). Nếu người khác đã sửa trước thì E31."],
     "demo_ok": ["コードの保存のトーストの文言は独自（S01 に揃える）。同時更新の E31 は未対応", "Câu toast lưu của code là câu riêng (thống nhất theo S01). Chưa xử lý cập nhật đồng thời E31"]},
    {"no": "8.6", "ja": "キャンセル", "vi": "Hủy", "sel": ".ov button::キャンセル", "kind": "button", "trig": "click", "err": ["Q02"], "detail": ["直していれば Q02。直していなければそのまま閉じる。", "Nếu đã sửa thì Q02. Nếu chưa sửa thì đóng luôn."],
     "demo_ok": ["コードは直していても確認なしで閉じる（Q02 に揃える）", "Code đóng luôn không hỏi dù đã sửa (thống nhất theo Q02)"]},
]
M_CANCEL = [
    {"no": "9", "ja": "取消の確認（モーダル）", "vi": "Xác nhận hủy (modal)", "sel": "-", "kind": "modal", "trig": "show", "err": ["Q123"],
     "open": ["締め後追加のサンプルを取り消すときの案内の文（出荷指示は作っていないので、「出荷指示は作成済みです…」は当てはまらない）は別に決める（hong 2026-10-08「案内の文は別」）。いまの Q123 は受付済・締め済用", "Câu hướng dẫn khi hủy mẫu 締め後追加 (vì chưa tạo chỉ thị xuất hàng nên câu 「出荷指示は作成済みです…」 không áp dụng) sẽ quyết riêng (hong 2026-10-08 「案内の文は別」). Q123 hiện dùng cho 受付済・締め済"], "ask": "hong",
     "detail": ["受付済は Q123 の本文。締め済（そのサンプルの発送日の前日 23:59〔日本時間〕まで）は Q123 の「出荷指示は作成済みです。THOMAS へ変更行のCSVを出力して再登録してください」を足し、「変更行のCSV」（取り消す行）を出す。締め後追加も取り消せる（案内の文は open）。", "受付済 dùng nội dung Q123. 締め済 (đến 23:59 giờ Nhật Bản ngày trước ngày gửi của mẫu đó) thêm câu 「出荷指示は作成済みです。THOMAS へ変更行のCSVを出力して再登録してください」 của Q123 và hiện 「CSV dòng thay đổi」 (dòng bị hủy)."],
     "demo_ok": ["コードに取消がない（台帳 F 営業サンプルの取消）", "Code chưa có chức năng hủy (Sổ cái F, hủy mẫu kinh doanh)"]},
    {"no": "9.1", "ja": "取消の理由", "vi": "Lý do hủy", "sel": "-", "kind": "textarea", "trig": "input", "req": "○", "len": ["文字列 500（複数行）", "Chuỗi tối đa 500 ký tự (nhiều dòng)"],
     "ex": ["商談が中止になったため。", "Lý do hủy (bắt buộc, nhiều dòng, tối đa 500 ký tự)"], "valid": ["必須。500文字まで。", "Bắt buộc. Tối đa 500 ký tự."], "err": ["E01", "E04", "E13"],
     "detail": ["取消の理由。変更履歴に残す。", "Lý do hủy. Được lưu vào lịch sử thay đổi."]},
    {"no": "9.2", "ja": "取り消す", "vi": "Hủy mẫu", "sel": "-", "kind": "button", "trig": "click", "err": ["S125", "E151"],
     "detail": ["状態を「取消」にし、月の枠に数えなくなる（S125）。締め済の取消は、THOMAS 用の変更行CSVを出す。発送日以降は E151（倉庫在庫の詳細のモーダル・在庫戻しで対応する）。", "Chuyển trạng thái thành 「取消」 và không còn tính vào hạn mức tháng (S125). Hủy mẫu 締め済 thì xuất CSV dòng thay đổi cho THOMAS. Từ ngày gửi trở đi là E151 (xử lý bằng điều chỉnh ở modal chi tiết tồn kho kho・trả về kho)."]},
    {"no": "9.3", "ja": "キャンセル", "vi": "Hủy bỏ", "sel": "-", "kind": "button", "trig": "click", "detail": ["閉じる。何も変えない。", "Đóng. Không thay đổi gì."]},
]
M_CLOSE = [
    {"no": "10", "ja": "受付を締める（確認モーダル）", "vi": "Chốt tiếp nhận (modal xác nhận)", "sel": MODAL, "kind": "modal", "trig": "show", "err": ["Q120"],
     "detail": ["出荷週と受付済の件数を出す。「締める」で出荷指示（SS-…）を作り、THOMAS 用CSVを出す（S124）。", "Hiện tuần gửi và số mẫu 受付済. Bấm 「Chốt」 để tạo chỉ thị xuất hàng (SS-…) và xuất CSV cho THOMAS (S124)."],
     "demo_ok": ["コードの本文・ボタンを Q120 に揃える", "Thống nhất nội dung・nút của code theo Q120"]},
    {"no": "10.1", "ja": "キャンセル", "vi": "Hủy", "sel": ".ov .modal button::キャンセル", "kind": "button", "trig": "click", "detail": ["閉じる。", "Đóng."]},
    {"no": "10.2", "ja": "締める", "vi": "Chốt", "sel": ".ov .modal button::締める", "kind": "button", "trig": "click", "err": ["S124"],
     "detail": ["受付済に出荷指示を作成し、その週を「締め済」にする。同時に配送データも作る（7.10）。締めの取り消しは 7.8。", "Tạo chỉ thị xuất hàng cho 受付済 và chuyển tuần đó thành 「締め済」. Đồng thời tạo dữ liệu giao hàng (7.10). Hủy chốt dùng 7.8."]},
]

M_REOPEN = [
    {"no": "11", "ja": "締めを取り消す（確認モーダル）", "vi": "Hủy chốt (modal xác nhận)", "sel": MODAL, "kind": "modal", "trig": "show",
     "detail": ["出荷週と、受付済に戻る件数（締め済の件数）を出す。「締めを取り消す」で、締め済を受付済に戻し、出荷指示を取り消す。締め後追加のサンプルはそのまま。取り消したあと、その週の自動締めは再び動かない（運営が「受付を締める」で手で締め直す）。", "Hiện tuần gửi và số mẫu sẽ quay về 受付済 (số mẫu 締め済). Bấm 「Hủy chốt」: 締め済 quay về 受付済 và chỉ thị xuất hàng bị hủy. Mẫu 締め後追加 giữ nguyên. Sau khi hủy, tuần đó không còn tự động chốt lại (vận hành chốt lại thủ công bằng 「受付を締める」)."],
     "demo_ok": ["本文：「出荷週 {週} の締めを取り消します。締め済の{n}件を受付済に戻し、出荷指示を取り消します。締めた後に追加したサンプルはそのままです。取り消した後は、変更行の CSV を出力して再登録してください。」／ボタン「キャンセル」「締めを取り消す」／成功のトースト「出荷指示を取り消しました。変更行のCSVを出力して再登録してください」。共通メッセージに未登録のため、コードに直接書いている", "Nội dung: 「Hủy chốt tuần gửi {tuần}. Đưa {n} mẫu 締め済 về 受付済 và hủy chỉ thị xuất hàng. Mẫu thêm sau khi chốt giữ nguyên. Sau khi hủy, hãy xuất CSV dòng thay đổi và đăng ký lại.」 / Nút 「キャンセル」「締めを取り消す」 / Toast thành công 「出荷指示を取り消しました。変更行のCSVを出力して再登録してください」. Chưa đăng ký ở message chung nên viết trực tiếp trong code"]},
    {"no": "11.1", "ja": "キャンセル", "vi": "Hủy", "sel": ".ov .modal button::キャンセル", "kind": "button", "trig": "click", "detail": ["閉じる。何も変えない。", "Đóng. Không thay đổi gì."]},
    {"no": "11.2", "ja": "締めを取り消す", "vi": "Hủy chốt", "sel": ".ov .modal button::締めを取り消す", "kind": "button", "trig": "click",
     "err": ["E151"],
     "detail": ["締め済を受付済に戻し（出荷指示を消す）、週を「受付中」に戻す。最初の発送日の前日 23:59（日本時間）を過ぎていたときは取り消せない（サーバー側でも確かめる）。", "Đưa 締め済 về 受付済 (xóa chỉ thị xuất hàng), đưa tuần về 「Đang tiếp nhận」. Nếu đã quá 23:59 (giờ Nhật Bản) ngày trước ngày gửi đầu tiên thì không hủy được (server cũng kiểm tra)."]},
]

# ---------------------------------------------------------------- 登録（AW_SMP_002）

R_HEAD = [
    {"no": "1", "ja": "ヘッダー", "vi": "Đầu trang", "sel": ".ph", "kind": "area", "trig": "view",
     "detail": ["パンくず：発注・入荷 ＞ 営業サンプル ＞ サンプル登録。法人・拠点・契約は作らない（宛先だけ入力）。営業サンプルの作成権限（営業・フル権限）がある役割だけ開ける。", "Breadcrumb: Đặt hàng・Nhập hàng ＞ Mẫu kinh doanh ＞ Đăng ký mẫu. Không tạo công ty・chi nhánh・hợp đồng (chỉ nhập địa chỉ nhận). Chỉ vai trò có quyền tạo mẫu kinh doanh (kinh doanh・toàn quyền) mới mở được."],
     "demo_ok": ["コードに「決定の根拠」の帯（Basis）が出る。デモ専用の説明は外す（確認メモ Q-C3）", "Code đang hiện thanh 「Căn cứ quyết định」 (Basis). Bỏ phần giải thích chỉ dành cho demo (Ghi chú xác nhận Q-C3)"]},
    {"no": "1.1", "ja": "キャンセル", "vi": "Hủy", "sel": ".ph .btns button::キャンセル", "kind": "button", "trig": "click", "err": ["Q02"],
     "detail": ["入力していれば Q02。入力していなければそのまま一覧（AW_SMP_001）へ。サイドメニュー・ブラウザを閉じる／再読み込みでも同じ。", "Nếu đã nhập thì Q02. Nếu chưa nhập thì về thẳng danh sách (AW_SMP_001). Menu bên・đóng trình duyệt / tải lại trang cũng giống vậy."]},
    {"no": "1.2", "ja": "登録", "vi": "Đăng ký", "sel": ".ph .btns button::登録", "kind": "button", "trig": "click", "err": ["S123", "E149"],
     "cond": ["月の枠を超えるときは非活性（E149）", "Vô hiệu hóa khi vượt hạn mức tháng (E149)"],
     "detail": ["全項目をまとめてチェックする。通れば登録して一覧へ戻り、S123 のトースト。締め済の出荷週に当たるときは「締め後追加」で登録する。押したらボタンを無効にする。", "Kiểm tra tất cả các mục cùng lúc. Nếu hợp lệ thì đăng ký và quay về danh sách, hiện toast S123. Nếu rơi vào tuần gửi đã chốt thì đăng ký là 「締め後追加」. Sau khi bấm thì vô hiệu hóa nút."],
     "pattern": "P-FORMBOX"},
]
R_QUOTA = [
    {"no": "2", "ja": "枠の概要", "vi": "Tổng quan hạn mức", "sel": ".sum", "kind": "area", "trig": "view",
     "detail": ["納品日から対象月を決め、その月の枠を出す。納品日が空のときは直前に見た月。", "Xác định tháng áp dụng từ ngày giao và hiện hạn mức của tháng đó. Khi ngày giao trống thì dùng tháng xem trước đó."]},
    {"no": "2.1", "ja": "対象月（納品日から自動）", "vi": "Tháng áp dụng (tự động từ ngày giao)", "sel": ".sum > div::対象月", "kind": "label", "trig": "view", "detail": ["納品日のサイクル月（例 2026-11）。", "Tháng chu kỳ của ngày giao (ví dụ 2026-11)."]},
    {"no": "2.2", "ja": "月の合計枠", "vi": "Tổng hạn mức tháng", "sel": ".sum > div::月の合計枠", "kind": "label", "trig": "view", "err": ["W120"],
     "detail": ["月間メニューで決めた件数。未設定の月は「未設定」と出し、W120 を出す（登録はできる）。", "Số mẫu quyết định ở Menu tháng. Tháng chưa đặt hiện 「Chưa đặt」 và hiện W120 (vẫn đăng ký được)."]},
    {"no": "2.3", "ja": "受付済", "vi": "Đã tiếp nhận", "sel": ".sum > div::受付済", "kind": "label", "trig": "view", "detail": ["その月の宛先の数（取消は数えない）。", "Số địa chỉ nhận của tháng (không tính mẫu hủy)."]},
    {"no": "2.4", "ja": "残り枠", "vi": "Hạn mức còn lại", "sel": ".sum > div::残り枠", "kind": "label", "trig": "view", "detail": ["月の合計 − 受付済。", "Tổng tháng − 受付済."]},
]
R_DEST = [
    {"no": "3", "ja": "宛先（見込みのお客様）", "vi": "Địa chỉ nhận (khách tiềm năng)", "sel": ".card .sec:has(#sm-company)", "kind": "area", "trig": "view",
     "detail": ["入れるのは宛先だけ。法人・拠点・契約は作らず、あとでその会社が申し込んでも法人へ引き継がない。", "Chỉ nhập địa chỉ nhận. Không tạo công ty・chi nhánh・hợp đồng, và sau này dù công ty đó đăng ký thì cũng không chuyển sang công ty."]},
    {"no": "3.1", "ja": "法人名", "vi": "Tên công ty", "sel": "#sm-company", "kind": "text", "trig": "input", "req": "○", "len": "文字列 60", "fid": "sm-company",
     "ex": ["株式会社ミズホ食品", "Tên công ty của khách tiềm năng, dạng chuỗi (tối đa 60 ký tự)"], "valid": ["前後の空白を取る。60文字まで。", "Bỏ khoảng trắng đầu cuối. Tối đa 60 ký tự."], "err": ["E01", "E04", "E13"],
     "detail": ["見込みのお客様の法人名。法人名と住所が同じなら同じ宛先として、過去の送付を警告（W121）に出す。", "Tên công ty của khách tiềm năng. Nếu tên công ty và địa chỉ giống nhau thì được coi là cùng một địa chỉ nhận và hiện trong cảnh báo (W121) về các lần gửi trước."],
     "demo_ok": ["コードに文字数のチェックがない（E04）。60文字にそろえる（確認メモ H4）", "Code chưa kiểm tra số ký tự (E04). Thống nhất 60 ký tự (Ghi chú xác nhận H4)"]},
    {"no": "3.2", "ja": "担当者名", "vi": "Người phụ trách", "sel": "#sm-pic", "kind": "text", "trig": "input", "req": "○", "len": "文字列 60", "fid": "sm-pic",
     "ex": ["田中 俊", "Tên người phụ trách phía khách, dạng chuỗi (tối đa 60 ký tự)"], "valid": ["前後の空白を取る。60文字まで。", "Bỏ khoảng trắng đầu cuối. Tối đa 60 ký tự."], "err": ["E01", "E04", "E13"],
     "demo_ok": ["コードに文字数のチェックがない（E04）。60文字にそろえる", "Code chưa kiểm tra số ký tự (E04). Thống nhất 60 ký tự"]},
    {"no": "3.3", "ja": "電話番号", "vi": "Số điện thoại", "sel": "#sm-tel", "kind": "text", "trig": "input", "req": "○", "len": "文字列 20", "fid": "sm-tel",
     "ex": ["03-5555-0101", "Số điện thoại, chữ số và gạch nối (10〜11 chữ số)"], "valid": ["数字とハイフン。ハイフンを除いて10〜11桁。", "Chữ số và gạch nối. Bỏ gạch nối thì 10〜11 chữ số."], "err": ["E01", "E06"],
     "demo_ok": ["コードは9桁以上でよい。10〜11桁に直す（E06・確認メモ H4）", "Code chấp nhận từ 9 chữ số trở lên. Sửa thành 10〜11 chữ số (E06・Ghi chú xác nhận H4)"]},
    {"no": "3.4", "ja": "郵便番号", "vi": "Mã bưu điện", "sel": "#sm-zip", "kind": "text", "trig": "input", "req": "○", "len": "文字列 8", "fid": "sm-zip",
     "ex": ["100-0005", "Mã bưu điện 7 chữ số, lưu dạng 123-4567"], "valid": ["数字7桁（ハイフンは任意）。保存は 123-4567 の形。", "7 chữ số (gạch nối tùy chọn). Lưu theo dạng 123-4567."], "err": ["E01", "E05"],
     "detail": ["入力すると、都道府県・市区町村・町域を自動で入れる（直せる）。取得できないときは W100 を出し、手入力する。", "Khi nhập sẽ tự động điền tỉnh/thành・quận/huyện・khu vực (sửa được). Nếu không lấy được thì hiện W100 và nhập tay."],
     "demo_ok": ["コードに住所の自動入力がない。運営A の法人編集と同じ部品を使う（確認メモ Q-S9・台帳 F）", "Code chưa có tự động điền địa chỉ. Dùng cùng component với màn sửa công ty của Vận hành A (Ghi chú xác nhận Q-S9・Sổ cái F)"]},
    {"no": "3.5", "ja": "都道府県", "vi": "Tỉnh/thành", "sel": "#sm-pref", "kind": "select", "trig": "select", "req": "○", "len": "選択", "fid": "sm-pref",
     "init": ["（都道府県）", "(Tỉnh/thành)"], "ex": ["東京都", "Tên tỉnh/thành, chọn từ 47 tỉnh/thành"], "valid": ["47都道府県から選ぶ。", "Chọn từ 47 tỉnh/thành."], "err": ["E02"]},
    {"no": "3.6", "ja": "市区町村", "vi": "Quận/huyện", "sel": "#sm-city", "kind": "text", "trig": "input", "req": "○", "len": "文字列 60", "fid": "sm-city",
     "ex": ["千代田区", "Tên quận/huyện/thành phố, dạng chuỗi (tối đa 60 ký tự)"], "valid": ["60文字まで。", "Tối đa 60 ký tự."], "err": ["E01", "E04", "E13"],
     "demo_ok": ["コードに文字数のチェックがない（E04）", "Code chưa kiểm tra số ký tự (E04)"]},
    {"no": "3.7", "ja": "町域・番地", "vi": "Khu vực・số nhà", "sel": "#sm-town", "kind": "text", "trig": "input", "req": "○", "len": "文字列 255", "fid": "sm-town",
     "ex": ["丸の内1-6-5", "Khu vực・số nhà, dạng chuỗi (tối đa 255 ký tự)"], "valid": ["255文字まで。", "Tối đa 255 ký tự."], "err": ["E01", "E04", "E13"],
     "demo_ok": ["コードに文字数のチェックがない（E04）", "Code chưa kiểm tra số ký tự (E04)"]},
    {"no": "3.8", "ja": "建物・部屋番号", "vi": "Tòa nhà・số phòng", "sel": "#sm-bld", "kind": "text", "trig": "input", "req": "－", "len": "文字列 255", "fid": "sm-bld",
     "ex": ["丸の内北口ビル 8F", "Tên tòa nhà・số phòng (tùy chọn), dạng chuỗi (tối đa 255 ký tự)"], "valid": ["255文字まで。", "Tối đa 255 ký tự."], "err": ["E04", "E13"],
     "demo_ok": ["コードに文字数のチェックがない（E04）", "Code chưa kiểm tra số ký tự (E04)"]},
    {"no": "3.9", "ja": "同じ宛先への送付の警告", "vi": "Cảnh báo đã gửi tới cùng địa chỉ", "sel": ".sm-hist-empty, .sm-warn", "kind": "area", "trig": "view", "err": ["W121"],
     "detail": ["法人名と住所を入れると、同じ宛先（法人名＋住所が同じ。空白・ハイフン・全角半角は無視）への過去の送付を表に出す。あれば W121 を出す。警告だけで止めない（登録はできる。マーケティングのキャンペーンなどで続けて送ることがあるため。台帳 F 2026-10-08）。同じ法人名で住所が違う宛先は別の宛先として数え、件数だけ出す。一覧に「宛先の送付履歴」のモーダルは作らない。", "Khi nhập tên công ty và địa chỉ, hiển thị trong bảng các lần gửi trước đây tới cùng địa chỉ nhận (cùng tên công ty + địa chỉ; bỏ qua khoảng trắng・gạch nối・toàn/bán giác). Nếu có thì hiện W121; chỉ cảnh báo, KHÔNG chặn (vẫn đăng ký được vì có thể gửi liên tiếp, ví dụ chiến dịch marketing; Sổ cái F 2026-10-08). Không làm modal 「Lịch sử gửi tới địa chỉ」 ở danh sách. Địa chỉ nhận có cùng tên công ty nhưng khác địa chỉ được tính là địa chỉ khác, chỉ hiện số lượng."]},
    {"no": "3.10", "ja": "配送ルート（この宛先）", "vi": "Tuyến giao hàng (cho địa chỉ này)", "sel": ".card .sec:has(#sm-wh)", "kind": "area", "trig": "view",
     "detail": ["1回の登録で配送ルートを1つ、登録のたびに「ピッキング倉庫・配送会社・中継先［任意］」を都度選ぶ（既存のルートを選ぶ形にはしない。配送会社は委託配送先マスタ、中継先は倉庫マスタの中継先から選ぶ。台帳 F 2026-10-08）。ピッキング倉庫は商品ごとではなく宛先ごとで、登録全体のピッキング倉庫はここから決まる。倉庫が分かれる出荷（枝番）は作らない。ルートは配送の可変構造（配送元・配送先を都度指定できる。配送_01_マスタ）。", "Mỗi lần đăng ký chỉ định 1 tuyến giao hàng, chọn mỗi lần 「kho picking・công ty vận chuyển・điểm trung chuyển [tùy chọn]」 (không cho chọn tuyến có sẵn; công ty vận chuyển chọn từ master công ty vận chuyển ủy thác, điểm trung chuyển chọn từ kho loại trung chuyển trong master kho; Sổ cái F 2026-10-08). Kho picking theo địa chỉ nhận chứ không theo sản phẩm; kho picking của cả lần đăng ký lấy từ đây. Không tách chuyến theo kho (không có số nhánh). Tuyến là cấu trúc linh hoạt của giao hàng (chỉ định nguồn gửi・nơi nhận mỗi lần; Giao hàng_01_Master)."]},
    {"no": "3.11", "ja": "ピッキング倉庫", "vi": "Kho picking", "sel": "select[aria-label=\"ピッキング倉庫\"]", "kind": "select", "trig": "select", "req": "○", "len": "選択", "fid": "sm-wh",
     "init": ["（未選択）", "(Chưa chọn)"], "ex": ["関東倉庫", "Tên kho picking, chọn từ danh sách"], "valid": ["必須。倉庫マスタの有効なピッキング倉庫から選ぶ。選ぶと、この倉庫が扱わない商品は選べなくなる（4.1・4.4）。倉庫を変えたとき、選んでいた商品（「送る」がオン）が新しい倉庫で扱われなければ、その選択（オン）は外れる。入れた数量は残す（倉庫を戻せば同じ数量でまた送れる。hong 2026-10-08）。", "Bắt buộc. Chọn từ kho picking đang hiệu lực trong master kho. Khi chọn, sản phẩm mà kho này không xử lý sẽ không chọn được (4.1・4.4). Khi đổi kho, sản phẩm đang được chọn (bật 「送る」) mà kho mới không xử lý thì bị bỏ chọn. Số lượng đã nhập vẫn giữ (đổi kho lại thì gửi tiếp với số lượng đó; hong 2026-10-08)."], "err": ["E01", "E148"],
     "detail": ["配送元＝ピッキング倉庫。1回の登録で1つ。サンプルNo は枝番なし、出荷指示もこの1倉庫で作る。倉庫に担当エリアは持たない（運営が選ぶ）。", "Nguồn gửi = kho picking. 1 kho cho mỗi lần đăng ký. Số mẫu không có số nhánh, chỉ thị xuất hàng cũng tạo theo 1 kho này. Kho không có khu vực phụ trách (vận hành chọn)."],
     "demo_ok": ["E148 の使う場面は共通ファイルの場面欄（商品ごと）のままなので、別の機会に直す。コードは未選択のとき「ピッキング倉庫は必須項目です。」（E01）を出す", "Cột tình huống của E148 trong file chung vẫn ghi theo từng sản phẩm, sẽ sửa sau. Code hiện 「ピッキング倉庫は必須項目です。」 (E01) khi chưa chọn"]},
    {"no": "3.12", "ja": "配送会社", "vi": "Công ty vận chuyển", "sel": "#sm-routeCarrier", "kind": "select", "trig": "select", "req": "○", "len": "選択", "fid": "sm-routeCarrier",
     "init": ["（未選択）", "(Chưa chọn)"], "ex": ["ヤマト運輸", "Tên công ty vận chuyển, chọn từ danh sách master công ty vận chuyển ủy thác"], "valid": ["必須。委託配送先マスタの有効な配送会社から選ぶ（自社は出さない）。", "Bắt buộc. Chọn từ công ty vận chuyển đang hiệu lực trong master công ty vận chuyển ủy thác (không hiện công ty tự vận hành)."], "err": ["E01"],
     "detail": ["このルートで運ぶ配送会社。登録のたびにマスタから選ぶ（文字では入れない。台帳 F 2026-10-08）。一覧とCSV出力には配送会社の名前を出す。", "Công ty vận chuyển của tuyến này. Chọn từ master mỗi lần đăng ký (không nhập bằng chữ; Sổ cái F 2026-10-08). Danh sách và CSV出力 hiện tên công ty vận chuyển."]},
    {"no": "3.13", "ja": "中継先（任意）", "vi": "Điểm trung chuyển (tùy chọn)", "sel": "#sm-routeHub", "kind": "select", "trig": "select", "req": "－", "len": "選択", "fid": "sm-routeHub",
     "init": ["（中継しない）", "(Không trung chuyển)"], "ex": ["ヤマト 渋谷営業所", "Tên điểm trung chuyển, chọn từ kho loại trung chuyển trong master kho"], "valid": ["任意。倉庫マスタの有効な中継先から選ぶ。空なら中継なし。", "Tùy chọn. Chọn từ điểm trung chuyển đang hiệu lực trong master kho. Để trống = không trung chuyển."],
     "detail": ["配送会社の営業所など、経由する中継先（倉庫マスタの種別が中継先の倉庫）。リードタイムは中継があっても合計1つ（5.2）で、中継分は計算に使わない。", "Điểm trung chuyển như văn phòng của công ty vận chuyển (kho có loại 中継先 trong master kho). Lead time là 1 tổng giá trị (5.2) dù có trung chuyển, phần trung chuyển không dùng để tính."]},
]
R_ITEMS = [
    {"no": "4", "ja": "サンプルの商品", "vi": "Sản phẩm mẫu", "sel": ".card .sec:has(.tbl)", "kind": "area", "trig": "view",
     "detail": ["営業サンプルの対象は、商品マスタの「営業サンプル」にチェックした商品。はじめは全部「送る・2個」（数量の初期値は2。台帳 F 2026-10-08・受付簿 #327）。ただし、配送ルートのピッキング倉庫が扱わない商品（取扱倉庫に入っていない商品）は選べない（非活性・理由つき）。1つ以上選ぶ（選ばないと E02）。別の倉庫の商品も送るときは、もう1回登録する（倉庫が分かれる出荷・枝番は作らない。2回登録＝枠を2件使い、同じ宛先への2回目は W121 の警告が出る。hong 2026-10-08・台帳 S・受付簿 #448）。", "Đối tượng mẫu kinh doanh là các sản phẩm được tích 「営業サンプル」 trong master sản phẩm. Ban đầu tất cả là 「Gửi・2 cái」 (số lượng ban đầu là 2; Sổ cái F 2026-10-08・Sổ tiếp nhận #327). Tuy nhiên sản phẩm mà kho picking của tuyến giao hàng không xử lý (không có trong kho xử lý) thì không chọn được (vô hiệu hóa kèm lý do). Chọn ít nhất 1 (không chọn thì E02). Khi cũng muốn gửi sản phẩm của kho khác thì đăng ký thêm 1 lần nữa (không tạo chuyến chia kho・số nhánh. Đăng ký 2 lần = dùng 2 mẫu của hạn mức, lần thứ 2 tới cùng địa chỉ có cảnh báo W121; hong 2026-10-08・sổ cái R・sổ tiếp nhận #448)."],
     "err": ["E02"]},
    {"no": "4.1", "ja": "送る", "vi": "Gửi", "sel": ".tbl input[type=checkbox]", "kind": "check", "trig": "check", "req": "－", "len": ["チェック", "Checkbox"], "init": ["オン（全商品）", "Bật (tất cả sản phẩm)"],
     "ex": ["オン（送る）", "Checkbox gửi: bật = gửi sản phẩm đó"], "detail": ["オンの商品だけ送る。配送ルートのピッキング倉庫が扱わない商品は非活性（オンにできない）にして、理由を行に出す。倉庫を変えたとき、新しい倉庫が扱わない商品は選択（オン）が外れる（数量 4.2 は残る）。", "Chỉ gửi các sản phẩm đang bật. Sản phẩm mà kho picking của tuyến không xử lý thì vô hiệu hóa (không bật được) và hiện lý do trên dòng. Khi đổi kho, sản phẩm mà kho mới không xử lý bị bỏ chọn (số lượng 4.2 vẫn giữ)."],
     "cond": ["配送ルートのピッキング倉庫が決まっているとき、取扱倉庫に含まれない商品は非活性", "Khi đã có kho picking của tuyến, sản phẩm không nằm trong kho xử lý thì vô hiệu hóa"]},
    {"no": "4.2", "ja": "数量", "vi": "Số lượng", "sel": ".tbl input[type=number]", "kind": "text", "trig": "input", "req": "○", "len": "整数 1〜9", "init": ["2", "2"],
     "ex": ["2", "Số lượng, số nguyên 1〜9"], "valid": ["1〜9の整数。全角は半角に直す。範囲の外は1または9に直す。枠の件数には数えない（1件＝宛先1か所）。倉庫を変えて選択が外れても、入れた数量は残る。", "Số nguyên 1〜9. Chuyển toàn giác thành bán giác. Nếu ngoài phạm vi thì sửa thành 1 hoặc 9. Không tính vào số lượng hạn mức (1 mẫu = 1 địa chỉ nhận). Dù đổi kho làm bỏ chọn sản phẩm thì số lượng đã nhập vẫn giữ."], "err": ["E04"],
     "demo_ok": ["コードは範囲の外を黙って直す。仕様どおり1〜9を保つ（台帳 F・確認メモ Q-S2）", "Code âm thầm sửa khi ngoài phạm vi. Giữ trong khoảng 1〜9 đúng quy định (Sổ cái F・Ghi chú xác nhận Q-S2)"]},
    {"no": "4.3", "ja": "取扱倉庫（商品マスタ）", "vi": "Kho xử lý (master sản phẩm)", "sel": ".tbl th::取扱倉庫", "kind": "label", "trig": "view",
     "detail": ["商品マスタの取扱倉庫。配送ルートのピッキング倉庫がここに含まれない商品は、4.4 のとおり選べない。", "Kho xử lý trong master sản phẩm. Sản phẩm mà kho picking của tuyến không nằm trong đây thì không chọn được (theo 4.4)."]},
    {"no": "4.4", "ja": "取扱外の理由（非活性の行）", "vi": "Lý do không chọn được (dòng bị vô hiệu hóa)", "sel": ".tbl td::では扱っていないため選べません", "kind": "label", "trig": "view",
     "cond": ["ピッキング倉庫が決まっていて、その倉庫が商品の取扱倉庫に入っていないとき", "Khi đã có kho picking và kho đó không nằm trong kho xử lý của sản phẩm"],
     "detail": ["非活性の行（取扱倉庫の欄）に「（倉庫名）では扱っていないため選べません」の形で理由を出す。数量は入れられず、送る対象にならない。商品ごとのピッキング倉庫の選択は作らない（ピッキング倉庫はルートで1つ＝3.11）。", "Ở dòng bị vô hiệu hóa (cột kho xử lý) hiện lý do dạng 「(tên kho) không xử lý nên không chọn được」. Không nhập được số lượng và không thuộc đối tượng gửi. Không có việc chọn kho picking theo từng sản phẩm (kho picking là 1 theo tuyến = 3.11)."]},
    {"no": "4.5", "ja": "選んだ商品の数量を一括で変更", "vi": "Đổi số lượng hàng loạt cho sản phẩm đã chọn", "sel": "#sm-bulkqty", "kind": "text", "trig": "input", "req": "－", "len": "整数 1〜9", "init": ["2", "2"],
     "ex": ["5", "Số nguyên 1〜9, áp dụng cho mọi sản phẩm đang bật 「送る」"],
     "detail": ["表の上に置く数量の入力欄。「適用」を押すと、いま「送る」がオンの商品すべての数量を、この数にそろえる（オフの商品・取扱外で非活性の商品は変えない）。数量は1個ずつも直せる（4.2）。数量の初期値は各2個のまま。", "Ô nhập số lượng đặt phía trên bảng. Bấm 「適用」 thì số lượng của tất cả sản phẩm đang bật 「送る」 được đặt thành số này (sản phẩm đang tắt hoặc bị vô hiệu hóa vì kho không xử lý thì không đổi). Vẫn sửa từng sản phẩm được (4.2). Số lượng ban đầu vẫn là 2 cái mỗi sản phẩm."],
     "valid": ["1〜9の整数。入っていない・範囲の外のときは、入力欄の横に「1〜9 の数字を入れてください」と出して、何も変えない。", "Số nguyên 1〜9. Nếu để trống hoặc ngoài phạm vi, hiện 「1〜9 の数字を入れてください」 cạnh ô nhập và không đổi gì."],
     "demo_ok": ["入力欄の横の文章は、共通メッセージに未登録のため、コードに直接書いている", "Câu bên cạnh ô nhập chưa đăng ký ở message chung nên viết trực tiếp trong code"]},
    {"no": "4.6", "ja": "適用", "vi": "Áp dụng", "sel": "button::適用", "kind": "button", "trig": "click",
     "detail": ["一括で変更の数を、「送る」がオンの商品すべての数量に入れる。確認のモーダルは出さない（あとから1個ずつ直せる）。登録するまで保存されない。", "Đặt số lượng bulk cho tất cả sản phẩm đang bật 「送る」. Không hiện modal xác nhận (có thể sửa từng sản phẩm sau). Chưa lưu cho đến khi đăng ký."]},
]
R_DATE = [
    {"no": "5", "ja": "納品日と発送日", "vi": "Ngày giao và ngày gửi", "sel": ".card .sec:has(#sm-deliv)", "kind": "area", "trig": "view",
     "detail": ["納品日とリードタイム（運営が入れる）から発送日を自動で計算する（納品日 − リードタイム。ピッキングできない日は直前のピッキングできる日へ前倒しし、納品日も同じだけ振り替える）。リードタイムは宛先ごとに違い、倉庫ごとには持たない。", "Tính tự động ngày gửi từ ngày giao và lead time (vận hành nhập) (ngày giao − lead time. Lead time khác nhau theo từng địa chỉ nhận, không giữ theo từng kho. Ngày không picking được thì dời sớm về ngày picking được gần nhất trước đó, và dời ngày giao cùng số ngày)."]},
    {"no": "5.1", "ja": "納品日", "vi": "Ngày giao", "sel": "#sm-deliv", "kind": "date", "trig": "input", "req": "○", "len": "日付", "fid": "sm-deliv",
     "ex": ["2026-11-18", "Ngày giao, dạng yyyy-mm-dd (từ hôm nay đến ngày cuối cùng có chu kỳ giao hàng)"], "valid": ["今日から、配送サイクルのある最後の日まで。発送日が今日より前になるときは E147。", "Từ hôm nay đến ngày cuối cùng có chu kỳ giao hàng. Nếu ngày gửi trước hôm nay thì E147."], "err": ["E01", "E147"],
     "detail": ["先方に届けたい日。", "Ngày muốn giao đến khách."],
     "demo_ok": ["コードの上限は 2026-12-27 の固定値。配送サイクルのある最後の日（共通データ）から読む（確認メモ Q-S8・H7）", "Giới hạn trên của code là giá trị cố định 2026-12-27. Đọc từ ngày cuối cùng có chu kỳ giao hàng (dữ liệu chung) (Ghi chú xác nhận Q-S8・H7)"]},
    {"no": "5.2", "ja": "リードタイム（日）", "vi": "Lead time (ngày)", "sel": "#sm-lead", "kind": "text", "trig": "input", "req": "○", "len": "整数 0〜30", "fid": "sm-lead",
     "ex": ["2", "Số ngày từ lúc gửi đến lúc giao, số nguyên 0〜30 (nhập tay, hệ thống không gợi ý)"], "valid": ["必須。0〜30の整数。全角は半角に直す。1回の登録で1つ。", "Bắt buộc. Số nguyên 0〜30. Chuyển toàn giác thành bán giác. 1 giá trị cho mỗi lần đăng ký."], "err": ["E01", "E12"],
     "detail": ["発送日＝納品日−リードタイム。宛先ごとに違い、毎回違うことがあるため、運営が毎回手で入れる。システムは値を提案しない。", "Ngày gửi = ngày giao − lead time. Khác nhau theo từng địa chỉ nhận và mỗi lần có thể khác nên vận hành nhập tay mỗi lần. Hệ thống không gợi ý giá trị."]},
    {"no": "5.3", "ja": "前回のリードタイム（参考）", "vi": "Lead time lần trước (tham khảo)", "sel": "#sm-lead ~ .hint, .fld:has(#sm-lead) .hint", "kind": "label", "trig": "view",
     "detail": ["リードタイムの項目名の横に、同じ宛先（法人名＋住所が同じ）への前回のリードタイムを「0〜30の整数。同じ宛先への前回は n日（参考）」の形で出す。前回がなければ「0〜30の整数。宛先によって違うため、毎回入れてください」。値は入れない（手入力のまま）。", "Cạnh tên mục lead time, hiện lead time của lần gửi trước tới cùng địa chỉ nhận (cùng tên công ty + địa chỉ) dạng 「Số nguyên 0〜30. Lần trước gửi tới cùng địa chỉ là n ngày (tham khảo)」. Nếu chưa có lần trước thì hiện 「Số nguyên 0〜30. Khác nhau theo địa chỉ nhận nên hãy nhập mỗi lần」. Không tự điền giá trị (vẫn nhập tay)."]},
    {"no": "5.4", "ja": "メモ（任意）", "vi": "Ghi chú (tùy chọn)", "sel": "#sm-memo", "kind": "textarea", "trig": "input", "req": "－", "len": ["文字列 500（複数行）", "Chuỗi tối đa 500 ký tự (nhiều dòng)"], "fid": "sm-memo",
     "ex": ["商談名：給食センター向け新メニュー。営業担当は佐藤。", "Ghi chú tùy chọn (nhiều dòng, tối đa 500 ký tự): tên cuộc thương thảo, người phụ trách kinh doanh"], "valid": ["500文字まで。", "Tối đa 500 ký tự."], "err": ["E04", "E13"],
     "detail": ["登録したあとは、一覧の「メモ・送り状番号」から直せる。直せるのはメモと送り状番号だけ。", "Sau khi đăng ký thì sửa được từ nút 「メモ・送り状番号」 trong danh sách. Chỉ sửa được ghi chú và số vận đơn."],
     "demo_ok": ["コードは1行の入力（500文字のチェックはある）。複数行にする（input_standard・確認メモ H4）", "Code là ô nhập 1 dòng (có kiểm tra 500 ký tự). Chuyển thành nhiều dòng (input_standard・Ghi chú xác nhận H4)"]},
    {"no": "5.5", "ja": "発送の計算結果", "vi": "Kết quả tính ngày gửi", "sel": ".sm-ship, .sm-split", "kind": "area", "trig": "view",
     "detail": ["1つの結果を出す：納品日（入力）・リードタイム（入力した値）・発送日（自動）。前倒しのときは「前倒し」バッジと理由。倉庫が分かれる（別便）表示は作らない。", "Hiện 1 kết quả: ngày giao (nhập)・lead time (giá trị đã nhập)・ngày gửi (tự động). Khi dời sớm thì có badge 「前倒し」 và lý do. Không có hiển thị chia kho (giao riêng)."]},
    {"no": "5.6", "ja": "ピッキングできない日", "vi": "Ngày không picking được", "sel": ".sm-ship.moved", "kind": "label", "trig": "view",
     "detail": ["配送サイクルの出荷不可枠・日別の出荷不可日・サイクル休止の日。この日に当たると前倒しする。関西・中部倉庫は当面は関東倉庫と同じとして扱い、リリース後にデータで調整する（台帳 F 2026-10-08）。", "Khung không xuất hàng của chu kỳ giao hàng・ngày không xuất hàng theo ngày・ngày chu kỳ tạm dừng. Nếu rơi vào các ngày này thì dời sớm. Kho Kansai・Chubu tạm coi như kho Kanto (điều chỉnh bằng dữ liệu sau khi release; Sổ cái F 2026-10-08)."]},
]
R_MSG = [
    {"no": "6", "ja": "月の枠を超える（メッセージ）", "vi": "Vượt hạn mức tháng (thông báo)", "sel": ".sm-ng", "kind": "label", "trig": "show", "err": ["E149"],
     "detail": ["ページ上部のメッセージエリアに E149 を出し、「登録」ボタンを非活性にする。登録できない（枠を増やすときは月間メニューで件数を変える）。枠を超える登録は止める（hong 確認 2026-10-08）。別の倉庫の商品を2回に分けて登録するときは、2回とも枠に数える（残り1件なら2回目は E149 で止まる）。", "Hiện E149 ở vùng thông báo đầu trang và vô hiệu hóa nút 「Đăng ký」. Không đăng ký được (muốn tăng hạn mức thì đổi số mẫu ở Menu tháng). Đăng ký vượt hạn mức bị chặn (hong xác nhận 2026-10-08). Khi chia sản phẩm của kho khác thành 2 lần đăng ký thì cả 2 lần đều tính vào hạn mức (còn 1 mẫu thì lần thứ 2 bị chặn bởi E149)."],
     "demo_ok": ["コードの文言は長い独自文（トーストと帯の2か所）。E149（Message List No.114）に揃える（確認メモ H8）", "Câu trong code là câu riêng dài (2 chỗ: toast và thanh). Thống nhất theo E149 (Message List No.114) (Ghi chú xác nhận H8)"]},
    {"no": "6.1", "ja": "出荷週が締め済（警告）", "vi": "Tuần gửi đã chốt (cảnh báo)", "sel": ".sm-ship .sm-warn", "kind": "label", "trig": "show", "err": ["W122"],
     "detail": ["発送日の出荷週が締め済のとき、登録すると「締め後追加」になり、出荷指示は作成されない。登録はできる。", "Khi tuần gửi của ngày gửi đã 締め済 thì đăng ký sẽ thành 「締め後追加」 và không tạo chỉ thị xuất hàng. Vẫn đăng ký được."],
     "demo_ok": ["コードの文言を W122 に揃える", "Thống nhất câu của code theo W122"]},
    {"no": "6.2", "ja": "発送日が今日より前（エラー）", "vi": "Ngày gửi trước hôm nay (lỗi)", "sel": ".sm-ship .sm-ng", "kind": "label", "trig": "show", "err": ["E147"],
     "detail": ["計算した発送日が今日より前になるとき、納品日の下に E147 を出す。登録できない。", "Khi ngày gửi đã tính trước hôm nay thì hiện E147 dưới ngày giao. Không đăng ký được."],
     "demo_ok": ["コードの文言を E147 に揃える", "Thống nhất câu của code theo E147"]},
    {"no": "6.3", "ja": "ページ上部のエラー", "vi": "Lỗi ở đầu trang", "sel": ".sm-ng", "kind": "label", "trig": "show", "pattern": "P-FORMBOX",
     "detail": ["入力エラーが1つ以上あるとき、「保存できません（n件）。赤い項目を確認してください」の1行を出す。各項目の下に、その項目の文言を出す。", "Khi có từ 1 lỗi nhập trở lên thì hiện 1 dòng 「Không thể lưu (n lỗi). Hãy kiểm tra các mục màu đỏ」. Dưới mỗi mục hiện câu của mục đó."],
     "demo_ok": ["コードはトースト＋上部の1行（入力内容を確認してください）。項目の下のインラインのエラーに揃える（確認メモ H2）", "Code là toast + 1 dòng ở trên (Hãy kiểm tra nội dung nhập). Thống nhất theo lỗi inline dưới từng mục (Ghi chú xác nhận H2)"]},
]
LEAVE = [
    {"no": "7", "ja": "入力中に離れる確認", "vi": "Xác nhận khi rời trang đang nhập", "sel": ".ov .modal", "kind": "modal", "trig": "show", "err": ["Q02"],
     "demo_ok": ["コードの本文・ボタンを Q02 に揃える", "Thống nhất nội dung・nút của code theo Q02"]},
]

# ---------------------------------------------------------------- 詳細（AW_SMP_003）
D_HEAD = [
    {"no": "1", "ja": "ヘッダー", "vi": "Đầu trang", "sel": ".ph", "kind": "area", "trig": "view",
     "detail": ["パンくず：発注・入荷 ＞ 営業サンプル（押すと一覧へ）＞ 詳細。見出しに「サンプル詳細」・サンプルNo・状態のバッジ。一覧（AW_SMP_001）でサンプルNo を押すと開く。URL は /ops/purchasing/samples/サンプルNo。読むだけの画面で、直せるのはメモと送り状番号だけ（宛先・商品・納品日・配送ルートは直せない。誤りは取消して登録し直す）。", "Breadcrumb: Đặt hàng・Nhập hàng ＞ Mẫu kinh doanh (bấm để về danh sách) ＞ Chi tiết. Tiêu đề 「サンプル詳細」 kèm số mẫu và badge trạng thái. Mở bằng cách bấm Số mẫu ở danh sách (AW_SMP_001). URL là /ops/purchasing/samples/số-mẫu. Là màn chỉ đọc, chỉ sửa được ghi chú và số vận đơn (không sửa địa chỉ nhận・sản phẩm・ngày giao・tuyến giao hàng; nếu sai thì hủy rồi đăng ký lại)."]},
    {"no": "1.1", "ja": "一覧へ戻る", "vi": "Về danh sách", "sel": ".ph .btns button::一覧へ戻る", "kind": "button", "trig": "click",
     "detail": ["営業サンプル一覧（AW_SMP_001）へ戻る。", "Quay về danh sách mẫu kinh doanh (AW_SMP_001)."]},
    {"no": "1.2", "ja": "メモ・送り状番号を編集", "vi": "Sửa ghi chú・số vận đơn", "sel": ".ph .btns button::メモ・送り状番号を編集", "kind": "button", "trig": "click",
     "cond": ["営業サンプルの更新権限があるとき（一覧の「メモ・送り状番号」と同じ）。ないときは出さない", "Khi có quyền cập nhật mẫu kinh doanh (giống nút 「メモ・送り状番号」 ở danh sách). Không có quyền thì không hiện"],
     "detail": ["一覧と同じ「メモ・送り状番号」のモーダル（AW_SMP_001 No.8）を開く。保存すると、この画面の送り状番号・メモ・変更履歴が新しくなる。", "Mở cùng modal 「メモ・送り状番号」 như ở danh sách (AW_SMP_001 No.8). Sau khi lưu, số vận đơn・ghi chú・lịch sử thay đổi trên màn này được cập nhật."]},
    {"no": "1.3", "ja": "取消", "vi": "Hủy", "sel": "-", "kind": "button", "trig": "click", "err": ["E151"],
     "cond": ["営業サンプルの更新権限があるとき。受付済：いつでも／締め済・締め後追加：そのサンプルの発送日の前日 23:59（日本時間）まで／発送日以降と取消済は出さない（AW_SMP_001 No.5.14 と同じ）", "Khi có quyền cập nhật mẫu kinh doanh. 受付済: bất cứ lúc nào / 締め済・締め後追加: đến 23:59 (giờ Nhật Bản) ngày trước ngày gửi của chính mẫu đó / Từ ngày gửi trở đi và mẫu đã hủy thì không hiện (giống AW_SMP_001 No.5.14)"],
     "detail": ["取消の確認のモーダル（AW_SMP_001 No.9）を開く。取り消すと状態は「取消」になる。", "Mở modal xác nhận hủy (AW_SMP_001 No.9). Sau khi hủy, trạng thái thành 「取消」."],
     "demo_ok": ["コードには取消の処理（cancelSample）がまだなく、ボタンは出していない。一覧の取消（AW_SMP_001 No.5.14）を作るとき、同じ処理を詳細にも置く", "Code chưa có xử lý hủy (cancelSample) nên chưa hiện nút. Khi làm hủy ở danh sách (AW_SMP_001 No.5.14) sẽ đặt cùng xử lý này ở màn chi tiết"]},
]
D_BASIC = [
    {"no": "2", "ja": "基本情報", "vi": "Thông tin cơ bản", "sel": ".card:has(.kv)", "kind": "area", "trig": "view",
     "detail": ["サンプルNo・受付日・登録者・状態。読むだけ。", "Số mẫu・ngày tiếp nhận・người đăng ký・trạng thái. Chỉ đọc."]},
    {"no": "2.1", "ja": "サンプルNo", "vi": "Số mẫu", "sel": ".kv::サンプルNo", "kind": "label", "trig": "view",
     "detail": ["SM-YYMM-NNN（枝番は付けない）。", "SM-YYMM-NNN (không có số nhánh)."]},
    {"no": "2.2", "ja": "受付日", "vi": "Ngày tiếp nhận", "sel": ".kv::受付日", "kind": "label", "trig": "view", "detail": ["yyyy-mm-dd。登録した日。", "yyyy-mm-dd. Ngày đăng ký."]},
    {"no": "2.3", "ja": "登録者", "vi": "Người đăng ký", "sel": ".kv::登録者", "kind": "label", "trig": "view",
     "detail": ["そのサンプルを登録した運営のアカウント名。登録後に変わらない。", "Tên tài khoản vận hành đã đăng ký mẫu đó. Không đổi sau khi đăng ký."], "ex": ["にっしぐち（運営）", "Tên tài khoản vận hành, hệ thống tự ghi"]},
    {"no": "2.4", "ja": "状態", "vi": "Trạng thái", "sel": ".kv::状態", "kind": "label", "trig": "view", "pattern": "P-STATUS-COLORS",
     "detail": ["受付済（青）／締め済（緑）／締め後追加（黄）／取消（灰）。意味は AW_SMP_001 No.5.10 と同じ。見出しのバッジと同じ状態。", "受付済 (xanh dương) / 締め済 (xanh lá) / 締め後追加 (vàng) / 取消 (xám). Ý nghĩa giống AW_SMP_001 No.5.10. Cùng trạng thái với badge ở tiêu đề."]},
]
D_DEST = [
    {"no": "3", "ja": "宛先", "vi": "Địa chỉ nhận", "sel": ".card:has(.kv)::法人名", "kind": "area", "trig": "view",
     "detail": ["サンプルを送る先。法人・拠点・契約とはつながない（文字だけ）。", "Nơi nhận mẫu. Không liên kết với công ty・chi nhánh・hợp đồng (chỉ hiện chữ)."]},
    {"no": "3.1", "ja": "法人名", "vi": "Tên công ty", "sel": ".kv::法人名", "kind": "label", "trig": "view", "detail": ["受け取る会社の名前。", "Tên công ty nhận hàng."]},
    {"no": "3.2", "ja": "担当者", "vi": "Người phụ trách", "sel": ".kv::担当者", "kind": "label", "trig": "view", "detail": ["先方の担当者名。", "Tên người phụ trách phía khách."]},
    {"no": "3.3", "ja": "電話番号", "vi": "Số điện thoại", "sel": ".kv::電話番号", "kind": "label", "trig": "view", "detail": ["先方の電話番号。", "Số điện thoại phía khách."]},
    {"no": "3.4", "ja": "郵便番号", "vi": "Mã bưu điện", "sel": ".kv::郵便番号", "kind": "label", "trig": "view", "detail": ["先方の郵便番号。", "Mã bưu điện phía khách."]},
    {"no": "3.5", "ja": "住所", "vi": "Địa chỉ", "sel": ".kv::住所", "kind": "label", "trig": "view", "detail": ["都道府県＋市区町村＋町名・番地（＋建物名）をつなげて出す。", "Nối tỉnh/thành + quận/huyện + phường/số nhà (+ tên tòa nhà)."]},
]
D_ITEMS = [
    {"no": "4", "ja": "商品と数量", "vi": "Sản phẩm và số lượng", "sel": ".tbl::数量", "kind": "table", "trig": "view",
     "detail": ["送る商品ごとに 品番・商品名・数量を1行ずつ出し、最後の行に数量の合計を出す。一覧の「商品」「数量」の元の内容。", "Mỗi sản phẩm gửi hiện một dòng: mã hàng・tên sản phẩm・số lượng, dòng cuối là tổng số lượng. Là nội dung gốc của cột 「商品」「数量」 ở danh sách."]},
]
D_ROUTE = [
    {"no": "5", "ja": "配送ルートと日程", "vi": "Tuyến giao hàng và lịch", "sel": ".card:has(.kv)::リードタイム", "kind": "area", "trig": "view",
     "detail": ["登録のとき入れた配送ルートと、納品日・発送日。読むだけ（登録後は変わらない）。", "Tuyến giao hàng nhập lúc đăng ký, ngày giao・ngày gửi. Chỉ đọc (không đổi sau khi đăng ký)."]},
    {"no": "5.1", "ja": "ピッキング倉庫", "vi": "Kho picking", "sel": ".kv::ピッキング倉庫", "kind": "label", "trig": "view", "detail": ["配送ルートで指定したピッキング倉庫（関東・関西・中部）。商品ごとではなく宛先ごと。", "Kho picking chỉ định trong tuyến giao hàng (Kanto・Kansai・Chubu). Theo địa chỉ nhận, không theo sản phẩm."]},
    {"no": "5.2", "ja": "配送会社", "vi": "Công ty vận chuyển", "sel": ".kv::配送会社", "kind": "label", "trig": "view", "detail": ["配送ルートの配送会社。", "Công ty vận chuyển của tuyến giao hàng."]},
    {"no": "5.3", "ja": "中継先", "vi": "Điểm trung chuyển", "sel": ".kv::中継先", "kind": "label", "trig": "view", "detail": ["配送ルートの中継先。ないときは「—」。", "Điểm trung chuyển của tuyến giao hàng. Không có thì hiện 「—」."]},
    {"no": "5.4", "ja": "リードタイム", "vi": "Lead time", "sel": ".kv::リードタイム", "kind": "label", "trig": "view", "detail": ["登録のとき運営が入れた日数（0〜30日）。発送日＝納品日−リードタイム。", "Số ngày vận hành nhập lúc đăng ký (0〜30 ngày). Ngày gửi = ngày giao − lead time."]},
    {"no": "5.5", "ja": "納品日", "vi": "Ngày giao", "sel": ".kv::納品日", "kind": "label", "trig": "view", "detail": ["yyyy-mm-dd（曜）。ピッキングできない日で前倒ししたときは、振り替えたあとの日。", "yyyy-mm-dd (thứ). Khi đã dời sớm do ngày không picking được thì là ngày sau khi dời."]},
    {"no": "5.6", "ja": "発送日", "vi": "Ngày gửi", "sel": ".kv::発送日", "kind": "label", "trig": "view",
     "detail": ["yyyy-mm-dd（曜）。前倒ししたときは「前倒し」の黄バッジと「〇〇のため」の理由を並べて出す（マウスを乗せると前倒しの説明の全文）。", "yyyy-mm-dd (thứ). Khi đã dời sớm thì hiện badge vàng 「前倒し」 và lý do 「do 〇〇」 (rê chuột để xem đầy đủ giải thích dời sớm)."]},
    {"no": "5.7", "ja": "出荷週", "vi": "Tuần gửi", "sel": ".kv::出荷週", "kind": "label", "trig": "view", "detail": ["発送日の週（月曜〜日曜）。「MM-DD〜MM-DD（n月サイクル X週）」。", "Tuần của ngày gửi (thứ Hai〜Chủ nhật). 「MM-DD〜MM-DD (chu kỳ tháng n, tuần X)」."]},
]
D_ORDER = [
    {"no": "6", "ja": "出荷指示と送り状", "vi": "Chỉ thị xuất hàng và vận đơn", "sel": ".card:has(.kv)::出荷指示番号", "kind": "area", "trig": "view",
     "detail": ["出荷指示・配送データ・送り状番号・メモ。", "Chỉ thị xuất hàng・dữ liệu giao hàng・số vận đơn・ghi chú."]},
    {"no": "6.1", "ja": "出荷指示番号", "vi": "Số chỉ thị xuất hàng", "sel": ".kv::出荷指示番号", "kind": "label", "trig": "view",
     "detail": ["締め済は「あり（SS-YYMMDD-倉庫の記号）」。受付済は「なし（締めると作成）」、締め後追加は「なし（締め後追加）」。", "締め済 hiện 「Có (SS-YYMMDD-ký hiệu kho)」. 受付済 hiện 「Không (tạo khi chốt)」, 締め後追加 hiện 「Không (thêm sau khi chốt)」."],
     "demo_ok": ["THOMAS 用CSVの再ダウンロードは一覧の出荷指示（AW_SMP_001 No.5.11）の決まりに従う。コードはまだ出していない", "Tải lại CSV cho THOMAS theo quy định của chỉ thị xuất hàng ở danh sách (AW_SMP_001 No.5.11). Code chưa làm"]},
    {"no": "6.2", "ja": "配送データ", "vi": "Dữ liệu giao hàng", "sel": "-", "kind": "label", "trig": "view",
     "open": ["運営D の一覧での見せ方は決まった（AW_DLVR・受付簿 #451。種類「サンプル」・契約・拠点は空）。委託配送先Webでの見せ方が未決（AW_SMP_001 No.7.10）。この画面から配送データ（運営D の詳細）へリンクを置くかは、OW 側が決まってから決める", "Cách hiển thị ở danh sách Vận hành D đã quyết (AW_DLVR・sổ tiếp nhận #451; loại 「サンプル」・hợp đồng và chi nhánh để trống). Cách hiển thị ở Web công ty vận chuyển ủy thác chưa quyết (AW_SMP_001 No.7.10). Việc có đặt link từ màn này tới dữ liệu giao hàng (chi tiết Vận hành D) hay không sẽ quyết sau khi OW được quyết"], "ask": "OW の設計書",
     "detail": ["受付を締めたとき（出荷指示と同時）に作る配送データ（種類「サンプル」・入れたルートつき）への入口。締め済のサンプルに出す。", "Lối vào dữ liệu giao hàng (loại 「サンプル」, kèm tuyến đã nhập) được tạo khi chốt tiếp nhận (cùng chỉ thị xuất hàng). Hiện với mẫu 締め済."],
     "demo_ok": ["コードは配送データを作らないため、この項目はまだ画面に出していない", "Code chưa tạo dữ liệu giao hàng nên mục này chưa hiện trên màn hình"]},
    {"no": "6.3", "ja": "送り状番号", "vi": "Số vận đơn", "sel": ".kv::送り状番号", "kind": "label", "trig": "view",
     "detail": ["出荷後に分かる送り状番号。入れていなければ「—」。「メモ・送り状番号を編集」（1.2）で入れる・直す。", "Số vận đơn biết sau khi xuất hàng. Chưa nhập thì hiện 「—」. Nhập・sửa bằng 「メモ・送り状番号を編集」 (1.2)."],
     "ex": ["123456789012", "Số vận đơn của công ty vận chuyển (chữ số/chữ cái nửa chiều rộng và gạch nối, tối đa 30 ký tự)"]},
    {"no": "6.4", "ja": "メモ", "vi": "Ghi chú", "sel": ".kv::メモ", "kind": "label", "trig": "view",
     "detail": ["登録時のメモ（直したあとは直した内容）。複数行はそのまま改行して出す。なければ「—」。", "Ghi chú lúc đăng ký (sau khi sửa là nội dung đã sửa). Nhiều dòng hiện đúng xuống dòng. Không có thì hiện 「—」."]},
]
D_HIST = [
    {"no": "7", "ja": "変更履歴", "vi": "Lịch sử thay đổi", "sel": ".tbl::変更前", "kind": "table", "trig": "view", "pattern": "P-HIST",
     "detail": ["メモ・送り状番号を直した日時・直した人・項目・変更前→変更後。新しい順（最新が上）。変わった項目だけ1行ずつ。まだ直していないときは「変更履歴はまだありません。」。登録したときの値は出さない。モーダル（AW_SMP_001 No.8.4）と同じ内容。", "Ngày giờ sửa ghi chú・số vận đơn, người sửa, mục, giá trị trước → sau. Mới nhất ở trên. Mỗi mục thay đổi một dòng. Chưa sửa lần nào thì hiện 「変更履歴はまだありません。」. Không hiện giá trị lúc đăng ký. Cùng nội dung với modal (AW_SMP_001 No.8.4)."]},
]
D_NF = [
    {"no": "8", "ja": "サンプルNo が見つからない", "vi": "Không tìm thấy số mẫu", "sel": ".card .empty", "kind": "label", "trig": "show",
     "detail": ["URL のサンプルNo がない（または消えた）とき、詳細の代わりに「サンプルNo「…」は見つかりません。」を出し、「一覧へ戻る」ボタンを置く。", "Khi số mẫu trên URL không tồn tại (hoặc đã mất), thay cho chi tiết hiện 「サンプルNo「…」は見つかりません。」 kèm nút 「一覧へ戻る」."],
     "demo_ok": ["文言は共通メッセージにまだない（宿題）", "Câu này chưa có trong thông báo chung (việc phải làm)"]},
]


def V(id, code, ja, vi, url, items, setup="", note=None, full=True, wait=700):
    return {"id": id, "code": code, "state": [ja, vi], "url": url, "setup": (H + setup) if setup else "", "full": full, "wait": wait, "note": note or ["", ""], "items": items}


U = "/ops/purchasing/samples"
N = "/ops/purchasing/samples/new"
MIZUHO = "{company:'株式会社ミズホ食品',zip:'100-0005',pref:'東京都',city:'千代田区',town:'丸の内1-6-5',bld:'丸の内北口ビル 8F'}"
KANTO_ALL = ("setsel(q('select[aria-label=\"ピッキング倉庫\"]'),'関東倉庫');await sleep(400);setsel(q('#sm-routeCarrier'),'ヤマト運輸');setsel(q('#sm-routeHub'),'ヤマト 渋谷営業所');setv(q('#sm-lead'),'1');await sleep(200);")

VIEWS = [
    V("001", "AW_SMP_001", "初期表示（サンプル一覧タブ）", "Hiển thị ban đầu (tab Danh sách mẫu)", U, L_HEAD + L_QUOTA + L_SEARCH + L_TABLE,
      note=["タブは「サンプル一覧」（初期）と「出荷週の受付」。タブは URL の ?tab=、4つの数字は両タブの上に共通（台帳 F 2026-10-08・受付簿 #325）。コードもこのタブ分けに実装済み（仮置きのカードは外した）。ID は SM-YYMM-NNN（枝番なし）・出荷指示は1倉庫（台帳 F 2026-10-08・受付簿 #329）。決定（hong 2026-10-07）：メモだけ後から直せる／取消（受付済はすぐ・締め済と締め後追加はそのサンプルの発送日の前日 23:59〔日本時間〕まで）／締めは自動（2営業日前）＋手動（手動で締めを取り消した週は自動で締めない）／出荷指示のTHOMAS用CSV。メモ・送り状番号の修正と変更履歴はコードに実装済み。取消・自動締めなどはコード未対応（宿題）。", "Có 2 tab: 「サンプル一覧」 (mặc định) và 「出荷週の受付」. Tab giữ trong URL ?tab=, 4 con số dùng chung phía trên cả hai tab (Sổ cái F 2026-10-08・Sổ tiếp nhận #325). Code đã chia tab và đã bỏ thẻ 「仮置き」. ID là SM-YYMM-NNN (không số nhánh), chỉ thị xuất hàng theo 1 kho (Sổ cái F 2026-10-08・Sổ tiếp nhận #329). Quyết định (hong 2026-10-07): chỉ sửa được ghi chú / hủy (受付済 ngay; 締め済 và 締め後追加 đến 23:59 giờ Nhật Bản ngày trước ngày gửi của mẫu) / chốt tự động + thủ công (tuần đã hủy chốt thủ công thì không tự động chốt) / CSV chỉ thị xuất hàng cho THOMAS. Sửa ghi chú・số vận đơn và lịch sử thay đổi đã làm trong code. Hủy・chốt tự động v.v. code chưa có (việc phải sửa)."]),
    V("002", "AW_SMP_001", "出荷週の受付タブ", "Tab Tiếp nhận theo tuần gửi", U + "?tab=出荷週の受付", [L_QUOTA[-3]] + L_WEEK,
      note=["出荷週ごとの表・受付を締める・自動で締める案内・余りを在庫へ戻す。", "Bảng theo tuần gửi・chốt tiếp nhận・giải thích tự động chốt・trả hàng dư về kho."]),
    V("003", "AW_SMP_001", "0件（検索）", "0 dòng (tìm kiếm)", U, [L_SEARCH[1], L_SEARCH[8], EMPTY[0]],
      setup="setv(q('.filter .search input'),'該当なしの法人');btn('検索',q('.f-act')).click();await sleep(700);"),
    V("004", "AW_SMP_001", "メモ・送り状番号の編集（モーダル）", "Sửa ghi chú・số vận đơn (modal)", U, M_MEMO, full=False,
      setup="btn('メモ・送り状番号',[...document.querySelectorAll('.tbl tbody tr')].find(t=>(t.textContent||'').includes('SM-2610-003-2'))).click();await sleep(700);",
      note=["一覧の行の「メモ・送り状番号」から開く。直せるのはメモと送り状番号だけ。直した内容はモーダルの下の変更履歴に出る（最新が上。台帳 F 2026-10-08・受付簿 #334）。", "Mở từ nút 「メモ・送り状番号」 ở dòng danh sách. Chỉ sửa được ghi chú và số vận đơn. Nội dung đã sửa hiện ở lịch sử thay đổi dưới modal (mới nhất ở trên; Sổ cái F 2026-10-08・Sổ tiếp nhận #334)."]),
    V("005", "AW_SMP_001", "取消の確認（受付済）", "Xác nhận hủy (đã tiếp nhận)", U, M_CANCEL, full=False,
      note=["受付済はすぐ取消せる。コードは未対応のため、画面写真は一覧のまま。", "受付済 hủy được ngay. Code chưa làm nên ảnh vẫn là danh sách."]),
    V("006", "AW_SMP_001", "取消の確認（締め済・発送日の前日まで）", "Xác nhận hủy (đã chốt, đến trước ngày gửi)", U, M_CANCEL[:1] + M_CANCEL[2:], full=False,
      note=["締め済は Q123 に「出荷指示は作成済みです。THOMAS へ変更行のCSVを出力して再登録してください」が付く。締め後追加も取り消せる。期限はそのサンプルの発送日の前日 23:59（日本時間）まで。発送日以降は取消のボタンを押すと E151。コードは未対応。", "締め済: Q123 kèm câu về CSV dòng thay đổi cho THOMAS. 締め後追加 cũng hủy được. Hạn là 23:59 (giờ Nhật Bản) ngày trước ngày gửi của mẫu. Từ ngày gửi trở đi: bấm hủy → E151. Code chưa làm."]),
    V("007", "AW_SMP_001", "受付を締める（確認モーダル）", "Chốt tiếp nhận (modal xác nhận)", U + "?tab=出荷週の受付", M_CLOSE,
      setup="btn('受付を締める',q('.sm-ws')).click();await sleep(700);", full=False),
    V("008", "AW_SMP_002", "初期表示", "Hiển thị ban đầu", N, R_HEAD + R_QUOTA + R_DEST + R_ITEMS[:4] + R_ITEMS[5:] + R_DATE[:3] + R_DATE[4:5],
      note=["宛先の入力・商品・納品日。発送日は納品日を入れると計算する。", "Nhập địa chỉ nhận, sản phẩm, ngày giao. Ngày gửi được tính sau khi nhập ngày giao."]),
    V("009", "AW_SMP_002", "入力エラー（空のまま登録）", "Lỗi nhập (đăng ký khi để trống)", N, [R_MSG[3]] + R_DEST[1:3],
      setup="btn('登録',q('.ph .btns')).click();await sleep(700);"),
    V("010", "AW_SMP_002", "同じ宛先に過去の送付あり（W121）", "Đã từng gửi tới cùng địa chỉ (W121)", N, [R_DEST[9], R_DATE[3]],
      setup="await addr(" + MIZUHO + ");" + KANTO_ALL + "await setd('#sm-deliv','2026-11-18');await sleep(500);",
      note=["法人名＋住所が過去の宛先（株式会社ミズホ食品・丸の内）と同じ。警告と履歴の表を出す。警告だけで止めない（登録はできる）。", "Tên công ty + địa chỉ trùng địa chỉ cũ. Hiện cảnh báo và bảng lịch sử. Vẫn đăng ký được."]),
    V("011", "AW_SMP_002", "配送ルートと取扱外の商品", "Tuyến giao hàng và sản phẩm ngoài kho xử lý", N, [R_DEST[10], R_DEST[11], R_DEST[12], R_DEST[13], R_ITEMS[1], R_ITEMS[4]],
      setup="await addr();setsel(q('select[aria-label=\"ピッキング倉庫\"]'),'中部倉庫');await sleep(400);setsel(q('#sm-routeCarrier'),'ヤマト運輸');await sleep(300);",
      note=["中部倉庫を選ぶと、中部倉庫が扱わない商品は非活性になり理由が出る。ピッキング倉庫は商品ごとではなく宛先ごとに配送ルートで1つ指定し、その倉庫が扱わない商品は非活性にして理由を出す。倉庫が分かれる別便・枝番（-1／-2）は作らない。ルートは登録のたびに都度入れる（台帳 F 2026-10-08・受付簿 #329・#331）。", "Khi chọn kho Chubu, sản phẩm mà kho Chubu không xử lý bị vô hiệu hóa kèm lý do. Kho picking không theo sản phẩm mà chỉ định 1 tuyến cho mỗi địa chỉ nhận; sản phẩm mà kho đó không xử lý thì vô hiệu hóa kèm lý do. Không có giao riêng/số nhánh (-1/-2) khi chia kho. Tuyến nhập tay mỗi lần đăng ký (Sổ cái F 2026-10-08・Sổ tiếp nhận #329."]),
    V("012", "AW_SMP_002", "ピッキングできない日で前倒し（納品日も振替）", "Dời sớm vì ngày không picking được (ngày giao cũng dời)", N, [R_DATE[6], R_DATE[5]],
      setup="await addr();" + KANTO_ALL + "await setd('#sm-deliv','2026-11-27');await sleep(500);",
      note=["リードタイム1日を入れると発送日（11-26）は棚卸しでピッキングできないため、前倒しして納品日も振り替える。", "Khi nhập lead time 1 ngày, ngày gửi (11-26) là ngày kiểm kê không picking được nên dời sớm và dời cả ngày giao."]),
    V("013", "AW_SMP_002", "締め後追加の警告（W122）", "Cảnh báo thêm sau khi chốt (W122)", N, [R_MSG[1]],
      setup="await addr();" + KANTO_ALL + "await setd('#sm-deliv','2026-10-14');await sleep(500);",
      note=["発送日（10-13）の出荷週は締め済。登録すると「締め後追加」になり、出荷指示は作成されない。", "Tuần gửi của ngày gửi (10-13) đã chốt. Đăng ký thì thành 「締め後追加」 và không tạo chỉ thị xuất hàng."]),
    V("014", "AW_SMP_002", "発送日が今日より前（E147）", "Ngày gửi trước hôm nay (E147)", N, [R_DATE[1], R_MSG[2]],
      setup="await addr();" + KANTO_ALL + "await setd('#sm-deliv','2026-10-05');await sleep(500);"),
    V("015", "AW_SMP_002", "入力中に離れる確認（Q02）", "Xác nhận khi rời trang đang nhập (Q02)", N, LEAVE,
      setup="setv(q('#sm-company'),'株式会社テスト食品');await sleep(300);btn('キャンセル',q('.ph .btns')).click();await sleep(600);", full=False),
    V("016", "AW_SMP_002", "月の枠を超える（登録できない）", "Vượt hạn mức tháng (không đăng ký được)", N, [R_HEAD[2], R_MSG[0]],
      setup="await fetch('/api/ops/area/menu/setSmpQuota',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json','x-es-site':'ops'},body:JSON.stringify({args:{ym:'2026-11',n:4}})});"
            "await sleep(4500);await addr();" + KANTO_ALL + "await setd('#sm-deliv','2026-11-18');await sleep(600);",
      note=["撮影用に 2026-11 の枠を4件にして（受付済4件＝残り0件）撮る。撮影のあとデータは見本に戻る。", "Khi chụp đặt hạn mức 2026-11 là 4 (đã tiếp nhận 4 = còn 0). Sau khi chụp dữ liệu trở lại mẫu."]),
    V("017", "AW_SMP_001", "締めの取消の確認（モーダル）", "Xác nhận hủy chốt (modal)", U + "?tab=出荷週の受付", M_REOPEN,
      setup="btn('締めを取り消す',q('.sm-ws')).click();await sleep(700);", full=False,
      note=["締め済の出荷週で、最初の発送日の前日 23:59（日本時間）までのとき「締めを取り消す」を出す。取り消すと締め済を受付済に戻し、出荷指示を取り消す。最初の発送日を過ぎた週はボタンを出さず、理由を表に書く（No.7.9）。台帳 F 2026-10-08・受付簿 #335", "Với tuần đã 締め済 và còn đến 23:59 (giờ Nhật Bản) ngày trước ngày gửi đầu tiên thì hiện nút 「締めを取り消す」. Khi hủy, 締め済 quay về 受付済 và chỉ thị xuất hàng bị hủy. Tuần đã qua ngày gửi đầu tiên thì không hiện nút, ghi lý do trong bảng (No.7.9). Sổ cái F 2026-10-08・Sổ tiếp nhận #335"]),
    V("018", "AW_SMP_002", "数量を一括で変更", "Đổi số lượng hàng loạt", N, [R_ITEMS[5], R_ITEMS[6], R_ITEMS[2]],
      setup="await addr();setv(q('#sm-bulkqty'),'5');await sleep(200);btn('適用').click();await sleep(500);",
      note=["「送る」がオンの商品すべての数量を、入れた数（ここでは5）にそろえる。初期値は各2個。", "Số lượng của mọi sản phẩm đang bật 「送る」 được đặt bằng số đã nhập (ở đây là 5). Giá trị ban đầu là 2 cái mỗi sản phẩm."]),
    V("019", "AW_SMP_003", "詳細 初期表示（締め済・前倒し）", "Chi tiết: hiển thị ban đầu (đã chốt・dời sớm)", U + "/SM-2610-003-2", D_HEAD + D_BASIC + D_DEST + D_ITEMS + D_ROUTE + D_ORDER + D_HIST,
      note=["一覧のサンプルNo から開く。宛先・商品と数量・配送ルート・日程・出荷指示・送り状・メモ・変更履歴を1画面で見る。この見本は前倒し（発送日にバッジと理由）。変更履歴はまだない状態。台帳 F「詳細（閲覧）画面を足す」・受付簿 #337", "Mở từ Số mẫu ở danh sách. Xem trong 1 màn: địa chỉ nhận・sản phẩm và số lượng・tuyến giao hàng・lịch・chỉ thị xuất hàng・vận đơn・ghi chú・lịch sử thay đổi. Mẫu này có dời sớm (ngày gửi kèm badge và lý do). Chưa có lịch sử thay đổi. Sổ cái F 「詳細（閲覧）画面を足す」・Sổ tiếp nhận #337"]),
    V("020", "AW_SMP_003", "詳細 変更履歴あり（送り状番号・メモを直した後）", "Chi tiết: có lịch sử thay đổi (sau khi sửa số vận đơn・ghi chú)", U + "/SM-2610-003-2", [D_ORDER[3], D_ORDER[4], D_HIST[0]],
      setup="await fetch('/api/ops/area/purchasing/updateSample',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json','x-es-site':'ops'},body:JSON.stringify({args:{no:'SM-2610-003-2',memo:'M004 は関東倉庫だけの取り扱いのため、関東・関西の2倉庫から出荷。到着後に先方へ連絡。',trackingNo:'123456789012'}})});await sleep(4500);",
      note=["撮影用に送り状番号とメモを直して（変更履歴が2行）撮る。撮影のあとデータは見本に戻る。", "Khi chụp sửa số vận đơn và ghi chú (lịch sử thay đổi có 2 dòng). Sau khi chụp dữ liệu trở lại mẫu."]),
    V("021", "AW_SMP_003", "詳細 受付済（出荷指示なし）", "Chi tiết: 受付済 (chưa có chỉ thị xuất hàng)", U + "/SM-2611-001", [D_BASIC[4], D_ORDER[1]],
      note=["受付済は出荷指示番号に「なし（締めると作成）」と出る。取消済の表示は、取消の処理（AW_SMP_001 No.5.14）をコードに作るまで撮れない。", "受付済 hiện 「なし（締めると作成）」 ở số chỉ thị xuất hàng. Màn của mẫu đã hủy chưa chụp được cho đến khi làm xử lý hủy (AW_SMP_001 No.5.14) trong code."]),
    V("022", "AW_SMP_003", "詳細 サンプルNo が見つからない", "Chi tiết: không tìm thấy số mẫu", U + "/SM-9999-999", D_NF, full=False),
]
