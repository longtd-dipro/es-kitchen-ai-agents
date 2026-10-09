# 確認メモ：プランマスタ（運営Web）— Ghi chú rà soát trước khi viết 画面設計書

Ngày: 2026-10-05 ／ Người rà: Claude (cloud) ／ Nguồn: code thật (`app/ops/masters/plans`, `app/ops/masters/_masters/*`, `lib/ops/masters/*`, `lib/domain/*`), `docs/決定台帳.md`, `docs/決定の受付簿.md`, `docs/01_仕様/00_決定/決定_v2.3追補_プランマスタ_20260929.md`, `決定_STEP5回答_法人Web_20261001.md`, `40_マスタ・料金・請求/マスタ項目一覧_機種_オプション_値引き.md` §0.12 và 「画面：プランマスタ編集（84項目）」, `運営Web_権限表_20261003.md`, `基本設計_全体の定義_提案_20261001.md` §10, `決定_STEP7_一覧の決まり_20261001.md`.

Quy ước trong memo: **[Q]** = cần hong trả lời ／ **[宿題]** = 台帳・決定 đã chốt, code chưa theo → 設計書 viết theo quyết định, ghi `demo_ok` (code sửa sau) ／ **[open]** = chưa ai quyết, hỏi khách ／ **[msg]** = câu chữ message, xử lý sau cùng Message List.

---

## 1. Phạm vi và trạng thái (VIEWS) đề xuất

Screen Code tạm: `AW_PLAN_xxx` (AW = 運営管理者Web). Quy ước Screen Code đã chốt 2026-10-05 (台帳 E) → **[Q7] đã trả lời**.

| Screen | Code | Trạng thái (id) | URL / cách tạo |
|---|---|---|---|
| プランマスタ一覧 | AW_PLAN_001 | 001 初期表示 | `/ops/masters/plans` |
| | | 002 検索条件を変えて未適用 | gõ vào ô tìm kiếm, chưa nhấn 検索 (hiện 未適用) |
| | | 003 0件 | tìm từ khóa không có + 検索 |
| | | 004 削除の確認 | ゴミ箱 của plan chưa dùng (use=0) |
| | | 005 削除できません | ゴミ箱 của plan đang dùng (use>0) |
| | | 006 削除済みを表示 | bỏ check 削除済みを表示しない + 検索 |
| | | 007 CSV取込（モーダル） | nút CSV取込 (chỉ khi có quyền csvImport) |
| プランマスタ詳細 | AW_PLAN_002 | 008 初期表示（タブ ESスタンダード） | `/ops/masters/plans/ES000004` |
| | | 009 タブ ESライト（冷蔵庫） | click tab |
| | | 010 タブ ESライト（自販機） | click tab |
| | | 011 タブ 変更履歴 | click tab |
| | | 012 価格世代を追加（入力行） | nút ＋ 価格世代を追加 (※ phụ thuộc Q1) |
| | | 013 価格世代を一括切替（モーダル） | nút 価格世代を一括切替 → màn 一括変更 dùng chung, chỉ tham chiếu |
| プランマスタ登録・編集 | AW_PLAN_003 | 014 新規登録 初期表示 | `/ops/masters/plans/new` |
| | | 015 新規登録 タブ ESライト（冷蔵庫） | click tab |
| | | 016 新規登録 タブ ESライト（自販機） | click tab |
| | | 017 新規登録 入力エラー | nhấn 登録 khi trống → hộp 保存できません（n件）+ viền đỏ |
| | | 018 編集 初期表示 | `/ops/masters/plans/ES000004/edit` |
| | | 019 編集 入力エラー（上限の不整合） | sửa 上限 sai rồi 保存 |
| | | 020 編集内容を破棄しますか（モーダル） | sửa 1 ô rồi キャンセル |

Ghi chú: 新規登録 và 編集 cùng 1 form (`MasterDetail` mode new/edit), khác nhau ở tiêu đề, nút (登録／保存), và 新規 hiện thêm bảng 価格プラン cũ (xem Q1). Gộp thành 1 sheet 「登録・編集」, ghi khác biệt theo trạng thái.

Số item dự kiến: 一覧 ≈ 25 ／ 詳細 ≈ 95 ／ 登録・編集 ≈ 95 (theo マスタ項目一覧 84 項目 + 価格世代 + 初期備品).

---

## 2. Điểm cần hong quyết định [Q] — **đã trả lời hết 2026-10-05 (xem dòng 回答 ở mỗi câu)**

### Q1. Cách giữ **giá** của plan: 価格世代 (code) hay 価格プラン表 (spec)? — ảnh hưởng lớn nhất
> **Trả lời (hong 2026-10-05): C.** Đã ghi 台帳 F và 受付簿 #52 (実装待ち). 設計書 viết theo C: card 価格世代 với 2 cột giá (COOL便／ES配送便) cho mỗi コース, 公開用 = 世代 đang áp dụng; màn 新規登録 nhập 世代 đầu tiên thay cho bảng 価格プラン cũ; cột giá ở 一覧 giữ nguyên.
- **Spec** (マスタ項目一覧 §プランマスタ編集, 決定 28-178/180/181): mỗi コース có bảng 価格プラン: 公開用（1行だけ）／価格プラン（元の料金・改訂第一回目…）／開始期間・終了期間（date）／**価格（COOL便）・価格（ES配送便）**／内訳（基本10%／企業負担8%）／ライト có thêm スタンダードアップ差額.
- **Code** (`PriceGens.tsx`, `lib/domain/types.ts` Plan.priceGens, 課題 4b-9・7-1・7-2): bảng 価格プラン cũ **ẩn** ở 詳細・編集 (chỉ còn ở 新規登録). Thay bằng card 「価格世代（共通データ）」: 世代ID／適用開始（サイクル月 yyyy-mm）／適用終了／**1 giá tháng (税抜) cho mỗi コース, không tách COOL便・ES配送便**／メモ／使っている子契約／登録／操作（直す・削除・誤りの訂正）. Không có 公開用, không có 内訳.
- 台帳 E (2026-10-05) 「料金世代：ライトも世代ごとに自分の価格を持つ（A）」 ủng hộ mô hình thế hệ, nhưng không nói về COOL便／ES配送便 và 公開用.
- Trong 台帳 và 00_決定 không thấy quyết định nào bỏ việc tách giá theo 配送方法. Màn 一覧 vẫn có 5 cột giá tách COOL便／ES配送便.
- Lựa chọn:
  - **A. Theo code (価格世代, 1 giá/コース/世代, theo サイクル月)**: khớp 共通データ và luồng 一括変更 đã làm. Nhược: mất 公開用 flag và tách COOL/ES, cột 一覧 phải đổi; マスタ項目一覧 và 28-180 phải sửa.
  - **B. Theo spec (価格プラン表 với COOL/ES, 公開用, date)**: khớp 現行画面 P1 và 28-178〜181. Nhược: code phải làm lại, mô hình 共通データ đổi.
  - **C. Lai: 価格世代 nhưng mỗi 世代 giữ giá COOL便 và ES配送便 riêng cho mỗi コース, 公開用 = thế hệ mới nhất**.
  - Đề xuất: **C** nếu thực tế giá khác nhau theo 配送方法 (現行画面 có 2 giá nên khả năng cao là có); nếu hong xác nhận giá không phụ thuộc 配送方法 thì **A**.
- **回答 (hong 2026-10-05, 台帳 E):** chọn **C**. 価格世代 theo サイクル月; mỗi 世代 × コース có 2 giá COOL便 và ES配送便. **公開用 là cờ do 運営 chọn trên 世代, không phải 世代 mới nhất = công khai.** 世代 không công khai dùng làm giá riêng cho một công ty (chọn ở 子契約). Cách giới hạn 世代 riêng cho công ty nào → ghi `chk` khi viết data, hỏi tiếp.

### Q2. Card 「初期備品・プランに含む資材」 đặt ở プランマスタ (code) hay 資材マスタ (spec)?
> **Trả lời (hong 2026-10-05): A.** Giữ ở プランマスタ詳細 (code). Đã ghi 台帳 F, 受付簿 #53, sửa マスタ項目一覧 §0.12. Chỗ đặt CSV取込 của bảng này chưa quyết (ghi 要確認 trong 受付簿).
- Spec: マスタ項目一覧 §0.12 ghi 「資材 × プラン」の表は **資材マスタ側**, 「プランマスタには持たない」 (hong 回答 M6 2026-10-03). 受付簿 #20 (実装待ち): 運営Web 資材マスタ.
- Code: `PlanMaterials.tsx` đặt trong 詳細 của プランマスタ (資材 × コース 初期備品 + プランに含む数 + 変更履歴), lưu vào `dm.master.plans.initialItems／includedMaterials`.
- Đề xuất: giữ **spec (資材マスタ)**, プランマスタ詳細 chỉ hiện tham chiếu (read-only) hoặc không hiện; code là 宿題. Nếu hong muốn tiện thao tác theo plan thì chọn code và sửa マスタ項目一覧.
- **回答 (hong 2026-10-05, 台帳 E):** giữ spec: **資材マスタ** giữ bảng 資材×プラン; プランマスタ詳細 chỉ tham chiếu. Code `PlanMaterials.tsx` là 宿題.

### Q3. Quyền: ai được 作成・編集・削除 プランマスタ?
> **Trả lời (hong 2026-10-05): A.** フル権限 CRUD, 6 役割 còn lại R. Đã sửa 権限表, ghi 台帳 F và 受付簿 #54.
- 運営Web_権限表 dòng 「プラン管理」: **R cho cả 7 役割** (kể cả フル権限) → không ai sửa được qua UI.
- Code `lib/domain/seed/account.ts` OPS_TABLE `plans: ALL_R` = **フル権限 CRUD**, 6 役割 còn lại R.
- Đề xuất: theo **code** (フル権限 CRUD), sửa 権限表. Nếu đúng ý là chỉ システム管理 sửa thì cần nói rõ (hiện sysadmin là site riêng, không có màn プランマスタ).
- **回答 (hong 2026-10-05, 台帳 E):** フル権限 và システム管理 **CRUD mọi 機能**; 6 役割 còn lại R. 権限表 đã sửa. Theo code hiện tại.
- **hong 回答 2026-10-05 (qua memo アンケート Q6＝A): フル権限 CRUD, 6 役割 R.** 権限表 đã sửa.

### Q4. 一覧: 並べ替え và thứ tự mặc định
> **Trả lời (hong 2026-10-05): 1 = C (月次提供上限数 昇順 → プランID 昇順), 2 = có 並べ替え theo L2.** 台帳 F, 受付簿 #55 (実装待ち: thêm UI 並べ替え vào MasterList).
- 決定 STEP7 L2: mọi 一覧 có 「並べ替え」; L-3: thứ tự ban đầu ghi trong 画面設計書 (không ghi = 更新日時の降順).
- Code: không có UI 並べ替え; thứ tự hiện tại theo seed (プランID 昇順).
- Đề xuất: mặc định **プランID 昇順** (danh sách ngắn, ID tăng theo 食数, dễ dò); thêm 並べ替え là 宿題 của code.
- **回答 (hong 2026-10-05, 台帳 E):** mặc định **プランID 昇順** (quy tắc chung: マスタ = ID 昇順, màn khác = 更新日時 降順). 並べ替え UI là 宿題 code.

### Q5. Giữ trường 「冷凍_月次提供数_下限」 không?
> **Trả lời (hong 2026-10-05): giữ.** 台帳 F, 受付簿 #56.
- マスタ項目一覧: 「冷凍の下限をマスタに出すかは社内確認中（REQ-PM-039）。現行画面にはある」. Code có.
- Đề xuất: **giữ** (code có, 28-178 ③ có check 下限 ≦ 上限).
- **回答 (hong 2026-10-05, 台帳 E):** **giữ** 冷凍_月次提供数_下限.

### Q6. Xác nhận khi rời màn hình đang nhập (Q02)
> **Trả lời (hong 2026-10-05): có, toàn hệ thống.** Dùng Message List No.25. 台帳 F, 受付簿 #57 (các form khác cần rà).
- input_standard.md: 「まだ決まっていないもの：入力中に離れるときの確認（Q02）」. Code có modal 「編集内容を破棄しますか？」 khi キャンセル／rời trang lúc dirty.
- Đề xuất: **có** (theo code) cho toàn hệ thống.
- **回答 (hong 2026-10-05, 台帳 E):** **có**, Q02 toàn hệ thống. Thêm: lỗi khi lưu thống nhất inline (P-FORM), hộp 「保存できません（n件）」 của マスタ là 宿題 code.
- **hong 回答 2026-10-05 (memo アンケート Q8＝A): có, toàn hệ thống.**

### Q7. Quy ước Screen Code
> **Trả lời (hong 2026-10-05):** `<Module(2)>_<Feature(4)>_<Seq(3)>`, Module UA/DA/CW/AW/SW/OW. Đã viết `docs/01_仕様/画面コード規約_20261005.md`, 台帳 F, 受付簿 #58. プランマスタ dùng AW_PLAN_001〜003 như đề xuất.
- Docs không có quy ước. 画面設計書_トラブル報告 (mobile) dùng M01/S02. Khuôn skill dùng `XX_XXX_001`.
- Đề xuất: `<サイト2文字>_<機能>_<3桁>`: AW=運営管理者Web, CW=法人Web, DR=ドライバー, CA=委託配送先, SP=仕入先. Ví dụ `AW_PLAN_001`.
- **回答 (hong 2026-10-05, 台帳 E):** chốt `<Site2字>_<機能略>_<3桁>` với AW／CW／**TW**（委託配送先）／**DW**（ドライバー）／**SW**（仕入先）. Code `AW_PLAN_001〜003` trong memo này giữ nguyên.
- **hong 回答 2026-10-05 (memo アンケート Q9＝A): dùng quy ước này.**

---

## 3. Code khác quyết định đã chốt → 設計書 viết theo quyết định, code là 宿題 [宿題]

| # | Nội dung | Quyết định | Code hiện tại |
|---|---|---|---|
| H1 | Cột 「初期料金（税抜）」 trong ESライト（自販機） 価格プラン (màn 新規登録) | **廃止** (hong M2 2026-10-03, 受付簿 #18, 台帳 「自販機の初期費用」) | **đã bỏ** trong main 2026-10-05 (spec/plans.ts, planCsv.ts) → không còn là 宿題 |
| H2 | 28-178 ①: 冷凍の上限＋冷蔵・常温の上限 | **≧ 合計** (決定_STEP5回答 Q5 2026-10-01 sửa từ ＝) | code đúng (≧). マスタ項目一覧 còn ghi ＝ → sửa doc |
| H3 | 28-178 ⑥ 期間は重ねない; 28-182 ⑦⑧ (標準パターン ≧1行, 冷蔵庫の行必須 trừ ES250・ES600以上, 最大収納数 ≧ 1回の納品数 警告); 28-184 ⑨ (自販機の行 ≧1, 冷蔵庫・冷凍庫を入れない) | có trong 保存時のチェック | code chỉ check: tên trống, 合計>0, 上限/下限, 配送回数≧1, 価格≧企業負担分, 公開用 1行 |
| H4 | 最大文字数: 名称 60, 備考 500 (input_standard, マスタ項目一覧 2026-10-03) | có | input không có maxlength |
| H5 | 公開用プラン名 nhập → nếu 管理用プラン名 trống thì copy (REQ-PM-003) | có | không thấy trong code |
| H6 | 税率 chọn từ 税率マスタ, システム管理 thêm được (28-149, 台帳 E #9) | có | 2 lựa chọn cố định |
| H7 | 一覧 cột コース = 選べるコース; 一覧 cột giá (xem Q1) | — | — |

## 4. Giá trị chưa chốt với khách [open] (ghi vào OPEN sheet, không đoán)

| # | Mục | Ghi chú |
|---|---|---|
| O1 | 冷凍_標準の配送回数 の値 | ~~冷凍庫の表 未受領~~ → **hong 2026-10-05: tạm 1 lần/tháng cho mọi plan, 運営 sửa sau** (台帳 F, 受付簿 #60). Đã bỏ khỏi OPEN |
| O2 | 残りわずか率 の値 | ~~要確認（例：25）~~ → **hong 2026-10-05: mặc định 25%, 運営 đổi theo plan** (台帳 F, 受付簿 #60). Đã bỏ khỏi OPEN |
| O3 | 企業負担分 端数 | ~~追補 §6 ①: 切り捨て【暫定】~~ → **hong 2026-10-05: 四捨五入** (台帳 F, 受付簿 #59 実装待ち). Đã bỏ khỏi OPEN |

## 5. Message [msg] — xử lý sau khi có Message List
- 0件: code 「条件に一致するデータがありません。条件を変えるか「クリア」を押してください。」 ／ 全体の定義 「該当するデータがありません。」 (I01)
- 削除確認: code 「削除しますか？／削除済にします（一覧からは既定で隠れます。戻せません）。」 ／ Q01
- 削除できません: 「使用中の契約 {n}件のため削除できません。非公開にする場合は公開ステータスを変えてください。」 → cần ID mới
- 保存エラー: hộp 「保存できません（{n}件）」 + danh sách + viền đỏ (RV-OPS-20261002 O-i) — khác P-FORM (inline dưới ô) → ghi là pattern riêng của マスタ
- 離脱: 「編集内容を破棄しますか？／編集中の内容は保存されません。…」 ／ Q02
- 成功: 「登録しました」「保存しました」「削除しました」 ／ S01, S02
- 価格世代: nhiều toast riêng (phụ thuộc Q1)

## 6. Những điểm đã khớp (không hỏi)
- 一覧 10／20／50件, 削除済みを表示しない mặc định, 検索 chỉ áp dụng khi nhấn 検索/Enter + 未適用 (STEP7, 2026-10-03)
- 論理削除, 使用中は削除できない (RV-OPS-20261002 O-b), ID ES＋6桁 (28-177)
- コース 複数選択 3 giá trị, タブ theo コース (28-184/185), 企業負担 100円/8%/10% (28-147〜149), 免責金額 プラン単位 (§6 ⑤)
- ES30 非公開 (台帳 E #16): seed ES000002 public=false

---

## 7. Kết quả (2026-10-05, sau khi hong trả lời Q1〜Q7)

- Dữ liệu: `データ/AW_PLAN_プランマスタ.py` (3 màn hình, 20 trạng thái, 269 mục), `データ/_共通_メッセージ.py` (gán số Message List; ja_o theo Message List), `データ/_共通パターン.py` (+ P-FORMBOX, P-CSV).
- `make.py --check`: 0 lỗi, 0 chưa xác nhận. `--capture` trên app thật: 269/269 vị trí tìm thấy. Build `--book 運営管理者Web_マスタ` không cần `--draft`.
- Kết quả: `出力/運営管理者Web_マスタ/画面設計書_AW_PLAN_プランマスタ.html` (viewer song ngữ), `運営管理者Web_マスタ_JA.xlsx`・`_VI.xlsx`. **Không commit đầu ra** (hong 2026-10-05: giữ quy tắc `docs/**/*.html`), tạo lại bằng make.py khi cần.
- OPEN (3): 企業負担分 端数 (切り捨て【暫定】 vs 台帳 E 四捨五入), 冷凍_標準の配送回数 の値 (冷凍庫の表 未受領), 残りわずか率 の値.
- Message: 43 ID dùng, 22 chưa có trong Message List (sheet 「Message List への追加案」), 3 khác câu chữ với Message List: E31 (No.43), E37 (No.42), E40 (No.69). Xử lý sau khi hong xem ([msg]).
- 宿題 cho code đã ghi `demo_ok` trong dữ liệu: 並べ替え (#55), 価格世代 × 配送方法 và màn 新規 (#52), maxlength (H4), copy 公開用→管理用 (H5), 税率マスタ (H6), check 28-178⑥/28-182⑦⑧/28-184⑨ (H3), tab của course không chọn vẫn bật (A15), câu chữ 0件・削除確認 theo Message List.
- Chưa làm: `--release 1.0` (chờ hong xem HTML và chốt Message); 機種・オプション・値引き cùng book 運営管理者Web_マスタ.

## 8. Góp ý của hong trên HTML (2026-10-05) → đã sửa cả code lẫn 設計書
- Thứ tự card ở 詳細: プラン設定 → 料金の内訳 → タブ → 価格世代 → 初期備品 (`MasterDetail.tsx`; 台帳 F, 受付簿 #61). Đánh số lại: 3 プラン設定, 4 料金, 5 タブ, 6・7 ESスタンダード, 8 価格世代, 9 初期備品.
- Lỗi khi lưu: hiện câu lỗi ngay dưới mục (viền đỏ + 「…は必須項目です。」); giữ hộp tổng hợp ở trên (`logic.ts` Check.msgs, `parts.tsx`, `masters.css`; P-FORMBOX; 台帳 F, 受付簿 #62).
- HTML đăng lại (Version 2): https://claude.ai/artifact/TbJSZ7BenkxsFe8C4noMZr

## 9. Góp ý thứ 3 của hong (2026-10-05, ảnh màn hình hiện hành)
- Màn hiện hành: trong tab của mỗi course, dưới phần thiết lập có **bảng 価格プラン** (公開用 radio, tên 世代, 開始/終了期間 theo ngày, 価格 COOL便/ES配送便). Bản 設計書 v2 đã gộp vào card 価格世代 ở cuối → thiếu. Phương án C (Q1) **bị thay**: giữ bảng 価格プラン trong tab, 1 dòng = 1 thế hệ, thêm cột 使っている子契約 và thao tác (直す/削除/誤りの訂正). Không còn card 価格世代 riêng. 台帳 F sửa dòng Q1, 受付簿 #63 (実装待ち: gộp chức năng của PriceGens vào bảng).
- Code: bỏ ẩn bảng 価格プラン ở 詳細・編集 (`MasterDetail.tsx`), dữ liệu dòng = priceGens (fromDomain). Card 価格世代 vẫn còn ở cuối trang cho đến khi gộp xong (không đánh số trong 設計書).
- Đánh số lại 詳細: 6 設定 → 7 価格プラン → 8 標準貸出設備 (ESスタンダード); 10/11/12 (ESライト); 13/14/15 (自販機); 16 変更履歴; 9 初期備品; trạng thái 012 = 一括切替. Màn 登録・編集: trạng thái 013〜019.
- 「初期設備もタブの下に」: 標準貸出設備 đã nằm trong tab (8/12/15). Nếu hong muốn nói card 初期備品・プランに含む資材 (9) cũng vào trong tab theo course thì cần xác nhận (đang hỏi).
- Góp ý thứ 4 (2026-10-05): 「価格世代を一括切替」 → **B**: bỏ khỏi プランマスタ (nút 1.4 và trạng thái 012), làm từ 一括変更 ở 子契約一覧. 台帳 F, 受付簿 #64. Code đã bỏ nút ở MasterDetail và PriceGens.
- 「初期設備もタブの下に」 = **2** (hong 2026-10-05): card 初期備品・プランに含む資材 vào trong từng tab コース, sau 標準貸出設備 (9 / 13 / 17). 月の無料数量 chung cho plan hiện ở mọi tab. Code: PlanMaterials nhận `course`, MasterDetail vẽ trong pane. 台帳 F, 受付簿 #65.
- Message (hong 2026-10-05): E31 theo Message List No.43 (cảnh báo, cho ghi đè); E37 và E40 giữ câu mới, hong sửa No.42 và No.69 trong Excel rồi xuất lại CSV. 台帳 F, 受付簿 #66. 22 message mới: chờ hong xác nhận thêm vào Message List (sheet 追加案).
- 22 message mới: hong OK (2026-10-05) → 受付簿 #67. hong dán sheet 追加案 vào Excel, đánh số, xuất lại CSV; m điền `ml` sau.
- **Release 1.0** (2026-10-05): `make.py --release 1.0 --book 運営管理者Web_マスタ`. snapshot: `出力/運営管理者Web_マスタ/_release/snapshot.json` (commit).
