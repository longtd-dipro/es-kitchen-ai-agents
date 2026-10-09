# -*- coding: utf-8 -*-
"""
画面設計書のデータ：運営管理者Web ＞ 配送管理 ＞ スケジュール（月・週・日・出荷データの移動・変更申請）AW_SCHD_001〜005
元：本物の Web（app/ops/delivery/schedule/page.tsx・_components/{MoveShipments,ChangeRequests,kit}.tsx・lib/ops/delivery/{fromDomain,constants}.ts・lib/domain/move.ts）
決定：docs/決定台帳.md（B 運営スケジュールの月表示／L 配送の日付の移動／F 運営D 配送スケジュール〈Q1〜Q10〉・配送の数値）、受付簿 No.290〜292、
      確認メモ_AW_運営D_配送.md「回答 (hong 2026-10-07)」。仕様：配送_08 §15-1〜15-5（納品サイクル設定_仕様書 §5.3）。
配送サイクル設定（AW_CYCL_001）は別ファイル（別担当）。この画面の右上のボタン「配送サイクル設定」からそこへ行く。
番号は状態（VIEWS）ごとに振る。月・週・日の検索条件・見出しは同じ形で、状態ごとに同じ番号の並びで書く。
コードと決定が違うところは、決定のとおりに書き、demo_ok に理由を書いた（コードの宿題）。
2026-10-08 HTML レビュー（hong S-1〜S-8）を反映：要確認のパネルは右端に固定・資材便は別タブ（AW_SCHD_006）・移動の小窓（選べない日は非活性／動かす配送を上部に／エラーは上部の赤い枠／確認は同じ小窓の第2ステップ）・予定の月の点線・メールは「メール一覧_配送」を参照・トーストは右上。
"""

TITLE = ["スケジュール（AW_SCHD）", "Lịch giao hàng (AW_SCHD)"]
SHEET = ["スケジュール", "Lịch giao hàng"]
BASENAME = "画面設計書_AW_SCHD_スケジュール"
IMG_PREFIX = "AW_SCHD"
OUT_DIR = "AW_SCHD_スケジュール"
CODE_NOTE = ["画面コードは規約 <Module(2)>_<Feature(4)>_<Seq(3)>。AW＝運営管理者Web、SCHD＝スケジュール。001＝月、002＝週、003＝日、004＝出荷データの移動（小窓）、005＝変更申請（小窓）、006＝スケジュール（資材タブ）。配送サイクル設定は AW_CYCL_001（別ファイル）",
             "Mã màn hình theo quy ước <Module(2)>_<Feature(4)>_<Seq(3)>. AW = Admin Web, SCHD = Lịch giao hàng. 001 = tháng, 002 = tuần, 003 = ngày, 004 = 出荷データの移動 (cửa sổ), 005 = 変更申請 (cửa sổ), 006 = Lịch giao hàng (thẻ 資材). Cài đặt chu kỳ giao hàng là AW_CYCL_001 (file riêng)"]
SITE = "ops"
SYSTEM = {"ja": "運営管理者Web", "vi": "Web quản trị vận hành"}
AUTHOR = "Claude（cloud）／確認：hong"
CREATED = "2026-10-07"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "ops", "loginId": "Ad00010"}   # フル権限（ops.full・ops.master・ops.sales）。見本：中村幸子
CODE_PATHS = ["app/ops/delivery/schedule/page.tsx", "app/ops/delivery/_components", "lib/ops/delivery", "lib/ops/areas/delivery.ts", "lib/domain/move.ts", "lib/domain/seed"]

SRC = "hong 回答 2026-10-07（確認メモ_AW_運営D_配送）"
SRC2 = "hong 回答 2026-10-07（確認メモ_AW_運営D_配送 Stage B）"
SRC5 = "hong 回答 2026-10-08（HTML レビュー）"

DECISIONS = [
    {"date": "2026-10-08", "target": "AW_SCHD_001 状態 002・No.5（要確認のパネル）",
     "q": ["要確認のパネルの表示位置と、「一覧へ」の行き先（S-1）", "Vị trí hiển thị panel 要確認 và nơi dẫn tới của 「一覧へ」 (S-1)"],
     "a": ["パネルは画面の右端に固定する（カレンダーに被せない）。「一覧へ」は、要確認の一覧（AW_RVEW_001）を、押した区分で絞って開く", "Panel cố định ở mép phải màn hình (không đè lên lịch). 「一覧へ」 mở danh sách 要確認 (AW_RVEW_001) đã lọc theo đúng phân loại vừa nhấn"],
     "src": SRC5},
    {"date": "2026-10-08", "target": "AW_SCHD_001 状態 003・No.4・凡例（予定の月の点線）",
     "q": ["予定の月で、点線の枠が付かない日があるのはなぜか（S-2）", "Vì sao ở tháng dự kiến có ngày không có viền nét đứt? (S-2)"],
     "a": ["付かない日があるのは不具合。予定（未確定）の点線の枠は、予定の月のサイクルの日すべてに付く", "Ngày không có viền là lỗi. Viền nét đứt của dự kiến (chưa xác định) gắn cho mọi ngày thuộc chu kỳ của tháng dự kiến"],
     "src": SRC5},
    {"date": "2026-10-08", "target": "AW_SCHD_006（資材タブ）・AW_SCHD_001〜003 検索条件「便種別」",
     "q": ["資材の配送もスケジュールに表示するか。資材の配送データは作れないはず（S-3）", "Chuyến 資材 có hiển thị trong lịch không? Dữ liệu giao hàng 資材 không tạo được (S-3)"],
     "a": ["資材便は食品の配送と別に表示する（資材はピッキングの流れ・スケジュールが食品と違うため）。スケジュールの別タブ「資材」（AW_SCHD_006）に出す。食品の件数には含めない・日付はここで動かさない（資材の注文の画面で変える）・予定の月には出ない。食品側の検索条件「便種別」の選択肢から資材便を外す", "Chuyến 資材 hiển thị riêng với thực phẩm (vì luồng picking・lịch của 資材 khác thực phẩm). Hiện ở thẻ riêng 「資材」 của lịch (AW_SCHD_006). Không tính vào số chuyến thực phẩm, không đổi ngày ở đây (đổi ở màn hình đặt 資材), không hiện ở tháng dự kiến. Bỏ chuyến 資材 khỏi lựa chọn 「便種別」 của điều kiện tìm kiếm phía thực phẩm"],
     "src": SRC5},
    {"date": "2026-10-08", "target": "AW_SCHD_004 No.1.1〜1.6・1.16・状態 015〜021（移動の小窓）",
     "q": ["移動の小窓：選べない日・動かす配送・エラー・確認の見せ方（S-4〜S-7）", "Cửa sổ di chuyển: cách hiện ngày không chọn được, chuyến sẽ di chuyển, lỗi và xác nhận (S-4〜S-7)"],
     "a": ["①移動先として選べない日（規則を満たさない日。例：動かす便が本発注の前なのに、すでに本発注を過ぎた日）は非活性にし、選べる日が分かるよう凡例と色を出す。台帳 L の規則は変えない ②小窓の上部に「動かす配送 n便」と配送Noの一覧を出す ③エラーは小窓の上部の赤い枠＋該当の欄の赤枠 ④確認（Q130・Q131）は同じ小窓の第2ステップ（小窓を重ねない。状態 020・021 を書き直した）", "① Ngày đích không chọn được (ngày không đúng quy tắc; ví dụ chuyến còn trước 本発注 mà ngày đích đã qua 本発注) bị vô hiệu hóa, có chú giải và màu để thấy ngày chọn được. Giữ nguyên quy tắc 台帳 L ② Phần trên cửa sổ hiện 「動かす配送 n便」 và danh sách 配送No ③ Lỗi hiện trong khung đỏ ở trên cửa sổ + viền đỏ ở ô liên quan ④ Xác nhận (Q130・Q131) là bước 2 trong cùng cửa sổ (không chồng cửa sổ; đã viết lại trạng thái 020・021)"],
     "src": SRC5},
    {"date": "2026-10-08", "target": "AW_SCHD_004 No.1.11・1.16（通知メール）",
     "q": ["メール送信の話もあったのに、メールのメニューには何もないが大丈夫か（S-8）", "Có nói về gửi email nhưng menu email không có gì, có ổn không? (S-8)"],
     "a": ["移動したときに送る通知メールの種類は「メール一覧_配送」（別の担当が作成中）を参照する。宛先・文面はこの設計書に書かない", "Loại email thông báo gửi khi di chuyển tham chiếu 「メール一覧_配送」 (người khác đang soạn). Không ghi người nhận・nội dung trong thiết kế này"],
     "src": SRC5},
    {"date": "2026-10-08", "target": "AW_SCHD 全体（トースト）",
     "q": ["トーストの位置", "Vị trí toast"],
     "a": ["画面の右上（全サイト・全画面で統一。台帳 F「全サイト共通：トーストの位置」）", "Góc phải trên màn hình (thống nhất toàn site và màn hình; 台帳 F)"],
     "src": SRC5},
    {"date": "2026-10-08", "target": "AW_SCHD_004 No.1.4（変更申請の表の並び）",
     "q": ["一括承認の表（処理待ちの変更申請）の並び順", "Thứ tự bảng 変更申請 chờ xử lý trong 一括承認"],
     "a": ["受付日の古い順（コードと同じ）", "Ngày tiếp nhận cũ nhất trước (giống code)"], "src": "hong 回答 2026-10-08（確認メモ_AW_運営D_配送 Stage B S9）"},
    {"date": "2026-10-07", "target": "AW_SCHD_002 No.4.10（休止）・AW_CYCL_001", "q": ["サイクルの持ち方（Q1）：月ごとの A1 か、最初の A1＋休止か", "Cách giữ chu kỳ (Q1): A1 theo từng tháng hay A1 đầu + kỳ nghỉ"],
     "a": ["C（両方）：A1 は月ごと（配送データを作る前の月だけ直せる）＋長い休みは休止。休止を足すと後ろの月は自動で動く。週表示には休止の期間を出す", "C (cả hai): A1 theo từng tháng (chỉ sửa được tháng chưa có データ配送) + 休止 cho kỳ nghỉ dài. Thêm 休止 thì các tháng sau tự dịch. Màn tuần hiện khoảng 休止"], "src": SRC + " Q1＝C・受付簿 No.290"},
    {"date": "2026-10-07", "target": "AW_SCHD_001 No.6（要確認）", "q": ["サイクル設定を保存したときの配送への効き方（Q3）", "Lưu cài đặt chu kỳ ảnh hưởng thế nào tới 配送 (Q3)"],
     "a": ["A：予定は作り直す。出荷待ち以降は動かさず「要確認」に出す（このスケジュールの要確認パネルと要確認の一覧で見る）", "A: 予定 tạo lại; 出荷待 trở đi không đụng, đưa vào 「要確認」 (xem ở panel 要確認 của lịch và danh sách 要確認)"], "src": SRC + " Q3＝A・受付簿 No.290"},
    {"date": "2026-10-07", "target": "AW_SCHD_005 全体・No.1.2", "q": ["「変更申請一括承認」を残すか（Q5）", "Có giữ 「変更申請一括承認」 không (Q5)"],
     "a": ["A：残す。判定が「問題なし」の申請だけ・第一希望日で承認", "A: Giữ. Chỉ đơn có 判定 「問題なし」, duyệt theo 第一希望日"], "src": SRC + " Q5＝A・受付簿 No.290"},
    {"date": "2026-10-07", "target": "AW_SCHD_001〜003 検索条件（No.3）", "q": ["月・週・日の検索条件の効き方（Q6）", "Điều kiện tìm kiếm áp dụng cho 月・週・日 thế nào (Q6)"],
     "a": ["A：3つ全部に効く。名前は「便種別」に統一・「割当状況」を足す・キーワードに配送No／予定ID", "A: Áp dụng cho cả 3 view. Thống nhất tên 「便種別」, thêm 「割当状況」, keyword gồm 配送No／予定ID"], "src": SRC + " Q6＝A・受付簿 No.291"},
    {"date": "2026-10-07", "target": "AW_SCHD_003 並び順・並べ替え", "q": ["日表示の並び順と並べ替え（Q7）", "Thứ tự và 並べ替え ở màn ngày (Q7)"],
     "a": ["C：既定＝仕様どおり（サイクル → 要対応 → 法人名・拠点名）＋「並べ替え」（配送No／拠点名／納品日／状態）", "C: Mặc định theo spec (サイクル → 要対応 → 法人名・拠点名) + 「並べ替え」 (配送No／拠点名／納品日／状態)"], "src": SRC + " Q7＝C・受付簿 No.291"},
    {"date": "2026-10-07", "target": "AW_SCHD_002・003 基準の切替", "q": ["日表示に基準「納品・配送」を持つか（Q8）", "Màn ngày có cơ sở 「納品・配送」 không (Q8)"],
     "a": ["A：確定の日・週は納品日基準も使える。予定は出荷だけなので基準の切替を出さない", "A: 日・週 đã xác định dùng được cơ sở 納品日. 予定 chỉ có 出荷 nên không hiện nút cơ sở"], "src": SRC + " Q8＝A・受付簿 No.291"},
    {"date": "2026-10-07", "target": "AW_SCHD_001〜003 CSV出力（No.1.3）", "q": ["月・週の CSV の列（Q9）", "Cột CSV của tháng・tuần (Q9)"],
     "a": ["B：月・週も 1行＝1配送データ（予定）。日表示と同じ列＋サイクル・枠。検索条件どおり", "B: 月・週 cũng 1 dòng = 1 配送データ (予定). Cùng cột với màn ngày + サイクル・枠. Theo điều kiện tìm kiếm"], "src": SRC + " Q9＝B・受付簿 No.291"},
    {"date": "2026-10-07", "target": "AW_SCHD_004 No.9（ドライバーの目安）", "q": ["ドライバー1日の配送件数の目安（O1）", "Mức tham khảo số chuyến giao/ngày của 1 tài xế (O1)"],
     "a": ["15件（移動したときの警告。止めない）", "15 chuyến (cảnh báo khi 移動, không chặn)"], "src": SRC + " O1・受付簿 No.292"},
    {"date": "2026-10-07", "target": "AW_SCHD_004 No.9（出荷しきい値）・AW_SCHD_001 No.5.8・凡例", "q": ["出荷件数のしきい値（O4）", "Ngưỡng số chuyến xuất kho (O4)"],
     "a": ["【仮】全倉庫300件、運営が直せる値（資材便は件数に含めない）。値の置き場所は設計書で決める（→ chk）", "[Tạm] 300 cho mọi kho, 運営 sửa được (chuyến 資材 không tính). Nơi lưu giá trị quyết ở thiết kế (→ chk)"], "src": SRC + " O4・受付簿 No.292"},
    {"date": "2026-10-07", "target": "AW_SCHD_004 No.10（出荷指示の再送）", "q": ["THOMAS は同じ指示番号の再送（rev＋1・数量0）を受け付けるか（O3）", "THOMAS có nhận gửi lại cùng số chỉ thị (rev+1, số lượng 0) không (O3)"],
     "a": ["受け付ける（hong 回答。THOMAS への書面の確認は未：配送_10 §18-1 No.2 は追う）", "Có nhận (hong trả lời. Chưa xác nhận bằng văn bản với THOMAS: theo dõi 配送_10 §18-1 No.2)"], "src": SRC + " O3・受付簿 No.292"},
    {"date": "2026-10-07", "target": "AW_SCHD_001〜003 CSV出力（予定の行）", "q": ["CSV の予定の行の列（S1）", "Cột của dòng 予定 trong CSV (S1)"],
     "a": ["配送No は空・状態は「予定」・ドライバーは空。サイクル・枠は画面のセルと同じ表記", "配送No để trống, 状態 「予定」, ドライバー để trống. サイクル・枠 ghi giống ô trên màn hình"], "src": SRC2 + " S1"},
    {"date": "2026-10-07", "target": "AW_SCHD_001〜003 検索条件「配送回数」", "q": ["配送回数の選択肢（S2）", "Lựa chọn 配送回数 (S2)"],
     "a": ["1回〜8回", "Từ 1回 đến 8回"], "src": SRC2 + " S2"},
    {"date": "2026-10-07", "target": "AW_SCHD_001〜003 検索条件「配送スタッフID・名」", "q": ["配送スタッフの入力の形（S3）", "Dạng nhập nhân viên giao hàng (S3)"],
     "a": ["部分一致の文字入力（空白は無視）", "Ô nhập khớp một phần (bỏ qua khoảng trắng)"], "src": SRC2 + " S3"},
    {"date": "2026-10-07", "target": "AW_SCHD_001 No.5.8・AW_SCHD_004 No.9（出荷しきい値の置き場所）", "q": ["出荷件数のしきい値の置き場所（S4）", "Nơi lưu ngưỡng số chuyến xuất kho (S4)"],
     "a": ["倉庫マスタの項目「出荷件数のしきい値」。既定300・倉庫マスタの編集で直す。中部倉庫・ES事務所も300", "Trường 「出荷件数のしきい値」 của 倉庫マスタ. Mặc định 300, sửa ở màn sửa 倉庫マスタ. Kho Chubu・ES事務所 cũng 300"], "src": SRC2 + " S4（O4 の【仮】を確定）"},
    {"date": "2026-10-07", "target": "AW_SCHD_004 理由", "q": ["移動の「理由」の入力の形（S5）", "Dạng nhập 「理由」 của 移動 (S5)"],
     "a": ["メモ（複数行・500字）", "Memo (nhiều dòng, 500 ký tự)"], "src": SRC2 + " S5"},
    {"date": "2026-10-07", "target": "AW_SCHD_004 法人に通知する", "q": ["「法人に通知する」を残すか（S6）", "Có giữ ô 「法人に通知する」 không (S6)"],
     "a": ["残す（初期ON）", "Giữ (mặc định bật)"], "src": SRC2 + " S6"},
    {"date": "2026-10-07", "target": "AW_SCHD_005 一括承認の確認", "q": ["一括承認の確認の見せ方（S7）", "Cách hiện xác nhận duyệt hàng loạt (S7)"],
     "a": ["共通の確認 Q11 の形（タイトル＋結果）にそろえる", "Thống nhất theo xác nhận chung Q11 (tiêu đề + kết quả)"], "src": SRC2 + " S7"},
    {"date": "2026-10-07", "target": "AW_SCHD_005 一括承認の完了", "q": ["一括承認の完了の見せ方（S8）", "Cách hiện hoàn tất duyệt hàng loạt (S8)"],
     "a": ["完了のモーダルはやめ、トースト S11 だけ。完了後は対象の行が消えるので、誤ってもう一度押すことはない", "Bỏ modal hoàn tất, chỉ dùng toast S11. Sau khi hoàn tất các dòng biến mất nên không nhấn nhầm lần nữa"], "src": SRC2 + " S8"},
    {"date": "2026-10-07", "target": "AW_SCHD 全体（ページ送り）", "q": ["一覧の表示件数", "Số dòng mỗi trang của danh sách"],
     "a": ["10／20／50／100（既定10）", "10 / 20 / 50 / 100 (mặc định 10)"], "src": SRC2 + " ページ送りの共通"},
]
CHANGES = []
HIDE_ALWAYS = []
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [
    {"code": "AW_SCHD_001", "ja": "スケジュール（月）", "vi": "Lịch giao hàng (tháng)"},
    {"code": "AW_SCHD_002", "ja": "スケジュール（週）", "vi": "Lịch giao hàng (tuần)"},
    {"code": "AW_SCHD_003", "ja": "スケジュール（日）", "vi": "Lịch giao hàng (ngày)"},
    {"code": "AW_SCHD_004", "ja": "出荷データの移動（小窓）", "vi": "Di chuyển dữ liệu xuất kho (cửa sổ)"},
    {"code": "AW_SCHD_005", "ja": "変更申請（未処理・小窓）", "vi": "Yêu cầu thay đổi chưa xử lý (cửa sổ)"},
    {"code": "AW_SCHD_006", "ja": "スケジュール（資材）", "vi": "Lịch giao hàng (資材)"},
]

# ---------------------------------------------------------------- 部品
import copy

SEP = "‖"
PAIR = ("detail", "init", "cond", "valid", "ex", "open", "demo_ok", "chk")


def T(s):
    a, b = s.split(SEP)
    return [a.strip(), b.strip()]


def I(name, sel, kind, trig="view", kids=None, **kw):
    """name・detail などは「日本語‖Tiếng Việt」の形で書く。len は「日本語」だけでもよい"""
    ja, vi = T(name)
    d = {"ja": ja, "vi": vi, "sel": sel, "kind": kind, "trig": trig}
    for k, v in kw.items():
        if v is None:
            continue
        if k in PAIR:
            v = T(v)
        elif k == "len" and SEP in v:
            v = T(v)
        d[k] = v
    if kids:
        d["kids"] = kids
    return d


def numbered(no, d, out):
    kids = d.pop("kids", None)
    d["no"] = no
    out.append(d)
    for i, k in enumerate(kids or [], 1):
        numbered("%s.%d" % (no, i), k, out)


def assemble(*groups):
    """groups の1つ1つが大項目（kids つき）。番号を 1, 2, 3… と振る"""
    out = []
    n = 0
    for g in groups:
        if g is None:
            continue
        n += 1
        numbered(str(n), copy.deepcopy(g), out)
    return out


H = (
    "const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));"
    "const clickText=(sel,t,root)=>{const e=[...(root||document).querySelectorAll(sel)].find(x=>(x.textContent||'').includes(t));if(e)e.click();return !!e;};"
    "const setSel=(label,val)=>{const s=document.querySelector('select[aria-label=\"'+label+'\"]');if(s){s.value=val;s.dispatchEvent(new Event('change',{bubbles:true}));}};"
    "const chk=(i)=>{const c=[...document.querySelectorAll('.week .col input[type=checkbox]:not([disabled]), .es-table tbody input[type=checkbox]:not([disabled])')][i||0];if(c)c.click();};"
    "const ready=async()=>{for(let i=0;i<60&&!document.querySelector('.week .col input[type=checkbox]:not([disabled]), .es-table tbody input[type=checkbox]:not([disabled])');i++)await sleep(100);};"
    "const ALL=()=>{const c=[...document.querySelectorAll('.week .col label.all input[type=checkbox]')];const x=c.find(e=>e.closest('.col').querySelectorAll('.list .it, label.it').length>1)||c[0];if(x)x.click();};"
)
D4 = '[data-m="MoveShipments"]'
D5 = '[data-m="ChangeRequests"]'
D5A = '[data-m="ChangeApprove"]'
D5R = '[data-m="ChangeResult"]'

# ---------------------------------------------------------------- 共通の見出し・検索
CSV_COLS = "日表示と同じ13列（配送No・拠点名・便種別・状態・温度帯・プラン名・出荷日・ピッキング倉庫・配送会社1・中継倉庫・配送会社2・ドライバー・配送日）＋サイクル・枠‖Cùng 13 cột với màn ngày (配送No, 拠点名, 便種別, 状態, 温度帯, プラン名, 出荷日, ピッキング倉庫, 配送会社1, 中継倉庫, 配送会社2, ドライバー, 配送日) + サイクル・枠"


def header(view):
    review = {
        "month_fixed": I("要確認（n件）‖要確認 (n mục)", ".es-pagehead__actions .hl::要確認", "button", "click",
                         detail="確定の月だけ、押すと画面の右端に固定した要確認のパネルを開閉する（カレンダーには被せない。AW_SCHD_001 の状態 002）。ほかの表示（週・日・予定の月）では、押すと要確認の一覧（AW_RVEW_001）へ行く。n は未対応の要確認の件数。‖Chỉ ở tháng đã xác định: nhấn thì đóng/mở panel 要確認 cố định ở mép phải màn hình (không đè lên lịch; trạng thái 002 của AW_SCHD_001). Ở các view khác (tuần, ngày, tháng dự kiến): nhấn thì sang danh sách 要確認 (AW_RVEW_001). n là số mục 要確認 chưa xử lý.",
                         demo_ok="コードのパネルはカレンダーの右上に重なって開く。画面の右端に固定し、カレンダーを被せない（hong 2026-10-08 S-1）‖Panel trong code mở đè lên góc phải trên của lịch. Phải cố định ở mép phải màn hình, không đè lên lịch (hong 2026-10-08 S-1)"),
        "other": I("要確認（n件）‖要確認 (n mục)", ".es-pagehead__actions .hl::要確認", "link", "click",
                   detail="押すと要確認の一覧（AW_RVEW_001）へ行く。n は未対応の要確認の件数。確定の月の表示だけは、同じ場所がパネルの開閉ボタンになる。‖Nhấn sang danh sách 要確認 (AW_RVEW_001). n là số mục 要確認 chưa xử lý. Chỉ ở view tháng đã xác định thì nút này là nút đóng/mở panel."),
    }[("month_fixed" if view == "month_fixed" else "other")]
    return I("ヘッダー‖Đầu trang", ".es-pagehead", "area", "view", kids=[
        review,
        I("変更申請（n件）‖変更申請 (n mục)", ".es-pagehead__actions .hl::変更申請", "button", "click",
          detail="押すと「変更申請（未処理）」の小窓（AW_SCHD_005）を開く。n は処理期限が来ていて、まだ処理していない変更申請の件数。‖Nhấn mở cửa sổ 「変更申請（未処理）」 (AW_SCHD_005). n là số yêu cầu đổi ngày đã đến hạn xử lý nhưng chưa xử lý.",
          demo_ok="コードの n は申請中・提案中の全部を数える（lib/ops/areas/delivery.ts の headCounts）。決定（配送_08 §15-1・決定 v2.2 #6）は「処理期限が来た未処理」だけ。数え方を直す‖Code đếm tất cả đơn 申請中・提案中 (headCounts). Quyết định (配送_08 §15-1, v2.2 #6): chỉ đơn đã đến hạn chưa xử lý. Sửa cách đếm"),
        I("CSV出力‖Xuất CSV", ".es-pagehead__actions .es-btn::CSV出力", "button", "click", pattern="P-CSV-OUT",
          detail="開いている表示（月・週・日）の、検索条件どおりの全件。1行＝1配送データ（予定のときは1予定）。列は" + CSV_COLS.split(SEP)[0] + "。閲覧できる役割すべてに出す。予定の行（配送データがまだない行）は、配送No を空、状態を「予定」、ドライバーを空にする。サイクル・枠の列は画面のセルと同じ表記（例：A1）にする（hong 2026-10-07 S1）。‖Toàn bộ dòng của view đang mở (tháng/tuần/ngày) theo điều kiện tìm kiếm. 1 dòng = 1 配送データ (1 予定 nếu là dự kiến). Cột: " + CSV_COLS.split(SEP)[1] + ". Hiện với mọi vai trò xem được. Dòng 予定 (chưa có 配送データ): 配送No để trống, 状態 là 「予定」, ドライバー để trống. Cột サイクル・枠 ghi giống ô trên màn hình (ví dụ: A1) (hong 2026-10-07 S1).",
          err=["S12"],
          demo_ok="コードの月は1日1行の集計（日付・サイクル・枠・出荷・配送・お知らせ）、週は1拠点1行、日は検索条件を使わず全件。決定（Q9＝B）に合わせて、月・週も1行＝1配送データ、検索条件どおりにする‖Code: tháng = 1 dòng/ngày (tổng hợp), tuần = 1 dòng/chi nhánh, ngày = không dùng điều kiện. Theo Q9 = B: tháng・tuần cũng 1 dòng = 1 配送データ, theo điều kiện tìm kiếm",
          ),
        I("配送サイクル設定‖Cài đặt chu kỳ giao hàng", ".es-pagehead__actions a::配送サイクル設定", "link", "click",
          detail="押すと配送サイクル設定（AW_CYCL_001）へ行く。この画面の下にある子の画面で、メニューには別の項目はない。開けるのは編集できる人だけ（フル権限・物流）。ほかの役割（経理・営業・CS・商品管理・商品開発）にはこのボタンを出さない（URL を直接開くと権限なし E32。AW_CYCL_001 No.13）。‖Nhấn sang Cài đặt chu kỳ giao hàng (AW_CYCL_001). Là màn con, menu không có mục riêng. Chỉ người sửa được mới mở được (フル権限, 物流). Vai trò khác (経理, 営業, CS, 商品管理, 商品開発) không hiện nút này (mở trực tiếp URL thì báo không có quyền E32; AW_CYCL_001 No.13).",
          cond="フル権限・物流だけに出す。ほかの役割には出さない（月・週・日のどの表示でも同じ）。‖Chỉ hiện với フル権限 và 物流. Vai trò khác không hiện (giống nhau ở cả view tháng, tuần, ngày).",
          demo_ok="コードは営業・CS などにもボタンを出す。フル権限・物流だけにする（台帳 F 運営D 配送サイクル設定 C7・権限表の行「配送サイクル設定」）‖Code hiện nút cả với 営業, CS… Phải chỉ hiện với フル権限・物流 (台帳 F, C7; dòng 「配送サイクル設定」 trong bảng quyền)"),
    ])


def switch_bar(view, nav, stage_ex=True):
    """月・週・日の切替・期間・段階"""
    return I("切替・期間の操作・段階‖Chuyển view, thao tác kỳ hạn, giai đoạn", ".bar", "area", "view", kids=[
        I("表示の切替（月・週・日）‖Chuyển view (tháng/tuần/ngày)", '.es-seg[aria-label="表示"]', "tab", "click",
          detail="月・週・日を切り替える。確定の表示どうし・予定の表示どうしで行き来する（確定の月から週へ行けば確定の週、予定の月から週へ行けば予定の週）。‖Chuyển giữa tháng/tuần/ngày. Chuyển trong cùng loại: từ tháng đã xác định sang tuần đã xác định, từ tháng dự kiến sang tuần dự kiến."),
    ] + nav + [
        I("段階の表示‖Thanh giai đoạn", ".es-stage", "area", "view",
          detail="サイクルの進み具合。左に「確定・参照中」か「予定・編集中」、サイクル名と説明、5つの段階（1 スケジュール設定／2 メニュー登録〜／3 メニュー公開・オーダー開始／4 オーダー締切／5 配送データ（確定））のどこにいるかを出す。表示だけ。‖Tiến độ của chu kỳ. Bên trái hiện 「確定・参照中」 hoặc 「予定・編集中」, tên chu kỳ và mô tả, và đang ở đâu trong 5 giai đoạn (1 設定 / 2 登録メニュー / 3 公開・bắt đầu order / 4 締切 order / 5 配送データ確定). Chỉ hiển thị."),
        I("種類（食品／資材）‖Loại (thực phẩm / 資材)", '.es-seg[aria-label="種類"]', "tab", "click",
          detail="食品の配送（この画面）と資材便の切替。資材はピッキングの流れ・スケジュールが食品と違うため、資材便は食品の配送と別に表示する。「資材」を押すとスケジュール（資材）の画面（AW_SCHD_006）へ行く。この画面の件数・バッジ・CSV に資材便は含めない。‖Chuyển giữa chuyến thực phẩm (màn này) và chuyến 資材. Vì luồng picking・lịch của 資材 khác thực phẩm nên chuyến 資材 hiển thị riêng. Nhấn 「資材」 sang màn Lịch giao hàng (資材) (AW_SCHD_006). Số chuyến・badge・CSV của màn này không gồm chuyến 資材.",
          demo_ok="コードにこのタブはない（資材便が食品と同じ表に混ざっている）。足す（hong 2026-10-08 S-3）‖Code chưa có thẻ này (chuyến 資材 lẫn trong cùng bảng với thực phẩm). Phải thêm (hong 2026-10-08 S-3)"),
    ])


NAV_MONTH = [
    I("表示する月‖Tháng đang hiển thị", ".dnav .es-input input", "label", "view",
      detail="yyyy-mm（例 2026-10）。入力はできない（前の月・次の月・今日で動かす）。‖yyyy-mm (ví dụ 2026-10). Không nhập được (di chuyển bằng nút tháng trước/sau/今日)."),
    I("前の月‖Tháng trước", '.dnav button[aria-label="前の月"]', "button", "click", err=["I130"],
      detail="前の月を開く。これより前の月が無い（サイクルの設定がない）ときは I130 をトーストで出して動かない。‖Mở tháng trước. Nếu không còn tháng trước (chưa có cài đặt chu kỳ) thì toast I130 và không di chuyển."),
    I("次の月‖Tháng sau", '.dnav button[aria-label="次の月"]', "button", "click", err=["I131"],
      detail="次の月を開く。これより先の月が無いときは I131 をトーストで出して動かない。サイクルの設定の範囲の外の月は「生成対象外」として扱う（配送_02 §4-2）。‖Mở tháng sau. Nếu không còn tháng sau thì toast I131 và không di chuyển. Tháng ngoài phạm vi cài đặt chu kỳ được coi là 「生成対象外」 (配送_02 §4-2).",
      demo_ok="コードは12月以降を空の通知にして、見本の2か月（10月・11月）だけ動く。決まりのとおり、設定のある月を実際の暦で行き来できるようにする‖Code chỉ có 2 tháng mẫu (10・11), từ 12 trở đi báo trống. Phải cho di chuyển theo lịch thật giữa các tháng có cài đặt"),
    I("今日‖Hôm nay", ".dnav .es-btn::今日", "button", "click",
      detail="今日（実際の今日）を含む月を開く。‖Mở tháng chứa ngày hôm nay (ngày thật).",
      demo_ok="コードは見本の固定の月（2026-10）へ飛ぶ。実際の今日にする（H10。デモのビルドだけの動き）‖Code nhảy tới tháng mẫu cố định (2026-10). Phải dùng ngày hôm nay thực (H10; chỉ là hành vi của bản demo)"),
]


def nav_week():
    return [
        I("週の開始日‖Ngày bắt đầu tuần", ".dnav .es-input input", "label", "view", detail="月曜日の日付（yyyy-mm-dd）。入力はできない。‖Ngày Thứ Hai (yyyy-mm-dd). Không nhập được."),
        I("週の終了日‖Ngày kết thúc tuần", ".dnav .es-field:nth-of-type(2) input", "label", "view", detail="日曜日の日付（yyyy-mm-dd）。入力はできない。‖Ngày Chủ Nhật (yyyy-mm-dd). Không nhập được."),
        I("前の週‖Tuần trước", '.dnav button[aria-label="前の週"]', "button", "click", err=["I130"],
          detail="前の週を開く。これより前の週が無いときは I130 をトーストで出して動かない。‖Mở tuần trước. Nếu không còn tuần trước thì toast I130 và không di chuyển.",
          demo_ok="コードは常にトーストだけで動かない（見本の2週だけ）。実際の暦で動くようにする‖Code luôn chỉ báo toast, không di chuyển (chỉ 2 tuần mẫu). Phải di chuyển theo lịch thật"),
        I("次の週‖Tuần sau", '.dnav button[aria-label="次の週"]', "button", "click", err=["I131"],
          detail="次の週を開く。これより先の週が無いときは I131 をトーストで出して動かない。‖Mở tuần sau. Nếu không còn tuần sau thì toast I131 và không di chuyển.",
          demo_ok="同上（見本の2週だけで動かない）‖Như trên (chỉ 2 tuần mẫu, không di chuyển)"),
        I("今日‖Hôm nay", ".dnav .es-btn::今日", "button", "click", detail="今日（実際の今日）を含む週を開く。‖Mở tuần chứa ngày hôm nay (ngày thật).",
          demo_ok="コードは見本の固定の週へ飛ぶ。実際の今日にする（H10）‖Code nhảy tới tuần mẫu cố định. Phải dùng ngày hôm nay thực (H10)"),
    ]


def nav_day():
    return [
        I("表示する日‖Ngày đang hiển thị", ".dnav .es-input input", "label", "view", detail="yyyy-mm-dd。入力はできない。‖yyyy-mm-dd. Không nhập được."),
        I("前の日‖Ngày trước", '.dnav button[aria-label="前の日"]', "button", "click", err=["I130"],
          detail="前の日を開く。これより前の日が無いときは I130 をトーストで出して動かない。‖Mở ngày trước. Nếu không còn ngày trước thì toast I130 và không di chuyển.",
          demo_ok="コードは常にトーストだけで動かない（見本の2日だけ）。実際の暦で動くようにする‖Code luôn chỉ báo toast, không di chuyển (chỉ 2 ngày mẫu). Phải di chuyển theo lịch thật"),
        I("次の日‖Ngày sau", '.dnav button[aria-label="次の日"]', "button", "click", err=["I131"],
          detail="次の日を開く。これより先の日が無いときは I131 をトーストで出して動かない。‖Mở ngày sau. Nếu không còn ngày sau thì toast I131 và không di chuyển.",
          demo_ok="同上（見本の2日だけで動かない）‖Như trên (chỉ 2 ngày mẫu, không di chuyển)"),
        I("今日‖Hôm nay", ".dnav .es-btn::今日", "button", "click", detail="今日（実際の今日）を開く。‖Mở ngày hôm nay (ngày thật).",
          demo_ok="コードは見本の固定の日へ飛ぶ。実際の今日にする（H10）‖Code nhảy tới ngày mẫu cố định. Phải dùng ngày hôm nay thực (H10)"),
    ]


def search(first_note, basis=None):
    """検索条件（月・週・日で同じ。basis＝基準の切替を出すか：None なし／'week' 週（確定）／'day' 日（確定））"""
    kids = []
    if basis:
        kids.append(I("基準（出荷／納品・配送）‖Cơ sở (出荷 / 納品・配送)", '.es-search .es-seg[aria-label="基準"]', "tab", "click",
                      detail=("確定の週で、出荷日の列（出荷基準）か納品日の列（納品・配送基準）かを切り替える。出荷基準は各配送を出荷する日に並べ「着M/D」を付け、納品・配送基準は納品する日に並べ「出M/D」を付ける。初期は出荷。予定の週では出さない（予定は出荷だけ・hong 2026-10-07 Q8）。‖Ở tuần đã xác định: chuyển giữa cột ngày xuất (cơ sở 出荷) và cột ngày giao (cơ sở 納品・配送). Cơ sở 出荷 xếp theo ngày xuất kèm 「着M/D」, cơ sở 納品・配送 xếp theo ngày giao kèm 「出M/D」. Mặc định 出荷. Không hiện ở tuần dự kiến (予定 chỉ có 出荷; hong 2026-10-07 Q8).") if basis == "week" else
                      ("確定の日で、出荷日の配送（出荷基準）か納品日の配送（納品・配送基準）かを切り替える。納品・配送基準はその日に届ける配送を出し、ドライバー未設定の要対応を納品日で見る。初期は出荷。予定の日では出さない（予定は出荷だけ・hong 2026-10-07 Q8）。‖Ở ngày đã xác định: chuyển giữa các 配送 xuất trong ngày (cơ sở 出荷) và các 配送 giao trong ngày (cơ sở 納品・配送). Cơ sở 納品・配送 dùng để xem 要対応 (chưa gán tài xế) theo ngày giao. Mặc định 出荷. Không hiện ở ngày dự kiến (hong 2026-10-07 Q8)."),
                      demo_ok=("コードの週（確定）は動くが、週（予定）にも無効のボタンが出る。予定では出さない（Q8）‖Code ở tuần đã xác định chạy được, nhưng tuần dự kiến vẫn hiện nút vô hiệu. Phải ẩn ở 予定 (Q8)") if basis == "week" else
                      ("コードの日の基準ボタンは何もしない（出荷日だけ）。納品日基準を作り、予定では出さない（Q8）‖Nút cơ sở ở màn ngày của code không làm gì (chỉ ngày xuất). Phải làm cơ sở ngày giao và ẩn ở 予定 (Q8)")))
    kids += [
        I("キーワード（法人・拠点・契約・配送No・予定ID）‖Từ khóa (công ty, chi nhánh, hợp đồng, 配送No, 予定ID)", '.es-search input[placeholder^="法人ID"]', "text", "input", req="－", len="文字列 60",
          init="空‖Trống", ex="DL-261005-0021‖Mã 配送No (nhập một phần cũng được)",
          valid="部分一致。法人ID・名、拠点ID・名、契約ID、配送No・予定ID のどれにも合う。複製の枝番（DL-…-1）も対象。前後の空白を取り、全角の英数字・ハイフンは半角に直す。‖Khớp một phần. Khớp với ID/tên công ty, ID/tên chi nhánh, ID hợp đồng, 配送No・予定ID. Gồm cả số nhánh bản sao (DL-…-1). Bỏ khoảng trắng đầu/cuối, đổi chữ/số/gạch toàn góc sang nửa góc.",
          err=["E04"], demo_ok="コードの入力欄は「法人ID・名、拠点ID・名、契約ID」だけで配送No・予定IDで探せない。足す（Q6）。月では条件が効かない・週は拠点名だけ・日（確定）はキーワード・状態・便種別だけなので、3つの表示すべてに全条件を効かせる（Q6＝A。月は件数とバッジを条件で数え直す）‖Ô nhập trong code chỉ có 「法人ID・名、拠点ID・名、契約ID」, không tìm được theo 配送No・予定ID: phải thêm (Q6). Tháng không áp dụng điều kiện, tuần chỉ lọc tên chi nhánh, ngày (確定) chỉ lọc từ khóa/trạng thái/loại chuyến: phải áp dụng đủ điều kiện cho cả 3 view (Q6 = A; tháng đếm lại số chuyến và badge theo điều kiện)"),
        I("住所・郵便番号・電話番号‖Địa chỉ, mã bưu điện, số điện thoại", '.es-search input[placeholder^="住所"]', "text", "input", req="－", len="文字列 255",
          init="空‖Trống", ex="105-0011‖Mã bưu điện (nhập một phần cũng được)",
          valid="部分一致。配送先の住所・郵便番号・電話番号・担当者の電話番号に合う。‖Khớp một phần. Khớp với địa chỉ nơi giao, mã bưu điện, số điện thoại, số điện thoại người phụ trách."),
        I("コース‖Khóa học", '.es-search select[aria-label="コース"]', "select", "select", req="－", len="選択",
          init="未選択（先頭に項目名「コース」を出す）‖Chưa chọn (dòng đầu hiện tên mục 「コース」)", ex="ESライト（冷蔵庫）‖Chọn khóa học (ESスタンダード / ESライト（冷蔵庫） / ESライト（自販機）)",
          detail="コースで絞る（ESスタンダード／ESライト（冷蔵庫）／ESライト（自販機））。‖Lọc theo khóa học (ESスタンダード / ESライト（冷蔵庫） / ESライト（自販機))."),
        I("ステータス‖Trạng thái", '.es-search select[aria-label="ステータス"]', "select", "select", req="－", len="選択",
          init="未選択‖Chưa chọn", ex="出荷待‖Chọn trạng thái của 配送データ",
          detail="配送データの状態で絞る（予定／出荷待／出荷済／受取済／納品済／一部納品済／再配送待／確認中／中止／取消）。状態は配送データだけが持つので、選ぶと予定（まだ配送データがないもの）は結果に出さない。画面にその旨を書く（配送_08 §15-5）。‖Lọc theo trạng thái của 配送データ (予定/出荷待/出荷済/受取済/納品済/一部納品済/再配送待/確認中/中止/取消). Chỉ 配送データ có trạng thái nên khi chọn, 予定 (chưa có 配送データ) không hiện trong kết quả. Màn hình ghi chú điều này (配送_08 §15-5).",
          demo_ok="コードは日（確定）だけで効く。月・週・日すべてに効かせ、予定が出なくなる旨の注記を出す（Q6）‖Code chỉ có tác dụng ở ngày (確定). Phải áp dụng cho cả 月・週・日 và hiện ghi chú 予定 sẽ bị ẩn (Q6)"),
        I("自販機‖Máy bán hàng", '.es-search select[aria-label="自販機"]', "select", "select", req="－", len="選択",
          init="未選択‖Chưa chọn", ex="自販機あり‖Chọn có / không có máy bán hàng", detail="自販機の有無で絞る（自販機あり／自販機なし）。‖Lọc theo có/không có máy bán hàng (自販機あり / 自販機なし)."),
        I("配送パターン‖Mẫu giao hàng", '.es-search select[aria-label="配送パターン"]', "select", "select", req="－", len="選択",
          init="未選択‖Chưa chọn", ex="サイクル‖Chọn mẫu giao hàng (サイクル / 個別指定)",
          detail="納品日の決め方で絞る（サイクル／個別指定。都度配送は資材だけなので、資材タブで扱う）。名前は「個別指定」にそろえる（Q6。仕様の「スペシャル」は使わない）。‖Lọc theo cách quyết định ngày giao (サイクル / 個別指定; 都度配送 chỉ có ở 資材 nên xử lý ở thẻ 資材). Thống nhất tên 「個別指定」 (Q6; không dùng 「スペシャル」 của spec)."),
        I("便種別‖Loại chuyến", '.es-search select[aria-label="配送方法"]', "select", "select", req="－", len="選択",
          init="未選択‖Chưa chọn", ex="ES配送便‖Chọn loại chuyến (ES配送便 / COOL便)",
          detail="配送の便の種類で絞る（ES配送便／COOL便）。資材便は食品の配送と別に表示するので、ここには出さない（別タブ「資材」）。表の列の名前と同じ「便種別」にそろえる（Q6）。‖Lọc theo loại chuyến (ES配送便 / COOL便). Chuyến 資材 hiển thị riêng với thực phẩm nên không có ở đây (thẻ 「資材」). Thống nhất tên 「便種別」 giống tên cột trong bảng (Q6).",
          demo_ok="コードのこの欄の名前は「配送方法」（表の列は「便種別」）。「便種別」に直す（Q6）。選択肢から資材便を外す（別タブ「資材」）‖Tên ô này trong code là 「配送方法」 (cột bảng là 「便種別」). Sửa thành 「便種別」 (Q6); bỏ chuyến 資材 khỏi lựa chọn (thẻ 「資材」)"),
        I("配送回数‖Số lần giao hàng", '.es-search select[aria-label="配送回数"]', "select", "select", req="－", len="選択",
          init="未選択‖Chưa chọn", ex="2回‖Chọn số lần giao hàng trong tháng",
          detail="月の配送回数で絞る。選択肢は 1回〜8回（hong 2026-10-07 S2）。‖Lọc theo số lần giao hàng trong tháng. Lựa chọn: 1回〜8回 (hong 2026-10-07 S2).",
          demo_ok="コードの選択肢は 1回〜4回。1回〜8回に直す（S2）‖Lựa chọn trong code là 1回〜4回. Sửa thành 1回〜8回 (S2)"),
        I("ピッキング倉庫‖Kho picking", '.es-search select[aria-label="ピッキング倉庫"]', "select", "select", req="－", len="選択",
          init="未選択‖Chưa chọn", ex="関東倉庫 WH00001‖Chọn kho picking (tên kho + mã)",
          detail="ピッキングする倉庫で絞る。選んだ倉庫の稼働条件で、月の「休：出荷」も判定する。‖Lọc theo kho picking. 「休：出荷」 ở lịch tháng cũng được xác định theo điều kiện hoạt động của kho đã chọn.",
          demo_ok="コードの選択肢は関東・関西の2倉庫だけ。倉庫マスタ（関東・関西・中部）から出す（確認メモ H2）‖Lựa chọn trong code chỉ có 2 kho (Kanto, Kansai). Phải lấy từ 倉庫マスタ (Kanto, Kansai, Chubu) (ghi chú H2)"),
        I("委託配送会社‖Công ty vận chuyển ủy thác", '.es-search select[aria-label="委託配送会社"]', "select", "select", req="－", len="選択",
          init="未選択‖Chưa chọn", ex="ヤマト運輸‖Chọn công ty vận chuyển ủy thác", detail="委託配送会社（配送会社マスタ）で絞る。‖Lọc theo công ty vận chuyển ủy thác (master công ty vận chuyển)."),
        I("中継倉庫‖Kho trung chuyển", '.es-search select[aria-label="中継倉庫"]', "select", "select", req="－", len="選択",
          init="未選択‖Chưa chọn", ex="ヤマト 渋谷営業所 HU00123‖Chọn kho trung chuyển (tên + mã)", detail="中継先の倉庫で絞る。中継の有無は便種別でなくこの条件で見る。‖Lọc theo kho trung chuyển. Việc có trung chuyển hay không xem bằng điều kiện này, không phải loại chuyến."),
        I("送り状番号‖Số vận đơn", '.es-search input[placeholder="送り状番号"]', "text", "input", req="－", len="文字列 60",
          init="空‖Trống", ex="4560-1234-5678‖Số vận đơn (nhập một phần cũng được)",
          valid="部分一致。送り状番号は出荷後に結び付くため、出荷前の配送データは結果に出ない。‖Khớp một phần. Số vận đơn chỉ gắn sau khi xuất kho nên 配送データ trước khi xuất không hiện trong kết quả."),
        I("配送スタッフID・名‖ID・tên nhân viên giao hàng", '.es-search input[placeholder="配送スタッフID・名"]', "text", "input", req="－", len="文字列 60",
          init="空‖Trống", ex="小林‖Nhập ID hoặc tên nhân viên giao hàng (một phần cũng được)",
          detail="配送スタッフ（ドライバー）で絞る。ID または名前の一部を文字で入力する（部分一致。空白は無視する。hong 2026-10-07 S3）。割当状況で「未割当」を選んだときは使わない（無効にする）。‖Lọc theo nhân viên giao hàng (tài xế). Nhập một phần ID hoặc tên (khớp một phần, bỏ qua khoảng trắng; hong 2026-10-07 S3). Không dùng khi 割当状況 chọn 「未割当」 (vô hiệu hóa).",
          demo_ok="コードは3人から選ぶ選択欄。部分一致の文字入力に直す（S3）‖Code là ô chọn trong 3 người. Sửa thành ô nhập khớp một phần (S3)"),
        I("割当状況‖Tình trạng gán", "-", "select", "select", req="－", len="選択",
          init="未選択‖Chưa chọn", ex="未割当‖Chọn 割当済 (đã gán tài xế) hoặc 未割当 (chưa gán)",
          detail="ドライバーを割り当てたか（割当済／未割当）で絞る。割り当て前の配送データを倉庫・期間と組み合わせて探すための条件。配送データだけが持つので、選ぶと予定は結果に出さない（配送_08 §15-5）。‖Lọc theo đã gán tài xế hay chưa (割当済 / 未割当). Dùng để tìm 配送データ chưa gán kết hợp với kho/kỳ hạn. Chỉ 配送データ có nên khi chọn, 予定 không hiện trong kết quả (配送_08 §15-5).",
          demo_ok="コードに「割当状況」の欄がない。足す（Q6）‖Code chưa có ô 「割当状況」. Phải thêm (Q6)"),
        I("クリア‖Xóa điều kiện", ".es-search .es-btn::クリア", "button", "click", detail="条件をすべて空に戻して、一覧を最初の状態にする。‖Đưa mọi điều kiện về trống và hiển thị lại trạng thái ban đầu."),
        I("検索‖Tìm kiếm", ".es-search button[type=submit]", "button", "click", detail="条件を反映する。Enter でも同じ。入力中は反映しない。‖Áp dụng điều kiện. Nhấn Enter cũng được. Không áp dụng khi đang nhập."),
    ]
    if first_note:
        kids.append(I("条件の開閉‖Đóng/mở điều kiện", ".es-search__toggle", "button", "click", detail=first_note))
    return I("検索条件‖Điều kiện tìm kiếm", ".es-search", "area", "view", pattern="P-LIST", kids=kids,
             detail="月・週・日は同じ条件を使い、3つの表示すべてに効く（hong 2026-10-07 Q6＝A）。「検索」か Enter で反映（入力中は変えない）、クリアで戻す。一覧のページ送り・並べ替えは日表示（確定・予定）にだけある。‖Cả 3 view 月・週・日 dùng chung điều kiện và đều áp dụng (hong 2026-10-07 Q6 = A). Áp dụng khi nhấn 「検索」 hoặc Enter (không đổi khi đang nhập), クリア để quay lại. Phân trang và sắp xếp chỉ có ở màn ngày (確定・予定).",
             demo_ok="欄の幅（コードは選択肢が欄より長く切れる）：どの欄も幅の下限を160pxにする。選択欄は一番長い選択肢が切れない幅にする（例：中継倉庫「ヤマト 渋谷営業所 HU00123」は欄より82px長い→欄を広げる）。キーワード・送り状番号の欄は入力した文字が20字分以上見える幅にし（送り状番号は最大60字。コードは約15字分）、入りきらない分は欄にマウスを重ねるとツールチップで全文を出す。欄が1行に入らないときは欄を縮めず、次の行へ折り返す‖Độ rộng ô (code: lựa chọn dài hơn ô nên bị cắt): mọi ô có độ rộng tối thiểu 160px. Ô chọn rộng đủ để không cắt lựa chọn dài nhất (ví dụ kho trung chuyển 「ヤマト 渋谷営業所 HU00123」 dài hơn ô 82px → mở rộng ô). Ô từ khóa và số vận đơn rộng để thấy ít nhất 20 ký tự (số vận đơn tối đa 60 ký tự; code chỉ thấy khoảng 15 ký tự), phần không vừa hiện toàn bộ bằng tooltip khi rê chuột lên ô. Khi ô không vừa 1 dòng thì xuống dòng tiếp, không thu nhỏ ô.")


# ---------------------------------------------------------------- 月
CELL_KIDS = [
    I("日付・祝日名‖Ngày, tên ngày lễ", ".es-calcell__date", "label", "view",
      detail="日の数字。選択月以外の日は薄く出す。今日は印を付ける。祝日があれば右に名前を出す。‖Số ngày. Ngày ngoài tháng đang chọn hiển thị mờ. Hôm nay có dấu. Có ngày lễ thì hiện tên ở bên phải."),
    I("サイクル・枠‖Chu kỳ, ô A1〜D7", ".es-calcell__cycle", "label", "view",
      detail="サイクル名と枠のコード（A1〜D7）。A・B週は色を分ける。サイクルのない日は出さない。‖Tên chu kỳ và mã ô (A1〜D7). Tuần A・B tô màu khác nhau. Ngày không thuộc chu kỳ thì không hiện."),
    I("出荷件数‖Số chuyến xuất kho", ".es-calcell__line::出荷", "label", "view",
      detail="「出荷：n件」。予定の月は「予定 n件」。出荷できない日（倉庫の出荷不可）は「休：出荷」。しきい値（倉庫マスタの項目「出荷件数のしきい値」。既定300件、倉庫マスタの編集で直す。中部倉庫・ES事務所も300。資材便は含めない。hong 2026-10-07 S4）を超えたら赤字にしマスに赤い枠を付ける。‖「出荷：n件」. Tháng dự kiến: 「予定 n件」. Ngày kho không xuất được: 「休：出荷」. Vượt ngưỡng (trường 「出荷件数のしきい値」 của 倉庫マスタ; mặc định 300, sửa ở màn sửa 倉庫マスタ; kho Chubu・ES事務所 cũng 300; không tính chuyến 資材; hong 2026-10-07 S4) thì chữ đỏ và viền đỏ quanh ô.",
      demo_ok="コードは300を固定値で持ち、資材便も数える（fromDomain.ts・move.ts）。しきい値は倉庫マスタの項目「出荷件数のしきい値」にし（S4）、資材便は件数に含めない（H8）‖Code cố định 300 và đếm cả chuyến 資材. Phải làm thành giá trị sửa được theo kho và không tính chuyến 資材 (H8)"),
    I("配送件数‖Số chuyến giao hàng", ".es-calcell__line::配送", "label", "view",
      detail="「配送：n件」。予定の月は「予定 n件」。配送できない日（祝日など）は「休：配送」。‖「配送：n件」. Tháng dự kiến: 「予定 n件」. Ngày không giao được (ngày lễ...): 「休：配送」."),
    I("バッジ‖Badge", ".es-calcell__badges", "label", "view", err=[],
      detail="条件つきで出す。赤＝出荷が上限（300件）超過・トラブル／黄＝未割当（出荷待から）・変更申請／灰＝移動・変更・取消。1つのマスに2つまで（赤→黄→灰の順）、残りは「+N」（マウスを乗せると中身）。過ぎた日は赤だけ。（台帳 B 運営スケジュールの月表示）‖Hiện có điều kiện. Đỏ = vượt ngưỡng 300 / sự cố; vàng = chưa gán (từ 出荷待) / 変更申請; xám = 移動・変更・取消. Tối đa 2 badge mỗi ô (thứ tự đỏ→vàng→xám), phần còn lại là 「+N」 (rê chuột xem nội dung). Ngày đã qua chỉ hiện đỏ. (台帳 B)"),
]


def month_body(draft, panel):
    cal = I("カレンダー‖Lịch tháng", ".es-cal--tall", "area", "view",
            detail="月曜始まりの7列。出荷と配送の件数を1つのカレンダーに出す（04・05を分けない）。マスを押すと、その日を含む週の表示（AW_SCHD_002）へ行く（サイクルのない日は押せない）。予定の月は、予定の月のサイクルの日すべてに点線の枠を付け（付かない日はない）、凡例を出す。検索条件で件数・バッジを数え直す（Q6）。資材便はここに含めない（別タブ「資材」）。‖7 cột bắt đầu từ Thứ Hai. Số chuyến xuất và giao hiển thị trong 1 lịch chung (không tách 04・05). Nhấn vào ô thì sang view tuần chứa ngày đó (AW_SCHD_002); ngày không thuộc chu kỳ thì không nhấn được. Tháng dự kiến: mọi ngày thuộc chu kỳ của tháng dự kiến đều có viền nét đứt (không ngày nào thiếu) và có chú giải. Đếm lại số chuyến và badge theo điều kiện tìm kiếm (Q6). Không tính chuyến 資材 (ở thẻ riêng 「資材」).",
            demo_ok="コードのカレンダーには検索条件が効かない（Q6＝A に合わせて効かせる）。マスを押す先の週は見本の2週だけ。予定の月の点線の枠が付かない日がある（不具合。予定の月のサイクルの日すべてに付ける。hong 2026-10-08 S-2）‖Lịch trong code không áp dụng điều kiện tìm kiếm (phải áp dụng theo Q6 = A). Tuần được mở khi nhấn ô chỉ có 2 tuần mẫu. Viền nét đứt của tháng dự kiến bị thiếu ở một số ngày (lỗi; phải gắn cho mọi ngày thuộc chu kỳ của tháng dự kiến; hong 2026-10-08 S-2)",
            kids=[I("曜日の見出し‖Tiêu đề thứ", ".es-cal__wd", "label", "view", detail="月・火・水・木・金・土・日。‖月・火・水・木・金・土・日 (Thứ Hai … Chủ Nhật)."),
                  I("日付のマス‖Ô ngày", ".es-calcell", "area", "click", detail="1日分のマス。中身は下の項目。押すと週表示へ。‖Ô của 1 ngày. Nội dung gồm các mục bên dưới. Nhấn để sang view tuần.", kids=CELL_KIDS)])
    kids = [cal]
    return cal


def month_panel():
    return I("要確認のパネル‖Panel 要確認", ".drawer", "area", "view",
             detail="確定の月で「要確認（n件）」を押すと、画面の右端に固定して開く（カレンダーには被せず、パネルの幅の分だけカレンダーを狭める）。区分のまとまりごとの件数と一覧へのリンク。サイクル設定を保存して出荷待ち以降の日付が合わなくなった配送もここに出る（hong 2026-10-07 Q3）。‖Khi nhấn 「要確認（n件）」 ở tháng đã xác định, panel mở cố định ở mép phải màn hình (không đè lên lịch; lịch thu hẹp bằng bề rộng panel). Hiện số mục theo từng nhóm và liên kết sang danh sách. 配送 từ 出荷待 trở đi bị lệch ngày do lưu cài đặt chu kỳ cũng hiện ở đây (hong 2026-10-07 Q3).",
             demo_ok="コードのパネルはカレンダーの右上に重なる。右端に固定する（hong 2026-10-08 S-1）‖Panel trong code đè lên góc phải trên của lịch. Phải cố định ở mép phải (hong 2026-10-08 S-1)",
             kids=[I("見出し・件数‖Tiêu đề, số mục", ".drawer b", "label", "view", detail="「要確認　n件」。未対応の合計。‖「要確認　n件」. Tổng số mục chưa xử lý."),
                   I("閉じる‖Đóng", '.drawer button[aria-label="閉じる"]', "button", "click", detail="パネルを閉じる。‖Đóng panel."),
                   I("区分のまとまり‖Nhóm phân loại", ".drawer .grp", "label", "view", detail="トラブル・納品実績／日付・リードタイム／割当・変更申請／出荷指示・連携 の4つのまとまり。‖4 nhóm: トラブル・納品実績 / 日付・リードタイム / 割当・変更申請 / 出荷指示・連携."),
                   I("区分の行・一覧へ‖Dòng phân loại, sang danh sách", ".drawer .rv", "link", "click",
                     detail="区分名と件数。「一覧 ›」を押すと、要確認の一覧（AW_RVEW_001）を、押した区分で絞って開く。‖Tên phân loại và số mục. Nhấn 「一覧 ›」 mở danh sách 要確認 (AW_RVEW_001) đã lọc theo đúng phân loại vừa nhấn.",
                     demo_ok="コードのリンクが区分を渡して絞り込めているかを確かめ、絞れていなければ直す（hong 2026-10-08 S-1）‖Kiểm tra liên kết trong code có truyền phân loại để lọc không, nếu chưa thì sửa (hong 2026-10-08 S-1)"),
                   I("注記‖Ghi chú", ".drawer div::要確認は解消するまで残ります", "label", "view", detail="「要確認は解消するまで残ります。法人へは通知しません。」（配送_04 §8-6）。‖「要確認は解消するまで残ります。法人へは通知しません。」 (配送_04 §8-6)."),
                   ])


def month_legend():
    return I("凡例（予定の月だけ）‖Chú giải (chỉ tháng dự kiến)", ".legend", "area", "view",
             detail="予定（未確定）は点線（予定の月のサイクルの日すべて）、しきい値（300件）を超えた日は赤枠、確定の配送データは実線の枠。バッジの赤・黄・灰の意味。選択月以外は薄い色。確定の月では出さない。‖Dự kiến (chưa xác định) viền nét đứt (mọi ngày thuộc chu kỳ của tháng dự kiến), ngày vượt ngưỡng (300) viền đỏ, 配送データ đã xác định viền nét liền. Ý nghĩa badge đỏ・vàng・xám. Ngày ngoài tháng chọn màu nhạt. Không hiện ở tháng đã xác định.")


def month_items(draft=False, panel=False, toast=None):
    return assemble(
        header("month_draft" if draft else "month_fixed"),
        switch_bar("month", NAV_MONTH),
        search("月は上の2つの条件だけ出し、残りは開閉で出す（欄が2行以上に折り返すときだけ出る）。‖Ở tháng chỉ hiện 2 điều kiện đầu, phần còn lại mở bằng nút đóng/mở (chỉ hiện khi ô xuống từ 2 dòng trở lên)."),
        month_body(draft, panel),
        month_panel() if panel else None,
        month_legend() if draft else None,
        toast,
    )


def toast_item(detail, err):
    return I("トースト‖Toast", ".toast", "toast", "show", err=err, detail=detail)


# ---------------------------------------------------------------- 週
WEEK_COL = [
    I("曜日・日付‖Thứ, ngày", ".week .col .wd", "label", "view", detail="曜日と日の数字。今日の列は印を付ける。出荷も配送もできない日の列は薄くする。‖Thứ và số ngày. Cột hôm nay có dấu. Cột ngày không xuất cũng không giao được thì làm mờ."),
    I("サイクル・枠‖Chu kỳ, ô A1〜D7", ".week .col .cy", "label", "view", detail="サイクル名と枠のコード（A1〜D7）。‖Tên chu kỳ và mã ô (A1〜D7)."),
    I("件数・休み‖Số chuyến, ngày nghỉ", ".week .col .ln", "label", "view",
      detail="出荷基準は「出荷：n件」、納品・配送基準は「配送：n件」。予定の週は「出荷：予定 n件」。出荷（配送）できない日は「休：出荷」（「休：配送」）。‖Cơ sở 出荷: 「出荷：n件」; cơ sở 納品・配送: 「配送：n件」. Tuần dự kiến: 「出荷：予定 n件」. Ngày không xuất (giao) được: 「休：出荷」 (「休：配送」)."),
    I("全て選択‖Chọn tất cả", ".week .col label.all .es-check__box", "check", "check", req="－", len="チェック‖Checkbox",
      init="OFF‖Tắt", ex="ON‖Bật = chọn mọi 配送 di chuyển được của ngày đó",
      detail="その日に動かせる配送（出荷の前の予定・出荷待、資材便でなく、出荷日が明日以降）をすべて選ぶ。画面に出していない「ほか n件」も選ぶ（課題 2-4）。動かせる配送がない日は出ない。‖Chọn mọi 配送 di chuyển được trong ngày (予定・出荷待 trước khi xuất, không phải chuyến 資材, ngày xuất từ ngày mai). Cũng chọn cả các mục không hiển thị trong 「ほか n件」 (課題 2-4). Ngày không có 配送 di chuyển được thì không hiện."),
]


def week_item_kids(fixed, draft_pick):
    return [
        I("チェック‖Ô chọn", ".week .col label.it .es-check__box", "check", "check", req="－", len="チェック‖Checkbox", init="OFF‖Tắt", ex="ON‖Bật = chọn 配送 này để di chuyển",
          detail="動かせる配送だけ押せる（出荷の前・資材便でない・出荷日が明日以降）。押せない配送は無効。‖Chỉ nhấn được với 配送 di chuyển được (trước khi xuất, không phải chuyến 資材, ngày xuất từ ngày mai). Còn lại bị vô hiệu.",
          demo_ok="コードの週（確定）は動かせる配送だけにチェックを出し、日表示（確定）は出荷日の確認をしない。出荷日が明日以降のものだけ選べるよう、日表示にも同じ決まりを入れる（H13・台帳 L）‖Tuần (確定) của code chỉ hiện ô chọn cho 配送 di chuyển được, nhưng ngày (確定) không kiểm tra ngày xuất. Phải áp dụng cùng quy tắc (chỉ chọn được nếu ngày xuất từ ngày mai) (H13, 台帳 L)") if not fixed else
        I("チェック（確定の週）‖Ô chọn (tuần đã xác định)", ".week .col .list .es-check__box", "check", "check", req="－", len="チェック‖Checkbox", init="OFF‖Tắt", ex="ON‖Bật = chọn 配送 này để di chuyển",
          detail="動かせる配送の行だけにチェックを出す（出荷の前・資材便でない・出荷日が明日以降）。出さない配送はチェックなしで、押すと配送データ詳細へ行く。‖Chỉ hiện ô chọn ở dòng 配送 di chuyển được (trước khi xuất, không phải chuyến 資材, ngày xuất từ ngày mai). 配送 khác không có ô chọn, nhấn sẽ mở chi tiết 配送データ."),
        I("配送のタグ‖Thẻ 配送", ".week .col .it", "link", "click",
          detail="温度帯のタグ・拠点名・もう一方の日付（出荷基準は「着M/D」、納品・配送基準は「出M/D」）。押すと配送データ詳細（AW_DLVR_002）へ行く。マウスを乗せると変更の内容（拠点・出荷日→納品日・取消・子・変更・トラブル・未割当のタグ）。取消の配送は拠点名に取消線。確定後に変更したものは左に青い線、要対応（トラブル・ドライバー未割当）は黄色の背景。‖Tag nhóm nhiệt độ, tên chi nhánh, ngày còn lại (cơ sở 出荷: 「着M/D」, cơ sở 納品・配送: 「出M/D」). Nhấn mở chi tiết 配送データ (AW_DLVR_002). Rê chuột thấy nội dung thay đổi (chi nhánh, ngày xuất→giao, thẻ 取消/子/変更/トラブル/未割当). 配送 đã hủy có gạch ngang tên chi nhánh. Mục đã đổi sau khi xác định có vạch xanh bên trái, 要対応 (sự cố / chưa gán tài xế) có nền vàng.",
          demo_ok="コードの配送先リンクが見つからないときの代わりが固定の見本の配送（DL-261020-0021）になっている。配送がないものは出さない（H14）‖Khi không tìm thấy liên kết, code dùng 配送 mẫu cố định (DL-261020-0021). Phải không hiện mục không có 配送 (H14)"),
        I("ほか n件‖Còn n mục nữa", ".week .col .more", "label", "view", detail="1日に出せる数（確定は16・予定は12）を超えた分の件数。「全て選択」には含まれる。‖Số mục vượt quá số hiển thị tối đa mỗi ngày (đã xác định: 16, dự kiến: 12). Vẫn được tính trong 「全て選択」."),
    ]


def week_body(fixed):
    cols = list(WEEK_COL)
    if fixed:
        cols.insert(3, I("未割当のバッジ‖Badge chưa gán", ".week .col .hd .es-badge", "label", "view",
                         detail="納品・配送基準の週で、その日に届ける配送のうちドライバー未割当の件数（「未割当 n件」・黄）。‖Ở tuần cơ sở 納品・配送: số 配送 giao trong ngày chưa gán tài xế (「未割当 n件」, màu vàng)."))
    cols += week_item_kids(fixed, not fixed)
    cols.append(I("出荷不可日・休止のピル‖Pill ngày không xuất / kỳ nghỉ", "-", "label", "view",
                  detail="サイクルの期間・週コード、出荷不可日のピル（連続する日と倉庫をまとめて1行・マウスを乗せると「ピッキング日・納品日の両方を振り替えます」）、サイクル休止の期間を週の上に出す（配送_08 §15-2・§15-4。休止は hong 2026-10-07 Q1＝C）。‖Hiện phía trên tuần: kỳ hạn chu kỳ, mã tuần, pill ngày không xuất (gộp ngày liên tiếp và kho thành 1 dòng; rê chuột hiện 「ピッキング日・納品日の両方を振り替えます」), khoảng 休止 của chu kỳ (配送_08 §15-2・§15-4; 休止 theo hong 2026-10-07 Q1 = C).",
                  demo_ok="コードの週は「休：出荷」の列だけで、サイクルの期間・週コード・出荷不可日のピル・休止の期間を出していない（H7）。足す‖Tuần trong code chỉ có cột 「休：出荷」, chưa hiện kỳ hạn chu kỳ, mã tuần, pill ngày không xuất, khoảng 休止 (H7). Phải thêm"))
    return I("週の表‖Bảng tuần", ".week", "area", "view",
             detail=("7日の列（月〜日）。確定の週：チェックで配送を選び、選ぶと下に選択バーを出す。‖7 cột (T2 đến CN). Tuần đã xác định: chọn 配送 bằng ô chọn, khi chọn thì hiện thanh chọn ở dưới.") if fixed else
             ("7日の列（月〜日）。予定の週は編集モードで、出荷だけを出す（基準の切替はない）。選択バーを常に出す。‖7 cột (T2 đến CN). Tuần dự kiến ở chế độ chỉnh sửa, chỉ có 出荷 (không có nút đổi cơ sở). Thanh chọn luôn hiển thị."),
             kids=[I("日の列‖Cột ngày", ".week .col", "area", "view", detail="1日分の列。上から日付・サイクル・件数、全て選択、配送のタグ。‖Cột của 1 ngày. Từ trên xuống: ngày, chu kỳ, số chuyến, chọn tất cả, các thẻ 配送.", kids=cols)])


def week_legend():
    return I("凡例（確定の週）‖Chú giải (tuần đã xác định)", ".legend", "area", "view",
             detail="青い線＝確定後に変更したもの（分納・代替便・配送スタッフの変更など）／黄色の背景＝要対応（トラブル・ドライバー未割当）／取消線＝取消／タグを押すと配送データ詳細。予定の週では出さない。‖Vạch xanh = mục đã đổi sau khi xác định (giao từng phần, chuyến thay thế, đổi nhân viên giao hàng...) / nền vàng = 要対応 (sự cố, chưa gán tài xế) / gạch ngang = 取消 / nhấn thẻ để mở chi tiết 配送データ. Không hiện ở tuần dự kiến.")


def sel_bar(draft):
    kids = [
        I("選択件数‖Số mục đã chọn", ".es-selbar__count", "label", "view", detail="「n件 選択中」。‖「n件 選択中」."),
        I("選択を解除‖Bỏ chọn", ".es-selbar__clear", "button", "click", detail="選んだ配送をすべて外す。‖Bỏ chọn toàn bộ 配送 đã chọn."),
    ]
    if draft:
        kids.append(I("キャンセル‖Hủy", ".es-selbar__actions .es-btn::キャンセル", "button", "click",
                      detail="予定の編集をやめて、予定の月の表示（AW_SCHD_001）に戻る。選んだ内容は捨てる。‖Thoát chỉnh sửa dự kiến, quay lại view tháng dự kiến (AW_SCHD_001). Bỏ nội dung đã chọn.",
                      demo_ok="コードは確認なしで月へ戻る。選択だけで入力はないので Q02 は出さない（入力のない操作）‖Code quay lại tháng không hỏi. Chỉ là chọn, không có nhập liệu nên không hiện Q02"))
    kids.append(I("出荷データの移動‖Di chuyển dữ liệu xuất kho", ".es-selbar__actions .es-btn::出荷データの移動", "button", "click",
                  detail=("選んだ配送を別の日へ動かす小窓（AW_SCHD_004）を開く。選んでいないときは無効。‖Mở cửa sổ di chuyển 配送 đã chọn sang ngày khác (AW_SCHD_004). Vô hiệu khi chưa chọn mục nào.") if draft else
                  ("選んだ配送を別の日へ動かす小窓（AW_SCHD_004）を開く。‖Mở cửa sổ di chuyển 配送 đã chọn sang ngày khác (AW_SCHD_004)."),
                  cond="移動の権限（出荷・配送管理の更新。フル権限・営業・CS・商品管理・商品開発・物流）がある役割だけに出す。‖Chỉ hiện với vai trò có quyền di chuyển (cập nhật 出荷・配送管理: フル権限, 営業, CS, 商品管理, 商品開発, 物流)."))
    return I("選択バー‖Thanh chọn", ".es-selbar", "area", "view",
             detail=("確定の週：1件以上選ぶと画面の下に出る。‖Tuần đã xác định: hiện ở cuối màn hình khi chọn từ 1 mục.") if not draft else
             ("予定の週：常に画面の下に出る（編集モード）。‖Tuần dự kiến: luôn hiện ở cuối màn hình (chế độ chỉnh sửa)."), kids=kids)


def week_items(fixed=True, selected=False):
    return assemble(
        header("week"),
        switch_bar("week", nav_week()),
        search("週は上の3つ（基準・キーワード・住所など）だけ出し、残りは開閉で出す。‖Ở tuần chỉ hiện 3 ô đầu (cơ sở, từ khóa, địa chỉ...), phần còn lại mở bằng nút đóng/mở.", basis="week" if fixed else None),
        week_body(fixed),
        week_legend() if fixed else None,
        sel_bar(not fixed) if (selected or not fixed) else None,
    )


# ---------------------------------------------------------------- 日
DAY_HEAD = I("日の見出し・件数‖Tiêu đề ngày, số chuyến", ".dayh", "area", "view",
             detail="日付・曜日・サイクル・枠と、その日の件数（出荷 n件・しきい値 300件／要対応 n件〈ドライバー未設定・トラブル〉／変更 n件〈青い行＝確定後に変更・取消したもの〉）。予定の日は「出荷 予定 n件（しきい値 300件・残り m件）」「変更申請 n件」「移動・変更 n件」。しきい値の数は倉庫ごとの値（既定300・資材便は含めない）。‖Ngày, thứ, chu kỳ, ô và số chuyến trong ngày (出荷 n件, ngưỡng 300 / 要対応 n件 〈chưa gán tài xế・sự cố〉 / 変更 n件 〈dòng xanh = đã đổi hoặc hủy sau khi xác định〉). Ngày dự kiến: 「出荷 予定 n件（しきい値 300件・残り m件）」, 「変更申請 n件」, 「移動・変更 n件」. Ngưỡng theo từng kho (mặc định 300, không tính chuyến 資材).",
             demo_ok="コードはしきい値300を固定の文字で出し、資材便も数える（H8）。倉庫ごとの値・資材便を除く数え方にする‖Code in cố định ngưỡng 300 và đếm cả chuyến 資材 (H8). Phải dùng giá trị theo từng kho và không đếm chuyến 資材")


def day_fixed_table(selected):
    def th(no_ja, vi, sel, detail, **kw):
        return I(no_ja + "‖" + vi, ".es-table thead th::" + sel, "label", "view", detail=detail, **kw)
    cols = [
        I("全て選択‖Chọn tất cả", ".es-table thead .es-check__box", "check", "check", req="－", len="チェック‖Checkbox", init="OFF‖Tắt", ex="ON‖Bật = chọn mọi 配送 di chuyển được trong danh sách",
          detail="動かせる配送（予定・出荷待・資材便でない・出荷日が明日以降）をすべて選ぶ。動かせるものがないときは無効。‖Chọn mọi 配送 di chuyển được (予定・出荷待, không phải chuyến 資材, ngày xuất từ ngày mai). Vô hiệu khi không có mục nào di chuyển được.",
          demo_ok="コードは出荷日の確認をしていない。出荷日が明日以降のものだけにする（H13）‖Code không kiểm tra ngày xuất. Chỉ cho chọn nếu ngày xuất từ ngày mai (H13)"),
        I("行のチェック‖Ô chọn của dòng", ".es-table tbody .es-check__box", "check", "check", req="－", len="チェック‖Checkbox", init="OFF‖Tắt", ex="ON‖Bật = chọn 配送 này để di chuyển",
          detail="動かせる配送の行だけ押せる（状態が予定・出荷待）。出荷後の配送は無効。選んだ行は薄い色にする。‖Chỉ nhấn được ở dòng 配送 di chuyển được (trạng thái 予定・出荷待). 配送 đã xuất kho thì bị vô hiệu. Dòng đã chọn tô màu nhạt."),
        I("No‖No", ".es-table tbody td:nth-child(2)", "label", "view", detail="表の通し番号（ページをまたいで続く）。‖Số thứ tự trong bảng (liên tục qua các trang)."),
        I("配送No‖Mã chuyến (配送No)", ".es-table tbody td.es-mono a", "link", "click", detail="DL-YYMMDD-NNNN。押すと配送データ詳細（AW_DLVR_002）へ行く。‖DL-YYMMDD-NNNN. Nhấn mở chi tiết 配送データ (AW_DLVR_002)."),
        I("拠点名‖Tên chi nhánh", ".es-table tbody td.w", "label", "view",
          detail="拠点名。下に小さな字で、移動・子・取消の説明（例「移動：納品 10/12 → 10/14（移動ID・理由・確認した内容）」）と、要確認の注記（「要確認：トラブル未解決 n件」「要確認：ドライバー未設定」）を出す。‖Tên chi nhánh. Dòng chữ nhỏ bên dưới: mô tả 移動/子/取消 (ví dụ 「移動：納品 10/12 → 10/14（移動ID・理由・確認した内容）」) và ghi chú cần kiểm tra (「要確認：トラブル未解決 n件」, 「要確認：ドライバー未設定」)."),
        I("便種別‖Loại chuyến", ".es-table thead th::便種別", "label", "view", detail="ES配送便／COOL便（資材便は別タブ「資材」）。‖ES配送便 / COOL便 (chuyến 資材 ở thẻ 「資材」)."),
        I("状態‖Trạng thái", ".es-table thead th::状態", "label", "view",
          detail="配送データの状態のバッジ。出荷済・受取済＝青、納品済＝緑、再配送待・確認中＝黄、予定・中止・取消＝灰（台帳 F 運営D 出荷・配送管理 ⑥・P-STATUS-COLORS）。‖Badge trạng thái 配送データ. 出荷済・受取済 = xanh dương, 納品済 = xanh lá, 再配送待・確認中 = vàng, 予定・中止・取消 = xám (台帳 F 運営D 出荷・配送管理 ⑥, P-STATUS-COLORS).", pattern="P-STATUS-COLORS"),
        I("変更申請‖Yêu cầu đổi ngày", ".es-table thead th::変更申請", "label", "view", detail="お届け日の変更の状態（申請中・提案中・調整済・なし）。‖Trạng thái đổi ngày giao (申請中・提案中・調整済・なし)."),
        I("温度帯‖Nhóm nhiệt độ", ".es-table thead th::温度帯", "label", "view", detail="冷凍・冷蔵のタグ。‖Tag 冷凍 / 冷蔵."),
        I("プラン名‖Tên plan", ".es-table thead th::プラン名", "label", "view", detail="契約のプラン名。‖Tên plan của hợp đồng."),
        I("出荷日（出）‖Ngày xuất", ".es-table thead th::出荷日", "label", "view", detail="M/D。ピッキングして出荷する日。‖M/D. Ngày picking và xuất kho."),
        I("ピッキング倉庫‖Kho picking", ".es-table thead th::ピッキング倉庫", "label", "view", detail="ピッキングする倉庫の名前。‖Tên kho picking."),
        I("配送会社1‖Công ty vận chuyển 1", ".es-table thead th::配送会社1", "label", "view", detail="1次区間の配送会社。‖Công ty vận chuyển chặng 1."),
        I("中継倉庫‖Kho trung chuyển", ".es-table thead th::中継倉庫", "label", "view", detail="中継先の倉庫。中継がないときは「—」。‖Kho trung chuyển. Không có trung chuyển thì hiện 「—」."),
        I("配送会社2‖Công ty vận chuyển 2", ".es-table thead th::配送会社2", "label", "view", detail="2次区間の配送会社。ないときは「—」。‖Công ty vận chuyển chặng 2. Không có thì 「—」."),
        I("ドライバー‖Tài xế", ".es-table thead th::ドライバー", "label", "view", detail="区間ごとの担当（例「小林 翔（自社）」「1次 西村 拓也（みどり便）」）。割り当て前は赤字で「割当待ち」。運送会社の区間は割り当てない（「—（運送会社）」）。‖Người phụ trách từng chặng (ví dụ 「小林 翔（自社）」, 「1次 西村 拓也（みどり便）」). Chưa gán thì chữ đỏ 「割当待ち」. Chặng của công ty vận chuyển không gán (「—（運送会社）」)."),
        I("配送日（着）‖Ngày giao", ".es-table thead th::配送日", "label", "view", detail="M/D。お届けする日。‖M/D. Ngày giao hàng."),
    ]
    return I("配送データの表‖Bảng 配送データ", ".es-table-wrap", "table", "view", pattern="P-LIST", err=["I01"],
             detail="その日に出荷する配送データ（状態は問わない）。並びは既定＝サイクル → 要対応（変更申請 → ドライバー未設定）→ 法人名・拠点名（配送_08 §15-2）。並べ替えで配送No／拠点名／納品日／状態を選べる。取消の行は薄い字、確定後に変更した行は青い背景、要対応の行は黄色の背景。0件のときは I01。列の見え方：配送No・拠点名は左に固定し、横スクロールは表の中だけ（ページ全体は横に動かさない。17列で幅が1440pxを超えても同じ）。文字は折り返す（拠点名・ドライバーなど長い列は2行まで。超えた分は「…」にして、マウスを重ねるとツールチップで全文）。切れて読めない列を作らない。‖Các 配送データ xuất trong ngày (mọi trạng thái). Mặc định xếp: サイクル → 要対応 (変更申請 → chưa gán tài xế) → 法人名・拠点名 (配送_08 §15-2). Có thể sắp xếp theo 配送No／拠点名／納品日／状態. Dòng 取消 chữ nhạt, dòng đã đổi sau khi xác định nền xanh, dòng 要対応 nền vàng. 0 dòng thì hiện I01. Cách hiển thị cột: 配送No và 拠点名 cố định bên trái, cuộn ngang chỉ trong bảng (không cuộn ngang cả trang, kể cả khi bảng rộng hơn 1440px). Chữ xuống dòng (cột dài tối đa 2 dòng, phần dư thành 「…」, rê chuột lên hiện toàn bộ bằng tooltip). Không để cột bị cắt không đọc được.",
             demo_ok="コードの並びは配送Noの昇順で、並べ替えの欄がない。0件の文言は「条件に合うデータはありません」。既定の並び・並べ替え・I01 に直す（Q7＝C）。検索はキーワード・状態・便種別だけが効く（Q6で全条件に）‖Code xếp theo 配送No tăng dần, không có ô sắp xếp; câu 0 dòng là 「条件に合うデータはありません」. Sửa thành thứ tự mặc định, 並べ替え và I01 (Q7 = C). Tìm kiếm chỉ có từ khóa/trạng thái/loại chuyến (Q6: áp dụng đủ)",
             kids=cols)


def sort_item():
    return I("並べ替え‖Sắp xếp", "-", "select", "select", req="－", len="選択",
             init="既定の並び（サイクル → 要対応 → 法人名・拠点名）‖Thứ tự mặc định (サイクル → 要対応 → 法人名・拠点名)", ex="納品日‖Chọn mục sắp xếp (配送No / 拠点名 / 納品日 / 状態)",
             pattern="P-LIST",
             detail="並べる項目を選ぶ（配送No／拠点名／納品日／状態）。選ばないときは既定の並び（hong 2026-10-07 Q7＝C）。‖Chọn mục để sắp xếp (配送No / 拠点名 / 納品日 / 状態). Không chọn thì dùng thứ tự mặc định (hong 2026-10-07 Q7 = C).",
             demo_ok="コードに並べ替えの欄がない。足す（Q7）‖Code chưa có ô sắp xếp. Phải thêm (Q7)")


def pager():
    return I("ページ送り‖Phân trang", ".es-pagination", "area", "view", pattern="P-LIST",
             detail="「n件中 a–b件」・ページ番号・表示件数（10／20／50／100件。既定10）。‖「n件中 a–b件」, số trang, số dòng mỗi trang (10 / 20 / 50 / 100; mặc định 10).")


def day_plan_table():
    cols = [
        I("全て選択‖Chọn tất cả", ".es-table thead .es-check__box", "check", "check", req="－", len="チェック‖Checkbox", init="OFF‖Tắt", ex="ON‖Bật = chọn mọi 予定 trong danh sách",
          detail="その日の予定をすべて選ぶ。‖Chọn tất cả 予定 trong ngày."),
        I("行のチェック‖Ô chọn của dòng", ".es-table tbody .es-check__box", "check", "check", req="－", len="チェック‖Checkbox", init="OFF‖Tắt", ex="ON‖Bật = chọn 予定 này để di chuyển",
          detail="動かす予定を選ぶ。選んだ行は薄い色にする。‖Chọn 予定 cần di chuyển. Dòng đã chọn tô màu nhạt."),
        I("No‖No", ".es-table tbody td:nth-child(2)", "label", "view", detail="表の通し番号。‖Số thứ tự trong bảng."),
        I("予定（契約・枠）‖予定 (hợp đồng, ô)", ".es-table thead th::予定", "label", "view", detail="契約IDと枠（例 CT…・A3）。‖ID hợp đồng và ô (ví dụ CT…・A3)."),
        I("拠点名‖Tên chi nhánh", ".es-table tbody td.w", "label", "view", detail="拠点名。下に小さな字で移動・変更の説明（移動前の日付と理由）を出す。‖Tên chi nhánh. Dòng chữ nhỏ bên dưới ghi mô tả 移動/変更 (ngày cũ và lý do)."),
        I("便種別‖Loại chuyến", ".es-table thead th::便種別", "label", "view", detail="ES配送便／COOL便（資材便は別タブ「資材」）。‖ES配送便 / COOL便 (chuyến 資材 ở thẻ 「資材」)."),
        I("温度帯‖Nhóm nhiệt độ", ".es-table thead th::温度帯", "label", "view", detail="冷凍・冷蔵のタグ。‖Tag 冷凍 / 冷蔵."),
        I("出荷日（出）‖Ngày xuất", ".es-table thead th::出荷日", "label", "view", detail="M/D（曜日）。‖M/D (thứ)."),
        I("ピッキング倉庫‖Kho picking", ".es-table thead th::ピッキング倉庫", "label", "view", detail="ピッキングする倉庫。‖Kho picking."),
        I("配送会社1‖Công ty vận chuyển 1", ".es-table thead th::配送会社1", "label", "view", detail="1次区間の配送会社。‖Công ty vận chuyển chặng 1."),
        I("中継倉庫‖Kho trung chuyển", ".es-table thead th::中継倉庫", "label", "view", detail="中継先。ないときは「—」。‖Kho trung chuyển. Không có thì 「—」."),
        I("配送会社2‖Công ty vận chuyển 2", ".es-table thead th::配送会社2", "label", "view", detail="2次区間の配送会社。ないときは「—」。‖Công ty vận chuyển chặng 2. Không có thì 「—」."),
        I("変更申請‖Yêu cầu đổi ngày", ".es-table thead th::変更申請", "label", "view", detail="処理していない申請があれば「申請中 申請番号（→ 希望日）」。ないときは変更の状態。‖Có đơn chưa xử lý thì 「申請中 số đơn（→ ngày mong muốn）」. Không có thì hiện trạng thái đổi."),
        I("配送日（着）‖Ngày giao", ".es-table thead th::配送日", "label", "view", detail="M/D（曜日）。‖M/D (thứ)."),
    ]
    return I("予定の表‖Bảng 予定", ".es-table-wrap", "table", "view", pattern="P-LIST",
             detail="その日に出荷する予定（まだ配送データになっていないもの）。状態・ドライバーの列はない（予定は状態を持たない）。並びは既定の並び（サイクル → 要対応 → 法人名・拠点名）。移動・変更済みの行は青い背景。列の見え方：配送No・拠点名は左に固定し、横スクロールは表の中だけ（ページ全体は横に動かさない。17列で幅が1440pxを超えても同じ）。文字は折り返す（拠点名・ドライバーなど長い列は2行まで。超えた分は「…」にして、マウスを重ねるとツールチップで全文）。切れて読めない列を作らない。‖Các 予定 xuất trong ngày (chưa thành 配送データ). Không có cột trạng thái và tài xế (予定 không có trạng thái). Mặc định xếp: サイクル → 要対応 → 法人名・拠点名. Dòng đã di chuyển/đổi nền xanh. Cách hiển thị cột: 配送No và 拠点名 cố định bên trái, cuộn ngang chỉ trong bảng (không cuộn ngang cả trang, kể cả khi bảng rộng hơn 1440px). Chữ xuống dòng (cột dài tối đa 2 dòng, phần dư thành 「…」, rê chuột lên hiện toàn bộ bằng tooltip). Không để cột bị cắt không đọc được.",
             demo_ok="コードに並べ替えの欄がない（Q7）。0件のときの I01 の行がない‖Code chưa có ô sắp xếp (Q7). Chưa có dòng I01 khi 0 dòng", err=["I01"], kids=cols)


def day_legend():
    return I("凡例（予定の日）‖Chú giải (ngày dự kiến)", ".legend", "area", "view",
             detail="青い背景＝移動・変更済み（移動前の日付と理由を行に出す。変更履歴にも残る）／薄い色＝選択中。‖Nền xanh = đã di chuyển/đổi (hiện ngày cũ và lý do trong dòng; cũng lưu trong lịch sử thay đổi) / màu nhạt = đang chọn.")


def day_items(fixed=True, selected=False, empty=False):
    body = [DAY_HEAD, day_fixed_table(selected) if fixed else day_plan_table(), pager()]
    return assemble(
        header("day"),
        switch_bar("day", nav_day()),
        search("日は上の3つ（基準・キーワード・住所など）だけ出し、残りは開閉で出す。‖Ở màn ngày chỉ hiện 3 ô đầu (cơ sở, từ khóa, địa chỉ...), phần còn lại mở bằng nút đóng/mở.", basis="day" if fixed else None),
        DAY_HEAD,
        sort_item(),
        day_fixed_table(selected) if fixed else day_plan_table(),
        pager(),
        day_legend() if not fixed else None,
        sel_bar(not fixed) if (selected or not fixed) else None,
    )


# ---------------------------------------------------------------- 出荷データの移動（小窓）
def move_items(state):
    """state: first（本発注の前・移動先未選択）／picked／after／error／trouble／holiday／cross"""
    info = I("案内（本発注の前／後・まとめて動かせない）‖Hướng dẫn (trước/sau đặt hàng chính, không di chuyển gộp được)", D4 + " .es-inline", "label", "view",
             detail="動かす便の本発注の時期で3通り。本発注の前（青）：「複数の便をまとめて動かせます（同じサイクルの中）。同じ拠点・同じ日の冷凍・冷蔵は一緒に動きます。本発注：…まで」。本発注の後（黄）：「1便ずつ・理由が必要です。同じ半分（A↔B／C↔D）の中だけ。ほかは、トラブルの対応のときだけ」。複数の便を選んで本発注の後の便が入っているとき（赤）：「まとめて動かせません。…1便だけ選んでください」。‖3 trường hợp theo thời kỳ đặt hàng chính (本発注) của chuyến. Trước 本発注 (xanh): 「Có thể di chuyển gộp nhiều chuyến (trong cùng chu kỳ). Lạnh và đông của cùng chi nhánh, cùng ngày đi cùng nhau. 本発注: … trở về trước」. Sau 本発注 (vàng): 「Từng chuyến một, cần lý do. Chỉ trong cùng nửa (A↔B / C↔D). Khác thì chỉ khi xử lý sự cố」. Chọn nhiều chuyến mà có chuyến sau 本発注 (đỏ): 「Không di chuyển gộp được. … Hãy chọn 1 chuyến」.")
    cal_cell = I("日のマス‖Ô ngày", D4 + " .es-calcell", "area", "click",
                 detail="押すと、その日がお届け日になる。選べない日（凡例）は灰色で、押せない（非活性）。マウスを乗せると選べない理由を出す。赤い枠＝お届けしない日（選べるが確認が出る）、点線＝いまのお届け日、「本発注後」＝本発注の後の半分。マウスを乗せると日付・枠・休みの理由・出荷日（その日の出荷件数）も出る。‖Nhấn thì ngày đó thành ngày giao. Ngày không chọn được (xem chú giải) màu xám và không nhấn được (vô hiệu); rê chuột hiện lý do không chọn được. Viền đỏ = ngày không giao (chọn được nhưng sẽ có xác nhận); nét đứt = ngày giao hiện tại; 「本発注後」 = nửa chu kỳ sau 本発注. Rê chuột cũng hiện ngày, ô, lý do nghỉ, ngày xuất (số chuyến xuất ngày đó).",
                 demo_ok="コードは選べない日も押せて、押したあとにエラーになる。選べない日はマスを非活性にする（hong 2026-10-08 S-4）‖Code cho nhấn cả ngày không chọn được rồi mới báo lỗi. Phải vô hiệu hóa ô ngày không chọn được (hong 2026-10-08 S-4)")
    moving = I("動かす配送（n便）‖Chuyến sẽ di chuyển (n chuyến)", "-", "area", "view",
               detail="小窓の一番上に出す。見出し「動かす配送 n便」と、動かす配送の配送No（DL-…）の一覧。同じ拠点・同じ日の冷凍・冷蔵は一緒に動くので、その分も含めた便数 n と配送Noを出す（例「動かす配送 3便：DL-261016-0007・DL-261016-0008・DL-261016-0009」）。多いときは折り返し、見える範囲を超えたら「ほか m便」。選んだ画面に戻らなくても、どの配送を動かすのかをこの小窓の中で確かめられる。確認の第2ステップでもこの欄を残す。移動先を選ぶと、各配送の「現在 → 新」は下の表（No.1.14）に出る。‖Hiện ở trên cùng cửa sổ. Tiêu đề 「動かす配送 n便」 và danh sách 配送No (DL-…) của các chuyến sẽ di chuyển. Lạnh/đông của cùng chi nhánh, cùng ngày đi cùng nhau nên hiện số chuyến n gồm cả phần đó và 配送No (ví dụ 「動かす配送 3便：DL-261016-0007・DL-261016-0008・DL-261016-0009」). Nhiều thì xuống dòng, vượt phạm vi hiển thị thì 「ほか m便」. Không cần quay lại màn đã chọn vẫn kiểm tra được chuyến nào sẽ di chuyển ngay trong cửa sổ này. Bước 2 (xác nhận) vẫn giữ khối này. Khi chọn ngày đích, 「hiện tại → mới」 của từng chuyến hiện ở bảng bên dưới (No.1.14).",
               demo_ok="コードは「動かす配送」を小窓の下の表に出していて、場所が分かりにくい。上部の見出しと配送Noの一覧にする（hong 2026-10-08 S-5）‖Code hiện 「動かす配送」 ở bảng cuối cửa sổ nên khó thấy. Phải đặt ở phần đầu với tiêu đề và danh sách 配送No (hong 2026-10-08 S-5)")
    legend = I("凡例（選べる日・選べない日）‖Chú giải (ngày chọn được / không chọn được)", "-", "area", "view",
               detail="カレンダーの上に出す。選べる日＝白地・黒字／選べない日＝灰地・薄い字・押せない（非活性。マウスを乗せると理由）／お届けしない日（祝日・日曜・月曜）＝赤い枠（選べるが、確認の第2ステップが出る）／いまのお届け日＝点線／「本発注後」＝本発注の後の半分。選べない日は、規則を満たさない日：倉庫が出荷できない日・過ぎた日・出荷日が今日より前になる日／動かす便が本発注の前なのに、すでに本発注を過ぎた日／動かす便が本発注の後のとき、同じ半分（A↔B／C↔D）の外の日／別のサイクルの日（「トラブルの対応」がOFFのとき。ONにすると選べる日に変わる）。規則そのものは台帳 L のまま変えない（hong 2026-10-08）。‖Hiện phía trên lịch. Ngày chọn được = nền trắng, chữ đen / ngày không chọn được = nền xám, chữ nhạt, không nhấn được (vô hiệu; rê chuột hiện lý do) / ngày không giao (ngày lễ, Chủ Nhật, Thứ Hai) = viền đỏ (chọn được nhưng sẽ hiện bước 2 xác nhận) / ngày giao hiện tại = nét đứt / 「本発注後」 = nửa chu kỳ sau 本発注. Ngày không chọn được là ngày không đúng quy tắc: ngày kho không xuất được, ngày đã qua, ngày xuất rơi trước hôm nay / chuyến trước 本発注 mà ngày đích đã qua 本発注 / chuyến sau 本発注 mà ngày đích ngoài nửa cùng loại (A↔B / C↔D) / ngày thuộc chu kỳ khác (khi 「トラブルの対応」 tắt; bật thì thành chọn được). Bản thân quy tắc giữ nguyên theo 台帳 L (hong 2026-10-08).",
               demo_ok="コードに凡例はない。足す（hong 2026-10-08 S-4）‖Code chưa có chú giải. Phải thêm (hong 2026-10-08 S-4)")
    body = [
        I("お届け日‖Ngày giao", D4 + " .mdl-b .es-field input", "date", "input", req="○", len="日付（yyyy-mm-dd）",
          init="空（移動先を選ぶ前）‖Trống (trước khi chọn ngày đích)", ex="2026-11-18‖Ngày giao mới (yyyy-mm-dd)", err=["E02", "E162", "E163"],
          valid="日付の共通の部品、または下のカレンダーのマスで選ぶ。選べない日（上の凡例）はマスが非活性で押せないので、ふつうはエラーにならない。日付を直接入れたときだけ、選べない日は E163、本発注の決まりに合わない日は E162 を出し、この欄を赤い枠にする。選ぶ前は「移動先を選んでください」のエラーを出さない（確認ボタンが押せないだけ）。‖Chọn bằng ô ngày chung hoặc nhấn ô trên lịch bên dưới. Ngày không chọn được (xem chú giải trên) bị vô hiệu nên thường không gây lỗi. Chỉ khi nhập trực tiếp ngày thì ngày không chọn được báo E163, ngày không đúng quy tắc 本発注 báo E162 và ô này có viền đỏ. Trước khi chọn thì không hiện lỗi 「移動先を選んでください」 (chỉ là nút xác nhận chưa nhấn được)."),
        I("出荷日（新）‖Ngày xuất (mới)", D4 + " .mdl-b span::出荷日", "label", "view", cond="移動先を選んだあとだけ出る。‖Chỉ hiện sau khi chọn ngày đích.", detail="「出荷日 yyyy-mm-dd」。お届け日からリードタイム（冷凍2日・冷蔵1日）を引いた日。出荷日はリードタイムを保って一緒に動く。‖「出荷日 yyyy-mm-dd」. Bằng ngày giao trừ lead time (đông 2 ngày, lạnh 1 ngày). Ngày xuất di chuyển cùng, giữ nguyên lead time."),
        I("サイクルごとのカレンダー‖Lịch theo từng chu kỳ", D4 + " .es-cal--sm", "area", "view", detail="動かす便のサイクルと、移動先になるサイクルのカレンダー。名前は「{サイクル} サイクル」。‖Lịch của chu kỳ chứa chuyến cần di chuyển và chu kỳ đích. Tên 「{サイクル} サイクル」.", kids=[cal_cell]),
        I("理由‖Lý do", D4 + ' input[placeholder^="例）"]', "textarea", "input", req="条件付き", len=["文字列 500（複数行）", "Chuỗi 500 ký tự (nhiều dòng)"],
          init="空‖Trống", ex="倉庫の都合で前倒し‖Lý do (ví dụ: dời sớm vì lý do kho)", err=["E01"],
          cond="必須：本発注の後の便を動かすとき、またはトラブルの対応にチェックしたとき。それ以外は任意。‖Bắt buộc khi di chuyển chuyến sau 本発注 hoặc khi chọn 「トラブルの対応」. Còn lại tùy chọn.",
          valid="必須のときに空なら E01。移動の記録（変更履歴）に残る。‖Bắt buộc mà để trống thì E01. Được lưu vào bản ghi di chuyển (lịch sử thay đổi).",
          demo_ok="コードは1行の入力で桁数の制限なし。メモ（複数行・500字）に直す（S5）‖Code là ô 1 dòng, không giới hạn số ký tự. Sửa thành memo (nhiều dòng, 500 ký tự) (S5)"),
        I("トラブルの対応（別のサイクルへ）‖Xử lý sự cố (sang chu kỳ khác)", D4 + " .es-check::トラブルの対応", "check", "check", req="－", len="チェック‖Checkbox",
          init="OFF‖Tắt", ex="ON‖Bật = di chuyển để xử lý sự cố đã ghi nhận (cho phép sang chu kỳ khác)",
          detail="別のサイクル、または本発注の後の別の半分へ動かすのは、記録したトラブルの対応のときだけ。ONにすると「対応するトラブル」と理由が必須になる。OFF に戻すとトラブルの選択を空にする。‖Chỉ khi xử lý sự cố đã ghi nhận mới được di chuyển sang chu kỳ khác hoặc sang nửa khác sau 本発注. Bật thì 「対応するトラブル」 và lý do bắt buộc. Tắt lại thì xóa lựa chọn sự cố."),
        I("対応するトラブル‖Sự cố cần xử lý", D4 + ' select[aria-label="対応するトラブル"], ' + D4 + " .es-field select", "select", "select", req="条件付き", len="選択",
          init="未選択（「選んでください」）。記録がなければ「動かす便の拠点に記録したトラブルがありません」‖Chưa chọn (「選んでください」). Nếu không có bản ghi thì 「動かす便の拠点に記録したトラブルがありません」", ex="TR-261003-0001　不在（DL-261016-0007 の便）‖Chọn sự cố đã ghi nhận của chi nhánh (ID + loại + chuyến)", err=["E02"],
          cond="「トラブルの対応」にチェックしたときだけ出る。必須。‖Chỉ hiện khi chọn 「トラブルの対応」. Bắt buộc.",
          detail="動かす便の拠点の配送に記録したトラブル（新しい順。解決済みも出す）。移動の履歴にトラブルをつなぐ。未選択なら E02。‖Sự cố đã ghi nhận ở 配送 của chi nhánh có chuyến di chuyển (mới nhất trước; gồm cả đã giải quyết). Liên kết sự cố vào lịch sử di chuyển. Chưa chọn thì E02."),
        I("法人に通知する‖Thông báo cho công ty", D4 + " .es-check::法人に通知", "check", "check", req="－", len="チェック‖Checkbox",
          init="ON‖Bật", ex="ON‖Bật = thông báo cho công ty về việc đổi ngày giao",
          detail="ONのとき、移動したあとに法人へお知らせする。委託配送先への通知は、このチェックに関係なく出す。このチェックは残す（初期ON。hong 2026-10-07 S6）。送るメールの種類は「メール一覧_配送」（別の担当が作成中）を参照する。宛先・文面はこの設計書には書かない（hong 2026-10-08 S-8）。‖Khi bật, sau khi di chuyển sẽ thông báo cho công ty. Thông báo cho đơn vị vận chuyển ủy thác luôn được gửi, không phụ thuộc ô này. Giữ ô này (mặc định bật; hong 2026-10-07 S6). Loại email gửi tham chiếu 「メール一覧_配送」 (người khác đang soạn). Không ghi người nhận・nội dung trong thiết kế này (hong 2026-10-08 S-8).",
          ),
        I("エラーの枠（移動できません）‖Khung lỗi (không di chuyển được)", D4 + " .es-inline--negative", "label", "view", err=["E160", "E161", "E162", "E163", "E01", "E02"],
          detail="止める理由を、小窓の一番上（「動かす配送」のすぐ下）に赤い枠で一覧にする。エラーがある欄（お届け日・理由・対応するトラブル）は、同時に欄の枠も赤にして、どの欄が原因か分かるようにする。資材便（E160）／出荷の前でない・出荷日の前日を過ぎた（E161）／本発注の決まり（E162）／移動先が選べない日（E163）／理由・トラブルが未入力（E01・E02）。エラーが1つでもあれば「確認して移動」は押せない。‖Liệt kê lý do chặn trong khung đỏ ở trên cùng cửa sổ (ngay dưới 「動かす配送」). Ô có lỗi (ngày giao, lý do, sự cố) đồng thời có viền đỏ để biết ô nào gây lỗi. Chuyến 資材 (E160) / không còn trước khi xuất hoặc quá ngày trước ngày xuất (E161) / quy tắc 本発注 (E162) / ngày đích không chọn được (E163) / chưa nhập lý do, sự cố (E01・E02). Còn 1 lỗi thì không nhấn được 「確認して移動」.",
          demo_ok="コードのエラーは小窓の中ほどに出て、どこが原因か分かりにくい。上部の赤い枠＋欄の赤枠にする（hong 2026-10-08 S-6）‖Lỗi trong code hiện ở giữa cửa sổ, khó biết nguyên nhân. Phải đặt khung đỏ ở trên cùng + viền đỏ ở ô lỗi (hong 2026-10-08 S-6)"),
        I("警告の枠（確認してください）‖Khung cảnh báo (hãy kiểm tra)", D4 + " .es-inline--warning::確認してください", "label", "view", err=["W130", "W131", "W132", "W133"],
          detail="移動はできるが確かめてほしいこと（黄）。出荷日の出荷が倉庫のしきい値を超える（W130）／ドライバーの1日の配送が目安15件を超える（W131）／移動先の日に同じ拠点・同じ温度帯の便がもうある（W132）／処理していない変更申請がある（W133。移動しても申請は残る）。止めない。‖Việc cho phép di chuyển nhưng cần kiểm tra (vàng): số chuyến xuất ngày xuất vượt ngưỡng của kho (W130) / số chuyến giao/ngày của tài xế vượt mức tham khảo 15 (W131) / ngày đích đã có chuyến cùng chi nhánh, cùng nhóm nhiệt độ (W132) / có 変更申請 chưa xử lý (W133; di chuyển xong đơn vẫn còn). Không chặn.",
          demo_ok="コードはしきい値300・ドライバー15を固定値で持つ。しきい値は倉庫ごとの運営が直せる値にする（O4・H8）。ドライバー15件は決定（O1）どおり‖Code cố định ngưỡng 300 và tài xế 15. Ngưỡng phải là giá trị sửa được theo kho (O4・H8). Tài xế 15 chuyến đúng theo quyết định (O1)"),
        I("確認の案内（移動の前に確認します）‖Hướng dẫn xác nhận (kiểm tra trước khi di chuyển)", D4 + " .es-inline--warning::移動の前に確認します", "label", "view",
          cond="移動先がお届けしない日、または別のサイクル・別の半分のときだけ出る。‖Chỉ hiện khi ngày đích là ngày không giao, hoặc sang chu kỳ/nửa khác.",
          detail="「{日付} はお届けしない日（{理由}）です」「{内容}」を黄の枠で知らせる。「確認して移動」を押すと、同じ小窓が第2ステップ（確認 Q130・Q131）に切り替わる（小窓は重ねない）。‖Báo bằng khung vàng 「{日付} はお届けしない日（{理由}）です」, 「{内容}」. Nhấn 「確認して移動」 thì cùng cửa sổ chuyển sang bước 2 (xác nhận Q130・Q131), không chồng cửa sổ."),
        I("移動の内容の表（現在 → 新）‖Bảng nội dung di chuyển (hiện tại → mới)", D4 + " .es-table", "table", "view",
          detail="動かす配送（No.1.1）ごとの移動の内容。列：配送No／拠点名／温度帯／お届け日（移動先を選ぶと「現在 → 新」）／出荷日（同じく）／出荷指示（出荷指示を送ったあとの便は「再送（rev+1）」のバッジ、まだなら「次の出荷指示に載る」）。再送は版番号を上げ、変更した行だけの CSV を作る（受付簿 No.169。THOMAS が同じ指示番号の再送を受け付けることは hong 2026-10-07 O3）。‖Nội dung di chuyển của từng chuyến ở No.1.1. Cột: 配送No / 拠点名 / 温度帯 / お届け日 (chọn ngày đích thì 「hiện tại → mới」) / 出荷日 (tương tự) / 出荷指示 (chuyến đã gửi chỉ thị xuất kho hiện badge 「再送（rev+1）」, chưa gửi thì 「次の出荷指示に載る」). Gửi lại tăng số phiên bản, xuất CSV chỉ các dòng đã đổi (受付簿 No.169; THOMAS nhận gửi lại cùng số chỉ thị: hong 2026-10-07 O3)."),
        I("キャンセル‖Hủy", D4 + " .es-dialog__foot .es-btn::キャンセル", "button", "click", detail="小窓を閉じる。入力したものは捨てる。‖Đóng cửa sổ. Bỏ nội dung đã nhập.", pattern="P-FORM",
          demo_ok="コードは入力があっても確認なしで閉じる。入力したあとは Q02 を出す（台帳 F 2026-10-05）。×・背景・Esc も同じ‖Code đóng không hỏi dù đã nhập. Sau khi nhập phải hiện Q02 (台帳 F 2026-10-05). Nút ×, nền, Esc cũng như vậy"),
        I("確認して移動‖Xác nhận và di chuyển", D4 + " .es-dialog__foot .es-btn::確認して移動", "button", "click", err=["S130", "E30", "E31", "E32"],
          cond="移動先が選ばれていて、エラーがないときだけ押せる。‖Chỉ nhấn được khi đã chọn ngày đích và không có lỗi.",
          detail="お届けしない日・別のサイクルのときは、同じ小窓が第2ステップ（確認 Q130・Q131）に切り替わり、「移動する」で実行する。それ以外はすぐ実行する。実行すると配送の日付・出荷日を動かし、出荷指示を送ったあとの便は版を上げて再送、委託配送先へ通知（「法人に通知する」がONなら法人へも）、移動の記録（変更前・変更後・理由・操作者）を残して S130（トーストは画面の右上）。通知メールの種類は「メール一覧_配送」（別の担当が作成中）を参照する。宛先・文面はここに書かない。ほかの人が先に更新していたら E31、権限がなければ E32、失敗は E30。‖Nếu ngày đích là ngày không giao / sang chu kỳ khác thì cùng cửa sổ chuyển sang bước 2 (xác nhận Q130・Q131), nhấn 「移動する」 để thực hiện. Trường hợp khác thực hiện ngay. Khi thực hiện: dời ngày giao・ngày xuất, chuyến đã gửi chỉ thị xuất kho thì tăng phiên bản và gửi lại, thông báo cho đơn vị vận chuyển ủy thác (và công ty nếu 「法人に通知する」 bật), lưu bản ghi di chuyển (trước/sau/lý do/người thao tác) rồi S130 (toast ở góc phải trên màn hình). Loại email thông báo tham chiếu 「メール一覧_配送」 (người khác đang soạn); không ghi người nhận・nội dung ở đây. Người khác cập nhật trước thì E31, không có quyền thì E32, lỗi thì E30."),
        I("閉じる（×）‖Đóng (×)", D4 + ' .es-dialog__close', "button", "click", detail="小窓を閉じる（キャンセルと同じ）。‖Đóng cửa sổ (giống Hủy)."),
    ]
    return assemble(
        I("小窓「出荷データの移動」‖Cửa sổ 「出荷データの移動」", D4 + " .es-dialog__panel", "area", "view",
          detail="週・日の表示で選んだ配送を別のお届け日へ動かす。ドラッグはしない。1つの小窓の中で2ステップ：第1ステップ＝移動先などの入力、第2ステップ＝確認（お届けしない日・別のサイクルのときだけ）。小窓は重ねない。決まりは台帳 L「配送の日付の移動」（本発注の前は何便でも・同じサイクルの中、本発注の後は1便だけ・理由必須・同じ半分の中、別のサイクル・別の半分はトラブルの対応のときだけ、お届けしない日は確認、倉庫が出荷できない日は選べない、出荷指示の後は版を上げて再送）。‖Di chuyển các 配送 đã chọn ở view tuần/ngày sang ngày giao khác. Không kéo thả. Trong 1 cửa sổ có 2 bước: bước 1 = nhập ngày đích..., bước 2 = xác nhận (chỉ khi ngày không giao hoặc sang chu kỳ khác). Không chồng cửa sổ. Quy tắc theo 台帳 L 「配送の日付の移動」 (trước 本発注: nhiều chuyến được, trong cùng chu kỳ; sau 本発注: chỉ 1 chuyến, bắt buộc lý do, trong cùng nửa; chu kỳ/nửa khác chỉ khi xử lý sự cố; ngày không giao thì xác nhận; ngày kho không xuất được thì không chọn được; sau chỉ thị xuất kho thì tăng phiên bản và gửi lại).",
          kids=[moving, body[7], info, body[0], legend, body[2], body[1]] + body[3:7] + [body[8], body[9], body[10]] + body[11:]))


def confirm_items(kind):
    """確認（Q130・Q131）は、移動の小窓の第2ステップ（小窓を重ねない。hong 2026-10-08 S-7）"""
    if kind == "holiday":
        title = ("本当に移動しますか？お客様に確認済みですか？‖Thực sự di chuyển? Đã xác nhận với khách chưa?", ["Q130"],
                 "移動先がお届けしない日（祝日・日曜・月曜）のときの第2ステップ。同じ小窓の中が確認に切り替わる（小窓は重ねない）。本文は「{日付}は拠点のお届けしない日（{理由}）です。」。ボタンは「戻る」「移動する」。‖Bước 2 khi ngày đích là ngày không giao (ngày lễ, Chủ Nhật, Thứ Hai). Nội dung trong cùng cửa sổ chuyển sang xác nhận (không chồng cửa sổ). Nội dung 「{日付}は拠点のお届けしない日（{理由}）です。」. Nút 「戻る」 và 「移動する」.", "移動する")
    else:
        title = ("別のサイクル・別の半分へ移動しますか？‖Di chuyển sang chu kỳ khác / nửa khác?", ["Q131"],
                 "別のサイクル、または本発注の後の別の半分へ動かすときの第2ステップ。同じ小窓の中が確認に切り替わる（小窓は重ねない）。本文は「{内容}。トラブルの対応のときだけ動かせます（トラブル：{ID}・理由：{理由}）。」。ボタンは「戻る」「トラブルの対応として移動する」。‖Bước 2 khi di chuyển sang chu kỳ khác hoặc sang nửa khác sau 本発注. Nội dung trong cùng cửa sổ chuyển sang xác nhận (không chồng cửa sổ). Nội dung 「{内容}。トラブルの対応のときだけ動かせます（トラブル：{ID}・理由：{理由}）。」. Nút 「戻る」 và 「トラブルの対応として移動する」.", "トラブルの対応として移動する")
    return assemble(
        I("第2ステップ（確認）‖Bước 2 (xác nhận)", D4 + " .mdl-step2", "area", "view", err=title[1], detail=title[2],
          demo_ok="コードは確認を別のモーダル（MoveConfirm）として小窓の上に重ねる。同じ小窓の中の第2ステップにする（hong 2026-10-08 S-7）‖Code hiện xác nhận thành modal riêng chồng lên cửa sổ di chuyển. Phải làm thành bước 2 trong cùng cửa sổ (hong 2026-10-08 S-7)",
          kids=[
              I("動かす配送（n便）‖Chuyến sẽ di chuyển (n chuyến)", "-", "area", "view", detail="第1ステップと同じ欄（No.1.1）を残す。何を動かす確認なのかが、そのまま見える。‖Giữ nguyên khối giống bước 1 (No.1.1) để thấy ngay đang xác nhận di chuyển chuyến nào."),
              I("タイトル‖Tiêu đề", "-", "label", "view", detail="確認の問い（%s）。‖Câu hỏi xác nhận (%s)." % (title[0].split("‖")[0], title[0].split("‖")[1])),
              I("本文‖Nội dung", "-", "label", "view", detail="移動先・理由など、確かめる中身。‖Nội dung cần kiểm tra như ngày đích, lý do."),
              I("戻る‖Quay lại", "-", "button", "click", detail="第1ステップに戻る。入力した内容はそのまま残る。小窓は閉じない。‖Quay lại bước 1. Nội dung đã nhập vẫn còn. Không đóng cửa sổ."),
              I(title[3] + "‖" + ("Di chuyển" if kind == "holiday" else "Di chuyển để xử lý sự cố"), "-", "button", "click", err=["S130", "E30", "E31"],
                detail="実行する。成功したら小窓を閉じ、選択を外して S130 のトースト（画面の右上）を出す。‖Thực hiện. Thành công thì đóng cửa sổ, bỏ chọn và hiện toast S130 (góc phải trên màn hình)."),
          ]))


# ---------------------------------------------------------------- 変更申請（小窓）
def cr_list_items(empty=False):
    cols = [
        I("チェック‖Ô chọn", D5 + " .es-table tbody .es-check__box", "check", "check", req="－", len="チェック‖Checkbox", init="判定が「問題なし」の行はON、それ以外は無効‖Dòng 判定 「問題なし」 mặc định ON, còn lại vô hiệu", ex="ON‖Bật = đưa đơn này vào duyệt hàng loạt",
          detail="判定が「問題なし」の申請だけ選べる。「希望日なし」「要再確認」「提案中」の行は無効（薄い字）。‖Chỉ chọn được đơn có 判定 「問題なし」. Dòng 「希望日なし」, 「要再確認」, 「提案中」 bị vô hiệu (chữ nhạt)."),
        I("No‖No", D5 + " .es-table tbody td:nth-child(2)", "label", "view", detail="表の通し番号。‖Số thứ tự trong bảng."),
        I("申請番号‖Số đơn", D5 + " .es-table tbody td.es-mono a", "link", "click", detail="DD-YYYYMMDD-NNNN。押すとその配送データ詳細（AW_DLVR_002）へ行き、1件ずつ処理する。‖DD-YYYYMMDD-NNNN. Nhấn mở chi tiết 配送データ (AW_DLVR_002) để xử lý từng đơn.",
          demo_ok="コードは申請に配送がないとき、固定の見本の配送（DL-261020-0021）へ飛ぶ。配送のない申請は出さない（H14）‖Khi đơn không có 配送, code nhảy tới 配送 mẫu cố định (DL-261020-0021). Không hiện đơn không có 配送 (H14)"),
        I("受付日‖Ngày tiếp nhận", D5 + " .es-table thead th::受付日", "label", "view", detail="法人が申請した日（M/D）。‖Ngày công ty gửi đơn (M/D)."),
        I("拠点名‖Tên chi nhánh", D5 + " .es-table thead th::拠点名", "label", "view", detail="申請した拠点の名前。‖Tên chi nhánh gửi đơn."),
        I("便種別‖Loại chuyến", D5 + " .es-table thead th::便種別", "label", "view", detail="ES配送便／COOL便。‖ES配送便 / COOL便."),
        I("温度帯‖Nhóm nhiệt độ", D5 + " .es-table thead th::温度帯", "label", "view", detail="冷凍・冷蔵のタグ。同じ拠点・同じ納品日の冷蔵と冷凍は一緒に動く。‖Tag 冷凍 / 冷蔵. Lạnh và đông của cùng chi nhánh, cùng ngày giao đi cùng nhau."),
        I("納品日‖Ngày giao", D5 + " .es-table thead th::納品日", "label", "view", detail="いまの納品日（M/D）。‖Ngày giao hiện tại (M/D)."),
        I("第一希望日‖Ngày mong muốn thứ nhất", D5 + " .es-table thead th::第一希望日", "label", "view", detail="法人の第一希望日（M/D）。一括承認はこの日で承認する。‖Ngày mong muốn thứ nhất của công ty (M/D). Duyệt hàng loạt sẽ duyệt theo ngày này."),
        I("判定ステータス‖Trạng thái phán định", D5 + " .es-table tbody .es-badge", "label", "view",
          detail="システムの判定のバッジ。問題なし＝緑／希望日なし＝黄／要再確認＝灰／提案中（法人の返事待ち）＝青（P-STATUS-COLORS）。‖Badge phán định của hệ thống. 問題なし = xanh lá / 希望日なし = vàng / 要再確認 = xám / 提案中（法人の返事待ち） = xanh dương (P-STATUS-COLORS).", pattern="P-STATUS-COLORS"),
        I("理由‖Lý do", D5 + " .es-table td.clip", "label", "view", detail="判定の理由（長いときは省略して出す）。‖Lý do phán định (dài thì cắt bớt)."),
    ]
    return assemble(
        I("小窓「変更申請（未処理）」‖Cửa sổ 「変更申請（未処理）」", D5 + " .es-dialog__panel", "area", "view",
          detail="処理期限が来ていて、まだ処理していない変更申請（お届け日の変更）の一覧。判定が「問題なし」の申請だけを選んで一括承認できる。ほかは申請番号から配送データ詳細を開き、1件ずつ処理する（承認・別の日の提案・否認）。‖Danh sách yêu cầu đổi ngày giao đã đến hạn xử lý nhưng chưa xử lý. Chỉ chọn các đơn có 判定 「問題なし」 để duyệt hàng loạt. Đơn khác mở chi tiết 配送データ từ số đơn và xử lý từng đơn (duyệt, đề xuất ngày khác, từ chối).",
          kids=[
              I("閉じる（×）‖Đóng (×)", D5 + " .es-dialog__close", "button", "click", detail="小窓を閉じる。‖Đóng cửa sổ."),
              I("検索条件‖Điều kiện tìm kiếm", D5 + " .es-search", "area", "view", pattern="P-LIST",
                detail="3つの条件（キーワード・システム判定・便種別）。「検索」か Enter で反映、「クリア」で戻す。‖3 điều kiện (từ khóa, phán định của hệ thống, loại chuyến). Áp dụng khi nhấn 「検索」 hoặc Enter, 「クリア」 để quay lại.", kids=[
                    I("キーワード‖Từ khóa", D5 + ' .es-search input[placeholder^="法人ID"]', "text", "input", req="－", len="文字列 60", init="空‖Trống", ex="DD-20260916-0001‖Số đơn hoặc ID công ty/chi nhánh/hợp đồng",
                      valid="部分一致。法人ID・名、拠点ID・名、契約ID、申請番号、配送No。‖Khớp một phần. ID/tên công ty, ID/tên chi nhánh, ID hợp đồng, số đơn, 配送No."),
                    I("システム判定‖Phán định của hệ thống", D5 + ' .es-search select[aria-label="システム判定"]', "select", "select", req="－", len="選択", init="未選択‖Chưa chọn", ex="問題なし‖Chọn phán định (問題なし / 希望日なし / 要再確認 / 提案中（法人の返事待ち）)",
                      detail="判定で絞る（問題なし／希望日なし／要再確認／提案中（法人の返事待ち））。‖Lọc theo phán định (問題なし / 希望日なし / 要再確認 / 提案中（法人の返事待ち))."),
                    I("便種別‖Loại chuyến", D5 + ' .es-search select[aria-label="便種別"]', "select", "select", req="－", len="選択", init="未選択‖Chưa chọn", ex="ES配送便‖Chọn loại chuyến (ES配送便 / COOL便)",
                      detail="便の種類で絞る（ES配送便／COOL便）。‖Lọc theo loại chuyến (ES配送便 / COOL便)."),
                    I("クリア・検索‖Xóa điều kiện / Tìm kiếm", D5 + " .es-search .es-btn::検索", "button", "click", detail="条件を反映する／空に戻す。‖Áp dụng điều kiện / đưa về trống."),
                ]),
              I("説明‖Giải thích", D5 + " .hint", "label", "view", detail="「問題なし」の申請だけ選んで一括承認できます。「希望日なし」「要再確認」は申請番号から配送データ詳細を開き、1件ずつ処理します。同じ拠点・同じ納品日の冷蔵と冷凍は一緒に動きます。（画面の説明文）‖Giải thích trên màn hình: chỉ đơn 「問題なし」 mới duyệt hàng loạt được; các đơn còn lại xử lý từng đơn ở chi tiết 配送データ. Lạnh/đông cùng chi nhánh, cùng ngày giao đi cùng nhau."),
              I("申請の表‖Bảng đơn", D5 + " .es-table-wrap", "table", "view", pattern="P-LIST", err=["I01"],
                detail="処理待ちの申請。並びは受付日の古い順（hong 回答 2026-10-08：受付日の古い順。コードもこの並び）。0件のときは I01。‖Các đơn chờ xử lý. Xếp theo ngày tiếp nhận cũ nhất trước (hong 2026-10-08; code cũng theo thứ tự này). 0 dòng thì hiện I01.",
                demo_ok="コードの0件の文言は「条件に合う申請はありません」。I01（「表示するデータがありません。」）にそろえる‖Câu 0 dòng trong code là 「条件に合う申請はありません」. Thống nhất theo I01 (「表示するデータがありません。」)",
                kids=cols),
              I("ページ送り‖Phân trang", D5 + " .es-pagination", "area", "view", pattern="P-LIST", detail="「n件中 a–b件」・ページ番号・表示件数（10／20／50／100件。既定10）。‖「n件中 a–b件」, số trang, số dòng mỗi trang (10 / 20 / 50 / 100; mặc định 10)."),
              I("閉じる‖Đóng", D5 + " .es-dialog__foot .es-btn::閉じる", "button", "click", detail="小窓を閉じる。‖Đóng cửa sổ."),
              I("一括承認（n件）‖Duyệt hàng loạt (n mục)", D5 + " .es-dialog__foot .es-btn::一括承認", "button", "click",
                cond="承認の権限（出荷・配送管理の更新）がある役割だけに出す。n は選んだ申請の件数で、0件のときは無効。‖Chỉ hiện với vai trò có quyền duyệt (cập nhật 出荷・配送管理). n là số đơn đã chọn; 0 thì vô hiệu.",
                detail="選んだ申請の確認（AW_SCHD_005 の次の画面）を開く。承認は第一希望日で行う。「変更申請一括承認」は残す（hong 2026-10-07 Q5＝A）。‖Mở màn xác nhận các đơn đã chọn (màn kế của AW_SCHD_005). Duyệt theo ngày mong muốn thứ nhất. Giữ 「変更申請一括承認」 (hong 2026-10-07 Q5 = A).",
                err=["E164"]),
          ]))


def cr_approve_items():
    return assemble(
        I("小窓「変更申請一括承認」‖Cửa sổ 「変更申請一括承認」", D5A + " .es-dialog__panel", "area", "view",
          detail="選んだ申請を一括承認する前の確認。承認は第一希望日で行う。‖Màn xác nhận trước khi duyệt hàng loạt các đơn đã chọn. Duyệt theo ngày mong muốn thứ nhất.",
          kids=[
              I("案内‖Hướng dẫn", D5A + " .es-inline", "label", "view", err=["Q11"],
                detail="「次の n件を承認し、納品日を第一希望日に変更します。ピッキング日はリードタイムを保って一緒に動きます。承認すると法人の申請履歴と配送カレンダーに反映され、スケジュールでは青い印（移動）が付きます。」確認の問いは共通の確認 Q11 の形（タイトル「選択した n件を一括承認しますか？」＋結果「n件すべてに同じ内容を適用します。」）にそろえる（hong 2026-10-07 S7）。上の説明文は結果の下の補足として出す。‖「Duyệt n đơn sau và đổi ngày giao thành ngày mong muốn thứ nhất. Ngày picking di chuyển cùng, giữ nguyên lead time. Sau khi duyệt, nội dung phản ánh vào lịch sử đơn của công ty và lịch giao hàng, trên lịch hiện dấu xanh (di chuyển).」 Câu hỏi xác nhận thống nhất theo xác nhận chung Q11 (tiêu đề 「選択した n件を一括承認しますか？」 + kết quả 「n件すべてに同じ内容を適用します。」) (hong 2026-10-07 S7). Đoạn giải thích trên hiện thành phần bổ sung bên dưới kết quả.",
                demo_ok="コードは確認の問いを案内の枠の文章で出す。Q11（タイトル＋結果）の形に直す（S7）‖Code hiện câu xác nhận bằng đoạn văn trong khung hướng dẫn. Sửa theo dạng Q11 (tiêu đề + kết quả) (S7)"),
              I("承認する申請の表‖Bảng đơn sẽ duyệt", D5A + " .es-table", "table", "view",
                detail="列：No／申請番号（配送データ詳細へのリンク）／拠点名／温度帯／納品日／承認後の納品日（第一希望日）／ピッキング日（承認後。冷凍は2日、冷蔵は1日前）／判定ステータス（問題なし）／理由。‖Cột: No / số đơn (liên kết tới chi tiết 配送データ) / tên chi nhánh / nhóm nhiệt độ / ngày giao / ngày giao sau khi duyệt (ngày mong muốn thứ nhất) / ngày picking (sau khi duyệt; đông trước 2 ngày, lạnh trước 1 ngày) / 判定 (問題なし) / lý do."),
              I("閉じる‖Đóng", D5A + " .es-dialog__foot .es-btn::閉じる", "button", "click", detail="確認をやめて、申請の一覧に戻る。‖Thôi xác nhận, quay lại danh sách đơn."),
              I("一括承認‖Duyệt hàng loạt", D5A + " .es-dialog__foot .es-btn::一括承認", "button", "click", err=["E164", "E30", "E31", "E32"],
                cond="承認の権限（出荷・配送管理の更新）がある役割だけに出す。‖Chỉ hiện với vai trò có quyền duyệt (cập nhật 出荷・配送管理).",
                detail="判定が「問題なし」で申請中のものだけ、第一希望日で承認する（納品日とピッキング日が動き、各申請の変更履歴に承認日時・担当者を保存する）。承認できるものがなければ E164。ほかの人が先に更新していたら E31、権限がなければ E32、失敗は E30。成功したら小窓を閉じ、S11（「n件を承認しました」）のトーストだけを出す。完了のモーダルは出さない。承認した行は一覧から消えるので、誤ってもう一度押すことはない（hong 2026-10-07 S8）。‖Chỉ duyệt đơn đang 申請中 có 判定 「問題なし」 theo ngày mong muốn thứ nhất (ngày giao và ngày picking dời; lưu ngày giờ duyệt và người duyệt vào lịch sử thay đổi từng đơn). Không có đơn nào duyệt được thì E164. Người khác cập nhật trước thì E31, không có quyền thì E32, lỗi thì E30. Thành công thì đóng cửa sổ và chỉ hiện toast S11 (「n件を承認しました」), không hiện modal hoàn tất. Các dòng đã duyệt biến mất khỏi danh sách nên không thể nhấn nhầm lần nữa (hong 2026-10-07 S8)."),
          ]))


def cr_done_items():
    return assemble(
        I("承認完了のトースト‖Toast hoàn tất duyệt", ".toast", "toast", "show", err=["S11"],
          detail="一括承認が成功したら、小窓を閉じて S11（「n件を承認しました」）のトーストだけを画面の右上に出す。完了のモーダルは出さない。承認した行は一覧から消えるので、誤ってもう一度押すことはない。件数（ヘッダーの「変更申請（n件）」）を数え直す。各申請の変更履歴に承認日時・担当者を保存する。（hong 2026-10-07 S8）‖Khi duyệt hàng loạt thành công, đóng cửa sổ và chỉ hiện toast S11 (「n件を承認しました」). Không hiện modal hoàn tất. Các dòng đã duyệt biến mất khỏi danh sách nên không thể nhấn nhầm lần nữa. Đếm lại số trong 「変更申請（n件）」 ở đầu trang. Lưu ngày giờ duyệt và người duyệt vào lịch sử thay đổi của từng đơn. (hong 2026-10-07 S8)",
          demo_ok="コードは完了のモーダル（閉じるを押すとトースト）を出す。モーダルをやめ、トーストだけにする（S8）‖Code hiện modal hoàn tất (nhấn 閉じる mới hiện toast). Bỏ modal, chỉ dùng toast (S8)"))


# ---------------------------------------------------------------- スケジュール（資材タブ）AW_SCHD_006
DM6 = "コードに資材のタブはない（資材便が食品と同じ表に混ざっている）。足す（hong 2026-10-08 S-3）‖Code chưa có thẻ 資材 (chuyến 資材 lẫn trong cùng bảng với thực phẩm). Phải thêm (hong 2026-10-08 S-3)"


def material_items(plan=False):
    head = I("ヘッダー‖Đầu trang", "-", "area", "view", demo_ok=DM6, kids=[
        I("CSV出力‖Xuất CSV", "-", "button", "click", pattern="P-CSV-OUT", err=["S12"],
          detail="資材タブの表の、検索条件どおりの全件。1行＝1資材便。列は表と同じ（配送No・拠点名・状態・出荷日・ピッキング倉庫・配送会社・ドライバー・配送日）。食品の配送の CSV には資材便を含めない。予定の月は出す行がない。‖Toàn bộ dòng của bảng thẻ 資材 theo điều kiện tìm kiếm. 1 dòng = 1 chuyến 資材. Cột giống bảng (配送No, 拠点名, 状態, 出荷日, ピッキング倉庫, 配送会社, ドライバー, 配送日). CSV của chuyến thực phẩm không gồm chuyến 資材. Tháng dự kiến không có dòng nào để xuất."),
    ])
    bar = I("種類・期間の操作‖Chuyển loại, thao tác kỳ hạn", "-", "area", "view", kids=[
        I("種類（食品／資材）‖Loại (thực phẩm / 資材)", "-", "tab", "click",
          detail="「資材」が選ばれている。「食品」を押すと食品のスケジュール（月 AW_SCHD_001）へ戻る。資材はピッキングの流れ・スケジュールが食品と違うため、別のタブに分けた。‖Đang chọn 「資材」. Nhấn 「食品」 quay lại lịch thực phẩm (tháng AW_SCHD_001). Vì luồng picking・lịch của 資材 khác thực phẩm nên tách thành thẻ riêng."),
        I("表示する月‖Tháng đang hiển thị", "-", "label", "view", detail="yyyy-mm（例 2026-10）。入力はできない（前の月・次の月・今日で動かす）。確定の月と予定の月のどちらも開ける。‖yyyy-mm (ví dụ 2026-10). Không nhập được (di chuyển bằng nút tháng trước/sau/今日). Mở được cả tháng đã xác định lẫn tháng dự kiến."),
        I("前の月‖Tháng trước", "-", "button", "click", err=["I130"], detail="前の月を開く。これより前の月が無いときは I130 をトーストで出して動かない。‖Mở tháng trước. Nếu không còn tháng trước thì toast I130 và không di chuyển."),
        I("次の月‖Tháng sau", "-", "button", "click", err=["I131"], detail="次の月を開く。これより先の月が無いときは I131 をトーストで出して動かない。‖Mở tháng sau. Nếu không còn tháng sau thì toast I131 và không di chuyển."),
        I("今日‖Hôm nay", "-", "button", "click", detail="今日（実際の今日）を含む月を開く。‖Mở tháng chứa ngày hôm nay (ngày thật)."),
    ])
    if plan:
        info = I("案内（予定の月は資材便が出ない）‖Hướng dẫn (tháng dự kiến không có chuyến 資材)", "-", "label", "view", err=["I192"],
                 detail="予定の月を開いたときは、表を出さずにこの案内だけを出す。資材便の配送データは予定の段階では作られない（hong 2026-10-08 S-3）。‖Khi mở tháng dự kiến thì không hiện bảng mà chỉ hiện hướng dẫn này. Dữ liệu giao hàng chuyến 資材 không được tạo ở giai đoạn dự kiến (hong 2026-10-08 S-3).")
        return assemble(head, bar, info)
    info = I("案内（資材便は別に表示）‖Hướng dẫn (hiển thị riêng chuyến 資材)", "-", "label", "view", err=["I191"],
             detail="資材便は食品の配送と別に表示していること、食品の件数には含めないこと、日付はここでは動かせない（資材の注文の画面で変える）ことを、一覧の上に出す。資材便にはチェックボックスも「出荷データの移動」ボタンもない。‖Hiện phía trên danh sách: chuyến 資材 hiển thị riêng với thực phẩm, không tính vào số chuyến thực phẩm, không đổi ngày ở đây (đổi ở màn hình đặt 資材). Chuyến 資材 không có ô chọn và không có nút 「出荷データの移動」.")
    search_ = I("検索条件‖Điều kiện tìm kiếm", "-", "area", "view", pattern="P-LIST", kids=[
        I("キーワード（法人・拠点・配送No）‖Từ khóa (công ty, chi nhánh, 配送No)", "-", "text", "input", req="－", len="文字列 60",
          init="空‖Trống", ex="DL-261005-0021‖Mã 配送No (nhập một phần cũng được)",
          valid="部分一致。法人ID・名、拠点ID・名、配送No のどれにも合う。前後の空白を取り、全角の英数字・ハイフンは半角に直す。‖Khớp một phần. Khớp với ID/tên công ty, ID/tên chi nhánh, 配送No. Bỏ khoảng trắng đầu/cuối, đổi chữ/số/gạch toàn góc sang nửa góc.", err=["E04"]),
        I("状態‖Trạng thái", "-", "select", "select", req="－", len="選択", init="未選択‖Chưa chọn", ex="出荷待‖Chọn trạng thái của 配送データ",
          detail="配送データの状態で絞る。‖Lọc theo trạng thái của 配送データ."),
        I("ピッキング倉庫‖Kho picking", "-", "select", "select", req="－", len="選択", init="未選択‖Chưa chọn", ex="関東倉庫 WH00001‖Chọn kho picking (tên kho + mã)",
          detail="ピッキングする倉庫で絞る。倉庫マスタの倉庫から出す。‖Lọc theo kho picking. Lấy từ các kho trong 倉庫マスタ."),
        I("委託配送会社‖Công ty vận chuyển ủy thác", "-", "select", "select", req="－", len="選択", init="未選択‖Chưa chọn", ex="ヤマト運輸‖Chọn công ty vận chuyển ủy thác",
          detail="委託配送会社（配送会社マスタ）で絞る。‖Lọc theo công ty vận chuyển ủy thác (master công ty vận chuyển)."),
        I("クリア‖Xóa điều kiện", "-", "button", "click", detail="条件をすべて空に戻して、一覧を最初の状態にする。‖Đưa mọi điều kiện về trống và hiển thị lại trạng thái ban đầu."),
        I("検索‖Tìm kiếm", "-", "button", "click", detail="条件を反映する。Enter でも同じ。入力中は反映しない。‖Áp dụng điều kiện. Nhấn Enter cũng được. Không áp dụng khi đang nhập."),
    ])
    cols = [
        I("No‖No", "-", "label", "view", detail="表の通し番号（ページをまたいで続く）。‖Số thứ tự trong bảng (liên tục qua các trang)."),
        I("配送No‖Mã chuyến (配送No)", "-", "link", "click", detail="DL-YYMMDD-NNNN。押すと配送データ詳細（AW_DLVR_002）へ行く。‖DL-YYMMDD-NNNN. Nhấn mở chi tiết 配送データ (AW_DLVR_002)."),
        I("拠点名‖Tên chi nhánh", "-", "label", "view", detail="拠点名。‖Tên chi nhánh."),
        I("状態‖Trạng thái", "-", "label", "view", detail="配送データの状態のバッジ（P-STATUS-COLORS）。‖Badge trạng thái 配送データ (P-STATUS-COLORS).", pattern="P-STATUS-COLORS"),
        I("出荷日（出）‖Ngày xuất", "-", "label", "view", detail="M/D。ピッキングして出荷する日。‖M/D. Ngày picking và xuất kho."),
        I("ピッキング倉庫‖Kho picking", "-", "label", "view", detail="ピッキングする倉庫の名前。‖Tên kho picking."),
        I("配送会社‖Công ty vận chuyển", "-", "label", "view", detail="配送を受け持つ会社。‖Công ty phụ trách giao hàng."),
        I("ドライバー‖Tài xế", "-", "label", "view", detail="担当。割り当て前は赤字で「割当待ち」。‖Người phụ trách. Chưa gán thì chữ đỏ 「割当待ち」."),
        I("配送日（着）‖Ngày giao", "-", "label", "view", detail="M/D。お届けする日。‖M/D. Ngày giao hàng."),
    ]
    table = I("資材便の表‖Bảng chuyến 資材", "-", "table", "view", pattern="P-LIST", err=["I01"],
              detail="選んだ月に出荷する資材便（確定の配送データだけ）。並びは出荷日の昇順。チェックボックスはなく、日付はここで動かさない（資材の注文の画面で変える）。0件のときは I01。列の見え方：配送No・拠点名は左に固定し、横スクロールは表の中だけ（ページ全体は横に動かさない）。文字は折り返す（長い列は2行まで。超えた分は「…」にして、マウスを重ねるとツールチップで全文）。切れて読めない列を作らない。‖Các chuyến 資材 xuất trong tháng đã chọn (chỉ 配送データ đã xác định). Xếp theo ngày xuất tăng dần. Không có ô chọn, không đổi ngày ở đây (đổi ở màn hình đặt 資材). 0 dòng thì hiện I01. Cách hiển thị cột: 配送No và 拠点名 cố định bên trái, cuộn ngang chỉ trong bảng (không cuộn ngang cả trang, kể cả khi bảng rộng hơn 1440px). Chữ xuống dòng (cột dài tối đa 2 dòng, phần dư thành 「…」, rê chuột lên hiện toàn bộ bằng tooltip). Không để cột bị cắt không đọc được.",
              kids=cols)
    pager_ = I("ページ送り‖Phân trang", "-", "area", "view", pattern="P-LIST",
               detail="「n件中 a–b件」・ページ番号・表示件数（10／20／50／100件。既定10）。‖「n件中 a–b件」, số trang, số dòng mỗi trang (10 / 20 / 50 / 100; mặc định 10).")
    return assemble(head, bar, info, search_, table, pager_)


# ---------------------------------------------------------------- 状態（VIEWS）
def V(id, code, ja, vi, url, items, setup="", note=None, full=True, wait=700, login=None):
    d = {"id": id, "code": code, "state": [ja, vi], "url": url, "setup": (H + setup) if setup else "", "full": full, "wait": wait,
         "note": T(note) if note else ["", ""], "items": items}
    if login:
        d["login"] = login
    return d


# ---------------------------------------------------------------- 状態を足す部品（番号は振り直さない：既存の大項目の末尾に足し、その状態では必要な大項目だけ残す）
def add_top(items, item):
    n = max(int(i["no"].split(".")[0]) for i in items) + 1
    out = list(items)
    numbered(str(n), copy.deepcopy(item), out)
    return out


def only(items, *tops):
    return [i for i in items if i["no"].split(".")[0] in tops]


READONLY = I("参照のみのとき（経理）‖Khi chỉ xem (経理)", "-", "area", "view",
             cond="経理（参照のみ）で開いたとき。フル権限・物流など、操作できる役割には出ない（通常の画面）。‖Khi mở bằng 経理 (chỉ xem). Với vai trò thao tác được như フル権限・物流 thì không áp dụng (màn bình thường).",
             detail="経理は月・週・日・資材の表示と CSV出力、要確認の確認はできるが、書き換える操作のボタンは出さない：「配送サイクル設定」（ヘッダー）、「出荷データの移動」（選択バー）、変更申請の小窓の「一括承認」。ボタンが出ないだけで、並び・件数・バッジは操作できる役割と同じ。URL を直接開いて操作しようとしても、画面側で止める（E32）。‖経理 xem được các view tháng・tuần・ngày・資材, xuất CSV và xem 要確認, nhưng không hiện nút làm thay đổi dữ liệu: 「配送サイクル設定」 (đầu trang), 「出荷データの移動」 (thanh chọn), 「一括承認」 trong cửa sổ yêu cầu thay đổi. Chỉ không hiện nút; thứ tự・số chuyến・badge giống vai trò thao tác được. Nếu mở URL trực tiếp để thao tác thì màn hình chặn (E32).",
             err=["E32"],
             demo_ok="コードは経理にもボタンを出す。権限のない役割には出さない（台帳 F・権限表）‖Code hiện nút cả với 経理. Không hiện với vai trò không có quyền (台帳 F, bảng quyền)")

LOADING = I("読み込み中・読み込み失敗（表の中）‖Đang tải・tải thất bại (trong bảng)", "-", "area", "view", err=["I103", "W103"],
            detail="一覧を読み込んでいる間は表の中に I103 を出す。読み込めなかったときは表の中に W103 を出し、「再読み込み」を押すともう一度読む。表の見出し・検索条件・ヘッダーはそのまま出す。月・週はカレンダーの場所に同じ文言を出す。‖Trong lúc đang tải danh sách thì hiện I103 trong bảng. Khi không tải được thì hiện W103 trong bảng, nhấn 「再読み込み」 để tải lại. Tiêu đề bảng・điều kiện tìm kiếm・đầu trang vẫn hiện như cũ. Ở view tháng・tuần thì hiện cùng câu ở chỗ của lịch.")


OPEN_WEEK_DRAFT = "/ops/delivery/schedule?view=week&d=2026-11-16"
OPEN_WEEK_FIXED = "/ops/delivery/schedule?view=week&d=2026-10-05"
OPEN_MOVE = "clickText('.es-selbar__actions .es-btn','出荷データの移動');await sleep(900);"
PICK_ONE = "await ready();chk(0);await sleep(300);"
CELL = ("for(let i=0;i<50&&!document.querySelector('" + D4 + " .es-calcell.is-clickable');i++)await sleep(100);"
        "const cs=[...document.querySelectorAll('" + D4 + " .es-calcell.is-clickable')];"
        "const cell=(d)=>cs.find(x=>x.title.startsWith(d))||cs.find(x=>!x.className.includes('--holiday'))||cs[0];")

# トラブルの対応を ON にして、トラブル・理由まで入れる（見本：確定の週の便＝2026-09 サイクル。トラブル TR-260919-0001 が選べる）
TROUBLE_ON = ("const tt=[...document.querySelectorAll('" + D4 + " .es-check')].find(x=>(x.textContent||'').includes('トラブルの対応'));if(tt)tt.querySelector('input').click();await sleep(700);"
              "const sl=document.querySelector('" + D4 + " .es-field select');if(sl&&sl.options.length>1){sl.value=sl.options[1].value;sl.dispatchEvent(new Event('change',{bubbles:true}));}await sleep(400);"
              "const ri=document.querySelector('" + D4 + " input[placeholder^=例]');if(ri){Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(ri,'誤配送の再送');ri.dispatchEvent(new Event('input',{bubbles:true}));}await sleep(300);")

VIEWS = [
    # ---- 月
    V("001", "AW_SCHD_001", "月・確定月 初期表示（要確認パネル閉）", "Tháng đã xác định, hiển thị ban đầu (panel 要確認 đóng)", "/ops/delivery/schedule", month_items(),
      note="確定の月（2026-10）。検索条件・件数・バッジは決定（Q6＝A）に合わせて書いた（コードは宿題）。‖Tháng đã xác định (2026-10). Điều kiện tìm kiếm, số chuyến, badge được viết theo quyết định (Q6 = A); code là bài tập cần sửa."),
    V("002", "AW_SCHD_001", "月・要確認パネルを開いた", "Tháng, đã mở panel 要確認", "/ops/delivery/schedule", month_items(panel=True),
      setup="clickText('.es-pagehead__actions .hl','要確認');await sleep(500);",
      note="「要確認（n件）」を押した状態。確定の月だけ。‖Trạng thái sau khi nhấn 「要確認（n件）」. Chỉ ở tháng đã xác định."),
    V("003", "AW_SCHD_001", "月・予定月（点線枠・凡例あり）", "Tháng dự kiến (viền nét đứt, có chú giải)", "/ops/delivery/schedule?view=month&d=2026-11", month_items(draft=True),
      note="予定の月（2026-11）。段階は「予定・編集中」。凡例は予定の月だけに出る。‖Tháng dự kiến (2026-11). Giai đoạn 「予定・編集中」. Chú giải chỉ hiện ở tháng dự kiến."),
    V("004", "AW_SCHD_001", "月・これより前の月が無い（トースト）", "Tháng, không còn tháng trước (toast)", "/ops/delivery/schedule",
      month_items(toast=toast_item("画面の右上に数秒出して自動で消える（全サイト共通・台帳 F 2026-10-08）。「前の月」を押したが前の月が無いときは I130、「次の月」を押したが先の月が無いときは I131。この状態は I130。‖Hiện vài giây ở góc phải trên màn hình rồi tự mất (chung toàn site; 台帳 F 2026-10-08). Nhấn 「前の月」 mà không còn tháng trước thì I130; nhấn 「次の月」 mà không còn tháng sau thì I131. Trạng thái này là I130.", ["I130", "I131"])),
      setup="document.querySelector('.dnav button[aria-label=\"前の月\"]').click();await sleep(400);", wait=300,
      note="2026-10 で「前の月」を押した。2026-11 で「次の月」を押すと I131。‖Nhấn 「前の月」 ở 2026-10. Nhấn 「次の月」 ở 2026-11 thì hiện I131."),
    # ---- 週
    V("005", "AW_SCHD_002", "週・確定週 出荷基準", "Tuần đã xác định, cơ sở 出荷", OPEN_WEEK_FIXED, week_items(True),
      note="確定の週（2026-10-05〜）。基準は出荷。‖Tuần đã xác định (từ 2026-10-05). Cơ sở là 出荷."),
    V("006", "AW_SCHD_002", "週・確定週 納品・配送基準", "Tuần đã xác định, cơ sở 納品・配送", OPEN_WEEK_FIXED, week_items(True),
      setup="clickText('.es-search .es-seg__item','納品・配送');await sleep(500);",
      note="基準を「納品・配送」に切り替えた。各日に届ける配送を出し、未割当のバッジが付く。‖Đã chuyển cơ sở sang 「納品・配送」. Mỗi ngày hiện các 配送 giao trong ngày và có badge chưa gán."),
    V("007", "AW_SCHD_002", "週・確定週 チェック選択（選択バー）", "Tuần đã xác định, đã chọn (thanh chọn)", OPEN_WEEK_FIXED, week_items(True, selected=True),
      setup="await ready();ALL();await sleep(500);",
      note="「全て選択（n件）」か、配送のチェックを入れた状態。画面の下に選択バーが出る。‖Đã tick 「全て選択（n件）」 hoặc ô chọn của 配送. Thanh chọn hiện ở cuối màn hình."),
    V("008", "AW_SCHD_002", "週・予定週（編集モード）", "Tuần dự kiến (chế độ chỉnh sửa)", OPEN_WEEK_DRAFT, week_items(False),
      note="予定の週（2026-11-16〜）。編集モードで、選択バーが常に出る（キャンセル／移動は未選択で無効）。基準の切替は出さない（Q8）。‖Tuần dự kiến (từ 2026-11-16). Chế độ chỉnh sửa, thanh chọn luôn hiện (Hủy / Di chuyển bị vô hiệu khi chưa chọn). Không hiện nút đổi cơ sở (Q8)."),
    V("009", "AW_SCHD_002", "週・予定週 チェック選択", "Tuần dự kiến, đã chọn", OPEN_WEEK_DRAFT, week_items(False, selected=True),
      setup="await ready();chk(0);await sleep(400);",
      note="配送のチェックを入れた状態。「出荷データの移動」が押せるようになる。‖Đã tick ô chọn của 配送. Nút 「出荷データの移動」 nhấn được."),
    # ---- 日
    V("010", "AW_SCHD_003", "日・確定日（配送データの表）", "Ngày đã xác định (bảng 配送データ)", "/ops/delivery/schedule?view=day&d=2026-10-05", day_items(True),
      note="確定の日（2026-10-05）。基準は出荷。並び・並べ替え・検索条件は決定（Q6・Q7＝C）に合わせて書いた（コードは宿題）。‖Ngày đã xác định (2026-10-05). Cơ sở 出荷. Thứ tự, sắp xếp, điều kiện tìm kiếm viết theo quyết định (Q6, Q7 = C); code là bài tập cần sửa."),
    V("011", "AW_SCHD_003", "日・確定日 0件", "Ngày đã xác định, 0 dòng", "/ops/delivery/schedule?view=day&d=2026-10-05", day_items(True, empty=True),
      setup="const k=document.querySelector('.es-search input[placeholder^=\"法人ID\"]');if(k){const s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;s.call(k,'zzzz');k.dispatchEvent(new Event('input',{bubbles:true}));}clickText('.es-search button','検索');await sleep(500);",
      note="キーワードに合うものがない。表の中に I01 を出す。‖Không có mục nào khớp từ khóa. Hiện I01 trong bảng."),
    V("012", "AW_SCHD_003", "日・確定日 選択中（出荷の前の配送だけ選べる）", "Ngày đã xác định, đã chọn (chỉ chọn được 配送 trước khi xuất)", "/ops/delivery/schedule?view=day&d=2026-10-05", day_items(True, selected=True),
      setup="await ready();chk(0);await sleep(400);",
      note="状態が予定・出荷待の行だけ選べる。選ぶと選択バーが出る。‖Chỉ chọn được dòng có trạng thái 予定・出荷待. Chọn thì hiện thanh chọn."),
    V("013", "AW_SCHD_003", "日・予定日（予定の表）", "Ngày dự kiến (bảng 予定)", "/ops/delivery/schedule?view=day&d=2026-11-17", day_items(False),
      note="予定の日（2026-11-17）。出荷だけで、基準の切替は出さない（Q8）。選択バーが常に出る。‖Ngày dự kiến (2026-11-17). Chỉ có 出荷, không hiện nút đổi cơ sở (Q8). Thanh chọn luôn hiện."),
    V("014", "AW_SCHD_003", "日・予定日 選択中", "Ngày dự kiến, đã chọn", "/ops/delivery/schedule?view=day&d=2026-11-17", day_items(False, selected=True),
      setup="await ready();chk(0);await sleep(400);",
      note="予定のチェックを入れた状態。‖Đã tick ô chọn của 予定."),
    # ---- 出荷データの移動（小窓）
    V("015", "AW_SCHD_004", "移動・初期表示（本発注の前・移動先未選択）", "Di chuyển, hiển thị ban đầu (trước 本発注, chưa chọn ngày đích)", OPEN_WEEK_DRAFT, move_items("first"),
      setup=PICK_ONE + OPEN_MOVE,
      note="予定の週で配送を1つ選んで「出荷データの移動」を押した。本発注の前なので青の案内。移動先を選ぶ前はエラーを出さない。‖Chọn 1 配送 ở tuần dự kiến rồi nhấn 「出荷データの移動」. Trước 本発注 nên hướng dẫn màu xanh. Chưa chọn ngày đích thì không hiện lỗi.", full=False),
    V("016", "AW_SCHD_004", "移動・移動先を選んだ（お届け日→新・出荷日→新・再送の表示）", "Di chuyển, đã chọn ngày đích (ngày giao/ngày xuất → mới, hiện gửi lại)", OPEN_WEEK_DRAFT, move_items("picked"),
      setup=PICK_ONE + OPEN_MOVE + CELL + "cell('2026-11-18').click();await sleep(900);",
      note="カレンダーの日を押して移動先を選んだ。表に「現在 → 新」と出荷日が出て、出荷指示を送ったあとの便は「再送（rev+1）」が付く。警告が出ることがある。‖Đã nhấn một ngày trên lịch. Bảng hiện 「hiện tại → mới」 và ngày xuất; chuyến đã gửi chỉ thị xuất kho có 「再送（rev+1）」. Có thể hiện cảnh báo.", full=False),
    V("017", "AW_SCHD_004", "移動・本発注の後の便（理由必須の案内）", "Di chuyển, chuyến sau 本発注 (hướng dẫn bắt buộc lý do)", OPEN_WEEK_FIXED, move_items("after"),
      setup="await ready();chk(0);await sleep(300);" + OPEN_MOVE,
      note="確定の週の配送を1つ選んで開いた。本発注を過ぎた便なので黄の案内「1便ずつ・理由が必要です」。見本の配送の状態は撮影のときに確かめる。‖Chọn 1 配送 ở tuần đã xác định rồi mở. Chuyến đã qua 本発注 nên hướng dẫn vàng 「1便ずつ・理由が必要です」. Trạng thái 配送 mẫu cần kiểm tra khi chụp.", full=False),
    V("018", "AW_SCHD_004", "移動・エラー「移動できません」（まとめて動かせない）", "Di chuyển, lỗi 「移動できません」 (không di chuyển gộp được)", OPEN_WEEK_FIXED, move_items("error"),
      setup="await ready();ALL();await sleep(400);" + OPEN_MOVE,
      note="本発注の後の便を複数選んだ（または倉庫が出荷できない日を選んだ）。赤の案内「まとめて動かせません」と、小窓の上部の赤いエラーの枠が出て、「確認して移動」は押せない。見本のデータで出なければ撮影のときに選び方を直す。‖Chọn nhiều chuyến sau 本発注 (hoặc chọn ngày kho không xuất được). Hiện hướng dẫn đỏ 「まとめて動かせません」 và khung lỗi, 「確認して移動」 không nhấn được. Nếu dữ liệu mẫu không cho ra lỗi thì sửa cách chọn khi chụp.", full=False),
    V("019", "AW_SCHD_004", "移動・トラブルの対応（別のサイクルへ）ON", "Di chuyển, bật 「トラブルの対応」 (sang chu kỳ khác)", OPEN_WEEK_FIXED, move_items("trouble"),
      setup="await ready();chk(0);await sleep(300);" + OPEN_MOVE + "const t=[...document.querySelectorAll('" + D4 + " .es-check')].find(x=>(x.textContent||'').includes('トラブルの対応'));if(t)t.querySelector('input').click();await sleep(500);",
      note="「トラブルの対応（別のサイクルへ）」にチェックを入れた。「対応するトラブル」の選択が出て、理由が必須になる。‖Đã tick 「トラブルの対応（別のサイクルへ）」. Hiện ô chọn 「対応するトラブル」 và lý do trở nên bắt buộc.", full=False),
    V("020", "AW_SCHD_004", "移動・第2ステップ（確認）「本当に移動しますか？お客様に確認済みですか？」", "Di chuyển, bước 2 (xác nhận) 「本当に移動しますか？お客様に確認済みですか？」", OPEN_WEEK_FIXED, confirm_items("holiday"),
      setup="await ready();chk(0);await sleep(300);" + OPEN_MOVE + "await sleep(500);" + TROUBLE_ON + CELL + "const h=cs.filter(x=>x.className.includes('--holiday'));(h.find(x=>x.title.startsWith('2026-11-03'))||h[0]).click();await sleep(900);clickText('" + D4 + " .es-dialog__foot .es-btn','確認して移動');await sleep(600);",
      note="移動先がお届けしない日（祝日・日曜・月曜）で「確認して移動」を押した。同じ小窓が第2ステップ（確認）に切り替わる（小窓は重ねない）。見本に選べる休みの日がなければ撮影のときに確かめる。‖Chọn ngày đích là ngày không giao (ngày lễ/Chủ Nhật/Thứ Hai) rồi nhấn 「確認して移動」: cùng cửa sổ chuyển sang bước 2 (xác nhận), không chồng cửa sổ. Nếu dữ liệu mẫu không có ngày nghỉ chọn được thì kiểm tra khi chụp.", full=False),
    V("021", "AW_SCHD_004", "移動・第2ステップ（確認）「別のサイクル・別の半分へ移動しますか？」", "Di chuyển, bước 2 (xác nhận) 「別のサイクル・別の半分へ移動しますか？」", OPEN_WEEK_FIXED, confirm_items("cross"),
      setup="await ready();chk(0);await sleep(300);" + OPEN_MOVE + "await sleep(500);" + TROUBLE_ON + CELL + "(cs.find(x=>x.title.startsWith('2026-10-27'))||cs[cs.length-1]).click();await sleep(900);clickText('" + D4 + " .es-dialog__foot .es-btn','確認して移動');await sleep(600);",
      note="同じ小窓が第2ステップ（確認）に切り替わる（小窓は重ねない）。トラブルの対応にチェックを入れ、別のサイクル（または別の半分）の日を選び、トラブルと理由を入れて「確認して移動」を押した。見本の配送・トラブルによっては選び方を撮影のときに直す。‖Cùng cửa sổ chuyển sang bước 2 (xác nhận), không chồng cửa sổ. Bật 「トラブルの対応」, chọn ngày thuộc chu kỳ khác (hoặc nửa khác), chọn sự cố và nhập lý do rồi nhấn 「確認して移動」. Tùy 配送/sự cố mẫu mà cách chọn khi chụp có thể phải sửa.", full=False),
    # ---- 変更申請（小窓）
    V("022", "AW_SCHD_005", "変更申請 一覧（小窓）", "Yêu cầu thay đổi, danh sách (cửa sổ)", "/ops/delivery/schedule", cr_list_items(),
      setup="clickText('.es-pagehead__actions .hl','変更申請');await sleep(700);",
      note="ヘッダーの「変更申請（n件）」を押した。判定が「問題なし」の行は初期でチェック済み。‖Đã nhấn 「変更申請（n件）」 ở đầu trang. Dòng 判定 「問題なし」 mặc định đã tick.", full=False),
    V("023", "AW_SCHD_005", "変更申請 一覧 0件", "Yêu cầu thay đổi, 0 dòng", "/ops/delivery/schedule", cr_list_items(empty=True),
      setup="clickText('.es-pagehead__actions .hl','変更申請');await sleep(700);setSel('システム判定','提案中（法人の返事待ち）');setSel('便種別','COOL便');clickText('" + D5 + " .es-search button','検索');await sleep(500);",
      note="条件に合う申請がない。表の中に I01 を出す（見本のデータで0件にならなければ撮影のときに条件を直す）。‖Không có đơn nào khớp điều kiện. Hiện I01 trong bảng (nếu dữ liệu mẫu không cho 0 dòng thì sửa điều kiện khi chụp).", full=False),
    V("024", "AW_SCHD_005", "変更申請一括承認（確認）", "Duyệt hàng loạt yêu cầu thay đổi (xác nhận)", "/ops/delivery/schedule", cr_approve_items(),
      setup="clickText('.es-pagehead__actions .hl','変更申請');await sleep(700);clickText('" + D5 + " .es-dialog__foot .es-btn','一括承認');await sleep(600);",
      note="一覧で「一括承認（n件）」を押した。承認する申請の確認。‖Nhấn 「一括承認（n件）」 ở danh sách. Màn xác nhận các đơn sẽ duyệt.", full=False,
      ),
    V("025", "AW_SCHD_005", "一括承認の完了（トースト）", "Hoàn tất duyệt hàng loạt (toast)", "/ops/delivery/schedule", cr_done_items(),
      setup="clickText('.es-pagehead__actions .hl','変更申請');await sleep(700);clickText('" + D5 + " .es-dialog__foot .es-btn','一括承認');await sleep(600);clickText('" + D5A + " .es-dialog__foot .es-btn','一括承認');await sleep(900);",
      note="「一括承認」を押して承認した。見本のデータを動かすので、撮影のあとはデータを見本に戻す（撮影の始めに戻る）。‖Đã nhấn 「一括承認」. Dữ liệu mẫu bị thay đổi nên sau khi chụp phải khôi phục (tự khôi phục ở đầu lần chụp sau).", full=False),
    V("026", "AW_SCHD_003", "日・確定日 納品・配送基準", "Ngày đã xác định, cơ sở 納品・配送", "/ops/delivery/schedule?view=day&d=2026-10-05", day_items(True),
      setup="clickText('.es-search .es-seg__item','納品・配送');await sleep(500);",
      note="決定（Q8＝A）で足した状態。確定の日で基準を「納品・配送」にした。その日に届ける配送を納品日順に出し、ドライバー未設定の要対応を納品日で見られる。コードの基準ボタンは何もしないので、この状態は実装後に撮る（宿題）。‖Trạng thái thêm theo quyết định (Q8 = A). Ở ngày đã xác định chuyển cơ sở sang 「納品・配送」: hiện các 配送 giao trong ngày theo ngày giao, xem được 要対応 chưa gán tài xế theo ngày giao. Nút cơ sở trong code không làm gì nên trạng thái này chụp sau khi đã làm (bài tập)."),
]


VIEWS += [
    V("027", "AW_SCHD_006", "資材・月（資材便の一覧）", "Thẻ 資材, tháng (danh sách chuyến 資材)", "/ops/delivery/schedule?kind=material", material_items(),
      note="スケジュールの別タブ「資材」。資材便は食品の配送と別に表示し、食品の件数には含めない・日付はここで動かさない。コードにまだないので、この状態は実装後に撮る（宿題）。‖Thẻ riêng 「資材」 của lịch. Chuyến 資材 hiển thị riêng với thực phẩm, không tính vào số chuyến thực phẩm, không đổi ngày ở đây. Code chưa có nên trạng thái này chụp sau khi đã làm (bài tập)."),
    V("028", "AW_SCHD_006", "資材・予定の月（資材便は出ない）", "Thẻ 資材, tháng dự kiến (không có chuyến 資材)", "/ops/delivery/schedule?kind=material&d=2026-11", material_items(plan=True),
      note="予定の月（2026-11）を開いた状態。資材便は予定の月には出ないので、表を出さずに案内（I192）だけを出す。コードにまだないので、この状態は実装後に撮る（宿題）。‖Trạng thái mở tháng dự kiến (2026-11). Chuyến 資材 không hiện ở tháng dự kiến nên không hiện bảng mà chỉ hiện hướng dẫn (I192). Code chưa có nên trạng thái này chụp sau khi đã làm (bài tập)."),
    V("029", "AW_SCHD_001", "月・経理（参照のみ）", "Tháng, 経理 (chỉ xem)", "/ops/delivery/schedule", add_top(month_items(), READONLY), login="Ad00012",
      note="経理（Ad00012）で開いた状態。「配送サイクル設定」のボタンが出ない（週・日でも同じ。選択バーの「出荷データの移動」・変更申請の「一括承認」も出ない）。CSV出力は出る。‖Trạng thái mở bằng 経理 (Ad00012). Không hiện nút 「配送サイクル設定」 (ở tuần・ngày cũng vậy; cũng không hiện 「出荷データの移動」 ở thanh chọn và 「一括承認」 ở yêu cầu thay đổi). CSV出力 vẫn hiện."),
    V("030", "AW_SCHD_001", "月・検索の入力エラー（キーワードが長すぎる）", "Tháng, lỗi nhập khi tìm kiếm (từ khóa quá dài)", "/ops/delivery/schedule", only(month_items(), "3"),
      setup="const i=document.querySelector('.es-search input[placeholder^=\"法人ID\"]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(i,'あ'.repeat(61));i.dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('.es-search button[type=submit]').click();await sleep(400);", full=False,
      note="キーワードに61字入れて「検索」を押した状態。E04 を欄の下に出し、一覧は前の結果のまま（検索しない）。週・日の同じ欄も同じ。‖Trạng thái nhập 61 ký tự vào từ khóa rồi nhấn 「検索」. Hiện E04 dưới ô, danh sách giữ kết quả cũ (không tìm). Ô tương tự ở tuần・ngày cũng vậy."),
    V("031", "AW_SCHD_003", "日・読み込み中／読み込み失敗", "Ngày, đang tải / tải thất bại", "/ops/delivery/schedule?view=day&d=2026-10-05", only(add_top(day_items(True), LOADING), "6", "8"), full=False,
      note="日の表の読み込み中（I103）と、読み込めなかったとき（W103）。表の見出し・検索条件はそのまま。コードにまだないので、この状態は実装後に撮る（宿題）。‖Khi đang tải bảng ngày (I103) và khi tải thất bại (W103). Tiêu đề bảng・điều kiện tìm kiếm giữ nguyên. Code chưa có nên trạng thái này chụp sau khi đã làm (bài tập)."),
    V("032", "AW_SCHD_006", "資材・0件", "Thẻ 資材, 0 dòng", "/ops/delivery/schedule?kind=material", only(material_items(), "5"), full=False,
      setup="const i=document.querySelector('.es-search input[type=text]');if(i){Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(i,'該当なし');i.dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('.es-search button[type=submit]').click();await sleep(400);}",
      note="資材便が1件もない（検索条件に合う便がない）とき。表の中に I01 を出す。コードにまだないので、この状態は実装後に撮る（宿題）。‖Khi không có chuyến 資材 nào (không có chuyến khớp điều kiện). Hiện I01 trong bảng. Code chưa có nên trạng thái này chụp sau khi đã làm (bài tập)."),
]


# ---------------------------------------------------------------- 画面にその状態では出ない番号（sel を "-" にする。撮影で「見つからない」にしない）
# 条件つきの項目（その状態の操作では出ない）と、見本のデータでは出ない項目。定義（番号・詳細）は変えない
_SEED_MORE = "見本のデータには、1日に出せる数（確定16・予定12）を超える日がないため、この画面には出ない（コードには「ほか n件」の表示がある）‖Dữ liệu mẫu không có ngày nào vượt số hiển thị tối đa (đã xác định 16, dự kiến 12) nên màn này không hiện (code có hiển thị 「ほか n件」)"
_SEED_UNASSIGNED = "見本の週には、ドライバー未割当の配送がないため、バッジが出ない（コードは未割当があれば出す）‖Tuần mẫu không có 配送 chưa gán tài xế nên badge không hiện (code sẽ hiện nếu có chưa gán)"
_COND = None   # 条件つきで、その状態では出ない（理由は項目の cond・detail に書いてある）
ABSENT = {
    "005": {"4.1.4": _COND, "4.1.8": _SEED_MORE},
    "006": {"4.1.4": _SEED_UNASSIGNED, "4.1.8": _SEED_MORE},
    "007": {"4.1.4": _COND, "4.1.8": _SEED_MORE},
    "008": {"4.1.7": _SEED_MORE},
    "009": {"4.1.7": _SEED_MORE},
    "011": {"6.2": _COND, "6.3": _COND, "6.4": _COND, "6.5": _COND},
    "015": {"1.7": _COND, "1.10": _COND, "1.2": _COND, "1.12": _COND, "1.13": _COND},
    "016": {"1.10": _COND, "1.2": _COND, "1.12": _COND, "1.13": _COND},
    "017": {"1.7": _COND, "1.10": _COND, "1.12": _COND, "1.13": _COND},
    "018": {"1.7": _COND, "1.10": _COND, "1.12": _COND, "1.13": _COND},
    "019": {"1.7": _COND, "1.12": _COND, "1.13": _COND},
    "029": {"1.4": _COND},
    "023": {"1.4.1": _COND, "1.4.2": _COND, "1.4.3": _COND, "1.4.10": _COND, "1.4.11": _COND},
}
for _v in VIEWS:
    _a = ABSENT.get(_v["id"], {})
    for _it in _v["items"]:
        if _it["no"] in _a:
            _it["sel"] = "-"
            if _a[_it["no"]] and "demo_ok" not in _it:
                _it["demo_ok"] = T(_a[_it["no"]])
