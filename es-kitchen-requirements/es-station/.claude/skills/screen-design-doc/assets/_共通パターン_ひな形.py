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
            ["検索条件は「検索」ボタンか Enter で反映する。条件を変えて未反映のときは「未適用」と出す（入力中に一覧を変えない）",
             "Điều kiện chỉ áp dụng khi nhấn \"検索\" hoặc Enter. Đổi mà chưa áp dụng thì hiện \"未適用\" (không đổi danh sách khi đang nhập)."],
            ["1ページ 10件", "Mỗi trang 10 dòng."],
            ["「並べ替え」で並べる項目を選ぶ。初期の並びは画面ごとに書く", "Chọn mục sắp xếp ở \"並べ替え\". Thứ tự ban đầu ghi theo từng màn hình."],
            ["削除済みは既定で出さない。検索条件で「削除済み」も出せる（バッジ灰色）", "Mặc định không hiện dữ liệu đã xóa; chọn điều kiện thì hiện \"削除済み\" (badge xám)."],
            ["0件のときは I01 を一覧の中に出す", "Khi 0 dòng: hiện I01 trong danh sách."],
        ],
        "msgs": ["I01"],
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
            ["入力中に画面を離れるときに Q02 を出すか（要確認）", "Có hiện Q02 khi rời màn hình đang nhập không (cần xác nhận)."],
        ],
        "msgs": ["S01", "E31", "I02", "E13", "Q02"],
    },
}
