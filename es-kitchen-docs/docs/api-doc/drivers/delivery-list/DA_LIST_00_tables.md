# DA_LIST_00 — 配送一覧 (Delivery List) — Field Specification Tables

> Screen ID: DA_LIST_00  
> 3 tabs: Tab A (倉庫受取), Tab B (未配送), Tab C (配送完了)

---

## Table A — Tab A: 倉庫受取 (Warehouse Receipt)

| No | 項目名 | 入力形式 | 表示条件 | MIN | MAX | 量設定形式 | 計算 | トリガー | Tên mục | Loại Input | Điều kiện hiển thị | Chỉ mở sửa | Chỉ tiêu | Trigger |
|----|--------|----------|----------|-----|-----|-----------|------|----------|---------|------------|-------------------|------------|---------|---------|
| A1 | ステータスフィルター | ドロップダウン | タブA内に表示 | 可 | - | - | 未受取・受取済・トラブル・中止全ステータス表示、選択時フィルター | 選択 | Bộ lọc trạng thái | Dropdown | Luôn hiển thị trong Tab A | Có | Chọn lại 未受取・受取済・トラブル、中止; không chọn thì hiện tất cả hàng thái | Chọn |
| A2 | キーワード入力 | テキスト | タブA内に表示 | 可 | 255 | - | 文字を検索する内容の・配送先・倉庫名・場所 | 入力 | Tìm kiếm từ khóa | Text | Luôn hiển thị trong Tab A | Có | Tìm kiếm tương tự phần trong・Tên kho・trạng thái chuyển・地; 配送 giao hàng・địa lý tải input thì tải lại | Nhập → Enter |
| A3 | 配送期間タグ | 読み取り専用 | 配送表示 | 可 | - | - | 「配送期間」配送表示 | ページ読込み | Tag loại giao hàng | Chỉ đọc | Luôn hiển thị | Không | Hiện trạng chỉ dẫn「配送期間」tag mini | Khi tải trang |
| A4 | 倉庫名・地図名 | 読み取り専用 | 配送表示 | 可 | - | - | 表示の倉庫は3日分以上し、省略[...]、詳細は設計要件確認倉庫直属で実装 | ページ読込み | Tên kho picking; hiện kho hàng chuyển | Chỉ đọc | Luôn hiển thị | Không | Nếu quá dài thì sẽ cắt hiện thị 2 dòng hiện thì cắt gọn [...]; Item đầy đủ tại màn hình chi tiết | Khi tải trang (Nếu page) |
| A5 | 納品日付 | 読み取り専用 | 配送表示 | 可 | - | - | yyyy-mm-dd（曜日）形式、納品日付が小設定お知らせ表示 | ページ読込み | Ngày giao hàng | Chỉ đọc | Luôn hiển thị | Không | Binh dạng yyyy-mm-dd (thứ)・Thủ duyệt tinh trường tu dùng trì ngày | Khi tải trang |
| A6 | ステータスバッジ | 読み取り専用 | 配送表示 | 可 | - | - | 未受取（オレンジ）/ 受取済（緑）/ トラブル | ページ読込み | Badge trạng thái | Chỉ đọc | Luôn hiển thị | Không | 未受取（cam）/ 受取済（xanh lá）/ トラブル | Khi tải trang |
| A7 | 住所 | 読み取り専用 | 配送表示 | 可 | - | - | 表示の倉庫名 [...]...詳細は設計で検討する変更実装 | ページ読込み | Địa chỉ | Chỉ đọc | Luôn hiển thị | Không | Nếu quá dài thì cắt gọn [...]...Item đầy đủ hiện bên chi tiết | Khi tải trang |
| A8 | 数量・計算 | 読み取り専用 | 配送表示 | 可 | - | - | その金額で下位の社名、発配送先の組織名表示、数量は箱/個の構成 | ページ読込み | Tổng hợp số lượng | Chỉ đọc | Luôn hiển thị | Không | Tổng số hàng du kiến nhận tại kho. Đơn hàng/số món | Khi tải trang |
| A9 | 配送先（先明細） | 読み取り専用 | 配送表示 | 可 | - | - | その金額で下位の各社の配送先の組織名表示、数量は表示しないのは変更。よく使うは未来配達量全表示 | ページ読込み | Tổng hợp số lượng (chi tiết) | Chỉ đọc | Luôn hiển thị | Không | Tổng số hàng du kiến nhận tại kho. Đơn hàng từ import mã vận đơn, chưa khi được có bao nhiều thùng, thì để trống | Khi tải trang |
| A10 | 詳細（先社名） | 読み取り専用 | 洗練後1つの金額の入れ具合 | アイコン「ー」内の出品、名・属性（正式確認していないが、よく実はないものは無し表示 | 数 lượng hàng (detail) | Chỉ hiển thị ở 0 | Chỉ đọc | Luôn hiển thị | Không | icon・trạng luyết; Tumiqi = 0thì「発想」・Hiển thị = quá khó (đã picking)・「実態」・配送中（in-wait picking)・未確定 | Khi tải trang |
| A11 | 詳細情報（先配送） | 読み取り専用 | 洗練後1つの金額の入れ具合 | ページ読込み | Số lượng hàng (detail) | Chỉ hiển thị ở 0 | Chỉ đọc | Luôn hiển thị | Không | icon・Tumiqi =「発想」・Hiển thị = quá khó (đã picking)「実態」・配送中（in-wait picking)・未確定 | Khi tải trang |
| A12 | カードタップ（選択遷移） | ボタン | タップで物流詳細遷移 | 画面に直接あり、遷移先確認以下 | クリック | Nhấn vào | Nút | Luôn hiển thị | - | Nhấn chuyển đến màn hình chi tiết nhận hàng。+ 未受取 Detail hiện trên + mở sổ xác nhận・配送・受取済・トラブル・Fyi・データ・会計遷移 | Click |

---

## Table B — Tab B: 未配送 (Undelivered)

| No | 項目名 | 入力形式 | 表示条件 | MIN | MAX | 量設定形式 | 計算 | トリガー | Tên mục | Loại Input | Điều kiện hiển thị | Chỉ mở sửa | Chỉ tiêu | Trigger |
|----|--------|----------|----------|-----|-----|-----------|------|----------|---------|------------|-------------------|------------|---------|---------|
| B1 | 倉庫・中継フィルター | ドロップダウン（複数選択可） | タブB内に表示 | - | - | タブB上記選択 | 選 | Bộ lọc kho・trung chuyển | Dropdown (chọn nhiều) | Luôn hiển thị trong Tab B | Có | Chọn nhiều kho・trung chuyển thì hiển thị. Không chọn thì hiện tất cả. Cách lọc trạm chuyển hàng | Chọn |
| B2 | フリーテキスト入力 | テキスト | タブB内に表示 | 6 | 255 | タブB内に表示 | 可 | 入力・Enterキー | Tìm kiếm văn bản tự do | Text | Luôn hiển thị trong Tab B | Có | Tìm kiếm tương tự phần trong hàng - 配送先, Hiện Các dữ liệu, Địa bạn input | Nhập → Enter |
| B3 | 配送名 | 読み取り専用 | 配送表示 | - | - | 配送表示 | 可 | ページ読込み | Tên điểm: tên công ty | Chỉ đọc | Luôn hiển thị | Không | Tên tương ứng phần trang; Tên dấm phẩm hàng - 配送先, Hiện Các dữ liệu. Địa bạn input (chọn kho trung cùng chuyển hàng hiện tố) | Khi tải trang |
| B4 | 配送期間アイコン | 読み取り専用 | 配送表示 | - | - | 配送表示 | 可 | ページ読込み | Icon loại giao hàng | Chỉ đọc | Luôn hiển thị | Không | Hiện thị icon chọn loại [配送完了 COOL系 を運動]のたアイコン識別 | Khi tải trang |
| B5 | 納品日付 | 読み取り専用 | 配送表示 | - | - | 配送表示 | 可 | ページ読込み | Ngày giao hàng | Chỉ đọc | Luôn hiển thị | Không | Ngày giao hàng yyyy-mm-dd（曜日）形式 | Khi tải trang |
| B6 | ステータスバッジ | 読み取り専用 | 配送表示 | - | - | 配送表示 | 可 | ページ読込み | Badge trạng thái | Chỉ đọc | Luôn hiển thị | Không | 未配送（オレンジ）/トラブル（赤） | Khi tải trang |
| B7 | 倉庫名 | 読み取り専用 | 配送表示 | - | - | 配送表示 | 可 | ページ読込み | 倉庫名 | Chỉ đọc | Luôn hiển thị | Không | Hiện thị kho xuất kho sẽ. Tên kho hoặc đặt ở trạm chuyển hàng. そのまま上部場と合算表示をみなし | Khi tải trang |
| B8 | 住所 | 読み取り専用 | 配送表示 | - | - | 配送表示 | 可 | ページ読込み | Địa chỉ | Chỉ đọc | Luôn hiển thị | Không | Địa chỉ đầy đủ của điểm giao hàng. Dạng gọn tên thì nếu dài→cắt gọn [.../chuyển gì?] | Khi tải trang |
| B9 | 明細 | 読み取り専用 | 配送表示 | - | - | 配送表示 | 可 | ページ読込み | Số lượng | Chỉ đọc | Luôn hiển thị | Không | 品目・(正式確認面書)（予想）・配送・品数（ビッキング完了)（・確認可能・公差） | Khi tải trang |
| B10 | 品目（実量） | 読み取り専用 | - | - | - | 配送表示 | 可 | ページ読込み | Số lượng (thực) | Chỉ đọc | Luôn hiển thị | Không | 入庫・実量確認後の（正式確認面書）（予想）・品数（ビッキング完了)（確認可能・公差） | Khi tải trang |
| B11 | 品目（実体） | 読み取り専用 | - | - | - | 配送表示 | 可 | ページ読込み | Số lượng (thực tế) | Chỉ đọc | Luôn hiển thị | Không | アイコン・数量・配送先・（正式確認面書）（予想）・品数（ビッキング完了)（品・確認可能・公差（ビッキング完了）・遷移の識別） | Khi tải trang |
| B12 | カードタップ（選択遷移） | ボタン | - | - | - | 配送表示 | クリック | Nhấn vào thẻ chuyển màn | Nút | Luôn hiển thị | - | Nhấn chuyển đến màn hình chi tiết配送 hoặc COOL系配送遷移。大類, 詳細遷移先は（前面）Quan lý tuyến・土壁台 [詳細 trung Tuyến] ,「1st(曜日 （ 〇〇な日の配送の変更 ）・トラブル・データ・会計遷移一覧表示の識別対象一覧表示.] | Click |

---

## Table C — Tab C: 配送完了 (Delivery Completed)

| No | 項目名 | 入力形式 | 表示条件 | MIN | MAX | 量設定形式 | 計算 | トリガー | Tên mục | Loại Input | Điều kiện hiển thị | Chỉ mở sửa | Chỉ tiêu | Trigger |
|----|--------|----------|----------|-----|-----|-----------|------|----------|---------|------------|-------------------|------------|---------|---------|
| C1 | 倉庫・中継フィルター | ドロップダウン（複数選択可） | - | タブC内に表示 | 可 | タブB上記選択 | 選択 | Bộ lọc kho・trung chuyển (nhiều) | Dropdown (chọn nhiều) | Luôn hiển thị trong Tab C | Có | Cùng tính năng với với Tab B | Chọn |
| C2 | フリーテキスト入力 | テキスト | 6 | 255 | タブC内に表示 | 可 | タブB上記同様 | 入力・Enterキー | Tìm kiếm văn bản tự do | Text | Luôn hiển thị trong Tab B | Có | Cùng tính năng số với Tab B | Nhập → Enter |
| C3 | 配送名 | 読み取り専用 | - | - | - | 配送表示 | 可 | ページ読込み | Tên điểm: tên công ty | Chỉ đọc | Luôn hiển thị | Không | Cùng thông số với Tab B | Khi tải trang |
| C4 | 配送期間アイコン | 読み取り専用 | - | - | - | 配送表示 | 可 | ページ読込み | Icon loại giao hàng | Chỉ đọc | Luôn hiển thị | Không | Cùng thông số với Tab B | Khi tải trang |
| C5 | 納品日付 | 読み取り専用 | - | - | - | 配送表示 | タブB上記同. yyyy-mm-dd（曜日）形式 | ページ読込み | Ngày giao hàng | Chỉ đọc | Luôn hiển thị | Không | Cùng thông số với Tab B. Binh dạng yyyy-mm-dd (thứ) | Khi tải trang |
| C6 | ステータスバッジ | 読み取り専用 | - | - | - | 配送表示 | 可 | 配送完了（緑）/xanh | ページ読込み | Badge trạng thái | Chỉ đọc | Luôn hiển thị | Không | CH「配送完了」/xanh lá | Khi tải trang |
| C7 | 倉庫・中継先名 | 読み取り専用 | - | - | - | 配送表示 | タブB上記同様 | ページ読込み | Tên kho・trung chuyển | Chỉ đọc | Luôn hiển thị | Không | Cùng thông số với Tab B | Khi tải trang |
| C8 | 住所 | 読み取り専用 | - | - | - | 配送表示 | タブB上記同様。それ含む配送先の住所を含む。配送先名と住所表示をみなし全部対象一覧をセットする | ページ読込み | Địa chỉ | Chỉ đọc | Luôn hiển thị | Không | Cùng thông số với Tab B. Hiển thị đầy đủ cả số lần và trạng thái khi tải trang | Khi tải trang |
| C9 | 明細 | 読み取り専用 | - | - | - | 配送表示 | 品目・(正式確認面書)（予想）・配送・品数（ビッキング完了） | ページ読込み | Số lượng | Chỉ đọc | Luôn hiển thị | Không | Tương tự・loại 品目(明)・Hiện trạ・quá khó（ đã picking)・（thưa) 明日、: Hiện trạ quá khó sửa chuyển picking）: ... | Khi tải trang |
| C10 | 品目（実量） | 読み取り専用 | - | - | - | 配送表示 | アイコン・数量確認数（正式確認面書）（予想）・品数（ビッキング完了)のも確認の結合表示 | ページ読込み | Số lượng (thực tế) | Chỉ đọc hiểu thị ở 0 và「配送 hàng」 | Chỉ đọc | Không | icon・1 item; Tương tự・loại 品目(明)・Hiến trạ・quá khó（ đã picking)・（thưa) 明日、: Hiến trạ quá khó・sửa chuyển picking）: ... | Khi tải trang |
| C11 | 品目（実体） | 読み取り専用 | - | - | - | 配送表示 | アイコン・数量・配送先 (正式確認面書)（予想）・品数 (ビッキング完了)（品・確認可能・公差（ビッキング完了）・遷移の識別 | ページ読込み | Số lượng (đồng kiểm tra ở 0 và「配送 hàng」) | Chỉ đọc | Không | icon・trạng luyết; Tumiqi=「配送」(thưa) 明日、「Hiến trạ・quá khó」( Đã picking）・Àn... | Khi tải trang |
| C12 | カードタップ（選択遷移） | ボタン | - | - | - | 配送表示 | タップで配送詳細まとは COOL系配送遷移。大類、詳細遷移先は（配送）Quan lý tuyến「1st(曜 （ 〇〇な日の配送の変更 ）・トラブル・データ・会計遷移一覧表示 | クリック | Nhấn vào thẻ chuyển màn | Nút | Luôn hiển thị | - | Nhấn chuyển đến màn hình chi tiết配送 hoặc COOL系. Quan lý tuyến「 1st Day 」「 〇〇 trung (Toàn bộ) ・ トラブル ・ データ ・ 会計遷移」 | Click |

---

## Notes / Ghi chú

- Tất cả 3 tab dùng chung bottom navigation (ホーム・マニュアル・配送一覧・トラブル・アカウント)
- Tab active được highlight (配送一覧 = active)
- Filter header cố định khi scroll
- Card list hỗ trợ infinite scroll / lazy load
- Khi không có data → hiện empty state message
