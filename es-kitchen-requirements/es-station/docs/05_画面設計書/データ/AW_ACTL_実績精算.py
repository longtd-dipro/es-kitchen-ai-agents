# -*- coding: utf-8 -*-
"""
画面設計書のデータ：運営管理者Web ＞ 請求 ＞ 実績精算（一覧・詳細・編集）（AW_ACTL）。
元：本物の Web（app/ops/billing/actuals・app/ops/billing/_components・lib/ops/billing・lib/ops/areas/billing.ts）、
    決定台帳 B・E・F・H・K・L・M-1・M-3・N（運営E 請求・購入 2026-10-07・2026-10-08）、在庫.md §6、請求ルール_仕様_v1、契約_05・契約_06、運営Web_権限表、CSV入出力_定義、
    確認メモ_AW_運営E_請求・購入.md（回答・Part 1-B・横断）
データは日本語で書き、ベトナム語とデータ例の説明は最後に翻訳でまとめて入れる（いまは "" のまま）。
番号は画面ごと（画面コードごと）に通し。状態では、その状態で増える・変わる項目だけ書く（共通の項目は最初の状態に1回）。
状態の id は確認メモの 001〜031 のとおり。編集画面（AW_ACTL_003）は、台帳 F 2026-10-07 で「作らない」としたが 2026-10-08 に hong が「残す」と回答したので復活（状態 041〜049。中身は仮・範囲は hong 確認待ち）。
状態 032 以降は台帳の決定で足した状態（確認ダイアログ・休止中・買取など）。
"""

TITLE = ["実績精算（AW_ACTL）", "Đối soát thực tế (AW_ACTL)"]
SHEET = ["実績精算", "Đối soát thực tế"]
BASENAME = "画面設計書_AW_ACTL_実績精算"
IMG_PREFIX = "AW_ACTL"
OUT_DIR = "AW_ACTL_実績精算"
CODE_NOTE = ["画面コードは規約 <Module(2)>_<Feature(4)>_<Seq(3)>（docs/01_仕様/画面コード規約_20261005.md）。AW＝運営管理者Web、ACTL＝実績精算（Actuals）。001 一覧／002 詳細（過去月の詳細も 002）／003 編集（台帳 F 2026-10-08「実績精算の編集画面（残す）」。直したいときのため）",
             "Mã màn hình theo quy ước <Module(2)>_<Feature(4)>_<Seq(3)> (docs/01_仕様/画面コード規約_20261005.md). AW = Web quản trị vận hành, ACTL = Đối soát thực tế (Actuals). 001 danh sách / 002 chi tiết (chi tiết tháng đã qua cũng là 002) / 003 sửa (sổ quyết định F 2026-10-08 「実績精算の編集画面（残す）」, để dùng khi muốn sửa)"]
SITE = "ops"
SYSTEM = {"ja": "運営管理者Web", "vi": "Web quản trị vận hành"}
AUTHOR = "Claude（cloud）／確認：hong"
CREATED = "2026-10-07"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "ops", "loginId": "Ad00010"}
CODE_PATHS = ["app/ops/billing/actuals", "app/ops/billing/_components", "lib/ops/billing", "lib/ops/areas/billing.ts", "lib/domain/seed"]


def DEC(date, target, q, a, src):
    return {"date": date, "target": target, "q": q if isinstance(q, list) else [q, ""], "a": a if isinstance(a, list) else [a, ""], "src": src}


_M = "hong 回答 2026-10-07（確認メモ_AW_運営E 提案どおり・"
DECISIONS = [
    DEC("2026-10-07", "実績精算の編集画面（ACTL Q-A1）", ["実績精算の「編集」画面を残すか。価格調整・棚卸の申告チェックの入力元はどこか", "Có giữ màn hình 「編集」 của đối soát thực tế không. Nguồn nhập của điều chỉnh giá và tick báo cáo kiểm kê ở đâu"],
        ["【2026-10-08 に取り消し：編集画面を残す。下の「実績精算の編集画面（残す・AW_ACTL_003）」の行を参照】作らない（AW_ACTL は一覧・詳細の2画面）。価格調整は子契約の値を参照表示（子契約へのリンク）。確定・解除・まとめて確定は一覧・詳細のボタン。棚卸の代理入力は棚卸しの専用画面（AW_STCK_005）で行う", "【Đã hủy ngày 2026-10-08: giữ màn hình sửa. Xem dòng 「実績精算の編集画面（残す・AW_ACTL_003）」 bên dưới】Không làm (AW_ACTL gồm 2 màn hình: danh sách・chi tiết). Điều chỉnh giá hiển thị tham chiếu giá trị của hợp đồng con (link sang hợp đồng con). Chốt・hủy chốt・chốt hàng loạt là nút ở danh sách・chi tiết. Nhập hộ kiểm kê thực hiện ở màn hình riêng của 棚卸し (AW_STCK_005)"],
        _M + "ACTL Q-A1）・台帳 F「実績精算の編集画面」"),
    DEC("2026-10-07", "管理ロスの換算単価（Q-A2）", ["管理ロスを何の単価でお金に直すか", "Quy đổi hao hụt quản lý thành tiền theo đơn giá nào"],
        ["価格調整の前の標準の価格（定価＝商品マスタの販売価格・税込）で換算する。値上げ・値下げのあとの価格では換算しない", "Quy đổi theo giá chuẩn trước điều chỉnh giá (giá niêm yết = giá bán của sản phẩm master, gồm thuế). Không quy đổi theo giá sau khi tăng/giảm giá"],
        _M + "ACTL Q-A2）・在庫.md §6-1（REQ-PO-415）"),
    DEC("2026-10-07", "事務手数料（Q-A3）", ["事務手数料（¥3,000）をいつ・どの拠点に出すか", "Phí xử lý (¥3,000) hiển thị khi nào và ở chi nhánh nào"],
        ["25日になるまで手数料の行は出さない（それまでは「25日までに報告がないと事務手数料がかかります」の予告だけ）。最初の棚卸報告の前の拠点にも付ける（免除するのは管理ロスだけ）。お試し・棚卸なし・休止中・買取の拠点には付けない", "Đến ngày 25 mới hiển thị dòng phí (trước đó chỉ báo trước 「25日までに報告がないと事務手数料がかかります」). Cũng tính cho chi nhánh trước báo cáo kiểm kê đầu tiên (chỉ miễn hao hụt quản lý). Không tính cho chi nhánh dùng thử, không kiểm kê, tạm dừng, mua đứt"],
        _M + "ACTL Q-A3）・台帳 F「事務手数料の見せ方」"),
    DEC("2026-10-07", "実績精算の権限（Q-A4）", ["確定・解除・まとめて確定ができる役割", "Vai trò có thể chốt, hủy chốt, chốt hàng loạt"],
        ["【2026-10-08 に一部置き換え：物流は実績精算・請求の確定・請求書が R。確定できるのはフル権限・経理。権限表「物流＝CRUD」の open は解消。下の「集金管理の権限（物流）」の行を参照】権限表のとおり（フル権限・経理・物流が確定。CS・営業・商品管理・商品開発・閲覧のみは閲覧とCSV出力だけ）。請求ルール 1-8・契約_06 の「CS 担当者だけ」は古いので直す。26日以降の締めの促しは TOP の警告（全役割）。権限表の「物流＝CRUD」の意図は open（hong に確認）", "【Thay thế một phần ngày 2026-10-08: logistics chỉ có R với đối soát thực tế, chốt hóa đơn, hóa đơn. Người chốt được là quyền đầy đủ và kế toán. Open 「物流＝CRUD」 của bảng quyền được giải quyết. Xem dòng 「集金管理の権限（物流）」 bên dưới】Theo bảng quyền (quyền đầy đủ・kế toán・logistics được chốt. CS・kinh doanh・quản lý sản phẩm・phát triển sản phẩm・chỉ xem thì chỉ xem và xuất CSV). 「CS 担当者だけ」 trong 請求ルール 1-8 và 契約_06 là cũ nên sửa. Nhắc chốt từ ngày 26 là cảnh báo ở TOP (mọi vai trò). Ý định 「物流＝CRUD」 trong bảng quyền là open (hỏi hong)"],
        _M + "ACTL Q-A4・BILL Q-E9）・台帳 F「実績精算・請求の確定・発行の権限」"),
    DEC("2026-10-07", "惣菜買取（Q-A5）", ["惣菜買取の契約の実績精算の計算", "Cách tính đối soát thực tế của hợp đồng mua đứt món ăn"],
        ["② ＝ Σ（納品数 ×（企業の価格 − 100円））。実績精算に「買取（納品数×単価）」の行を出し、管理ロス・差分率・事務手数料は出さない（① 固定額の 100円×数量と合わせて 納品数×企業の価格 になる）", "② = Σ (số lượng giao × (giá của công ty − 100 yên)). Hiển thị dòng 「買取（納品数×単価）」 ở đối soát thực tế, không hiển thị hao hụt quản lý, tỷ lệ chênh lệch, phí xử lý (cùng với ① số tiền cố định 100 yên × số lượng thành số lượng giao × giá của công ty)"],
        _M + "ACTL Q-A5）・請求ルール 2-13"),
    DEC("2026-10-07", "手入力の行（Q-A6）", ["実績精算に手入力の行を足せるか", "Có thể thêm dòng nhập tay vào đối soát thực tế không"],
        ["【手入力の行の部分は 2026-10-08 に取り消し：編集画面で手入力の行を追加・削除できる。下の「実績精算の編集画面（残す・AW_ACTL_003）」の行を参照】足さない。調整は請求の確定・請求書の ③ 調整へ（契約_06 の「手入力での追加も可」は旧い整理）", "【Phần dòng nhập tay đã hủy ngày 2026-10-08: sửa được bằng cách thêm・xóa dòng nhập tay ở màn hình sửa. Xem dòng 「実績精算の編集画面（残す・AW_ACTL_003）」 bên dưới】Không thêm. Việc điều chỉnh làm ở chốt hóa đơn・③ điều chỉnh của hóa đơn (「手入力での追加も可」 của 契約_06 là cách sắp xếp cũ)"],
        _M + "ACTL Q-A6）・台帳 F「実績精算の細かい点」"),
    DEC("2026-10-07", "休止中の拠点（Q-A7）", ["休止中の拠点の一覧・詳細での見せ方", "Cách hiển thị chi nhánh đang tạm dừng ở danh sách・chi tiết"],
        ["【2026-10-08 に一部置き換え：休止の始めの月は通常の行、翌月から対象外。下の「休止の月の実績精算」の行を参照】一覧には行を出し、「休止中（対象外）」のバッジ。行チェック・確定の操作なし・金額は「—」。詳細も確定の操作を出さない", "【Thay thế một phần ngày 2026-10-08: tháng bắt đầu tạm dừng là dòng thường, từ tháng sau là ngoài đối tượng. Xem dòng 「休止の月の実績精算」 bên dưới】Danh sách hiển thị dòng với badge 「休止中（対象外）」. Không checkbox dòng, không thao tác chốt, số tiền là 「—」. Chi tiết cũng không hiển thị thao tác chốt"],
        _M + "ACTL Q-A7）・請求ルール 3-1"),
    DEC("2026-10-07", "確定を解除（Q-A8）", ["「確定を解除」の確認と解除できる範囲", "Xác nhận 「確定を解除」 và phạm vi hủy được"],
        ["確認ダイアログ（Q143）を出す。解除できるのは請求書に載せる前まで。請求済みは E54、確定済みは E184 と文言を分ける。請求済み以降の誤りは翌月の調整で相殺する", "Hiển thị hộp thoại xác nhận (Q143). Hủy được đến trước khi vào hóa đơn. Đã xuất hóa đơn là E54, đã chốt là E184, phân biệt câu chữ. Lỗi sau khi đã xuất hóa đơn thì bù trừ bằng điều chỉnh tháng sau"],
        _M + "ACTL Q-A8）・台帳 M-3「確定した月はロック」"),
    DEC("2026-10-07", "価格調整差額の載せ方（BILL Q-E2）", ["価格調整差額をどの請求書のどこに載せるか", "Đưa chênh lệch điều chỉnh giá vào chỗ nào của hóa đơn nào"],
        ["【2026-10-08 に取り消し：下の「価格調整差額の載せ方（運営E）」の行を参照】翌月の請求書の ③ 調整に1行（±）。当月の実績精算の内訳には出さない（確定の対象にだけ数える）。税率は 8% 固定をやめ、商品ごとの税率で按分する", "【Đã hủy ngày 2026-10-08: xem dòng 「価格調整差額の載せ方（運営E）」 bên dưới】1 dòng (±) ở mục ③ điều chỉnh của hóa đơn tháng sau. Không hiển thị trong chi tiết đối soát thực tế của tháng này (chỉ tính vào đối tượng chốt). Bỏ thuế suất cố định 8%, phân bổ theo thuế suất của từng sản phẩm"],
        _M + "BILL Q-E2）・台帳 F「価格調整差額の載せ方」"),
    DEC("2026-10-08", "価格調整差額の載せ方（運営E）", ["価格調整差額をどの請求書のどこに載せるか（2026-10-07 の決定を見直し）", "Đưa chênh lệch điều chỉnh giá vào chỗ nào của hóa đơn nào (xem lại quyết định 2026-10-07)"],
        ["A に変更（台帳 B の K12 のとおり）。価格調整差額は実績精算の内訳の1行（管理ロス・現金回収差額・価格調整差額）として、その実績精算と同じ請求書の ② に出す。③ 調整には移さない。税率は 8% 固定にせず、商品ごとの税率で按分する。2026-10-07 の「翌月の ③ 調整に1行・当月の内訳には出さない」は hong が確認せず受けた提案で取り消し", "Đổi sang A (theo K12 của sổ quyết định B). Chênh lệch điều chỉnh giá là 1 dòng trong các khoản của đối soát thực tế (hao hụt quản lý・chênh lệch thu tiền mặt・chênh lệch điều chỉnh giá), ghi ở mục ② của cùng hóa đơn với đối soát thực tế đó. Không chuyển sang ③ điều chỉnh. Thuế suất không cố định 8%, phân bổ theo thuế suất của từng sản phẩm. Quyết định 2026-10-07 「1 dòng ở ③ điều chỉnh tháng sau・không hiển thị trong chi tiết tháng này」 là đề xuất hong nhận mà chưa xác nhận, nay hủy"],
        "hong 回答 2026/10/08（チャット #10＝A）・台帳 F「運営E 価格調整差額の載せ方」・台帳 B（K12）（旧 2026-10-07「価格調整差額の載せ方（BILL Q-E2）」を置き換え）"),
    DEC("2026-10-07", "「前払い」「後払い」の文言（BILL Q-E3）", ["運営の画面で前払い・後払いと書くか", "Có ghi trả trước・trả sau trên màn hình vận hành không"],
        ["書かない。「固定額」「実績精算」に統一する", "Không ghi. Thống nhất là 「固定額」「実績精算」"],
        _M + "BILL Q-E3）・台帳 F「運営の請求画面の「前払い」「後払い」」"),
    DEC("2026-10-07", "締め月の進め方（横断 X1）", ["対象月（締め月）をいつ次の月に進めるか", "Khi nào chuyển tháng đối tượng (tháng chốt sổ) sang tháng tiếp theo"],
        ["運営が「締め月を進める」操作で進める（暦では自動で進めない）。棚卸し・実績精算・請求の運営E全画面で同じ", "Vận hành tiến lên bằng thao tác 「締め月を進める」 (không tự tiến theo lịch). Giống nhau ở tất cả màn hình 運営E của kiểm kê, đối soát thực tế, hóa đơn"],
        _M + "STCK X1（C）・BILL Q-E6）・台帳 F「請求の締め月の進め方」"),
    DEC("2026-10-07", "選べる対象月（横断 X2）", ["対象月で選べる月の範囲", "Phạm vi tháng chọn được ở tháng đối tượng"],
        ["写し（確定時の保存）のある月すべて。初期値＝当月。過去の月は参照だけ", "Mọi tháng có bản sao (lưu lúc chốt). Mặc định = tháng hiện tại. Tháng đã qua chỉ để xem"],
        _M + "横断 X2）・台帳 F「運営E の選べる月・CSV の列」"),
    DEC("2026-10-07", "CSV出力の列（横断 X3）", ["CSV出力の列と粒度", "Cột và đơn vị dòng của xuất CSV"],
        ["画面の列＋全項目の ID・名前・状態・更新日時。1行＝1拠点（商品別は要望が出てから）。ファイル名は画面名（実績精算）に合わせる。取込はない", "Cột trên màn hình + ID・tên・trạng thái・ngày giờ cập nhật của mọi mục. 1 dòng = 1 chi nhánh (theo sản phẩm đợi khi có yêu cầu). Tên file theo tên màn hình (実績精算). Không có nhập"],
        _M + "横断 X3）・CSV入出力_定義 §1-1・§5"),
    DEC("2026-10-07", "画面コードと状態の番号", ["画面コードと状態の id", "Mã màn hình và ID trạng thái"],
        ["【2026-10-08 に一部置き換え：003 編集は復活し、状態 041〜049 を足した】AW_ACTL_001 一覧／002 詳細（003 編集は作らない）。状態の id はメモの 001〜031 のとおり（編集の 032〜039 は削除）。032 以降は台帳の決定で足した状態", "【Thay thế một phần ngày 2026-10-08: 003 sửa được khôi phục, thêm trạng thái 041〜049】AW_ACTL_001 danh sách / 002 chi tiết (003 sửa không làm). ID trạng thái theo 001〜031 của ghi chú (032〜039 của sửa bị xóa). Từ 032 trở đi là trạng thái thêm theo quyết định của sổ quyết định"],
        "画面コード規約_20261005・台帳 F・確認メモ Part 1-B 1"),
    DEC("2026-10-07", "メッセージ ID", ["実績精算で足すメッセージの番号", "Số của thông báo thêm ở đối soát thực tế"],
        ["運営E の帯のうち割り当てられた範囲（E184〜E187・Q142〜Q143・S142〜S143・W141）だけを使う。範囲に足りない分（警告・情報・事務手数料の確認）は運営E の空き（E185・Q141・S149・W143〜W144・I143〜I147）から採番した（2026-10-08）", "Chỉ dùng phạm vi được gán trong dải của 運営E (E184〜E187・Q142〜Q143・S142〜S143・W141). Phần còn thiếu trong phạm vi (cảnh báo・thông tin・xác nhận phí xử lý) được đánh số từ chỗ trống của dải 運営E (E185・Q141・S149・W143〜W144・I143〜I147) (2026-10-08)"],
        "並列実行計画 §2-2・確認メモ Part 1-B [msg]・横断 [msg]"),
    DEC("2026-10-08", "休止の月の実績精算", ["休止の始めの月・リリース直後の休止中の拠点の実績精算", "Đối soát thực tế của tháng bắt đầu tạm dừng và chi nhánh đã tạm dừng sẵn lúc phát hành"],
        ["休止の始めの報告があれば、その月は通常の行で実績精算を確定でき、翌月から「対象外・金額 —」。運営が「スキップ」を選んだらその月から「対象外」。リリース時にすでに休止中の拠点（移行で「利用休止」）は最初から「対象外」。【要確認】「休止の始めの報告を最初の棚卸報告とみなす」点は未決のまま open", "Nếu có báo cáo bắt đầu tạm dừng thì tháng đó là dòng thường, chốt đối soát thực tế được, từ tháng sau là 「対象外・金額 —」. Nếu vận hành chọn 「スキップ」 thì 「対象外」 từ tháng đó. Chi nhánh đã tạm dừng sẵn lúc phát hành (chuyển đổi thành 「利用休止」) là 「対象外」 ngay từ đầu. 【Cần xác nhận】Việc coi báo cáo bắt đầu tạm dừng là báo cáo kiểm kê đầu tiên vẫn để mở (chưa quyết định)"],
        "hong 回答 2026/10/08・台帳 F「休止の月の実績精算」（旧「休止中を一律 対象外・金額 —」を置き換え）"),
    DEC("2026-10-08", "実績精算を確定できる日・事務手数料の手動調整", ["実績精算を確定できる日と、事務手数料の手動調整", "Ngày chốt đối soát thực tế được và điều chỉnh thủ công phí xử lý"],
        ["報告済みの拠点は21日から、未報告の拠点は25日から確定できる（25日に事務手数料を自動で足す。「25日」は締め月の25日）。確定ボタンは日付の前は非活性＋ツールチップ、まとめて確定の対象も確定できる日に達した行だけ。システム管理（フル権限）だけが事務手数料を拠点ごとに手で足す／外せる（理由つき・確認ダイアログ）", "Chi nhánh đã báo cáo chốt được từ ngày 21, chi nhánh chưa báo cáo từ ngày 25 (ngày 25 tự động cộng phí xử lý. 「25日」 là ngày 25 của tháng chốt sổ). Nút chốt trước ngày đó thì vô hiệu hóa + tooltip, đối tượng chốt hàng loạt cũng chỉ là dòng đã đến ngày chốt được. Chỉ quản trị hệ thống (quyền đầy đủ) mới thêm / bỏ phí xử lý thủ công theo từng chi nhánh (có lý do・hộp thoại xác nhận)"],
        "hong 回答 2026/10/08・台帳 F「実績精算を確定できる日・事務手数料の手動調整」（OPEN「確定の日付制限」を解消）"),
    DEC("2026-10-08", "「締め月を進める」ボタン", ["「締め月を進める」の押せない間の見せ方と確認", "Cách hiển thị khi chưa nhấn được 「締め月を進める」 và việc xác nhận"],
        ["AW_BILL 001 No.1.3。押せない間は非活性にして理由をツールチップで出し、押してからエラー（E195）は出さない。押すとき確認ダイアログ（元に戻せない旨）を出す。押せる条件の「全請求書」から 0円・休止中・まだ作っていない請求先は除く", "AW_BILL 001 No.1.3. Khi chưa nhấn được thì vô hiệu hóa nút và hiển thị lý do bằng tooltip, không báo lỗi (E195) sau khi nhấn. Khi nhấn có hộp thoại xác nhận (nêu rõ không hoàn tác được). Điều kiện nhấn được 「全請求書」 loại trừ hóa đơn 0 yên, đang tạm dừng, đối tượng chưa tạo hóa đơn"],
        "hong 回答 2026/10/08・台帳 F「「締め月を進める」ボタン」"),
    DEC("2026-10-08", "作成済み（未発行）の請求書・確認ダイアログ", ["実績精算の「残りをまとめて確定」「確定を解除」の確認", "Xác nhận của 「残りをまとめて確定」 và 「確定を解除」 ở đối soát thực tế"],
        ["実績精算詳細の「残りをまとめて確定」に確認ダイアログ（一覧のまとめて確定と同じ Q142）、内訳の「確定を解除」にも確認ダイアログ（Q143・実績精算の解除と同じ）を出す", "Hiển thị hộp thoại xác nhận cho 「残りをまとめて確定」 ở chi tiết đối soát thực tế (Q142, giống chốt hàng loạt ở danh sách) và cho 「確定を解除」 của khoản (Q143, giống hủy chốt đối soát thực tế)"],
        "hong 回答 2026/10/08・台帳 F「作成済み（未発行）の請求書・確認ダイアログ」（旧「残りの確定は確認なし」「内訳の解除は確認なし」を置き換え）"),
    DEC("2026-10-08", "集金管理の権限（物流）", ["物流の実績精算・請求の確定・請求書の権限", "Quyền của logistics với đối soát thực tế, chốt hóa đơn, hóa đơn"],
        ["物流は集金管理の現金の突き合わせ画面だけ CRUD、実績精算・請求の確定・請求書は R（仮置き。権限の画面で最終確認）。実績精算を確定できるのはフル権限・経理。権限表の「物流＝CRUD の意図」の open は解消", "Logistics chỉ có CRUD ở màn hình đối chiếu tiền mặt của quản lý thu tiền, còn đối soát thực tế, chốt hóa đơn, hóa đơn là R (tạm đặt. Xác nhận cuối ở màn hình quyền). Người chốt được đối soát thực tế là quyền đầy đủ và kế toán. Open 「物流＝CRUD の意図」 của bảng quyền được giải quyết"],
        "hong 回答 2026/10/08・台帳 F「集金管理の権限（物流）・取消済みの請求書・0円の請求書・CSV 7列」（旧「実績精算の権限（Q-A4）の物流＝確定」を置き換え）"),
    DEC("2026-10-08", "実績精算の初期の並び", ["実績精算の一覧の初期の並び", "Thứ tự ban đầu của danh sách đối soát thực tế"],
        ["要対応の行（未確定、または差分率 10% 以上）を上、そのあと拠点ID の昇順。実績精算は月次の作業一覧で、請求の確定と同じ考え方。ユーザーが並べ替えで他の列に変えられることは今のまま", "Dòng cần xử lý (chưa chốt, hoặc tỷ lệ chênh lệch từ 10% trở lên) ở trên, sau đó theo ID chi nhánh tăng dần. Đối soát thực tế là danh sách công việc hằng tháng, cùng cách nghĩ với chốt hóa đơn. Người dùng vẫn đổi được sang cột khác bằng sắp xếp như hiện tại"],
        "hong 回答 2026/10/08・台帳 F「実績精算・購入管理（商品別）の初期の並び」（旧「実績精算は拠点ID昇順（棚卸しに合わせた仮置き）」を置き換え）"),
    DEC("2026-10-08", "実績精算の「当月へ繰入」の中身", ["「当月へ繰入」に価格調整差額を含めるか", "Có đưa chênh lệch điều chỉnh giá vào 「当月へ繰入」 không"],
        ["含める。当月へ繰入＝免責超過の管理ロス＋現金回収差額＋価格調整差額（請求書の ② に載る金額と一致させる）。事務手数料・惣菜買取・代替品の扱いは台帳に決定がなく今のまま（次の行で「含める」と決まった）", "Có đưa vào. 当月へ繰入 = hao hụt quản lý vượt miễn trách + chênh lệch thu tiền mặt + chênh lệch điều chỉnh giá (khớp với số tiền ghi ở mục ② của hóa đơn). Cách xử lý phí xử lý・mua đứt món ăn・sản phẩm thay thế chưa có quyết định trong sổ quyết định nên giữ nguyên (dòng kế tiếp đã quyết định 「含める」)"],
        "hong 回答 2026/10/08・台帳 F「実績精算の「当月へ繰入」の中身」（旧「免責超過＋現金回収差額（価格調整差額なし）」を置き換え）"),
    DEC("2026-10-08", "実績精算の「当月へ繰入」に事務手数料・買取・代替品を含める", ["「当月へ繰入」に事務手数料・惣菜買取・代替品を含めるか", "Có đưa phí xử lý・mua đứt món ăn・sản phẩm thay thế vào 「当月へ繰入」 không"],
        ["含める。当月へ繰入＝請求書の ② に載る実績精算の金額すべて＝免責超過の管理ロス＋現金回収差額＋価格調整差額＋事務手数料＋惣菜買取＋代替品。一覧の繰入（5.11）・サマリー（3.3）・詳細の合計（6.3・9.4・9.5）が請求書の ② と一致する。買取の拠点は管理ロス・事務手数料を出さないので、買取の金額だけが繰入に入る。休止中・「対象外」の行は繰入が「—」のまま", "Có đưa vào. 当月へ繰入 = toàn bộ số tiền đối soát thực tế ghi ở mục ② của hóa đơn = hao hụt quản lý vượt miễn trách + chênh lệch thu tiền mặt + chênh lệch điều chỉnh giá + phí xử lý + mua đứt món ăn + sản phẩm thay thế. Cột chuyển vào (5.11), tổng hợp (3.3), tổng ở màn hình chi tiết (6.3・9.4・9.5) khớp với mục ② của hóa đơn. Chi nhánh mua đứt không hiển thị hao hụt quản lý・phí xử lý nên chỉ số tiền mua đứt được tính vào. Dòng tạm dừng・「対象外」 vẫn là 「—」"],
        "hong 回答 2026/10/08・台帳 F「実績精算の「当月へ繰入」の中身」（事務手数料・惣菜買取・代替品は「含める」。上の行の「今のまま」を置き換え）"),
    DEC("2026-10-08", "リリース後の最初のサイクルは事務手数料も免除", ["事務手数料（¥3,000）の免除（リリース後の最初のサイクル）", "Miễn phí xử lý (¥3,000) ở chu kỳ đầu tiên sau khi phát hành"],
        ["事務手数料は、25日になっても報告がない拠点に付ける（最初の棚卸報告の前の拠点にも付ける。管理ロスは出さない）。ただし、リリース後の最初のサイクルだけは事務手数料も免除する。免除のサイクルは、事務手数料の行を出さず、「リリース後の最初のサイクルは事務手数料がかかりません」という案内にする（メッセージ ID は採番待ち）。システム管理が事務手数料を手で足す／外す操作（9.8〜9.10）は免除のサイクルでも使える", "Phí xử lý được tính cho chi nhánh đến ngày 25 vẫn chưa báo cáo (cũng tính cho chi nhánh trước báo cáo kiểm kê đầu tiên. Không hiển thị hao hụt quản lý). Tuy nhiên, chỉ riêng chu kỳ đầu tiên sau khi phát hành thì miễn cả phí xử lý. Ở chu kỳ được miễn, không hiển thị dòng phí xử lý mà hiển thị thông báo 「リリース後の最初のサイクルは事務手数料がかかりません」 (ID thông báo đang chờ đánh số). Thao tác thêm / bỏ phí xử lý thủ công của quản trị hệ thống (9.8〜9.10) vẫn dùng được ở chu kỳ được miễn"],
        "hong 回答 2026/10/08・台帳 F「事務手数料（¥3,000）の見せ方」（リリース後の最初のサイクルは免除）"),
    DEC("2026-10-08", "実績精算の編集画面（残す・AW_ACTL_003）", ["実績精算の編集画面を残すか（2026-10-07 の「作らない」の見直し）。残すなら何を直せるか", "Có giữ màn hình sửa đối soát thực tế không (xem lại 「không làm」 của 2026-10-07). Nếu giữ thì sửa được gì"],
        ["残す（直したいときのため。AW_ACTL_003・/ops/billing/actuals/{拠点ID}/edit）。中身は仮（範囲は hong 確認待ち）：確定する前の月で、② の手入力の行（品名・税抜金額・税率・理由。理由は必須）を追加・削除できる。確定済み・請求済みの月は開けない（E184／E54）。価格調整は子契約の値のまま（承認が要るので、この画面では直接変えない。子契約へのリンクだけ）。棚卸の代理入力は棚卸し側（AW_STCK_005）。自動で計算した金額（管理ロス・現金回収差額・事務手数料）もこの画面で直接直せる（理由は必須・確定前の月だけ・修正前→修正後を履歴に残す。hong 追加回答 2026-10-08）。2026-10-07 の「手入力の行は足さない」（Q-A6）のうち手入力の行の部分も取り消し", "Giữ lại (để dùng khi muốn sửa. AW_ACTL_003・/ops/billing/actuals/{ID chi nhánh}/edit). Nội dung tạm (phạm vi chờ hong xác nhận): ở tháng chưa chốt, thêm・xóa được dòng nhập tay của ② (tên hàng・số tiền chưa thuế・thuế suất・lý do. Lý do bắt buộc). Tháng đã chốt・đã xuất hóa đơn thì không mở được (E184／E54). Điều chỉnh giá giữ giá trị của hợp đồng con (cần phê duyệt nên không đổi trực tiếp ở màn hình này, chỉ có link sang hợp đồng con). Nhập hộ kiểm kê ở phía 棚卸し (AW_STCK_005). Các khoản tự tính (hao hụt quản lý・chênh lệch thu tiền mặt・phí xử lý) cũng sửa trực tiếp được ở màn hình này (lý do bắt buộc・chỉ tháng chưa chốt・ghi 「修正前→修正後」 vào lịch sử. hong trả lời bổ sung 2026-10-08). Phần dòng nhập tay của 「手入力の行は足さない」 (Q-A6) ngày 2026-10-07 cũng được hủy"],
        "hong 回答 2026/10/08（チャット 2026-10-08「残す。直したいときのため」）・台帳 F「実績精算の編集画面（残す）」（旧 2026-10-07「実績精算の編集画面（ACTL Q-A1）」「手入力の行（Q-A6）」を置き換え）"),
]
CHANGES = []

HIDE_ALWAYS = []
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [
    {"code": "AW_ACTL_001", "ja": "実績精算一覧", "vi": "Danh sách đối soát thực tế"},
    {"code": "AW_ACTL_002", "ja": "実績精算詳細", "vi": "Chi tiết đối soát thực tế"},
    {"code": "AW_ACTL_003", "ja": "実績精算編集", "vi": "Sửa đối soát thực tế"},
]

# ---------------------------------------------------------------- 部品
PAIR = ("detail", "init", "cond", "valid", "ex", "open", "demo_ok", "chk")
VI = {}
EX_VI = {}


def F(no, ja, sel, kind, trig="view", **kw):
    d = {"no": no, "ja": ja, "vi": "", "sel": sel, "kind": kind, "trig": trig}
    for k, v in kw.items():
        if v is None:
            continue
        if k in PAIR and isinstance(v, str):
            v = [v, ""]
        if k == "len" and isinstance(v, str):
            v = [v, ""]
        d[k] = v
    return d


def ST(vid, code, state, note, items, url, **kw):
    d = {"id": vid, "code": code, "state": state if isinstance(state, list) else [state, ""], "url": url, "setup": kw.pop("setup", ""), "full": kw.pop("full", False), "wait": kw.pop("wait", 700),
         "note": note if isinstance(note, list) else [note, ""], "items": items}
    d.update(kw)
    return d


CAN_ACT = "実績精算の確定の権限（フル権限・経理）がある役割だけに表示。物流・CS・営業・商品管理・商品開発・閲覧のみには出さない（閲覧とCSV出力だけ。物流は実績精算・請求の確定・請求書が R・台帳 F 2026-10-08）"
CAN_EDIT_VI = "Chỉ hiển thị cho vai trò có quyền chốt đối soát thực tế (quyền đầy đủ, kế toán). Logistics, CS, kinh doanh, quản lý sản phẩm, phát triển sản phẩm, chỉ xem thì không hiển thị"
DAY_COND = ["確定できる日（報告済みの拠点は締め月の21日から、未報告の拠点は25日から）より前は非活性にして、理由をツールチップで出す", "Trước ngày chốt được (chi nhánh đã báo cáo từ ngày 21 của tháng chốt sổ, chi nhánh chưa báo cáo từ ngày 25) thì vô hiệu hóa nút và hiển thị lý do bằng tooltip"]
DAY_TIP = ["確定できる日は、報告済みの拠点は締め月の21日から、未報告の拠点は25日から（「25日」は締め月の25日。25日に事務手数料を自動で足す）。それより前はボタンを非活性にして理由をツールチップで出す（E185。押してからエラーにはしない）", "Ngày chốt được: chi nhánh đã báo cáo từ ngày 21 của tháng chốt sổ, chi nhánh chưa báo cáo từ ngày 25 (「25日」 là ngày 25 của tháng chốt sổ. Ngày 25 phí xử lý được tự động cộng). Trước đó thì vô hiệu hóa nút và hiển thị lý do bằng tooltip (E185. Không để người dùng nhấn rồi mới báo lỗi)"]
H_DAY = ["コードは確定できる日の制限がない（台帳 F 2026-10-08）。報告済＝21日から・未報告＝25日からにする", "Code không giới hạn ngày chốt (sổ quyết định F 2026-10-08). Chuyển thành: đã báo cáo từ ngày 21, chưa báo cáo từ ngày 25"]
H_DLG = ["コードは確認なしで実行する。台帳 F 2026-10-08 のとおり確認ダイアログ（%s）を出す", "Code thực hiện không cần xác nhận. Theo sổ quyết định F 2026-10-08, hiển thị hộp thoại xác nhận (%s)"]
NOT_SHOT = "【撮影不可】"

H_WORD = "コードの文言に「後払い」「前請求」がある（宿題 H-A1）。台帳 F・運営E Q-E3 のとおり「実績精算」「固定額」と書く"
H_TERM = "コードは「点検」「申告」「未申告」（宿題 H-A2）。台帳のとおり「棚卸」「報告」「未報告」に直す"
H_PERIOD = "コードは対象期間を 2026-09-21〜10-20 の固定の文字で書いている（宿題 H-A4）。締め月から出す（yyyy-mm-dd〜yyyy-mm-dd・台帳 M-1）"
H_EDIT = "コードの編集画面は価格調整を直接変えられる（承認なし）。台帳 F 2026-10-08 のとおり価格調整は子契約の値のまま（編集画面では直さない。詳細では参照表示）。編集画面は手入力の行の追加・削除に変える"
H_EMPTY = "コードは表の中に 0件の行がない（宿題 H-A6）。I01 を表の中に出す（P-LIST）"
H_LIST = "コードは並べ替えの UI・覚える表示件数がなく、CS にも行チェックが出る（宿題 H-A7）。P-LIST・P-PAGESIZE のとおり設計する"
H_PRICE = "コードは価格調整のあとの価格でロスを換算（logic.ts）。台帳 F（Q-A2）・在庫.md §6-1 は定価で換算（宿題）"
H_TAXADJ = "コードは価格調整差額の税率を 8% 固定で割り戻している。台帳 F（BILL Q-E2）は商品ごとの税率で按分（宿題）"
H_FEE = "コードは日付を見ず、未報告なら 10/05 でも事務手数料の行を出す（宿題 Q-A3）。台帳 F は25日から"
H_MSG = "コードにない文言（宿題）。台帳 F のとおり設計し、メッセージの ID は運営E の空きから採番した"
H_UNACT = "コードは「確定を解除」を確認なしで実行する（宿題 Q-A8）。台帳 F のとおり確認ダイアログ（Q143）を出す"
H_LOCK = "コードは「法人確定中」のロックを持つ（宿題 H-A12）。法人確定の段階は消えたので使わない（運営A Q-C3＝A）"
H_FIX = "コードは操作者名・報告日を固定の文字で出す（宿題 H-A8）。ログイン中の運営・実際の報告日を出す"

JS = ("const sleep=ms=>new Promise(r=>setTimeout(r,ms));"
      "const setv=(el,v)=>{if(!el)return;const p=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;"
      "Object.getOwnPropertyDescriptor(p,'value').set.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}));};"
      "const sets=(el,v)=>{if(!el)return;Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(el,v);el.dispatchEvent(new Event('change',{bubbles:true}));};"
      "const btn=t=>[...document.querySelectorAll('button')].find(b=>b.textContent.replace(/\\s+/g,'').includes(t));"
      "const q=s=>document.querySelector(s);")
SF = ".es-search__fields > div:nth-child(%d)"
SEARCH_BTN = "btn('検索')?.click();await sleep(500);"
CHECK_FIRST = JS + "const c=q('tbody .es-check input');if(c){c.click();await sleep(300);}"

# ================================================================ AW_ACTL_001 一覧
L_HEAD = [
    F("1", "ヘッダー", ".es-pagehead", "area",
      detail=["パンくず・画面名・操作ボタン（CSV出力）。新規登録・削除・CSV取込のボタンは置かない（実績精算は自動で作る。取込なし：CSV入出力_定義 §5）。編集は行の鉛筆（5.16）から AW_ACTL_003 へ。", "Breadcrumb, tên màn hình, nút thao tác (xuất CSV). Không đặt nút đăng ký mới, xóa, nhập CSV (đối soát thực tế được tạo tự động. Không nhập: CSV入出力_定義 §5). Sửa đi từ bút chì của dòng (5.16) sang AW_ACTL_003."], vi="Header"),
    F("1.1", "パンくず", ".es-breadcrumb", "label", detail=["「請求 / 実績精算」。", "「請求 / 実績精算」."], vi="Breadcrumb"),
    F("1.2", "画面名", ".es-pagehead__title", "label", detail=["「実績精算」", "Tên màn hình hiển thị là 「実績精算」."], vi="Tên màn hình"),
    F("1.3", "CSV出力", ".es-pagehead__actions button::CSV出力", "button", "click", pattern="P-CSV-OUT", err=["S12"],
      detail=["検索条件のとおりの全件を出す（ページに関係なく）。1行＝1拠点（子契約）。列＝画面の列（子契約番号・拠点ID・拠点名・法人ID・法人名・適用プラン・免責（税込）・棚卸・報告日・差分率・廃棄率・管理ロス・免責超過・現金回収差額・価格調整差額・当月へ繰入・実績精算。金額は税込と税抜を別の列に出す）＋全項目の ID・名前・状態・更新日時。商品別の数量は出さない（要望が出てから）。ファイル名＝実績精算_{条件}_{yyyymmdd-HHmm}.csv（条件なしは「全件」）。閲覧できる役割すべてに出す。", "Xuất toàn bộ theo điều kiện tìm kiếm (không phụ thuộc trang). 1 dòng = 1 chi nhánh (hợp đồng con). Cột = các cột trên màn hình (số hợp đồng con, ID chi nhánh, tên chi nhánh, ID công ty, tên công ty, plan áp dụng, miễn trách (gồm thuế), kiểm kê, ngày báo cáo, tỷ lệ chênh lệch, tỷ lệ hủy, hao hụt quản lý, vượt miễn trách, chênh lệch thu tiền mặt, chênh lệch điều chỉnh giá, chuyển vào tháng này, đối soát thực tế. Số tiền xuất riêng cột gồm thuế và chưa thuế) + ID, tên, trạng thái, ngày giờ cập nhật của mọi mục. Không xuất số lượng theo sản phẩm (đợi khi có yêu cầu). Tên file = 実績精算_{điều kiện}_{yyyymmdd-HHmm}.csv (không có điều kiện là 「全件」). Hiển thị cho mọi vai trò xem được."],
      demo_ok=["コードの列は画面の列だけで、ID・名前・状態・更新日時が足りない（台帳 F 運営E 横断 X3・宿題）。コードは「申告日」「申告済」「未申告」の文字を出す（H-A2）", "Các cột trong code chỉ là cột trên màn hình, thiếu ID, tên, trạng thái, ngày giờ cập nhật (sổ quyết định F 運営E 横断 X3, bài tập). Code hiển thị chữ 「申告日」「申告済」「未申告」 (H-A2)"], vi="Xuất CSV"),
]
L_META = [
    F("2", "見出しの下の情報", ".bl-meta", "area", detail=["対象月・対象期間・棚卸の報告の件数・確認が必要な件数と、一覧の使い方の1行説明。", "Tháng đối tượng, kỳ đối tượng, số chi nhánh đã báo cáo kiểm kê, số mục cần xác nhận, và 1 dòng giải thích cách dùng danh sách."], vi="Thông tin dưới tiêu đề"),
    F("2.1", "対象月", ".bl-meta .es-badge", "label", detail=["検索で選んだ対象月（初期＝当月。当月には「当月」と付ける）。", "Tháng đã chọn ở tìm kiếm (mặc định = tháng hiện tại. Tháng hiện tại ghi thêm 「当月」)."], vi="Tháng đối tượng"),
    F("2.2", "対象期間", ".bl-meta .es-badge::対象期間", "label", len="日付 yyyy-mm-dd〜yyyy-mm-dd",
      detail=["実績精算の期間（前月21日〜当月20日）。選んだ対象月から出す。", "Kỳ đối soát thực tế (ngày 21 tháng trước đến ngày 20 tháng này). Tính từ tháng đối tượng đã chọn."], demo_ok=[H_PERIOD, "Code ghi kỳ đối tượng bằng chuỗi cố định 2026-09-21〜10-20 (bài tập H-A4). Phải tính từ tháng chốt sổ (yyyy-mm-dd〜yyyy-mm-dd, sổ quyết định M-1)"], vi="Kỳ đối tượng"),
    F("2.3", "棚卸の報告の件数", ".bl-meta .es-badge::棚卸", "label",
      detail=["「棚卸 n/m 報告済」。m は棚卸なしの拠点を除いた拠点数。棚卸なしの拠点があるときは「（棚卸なし k拠点）」を添える。すべて報告済みなら緑、未報告があれば赤。", "「棚卸 n/m 報告済」. m là số chi nhánh trừ chi nhánh không kiểm kê. Nếu có chi nhánh không kiểm kê thì thêm 「（棚卸なし k拠点）」. Báo cáo đủ thì màu xanh lá, còn chưa báo cáo thì màu đỏ."],
      demo_ok=[H_TERM, "Code dùng 「点検」「申告」「未申告」 (bài tập H-A2). Theo sổ quyết định, sửa thành 「棚卸」「報告」「未報告」"], vi="Số chi nhánh báo cáo kiểm kê"),
    F("2.4", "確認が必要な件数", ".bl-meta .es-badge::件", "label", cond=["差分率（絶対値）または廃棄率が10%以上で未確定の拠点があるときだけ出す。当月だけ（過去月では出さない）", "Chỉ hiển thị khi có chi nhánh chưa chốt có giá trị tuyệt đối của tỷ lệ chênh lệch hoặc tỷ lệ hủy từ 10% trở lên. Chỉ tháng hiện tại (tháng đã qua không hiển thị)"],
      detail=["「n件（差分率・廃棄率 10%以上）」を赤で出す。n は検索で絞り込んだ行のうち、未確定でアラートのある行の数。", "Hiển thị màu đỏ 「n件（差分率・廃棄率 10%以上）」. n là số dòng chưa chốt có cảnh báo trong các dòng đã lọc bằng tìm kiếm."], demo_ok=["【撮影不可】見本（seed）に差分率・廃棄率が10%以上の拠点がないため、撮れない（コードは対応済み）", "【Không chụp được】Dữ liệu mẫu (seed) không có chi nhánh có tỷ lệ chênh lệch・tỷ lệ hủy từ 10% trở lên nên không chụp được (code đã hỗ trợ)"], vi="Số mục cần xác nhận"),
    F("2.5", "一覧の説明", ".bl-meta .small", "label",
      detail=["棚卸の結果から精算差額を出し、実績精算として子契約に載せる、という1行の説明。「後払い」とは書かない（運営E Q-E3）。", "1 dòng giải thích: từ kết quả kiểm kê tính chênh lệch đối soát rồi ghi vào hợp đồng con thành đối soát thực tế. Không ghi 「後払い」 (運営E Q-E3)."], demo_ok=[H_WORD, "Code có từ 「後払い」「前請求」 (bài tập H-A1). Theo sổ quyết định F và 運営E Q-E3, ghi là 「実績精算」「固定額」"], vi="Giải thích danh sách"),
]
L_SUM = [
    F("3", "サマリー", ".bl-sumgrid", "area", detail=["検索条件の全件の合計を3枚で出す。金額は上が税込・下が税抜の2段（台帳 M-3）。", "Hiển thị tổng của toàn bộ theo điều kiện tìm kiếm bằng 3 thẻ. Số tiền 2 tầng, trên là gồm thuế, dưới là chưa thuế (sổ quyết định M-3)."], vi="Tổng hợp"),
    F("3.1", "現金回収差額", ".bl-sumgrid .es-field::現金回収差額", "label", len="金額（円・税込／税抜）",
      detail=["アプリの現金支払いの「回収予定 − ドライバーの回収」の合計。税率は設定管理の「現金回収差額の税率」（初期 8%）。符号つき。", "Tổng của 「số tiền dự kiến thu − số tiền tài xế thu」 của thanh toán tiền mặt trên app. Thuế suất là 「thuế suất chênh lệch thu tiền mặt」 của quản lý thiết lập (ban đầu 8%). Có dấu."], vi="Chênh lệch thu tiền mặt"),
    F("3.2", "管理ロス", ".bl-sumgrid .es-field::管理ロス", "label", len="金額（円・税込／税抜）",
      detail=["管理ロスの合計（定価で換算）。補足に「うち免責超過 n円（税込）」。", "Tổng hao hụt quản lý (quy đổi theo giá niêm yết). Phần bổ sung ghi 「うち免責超過 n円（税込）」."], demo_ok=[H_PRICE, "Code quy đổi hao hụt theo giá sau điều chỉnh giá (logic.ts). Sổ quyết định F (Q-A2) và 在庫.md §6-1 quy đổi theo giá niêm yết (bài tập)"], vi="Hao hụt quản lý"),
    F("3.3", "当月の請求へ繰入", ".bl-sumgrid .es-field::当月の請求へ繰入", "label", len="金額（円・税込／税抜）",
      detail=["請求書の ② に載る実績精算の金額すべて＝免責超過 ＋ 現金回収差額 ＋ 価格調整差額 ＋ 事務手数料 ＋ 惣菜買取 ＋ 代替品（請求書の ② と一致させる）。事務手数料は25日から載る。買取の拠点は買取の金額だけ。", "Toàn bộ số tiền đối soát thực tế ghi ở mục ② của hóa đơn = vượt miễn trách + chênh lệch thu tiền mặt + chênh lệch điều chỉnh giá + phí xử lý + mua đứt món ăn + sản phẩm thay thế (khớp với mục ② của hóa đơn). Phí xử lý được tính từ ngày 25. Chi nhánh mua đứt chỉ tính số tiền mua đứt."],
      demo_ok=[H_TAXADJ, "Code chia ngược chênh lệch điều chỉnh giá với thuế suất cố định 8%. Sổ quyết định F (BILL Q-E2) phân bổ theo thuế suất của từng sản phẩm (bài tập)"], vi="Chuyển vào hóa đơn tháng này"),
]
L_SEARCH = [
    F("4", "検索条件", ".es-search", "area", pattern="P-LIST",
      detail=["条件は「検索」か Enter で反映する。条件の欄は es-search（折り返し・右に クリア／検索）。", "Điều kiện được áp dụng khi nhấn 「検索」 hoặc Enter. Khung điều kiện là es-search (xuống dòng, bên phải có Xóa / Tìm kiếm)."], vi="Điều kiện tìm kiếm"),
    F("4.1", "対象月", SF % 1, "select", "select", req="○", len="選択（写し〔確定時の保存〕のある月すべて。新しい月が上。「すべて」は無い）", init=["当月", "Tháng hiện tại"], ex=["2026年10月（当月）", "Tháng 10 năm 2026 (tháng hiện tại)"],
      detail=["選べる月は写しのある月すべて（件数はドロップダウンで足りる）。初期＝当月。過去の月は参照だけ（状態 010）。締め月は運営が「締め月を進める」操作で進める（暦では自動で進めない）。この操作は請求の確定・請求書（AW_BILL 001 No.1.3）に置く。押せない間は非活性にして理由をツールチップで出し、押してからエラーは出さない。押すと確認ダイアログ（元に戻せない旨）を出す。", "Các tháng chọn được là mọi tháng có bản sao. Mặc định = tháng hiện tại. Tháng đã qua chỉ để xem (trạng thái 010). Tháng chốt sổ do vận hành tiến lên bằng thao tác 「締め月を進める」 (không tự tiến theo lịch). Thao tác này được đặt ở 請求の確定・請求書 (AW_BILL 001 No.1.3). Khi chưa nhấn được thì vô hiệu hóa nút và hiển thị lý do bằng tooltip, không báo lỗi sau khi nhấn. Khi nhấn hiện hộp thoại xác nhận (nêu rõ không hoàn tác được)."],
      demo_ok=["コードは 2026-10・2026-09・2026-08 の固定の3つ（宿題。台帳 F 運営E 横断 X2）", "Code cố định 3 tháng 2026-10・2026-09・2026-08 (bài tập. Sổ quyết định F 運営E 横断 X2)"], vi="Tháng đối tượng"),
    F("4.2", "法人名・法人ID", SF % 2, "text", "input", req="－", len="文字列 60", init=["空", "Trống"], ex=["CU00643", "Mã công ty (ví dụ: CU00643)"], err=["E04"],
      detail=["法人名・法人ID の部分一致。全角・半角、大文字・小文字を区別しない。", "Khớp một phần tên công ty, ID công ty. Không phân biệt toàn giác/bán giác, chữ hoa/chữ thường."], vi="Tên công ty / ID công ty"),
    F("4.3", "拠点名・子契約番号", SF % 3, "text", "input", req="－", len="文字列 60", init=["空", "Trống"], ex=["本社", "Tên chi nhánh (ví dụ: Trụ sở chính)"], err=["E04"],
      detail=["拠点名・子契約番号の部分一致。", "Khớp một phần tên chi nhánh, số hợp đồng con."], vi="Tên chi nhánh / số hợp đồng con"),
    F("4.4", "棚卸報告", SF % 4, "select", "select", req="－", len="選択（すべて／報告済／未報告）", init=["すべて（条件名を表示）", "Tất cả (hiển thị tên điều kiện)"], ex=["未報告", "Giá trị lọc 「未報告」 (chưa báo cáo)"],
      detail=["棚卸の報告の有無で絞る。TOP の「廃棄率が 3% を超えた拠点 n件」からは実績精算の「未確定」（?st=no）で来る。", "Lọc theo có báo cáo kiểm kê hay không. Từ 「廃棄率が 3% を超えた拠点 n件」 ở TOP sẽ sang 「未確定」 (?st=no) của đối soát thực tế."],
      demo_ok=[H_TERM, "Code dùng 「点検」「申告」「未申告」 (bài tập H-A2). Theo sổ quyết định, sửa thành 「棚卸」「報告」「未報告」"], vi="Báo cáo kiểm kê"),
    F("4.5", "実績精算", SF % 5, "select", "select", req="－", len="選択（すべて／確定／未確定）", init=["すべて（条件名を表示）", "Tất cả (hiển thị tên điều kiện)"], ex=["未確定", "Giá trị lọc 「未確定」 (chưa chốt)"],
      detail=["実績精算の確定の有無で絞る。「対象外」の拠点（休止中）は「未確定」にも「確定」にも含めない。休止の始めの報告があった月は通常の行なので含める（翌月から対象外）。", "Lọc theo đã chốt hay chưa chốt đối soát thực tế. Chi nhánh 「対象外」 (đang tạm dừng) không thuộc 「未確定」 cũng không thuộc 「確定」. Tháng có báo cáo bắt đầu tạm dừng là dòng thường nên được tính (từ tháng sau là ngoài đối tượng)."], vi="Đối soát thực tế"),
    F("4.6", "クリア", ".es-search__main button::クリア", "button", "click", detail=["条件を初期値に戻し、1ページ目から表示し直す（対象月は当月に戻る）。", "Đưa điều kiện về giá trị ban đầu và hiển thị lại từ trang 1 (tháng đối tượng quay về tháng hiện tại)."], vi="Xóa"),
    F("4.7", "検索", ".es-search__main button::検索", "button", "click", detail=["条件を反映して1ページ目から表示する。選択中の行は解除する。", "Áp dụng điều kiện và hiển thị từ trang 1. Bỏ chọn các dòng đang chọn."], vi="Tìm kiếm"),
    F("4.8", "並べ替え", "-", "select", "select", req="－", len="選択（一覧の全列・昇順／降順）", init=["要対応の行が上、そのあと拠点ID 昇順", "Dòng cần xử lý ở trên, sau đó ID chi nhánh tăng dần"], ex=["管理ロス 降順", "Hao hụt quản lý giảm dần (cột + chiều sắp xếp)"],
      detail=["初期の並びは、要対応の行（未確定、または差分率 10% 以上）を上、そのあと拠点ID の昇順（実績精算は月次の作業一覧で、請求の確定と同じ考え方）。検索の枠の「並べ替え」で並べる項目を選ぶ（P-LIST）。同じ値の行は子契約番号の昇順。並べ替え・検索・ページ送りは組み合わせて使え、変えると1ページ目に戻る。", "Thứ tự ban đầu: dòng cần xử lý (chưa chốt, hoặc tỷ lệ chênh lệch từ 10% trở lên) ở trên, sau đó ID chi nhánh tăng dần (đối soát thực tế là danh sách công việc hằng tháng, cùng cách nghĩ với chốt hóa đơn). Chọn mục sắp xếp ở 「並べ替え」 của khung tìm kiếm (P-LIST). Dòng cùng giá trị thì theo số hợp đồng con tăng dần. Sắp xếp, tìm kiếm, chuyển trang dùng kết hợp được, thay đổi thì quay về trang 1."],
      demo_ok=[H_LIST, "Code không có UI sắp xếp, không ghi nhớ số dòng hiển thị, và CS cũng có checkbox dòng (bài tập H-A7). Thiết kế theo P-LIST・P-PAGESIZE"], vi="Sắp xếp"),
]
L_TABLE = [
    F("5", "一覧の表", ".es-table-wrap", "table", pattern="P-LIST",
      detail=["1行＝1拠点（子契約）。初期の並び＝要対応の行（未確定、または差分率 10% 以上）が上、そのあと拠点ID の昇順。1ページ10件（10／20／50）。子契約番号を押すと詳細（AW_ACTL_002）。金額の列は右寄せで、上が税込・下が税抜の2段（台帳 M-3）。右端の操作の列に鉛筆（編集・5.16）を置く（編集画面 AW_ACTL_003 を残すため・台帳 F 2026-10-08）。", "1 dòng = 1 chi nhánh (hợp đồng con). Thứ tự ban đầu = dòng cần xử lý (chưa chốt, hoặc tỷ lệ chênh lệch từ 10% trở lên) ở trên, sau đó ID chi nhánh tăng dần. 1 trang 10 dòng (10／20／50). Nhấn số hợp đồng con để mở chi tiết (AW_ACTL_002). Cột số tiền căn phải, trên là gồm thuế, dưới là chưa thuế (sổ quyết định M-3). Đặt cột thao tác ở ngoài cùng bên phải với bút chì (sửa・5.16) (vì giữ màn hình sửa AW_ACTL_003・sổ quyết định F 2026-10-08)."],
      demo_ok=[H_LIST, "Code không có UI sắp xếp, không ghi nhớ số dòng hiển thị, và CS cũng có checkbox dòng (bài tập H-A7). Thiết kế theo P-LIST・P-PAGESIZE"], vi="Bảng danh sách"),
    F("5.1", "すべて選択", "thead .es-check", "check", "check", req="－", len="選択（オン／オフ）", init=["オフ", "Tắt"], ex=["オン", "Bật"], cond=[CAN_ACT + "。かつ選べる行（未確定・アラートなし・対象外でない・請求書に載っていない・確定できる日に達している）が1件以上あるとき", "Chỉ hiển thị cho vai trò có quyền chốt đối soát thực tế (quyền đầy đủ, kế toán). Logistics, CS, kinh doanh, quản lý sản phẩm, phát triển sản phẩm, chỉ xem thì không hiển thị (chỉ xem và xuất CSV). Và chỉ khi có từ 1 dòng trở lên chọn được (chưa chốt, không cảnh báo, không ngoài đối tượng, chưa vào hóa đơn, đã đến ngày chốt được)"],
      detail=["選べる行を全部選ぶ／全部外す。差分率・廃棄率が10%以上の行は含めない（詳細で確かめて1件ずつ確定する・台帳 L）。過去月では出さない。", "Chọn / bỏ chọn tất cả các dòng chọn được. Không gồm dòng có tỷ lệ chênh lệch, tỷ lệ hủy từ 10% trở lên (xác nhận ở màn chi tiết rồi chốt từng dòng, sổ quyết định L). Tháng đã qua không hiển thị."],
      demo_ok=[H_LIST, "Code không có UI sắp xếp, không ghi nhớ số dòng hiển thị, và CS cũng có checkbox dòng (bài tập H-A7). Thiết kế theo P-LIST・P-PAGESIZE"], vi="Chọn tất cả"),
    F("5.2", "子契約番号・拠点", "th::子契約番号", "link", "click", len="文字列 CP＋連番-yyyymm",
      detail=["子契約番号（親契約番号＋サイクル月）と拠点名。子契約番号を押すと詳細（AW_ACTL_002。過去月を見ているときは ?m= を付けて同じ月の詳細）へ。", "Số hợp đồng con (số hợp đồng cha + tháng chu kỳ) và tên chi nhánh. Nhấn số hợp đồng con để sang chi tiết (AW_ACTL_002. Khi đang xem tháng đã qua thì thêm ?m= để sang chi tiết của cùng tháng)."], vi="Số hợp đồng con / chi nhánh"),
    F("5.3", "適用プランと免責", "th::適用プラン", "label", len="文字列", detail=["プランID＋プラン名。下に「免責 n円（税込）」（プランマスタの免責金額）。", "ID plan + tên plan. Bên dưới là 「免責 n円（税込）」 (số tiền miễn trách của プランマスタ)."], vi="Plan áp dụng và miễn trách"),
    F("5.4", "棚卸", "th::棚卸", "label",
      detail=["棚卸の報告の状態。報告済（緑・報告日を下に）／未報告（赤）／棚卸なし（灰）。", "Trạng thái báo cáo kiểm kê. Đã báo cáo (xanh lá, ngày báo cáo ở dưới) / chưa báo cáo (đỏ) / không kiểm kê (xám)."], demo_ok=[H_TERM, "Code dùng 「点検」「申告」「未申告」 (bài tập H-A2). Theo sổ quyết định, sửa thành 「棚卸」「報告」「未報告」"], vi="Kiểm kê"),
    F("5.5", "差分率", "th::差分率", "label", len="数値（%）", detail=["（理論 − 報告）÷ 理論。絶対値で10%以上は赤（報告が多い＝マイナスのときも同じ）。右寄せ。報告がないときは「—」。", "(Lý thuyết − báo cáo) ÷ lý thuyết. Giá trị tuyệt đối từ 10% trở lên màu đỏ (khi báo cáo nhiều hơn = âm cũng giống vậy). Căn phải. Khi chưa có báo cáo hiển thị 「—」."], demo_ok=[H_TERM, "Code dùng 「点検」「申告」「未申告」 (bài tập H-A2). Theo sổ quyết định, sửa thành 「棚卸」「報告」「未報告」"], vi="Tỷ lệ chênh lệch"),
    F("5.6", "廃棄率", "th::廃棄率", "label", len="数値（%）", detail=["廃棄 ÷（前回の在庫 ＋ 納品）。10%以上は赤。右寄せ。", "Hủy ÷ (tồn kho lần trước + giao hàng). Từ 10% trở lên màu đỏ. Căn phải."], vi="Tỷ lệ hủy"),
    F("5.7", "管理ロス", "th::管理ロス", "label", len="金額（円・税込／税抜）", detail=["（理論在庫 − 実在庫）を定価で換算した額。右寄せ。", "Số tiền quy đổi (tồn kho lý thuyết − tồn kho thực) theo giá niêm yết. Căn phải."], demo_ok=[H_PRICE, "Code quy đổi hao hụt theo giá sau điều chỉnh giá (logic.ts). Sổ quyết định F (Q-A2) và 在庫.md §6-1 quy đổi theo giá niêm yết (bài tập)"], vi="Hao hụt quản lý"),
    F("5.8", "免責超過", "th::免責超過", "label", len="金額（円・税込／税抜）", detail=["管理ロス − 免責金額（0未満は0）。0より大きいときは赤。右寄せ。", "Hao hụt quản lý − số tiền miễn trách (dưới 0 thì là 0). Lớn hơn 0 thì màu đỏ. Căn phải."], vi="Vượt miễn trách"),
    F("5.9", "現金回収差額", "th::現金回収差額", "label", len="金額（円・税込／税抜）",
      detail=["現金利用のある拠点だけ金額（符号つき）を出す。現金利用のない拠点は「現金なし」。右寄せ。", "Chỉ chi nhánh có dùng tiền mặt mới hiển thị số tiền (có dấu). Chi nhánh không dùng tiền mặt hiển thị 「現金なし」. Căn phải."], vi="Chênh lệch thu tiền mặt"),
    F("5.10", "価格調整差額", "th::価格調整差額", "label", len="金額（円・税込／税抜）",
      detail=["実績精算の内訳の1行（管理ロス・現金回収差額・価格調整差額）として金額（±）を出す。その実績精算と同じ請求書の ② に載る。ないときは「—」。当月へ繰入の列に含める（請求書の ② に載る金額と一致）。税率は商品ごとの税率で按分する（8% 固定にしない）。値は子契約の価格調整から決まる（ここでは直せない）。", "Hiển thị số tiền (±) như 1 dòng trong các khoản của đối soát thực tế (hao hụt quản lý・chênh lệch thu tiền mặt・chênh lệch điều chỉnh giá). Ghi ở mục ② của cùng hóa đơn với đối soát thực tế đó. Không có thì hiển thị 「—」. Được tính vào cột chuyển vào tháng này (khớp với số tiền ghi ở mục ② của hóa đơn). Thuế suất phân bổ theo thuế suất của từng sản phẩm (không cố định 8%). Giá trị được quyết định từ điều chỉnh giá của hợp đồng con (không sửa được ở đây)."],
      demo_ok=[H_TAXADJ + "。見出しの補足「翌月の前請求へ」は付けない（H-A1）", "Code chia ngược chênh lệch điều chỉnh giá với thuế suất cố định 8%. Sổ quyết định F (BILL Q-E2) phân bổ theo thuế suất của từng sản phẩm (bài tập). Phần bổ sung của tiêu đề 「翌月の前請求へ」 không ghi (H-A1)"], vi="Chênh lệch điều chỉnh giá"),
    F("5.11", "当月へ繰入", "th::当月へ繰入", "label", len="金額（円・税込／税抜）", detail=["請求書の ② に載る実績精算の金額すべて＝免責超過 ＋ 現金回収差額 ＋ 価格調整差額 ＋ 事務手数料 ＋ 惣菜買取 ＋ 代替品。買取の拠点は買取の金額だけ。休止中・「対象外」は「—」。青の太字。右寄せ。", "Toàn bộ số tiền đối soát thực tế ghi ở mục ② của hóa đơn = vượt miễn trách + chênh lệch thu tiền mặt + chênh lệch điều chỉnh giá + phí xử lý + mua đứt món ăn + sản phẩm thay thế. Chi nhánh mua đứt chỉ tính số tiền mua đứt. Tạm dừng・「対象外」 là 「—」. Chữ đậm màu xanh dương. Căn phải."], vi="Chuyển vào tháng này"),
    F("5.12", "確定", "th::確定", "label",
      detail=["確定済（緑「確定」）／未確定（黄「未確定 n/3」。n は確定した内訳の数）。差分率・廃棄率が10%以上の未確定の行は、バッジの下に確認が必要を示す赤のバッジ（文言は状態 007 の注記のとおり）を出す（押すと詳細へ）。「対象外」の拠点（休止の始めの報告があった月の翌月から／運営が「スキップ」を選んだ月から／リリース時にすでに休止中の拠点は最初から）は「休止中（対象外）」のバッジ。休止の始めの報告があった月は通常の行（実績精算を確定できる）。", "Đã chốt (xanh lá 「確定」) / chưa chốt (vàng 「未確定 n/3」. n là số khoản đã chốt). Dòng chưa chốt có tỷ lệ chênh lệch, tỷ lệ hủy từ 10% trở lên thì dưới badge có badge đỏ báo cần xác nhận (câu chữ theo ghi chú của trạng thái 007) (nhấn sẽ sang chi tiết). Chi nhánh 「対象外」 (từ tháng sau tháng có báo cáo bắt đầu tạm dừng / từ tháng vận hành chọn 「スキップ」 / chi nhánh đã tạm dừng sẵn lúc phát hành thì ngay từ đầu) có badge 「休止中（対象外）」. Tháng có báo cáo bắt đầu tạm dừng là dòng thường (chốt đối soát thực tế được)."], vi="Chốt"),
    F("5.13", "行のチェック", "tbody .es-check", "check", "check", req="－", len="選択（オン／オフ）", init=["オフ", "Tắt"], ex=["オン", "Bật"], cond=[CAN_ACT + "。かつ未確定・アラートなし・対象外でない・請求書に載っていない・確定できる日に達している行だけ（報告済＝締め月の21日から・未報告＝25日から）", "Chỉ hiển thị cho vai trò có quyền chốt đối soát thực tế (quyền đầy đủ, kế toán). Logistics, CS, kinh doanh, quản lý sản phẩm, phát triển sản phẩm, chỉ xem thì không hiển thị (chỉ xem và xuất CSV). Và chỉ dòng chưa chốt, không cảnh báo, không ngoài đối tượng, chưa vào hóa đơn, đã đến ngày chốt được (đã báo cáo: từ ngày 21 của tháng chốt sổ, chưa báo cáo: từ ngày 25)"],
      detail=["選ぶと行を強調し、下に選択バーを出す。確定済み・確認が必要な行・対象外（休止中）・請求済み・確定できる日の前の行にはチェックを出さない（報告済みの拠点は締め月の21日から、未報告の拠点は25日から）。", "Khi chọn thì làm nổi dòng và hiển thị thanh chọn bên dưới. Dòng đã chốt, dòng cần xác nhận, dòng ngoài đối tượng (tạm dừng), dòng đã xuất hóa đơn, dòng chưa đến ngày chốt được không hiển thị checkbox (đã báo cáo: từ ngày 21 của tháng chốt sổ, chưa báo cáo: từ ngày 25)."], demo_ok=[H_LIST + "。" + H_DAY[0], "Code không có UI sắp xếp, không ghi nhớ số dòng hiển thị, và CS cũng có checkbox dòng (bài tập H-A7). Thiết kế theo P-LIST・P-PAGESIZE. " + H_DAY[1]], vi="Checkbox dòng"),
    F("5.14", "合計行", "tfoot", "label", len="金額（円・税込／税抜）",
      detail=["検索条件の全件の合計（ページに関係なく）。管理ロス・免責超過・現金回収差額・価格調整差額・当月へ繰入。対象外の拠点は含めない（休止の始めの月は通常の行なので含める）。", "Tổng của toàn bộ theo điều kiện tìm kiếm (không phụ thuộc trang). Hao hụt quản lý, vượt miễn trách, chênh lệch thu tiền mặt, chênh lệch điều chỉnh giá, chuyển vào tháng này. Không gồm chi nhánh ngoài đối tượng (tháng bắt đầu tạm dừng là dòng thường nên được tính)."], vi="Dòng tổng"),
    F("5.15", "0件の表示", "-", "label", "show", err=["I01"], detail=["表の中に I01 を1行で出す。", "Hiển thị I01 trong 1 dòng của bảng."], demo_ok=[H_EMPTY, "Code không có dòng 0 kết quả trong bảng (bài tập H-A6). Hiển thị I01 trong bảng (P-LIST)"], vi="Hiển thị 0 kết quả"),
    F("5.16", "編集（鉛筆）", "tbody tr .es-btn--icon", "button", "click",
      cond=[CAN_ACT + "。かつ当月で、未確定・請求書に載っていない・対象外でない行だけ", "%s. Và chỉ dòng của tháng hiện tại, chưa chốt, chưa vào hóa đơn, không ngoài đối tượng" % CAN_EDIT_VI],
      detail=["行の右端の鉛筆。押すとその拠点の編集画面（AW_ACTL_003・/ops/billing/actuals/{拠点ID}/edit）へ移る。確定済み・請求済み・対象外・過去月の行には出さない（開けないため）。", "Bút chì ở cuối bên phải dòng. Nhấn để sang màn hình sửa của chi nhánh đó (AW_ACTL_003・/ops/billing/actuals/{ID chi nhánh}/edit). Không hiển thị ở dòng đã chốt, đã xuất hóa đơn, ngoài đối tượng, tháng đã qua (vì không mở được)."],
      open=["【要確認】編集の権限（誰が編集画面を開けるか）は台帳に決定がない。確定の権限（フル権限・経理）と同じにするのは仮置き", "【Cần xác nhận】Quyền sửa (ai mở được màn hình sửa) chưa có quyết định trong sổ quyết định. Đặt giống quyền chốt (quyền đầy đủ, kế toán) chỉ là tạm"], ask="hong",
      demo_ok=["コードは鉛筆を出す（画面の権限 update を持つ役割）。権限は上の仮置きに合わせる", "Code có hiển thị bút chì (vai trò có quyền update của màn hình). Quyền sẽ chỉnh theo phần tạm đặt ở trên"], vi="Sửa (bút chì)"),
]
L_PAGER = [
    F("6", "ページ送り", ".es-pagination", "area", pattern="P-LIST", detail=["「n件中 a–b件」・前へ・番号・次へ・表示件数。", "「n件中 a–b件」, trước, số trang, sau, số dòng hiển thị."], vi="Chuyển trang"),
    F("6.1", "表示件数", 'select[aria-label="表示件数"]', "select", "select", req="－", len="選択（10／20／50 件／ページ）", init=["10件／ページ", "10 dòng / trang"], ex=["20件／ページ", "20 dòng / trang"], pattern="P-PAGESIZE",
      detail=["変えると1ページ目に戻る。選んだ件数は人ごと・一覧の画面ごとにサーバーに覚える（P-PAGESIZE）。", "Thay đổi thì quay về trang 1. Số dòng đã chọn được server ghi nhớ theo từng người, từng màn hình danh sách (P-PAGESIZE)."], demo_ok=[H_LIST, "Code không có UI sắp xếp, không ghi nhớ số dòng hiển thị, và CS cũng có checkbox dòng (bài tập H-A7). Thiết kế theo P-LIST・P-PAGESIZE"], vi="Số dòng hiển thị"),
]
L_NOTE = [
    F("7", "表の下の注意書き", ".foot", "label",
      detail=["差分率・廃棄率の式、10%以上は赤でまとめて確定できないこと、計算在庫の式、現金は予定と回収の差だけを載せること、金額の税込・税抜の見方。文中の「点検」「申告」は「棚卸」「報告」に直す。", "Công thức tỷ lệ chênh lệch, tỷ lệ hủy; từ 10% trở lên màu đỏ và không chốt hàng loạt được; công thức tồn kho tính toán; tiền mặt chỉ ghi phần chênh lệch giữa dự kiến và thực thu; cách xem thuế/chưa thuế của số tiền. 「点検」「申告」 trong câu sửa thành 「棚卸」「報告」."],
      demo_ok=[H_TERM, "Code dùng 「点検」「申告」「未申告」 (bài tập H-A2). Theo sổ quyết định, sửa thành 「棚卸」「報告」「未報告」"], vi="Ghi chú dưới bảng"),
]
L_BAR = [
    F("8", "選択バー", ".es-selbar", "area", cond=["行を1つ以上選んだとき（当月だけ）。画面の下に浮かせて出す", "Khi chọn từ 1 dòng trở lên (chỉ tháng hiện tại). Hiển thị nổi ở cuối màn hình"],
      detail=["件数・「選択を解除」・操作ボタンを出す。", "Hiển thị số lượng, 「選択を解除」 và các nút thao tác."], vi="Thanh chọn"),
    F("8.1", "選択件数", ".es-selbar__count", "label", detail=["「n件選択中」。", "「n件選択中」."], vi="Số đã chọn"),
    F("8.2", "選択を解除", ".es-selbar__clear", "button", "click", detail=["すべての選択を外す。", "Bỏ tất cả các lựa chọn."], vi="Bỏ chọn"),
    F("8.3", "まとめて確定", ".es-selbar__actions button::まとめて確定", "button", "click", cond=[CAN_ACT, "Chỉ hiển thị cho vai trò có quyền chốt đối soát thực tế (quyền đầy đủ, kế toán). Logistics, CS, kinh doanh, quản lý sản phẩm, phát triển sản phẩm, chỉ xem thì không hiển thị (chỉ xem và xuất CSV)"], err=["Q142", "S11", "W10", "E32"],
      detail=["押すと Q142（確認）。確定すると、選んだ行の3つの内訳をまとめて確定する。結果は確定した件数を S11、確定できなかった件数があれば W10 で出す（長いトーストにしない）。選べる行は確定できる日に達した行だけ（報告済みの拠点は締め月の21日から、未報告の拠点は25日から。それ以外の行にはチェックを出さない）。権限のない役割（物流を含む）にはボタンを出さない（行チェックも出さない）。", "Khi nhấn sẽ hiện Q142 (xác nhận). Khi chốt, chốt hàng loạt 3 khoản của các dòng đã chọn. Kết quả: số dòng đã chốt hiển thị S11, nếu có dòng không chốt được thì hiển thị W10 (không dùng toast dài). Các dòng chọn được chỉ là dòng đã đến ngày chốt được (đã báo cáo: từ ngày 21 của tháng chốt sổ, chưa báo cáo: từ ngày 25; dòng khác không hiển thị checkbox). Vai trò không có quyền (kể cả logistics) không hiển thị nút (checkbox dòng cũng không hiển thị)."],
      demo_ok=["コードは結果を1つの長いトーストに連結する（宿題 H-A15）。S11・W10 に分ける。" + H_DAY[0], "Code nối kết quả thành 1 toast dài (bài tập H-A15). Tách thành S11・W10. " + H_DAY[1]], vi="Chốt hàng loạt"),
]

V_LIST = [
    ST("001", "AW_ACTL_001", ["初期表示（当月・10件）", "Hiển thị ban đầu (tháng hiện tại・10 dòng)"], ["フル権限（Ad00010）で表示。当月＝2026-10・拠点は約13件・すべて「未確定 0/3」（まだ確定した拠点がない）。ほかの役割では 5.1・5.13・選択バー（8.3）が出ない（状態 012）。", "Hiển thị bằng quyền đầy đủ (Ad00010). Tháng hiện tại = 2026-10, khoảng 13 chi nhánh, tất cả 「未確定 0/3」 (chưa có chi nhánh nào được chốt). Với các vai trò khác thì 5.1, 5.13, thanh chọn (8.3) không hiển thị (trạng thái 012)."],
       L_HEAD + L_META[:4] + L_META[5:] + L_SUM + L_SEARCH + L_TABLE + L_PAGER + L_NOTE, "/ops/billing/actuals", full=True),
    ST("002", "AW_ACTL_001", ["検索して絞り込み（棚卸報告＝未報告・実績精算＝未確定）", "Tìm kiếm và lọc (báo cáo kiểm kê = chưa báo cáo・đối soát thực tế = chưa chốt)"], ["棚卸報告で「未報告」・実績精算で「未確定」を選んで「検索」を押したとき（TOP のリンクは ?st=no）。", "Khi chọn 「未報告」 ở báo cáo kiểm kê và 「未確定」 ở đối soát thực tế rồi nhấn 「検索」 (link từ TOP là ?st=no)."],
       [F("9", "絞り込んだ一覧", ".es-table-wrap", "table", "view", detail=["条件に合う拠点だけを1ページ目から出す。サマリー・合計行・件数も絞り込み後の全件から出す。", "Chỉ hiển thị các chi nhánh khớp điều kiện từ trang 1. Tổng hợp, dòng tổng, số lượng cũng tính từ toàn bộ sau khi lọc."], vi="Danh sách đã lọc")],
       "/ops/billing/actuals?st=no", setup=JS + "sets(q('.es-search__fields > div:nth-child(4) select'),'no');await sleep(200);" + SEARCH_BTN),
    ST("003", "AW_ACTL_001", ["該当なし（0件・I01）", "Không có kết quả (0 dòng・I01)"], ["法人名・法人ID の欄に zzz を入れて検索したとき。コードは表の中に0件の行がない（宿題 H-A6）。", "Khi nhập zzz vào ô tên công ty / ID công ty rồi tìm kiếm. Code không có dòng 0 kết quả trong bảng (bài tập H-A6)."],
       [F("10", "0件のメッセージ", "-", "label", "show", err=["I01"], detail=["表の中に I01 を1行で出す。サマリーと合計行は 0円。", "Hiển thị I01 trong 1 dòng của bảng. Tổng hợp và dòng tổng là 0 yên."], demo_ok=[H_EMPTY, "Code không có dòng 0 kết quả trong bảng (bài tập H-A6). Hiển thị I01 trong bảng (P-LIST)"], vi="Thông báo 0 kết quả")],
       "/ops/billing/actuals", setup=JS + "setv(q('.es-search__fields > div:nth-child(2) input'),'zzz');await sleep(200);" + SEARCH_BTN),
    ST("004", "AW_ACTL_001", ["ページ送り・表示件数", "Chuyển trang・số dòng hiển thị"], ["表示件数を 10件 のままにして「次へ」を押す。表示件数を 20件／50件 に変えると1ページ目に戻る。見本は約13拠点なので10件のとき2ページ。", "Giữ số dòng hiển thị là 10 dòng và nhấn 「次へ」. Đổi số dòng sang 20 / 50 thì quay về trang 1. Dữ liệu mẫu có khoảng 13 chi nhánh nên khi 10 dòng sẽ có 2 trang."],
       L_PAGER, "/ops/billing/actuals", setup=JS + "const n=q('.es-pagination button[aria-label=\"次へ\"]');if(n){n.click();await sleep(400);}"),
    ST("005", "AW_ACTL_001", ["行を選択（選択バー「まとめて確定」）", "Chọn dòng (thanh chọn 「まとめて確定」)"], ["行のチェックを1つ入れたとき。選択バーが画面の下に出る（フル権限）。チェックが出るのは確定できる日に達した行だけなので、デモの日付は 10/26（未報告の拠点も25日を過ぎている）にする。", "Khi tick 1 checkbox dòng. Thanh chọn hiển thị ở cuối màn hình (quyền đầy đủ). Checkbox chỉ hiển thị ở dòng đã đến ngày chốt được nên ngày demo là 10/26 (chi nhánh chưa báo cáo cũng đã qua ngày 25)."],
       [L_TABLE[13], L_BAR[0], L_BAR[1], L_BAR[2], L_BAR[3]], "/ops/billing/actuals", setup=CHECK_FIRST, today="2026/10/26"),
    ST("006", "AW_ACTL_001", ["まとめて確定の確認（Q142）／結果（S11・W10）", "Xác nhận chốt hàng loạt (Q142) / kết quả (S11・W10)"], ["行を選び「まとめて確定」を押すと確認（Q142）。確定すると結果（S11）。選んだ行のうち一部が確定できなかったとき（別の運営が先に確定した等）は W10 を出す。W10 の状態は seed では作れない。", "Chọn dòng và nhấn 「まとめて確定」 thì hiện xác nhận (Q142). Khi chốt xong hiển thị kết quả (S11). Nếu trong các dòng đã chọn có dòng không chốt được (nhân viên vận hành khác đã chốt trước, v.v.) thì hiển thị W10. Trạng thái W10 không tạo được bằng seed."],
       [F("11", "まとめて確定の確認", ".es-modal__panel", "modal", "show", err=["Q142"],
          detail=["タイトル「n件の実績精算を確定しますか？」。ボタンは「キャンセル」「確定する」。確定すると計算在庫を棚卸の実数に書き換え、金額と単価の写しを固定する。確定したあとの誤りは翌月の実績精算の調整で相殺する。", "Tiêu đề 「n件の実績精算を確定しますか？」. Nút là 「キャンセル」「確定する」. Khi chốt, ghi đè tồn kho tính toán bằng số thực kiểm kê, và cố định bản sao số tiền và đơn giá. Lỗi sau khi chốt được bù trừ bằng điều chỉnh của đối soát thực tế tháng sau."], vi="Xác nhận chốt hàng loạt"),
        F("11.1", "確定の結果", "-", "toast", "show", err=["S11", "W10"],
          detail=["すべて確定できたら S11（「n件を確定しました。」）。一部が確定できなかったら W10（「n件のうちm件は処理できませんでした。」）を出す。確定できなかった行は一覧に残り、理由は詳細で確かめる。", "Nếu chốt được hết thì hiển thị S11 (「n件を確定しました。」). Nếu có dòng không chốt được thì hiển thị W10 (「n件のうちm件は処理できませんでした。」). Dòng không chốt được vẫn còn trong danh sách, lý do xác nhận ở màn chi tiết."],
          demo_ok=["コードは「（…アラートがある n件は確定していません…）」を連結した長いトーストを出す（宿題 H-A15）。確定すると行が確定済みになり後の状態のデータが変わるため、トーストは撮らない（確認ダイアログまで撮る）", "Code hiển thị toast dài nối 「（…アラートがある n件は確定していません…）」 (bài tập H-A15). Khi chốt thì dòng thành đã chốt và dữ liệu của các trạng thái sau thay đổi nên không chụp toast (chỉ chụp đến hộp thoại xác nhận)"], vi="Kết quả chốt")],
       "/ops/billing/actuals", setup=CHECK_FIRST + "btn('まとめて確定')?.click();await sleep(500);", today="2026/10/26"),
    ST("007", "AW_ACTL_001", ["確認が必要な行（差分率・廃棄率が10%以上）", "Dòng cần xác nhận (tỷ lệ chênh lệch・tỷ lệ hủy từ 10% trở lên)"], ["差分率（絶対値）または廃棄率が10%以上の未確定の拠点（報告が多い＝マイナスも同じ）。チェックなし・「要確認（詳細で確定）」・見出しの下の「要確認 n件」。" + NOT_SHOT + "seed に10%以上の拠点があるか未確認（棚卸しの 008 と同じ作り方。なければ棚卸の報告を入れて作る）。", "Chi nhánh chưa chốt có giá trị tuyệt đối của tỷ lệ chênh lệch (kể cả âm khi báo cáo nhiều hơn) hoặc tỷ lệ hủy từ 10% trở lên. Không checkbox, 「要確認（詳細で確定）」, 「要確認 n件」 dưới tiêu đề. 【Không chụp được】Chưa xác nhận seed có chi nhánh từ 10% trở lên không (cách tạo giống 008 của 棚卸し. Nếu không có thì nhập báo cáo kiểm kê để tạo)."],
       [L_META[4], L_TABLE[12], F("12", "確認が必要の行", "tbody tr::要確認", "area", "view",
          detail=["差分率・廃棄率が10%以上の未確定の行。行のチェックを出さない（まとめて確定できない）。確定のバッジの下に赤のバッジを出し、押すと詳細へ。詳細で赤い行を確かめてから1件ずつ確定する。", "Dòng chưa chốt có tỷ lệ chênh lệch, tỷ lệ hủy từ 10% trở lên. Không hiển thị checkbox dòng (không chốt hàng loạt được). Dưới badge chốt hiển thị badge đỏ, nhấn sẽ sang chi tiết. Xác nhận dòng đỏ ở màn chi tiết rồi chốt từng dòng."], demo_ok=["【撮影不可】見本（seed）に10%以上の拠点がないため、撮れない（コードは対応済み）", "【Không chụp được】Dữ liệu mẫu (seed) không có chi nhánh từ 10% trở lên nên không chụp được (code đã hỗ trợ)"], vi="Dòng cần xác nhận")],
       "/ops/billing/actuals", nocap=True),
    ST("008", "AW_ACTL_001", ["確定済みの行", "Dòng đã chốt"], [NOT_SHOT + "確定したあとの行は、確定の操作がほかの状態のデータに残るため一覧では撮らない（詳細 016 の後に確定済みになる）。詳細で3つの内訳を確定したあとの一覧。バッジ「確定」・チェックなし。鉛筆は出さない（確定済みの月は編集画面を開けない）。", "【Không chụp được】Dòng sau khi chốt không chụp ở danh sách vì thao tác chốt để lại trong dữ liệu của các trạng thái khác (thành đã chốt sau 016 của chi tiết). Danh sách sau khi chốt 3 khoản ở màn chi tiết. Badge 「確定」・không checkbox. Không hiển thị bút chì (tháng đã chốt không mở được màn hình sửa)."],
       [F("13", "確定済みの行", "tbody tr", "area", "view",
          detail=["確定済みの行。確定のバッジは緑の「確定」。チェックを出さない。この月に請求書が作られると、詳細で確定を解除できなくなる。", "Dòng đã chốt. Badge chốt là 「確定」 màu xanh lá. Không hiển thị checkbox. Khi hóa đơn của tháng này được tạo thì ở màn chi tiết không thể hủy chốt."], vi="Dòng đã chốt"),
        L_TABLE[12]],
       "/ops/billing/actuals", setup="", wait=700),
    ST("009", "AW_ACTL_001", ["現金利用あり（現金回収差額の欄）", "Có dùng tiền mặt (cột chênh lệch thu tiền mặt)"], ["現金利用のある拠点（見本は CU00871 大阪支店だけ）は現金回収差額の欄に金額、ほかの拠点は「現金なし」。見本では回収予定＝回収額なので差額は 0。", "Chi nhánh có dùng tiền mặt (dữ liệu mẫu chỉ có CU00871 chi nhánh Osaka) hiển thị số tiền ở cột chênh lệch thu tiền mặt, các chi nhánh khác hiển thị 「現金なし」. Trong dữ liệu mẫu số dự kiến thu = số thu nên chênh lệch là 0."],
       [L_TABLE[9], L_SUM[1]], "/ops/billing/actuals"),
    ST("010", "AW_ACTL_001", ["過去月（2026-09・確定済み・参照のみ）", "Tháng đã qua (2026-09・đã chốt・chỉ xem)"], ["対象月に 2026-09 を選んだとき。確定したときの写しから出す。行のチェック・選択バー・「要確認」は出さない。", "Khi chọn 2026-09 ở tháng đối tượng. Hiển thị từ bản sao lúc chốt. Không hiển thị checkbox dòng, thanh chọn, 「要確認」."],
       [F("14", "過去月の案内", ".es-inline", "label", "show",
          detail=["表の上に「2026年9月は確定済みです。確定したときの記録を表示しています（参照のみ）。」を出す。確定の列は「確定」、行のチェックを出さない。数値は確定したときの写しから出す。", "Hiển thị phía trên bảng 「2026年9月は確定済みです。確定したときの記録を表示しています（参照のみ）。」. Cột chốt là 「確定」, không hiển thị checkbox dòng. Số liệu hiển thị từ bản sao lúc chốt."],
          demo_ok=["コードは過去月の在庫の数を合成して出す（宿題 H-A14）。確定時の写しから出す（在庫.md §6-5）", "Code tổng hợp số tồn kho của tháng đã qua để hiển thị (bài tập H-A14). Hiển thị từ bản sao lúc chốt (在庫.md §6-5)"], vi="Hướng dẫn tháng đã qua")],
       "/ops/billing/actuals?m=2026-09"),
    ST("011", "AW_ACTL_001", ["CSV出力（S12）", "Xuất CSV (S12)"], ["「CSV出力」を押すと、検索条件のとおりの全件のファイルが保存され、画面は変わらずトースト S12 が出る。", "Khi nhấn 「CSV出力」, file toàn bộ theo điều kiện tìm kiếm được lưu, màn hình không đổi và hiển thị toast S12."],
       [F("15", "CSV出力の結果", ".toast", "toast", "show", pattern="P-CSV-OUT", err=["S12"],
          detail=["検索条件のとおりの全件を保存し、S12（行数・ファイル名）を出す。画面は変わらない。0行のときも見出しだけのファイルを出す。", "Lưu toàn bộ theo điều kiện tìm kiếm và hiển thị S12 (số dòng・tên file). Màn hình không đổi. Khi 0 dòng vẫn xuất file chỉ có tiêu đề."], vi="Kết quả xuất CSV")],
       "/ops/billing/actuals", setup=JS + "btn('CSV出力')?.click();await sleep(900);"),
    ST("012", "AW_ACTL_001", ["参照のみ（CS）", "Chỉ xem (CS)"], ["CS（Ad00002）で開いたとき。行のチェック・選択バー・まとめて確定を出さない。CSV出力は出す。経理（Ad00012）はフル権限と同じに確定できる。物流（Ad00011）は実績精算が R（閲覧とCSV出力だけ）で、CS と同じ画面になる（台帳 F 2026-10-08・仮置き）。", "Khi mở bằng CS (Ad00002). Không hiển thị checkbox dòng, thanh chọn, chốt hàng loạt. Có hiển thị xuất CSV. Kế toán (Ad00012) chốt được giống quyền đầy đủ. Logistics (Ad00011) chỉ có quyền R với đối soát thực tế (chỉ xem và xuất CSV), màn hình giống CS (sổ quyết định F 2026-10-08・tạm đặt)."],
       [F("16", "参照のみの画面", ".es-pagehead__actions", "area", "view",
          detail=["CSV出力だけ出す。行のチェック（5.13）・すべて選択（5.1）・選択バー（8）は出さない。詳細でも確定・解除・内訳の確定を出さない（状態 029）。物流・営業・商品管理ほかも同じ（物流は R）。", "Chỉ hiển thị xuất CSV. Không hiển thị checkbox dòng (5.13), chọn tất cả (5.1), thanh chọn (8). Ở màn chi tiết cũng không hiển thị chốt, hủy chốt, chốt từng khoản (trạng thái 029). Logistics, kinh doanh, quản lý sản phẩm, v.v. cũng giống vậy (logistics là R)."],
          demo_ok=[H_LIST, "Code không có UI sắp xếp, không ghi nhớ số dòng hiển thị, và CS cũng có checkbox dòng (bài tập H-A7). Thiết kế theo P-LIST・P-PAGESIZE"], vi="Màn hình chỉ xem"),
        L_HEAD[3]],
       "/ops/billing/actuals", login="Ad00002"),
    ST("013", "AW_ACTL_001", ["読み込めませんでした（W141）", "Không tải được (W141)"], [NOT_SHOT + "通信の失敗は seed では再現できない。画面は表の中の1行で W141（「一覧を」）と「再読み込み」。", "【Không chụp được】Lỗi kết nối không tái hiện được bằng seed. Màn hình là 1 dòng trong bảng có W141 (「一覧を」) và 「再読み込み」."],
       [F("17", "読み込みの失敗", "-", "label", "show", err=["W141"],
          detail=["表の中に W141（{対象}＝一覧）と「再読み込み」を出す。押すと読み込み直す。サマリー・合計行は出さない。", "Hiển thị W141 ({対象} = danh sách) và 「再読み込み」 trong bảng. Nhấn sẽ tải lại. Không hiển thị tổng hợp và dòng tổng."], demo_ok=[H_MSG, "Câu chữ không có trong code (bài tập). Thiết kế theo sổ quyết định F, ID thông báo đã đánh số từ chỗ trống của dải 運営E"], vi="Lỗi tải")],
       "/ops/billing/actuals", nocap=True),
    ST("037", "AW_ACTL_001", ["休止中の拠点の行（休止中〔対象外〕・金額「—」）", "Dòng chi nhánh đang tạm dừng (休止中〔ngoài đối tượng〕・số tiền 「—」)"], [NOT_SHOT + "コードは休止中でも金額を出す（宿題 H-A10）。実装後に撮り直す。休止中の拠点（見本は CU00902 名古屋。デモの日付が 10/12 以降の日次バッチで「利用休止」になる）。確定の列に「休止中（対象外）」・金額の列は「—」・チェックなし。休止の始めの報告があった月は通常の行（確定でき、翌月から「対象外・金額 —」）。運営が承認画面で「スキップ」を選んだ拠点はその月から対象外。リリース時にすでに休止中の拠点（移行で「利用休止」）は最初から対象外。以降の行は「対象外」になった月の表示。", "【Không chụp được】Code hiển thị số tiền kể cả khi tạm dừng (bài tập H-A10). Chụp lại sau khi triển khai. Chi nhánh đang tạm dừng (dữ liệu mẫu là CU00902 Nagoya. Khi ngày demo từ 10/12 trở đi, batch hằng ngày sẽ chuyển thành 「利用休止」). Cột chốt là 「休止中（対象外）」, cột số tiền là 「—」, không checkbox. Tháng có báo cáo bắt đầu tạm dừng là dòng thường (chốt được, từ tháng sau là 「対象外・金額 —」). Chi nhánh mà vận hành chọn 「スキップ」 ở màn hình phê duyệt thì ngoài đối tượng từ tháng đó. Chi nhánh đã tạm dừng sẵn lúc phát hành (chuyển đổi thành 「利用休止」) thì ngoài đối tượng ngay từ đầu. Dòng hiển thị ở đây là tháng đã thành 「対象外」."],
       [F("18", "休止中の行", "tbody tr::名古屋", "area", "view",
          detail=["一覧には行を出す（拠点が消えると運営が探しにくい）。休止の始めの報告があった拠点は、その月は通常の行で実績精算を確定でき、翌月から「対象外」になる。運営が承認画面で「スキップ」を選んだ拠点は、その月から「対象外」。リリース時にすでに休止中の拠点（移行で「利用休止」）は、休止の始めの報告がないので最初から「対象外」。「対象外」の行は、確定の列を「休止中（対象外）」のバッジにする。管理ロス・免責超過・現金回収差額・価格調整差額・当月へ繰入はすべて「—」。行のチェック・確定の操作を出さない。サマリー・合計行に含めない。", "Danh sách vẫn hiển thị dòng (chi nhánh biến mất thì vận hành khó tìm). Chi nhánh có báo cáo bắt đầu tạm dừng: tháng đó là dòng thường, chốt đối soát thực tế được, từ tháng sau là 「対象外」. Chi nhánh mà vận hành chọn 「スキップ」 ở màn hình phê duyệt: ngoài đối tượng từ tháng đó. Chi nhánh đã tạm dừng sẵn lúc phát hành (chuyển đổi thành 「利用休止」): ngoài đối tượng ngay từ đầu vì không có báo cáo bắt đầu tạm dừng. Dòng 「対象外」 có cột chốt là badge 「休止中（対象外）」. Hao hụt quản lý, vượt miễn trách, chênh lệch thu tiền mặt, chênh lệch điều chỉnh giá, chuyển vào tháng này đều là 「—」. Không hiển thị checkbox dòng, thao tác chốt. Không gồm trong tổng hợp, dòng tổng."],
          open=["【要確認】「休止の始めの報告を最初の棚卸報告とみなす」点（台帳 F 2026-10-08「休止の月の実績精算」に決定がなく未決。みなす場合は、最初の棚卸報告前の扱い〔管理ロスなし〕が休止の始めの月にも当てはまるかをあわせて決める）", "【Cần xác nhận】Việc coi 「báo cáo bắt đầu tạm dừng」 là 「báo cáo kiểm kê đầu tiên」 (sổ quyết định F 2026-10-08 「休止の月の実績精算」 chưa có quyết định, đang để mở. Nếu coi như vậy thì phải quyết định cùng việc cách xử lý trước báo cáo kiểm kê đầu tiên 〔không có hao hụt quản lý〕 có áp dụng cho tháng bắt đầu tạm dừng không)"], ask="hong",
          demo_ok=["コードは休止中でも3つの内訳の確定を求め、金額も出す（宿題 H-A10）。台帳 F 2026-10-07（Q-A7）のとおり対象外にする", "Code yêu cầu chốt 3 khoản và hiển thị số tiền kể cả khi tạm dừng (bài tập H-A10). Theo sổ quyết định F 2026-10-07 (Q-A7) là ngoài đối tượng"], vi="Dòng tạm dừng")],
       "/ops/billing/actuals", today="2026/10/12"),
]

# ================================================================ AW_ACTL_002 詳細
D_HEAD = [
    F("1", "ヘッダー", ".es-pagehead", "area",
      detail=["パンくず・画面名＋子契約番号・操作ボタン（残りをまとめて確定／確定を解除／編集）。削除なし。", "Breadcrumb, tên màn hình + số hợp đồng con, nút thao tác (chốt phần còn lại / hủy chốt / sửa). Không có xóa."], vi="Header"),
    F("1.1", "パンくず", ".es-breadcrumb", "label", detail=["「請求 / 実績精算 / 実績精算詳細」。2つ目のリンクは一覧へ戻る（検索条件・ページを戻す）。", "「請求 / 実績精算 / 実績精算詳細」. Link thứ 2 quay về danh sách (khôi phục điều kiện tìm kiếm, trang)."], vi="Breadcrumb"),
    F("1.2", "画面名", ".es-pagehead__title", "label", detail=["「実績精算詳細」＋子契約番号（CP…-yyyymm）。URL は拠点ID（/ops/billing/actuals/{拠点ID}）で、見出しの番号は子契約番号。", "「実績精算詳細」 + số hợp đồng con (CP…-yyyymm). URL là ID chi nhánh (/ops/billing/actuals/{ID chi nhánh}), số ở tiêu đề là số hợp đồng con."], vi="Tên màn hình"),
    F("1.3", "残りをまとめて確定", ".es-pagehead__actions button::残りをまとめて確定", "button", "click", cond=[CAN_ACT + "。かつ未確定で請求書に載っていない・対象外でない（休止の始めの月は通常）とき。" + DAY_COND[0], "Chỉ hiển thị cho vai trò có quyền chốt đối soát thực tế (quyền đầy đủ, kế toán). Logistics, CS, kinh doanh, quản lý sản phẩm, phát triển sản phẩm, chỉ xem thì không hiển thị (chỉ xem và xuất CSV). Và chỉ khi chưa chốt, chưa vào hóa đơn, không ngoài đối tượng (tháng bắt đầu tạm dừng là bình thường). " + DAY_COND[1]],
      err=["Q142", "S142", "E32", "E184", "E185"],
      detail=["押すと確認ダイアログ Q142（一覧のまとめて確定と同じ・状態 038）。「確定する」で未確定の内訳をまとめて確定する。3つとも確定すると実績精算が確定する。確定できたら S142（{対象}＝この拠点の実績精算）。差分率・廃棄率が10%以上のときも、詳細で赤い行を確かめたうえで確定できる（まとめて確定の対象外なのは一覧だけ）。" + DAY_TIP[0], "Khi nhấn hiện hộp thoại xác nhận Q142 (giống chốt hàng loạt ở danh sách・trạng thái 038). Nhấn 「確定する」 để chốt hàng loạt các khoản chưa chốt. Chốt cả 3 khoản thì đối soát thực tế được chốt. Khi chốt được thì hiển thị S142 ({対象} = đối soát thực tế của chi nhánh này). Kể cả khi tỷ lệ chênh lệch, tỷ lệ hủy từ 10% trở lên vẫn chốt được sau khi xác nhận dòng đỏ ở màn chi tiết (chỉ danh sách là ngoài đối tượng của chốt hàng loạt). " + DAY_TIP[1]],
      demo_ok=[H_DAY[0] + "。" + H_DLG[0] % "Q142", H_DAY[1] + ". " + H_DLG[1] % "Q142"], vi="Chốt phần còn lại"),
    F("1.4", "確定を解除", ".es-pagehead__actions button::確定を解除", "button", "click", cond=[CAN_ACT + "。かつ確定済みで、請求書に載る前のときだけ", "Chỉ hiển thị cho vai trò có quyền chốt đối soát thực tế (quyền đầy đủ, kế toán). Logistics, CS, kinh doanh, quản lý sản phẩm, phát triển sản phẩm, chỉ xem thì không hiển thị (chỉ xem và xuất CSV). Và chỉ khi đã chốt và trước khi vào hóa đơn"],
      err=["Q143", "S143", "E54", "E184"],
      detail=["押すと確認ダイアログ Q143。解除すると3つの内訳をすべて未確定に戻す。請求書に載ったあとは解除できず E54（状態 033）。", "Khi nhấn hiện hộp thoại xác nhận Q143. Khi hủy, đưa cả 3 khoản về chưa chốt. Sau khi đã vào hóa đơn thì không hủy được và hiện E54 (trạng thái 033)."],
      demo_ok=[H_UNACT, "Code thực hiện 「確定を解除」 không cần xác nhận (bài tập Q-A8). Theo sổ quyết định F, hiển thị hộp thoại xác nhận (Q143)"], vi="Hủy chốt"),
    F("1.5", "編集", ".es-pagehead__actions button::編集", "button", "click", cond=[CAN_ACT + "。かつ当月で、未確定・請求書に載っていない・対象外でないときだけ。確定済みでは出さない（先に「確定を解除」）", "%s. Và chỉ khi là tháng hiện tại, chưa chốt, chưa vào hóa đơn, không ngoài đối tượng. Đã chốt thì không hiển thị (phải 「確定を解除」 trước)" % CAN_EDIT_VI],
      err=["E32", "E184", "E54"],
      detail=["押すと編集画面（AW_ACTL_003・/ops/billing/actuals/{拠点ID}/edit）へ移る。直せるのは自動で計算した金額と ② の手入力の行の追加・削除（価格調整は子契約の値・棚卸の代理入力は AW_STCK_005）。一覧の鉛筆（001 の 5.16）と同じ行き先。権限のない役割には出さない。", "Nhấn để sang màn hình sửa (AW_ACTL_003・/ops/billing/actuals/{ID chi nhánh}/edit). Sửa được là các khoản tự tính (hao hụt quản lý・chênh lệch thu tiền mặt・phí xử lý) và thêm・xóa dòng nhập tay của ② (điều chỉnh giá là giá trị của hợp đồng con・nhập hộ kiểm kê ở AW_STCK_005). Cùng đích với bút chì ở danh sách (5.16 của 001). Không hiển thị cho vai trò không có quyền."],
      open=["【要確認】編集の権限は台帳に決定がない。確定の権限（フル権限・経理）と同じにするのは仮置き", "【Cần xác nhận】Quyền sửa chưa có quyết định trong sổ quyết định. Đặt giống quyền chốt (quyền đầy đủ, kế toán) chỉ là tạm"], ask="hong",
      demo_ok=["コードは「編集」ボタンを出す（未確定・請求書に載っていない・画面の権限 update）。押した先は価格調整と棚卸の申告を直接変える画面で、台帳 F 2026-10-08 の中身（手入力の行）に変える（状態 041〜）", "Code có hiển thị nút 「編集」 (chưa chốt, chưa vào hóa đơn, quyền update của màn hình). Đích là màn hình sửa trực tiếp điều chỉnh giá và tick báo cáo kiểm kê, đổi thành nội dung của sổ quyết định F 2026-10-08 (dòng nhập tay) (trạng thái 041〜)"], vi="Sửa"),
]
D_META = [
    F("2", "見出しの下の情報", ".bl-meta", "area", detail=["拠点名・法人名・対象期間・実績精算の状態・請求済みの印・差分率と廃棄率のバッジ。", "Tên chi nhánh, tên công ty, kỳ đối tượng, trạng thái đối soát thực tế, dấu đã xuất hóa đơn, badge tỷ lệ chênh lệch và tỷ lệ hủy."], vi="Thông tin dưới tiêu đề"),
    F("2.1", "拠点名", ".bl-meta .es-badge", "label", detail=["拠点名。", "Tên chi nhánh."], vi="Tên chi nhánh"),
    F("2.2", "法人名", ".bl-meta .es-badge", "label", detail=["法人名（法人がないときは「法人なし」）。", "Tên công ty (không có công ty thì 「法人なし」)."], vi="Tên công ty"),
    F("2.3", "対象期間", ".bl-meta .es-badge::対象期間", "label", len="日付 yyyy-mm-dd〜yyyy-mm-dd", detail=["締め月の実績精算の期間（前月21日〜当月20日）。", "Kỳ đối soát thực tế của tháng chốt sổ (ngày 21 tháng trước đến ngày 20 tháng này)."], demo_ok=[H_PERIOD, "Code ghi kỳ đối tượng bằng chuỗi cố định 2026-09-21〜10-20 (bài tập H-A4). Phải tính từ tháng chốt sổ (yyyy-mm-dd〜yyyy-mm-dd, sổ quyết định M-1)"], vi="Kỳ đối tượng"),
    F("2.4", "実績精算の状態", ".bl-meta .es-badge::実績精算", "label", detail=["「実績精算 確定済」（緑）／「実績精算 未確定」（黄）。「② 」は付けない（前払い・後払いの言い方をやめる・Q-E3）。", "「実績精算 確定済」 (xanh lá) / 「実績精算 未確定」 (vàng). Không gắn 「② 」 (bỏ cách nói trả trước, trả sau・Q-E3)."], demo_ok=[H_WORD, "Code có từ 「後払い」「前請求」 (bài tập H-A1). Theo sổ quyết định F và 運営E Q-E3, ghi là 「実績精算」「固定額」"], vi="Trạng thái đối soát thực tế"),
    F("2.5", "差分率・廃棄率", ".bl-meta .es-badge::率", "label", len="数値（%）", detail=["差分率・廃棄率のバッジ。差分率は絶対値で10%以上、廃棄率は10%以上で赤（報告が多いマイナスも同じ）。報告がないときは出さない。", "Badge tỷ lệ chênh lệch, tỷ lệ hủy. Tỷ lệ chênh lệch từ 10% trở lên theo giá trị tuyệt đối, tỷ lệ hủy từ 10% trở lên thì màu đỏ (khi báo cáo nhiều hơn = âm cũng giống vậy). Khi chưa có báo cáo thì không hiển thị."], vi="Tỷ lệ chênh lệch・tỷ lệ hủy"),
]
D_CONFIRM = [
    F("4", "確定する内容", ".es-card::確定する内容", "table", detail=["3つの内訳を内訳ごとに確定する。見出しの右に「n / 3 確定」（確定済みなら「（実績精算 確定済）」を添える）。3つとも確定すると実績精算が確定する（在庫.md §6-3）。", "Chốt từng khoản trong 3 khoản. Bên phải tiêu đề hiển thị 「n / 3 確定」 (nếu đã chốt thì thêm 「（実績精算 確定済）」). Chốt cả 3 khoản thì đối soát thực tế được chốt (在庫.md §6-3)."], vi="Nội dung chốt"),
    F("4.1", "管理ロス（棚卸）", "td::管理ロス", "label", len="金額（円・税込／税抜）", detail=["管理ロスの免責超過分。棚卸なし・最初の報告前・休止中（対象外の月）・買取のときは金額が「—」で「対象なし」を添える。", "Phần vượt miễn trách của hao hụt quản lý. Khi không kiểm kê, trước báo cáo đầu tiên, tạm dừng (tháng ngoài đối tượng), hoặc mua đứt thì số tiền là 「—」 và thêm 「対象なし」."], demo_ok=[H_PRICE, "Code quy đổi hao hụt theo giá sau điều chỉnh giá (logic.ts). Sổ quyết định F (Q-A2) và 在庫.md §6-1 quy đổi theo giá niêm yết (bài tập)"], vi="Hao hụt quản lý (kiểm kê)"),
    F("4.2", "現金回収差額", "td::現金回収差額", "label", len="金額（円・税込／税抜）", detail=["アプリの現金支払いの差額。現金利用のない拠点は「—」・「対象なし」。", "Chênh lệch thanh toán tiền mặt trên app. Chi nhánh không dùng tiền mặt là 「—」・「対象なし」."], vi="Chênh lệch thu tiền mặt"),
    F("4.3", "価格調整差額", "td::価格調整差額", "label", len="金額（円・税込／税抜）",
      detail=["実績精算の内訳の1行として金額（±）を出す。その実績精算と同じ請求書の ② に載る。価格調整がないときは「—」・「対象なし」。税率は商品ごとの税率で按分する（8% 固定にしない）。", "Hiển thị số tiền (±) như 1 dòng trong các khoản của đối soát thực tế. Ghi ở mục ② của cùng hóa đơn với đối soát thực tế đó. Khi không có điều chỉnh giá là 「—」・「対象なし」. Thuế suất phân bổ theo thuế suất của từng sản phẩm (không cố định 8%)."],
      demo_ok=[H_TAXADJ, "Code chia ngược chênh lệch điều chỉnh giá với thuế suất cố định 8%. Sổ quyết định F (BILL Q-E2) phân bổ theo thuế suất của từng sản phẩm (bài tập)"], vi="Chênh lệch điều chỉnh giá"),
    F("4.4", "内訳の状態", "tbody .es-badge", "label", detail=["確定（緑）／未確定（黄）。対象のない内訳には「対象なし」を添える（対象がないことを確かめて確定する）。", "Chốt (xanh lá) / chưa chốt (vàng). Khoản không có đối tượng thì thêm 「対象なし」 (xác nhận không có đối tượng rồi chốt)."], vi="Trạng thái khoản"),
    F("4.5", "内訳の確定", "tbody button::確定", "button", "click", cond=[CAN_ACT + "。かつ未確定の内訳で請求書に載る前のとき。" + DAY_COND[0], "Chỉ hiển thị cho vai trò có quyền chốt đối soát thực tế (quyền đầy đủ, kế toán). Logistics, CS, kinh doanh, quản lý sản phẩm, phát triển sản phẩm, chỉ xem thì không hiển thị (chỉ xem và xuất CSV). Và chỉ khi khoản chưa chốt và trước khi vào hóa đơn. " + DAY_COND[1]], err=["S142", "E32", "E184", "E185"],
      detail=["その内訳だけ確定する（確認なし）。確定できたら S142（{対象}＝内訳名）。3つとも確定すると実績精算が確定する。" + DAY_TIP[0], "Chỉ chốt khoản đó (không cần xác nhận). Khi chốt được hiển thị S142 ({対象} = tên khoản). Chốt cả 3 khoản thì đối soát thực tế được chốt. " + DAY_TIP[1]],
      demo_ok=[H_DAY[0], H_DAY[1]], vi="Chốt khoản"),
    F("4.6", "内訳の解除", "tbody button::解除", "button", "click", cond=[CAN_ACT + "。かつ確定済みの内訳で請求書に載る前のとき", "Chỉ hiển thị cho vai trò có quyền chốt đối soát thực tế (quyền đầy đủ, kế toán). Logistics, CS, kinh doanh, quản lý sản phẩm, phát triển sản phẩm, chỉ xem thì không hiển thị (chỉ xem và xuất CSV). Và chỉ khi khoản đã chốt và trước khi vào hóa đơn"], err=["Q143", "S143", "E54", "E184"],
      detail=["押すと確認ダイアログ Q143（「確定を解除」と同じ・状態 039）。「解除する」でその内訳だけ確定を解除する（実績精算の確定も外れる）。請求書に載ったあとは E54。", "Khi nhấn hiện hộp thoại xác nhận Q143 (giống 「確定を解除」・trạng thái 039). Nhấn 「解除する」 để chỉ hủy chốt khoản đó (chốt đối soát thực tế cũng bị bỏ). Sau khi đã vào hóa đơn thì là E54."],
      demo_ok=[H_DLG[0] % "Q143", H_DLG[1] % "Q143"], vi="Hủy khoản"),
    F("4.7", "説明", ".foot::3つとも必須", "label", detail=["3つとも必須であること、対象のない内訳も確かめて確定すること、在庫調整は任意であること。「（後払い）」は書かない。", "Cả 3 khoản đều bắt buộc, khoản không có đối tượng cũng phải xác nhận rồi chốt, điều chỉnh tồn kho là tùy chọn. Không ghi 「（後払い）」."], demo_ok=[H_WORD, "Code có từ 「後払い」「前請求」 (bài tập H-A1). Theo sổ quyết định F và 運営E Q-E3, ghi là 「実績精算」「固定額」"], vi="Giải thích"),
]
D_CHECK = [
    F("5", "実績精算の確認", ".es-card::実績精算の確認", "area", detail=["見出しの右に対象期間と「25日確定」。すべて読み取り専用（直すときは編集画面 AW_ACTL_003 へ。ここでは価格調整・自動の金額は直せない）。", "Bên phải tiêu đề hiển thị kỳ đối tượng và 「25日確定」. Tất cả chỉ đọc (khi muốn sửa thì sang màn hình sửa AW_ACTL_003. Ở đây không sửa được điều chỉnh giá・các khoản tự tính)."], demo_ok=[H_PERIOD, "Code ghi kỳ đối tượng bằng chuỗi cố định 2026-09-21〜10-20 (bài tập H-A4). Phải tính từ tháng chốt sổ (yyyy-mm-dd〜yyyy-mm-dd, sổ quyết định M-1)"], vi="Xác nhận đối soát thực tế"),
    F("5.1", "適用プラン（バージョン）", ".es-field::適用プラン", "label", detail=["プランID・価格プラン（世代）／コース／配送便。子契約の値。", "ID plan・plan giá (thế hệ) / course / chuyến giao. Giá trị của hợp đồng con."], vi="Plan áp dụng (phiên bản)"),
    F("5.2", "免責金額（プランマスタ）", ".es-field::免責金額", "label", len="金額（円・税込）", detail=["プランマスタの免責金額。全プラン税込（hong 2026-10-08・客先には未確認）。拠点では変えられない。", "Số tiền miễn trách của プランマスタ. Tất cả các plan đều đã gồm thuế (hong 2026-10-08, chưa xác nhận với khách). Không đổi được ở chi nhánh."], vi="Số tiền miễn trách (プランマスタ)"),
    F("5.3", "価格調整（子契約の値）", ".es-field::価格調整", "label", len="文字列（なし／値上げ n円／値下げ n円／無料提供）",
      detail=["子契約の「価格調整の適用」の値を表示だけする（この画面では直さない）。なし／値上げ／値下げ／無料提供（金額は10円単位）。", "Chỉ hiển thị giá trị 「価格調整の適用」 của hợp đồng con (không sửa ở màn hình này). Không có / tăng giá / giảm giá / cung cấp miễn phí (số tiền theo đơn vị 10 yên)."],
      demo_ok=[H_EDIT, "Màn hình sửa của code có thể sửa trực tiếp điều chỉnh giá (không cần phê duyệt) (sổ quyết định F 2026-10-08: điều chỉnh giá giữ giá trị của hợp đồng con). Màn hình sửa (AW_ACTL_003) cũng không sửa điều chỉnh giá; chỉ hiển thị tham chiếu"], vi="Điều chỉnh giá (giá trị của hợp đồng con)"),
    F("5.4", "子契約の画面へ", "-", "link", "click", demo_ok=["コードに子契約へのリンクがない（価格調整はこの画面の選択欄で直接変える。台帳 F 2026-10-07 で参照表示にする）。台帳のとおり参照表示とリンクにする", "Code không có link sang hợp đồng con (điều chỉnh giá được đổi trực tiếp bằng ô chọn của màn hình này; sổ quyết định F 2026-10-07 quyết định hiển thị tham chiếu). Theo sổ quyết định, hiển thị tham chiếu và link"], detail=["押すと子契約の詳細（AW_CONT_002・/ops/contracts/{子契約ID}）へ移る。価格調整を直すときはそこから編集する（運営承認が必要・契約_05）。", "Nhấn để chuyển sang chi tiết hợp đồng con (AW_CONT_002・/ops/contracts/{ID hợp đồng con}). Khi muốn sửa điều chỉnh giá thì sửa từ đó (cần vận hành phê duyệt・契約_05)."], vi="Sang màn hình hợp đồng con"),
    F("5.5", "棚卸の報告", ".es-field::棚卸の", "label",
      detail=["「報告済（報告日／報告者）」か「未報告」。報告者・報告日は実際の値を出す。未報告のときに「請求留保」とは書かない（請求は保留しない・台帳 H）。チェックボックスは置かない（棚卸の代理入力は AW_STCK_005）。", "「報告済（報告日／報告者）」 hoặc 「未報告」. Người báo cáo, ngày báo cáo hiển thị giá trị thực. Khi chưa báo cáo không ghi 「請求留保」 (không giữ hóa đơn・sổ quyết định H). Không đặt checkbox (nhập hộ kiểm kê là AW_STCK_005)."],
      demo_ok=[H_TERM + "。「未申告 → 請求留保」は出さない（H-A3）。" + H_FIX, "Code dùng 「点検」「申告」「未申告」 (bài tập H-A2). Theo sổ quyết định, sửa thành 「棚卸」「報告」「未報告」. Không hiển thị 「未申告 → 請求留保」 (H-A3). Code hiển thị tên người thao tác và ngày báo cáo bằng chuỗi cố định (bài tập H-A8). Hiển thị nhân viên vận hành đang đăng nhập và ngày báo cáo thực tế"], vi="Báo cáo kiểm kê"),
]
D_SUM = [
    F("6", "サマリー", ".bl-sumgrid", "area", detail=["この拠点の金額を4枚で出す。上が税込・下が税抜の2段。", "Hiển thị số tiền của chi nhánh này bằng 4 thẻ. Trên là gồm thuế, dưới là chưa thuế, 2 tầng."], vi="Tổng hợp"),
    F("6.1", "管理ロス 免責超過分", ".bl-sumgrid .es-field::免責超過", "label", len="金額（円・税込／税抜）", detail=["補足「管理ロス n円 − 免責 m円（税込）」。", "Phần bổ sung 「管理ロス n円 − 免責 m円（税込）」."], demo_ok=[H_PRICE, "Code quy đổi hao hụt theo giá sau điều chỉnh giá (logic.ts). Sổ quyết định F (Q-A2) và 在庫.md §6-1 quy đổi theo giá niêm yết (bài tập)"], vi="Hao hụt quản lý - phần vượt miễn trách"),
    F("6.2", "価格調整差額", ".bl-sumgrid .es-field::価格調整差額", "label", len="金額（円・税込／税抜）",
      detail=["金額（±）を出す。補足「値下げ・無料 n円／値上げ m円／実績精算の内訳として請求書の ② に反映」。子契約の価格調整の値（5.3）へのリンクを添える。価格調整がないときは「—」。当月の請求へ繰入に含まれる。", "Hiển thị số tiền (±). Phần bổ sung 「値下げ・無料 n円／値上げ m円／実績精算の内訳として請求書の ② に反映」. Kèm link sang giá trị điều chỉnh giá của hợp đồng con (5.3). Khi không có điều chỉnh giá thì hiển thị 「—」. Được tính vào khoản chuyển vào hóa đơn tháng này."], demo_ok=[H_TAXADJ + "。補足の「前請求」は書かない（H-A1）", "Code chia ngược chênh lệch điều chỉnh giá với thuế suất cố định 8%. Sổ quyết định F (BILL Q-E2) phân bổ theo thuế suất của từng sản phẩm (bài tập). Không ghi 「前請求」 ở phần bổ sung (H-A1)"], vi="Chênh lệch điều chỉnh giá"),
    F("6.3", "当月の請求へ繰入", ".bl-sumgrid .es-field::当月の請求へ繰入", "label", len="金額（円・税込／税抜）", detail=["請求書の ② に載る実績精算の金額すべて＝免責超過 ＋ 現金回収差額 ＋ 価格調整差額 ＋ 事務手数料 ＋ 惣菜買取 ＋ 代替品（請求書の ② と一致させる。9.5 の合計と同じ額）。", "Toàn bộ số tiền đối soát thực tế ghi ở mục ② của hóa đơn = vượt miễn trách + chênh lệch thu tiền mặt + chênh lệch điều chỉnh giá + phí xử lý + mua đứt món ăn + sản phẩm thay thế (khớp với mục ② của hóa đơn; cùng số tiền với tổng ở 9.5)."], vi="Chuyển vào hóa đơn tháng này"),
    F("6.4", "現金回収差額", ".bl-sumgrid .es-field::現金回収差額", "label", len="金額（円・税込／税抜）", detail=["現金利用ありのときは「回収予定 n円 − 実際の回収 m円」、ないときは「—」と「この拠点は現金利用なし」。", "Khi có dùng tiền mặt hiển thị 「回収予定 n円 − 実際の回収 m円」, khi không có thì hiển thị 「—」 và 「この拠点は現金利用なし」."], vi="Chênh lệch thu tiền mặt"),
]
D_DETAIL = [
    F("8", "商品別 明細", ".es-card::商品別", "table",
      detail=["商品ごとの販売単価・数量・管理ロス・価格調整差額。見出しの右に計算在庫の式。差分率・廃棄率が10%以上の行は赤い背景。最後に合計行。", "Đơn giá bán, số lượng, hao hụt quản lý, chênh lệch điều chỉnh giá của từng sản phẩm. Bên phải tiêu đề là công thức tồn kho tính toán. Dòng có tỷ lệ chênh lệch, tỷ lệ hủy từ 10% trở lên có nền đỏ. Cuối cùng là dòng tổng."], vi="Chi tiết theo sản phẩm"),
    F("8.1", "販売単価（税込）", "th::販売単価", "label", len="金額（円・税込）", detail=["定価（商品マスタの販売価格）・価格調整（なし／値上げ／値下げ／無料）・販売単価（利用者が支払う額）。", "Giá niêm yết (giá bán của sản phẩm master), điều chỉnh giá (không có / tăng / giảm / miễn phí), đơn giá bán (số tiền người dùng trả)."], vi="Đơn giá bán (gồm thuế)"),
    F("8.2", "数量の内訳", "th::数量の内訳", "label", len="整数",
      detail=["納品・販売・廃棄・承認調整・計算在庫・棚卸（報告した数。未報告は「未報告」）。計算在庫 ＝ 前回の報告 ＋ 納品 − 販売 − 廃棄 ± 承認調整。右寄せ。", "Giao hàng, bán, hủy, điều chỉnh đã duyệt, tồn kho tính toán, kiểm kê (số đã báo cáo. Chưa báo cáo là 「未報告」). Tồn kho tính toán = báo cáo lần trước + giao hàng − bán − hủy ± điều chỉnh đã duyệt. Căn phải."], demo_ok=[H_TERM, "Code dùng 「点検」「申告」「未申告」 (bài tập H-A2). Theo sổ quyết định, sửa thành 「棚卸」「報告」「未報告」"], vi="Chi tiết số lượng"),
    F("8.3", "管理ロス（数量・金額）", "th::管理ロス", "label", len="数量（点）・金額（円・税込／税抜）",
      detail=["数量は不足を赤の「−n」、過剰を青の「+n」。金額は数量を定価で換算した額。", "Số lượng: thiếu là 「−n」 màu đỏ, thừa là 「+n」 màu xanh dương. Số tiền là số lượng quy đổi theo giá niêm yết."], demo_ok=[H_PRICE, "Code quy đổi hao hụt theo giá sau điều chỉnh giá (logic.ts). Sổ quyết định F (Q-A2) và 在庫.md §6-1 quy đổi theo giá niêm yết (bài tập)"], vi="Hao hụt quản lý (số lượng・số tiền)"),
    F("8.4", "価格調整差額", "th::価格調整差額", "label", len="金額（円・税込／税抜）", detail=["値下げ・無料は赤、値上げは緑で符号つき。税率は商品ごとの税率（8% 固定にしない）。", "Giảm giá・miễn phí màu đỏ, tăng giá màu xanh lá, có dấu. Thuế suất theo từng sản phẩm (không cố định 8%)."], demo_ok=[H_TAXADJ, "Code chia ngược chênh lệch điều chỉnh giá với thuế suất cố định 8%. Sổ quyết định F (BILL Q-E2) phân bổ theo thuế suất của từng sản phẩm (bài tập)"], vi="Chênh lệch điều chỉnh giá"),
]
D_TOTAL = [
    F("9", "実績精算額と精算差額", ".es-card::実績精算額", "table", detail=["見出しの右に当期（対象期間）。この拠点の実績精算の金額を行ごとに出す。上が税込・下が税抜。", "Bên phải tiêu đề là kỳ hiện tại (kỳ đối tượng). Hiển thị số tiền đối soát thực tế của chi nhánh này theo từng dòng. Trên là gồm thuế, dưới là chưa thuế."], vi="Số tiền đối soát thực tế và chênh lệch đối soát"),
    F("9.1", "管理ロス 免責超過分", "td::免責超過分", "label", len="金額（円・税込／税抜）", detail=["管理ロス − 免責金額。補足の行に「管理ロス n円 − 免責金額 m円」。", "Hao hụt quản lý − số tiền miễn trách. Dòng bổ sung ghi 「管理ロス n円 − 免責金額 m円」."], vi="Hao hụt quản lý - phần vượt miễn trách"),
    F("9.2", "価格調整差額", "td::価格調整差額", "label", len="金額（円・税込／税抜）",
      detail=["実績精算の内訳の1行（参考行）。金額（±）を出し、同じ請求書の ② に載る。当月へ繰入の合計に含まれる。子契約の価格調整の値（5.3）へのリンクを添える。計算の対象月は実績精算と同じ。税率は商品ごとの税率で按分する。", "Dòng khoản (dòng tham khảo) của đối soát thực tế. Hiển thị số tiền (±), ghi ở mục ② của cùng hóa đơn. Được tính vào tổng chuyển vào tháng này. Kèm link sang giá trị điều chỉnh giá của hợp đồng con (5.3). Tháng đối tượng tính giống đối soát thực tế. Thuế suất phân bổ theo thuế suất của từng sản phẩm."],
      demo_ok=[H_TAXADJ + "。「前請求」「（2026-09-11 決定）」は画面の文に書かない（H-A1・H-A5）", "Code chia ngược chênh lệch điều chỉnh giá với thuế suất cố định 8%. Sổ quyết định F (BILL Q-E2) phân bổ theo thuế suất của từng sản phẩm (bài tập). Không ghi 「前請求」「（2026-09-11 決定）」 trong câu của màn hình (H-A1・H-A5)"], vi="Chênh lệch điều chỉnh giá"),
    F("9.3", "現金回収差額", "td::現金回収差額", "label", len="金額（円・税込／税抜）", cond=["現金利用のある拠点だけ", "Chỉ chi nhánh có dùng tiền mặt"], detail=["補足の行に「回収予定 n円 − ドライバーの回収 m円（一致していれば 0）」。", "Dòng bổ sung ghi 「回収予定 n円 − ドライバーの回収 m円（一致していれば 0）」."], vi="Chênh lệch thu tiền mặt"),
    F("9.4", "当月の請求書へ繰入", "tfoot td::繰入", "label", len="金額（円・税込／税抜）", detail=["請求書の ② に載る実績精算の金額すべて＝免責超過 ＋ 現金回収差額 ＋ 価格調整差額 ＋ 事務手数料 ＋ 惣菜買取 ＋ 代替品（請求書の ② と一致させる）。買取の拠点は買取の金額だけ。税率は免責超過が商品の税率、現金回収差額が設定管理の税率、価格調整差額が商品ごとの税率、事務手数料・買取・代替品は各行の税率。", "Toàn bộ số tiền đối soát thực tế ghi ở mục ② của hóa đơn = vượt miễn trách + chênh lệch thu tiền mặt + chênh lệch điều chỉnh giá + phí xử lý + mua đứt món ăn + sản phẩm thay thế (khớp với mục ② của hóa đơn). Chi nhánh mua đứt chỉ tính số tiền mua đứt. Thuế suất: vượt miễn trách theo thuế suất sản phẩm, chênh lệch thu tiền mặt theo thuế suất của quản lý thiết lập, chênh lệch điều chỉnh giá theo thuế suất của từng sản phẩm, phí xử lý・mua đứt・sản phẩm thay thế theo thuế suất của từng dòng."], vi="Chuyển vào hóa đơn tháng này"),
    F("9.5", "この拠点の実績精算の合計", "tfoot td::合計", "label", len="金額（円・税込／税抜）",
      detail=["請求書の実績精算の明細の合計（9.4 の当月へ繰入と同じ額）。税込・税抜は行ごとの税率で出した合計。事務手数料・買取・代替品の行を含む。「後払い分」とは書かない。", "Tổng các chi tiết đối soát thực tế của hóa đơn (cùng số tiền với 当月へ繰入 ở 9.4). Gồm thuế・chưa thuế là tổng tính theo thuế suất từng dòng. Gồm các dòng phí xử lý, mua đứt, sản phẩm thay thế. Không ghi 「後払い分」."], demo_ok=[H_WORD, "Code có từ 「後払い」「前請求」 (bài tập H-A1). Theo sổ quyết định F và 運営E Q-E3, ghi là 「実績精算」「固定額」"], vi="Tổng đối soát thực tế của chi nhánh này"),
]
D_STOCKADJ = [
    F("11", "この期間に反映された在庫調整", ".es-card::在庫調整", "table",
      detail=["運営が登録した在庫調整のうち、この期間に反映された分（登録日時・登録者・商品・数量・理由）。ない期間は表の中に「この期間の在庫調整はありません」。実績精算を確定した月は在庫調整を編集できない（直すときは先に「確定を解除」。請求済み以降は翌月の調整で相殺・在庫.md §6-4）。", "Trong các điều chỉnh tồn kho do vận hành đăng ký, phần đã phản ánh trong kỳ này (ngày giờ đăng ký・người đăng ký・sản phẩm・số lượng・lý do). Kỳ không có thì trong bảng hiển thị 「この期間の在庫調整はありません」. Tháng đã chốt đối soát thực tế thì không sửa được điều chỉnh tồn kho (khi sửa, trước hết 「確定を解除」. Sau khi đã xuất hóa đơn thì bù trừ bằng điều chỉnh tháng sau・在庫.md §6-4)."], vi="Điều chỉnh tồn kho đã phản ánh trong kỳ này"),
    F("11.1", "在庫調整詳細へ", "button::在庫調整詳細へ", "button", "click", detail=["押すとこの拠点の在庫詳細（AW_STCK_002）へ移る。", "Nhấn để chuyển sang chi tiết tồn kho của chi nhánh này (AW_STCK_002)."], vi="Sang chi tiết điều chỉnh tồn kho"),
]
D_WARN_ALERT = F("3.1", "差分率・廃棄率の警告", ".es-inline--warning", "label", "show", err=["W143"], cond=["未確定で、差分率の絶対値または廃棄率が10%以上のとき（報告が多い＝マイナスのときも同じ）", "Khi chưa chốt và giá trị tuyệt đối của tỷ lệ chênh lệch hoặc tỷ lệ hủy từ 10% trở lên (khi báo cáo nhiều hơn = âm cũng giống vậy)"],
                 detail=["警告の帯。W143（「差分率・廃棄率が10%以上です。赤い行を確かめてから確定してください。」）。商品別明細の赤い行を確かめて確定する。", "Dải cảnh báo. W143 (「差分率・廃棄率が10%以上です。赤い行を確かめてから確定してください。」). Xác nhận dòng đỏ của chi tiết theo sản phẩm rồi chốt."], demo_ok=[H_MSG, "Câu chữ không có trong code (bài tập). Thiết kế theo sổ quyết định F, ID thông báo đã đánh số từ chỗ trống của dải 運営E"], vi="Cảnh báo tỷ lệ chênh lệch・tỷ lệ hủy")
D_INFO_NOCHECK = F("3.2", "棚卸なし・最初の報告前の帯", ".es-inline::棚卸", "label", "show", err=["I143"], cond=["棚卸なしの拠点、または最初の棚卸報告がまだの拠点", "Chi nhánh không kiểm kê, hoặc chi nhánh chưa có báo cáo kiểm kê đầu tiên"],
                   detail=["棚卸なし：「この拠点は棚卸なしです。管理ロスは出さず、事務手数料もかかりません。」／最初の報告前：「最初の棚卸報告までは管理ロスを出しません（始まりの数がないため）。事務手数料は25日になるとかかります。」の2通り（I143。情報の帯）。リリース後の最初のサイクルは事務手数料も免除なので、最初の報告前の拠点の「事務手数料は25日になるとかかります」の部分は、3.4 の免除の案内に合わせる（メッセージ ID は採番待ち）。", "Không kiểm kê: 「この拠点は棚卸なしです。管理ロスは出さず、事務手数料もかかりません。」 / Trước báo cáo đầu tiên: 「最初の棚卸報告までは管理ロスを出しません（始まりの数がないため）。事務手数料は25日になるとかかります。」 là 2 loại (I143. Dải thông tin). Chu kỳ đầu tiên sau khi phát hành được miễn cả phí xử lý nên phần 「事務手数料は25日になるとかかります」 của chi nhánh trước báo cáo đầu tiên phải khớp với thông báo miễn ở 3.4 (ID thông báo đang chờ đánh số)."],
                   demo_ok=["コードの最初の報告前の文には事務手数料の記載がない（宿題）。台帳 F（Q-A3b）のとおり、最初の報告前の拠点にも事務手数料を付ける", "Câu trước báo cáo đầu tiên trong code không ghi phí xử lý (bài tập). Theo sổ quyết định F (Q-A3b), chi nhánh trước báo cáo đầu tiên cũng bị tính phí xử lý"], vi="Dải không kiểm kê・trước báo cáo đầu tiên")
D_WARN_FEE = F("3.3", "事務手数料の警告", ".es-inline--warning::事務手数料", "label", "show", err=["W144"], cond=["25日以降で棚卸の報告がない（または25日より後に報告した）拠点。お試し・棚卸なし・休止中（対象外）・買取は出さない。システム管理が手で外した拠点も出さない（9.8）。リリース後の最初のサイクルは免除なので出さない（案内は3.4）。「25日」は締め月の25日", "Chi nhánh từ ngày 25 trở đi mà không có báo cáo kiểm kê (hoặc báo cáo sau ngày 25). Dùng thử, không kiểm kê, tạm dừng (ngoài đối tượng), mua đứt thì không hiển thị. Chi nhánh bị quản trị hệ thống bỏ phí thủ công cũng không hiển thị (9.8). Chu kỳ đầu tiên sau khi phát hành được miễn nên không hiển thị (thông báo ở 3.4). 「25日」 là ngày 25 của tháng chốt sổ"],
               detail=["警告の帯。W144（「事務手数料 {金額}（税抜・{税率}%）がかかります。{理由}。請求は保留しません。」。{理由}＝25日までに棚卸の報告がありません／棚卸の報告が25日より後です）。金額・税率はオプション OP000016（プランマスタ）から。実績精算額の行にも事務手数料の行を足す。リリース後の最初のサイクルは免除なので、警告も行も出さない（3.4 の案内にする）。", "Dải cảnh báo. W144 (「事務手数料 {金額}（税抜・{税率}%）がかかります。{理由}。請求は保留しません。」. {理由} = 25日までに棚卸の報告がありません／棚卸の報告が25日より後です). Số tiền và thuế suất lấy từ option OP000016 (プランマスタ). Thêm cả dòng phí xử lý vào dòng số tiền đối soát thực tế. Chu kỳ đầu tiên sau khi phát hành được miễn nên không hiển thị cảnh báo lẫn dòng (thay bằng thông báo ở 3.4)."],
               demo_ok=[H_FEE + "。また「（2026-08-25 決定）」は画面の文に書かない（H-A5）", "Code không xem ngày, nếu chưa báo cáo thì dù ngày 10/05 vẫn hiển thị dòng phí xử lý (bài tập Q-A3). Sổ quyết định F là từ ngày 25. Ngoài ra không ghi 「（2026-08-25 決定）」 trong câu của màn hình (H-A5)"], vi="Cảnh báo phí xử lý")
D_FEE_PRE = F("3.4", "事務手数料の予告", "-", "label", "show", err=["I144"], cond=["25日（締め月の25日）より前で、棚卸の報告がない拠点（お試し・棚卸なし・休止中（対象外）・買取は出さない）。リリース後の最初のサイクルは、事務手数料がかからない案内に替える（25日以降も同じ）", "Trước ngày 25 (của tháng chốt sổ) và chi nhánh không có báo cáo kiểm kê (dùng thử, không kiểm kê, tạm dừng (ngoài đối tượng), mua đứt thì không hiển thị). Ở chu kỳ đầu tiên sau khi phát hành, thay bằng thông báo không tính phí xử lý (từ ngày 25 trở đi cũng vậy)"],
              detail=["情報の帯。I144（「25日までに棚卸の報告がないと、事務手数料（{金額}・税抜）がかかります。」）。精算額・請求書の行には事務手数料を出さない（システム管理が手で足した拠点は25日より前でも行を出す・9.8）。リリース後の最初のサイクルは免除：事務手数料の行を出さず、I144 の代わりに「リリース後の最初のサイクルは事務手数料がかかりません」と案内する（メッセージ ID は採番待ち。新しい ID は作らない）。", "Dải thông tin. I144 (「25日までに棚卸の報告がないと、事務手数料（{金額}・税抜）がかかります。」). Không hiển thị dòng phí xử lý ở số tiền đối soát, hóa đơn (chi nhánh được quản trị hệ thống thêm phí thủ công thì hiển thị dòng dù trước ngày 25・9.8). Chu kỳ đầu tiên sau khi phát hành được miễn: không hiển thị dòng phí xử lý, thay I144 bằng thông báo 「リリース後の最初のサイクルは事務手数料がかかりません」 (ID thông báo đang chờ đánh số; không tạo ID mới)."], demo_ok=[H_FEE, "Code không xem ngày, nếu chưa báo cáo thì dù ngày 10/05 vẫn hiển thị dòng phí xử lý (bài tập Q-A3). Sổ quyết định F là từ ngày 25"], vi="Báo trước phí xử lý")
D_INFO_BILLED = F("3.5", "当月分は請求済みの帯", ".es-inline--negative", "label", "show", cond=["この拠点の当月分の実績精算が請求書に載っているとき（実績精算が載っていない月は 3.9）", "Khi đối soát thực tế của tháng này của chi nhánh này đã vào hóa đơn (tháng mà đối soát thực tế chưa vào hóa đơn là 3.9)"],
                  err=["E54"],
                  detail=["赤い帯。E54（「この拠点の当月分は請求済みです。金額に効く変更はできません。」）に請求書番号を添える。確定・解除・内訳の確定ボタンを出さない。直したい差額は請求の確定・請求書の「③ 調整」で翌月以降の請求月を指定して入れる（そこへのボタンを帯に置く）。", "Dải đỏ. Thêm số hóa đơn vào E54 (「この拠点の当月分は請求済みです。金額に効く変更はできません。」). Không hiển thị nút chốt, hủy chốt, chốt khoản. Khoản chênh lệch muốn sửa thì nhập ở 「③ 調整」 của 請求の確定・請求書 bằng cách chỉ định tháng hóa đơn từ tháng sau (đặt nút sang đó ở dải)."], demo_ok=["【撮影不可】請求書を作る操作が要り、後の状態のデータが変わるため撮らない", "【Không chụp được】Cần thao tác tạo hóa đơn và làm thay đổi dữ liệu của các trạng thái sau nên không chụp"], vi="Dải tháng này đã xuất hóa đơn")
D_INFO_TRIAL = F("3.6", "お試しの帯", ".es-inline::お試し", "label", "show", err=["I145"], cond=["お試しキャンペーンの拠点", "Chi nhánh của chiến dịch dùng thử"],
                 detail=["情報の帯。I145（「お試しの拠点です。事務手数料はかかりません。」）。コードの長い説明（前払いの割引・0円の請求書など）は画面の文に書かない。", "Dải thông tin. I145 (「お試しの拠点です。事務手数料はかかりません。」). Không ghi giải thích dài của code (giảm giá trả trước, hóa đơn 0 yên, v.v.) trong câu của màn hình."],
                 demo_ok=["コードは「お試しキャンペーンの請求書（2026-10-01 回答 O5）」と前払い・0円の請求書の説明を長く出す（宿題 H-A1・H-A5）", "Code hiển thị dài giải thích 「お試しキャンペーンの請求書（2026-10-01 回答 O5）」 và hóa đơn trả trước, hóa đơn 0 yên (bài tập H-A1・H-A5)"], vi="Dải dùng thử")
D_INFO_PAUSE = F("3.7", "休止中の帯", "-", "label", "show", err=["I146"], cond=["「対象外」の休止中の拠点（休止の始めの報告があった月の翌月から／「スキップ」を選んだ月から／リリース時にすでに休止中なら最初から）。休止の始めの月は通常の詳細なので出さない", "Chi nhánh tạm dừng 「対象外」 (từ tháng sau tháng có báo cáo bắt đầu tạm dừng / từ tháng chọn 「スキップ」 / ngay từ đầu nếu đã tạm dừng sẵn lúc phát hành). Tháng bắt đầu tạm dừng là chi tiết thường nên không hiển thị"],
                 detail=["情報の帯。I146（「休止中の拠点です。実績精算の対象外です。」）。確定・解除・内訳の確定を出さない。", "Dải thông tin. I146 (「休止中の拠点です。実績精算の対象外です。」). Không hiển thị chốt, hủy chốt, chốt khoản."], open=["【要確認】「休止の始めの報告を最初の棚卸報告とみなす」点（台帳 F 2026-10-08 に決定がなく未決）", "【Cần xác nhận】Việc coi 「báo cáo bắt đầu tạm dừng」 là 「báo cáo kiểm kê đầu tiên」 (sổ quyết định F 2026-10-08 chưa có quyết định)"], ask="hong",
                 demo_ok=[H_MSG, "Câu chữ không có trong code (bài tập). Thiết kế theo sổ quyết định F, ID thông báo đã đánh số từ chỗ trống của dải 運営E"], vi="Dải đang tạm dừng")
D_INFO_BUY = F("3.8", "買取の帯", "-", "label", "show", err=["I147"], cond=["惣菜買取の拠点（子契約の「惣菜買取」が ON）", "Chi nhánh mua đứt món ăn (「惣菜買取」 của hợp đồng con là ON)"],
               detail=["情報の帯。I147（「この拠点は惣菜買取です。納品した数で精算します（棚卸・管理ロス・事務手数料はありません）。」）。", "Dải thông tin. I147 (「この拠点は惣菜買取です。納品した数で精算します（棚卸・管理ロス・事務手数料はありません）。」)."],
               demo_ok=["コードに惣菜買取の帯がない（宿題 H-A11・Q-A5）。台帳 F のとおり設計する", "Code không có dải mua đứt món ăn (bài tập H-A11・Q-A5). Thiết kế theo sổ quyết định F"], vi="Dải mua đứt")

D_FEE_ADJ = [
    F("9.8", "事務手数料を足す／外す", "-", "button", "click",
      cond=["システム管理（フル権限）だけに表示。経理・物流・CS ほかには出さない。請求書に載る前の拠点だけ（請求済み・過去月は出さない）。「足す」＝事務手数料の行がない拠点、「外す」＝事務手数料の行がある拠点（自動で付いた行も手で足した行も外せる）", "Chỉ hiển thị cho quản trị hệ thống (quyền đầy đủ). Không hiển thị cho kế toán, logistics, CS, v.v. Chỉ chi nhánh trước khi vào hóa đơn (đã xuất hóa đơn・tháng đã qua thì không hiển thị). 「足す」 = chi nhánh chưa có dòng phí xử lý, 「外す」 = chi nhánh đã có dòng phí xử lý (bỏ được cả dòng tự động lẫn dòng thêm thủ công)"],
      err=["Q141", "S149", "E32", "E54"],
      detail=["事務手数料（9.6）を拠点ごとに手で足す／外す。押すと理由の入力（9.9）つきの確認ダイアログ（9.10・Q141）を出す。完了は S149。足した・外したことは、理由・操作者・日時とともに履歴に残す。手で足した拠点は25日より前でも行を出し、手で外した拠点は25日以降も警告（3.3）と行を出さない。リリース後の最初のサイクル（免除）でも、この操作は使える（手で足せば行を出す）。ボタンの名前（足す／外す）・理由欄の見出しは画面の項目名で、メッセージにしない。", "Thêm / bỏ phí xử lý (9.6) thủ công theo từng chi nhánh. Khi nhấn hiện hộp thoại xác nhận (9.10・Q141) có nhập lý do (9.9). Hoàn tất hiển thị S149. Việc thêm / bỏ được lưu vào lịch sử cùng lý do, người thao tác, ngày giờ. Chi nhánh được thêm thủ công thì hiển thị dòng dù trước ngày 25, chi nhánh bị bỏ thủ công thì từ ngày 25 trở đi cũng không hiển thị cảnh báo (3.3) và dòng. Ở chu kỳ đầu tiên sau khi phát hành (được miễn) thao tác này vẫn dùng được (thêm thủ công thì hiển thị dòng). Tên nút (足す / 外す) và tiêu đề ô lý do là tên mục trên màn hình, không làm thành thông báo."],
      demo_ok=["コードにない操作（台帳 F 2026-10-08）。実装後に撮り直す", "Thao tác không có trong code (sổ quyết định F 2026-10-08). Chụp lại sau khi triển khai"], vi="Thêm / bỏ phí xử lý"),
    F("9.9", "理由（事務手数料を足す／外す）", "-", "textarea", "input", req="○", len=["複数行 500", "Nhiều dòng, tối đa 500"], init=["空", "Trống"],
      ex=["電話で報告を受けたため手数料を外す。", "Lý do thêm / bỏ phí xử lý, nhập tự do (ví dụ: bỏ phí vì đã nhận báo cáo qua điện thoại)"],
      valid=["空は E01。500文字を超えたら E04。絵文字は不可（E13）。", "Để trống thì báo E01. Quá 500 ký tự thì báo E04. Không dùng emoji (E13)."], err=["E01", "E04", "E13"],
      detail=["足す／外す理由。確認ダイアログの中に出し、履歴に残す。文字数の上限は他の理由欄（購入管理の返金理由など）に合わせて 500。", "Lý do thêm / bỏ. Hiển thị trong hộp thoại xác nhận và lưu vào lịch sử. Giới hạn ký tự là 500, theo các ô lý do khác (ví dụ lý do hoàn tiền của quản lý mua hàng)."], vi="Lý do"),
    F("9.10", "事務手数料の手動調整の確認", ".es-modal__panel", "modal", "show", err=["Q141", "S149"],
      detail=["Q141（足す／外すのうち押したボタンの文）。ボタンは「キャンセル」と「足す」または「外す」。理由（9.9）が空のままでは進めない。実行すると事務手数料の行（9.6）・合計を更新し、S149。「キャンセル」「×」は何も変えない。", "Q141 ({ボタン名} = 足す / 外す). Nút là 「キャンセル」 và 「足す」 hoặc 「外す」. Chưa nhập lý do (9.9) thì không tiếp tục được. Khi thực hiện, cập nhật dòng phí xử lý (9.6) và tổng, hiển thị S149. 「キャンセル」「×」 không thay đổi gì."], vi="Xác nhận điều chỉnh phí xử lý thủ công"),
]

V_DETAIL = [
    ST("014", "AW_ACTL_002", ["当月・未確定（確定する内容 0/3）", "Tháng hiện tại・chưa chốt (nội dung chốt 0/3)"], ["フル権限で拠点 CU00643 を開いたとき。「確定する内容」0/3・実績精算の確認・サマリー・商品別明細・実績精算額と精算差額・在庫調整の順。", "Khi mở chi nhánh CU00643 bằng quyền đầy đủ. Thứ tự: 「確定する内容」 0/3, xác nhận đối soát thực tế, tổng hợp, chi tiết theo sản phẩm, số tiền đối soát thực tế và chênh lệch đối soát, điều chỉnh tồn kho."],
       D_HEAD[:4] + [D_HEAD[5]] + D_META + [F("3", "お知らせの帯", ".es-inline", "area", detail=["状態によって出す帯（差分率・廃棄率の警告／棚卸なし・最初の報告前／事務手数料の予告・警告／請求済／お試し／休止中／買取）。各帯は 状態 019〜027・034・035 で定義する。上から 警告・情報・請求済み の順。", "Các dải hiển thị tùy trạng thái (cảnh báo tỷ lệ chênh lệch・tỷ lệ hủy / không kiểm kê・trước báo cáo đầu tiên / báo trước・cảnh báo phí xử lý / đã xuất hóa đơn / dùng thử / tạm dừng / mua đứt). Từng dải được định nghĩa ở trạng thái 019〜027, 034 và 035. Thứ tự từ trên: cảnh báo, thông tin, đã xuất hóa đơn."], vi="Dải thông báo")]
       + D_CONFIRM[:6] + D_CONFIRM[7:] + D_CHECK + D_SUM + D_DETAIL + D_TOTAL + D_STOCKADJ,
       "/ops/billing/actuals/CU00643", full=True),
    ST("015", "AW_ACTL_002", ["内訳を1つ確定（S142）→ 1/3 → 3/3 で確定済み", "Chốt 1 khoản (S142) → 1/3 → 3/3 là đã chốt"], ["「管理ロス（棚卸）」の「確定」を押したとき。トースト S142（{対象}＝内訳名）・状態が「確定」・見出しの右が 1 / 3。3つ確定すると実績精算が確定済みになる。", "Khi nhấn 「確定」 của 「管理ロス（棚卸）」. Toast S142 ({対象} = tên khoản), trạng thái thành 「確定」, bên phải tiêu đề là 1 / 3. Chốt đủ 3 khoản thì đối soát thực tế được chốt."],
       [D_CONFIRM[5], D_CONFIRM[6], D_CONFIRM[4]], "/ops/billing/actuals/CU00643", setup=JS + "const pb=[...document.querySelectorAll('tbody button')].find(b=>b.textContent.trim()==='確定');pb?.click();await sleep(700);", today="2026/10/26"),
    ST("016", "AW_ACTL_002", ["残りをまとめて確定 → 確定済（確定を解除が出る）", "Chốt phần còn lại → đã chốt (hiển thị 「確定を解除」)"], ["ヘッダーの「残りをまとめて確定」を押し、確認ダイアログ（Q142）で「確定する」を押したとき（デモの日付は確定できる日以降の 10/26）。S142（{対象}＝この拠点の実績精算）。確定済みになり、ボタンは「確定を解除」に変わる。", "Khi nhấn 「残りをまとめて確定」 ở header rồi nhấn 「確定する」 ở hộp thoại xác nhận (Q142) (ngày demo là 10/26, sau ngày chốt được). S142 ({対象} = đối soát thực tế của chi nhánh này). Chuyển thành đã chốt, nút đổi thành 「確定を解除」."],
       [D_HEAD[4], D_META[4]], "/ops/billing/actuals/CU00643", setup=JS + "btn('残りをまとめて確定')?.click();await sleep(500);[...document.querySelectorAll('.es-modal__panel button')].find(b=>b.textContent.replace(/\\s+/g,'')==='確定する')?.click();await sleep(800);", today="2026/10/26"),
    ST("032", "AW_ACTL_002", ["確定を解除の確認（Q143）", "Xác nhận hủy chốt (Q143)"], [NOT_SHOT + "コードは確認なしで解除する（宿題 Q-A8）。確認ダイアログの実装後に撮り直す。確定済みの拠点で「確定を解除」を押したとき。確認ダイアログ（キャンセル／解除する）。解除すると3つの内訳が未確定に戻り、S143（{対象}＝この拠点の実績精算）。", "【Không chụp được】Code hủy chốt không cần xác nhận (bài tập Q-A8). Chụp lại sau khi triển khai hộp thoại xác nhận. Khi nhấn 「確定を解除」 ở chi nhánh đã chốt. Hộp thoại xác nhận (キャンセル／解除する). Khi hủy, 3 khoản trở về chưa chốt và hiển thị S143 ({対象} = đối soát thực tế của chi nhánh này)."],
       [F("12", "確定を解除の確認", "-", "modal", "show", err=["Q143", "S143"],
          detail=["タイトル「確定を解除しますか？」・本文「請求書に載せる前なら、もう一度確定できます。」。ボタンは「キャンセル」「解除する」（negative）。「解除する」で3つの内訳をすべて未確定に戻す。「キャンセル」「×」は何も変えない。", "Tiêu đề 「確定を解除しますか？」, nội dung 「請求書に載せる前なら、もう一度確定できます。」. Nút là 「キャンセル」「解除する」 (negative). Nhấn 「解除する」 để đưa cả 3 khoản về chưa chốt. 「キャンセル」「×」 không thay đổi gì."],
          demo_ok=[H_UNACT, "Code thực hiện 「確定を解除」 không cần xác nhận (bài tập Q-A8). Theo sổ quyết định F, hiển thị hộp thoại xác nhận (Q143)"], vi="Xác nhận hủy chốt")],
       "/ops/billing/actuals/CU00643", setup=JS + "btn('残りをまとめて確定')?.click();await sleep(500);[...document.querySelectorAll('.es-modal__panel button')].find(b=>b.textContent.replace(/\\s+/g,'')==='確定する')?.click();await sleep(800);btn('確定を解除')?.click();await sleep(500);", today="2026/10/26"),
    ST("038", "AW_ACTL_002", ["残りをまとめて確定の確認（Q142）", "Xác nhận chốt phần còn lại (Q142)"], [NOT_SHOT + "コードは確認なしで確定する。確認ダイアログの実装後に撮り直す。未確定の拠点で、確定できる日以降（デモの日付 10/26）に「残りをまとめて確定」を押したとき。一覧のまとめて確定（状態 006）と同じ確認（Q142・n＝1）。", "【Không chụp được】Code chốt không cần xác nhận. Chụp lại sau khi triển khai hộp thoại xác nhận. Khi nhấn 「残りをまとめて確定」 ở chi nhánh chưa chốt vào hoặc sau ngày chốt được (ngày demo 10/26). Xác nhận giống chốt hàng loạt ở danh sách (trạng thái 006) (Q142・n = 1)."],
       [F("19", "残りをまとめて確定の確認", ".es-modal__panel", "modal", "show", err=["Q142", "S142"],
          detail=["Q142（「1件の実績精算を確定しますか？」）。ボタンは「キャンセル」「確定する」。「確定する」で未確定の内訳をまとめて確定し、S142。「キャンセル」「×」は何も変えない。確定したあとの誤りは翌月の実績精算の調整で相殺する。", "Q142 (「1件の実績精算を確定しますか？」). Nút là 「キャンセル」「確定する」. Nhấn 「確定する」 để chốt hàng loạt các khoản chưa chốt và hiển thị S142. 「キャンセル」「×」 không thay đổi gì. Lỗi sau khi chốt được bù trừ bằng điều chỉnh đối soát thực tế tháng sau."],
          demo_ok=[H_DLG[0] % "Q142", H_DLG[1] % "Q142"], vi="Xác nhận chốt phần còn lại")],
       "/ops/billing/actuals/CU00643", nocap=True, today="2026/10/26"),
    ST("039", "AW_ACTL_002", ["内訳の確定を解除の確認（Q143）", "Xác nhận hủy chốt khoản (Q143)"], [NOT_SHOT + "コードは確認なしで解除する。確認ダイアログの実装後に撮り直す。確定済みの内訳の「解除」を押したとき。「確定を解除」（状態 032）と同じ確認（Q143）。", "【Không chụp được】Code hủy chốt không cần xác nhận. Chụp lại sau khi triển khai hộp thoại xác nhận. Khi nhấn 「解除」 của khoản đã chốt. Xác nhận giống 「確定を解除」 (trạng thái 032) (Q143)."],
       [F("20", "内訳の確定を解除の確認", ".es-modal__panel", "modal", "show", err=["Q143", "S143"],
          detail=["Q143（「確定を解除しますか？」・本文「請求書に載せる前なら、もう一度確定できます。」）。ボタンは「キャンセル」「解除する」（negative）。「解除する」でその内訳だけ未確定に戻し（実績精算の確定も外れる）、S143。「キャンセル」「×」は何も変えない。", "Q143 (「確定を解除しますか？」・nội dung 「請求書に載せる前なら、もう一度確定できます。」). Nút là 「キャンセル」「解除する」 (negative). Nhấn 「解除する」 để đưa chỉ khoản đó về chưa chốt (chốt đối soát thực tế cũng bị bỏ) và hiển thị S143. 「キャンセル」「×」 không thay đổi gì."],
          demo_ok=[H_DLG[0] % "Q143", H_DLG[1] % "Q143"], vi="Xác nhận hủy chốt khoản")],
       "/ops/billing/actuals/CU00643", nocap=True, today="2026/10/26"),
    ST("040", "AW_ACTL_002", ["事務手数料を手で足す／外す（システム管理）", "Thêm / bỏ phí xử lý thủ công (quản trị hệ thống)"], [NOT_SHOT + "コードにない。実装後に撮り直す。フル権限（Ad00010）で、事務手数料の行がある拠点（デモの日付 10/26・棚卸の未報告）を開き、「事務手数料を外す」→理由を入れる→確認（Q141）→S149。外すと行と警告が消える。事務手数料の行がない拠点（25日より前など）では「事務手数料を足す」になる。システム管理以外の役割にはボタンを出さない。", "【Không chụp được】Code không có. Chụp lại sau khi triển khai. Mở bằng quyền đầy đủ (Ad00010) chi nhánh có dòng phí xử lý (ngày demo 10/26・chưa báo cáo kiểm kê), nhấn 「事務手数料を外す」 → nhập lý do → xác nhận (Q141) → S149. Khi bỏ thì dòng và cảnh báo biến mất. Chi nhánh chưa có dòng phí xử lý (trước ngày 25, v.v.) thì là 「事務手数料を足す」. Không hiển thị nút cho vai trò khác ngoài quản trị hệ thống."],
       D_FEE_ADJ, "/ops/billing/actuals/CU00643", nocap=True, today="2026/10/26", full=True),
    ST("033", "AW_ACTL_002", ["確定を解除できない（請求済み：E54／確定済み：E184）", "Không hủy chốt được (đã xuất hóa đơn: E54 / đã chốt: E184)"], ["解除・内訳の確定を押したが、請求書に載っている（E54）、または別の運営が確定済みにしていた（E184）とき。文言は「請求済」と「確定済」で分ける（台帳 F・Q-A8b）。" + NOT_SHOT + "請求済みの月は状態 026 の操作で作る。E184 は別の運営が先に確定した状態の再現が要る（seed では作れない）。", "Nhấn hủy hoặc chốt khoản nhưng đã vào hóa đơn (E54), hoặc nhân viên vận hành khác đã chốt (E184). Câu chữ phân biệt 「請求済」 và 「確定済」 (sổ quyết định F・Q-A8b). 【Không chụp được】Tháng đã xuất hóa đơn tạo bằng thao tác của trạng thái 026. E184 cần tái hiện trạng thái nhân viên vận hành khác chốt trước (không tạo được bằng seed)."],
       [F("13", "請求済みで解除できない", ".es-toast", "toast", "show", err=["E54"], detail=["請求書に載っているとき、解除・内訳の確定・確定のボタンは出さない。画面の古い表示から押された場合は E54（トースト）。直したい差額は ③ 調整（翌月以降）へ。", "Khi đã vào hóa đơn thì không hiển thị nút hủy, chốt khoản, chốt. Nếu bị nhấn từ hiển thị cũ của màn hình thì là E54 (toast). Khoản chênh lệch muốn sửa đưa vào ③ điều chỉnh (từ tháng sau)."], demo_ok=["【撮影不可】請求済みの再現が要るため、撮れない", "【Không chụp được】Cần tái hiện trạng thái đã xuất hóa đơn nên không chụp được"], vi="Đã xuất hóa đơn nên không hủy được"),
        F("13.1", "確定済みで変更できない", ".es-toast", "toast", "show", err=["E184"], detail=["別の運営が先に確定した等、確定済みの内訳を変えようとしたとき E184（「確定を解除してから直してください」）。請求済みは E54。", "Khi nhân viên vận hành khác đã chốt trước, v.v. và cố đổi khoản đã chốt thì là E184 (「確定を解除してから直してください」). Đã xuất hóa đơn là E54."], demo_ok=["【撮影不可】別の運営が先に確定した状態の再現が要るため、撮れない", "【Không chụp được】Cần tái hiện trạng thái nhân viên vận hành khác đã chốt trước nên không chụp được"], vi="Đã chốt nên không đổi được")],
       "/ops/billing/actuals/CU00643", nocap=True),
    ST("017", "AW_ACTL_002", ["現金利用あり（アプリの現金支払いの表）", "Có dùng tiền mặt (bảng thanh toán tiền mặt trên app)"], ["現金利用のある拠点 CU00871（大阪支店）。「アプリの現金支払い（ドライバーの回収）」の表が出る。見本では回収予定＝回収額。", "Chi nhánh có dùng tiền mặt CU00871 (chi nhánh Osaka). Hiển thị bảng 「アプリの現金支払い（ドライバーの回収）」. Trong dữ liệu mẫu số dự kiến thu = số thu."],
       [F("7", "アプリの現金支払い（ドライバーの回収）", ".es-card::アプリの現金支払い", "table", cond=["現金利用のある拠点だけ", "Chỉ chi nhánh có dùng tiền mặt"],
          detail=["見出しの右に対象期間。列＝回収日・配送データ・回収したドライバー・回収予定額・実際の回収額・差額（税込／税抜）。現金の回収がない期間は表の中に「この期間の現金の回収はありません」。合計行。税率は設定管理の「現金回収差額の税率」。", "Bên phải tiêu đề là kỳ đối tượng. Cột = ngày thu・dữ liệu giao hàng・tài xế thu・số tiền dự kiến thu・số tiền thực thu・chênh lệch (gồm thuế / chưa thuế). Kỳ không có thu tiền mặt thì trong bảng hiển thị 「この期間の現金の回収はありません」. Dòng tổng. Thuế suất là 「現金回収差額の税率」 của quản lý thiết lập."], vi="Thanh toán tiền mặt trên app (tài xế thu)"),
        F("7.1", "回収予定額・回収額", "th::回収予定額", "label", len="金額（円・税込／税抜）", detail=["アプリで現金を選んだ注文の予定額と、ドライバーが実際に回収した額。右寄せ。", "Số tiền dự kiến của đơn chọn tiền mặt trên app và số tiền tài xế thực tế thu. Căn phải."], vi="Số tiền dự kiến thu・số tiền thu")],
       "/ops/billing/actuals/CU00871", full=True),
    ST("018", "AW_ACTL_002", ["現金の差額あり（不足／多い のタグ）", "Có chênh lệch tiền mặt (tag thiếu / thừa)"], [NOT_SHOT + "見本では回収予定＝回収額で差額が出ない。ドライバーアプリで回収額を変えてから開くと作れる。差額の列に「不足 n円」（赤）／「多い n円」（黄）を出し、差額だけを実績精算に載せる（不足＝請求、多い＝減額）。", "【Không chụp được】Trong dữ liệu mẫu số dự kiến thu = số thu nên không có chênh lệch. Có thể tạo bằng cách đổi số thu ở app tài xế rồi mở. Cột chênh lệch hiển thị 「不足 n円」 (đỏ) / 「多い n円」 (vàng), chỉ ghi phần chênh lệch vào đối soát thực tế (thiếu = thu thêm, thừa = giảm)."],
       [F("7.2", "差額のタグ", "tbody .es-badge::不足", "label", detail=["回収予定 − 実際の回収。正なら「不足 n円」（赤・請求）、負なら「多い n円」（黄・減額）、0 なら「—」。回収予定額と実際の回収額が違うときだけ差額を実績精算に載せる。", "Dự kiến thu − thực thu. Dương là 「不足 n円」 (đỏ・thu thêm), âm là 「多い n円」 (vàng・giảm), 0 là 「—」. Chỉ khi số tiền dự kiến thu và số thực thu khác nhau mới ghi chênh lệch vào đối soát thực tế."], demo_ok=["【撮影不可】見本で回収予定と回収額が一致しているため、差額が出ず撮れない", "【Không chụp được】Trong dữ liệu mẫu số dự kiến thu và số thu khớp nhau nên không có chênh lệch, không chụp được"], vi="Tag chênh lệch")],
       "/ops/billing/actuals/CU00871", nocap=True),
    ST("019", "AW_ACTL_002", ["差分率・廃棄率が10%以上（警告・赤い行）", "Tỷ lệ chênh lệch・tỷ lệ hủy từ 10% trở lên (cảnh báo・dòng đỏ)"], [NOT_SHOT + "seed に10%以上の拠点があるか未確認。なければ棚卸の報告を入れて作る。警告の帯と、商品別明細の赤い行。差分率は絶対値で10%以上（−12% のように報告が多い場合も同じ）。", "【Không chụp được】Chưa xác nhận seed có chi nhánh từ 10% trở lên không. Nếu không có thì nhập báo cáo kiểm kê để tạo. Dải cảnh báo và dòng đỏ của chi tiết theo sản phẩm. Tỷ lệ chênh lệch tính theo giá trị tuyệt đối từ 10% trở lên (kể cả khi báo cáo nhiều hơn như −12%)."],
       [D_WARN_ALERT, D_DETAIL[0]], "/ops/billing/actuals/CU00643", nocap=True),
    ST("020", "AW_ACTL_002", ["事務手数料の警告（25日以降・棚卸の未報告）", "Cảnh báo phí xử lý (từ ngày 25・chưa báo cáo kiểm kê)"], ["デモの日付を 10/25 以降にして、棚卸の報告がない拠点を開く。警告の帯と、実績精算額と精算差額の表に事務手数料の行が載る（税抜 ¥3,000・税率はオプションのマスタ）。リリース後の最初のサイクルは免除なので、この状態にならず、3.4 の「リリース後の最初のサイクルは事務手数料がかかりません」の案内になる（メッセージ ID は採番待ち）。", "Đặt ngày demo từ 10/25 trở đi và mở chi nhánh không có báo cáo kiểm kê. Dải cảnh báo, và dòng phí xử lý được ghi vào bảng số tiền đối soát thực tế và chênh lệch đối soát (chưa thuế ¥3,000・thuế suất theo master option). Chu kỳ đầu tiên sau khi phát hành được miễn nên không rơi vào trạng thái này mà là thông báo 「リリース後の最初のサイクルは事務手数料がかかりません」 ở 3.4 (ID thông báo đang chờ đánh số)."],
       [D_WARN_FEE, F("9.6", "事務手数料の行", "tfoot td::事務手数料", "label", cond=["25日以降（締め月の25日）で棚卸の報告がない拠点（上の帯と同じ条件）、またはシステム管理が手で足した拠点（9.8）。システム管理が手で外した拠点は出さない。リリース後の最初のサイクルは免除なので、自動では出さない（手で足した拠点だけ出す）", "Chi nhánh từ ngày 25 (của tháng chốt sổ) trở đi mà không có báo cáo kiểm kê (cùng điều kiện với dải ở trên), hoặc chi nhánh được quản trị hệ thống thêm phí thủ công (9.8). Chi nhánh bị quản trị hệ thống bỏ phí thủ công thì không hiển thị. Chu kỳ đầu tiên sau khi phát hành được miễn nên không tự động hiển thị (chỉ hiển thị chi nhánh được thêm thủ công)"], len="金額（円・税込／税抜）",
                      detail=["「＋ 事務手数料（棚卸の未報告・n%）」。金額はオプション OP000016（税抜 ¥3,000・税率はマスタ）。この拠点の実績精算の合計に含める。請求書の実績精算の行にも載る。システム管理は拠点ごとに手で足す／外せる（9.8。免除のサイクルでも使える）。", "「＋ 事務手数料（棚卸の未報告・n%）」. Số tiền theo option OP000016 (chưa thuế ¥3,000・thuế suất theo master). Tính vào tổng đối soát thực tế của chi nhánh này. Cũng được ghi vào dòng đối soát thực tế của hóa đơn. Quản trị hệ thống có thể thêm / bỏ thủ công theo từng chi nhánh (9.8. Dùng được cả ở chu kỳ được miễn)."], vi="Dòng phí xử lý")],
       "/ops/billing/actuals/CU00643", today="2026/10/26", full=True),
    ST("034", "AW_ACTL_002", ["事務手数料の予告（25日より前）", "Báo trước phí xử lý (trước ngày 25)"], [NOT_SHOT + "コードは日付を見ず予告の帯がない（宿題 Q-A3）。実装後に撮り直す。デモの日付が 10/25 より前（見本は 10/05）で、棚卸の報告がない拠点を開く。事務手数料の行は出さず、予告の帯だけ。リリース後の最初のサイクルは免除なので、予告の代わりに「リリース後の最初のサイクルは事務手数料がかかりません」の案内を出す（メッセージ ID は採番待ち）。", "【Không chụp được】Code không xem ngày và không có dải báo trước (bài tập Q-A3). Chụp lại sau khi triển khai. Ngày demo trước 10/25 (dữ liệu mẫu là 10/05) và mở chi nhánh không có báo cáo kiểm kê. Không hiển thị dòng phí xử lý, chỉ có dải báo trước. Chu kỳ đầu tiên sau khi phát hành được miễn nên thay dải báo trước bằng thông báo 「リリース後の最初のサイクルは事務手数料がかかりません」 (ID thông báo đang chờ đánh số)."],
       [D_FEE_PRE], "/ops/billing/actuals/CU00643", today="2026/10/05"),
    ST("021", "AW_ACTL_002", ["最初の棚卸報告前・棚卸なし（管理ロスは対象なし）", "Trước báo cáo kiểm kê đầu tiên・không kiểm kê (hao hụt quản lý không có đối tượng)"], ["最初の棚卸報告前の拠点、または棚卸なしの拠点。管理ロスの内訳は金額「—」・「対象なし」。最初の報告前の拠点には事務手数料が付く（25日から。ただしリリース後の最初のサイクルは免除）。棚卸なしには付かない。" + NOT_SHOT + "対象の拠点が見本にあるかは未確認（棚卸しの 009・010 と同じ作り方）。", "Chi nhánh trước báo cáo kiểm kê đầu tiên, hoặc chi nhánh không kiểm kê. Khoản hao hụt quản lý có số tiền 「—」・「対象なし」. Chi nhánh trước báo cáo đầu tiên bị tính phí xử lý (từ ngày 25. Tuy nhiên chu kỳ đầu tiên sau khi phát hành được miễn). Không kiểm kê thì không tính. 【Không chụp được】Chưa xác nhận dữ liệu mẫu có chi nhánh phù hợp không (cách tạo giống 009・010 của 棚卸し)."],
       [D_INFO_NOCHECK, D_CONFIRM[1]], "/ops/billing/actuals/CU00643", nocap=True),
    ST("022", "AW_ACTL_002", ["お試し（事務手数料なし）", "Dùng thử (không phí xử lý)"], ["お試しキャンペーンの拠点（CU00975・CU00701）。帯を出し、事務手数料の行は載せない。", "Chi nhánh của chiến dịch dùng thử (CU00975・CU00701). Hiển thị dải, không ghi dòng phí xử lý."],
       [D_INFO_TRIAL], "/ops/billing/actuals/CU00975"),
    ST("023", "AW_ACTL_002", ["休止中（対象外・確定の操作なし）", "Đang tạm dừng (ngoài đối tượng・không có thao tác chốt)"], [NOT_SHOT + "コードに休止中の帯がなく、確定の操作も出る（宿題 H-A10）。実装後に撮り直す。休止中の拠点 CU00902（デモの日付が 10/12 以降）。「対象外」になった月（休止の始めの報告があった月の翌月から／「スキップ」を選んだ月から／リリース時にすでに休止中なら最初から）は、帯を出し、確定・解除・内訳の確定のボタンを出さない。確定する内容の金額は「—」。休止の始めの報告があった月は通常の詳細で、確定できる。", "【Không chụp được】Code không có dải tạm dừng và vẫn hiển thị thao tác chốt (bài tập H-A10). Chụp lại sau khi triển khai. Chi nhánh đang tạm dừng CU00902 (ngày demo từ 10/12 trở đi). Tháng đã thành 「対象外」 (từ tháng sau tháng có báo cáo bắt đầu tạm dừng / từ tháng chọn 「スキップ」 / ngay từ đầu nếu đã tạm dừng sẵn lúc phát hành): hiển thị dải, không hiển thị nút chốt, hủy chốt, chốt khoản. Số tiền của nội dung chốt là 「—」. Tháng có báo cáo bắt đầu tạm dừng là màn hình chi tiết thường, chốt được."],
       [D_INFO_PAUSE, D_HEAD[3], D_CONFIRM[5]], "/ops/billing/actuals/CU00902", today="2026/10/12",
       ),
    ST("024", "AW_ACTL_002", ["価格調整あり（子契約の値を参照表示・金額つき）", "Có điều chỉnh giá (hiển thị tham chiếu giá trị hợp đồng con・có số tiền)"], ["子契約に価格調整（値上げ／値下げ／無料提供）がある拠点。実績精算の確認に価格調整を表示だけし、子契約へのリンクを出す。サマリー・商品別明細・精算額に価格調整差額の金額（±）を出す（実績精算の内訳の1行として、同じ請求書の ② に載る）。" + NOT_SHOT + "見本で価格調整のある子契約は未確認。なければ子契約（AW_CONT_003）で価格調整を設定してから開く。", "Chi nhánh có điều chỉnh giá (tăng giá / giảm giá / cung cấp miễn phí) ở hợp đồng con. Chỉ hiển thị điều chỉnh giá ở xác nhận đối soát thực tế và hiển thị link sang hợp đồng con. Ở tổng hợp, chi tiết theo sản phẩm, số tiền đối soát hiển thị số tiền chênh lệch điều chỉnh giá (±) (ghi thành 1 dòng khoản của đối soát thực tế ở mục ② của cùng hóa đơn). 【Không chụp được】Chưa xác nhận dữ liệu mẫu có hợp đồng con có điều chỉnh giá không. Nếu không có thì thiết lập điều chỉnh giá ở hợp đồng con (AW_CONT_003) rồi mở."],
       [D_CHECK[3], D_CHECK[4], D_DETAIL[4], D_SUM[2]], "/ops/billing/actuals/CU00643", nocap=True),
    ST("025", "AW_ACTL_002", ["代替品の行・資材の追加配送の行", "Dòng sản phẩm thay thế・dòng giao thêm vật tư"], [NOT_SHOT + "seed に代替品設定・追加配送のある拠点があるか未確認。「代替品（実績精算の行）」のカードに内容と金額（元の税率）を出す。", "【Không chụp được】Chưa xác nhận seed có chi nhánh có thiết lập sản phẩm thay thế・giao thêm không. Thẻ 「代替品（実績精算の行）」 hiển thị nội dung và số tiền (thuế suất gốc)."],
       [F("10", "代替品（実績精算の行）", ".es-card::代替品", "table", cond=["代替品設定の差替・補償、資材の追加配送がある拠点だけ", "Chỉ chi nhánh có thay thế・bồi thường của thiết lập sản phẩm thay thế, hoặc giao thêm vật tư"],
          detail=["列＝内容・金額（税込／税抜）。差替＝元の商品の単価、補償＝0円（お客様に見える行）、除外＝載せない。この拠点の実績精算の合計に含める。追加配送の配送費は ES の負担。税率は元の商品の税率。", "Cột = nội dung・số tiền (gồm thuế / chưa thuế). Thay thế = đơn giá của sản phẩm gốc, bồi thường = 0 yên (dòng khách hàng nhìn thấy), loại trừ = không ghi. Tính vào tổng đối soát thực tế của chi nhánh này. Phí giao thêm do ES chịu. Thuế suất là thuế suất của sản phẩm gốc."], demo_ok=["【撮影不可】見本に代替品設定・追加配送のある拠点がないため、撮れない", "【Không chụp được】Dữ liệu mẫu không có chi nhánh có thiết lập sản phẩm thay thế・giao thêm nên không chụp được"], vi="Sản phẩm thay thế (dòng đối soát thực tế)")],
       "/ops/billing/actuals/CU00643", nocap=True),
    ST("026", "AW_ACTL_002", ["当月分は請求済み（確定・解除・内訳なし）", "Tháng này đã xuất hóa đơn (không chốt・hủy・khoản)"], [NOT_SHOT + "実績精算を確定してから、請求の確定（AW_BILL）で固定額を確定し請求書を作成して開く（操作が要る。実績精算が請求書に載った月）。赤い帯（E54）を出し、確定・解除・内訳の確定を出さない。", "【Không chụp được】Chốt đối soát thực tế, rồi chốt cố định ở 請求の確定 (AW_BILL) và tạo hóa đơn rồi mới mở (cần thao tác. Tháng mà đối soát thực tế đã vào hóa đơn). Hiển thị dải đỏ (E54), không hiển thị chốt, hủy chốt, chốt khoản."],
       [D_INFO_BILLED, F("3.10", "③ 調整へ", ".es-inline--negative button", "button", "click", detail=["請求書の「③ 調整（単発・繰越）」へ移る（翌月以降の請求月で差額を入れる）。", "Chuyển sang 「③ 調整（単発・繰越）」 của hóa đơn (nhập chênh lệch bằng tháng hóa đơn từ tháng sau)."], demo_ok=["【撮影不可】請求済みの月が見本にないため、撮れない", "【Không chụp được】Dữ liệu mẫu không có tháng đã xuất hóa đơn nên không chụp được"], vi="Sang ③ điều chỉnh")],
       "/ops/billing/actuals/CU00643", nocap=True),
    ST("027", "AW_ACTL_002", ["実績精算が未確定のまま請求書を発行（後に回した）", "Xuất hóa đơn khi đối soát thực tế chưa chốt (để lại sau)"], [NOT_SHOT + "026 の手順で、実績精算を確定せずに請求書を作成する。請求書に載っていない実績精算は翌月の請求書で精算（請求ルール 1-7）。確定のボタンは出る。", "【Không chụp được】Theo thủ tục của 026, tạo hóa đơn mà không chốt đối soát thực tế. Đối soát thực tế chưa vào hóa đơn sẽ được đối soát ở hóa đơn tháng sau (請求ルール 1-7). Nút chốt vẫn hiển thị."],
       [F("3.9", "後に回した実績精算", ".es-inline", "label", "show", cond=["実績精算が未確定のまま、請求書だけ作成・発行されたとき（請求書に実績精算が載っていない。載っているときは 3.5）", "Khi hóa đơn chỉ được tạo・xuất trong lúc đối soát thực tế chưa chốt (đối soát thực tế chưa vào hóa đơn. Khi đã vào hóa đơn là 3.5)"],
          detail=["この月の請求書には実績精算が載っておらず、確定すると翌月の請求書で精算される。翌月の請求書では、その金額の行に対象期間（前月21日〜当月20日。例：2026-10 締めなら 2026-09-21〜2026-10-20）を出し、「【2026-10 締め】…」のような備考は出さない（hong 2026-10-08・客先には未確認。請求の確定・請求書 AW_BILL_002 の 13.9）。確定・内訳の確定は押せる（請求済みの帯 3.5 は出さない。3.5 と同時には出ない）。", "Hóa đơn của tháng này không có đối soát thực tế, khi chốt thì sẽ được đối soát ở hóa đơn tháng sau. Ở hóa đơn tháng sau, dòng số tiền đó hiển thị kỳ đối tượng (từ ngày 21 tháng trước đến ngày 20 tháng này; ví dụ chốt 2026-10 là 2026-09-21〜2026-10-20) và không hiển thị ghi chú kiểu 「【2026-10 締め】…」 (hong 2026-10-08, chưa xác nhận với khách; AW_BILL_002 mục 13.9). Nhấn được chốt, chốt khoản (không hiển thị dải đã xuất hóa đơn 3.5. Không hiển thị cùng lúc với 3.5)."], vi="Đối soát thực tế để lại sau")],
       "/ops/billing/actuals/CU00643", nocap=True),
    ST("028", "AW_ACTL_002", ["過去月の詳細（確定の記録・載った請求書）", "Chi tiết tháng đã qua (bản ghi chốt・hóa đơn đã vào)"], ["対象月 2026-09 の拠点を開く（/ops/billing/actuals/CU00643?m=2026-09）。サマリー3枚と「確定の記録」だけ。確定・解除のボタンは出さない。在庫詳細へのボタン。", "Mở chi nhánh của tháng đối tượng 2026-09 (/ops/billing/actuals/CU00643?m=2026-09). Chỉ có 3 thẻ tổng hợp và 「確定の記録」. Không hiển thị nút chốt, hủy chốt. Có nút sang chi tiết tồn kho."],
       [F("14", "確定の記録", ".es-card::確定の記録", "area", detail=["確定日時・確定者・載った請求書（請求書番号のリンク。載っていなければ「—」）。確定したときの写しから出す。", "Ngày giờ chốt・người chốt・hóa đơn đã vào (link số hóa đơn. Nếu chưa vào thì 「—」). Hiển thị từ bản sao lúc chốt."], vi="Bản ghi chốt"),
        F("14.1", "確定日時", ".es-field::確定日時", "label", len="日時 yyyy-mm-dd HH:MM", vi="Ngày giờ chốt"),
        F("14.2", "確定者", ".es-field::確定者", "label", detail=["確定した運営の名前。固定の名前を出さない。", "Tên nhân viên vận hành đã chốt. Không hiển thị tên cố định."], demo_ok=[H_FIX, "Code hiển thị tên người thao tác và ngày báo cáo bằng chuỗi cố định (bài tập H-A8). Hiển thị nhân viên vận hành đang đăng nhập và ngày báo cáo thực tế"], vi="Người chốt"),
        F("14.3", "載った請求書", ".es-field::載った請求書", "link", "click", detail=["請求書番号。押すと請求書の詳細（AW_BILL）へ。", "Số hóa đơn. Nhấn để sang chi tiết hóa đơn (AW_BILL)."], vi="Hóa đơn đã vào"),
        F("14.4", "在庫詳細", ".es-pagehead__actions button::在庫詳細", "button", "click", detail=["押すとその月の在庫詳細（AW_STCK_002）へ移る。", "Nhấn để chuyển sang chi tiết tồn kho của tháng đó (AW_STCK_002)."], vi="Chi tiết tồn kho"),
        F("14.5", "過去月のサマリー", ".bl-sumgrid", "area", detail=["現金回収差額・管理ロス 免責超過分・請求へ繰入（実績精算の合計）。「後払い分」とは書かない。", "Chênh lệch thu tiền mặt・vượt miễn trách của hao hụt quản lý・chuyển vào hóa đơn (tổng đối soát thực tế). Không ghi 「後払い分」."], demo_ok=[H_WORD + "。過去月は確定したときの写しから出す（H-A14）", "Code có từ 「後払い」「前請求」 (bài tập H-A1). Theo sổ quyết định F và 運営E Q-E3, ghi là 「実績精算」「固定額」. Tháng đã qua hiển thị từ bản sao lúc chốt (H-A14)"], vi="Tổng hợp tháng đã qua")],
       "/ops/billing/actuals/CU00643?m=2026-09"),
    ST("029", "AW_ACTL_002", ["参照のみ（CS・確定のボタンなし）", "Chỉ xem (CS・không có nút chốt)"], ["CS（Ad00002）で詳細を開いたとき。確定・解除・内訳の確定・残りをまとめて確定のボタンを出さない。見るだけで、編集のボタンもない。物流（Ad00011）も同じ（実績精算は R・仮置き）。", "Khi mở chi tiết bằng CS (Ad00002). Không hiển thị nút chốt, hủy chốt, chốt khoản, chốt phần còn lại. Chỉ xem, cũng không có nút sửa. Logistics (Ad00011) cũng giống vậy (đối soát thực tế là R・tạm đặt)."],
       [F("15", "参照のみの詳細", ".es-pagehead", "area", detail=["ヘッダーにボタンを出さない（実績精算の確定の権限がない役割）。内訳の「確定」「解除」の列も出さない。表示はフル権限と同じ。物流も同じ（R）。", "Không hiển thị nút ở header (vai trò không có quyền chốt đối soát thực tế). Cột 「確定」「解除」 của khoản cũng không hiển thị. Hiển thị giống quyền đầy đủ. Logistics cũng giống vậy (R)."], vi="Chi tiết chỉ xem")],
       "/ops/billing/actuals/CU00643", login="Ad00002"),
    ST("030", "AW_ACTL_002", ["見つかりません", "Không tìm thấy"], ["存在しない拠点 ID（/ops/billing/actuals/CU99999）を開いたとき。", "Khi mở ID chi nhánh không tồn tại (/ops/billing/actuals/CU99999)."],
       [F("16", "見つからないメッセージ", ".es-inline--warning", "label", "show", err=["E100"],
          detail=["E100（{対象}＝拠点・{ID}）を帯で出し、一覧へのリンクを置く。", "Hiển thị E100 ({対象} = chi nhánh・{ID}) bằng dải và đặt link về danh sách."],
          demo_ok=["コードは「拠点が見つかりません。」だけで ID を含まない（宿題）。E100 に揃える", "Code chỉ ghi 「拠点が見つかりません。」 và không có ID (bài tập). Thống nhất theo E100"], vi="Thông báo không tìm thấy")],
       "/ops/billing/actuals/CU99999"),
    ST("031", "AW_ACTL_002", ["年払いの拠点（実績精算は毎月）", "Chi nhánh trả theo năm (đối soát thực tế hằng tháng)"], ["年払いの拠点 CU00671。固定額は年に1回だが、実績精算は毎月ある（請求ルール 4-7）。画面は月ごとの実績精算で、ほかの拠点と同じ。", "Chi nhánh trả theo năm CU00671. Số tiền cố định 1 năm 1 lần nhưng đối soát thực tế có hằng tháng (請求ルール 4-7). Màn hình là đối soát thực tế theo tháng, giống các chi nhánh khác."],
       [F("17", "年払いの拠点", ".bl-meta", "area", detail=["実績精算は毎月確定する。年払いかどうかで画面は変わらない（固定額は請求の確定・請求書で扱う）。", "Đối soát thực tế chốt hằng tháng. Màn hình không đổi dù trả theo năm hay không (số tiền cố định xử lý ở 請求の確定・請求書)."], vi="Chi nhánh trả theo năm")],
       "/ops/billing/actuals/CU00671"),
    ST("035", "AW_ACTL_002", ["惣菜買取の拠点（買取の行・管理ロスなし）", "Chi nhánh mua đứt món ăn (dòng mua đứt・không hao hụt quản lý)"], ["惣菜買取の拠点 CU01903。「買取（納品数×単価）」の行を出し、管理ロス・差分率・事務手数料は出さない。" + NOT_SHOT + "見本の CU01903 は買取の計算がコードにない（宿題 H-A11・Q-A5）。実装後に撮り直す。", "Chi nhánh mua đứt món ăn CU01903. Hiển thị dòng 「買取（納品数×単価）」, không hiển thị hao hụt quản lý, tỷ lệ chênh lệch, phí xử lý. 【Không chụp được】CU01903 trong dữ liệu mẫu chưa có tính toán mua đứt trong code (bài tập H-A11・Q-A5). Chụp lại sau khi triển khai."],
       [D_INFO_BUY,
        F("9.7", "買取（納品数×単価）", "-", "label", cond=["惣菜買取の拠点だけ", "Chỉ chi nhánh mua đứt món ăn"], len="金額（円・税込／税抜）",
          detail=["Σ（納品数 ×（企業の価格 − 100円））。固定額（従業員負担分 100円 × 数量）と合わせて 納品数 × 企業の価格 になる（請求ルール 2-13）。管理ロス・差分率・廃棄率・事務手数料は出さない。確定する内容の管理ロスは「対象なし」。", "Σ (số lượng giao × (giá của công ty − 100 yên)). Cùng với số tiền cố định (phần nhân viên chịu 100 yên × số lượng) thành số lượng giao × giá của công ty (請求ルール 2-13). Không hiển thị hao hụt quản lý, tỷ lệ chênh lệch, tỷ lệ hủy, phí xử lý. Hao hụt quản lý của nội dung chốt là 「対象なし」."],
          demo_ok=["コードは納品数 × 企業の価格（全額）を返すだけで、運営の請求の画面は使わず通常拠点と同じに管理ロス・差分率・事務手数料を計算する（宿題 H-A11・Q-A5）", "Code chỉ trả về số lượng giao × giá của công ty (toàn bộ), không dùng màn hình hóa đơn của vận hành, tính hao hụt quản lý, tỷ lệ chênh lệch, phí xử lý giống chi nhánh thường (bài tập H-A11・Q-A5)"], vi="Mua đứt (số lượng giao × đơn giá)")],
       "/ops/billing/actuals/CU01903", nocap=True),
    ST("036", "AW_ACTL_002", ["解約手続き中・最終請求の月", "Đang làm thủ tục hủy hợp đồng・tháng hóa đơn cuối"], [NOT_SHOT + "締め月は運営が「締め月を進める」操作（AW_BILL 001 No.1.3。押せない間は非活性＋ツールチップ・エラーなし・確認ダイアログあり）で進めるため、見本では 2026-10 のまま。解約手続き中の CU01310（解約日 2026/11/08）の最終請求（2026-11）の状態は再現できない。最終請求書の残り在庫の買取・返却の行は請求の確定・請求書（AW_BILL）で扱う（台帳 L・受付簿 No.167）。", "【Không chụp được】Vì tháng chốt sổ do vận hành tiến lên bằng thao tác 「締め月を進める」 (AW_BILL 001 No.1.3. Khi chưa nhấn được thì vô hiệu hóa + tooltip, không báo lỗi, có hộp thoại xác nhận) nên dữ liệu mẫu vẫn là 2026-10. Không tái hiện được trạng thái hóa đơn cuối (2026-11) của CU01310 đang làm thủ tục hủy (ngày hủy 2026/11/08). Dòng mua đứt・trả lại tồn kho còn lại của hóa đơn cuối xử lý ở 請求の確定・請求書 (AW_BILL) (sổ quyết định L・受付簿 No.167)."],
       [F("18", "最終請求の月の実績精算", ".bl-meta", "area", detail=["解約日を含む実績精算期間の締め月の実績精算。違約金・残り在庫の買取（計算在庫 × 販売単価）と同じ請求書に載る。返却を選んだ場合は買取の行も管理ロスも作らない。", "Đối soát thực tế của tháng chốt sổ của kỳ đối soát có chứa ngày hủy. Được ghi cùng hóa đơn với tiền phạt, mua đứt tồn kho còn lại (tồn kho tính toán × đơn giá bán). Nếu chọn trả lại thì không tạo dòng mua đứt và cũng không có hao hụt quản lý."], vi="Đối soát thực tế của tháng hóa đơn cuối")],
       "/ops/billing/actuals/CU01310", nocap=True),
]

# ================================================================ AW_ACTL_003 実績精算編集（台帳 F 2026-10-08「実績精算の編集画面（残す）」。中身は仮）
E_URL = "/ops/billing/actuals/CU00643/edit"
E_NOID = ["メッセージ ID は採番待ち。", "ID thông báo đang chờ đánh số."]
NS = "【撮影不可】コードの編集画面はまだこの形（手入力の行）になっていない。実装後に撮り直す。"
NS_VI = "【Không chụp được】Màn hình sửa của code chưa có dạng này (dòng nhập tay). Chụp lại sau khi thực hiện. "
H_EDIT3 = ["コードの編集画面は価格調整（選択欄と金額）と棚卸の申告のチェックだけで、手入力の行はない。台帳 F 2026-10-08 のとおり、手入力の行の追加・削除に作り替える", "Màn hình sửa của code chỉ có điều chỉnh giá (ô chọn và số tiền) và checkbox báo cáo kiểm kê, không có dòng nhập tay. Làm lại thành thêm・xóa dòng nhập tay theo sổ quyết định F 2026-10-08"]
MANUAL_ROW = lambda n: "手入力の行の" + n

A_HEAD = [
    F("1", "ヘッダー", ".es-pagehead", "area",
      detail=["パンくず・画面名＋子契約番号・操作ボタン（キャンセル／保存）。編集・新規登録の画面なので、見出し（キャンセル・保存）は画面の上に固定する（P-FORM）。", "Breadcrumb, tên màn hình + số hợp đồng con, nút thao tác (キャンセル／保存). Vì là màn hình sửa nên cố định phần đầu (キャンセル・保存) ở trên cùng (P-FORM)."], vi="Header"),
    F("1.1", "パンくず", ".es-breadcrumb", "label", detail=["「請求 / 実績精算 / 実績精算編集」。2つ目のリンクは一覧へ戻る。", "「請求 / 実績精算 / 実績精算編集」. Link thứ 2 quay về danh sách."], vi="Breadcrumb"),
    F("1.2", "画面名", ".es-pagehead__title", "label",
      detail=["「実績精算編集」＋子契約番号（CP…-yyyymm）。URL は /ops/billing/actuals/{拠点ID}/edit。直せるのは確定する前の当月だけ（過去月・確定済み・請求済みは開けない・状態 047）。", "「実績精算編集」 + số hợp đồng con (CP…-yyyymm). URL là /ops/billing/actuals/{ID chi nhánh}/edit. Chỉ sửa được tháng hiện tại chưa chốt (tháng đã qua・đã chốt・đã xuất hóa đơn không mở được・trạng thái 047)."], vi="Tên màn hình"),
    F("1.3", "キャンセル", ".es-pagehead__actions button::キャンセル", "button", "click", err=["Q02"],
      detail=["入力を変えていれば「編集内容を破棄しますか？」（Q02）。「破棄」で詳細へ戻る。変えていなければそのまま詳細（AW_ACTL_002）へ戻る。ほかの画面への移動・ブラウザを閉じる／再読み込みでも同じ（P-FORM）。", "Nếu đã đổi nội dung nhập thì hiện 「編集内容を破棄しますか？」 (Q02). Nhấn 「破棄」 để quay về chi tiết. Nếu chưa đổi thì quay thẳng về chi tiết (AW_ACTL_002). Chuyển sang màn hình khác・đóng/tải lại trình duyệt cũng vậy (P-FORM)."], vi="Hủy"),
    F("1.4", "保存", ".es-pagehead__actions button::保存", "button", "click", err=["S01", "E01", "E02", "E12", "E14", "E13", "E04", "E184", "E54", "E31", "E32"], pattern="P-FORM",
      cond=[CAN_ACT + "", "%s" % CAN_EDIT_VI],
      detail=["直した金額と追加・削除した手入力の行をまとめてチェックして保存する（保存するまで効かない）。エラーは項目の下に出す（トーストにしない・P-FORM）。成功したら S01 のトーストを出して詳細（AW_ACTL_002）へ。確定済みになっていたら E184、請求済みなら E54（状態 047）。ほかの人が先に保存していたら E31、権限がなければ E32（状態 048）。押したら無効にする（二重送信を防ぐ）。保存した内容は変更履歴（6）に残り、当月へ繰入・請求書の ② に反映される。",
              "Kiểm tra cùng lúc rồi lưu các số tiền đã sửa và dòng nhập tay đã thêm・xóa (chỉ có hiệu lực sau khi lưu). Lỗi hiện dưới mục (không dùng toast・P-FORM). Thành công thì hiện toast S01 và về chi tiết (AW_ACTL_002). Nếu đã chốt thì E184, đã xuất hóa đơn thì E54 (trạng thái 047). Người khác lưu trước thì E31, không có quyền thì E32 (trạng thái 048). Khóa nút sau khi nhấn (chống gửi 2 lần). Nội dung đã lưu được ghi vào lịch sử thay đổi (6) và phản ánh vào 当月へ繰入・mục ② của hóa đơn."],
      open=["【要確認】保存の前に確認ダイアログを出すか（お金に効くため）。台帳に決定がなく、いまは P-FORM どおり確認なしで保存して S01。出す場合のメッセージ ID は採番待ち", "【Cần xác nhận】Có hiển thị hộp thoại xác nhận trước khi lưu hay không (vì ảnh hưởng đến tiền). Sổ quyết định chưa có quyết định, hiện lưu không cần xác nhận và hiện S01 theo P-FORM. Nếu hiển thị thì ID thông báo đang chờ đánh số"], ask="hong",
      demo_ok=[H_EDIT3[0] + "。保存ボタンはコードにある（ops は価格調整と棚卸の申告を保存）", H_EDIT3[1] + ". Nút lưu đã có trong code (lưu điều chỉnh giá và báo cáo kiểm kê)"], vi="Lưu"),
    F("2", "見出しの下の情報", ".bl-meta", "area",
      detail=["拠点名・法人名・対象期間・実績精算の状態（未確定）を詳細（AW_ACTL_002 の 2）と同じに出す。表示だけ。", "Hiển thị tên chi nhánh, tên công ty, kỳ đối tượng, trạng thái đối soát thực tế (chưa chốt) giống chi tiết (2 của AW_ACTL_002). Chỉ hiển thị."], vi="Thông tin dưới tiêu đề"),
    F("3", "説明の帯", ".es-inline", "area",
      detail=["「この画面で直せるのは、自動で計算した金額（管理ロス・現金回収差額・事務手数料）と ② の手入力の行の追加・削除です。価格調整は子契約の値です（ここでは直せません）。棚卸の代理入力は棚卸し（拠点在庫）の画面で行います。」を情報の帯で出す。" + E_NOID[0], "Hiển thị bằng dải thông tin 「この画面で直せるのは、自動で計算した金額（管理ロス・現金回収差額・事務手数料）と ② の手入力の行の追加・削除です。価格調整は子契約の値です（ここでは直せません）。棚卸の代理入力は棚卸し（拠点在庫）の画面で行います。」. " + E_NOID[1]],
      demo_ok=["コードにない文言（宿題）。メッセージ ID は採番待ち（新しい ID は作らない）", "Câu chữ chưa có trong code (bài tập). ID thông báo đang chờ đánh số (không tạo ID mới)"], vi="Dải giải thích"),
]
A_AUTO = [
    F("4", "自動で計算した金額", ".es-card::実績精算の確認", "table", pattern="P-FORM",
      detail=["管理ロス（免責超過）・現金回収差額・事務手数料を、詳細（AW_ACTL_002 の 5〜9）と同じ表で出し、行ごとに金額を直せる（台帳 F 2026-10-08）。直した行は「修正前 → 修正後」を並べて出し、理由は必須。確定する前の月だけ。価格調整差額は子契約の値のままで直せない（4.1）。惣菜買取・代替品の行を直せるかは台帳に決定がないので、いまは表示だけ。", "Hiển thị hao hụt quản lý (vượt miễn trách)・chênh lệch thu tiền mặt・phí xử lý bằng bảng giống chi tiết (5〜9 của AW_ACTL_002), sửa được số tiền theo từng dòng (sổ quyết định F 2026-10-08). Dòng đã sửa hiển thị cạnh nhau 「修正前 → 修正後」, lý do bắt buộc. Chỉ tháng chưa chốt. Chênh lệch điều chỉnh giá giữ giá trị của hợp đồng con, không sửa được (4.1). Dòng mua đứt món ăn・sản phẩm thay thế chưa có quyết định về việc sửa nên hiện chỉ hiển thị."],
      demo_ok=H_EDIT3, vi="Các khoản tự tính"),
    F("4.1", "価格調整（子契約の値）", ".es-field::価格調整", "label", len="文字列（なし／値上げ n円／値下げ n円／無料提供）",
      detail=["子契約の「価格調整の適用」の値を表示だけする。承認が要るので、この画面では直接変えない（選択欄・金額の欄は置かない）。", "Chỉ hiển thị giá trị 「価格調整の適用」 của hợp đồng con. Cần phê duyệt nên không đổi trực tiếp ở màn hình này (không đặt ô chọn・ô số tiền)."],
      demo_ok=[H_EDIT, "Code có ô chọn và ô số tiền để sửa trực tiếp điều chỉnh giá (không cần phê duyệt). Sổ quyết định F 2026-10-08: điều chỉnh giá giữ giá trị của hợp đồng con, màn hình sửa không sửa"], vi="Điều chỉnh giá (giá trị của hợp đồng con)"),
    F("4.2", "子契約の画面へ", "-", "link", "click",
      detail=["押すと子契約の詳細（AW_CONT_002・/ops/contracts/{子契約ID}）へ移る。価格調整を直すときはそこから申請・承認で行う（契約_05）。入力中の内容があるときは Q02 を出す。", "Nhấn để sang chi tiết hợp đồng con (AW_CONT_002・/ops/contracts/{ID hợp đồng con}). Khi muốn sửa điều chỉnh giá thì làm từ đó bằng đề nghị・phê duyệt (契約_05). Nếu có nội dung đang nhập thì hiện Q02."],
      err=["Q02"], demo_ok=["コードに子契約へのリンクがない（価格調整をこの画面の選択欄で変える）。リンクにする", "Code không có link sang hợp đồng con (đổi điều chỉnh giá bằng ô chọn của màn hình này). Làm thành link"], vi="Sang màn hình hợp đồng con"),
    F("4.3", "棚卸の報告（参照のみ）", ".es-field::棚卸", "label",
      detail=["「報告済（報告日／報告者）」か「未報告」を表示だけする。チェックボックスは置かない（棚卸の代理入力は棚卸し側 AW_STCK_005 の画面。台帳 F 2026-10-07）。", "Chỉ hiển thị 「報告済（報告日／報告者）」 hoặc 「未報告」. Không đặt checkbox (nhập hộ kiểm kê ở màn hình phía 棚卸し AW_STCK_005. Sổ quyết định F 2026-10-07)."],
      demo_ok=["コードは「棚卸の申告」のチェックボックスで報告済みにできる（日付・報告者は固定の文字）。チェックボックスをなくす（H-A2・H-A8）", "Code đánh dấu đã báo cáo bằng checkbox 「棚卸の申告」 (ngày và người báo cáo là chuỗi cố định). Bỏ checkbox (H-A2・H-A8)"], vi="Báo cáo kiểm kê (chỉ xem)"),
]
A_AUTO += [
    F("4.4", "修正後の金額", ".es-card input[name=fix]", "text", "input", req="条件付き", len="整数 −999,999,999〜999,999,999（円・税抜）", init=["自動計算の金額", "Số tiền tự tính"], ex=["12000", "Số tiền sau khi sửa (chưa thuế) (ví dụ: 12000)"], err=["E01", "E12", "E14"], pattern="P-FORM",
      cond=["管理ロス（免責超過）・現金回収差額・事務手数料の行ごと。直さない行は自動計算の金額のまま", "Theo từng dòng hao hụt quản lý (vượt miễn trách)・chênh lệch thu tiền mặt・phí xử lý. Dòng không sửa giữ số tiền tự tính"],
      valid=["整数のみ（小数・文字は E14）。範囲を超えたら E12。空にはできない（自動計算に戻すときは「元に戻す」）。全角の数字は半角に直す。右寄せ・単位 円 は欄の右。", "Chỉ số nguyên (số thập phân・chữ là E14). Vượt phạm vi là E12. Không để trống được (muốn quay về số tự tính thì dùng 「元に戻す」). Số toàn góc đổi sang nửa góc. Căn phải・đơn vị 円 bên phải ô."],
      detail=["直したい行の金額（税抜）を入れる。入れた行は「修正前（自動計算）→ 修正後」を並べて出し、当月へ繰入・請求書の ② は修正後の金額で出す。「元に戻す」で自動計算の金額に戻る（保存するまで効かない）。", "Nhập số tiền (chưa thuế) của dòng muốn sửa. Dòng đã nhập hiển thị cạnh nhau 「修正前（自動計算）→ 修正後」, 当月へ繰入 và mục ② của hóa đơn dùng số tiền sau khi sửa. 「元に戻す」 để quay về số tiền tự tính (chỉ có hiệu lực sau khi lưu)."],
      demo_ok=H_EDIT3, vi="Số tiền sau khi sửa"),
    F("4.5", "修正前の金額", ".es-card td.fix-before", "label", len="金額（円・税込／税抜）",
      detail=["自動計算の金額を表示だけする（直せない）。直した行では「修正前 → 修正後」の左側に出す。", "Chỉ hiển thị số tiền tự tính (không sửa được). Ở dòng đã sửa hiển thị bên trái của 「修正前 → 修正後」."], demo_ok=H_EDIT3, vi="Số tiền trước khi sửa"),
    F("4.6", "修正の理由", ".es-card input[name=fixReason]", "text", "input", req="条件付き", len="文字列 500", init=["空", "Trống"], ex=["現金の回収記録の誤りを訂正", "Lý do sửa (ví dụ: sửa sai sót ghi nhận thu tiền mặt)"], err=["E01", "E04", "E13"], pattern="P-FORM",
      cond=["金額を直した行は必須", "Bắt buộc ở dòng đã sửa số tiền"],
      valid=["必須（空は E01）。前後の空白を取る。500文字を超えたら E04。絵文字は不可（E13）。", "Bắt buộc (để trống là E01). Bỏ khoảng trắng đầu/cuối. Quá 500 ký tự là E04. Không dùng emoji (E13)."],
      detail=["直した理由。変更履歴（6）に「修正前 → 修正後」とあわせて残る。請求書には印字しない。", "Lý do sửa. Được lưu trong lịch sử thay đổi (6) cùng 「修正前 → 修正後」. Không in trên hóa đơn."], demo_ok=H_EDIT3, vi="Lý do sửa"),
]
A_ROWS = [
    F("5", "手入力の行", ".es-card::手入力", "table", pattern="P-FORM",
      detail=["② の手入力の行の表（品名・税率・金額（税抜）・理由・操作）。行の追加フォームは表の上に置く。追加した行・削除した行は「保存」を押すまで効かない（未保存の行は印をつけて表に出す）。確定する前の月だけ。請求書の ② に載り、当月へ繰入の金額に含まれる。税込・税抜は行の税率で出す。", "Bảng dòng nhập tay của ② (tên hàng・thuế suất・số tiền (chưa thuế)・lý do・thao tác). Form thêm dòng đặt phía trên bảng. Dòng đã thêm・đã xóa chỉ có hiệu lực khi nhấn 「保存」 (dòng chưa lưu hiển thị có dấu). Chỉ tháng chưa chốt. Được ghi ở mục ② của hóa đơn và tính vào số tiền 当月へ繰入. Gồm thuế・chưa thuế tính theo thuế suất của dòng."],
      demo_ok=["コードにない（台帳 F 2026-10-08 で新設）。コードの実績精算には手入力の行を持たせる場所がない", "Chưa có trong code (mới thêm theo sổ quyết định F 2026-10-08). Code của đối soát thực tế không có chỗ giữ dòng nhập tay"], vi="Dòng nhập tay"),
    F("5.1", "品名", ".es-card input[placeholder*=品名]", "text", "input", req="○", len="文字列 60", init=["空", "Trống"], ex=["臨時の追加配送", "Tên hàng in trên hóa đơn (ví dụ: giao thêm tạm thời)"], err=["E01", "E04", "E13"], pattern="P-FORM",
      valid=["必須（空は E01）。前後の空白を取る。60文字を超えたら E04。絵文字は不可（E13）。", "Bắt buộc (để trống là E01). Bỏ khoảng trắng đầu/cuối. Quá 60 ký tự là E04. Không dùng emoji (E13)."],
      detail=["請求書の ② の明細に印字する品名。", "Tên hàng in ở chi tiết mục ② của hóa đơn."], demo_ok=H_EDIT3, vi="Tên hàng"),
    F("5.2", "税率", ".es-card select::税率", "select", "select", req="○", len="選択（税率マスタ）", init=["10%", "10%"], ex=["8%", "8%"], err=["E02"], pattern="P-FORM",
      detail=["税率は共通のプルダウン（税率マスタ）。税込の金額はこの税率で出す。", "Thuế suất là pulldown chung (税率マスタ). Số tiền gồm thuế tính theo thuế suất này."], demo_ok=H_EDIT3, vi="Thuế suất"),
    F("5.3", "金額（税抜）", ".es-card .es-input--num input", "text", "input", req="○", len="整数 −999,999,999〜999,999,999（円）", init=["空", "Trống"], ex=["5000", "Số tiền chưa thuế (ví dụ: 5000)"], err=["E01", "E12", "E14"], pattern="P-FORM",
      valid=["必須（空は E01）。整数のみ（小数・文字は E14）。範囲を超えたら E12。全角の数字は半角に直す。右寄せ・単位 円 は欄の右。（税抜）と書く。", "Bắt buộc (để trống là E01). Chỉ số nguyên (số thập phân・chữ là E14). Vượt phạm vi là E12. Số toàn góc đổi sang nửa góc. Căn phải・đơn vị 円 bên phải ô. Ghi (税抜)."],
      detail=["手入力の行の金額（税抜）。", "Số tiền (chưa thuế) của dòng nhập tay."],
      open=["【要確認】マイナス（減額）を入れられるか。台帳に決定がない（請求の確定の ③ 調整は±を許している）。0 と範囲も仮", "【Cần xác nhận】Có nhập được số âm (giảm tiền) hay không. Sổ quyết định chưa có quyết định (③ điều chỉnh của chốt hóa đơn cho phép ±). Cả 0 và phạm vi cũng là tạm"], ask="hong",
      demo_ok=H_EDIT3, vi="Số tiền (chưa thuế)"),
    F("5.4", "理由", ".es-card input[placeholder*=理由]", "text", "input", req="○", len="文字列 500", init=["空", "Trống"], ex=["お客様の依頼で追加配送", "Lý do thêm dòng (ví dụ: giao thêm theo yêu cầu khách)"], err=["E01", "E04", "E13"], pattern="P-FORM",
      valid=["必須（空は E01）。前後の空白を取る。500文字を超えたら E04。絵文字は不可（E13）。", "Bắt buộc (để trống là E01). Bỏ khoảng trắng đầu/cuối. Quá 500 ký tự là E04. Không dùng emoji (E13)."],
      detail=["行を足す理由。変更履歴（6）に残り、請求書には印字しない。", "Lý do thêm dòng. Được lưu trong lịch sử thay đổi (6), không in trên hóa đơn."], demo_ok=H_EDIT3, vi="Lý do"),
    F("5.5", "行を追加", ".es-card .es-btn::追加", "button", "click", err=["E01", "E02", "E12", "E14", "E13", "E04"],
      detail=["入力をチェックして、表に未保存の行として加える。エラーがあれば項目の下に出し、加えない。追加後は入力欄を空に戻す（税率は初期値）。保存するまで効かない。", "Kiểm tra nội dung nhập rồi thêm vào bảng thành dòng chưa lưu. Có lỗi thì hiện dưới mục và không thêm. Sau khi thêm thì đưa ô nhập về trống (thuế suất về giá trị ban đầu). Chỉ có hiệu lực sau khi lưu."], demo_ok=H_EDIT3, vi="Thêm dòng"),
    F("5.6", "行を削除（×）", ".es-card tbody .es-btn--negative", "button", "click",
      cond=["手入力の行だけ。自動で計算した行（管理ロス・現金回収差額など）には出さない", "Chỉ dòng nhập tay. Không hiển thị ở các dòng tự tính (hao hụt quản lý・chênh lệch thu tiền mặt, v.v.)"],
      detail=["押すと、その行を外す（保存するまで効かない。確認ダイアログは出さない。誤って外したら「キャンセル」で破棄できる）。保存した行を外した場合は、保存で削除され、変更履歴に理由つきで残る。", "Nhấn để bỏ dòng đó (chỉ có hiệu lực sau khi lưu. Không hiển thị hộp thoại xác nhận. Nếu bỏ nhầm thì 「キャンセル」 để hủy). Nếu bỏ dòng đã lưu thì xóa khi lưu và được ghi vào lịch sử thay đổi kèm lý do."], demo_ok=H_EDIT3, vi="Xóa dòng (×)"),
    F("5.7", "0件の表示", "-", "label", "show", err=["I01"], detail=["手入力の行がないときは、表の中に I01 を1行で出す。", "Khi không có dòng nhập tay thì hiển thị I01 trong 1 dòng của bảng."], demo_ok=H_EDIT3, vi="Hiển thị 0 kết quả"),
]
A_HIST = [
    F("6", "変更履歴", ".es-card::変更履歴", "table", pattern="P-HIST", err=["I01"],
      detail=["金額の修正（修正前・修正後・理由）と手入力の行の追加・削除の履歴（日時・操作した人・操作・項目・変更前・変更後・理由）。表示だけ（直せない・消せない）。新しいものが上。ない（0件）ときは I01。", "Lịch sử sửa số tiền (trước・sau・lý do) và thêm・xóa dòng nhập tay (ngày giờ・người thao tác・thao tác・mục・trước・sau・lý do). Chỉ hiển thị (không sửa・xóa được). Mới nhất ở trên. Không có (0 dòng) thì I01."], demo_ok=H_EDIT3, vi="Lịch sử thay đổi"),
]
A_LOCK = [
    F("7", "編集できないときの表示", ".es-inline--negative", "label", err=["E184", "E54", "I03"],
      cond=["確定済み・請求済みの月（または過去月）の /edit を直接開いたとき", "Khi mở trực tiếp /edit của tháng đã chốt・đã xuất hóa đơn (hoặc tháng đã qua)"],
      detail=["入力欄と保存を出さず、詳細（AW_ACTL_002）と同じ見た目で、確定済みは E184（「実績精算が確定済みのため変更できません。確定を解除してから直してください。」）、請求済みは E54 を帯で出す。見るだけの画面は I03 の形（「{理由}（見るだけ）」）。確定を解除できるのは請求書に載せる前まで（請求済み以降は翌月の調整で相殺）。", "Không hiển thị ô nhập và nút lưu, hiện bằng dải E184 (「実績精算が確定済みのため変更できません。確定を解除してから直してください。」) nếu đã chốt, E54 nếu đã xuất hóa đơn, với giao diện giống chi tiết (AW_ACTL_002). Màn hình chỉ xem theo dạng I03 (「{理由}（見るだけ）」). Hủy chốt được đến trước khi vào hóa đơn (sau khi xuất hóa đơn thì bù trừ bằng điều chỉnh tháng sau)."],
      demo_ok=["コードは開けない月で黙って詳細を出す（宿題 H-A13）。E184／E54 の帯と I03 を出す", "Code lặng lẽ hiển thị chi tiết khi tháng không mở được (bài tập H-A13). Hiển thị dải E184／E54 và I03"], vi="Hiển thị khi không sửa được"),
    F("8", "権限がないときの表示", ".es-pagehead__actions", "area", err=["E32"],
      cond=["編集の権限がない役割が /edit を直接開いたとき（CS・営業・商品管理・商品開発・閲覧のみ・物流）", "Khi vai trò không có quyền sửa mở trực tiếp /edit (CS・kinh doanh・quản lý sản phẩm・phát triển sản phẩm・chỉ xem・logistics)"],
      detail=["保存ボタンを出さず、入力欄は見るだけ。それでも保存が送られたら E32（トースト）。一覧の鉛筆・詳細の「編集」も出さない。", "Không hiển thị nút lưu, các ô nhập chỉ xem. Nếu vẫn gửi lưu thì E32 (toast). Bút chì ở danh sách・nút 「編集」 ở chi tiết cũng không hiển thị."],
      open=["【要確認】編集の権限は台帳に決定がない。確定の権限（フル権限・経理）と同じにするのは仮置き", "【Cần xác nhận】Quyền sửa chưa có quyết định trong sổ quyết định. Đặt giống quyền chốt (quyền đầy đủ, kế toán) chỉ là tạm"], ask="hong",
      demo_ok=["コードは画面の権限 update を持つ役割（フル・経理・物流）に鉛筆を出す。物流は台帳 F 2026-10-08 で R のため外す", "Code hiển thị bút chì cho vai trò có quyền update của màn hình (đầy đủ・kế toán・logistics). Logistics là R theo sổ quyết định F 2026-10-08 nên bỏ"], vi="Hiển thị khi không có quyền"),
]
def _p(cat, *nos):
    d = {i["no"]: i for i in cat}
    return [d[n] for n in nos]
A_ALL = A_HEAD + A_AUTO + A_ROWS + A_HIST + A_LOCK
A_ADD = _p(A_ROWS, "5", "5.1", "5.2", "5.3", "5.4", "5.5")
V_EDIT = [
    ST("041", "AW_ACTL_003", ["初期表示（確定する前の月・手入力の行なし）", "Hiển thị ban đầu (tháng chưa chốt・chưa có dòng nhập tay)"],
       [NS + "フル権限（Ad00010）で未確定の拠点 CU00643 の編集画面を開いたとき。上から 説明の帯・自動で計算した金額（修正後の金額・理由の入力欄）・手入力の行（0件・I01）・変更履歴。価格調整・棚卸の報告は表示だけ。", NS_VI + "Khi mở màn hình sửa của chi nhánh chưa chốt CU00643 bằng quyền đầy đủ (Ad00010). Từ trên: dải giải thích・các khoản tự tính (ô nhập số tiền sau khi sửa・lý do)・dòng nhập tay (0 dòng・I01)・lịch sử thay đổi. Điều chỉnh giá・báo cáo kiểm kê chỉ hiển thị."],
       [i for i in A_ALL if i["no"] not in ("7", "8")], E_URL, nocap=True, full=True),
    ST("042", "AW_ACTL_003", ["手入力の行を追加", "Thêm dòng nhập tay"],
       [NS + "品名・税率・金額（税抜）・理由を入れて「追加」を押したとき。表に未保存の行が増え、入力欄は空に戻る。保存するまで効かない。", NS_VI + "Khi nhập tên hàng・thuế suất・số tiền (chưa thuế)・lý do rồi nhấn 「追加」. Bảng tăng 1 dòng chưa lưu, ô nhập về trống. Chỉ có hiệu lực sau khi lưu."],
       A_ADD[:1] + [A_ADD[5]] + A_ADD[1:5], E_URL, nocap=True),
    ST("043", "AW_ACTL_003", ["入力エラー（理由なし・金額なし・金額の範囲・税率）", "Lỗi nhập (thiếu lý do・thiếu số tiền・ngoài phạm vi số tiền・thuế suất)"],
       [NS + "何も入れずに「追加」または「保存」を押したとき。品名・金額・理由の空は E01、税率が未選択なら E02、金額が数字でなければ E14・範囲外は E12。エラーは項目の下に赤枠と文言（トーストにしない・P-FORM）。理由なしでは追加も保存もできない。", NS_VI + "Khi nhấn 「追加」 hoặc 「保存」 mà không nhập gì. Tên hàng・số tiền・lý do để trống là E01, chưa chọn thuế suất là E02, số tiền không phải số là E14・ngoài phạm vi là E12. Lỗi hiện viền đỏ và câu chữ dưới mục (không dùng toast・P-FORM). Không có lý do thì không thêm・lưu được."],
       [A_HEAD[4]] + _p(A_AUTO, "4.4", "4.6") + A_ADD[1:5], E_URL, nocap=True),
    ST("044", "AW_ACTL_003", ["手入力の行を削除", "Xóa dòng nhập tay"],
       [NS + "手入力の行の「×」を押したとき。確認ダイアログは出さず、その行が表から外れる（保存するまで効かない）。自動で計算した行には「×」がない。", NS_VI + "Khi nhấn 「×」 của dòng nhập tay. Không hiển thị hộp thoại xác nhận, dòng đó bị bỏ khỏi bảng (chỉ có hiệu lực sau khi lưu). Dòng tự tính không có 「×」."],
       _p(A_ROWS, "5", "5.6", "5.7"), E_URL, nocap=True),
    ST("045", "AW_ACTL_003", ["保存（S01）→ 詳細へ", "Lưu (S01) → về chi tiết"],
       [NS + "金額を直す（または手入力の行を追加する）→「保存」を押したとき。S01 のトーストを出し、詳細（AW_ACTL_002）に戻る。詳細の当月へ繰入・請求書の ② に反映され、変更履歴に1件残る。保存の前の確認ダイアログは未決（1.4 の要確認）。", NS_VI + "Khi sửa số tiền (hoặc thêm dòng nhập tay) rồi nhấn 「保存」. Hiện toast S01 và quay về chi tiết (AW_ACTL_002). Được phản ánh vào 当月へ繰入 của chi tiết・mục ② của hóa đơn, lịch sử thay đổi có thêm 1 mục. Hộp thoại xác nhận trước khi lưu chưa quyết (cần xác nhận ở 1.4)."],
       _p(A_HEAD, "1.4") + A_HIST, E_URL, nocap=True),
    ST("046", "AW_ACTL_003", ["編集内容を破棄しますか（Q02）", "Hủy nội dung đã sửa? (Q02)"],
       [NS + "手入力の行を追加したあとに「キャンセル」（またはほかの画面への移動）をしたとき。Q02（「編集中の内容は保存されません。編集内容を破棄してもよろしいですか？」・キャンセル／破棄）を出す。「破棄」で詳細へ戻る。", NS_VI + "Khi đã thêm dòng nhập tay rồi nhấn 「キャンセル」 (hoặc chuyển sang màn hình khác). Hiện Q02 (「編集中の内容は保存されません。編集内容を破棄してもよろしいですか？」・キャンセル／破棄). Nhấn 「破棄」 để về chi tiết."],
       _p(A_HEAD, "1.3"), E_URL, nocap=True),
    ST("047", "AW_ACTL_003", ["編集できない（確定済み：E184／請求済み：E54）", "Không sửa được (đã chốt: E184 / đã xuất hóa đơn: E54)"],
       [NS + "確定済み、または請求書に載っている月の拠点の /edit を直接開いたとき。入力欄と保存を出さず、詳細の見た目で E184（請求済みは E54）を帯で出す。確定を解除してから開き直す（請求済み以降は翌月の調整で相殺）。確定済みは状態 016 の操作で作れる。", NS_VI + "Khi mở trực tiếp /edit của chi nhánh đã chốt hoặc tháng đã vào hóa đơn. Không hiển thị ô nhập và nút lưu, hiện dải E184 (đã xuất hóa đơn là E54) với giao diện chi tiết. Hủy chốt rồi mở lại (sau khi xuất hóa đơn thì bù trừ bằng điều chỉnh tháng sau). Trạng thái đã chốt tạo được bằng thao tác của trạng thái 016."],
       A_LOCK[:1], "/ops/billing/actuals/CU00643/edit", nocap=True),
    ST("048", "AW_ACTL_003", ["権限なし（保存ボタンなし・E32）", "Không có quyền (không có nút lưu・E32)"],
       [NS + "編集の権限がない役割（CS・Ad00002）が /edit を直接開いたとき。保存ボタンを出さず、入力欄は見るだけ。保存が送られたら E32。編集の権限は仮置き（1.4・8 の要確認）。", NS_VI + "Khi vai trò không có quyền sửa (CS・Ad00002) mở trực tiếp /edit. Không hiển thị nút lưu, các ô nhập chỉ xem. Nếu gửi lưu thì E32. Quyền sửa là tạm đặt (cần xác nhận ở 1.4・8)."],
       A_LOCK[1:], E_URL, login="Ad00002", nocap=True),
    ST("049", "AW_ACTL_003", ["見つかりません（E100）", "Không tìm thấy (E100)"],
       [NS + "存在しない拠点 ID（/ops/billing/actuals/CU99999/edit）を開いたとき。詳細（状態 030）と同じく E100（{対象}＝拠点・{ID}）を帯で出し、一覧へのリンクを置く。", NS_VI + "Khi mở ID chi nhánh không tồn tại (/ops/billing/actuals/CU99999/edit). Giống chi tiết (trạng thái 030), hiển thị E100 ({対象} = chi nhánh・{ID}) bằng dải và đặt link về danh sách."],
       [F("9", "見つからないメッセージ", ".es-inline--warning", "label", "show", err=["E100"],
          detail=["E100（{対象}＝拠点・{ID}）を帯で出し、一覧へのリンクを置く。", "Hiển thị E100 ({対象} = chi nhánh・{ID}) bằng dải và đặt link về danh sách."],
          demo_ok=["コードは「拠点が見つかりません。」だけで ID を含まない（宿題）。E100 に揃える", "Code chỉ ghi 「拠点が見つかりません。」 và không có ID (bài tập). Thống nhất theo E100"], vi="Thông báo không tìm thấy")],
       "/ops/billing/actuals/CU99999/edit", nocap=True),
]

VIEWS = sorted(V_LIST + V_DETAIL + V_EDIT, key=lambda v: v["id"])
