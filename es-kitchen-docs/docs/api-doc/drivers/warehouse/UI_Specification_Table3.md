# Tài liệu Đặc tả Giao diện (UI Specification) - Table 3

## C. 完了トースト（全アイテム受取済み時） / Toast hoàn thành (Khi tất cả mục đã nhận)

**表示条件 / Điều kiện hiển thị:** * **Tiếng Nhật:** 「完了」タップ時にリスト内の全アイテムがチェック済みの場合
* **Tiếng Việt:** Khi nhấn 「完了」 và TẤT CẢ mục đã được check

### Bảng chi tiết (Song ngữ Nhật - Việt)

| No | Tên mục / 項目名 | Loại input / 入力形式 | Điều kiện hiển thị / 表示条件 | Có thể sửa / 編集可否 | Chi tiết / 詳細 | Trigger / トリガー |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **C.1** | **JP:** 完了トーストメッセージ<br>**VN:** Toast thông báo hoàn thành | **JP:** 読み取り専用<br>**VN:** Chỉ đọc | **JP:** 全アイテムチェック済みで「完了」タップ時<br>**VN:** Khi nhấn 「完了」 và TẤT CẢ mục đã check | **JP:** 不可<br>**VN:** Không | **JP:** 固定テキスト：「荷物の受取は完了しました。」。モーダルは表示しない。5秒後に自動消去。トースト表示後、ホーム画面へ遷移する<br>**VN:** Text cố định: 「荷物の受取は完了しました。」 . Không hiển thị modal. Tự động ẩn sau 5 giây. Sau khi hiện toast: chuyển về màn hình Home | **JP:** ページ読込時<br>**VN:** Khi tải trang |

---

## D. 編集破棄確認ポップアップ / Popup xác nhận hủy chỉnh sửa

**表示条件 / Điều kiện hiển thị:** * **Tiếng Nhật:** チェックボックスを1件以上操作した状態で戻るボタンをタップした場合
* **Tiếng Việt:** Khi nhấn nút quay lại sau khi đã thao tác ≥1 checkbox

### Bảng chi tiết (Song ngữ Nhật - Việt)

| No | Tên mục / 項目名 | Loại input / 入力形式 | Điều kiện hiển thị / 表示条件 | Có thể sửa / 編集可否 | Chi tiết / 詳細 | Trigger / トリガー |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **D.1** | **JP:** ポップアップタイトル「編集内容を破棄しますか？」<br>**VN:** Tiêu đề popup 「編集内容を破棄しますか？」 | **JP:** 読み取り専用<br>**VN:** Chỉ đọc | **JP:** ポップアップ表示中<br>**VN:** Trong khi hiển thị popup | **JP:** 不可<br>**VN:** Không | **JP:** 固定テキスト<br>**VN:** Text cố định | **JP:** 閲覧のみ<br>**VN:** Chỉ xem |
| **D.2** | **JP:** 本文テキスト<br>**VN:** Nội dung text | **JP:** 読み取り専用<br>**VN:** Chỉ đọc | **JP:** ポップアップ表示中<br>**VN:** Trong khi hiển thị popup | **JP:** 不可<br>**VN:** Không | **JP:** 固定テキスト：「編集中の内容は保存されません。編集内容を破棄してもよろしいですか？」<br>**VN:** Text cố định: 「編集中の内容は保存されません。編集内容を破棄してもよろしいですか？」 | **JP:** 閲覧のみ<br>**VN:** Chỉ xem |
| **D.3** | **JP:** キャンセルボタン<br>**VN:** Nút Hủy | **JP:** ボタン<br>**VN:** Nút | **JP:** ポップアップ表示中<br>**VN:** Trong khi hiển thị popup | **JP:** -<br>**VN:** - | **JP:** タップでポップアップを閉じ、荷物受取一覧画面に戻る（チェック状態・入力内容を維持）<br>**VN:** Nhấn để đóng popup và quay về màn hình danh sách nhận hàng (giữ nguyên trạng thái check và nội dung đã nhập) | **JP:** クリック<br>**VN:** Click |
| **D.4** | **JP:** 破棄ボタン<br>**VN:** Nút Hủy bỏ | **JP:** ボタン<br>**VN:** Nút | **JP:** ポップアップ表示中<br>**VN:** Trong khi hiển thị popup | **JP:** -<br>**VN:** - | **JP:** タップで編集内容を破棄し、直前の画面へ遷移する（チェック状態・入力内容はすべて破棄）<br>**VN:** Nhấn để hủy toàn bộ nội dung chỉnh sửa và quay về màn hình trước (toàn bộ trạng thái check và nội dung nhập bị xóa) | **JP:** クリック<br>**VN:** Click |

---

## Bản dịch tiếng Việt thuần túy (Dành cho Dev/Tester Việt Nam)

### C. Toast hoàn thành (Khi tất cả mục đã nhận)
* **Điều kiện hiển thị:** Khi nhấn 「完了」 và TẤT CẢ mục đã được check

| No | Tên mục | Loại input | Điều kiện hiển thị | Có thể sửa | Chi tiết | Trigger |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| C.1 | Toast thông báo hoàn thành | Chỉ đọc | Khi nhấn 「完了」 và TẤT CẢ mục đã check | Không | Text cố định: 「荷物の受取は完了しました。」. Không hiển thị modal. Tự động ẩn sau 5 giây. Sau khi hiện toast: chuyển về màn hình Home | Khi tải trang |

### D. Popup xác nhận hủy chỉnh sửa
* **Điều kiện hiển thị:** Khi nhấn nút quay lại sau khi đã thao tác ≥1 checkbox

| No | Tên mục | Loại input | Điều kiện hiển thị | Có thể sửa | Chi tiết | Trigger |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| D.1 | Tiêu đề popup 「編集内容を破棄しますか？」 | Chỉ đọc | Trong khi hiển thị popup | Không | Text cố định | Chỉ xem |
| D.2 | Nội dung text | Chỉ đọc | Trong khi hiển thị popup | Không | Text cố định: 「編集中の内容は保存されません。編集内容を破棄してもよろしいですか？」 | Chỉ xem |
| D.3 | Nút Hủy | Nút | Trong khi hiển thị popup | - | Nhấn để đóng popup và quay về màn hình danh sách nhận hàng (giữ nguyên trạng thái check và nội dung đã nhập) | Click |
| D.4 | Nút Hủy bỏ | Nút | Trong khi hiển thị popup | - | Nhấn để hủy toàn bộ nội dung chỉnh sửa và quay về màn hình trước (toàn bộ trạng thái check và nội dung nhập bị xóa) | Click |
