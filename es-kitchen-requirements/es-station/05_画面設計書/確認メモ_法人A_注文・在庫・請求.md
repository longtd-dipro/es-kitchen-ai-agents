# 確認メモ：法人Web 注文・在庫・請求（領域 法人A）— Ghi chú rà soát trước khi viết 画面設計書

Ngày: 2026-10-05 ／ Người rà: Claude (cloud, phiên `claude/elegant-gauss-ppbt0w`) ／ Giai đoạn A của `並列実行計画_画面設計書.md`.
Nguồn: code thật (`app/corp/page.tsx`, `app/corp/order/**`, `app/corp/stock`, `app/corp/bills`, `app/corp/deliveries/[id]`, `app/corp/_ui`, `app/corp/_docs`, `lib/corp/**`, `lib/domain/areas/{order,delivery,report}.ts`), `docs/決定台帳.md` (B・E・F), `docs/決定の受付簿.md`, `00_決定/決定_STEP5回答_法人Web_20261001.md`, `決定_v2.3追補_法人ホームカレンダー_20260929.md` (#54〜#62), `決定_法人Webアカウント_H1-H5`, `決定_STEP7_一覧の決まり`, `50_注文/Order-Spec-for-AI-Team.md`, `50_注文/月次注文デモ_プラン契約との差分_20260930.md`, `40_マスタ・料金・請求/請求ルール_仕様_v1.md`, `20_法人・拠点・契約/法人Web_拠点管理_画面仕様_v1.md` §2-4・§2-5, `基本設計_全体の定義_提案_20261001.md` §10, `MessageList_WEB_20261001.csv`.

Quy ước: **[Q]** = cần hong trả lời ／ **[宿題]** = 台帳・決定 đã chốt, code chưa theo → 設計書 viết theo quyết định, ghi `demo_ok` ／ **[open]** = chưa ai quyết, hỏi khách ／ **[msg]** = câu chữ, xử lý ở giai đoạn B với dải ID 法人A (E300〜, Q200〜, S200〜, I200〜, W200〜).
**Không hỏi hong trực tiếp trong giai đoạn A** (quy tắc 並列実行計画 §2). Câu hỏi gom ở mục 2.

Login mẫu (`lib/domain/seed/account.ts`): CU00001 法人 (5 拠点), CU00871 大阪支店 (ES配送便・デフォルト注文), CU00643 本社 (ESライト（自販機）), CU00950 横浜 (ESスタンダード・COOL便), CU00961 千葉 (COOL便・登録済), CU00902 名古屋 (休止), CU00071 みちのく商事 (お試し), CU00031 ひかり物産 (có トラブル chưa giải quyết), CU01310 (参照のみ). Mật khẩu bất kỳ. Ngày mẫu 2026-10-05; đổi bằng DEMO bar.

---

## 1. Phạm vi và trạng thái (VIEWS) đề xuất

7 機能 = 7 sheet (Book 法人Web). Screen Code theo 台帳 E: `CW_<機能略>_<3桁>`.

### 1-1. CW_HOME ホーム (`/corp`)

| Code | Trạng thái (id) | URL / cách tạo |
|---|---|---|
| CW_HOME_001 ホーム | 001 法人アカウント・全拠点（今月） | CU00001, `/corp` |
| | 002 法人アカウント・1拠点に絞り込み | select 「拠点で絞り込み」 |
| | 003 拠点アカウント | CU00871 |
| | 004 前の月・次の月（予定のマス） | ‹ › (2026-09 / 2026-11) |
| | 005 範囲の外（トースト） | ‹ ở 9月 |
| | 006 ご注文がまだの警告 | DEMO 日付 10/08〜10/15, 拠点 デフォルトのまま |
| | 007 確認が必要なお届け：ご提案あり | 運営Web で DD-20261005-0095 を「別の日のご提案」に |
| | 008 確認が必要なお届け：配送状況を確認中 | CU00031 |
| | 009 マスのバッジ（一部お届け・日付変更・ご提案あり） | 大阪 9/15 便 ほか |
| | 010 同じ日に複数のお届け（詳細を開けない） | CU00001 全拠点 (xem Q-H2) |
| | 011 お知らせ 0件／確認が必要なお届け 0件 | CU00001 初期 |
| | 012 CSV出力 | ボタン |

Dự kiến ≈ 35 項目 (見出し・警告・カレンダー・凡例・お知らせ・確認が必要なお届け・CSV).

### 1-2. CW_DLV お届け詳細 (`/corp/deliveries/[id]`)

| Code | Trạng thái | URL / cách tạo |
|---|---|---|
| CW_DLV_001 お届け詳細 | 001 予定（申請できる） | 大阪 11/24 の便 |
| | 002 予定（申請中） | 大阪 11/10 (DD-20261005-0095) |
| | 003 予定（締切を過ぎた） | DEMO 日付 10/16〜 |
| | 004 別の日のご提案あり（受ける／お断りする） | 運営Web で提案 |
| | 005 お断りの確認モーダル | 004 → お断りする |
| | 006 確定（出荷待・商品の表） | 大阪 10/13 DL-261012-0011（代替品の行） |
| | 007 配送中（送り状あり・クール便） | 千葉・横浜 出荷済 |
| | 008 お届け済み（ES配送便：受け取った方・集金） | 大阪 9/29 DL-260928-0014 |
| | 009 一部お届け済み（不足・関連するお届け） | 大阪 9/15 |
| | 010 配送状況を確認中 | CU00031 川崎工場 |
| | 011 資材便 | MO-2610-0012 |
| | 012 お届け日の変更を申請（モーダル） | 001 → ボタン |
| | 013 申請の入力エラー | 012 で未入力 |
| | 014 見つからない（他拠点の ID） | CU00871 で他拠点 |

≈ 60 項目.

### 1-3. CW_ORDER 商品注文 (`/corp/order`, `/corp/order/ai`)

| Code | Trạng thái | URL / cách tạo |
|---|---|---|
| CW_ORDER_001 商品注文 | 001 通常（ESライト（冷蔵庫）・カード表示） | CU00871 |
| | 002 一覧表示 | 表示切替 |
| | 003 ESスタンダード（冷凍あり） | 横浜タブ／CU00950 |
| | 004 ESライト（自販機）（枠ごと・50個の注意） | CU00643 |
| | 005 休止中 | CU00902 |
| | 006 お試し（参照のみ） | CU00071 |
| | 007 ご注文がまだの警告 | DEMO 10/08〜 |
| | 008 締切済み | DEMO 10/16〜 |
| | 009 代替品で注文できない便 | ALT 設定が 11月の便にかかるとき（見本では出ない） |
| | 010 入力中（未登録）・一括操作バー | 数を変える／チェック |
| | 011 検索 0件 | 検索 |
| | 012 アンケート回答中 | アンケート→案内を開始 |
| CW_ORDER_002 モーダル | 013 破棄の確認／014 登録できません／015 登録完了／016 メニュー詳細／017 指標一覧／018 変更履歴／019 注文の設定／020 AI の方法を選ぶ／021 アンケート開始／022 アンケート（回答中） | 各ボタン |
| CW_ORDER_003 AI（自動提案） | 023 均等配分／024 過去データを参照／025 チャット／026 登録できない提案／027 破棄の確認 | `/corp/order/ai?mode=even|past|chat` |

≈ 120 項目 (機能 lớn nhất của 法人Web).

### 1-4. CW_MAT 資材注文 (`/corp/order/materials`)

| Code | Trạng thái | URL / cách tạo |
|---|---|---|
| CW_MAT_001 資材注文 | 001 通常／002 休止中／003 入力中／004 変更履歴 | CU00871／CU00902 |

≈ 20 項目.

### 1-5. CW_HIST 注文履歴 (`/corp/order/history`, `/[site]/[ym]`)

| Code | Trạng thái | URL / cách tạo |
|---|---|---|
| CW_HIST_001 注文履歴（一覧） | 001 商品注文／002 資材注文／003 0件／004 拠点アカウント／005 納品書（モーダル） | 切替・検索 |
| CW_HIST_002 注文履歴 詳細 | 006 受付中の月（注文を変更）／007 過去の月／008 お試し／009 見られない | `/corp/order/history/CU00871/2026-11` |

≈ 45 項目.

### 1-6. CW_STOCK 棚卸報告 (`/corp/stock`)（旧「在庫点検」。画面名・メニュー名は 棚卸報告＝台帳 E）

| Code | Trạng thái | URL / cách tạo |
|---|---|---|
| CW_STOCK_001 在庫点検 | 001 法人アカウント（拠点ごとの状況＋入力） | CU00001 → 千葉 |
| | 002 拠点アカウント | CU00961 |
| | 003 入力中（企業担当者・今回）／004 入力エラー | 千葉 2026-10 |
| | 005 報告の確認モーダル／006 大きく増えた警告／007 報告した方 未選択 | 報告する |
| | 008 報告済（数え直せる）／009 数え直し | 報告後 |
| | 010 ドライバーが点検する拠点（参照） | 大阪・本社 |
| | 011 過去の月 報告済／012 過去の月 未報告（事務手数料） | 2026-09 |
| | 013 ご契約前／014 休止中／015 休止の始めの在庫点検／016 点検なし | CU00071 2026-09／名古屋 10/12 以降／名古屋 2026-09／noStockCheck |
| | 017 お届け中の商品あり／018 廃棄する・期限切れ見込みの行 | seed |
| | 019 CSV出力 | ボタン |

≈ 50 項目.

### 1-7. CW_BILL 請求書 (`/corp/bills`, `/corp/bills/[no]`)

| Code | Trạng thái | URL / cách tạo |
|---|---|---|
| CW_BILL_001 請求書（一覧） | 001 法人アカウント／002 拠点アカウント（請求先＝法人・この拠点の分）／003 拠点アカウント（請求先＝拠点）／004 0件／005 CSV出力 | CU00001／CU00871／CU00961 |
| CW_BILL_002 請求書詳細 | 006 法人あて（拠点列・再請求あり）／007 拠点あて／008 法人あての内訳（参考・拠点から）／009 送付エラー／010 繰越済／011 最終請求書／012 見つからない | INV-2026100001／0015／CU00871／0016／INV-2026080001 |

≈ 55 項目.

**Tổng dự kiến ≈ 385 項目, 7 sheet.**

---

## 2. Điểm cần hong quyết định [Q] — **đã trả lời hết 2026-10-05** (dòng 回答 ở mỗi câu, ghi 台帳 E). Giai đoạn B có thể bắt đầu.

Gom theo 機能. Mỗi câu: trích dẫn, lựa chọn, đề xuất. Câu đánh dấu ★ ảnh hưởng nhiều màn, nên trả lời trước.

### Chung（共通）

**Q-C1 ★ Tên hệ thống trong câu chữ của 法人Web.** Code dùng lẫn 「ESキッチン」(hầu hết), 「ESSTATION」(chatbot, 請求書詳細), 「ES STATION」. Message List dùng 「ESキッチンサポート窓口」, mail sender 「【ESステーション】ESキッチン運営」. `message_style.md` chưa có mục này.
- A. 「ESキッチン」 thống nhất cho câu chữ hướng khách (運営 = 「ESキッチン」) ／ B. 「ES STATION」.
- Đề xuất **A** (khớp Message List và mail). Ghi vào `message_style.md` §2-7 用語.
- **回答 (hong 2026-10-05, 台帳 E):** 「ESキッチン」＝tên khách (công ty vận hành), 「ES STATION」＝tên hệ thống. Không phải A/B: dùng cả hai đúng vai. Ghi vào 台帳 E và message_style.

**Q-C2 ★ Trạng thái 参照のみ (解約後) và 停止.** 基本設計 §10-7-3: 解約後 = 参照のみ. Code: ホーム・お届け詳細・月次注文・在庫点検 không chặn gì (vẫn 登録 được), chỉ 拠点管理・請求書 hiện 帯. → 宿題 code. **Hỏi:** 参照のみ có được làm 3 việc này không: ① お届け日の変更申請 ② 在庫点検の報告 (最終請求 cần 在庫差額) ③ 資材注文.
- Đề xuất: ① không ② **có** (cần cho 最終請求書, 請求ルール 3-5) ③ không.
- **回答 (hong 2026-10-05, 台帳 E):** như đề xuất: ① không ② **có** (棚卸報告) ③ không. Nguồn trạng thái 参照のみ: 請求ルール 3-7, 基本設計 §10-7-3.

**Q-C3 Nút 「CSV出力」 trên ホーム (お届け) và 在庫点検・請求書・注文履歴.** `CSV入出力_定義` dòng 148 đã có ✅ cho 法人 (ホーム・請求書・注文履歴・在庫点検). Chỉ xác nhận: cột CSV của ホーム hiện có 元の配送ID・送り状番号・代替品 (18 cột). OK giữ nguyên? Đề xuất **giữ**, viết theo P-CSV-OUT.
- **回答 (hong 2026-10-05, 台帳 E):** như đề xuất.

### ホーム (CW_HOME)

**Q-H1 「最終更新 {日付} 03:00」 ở 見出し.** Code ghi cứng 「03:00」 (`page.tsx:95`); không có quyết định nào về 最終更新 trên ホーム. Đề xuất **bỏ** (dữ liệu là realtime, không có batch 03:00 cho ホーム; 日次バッチ là 0:00／9:00 theo 台帳 E).
- **回答 (hong 2026-10-05, 台帳 E):** như đề xuất.

**Q-H2 Một ngày có nhiều お届け (法人アカウント・全拠点).** 決定 #54 「マスを押すと、そのお届けの詳細を開く」. Code: nhiều お届け cùng ngày → không mở được, chỉ toast.
- A. Bấm マス → popover liệt kê お届け trong ngày (拠点・温度帯・状態), chọn 1 → 詳細 ／ B. Mở お届け đầu tiên ／ C. Giữ như code (bắt lọc 拠点 trước).
- Đề xuất **A**.
- **回答 (hong 2026-10-05, 台帳 E):** như đề xuất.

**Q-H3 「確認が必要なお届け」 có 4 loại theo 決定 #58** (①別の日のご提案 ②届かなかった・遅れた ③申請の結果 14日間 ④申請できる予定 3週間前). Code chỉ có ① và ②(トラブル確認中). ③④ là 宿題 code. **Hỏi:** giữ đủ 4 loại? Đề xuất **giữ 4** như #58 (đã quyết 2026/09/29, không thấy thay đổi).
- **回答 (hong 2026-10-05, 台帳 E):** như đề xuất.

### お届け詳細 (CW_DLV)

**Q-D1 Tên công ty vận chuyển trong link 送り状.** 決定 #56: 「送り状番号と追跡ページへのリンクを出す。**配送会社名の欄は作らない**」. Code: link 「{運送会社}の追跡ページ ↗」 và chú thích 「運送会社（ヤマト運輸）の追跡ページ」.
- A. Cho phép tên hãng trong text link (không có cột riêng) ／ B. Link ghi 「追跡ページ」 không tên hãng.
- Đề xuất **A** (khách bấm vào trang ヤマト thì cũng thấy tên; #56 chỉ cấm cột 配送会社).
- **回答 (hong 2026-10-05, 台帳 E):** như đề xuất.

**Q-D2 法人 có 取り下げ được 変更申請 không.** 決定 #59: 「取り下げ」は【案】・確認待ち. Code có trạng thái 取り下げ trong CR_TONE nhưng không có nút. Đề xuất **có**, chỉ khi 申請中 (chưa 提案・chưa 処理), nút ở 申請の履歴; cùng quy tắc H2 (拠点アカウント không 取り下げ 申請 của 法人アカウント).
- **回答 (hong 2026-10-05, 台帳 E):** như đề xuất.

**Q-D3 Nút 納品書（PDF）trên お届け詳細.** 決定 STEP5 §2-6: 納品書 đặt ở **注文履歴の行（拠点×対象月）**, 月・拠点ごと, 資材除く. Code có cả ở お届け詳細 (便ごと) và 注文履歴. Đề xuất **bỏ ở お届け詳細**, giữ 注文履歴 (đúng quyết định, tránh 2 loại 納品書).
- **回答 (hong 2026-10-05, 台帳 E):** như đề xuất.

**Q-D4 Ngày không chọn được trong 変更申請.** 決定 #57: 「選べない日（納品不可曜日・今のお届け日など）は押せない」. Code: chặn 土日 + 今のお届け日; chú thích lại ghi 「祝日・月曜はお届けできません」; 祝日 chỉ chặn ở server. **Hỏi:** quy tắc 納品不可曜日 của 法人 là gì (全社の納品不可日 + 拠点の納品不可曜日 từ 子契約?). Đề xuất: chặn = 全社の休日マスタ + 拠点の納品不可曜日 (配送ルート設定) + 今のお届け日; không ghi cứng 月曜.
- **回答 (hong 2026-10-05, 台帳 E):** như đề xuất.

### 商品注文 (CW_ORDER)

**Q-O1 ★ Điều kiện 登録: 合計＝プラン数 hay ≦.** Order-Spec §4.3 「Tổng tất cả các lần ship = số lượng tối đa của Plan」 và §4.4 「Max tổng ≤ Plan」, 「chênh lệch giữa các lần ship ≤ ±1」(bắt buộc khi Lưu). 月次注文デモ差分 Q1 (hong 2026/09/30): 冷凍・冷蔵 「上限・下限の範囲で自由」. Code: cho 登録 khi 合計 ≦ プラン数 (thiếu vẫn được, chỉ đỏ), **không** kiểm ±1 giữa các 便, 下限 luôn 0.
- A. **合計＝プラン数 bắt buộc**, mỗi 温度帯 trong 下限〜上限 (下限 冷凍 theo 子契約), 便ごとの差 ≦ ±1 → chặn ／ B. Như code (≦, không ±1) ／ C. ＝ bắt buộc, ±1 chỉ cảnh báo.
- Đề xuất **A** (tiền プラン là theo số lượng cố định; Order-Spec ghi bắt buộc khi Lưu; ±1 từ 2026/07/24). Ảnh hưởng AI 提案 và デフォルト注文.
- **回答 (hong 2026-10-05, 台帳 E):** **A**. 合計＝プラン数 bắt buộc, 温度帯 下限〜上限, 便の差 ±1 → chặn.

**Q-O2 ★ AI（自動提案）có 3 kiểu: 均等配分／過去データ／チャット.** 決定 STEP5 §2-4・2-5: AI dùng 過去の注文・廃棄率・在庫; 「次回以降も適用」 thay AIモード. **Không có quyết định về チャット** và 均等配分. Code: cả 3 chạy trong trình duyệt (chưa gọi AI team).
- A. Giữ 3 kiểu ／ B. Chỉ 過去データ (= AI của AI team) + 均等配分 là fallback khi chưa có lịch sử ／ C. Chỉ 過去データ.
- Đề xuất **B**. チャット để phase sau (ghi 参考). Cần hong xác nhận với AI team.
- **回答 (hong 2026-10-05, 台帳 E):** **A** giữ cả 3 (均等配分／過去データ／チャット).

**Q-O3 従業員アンケート (案内・15品・点数).** Code có アンケート開始 (締切日), 点数 = 「食べたい 2点・気になる 1点【要確認】」, 1人15品, 回答数 41 ghi cứng. 台帳 E chỉ có 「アンケートの『全員』は休止中の拠点のユーザーを除く」. 運営F (アンケート管理) đang làm memo ở phiên khác. **Hỏi:** ① tính năng アンケート trong 商品注文 có trong phạm vi phase 2 không ② cách tính điểm ③ 15品. Đề xuất: ① có (có màn 運営), ② 2点/1点 như code, ③ 15品 — nhưng cần khớp với memo 運営F.
- **回答 (hong 2026-10-05, 台帳 E):** như đề xuất.

**Q-O4 自販機 50個/便 vượt thì chặn hay chỉ cảnh báo.** Order-Spec §4.5 「Cảnh báo (KHÔNG chặn)」, 「sức chứa máy chỉ tham khảo, ưu tiên Plan」. Code: cảnh báo. Đề xuất **cảnh báo** (như code, khớp Order-Spec). Riêng ベルト列 vượt → cảnh báo (Order-Spec §4.5).
- **回答 (hong 2026-10-05, 台帳 E):** như đề xuất.

**Q-O5 Nhãn giá 「定価 N円」.** Code không ghi 税込/税抜; 商品.販売価格 là 税込 (`types.ts:444`); 注文の設定・AI ghi 「金額（税込）」. 基本設計 §10-5: 金額は税抜か税込かを項目名に書く. Đề xuất **「定価（税込）」** mọi chỗ.
- **回答 (hong 2026-10-05, 台帳 E):** như đề xuất.

**Q-O6 Giá trị ban đầu của 資材注文.** Code: số của lần đặt gần nhất trong tháng, không có thì MAT_BASE (「デモの仮の数量」). STEP5 Q2: 資材は随時. Đề xuất **0 tất cả** (mỗi lần đặt là 1 資材便 riêng; tránh đặt nhầm số cũ).
- **回答 (hong 2026-10-05, 台帳 E):** như đề xuất.

**Q-O7 Xác nhận trước khi 登録 資材注文 lần 2 trở đi (有料 OP000036).** Code: không có hộp xác nhận; 登録 thẳng. Đề xuất **có モーダル xác nhận** khi là lần 2+ trong サイクル月: 「2回目以降の資材注文のため、資材の追加配送（¥{n}・税抜）がかかります。注文しますか？」(msg mới).
- **回答 (hong 2026-10-05, 台帳 E):** như đề xuất.

**Q-O8 お試し拠点 có 資材注文 được không.** STEP5 T3: お試し 注文 do hệ thống tự tạo, 法人 chỉ xem; 初期セット tự động. Code chặn 商品注文 nhưng **không chặn 資材注文**. Đề xuất **không cho** (参照のみ như 商品注文); cần thì liên hệ 運営.
- **回答 (hong 2026-10-05, 台帳 E):** như đề xuất.

**Q-O9 一覧の初期の並び** (台帳 E: không ghi = 更新日時 降順). 商品注文: メニューの並び (運営 đặt) ／ 注文履歴: 対象年月 降順 ／ 請求書: 発行日 降順 ／ 在庫点検 拠点ごとの状況: 拠点ID 昇順. Đề xuất như vậy, ghi vào từng sheet.
- **回答 (hong 2026-10-05, 台帳 E):** như đề xuất.

### 在庫点検 (CW_STOCK)

**Q-S1 ★ Tên màn hình: 「在庫点検」 hay 「棚卸報告」.** 台帳 B 「画面名・費目名: 在庫の申告画面は**「棚卸報告」**」(hong 2026-10-03) và 台帳 E 131 「法人Web の棚卸報告」. Menu 法人Web (2026/10/03 決定の並び) và code: 「在庫点検」. Spec 2-5 cũng 「在庫点検」.
- A. Menu và 画面名 đều 「棚卸報告」 ／ B. Menu 「在庫点検」, nút/hành động 「棚卸を報告する」 ／ C. Giữ 「在庫点検」 (台帳 B chỉ nói màn 運営).
- Đề xuất **B** (khách hiểu 「在庫点検」 là việc phải làm; 「棚卸報告」 là tên của 申告 trong 運営). Nếu hong chọn A thì sửa menu + Message List.
- **回答 (hong 2026-10-05, 台帳 E):** **「棚卸報告」** cho cả menu và 画面名 (hong đã trả lời 2026-10-03, nay xác nhận). Screen Code đổi thành CW_STOCK (giữ), 画面名 棚卸報告. Sửa menu, spec 2-5, Message List.

**Q-S2 ★ Mốc 未報告 (事務手数料 ¥3,000): 20日 hay 25日.** 決定 STEP5 §2-6 「判定は20日時点と解釈【要確認】」; spec 2-5 vẫn ghi 申告期限 25日 (chưa sửa theo §2-6 「お客様の入力は20日まで」). Code: 20日, 21日以降は運営. Đề xuất **20日** (khớp code và §2-6), sửa spec 2-5.
- **回答 (hong 2026-10-05, 台帳 E):** mốc 未報告 (事務手数料) = **25日**; hạn nhập của khách trên 法人Web **giữ 20日** (21〜25日 運営 代理). Code: 判定 20日 → 宿題 đổi 25日.

**Q-S3 Các cột của bảng 点検.** Spec 2-5: 前回の点検の数・今回点検した数 (全商品必須). Code (課題 4-6, C-g — 課題一覧 chỉ có ở local): 商品・前回の点検・**お届け中・廃棄する・今ある数・捨てた数・届いた数**, chỉ hiện 商品 liên quan (前回・お届けした・お届け中・廃棄), không thêm 商品 ngoài danh sách. Đề xuất **theo code** (quyết định 10/02〜03 trong 課題一覧), 設計書 ghi 7 cột; sửa spec 2-5. Xác nhận: 法人 **không** thêm 商品 ngoài danh sách (khác ドライバー: スキャンで追加).
- **回答 (hong 2026-10-05, 台帳 E):** như đề xuất.

**Q-S4 Số tháng xem được.** Spec 2-5: 今回＋過去3か月 (見るだけ). Code: 今回＋1か月 (ghi cứng 2026-10／2026-09). Đề xuất **今回＋過去3か月** theo spec; 「拠点ごとの状況」 theo tháng đang chọn (code luôn tháng hiện tại).
- **回答 (hong 2026-10-05, 台帳 E):** như đề xuất.

**Q-S5 Giới hạn 4 chữ số (≦9999) cho 今ある数.** Code ghi cứng; `input_standard.md` không có mục số lượng tồn kho. Đề xuất **giữ 4桁** và thêm vào input_standard (数量: 0〜9999).
- **回答 (hong 2026-10-05, 台帳 E):** như đề xuất.

### 請求書 (CW_BILL)

**Q-B1 ★ Trạng thái 請求書 trên 法人Web.** 決定 STEP2 Q6／請求ルール 1-6: 法人Web **3段階 未確定／確定／請求済**. 請求ルール 5-5: 入金（消込）**取り込まない**. Code: 発行済／入金済／未入金／「INV-… で再請求」(入金済 không thể có nếu không 消込).
- A. Theo quyết định: 一覧 chỉ có 請求書 đã 確定 trở đi → 状態 = 確定／請求済 (+ 再請求 là バッジ riêng), bỏ 入金済・未入金 ／ B. Theo code (cần 消込 → đổi 5-5) ／ C. 確定／請求済／再請求あり.
- Đề xuất **A** (đúng 1-6 và 5-5). 「未確定」 không hiện vì chưa phát hành.
- **回答 (hong 2026-10-05, 台帳 E):** **A**: 確定／請求済 (+ バッジ 再請求). Bỏ 入金済・未入金.

**Q-B2 Hiển thị trạng thái gửi Bill One (送付の準備中／メールで送付済み／開封済み／送付できませんでした) và log cho 法人.** Không có trong 決定 (課題 0-2). Đề xuất **hiện 1 バッジ** (送付済み／送付できませんでした) không hiện log 開封; log chi tiết chỉ ở 運営.
- **回答 (hong 2026-10-05, 台帳 E):** như đề xuất.

**Q-B3 一覧 請求書 có 検索・ページ送り không.** 決定 STEP7 L2: mọi 一覧 có 並べ替え・ページ送り 10件. Code: không lọc, không phân trang. Đề xuất **có** theo P-LIST: điều kiện 請求月・請求先・状態; ページ 10件.
- **回答 (hong 2026-10-05, 台帳 E):** như đề xuất.

**Q-B4 Chữ 「固定額（前払い）」「ご利用実績の精算（後払い）」.** 台帳 B 60: 「前払い」「後払い」の文言は**出さない**（画面も請求書も「固定額」「実績精算」）. Code 法人Web vẫn ghi (前払い)(後払い) ở 一覧 chú thích, 請求金額, 明細 区分. → **宿題 code**, không cần hỏi; chỉ xác nhận tên hiển thị cho khách: 「固定額」「ご利用実績の精算」. Đề xuất giữ 「ご利用実績の精算」 (dễ hiểu hơn 「実績精算」 với khách) — hong chọn.
- **回答 (hong 2026-10-05, 台帳 E):** như đề xuất.

---

## 3. Code khác quyết định đã chốt → 設計書 viết theo quyết định, code là 宿題 [宿題]

| # | Nội dung | Quyết định (正) | Code hiện tại |
|---|---|---|---|
| H1 | カレンダー 月の範囲: 予定を作ってある月まで（最大6ヶ月先） | #54 | `HOME_MONTHS` ghi cứng 3 tháng |
| H2 | 配送祝日 hiển thị; サイクル境界 | #54, 休日マスタ | `HOLIDAYS` 3 ngày, `cycleOf` ghi cứng (9月分 từ 9/07 ≠ a1 9/14) |
| H3 | 確認が必要なお届け 4 loại (③申請の結果 14日 ④申請できる予定 3週間前) | #58 | chỉ ① ② (xem Q-H3) |
| H4 | 凡例 khớp バッジ thực tế; 「お届け中止」 negative | #42, #61 | 凡例 có 日付調整中・再配送 không bao giờ hiện; お届け中止 neutral |
| H5 | 0件 「確認が必要なお届けはありません」 | message riêng | dùng chung 「お知らせはありません」 |
| H6 | CSV 状態 = 画面の表示名 | #42 | CSV 「お届け予定」 vs 画面 「出荷待」 |
| D1 | 「希望日なし（運営におまかせ）」 được申請 | #57 | server từ chối 「希望日を選んでください」 (bug) |
| D2 | Sau khi お断りする: khung 「お断り済」 + chờ 運営 | #58, #62 | 状態 về 申請中, khung không hiện, noApplyText sai 「締切を過ぎた」 (bug) |
| D3 | 資材便 詳細: 「資材のお届けです（中身は資材のご注文をご覧ください）」 | — | bảng rỗng |
| D4 | 予定 có 明細 (11月 đã đăng ký): hiện 商品一覧 chỉ sau 締切 | #56 | chú thích trống |
| D5 | 送り状: 配送会社名の欄なし; ES配送便 không 番号 | #56 | OK (xem Q-D1) |
| D6 | Q02 離脱確認 toàn hệ thống | 台帳 E | 月次注文 không đăng ký leaveGuard → rời màn mất dữ liệu không hỏi |
| O1 | デフォルト注文 = 標準数 × 基本比×倍 × 拠点の設定 (カテゴリ・金額・対象外・短消費期限) | 28-179, STEP5 §2-4 | chỉ áp 対象外・短消費期限; カテゴリ・金額・applyNext không dùng |
| O2 | 「次回以降も適用」 ON: 受付開始日に AI 下書き | STEP5 §2-5 | chưa có batch tạo 下書き |
| O3 | 下限 温度帯 (冷凍 1〜) từ 子契約 snapshot | 28-178, 差分 C2 | 下限 luôn 0 |
| O4 | 商品タグ từ マスタ | 台帳 F | ghi cứng 4 tag |
| O5 | ピッキング倉庫で商品を絞る | STEP5 §2-6 | OK; fallback 「WH00001 関東倉庫」 ghi cứng |
| O6 | 温度帯 icon + 文字 + 色 | 要件シート 行185＝A | chỉ 文字 |
| O7 | メニューPDF 2 loại (ライト用／スタンダード用), ライトには スタンダード用を見せない | 台帳 F | 1 PDF |
| O8 | 1商品あたりの上限 なし | 台帳 B 89 | OK (999 là giới hạn kỹ thuật ô nhập) |
| O9 | 一覧表示の件数 10/20/50, 初期 10 | STEP7 L1 | per=12 giữ nguyên khi đổi sang 一覧 |
| O10 | トースト 「翌月（2026-12）…」 động | — | ghi cứng 2026-12 |
| O11 | 統計に金額を出さない | 2026-07-28 | OK |
| M1 | 「今月の資材注文 n回」 đếm theo **サイクル月** (資材便の配送回数) | STEP5 §2 Q2 | đếm theo 暦月 |
| M2 | 資材の表示名 コース3種; 資材マスタ×プラン | 28-184, 28-129 | OK về cơ bản; MAT_BASE 仮 |
| T1 | 納品書: 月・拠点ごと, 資材除く, PDF 現行テンプレート, 改ページ | STEP5 Q5, 行178 | モーダル demo, PDF chưa có; 代替品の注記 ghi cứng CU00871 |
| T2 | 対象年月 の選択肢 từ メニュー/契約 | — | `MONTHS` ghi cứng 2026-04〜11; メニューID công thức ghi cứng |
| T3 | 休止中の月の詳細: 「注文を変更」 không hiện | — | URL trực tiếp vẫn hiện |
| S1 | 対象月 今回＋3か月; 拠点ごとの状況 theo tháng chọn | spec 2-5 | ghi cứng 2 tháng (xem Q-S4) |
| S2 | 運営 確認済 → 法人 không sửa; UI ẩn nút 数え直し | report.ts | UI vẫn hiện nút, lưu mới báo lỗi |
| S3 | 報告者 suffix / 報告の方法 cho tháng pauseCheck của ES配送便 | 台帳 E | 「ES配送便ドライバー（法人アカウント）」 sai |
| S4 | Lỗi server dùng 商品名 không dùng productId | message_style | `{productId}：…` |
| S5 | 代替品の回収 お知らせ từ dữ liệu ALT | 決定_代替品 Q-ALT8 | ghi cứng CU00871／2026-10 |
| S6 | Spec 2-5 「申告期限 25日」→ 20日; 「申告」→「報告」 thống nhất | STEP5 §2-6 | spec chưa sửa; code comment 申告, UI 報告 |
| B1 | Bỏ chữ (前払い)(後払い) | 台帳 B 60 | còn (xem Q-B4) |
| B2 | 状態 3段階 | 1-6 | 発行済／入金済／未入金 (xem Q-B1) |
| B3 | 一覧: 検索・ページ送り | STEP7 L1・L2 | không có |
| B4 | 調整 lines → 区分 「調整」 (③ 調整明細) | 契約_06, 2-14 | gộp vào 固定額 |
| B5 | 「請求書が見つかりません」 có khung EmptyState | DS | plain text |
| B6 | 税率 文言 「8%／10%」 ghi cứng trong chú thích 明細 | 台帳 E 141 (税率マスタのどの率でも) | ghi cứng |
| C1 | 参照のみ・停止 chặn thao tác (xem Q-C2) | §10-7-3 | không chặn |
| C2 | Mật khẩu 〔仮〕 8文字以上英数字 | Message List 「8桁以上で英文字・数字」 | OK; bỏ 〔仮〕 (thuộc 法人B) |

---

## 4. Giá trị chưa chốt với khách [open]

| # | Mục | Ghi chú |
|---|---|---|
| O1 | OP000036 資材の追加配送 金額 | 仮 ¥2,000／回 (STEP5 §2-5). Hiện ở 資材注文・注文履歴 |
| O2 | 冷凍の標準の配送回数・1回の納品数 | 仮 「冷蔵と同じ」 (28-157) |
| O3 | 平均単価の目標 (chỉ 運営, không hiện 法人) | — (không trong 法人A) |
| O4 | 在庫差額の許容範囲 (免責) hiển thị trong chú thích 在庫点検 | 免責金額 プラン単位 (追補 §6 ⑤), giá trị theo プランマスタ; chú thích hiện không ghi số |
| O5 | 未点検ペナルティ ¥3,000 (2026/08/25 決定) | đã quyết, chỉ xác nhận khi 見積 |

---

## 5. Message [msg] — xử lý ở giai đoạn B (dải 法人A: E300〜329, Q200〜209, S200〜, I200〜, W200〜)

Đã có trong `_共通_メッセージ.py` (dùng ID chung, câu ja_c):
- Q02 離脱確認 (code 「編集内容を破棄しますか？／編集中の内容は保存されません。…」 → thống nhất Q02)
- I01 0件 (code 「条件に合う商品がありません」「まだ請求書はありません」「資材の注文はありません」 → I01 + câu riêng nếu cần)
- S01 保存 (注文の設定), E32 権限なし (403 「この拠点の注文は見られません」), E30 通信エラー (「通信に失敗しました。時間をおいてもう一度お試しください」 ≠ E30 → thống nhất E30)
- P-CSV-OUT: 「CSVを出力しました（{n}行）」 → S mới chung? (đề xuất thêm S12 chung ở phiên gộp)

Cần thêm (ID tạm, ja_c theo message_style):

| ID tạm | 場面 | 内容 (từ code, cần rút ≦ 40字 nếu toast) |
|---|---|---|
| NEW-CORPA-01 W | ホーム・商品注文 締切警告 | 「{月}のご注文がまだ入力されていません（締切 {日}・あと{n}日）」 + 本文 |
| NEW-CORPA-02 I | 商品注文 受付期間 | 「受付期間 {from}〜{to}（あと{n}日）」／「（締切済み）」 |
| NEW-CORPA-03 E | 登録できません（モーダル） | 条件リスト: 合計・温度帯・便の差 (phụ thuộc Q-O1) |
| NEW-CORPA-04 S | 注文を登録しました | 「ご注文を登録しました。続けて資材のご注文をしますか？」 (モーダル) |
| NEW-CORPA-05 E | 受付期間外 | 「受付期間が終わったため登録できません。」 |
| NEW-CORPA-06 I | 休止中 | 「この拠点は休止中です。…」 |
| NEW-CORPA-07 I | お試し参照のみ | 「お試し中のご注文（参照のみ）…」 |
| NEW-CORPA-08 W | 自販機 50個超 | 「自販機の商品は1回の配送で最大50個まで」 |
| NEW-CORPA-09 W | 代替品で注文できない便 | 「商品の不良のため注文できない便があります」 |
| NEW-CORPA-10 S | AI 反映 | 「AI（自動提案）を注文画面に反映しました。内容をご確認のうえ「登録」を押してください」 |
| NEW-CORPA-11 Q | 資材 2回目以降の確認 | (Q-O7) |
| NEW-CORPA-12 S | 資材注文 登録 | 「資材のご注文を登録しました。」 |
| NEW-CORPA-13 E | 資材 数量なし | 「ご注文数を1つ以上ご入力ください。」 |
| NEW-CORPA-14 Q | 在庫点検 報告の確認 | 「在庫点検を報告しますか？」 + 報告した方 |
| NEW-CORPA-15 S | 在庫点検 報告済 | 「在庫点検を報告しました。」 |
| NEW-CORPA-16 E | 在庫点検 未入力／届いた数超過 | 2 câu |
| NEW-CORPA-17 W | 前回から大きく増えた | 「⚠ の商品の数をもう一度お確かめください…」 |
| NEW-CORPA-18 E | 報告した方 未選択 | 「報告した方をお選びください。」 |
| NEW-CORPA-19 I/W/E | 在庫点検 状態別 Inline 7 loại | ご契約前／休止中／ドライバー点検／点検なし／報告済／報告してください／報告されていません |
| NEW-CORPA-20 S | 変更申請 受付 | 「変更申請 {id} を受け付けました…」 |
| NEW-CORPA-21 E | 変更申請 入力 4 loại + server 6 loại | 「変更したい日をお選びください。」 ほか |
| NEW-CORPA-22 Q | ご提案をお断りしますか？ | モーダル |
| NEW-CORPA-23 S | ご提案を受けました／お断りしました | トースト 2 |
| NEW-CORPA-24 I | 請求書 Bill One 案内 | 「請求書（PDF）は Bill One からお届けします」 |
| NEW-CORPA-25 I | 変更申請できない理由 5 loại | noApplyText |

Message List WEB có sẵn để đối chiếu: No.「表示するデータがありません。」(I01), 「編集内容を破棄しますか？」(Q02), 「ご契約は {日} に終了しました…参照のみ」(参照のみ帯), 「このアカウントはご解約により停止しています」(ログイン, 法人B).

---

## 6. Những điểm đã khớp (không hỏi)

- 締切警告 7日前〜締切日, ホーム＋商品注文, お試し・休止 除外, ON/OFF không tắt (台帳 E 177) ✓
- 法人／拠点アカウント 見える範囲 (#55, C3), adminOnly chỉ 法人情報 ✓; 申請者 chọn từ ご担当者 (C2) ✓ (在庫点検 報告した方)
- ホーム bố cục: 左 カレンダー, 右 お知らせ＋確認が必要なお届け (#54) ✓; 予定 バッジ info, マスの短い印 (#61) ✓
- お届け詳細 nội dung theo #56・#60 (không 写真・5ステップ・ピッキング・倉庫) ✓; 変更申請 từ 詳細, 第一・第二希望, 理由必須, 前半／後半 (#57) ✓; 法人の 枠 お断りする／受ける (#62) ✓
- 商品注文: 1商品上限なし ✓, 温度帯ごと 上限 ✓, 自販機に入らない商品 表示＋注意書き ✓, ピッキング倉庫で絞る ✓, 短消費期限 設定 法人 参照のみ (REQ-CT-300) ✓, 統計 金額なし ✓, 変更履歴 ✓, 登録後 お知らせ ✓, 休止・お試し chặn ✓
- 資材: 随時, 月1回 含む, OP000036, 初期セット không đếm ✓ (STEP5 Q2)
- 納品書 ở 注文履歴, 月・拠点, 資材除く ✓
- 在庫点検: 20日まで何度でも ✓, 21日以降 運営 ✓, ペナルティ ¥3,000 từ OP000016 ✓, 休止中 点検なし (台帳 3-1, override STEP5 Q3) ✓, 休止の始め お客様 (ES配送便 含む) ✓, 報告した方 (受付簿 44) ✓, モバイル対応 ✓, 報告者 氏名を残す ✓
- 請求書: 発行 翌月1日 ✓, 福利厚生 ON 2行/OFF 1行 ✓, 税率ごとの欄 (税率マスタ) ✓, 四捨五入 ✓, 再請求 税込 ✓, 拠点から この拠点の分 ✓, 実績精算 内訳 ✓, 法人Web 請求の設定 参照のみ ✓, PDF は Bill One ✓

---

## 7. Việc tiếp theo

1. hong trả lời mục 2 (ưu tiên ★: Q-C1, Q-C2, Q-O1, Q-O2, Q-S1, Q-S2, Q-B1) → phiên 回答 ghi 台帳 E + 受付簿, ghi 回答 vào memo này.
2. Giai đoạn B 法人A: viết 7 file `データ/CW_*.py`, `--check`, `npm run dev` + `--capture` (login CU00001／CU00871／CU00961), `--draft`.
3. 宿題 mục 3 → 受付簿 (実装待ち) khi hong 採用.

---

## 8. Giai đoạn B (2026-10-05): điểm tự quyết khi viết data — hong xác nhận một lượt

Data 7 file đã viết (`データ/CW_*.py`, 101 trạng thái, ≈470 項目), `--check` 0 lỗi. Những chỗ 台帳・memo không nói, người viết đã chọn như dưới (đều có thể đổi nhanh trong data). Trả lời 「như vậy」 hoặc nêu số muốn đổi.

| # | Màn | Đã chọn | Ghi chú |
|---|---|---|---|
| B-1 | 共通 | Toast CSV出力 = message chung **S12** 「CSVを出力しました（{n}行）。」 | dùng ở ホーム・注文履歴・棚卸報告・請求書 |
| B-2 | 共通 | ~~giữ theo code~~ **回答: tách cột theo P-HIST** (hong 2026-10-05) | 宿題 code |
| B-3 (回答 A, không thêm màn, xác nhận 2 lần) | ホーム | Popover khi 1 ngày nhiều お届け: tiêu đề 「{日付（曜）} のお届け」, dòng theo 拠点ID 昇順 → 冷蔵→冷凍→資材 | Q-H2 |
| B-4 (回答 ừa) | ホーム | 確認が必要なお届け loại ③④ (#58): badge 「申請」「予定」, tiêu đề 「{日付} のお届け：申請の結果が出ました」「{日付} のお届け：お届け日の変更を申請できます」 | code chưa có |
| B-5 (回答 「お届け日の変更申請の一覧へ」) | ホーム | Link góc phải 「お申し込みの一覧へ」 giữ theo code; 決定 #59 viết 「変更申請の一覧へ」 | hong chọn chữ |
| B-6 | ホーム | Nút 「資材を注文」 ẩn với 参照のみ và với 法人 お試し | **回答: ẩn cả 資材・商品注文** (hong 2026-10-05) |
| B-7 (回答 500 ký tự) | お届け詳細 | 理由 của 変更申請 = textarea 500 ký tự (input_standard 備考); code là 1 dòng không giới hạn | 宿題 code |
| B-8 (回答 có toast S211) | お届け詳細 | Sau 取り下げ không có toast riêng, chỉ đổi trạng thái dòng lịch sử | thiếu ID S; cấp thêm nếu muốn toast |
| B-9 (回答 bỏ modal, toast S212 + 案内 I216) | 商品注文 | モーダル 登録完了 (「完了」「資材注文へ」) để type 確認 **Q203**, không phải S | vì có 2 nút |
| B-10 (回答 9999 (chuẩn chung)) | 商品注文 | 便ごとの数量 giới hạn **0〜9999** (input_standard); code ô nhập tối đa 999 | 999 hay 9,999? |
| B-11 (回答 10/20/50 cả カード) | 商品注文 | カード表示 12/24/48件 giữ như code; 一覧表示 10/20/50 (STEP7) | STEP7 chỉ nói 一覧 |
| B-12 (回答 giữ) | 商品注文 | AI 提案プレビュー vẫn hiện tổng tiền 「¥9,400」 như code (2026-07-28 chỉ cấm ở 統計) | bỏ không? |
| B-13 (回答 ừa) | 商品注文 | Tên trạng thái 「ESキッチン入力済み」(ES登録済)・「自動注文」(デフォルト) theo code | |
| B-14 (回答 ừa) | 商品注文 | 温度帯 下限〜上限 trong 登録できません dùng E12 có sẵn; 合計＝プラン数 → E310; 便の差±1 → E311 | |
| B-15 (回答 未注文) | 資材注文 | Trạng thái 拠点 khi chưa đặt = 「未注文」 (code đang hiện 「自動注文」, sai nghĩa) | 宿題 code |
| B-16 (回答 bỏ tháng khỏi tiêu đề) | 資材注文 | 注文数量 0〜999; tiêu đề 「資材注文 {サイクル月}」 giữ như code | bỏ tháng khỏi tiêu đề? |
| B-17 (回答 ừa, lần 1 cũng hiện案内) | 資材注文 | Q205 (xác nhận lần 2+) không ghi mã OP000036 trong câu (message_style: không đưa 内部コード cho khách), giá để {金額} | |
| B-18 (回答 cần) | 注文履歴 | Tab 資材注文: sắp xếp 注文日 降順, có ページ送り 10件 (P-LIST), tab giữ trong URL ?tab= (P-TAB) | code chưa có → 宿題 |
| B-19 (回答 ừa) | 注文履歴 詳細 | Phần 資材 hiện theo 資材注文No của サイクル月 đó (code đang hiện số đang nhập) | 宿題 code |
| B-20 (回答 未報告 → 報告済 → 点検なし) | 棚卸報告 | 「拠点ごとの状況」 không áp P-LIST (ít dòng, 拠点ID 昇順) | |
| B-21 (回答: ES配送便の拠点も法人が報告できる・最後の報告が有効, 台帳 E) | 棚卸報告 | E325 dùng chữ 「ES STATION」 (「この拠点はES STATIONで報告する拠点ではありません」) theo Q-C1 | hay 「法人Web」? |
| B-22 (回答 ừa) | 請求書 | Điều kiện tìm (P-LIST): 請求月 (month) ／ 請求先 (すべて／法人あて／拠点あて, chỉ 法人アカウント) ／ 状態 (すべて／確定／請求済) | tên do người viết đặt |
| B-23 (回答 ừa) | 請求書 | Màu badge: 確定＝青, 請求済＝緑, 再請求＝黄 (kèm số INV); 送付済み＝青, 送付できませんでした＝赤 | |
| B-24 (回答 3 区分 + 種類) | 請求書 | 区分 明細 4 loại: 固定額／ご利用実績の精算／調整／再請求 | 宿題 B4 |

Trạng thái **không chụp được bằng seed hiện tại** (ảnh là màn thường, note ghi rõ; chụp lại khi có dữ liệu): ホーム 007・009 (ご提案あり・日付変更: cần 運営 thao tác DD-20261005-0095), お届け詳細 004・005 (ご提案), 007 (配送中: seed không có 出荷済), 商品注文 009 (代替品 11月), 棚卸報告 016 (点検なし: cần 運営 đặt), 請求書 011 (最終請求書: seed không có).


---

## 9. 版 1.0 のレビュー（hong 2026-10-05）→ 版 1.1

hong xem 7 HTML 版 1.0 và góp 35 điểm. Trả lời và quyết định ghi ở 台帳 E (4 dòng 「法人Web 版 1.0 のレビュー（…）」, 「納品書のテンプレート」), 受付簿 No.153・154. Tóm tắt:

| Màn | Đổi |
|---|---|
| ホーム | カレンダー／お知らせ 半々＋幅切替; bỏ CSV出力; bỏ 資材を注文; 1 khối 「ご確認ください」 (締切警告 + #58 4種) |
| お届け詳細 | bỏ 受取時間帯・到着予定; 「送り状番号」; 申請中 là bảng đủ cột; モーダル 変更申請 kiểu カレンダー 2 bước; 納品書（PDF）theo 便 (template 台帳) |
| 商品注文 | 登録 chính／キャンセル phụ／còn lại vào 「その他」; link メニューPDF; khối phụ 折りたたみ, 合計バー dính; 温度帯 icon+màu góc ảnh; ô 代替品 vô hiệu rõ; 締切後 → 注文履歴 詳細 |
| 資材注文 | 「今月 n回目」; 案内 2 dòng; bỏ cột コース; お届け予定日 chỉ khi 運営 nhập 送り状・発送日 (No.154) |
| 注文履歴 | メニューID: 受付中 → 商品注文, 締切後 → 詳細; 納品書 template |
| 棚卸報告 | màn 「棚卸一覧」 riêng (CW_STOCK_002); hết chữ 在庫点検; 報告した方 既定 メイン担当者; 棚卸用 PDF; 商品を追加 (JAN スキャン／検索); bỏ 大きく増えた警告; モーダル xác nhận đơn giản |
| 請求書 | không hiện 送付エラー cho khách; 見つからない = EmptyState chuẩn |

Trả lời câu hỏi: 見つからない chỉ khi URL sai; 受取時間帯・到着予定 bỏ; 商品注文 và 注文履歴 không trùng (締切後 chỉ còn 詳細); 自販機に入らない商品 đã có khung; 棚卸一覧 tách màn riêng. リードタイム 資材便 chưa có giá trị (OPEN).

### 9-1. 版 1.1 の画像について（2026-10-05）

- 版 1.1 のデータ・文言は完成（`--check` OK）。デモのコード（法人Web・運営Web 資材注文管理）も 版 1.1 に合わせた（受付簿 No.153・154 実装済・コード 132e0a7）。
- 画像（番号つきスクリーンショット）は、版 1.2 の時点では一部が版 1.0 のコードの古い画像のままだった（撮影のキャッシュ）。**版 1.3（2026-10-05）で `--force` で全部撮り直し**、7画面とも版 1.1 以降のコードの画像になった。7 つの artifact も版 1.3 を同じ URL に publish 済み。
- 撮り直しで直したこと：商品注文は「その他」メニューを開いてから アンケート・変更履歴確認・注文の設定・AI を押す／ホーム 010 は前の状態が覚えた月・拠点を戻す／お届け詳細 015 は日を選ぶ間に待ちを入れる（013 No.23.1 は 013 の画面に同時に写らないので `demo_ok`）／棚卸報告の `bb` 重複はブロックに入れた。撮影は **`NEXT_PUBLIC_DEMO=1 npm run dev`（ポート 3000 が空いていること）**。`npm run build && npm run start` の本番ビルドでは 商品注文が読み込み中のまま止まる。
- 進み具合（2026-10-05）：版 1.3 で完了（受付簿 No.156：納品書はお届け詳細だけ・変更履歴はタブ・報告済み・請求書一覧と金額の表）。撮影は `NEXT_PUBLIC_DEMO=1 npm run dev` を **ポート 3000 が空いている状態で**起動し、`--capture --force` で撮る（古い本番ビルドが 3000 を使っていると 商品注文が読み込み中のまま止まる）。
