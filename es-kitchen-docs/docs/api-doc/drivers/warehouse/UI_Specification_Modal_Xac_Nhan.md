# ĐẶC TẢ THÀNH PHẦN GIAO DIỆN (UI COMPONENT SPECIFICATION)

## Thông tin chung (概要)
* **Tên Modal (モーダル名):** B. 受取完了確認モーダル（一部未受取あり時のみ表示） / Modal xác nhận nhận hàng (chỉ hiển thị khi còn mục chưa nhận)
* **Điều kiện hiển thị (表示条件):** 「完了」タップ時に1件以上の未チェックアイテムが存在する場合 / Khi nhấn「完了」và còn $\ge$ 1 mục chưa được check

---

## 1. Bảng Đặc Tả Tiếng Việt (ベトナム語定義)

| No | Tên mục | Loại input | Điều kiện hiển thị | Có thể sửa | Chi tiết | Trigger | Validation | Error message |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **B.1** | Tiêu đề modal 「荷物の受取は完了しましたか？」 | Chỉ đọc | Trong khi hiển thị modal | Không | Text cố định | Chỉ xem | - | - |
| **B.2** | Icon kiện hàng | Chỉ đọc | Trong khi hiển thị modal | Không | Hình ảnh icon trang trí | Chỉ xem | - | - |
| **B.3** | Nội dung text | Chỉ đọc | Trong khi hiển thị modal | Không | Text cố định: 「一部の荷物が未確認の状態です。すべて受取していない場合は、ESキッチンまでご連絡ください。」 | Chỉ xem | - | - |
| **B.4** | Checkbox 「未受取分は、ESキッチンへ連絡済みです。」 | Checkbox | Trong khi hiển thị modal | Có | Trạng thái ban đầu: chưa check. Có thể check thủ công. Tự động check khi nhấn B.5 「ESへ電話する」. Khi đã check: kích hoạt nút B.6 | Click / Tự động | - | - |
| **B.5** | Nút 「ESへ電話する」 (050-5784-2777) | Nút | Trong khi hiển thị modal | - | Nhấn để mở app điện thoại gọi đến 050-5784-2777. Đồng thời tự động check B.4 và kích hoạt B.6 | Click | - | - |
| **B.6** | Nút hoàn thành - giữ lại một phần | Nút | Trong khi hiển thị modal | - | Trạng thái ban đầu: vô hiệu hóa (grayout). Điều kiện kích hoạt: B.4 đã check HOẶC B.5 đã được nhấn. Nhấn: hoàn thành nhận hàng dù còn mục chưa nhận $\rightarrow$ chuyển về màn hình Home | Click | B.4 đã check hoặc B.5 đã được nhấn | Trước khi kích hoạt: nút vô hiệu hóa, không có thông báo lỗi |
| **B.7** | Nút Hủy | Nút | Trong khi hiển thị modal | - | Nhấn để đóng modal và quay về màn hình chi tiết. Trạng thái check của các mục được giữ nguyên | Click | - | - |

---

## 2. Bảng Đặc Tả Tiếng Nhật gốc (日本語定義)

| No | 項目名 | 入力形式 | 表示条件 | 編集可否 | 詳細 | トリガー | バリデーション | エラーメッセージ |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **B.1** | モーダルタイトル「荷物の受取は完了しましたか？」 | 読み取り専用 | モーダル表示中 | 不可 | 固定テキスト | 閲覧のみ | - | - |
| **B.2** | 荷物アイコン | 読み取り専用 | モーダル表示中 | 不可 | 装飾用画像アイコン | 閲覧のみ | - | - |
| **B.3** | 本文テキスト | 読み取り専用 | モーダル表示中 | 不可 | 固定テキスト：「一部の荷物が未確認の状態です。すべて受取していない場合は、ESキッチンまでご連絡ください。」 | 閲覧のみ | - | - |
| **B.4** | チェックボックス「未受取分は、ESキッチンへ連絡済みです。」 | チェックボックス | モーダル表示中 | 可 | 初期状態：未チェック。手動チェック可。B.5「ESへ電話する」タップ時に自動チェックされる。チェック済みになるとB.6「一部保留のまま完了」ボタンが活性化する | クリック / 自動入力 | - | - |
| **B.5** | ESへ電話するボタン (050-5784-2777) | ボタン | モーダル表示中 | - | タップで端末の電話アプリを起動し050-5784-2777へ発信。発信操作と同時にB.4を自動チェックし、B.6を活性化する | クリック | - | - |
| **B.6** | 一部保留のまま完了ボタン | ボタン | モーダル表示中 | - | 初期状態：非活性（グレーアウト）。活性化条件：B.4がチェック済み または B.5がタップ済み（いずれか一方）。タップで一部未受取のまま完了処理を実行し、ホーム画面へ遷移する | クリック | B.4チェック済み または B.5タップ済み | 活性化前はタップ不可（グレーアウト）のためエラーメッセージなし |
| **B.7** | キャンセルボタン | ボタン | モーダル表示中 | - | タップでモーダルを閉じ、詳細画面へ戻る。各アイテムのチェック状態は維持される | クリック | - | - |

---

## 3. Chi tiết chi tiết từng thành phần (Chi tiết bổ sung)

### B.4 & B.5 Mối quan hệ Logic:
* Khi người dùng click vào **B.5 (ESへ電話するボタン)**, hệ thống sẽ tự động thực hiện hành động tích chọn cho ô **B.4 (Checkbox)**.
* Nút **B.6 (一部保留のまま完了ボタン)** chỉ được chuyển sang trạng thái hoạt động (Active) khi tích vào **B.4** hoặc đã bấm **B.5**.

### Điều hướng (画面遷移):
* **B.6:** Xử lý hoàn tất một phần $\rightarrow$ Chuyển về **Màn hình chính (Home)**.
* **B.7:** Đóng modal $\rightarrow$ Quay lại **Màn hình chi tiết (詳細画面)** và giữ nguyên trạng thái check trước đó.
