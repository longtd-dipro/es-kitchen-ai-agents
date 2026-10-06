# 確認メモ：運営Web お客様対応（レビュー・ご意見／お知らせ一覧／お問い合わせ）— Ghi chú rà soát trước khi viết 画面設計書

Ngày: 2026-10-05 ／ Người rà: Claude (cloud) ／ 領域 運営F (còn lại sau アンケート管理) ／ Nguồn: code thật (`app/ops/reviews/**`, `lib/ops/reviews/*`, `lib/ops/areas/reviews.ts`; `app/ops/notices/**`, `app/ops/_general/gen.ts` (notices), `lib/ops/general/{logic,fromDomain,seed}.ts`, `lib/ops/areas/general.ts`, `lib/domain/areas/notice.ts`, `lib/domain/mails.ts`; `app/ops/inquiries/page.tsx`, `app/corp/contact/page.tsx`), `docs/決定台帳.md` (K「レビューを法人に見せる範囲」, M「お客様の休みの日に当たる知らせ」「お知らせ」「お問い合わせ（HubSpot）」, B「お知らせ配信（全サイト）」), `docs/01_仕様/80_運営・法人の画面/運営・法人の画面.md` §3・§5, `運営Web_権限表_20261003.md`, `CSV入出力_定義_20261003.md`, `画面コード規約_20261005.md`, Message List CSV.

Quy ước: **[Q]** cần hong trả lời ／ **[宿題]** đã chốt, code chưa theo → 設計書 theo quyết định + `demo_ok` ／ **[open]** hỏi khách ／ **[msg]** câu chữ message (dải 運営F: E200〜E219 đã dùng tới E219 cho アンケート → phần này dùng **E220〜**? → xem Q-C3).

---

## 1. Phạm vi và trạng thái (VIEWS) đề xuất

Screen Code theo 画面コード規約 (Feature 4 chữ): **AW_REVI** (レビュー), **AW_NOTI** (お知らせ; Figma Notification Management đã dùng AW_NOTI_001〜009), **AW_INQU** (お問い合わせ). Book: 運営管理者Web_お客様対応 (cùng với AW_SURV).

### 1-1. レビュー・ご意見 (AW_REVI) — chỉ xem・tìm・CSV出力 (hong 2026-09-28)

| Screen | Code | Trạng thái | URL / cách tạo |
|---|---|---|---|
| レビュー一覧 | AW_REVI_001 | 001 初期表示 | `/ops/reviews` |
| | | 002 未適用 | gõ キーワード chưa 検索 |
| | | 003 0件 | từ khóa không có + 検索 |
| | | 004 並べ替えメニュー | nhấn 並べ替え |
| | | 005 「他N品を表示」を開いた | nhấn 他N品を表示 ở dòng có ≥3 商品 |
| | | 006 ★2以下で絞り込み | 評価 = ★2以下 + 検索 |
| レビュー詳細 | AW_REVI_002 | 007 初期表示 | `/ops/reviews/RV001064` (có コメント) |
| | | 008 コメントなし・退会済・匿名 | RV của user 退会 / nickname trống |

Mục dự kiến: 一覧 ≈ 25 ／ 詳細 ≈ 20.

### 1-2. お知らせ一覧 (AW_NOTI)

| Screen | Code | Trạng thái | URL / cách tạo |
|---|---|---|---|
| お知らせ一覧 | AW_NOTI_001 | 001 初期表示 | `/ops/notices` |
| | | 002 未適用 ／ 003 0件 ／ 004 削除済みを表示 | như các 一覧 khác |
| | | 005 削除の確認 | ゴミ箱 |
| お知らせ新規登録・編集 | AW_NOTI_002 | 006 新規 初期表示 | `/ops/notices/new` |
| | | 007 配信対象の個別選択（モーダル） | 法人・拠点 → 個別選択 → 選択する |
| | | 008 個別選択 CSV取込（モーダル） | nút CSV取込 trong modal 個別選択 |
| | | 009 メール送信あり（メール設定の欄） | tích メール送信 → hiện 件名・差出人・日時指定・メール本文・署名欄 |
| | | 010 重要 | tích 重要 → hint おすすめの送信日時 |
| | | 011 入力エラー | 登録 khi trống |
| | | 012 編集 公開中 | `/ops/notices/12446/edit` |
| | | 013 編集内容の破棄 | sửa rồi キャンセル |
| お知らせ詳細 | AW_NOTI_003 | 014 公開中（添付・送信の記録あり） | `/ops/notices/12446` |
| | | 015 予約中 ／ 016 配信停止 ／ 017 終了 ／ 018 削除済 | 12448 ／ 12444 ／ 12447 ／ 12445 |
| | | 019 削除確認（モーダル） | nút 削除 |
| | | 020 配信停止の確認（モーダル） | **chưa có trong code** (Q-N3) |

Mục dự kiến: 一覧 ≈ 28 ／ 登録・編集 ≈ 45 ／ 詳細 ≈ 20.

### 1-3. お問い合わせ（法人Webから）(AW_INQU)

| Screen | Code | Trạng thái | URL / cách tạo |
|---|---|---|---|
| お問い合わせ一覧 | AW_INQU_001 | 001 初期表示（新着あり） | `/ops/inquiries` |
| | | 002 行を開いた（本文・新着が外れる） | nhấn dòng IQ-261003-0001 |
| | | 003 0件 | (search sau khi thêm 検索: Q-I1) |

Mục dự kiến ≈ 18.

---

## 2. Điểm cần hong quyết định [Q]

### Chung (C)
- **Q-C1. Screen Code**: `AW_REVI` (Review), `AW_NOTI` (Figma), `AW_INQU` (Inquiry). OK?
- **Q-C2. Tên trạng thái「予約中」(お知らせ) ↔「予定中」(アンケート)**: cùng nghĩa "chưa tới ngày bắt đầu". Đề xuất thống nhất **「予定中」** (lib/format/status.ts đã có cả hai, cùng màu xanh dương). A: 予定中 cho cả hai ／ B: giữ mỗi màn một tên.
- **Q-C3. Dải message**: 運営F được cấp E200〜E219 (20 số), アンケート đã dùng hết. お知らせ・レビュー・お問い合わせ cần ≈ 8 message mới. Đề xuất dùng tiếp **E220〜E229** (dải 運営G マスタ(1) là E220〜E239 nhưng 運営G đã xong và chỉ dùng E33〜E50 cũ). A: dùng E220〜 ／ B: hong cấp dải khác.
- **Q-C4. Tên nhóm menu / パンくず**: menu là「お客様対応」nhưng パンくず trong code của お知らせ・お問い合わせ ghi「お知らせ設定」; tiêu đề お問い合わせ là「お問い合わせ（HubSpot 送信）」còn menu ghi「お問い合わせ（法人Webから）」. Đề xuất: パンくず「お客様対応」, tiêu đề「お問い合わせ（法人Webから）」.

### レビュー・ご意見 (R)
- **Q-R1. ID**: code RV＋6桁 (RV001064), ユーザーID U＋8桁, 注文番号 OD＋7桁 (DemoNote ghi「要確認」). Chốt như code?
- **Q-R2. CSV出力**: 1行＝1商品 (lặp cột レビュー: レビューID・投稿日時・ユーザーID・ニックネーム・退会・法人ID・法人・拠点ID・拠点・注文番号・商品ID・商品名・評価・評価タグ・コメント), theo điều kiện tìm kiếm, không có メールアドレス (DemoNote「要確認」). Chốt?
- **Q-R3. Link ở 詳細**: ユーザーID・注文番号・法人・拠点・商品ID hiện là link giả (không đi đâu). Đề xuất: 法人 → 法人詳細, 拠点 → 拠点詳細, 商品ID → 商品マスタ詳細, ユーザーID → アカウント一覧 (ユーザー tab), 注文番号 = chữ thường (không có màn đơn app ở 運営). A: như đề xuất ／ B: tất cả chỉ là chữ.
- **Q-R4. 1 trang**: code mặc định 20 dòng (10/20/50). STEP7 L1 = 10. → 宿題 (viết 10) trừ khi hong muốn 20 cho màn này.
- **Q-R5. 評価タグ cố định** (không có master; ★1〜2 = 不満タグ 6 cái, ★3〜5 = 満足タグ 6 cái). Xác nhận? (hong 2026-09-28 theo DemoNote, chưa có trong 台帳).

### お知らせ一覧 (N)
- **Q-N1. ID của お知らせ**: code là số 5 chữ số (12444…). Các chức năng khác có tiền tố (SV-, IQ-, AP-…). Đề xuất **「NT-＋5桁」** tự cấp. A: NT-＋5桁 ／ B: giữ số ／ C: khác.
- **Q-N2. カテゴリ**: code cố định 3 giá trị お知らせ／メンテナンス／システム更新, nhưng seed có「メニュー」(12454). Chốt danh sách? Đề xuất 4: お知らせ／メニュー／メンテナンス／システム更新, cố định (không master).
- **Q-N3. 配信停止**: 一覧 có trạng thái 配信停止 nhưng **không có nút** để dừng (chỉ dừng được khi 削除). Đề xuất như アンケート: nút 配信停止 ở 詳細 và cột thao tác 一覧 (公開中・予定中), xác nhận Q, không hoàn lại; 配信停止 không 編集, 削除 được.
- **Q-N4. 「ESSへお知らせ」**: cột tick trong bảng 配信対象 dùng chữ「ESS」. 台帳: tên hệ thống là「ES STATION」, không dùng「ESSTATION」「ESステーション」. Đề xuất đổi thành **「サイトに表示」** (hiện trong お知らせ一覧 của site/app đó). A: サイトに表示 ／ B: ES STATION に表示 ／ C: giữ ESS.
- **Q-N5. 差出人 mail**: code cố định「ESキッチン運営事務局 <no-reply@es-kitchen.jp>」, 署名欄 cố định có `{info@es-kitchen.co.jp}`. 台帳 B: メール送信元は システム管理 quản lý. Đề xuất: 設計書 ghi「システム管理の設定から読む（初期値は見本）」, giá trị thật → **[open] hỏi khách**.
- **Q-N6. メール本文 必須?**: label có * nhưng validate không kiểm tra; 日時指定 必須 khi có メール送信. Đề xuất: 必須 (theo label) khi có メール送信. 
- **Q-N7. 表示開始日時・終了日時**: code là ô text gõ `yyyy-mm-dd HH:mm`. Chuẩn: dùng 日付の部品 + 時刻 như アンケート → 宿題 (không hỏi). 表示終了日時 trống = không kết thúc (giữ).
- **Q-N8. 添付ファイル**: code demo chỉ đếm số file. 設計書 ghi theo input_standard (JPG・PNG・PDF・HEIC, 5MB, 10件), tải được ở 詳細, không đính kèm mail (RD-NT-019). OK?
- **Q-N9. 一覧 初期の並び**: đề xuất 最終更新日 降順 (quy tắc chung). OK?

### お問い合わせ (I)
- **Q-I1. 検索・ページ送り**: code không có (bảng phẳng). Đề xuất theo P-LIST: キーワード (受付番号・件名・お名前), 法人, 種類 (6 loại của 法人Web: ご契約・お申し込み／配送・お届け／商品・メニュー／請求・お支払い／アプリ・自販機／その他), 状態, 新着のみ, 送信日 (から〜まで); 10件/ページ; 初期の並び 送信日時 降順.
- **Q-I2. Cột 法人・拠点**: code chỉ hiện ID (CU00001 ／ CU00871). Đề xuất hiện **法人名・拠点名** (ID dưới dạng mono nhỏ) → 宿題.
- **Q-I3. 送信エラー**: trạng thái có「送信エラー」nhưng không có thao tác. Đề xuất nút **「HubSpot へ再送」** (フル権限) ở dòng 送信エラー; thành công → 送信済（HubSpot）. A: có 再送 ／ B: không (運営 xử lý tay ngoài hệ thống).
- **Q-I4. 本文 mở ra**: hiện click dòng mở 本文 inline và bỏ 新着. Giữ (không làm màn 詳細 riêng)? A: giữ inline ／ B: màn 詳細 riêng.
- **Q-I5. Quyền**: 権限表「Hubspot/API連携」= CRUD フル権限, × các vai trò khác → chỉ フル権限 (và システム管理) thấy màn này. Có đúng ý không? (CS thường là người đọc お問い合わせ.) A: giữ ／ B: CS = R/U.

---

## 3. Code khác quyết định [宿題] (viết 設計書 theo quyết định, `demo_ok`)
| # | Nội dung | Quyết định | Code |
|---|---|---|---|
| H1 | レビュー一覧 1 trang 10 | STEP7 L1 | 20 |
| H2 | レビュー một覧 0件 message | I01 | 「条件に一致するレビューはありません」 |
| H3 | お知らせ 日時 nhập | 日付部品＋時刻 (chuẩn) | text yyyy-mm-dd HH:mm |
| H4 | お知らせ 削除確認・破棄 câu chữ | Q01/Q02 (Message List) | câu riêng |
| H5 | お問い合わせ 法人名・拠点名 | Q-I2 | chỉ ID |
| H6 | パンくず「お知らせ設定」 | Q-C4 | お知らせ設定 |
| H7 | 権限 engagement có `update` nhưng màn レビュー không có gì để sửa | R/U = CSV出力 | — |

## 4. [open] hỏi khách
- O1 差出人のメールアドレス・署名欄 (Q-N5).

## 5. [msg] message mới dự kiến (dải theo Q-C3)
- E: 配信対象を1つ以上選んでください／{区分}の個別選択で対象を選んでください／表示開始日時の形式／メールの日時指定の形式／{状態}のお知らせは編集できません／再送できませんでした (nếu Q-I3=A).
- Q: お知らせを削除しますか（各サイトの一覧から消える・データは削除済として残る）／配信を停止しますか (お知らせ)／HubSpot へ再送しますか.
- S: 登録しました (S151 dùng lại)／配信を停止しました (S150 dùng lại)／再送しました.
- I: まだお問い合わせはありません (I01 dùng lại)／メールだけのお知らせです（どのサイトにも表示しません）.
- Dùng lại: E01・E02・E04・E13・E200 (日時の形式)・E201・Q01・Q02・S01・S02・E33・E32.

## 6. Đã khớp (không hỏi)
- レビュー: chỉ 閲覧・検索・CSV出力; 1行＝1投稿, 商品 ★ thấp lên trước 2 món + 他N品; ニックネーム未設定＝匿名ユーザー; 退会済 vẫn giữ + badge; không メールアドレス ở đâu cả; 法人 thấy 星・商品・タグ・ニックネーム (台帳 K, màn 法人 không thuộc 領域 này); 検索 chỉ khi 検索/Enter + 未適用; 詳細から戻ると条件を復元 (P-LIST).
- お知らせ: 5 区分 配信対象 (法人・拠点／アプリユーザー／委託配送先／配送スタッフ／仕入先), mỗi 区分: サイトに表示 / メール送信 (vai trò: メイン・請求・サブ担当者, app/driver: 本人) / 全員・個別選択 (+CSV取込 ID); メールだけのお知らせ OK (台帳 M); 重要 → メール tự động 8:00 公開開始日 (土日祝→前の営業日), おすすめの日時 khi lưu (台帳 M); 送信の記録 (登録/更新/メール送信予約/メール送信); 削除 = 論理削除; ゲスト・ESQR ngoài đối tượng (80_ §5-3).
- お問い合わせ: gửi HubSpot từ 法人Web, 運営 không nhận mail (TOP đếm 新着, 通知先メール ở 設定管理 = 運営I), trả lời trong HubSpot (台帳 M).

---

## 7. hong 回答 (2026-10-05)
- C1 AW_REVI／AW_NOTI／AW_INQU ✓ ／ C2 = A（予定中に統一）／ C3 = A（E220〜E229 も使う）／ C4 「お客様対応」は不可 → tên khác (đang hỏi).
- R1・R2 như đề xuất ／ R3 = A ／ R4 = 10 ／ R5 ✓ cố định, nhưng muốn sau này đổi được → đang hỏi cách (設定管理 hay dev).
- N1 NT-＋5桁 ／ N2 4 カテゴリ ／ N3 配信停止 như アンケート ／ N4 = B「ES STATION に表示」／ N5 giá trị trong code là mặc định, giữ làm **設定値** (đổi được sau; 設定管理 = 運営I) ／ N6 必須 ／ N8 OK ／ N9 OK.
- I1 ✓ ／ I2 2 cột 法人名・拠点名 ／ I3 chưa rõ → giải thích lại ／ I4 = B (màn 詳細 riêng → thêm AW_INQU_002) ／ I5 = A.
- Đã ghi 台帳 E (8 dòng).
- C4 = A「お知らせ・ご意見」(menu + パンくず) ／ R5 = B (không có màn sửa tag) ／ I3 = hong xác nhận scope sau → 設計書 ghi `open` (確認先 hong).
- **I3 = 決定（hong 2026-10-05 夕方）**：送信エラーは **法人Web にエラーを出してお客様に送り直してもらう**（入力はフォームに残す・ES に保存しない）。状態「送信エラー」・「HubSpot へ再送」・E「再送できませんでした」・TOP の警告は**作らない**。運営の一覧の検索条件から「状態」を外す。台帳「お問い合わせの送信エラー（HubSpot）の扱い」・受付簿 #133。設計書の `open`（I3）はこの内容で閉じる。

---

## 8. 作成の結果 (2026-10-05)
- データ：`データ/AW_REVI_レビュー・ご意見.py`（2画面・8状態）／`AW_NOTI_お知らせ.py`（3画面・18状態）／`AW_INQU_お問い合わせ.py`（2画面・2状態）。`_共通_メッセージ.py` に E220〜E223・Q152・Q153・I152 を追加。
- `make.py --check` OK → `--capture`（cloud の Chromium・Ad00010・本物の Web）で REVI 8／NOTI 18／INQU 2 の全状態で番号が全部見つかる（missing 0）→ `--book 運営管理者Web_お知らせ・ご意見 AW_SURV AW_REVI AW_NOTI AW_INQU`。
- 出力：`出力/運営管理者Web_お知らせ・ご意見/`（JA/VI xlsx・HTML 4 本・img）。アンケートの旧出力 `出力/AW_SURV_アンケート管理/` はこのブックに統合したので消した。
- 撮影の工夫：お知らせの見本（予定中 12457・終了 12458・削除済 12459）は 003 の setup で `/api/dev/reset` → `saveNotice`／`deleteNotice` の API で作る（setup の中で `location.reload()` は使えない）。レビューの検索条件は sessionStorage に残るので、各状態の setup で「クリア」を押す（`sessionStorage.clear()` はログアウトになる）。
- 決定とコードが違うところは `demo_ok` に理由を書いた＝コードの宿題（§3 と同じ）：予約中→予定中、お知らせ ID NT-＋5桁、「ES STATION に表示」、配信停止（一覧・詳細）、差出人・署名の設定値、お問い合わせの検索・ページ送り・法人名/拠点名・詳細画面・CSV出力の権限。
- open：I3（送信エラーの扱い）は hong のスコープ確認待ち（`open` のまま）。

---

## 9. hong の HTML 指摘（2026-10-05 夕）と対応
| # | 指摘 | 対応 | どこ |
|---|---|---|---|
| 1 | レビューID はない → 注文番号。法人・拠点を別の列に | 反映（コードも）。一覧・詳細・CSV・検索・URL＝注文番号 OD＋7桁。法人Web のレビュー一覧は宿題 | 台帳「レビュー・ご意見（運営Web）の決まり」、受付簿 #135、AW_REVI |
| 2 | 並べ替えは一覧の全列 | 反映（レビューはコードも：項目＋昇順／降順。お知らせは共通の部品が元から全列） | 台帳「一覧の決まり」 |
| 3 | 一覧は 10件（ページ送り） | 台帳どおり（10/01）。レビューのコードを 20→10 に直した | — |
| 4 | お知らせ一覧の検索の枠がほかと違う → 部品を見直す | 原因：お知らせ・アンケートほかは共通の `FilterBlock`（.filter）、マスタ一覧・レビューは ES Kitchen デザインシステムの `es-search`。**hong＝A（3A）**：共通の部品を es-search の並びに直した（条件の欄は左に折り返し、右にクリア・検索と並べ替え、2行以上のときだけ開閉）。それを使う運営の一覧すべてに効く。設計書の sel はそのまま（.filter・.f-act・.sortbox を残した） | 台帳「一覧の決まり」、P-LIST、受付簿 #140、`ListView.tsx`・`ops.css` |
| 5 | 個別選択は行（区分）ごとに別のポップアップ | 反映：区分ごとの状態 006〜010（コードは元から区分ごと） | 台帳「お知らせの配信対象の列名・添付・並び」、受付簿 #137 |
| 6 | ファイル添付のモーダルの文言が NG | **hong＝A（2A）**：添付の欄の説明文を「各サイトのお知らせ詳細で開けます。メールには添付しません（JPG・PNG・PDF・HEIC、1件 5MB、10件まで）」に（コードも） | 受付簿 #139、AW_NOTI No.5.6 |
| 7 | 署名欄を直せるように | 反映（コードも）。既定値＝設定値 | 台帳「お知らせのメールの差出人・署名」、受付簿 #136 |
| 8 | メールの件名の先頭に【ESステーション】 | 反映（コードも：送るとき付ける。見本の【ESSTATION】も直した） | 台帳「お知らせのメールの件名・本文・日時指定の既定値」 |
| 9 | 件名・本文・公開日時の既定値＝お知らせの内容（直せる） | 反映（コードも：メール本文の既定値＝本文） | 同上 |
| 10 | 添付は 5 ファイルまで | **hong：取り下げ**（共通基準のまま 10件） | 受付簿 #138 |
| 11 | お知らせに CSV出力は要るか | 仕様（CSV入出力_定義 §：運営のすべての一覧に CSV出力・お知らせ一覧 ✅）どおり **あり**。外すなら hong の回答で変える | — |
| 12 | 配信停止はどの画面にあるか | アンケート：一覧（操作の列）＋詳細。お知らせ：一覧（操作の列）＋詳細（公開中・予定中だけ。元に戻せない） | 台帳「アンケートの配信停止の入口」「お知らせの配信停止」 |
| 13 | 「未適用」の印をやめる | 反映済み（main 受付簿 #127：全部の一覧から外した。状態「未適用」を設計書からも外した） | P-LIST |
- §5b（お問い合わせ）：I3＝B を反映（`open` を閉じ、検索条件の「状態」を外し、状態は「送信済（HubSpot）」だけ）。
