# -*- coding: utf-8 -*-
"""
画面設計書のデータ：運営管理者Web「資材発注」（AW_MPO）。
元は本物の Web（app/ops/purchasing/materials）。決定は docs/決定台帳.md 「資材の発注」（I・2026-10-07）・F「資材の在庫を直す方法」「資材のしきい値」「運営C2 の操作と権限」「運営C2 の画面の決まり」、受付簿 #310〜#323・#325・#332〜#334（2026-10-08 に納期・入荷状態・補充・タブ分け・一括発注・資材の調整・仕入先の発注方法を反映）。
コードとの違い（demo_ok）：取扱倉庫ごとの納入先・倉庫ごとの目安、しきい値・「在庫不足」の削除、検索条件・ページ送り、発注数・入荷希望日のインラインエラー、月の固定値（MAT_YM）、入荷希望日の初期値。画面のタブ分け（発注／資材の在庫／発注の履歴。?tab=stock／history）は #325 に沿って実装済み。一括発注（#332）・仕入先の発注方法（ESステーション／メール／外部。仕入先マスタの項目・発注表と一括発注の列・外部の注記。#333）・資材の在庫の「調整」（#334。倉庫在庫の「この商品を記録」と同じモーダルを対象＝資材で開く）は実装済み。「調整」モーダルは W123 の警告・区分による増減の固定・トーストをやめる点が未実装（demo_ok）。
2026-10-08（受付簿 #450・#394）：資材便の倉庫＝お客様の拠点の配送区分「資材」のルートのピッキング倉庫。1回の発注は1資材につき1倉庫。目安の「納品までの日数」は資材マスタに持たず、この画面で倉庫と一緒に毎回入れる（初期値7。#394 が #323 を置き換え）。資材の調整の権限は在庫管理（資材）。マイナス在庫は止めず赤字で表示する。
資材発注の詳細（AW_MPO_002・閲覧だけ。URL は /ops/purchasing/materials/<発注番号>）は台帳 F「詳細（閲覧）画面を足す（運営C2）」・受付簿 #337（2026-10-08）に沿って実装済み。
"""

TITLE = ["資材発注（AW_MPO）", "Đặt mua vật tư (AW_MPO)"]
SHEET = ["資材発注", "Đặt mua vật tư (資材発注)"]
BASENAME = "画面設計書_AW_MPO_資材発注"
IMG_PREFIX = "AW_MPO"
OUT_DIR = "AW_MPO_資材発注"
CODE_NOTE = ["画面コード規約：AW＝Admin Web、MPO＝資材発注（Material Purchase Order）", "Quy ước mã màn hình: AW = Admin Web, MPO = Đặt mua vật tư (Material Purchase Order)"]
SITE = "ops"
SYSTEM = {"ja": "運営管理者Web", "vi": "Web quản trị vận hành"}
AUTHOR = "Claude（cloud）／確認：hong"
CREATED = "2026-10-07"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "ops", "loginId": "Ad00010"}

DECISIONS = [
    {"date": "2026-10-07", "target": "AW_MPO_001 No.2", "q": ["資材の在庫を直す方法と、資材の在庫の表をどこに置くか（Q-C2）", "Cách chỉnh tồn kho vật tư và đặt bảng tồn kho vật tư ở đâu (Q-C2)"],
     "a": ["新しい画面は作らない。資材の在庫の表はこの画面に置いたまま（10件ずつ・検索：倉庫・資材・状態）。在庫の直し方は、この画面の「資材の在庫」タブの各行の「調整」で行う（2026-10-08 に置き換え。「在庫の記録」の画面はなくした）", "Không tạo màn hình mới. Bảng tồn kho vật tư giữ nguyên trên màn hình này (10 dòng/trang, tìm kiếm: kho, vật tư, trạng thái). Chỉnh tồn kho thực hiện bằng nút 「調整」 trên từng dòng của tab 「資材の在庫」 trong màn hình này (thay thế ngày 2026-10-08; đã bỏ màn hình 「在庫の記録」)"],
     "src": "hong 回答 2026-10-07（台帳 F・受付簿 #310）"},
    {"date": "2026-10-07", "target": "AW_MPO_001 全体", "q": ["資材のしきい値・「在庫不足」の帯・運営 TOP の警告は要るか（Q-M3）", "Có cần ngưỡng vật tư, dải \"在庫不足\" (thiếu tồn kho) và cảnh báo ở TOP vận hành không (Q-M3)"],
     "a": ["作らない。しきい値・「在庫不足」・警告はやめ、状態は「要発注」／「足りる」だけ", "Không làm. Bỏ ngưỡng, \"在庫不足\" và cảnh báo; trạng thái chỉ có \"要発注\" (cần đặt) / \"足りる\" (đủ)"],
     "src": "hong 回答 2026-10-07（台帳 F・受付簿 #313）"},
    {"date": "2026-10-07", "target": "AW_MPO_001 No.3", "q": ["発注の納入先と目安に使う在庫（Q-M2）", "Nơi giao hàng của đơn đặt và tồn kho dùng cho mức đề xuất (Q-M2)"],
     "a": ["納入先は資材ごとの倉庫（資材マスタの取扱倉庫。ES事務所も倉庫の1つ）。発注の画面で倉庫を選べる（初期値＝取扱倉庫）。目安は倉庫ごと＝（受けて未出荷の資材注文＋直近28日の1日あたり平均×納品までの日数〈資材発注の画面で倉庫と一緒に毎回入れる。初期値7。資材マスタには持たない：2026-10-08〉）−その倉庫の在庫−発注中。ロットに切り上げ。資材は食品のサイクル（A〜D）に属さない", "Nơi giao hàng là kho theo từng vật tư (kho phụ trách trong master vật tư; văn phòng ES cũng là một kho). Có thể chọn kho trên màn hình đặt hàng (mặc định = kho phụ trách). Mức đề xuất tính theo từng kho = (đơn vật tư đã nhận chưa xuất + trung bình 1 ngày của 28 ngày gần nhất × số ngày đến khi giao hàng <nhập mỗi lần ở màn đặt vật tư cùng với kho, mặc định 7, không giữ trong master vật tư: 2026-10-08>) − tồn kho của kho đó − đang đặt. Làm tròn lên theo lô. Vật tư không thuộc chu kỳ thực phẩm (A–D)"],
     "src": "hong 回答 2026-10-07（台帳 I「資材の発注」・受付簿 #319）"},
    {"date": "2026-10-07", "target": "AW_MPO_001 No.2・4", "q": ["資材の在庫表・履歴に検索・ページ送りを付けるか（Q-M1）", "Có thêm tìm kiếm và phân trang cho bảng tồn kho và lịch sử vật tư không (Q-M1)"],
     "a": ["付ける（P-LIST）。在庫表＝検索（倉庫・資材・状態）、履歴＝検索（資材・入荷状態・期間）。履歴の初期の並び＝発注日時の降順。発注表は付けない", "Có thêm (P-LIST). Bảng tồn kho = tìm kiếm (kho, vật tư, trạng thái); lịch sử = tìm kiếm (vật tư, trạng thái nhập hàng, thời gian). Thứ tự ban đầu của lịch sử = ngày giờ đặt giảm dần. Bảng đặt hàng không thêm"],
     "src": "hong 回答 2026-10-07（台帳 F「運営C2 の画面の決まり」・受付簿 #316）"},
    {"date": "2026-10-07", "target": "AW_MPO_001 No.3・5", "q": ["入荷希望日・発注数の入力チェックとエラーの出し方（Q-M4）", "Kiểm tra nhập ngày muốn nhập hàng và số lượng đặt, cách hiển thị lỗi (Q-M4)"],
     "a": ["入荷希望日の初期値＝今日、今日より前は選べない（E145）。発注数はロットの倍数（E144）・0〜999,999。エラーは項目の下に出す（トーストにしない）", "Giá trị ban đầu của ngày muốn nhập hàng = hôm nay, không chọn được ngày trước hôm nay (E145). Số lượng đặt là bội của lô (E144), 0–999,999. Lỗi hiển thị bên dưới mục (không dùng toast)"],
     "src": "hong 回答 2026-10-07（台帳 F「運営C2 の画面の決まり」・受付簿 #316）"},
    {"date": "2026-10-07", "target": "AW_MPO_001 No.1.1", "q": ["CSV出力の内容（Q-M5）", "Nội dung xuất CSV (Q-M5)"],
     "a": ["発注表（資材ごと・目安つき）のまま。履歴は「発注・入荷履歴」（C1）の CSV に任せる", "Giữ nguyên bảng đặt hàng (theo từng vật tư, kèm mức đề xuất). Lịch sử giao cho CSV của \"発注・入荷履歴\" (lịch sử đặt hàng/nhập hàng, C1)"],
     "src": "hong 回答 2026-10-07（台帳 F「運営C2 の画面の決まり」・受付簿 #316）"},
    {"date": "2026-10-07", "target": "AW_MPO_001 全体", "q": ["操作と権限（Q-C4）・デモ専用の説明（Q-C3）", "Thao tác và quyền (Q-C4), phần giải thích chỉ dành cho demo (Q-C3)"],
     "a": ["発注＝発注管理の操作（フル権限・商品開発）。経理・営業・CS・物流・商品管理は閲覧と CSV出力だけ。デモ専用の説明帯は外し、必要な一言（1文）だけ残す", "Đặt hàng = thao tác của quản lý đặt hàng (toàn quyền, phát triển sản phẩm). Kế toán, kinh doanh, CS, logistics, quản lý sản phẩm chỉ xem và xuất CSV. Bỏ dải giải thích chỉ dành cho demo, chỉ giữ lại một câu cần thiết"],
     "src": "hong 回答 2026-10-07（台帳 F「運営C2 の操作と権限」「運営C2 の画面の決まり」）"},
    {"date": "2026-10-08", "target": "AW_MPO_001 No.3.1・3.1.4・3.1.6・3.2・4.2.8", "q": ["発注数の下限・入荷状態・目安の日数・ピッキング倉庫の資材補充（運営C2 の細かい点・O5）", "Giới hạn dưới số lượng đặt, trạng thái nhập hàng, số ngày của mức đề xuất, bổ sung vật tư cho kho picking (chi tiết vận hành C2, O5)"],
     "a": ["数量は共通どおり 0〜999,999（0 は発注しない扱いで発注は通らない）。入荷状態は未入荷／一部入荷／入荷済の3つ（分納に合わせる）。目安の「納品までの日数」は資材マスタに持たず、資材発注の画面で倉庫と一緒に毎回入れる（初期値7。台帳 F「資材の納期（日）」・受付簿 #394 が #323 を置き換え）。仕入先の納期や既定の日数は使わない。ピッキング倉庫の資材は、その倉庫を納入先にして仕入先へ発注して補充する。入荷は運営の手入力で、THOMAS は使わない", "Số lượng theo chuẩn chung 0–999,999 (0 coi như không đặt, không đặt được). Trạng thái nhập hàng có 3 giá trị: 未入荷 / 一部入荷 / 入荷済 (khớp giao từng phần). \"Số ngày đến khi giao hàng\" dùng cho mức đề xuất không giữ trong master vật tư mà nhập mỗi lần ở màn đặt vật tư cùng với kho (mặc định 7; sổ cái F 「資材の納期（日）」・sổ tiếp nhận #394 thay #323), không dùng thời hạn giao của nhà cung cấp hay số ngày mặc định. Vật tư của kho picking được bổ sung bằng cách đặt hàng nhà cung cấp với nơi giao hàng là kho đó. Nhập hàng do vận hành nhập tay, không dùng THOMAS"],
     "src": "hong 回答 2026-10-08（台帳 F「運営C2 の細かい点」「資材の納期（日）」・I「資材の発注」・受付簿 #319〜#323）"},
    {"date": "2026-10-08", "target": "AW_MPO_001 No.7（タブ）・No.1.1", "q": ["資材発注の画面を3つの表の縦並びのままにするか（運営C2 の画面の作り）", "Có giữ màn hình đặt mua vật tư là 3 bảng xếp dọc không (cách dựng màn hình vận hành C2)"],
     "a": ["タブで分ける（P-TAB）：「発注」（初期表示・発注表＝在庫・目安・発注数・「発注する」）／「資材の在庫」（倉庫×資材・検索と10件ずつ）／「発注の履歴」（検索と10件ずつ・発注番号 → C1 の発注詳細）。タブは URL の ?tab=。タブ名に要発注の数を出してよい（例：発注 (3)）。画面コードは AW_MPO_001 のまま、タブは状態（画面イメージ 001〜003）。ヘッダーの CSV出力は「発注」の表", "Chia bằng tab (P-TAB): 「発注」 (hiển thị ban đầu; bảng đặt hàng = tồn kho, mức đề xuất, số lượng đặt, nút 「発注する」) / 「資材の在庫」 (kho × vật tư, tìm kiếm và 10 dòng/trang) / 「発注の履歴」 (tìm kiếm và 10 dòng/trang; số đơn đặt → chi tiết đơn đặt của C1). Tab giữ trong URL ?tab=. Có thể hiện số 要発注 trên tên tab (ví dụ: 発注 (3)). Mã màn hình vẫn là AW_MPO_001, tab là các trạng thái (hình màn hình 001–003). CSV出力 ở header là của bảng 「発注」"],
     "src": "hong 回答 2026-10-08（台帳 F「運営C2 の画面の作り」・受付簿 #325）"},
    {"date": "2026-10-08", "target": "AW_MPO_001 No.8・9・10", "q": ["資材は1件ずつしか発注できないままか／資材の仕入先がシステム外の場合はどうするか（運営C2）", "Vật tư vẫn chỉ đặt được từng mục một sao / nếu nhà cung cấp vật tư nằm ngoài hệ thống thì xử lý thế nào (vận hành C2)"],
     "a": ["複数の資材を選んで一括で発注できる（共通の入荷希望日・資材ごとの数量。発注は資材ごとに1件作る）。資材の仕入先はシステム内（仕入先サイトを使う）の場合も外の場合もあり、仕入先ごとの発注方法（ESステーション／メール／外部）に従う。外部の仕入先にはメールを送らず、運営が代理入力する", "Có thể chọn nhiều vật tư và đặt hàng loạt (một ngày muốn nhập hàng chung, số lượng theo từng vật tư; mỗi vật tư tạo một đơn đặt). Nhà cung cấp vật tư có thể ở trong hệ thống (dùng trang nhà cung cấp) hoặc ngoài hệ thống, theo phương thức đặt hàng của từng nhà cung cấp (ESステーション / メール / 外部). Với nhà cung cấp 外部 không gửi email, vận hành nhập thay"],
     "src": "hong 回答 2026-10-08（台帳 F「資材発注の一括発注と仕入先の発注方法」・I「資材の発注」・受付簿 #332）"},
    {"date": "2026-10-08", "target": "AW_MPO_001 No.2・9.1・10・11〜14", "q": ["資材の在庫を直す手段と、仕入先の発注方法をどこに持つか（運営C2：資材の調整・仕入先の発注方法）", "Cách chỉnh tồn kho vật tư và nơi lưu phương thức đặt hàng của nhà cung cấp (vận hành C2: điều chỉnh vật tư・phương thức đặt hàng của nhà cung cấp)"],
     "a": ["資材の在庫の調整は、資材発注の「資材の在庫」タブの各行の「調整」から、倉庫在庫の詳細の「この商品を記録」と同じモーダルで行う（対象＝資材・倉庫と資材は行のもので固定。区分・日付・増減・数量 0〜999,999・理由）。仕入先マスタに「発注方法」（ESステーション／メール／外部。台帳 I。値がなければ ESステーション）を持ち、資材発注の発注表・一括発注の表に仕入先と一緒に出す。外部の仕入先にはメールを1通も送らず、確認の小窓にその旨（「メールは送りません。運営が代理入力」）を出す", "Điều chỉnh tồn kho vật tư làm ở nút 「調整」 trên từng dòng của tab 「資材の在庫」 trong màn đặt mua vật tư, bằng cùng hộp thoại với 「この商品を記録」 ở chi tiết tồn kho kho (đối tượng = vật tư; kho và vật tư lấy theo dòng và cố định; phân loại・ngày・tăng/giảm・số lượng 0–999,999・lý do). Master nhà cung cấp có mục 「発注方法」 (ESステーション / メール / 外部; sổ cái I; nếu không có giá trị thì là ESステーション), hiển thị cùng nhà cung cấp trong bảng đặt hàng và bảng đặt hàng loạt. Nhà cung cấp 外部 không gửi email nào, hộp thoại xác nhận có ghi chú (「メールは送りません。運営が代理入力」)"],
     "src": "hong 回答 2026-10-08（台帳 F「資材の調整・仕入先の発注方法・サンプルの変更履歴（運営C2）」・受付簿 #333・#334）"},
    {"date": "2026-10-08", "target": "AW_MPO_001 No.4.2.1・AW_MPO_002 全体", "q": ["資材発注の詳細（閲覧）画面を足すか（運営C2）", "Có thêm màn hình chi tiết (chỉ xem) cho đặt mua vật tư không (vận hành C2)"],
     "a": ["足す（AW_MPO_002）。資材の発注1件を見る画面：発注情報・仕入先と発注方法・納入先・数量と金額・仕入先の回答・入荷の状況・変更履歴。発注履歴の発注番号から開く（URL は /ops/purchasing/materials/発注番号）。見るだけで、操作（キャンセルなど）は発注（C1）の決まりに従い、この画面には新しい操作を作らない", "Thêm (AW_MPO_002). Màn hình xem một đơn đặt vật tư: thông tin đặt hàng, nhà cung cấp và phương thức đặt hàng, nơi giao hàng, số lượng và số tiền, phản hồi của nhà cung cấp, tình trạng nhập hàng, lịch sử thay đổi. Mở từ số đơn đặt ở lịch sử đặt hàng (URL là /ops/purchasing/materials/số đơn đặt). Chỉ xem; thao tác (hủy, v.v.) theo quy định đặt hàng (C1), màn hình này không tạo thao tác mới"],
     "src": "hong 回答 2026-10-08（台帳 F「詳細（閲覧）画面を足す（運営C2）」・受付簿 #337）"},
    {"date": "2026-10-08", "target": "AW_MPO_001 No.2.2.5・3.1.4・3.1.6・5.3・8、AW_MATE 取扱倉庫", "q": ["資材便の倉庫と、1回の発注の倉庫（運営C2・確認表 C2-7）", "Kho của chuyến vật tư và kho của mỗi lần đặt hàng (Vận hành C2・bảng xác nhận C2-7)"],
     "a": ["資材便（お客様の資材注文の出荷）の倉庫＝その拠点の配送区分「資材」のルートのピッキング倉庫。その倉庫の資材在庫から引き、倉庫ごとの目安の「受けて未出荷」もその倉庫の分として数える。1回の発注は1資材につき1倉庫（納入先倉庫は1つ。別の倉庫へも発注するときは別の発注にする）。資材マスタの取扱倉庫は発注の納入先の候補で、資材便の倉庫を決めるものではない", "Kho của chuyến vật tư (xuất đơn vật tư của khách) = kho picking của tuyến loại giao hàng 「資材」 của điểm đó. Trừ khỏi tồn kho vật tư của kho đó, và 「đã nhận chưa xuất」 trong mức đề xuất theo từng kho cũng tính phần của kho đó. Mỗi lần đặt hàng chỉ 1 kho cho 1 vật tư (kho nhận hàng là 1; muốn đặt cho kho khác thì đặt đơn khác). Kho xử lý trong master vật tư là ứng viên nơi giao khi đặt hàng, không quyết định kho của chuyến vật tư"],
     "src": "hong 回答 2026-10-08（確認表 C2-7）・台帳 S「資材の注文・資材便の倉庫」・受付簿 #450"},
    {"date": "2026-10-08", "target": "AW_MPO_001 No.3.1・3.1.6・3.1.10", "q": ["発注の目安の「納品までの日数」をどこに持つか（運営C2。台帳 I の「仕入先の納期」→ 資材マスタの納期の整理）", "Số ngày đến khi giao hàng của mức đề xuất đặt ở đâu (Vận hành C2; chỉnh 「thời hạn giao của nhà cung cấp」 ở sổ cái I → thời hạn của master vật tư)"],
     "a": ["資材マスタには持たない（受付簿 #394 が #323 を置き換え済み）。資材発注の画面で倉庫と一緒に毎回入れる（初期値 7）。台帳 I「資材の発注」の目安の式の「納品までの日数」も同じ。仕入先の納期は目安に使わない", "Không giữ trong master vật tư (sổ tiếp nhận #394 đã thay #323). Nhập mỗi lần ở màn đặt vật tư cùng với kho (mặc định 7). 「Số ngày đến khi giao hàng」 trong công thức mức đề xuất ở sổ cái I 「資材の発注」 cũng như vậy. Thời hạn giao của nhà cung cấp không dùng cho mức đề xuất"],
     "src": "hong 回答 2026-10-08（台帳 F「資材の納期（日）」・I「資材の発注」・受付簿 #394）"},
    {"date": "2026-10-08", "target": "AW_MPO_001 No.2.2.7・11・12.7", "q": ["資材の調整でもマイナス在庫を止めないか／調整の権限（運営C2・確認表 C2-8、C2-1）", "Điều chỉnh vật tư có chặn tồn kho âm không / quyền điều chỉnh (Vận hành C2・bảng xác nhận C2-8, C2-1)"],
     "a": ["止めない（在庫より多く減らす調整も登録でき、在庫の表は赤字で表示する。見込みは参考値）。資材の調整の権限は在庫管理（資材）の作成（C）（フル権限・商品管理）", "Không chặn (điều chỉnh giảm nhiều hơn tồn kho vẫn đăng ký được, bảng tồn kho hiển thị chữ đỏ; giá trị tham khảo). Quyền điều chỉnh vật tư là quyền tạo (C) của 在庫管理（資材） (quyền đầy đủ・quản lý sản phẩm)"],
     "src": "hong 回答 2026-10-08（確認表 C2-8・C2-1）・台帳 S・受付簿 #447・#448"},
]
CHANGES = []
HIDE_ALWAYS = []
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [
    {"code": "AW_MPO_001", "ja": "資材発注", "vi": "Đặt mua vật tư (資材発注)"},
    {"code": "AW_MPO_002", "ja": "資材発注の詳細", "vi": "Chi tiết đặt mua vật tư (資材発注の詳細)"},
]

H = (
    "const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));"
    "const setv=(el,v)=>{if(!el)return;const p=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;"
    "Object.getOwnPropertyDescriptor(p,'value').set.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}));};"
    "const btn=(t,root)=>[...(root||document).querySelectorAll('button')].find(b=>(b.textContent||'').trim().includes(t));"
    "const qin=()=>document.querySelector('.tbl input[type=number]');"
)

NO_UI = ["コードにまだない。足す（台帳 F「運営C2 の画面の決まり」・受付簿 #316）", "Code chưa có. Cần bổ sung (sổ cái F \"運営C2 の画面の決まり\", sổ tiếp nhận #316)"]
PERM = "発注管理（フル権限・商品開発）の操作。"
PERM_VI = "Thao tác của quản lý đặt hàng (toàn quyền, phát triển sản phẩm)."

# ---- ヘッダー・全体
HEAD = [
    {"no": "1", "ja": "ヘッダー", "vi": "Header", "sel": ".ph", "kind": "area", "trig": "view",
     "detail": ["パンくず：発注・入荷 ＞ 資材発注。資材は本発注だけ・随時（仮発注なし）。資材の在庫は倉庫ごとに持ち、足りない分を資材ごとの倉庫へ発注する。資材の在庫の直し方は、「資材の在庫」タブの各行の「調整」で行う。見られるのは発注管理を閲覧できる役割（フル権限・商品開発・経理・営業・CS・物流・商品管理）。発注できるのはフル権限・商品開発だけ。", "Breadcrumb: 発注・入荷 ＞ 資材発注. Vật tư chỉ đặt chính thức, bất kỳ lúc nào (không có đặt tạm). Tồn kho vật tư được giữ theo từng kho, phần thiếu đặt về kho của từng vật tư. Chỉnh tồn kho vật tư thực hiện bằng nút 「調整」 trên từng dòng của tab 「資材の在庫」. Vai trò xem được là những vai trò xem được quản lý đặt hàng (toàn quyền, phát triển sản phẩm, kế toán, kinh doanh, CS, logistics, quản lý sản phẩm). Chỉ toàn quyền và phát triển sản phẩm mới đặt hàng được."]},
    {"no": "1.1", "ja": "CSV出力", "vi": "Xuất CSV", "sel": ".ph button::CSV", "kind": "button", "trig": "click", "pattern": "P-CSV-OUT",
     "detail": ["ヘッダーの右（タブの外。どのタブでも出る）。「発注」タブの発注表のとおりの全件（資材ごと）。列：資材ID・資材名・規格・仕入先ID・仕入先名・納入先倉庫・倉庫の在庫・受けて未出荷の資材注文・発注中（未入荷）・単位・ロット・発注の目安・状態。在庫表・履歴は出さない（履歴は「発注・入荷履歴」の CSV）。閲覧できる役割すべてに出す。", "Bên phải header (ngoài tab, tab nào cũng hiển thị). Xuất toàn bộ như bảng đặt hàng của tab 「発注」 (theo từng vật tư). Cột: mã vật tư, tên vật tư, quy cách, mã nhà cung cấp, tên nhà cung cấp, kho nhận hàng, tồn kho của kho, đơn vật tư đã nhận chưa xuất, đang đặt (chưa nhập), đơn vị, lô, mức đặt đề xuất, trạng thái. Không xuất bảng tồn kho và lịch sử (lịch sử dùng CSV của \"発注・入荷履歴\"). Hiển thị cho mọi vai trò xem được."],
     "demo_ok": ["コードの列は「ES事務所の在庫」「今月の資材注文（見込み）」。倉庫ごとの目安（納入先倉庫・倉庫の在庫）に合わせて列を直す（台帳 I 2026-10-07・受付簿 #319）", "Cột trong code là \"ES事務所の在庫\" và \"今月の資材注文（見込み）\". Sửa cột cho khớp mức đề xuất theo từng kho (kho nhận hàng, tồn kho của kho) (sổ cái I 2026-10-07, sổ tiếp nhận #319)"]},
    {"no": "1.2", "ja": "一言の説明", "vi": "Lời giải thích ngắn", "sel": ".card .hint", "kind": "label", "trig": "show",
     "detail": ["「発注」タブの発注表の上に1文だけ：「発注の目安は、倉庫ごとの在庫と受けている資材注文から計算した参考値です。」説明帯（長い説明）は置かない。", "Chỉ một câu phía trên bảng đặt hàng của tab 「発注」: \"発注の目安は、倉庫ごとの在庫と受けている資材注文から計算した参考値です。\" (Mức đặt đề xuất là giá trị tham khảo tính từ tồn kho từng kho và các đơn vật tư đã nhận.) Không đặt dải giải thích dài."],
     "demo_ok": ["コードは長い説明帯（REQ-PO-411・倉庫マスタ WH00004 など）。外して1文にする（台帳 F「運営C2 の画面の決まり」）", "Code có dải giải thích dài (REQ-PO-411, master kho WH00004...). Bỏ đi và chỉ giữ một câu (sổ cái F \"運営C2 の画面の決まり\")"]},
]

# ---- タブ（最後の番号）
TABS = [
    {"no": "7", "ja": "タブ", "vi": "Tab", "sel": ".tabs", "kind": "tab", "trig": "click", "pattern": "P-TAB",
     "detail": ["ヘッダーの下に「発注」（初期表示）／「資材の在庫」／「発注の履歴」の3つ。選んだタブの中身だけを表示する（「発注」＝発注表（No.3）、「資材の在庫」＝在庫の表（No.2）、「発注の履歴」＝履歴の表（No.4））。タブは URL の ?tab= に持ち（例：?tab=stock／?tab=history。「発注」は付けない）、再読み込み・戻るでも同じタブを開く。入力中（発注数など）にタブを変えても入力は消さない。ヘッダーの CSV出力はどのタブでも「発注」の表（No.1.1）。", "Dưới header có 3 tab: 「発注」 (hiển thị ban đầu) / 「資材の在庫」 / 「発注の履歴」. Chỉ hiển thị nội dung của tab đã chọn (「発注」 = bảng đặt hàng (No.3), 「資材の在庫」 = bảng tồn kho (No.2), 「発注の履歴」 = bảng lịch sử (No.4)). Tab giữ trong URL ?tab= (ví dụ: ?tab=stock / ?tab=history; 「発注」 không gắn), tải lại / Back vẫn mở đúng tab. Đổi tab khi đang nhập (số lượng đặt...) không mất nội dung. CSV出力 ở header ở tab nào cũng là của bảng 「発注」 (No.1.1)."],
     },
    {"no": "7.1", "ja": "タブ名の件数", "vi": "Số đếm trên tên tab", "sel": ".tabs button::発注", "kind": "label", "trig": "view", "pattern": "P-TAB",
     "detail": ["「発注」の名前の後ろに、要発注の資材の数を出してよい（例：発注 (3)）。0 のときは数を出さない。", "Có thể hiện số vật tư 要発注 (cần đặt) sau tên 「発注」 (ví dụ: 発注 (3)). Bằng 0 thì không hiện số."],
     },
]

# ---- 資材の在庫表
STOCK = [
    {"no": "2", "ja": "資材の在庫", "vi": "Tồn kho vật tư", "sel": ".card::棚卸し", "kind": "area", "trig": "view", "pattern": "P-LIST",
     "detail": ["倉庫×資材の在庫表。ES事務所とすべてのピッキング倉庫で持つ。在庫＝棚卸しの数＋入荷（入荷登録）−出荷（資材便）±在庫の記録。資材は食品の便と一緒には送らない（資材便）。在庫を直すときは、各行の「調整」（No.11）で記録する。資材便を出す倉庫は、お客様の拠点の配送区分「資材」のルートのピッキング倉庫（2026-10-08）。", "Bảng tồn kho kho × vật tư. Văn phòng ES và tất cả kho picking đều giữ tồn kho. Tồn kho = số kiểm kê + nhập hàng (đăng ký nhập hàng) − xuất hàng (chuyến vật tư) ± ghi nhận tồn kho. Vật tư không gửi chung chuyến với thực phẩm (chuyến vật tư). Khi chỉnh tồn kho, ghi nhận bằng nút 「調整」 (No.11) trên từng dòng. Kho xuất chuyến vật tư là kho picking của tuyến loại giao hàng 「資材」 của điểm của khách (2026-10-08)."],
     "demo_ok": ["コードは1つの表だけで、検索・ページ送りがない。足す（P-LIST）", "Code chỉ có một bảng, không có tìm kiếm và phân trang. Cần bổ sung (P-LIST)"]},
    {"no": "2.1", "ja": "検索条件（在庫）", "vi": "Điều kiện tìm kiếm (tồn kho)", "sel": "-", "kind": "area", "trig": "view", "pattern": "P-LIST",
     "detail": ["倉庫／資材／状態。「検索」か Enter で反映。", "Kho / vật tư / trạng thái. Nhấn \"検索\" (Tìm kiếm) hoặc Enter để áp dụng."], "demo_ok": NO_UI},
    {"no": "2.1.1", "ja": "倉庫", "vi": "Kho", "sel": "-", "kind": "select", "trig": "select", "req": "－",
     "len": ["選択（すべて／ES事務所（資材）／関東倉庫／関西倉庫／中部倉庫）", "Chọn (Tất cả / Văn phòng ES (vật tư) / Kho Kanto / Kho Kansai / Kho Chubu)"], "init": ["すべて", "Tất cả"], "ex": ["関東倉庫", "Tên kho, chọn từ danh sách kho"],
     "detail": ["資材を持つ倉庫（倉庫マスタ。ES事務所も含む）。", "Kho có giữ vật tư (master kho; bao gồm cả văn phòng ES)."], "demo_ok": NO_UI},
    {"no": "2.1.2", "ja": "資材", "vi": "Vật tư", "sel": "-", "kind": "text", "trig": "input", "req": "－",
     "len": "文字列 60", "ex": ["割り箸", "Tên vật tư (đũa dùng một lần), tìm kiếm khớp một phần"], "err": ["E04"],
     "detail": ["資材名・資材ID の部分一致。", "Khớp một phần tên vật tư hoặc mã vật tư."], "demo_ok": NO_UI},
    {"no": "2.1.3", "ja": "状態", "vi": "Trạng thái", "sel": "-", "kind": "select", "trig": "select", "req": "－",
     "len": ["選択（すべて／要発注／足りる）", "Chọn (Tất cả / Cần đặt / Đủ)"], "init": ["すべて", "Tất cả"], "ex": ["要発注", "Trạng thái: 要発注 (cần đặt) hoặc 足りる (đủ)"],
     "detail": ["「要発注」＝その倉庫で、在庫＋発注中が見込み（受けて未出荷＋28日の平均×日数）に足りない。「足りる」はそれ以外。しきい値による「在庫不足」は作らない。", "\"要発注\" (cần đặt) = tại kho đó, tồn kho + đang đặt không đủ so với dự kiến (đã nhận chưa xuất + trung bình 28 ngày × số ngày). \"足りる\" (đủ) là các trường hợp còn lại. Không làm \"在庫不足\" (thiếu tồn kho) theo ngưỡng."], "demo_ok": NO_UI},
    {"no": "2.2", "ja": "在庫の表", "vi": "Bảng tồn kho", "sel": ".tbl::棚卸し", "kind": "table", "trig": "view", "pattern": "P-LIST", "err": ["I01"],
     "detail": ["初期の並びは倉庫マスタの順（ES事務所を含む）→ 資材ID。1ページ 10件（10／20／50）。0件は I01。", "Thứ tự ban đầu theo master kho (bao gồm văn phòng ES) → mã vật tư. 10 dòng/trang (10/20/50). 0 kết quả hiển thị I01."],
     "demo_ok": ["コードはページ送りなし（足す）。しきい値の列と「在庫不足」の状態を外す（台帳 F・受付簿 #313）", "Code không có phân trang (cần bổ sung). Bỏ cột ngưỡng và trạng thái \"在庫不足\" (sổ cái F, sổ tiếp nhận #313)"]},
    {"no": "2.2.1", "ja": "倉庫", "vi": "Kho", "sel": ".tbl th::倉庫", "kind": "label", "trig": "view", "detail": ["倉庫名。", "Tên kho."]},
    {"no": "2.2.2", "ja": "資材", "vi": "Vật tư", "sel": ".tbl th::資材", "kind": "label", "trig": "view", "detail": ["資材名（下に資材ID）。", "Tên vật tư (bên dưới là mã vật tư)."]},
    {"no": "2.2.3", "ja": "棚卸し（日）", "vi": "Kiểm kê (ngày)", "sel": ".tbl th::棚卸し", "kind": "label", "trig": "view", "detail": ["最後に取り込んだ棚卸しの数（下にその日付 yyyy-mm-dd）。", "Số kiểm kê được nhập gần nhất (bên dưới là ngày đó, yyyy-mm-dd)."]},
    {"no": "2.2.4", "ja": "入荷", "vi": "Nhập hàng", "sel": ".tbl th::入荷", "kind": "label", "trig": "view", "detail": ["棚卸し以降の入荷（入荷登録）の合計。なければ「—」。", "Tổng nhập hàng (đăng ký nhập hàng) kể từ lần kiểm kê. Không có thì hiển thị \"—\"."]},
    {"no": "2.2.5", "ja": "出荷（資材便）", "vi": "Xuất hàng (chuyến vật tư)", "sel": ".tbl th::出荷（資材便）", "kind": "label", "trig": "view", "detail": ["棚卸し以降の資材便の出荷の合計。なければ「—」。資材便を出す倉庫は、お客様の拠点の配送区分「資材」のルートのピッキング倉庫で、その倉庫の在庫から引く（2026-10-08）。", "Tổng xuất hàng của chuyến vật tư kể từ lần kiểm kê. Không có thì hiển thị \"—\". Kho xuất chuyến vật tư là kho picking của tuyến loại giao hàng 「資材」 của điểm của khách, trừ khỏi tồn kho của kho đó (2026-10-08)."]},
    {"no": "2.2.6", "ja": "記録", "vi": "Ghi nhận", "sel": ".tbl th::記録", "kind": "label", "trig": "view", "detail": ["「在庫の記録」の増減の合計（＋／−）。なければ「—」。", "Tổng tăng/giảm trong \"在庫の記録\" (ghi nhận tồn kho) (＋/−). Không có thì hiển thị \"—\"."]},
    {"no": "2.2.7", "ja": "在庫", "vi": "Tồn kho", "sel": ".tbl th::在庫", "kind": "label", "trig": "view", "detail": ["棚卸し＋入荷−出荷±記録。太字。マイナスになっても止めず、赤字で表示する（2026-10-08）。", "Kiểm kê + nhập hàng − xuất hàng ± ghi nhận. In đậm. Dù bị âm cũng không chặn, hiển thị chữ đỏ (2026-10-08)."]},
    {"no": "2.2.8", "ja": "入荷予定", "vi": "Dự kiến nhập", "sel": ".tbl th::入荷予定", "kind": "label", "trig": "view", "detail": ["発注済みでまだ入荷していない数。なければ「—」。", "Số lượng đã đặt nhưng chưa nhập hàng. Không có thì hiển thị \"—\"."]},
    {"no": "2.2.9", "ja": "状態", "vi": "Trạng thái", "sel": ".tbl th::状態", "kind": "label", "trig": "view", "detail": ["「要発注」（赤）／「足りる」（緑）の2つだけ。", "Chỉ có 2 giá trị: \"要発注\" (cần đặt, đỏ) / \"足りる\" (đủ, xanh lá)."],
     "demo_ok": ["コードは「在庫不足」（しきい値）／「足りる」。「要発注」／「足りる」に直す（台帳 F・受付簿 #313）", "Code là \"在庫不足\" (ngưỡng) / \"足りる\". Sửa thành \"要発注\" / \"足りる\" (sổ cái F, sổ tiếp nhận #313)"]},
    {"no": "2.3", "ja": "ページ送り（在庫）", "vi": "Phân trang (tồn kho)", "sel": "-", "kind": "area", "trig": "view", "pattern": "P-LIST",
     "detail": ["「n件中 a–b件」・ページ番号・表示件数（10／20／50）。", "\"n件中 a–b件\" (a–b trong n kết quả), số trang, số dòng hiển thị (10/20/50)."], "demo_ok": NO_UI},
]

# ---- 発注表
ORDER_TBL = [
    {"no": "3", "ja": "資材の発注", "vi": "Đặt mua vật tư", "sel": ".card::資材ID", "kind": "area", "trig": "view",
     "detail": ["本発注だけ・随時（仮発注なし）。資材は食品のサイクル（A〜D）に属さない。資材ごとに1行。納入先は資材ごとの倉庫（資材マスタの取扱倉庫。ES事務所も倉庫の1つ）で、初期値は取扱倉庫、行ごとに変えられる。在庫・目安は選んだ倉庫の数。検索・ページ送りは付けない（資材の数だけで少ない）。発注できるのは" + PERM, "Chỉ đặt chính thức, bất kỳ lúc nào (không có đặt tạm). Vật tư không thuộc chu kỳ thực phẩm (A–D). Mỗi vật tư một dòng. Nơi giao hàng là kho theo từng vật tư (kho phụ trách trong master vật tư; văn phòng ES cũng là một kho), mặc định là kho phụ trách, có thể đổi theo từng dòng. Tồn kho và mức đề xuất là số của kho đã chọn. Không có tìm kiếm và phân trang (chỉ có ít vật tư). Người đặt hàng được là" + PERM_VI]},
    {"no": "3.1", "ja": "発注の表", "vi": "Bảng đặt hàng", "sel": ".tbl::資材ID", "kind": "table", "trig": "view", "err": ["I01"],
     "detail": ["並びは資材ID の昇順。0件は I01。目安＝（受けて未出荷の資材注文＋直近28日の1日あたり平均×納品までの日数〈3.1.10。資材マスタには持たない〉）−その倉庫の在庫−発注中を、ロットに切り上げた数（0以上）。", "Sắp xếp theo mã vật tư tăng dần. 0 kết quả hiển thị I01. Mức đề xuất = (đơn vật tư đã nhận chưa xuất + trung bình 1 ngày của 28 ngày gần nhất × số ngày đến khi giao hàng <3.1.10; không giữ trong master vật tư>) − tồn kho của kho đó − đang đặt, làm tròn lên theo lô (từ 0 trở lên)."],
     "demo_ok": ["コードの目安は「今月の資材注文（見込み。月は MAT_YM＝2026-10 の固定値）−ES事務所の在庫−発注中」で倉庫ごとではない。倉庫ごと・28日平均に直す（台帳 I 2026-10-07・受付簿 #319）", "Mức đề xuất trong code là \"đơn vật tư tháng này (dự kiến; tháng là giá trị cố định MAT_YM = 2026-10) − tồn kho văn phòng ES − đang đặt\", không theo từng kho. Sửa thành theo từng kho và trung bình 28 ngày (sổ cái I 2026-10-07, sổ tiếp nhận #319)"]},
    {"no": "3.1.1", "ja": "資材ID", "vi": "Mã vật tư", "sel": ".tbl th::資材ID", "kind": "label", "trig": "view", "detail": ["資材マスタの ID（S001 など）。", "ID trong master vật tư (như S001)."]},
    {"no": "3.1.2", "ja": "資材名", "vi": "Tên vật tư", "sel": ".tbl th::資材名", "kind": "label", "trig": "view", "detail": ["資材名（下に規格）。", "Tên vật tư (bên dưới là quy cách)."]},
    {"no": "3.1.3", "ja": "仕入先", "vi": "Nhà cung cấp", "sel": ".tbl th::仕入先（発注方法）", "kind": "label", "trig": "view", "detail": ["資材マスタの仕入先名。名前の下に、その仕入先の発注方法（ESステーション／メール／外部。仕入先マスタ。No.10）を小さく添える。", "Tên nhà cung cấp trong master vật tư. Bên dưới tên có chữ nhỏ ghi phương thức đặt hàng của nhà cung cấp đó (ESステーション / メール / 外部; master nhà cung cấp; No.10)."]},
    {"no": "3.1.4", "ja": "納入先倉庫", "vi": "Kho nhận hàng", "sel": "-", "kind": "select", "trig": "select", "req": "○",
     "len": ["選択（取扱倉庫の中から）", "Chọn (trong các kho phụ trách)"], "init": ["資材マスタの取扱倉庫", "Kho phụ trách trong master vật tư"], "ex": ["関東倉庫", "Tên kho, chọn từ danh sách kho"], "err": ["E01"],
     "detail": ["発注の納入先。資材ごとに取扱倉庫が初期値。ES事務所も選べる。選び直すと、その行の「倉庫の在庫」「受けて未出荷」「発注中」「目安」「状態」がその倉庫の数に変わる。確認の小窓の「納入先」と発注番号の納入先になる。ピッキング倉庫の資材は、その倉庫を納入先にして仕入先へ発注して補充する。1回の発注は1資材につき1倉庫（1つの発注を複数の倉庫に分けない。別の倉庫へも発注するときは別の発注にする。2026-10-08）。", "Nơi giao hàng của đơn đặt. Mặc định là kho phụ trách của từng vật tư. Có thể chọn cả văn phòng ES. Khi chọn lại, các cột \"倉庫の在庫\", \"受けて未出荷\", \"発注中\", \"目安\", \"状態\" của dòng đó đổi sang số của kho đó. Trở thành \"納入先\" trong hộp thoại xác nhận và nơi giao hàng của số đơn đặt. Kho picking bổ sung vật tư bằng cách đặt hàng nhà cung cấp với nơi giao hàng là chính kho đó. Mỗi lần đặt hàng chỉ 1 kho cho 1 vật tư (không chia một đơn đặt cho nhiều kho; muốn đặt cho kho khác thì đặt đơn khác; 2026-10-08)."],
         "demo_ok": ["コードは納入先が ES事務所（資材）固定で、列もない。資材マスタに取扱倉庫（運営H）を足したあとで、行ごとの選択に直す（台帳 I 2026-10-07・受付簿 #319）", "Code cố định nơi giao hàng là văn phòng ES (vật tư) và không có cột này. Sau khi thêm kho phụ trách (vận hành H) vào master vật tư, sửa thành chọn theo từng dòng (sổ cái I 2026-10-07, sổ tiếp nhận #319)"]},
    {"no": "3.1.5", "ja": "倉庫の在庫", "vi": "Tồn kho của kho", "sel": ".tbl th::ES事務所の在庫", "kind": "label", "trig": "view",
     "detail": ["選んだ納入先倉庫の資材の在庫（資材の単位つき）。", "Tồn kho vật tư của kho nhận hàng đã chọn (kèm đơn vị của vật tư)."],
     "demo_ok": ["コードの見出しは「ES事務所の在庫」でES事務所の数だけ。倉庫ごとにする", "Tiêu đề trong code là \"ES事務所の在庫\" và chỉ có số của văn phòng ES. Sửa thành theo từng kho"]},
    {"no": "3.1.6", "ja": "受けて未出荷の資材注文", "vi": "Đơn vật tư đã nhận chưa xuất", "sel": ".tbl th::今月の資材注文", "kind": "label", "trig": "view",
     "detail": ["お客様から受けた資材の注文のうち、その倉庫からまだ出していない数（資材便の倉庫＝お客様の拠点の配送区分「資材」のルートのピッキング倉庫。2026-10-08）。目安の計算に使う（28日の平均×「納品までの日数」〈3.1.10〉も加える）。", "Trong các đơn vật tư nhận từ khách hàng, số lượng chưa xuất từ kho đó. Dùng để tính mức đề xuất (cộng thêm trung bình 28 ngày × \"số ngày đến khi giao hàng\" (3.1.10)). Kho của chuyến vật tư = kho picking của tuyến loại giao hàng 「資材」 của điểm của khách (2026-10-08)."],
         "demo_ok": ["コードの見出しは「今月の資材注文（見込み）」で月は固定値（MAT_YM）。受けて未出荷＋28日平均に直す（台帳 I 2026-10-07・受付簿 #319）", "Tiêu đề trong code là \"今月の資材注文（見込み）\" và tháng là giá trị cố định (MAT_YM). Sửa thành đã nhận chưa xuất + trung bình 28 ngày (sổ cái I 2026-10-07, sổ tiếp nhận #319)"]},
    {"no": "3.1.7", "ja": "発注中（未入荷）", "vi": "Đang đặt (chưa nhập)", "sel": ".tbl th::発注中", "kind": "label", "trig": "view",
     "detail": ["選んだ倉庫あての発注のうち、まだ入荷していない数（キャンセルは除く）。なければ「—」。", "Trong các đơn đặt gửi tới kho đã chọn, số lượng chưa nhập hàng (trừ đơn đã hủy). Không có thì hiển thị \"—\"."]},
    {"no": "3.1.8", "ja": "状態", "vi": "Trạng thái", "sel": ".tbl th::状態", "kind": "label", "trig": "view",
     "detail": ["「要発注」（赤）＝在庫＋発注中が見込みに足りない。「足りる」（緑）。しきい値・「在庫不足」・警告は作らない。", "\"要発注\" (cần đặt, đỏ) = tồn kho + đang đặt không đủ so với dự kiến. \"足りる\" (đủ, xanh lá). Không làm ngưỡng, \"在庫不足\" và cảnh báo."]},
    {"no": "3.1.9", "ja": "発注の目安", "vi": "Mức đặt đề xuất", "sel": "-", "kind": "label", "trig": "view",
     "detail": ["ロットの倍数（0以上）。発注数の初期値にも入る。", "Bội của lô (từ 0 trở lên). Cũng được điền làm giá trị ban đầu của số lượng đặt."],
     "demo_ok": ["コードは目安の列がなく、発注数の初期値にだけ入れている。列を足す（CSV出力の「発注の目安」と合わせる）", "Code không có cột mức đề xuất, chỉ điền vào giá trị ban đầu của số lượng đặt. Cần thêm cột (khớp với \"発注の目安\" trong xuất CSV)"]},
    {"no": "3.2", "ja": "発注数", "vi": "Số lượng đặt", "sel": ".tbl input[type=number]", "kind": "text", "trig": "input", "req": "○",
     "len": ["数値 0〜999,999（ロットの倍数）", "Số 0–999,999 (bội của lô)"], "init": ["発注の目安（0なら空）", "Mức đặt đề xuất (nếu 0 thì để trống)"], "ex": ["300", "Số lượng đặt, số nguyên là bội của lô"], "err": ["E01", "E12", "E144"],
     "detail": ["右寄せ・単位は資材の単位（膳・本・枚など）。ロットの倍数で入れる（割り箸100膳なら100・200…）。数量の範囲は共通基準どおり 0〜999,999（範囲外は E12）。ただし 0 は「発注しない」の意味で、発注する（3.3）を押しても通らない（空・0 は E01）。範囲外は E12、倍数でないときは E144（{n}＝ロット）。エラーは入力欄の下に出す。全角の数字は半角に直す。発注する小窓へ進む前に行ごとに確認する。", "Căn phải; đơn vị là đơn vị của vật tư (膳, 本, 枚...). Nhập bội của lô (đũa dùng một lần lô 100 膳 thì nhập 100, 200...). Phạm vi số lượng theo chuẩn chung 0–999,999 (ngoài phạm vi là E12), nhưng 0 nghĩa là \"không đặt\": nhấn \"発注する\" (3.3) cũng không đi tiếp (trống hoặc 0 là E01), không phải bội là E144 ({n} = lô). Lỗi hiển thị bên dưới ô nhập. Số toàn-width được đổi sang half-width. Kiểm tra theo từng dòng trước khi sang hộp thoại đặt hàng."],
     "demo_ok": ["コードは入力欄の下ではなくトースト（「発注数を入れてください」「100膳単位で入れてください」）で、0〜999,999 の範囲チェックもない。インラインの E01・E12・E144 に直す（台帳 F「運営C2 の画面の決まり」・受付簿 #316）", "Code không hiển thị lỗi bên dưới ô nhập mà dùng toast (\"発注数を入れてください\", \"100膳単位で入れてください\") và cũng không kiểm tra phạm vi 0–999,999. Sửa thành E01, E12, E144 hiển thị inline (sổ cái F \"運営C2 の画面の決まり\", sổ tiếp nhận #316)"]},
    {"no": "3.3", "ja": "発注する", "vi": "Đặt hàng", "sel": ".tbl td.act button::発注する", "kind": "button", "trig": "click",
     "cond": ["発注管理の発注ができる役割（フル権限・商品開発）だけに出す", "Chỉ hiển thị cho vai trò đặt hàng được trong quản lý đặt hàng (toàn quyền, phát triển sản phẩm)"],
     "detail": ["押すと発注数を確認し（3.2）、通れば「資材の発注（本発注）」の確認の小窓（No.5）を開く。" + PERM, "Khi nhấn sẽ kiểm tra số lượng đặt (3.2), nếu hợp lệ thì mở hộp thoại xác nhận \"資材の発注（本発注）\" (No.5). " + PERM_VI]},
    {"no": "3.1.10", "ja": "納品までの日数", "vi": "Số ngày đến khi giao hàng", "sel": "input[aria-label=\"納品までの日数\"]", "kind": "text", "trig": "input", "req": "○",
     "len": ["整数 0〜365", "Số nguyên 0–365"], "init": ["7", "7"], "ex": ["7", "Số ngày từ lúc đặt đến lúc hàng về, số nguyên"], "err": ["E01", "E14", "E12"],
     "detail": ["発注の目安の計算に使う日数（目安＝受けて未出荷＋直近28日の1日あたり平均×この日数−その倉庫の在庫−発注中）。資材マスタには持たず、発注のたびに倉庫と一緒にここで入れる（初期値 7。台帳 F「資材の納期（日）」・受付簿 #394）。仕入先の納期は使わない。", "Số ngày dùng để tính mức đặt đề xuất (mức đề xuất = đã nhận chưa xuất + trung bình 1 ngày của 28 ngày gần nhất × số ngày này − tồn kho của kho đó − đang đặt). Không giữ trong master vật tư mà nhập ở đây cùng với kho mỗi lần đặt hàng (mặc định 7; sổ cái F 「資材の納期（日）」・sổ tiếp nhận #394). Không dùng thời hạn giao của nhà cung cấp."],
     "valid": ["必須。0〜365 の整数（範囲はコードの値。台帳にはない）。全角の数字は半角に直す。空は E01、数字でないときは E14、範囲外は E12。", "Bắt buộc. Số nguyên 0–365 (phạm vi là giá trị trong code, sổ cái không có). Chuyển toàn-width sang half-width. Trống là E01, không phải số là E14, ngoài phạm vi là E12."],
     "open": ["入れる場所は、表の上に1つ（コードの今の形）か、行（倉庫・資材）ごとか。台帳は「倉庫と一緒に毎回入れる」。範囲 0〜365 もコードの値で、台帳にない", "Chỗ nhập là 1 ô phía trên bảng (dạng hiện tại của code) hay theo từng dòng (kho・vật tư)? Sổ cái ghi 「nhập mỗi lần cùng với kho」. Phạm vi 0–365 cũng là giá trị trong code, sổ cái không có"], "ask": "hong",
     "demo_ok": ["コードに入力欄はあるが、表の上の1つだけで、台帳の「倉庫と一緒に」の形ではない（受付簿 #394 は一部実装）。この設計書に書いていなかったので足した", "Code có ô nhập nhưng chỉ 1 ô phía trên bảng, chưa theo dạng 「cùng với kho」 của sổ cái (sổ tiếp nhận #394 mới làm một phần). Tài liệu thiết kế này chưa ghi nên đã bổ sung"]},
]

# ---- 履歴
HIST = [
    {"no": "4", "ja": "資材の発注の履歴", "vi": "Lịch sử đặt mua vật tư", "sel": ".card::発注日時", "kind": "area", "trig": "view", "pattern": "P-LIST",
     "detail": ["資材の発注の一覧。初期の並びは発注日時の降順。1ページ 10件（10／20／50）。1件の中身は資材発注の詳細（AW_MPO_002）で見る。詳しい処理（仕入先の回答・分納・メール）は「発注・入荷」の発注詳細（C1）で行う。", "Danh sách đặt mua vật tư. Thứ tự ban đầu theo ngày giờ đặt giảm dần. 10 dòng/trang (10/20/50). Nội dung từng đơn xem ở chi tiết đặt mua vật tư (AW_MPO_002). Xử lý chi tiết (phản hồi nhà cung cấp, giao từng phần, email) thực hiện ở chi tiết đơn đặt (C1) của \"発注・入荷\"."],
     "demo_ok": ["コードは全件を並べるだけで、検索・ページ送りがない。足す（P-LIST）", "Code chỉ liệt kê toàn bộ, không có tìm kiếm và phân trang. Cần bổ sung (P-LIST)"]},
    {"no": "4.1", "ja": "検索条件（履歴）", "vi": "Điều kiện tìm kiếm (lịch sử)", "sel": "-", "kind": "area", "trig": "view", "pattern": "P-LIST",
     "detail": ["資材／入荷状態／期間（発注日）。「検索」か Enter で反映。", "Vật tư / trạng thái nhập hàng / thời gian (ngày đặt). Nhấn \"検索\" (Tìm kiếm) hoặc Enter để áp dụng."], "demo_ok": NO_UI},
    {"no": "4.1.1", "ja": "資材", "vi": "Vật tư", "sel": "-", "kind": "text", "trig": "input", "req": "－",
     "len": "文字列 60", "ex": ["割り箸", "Tên vật tư (đũa dùng một lần), tìm kiếm khớp một phần"], "err": ["E04"],
     "detail": ["資材名・資材ID の部分一致。", "Khớp một phần tên vật tư hoặc mã vật tư."], "demo_ok": NO_UI},
    {"no": "4.1.2", "ja": "入荷状態", "vi": "Trạng thái nhập hàng", "sel": "-", "kind": "select", "trig": "select", "req": "－",
     "len": ["選択（すべて／未入荷／一部入荷／入荷済）", "Chọn (Tất cả / Chưa nhập / Nhập một phần / Đã nhập)"], "init": ["すべて", "Tất cả"], "ex": ["未入荷", "Trạng thái nhập hàng: 未入荷 (chưa nhập), 一部入荷 (nhập một phần) hoặc 入荷済 (đã nhập)"],
     "detail": ["発注の入荷の状態。分納の途中は「一部入荷」（C1 の決まり）。", "Trạng thái nhập hàng của đơn đặt. Đang giao từng phần là \"一部入荷\" (nhập một phần) (quy định C1)."], "demo_ok": NO_UI},
    {"no": "4.1.3", "ja": "発注日（から）", "vi": "Ngày đặt (từ)", "sel": "-", "kind": "date", "trig": "input", "req": "－",
     "len": "日付 yyyy-mm-dd", "ex": ["2026-10-01", "Ngày bắt đầu của ngày đặt, dạng yyyy-mm-dd"], "err": ["E01"],
     "detail": ["発注日時の日付の下限。共通の日付の部品。空なら下限なし。", "Cận dưới của ngày trong ngày giờ đặt. Dùng thành phần ngày dùng chung. Để trống thì không có cận dưới."], "demo_ok": NO_UI},
    {"no": "4.1.4", "ja": "発注日（まで）", "vi": "Ngày đặt (đến)", "sel": "-", "kind": "date", "trig": "input", "req": "－",
     "len": "日付 yyyy-mm-dd", "ex": ["2026-10-31", "Ngày kết thúc của ngày đặt, dạng yyyy-mm-dd"], "err": ["E08"],
     "detail": ["発注日時の日付の上限。「から」より前の日は E08。空なら上限なし。", "Cận trên của ngày trong ngày giờ đặt. Ngày trước \"から\" (từ) là E08. Để trống thì không có cận trên."], "demo_ok": NO_UI},
    {"no": "4.2", "ja": "履歴の表", "vi": "Bảng lịch sử", "sel": ".tbl::発注日時", "kind": "table", "trig": "view", "pattern": "P-LIST", "err": ["I01"],
     "detail": ["0件は I01（コードの「まだありません」は I01 に揃える）。", "0 kết quả hiển thị I01 (câu \"まだありません\" trong code được thống nhất thành I01)."],
     "demo_ok": ["コードの0件の文言は「まだありません」。I01 に揃える", "Câu khi 0 kết quả trong code là \"まだありません\". Thống nhất thành I01"]},
    {"no": "4.2.1", "ja": "発注番号", "vi": "Số đơn đặt", "sel": ".tbl td button.lnk", "kind": "link", "trig": "click",
     "detail": ["押すと資材発注の詳細（AW_MPO_002。URL は /ops/purchasing/materials/発注番号）を開く（小窓ではなく別の画面）。一覧へ戻ると「発注の履歴」タブ（?tab=history）に戻る。この画面では状態を持たない。", "Khi nhấn sẽ mở chi tiết đặt mua vật tư (AW_MPO_002; URL là /ops/purchasing/materials/số đơn đặt) — là màn hình riêng, không phải hộp thoại. Quay lại danh sách sẽ về tab 「発注の履歴」 (?tab=history). Màn hình này không giữ trạng thái."]},
    {"no": "4.2.2", "ja": "発注日時", "vi": "Ngày giờ đặt", "sel": ".card:last-child th:nth-child(2)", "kind": "label", "trig": "view", "detail": ["yyyy-mm-dd HH:MM。", "yyyy-mm-dd HH:MM."]},
    {"no": "4.2.3", "ja": "資材名", "vi": "Tên vật tư", "sel": ".card:last-child th:nth-child(3)", "kind": "label", "trig": "view", "detail": ["資材名。", "Tên vật tư."]},
    {"no": "4.2.4", "ja": "数量", "vi": "Số lượng", "sel": ".card:last-child th:nth-child(4)", "kind": "label", "trig": "view", "detail": ["発注した数（単位つき）。右寄せ。", "Số lượng đã đặt (kèm đơn vị). Căn phải."]},
    {"no": "4.2.5", "ja": "納入先", "vi": "Nơi giao hàng", "sel": ".card:last-child th:nth-child(5)", "kind": "label", "trig": "view", "detail": ["発注の納入先倉庫（資材ごとに選んだ倉庫）。", "Kho nhận hàng của đơn đặt (kho đã chọn theo từng vật tư)."],
     "demo_ok": ["コードはES事務所（資材）固定の表示。発注に持たせた倉庫を出す（台帳 I 2026-10-07）", "Code hiển thị cố định văn phòng ES (vật tư). Hiển thị kho đã gắn vào đơn đặt (sổ cái I 2026-10-07)"]},
    {"no": "4.2.6", "ja": "仕入先回答", "vi": "Phản hồi của nhà cung cấp", "sel": ".card:last-child th:nth-child(6)", "kind": "label", "trig": "view", "detail": ["仕入先の回答の状態（バッジ）。", "Trạng thái phản hồi của nhà cung cấp (badge)."]},
    {"no": "4.2.7", "ja": "出荷予定日", "vi": "Ngày dự kiến xuất", "sel": ".card:last-child th:nth-child(7)", "kind": "label", "trig": "view", "detail": ["仕入先が答えた出荷予定日 yyyy-mm-dd。なければ「—」。", "Ngày dự kiến xuất hàng mà nhà cung cấp trả lời, yyyy-mm-dd. Không có thì hiển thị \"—\"."]},
    {"no": "4.2.8", "ja": "入荷", "vi": "Nhập hàng", "sel": ".card:last-child th:nth-child(8)", "kind": "label", "trig": "view", "detail": ["入荷の状態（バッジ：未入荷／一部入荷／入荷済の3つ。分納の途中は一部入荷）と入荷日。入荷は運営が「入荷登録」で手入力する（THOMAS の入荷実績 CSV は使わない）。", "Trạng thái nhập hàng (badge: 3 giá trị 未入荷 chưa nhập / 一部入荷 nhập một phần / 入荷済 đã nhập; đang giao từng phần là 一部入荷) và ngày nhập hàng. Bộ phận vận hành nhập tay nhập hàng bằng \"入荷登録\" (đăng ký nhập hàng) (không dùng CSV thực tích nhập hàng của THOMAS)."]},
    {"no": "4.3", "ja": "ページ送り（履歴）", "vi": "Phân trang (lịch sử)", "sel": "-", "kind": "area", "trig": "view", "pattern": "P-LIST",
     "detail": ["「n件中 a–b件」・ページ番号・表示件数（10／20／50）。", "\"n件中 a–b件\" (a–b trong n kết quả), số trang, số dòng hiển thị (10/20/50)."], "demo_ok": NO_UI},
]

# ---- 確認の小窓
MODAL = [
    {"no": "5", "ja": "資材の発注（本発注）", "vi": "Đặt mua vật tư (đặt chính thức)", "sel": ".mbox", "kind": "modal", "trig": "click",
     "detail": ["発注する（3.3）で開く確認の小窓。内容を見て発注する。仕入先へのメールは発注・入荷（C1）の決まりに従う（発注方法が「外部」なら送らない）。入力が途中のまま閉じるときの確認（Q02）は共通。", "Hộp thoại xác nhận mở bằng \"発注する\" (3.3). Xem nội dung rồi đặt hàng. Email gửi nhà cung cấp theo quy định của 発注・入荷 (C1) (nếu phương thức đặt là \"外部\" thì không gửi). Xác nhận khi đóng lúc đang nhập dở (Q02) dùng chung."]},
    {"no": "5.1", "ja": "資材", "vi": "Vật tư", "sel": ".mbox .kvgrid", "kind": "label", "trig": "view", "detail": ["資材名（資材ID）。", "Tên vật tư (mã vật tư)."]},
    {"no": "5.2", "ja": "数量", "vi": "Số lượng", "sel": ".mbox .kvgrid", "kind": "label", "trig": "view", "detail": ["発注数＋単位（3桁区切り）。", "Số lượng đặt + đơn vị (ngăn cách hàng nghìn)."]},
    {"no": "5.3", "ja": "納入先", "vi": "Nơi giao hàng", "sel": ".mbox .kvgrid", "kind": "label", "trig": "view", "detail": ["発注の表で選んだ納入先倉庫（1回の発注は1資材につき1倉庫）。", "Kho nhận hàng đã chọn ở bảng đặt hàng (mỗi lần đặt hàng chỉ 1 kho cho 1 vật tư)."],
     "demo_ok": ["コードは「納品先」＝ES事務所（資材）固定。選んだ倉庫を出す（台帳 I 2026-10-07・受付簿 #319）", "Code cố định \"納品先\" = văn phòng ES (vật tư). Hiển thị kho đã chọn (sổ cái I 2026-10-07, sổ tiếp nhận #319)"]},
    {"no": "5.4", "ja": "金額（税抜）", "vi": "Số tiền (chưa thuế)", "sel": ".mbox .kvgrid", "kind": "label", "trig": "view", "detail": ["数量×資材マスタの単価。「1,000円」の形で右寄せ。", "Số lượng × đơn giá trong master vật tư. Căn phải, dạng \"1,000円\"."]},
    {"no": "5.5", "ja": "入荷希望日", "vi": "Ngày muốn nhập hàng", "sel": ".mbox .fld input", "kind": "date", "trig": "input", "req": "○",
     "len": "日付 yyyy-mm-dd", "init": ["今日", "Hôm nay"], "ex": ["2026-10-09", "Ngày muốn nhập hàng, dạng yyyy-mm-dd"], "err": ["E01", "E145"],
     "detail": ["共通の日付の部品。初期値は今日。今日より前は選べない（E145）。空は E01。", "Thành phần ngày dùng chung. Giá trị ban đầu là hôm nay. Không chọn được ngày trước hôm nay (E145). Để trống là E01."],
     "demo_ok": ["コードの初期値は今日＋3日で、過去日のチェックはなく、空のとき小窓の下に「入荷希望日を入れてください」と出る（E01 に揃える）。初期値を今日に、E145 を足す（台帳 F「運営C2 の画面の決まり」・受付簿 #316）", "Giá trị ban đầu trong code là hôm nay + 3 ngày, không kiểm tra ngày quá khứ, khi để trống thì dưới hộp thoại hiện \"入荷希望日を入れてください\" (thống nhất thành E01). Đổi giá trị ban đầu thành hôm nay và thêm E145 (sổ cái F \"運営C2 の画面の決まり\", sổ tiếp nhận #316)"]},
    {"no": "5.6", "ja": "戻る", "vi": "Quay lại", "sel": ".mbox button::戻る", "kind": "button", "trig": "click", "detail": ["小窓を閉じて発注の表に戻る（何も作らない）。", "Đóng hộp thoại và quay lại bảng đặt hàng (không tạo gì)."]},
    {"no": "5.7", "ja": "この内容で発注する", "vi": "Đặt hàng với nội dung này", "sel": ".mbox button::この内容で発注する", "kind": "button", "trig": "click", "err": ["S122"],
     "detail": ["発注（本発注）を作る。成功したら小窓を閉じてトースト S122（{発注番号}）を出し、履歴の先頭に出る。発注番号は PO-YYYYMM-資材ID-NN。仕入先へのメールは C1 の決まり。" + PERM, "Tạo đơn đặt (đặt chính thức). Khi thành công thì đóng hộp thoại, hiện toast S122 ({số đơn đặt}) và đơn xuất hiện ở đầu lịch sử. Số đơn đặt là PO-YYYYMM-mã vật tư-NN. Email gửi nhà cung cấp theo quy định C1. " + PERM_VI],
     "demo_ok": ["コードのトーストは「資材を発注しました（…）。仕入先にメールで知らせました」。S122 に揃える（発注方法が「外部」ならメールは送らない）", "Toast trong code là \"資材を発注しました（…）。仕入先にメールで知らせました\". Thống nhất thành S122 (nếu phương thức đặt là \"外部\" thì không gửi email)"]},
]

MODAL_ERR = [
    {**MODAL[0]}, {**MODAL[1]}, {**MODAL[2]}, {**MODAL[3]}, {**MODAL[4]}, {**MODAL[5]}, {**MODAL[6]},
    {"no": "5.8", "ja": "入荷希望日のエラー", "vi": "Lỗi ngày muốn nhập hàng", "sel": ".mbox .emsg", "kind": "label", "trig": "show", "err": ["E01", "E145"],
     "detail": ["入荷希望日の下に出す（E01／E145）。「この内容で発注する」は押しても発注しない。", "Hiển thị bên dưới ngày muốn nhập hàng (E01/E145). Dù nhấn \"この内容で発注する\" cũng không đặt hàng."]},
]

TOAST = {"no": "6", "ja": "発注完了のトースト", "vi": "Toast hoàn tất đặt hàng", "sel": ".toast", "kind": "toast", "trig": "show", "err": ["S122"],
         "detail": ["「資材を発注しました（{発注番号}）。」。右下に出て消える。", "\"資材を発注しました（{発注番号}）。\" (Đã đặt vật tư ({số đơn đặt}).) Hiện ở góc dưới bên phải rồi biến mất."]}

# 発注数エラー（インライン：デモ未対応）
QTY_ERR = [
    {"no": "3.4", "ja": "発注数のエラー", "vi": "Lỗi số lượng đặt", "sel": ".tbl input[type=number]", "kind": "label", "trig": "show", "err": ["E01", "E12", "E144"],
     "detail": ["発注数の下に出す。空・0＝E01、範囲外＝E12、ロットの倍数でない＝E144。確認の小窓は開かない。", "Hiển thị bên dưới số lượng đặt. Trống/0 = E01, ngoài phạm vi = E12, không phải bội của lô = E144. Không mở hộp thoại xác nhận."],
     "demo_ok": ["コードはトースト（「100膳単位で入れてください」など）。インラインに直す（受付簿 #316）", "Code dùng toast (như \"100膳単位で入れてください\"). Sửa thành inline (sổ tiếp nhận #316)"]},
]

# ---- 一括発注（#332・最後の番号）
BULK = [
    {"no": "8", "ja": "一括発注", "vi": "Đặt hàng loạt", "sel": ".card button::選択した資材を発注", "kind": "area", "trig": "view",
     "detail": ["「発注」タブの発注表で複数の資材を選び、まとめて発注する。共通の入荷希望日・資材ごとの数量。発注は資材ごとに1件作る（発注番号も資材ごと）。1回の発注は1資材につき1倉庫（納入先は発注表で選んだ倉庫。2026-10-08）。各行の「発注する」（3.3）も従来どおり使える。" + PERM, "Ở bảng đặt hàng của tab 「発注」, chọn nhiều vật tư rồi đặt cùng lúc. Một ngày muốn nhập hàng chung, số lượng theo từng vật tư. Mỗi vật tư tạo một đơn đặt (số đơn đặt cũng theo từng vật tư). Mỗi đơn chỉ 1 kho cho 1 vật tư (kho nhận hàng là kho đã chọn ở bảng đặt hàng; 2026-10-08). Nút 「発注する」 (3.3) ở từng dòng vẫn dùng như cũ. " + PERM_VI]},
    {"no": "8.1", "ja": "選択のチェックボックス", "vi": "Ô chọn dòng", "sel": ".tbl tbody input[type=checkbox]", "kind": "check", "trig": "click", "req": "－", "init": ["未選択", "Chưa chọn"], "ex": ["選択", "Đã chọn (đánh dấu)"],
     "cond": ["発注管理の発注ができる役割（フル権限・商品開発）だけに出す", "Chỉ hiển thị cho vai trò đặt hàng được trong quản lý đặt hàng (toàn quyền, phát triển sản phẩm)"],
     "detail": ["発注表の各行の左。見出し行のチェックで全行の選択・解除。初期値は未選択。", "Bên trái mỗi dòng của bảng đặt hàng. Ô ở dòng tiêu đề chọn/bỏ chọn tất cả. Giá trị ban đầu là chưa chọn."]},
    {"no": "8.2", "ja": "選択した資材を発注", "vi": "Đặt các vật tư đã chọn", "sel": ".card button::選択した資材を発注", "kind": "button", "trig": "click",
     "cond": ["発注ができる役割だけに出す。1件も選んでいないときは押せない", "Chỉ hiển thị cho vai trò đặt hàng được; chưa chọn dòng nào thì không nhấn được"],
     "detail": ["発注表の上。押すと、選んだ資材の一括発注の確認の小窓（No.9）を開く。数量の初期値は、発注表に入れた数（なければ発注の目安）。" + PERM, "Phía trên bảng đặt hàng. Khi nhấn sẽ mở hộp thoại xác nhận đặt hàng loạt (No.9) cho các vật tư đã chọn. Số lượng ban đầu là số đã nhập ở bảng đặt hàng (nếu chưa có thì mức đặt đề xuất). " + PERM_VI]},
    {"no": "9", "ja": "資材の一括発注（小窓）", "vi": "Đặt mua vật tư hàng loạt (hộp thoại)", "sel": ".mbox", "kind": "modal", "trig": "click",
     "detail": ["選んだ資材を一度に確認して発注する小窓。仕入先へのメールは発注・入荷（C1）の決まりに従う（発注方法が「外部」の仕入先には送らない）。入力が途中のまま閉じるときの確認（Q02）は共通。", "Hộp thoại xác nhận và đặt cùng lúc các vật tư đã chọn. Email gửi nhà cung cấp theo quy định 発注・入荷 (C1) (không gửi cho nhà cung cấp có phương thức đặt là 「外部」). Xác nhận khi đóng lúc đang nhập dở (Q02) dùng chung."]},
    {"no": "9.1", "ja": "選んだ資材の表", "vi": "Bảng vật tư đã chọn", "sel": ".mbox .tbl", "kind": "table", "trig": "view",
     "detail": ["資材（名前とID）・仕入先・数量・金額（税抜）。金額＝数量×資材マスタの単価。仕入先の列は「仕入先（発注方法）」で、仕入先名の下に発注方法（No.10）を添える。", "Vật tư (tên và ID), nhà cung cấp, số lượng, số tiền (chưa thuế) = số lượng × đơn giá trong master vật tư. Cột nhà cung cấp là 「仕入先（発注方法）」, bên dưới tên nhà cung cấp có ghi phương thức đặt hàng (No.10)."]},
    {"no": "9.2", "ja": "数量（一括）", "vi": "Số lượng (hàng loạt)", "sel": ".mbox .tbl input[type=number]", "kind": "text", "trig": "input", "req": "○",
     "len": ["数値 0〜999,999（ロットの倍数）", "Số 0–999,999 (bội của lô)"], "init": ["発注表の数（なければ発注の目安）", "Số ở bảng đặt hàng (nếu chưa có thì mức đặt đề xuất)"], "ex": ["300", "Số lượng đặt, số nguyên là bội của lô"], "err": ["E01", "E12", "E144"],
     "detail": ["資材ごとに直せる。空・0＝E01、範囲外＝E12、ロットの倍数でない＝E144。エラーは行の入力欄の下に出し、1行でもエラーなら1件も発注しない。", "Sửa được theo từng vật tư. Trống/0 = E01, ngoài phạm vi = E12, không phải bội của lô = E144. Lỗi hiển thị bên dưới ô nhập của dòng; chỉ cần một dòng lỗi thì không đặt đơn nào."],
     "demo_ok": ["コードの文言は「発注数を入れてください」「100膳単位で入れてください」「999,999以下で入れてください」（E01・E144・E12 の文言に揃える）", "Câu trong code là 「発注数を入れてください」「100膳単位で入れてください」「999,999以下で入れてください」 (thống nhất theo câu E01, E144, E12)"]},
    {"no": "9.3", "ja": "入荷希望日（共通）", "vi": "Ngày muốn nhập hàng (chung)", "sel": ".mbox .fld input", "kind": "date", "trig": "input", "req": "○",
     "len": "日付 yyyy-mm-dd", "init": ["今日", "Hôm nay"], "ex": ["2026-10-09", "Ngày muốn nhập hàng, dạng yyyy-mm-dd"], "err": ["E01", "E145"],
     "detail": ["全資材共通の1つ。共通の日付の部品。初期値は今日。今日より前は選べない（E145）。空は E01。", "Một ngày dùng chung cho mọi vật tư. Thành phần ngày dùng chung. Giá trị ban đầu là hôm nay. Không chọn được ngày trước hôm nay (E145). Để trống là E01."],
     "demo_ok": ["コードの文言は「入荷希望日を入れてください」「入荷希望日は今日以降を選んでください」（E01・E145 の文言に揃える）", "Câu trong code là 「入荷希望日を入れてください」「入荷希望日は今日以降を選んでください」 (thống nhất theo câu E01, E145)"]},
    {"no": "9.4", "ja": "戻る（一括）", "vi": "Quay lại (hàng loạt)", "sel": ".mbox button::戻る", "kind": "button", "trig": "click", "detail": ["小窓を閉じて発注表に戻る（何も作らない。選択は残る）。", "Đóng hộp thoại và quay lại bảng đặt hàng (không tạo gì, vẫn giữ các dòng đã chọn)."]},
    {"no": "9.5", "ja": "この内容で発注する（一括）", "vi": "Đặt hàng với nội dung này (hàng loạt)", "sel": ".mbox button::この内容で発注する", "kind": "button", "trig": "click", "err": ["S122"],
     "detail": ["選んだ資材ごとに1件ずつ発注（本発注）を作る。成功したら小窓を閉じ、トースト S122（資材の件数と発注番号の一覧）を1回出す。履歴の先頭に件数分の発注が出る。仕入先へのメールは C1 の決まり。" + PERM, "Tạo mỗi vật tư một đơn đặt (đặt chính thức). Khi thành công thì đóng hộp thoại, hiện toast S122 một lần (số vật tư và danh sách số đơn đặt). Số đơn đặt tương ứng xuất hiện ở đầu lịch sử. Email gửi nhà cung cấp theo quy định C1. " + PERM_VI],
     "demo_ok": ["コードのトーストは「資材を◯件発注しました（発注番号…）」。S122 の文言に揃える", "Toast trong code là 「資材を◯件発注しました（発注番号…）」. Thống nhất theo câu S122"]},
    {"no": "9.6", "ja": "一括発注のエラー", "vi": "Lỗi đặt hàng loạt", "sel": ".mbox .emsg", "kind": "label", "trig": "show", "err": ["E01", "E12", "E144", "E145"],
     "detail": ["数量は行の下、入荷希望日は日付の下に出す。1つでもエラーがあれば発注しない（トーストにしない）。", "Số lượng hiển thị dưới dòng, ngày muốn nhập hàng hiển thị dưới ô ngày. Chỉ cần một lỗi thì không đặt hàng (không dùng toast)."]},
    {"no": "10", "ja": "仕入先の発注方法", "vi": "Phương thức đặt hàng của nhà cung cấp", "sel": ".tbl th::仕入先（発注方法）", "kind": "label", "trig": "view",
     "detail": ["資材の仕入先は、システム内（ESステーション＝仕入先サイトで回答）／メール（返信・電話を受けて運営が代理入力）／外部（仕入先の発注システム。運営が代理入力、メールは1通も送らない）のどれか（仕入先ごと。台帳 I・仕様 55 の 6-3）。一括発注でも1件ずつの発注でも、この方法に従う。", "Nhà cung cấp vật tư thuộc một trong: trong hệ thống (ESステーション = trả lời trên trang nhà cung cấp) / email (nhận phản hồi hoặc điện thoại rồi vận hành nhập thay) / 外部 (hệ thống đặt hàng của nhà cung cấp; vận hành nhập thay, không gửi email nào) (theo từng nhà cung cấp; sổ cái I, mục 6-3 của đặc tả 55). Đặt hàng loạt hay từng mục đều theo phương thức này. Hiển thị: cột 「仕入先（発注方法）」 của bảng đặt hàng (3.1.3) và của bảng trong hộp thoại đặt hàng loạt (9.1), cùng cột 「発注方法」 trong CSV xuất. Giá trị lấy từ master nhà cung cấp (No.13); nhà cung cấp chưa có giá trị thì coi là ESステーション."]},
]

# ---- 資材の調整・仕入先の発注方法（#333・#334・最後の番号）
ADJ_PERM = "資材の調整の権限は、在庫管理（資材）の作成（C）（フル権限・商品管理。台帳 F「運営C2 の操作と権限」・受付簿 #447）。現在のコードは「在庫の記録を作る」操作（倉庫在庫と同じ）なので、在庫管理（資材）に直す。"
ADJ_PERM_VI = "Quyền điều chỉnh vật tư là quyền tạo (C) của 在庫管理（資材） (quyền đầy đủ・quản lý sản phẩm; sổ cái F 「運営C2 の操作と権限」・sổ tiếp nhận #447). Code hiện dùng thao tác \"tạo ghi nhận tồn kho\" (giống tồn kho kho) nên cần sửa thành 在庫管理（資材）."
ADJ = [
    {"no": "11", "ja": "調整", "vi": "Điều chỉnh", "sel": ".tbl td.act button::調整", "kind": "button", "trig": "click",
     "cond": ["タブ「資材の在庫」の各行の右端。在庫管理（資材）の作成（C）の権限（フル権限・商品管理）がある役割だけに出す", "Cuối bên phải mỗi dòng của tab 「資材の在庫」. Chỉ hiển thị cho vai trò có quyền tạo (C) của 在庫管理（資材） (toàn quyền・quản lý sản phẩm)"],
     "detail": ["押すと、その行の倉庫と資材が入った状態で調整のモーダル（No.12）を開く。資材の在庫を直す手段はこのボタンだけ（NG品ロス・棚卸し差異・再送・ES外発注の入荷・その他）。" + ADJ_PERM, "Khi nhấn sẽ mở modal điều chỉnh (No.12) với kho và vật tư của dòng đó đã điền sẵn. Đây là cách duy nhất để chỉnh tồn kho vật tư (NG品ロス・棚卸し差異・再送・ES外発注の入荷・その他). " + ADJ_PERM_VI]},
    {"no": "12", "ja": "資材の在庫の調整（モーダル）", "vi": "Điều chỉnh tồn kho vật tư (modal)", "sel": ".mbox", "kind": "modal", "trig": "click", "pattern": "P-FORM", "err": ["S01"],
     "detail": ["「調整」（No.11）で開く。倉庫在庫の詳細の「この商品を記録」（AW_WHS_002 No.5）と同じ作りのモーダルを、資材用に開く（倉庫・資材は行のもので固定表示。「対象」のラジオはない）。1回の登録で記録は1件。登録するとモーダルを閉じ、「資材の在庫」の表の「記録」「在庫」に反映する。キャンセルは入力を捨てて閉じる。登録した記録は直せない・消せない（間違いは区分「その他」で打ち消す記録を足す）。", "Mở bằng 「調整」 (No.11). Cùng kiểu modal với 「この商品を記録」 ở chi tiết tồn kho kho (AW_WHS_002 No.5), mở cho vật tư (kho・vật tư lấy theo dòng và hiển thị cố định; không có radio 「対象」). Mỗi lần đăng ký 1 bản ghi. Khi đăng ký xong đóng modal và phản ánh vào cột 「記録」「在庫」 của bảng 「資材の在庫」. Hủy thì bỏ nội dung nhập rồi đóng. Bản ghi đã đăng ký không sửa/xóa được (nếu sai thì thêm bản ghi bù trừ với phân loại 「その他」)."],
     "demo_ok": ["コードの登録後は S01 ではなく「{記録番号} を記録しました。見込み在庫に反映しました」のトースト。S01 に揃える", "Sau khi đăng ký, code hiện toast 「{記録番号} を記録しました。見込み在庫に反映しました」 thay vì S01. Thống nhất thành S01"]},
    {"no": "12.1", "ja": "対象", "vi": "Đối tượng", "sel": ".mbox .fg .fld:nth-child(1)", "kind": "label", "trig": "view",
     "detail": ["「資材」を固定で表示する（ラジオではない・選べない）。商品の記録は倉庫在庫の詳細で行う。", "Hiển thị cố định 「資材」 (không phải radio, không chọn được). Ghi nhận sản phẩm làm ở chi tiết tồn kho kho."]},
    {"no": "12.2", "ja": "倉庫", "vi": "Kho", "sel": ".mbox .fg .fld:nth-child(2)", "kind": "label", "trig": "view",
     "detail": ["押した行の倉庫（ES事務所（資材）・関東倉庫など）。固定（選べない）。", "Kho của dòng đã nhấn (văn phòng ES (vật tư), kho Kanto, ...). Cố định (không chọn được)."]},
    {"no": "12.3", "ja": "資材", "vi": "Vật tư", "sel": ".mbox .fg .fld:nth-child(3)", "kind": "label", "trig": "view",
     "detail": ["押した行の資材（資材名と資材ID）。固定（選べない）。", "Vật tư của dòng đã nhấn (tên và mã vật tư). Cố định (không chọn được)."]},
    {"no": "12.4", "ja": "区分", "vi": "Phân loại", "sel": "#wm-kind", "kind": "select", "trig": "select", "req": "○",
     "len": ["選択（NG品ロス／棚卸し差異／再送／ES外発注の入荷／その他）", "Chọn (Mất hàng NG / Chênh lệch kiểm kê / Gửi lại / Nhập hàng đặt ngoài ES / Khác)"], "init": ["NG品ロス", "Mất hàng NG"], "ex": ["棚卸し差異", "Chênh lệch kiểm kê"], "err": ["E02"],
     "detail": ["倉庫在庫の「この商品を記録」と同じ選択肢。「在庫戻し」は出さない（出荷指示の作成で自動で記録される。商品だけ）。", "Cùng lựa chọn với 「この商品を記録」 ở tồn kho kho. Không hiện 「在庫戻し」 (tự ghi khi tạo chỉ thị xuất hàng; chỉ cho sản phẩm)."],
     "demo_ok": ["コードの選択肢には「在庫戻し」がある（倉庫在庫の「この商品を記録」と同じ直しが要る。AW_WHS_002 No.5.5）", "Lựa chọn trong code còn 「在庫戻し」 (cần sửa giống 「この商品を記録」 ở tồn kho kho, AW_WHS_002 No.5.5)"]},
    {"no": "12.5", "ja": "日付", "vi": "Ngày", "sel": "#wm-date", "kind": "date", "trig": "input", "req": "○",
     "len": "日付（yyyy-mm-dd）", "init": ["今日", "Hôm nay"], "ex": ["2026-10-05", "Ngày ghi nhận, dạng yyyy-mm-dd"], "err": ["E01", "W123"],
     "detail": ["共通の日付の部品。その倉庫の直近の棚卸し日以前の日付は W123 の警告を出すが、登録はできる（見込み在庫には効かない）。", "Thành phần ngày dùng chung. Ngày trước hoặc bằng ngày kiểm kê gần nhất của kho đó thì hiện cảnh báo W123 nhưng vẫn đăng ký được (không ảnh hưởng tồn kho dự kiến)."],
     "demo_ok": ["コードに W123 の警告がない（黙って登録できる）。倉庫在庫の「この商品を記録」と同じ足し方をする（AW_WHS_002 No.5.6）", "Code chưa có cảnh báo W123 (đăng ký im lặng). Bổ sung giống 「この商品を記録」 ở tồn kho kho (AW_WHS_002 No.5.6)"]},
    {"no": "12.6", "ja": "増減", "vi": "Tăng/giảm", "sel": ".mbox .radios", "kind": "radio", "trig": "select", "req": "○",
     "len": ["選択（増える／減る）", "Chọn (Tăng / Giảm)"], "init": ["減る", "Giảm"], "ex": ["増える", "Tăng"],
     "cond": ["区分が NG品ロス・再送のときは「減る」、ES外発注の入荷のときは「増える」に固定。棚卸し差異・その他のときだけ選べる", "Phân loại NG品ロス・再送 thì cố định 「減る」; ES外発注の入荷 thì cố định 「増える」. Chỉ chọn được khi là 棚卸し差異・その他"],
     "detail": ["在庫がどちらに動くか。", "Tồn kho thay đổi theo hướng nào."],
     "demo_ok": ["コードは区分で自動入力するが、あとで変えられる。固定にする（AW_WHS_002 No.5.7 と同じ）", "Code tự điền theo phân loại nhưng sau đó vẫn đổi được. Cố định (giống AW_WHS_002 No.5.7)"]},
    {"no": "12.7", "ja": "数量", "vi": "Số lượng", "sel": "#wm-qty", "kind": "text", "trig": "input", "req": "○",
     "len": "整数 0〜999,999", "ex": ["100", "Số nguyên, theo đơn vị của vật tư"], "err": ["E01", "E12"],
     "detail": ["資材の単位（膳・本・枚など）で入れる。整数。範囲外は E12、空は E01。エラーは項目の下に出す。在庫より多く減らす数でも止めない（マイナス在庫は「資材の在庫」の表で赤字で表示する。2026-10-08）。", "Nhập theo đơn vị của vật tư (膳・本・枚...). Số nguyên. Ngoài phạm vi là E12, để trống là E01. Lỗi hiển thị bên dưới mục. Dù giảm nhiều hơn tồn kho cũng không chặn (tồn kho âm hiển thị chữ đỏ ở bảng 「資材の在庫」; 2026-10-08)."],
     "demo_ok": ["コードは入力欄の下に「1以上の数を入れてください」「999,999以下で入れてください」を出す（E01・E12 の文言に揃える）。サーバーも 999,999 を超えると受け付けない", "Code hiện 「1以上の数を入れてください」「999,999以下で入れてください」 bên dưới ô nhập (thống nhất theo câu E01・E12). Server cũng từ chối khi vượt 999,999"]},
    {"no": "12.8", "ja": "理由", "vi": "Lý do", "sel": "#wm-reason", "kind": "textarea", "trig": "input", "req": "○",
     "len": ["文字列 500（複数行）", "Chuỗi tối đa 500 ký tự (nhiều dòng)"], "ex": ["棚卸しで割り箸が200膳少なかった", "Lý do ghi nhận (nhiều dòng)"], "err": ["E01", "E04", "E13"],
     "detail": ["記録の理由。空は E01。", "Lý do ghi nhận. Để trống là E01."],
     "demo_ok": ["コードは文字数の確認がない。500文字にする（入力の共通基準）", "Code chưa kiểm tra số ký tự. Giới hạn 500 ký tự (chuẩn nhập liệu chung)"]},
    {"no": "12.9", "ja": "キャンセル", "vi": "Hủy", "sel": ".mbox-f button::キャンセル", "kind": "button", "trig": "click", "detail": ["入力を捨ててモーダルを閉じる。何も登録しない。", "Bỏ nội dung nhập và đóng modal. Không đăng ký gì."]},
    {"no": "12.10", "ja": "登録", "vi": "Đăng ký", "sel": ".mbox-f button::登録", "kind": "button", "trig": "click", "err": ["S01", "E01", "E12", "W123"],
     "detail": ["全項目をまとめてチェックし、エラーは項目の下に出す。問題なければ在庫の記録（対象＝資材）を1件作り、モーダルを閉じる。" + ADJ_PERM, "Kiểm tra tất cả các mục, lỗi hiển thị bên dưới mục. Nếu không có vấn đề thì tạo 1 ghi nhận tồn kho (đối tượng = vật tư) và đóng modal. " + ADJ_PERM_VI],
     "demo_ok": ["コードはエラーを項目の下に加えて「入力内容を確認してください」のトーストも出す。トーストをやめて項目の下だけにする（AW_WHS_002 No.5.11 と同じ）", "Code ngoài lỗi dưới mục còn hiện toast 「入力内容を確認してください」. Bỏ toast, chỉ để lỗi dưới mục (giống AW_WHS_002 No.5.11)"]},
    {"no": "12.11", "ja": "調整のエラー", "vi": "Lỗi điều chỉnh", "sel": ".mbox .emsg", "kind": "label", "trig": "show", "err": ["E01", "E12"],
     "detail": ["数量・理由・日付の下に出す（空は E01、数量の範囲外は E12）。1つでもエラーがあれば登録しない。", "Hiển thị bên dưới số lượng・lý do・ngày (trống là E01, số lượng ngoài phạm vi là E12). Chỉ cần một lỗi thì không đăng ký."]},
    {"no": "12.12", "ja": "棚卸し日以前の警告", "vi": "Cảnh báo ngày trước kiểm kê", "sel": "-", "kind": "label", "trig": "show", "err": ["W123"],
     "detail": ["日付（12.5）がその倉庫・資材の直近の棚卸し日以前のとき、日付の下に W123 を出す（登録はできる）。", "Khi ngày (12.5) trước hoặc bằng ngày kiểm kê gần nhất của kho・vật tư đó, hiện W123 bên dưới ngày (vẫn đăng ký được)."],
     "demo_ok": ["コードにまだない（12.5 参照）。画像は日付を棚卸し日以前にした状態だが、警告は出ない", "Code chưa có (xem 12.5). Ảnh là trạng thái đặt ngày trước ngày kiểm kê nhưng chưa hiện cảnh báo"]},
    {"no": "13", "ja": "仕入先マスタの発注方法", "vi": "Phương thức đặt hàng trong master nhà cung cấp", "sel": "-", "kind": "select", "trig": "select", "req": "○",
     "len": ["選択（ESステーション／メール／外部）", "Chọn (ES Station / Email / Bên ngoài)"], "init": ["ESステーション（値がない仕入先も同じ）", "ES Station (nhà cung cấp chưa có giá trị cũng vậy)"], "ex": ["外部", "Bên ngoài"],
     "detail": ["運営の仕入先マスタ（マスタ管理 ＞ 仕入先マスタ）の項目。一覧の列と絞り込み、詳細・編集（ID・名前・鉛筆で開く）の選択、CSV（「発注方法」の列）で持つ。ESステーション＝仕入先サイトで回答する／メール＝ログインしない仕入先へメールで送り、返信・電話を受けて運営が代理入力／外部＝仕入先の発注システムで受け、運営が代理入力しメールは1通も送らない（台帳 I）。資材の発注表と一括発注（No.10）、商品の発注・入荷（C1）もこの値に従う。承認のあとマスタで決める。", "Mục của master nhà cung cấp phía vận hành (Quản lý master > Master nhà cung cấp). Có ở cột và bộ lọc của danh sách, ô chọn trong chi tiết/chỉnh sửa (mở bằng ID・tên・biểu tượng bút), và CSV (cột 「発注方法」). ESステーション = trả lời trên trang nhà cung cấp / メール = gửi email cho nhà cung cấp không đăng nhập, nhận phản hồi hoặc điện thoại rồi vận hành nhập thay / 外部 = nhận qua hệ thống đặt hàng của nhà cung cấp, vận hành nhập thay và không gửi email nào (sổ cái I). Bảng đặt hàng vật tư và đặt hàng loạt (No.10) và đặt hàng/nhập hàng sản phẩm (C1) cũng theo giá trị này. Quyết định trong master sau khi duyệt."],
     "demo_ok": ["画面の実体は仕入先マスタ（別の画面設計書）。ここでは参照だけ", "Màn hình thực sự là master nhà cung cấp (tài liệu thiết kế màn hình khác). Ở đây chỉ tham chiếu"]},
    {"no": "14", "ja": "外部の仕入先の注記", "vi": "Ghi chú nhà cung cấp 外部", "sel": "-", "kind": "label", "trig": "show",
     "cond": ["選んだ資材の仕入先に発注方法＝外部がいるときだけ", "Chỉ khi nhà cung cấp của vật tư đã chọn có phương thức đặt hàng = 外部"],
     "detail": ["確認の小窓（5・9）に「メールは送りません。運営が代理入力」を出す。発注自体は作る（本発注）が、仕入先へのメールは1通も送らず、回答・出荷報告は運営が代理入力する（C1）。完了のトーストも「メールは送っていません」とする。", "Hiện 「メールは送りません。運営が代理入力」 trong hộp thoại xác nhận (5・9). Đơn đặt (đặt chính thức) vẫn được tạo nhưng không gửi email nào cho nhà cung cấp, phản hồi・báo cáo xuất hàng do vận hành nhập thay (C1). Toast hoàn tất cũng ghi 「メールは送っていません」."],
     "demo_ok": ["見本の資材の仕入先（SP00009）はESステーションのため、画像には出ない（仕入先マスタで外部にすると出る）", "Nhà cung cấp của vật tư mẫu (SP00009) là ESステーション nên không hiện trong ảnh (đổi thành 外部 trong master nhà cung cấp thì hiện)"]},
]

# ---- 資材発注の詳細（AW_MPO_002・閲覧だけ。番号は AW_MPO_001 の続き）
SEC = lambda i, k: f"section.sec:nth-of-type({i}) .kv:nth-child({k})"
DETAIL = [
    {"no": "15", "ja": "ヘッダー（詳細）", "vi": "Header (chi tiết)", "sel": ".ph", "kind": "area", "trig": "view",
     "detail": ["パンくず：発注・入荷 ＞ 資材発注 ＞ 発注詳細（「資材発注」を押すと発注の履歴に戻る）。タイトルは「資材発注の詳細」と発注番号。資材の発注1件を見るだけの画面で、ここに新しい操作は作らない。取消・代理入力などの操作は発注（C1）の決まりに従う。見られるのは発注管理を閲覧できる役割。", "Breadcrumb: 発注・入荷 ＞ 資材発注 ＞ 発注詳細 (nhấn 「資材発注」 sẽ quay về lịch sử đặt hàng). Tiêu đề là 「資材発注の詳細」 và số đơn đặt. Màn hình chỉ để xem một đơn đặt vật tư, không tạo thao tác mới ở đây. Thao tác như hủy, nhập hộ theo quy định đặt hàng (C1). Vai trò xem được là vai trò xem được quản lý đặt hàng."]},
    {"no": "15.1", "ja": "一覧へ戻る", "vi": "Quay lại danh sách", "sel": ".ph button::一覧へ戻る", "kind": "button", "trig": "click",
     "detail": ["ヘッダーの右。押すと資材発注の「発注の履歴」タブ（/ops/purchasing/materials?tab=history）へ戻る。", "Bên phải header. Khi nhấn sẽ quay về tab 「発注の履歴」 của đặt mua vật tư (/ops/purchasing/materials?tab=history)."]},
    {"no": "16", "ja": "発注情報", "vi": "Thông tin đặt hàng", "sel": "section.sec:nth-of-type(1)", "kind": "area", "trig": "view",
     "detail": ["発注1件の基本の項目（16.1〜16.11）。表示だけで、入力はない。見出しの右の矢印で開け閉めできる（共通）。", "Các mục cơ bản của một đơn đặt (16.1–16.11). Chỉ hiển thị, không có nhập liệu. Có thể đóng/mở bằng mũi tên bên phải tiêu đề (dùng chung)."]},
    {"no": "16.1", "ja": "発注番号", "vi": "Số đơn đặt", "sel": SEC(1, 1), "kind": "label", "trig": "view", "detail": ["PO-YYYYMM-資材ID-NN。", "PO-YYYYMM-mã vật tư-NN."]},
    {"no": "16.2", "ja": "発注日時", "vi": "Ngày giờ đặt", "sel": SEC(1, 2), "kind": "label", "trig": "view", "detail": ["yyyy-mm-dd HH:MM。資材は本発注だけなので、本発注した日時。", "yyyy-mm-dd HH:MM. Vật tư chỉ đặt chính thức nên là ngày giờ đặt chính thức."]},
    {"no": "16.3", "ja": "状態（仕入先の回答）", "vi": "Trạng thái (phản hồi của nhà cung cấp)", "sel": SEC(1, 3), "kind": "label", "trig": "view", "detail": ["仕入先の回答の状態（バッジ：納期回答待ち／納期回答済／出荷済／キャンセルなど。発注の履歴の「仕入先回答」と同じ）。", "Trạng thái phản hồi của nhà cung cấp (badge: 納期回答待ち / 納期回答済 / 出荷済 / キャンセル...; giống cột 「仕入先回答」 của lịch sử đặt hàng)."]},
    {"no": "16.4", "ja": "資材", "vi": "Vật tư", "sel": SEC(1, 4), "kind": "label", "trig": "view", "detail": ["資材名。", "Tên vật tư."]},
    {"no": "16.5", "ja": "資材ID", "vi": "Mã vật tư", "sel": SEC(1, 5), "kind": "label", "trig": "view", "detail": ["資材マスタの ID（例：S001）。", "ID trong master vật tư (ví dụ: S001)."]},
    {"no": "16.6", "ja": "規格", "vi": "Quy cách", "sel": SEC(1, 6), "kind": "label", "trig": "view", "detail": ["資材マスタの規格。", "Quy cách trong master vật tư."]},
    {"no": "16.7", "ja": "数量", "vi": "Số lượng", "sel": SEC(1, 7), "kind": "label", "trig": "view", "detail": ["発注した数＋単位（3桁区切り）。", "Số lượng đã đặt + đơn vị (ngăn cách hàng nghìn)."]},
    {"no": "16.8", "ja": "ロット", "vi": "Lô", "sel": SEC(1, 8), "kind": "label", "trig": "view", "detail": ["資材マスタのロット＋単位。数量はロットの倍数。", "Lô trong master vật tư + đơn vị. Số lượng là bội của lô."]},
    {"no": "16.9", "ja": "金額（税抜）", "vi": "Số tiền (chưa thuế)", "sel": SEC(1, 9), "kind": "label", "trig": "view", "detail": ["数量×単価。「1,000円」の形。", "Số lượng × đơn giá. Dạng \"1,000円\"."]},
    {"no": "16.10", "ja": "納入先", "vi": "Nơi giao hàng", "sel": SEC(1, 10), "kind": "label", "trig": "view", "detail": ["発注の納入先（倉庫）。", "Nơi giao hàng (kho) của đơn đặt."]},
    {"no": "16.11", "ja": "入荷希望日", "vi": "Ngày muốn nhập hàng", "sel": SEC(1, 11), "kind": "label", "trig": "view", "detail": ["発注のときに入れた入荷希望日 yyyy-mm-dd。", "Ngày muốn nhập hàng đã nhập khi đặt, yyyy-mm-dd."]},
    {"no": "17", "ja": "仕入先と発注方法", "vi": "Nhà cung cấp và phương thức đặt hàng", "sel": "section.sec:nth-of-type(2)", "kind": "area", "trig": "view",
     "detail": ["仕入先名と、仕入先マスタの発注方法（ESステーション／メール／外部。台帳 I。値がなければ ESステーション）。", "Tên nhà cung cấp và phương thức đặt hàng trong master nhà cung cấp (ESステーション / メール / 外部; sổ cái I. Không có giá trị thì là ESステーション)."]},
    {"no": "17.1", "ja": "仕入先", "vi": "Nhà cung cấp", "sel": SEC(2, 1), "kind": "label", "trig": "view", "detail": ["仕入先名。", "Tên nhà cung cấp."]},
    {"no": "17.2", "ja": "発注方法", "vi": "Phương thức đặt hàng", "sel": SEC(2, 2), "kind": "label", "trig": "view", "detail": ["ESステーション／メール／外部のいずれか。", "Một trong ESステーション / メール / 外部."]},
    {"no": "17.3", "ja": "外部の注記", "vi": "Ghi chú cho 外部", "sel": "section.sec:nth-of-type(2) .hint", "kind": "label", "trig": "show",
     "cond": ["発注方法が「外部」のときだけ出す", "Chỉ hiển thị khi phương thức đặt hàng là 「外部」"],
     "detail": ["「メールは送りません。運営が代理入力」。外部の仕入先にはメールを送らず、運営が代わりに入力する（台帳 F「資材発注の一括発注と仕入先の発注方法」）。", "「メールは送りません。運営が代理入力」 (Không gửi email. Vận hành nhập hộ). Không gửi email cho nhà cung cấp 外部, vận hành nhập hộ (sổ cái F \"資材発注の一括発注と仕入先の発注方法\")."]},
    {"no": "18", "ja": "仕入先の回答", "vi": "Phản hồi của nhà cung cấp", "sel": "section.sec:nth-of-type(3)", "kind": "area", "trig": "view",
     "detail": ["仕入先の回答の状態と出荷予定日。", "Trạng thái phản hồi của nhà cung cấp và ngày dự kiến xuất hàng."]},
    {"no": "18.1", "ja": "仕入先の回答", "vi": "Phản hồi của nhà cung cấp", "sel": SEC(3, 1), "kind": "label", "trig": "view", "detail": ["回答の状態（バッジ）。16.3 と同じ。", "Trạng thái phản hồi (badge). Giống 16.3."]},
    {"no": "18.2", "ja": "出荷予定日", "vi": "Ngày dự kiến xuất", "sel": SEC(3, 2), "kind": "label", "trig": "view", "detail": ["仕入先が答えた出荷予定日 yyyy-mm-dd。まだなら「—」。", "Ngày dự kiến xuất hàng mà nhà cung cấp trả lời, yyyy-mm-dd. Chưa có thì \"—\"."]},
    {"no": "19", "ja": "入荷状況", "vi": "Tình trạng nhập hàng", "sel": "section.sec:nth-of-type(4)", "kind": "area", "trig": "view",
     "detail": ["入荷の状態と入荷日。入荷は運営が「入荷登録」で手入力する（THOMAS は使わない）。", "Trạng thái nhập hàng và ngày nhập. Vận hành nhập tay nhập hàng bằng 「入荷登録」 (không dùng THOMAS)."]},
    {"no": "19.1", "ja": "入荷状態", "vi": "Trạng thái nhập hàng", "sel": SEC(4, 1), "kind": "label", "trig": "view", "detail": ["バッジ：未入荷／一部入荷／入荷済の3つ（分納の途中は一部入荷）。見出しにも同じバッジを出す。", "Badge: 3 giá trị 未入荷 / 一部入荷 / 入荷済 (đang giao từng phần là 一部入荷). Cũng hiển thị cùng badge ở tiêu đề."]},
    {"no": "19.2", "ja": "入荷日", "vi": "Ngày nhập hàng", "sel": SEC(4, 2), "kind": "label", "trig": "view", "detail": ["入荷した日 yyyy-mm-dd。未入荷なら「—」。", "Ngày đã nhập hàng, yyyy-mm-dd. Chưa nhập thì \"—\"."]},
    {"no": "20", "ja": "変更履歴", "vi": "Lịch sử thay đổi", "sel": "section.sec:nth-of-type(5)", "kind": "table", "trig": "view",
     "detail": ["発注に残った操作の記録（日時・操作者・内容）。発注したときの「本発注（数量）」から、取消・代理入力などが古い順に並ぶ。記録がなければ「履歴はありません」。", "Ghi chép các thao tác của đơn đặt (ngày giờ, người thao tác, nội dung). Từ \"本発注（số lượng）\" khi đặt, rồi hủy, nhập hộ... xếp theo thứ tự cũ đến mới. Không có ghi chép thì hiện 「履歴はありません」."]},
    {"no": "21", "ja": "見つからないとき", "vi": "Khi không tìm thấy", "sel": ".card .notice", "kind": "label", "trig": "show", "err": ["E100"],
     "cond": ["URL の発注番号の資材発注がないとき（資材以外の発注番号を含む）", "Khi không có đơn đặt vật tư với số đơn đặt trong URL (kể cả số đơn đặt không phải vật tư)"],
     "detail": ["E100（{対象}＝資材発注、{ID}＝発注番号）をページ内に出し、「資材発注の一覧へ戻る」で発注の履歴へ戻る。", "Hiển thị E100 ({đối tượng} = 資材発注, {ID} = số đơn đặt) trong trang, và 「資材発注の一覧へ戻る」 để về lịch sử đặt hàng."]},
]

STATE_VI = {'調整（ボタン）': 'Điều chỉnh (nút)', '調整（小窓）': 'Điều chỉnh (modal)', '調整エラー（小窓内）': 'Lỗi điều chỉnh (trong modal)', '調整の棚卸し日以前の警告（W123）': 'Cảnh báo W123 (ngày trước kiểm kê)', '発注（タブ）': 'Tab 発注 (đặt hàng)', '資材の在庫（タブ）': 'Tab 資材の在庫 (tồn kho vật tư)', '発注の履歴（タブ）': 'Tab 発注の履歴 (lịch sử đặt hàng)', '発注数エラー（ロットの倍数でない）': 'Lỗi số lượng đặt (không phải bội của lô)', '資材の発注 確認（小窓）': 'Xác nhận đặt mua vật tư (hộp thoại)', '入荷希望日エラー（小窓内）': 'Lỗi ngày muốn nhập hàng (trong hộp thoại)', '発注の完了（トースト）': 'Hoàn tất đặt hàng (toast)', '一括発注（資材を選ぶ）': 'Đặt hàng loạt (chọn vật tư)', '一括発注 確認（小窓）': 'Xác nhận đặt hàng loạt (hộp thoại)', '一括発注エラー（小窓内）': 'Lỗi đặt hàng loạt (trong hộp thoại)', '一括発注の完了（トースト）': 'Hoàn tất đặt hàng loạt (toast)', '詳細 初期表示': 'Chi tiết - hiển thị ban đầu', '見つからない番号': 'Số đơn đặt không tìm thấy'}

OPEN_ADJ = "btn('調整',document.querySelector('.tbl td.act')).click();await sleep(600);"

def V(id, ja, items, setup="", note=None, full=True, wait=700, url="/ops/purchasing/materials", code="AW_MPO_001"):
    return {"id": id, "code": code, "state": [ja, STATE_VI.get(ja, "")], "url": url, "setup": (H + setup) if setup else "", "full": full, "wait": wait, "note": note or ["", ""], "items": items}

VIEWS = [
    V("001", "発注（タブ）", HEAD + TABS + ORDER_TBL,
      note=["タブ「発注」（初期表示）。決定（台帳 I・F 2026-10-07、F 2026-10-08・受付簿 #325）：納入先・目安は倉庫ごと、しきい値・「在庫不足」は作らない、画面をタブで分ける。タブ分けはコードに実装済み。タブ分けは画面コード AW_MPO_001 の状態で、001〜003 が各タブ。", "Tab 「発注」 (hiển thị ban đầu). Quyết định (sổ cái I, F 2026-10-07; F 2026-10-08, sổ tiếp nhận #325): nơi giao hàng và mức đề xuất theo từng kho, không làm ngưỡng và \"在庫不足\", chia màn hình bằng tab. Code đã chia tab. Chia tab là các trạng thái của mã màn hình AW_MPO_001: 001–003 là từng tab."]),
    V("002", "資材の在庫（タブ）", HEAD[:1] + TABS + STOCK, url="/ops/purchasing/materials?tab=stock",
      note=["タブ「資材の在庫」（?tab=stock）。倉庫×資材の表・検索・10件ずつ。", "Tab 「資材の在庫」 (?tab=stock). Bảng kho × vật tư, tìm kiếm, 10 dòng/trang."]),
    V("003", "発注の履歴（タブ）", HEAD[:1] + TABS + HIST, url="/ops/purchasing/materials?tab=history",
      note=["タブ「発注の履歴」（?tab=history）。検索・10件ずつ。発注番号 → C1 の発注詳細。", "Tab 「発注の履歴」 (?tab=history). Tìm kiếm, 10 dòng/trang. Số đơn đặt → chi tiết đơn đặt của C1."]),
    V("004", "発注数エラー（ロットの倍数でない）", HEAD[:1] + [ORDER_TBL[0], ORDER_TBL[11], ORDER_TBL[12]] + QTY_ERR,
      setup="setv(qin(),'7');await sleep(200);btn('発注する',document.querySelector('.tbl td.act')).click();await sleep(500);",
      note=["タブ「発注」で、割り箸（ロット100）に 7 を入れて「発注する」。コードはトーストで止める（インラインは宿題）。", "Ở tab 「発注」, nhập 7 vào đũa dùng một lần (lô 100) rồi nhấn \"発注する\". Code chặn bằng toast (inline là việc tồn đọng)."], full=False),
    V("005", "資材の発注 確認（小窓）", MODAL,
      setup="setv(qin(),'100');await sleep(200);btn('発注する',document.querySelector('.tbl td.act')).click();await sleep(600);",
      note=["タブ「発注」から開く。割り箸 100膳。入荷希望日は初期値。", "Mở từ tab 「発注」. Đũa dùng một lần 100 膳. Ngày muốn nhập hàng để giá trị ban đầu."], full=False),
    V("006", "入荷希望日エラー（小窓内）", MODAL_ERR,
      setup="setv(qin(),'100');await sleep(200);btn('発注する',document.querySelector('.tbl td.act')).click();await sleep(600);setv(document.querySelector('.mbox .fld input'),'');await sleep(200);btn('この内容で発注する',document.querySelector('.mbox')).click();await sleep(400);",
      note=["入荷希望日を消して発注する。コードは「入荷希望日を入れてください」（E01 に揃える）。", "Xóa ngày muốn nhập hàng rồi đặt hàng. Code hiện \"入荷希望日を入れてください\" (thống nhất thành E01)."], full=False),
    V("007", "発注の完了（トースト）", [HEAD[0], TOAST, HIST[0], HIST[6], HIST[7]],
      setup="setv(qin(),'100');await sleep(200);btn('発注する',document.querySelector('.tbl td.act')).click();await sleep(600);btn('この内容で発注する',document.querySelector('.mbox')).click();await sleep(900);btn('発注の履歴',document.querySelector('.tabs')).click();await sleep(500);",
      note=["発注すると小窓が閉じ、トースト S122 が出て、新しい発注が「発注の履歴」タブの先頭に出る（撮影ではあとで「発注の履歴」タブへ切り替える）。", "Khi đặt hàng, hộp thoại đóng lại, hiện toast S122 và đơn đặt mới xuất hiện ở đầu tab 「発注の履歴」 (khi chụp, sau đó chuyển sang tab 「発注の履歴」)."]),
    V("008", "一括発注（資材を選ぶ）", [HEAD[0], BULK[0], BULK[1], BULK[2], BULK[10]],
      setup="const cks=()=>document.querySelectorAll('.tbl tbody input[type=checkbox]');cks()[0].click();await sleep(150);cks()[1].click();await sleep(300);",
      note=["タブ「発注」で上の2資材にチェックを入れた状態。「選択した資材を発注」が押せる。仕入先の発注方法（No.10）は仕入先名の下に出る。", "Ở tab 「発注」 đã đánh dấu 2 vật tư đầu. Nút 「選択した資材を発注」 nhấn được. Phương thức đặt hàng của nhà cung cấp (No.10) hiển thị bên dưới tên nhà cung cấp."], full=False),
    V("009", "一括発注 確認（小窓）", [BULK[3], BULK[4], BULK[5], BULK[6], BULK[7], BULK[8], BULK[10], ADJ[13], ADJ[14]],
      setup="const cks=()=>document.querySelectorAll('.tbl tbody input[type=checkbox]');cks()[0].click();await sleep(150);cks()[1].click();await sleep(250);btn('選択した資材を発注').click();await sleep(600);",
      note=["上の2資材を選んで開いた一括発注の小窓。数量は目安（なければ空）、入荷希望日は今日。仕入先の列は「仕入先（発注方法）」。外部の仕入先を選ぶと「メールは送りません。運営が代理入力」の注記が出る（見本の資材の仕入先はESステーションのため画像には出ない）。", "Hộp thoại đặt hàng loạt mở sau khi chọn 2 vật tư đầu. Số lượng là mức đề xuất (nếu không có thì trống), ngày muốn nhập hàng là hôm nay. Cột nhà cung cấp là 「仕入先（発注方法）」. Chọn nhà cung cấp 外部 thì hiện ghi chú 「メールは送りません。運営が代理入力」 (nhà cung cấp của vật tư mẫu là ESステーション nên không hiện trong ảnh)."], full=False),
    V("010", "一括発注エラー（小窓内）", [BULK[3], BULK[5], BULK[9]],
      setup="const cks=()=>document.querySelectorAll('.tbl tbody input[type=checkbox]');cks()[0].click();await sleep(150);cks()[1].click();await sleep(250);btn('選択した資材を発注').click();await sleep(600);setv(document.querySelector('.mbox .tbl input[type=number]'),'7');await sleep(200);btn('この内容で発注する',document.querySelector('.mbox')).click();await sleep(400);",
      note=["数量にロットの倍数でない 7 を入れて発注する。数量の下にエラーが出て、1件も発注しない。", "Nhập 7 (không phải bội của lô) vào số lượng rồi đặt hàng. Lỗi hiển thị bên dưới số lượng và không đặt đơn nào."], full=False),
    V("011", "一括発注の完了（トースト）", [HEAD[0], TOAST, HIST[0], HIST[6], HIST[7]],
      setup="const cks=()=>document.querySelectorAll('.tbl tbody input[type=checkbox]');cks()[0].click();await sleep(150);cks()[1].click();await sleep(250);btn('選択した資材を発注').click();await sleep(600);setv(document.querySelectorAll('.mbox .tbl input[type=number]')[0],'100');setv(document.querySelectorAll('.mbox .tbl input[type=number]')[1],'100');await sleep(300);btn('この内容で発注する',document.querySelector('.mbox')).click();await sleep(900);btn('発注の履歴',document.querySelector('.tabs')).click();await sleep(500);",
      note=["2資材を一括で発注すると小窓が閉じ、トースト S122 が1回出て、発注が資材ごとに「発注の履歴」タブの先頭に出る。", "Khi đặt hàng loạt 2 vật tư, hộp thoại đóng lại, hiện toast S122 một lần và mỗi vật tư một đơn xuất hiện ở đầu tab 「発注の履歴」."]),
    V("012", "調整（ボタン）", [HEAD[0], TABS[0], ADJ[0]], url="/ops/purchasing/materials?tab=stock",
      note=["タブ「資材の在庫」。各行の右端に「調整」。押すとその行の倉庫と資材が入ったモーダル（013）が開く。", "Tab 「資材の在庫」. Cuối mỗi dòng có nút 「調整」. Nhấn sẽ mở modal (013) với kho và vật tư của dòng đó."], full=False),
    V("013", "調整（小窓）", [ADJ[1], ADJ[2], ADJ[3], ADJ[4], ADJ[5], ADJ[6], ADJ[7], ADJ[8], ADJ[9], ADJ[10], ADJ[11]], url="/ops/purchasing/materials?tab=stock", setup=OPEN_ADJ,
      note=["「資材の在庫」の1行目の「調整」で開いた状態。対象＝資材・倉庫・資材は行のもので固定。区分は NG品ロス、増減は減る、日付は今日。", "Trạng thái mở bằng 「調整」 ở dòng đầu của 「資材の在庫」. Đối tượng = vật tư; kho và vật tư cố định theo dòng. Phân loại NG品ロス, tăng/giảm là 減る, ngày là hôm nay."], full=False),
    V("014", "調整エラー（小窓内）", [ADJ[1], ADJ[7], ADJ[8], ADJ[10], ADJ[11], ADJ[12]], url="/ops/purchasing/materials?tab=stock", setup=OPEN_ADJ + "btn('登録',document.querySelector('.mbox-f')).click();await sleep(400);",
      note=["数量と理由を空のまま「登録」。数量・理由の下にエラーが出て、登録しない（コードはトーストも出す）。", "Nhấn 「登録」 khi để trống số lượng và lý do. Lỗi hiện bên dưới số lượng・lý do và không đăng ký (code còn hiện thêm toast)."], full=False),
    V("015", "調整の棚卸し日以前の警告（W123）", [ADJ[1], ADJ[5], ADJ[13]], url="/ops/purchasing/materials?tab=stock", setup=OPEN_ADJ + "setv(document.querySelector('#wm-date'),'2026-09-30');await sleep(500);",
      note=["日付を棚卸し日（2026-09-30）以前にした状態。W123 を日付の下に出す設計だが、コードにまだない（demo_ok）。", "Trạng thái đặt ngày trước hoặc bằng ngày kiểm kê (2026-09-30). Thiết kế hiện W123 bên dưới ngày nhưng code chưa có (demo_ok)."], full=False),
    V("016", "詳細 初期表示", [d for d in DETAIL[:-1] if d["no"] != "17.3"],
      setup="setv(qin(),'100');await sleep(200);btn('発注する',document.querySelector('.tbl td.act')).click();await sleep(600);btn('この内容で発注する',document.querySelector('.mbox')).click();await sleep(900);btn('発注の履歴',document.querySelector('.tabs')).click();await sleep(500);document.querySelector('.tbl td button.lnk').click();await sleep(900);",
      note=["「発注の履歴」タブの発注番号を押して開いた詳細。見本データに資材の発注がないため、撮影では割り箸を 100膳 発注してから開く（発注が1件増える）。仕入先は ESステーションの方法。入荷は未入荷で、変更履歴は発注したときの1行。外部の注記（17.3）は、見本の仕入先に「外部」がないため画像には出ない。", "Chi tiết mở bằng cách nhấn số đơn đặt ở tab 「発注の履歴」. Dữ liệu mẫu không có đơn đặt vật tư nên khi chụp, đặt 100膳 đũa dùng một lần rồi mới mở (tăng thêm 1 đơn đặt). Nhà cung cấp dùng phương thức ESステーション. Chưa nhập hàng; lịch sử thay đổi có 1 dòng lúc đặt. Ghi chú 外部 (17.3) không hiện trong ảnh vì nhà cung cấp mẫu không có 外部."],
      code="AW_MPO_002", url="/ops/purchasing/materials"),
    V("017", "見つからない番号", [DETAIL[0], DETAIL[1], DETAIL[-1]],
      note=["存在しない発注番号（PO-000000-S000-99）の URL を直接開いた状態。E100 と「資材発注の一覧へ戻る」が出る。", "Trạng thái mở trực tiếp URL có số đơn đặt không tồn tại (PO-000000-S000-99). Hiển thị E100 và 「資材発注の一覧へ戻る」."],
      code="AW_MPO_002", url="/ops/purchasing/materials/PO-000000-S000-99", full=False),
]
