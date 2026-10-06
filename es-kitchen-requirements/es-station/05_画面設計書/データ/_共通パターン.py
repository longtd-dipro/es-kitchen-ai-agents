# -*- coding: utf-8 -*-
"""
共通パターン（システム全体で1つ）。作業フォルダの「データ/_共通パターン.py」としてコピーして使う。
画面の項目に "pattern": "P-LIST" と書くと、その項目の詳細に【共通パターン P-LIST】が付き、
Excel の「共通パターン」シートにこの決まりが1回だけ出る。画面には「パターンと違うところ」だけ書く。

★ ES の決定（課題一覧 2026-10-01〜03、hong 回答）から作った。決まっていないものには「要確認」を残してあり、
  make.py --check が止める（使う前にユーザーに確認する）。ほかのプロジェクトで使うときは中身を確認し直す。
  入力の基準（文字数・数値・日付・ファイル）は references/input_standard.md。
"""

PATTERNS = {
    "P-LIST": {
        "name": ["一覧（検索・並べ替え・ページ送り）", "Danh sách (tìm kiếm, sắp xếp, phân trang)"],
        "rules": [
            ["検索条件は「検索」ボタンか Enter で反映する（入力中に一覧を変えない）。「未適用」の印は出さない（hong 2026-10-05：全部の一覧から外す）",
             "Điều kiện chỉ áp dụng khi nhấn \"検索\" hoặc Enter (không đổi danh sách khi đang nhập). Không hiện dấu \"未適用\" (hong 2026-10-05: bỏ ở mọi danh sách)."],
            ["検索条件の枠は ES Kitchen デザインシステムの es-search（マスタ一覧と同じ）：条件の欄を左に折り返し、右に「クリア」「検索」と並べ替え。欄が2行以上に折り返すときだけ開閉のボタンを出す（hong 2026-10-05：全部の一覧でそろえる）",
             "Khung điều kiện dùng es-search của ES Kitchen design system (như マスタ一覧): ô điều kiện bên trái (xuống dòng), bên phải là クリア・検索 và sắp xếp. Chỉ hiện nút đóng/mở khi ô xuống ≥2 dòng (hong 2026-10-05: đồng nhất mọi danh sách)."],
            ["1ページ 10件", "Mỗi trang 10 dòng."],
            ["「並べ替え」で並べる項目を選ぶ。初期の並びは画面ごとに書く", "Chọn mục sắp xếp ở \"並べ替え\". Thứ tự ban đầu ghi theo từng màn hình."],
            ["削除済みは既定で出さない。検索条件で「削除済み」も出せる（バッジ灰色）", "Mặc định không hiện dữ liệu đã xóa; chọn điều kiện thì hiện \"削除済み\" (badge xám)."],
            ["0件のときは I01 を一覧の中に出す", "Khi 0 dòng: hiện I01 trong danh sách."],
            ["一覧の操作（編集・削除）とヘッダーのボタン（新規登録・CSV取込）は、その機能の権限がない役割には出さない。CSV出力は閲覧できる役割すべてに出す（運営Web_権限表）",
             "Nút thao tác (sửa, xóa) và nút đầu trang (新規登録, CSV取込) không hiện với vai trò không có quyền. CSV出力 hiện với mọi vai trò xem được (運営Web_権限表)."],
            ["詳細から一覧に戻ったとき、検索条件・ページ・表示件数を戻す（タブの中だけ覚える）", "Quay lại từ chi tiết thì khôi phục điều kiện tìm kiếm, trang, số dòng (nhớ trong tab)."],
                    ["初期の並びは画面ごとに書く。書いていなければ更新日時の降順。マスタ（件数が少なく ID で探す一覧）は ID の昇順（hong 2026-10-05）",
             "Thứ tự ban đầu ghi theo từng màn hình; không ghi thì theo 更新日時 giảm dần. Master (ít dòng, tìm theo ID) thì ID tăng dần (hong 2026-10-05)."],
            ['詳細の中の表（貸出・適用・履歴など）の絞り込みは表の上のドロップダウン（既定値あり）。「○○も表示」のトグルボタンは使わない。行が多い表は一覧と同じページ送り（10／20／50件）。合計は表の全件から出す（hong 2026-10-05 共通）',
             'Lọc bảng trong màn chi tiết (cho mượn, áp dụng, lịch sử…) bằng dropdown trên bảng (có giá trị mặc định); không dùng nút toggle「○○も表示」. Bảng nhiều dòng thì phân trang 10/20/50 như danh sách. Tổng tính từ toàn bộ dòng (hong 2026-10-05, chung).'],
            ['金額の列は右寄せ（単位 円 は見出しか列の右）',
             'Cột số tiền căn phải (đơn vị 円 ở tiêu đề hoặc bên phải cột).'],
        ],
        "msgs": ["I01"],
    },
    "P-FORMBOX": {
        "name": ["保存時のチェック（まとめて表示：マスタ）", "Kiểm tra khi lưu (hiện gộp: màn hình master)"],
        "rules": [
            ["「登録」「保存」で全項目をまとめてチェックする。エラーの項目は赤枠にし、項目の下にその文言を出す（必須は E01。hong 2026/10/05）。見出しの下の赤い枠は「保存できません（n件）。赤い項目を確認してください」の1行だけ（エラーの一覧は出さない・二重に出さない。hong 2026/10/05 A 案）",
             "Nhấn 登録/保存 kiểm tra mọi mục cùng lúc. Mục lỗi viền đỏ và câu lỗi hiện ngay dưới mục (bắt buộc = E01, hong 2026/10/05). Khung đỏ dưới tiêu đề chỉ 1 dòng 「保存できません（n件）。赤い項目を確認してください」 (không liệt kê lỗi, không hiện trùng; hong 2026/10/05 phương án A)."],
            ["最初のエラーの項目がほかのタブにあれば、そのタブを開く。エラーのあるタブの見出しは赤い印を付ける", "Nếu mục lỗi đầu tiên ở tab khác thì mở tab đó. Tab có lỗi được đánh dấu đỏ ở tiêu đề tab."],
            ["エラーがなければ保存し、S01 のトーストを出して詳細へ戻る（新規登録は採番した ID の詳細へ）", "Không lỗi thì lưu, hiện toast S01 và về chi tiết (新規登録 thì về chi tiết của ID vừa cấp)."],
            ["保存ボタンは押したら無効にする（二重送信を防ぐ）。前後の空白を取り、全角の数字・英字・ハイフンは半角に直す。最大文字数を超えたら E04（切り詰めない）",
             "Khóa nút lưu sau khi nhấn. Bỏ khoảng trắng đầu/cuối, đổi toàn góc sang nửa góc. Quá độ dài thì E04 (không tự cắt)."],
            ["ほかの人が先に保存していたら E31（警告のモーダル。「上書きして保存」で自分の内容で保存できる・Message List No.43）。保存のときにログインが切れていたら、その場でログインの小窓 → ログイン後に保存を続ける",
             "Người khác lưu trước thì E31 (modal cảnh báo; 「上書きして保存」 thì lưu theo nội dung của mình, Message List No.43). Hết phiên khi lưu thì hiện cửa sổ đăng nhập rồi lưu tiếp."],
            ["入力を変えたあとに キャンセル・ほかの画面への移動・ブラウザを閉じる／再読み込み をしたら Q02（キャンセル／破棄）。hong 決定 2026-10-05",
             "Đã sửa mà nhấn キャンセル, chuyển màn hình, đóng/tải lại trình duyệt thì hiện Q02 (キャンセル／破棄). hong quyết định 2026-10-05."],
        ],
        "msgs": ["S01", "E04", "E31", "Q02"],
    },
    "P-CSV": {
        "name": ["CSV取込（画面・2ステップ）", "Nhập CSV (màn hình, 2 bước)"],
        "rules": [
            ["CSV取込は一覧の「CSV取込」から開く1つの画面（モーダルではない・hong 2026/10/05）。列の定義（テンプレート：列名・必須・長さ・チェック・データ例）は画面には出さず、画面設計書の項目定義に入力画面と同じ形で書く（hong 2026/10/05）。旧：画面の上に「CSVの列（テンプレートの定義）」の表（列名・必須・形式・値の決まり）、その下に手順「1 ファイルを選ぶ → 2 確認・登録」。UTF-8 の CSV、5,000行まで。列は CSV出力と同じ（ひな形が要るときは CSV出力を使う。テンプレート・いまのデータのボタンは置かない）。テンプレートの写しは docs/05_画面設計書/CSVテンプレート/",
             "CSV取込 là 1 màn hình mở từ nút CSV取込 ở danh sách (không phải modal, hong 2026/10/05). Định nghĩa cột template (tên, bắt buộc, độ dài, kiểm tra, ví dụ) không hiện trên màn hình mà ghi trong 設計書 như màn nhập (hong 2026/10/05). Cũ: Trên cùng là bảng 「CSVの列（テンプレートの定義）」 (tên cột, bắt buộc, định dạng, quy tắc), dưới là 2 bước: 1 chọn tệp → 2 xác nhận・đăng ký. CSV UTF-8, tối đa 5.000 dòng. Cột giống CSV出力 (cần mẫu thì dùng CSV出力; không có nút template). Bản sao template ở docs/05_画面設計書/CSVテンプレート/."],
            ["キーが一致する行は上書き、キーが空欄の行は新規（採番）。空欄のセルは今の値のまま、消すときは「-」を書く。削除は画面から（CSV ではしない）",
             "Dòng trùng khóa thì ghi đè, khóa trống thì tạo mới (cấp ID). Ô trống giữ giá trị cũ, muốn xóa giá trị thì ghi \"-\". Xóa bản ghi làm trên màn hình."],
            ["確認のステップで、件数（新規／更新／変更なし／エラー）と、エラーの行（行番号・列・内容。エラー一覧CSV も出せる）、登録する内容（前 → 後）、警告を見せる。「登録」でエラー以外の行（新規・更新）だけ登録し、エラーの行は取り込まない（hong 2026/10/05・マスタ項目一覧 一覧画面 #8。旧：1行でもエラーなら何も登録しない）。ファイル全体のエラー（列が違う・文字コード）と登録できる行がないときだけ止める。警告があるときは「警告を確認しました」のチェックが要る。登録できたら S03、できなければ E34",
             "Bước xác nhận hiện số lượng (mới / cập nhật / không đổi / lỗi), các dòng lỗi (số dòng, cột, nội dung; xuất được エラー一覧CSV), nội dung sẽ đăng ký (trước → sau), cảnh báo. Nhấn 登録 thì chỉ đăng ký các dòng không lỗi (mới, cập nhật); dòng lỗi bỏ qua (hong 2026/10/05, マスタ項目一覧 #8; cũ: 1 dòng lỗi thì không đăng ký gì). Chỉ dừng khi lỗi cả tệp (sai cột, mã ký tự) hoặc không có dòng nào đăng ký được. Có cảnh báo thì phải check 「警告を確認しました」. Xong hiện S03, lỗi hiện E34."],
            ["CSV取込のボタンは、その機能の CSV取込 の権限がある役割だけに出す", "Nút CSV取込 chỉ hiện với vai trò có quyền CSV取込."],
        ],
        "msgs": ["S03", "E34"],
    },
    "P-DEL": {
        "name": ["削除", "Xóa"],
        "rules": [
            ["「削除」で Q01 を出し、「削除する」で削除して S02。失敗は E30", "Nhấn \"Xóa\" hiện Q01; \"削除する\" thì xóa và hiện S02. Lỗi: E30."],
            ["論理削除（データは残し、ステータスを「削除済み」にする）", "Xóa logic (giữ dữ liệu, trạng thái \"削除済み\")."],
            ["契約・請求書・申請は削除しない（ステータスで扱う）", "Hợp đồng, hóa đơn, đơn đăng ký không xóa (xử lý bằng trạng thái)."],
        ],
        "msgs": ["Q01", "S02", "E30"],
    },
    "P-FORM": {
        "name": ["登録・編集フォーム（入力チェックと保存）", "Form đăng ký / sửa (kiểm tra nhập và lưu)"],
        "rules": [
            ["「保存」ですべての項目をまとめてチェックし、エラーの項目は赤枠と文言（項目の下）。必須が空なら必須のエラーだけ出す",
             "Nhấn \"Lưu\" kiểm tra mọi mục cùng lúc; mục lỗi viền đỏ, thông báo dưới mục. Mục bắt buộc để trống thì chỉ báo lỗi bắt buộc."],
            ["前後の空白を取り、全角の数字・英字・ハイフンは半角に直してからチェック・保存する", "Bỏ khoảng trắng đầu/cuối, đổi số/chữ/gạch toàn góc sang nửa góc rồi mới kiểm tra và lưu."],
            ["最大文字数を超えたらエラー（切り詰めない）。絵文字は受け付けない（E13）", "Quá số ký tự thì báo lỗi (không tự cắt). Không nhận emoji (E13)."],
            ["保存ボタンは押したら無効にする（二重送信を防ぐ）。保存できたら S01", "Khóa nút Lưu sau khi nhấn (chống gửi 2 lần). Lưu xong hiện S01."],
            ["ほかの人が開いていれば I02 を出す（ロックしない）。あとから保存した方は E31", "Người khác đang mở thì hiện I02 (không khóa). Người lưu sau bị E31."],
            ["保存のときにログインが切れていたら、その場でログインの小窓を出し、ログイン後に保存を続ける（運営で許可IPの外なら OTP も）。下書きは保存しない",
             "Khi lưu mà hết phiên: hiện cửa sổ đăng nhập ngay trên trang, đăng nhập xong thì lưu tiếp (運営 ngoài IP whitelist thì có OTP). Không lưu nháp."],
            ["入力を変えたあとに キャンセル・ほかの画面への移動・ブラウザを閉じる／再読み込み をしたら Q02 を出す（キャンセル／破棄）。hong 決定 2026-10-05",
             "Sau khi đã sửa mà nhấn キャンセル, chuyển màn hình, đóng/tải lại trình duyệt thì hiện Q02 (キャンセル／破棄). hong quyết định 2026-10-05."],
                    ["備考・説明など複数行の欄は3列分の幅（1行）にし、セクションの最後に置く（hong 2026-10-05・全画面共通）",
             "Ô nhiều dòng (備考, 説明) rộng 3 cột (1 hàng) và đặt cuối section (hong 2026-10-05, chung mọi màn hình)."],
            ["保存のエラーは項目の下の文言（インライン）で出す。運営のマスタだけ P-FORMBOX（項目の下の文言＋見出しの下に「保存できません（n件）」の1行の枠。hong 2026-10-05 同日の2回目）",
             "Lỗi khi lưu hiện inline dưới mục. Riêng master 運営 dùng P-FORMBOX (câu dưới mục + khung 1 dòng 「保存できません（n件）」 dưới tiêu đề, hong 2026-10-05 lần 2)."],
            ['詳細画面は表示だけ：入力欄・カードごとの保存ボタンを置かない。編集・新規登録の保存は画面の上の「登録／保存」1つ（カードや表ごとに保存しない。hong 2026-10-05 共通）',
             'Màn chi tiết chỉ xem: không có ô nhập hay nút lưu riêng trong card. Sửa / đăng ký mới lưu bằng 1 nút 登録／保存 ở đầu trang (không lưu theo card / bảng; hong 2026-10-05, chung).'],
            ['対象を複数から選ぶ欄（コース・機種区分・プランなど）は、チェックの先頭に「すべて」を置き既定で ON。外すと個別を選べ、1つも選ばないと E02。一覧・詳細では「すべて」と出す（hong 2026-10-05 共通）',
             'Ô chọn nhiều đối tượng (course, loại thiết bị, plan…): checkbox đầu tiên là「すべて」mặc định bật; bỏ thì chọn riêng, không chọn gì → E02. Danh sách / chi tiết hiện「すべて」(hong 2026-10-05, chung).'],
            ['金額の欄は右寄せ（単位 円 は欄の右）',
             'Ô số tiền căn phải (đơn vị 円 bên phải ô).'],
        ],
        "msgs": ["S01", "E31", "I02", "E13", "Q02"],
    },
    "P-TAB": {"name": ["タブ", "Tab"], "rules": [["タブは URL（?tab=）に持ち、再読み込み・戻るでも同じタブを開く", "Tab giữ trong URL (?tab=); tải lại / Back vẫn mở đúng tab."], ["件数があるタブは名前の後ろに件数を出す（例：要対応 3）", "Tab có số đếm thì hiện sau tên (ví dụ: 要対応 3)."], ["入力中にタブを変えても入力は消さない（保存は画面全体で1回）", "Đổi tab khi đang nhập không mất nội dung (lưu 1 lần cho cả màn hình)."]], "msgs": []},
    "P-HIST": {"name": ["変更履歴（表示だけ）", "Lịch sử thay đổi (chỉ xem)"], "rules": [["列：日時・操作した人・操作（登録／変更／削除／CSV取込／一括変更）・項目・変更前・変更後・理由（あれば）。「影響した拠点数」「バージョン」の列は持たない（マスタを変えても契約・拠点には影響しない。契約は設定した時点のマスタの値を持つ・hong 2026-10-05 共通）", "Cột: 日時, người thao tác, thao tác (登録／変更／削除／CSV取込／一括変更), mục, trước, sau, lý do (nếu có). Không có cột「影響した拠点数」「バージョン」(đổi master không ảnh hưởng hợp đồng / điểm; hợp đồng giữ giá trị lúc thiết lập, hong 2026-10-05, chung)."], ["新しいものが上。直せない・消せない", "Mới nhất ở trên. Không sửa, không xóa được."], ["1回の保存で変わった項目は1つの操作としてまとめる（項目ごとに行を分けない）", "Các mục đổi trong 1 lần lưu gộp thành 1 thao tác (không tách dòng theo mục)."]], "msgs": []},
    "P-MASTER": {
        "name": ["マスタ共通（システム定義の行・区分マスタ）", "Master chung (dòng hệ thống định nghĩa, master loại)"],
        "rules": [
            ["システムが先に定義して動きが決まる行（A型のオプション・自動で付く値引き など）は、要件（オプション・値引き_定義 §10・§11 のような一覧）で定義する。運営は作る・消すができず、直せるのは 表示名・金額・公開ステータス・利用状態・説明 だけ。一覧・詳細に「削除」を出さず、新規登録ではその種類を選べない（hong 2026-10-05 共通）",
             "Các dòng do hệ thống định nghĩa sẵn (option loại A, giảm giá tự gắn…) phải liệt kê trong yêu cầu (như オプション・値引き_定義 §10, §11). 運営 không tạo / xóa; chỉ sửa tên hiển thị, số tiền, công khai, trạng thái, mô tả. Không có nút 削除 ở danh sách / chi tiết; màn mới không chọn được loại đó (hong 2026-10-05, chung)."],
            ["「区分」（オプション区分・値引き区分 など）は固定の選択肢にせず、運営が足せる区分マスタ（名前・並び順・使用中／終了）から選ぶ。選択肢・請求書の並びは 区分の並び順 → ID。初期値は要件に書く（hong 2026-10-05 共通）",
             "「区分」(loại option, loại giảm giá…) không hard-code; chọn từ master loại mà 運営 thêm được (tên, thứ tự, đang dùng / kết thúc). Thứ tự lựa chọn và trên hóa đơn: thứ tự loại → ID. Giá trị ban đầu ghi trong yêu cầu (hong 2026-10-05, chung)."],
            ["マスタの既定の行（初期データ）と CSVテンプレートの列は、画面設計書の追加のシート「初期データ」「CSVテンプレート」に書く（seed と同じに保つ）",
             "Dòng mặc định của master (dữ liệu ban đầu) và cột CSV template ghi ở sheet bổ sung「初期データ」「CSVテンプレート」của 設計書 (giữ giống seed)."],
        ],
        "msgs": ["E02"],
    },
    "P-CSV-OUT": {
        "name": ["CSV出力", "Xuất CSV"],
        "rules": [
            ["検索条件のとおりの全件（ページに関係なく）を UTF-8（BOM あり）・CRLF で出す。日付 yyyy-mm-dd、日時 yyyy-mm-dd HH:MM、複数の値は「;」でつなぐ",
             "Xuất toàn bộ dòng theo điều kiện tìm kiếm (không phụ thuộc trang) dạng UTF-8 (có BOM), CRLF. Ngày yyyy-mm-dd, ngày giờ yyyy-mm-dd HH:MM, nhiều giá trị nối bằng「;」."],
            ["ファイル名＝画面名＋条件＋日時。出力は出力の記録に残る。終わったらトーストで件数とファイル名を出す。CSV出力の権限（閲覧できる役割すべて）",
             "Tên tệp = tên màn hình + điều kiện + ngày giờ. Lần xuất được ghi vào lịch sử xuất. Xong thì toast hiện số dòng và tên tệp. Quyền CSV出力 = mọi vai trò xem được."],
        ],
        "msgs": [],
    },
}
