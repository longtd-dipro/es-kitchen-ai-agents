# -*- coding: utf-8 -*-
"""
法人Web 契約の申請（CW_CREQ）。法人B1 の「申請 ＞ 契約の申請」。
元は本物の Web（app/corp/requests/contract/{page,new/page,[no]/page}.tsx・app/corp/sites/_components/{RequestList,ApplyForm,parts}.tsx・
lib/corp/sites/{logic,fromDomain,types}.ts・lib/corp/areas/corp-sites.ts）。
決定の正：docs/決定台帳.md、docs/01_仕様/30_申請/申請・承認.md（§3 共通ルール・§5 法人Webの画面・§6 種類ごとの決まり・§9 権限）、
入力チェック仕様_申込フォーム_20261001.md（凍結）、Message List（WEB の CSV の写し）。
範囲：契約の申請の一覧（001）・申請の詳細（002）・変更のお申し込み（003・8種類の手続き）。
範囲外：お届け日の変更（/corp/requests）＝別機能、拠点管理（/corp/sites）＝法人B1 の別ファイル、拠点を追加（/corp/sites/new）。
確認メモ：docs/05_画面設計書/確認メモ_法人B1_契約の申請.md
注意：vi（ベトナム語）と ex の説明は未記入（手順3：最後にまとめて翻訳）。撮影（--capture）は未実施＝sel はコードのクラス名から書いた予定の値。
"""

TITLE = ["契約の申請（CW_CREQ）", "Yêu cầu hợp đồng (CW_CREQ)"]
SHEET = ["契約の申請", "Yêu cầu hợp đồng"]
BASENAME = "画面設計書_CW_CREQ_契約の申請"
IMG_PREFIX = "CW_CREQ"
OUT_DIR = "CW_CREQ_契約の申請"
CODE_NOTE = ["Screen Code は規約（画面コード規約_20261005）：CW_<4文字>_<3桁>。001 一覧／002 詳細／003 変更のお申し込み（状態＝ステップ・手続きは VIEWS の id）", "Screen Code theo quy ước: CW_<4 chữ>_<3 chữ số>. 001 danh sách / 002 chi tiết / 003 đăng ký thay đổi (trạng thái = bước, thủ tục là id của VIEWS)"]
SITE = "corp"
SYSTEM = {"ja": "法人Web", "vi": "Web pháp nhân (法人Web)"}
AUTHOR = "Claude／確認：hong"
CREATED = "2026-10-08"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "corp", "loginId": "CU00001"}
CODE_PATHS = ["app/corp/requests/contract", "app/corp/sites/_components", "lib/corp/sites", "lib/corp/areas/corp-sites.ts", "lib/domain/seed"]

DECISIONS = [
    # ---- 既存の決定（台帳・仕様）をこの画面に当てはめたもの
    {"date": "2026-10-05", "target": "CW_CREQ_001 No.1.1・No.4",
     "q": ["申請の一覧は拠点アカウントでどこまで見えるか", "Tài khoản chi nhánh thấy được đến đâu trong danh sách yêu cầu"],
     "a": ["法人アカウント＝自社のすべての拠点の申請／拠点アカウント＝自分の拠点の申請だけ。法人アカウントが出した申請は拠点アカウントから取り下げられない", "Tài khoản pháp nhân = mọi yêu cầu của công ty / tài khoản chi nhánh = chỉ yêu cầu của chi nhánh mình. Chi nhánh không rút được yêu cầu do pháp nhân gửi"],
     "src": "台帳 E「法人アカウントと拠点アカウント」・申請・承認 §5-1・§3-4 (H2・H4)"},
    {"date": "2026-10-05", "target": "CW_CREQ_001 No.6.1",
     "q": ["申請の状態「対応中 n/m」の数え方は法人Webでどう出すか", "Trạng thái 「対応中 n/m」 hiển thị thế nào ở 法人Web"],
     "a": ["法人Web は今のまま拠点ごとの状態を出す（運営だけが「対応中 n/m」）", "法人Web hiện trạng thái theo từng chi nhánh như hiện tại (chỉ 運営 có 「対応中 n/m」)"],
     "src": "台帳 B「申請の状態『対応中 n/m』の数え方」（hong 2026-10-05・No.42）"},
    {"date": "2026-10-06", "target": "CW_CREQ_003 No.3.4",
     "q": ["休止の通算の上限と、休止中の最低利用期間の数え方", "Giới hạn tổng thời gian tạm dừng và cách đếm thời gian sử dụng tối thiểu"],
     "a": ["通算12ヶ月まで（残り月数を超える期間は選べない）。引き揚げた設備も、設置し直したときに休止前の残りを引き継ぐ（数え直さない）", "Tối đa 12 tháng cộng dồn (không chọn được kỳ hạn vượt số tháng còn lại). Thiết bị đã thu hồi cũng kế thừa phần còn lại trước khi tạm dừng khi lắp lại"],
     "src": "申請・承認 §6-6（hong 2026-10-06 A-1）・台帳「休止と最低利用期間」"},
    {"date": "2026-10-08", "target": "CW_CREQ_003 No.8.3",
     "q": ["解約のとき残った在庫は買取か返却か、だれが選ぶか", "Khi hủy hợp đồng, tồn kho còn lại là mua lại hay trả lại, ai chọn"],
     "a": ["法人が解約の申請のときに選び、運営（システム管理）が確定する", "Pháp nhân chọn khi gửi yêu cầu hủy, 運営 (quản trị hệ thống) xác nhận"],
     "src": "申請・承認 §6-8（hong 2026-10-08・受付簿 #197）"},
    {"date": "2026-10-03", "target": "CW_CREQ_003 No.4",
     "q": ["確認の画面で選ぶ「お申し込み者」と受付完了メールの送り先", "Người gửi chọn ở màn xác nhận và nơi gửi email hoàn tất"],
     "a": ["共有アカウントなので、送るときにご担当者から「お申し込み者」を選ぶ（必須）。受付完了メールはお申し込み者とメイン担当者の両方へ", "Vì dùng chung tài khoản nên khi gửi phải chọn 「お申し込み者」 từ người phụ trách (bắt buộc). Email hoàn tất gửi cho cả người gửi và người phụ trách chính"],
     "src": "申請・承認 §3-1・メール一覧 M1（法人Web §1-2）"},
    {"date": "2026-10-08", "target": "CW_CREQ_003（休止）No.4.1",
     "q": ["休止の理由の文言（仕様は6択・コードは5つ）", "Nội dung lý do tạm dừng (spec 6 lựa chọn, code 5)"],
     "a": ["5つのまま。『その他』は追記可（詳しくお聞かせください欄に書き足す）", "Giữ 5 lựa chọn. 『その他』 được ghi thêm (ở ô 詳しくお聞かせください)"],
     "src": "hong 回答 2026-10-08（確認メモ_法人B1 休止の理由）"},
    {"date": "2026-10-08", "target": "CW_CREQ_003（解約）No.4.2〜4.2.2",
     "q": ["解約の理由の選択肢と引き止めシナリオ（客先のベース待ち・B11）", "Lựa chọn lý do hủy và kịch bản giữ khách (chờ bản gốc khách, B11)"],
     "a": ["引き止めシナリオ案を採用（案）：理由7つ必須→理由に応じた案内→『プラン変更を申請／担当者に相談／そのまま解約を続ける』→続けるなら運営がヒアリングのうえ承認。文面は青山様のベースをもとに調整。従業員（エンドユーザー）の評価が低いときは、運営がヒアリング時に参照できるよう運営画面に評価を表示する案", "Áp dụng phương án kịch bản giữ khách (phương án): bắt buộc chọn 1 trong 7 lý do → hướng dẫn theo lý do → 『プラン変更を申請／担当者に相談／そのまま解約を続ける』 → nếu tiếp tục hủy thì 運営 phỏng vấn rồi duyệt. Câu chữ chỉnh theo bản gốc anh Aoyama. Nếu đánh giá của nhân viên (người dùng cuối) thấp, hiện đánh giá trên màn hình 運営 để tham khảo khi phỏng vấn"],
     "src": "hong 回答 2026-10-08（チャット『引き止めシナリオ案』）・仕様 §13 B11"},
    {"date": "2026-10-08", "target": "CW_CREQ_003（配送の変更）No.4.3",
     "q": ["配送回数を標準より減らしたとき料金は下がるか", "Giảm số lần giao dưới mức tiêu chuẩn thì có giảm phí không"],
     "a": ["下がらない（割引にならない）。注記に『減らしても料金は下がりません』と書く（B6）", "Không giảm (không được giảm giá). Ghi chú 『減らしても料金は下がりません』 (B6)"],
     "src": "hong 回答 2026-10-08（D2）・申請・承認 §13 B6"},
    # ---- hong 回答 2026-10-08（確認メモ_法人B1 Q1〜Q8・台帳 F「法人Web 契約の申請」）
    {"date": "2026-10-08", "target": "CW_CREQ_001 No.3.3・CW_CREQ_002 No.2.7",
     "q": ["法人Web の申請の状態名（コード：ESキッチンが確認中／承認／お受けできませんでした／取り下げ／ご契約開始済み）", "Tên trạng thái yêu cầu ở 法人Web (code: ESキッチンが確認中 / 承認 / お受けできませんでした / 取り下げ / ご契約開始済み)"],
     "a": ["コードの5つのまま。「ご契約開始済み」＝承認のあと、開始のご利用月が始まったら", "Giữ 5 tên như code. 「ご契約開始済み」 = sau khi duyệt, khi tháng sử dụng bắt đầu"],
     "src": "hong 回答 2026-10-08（確認メモ_法人B1 Q1・提案どおり）"},
    {"date": "2026-10-08", "target": "CW_CREQ_001 No.1.1・No.1.2",
     "q": ["解約後（参照のみ）の契約の申請の一覧とボタン", "Danh sách yêu cầu hợp đồng và các nút khi đã hủy hợp đồng (chỉ xem)"],
     "a": ["一覧は見られる。「変更のお申し込み」「拠点を追加」は出さない。サーバーも断る（E345）", "Xem được danh sách. Không hiện nút 「変更のお申し込み」 「拠点を追加」. Server cũng từ chối (E345)"],
     "src": "hong 回答 2026-10-08（Q2＝A）"},
    {"date": "2026-10-08", "target": "CW_CREQ_003 No.4（ステップ2）",
     "q": ["選べない拠点（承認待ち）の理由の文", "Câu lý do của chi nhánh không chọn được (đang chờ duyệt)"],
     "a": ["Message List の文（E332）に受付番号を足す。リンクは付けない", "Dùng câu của Message List (E332) kèm số tiếp nhận. Không gắn link"],
     "src": "hong 回答 2026-10-08（Q3＝A）"},
    {"date": "2026-10-08", "target": "CW_CREQ_002 No.6.1（添付）",
     "q": ["添付ファイルを変更のお申し込みにも入れるか", "Có đưa tệp đính kèm vào cả 変更のお申し込み không"],
     "a": ["全手続きの入力欄にはしない。お客様が申請の詳細から添付を追加・変更でき、運営には画面のお知らせだけ（メールなし・承認は要らない）。確認中でも承認後でもいつでも追加・変更できる。1つ5MBまで・10件まで", "Không đưa vào ô nhập của mọi thủ tục. Khách thêm / sửa tệp đính kèm từ chi tiết yêu cầu vào bất kỳ lúc nào; chỉ thông báo cho 運営 (không cần duyệt). Tối đa 5MB/tệp, 10 tệp"],
     "src": "hong 回答 2026-10-08（Q4：提案 B を変更。続きの返信で『全部につけなくてよい・追加変更可・運営に通知だけ』）"},
    {"date": "2026-10-08", "target": "CW_CREQ_003 No.4.3（拠点情報・法人情報）・No.4.6（配送の変更）",
     "q": ["変更するものを選ばないときの文", "Câu khi không chọn mục cần thay đổi"],
     "a": ["Message List の文（E336）にそろえる", "Dùng câu của Message List (E336)"],
     "src": "hong 回答 2026-10-08（Q5＝A）"},
    {"date": "2026-10-08", "target": "CW_CREQ_003（再開）No.4.3",
     "q": ["再開の中で納品先・担当者・プランを直せるか", "Khi mở lại có sửa được nơi giao, người phụ trách, gói không"],
     "a": ["「変更あり」のときはご要望欄に書いてもらう（入力欄は足さない）", "Khi chọn 「変更あり」 thì ghi vào ô yêu cầu (không thêm ô nhập)"],
     "src": "hong 回答 2026-10-08（Q6＝B）"},
    {"date": "2026-10-08", "target": "CW_CREQ_003（設備の変更）No.4.2〜4.7",
     "q": ["設備の変更の入力", "Phần nhập của thay đổi thiết bị"],
     "a": ["仕様どおりに画面を直す：追加／回収／機種変更（サイズアップ）・対象はいまの設備から選ぶ・台数は1以上でいまの台数まで・希望日・設置代行（OP000007）", "Sửa màn hình theo spec: thêm / thu hồi / đổi máy (nâng cỡ), chọn thiết bị đang dùng, số lượng từ 1 đến số hiện có, ngày mong muốn, lắp đặt hộ (OP000007)"],
     "src": "hong 回答 2026-10-08（Q7＝A）"},
    {"date": "2026-10-08", "target": "CW_CREQ_002 No.7",
     "q": ["新規のお申し込み（AP-）・拠点を追加の申請を法人Webから取り下げられるか", "Có cho rút lại đơn mới (AP-) / thêm chi nhánh từ 法人Web không"],
     "a": ["出さない（今のまま）。取り下げたいときは ESキッチンへ連絡。運営の操作に限る", "Không hiện (giữ nguyên). Muốn rút lại thì liên hệ ESキッチン. Chỉ thao tác của 運営"],
     "src": "hong 回答 2026-10-08（Q8＝B）"},
]

CHANGES = []

HIDE_ALWAYS = [".es-demo-bar", ".es-chatbot", ".es-chatbot__fab", "#es-review"]
STATIC_CSS = ".corp{height:auto!important}.corp-main{overflow:visible!important}.es-sidenav{height:auto!important;min-height:100vh}"
VIEWER_CSS = STATIC_CSS

SCREENS = [
    {"code": "CW_CREQ_001", "ja": "契約の申請の一覧", "vi": "Danh sách yêu cầu hợp đồng"},
    {"code": "CW_CREQ_002", "ja": "申請の詳細", "vi": "Chi tiết yêu cầu"},
    {"code": "CW_CREQ_003", "ja": "変更のお申し込み", "vi": "Đăng ký thay đổi"},
]

# ---- 画面操作（撮影用の setup）。次へ進む／戻るなどはボタンの文字で探す
_CLICK = ("const clickBtn=async(t)=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.trim().includes(t)&&!x.disabled);"
          "if(b){b.click();await new Promise(r=>setTimeout(r,400));}};")
_NEXT = _CLICK + "await clickBtn('次へ進む');"
_NEXT_ERR = _CLICK + "await clickBtn('次へ進む');"      # 何も入れずに押す＝入力チェック
_OPEN_FIRST = ("const a=document.querySelector('tbody td.es-mono a, tbody td.es-mono button'); if(a){a.click();} await new Promise(r=>setTimeout(r,500));")


_PICK = ("const pick=async(opt)=>{const s=[...document.querySelectorAll('select')].find(x=>[...x.options].some(o=>o.text.includes(opt)));"
         "if(s){const o=[...s.options].find(o=>o.text.includes(opt)); Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(s,o.value); s.dispatchEvent(new Event('change',{bubbles:true}));} await new Promise(r=>setTimeout(r,400));};")


def _tab(no, ja, vi, sel, detail, dvi="", err=None, **kw):
    d = {"no": no, "ja": ja, "vi": vi, "sel": sel, "kind": "tab", "trig": "click", "pattern": "P-TAB", "detail": [detail, dvi]}
    if err:
        d["err"] = err
    d.update(kw)
    return d


def I(no, ja, sel, kind, trig, detail, vi="", dvi="", **kw):
    """項目。vi＝項目名のベトナム語、dvi＝detail のベトナム語。cond・init・open・ex は [日本語, ベトナム語] で渡す"""
    d = {"no": no, "ja": ja, "vi": vi, "sel": sel, "kind": kind, "trig": trig, "detail": [detail, dvi]}
    for k, v in kw.items():
        if k in ("cond", "init", "demo_ok", "open") and isinstance(v, str):
            v = [v, ""]
        if k == "ex":
            v = [v, ""] if isinstance(v, str) else v
        d[k] = v
    return d


# 申請の種類ごとの「ご希望の内容」の欄（状態 013〜020 で共通の外枠は 012 に書く）
_PAGEHEAD = I("1", "パンくず・タイトル・対象のまとめ", ".es-pagehead", "label", "view",
              "パンくず＝「申請 ＞ 変更のお申し込み」（「申請」を押すと契約の申請の一覧へ。途中まで入れていれば Q02 を出す）。見出し「変更のお申し込み」。右に「法人 {法人名}／お手続き {手続き名}／対象 {n}拠点（法人情報は『法人』）」を出す", err=["Q02"],
              vi="Breadcrumb, tiêu đề, tóm tắt đối tượng",
              dvi="Breadcrumb = 「申請 ＞ 変更のお申し込み」 (bấm 「申請」 sẽ về danh sách yêu cầu hợp đồng; nếu đã nhập dở thì hiện Q02). Tiêu đề 「変更のお申し込み」. Bên phải hiện 「法人 {tên pháp nhân}／お手続き {tên thủ tục}／対象 {n}拠点 (thông tin pháp nhân hiện là 『法人』)」")
_STEPS = I("2", "ステップの表示", ".cb-steps", "area", "view",
           "5段階：1. お手続きを選ぶ → 2. 対象の拠点を選ぶ → 3. ご希望の内容 → 4. ご入力内容の確認 → 5. お申し込み完了。それぞれ「未入力／ご入力中／完了」を表示（押しても移動しない。戻るのは下の「戻る」だけ）", pattern="P-STEPPER",
           vi="Hiển thị các bước",
           dvi="5 bước: 1. お手続きを選ぶ → 2. 対象の拠点を選ぶ → 3. ご希望の内容 → 4. ご入力内容の確認 → 5. お申し込み完了. Mỗi bước hiện 「未入力／ご入力中／完了」 (bấm vào không chuyển bước; chỉ quay lại được bằng nút 「戻る」 ở dưới)")
_CYCLE_NOTE = I("3", "締切の案内", ".es-inline--warning", "label", "view",
                "「契約に関するお申し込みは、ご注文と同じ締切です。」本日の日付・直近で締切を過ぎたご利用月の件数・いちばん早く反映できるご利用月（申込締切の日）を出す。締切（前月15日）までのお申し込み＝翌月のご利用月から、過ぎると翌々月から（台帳 B）", err=["I217"],
                vi="Thông báo hạn chót",
                dvi="「契約に関するお申し込みは、ご注文と同じ締切です。」 Hiện ngày hôm nay, số tháng sử dụng vừa quá hạn gần đây, và tháng sử dụng sớm nhất áp dụng được (ngày hạn đăng ký). Đăng ký trước hạn (ngày 15 tháng trước) = áp dụng từ tháng sử dụng kế tiếp, quá hạn thì từ tháng sau nữa (sổ cái B)")
_FOOT = I("9", "下部のボタン", ".cb-foot", "area", "view",
          "左に注記、右に「戻る」「次へ進む」（確認の画面は「この内容でお申し込みする」）。解約のときは主ボタンを赤（negative）にする。ステップ1の「戻る」は「拠点一覧へ戻る」（拠点管理へ。途中まで入れていれば Q02）", err=["Q02"],
          vi="Nút phía dưới",
          dvi="Bên trái là ghi chú, bên phải là 「戻る」「次へ進む」 (màn xác nhận là 「この内容でお申し込みする」). Khi hủy hợp đồng, nút chính màu đỏ (negative). 「戻る」 ở bước 1 là 「拠点一覧へ戻る」 (về quản lý chi nhánh; nếu đã nhập dở thì hiện Q02)")


def _site_title(no):
    return I(no, "拠点ごとのカード", ".cb-stack section.es-card", "card", "view",
             "対象の拠点ごとに1枚。見出し＝拠点名＋ご契約番号＋プラン（法人情報の変更は法人名＋法人ID）。右上に手続き名のバッジ。複数拠点のときは拠点ごとに開始したいご利用月と中身を入れる",
             vi="Thẻ từng chi nhánh",
             dvi="Mỗi chi nhánh đối tượng 1 thẻ. Tiêu đề = tên chi nhánh + số hợp đồng + gói (đổi thông tin pháp nhân = tên pháp nhân + ID pháp nhân). Góc trên phải có nhãn tên thủ tục. Khi có nhiều chi nhánh, nhập tháng sử dụng muốn bắt đầu và nội dung riêng cho từng chi nhánh",
             ex=["CU00643 本社（100プラン）", "Ví dụ tiêu đề thẻ: số hợp đồng, tên chi nhánh, gói (chỉ hiển thị, không nhập)"])


def _cyc(no, label="開始したいご利用月", vi="Tháng sử dụng muốn bắt đầu"):
    return I(no, label, "select", "select", "select",
             "必須。選べるのは、いま反映できるご利用月（締切を過ぎたものは出さない）。いちばん早い月が初期値。注記＝「締切までのお申し込みは翌月のご利用月から、締切を過ぎると翌々月からの反映です。いちばん早くて {月}です。」",
             vi=vi,
             dvi="Bắt buộc. Chỉ chọn được các tháng sử dụng áp dụng được hiện tại (không hiện tháng đã quá hạn). Tháng sớm nhất là giá trị ban đầu. Ghi chú = 「締切までのお申し込みは翌月のご利用月から、締切を過ぎると翌々月からの反映です。いちばん早くて {月}です。」",
             req="○", ex=["2026年11月", "Tháng sử dụng bắt đầu áp dụng (năm và tháng)"],
             init=["いちばん早く反映できるご利用月", "Tháng sử dụng sớm nhất áp dụng được"], err=["E02"])


def _why(no, label, ph, req="－", vi="", exd=""):
    return I(no, label, "textarea", "textarea", "input", "複数行（3行）。" + ("必須。" if req == "○" else "任意。") + "プレースホルダ＝「" + ph + "」。最大500文字（仕様 3-1）。超えると E04（自動で切り詰めない）",
             vi=vi,
             dvi="Nhiều dòng (3 dòng). " + ("Bắt buộc. " if req == "○" else "Không bắt buộc. ") + "Placeholder = 「" + ph + "」. Tối đa 500 ký tự (spec 3-1). Vượt quá thì hiện E04 (không tự cắt)",
             req=req, len="文字列 500", ex=[ph.replace("例）", ""), exd], err=["E04"])


def _pick(items, *nos):
    return [x for x in items if x["no"] in nos]


def _ro(no, label, detail, vi="", dvi="", **kw):
    return I(no, label, "-", "label", "view", detail, vi=vi, dvi=dvi, **kw)


# ---------------------------------------------------------------- 001 一覧
L_ITEMS = [
    I("1", "パンくず・タイトル・対象アカウント", ".es-pagehead", "label", "view",
      "パンくず「申請 ＞ 契約の申請」。見出し「申請」。右に「{法人名}／権限：法人アカウント（自社のすべての拠点）または 拠点アカウント（この拠点だけ）」",
      vi="Breadcrumb, tiêu đề, tài khoản đối tượng",
      dvi="Breadcrumb 「申請 ＞ 契約の申請」. Tiêu đề 「申請」. Bên phải hiện 「{tên pháp nhân}／権限：tài khoản pháp nhân (mọi chi nhánh của công ty) hoặc tài khoản chi nhánh (chỉ chi nhánh này)」"),
    I("1.1", "拠点を追加", "button::拠点を追加", "button", "click",
      "法人アカウントだけに出す（拠点アカウントには出さない）。押すと拠点を追加の画面（/corp/sites/new）へ", cond=["法人アカウントのみ", "Chỉ tài khoản pháp nhân"],
      vi="Thêm chi nhánh",
      dvi="Chỉ hiện với tài khoản pháp nhân (không hiện với tài khoản chi nhánh). Bấm để sang màn hình thêm chi nhánh (/corp/sites/new)"),
    I("1.2", "変更のお申し込み", "button::変更のお申し込み", "button", "click",
      "押すと変更のお申し込み（CW_CREQ_003）のステップ1へ。主ボタン",
      vi="Đăng ký thay đổi",
      dvi="Bấm để sang bước 1 của đăng ký thay đổi (CW_CREQ_003). Là nút chính"),
    _tab("2", "タブ（お届け日の変更／契約の申請）", "Tab (đổi ngày giao / yêu cầu hợp đồng)", ".es-tabs",
         "「お届け日の変更」は /corp/requests（別機能）へ移動。「契約の申請」は選択中。契約の申請のタブには、ESキッチンが確認中の申請の件数をバッジで出す（0件なら出さない）",
         dvi="「お届け日の変更」 chuyển sang /corp/requests (chức năng khác). 「契約の申請」 đang được chọn. Ở tab yêu cầu hợp đồng hiện huy hiệu số yêu cầu 「ESキッチンが確認中」 (0 thì không hiện)"),
    I("3", "検索エリア", ".es-search", "area", "view", "「検索」を押すか Enter で絞り込む。入力しただけでは絞り込まない", pattern="P-LIST",
      vi="Vùng tìm kiếm",
      dvi="Bấm 「検索」 hoặc Enter để lọc. Chỉ nhập thôi thì chưa lọc"),
    I("3.1", "キーワード", "input[placeholder=\"受付番号・拠点ID・拠点名\"]", "text", "input",
      "受付番号・拠点ID・拠点名を部分一致で探す（3つをつないだ文字に対する部分一致）", req="－", len="文字列 60", ex=["CU00871", "ID chi nhánh. Nhập số tiếp nhận, ID chi nhánh hoặc tên chi nhánh"], err=["E04"],
      vi="Từ khóa",
      dvi="Tìm khớp một phần theo số tiếp nhận, ID chi nhánh, tên chi nhánh (khớp một phần trên chuỗi nối cả ba)"),
    I("3.2", "申請の種類", "select@1", "select", "select",
      "選択肢＝新規のお申し込み／拠点を追加／プランの変更／配送の変更／設備の変更／休止／再開／解約／拠点情報の変更／法人情報の変更（コードの10種類）",
      req="－", ex=["プランの変更", "Một loại yêu cầu trong danh sách lựa chọn"],
      vi="Loại yêu cầu",
      dvi="Lựa chọn = 新規のお申し込み／拠点を追加／プランの変更／配送の変更／設備の変更／休止／再開／解約／拠点情報の変更／法人情報の変更 (10 loại theo code)"),
    I("3.3", "承認状態", "select@2", "select", "select",
      "選択肢＝ESキッチンが確認中／承認／お受けできませんでした／取り下げ／ご契約開始済み。名前は台帳のとおり（2026-10-08 hong）",
      req="－", ex=["ESキッチンが確認中", "Một trạng thái duyệt trong danh sách lựa chọn"],
      vi="Trạng thái duyệt",
      dvi="Lựa chọn = ESキッチンが確認中／承認／お受けできませんでした／取り下げ／ご契約開始済み. Tên gọi đang chờ xác nhận (ghi chú xác nhận Q1)"),
    I("3.4", "クリア／検索", ".es-search__actions", "button", "click",
      "クリア＝条件を空に戻して全件。検索＝条件で絞る", pattern="P-LIST",
      vi="Xóa／Tìm",
      dvi="クリア = đưa điều kiện về rỗng, hiện toàn bộ. 検索 = lọc theo điều kiện"),
    I("4", "件数・並び順・案内", ".tools", "label", "view",
      "「契約の申請 {n}件（申請日の新しい順）」。右に「プラン・配送・設備・休止・再開・解約は『変更のお申し込み』、拠点の情報は拠点詳細の『編集』から。」の案内",
      vi="Số dòng, thứ tự, hướng dẫn",
      dvi="Hiện 「契約の申請 {n}件（申請日の新しい順）」. Bên phải có hướng dẫn 「プラン・配送・設備・休止・再開・解約は『変更のお申し込み』、拠点の情報は拠点詳細の『編集』から。」"),
    I("5", "申請の表", ".es-table", "table", "view",
      "列＝受付番号／申請の種類／対象の拠点（拠点名＋拠点ID）／申請日／申請者／開始ご利用月／申請内容／承認状態。ESキッチンが確認中の行は強調（att）。0件のときは表の代わりに『条件に合う申請はありません』。ESキッチンが代理入力した申請も同じ行に出る（申請者に「ESキッチンが代わりに〜」と出る）",
      pattern="P-LIST",
      vi="Bảng yêu cầu",
      dvi="Cột = số tiếp nhận／loại yêu cầu／chi nhánh đối tượng (tên + ID chi nhánh)／ngày yêu cầu／người yêu cầu／tháng sử dụng bắt đầu／nội dung yêu cầu／trạng thái duyệt. Dòng 「ESキッチンが確認中」 được nhấn mạnh (att). Khi 0 dòng thì thay bảng bằng 『条件に合う申請はありません』. Yêu cầu do ESキッチン nhập hộ cũng hiện cùng dòng (ở người yêu cầu hiện 「ESキッチンが代わりに〜」)"),
    I("5.1", "受付番号", ".es-table td.es-mono", "link", "click",
      "押すと申請の詳細（CW_CREQ_002）を一覧の上に開く（URL は /corp/requests/contract/{受付番号}。閉じると一覧へ戻る）。受付番号＝新規 AP-…／変更 CH-YYYYMMDD-NNNN",
      vi="Số tiếp nhận",
      dvi="Bấm để mở chi tiết yêu cầu (CW_CREQ_002) phủ lên danh sách (URL là /corp/requests/contract/{số tiếp nhận}; đóng thì quay về danh sách). Số tiếp nhận = đăng ký mới AP-…／thay đổi CH-YYYYMMDD-NNNN"),
    I("5.2", "対象の拠点", ".es-table td.w", "label", "view",
      "拠点名と拠点ID。法人情報の変更は「{法人名}（法人）」、新しい拠点を追加の申請で拠点IDがまだないときは「—」",
      vi="Chi nhánh đối tượng",
      dvi="Tên chi nhánh và ID chi nhánh. Đổi thông tin pháp nhân hiện 「{tên pháp nhân}（法人）」; yêu cầu thêm chi nhánh mới mà chưa có ID chi nhánh thì hiện 「—」"),
    I("5.3", "承認状態", ".es-table .es-badge", "label", "view",
      "バッジ。ESキッチンが確認中＝青、承認／ご契約開始済み＝緑、お受けできませんでした／取り下げ＝灰。拠点ごとに別の状態になる（1つの申請に複数拠点があっても1拠点1行。台帳 B「対応中 n/m」は運営だけ）", pattern="P-STATUS-COLORS",
      vi="Trạng thái duyệt (huy hiệu)",
      dvi="Huy hiệu. ESキッチンが確認中 = xanh dương, 承認／ご契約開始済み = xanh lá, お受けできませんでした／取り下げ = xám. Mỗi chi nhánh có trạng thái riêng (một yêu cầu có nhiều chi nhánh vẫn mỗi chi nhánh 1 dòng; 「対応中 n/m」 ở sổ cái B chỉ có ở 運営)"),
    I("6", "ページ送り", ".es-pagination", "area", "click", "10件ずつ。10・20・50件の切替あり（共通）", pattern="P-PAGESIZE",
      vi="Phân trang",
      dvi="Mỗi trang 10 dòng; có thể chuyển 10・20・50 dòng (chung)"),
    I("7", "0件の表示", ".es-empty", "area", "view", "条件に合う申請がないとき『条件に合う申請はありません』。申請が1件もないときも同じ文言（専用の文はない）", err=["I01"],
      vi="Hiển thị khi 0 dòng",
      dvi="Khi không có yêu cầu phù hợp điều kiện thì hiện 『条件に合う申請はありません』. Khi hoàn toàn chưa có yêu cầu nào cũng dùng đúng câu này (không có câu riêng)"),
]

# ---------------------------------------------------------------- 002 詳細（ダイアログ）
D_ITEMS = [
    I("1", "申請の詳細（ダイアログ）", ".es-dialog__panel", "modal", "view",
      "見出し「申請の詳細」＋受付番号。幅 640px。外側・×で閉じる（URL が /requests/contract/{番号} なら一覧へ戻る）。画面の項目は読み取り専用",
      vi="Chi tiết yêu cầu (hộp thoại)",
      dvi="Tiêu đề 「申請の詳細」 + số tiếp nhận. Rộng 640px. Đóng bằng bấm ra ngoài hoặc ×(nếu URL là /requests/contract/{số} thì quay về danh sách). Các mục trên màn hình chỉ đọc"),
    I("2", "受付番号", "-", "label", "view", "CH-YYYYMMDD-NNNN（変更）／AP-…（新規・拠点を追加）",
      vi="Số tiếp nhận", dvi="CH-YYYYMMDD-NNNN (thay đổi)／AP-… (đăng ký mới・thêm chi nhánh)"),
    I("2.1", "申請の種類", "-", "label", "view", "新規のお申し込み／拠点を追加／プランの変更／配送の変更／設備の変更／休止／再開／解約／拠点情報の変更／法人情報の変更",
      vi="Loại yêu cầu", dvi="Một trong 10 loại: 新規のお申し込み／拠点を追加／プランの変更／配送の変更／設備の変更／休止／再開／解約／拠点情報の変更／法人情報の変更"),
    I("2.2", "対象の拠点", "-", "label", "view", "「{拠点ID} {拠点名}」。法人情報の変更は「{法人ID} {法人名}（法人）」",
      vi="Chi nhánh đối tượng", dvi="Hiện 「{ID chi nhánh} {tên chi nhánh}」. Đổi thông tin pháp nhân hiện 「{ID pháp nhân} {tên pháp nhân}（法人）」"),
    I("2.3", "申請日", "-", "label", "view", "yyyy-mm-dd",
      vi="Ngày yêu cầu", dvi="Định dạng yyyy-mm-dd"),
    I("2.4", "申請者", "-", "label", "view", "「{お申し込み者}（法人アカウント／拠点アカウント）」。ESキッチンが代理入力したときは「ESキッチンが代わりに〜」",
      vi="Người yêu cầu", dvi="Hiện 「{người đăng ký}（法人アカウント／拠点アカウント）」. Khi ESキッチン nhập hộ thì hiện 「ESキッチンが代わりに〜」"),
    I("2.5", "開始ご利用月", "-", "label", "view", "「2026年11月分」の形。法人情報の変更・拠点情報の変更は承認時に決まるため「—」",
      vi="Tháng sử dụng bắt đầu", dvi="Dạng 「2026年11月分」. Đổi thông tin pháp nhân・thông tin chi nhánh được quyết khi duyệt nên hiện 「—」"),
    I("2.6", "申請内容", "-", "label", "view", "手続きごとの要約（例：「100プラン（ESライト） → 150プラン（ESスタンダード）」）。複数行で幅いっぱい",
      vi="Nội dung yêu cầu", dvi="Tóm tắt theo từng thủ tục (ví dụ 「100プラン（ESライト） → 150プラン（ESスタンダード）」). Nhiều dòng, chiếm hết chiều rộng"),
    I("2.7", "承認状態", "-", "label", "view", "バッジ（一覧と同じ色・名前）",
      vi="Trạng thái duyệt", dvi="Huy hiệu (cùng màu và tên với danh sách)"),
    I("2.8", "却下理由", "-", "label", "view",
      "運営が却下したとき、定型の理由（申請内容に不備がある／オーダー締切に間に合わない／設備・在庫の手配ができない／配送エリア・配送ルートの都合で対応できない／契約条件に合わない／その他＋自由記述）を表示。それ以外は「—」",
      vi="Lý do từ chối",
      dvi="Khi 運営 từ chối thì hiện lý do mẫu (申請内容に不備がある／オーダー締切に間に合わない／設備・在庫の手配ができない／配送エリア・配送ルートの都合で対応できない／契約条件に合わない／その他 + ghi tự do). Trường hợp khác hiện 「—」"),
    I("2.9", "取り下げ日時", "-", "label", "view", "取り下げたとき yyyy-mm-dd HH:MM。それ以外は「—」",
      vi="Ngày giờ rút lại", dvi="Khi đã rút lại hiện yyyy-mm-dd HH:MM. Trường hợp khác hiện 「—」"),
    I("3", "代理入力のお知らせ", ".es-inline--info", "label", "view",
      "申請者が「ESキッチンが代わりに〜」のとき：『ESキッチンが代わりに受け付けました。お電話などでお受けしたお申し込みを、ESキッチンが代わりに入力しました。内容は法人Webからのお申し込みと同じように確認・反映します。』", err=["I219"],
      vi="Thông báo nhập hộ",
      dvi="Khi người yêu cầu là 「ESキッチンが代わりに〜」 thì hiện: 『ESキッチンが代わりに受け付けました。お電話などでお受けしたお申し込みを、ESキッチンが代わりに入力しました。内容は法人Webからのお申し込みと同じように確認・反映します。』"),
    I("4", "確認中のお知らせ", ".es-inline--info", "label", "view",
      "取り下げられる申請（ESキッチンが確認中の CH- 番号）のとき：『ESキッチンが確認しています。承認されると、ご契約に反映してメールでお知らせします。確認が終わるまで、この拠点の新しいお申し込みはできません。』",
      vi="Thông báo đang xác nhận",
      dvi="Khi là yêu cầu rút lại được (số CH- đang 「ESキッチンが確認中」) thì hiện: 『ESキッチンが確認しています。承認されると、ご契約に反映してメールでお知らせします。確認が終わるまで、この拠点の新しいお申し込みはできません。』"),
    I("5", "取り下げは法人アカウントから", ".es-inline--info", "label", "view",
      "拠点アカウントが、法人アカウントの出した申請を開いたとき「取り下げる」を出さず、この案内を出す（申請・承認 §3-4・H2）", err=["I218"], cond=["拠点アカウント・法人アカウントが出した申請", "Tài khoản chi nhánh mở yêu cầu do tài khoản pháp nhân gửi"],
      vi="Rút lại phải do tài khoản pháp nhân",
      dvi="Khi tài khoản chi nhánh mở yêu cầu do tài khoản pháp nhân gửi thì không hiện 「取り下げる」 mà hiện thông báo này (Yêu cầu・duyệt §3-4・H2)"),
    I("6", "拠点詳細を開く／法人情報を開く", "button::拠点詳細を開く", "button", "click",
      "拠点の申請＝拠点詳細の「契約」タブ（?tab=doc）へ。法人情報の変更＝法人情報（/corp/corp-info）へ。拠点IDがない新規申請では出さない",
      vi="Mở chi tiết chi nhánh／thông tin pháp nhân",
      dvi="Yêu cầu của chi nhánh = sang tab 「契約」 của chi tiết chi nhánh (?tab=doc). Đổi thông tin pháp nhân = sang thông tin pháp nhân (/corp/corp-info). Không hiện ở yêu cầu mới chưa có ID chi nhánh"),
    I("6.1", "添付ファイル", ".cb-attach", "file", "upload",
      "（お客様が、申請を出したあとにファイルを追加・差し替え・削除できる。変更のお申し込みの入力欄にはしない。運営には**通知だけ**を送り、承認は要らない（hong 2026-10-08）。ファイルは1つ5MBまで・10件まで（Message List）。運営への通知は**画面のお知らせのみ（メールは送らない）**（hong 2026-10-08）。追加・変更できる時期は**状態を問わず、いつでも**（確認中でも承認後でも。hong 2026-10-08）",
      vi="Tệp đính kèm", dvi="Khách hàng có thể thêm / thay / xóa tệp sau khi gửi yêu cầu. Không phải ô nhập của 変更のお申し込み. Chỉ gửi thông báo cho 運営, không cần duyệt (hong 2026-10-08). Tối đa 5MB/tệp, 10 tệp (Message List). Thông báo cho 運営 chỉ trên màn hình, không gửi email (hong 2026-10-08). Thêm / sửa được vào bất kỳ lúc nào, không phụ thuộc trạng thái (cả khi đang xác nhận lẫn sau khi duyệt) (hong 2026-10-08)",
      req="－", ex=["現場の写真.jpg", "Tên tệp (ví dụ: ảnh hiện trường .jpg)"]),
    I("7", "取り下げる", "button::取り下げる", "button", "click",
      "ESキッチンが確認中の CH- 番号の申請だけに出す（承認済み・却下・取り下げ済みは不可。AP- の新規・拠点追加も出さない＝コードの条件）。申請を出したアカウントと法人アカウントだけ押せる。押すと確認（Q210／拠点情報・法人情報の変更は Q211）",
      cond=["ESキッチンが確認中・CH- 番号・（拠点アカウントは自分が出した申請）", "Đang 「ESキッチンが確認中」, số CH-, (tài khoản chi nhánh chỉ với yêu cầu do mình gửi)"], err=["Q210", "Q211"],
      vi="Rút lại",
      dvi="Chỉ hiện với yêu cầu số CH- đang 「ESキッチンが確認中」 (đã duyệt・từ chối・đã rút lại thì không được; số AP- đăng ký mới・thêm chi nhánh cũng không hiện = điều kiện trong code). Chỉ tài khoản đã gửi yêu cầu và tài khoản pháp nhân mới bấm được. Bấm sẽ hiện xác nhận (Q210／đổi thông tin chi nhánh・pháp nhân là Q211)"),
]
D_CONFIRM = [
    I("1", "取り下げの確認", ".es-modal", "modal", "view",
      "警告（!）のモーダル。見出し「お申し込みを取り下げますか？」（拠点情報・法人情報の変更は「変更を取り下げますか？」）。本文＝受付番号・種類・内容を出し、取り下げると新しいお申し込みができるようになる／今の内容のままになることを知らせる。ボタン「キャンセル」「取り下げる」", err=["Q210", "Q211"], pattern="P-DEL",
      vi="Xác nhận rút lại",
      dvi="Hộp thoại cảnh báo (!). Tiêu đề 「お申し込みを取り下げますか？」 (đổi thông tin chi nhánh・pháp nhân là 「変更を取り下げますか？」). Nội dung hiện số tiếp nhận・loại・nội dung, báo rằng rút lại thì đăng ký mới được / nội dung hiện tại được giữ nguyên. Nút 「キャンセル」「取り下げる」"),
    I("2", "取り下げる（確定）", ".es-modal__actions button::取り下げる", "button", "click",
      "押すと取り下げ日時を残して状態を『取り下げ』に。トーストで知らせ、詳細を閉じる。取り下げたことは、拠点のメイン担当者と取り下げた方へメール（M7）、運営には画面のお知らせ（台帳 B）", err=["S214", "S215", "E31"],
      vi="Rút lại (xác nhận)",
      dvi="Bấm để lưu ngày giờ rút lại và chuyển trạng thái thành 『取り下げ』. Báo bằng toast và đóng chi tiết. Việc rút lại được báo bằng email (M7) cho người phụ trách chính của chi nhánh và người rút lại, còn với 運営 là thông báo trên màn hình (sổ cái B)"),
]

# ---------------------------------------------------------------- 003 変更のお申し込み
S1_ITEMS = [
    _PAGEHEAD, _STEPS,
    I("4", "お手続きの選択", ".cb-procs", "radio", "click",
      "「どのお手続きをご希望ですか？（1回のお申し込みで1種類です）」。ラジオ式のカード8枚：プランの変更／配送の変更／設備の変更／拠点情報の変更／法人情報の変更（法人アカウントだけ）／休止／再開／解約。1枚ごとに説明・注意・バッジ（『{n}拠点が対象』『法人が対象』『対象なし』）。対象の拠点がない手続きは選べない（グレー）",
      req="○", init=["（未選択）", "(chưa chọn)"], ex=["プランの変更", "Một thủ tục trong 8 thủ tục (mỗi lần đăng ký chỉ 1 loại)"], err=["E330"],
      vi="Chọn thủ tục",
      dvi="「どのお手続きをご希望ですか？（1回のお申し込みで1種類です）」. 8 thẻ dạng radio: プランの変更／配送の変更／設備の変更／拠点情報の変更／法人情報の変更 (chỉ tài khoản pháp nhân)／休止／再開／解約. Mỗi thẻ có mô tả・lưu ý・huy hiệu (『{n}拠点が対象』『法人が対象』『対象なし』). Thủ tục không có chi nhánh đối tượng thì không chọn được (màu xám)"),
    I("4.1", "手続きの対象の条件", ".cb-proc", "label", "view",
      "プランの変更・配送の変更・設備の変更・拠点情報の変更・休止＝ご利用中の拠点／再開＝休止中の拠点／解約＝ご利用中・休止中どちらも／法人情報の変更＝法人アカウントだけ（拠点アカウントには出さない）。承認待ちのお申し込みがある拠点・手続きできない理由がある拠点は数えない",
      vi="Điều kiện chi nhánh đối tượng của thủ tục",
      dvi="Đổi gói・đổi giao hàng・đổi thiết bị・đổi thông tin chi nhánh・tạm dừng = chi nhánh đang sử dụng / mở lại = chi nhánh đang tạm dừng / hủy hợp đồng = cả đang sử dụng lẫn đang tạm dừng / đổi thông tin pháp nhân = chỉ tài khoản pháp nhân (không hiện với tài khoản chi nhánh). Chi nhánh có yêu cầu chờ duyệt hoặc có lý do không làm được thủ tục thì không tính"),
    I("5", "選び方の注記", ".note", "label", "view",
      "「プランの変更・休止はご利用中の拠点、再開は休止中の拠点、解約はご利用中・休止中どちらの拠点も対象です。法人情報の変更は法人アカウントだけが申し込めます。承認待ちのお申し込みがある拠点は選べません。対象の拠点がない手続きは選べません。」",
      vi="Ghi chú cách chọn",
      dvi="Hiện nguyên văn: 「プランの変更・休止はご利用中の拠点、再開は休止中の拠点、解約はご利用中・休止中どちらの拠点も対象です。法人情報の変更は法人アカウントだけが申し込めます。承認待ちのお申し込みがある拠点は選べません。対象の拠点がない手続きは選べません。」"),
    _CYCLE_NOTE, _FOOT,
]
S2_ITEMS = [
    I("1", "対象の拠点の選択", ".cb-bsel", "check", "click",
      "見出し「対象の拠点をお選びください（{手続き名}）」。拠点ごとの行（チェック＋拠点名＋ご契約番号＋『ご利用中／休止中』バッジ＋プラン・ご契約開始・最低利用期間）。複数選べる。選べない拠点は灰色で理由を出す（承認待ちのお申し込み／状態が対象外／手続きできない理由）。最初は選べる拠点がすべてチェック済み",
      req="○", init=["選べる拠点すべて", "Tất cả chi nhánh chọn được"], err=["E331", "E332"],
      ex=["CU00643／CU00950", "ID các chi nhánh được đánh dấu (chọn được nhiều chi nhánh)"],
      vi="Chọn chi nhánh đối tượng",
      dvi="Tiêu đề 「対象の拠点をお選びください（{tên thủ tục}）」. Mỗi chi nhánh một dòng (ô chọn + tên chi nhánh + số hợp đồng + huy hiệu 『ご利用中／休止中』 + gói・ngày bắt đầu hợp đồng・thời gian sử dụng tối thiểu). Chọn được nhiều chi nhánh. Chi nhánh không chọn được hiện màu xám kèm lý do (có yêu cầu chờ duyệt / trạng thái không phù hợp / có lý do không làm được thủ tục). Ban đầu mọi chi nhánh chọn được đều được đánh dấu"),
    I("2", "すべて選ぶ／選択を外す", "button::すべて選ぶ", "button", "click",
      "すべて選ぶ＝選べる拠点を全部チェック／選択を外す＝全部外す",
      vi="Chọn tất cả／Bỏ chọn",
      dvi="すべて選ぶ = đánh dấu mọi chi nhánh chọn được / 選択を外す = bỏ đánh dấu tất cả"),
    I("4", "案内", ".es-inline--info", "label", "view",
      "『複数の拠点をまとめてお申し込みいただけます。開始したいご利用月は、次の画面で拠点ごとに選べます。』＋締切の案内",
      vi="Hướng dẫn",
      dvi="Hiện 『複数の拠点をまとめてお申し込みいただけます。開始したいご利用月は、次の画面で拠点ごとに選べます。』 kèm thông báo hạn chót"),
    _CYCLE_NOTE, _FOOT,
]
S3_BASE = [_PAGEHEAD, _STEPS, _CYCLE_NOTE, _site_title("4"), _FOOT]


def _kind_view(vid, state_ja, state_vi, kind, site, items, note, setup=None, login=None, note_vi=""):
    v = {"id": vid, "code": "CW_CREQ_003", "state": [state_ja, state_vi], "url": "/corp/requests/contract/new?kind=%s&site=%s" % (kind, site),
         "full": True, "wait": 800, "note": [note, note_vi], "items": items}
    if setup:
        v["setup"] = setup
    if login:
        v["login"] = login
    return v


_WHAT = lambda no, opts, hint, dvi, exd: I(no, "変更したいもの", ".cb-checks", "check", "check", "必須（1つ以上）。選択肢＝" + opts + "。" + hint + " チェックしたものの欄だけが下に出る。1つも選ばずに進むと『変更したいものをご入力ください。』（Message List は『変更する項目を1つ以上選んでください。』＝確認メモ Q5）",
                                           vi="Mục muốn thay đổi", dvi=dvi, req="○", ex=["お届け先の住所／電話番号", exd], err=["E01", "E336"])
_ADDR = lambda no: I(no, "住所（変更後）", "-", "text", "input", "郵便番号（数字7桁・ハイフンは有無どちらでも。E05）／都道府県（47から選ぶ）／市区町村（60文字）／町域・番地（120文字）／建物・部屋番号（120文字・任意）。「住所」にチェックしたときだけ出る。『承認が必要』の印（ap）を付ける",
                      vi="Địa chỉ (sau khi đổi)",
                      dvi="Mã bưu chính (7 chữ số, có hay không có dấu gạch ngang đều được. E05)／tỉnh thành (chọn từ 47)／quận huyện (60 ký tự)／địa chỉ khu vực・số nhà (120 ký tự)／tòa nhà・số phòng (120 ký tự, không bắt buộc). Chỉ hiện khi đã đánh dấu 「住所」. Gắn dấu 『承認が必要』 (ap)",
                      req="○", len=["郵便番号 8／市区町村 60／町域 120／建物 120", "Mã bưu chính 8 / Quận huyện 60 / Địa chỉ 120 / Tòa nhà 120"], ex=["541-0041／大阪府／大阪市中央区／北浜2-1-1／北浜ビル3F", "Mã bưu chính／tỉnh thành／quận huyện／địa chỉ khu vực・số nhà／tòa nhà"], err=["E01", "E05"], pattern="P-ADDRESS")

K_PLAN = [
    _PAGEHEAD, _STEPS, _CYCLE_NOTE, _site_title("4"), _cyc("4.1"),
    I("4.2", "変更後のプラン", "select@2", "select", "select",
      "必須。9つ＝50・100・150プラン × ESライト／ESスタンダード／ESライト（自販機）。ESライト（自販機）＝冷蔵庫から自販機への切替（現場調査のあと運営が承認・開始月を決める。台帳 B）。いまのプランは選択肢に出さない（同じプランは選べない）",
      req="○", init=["選択してください", "Vui lòng chọn"], ex=["150プラン（ESスタンダード）", "Gói sau khi đổi (một trong 9 gói)"], err=["E02"],
      vi="Gói sau khi đổi",
      dvi="Bắt buộc. 9 gói = 50・100・150 × ESライト／ESスタンダード／ESライト（自販機）. ESライト（自販機） = chuyển từ tủ lạnh sang máy bán hàng tự động (sau khảo sát hiện trường, 運営 duyệt và quyết tháng bắt đầu. Sổ cái B). Không hiện gói giống gói hiện tại (không chọn được cùng gói)"),
    _why("4.3", "変更の理由", "例）1月の増員で提供数が足りないため", vi="Lý do thay đổi", exd="Lý do thay đổi gói (nhập tự do)"), _FOOT,
]
K_DLV = [
    _PAGEHEAD, _STEPS, _CYCLE_NOTE, _site_title("4"), _cyc("4.1"),
    I("4.2", "配送方法", "select@2", "select", "select",
      "必須。変更しない／ES配送便／COOL便。自動販売機のある拠点は『ES配送便（自動販売機のある拠点は固定です）』の読み取りだけ。注記＝ES配送便に変えるときはお届けエリアごとに料金が異なる",
      req="○", init=["選択してください", "Vui lòng chọn"], ex=["ES配送便", "Phương thức giao hàng sau khi đổi"], err=["E02"],
      vi="Phương thức giao hàng",
      dvi="Bắt buộc. 変更しない／ES配送便／COOL便. Chi nhánh có máy bán hàng tự động chỉ hiện chế độ đọc 『ES配送便（自動販売機のある拠点は固定です）』. Ghi chú = khi đổi sang ES配送便, phí khác nhau theo khu vực giao hàng"),
    I("4.3", "お届け回数", "select@3", "select", "select",
      "必須。変更しない／{標準}回（プラン標準）／標準＋1回（＋{金額}／月）／標準＋2回（＋{金額}／月）。画面の注記は『標準より少なくはできません』だが、仕様は『標準より減らせる（料金は下がらない）』。標準より少ない回数も選べる（料金は下がらない旨を注記に書く）",
      req="○", init=["選択してください", "Vui lòng chọn"], ex=["3回（標準＋1回・＋3,000円／月）", "Số lần giao sau khi đổi (kèm phụ phí hàng tháng)"], err=["E02"],
      vi="Số lần giao hàng",
      dvi="Bắt buộc. 変更しない／{chuẩn} lần (chuẩn của gói)／chuẩn +1 lần (+{số tiền}/tháng)／chuẩn +2 lần (+{số tiền}/tháng). Ghi chú trên màn hình là 『標準より少なくはできません』 và có thể chọn số lần ít hơn tiêu chuẩn (phí không giảm; ghi trong chú thích)"),
    _ro("4.4", "お届けできない曜日（読み取り）", "いまの設定を出し、変更は『拠点情報の変更』からお申し込みください（承認が必要）と案内する",
        vi="Ngày không giao được (chỉ đọc)",
        dvi="Hiện thiết lập hiện tại và hướng dẫn muốn đổi thì đăng ký ở 『拠点情報の変更』 (cần duyệt)"),
    _why("4.5", "ご要望・ご事情", "例）水曜の午前は会議で受け取れないため、配送時間帯を午後にしてください", vi="Yêu cầu・hoàn cảnh", exd="Yêu cầu hoặc hoàn cảnh liên quan đến việc đổi giao hàng (nhập tự do)"),
    I("4.6", "変えない項目だけのとき", "-", "label", "view", "配送方法（自動販売機の拠点は固定のため回数だけ）も回数も『変更しない』のままで、ご要望も空なら進めない。お届け回数の欄の下に『変更する項目を1つ以上選んでください。』（E336）を出す。ご要望に書けば進める（オプションの追加・おやめはご要望欄で受けるため）。hong 2026-10-08", err=["E336"],
      vi="Khi không đổi mục nào",
      dvi="Nếu để cả phương thức giao (hoặc chỉ số lần với chi nhánh có máy bán hàng) và số lần ở 『変更しない』 mà ô yêu cầu cũng trống, bấm tiếp sẽ báo 『変更する項目を1つ以上選んでください。』. Nếu ô yêu cầu cũng trống thì không đi tiếp được; hiện E336 dưới ô số lần giao. Nếu ghi vào ô yêu cầu thì đi tiếp được (vì thêm/bỏ tùy chọn được nhận qua ô yêu cầu). hong 2026-10-08"), _FOOT,
]
K_EQP = [
    _PAGEHEAD, _STEPS, _CYCLE_NOTE, _site_title("4"), _cyc("4.1"),
    I("4.2", "ご希望の内容", "select@2", "select", "select",
      "必須。設備を追加したい／設備を回収してほしい／機種を変えたい（サイズアップ）の3つ（仕様 §6-3。hong 2026-10-08 Q7＝仕様どおり）",
      vi="Nội dung mong muốn", dvi="Bắt buộc. 3 lựa chọn: muốn thêm thiết bị / muốn thu hồi thiết bị / đổi máy (nâng cỡ) (spec §6-3, hong 2026-10-08 Q7 = theo spec).",
      req="○", init=["選択してください", "Vui lòng chọn"], ex=["機種を変えたい（サイズアップ）", "Nội dung thay đổi thiết bị mong muốn"], err=["E02"]),
    I("4.3", "対象の設備（いまお使いのもの）", "select@3", "select", "select",
      "回収・機種変更のときだけ出る。必須。いまお使いの設備（機種コード＋機種名）から選ぶ（自由入力にしない）",
      vi="Thiết bị đối tượng (đang dùng)", dvi="Chỉ hiện khi thu hồi / đổi máy. Bắt buộc. Chọn từ thiết bị đang dùng (mã máy + tên máy), không nhập tự do",
      req="条件付き", ex=["RF000001 冷蔵ショーケース 48L", "Mã máy + tên máy của thiết bị đang dùng"], err=["E02"]),
    I("4.4", "追加したい設備／変更後の設備", "select@4", "select", "select",
      "追加・機種変更のとき出る。必須。公開の機種だけ（機種コード＋機種名＋容量）。在庫の都合で近いサイズをご提案することがある旨を添える",
      vi="Thiết bị muốn thêm / thiết bị sau khi đổi", dvi="Hiện khi thêm / đổi máy. Bắt buộc. Chỉ các máy đang công khai. Ghi chú: tùy tồn kho có thể đề xuất cỡ gần nhất",
      req="条件付き", ex=["RF000003　冷蔵ショーケース 105L", "Mã máy + tên máy + dung tích"], err=["E02"]),
    I("4.5", "台数", "select@5", "text", "input",
      "必須。1以上でいまの台数まで（追加のときは増やす台数、回収のときは返す台数）",
      vi="Số lượng", dvi="Bắt buộc. Từ 1 đến số lượng hiện có (thêm: số máy tăng; thu hồi: số máy trả)",
      req="○", len=["数値 1〜いまの台数", "Số 1 đến số hiện có"], ex=["1", "Số máy"], err=["E01"]),
    I("4.6", "希望日", "input@1", "date", "input",
      "設備の設置・回収・入れ替えのご希望日。ESキッチンが調整して連絡する（hong 2026-10-08 Q7＝仕様どおり）",
      vi="Ngày mong muốn", dvi="Ngày mong muốn lắp / thu hồi / thay thiết bị. ESキッチン sẽ điều chỉnh và liên hệ (Q7 = theo spec)",
      req="－", ex=["2026-11-20", "Ngày yyyy-mm-dd"], err=["E01"]),
    I("4.7", "設置代行", "label::設置代行を希望する", "check", "check",
      "設置代行（OP000007・単発）を希望するか。金額は運営が承認のときに決める（申請・承認 §6-3）",
      vi="Lắp đặt hộ", dvi="Có muốn lắp đặt hộ (OP000007, một lần) không. Số tiền do 運営 quyết khi duyệt (§6-3)",
      req="－", ex=["希望する", "Chọn hoặc không"]),
    _why("4.8", "ご要望・ご事情", "例）増員で入りきらないため、冷蔵庫を1台増やしたいです", vi="Yêu cầu・hoàn cảnh", exd="Lý do cần thêm thiết bị (ví dụ: tăng nhân sự nên cần thêm 1 tủ lạnh)"), _FOOT,
]
K_INFO = [
    _PAGEHEAD, _STEPS, _CYCLE_NOTE, _site_title("4"), _cyc("4.1"),
    _ro("4.2", "ES-QR の利用設定／お試し期間月数（読み取り）", "運営だけが変えられる項目。参照のみで出す（『参照』の印）",
        vi="Thiết lập dùng ES-QR／số tháng dùng thử (chỉ đọc)",
        dvi="Mục chỉ 運営 mới đổi được. Chỉ hiển thị để tham khảo (dấu 『参照』)"),
    _WHAT("4.3", "お届け先名・フリガナ／お届け先の住所／電話番号／請求書の宛先／ゲストモード／お届けできない曜日／設備の希望日（7つ）", "従業員数・備考・FAX・ご担当者は申請ではなく拠点詳細の『編集』ですぐ変更できる。",
          "Bắt buộc (từ 1 mục). Lựa chọn = お届け先名・フリガナ／お届け先の住所／電話番号／請求書の宛先／ゲストモード／お届けできない曜日／設備の希望日 (7 mục). Số nhân viên・ghi chú・FAX・người phụ trách không phải gửi yêu cầu mà đổi ngay ở 『編集』 của chi tiết chi nhánh. Chỉ hiện bên dưới ô của mục đã đánh dấu. Bấm tiếp mà không chọn mục nào sẽ báo 『変更したいものをご入力ください。』 (Message List là 『変更する項目を1つ以上選んでください。』 = ghi chú xác nhận Q5)",
          "Mục muốn đổi (có thể chọn nhiều)"),
    I("4.4", "お届け先名・フリガナ（変更後）", "-", "text", "input", "名前は必須・フリガナは全角カタカナ（E03）。それぞれ最大120文字", req="条件付き", len="120", ex=["大阪支店（北浜オフィス）／オオサカシテン キタハマ", "Tên nơi giao／furigana (katakana toàn góc)"], err=["E01", "E03", "E04"],
      vi="Tên nơi giao・furigana (sau khi đổi)", dvi="Tên bắt buộc, furigana là katakana toàn góc (E03). Mỗi ô tối đa 120 ký tự"),
    _ADDR("4.5"),
    I("4.6", "電話番号（変更後）", "-", "text", "input", "数字とハイフンだけ（先頭は数字）。全角で入力されたら半角に直してチェック。数字10桁または11桁・最大20文字（ハイフンを除いて数える。E06）", req="条件付き", len="20", ex=["06-6123-4567", "Số điện thoại (số và dấu gạch ngang)"], err=["E01", "E06"],
      vi="Số điện thoại (sau khi đổi)", dvi="Chỉ gồm số và dấu gạch ngang (ký tự đầu là số). Nếu nhập toàn góc thì đổi sang nửa góc rồi kiểm tra. 10 hoặc 11 chữ số・tối đa 20 ký tự (không tính dấu gạch nối; E06)"),
    I("4.7", "請求書（変更後）", "-", "select", "select", "この拠点に請求／法人に請求。お支払い方法そのものはこの申請で変えられない（案内文）", req="条件付き", ex=["法人に請求", "Nơi nhận hóa đơn sau khi đổi"], err=["E02"],
      vi="Hóa đơn (sau khi đổi)", dvi="Gửi hóa đơn cho chi nhánh này／cho pháp nhân. Bản thân phương thức thanh toán không đổi được bằng yêu cầu này (có câu hướng dẫn)"),
    I("4.8", "ゲストモード（変更後）", "-", "select", "select", "利用する／利用しない", req="条件付き", ex=["利用する", "Dùng hay không dùng chế độ khách"], err=["E02"],
      vi="Chế độ khách (sau khi đổi)", dvi="Chọn 利用する (dùng) hoặc 利用しない (không dùng)"),
    I("4.9", "お届けできない曜日（変更後）", "-", "check", "check", "月〜日のチェック。必須（1つ以上）", req="条件付き", ex=["水曜／金曜", "Các thứ không nhận hàng được (chọn nhiều)"], err=["E01"],
      vi="Ngày không giao được (sau khi đổi)", dvi="Ô chọn từ thứ hai đến chủ nhật. Bắt buộc (ít nhất 1 ngày)"),
    I("4.10", "設備の希望日（変更後）", "-", "date", "input", "設備の入替・再設置・引揚の希望日。ESキッチンが調整して連絡する", req="条件付き", ex=["2026-11-20", "Ngày mong muốn (yyyy-mm-dd)"], err=["E01"],
      vi="Ngày mong muốn cho thiết bị (sau khi đổi)", dvi="Ngày mong muốn thay thiết bị・lắp lại・thu hồi. ESキッチン sẽ điều chỉnh rồi liên hệ"),
    _why("4.11", "ご事情・ご要望", "例）オフィスを移転したため、お届け先と電話番号が変わります", vi="Hoàn cảnh・yêu cầu", exd="Hoàn cảnh hoặc yêu cầu liên quan đến thay đổi (nhập tự do)"), _FOOT,
]
K_COP = [
    _PAGEHEAD, _STEPS, I("3", "対象", ".cb-stack section.es-card", "card", "view", "法人情報の変更は拠点を選ばず、法人1件が対象。見出し＝「{法人名}（法人）」＋法人ID。開始したいご利用月は出さない（承認のあと、未発行の請求書から新しい内容になる）",
                          vi="Đối tượng",
                          dvi="Đổi thông tin pháp nhân không chọn chi nhánh, đối tượng là 1 pháp nhân. Tiêu đề = 「{tên pháp nhân}（法人）」 + ID pháp nhân. Không hiện tháng sử dụng muốn bắt đầu (sau khi duyệt, hóa đơn chưa phát hành sẽ theo nội dung mới)",
                          ex=["CU00001 株式会社サンプル（法人）", "ID pháp nhân và tên pháp nhân (chỉ hiển thị, không nhập)"]),
    _WHAT("4.1", "住所／電話番号・FAX番号（2つ）", "請求書に載る内容。承認のあと、未発行の請求書から新しい内容（発行済みの請求書はそのまま）。法人名・フリガナ・請求先法人名は法人情報の『編集』ですぐ変更できる。",
          "Bắt buộc (từ 1 mục). Lựa chọn = 住所／電話番号・FAX番号 (2 mục). Là nội dung ghi trên hóa đơn. Sau khi duyệt, hóa đơn chưa phát hành theo nội dung mới (hóa đơn đã phát hành giữ nguyên). Tên pháp nhân・furigana・tên pháp nhân nhận hóa đơn đổi ngay được ở 『編集』 của thông tin pháp nhân. Chỉ hiện bên dưới ô của mục đã đánh dấu. Bấm tiếp mà không chọn mục nào sẽ báo 『変更したいものをご入力ください。』 (Message List là 『変更する項目を1つ以上選んでください。』 = ghi chú xác nhận Q5)",
          "Mục muốn đổi (địa chỉ／số điện thoại・FAX)"),
    _ADDR("4.2"),
    I("4.3", "電話番号・FAX番号（変更後）", "-", "text", "input", "電話番号は必須、FAX番号は任意。どちらも数字とハイフンだけ（E06）", req="条件付き", len="20", ex=["03-5555-0001／03-5555-0002", "Số điện thoại／số FAX (số và dấu gạch ngang)"], err=["E01", "E06"],
      vi="Số điện thoại・FAX (sau khi đổi)", dvi="Số điện thoại bắt buộc, số FAX không bắt buộc. Cả hai chỉ gồm số và dấu gạch ngang (E06)"),
    _why("4.4", "理由", "例）代表番号の変更のため", vi="Lý do", exd="Lý do thay đổi thông tin pháp nhân (nhập tự do)"), _FOOT,
]
K_SUS = [
    _PAGEHEAD, _STEPS, _CYCLE_NOTE, _site_title("4"),
    I("4.1", "休止の理由", "select@1", "select", "select",
      "必須。5つ＝オフィスの改装・移転／長期休業・繁忙期の変動／ご利用人数の一時的な減少／費用の見直し／その他。5つのまま（hong 2026-10-08）。『その他』は下の『詳しくお聞かせください』に書き足せる（任意）",
      vi="Lý do tạm dừng",
      dvi="Bắt buộc. 5 lựa chọn: オフィスの改装・移転／長期休業・繁忙期の変動／ご利用人数の一時的な減少／費用の見直し／その他. Giữ nguyên 5 lựa chọn (hong 2026-10-08). Với 『その他』 có thể ghi thêm ở ô 『詳しくお聞かせください』 bên dưới (tùy chọn)",
      req="○", init=["選択してください", "Vui lòng chọn"], ex=["オフィスの改装・移転", "Lý do tạm dừng"], err=["E02"]),
    _cyc("4.2", vi="Tháng sử dụng muốn tạm dừng"),
    I("4.3", "休止中の設備", "select@3", "select", "select", "必須。引き揚げる／置いたままにしたい（保管料はかかりません）。置いたままの設備は休止中の最低利用期間のカウントが止まる。引き揚げた設備も設置し直したとき休止前の残りを引き継ぐ。注記は長いのでコードのとおり", req="○", init=["選択してください", "Vui lòng chọn"], ex=["引き揚げる", "Cách xử lý thiết bị trong thời gian tạm dừng"], err=["E02"],
      vi="Thiết bị khi tạm dừng",
      dvi="Bắt buộc. 引き揚げる (thu hồi)／置いたままにしたい (để nguyên, không mất phí lưu kho). Thiết bị để nguyên thì việc đếm thời gian sử dụng tối thiểu trong lúc tạm dừng bị dừng. Thiết bị đã thu hồi cũng kế thừa phần còn lại trước khi tạm dừng khi lắp lại. Ghi chú dài nên theo đúng code"),
    _ro("4.4", "通算の休止月数／残り月数（読み取り）", "過去の休止の累計（ヶ月）と、通算12ヶ月までの残り月数。残りが0なら『休止はお申し込みできません（解約をご案内します）』",
        vi="Tổng số tháng đã tạm dừng／số tháng còn lại (chỉ đọc)",
        dvi="Hiện tổng cộng dồn các lần tạm dừng trước (tháng) và số tháng còn lại tới mức tối đa 12 tháng. Nếu còn lại 0 thì báo 『休止はお申し込みできません（解約をご案内します）』"),
    I("4.5", "休止したい期間", "select@4", "select", "select", "必須。1・2・3・6ヶ月のうち残り月数以内のもの。残り月数を超えると選べず、E69", req="○", init=["選択してください", "Vui lòng chọn"], ex=["3ヶ月", "Thời gian muốn tạm dừng (tháng)"], err=["E02", "E69"],
      vi="Thời gian muốn tạm dừng",
      dvi="Bắt buộc. Trong 1・2・3・6 tháng, chỉ chọn được kỳ hạn trong số tháng còn lại. Vượt số tháng còn lại thì không chọn được, báo E69"),
    _ro("4.6", "再開予定月（読み取り）", "開始したいご利用月＋期間から自動で決まる。『{月}分　今回の休止後の通算 {n}ヶ月・残り {m}ヶ月』。再開はあらためて『再開』で申し込む",
        vi="Tháng dự kiến mở lại (chỉ đọc)",
        dvi="Tự quyết từ tháng sử dụng muốn bắt đầu + kỳ hạn. Hiện 『{tháng}分　今回の休止後の通算 {n}ヶ月・残り {m}ヶ月』. Mở lại thì đăng ký lại ở 『再開』"),
    I("4.7", "差し支えなければ詳しくお聞かせください", "textarea", "textarea", "input", "任意。複数行、最大500文字", req="－", len="文字列 500", ex=["2月から4月までオフィスを改装するため、在席者がほとんどいません", "Giải thích chi tiết lý do tạm dừng (nhập tự do)"], err=["E04"],
      vi="Chi tiết (nếu tiện cho biết)", dvi="Không bắt buộc. Nhiều dòng, tối đa 500 ký tự"),
    I("4.8", "休止の注意", ".es-inline--warning", "label", "view", "『「引き揚げる」を選んだ場合は、休止の開始日から1ヶ月後をめどに設備を引き揚げます。…棚卸報告は任意です。…』（コードの文のとおり）",
      vi="Lưu ý khi tạm dừng",
      dvi="Hiện 『「引き揚げる」を選んだ場合は、休止の開始日から1ヶ月後をめどに設備を引き揚げます。…棚卸報告は任意です。…』 (theo đúng câu trong code; báo cáo kiểm kê không bắt buộc)"), _FOOT,
]
K_RSM = [
    _PAGEHEAD, _STEPS, _CYCLE_NOTE, _site_title("4"),
    I("4.1", "再開するご利用月", "select@1", "select", "select", "必須。いま反映できるご利用月から選ぶ。承認済みの休止の予定を取り消す再開（休止期間0）のときも同じ画面（台帳 運営A）", req="○", ex=["2026年11月", "Tháng sử dụng mở lại (năm và tháng)"], err=["E02"],
      vi="Tháng sử dụng mở lại",
      dvi="Bắt buộc. Chọn từ các tháng sử dụng áp dụng được hiện tại. Khi mở lại để hủy lịch tạm dừng đã duyệt (thời gian tạm dừng 0) cũng dùng cùng màn hình này (sổ cái 運営A)"),
    I("4.2", "再開後のプラン", "select@2", "select", "select", "必須。9つから選ぶ。注記『休止前は {プラン} でした。同じでも、変えてもかまいません。』", req="○", ex=["100プラン（ESライト）", "Gói sau khi mở lại (một trong 9 gói)"], err=["E02"],
      vi="Gói sau khi mở lại",
      dvi="Bắt buộc. Chọn từ 9 gói. Ghi chú 『休止前は {gói} でした。同じでも、変えてもかまいません。』"),
    I("4.3", "休止前のご契約内容", "select@3", "select", "select", "必須。変更なし／変更あり。休止前のコース・配送・設備・お届け先・ご担当者・請求書を注記に出す。『変更あり』を選んでもこの画面には変更内容の入力がない（仕様：再開の申請の中で直せる＝確認メモ Q6）", req="○", ex=["変更なし", "Có thay đổi so với nội dung hợp đồng trước khi tạm dừng hay không"], err=["E02"],
      vi="Nội dung hợp đồng trước khi tạm dừng",
      dvi="Bắt buộc. 変更なし (không đổi)／変更あり (có đổi). Ghi chú hiện gói・giao hàng・thiết bị・nơi giao・người phụ trách・hóa đơn trước khi tạm dừng. Dù chọn 『変更あり』 màn hình này cũng chưa có phần nhập nội dung thay đổi (spec: sửa được ngay trong yêu cầu mở lại = ghi chú xác nhận Q6)"),
    _why("4.4", "ご要望", "例）冷蔵庫は休止前と同じ場所に設置してください", vi="Yêu cầu", exd="Yêu cầu khi mở lại (nhập tự do)"),
    I("4.5", "再開のお知らせ", ".es-inline--info", "label", "view", "『引き揚げた設備は設置し直します。お届けの開始日の1週間前をめどにお伺いします（置いたままの設備はそのままお使いいただけます）。最低利用期間は休止前の残りを引き継ぎます（数え直しません）。』",
      vi="Thông báo mở lại",
      dvi="Hiện 『引き揚げた設備は設置し直します。お届けの開始日の1週間前をめどにお伺いします（置いたままの設備はそのままお使いいただけます）。最低利用期間は休止前の残りを引き継ぎます（数え直しません）。』"), _FOOT,
]
K_CXL = [
    _PAGEHEAD, _STEPS, _CYCLE_NOTE, _site_title("4"),
    I("4.1", "解約日", "select@1", "select", "select", "必須。サイクルの末日から選ぶ（自由な日付にしない）。表示＝『{解約日}（{月}分の末日）　適用月 {月}分（申込締切 {日付}）』。締切を過ぎた分は選べない（REQ-CT-257）", req="○", ex=["2026-12-06（11月分の末日）", "Ngày hủy hợp đồng (ngày cuối của kỳ sử dụng)"], err=["E02"],
      vi="Ngày hủy hợp đồng",
      dvi="Bắt buộc. Chọn từ ngày cuối của chu kỳ (không nhập ngày tự do). Hiển thị 『{ngày hủy}（{tháng}分の末日）　適用月 {tháng}分（申込締切 {ngày}）』. Kỳ đã quá hạn thì không chọn được (REQ-CT-257)"),
    I("4.2", "解約の理由", "select@2", "select", "select",
      "必須。7つ＝価格が高い／廃棄が多い／メニューが合わない・使いにくい／利用者が少ない・従業員数が減った／一時的に利用しない／移転・組織変更／その他（引き止めシナリオ案・hong 2026-10-08。文面は青山様のベースをもとに調整）。選ぶと下に『理由に応じた案内』（No.4.2.1）を出す",
      vi="Lý do hủy hợp đồng",
      dvi="Bắt buộc. 7 lựa chọn: 価格が高い／廃棄が多い／メニューが合わない・使いにくい／利用者が少ない・従業員数が減った／一時的に利用しない／移転・組織変更／その他 (phương án kịch bản giữ khách, hong 2026-10-08; câu chữ sẽ chỉnh theo bản gốc của anh Aoyama). Khi chọn, bên dưới hiện 『理由に応じた案内』 (No.4.2.1)",
      req="○", ex=["廃棄が多い", "Lý do hủy hợp đồng"], err=["E02"],
      open=["案内の文面（青山様のベースをもとに調整）", "Câu chữ hướng dẫn (chỉnh theo bản gốc của anh Aoyama)"], ask="お客様（営業）"),
    I("4.2.1", "理由に応じた案内（引き止め）", ".es-inline--info", "label", "view",
      "理由を選ぶと表示。①価格が高い＝廃棄率・利用状況を踏まえたプランダウン（プラン数の見直し）／割引・オプションの見直しを案内（『プラン変更を申請』ボタン）②廃棄が多い＝直近の廃棄率を表示し、プラン数の見直し／AIおすすめによるオーダー内容の見直しを案内③メニューが合わない・使いにくい＝オーダー希望アンケートの活用、担当者との面談予約（相談希望）を案内④利用者が少ない・従業員数が減った＝プランダウン、利用促進のご案内（アンケート・告知）を案内⑤一時的に利用しない＝利用休止の案内（休止の期間・再開予定月）⑥移転・組織変更＝住所・担当者変更の手続きを案内⑦その他＝自由記入。担当者から連絡",
      vi="Hướng dẫn theo lý do (giữ khách)",
      dvi="Hiện khi chọn lý do. (1) Giá cao = gợi ý hạ gói theo tỷ lệ hủy bỏ/tình hình sử dụng, xem lại giảm giá/tùy chọn (nút 『プラン変更を申請』). (2) Lãng phí nhiều = hiện tỷ lệ lãng phí gần nhất, gợi ý xem lại số suất / xem lại đơn theo AI gợi ý. (3) Menu không hợp/khó dùng = dùng khảo sát nguyện vọng đặt món, đặt lịch gặp người phụ trách. (4) Ít người dùng / giảm nhân viên = hạ gói, hướng dẫn thúc đẩy sử dụng (khảo sát, thông báo). (5) Tạm thời không dùng = hướng dẫn tạm dừng (kỳ hạn, tháng mở lại). (6) Chuyển địa điểm/đổi tổ chức = hướng dẫn thủ tục đổi địa chỉ/người phụ trách. (7) Khác = ghi tự do, người phụ trách sẽ liên hệ",
      req="－"),
    I("4.2.2", "お客様の選択（3つ）", ".cb-retain", "button", "click",
      "案内の下に『プラン変更を申請』『担当者に相談』『そのまま解約を続ける』の3つ。プラン変更を申請＝変更のお申し込み（プランの変更）へ。担当者に相談＝相談の希望を運営に伝える。そのまま解約を続ける＝次へ進める。解約を続ける場合は、運営がヒアリングのうえ承認して確定する（hong 2026-10-08）",
      vi="Lựa chọn của khách (3 nút)",
      dvi="Dưới phần hướng dẫn có 3 nút: 『プラン変更を申請』 (sang 変更のお申し込み > プランの変更), 『担当者に相談』 (báo mong muốn tư vấn cho 運営), 『そのまま解約を続ける』 (tiếp tục). Nếu tiếp tục hủy, 運営 phỏng vấn rồi duyệt để xác nhận (hong 2026-10-08)",
      req="○", ex=["そのまま解約を続ける", "Lựa chọn của khách"]),
    I("4.3", "残った商品（在庫）の扱い", "select@3", "select", "select", "必須。買取／返却（ESキッチンへ元払い）の2択（選択肢の文はコードのとおり）。どちらでも最後の棚卸報告は必要。返却は買取の請求なし", req="○", ex=["返却（ESキッチンへ元払い）", "Cách xử lý hàng tồn còn lại"], err=["E02"],
      vi="Xử lý hàng còn lại (tồn kho)",
      dvi="Bắt buộc. 2 lựa chọn: 買取 (mua lại)／返却（ESキッチンへ元払い）(trả lại, người gửi trả phí vận chuyển) (câu lựa chọn theo đúng code). Dù chọn gì cũng cần báo cáo kiểm kê cuối cùng. Trả lại thì không bị tính tiền mua lại"),
    I("4.4", "詳しくお聞かせください", "textarea", "textarea", "input", "任意。最大500文字", req="－", len="文字列 500", ex=["事務所を閉鎖するため", "Giải thích chi tiết lý do hủy (nhập tự do)"], err=["E04"],
      vi="Chi tiết (xin cho biết thêm)", dvi="Không bắt buộc. Tối đa 500 ký tự"),
    I("4.5", "ご確認のお願い", ".cb-stack section.es-card:last-child", "check", "check", "必須。『ご精算の目安と、解約すると元に戻せないことを確認しました』。ご精算が0円でも確認する。チェックなしで進むと E334。解約日を選ぶと、違約金の目安（設備ごとの機種コード＋機種名・台数・最低利用期間の残り・金額と合計）を表に出す", req="○", err=["E334"],
      ex=["チェックあり", "Đã đánh dấu ô xác nhận"],
      vi="Yêu cầu xác nhận",
      dvi="Bắt buộc. 『ご精算の目安と、解約すると元に戻せないことを確認しました』. Dù tiền thanh toán là 0 yên cũng phải xác nhận. Không đánh dấu mà bấm tiếp sẽ báo E334. Spec yêu cầu hiện mức phí phạt tham khảo (mã model + tên theo từng thiết bị). Khi chọn ngày hủy, hiện bảng phí phạt tham khảo (mã model + tên, số lượng, thời gian sử dụng tối thiểu còn lại, số tiền và tổng)"), _FOOT,
]
CONFIRM_ITEMS = [
    _PAGEHEAD, _STEPS,
    I("3", "ご入力内容の確認（4枚のカード）", ".cb-stack section.es-card", "card", "view", "1. お手続き（手続き名・ご注意）／2. 対象の拠点（拠点・ご契約番号・いまのご契約・開始年月・最低利用期間の表）／3. ご希望の内容（拠点ごとに『項目／内容』の表）／4. お申し込みされる方",
      vi="Xác nhận nội dung đã nhập (4 thẻ)",
      dvi="1. Thủ tục (tên thủ tục・lưu ý)／2. Chi nhánh đối tượng (bảng chi nhánh・số hợp đồng・hợp đồng hiện tại・tháng bắt đầu・thời gian sử dụng tối thiểu)／3. Nội dung mong muốn (bảng 『項目／内容』 cho từng chi nhánh)／4. Người đăng ký",
      ex=["（4枚のカード）", "Các thẻ chỉ hiển thị để xác nhận nội dung (không nhập)"]),
    I("4", "お申し込みされる方", "tr.cb-whorow", "radio", "click", "必須。ご担当者から選ぶ（法人アカウント＝法人のご担当者＋対象拠点のご担当者／拠点アカウント＝その拠点のご担当者）。注記＝『受付完了メールは、お申し込み者とメイン担当者の両方へお送りします。一覧にいない方は、先に拠点詳細の「編集」でご担当者に追加してください。』", req="○", err=["E335"],
      ex=["CU00001 のご担当者", "Một người phụ trách trong danh sách (chọn 1 người)"],
      vi="Người đăng ký",
      dvi="Bắt buộc. Chọn từ người phụ trách (tài khoản pháp nhân = người phụ trách pháp nhân + người phụ trách chi nhánh đối tượng／tài khoản chi nhánh = người phụ trách chi nhánh đó). Ghi chú = 『受付完了メールは、お申し込み者とメイン担当者の両方へお送りします。一覧にいない方は、先に拠点詳細の「編集」でご担当者に追加してください。』"),
    I("5", "同意", "label.es-check", "check", "check", "必須。『上記の内容でお申し込みします』。承認までは同じ拠点に同じお手続きを重ねて申し込めない旨の注記", req="○", err=["E527"],
      ex=["チェックあり", "Đã đánh dấu ô đồng ý"],
      vi="Đồng ý", dvi="Bắt buộc. 『上記の内容でお申し込みします』. Có ghi chú rằng trước khi được duyệt thì không đăng ký chồng cùng thủ tục cho cùng chi nhánh"),
    I("6", "この内容でお申し込みする", "button::この内容でお申し込みする", "button", "click", "お申し込み者→同意の順に確かめて、確認ダイアログ（Q212）を出す。二重送信しない。解約のときは赤いボタン", err=["Q212"], pattern="P-FORM",
      vi="Đăng ký với nội dung này", dvi="Kiểm tra lần lượt người đăng ký rồi đến đồng ý, sau đó hiện hộp thoại xác nhận (Q212). Không gửi hai lần. Khi hủy hợp đồng thì là nút màu đỏ"),
    _FOOT,
]
DIALOG_ITEMS = [
    I("1", "お申し込みの確認", ".es-modal", "modal", "view", "見出し『{手続き名}をお申し込みしますか？』。本文『{n}拠点が対象です（法人情報は「法人情報が対象です」）。ESキッチンが確認して承認します。』。ボタン「戻る」「お申し込みする」（解約は赤）。解約のときのマークは赤の『!』、ほかは青の『?』", err=["Q212"],
      vi="Xác nhận đăng ký",
      dvi="Tiêu đề 『{tên thủ tục}をお申し込みしますか？』. Nội dung 『{n}拠点が対象です（法人情報は「法人情報が対象です」）。ESキッチンが確認して承認します。』. Nút 「戻る」「お申し込みする」 (hủy hợp đồng là màu đỏ). Biểu tượng khi hủy hợp đồng là 『!』 đỏ, còn lại là 『?』 xanh"),
    I("2", "お申し込みする（確定）", ".es-modal__actions button::お申し込みする", "button", "click",
      "押すと申請を作る。開始ご利用月と中身が同じ拠点は1件の申請にまとめ、違うときは分ける（受付番号は『・』でつなぐ）。作る前に全拠点を確かめ、1拠点でも不備があれば1件も作らない。サーバーの断り＝承認待ちがある／対象外／未入力（E31 など）", err=["E31", "E345"],
      vi="Đăng ký (xác nhận)",
      dvi="Bấm để tạo yêu cầu. Các chi nhánh cùng tháng sử dụng bắt đầu và cùng nội dung được gom thành 1 yêu cầu, khác nhau thì tách (số tiếp nhận nối bằng 『・』). Kiểm tra toàn bộ chi nhánh trước khi tạo, chỉ cần 1 chi nhánh có sai sót thì không tạo yêu cầu nào. Server từ chối khi có yêu cầu chờ duyệt／ngoài đối tượng／chưa nhập (E31 v.v.)"),
]
DONE_ITEMS = [
    _PAGEHEAD, _STEPS,
    I("3", "受付完了", "section.es-card", "card", "view", "見出し『お申し込みを受け付けました』＋受付番号。成功のメッセージ『{お申し込み者} さんへ、受付完了のメールをお送りしました。』", err=["S213"],
      vi="Hoàn tất tiếp nhận",
      dvi="Tiêu đề 『お申し込みを受け付けました』 + số tiếp nhận. Thông báo thành công 『{người đăng ký} さんへ、受付完了のメールをお送りしました。』",
      ex=["CH-20261008-0001", "Số tiếp nhận vừa tạo (chỉ hiển thị)"]),
    I("3.1", "受付内容", ".es-formgrid", "area", "view", "受付番号／お手続き／お申し込みされた方（アカウントの種類つき）／対象の拠点（{拠点名}・…（n拠点）、法人情報は『{法人名}（法人）』）／状態＝『ESキッチンが確認中』",
      vi="Nội dung tiếp nhận",
      dvi="Số tiếp nhận／thủ tục／người đã đăng ký (kèm loại tài khoản)／chi nhánh đối tượng ({tên chi nhánh}・…(n chi nhánh); thông tin pháp nhân là 『{tên pháp nhân}（法人）』)／trạng thái = 『ESキッチンが確認中』"),
    I("3.2", "このあとの案内", ".es-inline--info", "label", "view", "『ESキッチンが承認すると、ご契約に反映されます。反映されるとメールでお知らせし、拠点管理の表示も変わります。承認までの間は、同じ拠点に同じお手続きを重ねてお申し込みいただけません。』",
      vi="Hướng dẫn tiếp theo",
      dvi="Hiện 『ESキッチンが承認すると、ご契約に反映されます。反映されるとメールでお知らせし、拠点管理の表示も変わります。承認までの間は、同じ拠点に同じお手続きを重ねてお申し込みいただけません。』"),
    I("4", "拠点一覧へ戻る／申請の一覧へ", "button::拠点一覧へ戻る", "button", "click", "拠点一覧（/corp/sites）へ／契約の申請の一覧（/corp/requests/contract）へ。この画面ではステップ表示の『お申し込み完了』が『完了』になる",
      vi="Về danh sách chi nhánh／danh sách yêu cầu",
      dvi="Về danh sách chi nhánh (/corp/sites) / về danh sách yêu cầu hợp đồng (/corp/requests/contract). Ở màn hình này, 『お申し込み完了』 trong phần hiển thị bước chuyển thành 『完了』"),
]


VIEWS = [
    {"id": "001", "code": "CW_CREQ_001", "state": ["初期表示（法人アカウント）", "Hiển thị ban đầu (tài khoản pháp nhân)"],
     "url": "/corp/requests/contract", "full": True, "wait": 800,
     "note": ["株式会社サンプル（CU00001）。見本：プランの変更（大阪支店）・法人情報の変更・再開（名古屋営業所）が『ESキッチンが確認中』、休止（本社・名古屋）・配送の変更（大阪）が『承認』。取り下げ（千葉営業所・CH-20260930-0002）とお受けできませんでした（横浜営業所・CH-20260930-0001）の見本もある", "Công ty cổ phần Sample (CU00001). Mẫu: 「プランの変更（大阪支店）」・「法人情報の変更」・「再開（名古屋営業所）」 ở trạng thái 『ESキッチンが確認中』, 「休止（本社・名古屋）」・「配送の変更（大阪）」 ở trạng thái 『承認』. Cũng có mẫu 「取り下げ」 (chi nhánh Chiba, CH-20260930-0002) và 「お受けできませんでした」 (chi nhánh Yokohama, CH-20260930-0001)"],
     "items": [x for x in L_ITEMS if x["no"] != "7"]},
    {"id": "002", "code": "CW_CREQ_001", "state": ["検索結果が0件", "Kết quả tìm kiếm 0 dòng"],
     "url": "/corp/requests/contract", "full": True, "wait": 800,
     "setup": "const i=document.querySelector('input[placeholder=\"受付番号・拠点ID・拠点名\"]'); const set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set; set.call(i,'ZZZZ'); i.dispatchEvent(new Event('input',{bubbles:true})); const b=[...document.querySelectorAll('button')].find(x=>x.textContent.trim()==='検索'); if(b){b.click();} await new Promise(r=>setTimeout(r,400));",
     "note": ["キーワードに存在しない文字を入れて検索", "Nhập ký tự không tồn tại vào từ khóa rồi tìm kiếm"],
     "items": _pick(L_ITEMS, "3", "4", "7")},
    {"id": "003", "code": "CW_CREQ_001", "state": ["拠点アカウント（大阪支店）", "Tài khoản chi nhánh (Osaka)"],
     "url": "/corp/requests/contract", "login": "CU00871", "full": True, "wait": 800,
     "note": ["拠点アカウントでは『拠点を追加』を出さない。自分の拠点の申請だけが並ぶ", "Với tài khoản chi nhánh không hiện 『拠点を追加』. Chỉ liệt kê yêu cầu của chi nhánh mình"],
     "items": _pick(L_ITEMS, "1", "1.2")},
    {"id": "004", "code": "CW_CREQ_002", "state": ["申請の詳細（ESキッチンが確認中・取り下げられる）", "Chi tiết (đang xác nhận, rút lại được)"],
     "url": "/corp/requests/contract/CH-20260925-0001", "full": True, "wait": 1000,
     "note": ["プランの変更（大阪支店）。法人アカウントで開くと『取り下げる』が出る", "Đổi gói (chi nhánh Osaka). Mở bằng tài khoản pháp nhân thì hiện 『取り下げる』"],
     "items": [x for x in D_ITEMS if x["no"] not in ("3", "5", "6.1")]},
    {"id": "005", "code": "CW_CREQ_002", "state": ["申請の詳細（承認済み・取り下げ不可）", "Chi tiết (đã duyệt, không rút lại được)"],
     "url": "/corp/requests/contract/CH-20260705-0001", "full": True, "wait": 1000,
     "note": ["配送の変更（大阪支店）。承認済みは読み取りだけ（却下・取り下げ済みの見本は CH-20260930-0001・0002）", "Đổi giao hàng (chi nhánh Osaka). Yêu cầu đã duyệt chỉ đọc. (mẫu từ chối / đã rút lại: CH-20260930-0001, 0002)"],
     "items": _pick(D_ITEMS, "1", "2.7", "2.8", "2.9")},
    {"id": "006", "code": "CW_CREQ_002", "state": ["拠点アカウントで法人アカウントの申請を開く", "Chi nhánh mở yêu cầu do pháp nhân gửi"],
     "url": "/corp/requests/contract/CH-20260927-0001", "login": "CU00902", "full": True, "wait": 1000,
     "note": ["再開（名古屋営業所）は法人アカウントが出した申請。休止中の拠点アカウントでは取り下げられない", "Mở lại (chi nhánh Nagoya) là yêu cầu do tài khoản pháp nhân gửi. Tài khoản chi nhánh đang tạm dừng không rút lại được"],
     "items": _pick(D_ITEMS, "5")},
    {"id": "007", "code": "CW_CREQ_002", "state": ["取り下げの確認", "Xác nhận rút lại"],
     "url": "/corp/requests/contract/CH-20260925-0001", "full": True, "wait": 1000,
     "setup": "const b=[...document.querySelectorAll('button')].find(x=>x.textContent.trim()==='取り下げる'); if(b){b.click();} await new Promise(r=>setTimeout(r,400));",
     "note": ["詳細の『取り下げる』を押した状態", "Trạng thái đã bấm 『取り下げる』 trong chi tiết"], "items": D_CONFIRM},
    # ---- 003 変更のお申し込み
    {"id": "008", "code": "CW_CREQ_003", "state": ["ステップ1　お手続きを選ぶ", "Bước 1: chọn thủ tục"],
     "url": "/corp/requests/contract/new", "full": True, "wait": 800,
     "note": ["法人アカウント。8種類のカード。法人情報の変更は法人アカウントだけ", "Tài khoản pháp nhân. 8 loại thẻ. Đổi thông tin pháp nhân chỉ có ở tài khoản pháp nhân"], "items": S1_ITEMS},
    {"id": "009", "code": "CW_CREQ_003", "state": ["ステップ2　対象の拠点を選ぶ", "Bước 2: chọn chi nhánh"],
     "url": "/corp/requests/contract/new?kind=plan", "full": True, "wait": 800,
     "note": ["?kind=plan で『プランの変更』を選んだ状態でステップ2から。大阪支店は承認待ちのため選べない", "Bắt đầu từ bước 2 ở trạng thái đã chọn 『プランの変更』 bằng ?kind=plan. Chi nhánh Osaka có yêu cầu chờ duyệt nên không chọn được"], "items": S2_ITEMS},
    _kind_view("010", "ステップ3　プランの変更", "Bước 3: thay đổi gói", "plan", "CU00950", K_PLAN, "横浜営業所（CU00950）。拠点詳細の『変更を申請』から来たときと同じ（その拠点・手続きを選んだ状態でステップ3から）", note_vi="Trụ sở chính (CU00643). Giống như khi đến từ 『変更を申請』 trong chi tiết chi nhánh (bắt đầu từ bước 3 ở trạng thái đã chọn chi nhánh và thủ tục đó)"),
    _kind_view("011", "ステップ3　配送の変更", "Bước 3: thay đổi giao hàng", "dlv", "CU00950", K_DLV, "横浜営業所（CU00950）。自動販売機のある拠点（本社 CU00643）は配送方法が ES配送便で固定になる", note_vi="Trụ sở chính là chi nhánh có máy bán hàng tự động nên phương thức giao hàng cố định là ES配送便"),
    _kind_view("012", "ステップ3　設備の変更", "Bước 3: thay đổi thiết bị", "eq", "CU00950", K_EQP, "横浜（CU00950）。ご希望の内容に『機種を変えたい（サイズアップ）』を選んだ状態", note_vi="Yokohama (CU00950). Trạng thái đã chọn 『機種を変えたい（サイズアップ）』", setup=_PICK + "await pick('機種を変えたい');"),
    _kind_view("013", "ステップ3　拠点情報の変更", "Bước 3: thay đổi thông tin chi nhánh", "info", "CU00950", K_INFO, "『変更したいもの』にチェックを入れると、その欄が下に出る", note_vi="Khi đánh dấu vào 『変更したいもの』 thì ô của mục đó hiện ở bên dưới"),
    _kind_view("014", "ステップ3　法人情報の変更", "Bước 3: thay đổi thông tin pháp nhân", "corp", "CU00001", K_COP, "法人アカウントだけ。拠点は選ばない。見本の法人情報には承認待ちの変更（CH-20260929-0001）があるため、実際の画面では先に進めない場合がある＝宿題 D10", note_vi="Chỉ tài khoản pháp nhân. Không chọn chi nhánh. Thông tin pháp nhân mẫu có thay đổi chờ duyệt (CH-20260929-0001) nên trên màn hình thực tế có thể không đi tiếp được = việc tồn đọng D10"),
    _kind_view("015", "ステップ3　休止", "Bước 3: tạm dừng", "pause", "CU00950", K_SUS, "横浜（CU00950）", note_vi="Yokohama (CU00950)"),
    {"id": "016", "code": "CW_CREQ_003", "state": ["ステップ3　再開", "Bước 3: mở lại"],
     "url": "/corp/requests/contract/CH-20260927-0001", "login": "CU00902", "full": True, "wait": 1000,
     "setup": ("const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));"
               "const btn=(root,t)=>[...root.querySelectorAll('button')].find(x=>x.textContent.trim()===t&&!x.disabled);"
               "const clickIn=async(root,t)=>{const b=btn(root,t); if(b){b.click();} await sleep(700);};"
               "await clickIn(document,'取り下げる'); await clickIn(document.querySelector('.es-modal')||document,'取り下げる');"
               "await sleep(800); await clickIn(document,'変更のお申し込み');"
               "const card=[...document.querySelectorAll('.cb-proc')].find(x=>x.textContent.includes('再開')); if(card){card.click();} await sleep(400);"
               "await clickIn(document,'次へ進む'); await clickIn(document,'次へ進む');"),
     "note": ["名古屋営業所（CU00902・休止中）。見本では再開が承認待ち（CH-20260927-0001）のため、撮影では先に取り下げてから再開のお申し込みを始める（見本データは変えない）。休止中の拠点は他にない", "Chi nhánh Nagoya (CU00902・đang tạm dừng). Trong dữ liệu mẫu việc mở lại đang chờ duyệt (CH-20260927-0001) nên khi chụp ảnh phải rút lại rồi mới bắt đầu đăng ký mở lại (không đổi dữ liệu mẫu). Không có chi nhánh tạm dừng nào khác"],
     "items": K_RSM},
    _kind_view("017", "ステップ3　解約", "Bước 3: hủy hợp đồng", "cancel", "CU00961", K_CXL, "千葉（CU00961）。解約の理由に『廃棄が多い』を選んだ状態（理由に応じた案内が出る）", note_vi="Chiba (CU00961). Trạng thái đã chọn lý do 『廃棄が多い』 (hiện hướng dẫn theo lý do)", setup=_PICK + "await pick('廃棄が多い');"),
    _kind_view("018", "ステップ3　入力チェック（未入力のまま次へ）", "Bước 3: kiểm tra nhập (để trống bấm tiếp)", "plan", "CU00950",
               [_PAGEHEAD, _site_title("4"), I("4.1", "未入力の項目", ".es-field--error", "area", "view", "必須の欄を空のまま『次へ進む』を押すと、拠点ごとにまとめて確かめる。エラーの欄は赤枠にして下に『{項目名}を選択してください。』と出す。いちばん上のエラーをトーストでも出す", err=["E01", "E02"], pattern="P-FORMBOX",
                                                                               vi="Mục chưa nhập", dvi="Nếu để trống ô bắt buộc rồi bấm 『次へ進む』 thì kiểm tra gộp theo từng chi nhánh. Ô lỗi viền đỏ và hiện bên dưới 『{tên mục}を選択してください。』. Lỗi trên cùng cũng hiện bằng toast")],
               "開始したいご利用月はいちばん早い月が入っているので、プランを選ばないまま『次へ進む』",
               setup=_NEXT_ERR,
               note_vi="Tháng sử dụng muốn bắt đầu đã được điền tháng sớm nhất nên bấm 『次へ進む』 mà không chọn gói"),
    {"id": "019", "code": "CW_CREQ_003", "state": ["ステップ4　ご入力内容の確認", "Bước 4: xác nhận nội dung"],
     "url": "/corp/requests/contract/new?kind=plan&site=CU00950", "full": True, "wait": 800,
     "setup": ("const set=(el,v)=>{Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(el,v); el.dispatchEvent(new Event('change',{bubbles:true}));};"
               "const p=[...document.querySelectorAll('select')].find(x=>[...x.options].some(o=>o.text.includes('150プラン'))); if(p){set(p,p.options[p.options.length-1].value);} await new Promise(r=>setTimeout(r,300));" + _NEXT),
     "note": ["プランを選んでステップ4へ", "Chọn gói rồi sang bước 4"], "items": CONFIRM_ITEMS},
    {"id": "020", "code": "CW_CREQ_003", "state": ["お申し込みの確認ダイアログ", "Hộp thoại xác nhận gửi"],
     "url": "/corp/requests/contract/new?kind=plan&site=CU00950", "full": True, "wait": 800,
     "setup": ("const set=(el,v)=>{Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(el,v); el.dispatchEvent(new Event('change',{bubbles:true}));};"
               "const p=[...document.querySelectorAll('select')].find(x=>[...x.options].some(o=>o.text.includes('150プラン'))); if(p){set(p,p.options[p.options.length-1].value);} await new Promise(r=>setTimeout(r,300));" + _NEXT +
               "const r=document.querySelector('.cb-who input[type=radio], input[type=radio]'); if(r){r.click();} const c=[...document.querySelectorAll('input[type=checkbox]')].pop(); if(c){c.click();} await new Promise(r=>setTimeout(r,300));"
               "await clickBtn('この内容でお申し込みする');"),
     "note": ["お申し込み者と同意を入れて『この内容でお申し込みする』を押した状態", "Trạng thái đã chọn người đăng ký và đồng ý rồi bấm 『この内容でお申し込みする』"], "items": DIALOG_ITEMS},
    {"id": "021", "code": "CW_CREQ_003", "state": ["お申し込み完了", "Hoàn tất đăng ký"],
     "url": "/corp/requests/contract/new?kind=plan&site=CU00950", "full": True, "wait": 800,
     "setup": ("const set=(el,v)=>{Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(el,v); el.dispatchEvent(new Event('change',{bubbles:true}));};"
               "const p=[...document.querySelectorAll('select')].find(x=>[...x.options].some(o=>o.text.includes('150プラン'))); if(p){set(p,p.options[p.options.length-1].value);} await new Promise(r=>setTimeout(r,300));" + _NEXT +
               "const r=document.querySelector('input[type=radio]'); if(r){r.click();} const c=[...document.querySelectorAll('input[type=checkbox]')].pop(); if(c){c.click();} await new Promise(r=>setTimeout(r,300));"
               "await clickBtn('この内容でお申し込みする'); const f=[...document.querySelectorAll('.es-modal button')].find(x=>x.textContent.trim()==='お申し込みする'); if(f){f.click();} await new Promise(r=>setTimeout(r,800));"),
     "note": ["確定したあと。申請が1件でき、一覧に『ESキッチンが確認中』で出る（このあとの状態は書き換わるので最後に置く）", "Sau khi xác nhận. Một yêu cầu được tạo và hiện trong danh sách với trạng thái 『ESキッチンが確認中』 (trạng thái sau đó sẽ bị ghi đè nên để cuối cùng)"], "items": DONE_ITEMS},
    {"id": "022", "code": "CW_CREQ_002", "state": ["申請の詳細（ESキッチンが代理入力した申請）", "Chi tiết (yêu cầu do ESキッチン nhập hộ)"],
     "url": "/corp/requests/contract/CH-20260715-0001", "full": True, "wait": 1000,
     "note": ["休止（名古屋営業所）。お電話で受けて ESキッチンが代わりに入力した申請。お知らせ（I219）が出る", "Tạm dừng (chi nhánh Nagoya). Yêu cầu nhận qua điện thoại do ESキッチン nhập hộ. Hiện thông báo I219"],
     "items": _pick(D_ITEMS, "3")},
]
