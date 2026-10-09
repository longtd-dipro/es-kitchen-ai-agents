# 確認メモ：運営D 配送（運営Web）— Ghi chú rà soát trước khi viết 画面設計書（Giai đoạn A）

Ngày: 2026-10-07 ／ Người rà: Claude (cloud) ／ Branch: `claude/beautiful-faraday-vywnvg` ／ Theo `docs/05_画面設計書/並列実行計画_画面設計書.md` §2・§4（運営D = E160〜E179 / Q130〜Q139 / S・I・W130〜）.

Phạm vi 5 機能: **D-1 スケジュール（＋配送サイクル設定）** `AW_SCHD`・`AW_CYCL` ／ **D-2 出荷・配送管理** `AW_DLVR`・`AW_SHIP` ／ **D-3 要確認** `AW_RVEW`・**資材の集計** `AW_MSUM`・**委託配送先・中継先の検索** `AW_INQR`.

## Lưu ý chung cho phiên 回答 / phiên gộp
- Chưa sửa 台帳・受付簿・code. Mọi [Q] chờ hong trả lời trong phiên 回答 (phiên duy nhất ghi 台帳).
- **ID message ở các mục [msg] là ID tạm**: ba phần được viết độc lập nên cùng đề xuất dải E160〜, S130〜, I130〜 → **trùng nhau**. Phiên gộp cấp ID thật (xem quy tắc 並列実行計画 §2-1/2-2); trong lúc đó đọc như `NEW-D-xx`.
- Q chung nên gộp khi hỏi hong: quyền thao tác (D-1 Q4 / D-2 Q1), Q02 khi đóng modal đang nhập (D-2 Q8, đã chốt toàn hệ thống 2026-10-05 → chỉ là 宿題 code), tên Screen Code `AW_INQR` gần `AW_INQU` (D-3 Q-IQ1).
- Quy mô Stage B: D-2 ≈ 48 trạng thái / ≈300 item → nên chia 2 phiên.

---

## D-1. スケジュール（＋配送サイクル設定）— 運営D 配送 / 運営管理者Web (AW)

Ngày: 2026-10-07 ／ Nguồn: code `app/ops/delivery/schedule/page.tsx`, `schedule/cycle/page.tsx`, `_components/{ChangeRequests,MoveShipments,kit,api,csv}`, `delivery.css`, `lib/ops/areas/delivery.ts`, `lib/ops/delivery/{fromDomain,logic,constants,types}.ts`, `lib/domain/{move,calendar}.ts`, `lib/domain/seed/master.ts`; 台帳 B（#79, #83, #113）・E（#167）・L（配送の日付の移動）; 受付簿 #1, #6, #169; 配送_02 §4-1〜4-9, §6; 配送_04 §8-3, §8-6; 配送_08 §15-1〜15-5, §15-8; 配送_10 §18; 運営Web_権限表; 画面コード規約; `_共通パターン.py`・`_共通_メッセージ.py`（đọc-only）.

Quy ước: **[Q]** hỏi hong ／ **[宿題]** đã chốt (台帳/spec) nhưng code khác ／ **[open]** chờ khách ／ **[msg]** message. Mặc định: nếu hong không trả lời một [Q] thì dùng "đề xuất".

---

## 1. Phạm vi và trạng thái (VIEWS) đề xuất

Screen Code: `AW_SCHD_001〜005` (スケジュール), `AW_CYCL_001` (配送サイクル設定: trang con riêng `/ops/delivery/schedule/cycle`, không có mục menu riêng — `lib/ops/menu.ts:48`). Nếu muốn **1 sheet / 1 file data**: để 2 `SCREENS` trong cùng file `AW_SCHD_スケジュール.py`, cycle giữ code `AW_CYCL_001`. Book: 運営管理者Web_配送. Quyền xem/thao tác: feature `delivery` (権限表「出荷・配送管理」).
Dữ liệu seed hiện có chỉ cho: tháng 2026-10 (確定) / 2026-11 (予定); tuần 2026-10-05 / 2026-11-16; ngày 2026-10-05 / 2026-11-17 (`page.tsx:29-33`). Tham số `d` khác sẽ bị trả về mặc định (`page.tsx:48`).

| Screen | Code | Trạng thái (id) | URL / cách tạo |
|---|---|---|---|
| スケジュール（月） | AW_SCHD_001 | 001 月・確定月 初期表示（要確認パネル閉） | `/ops/delivery/schedule` (= `?view=month&d=2026-10`) |
| | | 002 月・要確認パネルを開いた | nhấn 「要確認（n件）」（chỉ ở tháng 確定; ở chỗ khác là link sang `/ops/delivery/review`） |
| | | 003 月・予定月（点線枠・凡例あり） | `?view=month&d=2026-11` (凡例 chỉ hiện ở tháng 予定 — `fromDomain.ts:199`) |
| | | 004 月・これより先／前の月が無い（トースト） | ở 2026-11 nhấn ▶ ; ở 2026-10 nhấn ◀ |
| スケジュール（週） | AW_SCHD_002 | 005 週・確定週 出荷基準 | `?view=week&d=2026-10-05` |
| | | 006 週・確定週 納品・配送基準 | chọn 「納品・配送」 (SegmentedControl 基準) |
| | | 007 週・確定週 チェック選択（選択バー「n件 選択中」＋出荷データの移動） | tick 1 thẻ hoặc 「全て選択（n件）」 |
| | | 008 週・予定週（編集モード：選択バー常時・キャンセル／移動は未選択で無効） | `?view=week&d=2026-11-16` |
| | | 009 週・予定週 チェック選択 | tick checkbox |
| スケジュール（日） | AW_SCHD_003 | 010 日・確定日（配送データの表） | `?view=day&d=2026-10-05` |
| | | 011 日・確定日 0件 | gõ keyword không có + 検索 → 「条件に合うデータはありません」 |
| | | 012 日・確定日 選択中（出荷の前の配送だけ選べる） | tick hàng 予定／出荷待 |
| | | 013 日・予定日（予定の表） | `?view=day&d=2026-11-17` |
| | | 014 日・予定日 選択中 | tick |
| 出荷データの移動（小窓） | AW_SCHD_004 | 015 初期表示（本発注の前・移動先未選択） | chọn 便 ở 予定週/日 → 「出荷データの移動」 |
| | | 016 移動先を選んだ（お届け日 → 新／出荷日 → 新・再送の表示） | nhấn 1 ô ngày trong lịch |
| | | 017 本発注の後の便（理由必須の案内） | chọn 便 thuộc nửa đã qua 本発注 (kiểm tra seed khi chụp) |
| | | 018 エラー「移動できません」 | chọn nhiều 便 sau 本発注 / ngày kho không xuất được |
| | | 019 トラブルの対応（別のサイクルへ）ON | tick checkbox → hiện select 対応するトラブル |
| | | 020 確認「本当に移動しますか？お客様に確認済みですか？」 | 確認して移動 khi ngày đích là ngày nghỉ của 拠点 |
| | | 021 確認「別のサイクル・別の半分へ移動しますか？」 | trouble ON + chọn ngày chu kỳ khác |
| 変更申請（未処理） | AW_SCHD_005 | 022 一覧（小窓） | nhấn 「変更申請（n件）」 |
| | | 023 一覧 0件 | lọc không có → 「条件に合う申請はありません」 |
| | | 024 変更申請一括承認（確認） | tick 申請 判定「問題なし」→ 「一括承認（n件）」 (xem Q5) |
| | | 025 一括承認が完了しました | 「一括承認」 |
| 配送サイクル設定 | AW_CYCL_001 | 026 初期表示（帯・A1・月タブ・タブ 祝日・臨休） | `/ops/delivery/schedule/cycle` (tab mặc định 2026-12) |
| | | 027 参照のみの月（A1 無効＋理由） | chọn tab tháng bị khóa (灰 trên 帯) |
| | | 028 設定のない月（穴の警告） | cần seed có tháng trống; nếu không có thì dựng bằng `setup` |
| | | 029 タブ サイクル休止 | click tab |
| | | 030 タブ 出荷不可（関東／関西 倉庫タブ・枠・納品不可枠・日別） | click tab; đổi tab kho |
| | | 031 休日の追加 入力エラー | 追加 khi trống / ngày trùng / bỏ cả hai checkbox |
| | | 032 保存の入力エラー（A1 が月曜でない 等） | nhập A1 không phải thứ Hai → 設定を保存 |
| | | 033 設定を保存しますか？（変更なし／影響なし） | 設定を保存 khi không đổi gì |
| | | 034 設定を保存しますか？（影響あり・確認チェック必須） | thêm 1 ngày nghỉ rơi vào 配送 予定／出荷待 |
| | | 035 保存後（トースト・警告つき） | 確認して保存 |

Tổng 35 trạng thái. Số item dự kiến: 月 ≈ 45 (nút đầu trang 4, 切替・移動 5, 段階 5, 検索 13, ô lịch 7, 凡例 7, パネル ≈ 15) ／ 週 ≈ 35 ／ 日 ≈ 45 (cột 15 + 予定 12) ／ 移動 ≈ 25 ／ 変更申請 ≈ 30 ／ サイクル ≈ 70. **Cỡ: L** (6 màn/modal, khoảng 250〜300 item). Pattern dùng: P-LIST (tìm kiếm 検索/クリア, 0件=I01, quyền nút), P-TAB (tab cycle không giữ trong URL — xem H9), P-CSV-OUT, P-STATUS-COLORS, P-FORM (inline), P-MODAL-SAVE (không áp dụng).

---

## 2. Điểm cần hong quyết định [Q] (9 câu)

### Q1. Mô hình サイクル: 「月ごとの A1」(code) hay 「初回 A1 ＋ サイクル休止」(spec)? — ảnh hưởng lớn nhất
- **Spec** 配送_02 §4-1: 「`A1` の曜日：必ず月曜」「サイクルの本数 **1本**」 §4-2: 「延長：**終了月を進めるだけ**…配送サイクル設定は常にひとつ」 §4-9: 「設定対象期間…と配送サイクル初日（最初の `A1`）」. Ngày lệch chỉ do サイクル休止.
- **台帳 E #167**: 「A1 は配送データを作る前の月だけ直せる」(không nói gì về 休止).
- **Code**: `cycle/page.tsx:90` ô 「{月} サイクルの A1」 theo từng tháng; `:94` 「A1 を後ろへ動かすと、重なる後ろの月も同じ日数だけ動きます（間はサイクルなし）」; `logic.ts:44` `cycleOf` (a1s, "サイクルなし（A1 の間）"); `lib/domain/move.ts:282` dịch dây chuyền. 休止 chỉ ở UI (lưu → lỗi, H1).
- A. **Code (A1 theo tháng, có khoảng "サイクルなし")**: khớp 台帳 #167 + domain hiện tại; nhược: spec §4-1/4-5/4-9 phải sửa, tab 休止 thừa.
- B. **Spec (1 A1 đầu + 休止)**: 1 chu kỳ liên tục, khớp ý "ngày nghỉ dài = 休止"; nhược: không sửa riêng A1 từng tháng (trái #167), phải làm lại domain.
- C. **Lai**: A1 từng tháng (chỉ tháng chưa có データ配送) **và** 休止 cho kỳ nghỉ dài ≥3 ngày (spec §4-5 ルール5); khi thêm 休止 các tháng sau tự dịch. Ưu: giữ cả #167 và spec; nhược: phải làm 休止 trong domain (hiện chưa có), cập nhật 配送_02.
- **Đề xuất: C.** 設計書 viết C; 休止 lưu được = 宿題 (H1). Cần hong xác nhận để sửa 配送_02 §4-1/§4-9 (spec chưa cập nhật theo #167).
- **回答 (hong 2026-10-07, chat):** **C（lai）**。A1 theo từng tháng (chỉ tháng chưa có データ配送) **và** 休止 cho kỳ nghỉ dài; 休止 phải làm trong domain; sửa 配送_02 §4-1/§4-9.

### Q2. Số ngày 「調整」 của 休止: hệ thống tự thêm hay 運営 tự đặt?
- **Spec** 配送_02 §4-5 ルール4: 「**システムは算出して表示するだけで、自動では挿入しない。置き場所は管理者が決める**… **7の倍数に満たない状態では保存できない**」 (決定 v2.2 #2; 「旧：休止の直後に自動で挿入」は **取消**).
- **Code** `logic.ts:31` `pauseSpan` tự cộng `adj` vào cuối; `cycle/page.tsx:204` 「足りない日数は『調整』として休止の直後に自動で足し」 (đúng cái spec đã hủy).
- A. **Spec**: hiện 「あと n日」, chặn lưu, 運営 thêm dòng 休止 loại 「調整」 ở chỗ tùy ý. Ưu: thợ vận hành chọn được ngày muốn xuất; nhược: nhiều thao tác.
- B. **Code**: tự thêm ngay sau 休止. Ưu: đơn giản; nhược: trái 決定 v2.2, không đặt chỗ khác được.
- C. Hệ thống **gợi ý** sẵn dòng 調整 ngay sau (A1 click để chấp nhận), vẫn sửa được. Ưu: gần A, ít thao tác.
- **Đề xuất: A** (là quyết định đã có; C là cải tiến nếu hong muốn). Message cần: E164.
- **回答 (hong 2026-10-07, chat):** **A**。Theo spec: hệ thống chỉ hiện 「あと n日」, chặn lưu, 運営 tự thêm dòng 調整. Message E164 dùng.

### Q3. Lưu cài đặt サイクル: tác động lên 配送 đã có và cách xác nhận
- **Spec** 配送_04 §8-6: 「`draft`（オーバーライドなし）：**再生成する**」「`published`：**再計算しない。運営スケジュール画面の「要確認」に表示し、一括変更で対応**」「保存前に影響件数をプレビュー」; 配送_02 §4-9: 「失効・提案中が1件以上あるとき保存ボタンを『確認して保存』に変え…チェック必須」「成功モーダル（休止期間件数・対象月数・生成サイクル本数・初回 A1）」.
- **Code** `fromDomain.ts:772-776`: 「保存しても配送の日付は自動では動かない（スケジュールの『日付を変える』で動かす）」; `cycle/page.tsx:344-348` checkbox bắt buộc khi có 配送 (予定・出荷待) bị ảnh hưởng, bảng 影響 6 dòng (`:332-340`); lưu xong chỉ toast (`:64`).
- A. **Spec**: 予定(draft) tự tạo lại/前倒し; 出荷待〜 không đụng, đưa vào 要確認; bảng xác nhận chia 「自動で作り直す／要確認／出荷指示済み」; thành công = toast (theo P-FORM, S-id mới, không dùng modal thành công).
- B. **Code**: không tự động gì cả, 運営 tự 「移動」; giữ bảng hiện tại.
- C. A cho 予定, nhưng 出荷待〜 chỉ cảnh báo (không đưa vào 要確認).
- **Đề xuất: A.** Nếu chọn B: sửa spec §8-6 (draft cũng không tự động) và nêu rõ trong 設計書.
- **回答 (hong 2026-10-07, chat):** **A**。Theo spec 配送_04 §8-6: 予定 tự tạo lại; 出荷待〜 không đụng, đưa vào 要確認; bảng xác nhận chia 3 nhóm; thành công = toast.

### Q4. Ai được lưu 配送サイクル設定 (và 出荷不可日)?
- **Spec** 配送_02 §4-9: 「ロール（システム管理者）」 §4-6: 「日別の出荷不可日…**登録するのは運営（物流）**」 (hai chỗ lệch nhau). 配送_04 §8-3: 「操作できるのは運営管理者のみ」.
- **権限表（正）**: không có hàng riêng; thuộc 「出荷・配送管理」 = フル CRUD／経理 R／営業・CS・商品管理・商品開発 CRUD／物流 R/U. **Code**: `saveCycleSettings` = feature `delivery` + `update` (mặc định `opOfName`, `lib/ops/apiPerm.ts`) → 営業・CS… cũng sửa được chu kỳ toàn công ty.
- A. Theo code/権限表 hiện tại (ai có U ở 出荷・配送管理). Không đổi 権限表; rủi ro 営業/CS đổi lịch toàn hệ thống.
- B. Chỉ フル権限 (+システム管理): đúng "システム管理者" của spec; 物流 không nhập được 出荷不可日 (棚卸し) → bất tiện.
- C. Thêm hàng 権限表 「配送サイクル設定」: フル CRUD, **物流 R/U**, các vai trò khác R.
- **Đề xuất: C** (cần sửa 権限表 + 台帳). Nếu giữ A thì sửa spec §4-9 bỏ "システム管理者".
- **回答 (hong 2026-10-07, chat):** **C**。Thêm hàng 権限表「配送サイクル設定」: フル権限 CRUD, 物流 R/U, vai trò khác R (đã sửa 権限表).

### Q5. 「変更申請一括承認」 (code) — spec/台帳 không có
- **Spec** 配送_04 §8-1／配送_08 §15-1: xử lý **từng yêu cầu** ở 配送データ詳細 (`crProcess`: 承認／別日提案／否認). Từ 「一括承認」 chỉ có trong demo cũ (配送デモ_データ見直し_20260929) — không phải nguồn chính.
- **Code** `ChangeRequests.tsx` 3 bước (一覧 → 一括承認 → 完了); `areas/delivery.ts:257 approveChangeRequests`: chỉ yêu cầu 判定「問題なし」, duyệt theo 第一希望日; quyền `update`.
- A. Giữ (đưa vào 台帳): nhanh khi nhiều đơn "問題なし"; hạn chế bằng 判定. B. Bỏ, chỉ xử lý từng đơn. C. Giữ nhưng chỉ cho フル権限／営業.
- **Đề xuất: A** (an toàn nhờ 判定; đã có code). Cần ghi 台帳 + message (Q132, E168).
- **回答 (hong 2026-10-07, chat):** **A**。Giữ 「変更申請一括承認」 (chỉ đơn 判定「問題なし」), ghi 台帳.

### Q6. Điều kiện tìm kiếm của 月・週・日: áp dụng thế nào?
- **Spec** 配送_08 §15-5: 「検索条件はスケジュール（月・週・日）と**共通**」、14 mục (1〜2 keyword, コース／自販機／配送パターン／**便種別**／配送回数／状態／倉庫／委託配送会社／中継先／送り状／**割当状況**／スタッフ); §15-2 「住所検索（都道府県・市区町村・郵便番号）」.
- **Code** `page.tsx:141-156` 13 ô nhưng **月 không dùng điều kiện nào** (`:160-185`), 週 chỉ lọc tên 拠点 (`:287`), 日(確定) chỉ keyword/状態/配送方法 (`:412`). Không có 割当状況／配送No; ô gọi 「配送方法」 trong khi bảng là 「便種別」; 配送パターン dùng 「個別指定」 (spec §15-5 viết 「スペシャル」, §15-1 viết 「個別指定」).
- A. **Cả 13+割当状況 áp dụng cho cả 3 view** (tháng: đếm lại số 出荷/配送 và badge theo điều kiện; 状態・割当状況 chỉ trên 配送データ nên 予定 bị ẩn + ghi chú như spec). B. Tháng không có tìm kiếm (chỉ tuần/ngày). C. Như A nhưng tháng chỉ lọc theo kho/コース.
- **Đề xuất: A**, tên ô thống nhất 「便種別」, giá trị 配送パターン 「サイクル／個別指定／都度配送」, thêm 「割当状況」 và 「配送No・予定ID」 vào keyword. → H11.
- **回答 (hong 2026-10-07, chat):** **A**。Điều kiện tìm kiếm áp dụng cho cả 月・週・日; tên ô 「便種別」; thêm 「割当状況」 và 配送No・予定ID vào keyword.

### Q7. 日表示: thứ tự và 並べ替え
- **Spec** 配送_08 §15-2: 「並び順は `サイクル` → `要対応` → `法人名・拠点名`、要対応の中は `変更申請` → `ドライバー未設定`」. 台帳 STEP7 L2/ P-LIST: mọi 一覧 có 「並べ替え」; không ghi = 更新日時 giảm dần.
- **Code** `fromDomain.ts:273` sort theo 配送No tăng dần; không có UI 並べ替え.
- A. Spec cố định, không UI. B. Code (配送No ↑) + 並べ替え. C. **Mặc định theo spec** + 並べ替え (配送No／拠点名／納品日／状態).
- **Đề xuất: C.**
- **回答 (hong 2026-10-07, chat):** **C**。Mặc định theo spec (サイクル → 要対応 → 法人名・拠点名) + UI 並べ替え (配送No／拠点名／納品日／状態).

### Q8. 日表示 có cần 基準「納品・配送」 không?
- **Spec** 配送_08 §15-2: 「画面04（ピッキング日）と画面05（納品日）は同一データの別ビュー」; 週表示 code có 切替 (確定週 only). 
- **Code** `page.tsx:389` ngày: nút 基準 hiển thị nhưng **vô tác dụng** (`onChange={() => {}}`; chỉ 出荷日 `fromDomain.ts:273`); 週・予定: cũng vô tác dụng (`:241`).
- A. Làm 日 theo 納品日 cho 確定 (để xem 要対応 ドライバー未設定 theo ngày giao); 予定 chỉ 出荷 → **ẩn** nút. B. Ẩn nút ở 日 (và 予定週), giữ ở 確定週. C. Giữ nút nhưng disabled + tooltip.
- **Đề xuất: A.** (B nếu muốn bớt việc).
- **回答 (hong 2026-10-07, chat):** **A**。日表示 theo 納品日 cho 確定; 予定 chỉ 出荷 → ẩn nút 基準.

### Q9. Cột CSV出力 của 月／週
- **台帳/CSV入出力_定義_20261003**: 「配送：…スケジュール（月/週/日）… ✅」 (không có cột). P-CSV-OUT: 「検索条件のとおりの全件」「ファイル名＝画面名＋条件＋日時」.
- **Code** `page.tsx:85-124`: 月 = 1 dòng/ngày (日付, サイクル, 枠, 出荷, 配送, お知らせ); 週 = 1 dòng/拠点; 日 = đủ cột 配送データ. Không dùng điều kiện tìm kiếm.
- A. Giữ như code (3 dạng khác nhau). B. **月・週 cũng xuất "1 dòng = 1 配送データ/予定" trong kỳ, cùng cột với 日.** C. Bỏ CSV ở 月.
- **Đề xuất: B** (CSV tổng hợp theo ô lịch ít dùng được). Cần: cột = 日表示 (13 cột) + サイクル／枠.
- **回答 (hong 2026-10-07, chat):** **B**。CSV 月・週 xuất 1 dòng = 1 配送データ／予定 trong kỳ, cùng cột với 日 + サイクル／枠, theo điều kiện tìm kiếm.

### Q10. 変更履歴 của 配送サイクル設定: hiển thị ở đâu?
- **Spec** 配送_02 §4-2: 「内容は**変更履歴**（いつ・誰が・どこを・何を・影響件数）に残り、過去の予定の根拠はこの履歴で追う」 và hiển thị 「最終保存日時」(§4-9). Code: không có (cả `cycle/page.tsx`).
- A. Thêm tab/khối 「変更履歴」 (P-HIST, cột: 日時・操作した人・項目・変更前・変更後・影響件数) ở cuối trang `AW_CYCL_001`. B. Chỉ lưu DB, không UI. C. Tách màn `AW_CYCL_002`.
- **Đề xuất: A** (+ hiện 最終保存日時 ở đầu trang). Thêm 3 trạng thái VIEWS (036 履歴・037 履歴0件…) sau khi chọn.
- **回答 (hong 2026-10-07, chat):** **A**。Thêm khối 「変更履歴」 (P-HIST) ở cuối AW_CYCL_001 + 最終保存日時 ở đầu trang; thêm trạng thái VIEWS tương ứng.

---

## 3. Code khác quyết định đã chốt → 設計書 viết theo quyết định [宿題]

| # | Nội dung | Quyết định / spec | Code hiện tại (file:line) |
|---|---|---|---|
| H1 | 保存 chỉ lưu được A1・祝日・出荷不可日 | 休止・出荷不可枠 (倉庫別) sửa được (配送_02 §4-5, §4-6) | `areas/delivery.ts:289` 休止 có → lỗi 400; `:291` đổi 枠 → lỗi; `fromDomain.ts:744-745` `pauses: []` cố định, ngSlots = NO_PICKING_SLOTS |
| H2 | 倉庫タブ 3 kho + 「この設定を3倉庫へ反映」 (§4-6) | Kho lấy từ 倉庫マスタ (seed có 関東・関西・中部) | `cycle/page.tsx:264`, `fromDomain.ts:708` chỉ WH1/WH2; `constants.ts:11` ô 「ピッキング倉庫」 cũng chỉ 2 kho |
| H3 | 日別の出荷不可日: **開始日〜終了日** 1 bản ghi (§4-6) | | `cycle/page.tsx:243-306` 1 ngày/ dòng |
| H4 | 設定対象期間: **6ヶ月**, vượt thì làm tròn + thông báo; mở rộng = đổi tháng cuối; 開始月 mặc định = tháng chưa cài đầu tiên (§4-2) | | `cycle/page.tsx:83-85` 2 ô gõ tự do, `logic.ts:166` chỉ check format; `areas/delivery.ts:275-294` không dùng `periodFrom/To` khi lưu |
| H5 | 祝日: 「公開の祝日 API から年1回自動＋『祝日を再取得』」; hiện số 祝日・最終取得日時; 運営 thêm/**sửa**/xóa (台帳 #113, §4-4) | | `cycle/page.tsx:156` nút chỉ `toast`; không có 件数/日時; dòng 祝日 không sửa tên/ngày |
| H6 | 保存・キャンセル khi đang sửa → **Q02**; lưu đồng thời → E31/I02 (台帳 F #89, P-FORM) | | `cycle/page.tsx:71` キャンセル thoát luôn; không E31/I02; lưu lỗi đồng thời toast (`:56` toast lỗi đầu + inline) |
| H7 | 週表示: サイクル期間・週コード・**出荷不可日のピル**・休止期間 (§15-2, §15-4: 「連続する日と倉庫をまとめて1行」, tooltip 「ピッキング日・納品日の両方を振り替えます」) | | `page.tsx:234-269`, `fromDomain.ts:216-266`: chỉ cột 「休：出荷」 |
| H8 | しきい値 **倉庫ごと（既定300）・資材便は件数に含めない** (配送_01 §135, 配送_00 §129) | | `fromDomain.ts:170,179,193,289,305` và `move.ts:27` hằng số 300, đếm cả 資材; `move.ts:29` ドライバー 15 → [open] |
| H9 | Tab 休止設定 / 月タブ không nằm trong URL (P-TAB) | `?tab=` | `cycle/page.tsx:35` state nội bộ |
| H10 | Điều hướng ngày: 前/次/今日 hoạt động theo lịch thật; tháng ngoài phạm vi = 「生成対象外」(斜線)/穴; **今日** = hôm nay | §4-9, §4-2 | `page.tsx:57-58` 「今日」 nhảy về ngày cố định; `:163-164, :238-239, :379` chỉ toast; `DEMO ? … : …` (`:39`). 設計書 viết theo bản không-DEMO. Message: I130/I131 |
| H11 | Điều kiện tìm kiếm áp dụng chung (→ Q6) | §15-5 | `page.tsx:141-185, 287, 412, 465` |
| H12 | Badge 「変更申請（n件）」 chỉ đếm **đơn đã đến hạn xử lý, chưa xử lý** (決定 v2.2 #6) | 配送_08 §15-1 | `areas/delivery.ts:73` `cr: openCrs(repo).length` (đếm tất cả 申請中・提案中) |
| H13 | Chọn được để 移動: chỉ 配送 trước ngày xuất; | 台帳 L「出荷日の前日まで」 | Ngày: `page.tsx:418` không kiểm `shipOn > hôm nay`; tuần có (`fromDomain.ts:235`) → thống nhất |
| H14 | Link mẫu/hard-code còn sót | — | `page.tsx:303`, `ChangeRequests.tsx:21` (`DL-261020-0021`), `logic.ts` `reviewLinks` (2026-10 / 2026-11-17) |
| H15 | CSV出力 theo điều kiện tìm kiếm + tên file (P-CSV-OUT) | | `page.tsx:88-123` xuất toàn bộ kỳ, bỏ qua điều kiện → Q9 |
| H16 | Menu: 「配送管理 ＞ 配送サイクル設定」 (§4-9) | | Là trang con của スケジュール, nút 「配送サイクル設定」 `page.tsx:67` (giữ cách này, sửa spec) |
| H17 | Lỗi nhập hiện inline, không lặp thêm toast (P-FORM) | | `cycle/page.tsx:56` thêm toast cho lỗi đầu tiên |

---

## 4. Giá trị chưa chốt với khách [open]

| # | Mục | Ghi chú |
|---|---|---|
| O1 | ドライバー 1日の配送件数の目安 (cảnh báo khi 移動) | Code `move.ts:29` = 15. **hong 2026-10-07: 15 件** (台帳 F). Đã bỏ khỏi OPEN |
| O2 | Nguồn API 祝日 (tên/URL, thời điểm lấy hằng năm) | 台帳 #113 chỉ nói 「公開の祝日 API」; chưa chọn API cụ thể (開発) |
| O3 | Thomas có nhận **gửi lại cùng 指示番号 (rev+1)** và số lượng 0 không → **hong 2026-10-07: có (nhận)**; vendor chưa xác nhận bằng văn bản, 配送_10 §18-1 No.2 vẫn theo dõi | 配送_10 §18-1 No.2 — chờ vendor; ảnh hưởng thông báo sau 移動 (受付簿 #169: 変更した行だけ CSV) |
| O4 | 出荷しきい値 倉庫ごと — giá trị 中部倉庫・ES事務所 | **hong 2026-10-07: tạm 300 cho mọi kho, 運営 sửa được** (台帳 F). Nơi lưu giá trị (倉庫マスタ hay 設定) → quyết khi viết data. Đã bỏ khỏi OPEN |

---

## 5. Message cần thêm [msg] (dải 運営D: E160〜E179, Q130〜Q139, S130〜, I130〜, W130〜)

**Dùng lại (không tạo mới):** E01 (休日名・日付・期間名・開始日・終了日・理由 khi bắt buộc), E02 (対応するトラブル／移動先のお届け日), E08 (終了日は開始日以降 — 休止; code đang viết 「より後」, đổi theo E08), E09 (この日付は既に登録), E30/E31/E32, Q02, S01?, S12 (CSV出力), I01 (0件: 「条件に合うデータ／申請はありません」→ I01), I03 (「参照のみ：{理由}」→ `{理由}（見るだけ）`), I103 (影響を数えています…→ 読み込み中), S11 (「n件を承認しました」: 操作名=承認).

| ID tạm | Loại | ja_o (社内向け) | vi | Nguồn code |
|---|---|---|---|---|
| E160 | エラー | `{項目名}は yyyy-mm-dd の形式で入力してください。` (có thể là chung → báo phiên gộp) | `{tên mục} phải nhập đúng dạng yyyy-mm-dd.` | `logic.ts:138-170` |
| E161 | エラー | `出荷不可・配送祝日のどちらかを選択してください。` | `Hãy chọn ít nhất một trong 出荷不可 / 配送祝日.` | `logic.ts:143` |
| E162 | エラー | `{項目名}は月曜日を選択してください。` (A1) | `{tên mục} chỉ chọn được thứ Hai.` | `logic.ts:169`, `cycle/page.tsx:53` |
| E163 | エラー | `終了月は開始月以降を選択してください。` | `Tháng kết thúc phải từ tháng bắt đầu trở đi.` | `logic.ts:174` |
| E164 | エラー | `休止は7日の倍数にしてください（あと{n}日）。調整の休止を追加してください。` (nếu Q2=A) | `Kỳ nghỉ phải là bội số của 7 ngày (còn thiếu {n} ngày). Hãy thêm kỳ nghỉ 調整.` | spec §4-5 |
| E165 | エラー | `{月} サイクルは{理由}のため A1 を変えられません。` / `前のサイクル（{月}：〜{日付}）と重なります。` / `B7（{日付}）が {月} に入りません。` (3 biến thể → có thể tách E165〜E167) | tương ứng | `move.ts:274-279` |
| E166 | エラー | `{配送No}は資材便のため動かせません。資材の注文の画面で日付を変えてください。` | | `move.ts:93` |
| E167 | エラー | `{配送No}は{状態}のため動かせません（出荷の前の配送だけ）。` / `…出荷日（{日付}）の前日を過ぎたため動かせません。取消して複製してください。` | | `move.ts:94-95` |
| E168 | エラー | `本発注（{サイクル} {半分}：{期間}）を過ぎた便があるため、1便ずつしか動かせません。` ・ `別のサイクル、または本発注を過ぎた別の半分へは、トラブルの対応のときだけ動かせます。` ・ `移動先（{サイクル} {半分}）は本発注（{期間}）を過ぎています。` | | `move.ts:106-108, 136, 140` |
| E169 | エラー | `新しい出荷日 {日付} は {倉庫名} が出荷できない日です。` / `…が今日より前です。明日以降にしてください。` / `{配送No}のお届け日は既に{日付}です。` | | `move.ts:127-130` |
| E170 | エラー | `承認できる申請を選択してください（判定が「問題なし」のものだけ）。` (nếu Q5=A) | | `areas/delivery.ts:257` |
| W130 | 警告 | `出荷日 {日付} の出荷が {n}件になり、しきい値（{n}件）を超えます。` | | `move.ts:146` |
| W131 | 警告 | `ドライバー {名前} の {日付} の配送が {n}件になります（目安 {n}件）。` | | `move.ts:152` |
| W132 | 警告 | `{拠点名}：{日付} に同じ温度帯（{温度帯}）の便がもうあります。` ・ `{配送No} には処理していない変更申請 {申請番号} があります（移動しても申請は残ります）。` | | `move.ts:155-157` |
| W133 | 警告 | `{サイクル} サイクル：オーダー締切（{日付}）が前半の本発注の時期（{期間}）に入っています。月間メニューの締切日を見直してください。` ・ `…最初のお届け（{日付}）より後です。` (kèm S130 sau lưu) | | `move.ts:305-306` |
| Q130 | 確認 | `本当に移動しますか？お客様に確認済みですか？／{日付}は拠点のお届けしない日（{理由}）です。` | | `MoveShipments.tsx:119` (台帳 L) |
| Q131 | 確認 | `別のサイクル・別の半分へ移動しますか？／{内容}。トラブルの対応のときだけ動かせます（トラブル：{ID}・理由：{理由}）。` | | `MoveShipments.tsx:124` |
| Q132 | 確認 | `変更申請を一括承認しますか？／次の{n}件を承認し、納品日を第一希望日に変更します。ピッキング日はリードタイムを保って一緒に動きます。法人の申請履歴と配送カレンダーに反映されます。` | | `ChangeRequests.tsx:64` |
| Q133 | 確認 | `設定を保存しますか？／{変更内容}します。影響する配送：{n}件（…）。` (tiêu đề + bảng 影響 6 dòng + checkbox 「…動かすことを確認した」) | | `cycle/page.tsx:314-353` |
| S130 | 成功 | `{n}件を {日付} へ移動しました（{移動ID}・出荷指示を再送 {m}件・委託配送先 {k}社へ通知・法人へ通知）。` | | `MoveShipments.tsx:45` |
| S131 | 成功 | `配送サイクル設定を保存しました。` (nếu có cảnh báo: nối `W133`; hoặc dùng S01 + {対象}) | | `cycle/page.tsx:64` |
| S132 | 成功 | `休日「{名}」を追加しました（保存すると反映します）。` / `サイクル休止「{名}」を追加／更新しました…` / `出荷不可日（{日付}）を追加しました…` (3 toast cục bộ trước khi lưu) | | `cycle/page.tsx:149,199,253` |
| I130 | 情報 | `これより前の予定はありません。` (月・週・日) | `Không có lịch trước đó.` | `page.tsx:163,238,379` (bản không-DEMO) |
| I131 | 情報 | `これより先の予定はまだありません。` | `Chưa có lịch sau đó.` | `page.tsx:164,239` |
| I132 | 情報 | `{月}の配送サイクルは設定されていません。この月は納品予定も配送データも作られません。` (khi tháng ngoài phạm vi/穴) | | spec §4-2 (cùng chuỗi với cảnh báo 穴 ở `cycle/page.tsx:390`) |

Ghi chú: chữ 「このデモでは…」 trong toast **không đưa vào 設計書** (chỉ có khi `DEMO`). Text tĩnh (note, 注釈, legend) là nội dung màn hình, không đưa vào Message List.

---

## 6. Những điểm đã khớp (không hỏi)

- **月表示**: 件数 1 lịch chung, badge có điều kiện (đỏ=300件超・トラブル／vàng=未割当(出荷待から)・変更申請／xám=移動・変更・取消, 2 badge + 「+N」, ngày đã qua chỉ đỏ), bấm ô → 週 (台帳 B #83, 受付簿 #6; `fromDomain.ts:176-199`, `page.tsx:189`).
- **移動**: tick chọn (không kéo thả), trước 本発注 nhiều 便, sau 本発注 1 便 + lý do + cùng nửa A↔B／C↔D, khác chu kỳ/nửa chỉ khi có トラブル (chọn trouble đã ghi), ngày nghỉ 拠点 → hỏi lại, ngày kho nghỉ không chọn được, 出荷指示 rev+1 gửi lại + thông báo 委託 (台帳 L; `MoveShipments.tsx`, `move.ts:93-173`). 「全て選択」 gồm cả mục không hiện (課題 2-4).
- **Tháng khóa** = 当月・過ぎた月／メニュー公開月／オーダー期間が始まった月／配送データを作った月; band 確定済み／設定済み／未設定（穴）／未設定（今後）, câu cảnh báo 穴 và 「残り 2ヶ月を切ったら警告色」 (台帳 B #79; 配送_02 §4-2; `move.ts:253-260`, `cycle/page.tsx:355-395`).
- **A1** chỉ thứ Hai, chỉ tháng chưa có 配送データ, không đổi オーダー締切 và cảnh báo nếu lệch (台帳 E #167; 配送_04 §8-3; `move.ts:267-307`).
- **Ngày nghỉ thủ công**: 休日名＋日付, 出荷不可・配送祝日 bắt buộc chọn ≥1 (配送_02 §4-4; `logic.ts:138`); 出荷不可枠 mặc định A6・A7／B4〜B7／C6・C7／D4〜D7 (`calendar.ts:13`); 納品不可枠 tự tính theo リードタイム 1〜3 ngày (`logic.ts:126 leadRows`).
- **Xác nhận trước khi lưu** có bảng 影響 và chặn bằng checkbox, 保存 không bị chặn hẳn (配送_02 §4-9 「保存自体はブロックしない」; `cycle/page.tsx:344-349`) — phần nội dung xem Q3.
- **要確認**: không thông báo pháp nhân (`page.tsx:226`; 配送_04 §8-6); nút ẩn khi không có quyền (`canAct`, P-LIST); 「CSV出力」 có ở 3 view (CSV入出力_定義).


---

## 運営D 配送 — 機能 2：出荷・配送管理（一覧・詳細・編集・出荷指示）

Ngày: 2026-10-07 ／ Nguồn: code thật (`app/ops/delivery/list/**`, `_components/{DeliveryDetail,DetailModals,ChangeRequests,MoveShipments,kit,csv}`, `lib/ops/areas/delivery.ts`, `lib/ops/delivery/{fromDomain,logic,constants,seed}.ts`, `lib/domain/areas/delivery.ts`), 台帳 (B・E・F・K・L・M-4・N), 受付簿 (#1〜8, 47, 160, 169), 配送_04/05/07/08/12, 権限表, 外部連携_エラーの流れ, input_standard, `_共通パターン.py`, `_共通_メッセージ.py`, MessageList_WEB (không có message nào về 配送/出荷 → toàn bộ [msg] bên dưới là mới).
Quy ước đường dẫn: `areas/delivery.ts` = `lib/ops/areas/delivery.ts`; domain = `lib/domain/areas/delivery.ts` (ghi đủ khi là domain). Quy ước nhãn: **[Q]** cần hong ／ **[宿題]** 台帳・仕様 đã chốt, code khác → 設計書 viết theo quyết định, `demo_ok` ／ **[open]** chờ khách/ベンダー ／ **[msg]** message.
Phối hợp: `ChangeRequests.tsx` (変更申請（未処理）→ 一括承認 → 結果) và `MoveShipments.tsx` chỉ mở từ **スケジュール** (`schedule/page.tsx:77,322,369,458`) → để memo スケジュール (運営D-1) lo. Ở đây chỉ có `CrProcessModal` (変更申請の確認, mở từ 詳細). Link 要確認 → `/ops/delivery/list/ship-orders`, `?tab=trb` đã khớp (`logic.ts reviewLinks`).

---

## 1. VIEWS (đề xuất)

Screen Code: `AW_DLVR_001〜003` (一覧・詳細・編集) và `AW_SHIP_001` (出荷指示・取込). Edit dùng cùng component `DeliveryDetail mode="edit"` → 1 sheet "詳細・編集", ghi khác biệt theo trạng thái. Ví dụ ID dùng seed: **A**=DL-261012-0011 (大阪支店 10/13・出荷待), **B**=DL-260928-0014 (大阪 9/29・納品済), **D**=DL-261109-0001 (変更申請 提案中), **E**=DL-261207-0001 (変更申請 申請中・予定), **F**=川崎工場 (CU01902) 便gần nhất có トラブル未解決 (遅延; ID sinh từ seed `lib/domain/seed/delivery.ts:272`, tra bằng 一覧 filter トラブル「トラブル未解決あり」), **G**=MO-2610-0013 → DL-261006-0103 (資材便). Trạng thái 中止／取消／再配送待／確認中(子) không có sẵn trong seed → tạo bằng thao tác (取消・対応を決める・代理登録) lúc chụp (xem Q5).

| Screen | Code | id | Trạng thái | URL / cách tạo |
|---|---|---|---|---|
| 出荷・配送管理 一覧 | AW_DLVR_001 | 001 | 初期表示（出荷基準・期間初期値・予定件数の帯・並び 出荷日の昇順） | `/ops/delivery/list` |
| | | 002 | 「納品・配送」基準に切替えて検索（トースト） | SegmentedControl → 検索 |
| | | 003 | 詳細条件で絞り込み（トラブル未解決あり・ドライバー未割当のみ・行の色 赤/青/灰） | 条件選択 → 検索 |
| | | 004 | 0件 | 該当なしのキーワード → 検索 |
| | | 005 | 参照のみの役割（編集ボタン非表示：経理 R） | 役割 経理 (R) でログイン |
| | | 006 | 経路の列を表示（切替 ON）※列は未実装（[宿題] H3） | Switch |
| 出荷・配送データ詳細 | AW_DLVR_002 | 007 | 配送概要（出荷待・未ロック）＋運営メモ＋メール見本 | A |
| | | 008 | 配送概要（オーダー締切後ロックの帯） | 締切済サイクル(9・10月)の出荷待 |
| | | 009 | 配送概要（変更申請 申請中の帯＋否認/代替日/承認） | E（予定）。D は「提案中」 |
| | | 010 | 配送概要（予定 draft：数量=予定・トラブルタブなし） | E |
| | | 011 | 配送概要（確認中の子：親トラブル未解決で「確定」不可） | 代理登録(不在)で子を作る → 子の詳細 |
| | | 012 | 配送概要（確認中の子：確定して出荷待へ） | 親解決後の子 |
| | | 013 | 配送概要（資材便：資材の注文 MO） | G |
| | | 014 | 配送概要（処理済みの変更申請の表） | DL-261221-0001（DD-20260930-0001=否認・予定） |
| | | 015 | 配送ルート（地点表・ES採番の送り状 DL-…-01） | A |
| | | 016 | 配送ルート（路線便：送り状番号の追加・訂正・無効） | 1次=路線(ヤマト)の便 |
| | | 017 | 実績（納品済：手順・検品差異・在庫・区間受取・駐車料金・後続の配送） | B |
| | | 018 | 実績（まだ納品実績がない EmptyState） | A |
| | | 019 | トラブル（未解決：一覧＋「対応を決める」＋自動子） | F |
| | | 020 | トラブル（解決済：解決欄＋後続の配送） | B（TR-260915-0001） |
| | | 021 | トラブル（報告なし EmptyState） | 出荷済以降でトラブル0 |
| | | 022 | 添付資料（① 地点の資料／② この配送の資料） | `?tab=doc` |
| | | 023 | 変更履歴（種類で絞り込み） | `?tab=hist` |
| | | 024 | 配送データが見つからない（EmptyState） | `/ops/delivery/list/DL-000000-0000` |
| | | 025 | 取消（モーダル：影響表＋理由） | A →「取消」 |
| | | 026 | 取消 入力エラー（理由の詳細 空） | 詳細を消して「取消する」 |
| | | 027 | 複製（モーダル：返送 初期／分納・再配送・代替便・その他に切替） | B →「複製」 |
| | | 028 | 複製 入力エラー／すでに子あり（情報帯） | 理由 空 or 子あり配送 |
| | | 029 | トラブルの代理登録（連絡内容・自動子の帯・対応表・みなし完了） | B →「トラブルを代理登録」 |
| | | 030 | 代理登録 入力エラー（内容 空） | 内容を消して「登録する」 |
| | | 031 | 対応を決める ① 対応を選ぶ（6 択） | F →「対応を決める」 |
| | | 032 | 対応を決める ② 数量・子・理由（全量／一部） | 次へ |
| | | 033 | 対応を決める ② 送り直す子＋運賃（再配送／中止） | 「納品ゼロで送り直す」 |
| | | 034 | 対応を決める 入力エラー（理由 空） | 理由を消して「解決する」 |
| | | 035 | 変更申請の確認（希望日／別日／否認） | E →「承認する」 |
| | | 036 | 変更申請の確認 入力エラー（理由 空：別日・否認） | 否認 or 別日 |
| 出荷・配送データ編集 | AW_DLVR_003 | 037 | 編集 初期表示（この配送だけ変更：配送会社・スタッフ・住所・理由） | `/ops/delivery/list/DL-261012-0011/edit` |
| | | 038 | 編集（日付の変更表で別日を選択） | 同上（出荷待・出荷日の前） |
| | | 039 | 編集 入力エラー（変更理由 空） | 保存 |
| | | 040 | 離脱確認 Q02（変更後にキャンセル） | 入力→キャンセル |
| | | 041 | 編集できない状態で `/edit` を開く（納品済 など）※Q3 | `/ops/delivery/list/DL-260928-0014/edit` |
| 出荷指示・取込 | AW_SHIP_001 | 042 | 出荷指示の送信タブ（再送待ち・送信済・ES採番送り状・ヤマト暫定の枠） | `/ops/delivery/list/ship-orders` |
| | | 043 | 出荷指示CSV（THOMAS）／送り状用CSV（ヤマト）出力（トースト） | ボタン |
| | | 044 | 再送（トースト「新しい版」）＝行が 送信済 に | 再送待ちの行 |
| | | 045 | 送信失敗の行（結果バッジ赤＋原因）※seed なし → Q5 | — |
| | | 046 | 出荷実績・送り状の取込タブ（取込履歴・一部エラー） | タブ |
| | | 047 | CSVを選んで取込（トースト）／ひな形／エラー行CSV | ボタン |
| | | 048 | 参照のみの役割（再送・取込ボタン非表示） | 権限なし |

Số item dự kiến: 一覧 ≈ 40（条件17＋列10＋ボタン・帯）／詳細 ≈ 130（概要25・ルート20・実績25・トラブル15・資料8・履歴6・帯4）／小窓 ≈ 60／編集 ≈ 25／出荷指示 ≈ 40 → **≈ 300 item, 48 trạng thái = L+ (lớn hơn プランマスタ 269)**. Đề nghị Stage B chia 2 phiên: (1) AW_DLVR_001＋003 ＋小窓, (2) AW_DLVR_002 ＋ AW_SHIP_001; hoặc 1 phiên nhưng thêm ngân sách.

---

## 2. Điểm cần hong quyết định [Q]（9 câu）

### Q1. Quyền 取消・複製・出荷実績/送り状CSV取込・再送: ai làm được?
- 配送_12 §15.2: 「取消・中止・複製 | 運営（物流）○ | 運営（CS）× | 営業 ×」／配送_05 §10-4: 「『出荷指示・取込』画面に次のボタンを置く（運営〈物流〉だけ）」。
- 権限表 2026-10-03「出荷・配送管理」: フル CRUD／経理 R／**営業 CRUD／CS CRUD／商品管理 CRUD／商品開発 CRUD／物流 R/U**。台帳 K: 「R/U＝閲覧・編集・CSV出力・機能ごとの操作（承認・公開・確定など）。作成・削除・CSV取込はしない」。
- Code `lib/ops/apiPerm.ts:94-95`: `cancelDelivery→[delivery,'delete']`, `duplicateDelivery→[delivery,'create']`, `recordImport→[delivery,'csvImport']` → **物流(R/U)は 取消・複製・取込 ができず、営業・CS はできる**（仕様の逆）。
- Lựa chọn: **A.** theo code (取消=delete, 複製=create, 取込=csvImport) — khớp chữ 権限表 nhưng 物流 (người làm thật) không làm được, 営業/CS làm được. **B.** coi 取消・複製・再送・出荷実績/送り状取込 là 「機能ごとの操作」 → R/U làm được (code đổi sang op `update`) — khớp 台帳 K＋15.2 cho 物流, nhưng 営業/CS/商品系 (CRUD) vẫn làm được. **C.** B＋bớt 営業/CS khỏi các thao tác này (cần cột quyền theo thao tác trong 権限表).
- Đề xuất: **B** (取消 là thao tác, không phải 削除 dữ liệu; 取込 ở đây là 連携, không phải CSV取込 master). C chỉ khi hong muốn đúng 15.2.
- **回答 (hong 2026-10-07, chat):** **B**。取消・複製・再送・出荷実績/送り状の取込は「機能ごとの操作」→ 物流 R/U も可（code の op を `update` 系へ）。営業・CS・商品系（CRUD）も可のまま。

### Q2. 「中止」(出荷後に止める) có nút trực tiếp không?
- 配送_04 §7-7 bảng: 「**出荷済** | 出荷後に配送できなくなった（車両故障・大雪・商品事故など。理由必須） | **中止** | 運営」「受取済 | 受け取った後に配送できなくなった（理由必須） | 中止 | 運営」。配送_07 §13-2 ②: 運営が「再配達／代替品／廃棄／中止のいずれかを選んで親を直接閉じる」(trong luồng トラブル).
- Code: không có nút 中止. 取消 modal ghi 「出荷後に止めるときは『対応を決める』の中止を使います」(`DetailModals.tsx:39`) mà 「対応を決める」 chỉ hiện khi có トラブル未解決 (`DeliveryDetail.tsx:111`) → muốn 中止 phải 代理登録 (その他) trước.
- Lựa chọn: **A.** thêm nút/modal 「中止」 cho 出荷済・受取済 (理由必須・運賃 請求する/しない, freight_billable). **B.** giữ như code (代理登録 → 対応を決める → 納品せずに終了する), sửa 配送_04 §7-7 cho khớp. **C.** cả hai.
- Đề xuất: **B** (ít trạng thái hơn, mọi 中止 đều có トラブル記録 → 履歴 giải thích được lý do — 配送_07: 「理由の無い中止が残ると…説明できない」).
- **回答 (hong 2026-10-07, chat):** **B**。中止の直接ボタンは作らない（代理登録 → 対応を決める → 納品せずに終了）。配送_04 §7-7 を code に合わせて直す。

### Q3. Đổi ngày ở 編集 (締切後・1件ずつ) vs 台帳 L; định nghĩa `locked`
- 配送_08 §15-8 (bảng cũ) / 配送_04 §8-3 (cũ・決定v2.3 #63): 「オーダー締切後〜出荷日の前日：配送データ詳細の『編集』から1件ずつ・同じ前半／後半・理由必須」。**台帳 L（2026-10-03）**: 「ドラッグはやめる。チェックで…（スケジュール）。**本発注の時期の前**：何便でも…**本発注の後**：1便だけ・理由必須・同じ半分の中だけ」。配送_04 §8-3「いまの決まり」: 入口＝スケジュール.
- Code: 編集 có bảng 「日付の変更（オーダー締切後）」 (`DeliveryDetail.tsx:225-243`, `canDateChange = 出荷待 && 今日<出荷日` `fromDomain.ts:479`) dùng ranh giới **オーダー締切**; thanh cảnh báo `r.locked = 締切済 && 出荷待` (`fromDomain.ts:444`) — trong khi 配送_05 §10-2: 「`locked` になるトリガーは1つだけ。出荷指示が初めて送信成功した時点」. `saveDelivery` đổi ngày nhưng **không tăng `shipRev`/không resend** (`lib/domain/areas/delivery.ts:502-525`) còn `MoveShipments` thì có (`lib/domain/move.ts`).
- Lựa chọn: **A.** Gộp: 編集 không đổi ngày nữa, chỉ có link 「スケジュールで移動」; thanh cảnh báo bỏ chữ locked/締切 (đổi ngày chỉ qua MoveShipments: 本発注 前/後, 1便, A↔B・C↔D, rev+1). **B.** Giữ ô đổi ngày ở 編集 nhưng gọi cùng logic `domain.move` (cùng luật 本発注, rev+1, thông báo). **C.** Giữ nguyên code (ranh giới オーダー締切).
- Đề xuất: **A** (台帳 L là chính; 1 bộ luật; 受付簿 #169 「出荷指示の後の日付移動は今のやり方でよい」 không thêm cửa mới). Dù chọn gì, nhãn `locked` phải = 出荷指示 初回送信成功 (đã có trong ship-orders note).
- **回答 (hong 2026-10-07, chat):** **B**。編集に日付の変更欄を残し、スケジュールの移動と同じ `domain.move` の規則（本発注の前／後・1便・rev+1・通知）を使う。`locked` ＝ 出荷指示の初回送信成功。

### Q4. 「送信」/「再送」ở 出荷指示 thực chất là gì?
- 配送_12 §16.6/§15.7: バッチ `ship_order_send` tự gửi, 成功→`locked`, 失敗→`failed`, 「ボタン『出荷指示CSVを出力』は確認用・手動連携用で、送信ではない」(§19.6). Ngược lại 受付簿 #169 (客先 B-1, 2026-10-06): 「出荷指示の後の日付移動は今のやり方でよい（変更した行だけ CSV を出して THOMAS に再登録／伝票発行後は伝票を再発行）」 → khách đang **đăng ký tay** vào THOMAS.
- Code (demo): nút 「再送」 chỉ ghi dấu thời gian → hàng thành 送信済 (`areas/delivery.ts:297-306`); không có 送信失敗 (`fromDomain.ts:670` chỉ 送信済/再送待ち); rev luôn `rev1`.
- Lựa chọn: **A.** Theo spec: ES tự gửi (API/SFTP) — 「再送」= tạo bản mới (rev+1) và gửi lại ngay; thất bại là trạng thái hệ thống; CSV chỉ là dự phòng. **B.** Phase 1 thủ công: 「再送」= xuất CSV các hàng đã đổi + vận hành bấm 「送信済にする」 (người bấm quyết định `locked`). **C.** A nhưng giai đoạn đầu dùng B (ghi rõ trong 設計書 là tạm).
- Đề xuất: **A** cho 設計書 (台帳 E #38: デモは見本の動き＋「（デモ）」; エラー流れ E1/E2 trong 外部連携_エラーの流れ). Cần hong xác nhận vì #169 có thể đọc theo B.
- **回答 (hong 2026-10-07, chat):** **B（いま）**。「再送」＝ 変更した行の CSV を出し、運営が THOMAS に登録して「送信済にする」を押す（手動）。**A（ES が自動送信）は将来（フェーズ3）**。設計書は B で書き、A は将来の注記。

### Q5. Trạng thái không có trong seed (送信失敗・取込エラー chi tiết・中止・再配送待)
- 台帳 E #38: 「仕様で決まっているエラーの流れ（THOMAS の再送…）だけ、**テストの段階で疑似的に再現する（デモ用には作らない）**」. Nhưng 台帳 F (法人Web 版1.1 レビュー2回目 ①): 「見本データで出せない状態は、**見本データを作って出す**（`demo_ok` で逃げない）」.
- Code: type `ShipOrder.st` có 送信失敗+`err` (`types.ts:347`) nhưng không seed/không sinh; 取込 chỉ có IM2 (一部エラー) sẵn; `recordImport` luôn `ng:0` (`areas/delivery.ts:312`).
- Lựa chọn: **A.** 送信失敗 ghi trong 設計書 bằng mô tả + `demo_ok` (lý do: 外部連携_エラーの流れ E1), không chụp. **B.** Thêm 1 dòng seed 送信失敗 (chỉ dữ liệu hiển thị, không làm luồng retry). **C.** A cho 送信失敗, B cho 取込エラー (IM2 có sẵn) + 中止/再配送待 chụp bằng thao tác.
- Đề xuất: **C**.
- **回答 (hong 2026-10-07, chat):** **C**。送信失敗は設計書に説明＋`demo_ok`（撮らない）。取込エラーは見本（IM2）で撮る。中止・再配送待は操作で撮る。

### Q6. Màu badge trạng thái (P-STATUS-COLORS) cho 配送
- Đã có: 台帳 M-1「一部納品済＝黄／キャンセル・…＝灰／受取済＝青」; 緑=有効, 青=予定, 黄=対応待ち, 灰=終了, 赤=エラー. Code `ST_TONE` (`constants.ts:64`): 出荷待 青／**出荷済 緑**／受取済 青／納品済 緑／一部納品済 黄／再配送待 黄／確認中 黄／中止・取消 灰. Chưa có quyết định cho: 出荷待・出荷済・納品済・再配送待・確認中; 変更申請 (変更可/申請中/提案中/調整済/変更不可) — code chỉ in chữ (`list/page.tsx:115`) trong khi 配送_08 §15-3 muốn 「文字のバッジ」; 出荷指示 (再送待ち 黄／送信済 緑／送信失敗 赤); 取込 (完了 緑／一部エラー 黄).
- Lựa chọn: **A.** giữ mapping code (出荷済=緑 cùng 納品済). **B.** 出荷済・受取済=青 (đang vận chuyển), 納品済=緑, 再配送待・確認中=黄 (対応待ち), 変更申請: 申請中 黄／提案中 青／調整済 灰／変更可・変更不可 không badge. 
- Đề xuất: **B** (xanh lá chỉ cho trạng thái hoàn tất; "出荷済" ≠ hoàn tất).
- **回答 (hong 2026-10-07, chat):** **B**。出荷済・受取済＝青／納品済＝緑／再配送待・確認中＝黄／変更申請 申請中＝黄・提案中＝青・調整済＝灰（変更可・変更不可はバッジなし）。

### Q7. 「配達時間帯」sửa được ở 編集 không / định dạng
- 配送_08 §15-6 chỉ liệt kê 配達時間帯 ở 概要; 7-8: 受取時間帯 = `delivery_receive_windows` snapshot **nhiều dòng** của 拠点; 8-4 không nói sửa được. Code: 1 ô text sửa được, lưu thành windows (`areas/delivery.ts:178-179`, lỗi 「配達時間帯は 10:00〜12:00 の形で入れてください」 chỉ hiện ở toast).
- Lựa chọn: **A.** Giữ (理由必須・変更履歴・thay đổi thì 再送 vì CSV có `receive_windows`), định dạng 1 ô `10:00〜12:00・13:00〜15:00` + lỗi inline. **B.** Chỉ đọc (sửa ở 拠点マスタ・snapshot không đổi). 
- Đề xuất: **B** (7-8: snapshot; sửa lẻ 1 配送 dễ lệch với ドライバー/法人 — 法人Web đã bỏ 受取時間帯 台帳 F). Nếu cần sửa gấp: A.
- **回答 (hong 2026-10-07, chat):** **B**。配達時間帯は編集では読み取りのみ（拠点マスタ・snapshot で直す）。

### Q8. Đóng modal khi đang nhập (取消・複製・代理登録・対応を決める・変更申請の確認)
- 台帳 F/P-FORM: Q02 cho 「キャンセル・ほかの画面への移動・ブラウザを閉じる」. Code: `Dialog` đóng bằng Esc / bấm nền / × không hỏi (`kit.tsx:374-381`) → mất dữ liệu đã nhập. Spec 配送_08 §15-11: 「モーダルはキーボードで完結…Esc で元のボタンへ」.
- Lựa chọn: **A.** Nếu đã sửa ô nào → Q02 khi Esc/×/キャンセル/bấm nền. **B.** Bấm nền không đóng; Esc/×/キャンセル → Q02 nếu đã sửa. **C.** Giữ.
- Đề xuất: **B**.
- **回答 (hong 2026-10-07, chat):** **A**。入力済みのときは Esc・×・キャンセル・背景クリックのすべてで Q02 を出す。

### Q9. 取消 xong thì 法人Web thấy gì? (dòng trong modal 取消)
- 配送_07 §13-2 ①: 「法人Webには『配送日調整中』と表示し…（法人には『取消』の文字を見せない）」. **台帳 F（hong 2026-10-06・受付簿 #160）: 「『配送日調整中（日付調整中）』のバッジは、対応する状態ができるまで出さない（凡例からも外す）」**. Code: modal vẫn ghi 「法人Webの表示 | 配送日調整中」 (`DetailModals.tsx:47`); `CORP_LABEL` (`lib/domain/areas/delivery.ts:84-87`) không có 取消 → 法人Web không hiện gì.
- Lựa chọn: **A.** Dòng ghi 「法人Webの表示 | 表示しない（取消の配送は法人Webに出ない）」 (đúng code). **B.** Khôi phục trạng thái 配送日調整中 (đảo quyết định #160). **C.** Hiện 「お届け予定の調整中」 chỉ trong trường hợp có 代替便 (con 確認中).
- Đề xuất: **A**.
- **回答 (hong 2026-10-07, chat):** **A**。取消の modal の「法人Webの表示」は「表示しない（取消の配送は法人Webに出ない）」。

---

## 3. [宿題] 台帳・仕様 đã chốt, code khác（設計書 viết theo quyết định, `demo_ok`）

| # | Quyết định (nguồn) | Code hiện tại (file:line) |
|---|---|---|
| H1 | 並べ替え = **全列** (台帳 K「一覧の決まり」) | 4 lựa chọn 出荷/納品 昇降 (`logic.ts:252`, `list/page.tsx:94`) |
| H2 | 期間 mặc định「出荷日基準・当週から2週間」(配送_08 §15-5) | cố định 2026/09/28〜11/15 (`constants.ts:27`) |
| H3 | 「経路の列を表示」: 配送区分・中継・ピッキング倉庫・配送会社・委託会社・便種別 (§15-5) | Switch có nhưng không có cột (`list/page.tsx:101-102`, 「経路の列はまだない」) |
| H4 | Điều kiện chung với スケジュール: **配送パターン・配送回数・割当状況(割当済/未割当)** (§15-5 #5,#8,#13) | không có 2 điều kiện đầu; 割当 chỉ có Switch「ドライバー未割当のみ」 (`list/page.tsx:93`) |
| H5 | Dải「この期間には予定が N件あります（〈最初の日〉以降）」tính theo kỳ (§15-5) | cố định "1,284件・2026-11-09" (`list/page.tsx:98`) |
| H6 | 変更申請 = 文字のバッジ (§15-3) | text thường (`list/page.tsx:115`) |
| H7 | 0件 = I01 (P-LIST) | 「条件に合うデータはありません」 (`list/page.tsx:122`) |
| H8 | Quay lại từ 詳細 → khôi phục điều kiện/trang/số dòng (P-LIST); 表示件数 nhớ theo người×danh sách (P-PAGESIZE) | `useState` thôi (`list/page.tsx:27-35`, `lib/ui/paging.ts:9`) → 運営A đã dùng `demo_ok` "コードは覚えない" |
| H9 | Tab giữ ở URL `?tab=` (P-TAB); tab có số đếm: 「トラブル 3」 | chỉ đọc `?tab` lúc đầu, `onChange={setTab}` không ghi URL (`DeliveryDetail.tsx:57,136`); 「トラブル（3）」 (`:89`) |
| H10 | 変更履歴 = P-HIST: 日時・操作者・操作・項目・変更前・変更後・理由; 保持 | Timeline text tự do + lọc 種類 (`DeliveryDetail.tsx:551-562`) |
| H11 | 配送ルート: có 「問い合わせ確認URL」, 配送回数/配送パターン lấy từ 子契約 (§15-6) | "2回"/"サイクル" cố định, không có URL (`DeliveryDetail.tsx:347-348`) |
| H12 | 配送概要 có 「備考」(§15-6, 7-8) | không có ô 備考 (`DeliveryDetail.tsx:205-221`) |
| H13 | 配送スタッフ gán **theo 区間(レグ)** (配送_08 §15-6, 配送_06 §12-1) | 1 select tên cố định ['山口 健',…], nhãn「1次・栄成ロジ」 nhưng lưu vào **区間 cuối** (`DeliveryDetail.tsx:248`; `areas/delivery.ts:170-176`) |
| H14 | 出荷指示後も **配送会社②・住所** đổi được (1配送だけ・理由必須・住所=rev mới＋送り状 voided→再発行) (配送_08 §15-13, 配送_12 §15.13-15.14) ／ **trạng thái sửa được = không phải 納品済・中止・取消** | UI có ô nhưng lưu → lỗi 「配送会社の変更は…子契約で」「納品先の住所は、拠点の情報で」 (`areas/delivery.ts:166-167`); nút 編集 chỉ 予定/出荷待 (`fromDomain.ts:341,477`); không rev+1 (`lib/domain/areas/delivery.ts:502-525`) |
| H15 | 取消: 「法人Webの表示」 (xem Q9); みなし完了の khung「ヤマトへ調査を依頼した」 chỉ cho 納品済(みなし) (配送_04 §7-7, 配送_07 §13-2) | luôn hiện, số 送り状 cố định, checkbox không dùng (`DetailModals.tsx:186-189`) |
| H16 | Thao tác không đảo ngược → xác nhận **Q01** (「送り状番号を無効にする」) | thực thi ngay (`DeliveryDetail.tsx:410`) |
| H17 | 実績 (完了日時・納品数・備考) và 駐車料金 **運営 sửa được** (理由必須・履歴) (配送_04 §8-4, 配送_12 §15.2/§15.18); 添付② thêm/thay được | 実績 chỉ đọc (`DeliveryDetail.tsx:424-484`); 「資料を追加」「写真を追加」 chỉ toast (`:545`, `DetailModals.tsx:165`); 添付 ①② là mẫu cố định (`:533-546`, `seed.ts RESULT_SAMPLE.files2`) trái 受付簿 #47 |
| H18 | 出荷指示 CSV: **倉庫コード = THOMAS倉庫コード (運営入力)**, file theo 倉庫×(2週間の窓/追加分), tên file có business_date・rev (配送_05 §10-4, 配送_12 §19.1) | cột 倉庫コード = `d.warehouseId` (WH00001) (`fromDomain.ts:692`) dù `thomasCode` có sẵn; select 倉庫/対象 không nối (`ship-orders/page.tsx:58-59`); file `thomas_shiporder_YYYYMMDD.csv` (`fromDomain.ts:696`); rev luôn "rev1" (`:668`) |
| H19 | 取込: 1 dòng lỗi không dừng cả file, ghi số 受取/飛ばし/誤り + lý do; 出荷実績 ok → 出荷待→**出荷済**; 台帳 E #38 「押すと流れどおりに状態が変わる・（デモ）と表示」 | `recordImport` chỉ ghi log, `ng:0`, không đổi trạng thái (`areas/delivery.ts:309-314`); toast không có 「（デモ）」 (`ship-orders/page.tsx:42`) |
| H20 | `locked` = 出荷指示 初回送信成功 (配送_05 §10-2) | banner dùng `closed && 出荷待` (`fromDomain.ts:444`) — xem Q3 |
| H21 | input_standard: メモ・理由 **複数行 500字** (台帳 F B-7), 絵文字不可 (E13) | 運営メモ textarea・変更理由/取消/複製/解決の「理由」 không có maxlength (`DeliveryDetail.tsx:298,250`, `DetailModals.tsx`) |
| H22 | CrProcessModal / 複製 / 代理登録 / 取消: giá trị mẫu cố định (ngày, 地点表 WH00001→HU00124→CU00662, 申請者…) | `DetailModals.tsx:23,70,137,199-206,351-352,362-368` — khi chụp phải ghi `demo_ok` hoặc nối dữ liệu thật (受付簿 #47 chỉ làm ở banner/実績) |
| H23 | 納品済(みなし): 「納品済（みなし）」 (配送_04 §7-7) | chỉ ghi trong sub-text/実績 (`fromDomain.ts:120`) |

---

## 4. [open] Chờ khách / ベンダー
1. THOMAS: 列の定義・順序・文字コード (UTF-8 hay Shift_JIS)・取消I/F・同一指示番号の上書き再送を受けるか — 配送_10 §18 No.5・#28・#29・#30・要確認 No.2. Code tạm: `THOMAS_HEAD` 20 cột (`lib/ops/delivery/fromDomain.ts:681`; bản mẫu 18 cột ở `_components/csv.ts:17`), UTF-8 BOM (`csv.ts:6`), nội dung 設計書 ghi 「暫定」.
2. ヤマト送り状用CSV: 宛名・記事欄・お届け予定日(営業所着日) — 配送_10 #19 暫定（`csv.ts` 'yamato'）.
3. Tên 「トーマス／THOMAS」「ヤマト運輸（略称ヤマト）」 — 配送_10 #10・#38 (trang ship-orders ghi 「トーマス（暫定の名前）」).
4. 送り状番号 của 路線 khác ヤマト (佐川・福山…) 形式 & 追跡URLひな形 — code chỉ kiểm tra ヤマト 12 桁 (`lib/domain/areas/delivery.ts:535`).
5. Thời gian lưu 変更履歴 「24ヶ月」 (暫定, 配送_10 #16; code ghi ở `DeliveryDetail.tsx:557`); 写真 12ヶ月 (配送_06 12-4).
6. みなし完了 mà chỉ một phần số hộp không tới → 一部納品済 cho phép không (配送_10 #23).
7. 運営デモ改善案「残る確認事項」: COOL便 do 委託/自社 chở → 送り状 ES採番? (A2); 中継先 thiếu hộp → ai hỏi ヤマト (A6).
8. 備考 (`delivery_note`) cột/độ dài (配送_10 #12 技術) — liên quan H12.

---

## 5. [msg] Message cần (ID tạm → ID đề xuất trong dải 運営D)
**Dùng lại (không tạo mới):** E01・E02 (理由・理由の詳細・内容・連絡元・種別・メモ trống) ／ E04 (超過) ／ E13 ／ E30 (保存失敗 toast) ／ E32 (権限なし) ／ E31・I02 (同時編集) ／ Q02 (離脱) ／ Q01 (送り状番号を無効にする, ボタン名=「無効にする」) ／ S01 (編集の保存; câu dài trong code đổi thành S01＋I130) ／ I01 (0件) ／ I03 「{理由}（見るだけ）」 (ô khoá) ／ E51・E52・S10 **không dùng** (取込 ở đây là 連携, 台帳「変更なし（連携の形）」, không phải P-CSV).
**Mới** (ja_c không cần: chỉ nội bộ → chỉ viết ja_o + vi):
| ID đề xuất (tạm `NEW-DLVR-xx`) | Loại/nơi | ja_o đề xuất | Cảnh | Code hiện tại |
|---|---|---|---|---|
| S130 (NEW-DLVR-01) | 成功/トースト | {操作}しました。（例：取消／トラブルを登録／トラブルを解決／メモを追加／資料を追加／送り状番号を登録・直・無効に／子を確定して出荷待に） | 詳細の各操作 | toast riêng từng chỗ (`DeliveryDetail.tsx:168,171`, `DetailModals.tsx:32,148,221`, `:404`) |
| S131 (02) | 成功/トースト | {配送No}を作成しました（確認中）。 | 複製 | `DetailModals.tsx:83` |
| S132 (03) | 成功/トースト | 変更申請 {申請番号}を{承認／否認}しました。／{日}を法人へご提案しました（法人のご返事を待ちます）。 | 変更申請の確認 | `areas/delivery.ts:251-253` |
| S133 (04) | 成功/トースト | 出荷指示を再送しました（新しい版）。 | 再送 | `ship-orders/page.tsx:35` |
| S134 (05) | 成功/トースト | 「{ファイル名}」を取り込みました（{種類} {n}行・成功{m}・エラー{k}）。 | 取込 | `ship-orders/page.tsx:42` |
| E160 (06) | エラー/トースト | この配送データは{操作}できません（{状態}）。 | 取消・編集・複製・解決の状態ガード | `lib/domain/areas/delivery.ts:468,477,505` |
| E161 (07) | エラー/インライン | 出荷日の前日までの配送だけ日付を変えられます。 (※Q3=A なら不要) | 編集 | `domain:510` |
| E162 (08) | エラー/インライン | 同じサイクルの同じ半分（A・B／C・D）の日を選択してください。(※Q3) | 編集 | `domain:512` |
| E163 (09) | エラー/インライン | お届け・出荷できない日です。(※Q3) | 編集 | `domain:515` |
| E164 (10) | エラー/インライン | 配達時間帯は「10:00〜12:00」の形で入力してください。(※Q7=A) | 編集 | `areas/delivery.ts:179` |
| E165 (11) | エラー/インライン | ヤマトの送り状番号は12桁の数字で入力してください。 | ルート | `domain:535` |
| E166 (12) | エラー/インライン | 送り状番号 {番号} はほかの荷物で使われています。 | ルート | `domain:537` |
| E167 (13) | エラー/インライン | 子の数量を1つ以上入力してください。／枝番は最大9までです。 | 複製 | `domain:480-483` |
| E168 (14) | エラー/ボタン非活性 | 親のトラブルが未解決のため確定できません。 | 確認中の子 | `domain:496`, `DeliveryDetail.tsx:276` (đã có `disabled-why`) |
| E169 (15) | エラー/インライン | 子の納品日を yyyy-mm-dd で入力してください。 (hoặc E08/E14 nếu khớp) | 子の確定 | `areas/delivery.ts:235` |
| I130 (16) | 情報/ページ上部 | オーダー締切（{日}）の後です。…(※Q3 sửa lại câu) | 詳細 | `DeliveryDetail.tsx:119-123` |
| I131 (17) | 情報/ページ上部 | 未解決のトラブル報告が {n}件あります。「対応を決める」でまとめて解決してください。 | 詳細 | `:124-128` |
| I132 (18) | 情報/ページ上部 | 確認中の子です。親のトラブルを解決してから「確定」で出荷待にします。 | 子 | `:129-133` |
| I133 (19) | 情報/ページ内 | この期間には予定が {n}件あります（{日}以降）。予定は配送データになるまでこの一覧に出ません。 | 一覧 | `list/page.tsx:98` (H5) |
| I134 (20) | 情報/表の中 | まだ納品実績がありません。／トラブル報告はありません。(2 câu EmptyState) | 実績・トラブル | `DeliveryDetail.tsx:425,524` |
| W130 (21) | 警告/モーダル | この配送にはすでに子が{n}件あります。新しい子は枝番 -{m} になります。 | 複製 | `DetailModals.tsx:125` |
| Q130 | 確認/モーダル | (予留) 「中止する」 nếu Q2=A | — | — |
- Dùng chung → báo phiên gộp (không tự thêm): **CSV出力 hoàn tất toast** 「CSVを出力しました（{n}行・{ファイル名}）」 (`app/ops/_ui/csv.ts:60`, P-CSV-OUT chưa có ID); **toast tìm kiếm** 「検索しました（…）」 (`list/page.tsx:48`, `review/page.tsx:38`) — không có trong P-LIST → đề xuất **bỏ**.
- Khớp văn Message List: không có số WEB-n nào cho 配送 → cột `ml` để trống (thêm vào sheet 「Message List への追加案」 sau).

---

## 6. Đã khớp (không hỏi)
- Danh sách chỉ có 配送データ (予定 loại trừ), 配送No = ngày 出荷予定 lúc tạo & 「出荷 {日}（実績）」 dưới 配送No (台帳 B 配送No; `listRows` `fromDomain.ts:335`).
- Khung tìm kiếm `es-search`, 10/20/50 dòng, **không** dấu 「未適用」 (`UnappliedMark` = null), CSV出力 = cột màn hình + toàn bộ field (P-CSV-OUT; tên file qua `runCsvExport`), nút 編集 theo quyền; 配送_08 nói "10/20/50/100" nhưng 台帳 K (10/20/50) thắng.
- 取消 chỉ khi chưa xuất kho: 予定・出荷待・確認中 (`lib/domain/areas/delivery.ts:468`); 複製 5 loại (分納・再配送・代替便・返送・その他), 枝番 ≤9 (`:480`); chỉ 返送 mới đổi 納品先 (配送_04 §8-4).
- 6 区分 トラブル＋bảng đối chiếu アプリ→6区分 (台帳 M-4 A3), 6 phương án 対応を決める và trạng thái kết quả (全量/一部/残さない/送り直す/当日/中止), 運賃 mặc định 「請求しない」・「請求する」 cần 理由 (`DetailModals.tsx:295`; 配送_04 §7-7).
- Trạng thái chính ↔ 台帳: 「アプリの配送完了＝報告済み。未解決のあいだ受取済のまま」 (M-4 A5), ステップ ①〜⑤ & công thức 陳列後在庫 (A4), 到着予定・駐車料金 hiển thị (M-4 / 台帳 B), 受取者 không hiển thị (台帳 E 配送データ詳細の受取者), 賞味期限 không theo dõi.
- 変更申請: 承認/代替日/否認, 理由 bắt buộc khi 否認・別日 (`logic.ts:checkCrProcess`), banner dữ liệu thật (受付簿 #47).
- 送り状: ES採番 `配送No-箱番号` (台帳 M-4 A7; `fromDomain.ts:700`), ヤマト = 追跡ページ link, không dùng API (台帳 M-3「ヤマトの配送状況」), 路線 chỉ nhập tay/ CSV; ヤマト 12桁.
- 出荷指示: dùng 数量0 + rev (không có API 取消), 資材 không gửi THOMAS (`soTarget` loại 資材/予定/確認中), CSV出力 không `locked` (note trang `ship-orders`).
- 権限 route: フル CRUD／経理 R／営業・CS・商品系 CRUD／物流 R/U đúng 権限表 (`seed/account.ts:50`); `/edit` chặn bởi OpsShell nếu thiếu `update`.
- 取込/出力 THOMAS・ヤマト: 「変更なし（連携の形）」 (CSV入出力_定義: 運営「出荷指示・取込」の行) → không áp P-CSV 2 bước.
- Đã trả lời trong input_standard, không hỏi: ngày `yyyy-mm-dd`, 日時 `yyyy-mm-dd HH:MM`, ファイル 5MB×10 (資料), 500 ký tự メモ, 金額 phải, 住所 255.


---

## 運営D 配送 — 3 機能: 要確認／資材の集計／委託配送先・中継先の検索 (AW_RVEW・AW_MSUM・AW_INQR)

Ngày: 2026-10-07 ／ Giai đoạn A (memo, không sửa file chung) ／ Nguồn: code `app/ops/delivery/{review,material-summary,inquiries,_components}`, `lib/ops/areas/delivery.ts`, `lib/ops/delivery/{fromDomain,logic,constants,types}.ts`, `lib/domain/{carrierFee,seed/delivery,seed/master}.ts`, `lib/ops/{permissions,apiPerm,menu}.ts`; 台帳 (E81 見積依頼, L139 機能B, L372 資材の注文, K435 一覧の決まり, M477/479/487 日付・メモ・検索, F173/174 P-FORM・Q02); 受付簿 #4 #59 #127 #154; 配送_01 §3-2/§3-3, 配送_05 §10-9, 配送_08 §15-9, 配送_11 L154-156/165, 配送_99; 権限表 (出荷・配送管理); CSV入出力_定義 L142-143; 共通パターン／共通メッセージ (read-only).
Quy ước: **[Q]** hong trả lời ／ **[宿題]** đã chốt, code chưa theo → 設計書 viết theo quyết định + `demo_ok` ／ **[open]** hỏi khách ／ **[msg]** message.
Screen Code: AW (運営管理者Web) + 機能略 RVEW／MSUM／INQR. Lưu ý: `/ops/inquiries` (お問い合わせ, 運営F) đã dùng **AW_INQU**; INQR chỉ khác 1 chữ → xem Q-IQ1.
Quyền (権限表 L41 = code `account.ts:50` R7): `delivery` = フル CRUD／経理 R／営業 CRUD／CS CRUD／商品管理 CRUD／商品開発 CRUD／物流 R/U. Nút 対応して閉じる・対象外にする・見積依頼 cần `delivery` update (apiPerm: action mặc định = feature của area). **Không hỏi lại quyền.**

---

### D-3a. 要確認（一覧・詳細）— `/ops/delivery/review`, `/[id]`

**1. VIEWS** (cỡ **M**: 9 trạng thái, 一覧 ≈ 26 mục + 詳細 ≈ 36 mục)

| Screen | Code | Trạng thái (id) | URL / cách tạo |
|---|---|---|---|
| 要確認一覧 | AW_RVEW_001 | 001 初期表示（状態＝未対応・検出の新しい順） | `/ops/delivery/review` |
| | | 002 区分で絞り込み | `?kind=トラブル報告（未解決）` (code đọc `sp.get('kind')`, từ panel 要確認 của スケジュール) hoặc chọn 区分 + 検索 |
| | | 003 状態＝対応済 | setup: đóng 1 件 ở 詳細 → quay lại, 状態=対応済 + 検索 (cột 操作 đổi thành 詳細 ›) |
| | | 004 0件 | gõ từ khóa không có + 検索 |
| 要確認詳細 | AW_RVEW_002 | 005 初期表示（未対応） | `/ops/delivery/review/RV-PR-DD-20261005-0095` (提案中; chắc chắn có trong seed). 件 トラブル: `RV-TR-<DL…>` của ひかり物産 川崎工場 (CU01902), lấy ID từ 一覧 khi capture |
| | | 006 入力エラー（日付・理由が空） | xóa 日付/理由 → 対応して閉じる |
| | | 007 対応済（閉じたあと） | setup: đóng rồi mở lại `/review/<id>` (không còn khối 対応, timeline có 対応者) |
| | | 008 消費期限の注意 | **Không tạo được từ code hiện tại** (kind này không được sinh ra, xem H5). Phụ thuộc Q-RV1 |
| | | 009 見つかりません | `/ops/delivery/review/XXX` (EmptyState) |

**2. [Q]**

- **Q-RV1. 詳細に何を出すか（区分ごとの中身）**
  > 出典: `app/ops/delivery/review/[id]/page.tsx:35-36,57-59` 「中身があるのは見本 #142（予定生成不可）と #156（消費期限の注意）。ほかの要確認は…中身は #142 の見本を出す」。`fromDomain.ts:624-650` は `no` を一度も入れない → **本物のデータでは全件が #142 の見本（候補日の表・「20日以内に納品できる日が見つかりません」・作り物の検出履歴「物流 田中」）を表示**。配送_08 §15-9 は区分の表と「締切後の扱い」だけで、詳細の画面は定義なし。台帳に決定なし。#142／#156 は旧デモ（部品16）由来＝参考で正ではない（CLAUDE.md）。
  - **A. 共通の骨格だけを正にする**：見出し（区分・状態・検出日時・最終検出）・内容（対象・法人・拠点・納品日・原因の文）・「対象の画面へ」リンク・検出と対応の履歴（P-HIST 形式）・対応欄。区分別の表（候補日／商品ごとの判定）は「予定生成不可」「消費期限の注意」の2つを例として書く。✔ データが無い区分を作り込まない ✘ 2つの表はコードが無く宿題になる
  - **B. 19区分すべての専用の詳細を設計する** ✔ 完全 ✘ 仕様が無い区分が多い（推測になる）、工数大
  - **C. 見本のまま（#142 を全件に出す）** ✘ 本物では誤解を招く
  - **推奨 A。** 本物のデータで説明できる中身だけを設計書に書く。
  - **回答 (hong 2026-10-07, chat):** **B**。19区分すべての専用の詳細を設計する。※仕様に中身がない区分は推測で埋めず、Stage B で区分ごとに「要確認」として聞く。
- **Q-RV2. 「対応」の欄は何を変えるのか（日付を指定して解決）**
  > 出典: コード `resolveReview`（`lib/ops/areas/delivery.ts:145-150`）は状態とメモを保存するだけで、配送の日付は変わらない。配送_08 §15-9: 「出荷日の前日までなら配送データ詳細の「編集」から1件ずつ直す（理由必須・同じ前半／後半）。出荷日の当日以降は取消＋複製」「日付を書き換える入口は詳細画面の日付変更に統一」。
  - **A. 要確認は記録だけ。日付は「配送データ詳細の編集」へのリンクで直し、戻って「対応済」** ✔ 仕様どおり・検証が1か所 ✘ 画面を行き来する
  - **B. 要確認詳細の中で同じ関数を呼んで日付を直接変更**（「日付を指定して解決」を実装） ✔ 速い ✘ 入口が2つ（15-9 の「統一」に反する）
  - **C. いまのまま（メモだけ）** ✘ 「日付を指定」と書いて何も変わらず誤解
  - **推奨 A。** 対応欄は「対応の内容（メモ）」「理由」に変え、日付の欄とラジオ「日付を指定して解決」は外す。
  - **回答 (hong 2026-10-07, chat):** **A**。要確認は記録だけ。日付は「配送データ詳細の編集」へのリンクで直し、戻って「対応済」。対応欄は「対応の内容（メモ）」「理由」にし、日付欄とラジオ「日付を指定して解決」は外す。
- **Q-RV3. 閉じ方：「対応済」「対象外」と、原因が別の画面で解消する区分**
  > 出典: 配送_08 §15-9 「運営（物流）が配送のトラブルをまとめて解決すると、両方とも同じトランザクションで閉じる」、`status(open｜resolved｜ignored)`。コード：トラブルが未解決のまま「対応済」を押せる（`review/[id]/page.tsx:70,114`）／ラジオ「対象外にする」（`how='ign'`）を選んで「対応して閉じる」すると **対応済** になり、ヘッダの「対象外にする」とは別物（重複）。
  - **A. 原因が他の画面にある区分（トラブル・ドライバー未設定・変更申請・子の確定待ち・欠配）は原因が解消したら自動で閉じる。手動で閉じるのは日付・連携系の区分だけ。「対象外」は理由必須の1つの入口（ヘッダのボタン）に統一、ラジオは廃止。対象外は Q01 の確認** ✔ 仕様と一致・取りこぼしなし ✘ 手動の抜け道がなくなる（誤検出は対象外で逃がせる）
  - **B. 全区分で手動「対応済」「対象外」ができる（現状）** ✔ 運営が自由 ✘ トラブルが残ったまま要確認だけ消える
  - **推奨 A。**
  - **回答 (hong 2026-10-07, chat):** **A**。原因が他の画面にある区分は解消したら自動で閉じる。手動で閉じるのは日付・連携系だけ。「対象外」は理由必須の1つの入口（ヘッダ）に統一・Q01 で確認。

**3. [宿題]** (quyết định đã có, code khác → 設計書 theo quyết định, `demo_ok`)

| # | Quyết định | Code hiện tại |
|---|---|---|
| H1 | 並べ替え = mọi cột (台帳 K435, P-LIST) | `review/page.tsx:54-64` không có 並べ替え (SearchPanel `kit.tsx:488-519` không có) |
| H2 | 表示件数 10/20/50 nhớ theo người・theo 一覧 (P-PAGESIZE) | `lib/ui/paging.ts:9-13` chỉ `useState` |
| H3 | Từ 詳細 quay lại → khôi phục điều kiện・trang (P-LIST) | `review/page.tsx:31-32` useState; sau 対応して閉じる `router.push('/ops/delivery/review')` (`[id]/page.tsx:53`) → luôn về 状態=未対応 |
| H4 | Ngày `yyyy-mm-dd`, giờ `yyyy-mm-dd HH:MM` (台帳 M477) | cột 納品日・検出・最終検出 hiện `MM-DD`/`10/08（水）` (`review/page.tsx:82-84`, `fromDomain.ts:57-59`). Lọc 納品日 **cố định năm 2026**: `logic.ts:292` (`2026 * 10000`) → lỗi từ 2027 |
| H5 | 区分 theo 配送_08 §15-9 (REVIEW_KINDS có 19, `constants.ts:30`) | `reviewItems` (`fromDomain.ts:624-650`) chỉ sinh **6**: トラブル報告（未解決）・子の確定待ち・欠配・ドライバー未設定・変更申請の期限到来・オーバーライドの失効・提案中. 13 区分còn lại (予定生成不可・消費期限の注意・出荷指示の再送…) không bao giờ xuất hiện, nhưng vẫn có trong dropdown 区分 và panel 要確認 của スケジュール |
| H6 | Phát hiện lại sau khi 対応済 → **要確認 mới** (UNIQUE WHERE open, 配送_08 §15-9) | id cố định (`RV-TR-…`) + trạng thái lưu theo id (`areas/delivery.ts:41,145-149`) → vấn đề tái phát vẫn là 対応済. Câu chữ ở `[id]/page.tsx` (note) nói ngược lại |
| H7 | 検出日時・最終検出 = `first_detected_at`/`last_detected_at` | `[id]/page.tsx:57-66` ghi cứng "（3回）", timeline giả ("物流 田中", "システム") |
| H8 | メモ・理由 = tối đa 500 ký tự・nhiều dòng (台帳 M479) | 理由 là TextField 1 dòng, không maxlength (`[id]/page.tsx` field 理由) |
| H9 | Nhập sai → inline dưới ô, message theo Message List (台帳 F173) | `logic.ts:327-333` câu chữ riêng ("日付を入力してください") → dùng E01／E161 |
| H10 | Vai trò chỉ R (経理) không thấy thao tác | khối 対応 (radio+ô nhập) vẫn hiện, chỉ ẩn nút (`[id]/page.tsx:114` vs `:70`) |
| H11 | — | memo lưu mã nội bộ `date：2026-12-11 …` (`[id]/page.tsx:51`, `how` = date/skip/keep/split/wh/ign) hiện nguyên ra timeline |
| H12 | P-LIST không có toast sau 検索 | `review/page.tsx:38` toast "検索しました（n件）" (không có trong Message List) → bỏ |
| H13 | Q02 khi rời màn đang nhập (台帳 F174/216) | `[id]/page.tsx` không có xác nhận khi rời với 理由 đã nhập |

**4. [open]**: không có giá trị chờ khách riêng cho màn này. (Ngưỡng trong spec đã chốt: 安全日数 2日, 変更申請 3日前, ドライバー未設定 3日前.)

**5. [msg]** (xem bảng chung ở cuối) — S130, S131, E160, E161, (Q130 nếu Q-RV3=A); tái dùng I01, E01, E100, S12, E32.

**6. Đã khớp**: メニュー badge = 未対応の件数 (`menu.ts:50`, 台帳 L・配送_08 L319); 状態 3 giá trị = open/resolved/ignored; 一覧 10件・「検索」「Enter」, không hiện 未適用 (`list/ListView.tsx:28`, 台帳 L240); CSV出力 = 検索条件どおり全件 (P-CSV-OUT, CSV入出力 L142); ドライバー未設定 từ **3日前** (`fromDomain.ts:642-645`, 配送_08 2026/09/30); đóng 1 件 chỉ khi 日付 hợp lệ + 理由.

---

### D-3b. 資材の集計 — `/ops/delivery/material-summary`

**1. VIEWS** (cỡ **S**: 3 trạng thái, ≈ 30 mục gồm 2 CSV)

| Screen | Code | Trạng thái (id) | URL / cách tạo |
|---|---|---|---|
| 資材の集計 | AW_MSUM_001 | 001 初期表示（出荷日 2026-10-06・追加配送あり） | `/ops/delivery/material-summary` (seed: 10/06 có MO-2610-0013, OP000036 có phí) |
| | | 002 別の出荷日（例 2026-10-07・無料） | chọn 出荷日 → 検索 (dropdown chỉ liệt kê ngày có 配送: 05-06, 09-22, 09-26, 10-05, 10-06, 10-07) |
| | | 003 資材の配送なし（文言のみ） | **UI không tạo được** (dropdown chỉ có ngày có dữ liệu). Ghi `sel:"-"` + lời văn "この日の資材の配送はありません" |

CSV: 資材の集計 (7 cột: 配送No・拠点・出荷日・お届け予定日・資材ID・資材名・数) và 送り状CSV（ヤマト）(4 cột: 配送No・拠点・お届け予定日・中身) — ghi định nghĩa cột vào 設計書 (`sel:"-"`).

**2. [Q]**

- **Q-MS1. 「ピッキング済」の印と送り状番号の入口はどの画面か**
  > 出典: 配送_99「資材の状態」: 「出荷待（注文確定）→ ES事務所のピッキングリストでチェック（ピッキング済の印）→ 送り状番号の登録（CSV取込または手入力）で出荷済」／配送_05 §10-9 「資材ピッキングリスト（画面・チェックボックス）で作業し、ヤマト送り状 CSV を出す」。配送_99「資材の集計」＝「出荷日ごとの資材の合計と配送ごとの中身を出す画面（印刷・ヤマトの送り状CSV）」（チェックの話なし）。コード：チェックボックスなし。送り状番号・発送日は**資材注文管理（運営B）の詳細で入力**（受付簿 #154 実装済・132e0a7）、CSV取込なし。
  - **A. 「配送ごとの中身」の表にチェック列（ピッキング済）を足し、同じ画面から送り状番号を CSV取込／手入力** ✔ 仕様の作業の流れがそのまま・印刷と同じ画面 ✘ 新しい持ち物（ピッキング済の印）・資材注文管理と入口が2つ
  - **B. 資材の集計は閲覧・印刷・送り状CSVだけ。ピッキング済の印は作らず、送り状番号の入力＝出荷済のまま（資材注文管理）** ✔ 作るものが少ない（#154 のまま） ✘ 配送_99 の「ピッキング済の印」を落とす
  - **C. ピッキング済の印は資材注文管理側に置く** ✘ ES事務所の作業（印刷した表）と画面が離れる
  - **推奨 B**（#154 で運営の入力先が決まっている／印刷した表に手書きでチェックする運用でも足りる）。A にするなら配送_04 の状態の表に「ピッキング済」の扱いを足す必要あり。
  - **回答 (hong 2026-10-07, chat):** **B**。資材の集計は閲覧・印刷・ヤマト送り状CSVだけ。「ピッキング済」の印は作らず、送り状番号の入力＝出荷済のまま（資材注文管理）。
- **Q-MS2. 出荷日の初期値と選び方**
  > 出典: コード `material-summary/page.tsx:27-28` で `'2026-10-06'` を**固定**（クリアも同じ日に戻す）。デモの今日は 2026-10-05（`calendar.ts:11`）。台帳に決定なし（M477: 日付の入力欄は共通の部品）。コードは「資材の配送がある日だけ」の選択リスト。
  - **A. 初期値＝今日以降で最初の出荷日（なければ最後の日）、選択リストのまま** ✔ ES事務所が毎朝開いてすぐ使える・0件の画面が出ない ✘ 資材のない日は選べない
  - **B. 初期値＝今日、日付の共通部品（入力）** ✔ 日付の決まりに合う ✘ 0件の日が出る（I01）
  - **C. 固定のまま** ✘ 本番では意味がない
  - **推奨 A**（クリアも同じ初期値）。
  - **回答 (hong 2026-10-07, chat):** **A**。初期値＝今日以降で最初の出荷日（なければ最後の日）・選択リスト。クリアも同じ初期値。

**3. [宿題]**

| # | Quyết định | Code hiện tại |
|---|---|---|
| H14 | OP000036 資材の追加配送 = **【仮】¥2,000／回** (台帳 L372, seed `master.ts:196`; 配送_99 "仮 ¥1,000" là bản cũ) | `material-summary/page.tsx:51` notice ghi "仮 1,000円" |
| H15 | 出荷日初期値 (Q-MS2) | `page.tsx:27-28`, nút クリア |
| H16 | 件数の集計: 出荷日 × 便種別 (COOL便／ES配送便) (配送_05 §10-9 "件数の集計") | không có; nơi đặt là 出荷・配送管理 一覧 ("資材の配送データ一覧") → **chuyển cho memo 出荷・配送管理**, màn này không làm (xem [open] O3) |
| H17 | Lỗi 0件 theo I01 | `page.tsx` "この日の資材の配送はありません" |

**4. [open]**
| # | Mục | Ghi chú |
|---|---|---|
| O1 | OP000036 金額 (仮 ¥2,000) | 台帳 L372 「金額は客先確認」。giá hiển thị lấy từ マスタ (`fromDomain.ts:841`), không cứng |
| O2 | **ヤマト送り状CSV の列・文字コード** (住所・電話・配達時間帯 [A7: 運営が拠点ごとに設定・既定 午前中] …) | 配送_05 §10-9 「連携CSV：ヤマト取込用（フォーマットマップ有）」. Code chỉ có 4 cột, UTF-8 BOM (`csv.ts` ghi "本番は Shift_JIS"). CSV入出力 L143 = 「変更なし（連携の形）」 |
| O3 | Cách đếm khi 1 拠点 có 便種別 khác nhau theo 温度帯 | 配送_05 §10-9 (要件シート 行124) 要確認 |
| O4 | 印刷 **A3** | chỉ có trong notice của code (`page.tsx:51`), không có trong 台帳/仕様; không có `@page` (`delivery.css:726`). Hỏi khách: khổ giấy, có cần |

**5. [msg]**: tái dùng I01 (0件), S12 (CSV出力: "CSVを出力しました（{n}行・{ファイル名}）。" thay toast riêng ヤマト `page.tsx:36`). Không cần ID mới.

**6. Đã khớp**: ES事務所 WH00004・THOMAS 連携なし (配送_01 8B, 配送_99 A2); 資材 không tính vào 件数しきい値; 出荷日ごとの資材の合計＋配送ごとの中身 (配送_99 "資材の集計"); 送り状CSV giữ "形のまま" (CSV入出力 L143); 追加配送 phí lấy từ OP000036 của マスタ; 検索 = nút/Enter, không 未適用.

---

### D-3c. 委託配送先・中継先の検索 — `/ops/delivery/inquiries` (見積依頼／配送問い合わせ)

**1. VIEWS** (cỡ **M**: 8 trạng thái, 2 màn + modal, ≈ 60 mục)

| Screen | Code | Trạng thái (id) | URL / cách tạo |
|---|---|---|---|
| 住所から委託先を探す | AW_INQR_001 | 001 初期表示（千葉県・船橋市・冷蔵・常温） | `/ops/delivery/inquiries` (tab mặc định `addr`) |
| | | 002 条件を変えて検索（例 愛知県） | chọn 都道府県 → 検索 |
| | | 003 見積依頼（モーダル） | nút 見積依頼 ở dòng 委託・引き取り (vd DE00001 栄成ロジ); dòng 路線 chỉ có chữ 運賃表 |
| | | 004 見積依頼 入力エラー | bấm 見積依頼を送る khi trống (hiện chỉ toast; inline là 宿題 H26) |
| | | 005 見積依頼を送った | điền 法人名・プラン… → 送る (toast + modal đóng) |
| 中継先・送り状から拠点を引く | AW_INQR_002 | 006 初期表示（HU00124） | setup: click tab 「中継先・送り状から拠点を引く」(tab **không** nằm trong URL) |
| | | 007 キーワード検索（結果に「中継先」列） | nhập 配送No/送り状番号/拠点名 → 検索 |
| | | 008 見つかりません | từ khóa không có |

Ghi chú: "この地域に対応する委託配送先はありません" **không tạo được** (ヤマト・佐川 `areas:['全国']` luôn khớp) → `sel:"-"`. Tách 2 màn theo 配送_99 "2タブ" (đề xuất; nếu hong muốn 1 màn thì gộp thành _001).

**2. [Q]**

- **Q-IQ1. Tên màn hình và Screen Code**
  > 出典: メニュー `lib/ops/menu.ts:52`「委託配送先・中継先の検索」／権限表 L41・台帳・配送仕様「配送問い合わせ」／コードのコメント「配送問い合わせ（本体 renderDlInq）」。運営F の「お問い合わせ」`/ops/inquiries` は AW_INQU。
  - **A. 画面名＝メニューどおり「委託配送先・中継先の検索」、権限表の「配送問い合わせ」は別名と注記。コード `AW_INQR`**（依頼どおり） ✘ INQU と1文字違いで紛らわしい
  - **B. 画面名同じ、コードを `AW_DINQ`**（Delivery INQuiry）に ✔ 取り違えにくい
  - **C. 画面名も「配送問い合わせ」に統一（メニューも変更）**
  - **推奨 B**（名前はメニューどおり）。
  - **回答 (hong 2026-10-07, chat):** **B**。画面名はメニューどおり「委託配送先・中継先の検索」、Screen Code は **`AW_DINQ`**（`AW_INQR` は使わない）。
- **Q-IQ2. 料金表のエリアの単位と「地域加算の目安」の出どころ**
  > 出典: 配送_01 §3-3「対応エリア（都道府県単位）（2026/09/30 変更）」「料金表＝エリア（都道府県）× 支払料金・地域加算」「地域加算＝運営が委託配送先マスタに手動で入力」／台帳 L139・受付簿 #59（129103b）：エリア別料金は**関東・中部…のエリア単位**（`carrierFee.ts` regionOf、seed `areas:['関東','中部']`）で `areaFees` に支払額だけ・地域加算の欄なし。コード `inquiries/page.tsx:24-25`：都道府県13件→エリアの表と、地域加算（DE00001 千葉+500円 など）が**ページに固定値**。
  - **A. エリア単位（9エリア）のまま。マスタの料金表に「地域加算」の列を足し（CSV列も）、検索結果はそこから出す。画面の都道府県は47、`regionOf` で引く** ✔ #59 の実装を活かす・仕様の「手入力」を満たす ✘ 配送_01 の「都道府県単位」は台帳で上書き（修正が必要）
  - **B. 都道府県単位（配送_01 §3-3 どおり）で料金表・加算を持つ** ✔ 仕様どおり・地域加算が細かく言える ✘ #59 のやり直し・入力が大きい（47×社）
  - **C. 地域加算の列は出さない（子契約の「地域配送料 OP000004」で運営が手で付ける）** ✔ 作らない ✘ 仕様の「目安を出す」を落とす
  - **推奨 A。** 決定が出たら、台帳に1行・配送_01 §3-3 の直しを同じコミットで。
  - **回答 (hong 2026-10-07, chat):** **B**。料金表・地域加算は**都道府県単位**（配送_01 §3-3 どおり）。受付簿 No.59 のエリア単位の実装はやり直し。
- **Q-IQ3. 見積依頼の項目（台帳 E81 との差）**
  > 出典: 台帳 E81 「法人名・住所・取り扱い商品・配送エリア・土日対応・保有車両・プラン（自販機の有無）。【暫定】複数曜日・金額条件・冷蔵／冷凍・複数拠点まとめて。保有車両は委託配送会社のプロフィールに持つ」。コード `QuoteModal`（`inquiries/page.tsx:~167-199`）：上記すべて＋**「配送回数（月）・1回の食数」を必須**（`logic.ts:222-229`）。「取り扱い商品」と「冷蔵／冷凍」は1つの欄（冷蔵・冷凍・資材）にまとめられている。
  - **A. 配送回数・食数を残し、台帳 E81 に追記（見積に量が要るため）。取り扱い商品＝温度帯の1欄のまま（資材を含む）** ✔ 見積の精度・委託側の回答画面（TW）と同じ形 ✘ 台帳の項目表にない2項目
  - **B. 配送回数・食数を外す** ✔ 台帳どおり ✘ 委託側が金額を出せない（`Quote.deliveriesPerMonth`・`mealsPerDelivery` を使う TW 見積回答に影響）
  - **C. A＋「取り扱い商品」（惣菜など）と「温度帯（冷蔵／冷凍）」を別の欄に分ける** ✘ 項目の意味が台帳に無く推測になる
  - **推奨 A。**
  - **回答 (hong 2026-10-07, chat):** **A**。配送回数・食数を残し、台帳 E81 に追記。取り扱い商品＝温度帯の1欄のまま（資材を含む）。
- **Q-IQ4. 見積依頼を出す相手は1社ずつか、複数社まとめてか**
  > 出典: 配送_01 §3-3「結果から委託配送会社を選んで見積依頼を出す」／配送_11 L154-155 `delivery_inquiries`（1件）と `carrier_quote_responses`（**依頼した会社1社＝1行**）＝1依頼×複数社。コード：行ごとのボタンで1社だけ（`areas/delivery.ts:328` `carrierIds:[carrier.id]`）。同じ内容を社数ぶん入力し直す。
  - **A. 各行にチェック＋「選んだ n社へ見積依頼」（1つのモーダル）** ✔ データ構造と合う・入力は1回 ✘ 画面の変更（宿題）
  - **B. 1社ずつ（現状）** ✔ 変更なし ✘ 入力を繰り返す
  - **推奨 A。**
  - **回答 (hong 2026-10-07, chat):** **A**。各行にチェック＋「選んだ n社へ見積依頼」（1つのモーダル）。
- **Q-IQ5. 「中継先から拠点を引く」の中継先の選び方・初期値**
  > 出典: 配送_01 §3-2「約300件」「契約からの選ばれ方：プルダウンではなく検索式」。コード：全中継先のプルダウン＋初期値 `HU00124` 固定／住所タブの初期値も「千葉県・船橋市」固定（デモの値）。台帳に決定なし。
  - **A. 中継先は検索式（名称・営業所コード・都道府県・市区町村で絞る）。初期は未選択（キーワード検索が主）。住所タブの初期値は空** ✔ 300件でも使える・本番の初期値になる ✘ 実装変更
  - **B. プルダウンのまま、初期値だけ空にする** ✔ 小さい変更 ✘ 300件は選びにくい
  - **推奨 A。**
  - **回答 (hong 2026-10-07, chat):** **A**。中継先は検索式（名称・営業所コード・都道府県・市区町村）。初期は未選択、住所タブの初期値は空。

**3. [宿題]**

| # | Quyết định | Code hiện tại |
|---|---|---|
| H18 | Tab trong URL `?tab=` (P-TAB) | `inquiries/page.tsx:28` `useState` |
| H19 | Điều kiện = 都道府県・市区町村・郵便番号・温度帯; kết quả có **対応温度帯** (配送_01 §3-3) | `hits` (`:52`) chỉ lọc theo vùng; 市区町村・郵便番号・温度帯 **không được dùng**; không có cột 対応温度帯 |
| H20 | 都道府県 chọn từ **47** (input_standard) | `REG` chỉ 13 県 (`:24`); 西日本 (福山通運) không khớp 大阪府 do `area.includes('関西')` (dùng `carrierFee.ts` regionOf/WEST) |
| H21 | Kết quả có **近くの中継先** (cùng điều kiện với 中継先一覧, 配送_01 §3-3) | không có |
| H22 | Lỗi nhập inline dưới ô (台帳 F173) + message theo Message List | `QuoteModal` chỉ `toastError` (`:177`), không có `error` ở ô; câu chữ trong `logic.ts:222-229` |
| H23 | maxlength: 法人名・拠点名 60／住所 255／メモ 500; 食数 ≤ 9,999 (input_standard) | `QuoteModal` không có maxlength; `logic.ts:229` 食数 không có trần; 配送回数 1〜8 (`:228`) |
| H24 | Q02 khi キャンセル với nội dung đã nhập (台帳 F174/216) | modal đóng ngay |
| H25 | 郵便番号 thuộc 住所 của 見積依頼 (配送_01 §3-3) | modal có `zip` trong state nhưng không có ô nhập/hiển thị |
| H26 | 回答期限 | `areas/delivery.ts:328` `answerBy: addDays(today, 5)` cứng, 台帳/仕様 không có → [open] O5 |

**4. [open]**
| # | Mục | Ghi chú |
|---|---|---|
| O5 | **Hạn trả lời／hiệu lực của 見積** & "一次回答→再回答" | 配送_11 L165 【要確認】. Code đặt +5 ngày (cứng) |
| O6 | Cách đưa 地域加算 vào 子契約 (tự động hay 運営 nhập tay, OP000004 地域配送料 ¥4,000 拠点ごと) | 配送_01 §3-3 "要確認" |
| O7 | 料金表: 単位 (1回あたり／月額) và エリア chi tiết hơn 県 | 配送_01 L74 "要確認" (liên quan Q-IQ2) |
| O8 | Danh sách 取り扱い商品 cho 見積依頼 | Q-IQ3 |

**5. [msg]** (xem bảng chung) — S132, I130, I131, E162; tái dùng I01, E01, E02, E12, E100.

**6. Đã khớp**: 11 mục 見積依頼 theo 台帳 E81 (法人名・住所・商品・エリア・土日・プラン・自販機・複数曜日・金額条件・冷蔵/冷凍・複数拠点) ✔; 保有車両 = hiển thị read-only từ profile ✔ (`QuoteModal` cuối); 路線 không có 見積依頼 (`areas/delivery.ts:320`); 地域加算 chỉ là "目安", không tự tính ✔ (配送_01 L75); 自動おすすめ・全国マップ・曜日の組合せ検索 không làm ✔; **中継先の専用画面 = 統合・やらない** (台帳 L139) → tab 2 là nơi tích hợp ✔; 権限 見積依頼 chỉ hiện khi `canAct(requestQuote)`; CSV出力 ×2 (配送問い合わせ có CSV出力: CSV入出力 L142).

---

### [msg] Message cần cho 3 機能 (dải 運営D: E160〜E179, Q130〜Q139, S130〜, I130〜, W130〜 — ID tạm, chờ phiên gộp cấp)

**Tái dùng (cùng nghĩa, không tạo mới):** E01 必須 (法人名・プラン・配送エリア・日付・理由) ／ E02 選択 (取り扱い商品) ／ E12 範囲 (配送回数 1〜8, 食数 1〜9,999) ／ E100 見つかりません (要確認・委託配送先) ／ E32 権限なし ／ E30 保存失敗 ／ I01 0件 (一覧・資材・住所タブ — thay 3 câu riêng của code) ／ S12 CSV出力 ／ Q02 離脱.

| ID đề xuất | Loại・nơi hiện | ja_o (社内向け) | Dùng ở | Ghi chú |
|---|---|---|---|---|
| E160 | エラー・トースト | この要確認はすでに閉じています。画面を読み込み直してください。 | RVEW_002 (409) | khác E31 (không có "ghi đè") |
| E161 | エラー・インライン | {項目名}は yyyy-mm-dd で入力してください。 | RVEW_002 日付 (nếu giữ ô 日付, Q-RV2) | E200 là bản có HH:MM; phiên gộp có thể gộp |
| E162 | エラー・トースト | 路線の運送会社には見積依頼を出せません。運賃表で確認してください。 | INQR (phòng thủ; UI ẩn nút) | tuỳ chọn |
| S130 | 成功・トースト | 要確認を対応済みにしました。 | RVEW_002 | code đã có câu này |
| S131 | 成功・トースト | 要確認を対象外にしました。 | RVEW_002 | |
| S132 | 成功・トースト | {委託配送先名}へ見積依頼を送りました。 | INQR_001 005 | code thêm "（委託配送先ポータルの見積依頼に届きます）"; "（デモ）" là của DEMO, bỏ |
| I130 | 情報・表の中 | この中継先を使っている拠点はありません。 | INQR_002 | I01 không đủ nghĩa (khác với "không có kết quả") |
| I131 | 情報・表の中 | 見つかりませんでした。番号の桁・ハイフンを確かめてください。 | INQR_002 008 | |
| Q130 (候補) | 確認・モーダル | 対象外にしますか？／この要確認を閉じます。理由が履歴に残ります。 | RVEW_002 | chỉ khi Q-RV3 = A |

Bỏ: toast "検索しました（n件）" (H12).
Cần nhờ phiên gộp: không có message dùng chung nhiều 領域.


---

# Stage B: câu hỏi phát sinh khi viết data (2026-10-07) — chờ hong

Data đã viết: `AW_SCHD`（26 状態）・`AW_CYCL`（16）・`AW_DLVR`（46）・`AW_SHIP`（8）・`AW_MSUM`（3）・`AW_RVEW`（8）・`AW_DINQ`（8）. `--check`: 0 lỗi dữ liệu, 0 vi phạm rule; các dòng `chk` dưới đây là chủ ý (chưa quyết → `make.py` không build, chỉ `--draft`). Chưa chụp màn hình.

## B-1. スケジュール (AW_SCHD) — 8 câu
1. しきい値 300件 lưu ở đâu (field của 倉庫マスタ hay cài đặt 運営) và sửa ở màn nào? 中部倉庫・ES事務所 cũng 300?
2. CSV 月・週・日: cột cho dòng 予定 (chưa có 配送データ): 配送No・状態・ドライバー và cột サイクル・枠.
3. 配送回数: code 1〜4回, spec 月1回/月2回/月4回 — chọn bên nào?
4. 配送スタッフ: spec §15-5 là ô chữ khớp một phần, code là select.
5. 移動 modal ô 「理由」: 1 dòng 60 chữ hay memo 500 chữ (nhiều dòng)?
6. 「法人に通知する」(mặc định ON) chỉ có trong code — giữ?
7. 一括承認: dùng dạng Q11 (tiêu đề + kết quả) hay giữ câu hướng dẫn hiện tại?
8. 一括承認 xong: giữ modal hay chỉ toast S11?

## B-2. 配送サイクル設定 (AW_CYCL) — 6 câu
1. Cách nhập 休止 loại 「調整」: select loại + bù cho 休止 nào?
2. 変更履歴: cột theo Q10 (日時・操作した人・項目・変更前・変更後・影響件数); P-HIST còn 「操作」「理由」 — bỏ được? 影響件数 là 1 số hay chia (作り直し／要確認)?
3. Bảng xác nhận khi lưu: giữ 2 dòng thừa của code (変更申請・委託配送先) hay chỉ 3 nhóm?
4. 「この設定を3倉庫へ反映」 có hộp xác nhận không?
5. Vai trò chỉ R (経理・営業…): ẩn hay disable ô A1 / form thêm / nút xoá? (code chỉ ẩn nút lưu và 祝日を再取得)
6. Trạng thái 003 (tháng "lỗ"): seed không có và UI không tạo được — thêm seed để chụp hay bỏ ảnh?
(Message đã cấp ID 2026-10-07: E174 「終了月は開始月以降」, I140 làm tròn 6 tháng, W135 cảnh báo オーダー締切 sau khi dời A1. AW_DLVR: 3 banner = I136・I138・I139.)

## B-3. 出荷・配送管理 (AW_DLVR) — 10 câu
1. Bộ lọc/cột 一覧 「配送方法」 vs 「便種別」 (詳細・スケジュール dùng 便種別): thống nhất 便種別?
2. Giữ toast 「検索しました…」? (P-LIST không có)
3. 運営 sửa 実績 (完了日時・納品数・備考) và 駐車料金 ở đâu? (quyết định nói sửa được, code chỉ đọc)
4. 配送No không tìm thấy: dùng message chung (E100) hay giữ câu riêng?
5. Không có message chung cho lỗi định dạng ngày — không cần vì date picker chung?
6. 編集 đổi ngày: quy tắc ứng viên và ID lỗi lấy từ 移動 của AW_SCHD (chưa chốt).
7. 予定 trước 本発注 có đổi được ngày từ 編集 không?
8. Khi đang sửa ở 編集, các thao tác lưu ngay (メモ追加・送り状追加・資料追加) có bấm được không? (P-MODAL-SAVE nói disable)
9. Mở `/edit` cho 納品済・中止・取消: A redirect về 詳細／B mở nhưng disable／C chỉ báo E169 khi lưu?
10. Hiện P-DETAIL-AUX (tìm item, mở/đóng, mục lục card, 「編集できる項目だけ」) trên 詳細 dạng tab?
(Dòng cần xử lý màu: 黄 trong code, memo ghi 赤 — data viết 黄.)

## B-4. 出荷指示 (AW_SHIP) — 6 câu
1. Danh sách 倉庫: code cố định WH00001/WH00002 — lấy từ 倉庫マスタ (kho liên kết THOMAS)?
2. Bảng lịch sử gửi: sắp xếp / phân trang / lọc (áp P-LIST?).
3. 「変更した行のCSV」: nút CSV cho từng dòng 再送待ち hay xuất gộp ở nút trên?
4. 「送信済にする」: có xác nhận không (locked không hoàn tác)? 2 tuần đầu (nhiều dòng) bấm tay từng dòng hay hàng loạt?
5. 取込履歴: thời gian giữ và phân trang.
6. 取込 khi cả file sai (sai cột・mã ký tự・quá số dòng): xử lý và message.
(Màu badge 出荷指示/取込 theo code và bảng chung vì Q6 không nói rõ.)

## B-5. 資材の集計 (AW_MSUM) — 1 câu
1. Thứ tự bảng tổng 資材: tăng dần theo 資材ID?

## B-6. 要確認 (AW_RVEW) — **đã bổ sung định nghĩa 2026-10-07 (hong 指示; xem 台帳 F「運営D 要確認の詳細と閉じ方の補足」・受付簿 No.297), `chk` đã hết** (nội dung dưới đây giữ để tham khảo)
1. Mở 詳細 từ dòng đang mở ở 一覧 thế nào? 「対応する ›」 nhảy thẳng tới màn nguyên nhân cho トラブル・子の確定待ち・欠配・ドライバー未設定・変更申請 → 詳細 của các 区分 này không tới được.
2. 対象外にする: (a) 理由 bắt buộc nhập ở đâu (chung với ô 対応 hay trong hộp xác nhận)? (b) Q136 「対象外にしますか？」 riêng có được không (hong nói Q01)? (c) sau 対象外 có mở lại được không (nếu không, Q136 ghi 「元に戻せません」)?
3. 対応の内容（メモ）: bắt buộc hay tuỳ chọn? (code chỉ bắt 理由)
4. Nội dung riêng của từng 区分 (spec không định nghĩa): 予定生成不可 (bảng ngày ứng viên—chỉ có ở demo cũ)／件数しきい値の超過 (có phải dòng 一覧 không—15-9 không liệt kê, code không sinh)／消費期限の注意 (bảng theo sản phẩm; cách đóng — lưu ý 台帳: expiry_date không theo dõi)／オーバーライドの失効・提案中 (cách đóng・nội dung)／数量が届いていない（オーダー）(có xảy ra không; 配送_12 §16.4 và 配送_08 §14-5 mâu thuẫn)／出荷指示の送信失敗・出荷実績NG／出荷指示の再送 (「送信済にする」 có tự đóng không)／請求漏れ (cách đóng・nội dung ngoài 契約・請求月).

## B-7. 委託配送先・中継先の検索 (AW_DINQ) — 3 câu
1. Tab 住所 khi điều kiện trống: 都道府県 bắt buộc? 市区町村・郵便番号 có ảnh hưởng gì (vì エリア là đơn vị 都道府県) hay chỉ cho 「近くの中継先」? 温度帯 mặc định rỗng?
2. 「近くの中継先」: cột và số lượng hiển thị.
3. Tab 中継先 khi chưa chọn và không có từ khoá: hiện hướng dẫn hay hiện tất cả?
Open (khách): 支払料金の単位（1回あたり／月額）, cách nhập 地域加算 vào 子契約, 見積の回答期限・有効期限・一次回答→再回答.

## Việc kỹ thuật cần biết
- 7 file đã chạy `--check`, chưa `--capture`: selector `sel` chưa kiểm bằng trình duyệt; vài `setup` phụ thuộc trạng thái trước (RVEW 007→008, DINQ 003–005/007, SCHD 017/018/020/021/025, DLVR các trạng thái đổi dữ liệu).
- Một số mục `sel: "-"` vì màn hình chưa có (宿題 code): 最終保存日時, 件数祝日, 3倉庫へ反映, 割当状況, 並べ替え, Q02 khi đóng modal…
- `kd_rules.py`: thêm danh sách tên riêng cho 「要確認」 (tên màn hình) để không bị coi là "chưa xác nhận"; ký tự vô hình U+2060 mà agent chèn vào đã gỡ.
