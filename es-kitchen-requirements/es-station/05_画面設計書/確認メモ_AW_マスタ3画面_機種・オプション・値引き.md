# 確認メモ：機種マスタ・オプションマスタ・値引きマスタ（運営Web）— Ghi chú rà soát trước khi viết 画面設計書

Ngày: 2026-10-05 ／ Người rà: Claude (cloud) ／ Nguồn: code (`app/ops/masters/_masters/*`, `lib/ops/masters/spec/{devices,options,discounts}.ts`, `lib/domain/seed/master.ts`), `docs/決定台帳.md` (B・E・F), `受付簿` #13・16・18・19・21・38, `マスタ項目一覧` 「機種マスタ一覧／編集（64）」「オプションマスタ一覧／編集（25）」「値引きマスタ一覧／編集（38）」, `オプション・値引き_定義_20261003.md`, `決定_STEP3追補_オプション値引きマスタの不足_20261001.md`, `運営Web_権限表`.

Quy ước: **[Q]** cần hong trả lời ／ **[宿題]** đã chốt, code chưa theo → 設計書 theo quyết định + `demo_ok` ／ **[open]** chưa ai quyết ／ **[msg]** câu chữ message.

Ba màn này dùng chung `MasterList` / `MasterDetail` với プランマスタ, nên các quyết định đã chốt ở プランマスタ áp dụng luôn: 並べ替え có (L2), lỗi dưới ô + hộp tổng hợp (P-FORMBOX), 削除 là 論理削除 với Q01/E37, maxlength 60/500, 税率 từ 税率マスタ, 離脱確認 Q02, quyền (権限表).

---

## 1. Phạm vi và trạng thái

| Chức năng | Code | Màn hình | Trạng thái (dự kiến) |
|---|---|---|---|
| 機種マスタ | AW_MODL (đề xuất) | 001 一覧 ／ 002 詳細 ／ 003 登録・編集 | 一覧 5 (初期・0件・削除確認・削除不可・CSV取込) ／ 詳細 5 (基本情報 冷蔵庫 RF000001・基本情報 自販機 VM000001・料金・契約条件・貸出・履歴) ／ 登録・編集 5 (新規 基本情報・新規 自販機の区分・新規 料金・入力エラー・編集・破棄) |
| オプションマスタ | AW_OPTN | 001 ／ 002 ／ 003 | 一覧 4 ／ 詳細 4 (基本情報 A型 OP000001・基本情報 連動しない OP000004・料金・連動の確認・履歴) ／ 登録・編集 4 |
| 値引きマスタ | AW_DISC | 001 ／ 002 ／ 003 | 一覧 4 ／ 詳細 3 (基本情報・計算・条件・適用・履歴, mẫu DC000013) ／ 登録・編集 4 |

Quyền (権限表 2026-10-03, đã sửa dòng プラン管理): 機種マスタ = CRUD cho フル権限・営業・商品管理・商品開発, R cho 経理・CS・物流. オプション・値引き = フル権限 CRUD, còn lại R.

## 2. Cần hong quyết [Q]

> 2026-10-05: hong nói "chạy tiếp hết" → 設計書 bản 1.1 được viết theo **đề xuất** dưới đây (ghi trong `DECISIONS` của mỗi file dữ liệu với src "Claude 提案・hong 確認待ち"). Khi hong trả lời khác, sửa dữ liệu + 台帳 F + `CHANGES` (bản 1.2). Q2 đã có quy tắc sẵn (マスタ項目一覧 一覧画面 #9: 登録日時の新しい順) nên dùng quy tắc đó, không hỏi nữa. Q9: theo nguyên tắc hong nêu ở プランマスタ ("không có CSV chuyên dụng") → chỉ giữ 2 nút ở đầu 一覧, bỏ nút trong tab.

1. **Screen Code**: `AW_MODL_001〜003` (機種), `AW_OPTN_001〜003` (オプション), `AW_DISC_001〜003` (値引き). OK?
2. ~~Thứ tự mặc định của 一覧~~ → đã có quy tắc: 登録日時の新しい順, sắp xếp được theo ID・名称・区分・ステータス・登録日時 (マスタ項目一覧 一覧画面 #9). Không cần hỏi.
3. **機種マスタ メーカー**: 項目一覧 ghi 要確認 「メーカーマスタか固定値か」. Code: danh sách cố định theo 機種区分 (冷蔵庫/冷凍庫: ホシザキ・パナソニック・フクシマガリレイ; 自販機: 富士電機・サンデン; 電子レンジ: パナソニック・シャープ; ホットウォーマー: アンナカ・タイジ). Đề xuất: **giữ danh sách cố định** (thêm hãng = yêu cầu dev), không làm メーカーマスタ ở phase 2.
4. **自販機 最大収納数 công thức** (項目一覧 要確認, 整合チェック B10): đề xuất **= tổng 格納数 của các ô 有効** (シングル8=8, シングル10=10, ダブル8=8, ダブル10=10, ベルト5=5; ô 無効 không tính), tự tính, không nhập tay.
5. **レイアウト生成 chạy lại**: đề xuất **xóa thiết lập cũ, đưa về シングル8 toàn bộ, có hỏi xác nhận trước** (Q01 dạng cảnh báo).
6. **有効状態 của 機種**: chỉ 有効／無効 (削除済 do thao tác xóa). OK?
7. **保温温度 (ホットウォーマー)**: đơn vị ℃. OK?
8. **Xóa 機種**: đề xuất **không cho xóa khi 貸出中 > 0** (giống プラン: 使用中なら削除不可). Code hiện cho xóa (use luôn = 0).
9. **値引き 適用 CSV**: code có 2 chỗ: nút 「適用 CSV取込」「適用 CSV出力」 ở header 一覧 (hong thêm 2026-10-05) và nút 「CSV一括取込」 trong tab 適用一覧 của 詳細 (chưa chạy). Đề xuất: **chỉ giữ ở header 一覧** (1 chỗ cho mọi 値引き), tab 適用一覧 chỉ còn 終了分も表示 + bảng. 台帳 42 đã nói CSV ghi thẳng vào 子契約.

## 3. Code khác quyết định đã chốt → 設計書 theo quyết định, code là 宿題

| # | Nội dung | Quyết định | Code |
|---|---|---|---|
| M1 | 機種 「月額リース料金（自販機）」 | **持たない** (マスタ項目一覧 2026-10-05: リース料 = 自販機の月額料金, OP000037 lấy từ đó; 台帳 「自販機のリース料」) | còn ô (non-active) trong tab 料金 |
| M2 | 税率 (機種・オプション・値引き) | 税率マスタ, システム管理 thêm được (台帳 E #9, 受付簿 #38) | 2 lựa chọn cố định (H6) |
| M3 | 値引き 一覧 cột 値引きの値 | 固定額 = 円, 料率 = %（上限 ○円）, 差額自動 = 「自動」 (項目一覧) | hiện số thô 「5」「3000」 |
| M4 | 並べ替え UI | có (L2) | không có (受付簿 #55) |
| M5 | maxlength, copy tên, inline check các rule | như プランマスタ (H3〜H5) | chưa |
| M6 | 機種 削除 khi 貸出中 | không cho xóa (E38, đề xuất Q8) | cho xóa |
| M9 | 値引き 詳細 tab 適用一覧 nút 「CSV一括取込」 | bỏ (CSV chỉ ở đầu 一覧) | còn nút |
| M10 | 機種 新規 自販機 最大収納数 công thức, レイアウト生成 W04, 保温温度 ℃ | theo đề xuất Q4・Q5・Q7 | chưa |
| M11 | 機種 編集で 機種区分 を変えられない | 設計書 | code cho đổi |
| M12 | オプション 新規登録 連動タイプ chỉ 連動しない | 2026/09/28 | code cho chọn A |
| M13 | 値引き 計算・条件: ô đổi theo lựa chọn (対象オプション, 料率の上限額, 参照プラン, 適用月数), 対象のプラン複数選択 | 設計書 | 1 ô chữ |
| M7 | 一覧 cột 公開区分 trong 項目一覧 | 公開ステータス (統一 2026/10/01) | code đúng; **doc** 項目一覧 一覧 còn ghi 公開区分 → sửa doc |
| M8 | オプション 請求書表示名 OP000008 = 初期費用, OP000016 = 事務手数料 | 台帳 (hong #3 2026-10-03) | seed đúng |

## 4. Chưa chốt với khách [open] (không chặn 設計書; là dữ liệu master)
- Danh sách オプション chưa có quyết định: OP000009 再配送手数料, OP000012 設備管理費 (台帳 56: chưa đưa vào master), OP000018 標準設置; giá trị 【仮】 của nhiều OP (定義 §1-B/1-C, §5).
- 値引き DC000001/002/004/007〜012 có giữ không (定義 §9).
→ 設計書 chỉ mô tả màn hình; dữ liệu nào tồn tại là việc nhập master.

## 5. Message [msg]
- Dùng lại bộ của プランマスタ (E01/E04/E14/E37/Q01/Q02/S01/S02/I01/E31…). 機種区分 chưa chọn → dùng E02 (「{項目名}を選択してください。」) thay vì message mới. Thêm 2 message mới (đề xuất, hong xác nhận): **E38** 「貸出中の設備 {n}台のため削除できません。新規に選べなくする場合は有効状態を「無効」にしてください。」 (機種 削除・Q8), **W04** 「レイアウトを作り直すと、いまの収納タイプと有効・無効の設定は消えます。作り直しますか？」 (レイアウト生成・Q5). A型 không cần message (code ẩn nút).

## 6. Kết quả (2026-10-05)
- Dữ liệu: `データ/AW_MODL_機種マスタ.py` (17 trạng thái), `AW_OPTN_オプションマスタ.py` (14), `AW_DISC_値引きマスタ.py` (16). Sổ `出力/運営管理者Web_マスタ` bản **1.1** (プランマスタ sửa theo 7 comment của hong + 3 chức năng mới).
- Chờ hong: Q1 (mã màn hình MODL/OPTN/DISC), Q3〜Q8 (đề xuất đã ghi), 2 message E38・W04, cách hiện 「値引きの値」 ở 一覧 (プラン参照).
