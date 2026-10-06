# 確認メモ：アンケート管理（運営Web）— Ghi chú rà soát trước khi viết 画面設計書

Ngày: 2026-10-05 ／ Người rà: Claude (cloud) ／ Nguồn: code thật (`app/ops/surveys/**`, `lib/domain/survey.ts`, `lib/domain/areas/survey.ts`, `lib/domain/seed/survey.ts`, `lib/csv/survey.ts`, `lib/domain/batch.ts`, `lib/domain/seed/notice.ts`, `lib/ops/permissions.ts`, `lib/domain/seed/account.ts`), `docs/決定台帳.md` (E「アンケートの「全員」」「本番のバッチの動かし方」, B 配送 REQ-DL-718), `docs/01_仕様/運営Web_権限表_20261003.md`, `docs/01_仕様/CSV入出力_定義_20261003.md`, `docs/01_仕様/基本設計_全体の定義_提案_20261001.md` §10, `決定_STEP7_一覧の決まり_20261001.md`, `決定_STEP5回答_法人Web_20261001.md` QC, `.claude/skills/screen-design-doc/references/input_standard.md`, Message List CSV (`docs/01_仕様/30_申請/MessageList_*_20261001.csv`).

Quy ước: **[Q]** = cần hong trả lời ／ **[宿題]** = 台帳・決定 đã chốt, code chưa theo → 設計書 viết theo quyết định, ghi `demo_ok` ／ **[open]** = chưa ai quyết, hỏi khách ／ **[msg]** = câu chữ message, xử lý sau cùng Message List.

Câu hỏi dùng chung với プランマスタ (確認メモ_AW_PLAN Q3・Q4・Q6・Q7) chỉ cần hong trả lời 1 lần, áp dụng cho mọi màn hình.

---

## 1. Phạm vi và trạng thái (VIEWS) đề xuất

Screen Code tạm: `AW_SURV_xxx` (AW = 運営管理者Web; quy ước chờ Q7 chung). Sheet: **4 sheet** = 一覧／登録・編集／詳細（回答の集計）／CSV取込. 登録 và 編集 cùng 1 form (`SurveyEdit` mode new/edit) → gộp 1 sheet, ghi khác biệt theo trạng thái. Modal (個別選択・テンプレート) là trạng thái trong sheet cha.

Login để chụp: `LOGIN = {"site": "ops", "loginId": "Ad00010"}` (フル権限). Dữ liệu mẫu (seed, hôm nay = 2026-10-05): SV-1020 削除済 ／ SV-1021 終了 ／ SV-1023 配信停止 ／ SV-1024 公開中（全員）／ SV-1025 公開中（個別選択・一部未回答）／ SV-1026 予定中（個別選択）. Template ST-001〜003 (標準).

| Screen | Code | Trạng thái (id) | URL / cách tạo |
|---|---|---|---|
| アンケート一覧 | AW_SURV_001 | 001 初期表示 | `/ops/surveys` |
| | | 002 検索条件を変えて未適用 | gõ キーワード, chưa nhấn 検索 |
| | | 003 0件 | từ khóa không có + 検索 |
| | | 004 削除済みを表示 | bỏ check 削除済みを表示しない + 検索 (SV-1020 hiện) |
| | | 005 削除の確認（モーダル） | ゴミ箱 của SV-1026 |
| | | 006 テンプレートから作成（モーダル） | nút テンプレートから作成, chọn ST-001 |
| アンケート登録・編集 | AW_SURV_002 | 007 新規登録 基本情報 | `/ops/surveys/new` |
| | | 008 新規登録 設問タブ | tab 設問 (1 設問 trống, 2 選択肢) |
| | | 009 個別選択ダイアログ | 配信対象＝個別選択 → 選択する |
| | | 010 個別選択後（対象者の表） | sau 選択を確定 |
| | | 011 テンプレートから作成中 | `/ops/surveys/new?tpl=ST-001` |
| | | 012 入力エラー（基本情報） | 登録 khi trống |
| | | 013 入力エラー（設問） | 設問文 trống／選択肢 1 cái → 登録 |
| | | 014 編集 予定中 | `/ops/surveys/SV-1026/edit` |
| | | 015 編集 公開中 基本情報（回答開始日時ロック） | `/ops/surveys/SV-1024/edit` |
| | | 016 編集 公開中 設問（文言の修正だけ） | tab 設問 (Notice màu vàng, không có 追加・削除・並び) |
| | | 017 編集内容の破棄（モーダル） | sửa 1 ô rồi キャンセル |
| アンケート詳細 | AW_SURV_003 | 018 予定中 基本情報 | `/ops/surveys/SV-1026` |
| | | 019 予定中 設問タブ（読むだけ） | tab 設問 |
| | | 020 公開中 基本情報（個別選択・回答列） | `/ops/surveys/SV-1025` |
| | | 021 公開中 設問タブ＝回答の集計 | `/ops/surveys/SV-1024` tab 設問 (画面28) |
| | | 022 集計の絞り込み（法人・拠点） | chọn 法人 + 検索 → 回答のCSV出力（n名） đổi |
| | | 023 変更履歴タブ | tab 変更履歴 |
| | | 024 配信停止の確認（モーダル） | nút 配信停止 |
| | | 025 削除確認（モーダル） | nút 削除 |
| | | 026 テンプレートとして保存（モーダル） | nút テンプレートとして保存 |
| | | 027 終了 | `/ops/surveys/SV-1021` (không có 編集・削除・配信停止) |
| | | 028 配信停止 | `/ops/surveys/SV-1023` (xem Q4) |
| | | 029 削除済 | `/ops/surveys/SV-1020` |
| アンケートCSV取込 | AW_SURV_004 | 030 ① CSV取込 初期 | `/ops/surveys/import` |
| | | 031 CSV取込モーダル（ファイルを選ぶ） | nút CSVを選んで取り込む (modal chung) |
| | | 032 CSV取込モーダル（確認・エラーあり） | file có dòng lỗi → エラー一覧CSV, không 登録 được |
| | | 033 ② 確認・保存（基本情報＋設問一覧） | sau 登録 trong modal |
| | | 034 設問を外した後 | ゴミ箱 1 dòng → 「外した設問 1件 元に戻す」 |
| | | 035 登録エラー | 登録 khi 基本情報 trống |

Số item dự kiến: 一覧 ≈ 22 ／ 登録・編集 ≈ 45 (基本情報 12 + 個別選択 10 + 設問 10 + nút) ／ 詳細 ≈ 35 (集計 15) ／ CSV取込 ≈ 15.

---

## 2. Điểm cần hong quyết định [Q]

### Q1. 6 quyết định「2026/10/03 決定」ghi trong code nhưng **không có trong 台帳** → xác nhận và ghi vào 台帳?
Code (`lib/domain/survey.ts`, `areas/survey.ts`, `Templates.tsx`, `Results.tsx`, `lib/csv/survey.ts`) ghi là quyết định 2026/10/03, nhưng `docs/決定台帳.md` chỉ có 1 dòng về アンケート (「全員」除く 利用休止中, 2026-10-05) và `00_決定/` không có file nào. Có thể nằm trong `00_確認してほしい/課題一覧` (cloud không thấy).
- (a) **回答者＝アプリの利用者（U＋8桁）だけ**. 法人・拠点のアカウントには出さない; 法人・拠点 chỉ là điều kiện lọc khi 個別選択. ※ REQ-DL-718 ghi「法人・特定企業・全ユーザーへ直接配信」; 台帳 B 配送 chỉ ghi「アンケート配信（REQ-DL-718）は共通機能」.
- (b) **回答が始まったあと**: chỉ sửa 文言（設問文・選択肢の文字）; không 追加・削除・並び・設問タイプ・必須・選択肢の数; không đổi 回答開始日時; 回答済みの対象者 không bỏ khỏi 配信対象.
- (c) **テンプレート**: 「テンプレートから作成」(写す 案内文・設問) và 「テンプレートとして保存」; 3 template 標準 (満足度調査・メニュー評価・アプリ使い勝手) không xóa được.
- (d) **回答の CSV出力**: 1行＝回答者1人; cột 回答ID・ユーザーID・ユーザー・法人ID・法人名・拠点ID・拠点名・回答日時＋mỗi 設問 1 cột (複数選択 nối bằng「;」); theo lọc 法人・拠点.
- (e) **設問の CSV取込** dùng modal CSV取込 chung + 取込の記録; 1 dòng lỗi → không 登録; sau đó nhập 基本情報 rồi 登録 (2 bước, khớp CSV入出力_定義 dòng 138).
- (f) **リマインド** 終了の N 日前（1〜30）, 土日祝 → 前の営業日 (giống お客様のお知らせ chung).
- Đề xuất: **xác nhận cả 6 → ghi 6 dòng vào 台帳 E trong cùng PR** (根拠: hong 回答 2026-10-03・コードの注記). Nếu điểm nào không đúng, 設計書 viết theo hong, code là 宿題.
- **hong 回答 2026-10-05: xác nhận cả 6** → đã ghi 6 dòng vào 台帳 E. Điểm (a) hong nói thêm「Có thể filter theo cty. User nào đang thuộc cty đó có thể trả lời」→ hỏi tiếp Q1b.

### Q1b. Khi 個別選択 theo 法人・拠点: lưu **danh sách người** (như code) hay lưu **法人・拠点** (động)?
- Code: dialog lọc theo 法人・拠点 rồi tick từng người → lưu **ID người** (`picks: [{type:'user', id}]`). Người vào công ty sau khi tạo アンケート **không** thuộc 配信対象; người chuyển công ty vẫn còn.
- hong (Q1 trả lời): 「User nào đang thuộc cty đó có thể trả lời」 → nghe như **lưu 法人（・拠点）**, ai đang thuộc tại thời điểm trả lời thì được.
- A. Lưu 法人・拠点 (động): chọn 法人／拠点 trong dialog, 対象者数 tính lại mỗi lần (giống「全員」). Người mới vào công ty được trả lời. Code đổi data model (`picks` thêm type corp/branch) + dialog.
- B. Giữ code (lưu từng người): chính xác tới từng người, nhưng không tự thêm người mới.
- C. Cả hai: dialog cho chọn 法人／拠点 (động) **và** tick thêm/bớt từng người.
- Đề xuất: **A** (khớp câu trả lời của hong và cách「全員」đang chạy; đơn giản hơn C).
- **hong 回答 2026-10-05: A**. → 設計書: 配信対象 = 全員／個別選択（法人・拠点を選ぶ）. Dialog 個別選択 đổi thành chọn 法人／拠点 (checkbox theo 拠点, gom theo 法人), 対象者数 động. Bảng 対象者 trong 基本情報 hiện người hiện tại thuộc các 拠点 đã chọn (+ cột 回答 ở 詳細). Code là **宿題** (H6).

### Q2. Số ký tự tối đa (code ≠ chuẩn nhập liệu `input_standard.md`)
| Mục | Code | Chuẩn | Đề xuất |
|---|---|---|---|
| アンケート名 | 100 (`maxLength`, validateSurvey) | 1行の文字 **60** | **60** (theo chuẩn) |
| テンプレート名 | 100 | 60 | **60** |
| 案内文（説明） | 500 (`INTRO_MAX`) | 備考 500 | 500 ✓ |
| 設問文 | 200 | không có loại | **200 giữ** (câu hỏi dài hơn tên; ghi lý do) |
| 選択肢（1つ） | 100 | 1行 60 | **60** |
| 自由記述の回答（アプリ側） | 1000 (`answerProblems`) | 備考 500 | **1000 giữ** (là câu trả lời của người dùng, không phải メモ; ghi lý do) hoặc 500 nếu hong muốn đồng nhất |
| リマインド日数 | 1〜30 | 回数 99 | 1〜30 ✓ (ghi là giới hạn nghiệp vụ) |
Code chưa có maxLength ở 選択肢 phía server (chỉ client) → 宿題 nhỏ.
- **hong 回答 2026-10-05: A** → ghi 台帳 E「アンケートの文字数の上限」. Code: 名・テンプレート名・選択肢 100 → 60 là 宿題 (H2).

### Q3. Tên gọi chưa thống nhất trong cùng chức năng (chọn 1 để dùng cho 設計書・code・CSV)
- 一覧 cột「開始期間」「終了期間」 ↔ form「回答開始日時」「回答終了日時」. Đề xuất: **回答開始日時／回答終了日時** ở cả 一覧・CSV.
- Form 設問「カテゴリ」 ↔ 集計・CSV取込・一覧「設問タイプ」 (ảnh Phase 1 画面25 dùng カテゴリ). Đề xuất: **設問タイプ** mọi nơi (カテゴリ dễ nhầm với 商品カテゴリ).
- 一覧「回答進捗」= `n/m 回答（x%）` ↔ 詳細 `回答 n／m 名（x%）`. Đề xuất giữ 一覧 ngắn, 詳細 đầy đủ (không hỏi, chỉ ghi).
- **hong 回答 2026-10-05: A** → 台帳 E「アンケートの項目名」. Code đổi nhãn là 宿題 (H3).

### Q4. 配信停止 のアンケート: có cho 編集・削除 không?
- Code: 配信停止 → vẫn **編集・削除 được** (`canEdit` chỉ loại 終了・削除済); 配信停止 không hoàn lại (「元に戻せません」).
- A. Giữ như code (sửa được tên・案内文… nhưng không phát lại). B. **配信停止 coi như 終了: chỉ 削除 được, không 編集** (đơn giản, tránh hiểu nhầm là phát lại được). C. Như 終了 (không 編集・không 削除).
- Đề xuất: **B**.
- **hong 回答 2026-10-05: B** → 台帳 E「配信停止したアンケートの扱い」. Code: ẩn 編集 (一覧 鉛筆・詳細 nút) và `survey.save` trả 409 khi 配信停止 là 宿題 (H7).

### Q5. Đường gửi 回答開始のお知らせ・リマインド cho アプリの利用者
- Code: `notify(... channels: ['site'])` → chỉ **thông báo trong アプリ (push)**; `lib/domain/mails.ts` lại liệt kê「アンケートのリマインド」là mail template `survey_remind`, `seed/notice.ts` có subject/body mail cho `survey_open`/`survey_remind` (sites: []).
- A. **Push trong アプリ chỉ** (app user có email nhưng không gửi mail). B. Push + mail.
- Đề xuất: **A** (khớp code; mail chỉ là template dự phòng) → sửa ghi chú trong `mails.ts`.
- **hong 回答 2026-10-05: A** → 台帳 E「アンケートのお知らせの経路と時刻」. Sửa ghi chú `mails.ts` là 宿題 nhỏ (H8).
- Thời điểm gửi: theo 台帳 E「本番のバッチ」= 9:00 → お知らせ gửi vào **9:00 đầu tiên sau 回答開始日時** (ví dụ 開始 14:00 → 9:00 hôm sau). Viết vào 設計書, không hỏi.

### Q6 (= AW_PLAN Q3, chung). Quyền アンケート管理
- `運営Web_権限表` dòng「アンケート回収・分析」: **R cho cả 7 役割** → không ai 作成・編集・削除・CSV取込・配信停止.
- Code `seed/account.ts` `surveys: ALL_R` = **フル権限 CRUD**, 6 役割 còn lại R. Màn hình ẩn nút theo grants (§10-6 「出さない」).
- Đề xuất: theo **code** (フル権限 CRUD), sửa 権限表. Nếu muốn CS cũng tạo được アンケート thì nói rõ.
- **hong 回答 2026-10-05: A** → sửa 権限表 (プラン管理・アンケート管理 フル権限 CRUD), 台帳 E. Code đã đúng (ALL_R). Các dòng 売上管理・特典管理・紹介キャンペーン管理 cũng R×7 trong bảng nhưng code ALL_R → chưa hỏi, ghi 台帳 là 未確認.

### Q7 (= AW_PLAN Q4, chung). Thứ tự mặc định 一覧
- Code: `list` sort **アンケートID 降順** (mới nhất trên). Có UI 並べ替え (chọn cột + 昇順/降順) ✓ STEP7 L2.
- Đề xuất: ghi **アンケートID 降順** (= 新しい順) vào 設計書.
- **hong 回答 2026-10-05: B = 回答終了日時 降順** → 台帳 E. Code `list` sort theo id là 宿題 (H9).

### Q8 (= AW_PLAN Q6, chung). Xác nhận khi rời màn hình đang nhập (Q02)
- Code có modal「編集内容の破棄」(登録・編集・CSV取込 ②). `input_standard.md`: chưa quyết. Đề xuất: **có**, toàn hệ thống.
- **hong 回答 2026-10-05: A** → 台帳 E, `input_standard.md`, `_共通パターン.py` P-FORM đã sửa.

### Q9 (= AW_PLAN Q7, chung). Quy ước Screen Code
- Đề xuất `<サイト2文字>_<機能>_<3桁>`: AW_SURV_001〜004.
- **hong 回答 2026-10-05: A** → 台帳 E.

### Q10. 「全員」là động: người dùng mới đủ điều kiện **sau** 回答開始 có vào 配信対象 không?
- Code: 全員 = tính lại mỗi lần (`eligible(r)`), nên user mới đăng ký / 拠点 mới 本登録 sau khi mở sẽ **được trả lời** và được tính vào 対象者数, nhưng **không nhận 回答開始のお知らせ** (gửi 1 lần lúc mở, `openedAt`); リマインド thì có (gửi cho 未回答者 lúc đó).
- A. Giữ như code (động; ghi rõ trong 設計書). B. Chốt danh sách 対象者 lúc 回答開始 (không đổi sau đó).
- Đề xuất: **A** (đơn giản, khớp「全員」), ghi rõ: 対象者数 là số hiện tại.
- **Giải quyết bởi Q1b＝A** (配信対象 động cho cả 全員 và 個別選択): không hỏi, ghi vào 設計書.

---

## 3. Code khác quyết định đã chốt → 設計書 viết theo quyết định, code là 宿題 [宿題]

| # | Nội dung | Quyết định | Code hiện tại |
|---|---|---|---|
| H1 | Quyền | フル権限 CRUD, 6 役割 R (hong Q6＝A) | code đúng; 権限表 đã sửa 2026-10-05 |
| H2 | 最大文字数 | 名・テンプレート名・選択肢 **60**, 設問文 200, 案内文 500, 自由記述 1000 (hong Q2＝A) | 名 100・テンプレート名 100・選択肢 100 (client `maxLength` + `validateSurvey`・`saveTemplate`) |
| H3 | Tên cột・tên mục | 一覧・CSV「回答開始日時」「回答終了日時」, 設問「設問タイプ」 (hong Q3＝A) | 一覧「開始期間」「終了期間」(`page.tsx` cols), form「カテゴリ」(`SurveyEdit.tsx` Field label, validate message「カテゴリ（設問タイプ）を選んでください」) |
| H4 | 0件 message | 全体の定義 §10-2「該当するデータがありません。」(I01) | 一覧 chung:「条件に一致するデータがありません。検索条件を変えるか「クリア」を押してください。」; PickDialog:「該当するデータがありません。」 → [msg] |
| H5 | 選択肢 maxLength | chỉ client (`maxLength={100}`), server không check | thêm check server khi chốt Q2 |
| H7 | 配信停止の編集 | **編集不可・削除可** (hong Q4＝B) | `canEdit` chỉ loại 終了・削除済; `saveCore` không chặn 配信停止 |
| H8 | Ghi chú mail | お知らせ・リマインド chỉ push trong アプリ (hong Q5＝A) | `lib/domain/mails.ts` dòng「アンケートのリマインド」liệt kê như mail; `seed/notice.ts` template `survey_open`/`survey_remind` (sites: []) để làm tiêu đề push, không gửi mail |
| H9 | 一覧の初期の並び | 回答終了日時 降順 (hong Q7＝B) | `areas/survey.ts` `list` sort theo id 降順 |
| H6 | 個別選択の配信対象 | **法人・拠点を選んで保存**（動的。hong Q1b＝A 2026-10-05） | 利用者を1人ずつ選んで ID を保存（`picks: user`）。`PickDialog`・`SurveyTarget`・`targetsOf`・`checkPicks`・`audience` を直す |

## 4. Giá trị chưa chốt với khách [open]
- Không có (アンケート là chức năng nội bộ của 運営; khách không cần quyết).

## 5. Message [msg] — xử lý sau cùng Message List (Message List 2026-10-01 **không có** dòng nào về アンケート)
- 必須: code「アンケート名を入力してください」「設問文を入力してください」「カテゴリ（設問タイプ）を選んでください」 ↔ ML「{対象項目名}は必須項目です。」(インライン) / 共通 E01・E02.
- 文字数: 「アンケート名は100文字までです」「案内文は500文字までです」 ↔ E04「{項目名}は{n}文字以内で入力してください。」.
- 日時: 「回答開始日時を yyyy-mm-dd HH:mm で入力してください」「回答終了日時は回答開始日時より後にしてください」(≈ E08 nhưng là 日時) → cần ID mới hoặc mở rộng E08.
- 範囲: 「リマインド通知は 1〜30 日前で入力してください」 ↔ E12.
- 設問: 「選択肢を2つ以上入力してください」「空の選択肢があります（不要なら削除してください）」「同じ選択肢が2つあります」「設問を1つ以上入れてください」「個別選択の対象を選んでください」 → ID mới.
- 409 từ server (toast): 「終了のアンケートは編集できません」「回答が始まったあとは回答開始日時を変えられません」「回答が始まったあとは設問を足す・消すことはできません（文言の修正だけできます）」…「回答済みの対象者（n名）は配信対象から外せません」「回答終了日時は今より後にしてください（終わらせるときは「配信停止」）」「終了したアンケートは削除できません」「最初からあるテンプレートは消せません」「同じ名前のテンプレート「…」があります」 → ID mới (toast ≤ 40 chữ: nhiều câu dài hơn → rút gọn).
- 確認: 削除 (一覧 có tên アンケート, 詳細 không có; cả 2 khác Q01 chung) / 配信停止 / 編集内容の破棄 (Q02).
- 成功 toast: 「アンケート SV-xxxx を登録しました（予定中）」「…を保存しました」「削除しました（「削除済」として残ります…）」「配信を停止しました」「テンプレート「…」を保存しました（設問 n問）」「テンプレートを消しました」「アンケート SV-xxxx を登録しました（設問 n問）」(CSV) ↔ S01・S02.
- 権限なし: NO_PERM toast「権限がありません」 ↔ E32.

## 6. Những điểm đã khớp (không hỏi)
- 一覧: 10／20／50件 (初期10), 「検索」/Enter mới áp dụng + 未適用, 削除済みを表示しない mặc định, 並べ替え UI, badge 削除済 (STEP7 L1〜L4・L-1〜L-4).
- 「全員」 = 本登録・閉鎖予定 の拠点 × 契約 有効・解約手続き中 × アプリ利用者 有効 → **利用休止・停止・仮登録・閉鎖・終了 bị loại** ✓ 台帳 E (2026-10-05 #18).
- 論理削除 (削除済として残る・回答も残す); 終了 không 削除 được; 一覧 ẩn 鉛筆・ゴミ箱 ở 終了・削除済.
- 状態 tính từ 日時: 予定中 → 公開中 → 終了; 配信停止・削除済 từ 記録. Badge: 公開中 緑, 予定中 青, 配信停止 黄, 終了・削除済 灰 (`lib/format/status.ts` 'ended' gồm 配信停止・削除済) ✓ 表示の共通.
- ID: アンケート SV-＋4桁, 回答 SR-＋4桁-＋4桁, テンプレート ST-＋3桁, 設問 Q＋番号 (システム採番) ✓.
- 日時 hiển thị yyyy-mm-dd HH:MM (`fmtDateTime`), nhập = 日付部品 + 時刻 (初期 開始 08:00・終了 18:00) ✓ chuẩn.
- Batch: 回答開始のお知らせ・リマインド ở `surveyTick` phase morning 9:00 ✓ 台帳 E; リマインド 土日祝 → 前の営業日 ✓ customerNotice chung.
- Nút theo quyền: 新規登録・テンプレートから作成 (作成), 編集 (編集), 削除・配信停止・テンプレート保存/削除 (API grants), CSV取込・CSV出力 (csvImport/csvExport) → ẩn khi không có ✓ §10-6「出さない」.
- 法人Web không có màn アンケート (QC 決定_STEP5: お試しオーダーに アンケートのボタンは出さない). 法人Web 注文画面の「アンケート」(従業員の食べたい・気になる) là chức năng khác, không thuộc 設計書 này.

---

## 7. Kết quả (2026-10-05)
- Q1〜Q9 đã có câu trả lời của hong (ghi ở từng mục trên và 台帳 E). Q10 giải quyết bởi Q1b.
- Dữ liệu `データ/AW_SURV_アンケート.py`: 4 màn, 35 trạng thái, 136 mục. `make.py --check` OK; `--capture` tìm thấy đủ số ở cả 35 trạng thái.
- Xuất: `出力/AW_SURV_アンケート管理/` (xlsx JA/VI, HTML, img). HTML vào git.
- 宿題 code (ghi `demo_ok`, 28 chỗ): H1 không cần (code đúng), H2 文字数, H3 tên cột/nhãn, H4 câu chữ message, H5 選択肢 server check, H6 個別選択 theo 法人・拠点, H7 配信停止 không sửa, H8 ghi chú mail, H9 thứ tự 一覧.
- Message List: 30 câu chữ mới về アンケート chưa có trong Message List → sheet「Message List への追加案」.

## 8. Đồng bộ với nhánh master (`claude/jolly-dijkstra-62jr5h`) và kế hoạch song song (2026-10-05, sau merge)
- Screen Code theo 画面コード規約_20261005: `AW_SURV_001〜004` (Feature 4 chữ). File dữ liệu đổi tên `AW_SURV_アンケート.py`.
- Message của アンケート cấp lại theo dải 領域 運営F (並列実行計画 §2): E200〜E219, Q150・Q151, S150〜S152, I150・I151 (ID cũ E14〜E45・Q03・Q04・S04〜S06・I03・I06 bỏ, vì master dùng các số đó cho ý khác). Q02 = Message List No.25 (キャンセル／破棄), E31 = No.43, S02「削除が完了しました。」, I01「表示するデータがありません。」, 削除失敗 = E33.
- CSV取込 (台帳 F, hong trên master): **không có nút テンプレート / いまのデータ** (toàn hệ thống) → câu hỏi A/B/C ở mục 7 đã được giải quyết = B. **Dòng lỗi bị bỏ, các dòng khác vẫn đăng ký** → 1.4・3.2 viết lại; bỏ trạng thái 「① ファイルを選ぶ（コードのモーダル）」, còn 34 trạng thái. Bố cục trong trang (hong chỉ đạo cho màn này) giữ nguyên, ghi là khác với P-CSV (modal) → code 宿題.
- HTML・xlsx・img không vào git (hong, master). Artifact là bản để hong xem.
- 詳細 018/020: bảng 法人・拠点 không có cột 回答 (hong 2026-10-05).
- hong 2026-10-05: bỏ trạng thái 「② 取込の結果（エラーあり）」, gộp kết quả nhập vào 「② 確認・保存」 (1 trạng thái: kết quả + 基本情報 + 設問一覧). Còn **33 trạng thái**. Ảnh chụp dùng CSV 1 dòng lỗi + 2 dòng hợp lệ.
- hong 2026-10-05: định nghĩa tệp CSV mẫu (cột, kiểu, bắt buộc, độ dài, validation, message) → trạng thái 034「CSVファイルの形式（テンプレート）」No.5〜5.5 trong 設計書, và mục 6 của `docs/01_仕様/CSV入出力_定義_20261003.md`. Tổng 34 trạng thái.
- hong 2026-10-05: CSV có cả 基本情報 (B): 4 cột アンケート名・案内文・回答開始日時・回答終了日時 ở đầu, dòng đầu điền vào ②. Code parser chỉ 5 cột → 宿題. Ghi 台帳 E (dòng CSV取込) và CSV入出力_定義 §6.
- hong 2026-10-05: テンプレートから作成 chỉ ở 一覧 (bỏ ở màn 登録); 配信停止 thêm vào cột thao tác của 一覧 (3.13, cùng modal Q150). Code 宿題: bỏ nút ở 登録, thêm icon ở 一覧.
- 2026-10-05: code 登録画面の「テンプレートから作成」ボタンを外した（`SurveyEdit.tsx`）。一覧の「テンプレートから作成」→ `/ops/surveys/new?tpl=` は今までどおり。
- hong 2026-10-05 (A): 登録・編集 cũng có「テンプレートとして保存」(No.1.4, trạng thái 035). Code đã sửa (`SurveyEdit.tsx` saveAsTemplate). 台帳 E dòng テンプレート bổ sung nội dung chép và 標準 = builtin.
